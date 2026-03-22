use std::collections::BTreeMap;

use rivet_core::coverage;
use rivet_core::document::html_escape;
use rivet_core::schema::Severity;

use crate::render::RenderContext;
use crate::render::helpers::badge_for_type;

pub(crate) fn render_stats(ctx: &RenderContext) -> String {
    let store = ctx.store;
    let graph = ctx.graph;
    let doc_store = ctx.doc_store;

    let mut types: Vec<&str> = store.types().collect();
    types.sort();

    let orphans = graph.orphans(store);
    let diagnostics = ctx.diagnostics;
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
        html_escape(&ctx.context.project_name),
        types.len(),
        ctx.schema.traceability_rules.len(),
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
                "<tr><td><a hx-get=\"/artifacts/{id}\" hx-target=\"#content\" hx-push-url=\"true\" href=\"/artifacts/{id}\">{id}</a></td></tr>"
            ));
        }
        html.push_str("</tbody></table></div>");
    }

    // ── Coverage summary card ────────────────────────────────────────
    let cov_report = coverage::compute_coverage(store, ctx.schema, graph);
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
             <a href=\"/coverage\" hx-get=\"/coverage\" hx-target=\"#content\" hx-push-url=\"true\" \
                style=\"font-size:.85rem;color:var(--accent);text-decoration:none\">\
                View full coverage report &rarr;</a>\
             </div>",
            cov_report.entries.len(),
        ));
    }

    // ── Test results summary ─────────────────────────────────────────
    if !ctx.result_store.is_empty() {
        let summary = ctx.result_store.summary();
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
            "<a href=\"/results\" hx-get=\"/results\" hx-target=\"#content\" hx-push-url=\"true\" \
             style=\"font-size:.85rem;color:var(--accent);text-decoration:none\">\
             View all test runs &rarr;</a>",
        );
        html.push_str("</div>");
    }

    // ── Quick links ──────────────────────────────────────────────────
    // Count verifiable types for the verification link badge
    let ver_count = {
        let mut count = 0usize;
        for rule in &ctx.schema.traceability_rules {
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
        "<a href=\"/verification\" hx-get=\"/verification\" hx-target=\"#content\" hx-push-url=\"true\" \
         style=\"display:block;padding:1rem;background:var(--surface);border:1px solid var(--border);\
         border-radius:var(--radius-sm);text-decoration:none;color:var(--text)\">\
         <div style=\"font-weight:600;margin-bottom:.25rem\">Verification</div>\
         <div style=\"font-size:.85rem;color:var(--text-secondary)\">{ver_count} requirements</div>\
         </a>",
    ));
    html.push_str(&format!(
        "<a href=\"/documents\" hx-get=\"/documents\" hx-target=\"#content\" hx-push-url=\"true\" \
         style=\"display:block;padding:1rem;background:var(--surface);border:1px solid var(--border);\
         border-radius:var(--radius-sm);text-decoration:none;color:var(--text)\">\
         <div style=\"font-weight:600;margin-bottom:.25rem\">Documents</div>\
         <div style=\"font-size:.85rem;color:var(--text-secondary)\">{} loaded</div>\
         </a>",
        doc_store.len(),
    ));
    html.push_str(
        "<a href=\"/graph\" hx-get=\"/graph\" hx-target=\"#content\" hx-push-url=\"true\" \
         style=\"display:block;padding:1rem;background:var(--surface);border:1px solid var(--border);\
         border-radius:var(--radius-sm);text-decoration:none;color:var(--text)\">\
         <div style=\"font-weight:600;margin-bottom:.25rem\">Traceability Graph</div>\
         <div style=\"font-size:.85rem;color:var(--text-secondary)\">Full link graph</div>\
         </a>",
    );
    html.push_str("</div></div>");

    html
}
