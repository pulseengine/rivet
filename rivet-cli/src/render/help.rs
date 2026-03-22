use rivet_core::document::html_escape;
use rivet_core::markdown::render_markdown;

use super::RenderContext;
use super::RenderResult;

/// Render the help overview page.
pub(crate) fn render_help(ctx: &RenderContext) -> String {
    let schema = ctx.schema;
    let type_count = schema.artifact_types.len();
    let link_count = schema.link_types.len();
    let rule_count = schema.traceability_rules.len();

    let mut html = String::with_capacity(4096);
    html.push_str("<h2>Help &amp; Documentation</h2>");
    html.push_str(r#"<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem;margin:1.5rem 0">"#);

    let link_style = "display:inline-block;margin-top:.75rem;font-size:.85rem";
    html.push_str(&format!(
        "<div class=\"card\" style=\"padding:1.25rem\">\
        <h3 style=\"margin:0 0 .5rem\">Schema Types</h3>\
        <p style=\"font-size:2rem;font-weight:700;margin:.25rem 0\">{type_count}</p>\
        <p style=\"font-size:.85rem;opacity:.7\">artifact types loaded</p>\
        <a href=\"/help/schema\" style=\"{link_style}\">Browse types &rarr;</a>\
        </div>"
    ));
    html.push_str(&format!(
        "<div class=\"card\" style=\"padding:1.25rem\">\
        <h3 style=\"margin:0 0 .5rem\">Link Types</h3>\
        <p style=\"font-size:2rem;font-weight:700;margin:.25rem 0\">{link_count}</p>\
        <p style=\"font-size:.85rem;opacity:.7\">with inverse mappings</p>\
        <a href=\"/help/links\" style=\"{link_style}\">View links &rarr;</a>\
        </div>"
    ));
    html.push_str(&format!(
        "<div class=\"card\" style=\"padding:1.25rem\">\
        <h3 style=\"margin:0 0 .5rem\">Traceability Rules</h3>\
        <p style=\"font-size:2rem;font-weight:700;margin:.25rem 0\">{rule_count}</p>\
        <p style=\"font-size:.85rem;opacity:.7\">enforced by validation</p>\
        <a href=\"/help/rules\" style=\"{link_style}\">View rules &rarr;</a>\
        </div>"
    ));
    html.push_str(&format!(
        "<div class=\"card\" style=\"padding:1.25rem\">\
        <h3 style=\"margin:0 0 .5rem\">Documentation</h3>\
        <p style=\"font-size:.85rem;opacity:.7;margin:.5rem 0\">Built-in guides, references, and schema docs.</p>\
        <a href=\"/help/docs\" style=\"{link_style}\">Browse topics &rarr;</a>\
        </div>"
    ));
    html.push_str("</div>");

    // Schema linkage diagram (Mermaid)
    html.push_str("<div class=\"card\" style=\"padding:1.25rem;margin-top:1rem\">");
    html.push_str("<h3 style=\"margin:0 0 1rem\">Schema Linkage</h3>");
    html.push_str("<pre class=\"mermaid\">\ngraph LR\n");
    for rule in &schema.traceability_rules {
        let link_label = rule
            .required_link
            .as_deref()
            .or(rule.required_backlink.as_deref())
            .unwrap_or(&rule.name);
        for target in &rule.target_types {
            html.push_str(&format!(
                "    {}[\"{}\"] -->|{}| {}[\"{}\"]\n",
                rule.source_type.replace('-', "_"),
                rule.source_type,
                link_label,
                target.replace('-', "_"),
                target,
            ));
        }
        // If no target_types, use from_types as reverse
        if rule.target_types.is_empty() {
            for from in &rule.from_types {
                html.push_str(&format!(
                    "    {}[\"{}\"] -->|{}| {}[\"{}\"]\n",
                    from.replace('-', "_"),
                    from,
                    link_label,
                    rule.source_type.replace('-', "_"),
                    rule.source_type,
                ));
            }
        }
    }
    html.push_str("</pre>");
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
    html.push_str("rivet serve [-P PORT]       Start dashboard\n");
    html.push_str("</pre></div>");

    html
}

/// Render the schema types list.
pub(crate) fn render_schema_list(ctx: &RenderContext) -> String {
    let schema = ctx.schema;
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
            "<tr>\
            <td><a href=\"/help/schema/{name}\"><code>{name}</code></a></td>\
            <td>{desc}</td>\
            <td style=\"text-align:center\">{fields}</td>\
            <td style=\"text-align:center\">{links}</td>\
            <td>{proc}</td>\
            </tr>",
            name = t.name,
            desc = render_markdown(&t.description),
            fields = t.fields.len(),
            links = t.link_fields.len(),
        ));
    }

    html.push_str("</tbody></table>");
    html
}

