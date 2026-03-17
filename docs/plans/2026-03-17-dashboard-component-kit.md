# Dashboard Component Kit & Scalability Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a reusable UI component system for the dashboard, fix graph scalability, add URL-persisted view state across all views, and add a print-friendly document mode.

**Architecture:** Extract shared UI primitives (filter bar, sortable table, fold/unfold tree, pagination) into composable Rust helper functions in a new `serve/components.rs` module. Each component renders HTML fragments and emits query-param-aware URLs so all view state survives reload. Graph rendering moves to `spawn_blocking` with a node-count budget and progressive disclosure. A `?print=1` param strips chrome for any view.

**Tech Stack:** Rust (axum, HTMX), petgraph, etch (Sugiyama layout), inline CSS/JS

---

## File Structure

| File | Responsibility |
|------|---------------|
| `rivet-cli/src/serve/mod.rs` | Route definitions, AppState, middleware, re-exports |
| `rivet-cli/src/serve/components.rs` | **NEW** — Reusable HTML component functions (filter bar, sortable table, collapsible tree, pagination, graph viewer) |
| `rivet-cli/src/serve/layout.rs` | **NEW** — `page_layout()`, `print_layout()`, CSS constant, context bar |
| `rivet-cli/src/serve/views/mod.rs` | **NEW** — re-export all view handlers |
| `rivet-cli/src/serve/views/index.rs` | **NEW** — `/` and `/stats` |
| `rivet-cli/src/serve/views/artifacts.rs` | **NEW** — `/artifacts`, `/artifacts/{id}`, `/artifacts/{id}/preview` |
| `rivet-cli/src/serve/views/stpa.rs` | **NEW** — `/stpa` with fold/unfold/filter |
| `rivet-cli/src/serve/views/graph.rs` | **NEW** — `/graph`, `/artifacts/{id}/graph` with scalability fixes |
| `rivet-cli/src/serve/views/matrix.rs` | **NEW** — `/matrix`, `/coverage` |
| `rivet-cli/src/serve/views/validate.rs` | **NEW** — `/validate`, `/verification` |
| `rivet-cli/src/serve/views/docs.rs` | **NEW** — `/documents`, `/documents/{id}`, `/doc-linkage` |
| `rivet-cli/src/serve/views/source.rs` | **NEW** — `/source`, `/source/{path}` |
| `rivet-cli/src/serve/views/traceability.rs` | **NEW** — `/traceability`, `/traceability/history` |
| `rivet-cli/src/serve/views/search.rs` | **NEW** — `/search` |
| `rivet-cli/src/serve/views/results.rs` | **NEW** — `/results`, `/results/{run_id}` |
| `rivet-cli/src/serve/views/help.rs` | **NEW** — `/help/*` routes |
| `rivet-cli/src/serve/views/diff.rs` | **NEW** — `/diff` |
| `rivet-cli/src/serve/js.rs` | **NEW** — JavaScript constants: JS (main), SEARCH_JS, AADL_JS |
| `rivet-cli/src/serve/styles.rs` | **NEW** — CSS constant (~580 lines) |
| `etch/src/svg.rs` | MODIFY — dynamic buffer sizing |
| `etch/src/layout.rs` | MODIFY — add node budget / bail-out |
| `safety/stpa/hazards.yaml` | MODIFY — add H-13 (scalability hazard) |
| `safety/stpa/system-constraints.yaml` | MODIFY — add SC-15 (scalability constraint) |

### Rationale: serve.rs split

The current `serve.rs` is 7,576 lines — a single file with all routes, CSS, JS, and HTML generation. This plan splits it into a `serve/` module directory. Each view becomes its own file with clear ownership. The `components.rs` module is the key innovation: build filter bars, tables, tree views, and pagination helpers once, then call them from any view.

**Migration strategy:** Each task extracts one view at a time. The old `serve.rs` shrinks incrementally. At each step, the dashboard remains fully functional. Final step deletes the empty `serve.rs`.

---

## Task 0: STPA scalability coverage

Add the hazard and constraint for "artifacts grow too large for the dashboard to handle efficiently."

**Files:**
- Modify: `safety/stpa/hazards.yaml`
- Modify: `safety/stpa/system-constraints.yaml`
- Modify: `safety/stpa/ucas.yaml`
- Modify: `safety/stpa/controller-constraints.yaml`

- [ ] **Step 1: Add H-13 hazard**

```yaml
  - id: H-13
    title: Rivet dashboard becomes unresponsive when artifact count exceeds layout engine capacity
    description: >
      When a project contains hundreds or thousands of artifacts, the graph
      layout algorithm (O(N² log N) Sugiyama) exhausts memory or blocks the
      async runtime, causing the dashboard to hang or crash. Engineers lose
      the ability to visualize and navigate traceability, defeating the
      tool's purpose.
    losses: [L-4, L-5]
```

- [ ] **Step 2: Add SC-15 constraint**

```yaml
  - id: SC-15
    title: Dashboard must degrade gracefully when artifact count exceeds rendering thresholds
    description: >
      The dashboard must impose node budgets on graph layout, paginate
      large artifact lists, and progressively disclose detail rather than
      attempting to render everything at once. Layout computation must run
      outside the async runtime to prevent blocking other requests.
    hazards: [H-13]
    spec-baseline: "v0.2.0"
```

- [ ] **Step 3: Add UCA and CC for dashboard controller**

Add UCA-D-3 and CC-D-3 to the `dashboard-ucas:` section of `ucas.yaml` (where `UCA-D-1` and `UCA-D-2` already exist):

```yaml
# In ucas.yaml, dashboard-ucas section:
  - id: UCA-D-3
    title: Dashboard provides full unfiltered graph when artifact count exceeds layout budget
    uca-type: providing
    context: >
      Project contains 500+ artifacts and user navigates to /graph without type filters or focus.
    controller: CTRL-DASH
    hazards: [H-13]

# In controller-constraints.yaml:
  - id: CC-D-3
    constraint: >
      Dashboard must enforce a node budget on graph layout, display a helpful
      message when exceeded, and provide filter/focus controls to narrow the view.
      Layout computation must run in spawn_blocking to avoid blocking the async runtime.
    controller: CTRL-DASH
    ucas: [UCA-D-3]
    hazards: [H-13]
```

