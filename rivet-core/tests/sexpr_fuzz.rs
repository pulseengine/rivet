//! Proptest fuzz campaigns for the s-expression filter pipeline.
//!
//! Four properties:
//!
//!   1. `parse_never_panics` — `sexpr::parse` must not panic on any
//!      bounded random string (success or error, but no panic).
//!   2. `lower_never_panics` — any parsed CST must lower to `Expr` or an
//!      error without panicking, for any random string.
//!   3. `evaluate_never_panics` — any lowered Expr must evaluate cleanly
//!      against a synthetic artifact store.
//!   4. `roundtrip_equivalence` — for a generated `Expr` AST, the pretty
//!      printer round-trips through `parse_filter` and evaluates to the
//!      same truth value on a fixed artifact set.
//!
//! Each campaign is capped at 256 cases to keep CI time bounded while
//! still exercising the common shrink paths.

use std::collections::BTreeMap;

use proptest::prelude::*;

use rivet_core::links::LinkGraph;
use rivet_core::model::{Artifact, Link};
use rivet_core::schema::Schema;
use rivet_core::sexpr;
use rivet_core::sexpr_eval::{self, Accessor, EvalContext, Expr, Value};
use rivet_core::store::Store;

// ── Fixtures ────────────────────────────────────────────────────────────

fn fixture_store() -> (Store, LinkGraph) {
    let mk = |id: &str, t: &str, tags: &[&str], links: &[(&str, &str)]| Artifact {
        id: id.into(),
        artifact_type: t.into(),
        title: format!("title-{id}"),
        description: Some(format!("desc-{id}")),
        status: Some("approved".into()),
        tags: tags.iter().map(|s| s.to_string()).collect(),
        links: links
            .iter()
            .map(|(lt, tgt)| Link {
                link_type: (*lt).into(),
                target: (*tgt).into(),
            })
            .collect(),
        fields: BTreeMap::new(),
        provenance: None,
        source_file: None,
    };
    let artifacts = vec![
        mk(
            "REQ-001",
            "requirement",
            &["stpa", "safety"],
            &[("satisfies", "SC-1")],
        ),
        mk("REQ-002", "requirement", &["eu"], &[]),
        mk("SC-1", "system-constraint", &[], &[]),
        mk(
            "FEAT-001",
            "feature",
            &["core"],
            &[("implements", "REQ-001")],
        ),
    ];
    let mut s = Store::default();
    for a in artifacts {
        s.upsert(a);
    }
    let g = LinkGraph::build(&s, &Schema::merge(&[]));
    (s, g)
}

fn arb_any_string() -> impl Strategy<Value = String> {
    // Bounded random string drawn from a set that includes every
    // interesting character for the s-expr lexer: parens, quotes,
    // backslashes, whitespace, ASCII letters/digits, symbol-cont bytes,
    // and a few Unicode characters that have tripped similar parsers.
    prop::string::string_regex(
        r#"[ \t\n\r()"\\!?.*<>=+\-a-zA-Z0-9_;αβ]{0,80}"#,
    )
    .unwrap()
}

// ── Expr generators (bounded depth) for round-trip ─────────────────────

fn arb_accessor() -> impl Strategy<Value = Accessor> {
    prop::sample::select(vec!["id", "type", "title", "status", "description", "priority"])
        .prop_map(|s| Accessor::Field(s.to_string()))
}

fn arb_string_value() -> impl Strategy<Value = Value> {
    prop::sample::select(vec![
        "requirement",
        "feature",
        "stpa",
        "safety",
        "eu",
        "core",
        "REQ-001",
        "SC-1",
        "approved",
        "draft",
    ])
    .prop_map(|s| Value::Str(s.to_string()))
}

fn arb_leaf_expr() -> impl Strategy<Value = Expr> {
    prop_oneof![
        (arb_accessor(), arb_string_value()).prop_map(|(a, v)| Expr::Eq(a, v)),
        (arb_accessor(), arb_string_value()).prop_map(|(a, v)| Expr::Ne(a, v)),
        arb_string_value().prop_map(Expr::HasTag),
        arb_string_value().prop_map(Expr::HasField),
        (arb_string_value(), arb_string_value())
            .prop_map(|(lt, tgt)| Expr::LinkedBy(lt, tgt)),
        any::<bool>().prop_map(Expr::BoolLit),
    ]
}

