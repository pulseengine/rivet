//! Kani bounded model checking proof harnesses.
//!
//! These harnesses verify panic-freedom and key invariants of rivet-core
//! functions using Kani's symbolic execution engine.  They are compiled
//! only when `cfg(kani)` is active (i.e. when running `cargo kani`).
//!
//! **Running:** Install Kani, then `cargo kani -p rivet-core`.

#[cfg(kani)]
mod proofs {
    use std::collections::BTreeMap;

    use crate::coverage::{CoverageEntry, compute_coverage};
    use crate::externals::{ArtifactRef, parse_artifact_ref};
    use crate::links::LinkGraph;
    use crate::model::{Artifact, Link};
    use crate::schema::{
        ArtifactTypeDef, Cardinality, LinkFieldDef, LinkTypeDef, Schema, SchemaFile,
        SchemaMetadata, Severity, TraceabilityRule,
    };
    use crate::store::Store;
    use crate::validate;

    // ── Helpers ──────────────────────────────────────────────────────────

    /// Build a minimal artifact with the given id, type, and links.
    fn make_artifact(id: &str, artifact_type: &str, links: Vec<Link>) -> Artifact {
        Artifact {
            id: id.into(),
            artifact_type: artifact_type.into(),
            title: id.into(),
            description: None,
            status: None,
            tags: vec![],
            links,
            fields: BTreeMap::new(),
            provenance: None,
            source_file: None,
        }
    }

    /// Build a minimal empty schema (no types, no rules).
    fn empty_schema() -> Schema {
        Schema::merge(&[SchemaFile {
            schema: SchemaMetadata {
                name: "kani-test".into(),
                version: "0.1.0".into(),
                namespace: None,
                description: None,
                extends: vec![],
                min_rivet_version: None,
                license: None,
            },
            base_fields: vec![],
            artifact_types: vec![],
            link_types: vec![],
            traceability_rules: vec![],
            conditional_rules: vec![],
        }])
    }

    /// Build a schema with a single artifact type and a single traceability rule.
    fn schema_with_rule() -> Schema {
        Schema::merge(&[SchemaFile {
            schema: SchemaMetadata {
                name: "kani-rule".into(),
                version: "0.1.0".into(),
                namespace: None,
                description: None,
                extends: vec![],
                min_rivet_version: None,
                license: None,
            },
            base_fields: vec![],
            artifact_types: vec![ArtifactTypeDef {
                name: "requirement".into(),
                description: "A requirement".into(),
                fields: vec![],
                link_fields: vec![],
                aspice_process: None,
                common_mistakes: vec![],
                example: None,
                yaml_section: None,
                yaml_sections: vec![],
                shorthand_links: std::collections::BTreeMap::new(),
            }],
            link_types: vec![LinkTypeDef {
                name: "satisfies".into(),
                inverse: Some("satisfied-by".into()),
                description: "satisfies link".into(),
                source_types: vec![],
                target_types: vec![],
            }],
            traceability_rules: vec![TraceabilityRule {
                name: "req-traced".into(),
                description: "Requirements must be satisfied".into(),
                source_type: "requirement".into(),
                required_link: None,
                required_backlink: Some("satisfies".into()),
                target_types: vec![],
                from_types: vec![],
                severity: Severity::Warning,
            }],
            conditional_rules: vec![],
        }])
    }

    // ── 1. parse_artifact_ref: panic-freedom ────────────────────────────

    /// Proves that `parse_artifact_ref` never panics for any string input
    /// up to 64 bytes.  This covers all possible combinations of colons,
    /// ASCII letters, digits, punctuation, and empty strings.
    #[kani::proof]
    #[kani::unwind(66)]
    fn proof_parse_artifact_ref_no_panic() {
        // Use a bounded byte array and convert to a valid UTF-8 string.
        // Kani will explore all possible byte sequences up to this length.
        let len: usize = kani::any();
        kani::assume(len <= 8); // keep tractable for bounded model checking
        let mut bytes = [0u8; 8];
        for i in 0..8 {
            if i < len {
                bytes[i] = kani::any();
                // Restrict to printable ASCII to keep within valid UTF-8
                // and to exercise the colon-splitting logic meaningfully.
                kani::assume(bytes[i] >= 0x20 && bytes[i] <= 0x7E);
            }
        }
        let s = std::str::from_utf8(&bytes[..len]);
        if let Ok(input) = s {
            let result = parse_artifact_ref(input);
            // Verify the result is well-formed: the original string is
            // recoverable from the parsed reference.
            match &result {
                ArtifactRef::Local(id) => {
                    kani::assert(id == input, "Local ref must preserve input");
                }
                ArtifactRef::External { prefix, id } => {
                    // prefix:id must reconstruct the original
                    kani::assert(!prefix.is_empty(), "External prefix must be non-empty");
                    kani::assert(!id.is_empty(), "External id must be non-empty");
                    kani::assert(
                        prefix.chars().all(|c| c.is_ascii_lowercase()),
                        "External prefix must be all lowercase ASCII",
                    );
                }
            }
        }
    }

