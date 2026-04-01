use std::fmt::Write as _;

use rivet_core::coverage;
use rivet_core::document::html_escape;

use super::RenderContext;
use super::helpers::badge_for_type;

pub(crate) fn render_coverage_view(ctx: &RenderContext) -> String {
    let report = coverage::compute_coverage(ctx.store, ctx.schema, ctx.graph);
    let overall = report.overall_coverage();

    let mut html = String::from("<h2>Traceability Coverage</h2>");

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
        return html;
    }

    let bl = ctx.baseline;
    let has_delta = bl.is_some();

    html.push_str("<div class=\"card\"><h3>Coverage by Rule</h3>");
    if has_delta {
        html.push_str("<table><thead><tr><th>Rule</th><th>Source Type</th><th>Link</th><th>Direction</th><th>Coverage</th><th>Δ</th><th style=\"width:25%\">Progress</th></tr></thead><tbody>");
    } else {
        html.push_str("<table><thead><tr><th>Rule</th><th>Source Type</th><th>Link</th><th>Direction</th><th>Coverage</th><th style=\"width:30%\">Progress</th></tr></thead><tbody>");
    }

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

        let delta_cell = if has_delta {
            let base_pct = bl
                .and_then(|s| s.coverage.rules.iter().find(|r| r.rule == entry.rule_name))
                .map_or(0.0, |r| r.percentage);
            let diff = pct - base_pct;
            if diff.abs() < 0.05 {
                "<td>—</td>".to_string()
            } else {
                let (sign, color) = if diff > 0.0 {
                    ("+", "#15713a")
                } else {
                    ("", "#c62828")
                };
                format!("<td style=\"color:{color};font-weight:600\">{sign}{diff:.1}%</td>")
            }
        } else {
            String::new()
        };

        let _ = write!(
            html,
            "<tr>\
             <td title=\"{desc}\">{name}</td>\
             <td>{source}</td>\
             <td><span class=\"link-pill\">{link}</span></td>\
             <td>{dir}</td>\
             <td><span class=\"badge {badge_class}\">{covered}/{total} ({pct:.1}%)</span></td>\
             {delta_cell}\
             <td>\
               <div style=\"background:#e5e5ea;border-radius:4px;height:18px;position:relative;overflow:hidden\">\
                 <div style=\"background:{bar_color};height:100%;width:{pct:.1}%;border-radius:4px;transition:width .3s ease\"></div>\
               </div>\
             </td>\
             </tr>",
            desc = html_escape(&entry.description),
            name = html_escape(&entry.rule_name),
            source = badge_for_type(&entry.source_type),
            link = html_escape(&entry.link_type),
            dir = dir_label,
            covered = entry.covered,
            total = entry.total,
        );
    }

    html.push_str("</tbody></table></div>");

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
                let title = ctx.store.get(id).map(|a| a.title.as_str()).unwrap_or("-");
                html.push_str(&format!(
                    "<tr><td><a hx-get=\"/artifacts/{id_esc}\" hx-target=\"#content\" hx-push-url=\"true\" href=\"/artifacts/{id_esc}\">{id_esc}</a></td>\
                     <td>{title_esc}</td></tr>",
                    id_esc = html_escape(id),
                    title_esc = html_escape(title),
                ));
            }
            html.push_str("</tbody></table>");
        }

        html.push_str("</div>");
    }

    html
}