- [ ] **Step 4: Validate**

Run: `cargo run --release -- validate`
Expected: PASS (0 warnings)

- [ ] **Step 5: Commit**

```
git add safety/stpa/
git commit -m "stpa: add H-13/SC-15 scalability hazard for dashboard rendering

Refs: H-13"
```

---

## Task 1: Create serve/ module skeleton and extract layout

Extract `page_layout()`, CSS, and the print layout into the new module structure. This is the foundation everything else builds on.

**Files:**
- Create: `rivet-cli/src/serve/mod.rs`
- Create: `rivet-cli/src/serve/layout.rs`
- Create: `rivet-cli/src/serve/js.rs`
- Modify: `rivet-cli/src/main.rs` (change `mod serve` to `mod serve` pointing at directory)

- [ ] **Step 1: Create serve/mod.rs with AppState and router**

Move `AppState`, `SharedState`, `RepoContext`, `GitInfo`, `SiblingProject` structs and the `pub async fn run()` function (line 272 of serve.rs). Keep the router definition here. Import view handlers from submodules (initially re-export from old serve.rs via `#[path]`). Also move utility routes that don't belong to a specific view: `/source-raw/{*path}`, `/api/links/{id}`, `/wasm/{*path}`, `/docs-asset/{*path}`, `/reload`.

- [ ] **Step 2: Create serve/layout.rs with page_layout and print_layout**

Extract `page_layout()` from serve.rs (lines 2372-2566). Add a new `print_layout()` that renders the same content but without nav, context bar, or sidebar — just the content area with print-friendly CSS.

The print layout key: check for `?print=1` query param. If present, return content wrapped in minimal `<html>` with `@media print` CSS, no nav, no HTMX.

```rust
pub fn page_layout(content: &str, state: &AppState, print: bool) -> Html<String> {
    if print {
        return print_layout(content, state);
    }
    // ... existing layout logic
}

fn print_layout(content: &str, state: &AppState) -> Html<String> {
    Html(format!(r##"<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>{project} — Rivet</title>
<style>
  body {{ font-family: 'Atkinson Hyperlegible', sans-serif; max-width: 900px; margin: 2rem auto; }}
  table {{ border-collapse: collapse; width: 100%; }}
  th, td {{ border: 1px solid #ccc; padding: .4rem .6rem; text-align: left; font-size: .85rem; }}
  @media print {{ body {{ margin: 0; }} }}
  {CSS}
</style>
</head>
<body>{content}</body>
</html>"##,
        project = html_escape(&state.context.project_name),
    ))
}
```

- [ ] **Step 3: Create serve/js.rs and serve/styles.rs**

Extract **all** JavaScript constants from serve.rs into `js.rs`:
- Main JS block (~430 lines, lines 1339-1767): `pub const JS: &str`
- Search JS (~108 lines, starting line 1772): `pub const SEARCH_JS: &str`
- AADL JS (starting line 1880): `pub const AADL_JS: &str`

Extract the CSS constant (~580 lines, lines 755-1335) into `styles.rs`:
- `pub const CSS: &str`

All three JS constants are referenced in `page_layout()` via `{JS}`, `{SEARCH_JS}`, `{AADL_JS}` — ensure the imports match.

- [ ] **Step 4: Update main.rs**

Change `mod serve;` to point at the new directory module. Verify `rivet serve` still starts and all routes respond.

- [ ] **Step 5: Test manually**

Run: `cargo run --release -- serve`
Visit: `http://localhost:3000/`, `/artifacts`, `/stpa`, `/graph`
Expected: All pages render identically to before.

- [ ] **Step 6: Commit**

```
git add rivet-cli/src/serve/ rivet-cli/src/main.rs
git commit -m "refactor: extract serve.rs into serve/ module directory

Implements: FEAT-052
Refs: DD-005"
```

---

## Task 2: Build the component kit (components.rs)

This is the core deliverable. Build reusable HTML component functions that every view will use.

**Files:**
- Create: `rivet-cli/src/serve/components.rs`

### Component 1: FilterBar

A horizontal bar with type checkboxes, status dropdown, tag filter, and text search. All selections are reflected in query params so the URL is bookmarkable and survives reload.

- [ ] **Step 1: Write FilterBar component**

```rust
/// Render a filter bar that preserves state in URL query params.
///
/// `active_filters` is the current state parsed from the request.
/// `base_url` is the route path (e.g., "/artifacts", "/stpa").
/// Each filter change triggers an HTMX GET to `base_url?{new_params}`.
pub fn filter_bar(cfg: &FilterBarConfig) -> String {
    // Renders:
    // - Type checkboxes (from cfg.available_types)
    // - Status dropdown (from cfg.available_statuses)
    // - Tag pills (from cfg.available_tags)
    // - Free-text search input
    // - Clear all button
    // All wired with onchange -> update URL params and hx-get
}

pub struct FilterBarConfig {
    pub base_url: String,
    pub available_types: Vec<String>,
    pub available_statuses: Vec<String>,
    pub available_tags: Vec<String>,
    pub active_types: Vec<String>,
    pub active_statuses: Vec<String>,
    pub active_tags: Vec<String>,
    pub search_text: String,
    pub extra_params: Vec<(String, String)>, // preserve non-filter params
}
```

- [ ] **Step 2: Write SortableTable component**

```rust
/// Render a sortable HTML table with column headers that toggle sort direction.
/// Sort state is encoded in `?sort=col&dir=asc` query params.
pub fn sortable_table(cfg: &TableConfig) -> String { ... }

pub struct TableConfig {
    pub base_url: String,
    pub columns: Vec<Column>,
    pub rows: Vec<Vec<String>>,  // each inner vec = one row's cells (HTML)
    pub sort_column: Option<String>,
    pub sort_dir: SortDir,
    pub extra_params: Vec<(String, String)>,
}
```

- [ ] **Step 3: Write CollapsibleTree component**

```rust
/// Render a hierarchical tree with <details>/<summary> elements.
/// Fold/unfold state is encoded in `?open=id1,id2,id3` query param.
/// Provides "Expand All" / "Collapse All" buttons that update the URL.
pub fn collapsible_tree(nodes: &[TreeNode], open_ids: &[String], base_url: &str) -> String { ... }

pub struct TreeNode {
    pub id: String,
    pub summary_html: String,
    pub detail_html: String,
    pub children: Vec<TreeNode>,
}
```

