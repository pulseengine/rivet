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

use etch::layout::{self as pgv_layout, EdgeInfo, LayoutOptions, NodeInfo};
use etch::svg::{SvgOptions, render_svg};
use rivet_core::document::html_escape;

use super::RenderContext;
use super::helpers::{badge_for_type, type_color_map};

pub(crate) fn render_doc_linkage_view(ctx: &RenderContext) -> String {
    let store = ctx.store;
    let doc_store = ctx.doc_store;
    let graph = ctx.graph;

    let mut html = String::from("<h2>Document Linkage</h2>");
    html.push_str("<p class=\"meta\">Shows how documents relate through their artifact references and which artifacts remain unlinked.</p>");

    struct DocInfo {
        id: String,
        title: String,
        artifact_ids: Vec<String>,
    }
    let mut doc_infos: Vec<DocInfo> = Vec::new();
    let mut all_doc_artifacts: std::collections::HashSet<String> = std::collections::HashSet::new();

    for doc in doc_store.iter() {
        let mut seen = std::collections::HashSet::new();
        let art_ids: Vec<String> = doc
            .references
            .iter()
            .filter(|r| seen.insert(r.artifact_id.clone()))
            .map(|r| r.artifact_id.clone())
            .collect();
        for aid in &art_ids {
            all_doc_artifacts.insert(aid.clone());
        }
        doc_infos.push(DocInfo {
            id: doc.id.clone(),
            title: doc.title.clone(),
            artifact_ids: art_ids,
        });
    }

    let mut source_groups: std::collections::BTreeMap<String, Vec<String>> =
        std::collections::BTreeMap::new();
    for a in store.iter() {
        if let Some(sf) = &a.source_file {
            let dir = sf.parent().and_then(|p| p.to_str()).unwrap_or("artifacts");
            source_groups
                .entry(dir.to_string())
                .or_default()
                .push(a.id.clone());
        }
    }

    {
        use petgraph::Graph;
        let mut pg: Graph<String, String> = Graph::new();
        let mut node_idx_map: std::collections::HashMap<String, petgraph::graph::NodeIndex> =
            std::collections::HashMap::new();

        for doc in &doc_infos {
            let idx = pg.add_node(doc.id.clone());
            node_idx_map.insert(doc.id.clone(), idx);
        }
        for path in source_groups.keys() {
            let short = std::path::Path::new(path.as_str())
                .file_name()
                .and_then(|n| n.to_str())
                .unwrap_or(path);
            let label = format!("{short}/");
            let idx = pg.add_node(label.clone());
            node_idx_map.insert(path.clone(), idx);
        }

        let mut art_to_node: std::collections::HashMap<String, String> =
            std::collections::HashMap::new();
        for doc in &doc_infos {
            for aid in &doc.artifact_ids {
                art_to_node.insert(aid.clone(), doc.id.clone());
            }
        }
        for (path, ids) in &source_groups {
            for aid in ids {
                art_to_node
                    .entry(aid.clone())
                    .or_insert_with(|| path.clone());
            }
        }

        let mut edge_types: std::collections::HashMap<
            (String, String),
            std::collections::BTreeSet<String>,
        > = std::collections::HashMap::new();
        for (aid, src_node) in &art_to_node {
            if let Some(a) = store.get(aid) {
                for link in &a.links {
                    if let Some(tgt_node) = art_to_node.get(&link.target) {
                        if tgt_node != src_node {
                            edge_types
                                .entry((src_node.clone(), tgt_node.clone()))
                                .or_default()
                                .insert(link.link_type.clone());
                        }
                    }
                }
            }
        }
        for ((src, tgt), types) in &edge_types {
            if let (Some(&si), Some(&ti)) = (node_idx_map.get(src), node_idx_map.get(tgt)) {
                let label = types.iter().cloned().collect::<Vec<_>>().join(", ");
                pg.add_edge(si, ti, label);
            }
        }

        let doc_ids: std::collections::HashSet<String> =
            doc_infos.iter().map(|d| d.id.clone()).collect();

        let mut colors = type_color_map();
        colors.insert("document".into(), "#3a86ff".into());
        colors.insert("source-group".into(), "#4caf50".into());

        let svg_opts = SvgOptions {
            type_colors: colors,
            interactive: true,
            base_url: Some("/documents".into()),
            background: Some("#fafbfc".into()),
            font_size: 12.0,
            edge_color: "#3a86ff".into(),
            ..SvgOptions::default()
        };

        let layout_opts = LayoutOptions {
            node_width: 220.0,
            node_height: 60.0,
            rank_separation: 100.0,
            node_separation: 40.0,
            ..Default::default()
        };

        let gl = pgv_layout::layout(
            &pg,
            &|_idx, label| {
                let node_type = if doc_ids.contains(label) {
                    "document"
                } else {
                    "source-group"
                };
                let sublabel = if doc_ids.contains(label) {
                    doc_infos.iter().find(|d| d.id == *label).map(|d| {
                        let s = format!("{} ({} refs)", d.title, d.artifact_ids.len());
                        if s.len() > 30 {
                            format!("{}...", &s[..28])
                        } else {
                            s
                        }
                    })
                } else {
                    source_groups
                        .iter()
                        .find(|(p, _)| {
                            let short = std::path::Path::new(p.as_str())
                                .file_name()
                                .and_then(|n| n.to_str())
                                .unwrap_or(p);
                            format!("{short}/") == *label
                        })
                        .map(|(_, ids)| format!("{} artifacts", ids.len()))
                };
                NodeInfo {
                    id: label.clone(),
                    label: label.clone(),
                    node_type: node_type.into(),
                    sublabel,
                    parent: None,
                    ports: vec![],
                }
            },
            &|_idx, e| EdgeInfo {
                label: e.clone(),
                source_port: None,
                target_port: None,
            },
            &layout_opts,
        );

        let svg = render_svg(&gl, &svg_opts);
        html.push_str(
            "<div class=\"svg-viewer\" id=\"doc-graph-viewer\">\
            <div class=\"svg-viewer-toolbar\">\
              <button onclick=\"svgZoomFit(this)\" title=\"Zoom to fit\">\u{229e}</button>\
              <button onclick=\"svgFullscreen(this)\" title=\"Fullscreen\">\u{26f6}</button>\
              <button onclick=\"svgPopout(this)\" title=\"Open in new window\">\u{2197}</button>\
            </div>\
            <div class=\"graph-container\">\
            <div class=\"graph-controls\">\
              <button class=\"zoom-in\" title=\"Zoom in\">+</button>\
              <button class=\"zoom-out\" title=\"Zoom out\">&minus;</button>\
              <button class=\"zoom-fit\" title=\"Fit to view\">&#8689;</button>\
            </div>",
        );
        html.push_str(&svg);
        html.push_str("</div></div>");
        html.push_str(&format!(
            "<p class=\"meta\">{} nodes, {} edges &mdash; scroll to zoom, drag to pan, drag nodes to reposition</p>",
            gl.nodes.len(), gl.edges.len()
        ));
    }

    html.push_str("<div class=\"card\"><h3>Cross-Document Links</h3>");
    html.push_str("<p style=\"font-size:.85rem;color:var(--text-secondary)\">Artifacts in one document that link to artifacts in another document.</p>");
    html.push_str("<table><thead><tr><th>Source Doc</th><th>Artifact</th><th>Link</th><th>Target</th><th>Target Doc</th></tr></thead><tbody>");

    let mut cross_link_count = 0u32;
    let mut art_to_doc: std::collections::HashMap<String, String> =
        std::collections::HashMap::new();
    for doc in &doc_infos {
        for aid in &doc.artifact_ids {
            art_to_doc.insert(aid.clone(), doc.id.clone());
        }
    }

    for doc in &doc_infos {
        for aid in &doc.artifact_ids {
            if let Some(a) = store.get(aid) {
                for link in &a.links {
                    if let Some(target_doc) = art_to_doc.get(&link.target) {
                        if target_doc != &doc.id {
                            cross_link_count += 1;
                            html.push_str(&format!(
                                "<tr><td><a hx-get=\"/documents/{src_doc}\" hx-target=\"#content\" hx-push-url=\"true\" href=\"/documents/{src_doc}\">{src_doc}</a></td>\
                                 <td><a hx-get=\"/artifacts/{aid}\" hx-target=\"#content\" hx-push-url=\"true\" href=\"/artifacts/{aid}\">{aid}</a></td>\
                                 <td><span class=\"link-pill\">{lt}</span></td>\
                                 <td><a hx-get=\"/artifacts/{tgt}\" hx-target=\"#content\" hx-push-url=\"true\" href=\"/artifacts/{tgt}\">{tgt}</a></td>\
                                 <td><a hx-get=\"/documents/{tgt_doc}\" hx-target=\"#content\" hx-push-url=\"true\" href=\"/documents/{tgt_doc}\">{tgt_doc}</a></td></tr>",
                                src_doc = html_escape(&doc.id),
                                lt = html_escape(&link.link_type),
                                tgt = html_escape(&link.target),
                                tgt_doc = html_escape(target_doc),
                            ));
                        }
                    }
                }
            }
        }
    }

    if cross_link_count == 0 {
        html.push_str("<tr><td colspan=\"5\" style=\"text-align:center;color:var(--text-secondary)\">No cross-document links found</td></tr>");
    }
    html.push_str("</tbody></table></div>");

    let unlinked: Vec<&rivet_core::model::Artifact> = store
        .iter()
        .filter(|a| !all_doc_artifacts.contains(&a.id))
        .collect();

    html.push_str("<div class=\"card\"><h3>Artifacts Not Referenced in Any Document</h3>");
    if unlinked.is_empty() {
        html.push_str("<p style=\"color:var(--text-secondary)\">All artifacts are referenced by at least one document.</p>");
    } else {
        html.push_str(&format!("<p style=\"font-size:.85rem;color:var(--text-secondary)\">{} artifacts are not referenced by any document via <code>[[ID]]</code>.</p>", unlinked.len()));
        html.push_str("<table><thead><tr><th>ID</th><th>Type</th><th>Title</th><th>Links</th></tr></thead><tbody>");
        for a in &unlinked {
            let link_count = a.links.len() + graph.backlinks_to(&a.id).len();
            html.push_str(&format!(
                "<tr><td><a hx-get=\"/artifacts/{id}\" hx-target=\"#content\" hx-push-url=\"true\" href=\"/artifacts/{id}\">{id}</a></td><td>{}</td><td>{}</td><td>{link_count}</td></tr>",
                badge_for_type(&a.artifact_type),
                html_escape(&a.title),
                id = html_escape(&a.id),
            ));
        }
        html.push_str("</tbody></table>");
    }
    html.push_str("</div>");

    html.push_str("<div class=\"card\"><h3>Document Summary</h3>");
    html.push_str("<table><thead><tr><th>Document</th><th>Type</th><th>References</th><th>Valid Refs</th><th>Broken Refs</th></tr></thead><tbody>");
    for doc in doc_store.iter() {
        let total_refs = doc.references.len();
        let valid = doc
            .references
            .iter()
            .filter(|r| store.contains(&r.artifact_id))
            .count();
        let broken = total_refs - valid;
        let broken_class = if broken > 0 {
            " style=\"color:var(--error);font-weight:600\""
        } else {
            ""
        };
        html.push_str(&format!(
            "<tr><td><a hx-get=\"/documents/{id}\" hx-target=\"#content\" hx-push-url=\"true\" href=\"/documents/{id}\">{id}</a></td>\
             <td>{}</td><td>{total_refs}</td><td>{valid}</td><td{broken_class}>{broken}</td></tr>",
            badge_for_type(&doc.doc_type),
            id = html_escape(&doc.id),
        ));
    }
    html.push_str("</tbody></table></div>");

    html
}