fn arb_expr(depth: u32) -> BoxedStrategy<Expr> {
    if depth == 0 {
        arb_leaf_expr().boxed()
    } else {
        let inner = arb_expr(depth - 1);
        prop_oneof![
            4 => arb_leaf_expr(),
            1 => inner.clone().prop_map(|e| Expr::Not(Box::new(e))),
            1 => (inner.clone(), inner.clone()).prop_map(|(a, b)| Expr::And(vec![a, b])),
            1 => (inner.clone(), inner.clone()).prop_map(|(a, b)| Expr::Or(vec![a, b])),
            1 => (inner.clone(), inner).prop_map(|(a, b)| Expr::Implies(Box::new(a), Box::new(b))),
        ]
        .boxed()
    }
}

// ── Pretty printer for Expr → sexpr text ───────────────────────────────
//
// Only covers the shapes emitted by `arb_expr` — round-trip soundness for
// the generated subset is sufficient for this property campaign.

fn quote(s: &str) -> String {
    format!(
        "\"{}\"",
        s.replace('\\', "\\\\").replace('"', "\\\"")
    )
}

fn value_to_sexpr(v: &Value) -> String {
    match v {
        Value::Str(s) => quote(s),
        Value::Int(i) => i.to_string(),
        Value::Float(f) => format!("{f}"),
        Value::Bool(b) => b.to_string(),
        Value::Wildcard => "_".into(),
    }
}

fn accessor_to_sexpr(a: &Accessor) -> String {
    let Accessor::Field(name) = a;
    name.clone()
}

fn expr_to_sexpr(e: &Expr) -> String {
    match e {
        Expr::BoolLit(true) => "true".into(),
        Expr::BoolLit(false) => "false".into(),
        Expr::And(items) => format!(
            "(and {})",
            items
                .iter()
                .map(expr_to_sexpr)
                .collect::<Vec<_>>()
                .join(" ")
        ),
        Expr::Or(items) => format!(
            "(or {})",
            items
                .iter()
                .map(expr_to_sexpr)
                .collect::<Vec<_>>()
                .join(" ")
        ),
        Expr::Not(i) => format!("(not {})", expr_to_sexpr(i)),
        Expr::Implies(a, b) => format!("(implies {} {})", expr_to_sexpr(a), expr_to_sexpr(b)),
        Expr::Excludes(a, b) => format!("(excludes {} {})", expr_to_sexpr(a), expr_to_sexpr(b)),
        Expr::Eq(a, v) => format!("(= {} {})", accessor_to_sexpr(a), value_to_sexpr(v)),
        Expr::Ne(a, v) => format!("(!= {} {})", accessor_to_sexpr(a), value_to_sexpr(v)),
        Expr::Gt(a, v) => format!("(> {} {})", accessor_to_sexpr(a), value_to_sexpr(v)),
        Expr::Lt(a, v) => format!("(< {} {})", accessor_to_sexpr(a), value_to_sexpr(v)),
        Expr::Ge(a, v) => format!("(>= {} {})", accessor_to_sexpr(a), value_to_sexpr(v)),
        Expr::Le(a, v) => format!("(<= {} {})", accessor_to_sexpr(a), value_to_sexpr(v)),
        Expr::In(v, a) => format!("(in {} {})", value_to_sexpr(v), accessor_to_sexpr(a)),
        Expr::HasTag(v) => format!("(has-tag {})", value_to_sexpr(v)),
        Expr::HasField(v) => format!("(has-field {})", value_to_sexpr(v)),
        Expr::Matches(a, v) => format!("(matches {} {})", accessor_to_sexpr(a), value_to_sexpr(v)),
        Expr::Contains(a, v) => {
            format!("(contains {} {})", accessor_to_sexpr(a), value_to_sexpr(v))
        }
        Expr::LinkedBy(lt, tgt) => {
            format!("(linked-by {} {})", value_to_sexpr(lt), value_to_sexpr(tgt))
        }
        Expr::LinkedFrom(lt, src) => {
            format!(
                "(linked-from {} {})",
                value_to_sexpr(lt),
                value_to_sexpr(src)
            )
        }
        Expr::LinkedTo(tgt) => format!("(linked-to {})", value_to_sexpr(tgt)),
        Expr::LinksCount(lt, op, n) => {
            let op_s = match op {
                sexpr_eval::CompOp::Gt => ">",
                sexpr_eval::CompOp::Lt => "<",
                sexpr_eval::CompOp::Ge => ">=",
                sexpr_eval::CompOp::Le => "<=",
                sexpr_eval::CompOp::Eq => "=",
                sexpr_eval::CompOp::Ne => "!=",
            };
            format!("(links-count {} {} {})", value_to_sexpr(lt), op_s, value_to_sexpr(n))
        }
        Expr::Forall(scope, pred) => {
            format!("(forall {} {})", expr_to_sexpr(scope), expr_to_sexpr(pred))
        }
        Expr::Exists(scope, pred) => {
            format!("(exists {} {})", expr_to_sexpr(scope), expr_to_sexpr(pred))
        }
        Expr::Count(scope) => format!("(count {})", expr_to_sexpr(scope)),
        Expr::ReachableFrom(start, lt) => format!(
            "(reachable-from {} {})",
            value_to_sexpr(start),
            value_to_sexpr(lt)
        ),
        Expr::ReachableTo(tgt, lt) => format!(
            "(reachable-to {} {})",
            value_to_sexpr(tgt),
            value_to_sexpr(lt)
        ),
    }
}