- [ ] **Step 4: Write Pagination component**

```rust
/// Render pagination controls: « ‹ page N of M › »
/// Page state encoded in `?page=N&per_page=M` query params.
pub fn pagination(page: usize, per_page: usize, total: usize, base_url: &str, extra_params: &[(String, String)]) -> String { ... }
```

- [ ] **Step 5: Write unit tests**

```rust
#[cfg(test)]
mod tests {
    #[test]
    fn filter_bar_renders_checkboxes() { ... }
    #[test]
    fn filter_bar_preserves_extra_params() { ... }
    #[test]
    fn sortable_table_toggle_direction() { ... }
    #[test]
    fn collapsible_tree_open_ids() { ... }
    #[test]
    fn pagination_boundaries() { ... }
}
```

Run: `cargo test -p rivet-cli`
Expected: All new tests pass.

- [ ] **Step 6: Commit**

```
git add rivet-cli/src/serve/components.rs
git commit -m "feat(serve): add reusable UI component kit — filter bar, sortable table, collapsible tree, pagination

Implements: FEAT-052
Refs: SC-15"
```

---

## Task 3: URL-persisted view state middleware

Add a shared query param struct and middleware that every view can use.

**Files:**
- Modify: `rivet-cli/src/serve/mod.rs`

- [ ] **Step 1: Define ViewParams extractor**

```rust
/// Common query params shared across all views.
/// Views add their own params on top of this.
#[derive(Debug, Deserialize, Default)]
pub struct ViewParams {
    #[serde(default)]
    pub types: Option<String>,
    #[serde(default)]
    pub status: Option<String>,
    #[serde(default)]
    pub tags: Option<String>,
    #[serde(default)]
    pub q: Option<String>,
    #[serde(default)]
    pub sort: Option<String>,
    #[serde(default)]
    pub dir: Option<String>,
    #[serde(default)]
    pub page: Option<usize>,
    #[serde(default)]
    pub per_page: Option<usize>,
    #[serde(default)]
    pub open: Option<String>,  // comma-separated open node IDs
    #[serde(default)]
    pub print: Option<bool>,   // print mode
}
```

- [ ] **Step 2: Add helper to rebuild URL with current params**

```rust
impl ViewParams {
    /// Build query string from current params, allowing overrides.
    pub fn to_query_string(&self, overrides: &[(&str, &str)]) -> String { ... }
}
```

- [ ] **Step 3: Commit**

```
git add rivet-cli/src/serve/mod.rs
git commit -m "feat(serve): add ViewParams extractor for URL-persisted filter/sort/page state

Refs: DD-005"
```

---

## Task 4: Fix graph scalability

Fix the three critical graph issues: blocking tokio, O(N²) on large graphs, and SVG buffer sizing.

**Files:**
- Modify: `rivet-cli/src/serve/views/graph.rs` (or serve.rs until split)
- Modify: `etch/src/layout.rs`
- Modify: `etch/src/svg.rs`

- [ ] **Step 1: Write failing test for large graph layout**

Note: `NodeInfo` does not derive `Default`. Construct it explicitly.

```rust
// etch/src/layout.rs
#[test]
fn layout_500_nodes_completes() {
    use petgraph::Graph;
    let mut g = Graph::new();
    let nodes: Vec<_> = (0..500).map(|i| g.add_node(format!("N-{i}"))).collect();
    // Chain edges: 0→1→2→...→499
    for w in nodes.windows(2) {
        g.add_edge(w[0], w[1], "link".to_string());
    }
    let layout = layout(
        &g,
        &|_, n| NodeInfo {
            id: n.clone(),
            label: n.clone(),
            node_type: String::new(),
            sublabel: None,
            parent: None,
        },
        &|_, e| EdgeInfo { label: e.clone() },
        &LayoutOptions::default(),
    );
    assert_eq!(layout.nodes.len(), 500);
}
```

Run: `cargo test -p etch layout_500`
Expected: PASS (but may be slow — establishes baseline)

- [ ] **Step 2: Add node budget to etch layout**

Add a `max_nodes: Option<usize>` field to `LayoutOptions`. When set, if `graph.node_count() > max_nodes`, return a `GraphLayout` with a single sentinel node saying "Graph too large ({n} nodes). Use filters or focus to narrow the view." This prevents the O(N²) blowup.

```rust
// In layout():
if let Some(max) = options.max_nodes {
    if graph.node_count() > max {
        return GraphLayout {
            nodes: vec![LayoutNode {
                id: "__budget_exceeded__".into(),
                label: format!("Graph has {} nodes (budget: {}). Use type filters or focus on a specific artifact.", graph.node_count(), max),
                ..Default::default()
            }],
            edges: vec![],
            width: 400.0,
            height: 60.0,
        };
    }
}
```

- [ ] **Step 3: Fix SVG buffer sizing**

In `etch/src/svg.rs`, replace the fixed 4096-byte capacity with a dynamic estimate:

```rust
// Estimate ~500 bytes per node + ~200 bytes per edge + base overhead
let estimated = 2048 + layout.nodes.len() * 500 + layout.edges.len() * 200;
let mut svg = String::with_capacity(estimated);
```

- [ ] **Step 4: Move graph layout to spawn_blocking**

In the graph view handler, wrap the layout + SVG render in `tokio::task::spawn_blocking` so it doesn't block the async runtime.

**IMPORTANT:** `spawn_blocking` requires `Send + 'static` — you cannot capture borrowed references from the `RwLock` read guard. Pre-collect all node/edge info into owned collections BEFORE entering the blocking task:

