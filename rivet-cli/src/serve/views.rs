// ── View handlers ────────────────────────────────────────────────────────
//
// All route handler functions and their associated param structs.

use std::collections::{BTreeMap, HashMap};

use axum::extract::{Path, Query, State};
use axum::response::Html;
use petgraph::graph::{Graph, NodeIndex};
use petgraph::visit::EdgeRef;

use etch::filter::ego_subgraph;
use etch::layout::{self as pgv_layout, EdgeInfo, LayoutOptions, NodeInfo};
use etch::svg::{SvgOptions, render_svg};
use rivet_core::adapter::{Adapter, AdapterConfig, AdapterSource};
use rivet_core::coverage;
use rivet_core::diff::ArtifactDiff;
use rivet_core::document::{self, html_escape};
use rivet_core::formats::generic::GenericYamlAdapter;
use rivet_core::links::LinkGraph;
use rivet_core::markdown::{render_markdown, strip_html_tags};
use rivet_core::matrix::{self, Direction};
use rivet_core::model::ProjectConfig;
use rivet_core::schema::Severity;
use rivet_core::store::Store;
use rivet_core::validate;

use super::layout;
use super::{AppState, SharedState, badge_for_type, type_color_map};
use crate::{docs, schema_cmd};

// ── Routes ───────────────────────────────────────────────────────────────

pub(crate) async fn index(State(state): State<SharedState>) -> Html<String> {
    let state = state.read().await;
    let inner = stats_partial(&state);
    layout::page_layout(&inner, &state)
}

pub(crate) async fn stats_view(State(state): State<SharedState>) -> Html<String> {
    let state = state.read().await;
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

    // Project header
    let mut html = format!(
        "<div style=\"margin-bottom:1.5rem\">\
         <h2 style=\"margin:0\">Project Overview</h2>\
         <p style=\"color:var(--text-secondary);margin:0.25rem 0 0\">{} &mdash; {} artifact types, {} traceability rules</p>\
         </div>",
        html_escape(&state.context.project_name),
        types.len(),
        state.schema.traceability_rules.len(),
    );

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
    html.push_str(&format!(
        "<div class=\"stat-box stat-blue\"><div class=\"number\">{}</div><div class=\"label\">Documents</div></div>",
        doc_store.len()
    ));
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
                "<tr><td><a hx-get=\"/artifacts/{id}\" hx-target=\"#content\" hx-push-url=\"true\" href=\"#\">{id}</a></td></tr>"
            ));
        }
        html.push_str("</tbody></table></div>");
    }

    // ── Coverage summary card ────────────────────────────────────────
    let cov_report = coverage::compute_coverage(store, &state.schema, graph);
    if !cov_report.entries.is_empty() {
        let overall = cov_report.overall_coverage();
        let cov_color = if overall >= 80.0 {
            "#15713a"
        } else if overall >= 50.0 {
            "#b8860b"
        } else {
            "#c62828"
        };
        let total_covered: usize = cov_report.entries.iter().map(|e| e.covered).sum();
        let total_items: usize = cov_report.entries.iter().map(|e| e.total).sum();
        html.push_str(&format!(
            "<div class=\"card\">\
             <h3>Traceability Coverage</h3>\
             <div style=\"display:flex;align-items:center;gap:1.5rem;margin-bottom:0.75rem\">\
               <div style=\"font-size:2rem;font-weight:700;color:{cov_color}\">{overall:.0}%</div>\
               <div style=\"flex:1\">\
                 <div class=\"status-bar-track\" style=\"height:0.6rem\">\
                   <div class=\"status-bar-fill\" style=\"background:{cov_color};width:{overall:.1}%\"></div>\
                 </div>\
                 <div style=\"color:var(--text-secondary);font-size:.8rem;margin-top:.35rem\">\
                   {total_covered} / {total_items} artifacts covered across {} rules\
                 </div>\
               </div>\
             </div>\
             <a href=\"#\" hx-get=\"/coverage\" hx-target=\"#content\" hx-push-url=\"true\" \
                style=\"font-size:.85rem;color:var(--accent);text-decoration:none\">\
                View full coverage report &rarr;</a>\
             </div>",
            cov_report.entries.len(),
        ));
    }

    // ── Test results summary ─────────────────────────────────────────
    if !state.result_store.is_empty() {
        let summary = state.result_store.summary();
        let rate = summary.pass_rate();
        let rate_color = if rate >= 80.0 {
            "#15713a"
        } else if rate >= 50.0 {
            "#b8860b"
        } else {
            "#c62828"
        };
        html.push_str("<div class=\"card\"><h3>Test Results</h3>");
        html.push_str(&format!(
            "<div style=\"display:flex;align-items:center;gap:1.5rem;margin-bottom:0.5rem\">\
             <div style=\"font-size:2rem;font-weight:700;color:{rate_color}\">{rate:.0}%</div>\
             <div style=\"flex:1\">\
               <div class=\"status-bar-track\" style=\"height:0.6rem\">\
                 <div class=\"status-bar-fill\" style=\"background:{rate_color};width:{rate:.1}%\"></div>\
               </div>\
             </div>\
             </div>"
        ));
        html.push_str("<div style=\"display:flex;gap:1.25rem;font-size:.85rem;color:var(--text-secondary);margin-bottom:0.75rem\">");
        html.push_str(&format!(
            "<span>{} runs</span>\
             <span style=\"color:#15713a\">{} passed</span>\
             <span style=\"color:#c62828\">{} failed</span>",
            summary.total_runs, summary.pass_count, summary.fail_count,
        ));
        if summary.skip_count > 0 {
            html.push_str(&format!(
                "<span style=\"color:#b8860b\">{} skipped</span>",
                summary.skip_count,
            ));
        }
        if summary.blocked_count > 0 {
            html.push_str(&format!(
                "<span style=\"color:#b8860b\">{} blocked</span>",
                summary.blocked_count,
            ));
        }
        html.push_str("</div>");
        html.push_str(
            "<a href=\"#\" hx-get=\"/results\" hx-target=\"#content\" hx-push-url=\"true\" \
             style=\"font-size:.85rem;color:var(--accent);text-decoration:none\">\
             View all test runs &rarr;</a>",
        );
        html.push_str("</div>");
    }

    // ── Quick links ──────────────────────────────────────────────────
    // Count verifiable types for the verification link badge
    let ver_count = {
        let mut count = 0usize;
        for rule in &state.schema.traceability_rules {
            if rule.required_backlink.as_deref() == Some("verifies") {
                count += store.by_type(&rule.source_type).len();
            }
        }
        count
    };

    html.push_str(
        "<div style=\"margin-top:1.5rem\">\
         <h3 style=\"margin-bottom:0.75rem\">Quick Links</h3>\
         <div style=\"display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:0.75rem\">",
    );
    html.push_str(&format!(
        "<a href=\"#\" hx-get=\"/verification\" hx-target=\"#content\" hx-push-url=\"true\" \
         style=\"display:block;padding:1rem;background:var(--surface);border:1px solid var(--border);\
         border-radius:var(--radius-sm);text-decoration:none;color:var(--text)\">\
         <div style=\"font-weight:600;margin-bottom:.25rem\">Verification</div>\
         <div style=\"font-size:.85rem;color:var(--text-secondary)\">{ver_count} requirements</div>\
         </a>",
    ));
    html.push_str(&format!(
        "<a href=\"#\" hx-get=\"/documents\" hx-target=\"#content\" hx-push-url=\"true\" \
         style=\"display:block;padding:1rem;background:var(--surface);border:1px solid var(--border);\
         border-radius:var(--radius-sm);text-decoration:none;color:var(--text)\">\
         <div style=\"font-weight:600;margin-bottom:.25rem\">Documents</div>\
         <div style=\"font-size:.85rem;color:var(--text-secondary)\">{} loaded</div>\
         </a>",
        doc_store.len(),
    ));
    html.push_str(
        "<a href=\"#\" hx-get=\"/graph\" hx-target=\"#content\" hx-push-url=\"true\" \
         style=\"display:block;padding:1rem;background:var(--surface);border:1px solid var(--border);\
         border-radius:var(--radius-sm);text-decoration:none;color:var(--text)\">\
         <div style=\"font-weight:600;margin-bottom:.25rem\">Traceability Graph</div>\
         <div style=\"font-size:.85rem;color:var(--text-secondary)\">Full link graph</div>\
         </a>",
    );
    html.push_str("</div></div>");

    html
}

// ── Externals ────────────────────────────────────────────────────────────

/// GET /externals — list all configured external projects.
pub(crate) async fn externals_list(State(state): State<SharedState>) -> Html<String> {
    let state = state.read().await;
    let externals = &state.externals;

    let mut html = String::from("<h2>External Projects</h2>");

    if externals.is_empty() {
        html.push_str(
            "<div class=\"card\"><p>No external projects configured. \
             Add an <code>externals</code> section to <code>rivet.yaml</code> to enable cross-repo linking.</p></div>",
        );
        return Html(html);
    }

    html.push_str(
        "<div class=\"card\"><h3>Configured Externals</h3>\
         <table><thead><tr><th>Prefix</th><th>Source</th><th>Status</th><th>Artifacts</th></tr></thead><tbody>",
    );
    for ext in externals {
        let status_badge = if ext.synced {
            "<span class=\"badge badge-ok\">synced</span>".to_string()
        } else {
            "<span class=\"badge badge-warn\">not synced</span>".to_string()
        };
        let prefix_link = if ext.synced && !ext.store.is_empty() {
            format!(
                "<a hx-get=\"/externals/{}\" hx-target=\"#content\" hx-push-url=\"true\" href=\"#\">{}</a>",
                html_escape(&ext.prefix),
                html_escape(&ext.prefix)
            )
        } else {
            html_escape(&ext.prefix)
        };
        html.push_str(&format!(
            "<tr><td><code>{prefix_link}</code></td>\
             <td><code>{}</code></td>\
             <td>{status_badge}</td>\
             <td>{}</td></tr>",
            html_escape(&ext.source),
            ext.store.len(),
        ));
    }
    html.push_str("</tbody></table></div>");

    // Show a hint for un-synced externals
    let any_unsynced = externals.iter().any(|e| !e.synced);
    if any_unsynced {
        html.push_str(
            "<div class=\"card\" style=\"background:#fff8e1;border-color:#e6d48e\">\
             <p style=\"color:#8b6914;margin:0\">Some externals are not synced. \
             Run <code>rivet sync</code> to fetch them.</p></div>",
        );
    }

    Html(html)
}

