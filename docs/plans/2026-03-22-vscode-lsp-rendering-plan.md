# VS Code Extension: LSP-Based Rendering — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Simple Browser approach with LSP-powered WebView rendering so the VS Code extension works natively in local and SSH Remote environments.

**Architecture:** Extract render functions from serve/views.rs into a shared `render/` module. Add custom LSP requests (`rivet/render`, `rivet/treeData`) and a notification (`rivet/artifactsChanged`). Rewrite extension.ts to use WebView panels fed by LSP responses via a shell document + postMessage pattern.

**Tech Stack:** Rust (rivet-cli, rivet-core, lsp_server, serde_json), TypeScript (VS Code extension API, vscode-languageclient)

**Spec:** `docs/plans/2026-03-22-vscode-lsp-rendering-design.md`

---

## File Structure

### New files

| File | Responsibility |
|------|---------------|
| `rivet-cli/src/render/mod.rs` | `RenderContext` struct, page router fn, re-exports |
| `rivet-cli/src/render/stats.rs` | `render_stats()` pure function |
| `rivet-cli/src/render/artifacts.rs` | `render_artifacts_list()`, `render_artifact_detail()` |
| `rivet-cli/src/render/validate.rs` | `render_validate()` |
| `rivet-cli/src/render/stpa.rs` | `render_stpa()` |
| `rivet-cli/src/render/components.rs` | `ViewParams` + shared component helpers (moved from serve) |
| `rivet-cli/src/render/helpers.rs` | `badge_for_type()`, `type_color_map()` + shared utility fns (moved from serve/mod.rs) |
| `rivet-cli/src/render/styles.rs` | CSS + font constants (moved from serve) |
| `rivet-cli/tests/render.rs` | Integration tests for render functions |
| `vscode-rivet/src/shell.ts` | Shell document HTML generator |

### Modified files

| File | Change |
|------|--------|
| `rivet-cli/src/main.rs:20-22` | Add `mod render;` as peer to `mod serve;` |
| `rivet-cli/src/serve/mod.rs` | Import from `render/`, `AppState::as_render_context()`, re-export badge_for_type/type_color_map from render |
| `rivet-cli/src/serve/views.rs` | Thin wrappers calling `render::*` functions |
| `rivet-cli/src/serve/components.rs` | Re-export from `render/components` |
| `rivet-cli/src/serve/styles.rs` | Re-export from `render/styles` |
| `rivet-cli/src/main.rs` | LSP: add `rivet/render`, `rivet/treeData`, `rivet/artifactsChanged`, load DocStore/ResultStore/RepoContext |
| `vscode-rivet/src/extension.ts` | Rewrite: WebView panels, LSP-backed tree view, navigation |
| `vscode-rivet/package.json` | New commands, tree view contributions, bundled assets |

---

## Task 1: Create render module with RenderContext, ViewParams, and shared helpers

**Files:**
- Create: `rivet-cli/src/render/mod.rs`
- Create: `rivet-cli/src/render/components.rs`
- Create: `rivet-cli/src/render/helpers.rs`
- Modify: `rivet-cli/src/main.rs:20-22` (add `mod render;` as peer to `mod serve;`)
- Modify: `rivet-cli/src/serve/mod.rs` (re-export from render, add as_render_context)
- Modify: `rivet-cli/src/serve/components.rs` (re-export ViewParams)

- [ ] **Step 1: Create `rivet-cli/src/render/mod.rs` with RenderContext**

