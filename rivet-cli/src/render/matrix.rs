use rivet_core::document::html_escape;
use rivet_core::matrix::{self, Direction};

use super::RenderContext;

pub(crate) struct MatrixParams {
    pub(crate) from: Option<String>,
    pub(crate) to: Option<String>,
    pub(crate) link: Option<String>,
    pub(crate) direction: Option<String>,
}

pub(crate) struct MatrixCellParams {
    pub(crate) source_type: String,
    pub(crate) target_type: String,
    pub(crate) link_type: String,
    pub(crate) direction: Option<String>,
}

pub(crate) fn render_matrix_view(ctx: &RenderContext, params: &MatrixParams) -> String {
    let store = ctx.store;

    let mut types: Vec<&str> = store.types().collect();
    types.sort();

    let mut html = String::from("<h2>Traceability Matrix</h2>");

    html.push_str("<div class=\"card\">");
    html.push_str(
        "<form class=\"form-row\" hx-get=\"/matrix\" hx-target=\"#content\" hx-push-url=\"true\">",
    );

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

    let link_val = params.link.as_deref().unwrap_or("verifies");
    html.push_str(&format!(
        "<div><label for=\"link\">Link type</label><br>\
         <input name=\"link\" id=\"link\" value=\"{}\"></div>",
        html_escape(link_val)
    ));

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

    if let (Some(from), Some(to)) = (&params.from, &params.to) {
        let link_type = params.link.as_deref().unwrap_or("verifies");
        let direction = match params.direction.as_deref().unwrap_or("backward") {
            "forward" | "fwd" => Direction::Forward,
            _ => Direction::Backward,
        };

        let result = matrix::compute_matrix(store, ctx.graph, from, to, link_type, direction);

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
                            "<a hx-get=\"/artifacts/{tid}\" hx-target=\"#content\" hx-push-url=\"true\" href=\"/artifacts/{tid}\">{tid}</a>",
                            tid = html_escape(&t.id),
                        )
                    })
                    .collect::<Vec<_>>()
                    .join(", ")
            };
            let src_esc = html_escape(&row.source_id);
            html.push_str(&format!(
                "<tr><td><a hx-get=\"/artifacts/{src_esc}\" hx-target=\"#content\" hx-push-url=\"true\" href=\"/artifacts/{src_esc}\">{src_esc}</a></td><td>{}</td><td>{}</td></tr>",
                targets,
                row.targets.len(),
            ));
        }

        html.push_str("</tbody></table>");

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

    html
}

pub(crate) fn render_matrix_cell_detail(ctx: &RenderContext, params: &MatrixCellParams) -> String {
    let store = ctx.store;
    let direction = match params.direction.as_deref().unwrap_or("backward") {
        "forward" | "fwd" => Direction::Forward,
        _ => Direction::Backward,
    };

    let result = matrix::compute_matrix(
        store,
        ctx.graph,
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
            let src_esc = html_escape(&row.source_id);
            let tgt_esc = html_escape(&t.id);
            html.push_str(&format!(
                "<li><a hx-get=\"/artifacts/{src_esc}\" hx-target=\"#content\" hx-push-url=\"true\" href=\"/artifacts/{src_esc}\">{src_esc}</a> \
                 &rarr; \
                 <a hx-get=\"/artifacts/{tgt_esc}\" hx-target=\"#content\" hx-push-url=\"true\" href=\"/artifacts/{tgt_esc}\">{tgt_esc}</a>\
                 <span class=\"meta\" style=\"margin-left:.5rem\">{} &rarr; {}</span></li>",
                html_escape(&row.source_title),
                html_escape(&t.title),
            ));
        }
    }
    if result.rows.iter().all(|r| r.targets.is_empty()) {
        html.push_str("<li class=\"meta\">No links found</li>");
    }
    html.push_str("</ul>");
    html
}
