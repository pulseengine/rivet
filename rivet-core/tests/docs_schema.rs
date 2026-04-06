//! Integration tests for embedded schema loading, fallback, and content.
//!
//! These tests verify that schemas compiled into the binary via `include_str!`
//! are accessible, parseable, and usable as fallbacks when disk files are absent.

use std::path::PathBuf;

// ── Embedded schema loading ──────────────────────────────────────────────

/// `load_embedded_schema("common")` parses successfully and has the expected
/// schema name.
// rivet: verifies REQ-010
#[test]
fn embedded_schema_common_loads() {
    let schema_file =
        rivet_core::embedded::load_embedded_schema("common").expect("common schema must load");
    assert_eq!(schema_file.schema.name, "common");
}

/// `load_embedded_schema("dev")` parses successfully.
// rivet: verifies REQ-010
#[test]
fn embedded_schema_dev_loads() {
    let schema_file =
        rivet_core::embedded::load_embedded_schema("dev").expect("dev schema must load");
    assert_eq!(schema_file.schema.name, "dev");
    assert!(
        !schema_file.artifact_types.is_empty(),
        "dev schema must define artifact types"
    );
}

/// All known embedded schemas load successfully.
// rivet: verifies REQ-010
#[test]
fn all_embedded_schemas_load() {
    for name in rivet_core::embedded::SCHEMA_NAMES {
        let schema_file = rivet_core::embedded::load_embedded_schema(name)
            .unwrap_or_else(|e| panic!("embedded schema '{name}' must load: {e}"));
        assert_eq!(
            &schema_file.schema.name, name,
            "schema name field must match the lookup key"
        );
    }
}

/// Unknown schema names return an error from `load_embedded_schema`.
// rivet: verifies REQ-010
#[test]
fn embedded_schema_unknown_returns_err() {
    let result = rivet_core::embedded::load_embedded_schema("nonexistent-schema");
    assert!(result.is_err(), "unknown schema name must return Err");
    let err_msg = format!("{}", result.unwrap_err());
    assert!(
        err_msg.contains("unknown built-in schema"),
        "error message should mention 'unknown built-in schema', got: {err_msg}"
    );
}

/// `embedded_schema()` returns `None` for unknown names.
// rivet: verifies REQ-010
#[test]
fn embedded_schema_lookup_none_for_unknown() {
    assert!(rivet_core::embedded::embedded_schema("does-not-exist").is_none());
}

/// `embedded_schema()` returns `Some` for all known names.
// rivet: verifies REQ-010
#[test]
fn embedded_schema_lookup_some_for_known() {
    for name in rivet_core::embedded::SCHEMA_NAMES {
        assert!(
            rivet_core::embedded::embedded_schema(name).is_some(),
            "embedded_schema(\"{name}\") must return Some"
        );
    }
}

// ── Schema fallback ──────────────────────────────────────────────────────

/// When the schemas directory does not contain the requested files,
/// `load_schemas_with_fallback` falls back to the embedded copies.
// rivet: verifies REQ-010
#[test]
fn schema_fallback_uses_embedded_when_dir_missing() {
    // Point at a directory that definitely does not contain schema YAML files.
    let fake_dir = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("tests");

    let names: Vec<String> = vec!["common".into(), "dev".into()];
    let schema = rivet_core::embedded::load_schemas_with_fallback(&names, &fake_dir)
        .expect("fallback must succeed");

    // The merged schema should contain dev types (requirement, design-decision, feature).
    assert!(
        schema.artifact_type("requirement").is_some(),
        "fallback-loaded schema must contain 'requirement' type"
    );
    assert!(
        schema.artifact_type("design-decision").is_some(),
        "fallback-loaded schema must contain 'design-decision' type"
    );
    assert!(
        schema.artifact_type("feature").is_some(),
        "fallback-loaded schema must contain 'feature' type"
    );
}

