//! Integration tests (SWE.5 level) — cross-module integration verification.
//!
//! These tests exercise the full pipeline: loading schemas, importing artifacts,
//! building the store and link graph, validating, computing matrices, and querying.

use std::collections::BTreeMap;
use std::path::PathBuf;

use rivet_core::adapter::{Adapter, AdapterConfig, AdapterSource};
use rivet_core::diff::{ArtifactDiff, DiagnosticDiff};
use rivet_core::formats::generic::GenericYamlAdapter;
use rivet_core::links::LinkGraph;
use rivet_core::matrix::{self, Direction};
use rivet_core::model::{Artifact, Link};
use rivet_core::query::{self, Query};
use rivet_core::reqif::ReqIfAdapter;
use rivet_core::schema::{Schema, Severity};
use rivet_core::store::Store;
use rivet_core::validate;

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

fn make_artifact(id: &str, art_type: &str, title: &str) -> Artifact {
    Artifact {
        id: id.into(),
        artifact_type: art_type.into(),
        title: title.into(),
        description: None,
        status: None,
        tags: vec![],
        links: vec![],
        fields: BTreeMap::new(),
        source_file: None,
    }
}

fn make_artifact_full(
    id: &str,
    art_type: &str,
    title: &str,
    status: Option<&str>,
    tags: &[&str],
    links: Vec<Link>,
    fields: BTreeMap<String, serde_yaml::Value>,
) -> Artifact {
    Artifact {
        id: id.into(),
        artifact_type: art_type.into(),
        title: title.into(),
        description: Some(format!("Description for {id}")),
        status: status.map(|s| s.to_string()),
        tags: tags.iter().map(|t| t.to_string()).collect(),
        links,
        fields,
        source_file: None,
    }
}

// ── Dogfood validation ──────────────────────────────────────────────────

/// Load the project's own rivet.yaml, schemas, and artifacts, then validate.
/// The project should pass validation (no errors, only warnings are acceptable).
#[test]
fn test_dogfood_validate() {
    let root = project_root();
    let config =
        rivet_core::load_project_config(&root.join("rivet.yaml")).expect("load rivet.yaml");

    assert_eq!(config.project.name, "rivet");

    let schema =
        rivet_core::load_schemas(&config.project.schemas, &root.join("schemas")).expect("schemas");

    let mut store = Store::new();
    for source in &config.sources {
        let artifacts = rivet_core::load_artifacts(source, &root).expect("load artifacts");
        for a in artifacts {
            store.upsert(a);
        }
    }

    assert!(
        !store.is_empty(),
        "dogfood store must have at least one artifact"
    );

    let graph = LinkGraph::build(&store, &schema);
    let diagnostics = validate::validate(&store, &schema, &graph);

    let errors: Vec<_> = diagnostics
        .iter()
        .filter(|d| d.severity == Severity::Error)
        .collect();

    if !errors.is_empty() {
        for e in &errors {
            eprintln!("{e}");
        }
    }
    assert!(
        errors.is_empty(),
        "dogfood validation must pass with no errors (found {})",
        errors.len()
    );
}

// ── Generic YAML roundtrip ──────────────────────────────────────────────

/// Create artifacts, export to generic YAML, reimport, verify identical content.
#[test]
fn test_generic_yaml_roundtrip() {
    let original = vec![
        make_artifact_full(
            "RT-001",
            "requirement",
            "Roundtrip test requirement",
            Some("approved"),
            &["roundtrip", "test"],
            vec![],
            {
                let mut f = BTreeMap::new();
                f.insert("priority".into(), serde_yaml::Value::String("must".into()));
                f
            },
        ),
        make_artifact_full(
            "RT-002",
            "design-decision",
            "Roundtrip test decision",
            Some("draft"),
            &["test"],
            vec![Link {
                link_type: "satisfies".into(),
                target: "RT-001".into(),
            }],
            {
                let mut f = BTreeMap::new();
                f.insert(
                    "rationale".into(),
                    serde_yaml::Value::String("For testing".into()),
                );
                f
            },
        ),
    ];

    let adapter = GenericYamlAdapter::new();
    let config = AdapterConfig::default();

    // Export
    let yaml_bytes = adapter.export(&original, &config).expect("export");
    let yaml_str = std::str::from_utf8(&yaml_bytes).expect("valid utf-8");
    assert!(yaml_str.contains("RT-001"));
    assert!(yaml_str.contains("RT-002"));

    // Reimport
    let reimported = adapter
        .import(&AdapterSource::Bytes(yaml_bytes), &config)
        .expect("reimport");

    assert_eq!(reimported.len(), original.len());

    for (orig, re) in original.iter().zip(reimported.iter()) {
        assert_eq!(orig.id, re.id);
        assert_eq!(orig.artifact_type, re.artifact_type);
        assert_eq!(orig.title, re.title);
        assert_eq!(orig.description, re.description);
        assert_eq!(orig.status, re.status);
        assert_eq!(orig.tags, re.tags);
        assert_eq!(orig.links.len(), re.links.len());
        for (ol, rl) in orig.links.iter().zip(re.links.iter()) {
            assert_eq!(ol.link_type, rl.link_type);
            assert_eq!(ol.target, rl.target);
        }
        assert_eq!(orig.fields, re.fields);
    }
}

