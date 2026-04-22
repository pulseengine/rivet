// SAFETY-REVIEW (SCRC Phase 1, DD-058): File-scope blanket allow for
// the v0.4.3 clippy restriction-lint escalation. These lints are
// enabled at workspace scope at `warn` so new violations surface in
// CI; the existing call sites here are grandfathered in via this
// file-level allow until Phase 2 (per-site #[allow(...)] + rewrite).
// Rationale per lint class:
//   * unwrap_used / expect_used: legacy sites — many are on parser
//     post-conditions, BTreeMap lookups by key just inserted, or
//     regex::new on literals. Safe to keep; will migrate to ? with
//     typed errors in Phase 2 where user-facing.
//   * indexing_slicing / arithmetic_side_effects: tight math in
//     CST offsets, layout coordinates, and counted-loop indices that
//     is reviewed but not rewritten to checked_* for readability.
//   * as_conversions / cast_possible_truncation / cast_sign_loss:
//     usize<->u32/u64 in offsets where the value range is bounded by
//     input size (bytes of a loaded YAML file).
//   * wildcard_enum_match_arm / match_wildcard_for_single_variants:
//     tolerant parsers intentionally catch-all on token kinds.
//   * panic: only reached on programmer-error invariants.
//   * print_stdout / print_stderr: rivet-cli binary I/O.
#![allow(
    clippy::unwrap_used,
    clippy::expect_used,
    clippy::indexing_slicing,
    clippy::arithmetic_side_effects,
    clippy::as_conversions,
    clippy::cast_possible_truncation,
    clippy::cast_sign_loss,
    clippy::wildcard_enum_match_arm,
    clippy::match_wildcard_for_single_variants,
    clippy::panic,
    clippy::todo,
    clippy::unimplemented,
    clippy::dbg_macro,
    clippy::print_stdout,
    clippy::print_stderr
)]

use rivet_core::document::html_escape;
use rivet_core::markdown::render_markdown;
use rivet_core::schema::{Cardinality, Severity};

