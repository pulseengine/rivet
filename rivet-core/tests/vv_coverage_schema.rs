// SAFETY-REVIEW (SCRC Phase 1, DD-058): Integration test / bench code.
// Tests legitimately use unwrap/expect/panic/assert-indexing patterns
// because a test failure should panic with a clear stack. Blanket-allow
// the Phase 1 restriction lints at crate scope; real risk analysis for
// these lints is carried by production code in rivet-core/src and
// rivet-cli/src, not by the test harnesses.
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

//! Integration tests for the vv-coverage schema (rivet#188 sub-issue #1).
//!
//! Verifies that the V&V coverage schema loads correctly, defines the
//! `repo-status` artifact type, and carries the `techniques-applied` /
//! `techniques-gated-in-ci` fields the cross-repo coverage matrix
//! aggregator depends on.

// ── Schema loading ──────────────────────────────────────────────────────

/// The embedded vv-coverage schema loads and has the correct name.
#[test]
fn vv_coverage_schema_loads() {
    let schema_file = rivet_core::embedded::load_embedded_schema("vv-coverage")
        .expect("vv-coverage schema must load");
    assert_eq!(schema_file.schema.name, "vv-coverage");
}

/// The embedded vv-coverage schema constant is non-empty and mentions
/// expected content.
#[test]
fn vv_coverage_content_non_empty() {
    assert!(
        !rivet_core::embedded::SCHEMA_VV_COVERAGE.is_empty(),
        "SCHEMA_VV_COVERAGE must not be empty"
    );
    assert!(
        rivet_core::embedded::SCHEMA_VV_COVERAGE.contains("repo-status"),
        "SCHEMA_VV_COVERAGE must mention 'repo-status'"
    );
    assert!(
        rivet_core::embedded::SCHEMA_VV_COVERAGE.contains("techniques-applied"),
        "SCHEMA_VV_COVERAGE must mention 'techniques-applied'"
    );
    assert!(
        rivet_core::embedded::SCHEMA_VV_COVERAGE.contains("techniques-gated-in-ci"),
        "SCHEMA_VV_COVERAGE must mention 'techniques-gated-in-ci'"
    );
}

/// The vv-coverage schema YAML parses into a valid SchemaFile.
#[test]
fn vv_coverage_parses_as_schema_file() {
    let parsed: Result<rivet_core::schema::SchemaFile, _> =
        serde_yaml::from_str(rivet_core::embedded::SCHEMA_VV_COVERAGE);
    assert!(
        parsed.is_ok(),
        "vv-coverage schema must be valid YAML: {:?}",
        parsed.err()
    );
}

/// `vv-coverage` is registered in the built-in SCHEMA_NAMES list — without
/// this, agent-pipeline integration tests skip the schema and the cross-
/// repo aggregator can't auto-discover it.
#[test]
fn vv_coverage_is_registered_in_schema_names() {
    assert!(
        rivet_core::embedded::SCHEMA_NAMES.contains(&"vv-coverage"),
        "SCHEMA_NAMES must include 'vv-coverage'"
    );
}

// ── Artifact type ───────────────────────────────────────────────────────

/// The schema defines the `repo-status` artifact type.
#[test]
fn vv_coverage_defines_repo_status() {
    let schema_file = rivet_core::embedded::load_embedded_schema("vv-coverage")
        .expect("vv-coverage schema must load");

    let type_names: Vec<&str> = schema_file
        .artifact_types
        .iter()
        .map(|t| t.name.as_str())
        .collect();

    assert!(
        type_names.contains(&"repo-status"),
        "must define repo-status, got {type_names:?}"
    );
}

/// `repo-status` carries `repo`, `techniques-applied`, and
/// `techniques-gated-in-ci`.
#[test]
fn repo_status_has_techniques_fields() {
    let schema_file = rivet_core::embedded::load_embedded_schema("vv-coverage")
        .expect("vv-coverage schema must load");

    let repo_status = schema_file
        .artifact_types
        .iter()
        .find(|t| t.name == "repo-status")
        .expect("repo-status type must exist");

    let field_names: Vec<&str> = repo_status.fields.iter().map(|f| f.name.as_str()).collect();

    assert!(
        field_names.contains(&"repo"),
        "repo-status must declare 'repo' field, got {field_names:?}"
    );
    assert!(
        field_names.contains(&"techniques-applied"),
        "repo-status must declare 'techniques-applied' field, got {field_names:?}"
    );
    assert!(
        field_names.contains(&"techniques-gated-in-ci"),
        "repo-status must declare 'techniques-gated-in-ci' field, got {field_names:?}"
    );
}

/// `repo` and `techniques-applied` are required; `techniques-gated-in-ci`
/// is optional. The matrix aggregator joins on `repo` and assumes
/// `techniques-applied` is always populated.
#[test]
fn repo_status_required_fields_match_aggregator_contract() {
    let schema_file = rivet_core::embedded::load_embedded_schema("vv-coverage")
        .expect("vv-coverage schema must load");

    let repo_status = schema_file
        .artifact_types
        .iter()
        .find(|t| t.name == "repo-status")
        .expect("repo-status type must exist");

    let repo = repo_status
        .fields
        .iter()
        .find(|f| f.name == "repo")
        .expect("repo field must exist");
    assert!(repo.required, "repo must be required");

    let applied = repo_status
        .fields
        .iter()
        .find(|f| f.name == "techniques-applied")
        .expect("techniques-applied must exist");
    assert!(applied.required, "techniques-applied must be required");

    let gated = repo_status
        .fields
        .iter()
        .find(|f| f.name == "techniques-gated-in-ci")
        .expect("techniques-gated-in-ci must exist");
    assert!(
        !gated.required,
        "techniques-gated-in-ci must be optional (a repo may have applied techniques without gating any)"
    );
}

/// Both technique fields are list-typed. The aggregator depends on this
/// to render columns; a string-typed field would silently break the
/// matrix.
#[test]
fn techniques_fields_are_list_typed() {
    let schema_file = rivet_core::embedded::load_embedded_schema("vv-coverage")
        .expect("vv-coverage schema must load");

    let repo_status = schema_file
        .artifact_types
        .iter()
        .find(|t| t.name == "repo-status")
        .expect("repo-status type must exist");

    let applied = repo_status
        .fields
        .iter()
        .find(|f| f.name == "techniques-applied")
        .expect("techniques-applied must exist");
    assert_eq!(
        applied.field_type, "list<string>",
        "techniques-applied must be list<string>, got {:?}",
        applied.field_type
    );

    let gated = repo_status
        .fields
        .iter()
        .find(|f| f.name == "techniques-gated-in-ci")
        .expect("techniques-gated-in-ci must exist");
    assert_eq!(
        gated.field_type, "list<string>",
        "techniques-gated-in-ci must be list<string>, got {:?}",
        gated.field_type
    );
}

/// The schema extends `common` so that base fields (id, title, etc.)
/// are available on `repo-status` without redeclaration.
#[test]
fn vv_coverage_extends_common() {
    let schema_file = rivet_core::embedded::load_embedded_schema("vv-coverage")
        .expect("vv-coverage schema must load");
    assert!(
        schema_file.schema.extends.iter().any(|s| s == "common"),
        "vv-coverage must extend 'common', got {:?}",
        schema_file.schema.extends
    );
}
