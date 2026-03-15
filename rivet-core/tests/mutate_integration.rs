//! Integration tests for mutation operations (validate_mutation).
//!
//! These tests exercise schema-validated mutation logic from rivet-core::mutate,
//! covering artifact addition, link validation, and removal with backlink checks.

use std::collections::BTreeMap;
use std::path::PathBuf;

use rivet_core::links::LinkGraph;
use rivet_core::model::{Artifact, Link};
use rivet_core::mutate;
use rivet_core::schema::Schema;
use rivet_core::store::Store;

/// Project root — two levels up from rivet-core/tests/.
fn project_root() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("..")
}

fn load_schema_files(names: &[&str]) -> Schema {
    let schemas_dir = project_root().join("schemas");
    let mut files = Vec::new();
    for name in names {
        let path = schemas_dir.join(format!("{name}.yaml"));
        assert!(path.exists(), "schema file must exist: {}", path.display());
        files.push(Schema::load_file(&path).expect("load schema"));
    }
    Schema::merge(&files)
}

fn make_artifact(
    id: &str,
    art_type: &str,
    title: &str,
    links: Vec<Link>,
    fields: BTreeMap<String, serde_yaml::Value>,
) -> Artifact {
    Artifact {
        id: id.into(),
        artifact_type: art_type.into(),
        title: title.into(),
        description: None,
        status: Some("draft".into()),
        tags: vec![],
        links,
        fields,
        source_file: None,
    }
}

// ── Test: add valid artifact succeeds ────────────────────────────────────

// rivet: verifies REQ-031
#[test]
fn test_add_valid_artifact_succeeds() {
    let schema = load_schema_files(&["common", "dev"]);
    let mut store = Store::new();

    // Pre-populate store with one requirement
    store
        .insert(make_artifact(
            "REQ-001",
            "requirement",
            "First",
            vec![],
            BTreeMap::new(),
        ))
        .unwrap();

    // Create a new valid requirement
    let new_artifact = make_artifact(
        "REQ-002",
        "requirement",
        "Second requirement",
        vec![],
        BTreeMap::new(),
    );

    let result = mutate::validate_add(&new_artifact, &store, &schema);
    assert!(
        result.is_ok(),
        "valid artifact add should succeed: {result:?}"
    );
}

// ── Test: add valid artifact with fields succeeds ────────────────────────

#[test]
fn test_add_valid_artifact_with_fields_succeeds() {
    let schema = load_schema_files(&["common", "dev"]);
    let store = Store::new();

    let mut fields = BTreeMap::new();
    fields.insert(
        "priority".to_string(),
        serde_yaml::Value::String("must".to_string()),
    );
    fields.insert(
        "category".to_string(),
        serde_yaml::Value::String("functional".to_string()),
    );

    let artifact = make_artifact("REQ-001", "requirement", "Valid req", vec![], fields);

    let result = mutate::validate_add(&artifact, &store, &schema);
    assert!(
        result.is_ok(),
        "artifact with valid fields should succeed: {result:?}"
    );
}

// ── Test: add with unknown type is rejected ──────────────────────────────

// rivet: verifies REQ-031
#[test]
fn test_add_with_unknown_type_is_rejected() {
    let schema = load_schema_files(&["common", "dev"]);
    let store = Store::new();

    let artifact = make_artifact(
        "BAD-001",
        "nonexistent-type",
        "Should fail",
        vec![],
        BTreeMap::new(),
    );

    let result = mutate::validate_add(&artifact, &store, &schema);
    assert!(result.is_err(), "unknown type should be rejected");
    let err = result.unwrap_err().to_string();
    assert!(
        err.contains("unknown artifact type"),
        "error should mention unknown type, got: {err}"
    );
}

// ── Test: add with invalid field value is rejected ───────────────────────

