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

//! Property-based tests for the s-expression evaluator.
//!
//! Verifies logical equivalences mandated by CC-VAR-004:
//! - De Morgan's laws
//! - Double negation elimination
//! - Commutativity of and/or
//! - Implies expansion
//! - Excludes expansion
//!
//! These properties must hold for ALL artifacts and ALL predicate
//! combinations — not just hand-picked test cases.

use std::collections::BTreeMap;

use proptest::prelude::*;

use rivet_core::links::LinkGraph;
use rivet_core::model::{Artifact, Link};
use rivet_core::schema::Schema;
use rivet_core::sexpr_eval::{self, Accessor, EvalContext, Expr, Value};
use rivet_core::store::Store;

// ── Strategies ──────────────────────────────────────────────────────────

/// Generate a random artifact with varied fields, tags, and links.
fn arb_artifact() -> impl Strategy<Value = Artifact> {
    (
        "[A-Z]{2,4}-[0-9]{1,3}", // id
        prop::sample::select(vec![
            "requirement",
            "feature",
            "design-decision",
            "test-case",
            "loss",
            "hazard",
            "system-constraint",
        ]), // type
        "[a-z ]{5,30}",          // title
        prop::option::of("[a-z ]{10,50}"), // description
        prop::option::of(prop::sample::select(vec![
            "draft",
            "approved",
            "implemented",
            "obsolete",
        ])), // status
        prop::collection::vec(
            prop::sample::select(vec![
                "stpa",
                "safety",
                "eu",
                "automotive",
                "core",
                "cli",
                "schema",
                "testing",
                "performance",
                "future",
            ]),
            0..=4,
        ), // tags
        prop::collection::vec(
            (
                prop::sample::select(vec![
                    "satisfies",
                    "implements",
                    "verifies",
                    "traces-to",
                    "refines",
                    "mitigates",
                    "linked-by",
                ]),
                "[A-Z]{2,4}-[0-9]{1,3}",
            ),
            0..=3,
        ), // links
    )
        .prop_map(|(id, art_type, title, desc, status, tags, links)| {
            let links = links
                .into_iter()
                .map(|(lt, tgt)| Link {
                    link_type: lt.to_string(),
                    target: tgt,
                })
                .collect();
            Artifact {
                id,
                artifact_type: art_type.to_string(),
                title,
                description: desc,
                status: status.map(|s| s.to_string()),
                tags: tags.into_iter().map(|s| s.to_string()).collect(),
                links,
                fields: BTreeMap::new(),
                provenance: None,
                source_file: None,
            }
        })
}

/// Generate a random leaf predicate (no nesting).
fn arb_leaf_pred() -> impl Strategy<Value = Expr> {
    prop_oneof![
        // Type equality
        prop::sample::select(vec![
            "requirement",
            "feature",
            "design-decision",
            "test-case",
        ])
        .prop_map(|t| Expr::Eq(Accessor::Field("type".into()), Value::Str(t.to_string()),)),
        // Status equality
        prop::sample::select(vec!["draft", "approved", "implemented", "obsolete"])
            .prop_map(|s| Expr::Eq(Accessor::Field("status".into()), Value::Str(s.to_string()),)),
        // Has-tag
        prop::sample::select(vec!["stpa", "safety", "eu", "automotive", "core", "cli",])
            .prop_map(|t| Expr::HasTag(Value::Str(t.to_string()))),
        // Has-field
        prop::sample::select(vec!["description", "status", "priority", "nonexistent"])
            .prop_map(|f| Expr::HasField(Value::Str(f.to_string()))),
        // Linked-by
        prop::sample::select(vec!["satisfies", "implements", "verifies", "missing-link"])
            .prop_map(|lt| Expr::LinkedBy(Value::Str(lt.to_string()), Value::Wildcard)),
        // Boolean literal
        any::<bool>().prop_map(Expr::BoolLit),
    ]
}

/// Generate an expression tree of bounded depth.
fn arb_expr(depth: u32) -> impl Strategy<Value = Expr> {
    if depth == 0 {
        arb_leaf_pred().boxed()
    } else {
        prop_oneof![
            4 => arb_leaf_pred(),
            1 => arb_expr(depth - 1).prop_map(|e| Expr::Not(Box::new(e))),
            1 => (arb_expr(depth - 1), arb_expr(depth - 1))
                .prop_map(|(a, b)| Expr::And(vec![a, b])),
            1 => (arb_expr(depth - 1), arb_expr(depth - 1))
                .prop_map(|(a, b)| Expr::Or(vec![a, b])),
        ]
        .boxed()
    }
}

/// Check an expression against an artifact with an empty link graph.
fn run_check(expr: &Expr, artifact: &Artifact) -> bool {
    let store = Store::default();
    let schema = Schema::merge(&[]);
    let graph = LinkGraph::build(&store, &schema);
    let ctx = EvalContext {
        artifact,
        graph: &graph,
        store: None,
    };
    sexpr_eval::check(expr, &ctx)
}

// ── Properties ──────────────────────────────────────────────────────────