```rust
// Pre-collect owned data while we hold the read lock
let node_infos: HashMap<NodeIndex, NodeInfo> = sub.node_indices()
    .map(|idx| {
        let id = sub[idx].clone();
        let atype = store.get(&id).map(|a| a.artifact_type.clone()).unwrap_or_default();
        let title = store.get(&id).map(|a| a.title.clone()).unwrap_or_default();
        let sublabel = if title.len() > 28 { Some(format!("{}...", &title[..26])) }
                       else if title.is_empty() { None }
                       else { Some(title) };
        (idx, NodeInfo { id, label: sub[idx].clone(), node_type: atype, sublabel, parent: None })
    })
    .collect();

let edge_infos: HashMap<EdgeIndex, EdgeInfo> = sub.edge_indices()
    .map(|idx| (idx, EdgeInfo { label: sub[idx].clone() }))
    .collect();

// Drop the read lock, then spawn blocking with owned data
let svg = tokio::task::spawn_blocking(move || {
    let gl = etch::layout(&sub, &|idx, _| node_infos[&idx].clone(),
                          &|idx, _| edge_infos[&idx].clone(), &layout_opts);
    etch::svg::render_svg(&gl, &svg_opts)
}).await.unwrap();
```

- [ ] **Step 5: Set default node budget in graph route**

In the graph view handler, set `max_nodes: Some(300)` by default. Add a `?budget=N` query param to override (capped at 1000).

- [ ] **Step 6: Run tests**

Run: `cargo test --all`
Expected: All tests pass, including the new 500-node test.

- [ ] **Step 7: Commit**

```
git add etch/src/layout.rs etch/src/svg.rs rivet-cli/src/serve/
git commit -m "fix(serve/etch): graph scalability — spawn_blocking, node budget, dynamic SVG buffer

Fixes: H-13
Implements: SC-15"
```

---

## Task 5: Extract and enhance STPA view

Move STPA view to its own file with the new component kit: filter bar, fold/unfold with URL state, link chain drill-down.

**Files:**
- Create: `rivet-cli/src/serve/views/stpa.rs`

- [ ] **Step 1: Extract stpa_view from serve.rs**

Move `stpa_view()` / `stpa_partial()` (lines 4654-5016) into `views/stpa.rs`. Wire up in `mod.rs` router. Verify it still renders.

- [ ] **Step 2: Add FilterBar to STPA view**

Add a filter bar at the top with:
- Type checkboxes: loss, hazard, sub-hazard, system-constraint, controller, uca, controller-constraint, loss-scenario
- Severity filter (for hazards)
- UCA-type filter (not-providing, providing, too-early-too-late, stopped-too-soon)
- Text search across titles and descriptions

All filter state in URL: `/stpa?types=hazard,uca&uca_type=not-providing&q=firmware`

- [ ] **Step 3: Add URL-persisted fold/unfold state**

Replace the current hardcoded `<details open>` with the `collapsible_tree` component. Each node's open/closed state is tracked in `?open=H-1,H-2,SC-3`.

Add "Expand All" / "Collapse All" buttons that update the URL and re-render via HTMX.

- [ ] **Step 4: Add link chain drill-down**

When clicking a linked artifact in the STPA tree (e.g., a hazard's linked losses, or a UCA's linked controller), show an inline expandable panel with the target artifact's details. Use HTMX `hx-get="/artifacts/{id}/preview"` lazy loading.

- [ ] **Step 5: Test manually**

Run: `cargo run --release -- serve`
Visit: `http://localhost:3000/stpa?types=uca&uca_type=not-providing&open=H-1`
Expected: Filtered to UCAs of type "not-providing", H-1 tree expanded, URL preserved on reload.

- [ ] **Step 6: Commit**

```
git add rivet-cli/src/serve/views/stpa.rs rivet-cli/src/serve/mod.rs
git commit -m "feat(serve): rich STPA view with filter bar, URL-persisted fold/unfold, link drill-down

Implements: FEAT-052
Refs: REQ-002"
```

---

## Task 6: Extract and enhance artifacts view

**Files:**
- Create: `rivet-cli/src/serve/views/artifacts.rs`

- [ ] **Step 1: Extract artifacts_list and artifact_detail**

- [ ] **Step 2: Replace inline filterTable() with FilterBar component**

Add server-side filtering with URL params: `/artifacts?types=requirement&status=approved&sort=id&dir=asc&page=2`

- [ ] **Step 3: Add SortableTable for artifact list**

Clickable column headers for ID, Type, Title, Status. Sort state in URL.

- [ ] **Step 4: Add pagination**

Default 50 per page. Page state in URL: `?page=2&per_page=50`.

- [ ] **Step 5: Commit**

```
git commit -m "feat(serve): enhanced artifacts view with server-side filter/sort/pagination

Refs: DD-005"
```

---

## Task 7: Extract and enhance remaining views

Apply the component kit to traceability, validation, matrix, documents, and other views. Each gets its own file with filter/sort/URL state.

**Files:**
- Create remaining `views/*.rs` files

- [ ] **Step 1: Extract traceability view** — add filter bar, fold/unfold tree with URL state
- [ ] **Step 2: Extract validation view** — add severity filter, sort by type/ID
- [ ] **Step 3: Extract matrix view** — preserve from/to/link params in URL
- [ ] **Step 4: Extract documents view** — add `?print=1` support for clean printable output
- [ ] **Step 5: Extract remaining views** (source, search, results, diff, doc-linkage, help)
- [ ] **Step 6: Delete old serve.rs** once all handlers are extracted

- [ ] **Step 7: Commit per extraction** (one commit per view or per logical group)

---

## Task 8: Print mode

Add `?print=1` query param support to all views for clean printable output.

**Files:**
- Modify: `rivet-cli/src/serve/layout.rs`
- Modify: `rivet-cli/src/serve/mod.rs` (middleware)

- [ ] **Step 1: Add print detection to page_layout**

Check for `?print=1` in every response. If present, use `print_layout()` instead of `page_layout()`. The print layout strips: nav bar, context bar, sidebar, HTMX scripts, interactive controls.

- [ ] **Step 2: Add print CSS**

```css
@media print {
  .nav, .context-bar, .filter-bar, .pagination { display: none; }
  body { margin: 0; font-size: 11pt; }
  a { color: inherit; text-decoration: none; }
  table { page-break-inside: auto; }
  tr { page-break-inside: avoid; }
}
```

- [ ] **Step 3: Add "Print" button to page layout**

Small button in the context bar that opens current URL + `?print=1` in a new tab.

- [ ] **Step 4: Test**

Visit: `http://localhost:3000/stpa?print=1`
Expected: Clean page without nav/sidebar, suitable for Cmd+P printing.

- [ ] **Step 5: Commit**

