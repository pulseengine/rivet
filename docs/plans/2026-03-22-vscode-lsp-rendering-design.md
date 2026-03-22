# VS Code Extension: LSP-Based Rendering

**Date:** 2026-03-22
**Status:** Draft

## Problem

The VS Code extension currently uses Simple Browser to embed `rivet serve` output.
This approach:
- Fails over SSH Remote (port forwarding is fragile)
- Doesn't feel native (browser chrome, no toolbar actions)
- Depends on a running HTTP server
- Tree view is flat (11 static items, no document expansion)

## Goal

A native VS Code extension where:
1. Sidebar tree view shows documents (expandable with artifacts), views, schemas, help
2. Clicking an item opens a rendered WebView panel
3. "Show Source" action jumps to the YAML file and line
4. Works identically in local and SSH Remote environments
5. Zero network dependencies -- all data flows through LSP (stdin/stdout)

## Architecture

### Core Principle: Render functions extracted from serve.rs

serve.rs currently has ~6300 lines of view handlers in `views.rs`, ~850 lines of
components in `components.rs`, layouts in `layout.rs`, styles in `styles.rs`, and
JS in `js.rs`. The HTML generation is string-building (no template engine), with
route handlers calling helper functions and returning `Html<String>`.

Extract the HTML generation into **context-agnostic render functions** in a new
`rivet-cli/src/render/` module (peer to `serve/`). These functions:
- Take a `RenderContext` struct + view params
- Return `String` (raw HTML content, no layout wrapper)
- Are called by serve route handlers (wrapped in page/embed/print layout)
- Are called by LSP for the `rivet/render` custom request

```
rivet-core types (Store, Schema, LinkGraph, Artifact, ...)
         |
    render functions (render/, components -- extracted from serve)
         |
    +----+----+----+
    |         |    |
  serve     LSP   export (future)
  (axum)  (stdio)  (static HTML)
    |         |
 browser   VS Code WebView
```

### RenderContext

Both serve (via AppState) and the LSP (via salsa DB + supplementary state) must
provide the same data to render functions. Define a shared context:

```rust
/// Everything a render function might need. Not all views use all fields.
pub struct RenderContext<'a> {
    pub store: &'a Store,
    pub schema: &'a Schema,
    pub graph: &'a LinkGraph,
    pub doc_store: &'a DocumentStore,
    pub result_store: &'a ResultStore,
    pub diagnostics: &'a [Diagnostic],
    pub context: &'a RepoContext,       // project name, branch, git status
    pub externals: &'a [ExternalInfo],
    pub project_path: &'a Path,
    pub schemas_dir: &'a Path,
}
```

**Serve** constructs this from `AppState` (trivial -- all fields already exist).

**LSP** constructs this from:
- `store`, `schema`: already available via salsa (`build_store`, `build_schema`)
- `graph`: expose `build_link_graph` as a public salsa query (currently internal)
- `diagnostics`: already computed via `validate_all`
- `doc_store`: **new** -- add `DocumentStore` loading to LSP startup + refresh on
  `didSave`. Documents are parsed from markdown files listed in `rivet.yaml`.
- `result_store`: **new** -- add `ResultStore` loading (reads `results/` dir).
  Can be loaded lazily on first render of `/results` page.
- `context`: **new** -- add `RepoContext` construction (git branch, project name).
  Lightweight, can be computed at startup.
- `externals`: **new** -- load from `rivet.yaml` config at startup.

The LSP data gap is manageable: DocumentStore, ResultStore, RepoContext, and
externals are all loaded eagerly by serve today. The same loading code can be
called from the LSP. Only LinkGraph requires a salsa change (make the query public).

### Custom LSP Request: `rivet/render`

**Request:**
```json
{
  "method": "rivet/render",
  "params": {
    "page": "/artifacts/REQ-001",
    "params": { "sort": "id", "dir": "asc" },
    "seq": 42
  }
}
```

The `seq` field is a monotonically increasing sequence number assigned by the
extension. The response echoes it back. The extension only applies responses where
`seq` matches the current expected value (handles rapid clicking without needing
LSP-level request cancellation).

**Response (success):**
```json
{
  "html": "<div class=\"artifact-detail\">...</div>",
  "title": "REQ-001 -- System shall track artifacts",
  "sourceFile": "artifacts/requirements.yaml",
  "sourceLine": 42,
  "seq": 42
}
```