// ── Schema merge preserves types ────────────────────────────────────────

/// Load common + stpa + aspice, verify all types from each are present.
#[test]
fn test_schema_merge_preserves_types() {
    let schema = load_schema_files(&["common", "stpa", "aspice"]);

    // STPA types
    let stpa_types = [
        "loss",
        "hazard",
        "sub-hazard",
        "system-constraint",
        "controller",
        "controlled-process",
        "control-action",
        "uca",
        "controller-constraint",
        "loss-scenario",
    ];
    for t in &stpa_types {
        assert!(
            schema.artifact_type(t).is_some(),
            "merged schema must contain STPA type '{t}'"
        );
    }

    // ASPICE types
    let aspice_types = [
        "stakeholder-req",
        "system-req",
        "system-arch-component",
        "sw-req",
        "sw-arch-component",
        "sw-detail-design",
        "unit-verification",
        "sw-integration-verification",
        "sw-verification",
        "sys-integration-verification",
        "sys-verification",
        "verification-execution",
        "verification-verdict",
    ];
    for t in &aspice_types {
        assert!(
            schema.artifact_type(t).is_some(),
            "merged schema must contain ASPICE type '{t}'"
        );
    }

    // Common link types
    let common_links = [
        "traces-to",
        "satisfies",
        "refines",
        "verifies",
        "implements",
        "derives-from",
    ];
    for l in &common_links {
        assert!(
            schema.link_type(l).is_some(),
            "merged schema must contain common link type '{l}'"
        );
    }

    // STPA link types
    assert!(schema.link_type("leads-to-loss").is_some());
    assert!(schema.link_type("prevents").is_some());
    assert!(schema.link_type("leads-to-hazard").is_some());

    // ASPICE link types
    assert!(schema.link_type("result-of").is_some());
    assert!(schema.link_type("part-of-execution").is_some());

    // Verify inverse mappings survive merge
    assert_eq!(schema.inverse_of("verifies"), Some("verified-by"));
    assert_eq!(schema.inverse_of("leads-to-loss"), Some("loss-caused-by"));
    assert_eq!(schema.inverse_of("result-of"), Some("has-result"));
}

// ── Cybersecurity schema merge ───────────────────────────────────────────

/// The cybersecurity schema loads and merges with common + aspice.
#[test]
fn test_cybersecurity_schema_merge() {
    let schema = load_schema_files(&["common", "aspice", "cybersecurity"]);

    // Cybersecurity types
    let sec_types = [
        "asset",
        "threat-scenario",
        "risk-assessment",
        "cybersecurity-goal",
        "cybersecurity-req",
        "cybersecurity-design",
        "cybersecurity-implementation",
        "cybersecurity-verification",
    ];
    for t in &sec_types {
        assert!(
            schema.artifact_type(t).is_some(),
            "merged schema must contain cybersecurity type '{t}'"
        );
    }

    // Cybersecurity link types
    assert!(schema.link_type("threatens").is_some());
    assert!(schema.link_type("assesses").is_some());

    // Inverse mappings
    assert_eq!(schema.inverse_of("threatens"), Some("threatened-by"));
    assert_eq!(schema.inverse_of("assesses"), Some("assessed-by"));

    // ASPICE types still present
    assert!(schema.artifact_type("sw-req").is_some());
    assert!(schema.artifact_type("unit-verification").is_some());

    // Common link types still present
    assert!(schema.link_type("mitigates").is_some());
    assert!(schema.link_type("verifies").is_some());
}