/// Render a single schema type detail.
pub(crate) fn render_schema_show(ctx: &RenderContext, name: &str) -> RenderResult {
    let raw = crate::schema_cmd::cmd_show(ctx.schema, name, "text");

    let mut html = String::with_capacity(8192);
    html.push_str("<div style=\"margin-bottom:1rem\"><a href=\"/help/schema\" style=\"font-size:.85rem\">&larr; All types</a></div>");
    html.push_str("<div class=\"card\" style=\"padding:1.5rem\"><pre style=\"font-size:.82rem;line-height:1.6;white-space:pre-wrap\">");
    html.push_str(&html_escape(&raw));
    html.push_str("</pre></div>");

    RenderResult {
        html,
        title: format!("Schema: {name}"),
        source_file: None,
        source_line: None,
    }
}

/// Render the link types reference.
pub(crate) fn render_links(ctx: &RenderContext) -> String {
    let schema = ctx.schema;
    let mut links: Vec<_> = schema.link_types.values().collect();
    links.sort_by_key(|l| &l.name);

    let mut html = String::with_capacity(4096);
    html.push_str("<div style=\"margin-bottom:1rem\"><a href=\"/help\" style=\"font-size:.85rem\">&larr; Help</a></div>");
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
    html
}

/// Render the traceability rules reference.
pub(crate) fn render_rules(ctx: &RenderContext) -> String {
    let raw = crate::schema_cmd::cmd_rules(ctx.schema, "text");

    let mut html = String::with_capacity(4096);
    html.push_str("<div style=\"margin-bottom:1rem\"><a href=\"/help\" style=\"font-size:.85rem\">&larr; Help</a></div>");
    html.push_str("<h2>Traceability Rules</h2>");
    html.push_str("<div class=\"card\" style=\"padding:1.5rem\"><pre style=\"font-size:.82rem;line-height:1.6;white-space:pre-wrap\">");
    html.push_str(&html_escape(&raw));
    html.push_str("</pre></div>");
    html
}

/// Render the built-in docs topic list.
pub(crate) fn render_docs_list() -> String {
    let mut html = String::with_capacity(4096);
    html.push_str("<h2>Documentation Topics</h2>");
    html.push_str(r#"<p style="opacity:.7;margin-bottom:1rem">Built-in reference docs.</p>"#);
    html.push_str(r#"<div style="display:flex;flex-direction:column;gap:.5rem">"#);

    let topics_json = crate::docs::list_topics("json");
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
                    "<a href=\"/help/docs/{slug}\" \
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
    }

    html.push_str("</div>");
    html
}

/// Render a single documentation topic.
pub(crate) fn render_docs_topic(slug: &str) -> RenderResult {
    let raw = crate::docs::show_topic(slug, "text");

    let mut html = String::with_capacity(8192);
    html.push_str("<div style=\"margin-bottom:1rem\"><a href=\"/help/docs\" style=\"font-size:.85rem\">&larr; All topics</a></div>");
    html.push_str("<div class=\"card\" style=\"padding:1.5rem\">");

    // Render markdown-ish content
    let mut in_code_block = false;
    let mut in_table = false;
    for line in raw.lines() {
        if line.starts_with("```") {
            if in_code_block {
                html.push_str("</pre>");
                in_code_block = false;
            } else {
                html.push_str(r#"<pre style="background:var(--bg);padding:1rem;border-radius:var(--radius-sm);font-size:.82rem;overflow-x:auto;margin:.75rem 0">"#);
                in_code_block = true;
            }
            continue;
        }
        if in_code_block {
            html.push_str(&html_escape(line));
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
            if line
                .chars()
                .all(|c| c == '|' || c == '-' || c == ' ' || c == ':')
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

    RenderResult {
        html,
        title: format!("Docs: {slug}"),
        source_file: None,
        source_line: None,
    }
}
