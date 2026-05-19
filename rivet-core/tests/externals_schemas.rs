// SAFETY-REVIEW (SCRC Phase 1, DD-058): Integration test code; same blanket
// allow as the rest of `rivet-core/tests/` — see externals_sync.rs for the
// rationale.
#![allow(
    clippy::unwrap_used,
    clippy::expect_used,
    clippy::indexing_slicing,
    clippy::panic,
    clippy::print_stdout,
    clippy::print_stderr
)]

//! Integration tests for issue #245: externals must load their own schemas
//! so externally-prefixed artifacts type-check against the schemas they were
//! authored under, not the downstream's.
//!
//! Without this fix, sigil's repro produces 326 `unknown artifact type`
//! ERRORs on synth-prefixed artifacts (types defined in synth's schemas
//! but not in sigil's). After the fix, those errors collapse to zero.

use rivet_core::externals::{load_all_externals, load_external_project};
use rivet_core::links::LinkGraph;
use rivet_core::model::ExternalProject;
use rivet_core::model::{Artifact, Link};
use rivet_core::schema::Severity;
use rivet_core::store::Store;
use rivet_core::validate::{ExternalSchemas, validate_with_externals};
use std::collections::BTreeMap;
use std::path::PathBuf;

fn spar_fixture_dir() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("..")
        .join("tests")
        .join("fixtures")
        .join("spar-external")
}

/// Simulates the sigil-loading-synth scenario. Downstream declares only
/// `common`; the external declares `common + aadl`. Before this fix, the
/// downstream's validator produced an ERROR for every synth-prefixed
/// `aadl-component` artifact. With the fix, the external's schema resolves
/// the type and the validator stays silent.
///
/// rivet: verifies REQ-007
#[test]
fn external_schemas_eliminate_spurious_unknown_type_errors() {
    let fixture = spar_fixture_dir();
    let (artifacts, ext_schema) = load_external_project(&fixture).unwrap();
    assert!(
        ext_schema.is_some(),
        "spar fixture declares schemas; loader must surface them"
    );
    let ext_schema = ext_schema.unwrap();
    assert!(
        ext_schema.artifact_type("aadl-component").is_some(),
        "fixture's aadl schema declares 'aadl-component'"
    );

    // Build a downstream-shaped store: simulate prefixing with `spar:`.
    let mut store = Store::new();
    for mut a in artifacts {
        a.id = format!("spar:{}", a.id);
        store.upsert(a);
    }

    // Downstream's own schema declares only `common`. `aadl-component` is
    // NOT in it — exactly the sigil scenario.
    let downstream_schema = rivet_core::load_schemas(
        &["common".to_string()],
        &PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../schemas"),
    )
    .expect("loading downstream-only schemas");
    assert!(
        downstream_schema.artifact_type("aadl-component").is_none(),
        "downstream-only schema must NOT declare 'aadl-component' for the test \
         to be meaningful (the fix removes spurious errors)"
    );

    let graph = LinkGraph::build(&store, &downstream_schema);

    let aadl_count = |diags: &[rivet_core::validate::Diagnostic]| -> usize {
        diags
            .iter()
            .filter(|d| {
                d.rule == "known-type"
                    && d.severity == Severity::Error
                    && d.artifact_id
                        .as_deref()
                        .is_some_and(|id| id.starts_with("spar:"))
                    && d.message.contains("aadl-component")
            })
            .count()
    };

    // 1) Externals-unaware validation reproduces the bug: every spar-prefixed
    //    `aadl-component` artifact yields an `unknown artifact type` ERROR.
    let baseline =
        validate_with_externals(&store, &downstream_schema, &graph, &ExternalSchemas::new());
    assert!(
        aadl_count(&baseline) > 0,
        "without the fix, externally-prefixed aadl-component artifacts must \
         generate 'unknown artifact type' ERRORs — this baseline pins the \
         pre-fix behaviour. all diags: {:?}",
        baseline.iter().map(|d| &d.message).collect::<Vec<_>>()
    );

    // 2) With the external's own schema in the per-prefix map, those errors
    //    must not appear. Other unrelated diagnostics may remain (e.g. the
    //    spar fixture has a `requirement` artifact whose type is declared in
    //    `dev.yaml`, which neither the downstream nor the external loaded);
    //    we only assert on the AC-relevant aadl-component path.
    let mut externals = ExternalSchemas::new();
    externals.insert("spar".to_string(), Some(ext_schema));
    let fixed = validate_with_externals(&store, &downstream_schema, &graph, &externals);
    assert_eq!(
        aadl_count(&fixed),
        0,
        "with the external's schema registered, externally-prefixed \
         aadl-component artifacts must NOT generate 'unknown artifact type' \
         ERRORs. still seeing: {:?}",
        fixed
            .iter()
            .filter(|d| d.rule == "known-type")
            .map(|d| (&d.artifact_id, &d.message))
            .collect::<Vec<_>>()
    );
}