// rivet: verifies REQ-031
#[test]
fn test_add_with_invalid_field_value_is_rejected() {
    let schema = load_schema_files(&["common", "dev"]);
    let store = Store::new();

    let mut fields = BTreeMap::new();
    fields.insert(
        "priority".to_string(),
        serde_yaml::Value::String("critical".to_string()), // not in allowed-values
    );

    let artifact = make_artifact("REQ-001", "requirement", "Bad field", vec![], fields);

    let result = mutate::validate_add(&artifact, &store, &schema);
    assert!(result.is_err(), "invalid field value should be rejected");
    let err = result.unwrap_err().to_string();
    assert!(
        err.contains("allowed"),
        "error should mention allowed values, got: {err}"
    );
}

// ── Test: link with invalid link type is rejected ────────────────────────

// rivet: verifies REQ-031
#[test]
fn test_link_with_invalid_link_type_is_rejected() {
    let schema = load_schema_files(&["common", "dev"]);
    let mut store = Store::new();

    store
        .insert(make_artifact(
            "REQ-001",
            "requirement",
            "Source",
            vec![],
            BTreeMap::new(),
        ))
        .unwrap();
    store
        .insert(make_artifact(
            "REQ-002",
            "requirement",
            "Target",
            vec![],
            BTreeMap::new(),
        ))
        .unwrap();

    let result = mutate::validate_link(
        "REQ-001",
        "nonexistent-link-type",
        "REQ-002",
        &store,
        &schema,
    );
    assert!(result.is_err(), "invalid link type should be rejected");
    let err = result.unwrap_err().to_string();
    assert!(
        err.contains("unknown link type"),
        "error should mention unknown link type, got: {err}"
    );
}

// ── Test: link with valid link type succeeds ─────────────────────────────

// rivet: verifies REQ-031
#[test]
fn test_link_with_valid_link_type_succeeds() {
    let schema = load_schema_files(&["common", "dev"]);
    let mut store = Store::new();

    store
        .insert(make_artifact(
            "FEAT-001",
            "feature",
            "A feature",
            vec![],
            BTreeMap::new(),
        ))
        .unwrap();
    store
        .insert(make_artifact(
            "REQ-001",
            "requirement",
            "A req",
            vec![],
            BTreeMap::new(),
        ))
        .unwrap();

    let result = mutate::validate_link("FEAT-001", "satisfies", "REQ-001", &store, &schema);
    assert!(result.is_ok(), "valid link should succeed: {result:?}");
}

// ── Test: link with missing source is rejected ───────────────────────────

#[test]
fn test_link_missing_source_is_rejected() {
    let schema = load_schema_files(&["common", "dev"]);
    let mut store = Store::new();

    store
        .insert(make_artifact(
            "REQ-001",
            "requirement",
            "Target",
            vec![],
            BTreeMap::new(),
        ))
        .unwrap();

    let result = mutate::validate_link("NOPE-001", "satisfies", "REQ-001", &store, &schema);
    assert!(result.is_err(), "missing source should be rejected");
    let err = result.unwrap_err().to_string();
    assert!(err.contains("does not exist"), "got: {err}");
}

// ── Test: link with missing target is rejected ───────────────────────────

#[test]
fn test_link_missing_target_is_rejected() {
    let schema = load_schema_files(&["common", "dev"]);
    let mut store = Store::new();

    store
        .insert(make_artifact(
            "REQ-001",
            "requirement",
            "Source",
            vec![],
            BTreeMap::new(),
        ))
        .unwrap();

    let result = mutate::validate_link("REQ-001", "satisfies", "NOPE-001", &store, &schema);
    assert!(result.is_err(), "missing target should be rejected");
}

// ── Test: remove with incoming links is rejected (unless force) ──────────

