import * as vscode from 'vscode';

export function getShellHtml(
  webview: vscode.Webview,
  extensionUri: vscode.Uri,
  css: string,
): string {
  const nonce = getNonce();
  const mermaidUri = webview.asWebviewUri(
    vscode.Uri.joinPath(extensionUri, 'assets', 'mermaid.min.js')
  );

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta http-equiv="Content-Security-Policy"
    content="default-src 'none';
             style-src 'nonce-${nonce}';
             script-src 'nonce-${nonce}';
             font-src ${webview.cspSource} data:;
             img-src ${webview.cspSource} data:;">
  <style nonce="${nonce}">
    :root {
      --bg: var(--vscode-editor-background);
      --surface: var(--vscode-editorWidget-background);
      --text: var(--vscode-editor-foreground);
      --text-muted: var(--vscode-descriptionForeground);
      --accent: var(--vscode-textLink-foreground);
      --border: var(--vscode-panel-border);
      --error: var(--vscode-errorForeground);
      --warning: var(--vscode-editorWarning-foreground);
      --success: var(--vscode-testing-iconPassed);
    }
    ${css}
  </style>
</head>
<body>
  <div id="stale-banner" style="display:none;padding:8px 16px;background:var(--vscode-editorInfo-background,#1a3a5c);color:var(--text);cursor:pointer;text-align:center;font-size:13px;">
    Content changed \u2014 click to refresh
  </div>
  <main id="content">
    <div style="display:flex;align-items:center;justify-content:center;height:80vh;color:var(--text-muted)">
      Loading...
    </div>
  </main>
  <script nonce="${nonce}" src="${mermaidUri}"></script>
  <script nonce="${nonce}">
    const vscode = acquireVsCodeApi();
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href^="/"]');
      if (a) {
        e.preventDefault();
        vscode.postMessage({ type: 'navigate', path: a.getAttribute('href') });
      }
    });
    window.addEventListener('message', (event) => {
      const msg = event.data;
      if (msg.type === 'update') {
        document.getElementById('content').innerHTML = msg.html;
        document.getElementById('stale-banner').style.display = 'none';
        if (typeof mermaid !== 'undefined') {
          try {
            mermaid.initialize({ startOnLoad: false, theme: 'dark', securityLevel: 'strict' });
            mermaid.run({ nodes: document.getElementById('content').querySelectorAll('.mermaid') });
          } catch(e) {}
        }
      } else if (msg.type === 'stale') {
        document.getElementById('stale-banner').style.display = 'block';
      }
    });
    document.getElementById('stale-banner').addEventListener('click', () => {
      vscode.postMessage({ type: 'refresh' });
    });
  </script>
</body>
</html>`;
}

function getNonce(): string {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
