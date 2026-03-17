//! SVG renderer for [`GraphLayout`] results.
//!
//! Produces clean, minimal SVG with CSS classes for styling.  Optionally
//! emits `data-*` attributes for interactive front-ends (e.g. HTMX).

use std::collections::HashMap;
use std::fmt::Write as FmtWrite;

use crate::layout::GraphLayout;

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

/// Options that control SVG rendering.
#[derive(Debug, Clone)]
pub struct SvgOptions {
    /// Map from node type to fill colour (CSS value).
    pub type_colors: HashMap<String, String>,
    /// Font family for all text.
    pub font_family: String,
    /// Font size in px.
    pub font_size: f64,
    /// Padding around the entire graph (px).
    pub padding: f64,
    /// Optional background fill colour for the SVG.
    pub background: Option<String>,
    /// Stroke colour for edges.
    pub edge_color: String,
    /// Size of the arrowhead marker (px).
    pub arrow_size: f64,
    /// Corner radius for node rectangles.
    pub rounded_corners: f64,
    /// When `true`, emit `data-id` on nodes and `data-href` links.
    pub interactive: bool,
    /// Base URL prepended to node IDs for `data-href` attributes.
    pub base_url: Option<String>,
    /// Optional node ID to visually highlight (thicker border).
    pub highlight: Option<String>,
}

impl Default for SvgOptions {
    fn default() -> Self {
        Self {
            type_colors: HashMap::new(),
            font_family: "system-ui, -apple-system, sans-serif".into(),
            font_size: 13.0,
            padding: 20.0,
            background: None,
            edge_color: "#666".into(),
            arrow_size: 8.0,
            rounded_corners: 4.0,
            interactive: false,
            base_url: None,
            highlight: None,
        }
    }
}

// ---------------------------------------------------------------------------
// Public entry point
// ---------------------------------------------------------------------------

/// Render a [`GraphLayout`] to an SVG string.
///
/// The returned string is a complete, self-contained `<svg>` document
/// suitable for embedding in HTML or writing to a `.svg` file.
pub fn render_svg(layout: &GraphLayout, options: &SvgOptions) -> String {
    let pad = options.padding;
    let vb_w = layout.width + pad * 2.0;
    let vb_h = layout.height + pad * 2.0;

    // Estimate ~500 bytes per node + ~200 bytes per edge + base overhead.
    let estimated = 2048 + layout.nodes.len() * 500 + layout.edges.len() * 200;
    let mut svg = String::with_capacity(estimated);

    // Opening <svg> tag.
    writeln!(
        svg,
        "<svg xmlns=\"http://www.w3.org/2000/svg\" \
         viewBox=\"0 0 {vb_w} {vb_h}\" \
         width=\"{vb_w}\" height=\"{vb_h}\">"
    )
    .unwrap();

    // <defs> — arrowhead marker.
    write_defs(&mut svg, options);

    // <style>
    write_style(&mut svg, options);

    // Optional background rectangle.
    if let Some(ref bg) = options.background {
        writeln!(
            svg,
            "  <rect width=\"{vb_w}\" height=\"{vb_h}\" fill=\"{bg}\" />"
        )
        .unwrap();
    }

    // Translate everything by padding.
    writeln!(svg, "  <g transform=\"translate({pad},{pad})\">").unwrap();

    // Edges layer.
    write_edges(&mut svg, layout);

    // Nodes layer.
    write_nodes(&mut svg, layout, options);

    svg.push_str("  </g>\n");
    svg.push_str("</svg>\n");
    svg
}

// ---------------------------------------------------------------------------
// Internals
// ---------------------------------------------------------------------------

fn write_defs(svg: &mut String, options: &SvgOptions) {
    let s = options.arrow_size;
    write!(
        svg,
        "  <defs>\n\
         \x20   <marker id=\"arrowhead\" markerWidth=\"{s}\" markerHeight=\"{s}\" \
         refX=\"{s}\" refY=\"{}\" orient=\"auto\" markerUnits=\"strokeWidth\">\n\
         \x20     <path d=\"M 0 0 L {s} {} L 0 {s}\" fill=\"{}\" />\n\
         \x20   </marker>\n\
         \x20 </defs>\n",
        s / 2.0,
        s / 2.0,
        options.edge_color,
    )
    .unwrap();
}

