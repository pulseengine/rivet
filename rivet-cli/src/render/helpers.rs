use std::collections::HashMap;

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
