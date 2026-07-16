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

//! Property-based tests for the feature-model constraint solver.
//!
//! Verifies solver invariants via randomly generated feature models and
//! variant configurations:
//! - The solver never panics on any valid model + config combination
//! - Resolved variants satisfy all group constraints
//! - Propagation only adds features, never removes user selections
//! - The root is always included in a resolved variant

use std::collections::{BTreeMap, BTreeSet};

use proptest::prelude::*;

use rivet_core::feature_model::{
    Feature, FeatureModel, GroupType, ResolvedVariant, SolveError, VariantConfig, solve,
};
use rivet_core::sexpr_eval::{self, Expr};

// ── Strategies ──────────────────────────────────────────────────────────

/// Generate a random feature name (short, alphanumeric, prefixed to avoid collisions).
fn arb_feature_name() -> impl Strategy<Value = String> {
    (0..1000u32).prop_map(|n| format!("f{n}"))
}

/// Generate a random `GroupType` suitable for a node that will have children.
fn arb_group_type_with_children() -> impl Strategy<Value = GroupType> {
    prop_oneof![
        Just(GroupType::Mandatory),
        Just(GroupType::Optional),
        Just(GroupType::Alternative),
        Just(GroupType::Or),
    ]
}

/// Generate a random `FeatureModel` with up to `max_features` features.
///
/// Builds a valid tree: no cycles, leaves are `Leaf`, internal nodes have
/// a random group type, parent links are set correctly.
fn arb_feature_model(max_features: usize) -> impl Strategy<Value = FeatureModel> {
    // We generate between 1 and max_features feature names,
    // then build a random tree structure from them.
    prop::collection::vec(arb_feature_name(), 1..=max_features)
        .prop_flat_map(|names| {
            // Deduplicate names
            let unique: Vec<String> = {
                let mut seen = BTreeSet::new();
                names
                    .into_iter()
                    .filter(|n| seen.insert(n.clone()))
                    .collect()
            };
            let n = unique.len();

            if n == 1 {
                // Single-node model: just a root leaf
                Just((unique, vec![], vec![])).boxed()
            } else {
                // For each non-root node, pick a random parent index (must be < own index).
                // This guarantees a tree with no cycles.
                let parent_indices = prop::collection::vec(
                    (0..1usize).prop_flat_map(|_| any::<prop::sample::Index>()),
                    n - 1,
                );
                // For each internal node, pick a group type
                let group_types = prop::collection::vec(arb_group_type_with_children(), n);

                (Just(unique), parent_indices, group_types).boxed()
            }
        })
        .prop_map(|(unique, parent_indices, group_types)| {
            let root = unique[0].clone();

            // Build children map: parent_index -> list of child names
            let mut children_map: BTreeMap<usize, Vec<String>> = BTreeMap::new();
            let mut parent_of: BTreeMap<String, String> = BTreeMap::new();

            for (i, idx) in parent_indices.iter().enumerate() {
                let child_pos = i + 1; // nodes 1..n are children
                // Parent must be in 0..child_pos
                let parent_pos = idx.index(child_pos);
                children_map
                    .entry(parent_pos)
                    .or_default()
                    .push(unique[child_pos].clone());
                parent_of.insert(unique[child_pos].clone(), unique[parent_pos].clone());
            }

            // Build Feature map
            let mut features = BTreeMap::new();
            for (i, name) in unique.iter().enumerate() {
                let children = children_map.get(&i).cloned().unwrap_or_default();
                let group = if children.is_empty() {
                    GroupType::Leaf
                } else if i < group_types.len() {
                    // For Alternative and Or groups, we need at least 1 child -- guaranteed
                    // since we only assign these when children is non-empty.
                    group_types[i]
                } else {
                    GroupType::Optional
                };
                let parent = parent_of.get(name).cloned();

                features.insert(
                    name.clone(),
                    Feature {
                        name: name.clone(),
                        group,
                        children,
                        parent,
                        attributes: std::collections::BTreeMap::new(),
                    },
                );
            }

            FeatureModel {
                root,
                features,
                constraints: vec![], // No s-expression constraints for these tests
                attribute_schema: std::collections::BTreeMap::new(),
                attribute_warnings: vec![],
            }
        })
}