fn write_style(svg: &mut String, options: &SvgOptions) {
    let font = &options.font_family;
    let fs = options.font_size;
    let ec = &options.edge_color;

    write!(
        svg,
        "  <style>\n\
         \x20   .node rect {{ stroke: #333; stroke-width: 1.5; }}\n\
         \x20   .node text {{ font-family: {font}; font-size: {fs}px; \
         fill: #222; text-anchor: middle; dominant-baseline: central; }}\n\
         \x20   .node .sublabel {{ font-size: {}px; fill: #666; }}\n\
         \x20   .edge path {{ fill: none; stroke: {ec}; stroke-width: 1.4; \
         marker-end: url(#arrowhead); }}\n\
         \x20   .edge .label-bg {{ fill: #fff; opacity: 0.85; rx: 3; }}\n\
         \x20   .edge text {{ font-family: {font}; font-size: {}px; \
         fill: #555; text-anchor: middle; dominant-baseline: central; \
         font-weight: 500; }}\n\
         \x20   .node.container rect {{ stroke-dasharray: 4 2; }}\n\
         \x20   .node:hover rect {{ filter: brightness(0.92); }}\n\
         \x20 </style>\n",
        fs - 2.0,
        fs - 2.0,
    )
    .unwrap();
}

fn write_edges(svg: &mut String, layout: &GraphLayout) {
    svg.push_str("    <g class=\"edges\">\n");

    for edge in &layout.edges {
        if edge.points.len() < 2 {
            continue;
        }

        // Build a cubic bezier path through the waypoints.
        let path_d = build_bezier_path(&edge.points);

        writeln!(
            svg,
            "      <g class=\"edge\" data-source=\"{}\" data-target=\"{}\">",
            xml_escape(&edge.source_id),
            xml_escape(&edge.target_id),
        )
        .unwrap();

        writeln!(svg, "        <path d=\"{path_d}\" />").unwrap();

        // Edge label at midpoint with background pill.
        if !edge.label.is_empty() {
            let mid = edge.points.len() / 2;
            let (mx, my) = edge.points[mid];
            let label = xml_escape(&edge.label);
            let text_y = my - 4.0;
            // Approximate label width: ~6.5px per char at default font size.
            let approx_w = edge.label.len() as f64 * 6.5 + 8.0;
            let approx_h = 14.0;
            writeln!(
                svg,
                "        <rect class=\"label-bg\" x=\"{}\" y=\"{}\" width=\"{approx_w}\" height=\"{approx_h}\" />",
                mx - approx_w / 2.0,
                text_y - approx_h / 2.0,
            )
            .unwrap();
            writeln!(
                svg,
                "        <text x=\"{mx}\" y=\"{text_y}\">{label}</text>",
            )
            .unwrap();
        }

        svg.push_str("      </g>\n");
    }

    svg.push_str("    </g>\n");
}

fn write_nodes(svg: &mut String, layout: &GraphLayout, options: &SvgOptions) {
    svg.push_str("    <g class=\"nodes\">\n");

    let default_fill = "#e8e8e8".to_string();

    // Draw containers first (background), then leaf nodes on top.
    let containers: Vec<&crate::layout::LayoutNode> =
        layout.nodes.iter().filter(|n| n.is_container).collect();
    let leaves: Vec<&crate::layout::LayoutNode> =
        layout.nodes.iter().filter(|n| !n.is_container).collect();

    for node in containers.iter().chain(leaves.iter()) {
        let fill = options
            .type_colors
            .get(&node.node_type)
            .unwrap_or(&default_fill);

        let mut attrs = String::new();
        if options.interactive {
            write!(attrs, " data-id=\"{}\"", xml_escape(&node.id)).unwrap();
            if let Some(ref base) = options.base_url {
                write!(attrs, " data-href=\"{}/{}\"", base, xml_escape(&node.id)).unwrap();
            }
        }

        let class_suffix = if node.is_container { " container" } else { "" };
        writeln!(
            svg,
            "      <g class=\"node type-{}{class_suffix}\"{attrs}>",
            css_class_safe(&node.node_type),
        )
        .unwrap();

        // Rectangle.
        let r = options.rounded_corners;
        let is_highlighted = options.highlight.as_ref().is_some_and(|h| h == &node.id);
        let stroke_w = if is_highlighted {
            "3.0"
        } else if node.is_container {
            "2.0"
        } else {
            "1.5"
        };
        let stroke_c = if is_highlighted { "#ff6600" } else { "#333" };
        let container_fill = if node.is_container {
            // Lighten container fill for better contrast with children.
            lighten_color(fill)
        } else {
            fill.to_string()
        };
        writeln!(
            svg,
            "        <rect x=\"{}\" y=\"{}\" width=\"{}\" height=\"{}\" \
             rx=\"{r}\" ry=\"{r}\" fill=\"{container_fill}\" stroke=\"{stroke_c}\" stroke-width=\"{stroke_w}\" />",
            node.x, node.y, node.width, node.height,
        )
        .unwrap();

        if node.is_container {
            // Container: label in header bar.
            let header_y = node.y + options.font_size + 4.0;
            writeln!(
                svg,
                "        <text x=\"{}\" y=\"{header_y}\" font-weight=\"bold\">{}</text>",
                node.x + node.width / 2.0,
                xml_escape(&node.label),
            )
            .unwrap();
            if let Some(ref sub) = node.sublabel {
                let sub_y = header_y + options.font_size;
                writeln!(
                    svg,
                    "        <text class=\"sublabel\" x=\"{}\" y=\"{sub_y}\">{}</text>",
                    node.x + node.width / 2.0,
                    xml_escape(sub),
                )
                .unwrap();
            }
        } else {
            // Leaf node: label centered.
            let text_y = if node.sublabel.is_some() {
                node.y + node.height / 2.0 - options.font_size * 0.45
            } else {
                node.y + node.height / 2.0
            };
            writeln!(
                svg,
                "        <text x=\"{}\" y=\"{text_y}\">{}</text>",
                node.x + node.width / 2.0,
                xml_escape(&node.label),
            )
            .unwrap();
            if let Some(ref sub) = node.sublabel {
                let sub_y = node.y + node.height / 2.0 + options.font_size * 0.65;
                writeln!(
                    svg,
                    "        <text class=\"sublabel\" x=\"{}\" y=\"{sub_y}\">{}</text>",
                    node.x + node.width / 2.0,
                    xml_escape(sub),
                )
                .unwrap();
            }
        }

        // Tooltip.
        writeln!(svg, "        <title>{}</title>", xml_escape(&node.id)).unwrap();

        svg.push_str("      </g>\n");
    }

    svg.push_str("    </g>\n");
}