use super::RenderContext;
use super::RenderResult;
use super::helpers::badge_for_type;

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

    // Schema linkage diagram (Mermaid) — traceability rules + link type relationships.
    // Wraps in .svg-viewer so the diagram gets the same zoom/fullscreen/popout
    // toolbar as the graph and doc-linkage views.
    html.push_str("<div class=\"card\" style=\"padding:1.25rem;margin-top:1rem\">");
    html.push_str("<h3 style=\"margin:0 0 1rem\">Schema Linkage</h3>");
    html.push_str(
        "<div class=\"svg-viewer\">\
         <div class=\"svg-viewer-toolbar\">\
           <button onclick=\"svgZoomFit(this)\" title=\"Zoom to fit\">\u{229e}</button>\
           <button onclick=\"svgFullscreen(this)\" title=\"Fullscreen\">\u{26f6}</button>\
           <button onclick=\"svgPopout(this)\" title=\"Open in new window\">\u{2197}</button>\
         </div>",
    );
    html.push_str("<pre class=\"mermaid\">\ngraph LR\n");

    // Group artifact types by domain for subgraphs
    // Collect types that appear in any rule/link (to avoid empty subgraphs)
    let mut aspice_types: Vec<&str> = Vec::new();
    let mut stpa_types: Vec<&str> = Vec::new();
    let mut dev_types: Vec<&str> = Vec::new();
    let mut other_types: Vec<&str> = Vec::new();

    let mut sorted_types: Vec<_> = schema.artifact_types.values().collect();
    sorted_types.sort_by_key(|t| &t.name);
    for t in &sorted_types {
        match t.aspice_process.as_deref() {
            Some(p)
                if p.starts_with("SWE")
                    || p.starts_with("SYS")
                    || p.starts_with("MAN")
                    || p.starts_with("SUP") =>
            {
                aspice_types.push(&t.name);
            }
            _ if t.name.starts_with("loss")
                || t.name.starts_with("hazard")
                || t.name.starts_with("uca")
                || t.name.starts_with("controller")
                || t.name.starts_with("system-constraint")
                || t.name.starts_with("control-action")
                || t.name.starts_with("feedback")
                || t.name.starts_with("causal-factor")
                || t.name.starts_with("safety-constraint")
                || t.name.starts_with("loss-scenario")
                || t.name.starts_with("controlled-process")
                || t.name.starts_with("sub-hazard")
                || t.name.starts_with("sec-")
                || t.name.starts_with("asset")
                || t.name.starts_with("threat")
                || t.name.starts_with("vulnerability")
                || t.name.starts_with("attack-path")
                || t.name.starts_with("cybersecurity")
                || t.name.starts_with("security")
                || t.name.starts_with("risk-") =>
            {
                stpa_types.push(&t.name);
            }
            _ if t.name == "requirement" || t.name == "feature" || t.name == "design-decision" => {
                dev_types.push(&t.name);
            }
            _ => {
                other_types.push(&t.name);
            }
        }
    }

    if !aspice_types.is_empty() {
        html.push_str("    subgraph ASPICE\n");
        for tn in &aspice_types {
            html.push_str(&format!("        {}[\"{}\"]\n", tn.replace('-', "_"), tn));
        }
        html.push_str("    end\n");
    }
    if !stpa_types.is_empty() {
        html.push_str("    subgraph Safety\n");
        for tn in &stpa_types {
            html.push_str(&format!("        {}[\"{}\"]\n", tn.replace('-', "_"), tn));
        }
        html.push_str("    end\n");
    }
    if !dev_types.is_empty() {
        html.push_str("    subgraph Dev\n");
        for tn in &dev_types {
            html.push_str(&format!("        {}[\"{}\"]\n", tn.replace('-', "_"), tn));
        }
        html.push_str("    end\n");
    }
    if !other_types.is_empty() {
        html.push_str("    subgraph Other\n");
        for tn in &other_types {
            html.push_str(&format!("        {}[\"{}\"]\n", tn.replace('-', "_"), tn));
        }
        html.push_str("    end\n");
    }

    // Edges from traceability rules
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

    // Additional edges from link_types (source_types → target_types)
    // De-duplicate to avoid excessive arrows
    let mut seen_link_edges: std::collections::HashSet<String> = std::collections::HashSet::new();
    let mut sorted_link_types: Vec<_> = schema.link_types.values().collect();
    sorted_link_types.sort_by_key(|l| &l.name);
    for lt in &sorted_link_types {
        for src in &lt.source_types {
            for tgt in &lt.target_types {
                let key = format!("{}-{}-{}", src, lt.name, tgt);
                if seen_link_edges.insert(key) {
                    html.push_str(&format!(
                        "    {}[\"{}\"] -.->|{}| {}[\"{}\"]\n",
                        src.replace('-', "_"),
                        src,
                        lt.name,
                        tgt.replace('-', "_"),
                        tgt,
                    ));
                }
            }
        }
    }

    html.push_str("</pre>");
    html.push_str("</div>"); // .svg-viewer
    html.push_str("</div>"); // .card

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
    html.push_str("rivet docs embeds           List {{...}} embed tokens\n");
    html.push_str("rivet serve [-P PORT]       Start dashboard\n");
    html.push_str("</pre></div>");

    // Registered embeds — sourced from rivet_core::embed::EMBED_REGISTRY so
    // the dashboard listing matches `rivet docs embeds` exactly.
    html.push_str(&render_embed_registry());

    html
}

