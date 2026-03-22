import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

import { execFileSync } from 'child_process';
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
} from 'vscode-languageclient/node';
import { getShellHtml } from './shell';

let client: LanguageClient | undefined;
let panel: vscode.WebviewPanel | undefined;
let currentPage: string = '/stats';
let currentSeq: number = 0;
let cachedCss: string = '';
let statusBarItem: vscode.StatusBarItem;
let currentSourceFile: string | undefined;
let currentSourceLine: number | undefined;

export async function activate(context: vscode.ExtensionContext) {
  // --- Commands ---
  context.subscriptions.push(
    vscode.commands.registerCommand('rivet.showDashboard', () => showDashboard(context)),
    vscode.commands.registerCommand('rivet.showGraph', () => showDashboard(context, '/graph')),
    vscode.commands.registerCommand('rivet.showSTPA', () => showDashboard(context, '/stpa')),
    vscode.commands.registerCommand('rivet.validate', () => runValidate()),
    vscode.commands.registerCommand('rivet.addArtifact', () => addArtifact()),
    vscode.commands.registerCommand('rivet.navigateTo', (urlPath: string) => showDashboard(context, urlPath)),
    vscode.commands.registerCommand('rivet.showSource', async () => {
      if (!currentSourceFile) {
        vscode.window.showInformationMessage('No source file for current view');
        return;
      }
      const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
      if (!workspaceRoot) return;

      const filePath = path.isAbsolute(currentSourceFile)
        ? currentSourceFile
        : path.join(workspaceRoot, currentSourceFile);
      const uri = vscode.Uri.file(filePath);
      const line = Math.max(0, (currentSourceLine || 1) - 1);
      const range = new vscode.Range(line, 0, line, 0);
      await vscode.window.showTextDocument(uri, { selection: range, viewColumn: vscode.ViewColumn.One });
    }),
  );

  // --- Sidebar Tree View ---
  const treeProvider = new RivetTreeProvider();
  vscode.window.registerTreeDataProvider('rivetExplorer', treeProvider);
  context.subscriptions.push(
    vscode.commands.registerCommand('rivet.refreshTree', () => treeProvider.refresh()),
  );

  // --- Status Bar ---
  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 90);
  statusBarItem.command = 'rivet.showDashboard';
  statusBarItem.tooltip = 'Open Rivet Dashboard';
  statusBarItem.text = '$(shield) Rivet';
  statusBarItem.show();
  context.subscriptions.push(statusBarItem);

  // --- LSP Client ---
  const rivetPath = findRivetBinary(context);
  if (!rivetPath) {
    statusBarItem.text = '$(shield) Rivet (not found)';
    vscode.window.showWarningMessage(
      'Rivet binary not found. Install with: cargo install rivet-cli'
    );
    return;
  }

  const lspWorkspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  try {
    const serverOptions: ServerOptions = {
      command: rivetPath,
      args: ['lsp'],
      options: { cwd: lspWorkspaceRoot },
    };

    const clientOptions: LanguageClientOptions = {
      documentSelector: [
        { scheme: 'file', language: 'yaml', pattern: '**/artifacts/**/*.yaml' },
        { scheme: 'file', language: 'yaml', pattern: '**/safety/**/*.yaml' },
        { scheme: 'file', language: 'yaml', pattern: '**/schemas/**/*.yaml' },
        { scheme: 'file', language: 'yaml', pattern: '**/rivet.yaml' },
      ],
      synchronize: {
        fileEvents: vscode.workspace.createFileSystemWatcher('**/*.yaml'),
      },
    };

    client = new LanguageClient('rivet', 'Rivet SDLC', serverOptions, clientOptions);
    await client.start();
    context.subscriptions.push({
      dispose: () => { client?.stop().catch(() => {}); },
    });

    client.onNotification('rivet/artifactsChanged', (_params: any) => {
      treeProvider.refresh();
      if (panel) {
        panel.webview.postMessage({ type: 'stale' });
      }
    });

    statusBarItem.text = '$(shield) Rivet';
    console.log(`rivet LSP started: ${rivetPath}`);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    vscode.window.showWarningMessage(`Rivet LSP failed to start (${rivetPath}): ${msg}`);
    statusBarItem.text = '$(shield) Rivet (LSP error)';
    console.error(`rivet LSP error: ${msg}, binary: ${rivetPath}, cwd: ${lspWorkspaceRoot}`);
    // Continue without LSP — commands still work
  }
}