/// Generate a random `VariantConfig` by selecting a random subset of features
/// from a list of feature names.
fn arb_variant_config(feature_names: Vec<String>) -> impl Strategy<Value = VariantConfig> {
    let n = feature_names.len();
    prop::collection::vec(any::<bool>(), n..=n).prop_map(move |picks| {
        let selects: Vec<String> = picks
            .iter()
            .enumerate()
            .filter(|&(_, picked)| *picked)
            .map(|(i, _)| feature_names[i].clone())
            .collect();

        VariantConfig {
            name: "proptest-variant".to_string(),
            selects,
        }
    })
}

/// Combined strategy: generate a model and a matching variant config together.
fn arb_model_and_config(
    max_features: usize,
) -> impl Strategy<Value = (FeatureModel, VariantConfig)> {
    arb_feature_model(max_features).prop_flat_map(|model| {
        let names: Vec<String> = model.features.keys().cloned().collect();
        let cfg = arb_variant_config(names);
        (Just(model), cfg)
    })
}

/// Verify that group constraints are satisfied for a resolved variant.
fn check_group_constraints(model: &FeatureModel, resolved: &ResolvedVariant) -> Result<(), String> {
    let selected = &resolved.effective_features;

    for (name, feature) in &model.features {
        if !selected.contains(name) {
            continue;
        }
        match feature.group {
            GroupType::Mandatory => {
                for child in &feature.children {
                    if !selected.contains(child) {
                        return Err(format!("mandatory parent `{name}` missing child `{child}`"));
                    }
                }
            }
            GroupType::Alternative => {
                let sel_children: Vec<&String> = feature
                    .children
                    .iter()
                    .filter(|c| selected.contains(*c))
                    .collect();
                if sel_children.len() != 1 {
                    return Err(format!(
                        "alternative group `{name}` has {} children selected (expected 1): {:?}",
                        sel_children.len(),
                        sel_children
                    ));
                }
            }
            GroupType::Or => {
                let any_selected = feature.children.iter().any(|c| selected.contains(c));
                if !any_selected {
                    return Err(format!("or group `{name}` has zero children selected"));
                }
            }
            GroupType::Optional | GroupType::Leaf => {}
        }
    }
    Ok(())
}

// ── Properties ──────────────────────────────────────────────────────────

proptest! {
    #![proptest_config(ProptestConfig::with_cases(200))]

    /// For any random model with an empty config, `solve()` returns Ok or Err -- never panics.
    // rivet: verifies REQ-052
    #[test]
    fn prop_solver_never_panics_empty(model in arb_feature_model(10)) {
        let config = VariantConfig {
            name: "empty".into(),
            selects: vec![],
        };
        let _ = solve(&model, &config);
    }

    /// Solver never panics on arbitrary feature subsets.
    // rivet: verifies REQ-052
    #[test]
    fn prop_solver_never_panics_with_selections(
        (model, config) in arb_model_and_config(10)
    ) {
        let _ = solve(&model, &config);
    }

    /// If solve() returns Ok, the resolved variant satisfies all group constraints.
    // rivet: verifies REQ-052
    #[test]
    fn prop_resolved_satisfies_group_constraints(
        (model, config) in arb_model_and_config(10)
    ) {
        if let Ok(resolved) = solve(&model, &config) {
            let result = check_group_constraints(&model, &resolved);
            prop_assert!(
                result.is_ok(),
                "group constraint violation: {}",
                result.unwrap_err()
            );
        }
    }

    /// If solve() returns Ok, effective_features is a superset of config.selects.
    /// Propagation only adds features, never removes user selections.
    // rivet: verifies REQ-052
    #[test]
    fn prop_resolved_superset_of_selections(
        (model, config) in arb_model_and_config(10)
    ) {
        if let Ok(resolved) = solve(&model, &config) {
            for feat in &config.selects {
                prop_assert!(
                    resolved.effective_features.contains(feat),
                    "user-selected feature `{}` was dropped from resolved variant",
                    feat
                );
            }
        }
    }

    /// If solve() returns Ok, the root is always in the effective features.
    // rivet: verifies REQ-052
    #[test]
    fn prop_root_always_selected(
        (model, config) in arb_model_and_config(10)
    ) {
        if let Ok(resolved) = solve(&model, &config) {
            prop_assert!(
                resolved.effective_features.contains(&model.root),
                "root `{}` missing from resolved variant",
                model.root
            );
        }
    }

    /// If solve() returns Ok, every selected feature's ancestors are also selected.
    // rivet: verifies REQ-052
    #[test]
    fn prop_ancestor_closure(
        (model, config) in arb_model_and_config(10)
    ) {
        if let Ok(resolved) = solve(&model, &config) {
            for feat_name in &resolved.effective_features {
                // Walk up the parent chain -- every ancestor must be selected
                let mut cur = feat_name.as_str();
                while let Some(f) = model.features.get(cur) {
                    if let Some(ref parent) = f.parent {
                        prop_assert!(
                            resolved.effective_features.contains(parent),
                            "feature `{}` is selected but ancestor `{}` is not",
                            feat_name,
                            parent
                        );
                        cur = parent;
                    } else {
                        break;
                    }
                }
            }
        }
    }
}

