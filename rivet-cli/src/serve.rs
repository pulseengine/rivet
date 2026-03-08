use std::collections::{BTreeMap, HashMap};
use std::sync::Arc;

use anyhow::Result;
use axum::Router;
use axum::extract::{Path, Query, State};
use axum::response::Html;
use axum::routing::get;
use petgraph::graph::{Graph, NodeIndex};
use petgraph::visit::EdgeRef;

use etch::filter::ego_subgraph;
use etch::layout::{self as pgv_layout, EdgeInfo, LayoutOptions, NodeInfo};
use etch::svg::{SvgOptions, render_svg};
use rivet_core::coverage;
use rivet_core::document::{self, DocumentStore};
use rivet_core::links::LinkGraph;
use rivet_core::matrix::{self, Direction};
use rivet_core::schema::{Schema, Severity};
use rivet_core::store::Store;
use rivet_core::validate;

/// Shared application state loaded once at startup.
struct AppState {
    store: Store,
    schema: Schema,
    graph: LinkGraph,
    doc_store: DocumentStore,
}

/// Start the axum HTTP server on the given port.
pub async fn run(
    store: Store,
    schema: Schema,
    graph: LinkGraph,
    doc_store: DocumentStore,
    port: u16,
) -> Result<()> {
    let state = Arc::new(AppState {
        store,
        schema,
        graph,
        doc_store,
    });

    let app = Router::new()
        .route("/", get(index))
        .route("/artifacts", get(artifacts_list))
        .route("/artifacts/{id}", get(artifact_detail))
        .route("/artifacts/{id}/graph", get(artifact_graph))
        .route("/validate", get(validate_view))
        .route("/matrix", get(matrix_view))
        .route("/graph", get(graph_view))
        .route("/stats", get(stats_view))
        .route("/coverage", get(coverage_view))
        .route("/documents", get(documents_list))
        .route("/documents/{id}", get(document_detail))
        .route("/search", get(search_view))
        .with_state(state);

    let addr = format!("0.0.0.0:{port}");
    eprintln!("rivet dashboard listening on http://localhost:{port}");

    let listener = tokio::net::TcpListener::bind(&addr).await?;
    axum::serve(listener, app).await?;
    Ok(())
}

// ── Color palette ────────────────────────────────────────────────────────

fn type_color_map() -> HashMap<String, String> {
    let pairs: &[(&str, &str)] = &[
        // STPA
        ("loss", "#dc3545"),
        ("hazard", "#fd7e14"),
        ("system-constraint", "#20c997"),
        ("controller", "#6f42c1"),
        ("uca", "#e83e8c"),
        ("control-action", "#17a2b8"),
        ("feedback", "#6610f2"),
        ("causal-factor", "#d63384"),
        ("safety-constraint", "#20c997"),
        ("loss-scenario", "#e83e8c"),
        // ASPICE
        ("stakeholder-req", "#0d6efd"),
        ("system-req", "#0dcaf0"),
        ("system-architecture", "#198754"),
        ("sw-req", "#198754"),
        ("sw-architecture", "#0d6efd"),
        ("sw-detailed-design", "#6610f2"),
        ("sw-unit", "#6f42c1"),
        ("system-verification", "#6610f2"),
        ("sw-verification", "#6610f2"),
        ("system-integration-verification", "#6610f2"),
        ("sw-integration-verification", "#6610f2"),
        ("sw-unit-verification", "#6610f2"),
        ("qualification-verification", "#6610f2"),
        // Dev
        ("requirement", "#0d6efd"),
        ("design-decision", "#198754"),
        ("feature", "#6f42c1"),
        // Cybersecurity
        ("asset", "#ffc107"),
        ("threat", "#dc3545"),
        ("cybersecurity-req", "#fd7e14"),
        ("vulnerability", "#e83e8c"),
        ("attack-path", "#dc3545"),
        ("cybersecurity-goal", "#0d6efd"),
        ("cybersecurity-control", "#198754"),
        ("security-verification", "#6610f2"),
        ("risk-assessment", "#fd7e14"),
        ("security-event", "#e83e8c"),
    ];
    pairs
        .iter()
        .map(|(k, v)| (k.to_string(), v.to_string()))
        .collect()
}

/// Return a colored badge `<span>` for an artifact type.
///
/// Uses the `type_color_map` hex color as text and computes a 12%-opacity
/// tinted background from it.
fn badge_for_type(type_name: &str) -> String {
    let colors = type_color_map();
    let hex = colors
        .get(type_name)
        .map(|s| s.as_str())
        .unwrap_or("#5b2d9e");
    // Parse hex → rgb
    let hex_digits = hex.trim_start_matches('#');
    let r = u8::from_str_radix(&hex_digits[0..2], 16).unwrap_or(91);
    let g = u8::from_str_radix(&hex_digits[2..4], 16).unwrap_or(45);
    let b = u8::from_str_radix(&hex_digits[4..6], 16).unwrap_or(158);
    format!(
        "<span class=\"badge\" style=\"background:rgba({r},{g},{b},.12);color:{hex};font-family:var(--mono);font-size:.72rem\">{}</span>",
        html_escape(type_name)
    )
}

// ── CSS ──────────────────────────────────────────────────────────────────

const CSS: &str = r#"
/* ── Reset & base ─────────────────────────────────────────────── */
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:     #f5f5f7;
  --surface:#fff;
  --sidebar:#0f0f13;
  --sidebar-hover:#1c1c24;
  --sidebar-text:#9898a6;
  --sidebar-active:#fff;
  --text:   #1d1d1f;
  --text-secondary:#6e6e73;
  --border: #e5e5ea;
  --accent: #3a86ff;
  --accent-hover:#2568d6;
  --radius: 10px;
  --radius-sm:6px;
  --shadow: 0 1px 3px rgba(0,0,0,.06),0 1px 2px rgba(0,0,0,.04);
  --shadow-md:0 4px 12px rgba(0,0,0,.06),0 1px 3px rgba(0,0,0,.04);
  --mono: 'JetBrains Mono','Fira Code','SF Mono',Menlo,monospace;
  --font: 'Atkinson Hyperlegible',system-ui,-apple-system,sans-serif;
  --transition:180ms ease;
}
html{-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;text-rendering:optimizeLegibility}
body{font-family:var(--font);color:var(--text);background:var(--bg);line-height:1.6;font-size:15px}

/* ── Links ────────────────────────────────────────────────────── */
a{color:var(--accent);text-decoration:none;transition:color var(--transition)}
a:hover{color:var(--accent-hover)}
a:focus-visible{outline:2px solid var(--accent);outline-offset:2px;border-radius:3px}

/* ── Shell layout ─────────────────────────────────────────────── */
.shell{display:flex;min-height:100vh}

/* ── Sidebar navigation ──────────────────────────────────────── */
nav{width:232px;background:var(--sidebar);color:var(--sidebar-text);
    padding:1.75rem 1rem;flex-shrink:0;display:flex;flex-direction:column;
    position:sticky;top:0;height:100vh;overflow-y:auto;
    border-right:1px solid rgba(255,255,255,.06)}
nav h1{font-size:1.05rem;font-weight:700;color:var(--sidebar-active);
       margin-bottom:2rem;letter-spacing:.04em;padding:0 .75rem;
       display:flex;align-items:center;gap:.5rem}
nav h1::before{content:'';display:inline-block;width:8px;height:8px;
               border-radius:50%;background:var(--accent);flex-shrink:0}
nav ul{list-style:none;display:flex;flex-direction:column;gap:2px}
nav li{margin:0}
nav a{display:flex;align-items:center;gap:.5rem;padding:.5rem .75rem;border-radius:var(--radius-sm);
      color:var(--sidebar-text);font-size:.875rem;font-weight:500;
      transition:all var(--transition)}
nav a:hover{background:var(--sidebar-hover);color:var(--sidebar-active);text-decoration:none}
nav a.active{background:rgba(58,134,255,.08);color:var(--sidebar-active);border-left:2px solid var(--accent);padding-left:calc(.75rem - 2px)}
nav a:focus-visible{outline:2px solid var(--accent);outline-offset:-2px}

/* ── Main content ─────────────────────────────────────────────── */
main{flex:1;padding:2.5rem 3rem;max-width:1400px;min-width:0}
main.htmx-swapping{opacity:.4;transition:opacity 150ms ease-out}
main.htmx-settling{opacity:1;transition:opacity 200ms ease-in}

/* ── Loading bar ──────────────────────────────────────────────── */
#loading-bar{position:fixed;top:0;left:0;width:0;height:2px;background:var(--accent);
             z-index:9999;transition:none;pointer-events:none}
#loading-bar.active{width:85%;transition:width 8s cubic-bezier(.1,.05,.1,1)}
#loading-bar.done{width:100%;transition:width 100ms ease;opacity:0;transition:width 100ms ease,opacity 300ms ease 100ms}

