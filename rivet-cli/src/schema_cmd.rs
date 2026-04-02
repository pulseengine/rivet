//! `rivet schema` subcommand — introspect loaded schemas.
//!
//! Provides `list`, `show`, `links`, `rules` for both humans and AI agents.

use std::collections::HashSet;

use rivet_core::schema::{Cardinality, Schema, Severity};

/// List all artifact types.
pub fn cmd_list(schema: &Schema, format: &str) -> String {
    let mut types: Vec<_> = schema.artifact_types.values().collect();
    types.sort_by_key(|t| &t.name);

    if format == "json" {
        let items: Vec<serde_json::Value> = types
            .iter()
            .map(|t| {
                serde_json::json!({
                    "name": t.name,
                    "description": t.description,
                    "fields": t.fields.len(),
                    "link_fields": t.link_fields.len(),
                    "aspice_process": t.aspice_process,
                })
            })
            .collect();
        serde_json::to_string_pretty(&serde_json::json!({
            "command": "schema-list",
            "count": items.len(),
            "artifact_types": items,
        }))
        .unwrap_or_default()
    } else {
        let mut out = String::new();
        out.push_str(&format!("Artifact types ({}):\n\n", types.len()));
        for t in &types {
            let proc = t
                .aspice_process
                .as_deref()
                .map(|p| format!(" ({p})"))
                .unwrap_or_default();
            out.push_str(&format!("  {:<30} {}{}\n", t.name, t.description, proc));
        }
        out.push_str("\nUse: rivet schema show <type>\n");
        out
    }
}

/// Show detailed info for a single artifact type, including an example YAML snippet.
pub fn cmd_show(schema: &Schema, name: &str, format: &str) -> String {
    let Some(t) = schema.artifact_type(name) else {
        return format!(
            "Unknown artifact type: {name}\n\nAvailable: {}\n",
            schema
                .artifact_types
                .keys()
                .cloned()
                .collect::<Vec<_>>()
                .join(", ")
        );
    };

    if format == "json" {
        let fields: Vec<serde_json::Value> = t
            .fields
            .iter()
            .map(|f| {
                serde_json::json!({
                    "name": f.name,
                    "type": f.field_type,
                    "required": f.required,
                    "description": f.description,
                    "allowed_values": f.allowed_values,
                })
            })
            .collect();
        let link_fields: Vec<serde_json::Value> = t
            .link_fields
            .iter()
            .map(|lf| {
                serde_json::json!({
                    "name": lf.name,
                    "link_type": lf.link_type,
                    "target_types": lf.target_types,
                    "required": lf.required,
                    "cardinality": format!("{:?}", lf.cardinality),
                })
            })
            .collect();
        let rules: Vec<serde_json::Value> = schema
            .traceability_rules
            .iter()
            .filter(|r| r.source_type == t.name)
            .map(|r| {
                serde_json::json!({
                    "name": r.name,
                    "description": r.description,
                    "severity": format!("{:?}", r.severity),
                    "required_link": r.required_link,
                    "required_backlink": r.required_backlink,
                    "target_types": r.target_types,
                    "from_types": r.from_types,
                })
            })
            .collect();
        let example = generate_example_yaml(t, schema);
        let mistakes: Vec<serde_json::Value> = t
            .common_mistakes
            .iter()
            .map(|m| {
                serde_json::json!({
                    "problem": m.problem,
                    "fix_command": m.fix_command,
                })
            })
            .collect();
        return serde_json::to_string_pretty(&serde_json::json!({
            "command": "schema-show",
            "artifact_type": {
                "name": t.name,
                "description": t.description,
                "aspice_process": t.aspice_process,
                "fields": fields,
                "link_fields": link_fields,
                "traceability_rules": rules,
                "example_yaml": t.example.as_deref().unwrap_or(&example),
                "common_mistakes": mistakes,
            }
        }))
        .unwrap_or_default();
    }

    let mut out = String::new();
    out.push_str(&format!("Type: {}\n", t.name));
    out.push_str(&format!("Description: {}\n", t.description));
    if let Some(ref proc) = t.aspice_process {
        out.push_str(&format!("ASPICE Process: {proc}\n"));
    }

    // Fields
    if !t.fields.is_empty() {
        out.push_str("\nFields:\n");
        for f in &t.fields {
            let req = if f.required { "required" } else { "optional" };
            let vals = f
                .allowed_values
                .as_ref()
                .map(|v| format!("  [{}]", v.join(", ")))
                .unwrap_or_default();
            out.push_str(&format!(
                "  {:<24} {:<10} {}{}\n",
                f.name, f.field_type, req, vals
            ));
        }
    }

    // Link fields
    if !t.link_fields.is_empty() {
        out.push_str("\nLink fields:\n");
        for lf in &t.link_fields {
            let req = if lf.required { "required" } else { "optional" };
            let card = match lf.cardinality {
                Cardinality::ExactlyOne => "exactly-one",
                Cardinality::ZeroOrMany => "zero-or-many",
                Cardinality::ZeroOrOne => "zero-or-one",
                Cardinality::OneOrMany => "one-or-many",
            };
            let targets = if lf.target_types.is_empty() {
                "any".to_string()
            } else {
                lf.target_types.join(", ")
            };
            out.push_str(&format!(
                "  {:<24} {} -> [{}]  {}  {}\n",
                lf.name, lf.link_type, targets, req, card
            ));
        }
    }

    // Traceability rules
    let rules: Vec<_> = schema
        .traceability_rules
        .iter()
        .filter(|r| r.source_type == t.name)
        .collect();
    if !rules.is_empty() {
        out.push_str("\nTraceability rules:\n");
        for r in &rules {
            let sev = match r.severity {
                Severity::Error => "error",
                Severity::Warning => "warning",
                Severity::Info => "info",
            };
            out.push_str(&format!("  {} ({}): {}\n", r.name, sev, r.description));
            if let Some(ref link) = r.required_link {
                out.push_str(&format!(
                    "    required link: {} -> [{}]\n",
                    link,
                    r.target_types.join(", ")
                ));
            }
            if let Some(ref bl) = r.required_backlink {
                out.push_str(&format!(
                    "    required backlink: {} from [{}]\n",
                    bl,
                    r.from_types.join(", ")
                ));
            }
        }
    }

    // Common mistakes
    if !t.common_mistakes.is_empty() {
        out.push_str("\nCommon mistakes:\n");
        for m in &t.common_mistakes {
            out.push_str(&format!("  ⚠ {}\n", m.problem));
            if let Some(ref fix) = m.fix_command {
                out.push_str(&format!("    fix: {fix}\n"));
            }
        }
    }

    // Example
    out.push_str("\nExample:\n");
    if let Some(ref ex) = t.example {
        out.push_str(ex);
    } else {
        out.push_str(&generate_example_yaml(t, schema));
    }

    out
}