/// load_all_externals must populate `ResolvedExternal::schema` for any
/// external whose `rivet.yaml` declares schemas. This is the upstream half
/// of the AC bullet — without it the downstream loader has no schema to
/// register in the per-prefix map.
///
/// rivet: verifies REQ-007
#[test]
fn load_all_externals_populates_schema() {
    let fixture = spar_fixture_dir();
    let dir = tempfile::tempdir().unwrap();
    let mut externals = BTreeMap::new();
    externals.insert(
        "spar".into(),
        ExternalProject {
            git: None,
            path: Some(fixture.to_str().unwrap().into()),
            git_ref: None,
            prefix: "spar".into(),
        },
    );
    rivet_core::externals::sync_all(&externals, dir.path(), true).unwrap();

    let resolved = load_all_externals(&externals, dir.path()).unwrap();
    assert_eq!(resolved.len(), 1);
    let ext = &resolved[0];
    assert_eq!(ext.prefix, "spar");
    let schema = ext
        .schema
        .as_ref()
        .expect("spar's rivet.yaml declares schemas; must surface");
    // spar fixture declares schemas: [common, aadl] — aadl declares
    // 'aadl-component'.
    assert!(
        schema.artifact_type("aadl-component").is_some(),
        "aadl schema must surface 'aadl-component' through the external loader"
    );
}

/// Permissive-fallback: when an external is registered with `schema: None`
/// (because its `rivet.yaml` declared no schemas, or its schemas failed to
/// load), unknown-type findings for that prefix get demoted from ERROR to
/// INFO so the downstream isn't spammed by an external it cannot type-check.
///
/// rivet: verifies REQ-007
#[test]
fn external_without_schema_demotes_unknown_type_to_info() {
    // Synthetic store: one artifact with a prefix whose external has no
    // schema. We do not need any artifacts on disk for this — the
    // permissive-fallback path is purely about `ExternalSchemas[prefix] ==
    // None` triggering the demote.
    let mut store = Store::new();
    store.upsert(Artifact {
        id: "supplier:THING-1".to_string(),
        artifact_type: "supplier-only-type".to_string(),
        title: "External thing".to_string(),
        description: None,
        status: None,
        tags: vec![],
        links: vec![],
        fields: BTreeMap::new(),
        fields_per_variant: Default::default(),
        provenance: None,
        source_file: None,
    });

    let downstream_schema = rivet_core::load_schemas(
        &["common".to_string()],
        &PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../schemas"),
    )
    .unwrap();
    let graph = LinkGraph::build(&store, &downstream_schema);

    // Unknown to downstream → ERROR (sanity: no externals registered).
    let baseline =
        validate_with_externals(&store, &downstream_schema, &graph, &ExternalSchemas::new());
    assert!(
        baseline.iter().any(|d| d.rule == "known-type"
            && d.severity == Severity::Error
            && d.artifact_id.as_deref() == Some("supplier:THING-1")),
        "baseline must emit unknown-type ERROR when no externals registered"
    );

    // Register the prefix with `None` schema → demote to INFO.
    let mut externals = ExternalSchemas::new();
    externals.insert("supplier".to_string(), None);
    let demoted = validate_with_externals(&store, &downstream_schema, &graph, &externals);
    let unknown_type: Vec<_> = demoted
        .iter()
        .filter(|d| d.rule == "known-type" && d.artifact_id.as_deref() == Some("supplier:THING-1"))
        .collect();
    assert_eq!(
        unknown_type.len(),
        1,
        "expected exactly one known-type diagnostic for supplier:THING-1"
    );
    assert_eq!(
        unknown_type[0].severity,
        Severity::Info,
        "with no schema registered for the prefix, unknown-type must be INFO, not ERROR"
    );
    assert!(
        unknown_type[0].message.contains("supplier"),
        "INFO message should name the external prefix"
    );
}

/// Unknown-link-type symmetry: a link type defined in the external's schema
/// but not the downstream's must NOT be flagged for externally-prefixed
/// artifacts. The fallback (no external schema) demotes to INFO.
///
/// rivet: verifies REQ-007
#[test]
fn external_link_types_are_not_flagged_unknown() {
    // Synthetic store: external artifact whose link uses a link-type
    // declared in the external's schema only.
    let mut store = Store::new();
    store.upsert(Artifact {
        id: "spar:SPAR-X-001".to_string(),
        artifact_type: "aadl-component".to_string(),
        title: "Component".to_string(),
        description: None,
        status: None,
        tags: vec![],
        // Use a link type that's likely defined in spar's aadl schema but
        // not in the downstream-only `common` schema set.
        links: vec![Link {
            link_type: "implements".to_string(),
            target: "spar:OTHER".to_string(),
            external: None,
        }],
        fields: BTreeMap::new(),
        fields_per_variant: Default::default(),
        provenance: None,
        source_file: None,
    });

    let downstream_schema = rivet_core::load_schemas(
        &["common".to_string()],
        &PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../schemas"),
    )
    .unwrap();
    let graph = LinkGraph::build(&store, &downstream_schema);

    // Permissive fallback: prefix registered with no schema.
    let mut externals = ExternalSchemas::new();
    externals.insert("spar".to_string(), None);
    let diags = validate_with_externals(&store, &downstream_schema, &graph, &externals);
    let link_type_diags: Vec<_> = diags
        .iter()
        .filter(|d| {
            d.rule == "unknown-link-type" && d.artifact_id.as_deref() == Some("spar:SPAR-X-001")
        })
        .collect();
    // If `implements` is in the downstream `common` schema, there will be
    // zero diagnostics. Otherwise, the demoted-to-INFO path should fire.
    for d in &link_type_diags {
        assert_eq!(
            d.severity,
            Severity::Info,
            "any unknown-link-type for an externally-prefixed artifact whose \
             external has no schema must be INFO, not ERROR. got: {d:?}",
        );
    }
}
