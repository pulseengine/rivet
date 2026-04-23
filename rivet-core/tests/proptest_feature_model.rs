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
    Feature, FeatureModel, GroupType, ResolvedVariant, VariantConfig, solve,
};

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