export function deactivate() {
  return client?.stop().catch(() => {});
}

// --- Binary discovery ---

function findRivetBinary(context: vscode.ExtensionContext): string | undefined {
  const configured = vscode.workspace.getConfiguration('rivet').get<string>('binaryPath');
  if (configured && configured.length > 0 && fs.existsSync(configured)) return configured;

  // Prefer PATH — works correctly for SSH Remote (binary matches remote arch)
  try {
    const cmd = process.platform === 'win32' ? 'where' : 'which';
    const found = execFileSync(cmd, ['rivet'], { encoding: 'utf8' }).trim();
    if (found) {
      console.log(`rivet: using PATH binary at ${found}`);
      return found;
    }
  } catch {
    // Not on PATH, fall through to bundled
  }

  // Fallback: bundled binary (platform+arch specific)
  const binaryName = process.platform === 'win32' ? 'rivet.exe' : 'rivet';
  const platformDir = `${process.platform}-${process.arch}`;
  const bundledPlatform = path.join(context.extensionPath, 'bin', platformDir, binaryName);
  if (fs.existsSync(bundledPlatform)) return bundledPlatform;
  // Fallback: plain bin/ (single-platform dev builds)
  const bundled = path.join(context.extensionPath, 'bin', binaryName);
  if (fs.existsSync(bundled)) return bundled;

  return undefined;
}

// --- Dashboard (WebView panel) ---

async function showDashboard(context: vscode.ExtensionContext, urlPath: string = '/stats') {
  if (!client) {
    vscode.window.showWarningMessage('Rivet LSP not connected.');
    return;
  }

  if (!cachedCss) {
    try {
      cachedCss = await client.sendRequest('rivet/css') as string;
    } catch { cachedCss = ''; }
  }

  if (panel) {
    panel.reveal(vscode.ViewColumn.Beside);
  } else {
    panel = vscode.window.createWebviewPanel(
      'rivetDashboard',
      'Rivet',
      vscode.ViewColumn.Beside,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, 'assets')],
      },
    );

    panel.webview.html = getShellHtml(panel.webview, context.extensionUri, cachedCss);

    panel.webview.onDidReceiveMessage(async (msg) => {
      if (msg.type === 'navigate') {
        await navigateTo(msg.path);
      } else if (msg.type === 'refresh') {
        await navigateTo(currentPage);
      }
    });

    panel.onDidDispose(() => { panel = undefined; });
  }

  await navigateTo(urlPath);
}

async function navigateTo(page: string) {
  if (!panel || !client) return;

  const seq = ++currentSeq;
  currentPage = page;

  try {
    const result: any = await client.sendRequest('rivet/render', { page, params: {}, seq });
    if (seq !== currentSeq) return;

    panel.title = result.title || 'Rivet';
    currentSourceFile = result.sourceFile || undefined;
    currentSourceLine = result.sourceLine || undefined;
    panel.webview.postMessage({ type: 'update', html: result.html, title: result.title });
  } catch (err: unknown) {
    if (seq !== currentSeq) return;
    const msg = err instanceof Error ? err.message : String(err);
    panel.webview.postMessage({
      type: 'update',
      html: `<div style="padding:2rem;color:var(--error)"><h2>Render Error</h2><p>${msg}</p></div>`,
      title: 'Error',
    });
  }
}

// --- Validate command ---

