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

export async function activate(context: vscode.ExtensionContext) {
  // --- Commands ---
  context.subscriptions.push(
    vscode.commands.registerCommand('rivet.showDashboard', () => showDashboard(context)),
    vscode.commands.registerCommand('rivet.showGraph', () => showDashboard(context, '/graph')),
    vscode.commands.registerCommand('rivet.showSTPA', () => showDashboard(context, '/stpa')),
    vscode.commands.registerCommand('rivet.validate', () => runValidate()),
    vscode.commands.registerCommand('rivet.addArtifact', () => addArtifact()),
    vscode.commands.registerCommand('rivet.navigateTo', (urlPath: string) => showDashboard(context, urlPath)),
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

class RivetTreeProvider implements vscode.TreeDataProvider<RivetTreeItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: RivetTreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: RivetTreeItem): RivetTreeItem[] {
    if (element) return [];

    return [
      new RivetTreeItem('Stats', '/stats', 'dashboard'),
      new RivetTreeItem('Artifacts', '/artifacts', 'symbol-class'),
      new RivetTreeItem('Validation', '/validate', 'pass'),
      new RivetTreeItem('STPA', '/stpa', 'shield'),
      new RivetTreeItem('Graph', '/graph', 'type-hierarchy'),
      new RivetTreeItem('Documents', '/documents', 'book'),
      new RivetTreeItem('Matrix', '/matrix', 'table'),
      new RivetTreeItem('Coverage', '/coverage', 'checklist'),
      new RivetTreeItem('Source', '/source', 'code'),
      new RivetTreeItem('Results', '/results', 'beaker'),
      new RivetTreeItem('Help', '/help', 'question'),
    ];
  }
}

class RivetTreeItem extends vscode.TreeItem {
  constructor(label: string, public readonly urlPath: string, icon: string) {
    super(label, vscode.TreeItemCollapsibleState.None);
    this.iconPath = new vscode.ThemeIcon(icon);
    this.command = {
      command: 'rivet.navigateTo',
      title: label,
      arguments: [urlPath],
    };
  }
}