/// Render the embed registry table for the Help view.
///
/// Mirrors the output of `rivet docs embeds` so users can discover
/// `{{stats}}`, `{{query:(...)}}`, `{{artifact:ID}}`, etc. without having
/// to read the source or grep the docs.
fn render_embed_registry() -> String {
    use rivet_core::embed::registry;
    let specs = registry();

    let mut html = String::with_capacity(4096);
    html.push_str(
        r#"<div class="card" style="padding:1.25rem;margin-top:1rem">
        <h3 style="margin:0 0 1rem">Document Embeds</h3>
        <p style="opacity:.7;font-size:.85rem;margin:0 0 .75rem">
            Use <code>{{name[:args]}}</code> inside an artifact description or document body.
            Run <code>rivet docs embeds</code> for the same list from the CLI, or
            <code>rivet docs embed-syntax</code> for the full reference.
        </p>
        <table style="font-size:.85rem">
        <thead><tr><th>Name</th><th>Args</th><th>Summary</th><th>Example</th></tr></thead>
        <tbody>
"#,
    );
    for s in specs {
        html.push_str(&format!(
            "<tr><td><code>{name}</code>{marker}</td>\
             <td><code>{args}</code></td>\
             <td>{summary}</td>\
             <td><code>{example}</code></td></tr>\n",
            name = html_escape(s.name),
            marker = if s.legacy {
                r#" <span style="opacity:.6;font-size:.75rem">(inline)</span>"#
            } else {
                ""
            },
            args = html_escape(s.args),
            summary = html_escape(s.summary),
            example = html_escape(s.example),
        ));
    }
    html.push_str("</tbody></table></div>");
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

/// Render a single schema type detail with rich structured HTML.
pub(crate) fn render_schema_show(ctx: &RenderContext, name: &str) -> RenderResult {
    let schema = ctx.schema;

    let Some(t) = schema.artifact_type(name) else {
        // Fallback: unknown type
        let raw = crate::schema_cmd::cmd_show(schema, name, "text");
        let mut html = String::with_capacity(2048);
        html.push_str("<div style=\"margin-bottom:1rem\"><a href=\"/help/schema\" style=\"font-size:.85rem\">&larr; All types</a></div>");
        html.push_str("<div class=\"card\" style=\"padding:1.5rem\"><pre style=\"font-size:.82rem;line-height:1.6;white-space:pre-wrap\">");
        html.push_str(&html_escape(&raw));
        html.push_str("</pre></div>");
        return RenderResult {
            html,
            title: format!("Schema: {name}"),
            source_file: None,
            source_line: None,
        };
    };

    let mut html = String::with_capacity(12288);

    // Back link
    html.push_str("<div style=\"margin-bottom:1rem\"><a href=\"/help/schema\" style=\"font-size:.85rem\">&larr; All types</a></div>");

    // ── Header ───────────────────────────────────────────────────────────
    html.push_str("<div class=\"card\" style=\"padding:1.5rem;margin-bottom:1rem\">");
    html.push_str("<div style=\"display:flex;align-items:center;gap:.75rem;flex-wrap:wrap;margin-bottom:.75rem\">");
    html.push_str("<h2 style=\"margin:0\">");
    html.push_str(&badge_for_type(&t.name));
    html.push_str("</h2>");
    if let Some(ref proc) = t.aspice_process {
        html.push_str(&format!(
            "<span style=\"font-size:.78rem;padding:.2rem .6rem;border-radius:4px;\
             background:rgba(13,110,253,.12);color:#0d6efd;font-family:var(--mono)\">{}</span>",
            html_escape(proc)
        ));
    }
    html.push_str("</div>");
    html.push_str(&format!(
        "<div style=\"font-size:.9rem;opacity:.85;line-height:1.6\">{}</div>",
        render_markdown(&t.description)
    ));
    html.push_str("</div>");

    // ── Fields table ─────────────────────────────────────────────────────
    if !t.fields.is_empty() {
        html.push_str("<div class=\"card\" style=\"padding:1.25rem;margin-bottom:1rem\">");
        html.push_str("<h3 style=\"margin:0 0 .75rem\">Fields</h3>");
        html.push_str(
            "<table><thead><tr>\
            <th>Name</th><th>Type</th><th>Required</th><th>Description</th><th>Allowed Values</th>\
            </tr></thead><tbody>",
        );
        for f in &t.fields {
            let req_badge = if f.required {
                "<span style=\"color:#dc3545;font-size:.75rem;font-weight:600\">required</span>"
            } else {
                "<span style=\"opacity:.5;font-size:.75rem\">optional</span>"
            };
            let desc = f.description.as_deref().unwrap_or("");
            let vals = f
                .allowed_values
                .as_ref()
                .map(|v| {
                    v.iter()
                        .map(|x| {
                            format!("<code style=\"font-size:.75rem\">{}</code>", html_escape(x))
                        })
                        .collect::<Vec<_>>()
                        .join(" ")
                })
                .unwrap_or_default();
            html.push_str(&format!(
                "<tr>\
                 <td><code>{name}</code></td>\
                 <td><code style=\"font-size:.78rem;opacity:.8\">{ftype}</code></td>\
                 <td>{req}</td>\
                 <td style=\"font-size:.85rem\">{desc}</td>\
                 <td style=\"font-size:.82rem\">{vals}</td>\
                 </tr>",
                name = html_escape(&f.name),
                ftype = html_escape(&f.field_type),
                req = req_badge,
                desc = html_escape(desc),
                vals = vals,
            ));
        }
        html.push_str("</tbody></table></div>");
    }

    // ── Link fields table ─────────────────────────────────────────────────
    if !t.link_fields.is_empty() {
        html.push_str("<div class=\"card\" style=\"padding:1.25rem;margin-bottom:1rem\">");
        html.push_str("<h3 style=\"margin:0 0 .75rem\">Link Fields</h3>");
        html.push_str("<table><thead><tr>\
            <th>Name</th><th>Link Type</th><th>Target Types</th><th>Required</th><th>Cardinality</th>\
            </tr></thead><tbody>");
        for lf in &t.link_fields {
            let req_badge = if lf.required {
                "<span style=\"color:#dc3545;font-size:.75rem;font-weight:600\">required</span>"
            } else {
                "<span style=\"opacity:.5;font-size:.75rem\">optional</span>"
            };
            let card_str = match lf.cardinality {
                Cardinality::ExactlyOne => "exactly-one",
                Cardinality::ZeroOrMany => "zero-or-many",
                Cardinality::ZeroOrOne => "zero-or-one",
                Cardinality::OneOrMany => "one-or-many",
            };
            let targets = if lf.target_types.is_empty() {
                "<span style=\"opacity:.5\">any</span>".to_string()
            } else {
                lf.target_types
                    .iter()
                    .map(|tt| {
                        format!(
                            "<a href=\"/help/schema/{tt}\" style=\"font-size:.82rem\">{}</a>",
                            html_escape(tt),
                            tt = html_escape(tt)
                        )
                    })
                    .collect::<Vec<_>>()
                    .join(", ")
            };
            html.push_str(&format!(
                "<tr>\
                 <td><code>{name}</code></td>\
                 <td><code style=\"font-size:.78rem;opacity:.8\">{lt}</code></td>\
                 <td>{targets}</td>\
                 <td>{req}</td>\
                 <td style=\"font-size:.82rem;opacity:.7\">{card}</td>\
                 </tr>",
                name = html_escape(&lf.name),
                lt = html_escape(&lf.link_type),
                targets = targets,
                req = req_badge,
                card = card_str,
            ));
        }
        html.push_str("</tbody></table></div>");
    }

    // ── Traceability rules ────────────────────────────────────────────────
    let rules: Vec<_> = schema
        .traceability_rules
        .iter()
        .filter(|r| r.source_type == t.name)
        .collect();
    if !rules.is_empty() {
        html.push_str("<div class=\"card\" style=\"padding:1.25rem;margin-bottom:1rem\">");
        html.push_str("<h3 style=\"margin:0 0 .75rem\">Traceability Rules</h3>");
        html.push_str("<table><thead><tr><th>Rule</th><th>Severity</th><th>Description</th><th>Details</th></tr></thead><tbody>");
        for r in &rules {
            let (sev_color, sev_label) = match r.severity {
                Severity::Error => ("#dc3545", "error"),
                Severity::Warning => ("#fd7e14", "warning"),
                Severity::Info => ("#0dcaf0", "info"),
            };
            let details = if let Some(ref link) = r.required_link {
                let targets = if r.target_types.is_empty() {
                    "any".to_string()
                } else {
                    r.target_types.join(", ")
                };
                format!(
                    "requires link <code>{}</code> → [{}]",
                    html_escape(link),
                    html_escape(&targets)
                )
            } else if let Some(ref bl) = r.required_backlink {
                let from = if r.from_types.is_empty() {
                    "any".to_string()
                } else {
                    r.from_types.join(", ")
                };
                format!(
                    "requires backlink <code>{}</code> from [{}]",
                    html_escape(bl),
                    html_escape(&from)
                )
            } else {
                String::new()
            };
            html.push_str(&format!(
                "<tr>\
                 <td><code style=\"font-size:.78rem\">{name}</code></td>\
                 <td><span style=\"color:{sev_color};font-size:.75rem;font-weight:600\">{sev}</span></td>\
                 <td style=\"font-size:.85rem\">{desc}</td>\
                 <td style=\"font-size:.82rem\">{details}</td>\
                 </tr>",
                name = html_escape(&r.name),
                sev_color = sev_color,
                sev = sev_label,
                desc = html_escape(&r.description),
                details = details,
            ));
        }
        html.push_str("</tbody></table></div>");
    }

    // ── Artifact count + link to artifact list ────────────────────────────
    let artifact_count = ctx.store.count_by_type(&t.name);
    html.push_str("<div class=\"card\" style=\"padding:1.25rem;margin-bottom:1rem;display:flex;align-items:center;gap:1rem;flex-wrap:wrap\">");
    html.push_str(&format!(
        "<span style=\"font-size:1.5rem;font-weight:700\">{artifact_count}</span>\
         <span style=\"opacity:.7;font-size:.9rem\">artifacts of this type</span>"
    ));
    if artifact_count > 0 {
        html.push_str(&format!(
            "<a href=\"/artifacts?types={name}\" style=\"margin-left:auto;font-size:.85rem\">View artifacts &rarr;</a>",
            name = html_escape(&t.name)
        ));
    }
    html.push_str("</div>");

    // ── Per-type Mermaid diagram ──────────────────────────────────────────
    // Collect outgoing links (this type → others) and incoming (others → this type)
    let mut diagram_edges: Vec<String> = Vec::new();
    let type_node = format!("{}[[\"{name}\"]]", name.replace('-', "_"), name = t.name);

    // From link_fields of this type
    for lf in &t.link_fields {
        for target in &lf.target_types {
            diagram_edges.push(format!(
                "    {} -->|{}| {}[\"{}\"]",
                name.replace('-', "_"),
                html_escape(&lf.link_type),
                target.replace('-', "_"),
                target,
            ));
        }
        if lf.target_types.is_empty() {
            diagram_edges.push(format!(
                "    {} -->|{}| any[\"any\"]",
                name.replace('-', "_"),
                html_escape(&lf.link_type),
            ));
        }
    }

    // Incoming: other types whose link_fields target this type
    let mut sorted_types: Vec<_> = schema.artifact_types.values().collect();
    sorted_types.sort_by_key(|t| &t.name);
    for other_type in &sorted_types {
        if other_type.name == t.name {
            continue;
        }
        for lf in &other_type.link_fields {
            if lf.target_types.contains(&t.name) {
                diagram_edges.push(format!(
                    "    {}[\"{}\"] -->|{}| {}",
                    other_type.name.replace('-', "_"),
                    other_type.name,
                    html_escape(&lf.link_type),
                    name.replace('-', "_"),
                ));
            }
        }
    }

    if !diagram_edges.is_empty() {
        html.push_str("<div class=\"card\" style=\"padding:1.25rem;margin-bottom:1rem\">");
        html.push_str("<h3 style=\"margin:0 0 .75rem\">Linkage Diagram</h3>");
        html.push_str(
            "<div class=\"svg-viewer\">\
             <div class=\"svg-viewer-toolbar\">\
               <button onclick=\"svgZoomFit(this)\" title=\"Zoom to fit\">\u{229e}</button>\
               <button onclick=\"svgFullscreen(this)\" title=\"Fullscreen\">\u{26f6}</button>\
               <button onclick=\"svgPopout(this)\" title=\"Open in new window\">\u{2197}</button>\
             </div>",
        );
        html.push_str("<pre class=\"mermaid\">\ngraph LR\n");
        // Current type node (highlighted)
        html.push_str(&format!("    {}\n", type_node));
        html.push_str(&format!(
            "    style {} fill:#6f42c1,color:#fff,stroke:#6f42c1\n",
            name.replace('-', "_")
        ));
        for edge in &diagram_edges {
            html.push_str(edge);
            html.push('\n');
        }
        html.push_str("</pre>");
        html.push_str("</div>"); // .svg-viewer
        html.push_str("</div>"); // .card
    }

    // ── Example YAML ─────────────────────────────────────────────────────
    let example = crate::schema_cmd::generate_example_yaml_pub(t, schema);
    html.push_str("<div class=\"card\" style=\"padding:1.25rem;margin-bottom:1rem\">");
    html.push_str("<h3 style=\"margin:0 0 .75rem\">Example YAML</h3>");
    html.push_str(r#"<pre style="font-size:.82rem;line-height:1.6;white-space:pre-wrap;background:var(--bg);padding:1rem;border-radius:var(--radius-sm)">"#);
    html.push_str(&html_escape(&example));
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