// ── Constraint coverage (REQ-266) ─────────────────────────────────────────
//
// The strategies above hard-coded `constraints: vec![]`, so the solver's
// highest-risk code -- cross-tree constraint evaluation, `implies`
// propagation, `excludes`, and REQ-257's fail-loud gate -- had ZERO
// property-test coverage. The strategies and properties below fuzz it.

/// A generated boolean constraint over feature-name leaves.
///
/// Kept as a typed value (not just an `Expr`) so the property test can
/// evaluate it independently of the solver -- an oracle to check the
/// solver's `Ok` verdict against, catching a silent-pass (the `_ => true`
/// blind spot REQ-257 closed) rather than trusting the solver to grade
/// its own homework.
#[derive(Debug, Clone)]
enum TestConstraint {
    Implies(String, String),
    Excludes(String, String),
    And(String, String),
    Or(String, String),
    Not(String),
}

impl TestConstraint {
    /// Render to the s-expression source a user would write. Feature-name
    /// leaves use the `(= id "name")` form recognised by the solver's
    /// `extract_feature_name`.
    fn to_sexpr(&self) -> String {
        match self {
            TestConstraint::Implies(a, b) => format!("(implies (= id \"{a}\") (= id \"{b}\"))"),
            TestConstraint::Excludes(a, b) => format!("(excludes (= id \"{a}\") (= id \"{b}\"))"),
            TestConstraint::And(a, b) => format!("(and (= id \"{a}\") (= id \"{b}\"))"),
            TestConstraint::Or(a, b) => format!("(or (= id \"{a}\") (= id \"{b}\"))"),
            TestConstraint::Not(a) => format!("(not (= id \"{a}\"))"),
        }
    }

    fn to_expr(&self) -> Expr {
        sexpr_eval::parse_filter(&self.to_sexpr()).expect("generated constraint must parse")
    }

    /// Independent evaluation over a resolved selection -- the standard
    /// propositional semantics, matching the solver's `eval_constraint`
    /// but computed here so a divergence is a solver bug, not a shared one.
    fn eval(&self, selected: &BTreeSet<String>) -> bool {
        match self {
            TestConstraint::Implies(a, b) => !selected.contains(a) || selected.contains(b),
            TestConstraint::Excludes(a, b) => !(selected.contains(a) && selected.contains(b)),
            TestConstraint::And(a, b) => selected.contains(a) && selected.contains(b),
            TestConstraint::Or(a, b) => selected.contains(a) || selected.contains(b),
            TestConstraint::Not(a) => !selected.contains(a),
        }
    }
}