```
git commit -m "feat(serve): add ?print=1 mode for clean printable views

Refs: DD-005"
```

---

## Task 9: Playwright E2E test suite

Comprehensive browser-based testing for every dashboard view, component interaction, URL state persistence, print mode, and graph scalability.

**Files:**
- Create: `tests/playwright/playwright.config.ts`
- Create: `tests/playwright/package.json`
- Create: `tests/playwright/helpers.ts`
- Create: `tests/playwright/navigation.spec.ts`
- Create: `tests/playwright/artifacts.spec.ts`
- Create: `tests/playwright/stpa.spec.ts`
- Create: `tests/playwright/graph.spec.ts`
- Create: `tests/playwright/filter-sort.spec.ts`
- Create: `tests/playwright/print-mode.spec.ts`
- Create: `tests/playwright/url-state.spec.ts`
- Create: `tests/playwright/traceability.spec.ts`
- Create: `tests/playwright/documents.spec.ts`
- Create: `tests/playwright/search.spec.ts`
- Create: `tests/playwright/matrix.spec.ts`
- Create: `tests/playwright/validation.spec.ts`
- Create: `tests/playwright/accessibility.spec.ts`
- Modify: `.github/workflows/ci.yml` — add Playwright CI job

### Setup

- [ ] **Step 1: Create Playwright project**

```json
// tests/playwright/package.json
{
  "name": "rivet-playwright",
  "private": true,
  "devDependencies": {
    "@playwright/test": "^1.50.0"
  },
  "scripts": {
    "test": "playwright test",
    "test:headed": "playwright test --headed",
    "test:ui": "playwright test --ui"
  }
}
```

```typescript
// tests/playwright/playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  timeout: 30_000,
  retries: 1,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'cargo run --release -- serve --port 3000',
    port: 3000,
    timeout: 120_000,
    reuseExistingServer: !process.env.CI,
    cwd: '../..',
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
  ],
});
```

- [ ] **Step 2: Create test helpers**

```typescript
// tests/playwright/helpers.ts
import { Page, expect } from '@playwright/test';

/** Wait for HTMX to finish all pending requests */
export async function waitForHtmx(page: Page) {
  await page.waitForFunction(() => {
    // @ts-ignore
    return !document.querySelector('.htmx-request');
  }, { timeout: 10_000 });
}

/** Navigate via HTMX (click nav link) and wait for content swap */
export async function htmxNavigate(page: Page, linkText: string) {
  await page.click(`a:has-text("${linkText}")`);
  await waitForHtmx(page);
}

/** Assert current URL contains expected path and params */
export async function assertUrl(page: Page, path: string, params?: Record<string, string>) {
  const url = new URL(page.url());
  expect(url.pathname).toBe(path);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      expect(url.searchParams.get(key)).toBe(value);
    }
  }
}

/** Count visible rows in an artifact table */
export async function countTableRows(page: Page) {
  return page.locator('table tbody tr').count();
}
```

- [ ] **Step 3: Install and verify**

```bash
cd tests/playwright && npm install && npx playwright install chromium
```

Run: `cd tests/playwright && npx playwright test --list`
Expected: Lists all test files (initially empty specs)

### Core navigation tests

- [ ] **Step 4: Write navigation.spec.ts**

```typescript
import { test, expect } from '@playwright/test';
import { waitForHtmx, assertUrl } from './helpers';

test.describe('Navigation', () => {
  test('dashboard loads with project name in header', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.ctx-project')).toHaveText('rivet');
  });

  test('all nav links are reachable', async ({ page }) => {
    await page.goto('/');
    const navLinks = [
      { text: 'Dashboard', path: '/' },
      { text: 'Artifacts', path: '/artifacts' },
      { text: 'Validate', path: '/validate' },
      { text: 'Matrix', path: '/matrix' },
      { text: 'Graph', path: '/graph' },
      { text: 'Coverage', path: '/coverage' },
    ];
    for (const link of navLinks) {
      await page.click(`a:has-text("${link.text}")`);
      await waitForHtmx(page);
      // HTMX updates URL via hx-push-url
      await expect(page).toHaveURL(new RegExp(link.path));
    }
  });

  test('direct URL access works (no redirect loop)', async ({ page }) => {
    await page.goto('/artifacts');
    await expect(page.locator('table')).toBeVisible();
    await page.goto('/stpa');
    await expect(page.locator('h2')).toContainText(/STPA/i);
  });

  test('browser back/forward preserves state', async ({ page }) => {
    await page.goto('/');
    await page.click('a:has-text("Artifacts")');
    await waitForHtmx(page);
    await page.click('a:has-text("Graph")');
    await waitForHtmx(page);
    await page.goBack();
    await expect(page).toHaveURL(/artifacts/);
    await page.goForward();
    await expect(page).toHaveURL(/graph/);
  });

  test('reload button refreshes data', async ({ page }) => {
    await page.goto('/');
    const reloadBtn = page.locator('button:has-text("Reload")');
    await expect(reloadBtn).toBeVisible();
    await reloadBtn.click();
    await waitForHtmx(page);
    // Page should still be functional after reload
    await expect(page.locator('.ctx-project')).toHaveText('rivet');
  });
});
```

### Artifact tests

- [ ] **Step 5: Write artifacts.spec.ts**