// ── Traceability matrix ─────────────────────────────────────────────────

/// Build a store with known artifacts and links, compute matrix, verify coverage.
#[test]
fn test_traceability_matrix() {
    let schema = load_schema_files(&["common", "stpa"]);
    let mut store = Store::new();

    // Two losses
    store
        .insert(make_artifact("L-1", "loss", "Loss 1"))
        .unwrap();
    store
        .insert(make_artifact("L-2", "loss", "Loss 2"))
        .unwrap();

    // Three hazards: two link to L-1, one links to L-2
    for (id, target) in [("H-1", "L-1"), ("H-2", "L-1"), ("H-3", "L-2")] {
        let mut h = make_artifact(id, "hazard", &format!("Hazard {id}"));
        h.links.push(Link {
            link_type: "leads-to-loss".into(),
            target: target.into(),
        });
        store.insert(h).unwrap();
    }

    let graph = LinkGraph::build(&store, &schema);

    // Forward: hazard -> loss via "leads-to-loss"
    let matrix = matrix::compute_matrix(
        &store,
        &graph,
        "hazard",
        "loss",
        "leads-to-loss",
        Direction::Forward,
    );
    assert_eq!(matrix.total, 3, "3 hazards total");
    assert_eq!(matrix.covered, 3, "all 3 hazards link to a loss");
    assert!((matrix.coverage_pct() - 100.0).abs() < f64::EPSILON);

    // Backward: loss <- hazard via "leads-to-loss"
    let back_matrix = matrix::compute_matrix(
        &store,
        &graph,
        "loss",
        "hazard",
        "leads-to-loss",
        Direction::Backward,
    );
    assert_eq!(back_matrix.total, 2, "2 losses total");
    assert_eq!(back_matrix.covered, 2, "both losses have backlinks");
    assert!((back_matrix.coverage_pct() - 100.0).abs() < f64::EPSILON);

    // Partial coverage: add a loss with no hazard link
    store
        .insert(make_artifact("L-3", "loss", "Uncovered loss"))
        .unwrap();
    let graph2 = LinkGraph::build(&store, &schema);
    let matrix2 = matrix::compute_matrix(
        &store,
        &graph2,
        "loss",
        "hazard",
        "leads-to-loss",
        Direction::Backward,
    );
    assert_eq!(matrix2.total, 3);
    assert_eq!(matrix2.covered, 2); // L-3 has no backlinks
    let expected_pct = (2.0 / 3.0) * 100.0;
    assert!(
        (matrix2.coverage_pct() - expected_pct).abs() < 0.01,
        "coverage should be ~66.67%, got {}",
        matrix2.coverage_pct()
    );
}

/// Empty matrix has 100% coverage (vacuously true).
#[test]
fn test_traceability_matrix_empty() {
    let schema = load_schema_files(&["common"]);
    let store = Store::new();
    let graph = LinkGraph::build(&store, &schema);

    let matrix = matrix::compute_matrix(
        &store,
        &graph,
        "loss",
        "hazard",
        "leads-to-loss",
        Direction::Forward,
    );
    assert_eq!(matrix.total, 0);
    assert_eq!(matrix.covered, 0);
    assert!((matrix.coverage_pct() - 100.0).abs() < f64::EPSILON);
}

// ── Query filters ───────────────────────────────────────────────────────

