//! Integration tests for the supply-chain schema.
//!
//! Verifies that the supply-chain schema loads correctly, defines the
//! expected artifact types, link types, and traceability rules, and can
//! be merged with common for validation.

use std::path::PathBuf;

// ── Schema loading ──────────────────────────────────────────────────────

/// The embedded supply-chain schema loads and has the correct name.
#[test]
fn supply_chain_schema_loads() {
    let schema_file = rivet_core::embedded::load_embedded_schema("supply-chain")
        .expect("supply-chain schema must load");
    assert_eq!(schema_file.schema.name, "supply-chain");
}

/// The embedded supply-chain schema constant is non-empty and mentions
/// expected content.
#[test]
fn supply_chain_content_non_empty() {
    assert!(
        !rivet_core::embedded::SCHEMA_SUPPLY_CHAIN.is_empty(),
        "SCHEMA_SUPPLY_CHAIN must not be empty"
    );
    assert!(
        rivet_core::embedded::SCHEMA_SUPPLY_CHAIN.contains("sbom-component"),
        "SCHEMA_SUPPLY_CHAIN must mention 'sbom-component'"
    );
}

/// The supply-chain schema YAML parses into a valid SchemaFile.
#[test]
fn supply_chain_parses_as_schema_file() {
    let parsed: Result<rivet_core::schema::SchemaFile, _> =
        serde_yaml::from_str(rivet_core::embedded::SCHEMA_SUPPLY_CHAIN);
    assert!(
        parsed.is_ok(),
        "supply-chain schema must be valid YAML: {:?}",
        parsed.err()
    );
}

// ── Artifact types ──────────────────────────────────────────────────────

/// The schema defines all four expected artifact types.
#[test]
fn supply_chain_defines_artifact_types() {
    let schema_file = rivet_core::embedded::load_embedded_schema("supply-chain")
        .expect("supply-chain schema must load");

    let type_names: Vec<&str> = schema_file
        .artifact_types
        .iter()
        .map(|t| t.name.as_str())
        .collect();

    assert!(
        type_names.contains(&"sbom-component"),
        "must define sbom-component"
    );
    assert!(
        type_names.contains(&"build-attestation"),
        "must define build-attestation"
    );
    assert!(
        type_names.contains(&"vulnerability"),
        "must define vulnerability"
    );
    assert!(
        type_names.contains(&"release-artifact"),
        "must define release-artifact"
    );
}

/// sbom-component has the expected fields.
#[test]
fn sbom_component_has_expected_fields() {
    let schema_file = rivet_core::embedded::load_embedded_schema("supply-chain")
        .expect("supply-chain schema must load");

    let sbom = schema_file
        .artifact_types
        .iter()
        .find(|t| t.name == "sbom-component")
        .expect("sbom-component type must exist");

    let field_names: Vec<&str> = sbom.fields.iter().map(|f| f.name.as_str()).collect();
    assert!(field_names.contains(&"component-name"));
    assert!(field_names.contains(&"version"));
    assert!(field_names.contains(&"license"));
    assert!(field_names.contains(&"purl"));
}

/// vulnerability has required fields including cve-id and severity.
#[test]
fn vulnerability_has_expected_fields() {
    let schema_file = rivet_core::embedded::load_embedded_schema("supply-chain")
        .expect("supply-chain schema must load");

    let vuln = schema_file
        .artifact_types
        .iter()
        .find(|t| t.name == "vulnerability")
        .expect("vulnerability type must exist");

    let field_names: Vec<&str> = vuln.fields.iter().map(|f| f.name.as_str()).collect();
    assert!(field_names.contains(&"cve-id"));
    assert!(field_names.contains(&"severity"));
    assert!(field_names.contains(&"vuln-status"));
}

// ── Link types ──────────────────────────────────────────────────────────

/// The schema defines expected link types.
#[test]
fn supply_chain_defines_link_types() {
    let schema_file = rivet_core::embedded::load_embedded_schema("supply-chain")
        .expect("supply-chain schema must load");

    let link_names: Vec<&str> = schema_file
        .link_types
        .iter()
        .map(|l| l.name.as_str())
        .collect();

    assert!(
        link_names.contains(&"attests-build-of"),
        "must define attests-build-of"
    );
    assert!(link_names.contains(&"affects"), "must define affects");
    assert!(link_names.contains(&"contains"), "must define contains");
}

/// Link types have inverse names set.
#[test]
fn supply_chain_link_types_have_inverses() {
    let schema_file = rivet_core::embedded::load_embedded_schema("supply-chain")
        .expect("supply-chain schema must load");

    for link in &schema_file.link_types {
        assert!(
            link.inverse.is_some(),
            "link type '{}' must have an inverse",
            link.name
        );
    }
}

// ── Traceability rules ──────────────────────────────────────────────────

/// The schema defines traceability rules.
#[test]
fn supply_chain_has_traceability_rules() {
    let schema_file = rivet_core::embedded::load_embedded_schema("supply-chain")
        .expect("supply-chain schema must load");

    assert!(
        !schema_file.traceability_rules.is_empty(),
        "supply-chain schema must have traceability rules"
    );

    let rule_names: Vec<&str> = schema_file
        .traceability_rules
        .iter()
        .map(|r| r.name.as_str())
        .collect();

    assert!(
        rule_names.contains(&"release-has-attestation"),
        "must have release-has-attestation rule"
    );
    assert!(
        rule_names.contains(&"vulnerability-has-affected-component"),
        "must have vulnerability-has-affected-component rule"
    );
}

// ── Schema merge with common ────────────────────────────────────────────

/// Supply-chain schema merges with common and provides all types via the
/// merged Schema object.
#[test]
fn supply_chain_merges_with_common() {
    let fake_dir = PathBuf::from("/tmp/rivet-test-nonexistent-dir");

    let names: Vec<String> = vec!["common".into(), "supply-chain".into()];
    let schema = rivet_core::embedded::load_schemas_with_fallback(&names, &fake_dir)
        .expect("fallback must succeed for supply-chain");

    assert!(schema.artifact_type("sbom-component").is_some());
    assert!(schema.artifact_type("build-attestation").is_some());
    assert!(schema.artifact_type("vulnerability").is_some());
    assert!(schema.artifact_type("release-artifact").is_some());

    // Common link types should also be present from the merge.
    assert!(schema.link_type("satisfies").is_some());
    assert!(schema.link_type("attests-build-of").is_some());
    assert!(schema.link_type("affects").is_some());
    assert!(schema.link_type("contains").is_some());
}