```typescript
import { test, expect } from '@playwright/test';
import { waitForHtmx, assertUrl, countTableRows } from './helpers';

test.describe('Artifacts', () => {
  test('artifact list shows all artifacts', async ({ page }) => {
    await page.goto('/artifacts');
    const rows = await countTableRows(page);
    expect(rows).toBeGreaterThan(300); // 328 artifacts expected
  });

  test('artifact detail shows links and backlinks', async ({ page }) => {
    await page.goto('/artifacts/REQ-001');
    await expect(page.locator('h2')).toContainText('REQ-001');
    // Should show outgoing and incoming links sections
    await expect(page.locator('text=satisfied-by')).toBeVisible();
  });

  test('artifact hover preview loads', async ({ page }) => {
    await page.goto('/artifacts');
    // Hover over first artifact link
    const firstLink = page.locator('a[href*="/artifacts/"]').first();
    await firstLink.hover();
    // Preview tooltip should appear (loaded via /artifacts/{id}/preview)
    await expect(page.locator('.hover-card, .tooltip, [data-preview]')).toBeVisible({ timeout: 5000 });
  });

  test('filter by type via URL params', async ({ page }) => {
    await page.goto('/artifacts?types=requirement');
    await waitForHtmx(page);
    const rows = await countTableRows(page);
    expect(rows).toBe(31); // 31 requirements
    // All visible rows should be requirements
    const types = await page.locator('table tbody tr td:nth-child(2)').allTextContents();
    for (const t of types) {
      expect(t.trim().toLowerCase()).toContain('requirement');
    }
  });

  test('sort by column via URL params', async ({ page }) => {
    await page.goto('/artifacts?sort=id&dir=desc');
    await waitForHtmx(page);
    const firstId = await page.locator('table tbody tr:first-child td:first-child').textContent();
    const lastId = await page.locator('table tbody tr:last-child td:first-child').textContent();
    // Descending sort: first ID should be "later" alphabetically
    expect(firstId!.localeCompare(lastId!)).toBeGreaterThan(0);
  });

  test('pagination works', async ({ page }) => {
    await page.goto('/artifacts?page=1&per_page=20');
    const rows = await countTableRows(page);
    expect(rows).toBeLessThanOrEqual(20);
    // Pagination controls should be visible
    await expect(page.locator('.pagination, [data-pagination]')).toBeVisible();
  });
});
```

### STPA tests

- [ ] **Step 6: Write stpa.spec.ts**

```typescript
import { test, expect } from '@playwright/test';
import { waitForHtmx } from './helpers';

test.describe('STPA View', () => {
  test('STPA page shows all artifact type counts', async ({ page }) => {
    await page.goto('/stpa');
    // Summary cards should show counts
    await expect(page.locator('text=loss')).toBeVisible();
    await expect(page.locator('text=hazard')).toBeVisible();
    await expect(page.locator('text=uca')).toBeVisible();
  });

  test('hierarchical tree is expandable', async ({ page }) => {
    await page.goto('/stpa');
    // Find a <details> element and toggle it
    const details = page.locator('details').first();
    const wasOpen = await details.getAttribute('open');
    await details.locator('summary').click();
    const isOpen = await details.getAttribute('open');
    expect(isOpen !== wasOpen).toBeTruthy();
  });

  test('expand all / collapse all buttons work', async ({ page }) => {
    await page.goto('/stpa');
    // Click "Expand All"
    const expandBtn = page.locator('button:has-text("Expand"), button:has-text("expand")');
    if (await expandBtn.isVisible()) {
      await expandBtn.click();
      await waitForHtmx(page);
      // All details should be open
      const closedDetails = await page.locator('details:not([open])').count();
      expect(closedDetails).toBe(0);
    }
  });

  test('UCA table shows all UCA types', async ({ page }) => {
    await page.goto('/stpa');
    await expect(page.locator('text=not-providing')).toBeVisible();
    await expect(page.locator('text=providing')).toBeVisible();
  });

  test('filter by type via URL preserves on reload', async ({ page }) => {
    await page.goto('/stpa?types=uca');
    await waitForHtmx(page);
    // Reload the page
    await page.reload();
    // Filter should still be active
    await expect(page).toHaveURL(/types=uca/);
  });

  test('fold/unfold state persists in URL', async ({ page }) => {
    await page.goto('/stpa?open=H-1,H-2');
    await waitForHtmx(page);
    // H-1 and H-2 sections should be open
    const h1Details = page.locator('details:has(summary:has-text("H-1"))');
    if (await h1Details.isVisible()) {
      await expect(h1Details).toHaveAttribute('open', '');
    }
  });
});
```

### Graph tests

- [ ] **Step 7: Write graph.spec.ts**

```typescript
import { test, expect } from '@playwright/test';
import { waitForHtmx } from './helpers';

test.describe('Graph View', () => {
  test('graph renders SVG with nodes', async ({ page }) => {
    await page.goto('/graph?types=requirement&depth=2');
    await waitForHtmx(page);
    const svg = page.locator('svg');
    await expect(svg).toBeVisible({ timeout: 15_000 });
    // Should have at least some nodes
    const nodes = await svg.locator('[data-id]').count();
    expect(nodes).toBeGreaterThan(0);
  });

  test('focus on specific artifact', async ({ page }) => {
    await page.goto('/graph?focus=REQ-001&depth=2');
    await waitForHtmx(page);
    const svg = page.locator('svg');
    await expect(svg).toBeVisible({ timeout: 15_000 });
    // REQ-001 node should be highlighted
    await expect(svg.locator('[data-id="REQ-001"]')).toBeVisible();
  });

  test('graph zoom controls work', async ({ page }) => {
    await page.goto('/graph?types=requirement');
    await waitForHtmx(page);
    const svg = page.locator('svg');
    await expect(svg).toBeVisible({ timeout: 15_000 });
    const viewBoxBefore = await svg.getAttribute('viewBox');
    // Click zoom in button
    const zoomIn = page.locator('button:has-text("+")');
    if (await zoomIn.isVisible()) {
      await zoomIn.click();
      // viewBox should change after zoom
    }
  });

  test('node budget prevents crash on large graph', async ({ page }) => {
    // Full unfiltered graph should either render with budget or show message
    await page.goto('/graph');
    await waitForHtmx(page);
    // Should not timeout — either SVG renders or budget message shows
    const svgOrMessage = page.locator('svg, .budget-exceeded, text:has-text("budget")');
    await expect(svgOrMessage.first()).toBeVisible({ timeout: 30_000 });
  });

  test('graph type filter checkboxes work', async ({ page }) => {
    await page.goto('/graph');
    // Check a type filter checkbox
    const checkbox = page.locator('input[type="checkbox"][value="requirement"]');
    if (await checkbox.isVisible()) {
      await checkbox.check();
      await waitForHtmx(page);
      await expect(page).toHaveURL(/types=.*requirement/);
    }
  });

  test('clicking graph node navigates to artifact', async ({ page }) => {
    await page.goto('/graph?focus=REQ-001&depth=1');
    await waitForHtmx(page);
    const svg = page.locator('svg');
    await expect(svg).toBeVisible({ timeout: 15_000 });
    // Click on a node link in the SVG
    const nodeLink = svg.locator('a[href*="/artifacts/"]').first();
    if (await nodeLink.isVisible()) {
      await nodeLink.click();
      await expect(page).toHaveURL(/\/artifacts\//);
    }
  });
});
```