```rust
use std::path::Path;

use rivet_core::document::DocumentStore;
use rivet_core::links::LinkGraph;
use rivet_core::results::ResultStore;
use rivet_core::schema::Schema;
use rivet_core::store::Store;
use rivet_core::validate::Diagnostic;

use crate::serve::{ExternalInfo, RepoContext};

pub(crate) mod components;
pub(crate) mod helpers;
pub(crate) mod stats;

/// Shared context for all render functions. Both serve (via AppState) and the
/// LSP (via salsa DB + supplementary state) construct this.
pub(crate) struct RenderContext<'a> {
    pub(crate) store: &'a Store,
    pub(crate) schema: &'a Schema,
    pub(crate) graph: &'a LinkGraph,
    pub(crate) doc_store: &'a DocumentStore,
    pub(crate) result_store: &'a ResultStore,
    pub(crate) diagnostics: &'a [Diagnostic],
    pub(crate) context: &'a RepoContext,
    pub(crate) externals: &'a [ExternalInfo],
    pub(crate) project_path: &'a Path,
    pub(crate) schemas_dir: &'a Path,
}

/// Route a page path to the appropriate render function.
pub(crate) fn render_page(ctx: &RenderContext, page: &str, params: &components::ViewParams) -> RenderResult {
    match page {
        "/" | "/stats" => RenderResult {
            html: stats::render_stats(ctx),
            title: "Stats".to_string(),
            source_file: None,
            source_line: None,
        },
        p if p.starts_with("/artifacts/") => {
            let id = &p["/artifacts/".len()..];
            artifacts::render_artifact_detail(ctx, id)
        }
        "/artifacts" => RenderResult {
            html: artifacts::render_artifacts_list(ctx, params),
            title: "Artifacts".to_string(),
            source_file: None,
            source_line: None,
        },
        "/validate" => RenderResult {
            html: validate::render_validate(ctx, params),
            title: "Validation".to_string(),
            source_file: None,
            source_line: None,
        },
        p if p.starts_with("/stpa") => RenderResult {
            html: stpa::render_stpa(ctx, params),
            title: "STPA".to_string(),
            source_file: None,
            source_line: None,
        },
        _ => RenderResult {
            html: format!(
                "<div class=\"error\"><h2>Not Found</h2><p>Page <code>{}</code> is not available.</p></div>",
                rivet_core::document::html_escape(page)
            ),
            title: "Not Found".to_string(),
            source_file: None,
            source_line: None,
        },
    }
}

pub(crate) struct RenderResult {
    pub(crate) html: String,
    pub(crate) title: String,
    pub(crate) source_file: Option<String>,
    pub(crate) source_line: Option<u32>,
}
```

- [ ] **Step 2: Move ViewParams and shared helpers to `rivet-cli/src/render/components.rs`**

Move `ViewParams` struct + its `impl` block + the pure helper functions (`search_input`, `type_select`, `per_page_select`, `type_checkboxes`, `filter_bar`, `sortable_header`, `pagination`, `paginate`, `collapsible_tree`, `validation_filter_bar`) from `serve/components.rs` to `render/components.rs`. Keep the same API. Update `serve/components.rs` to re-export:

```rust
// serve/components.rs -- becomes a re-export shim
pub(crate) use crate::render::components::*;
```

- [ ] **Step 3: Move `badge_for_type()` and `type_color_map()` to `rivet-cli/src/render/helpers.rs`**

Move these two functions (serve/mod.rs:973-1057) to `render/helpers.rs`. They are
used by all render functions for artifact type styling. Update `serve/mod.rs` to
re-export them so existing serve code continues to compile:

```rust
// serve/mod.rs — add after imports
pub(crate) use crate::render::helpers::{badge_for_type, type_color_map};
```

Also move any other utility functions from `serve/mod.rs` that are used by views.rs
render code (e.g., `html_escape` is in rivet_core::document so no move needed).

- [ ] **Step 4: Add `AppState::as_render_context()` to serve/mod.rs**

Add after the `AppState` struct definition (~line 193):

```rust
impl AppState {
    pub(crate) fn as_render_context(&self) -> crate::render::RenderContext<'_> {
        crate::render::RenderContext {
            store: &self.store,
            schema: &self.schema,
            graph: &self.graph,
            doc_store: &self.doc_store,
            result_store: &self.result_store,
            diagnostics: &self.cached_diagnostics,
            context: &self.context,
            externals: &self.externals,
            project_path: &self.project_path_buf,
            schemas_dir: &self.schemas_dir,
        }
    }
}
```

- [ ] **Step 5: Wire up the render module**