**Response (error):**
```json
{
  "html": "<div class=\"error\"><h2>Not Found</h2><p>Artifact REQ-999 does not exist.</p></div>",
  "title": "Error",
  "sourceFile": null,
  "sourceLine": null,
  "seq": 42
}
```

The response includes content HTML (no layout wrapper), a title for the VS Code
tab, source location for the "Show Source" action, and the sequence number.

**Blocking concern:** The LSP uses `lsp_server` with a synchronous message loop.
A large render (e.g., graph with 500 nodes) could block hover/completion responses.
Mitigation: render functions are pure CPU work in Rust -- even complex views render
in <50ms. If profiling shows a problem, move rendering to a background thread with
a oneshot channel. Not needed for v1.

### Custom LSP Request: `rivet/treeData`

**Request:**
```json
{
  "method": "rivet/treeData",
  "params": {
    "parent": null
  }
}
```

**Response (top-level):**
```json
{
  "items": [
    {
      "kind": "category",
      "label": "Documents",
      "children": [
        {
          "kind": "document",
          "label": "Requirements",
          "description": "artifacts/requirements.yaml",
          "artifactCount": 36,
          "path": "artifacts/requirements.yaml",
          "page": "/documents/requirements"
        }
      ]
    },
    {
      "kind": "category",
      "label": "Views",
      "children": [
        { "kind": "view", "label": "Stats", "page": "/stats", "icon": "dashboard" },
        { "kind": "view", "label": "Validation", "page": "/validate", "icon": "pass" }
      ]
    },
    {
      "kind": "category",
      "label": "Schemas",
      "children": [
        { "kind": "schema", "label": "aspice", "page": "/help/schema/aspice", "typeCount": 14 }
      ]
    },
    {
      "kind": "category",
      "label": "Help",
      "children": [
        { "kind": "help", "label": "Documentation", "page": "/help/docs" }
      ]
    }
  ]
}
```

**Request (expand document to show artifacts):**
```json
{
  "method": "rivet/treeData",
  "params": {
    "parent": "artifacts/requirements.yaml"
  }
}
```

**Response:**
```json
{
  "items": [
    {
      "kind": "artifact",
      "label": "REQ-001",
      "description": "System shall track artifacts",
      "page": "/artifacts/REQ-001",
      "type": "requirement",
      "sourceFile": "artifacts/requirements.yaml",
      "sourceLine": 5
    }
  ]
}
```

The top-level tree data is sent eagerly (small payload). Artifact expansion is
lazy per-document (on tree node expand). This avoids fetching 479 artifact labels
upfront, while documents with 80+ artifacts load only when expanded.

### Custom LSP Notification: `rivet/artifactsChanged`

When the LSP re-parses after a file change, it sends:
```json
{
  "method": "rivet/artifactsChanged",
  "params": {
    "artifactCount": 479,
    "documentCount": 7,
    "changedFiles": ["artifacts/requirements.yaml"]
  }
}
```

The extension uses this to:
- Refresh the tree view
- If the currently displayed WebView shows content from a changed file, show an
  unobtrusive "content changed -- click to refresh" banner (not auto-re-render,
  user may be reading)

### VS Code Extension Changes

**Tree View** -- populated from LSP:

```
> Documents
    Requirements [artifacts/requirements.yaml]       (36)
    Design Decisions [artifacts/design-decisions.yaml] (38)
    Features [artifacts/features.yaml]               (80)
    Losses [safety/stpa/losses.yaml]                 (12)
    Hazards [safety/stpa/hazards.yaml]               (12)
    ...
> Views
    Stats
    Validation
    Graph
    Matrix
    Coverage
    Traceability
> Schemas
    common
    aspice
    stpa
    stpa-sec
    cybersecurity
    dev
    aadl
> Help
    Documentation
    Schema Reference
    Link Types
    Validation Rules
```

Tree refreshes on `rivet/artifactsChanged`. Document nodes are expandable (lazy
fetch via `rivet/treeData` with parent). Artifact nodes open the rendered view.

**WebView Panels -- Shell Document Pattern:**

Instead of replacing `panel.webview.html` on every navigation (which re-ships all
assets), the extension uses a **shell document** pattern:

1. On first panel open, set `panel.webview.html` to a shell document containing:
   - CSS (fonts + styles, ~280KB) -- loaded once
   - Mermaid.js (~2.9MB) via `webview.asWebviewUri()` script tag -- loaded once
   - Navigation shim JS + `acquireVsCodeApi()` setup
   - VS Code theme CSS variable mappings
   - An empty `<main id="content"></main>` container
   - A message listener that updates `#content` on `update` messages

