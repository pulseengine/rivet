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

//! Operation-sequence property testing for Store invariants.
//!
//! Generates random sequences of insert/upsert/validate/link-graph operations
//! and verifies that Store invariants hold after every operation.  This is the
//! rivet equivalent of gale's "random operation sequences verifying invariants."
//!
//! Invariants checked after every step:
//! - store.len() == number of unique IDs inserted
//! - store.get(id) returns Some for every inserted ID
//! - store.by_type(t) contains exactly the IDs of that type
//! - store.types_total() == store.len()
//! - LinkGraph backlink symmetry holds
//! - validate() never panics
//! - validate() is deterministic (same input → same output)

use proptest::prelude::*;
use std::collections::{BTreeMap, BTreeSet};

use rivet_core::links::LinkGraph;
use rivet_core::model::{Artifact, Link};
use rivet_core::schema::{
    ArtifactTypeDef, LinkTypeDef, Schema, SchemaFile, SchemaMetadata, Severity, TraceabilityRule,
};
use rivet_core::store::Store;
use rivet_core::validate;

// ── Strategies ──────────────────────────────────────────────────────────

const TYPES: &[&str] = &["requirement", "feature", "design-decision", "hazard"];
const LINK_TYPES: &[&str] = &["satisfies", "implements", "verifies", "mitigates"];

fn arb_id() -> impl Strategy<Value = String> {
    (
        prop::sample::select(vec!["REQ", "FEAT", "DD", "H"]),
        1..200u32,
    )
        .prop_map(|(prefix, num)| format!("{prefix}-{num:03}"))
}

fn arb_type() -> impl Strategy<Value = String> {
    prop::sample::select(TYPES.iter().map(|s| s.to_string()).collect::<Vec<_>>())
}

fn arb_link_type() -> impl Strategy<Value = String> {
    prop::sample::select(LINK_TYPES.iter().map(|s| s.to_string()).collect::<Vec<_>>())
}

fn make_artifact(id: &str, artifact_type: &str) -> Artifact {
    Artifact {
        id: id.into(),
        artifact_type: artifact_type.into(),
        title: format!("Title for {id}"),
        description: None,
        status: Some("approved".into()),
        tags: vec![],
        links: vec![],
        fields: BTreeMap::new(),
        provenance: None,
        source_file: None,
    }
}

fn make_artifact_with_links(id: &str, artifact_type: &str, links: Vec<Link>) -> Artifact {
    Artifact {
        id: id.into(),
        artifact_type: artifact_type.into(),
        title: format!("Title for {id}"),
        description: None,
        status: Some("approved".into()),
        tags: vec![],
        links,
        fields: BTreeMap::new(),
        provenance: None,
        source_file: None,
    }
}

/// A test schema with all our test types and link types defined.
fn test_schema() -> Schema {
    Schema::merge(&[SchemaFile {
        schema: SchemaMetadata {
            name: "opseq-test".into(),
            version: "0.1.0".into(),
            namespace: None,
            description: None,
            extends: vec![],
            min_rivet_version: None,
            license: None,
        },
        base_fields: vec![],
        artifact_types: TYPES
            .iter()
            .map(|t| ArtifactTypeDef {
                name: t.to_string(),
                description: format!("Test type {t}"),
                fields: vec![],
                link_fields: vec![],
                aspice_process: None,
                common_mistakes: vec![],
                example: None,
                yaml_section: None,
                yaml_sections: vec![],
                yaml_section_suffix: None,
                shorthand_links: BTreeMap::new(),
            })
            .collect(),
        link_types: LINK_TYPES
            .iter()
            .map(|lt| LinkTypeDef {
                name: lt.to_string(),
                inverse: Some(format!("{lt}-inverse")),
                description: format!("Test link type {lt}"),
                source_types: vec![],
                target_types: vec![],
            })
            .collect(),
        traceability_rules: vec![TraceabilityRule {
            name: "req-satisfied".into(),
            description: "Requirements must be satisfied".into(),
            source_type: "requirement".into(),
            required_link: None,
            required_backlink: Some("satisfies".into()),
            target_types: vec![],
            from_types: vec!["feature".into()],
            severity: Severity::Warning,
            alternate_backlinks: vec![],
        }],
        conditional_rules: vec![],
    }])
}

/// An operation on the store.
#[derive(Debug, Clone)]
enum Op {
    Insert {
        id: String,
        artifact_type: String,
    },
    Upsert {
        id: String,
        artifact_type: String,
    },
    InsertWithLink {
        id: String,
        artifact_type: String,
        link_type: String,
        target: String,
    },
    ValidateAndCheck,
}

fn arb_op() -> impl Strategy<Value = Op> {
    prop_oneof![
        // 40% inserts
        (arb_id(), arb_type()).prop_map(|(id, t)| Op::Insert {
            id,
            artifact_type: t
        }),
        // 20% upserts
        (arb_id(), arb_type()).prop_map(|(id, t)| Op::Upsert {
            id,
            artifact_type: t
        }),
        // 30% inserts with links
        (arb_id(), arb_type(), arb_link_type(), arb_id()).prop_map(|(id, t, lt, target)| {
            Op::InsertWithLink {
                id,
                artifact_type: t,
                link_type: lt,
                target,
            }
        }),
        // 10% validate
        Just(Op::ValidateAndCheck),
    ]
}

fn arb_op_sequence(n: std::ops::Range<usize>) -> impl Strategy<Value = Vec<Op>> {
    prop::collection::vec(arb_op(), n)
}

// ── Invariant checks ────────────────────────────────────────────────────