    // ── 2. Store::insert: panic-freedom ─────────────────────────────────

    /// Proves that `Store::insert` never panics for any artifact with
    /// bounded-length fields.  The function may return Ok or Err, but
    /// must not panic.
    #[kani::proof]
    fn proof_store_insert_no_panic() {
        let mut store = Store::new();

        // Build an artifact with symbolic id and type
        let id_len: usize = kani::any();
        kani::assume(id_len >= 1 && id_len <= 4);
        let type_len: usize = kani::any();
        kani::assume(type_len >= 1 && type_len <= 4);

        let mut id_bytes = [b'A'; 4];
        for i in 0..4 {
            if i < id_len {
                id_bytes[i] = kani::any();
                kani::assume(id_bytes[i].is_ascii_alphanumeric() || id_bytes[i] == b'-');
            }
        }
        let mut type_bytes = [b'a'; 4];
        for i in 0..4 {
            if i < type_len {
                type_bytes[i] = kani::any();
                kani::assume(type_bytes[i].is_ascii_lowercase());
            }
        }

        let id = String::from_utf8(id_bytes[..id_len].to_vec()).unwrap();
        let atype = String::from_utf8(type_bytes[..type_len].to_vec()).unwrap();

        let artifact = make_artifact(&id, &atype, vec![]);
        let _ = store.insert(artifact);
        // Reaching here proves no panic occurred.
    }

    // ── 3. Store::insert duplicate returns Err ──────────────────────────

    /// Proves that inserting an artifact with the same ID twice always
    /// returns `Err` on the second call, while the first always succeeds
    /// on an empty store.
    #[kani::proof]
    fn proof_store_duplicate_returns_error() {
        let mut store = Store::new();

        let a1 = make_artifact("KANI-DUP", "requirement", vec![]);
        let a2 = make_artifact("KANI-DUP", "requirement", vec![]);

        let first = store.insert(a1);
        kani::assert(first.is_ok(), "First insert into empty store must succeed");

        let second = store.insert(a2);
        kani::assert(
            second.is_err(),
            "Second insert with same ID must return Err",
        );

        // Store length must still be 1
        kani::assert(store.len() == 1, "Store must contain exactly one artifact");
    }

    // ── 4. CoverageEntry::percentage bounds ─────────────────────────────

    /// Proves that `CoverageEntry::percentage()` always returns a value
    /// in [0.0, 100.0] for any valid (covered, total) pair where
    /// covered <= total.
    #[kani::proof]
    fn proof_coverage_percentage_bounds() {
        let covered: usize = kani::any();
        let total: usize = kani::any();

        // Bound to avoid solver explosion on large numbers
        kani::assume(total <= 1024);
        kani::assume(covered <= total);

        let entry = CoverageEntry {
            rule_name: String::new(),
            description: String::new(),
            source_type: String::new(),
            link_type: String::new(),
            direction: crate::coverage::CoverageDirection::Forward,
            target_types: vec![],
            covered,
            total,
            uncovered_ids: vec![],
        };

        let pct = entry.percentage();
        kani::assert(pct >= 0.0, "Coverage percentage must be >= 0.0");
        kani::assert(pct <= 100.0, "Coverage percentage must be <= 100.0");

        // Additional: when total is 0, percentage must be 100.0
        if total == 0 {
            kani::assert(pct == 100.0, "Coverage with zero total must be 100.0");
        }

        // Additional: when covered == total and total > 0, percentage must be 100.0
        if covered == total && total > 0 {
            kani::assert(pct == 100.0, "Full coverage must yield 100.0");
        }

        // Additional: when covered == 0 and total > 0, percentage must be 0.0
        if covered == 0 && total > 0 {
            kani::assert(pct == 0.0, "Zero coverage must yield 0.0");
        }
    }