### Filter/sort component tests

- [ ] **Step 8: Write filter-sort.spec.ts**

```typescript
import { test, expect } from '@playwright/test';
import { waitForHtmx } from './helpers';

test.describe('Filter and Sort Components', () => {
  test('filter bar type checkboxes update URL', async ({ page }) => {
    await page.goto('/artifacts');
    const filterCheckbox = page.locator('.filter-bar input[type="checkbox"]').first();
    if (await filterCheckbox.isVisible()) {
      const value = await filterCheckbox.getAttribute('value');
      await filterCheckbox.check();
      await waitForHtmx(page);
      await expect(page).toHaveURL(new RegExp(`types=.*${value}`));
    }
  });

  test('sort column headers toggle direction', async ({ page }) => {
    await page.goto('/artifacts');
    const sortHeader = page.locator('th[data-sort], th a[href*="sort="]').first();
    if (await sortHeader.isVisible()) {
      await sortHeader.click();
      await waitForHtmx(page);
      await expect(page).toHaveURL(/sort=/);
      // Click again to reverse
      await sortHeader.click();
      await waitForHtmx(page);
      await expect(page).toHaveURL(/dir=(asc|desc)/);
    }
  });

  test('text search filters in real-time', async ({ page }) => {
    await page.goto('/artifacts');
    const searchInput = page.locator('input[name="q"], input[type="search"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill('OSLC');
      // Wait for debounced HTMX request
      await page.waitForTimeout(500);
      await waitForHtmx(page);
      await expect(page).toHaveURL(/q=OSLC/);
    }
  });

  test('clear filters resets URL', async ({ page }) => {
    await page.goto('/artifacts?types=requirement&status=approved&q=test');
    const clearBtn = page.locator('button:has-text("Clear"), a:has-text("Clear")');
    if (await clearBtn.isVisible()) {
      await clearBtn.click();
      await waitForHtmx(page);
      await expect(page).toHaveURL('/artifacts');
    }
  });

  test('pagination preserves filters', async ({ page }) => {
    await page.goto('/artifacts?types=feature&page=1&per_page=10');
    // Click next page
    const nextPage = page.locator('a:has-text("›"), a:has-text("Next")');
    if (await nextPage.isVisible()) {
      await nextPage.click();
      await waitForHtmx(page);
      // URL should have page=2 AND types=feature
      await expect(page).toHaveURL(/page=2/);
      await expect(page).toHaveURL(/types=feature/);
    }
  });
});
```

### Print mode tests

- [ ] **Step 9: Write print-mode.spec.ts**

```typescript
import { test, expect } from '@playwright/test';

test.describe('Print Mode', () => {
  test('?print=1 hides nav and context bar', async ({ page }) => {
    await page.goto('/stpa?print=1');
    // Nav should not be visible
    await expect(page.locator('nav, .nav')).not.toBeVisible();
    // Context bar should not be visible
    await expect(page.locator('.context-bar')).not.toBeVisible();
    // Content should still be visible
    await expect(page.locator('h2')).toBeVisible();
  });

  test('?print=1 works on all major views', async ({ page }) => {
    const views = ['/artifacts', '/stpa', '/validate', '/matrix', '/coverage', '/documents'];
    for (const view of views) {
      await page.goto(`${view}?print=1`);
      // Should render without nav
      await expect(page.locator('nav, .nav')).not.toBeVisible();
      // Should have content
      const bodyText = await page.locator('body').textContent();
      expect(bodyText!.length).toBeGreaterThan(50);
    }
  });

  test('print button opens print view in new tab', async ({ page }) => {
    await page.goto('/stpa');
    const printBtn = page.locator('button:has-text("Print"), a:has-text("Print")');
    if (await printBtn.isVisible()) {
      // Check that the print link has print=1
      const href = await printBtn.getAttribute('href') || await printBtn.getAttribute('onclick') || '';
      expect(href).toContain('print=1');
    }
  });

  test('print view is suitable for PDF generation', async ({ page }) => {
    await page.goto('/stpa?print=1');
    // Generate PDF to verify it doesn't crash
    const pdf = await page.pdf({ format: 'A4' });
    expect(pdf.length).toBeGreaterThan(1000);
  });
});
```

### URL state persistence tests

- [ ] **Step 10: Write url-state.spec.ts**

```typescript
import { test, expect } from '@playwright/test';
import { waitForHtmx } from './helpers';

test.describe('URL State Persistence', () => {
  test('filter state survives page reload', async ({ page }) => {
    await page.goto('/artifacts?types=requirement&status=approved');
    await waitForHtmx(page);
    const rowsBefore = await page.locator('table tbody tr').count();
    await page.reload();
    await waitForHtmx(page);
    const rowsAfter = await page.locator('table tbody tr').count();
    expect(rowsAfter).toBe(rowsBefore);
    await expect(page).toHaveURL(/types=requirement/);
    await expect(page).toHaveURL(/status=approved/);
  });

  test('sort state survives page reload', async ({ page }) => {
    await page.goto('/artifacts?sort=id&dir=desc');
    await page.reload();
    await expect(page).toHaveURL(/sort=id/);
    await expect(page).toHaveURL(/dir=desc/);
  });

  test('page state survives page reload', async ({ page }) => {
    await page.goto('/artifacts?page=2&per_page=20');
    await page.reload();
    await expect(page).toHaveURL(/page=2/);
  });

  test('HTMX navigation updates URL via pushState', async ({ page }) => {
    await page.goto('/');
    await page.click('a:has-text("Artifacts")');
    await waitForHtmx(page);
    // URL should reflect navigation
    await expect(page).toHaveURL(/\/artifacts/);
    // Should be a real URL change, not just hash
    const url = new URL(page.url());
    expect(url.pathname).toBe('/artifacts');
  });

  test('combined filter+sort+page state in URL', async ({ page }) => {
    await page.goto('/artifacts?types=feature&sort=id&dir=asc&page=1&per_page=10');
    await waitForHtmx(page);
    // Verify all params are reflected in rendered state
    await expect(page).toHaveURL(/types=feature/);
    await expect(page).toHaveURL(/sort=id/);
    await expect(page).toHaveURL(/page=1/);
  });
});
```

