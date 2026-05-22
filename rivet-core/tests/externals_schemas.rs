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

//! Integration tests for externally-prefixed artifact validation.
//!
//! Issue #245 originally type-checked externally-prefixed artifacts against
//! the external's own schema (loaded via the external loader) so a consumer
//! whose schema set differs from the supplier's would not see spurious
//! `unknown artifact type` ERRORs. REQ-082 (v0.11.1) supersedes that: a
//! consumer's default `rivet validate` gate must reflect only the consumer's
//! own artifacts, so externally-prefixed artifacts are skipped by every
//! per-artifact validation pass entirely — they are loaded ONLY so the
//! consumer's `prefix:ID` cross-links resolve. The external's own
//! diagnostics are opt-in via `rivet validate --with-externals-validate`
//! (REQ-065 / AoU-X1). The external-loader half (`load_all_externals`
//! surfacing the supplier's schema) is still exercised here — that loader
//! feeds `--with-externals-validate`.

use rivet_core::externals::{load_all_externals, load_external_project};
use rivet_core::links::LinkGraph;
use rivet_core::model::ExternalProject;
use rivet_core::model::{Artifact, Link};
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

/// REQ-082 supersedes the issue-#245 design this test originally pinned.
/// #245 type-checked externally-prefixed artifacts against the external's
/// own schema to suppress spurious `unknown artifact type` ERRORs. REQ-082
/// goes further: externally-prefixed (`spar:`) artifacts are loaded only so
/// the consumer's cross-links resolve, and are skipped by the schema
/// per-artifact passes (type, fields, link-type, shorthand, variant-key) —
/// the supplier's project is the supplier's gate
/// (`--with-externals-validate` / AoU-X1). So a `spar:`-prefixed
/// `aadl-component` produces NO `known-type` diagnostic whether or not the
/// external's schema is registered.
///
/// (Cross-link integrity — the `broken-link` pass — deliberately still runs
/// over the full store so consumer→external links resolve; that pass is not
/// a schema check and is out of scope here. The CLI's REQ-082 filter drops
/// any residual prefixed-artifact diagnostics before the gate count.)
///
/// rivet: verifies REQ-082
#[test]
fn external_prefixed_artifacts_skip_type_checking() {
    let fixture = spar_fixture_dir();
    let (artifacts, ext_schema) = load_external_project(&fixture).unwrap();

    // Build a downstream-shaped store: simulate prefixing with `spar:`.
    let mut store = Store::new();
    for mut a in artifacts {
        a.id = format!("spar:{}", a.id);
        store.upsert(a);
    }

    // Downstream's own schema declares only `common`; `aadl-component` is
    // NOT in it — pre-REQ-082 this produced an ERROR per spar artifact.
    let downstream_schema = rivet_core::load_schemas(
        &["common".to_string()],
        &PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../schemas"),
    )
    .expect("loading downstream-only schemas");
    assert!(
        downstream_schema.artifact_type("aadl-component").is_none(),
        "downstream-only schema must NOT declare 'aadl-component' for the \
         test to be meaningful"
    );
    let graph = LinkGraph::build(&store, &downstream_schema);

    // Every per-artifact diagnostic pass skips prefixed artifacts under
    // REQ-082. The graph-level `broken-link` pass is deliberately exempt
    // (it reads the full store so consumer→external links resolve), so it
    // is carved out here — the test asserts on the per-artifact passes.
    let schema_diags = |diags: &[rivet_core::validate::Diagnostic]| -> Vec<(String, String)> {
        diags
            .iter()
            .filter(|d| {
                d.artifact_id
                    .as_deref()
                    .is_some_and(|id| id.starts_with("spar:"))
                    && d.rule != "broken-link"
            })
            .map(|d| (d.rule.clone(), d.message.clone()))
            .collect()
    };

    // REQ-082: with NO external schema registered, spar-prefixed artifacts
    // produce zero per-artifact diagnostics — they are skipped, not checked.
    let no_ext =
        validate_with_externals(&store, &downstream_schema, &graph, &ExternalSchemas::new());
    assert_eq!(
        schema_diags(&no_ext),
        Vec::<(String, String)>::new(),
        "REQ-082: externally-prefixed artifacts must produce no schema \
         per-artifact diagnostics even with no external schema registered"
    );

    // Registering the external's own schema changes nothing — prefixed
    // artifacts are skipped regardless.
    let mut externals = ExternalSchemas::new();
    externals.insert("spar".to_string(), ext_schema);
    let with_ext = validate_with_externals(&store, &downstream_schema, &graph, &externals);
    assert_eq!(
        schema_diags(&with_ext),
        Vec::<(String, String)>::new(),
        "REQ-082: registering the external's schema must not resurrect \
         schema per-artifact diagnostics on prefixed artifacts"
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

/// REQ-082: a `prefix:`-qualified external artifact whose type the consumer
/// cannot resolve produces NO `known-type` diagnostic at all — not ERROR,
/// not the issue-#245 INFO demote. The supplier's types are the supplier's
/// concern (AoU-X1); the consumer only loads external artifacts so its own
/// `prefix:ID` cross-links resolve. Registration state of the prefix in
/// `ExternalSchemas` is irrelevant — prefixed artifacts are skipped before
/// the type check runs.
///
/// rivet: verifies REQ-082
#[test]
fn external_prefixed_unknown_type_is_not_diagnosed() {
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

    let known_type_diags = |diags: &[rivet_core::validate::Diagnostic]| -> usize {
        diags
            .iter()
            .filter(|d| {
                d.rule == "known-type" && d.artifact_id.as_deref() == Some("supplier:THING-1")
            })
            .count()
    };

    // No externals registered: still zero — the artifact is prefixed, so
    // REQ-082 skips it before the type check.
    let no_ext =
        validate_with_externals(&store, &downstream_schema, &graph, &ExternalSchemas::new());
    assert_eq!(
        known_type_diags(&no_ext),
        0,
        "REQ-082: a prefixed external artifact must produce no known-type \
         diagnostic even with no ExternalSchemas registered"
    );

    // Prefix registered with `None` schema: unchanged — still zero.
    let mut externals = ExternalSchemas::new();
    externals.insert("supplier".to_string(), None);
    let with_none = validate_with_externals(&store, &downstream_schema, &graph, &externals);
    assert_eq!(
        known_type_diags(&with_none),
        0,
        "REQ-082: registering the prefix must not resurrect a known-type \
         diagnostic on a prefixed external artifact"
    );
}

/// REQ-082 link-type symmetry: an externally-prefixed artifact is skipped by
/// the per-artifact unknown-link-type pass exactly as it is by the type-check
/// pass, so a link type the consumer's schema does not declare is never
/// flagged on a `prefix:`-qualified artifact — with or without the prefix
/// registered in `ExternalSchemas`.
///
/// rivet: verifies REQ-082
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

    let link_type_diags = |diags: &[rivet_core::validate::Diagnostic]| -> usize {
        diags
            .iter()
            .filter(|d| {
                d.rule == "unknown-link-type" && d.artifact_id.as_deref() == Some("spar:SPAR-X-001")
            })
            .count()
    };

    // No externals registered.
    let no_ext =
        validate_with_externals(&store, &downstream_schema, &graph, &ExternalSchemas::new());
    assert_eq!(
        link_type_diags(&no_ext),
        0,
        "REQ-082: a prefixed external artifact must produce no \
         unknown-link-type diagnostic even with no ExternalSchemas registered"
    );

    // Prefix registered with no schema — unchanged.
    let mut externals = ExternalSchemas::new();
    externals.insert("spar".to_string(), None);
    let with_none = validate_with_externals(&store, &downstream_schema, &graph, &externals);
    assert_eq!(
        link_type_diags(&with_none),
        0,
        "REQ-082: registering the prefix must not resurrect an \
         unknown-link-type diagnostic on a prefixed external artifact"
    );
}