/// Fallback with STPA schemas produces a schema containing STPA types.
// rivet: verifies REQ-010
#[test]
fn schema_fallback_stpa() {
    let fake_dir = PathBuf::from("/tmp/rivet-test-nonexistent-dir");

    let names: Vec<String> = vec!["common".into(), "stpa".into()];
    let schema = rivet_core::embedded::load_schemas_with_fallback(&names, &fake_dir)
        .expect("fallback must succeed for stpa");

    assert!(schema.artifact_type("loss").is_some());
    assert!(schema.artifact_type("hazard").is_some());
    assert!(schema.artifact_type("uca").is_some());
    assert!(schema.link_type("leads-to-loss").is_some());
}

/// Fallback ignores completely unknown schema names (logs a warning but
/// returns an error for unknown schema names so users notice typos.
// rivet: verifies REQ-010
#[test]
fn schema_fallback_unknown_name_errors() {
    let fake_dir = PathBuf::from("/tmp/rivet-test-nonexistent-dir");

    let names: Vec<String> = vec!["common".into(), "totally-unknown-name".into()];
    let result = rivet_core::embedded::load_schemas_with_fallback(&names, &fake_dir);
    assert!(
        result.is_err(),
        "unknown schema name should produce an error"
    );
    let msg = result.unwrap_err().to_string();
    assert!(
        msg.contains("totally-unknown-name"),
        "error should mention the unknown schema name, got: {msg}"
    );
}

// ── Embedded schema content ──────────────────────────────────────────────

/// The embedded SCHEMA_COMMON constant is non-empty and contains expected content.
// rivet: verifies REQ-010
#[test]
fn schema_common_content_non_empty() {
    assert!(
        !rivet_core::embedded::SCHEMA_COMMON.is_empty(),
        "SCHEMA_COMMON must not be empty"
    );
    assert!(
        rivet_core::embedded::SCHEMA_COMMON.contains("common"),
        "SCHEMA_COMMON must contain 'common'"
    );
}

/// The embedded SCHEMA_DEV constant is non-empty and mentions 'requirement'.
// rivet: verifies REQ-010
#[test]
fn schema_dev_content_non_empty() {
    assert!(
        !rivet_core::embedded::SCHEMA_DEV.is_empty(),
        "SCHEMA_DEV must not be empty"
    );
    assert!(
        rivet_core::embedded::SCHEMA_DEV.contains("requirement"),
        "SCHEMA_DEV must mention 'requirement' type"
    );
}

/// The embedded SCHEMA_STPA constant is non-empty and mentions 'loss'.
// rivet: verifies REQ-010
#[test]
fn schema_stpa_content_non_empty() {
    assert!(!rivet_core::embedded::SCHEMA_STPA.is_empty());
    assert!(rivet_core::embedded::SCHEMA_STPA.contains("loss"));
}

/// The embedded SCHEMA_ASPICE constant is non-empty and mentions 'sw-req'.
// rivet: verifies REQ-010
#[test]
fn schema_aspice_content_non_empty() {
    assert!(!rivet_core::embedded::SCHEMA_ASPICE.is_empty());
    assert!(rivet_core::embedded::SCHEMA_ASPICE.contains("sw-req"));
}

/// The embedded SCHEMA_CYBERSECURITY constant is non-empty.
// rivet: verifies REQ-010
#[test]
fn schema_cybersecurity_content_non_empty() {
    assert!(!rivet_core::embedded::SCHEMA_CYBERSECURITY.is_empty());
    assert!(rivet_core::embedded::SCHEMA_CYBERSECURITY.contains("threat-scenario"));
}

/// The embedded SCHEMA_AADL constant is non-empty.
// rivet: verifies REQ-010
#[test]
fn schema_aadl_content_non_empty() {
    assert!(!rivet_core::embedded::SCHEMA_AADL.is_empty());
    assert!(rivet_core::embedded::SCHEMA_AADL.contains("aadl"));
}