/// GET /externals/{prefix} — show artifacts from a specific external project.
pub(crate) async fn external_detail(
    State(state): State<SharedState>,
    Path(prefix): Path<String>,
) -> Html<String> {
    let state = state.read().await;

    let Some(ext) = state.externals.iter().find(|e| e.prefix == prefix) else {
        return Html(format!(
            "<h2>Not Found</h2><p>External project <code>{}</code> is not configured.</p>",
            html_escape(&prefix)
        ));
    };

    if !ext.synced {
        return Html(format!(
            "<h2>External: {}</h2>\
             <div class=\"card\" style=\"background:#fff8e1;border-color:#e6d48e\">\
             <p style=\"color:#8b6914;margin:0\">This external project has not been synced yet. \
             Run <code>rivet sync</code> to fetch it.</p></div>",
            html_escape(&ext.prefix)
        ));
    }

    let mut html = format!(
        "<h2>External: {}</h2>\
         <p class=\"meta\">Source: <code>{}</code> &mdash; {} artifacts</p>",
        html_escape(&ext.prefix),
        html_escape(&ext.source),
        ext.store.len(),
    );

    let mut artifacts: Vec<_> = ext.store.iter().collect();
    artifacts.sort_by(|a, b| a.id.cmp(&b.id));

    // Client-side filter
    html.push_str("<div style=\"position:relative;margin-bottom:1rem\">\
        <svg width=\"15\" height=\"15\" viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" style=\"position:absolute;left:.75rem;top:50%;transform:translateY(-50%);opacity:.4\"><circle cx=\"7\" cy=\"7\" r=\"4.5\"/><path d=\"M10.5 10.5L14 14\"/></svg>\
        <input type=\"search\" id=\"ext-artifact-filter\" placeholder=\"Filter artifacts...\" \
        style=\"width:100%;padding:.6rem .75rem .6rem 2.25rem;border:1px solid var(--border);border-radius:var(--radius-sm);font-size:.875rem;font-family:var(--font);background:var(--surface);color:var(--text);outline:none\" \
        oninput=\"filterExtTable(this.value)\">\
        </div>");

    html.push_str(
        "<table id=\"ext-artifacts-table\"><thead><tr><th>ID</th><th>Type</th><th>Title</th><th>Status</th><th>Links</th></tr></thead><tbody>",
    );

    for a in &artifacts {
        let status = a.status.as_deref().unwrap_or("-");
        let status_badge = match status {
            "approved" => format!("<span class=\"badge badge-ok\">{status}</span>"),
            "draft" => format!("<span class=\"badge badge-warn\">{status}</span>"),
            "obsolete" => format!("<span class=\"badge badge-error\">{status}</span>"),
            _ => format!("<span class=\"badge badge-info\">{status}</span>"),
        };
        // Link using cross-repo ID format: prefix:ID
        let qualified_id = format!("{}:{}", ext.prefix, a.id);
        html.push_str(&format!(
            "<tr><td><a hx-get=\"/artifacts/{}\" hx-target=\"#content\" hx-push-url=\"true\" href=\"#\">{}</a></td>\
             <td>{}</td>\
             <td>{}</td>\
             <td>{}</td>\
             <td>{}</td></tr>",
            html_escape(&qualified_id),
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

    // Filter script
    html.push_str(
        "<script>\
        function filterExtTable(q){\
          q=q.toLowerCase();\
          document.querySelectorAll('#ext-artifacts-table tbody tr').forEach(function(r){\
            r.style.display=r.textContent.toLowerCase().includes(q)?'':'none';\
          });\
        }\
        </script>",
    );

    // Back button
    html.push_str(
        "<div class=\"detail-actions\">\
         <a class=\"btn btn-secondary\" hx-get=\"/externals\" hx-target=\"#content\" hx-push-url=\"true\" href=\"#\">&larr; Back to externals</a>\
         </div>",
    );

    Html(html)
}

// ── Artifacts ────────────────────────────────────────────────────────────

pub(crate) async fn artifacts_list(State(state): State<SharedState>) -> Html<String> {
    let state = state.read().await;
    let store = &state.store;

    let mut artifacts: Vec<_> = store.iter().collect();
    artifacts.sort_by(|a, b| a.id.cmp(&b.id));

    let mut html = String::from("<h2>Artifacts</h2>");

    // Controls bar: search + group-by
    html.push_str("<div style=\"display:flex;gap:1rem;align-items:center;margin-bottom:1rem;flex-wrap:wrap\">");
    html.push_str("<div style=\"position:relative;flex:1;min-width:200px\">\
        <svg width=\"15\" height=\"15\" viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" style=\"position:absolute;left:.75rem;top:50%;transform:translateY(-50%);opacity:.4\"><circle cx=\"7\" cy=\"7\" r=\"4.5\"/><path d=\"M10.5 10.5L14 14\"/></svg>\
        <input type=\"search\" id=\"artifact-filter\" placeholder=\"Filter artifacts...\" \
        style=\"width:100%;padding:.6rem .75rem .6rem 2.25rem;border:1px solid var(--border);border-radius:var(--radius-sm);font-size:.875rem;font-family:var(--font);background:var(--surface);color:var(--text);outline:none\" \
        oninput=\"filterTable(this.value)\">\
        </div>");
    html.push_str("<div class=\"form-row\" style=\"margin-bottom:0\">\
        <label for=\"group-by\" style=\"margin-right:.25rem\">Group by</label>\
        <select id=\"group-by\" onchange=\"groupArtifacts(this.value)\" style=\"padding:.4rem .6rem;font-size:.82rem\">\
        <option value=\"none\">No grouping</option>\
        <option value=\"type\">Type</option>\
        <option value=\"status\">Status</option>\
        <option value=\"tag\">First tag</option>\
        </select></div>");
    html.push_str("</div>");

    // Layout: sidebar + main table
    html.push_str("<div class=\"artifacts-layout\">");

    // Main table area
    html.push_str("<div class=\"artifacts-main\">");
    html.push_str(
        "<table class=\"sortable\" id=\"artifacts-table\"><thead><tr>\
         <th>ID</th><th>Type</th><th>Title</th><th>Status</th><th>Links</th><th data-col=\"tags\">Tags</th>\
         </tr></thead><tbody>",
    );

    for a in &artifacts {
        let status = a.status.as_deref().unwrap_or("-");
        let status_badge = match status {
            "approved" => format!("<span class=\"badge badge-ok\">{status}</span>"),
            "draft" => format!("<span class=\"badge badge-warn\">{status}</span>"),
            "obsolete" => format!("<span class=\"badge badge-error\">{status}</span>"),
            _ => format!("<span class=\"badge badge-info\">{status}</span>"),
        };
        let tags_csv = a.tags.join(",");
        let tags_display = if a.tags.is_empty() {
            String::from("-")
        } else {
            a.tags
                .iter()
                .map(|t| {
                    format!(
                        "<span class=\"badge badge-info\" style=\"font-size:.68rem;margin:.1rem\">{}</span>",
                        html_escape(t)
                    )
                })
                .collect::<Vec<_>>()
                .join(" ")
        };
        html.push_str(&format!(
            "<tr><td><a hx-get=\"/artifacts/{}\" hx-target=\"#content\" hx-push-url=\"true\" href=\"#\">{}</a></td>\
             <td>{}</td>\
             <td>{}</td>\
             <td>{}</td>\
             <td>{}</td>\
             <td data-tags=\"{}\">{}</td></tr>",
            html_escape(&a.id),
            html_escape(&a.id),
            badge_for_type(&a.artifact_type),
            html_escape(&a.title),
            status_badge,
            a.links.len(),
            html_escape(&tags_csv),
            tags_display,
        ));
    }

    html.push_str("</tbody></table>");
    html.push_str(&format!(
        "<p class=\"meta\">{} artifacts total</p>",
        artifacts.len()
    ));
    html.push_str("</div>"); // end artifacts-main

    // Facet sidebar
    html.push_str(
        "<div class=\"facet-sidebar\">\
        <h3>Filter by tag</h3>\
        <div id=\"tag-facets\"></div>\
        </div>",
    );

    html.push_str("</div>"); // end artifacts-layout

    // Inline filter script
    html.push_str(
        "<script>\
        function filterTable(q){\
          q=q.toLowerCase();\
          document.querySelectorAll('#artifacts-table tbody tr').forEach(function(r){\
            if(r.classList.contains('group-header-row')) return;\
            r.style.display=r.textContent.toLowerCase().includes(q)?'':'none';\
          });\
        }\
        </script>",
    );

    Html(html)
}

/// Compact preview tooltip for an artifact — loaded on hover.
pub(crate) async fn artifact_preview(
    State(state): State<SharedState>,
    Path(id): Path<String>,
) -> Html<String> {
    let state = state.read().await;
    let store = &state.store;
    let graph = &state.graph;

    let Some(artifact) = store.get(&id) else {
        return Html(format!(
            "<div class=\"art-preview\"><strong>{}</strong><br><em>Not found</em></div>",
            html_escape(&id)
        ));
    };

    let mut html = String::from("<div class=\"art-preview\">");
    html.push_str(&format!(
        "<div class=\"art-preview-header\">{} <strong>{}</strong></div>",
        badge_for_type(&artifact.artifact_type),
        html_escape(&artifact.id)
    ));
    html.push_str(&format!(
        "<div class=\"art-preview-title\">{}</div>",
        html_escape(&artifact.title)
    ));
    if let Some(status) = &artifact.status {
        let cls = match status.as_str() {
            "approved" => "badge-ok",
            "draft" => "badge-warn",
            "obsolete" => "badge-error",
            _ => "badge-info",
        };
        html.push_str(&format!(
            "<span class=\"badge {cls}\" style=\"font-size:.65rem;margin-top:.25rem\">{}</span> ",
            html_escape(status)
        ));
    }
    if let Some(desc) = &artifact.description {
        let rendered = render_markdown(desc);
        let plain = strip_html_tags(&rendered);
        let snippet: String = plain.chars().take(160).collect();
        let ellip = if plain.chars().count() > 160 {
            "..."
        } else {
            ""
        };
        html.push_str(&format!(
            "<div class=\"art-preview-desc\">{}{ellip}</div>",
            html_escape(&snippet)
        ));
    }
    let fwd = artifact.links.len();
    let back = graph.backlinks_to(&id).len();
    if fwd > 0 || back > 0 {
        html.push_str(&format!(
            "<div class=\"art-preview-links\">{fwd} outgoing, {back} incoming</div>"
        ));
    }
    if !artifact.tags.is_empty() {
        let tags: Vec<String> = artifact
            .tags
            .iter()
            .map(|t| format!("<span class=\"art-preview-tag\">{}</span>", html_escape(t)))
            .collect();
        html.push_str(&format!(
            "<div class=\"art-preview-tags\">{}</div>",
            tags.join(" ")
        ));
    }
    html.push_str("</div>");
    Html(html)
}

pub(crate) async fn artifact_detail(
    State(state): State<SharedState>,
    Path(id): Path<String>,
) -> Html<String> {
    let state = state.read().await;
    let store = &state.store;
    let graph = &state.graph;

    let Some(artifact) = store.get(&id).or_else(|| {
        // Try to resolve as cross-repo reference (prefix:id)
        match rivet_core::externals::parse_artifact_ref(&id) {
            rivet_core::externals::ArtifactRef::External { ref prefix, ref id } => state
                .externals
                .iter()
                .find(|e| e.prefix == *prefix && e.synced)
                .and_then(|e| e.store.get(id)),
            _ => None,
        }
    }) else {
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
            "<dt>Description</dt><dd class=\"artifact-desc\">{}</dd>",
            render_markdown(desc)
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

    // Extra fields — detect file:line source references and make them clickable
    for (key, value) in &artifact.fields {
        // Skip diagram — rendered separately below as mermaid/AADL
        if key == "diagram" {
            continue;
        }
        let val = match value {
            serde_yaml::Value::String(s) => linkify_source_refs(&html_escape(s)),
            other => html_escape(&format!("{other:?}")),
        };
        html.push_str(&format!("<dt>{}</dt><dd>{}</dd>", html_escape(key), val));
    }
    html.push_str("</dl></div>");

    // Diagram field — render mermaid or AADL diagram if present
    if let Some(serde_yaml::Value::String(diagram)) = artifact.fields.get("diagram") {
        html.push_str("<div class=\"card artifact-diagram\">");
        html.push_str("<h3>Diagram</h3>");
        let trimmed = diagram.trim();
        if trimmed.starts_with("root:") {
            // AADL diagram
            let root = trimmed.strip_prefix("root:").unwrap_or("").trim();
            html.push_str(&format!(
                "<div class=\"aadl-diagram\" data-root=\"{}\"><p class=\"aadl-loading\">Loading AADL diagram...</p></div>",
                html_escape(root)
            ));
        } else {
            // Treat as mermaid
            html.push_str("<pre class=\"mermaid\">");
            html.push_str(&html_escape(trimmed));
            html.push_str("</pre>");
        }
        html.push_str("</div>");
    }

    // Forward links
    if !artifact.links.is_empty() {
        html.push_str("<div class=\"card\"><h3>Outgoing Links</h3><table><thead><tr><th>Type</th><th>Target</th></tr></thead><tbody>");
        for link in &artifact.links {
            let target_display = if store.contains(&link.target) {
                format!(
                    "<a hx-get=\"/artifacts/{}\" hx-target=\"#content\" hx-push-url=\"true\" href=\"#\">{}</a>",
                    html_escape(&link.target),
                    html_escape(&link.target)
                )
            } else {
                // Check if this is a cross-repo reference (prefix:id)
                match rivet_core::externals::parse_artifact_ref(&link.target) {
                    rivet_core::externals::ArtifactRef::External { ref prefix, ref id } => {
                        let ext_exists = state
                            .externals
                            .iter()
                            .any(|e| e.prefix == *prefix && e.synced && e.store.contains(id));
                        if ext_exists {
                            format!(
                                "<a hx-get=\"/externals/{}\" hx-target=\"#content\" hx-push-url=\"true\" href=\"#\">\
                                 <span class=\"badge badge-info\" style=\"margin-right:.35rem\">{}</span>{}</a>",
                                html_escape(prefix),
                                html_escape(prefix),
                                html_escape(id),
                            )
                        } else {
                            format!(
                                "<span class=\"badge badge-info\" style=\"margin-right:.35rem\">{}</span>{} \
                                 <span class=\"badge badge-warn\">external</span>",
                                html_escape(prefix),
                                html_escape(id),
                            )
                        }
                    }
                    rivet_core::externals::ArtifactRef::Local(_) => {
                        format!(
                            "{} <span class=\"badge badge-error\">broken</span>",
                            html_escape(&link.target)
                        )
                    }
                }
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
                 <td><a hx-get=\"/artifacts/{}\" hx-target=\"#content\" hx-push-url=\"true\" href=\"#\">{}</a></td></tr>",
                html_escape(label),
                html_escape(&bl.source),
                html_escape(&bl.source)
            ));
        }
        html.push_str("</tbody></table></div>");
    }

    // AADL diagram highlighting data
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

    // Action buttons
    html.push_str(&format!(
        r##"<div class="detail-actions">
        <a class="btn btn-primary" hx-get="/artifacts/{id_esc}/graph" hx-target="#content" hx-push-url="true" href="#">Show in graph</a>
        <a class="btn btn-secondary" hx-get="/artifacts" hx-target="#content" hx-push-url="true" href="#">&larr; Back to artifacts</a>
        </div>"##,
        id_esc = html_escape(&id),
    ));

    Html(html)
}

// ── Graph visualization ──────────────────────────────────────────────────

#[derive(Debug, serde::Deserialize)]
pub(crate) struct GraphParams {
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
pub(crate) async fn graph_view(
    State(state): State<SharedState>,
    Query(params): Query<GraphParams>,
) -> Html<String> {
    let state = state.read().await;
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
                parent: None,
                ports: vec![],
            }
        },
        &|_idx, e| EdgeInfo {
            label: e.clone(),
            source_port: None,
            target_port: None,
        },
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
        "<form class=\"form-row\" hx-get=\"/graph\" hx-target=\"#content\" hx-push-url=\"true\">",
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

    // SVG card with zoom controls + viewer toolbar
    html.push_str(
        "<div class=\"svg-viewer\" id=\"graph-viewer\">\
        <div class=\"svg-viewer-toolbar\">\
          <button onclick=\"svgZoomFit(this)\" title=\"Zoom to fit\">\u{229e}</button>\
          <button onclick=\"svgFullscreen(this)\" title=\"Fullscreen\">\u{26f6}</button>\
          <button onclick=\"svgPopout(this)\" title=\"Open in new window\">\u{2197}</button>\
        </div>\
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
pub(crate) struct EgoParams {
    #[serde(default = "default_ego_hops")]
    hops: usize,
}

fn default_ego_hops() -> usize {
    2
}

pub(crate) async fn artifact_graph(
    State(state): State<SharedState>,
    Path(id): Path<String>,
    Query(params): Query<EgoParams>,
) -> Html<String> {
    let state = state.read().await;
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
                parent: None,
                ports: vec![],
            }
        },
        &|_idx, e| EdgeInfo {
            label: e.clone(),
            source_port: None,
            target_port: None,
        },
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
        "<form class=\"form-row\" hx-get=\"/artifacts/{id_esc}/graph\" hx-target=\"#content\" hx-push-url=\"true\">\
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

    // SVG with zoom controls + viewer toolbar
    html.push_str(
        "<div class=\"svg-viewer\" id=\"ego-graph-viewer\">\
        <div class=\"svg-viewer-toolbar\">\
          <button onclick=\"svgZoomFit(this)\" title=\"Zoom to fit\">\u{229e}</button>\
          <button onclick=\"svgFullscreen(this)\" title=\"Fullscreen\">\u{26f6}</button>\
          <button onclick=\"svgPopout(this)\" title=\"Open in new window\">\u{2197}</button>\
        </div>\
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
        r##"<p><a hx-get="/artifacts/{id_esc}" hx-target="#content" hx-push-url="true" href="#">&larr; Back to {id_esc}</a>
        &nbsp;|&nbsp;
        <a hx-get="/graph?focus={id_esc}" hx-target="#content" hx-push-url="true" href="#">Open in full graph</a></p>"##,
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

pub(crate) async fn validate_view(State(state): State<SharedState>) -> Html<String> {
    let state = state.read().await;
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
                "<a hx-get=\"/artifacts/{art}\" hx-target=\"#content\" hx-push-url=\"true\" href=\"#\">{art}</a>",
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
pub(crate) struct MatrixParams {
    from: Option<String>,
    to: Option<String>,
    link: Option<String>,
    direction: Option<String>,
}

pub(crate) async fn matrix_view(
    State(state): State<SharedState>,
    Query(params): Query<MatrixParams>,
) -> Html<String> {
    let state = state.read().await;
    let store = &state.store;

    let mut types: Vec<&str> = store.types().collect();
    types.sort();

    // Build the form
    let mut html = String::from("<h2>Traceability Matrix</h2>");
    html.push_str("<div class=\"card\">");
    html.push_str(
        "<form class=\"form-row\" hx-get=\"/matrix\" hx-target=\"#content\" hx-push-url=\"true\">",
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
            "<p>Coverage: {}/{} ({:.1}%) &mdash; <span class=\"meta\">Click the count to drill down</span></p>",
            result.covered,
            result.total,
            result.coverage_pct()
        ));
        html.push_str("<table class=\"sortable\"><thead><tr><th>Source</th><th>Targets</th><th>Count</th></tr></thead><tbody>");

        for row in &result.rows {
            let targets = if row.targets.is_empty() {
                "<span class=\"badge badge-warn\">none</span>".to_string()
            } else {
                row.targets
                    .iter()
                    .map(|t| {
                        format!(
                            "<a hx-get=\"/artifacts/{}\" hx-target=\"#content\" hx-push-url=\"true\" href=\"#\">{}</a>",
                            html_escape(&t.id),
                            html_escape(&t.id)
                        )
                    })
                    .collect::<Vec<_>>()
                    .join(", ")
            };
            html.push_str(&format!(
                "<tr><td><a hx-get=\"/artifacts/{}\" hx-target=\"#content\" hx-push-url=\"true\" href=\"#\">{}</a></td><td>{}</td><td>{}</td></tr>",
                html_escape(&row.source_id),
                html_escape(&row.source_id),
                targets,
                row.targets.len(),
            ));
        }

        html.push_str("</tbody></table>");

        // Drill-down summary cell: overall type-to-type link count
        let total_links: usize = result.rows.iter().map(|r| r.targets.len()).sum();
        if total_links > 0 {
            let dir_str = params.direction.as_deref().unwrap_or("backward");
            html.push_str(&format!(
                "<div style=\"margin-top:.75rem\">\
                 <span class=\"matrix-cell-clickable badge badge-info\" style=\"cursor:pointer;font-size:.85rem;padding:.4rem .8rem\" \
                 data-source-type=\"{}\" data-target-type=\"{}\" data-link-type=\"{}\" data-direction=\"{}\">\
                 {total_links} total links \u{2014} click to expand</span>\
                 <div class=\"cell-detail\" style=\"margin-top:.5rem\"></div>\
                 </div>",
                html_escape(from),
                html_escape(to),
                html_escape(link_type),
                html_escape(dir_str),
            ));
        }

        html.push_str("</div>");
    }

    Html(html)
}

// ── Matrix cell drill-down ────────────────────────────────────────────────

#[derive(Debug, serde::Deserialize)]
pub(crate) struct MatrixCellParams {
    source_type: String,
    target_type: String,
    link_type: String,
    direction: Option<String>,
}

/// GET /matrix/cell — return a list of links for a source_type -> target_type pair.
pub(crate) async fn matrix_cell_detail(
    State(state): State<SharedState>,
    Query(params): Query<MatrixCellParams>,
) -> Html<String> {
    let state = state.read().await;
    let store = &state.store;
    let direction = match params.direction.as_deref().unwrap_or("backward") {
        "forward" | "fwd" => Direction::Forward,
        _ => Direction::Backward,
    };

    let result = matrix::compute_matrix(
        store,
        &state.graph,
        &params.source_type,
        &params.target_type,
        &params.link_type,
        direction,
    );

    let mut html = String::from("<ul>");
    for row in &result.rows {
        if row.targets.is_empty() {
            continue;
        }
        for t in &row.targets {
            html.push_str(&format!(
                "<li><a hx-get=\"/artifacts/{}\" hx-target=\"#content\" hx-push-url=\"true\" href=\"#\">{}</a> \
                 &rarr; \
                 <a hx-get=\"/artifacts/{}\" hx-target=\"#content\" hx-push-url=\"true\" href=\"#\">{}</a>\
                 <span class=\"meta\" style=\"margin-left:.5rem\">{} &rarr; {}</span></li>",
                html_escape(&row.source_id),
                html_escape(&row.source_id),
                html_escape(&t.id),
                html_escape(&t.id),
                html_escape(&row.source_title),
                html_escape(&t.title),
            ));
        }
    }
    if result.rows.iter().all(|r| r.targets.is_empty()) {
        html.push_str("<li class=\"meta\">No links found</li>");
    }
    html.push_str("</ul>");
    Html(html)
}

// ── Coverage ─────────────────────────────────────────────────────────────

pub(crate) async fn coverage_view(State(state): State<SharedState>) -> Html<String> {
    let state = state.read().await;
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
                    "<tr><td><a hx-get=\"/artifacts/{id_esc}\" hx-target=\"#content\" hx-push-url=\"true\" href=\"#\">{id_esc}</a></td>\
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

pub(crate) async fn documents_list(State(state): State<SharedState>) -> Html<String> {
    let state = state.read().await;
    let doc_store = &state.doc_store;

    let mut html = String::from("<h2>Documents</h2>");

    if doc_store.is_empty() {
        html.push_str("<div class=\"card\"><p>No documents loaded. Add markdown files with YAML frontmatter to a <code>docs/</code> directory and reference it in <code>rivet.yaml</code>:</p>\
            <pre style=\"background:#f1f3f5;padding:1rem;border-radius:4px;font-size:.88rem;margin-top:.5rem\">docs:\n  - docs</pre></div>");
        return Html(html);
    }

    // Group documents by doc_type for a tree view
    let mut groups: BTreeMap<String, Vec<&rivet_core::document::Document>> = BTreeMap::new();
    for doc in doc_store.iter() {
        groups.entry(doc.doc_type.clone()).or_default().push(doc);
    }

    // Tree view
    html.push_str("<div class=\"doc-tree\">");
    for (doc_type, docs) in &groups {
        html.push_str(&format!(
            "<details open><summary><span class=\"tree-chevron\">&#9654;</span> {} {} <span class=\"tree-count\">({} doc{})</span></summary>",
            badge_for_type(doc_type),
            html_escape(doc_type),
            docs.len(),
            if docs.len() == 1 { "" } else { "s" },
        ));
        html.push_str("<ul>");
        for doc in docs {
            let status_badge = match doc.status.as_deref().unwrap_or("-") {
                "approved" => "<span class=\"badge badge-ok doc-tree-status\">approved</span>",
                "draft" => "<span class=\"badge badge-warn doc-tree-status\">draft</span>",
                s => {
                    // We can't easily return a formatted string from match arms with different
                    // lifetimes, so we handle "other" inline below.
                    let _ = s;
                    ""
                }
            };
            let other_badge = if status_badge.is_empty() {
                let s = doc.status.as_deref().unwrap_or("-");
                format!(
                    "<span class=\"badge badge-info doc-tree-status\">{}</span>",
                    html_escape(s)
                )
            } else {
                String::new()
            };
            html.push_str(&format!(
                "<li><a hx-get=\"/documents/{}\" hx-target=\"#content\" hx-push-url=\"true\" href=\"#\">\
                 <span class=\"doc-tree-id\">{}</span>\
                 {}\
                 {}{}\
                 <span class=\"meta\" style=\"margin-left:auto\">{} refs</span>\
                 </a></li>",
                html_escape(&doc.id),
                html_escape(&doc.id),
                html_escape(&doc.title),
                status_badge,
                other_badge,
                doc.references.len(),
            ));
        }
        html.push_str("</ul></details>");
    }
    html.push_str("</div>");

    // Also keep a flat table for sorting/filtering
    html.push_str("<div class=\"card\"><h3>All Documents</h3>");
    html.push_str(
        "<table class=\"sortable\"><thead><tr><th>ID</th><th>Type</th><th>Title</th><th>Status</th><th>Refs</th></tr></thead><tbody>",
    );

    for doc in doc_store.iter() {
        let status = doc.status.as_deref().unwrap_or("-");
        let status_badge = match status {
            "approved" => format!("<span class=\"badge badge-ok\">{status}</span>"),
            "draft" => format!("<span class=\"badge badge-warn\">{status}</span>"),
            _ => format!("<span class=\"badge badge-info\">{status}</span>"),
        };
        html.push_str(&format!(
            "<tr><td><a hx-get=\"/documents/{}\" hx-target=\"#content\" hx-push-url=\"true\" href=\"#\">{}</a></td>\
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

    html.push_str("</tbody></table></div>");
    html.push_str(&format!(
        "<p class=\"meta\">{} documents, {} total artifact references</p>",
        doc_store.len(),
        doc_store.all_references().len()
    ));

    Html(html)
}

pub(crate) async fn document_detail(
    State(state): State<SharedState>,
    Path(id): Path<String>,
) -> Html<String> {
    let state = state.read().await;
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
    let graph = &state.graph;
    let body_html = document::render_to_html(
        doc,
        |aid| store.contains(aid),
        |aid| build_artifact_info(aid, store, graph),
    );
    // Rewrite relative image src to serve through /docs-asset/
    let body_html = rewrite_image_paths(&body_html);
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
                    "<tr><td><a hx-get=\"/artifacts/{}\" hx-target=\"#content\" hx-push-url=\"true\" href=\"#\">{}</a></td>\
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
        "<p><a hx-get=\"/documents\" hx-target=\"#content\" hx-push-url=\"true\" href=\"#\">&larr; Back to documents</a></p>",
    );

    Html(html)
}

// ── Search ───────────────────────────────────────────────────────────────

#[derive(Debug, serde::Deserialize)]
pub(crate) struct SearchParams {
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

pub(crate) async fn search_view(
    State(state): State<SharedState>,
    Query(params): Query<SearchParams>,
) -> Html<String> {
    let state = state.read().await;
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

// ── Verification ─────────────────────────────────────────────────────────

pub(crate) async fn verification_view(State(state): State<SharedState>) -> Html<String> {
    let state = state.read().await;
    let store = &state.store;
    let graph = &state.graph;
    let schema = &state.schema;

    // Find types that need verification (have required-backlink: verifies rules)
    let mut verifiable_types: Vec<(String, String)> = Vec::new(); // (source_type, rule_name)
    for rule in &schema.traceability_rules {
        if rule.required_backlink.as_deref() == Some("verifies") {
            verifiable_types.push((rule.source_type.clone(), rule.name.clone()));
        }
    }

    // Also find types that have forward `verifies` links (the verifiers themselves)
    // to auto-discover if no rules match
    if verifiable_types.is_empty() {
        // Fallback: find all artifact types that have backlinks of type "verifies"
        let mut seen = std::collections::HashSet::new();
        for artifact in store.iter() {
            let backlinks = graph.backlinks_to(&artifact.id);
            for bl in backlinks {
                if bl.link_type == "verifies" && seen.insert(artifact.artifact_type.clone()) {
                    verifiable_types.push((artifact.artifact_type.clone(), "verifies".to_string()));
                }
            }
        }
    }

    let mut html = String::from("<h2>Verification</h2>");

    if verifiable_types.is_empty() {
        html.push_str("<div class=\"card\"><p>No verification traceability rules found in the schema. \
            Add <code>required-backlink: verifies</code> rules to your schema to enable the verification dashboard.</p></div>");
        return Html(html);
    }

    // Compute stats
    let mut total_reqs = 0usize;
    let mut verified_reqs = 0usize;

    // Group by verifiable type
    for (source_type, _rule_name) in &verifiable_types {
        let source_ids = store.by_type(source_type);
        if source_ids.is_empty() {
            continue;
        }

        total_reqs += source_ids.len();

        // Collect requirement → verifier mapping
        struct ReqRow {
            id: String,
            title: String,
            status: String,
            verifiers: Vec<VerifierInfo>,
        }
        struct VerifierInfo {
            id: String,
            title: String,
            artifact_type: String,
            method: String,
            steps: Vec<StepInfo>,
            latest_result: Option<(String, rivet_core::results::TestStatus)>,
        }
        struct StepInfo {
            step: String,
            action: String,
            expected: String,
        }

        let mut rows: Vec<ReqRow> = Vec::new();

        for req_id in source_ids {
            let req = store.get(req_id).unwrap();
            let backlinks = graph.backlinks_to(req_id);
            let ver_links: Vec<_> = backlinks
                .iter()
                .filter(|bl| bl.link_type == "verifies")
                .collect();

            if !ver_links.is_empty() {
                verified_reqs += 1;
            }

            let mut verifiers = Vec::new();
            for bl in &ver_links {
                if let Some(ver_artifact) = store.get(&bl.source) {
                    let method = ver_artifact
                        .fields
                        .get("method")
                        .and_then(|v| v.as_str())
                        .unwrap_or("unspecified")
                        .to_string();

                    let steps = ver_artifact
                        .fields
                        .get("steps")
                        .and_then(|v| v.as_sequence())
                        .map(|seq| {
                            seq.iter()
                                .map(|s| {
                                    let step = s
                                        .get("step")
                                        .map(|v| {
                                            if let Some(n) = v.as_u64() {
                                                n.to_string()
                                            } else if let Some(s) = v.as_str() {
                                                s.to_string()
                                            } else {
                                                format!("{v:?}")
                                            }
                                        })
                                        .unwrap_or_default();
                                    let action = s
                                        .get("action")
                                        .and_then(|v| v.as_str())
                                        .unwrap_or("")
                                        .to_string();
                                    let expected = s
                                        .get("expected")
                                        .and_then(|v| v.as_str())
                                        .unwrap_or("")
                                        .to_string();
                                    StepInfo {
                                        step,
                                        action,
                                        expected,
                                    }
                                })
                                .collect()
                        })
                        .unwrap_or_default();

                    // Look up latest test result
                    let latest_result = state
                        .result_store
                        .latest_for(&bl.source)
                        .map(|(_run, r)| (r.status.to_string(), r.status.clone()));

                    verifiers.push(VerifierInfo {
                        id: ver_artifact.id.clone(),
                        title: ver_artifact.title.clone(),
                        artifact_type: ver_artifact.artifact_type.clone(),
                        method,
                        steps,
                        latest_result,
                    });
                }
            }

            rows.push(ReqRow {
                id: req.id.clone(),
                title: req.title.clone(),
                status: req.status.as_deref().unwrap_or("-").to_string(),
                verifiers,
            });
        }

        rows.sort_by(|a, b| a.id.cmp(&b.id));

        // Render this type's section
        let type_verified = rows.iter().filter(|r| !r.verifiers.is_empty()).count();
        let type_total = rows.len();
        let pct = if type_total > 0 {
            (type_verified as f64 / type_total as f64) * 100.0
        } else {
            100.0
        };

        html.push_str("<div class=\"ver-level\"><div class=\"card\">");
        html.push_str(&format!(
            "<div class=\"ver-level-header\">\
             {} <span class=\"ver-level-arrow\">&rarr;</span> \
             <span class=\"ver-level-title\">verified by</span> \
             <span class=\"badge badge-info\">{type_verified}/{type_total} ({pct:.0}%)</span></div>",
            badge_for_type(source_type),
        ));

        for row in &rows {
            let ver_count = row.verifiers.len();
            let has_verifiers = ver_count > 0;
            let coverage_badge = if has_verifiers {
                format!(
                    "<span class=\"badge badge-ok\">{ver_count} verifier{}</span>",
                    if ver_count > 1 { "s" } else { "" }
                )
            } else {
                "<span class=\"badge badge-error\">unverified</span>".to_string()
            };

            html.push_str("<details class=\"ver-row\"><summary>");
            html.push_str(&format!(
                "<span class=\"ver-chevron\"><svg width=\"12\" height=\"12\" viewBox=\"0 0 12 12\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\"><path d=\"M4.5 2.5l4 3.5-4 3.5\"/></svg></span>\
                 <a hx-get=\"/artifacts/{id}\" hx-target=\"#content\" hx-push-url=\"true\" href=\"#\" style=\"flex-shrink:0\">{id}</a>\
                 <span style=\"flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--text-secondary)\">{title}</span>\
                 <span class=\"badge\" style=\"font-size:0.7rem;opacity:0.6\">{status}</span>\
                 {coverage_badge}",
                id = html_escape(&row.id),
                title = html_escape(&row.title),
                status = html_escape(&row.status),
            ));

            // Show latest result dots for verifiers
            for v in &row.verifiers {
                if let Some((_, ref status)) = v.latest_result {
                    let dot_class = match status {
                        rivet_core::results::TestStatus::Pass => "result-dot-pass",
                        rivet_core::results::TestStatus::Fail => "result-dot-fail",
                        rivet_core::results::TestStatus::Skip => "result-dot-skip",
                        rivet_core::results::TestStatus::Error => "result-dot-error",
                        rivet_core::results::TestStatus::Blocked => "result-dot-blocked",
                    };
                    html.push_str(&format!(
                        "<span class=\"result-dot {dot_class}\" title=\"{}: {}\"></span>",
                        html_escape(&v.id),
                        status
                    ));
                }
            }

            html.push_str("</summary>");

            if has_verifiers {
                html.push_str("<div class=\"ver-detail\">");
                for v in &row.verifiers {
                    html.push_str(&format!(
                        "<p style=\"margin-bottom:.5rem\">\
                         <a hx-get=\"/artifacts/{id}\" hx-target=\"#content\" hx-push-url=\"true\" href=\"#\">{id}</a> \
                         {type_badge} \
                         <span class=\"method-badge\">{method}</span> \
                         &mdash; {title}",
                        id = html_escape(&v.id),
                        type_badge = badge_for_type(&v.artifact_type),
                        method = html_escape(&v.method),
                        title = html_escape(&v.title),
                    ));
                    if let Some((ref status_str, _)) = v.latest_result {
                        html.push_str(&format!(
                            " <span class=\"badge badge-{cls}\">{status_str}</span>",
                            cls = match status_str.as_str() {
                                "pass" => "ok",
                                "fail" | "error" => "error",
                                "skip" | "blocked" => "warn",
                                _ => "info",
                            },
                        ));
                    }
                    html.push_str("</p>");

                    if !v.steps.is_empty() {
                        html.push_str(
                            "<table class=\"ver-steps\"><thead><tr>\
                             <th style=\"width:3rem\">#</th><th>Action</th><th>Expected</th>\
                             </tr></thead><tbody>",
                        );
                        for s in &v.steps {
                            html.push_str(&format!(
                                "<tr><td>{}</td><td>{}</td><td>{}</td></tr>",
                                html_escape(&s.step),
                                html_escape(&s.action),
                                html_escape(&s.expected),
                            ));
                        }
                        html.push_str("</tbody></table>");
                    }
                }
                html.push_str("</div>");
            }

            html.push_str("</details>");
        }

        html.push_str("</div></div>");
    }

    // Summary stats
    let ver_pct = if total_reqs > 0 {
        (verified_reqs as f64 / total_reqs as f64) * 100.0
    } else {
        100.0
    };
    let summary = format!(
        "<div class=\"stat-grid\">\
         <div class=\"stat-box stat-blue\"><div class=\"number\">{total_reqs}</div><div class=\"label\">Requirements</div></div>\
         <div class=\"stat-box stat-green\"><div class=\"number\">{verified_reqs}</div><div class=\"label\">Verified</div></div>\
         <div class=\"stat-box stat-red\"><div class=\"number\">{}</div><div class=\"label\">Unverified</div></div>\
         <div class=\"stat-box stat-purple\"><div class=\"number\">{ver_pct:.0}%</div><div class=\"label\">Coverage</div></div>\
         </div>",
        total_reqs - verified_reqs,
    );

    // Insert summary before the level cards
    html = format!(
        "<h2>Verification</h2>{summary}{}",
        &html["<h2>Verification</h2>".len()..]
    );

    Html(html)
}

// ── STPA ─────────────────────────────────────────────────────────────────

pub(crate) async fn stpa_view(State(state): State<SharedState>) -> Html<String> {
    let state = state.read().await;
    stpa_partial(&state)
}

fn stpa_partial(state: &AppState) -> Html<String> {
    let store = &state.store;
    let graph = &state.graph;

    let stpa_types = [
        ("loss", "Losses"),
        ("hazard", "Hazards"),
        ("sub-hazard", "Sub-Hazards"),
        ("system-constraint", "System Constraints"),
        ("controller", "Controllers"),
        ("controlled-process", "Controlled Processes"),
        ("control-action", "Control Actions"),
        ("uca", "UCAs"),
        ("controller-constraint", "Controller Constraints"),
        ("loss-scenario", "Loss Scenarios"),
    ];

    let total: usize = stpa_types.iter().map(|(t, _)| store.count_by_type(t)).sum();

    let mut html = String::from("<h2>STPA Analysis</h2>");

    if total == 0 {
        html.push_str(
            "<div class=\"card\">\
             <p>No STPA artifacts found in this project.</p>\
             <p style=\"color:var(--text-secondary);font-size:.9rem;margin-top:.5rem\">\
             Add artifacts of types <code>loss</code>, <code>hazard</code>, <code>uca</code>, etc. \
             using the <code>stpa</code> schema to enable the STPA analysis dashboard.</p>\
             </div>",
        );
        return Html(html);
    }

    // Summary stat cards
    html.push_str("<div class=\"stat-grid\">");
    let stat_colors = [
        "#dc3545", "#fd7e14", "#fd7e14", "#20c997", "#6f42c1", "#6610f2", "#17a2b8", "#e83e8c",
        "#20c997", "#e83e8c",
    ];
    for (i, (type_name, label)) in stpa_types.iter().enumerate() {
        let count = store.count_by_type(type_name);
        if count == 0 {
            continue;
        }
        let color = stat_colors[i];
        html.push_str(&format!(
            "<div class=\"stat-box\" style=\"border-top-color:{color}\">\
             <div class=\"number\" style=\"color:{color}\">{count}</div>\
             <div class=\"label\">{label}</div></div>"
        ));
    }
    html.push_str("</div>");

    // Hierarchy tree view
    html.push_str("<div class=\"card\"><h3>STPA Hierarchy</h3><div class=\"stpa-tree\">");

    let losses = store.by_type("loss");
    if losses.is_empty() {
        html.push_str(
            "<p class=\"meta\">No losses defined. The STPA hierarchy starts with losses.</p>",
        );
    }

    let mut sorted_losses: Vec<&str> = losses.iter().map(|s| s.as_str()).collect();
    sorted_losses.sort();

    for loss_id in &sorted_losses {
        let Some(loss) = store.get(loss_id) else {
            continue;
        };
        html.push_str("<details class=\"stpa-details\" open><summary>");
        html.push_str("<span class=\"stpa-chevron\">&#9654;</span> ");
        html.push_str(&badge_for_type("loss"));
        html.push_str(&format!(
            " <a hx-get=\"/artifacts/{id}\" hx-target=\"#content\" hx-push-url=\"true\" href=\"#\">{id}</a>\
             <span style=\"color:var(--text-secondary);font-size:.85rem\"> {title}</span>",
            id = html_escape(loss_id),
            title = html_escape(&loss.title),
        ));
        html.push_str("</summary>");

        let hazard_backlinks = graph.backlinks_of_type(loss_id, "leads-to-loss");
        if !hazard_backlinks.is_empty() {
            html.push_str("<div class=\"stpa-level\">");
            let mut hazard_ids: Vec<&str> = hazard_backlinks
                .iter()
                .map(|bl| bl.source.as_str())
                .collect();
            hazard_ids.sort();
            hazard_ids.dedup();
            for hazard_id in &hazard_ids {
                let Some(hazard) = store.get(hazard_id) else {
                    continue;
                };
                html.push_str("<details class=\"stpa-details\" open><summary>");
                html.push_str("<span class=\"stpa-chevron\">&#9654;</span> ");
                html.push_str("<span class=\"stpa-link-label\">leads-to-loss</span>");
                html.push_str(&badge_for_type(&hazard.artifact_type));
                html.push_str(&format!(
                    " <a hx-get=\"/artifacts/{id}\" hx-target=\"#content\" hx-push-url=\"true\" href=\"#\">{id}</a>\
                     <span style=\"color:var(--text-secondary);font-size:.85rem\"> {title}</span>",
                    id = html_escape(hazard_id),
                    title = html_escape(&hazard.title),
                ));
                html.push_str("</summary>");

                let constraint_bls = graph.backlinks_of_type(hazard_id, "prevents");
                let uca_bls = graph.backlinks_of_type(hazard_id, "leads-to-hazard");

                if !constraint_bls.is_empty() || !uca_bls.is_empty() {
                    html.push_str("<div class=\"stpa-level\">");

                    // System Constraints
                    let mut sc_ids: Vec<&str> = constraint_bls
                        .iter()
                        .filter(|bl| {
                            store
                                .get(&bl.source)
                                .map(|a| a.artifact_type == "system-constraint")
                                .unwrap_or(false)
                        })
                        .map(|bl| bl.source.as_str())
                        .collect();
                    sc_ids.sort();
                    sc_ids.dedup();
                    for sc_id in &sc_ids {
                        let Some(sc) = store.get(sc_id) else { continue };
                        html.push_str(&format!(
                            "<div class=\"stpa-node\">\
                             <span class=\"stpa-link-label\">prevents</span>{badge}\
                             <a hx-get=\"/artifacts/{id}\" hx-target=\"#content\" hx-push-url=\"true\" href=\"#\">{id}</a>\
                             <span style=\"color:var(--text-secondary);font-size:.85rem\"> {title}</span>\
                             </div>",
                            badge = badge_for_type("system-constraint"),
                            id = html_escape(sc_id),
                            title = html_escape(&sc.title),
                        ));
                    }

                    // UCAs
                    let mut uca_ids: Vec<&str> = uca_bls
                        .iter()
                        .filter(|bl| {
                            store
                                .get(&bl.source)
                                .map(|a| a.artifact_type == "uca")
                                .unwrap_or(false)
                        })
                        .map(|bl| bl.source.as_str())
                        .collect();
                    uca_ids.sort();
                    uca_ids.dedup();
                    for uca_id in &uca_ids {
                        let Some(uca) = store.get(uca_id) else {
                            continue;
                        };
                        // Collapse below level 2
                        html.push_str("<details class=\"stpa-details\"><summary>");
                        html.push_str("<span class=\"stpa-chevron\">&#9654;</span> ");
                        html.push_str("<span class=\"stpa-link-label\">leads-to-hazard</span>");
                        html.push_str(&badge_for_type("uca"));
                        html.push_str(&format!(
                            " <a hx-get=\"/artifacts/{id}\" hx-target=\"#content\" hx-push-url=\"true\" href=\"#\">{id}</a>\
                             <span style=\"color:var(--text-secondary);font-size:.85rem\"> {title}</span>",
                            id = html_escape(uca_id),
                            title = html_escape(&uca.title),
                        ));
                        html.push_str("</summary>");

                        let cc_bls = graph.backlinks_of_type(uca_id, "inverts-uca");
                        let ls_bls = graph.backlinks_of_type(uca_id, "caused-by-uca");

                        if !cc_bls.is_empty() || !ls_bls.is_empty() {
                            html.push_str("<div class=\"stpa-level\">");
                            // Controller Constraints
                            let mut cc_ids: Vec<&str> =
                                cc_bls.iter().map(|bl| bl.source.as_str()).collect();
                            cc_ids.sort();
                            cc_ids.dedup();
                            for cc_id in &cc_ids {
                                let Some(cc) = store.get(cc_id) else { continue };
                                html.push_str(&format!(
                                    "<div class=\"stpa-node\">\
                                     <span class=\"stpa-link-label\">inverts-uca</span>{badge}\
                                     <a hx-get=\"/artifacts/{id}\" hx-target=\"#content\" hx-push-url=\"true\" href=\"#\">{id}</a>\
                                     <span style=\"color:var(--text-secondary);font-size:.85rem\"> {title}</span>\
                                     </div>",
                                    badge = badge_for_type("controller-constraint"),
                                    id = html_escape(cc_id),
                                    title = html_escape(&cc.title),
                                ));
                            }
                            // Loss Scenarios
                            let mut ls_ids: Vec<&str> =
                                ls_bls.iter().map(|bl| bl.source.as_str()).collect();
                            ls_ids.sort();
                            ls_ids.dedup();
                            for ls_id in &ls_ids {
                                let Some(ls) = store.get(ls_id) else { continue };
                                html.push_str(&format!(
                                    "<div class=\"stpa-node\">\
                                     <span class=\"stpa-link-label\">caused-by-uca</span>{badge}\
                                     <a hx-get=\"/artifacts/{id}\" hx-target=\"#content\" hx-push-url=\"true\" href=\"#\">{id}</a>\
                                     <span style=\"color:var(--text-secondary);font-size:.85rem\"> {title}</span>\
                                     </div>",
                                    badge = badge_for_type("loss-scenario"),
                                    id = html_escape(ls_id),
                                    title = html_escape(&ls.title),
                                ));
                            }
                            html.push_str("</div>"); // stpa-level (CC/LS)
                        }
                        html.push_str("</details>"); // UCA
                    }
                    html.push_str("</div>"); // stpa-level (SC/UCA)
                }
                html.push_str("</details>"); // Hazard
            }
            html.push_str("</div>"); // stpa-level (Hazards)
        }
        html.push_str("</details>"); // Loss
    }

    html.push_str("</div></div>"); // stpa-tree, card

    // UCA Table
    let uca_ids = store.by_type("uca");
    if !uca_ids.is_empty() {
        html.push_str("<div class=\"card\"><h3>Unsafe Control Actions</h3>");

        struct UcaRow {
            id: String,
            title: String,
            uca_type: String,
            control_action: String,
            linked_hazards: Vec<String>,
        }

        let mut rows: Vec<UcaRow> = Vec::new();
        for uca_id in uca_ids {
            let Some(uca) = store.get(uca_id) else {
                continue;
            };
            let uca_type = uca
                .fields
                .get("uca-type")
                .and_then(|v| v.as_str())
                .unwrap_or("-")
                .to_string();
            let controller_links: Vec<&str> = uca
                .links
                .iter()
                .filter(|l| l.link_type == "issued-by")
                .map(|l| l.target.as_str())
                .collect();
            let control_action = if let Some(ctrl_id) = controller_links.first() {
                let ca_bls = graph.backlinks_of_type(ctrl_id, "issued-by");
                ca_bls
                    .iter()
                    .filter(|bl| {
                        store
                            .get(&bl.source)
                            .map(|a| a.artifact_type == "control-action")
                            .unwrap_or(false)
                    })
                    .map(|bl| bl.source.clone())
                    .next()
                    .unwrap_or_else(|| ctrl_id.to_string())
            } else {
                "-".to_string()
            };
            let hazards: Vec<String> = uca
                .links
                .iter()
                .filter(|l| l.link_type == "leads-to-hazard")
                .map(|l| l.target.clone())
                .collect();
            rows.push(UcaRow {
                id: uca_id.clone(),
                title: uca.title.clone(),
                uca_type,
                control_action,
                linked_hazards: hazards,
            });
        }

        rows.sort_by(|a, b| {
            a.control_action
                .cmp(&b.control_action)
                .then(a.id.cmp(&b.id))
        });

        html.push_str(
            "<table class=\"stpa-uca-table\"><thead><tr>\
             <th>ID</th><th>Control Action</th><th>UCA Type</th>\
             <th>Description</th><th>Linked Hazards</th>\
             </tr></thead><tbody>",
        );

        for row in &rows {
            let type_class = match row.uca_type.as_str() {
                "not-providing" => "uca-type-not-providing",
                "providing" => "uca-type-providing",
                "too-early-too-late" => "uca-type-too-early-too-late",
                "stopped-too-soon" => "uca-type-stopped-too-soon",
                _ => "",
            };
            let type_badge = if type_class.is_empty() {
                html_escape(&row.uca_type)
            } else {
                format!(
                    "<span class=\"uca-type-badge {type_class}\">{}</span>",
                    html_escape(&row.uca_type),
                )
            };
            let hazard_links: Vec<String> = row
                .linked_hazards
                .iter()
                .map(|h| {
                    format!(
                        "<a hx-get=\"/artifacts/{id}\" hx-target=\"#content\" hx-push-url=\"true\" href=\"#\" \
                     style=\"font-family:var(--mono);font-size:.8rem\">{id}</a>",
                        id = html_escape(h),
                    )
                })
                .collect();
            let ca_display = if row.control_action == "-" {
                "-".to_string()
            } else {
                format!(
                    "<a hx-get=\"/artifacts/{id}\" hx-target=\"#content\" hx-push-url=\"true\" href=\"#\" \
                     style=\"font-family:var(--mono);font-size:.8rem\">{id}</a>",
                    id = html_escape(&row.control_action),
                )
            };
            html.push_str(&format!(
                "<tr>\
                 <td><a hx-get=\"/artifacts/{id}\" hx-target=\"#content\" hx-push-url=\"true\" href=\"#\">{id}</a></td>\
                 <td>{ca}</td>\
                 <td>{type_badge}</td>\
                 <td>{title}</td>\
                 <td>{hazards}</td></tr>",
                id = html_escape(&row.id),
                ca = ca_display,
                title = html_escape(&row.title),
                hazards = hazard_links.join(", "),
            ));
        }

        html.push_str("</tbody></table></div>");
    }

    html.push_str(&format!(
        "<p class=\"meta\">{total} STPA artifacts total</p>"
    ));

    Html(html)
}

// ── Results ──────────────────────────────────────────────────────────────

pub(crate) async fn results_view(State(state): State<SharedState>) -> Html<String> {
    let state = state.read().await;
    let result_store = &state.result_store;

    let mut html = String::from("<h2>Test Results</h2>");

    if result_store.is_empty() {
        html.push_str("<div class=\"card\"><p>No test results loaded. Add result YAML files to a <code>results/</code> directory and reference it in <code>rivet.yaml</code>:</p>\
            <pre style=\"background:#f1f3f5;padding:1rem;border-radius:4px;font-size:.88rem;margin-top:.5rem\">results: results</pre>\
            <p style=\"margin-top:.75rem;color:var(--text-secondary);font-size:.88rem\">Each result file contains a <code>run:</code> metadata block and a <code>results:</code> list with per-artifact pass/fail/skip status.</p></div>");
        return Html(html);
    }

    let summary = result_store.summary();

    // Stats
    html.push_str("<div class=\"stat-grid\">");
    html.push_str(&format!(
        "<div class=\"stat-box stat-blue\"><div class=\"number\">{}</div><div class=\"label\">Total Runs</div></div>",
        summary.total_runs
    ));
    html.push_str(&format!(
        "<div class=\"stat-box stat-green\"><div class=\"number\">{:.0}%</div><div class=\"label\">Pass Rate</div></div>",
        summary.pass_rate()
    ));
    html.push_str(&format!(
        "<div class=\"stat-box stat-green\"><div class=\"number\">{}</div><div class=\"label\">Passed</div></div>",
        summary.pass_count
    ));
    html.push_str(&format!(
        "<div class=\"stat-box stat-red\"><div class=\"number\">{}</div><div class=\"label\">Failed</div></div>",
        summary.fail_count
    ));
    if summary.skip_count > 0 {
        html.push_str(&format!(
            "<div class=\"stat-box stat-amber\"><div class=\"number\">{}</div><div class=\"label\">Skipped</div></div>",
            summary.skip_count
        ));
    }
    if summary.blocked_count > 0 {
        html.push_str(&format!(
            "<div class=\"stat-box stat-amber\"><div class=\"number\">{}</div><div class=\"label\">Blocked</div></div>",
            summary.blocked_count
        ));
    }
    html.push_str("</div>");

    // Run history table
    html.push_str("<div class=\"card\"><h3>Run History</h3>");
    html.push_str(
        "<table><thead><tr><th>Run ID</th><th>Timestamp</th><th>Source</th><th>Environment</th>\
         <th>Pass</th><th>Fail</th><th>Skip</th><th>Total</th></tr></thead><tbody>",
    );

    for run in result_store.runs() {
        let pass = run.results.iter().filter(|r| r.status.is_pass()).count();
        let fail = run.results.iter().filter(|r| r.status.is_fail()).count();
        let skip = run.results.len() - pass - fail;
        let total = run.results.len();

        let status_badge = if fail > 0 {
            "<span class=\"badge badge-error\">FAIL</span>"
        } else {
            "<span class=\"badge badge-ok\">PASS</span>"
        };

        html.push_str(&format!(
            "<tr>\
             <td><a hx-get=\"/results/{id}\" hx-target=\"#content\" hx-push-url=\"true\" href=\"#\">{id}</a> {status_badge}</td>\
             <td>{ts}</td>\
             <td>{src}</td>\
             <td>{env}</td>\
             <td style=\"color:#15713a\">{pass}</td>\
             <td style=\"color:#c62828\">{fail}</td>\
             <td style=\"color:#6e6e73\">{skip}</td>\
             <td>{total}</td>\
             </tr>",
            id = html_escape(&run.run.id),
            ts = html_escape(&run.run.timestamp),
            src = run.run.source.as_deref().unwrap_or("-"),
            env = run.run.environment.as_deref().unwrap_or("-"),
        ));
    }

    html.push_str("</tbody></table></div>");

    Html(html)
}

pub(crate) async fn result_detail(
    State(state): State<SharedState>,
    Path(run_id): Path<String>,
) -> Html<String> {
    let state = state.read().await;
    let result_store = &state.result_store;

    let Some(run) = result_store.get_run(&run_id) else {
        return Html(format!(
            "<h2>Not Found</h2><p>Run <code>{}</code> does not exist.</p>",
            html_escape(&run_id)
        ));
    };

    let mut html = format!("<h2>Run: {}</h2>", html_escape(&run.run.id));

    // Metadata
    html.push_str("<div class=\"card\"><dl>");
    html.push_str(&format!(
        "<dt>Timestamp</dt><dd>{}</dd>",
        html_escape(&run.run.timestamp)
    ));
    if let Some(ref source) = run.run.source {
        html.push_str(&format!("<dt>Source</dt><dd>{}</dd>", html_escape(source)));
    }
    if let Some(ref env) = run.run.environment {
        html.push_str(&format!(
            "<dt>Environment</dt><dd>{}</dd>",
            html_escape(env)
        ));
    }
    if let Some(ref commit) = run.run.commit {
        html.push_str(&format!(
            "<dt>Commit</dt><dd><code>{}</code></dd>",
            html_escape(commit)
        ));
    }
    html.push_str("</dl></div>");

    // Results table
    html.push_str("<div class=\"card\"><h3>Results</h3>");
    html.push_str(
        "<table><thead><tr><th>Artifact</th><th>Title</th><th>Status</th><th>Duration</th><th>Message</th></tr></thead><tbody>",
    );

    for result in &run.results {
        let title = state
            .store
            .get(&result.artifact)
            .map(|a| a.title.as_str())
            .unwrap_or("-");
        let (status_badge, status_class) = match result.status {
            rivet_core::results::TestStatus::Pass => {
                ("<span class=\"badge badge-ok\">PASS</span>", "")
            }
            rivet_core::results::TestStatus::Fail => (
                "<span class=\"badge badge-error\">FAIL</span>",
                "result-fail",
            ),
            rivet_core::results::TestStatus::Skip => {
                ("<span class=\"badge badge-info\">SKIP</span>", "")
            }
            rivet_core::results::TestStatus::Error => (
                "<span class=\"badge badge-error\">ERROR</span>",
                "result-error",
            ),
            rivet_core::results::TestStatus::Blocked => {
                ("<span class=\"badge badge-warn\">BLOCKED</span>", "")
            }
        };

        let duration = result.duration.as_deref().unwrap_or("-");
        let message = result.message.as_deref().unwrap_or("");

        html.push_str(&format!(
            "<tr class=\"{status_class}\">\
             <td><a hx-get=\"/artifacts/{aid}\" hx-target=\"#content\" hx-push-url=\"true\" href=\"#\">{aid}</a></td>\
             <td>{title}</td>\
             <td>{status_badge}</td>\
             <td>{duration}</td>\
             <td>{msg}</td>\
             </tr>",
            aid = html_escape(&result.artifact),
            title = html_escape(title),
            msg = html_escape(message),
        ));
    }

    html.push_str("</tbody></table></div>");

    html.push_str(
        "<p><a hx-get=\"/results\" hx-target=\"#content\" hx-push-url=\"true\" href=\"#\" class=\"btn btn-secondary\">&larr; Back to results</a></p>",
    );

    Html(html)
}

// ── Source viewer ──────────────────────────────────────────────────────────────

const SOURCE_MAX_SIZE: u64 = 100 * 1024;
const SOURCE_MAX_DEPTH: usize = 3;
const SOURCE_SKIP_DIRS: &[&str] = &["target", ".git", "node_modules", ".DS_Store"];

struct TreeEntry {
    name: String,
    rel_path: String,
    is_dir: bool,
    children: Vec<TreeEntry>,
}

fn build_tree(base: &std::path::Path, rel: &str, depth: usize) -> Vec<TreeEntry> {
    if depth > SOURCE_MAX_DEPTH {
        return Vec::new();
    }
    let Ok(entries) = std::fs::read_dir(base) else {
        return Vec::new();
    };
    let mut items: Vec<TreeEntry> = Vec::new();
    for entry in entries.flatten() {
        let ft = match entry.file_type() {
            Ok(ft) => ft,
            Err(_) => continue,
        };
        if ft.is_symlink() {
            continue;
        }
        let name = entry.file_name().to_string_lossy().to_string();
        if SOURCE_SKIP_DIRS.contains(&name.as_str()) || name.starts_with('.') {
            continue;
        }
        let child_rel = if rel.is_empty() {
            name.clone()
        } else {
            format!("{rel}/{name}")
        };
        if ft.is_dir() {
            let children = build_tree(&entry.path(), &child_rel, depth + 1);
            items.push(TreeEntry {
                name,
                rel_path: child_rel,
                is_dir: true,
                children,
            });
        } else {
            items.push(TreeEntry {
                name,
                rel_path: child_rel,
                is_dir: false,
                children: Vec::new(),
            });
        }
    }
    items.sort_by(|a, b| {
        b.is_dir
            .cmp(&a.is_dir)
            .then_with(|| a.name.to_lowercase().cmp(&b.name.to_lowercase()))
    });
    items
}

fn render_tree(entries: &[TreeEntry], html: &mut String, depth: usize) {
    html.push_str("<ul>");
    for entry in entries {
        html.push_str("<li>");
        let indent: String = (0..depth)
            .map(|_| "<span class=\"indent\"></span>")
            .collect();
        if entry.is_dir {
            html.push_str(&format!(
                "<span class=\"tree-item\">{indent}<span class=\"tree-icon\"><svg width=\"14\" height=\"14\" viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M2 4.5h4l2 2h6v7H2z\"/></svg></span> {name}</span>",
                name = html_escape(&entry.name),
            ));
            if !entry.children.is_empty() {
                render_tree(&entry.children, html, depth + 1);
            }
        } else {
            let encoded = urlencoding::encode(&entry.rel_path);
            let icon = if entry.name.ends_with(".yaml") || entry.name.ends_with(".yml") {
                "<svg width=\"14\" height=\"14\" viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"#b8860b\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"3\" y=\"1.5\" width=\"10\" height=\"13\" rx=\"1.5\"/><path d=\"M6 5h4M6 8h4M6 11h2\"/></svg>"
            } else if entry.name.ends_with(".rs") {
                "<svg width=\"14\" height=\"14\" viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"#e67e22\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><polyline points=\"5 4.5 1.5 8 5 11.5\"/><polyline points=\"11 4.5 14.5 8 11 11.5\"/></svg>"
            } else if entry.name.ends_with(".md") {
                "<svg width=\"14\" height=\"14\" viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"#3a86ff\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M9 1.5H4.5A1.5 1.5 0 003 3v10a1.5 1.5 0 001.5 1.5h7A1.5 1.5 0 0013 13V5.5L9 1.5z\"/><path d=\"M9 1.5V5.5h4\"/></svg>"
            } else if entry.name.ends_with(".toml") {
                "<svg width=\"14\" height=\"14\" viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"#6f42c1\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"3\" y=\"1.5\" width=\"10\" height=\"13\" rx=\"1.5\"/><path d=\"M6 5h4M6 8h2\"/></svg>"
            } else {
                "<svg width=\"14\" height=\"14\" viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"3\" y=\"1.5\" width=\"10\" height=\"13\" rx=\"1.5\"/></svg>"
            };
            html.push_str(&format!(
                "<a class=\"tree-item\" hx-get=\"/source/{encoded}\" hx-target=\"#content\" hx-push-url=\"true\" href=\"#\">{indent}<span class=\"tree-icon\">{icon}</span> {name}</a>",
                name = html_escape(&entry.name),
            ));
        }
        html.push_str("</li>");
    }
    html.push_str("</ul>");
}

pub(crate) async fn source_tree_view(State(state): State<SharedState>) -> Html<String> {
    let state = state.read().await;
    let project_path = &state.project_path_buf;
    let tree = build_tree(project_path, "", 0);
    let mut html = String::from("<h2>Source Files</h2>");
    html.push_str(&format!(
        "<p class=\"meta\" style=\"margin-bottom:1rem\">Project directory: <code>{}</code></p>",
        html_escape(&project_path.display().to_string())
    ));
    html.push_str("<div class=\"card source-tree\">");
    render_tree(&tree, &mut html, 0);
    html.push_str("</div>");
    Html(html)
}

fn format_size(bytes: u64) -> String {
    if bytes < 1024 {
        format!("{bytes} B")
    } else if bytes < 1024 * 1024 {
        format!("{:.1} KB", bytes as f64 / 1024.0)
    } else {
        format!("{:.1} MB", bytes as f64 / (1024.0 * 1024.0))
    }
}

fn format_mtime(time: std::time::SystemTime) -> String {
    let secs = time
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_secs())
        .unwrap_or(0);
    std::process::Command::new("date")
        .args(["-r", &secs.to_string(), "+%Y-%m-%d %H:%M:%S"])
        .output()
        .ok()
        .filter(|o| o.status.success())
        .map(|o| String::from_utf8_lossy(&o.stdout).trim().to_string())
        .unwrap_or_else(|| format!("epoch+{secs}s"))
}

fn collect_artifact_ids(store: &rivet_core::store::Store) -> std::collections::HashSet<String> {
    store.iter().map(|a| a.id.clone()).collect()
}

/// Info about an artifact that references a source file, with optional line info.
struct FileRef {
    id: String,
    artifact_type: String,
    title: String,
    line: Option<u32>,
    end_line: Option<u32>,
}

fn artifacts_referencing_file(store: &rivet_core::store::Store, file_rel: &str) -> Vec<FileRef> {
    let rel = std::path::Path::new(file_rel);
    let mut refs = Vec::new();

    for a in store.iter() {
        // Check source_file (existing behavior)
        if let Some(sf) = &a.source_file {
            if sf == rel || sf.ends_with(file_rel) {
                refs.push(FileRef {
                    id: a.id.clone(),
                    artifact_type: a.artifact_type.clone(),
                    title: a.title.clone(),
                    line: None,
                    end_line: None,
                });
                continue;
            }
        }
        // Scan string fields for file:line references matching this file
        for value in a.fields.values() {
            if let serde_yaml::Value::String(s) = value {
                if let Some((_file, line, end_line)) = extract_file_ref(s, file_rel) {
                    refs.push(FileRef {
                        id: a.id.clone(),
                        artifact_type: a.artifact_type.clone(),
                        title: a.title.clone(),
                        line,
                        end_line,
                    });
                    break; // one ref per artifact is enough
                }
            }
        }
    }
    refs
}

/// If `val` contains a source ref matching `target_file`, return (file, line, end_line).
fn extract_file_ref(val: &str, target_file: &str) -> Option<(String, Option<u32>, Option<u32>)> {
    // Look for target_file possibly followed by :line or :line-line
    let idx = val.find(target_file)?;
    let after = &val[idx + target_file.len()..];
    if let Some(rest) = after.strip_prefix(':') {
        let digits_end = rest
            .find(|c: char| !c.is_ascii_digit())
            .unwrap_or(rest.len());
        if digits_end > 0 {
            let line: u32 = rest[..digits_end].parse().ok()?;
            let rest2 = &rest[digits_end..];
            if let Some(rest3) = rest2.strip_prefix('-') {
                let d2_end = rest3
                    .find(|c: char| !c.is_ascii_digit())
                    .unwrap_or(rest3.len());
                if d2_end > 0 {
                    let end_line: u32 = rest3[..d2_end].parse().ok()?;
                    return Some((target_file.to_string(), Some(line), Some(end_line)));
                }
            }
            return Some((target_file.to_string(), Some(line), None));
        }
    }
    Some((target_file.to_string(), None, None))
}

pub(crate) async fn source_file_view(
    State(state): State<SharedState>,
    Path(raw_path): Path<String>,
) -> Html<String> {
    let state = state.read().await;
    let project_path = &state.project_path_buf;
    let store = &state.store;
    let decoded = urlencoding::decode(&raw_path).unwrap_or(std::borrow::Cow::Borrowed(&raw_path));
    let rel_path = decoded.as_ref();

    let full_path = project_path.join(rel_path);
    let canonical = match full_path.canonicalize() {
        Ok(p) => p,
        Err(_) => {
            return Html(format!(
                "<h2>Not Found</h2><p>File <code>{}</code> does not exist.</p>",
                html_escape(rel_path)
            ));
        }
    };
    let canonical_project = match project_path.canonicalize() {
        Ok(p) => p,
        Err(_) => {
            return Html("<h2>Error</h2><p>Cannot resolve project path.</p>".into());
        }
    };
    if !canonical.starts_with(&canonical_project) {
        return Html("<h2>Forbidden</h2><p>Path traversal is not allowed.</p>".into());
    }

    let metadata = match std::fs::symlink_metadata(&full_path) {
        Ok(m) => m,
        Err(_) => {
            return Html(format!(
                "<h2>Not Found</h2><p>File <code>{}</code> does not exist.</p>",
                html_escape(rel_path)
            ));
        }
    };
    if metadata.file_type().is_symlink() {
        return Html("<h2>Forbidden</h2><p>Symlinks are not followed.</p>".into());
    }
    if metadata.is_dir() {
        return Html(format!(
            "<h2>Directory</h2><p><code>{}</code> is a directory. <a hx-get=\"/source\" hx-target=\"#content\" hx-push-url=\"true\" href=\"#\">Back to tree</a></p>",
            html_escape(rel_path)
        ));
    }

    let file_size = metadata.len();
    if file_size > SOURCE_MAX_SIZE {
        return Html(format!(
            "<h2>File Too Large</h2><p><code>{}</code> is {} which exceeds the 100 KB limit.</p><p><a hx-get=\"/source\" hx-target=\"#content\" hx-push-url=\"true\" href=\"#\" class=\"btn btn-secondary\">&larr; Back to files</a></p>",
            html_escape(rel_path),
            format_size(file_size)
        ));
    }

    let content = match std::fs::read_to_string(&full_path) {
        Ok(c) => c,
        Err(e) => {
            return Html(format!(
                "<h2>Error</h2><p>Cannot read <code>{}</code>: {}</p>",
                html_escape(rel_path),
                html_escape(&e.to_string())
            ));
        }
    };

    let mut html = String::new();

    // Breadcrumb
    html.push_str("<div class=\"source-breadcrumb\">");
    html.push_str(
        "<a hx-get=\"/source\" hx-target=\"#content\" hx-push-url=\"true\" href=\"#\">Source</a>",
    );
    let parts: Vec<&str> = rel_path.split('/').collect();
    for (i, part) in parts.iter().enumerate() {
        html.push_str("<span class=\"sep\">/</span>");
        if i == parts.len() - 1 {
            html.push_str(&format!("<strong>{}</strong>", html_escape(part)));
        } else {
            html.push_str(&format!("<span>{}</span>", html_escape(part)));
        }
    }
    html.push_str("</div>");

    // File metadata
    let mtime_str = metadata
        .modified()
        .map(format_mtime)
        .unwrap_or_else(|_| "unknown".into());
    html.push_str("<div class=\"source-meta\">");
    html.push_str(&format!(
        "<span class=\"meta-item\"><svg width=\"14\" height=\"14\" viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"3\" y=\"1.5\" width=\"10\" height=\"13\" rx=\"1.5\"/></svg> {}</span>",
        format_size(file_size)
    ));
    html.push_str(&format!(
        "<span class=\"meta-item\"><svg width=\"14\" height=\"14\" viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"8\" cy=\"8\" r=\"6.5\"/><path d=\"M8 4v4l3 2\"/></svg> {}</span>",
        html_escape(&mtime_str)
    ));
    html.push_str(&format!(
        "<span class=\"meta-item\">{} lines</span>",
        content.lines().count()
    ));
    html.push_str("</div>");

    let file_name = full_path.file_name().and_then(|n| n.to_str()).unwrap_or("");
    let is_yaml = file_name.ends_with(".yaml") || file_name.ends_with(".yml");
    let is_markdown = file_name.ends_with(".md");
    let is_rust = file_name.ends_with(".rs");
    let is_toml = file_name.ends_with(".toml");
    let is_shell = file_name.ends_with(".sh");
    let is_aadl = file_name.ends_with(".aadl");
    let artifact_ids = collect_artifact_ids(store);

    let file_lang = if is_yaml {
        "yaml"
    } else if is_rust {
        "rust"
    } else if is_toml {
        "toml"
    } else if is_shell {
        "bash"
    } else if is_aadl {
        "yaml" // AADL has similar key: value structure
    } else {
        ""
    };

    if is_markdown && content.starts_with("---") {
        if let Ok(doc) = rivet_core::document::parse_document(&content, Some(&full_path)) {
            html.push_str("<div class=\"card\"><div class=\"doc-body\">");
            let graph = &state.graph;
            let body_html = document::render_to_html(
                &doc,
                |aid| store.contains(aid),
                |aid| build_artifact_info(aid, store, graph),
            );
            let body_html = rewrite_image_paths(&body_html);
            html.push_str(&body_html);
            html.push_str("</div></div>");
        } else {
            render_code_block(&content, &artifact_ids, file_lang, &mut html);
        }
    } else {
        render_code_block(&content, &artifact_ids, file_lang, &mut html);
    }

    let refs = artifacts_referencing_file(store, rel_path);
    if !refs.is_empty() {
        html.push_str("<div class=\"source-refs card\">");
        html.push_str(&format!(
            "<h3>Artifacts Referencing This File ({})</h3>",
            refs.len()
        ));
        html.push_str("<table><thead><tr><th>ID</th><th>Type</th><th>Title</th><th>Lines</th></tr></thead><tbody>");
        for fref in &refs {
            let line_info = match (fref.line, fref.end_line) {
                (Some(l), Some(e)) => format!(
                    "<a href=\"#L{l}\" onclick=\"var el=document.getElementById('L{l}');if(el)el.scrollIntoView({{behavior:'smooth',block:'center'}})\">{l}-{e}</a>"
                ),
                (Some(l), None) => format!(
                    "<a href=\"#L{l}\" onclick=\"var el=document.getElementById('L{l}');if(el)el.scrollIntoView({{behavior:'smooth',block:'center'}})\">{l}</a>"
                ),
                _ => "—".into(),
            };
            html.push_str(&format!(
                "<tr><td><a hx-get=\"/artifacts/{id}\" hx-target=\"#content\" hx-push-url=\"true\" href=\"#\">{id}</a></td><td>{}</td><td>{}</td><td>{line_info}</td></tr>",
                badge_for_type(&fref.artifact_type),
                html_escape(&fref.title),
                id = fref.id,
            ));
        }
        html.push_str("</tbody></table></div>");
    }

    html.push_str("<p style=\"margin-top:1rem\"><a hx-get=\"/source\" hx-target=\"#content\" hx-push-url=\"true\" href=\"#\" class=\"btn btn-secondary\">&larr; Back to files</a></p>");
    Html(html)
}

/// Syntax-highlight a single line of YAML (returns HTML with `<span class="hl-*">` tokens).
fn highlight_yaml_line(line: &str) -> String {
    let escaped = html_escape(line);
    // Blank lines
    if line.trim().is_empty() {
        return escaped;
    }
    // Full-line comments
    let trimmed = line.trim_start();
    if trimmed.starts_with('#') {
        let indent = &escaped[..escaped.len() - html_escape(trimmed).len()];
        return format!(
            "{indent}<span class=\"hl-comment\">{}</span>",
            html_escape(trimmed)
        );
    }
    let mut out = String::with_capacity(escaped.len() + 64);
    // Check for key: value pattern
    // Find the first unquoted colon
    if let Some(colon_pos) = find_yaml_colon(trimmed) {
        let raw_indent = escaped.len() - html_escape(trimmed).len();
        let indent_str = &escaped[..raw_indent];
        out.push_str(indent_str);
        let key_part = &trimmed[..colon_pos];
        let rest = &trimmed[colon_pos..]; // starts with ':'
        // List prefix
        if let Some(after_dash) = key_part.strip_prefix("- ") {
            out.push_str("<span class=\"hl-punct\">-</span> ");
            out.push_str(&format!(
                "<span class=\"hl-key\">{}</span>",
                html_escape(after_dash)
            ));
        } else {
            out.push_str(&format!(
                "<span class=\"hl-key\">{}</span>",
                html_escape(key_part)
            ));
        }
        out.push_str("<span class=\"hl-punct\">:</span>");
        let after_colon = &rest[1..];
        if !after_colon.is_empty() {
            out.push_str(&highlight_yaml_value(after_colon));
        }
    } else if trimmed.starts_with("- ") {
        let raw_indent = escaped.len() - html_escape(trimmed).len();
        out.push_str(&escaped[..raw_indent]);
        out.push_str("<span class=\"hl-punct\">-</span>");
        out.push_str(&highlight_yaml_value(&trimmed[1..]));
    } else {
        out.push_str(&escaped);
    }
    out
}

fn find_yaml_colon(s: &str) -> Option<usize> {
    let (search, offset) = if let Some(rest) = s.strip_prefix("- ") {
        (rest, 2)
    } else {
        (s, 0)
    };
    let mut in_quote = false;
    let mut quote_char = ' ';
    for (i, c) in search.char_indices() {
        if in_quote {
            if c == quote_char {
                in_quote = false;
            }
            continue;
        }
        if c == '\'' || c == '"' {
            in_quote = true;
            quote_char = c;
            continue;
        }
        if c == ':' && (i + 1 >= search.len() || search.as_bytes()[i + 1] == b' ') {
            return Some(i + offset);
        }
    }
    None
}

fn highlight_yaml_value(val: &str) -> String {
    let trimmed = val.trim();
    if trimmed.is_empty() {
        return html_escape(val);
    }
    // Inline comment
    let (value_part, comment) = split_inline_comment(trimmed);
    let leading_space = &val[..val.len() - val.trim_start().len()];
    let mut out = String::new();
    out.push_str(&html_escape(leading_space));
    let v = value_part.trim();
    if v.is_empty() {
        // nothing
    } else if v == "true" || v == "false" {
        out.push_str(&format!("<span class=\"hl-bool\">{v}</span>"));
    } else if v == "null" || v == "~" {
        out.push_str(&format!("<span class=\"hl-null\">{v}</span>"));
    } else if v.starts_with('"') || v.starts_with('\'') {
        out.push_str(&format!("<span class=\"hl-str\">{}</span>", html_escape(v)));
    } else if v.starts_with('[') || v.starts_with('{') {
        // Inline collections — highlight brackets and values
        out.push_str(&highlight_yaml_inline_collection(v));
    } else if v.starts_with('*') || v.starts_with('&') {
        out.push_str(&format!(
            "<span class=\"hl-anchor\">{}</span>",
            html_escape(v)
        ));
    } else if v == ">" || v == "|" || v == ">-" || v == "|-" {
        out.push_str(&format!(
            "<span class=\"hl-punct\">{}</span>",
            html_escape(v)
        ));
    } else if v.parse::<f64>().is_ok() {
        out.push_str(&format!("<span class=\"hl-num\">{}</span>", html_escape(v)));
    } else {
        out.push_str(&format!("<span class=\"hl-str\">{}</span>", html_escape(v)));
    }
    if !comment.is_empty() {
        out.push_str(&format!(
            "  <span class=\"hl-comment\">{}</span>",
            html_escape(comment)
        ));
    }
    out
}

fn split_inline_comment(s: &str) -> (&str, &str) {
    let mut in_quote = false;
    let mut qc = ' ';
    let bytes = s.as_bytes();
    for i in 0..bytes.len() {
        let c = bytes[i] as char;
        if in_quote {
            if c == qc {
                in_quote = false;
            }
            continue;
        }
        if c == '\'' || c == '"' {
            in_quote = true;
            qc = c;
            continue;
        }
        if c == '#' && (i == 0 || bytes[i - 1] == b' ') {
            return (s[..i].trim_end(), &s[i..]);
        }
    }
    (s, "")
}

fn highlight_yaml_inline_collection(s: &str) -> String {
    let mut out = String::new();
    for c in s.chars() {
        match c {
            '[' | ']' | '{' | '}' | ',' => {
                out.push_str(&format!("<span class=\"hl-punct\">{c}</span>"));
            }
            _ => out.push(c),
        }
    }
    out
}

/// Syntax-highlight a single line of shell/bash.
fn highlight_bash_line(line: &str) -> String {
    let escaped = html_escape(line);
    let trimmed = line.trim();
    if trimmed.is_empty() || trimmed.starts_with('#') {
        if trimmed.starts_with('#') {
            return format!("<span class=\"hl-comment\">{}</span>", escaped);
        }
        return escaped;
    }
    // Simple: highlight the command name and flags
    let mut out = String::new();
    let mut first_word = true;
    for token in trimmed.split_whitespace() {
        if !first_word || !out.is_empty() {
            out.push(' ');
        }
        if token == "|" || token == "&&" || token == "||" {
            out.push_str(&format!(
                "<span class=\"hl-sh-pipe\">{}</span>",
                html_escape(token)
            ));
            first_word = true;
            continue;
        }
        if first_word {
            out.push_str(&format!(
                "<span class=\"hl-sh-cmd\">{}</span>",
                html_escape(token)
            ));
            first_word = false;
        } else if token.starts_with('-') {
            out.push_str(&format!(
                "<span class=\"hl-sh-flag\">{}</span>",
                html_escape(token)
            ));
        } else if token.starts_with('"') || token.starts_with('\'') {
            out.push_str(&format!(
                "<span class=\"hl-str\">{}</span>",
                html_escape(token)
            ));
        } else {
            out.push_str(&html_escape(token));
        }
    }
    // Preserve leading indent
    let indent = &escaped[..escaped.len() - html_escape(trimmed).len()];
    format!("{indent}{out}")
}

/// Apply syntax highlighting to an already-escaped line, based on file type.
fn syntax_highlight_line(line: &str, lang: &str) -> String {
    match lang {
        "yaml" | "yml" => highlight_yaml_line(line),
        "bash" | "sh" | "shell" => highlight_bash_line(line),
        "rust" | "rs" => highlight_rust_line(line),
        "toml" => highlight_toml_line(line),
        _ => html_escape(line),
    }
}

/// Syntax-highlight a single line of Rust source.
fn highlight_rust_line(line: &str) -> String {
    let trimmed = line.trim_start();
    if trimmed.is_empty() {
        return html_escape(line);
    }
    // Full-line comments
    if trimmed.starts_with("//") {
        let indent = &line[..line.len() - trimmed.len()];
        return format!(
            "{}<span class=\"hl-comment\">{}</span>",
            html_escape(indent),
            html_escape(trimmed)
        );
    }
    // Attributes: #[...] or #![...]
    if trimmed.starts_with("#[") || trimmed.starts_with("#![") {
        let indent = &line[..line.len() - trimmed.len()];
        return format!(
            "{}<span class=\"hl-attr\">{}</span>",
            html_escape(indent),
            html_escape(trimmed)
        );
    }
    let escaped = html_escape(line);
    let mut out = String::with_capacity(escaped.len() * 2);
    let chars: Vec<char> = line.chars().collect();
    let len = chars.len();
    let mut i = 0;
    while i < len {
        let ch = chars[i];
        // String literals
        if ch == '"' {
            let start = i;
            i += 1;
            while i < len && chars[i] != '"' {
                if chars[i] == '\\' {
                    i += 1;
                }
                i += 1;
            }
            if i < len {
                i += 1;
            }
            let s: String = chars[start..i].iter().collect();
            out.push_str(&format!(
                "<span class=\"hl-str\">{}</span>",
                html_escape(&s)
            ));
            continue;
        }
        // Char literals
        if ch == '\'' && i + 2 < len && chars[i + 2] == '\'' {
            let s: String = chars[i..i + 3].iter().collect();
            out.push_str(&format!(
                "<span class=\"hl-str\">{}</span>",
                html_escape(&s)
            ));
            i += 3;
            continue;
        }
        // Line comments (mid-line)
        if ch == '/' && i + 1 < len && chars[i + 1] == '/' {
            let s: String = chars[i..].iter().collect();
            out.push_str(&format!(
                "<span class=\"hl-comment\">{}</span>",
                html_escape(&s)
            ));
            break;
        }
        // Numbers
        if ch.is_ascii_digit() && (i == 0 || !chars[i - 1].is_alphanumeric()) {
            let start = i;
            while i < len
                && (chars[i].is_ascii_alphanumeric() || chars[i] == '_' || chars[i] == '.')
            {
                i += 1;
            }
            let s: String = chars[start..i].iter().collect();
            out.push_str(&format!(
                "<span class=\"hl-num\">{}</span>",
                html_escape(&s)
            ));
            continue;
        }
        // Identifiers and keywords
        if ch.is_ascii_alphabetic() || ch == '_' {
            let start = i;
            while i < len && (chars[i].is_ascii_alphanumeric() || chars[i] == '_') {
                i += 1;
            }
            let word: String = chars[start..i].iter().collect();
            // Check for macro invocation: word!
            if i < len
                && chars[i] == '!'
                && !matches!(
                    word.as_str(),
                    "if" | "else" | "return" | "break" | "continue"
                )
            {
                out.push_str(&format!(
                    "<span class=\"hl-macro\">{}!</span>",
                    html_escape(&word)
                ));
                i += 1;
                continue;
            }
            match word.as_str() {
                "fn" | "let" | "mut" | "pub" | "use" | "mod" | "struct" | "enum" | "impl"
                | "trait" | "const" | "static" | "type" | "where" | "match" | "if" | "else"
                | "for" | "while" | "loop" | "return" | "break" | "continue" | "async"
                | "await" | "move" | "ref" | "self" | "super" | "crate" | "unsafe" | "extern"
                | "dyn" | "as" | "in" | "true" | "false" | "Self" | "None" | "Some" | "Ok"
                | "Err" => {
                    out.push_str(&format!(
                        "<span class=\"hl-kw\">{}</span>",
                        html_escape(&word)
                    ));
                }
                _ if word.chars().next().is_some_and(|c| c.is_ascii_uppercase()) => {
                    out.push_str(&format!(
                        "<span class=\"hl-type\">{}</span>",
                        html_escape(&word)
                    ));
                }
                _ => out.push_str(&html_escape(&word)),
            }
            continue;
        }
        // Punctuation: &, ::, ->, =>, etc.
        out.push_str(&html_escape(&ch.to_string()));
        i += 1;
    }
    out
}

/// Syntax-highlight a single line of TOML.
fn highlight_toml_line(line: &str) -> String {
    let trimmed = line.trim_start();
    if trimmed.is_empty() {
        return html_escape(line);
    }
    let indent = &line[..line.len() - trimmed.len()];
    // Comments
    if trimmed.starts_with('#') {
        return format!(
            "{}<span class=\"hl-comment\">{}</span>",
            html_escape(indent),
            html_escape(trimmed)
        );
    }
    // Section headers [foo] or [[foo]]
    if trimmed.starts_with('[') {
        return format!(
            "{}<span class=\"hl-key\">{}</span>",
            html_escape(indent),
            html_escape(trimmed)
        );
    }
    // key = value
    if let Some(eq_pos) = trimmed.find('=') {
        let key = &trimmed[..eq_pos].trim_end();
        let rest = &trimmed[eq_pos..];
        return format!(
            "{}<span class=\"hl-key\">{}</span>{}",
            html_escape(indent),
            html_escape(key),
            highlight_toml_value(rest)
        );
    }
    html_escape(line)
}

fn highlight_toml_value(s: &str) -> String {
    let trimmed = s.strip_prefix('=').unwrap_or(s);
    let val = trimmed.trim();
    if val.starts_with('"') || val.starts_with('\'') {
        return format!(
            "<span class=\"hl-punct\">=</span> <span class=\"hl-str\">{}</span>",
            html_escape(val)
        );
    }
    if val == "true" || val == "false" {
        return format!(
            "<span class=\"hl-punct\">=</span> <span class=\"hl-bool\">{}</span>",
            val
        );
    }
    if val.chars().next().is_some_and(|c| c.is_ascii_digit()) {
        return format!(
            "<span class=\"hl-punct\">=</span> <span class=\"hl-num\">{}</span>",
            html_escape(val)
        );
    }
    format!("<span class=\"hl-punct\">=</span> {}", html_escape(trimmed))
}

fn render_code_block(
    content: &str,
    artifact_ids: &std::collections::HashSet<String>,
    lang: &str,
    html: &mut String,
) {
    html.push_str("<div class=\"card source-viewer\"><table>");
    for (i, line) in content.lines().enumerate() {
        let line_num = i + 1;
        let has_artifact = artifact_ids.iter().any(|id| line.contains(id.as_str()));
        let row_class = if has_artifact {
            "source-line source-line-highlight"
        } else {
            "source-line"
        };
        // First apply syntax highlighting
        let highlighted = if !lang.is_empty() {
            syntax_highlight_line(line, lang)
        } else {
            html_escape(line)
        };
        // Then overlay artifact links on top
        let display_line = if !lang.is_empty() {
            let mut result = highlighted;
            let mut ids: Vec<&String> = artifact_ids
                .iter()
                .filter(|id| line.contains(id.as_str()))
                .collect();
            ids.sort_by_key(|b| std::cmp::Reverse(b.len()));
            for id in ids {
                let escaped_id = html_escape(id);
                // The ID may be wrapped in a highlight span — search for it
                if let Some(pos) = result.find(&escaped_id) {
                    let link = format!(
                        "<a class=\"artifact-ref\" hx-get=\"/artifacts/{id}\" hx-target=\"#content\" hx-push-url=\"true\" href=\"#\">{escaped_id}</a>"
                    );
                    let before = &result[..pos];
                    let after = &result[pos + escaped_id.len()..];
                    result = format!("{before}{link}{after}");
                }
            }
            result
        } else {
            highlighted
        };
        html.push_str(&format!(
            "<tr id=\"L{line_num}\" class=\"{row_class}\"><td class=\"line-no\"><a href=\"#L{line_num}\">{line_num}</a></td><td class=\"line-content\">{display_line}</td></tr>"
        ));
    }
    html.push_str("</table></div>");
}

// ── Diff ─────────────────────────────────────────────────────────────────

#[derive(Debug, serde::Deserialize)]
pub(crate) struct DiffParams {
    base: Option<String>,
    head: Option<String>,
}

fn discover_git_refs(pp: &std::path::Path) -> (Vec<String>, Vec<String>) {
    let rg = |a: &[&str]| -> Vec<String> {
        std::process::Command::new("git")
            .args(a)
            .current_dir(pp)
            .output()
            .ok()
            .filter(|o| o.status.success())
            .map(|o| {
                String::from_utf8_lossy(&o.stdout)
                    .lines()
                    .map(|l| l.trim().to_string())
                    .filter(|l| !l.is_empty())
                    .collect()
            })
            .unwrap_or_default()
    };
    let tags = rg(&["tag", "--list", "--sort=-creatordate"]);
    let branches: Vec<String> = rg(&["branch", "--list", "--format=%(refname:short)"])
        .into_iter()
        .filter(|b| b != "HEAD")
        .collect();
    (tags, branches)
}

fn load_store_from_git_ref(pp: &std::path::Path, gr: &str) -> Result<Store, String> {
    let rg = |a: &[&str]| -> Result<String, String> {
        let o = std::process::Command::new("git")
            .args(a)
            .current_dir(pp)
            .output()
            .map_err(|e| format!("git: {e}"))?;
        if !o.status.success() {
            return Err(format!(
                "git show {gr} failed: {}",
                String::from_utf8_lossy(&o.stderr).trim()
            ));
        }
        Ok(String::from_utf8_lossy(&o.stdout).to_string())
    };

    // Project path relative to git repo root (e.g. "rivet/" or "").
    // Needed because `git show REF:path` expects repo-root-relative paths.
    let prefix = rg(&["rev-parse", "--show-prefix"])?.trim().to_owned();

    let config_path = format!("{prefix}rivet.yaml");
    let cc = rg(&["show", &format!("{gr}:{config_path}")])?;
    let cfg: ProjectConfig =
        serde_yaml::from_str(&cc).map_err(|e| format!("parse rivet.yaml@{gr}: {e}"))?;
    let mut store = Store::new();
    let adp = GenericYamlAdapter::new();
    let ac = AdapterConfig::default();
    for src in &cfg.sources {
        if src.format != "generic-yaml" && src.format != "generic" {
            continue;
        }
        let src_path = format!("{prefix}{}", src.path);
        let tree = rg(&["ls-tree", "-r", "--name-only", gr, "--", &src_path])?;
        for fp in tree.lines() {
            let fp = fp.trim();
            if fp.is_empty() || (!fp.ends_with(".yaml") && !fp.ends_with(".yml")) {
                continue;
            }
            let ct = match rg(&["show", &format!("{gr}:{fp}")]) {
                Ok(c) => c,
                Err(_) => continue,
            };
            if let Ok(arts) = adp.import(&AdapterSource::Bytes(ct.into_bytes()), &ac) {
                for a in arts {
                    store.upsert(a);
                }
            }
        }
    }
    Ok(store)
}

fn diff_ref_options(sel: &str, tags: &[String], branches: &[String], inc_wt: bool) -> String {
    let mut h = String::new();
    if inc_wt {
        let s = if sel == "working" { " selected" } else { "" };
        h.push_str(&format!(
            "<option value=\"working\"{s}>Working tree (unstaged)</option>"
        ));
    }
    for o in &["HEAD", "HEAD~1", "HEAD~2", "HEAD~3", "HEAD~4", "HEAD~5"] {
        let s = if sel == *o { " selected" } else { "" };
        h.push_str(&format!("<option value=\"{o}\"{s}>{o}</option>"));
    }
    if !tags.is_empty() {
        h.push_str("<optgroup label=\"Tags\">");
        for t in tags {
            let s = if sel == t { " selected" } else { "" };
            h.push_str(&format!(
                "<option value=\"{t}\"{s}>{t}</option>",
                t = html_escape(t)
            ));
        }
        h.push_str("</optgroup>");
    }
    if !branches.is_empty() {
        h.push_str("<optgroup label=\"Branches\">");
        for b in branches {
            let s = if sel == b { " selected" } else { "" };
            h.push_str(&format!(
                "<option value=\"{b}\"{s}>{b}</option>",
                b = html_escape(b)
            ));
        }
        h.push_str("</optgroup>");
    }
    h
}

pub(crate) async fn diff_view(
    State(state): State<SharedState>,
    Query(params): Query<DiffParams>,
) -> Html<String> {
    let state = state.read().await;
    let pp = &state.project_path_buf;
    let br = params.base.unwrap_or_default();
    let hr = params.head.unwrap_or_default();
    let (tags, branches) = discover_git_refs(pp);
    let mut html = String::from("<h2>Diff</h2>");
    html.push_str(
        "<div class=\"card\"><form class=\"form-row\" hx-get=\"/diff\" hx-target=\"#content\">",
    );
    let bs = if br.is_empty() { "HEAD" } else { &br };
    html.push_str("<div><label>Base</label><select name=\"base\">");
    html.push_str(&diff_ref_options(bs, &tags, &branches, false));
    html.push_str("</select></div>");
    let hs = if hr.is_empty() { "working" } else { &hr };
    html.push_str("<div><label>Head</label><select name=\"head\">");
    html.push_str(&diff_ref_options(hs, &tags, &branches, true));
    html.push_str("</select></div>");
    html.push_str("<div><label>&nbsp;</label><button type=\"submit\">Compare</button></div>");
    html.push_str("</form></div>");
    if br.is_empty() && hr.is_empty() {
        html.push_str("<div class=\"card\" style=\"text-align:center;padding:3rem;color:var(--text-secondary)\"><p style=\"font-size:1.1rem;margin-bottom:.5rem\">Select a base and head revision, then click <strong>Compare</strong>.</p><p style=\"font-size:.88rem\">This will compare artifact YAML files between two git states.</p></div>");
        return Html(html);
    }
    let base_store = match load_store_from_git_ref(pp, &br) {
        Ok(s) => s,
        Err(e) => {
            html.push_str(&format!("<div class=\"card\" style=\"color:#c62828\"><strong>Error loading base ({}):</strong> {}</div>", html_escape(&br), html_escape(&e)));
            return Html(html);
        }
    };
    let head_store: Store;
    let head_label: String;
    if hr == "working" || hr.is_empty() {
        head_store = state.store.clone();
        head_label = "Working tree".to_string();
    } else {
        match load_store_from_git_ref(pp, &hr) {
            Ok(s) => {
                head_store = s;
                head_label = hr.clone();
            }
            Err(e) => {
                html.push_str(&format!("<div class=\"card\" style=\"color:#c62828\"><strong>Error loading head ({}):</strong> {}</div>", html_escape(&hr), html_escape(&e)));
                return Html(html);
            }
        }
    };
    let diff = ArtifactDiff::compute(&base_store, &head_store);
    html.push_str(&format!("<p class=\"meta\" style=\"margin-bottom:.75rem\">Comparing <strong>{}</strong> &rarr; <strong>{}</strong></p>", html_escape(&br), html_escape(&head_label)));
    html.push_str("<div class=\"diff-summary\">");
    html.push_str(&format!("<span class=\"diff-summary-item\"><span class=\"diff-icon diff-icon-add\">+</span> {} added</span>", diff.added.len()));
    html.push_str(&format!("<span class=\"diff-summary-item\"><span class=\"diff-icon diff-icon-remove\">&minus;</span> {} removed</span>", diff.removed.len()));
    html.push_str(&format!("<span class=\"diff-summary-item\"><span class=\"diff-icon diff-icon-modify\">&Delta;</span> {} modified</span>", diff.modified.len()));
    html.push_str(&format!("<span class=\"diff-summary-item\" style=\"color:var(--text-secondary)\">{} unchanged</span>", diff.unchanged));
    html.push_str("</div>");
    if diff.is_empty() {
        html.push_str("<div class=\"card\" style=\"text-align:center;padding:2rem;color:var(--text-secondary)\"><p>No differences found between these revisions.</p></div>");
        return Html(html);
    }
    html.push_str("<div class=\"card\" style=\"padding:0;overflow:hidden\">");
    for id in &diff.added {
        let title = head_store.get(id).map(|a| a.title.as_str()).unwrap_or("");
        let at = head_store
            .get(id)
            .map(|a| a.artifact_type.as_str())
            .unwrap_or("");
        html.push_str(&format!("<div class=\"diff-added\" style=\"padding:.6rem .875rem;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:.5rem\"><span class=\"diff-icon diff-icon-add\">+</span><code style=\"font-weight:600\">{}</code> {} <span>{}</span></div>", html_escape(id), badge_for_type(at), html_escape(title)));
    }
    for id in &diff.removed {
        let title = base_store.get(id).map(|a| a.title.as_str()).unwrap_or("");
        let at = base_store
            .get(id)
            .map(|a| a.artifact_type.as_str())
            .unwrap_or("");
        html.push_str(&format!("<div class=\"diff-removed\" style=\"padding:.6rem .875rem;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:.5rem\"><span class=\"diff-icon diff-icon-remove\">&minus;</span><code style=\"font-weight:600\">{}</code> {} <span>{}</span></div>", html_escape(id), badge_for_type(at), html_escape(title)));
    }
    for ch in &diff.modified {
        let at = head_store
            .get(&ch.id)
            .map(|a| a.artifact_type.as_str())
            .unwrap_or("");
        let title = head_store
            .get(&ch.id)
            .map(|a| a.title.as_str())
            .unwrap_or("");
        html.push_str(&format!("<details class=\"diff-row\"><summary class=\"diff-modified\"><span class=\"diff-icon diff-icon-modify\">&Delta;</span><code style=\"font-weight:600\">{}</code> {} <span>{}</span><span class=\"ver-chevron\" style=\"margin-left:auto\"><svg width=\"12\" height=\"12\" viewBox=\"0 0 12 12\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M4 2l4 4-4 4\"/></svg></span></summary><div class=\"diff-detail\">", html_escape(&ch.id), badge_for_type(at), html_escape(title)));
        if let Some((ref o, ref n)) = ch.title_changed {
            html.push_str(&format!("<div class=\"diff-field\"><span class=\"diff-field-name\">Title</span> <span class=\"diff-old\">{}</span> <span class=\"diff-arrow\">&rarr;</span> <span class=\"diff-new\">{}</span></div>", html_escape(o), html_escape(n)));
        }
        if let Some((ref o, ref n)) = ch.status_changed {
            html.push_str(&format!("<div class=\"diff-field\"><span class=\"diff-field-name\">Status</span> <span class=\"diff-old\">{}</span> <span class=\"diff-arrow\">&rarr;</span> <span class=\"diff-new\">{}</span></div>", html_escape(o.as_deref().unwrap_or("(none)")), html_escape(n.as_deref().unwrap_or("(none)"))));
        }
        if let Some((ref o, ref n)) = ch.type_changed {
            html.push_str(&format!("<div class=\"diff-field\"><span class=\"diff-field-name\">Type</span> <span class=\"diff-old\">{}</span> <span class=\"diff-arrow\">&rarr;</span> <span class=\"diff-new\">{}</span></div>", html_escape(o), html_escape(n)));
        }
        if ch.description_changed {
            html.push_str("<div class=\"diff-field\"><span class=\"diff-field-name\">Description</span> <span style=\"color:var(--text-secondary);font-style:italic\">changed</span></div>");
        }
        for t in &ch.tags_added {
            html.push_str(&format!("<div class=\"diff-field\"><span class=\"diff-field-name\">Tag</span> <span class=\"diff-new\">+ {}</span></div>", html_escape(t)));
        }
        for t in &ch.tags_removed {
            html.push_str(&format!("<div class=\"diff-field\"><span class=\"diff-field-name\">Tag</span> <span class=\"diff-old\">&minus; {}</span></div>", html_escape(t)));
        }
        for l in &ch.links_added {
            html.push_str(&format!("<div class=\"diff-field\"><span class=\"diff-field-name\">Link</span> <span class=\"diff-new\">+ {} &rarr; {}</span></div>", html_escape(&l.link_type), html_escape(&l.target)));
        }
        for l in &ch.links_removed {
            html.push_str(&format!("<div class=\"diff-field\"><span class=\"diff-field-name\">Link</span> <span class=\"diff-old\">&minus; {} &rarr; {}</span></div>", html_escape(&l.link_type), html_escape(&l.target)));
        }
        for f in &ch.fields_changed {
            html.push_str(&format!("<div class=\"diff-field\"><span class=\"diff-field-name\">Field</span> <span style=\"color:var(--text-secondary)\">{} changed</span></div>", html_escape(f)));
        }
        html.push_str("</div></details>");
    }
    html.push_str("</div>");
    Html(html)
}

// ── Document linkage view ────────────────────────────────────────────────

pub(crate) async fn doc_linkage_view(State(state): State<SharedState>) -> Html<String> {
    let state = state.read().await;
    let store = &state.store;
    let doc_store = &state.doc_store;
    let graph = &state.graph;

    let mut html = String::from("<h2>Document Linkage</h2>");
    html.push_str("<p class=\"meta\">Shows how documents relate through their artifact references and which artifacts remain unlinked.</p>");

    // Collect per-document artifact sets
    struct DocInfo {
        id: String,
        title: String,
        artifact_ids: Vec<String>,
    }
    let mut doc_infos: Vec<DocInfo> = Vec::new();
    let mut all_doc_artifacts: std::collections::HashSet<String> = std::collections::HashSet::new();

    for doc in doc_store.iter() {
        let mut seen = std::collections::HashSet::new();
        let art_ids: Vec<String> = doc
            .references
            .iter()
            .filter(|r| seen.insert(r.artifact_id.clone()))
            .map(|r| r.artifact_id.clone())
            .collect();
        for aid in &art_ids {
            all_doc_artifacts.insert(aid.clone());
        }
        doc_infos.push(DocInfo {
            id: doc.id.clone(),
            title: doc.title.clone(),
            artifact_ids: art_ids,
        });
    }

    // Also consider artifacts loaded from YAML source files as "belonging" to that source
    // Group by source file directory
    let mut source_groups: std::collections::BTreeMap<String, Vec<String>> =
        std::collections::BTreeMap::new();
    for a in store.iter() {
        if let Some(sf) = &a.source_file {
            let dir = sf.parent().and_then(|p| p.to_str()).unwrap_or("artifacts");
            source_groups
                .entry(dir.to_string())
                .or_default()
                .push(a.id.clone());
        }
    }

    // ── Document linkage graph (via etch layout engine) ──
    // Build a petgraph where nodes = documents + source groups, edges = cross-doc links
    {
        use petgraph::Graph;
        let mut pg: Graph<String, String> = Graph::new();
        let mut node_idx_map: std::collections::HashMap<String, petgraph::graph::NodeIndex> =
            std::collections::HashMap::new();

        // Add document nodes
        for doc in &doc_infos {
            let idx = pg.add_node(doc.id.clone());
            node_idx_map.insert(doc.id.clone(), idx);
        }
        // Add source group nodes
        for path in source_groups.keys() {
            let short = std::path::Path::new(path.as_str())
                .file_name()
                .and_then(|n| n.to_str())
                .unwrap_or(path);
            let label = format!("{short}/");
            let idx = pg.add_node(label.clone());
            node_idx_map.insert(path.clone(), idx);
        }

        // Build artifact→node index (which node "owns" each artifact)
        let mut art_to_node: std::collections::HashMap<String, String> =
            std::collections::HashMap::new();
        for doc in &doc_infos {
            for aid in &doc.artifact_ids {
                art_to_node.insert(aid.clone(), doc.id.clone());
            }
        }
        for (path, ids) in &source_groups {
            for aid in ids {
                art_to_node
                    .entry(aid.clone())
                    .or_insert_with(|| path.clone());
            }
        }

        // Add edges: collect link types per (src_node→tgt_node) pair
        // Uses both forward links and backlinks so target-only nodes (like SRS-001) get edges too
        let mut edge_types: std::collections::HashMap<
            (String, String),
            std::collections::BTreeSet<String>,
        > = std::collections::HashMap::new();
        for (aid, src_node) in &art_to_node {
            if let Some(a) = store.get(aid) {
                for link in &a.links {
                    if let Some(tgt_node) = art_to_node.get(&link.target) {
                        if tgt_node != src_node {
                            edge_types
                                .entry((src_node.clone(), tgt_node.clone()))
                                .or_default()
                                .insert(link.link_type.clone());
                        }
                    }
                }
            }
        }
        for ((src, tgt), types) in &edge_types {
            if let (Some(&si), Some(&ti)) = (node_idx_map.get(src), node_idx_map.get(tgt)) {
                let label = types.iter().cloned().collect::<Vec<_>>().join(", ");
                pg.add_edge(si, ti, label);
            }
        }

        // Build type map for coloring: documents=specification, source groups=source
        let doc_ids: std::collections::HashSet<String> =
            doc_infos.iter().map(|d| d.id.clone()).collect();

        let mut colors = type_color_map();
        colors.insert("document".into(), "#3a86ff".into());
        colors.insert("source-group".into(), "#4caf50".into());

        let svg_opts = SvgOptions {
            type_colors: colors,
            interactive: true,
            base_url: Some("/documents".into()),
            background: Some("#fafbfc".into()),
            font_size: 12.0,
            edge_color: "#3a86ff".into(),
            ..SvgOptions::default()
        };

        let layout_opts = LayoutOptions {
            node_width: 220.0,
            node_height: 60.0,
            rank_separation: 100.0,
            node_separation: 40.0,
            ..Default::default()
        };

        let gl = pgv_layout::layout(
            &pg,
            &|_idx, label| {
                let node_type = if doc_ids.contains(label) {
                    "document"
                } else {
                    "source-group"
                };
                let sublabel = if doc_ids.contains(label) {
                    doc_infos.iter().find(|d| d.id == *label).map(|d| {
                        let s = format!("{} ({} refs)", d.title, d.artifact_ids.len());
                        if s.len() > 30 {
                            format!("{}...", &s[..28])
                        } else {
                            s
                        }
                    })
                } else {
                    source_groups
                        .iter()
                        .find(|(p, _)| {
                            let short = std::path::Path::new(p.as_str())
                                .file_name()
                                .and_then(|n| n.to_str())
                                .unwrap_or(p);
                            format!("{short}/") == *label
                        })
                        .map(|(_, ids)| format!("{} artifacts", ids.len()))
                };
                NodeInfo {
                    id: label.clone(),
                    label: label.clone(),
                    node_type: node_type.into(),
                    sublabel,
                    parent: None,
                    ports: vec![],
                }
            },
            &|_idx, e| EdgeInfo {
                label: e.clone(),
                source_port: None,
                target_port: None,
            },
            &layout_opts,
        );

        let svg = render_svg(&gl, &svg_opts);
        html.push_str(
            "<div class=\"svg-viewer\" id=\"doc-graph-viewer\">\
            <div class=\"svg-viewer-toolbar\">\
              <button onclick=\"svgZoomFit(this)\" title=\"Zoom to fit\">\u{229e}</button>\
              <button onclick=\"svgFullscreen(this)\" title=\"Fullscreen\">\u{26f6}</button>\
              <button onclick=\"svgPopout(this)\" title=\"Open in new window\">\u{2197}</button>\
            </div>\
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
            "<p class=\"meta\">{} nodes, {} edges &mdash; scroll to zoom, drag to pan, drag nodes to reposition</p>",
            gl.nodes.len(), gl.edges.len()
        ));
    }

    // ── Inter-document link table ──
    html.push_str("<div class=\"card\"><h3>Cross-Document Links</h3>");
    html.push_str("<p style=\"font-size:.85rem;color:var(--text-secondary)\">Artifacts in one document that link to artifacts in another document.</p>");
    html.push_str("<table><thead><tr><th>Source Doc</th><th>Artifact</th><th>Link</th><th>Target</th><th>Target Doc</th></tr></thead><tbody>");

    let mut cross_link_count = 0u32;
    // Build artifact→document index
    let mut art_to_doc: std::collections::HashMap<String, String> =
        std::collections::HashMap::new();
    for doc in &doc_infos {
        for aid in &doc.artifact_ids {
            art_to_doc.insert(aid.clone(), doc.id.clone());
        }
    }

    for doc in &doc_infos {
        for aid in &doc.artifact_ids {
            if let Some(a) = store.get(aid) {
                for link in &a.links {
                    if let Some(target_doc) = art_to_doc.get(&link.target) {
                        if target_doc != &doc.id {
                            cross_link_count += 1;
                            html.push_str(&format!(
                                "<tr><td><a hx-get=\"/documents/{src_doc}\" hx-target=\"#content\" hx-push-url=\"true\" href=\"#\">{src_doc}</a></td>\
                                 <td><a hx-get=\"/artifacts/{aid}\" hx-target=\"#content\" hx-push-url=\"true\" href=\"#\">{aid}</a></td>\
                                 <td><span class=\"link-pill\">{lt}</span></td>\
                                 <td><a hx-get=\"/artifacts/{tgt}\" hx-target=\"#content\" hx-push-url=\"true\" href=\"#\">{tgt}</a></td>\
                                 <td><a hx-get=\"/documents/{tgt_doc}\" hx-target=\"#content\" hx-push-url=\"true\" href=\"#\">{tgt_doc}</a></td></tr>",
                                src_doc = html_escape(&doc.id),
                                lt = html_escape(&link.link_type),
                                tgt = html_escape(&link.target),
                                tgt_doc = html_escape(target_doc),
                            ));
                        }
                    }
                }
            }
        }
    }

    if cross_link_count == 0 {
        html.push_str("<tr><td colspan=\"5\" style=\"text-align:center;color:var(--text-secondary)\">No cross-document links found</td></tr>");
    }
    html.push_str("</tbody></table></div>");

    // ── Unlinked artifacts ──
    // Artifacts that exist in the store but are NOT referenced by any document
    let all_artifact_ids: std::collections::HashSet<String> =
        store.iter().map(|a| a.id.clone()).collect();
    let unlinked: Vec<&rivet_core::model::Artifact> = store
        .iter()
        .filter(|a| !all_doc_artifacts.contains(&a.id))
        .collect();

    html.push_str("<div class=\"card\"><h3>Artifacts Not Referenced in Any Document</h3>");
    if unlinked.is_empty() {
        html.push_str("<p style=\"color:var(--text-secondary)\">All artifacts are referenced by at least one document.</p>");
    } else {
        html.push_str(&format!("<p style=\"font-size:.85rem;color:var(--text-secondary)\">{} artifacts are not referenced by any document via <code>[[ID]]</code>.</p>", unlinked.len()));
        html.push_str("<table><thead><tr><th>ID</th><th>Type</th><th>Title</th><th>Links</th></tr></thead><tbody>");
        for a in &unlinked {
            let link_count = a.links.len() + graph.backlinks_to(&a.id).len();
            html.push_str(&format!(
                "<tr><td><a hx-get=\"/artifacts/{id}\" hx-target=\"#content\" hx-push-url=\"true\" href=\"#\">{id}</a></td><td>{}</td><td>{}</td><td>{link_count}</td></tr>",
                badge_for_type(&a.artifact_type),
                html_escape(&a.title),
                id = html_escape(&a.id),
            ));
        }
        html.push_str("</tbody></table>");
    }
    html.push_str("</div>");

    // ── Per-document summary cards ──
    html.push_str("<div class=\"card\"><h3>Document Summary</h3>");
    html.push_str("<table><thead><tr><th>Document</th><th>Type</th><th>References</th><th>Valid Refs</th><th>Broken Refs</th></tr></thead><tbody>");
    for doc in doc_store.iter() {
        let total_refs = doc.references.len();
        let valid = doc
            .references
            .iter()
            .filter(|r| store.contains(&r.artifact_id))
            .count();
        let broken = total_refs - valid;
        let broken_class = if broken > 0 {
            " style=\"color:var(--error);font-weight:600\""
        } else {
            ""
        };
        html.push_str(&format!(
            "<tr><td><a hx-get=\"/documents/{id}\" hx-target=\"#content\" hx-push-url=\"true\" href=\"#\">{id}</a></td>\
             <td>{}</td><td>{total_refs}</td><td>{valid}</td><td{broken_class}>{broken}</td></tr>",
            badge_for_type(&doc.doc_type),
            id = html_escape(&doc.id),
        ));
    }
    html.push_str("</tbody></table></div>");

    let _ = all_artifact_ids;
    Html(html)
}

// ── Traceability explorer ────────────────────────────────────────────────

#[derive(Debug, serde::Deserialize)]
pub(crate) struct TraceParams {
    root_type: Option<String>,
    status: Option<String>,
    search: Option<String>,
}

#[derive(Debug, serde::Deserialize)]
pub(crate) struct TraceHistoryParams {
    file: Option<String>,
}

/// A node in the traceability tree.
struct TraceNode {
    id: String,
    artifact_type: String,
    title: String,
    status: String,
    link_type: String,
    children: Vec<TraceNode>,
}

/// Recursively build a trace tree starting from the backlinks of a given
/// artifact, descending up to `max_depth` levels.
fn build_trace_children(
    id: &str,
    store: &Store,
    graph: &LinkGraph,
    depth: usize,
    max_depth: usize,
) -> Vec<TraceNode> {
    if depth >= max_depth {
        return Vec::new();
    }
    let backlinks = graph.backlinks_to(id);
    let mut nodes: Vec<TraceNode> = Vec::new();
    for bl in backlinks {
        let child_id = &bl.source;
        let (artifact_type, title, status) = if let Some(a) = store.get(child_id) {
            (
                a.artifact_type.clone(),
                a.title.clone(),
                a.status.clone().unwrap_or_default(),
            )
        } else {
            continue;
        };
        let children = build_trace_children(child_id, store, graph, depth + 1, max_depth);
        nodes.push(TraceNode {
            id: child_id.clone(),
            artifact_type,
            title,
            status,
            link_type: bl.link_type.clone(),
            children,
        });
    }
    // Sort by link type then ID for stable ordering
    nodes.sort_by(|a, b| a.link_type.cmp(&b.link_type).then(a.id.cmp(&b.id)));
    nodes
}

/// Render a trace node and its children as nested `<details>` HTML.
fn render_trace_node(node: &TraceNode, depth: usize, project_path: &str) -> String {
    let badge = badge_for_type(&node.artifact_type);
    let status_class = match node.status.as_str() {
        "approved" => "trace-status-approved",
        "draft" => "trace-status-draft",
        _ => "",
    };
    let status_badge = if !node.status.is_empty() {
        format!(
            "<span class=\"trace-status {status_class}\">{}</span>",
            html_escape(&node.status)
        )
    } else {
        String::new()
    };
    let edge_label = format!(
        "<span class=\"trace-edge\">{}</span>",
        html_escape(&node.link_type)
    );
    let escaped_title = html_escape(&node.title);
    let escaped_id = html_escape(&node.id);

    if node.children.is_empty() {
        // Leaf node — no expanding
        format!(
            "<div class=\"trace-node\">{edge_label}{badge} \
             <a hx-get=\"/artifacts/{id}\" hx-target=\"#content\" hx-push-url=\"true\" href=\"#\">{escaped_id}</a> \
             <span style=\"color:var(--text-secondary)\">{escaped_title}</span>{status_badge}\
             <button class=\"btn btn-secondary\" style=\"margin-left:auto;padding:.2rem .5rem;font-size:.68rem\" \
             hx-get=\"/traceability/history?file={file}\" hx-target=\"#hist-{safe_id}\" hx-swap=\"innerHTML\"\
             >History</button></div>\
             <div id=\"hist-{safe_id}\" style=\"margin-left:1.5rem\"></div>",
            id = node.id,
            file = html_escape(project_path),
            safe_id = node.id.replace('.', "_"),
        )
    } else {
        let open_attr = if depth == 0 { " open" } else { "" };
        let child_count = node.children.len();
        let mut html = format!(
            "<details class=\"trace-details\"{open_attr}>\
             <summary>{edge_label}{badge} \
             <a hx-get=\"/artifacts/{id}\" hx-target=\"#content\" hx-push-url=\"true\" href=\"#\" \
             onclick=\"event.stopPropagation()\">{escaped_id}</a> \
             <span style=\"color:var(--text-secondary)\">{escaped_title}</span>{status_badge}\
             <span style=\"color:var(--text-secondary);font-size:.75rem;margin-left:.25rem\">({child_count})</span>\
             <span class=\"trace-chevron\"><svg width=\"12\" height=\"12\" viewBox=\"0 0 12 12\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M4 2l4 4-4 4\"/></svg></span>\
             <button class=\"btn btn-secondary\" style=\"margin-left:auto;padding:.2rem .5rem;font-size:.68rem\" \
             hx-get=\"/traceability/history?file={file}\" hx-target=\"#hist-{safe_id}\" hx-swap=\"innerHTML\" \
             onclick=\"event.stopPropagation()\"\
             >History</button></summary>\
             <div id=\"hist-{safe_id}\" style=\"margin-left:1.5rem\"></div>\
             <div class=\"trace-level\">",
            id = node.id,
            file = html_escape(project_path),
            safe_id = node.id.replace('.', "_"),
        );
        for child in &node.children {
            html.push_str(&render_trace_node(child, depth + 1, project_path));
        }
        html.push_str("</div></details>");
        html
    }
}

pub(crate) async fn traceability_view(
    State(state): State<SharedState>,
    Query(params): Query<TraceParams>,
) -> Html<String> {
    let state = state.read().await;
    let store = &state.store;
    let graph = &state.graph;

    // Collect all artifact types
    let mut all_types: Vec<&str> = store.types().collect();
    all_types.sort();

    let default_root = if store.count_by_type("requirement") > 0 {
        "requirement"
    } else if store.count_by_type("stakeholder-req") > 0 {
        "stakeholder-req"
    } else {
        all_types.first().copied().unwrap_or("requirement")
    };
    let root_type = params.root_type.as_deref().unwrap_or(default_root);
    let status_filter = params.status.as_deref().unwrap_or("all");
    let search_filter = params.search.as_deref().unwrap_or("").to_lowercase();

    // Get root artifacts
    let mut root_ids: Vec<&str> = store
        .by_type(root_type)
        .iter()
        .map(|s| s.as_str())
        .collect();
    root_ids.sort();

    // Apply filters
    let root_artifacts: Vec<&str> = root_ids
        .into_iter()
        .filter(|id| {
            if let Some(a) = store.get(id) {
                // Status filter
                if status_filter != "all" && a.status.as_deref().unwrap_or("") != status_filter {
                    return false;
                }
                // Search filter
                if !search_filter.is_empty() {
                    let id_match = id.to_lowercase().contains(&search_filter);
                    let title_match = a.title.to_lowercase().contains(&search_filter);
                    if !id_match && !title_match {
                        return false;
                    }
                }
                true
            } else {
                false
            }
        })
        .collect();

    let mut html = String::from("<h2>Traceability Explorer</h2>");

    // ── Filter controls ──────────────────────────────────────────────
    html.push_str("<div class=\"card\"><form class=\"form-row\" hx-get=\"/traceability\" hx-target=\"#content\">");
    html.push_str("<div><label>Root type</label><select name=\"root_type\">");
    for t in &all_types {
        let sel = if *t == root_type { " selected" } else { "" };
        html.push_str(&format!(
            "<option value=\"{t}\"{sel}>{t}</option>",
            t = html_escape(t)
        ));
    }
    html.push_str("</select></div>");
    html.push_str("<div><label>Status</label><select name=\"status\">");
    for (val, label) in &[("all", "All"), ("approved", "Approved"), ("draft", "Draft")] {
        let sel = if *val == status_filter {
            " selected"
        } else {
            ""
        };
        html.push_str(&format!("<option value=\"{val}\"{sel}>{label}</option>"));
    }
    html.push_str("</select></div>");
    html.push_str(&format!(
        "<div><label>Search</label><input type=\"text\" name=\"search\" placeholder=\"ID or title...\" value=\"{}\"></div>",
        html_escape(&search_filter)
    ));
    html.push_str("<div><label>&nbsp;</label><button type=\"submit\">Filter</button></div>");
    html.push_str("</form></div>");

    // ── Traceability matrix summary ──────────────────────────────────
    // Collect all link types that point TO the root type artifacts
    let mut link_types_set: Vec<String> = Vec::new();
    for id in &root_artifacts {
        let backlinks = graph.backlinks_to(id);
        for bl in backlinks {
            if !link_types_set.contains(&bl.link_type) {
                link_types_set.push(bl.link_type.clone());
            }
        }
    }
    link_types_set.sort();

    if !root_artifacts.is_empty() && !link_types_set.is_empty() {
        html.push_str("<div class=\"card\" style=\"overflow-x:auto\"><h3 style=\"margin-top:0\">Coverage Matrix</h3>");
        html.push_str("<table class=\"trace-matrix\"><thead><tr><th>Artifact</th><th>Title</th>");
        for lt in &link_types_set {
            html.push_str(&format!("<th>{}</th>", html_escape(lt)));
        }
        html.push_str("</tr></thead><tbody>");
        for id in &root_artifacts {
            let a = store.get(id).unwrap();
            let backlinks = graph.backlinks_to(id);
            html.push_str(&format!(
                "<tr><td><a hx-get=\"/artifacts/{}\" hx-target=\"#content\" hx-push-url=\"true\" href=\"#\">{}</a></td><td style=\"color:var(--text-secondary);font-size:.82rem\">{}</td>",
                html_escape(id),
                html_escape(id),
                html_escape(&a.title)
            ));
            for lt in &link_types_set {
                let count = backlinks.iter().filter(|bl| bl.link_type == *lt).count();
                let (cell_class, display) = if count > 0 {
                    ("trace-cell-ok", count.to_string())
                } else {
                    ("trace-cell-gap", "0".to_string())
                };
                html.push_str(&format!(
                    "<td><span class=\"trace-cell {cell_class}\">{display}</span></td>"
                ));
            }
            html.push_str("</tr>");
        }
        html.push_str("</tbody></table></div>");
    }

    // ── Traceability chain explorer ──────────────────────────────────
    html.push_str("<div class=\"card\"><h3 style=\"margin-top:0\">Linkage Chains</h3>");
    if root_artifacts.is_empty() {
        html.push_str(
            "<p style=\"color:var(--text-secondary)\">No artifacts match the current filters.</p>",
        );
    } else {
        html.push_str("<div class=\"trace-tree\">");
        for id in &root_artifacts {
            let a = store.get(id).unwrap();
            let children = build_trace_children(id, store, graph, 0, 3);
            let badge = badge_for_type(&a.artifact_type);
            let status = a.status.as_deref().unwrap_or("");
            let status_class = match status {
                "approved" => "trace-status-approved",
                "draft" => "trace-status-draft",
                _ => "",
            };
            let status_badge = if !status.is_empty() {
                format!(
                    "<span class=\"trace-status {status_class}\">{}</span>",
                    html_escape(status)
                )
            } else {
                String::new()
            };
            let source_path = a
                .source_file
                .as_ref()
                .map(|p| p.display().to_string())
                .unwrap_or_default();
            let safe_id = id.replace('.', "_");

            if children.is_empty() {
                html.push_str(&format!(
                    "<div class=\"trace-node\" style=\"font-weight:600\">{badge} \
                     <a hx-get=\"/artifacts/{id}\" hx-target=\"#content\" hx-push-url=\"true\" href=\"#\">{escaped_id}</a> \
                     <span style=\"color:var(--text-secondary)\">{title}</span>{status_badge} \
                     <span style=\"color:var(--text-secondary);font-size:.75rem;font-style:italic;margin-left:.5rem\">(no inbound links)</span>\
                     <button class=\"btn btn-secondary\" style=\"margin-left:auto;padding:.2rem .5rem;font-size:.68rem\" \
                     hx-get=\"/traceability/history?file={file}\" hx-target=\"#hist-{safe_id}\" hx-swap=\"innerHTML\"\
                     >History</button></div>\
                     <div id=\"hist-{safe_id}\"></div>",
                    id = html_escape(id),
                    escaped_id = html_escape(id),
                    title = html_escape(&a.title),
                    file = html_escape(&source_path),
                ));
            } else {
                let child_count = children.len();
                html.push_str(&format!(
                    "<details class=\"trace-details\" open>\
                     <summary style=\"font-weight:600\">{badge} \
                     <a hx-get=\"/artifacts/{id}\" hx-target=\"#content\" hx-push-url=\"true\" href=\"#\" \
                     onclick=\"event.stopPropagation()\">{escaped_id}</a> \
                     <span style=\"color:var(--text-secondary)\">{title}</span>{status_badge}\
                     <span style=\"color:var(--text-secondary);font-size:.75rem;margin-left:.25rem\">({child_count} inbound)</span>\
                     <span class=\"trace-chevron\"><svg width=\"12\" height=\"12\" viewBox=\"0 0 12 12\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M4 2l4 4-4 4\"/></svg></span>\
                     <button class=\"btn btn-secondary\" style=\"margin-left:auto;padding:.2rem .5rem;font-size:.68rem\" \
                     hx-get=\"/traceability/history?file={file}\" hx-target=\"#hist-{safe_id}\" hx-swap=\"innerHTML\" \
                     onclick=\"event.stopPropagation()\"\
                     >History</button></summary>\
                     <div id=\"hist-{safe_id}\"></div>\
                     <div class=\"trace-level\">",
                    id = html_escape(id),
                    escaped_id = html_escape(id),
                    title = html_escape(&a.title),
                    file = html_escape(&source_path),
                ));
                for child in &children {
                    html.push_str(&render_trace_node(
                        child,
                        1,
                        &source_path_for_artifact(store, &child.id),
                    ));
                }
                html.push_str("</div></details>");
            }
        }
        html.push_str("</div>");
    }
    html.push_str("</div>");

    Html(html)
}

/// Get source file path string for an artifact.
fn source_path_for_artifact(store: &Store, id: &str) -> String {
    store
        .get(id)
        .and_then(|a| a.source_file.as_ref())
        .map(|p| p.display().to_string())
        .unwrap_or_default()
}

/// HTMX endpoint: return git history for a specific file as HTML fragment.
pub(crate) async fn traceability_history(
    State(state): State<SharedState>,
    Query(params): Query<TraceHistoryParams>,
) -> Html<String> {
    let state = state.read().await;
    let pp = &state.project_path_buf;

    let file = match params.file {
        Some(ref f) if !f.is_empty() => f.clone(),
        _ => return Html("<div class=\"trace-history\"><span style=\"color:var(--text-secondary);font-size:.78rem\">No source file recorded</span></div>".to_string()),
    };

    // Make the path relative to the project directory for git log
    let file_path = std::path::Path::new(&file);
    let rel_path = file_path.strip_prefix(pp).unwrap_or(file_path);

    let output = std::process::Command::new("git")
        .args([
            "log",
            "--oneline",
            "--follow",
            "--format=%h|%as|%s",
            "-10",
            "--",
        ])
        .arg(rel_path)
        .current_dir(pp)
        .output();

    match output {
        Ok(o) if o.status.success() => {
            let stdout = String::from_utf8_lossy(&o.stdout);
            let lines: Vec<&str> = stdout.lines().filter(|l| !l.is_empty()).collect();
            if lines.is_empty() {
                return Html("<div class=\"trace-history\"><span style=\"color:var(--text-secondary);font-size:.78rem\">No git history found</span></div>".to_string());
            }
            let mut h = String::from("<div class=\"trace-history\"><div class=\"trace-history-title\">Git History</div>");
            for line in &lines {
                let parts: Vec<&str> = line.splitn(3, '|').collect();
                if parts.len() == 3 {
                    h.push_str(&format!(
                        "<div class=\"trace-history-item\">\
                         <code>{}</code>\
                         <span class=\"hist-date\">{}</span>\
                         <span class=\"hist-msg\">{}</span></div>",
                        html_escape(parts[0]),
                        html_escape(parts[1]),
                        html_escape(parts[2]),
                    ));
                }
            }
            h.push_str("</div>");
            Html(h)
        }
        _ => Html("<div class=\"trace-history\"><span style=\"color:var(--text-secondary);font-size:.78rem\">Git history unavailable</span></div>".to_string()),
    }
}

/// Build an `ArtifactInfo` for embedding from the store and link graph.
///
/// Handles the special `__type:{type}` convention used by the `{{table:TYPE:FIELDS}}`
/// embed: returns a synthetic `ArtifactInfo` whose `tags` list contains all artifact IDs
/// of the requested type.
fn build_artifact_info(
    id: &str,
    store: &rivet_core::store::Store,
    graph: &rivet_core::links::LinkGraph,
) -> Option<document::ArtifactInfo> {
    // Special convention for {{table:TYPE:FIELDS}} embed
    if let Some(art_type) = id.strip_prefix("__type:") {
        let ids: Vec<String> = store.by_type(art_type).to_vec();
        if ids.is_empty() {
            return None;
        }
        return Some(document::ArtifactInfo {
            id: format!("__type:{art_type}"),
            title: String::new(),
            art_type: art_type.to_string(),
            status: String::new(),
            description: String::new(),
            tags: ids,
            fields: Vec::new(),
            links: Vec::new(),
            backlinks: Vec::new(),
        });
    }

    let a = store.get(id)?;

    // Forward links
    let links: Vec<document::LinkInfo> = a
        .links
        .iter()
        .map(|link| {
            let (target_title, target_type) = store
                .get(&link.target)
                .map(|t| (t.title.clone(), t.artifact_type.clone()))
                .unwrap_or_default();
            document::LinkInfo {
                link_type: link.link_type.clone(),
                target_id: link.target.clone(),
                target_title,
                target_type,
            }
        })
        .collect();

    // Backlinks
    let backlinks: Vec<document::LinkInfo> = graph
        .backlinks_to(id)
        .iter()
        .map(|bl| {
            let (source_title, source_type) = store
                .get(&bl.source)
                .map(|s| (s.title.clone(), s.artifact_type.clone()))
                .unwrap_or_default();
            let display_type = bl
                .inverse_type
                .as_deref()
                .unwrap_or(&bl.link_type)
                .to_string();
            document::LinkInfo {
                link_type: display_type,
                target_id: bl.source.clone(),
                target_title: source_title,
                target_type: source_type,
            }
        })
        .collect();

    // Fields: convert BTreeMap<String, Value> to Vec<(String, String)>
    let fields: Vec<(String, String)> = a
        .fields
        .iter()
        .map(|(k, v)| {
            let display = match v {
                serde_yaml::Value::String(s) => s.clone(),
                serde_yaml::Value::Bool(b) => b.to_string(),
                serde_yaml::Value::Number(n) => n.to_string(),
                serde_yaml::Value::Null => String::new(),
                other => format!("{other:?}"),
            };
            (k.clone(), display)
        })
        .collect();

    Some(document::ArtifactInfo {
        id: a.id.clone(),
        title: a.title.clone(),
        art_type: a.artifact_type.clone(),
        status: a.status.clone().unwrap_or_default(),
        description: a.description.clone().unwrap_or_default(),
        tags: a.tags.clone(),
        fields,
        links,
        backlinks,
    })
}

// ── Helpers ──────────────────────────────────────────────────────────────

/// Rewrite relative image `src` paths to serve through `/docs-asset/`.
/// Leaves absolute URLs (http://, https://, //) unchanged.
fn rewrite_image_paths(html: &str) -> String {
    let mut result = String::with_capacity(html.len());
    let mut rest = html;
    while let Some(pos) = rest.find("src=\"") {
        result.push_str(&rest[..pos]);
        let after_src = &rest[pos + 5..]; // after src="
        if let Some(end) = after_src.find('"') {
            let path = &after_src[..end];
            result.push_str("src=\"");
            if path.starts_with("http://")
                || path.starts_with("https://")
                || path.starts_with("//")
                || path.starts_with('/')
            {
                result.push_str(path);
            } else {
                result.push_str("/docs-asset/");
                result.push_str(path);
            }
            result.push('"');
            rest = &after_src[end + 1..];
        } else {
            result.push_str("src=\"");
            rest = after_src;
        }
    }
    result.push_str(rest);
    result
}

/// Turn `path/to/file.rs:42` patterns into clickable `/source/path/to/file.rs#L42` links.
/// Also handles ranges like `file.rs:10-20` and plain `path/to/file.rs` (no line).
fn linkify_source_refs(s: &str) -> String {
    // Regex-free: scan for patterns like word/word.ext:digits or word/word.ext:digits-digits
    let mut result = String::new();
    let src = s;
    let mut pos = 0usize;

    while pos < src.len() {
        // Look for file-like patterns: contains '/' or '.' and optionally ':digits'
        if let Some(m) = find_source_ref(&src[pos..]) {
            result.push_str(&src[pos..pos + m.start]);
            let file_path = &m.file;
            let encoded_path = urlencoding::encode(file_path);
            if let Some(line) = m.line {
                if let Some(end_line) = m.end_line {
                    result.push_str(&format!(
                        "<a class=\"source-ref-link\" hx-get=\"/source/{encoded_path}\" hx-target=\"#content\" hx-push-url=\"true\" href=\"#\" onclick=\"setTimeout(function(){{var e=document.getElementById('L{line}');if(e)e.scrollIntoView({{behavior:'smooth',block:'center'}})}},200)\">{file_path}:{line}-{end_line}</a>"
                    ));
                } else {
                    result.push_str(&format!(
                        "<a class=\"source-ref-link\" hx-get=\"/source/{encoded_path}\" hx-target=\"#content\" hx-push-url=\"true\" href=\"#\" onclick=\"setTimeout(function(){{var e=document.getElementById('L{line}');if(e)e.scrollIntoView({{behavior:'smooth',block:'center'}})}},200)\">{file_path}:{line}</a>"
                    ));
                }
            } else {
                result.push_str(&format!(
                    "<a class=\"source-ref-link\" hx-get=\"/source/{encoded_path}\" hx-target=\"#content\" hx-push-url=\"true\" href=\"#\">{file_path}</a>"
                ));
            }
            pos += m.start + m.len;
        } else {
            result.push_str(&src[pos..]);
            break;
        }
    }
    result
}

struct SourceRefMatch {
    start: usize,
    len: usize,
    file: String,
    line: Option<u32>,
    end_line: Option<u32>,
}

/// Find the next source-ref pattern in text: `some/path.ext:line` or `some/path.ext:line-line`
/// File must contain a `/` or `.` with a recognized extension.
fn find_source_ref(s: &str) -> Option<SourceRefMatch> {
    let extensions = [
        ".rs", ".yaml", ".yml", ".toml", ".md", ".py", ".js", ".ts", ".tsx", ".jsx", ".c", ".h",
        ".cpp", ".hpp", ".go", ".java", ".rb", ".sh", ".json", ".xml", ".aadl",
    ];
    let len = s.len();
    let mut i = 0;
    while i < len {
        // Try to match a file path starting at position i
        // A file path: sequence of [a-zA-Z0-9_/.\-] containing at least one '/' and ending with a known extension
        let start = i;
        let mut j = i;
        let mut has_slash = false;
        let mut has_ext = false;
        while j < len {
            let c = s.as_bytes()[j];
            if c.is_ascii_alphanumeric() || c == b'_' || c == b'/' || c == b'.' || c == b'-' {
                if c == b'/' {
                    has_slash = true;
                }
                j += 1;
            } else {
                break;
            }
        }
        if has_slash && j > start + 2 {
            let candidate = &s[start..j];
            // Check if it ends with a known extension
            for ext in &extensions {
                if candidate.ends_with(ext) {
                    has_ext = true;
                    break;
                }
            }
            if has_ext {
                let file = candidate.to_string();
                // Check for :line or :line-line
                if j < len && s.as_bytes()[j] == b':' {
                    let _colon_pos = j;
                    j += 1;
                    let line_start = j;
                    while j < len && s.as_bytes()[j].is_ascii_digit() {
                        j += 1;
                    }
                    if j > line_start {
                        let line: u32 = s[line_start..j].parse().unwrap_or(0);
                        if line > 0 {
                            // Check for range: -digits
                            if j < len && s.as_bytes()[j] == b'-' {
                                let dash = j;
                                j += 1;
                                let end_start = j;
                                while j < len && s.as_bytes()[j].is_ascii_digit() {
                                    j += 1;
                                }
                                if j > end_start {
                                    let end_line: u32 = s[end_start..j].parse().unwrap_or(0);
                                    if end_line > 0 {
                                        return Some(SourceRefMatch {
                                            start,
                                            len: j - start,
                                            file,
                                            line: Some(line),
                                            end_line: Some(end_line),
                                        });
                                    }
                                }
                                // Not a valid range, just use line
                                return Some(SourceRefMatch {
                                    start,
                                    len: dash - start,
                                    file,
                                    line: Some(line),
                                    end_line: None,
                                });
                            }
                            return Some(SourceRefMatch {
                                start,
                                len: j - start,
                                file,
                                line: Some(line),
                                end_line: None,
                            });
                        }
                    }
                }
                // No line number, just file path
                return Some(SourceRefMatch {
                    start,
                    len: j - start,
                    file,
                    line: None,
                    end_line: None,
                });
            }
        }
        i += 1;
    }
    None
}

// ── Help / Docs / Schema dashboard views ───────────────────────────────

pub(crate) async fn help_view(State(state): State<SharedState>) -> Html<String> {
    let state = state.read().await;
    let schema = &state.schema;

    // Count things for the overview
    let type_count = schema.artifact_types.len();
    let link_count = schema.link_types.len();
    let rule_count = schema.traceability_rules.len();

    let mut html = String::with_capacity(4096);
    html.push_str("<h2>Help &amp; Documentation</h2>");

    // Quick-links cards
    html.push_str(r#"<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem;margin:1.5rem 0">"#);

    let link_style = "display:inline-block;margin-top:.75rem;font-size:.85rem";
    html.push_str(&format!(
        "<div class=\"card\" style=\"padding:1.25rem\">\
        <h3 style=\"margin:0 0 .5rem\">Schema Types</h3>\
        <p style=\"font-size:2rem;font-weight:700;margin:.25rem 0\">{type_count}</p>\
        <p style=\"font-size:.85rem;opacity:.7\">artifact types loaded</p>\
        <a hx-get=\"/help/schema\" hx-target=\"#content\" hx-push-url=\"true\" href=\"#\" \
           style=\"{link_style}\">Browse types &rarr;</a>\
        </div>"
    ));

    html.push_str(&format!(
        "<div class=\"card\" style=\"padding:1.25rem\">\
        <h3 style=\"margin:0 0 .5rem\">Link Types</h3>\
        <p style=\"font-size:2rem;font-weight:700;margin:.25rem 0\">{link_count}</p>\
        <p style=\"font-size:.85rem;opacity:.7\">with inverse mappings</p>\
        <a hx-get=\"/help/links\" hx-target=\"#content\" hx-push-url=\"true\" href=\"#\" \
           style=\"{link_style}\">View links &rarr;</a>\
        </div>"
    ));

    html.push_str(&format!(
        "<div class=\"card\" style=\"padding:1.25rem\">\
        <h3 style=\"margin:0 0 .5rem\">Traceability Rules</h3>\
        <p style=\"font-size:2rem;font-weight:700;margin:.25rem 0\">{rule_count}</p>\
        <p style=\"font-size:.85rem;opacity:.7\">enforced by validation</p>\
        <a hx-get=\"/help/rules\" hx-target=\"#content\" hx-push-url=\"true\" href=\"#\" \
           style=\"{link_style}\">View rules &rarr;</a>\
        </div>"
    ));

    html.push_str(&format!(
        "<div class=\"card\" style=\"padding:1.25rem\">\
        <h3 style=\"margin:0 0 .5rem\">Documentation</h3>\
        <p style=\"font-size:.85rem;opacity:.7;margin:.5rem 0\">Built-in guides, references, and schema docs — searchable.</p>\
        <a hx-get=\"/help/docs\" hx-target=\"#content\" hx-push-url=\"true\" href=\"#\" \
           style=\"{link_style}\">Browse topics &rarr;</a>\
        </div>"
    ));

    html.push_str("</div>");

    // CLI quick reference
    html.push_str(
        r#"<div class="card" style="padding:1.25rem;margin-top:1rem">
        <h3 style="margin:0 0 1rem">CLI Quick Reference</h3>
        <pre style="font-size:.82rem;line-height:1.6;opacity:.85">"#,
    );
    html.push_str("rivet validate              Validate all artifacts\n");
    html.push_str("rivet list [-t TYPE]        List artifacts\n");
    html.push_str("rivet stats                 Summary statistics\n");
    html.push_str("rivet coverage              Traceability coverage\n");
    html.push_str("rivet matrix --from X --to Y  Traceability matrix\n");
    html.push_str("rivet schema list           List artifact types\n");
    html.push_str("rivet schema show TYPE      Show type details\n");
    html.push_str("rivet docs                  List documentation topics\n");
    html.push_str("rivet docs --grep PATTERN   Search docs\n");
    html.push_str("rivet context               Generate agent context\n");
    html.push_str("rivet serve [-P PORT]       Start dashboard\n");
    html.push_str("</pre></div>");

    Html(html)
}

pub(crate) async fn help_docs_list(State(_state): State<SharedState>) -> Html<String> {
    let raw = docs::list_topics("text");

    let mut html = String::with_capacity(4096);
    html.push_str(r#"<h2>Documentation Topics</h2>"#);
    html.push_str(r#"<p style="opacity:.7;margin-bottom:1rem">Built-in reference docs. Click a topic to read, or use <code>rivet docs --grep PATTERN</code> on the CLI.</p>"#);

    // Parse the topic list and render as cards
    html.push_str(r#"<div style="display:flex;flex-direction:column;gap:.5rem">"#);

    let topics_json = docs::list_topics("json");
    if let Ok(val) = serde_json::from_str::<serde_json::Value>(&topics_json) {
        let mut current_cat = String::new();
        if let Some(topics) = val.get("topics").and_then(|t| t.as_array()) {
            for topic in topics {
                let slug = topic.get("slug").and_then(|s| s.as_str()).unwrap_or("");
                let title = topic.get("title").and_then(|s| s.as_str()).unwrap_or("");
                let category = topic.get("category").and_then(|s| s.as_str()).unwrap_or("");

                if category != current_cat {
                    if !current_cat.is_empty() {
                        html.push_str("</div>");
                    }
                    html.push_str(&format!(
                        r#"<h3 style="margin:1rem 0 .5rem;font-size:.9rem;text-transform:uppercase;letter-spacing:.05em;opacity:.5">{category}</h3>"#
                    ));
                    html.push_str(r#"<div style="display:flex;flex-direction:column;gap:.25rem">"#);
                    current_cat = category.to_string();
                }

                html.push_str(&format!(
                    "<a hx-get=\"/help/docs/{slug}\" hx-target=\"#content\" hx-push-url=\"true\" href=\"#\" \
                       class=\"card\" style=\"padding:.75rem 1rem;display:flex;align-items:center;gap:1rem;text-decoration:none\">\
                       <code style=\"font-size:.82rem;min-width:10rem\">{slug}</code>\
                       <span style=\"font-size:.85rem\">{title}</span>\
                    </a>"
                ));
            }
            if !current_cat.is_empty() {
                html.push_str("</div>");
            }
        }
    } else {
        // Fallback: render raw text
        html.push_str(&format!("<pre>{}</pre>", html_escape(&raw)));
    }

    html.push_str("</div>");
    Html(html)
}

pub(crate) async fn help_docs_topic(
    State(_state): State<SharedState>,
    Path(slug): Path<String>,
) -> Html<String> {
    let raw = docs::show_topic(&slug, "text");

    let mut html = String::with_capacity(8192);
    html.push_str("<div style=\"margin-bottom:1rem\"><a hx-get=\"/help/docs\" hx-target=\"#content\" hx-push-url=\"true\" href=\"#\" style=\"font-size:.85rem\">&larr; All topics</a></div>");
    html.push_str("<div class=\"card\" style=\"padding:1.5rem\">");

    // Render the markdown-ish content as HTML
    let mut in_code_block = false;
    let mut code_lang = String::new();
    let mut in_table = false;
    for line in raw.lines() {
        if line.starts_with("```") {
            if in_code_block {
                html.push_str("</pre>");
                in_code_block = false;
                code_lang.clear();
            } else {
                let lang = line.trim_start_matches('`').trim();
                code_lang = lang.to_string();
                html.push_str(r#"<pre style="background:var(--bg);padding:1rem;border-radius:var(--radius-sm);font-size:.82rem;overflow-x:auto;margin:.75rem 0">"#);
                in_code_block = true;
            }
            continue;
        }
        if in_code_block {
            let lang = match code_lang.as_str() {
                "yaml" | "yml" => "yaml",
                "bash" | "sh" | "shell" => "bash",
                _ => "",
            };
            if !lang.is_empty() {
                html.push_str(&syntax_highlight_line(line, lang));
            } else {
                html.push_str(&html_escape(line));
            }
            html.push('\n');
            continue;
        }
        if let Some(h1) = line.strip_prefix("# ") {
            html.push_str(&format!("<h2>{}</h2>", html_escape(h1)));
        } else if let Some(h2) = line.strip_prefix("## ") {
            html.push_str(&format!(
                "<h3 style=\"margin-top:1.5rem\">{}</h3>",
                html_escape(h2)
            ));
        } else if let Some(h3) = line.strip_prefix("### ") {
            html.push_str(&format!(
                "<h4 style=\"margin-top:1rem\">{}</h4>",
                html_escape(h3)
            ));
        } else if line.starts_with('|') {
            if !in_table {
                html.push_str(r#"<div style="overflow-x:auto;margin:.75rem 0"><table>"#);
                in_table = true;
            }
            if line.contains("---") && !line.contains(' ')
                || line.chars().all(|c| c == '|' || c == '-' || c == ' ')
            {
                // Skip separator rows
            } else {
                html.push_str("<tr>");
                let cells: Vec<&str> = line.split('|').collect();
                for cell in &cells[1..cells.len().saturating_sub(1)] {
                    html.push_str(&format!(
                        "<td style=\"padding:.25rem .75rem\">{}</td>",
                        html_escape(cell.trim())
                    ));
                }
                html.push_str("</tr>");
            }
        } else {
            if in_table {
                html.push_str("</table></div>");
                in_table = false;
            }
            if line.is_empty() {
                html.push_str("<br>");
            } else {
                html.push_str(&format!(
                    "<p style=\"margin:.25rem 0;font-size:.88rem;line-height:1.6\">{}</p>",
                    html_escape(line)
                ));
            }
        }
    }
    if in_table {
        html.push_str("</table></div>");
    }
    if in_code_block {
        html.push_str("</pre>");
    }

    html.push_str("</div>");
    Html(html)
}

pub(crate) async fn help_schema_list(State(state): State<SharedState>) -> Html<String> {
    let state = state.read().await;
    let schema = &state.schema;

    let mut types: Vec<_> = schema.artifact_types.values().collect();
    types.sort_by_key(|t| &t.name);

    let mut html = String::with_capacity(4096);
    html.push_str("<h2>Schema Types</h2>");
    html.push_str(r#"<p style="opacity:.7;margin-bottom:1rem">Click a type to see fields, link fields, traceability rules, and example YAML.</p>"#);

    html.push_str(
        r#"<table><thead><tr>
        <th>Type</th><th>Description</th><th>Fields</th><th>Links</th><th>Process</th>
    </tr></thead><tbody>"#,
    );

    for t in &types {
        let proc = t.aspice_process.as_deref().unwrap_or("-");
        html.push_str(&format!(
            "<tr style=\"cursor:pointer\" hx-get=\"/help/schema/{name}\" hx-target=\"#content\" hx-push-url=\"true\">\
            <td><code>{name}</code></td>\
            <td>{desc}</td>\
            <td style=\"text-align:center\">{fields}</td>\
            <td style=\"text-align:center\">{links}</td>\
            <td>{proc}</td>\
            </tr>",
            name = t.name,
            desc = render_markdown(&t.description),
            fields = t.fields.len(),
            links = t.link_fields.len(),
            proc = proc,
        ));
    }

    html.push_str("</tbody></table>");
    Html(html)
}

pub(crate) async fn help_schema_show(
    State(state): State<SharedState>,
    Path(name): Path<String>,
) -> Html<String> {
    let state = state.read().await;
    let raw = schema_cmd::cmd_show(&state.schema, &name, "text");

    let mut html = String::with_capacity(8192);
    html.push_str("<div style=\"margin-bottom:1rem\"><a hx-get=\"/help/schema\" hx-target=\"#content\" hx-push-url=\"true\" href=\"#\" style=\"font-size:.85rem\">&larr; All types</a></div>");

    // Render the output as structured HTML
    html.push_str("<div class=\"card\" style=\"padding:1.5rem\"><pre style=\"font-size:.82rem;line-height:1.6;white-space:pre-wrap\">");
    html.push_str(&html_escape(&raw));
    html.push_str("</pre></div>");

    Html(html)
}

pub(crate) async fn help_links_view(State(state): State<SharedState>) -> Html<String> {
    let state = state.read().await;
    let schema = &state.schema;

    let mut links: Vec<_> = schema.link_types.values().collect();
    links.sort_by_key(|l| &l.name);

    let mut html = String::with_capacity(4096);
    html.push_str("<div style=\"margin-bottom:1rem\"><a hx-get=\"/help\" hx-target=\"#content\" hx-push-url=\"true\" href=\"#\" style=\"font-size:.85rem\">&larr; Help</a></div>");
    html.push_str("<h2>Link Types</h2>");

    html.push_str(
        "<table><thead><tr>\
        <th>Name</th><th>Inverse</th><th>Description</th>\
    </tr></thead><tbody>",
    );

    for l in &links {
        let inv = l.inverse.as_deref().unwrap_or("-");
        html.push_str(&format!(
            "<tr><td><code>{}</code></td><td><code>{}</code></td><td>{}</td></tr>",
            html_escape(&l.name),
            html_escape(inv),
            render_markdown(&l.description),
        ));
    }

    html.push_str("</tbody></table>");
    Html(html)
}

pub(crate) async fn help_rules_view(State(state): State<SharedState>) -> Html<String> {
    let state = state.read().await;
    let raw = schema_cmd::cmd_rules(&state.schema, "text");

    let mut html = String::with_capacity(4096);
    html.push_str("<div style=\"margin-bottom:1rem\"><a hx-get=\"/help\" hx-target=\"#content\" hx-push-url=\"true\" href=\"#\" style=\"font-size:.85rem\">&larr; Help</a></div>");
    html.push_str("<h2>Traceability Rules</h2>");
    html.push_str("<div class=\"card\" style=\"padding:1.5rem\"><pre style=\"font-size:.82rem;line-height:1.6;white-space:pre-wrap\">");
    html.push_str(&html_escape(&raw));
    html.push_str("</pre></div>");
    Html(html)
}