/// Verify all store invariants hold.
fn check_store_invariants(store: &Store, expected_ids: &BTreeSet<String>) {
    // Invariant 1: len matches expected unique IDs
    assert_eq!(
        store.len(),
        expected_ids.len(),
        "store.len() must match expected ID count"
    );

    // Invariant 2: every expected ID is retrievable
    for id in expected_ids {
        assert!(store.get(id).is_some(), "store.get({id}) must return Some");
        assert!(store.contains(id), "store.contains({id}) must be true");
    }

    // Invariant 3: types_total == len
    assert_eq!(
        store.types_total(),
        store.len(),
        "types_total() must equal len()"
    );

    // Invariant 4: by_type consistency
    let mut type_sum = 0usize;
    for t in TYPES {
        let ids = store.by_type(t);
        type_sum += ids.len();
        for id in ids {
            let art = store.get(id).expect("by_type ID must exist in store");
            assert_eq!(
                &art.artifact_type, *t,
                "artifact {id} type mismatch: expected {t}, got {}",
                art.artifact_type
            );
        }
    }
    // type_sum may be less than len() if artifacts have types not in TYPES
    // but in our test all types are from TYPES
    assert_eq!(
        type_sum,
        store.len(),
        "sum of by_type counts must equal len()"
    );
}

/// Verify link graph backlink symmetry.
fn check_backlink_symmetry(store: &Store, schema: &Schema) {
    let graph = LinkGraph::build(store, schema);

    for artifact in store.iter() {
        for link in graph.links_from(&artifact.id) {
            // If target exists in store, there must be a backlink
            if store.contains(&link.target) {
                let backlinks = graph.backlinks_to(&link.target);
                let has_backlink = backlinks.iter().any(|bl| bl.source == artifact.id);
                assert!(
                    has_backlink,
                    "forward link {} -> {} ({}) has no backlink",
                    artifact.id, link.target, link.link_type
                );
            }
        }
    }
}

// ── Property tests ──────────────────────────────────────────────────────

proptest! {
    #![proptest_config(ProptestConfig::with_cases(50))]

    /// Random operation sequences maintain all store invariants.
    #[test]
    fn operation_sequence_preserves_invariants(ops in arb_op_sequence(1..30)) {
        let schema = test_schema();
        let mut store = Store::new();
        let mut expected_ids = BTreeSet::new();
        let mut expected_types: BTreeMap<String, String> = BTreeMap::new();

        for op in &ops {
            match op {
                Op::Insert { id, artifact_type } => {
                    let art = make_artifact(id, artifact_type);
                    if store.insert(art).is_ok() {
                        expected_ids.insert(id.clone());
                        expected_types.insert(id.clone(), artifact_type.clone());
                    }
                    // Duplicate insert must fail
                    if expected_ids.contains(id) {
                        let dup = make_artifact(id, artifact_type);
                        prop_assert!(store.insert(dup).is_err());
                    }
                }
                Op::Upsert { id, artifact_type } => {
                    let art = make_artifact(id, artifact_type);
                    store.upsert(art);
                    expected_ids.insert(id.clone());
                    expected_types.insert(id.clone(), artifact_type.clone());
                }
                Op::InsertWithLink { id, artifact_type, link_type, target } => {
                    let links = vec![Link {
                        link_type: link_type.clone(),
                        target: target.clone(),
                    }];
                    let art = make_artifact_with_links(id, artifact_type, links);
                    if store.insert(art).is_ok() {
                        expected_ids.insert(id.clone());
                        expected_types.insert(id.clone(), artifact_type.clone());
                    }
                }
                Op::ValidateAndCheck => {
                    let graph = LinkGraph::build(&store, &schema);
                    // Must not panic
                    let diags1 = validate::validate(&store, &schema, &graph);
                    // Determinism: same input → same output
                    let diags2 = validate::validate(&store, &schema, &graph);
                    prop_assert_eq!(
                        diags1.len(), diags2.len(),
                        "validation must be deterministic"
                    );
                    for (d1, d2) in diags1.iter().zip(diags2.iter()) {
                        prop_assert_eq!(&d1.message, &d2.message);
                        prop_assert_eq!(&d1.rule, &d2.rule);
                    }
                }
            }

            // Check invariants after every operation
            check_store_invariants(&store, &expected_ids);
        }

        // Final backlink symmetry check
        check_backlink_symmetry(&store, &schema);
    }

    /// Random insert sequences followed by validate never panic.
    #[test]
    fn bulk_insert_then_validate_no_panic(
        ids in prop::collection::vec(arb_id(), 1..50),
        types in prop::collection::vec(arb_type(), 1..50),
    ) {
        let schema = test_schema();
        let mut store = Store::new();

        for (id, t) in ids.iter().zip(types.iter().cycle()) {
            let _ = store.insert(make_artifact(id, t));
        }

        let graph = LinkGraph::build(&store, &schema);
        let _ = validate::validate(&store, &schema, &graph);
        // Reaching here proves no panic occurred
    }

    /// Upsert type changes maintain index consistency.
    #[test]
    fn upsert_type_change_preserves_invariants(
        id in arb_id(),
        type1 in arb_type(),
        type2 in arb_type(),
    ) {
        let mut store = Store::new();
        let mut expected_ids = BTreeSet::new();

        // Insert with type1
        store.upsert(make_artifact(&id, &type1));
        expected_ids.insert(id.clone());
        check_store_invariants(&store, &expected_ids);
        prop_assert_eq!(&store.get(&id).unwrap().artifact_type, &type1);

        // Upsert with type2 (may be same or different)
        store.upsert(make_artifact(&id, &type2));
        check_store_invariants(&store, &expected_ids);
        prop_assert_eq!(&store.get(&id).unwrap().artifact_type, &type2);

        // Must still have exactly 1 artifact
        prop_assert_eq!(store.len(), 1);
    }
}