/// All embedded schema constants are valid YAML that can be parsed into SchemaFile.
// rivet: verifies REQ-010
#[test]
fn all_embedded_constants_parse_as_yaml() {
    let all: &[(&str, &str)] = &[
        ("common", rivet_core::embedded::SCHEMA_COMMON),
        ("dev", rivet_core::embedded::SCHEMA_DEV),
        ("stpa", rivet_core::embedded::SCHEMA_STPA),
        ("aspice", rivet_core::embedded::SCHEMA_ASPICE),
        ("cybersecurity", rivet_core::embedded::SCHEMA_CYBERSECURITY),
        ("aadl", rivet_core::embedded::SCHEMA_AADL),
    ];

    for (name, content) in all {
        let parsed: Result<rivet_core::schema::SchemaFile, _> = serde_yaml::from_str(content);
        assert!(
            parsed.is_ok(),
            "embedded schema constant for '{name}' must be valid YAML: {:?}",
            parsed.err()
        );
    }
}

// ── Bridge schema auto-discovery ────────────────────────────────────────

/// All embedded bridge schema constants parse as valid SchemaFile YAML.
// rivet: verifies REQ-010
#[test]
fn all_bridge_schemas_parse_as_yaml() {
    for bridge in rivet_core::embedded::BRIDGE_SCHEMAS {
        let parsed: Result<rivet_core::schema::SchemaFile, _> =
            serde_yaml::from_str(bridge.content);
        assert!(
            parsed.is_ok(),
            "bridge schema '{}' must be valid YAML: {:?}",
            bridge.filename,
            parsed.err()
        );
    }
}

/// `discover_bridges` returns the stpa-dev bridge when stpa and dev are loaded.
// rivet: verifies REQ-010
#[test]
fn discover_bridge_stpa_dev() {
    let schemas: Vec<String> = vec!["common".into(), "stpa".into(), "dev".into()];
    let bridges = rivet_core::embedded::discover_bridges(&schemas);
    assert!(
        bridges.contains(&"stpa-dev.bridge"),
        "stpa + dev should discover stpa-dev bridge, got: {bridges:?}"
    );
}

/// `discover_bridges` returns the eu-ai-act-stpa bridge when both schemas are loaded.
// rivet: verifies REQ-010
#[test]
fn discover_bridge_eu_ai_act_stpa() {
    let schemas: Vec<String> = vec!["common".into(), "eu-ai-act".into(), "stpa".into()];
    let bridges = rivet_core::embedded::discover_bridges(&schemas);
    assert!(
        bridges.contains(&"eu-ai-act-stpa.bridge"),
        "eu-ai-act + stpa should discover eu-ai-act-stpa bridge, got: {bridges:?}"
    );
}

/// `discover_bridges` returns nothing when schemas do not pair.
// rivet: verifies REQ-010
#[test]
fn discover_bridge_no_match() {
    let schemas: Vec<String> = vec!["common".into(), "cybersecurity".into()];
    let bridges = rivet_core::embedded::discover_bridges(&schemas);
    assert!(
        bridges.is_empty(),
        "cybersecurity alone should match no bridges, got: {bridges:?}"
    );
}

/// `discover_bridges` returns multiple bridges when several pairs are present.
// rivet: verifies REQ-010
#[test]
fn discover_bridge_multiple() {
    let schemas: Vec<String> = vec![
        "common".into(),
        "stpa".into(),
        "dev".into(),
        "eu-ai-act".into(),
    ];
    let bridges = rivet_core::embedded::discover_bridges(&schemas);
    assert!(
        bridges.contains(&"stpa-dev.bridge"),
        "should include stpa-dev bridge"
    );
    assert!(
        bridges.contains(&"eu-ai-act-stpa.bridge"),
        "should include eu-ai-act-stpa bridge"
    );
}

