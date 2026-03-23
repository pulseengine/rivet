use rivet_core::document::html_escape;

use super::RenderContext;
use super::helpers::badge_for_type;

pub(crate) fn render_externals_list(ctx: &RenderContext) -> String {
    let externals = ctx.externals;

    let mut html = String::from("<h2>External Projects</h2>");

    if externals.is_empty() {
        html.push_str(
            "<div class=\"card\"><p>No external projects configured. \
             Add an <code>externals</code> section to <code>rivet.yaml</code> to enable cross-repo linking.</p></div>",
        );
        return html;
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
                "<a hx-get=\"/externals/{prefix}\" hx-target=\"#content\" hx-push-url=\"true\" href=\"/externals/{prefix}\">{prefix}</a>",
                prefix = html_escape(&ext.prefix),
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

    let any_unsynced = externals.iter().any(|e| !e.synced);
    if any_unsynced {
        html.push_str(
            "<div class=\"card\" style=\"background:#fff8e1;border-color:#e6d48e\">\
             <p style=\"color:#8b6914;margin:0\">Some externals are not synced. \
             Run <code>rivet sync</code> to fetch them.</p></div>",
        );
    }

    html
}

pub(crate) fn render_external_detail(ctx: &RenderContext, prefix: &str) -> String {
    let Some(ext) = ctx.externals.iter().find(|e| e.prefix == prefix) else {
        return format!(
            "<h2>Not Found</h2><p>External project <code>{}</code> is not configured.</p>",
            html_escape(prefix)
        );
    };

    if !ext.synced {
        return format!(
            "<h2>External: {}</h2>\
             <div class=\"card\" style=\"background:#fff8e1;border-color:#e6d48e\">\
             <p style=\"color:#8b6914;margin:0\">This external project has not been synced yet. \
             Run <code>rivet sync</code> to fetch it.</p></div>",
            html_escape(&ext.prefix)
        );
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
        let qualified_id = format!("{}:{}", ext.prefix, a.id);
        let qid_esc = html_escape(&qualified_id);
        html.push_str(&format!(
            "<tr><td><a hx-get=\"/artifacts/{qid_esc}\" hx-target=\"#content\" hx-push-url=\"true\" href=\"/artifacts/{qid_esc}\">{}</a></td>\
             <td>{}</td>\
             <td>{}</td>\
             <td>{}</td>\
             <td>{}</td></tr>",
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

    html.push_str(
        "<div class=\"detail-actions\">\
         <a class=\"btn btn-secondary\" hx-get=\"/externals\" hx-target=\"#content\" hx-push-url=\"true\" href=\"/externals\">&larr; Back to externals</a>\
         </div>",
    );

    html
}