In `rivet-cli/src/main.rs` (line 22, after `mod serve;`), add `mod render;`:

```rust
mod docs;
mod schema_cmd;
mod serve;
mod render;
```

Verify it compiles:

Run: `cd /Volumes/Home/git/sdlc && cargo check -p rivet-cli 2>&1 | head -20`
Expected: compiles (warnings OK, no errors)

- [ ] **Step 6: Run existing tests to verify no breakage**

Run: `cd /Volumes/Home/git/sdlc && cargo test -p rivet-cli 2>&1 | tail -10`
Expected: all tests pass

- [ ] **Step 7: Commit**

```bash
git add rivet-cli/src/render/ rivet-cli/src/main.rs
git add rivet-cli/src/serve/mod.rs rivet-cli/src/serve/components.rs
git commit -m "refactor: create render module with RenderContext and ViewParams

Extract ViewParams, shared component helpers, badge_for_type, and
type_color_map from serve into render module. Add RenderContext struct
and AppState bridge. Foundation for LSP-based rendering.

Refs: REQ-001"
```

---

## Task 2: Extract stats render function

**Files:**
- Create: `rivet-cli/src/render/stats.rs`
- Modify: `rivet-cli/src/serve/views.rs:34-293` (index + stats_view + stats_partial)

- [ ] **Step 1: Create `rivet-cli/src/render/stats.rs`**

Extract the body of `stats_partial()` (views.rs:45-293) into a pure function:

```rust
use super::RenderContext;

/// Render the stats overview page content (no layout wrapper).
pub(crate) fn render_stats(ctx: &RenderContext) -> String {
    // Move the entire body of stats_partial() here.
    // Replace all `state.store` with `ctx.store`, `state.schema` with `ctx.schema`, etc.
    // Replace `state.context` with `ctx.context`, `state.cached_diagnostics` with `ctx.diagnostics`.
    // The function returns String (same as stats_partial).
    todo!() // Filled with actual extracted code
}
```

The key replacements in the extracted code:
- `state.store` -> `ctx.store`
- `state.schema` -> `ctx.schema`
- `state.graph` -> `ctx.graph`
- `state.doc_store` -> `ctx.doc_store`
- `state.result_store` -> `ctx.result_store`
- `state.context` -> `ctx.context`
- `state.cached_diagnostics` -> `ctx.diagnostics`
- `state.externals` -> `ctx.externals`

- [ ] **Step 2: Update serve/views.rs to call render function**

Replace `stats_partial()` body:

```rust
fn stats_partial(state: &AppState) -> String {
    let ctx = state.as_render_context();
    crate::render::stats::render_stats(&ctx)
}
```

- [ ] **Step 3: Verify serve still works**

Run: `cd /Volumes/Home/git/sdlc && cargo test -p rivet-cli 2>&1 | tail -10`
Expected: all tests pass

- [ ] **Step 4: Commit**

```bash
git add rivet-cli/src/render/stats.rs rivet-cli/src/render/mod.rs rivet-cli/src/serve/views.rs
git commit -m "refactor: extract stats render function from serve

Move stats_partial body to render::stats::render_stats(). Serve views.rs
becomes a thin wrapper. First render function extraction.

Refs: REQ-001"
```

---

## Task 3: Extract artifacts render functions

**Files:**
- Create: `rivet-cli/src/render/artifacts.rs`
- Modify: `rivet-cli/src/serve/views.rs:452-970` (artifacts_list, artifact_preview, artifact_detail)
- Modify: `rivet-cli/src/render/mod.rs` (add `pub(crate) mod artifacts;`)

- [ ] **Step 1: Create `rivet-cli/src/render/artifacts.rs`**

Extract three functions:

