use rivet_core::document::html_escape;
use rivet_core::schema::Severity;

use super::RenderContext;
use crate::serve::components::{self, ViewParams};

pub(crate) fn render_validate(ctx: &RenderContext, params: &ViewParams) -> String {
    let diagnostics = ctx.diagnostics;

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
        return html;
    }

    // Filter bar (severity + text search)
    let current_status = params.status.as_deref().unwrap_or("all");
    let current_query = params.q.as_deref().unwrap_or("");
    html.push_str(&components::validation_filter_bar(
        errors,
        warnings,
        infos,
        current_status,
        current_query,
    ));

    // Apply severity filter and sort: errors first, then warnings, then info.
    // We work from the cached (immutable) diagnostics, so sorting is done via
    // the filtered+collected vec below rather than mutating in place.
    let severity_filter = match current_status {
        "error" => Some(Severity::Error),
        "warning" => Some(Severity::Warning),
        "info" => Some(Severity::Info),
        _ => None,
    };
    let q_filter: Option<String> = if current_query.is_empty() {
        None
    } else {
        Some(current_query.to_lowercase())
    };

    let mut filtered: Vec<_> = diagnostics
        .iter()
        .filter(|d| {
            if let Some(ref sev) = severity_filter {
                if d.severity != *sev {
                    return false;
                }
            }
            if let Some(ref q) = q_filter {
                let art_match = d
                    .artifact_id
                    .as_deref()
                    .map(|id| id.to_lowercase().contains(q))
                    .unwrap_or(false);
                let rule_match = d.rule.to_lowercase().contains(q);
                let msg_match = d.message.to_lowercase().contains(q);
                if !art_match && !rule_match && !msg_match {
                    return false;
                }
            }
            true
        })
        .collect();

    // Sort: errors first, then warnings, then info
    filtered.sort_by_key(|d| match d.severity {
        Severity::Error => 0,
        Severity::Warning => 1,
        Severity::Info => 2,
    });

    let filtered_count = filtered.len();
    if filtered_count == 0 {
        html.push_str("<div class=\"card\"><p>No matching issues found.</p></div>");
        return html;
    }

    // Paginate
    let per_page = params.items_per_page();
    let total_pages = filtered_count.div_ceil(per_page);
    let page = params.current_page().min(total_pages);
    let start = (page - 1) * per_page;
    let page_items = &filtered[start..filtered_count.min(start + per_page)];

    html.push_str(
        "<table><thead><tr><th>Severity</th><th>Artifact</th><th>Rule</th><th>Message</th></tr></thead><tbody>",
    );

    for d in page_items {
        let sev = match d.severity {
            Severity::Error => "<span class=\"badge badge-error\">ERROR</span>",
            Severity::Warning => "<span class=\"badge badge-warn\">WARN</span>",
            Severity::Info => "<span class=\"badge badge-info\">INFO</span>",
        };
        let art_id = d.artifact_id.as_deref().unwrap_or("-");
        let art_link = if d.artifact_id.is_some() && ctx.store.contains(art_id) {
            format!(
                "<a hx-get=\"/artifacts/{art}\" hx-target=\"#content\" hx-push-url=\"true\" href=\"/artifacts/{art}\">{art}</a>",
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

    // Summary + pagination
    if filtered_count < total_issues {
        html.push_str(&format!(
            "<p class=\"meta\">{filtered_count} matching issues of {total_issues} total</p>",
        ));
    }
    html.push_str(&components::pagination(
        filtered_count,
        page,
        per_page,
        "/validate",
        params,
    ));

    html
}
