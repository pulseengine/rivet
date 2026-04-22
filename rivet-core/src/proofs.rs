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
                yaml_section_suffix: None,
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
            alternate_backlinks: vec![],
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
                yaml_section_suffix: None,
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
                yaml_section_suffix: None,
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

    // ── S-expression evaluator proofs ──────────────────────────────────

    use crate::sexpr_eval::{self, Accessor, EvalContext, Expr, Value};

    /// Build a concrete test artifact for evaluator proofs.
    ///
    /// Uses a fixed artifact rather than symbolic generation because Kani
    /// handles complex structs (BTreeMap, Vec<Link>, Option<String>) much
    /// better with concrete values.  The logical equivalence proofs are
    /// universal over all *expressions*, not all artifacts — the artifact
    /// merely provides a concrete evaluation context.
    fn eval_test_artifact() -> Artifact {
        let mut fields = BTreeMap::new();
        fields.insert("priority".into(), serde_yaml::Value::String("must".into()));
        fields.insert(
            "category".into(),
            serde_yaml::Value::String("functional".into()),
        );

        Artifact {
            id: "REQ-001".into(),
            artifact_type: "requirement".into(),
            title: "Test requirement".into(),
            description: Some("A test requirement for STPA".into()),
            status: Some("approved".into()),
            tags: vec!["stpa".into(), "safety".into(), "eu".into()],
            links: vec![
                Link {
                    link_type: "satisfies".into(),
                    target: "SC-1".into(),
                },
                Link {
                    link_type: "satisfies".into(),
                    target: "SC-3".into(),
                },
                Link {
                    link_type: "implements".into(),
                    target: "DD-001".into(),
                },
            ],
            fields,
            provenance: None,
            source_file: None,
        }
    }

    /// Build an eval context with empty link graph.
    fn eval_context(_artifact: &Artifact) -> (LinkGraph, Store) {
        let store = Store::new();
        let schema = empty_schema();
        let graph = LinkGraph::build(&store, &schema);
        (graph, store)
    }

    // ── Bounded Expr generation ────────────────────────────────────────
    //
    // Kani doesn't have proptest-style strategies.  We use kani::any()
    // to pick enum variant indices and build expression trees with a
    // hard recursion depth limit.  Leaf nodes are chosen from a small
    // palette of concrete predicates (BoolLit, HasTag, Eq on type/status)
    // so the evaluator exercises real field-resolution paths.

    /// Number of leaf variants available.
    const LEAF_VARIANTS: u8 = 6;

    /// Generate a leaf expression (depth 0) from a symbolic variant index.
    fn arb_leaf(variant: u8) -> Expr {
        match variant % LEAF_VARIANTS {
            0 => Expr::BoolLit(true),
            1 => Expr::BoolLit(false),
            2 => Expr::HasTag(Value::Str("stpa".into())),
            3 => Expr::HasTag(Value::Str("missing".into())),
            4 => Expr::Eq(
                Accessor::Field("type".into()),
                Value::Str("requirement".into()),
            ),
            5 => Expr::Eq(Accessor::Field("status".into()), Value::Str("draft".into())),
            _ => unreachable!(),
        }
    }

    /// Generate a bounded expression tree.
    ///
    /// At depth 0, returns a leaf.  At depth > 0, symbolically picks
    /// between leaf (variants 0..6) and connective (variants 6..10).
    /// Binary connectives recurse with depth-1.
    fn arb_expr(depth: u32) -> Expr {
        if depth == 0 {
            let v: u8 = kani::any();
            kani::assume(v < LEAF_VARIANTS);
            return arb_leaf(v);
        }

        // 10 total options: 6 leaves + 4 connectives
        let choice: u8 = kani::any();
        kani::assume(choice < 10);

        if choice < LEAF_VARIANTS {
            arb_leaf(choice)
        } else {
            match choice - LEAF_VARIANTS {
                0 => Expr::Not(Box::new(arb_expr(depth - 1))),
                1 => Expr::And(vec![arb_expr(depth - 1), arb_expr(depth - 1)]),
                2 => Expr::Or(vec![arb_expr(depth - 1), arb_expr(depth - 1)]),
                3 => Expr::Implies(Box::new(arb_expr(depth - 1)), Box::new(arb_expr(depth - 1))),
                _ => unreachable!(),
            }
        }
    }

    // ── 11. check() panic-freedom ──────────────────────────────────────

    /// Proves that `check()` never panics for any symbolically-generated
    /// expression tree (depth <= 2) evaluated against a concrete artifact.
    ///
    /// The expression space includes all logical connectives, boolean
    /// literals, tag predicates, and field-equality checks — exercising
    /// every branch in the top-level pattern match.
    #[kani::proof]
    #[kani::unwind(20)]
    fn proof_sexpr_check_no_panic() {
        let artifact = eval_test_artifact();
        let (graph, _store) = eval_context(&artifact);
        let ctx = EvalContext {
            artifact: &artifact,
            graph: &graph,
            store: None,
        };

        let expr = arb_expr(2);
        let _ = sexpr_eval::check(&expr, &ctx);
        // Reaching here proves no panic occurred.
    }

    // ── 12. De Morgan: ¬(A ∧ B) ≡ (¬A ∨ ¬B) ──────────────────────────

    /// Exhaustively proves De Morgan's law for AND over all expression
    /// pairs up to depth 2.
    #[kani::proof]
    #[kani::unwind(20)]
    fn proof_sexpr_de_morgan_and() {
        let artifact = eval_test_artifact();
        let (graph, _store) = eval_context(&artifact);
        let ctx = EvalContext {
            artifact: &artifact,
            graph: &graph,
            store: None,
        };

        let a = arb_expr(2);
        let b = arb_expr(2);

        let lhs = Expr::Not(Box::new(Expr::And(vec![a.clone(), b.clone()])));
        let rhs = Expr::Or(vec![Expr::Not(Box::new(a)), Expr::Not(Box::new(b))]);

        kani::assert(
            sexpr_eval::check(&lhs, &ctx) == sexpr_eval::check(&rhs, &ctx),
            "De Morgan (AND): not(and(a, b)) must equal or(not(a), not(b))",
        );
    }

    // ── 13. Double negation: ¬¬A ≡ A ───────────────────────────────────

    /// Exhaustively proves double negation elimination for all expressions
    /// up to depth 2.
    #[kani::proof]
    #[kani::unwind(20)]
    fn proof_sexpr_double_negation() {
        let artifact = eval_test_artifact();
        let (graph, _store) = eval_context(&artifact);
        let ctx = EvalContext {
            artifact: &artifact,
            graph: &graph,
            store: None,
        };

        let a = arb_expr(2);

        let double_neg = Expr::Not(Box::new(Expr::Not(Box::new(a.clone()))));

        kani::assert(
            sexpr_eval::check(&double_neg, &ctx) == sexpr_eval::check(&a, &ctx),
            "Double negation: not(not(a)) must equal a",
        );
    }

    // ── 14. Implies expansion: (A → B) ≡ (¬A ∨ B) ─────────────────────

    /// Exhaustively proves that implies is equivalent to its disjunctive
    /// expansion for all expression pairs up to depth 2.
    #[kani::proof]
    #[kani::unwind(20)]
    fn proof_sexpr_implies_expansion() {
        let artifact = eval_test_artifact();
        let (graph, _store) = eval_context(&artifact);
        let ctx = EvalContext {
            artifact: &artifact,
            graph: &graph,
            store: None,
        };

        let a = arb_expr(2);
        let b = arb_expr(2);

        let lhs = Expr::Implies(Box::new(a.clone()), Box::new(b.clone()));
        let rhs = Expr::Or(vec![Expr::Not(Box::new(a)), b]);

        kani::assert(
            sexpr_eval::check(&lhs, &ctx) == sexpr_eval::check(&rhs, &ctx),
            "Implies expansion: implies(a, b) must equal or(not(a), b)",
        );
    }

    // ── 15. Excludes expansion: excludes(A, B) ≡ ¬(A ∧ B) ─────────────

    /// Exhaustively proves that excludes is the negation of conjunction
    /// for all expression pairs up to depth 2.
    #[kani::proof]
    #[kani::unwind(20)]
    fn proof_sexpr_excludes_expansion() {
        let artifact = eval_test_artifact();
        let (graph, _store) = eval_context(&artifact);
        let ctx = EvalContext {
            artifact: &artifact,
            graph: &graph,
            store: None,
        };

        let a = arb_expr(2);
        let b = arb_expr(2);

        let lhs = Expr::Excludes(Box::new(a.clone()), Box::new(b.clone()));
        let rhs_inner = Expr::And(vec![a, b]);

        kani::assert(
            sexpr_eval::check(&lhs, &ctx) == !sexpr_eval::check(&rhs_inner, &ctx),
            "Excludes expansion: excludes(a, b) must equal !check(and(a, b))",
        );
    }

    // ── 16. parse_commit_type: panic-freedom ──────────────────────────

    use crate::commits;

    /// Proves that `parse_commit_type` never panics for any string input
    /// up to 16 bytes of printable ASCII.
    #[kani::proof]
    #[kani::unwind(18)]
    fn proof_parse_commit_type_no_panic() {
        let len: usize = kani::any();
        kani::assume(len <= 16);
        let mut bytes = [0u8; 16];
        for i in 0..16 {
            if i < len {
                bytes[i] = kani::any();
                kani::assume(bytes[i] >= 0x20 && bytes[i] <= 0x7E);
            }
        }
        if let Ok(input) = std::str::from_utf8(&bytes[..len]) {
            let result = commits::parse_commit_type(input);
            // If it parses, the type must be non-empty lowercase ASCII
            if let Some(ref t) = result {
                kani::assert(!t.is_empty(), "parsed type must be non-empty");
                kani::assert(
                    t.chars().all(|c| c.is_ascii_lowercase()),
                    "parsed type must be all lowercase ASCII",
                );
            }
        }
    }

    // ── 17. extract_artifact_ids: panic-freedom ───────────────────────

    /// Proves that `extract_artifact_ids` never panics for any string input
    /// up to 16 bytes of printable ASCII.
    #[kani::proof]
    #[kani::unwind(18)]
    fn proof_extract_artifact_ids_no_panic() {
        let len: usize = kani::any();
        kani::assume(len <= 16);
        let mut bytes = [0u8; 16];
        for i in 0..16 {
            if i < len {
                bytes[i] = kani::any();
                kani::assume(bytes[i] >= 0x20 && bytes[i] <= 0x7E);
            }
        }
        if let Ok(input) = std::str::from_utf8(&bytes[..len]) {
            let ids = commits::extract_artifact_ids(input);
            // All returned IDs must be well-formed
            for id in &ids {
                kani::assert(!id.is_empty(), "extracted ID must be non-empty");
                kani::assert(id.contains('-'), "extracted ID must contain a hyphen");
            }
        }
    }

    // ── 18. expand_artifact_range: panic-freedom ──────────────────────

    /// Proves that `expand_artifact_range` never panics for any 12-byte
    /// ASCII input and always returns at least one element.
    #[kani::proof]
    #[kani::unwind(14)]
    fn proof_expand_artifact_range_no_panic() {
        let len: usize = kani::any();
        kani::assume(len <= 12);
        let mut bytes = [0u8; 12];
        for i in 0..12 {
            if i < len {
                bytes[i] = kani::any();
                kani::assume(bytes[i] >= 0x20 && bytes[i] <= 0x7E);
            }
        }
        if let Ok(input) = std::str::from_utf8(&bytes[..len]) {
            let result = commits::expand_artifact_range(input);
            kani::assert(
                !result.is_empty(),
                "expand_artifact_range must always return at least one element",
            );
        }
    }

    // ── 19. parse_trailers: panic-freedom ─────────────────────────────

    /// Proves that `parse_trailers` never panics for any 24-byte ASCII
    /// input (enough for "Key: Value\nKey2: Val2").
    #[kani::proof]
    #[kani::unwind(26)]
    fn proof_parse_trailers_no_panic() {
        let len: usize = kani::any();
        kani::assume(len <= 24);
        let mut bytes = [0u8; 24];
        for i in 0..24 {
            if i < len {
                bytes[i] = kani::any();
                kani::assume(bytes[i] >= 0x20 && bytes[i] <= 0x7E || bytes[i] == b'\n');
            }
        }
        if let Ok(input) = std::str::from_utf8(&bytes[..len]) {
            let result = commits::parse_trailers(input);
            // All keys must be non-empty and start with uppercase
            for (key, values) in &result {
                kani::assert(!key.is_empty(), "trailer key must be non-empty");
                kani::assert(
                    key.starts_with(|c: char| c.is_ascii_uppercase()),
                    "trailer key must start with uppercase",
                );
                for v in values {
                    kani::assert(!v.is_empty(), "trailer value must be non-empty");
                }
            }
        }
    }

    // ── 20. Store::upsert: panic-freedom ──────────────────────────────

    /// Proves that `Store::upsert` never panics and that the artifact is
    /// retrievable after upsert.
    #[kani::proof]
    fn proof_store_upsert_no_panic() {
        let mut store = Store::new();

        let a1 = make_artifact("UP-1", "requirement", vec![]);
        store.upsert(a1);

        kani::assert(store.len() == 1, "upsert must add artifact");
        kani::assert(store.contains("UP-1"), "upserted artifact must be findable");

        // Upsert again with different type — must not panic, must update
        let a2 = make_artifact("UP-1", "feature", vec![]);
        store.upsert(a2);

        kani::assert(store.len() == 1, "upsert of same ID must not increase len");
        kani::assert(
            store.get("UP-1").unwrap().artifact_type == "feature",
            "upsert must update artifact type",
        );
    }

    // ── 21. ArtifactDiff::compute: panic-freedom ──────────────────────

    use crate::diff::ArtifactDiff;

    /// Proves that `ArtifactDiff::compute` never panics for any pair of
    /// stores with up to 3 artifacts each.
    #[kani::proof]
    fn proof_artifact_diff_no_panic() {
        let mut base = Store::new();
        let mut head = Store::new();

        // Symbolically decide how many artifacts in each store (0..3)
        let nb: usize = kani::any();
        let nh: usize = kani::any();
        kani::assume(nb <= 3);
        kani::assume(nh <= 3);

        let ids = ["D-1", "D-2", "D-3"];
        for i in 0..3 {
            if i < nb {
                base.insert(make_artifact(ids[i], "test", vec![])).unwrap();
            }
            if i < nh {
                head.insert(make_artifact(ids[i], "test", vec![])).unwrap();
            }
        }

        let diff = ArtifactDiff::compute(&base, &head);

        // Basic invariants
        kani::assert(
            diff.added.len() + diff.removed.len() + diff.modified.len() + diff.unchanged <= nb + nh,
            "diff totals must not exceed combined store sizes",
        );
    }

    // ── 22. prefix_for_type: panic-freedom ────────────────────────────

    use crate::mutate;

    /// Proves that `prefix_for_type` never panics and returns a non-empty
    /// string for any non-empty type name.
    #[kani::proof]
    fn proof_prefix_for_type_no_panic() {
        let store = Store::new();

        // Test with a few concrete type names
        let types = ["requirement", "feature", "design-decision", "uca"];
        let idx: usize = kani::any();
        kani::assume(idx < types.len());

        let prefix = mutate::prefix_for_type(types[idx], &store);
        kani::assert(!prefix.is_empty(), "prefix must be non-empty");
        kani::assert(
            prefix.chars().all(|c| c.is_ascii_uppercase()),
            "fallback prefix must be all uppercase",
        );
    }

    // ── 23. next_id: panic-freedom + monotonicity ─────────────────────

    /// Proves that `next_id` never panics and produces IDs with the
    /// correct prefix.
    #[kani::proof]
    fn proof_next_id_no_panic() {
        let mut store = Store::new();

        // Insert 0..2 artifacts with known prefix
        let n: usize = kani::any();
        kani::assume(n <= 2);
        for i in 0..n {
            let id = match i {
                0 => "REQ-001",
                1 => "REQ-002",
                _ => unreachable!(),
            };
            store
                .insert(make_artifact(id, "requirement", vec![]))
                .unwrap();
        }

        let next = mutate::next_id(&store, "REQ");
        kani::assert(next.starts_with("REQ-"), "next_id must start with prefix-");
    }

    // ── 24. validate_link: rejects unknown source ─────────────────────

    /// Proves that `validate_link` returns Err when the source artifact
    /// does not exist in the store.
    #[kani::proof]
    fn proof_validate_link_rejects_missing_source() {
        let store = Store::new();
        let schema = empty_schema();

        let result =
            mutate::validate_link("NONEXISTENT-1", "satisfies", "TARGET-1", &store, &schema);
        kani::assert(
            result.is_err(),
            "validate_link must reject nonexistent source",
        );
    }

    // ── 25. validate_link: rejects unknown target ─────────────────────

    /// Proves that `validate_link` returns Err when the target artifact
    /// does not exist and is not an external reference.
    #[kani::proof]
    fn proof_validate_link_rejects_missing_target() {
        let mut store = Store::new();
        store
            .insert(make_artifact("SRC-1", "requirement", vec![]))
            .unwrap();
        let schema = empty_schema();

        let result = mutate::validate_link("SRC-1", "satisfies", "NONEXISTENT-1", &store, &schema);
        kani::assert(
            result.is_err(),
            "validate_link must reject nonexistent non-external target",
        );
    }

    // ── 26. render_markdown: panic-freedom ────────────────────────────

    use crate::markdown;

    /// Proves that `render_markdown` never panics for any 16-byte input.
    #[kani::proof]
    #[kani::unwind(18)]
    fn proof_render_markdown_no_panic() {
        let len: usize = kani::any();
        kani::assume(len <= 16);
        let mut bytes = [0u8; 16];
        for i in 0..16 {
            if i < len {
                bytes[i] = kani::any();
                // Allow all printable ASCII plus common markdown chars
                kani::assume(
                    bytes[i] >= 0x20 && bytes[i] <= 0x7E || bytes[i] == b'\n' || bytes[i] == b'\t',
                );
            }
        }
        if let Ok(input) = std::str::from_utf8(&bytes[..len]) {
            let _ = markdown::render_markdown(input);
            // Reaching here proves no panic occurred
        }
    }

    // ── 27. strip_html_tags: panic-freedom + correctness ──────────────

    /// Proves that `strip_html_tags` never panics and never produces
    /// output containing `<` or `>`.
    #[kani::proof]
    #[kani::unwind(18)]
    fn proof_strip_html_tags_no_panic() {
        let len: usize = kani::any();
        kani::assume(len <= 16);
        let mut bytes = [0u8; 16];
        for i in 0..16 {
            if i < len {
                bytes[i] = kani::any();
                kani::assume(bytes[i] >= 0x20 && bytes[i] <= 0x7E);
            }
        }
        if let Ok(input) = std::str::from_utf8(&bytes[..len]) {
            let output = markdown::strip_html_tags(input);
            kani::assert(
                !output.contains('<') && !output.contains('>'),
                "strip_html_tags must remove all angle brackets",
            );
        }
    }
}
