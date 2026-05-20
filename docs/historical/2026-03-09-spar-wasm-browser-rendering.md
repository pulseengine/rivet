# spar-wasm Browser AADL Rendering Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Compile spar+etch to a WASI component (wasm32-wasip2) that takes AADL source and returns interactive SVG architecture diagrams, loaded in rivet's document viewer via jco transpilation, with traceability-based highlighting.

**Architecture:** A `spar-wasm` crate in the spar workspace exports a WIT `renderer` interface. It uses the full spar-hir pipeline (including salsa) since it compiles cleanly to wasm32-wasip2. The WASM component reads .aadl files via WASI filesystem, builds the instance model, converts it to a petgraph, and renders SVG via etch. On the rivet side, the document renderer detects ` ```aadl ` code blocks and emits placeholder divs. Browser JS (using jco-transpiled bindings) calls the WASM renderer and inserts the SVG. Interactive highlighting uses etch's `data-id` attributes and CSS, with link graph data provided by a rivet API endpoint.

**Tech Stack:** Rust, wasm32-wasip2, wit-bindgen, jco, wasmtime, etch, petgraph, spar-hir, spar-analysis

---

## Two repos

- **spar** (`/Volumes/Home/git/pulseengine/spar`, branch: `feat/serde-json-integration`)
- **rivet** (`/Volumes/Home/git/sdlc`, branch: `feat/aadl-integration`)

---

### Task 1: Extend WIT with renderer interface (rivet)

**Files:**
- Modify: `wit/adapter.wit`

**Step 1: Add the renderer interface to the WIT file**

After the existing `adapter` interface, add:

```wit
/// Renderer interface for producing SVG visualizations.
///
/// Unlike the adapter interface (which imports/exports artifacts),
/// the renderer takes a root classifier and produces SVG output.
/// It reads source files via WASI filesystem.
interface renderer {
    /// Render an AADL architecture diagram as SVG.
    ///
    /// `root` — classifier to instantiate (e.g., "FlightControl::Controller.Basic")
    /// `highlight` — artifact IDs to visually emphasize in the diagram
    /// Returns SVG string on success.
    render: func(root: string, highlight: list<string>) -> result<string, render-error>;

    /// Errors specific to rendering.
    variant render-error {
        parse-error(string),
        no-root(string),
        layout-error(string),
    }
}

/// Extended world that includes both adapter and renderer capabilities.
world spar-component {
    export adapter;
    export renderer;
}
```

**Step 2: Verify the WIT is syntactically valid**

Run: `wasm-tools parse wit/adapter.wit` (or just `cargo check` later — wasmtime will validate)

**Step 3: Commit**

```bash
git add wit/adapter.wit
git commit -m "feat(wit): add renderer interface for SVG visualization"
```

---

### Task 2: Create spar-wasm crate scaffolding (spar)

**Files:**
- Create: `crates/spar-wasm/Cargo.toml`
- Create: `crates/spar-wasm/src/lib.rs`
- Modify: `Cargo.toml` (workspace members)

**Step 1: Create Cargo.toml**

```toml
[package]
name = "spar-wasm"
version.workspace = true
edition.workspace = true
license.workspace = true
repository.workspace = true
description = "WASM component for AADL parsing, analysis, and SVG rendering"

[dependencies]
spar-parser.workspace = true
spar-syntax.workspace = true
spar-base-db.workspace = true
spar-hir-def.workspace = true
spar-hir.workspace = true
spar-analysis.workspace = true
serde.workspace = true
serde_json = "1"
petgraph = "0.6"
```

Note: etch is in the rivet workspace, not spar. We'll vendor the graph-building + SVG rendering logic directly in spar-wasm since it's a small amount of code and avoids cross-workspace dependency. The SVG output uses etch's format so it's compatible with rivet's existing interactive JS.

**Step 2: Create minimal lib.rs**

```rust
//! WASM component for AADL architecture visualization.
//!
//! Provides two capabilities as a WASI component:
//! 1. `adapter` — import/export AADL artifacts (same as CLI JSON output)
//! 2. `renderer` — parse AADL, instantiate, and render SVG via graph layout
//!
//! The component reads `.aadl` files via WASI filesystem and uses the full
//! spar-hir pipeline (including salsa) for semantic analysis.