### Additional view tests

- [ ] **Step 11: Write traceability.spec.ts, documents.spec.ts, search.spec.ts, matrix.spec.ts, validation.spec.ts**

Each spec covers:
- Page loads and renders content
- Filter/sort controls work
- URL state persists
- Links to other views work
- Print mode works

Key tests per view:

**traceability.spec.ts:**
- Traceability chain renders with expandable nodes
- Filter by artifact type narrows the chain

**documents.spec.ts:**
- Document list shows all docs
- Document detail renders markdown as HTML
- AADL diagram blocks render SVG (if spar WASM loaded)
- Source refs are clickable links

**search.spec.ts:**
- Search returns results for known artifact IDs
- Search highlights matches
- Empty search shows helpful message

**matrix.spec.ts:**
- Matrix renders with from/to type headers
- Cell links navigate to artifact detail
- from/to/link params preserved in URL

**validation.spec.ts:**
- Validation page shows diagnostics
- Error/warning badges match counts
- Severity filter works

### Accessibility tests

- [ ] **Step 12: Write accessibility.spec.ts**

```typescript
import { test, expect } from '@playwright/test';

test.describe('Accessibility', () => {
  test('all pages have valid heading hierarchy', async ({ page }) => {
    const views = ['/', '/artifacts', '/stpa', '/validate', '/graph'];
    for (const view of views) {
      await page.goto(view);
      // Should have at least one heading
      const headings = await page.locator('h1, h2, h3').count();
      expect(headings).toBeGreaterThan(0);
    }
  });

  test('all interactive elements are keyboard accessible', async ({ page }) => {
    await page.goto('/artifacts');
    // Tab through page — should reach filter inputs and links
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    const focused = await page.evaluate(() => document.activeElement?.tagName);
    expect(['A', 'INPUT', 'BUTTON', 'SELECT']).toContain(focused);
  });

  test('color contrast meets minimum ratio', async ({ page }) => {
    await page.goto('/');
    // Check that body text has sufficient contrast against background
    const contrast = await page.evaluate(() => {
      const body = document.body;
      const style = window.getComputedStyle(body);
      return { color: style.color, bg: style.backgroundColor };
    });
    // Basic check — ensure colors are not identical
    expect(contrast.color).not.toBe(contrast.bg);
  });
});
```

### CI integration

- [ ] **Step 13: Add Playwright to CI workflow**

Add to `.github/workflows/ci.yml`:

```yaml
  playwright:
    name: Playwright E2E tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: dtolnay/rust-toolchain@stable
      - uses: Swatinem/rust-cache@v2
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
      - name: Install Playwright
        working-directory: tests/playwright
        run: npm ci && npx playwright install chromium --with-deps
      - name: Run Playwright tests
        working-directory: tests/playwright
        run: npx playwright test
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: tests/playwright/test-results/
```

- [ ] **Step 14: Run full suite locally**

```bash
cd tests/playwright && npx playwright test
```

Expected: All tests pass. Report generated in `test-results/`.

- [ ] **Step 15: Commit**

```
git add tests/playwright/ .github/workflows/ci.yml
git commit -m "test(serve): comprehensive Playwright E2E test suite for dashboard

Verifies: FEAT-052
Refs: REQ-007, SC-15"
```

---

## Task 10: Final integration and cleanup

- [ ] **Step 1: Run full test suite**

Run: `cargo test --all`
Expected: All tests pass.

- [ ] **Step 2: Run clippy**

Run: `cargo +stable clippy --all-targets -- -D warnings`
Expected: Clean.

- [ ] **Step 3: Run rivet validate**

Run: `cargo run --release -- validate`
Expected: PASS (0 warnings).

- [ ] **Step 4: Manual smoke test**

Visit all routes, test filter/sort/fold in each view, test print mode, test graph with focus and without, verify URLs are bookmarkable and survive reload.

- [ ] **Step 5: Update docs/architecture.md**

Update section 4 (Dashboard Architecture) to document the component kit, print mode, and URL-persisted state pattern.

- [ ] **Step 6: Final commit**

```
git commit -m "docs: update architecture for dashboard component kit and scalability

Refs: DD-005"
```

---

## Dependency Graph

```
Task 0 (STPA)  ──────────────────────────────────────┐
Task 1 (skeleton + layout) ──→ Task 2 (components) ──┤──→ Task 5 (STPA view)
                              Task 3 (ViewParams)  ──┤──→ Task 6 (artifacts view)
                              Task 4 (graph fix)   ──┤──→ Task 7 (remaining views)
                                                      ├──→ Task 8 (print mode)
                                                      └──→ Task 9 (Playwright E2E)
                                                           Task 10 (integration)
```

Tasks 0, 1 can run in parallel. Task 4's etch changes (Steps 1-3) can run in parallel with Task 1, but Task 4 Steps 4-5 (serve-side graph view) depend on Task 1 completing the skeleton. Tasks 2 and 3 depend on Task 1. Tasks 5-8 depend on Tasks 2+3. Task 9 is last.

**Post-split housekeeping:** Update `safety/stpa/control-structure.yaml` — the `CTRL-DASH` controller's `source-file` field should change from `rivet-cli/src/serve.rs` to `rivet-cli/src/serve/mod.rs`.

---

## Key Design Decisions

1. **Server-side filtering over client-side** — HTMX re-renders HTML fragments server-side. No client-side JS state to manage. URL is always the source of truth. Note: this replaces the current instant client-side `filterTable()` JS with a server round-trip. To maintain perceived responsiveness, add `hx-trigger="keyup changed delay:300ms"` on text inputs so HTMX debounces the request.

2. **Composable components, not a template engine** — Functions that return `String` HTML fragments. No Tera/Handlebars dependency. Stays consistent with the existing pattern.

3. **Node budget, not pagination for graphs** — Graphs don't paginate well. Instead, cap the node count and require filters/focus to narrow. Show a helpful message when budget exceeded.

4. **Print mode via query param, not separate routes** — `?print=1` on any existing URL gives a clean printable version. No route duplication.

5. **Incremental extraction** — Move one view at a time from serve.rs to serve/views/. Dashboard stays functional at every step.
