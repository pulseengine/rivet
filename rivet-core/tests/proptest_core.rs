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

//! Property-based tests (SWE.4 level) — property verification via proptest.
//!
//! These tests use randomized inputs to verify invariants of the core modules:
//! - Store insert/lookup consistency
//! - Schema merge idempotence
//! - Link graph backlink symmetry
//! - Validation determinism

use std::collections::{BTreeMap, HashSet};

use proptest::prelude::*;

use rivet_core::links::LinkGraph;
use rivet_core::model::{Artifact, Link};
use rivet_core::schema::Schema;
use rivet_core::store::Store;
use rivet_core::validate;

// ── Strategies ──────────────────────────────────────────────────────────

/// Generate a valid artifact ID: prefix + number.
fn arb_artifact_id() -> impl Strategy<Value = String> {
    (
        prop::sample::select(vec!["A", "B", "C", "REQ", "H", "L", "DD"]),
        1..1000u32,
    )
        .prop_map(|(prefix, num)| format!("{prefix}-{num}"))
}

/// Available types matching a minimal schema we'll use in tests.
const TEST_TYPES: &[&str] = &["loss", "hazard", "system-constraint", "controller"];

/// Generate a set of unique artifact IDs.
fn arb_unique_ids(count: usize) -> impl Strategy<Value = Vec<String>> {
    prop::collection::hash_set(arb_artifact_id(), count..=count)
        .prop_map(|s| s.into_iter().collect::<Vec<_>>())
}

/// Load a test schema from the project schemas directory.
fn test_schema() -> Schema {
    let schemas_dir = std::path::PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../schemas");
    let mut files = Vec::new();
    for name in &["common", "stpa"] {
        let path = schemas_dir.join(format!("{name}.yaml"));
        if path.exists() {
            files.push(Schema::load_file(&path).expect("load schema"));
        }
    }
    Schema::merge(&files)
}

// ── Store properties ────────────────────────────────────────────────────

proptest! {
    #![proptest_config(ProptestConfig::with_cases(50))]

    /// Insert N artifacts with unique IDs, verify store.len() == N,
    /// all retrievable by ID, and by_type counts match.
    // rivet: verifies REQ-001
    #[test]
    fn prop_store_insert_all_retrievable(ids in arb_unique_ids(20)) {
        let mut store = Store::new();
        let mut type_counts: BTreeMap<String, usize> = BTreeMap::new();

        let artifacts: Vec<Artifact> = ids.iter().map(|id| {
            // Deterministic type assignment based on hash to keep it reproducible
            let type_idx = id.len() % TEST_TYPES.len();
            let art_type = TEST_TYPES[type_idx];
            *type_counts.entry(art_type.to_string()).or_default() += 1;
            Artifact {
                id: id.clone(),
                artifact_type: art_type.to_string(),
                title: format!("Title for {id}"),
                description: None,
                status: None,
                tags: vec![],
                links: vec![],
                fields: BTreeMap::new(),
                provenance: None,
                source_file: None,
            }
        }).collect();

        for a in artifacts {
            store.insert(a).unwrap();
        }

        // len matches
        prop_assert_eq!(store.len(), ids.len());

        // All retrievable by ID
        for id in &ids {
            prop_assert!(store.get(id).is_some(), "artifact {} must be retrievable", id);
        }

        // by_type counts match
        for (art_type, count) in &type_counts {
            prop_assert_eq!(
                store.count_by_type(art_type),
                *count,
                "count_by_type mismatch for {}",
                art_type
            );
        }
    }

    /// Duplicate inserts are rejected.
    // rivet: verifies REQ-001
    #[test]
    fn prop_store_rejects_duplicates(id in arb_artifact_id()) {
        let mut store = Store::new();
        let a1 = Artifact {
            id: id.clone(),
            artifact_type: "loss".into(),
            title: "First".into(),
            description: None,
            status: None,
            tags: vec![],
            links: vec![],
            fields: BTreeMap::new(),
            provenance: None,
            source_file: None,
        };
        let a2 = Artifact {
            id: id.clone(),
            artifact_type: "loss".into(),
            title: "Second".into(),
            description: None,
            status: None,
            tags: vec![],
            links: vec![],
            fields: BTreeMap::new(),
            provenance: None,
            source_file: None,
        };

        prop_assert!(store.insert(a1).is_ok());
        prop_assert!(store.insert(a2).is_err());
        prop_assert_eq!(store.len(), 1);
    }
}

// ── Schema merge idempotence ────────────────────────────────────────────

/// Merging a schema with itself produces the same set of types and link types.
// rivet: verifies REQ-010
#[test]
fn prop_schema_merge_idempotent() {
    let schemas_dir = std::path::PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../schemas");

    for schema_name in &["common", "stpa", "aspice", "cybersecurity", "dev"] {
        let path = schemas_dir.join(format!("{schema_name}.yaml"));
        if !path.exists() {
            continue;
        }
        let file = Schema::load_file(&path).expect("load schema");

        // Merge once
        let single = Schema::merge(std::slice::from_ref(&file));
        // Merge twice (idempotent)
        let file2 = file.clone();
        let doubled = Schema::merge(&[file, file2]);

        // Same artifact types
        let single_types: HashSet<&str> =
            single.artifact_types.keys().map(|s| s.as_str()).collect();
        let doubled_types: HashSet<&str> =
            doubled.artifact_types.keys().map(|s| s.as_str()).collect();
        assert_eq!(
            single_types, doubled_types,
            "merge idempotence failed for {schema_name} artifact types"
        );

        // Same link types
        let single_links: HashSet<&str> = single.link_types.keys().map(|s| s.as_str()).collect();
        let doubled_links: HashSet<&str> = doubled.link_types.keys().map(|s| s.as_str()).collect();
        assert_eq!(
            single_links, doubled_links,
            "merge idempotence failed for {schema_name} link types"
        );

        // Same inverse map
        assert_eq!(
            single.inverse_map.len(),
            doubled.inverse_map.len(),
            "merge idempotence failed for {schema_name} inverse map size"
        );
    }
}