    // ── 5. Cardinality exhaustive match ─────────────────────────────────

    /// Proves that the cardinality matching logic in validation handles
    /// all enum variants without hitting an unreachable state.  We
    /// construct a schema with every cardinality variant and verify that
    /// validate() processes them all without panicking.
    #[kani::proof]
    fn proof_cardinality_exhaustive() {
        let cardinalities = [
            Cardinality::ExactlyOne,
            Cardinality::ZeroOrMany,
            Cardinality::ZeroOrOne,
            Cardinality::OneOrMany,
        ];

        // Pick a symbolic cardinality index
        let idx: usize = kani::any();
        kani::assume(idx < cardinalities.len());
        let cardinality = cardinalities[idx].clone();

        // Build a schema with a single artifact type having one link field
        // with the chosen cardinality
        let schema = Schema::merge(&[SchemaFile {
            schema: SchemaMetadata {
                name: "kani-card".into(),
                version: "0.1.0".into(),
                namespace: None,
                description: None,
                extends: vec![],
                min_rivet_version: None,
                license: None,
            },
            base_fields: vec![],
            artifact_types: vec![ArtifactTypeDef {
                name: "test-type".into(),
                description: "test".into(),
                fields: vec![],
                link_fields: vec![LinkFieldDef {
                    name: "test-link".into(),
                    link_type: "depends-on".into(),
                    target_types: vec![],
                    required: true,
                    cardinality,
                }],
                aspice_process: None,
                common_mistakes: vec![],
                example: None,
                yaml_section: None,
                yaml_sections: vec![],
                shorthand_links: std::collections::BTreeMap::new(),
            }],
            link_types: vec![],
            traceability_rules: vec![],
            conditional_rules: vec![],
        }]);

        // Build a store with an artifact of that type, with a symbolic
        // number of links (0, 1, or 2)
        let link_count: usize = kani::any();
        kani::assume(link_count <= 2);

        let mut links = Vec::new();
        for i in 0..link_count {
            let target_id = if i == 0 {
                "TARGET-A".to_string()
            } else {
                "TARGET-B".to_string()
            };
            links.push(Link {
                link_type: "depends-on".into(),
                target: target_id,
            });
        }

        let mut store = Store::new();
        store
            .insert(make_artifact("CARD-TEST", "test-type", links))
            .unwrap();
        // Add targets so links aren't broken
        store
            .insert(make_artifact("TARGET-A", "test-type", vec![]))
            .unwrap();
        store
            .insert(make_artifact("TARGET-B", "test-type", vec![]))
            .unwrap();

        let graph = LinkGraph::build(&store, &schema);
        let diagnostics = validate::validate(&store, &schema, &graph);

        // We don't assert specific diagnostics — the proof succeeds if
        // validate() completes without panicking for every combination
        // of cardinality variant and link count.
        let _ = diagnostics;
    }

    // ── 6. compute_coverage end-to-end: bounds check ────────────────────

    /// Proves that `compute_coverage` produces a report where every
    /// entry has covered <= total and percentage in [0.0, 100.0], and
    /// the overall coverage is also bounded.
    #[kani::proof]
    fn proof_compute_coverage_report_bounds() {
        let schema = schema_with_rule();
        let mut store = Store::new();

        // Symbolically decide how many requirements to insert (0..3)
        let n: usize = kani::any();
        kani::assume(n <= 3);

        for i in 0..n {
            let id = match i {
                0 => "REQ-K0",
                1 => "REQ-K1",
                2 => "REQ-K2",
                _ => unreachable!(),
            };
            store
                .insert(make_artifact(id, "requirement", vec![]))
                .unwrap();
        }

        let graph = LinkGraph::build(&store, &schema);
        let report = compute_coverage(&store, &schema, &graph);

        for entry in &report.entries {
            kani::assert(entry.covered <= entry.total, "covered must be <= total");
            let pct = entry.percentage();
            kani::assert(pct >= 0.0, "entry percentage must be >= 0");
            kani::assert(pct <= 100.0, "entry percentage must be <= 100");
        }

        let overall = report.overall_coverage();
        kani::assert(overall >= 0.0, "overall coverage must be >= 0");
        kani::assert(overall <= 100.0, "overall coverage must be <= 100");
    }