/* ── Typography ───────────────────────────────────────────────── */
h2{font-size:1.4rem;font-weight:700;margin-bottom:1.25rem;color:var(--text);letter-spacing:-.01em;padding-bottom:.75rem;border-bottom:1px solid var(--border)}
h3{font-size:1.05rem;font-weight:600;margin:1.5rem 0 .75rem;color:var(--text)}
code,pre{font-family:var(--mono);font-size:.85em}
pre{background:#f1f1f3;padding:1rem;border-radius:var(--radius-sm);overflow-x:auto}

/* ── Tables ───────────────────────────────────────────────────── */
table{width:100%;border-collapse:collapse;margin-bottom:1.5rem;font-size:.9rem}
th,td{text-align:left;padding:.65rem .875rem}
th{font-weight:600;font-size:.75rem;text-transform:uppercase;letter-spacing:.06em;
   color:var(--text-secondary);border-bottom:2px solid var(--border);background:transparent}
td{border-bottom:1px solid var(--border)}
tbody tr{transition:background var(--transition)}
tbody tr:nth-child(even){background:rgba(0,0,0,.015)}
tbody tr:hover{background:rgba(58,134,255,.04)}
td a{font-family:var(--mono);font-size:.85rem;font-weight:500}

/* ── Badges ───────────────────────────────────────────────────── */
.badge{display:inline-flex;align-items:center;padding:.2rem .55rem;border-radius:5px;
       font-size:.73rem;font-weight:600;letter-spacing:.02em;line-height:1.4;white-space:nowrap}
.badge-error{background:#fee;color:#c62828}
.badge-warn{background:#fff8e1;color:#8b6914}
.badge-info{background:#e8f4fd;color:#0c5a82}
.badge-ok{background:#e6f9ed;color:#15713a}
.badge-type{background:#f0ecf9;color:#5b2d9e;font-family:var(--mono);font-size:.72rem}

/* ── Validation bar ──────────────────────────────────────────── */
.validation-bar{padding:1rem 1.25rem;border-radius:var(--radius);margin-bottom:1.25rem;font-weight:600;font-size:.95rem}
.validation-bar.pass{background:linear-gradient(135deg,#e6f9ed,#d4f5e0);color:#15713a;border:1px solid #b8e8c8}
.validation-bar.fail{background:linear-gradient(135deg,#fee,#fdd);color:#c62828;border:1px solid #f4c7c3}

/* ── Status progress bars ────────────────────────────────────── */
.status-bar-row{display:flex;align-items:center;gap:.75rem;margin-bottom:.5rem;font-size:.85rem}
.status-bar-label{width:80px;text-align:right;font-weight:500;color:var(--text-secondary)}
.status-bar-track{flex:1;height:20px;background:#e5e5ea;border-radius:4px;overflow:hidden;position:relative}
.status-bar-fill{height:100%;border-radius:4px;transition:width .3s ease}
.status-bar-count{width:40px;font-variant-numeric:tabular-nums;color:var(--text-secondary)}

/* ── Cards ────────────────────────────────────────────────────── */
.card{background:var(--surface);border-radius:var(--radius);padding:1.5rem;
      margin-bottom:1.25rem;box-shadow:var(--shadow);border:1px solid var(--border);
      transition:box-shadow var(--transition)}

/* ── Stat grid ────────────────────────────────────────────────── */
.stat-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:1rem;margin-bottom:1.75rem}
.stat-box{background:var(--surface);border-radius:var(--radius);padding:1.25rem 1rem;text-align:center;
          box-shadow:var(--shadow);border:1px solid var(--border);transition:box-shadow var(--transition),transform var(--transition);
          border-top:3px solid var(--border)}
.stat-box:hover{box-shadow:var(--shadow-md);transform:translateY(-1px)}
.stat-box .number{font-size:2rem;font-weight:800;letter-spacing:-.02em;
                  font-variant-numeric:tabular-nums;line-height:1.2}
.stat-box .label{font-size:.8rem;font-weight:500;color:var(--text-secondary);margin-top:.25rem;
                 text-transform:uppercase;letter-spacing:.04em}
.stat-blue{border-top-color:#3a86ff}.stat-blue .number{color:#3a86ff}
.stat-green{border-top-color:#15713a}.stat-green .number{color:#15713a}
.stat-orange{border-top-color:#e67e22}.stat-orange .number{color:#e67e22}
.stat-red{border-top-color:#c62828}.stat-red .number{color:#c62828}
.stat-amber{border-top-color:#b8860b}.stat-amber .number{color:#b8860b}
.stat-purple{border-top-color:#6f42c1}.stat-purple .number{color:#6f42c1}

/* ── Link pills ───────────────────────────────────────────────── */
.link-pill{display:inline-block;padding:.15rem .45rem;border-radius:4px;
           font-size:.76rem;font-family:var(--mono);background:#f0f0f3;
           color:var(--text-secondary);margin:.1rem;font-weight:500}

/* ── Forms ────────────────────────────────────────────────────── */
.form-row{display:flex;gap:1rem;align-items:end;flex-wrap:wrap;margin-bottom:1rem}
.form-row label{font-size:.8rem;font-weight:600;color:var(--text-secondary);
                text-transform:uppercase;letter-spacing:.04em}
.form-row select,.form-row input[type="text"],.form-row input[type="search"],
.form-row input:not([type]),.form-row input[list]{
  padding:.5rem .75rem;border:1px solid var(--border);border-radius:var(--radius-sm);
  font-size:.875rem;font-family:var(--font);background:var(--surface);color:var(--text);
  transition:border-color var(--transition),box-shadow var(--transition);appearance:none;
  -webkit-appearance:none}
.form-row select{padding-right:2rem;background-image:url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%236e6e73' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat:no-repeat;background-position:right .75rem center}
.form-row input:focus,.form-row select:focus{
  outline:none;border-color:var(--accent);box-shadow:0 0 0 3px rgba(58,134,255,.15)}
.form-row input[type="range"]{padding:0;border:none;accent-color:var(--accent);width:100%}
.form-row input[type="range"]:focus{box-shadow:none}
.form-row button{padding:.5rem 1.25rem;background:var(--accent);color:#fff;border:none;
                 border-radius:var(--radius-sm);font-size:.875rem;font-weight:600;
                 font-family:var(--font);cursor:pointer;transition:all var(--transition);
                 box-shadow:0 1px 2px rgba(0,0,0,.08)}
.form-row button:hover{background:var(--accent-hover);box-shadow:0 2px 6px rgba(58,134,255,.25);transform:translateY(-1px)}
.form-row button:active{transform:translateY(0)}
.form-row button:focus-visible{outline:2px solid var(--accent);outline-offset:2px}

/* ── Definition lists ─────────────────────────────────────────── */
dl{margin:.75rem 0}
dt{font-weight:600;font-size:.8rem;color:var(--text-secondary);margin-top:.75rem;
   text-transform:uppercase;letter-spacing:.04em}
dd{margin-left:0;margin-bottom:.25rem;margin-top:.2rem}

/* ── Meta text ────────────────────────────────────────────────── */
.meta{color:var(--text-secondary);font-size:.85rem}

/* ── Nav icons & badges ───────────────────────────────────────── */
.nav-icon{display:inline-flex;width:1.25rem;height:1.25rem;align-items:center;justify-content:center;flex-shrink:0;opacity:.5}
nav a:hover .nav-icon,nav a.active .nav-icon{opacity:.9}
.nav-label{display:flex;align-items:center;gap:.5rem;flex:1;min-width:0}
.nav-badge{font-size:.65rem;font-weight:700;padding:.1rem .4rem;border-radius:4px;
           background:rgba(255,255,255,.08);color:rgba(255,255,255,.4);margin-left:auto;flex-shrink:0}
.nav-badge-error{background:rgba(220,53,69,.2);color:#ff6b7a}
nav .nav-divider{height:1px;background:rgba(255,255,255,.06);margin:.75rem .75rem}

/* ── Footer ──────────────────────────────────────────────────── */
.footer{padding:2rem 0 1rem;text-align:center;font-size:.75rem;color:var(--text-secondary);
        border-top:1px solid var(--border);margin-top:3rem}

/* ── Detail actions ──────────────────────────────────────────── */
.detail-actions{display:flex;gap:.75rem;align-items:center;margin-top:1rem}
.btn{display:inline-flex;align-items:center;gap:.4rem;padding:.45rem 1rem;border-radius:var(--radius-sm);
     font-size:.85rem;font-weight:600;font-family:var(--font);text-decoration:none;
     transition:all var(--transition);cursor:pointer;border:none}
.btn-primary{background:var(--accent);color:#fff;box-shadow:0 1px 2px rgba(0,0,0,.08)}
.btn-primary:hover{background:var(--accent-hover);transform:translateY(-1px);color:#fff;text-decoration:none}
.btn-secondary{background:transparent;color:var(--text-secondary);border:1px solid var(--border)}
.btn-secondary:hover{background:rgba(0,0,0,.03);color:var(--text);text-decoration:none}

/* ── Graph ────────────────────────────────────────────────────── */
.graph-container{border-radius:var(--radius);overflow:hidden;background:#fafbfc;cursor:grab;
     height:calc(100vh - 280px);min-height:400px;position:relative;border:1px solid var(--border)}
.graph-container:active{cursor:grabbing}
.graph-container svg{display:block;width:100%;height:100%;position:absolute;top:0;left:0}
.graph-controls{position:absolute;top:.75rem;right:.75rem;display:flex;flex-direction:column;gap:.35rem;z-index:10}
.graph-controls button{width:34px;height:34px;border:1px solid var(--border);border-radius:var(--radius-sm);
     background:var(--surface);font-size:1rem;cursor:pointer;display:flex;align-items:center;
     justify-content:center;box-shadow:var(--shadow);color:var(--text);
     transition:all var(--transition)}
.graph-controls button:hover{background:#f0f0f3;box-shadow:var(--shadow-md)}
.graph-controls button:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.graph-legend{display:flex;flex-wrap:wrap;gap:.75rem;padding:.75rem 0 .25rem;font-size:.82rem}
.graph-legend-item{display:flex;align-items:center;gap:.35rem;color:var(--text-secondary)}
.graph-legend-swatch{width:12px;height:12px;border-radius:3px;flex-shrink:0}

/* ── Filter grid ──────────────────────────────────────────────── */
.filter-grid{display:flex;flex-wrap:wrap;gap:.6rem;margin-bottom:.75rem}
.filter-grid label{font-size:.8rem;display:flex;align-items:center;gap:.3rem;
                   color:var(--text-secondary);cursor:pointer;padding:.2rem .45rem;
                   border-radius:4px;transition:background var(--transition);
                   text-transform:none;letter-spacing:0;font-weight:500}
.filter-grid label:hover{background:rgba(58,134,255,.06)}
.filter-grid input[type="checkbox"]{margin:0;accent-color:var(--accent);width:14px;height:14px;
                                    cursor:pointer;border-radius:3px}

/* ── Document styles ──────────────────────────────────────────── */
.doc-body{line-height:1.8;font-size:.95rem}
.doc-body h1{font-size:1.4rem;font-weight:700;margin:2rem 0 .75rem;color:var(--text);
             border-bottom:2px solid var(--border);padding-bottom:.5rem}
.doc-body h2{font-size:1.2rem;font-weight:600;margin:1.5rem 0 .5rem;color:var(--text)}
.doc-body h3{font-size:1.05rem;font-weight:600;margin:1.25rem 0 .4rem;color:var(--text-secondary)}
.doc-body p{margin:.5rem 0}
.doc-body ul{margin:.5rem 0 .5rem 1.5rem}
.doc-body li{margin:.2rem 0}
.artifact-ref{display:inline-flex;align-items:center;padding:.15rem .5rem;border-radius:5px;
     font-size:.8rem;font-weight:600;font-family:var(--mono);background:#edf2ff;
     color:#3a63c7;cursor:pointer;text-decoration:none;
     border:1px solid #d4def5;transition:all var(--transition)}
.artifact-ref:hover{background:#d4def5;text-decoration:none;transform:translateY(-1px);box-shadow:0 2px 4px rgba(0,0,0,.06)}
.artifact-ref.broken{background:#fde8e8;color:#c62828;border-color:#f4c7c3;cursor:default}
.artifact-ref.broken:hover{transform:none;box-shadow:none}
.doc-glossary{font-size:.9rem}
.doc-glossary dt{font-weight:600;color:var(--text)}
.doc-glossary dd{margin:0 0 .5rem 1rem;color:var(--text-secondary)}
.doc-toc{font-size:.88rem;background:var(--surface);border:1px solid var(--border);
         border-radius:var(--radius);padding:1rem 1.25rem;margin-bottom:1.25rem;
         box-shadow:var(--shadow)}
.doc-toc strong{font-size:.75rem;text-transform:uppercase;letter-spacing:.05em;color:var(--text-secondary)}
.doc-toc ul{list-style:none;margin:.5rem 0 0;padding:0}
.doc-toc li{margin:.2rem 0;color:var(--text-secondary)}
.doc-toc .toc-h2{padding-left:0}
.doc-toc .toc-h3{padding-left:1.25rem}
.doc-toc .toc-h4{padding-left:2.5rem}
.doc-meta{display:flex;gap:.75rem;flex-wrap:wrap;align-items:center;margin-bottom:1.25rem}

/* ── Scrollbar (subtle) ───────────────────────────────────────── */
::-webkit-scrollbar{width:6px;height:6px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:#c5c5cd;border-radius:3px}
::-webkit-scrollbar-thumb:hover{background:#a0a0aa}

/* ── Selection ────────────────────────────────────────────────── */
::selection{background:rgba(58,134,255,.18)}

/* ── Cmd+K search modal ──────────────────────────────────────── */
.cmd-k-overlay{position:fixed;inset:0;background:rgba(0,0,0,.55);backdrop-filter:blur(4px);
  z-index:10000;display:none;align-items:flex-start;justify-content:center;padding-top:min(20vh,160px)}
.cmd-k-overlay.open{display:flex}
.cmd-k-modal{background:var(--sidebar);border-radius:12px;width:100%;max-width:600px;
  box-shadow:0 16px 70px rgba(0,0,0,.35);border:1px solid rgba(255,255,255,.08);
  overflow:hidden;display:flex;flex-direction:column;max-height:min(70vh,520px)}
.cmd-k-input{width:100%;padding:.875rem 1rem .875rem 2.75rem;font-size:1rem;font-family:var(--font);
  background:transparent;border:none;border-bottom:1px solid rgba(255,255,255,.08);
  color:#fff;outline:none;caret-color:var(--accent)}
.cmd-k-input::placeholder{color:rgba(255,255,255,.35)}
.cmd-k-icon{position:absolute;left:1rem;top:.95rem;color:rgba(255,255,255,.35);pointer-events:none;
  font-size:.95rem}
.cmd-k-head{position:relative}
.cmd-k-results{overflow-y:auto;padding:.5rem 0;flex:1}
.cmd-k-empty{padding:1.5rem 1rem;text-align:center;color:rgba(255,255,255,.35);font-size:.9rem}
.cmd-k-group{padding:0 .5rem}
.cmd-k-group-label{font-size:.7rem;font-weight:600;text-transform:uppercase;letter-spacing:.06em;
  color:rgba(255,255,255,.3);padding:.5rem .625rem .25rem}
.cmd-k-item{display:flex;align-items:center;gap:.75rem;padding:.5rem .625rem;border-radius:var(--radius-sm);
  cursor:pointer;color:var(--sidebar-text);font-size:.88rem;transition:background 80ms ease}
.cmd-k-item:hover,.cmd-k-item.active{background:rgba(255,255,255,.08);color:#fff}
.cmd-k-item-icon{width:1.5rem;height:1.5rem;border-radius:4px;display:flex;align-items:center;
  justify-content:center;font-size:.7rem;flex-shrink:0;background:rgba(255,255,255,.06);color:rgba(255,255,255,.5)}
.cmd-k-item-body{flex:1;min-width:0}
.cmd-k-item-title{font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cmd-k-item-title mark{background:transparent;color:var(--accent);font-weight:700}
.cmd-k-item-meta{font-size:.75rem;color:rgba(255,255,255,.35);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cmd-k-item-meta mark{background:transparent;color:var(--accent);font-weight:600}
.cmd-k-item-field{font-size:.65rem;padding:.1rem .35rem;border-radius:3px;
  background:rgba(255,255,255,.06);color:rgba(255,255,255,.4);white-space:nowrap;flex-shrink:0}
.cmd-k-kbd{display:inline-flex;align-items:center;gap:.2rem;font-size:.7rem;font-family:var(--mono);
  padding:.15rem .4rem;border-radius:4px;background:rgba(255,255,255,.08);color:rgba(255,255,255,.4);
  border:1px solid rgba(255,255,255,.06)}
.nav-search-hint{display:flex;align-items:center;justify-content:space-between;padding:.5rem .75rem;
  margin-top:auto;border-top:1px solid rgba(255,255,255,.06);padding-top:1rem;
  color:var(--sidebar-text);font-size:.82rem;cursor:pointer;border-radius:var(--radius-sm);
  transition:all var(--transition)}
.nav-search-hint:hover{background:var(--sidebar-hover);color:var(--sidebar-active)}
"#;

// ── Pan/zoom JS ──────────────────────────────────────────────────────────

const GRAPH_JS: &str = r#"
<script>
(function(){
  // ── Loading bar ──────────────────────────────────────────
  var bar=document.getElementById('loading-bar');
  if(bar){
    document.body.addEventListener('htmx:beforeRequest',function(){
      bar.classList.remove('done');
      bar.style.width='0';
      void bar.offsetWidth;
      bar.classList.add('active');
    });
    document.body.addEventListener('htmx:afterRequest',function(){
      bar.classList.remove('active');
      bar.classList.add('done');
      bar.style.width='100%';
      setTimeout(function(){bar.classList.remove('done');bar.style.width='0'},400);
    });
  }

  // ── Nav active state ─────────────────────────────────────
  function setActiveNav(url){
    document.querySelectorAll('nav a[hx-get]').forEach(function(a){
      var href=a.getAttribute('hx-get');
      if(url===href || (href!=='/' && url.startsWith(href))){
        a.classList.add('active');
      } else {
        a.classList.remove('active');
      }
    });
  }
  document.body.addEventListener('htmx:afterRequest',function(e){
    var path=e.detail.pathInfo&&e.detail.pathInfo.requestPath;
    if(path) setActiveNav(path);
  });
  // Set initial active state
  document.addEventListener('DOMContentLoaded',function(){setActiveNav('/stats')});

  // ── Pan/zoom ─────────────────────────────────────────────
  document.addEventListener('htmx:afterSwap', initPanZoom);
  document.addEventListener('DOMContentLoaded', initPanZoom);

  function initPanZoom(){
    document.querySelectorAll('.graph-container').forEach(function(c){
      if(c._pz) return;
      c._pz=true;
      var svg=c.querySelector('svg');
      if(!svg) return;
      var vb=svg.viewBox.baseVal;
      var origVB={x:vb.x, y:vb.y, w:vb.width, h:vb.height};
      var drag=false, sx=0, sy=0, ox=0, oy=0;

      // Pan
      c.addEventListener('mousedown',function(e){
        if(e.target.closest('.graph-controls')) return;
        drag=true; sx=e.clientX; sy=e.clientY;
        ox=vb.x; oy=vb.y; e.preventDefault();
      });
      c.addEventListener('mousemove',function(e){
        if(!drag) return;
        var scale=vb.width/c.clientWidth;
        vb.x=ox-(e.clientX-sx)*scale;
        vb.y=oy-(e.clientY-sy)*scale;
      });
      c.addEventListener('mouseup',function(){ drag=false; });
      c.addEventListener('mouseleave',function(){ drag=false; });

      // Zoom with wheel
      c.addEventListener('wheel',function(e){
        e.preventDefault();
        var f=e.deltaY>0?1.12:1/1.12;
        var r=c.getBoundingClientRect();
        var mx=(e.clientX-r.left)/r.width;
        var my=(e.clientY-r.top)/r.height;
        var nx=vb.width*f, ny=vb.height*f;
        vb.x+=(vb.width-nx)*mx;
        vb.y+=(vb.height-ny)*my;
        vb.width=nx; vb.height=ny;
      },{passive:false});

      // Touch support
      var lastDist=0, lastMid=null;
      c.addEventListener('touchstart',function(e){
        if(e.touches.length===1){
          drag=true; sx=e.touches[0].clientX; sy=e.touches[0].clientY;
          ox=vb.x; oy=vb.y;
        } else if(e.touches.length===2){
          drag=false;
          var dx=e.touches[1].clientX-e.touches[0].clientX;
          var dy=e.touches[1].clientY-e.touches[0].clientY;
          lastDist=Math.sqrt(dx*dx+dy*dy);
          lastMid={x:(e.touches[0].clientX+e.touches[1].clientX)/2,
                   y:(e.touches[0].clientY+e.touches[1].clientY)/2};
        }
      },{passive:true});
      c.addEventListener('touchmove',function(e){
        if(e.touches.length===1 && drag){
          e.preventDefault();
          var scale=vb.width/c.clientWidth;
          vb.x=ox-(e.touches[0].clientX-sx)*scale;
          vb.y=oy-(e.touches[0].clientY-sy)*scale;
        } else if(e.touches.length===2){
          e.preventDefault();
          var dx=e.touches[1].clientX-e.touches[0].clientX;
          var dy=e.touches[1].clientY-e.touches[0].clientY;
          var dist=Math.sqrt(dx*dx+dy*dy);
          var f=lastDist/dist;
          var r=c.getBoundingClientRect();
          var mid={x:(e.touches[0].clientX+e.touches[1].clientX)/2,
                   y:(e.touches[0].clientY+e.touches[1].clientY)/2};
          var mx=(mid.x-r.left)/r.width;
          var my=(mid.y-r.top)/r.height;
          var nx=vb.width*f, ny=vb.height*f;
          vb.x+=(vb.width-nx)*mx;
          vb.y+=(vb.height-ny)*my;
          vb.width=nx; vb.height=ny;
          lastDist=dist; lastMid=mid;
        }
      },{passive:false});
      c.addEventListener('touchend',function(){ drag=false; lastDist=0; });

      // Zoom buttons
      var controls=c.querySelector('.graph-controls');
      if(controls){
        controls.querySelector('.zoom-in').addEventListener('click',function(){
          var cx=vb.x+vb.width/2, cy=vb.y+vb.height/2;
          vb.width/=1.3; vb.height/=1.3;
          vb.x=cx-vb.width/2; vb.y=cy-vb.height/2;
        });
        controls.querySelector('.zoom-out').addEventListener('click',function(){
          var cx=vb.x+vb.width/2, cy=vb.y+vb.height/2;
          vb.width*=1.3; vb.height*=1.3;
          vb.x=cx-vb.width/2; vb.y=cy-vb.height/2;
        });
        controls.querySelector('.zoom-fit').addEventListener('click',function(){
          vb.x=origVB.x; vb.y=origVB.y; vb.width=origVB.w; vb.height=origVB.h;
        });
      }

      // Clickable nodes — navigate to artifact detail via htmx
      svg.querySelectorAll('.node').forEach(function(node){
        node.style.cursor='pointer';
        node.addEventListener('click',function(e){
          e.stopPropagation();
          var title=node.querySelector('title');
          if(title){
            var id=title.textContent;
            htmx.ajax('GET','/artifacts/'+encodeURIComponent(id),'#content');
          }
        });
        // Hover effect
        node.addEventListener('mouseenter',function(){
          var rect=node.querySelector('rect');
          if(rect) rect.setAttribute('stroke-width','3');
        });
        node.addEventListener('mouseleave',function(){
          var rect=node.querySelector('rect');
          if(rect){
            var isHL=rect.getAttribute('stroke')==='#ff6600';
            rect.setAttribute('stroke-width', isHL?'3':'1.5');
          }
        });
      });

      // Fit to container on first load with some padding
      var padding=40;
      vb.x=-padding; vb.y=-padding;
      vb.width=origVB.w+padding*2;
      vb.height=origVB.h+padding*2;
      origVB={x:vb.x, y:vb.y, w:vb.width, h:vb.height};
    });
  }
})();
</script>
"#;

// ── Cmd+K search JS ──────────────────────────────────────────────────────

const SEARCH_JS: &str = r#"
<script>
(function(){
  var overlay=document.getElementById('cmd-k-overlay');
  var input=document.getElementById('cmd-k-input');
  var results=document.getElementById('cmd-k-results');
  var timer=null;
  var activeIdx=-1;
  var items=[];

  function open(){
    overlay.classList.add('open');
    input.value='';
    results.innerHTML='<div class="cmd-k-empty">Type to search artifacts and documents</div>';
    activeIdx=-1;
    items=[];
    setTimeout(function(){input.focus()},20);
  }
  function close(){
    overlay.classList.remove('open');
    input.blur();
  }

  // Keyboard shortcut: Cmd+K / Ctrl+K
  document.addEventListener('keydown',function(e){
    if((e.metaKey||e.ctrlKey)&&e.key==='k'){
      e.preventDefault();
      if(overlay.classList.contains('open')){close()}else{open()}
    }
    if(e.key==='Escape'&&overlay.classList.contains('open')){
      e.preventDefault();close();
    }
  });

  // Click outside to close
  overlay.addEventListener('mousedown',function(e){
    if(e.target===overlay) close();
  });

  // Nav hint click
  var hint=document.getElementById('nav-search-hint');
  if(hint) hint.addEventListener('click',function(){open()});

  // Debounced search
  input.addEventListener('input',function(){
    clearTimeout(timer);
    var q=input.value.trim();
    if(!q){
      results.innerHTML='<div class="cmd-k-empty">Type to search artifacts and documents</div>';
      activeIdx=-1;items=[];
      return;
    }
    timer=setTimeout(function(){
      fetch('/search?q='+encodeURIComponent(q))
        .then(function(r){return r.text()})
        .then(function(html){
          results.innerHTML=html;
          items=results.querySelectorAll('.cmd-k-item');
          activeIdx=-1;
          setActive(-1);
        });
    },200);
  });

  // Arrow navigation
  input.addEventListener('keydown',function(e){
    if(e.key==='ArrowDown'){
      e.preventDefault();
      if(items.length>0){activeIdx=Math.min(activeIdx+1,items.length-1);setActive(activeIdx);}
    } else if(e.key==='ArrowUp'){
      e.preventDefault();
      if(items.length>0){activeIdx=Math.max(activeIdx-1,0);setActive(activeIdx);}
    } else if(e.key==='Enter'){
      e.preventDefault();
      if(activeIdx>=0&&activeIdx<items.length){
        navigate(items[activeIdx]);
      }
    }
  });

  function setActive(idx){
    for(var i=0;i<items.length;i++){
      items[i].classList.toggle('active',i===idx);
    }
    if(idx>=0&&idx<items.length){
      items[idx].scrollIntoView({block:'nearest'});
    }
  }

  function navigate(el){
    var url=el.getAttribute('data-url');
    if(url){
      close();
      htmx.ajax('GET',url,'#content');
    }
  }

  // Click on result
  results.addEventListener('click',function(e){
    var item=e.target.closest('.cmd-k-item');
    if(item) navigate(item);
  });
})();
</script>
"#;

// ── Layout ───────────────────────────────────────────────────────────────

struct NavInfo {
    artifact_count: usize,
    error_count: usize,
    doc_count: usize,
}

fn page_layout(content: &str, nav: &NavInfo) -> Html<String> {
    let artifact_count = nav.artifact_count;
    let error_badge = if nav.error_count > 0 {
        format!(
            "<span class=\"nav-badge nav-badge-error\">{}</span>",
            nav.error_count
        )
    } else {
        "<span class=\"nav-badge\">OK</span>".to_string()
    };
    let doc_badge = if nav.doc_count > 0 {
        format!("<span class=\"nav-badge\">{}</span>", nav.doc_count)
    } else {
        String::new()
    };
    let version = env!("CARGO_PKG_VERSION");
    Html(format!(
        r##"<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Rivet Dashboard</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:ital,wght@0,400;0,700&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>{CSS}</style>
<script src="https://unpkg.com/htmx.org@2.0.4"></script>
</head>
<body>
<div id="loading-bar"></div>
<div class="shell">
<nav>
  <h1>Rivet</h1>
  <ul>
    <li><a hx-get="/stats" hx-target="#content" hx-push-url="false" href="#" class="active"><span class="nav-label"><span class="nav-icon"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="1.5" y="1.5" width="5" height="5" rx="1"/><rect x="9.5" y="1.5" width="5" height="5" rx="1"/><rect x="1.5" y="9.5" width="5" height="5" rx="1"/><rect x="9.5" y="9.5" width="5" height="5" rx="1"/></svg></span> Overview</span></a></li>
    <li><a hx-get="/artifacts" hx-target="#content" hx-push-url="false" href="#"><span class="nav-label"><span class="nav-icon"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="1.5" width="10" height="13" rx="1.5"/><path d="M6 5h4M6 8h4M6 11h2"/></svg></span> Artifacts</span><span class="nav-badge">{artifact_count}</span></a></li>
    <li><a hx-get="/validate" hx-target="#content" hx-push-url="false" href="#"><span class="nav-label"><span class="nav-icon"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="8" r="6.5"/><path d="M5.5 8l2 2 3.5-3.5"/></svg></span> Validation</span>{error_badge}</a></li>
    <li class="nav-divider"></li>
    <li><a hx-get="/matrix" hx-target="#content" hx-push-url="false" href="#"><span class="nav-label"><span class="nav-icon"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M1.5 5.5h13M1.5 10.5h13M5.5 1.5v13M10.5 1.5v13"/><rect x="1.5" y="1.5" width="13" height="13" rx="1.5"/></svg></span> Matrix</span></a></li>
    <li><a hx-get="/coverage" hx-target="#content" hx-push-url="false" href="#"><span class="nav-label"><span class="nav-icon"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="8" r="6.5"/><path d="M8 1.5V8l4.6 4.6"/></svg></span> Coverage</span></a></li>
    <li><a hx-get="/graph" hx-target="#content" hx-push-url="false" href="#"><span class="nav-label"><span class="nav-icon"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="4" cy="4" r="2"/><circle cx="12" cy="4" r="2"/><circle cx="4" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><path d="M6 4h4M4 6v4M12 6v4M6 12h4"/></svg></span> Graph</span></a></li>
    <li><a hx-get="/documents" hx-target="#content" hx-push-url="false" href="#"><span class="nav-label"><span class="nav-icon"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 1.5H4.5A1.5 1.5 0 003 3v10a1.5 1.5 0 001.5 1.5h7A1.5 1.5 0 0013 13V5.5L9 1.5z"/><path d="M9 1.5V5.5h4"/><path d="M6 8.5h4M6 11h2"/></svg></span> Documents</span>{doc_badge}</a></li>
  </ul>
  <div id="nav-search-hint" class="nav-search-hint">
    <span><span class="nav-icon"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5L14 14"/></svg></span> Search</span>
    <span class="cmd-k-kbd">&#8984;K</span>
  </div>
</nav>
<main id="content" hx-swap="innerHTML transition:true">
{content}
<div class="footer">Powered by Rivet v{version}</div>
</main>
</div>
<div id="cmd-k-overlay" class="cmd-k-overlay">
  <div class="cmd-k-modal">
    <div class="cmd-k-head">
      <span class="cmd-k-icon">&#128269;</span>
      <input id="cmd-k-input" class="cmd-k-input" type="text" placeholder="Search artifacts, documents..." autocomplete="off" spellcheck="false">
    </div>
    <div id="cmd-k-results" class="cmd-k-results">
      <div class="cmd-k-empty">Type to search artifacts and documents</div>
    </div>
  </div>
</div>
{GRAPH_JS}
{SEARCH_JS}
</body>
</html>"##
    ))
}

// ── Routes ───────────────────────────────────────────────────────────────

async fn index(State(state): State<Arc<AppState>>) -> Html<String> {
    let inner = stats_partial(&state);
    let nav = make_nav_info(&state);
    page_layout(&inner, &nav)
}

fn make_nav_info(state: &AppState) -> NavInfo {
    let diagnostics = validate::validate(&state.store, &state.schema, &state.graph);
    let error_count = diagnostics
        .iter()
        .filter(|d| d.severity == Severity::Error)
        .count();
    NavInfo {
        artifact_count: state.store.len(),
        error_count,
        doc_count: state.doc_store.len(),
    }
}

async fn stats_view(State(state): State<Arc<AppState>>) -> Html<String> {
    Html(stats_partial(&state))
}

fn stats_partial(state: &AppState) -> String {
    let store = &state.store;
    let graph = &state.graph;
    let doc_store = &state.doc_store;

    let mut types: Vec<&str> = store.types().collect();
    types.sort();

    let orphans = graph.orphans(store);
    let diagnostics = validate::validate(store, &state.schema, graph);
    let errors = diagnostics
        .iter()
        .filter(|d| d.severity == Severity::Error)
        .count();
    let warnings = diagnostics
        .iter()
        .filter(|d| d.severity == Severity::Warning)
        .count();

    let mut html = String::from("<h2>Dashboard</h2>");

    // Summary cards with colored accents
    html.push_str("<div class=\"stat-grid\">");
    html.push_str(&format!(
        "<div class=\"stat-box stat-blue\"><div class=\"number\">{}</div><div class=\"label\">Artifacts</div></div>",
        store.len()
    ));
    html.push_str(&format!(
        "<div class=\"stat-box stat-green\"><div class=\"number\">{}</div><div class=\"label\">Types</div></div>",
        types.len()
    ));
    html.push_str(&format!(
        "<div class=\"stat-box stat-orange\"><div class=\"number\">{}</div><div class=\"label\">Orphans</div></div>",
        orphans.len()
    ));
    html.push_str(&format!(
        "<div class=\"stat-box stat-red\"><div class=\"number\">{}</div><div class=\"label\">Errors</div></div>",
        errors
    ));
    html.push_str(&format!(
        "<div class=\"stat-box stat-amber\"><div class=\"number\">{}</div><div class=\"label\">Warnings</div></div>",
        warnings
    ));
    html.push_str(&format!(
        "<div class=\"stat-box stat-purple\"><div class=\"number\">{}</div><div class=\"label\">Broken Links</div></div>",
        graph.broken.len()
    ));
    if !doc_store.is_empty() {
        html.push_str(&format!(
            "<div class=\"stat-box stat-blue\"><div class=\"number\">{}</div><div class=\"label\">Documents</div></div>",
            doc_store.len()
        ));
    }
    html.push_str("</div>");

    // By-type table
    html.push_str("<div class=\"card\"><h3>Artifacts by Type</h3><table><thead><tr><th>Type</th><th>Count</th></tr></thead><tbody>");
    for t in &types {
        html.push_str(&format!(
            "<tr><td>{}</td><td>{}</td></tr>",
            badge_for_type(t),
            store.count_by_type(t)
        ));
    }
    html.push_str("</tbody></table></div>");

    // Status breakdown
    let mut status_counts: BTreeMap<String, usize> = BTreeMap::new();
    for a in store.iter() {
        let s = a.status.as_deref().unwrap_or("unknown");
        *status_counts.entry(s.to_string()).or_default() += 1;
    }
    let total_artifacts = store.len().max(1);
    html.push_str("<div class=\"card\"><h3>Status Distribution</h3>");
    for (status, count) in &status_counts {
        let pct = (*count as f64 / total_artifacts as f64) * 100.0;
        let bar_color = match status.as_str() {
            "approved" => "#15713a",
            "draft" => "#b8860b",
            "obsolete" => "#c62828",
            "unknown" => "#9898a6",
            _ => "#3a86ff",
        };
        html.push_str(&format!(
            "<div class=\"status-bar-row\">\
             <div class=\"status-bar-label\">{}</div>\
             <div class=\"status-bar-track\">\
               <div class=\"status-bar-fill\" style=\"background:{bar_color};width:{pct:.1}%\"></div>\
             </div>\
             <div class=\"status-bar-count\">{count}</div>\
             </div>",
            html_escape(status),
        ));
    }
    html.push_str("</div>");

    // Orphans
    if !orphans.is_empty() {
        html.push_str("<div class=\"card\"><h3>Orphan Artifacts (no links)</h3><table><thead><tr><th>ID</th></tr></thead><tbody>");
        for id in &orphans {
            html.push_str(&format!(
                "<tr><td><a hx-get=\"/artifacts/{id}\" hx-target=\"#content\" href=\"#\">{id}</a></td></tr>"
            ));
        }
        html.push_str("</tbody></table></div>");
    }

    html
}

// ── Artifacts ────────────────────────────────────────────────────────────

async fn artifacts_list(State(state): State<Arc<AppState>>) -> Html<String> {
    let store = &state.store;

    let mut artifacts: Vec<_> = store.iter().collect();
    artifacts.sort_by(|a, b| a.id.cmp(&b.id));

    let mut html = String::from("<h2>Artifacts</h2>");
    // Client-side filter input
    html.push_str("<div style=\"position:relative;margin-bottom:1rem\">\
        <svg width=\"15\" height=\"15\" viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" style=\"position:absolute;left:.75rem;top:50%;transform:translateY(-50%);opacity:.4\"><circle cx=\"7\" cy=\"7\" r=\"4.5\"/><path d=\"M10.5 10.5L14 14\"/></svg>\
        <input type=\"search\" id=\"artifact-filter\" placeholder=\"Filter artifacts...\" \
        style=\"width:100%;padding:.6rem .75rem .6rem 2.25rem;border:1px solid var(--border);border-radius:var(--radius-sm);font-size:.875rem;font-family:var(--font);background:var(--surface);color:var(--text);outline:none\" \
        oninput=\"filterTable(this.value)\">\
        </div>");
    html.push_str(
        "<table id=\"artifacts-table\"><thead><tr><th>ID</th><th>Type</th><th>Title</th><th>Status</th><th>Links</th></tr></thead><tbody>",
    );

    for a in &artifacts {
        let status = a.status.as_deref().unwrap_or("-");
        let status_badge = match status {
            "approved" => format!("<span class=\"badge badge-ok\">{status}</span>"),
            "draft" => format!("<span class=\"badge badge-warn\">{status}</span>"),
            "obsolete" => format!("<span class=\"badge badge-error\">{status}</span>"),
            _ => format!("<span class=\"badge badge-info\">{status}</span>"),
        };
        html.push_str(&format!(
            "<tr><td><a hx-get=\"/artifacts/{}\" hx-target=\"#content\" href=\"#\">{}</a></td>\
             <td>{}</td>\
             <td>{}</td>\
             <td>{}</td>\
             <td>{}</td></tr>",
            html_escape(&a.id),
            html_escape(&a.id),
            badge_for_type(&a.artifact_type),
            html_escape(&a.title),
            status_badge,
            a.links.len()
        ));
    }

    html.push_str("</tbody></table>");
    html.push_str(&format!(
        "<p class=\"meta\">{} artifacts total</p>",
        artifacts.len()
    ));
    // Inline filter script
    html.push_str(
        "<script>\
        function filterTable(q){\
          q=q.toLowerCase();\
          document.querySelectorAll('#artifacts-table tbody tr').forEach(function(r){\
            r.style.display=r.textContent.toLowerCase().includes(q)?'':'none';\
          });\
        }\
        </script>",
    );

    Html(html)
}

async fn artifact_detail(
    State(state): State<Arc<AppState>>,
    Path(id): Path<String>,
) -> Html<String> {
    let store = &state.store;
    let graph = &state.graph;

    let Some(artifact) = store.get(&id) else {
        return Html(format!(
            "<h2>Not Found</h2><p>Artifact <code>{}</code> does not exist.</p>",
            html_escape(&id)
        ));
    };

    let mut html = format!(
        "<h2>{}</h2><p class=\"meta\">{}</p>",
        html_escape(&artifact.id),
        badge_for_type(&artifact.artifact_type)
    );

    html.push_str("<div class=\"card\"><dl>");
    html.push_str(&format!(
        "<dt>Title</dt><dd>{}</dd>",
        html_escape(&artifact.title)
    ));
    if let Some(desc) = &artifact.description {
        html.push_str(&format!(
            "<dt>Description</dt><dd>{}</dd>",
            html_escape(desc)
        ));
    }
    if let Some(status) = &artifact.status {
        html.push_str(&format!("<dt>Status</dt><dd>{}</dd>", html_escape(status)));
    }
    if !artifact.tags.is_empty() {
        let tags: Vec<String> = artifact
            .tags
            .iter()
            .map(|t| format!("<span class=\"badge badge-info\">{}</span>", html_escape(t)))
            .collect();
        html.push_str(&format!("<dt>Tags</dt><dd>{}</dd>", tags.join(" ")));
    }

    // Extra fields
    for (key, value) in &artifact.fields {
        let val = match value {
            serde_yaml::Value::String(s) => html_escape(s),
            other => html_escape(&format!("{other:?}")),
        };
        html.push_str(&format!("<dt>{}</dt><dd>{}</dd>", html_escape(key), val));
    }
    html.push_str("</dl></div>");

    // Forward links
    if !artifact.links.is_empty() {
        html.push_str("<div class=\"card\"><h3>Outgoing Links</h3><table><thead><tr><th>Type</th><th>Target</th></tr></thead><tbody>");
        for link in &artifact.links {
            let target_display = if store.contains(&link.target) {
                format!(
                    "<a hx-get=\"/artifacts/{}\" hx-target=\"#content\" href=\"#\">{}</a>",
                    html_escape(&link.target),
                    html_escape(&link.target)
                )
            } else {
                format!(
                    "{} <span class=\"badge badge-error\">broken</span>",
                    html_escape(&link.target)
                )
            };
            html.push_str(&format!(
                "<tr><td><span class=\"link-pill\">{}</span></td><td>{}</td></tr>",
                html_escape(&link.link_type),
                target_display
            ));
        }
        html.push_str("</tbody></table></div>");
    }

    // Backlinks
    let backlinks = graph.backlinks_to(&id);
    if !backlinks.is_empty() {
        html.push_str("<div class=\"card\"><h3>Incoming Links</h3><table><thead><tr><th>Type</th><th>Source</th></tr></thead><tbody>");
        for bl in backlinks {
            let label = bl.inverse_type.as_deref().unwrap_or(&bl.link_type);
            html.push_str(&format!(
                "<tr><td><span class=\"link-pill\">{}</span></td>\
                 <td><a hx-get=\"/artifacts/{}\" hx-target=\"#content\" href=\"#\">{}</a></td></tr>",
                html_escape(label),
                html_escape(&bl.source),
                html_escape(&bl.source)
            ));
        }
        html.push_str("</tbody></table></div>");
    }

    // Action buttons
    html.push_str(&format!(
        r##"<div class="detail-actions">
        <a class="btn btn-primary" hx-get="/artifacts/{id_esc}/graph" hx-target="#content" href="#">Show in graph</a>
        <a class="btn btn-secondary" hx-get="/artifacts" hx-target="#content" href="#">&larr; Back to artifacts</a>
        </div>"##,
        id_esc = html_escape(&id),
    ));

    Html(html)
}

// ── Graph visualization ──────────────────────────────────────────────────

#[derive(Debug, serde::Deserialize)]
struct GraphParams {
    types: Option<String>,
    link_types: Option<String>,
    #[serde(default = "default_depth")]
    depth: usize,
    focus: Option<String>,
}

fn default_depth() -> usize {
    0
}

/// Build a filtered subgraph based on query params and return SVG.
async fn graph_view(
    State(state): State<Arc<AppState>>,
    Query(params): Query<GraphParams>,
) -> Html<String> {
    let store = &state.store;
    let link_graph = &state.graph;
    let pg = link_graph.graph();
    let node_map = link_graph.node_map();

    // Parse filter sets
    let type_filter: Option<Vec<String>> = params
        .types
        .as_ref()
        .filter(|s| !s.is_empty())
        .map(|s| s.split(',').map(|t| t.trim().to_string()).collect());
    let link_filter: Option<Vec<String>> = params
        .link_types
        .as_ref()
        .filter(|s| !s.is_empty())
        .map(|s| s.split(',').map(|t| t.trim().to_string()).collect());

    // Build the subgraph to visualize
    let sub: Graph<String, String>;

    if let Some(focus_id) = &params.focus {
        if focus_id.is_empty() {
            // No focus, fall through to full graph
            sub = build_filtered_subgraph(pg, store, node_map, &type_filter, &link_filter);
        } else if let Some(&focus_idx) = node_map.get(focus_id.as_str()) {
            let hops = if params.depth > 0 { params.depth } else { 3 };
            let ego = ego_subgraph(pg, focus_idx, hops);
            // Apply type/link filters on the ego subgraph
            sub = apply_filters_to_graph(&ego, store, &type_filter, &link_filter);
        } else {
            sub = build_filtered_subgraph(pg, store, node_map, &type_filter, &link_filter);
        }
    } else {
        sub = build_filtered_subgraph(pg, store, node_map, &type_filter, &link_filter);
    }

    let colors = type_color_map();
    let svg_opts = SvgOptions {
        type_colors: colors.clone(),
        highlight: params.focus.clone().filter(|s| !s.is_empty()),
        interactive: true,
        base_url: Some("/artifacts".into()),
        background: Some("#fafbfc".into()),
        font_size: 12.0,
        edge_color: "#888".into(),
        ..SvgOptions::default()
    };

    let layout_opts = LayoutOptions {
        node_width: 200.0,
        node_height: 56.0,
        rank_separation: 90.0,
        node_separation: 30.0,
        ..Default::default()
    };

    let gl = pgv_layout::layout(
        &sub,
        &|_idx, n| {
            let atype = store
                .get(n.as_str())
                .map(|a| a.artifact_type.clone())
                .unwrap_or_default();
            let title = store
                .get(n.as_str())
                .map(|a| a.title.clone())
                .unwrap_or_default();
            let sublabel = if title.len() > 28 {
                Some(format!("{}...", &title[..26]))
            } else if title.is_empty() {
                None
            } else {
                Some(title)
            };
            NodeInfo {
                id: n.clone(),
                label: n.clone(),
                node_type: atype,
                sublabel,
            }
        },
        &|_idx, e| EdgeInfo { label: e.clone() },
        &layout_opts,
    );

    let svg = render_svg(&gl, &svg_opts);

    // Collect which types are actually present for the legend
    let present_types: std::collections::BTreeSet<String> = sub
        .node_indices()
        .filter_map(|idx| {
            store
                .get(sub[idx].as_str())
                .map(|a| a.artifact_type.clone())
        })
        .collect();

    // Build filter controls
    let mut html = String::from("<h2>Traceability Graph</h2>");

    // Filter form
    html.push_str("<div class=\"card\">");
    html.push_str(
        "<form class=\"form-row\" hx-get=\"/graph\" hx-target=\"#content\" hx-push-url=\"false\">",
    );

    // Type checkboxes
    let mut all_types: Vec<&str> = store.types().collect();
    all_types.sort();
    html.push_str("<div><label>Types</label><div class=\"filter-grid\">");
    for t in &all_types {
        let checked = match &type_filter {
            Some(f) => {
                if f.iter().any(|x| x == *t) {
                    " checked"
                } else {
                    ""
                }
            }
            None => " checked",
        };
        html.push_str(&format!(
            "<label><input type=\"checkbox\" name=\"types\" value=\"{t}\"{checked}> {t}</label>"
        ));
    }
    html.push_str("</div></div>");

    // Focus input
    let focus_val = params.focus.as_deref().unwrap_or("");
    html.push_str(&format!(
        "<div><label for=\"focus\">Focus</label><br>\
         <input name=\"focus\" id=\"focus\" value=\"{}\" placeholder=\"e.g. REQ-001\" list=\"artifact-ids\"></div>",
        html_escape(focus_val)
    ));

    // Datalist for autocomplete
    html.push_str("<datalist id=\"artifact-ids\">");
    for a in store.iter() {
        html.push_str(&format!("<option value=\"{}\">", html_escape(&a.id)));
    }
    html.push_str("</datalist>");

    // Depth slider
    let depth_val = if params.depth > 0 { params.depth } else { 3 };
    html.push_str(&format!(
        "<div><label for=\"depth\">Depth: <span id=\"depth-val\">{depth_val}</span></label><br>\
         <input type=\"range\" name=\"depth\" id=\"depth\" min=\"1\" max=\"10\" value=\"{depth_val}\" \
         oninput=\"document.getElementById('depth-val').textContent=this.value\"></div>"
    ));

    // Link types input
    let lt_val = params.link_types.as_deref().unwrap_or("");
    html.push_str(&format!(
        "<div><label for=\"link_types\">Link types</label><br>\
         <input name=\"link_types\" id=\"link_types\" value=\"{}\" placeholder=\"e.g. satisfies,implements\"></div>",
        html_escape(lt_val)
    ));

    html.push_str("<div><label>&nbsp;</label><br><button type=\"submit\">Apply</button></div>");
    html.push_str("</form>");

    // Legend
    if !present_types.is_empty() {
        html.push_str("<div class=\"graph-legend\">");
        for t in &present_types {
            let color = colors
                .get(t.as_str())
                .map(|s| s.as_str())
                .unwrap_or("#e8e8e8");
            html.push_str(&format!(
                "<div class=\"graph-legend-item\"><div class=\"graph-legend-swatch\" style=\"background:{color}\"></div>{t}</div>"
            ));
        }
        html.push_str("</div>");
    }
    html.push_str("</div>");

    // SVG card with zoom controls
    html.push_str(
        "<div class=\"card\" style=\"padding:0;position:relative\">\
        <div class=\"graph-container\">\
        <div class=\"graph-controls\">\
          <button class=\"zoom-in\" title=\"Zoom in\">+</button>\
          <button class=\"zoom-out\" title=\"Zoom out\">&minus;</button>\
          <button class=\"zoom-fit\" title=\"Fit to view\">&#8689;</button>\
        </div>",
    );
    html.push_str(&svg);
    html.push_str("</div></div>");

    html.push_str(&format!(
        "<p class=\"meta\">{} nodes, {} edges &mdash; scroll to zoom, drag to pan, click nodes to navigate</p>",
        gl.nodes.len(),
        gl.edges.len()
    ));

    Html(html)
}

// ── Ego graph for a single artifact ──────────────────────────────────────

#[derive(Debug, serde::Deserialize)]
struct EgoParams {
    #[serde(default = "default_ego_hops")]
    hops: usize,
}

fn default_ego_hops() -> usize {
    2
}

async fn artifact_graph(
    State(state): State<Arc<AppState>>,
    Path(id): Path<String>,
    Query(params): Query<EgoParams>,
) -> Html<String> {
    let store = &state.store;
    let link_graph = &state.graph;
    let pg = link_graph.graph();
    let node_map = link_graph.node_map();

    let Some(&focus_idx) = node_map.get(id.as_str()) else {
        return Html(format!(
            "<h2>Not Found</h2><p>Artifact <code>{}</code> not in graph.</p>",
            html_escape(&id)
        ));
    };

    let hops = if params.hops > 0 { params.hops } else { 2 };
    let sub = ego_subgraph(pg, focus_idx, hops);

    let colors = type_color_map();
    let svg_opts = SvgOptions {
        type_colors: colors.clone(),
        highlight: Some(id.clone()),
        interactive: true,
        base_url: Some("/artifacts".into()),
        background: Some("#fafbfc".into()),
        font_size: 12.0,
        edge_color: "#888".into(),
        ..SvgOptions::default()
    };

    let layout_opts = LayoutOptions {
        node_width: 200.0,
        node_height: 56.0,
        rank_separation: 90.0,
        node_separation: 30.0,
        ..Default::default()
    };

    let gl = pgv_layout::layout(
        &sub,
        &|_idx, n| {
            let atype = store
                .get(n.as_str())
                .map(|a| a.artifact_type.clone())
                .unwrap_or_default();
            let title = store
                .get(n.as_str())
                .map(|a| a.title.clone())
                .unwrap_or_default();
            let sublabel = if title.len() > 28 {
                Some(format!("{}...", &title[..26]))
            } else if title.is_empty() {
                None
            } else {
                Some(title)
            };
            NodeInfo {
                id: n.clone(),
                label: n.clone(),
                node_type: atype,
                sublabel,
            }
        },
        &|_idx, e| EdgeInfo { label: e.clone() },
        &layout_opts,
    );

    let svg = render_svg(&gl, &svg_opts);

    // Collect present types for legend
    let present_types: std::collections::BTreeSet<String> = sub
        .node_indices()
        .filter_map(|idx| {
            store
                .get(sub[idx].as_str())
                .map(|a| a.artifact_type.clone())
        })
        .collect();

    let mut html = format!("<h2>Neighborhood of {}</h2>", html_escape(&id),);

    // Hop control + legend
    html.push_str("<div class=\"card\">");
    html.push_str(&format!(
        "<form class=\"form-row\" hx-get=\"/artifacts/{id_esc}/graph\" hx-target=\"#content\" hx-push-url=\"false\">\
         <div><label for=\"hops\">Hops: <span id=\"hops-val\">{hops}</span></label><br>\
         <input type=\"range\" name=\"hops\" id=\"hops\" min=\"1\" max=\"6\" value=\"{hops}\" \
         oninput=\"document.getElementById('hops-val').textContent=this.value\"></div>\
         <div><label>&nbsp;</label><br><button type=\"submit\">Update</button></div>\
         </form>",
        id_esc = html_escape(&id),
    ));
    // Legend
    if !present_types.is_empty() {
        html.push_str("<div class=\"graph-legend\">");
        for t in &present_types {
            let color = colors
                .get(t.as_str())
                .map(|s| s.as_str())
                .unwrap_or("#e8e8e8");
            html.push_str(&format!(
                "<div class=\"graph-legend-item\"><div class=\"graph-legend-swatch\" style=\"background:{color}\"></div>{t}</div>"
            ));
        }
        html.push_str("</div>");
    }
    html.push_str("</div>");

    // SVG with zoom controls
    html.push_str(
        "<div class=\"card\" style=\"padding:0;position:relative\">\
        <div class=\"graph-container\">\
        <div class=\"graph-controls\">\
          <button class=\"zoom-in\" title=\"Zoom in\">+</button>\
          <button class=\"zoom-out\" title=\"Zoom out\">&minus;</button>\
          <button class=\"zoom-fit\" title=\"Fit to view\">&#8689;</button>\
        </div>",
    );
    html.push_str(&svg);
    html.push_str("</div></div>");

    html.push_str(&format!(
        "<p class=\"meta\">{} nodes, {} edges ({}-hop neighborhood) &mdash; scroll to zoom, drag to pan, click nodes to navigate</p>",
        gl.nodes.len(),
        gl.edges.len(),
        hops
    ));

    html.push_str(&format!(
        r##"<p><a hx-get="/artifacts/{id_esc}" hx-target="#content" href="#">&larr; Back to {id_esc}</a>
        &nbsp;|&nbsp;
        <a hx-get="/graph?focus={id_esc}" hx-target="#content" href="#">Open in full graph</a></p>"##,
        id_esc = html_escape(&id),
    ));

    Html(html)
}

/// Build a filtered subgraph from the full petgraph, keeping only nodes
/// whose artifact types match `type_filter` and edges matching `link_filter`.
fn build_filtered_subgraph(
    pg: &petgraph::Graph<String, String>,
    store: &Store,
    node_map: &HashMap<String, NodeIndex>,
    type_filter: &Option<Vec<String>>,
    link_filter: &Option<Vec<String>>,
) -> Graph<String, String> {
    let mut sub = Graph::new();
    let mut old_to_new: HashMap<NodeIndex, NodeIndex> = HashMap::new();

    // Add nodes that pass the type filter.
    for (id, &old_idx) in node_map {
        let include = match type_filter {
            Some(types) => store
                .get(id.as_str())
                .map(|a| types.iter().any(|t| t == &a.artifact_type))
                .unwrap_or(false),
            None => true,
        };
        if include {
            let new_idx = sub.add_node(pg[old_idx].clone());
            old_to_new.insert(old_idx, new_idx);
        }
    }

    // Add edges where both endpoints survived and link type matches.
    for edge in pg.edge_references() {
        if let (Some(&new_src), Some(&new_dst)) = (
            old_to_new.get(&edge.source()),
            old_to_new.get(&edge.target()),
        ) {
            let include = match link_filter {
                Some(lt) => lt.iter().any(|t| t == edge.weight()),
                None => true,
            };
            if include {
                sub.add_edge(new_src, new_dst, edge.weight().clone());
            }
        }
    }

    sub
}

/// Apply type and link filters to an already-extracted subgraph.
fn apply_filters_to_graph(
    graph: &Graph<String, String>,
    store: &Store,
    type_filter: &Option<Vec<String>>,
    link_filter: &Option<Vec<String>>,
) -> Graph<String, String> {
    let mut sub = Graph::new();
    let mut old_to_new: HashMap<NodeIndex, NodeIndex> = HashMap::new();

    for idx in graph.node_indices() {
        let id = &graph[idx];
        let include = match type_filter {
            Some(types) => store
                .get(id.as_str())
                .map(|a| types.iter().any(|t| t == &a.artifact_type))
                .unwrap_or(false),
            None => true,
        };
        if include {
            let new_idx = sub.add_node(id.clone());
            old_to_new.insert(idx, new_idx);
        }
    }

    for edge in graph.edge_references() {
        if let (Some(&new_src), Some(&new_dst)) = (
            old_to_new.get(&edge.source()),
            old_to_new.get(&edge.target()),
        ) {
            let include = match link_filter {
                Some(lt) => lt.iter().any(|t| t == edge.weight()),
                None => true,
            };
            if include {
                sub.add_edge(new_src, new_dst, edge.weight().clone());
            }
        }
    }

    sub
}

// ── Validation ───────────────────────────────────────────────────────────

async fn validate_view(State(state): State<Arc<AppState>>) -> Html<String> {
    let diagnostics = validate::validate(&state.store, &state.schema, &state.graph);

    let errors = diagnostics
        .iter()
        .filter(|d| d.severity == Severity::Error)
        .count();
    let warnings = diagnostics
        .iter()
        .filter(|d| d.severity == Severity::Warning)
        .count();
    let infos = diagnostics
        .iter()
        .filter(|d| d.severity == Severity::Info)
        .count();

    let mut html = String::from("<h2>Validation Results</h2>");

    // Colored summary bar
    let total_issues = errors + warnings + infos;
    if total_issues == 0 {
        html.push_str("<div class=\"validation-bar pass\">All checks passed</div>");
    } else {
        html.push_str(&format!(
            "<div class=\"validation-bar fail\">{total_issues} issue{} found &mdash; {errors} error{}, {warnings} warning{}, {infos} info</div>",
            if total_issues != 1 { "s" } else { "" },
            if errors != 1 { "s" } else { "" },
            if warnings != 1 { "s" } else { "" },
        ));
    }

    if diagnostics.is_empty() {
        html.push_str("<div class=\"card\"><p>No issues found.</p></div>");
        return Html(html);
    }

    html.push_str(
        "<table><thead><tr><th>Severity</th><th>Artifact</th><th>Rule</th><th>Message</th></tr></thead><tbody>",
    );

    // Show errors first, then warnings, then info
    let mut sorted = diagnostics;
    sorted.sort_by_key(|d| match d.severity {
        Severity::Error => 0,
        Severity::Warning => 1,
        Severity::Info => 2,
    });

    for d in &sorted {
        let sev = match d.severity {
            Severity::Error => "<span class=\"badge badge-error\">ERROR</span>",
            Severity::Warning => "<span class=\"badge badge-warn\">WARN</span>",
            Severity::Info => "<span class=\"badge badge-info\">INFO</span>",
        };
        let art_id = d.artifact_id.as_deref().unwrap_or("-");
        let art_link = if d.artifact_id.is_some() && state.store.contains(art_id) {
            format!(
                "<a hx-get=\"/artifacts/{art}\" hx-target=\"#content\" href=\"#\">{art}</a>",
                art = html_escape(art_id)
            )
        } else {
            html_escape(art_id)
        };
        html.push_str(&format!(
            "<tr><td>{sev}</td><td>{art_link}</td><td>{}</td><td>{}</td></tr>",
            html_escape(&d.rule),
            html_escape(&d.message)
        ));
    }

    html.push_str("</tbody></table>");
    Html(html)
}

// ── Traceability Matrix ──────────────────────────────────────────────────

#[derive(Debug, serde::Deserialize)]
struct MatrixParams {
    from: Option<String>,
    to: Option<String>,
    link: Option<String>,
    direction: Option<String>,
}

async fn matrix_view(
    State(state): State<Arc<AppState>>,
    Query(params): Query<MatrixParams>,
) -> Html<String> {
    let store = &state.store;

    let mut types: Vec<&str> = store.types().collect();
    types.sort();

    // Build the form
    let mut html = String::from("<h2>Traceability Matrix</h2>");
    html.push_str("<div class=\"card\">");
    html.push_str(
        "<form class=\"form-row\" hx-get=\"/matrix\" hx-target=\"#content\" hx-push-url=\"false\">",
    );

    // From select
    html.push_str("<div><label for=\"from\">From type</label><br>");
    html.push_str("<select name=\"from\" id=\"from\">");
    for t in &types {
        let selected = if params.from.as_deref() == Some(t) {
            " selected"
        } else {
            ""
        };
        html.push_str(&format!("<option value=\"{t}\"{selected}>{t}</option>"));
    }
    html.push_str("</select></div>");

    // To select
    html.push_str("<div><label for=\"to\">To type</label><br>");
    html.push_str("<select name=\"to\" id=\"to\">");
    for t in &types {
        let selected = if params.to.as_deref() == Some(t) {
            " selected"
        } else {
            ""
        };
        html.push_str(&format!("<option value=\"{t}\"{selected}>{t}</option>"));
    }
    html.push_str("</select></div>");

    // Link type input
    let link_val = params.link.as_deref().unwrap_or("verifies");
    html.push_str(&format!(
        "<div><label for=\"link\">Link type</label><br>\
         <input name=\"link\" id=\"link\" value=\"{}\"></div>",
        html_escape(link_val)
    ));

    // Direction select
    html.push_str("<div><label for=\"direction\">Direction</label><br>");
    html.push_str("<select name=\"direction\" id=\"direction\">");
    let dir_val = params.direction.as_deref().unwrap_or("backward");
    for (val, label) in [("backward", "Backward"), ("forward", "Forward")] {
        let selected = if dir_val == val { " selected" } else { "" };
        html.push_str(&format!(
            "<option value=\"{val}\"{selected}>{label}</option>"
        ));
    }
    html.push_str("</select></div>");

    html.push_str("<div><label>&nbsp;</label><br><button type=\"submit\">Compute</button></div>");
    html.push_str("</form></div>");

    // If both from and to are provided, compute the matrix
    if let (Some(from), Some(to)) = (&params.from, &params.to) {
        let link_type = params.link.as_deref().unwrap_or("verifies");
        let direction = match params.direction.as_deref().unwrap_or("backward") {
            "forward" | "fwd" => Direction::Forward,
            _ => Direction::Backward,
        };

        let result = matrix::compute_matrix(store, &state.graph, from, to, link_type, direction);

        html.push_str(&format!(
            "<div class=\"card\"><h3>{} &rarr; {} via &ldquo;{}&rdquo;</h3>",
            html_escape(from),
            html_escape(to),
            html_escape(link_type)
        ));
        html.push_str(&format!(
            "<p>Coverage: {}/{} ({:.1}%)</p>",
            result.covered,
            result.total,
            result.coverage_pct()
        ));
        html.push_str("<table><thead><tr><th>Source</th><th>Targets</th></tr></thead><tbody>");

        for row in &result.rows {
            let targets = if row.targets.is_empty() {
                "<span class=\"badge badge-warn\">none</span>".to_string()
            } else {
                row.targets
                    .iter()
                    .map(|t| {
                        format!(
                            "<a hx-get=\"/artifacts/{}\" hx-target=\"#content\" href=\"#\">{}</a>",
                            html_escape(&t.id),
                            html_escape(&t.id)
                        )
                    })
                    .collect::<Vec<_>>()
                    .join(", ")
            };
            html.push_str(&format!(
                "<tr><td><a hx-get=\"/artifacts/{}\" hx-target=\"#content\" href=\"#\">{}</a></td><td>{}</td></tr>",
                html_escape(&row.source_id),
                html_escape(&row.source_id),
                targets
            ));
        }

        html.push_str("</tbody></table></div>");
    }

    Html(html)
}

// ── Coverage ─────────────────────────────────────────────────────────────

async fn coverage_view(State(state): State<Arc<AppState>>) -> Html<String> {
    let report = coverage::compute_coverage(&state.store, &state.schema, &state.graph);
    let overall = report.overall_coverage();

    let mut html = String::from("<h2>Traceability Coverage</h2>");

    // Overall stat
    let overall_color = if overall >= 80.0 {
        "#15713a"
    } else if overall >= 50.0 {
        "#8b6914"
    } else {
        "#c62828"
    };
    html.push_str("<div class=\"stat-grid\">");
    html.push_str(&format!(
        "<div class=\"stat-box\"><div class=\"number\" style=\"color:{overall_color}\">{:.1}%</div><div class=\"label\">Overall Coverage</div></div>",
        overall
    ));
    html.push_str(&format!(
        "<div class=\"stat-box\"><div class=\"number\">{}</div><div class=\"label\">Rules</div></div>",
        report.entries.len()
    ));
    let fully_covered = report
        .entries
        .iter()
        .filter(|e| e.covered == e.total)
        .count();
    html.push_str(&format!(
        "<div class=\"stat-box\"><div class=\"number\">{}</div><div class=\"label\">Fully Covered</div></div>",
        fully_covered
    ));
    html.push_str("</div>");

    if report.entries.is_empty() {
        html.push_str(
            "<div class=\"card\"><p>No traceability rules defined in the schema.</p></div>",
        );
        return Html(html);
    }

    // Per-rule cards with coverage bars
    html.push_str("<div class=\"card\"><h3>Coverage by Rule</h3>");
    html.push_str("<table><thead><tr><th>Rule</th><th>Source Type</th><th>Link</th><th>Direction</th><th>Coverage</th><th style=\"width:30%\">Progress</th></tr></thead><tbody>");

    for entry in &report.entries {
        let pct = entry.percentage();
        let (bar_color, badge_class) = if pct >= 80.0 {
            ("#15713a", "badge-ok")
        } else if pct >= 50.0 {
            ("#b8860b", "badge-warn")
        } else {
            ("#c62828", "badge-error")
        };

        let dir_label = match entry.direction {
            coverage::CoverageDirection::Forward => "forward",
            coverage::CoverageDirection::Backward => "backward",
        };

        html.push_str(&format!(
            "<tr>\
             <td title=\"{}\">{}</td>\
             <td>{}</td>\
             <td><span class=\"link-pill\">{}</span></td>\
             <td>{}</td>\
             <td><span class=\"badge {badge_class}\">{}/{} ({:.1}%)</span></td>\
             <td>\
               <div style=\"background:#e5e5ea;border-radius:4px;height:18px;position:relative;overflow:hidden\">\
                 <div style=\"background:{bar_color};height:100%;width:{pct:.1}%;border-radius:4px;transition:width .3s ease\"></div>\
               </div>\
             </td>\
             </tr>",
            html_escape(&entry.description),
            html_escape(&entry.rule_name),
            badge_for_type(&entry.source_type),
            html_escape(&entry.link_type),
            dir_label,
            entry.covered,
            entry.total,
            pct,
        ));
    }

    html.push_str("</tbody></table></div>");

    // Uncovered artifacts
    let has_uncovered = report.entries.iter().any(|e| !e.uncovered_ids.is_empty());
    if has_uncovered {
        html.push_str("<div class=\"card\"><h3>Uncovered Artifacts</h3>");

        for entry in &report.entries {
            if entry.uncovered_ids.is_empty() {
                continue;
            }
            html.push_str(&format!(
                "<h3 style=\"font-size:.9rem;margin-top:1rem\">{} <span class=\"meta\">({} uncovered)</span></h3>",
                html_escape(&entry.rule_name),
                entry.uncovered_ids.len()
            ));
            html.push_str("<table><thead><tr><th>ID</th><th>Title</th></tr></thead><tbody>");
            for id in &entry.uncovered_ids {
                let title = state.store.get(id).map(|a| a.title.as_str()).unwrap_or("-");
                html.push_str(&format!(
                    "<tr><td><a hx-get=\"/artifacts/{id_esc}\" hx-target=\"#content\" href=\"#\">{id_esc}</a></td>\
                     <td>{title_esc}</td></tr>",
                    id_esc = html_escape(id),
                    title_esc = html_escape(title),
                ));
            }
            html.push_str("</tbody></table>");
        }

        html.push_str("</div>");
    }

    Html(html)
}

// ── Documents ────────────────────────────────────────────────────────────

async fn documents_list(State(state): State<Arc<AppState>>) -> Html<String> {
    let doc_store = &state.doc_store;

    let mut html = String::from("<h2>Documents</h2>");

    if doc_store.is_empty() {
        html.push_str("<div class=\"card\"><p>No documents loaded. Add markdown files with YAML frontmatter to a <code>docs/</code> directory and reference it in <code>rivet.yaml</code>:</p>\
            <pre style=\"background:#f1f3f5;padding:1rem;border-radius:4px;font-size:.88rem;margin-top:.5rem\">docs:\n  - docs</pre></div>");
        return Html(html);
    }

    html.push_str(
        "<table><thead><tr><th>ID</th><th>Type</th><th>Title</th><th>Status</th><th>Refs</th></tr></thead><tbody>",
    );

    for doc in doc_store.iter() {
        let status = doc.status.as_deref().unwrap_or("-");
        let status_badge = match status {
            "approved" => format!("<span class=\"badge badge-ok\">{status}</span>"),
            "draft" => format!("<span class=\"badge badge-warn\">{status}</span>"),
            _ => format!("<span class=\"badge badge-info\">{status}</span>"),
        };
        html.push_str(&format!(
            "<tr><td><a hx-get=\"/documents/{}\" hx-target=\"#content\" href=\"#\">{}</a></td>\
             <td>{}</td>\
             <td>{}</td>\
             <td>{}</td>\
             <td>{}</td></tr>",
            html_escape(&doc.id),
            html_escape(&doc.id),
            badge_for_type(&doc.doc_type),
            html_escape(&doc.title),
            status_badge,
            doc.references.len(),
        ));
    }

    html.push_str("</tbody></table>");
    html.push_str(&format!(
        "<p class=\"meta\">{} documents, {} total artifact references</p>",
        doc_store.len(),
        doc_store.all_references().len()
    ));

    Html(html)
}

async fn document_detail(
    State(state): State<Arc<AppState>>,
    Path(id): Path<String>,
) -> Html<String> {
    let doc_store = &state.doc_store;
    let store = &state.store;

    let Some(doc) = doc_store.get(&id) else {
        return Html(format!(
            "<h2>Not Found</h2><p>Document <code>{}</code> does not exist.</p>",
            html_escape(&id)
        ));
    };

    let mut html = String::new();

    // Header with metadata
    html.push_str(&format!("<h2>{}</h2>", html_escape(&doc.title)));

    html.push_str("<div class=\"doc-meta\">");
    html.push_str(&badge_for_type(&doc.doc_type));
    if let Some(status) = &doc.status {
        let badge_class = match status.as_str() {
            "approved" => "badge-ok",
            "draft" => "badge-warn",
            _ => "badge-info",
        };
        html.push_str(&format!(
            "<span class=\"badge {badge_class}\">{}</span>",
            html_escape(status)
        ));
    }
    html.push_str(&format!(
        "<span class=\"meta\">{} artifact references</span>",
        doc.references.len()
    ));
    html.push_str("</div>");

    // Table of contents
    let toc_sections: Vec<_> = doc.sections.iter().filter(|s| s.level >= 2).collect();
    if toc_sections.len() > 2 {
        html.push_str("<div class=\"doc-toc\"><strong>Contents</strong><ul>");
        for sec in &toc_sections {
            let class = match sec.level {
                2 => "toc-h2",
                3 => "toc-h3",
                _ => "toc-h4",
            };
            let ref_count = if sec.artifact_ids.is_empty() {
                String::new()
            } else {
                format!(" <span class=\"meta\">({})</span>", sec.artifact_ids.len())
            };
            html.push_str(&format!(
                "<li class=\"{class}\">{}{ref_count}</li>",
                html_escape(&sec.title),
            ));
        }
        html.push_str("</ul></div>");
    }

    // Rendered body
    html.push_str("<div class=\"card\"><div class=\"doc-body\">");
    let body_html = document::render_to_html(doc, |aid| store.contains(aid));
    html.push_str(&body_html);
    html.push_str("</div></div>");

    // Glossary
    if !doc.glossary.is_empty() {
        html.push_str("<div class=\"card\"><h3>Glossary</h3><dl class=\"doc-glossary\">");
        for (term, definition) in &doc.glossary {
            html.push_str(&format!(
                "<dt>{}</dt><dd>{}</dd>",
                html_escape(term),
                html_escape(definition)
            ));
        }
        html.push_str("</dl></div>");
    }

    // Referenced artifacts summary
    if !doc.references.is_empty() {
        html.push_str("<div class=\"card\"><h3>Referenced Artifacts</h3>");
        html.push_str("<table><thead><tr><th>ID</th><th>Type</th><th>Title</th><th>Status</th></tr></thead><tbody>");

        let mut seen = std::collections::HashSet::new();
        for reference in &doc.references {
            if !seen.insert(&reference.artifact_id) {
                continue;
            }
            if let Some(artifact) = store.get(&reference.artifact_id) {
                let status = artifact.status.as_deref().unwrap_or("-");
                html.push_str(&format!(
                    "<tr><td><a hx-get=\"/artifacts/{}\" hx-target=\"#content\" href=\"#\">{}</a></td>\
                     <td>{}</td>\
                     <td>{}</td>\
                     <td>{}</td></tr>",
                    html_escape(&artifact.id),
                    html_escape(&artifact.id),
                    badge_for_type(&artifact.artifact_type),
                    html_escape(&artifact.title),
                    html_escape(status),
                ));
            } else {
                html.push_str(&format!(
                    "<tr><td><span class=\"artifact-ref broken\">{}</span></td>\
                     <td colspan=\"3\">not found</td></tr>",
                    html_escape(&reference.artifact_id),
                ));
            }
        }

        html.push_str("</tbody></table></div>");
    }

    html.push_str(
        "<p><a hx-get=\"/documents\" hx-target=\"#content\" href=\"#\">&larr; Back to documents</a></p>",
    );

    Html(html)
}

// ── Search ───────────────────────────────────────────────────────────────

#[derive(Debug, serde::Deserialize)]
struct SearchParams {
    q: Option<String>,
}

/// A single search hit with context about which field matched.
struct SearchHit {
    id: String,
    title: String,
    kind: &'static str,
    type_name: String,
    matched_field: &'static str,
    context: String,
    url: String,
}

async fn search_view(
    State(state): State<Arc<AppState>>,
    Query(params): Query<SearchParams>,
) -> Html<String> {
    let query = match params.q.as_deref() {
        Some(q) if !q.trim().is_empty() => q.trim(),
        _ => {
            return Html(String::from(
                "<div class=\"cmd-k-empty\">Type to search artifacts and documents</div>",
            ));
        }
    };

    let query_lower = query.to_lowercase();
    let mut hits: Vec<SearchHit> = Vec::new();

    // Search artifacts
    for artifact in state.store.iter() {
        let id_lower = artifact.id.to_lowercase();
        let title_lower = artifact.title.to_lowercase();
        let type_lower = artifact.artifact_type.to_lowercase();

        if id_lower.contains(&query_lower) {
            hits.push(SearchHit {
                id: artifact.id.clone(),
                title: artifact.title.clone(),
                kind: "artifact",
                type_name: artifact.artifact_type.clone(),
                matched_field: "id",
                context: artifact.id.clone(),
                url: format!("/artifacts/{}", artifact.id),
            });
            continue;
        }
        if title_lower.contains(&query_lower) {
            hits.push(SearchHit {
                id: artifact.id.clone(),
                title: artifact.title.clone(),
                kind: "artifact",
                type_name: artifact.artifact_type.clone(),
                matched_field: "title",
                context: artifact.title.clone(),
                url: format!("/artifacts/{}", artifact.id),
            });
            continue;
        }
        if type_lower.contains(&query_lower) {
            hits.push(SearchHit {
                id: artifact.id.clone(),
                title: artifact.title.clone(),
                kind: "artifact",
                type_name: artifact.artifact_type.clone(),
                matched_field: "type",
                context: artifact.artifact_type.clone(),
                url: format!("/artifacts/{}", artifact.id),
            });
            continue;
        }
        if let Some(desc) = &artifact.description {
            if desc.to_lowercase().contains(&query_lower) {
                let desc_lower = desc.to_lowercase();
                let pos = desc_lower.find(&query_lower).unwrap_or(0);
                let start = pos.saturating_sub(40);
                let end = (pos + query.len() + 40).min(desc.len());
                let mut snippet = String::new();
                if start > 0 {
                    snippet.push_str("...");
                }
                snippet.push_str(&desc[start..end]);
                if end < desc.len() {
                    snippet.push_str("...");
                }
                hits.push(SearchHit {
                    id: artifact.id.clone(),
                    title: artifact.title.clone(),
                    kind: "artifact",
                    type_name: artifact.artifact_type.clone(),
                    matched_field: "description",
                    context: snippet,
                    url: format!("/artifacts/{}", artifact.id),
                });
                continue;
            }
        }
        for tag in &artifact.tags {
            if tag.to_lowercase().contains(&query_lower) {
                hits.push(SearchHit {
                    id: artifact.id.clone(),
                    title: artifact.title.clone(),
                    kind: "artifact",
                    type_name: artifact.artifact_type.clone(),
                    matched_field: "tag",
                    context: tag.clone(),
                    url: format!("/artifacts/{}", artifact.id),
                });
                break;
            }
        }
    }

    // Search documents
    for doc in state.doc_store.iter() {
        let id_lower = doc.id.to_lowercase();
        let title_lower = doc.title.to_lowercase();

        if id_lower.contains(&query_lower) {
            hits.push(SearchHit {
                id: doc.id.clone(),
                title: doc.title.clone(),
                kind: "document",
                type_name: doc.doc_type.clone(),
                matched_field: "id",
                context: doc.id.clone(),
                url: format!("/documents/{}", doc.id),
            });
            continue;
        }
        if title_lower.contains(&query_lower) {
            hits.push(SearchHit {
                id: doc.id.clone(),
                title: doc.title.clone(),
                kind: "document",
                type_name: doc.doc_type.clone(),
                matched_field: "title",
                context: doc.title.clone(),
                url: format!("/documents/{}", doc.id),
            });
        }
    }

    // Sort: exact id match first, then by kind, then by id
    hits.sort_by(|a, b| {
        let a_exact = a.id.to_lowercase() == query_lower;
        let b_exact = b.id.to_lowercase() == query_lower;
        b_exact
            .cmp(&a_exact)
            .then_with(|| a.kind.cmp(b.kind))
            .then_with(|| a.id.cmp(&b.id))
    });

    hits.truncate(50);

    if hits.is_empty() {
        return Html(format!(
            "<div class=\"cmd-k-empty\">No results for &ldquo;{}&rdquo;</div>",
            html_escape(query)
        ));
    }

    // Group by kind
    let mut html = String::new();

    let artifact_hits: Vec<&SearchHit> = hits.iter().filter(|h| h.kind == "artifact").collect();
    let document_hits: Vec<&SearchHit> = hits.iter().filter(|h| h.kind == "document").collect();

    if !artifact_hits.is_empty() {
        html.push_str("<div class=\"cmd-k-group\">");
        html.push_str("<div class=\"cmd-k-group-label\">Artifacts</div>");
        for hit in &artifact_hits {
            render_search_hit(&mut html, hit, query);
        }
        html.push_str("</div>");
    }

    if !document_hits.is_empty() {
        html.push_str("<div class=\"cmd-k-group\">");
        html.push_str("<div class=\"cmd-k-group-label\">Documents</div>");
        for hit in &document_hits {
            render_search_hit(&mut html, hit, query);
        }
        html.push_str("</div>");
    }

    Html(html)
}

/// Render a single search result item with highlighted match context.
fn render_search_hit(html: &mut String, hit: &SearchHit, query: &str) {
    let icon = match hit.kind {
        "artifact" => "&#9830;",
        "document" => "&#9776;",
        _ => "&#8226;",
    };

    let highlighted_title = highlight_match(&html_escape(&hit.title), query);

    let field_label = match hit.matched_field {
        "id" => "id",
        "title" => "title",
        "description" => "description",
        "type" => "type",
        "tag" => "tag",
        _ => "",
    };

    let context_display = if hit.matched_field == "title" {
        String::new()
    } else {
        let escaped = html_escape(&hit.context);
        format!(" &mdash; {}", highlight_match(&escaped, query))
    };

    html.push_str(&format!(
        "<div class=\"cmd-k-item\" data-url=\"{}\">\
           <div class=\"cmd-k-item-icon\">{icon}</div>\
           <div class=\"cmd-k-item-body\">\
             <div class=\"cmd-k-item-title\">{highlighted_title}</div>\
             <div class=\"cmd-k-item-meta\">{}{context_display}</div>\
           </div>\
           <div class=\"cmd-k-item-field\">{field_label}</div>\
         </div>",
        html_escape(&hit.url),
        html_escape(&hit.type_name),
    ));
}

/// Case-insensitive highlight: wraps matching substrings in `<mark>`.
fn highlight_match(text: &str, query: &str) -> String {
    let text_lower = text.to_lowercase();
    let query_lower = query.to_lowercase();
    let mut result = String::with_capacity(text.len() + 16);
    let mut start = 0;
    while let Some(pos) = text_lower[start..].find(&query_lower) {
        let abs = start + pos;
        result.push_str(&text[start..abs]);
        result.push_str("<mark>");
        result.push_str(&text[abs..abs + query.len()]);
        result.push_str("</mark>");
        start = abs + query.len();
    }
    result.push_str(&text[start..]);
    result
}

// ── Helpers ──────────────────────────────────────────────────────────────

fn html_escape(s: &str) -> String {
    s.replace('&', "&amp;")
        .replace('<', "&lt;")
        .replace('>', "&gt;")
        .replace('"', "&quot;")
}