/// Insert diverse artifacts and test filtering by type, status, tag,
/// has_link_type, and missing_link_type.
#[test]
fn test_query_filters() {
    let mut store = Store::new();

    store
        .insert(make_artifact_full(
            "A-1",
            "requirement",
            "Req 1",
            Some("approved"),
            &["safety"],
            vec![Link {
                link_type: "satisfies".into(),
                target: "A-3".into(),
            }],
            BTreeMap::new(),
        ))
        .unwrap();
    store
        .insert(make_artifact_full(
            "A-2",
            "requirement",
            "Req 2",
            Some("draft"),
            &["feature"],
            vec![],
            BTreeMap::new(),
        ))
        .unwrap();
    store
        .insert(make_artifact_full(
            "A-3",
            "design-decision",
            "Decision 1",
            Some("approved"),
            &["safety"],
            vec![],
            BTreeMap::new(),
        ))
        .unwrap();
    store
        .insert(make_artifact_full(
            "A-4",
            "feature",
            "Feature 1",
            None,
            &["feature", "safety"],
            vec![Link {
                link_type: "implements".into(),
                target: "A-3".into(),
            }],
            BTreeMap::new(),
        ))
        .unwrap();

    // Filter by type
    let q = Query {
        artifact_type: Some("requirement".into()),
        ..Default::default()
    };
    let results = query::execute(&store, &q);
    assert_eq!(results.len(), 2);
    assert!(results.iter().all(|a| a.artifact_type == "requirement"));

    // Filter by status
    let q = Query {
        status: Some("approved".into()),
        ..Default::default()
    };
    let results = query::execute(&store, &q);
    assert_eq!(results.len(), 2); // A-1 and A-3
    assert!(
        results
            .iter()
            .all(|a| a.status.as_deref() == Some("approved"))
    );

    // Filter by tag
    let q = Query {
        tag: Some("safety".into()),
        ..Default::default()
    };
    let results = query::execute(&store, &q);
    assert_eq!(results.len(), 3); // A-1, A-3, A-4

    // Filter by has_link_type
    let q = Query {
        has_link_type: Some("satisfies".into()),
        ..Default::default()
    };
    let results = query::execute(&store, &q);
    assert_eq!(results.len(), 1);
    assert_eq!(results[0].id, "A-1");

    // Filter by missing_link_type
    let q = Query {
        missing_link_type: Some("satisfies".into()),
        ..Default::default()
    };
    let results = query::execute(&store, &q);
    assert_eq!(results.len(), 3); // A-2, A-3, A-4

    // Combine filters: type + status
    let q = Query {
        artifact_type: Some("requirement".into()),
        status: Some("approved".into()),
        ..Default::default()
    };
    let results = query::execute(&store, &q);
    assert_eq!(results.len(), 1);
    assert_eq!(results[0].id, "A-1");

    // Combine filters: tag + has_link_type
    let q = Query {
        tag: Some("safety".into()),
        has_link_type: Some("implements".into()),
        ..Default::default()
    };
    let results = query::execute(&store, &q);
    assert_eq!(results.len(), 1);
    assert_eq!(results[0].id, "A-4");
}

// ── Link graph integration ──────────────────────────────────────────────

/// Verify backlinks, orphans, and reachability across a multi-type graph.
#[test]
fn test_link_graph_integration() {
    let schema = load_schema_files(&["common", "stpa"]);
    let mut store = Store::new();

    store
        .insert(make_artifact("L-1", "loss", "Loss 1"))
        .unwrap();

    let mut h = make_artifact("H-1", "hazard", "Hazard 1");
    h.links.push(Link {
        link_type: "leads-to-loss".into(),
        target: "L-1".into(),
    });
    store.insert(h).unwrap();

    let mut sc = make_artifact("SC-1", "system-constraint", "Constraint 1");
    sc.links.push(Link {
        link_type: "prevents".into(),
        target: "H-1".into(),
    });
    store.insert(sc).unwrap();

    // Orphan — no links in or out
    store
        .insert(make_artifact("ORPHAN-1", "loss", "Orphan loss"))
        .unwrap();

    let graph = LinkGraph::build(&store, &schema);

    // Forward links
    assert_eq!(graph.links_from("H-1").len(), 1);
    assert_eq!(graph.links_from("SC-1").len(), 1);
    assert_eq!(graph.links_from("L-1").len(), 0);

    // Backlinks
    let bl = graph.backlinks_to("L-1");
    assert_eq!(bl.len(), 1);
    assert_eq!(bl[0].source, "H-1");
    assert_eq!(bl[0].link_type, "leads-to-loss");
    assert_eq!(bl[0].inverse_type.as_deref(), Some("loss-caused-by"));

    let bl_h = graph.backlinks_to("H-1");
    assert_eq!(bl_h.len(), 1);
    assert_eq!(bl_h[0].source, "SC-1");

    // Orphans
    let orphans = graph.orphans(&store);
    assert_eq!(orphans.len(), 1);
    assert_eq!(orphans[0], "ORPHAN-1");

    // No broken links
    assert!(graph.broken.is_empty());

    // Reachability
    let reachable = graph.reachable("SC-1", "prevents");
    assert_eq!(reachable, vec!["H-1".to_string()]);
}

// ── Validation of ASPICE types ──────────────────────────────────────────