2. On navigation, the extension sends content via `postMessage`:
   ```typescript
   panel.webview.postMessage({
     type: 'update',
     html: renderResponse.html,
     title: renderResponse.title,
   });
   ```
   The shell's JS updates `#content` with the new HTML and re-triggers Mermaid
   rendering on the new content. Note: the HTML content comes from Rivet's own
   render functions (trusted source, not user input), so direct DOM insertion is
   safe in this context.

This means:
- CSS, fonts, Mermaid.js load **once** per panel lifetime
- Navigation sends only the content HTML (~5-50KB per page)
- Mermaid diagrams re-render only when content changes
- Scroll position is naturally preserved for same-page updates
- Panel uses `retainContextWhenHidden: true` to survive tab switches

**Navigation flow:**

```
User clicks link in WebView
  --> JS shim: e.preventDefault(), vscode.postMessage({type:'navigate', path:'/artifacts/REQ-002'})
  --> extension.ts: onDidReceiveMessage handler
  --> extension.ts: increment seq, sendRequest('rivet/render', {page, seq})
  --> LSP: calls render function, returns {html, title, sourceFile, sourceLine, seq}
  --> extension.ts: if seq matches current, panel.webview.postMessage({type:'update', html, title})
  --> Shell JS: updates #content container; mermaid.run()
```

Back/forward: extension maintains a history stack of `{path, params}` entries.
Back button in toolbar re-renders the previous path.

**Toolbar actions:**
- Back / Forward (history navigation)
- Show Source (opens YAML at `sourceFile:sourceLine`)
- Refresh (re-render current page)
- Open in Browser (starts `rivet serve` if needed, opens in external browser)

**Removed:**
- `rivet serve` auto-start for WebView
- Simple Browser usage
- `dashboardPanel` / `dashboardPort` globals

**Kept (optional):**
- `rivet serve` behind "Open in Browser" command (starts on demand, not at activation)

### Render Function Extraction

The serve views.rs functions currently return `Html<String>` with axum extractors.
Refactoring pattern:

**Before (views.rs):**
```rust
async fn artifacts_list(
    State(state): State<SharedState>,
    Query(params): Query<ViewParams>,
) -> Html<String> {
    let state = state.read().await;
    // ... build HTML using state.store, state.schema, etc.
    Html(html)
}
```

**After:**
```rust
// render/artifacts.rs -- pure function, no axum
pub fn artifacts_list(ctx: &RenderContext, params: &ViewParams) -> String {
    // ... same HTML building logic, using ctx.store, ctx.schema, etc.
    html
}

// serve/views.rs -- thin axum wrapper
async fn artifacts_list(
    State(state): State<SharedState>,
    Query(params): Query<ViewParams>,
) -> Html<String> {
    let state = state.read().await;
    let ctx = state.as_render_context();
    Html(render::artifacts::artifacts_list(&ctx, &params))
}
```

The render module lives at `rivet-cli/src/render/` as a peer to `rivet-cli/src/serve/`.
Both import from it. Components, styles, and JS constants stay in `serve/` but are
re-exported or moved to `render/` as needed.

### Asset Strategy

Assets by size:
- `mermaid.min.js`: **~2.9 MB**
- `fonts.css` (base64-embedded font faces): **~227 KB**
- `styles.rs` CSS: **~50 KB**
- `htmx.min.js`: **~50 KB** (NOT included in VS Code -- no HTMX needed)

**v1 strategy:**
- CSS + fonts (~280KB): inlined in the shell document (loaded once per panel)
- Mermaid.js (~2.9MB): loaded via `<script src="${mermaidUri}">` where `mermaidUri`
  is a `webview.asWebviewUri()` pointing to the bundled asset in the extension.
  This avoids shipping 2.9MB over the LSP pipe. The extension packages
  `mermaid.min.js` as a static asset.
- HTMX: not included (navigation handled by postMessage shim)
- Content HTML: sent per-navigation via postMessage (~5-50KB)

Over SSH Remote, the shell document + Mermaid script are loaded from the extension
host's filesystem (remote), which VS Code handles transparently. Only the content
HTML travels per-click.

### SSH Remote: Why This Works

In SSH Remote, the extension host runs on the remote machine. The LSP is a child
process of the extension host -- also on the remote. `client.sendRequest()` goes
through VS Code's LSP client/server protocol over stdin/stdout. The HTML string
comes back through the same channel. No ports, no HTTP, no forwarding.

