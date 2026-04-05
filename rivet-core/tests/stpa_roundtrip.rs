use std::path::PathBuf;

use rivet_core::links::LinkGraph;
use rivet_core::schema::{Schema, Severity};
use rivet_core::store::Store;
use rivet_core::validate;

fn load_stpa_schema() -> Schema {
    let schemas_dir = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../schemas");
    let mut files = Vec::new();
    for name in &["common", "stpa"] {
        let path = schemas_dir.join(format!("{name}.yaml"));
        if path.exists() {
            files.push(Schema::load_file(&path).expect("load schema"));
        }
    }
    Schema::merge(&files)
}

/// Verify the STPA adapter can round-trip: load artifacts, build store,
/// resolve links, and validate without errors.
// rivet: verifies REQ-002
#[test]
fn test_stpa_schema_loads() {
    let schema = load_stpa_schema();
    assert!(
        schema.artifact_type("loss").is_some(),
        "loss type must exist"
    );
    assert!(
        schema.artifact_type("hazard").is_some(),
        "hazard type must exist"
    );
    assert!(schema.artifact_type("uca").is_some(), "uca type must exist");
    assert!(
        schema.link_type("leads-to-loss").is_some(),
        "leads-to-loss link type must exist"
    );
    assert_eq!(
        schema.inverse_of("leads-to-loss"),
        Some("loss-caused-by"),
        "inverse of leads-to-loss"
    );
}

// rivet: verifies REQ-001
#[test]
fn test_store_insert_and_lookup() {
    let mut store = Store::new();
    let artifact = rivet_core::model::Artifact {
        id: "TEST-1".into(),
        artifact_type: "loss".into(),
        title: "Test loss".into(),
        description: None,
        status: None,
        tags: vec![],
        links: vec![],
        fields: Default::default(),
        provenance: None,
        source_file: None,
    };
    store.insert(artifact).unwrap();
    assert_eq!(store.len(), 1);
    assert!(store.get("TEST-1").is_some());
    assert_eq!(store.by_type("loss").len(), 1);
}

// rivet: verifies REQ-001
#[test]
fn test_duplicate_id_rejected() {
    let mut store = Store::new();
    let artifact = rivet_core::model::Artifact {
        id: "DUP-1".into(),
        artifact_type: "loss".into(),
        title: "First".into(),
        description: None,
        status: None,
        tags: vec![],
        links: vec![],
        fields: Default::default(),
        provenance: None,
        source_file: None,
    };
    store.insert(artifact).unwrap();

    let dup = rivet_core::model::Artifact {
        id: "DUP-1".into(),
        artifact_type: "loss".into(),
        title: "Second".into(),
        description: None,
        status: None,
        tags: vec![],
        links: vec![],
        fields: Default::default(),
        provenance: None,
        source_file: None,
    };
    assert!(store.insert(dup).is_err());
}

// rivet: verifies REQ-004
#[test]
fn test_broken_link_detected() {
    let schema = load_stpa_schema();
    let mut store = Store::new();

    let artifact = rivet_core::model::Artifact {
        id: "H-99".into(),
        artifact_type: "hazard".into(),
        title: "Test hazard".into(),
        description: None,
        status: None,
        tags: vec![],
        links: vec![rivet_core::model::Link {
            link_type: "leads-to-loss".into(),
            target: "L-NONEXISTENT".into(),
        }],
        fields: Default::default(),
        provenance: None,
        source_file: None,
    };
    store.insert(artifact).unwrap();

    let graph = LinkGraph::build(&store, &schema);
    assert_eq!(graph.broken.len(), 1);
    assert_eq!(graph.broken[0].target, "L-NONEXISTENT");
}

// rivet: verifies REQ-004
#[test]
fn test_validation_catches_unknown_type() {
    let schema = load_stpa_schema();
    let mut store = Store::new();

    let artifact = rivet_core::model::Artifact {
        id: "X-1".into(),
        artifact_type: "nonexistent-type".into(),
        title: "Bad type".into(),
        description: None,
        status: None,
        tags: vec![],
        links: vec![],
        fields: Default::default(),
        provenance: None,
        source_file: None,
    };
    store.insert(artifact).unwrap();

    let graph = LinkGraph::build(&store, &schema);
    let diagnostics = validate::validate(&store, &schema, &graph);
    let errors: Vec<_> = diagnostics
        .iter()
        .filter(|d| d.severity == Severity::Error)
        .collect();
    assert!(!errors.is_empty(), "should have error for unknown type");
    assert!(errors[0].message.contains("unknown artifact type"));
}