/// Generate a random constraint whose leaves reference REAL features in the
/// model (so it is evaluatable and never trips REQ-257/259 -- those are
/// exercised by the deterministic tests below).
fn arb_constraint(names: Vec<String>) -> impl Strategy<Value = TestConstraint> {
    let a = prop::sample::select(names.clone());
    let b = prop::sample::select(names);
    (a, b, 0u8..5).prop_map(|(a, b, shape)| match shape {
        0 => TestConstraint::Implies(a, b),
        1 => TestConstraint::Excludes(a, b),
        2 => TestConstraint::And(a, b),
        3 => TestConstraint::Or(a, b),
        _ => TestConstraint::Not(a),
    })
}

/// Model + config + a set of evaluatable constraints referencing real
/// features. Returns the constraints in typed form too, for the oracle.
fn arb_model_config_with_constraints(
    max_features: usize,
) -> impl Strategy<Value = (FeatureModel, VariantConfig, Vec<TestConstraint>)> {
    arb_feature_model(max_features).prop_flat_map(|model| {
        let names: Vec<String> = model.features.keys().cloned().collect();
        let cfg = arb_variant_config(names.clone());
        let cons = prop::collection::vec(arb_constraint(names), 0..4);
        (Just(model), cfg, cons).prop_map(|(mut m, c, cons)| {
            m.constraints = cons.iter().map(TestConstraint::to_expr).collect();
            (m, c, cons)
        })
    })
}

proptest! {
    #![proptest_config(ProptestConfig::with_cases(200))]

    /// The solver never panics on a model carrying arbitrary (evaluatable)
    /// cross-tree constraints.
    // rivet: verifies REQ-052, REQ-266
    #[test]
    fn prop_solver_never_panics_with_constraints(
        (model, config, _cons) in arb_model_config_with_constraints(8)
    ) {
        let _ = solve(&model, &config);
    }

    /// Soundness: if `solve()` returns `Ok`, EVERY cross-tree constraint
    /// genuinely holds under an independent evaluation of the resolved
    /// selection. A silent-pass (the pre-REQ-257 `_ => true` blind spot)
    /// would show up here as an `Ok` whose selection violates a constraint.
    // rivet: verifies REQ-257, REQ-266
    #[test]
    fn prop_ok_means_constraints_actually_hold(
        (model, config, cons) in arb_model_config_with_constraints(8)
    ) {
        if let Ok(resolved) = solve(&model, &config) {
            for c in &cons {
                prop_assert!(
                    c.eval(&resolved.effective_features),
                    "solver returned Ok but constraint {} is violated by the resolved set {:?}",
                    c.to_sexpr(),
                    resolved.effective_features
                );
            }
        }
    }

    /// `implies` propagation: if `solve()` succeeds and the antecedent of an
    /// `(implies A B)` constraint is selected, the consequent must be too.
    // rivet: verifies REQ-266
    #[test]
    fn prop_implies_propagation(
        (model, config, cons) in arb_model_config_with_constraints(8)
    ) {
        if let Ok(resolved) = solve(&model, &config) {
            for c in &cons {
                if let TestConstraint::Implies(a, b) = c {
                    if resolved.effective_features.contains(a) {
                        prop_assert!(
                            resolved.effective_features.contains(b),
                            "implies antecedent `{a}` selected but consequent `{b}` was not propagated"
                        );
                    }
                }
            }
        }
    }
}

// ── Fail-loud gates (REQ-257 / REQ-259), deterministic ────────────────────

/// A minimal valid two-feature model: `root` with one optional child `opt`.
fn simple_model() -> FeatureModel {
    FeatureModel::from_yaml(
        "kind: feature-model\n\
         root: root\n\
         features:\n\
        \x20 root:\n\
        \x20   group: optional\n\
        \x20   children: [opt]\n\
        \x20 opt:\n\
        \x20   group: leaf\n",
    )
    .expect("simple model must parse")
}

fn empty_config() -> VariantConfig {
    VariantConfig {
        name: "v".into(),
        selects: vec![],
    }
}