/// Verify that ASPICE traceability rules fire correctly.
#[test]
fn test_aspice_traceability_rules() {
    let schema = load_schema_files(&["common", "aspice"]);
    let mut store = Store::new();

    // Create a minimal ASPICE chain: stakeholder-req -> system-req -> sw-req
    store
        .insert(make_artifact(
            "STKH-1",
            "stakeholder-req",
            "Stakeholder need",
        ))
        .unwrap();

    let mut sys_req = make_artifact("SYSREQ-1", "system-req", "System requirement");
    sys_req.links.push(Link {
        link_type: "derives-from".into(),
        target: "STKH-1".into(),
    });
    store.insert(sys_req).unwrap();

    let mut sw_req = make_artifact("SWREQ-1", "sw-req", "Software requirement");
    sw_req.links.push(Link {
        link_type: "derives-from".into(),
        target: "SYSREQ-1".into(),
    });
    store.insert(sw_req).unwrap();

    // SW req without derives-from (should trigger error)
    store
        .insert(make_artifact("SWREQ-BAD", "sw-req", "Missing derivation"))
        .unwrap();

    let graph = LinkGraph::build(&store, &schema);
    let diagnostics = validate::validate(&store, &schema, &graph);

    let errors: Vec<_> = diagnostics
        .iter()
        .filter(|d| d.severity == Severity::Error)
        .collect();

    // SWREQ-BAD should have an error for missing derives-from
    let swreq_bad_errors: Vec<_> = errors
        .iter()
        .filter(|d| d.artifact_id.as_deref() == Some("SWREQ-BAD"))
        .collect();
    assert!(
        !swreq_bad_errors.is_empty(),
        "SWREQ-BAD must have validation errors for missing derives-from"
    );
}

// ── Store upsert ────────────────────────────────────────────────────────

/// Verify that upsert correctly overwrites an existing artifact.
#[test]
fn test_store_upsert_overwrites() {
    let mut store = Store::new();

    store
        .insert(make_artifact("U-1", "loss", "Original"))
        .unwrap();
    assert_eq!(store.get("U-1").unwrap().title, "Original");

    store.upsert(make_artifact("U-1", "loss", "Updated"));
    assert_eq!(store.get("U-1").unwrap().title, "Updated");
    assert_eq!(store.len(), 1);
    assert_eq!(store.by_type("loss").len(), 1);
}

/// Verify that upsert with type change updates the by_type index.
#[test]
fn test_store_upsert_type_change() {
    let mut store = Store::new();

    store
        .insert(make_artifact("TC-1", "loss", "Was a loss"))
        .unwrap();
    assert_eq!(store.by_type("loss").len(), 1);
    assert_eq!(store.by_type("hazard").len(), 0);

    store.upsert(make_artifact("TC-1", "hazard", "Now a hazard"));
    assert_eq!(store.by_type("loss").len(), 0);
    assert_eq!(store.by_type("hazard").len(), 1);
    assert_eq!(store.len(), 1);
}

// ── ReqIF roundtrip ─────────────────────────────────────────────────────