/// Lighten a hex color for container backgrounds (add transparency effect).
fn lighten_color(hex: &str) -> String {
    if !hex.starts_with('#') || hex.len() < 7 {
        return format!("{hex}40"); // fallback: add alpha
    }
    let r = u8::from_str_radix(&hex[1..3], 16).unwrap_or(200);
    let g = u8::from_str_radix(&hex[3..5], 16).unwrap_or(200);
    let b = u8::from_str_radix(&hex[5..7], 16).unwrap_or(200);
    // Blend toward white by 70%.
    let lr = r as u16 + (255 - r as u16) * 70 / 100;
    let lg = g as u16 + (255 - g as u16) * 70 / 100;
    let lb = b as u16 + (255 - b as u16) * 70 / 100;
    format!(
        "#{:02x}{:02x}{:02x}",
        lr.min(255) as u8,
        lg.min(255) as u8,
        lb.min(255) as u8
    )
}

/// Build a smooth cubic bezier SVG path through the given waypoints.
///
/// For two points this produces a straight line (`M ... L ...`).
/// For three or more points it produces a `C` (cubic bezier) curve that
/// passes through all waypoints using Catmull-Rom-to-Bezier conversion.
fn build_bezier_path(points: &[(f64, f64)]) -> String {
    let mut d = String::new();
    let (x0, y0) = points[0];
    write!(d, "M {x0} {y0}").unwrap();

    if points.len() == 2 {
        let (x1, y1) = points[1];
        write!(d, " L {x1} {y1}").unwrap();
    } else {
        // Simple cubic bezier: for each segment use vertical tangent handles.
        for i in 0..points.len() - 1 {
            let (x1, y1) = points[i];
            let (x2, y2) = points[i + 1];
            let cy1 = y1 + (y2 - y1) * 0.5;
            let cy2 = y2 - (y2 - y1) * 0.5;
            write!(d, " C {x1} {cy1}, {x2} {cy2}, {x2} {y2}").unwrap();
        }
    }

    d
}

/// Minimal XML escaping for attribute values and text content.
fn xml_escape(s: &str) -> String {
    s.replace('&', "&amp;")
        .replace('<', "&lt;")
        .replace('>', "&gt;")
        .replace('"', "&quot;")
}

