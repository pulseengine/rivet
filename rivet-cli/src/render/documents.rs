use std::collections::BTreeMap;

use rivet_core::document::{self, html_escape};

use super::RenderContext;
use super::RenderResult;
use super::helpers::badge_for_type;

/// Render the documents list page.
pub(crate) fn render_documents_list(ctx: &RenderContext) -> String {
    let doc_store = ctx.doc_store;
    let mut html = String::from("<h2>Documents</h2>");

    if doc_store.is_empty() {
        html.push_str("<div class=\"card\"><p>No documents loaded. Add markdown files with YAML frontmatter to a <code>docs/</code> directory and reference it in <code>rivet.yaml</code>:</p>\
            <pre style=\"background:#f1f3f5;padding:1rem;border-radius:4px;font-size:.88rem;margin-top:.5rem\">docs:\n  - docs</pre></div>");
        return html;
    }

    // Group documents by doc_type
    let mut groups: BTreeMap<String, Vec<&rivet_core::document::Document>> = BTreeMap::new();
    for doc in doc_store.iter() {
        groups.entry(doc.doc_type.clone()).or_default().push(doc);
    }

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
                _ => "",
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
            let doc_id = html_escape(&doc.id);
            html.push_str(&format!(
                "<li><a href=\"/documents/{doc_id}\">\
                 <span class=\"doc-tree-id\">{doc_id}</span>\
                 {title}\
                 {status_badge}{other_badge}\
                 <span class=\"meta\" style=\"margin-left:auto\">{refs} refs</span>\
                 </a></li>",
                title = html_escape(&doc.title),
                refs = doc.references.len(),
            ));
        }
        html.push_str("</ul></details>");
    }
    html.push_str("</div>");

    // Flat table
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
        let doc_id = html_escape(&doc.id);
        html.push_str(&format!(
            "<tr><td><a href=\"/documents/{doc_id}\">{doc_id}</a></td>\
             <td>{type_badge}</td>\
             <td>{title}</td>\
             <td>{status_badge}</td>\
             <td>{refs}</td></tr>",
            type_badge = badge_for_type(&doc.doc_type),
            title = html_escape(&doc.title),
            refs = doc.references.len(),
        ));
    }
    html.push_str("</tbody></table></div>");
    html.push_str(&format!(
        "<p class=\"meta\">{} documents, {} total artifact references</p>",
        doc_store.len(),
        doc_store.all_references().len()
    ));

    html
}

/// Render a single document detail page.
pub(crate) fn render_document_detail(ctx: &RenderContext, id: &str) -> RenderResult {
    let doc_store = ctx.doc_store;
    let store = ctx.store;
    let graph = ctx.graph;

    let Some(doc) = doc_store.get(id) else {
        return RenderResult {
            html: format!(
                "<h2>Not Found</h2><p>Document <code>{}</code> does not exist.</p>",
                html_escape(id)
            ),
            title: "Not Found".to_string(),
            source_file: None,
            source_line: None,
        };
    };

    let mut html = String::new();

    // Header
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

    // TOC
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

    // Body
    html.push_str("<div class=\"card\"><div class=\"doc-body\">");
    let body_html = document::render_to_html(
        doc,
        |aid| store.contains(aid),
        |aid| crate::serve::views::build_artifact_info(aid, store, graph),
        |did| doc_store.get(did).is_some(),
    );
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

    // Referenced artifacts
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
                let ref_id_esc = html_escape(&artifact.id);
                html.push_str(&format!(
                    "<tr><td><a href=\"/artifacts/{ref_id_esc}\">{ref_id_esc}</a></td>\
                     <td>{}</td><td>{}</td><td>{}</td></tr>",
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

    html.push_str("<p><a href=\"/documents\">&larr; Back to documents</a></p>");

    let source_file = doc.source_file.as_ref().map(|p| p.display().to_string());

    RenderResult {
        html,
        title: doc.title.clone(),
        source_file,
        source_line: Some(1),
    }
}
