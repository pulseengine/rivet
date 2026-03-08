use std::collections::HashMap;
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
        .route("/documents", get(documents_list))
        .route("/documents/{id}", get(document_detail))
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

// ── CSS ──────────────────────────────────────────────────────────────────

const CSS: &str = r#"
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
     color:#1a1a2e;background:#f8f9fa;line-height:1.6}
a{color:#3a86ff;text-decoration:none}
a:hover{text-decoration:underline}
.shell{display:flex;min-height:100vh}
nav{width:220px;background:#1a1a2e;color:#e0e0e0;padding:1.5rem 1rem;flex-shrink:0}
nav h1{font-size:1.2rem;color:#fff;margin-bottom:1.5rem;letter-spacing:.05em}
nav ul{list-style:none}
nav li{margin-bottom:.25rem}
nav a{display:block;padding:.45rem .75rem;border-radius:6px;color:#c0c0d0;font-size:.9rem}
nav a:hover,nav a.active{background:#2a2a4e;color:#fff;text-decoration:none}
main{flex:1;padding:2rem 2.5rem;max-width:1400px}
h2{font-size:1.35rem;margin-bottom:1rem;color:#1a1a2e}
h3{font-size:1.1rem;margin:1.25rem 0 .5rem;color:#333}
table{width:100%;border-collapse:collapse;margin-bottom:1.5rem}
th,td{text-align:left;padding:.5rem .75rem;border-bottom:1px solid #dee2e6}
th{background:#e9ecef;font-weight:600;font-size:.85rem;text-transform:uppercase;letter-spacing:.03em;color:#495057}
td{font-size:.9rem}
tr:hover td{background:#f1f3f5}
.badge{display:inline-block;padding:.15rem .5rem;border-radius:4px;font-size:.78rem;font-weight:600}
.badge-error{background:#ffe0e0;color:#c62828}
.badge-warn{background:#fff3cd;color:#856404}
.badge-info{background:#d1ecf1;color:#0c5460}
.badge-ok{background:#d4edda;color:#155724}
.badge-type{background:#e8e0f0;color:#4a148c}
.card{background:#fff;border:1px solid #dee2e6;border-radius:8px;padding:1.25rem;margin-bottom:1rem;box-shadow:0 1px 3px rgba(0,0,0,.04)}
.stat-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:1rem;margin-bottom:1.5rem}
.stat-box{background:#fff;border:1px solid #dee2e6;border-radius:8px;padding:1rem;text-align:center}
.stat-box .number{font-size:2rem;font-weight:700;color:#3a86ff}
.stat-box .label{font-size:.85rem;color:#6c757d}
.link-pill{display:inline-block;padding:.1rem .4rem;border-radius:3px;font-size:.8rem;background:#e9ecef;margin:.1rem}
.form-row{display:flex;gap:.75rem;align-items:end;flex-wrap:wrap;margin-bottom:1rem}
.form-row label{font-size:.85rem;font-weight:600;color:#495057}
.form-row select,.form-row input{padding:.4rem .6rem;border:1px solid #ced4da;border-radius:4px;font-size:.9rem}
.form-row button{padding:.4rem 1rem;background:#3a86ff;color:#fff;border:none;border-radius:4px;
                  font-size:.9rem;cursor:pointer}
.form-row button:hover{background:#2a6fdf}
dl{margin:.5rem 0}
dt{font-weight:600;font-size:.85rem;color:#495057;margin-top:.5rem}
dd{margin-left:0;margin-bottom:.25rem}
.meta{color:#6c757d;font-size:.85rem}
.nav-icon{display:inline-block;width:1.1rem;text-align:center;margin-right:.3rem;font-size:.85rem}
.graph-container{border:1px solid #dee2e6;border-radius:8px;overflow:hidden;background:#fafbfc;cursor:grab;
     height:calc(100vh - 280px);min-height:400px;position:relative}
.graph-container:active{cursor:grabbing}
.graph-container svg{display:block;width:100%;height:100%;position:absolute;top:0;left:0}
.graph-controls{position:absolute;top:.5rem;right:.5rem;display:flex;flex-direction:column;gap:.25rem;z-index:10}
.graph-controls button{width:32px;height:32px;border:1px solid #ced4da;border-radius:4px;
     background:#fff;font-size:1rem;cursor:pointer;display:flex;align-items:center;justify-content:center}
.graph-controls button:hover{background:#e9ecef}
.graph-legend{display:flex;flex-wrap:wrap;gap:.75rem;padding:.5rem 0;font-size:.82rem}
.graph-legend-item{display:flex;align-items:center;gap:.3rem}
.graph-legend-swatch{width:14px;height:14px;border-radius:3px;border:1px solid #0002;flex-shrink:0}
.filter-grid{display:flex;flex-wrap:wrap;gap:.5rem;margin-bottom:.75rem}
.filter-grid label{font-size:.82rem;display:flex;align-items:center;gap:.25rem}
.filter-grid input[type="checkbox"]{margin:0}
.doc-body{line-height:1.75;font-size:.95rem}
.doc-body h1{font-size:1.5rem;margin:1.5rem 0 .75rem;color:#1a1a2e;border-bottom:1px solid #dee2e6;padding-bottom:.3rem}
.doc-body h2{font-size:1.25rem;margin:1.25rem 0 .5rem;color:#333}
.doc-body h3{font-size:1.1rem;margin:1rem 0 .4rem;color:#495057}
.doc-body p{margin:.5rem 0}
.doc-body ul{margin:.5rem 0 .5rem 1.5rem}
.doc-body li{margin:.2rem 0}
.artifact-ref{display:inline-block;padding:.1rem .45rem;border-radius:4px;font-size:.85rem;
     font-weight:600;background:#e8f0fe;color:#1a73e8;cursor:pointer;text-decoration:none;
     border:1px solid #c6dafc}
.artifact-ref:hover{background:#c6dafc;text-decoration:none}
.artifact-ref.broken{background:#fce8e6;color:#c62828;border-color:#f4c7c3;cursor:default}
.doc-glossary{font-size:.9rem}
.doc-glossary dt{font-weight:600;color:#333}
.doc-glossary dd{margin:0 0 .4rem 1rem;color:#555}
.doc-toc{font-size:.88rem;background:#f8f9fa;border:1px solid #dee2e6;border-radius:6px;padding:.75rem 1rem;margin-bottom:1rem}
.doc-toc ul{list-style:none;margin:0;padding:0}
.doc-toc li{margin:.15rem 0}
.doc-toc .toc-h2{padding-left:0}
.doc-toc .toc-h3{padding-left:1rem}
.doc-toc .toc-h4{padding-left:2rem}
.doc-meta{display:flex;gap:1rem;flex-wrap:wrap;align-items:center;margin-bottom:1rem}
"#;

// ── Pan/zoom JS ──────────────────────────────────────────────────────────

const GRAPH_JS: &str = r#"
<script>
(function(){
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

// ── Layout ───────────────────────────────────────────────────────────────

fn page_layout(content: &str) -> Html<String> {
    Html(format!(
        r##"<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Rivet Dashboard</title>
<style>{CSS}</style>
<script src="https://unpkg.com/htmx.org@2.0.4"></script>
</head>
<body>
<div class="shell">
<nav>
  <h1>Rivet</h1>
  <ul>
    <li><a hx-get="/stats" hx-target="#content" hx-push-url="false" href="#"><span class="nav-icon">&#9632;</span> Overview</a></li>
    <li><a hx-get="/artifacts" hx-target="#content" hx-push-url="false" href="#"><span class="nav-icon">&#9830;</span> Artifacts</a></li>
    <li><a hx-get="/validate" hx-target="#content" hx-push-url="false" href="#"><span class="nav-icon">&#10003;</span> Validation</a></li>
    <li><a hx-get="/matrix" hx-target="#content" hx-push-url="false" href="#"><span class="nav-icon">&#9638;</span> Matrix</a></li>
    <li><a hx-get="/graph" hx-target="#content" hx-push-url="false" href="#"><span class="nav-icon">&#9679;</span> Graph</a></li>
    <li><a hx-get="/documents" hx-target="#content" hx-push-url="false" href="#"><span class="nav-icon">&#9776;</span> Documents</a></li>
  </ul>
</nav>
<main id="content">
{content}
</main>
</div>
{GRAPH_JS}
</body>
</html>"##
    ))
}

// ── Routes ───────────────────────────────────────────────────────────────

async fn index(State(state): State<Arc<AppState>>) -> Html<String> {
    let inner = stats_partial(&state);
    page_layout(&inner)
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

    // Summary cards
    html.push_str("<div class=\"stat-grid\">");
    html.push_str(&format!(
        "<div class=\"stat-box\"><div class=\"number\">{}</div><div class=\"label\">Artifacts</div></div>",
        store.len()
    ));
    html.push_str(&format!(
        "<div class=\"stat-box\"><div class=\"number\">{}</div><div class=\"label\">Types</div></div>",
        types.len()
    ));
    html.push_str(&format!(
        "<div class=\"stat-box\"><div class=\"number\">{}</div><div class=\"label\">Orphans</div></div>",
        orphans.len()
    ));
    html.push_str(&format!(
        "<div class=\"stat-box\"><div class=\"number\">{}</div><div class=\"label\">Errors</div></div>",
        errors
    ));
    html.push_str(&format!(
        "<div class=\"stat-box\"><div class=\"number\">{}</div><div class=\"label\">Warnings</div></div>",
        warnings
    ));
    html.push_str(&format!(
        "<div class=\"stat-box\"><div class=\"number\">{}</div><div class=\"label\">Broken Links</div></div>",
        graph.broken.len()
    ));
    if !doc_store.is_empty() {
        html.push_str(&format!(
            "<div class=\"stat-box\"><div class=\"number\">{}</div><div class=\"label\">Documents</div></div>",
            doc_store.len()
        ));
    }
    html.push_str("</div>");

    // By-type table
    html.push_str("<div class=\"card\"><h3>Artifacts by Type</h3><table><thead><tr><th>Type</th><th>Count</th></tr></thead><tbody>");
    for t in &types {
        html.push_str(&format!(
            "<tr><td><span class=\"badge badge-type\">{t}</span></td><td>{}</td></tr>",
            store.count_by_type(t)
        ));
    }
    html.push_str("</tbody></table></div>");

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
    html.push_str(
        "<table><thead><tr><th>ID</th><th>Type</th><th>Title</th><th>Status</th><th>Links</th></tr></thead><tbody>",
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
             <td><span class=\"badge badge-type\">{}</span></td>\
             <td>{}</td>\
             <td>{}</td>\
             <td>{}</td></tr>",
            html_escape(&a.id),
            html_escape(&a.id),
            html_escape(&a.artifact_type),
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
        "<h2>{}</h2><p class=\"meta\"><span class=\"badge badge-type\">{}</span></p>",
        html_escape(&artifact.id),
        html_escape(&artifact.artifact_type)
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

    // Show in graph link
    html.push_str(&format!(
        r##"<p><a hx-get="/artifacts/{id_esc}/graph" hx-target="#content" href="#">Show in graph</a>
        &nbsp;|&nbsp;
        <a hx-get="/artifacts" hx-target="#content" href="#">&larr; Back to artifacts</a></p>"##,
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

    // Summary
    let overall = if errors > 0 {
        "<span class=\"badge badge-error\">FAIL</span>"
    } else {
        "<span class=\"badge badge-ok\">PASS</span>"
    };
    html.push_str(&format!(
        "<p>Status: {overall} &mdash; {errors} errors, {warnings} warnings, {infos} info</p>"
    ));

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
             <td><span class=\"badge badge-type\">{}</span></td>\
             <td>{}</td>\
             <td>{}</td>\
             <td>{}</td></tr>",
            html_escape(&doc.id),
            html_escape(&doc.id),
            html_escape(&doc.doc_type),
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
    html.push_str(&format!(
        "<span class=\"badge badge-type\">{}</span>",
        html_escape(&doc.doc_type)
    ));
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
                     <td><span class=\"badge badge-type\">{}</span></td>\
                     <td>{}</td>\
                     <td>{}</td></tr>",
                    html_escape(&artifact.id),
                    html_escape(&artifact.id),
                    html_escape(&artifact.artifact_type),
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

// ── Helpers ──────────────────────────────────────────────────────────────

fn html_escape(s: &str) -> String {
    s.replace('&', "&amp;")
        .replace('<', "&lt;")
        .replace('>', "&gt;")
        .replace('"', "&quot;")
}