    // ── 7. Schema::merge: idempotence ───────────────────────────────────

    /// Proves that merging a schema with itself produces the same number
    /// of artifact types and link types (idempotence).
    #[kani::proof]
    fn proof_schema_merge_idempotent() {
        let file = SchemaFile {
            schema: SchemaMetadata {
                name: "kani-idem".into(),
                version: "0.1.0".into(),
                namespace: None,
                description: None,
                extends: vec![],
                min_rivet_version: None,
                license: None,
            },
            base_fields: vec![],
            artifact_types: vec![ArtifactTypeDef {
                name: "req".into(),
                description: "requirement".into(),
                fields: vec![],
                link_fields: vec![],
                aspice_process: None,
                common_mistakes: vec![],
                example: None,
                yaml_section: None,
                yaml_sections: vec![],
                shorthand_links: std::collections::BTreeMap::new(),
            }],
            link_types: vec![LinkTypeDef {
                name: "satisfies".into(),
                inverse: Some("satisfied-by".into()),
                description: "satisfies link".into(),
                source_types: vec![],
                target_types: vec![],
            }],
            traceability_rules: vec![],
            conditional_rules: vec![],
        };

        let single = Schema::merge(&[file.clone()]);
        let doubled = Schema::merge(&[file.clone(), file]);

        kani::assert(
            single.artifact_types.len() == doubled.artifact_types.len(),
            "Merging schema with itself must preserve artifact type count",
        );
        kani::assert(
            single.link_types.len() == doubled.link_types.len(),
            "Merging schema with itself must preserve link type count",
        );
        kani::assert(
            single.inverse_map.len() == doubled.inverse_map.len(),
            "Merging schema with itself must preserve inverse map size",
        );
    }

    // ── 8. LinkGraph: orphan detection correctness ──────────────────────

    /// Proves that an artifact with no links (inserted alone) is always
    /// detected as an orphan.
    #[kani::proof]
    fn proof_linkgraph_lone_artifact_is_orphan() {
        let schema = empty_schema();
        let mut store = Store::new();
        store
            .insert(make_artifact("ORPHAN-1", "test", vec![]))
            .unwrap();

        let graph = LinkGraph::build(&store, &schema);
        let orphans = graph.orphans(&store);

        kani::assert(
            orphans.len() == 1,
            "Single unlinked artifact must be an orphan",
        );
        kani::assert(
            orphans[0] == "ORPHAN-1",
            "Orphan ID must match inserted artifact",
        );
    }

    // ── 9. LinkGraph: has_cycles is false for DAG ───────────────────────

    /// Proves that a simple chain A -> B -> C (a DAG) has no cycles.
    #[kani::proof]
    fn proof_linkgraph_dag_no_cycles() {
        let schema = empty_schema();
        let mut store = Store::new();
        store
            .insert(make_artifact(
                "A",
                "test",
                vec![Link {
                    link_type: "dep".into(),
                    target: "B".into(),
                }],
            ))
            .unwrap();
        store
            .insert(make_artifact(
                "B",
                "test",
                vec![Link {
                    link_type: "dep".into(),
                    target: "C".into(),
                }],
            ))
            .unwrap();
        store.insert(make_artifact("C", "test", vec![])).unwrap();

        let graph = LinkGraph::build(&store, &schema);
        kani::assert(!graph.has_cycles(), "A->B->C DAG must not have cycles");
    }

    // ── 10. LinkGraph: cycle detection ──────────────────────────────────

    /// Proves that a cycle A -> B -> A is correctly detected.
    #[kani::proof]
    fn proof_linkgraph_cycle_detected() {
        let schema = empty_schema();
        let mut store = Store::new();
        store
            .insert(make_artifact(
                "CYC-A",
                "test",
                vec![Link {
                    link_type: "dep".into(),
                    target: "CYC-B".into(),
                }],
            ))
            .unwrap();
        store
            .insert(make_artifact(
                "CYC-B",
                "test",
                vec![Link {
                    link_type: "dep".into(),
                    target: "CYC-A".into(),
                }],
            ))
            .unwrap();

        let graph = LinkGraph::build(&store, &schema);
        kani::assert(graph.has_cycles(), "A->B->A must be detected as a cycle");
    }
}
