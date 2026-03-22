import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

import { execFileSync, ChildProcess, spawn } from 'child_process';
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
} from 'vscode-languageclient/node';

let client: LanguageClient | undefined;
let serveProcess: ChildProcess | undefined;
let dashboardPanel: vscode.WebviewPanel | undefined;
let dashboardPort: number | undefined;
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
    // Continue without LSP — serve and commands still work
  }

  // --- Start serve --watch in background ---
  startServe(context, rivetPath);
}

export function deactivate() {
  if (serveProcess) {
    serveProcess.kill();
    serveProcess = undefined;
  }
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

// --- Serve process ---

function startServe(context: vscode.ExtensionContext, rivetPath: string) {
  const configuredPort = vscode.workspace.getConfiguration('rivet').get<number>('serve.port') || 0;

  const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (!workspaceRoot) return;

  // Check rivet.yaml exists
  if (!fs.existsSync(path.join(workspaceRoot, 'rivet.yaml'))) return;

  serveProcess = spawn(rivetPath, [
    'serve',
    '--port', String(configuredPort),
    '--watch',
  ], {
    cwd: workspaceRoot,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  // Capture the port from stdout
  serveProcess.stderr?.on('data', (data: Buffer) => {
    const line = data.toString();
    const match = line.match(/listening on http:\/\/[\w.]+:(\d+)/);
    if (match) {
      dashboardPort = parseInt(match[1], 10);
      statusBarItem.text = `$(shield) Rivet :${dashboardPort}`;
      console.log(`rivet serve started on port ${dashboardPort}`);
    }
    // Forward watch reload messages
    if (line.includes('[watch]')) {
      console.log(`rivet: ${line.trim()}`);
    }
  });

  serveProcess.on('exit', (code) => {
    console.log(`rivet serve exited with code ${code}`);
    serveProcess = undefined;
    dashboardPort = undefined;
    statusBarItem.text = '$(shield) Rivet';
  });

  context.subscriptions.push({
    dispose: () => {
      serveProcess?.kill();
      serveProcess = undefined;
    },
  });
}

// --- Dashboard WebView ---

async function showDashboard(context: vscode.ExtensionContext, urlPath: string = '/') {
  if (!dashboardPort) {
    vscode.window.showWarningMessage(
      'Rivet dashboard not running. Waiting for serve to start...'
    );
    return;
  }

  // Map localhost to a VS Code-accessible URI (works in WebViews)
  // ?embed=1 strips the sidebar (VS Code tree view handles navigation)
  const sep = urlPath.includes('?') ? '&' : '?';
  const localUri = vscode.Uri.parse(`http://127.0.0.1:${dashboardPort}${urlPath}${sep}embed=1`);
  const mappedUri = await vscode.env.asExternalUri(localUri);

  if (dashboardPanel) {
    dashboardPanel.reveal(vscode.ViewColumn.Beside);
    dashboardPanel.webview.html = getDashboardHtml(mappedUri.toString());
    return;
  }

  dashboardPanel = vscode.window.createWebviewPanel(
    'rivetDashboard',
    'Rivet Dashboard',
    vscode.ViewColumn.Beside,
    {
      enableScripts: true,
      retainContextWhenHidden: true,
    },
  );

  dashboardPanel.webview.html = getDashboardHtml(mappedUri.toString());
  dashboardPanel.onDidDispose(() => { dashboardPanel = undefined; });
}

function getDashboardHtml(url: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta http-equiv="Content-Security-Policy"
        content="default-src 'none'; frame-src ${url} http://127.0.0.1:* https://*.vscode-cdn.net; style-src 'unsafe-inline';">
  <style>html,body,iframe{margin:0;padding:0;width:100%;height:100%;border:none;overflow:hidden}</style>
</head>
<body>
  <iframe src="${url}" allow="same-origin"></iframe>
</body>
</html>`;
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