mod graph;
mod render;
```

**Step 3: Add to workspace**

Add `"crates/spar-wasm"` to the `members` list in the root `Cargo.toml`.

**Step 4: Verify it compiles**

Run: `cargo check -p spar-wasm`

**Step 5: Commit**

```bash
git add crates/spar-wasm/ Cargo.toml
git commit -m "feat(spar-wasm): scaffold WASM component crate"
```

---

### Task 3: Instance model to petgraph conversion (spar)

**Files:**
- Create: `crates/spar-wasm/src/graph.rs`
- Modify: `crates/spar-wasm/src/lib.rs` (add test)

This module converts a `SystemInstance` (arena-based) into a `petgraph::Graph` suitable for layout.

**Step 1: Write the failing test**

In `crates/spar-wasm/src/graph.rs`:

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn instance_to_graph_basic() {
        // Build a minimal SystemInstance with 2 components and 1 connection
        use spar_hir_def::instance::*;
        use spar_hir_def::item_tree::{ComponentCategory, ConnectionKind, Direction, FeatureKind};
        use spar_hir_def::name::Name;
        use la_arena::Arena;

        let mut components = Arena::new();
        let mut features = Arena::new();
        let mut connections = Arena::new();

        let root = components.alloc(ComponentInstance {
            name: Name::new("Root"),
            category: ComponentCategory::System,
            package: Name::new("Pkg"),
            type_name: Name::new("Root"),
            impl_name: Some(Name::new("Root.Impl")),
            parent: None,
            children: Vec::new(),
            features: Vec::new(),
            connections: Vec::new(),
            diagnostics: Vec::new(),
        });

        let child = components.alloc(ComponentInstance {
            name: Name::new("sub1"),
            category: ComponentCategory::Process,
            package: Name::new("Pkg"),
            type_name: Name::new("Sub"),
            impl_name: None,
            parent: Some(root),
            children: Vec::new(),
            features: Vec::new(),
            connections: Vec::new(),
            diagnostics: Vec::new(),
        });

        // Update root's children
        components[root].children.push(child);

        let instance = SystemInstance {
            root,
            components,
            features,
            connections,
        };

        let (graph, node_map) = build_graph(&instance);
        assert_eq!(graph.node_count(), 2);
        assert!(node_map.contains_key(&root));
        assert!(node_map.contains_key(&child));
    }
}
```

**Step 2: Run test to verify it fails**

Run: `cargo test -p spar-wasm -- instance_to_graph_basic`
Expected: FAIL (build_graph not defined)

**Step 3: Implement graph building**

```rust
//! Convert a SystemInstance into a petgraph for layout.

use std::collections::HashMap;

use petgraph::Graph;
use petgraph::graph::NodeIndex;
use spar_hir_def::instance::{ComponentInstanceIdx, SystemInstance};
use spar_hir_def::item_tree::ComponentCategory;

/// Node data for the architecture graph.
#[derive(Debug, Clone)]
pub struct ArchNode {
    pub id: String,
    pub label: String,
    pub category: ComponentCategory,
    pub sublabel: Option<String>,
}

/// Edge data for the architecture graph.
#[derive(Debug, Clone)]
pub struct ArchEdge {
    pub label: String,
}

/// Build a petgraph from a SystemInstance.
///
/// Returns the graph and a map from ComponentInstanceIdx to NodeIndex.
pub fn build_graph(
    instance: &SystemInstance,
) -> (Graph<ArchNode, ArchEdge>, HashMap<ComponentInstanceIdx, NodeIndex>) {
    let mut graph = Graph::new();
    let mut node_map = HashMap::new();

    // Add all components as nodes (recursive)
    add_component_nodes(instance, instance.root, &mut graph, &mut node_map);

    // Add connections as edges
    for (_ci_idx, ci) in instance.components.iter() {
        for &conn_idx in &ci.connections {
            let conn = instance.connection(conn_idx);
            if let (Some(src), Some(dst)) = (conn.source_component, conn.dest_component) {
                if let (Some(&src_node), Some(&dst_node)) = (node_map.get(&src), node_map.get(&dst)) {
                    graph.add_edge(src_node, dst_node, ArchEdge {
                        label: conn.name.as_str().to_string(),
                    });
                }
            }
        }
    }

    (graph, node_map)
}

fn add_component_nodes(
    instance: &SystemInstance,
    idx: ComponentInstanceIdx,
    graph: &mut Graph<ArchNode, ArchEdge>,
    node_map: &mut HashMap<ComponentInstanceIdx, NodeIndex>,
) {
    let comp = instance.component(idx);
    let id = format!("AADL-{}-{}", comp.package.as_str(), comp.name.as_str());

    let node = ArchNode {
        id,
        label: comp.name.as_str().to_string(),
        category: comp.category,
        sublabel: Some(format!("{:?}", comp.category)),
    };

    let ni = graph.add_node(node);
    node_map.insert(idx, ni);

    for &child_idx in &comp.children {
        add_component_nodes(instance, child_idx, graph, node_map);
        if let Some(&child_ni) = node_map.get(&child_idx) {
            graph.add_edge(ni, child_ni, ArchEdge {
                label: "contains".into(),
            });
        }
    }
}
```