```rust
use super::{RenderContext, RenderResult};
use super::components::ViewParams;

/// Render the artifact list page with filtering/sorting/pagination.
pub(crate) fn render_artifacts_list(ctx: &RenderContext, params: &ViewParams) -> String {
    // Move body of artifacts_list() handler from views.rs:452-691
    // Replace State(state)/Query(params) with ctx/params
    todo!()
}

/// Render a single artifact detail page.
pub(crate) fn render_artifact_detail(ctx: &RenderContext, id: &str) -> RenderResult {
    // Move body of artifact_detail() handler from views.rs:765-970
    // Return RenderResult with source_file and source_line populated
    // from the artifact's source_file field
    todo!()
}

/// Render a lightweight artifact preview (for hover/tooltip).
pub(crate) fn render_artifact_preview(ctx: &RenderContext, id: &str) -> String {
    // Move body of artifact_preview() handler from views.rs:692-764
    todo!()
}
```

- [ ] **Step 2: Update serve/views.rs handlers to call render functions**

```rust
pub(crate) async fn artifacts_list(
    State(state): State<SharedState>,
    Query(params): Query<ViewParams>,
) -> Html<String> {
    let state = state.read().await;
    let ctx = state.as_render_context();
    Html(crate::render::artifacts::render_artifacts_list(&ctx, &params))
}

pub(crate) async fn artifact_detail(
    State(state): State<SharedState>,
    Path(id): Path<String>,
) -> Html<String> {
    let state = state.read().await;
    let ctx = state.as_render_context();
    let result = crate::render::artifacts::render_artifact_detail(&ctx, &id);
    Html(result.html)
}

pub(crate) async fn artifact_preview(
    State(state): State<SharedState>,
    Path(id): Path<String>,
) -> Html<String> {
    let state = state.read().await;
    let ctx = state.as_render_context();
    Html(crate::render::artifacts::render_artifact_preview(&ctx, &id))
}
```

- [ ] **Step 3: Verify**

Run: `cd /Volumes/Home/git/sdlc && cargo test -p rivet-cli 2>&1 | tail -10`
Expected: all tests pass

- [ ] **Step 4: Commit**

```bash
git add rivet-cli/src/render/artifacts.rs rivet-cli/src/render/mod.rs rivet-cli/src/serve/views.rs
git commit -m "refactor: extract artifacts render functions from serve

Move artifacts_list, artifact_detail, artifact_preview to
render::artifacts. Serve handlers become thin wrappers.

Refs: REQ-001"
```

---

## Task 4: Extract validate and STPA render functions

**Files:**
- Create: `rivet-cli/src/render/validate.rs`
- Create: `rivet-cli/src/render/stpa.rs`
- Modify: `rivet-cli/src/serve/views.rs:1483-1647` (validate_view) and `2756-3629` (stpa_view, stpa_partial)
- Modify: `rivet-cli/src/render/mod.rs` (add modules)

- [ ] **Step 1: Create `rivet-cli/src/render/validate.rs`**

```rust
use super::RenderContext;
use super::components::ViewParams;

/// Render the validation results page.
pub(crate) fn render_validate(ctx: &RenderContext, params: &ViewParams) -> String {
    // Move body of validate_view() from views.rs:1483-1647
    todo!()
}
```

- [ ] **Step 2: Create `rivet-cli/src/render/stpa.rs`**

```rust
use super::RenderContext;
use super::components::ViewParams;

/// Render the STPA hierarchy view.
pub(crate) fn render_stpa(ctx: &RenderContext, params: &ViewParams) -> String {
    // Move body of stpa_partial() from views.rs:2764-3629
    // stpa_view() calls stpa_partial(), so extract the partial.
    // Also move any private helper functions used only by STPA rendering.
    todo!()
}
```

- [ ] **Step 3: Update serve/views.rs handlers**

```rust
pub(crate) async fn validate_view(
    State(state): State<SharedState>,
    Query(params): Query<ViewParams>,
) -> Html<String> {
    let state = state.read().await;
    let ctx = state.as_render_context();
    Html(crate::render::validate::render_validate(&ctx, &params))
}

pub(crate) async fn stpa_view(
    State(state): State<SharedState>,
    Query(params): Query<ViewParams>,
) -> Html<String> {
    let state = state.read().await;
    let ctx = state.as_render_context();
    Html(crate::render::stpa::render_stpa(&ctx, &params))
}
```