/// Create artifacts with links and fields, export to ReqIF XML, reimport,
/// verify that all data survives the round-trip.
#[test]
fn test_reqif_roundtrip() {
    let original = vec![
        make_artifact_full(
            "REQ-001",
            "requirement",
            "Memory isolation requirement",
            Some("approved"),
            &["safety", "core"],
            vec![],
            {
                let mut f = BTreeMap::new();
                f.insert("priority".into(), serde_yaml::Value::String("must".into()));
                f
            },
        ),
        make_artifact_full(
            "REQ-002",
            "requirement",
            "Access control",
            Some("draft"),
            &["security"],
            vec![Link {
                link_type: "derives-from".into(),
                target: "REQ-001".into(),
            }],
            BTreeMap::new(),
        ),
        make_artifact_full(
            "TC-001",
            "test-case",
            "Verify memory isolation",
            None,
            &[],
            vec![Link {
                link_type: "verifies".into(),
                target: "REQ-001".into(),
            }],
            BTreeMap::new(),
        ),
    ];

    let adapter = ReqIfAdapter::new();
    let config = AdapterConfig::default();

    // Export
    let xml_bytes = adapter.export(&original, &config).expect("export to ReqIF");
    let xml_str = std::str::from_utf8(&xml_bytes).expect("valid utf-8");

    // Verify XML structure
    assert!(
        xml_str.contains("<?xml version=\"1.0\" encoding=\"UTF-8\"?>"),
        "must have XML declaration"
    );
    assert!(xml_str.contains("REQ-IF"), "must have REQ-IF root element");
    assert!(
        xml_str.contains("THE-HEADER"),
        "must have THE-HEADER element"
    );
    assert!(
        xml_str.contains("SPEC-OBJECTS"),
        "must have SPEC-OBJECTS element"
    );
    assert!(
        xml_str.contains("SPEC-RELATIONS"),
        "must have SPEC-RELATIONS element"
    );
    assert!(
        xml_str.contains("SPEC-OBJECT-TYPE"),
        "must have SPEC-OBJECT-TYPE"
    );
    assert!(
        xml_str.contains("SPEC-RELATION-TYPE"),
        "must have SPEC-RELATION-TYPE"
    );
    assert!(
        xml_str.contains("http://www.omg.org/spec/ReqIF/20110401/reqif.xsd"),
        "must use ReqIF 1.2 namespace"
    );
    assert!(
        xml_str.contains("DATATYPE-DEFINITION-STRING"),
        "must have DATATYPES"
    );

    // Reimport
    let reimported = adapter
        .import(&AdapterSource::Bytes(xml_bytes), &config)
        .expect("reimport from ReqIF");

    assert_eq!(
        reimported.len(),
        original.len(),
        "artifact count must match"
    );

    for (orig, re) in original.iter().zip(reimported.iter()) {
        assert_eq!(orig.id, re.id, "id mismatch for {}", orig.id);
        assert_eq!(
            orig.artifact_type, re.artifact_type,
            "artifact_type mismatch for {}",
            orig.id
        );
        assert_eq!(orig.title, re.title, "title mismatch for {}", orig.id);
        assert_eq!(
            orig.description, re.description,
            "description mismatch for {}",
            orig.id
        );
        assert_eq!(orig.status, re.status, "status mismatch for {}", orig.id);
        assert_eq!(orig.tags, re.tags, "tags mismatch for {}", orig.id);
        assert_eq!(
            orig.links.len(),
            re.links.len(),
            "links count mismatch for {}",
            orig.id
        );
        for (ol, rl) in orig.links.iter().zip(re.links.iter()) {
            assert_eq!(ol.link_type, rl.link_type, "link_type mismatch");
            assert_eq!(ol.target, rl.target, "link target mismatch");
        }
        assert_eq!(orig.fields, re.fields, "fields mismatch for {}", orig.id);
    }
}

/// Verify that ReqIF-exported artifacts can be loaded into a Store and
/// participate in link-graph analysis.
#[test]
fn test_reqif_store_integration() {
    let artifacts = vec![
        make_artifact_full(
            "SYS-001",
            "system-req",
            "System requirement",
            Some("approved"),
            &[],
            vec![],
            BTreeMap::new(),
        ),
        make_artifact_full(
            "SW-001",
            "sw-req",
            "Software requirement",
            Some("approved"),
            &[],
            vec![Link {
                link_type: "derives-from".into(),
                target: "SYS-001".into(),
            }],
            BTreeMap::new(),
        ),
    ];

    let adapter = ReqIfAdapter::new();
    let config = AdapterConfig::default();

    // Export then reimport via ReqIF.
    let xml_bytes = adapter.export(&artifacts, &config).expect("export");
    let reimported = adapter
        .import(&AdapterSource::Bytes(xml_bytes), &config)
        .expect("reimport");

    // Load into a store.
    let mut store = Store::new();
    for a in reimported {
        store.upsert(a);
    }

    assert_eq!(store.len(), 2);
    assert!(store.contains("SYS-001"));
    assert!(store.contains("SW-001"));

    let sw = store.get("SW-001").unwrap();
    assert_eq!(sw.links.len(), 1);
    assert_eq!(sw.links[0].link_type, "derives-from");
    assert_eq!(sw.links[0].target, "SYS-001");
}

// ── Diff: identical stores ──────────────────────────────────────────────