async function runValidate() {
  const rivetPath = findRivetBinary({ extensionPath: '' } as vscode.ExtensionContext);
  if (!rivetPath) {
    vscode.window.showErrorMessage('Rivet binary not found');
    return;
  }

  const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (!workspaceRoot) return;

  try {
    const output = execFileSync(rivetPath, ['validate', '--format', 'text'], {
      cwd: workspaceRoot,
      encoding: 'utf8',
      timeout: 30000,
    });

    if (output.includes('PASS')) {
      vscode.window.showInformationMessage('Rivet: Validation PASS ✓');
    } else {
      const channel = vscode.window.createOutputChannel('Rivet Validate');
      channel.appendLine(output);
      channel.show();
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    vscode.window.showErrorMessage(`Rivet validation failed: ${msg}`);
  }
}

// --- Add artifact command ---

async function addArtifact() {
  const rivetPath = findRivetBinary({ extensionPath: '' } as vscode.ExtensionContext);
  if (!rivetPath) {
    vscode.window.showErrorMessage('Rivet binary not found');
    return;
  }

  const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (!workspaceRoot) return;

  // Quick-pick for type
  const artifactType = await vscode.window.showQuickPick(
    ['requirement', 'design-decision', 'feature', 'loss', 'hazard', 'system-constraint', 'uca'],
    { placeHolder: 'Select artifact type' },
  );
  if (!artifactType) return;

  // Input for title
  const title = await vscode.window.showInputBox({
    placeHolder: 'Artifact title',
    prompt: `Enter title for new ${artifactType}`,
  });
  if (!title) return;

  try {
    const output = execFileSync(rivetPath, [
      'add', '-t', artifactType, '--title', title,
    ], {
      cwd: workspaceRoot,
      encoding: 'utf8',
      timeout: 10000,
    });
    vscode.window.showInformationMessage(`Rivet: ${output.trim()}`);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    vscode.window.showErrorMessage(`Failed to add artifact: ${msg}`);
  }
}

// --- Sidebar Tree View ---

interface TreeItemData {
  kind: string;
  label: string;
  description?: string;
  page?: string;
  icon?: string;
  path?: string;
  artifactCount?: number;
  type?: string;
  children?: TreeItemData[];
}

class RivetTreeProvider implements vscode.TreeDataProvider<RivetTreeNode> {
  private _onDidChangeTreeData = new vscode.EventEmitter<void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;
  private treeData: TreeItemData[] = [];

  refresh(): void {
    this.treeData = [];
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: RivetTreeNode): vscode.TreeItem {
    return element;
  }

  async getChildren(element?: RivetTreeNode): Promise<RivetTreeNode[]> {
    if (!client) return [];

    if (!element) {
      if (this.treeData.length === 0) {
        try {
          const result: any = await client.sendRequest('rivet/treeData', { parent: null });
          this.treeData = result.items || [];
        } catch { return []; }
      }
      return this.treeData.map(cat => new RivetTreeNode(
        cat.label, cat.kind, undefined,
        vscode.TreeItemCollapsibleState.Collapsed,
        cat.children,
      ));
    }

    if (element.kind === 'category' && element.childData) {
      return element.childData.map(item => {
        const hasChildren = item.kind === 'document';
        const desc = item.artifactCount !== undefined
          ? `${item.description || ''} (${item.artifactCount})`
          : item.description;
        return new RivetTreeNode(
          item.label, item.kind, item.page,
          hasChildren ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None,
          undefined, desc, item.icon, item.path,
        );
      });
    }

    if (element.kind === 'document' && element.sourcePath) {
      try {
        const result: any = await client.sendRequest('rivet/treeData', { parent: element.sourcePath });
        return (result.items || []).map((item: TreeItemData) => new RivetTreeNode(
          item.label, item.kind, item.page,
          vscode.TreeItemCollapsibleState.None,
          undefined, item.description, undefined, undefined, item.type,
        ));
      } catch { return []; }
    }

    return [];
  }
}

class RivetTreeNode extends vscode.TreeItem {
  constructor(
    label: string,
    public readonly kind: string,
    public readonly page?: string,
    collapsibleState = vscode.TreeItemCollapsibleState.None,
    public readonly childData?: TreeItemData[],
    description?: string,
    icon?: string,
    public readonly sourcePath?: string,
    artifactType?: string,
  ) {
    super(label, collapsibleState);
    if (description) this.description = description;

    // Icons
    if (icon) this.iconPath = new vscode.ThemeIcon(icon);
    else if (kind === 'category') this.iconPath = new vscode.ThemeIcon('folder');
    else if (kind === 'document') this.iconPath = new vscode.ThemeIcon('file-text');
    else if (kind === 'artifact') this.iconPath = new vscode.ThemeIcon('symbol-property');
    else if (kind === 'help') this.iconPath = new vscode.ThemeIcon('question');

    // Click action
    if (page) {
      this.command = {
        command: 'rivet.navigateTo',
        title: label,
        arguments: [page],
      };
    }
  }
}