- [ ] **Step 4: Verify**

Run: `cd /Volumes/Home/git/sdlc && cargo test -p rivet-cli 2>&1 | tail -10`
Expected: all tests pass

- [ ] **Step 5: Commit**

```bash
git add rivet-cli/src/render/validate.rs rivet-cli/src/render/stpa.rs rivet-cli/src/render/mod.rs rivet-cli/src/serve/views.rs
git commit -m "refactor: extract validate and STPA render functions

Move validate_view and stpa_partial bodies to render module.
Completes Phase 1 render function extraction.

Refs: REQ-001"
```

---

## Task 5: Move styles to render module

**Files:**
- Create: `rivet-cli/src/render/styles.rs`
- Modify: `rivet-cli/src/serve/styles.rs` (re-export)
- Modify: `rivet-cli/src/render/mod.rs` (add module)

- [ ] **Step 1: Move CSS and font constants to `rivet-cli/src/render/styles.rs`**

Move the `FONTS_CSS` and `CSS` constants from `serve/styles.rs` to `render/styles.rs`.

```rust
/// Embedded font-face declarations (base64-encoded font files).
pub(crate) const FONTS_CSS: &str = include_str!("../../assets/fonts.css");

/// Main application CSS.
pub(crate) const CSS: &str = r#"..."#; // Move the full CSS string
```

- [ ] **Step 2: Update serve/styles.rs to re-export**

```rust
pub(crate) use crate::render::styles::*;
```

- [ ] **Step 3: Verify**

Run: `cd /Volumes/Home/git/sdlc && cargo check -p rivet-cli && cargo test -p rivet-cli 2>&1 | tail -10`
Expected: compiles, all tests pass

- [ ] **Step 4: Commit**

```bash
git add rivet-cli/src/render/styles.rs rivet-cli/src/render/mod.rs rivet-cli/src/serve/styles.rs
git commit -m "refactor: move CSS/font constants to render module

Shared by serve layouts and VS Code shell document.

Refs: REQ-001"
```

---

## Task 6: Add LSP data loading for RenderContext

**Files:**
- Modify: `rivet-cli/src/main.rs:4912-5119` (cmd_lsp function)
- Modify: `rivet-cli/src/serve/mod.rs` (make capture_git_info pub(crate))

The LSP currently has Store, Schema, and diagnostics via salsa. It needs LinkGraph,
DocumentStore, ResultStore, RepoContext, and externals to construct a RenderContext.

- [ ] **Step 1: Make serve helper functions accessible from main.rs**

In `serve/mod.rs`, change visibility:
- `fn capture_git_info` -> `pub(crate) fn capture_git_info`

Verify `RepoContext`, `GitInfo`, `ExternalInfo` are already `pub(crate)` (they are).

- [ ] **Step 2: Add data loading after salsa initialization in cmd_lsp**

After line 4991 (where `store` and `diagnostics` are first computed), add code to load
DocumentStore, ResultStore, RepoContext, and build LinkGraph. Use the same pattern as
`reload_state()` in serve/mod.rs:199-312.

Key additions:
- `let schema = db.schema(schema_set);`
- `let graph = LinkGraph::build(&store, &schema);`
- `let doc_store = ...` (load from config.docs paths)
- `let result_store = ...` (load from config.results path)
- `let repo_context = RepoContext { ... };`
- `let externals: Vec<ExternalInfo> = Vec::new();` (skip external loading for v1)
- `let mut diagnostics_cache = diagnostics;`

- [ ] **Step 3: Rebuild render state on didSave**

In the `didSave` handler, after `lsp_publish_salsa_diagnostics(...)`, rebuild:

```rust
render_store = db.store(source_set);
render_schema = db.schema(schema_set);
render_graph = rivet_core::links::LinkGraph::build(&render_store, &render_schema);
diagnostics_cache = db.diagnostics(source_set, schema_set);

// Send artifactsChanged notification
let changed_notification = lsp_server::Notification {
    method: "rivet/artifactsChanged".to_string(),
    params: serde_json::json!({
        "artifactCount": render_store.len(),
        "documentCount": doc_store.len(),
        "changedFiles": [path_str]
    }),
};
connection.sender.send(Message::Notification(changed_notification))?;
```

