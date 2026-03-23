use std::collections::HashMap;

use petgraph::graph::{Graph, NodeIndex};
use petgraph::visit::EdgeRef;

use etch::filter::ego_subgraph;
use etch::layout::{self as pgv_layout, EdgeInfo, LayoutOptions, NodeInfo};
use etch::svg::{SvgOptions, render_svg};
use rivet_core::document::html_escape;
use rivet_core::store::Store;

use super::RenderContext;
use super::helpers::type_color_map;

// ── Graph params (mirrored from serve/views.rs for render_page routing) ──

pub(crate) struct GraphParams {
    pub(crate) types: Option<String>,
    pub(crate) link_types: Option<String>,
    pub(crate) depth: usize,
    pub(crate) focus: Option<String>,
}

pub(crate) struct EgoParams {
    pub(crate) hops: usize,
}

// ── Graph view ────────────────────────────────────────────────────────────

/// Build a filtered subgraph from the full petgraph, keeping only nodes
/// whose artifact types match `type_filter` and edges matching `link_filter`.
pub(crate) fn build_filtered_subgraph(
    pg: &petgraph::Graph<String, String>,
    store: &Store,
    node_map: &HashMap<String, NodeIndex>,
    type_filter: &Option<Vec<String>>,
    link_filter: &Option<Vec<String>>,
) -> Graph<String, String> {
    let mut sub = Graph::new();
    let mut old_to_new: HashMap<NodeIndex, NodeIndex> = HashMap::new();

    for (id, &old_idx) in node_map {
        let include = match type_filter {
            Some(types) => store
                .get(id.as_str())
                .map(|a| types.iter().any(|t| t == &a.artifact_type))
                .unwrap_or(false),
            None => true,
        };
        if include {
            let new_idx = sub.add_node(pg[old_idx].clone());
            old_to_new.insert(old_idx, new_idx);
        }
    }

    for edge in pg.edge_references() {
        if let (Some(&new_src), Some(&new_dst)) = (
            old_to_new.get(&edge.source()),
            old_to_new.get(&edge.target()),
        ) {
            let include = match link_filter {
                Some(lt) => lt.iter().any(|t| t == edge.weight()),
                None => true,
            };
            if include {
                sub.add_edge(new_src, new_dst, edge.weight().clone());
            }
        }
    }

    sub
}

/// Apply type and link filters to an already-extracted subgraph.
pub(crate) fn apply_filters_to_graph(
    graph: &Graph<String, String>,
    store: &Store,
    type_filter: &Option<Vec<String>>,
    link_filter: &Option<Vec<String>>,
) -> Graph<String, String> {
    let mut sub = Graph::new();
    let mut old_to_new: HashMap<NodeIndex, NodeIndex> = HashMap::new();

    for idx in graph.node_indices() {
        let id = &graph[idx];
        let include = match type_filter {
            Some(types) => store
                .get(id.as_str())
                .map(|a| types.iter().any(|t| t == &a.artifact_type))
                .unwrap_or(false),
            None => true,
        };
        if include {
            let new_idx = sub.add_node(id.clone());
            old_to_new.insert(idx, new_idx);
        }
    }

    for edge in graph.edge_references() {
        if let (Some(&new_src), Some(&new_dst)) = (
            old_to_new.get(&edge.source()),
            old_to_new.get(&edge.target()),
        ) {
            let include = match link_filter {
                Some(lt) => lt.iter().any(|t| t == edge.weight()),
                None => true,
            };
            if include {
                sub.add_edge(new_src, new_dst, edge.weight().clone());
            }
        }
    }

    sub
}

fn node_info_for(store: &Store, n: &String) -> NodeInfo {
    let artifact = store.get(n.as_str());
    let atype = artifact
        .map(|a| a.artifact_type.clone())
        .unwrap_or_default();
    let title = artifact.map(|a| a.title.clone()).unwrap_or_default();
    let sublabel = if title.len() > 28 {
        Some(format!("{}...", title.chars().take(26).collect::<String>()))
    } else if title.is_empty() {
        None
    } else {
        Some(title)
    };

    let parent = if atype == "aadl-component" {
        artifact.and_then(|a| {
            a.links
                .iter()
                .filter(|l| l.link_type == "allocated-from")
                .find_map(|l| {
                    store.get(l.target.as_str()).and_then(|target_art| {
                        if target_art.artifact_type == "aadl-component" {
                            Some(l.target.clone())
                        } else {
                            None
                        }
                    })
                })
        })
    } else {
        None
    };

    NodeInfo {
        id: n.clone(),
        label: n.clone(),
        node_type: atype,
        sublabel,
        parent,
        ports: vec![],
    }
}