**Step 4: Run test to verify it passes**

Run: `cargo test -p spar-wasm -- instance_to_graph_basic`
Expected: PASS

**Step 5: Commit**

```bash
git add crates/spar-wasm/src/graph.rs
git commit -m "feat(spar-wasm): add instance model to petgraph conversion"
```

---

### Task 4: SVG render function (spar)

**Files:**
- Create: `crates/spar-wasm/src/render.rs`

This is the main entry point: AADL source text to SVG string. It uses spar-hir's Database for full semantic analysis, then builds the graph and renders SVG.

Since etch is in a different workspace, we inline a minimal Sugiyama layout + SVG renderer here. The SVG format matches etch's output (same CSS classes, data-id attributes) so rivet's existing interactive JS works.

**Alternative (preferred if feasible):** Add etch as a git dependency in spar-wasm's Cargo.toml:
```toml
etch = { git = "https://github.com/pulseengine/sdlc.git", path = "etch" }
```

**Step 1: Write the failing test**

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn render_basic_aadl() {
        let source = r#"
package FlightControl
public
  system Controller
    features
      sensorIn: in data port;
  end Controller;

  system implementation Controller.Basic
    subcomponents
      nav: process NavProcess;
  end Controller.Basic;

  process NavProcess
  end NavProcess;
end FlightControl;
"#;
        let svg = render_aadl(source, "FlightControl::Controller.Basic", &[]).unwrap();
        assert!(svg.contains("<svg"));
        assert!(svg.contains("</svg>"));
        assert!(svg.contains("data-id")); // interactive
    }

    #[test]
    fn render_with_highlight() {
        let source = r#"
package Pkg
public
  system S end S;
  system implementation S.I
    subcomponents
      sub1: process P;
  end S.I;
  process P end P;
end Pkg;
"#;
        let svg = render_aadl(source, "Pkg::S.I", &["AADL-Pkg-sub1".into()]).unwrap();
        assert!(svg.contains("stroke-width=\"3")); // highlighted node
    }
}
```

**Step 2: Run test to verify it fails**

Run: `cargo test -p spar-wasm -- render_basic_aadl`
Expected: FAIL

**Step 3: Implement render_aadl**

```rust
//! Top-level render function: AADL source to SVG.

use spar_hir::Database;
use crate::graph::{build_graph};

/// Render AADL source into an SVG architecture diagram.
///
/// - `source` -- AADL source text (one or more packages)
/// - `root` -- classifier to instantiate (e.g., "Pkg::Type.Impl")
/// - `highlight` -- artifact IDs to visually highlight
pub fn render_aadl(
    source: &str,
    root: &str,
    highlight: &[String],
) -> Result<String, RenderError> {
    // 1. Parse and build semantic model
    let db = Database::from_aadl(&[("input.aadl".into(), source.into())]);

    // 2. Instantiate
    let instance = db.instantiate(root)
        .map_err(|e| RenderError::NoRoot(format!("{}: {}", root, e)))?;

    // 3. Build graph
    let (graph, _node_map) = build_graph(&instance);

    // 4. Layout + render SVG (inline minimal Sugiyama)
    render_graph_to_svg(&graph, highlight)
}

#[derive(Debug)]
pub enum RenderError {
    ParseError(String),
    NoRoot(String),
    LayoutError(String),
}
```

The `render_graph_to_svg` function builds SVG matching etch's format:
- CSS classes: `.node`, `.edge`, `.type-{category}`
- `data-id` on every node (matching rivet artifact IDs like `AADL-Pkg-Name`)
- Highlighted nodes get `stroke-width: 3` and `stroke: #ff6600`