// rivet: verifies REQ-031
#[test]
fn test_remove_with_incoming_links_rejected() {
    let schema = load_schema_files(&["common", "dev"]);
    let mut store = Store::new();

    store
        .insert(make_artifact(
            "REQ-001",
            "requirement",
            "Target",
            vec![],
            BTreeMap::new(),
        ))
        .unwrap();
    store
        .insert(make_artifact(
            "FEAT-001",
            "feature",
            "Feature linking to REQ-001",
            vec![Link {
                link_type: "satisfies".to_string(),
                target: "REQ-001".to_string(),
            }],
            BTreeMap::new(),
        ))
        .unwrap();

    let graph = LinkGraph::build(&store, &schema);

    // Without force: should fail
    let result = mutate::validate_remove("REQ-001", false, &store, &graph);
    assert!(result.is_err(), "remove with backlinks should be rejected");
    let err = result.unwrap_err().to_string();
    assert!(
        err.contains("incoming link"),
        "error should mention incoming links, got: {err}"
    );
    assert!(
        err.contains("FEAT-001"),
        "error should mention the linking artifact, got: {err}"
    );

    // With force: should succeed
    let result_forced = mutate::validate_remove("REQ-001", true, &store, &graph);
    assert!(
        result_forced.is_ok(),
        "remove with --force should succeed: {result_forced:?}"
    );
}

// ── Test: remove without backlinks succeeds ──────────────────────────────

// rivet: verifies REQ-031
#[test]
fn test_remove_without_backlinks_succeeds() {
    let schema = load_schema_files(&["common", "dev"]);
    let mut store = Store::new();

    store
        .insert(make_artifact(
            "REQ-001",
            "requirement",
            "Standalone",
            vec![],
            BTreeMap::new(),
        ))
        .unwrap();

    let graph = LinkGraph::build(&store, &schema);

    let result = mutate::validate_remove("REQ-001", false, &store, &graph);
    assert!(
        result.is_ok(),
        "remove without backlinks should succeed: {result:?}"
    );
}

// ── Test: remove nonexistent artifact is rejected ────────────────────────

#[test]
fn test_remove_nonexistent_is_rejected() {
    let schema = load_schema_files(&["common", "dev"]);
    let store = Store::new();
    let graph = LinkGraph::build(&store, &schema);

    let result = mutate::validate_remove("NOPE-001", false, &store, &graph);
    assert!(result.is_err(), "removing nonexistent should fail");
}

// ── Test: next_id generates correct sequential IDs ───────────────────────

// rivet: verifies REQ-031
#[test]
fn test_next_id_sequential() {
    let mut store = Store::new();

    store
        .insert(make_artifact(
            "REQ-001",
            "requirement",
            "First",
            vec![],
            BTreeMap::new(),
        ))
        .unwrap();
    store
        .insert(make_artifact(
            "REQ-002",
            "requirement",
            "Second",
            vec![],
            BTreeMap::new(),
        ))
        .unwrap();
    store
        .insert(make_artifact(
            "REQ-010",
            "requirement",
            "Tenth",
            vec![],
            BTreeMap::new(),
        ))
        .unwrap();

    let next = mutate::next_id(&store, "REQ");
    assert_eq!(next, "REQ-011");
}

// ── Test: next_id with no existing IDs starts at 001 ─────────────────────

#[test]
fn test_next_id_empty_store() {
    let store = Store::new();
    let next = mutate::next_id(&store, "REQ");
    assert_eq!(next, "REQ-001");
}

// ── Test: prefix_for_type derives from store ─────────────────────────────

#[test]
fn test_prefix_for_type_derives_from_store() {
    let mut store = Store::new();
    store
        .insert(make_artifact(
            "REQ-001",
            "requirement",
            "First requirement",
            vec![],
            BTreeMap::new(),
        ))
        .unwrap();
    store
        .insert(make_artifact(
            "FEAT-010",
            "feature",
            "A feature",
            vec![],
            BTreeMap::new(),
        ))
        .unwrap();
    store
        .insert(make_artifact(
            "DD-005",
            "design-decision",
            "A decision",
            vec![],
            BTreeMap::new(),
        ))
        .unwrap();
    assert_eq!(mutate::prefix_for_type("requirement", &store), "REQ");
    assert_eq!(mutate::prefix_for_type("feature", &store), "FEAT");
    assert_eq!(mutate::prefix_for_type("design-decision", &store), "DD");
}