WebView assets served via `webview.asWebviewUri()` are loaded from the extension
host filesystem (remote) and served to the local WebView by VS Code's built-in
remote content mechanism.

This is identical to how Markdown Preview works in SSH Remote.

### Theme Integration

The shell document maps VS Code's CSS variables to Rivet's design tokens:

```css
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
```

This makes Rivet content automatically adapt to light/dark/high-contrast themes.
The serve dashboard continues using its own hardcoded dark theme.

## STPA Design Constraints

From the STPA analysis, the following constraints are incorporated:

| ID | Constraint | Implementation |
|----|-----------|----------------|
| DC-1 | Check LSP status before render | Extension checks `client.state` before `sendRequest`. Shows "LSP disconnected" in WebView with restart button if down. |
| DC-2 | Handle stale data on reparse | LSP sends `rivet/artifactsChanged` with `changedFiles`. Extension shows "content changed" banner if current view is affected. |
| DC-3 | Debounce rapid navigation | Sequence numbers on render requests. Extension only applies responses matching current seq. |
| DC-4 | Limit large views | Render functions paginate (already do). Graph has max-nodes. Schema diagrams capped. |
| DC-5 | Preserve scroll on re-render | Shell document pattern preserves scroll naturally for postMessage updates. For full re-renders, round-trip scroll position. |
| DC-6 | Zero network dependencies | All data through LSP stdin/stdout. Assets via webview.asWebviewUri(). |
| DC-7 | Extension wraps render output | Shell document provides theme, nav shim, Mermaid. Render returns content-only HTML. |
| DC-8 | Tree refresh on change | `rivet/artifactsChanged` notification triggers `treeProvider.refresh()`. |

## Pages to Render

All existing serve views become renderable. Priority order for implementation:

### Phase 1 (MVP)
1. `/artifacts` -- artifact list with filtering
2. `/artifacts/{id}` -- artifact detail with links
3. `/stats` -- project overview
4. `/validate` -- validation results
5. `/stpa` -- STPA hierarchy view

### Phase 2
6. `/documents` + `/documents/{id}` -- document browser
7. `/graph` -- dependency graph (Mermaid)
8. `/matrix` -- traceability matrix
9. `/coverage` -- lifecycle coverage
10. `/source` + `/source/{path}` -- source browser

### Phase 3
11. `/help/schema/{name}` -- schema detail with linkage diagram
12. `/help/*` -- integrated documentation
13. `/search` -- global search (may move to VS Code Quick Pick for native feel)
14. `/traceability` -- trace tree
15. Remaining views (diff, results, externals, verification)

## What Stays vs Changes

| Component | Status |
|-----------|--------|
| `rivet serve` | Stays -- browser users, HTMX navigation, live reload |
| serve/views.rs | Refactored -- render logic extracted to `render/` module |
| serve/layout.rs | Stays -- page_layout/embed_layout used by serve only |
| serve/components.rs | Shared -- used by render functions |
| serve/styles.rs | Shared -- CSS used by both serve and VS Code shell |
| serve/js.rs | Stays for serve (HTMX, graph, search, AADL). VS Code gets nav shim. |
| LSP (main.rs) | Extended -- `rivet/render`, `rivet/treeData`, `rivet/artifactsChanged` |
| LSP salsa DB | Extended -- expose LinkGraph query, add DocStore/ResultStore/RepoContext |
| extension.ts | Rewritten -- WebView panels, enhanced tree view, LSP render client |
| Simple Browser usage | Removed |
| `startServe()` auto-start | Removed (kept behind manual "Open in Browser" command) |

## Testing Strategy

- **Render function unit tests:** Input data (mock Store/Schema) -> assert HTML
  string contains expected elements. Same tests validate both serve and LSP output.
- **LSP integration tests:** Send `rivet/render` and `rivet/treeData` requests to
  a running LSP, verify JSON responses.
- **Existing Playwright tests:** Continue testing serve dashboard (unchanged).
  New Playwright tests for VS Code WebView content are deferred (complex to set up).
- **Manual testing:** SSH Remote smoke test before each release.

## Decisions (from Open Questions)

1. **Render module location:** `rivet-cli/src/render/` as a peer to `serve/`.
2. **HTMX attributes:** Leave in rendered HTML (inert without HTMX, no cost).
3. **Mermaid rendering:** Works in WebViews. Loaded via `asWebviewUri`, not inlined.
4. **`rivet serve` in extension:** Kept behind manual "Open in Browser" command.
5. **Search (Cmd+K):** Evaluate moving to VS Code Quick Pick in Phase 3.