**Step 4: Run tests**

Run: `cargo test -p spar-wasm`
Expected: PASS

**Step 5: Commit**

```bash
git add crates/spar-wasm/src/render.rs
git commit -m "feat(spar-wasm): add AADL source to SVG render pipeline"
```

---

### Task 5: WASM build + verify (spar)

**Step 1: Verify wasm32-wasip2 compilation**

Run: `cargo build --target wasm32-wasip2 -p spar-wasm`

**Step 2: Check binary size**

Run: `ls -lh target/wasm32-wasip2/debug/spar_wasm.wasm`

**Step 3: Commit any build fixes**

---

### Task 6: rivet document renderer -- detect aadl code blocks (rivet)

**Files:**
- Modify: `rivet-core/src/document.rs`

**Step 1: Write the failing test**

```rust
#[test]
fn render_aadl_code_block_placeholder() {
    let content = "---\nid: DOC-001\ntitle: Architecture\n---\n\n## Overview\n\n```aadl\nroot: FlightControl::Controller.Basic\n```\n\nSome text after.\n";
    let doc = parse_document(content, None).unwrap();
    let html = render_to_html(&doc, |_| true);
    assert!(html.contains("aadl-diagram"));
    assert!(html.contains("data-root=\"FlightControl::Controller.Basic\""));
    // Should NOT contain pre/code for aadl blocks
    assert!(!html.contains("<pre><code>root: FlightControl"));
}
```

**Step 2: Run test to verify it fails**

Run: `cargo test -p rivet-core -- render_aadl_code_block_placeholder`
Expected: FAIL (currently renders as `<pre><code>`)

**Step 3: Modify render_to_html to detect aadl blocks**

In the opening fence handler (line ~308), capture the language tag:

```rust
// When opening a fenced code block, capture the language tag
if trimmed.starts_with("```") {
    if in_code_block {
        if code_block_lang.as_deref() == Some("aadl") {
            // Emit AADL diagram placeholder instead of code block
            let root = code_block_lines.iter()
                .find_map(|l| l.strip_prefix("root:").or_else(|| l.strip_prefix("root :")))
                .map(|s| s.trim())
                .unwrap_or("");
            html.push_str(&format!(
                "<div class=\"aadl-diagram\" data-root=\"{}\">\
                 <p class=\"aadl-loading\">Loading AADL diagram...</p></div>\n",
                html_escape(root)
            ));
        } else {
            html.push_str("<pre><code>");
            html.push_str(&code_block_lines.join("\n"));
            html.push_str("</code></pre>\n");
        }
        code_block_lines.clear();
        code_block_lang = None;
        in_code_block = false;
    } else {
        // ... close open blocks ...
        code_block_lang = trimmed.strip_prefix("```").map(|s| s.trim().to_string());
        in_code_block = true;
    }
    continue;
}
```

Add `let mut code_block_lang: Option<String> = None;` at the top of the function.

**Step 4: Run test to verify it passes**

Run: `cargo test -p rivet-core -- render_aadl_code_block_placeholder`
Expected: PASS

**Step 5: Commit**

```bash
git add rivet-core/src/document.rs
git commit -m "feat(document): detect aadl code blocks and emit diagram placeholders"
```

---

### Task 7: rivet API endpoint for artifact links (rivet)

**Files:**
- Modify: `rivet-cli/src/serve.rs`

This endpoint returns the linked AADL component IDs for a given artifact, so the browser JS knows what to highlight.

**Step 1: Add the endpoint**

```rust
// Route:
.route("/api/links/{id}", get(api_artifact_links))