/// List all link types.
pub fn cmd_links(schema: &Schema, format: &str) -> String {
    let mut links: Vec<_> = schema.link_types.values().collect();
    links.sort_by_key(|l| &l.name);

    if format == "json" {
        let items: Vec<serde_json::Value> = links
            .iter()
            .map(|l| {
                serde_json::json!({
                    "name": l.name,
                    "inverse": l.inverse,
                    "description": l.description,
                    "source_types": l.source_types,
                    "target_types": l.target_types,
                })
            })
            .collect();
        return serde_json::to_string_pretty(&serde_json::json!({
            "command": "schema-links",
            "count": items.len(),
            "link_types": items,
        }))
        .unwrap_or_default();
    }

    let mut out = String::new();
    out.push_str(&format!("Link types ({}):\n\n", links.len()));
    out.push_str(&format!(
        "  {:<24} {:<24} {}\n",
        "Name", "Inverse", "Description"
    ));
    out.push_str(&format!("  {}\n", "-".repeat(72)));
    for l in &links {
        let inv = l.inverse.as_deref().unwrap_or("-");
        out.push_str(&format!("  {:<24} {:<24} {}\n", l.name, inv, l.description));
    }
    out
}

/// List all traceability rules.
pub fn cmd_rules(schema: &Schema, format: &str) -> String {
    if format == "json" {
        let items: Vec<serde_json::Value> = schema
            .traceability_rules
            .iter()
            .map(|r| {
                serde_json::json!({
                    "name": r.name,
                    "description": r.description,
                    "source_type": r.source_type,
                    "severity": format!("{:?}", r.severity),
                    "required_link": r.required_link,
                    "required_backlink": r.required_backlink,
                    "target_types": r.target_types,
                    "from_types": r.from_types,
                })
            })
            .collect();
        return serde_json::to_string_pretty(&serde_json::json!({
            "command": "schema-rules",
            "count": items.len(),
            "rules": items,
        }))
        .unwrap_or_default();
    }

    let mut out = String::new();
    out.push_str(&format!(
        "Traceability rules ({}):\n\n",
        schema.traceability_rules.len()
    ));
    for r in &schema.traceability_rules {
        let sev = match r.severity {
            Severity::Error => "ERROR  ",
            Severity::Warning => "WARN   ",
            Severity::Info => "INFO   ",
        };
        out.push_str(&format!("  {} {:<36} {}\n", sev, r.name, r.source_type));
        out.push_str(&format!("         {}\n", r.description));
    }
    out
}

// ── Example YAML generation ─────────────────────────────────────────────

/// Public wrapper for use by the help renderer.
pub fn generate_example_yaml_pub(
    t: &rivet_core::schema::ArtifactTypeDef,
    schema: &Schema,
) -> String {
    generate_example_yaml(t, schema)
}