- [ ] **Step 4: Verify**

Run: `cd /Volumes/Home/git/sdlc && cargo check -p rivet-cli 2>&1 | head -20`
Expected: compiles

Run: `cd /Volumes/Home/git/sdlc && cargo test -p rivet-cli 2>&1 | tail -10`
Expected: all tests pass

- [ ] **Step 5: Commit**

```bash
git add rivet-cli/src/main.rs rivet-cli/src/serve/mod.rs
git commit -m "feat(lsp): load DocumentStore, ResultStore, LinkGraph for rendering

LSP now has all data needed to construct RenderContext.
Sends rivet/artifactsChanged notification on file save.

Refs: REQ-001"
```

---

## Task 7: Add `rivet/render` and `rivet/treeData` custom LSP requests

**Files:**
- Modify: `rivet-cli/src/main.rs:5004-5046` (request handler match block)
- Modify: `rivet-cli/src/render/components.rs` (add Default + Deserialize to ViewParams)

- [ ] **Step 1: Add Default + Deserialize to ViewParams**

In `render/components.rs`, ensure ViewParams has:

```rust
#[derive(Debug, Default, serde::Deserialize)]
pub(crate) struct ViewParams { ... }
```

- [ ] **Step 2: Add rivet/render handler**

In the `match method` block (main.rs ~line 5005), add before the `_` fallback:

```rust
"rivet/render" => {
    let params: serde_json::Value = req.params.clone();
    let page = params.get("page").and_then(|v| v.as_str()).unwrap_or("/");
    let seq = params.get("seq").and_then(|v| v.as_u64()).unwrap_or(0);
    let view_params = params.get("params")
        .and_then(|p| serde_json::from_value::<crate::render::components::ViewParams>(p.clone()).ok())
        .unwrap_or_default();

    let ctx = crate::render::RenderContext {
        store: &render_store,
        schema: &render_schema,
        graph: &render_graph,
        doc_store: &doc_store,
        result_store: &result_store,
        diagnostics: &diagnostics_cache,
        context: &repo_context,
        externals: &externals,
        project_path: &project_dir,
        schemas_dir: &schemas_dir,
    };

    let result = crate::render::render_page(&ctx, page, &view_params);
    connection.sender.send(Message::Response(Response {
        id: req.id,
        result: Some(serde_json::json!({
            "html": result.html,
            "title": result.title,
            "sourceFile": result.source_file,
            "sourceLine": result.source_line,
            "seq": seq,
        })),
        error: None,
    }))?;
}
```

- [ ] **Step 3: Add rivet/treeData handler**

Add another match arm for `"rivet/treeData"`. This builds the tree data from
`render_store` (group artifacts by source file for documents, static lists for
views/schemas/help). When `parent` is provided, return artifacts from that source file.

See the spec's `rivet/treeData` response format for the expected JSON structure.

- [ ] **Step 4: Add rivet/css handler**

```rust
"rivet/css" => {
    let css = format!("{}\n{}", crate::render::styles::FONTS_CSS, crate::render::styles::CSS);
    connection.sender.send(Message::Response(Response {
        id: req.id,
        result: Some(serde_json::to_value(css)?),
        error: None,
    }))?;
}
```

- [ ] **Step 5: Verify**

Run: `cd /Volumes/Home/git/sdlc && cargo check -p rivet-cli 2>&1 | head -20`
Expected: compiles

- [ ] **Step 6: Commit**

```bash
git add rivet-cli/src/main.rs rivet-cli/src/render/components.rs
git commit -m "feat(lsp): add rivet/render, rivet/treeData, rivet/css requests

rivet/render routes page paths to render functions, returns HTML + metadata.
rivet/treeData returns hierarchical tree structure for sidebar.
rivet/css returns CSS for WebView shell document.
Uses sequence numbers for client-side request cancellation.

Refs: REQ-001"
```