/// Two identical stores should produce an empty diff.
#[test]
fn test_diff_identical_stores() {
    let mut base = Store::new();
    base.insert(make_artifact("D-1", "loss", "Loss one"))
        .unwrap();
    base.insert(make_artifact("D-2", "hazard", "Hazard one"))
        .unwrap();

    let mut head = Store::new();
    head.insert(make_artifact("D-1", "loss", "Loss one"))
        .unwrap();
    head.insert(make_artifact("D-2", "hazard", "Hazard one"))
        .unwrap();

    let diff = ArtifactDiff::compute(&base, &head);
    assert!(diff.is_empty(), "identical stores must produce empty diff");
    assert_eq!(diff.unchanged, 2);
    assert_eq!(
        diff.summary(),
        "0 added, 0 removed, 0 modified, 2 unchanged"
    );
}

// ── Diff: added artifact ────────────────────────────────────────────────

/// An artifact present in head but not in base should appear as added.
#[test]
fn test_diff_added_artifact() {
    let mut base = Store::new();
    base.insert(make_artifact("D-1", "loss", "Loss one"))
        .unwrap();

    let mut head = Store::new();
    head.insert(make_artifact("D-1", "loss", "Loss one"))
        .unwrap();
    head.insert(make_artifact("D-2", "hazard", "Hazard new"))
        .unwrap();

    let diff = ArtifactDiff::compute(&base, &head);
    assert!(!diff.is_empty());
    assert_eq!(diff.added, vec!["D-2".to_string()]);
    assert!(diff.removed.is_empty());
    assert!(diff.modified.is_empty());
    assert_eq!(diff.unchanged, 1);
}

// ── Diff: removed artifact ──────────────────────────────────────────────

/// An artifact present in base but not in head should appear as removed.
#[test]
fn test_diff_removed_artifact() {
    let mut base = Store::new();
    base.insert(make_artifact("D-1", "loss", "Loss one"))
        .unwrap();
    base.insert(make_artifact("D-2", "hazard", "Hazard one"))
        .unwrap();

    let mut head = Store::new();
    head.insert(make_artifact("D-1", "loss", "Loss one"))
        .unwrap();

    let diff = ArtifactDiff::compute(&base, &head);
    assert!(!diff.is_empty());
    assert!(diff.added.is_empty());
    assert_eq!(diff.removed, vec!["D-2".to_string()]);
    assert!(diff.modified.is_empty());
    assert_eq!(diff.unchanged, 1);
}

// ── Diff: modified artifact (title, status, links, fields) ──────────────

/// Artifacts that exist in both stores but differ structurally should appear
/// as modified with all changed fields recorded.
#[test]
fn test_diff_modified_artifact() {
    let mut base = Store::new();
    base.insert(make_artifact_full(
        "M-1",
        "requirement",
        "Old title",
        Some("draft"),
        &["safety"],
        vec![Link {
            link_type: "satisfies".into(),
            target: "M-2".into(),
        }],
        {
            let mut f = BTreeMap::new();
            f.insert(
                "priority".into(),
                serde_yaml::Value::String("should".into()),
            );
            f
        },
    ))
    .unwrap();

    let mut head = Store::new();
    head.insert(make_artifact_full(
        "M-1",
        "requirement",
        "New title",
        Some("approved"),
        &["safety", "core"],
        vec![
            Link {
                link_type: "satisfies".into(),
                target: "M-2".into(),
            },
            Link {
                link_type: "derives-from".into(),
                target: "M-3".into(),
            },
        ],
        {
            let mut f = BTreeMap::new();
            f.insert("priority".into(), serde_yaml::Value::String("must".into()));
            f
        },
    ))
    .unwrap();

    let diff = ArtifactDiff::compute(&base, &head);
    assert!(!diff.is_empty());
    assert!(diff.added.is_empty());
    assert!(diff.removed.is_empty());
    assert_eq!(diff.modified.len(), 1);

    let change = &diff.modified[0];
    assert_eq!(change.id, "M-1");

    // Title changed
    assert_eq!(
        change.title_changed,
        Some(("Old title".into(), "New title".into()))
    );

    // Status changed
    assert_eq!(
        change.status_changed,
        Some((Some("draft".into()), Some("approved".into())))
    );

    // Tags: "core" added, nothing removed
    assert_eq!(change.tags_added, vec!["core".to_string()]);
    assert!(change.tags_removed.is_empty());

    // Links: derives-from -> M-3 added, nothing removed
    assert_eq!(change.links_added.len(), 1);
    assert_eq!(change.links_added[0].link_type, "derives-from");
    assert_eq!(change.links_added[0].target, "M-3");
    assert!(change.links_removed.is_empty());

    // Fields: priority changed
    assert_eq!(change.fields_changed, vec!["priority".to_string()]);

    // Description unchanged (both have one via make_artifact_full)
    assert!(!change.description_changed);
}