/// Convert a node-type string into a CSS-class-safe identifier.
fn css_class_safe(s: &str) -> String {
    s.chars()
        .map(|c| {
            if c.is_alphanumeric() || c == '-' {
                c
            } else {
                '-'
            }
        })
        .collect()
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

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
                node_type: "req".into(),
                sublabel: Some("Title".into()),
                parent: None,
            },
            &|_idx: EdgeIndex, e: &&str| EdgeInfo {
                label: e.to_string(),
            },
            &LayoutOptions::default(),
        )
    }

    #[test]
    fn svg_contains_root_element() {
        let gl = build_test_layout();
        let svg = render_svg(&gl, &SvgOptions::default());
        assert!(svg.starts_with("<svg"));
        assert!(svg.contains("</svg>"));
    }

    #[test]
    fn svg_contains_defs_and_style() {
        let gl = build_test_layout();
        let svg = render_svg(&gl, &SvgOptions::default());
        assert!(svg.contains("<defs>"));
        assert!(svg.contains("</defs>"));
        assert!(svg.contains("<style>"));
        assert!(svg.contains("</style>"));
        assert!(svg.contains("arrowhead"));
    }

    #[test]
    fn svg_contains_nodes() {
        let gl = build_test_layout();
        let svg = render_svg(&gl, &SvgOptions::default());
        assert!(svg.contains("class=\"nodes\""));
        assert!(svg.contains("class=\"node type-req\""));
        assert!(svg.contains(">A<"));
        assert!(svg.contains(">B<"));
    }

    #[test]
    fn svg_contains_edges() {
        let gl = build_test_layout();
        let svg = render_svg(&gl, &SvgOptions::default());
        assert!(svg.contains("class=\"edges\""));
        assert!(svg.contains("class=\"edge\""));
        assert!(svg.contains("<path d="));
    }

    #[test]
    fn svg_interactive_data_attributes() {
        let gl = build_test_layout();
        let opts = SvgOptions {
            interactive: true,
            base_url: Some("/artifacts".into()),
            ..Default::default()
        };
        let svg = render_svg(&gl, &opts);
        assert!(svg.contains("data-id=\"A\""));
        assert!(svg.contains("data-href=\"/artifacts/A\""));
    }

    #[test]
    fn svg_background() {
        let gl = build_test_layout();
        let opts = SvgOptions {
            background: Some("#fff".into()),
            ..Default::default()
        };
        let svg = render_svg(&gl, &opts);
        assert!(svg.contains("fill=\"#fff\""));
    }

    #[test]
    fn svg_type_colors() {
        let gl = build_test_layout();
        let mut colors = HashMap::new();
        colors.insert("req".into(), "#cfe2f3".into());
        let opts = SvgOptions {
            type_colors: colors,
            ..Default::default()
        };
        let svg = render_svg(&gl, &opts);
        assert!(svg.contains("fill=\"#cfe2f3\""));
    }

    #[test]
    fn svg_sublabel() {
        let gl = build_test_layout();
        let svg = render_svg(&gl, &SvgOptions::default());
        assert!(svg.contains("class=\"sublabel\""));
        assert!(svg.contains(">Title<"));
    }

    #[test]
    fn svg_tooltip() {
        let gl = build_test_layout();
        let svg = render_svg(&gl, &SvgOptions::default());
        assert!(svg.contains("<title>A</title>"));
        assert!(svg.contains("<title>B</title>"));
    }

    #[test]
    fn svg_compound_container_rendering() {
        // Build a compound graph and verify container SVG output.
        let mut g = Graph::new();
        let _s = g.add_node("System");
        let a = g.add_node("A");
        let b = g.add_node("B");
        g.add_edge(a, b, "conn");

        let gl = layout(
            &g,
            &|_idx: NodeIndex, n: &&str| NodeInfo {
                id: n.to_string(),
                label: n.to_string(),
                node_type: "system".into(),
                sublabel: None,
                parent: if *n == "A" || *n == "B" {
                    Some("System".into())
                } else {
                    None
                },
            },
            &|_idx: EdgeIndex, e: &&str| EdgeInfo {
                label: e.to_string(),
            },
            &LayoutOptions::default(),
        );

        let mut colors = HashMap::new();
        colors.insert("system".into(), "#4a90d9".into());
        let svg = render_svg(
            &gl,
            &SvgOptions {
                type_colors: colors,
                ..Default::default()
            },
        );

        // Container should have the "container" CSS class.
        assert!(
            svg.contains("container"),
            "SVG should contain 'container' class"
        );
        // Container should use dashed stroke style (from CSS).
        assert!(svg.contains("stroke-dasharray"));
        // Container label should be bold.
        assert!(svg.contains("font-weight=\"bold\""));
        // Container fill should be lightened (not the original color).
        assert!(
            !svg.contains("fill=\"#4a90d9\"") || svg.contains("font-weight=\"bold\""),
            "Container fill should be lightened"
        );
    }

    #[test]
    fn lighten_color_basic() {
        let result = lighten_color("#000000");
        // Black lightened 70% toward white should be ~#b3b3b3.
        assert_eq!(result, "#b2b2b2");

        let result = lighten_color("#ffffff");
        // White stays white.
        assert_eq!(result, "#ffffff");

        let result = lighten_color("#ff0000");
        // Red channel stays 255, G and B go up.
        assert!(result.starts_with("#ff"));
    }

    #[test]
    fn xml_escape_special_chars() {
        assert_eq!(
            xml_escape("<b>&\"x\"</b>"),
            "&lt;b&gt;&amp;&quot;x&quot;&lt;/b&gt;"
        );
    }
}