fn default_layout_opts() -> LayoutOptions {
    LayoutOptions {
        node_width: 200.0,
        node_height: 56.0,
        rank_separation: 90.0,
        node_separation: 30.0,
        container_padding: 20.0,
        container_header: 30.0,
        ..Default::default()
    }
}

pub(crate) fn render_graph_view(ctx: &RenderContext, params: &GraphParams) -> String {
    let store = ctx.store;
    let link_graph = ctx.graph;
    let pg = link_graph.graph();
    let node_map = link_graph.node_map();

    let type_filter: Option<Vec<String>> = params
        .types
        .as_ref()
        .filter(|s| !s.is_empty())
        .map(|s| s.split(',').map(|t| t.trim().to_string()).collect());
    let link_filter: Option<Vec<String>> = params
        .link_types
        .as_ref()
        .filter(|s| !s.is_empty())
        .map(|s| s.split(',').map(|t| t.trim().to_string()).collect());

    let sub: Graph<String, String> = if let Some(focus_id) = &params.focus {
        if focus_id.is_empty() {
            build_filtered_subgraph(pg, store, node_map, &type_filter, &link_filter)
        } else if let Some(&focus_idx) = node_map.get(focus_id.as_str()) {
            let hops = if params.depth > 0 { params.depth } else { 3 };
            let ego = ego_subgraph(pg, focus_idx, hops);
            apply_filters_to_graph(&ego, store, &type_filter, &link_filter)
        } else {
            build_filtered_subgraph(pg, store, node_map, &type_filter, &link_filter)
        }
    } else {
        build_filtered_subgraph(pg, store, node_map, &type_filter, &link_filter)
    };

    let colors = type_color_map();
    let svg_opts = SvgOptions {
        type_colors: colors.clone(),
        highlight: params.focus.clone().filter(|s| !s.is_empty()),
        interactive: true,
        base_url: Some("/artifacts".into()),
        background: Some("#fafbfc".into()),
        font_size: 12.0,
        edge_color: "#888".into(),
        ..SvgOptions::default()
    };

    let layout_opts = default_layout_opts();

    let gl = pgv_layout::layout(
        &sub,
        &|_idx, n| node_info_for(store, n),
        &|_idx, e| EdgeInfo {
            label: e.clone(),
            source_port: None,
            target_port: None,
        },
        &layout_opts,
    );

    let svg = render_svg(&gl, &svg_opts);

    let present_types: std::collections::BTreeSet<String> = sub
        .node_indices()
        .filter_map(|idx| {
            store
                .get(sub[idx].as_str())
                .map(|a| a.artifact_type.clone())
        })
        .collect();

    let mut html = String::from("<h2>Traceability Graph</h2>");

    html.push_str("<div class=\"card\">");
    html.push_str(
        "<form class=\"form-row\" hx-get=\"/graph\" hx-target=\"#content\" hx-push-url=\"true\">",
    );

    let mut all_types: Vec<&str> = store.types().collect();
    all_types.sort();
    html.push_str("<div><label>Types</label><div class=\"filter-grid\">");
    for t in &all_types {
        let checked = match &type_filter {
            Some(f) => {
                if f.iter().any(|x| x == *t) {
                    " checked"
                } else {
                    ""
                }
            }
            None => " checked",
        };
        html.push_str(&format!(
            "<label><input type=\"checkbox\" name=\"types\" value=\"{t}\"{checked}> {t}</label>"
        ));
    }
    html.push_str("</div></div>");

    let focus_val = params.focus.as_deref().unwrap_or("");
    html.push_str(&format!(
        "<div><label for=\"focus\">Focus</label><br>\
         <input name=\"focus\" id=\"focus\" value=\"{}\" placeholder=\"e.g. REQ-001\" list=\"artifact-ids\"></div>",
        html_escape(focus_val)
    ));

    html.push_str("<datalist id=\"artifact-ids\">");
    for a in store.iter() {
        html.push_str(&format!("<option value=\"{}\">", html_escape(&a.id)));
    }
    html.push_str("</datalist>");

    let depth_val = if params.depth > 0 { params.depth } else { 3 };
    html.push_str(&format!(
        "<div><label for=\"depth\">Depth: <span id=\"depth-val\">{depth_val}</span></label><br>\
         <input type=\"range\" name=\"depth\" id=\"depth\" min=\"1\" max=\"10\" value=\"{depth_val}\" \
         oninput=\"document.getElementById('depth-val').textContent=this.value\"></div>"
    ));

    let lt_val = params.link_types.as_deref().unwrap_or("");
    html.push_str(&format!(
        "<div><label for=\"link_types\">Link types</label><br>\
         <input name=\"link_types\" id=\"link_types\" value=\"{}\" placeholder=\"e.g. satisfies,implements\"></div>",
        html_escape(lt_val)
    ));

    html.push_str("<div><label>&nbsp;</label><br><button type=\"submit\">Apply</button></div>");
    html.push_str("</form>");

    if !present_types.is_empty() {
        html.push_str("<div class=\"graph-legend\">");
        for t in &present_types {
            let color = colors
                .get(t.as_str())
                .map(|s| s.as_str())
                .unwrap_or("#e8e8e8");
            html.push_str(&format!(
                "<div class=\"graph-legend-item\"><div class=\"graph-legend-swatch\" style=\"background:{color}\"></div>{t}</div>"
            ));
        }
        html.push_str("</div>");
    }
    html.push_str("</div>");

    html.push_str(
        "<div class=\"svg-viewer\" id=\"graph-viewer\">\
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
        "<p class=\"meta\">{} nodes, {} edges &mdash; scroll to zoom, drag to pan, click nodes to navigate</p>",
        gl.nodes.len(),
        gl.edges.len()
    ));

    html
}

