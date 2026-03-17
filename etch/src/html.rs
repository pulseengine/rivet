//! Interactive HTML wrapper for etch SVG output.
//!
//! Produces a self-contained HTML document with embedded SVG and JavaScript
//! for pan, zoom, selection, and group highlighting.  No external dependencies.

use crate::layout::GraphLayout;
use crate::svg::{SvgOptions, render_svg};

/// Options for HTML output.
#[derive(Debug, Clone)]
pub struct HtmlOptions {
    /// Page title.
    pub title: String,
    /// Show minimap (Phase 3b — reserved).
    pub minimap: bool,
    /// Enable search (Phase 3b — reserved).
    pub search: bool,
    /// Show legend (Phase 3b — reserved).
    pub legend: bool,
    /// Enable semantic zoom (CSS classes at low zoom levels).
    pub semantic_zoom: bool,
}

impl Default for HtmlOptions {
    fn default() -> Self {
        Self {
            title: "Graph".into(),
            minimap: true,
            search: true,
            legend: true,
            semantic_zoom: true,
        }
    }
}

/// Render a [`GraphLayout`] as a self-contained interactive HTML document.
///
/// The returned string is a complete HTML page with embedded SVG and
/// JavaScript for pan, zoom, selection, and group highlighting.
pub fn render_html(
    layout: &GraphLayout,
    svg_options: &SvgOptions,
    html_options: &HtmlOptions,
) -> String {
    let svg_content = render_svg(layout, svg_options);
    let js = include_str!("html_interactivity.js");
    let title = &html_options.title;

    format!(
        r#"<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<style>
  * {{ margin: 0; padding: 0; box-sizing: border-box; }}
  body {{ background: #1e1e2e; overflow: hidden; font-family: system-ui, sans-serif; }}
  #container {{ width: 100vw; height: 100vh; }}
  #container svg {{ width: 100%; height: 100%; cursor: grab; }}
  #container svg:active {{ cursor: grabbing; }}
  .node.selected rect {{ stroke: #ff6600 !important; stroke-width: 3 !important; }}
  .node.selected circle {{ stroke: #ff6600 !important; }}
  /* Semantic zoom: hide detail at low zoom */
  svg.zoom-low .sublabel {{ display: none; }}
  svg.zoom-low .port text {{ display: none; }}
  svg.zoom-overview .edge text {{ display: none; }}
  svg.zoom-overview .edge .label-bg {{ display: none; }}
</style>
</head>
<body>
<div id="container">
{svg_content}
</div>
<script>
{js}
</script>
</body>
</html>"#
    )
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::layout::{EdgeInfo, LayoutOptions, NodeInfo, layout};
    use petgraph::Graph;
    use petgraph::graph::{EdgeIndex, NodeIndex};

    fn build_test_layout() -> GraphLayout {
        let mut g = Graph::new();
        let a = g.add_node("A");
        let b = g.add_node("B");
        g.add_edge(a, b, "link");

        layout(
            &g,
            &|_idx: NodeIndex, n: &&str| NodeInfo {
                id: n.to_string(),
                label: n.to_string(),
                node_type: "default".into(),
                sublabel: None,
                parent: None,
                ports: vec![],
            },
            &|_idx: EdgeIndex, e: &&str| EdgeInfo {
                label: e.to_string(),
                source_port: None,
                target_port: None,
            },
            &LayoutOptions::default(),
        )
    }

    #[test]
    fn html_contains_svg_and_script() {
        let gl = build_test_layout();
        let html = render_html(&gl, &SvgOptions::default(), &HtmlOptions::default());
        assert!(html.contains("<!DOCTYPE html>"));
        assert!(html.contains("<svg"));
        assert!(html.contains("</svg>"));
        assert!(html.contains("<script>"));
        assert!(html.contains("</script>"));
    }

    #[test]
    fn html_contains_interactivity_code() {
        let gl = build_test_layout();
        let html = render_html(&gl, &SvgOptions::default(), &HtmlOptions::default());
        assert!(html.contains("mousedown"), "should have pan handler");
        assert!(html.contains("wheel"), "should have zoom handler");
        assert!(html.contains("etch-select"), "should have selection event");
        assert!(html.contains("viewBox"), "should manipulate viewBox");
    }

    #[test]
    fn html_has_semantic_zoom_css() {
        let gl = build_test_layout();
        let html = render_html(&gl, &SvgOptions::default(), &HtmlOptions::default());
        assert!(html.contains("zoom-low"), "should have zoom-low class");
        assert!(
            html.contains("zoom-overview"),
            "should have zoom-overview class"
        );
    }

    #[test]
    fn html_has_selection_css() {
        let gl = build_test_layout();
        let html = render_html(&gl, &SvgOptions::default(), &HtmlOptions::default());
        assert!(
            html.contains(".node.selected rect"),
            "should have selection CSS"
        );
    }

    #[test]
    fn html_title_customizable() {
        let gl = build_test_layout();
        let opts = HtmlOptions {
            title: "My Architecture".into(),
            ..Default::default()
        };
        let html = render_html(&gl, &SvgOptions::default(), &opts);
        assert!(html.contains("<title>My Architecture</title>"));
    }
}
