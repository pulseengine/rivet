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
use rivet_core::markdown::{render_markdown, strip_html_tags};

use super::RenderContext;
use super::RenderResult;
use super::helpers::badge_for_type;
use crate::serve::components::ViewParams;

// ── Artifacts list ────────────────────────────────────────────────────────

pub(crate) fn render_artifacts_list(ctx: &RenderContext, params: &ViewParams) -> String {
    let store = ctx.store;

    // ── Collect all artifact types for the dropdown ──────────────
    let mut all_types: Vec<String> = store.types().map(|t| t.to_string()).collect();
    all_types.sort();

    // ── Parse filter params ─────────────────────────────────────
    let type_filter: Option<Vec<String>> = params
        .types
        .as_ref()
        .filter(|s| !s.is_empty())
        .map(|s| s.split(',').map(|t| t.trim().to_lowercase()).collect());

    let q_filter: Option<String> = params
        .q
        .as_ref()
        .filter(|s| !s.trim().is_empty())
        .map(|s| s.trim().to_lowercase());

    let sort_col = params.sort.as_deref().unwrap_or("id");
    let sort_desc = !params.sort_ascending();
    let per_page = params.items_per_page();
    let page = params.current_page();

    // ── Filter ──────────────────────────────────────────────────
    let mut artifacts: Vec<_> = store
        .iter()
        .filter(|a| {
            if let Some(ref tf) = type_filter {
                if !tf.contains(&a.artifact_type.to_lowercase()) {
                    return false;
                }
            }
            if let Some(ref q) = q_filter {
                let id_match = a.id.to_lowercase().contains(q);
                let title_match = a.title.to_lowercase().contains(q);
                let desc_match = a
                    .description
                    .as_ref()
                    .map(|d| d.to_lowercase().contains(q))
                    .unwrap_or(false);
                if !id_match && !title_match && !desc_match {
                    return false;
                }
            }
            true
        })
        .collect();

    // ── Sort ────────────────────────────────────────────────────
    match sort_col {
        "type" => {
            artifacts.sort_by(|a, b| a.artifact_type.cmp(&b.artifact_type).then(a.id.cmp(&b.id)))
        }
        "title" => artifacts.sort_by(|a, b| a.title.cmp(&b.title).then(a.id.cmp(&b.id))),
        "status" => artifacts.sort_by(|a, b| {
            let sa = a.status.as_deref().unwrap_or("");
            let sb = b.status.as_deref().unwrap_or("");
            sa.cmp(sb).then(a.id.cmp(&b.id))
        }),
        _ => artifacts.sort_by(|a, b| a.id.cmp(&b.id)),
    }
    if sort_desc {
        artifacts.reverse();
    }

    // ── Paginate ────────────────────────────────────────────────
    let total = artifacts.len();
    let total_pages = if total == 0 {
        1
    } else {
        total.div_ceil(per_page)
    };
    let page = page.min(total_pages);
    let start = (page - 1) * per_page;
    let page_artifacts = &artifacts[start..total.min(start + per_page)];

    // ── Render ──────────────────────────────────────────────────
    let mut html = String::from("<h2>Artifacts</h2>");

    // Filter bar (search + type dropdown + per-page + hidden sort/dir)
    let q_val = params.q.as_deref().unwrap_or("");
    let types_val = params.types.as_deref().unwrap_or("");
    html.push_str("<div class=\"filter-bar card\">");
    html.push_str("<div class=\"form-row\" style=\"margin-bottom:0;width:100%\">");
    html.push_str(&crate::serve::components::search_input(
        "Search artifacts...",
        q_val,
        "/artifacts",
        &["types", "sort", "dir", "per_page"],
    ));
    html.push_str(&crate::serve::components::type_select(
        &all_types,
        types_val,
        "/artifacts",
        &["q", "sort", "dir", "per_page"],
    ));
    html.push_str(&crate::serve::components::per_page_select(
        per_page,
        "/artifacts",
        &["q", "types", "sort", "dir"],
    ));
    html.push_str(&format!(
        "<input type=\"hidden\" name=\"sort\" value=\"{}\">",
        html_escape(sort_col),
    ));
    html.push_str(&format!(
        "<input type=\"hidden\" name=\"dir\" value=\"{}\">",
        html_escape(params.dir.as_deref().unwrap_or("asc")),
    ));
    html.push_str("</div>"); // form-row
    html.push_str("</div>"); // filter-bar

    // Layout: sidebar + main table
    html.push_str("<div class=\"artifacts-layout\">");

    // Main table area
    html.push_str("<div class=\"artifacts-main\">");

    // Sortable column headers
    html.push_str("<table class=\"sortable\" id=\"artifacts-table\"><caption class=\"sr-only\">Artifacts list</caption><thead><tr>");
    html.push_str(&crate::serve::components::sortable_header(
        "ID",
        "id",
        Some(sort_col),
        !sort_desc,
        "/artifacts",
        params,
    ));
    html.push_str(&crate::serve::components::sortable_header(
        "Type",
        "type",
        Some(sort_col),
        !sort_desc,
        "/artifacts",
        params,
    ));
    html.push_str(&crate::serve::components::sortable_header(
        "Title",
        "title",
        Some(sort_col),
        !sort_desc,
        "/artifacts",
        params,
    ));
    html.push_str(&crate::serve::components::sortable_header(
        "Status",
        "status",
        Some(sort_col),
        !sort_desc,
        "/artifacts",
        params,
    ));
    html.push_str("<th>Links</th><th data-col=\"tags\">Tags</th>");
    html.push_str("</tr></thead><tbody>");

    for a in page_artifacts {
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
        let id_esc = html_escape(&a.id);
        html.push_str(&format!(
            "<tr><td><a hx-get=\"/artifacts/{id_esc}\" hx-target=\"#content\" hx-push-url=\"true\" href=\"/artifacts/{id_esc}\">{id_esc}</a></td>\
             <td>{}</td>\
             <td>{}</td>\
             <td>{}</td>\
             <td>{}</td>\
             <td data-tags=\"{}\">{}</td></tr>",
            badge_for_type(&a.artifact_type),
            html_escape(&a.title),
            status_badge,
            a.links.len(),
            html_escape(&tags_csv),
            tags_display,
        ));
    }

    html.push_str("</tbody></table>");

    // Summary line
    if total == store.len() {
        html.push_str(&format!(
            "<p class=\"meta\">{total} artifacts total (page {page} of {total_pages})</p>",
        ));
    } else {
        html.push_str(&format!(
            "<p class=\"meta\">{total} matching artifacts of {} total (page {page} of {total_pages})</p>",
            store.len(),
        ));
    }

    // Pagination controls
    html.push_str(&crate::serve::components::pagination(
        total,
        page,
        per_page,
        "/artifacts",
        params,
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

    html
}

// ── Artifact preview ──────────────────────────────────────────────────────

/// Compact preview tooltip for an artifact — loaded on hover.
pub(crate) fn render_artifact_preview(ctx: &RenderContext, id: &str) -> String {
    let store = ctx.store;
    let graph = ctx.graph;

    let Some(artifact) = store.get(id) else {
        return format!(
            "<div class=\"art-preview\"><strong>{}</strong><br><em>Not found</em></div>",
            html_escape(id)
        );
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
    let back = graph.backlinks_to(id).len();
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
    html
}

// ── Artifact detail ───────────────────────────────────────────────────────

pub(crate) fn render_artifact_detail(ctx: &RenderContext, id: &str) -> RenderResult {
    let store = ctx.store;
    let graph = ctx.graph;
    let externals = ctx.externals;

    let not_found_html = format!(
        "<h2>Not Found</h2><p>Artifact <code>{}</code> does not exist.</p>",
        html_escape(id)
    );

    let Some(artifact) = store.get(id).or_else(|| {
        // Try to resolve as cross-repo reference (prefix:id)
        match rivet_core::externals::parse_artifact_ref(id) {
            rivet_core::externals::ArtifactRef::External { ref prefix, ref id } => externals
                .iter()
                .find(|e| e.prefix == *prefix && e.synced)
                .and_then(|e| e.store.get(id)),
            _ => None,
        }
    }) else {
        return RenderResult {
            html: not_found_html,
            title: format!("Not Found — {id}"),
            source_file: None,
            source_line: None,
        };
    };

    // Capture source location before rendering
    let source_file = artifact
        .source_file
        .as_ref()
        .map(|p| p.display().to_string());

    // Resolve the line number of `id: <this>` within the source file so
    // VS Code's Open Source lands on the artifact definition, not the
    // top of the file. Uses a simple scan (mirrors lsp_find_artifact_line)
    // so no rowan CST dependency is pulled into the render path.
    let source_line: Option<u32> = source_file
        .as_deref()
        .and_then(|sf| std::fs::read_to_string(sf).ok())
        .and_then(|content| {
            content.lines().enumerate().find_map(|(i, line)| {
                let t = line.trim();
                (t == format!("id: {id}") || t == format!("- id: {id}"))
                    .then_some(u32::try_from(i).unwrap_or(0))
            })
        });

    // Source file link (shown at top for quick access)
    // Uses data-source-file + data-source-line attributes — the VS Code
    // nav shim in shell.ts picks these up and opens the file at the
    // exact line of the artifact definition.
    let source_link = if let Some(ref sf) = source_file {
        let filename = std::path::Path::new(sf)
            .file_name()
            .and_then(|n| n.to_str())
            .unwrap_or(sf);
        let line_attr = source_line
            .map(|l| format!(" data-source-line=\"{l}\""))
            .unwrap_or_default();
        format!(
            " <span class=\"meta\" style=\"float:right;font-size:.85rem\">\
             <a href=\"#\" data-source-file=\"{}\"{} title=\"Open source file\">&#128196; {}</a></span>",
            html_escape(sf),
            line_attr,
            html_escape(filename),
        )
    } else {
        String::new()
    };

    // oEmbed discovery tag — allows Notion/Confluence to auto-discover the embed
    let oembed_discovery = format!(
        r#"<link rel="alternate" type="application/json+oembed" href="http://localhost:{port}/oembed?url={encoded_url}&amp;format=json" title="{title}" />"#,
        port = ctx.context.port,
        encoded_url = urlencoding::encode(&format!(
            "http://localhost:{}/artifacts/{}",
            ctx.context.port, artifact.id
        )),
        title = html_escape(&format!("{}: {}", artifact.id, artifact.title)),
    );

    let mut html = format!(
        "{oembed_discovery}<h2>{}{}</h2><p class=\"meta\">{}</p>",
        html_escape(&artifact.id),
        source_link,
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

    // Diagram field — render mermaid or AADL diagram if present.
    // Wraps in .svg-viewer so the toolbar (zoom-fit / fullscreen / popout)
    // applies uniformly to artifact diagrams, graph views, and doc-linkage —
    // same visual language regardless of where the diagram is shown.
    if let Some(serde_yaml::Value::String(diagram)) = artifact.fields.get("diagram") {
        html.push_str("<div class=\"card artifact-diagram\">");
        html.push_str("<h3>Diagram</h3>");
        html.push_str(
            "<div class=\"svg-viewer\">\
             <div class=\"svg-viewer-toolbar\">\
               <button onclick=\"svgZoomFit(this)\" title=\"Zoom to fit\">\u{229e}</button>\
               <button onclick=\"svgFullscreen(this)\" title=\"Fullscreen\">\u{26f6}</button>\
               <button onclick=\"svgPopout(this)\" title=\"Open in new window\">\u{2197}</button>\
             </div>",
        );
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
        html.push_str("</div>"); // .svg-viewer
        html.push_str("</div>"); // .card
    }

    // Forward links
    if !artifact.links.is_empty() {
        html.push_str("<div class=\"card\"><h3>Outgoing Links</h3><table><thead><tr><th>Type</th><th>Target</th></tr></thead><tbody>");
        for link in &artifact.links {
            let target_display = if store.contains(&link.target) {
                format!(
                    "<a hx-get=\"/artifacts/{target}\" hx-target=\"#content\" hx-push-url=\"true\" href=\"/artifacts/{target}\">{target}</a>",
                    target = html_escape(&link.target),
                )
            } else {
                // Check if this is a cross-repo reference (prefix:id)
                match rivet_core::externals::parse_artifact_ref(&link.target) {
                    rivet_core::externals::ArtifactRef::External { ref prefix, ref id } => {
                        let ext_exists = externals
                            .iter()
                            .any(|e| e.prefix == *prefix && e.synced && e.store.contains(id));
                        if ext_exists {
                            format!(
                                "<a hx-get=\"/externals/{ext_prefix}\" hx-target=\"#content\" hx-push-url=\"true\" href=\"/externals/{ext_prefix}\">\
                                 <span class=\"badge badge-info\" style=\"margin-right:.35rem\">{ext_prefix}</span>{ext_id}</a>",
                                ext_prefix = html_escape(prefix),
                                ext_id = html_escape(id),
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
    let backlinks = graph.backlinks_to(id);
    if !backlinks.is_empty() {
        html.push_str("<div class=\"card\"><h3>Incoming Links</h3><table><thead><tr><th>Type</th><th>Source</th></tr></thead><tbody>");
        for bl in backlinks {
            let label = bl.inverse_type.as_deref().unwrap_or(&bl.link_type);
            let source_esc = html_escape(&bl.source);
            html.push_str(&format!(
                "<tr><td><span class=\"link-pill\">{}</span></td>\
                 <td><a hx-get=\"/artifacts/{source_esc}\" hx-target=\"#content\" hx-push-url=\"true\" href=\"/artifacts/{source_esc}\">{source_esc}</a></td></tr>",
                html_escape(label),
            ));
        }
        html.push_str("</tbody></table></div>");
    }

    // Documents referencing this artifact — reverse index from DocumentStore.
    // Groups [[ID]] occurrences per document so the user can jump from an
    // artifact to every doc that cites it.
    let mut doc_refs: Vec<(
        &rivet_core::document::Document,
        Vec<&rivet_core::document::DocReference>,
    )> = Vec::new();
    for doc in ctx.doc_store.iter() {
        let matching: Vec<_> = doc
            .references
            .iter()
            .filter(|r| r.artifact_id == artifact.id)
            .collect();
        if !matching.is_empty() {
            doc_refs.push((doc, matching));
        }
    }
    if !doc_refs.is_empty() {
        html.push_str("<div class=\"card\"><h3>Referenced in Documents</h3>\
             <table><thead><tr><th>Document</th><th>Title</th><th>Occurrences</th></tr></thead><tbody>");
        for (doc, refs) in &doc_refs {
            let doc_id = html_escape(&doc.id);
            let lines: Vec<String> = refs.iter().map(|r| format!("L{}", r.line)).collect();
            html.push_str(&format!(
                "<tr><td><a hx-get=\"/documents/{doc_id}\" hx-target=\"#content\" hx-push-url=\"true\" href=\"/documents/{doc_id}\">{doc_id}</a></td>\
                 <td>{title}</td>\
                 <td><span class=\"meta\">{lines}</span></td></tr>",
                title = html_escape(&doc.title),
                lines = lines.join(", "),
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
    for bl in graph.backlinks_to(id) {
        if bl.source.starts_with("AADL-") {
            aadl_links.push(bl.source.clone());
        }
    }
    if id.starts_with("AADL-") {
        aadl_links.push(id.to_string());
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
        <a class="btn btn-primary" hx-get="/artifacts/{id_esc}/graph" hx-target="#content" hx-push-url="true" href="/artifacts/{id_esc}/graph">Show in graph</a>
        <a class="btn btn-secondary" hx-get="/artifacts" hx-target="#content" hx-push-url="true" href="/artifacts">&larr; Back to artifacts</a>
        </div>"##,
        id_esc = html_escape(id),
    ));

    RenderResult {
        html,
        title: format!("{} — {}", artifact.id, artifact.title),
        source_file,
        source_line,
    }
}

// ── Source-ref link helpers ───────────────────────────────────────────────

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
                        "<a class=\"source-ref-link\" hx-get=\"/source/{encoded_path}\" hx-target=\"#content\" hx-push-url=\"true\" href=\"/source/{encoded_path}\" onclick=\"setTimeout(function(){{var e=document.getElementById('L{line}');if(e)e.scrollIntoView({{behavior:'smooth',block:'center'}})}},200)\">{file_path}:{line}-{end_line}</a>"
                    ));
                } else {
                    result.push_str(&format!(
                        "<a class=\"source-ref-link\" hx-get=\"/source/{encoded_path}\" hx-target=\"#content\" hx-push-url=\"true\" href=\"/source/{encoded_path}\" onclick=\"setTimeout(function(){{var e=document.getElementById('L{line}');if(e)e.scrollIntoView({{behavior:'smooth',block:'center'}})}},200)\">{file_path}:{line}</a>"
                    ));
                }
            } else {
                result.push_str(&format!(
                    "<a class=\"source-ref-link\" hx-get=\"/source/{encoded_path}\" hx-target=\"#content\" hx-push-url=\"true\" href=\"/source/{encoded_path}\">{file_path}</a>"
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
