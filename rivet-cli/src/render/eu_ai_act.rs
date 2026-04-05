use std::fmt::Write as _;

use rivet_core::compliance;
use rivet_core::document::html_escape;

use super::RenderContext;
use super::helpers::badge_for_type;

pub(crate) fn render_eu_ai_act(ctx: &RenderContext) -> String {
    let report = compliance::compute_compliance(ctx.store, ctx.schema);

    if !report.schema_loaded {
        return "<h2>EU AI Act Compliance</h2>\
                <div class=\"card\">\
                <p>The EU AI Act schema is not loaded for this project.</p>\
                <p style=\"color:var(--text-secondary);font-size:.9rem;margin-top:.5rem\">\
                Add <code>eu-ai-act</code> to your <code>rivet.yaml</code> schemas list to enable \
                the EU AI Act compliance dashboard.</p>\
                <pre style=\"margin-top:.75rem;padding:.75rem;background:var(--bg-inset);border-radius:6px;font-size:.85rem\">\
project:\n  name: my-project\n  schemas: [eu-ai-act]</pre>\
                </div>"
            .to_string();
    }

    let mut html = String::from("<h2>EU AI Act Compliance</h2>");

    // ── Overall stats ──────────────────────────────────────────────
    let overall_color = pct_color(report.overall_pct);
    html.push_str("<div class=\"stat-grid\">");
    let _ = write!(
        html,
        "<div class=\"stat-box\">\
         <div class=\"number\" style=\"color:{overall_color}\">{:.1}%</div>\
         <div class=\"label\">Overall Compliance</div></div>",
        report.overall_pct
    );
    let _ = write!(
        html,
        "<div class=\"stat-box\"><div class=\"number\">{}</div>\
         <div class=\"label\">Annex IV Sections</div></div>",
        report.sections.len()
    );
    let complete = report
        .sections
        .iter()
        .filter(|s| s.coverage_pct >= 100.0)
        .count();
    let _ = write!(
        html,
        "<div class=\"stat-box\"><div class=\"number\" style=\"color:#15713a\">{complete}</div>\
         <div class=\"label\">Complete Sections</div></div>"
    );
    let _ = write!(
        html,
        "<div class=\"stat-box\"><div class=\"number\">{}</div>\
         <div class=\"label\">Total Artifacts</div></div>",
        report.total_artifacts
    );
    html.push_str("</div>");

    // ── Compliance by section table ─────────────────────────────────
    html.push_str("<div class=\"card\"><h3>Compliance by Annex IV Section</h3>");
    html.push_str(
        "<table><thead><tr>\
         <th>Section</th>\
         <th>Reference</th>\
         <th>Required Types</th>\
         <th>Status</th>\
         <th style=\"width:25%\">Progress</th>\
         </tr></thead><tbody>",
    );

    for section in &report.sections {
        let pct = section.coverage_pct;
        let bar_color = pct_color(pct);
        let badge_class = pct_badge_class(pct);

        // Format required types as badges
        let types_html: String = section
            .required_types
            .iter()
            .map(|t| badge_for_type(t))
            .collect::<Vec<_>>()
            .join(" ");

        let status_text = format!(
            "{}/{}",
            section.covered_types.len(),
            section.required_types.len()
        );

        let _ = write!(
            html,
            "<tr>\
             <td><strong>{title}</strong></td>\
             <td><span class=\"meta\">{reference}</span></td>\
             <td>{types_html}</td>\
             <td><span class=\"badge {badge_class}\">{status_text} ({pct:.0}%)</span></td>\
             <td>\
               <div style=\"background:#e5e5ea;border-radius:4px;height:18px;position:relative;overflow:hidden\">\
                 <div style=\"background:{bar_color};height:100%;width:{pct:.1}%;border-radius:4px;transition:width .3s ease\"></div>\
               </div>\
             </td>\
             </tr>",
            title = html_escape(&section.title),
            reference = html_escape(&section.reference),
        );
    }

    html.push_str("</tbody></table></div>");

    // ── Missing artifact types ──────────────────────────────────────
    let has_missing = report.sections.iter().any(|s| !s.missing_types.is_empty());
    if has_missing {
        html.push_str("<div class=\"card\"><h3>Missing Artifact Types</h3>");
        html.push_str(
            "<p style=\"color:var(--text-secondary);font-size:.9rem;margin-bottom:1rem\">\
             The following artifact types have no instances yet. \
             Create artifacts of these types to improve compliance.</p>",
        );
        html.push_str(
            "<table><thead><tr>\
             <th>Section</th>\
             <th>Missing Type</th>\
             <th>Description</th>\
             </tr></thead><tbody>",
        );

        for section in &report.sections {
            for missing in &section.missing_types {
                let desc = ctx
                    .schema
                    .artifact_types
                    .get(missing.as_str())
                    .map(|t| t.description.as_str())
                    .unwrap_or("-");

                let _ = write!(
                    html,
                    "<tr>\
                     <td>{title}</td>\
                     <td>{badge}</td>\
                     <td style=\"font-size:.9rem;color:var(--text-secondary)\">{desc}</td>\
                     </tr>",
                    title = html_escape(&section.title),
                    badge = badge_for_type(missing),
                    desc = html_escape(desc),
                );
            }
        }

        html.push_str("</tbody></table></div>");
    }

    // ── Artifact inventory per type ─────────────────────────────────
    let has_artifacts = report.total_artifacts > 0;
    if has_artifacts {
        html.push_str("<div class=\"card\"><h3>EU AI Act Artifact Inventory</h3>");
        html.push_str(
            "<table><thead><tr>\
             <th>Type</th>\
             <th>Count</th>\
             <th>Artifacts</th>\
             </tr></thead><tbody>",
        );

        for typ in compliance::EU_AI_ACT_TYPES {
            let count = ctx.store.count_by_type(typ);
            if count == 0 {
                continue;
            }

            let ids: Vec<String> = ctx
                .store
                .by_type(typ)
                .iter()
                .map(|id| {
                    let title = ctx.store.get(id).map(|a| a.title.as_str()).unwrap_or("-");
                    format!(
                        "<a hx-get=\"/artifacts/{id_esc}\" hx-target=\"#content\" \
                         hx-push-url=\"true\" href=\"/artifacts/{id_esc}\" \
                         title=\"{title_esc}\">{id_esc}</a>",
                        id_esc = html_escape(id),
                        title_esc = html_escape(title),
                    )
                })
                .collect();

            let _ = write!(
                html,
                "<tr>\
                 <td>{badge}</td>\
                 <td>{count}</td>\
                 <td>{ids}</td>\
                 </tr>",
                badge = badge_for_type(typ),
                ids = ids.join(", "),
            );
        }

        html.push_str("</tbody></table></div>");
    }

    html
}

fn pct_color(pct: f64) -> &'static str {
    if pct >= 100.0 {
        "#15713a"
    } else if pct >= 50.0 {
        "#8b6914"
    } else {
        "#c62828"
    }
}

fn pct_badge_class(pct: f64) -> &'static str {
    if pct >= 100.0 {
        "badge-ok"
    } else if pct >= 50.0 {
        "badge-warn"
    } else {
        "badge-error"
    }
}