#[test]
fn test_prefix_for_type_fallback_no_artifacts() {
    let store = Store::new();
    // No artifacts in store — falls back to uppercased, hyphens removed.
    assert_eq!(
        mutate::prefix_for_type("requirement", &store),
        "REQUIREMENT"
    );
    assert_eq!(
        mutate::prefix_for_type("design-decision", &store),
        "DESIGNDECISION"
    );
    assert_eq!(mutate::prefix_for_type("sw-req", &store), "SWREQ");
    assert_eq!(
        mutate::prefix_for_type("aadl-component", &store),
        "AADLCOMPONENT"
    );
}

// ── Test: validate_modify rejects invalid field values ───────────────────

#[test]
fn test_validate_modify_rejects_invalid_field() {
    let schema = load_schema_files(&["common", "dev"]);
    let mut store = Store::new();

    store
        .insert(make_artifact(
            "REQ-001",
            "requirement",
            "First",
            vec![],
            BTreeMap::new(),
        ))
        .unwrap();

    let params = mutate::ModifyParams {
        set_status: None,
        set_title: None,
        add_tags: vec![],
        remove_tags: vec![],
        set_fields: vec![("priority".to_string(), "critical".to_string())],
    };

    let result = mutate::validate_modify("REQ-001", &params, &store, &schema);
    assert!(result.is_err(), "invalid field value in modify should fail");
    let err = result.unwrap_err().to_string();
    assert!(
        err.contains("not in allowed values"),
        "error should mention allowed values, got: {err}"
    );
}

// ── Test: validate_unlink rejects missing link ───────────────────────────

#[test]
fn test_validate_unlink_missing_link() {
    let mut store = Store::new();

    store
        .insert(make_artifact(
            "REQ-001",
            "requirement",
            "First",
            vec![],
            BTreeMap::new(),
        ))
        .unwrap();

    let result = mutate::validate_unlink("REQ-001", "satisfies", "REQ-002", &store);
    assert!(result.is_err(), "unlinking nonexistent link should fail");
}

// ── Test: YAML file manipulation — append_artifact ───────────────────────

// rivet: verifies REQ-031
#[test]
fn test_append_artifact_to_file() {
    let dir = tempfile::tempdir().unwrap();
    let file_path = dir.path().join("test.yaml");
    std::fs::write(
        &file_path,
        "artifacts:\n  - id: REQ-001\n    type: requirement\n    title: First\n",
    )
    .unwrap();

    let artifact = Artifact {
        id: "REQ-002".to_string(),
        artifact_type: "requirement".to_string(),
        title: "Second".to_string(),
        description: None,
        status: Some("draft".to_string()),
        tags: vec![],
        links: vec![],
        fields: BTreeMap::new(),
        source_file: None,
    };

    mutate::append_artifact_to_file(&artifact, &file_path).unwrap();

    let content = std::fs::read_to_string(&file_path).unwrap();
    assert!(content.contains("REQ-001"));
    assert!(content.contains("REQ-002"));
    assert!(content.contains("title: Second"));
}

// ── Test: YAML file manipulation — remove_artifact ───────────────────────

// rivet: verifies REQ-031
#[test]
fn test_remove_artifact_from_file() {
    let dir = tempfile::tempdir().unwrap();
    let file_path = dir.path().join("test.yaml");
    std::fs::write(
        &file_path,
        "\
artifacts:
  - id: REQ-001
    type: requirement
    title: First
    status: draft

  - id: REQ-002
    type: requirement
    title: Second
    status: draft

  - id: REQ-003
    type: requirement
    title: Third
    status: draft
",
    )
    .unwrap();

    mutate::remove_artifact_from_file("REQ-002", &file_path).unwrap();

    let content = std::fs::read_to_string(&file_path).unwrap();
    assert!(content.contains("REQ-001"), "REQ-001 should remain");
    assert!(!content.contains("REQ-002"), "REQ-002 should be removed");
    assert!(content.contains("REQ-003"), "REQ-003 should remain");
}
