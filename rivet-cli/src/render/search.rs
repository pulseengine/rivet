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

use super::RenderContext;

struct SearchHit {
    id: String,
    title: String,
    kind: &'static str,
    type_name: String,
    matched_field: &'static str,
    context: String,
    url: String,
}

pub(crate) fn render_search_view(ctx: &RenderContext, query_str: Option<&str>) -> String {
    let query = match query_str {
        Some(q) if !q.trim().is_empty() => q.trim(),
        _ => {
            return String::from(
                "<div class=\"cmd-k-empty\">Type to search artifacts and documents</div>",
            );
        }
    };

    let query_lower = query.to_lowercase();
    let mut hits: Vec<SearchHit> = Vec::new();

    for artifact in ctx.store.iter() {
        let id_lower = artifact.id.to_lowercase();
        let title_lower = artifact.title.to_lowercase();
        let type_lower = artifact.artifact_type.to_lowercase();

        if id_lower.contains(&query_lower) {
            hits.push(SearchHit {
                id: artifact.id.clone(),
                title: artifact.title.clone(),
                kind: "artifact",
                type_name: artifact.artifact_type.clone(),
                matched_field: "id",
                context: artifact.id.clone(),
                url: format!("/artifacts/{}", artifact.id),
            });
            continue;
        }
        if title_lower.contains(&query_lower) {
            hits.push(SearchHit {
                id: artifact.id.clone(),
                title: artifact.title.clone(),
                kind: "artifact",
                type_name: artifact.artifact_type.clone(),
                matched_field: "title",
                context: artifact.title.clone(),
                url: format!("/artifacts/{}", artifact.id),
            });
            continue;
        }
        if type_lower.contains(&query_lower) {
            hits.push(SearchHit {
                id: artifact.id.clone(),
                title: artifact.title.clone(),
                kind: "artifact",
                type_name: artifact.artifact_type.clone(),
                matched_field: "type",
                context: artifact.artifact_type.clone(),
                url: format!("/artifacts/{}", artifact.id),
            });
            continue;
        }
        if let Some(desc) = &artifact.description {
            if desc.to_lowercase().contains(&query_lower) {
                let desc_lower = desc.to_lowercase();
                let pos = desc_lower.find(&query_lower).unwrap_or(0);
                let start = pos.saturating_sub(40);
                let end = (pos + query.len() + 40).min(desc.len());
                let mut snippet = String::new();
                if start > 0 {
                    snippet.push_str("...");
                }
                snippet.push_str(&desc[start..end]);
                if end < desc.len() {
                    snippet.push_str("...");
                }
                hits.push(SearchHit {
                    id: artifact.id.clone(),
                    title: artifact.title.clone(),
                    kind: "artifact",
                    type_name: artifact.artifact_type.clone(),
                    matched_field: "description",
                    context: snippet,
                    url: format!("/artifacts/{}", artifact.id),
                });
                continue;
            }
        }
        for tag in &artifact.tags {
            if tag.to_lowercase().contains(&query_lower) {
                hits.push(SearchHit {
                    id: artifact.id.clone(),
                    title: artifact.title.clone(),
                    kind: "artifact",
                    type_name: artifact.artifact_type.clone(),
                    matched_field: "tag",
                    context: tag.clone(),
                    url: format!("/artifacts/{}", artifact.id),
                });
                break;
            }
        }
    }

    for doc in ctx.doc_store.iter() {
        let id_lower = doc.id.to_lowercase();
        let title_lower = doc.title.to_lowercase();

        if id_lower.contains(&query_lower) {
            hits.push(SearchHit {
                id: doc.id.clone(),
                title: doc.title.clone(),
                kind: "document",
                type_name: doc.doc_type.clone(),
                matched_field: "id",
                context: doc.id.clone(),
                url: format!("/documents/{}", doc.id),
            });
            continue;
        }
        if title_lower.contains(&query_lower) {
            hits.push(SearchHit {
                id: doc.id.clone(),
                title: doc.title.clone(),
                kind: "document",
                type_name: doc.doc_type.clone(),
                matched_field: "title",
                context: doc.title.clone(),
                url: format!("/documents/{}", doc.id),
            });
        }
    }

    hits.sort_by(|a, b| {
        let a_exact = a.id.to_lowercase() == query_lower;
        let b_exact = b.id.to_lowercase() == query_lower;
        b_exact
            .cmp(&a_exact)
            .then_with(|| a.kind.cmp(b.kind))
            .then_with(|| a.id.cmp(&b.id))
    });

    hits.truncate(50);

    if hits.is_empty() {
        return format!(
            "<div class=\"cmd-k-empty\">No results for &ldquo;{}&rdquo;</div>",
            html_escape(query)
        );
    }

    let mut html = String::new();

    let artifact_hits: Vec<&SearchHit> = hits.iter().filter(|h| h.kind == "artifact").collect();
    let document_hits: Vec<&SearchHit> = hits.iter().filter(|h| h.kind == "document").collect();

    if !artifact_hits.is_empty() {
        html.push_str("<div class=\"cmd-k-group\">");
        html.push_str("<div class=\"cmd-k-group-label\">Artifacts</div>");
        for hit in &artifact_hits {
            render_search_hit(&mut html, hit, query);
        }
        html.push_str("</div>");
    }

    if !document_hits.is_empty() {
        html.push_str("<div class=\"cmd-k-group\">");
        html.push_str("<div class=\"cmd-k-group-label\">Documents</div>");
        for hit in &document_hits {
            render_search_hit(&mut html, hit, query);
        }
        html.push_str("</div>");
    }

    html
}

fn render_search_hit(html: &mut String, hit: &SearchHit, query: &str) {
    let icon = match hit.kind {
        "artifact" => "&#9830;",
        "document" => "&#9776;",
        _ => "&#8226;",
    };

    let highlighted_title = highlight_match(&html_escape(&hit.title), query);

    let field_label = match hit.matched_field {
        "id" => "id",
        "title" => "title",
        "description" => "description",
        "type" => "type",
        "tag" => "tag",
        _ => "",
    };

    let context_display = if hit.matched_field == "title" {
        String::new()
    } else {
        let escaped = html_escape(&hit.context);
        format!(" &mdash; {}", highlight_match(&escaped, query))
    };

    html.push_str(&format!(
        "<div class=\"cmd-k-item\" data-url=\"{}\">\
           <div class=\"cmd-k-item-icon\">{icon}</div>\
           <div class=\"cmd-k-item-body\">\
             <div class=\"cmd-k-item-title\">{highlighted_title}</div>\
             <div class=\"cmd-k-item-meta\">{}{context_display}</div>\
           </div>\
           <div class=\"cmd-k-item-field\">{field_label}</div>\
         </div>",
        html_escape(&hit.url),
        html_escape(&hit.type_name),
    ));
}

/// Case-insensitive highlight: wraps matching substrings in `<mark>`.
fn highlight_match(text: &str, query: &str) -> String {
    let text_lower = text.to_lowercase();
    let query_lower = query.to_lowercase();
    let mut result = String::with_capacity(text.len() + 16);
    let mut start = 0;
    while let Some(pos) = text_lower[start..].find(&query_lower) {
        let abs = start + pos;
        result.push_str(&text[start..abs]);
        result.push_str("<mark>");
        result.push_str(&text[abs..abs + query.len()]);
        result.push_str("</mark>");
        start = abs + query.len();
    }
    result.push_str(&text[start..]);
    result
}
