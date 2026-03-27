use std::collections::HashMap;

use etch::svg::ShapeProvider;
use rivet_core::document::html_escape;

// ── Color palette ────────────────────────────────────────────────────────

pub(crate) fn type_color_map() -> HashMap<String, String> {
    let pairs: &[(&str, &str)] = &[
        // STPA
        ("loss", "#dc3545"),
        ("hazard", "#fd7e14"),
        ("system-constraint", "#20c997"),
        ("controller", "#6f42c1"),
        ("uca", "#e83e8c"),
        ("control-action", "#17a2b8"),
        ("feedback", "#6610f2"),
        ("causal-factor", "#d63384"),
        ("safety-constraint", "#20c997"),
        ("loss-scenario", "#e83e8c"),
        ("controller-constraint", "#20c997"),
        ("controlled-process", "#6610f2"),
        ("sub-hazard", "#fd7e14"),
        // ASPICE
        ("stakeholder-req", "#0d6efd"),
        ("system-req", "#0dcaf0"),
        ("system-architecture", "#198754"),
        ("sw-req", "#198754"),
        ("sw-architecture", "#0d6efd"),
        ("sw-detailed-design", "#6610f2"),
        ("sw-unit", "#6f42c1"),
        ("system-verification", "#6610f2"),
        ("sw-verification", "#6610f2"),
        ("system-integration-verification", "#6610f2"),
        ("sw-integration-verification", "#6610f2"),
        ("sw-unit-verification", "#6610f2"),
        ("qualification-verification", "#6610f2"),
        // Dev
        ("requirement", "#0d6efd"),
        ("design-decision", "#198754"),
        ("feature", "#6f42c1"),
        // STPA-Sec
        ("sec-loss", "#991b1b"),
        ("sec-hazard", "#b91c1c"),
        ("sec-constraint", "#15803d"),
        ("sec-uca", "#be123c"),
        ("sec-scenario", "#9a3412"),
        // Cybersecurity
        ("asset", "#ffc107"),
        ("threat", "#dc3545"),
        ("cybersecurity-req", "#fd7e14"),
        ("vulnerability", "#e83e8c"),
        ("attack-path", "#dc3545"),
        ("cybersecurity-goal", "#0d6efd"),
        ("cybersecurity-control", "#198754"),
        ("security-verification", "#6610f2"),
        ("risk-assessment", "#fd7e14"),
        ("security-event", "#e83e8c"),
    ];
    pairs
        .iter()
        .map(|(k, v)| (k.to_string(), v.to_string()))
        .collect()
}

// ── Shape providers ───────────────────────────────────────────────────────

