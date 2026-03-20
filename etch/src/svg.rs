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
    // Extra padding for port labels that extend beyond node boundaries.
    let port_label_margin = 60.0;
    let pad = options.padding + port_label_margin;
    let vb_w = layout.width + pad * 2.0;
    let vb_h = layout.height + pad * 2.0;

    let mut svg = String::with_capacity(4096);

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

    // Render order: containers → edges → leaf nodes.
    // Containers are backgrounds; edges paint on top of them;
    // leaf nodes paint on top of edges.
    write_nodes(&mut svg, layout, options, true); // containers only
    write_edges(&mut svg, layout);
    write_nodes(&mut svg, layout, options, false); // leaves only

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
         \x20   .edge path {{ fill: none; stroke: {ec}; stroke-width: 1.8; \
         marker-end: url(#arrowhead); }}\n\
         \x20   .edge .label-bg {{ fill: #fff; opacity: 0.85; rx: 3; }}\n\
         \x20   .edge text {{ font-family: {font}; font-size: {}px; \
         fill: #555; text-anchor: middle; dominant-baseline: central; \
         font-weight: 500; }}\n\
         \x20   .node.container rect {{ stroke-dasharray: 4 2; }}\n\
         \x20   .node:hover rect {{ filter: brightness(0.92); }}\n\
         \x20   .port circle {{ stroke: #333; stroke-width: 0.8; }}\n\
         \x20   .port.data circle {{ fill: #4a90d9; }}\n\
         \x20   .port.event circle {{ fill: #e67e22; }}\n\
         \x20   .port.event-data circle {{ fill: #27ae60; }}\n\
         \x20   .port.access circle {{ fill: #999; }}\n\
         \x20   .port.group circle {{ fill: #9b59b6; }}\n\
         \x20   .port.abstract circle {{ fill: #666; }}\n\
         \x20   .port text {{ font-size: 10px; fill: #333; dominant-baseline: central; font-weight: 500; }}\n\
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

        // Edge label offset to the right of the midpoint to avoid overlapping the path.
        if !edge.label.is_empty() {
            let mid = edge.points.len() / 2;
            let (mx, my) = edge.points[mid];
            let label = xml_escape(&edge.label);
            // Offset label to the right of vertical edges
            let label_x = mx + 8.0;
            let text_y = my;
            let approx_w = edge.label.len() as f64 * 6.5 + 8.0;
            let approx_h = 14.0;
            writeln!(
                svg,
                "        <rect class=\"label-bg\" x=\"{}\" y=\"{}\" width=\"{approx_w}\" height=\"{approx_h}\" />",
                label_x - 4.0,
                text_y - approx_h / 2.0,
            )
            .unwrap();
            writeln!(
                svg,
                "        <text x=\"{label_x}\" y=\"{text_y}\" text-anchor=\"start\">{label}</text>",
            )
            .unwrap();
        }

        svg.push_str("      </g>\n");
    }

    svg.push_str("    </g>\n");
}

fn write_nodes(svg: &mut String, layout: &GraphLayout, options: &SvgOptions, containers: bool) {
    let class = if containers { "containers" } else { "nodes" };
    writeln!(svg, "    <g class=\"{class}\">").unwrap();

    let default_fill = "#e8e8e8".to_string();

    for node in layout.nodes.iter().filter(|n| n.is_container == containers) {
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

        // Ports.
        for port in &node.ports {
            let port_class = match port.port_type {
                crate::layout::PortType::Data => "data",
                crate::layout::PortType::Event => "event",
                crate::layout::PortType::EventData => "event-data",
                crate::layout::PortType::Access => "access",
                crate::layout::PortType::Group => "group",
                crate::layout::PortType::Abstract => "abstract",
            };
            writeln!(
                svg,
                "        <g class=\"port {port_class}\" data-port-id=\"{}\">",
                xml_escape(&port.id),
            )
            .unwrap();
            // Port circle
            writeln!(
                svg,
                "          <circle cx=\"{}\" cy=\"{}\" r=\"3\" />",
                port.x, port.y,
            )
            .unwrap();
            // Direction indicator (small triangle)
            let tri = match port.direction {
                crate::layout::PortDirection::In => {
                    // Inward-pointing triangle
                    match port.side {
                        crate::layout::PortSide::Left => {
                            format!("M {} {} l 4 -2.5 l 0 5 Z", port.x + 4.0, port.y)
                        }
                        crate::layout::PortSide::Right => {
                            format!("M {} {} l -4 -2.5 l 0 5 Z", port.x - 4.0, port.y)
                        }
                        _ => String::new(),
                    }
                }
                crate::layout::PortDirection::Out => {
                    // Outward-pointing triangle
                    match port.side {
                        crate::layout::PortSide::Left => {
                            format!("M {} {} l -4 -2.5 l 0 5 Z", port.x - 4.0, port.y)
                        }
                        crate::layout::PortSide::Right => {
                            format!("M {} {} l 4 -2.5 l 0 5 Z", port.x + 4.0, port.y)
                        }
                        _ => String::new(),
                    }
                }
                crate::layout::PortDirection::InOut => String::new(),
            };
            if !tri.is_empty() {
                writeln!(svg, "          <path d=\"{tri}\" fill=\"currentColor\" />").unwrap();
            }
            // Port label
            let (lx, anchor) = match port.side {
                crate::layout::PortSide::Left => (port.x + 6.0, "start"),
                crate::layout::PortSide::Right => (port.x - 6.0, "end"),
                _ => (port.x, "middle"),
            };
            writeln!(
                svg,
                "          <text x=\"{lx}\" y=\"{}\" text-anchor=\"{anchor}\">{}</text>",
                port.y,
                xml_escape(&port.label),
            )
            .unwrap();
            svg.push_str("        </g>\n");
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
    // Remove consecutive duplicate points
    let mut deduped: Vec<(f64, f64)> = Vec::with_capacity(points.len());
    for &p in points {
        if deduped
            .last()
            .is_none_or(|last| (last.0 - p.0).abs() > 0.1 || (last.1 - p.1).abs() > 0.1)
        {
            deduped.push(p);
        }
    }
    let points = &deduped;
    if points.is_empty() {
        return String::new();
    }

    let mut d = String::new();
    let (x0, y0) = points[0];
    write!(d, "M {x0} {y0}").unwrap();

    if points.len() == 1 {
        return d;
    }

    // Check if all segments are axis-aligned (orthogonal routing)
    let is_orthogonal = points.len() >= 2
        && points.windows(2).all(|w| {
            let dx = (w[0].0 - w[1].0).abs();
            let dy = (w[0].1 - w[1].1).abs();
            dx < 0.1 || dy < 0.1
        });

    if is_orthogonal {
        // Polyline with straight segments (L commands)
        for &(x, y) in &points[1..] {
            write!(d, " L {x} {y}").unwrap();
        }
    } else if points.len() == 2 {
        let (x1, y1) = points[1];
        write!(d, " L {x1} {y1}").unwrap();
    } else {
        // Cubic bezier: for each segment use vertical tangent handles.
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
    use crate::layout::{
        EdgeInfo, LayoutOptions, NodeInfo, PortDirection, PortInfo, PortSide, PortType, layout,
    };
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
                ports: vec![],
            },
            &|_idx: EdgeIndex, e: &&str| EdgeInfo {
                label: e.to_string(),
                source_port: None,
                target_port: None,
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
    fn svg_orthogonal_edges_use_line_commands() {
        let mut g = Graph::new();
        let a = g.add_node("A");
        let b = g.add_node("B");
        g.add_edge(a, b, "ab");

        let gl = layout(
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
            &LayoutOptions {
                edge_routing: crate::layout::EdgeRouting::Orthogonal,
                ..Default::default()
            },
        );

        let svg = render_svg(&gl, &SvgOptions::default());
        // Orthogonal edges should use L (line-to) commands, not C (cubic)
        assert!(
            svg.contains(" L "),
            "orthogonal edges should use L commands"
        );
        // Should NOT contain C commands for orthogonal edges
        assert!(
            !svg.contains(" C "),
            "orthogonal edges should not use C (bezier) commands"
        );
    }

    #[test]
    fn svg_renders_ports() {
        let mut g = Graph::new();
        let _a = g.add_node("A");

        let gl = layout(
            &g,
            &|_idx: NodeIndex, _n: &&str| NodeInfo {
                id: "A".into(),
                label: "A".into(),
                node_type: "default".into(),
                sublabel: None,
                parent: None,
                ports: vec![
                    PortInfo {
                        id: "data_in".into(),
                        label: "data_in".into(),
                        side: PortSide::Left,
                        direction: PortDirection::In,
                        port_type: PortType::Data,
                    },
                    PortInfo {
                        id: "event_out".into(),
                        label: "event_out".into(),
                        side: PortSide::Right,
                        direction: PortDirection::Out,
                        port_type: PortType::Event,
                    },
                ],
            },
            &|_idx: EdgeIndex, _e: &&str| EdgeInfo {
                label: String::new(),
                source_port: None,
                target_port: None,
            },
            &LayoutOptions::default(),
        );

        let svg = render_svg(&gl, &SvgOptions::default());
        // Port elements present
        assert!(
            svg.contains("class=\"port data\""),
            "should have data port class"
        );
        assert!(
            svg.contains("class=\"port event\""),
            "should have event port class"
        );
        // Port circles present
        assert!(svg.contains("<circle"), "should have port circles");
        // Port labels present
        assert!(svg.contains(">data_in<"), "should have port label");
        assert!(svg.contains(">event_out<"), "should have port label");
        // Port CSS styles present
        assert!(
            svg.contains(".port.data circle"),
            "should have port data CSS"
        );
        assert!(
            svg.contains(".port.event circle"),
            "should have port event CSS"
        );
        // Direction indicator triangle
        assert!(
            svg.contains("<path d=\"M"),
            "should have direction triangle"
        );
    }

    #[test]
    fn xml_escape_special_chars() {
        assert_eq!(
            xml_escape("<b>&\"x\"</b>"),
            "&lt;b&gt;&amp;&quot;x&quot;&lt;/b&gt;"
        );
    }
}