proptest! {
    #![proptest_config(ProptestConfig::with_cases(200))]

    /// De Morgan's law: ¬(A ∧ B) ≡ (¬A ∨ ¬B)
    #[test]
    fn prop_de_morgan_and(
        a in arb_artifact(),
        p in arb_expr(1),
        q in arb_expr(1),
    ) {
        let lhs = Expr::Not(Box::new(Expr::And(vec![p.clone(), q.clone()])));
        let rhs = Expr::Or(vec![
            Expr::Not(Box::new(p)),
            Expr::Not(Box::new(q)),
        ]);
        prop_assert_eq!(run_check(&lhs, &a), run_check(&rhs, &a));
    }

    /// De Morgan's law: ¬(A ∨ B) ≡ (¬A ∧ ¬B)
    #[test]
    fn prop_de_morgan_or(
        a in arb_artifact(),
        p in arb_expr(1),
        q in arb_expr(1),
    ) {
        let lhs = Expr::Not(Box::new(Expr::Or(vec![p.clone(), q.clone()])));
        let rhs = Expr::And(vec![
            Expr::Not(Box::new(p)),
            Expr::Not(Box::new(q)),
        ]);
        prop_assert_eq!(run_check(&lhs, &a), run_check(&rhs, &a));
    }

    /// Double negation: ¬¬A ≡ A
    #[test]
    fn prop_double_negation(
        a in arb_artifact(),
        p in arb_expr(2),
    ) {
        let double_neg = Expr::Not(Box::new(Expr::Not(Box::new(p.clone()))));
        prop_assert_eq!(run_check(&double_neg, &a), run_check(&p, &a));
    }

    /// Commutativity of and: (A ∧ B) ≡ (B ∧ A)
    #[test]
    fn prop_and_commutative(
        a in arb_artifact(),
        p in arb_expr(1),
        q in arb_expr(1),
    ) {
        let lhs = Expr::And(vec![p.clone(), q.clone()]);
        let rhs = Expr::And(vec![q, p]);
        prop_assert_eq!(run_check(&lhs, &a), run_check(&rhs, &a));
    }

    /// Commutativity of or: (A ∨ B) ≡ (B ∨ A)
    #[test]
    fn prop_or_commutative(
        a in arb_artifact(),
        p in arb_expr(1),
        q in arb_expr(1),
    ) {
        let lhs = Expr::Or(vec![p.clone(), q.clone()]);
        let rhs = Expr::Or(vec![q, p]);
        prop_assert_eq!(run_check(&lhs, &a), run_check(&rhs, &a));
    }

    /// Implies expansion: (A → B) ≡ (¬A ∨ B)
    #[test]
    fn prop_implies_expansion(
        a in arb_artifact(),
        p in arb_expr(1),
        q in arb_expr(1),
    ) {
        let lhs = Expr::Implies(Box::new(p.clone()), Box::new(q.clone()));
        let rhs = Expr::Or(vec![Expr::Not(Box::new(p)), q]);
        prop_assert_eq!(run_check(&lhs, &a), run_check(&rhs, &a));
    }

    /// Excludes expansion: excludes(A, B) ≡ ¬(A ∧ B)
    #[test]
    fn prop_excludes_expansion(
        a in arb_artifact(),
        p in arb_expr(1),
        q in arb_expr(1),
    ) {
        let lhs = Expr::Excludes(Box::new(p.clone()), Box::new(q.clone()));
        let rhs = Expr::Not(Box::new(Expr::And(vec![p, q])));
        prop_assert_eq!(run_check(&lhs, &a), run_check(&rhs, &a));
    }

    /// Parser round-trip: parse(s).text() == s for generated expressions.
    #[test]
    fn prop_parser_round_trip(s in arb_sexpr_string()) {
        let (green, _errors) = rivet_core::sexpr::parse(&s);
        let node = rivet_core::sexpr::SyntaxNode::new_root(green);
        prop_assert_eq!(node.text().to_string(), s);
    }
}

/// Generate syntactically valid s-expression strings.
fn arb_sexpr_string() -> impl Strategy<Value = String> {
    prop_oneof![
        // Bare atoms
        Just("true".to_string()),
        Just("false".to_string()),
        Just("42".to_string()),
        Just("_".to_string()),
        "[a-z]{3,8}".prop_map(|s| format!("\"{s}\"")),
        // Simple lists
        "[a-z-]{2,10}".prop_map(|sym| format!("({sym})")),
        ("[a-z-]{2,10}", "[a-z-]{2,10}").prop_map(|(a, b)| format!("({a} {b})")),
        // Nested
        ("[a-z-]{2,10}", "[a-z-]{2,10}", "[a-z-]{2,10}")
            .prop_map(|(a, b, c)| format!("(and ({a} {b}) ({a} {c}))")),
        // Realistic filter
        prop::sample::select(vec![
            r#"(= type "requirement")"#.to_string(),
            r#"(has-tag "stpa")"#.to_string(),
            r#"(and (= type "feature") (= status "approved"))"#.to_string(),
            r#"(or (has-tag "eu") (has-tag "us"))"#.to_string(),
            r#"(not (= status "obsolete"))"#.to_string(),
        ]),
    ]
}