// ── Link graph backlink symmetry ────────────────────────────────────────

proptest! {
    #![proptest_config(ProptestConfig::with_cases(30))]

    /// For every forward link in the graph, a corresponding backlink exists.
    // rivet: verifies REQ-004
    #[test]
    fn prop_link_graph_backlink_symmetry(
        n in 5..20usize,
        link_density in 1..4usize,
    ) {
        let schema = test_schema();
        let mut store = Store::new();

        // Create n artifacts
        let ids: Vec<String> = (0..n).map(|i| format!("SYM-{i}")).collect();
        for id in &ids {
            let art_type = TEST_TYPES[id.len() % TEST_TYPES.len()];
            store.insert(Artifact {
                id: id.clone(),
                artifact_type: art_type.to_string(),
                title: format!("Art {id}"),
                description: None,
                status: None,
                tags: vec![],
                links: vec![],
                fields: BTreeMap::new(),
                provenance: None,
                source_file: None,
            }).unwrap();
        }

        // Add deterministic links
        for i in 0..n {
            for j in 1..=link_density {
                let target_idx = (i + j) % n;
                if target_idx != i {
                    let mut art = store.get(&ids[i]).unwrap().clone();
                    art.links.push(Link {
                        link_type: "leads-to-loss".into(),
                        target: ids[target_idx].clone(),
                    });
                    store.upsert(art);
                }
            }
        }

        let graph = LinkGraph::build(&store, &schema);

        // For every forward link, there must be a backlink at the target
        for art in store.iter() {
            for fwd in graph.links_from(&art.id) {
                let backlinks = graph.backlinks_to(&fwd.target);
                let has_matching_backlink = backlinks.iter().any(|bl| {
                    bl.source == art.id && bl.link_type == fwd.link_type
                });
                prop_assert!(
                    has_matching_backlink,
                    "forward link {} -> {} ({}) has no backlink",
                    art.id, fwd.target, fwd.link_type
                );
            }
        }
    }
}

// ── Validation determinism ──────────────────────────────────────────────

/// Running validate twice on the same store+schema produces identical diagnostics.
// rivet: verifies REQ-004
#[test]
fn prop_validation_determinism() {
    let schema = test_schema();
    let mut store = Store::new();

    // Build a non-trivial store
    store
        .insert(Artifact {
            id: "DET-L1".into(),
            artifact_type: "loss".into(),
            title: "Determinism loss".into(),
            description: None,
            status: None,
            tags: vec![],
            links: vec![],
            fields: BTreeMap::new(),
            provenance: None,
            source_file: None,
        })
        .unwrap();

    store
        .insert(Artifact {
            id: "DET-H1".into(),
            artifact_type: "hazard".into(),
            title: "Determinism hazard".into(),
            description: None,
            status: None,
            tags: vec![],
            links: vec![Link {
                link_type: "leads-to-loss".into(),
                target: "DET-L1".into(),
            }],
            fields: BTreeMap::new(),
            provenance: None,
            source_file: None,
        })
        .unwrap();

    store
        .insert(Artifact {
            id: "DET-BAD".into(),
            artifact_type: "unknown-type".into(),
            title: "Bad type".into(),
            description: None,
            status: None,
            tags: vec![],
            links: vec![Link {
                link_type: "leads-to-loss".into(),
                target: "NONEXISTENT".into(),
            }],
            fields: BTreeMap::new(),
            provenance: None,
            source_file: None,
        })
        .unwrap();

    let graph = LinkGraph::build(&store, &schema);

    let diag1 = validate::validate(&store, &schema, &graph);
    let diag2 = validate::validate(&store, &schema, &graph);

    assert_eq!(
        diag1.len(),
        diag2.len(),
        "validation must produce same number of diagnostics"
    );

    for (d1, d2) in diag1.iter().zip(diag2.iter()) {
        assert_eq!(d1.artifact_id, d2.artifact_id);
        assert_eq!(d1.rule, d2.rule);
        assert_eq!(d1.message, d2.message);
        assert_eq!(d1.severity, d2.severity);
    }
}

// ── Store types iterator ────────────────────────────────────────────────

proptest! {
    #![proptest_config(ProptestConfig::with_cases(30))]

    /// The types() iterator returns exactly the types that have artifacts.
    // rivet: verifies REQ-001
    #[test]
    fn prop_store_types_match_inserted(
        type_indices in prop::collection::vec(0..TEST_TYPES.len(), 3..15),
    ) {
        let mut store = Store::new();
        let mut expected_types: HashSet<String> = HashSet::new();

        for (i, &type_idx) in type_indices.iter().enumerate() {
            let art_type = TEST_TYPES[type_idx];
            expected_types.insert(art_type.to_string());
            store.insert(Artifact {
                id: format!("TYPES-{i}"),
                artifact_type: art_type.to_string(),
                title: "x".into(),
                description: None,
                status: None,
                tags: vec![],
                links: vec![],
                fields: BTreeMap::new(),
                provenance: None,
                source_file: None,
            }).unwrap();
        }

        let actual_types: HashSet<String> = store.types().map(|s| s.to_string()).collect();
        prop_assert_eq!(expected_types, actual_types);
    }
}