/// REQ-257: an attribute-comparison constraint the feature-model solver
/// cannot evaluate over a bare selection must fail LOUD
/// (`UnevaluatableConstraint`), never hit `eval_constraint`'s `_ => true`
/// arm and pass silently.
#[test]
fn solve_fails_loud_on_unevaluatable_constraint() {
    let mut model = simple_model();
    model.constraints = vec![sexpr_eval::parse_filter("(> asil 2)").expect("parses")];
    let errs = solve(&model, &empty_config()).expect_err("must not silently pass");
    assert!(
        errs.iter()
            .any(|e| matches!(e, SolveError::UnevaluatableConstraint(_))),
        "expected UnevaluatableConstraint, got {errs:?}"
    );
}

/// REQ-259: a constraint referencing a feature NAME that is not in the model
/// degenerates to a vacuous truth and must fail loud
/// (`UnknownConstraintFeature`) rather than enforce nothing quietly.
#[test]
fn solve_fails_loud_on_unknown_constraint_feature() {
    let mut model = simple_model();
    model.constraints = vec![
        sexpr_eval::parse_filter("(implies (= id \"ghost\") (= id \"opt\"))").expect("parses"),
    ];
    let errs = solve(&model, &empty_config()).expect_err("must not silently pass");
    assert!(
        errs.iter()
            .any(|e| matches!(e, SolveError::UnknownConstraintFeature { .. })),
        "expected UnknownConstraintFeature, got {errs:?}"
    );
}

/// A satisfiable evaluatable constraint over real features solves cleanly --
/// the fail-loud gates do not reject legitimate constraints.
#[test]
fn solve_accepts_valid_feature_constraint() {
    let mut model = simple_model();
    model.constraints =
        vec![sexpr_eval::parse_filter("(implies (= id \"opt\") (= id \"root\"))").expect("parses")];
    // Select `opt`; propagation pulls in `root`, so the implies holds.
    let cfg = VariantConfig {
        name: "v".into(),
        selects: vec!["opt".into()],
    };
    let resolved = solve(&model, &cfg).expect("valid constraint must solve");
    assert!(resolved.effective_features.contains("root"));
    assert!(resolved.effective_features.contains("opt"));
}

/// REQ-269: a shared child reachable through two parents (a diamond / DAG)
/// must NOT be mis-reported as a cycle.
///
/// `validate_tree` now uses a DFS that tracks the current path (recursion
/// stack) rather than a single global `visited` set, so a shared child
/// reached by two disjoint paths is a legal DAG edge, not a cycle. A genuine
/// cycle (a feature that is its own ancestor) is still rejected -- see
/// `genuine_cycle_is_rejected`.
#[test]
fn diamond_shared_child_is_not_a_cycle() {
    let yaml = "kind: feature-model\n\
                root: root\n\
                features:\n\
               \x20 root:\n\
               \x20   group: mandatory\n\
               \x20   children: [a, b]\n\
               \x20 a:\n\
               \x20   group: optional\n\
               \x20   children: [shared]\n\
               \x20 b:\n\
               \x20   group: optional\n\
               \x20   children: [shared]\n\
               \x20 shared:\n\
               \x20   group: leaf\n";
    let res = FeatureModel::from_yaml(yaml);
    assert!(
        res.is_ok(),
        "diamond (shared child) mis-reported as a cycle: {:?}",
        res.err()
    );
}

/// REQ-269 guard: a genuine cycle (a feature that is its own ancestor) must
/// STILL be rejected -- the diamond fix must not make cycle detection
/// permissive. `root -> mid -> root` is a real back edge.
#[test]
fn genuine_cycle_is_rejected() {
    let yaml = "kind: feature-model\n\
                root: root\n\
                features:\n\
               \x20 root:\n\
               \x20   group: mandatory\n\
               \x20   children: [mid]\n\
               \x20 mid:\n\
               \x20   group: mandatory\n\
               \x20   children: [root]\n";
    let res = FeatureModel::from_yaml(yaml);
    let err = res.expect_err("a self-ancestor cycle must be rejected");
    assert!(
        err.to_string().contains("cycle"),
        "expected a cycle error, got: {err}"
    );
}