// Handler:
async fn api_artifact_links(
    State(state): State<SharedState>,
    Path(id): Path<String>,
) -> axum::Json<Vec<String>> {
    let state = state.read().await;
    let graph = &state.graph;

    let mut linked_ids = Vec::new();

    // Forward links from this artifact
    for link in graph.links_from(&id) {
        if link.target.starts_with("AADL-") {
            linked_ids.push(link.target.clone());
        }
    }

    // Backlinks to this artifact
    for bl in graph.backlinks_to(&id) {
        if bl.source.starts_with("AADL-") {
            linked_ids.push(bl.source.clone());
        }
    }

    // If this IS an AADL artifact, include self
    if id.starts_with("AADL-") {
        linked_ids.push(id);
    }

    axum::Json(linked_ids)
}
```

**Step 2: Commit**

```bash
git add rivet-cli/src/serve.rs
git commit -m "feat(serve): add /api/links/{id} endpoint for diagram highlighting"
```

---

### Task 8: rivet serve -- JS for WASM loading + rendering + highlighting (rivet)

**Files:**
- Modify: `rivet-cli/src/serve.rs` (inline JS in the dashboard)

**Step 1: Add AADL diagram initialization JS**

In the main `<script>` block of the dashboard, add JS that:
- Finds all `.aadl-diagram` placeholders on the page
- Fetches rendered SVG from `/api/render-aadl?root=...`
- Inserts the SVG using safe DOM manipulation (not raw HTML insertion)
- Sets up click handlers on SVG nodes with `data-id` for artifact navigation
- Exposes `window.highlightAadlNodes(ids)` for traceability highlighting

**Step 2: Add CSS for AADL diagram containers**

```css
.aadl-diagram{background:var(--card-bg);border:1px solid var(--border);border-radius:8px;padding:1rem;margin:1rem 0}
.aadl-diagram svg{width:100%;height:auto;max-height:600px}
.aadl-loading{color:var(--text-secondary);font-style:italic}
.aadl-error{color:var(--danger);font-style:italic}
```

**Step 3: Add server-side render endpoint scaffold**

```rust
.route("/api/render-aadl", get(api_render_aadl))
```

This is a placeholder -- full implementation uses spar-wasm once the WASM component is built and transpiled with jco.

**Step 4: Commit**

```bash
git add rivet-cli/src/serve.rs
git commit -m "feat(serve): add AADL diagram JS, CSS, and render endpoint scaffold"
```

---

### Task 9: Integration test -- end-to-end document with AADL diagram (rivet)

**Files:**
- Modify: `rivet-core/tests/integration.rs`

**Step 1: Write the test**

```rust
#[test]
fn document_with_aadl_block_renders_placeholder() {
    let doc_content = r#"---
id: DOC-ARCH
title: System Architecture
---

## Flight Control Architecture

The system uses the following AADL architecture:

```aadl
root: FlightControl::Controller.Basic
```

This design satisfies [[SYSREQ-001]].
"#;

    let doc = rivet_core::document::parse_document(doc_content, None).unwrap();
    let html = rivet_core::document::render_to_html(&doc, |id| id == "SYSREQ-001");

    // AADL block becomes a diagram placeholder
    assert!(html.contains("class=\"aadl-diagram\""));
    assert!(html.contains("data-root=\"FlightControl::Controller.Basic\""));

    // Wiki-link still resolves
    assert!(html.contains("SYSREQ-001"));

    // Other text renders normally
    assert!(html.contains("Flight Control Architecture"));
}
```

**Step 2: Run test**

Run: `cargo test -p rivet-core -- document_with_aadl_block`
Expected: PASS (after Task 6)

**Step 3: Commit**

```bash
git add rivet-core/tests/integration.rs
git commit -m "test: add integration test for AADL diagram placeholder in documents"
```

---

### Task 10: Update artifact detail to embed link data for highlighting (rivet)

**Files:**
- Modify: `rivet-cli/src/serve.rs` (artifact_detail function)

**Step 1: Add linked AADL IDs as data attribute**

In the `artifact_detail` handler (around line 2016), after rendering the backlinks section, embed a script tag with linked AADL component IDs so the diagram highlighting JS can use them:

```rust
// After the backlinks section
let mut aadl_links = Vec::new();
for link in &artifact.links {
    if link.target.starts_with("AADL-") {
        aadl_links.push(link.target.clone());
    }
}
for bl in graph.backlinks_to(&id) {
    if bl.source.starts_with("AADL-") {
        aadl_links.push(bl.source.clone());
    }
}
if id.starts_with("AADL-") {
    aadl_links.push(id.clone());
}
if !aadl_links.is_empty() {
    let json = serde_json::to_string(&aadl_links).unwrap_or_default();
    html.push_str(&format!(
        "<script>if(window.highlightAadlNodes)highlightAadlNodes({});</script>",
        json
    ));
}
```

**Step 2: Commit**

```bash
git add rivet-cli/src/serve.rs
git commit -m "feat(serve): embed AADL link data in artifact detail for diagram highlighting"
```