---

## Task 8: Extension — shell document and WebView panel

**Files:**
- Create: `vscode-rivet/src/shell.ts`
- Modify: `vscode-rivet/src/extension.ts`

- [ ] **Step 1: Create `vscode-rivet/src/shell.ts`**

Shell HTML document with:
- CSP header (nonce-based for scripts/styles)
- VS Code theme CSS variable mappings (--bg, --surface, --text, etc.)
- Inlined CSS from `rivet/css` response (passed as parameter)
- Mermaid.js loaded via `webview.asWebviewUri()` (not inlined)
- Navigation shim: intercepts `<a href="/...">` clicks, sends `vscode.postMessage({type:'navigate', path})`
- Message listener: receives `{type:'update', html, title}` from extension, sets `#content` container
  (Content comes from Rivet's own render functions -- trusted source, safe for DOM insertion)
- Stale banner: receives `{type:'stale'}`, shows "content changed" banner; click sends `{type:'refresh'}`

- [ ] **Step 2: Copy mermaid.min.js to extension assets**

```bash
mkdir -p vscode-rivet/assets
cp rivet-cli/assets/mermaid.min.js vscode-rivet/assets/mermaid.min.js
```

- [ ] **Step 3: Rewrite showDashboard in extension.ts**

Replace Simple Browser approach with WebView panel:
- Create panel with `enableScripts: true`, `retainContextWhenHidden: true`
- Set `panel.webview.html` to shell document (from `getShellHtml()`)
- On navigation: `client.sendRequest('rivet/render', {page, seq})` -> `panel.webview.postMessage({type:'update', html})`
- Sequence number tracking: increment on each navigation, ignore stale responses
- History stack for back/forward

- [ ] **Step 4: Remove startServe, Simple Browser, dashboardPort globals**

Delete `startServe()` function, `serveProcess`, `dashboardPort`, `dashboardPanel` globals.
Remove `startServe(context, rivetPath)` call from `activate()`.
Remove `simpleBrowser.api.open` usage.

- [ ] **Step 5: Verify TypeScript compiles**

Run: `cd /Volumes/Home/git/sdlc/vscode-rivet && npm run compile 2>&1 | tail -10`
Expected: compiles

- [ ] **Step 6: Commit**

```bash
git add vscode-rivet/src/shell.ts vscode-rivet/src/extension.ts vscode-rivet/assets/mermaid.min.js
git commit -m "feat(vscode): WebView panel with LSP rendering

Replace Simple Browser with native WebView panel using shell document
pattern. Content fetched via rivet/render LSP request, delivered via
postMessage. Sequence numbers prevent stale responses. Assets load
once per panel lifetime.

Refs: REQ-001"
```

---

## Task 9: Extension — LSP-backed tree view

**Files:**
- Modify: `vscode-rivet/src/extension.ts` (RivetTreeProvider class)

- [ ] **Step 1: Rewrite RivetTreeProvider**

Replace the static 11-item tree with an LSP-backed implementation:
- `getChildren(element?)`: if no element, fetch top-level via `client.sendRequest('rivet/treeData', {parent: null})`
- Categories (Documents, Views, Schemas, Help) are collapsible
- Document nodes are collapsible: on expand, fetch artifacts via `rivet/treeData` with `parent: sourcePath`
- Artifact/View/Schema/Help nodes are leaf nodes with `command: rivet.navigateTo`
- Document nodes show `[path]` as description and `(count)` suffix
- Use appropriate ThemeIcons per kind (folder, file-text, symbol-property, dashboard, shield, etc.)

- [ ] **Step 2: Wire tree view to LSP notifications**

After `client.start()`, register:

```typescript
client.onNotification('rivet/artifactsChanged', (params: any) => {
  treeProvider.refresh();
  if (panel && params.changedFiles) {
    panel.webview.postMessage({ type: 'stale' });
  }
});
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `cd /Volumes/Home/git/sdlc/vscode-rivet && npm run compile 2>&1 | tail -10`
Expected: compiles

- [ ] **Step 4: Commit**

```bash
git add vscode-rivet/src/extension.ts
git commit -m "feat(vscode): LSP-backed tree view with document expansion

Tree view fetches structure from rivet/treeData LSP request.
Documents expand lazily to show individual artifacts.
Refreshes on rivet/artifactsChanged notification.

Refs: REQ-001"
```

---

## Task 10: Extension — CSS loading, Show Source, and package.json

**Files:**
- Modify: `vscode-rivet/src/extension.ts`
- Modify: `vscode-rivet/package.json`

- [ ] **Step 1: Fetch CSS from LSP on startup**

After `client.start()`:

```typescript
const cachedCss: string = await client.sendRequest('rivet/css') as string;
```

Pass `cachedCss` to `getShellHtml()` when creating the WebView panel.

- [ ] **Step 2: Implement Show Source command**

Track `currentSourceFile` and `currentSourceLine` from render responses.
Register `rivet.showSource` command that opens the YAML file at the artifact's
source line using `vscode.window.showTextDocument()` with a selection range.

- [ ] **Step 3: Update package.json commands**

Ensure all commands are declared in `contributes.commands`:
`showDashboard`, `showGraph`, `showSTPA`, `validate`, `addArtifact`, `showSource`, `refreshTree`, `navigateTo`.

- [ ] **Step 4: Verify**

Run: `cd /Volumes/Home/git/sdlc/vscode-rivet && npm run compile 2>&1 | tail -10`
Expected: compiles

- [ ] **Step 5: Commit**

```bash
git add vscode-rivet/src/extension.ts vscode-rivet/package.json
git commit -m "feat(vscode): CSS loading via LSP + Show Source action

Extension fetches CSS from rivet/css LSP request on startup.
Show Source command opens YAML file at the artifact's source line.

Refs: REQ-001"
```

---

## Task 11: Integration test and end-to-end verification

**Files:**
- Create: `rivet-cli/tests/lsp_render.rs`

- [ ] **Step 1: Write LSP render integration test**

Create `rivet-cli/tests/lsp_render.rs` with `#[ignore]` (for manual/CI-optional runs).
The test starts `rivet lsp` as a subprocess, sends `initialize`, then `rivet/render`
with `{"page": "/stats"}`, validates the response contains HTML with artifact count,
then sends `shutdown`/`exit`.

- [ ] **Step 2: Run full Rust test suite**

Run: `cd /Volumes/Home/git/sdlc && cargo test 2>&1 | tail -20`
Expected: all tests pass, no regressions

- [ ] **Step 3: Run clippy**

Run: `cd /Volumes/Home/git/sdlc && cargo clippy -p rivet-cli -- -D warnings 2>&1 | tail -20`
Expected: no warnings

- [ ] **Step 4: Compile VS Code extension**

Run: `cd /Volumes/Home/git/sdlc/vscode-rivet && npm run compile 2>&1 | tail -10`
Expected: compiles cleanly

- [ ] **Step 5: Manual smoke test checklist**

1. Open VS Code in the rivet project
2. Verify tree view loads with Documents, Views, Schemas, Help categories
3. Expand Documents -- see document names with artifact counts
4. Click "Stats" -- WebView panel opens with stats overview
5. Click "Artifacts" -- artifact list renders with filtering
6. Click an artifact ID in the list -- detail view renders
7. Click "Show Source" -- YAML file opens at correct line
8. Edit a YAML file, save -- stale banner appears in WebView
9. Click stale banner -- content refreshes
10. Test over SSH Remote (if available)

- [ ] **Step 6: Commit**

```bash
git add rivet-cli/tests/lsp_render.rs vscode-rivet/src/ vscode-rivet/package.json
git commit -m "feat(vscode): complete LSP-based rendering MVP

WebView panels rendered via rivet/render LSP request.
LSP-backed tree view with document expansion.
Shell document pattern: assets load once, content via postMessage.
Works in local and SSH Remote environments.

Refs: REQ-001"
```