/// Build a map from artifact type name to a custom SVG shape provider.
///
/// Each provider receives `(node_type, x, y, width, height, fill, stroke)`
/// and returns a raw SVG element string that replaces the default `<rect>`.
/// Types not in this map fall back to the etch default rectangle.
pub(crate) fn type_shape_map() -> HashMap<String, ShapeProvider> {
    let mut map: HashMap<String, ShapeProvider> = HashMap::new();

    // requirement → rounded rectangle (rx=10)
    map.insert(
        "requirement".into(),
        Box::new(|_nt, x, y, w, h, fill, stroke| {
            format!(
                r#"<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="10" ry="10" fill="{fill}" stroke="{stroke}" stroke-width="2"/>"#
            )
        }),
    );

    // design-decision → diamond/rhombus
    map.insert(
        "design-decision".into(),
        Box::new(|_nt, x, y, w, h, fill, stroke| {
            let cx = x + w / 2.0;
            let cy = y + h / 2.0;
            format!(
                r#"<polygon points="{},{} {},{} {},{} {},{}" fill="{fill}" stroke="{stroke}" stroke-width="1.5"/>"#,
                cx, y,          // top
                x + w, cy,      // right
                cx, y + h,      // bottom
                x, cy,          // left
            )
        }),
    );

    // feature → hexagon
    map.insert(
        "feature".into(),
        Box::new(|_nt, x, y, w, h, fill, stroke| {
            let cx = x + w / 2.0;
            format!(
                r#"<polygon points="{},{} {},{} {},{} {},{} {},{} {},{}" fill="{fill}" stroke="{stroke}" stroke-width="1.5"/>"#,
                cx, y,                   // top center
                x + w, y + h * 0.25,    // top-right
                x + w, y + h * 0.75,    // bottom-right
                cx, y + h,              // bottom center
                x, y + h * 0.75,        // bottom-left
                x, y + h * 0.25,        // top-left
            )
        }),
    );

    // loss → red-bordered rectangle (danger indicator, no rounding)
    map.insert(
        "loss".into(),
        Box::new(|_nt, x, y, w, h, fill, _stroke| {
            format!(
                "<rect x=\"{x}\" y=\"{y}\" width=\"{w}\" height=\"{h}\" rx=\"0\" ry=\"0\" fill=\"{fill}\" stroke=\"#dc3545\" stroke-width=\"2.5\"/>"
            )
        }),
    );

    // hazard → triangle (warning shape)
    map.insert(
        "hazard".into(),
        Box::new(|_nt, x, y, w, h, fill, stroke| {
            let cx = x + w / 2.0;
            format!(
                r#"<polygon points="{},{} {},{} {},{}" fill="{fill}" stroke="{stroke}" stroke-width="1.5"/>"#,
                cx, y,          // top center
                x + w, y + h,   // bottom right
                x, y + h,       // bottom left
            )
        }),
    );

    // system-constraint → octagon
    map.insert(
        "system-constraint".into(),
        Box::new(|_nt, x, y, w, h, fill, stroke| {
            let ox = w * 0.25; // corner cut
            let oy = h * 0.25;
            format!(
                r#"<polygon points="{},{} {},{} {},{} {},{} {},{} {},{} {},{} {},{}" fill="{fill}" stroke="{stroke}" stroke-width="1.5"/>"#,
                x + ox, y,
                x + w - ox, y,
                x + w, y + oy,
                x + w, y + h - oy,
                x + w - ox, y + h,
                x + ox, y + h,
                x, y + h - oy,
                x, y + oy,
            )
        }),
    );

    // safety-constraint → same octagon shape as system-constraint
    map.insert(
        "safety-constraint".into(),
        Box::new(|_nt, x, y, w, h, fill, stroke| {
            let ox = w * 0.25;
            let oy = h * 0.25;
            format!(
                r#"<polygon points="{},{} {},{} {},{} {},{} {},{} {},{} {},{} {},{}" fill="{fill}" stroke="{stroke}" stroke-width="1.5"/>"#,
                x + ox, y,
                x + w - ox, y,
                x + w, y + oy,
                x + w, y + h - oy,
                x + w - ox, y + h,
                x + ox, y + h,
                x, y + h - oy,
                x, y + oy,
            )
        }),
    );

    // uca → parallelogram (slanted right)
    map.insert(
        "uca".into(),
        Box::new(|_nt, x, y, w, h, fill, stroke| {
            let skew = w * 0.12; // horizontal skew amount
            format!(
                r#"<polygon points="{},{} {},{} {},{} {},{}" fill="{fill}" stroke="{stroke}" stroke-width="1.5"/>"#,
                x + skew, y,        // top left (shifted right)
                x + w, y,           // top right
                x + w - skew, y + h,// bottom right (shifted left)
                x, y + h,           // bottom left
            )
        }),
    );

    // test / verification → rounded rect with a checkmark-style badge border
    for type_name in &["test", "verification", "sw-verification", "system-verification",
                        "sw-unit-verification", "sw-integration-verification",
                        "system-integration-verification", "qualification-verification"] {
        map.insert(
            type_name.to_string(),
            Box::new(|_nt, x, y, w, h, fill, stroke| {
                format!(
                    r#"<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="6" ry="6" fill="{fill}" stroke="{stroke}" stroke-width="1.5" stroke-dasharray="4 2"/>"#
                )
            }),
        );
    }

    map
}

/// Return a colored badge `<span>` for an artifact type.
///
/// Uses the `type_color_map` hex color as text and computes a 12%-opacity
/// tinted background from it.
pub(crate) fn badge_for_type(type_name: &str) -> String {
    let colors = type_color_map();
    let hex = colors
        .get(type_name)
        .map(|s| s.as_str())
        .unwrap_or("#5b2d9e");
    // Parse hex → rgb
    let hex_digits = hex.trim_start_matches('#');
    let r = u8::from_str_radix(&hex_digits[0..2], 16).unwrap_or(91);
    let g = u8::from_str_radix(&hex_digits[2..4], 16).unwrap_or(45);
    let b = u8::from_str_radix(&hex_digits[4..6], 16).unwrap_or(158);
    format!(
        "<span class=\"badge\" style=\"background:rgba({r},{g},{b},.12);color:{hex};font-family:var(--mono);font-size:.72rem\">{}</span>",
        html_escape(type_name)
    )
}
