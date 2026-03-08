use std::sync::Arc;

use anyhow::Result;
use axum::Router;
use axum::extract::{Path, Query, State};
use axum::response::Html;
use axum::routing::get;

use rivet_core::links::LinkGraph;
use rivet_core::matrix::{self, Direction};
use rivet_core::schema::{Schema, SchemaFile, Severity};
use rivet_core::store::Store;
use rivet_core::validate;

/// Shared application state loaded once at startup.
struct AppState {
    store: Store,
    schema: Schema,
    schema_files: Vec<SchemaFile>,
    graph: LinkGraph,
}

/// Start the axum HTTP server on the given port.
pub async fn run(
    store: Store,
    schema: Schema,
    schema_files: Vec<SchemaFile>,
    graph: LinkGraph,
    port: u16,
) -> Result<()> {
    let state = Arc::new(AppState {
        store,
        schema,
        schema_files,
        graph,
    });

    let app = Router::new()
        .route("/", get(index))
        .route("/artifacts", get(artifacts_list))
        .route("/artifacts/{id}", get(artifact_detail))
        .route("/validate", get(validate_view))
        .route("/matrix", get(matrix_view))
        .route("/stats", get(stats_view))
        .route("/schemas", get(schemas_view))
        .with_state(state);

    let addr = format!("0.0.0.0:{port}");
    eprintln!("rivet dashboard listening on http://localhost:{port}");

    let listener = tokio::net::TcpListener::bind(&addr).await?;
    axum::serve(listener, app).await?;
    Ok(())
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
main{flex:1;padding:2rem 2.5rem;max-width:1100px}
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
.nav-badge{display:inline-block;padding:.1rem .4rem;border-radius:10px;font-size:.7rem;font-weight:700;
           background:#3a3a5e;color:#c0c0d0;margin-left:.35rem;min-width:1.2rem;text-align:center}
.nav-badge-error{background:#c62828;color:#fff}
.nav-badge-warn{background:#e6a700;color:#1a1a2e}
.nav-badge-ok{background:#2e7d32;color:#fff}
.schema-group{margin-bottom:1.5rem}
.schema-group h3{border-bottom:2px solid #dee2e6;padding-bottom:.35rem}
"#;

// ── Layout ───────────────────────────────────────────────────────────────

fn layout(state: &AppState, content: &str) -> Html<String> {
    let artifact_count = state.store.len();
    let diagnostics = validate::validate(&state.store, &state.schema, &state.graph);
    let diag_count = diagnostics.len();
    let error_count = diagnostics
        .iter()
        .filter(|d| d.severity == Severity::Error)
        .count();
    let schema_count = state.schema.artifact_types.len();

    let diag_badge = if error_count > 0 {
        format!(r##"<span class="nav-badge nav-badge-error">{diag_count}</span>"##)
    } else if diag_count > 0 {
        format!(r##"<span class="nav-badge nav-badge-warn">{diag_count}</span>"##)
    } else {
        r##"<span class="nav-badge nav-badge-ok">0</span>"##.to_string()
    };

    Html(format!(
        r###"<!DOCTYPE html>
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
    <li><a hx-get="/stats" hx-target="#content" hx-push-url="false" href="#">Overview</a></li>
    <li><a hx-get="/artifacts" hx-target="#content" hx-push-url="false" href="#">Artifacts <span class="nav-badge">{artifact_count}</span></a></li>
    <li><a hx-get="/validate" hx-target="#content" hx-push-url="false" href="#">Validation {diag_badge}</a></li>
    <li><a hx-get="/matrix" hx-target="#content" hx-push-url="false" href="#">Matrix</a></li>
    <li><a hx-get="/schemas" hx-target="#content" hx-push-url="false" href="#">Schemas <span class="nav-badge">{schema_count}</span></a></li>
  </ul>
</nav>
<main id="content">
{content}
</main>
</div>
</body>
</html>"###
    ))
}

// ── Routes ───────────────────────────────────────────────────────────────

async fn index(State(state): State<Arc<AppState>>) -> Html<String> {
    let inner = stats_partial(&state);
    layout(&state, &inner)
}

async fn stats_view(State(state): State<Arc<AppState>>) -> Html<String> {
    Html(stats_partial(&state))
}

fn stats_partial(state: &AppState) -> String {
    let store = &state.store;
    let graph = &state.graph;

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

    html.push_str("<p><a hx-get=\"/artifacts\" hx-target=\"#content\" href=\"#\">&larr; Back to artifacts</a></p>");

    Html(html)
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

// ── Schemas ─────────────────────────────────────────────────────────────

async fn schemas_view(State(state): State<Arc<AppState>>) -> Html<String> {
    let mut html = String::from("<h2>Schemas</h2>");

    for file in &state.schema_files {
        html.push_str(&format!(
            "<div class=\"card schema-group\"><h3>{} v{}</h3>",
            html_escape(&file.schema.name),
            html_escape(&file.schema.version)
        ));
        if let Some(desc) = &file.schema.description {
            html.push_str(&format!("<p>{}</p>", html_escape(desc)));
        }

        if !file.artifact_types.is_empty() {
            html.push_str("<h4>Artifact Types</h4><table><thead><tr><th>Name</th><th>Description</th></tr></thead><tbody>");
            for at in &file.artifact_types {
                html.push_str(&format!(
                    "<tr><td><span class=\"badge badge-type\">{}</span></td><td>{}</td></tr>",
                    html_escape(&at.name),
                    html_escape(&at.description)
                ));
            }
            html.push_str("</tbody></table>");
        }

        if !file.link_types.is_empty() {
            html.push_str("<h4>Link Types</h4><table><thead><tr><th>Name</th><th>Inverse</th><th>Description</th></tr></thead><tbody>");
            for lt in &file.link_types {
                let inv = lt.inverse.as_deref().unwrap_or("-");
                html.push_str(&format!(
                    "<tr><td>{}</td><td>{}</td><td>{}</td></tr>",
                    html_escape(&lt.name),
                    html_escape(inv),
                    html_escape(&lt.description)
                ));
            }
            html.push_str("</tbody></table>");
        }

        html.push_str("</div>");
    }

    Html(html)
}

// ── Helpers ──────────────────────────────────────────────────────────────

fn html_escape(s: &str) -> String {
    s.replace('&', "&amp;")
        .replace('<', "&lt;")
        .replace('>', "&gt;")
        .replace('"', "&quot;")
}