fn generate_example_yaml(t: &rivet_core::schema::ArtifactTypeDef, _schema: &Schema) -> String {
    let mut out = String::new();
    let id_prefix = t
        .name
        .split('-')
        .map(|w| {
            let mut c = w.chars();
            match c.next() {
                Some(ch) => ch.to_uppercase().to_string(),
                None => String::new(),
            }
        })
        .collect::<Vec<_>>()
        .join("");

    out.push_str(&format!("  - id: {}-001\n", id_prefix));
    out.push_str(&format!("    type: {}\n", t.name));
    out.push_str(&format!("    title: Example {}\n", t.name));
    out.push_str("    status: draft\n");
    out.push_str("    description: >\n");
    out.push_str(&format!("      Describe this {}.\n", t.name));
    out.push_str("    tags: [example]\n");

    // Links
    if !t.link_fields.is_empty() {
        out.push_str("    links:\n");
        for lf in &t.link_fields {
            let target_hint = lf
                .target_types
                .first()
                .map(|tt| {
                    let prefix: String = tt
                        .split('-')
                        .map(|w| {
                            let mut c = w.chars();
                            match c.next() {
                                Some(ch) => ch.to_uppercase().to_string(),
                                None => String::new(),
                            }
                        })
                        .collect();
                    format!("{prefix}-001")
                })
                .unwrap_or_else(|| "TARGET-001".to_string());
            out.push_str(&format!("      - type: {}\n", lf.link_type));
            out.push_str(&format!("        target: {}\n", target_hint));
        }
    }

    // Fields
    if !t.fields.is_empty() {
        out.push_str("    fields:\n");
        for f in &t.fields {
            let val = if let Some(ref vals) = f.allowed_values {
                vals.first().cloned().unwrap_or_else(|| "value".to_string())
            } else {
                match f.field_type.as_str() {
                    "number" => "0".to_string(),
                    "boolean" => "true".to_string(),
                    "text" => ">\n        Description text.".to_string(),
                    "structured" => "{}".to_string(),
                    _ => format!("example-{}", f.name),
                }
            };
            let comment = if !f.required { "  # optional" } else { "" };
            out.push_str(&format!("      {}: {}{}\n", f.name, val, comment));
        }
    }

    out
}

/// Validate that loaded schemas are well-formed.
pub fn cmd_validate(schema: &Schema) -> String {
    let mut issues: Vec<(String, String)> = Vec::new();
    let type_names: HashSet<&str> = schema.artifact_types.keys().map(|s| s.as_str()).collect();
    let link_names: HashSet<&str> = schema.link_types.keys().map(|s| s.as_str()).collect();

    // Check traceability rules
    for rule in &schema.traceability_rules {
        if !type_names.contains(rule.source_type.as_str()) {
            issues.push((
                "ERROR".into(),
                format!(
                    "rule '{}': source-type '{}' not a known artifact type",
                    rule.name, rule.source_type
                ),
            ));
        }
        if let Some(ref link) = rule.required_link {
            if !link_names.contains(link.as_str()) {
                issues.push((
                    "ERROR".into(),
                    format!(
                        "rule '{}': required-link '{}' not a known link type",
                        rule.name, link
                    ),
                ));
            }
        }
        if let Some(ref link) = rule.required_backlink {
            if !link_names.contains(link.as_str()) {
                issues.push((
                    "ERROR".into(),
                    format!(
                        "rule '{}': required-backlink '{}' not a known link type",
                        rule.name, link
                    ),
                ));
            }
        }
        for target in &rule.target_types {
            if !type_names.contains(target.as_str()) {
                issues.push((
                    "WARN".into(),
                    format!(
                        "rule '{}': target-type '{}' not a known artifact type",
                        rule.name, target
                    ),
                ));
            }
        }
        for from in &rule.from_types {
            if !type_names.contains(from.as_str()) {
                issues.push((
                    "WARN".into(),
                    format!(
                        "rule '{}': from-type '{}' not a known artifact type",
                        rule.name, from
                    ),
                ));
            }
        }
    }

    // Check link-fields on artifact types
    for type_def in schema.artifact_types.values() {
        for lf in &type_def.link_fields {
            if !link_names.contains(lf.link_type.as_str()) {
                issues.push((
                    "ERROR".into(),
                    format!(
                        "type '{}': link-field '{}' references unknown link type '{}'",
                        type_def.name, lf.name, lf.link_type
                    ),
                ));
            }
            for target in &lf.target_types {
                if !type_names.contains(target.as_str()) {
                    issues.push((
                        "WARN".into(),
                        format!(
                            "type '{}': link-field '{}' references unknown target type '{}'",
                            type_def.name, lf.name, target
                        ),
                    ));
                }
            }
        }
    }

    let errors = issues.iter().filter(|(s, _)| s == "ERROR").count();
    let warnings = issues.iter().filter(|(s, _)| s == "WARN").count();

    if issues.is_empty() {
        return format!(
            "Schema valid: {} artifact types, {} link types, {} rules\n",
            schema.artifact_types.len(),
            schema.link_types.len(),
            schema.traceability_rules.len(),
        );
    }

    let mut out = String::from("Schema validation:\n\n");
    for (severity, message) in &issues {
        out.push_str(&format!("  {severity}: {message}\n"));
    }
    out.push_str(&format!(
        "\nResult: {errors} error(s), {warnings} warning(s)\n"
    ));
    out
}