/// `load_schemas_with_fallback` auto-loads bridge link types.
///
/// When stpa + dev are both in the schema list, the stpa-dev bridge's
/// link types (like `constraint-satisfies`) should appear in the merged schema.
// rivet: verifies REQ-010
#[test]
fn fallback_auto_loads_bridge_link_types() {
    let fake_dir = PathBuf::from("/tmp/rivet-test-nonexistent-dir");
    let names: Vec<String> = vec!["common".into(), "stpa".into(), "dev".into()];
    let schema = rivet_core::embedded::load_schemas_with_fallback(&names, &fake_dir)
        .expect("fallback must succeed");

    // The stpa-dev bridge defines `constraint-satisfies`.
    assert!(
        schema.link_type("constraint-satisfies").is_some(),
        "auto-loaded stpa-dev bridge should add 'constraint-satisfies' link type"
    );
}

/// `load_schemas_with_fallback` auto-loads bridge traceability rules.
// rivet: verifies REQ-010
#[test]
fn fallback_auto_loads_bridge_traceability_rules() {
    let fake_dir = PathBuf::from("/tmp/rivet-test-nonexistent-dir");
    let names: Vec<String> = vec!["common".into(), "eu-ai-act".into(), "stpa".into()];
    let schema = rivet_core::embedded::load_schemas_with_fallback(&names, &fake_dir)
        .expect("fallback must succeed");

    // The eu-ai-act-stpa bridge defines link type `risk-identified-by-stpa`.
    assert!(
        schema.link_type("risk-identified-by-stpa").is_some(),
        "auto-loaded eu-ai-act-stpa bridge should add 'risk-identified-by-stpa' link type"
    );

    // It also defines traceability rule `stpa-hazards-map-to-risks`.
    assert!(
        schema
            .traceability_rules
            .iter()
            .any(|r| r.name == "stpa-hazards-map-to-risks"),
        "auto-loaded eu-ai-act-stpa bridge should add 'stpa-hazards-map-to-risks' rule"
    );
}

/// `load_schema_contents` also discovers bridges.
// rivet: verifies REQ-010
#[test]
fn load_schema_contents_discovers_bridges() {
    let fake_dir = PathBuf::from("/tmp/rivet-test-nonexistent-dir");
    let names: Vec<String> = vec!["common".into(), "stpa".into(), "dev".into()];
    let contents = rivet_core::embedded::load_schema_contents(&names, &fake_dir);

    let loaded_names: Vec<&str> = contents.iter().map(|(n, _)| n.as_str()).collect();
    assert!(
        loaded_names.contains(&"stpa-dev.bridge"),
        "load_schema_contents should include stpa-dev bridge, got: {loaded_names:?}"
    );
}

/// `embedded_bridge` returns content for known bridges.
// rivet: verifies REQ-010
#[test]
fn embedded_bridge_lookup() {
    assert!(rivet_core::embedded::embedded_bridge("stpa-dev.bridge").is_some());
    assert!(rivet_core::embedded::embedded_bridge("eu-ai-act-stpa.bridge").is_some());
    assert!(rivet_core::embedded::embedded_bridge("nonexistent.bridge").is_none());
}

/// iso-8800-stpa bridge requires three schemas: iso-pas-8800, stpa, stpa-ai.
// rivet: verifies REQ-010
#[test]
fn discover_bridge_iso_8800_requires_three_schemas() {
    // Missing stpa-ai — should NOT match.
    let schemas: Vec<String> = vec!["common".into(), "iso-pas-8800".into(), "stpa".into()];
    let bridges = rivet_core::embedded::discover_bridges(&schemas);
    assert!(
        !bridges.contains(&"iso-8800-stpa.bridge"),
        "iso-8800-stpa bridge requires stpa-ai too, got: {bridges:?}"
    );

    // All three present — should match.
    let schemas: Vec<String> = vec![
        "common".into(),
        "iso-pas-8800".into(),
        "stpa".into(),
        "stpa-ai".into(),
    ];
    let bridges = rivet_core::embedded::discover_bridges(&schemas);
    assert!(
        bridges.contains(&"iso-8800-stpa.bridge"),
        "iso-8800-stpa bridge should match when all three deps present, got: {bridges:?}"
    );
}