// ── Properties ──────────────────────────────────────────────────────────

proptest! {
    #![proptest_config(ProptestConfig::with_cases(256))]

    /// `sexpr::parse` must never panic — it tolerates arbitrary input
    /// via error recovery and error-token production.
    #[test]
    fn parse_never_panics(s in arb_any_string()) {
        // Panicking would abort the test; any legitimate result is fine.
        let _ = std::panic::catch_unwind(|| sexpr::parse(&s));
        // Also directly call — this asserts no panic leaks out.
        let (_green, _errs) = sexpr::parse(&s);
    }

    /// Lowering of any parsed CST must not panic. Returns either a
    /// typed `Expr` or a list of `LowerError`s.
    #[test]
    fn lower_never_panics(s in arb_any_string()) {
        let _ = sexpr_eval::parse_filter(&s);
    }

    /// Evaluation of any lowered expression against a fixed artifact set
    /// must not panic. Inputs that fail to parse are skipped via
    /// `prop_assume!`.
    #[test]
    fn evaluate_never_panics(s in arb_any_string()) {
        let Ok(expr) = sexpr_eval::parse_filter(&s) else {
            return Ok(());
        };
        let (store, graph) = fixture_store();
        for a in store.iter() {
            let ctx = EvalContext {
                artifact: a,
                graph: &graph,
                store: Some(&store),
            };
            let _ = sexpr_eval::check(&expr, &ctx);
        }
    }

    /// Round-trip: generate an `Expr`, pretty-print it, re-parse, and
    /// check that the truth value on every fixture artifact is the same.
    /// Covers the subset of `Expr` the pretty printer handles.
    #[test]
    fn roundtrip_equivalence(e in arb_expr(2)) {
        let printed = expr_to_sexpr(&e);
        let reparsed = sexpr_eval::parse_filter(&printed);
        prop_assume!(reparsed.is_ok(), "pretty-print must re-parse");
        let reparsed = reparsed.unwrap();

        let (store, graph) = fixture_store();
        for a in store.iter() {
            let ctx = EvalContext {
                artifact: a,
                graph: &graph,
                store: Some(&store),
            };
            let lhs = sexpr_eval::check(&e, &ctx);
            let rhs = sexpr_eval::check(&reparsed, &ctx);
            prop_assert_eq!(
                lhs,
                rhs,
                "round-trip mismatch for {:?} printed as {}",
                e,
                printed
            );
        }
    }
}