// ── Diff: diagnostic changes ────────────────────────────────────────────

/// Diagnostics that appear only in head are "new"; those only in base are
/// "resolved".
#[test]
fn test_diff_diagnostic_changes() {
    let base_diags = vec![
        validate::Diagnostic {
            severity: Severity::Error,
            artifact_id: Some("X-1".into()),
            rule: "broken-link".into(),
            message: "link target missing".into(),
        },
        validate::Diagnostic {
            severity: Severity::Warning,
            artifact_id: Some("X-2".into()),
            rule: "allowed-values".into(),
            message: "bad value".into(),
        },
    ];

    let head_diags = vec![
        // The error on X-1 is resolved (not present in head)
        // A new error appears on X-3
        validate::Diagnostic {
            severity: Severity::Error,
            artifact_id: Some("X-3".into()),
            rule: "required-field".into(),
            message: "missing field".into(),
        },
        // The warning on X-2 persists
        validate::Diagnostic {
            severity: Severity::Warning,
            artifact_id: Some("X-2".into()),
            rule: "allowed-values".into(),
            message: "bad value".into(),
        },
    ];

    let ddiff = DiagnosticDiff::compute(&base_diags, &head_diags);

    assert_eq!(ddiff.new_errors.len(), 1);
    assert_eq!(ddiff.new_errors[0].artifact_id.as_deref(), Some("X-3"));

    assert_eq!(ddiff.resolved_errors.len(), 1);
    assert_eq!(ddiff.resolved_errors[0].artifact_id.as_deref(), Some("X-1"));

    assert!(ddiff.new_warnings.is_empty());
    assert!(ddiff.resolved_warnings.is_empty());

    assert_eq!(
        ddiff.summary(),
        "1 new errors, 1 resolved errors, 0 new warnings, 0 resolved warnings"
    );
}

// ── AADL adapter ─────────────────────────────────────────────────────────

#[test]
fn aadl_adapter_parses_spar_json() {
    use rivet_core::adapter::{Adapter, AdapterConfig, AdapterSource};
    use rivet_core::formats::aadl::AadlAdapter;

    let json = r#"{
        "root": "Pkg::Sys.Impl",
        "packages": [
            {
                "name": "Pkg",
                "component_types": [
                    { "name": "Sys", "category": "System" }
                ],
                "component_impls": [
                    { "name": "Sys.Impl", "category": "System" }
                ]
            }
        ],
        "instance": null,
        "diagnostics": [
            {
                "severity": "Warning",
                "message": "No binding for cpu1",
                "path": ["root", "cpu1"],
                "analysis": "binding_check"
            }
        ]
    }"#;

    let adapter = AadlAdapter::new();
    let source = AdapterSource::Bytes(json.as_bytes().to_vec());
    let config = AdapterConfig::default();
    let artifacts = adapter.import(&source, &config).unwrap();

    // 1 type + 1 impl + 1 diagnostic = 3 artifacts
    assert_eq!(artifacts.len(), 3);
    assert!(artifacts.iter().any(|a| a.artifact_type == "aadl-component" && a.id == "AADL-Pkg-Sys"));
    assert!(artifacts.iter().any(|a| a.artifact_type == "aadl-component" && a.id == "AADL-Pkg-Sys.Impl"));
    assert!(artifacts.iter().any(|a| a.artifact_type == "aadl-analysis-result"));
}

// ── AADL schema ──────────────────────────────────────────────────────────

#[test]
fn aadl_schema_loads() {
    let schemas_dir = std::path::Path::new(env!("CARGO_MANIFEST_DIR"))
        .parent()
        .unwrap()
        .join("schemas");
    let common = rivet_core::schema::Schema::load_file(&schemas_dir.join("common.yaml")).unwrap();
    let aadl = rivet_core::schema::Schema::load_file(&schemas_dir.join("aadl.yaml")).unwrap();
    let merged = rivet_core::schema::Schema::merge(&[common, aadl]);
    assert!(merged.artifact_type("aadl-component").is_some());
    assert!(merged.artifact_type("aadl-analysis-result").is_some());
    assert!(merged.artifact_type("aadl-flow").is_some());
    assert!(merged.link_type("modeled-by").is_some());
}