pub(crate) fn render_artifact_graph(ctx: &RenderContext, id: &str, params: &EgoParams) -> String {
    let store = ctx.store;
    let link_graph = ctx.graph;
    let pg = link_graph.graph();
    let node_map = link_graph.node_map();

    let Some(&focus_idx) = node_map.get(id) else {
        return format!(
            "<h2>Not Found</h2><p>Artifact <code>{}</code> not in graph.</p>",
            html_escape(id)
        );
    };

    let hops = if params.hops > 0 { params.hops } else { 2 };
    let sub = ego_subgraph(pg, focus_idx, hops);

    let colors = type_color_map();
    let svg_opts = SvgOptions {
        type_colors: colors.clone(),
        highlight: Some(id.to_string()),
        interactive: true,
        base_url: Some("/artifacts".into()),
        background: Some("#fafbfc".into()),
        font_size: 12.0,
        edge_color: "#888".into(),
        ..SvgOptions::default()
    };

    let layout_opts = default_layout_opts();

    let gl = pgv_layout::layout(
        &sub,
        &|_idx, n| node_info_for(store, n),
        &|_idx, e| EdgeInfo {
            label: e.clone(),
            source_port: None,
            target_port: None,
        },
        &layout_opts,
    );

    let svg = render_svg(&gl, &svg_opts);

    let present_types: std::collections::BTreeSet<String> = sub
        .node_indices()
        .filter_map(|idx| {
            store
                .get(sub[idx].as_str())
                .map(|a| a.artifact_type.clone())
        })
        .collect();

    let mut html = format!("<h2>Neighborhood of {}</h2>", html_escape(id));

    html.push_str("<div class=\"card\">");
    html.push_str(&format!(
        "<form class=\"form-row\" hx-get=\"/artifacts/{id_esc}/graph\" hx-target=\"#content\" hx-push-url=\"true\">\
         <div><label for=\"hops\">Hops: <span id=\"hops-val\">{hops}</span></label><br>\
         <input type=\"range\" name=\"hops\" id=\"hops\" min=\"1\" max=\"6\" value=\"{hops}\" \
         oninput=\"document.getElementById('hops-val').textContent=this.value\"></div>\
         <div><label>&nbsp;</label><br><button type=\"submit\">Update</button></div>\
         </form>",
        id_esc = html_escape(id),
    ));

    if !present_types.is_empty() {
        html.push_str("<div class=\"graph-legend\">");
        for t in &present_types {
            let color = colors
                .get(t.as_str())
                .map(|s| s.as_str())
                .unwrap_or("#e8e8e8");
            html.push_str(&format!(
                "<div class=\"graph-legend-item\"><div class=\"graph-legend-swatch\" style=\"background:{color}\"></div>{t}</div>"
            ));
        }
        html.push_str("</div>");
    }
    html.push_str("</div>");

    html.push_str(
        "<div class=\"svg-viewer\" id=\"ego-graph-viewer\">\
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
        "<p class=\"meta\">{} nodes, {} edges ({}-hop neighborhood) &mdash; scroll to zoom, drag to pan, click nodes to navigate</p>",
        gl.nodes.len(),
        gl.edges.len(),
        hops
    ));

    html.push_str(&format!(
        r##"<p><a hx-get="/artifacts/{id_esc}" hx-target="#content" hx-push-url="true" href="/artifacts/{id_esc}">&larr; Back to {id_esc}</a>
        &nbsp;|&nbsp;
        <a hx-get="/graph?focus={id_esc}" hx-target="#content" hx-push-url="true" href="/graph?focus={id_esc}">Open in full graph</a></p>"##,
        id_esc = html_escape(id),
    ));

    html
}
