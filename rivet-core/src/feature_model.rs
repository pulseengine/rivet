//! Feature model schema and propositional constraint solver (PLE Phase 3).
//!
//! Implements a FODA-style feature tree with group types, variant
//! configuration, boolean constraint propagation, and feature-to-artifact
//! binding.

use std::collections::{BTreeMap, BTreeSet, VecDeque};

use serde::{Deserialize, Serialize};

use crate::error::Error;
use crate::sexpr_eval::{self, Expr};

// ── Feature model ──────────────────────────────────────────────────────

/// A FODA-style feature model: a rooted tree of features with group
/// types and cross-tree constraints expressed as s-expressions.
#[derive(Debug, Clone)]
pub struct FeatureModel {
    pub root: String,
    pub features: BTreeMap<String, Feature>,
    pub constraints: Vec<Expr>,
}

/// A single feature in the tree.
#[derive(Debug, Clone)]
pub struct Feature {
    pub name: String,
    pub group: GroupType,
    pub children: Vec<String>,
    pub parent: Option<String>,
}

/// Group semantics governing child selection.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum GroupType {
    /// All children required when parent is selected.
    Mandatory,
    /// Children are individually selectable.
    Optional,
    /// Exactly one child must be selected (XOR).
    Alternative,
    /// At least one child must be selected.
    Or,
    /// Terminal feature — no children.
    Leaf,
}

// ── Variant configuration ──────────────────────────────────────────────

/// User-level variant configuration: a named selection of features.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VariantConfig {
    pub name: String,
    pub selects: Vec<String>,
}

/// Result of solving a variant against a feature model.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ResolvedVariant {
    pub name: String,
    pub effective_features: BTreeSet<String>,
}

// ── Feature-to-artifact binding ────────────────────────────────────────

/// Maps features to artifact IDs and source globs.
///
/// May also carry a list of variant configurations that `rivet variant
/// check-all` iterates. Absent means "no declared variants" — check-all
/// reports an empty pass.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FeatureBinding {
    pub bindings: BTreeMap<String, Binding>,
    #[serde(default)]
    pub variants: Vec<VariantConfig>,
}

/// Artifacts and source files associated with a feature.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Binding {
    #[serde(default)]
    pub artifacts: Vec<String>,
    #[serde(default)]
    pub source: Vec<String>,
}

// ── YAML persistence ───────────────────────────────────────────────────

/// On-disk YAML representation of a feature model.
#[derive(Debug, Deserialize)]
struct FeatureModelYaml {
    #[allow(dead_code)]
    kind: Option<String>,
    root: String,
    #[serde(default)]
    features: BTreeMap<String, FeatureYaml>,
    #[serde(default)]
    constraints: Vec<String>,
}

#[derive(Debug, Deserialize)]
struct FeatureYaml {
    #[serde(default = "default_group")]
    group: GroupType,
    #[serde(default)]
    children: Vec<String>,
}

fn default_group() -> GroupType {
    GroupType::Leaf
}

/// Preprocess a feature constraint string: replace bare feature names
/// with `(has-tag "name")` so the s-expression parser accepts them.
/// The solver later interprets HasTag as "feature is selected".
fn preprocess_feature_constraint(src: &str, features: &BTreeMap<String, Feature>) -> String {
    let tokens = crate::sexpr::lex(src);
    let mut result = String::new();
    for token in &tokens {
        if token.kind == crate::sexpr::SyntaxKind::Symbol {
            let name = token.text;
            // Known forms pass through unchanged.
            if matches!(
                name,
                "and"
                    | "or"
                    | "not"
                    | "implies"
                    | "excludes"
                    | "forall"
                    | "exists"
                    | "="
                    | "!="
                    | ">"
                    | "<"
                    | ">="
                    | "<="
                    | "has-tag"
                    | "has-field"
                    | "in"
                    | "linked-by"
                    | "linked-from"
                    | "linked-to"
                    | "links-count"
                    | "matches"
                    | "contains"
                    | "reachable-from"
                    | "reachable-to"
                    | "count"
            ) {
                result.push_str(name);
            } else if features.contains_key(name) {
                // Bare feature name → (has-tag "name")
                result.push_str(&format!("(has-tag \"{name}\")"));
            } else {
                result.push_str(name);
            }
        } else {
            result.push_str(token.text);
        }
    }
    result
}

impl FeatureModel {
    /// Parse a feature model from a YAML string.
    pub fn from_yaml(yaml: &str) -> Result<Self, Error> {
        let raw: FeatureModelYaml =
            serde_yaml::from_str(yaml).map_err(|e| Error::Schema(format!("feature model: {e}")))?;

        let mut features = BTreeMap::new();

        // First pass: create features without parent links.
        for (name, fy) in &raw.features {
            features.insert(
                name.clone(),
                Feature {
                    name: name.clone(),
                    group: fy.group,
                    children: fy.children.clone(),
                    parent: None,
                },
            );
        }

        // Ensure root exists (it may have no explicit entry).
        features.entry(raw.root.clone()).or_insert_with(|| Feature {
            name: raw.root.clone(),
            group: GroupType::Mandatory,
            children: vec![],
            parent: None,
        });

        // Second pass: set parent links from children references.
        let parent_map: Vec<(String, String)> = features
            .iter()
            .flat_map(|(pname, f)| f.children.iter().map(move |c| (c.clone(), pname.clone())))
            .collect();

        for (child, parent) in parent_map {
            // Ensure child feature exists.
            features.entry(child.clone()).or_insert_with(|| Feature {
                name: child.clone(),
                group: GroupType::Leaf,
                children: vec![],
                parent: None,
            });
            features.get_mut(&child).unwrap().parent = Some(parent);
        }

        // Parse constraint s-expressions.
        // Feature model constraints use bare symbols as feature names.
        // Wrap them in (has-tag "name") so the parser accepts them —
        // the solver interprets HasTag as "feature is selected".
        let mut constraints = Vec::new();
        for src in &raw.constraints {
            let preprocessed = preprocess_feature_constraint(src, &features);
            let expr = sexpr_eval::parse_filter(&preprocessed).map_err(|errs| {
                let msgs: Vec<String> = errs.iter().map(|e| e.to_string()).collect();
                Error::Schema(format!("constraint `{src}`: {}", msgs.join("; ")))
            })?;
            constraints.push(expr);
        }

        let model = FeatureModel {
            root: raw.root,
            features,
            constraints,
        };

        model.validate_tree()?;
        Ok(model)
    }

    /// Validate the feature tree: no cycles, all children referenced exist,
    /// group types consistent with child counts.
    fn validate_tree(&self) -> Result<(), Error> {
        // Check root exists.
        if !self.features.contains_key(&self.root) {
            return Err(Error::Schema(format!(
                "root feature `{}` not defined",
                self.root
            )));
        }

        // Cycle detection via BFS from root, tracking visited.
        let mut visited = BTreeSet::new();
        let mut queue = VecDeque::new();
        queue.push_back(self.root.clone());

        while let Some(name) = queue.pop_front() {
            if !visited.insert(name.clone()) {
                return Err(Error::Schema(format!(
                    "cycle detected involving feature `{name}`"
                )));
            }
            if let Some(f) = self.features.get(&name) {
                for child in &f.children {
                    if !self.features.contains_key(child) {
                        return Err(Error::Schema(format!(
                            "feature `{name}` references unknown child `{child}`"
                        )));
                    }
                    queue.push_back(child.clone());
                }
            }
        }

        // Validate group types vs children.
        for (name, f) in &self.features {
            match f.group {
                GroupType::Leaf if !f.children.is_empty() => {
                    return Err(Error::Schema(format!(
                        "feature `{name}` is leaf but has children"
                    )));
                }
                GroupType::Alternative | GroupType::Or if f.children.is_empty() => {
                    return Err(Error::Schema(format!(
                        "feature `{name}` is {:?} but has no children",
                        f.group
                    )));
                }
                _ => {}
            }
        }

        Ok(())
    }
}

// ── Constraint solver ──────────────────────────────────────────────────

/// Solver diagnostics — why a variant is invalid.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum SolveError {
    /// A selected feature does not exist in the model.
    UnknownFeature(String),
    /// An `alternative` group has != 1 child selected.
    AlternativeViolation {
        parent: String,
        selected: Vec<String>,
    },
    /// An `or` group has zero children selected.
    OrViolation { parent: String },
    /// A constraint is violated after propagation.
    ConstraintViolation(String),
    /// A mandatory child is missing (should not happen after propagation,
    /// but reported defensively).
    MandatoryMissing { parent: String, child: String },
}

impl std::fmt::Display for SolveError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            SolveError::UnknownFeature(name) => write!(f, "unknown feature: {name}"),
            SolveError::AlternativeViolation { parent, selected } => {
                write!(
                    f,
                    "alternative group `{parent}` requires exactly 1 child, got {}: [{}]",
                    selected.len(),
                    selected.join(", ")
                )
            }
            SolveError::OrViolation { parent } => {
                write!(f, "or group `{parent}` requires at least 1 child selected")
            }
            SolveError::ConstraintViolation(msg) => write!(f, "constraint violated: {msg}"),
            SolveError::MandatoryMissing { parent, child } => {
                write!(f, "mandatory child `{child}` of `{parent}` not selected")
            }
        }
    }
}

/// Solve a variant configuration against a feature model.
///
/// 1. Start with user-selected features + root.
/// 2. Propagate mandatory children (fixpoint).
/// 3. Propagate `implies` constraints from s-expressions (fixpoint).
/// 4. Check group constraints and remaining constraints.
///
/// Returns `Ok(ResolvedVariant)` on success, `Err(Vec<SolveError>)` on failure.
pub fn solve(
    model: &FeatureModel,
    config: &VariantConfig,
) -> Result<ResolvedVariant, Vec<SolveError>> {
    let mut errors = Vec::new();

    // Validate all selected features exist.
    for name in &config.selects {
        if !model.features.contains_key(name) {
            errors.push(SolveError::UnknownFeature(name.clone()));
        }
    }
    if !errors.is_empty() {
        return Err(errors);
    }

    // Start with root + user selections.
    let mut selected: BTreeSet<String> = config.selects.iter().cloned().collect();
    selected.insert(model.root.clone());

    // Also select ancestors of every selected feature (a child implies its parent).
    let initial: Vec<String> = selected.iter().cloned().collect();
    for name in initial {
        let mut cur = name.as_str();
        while let Some(f) = model.features.get(cur) {
            if let Some(ref p) = f.parent {
                selected.insert(p.clone());
                cur = p;
            } else {
                break;
            }
        }
    }

    // Boolean constraint propagation: fixpoint loop.
    let mut changed = true;
    let max_iterations = model.features.len() + model.constraints.len() + 1;
    let mut iteration = 0;
    while changed && iteration < max_iterations {
        changed = false;
        iteration += 1;

        // Propagate mandatory children.
        let snapshot: Vec<String> = selected.iter().cloned().collect();
        for name in &snapshot {
            if let Some(f) = model.features.get(name) {
                if f.group == GroupType::Mandatory {
                    for child in &f.children {
                        if selected.insert(child.clone()) {
                            changed = true;
                        }
                    }
                }
            }
        }

        // Propagate `implies` constraints: (implies A B)
        // If A is a feature name and it's selected, select B.
        for constraint in &model.constraints {
            if let Expr::Implies(antecedent, consequent) = constraint {
                if is_feature_selected(antecedent, &selected)
                    && !is_feature_selected(consequent, &selected)
                {
                    if let Some(name) = extract_feature_name(consequent) {
                        if model.features.contains_key(&name) && selected.insert(name) {
                            changed = true;
                        }
                    }
                }
            }
        }
    }

    // Check group constraints.
    for (name, feature) in &model.features {
        if !selected.contains(name) {
            continue;
        }
        match feature.group {
            GroupType::Mandatory => {
                for child in &feature.children {
                    if !selected.contains(child) {
                        errors.push(SolveError::MandatoryMissing {
                            parent: name.clone(),
                            child: child.clone(),
                        });
                    }
                }
            }
            GroupType::Alternative => {
                let sel_children: Vec<String> = feature
                    .children
                    .iter()
                    .filter(|c| selected.contains(*c))
                    .cloned()
                    .collect();
                if sel_children.len() != 1 {
                    errors.push(SolveError::AlternativeViolation {
                        parent: name.clone(),
                        selected: sel_children,
                    });
                }
            }
            GroupType::Or => {
                let any = feature.children.iter().any(|c| selected.contains(c));
                if !any {
                    errors.push(SolveError::OrViolation {
                        parent: name.clone(),
                    });
                }
            }
            GroupType::Optional | GroupType::Leaf => {}
        }
    }

    // Check every cross-tree constraint as a boolean assertion over the
    // propagated selection. This catches violations that propagation
    // cannot (e.g. `(implies X (not Y))`, where the consequent is a
    // negation rather than a feature to be auto-selected).
    for constraint in &model.constraints {
        // `excludes` produces a dedicated message to preserve pre-fix
        // diagnostics; all other constraint shapes fall through to the
        // generic evaluator.
        if let Expr::Excludes(a, b) = constraint {
            if eval_constraint(a, &selected) && eval_constraint(b, &selected) {
                errors.push(SolveError::ConstraintViolation(format!(
                    "excludes({}, {})",
                    describe_expr(a),
                    describe_expr(b),
                )));
            }
            continue;
        }
        if !eval_constraint(constraint, &selected) {
            errors.push(SolveError::ConstraintViolation(describe_constraint(
                constraint,
            )));
        }
    }

    if errors.is_empty() {
        Ok(ResolvedVariant {
            name: config.name.clone(),
            effective_features: selected,
        })
    } else {
        Err(errors)
    }
}

// ── Helpers ────────────────────────────────────────────────────────────

/// Check whether a simple expression refers to a selected feature.
///
/// For constraint propagation we handle simple cases:
///   - `Eq(Field("id"), Str(name))` — the usual pattern from `(= id "feat")`
///   - A bare identifier that parsed as `Eq(Field(name), Str("true"))` or
///     similar — we also check the field name against the selected set.
///
/// For compound expressions, fall back to checking recursively.
fn is_feature_selected(expr: &Expr, selected: &BTreeSet<String>) -> bool {
    if let Some(name) = extract_feature_name(expr) {
        return selected.contains(&name);
    }
    // For `And`, all sub-features must be selected.
    if let Expr::And(children) = expr {
        return children.iter().all(|c| is_feature_selected(c, selected));
    }
    // For `Or`, any sub-feature selected.
    if let Expr::Or(children) = expr {
        return children.iter().any(|c| is_feature_selected(c, selected));
    }
    // For `Not`, invert.
    if let Expr::Not(inner) = expr {
        return !is_feature_selected(inner, selected);
    }
    false
}

/// Try to extract a single feature name from an expression.
///
/// Recognises patterns produced by `parse_filter`:
///   - `(= id "feature-name")` → `Some("feature-name")`
///   - bare identifier → heuristic via `HasField`
fn extract_feature_name(expr: &Expr) -> Option<String> {
    match expr {
        Expr::Eq(sexpr_eval::Accessor::Field(field), sexpr_eval::Value::Str(val))
            if field == "id" =>
        {
            Some(val.clone())
        }
        Expr::HasField(sexpr_eval::Value::Str(name)) => Some(name.clone()),
        Expr::HasTag(sexpr_eval::Value::Str(name)) => Some(name.clone()),
        _ => None,
    }
}

/// Produce a short description of an expression for error messages.
fn describe_expr(expr: &Expr) -> String {
    if let Some(name) = extract_feature_name(expr) {
        name
    } else {
        format!("{expr:?}")
    }
}

/// Describe a top-level constraint for a `ConstraintViolation` message.
///
/// Renders the common logical shapes as human-readable text; falls back
/// to the `Debug` representation for anything exotic.
fn describe_constraint(expr: &Expr) -> String {
    match expr {
        Expr::Implies(a, b) => format!("implies({}, {})", describe_expr(a), describe_expr(b)),
        Expr::Excludes(a, b) => format!("excludes({}, {})", describe_expr(a), describe_expr(b)),
        Expr::Not(inner) => format!("not({})", describe_expr(inner)),
        Expr::And(children) => format!(
            "and({})",
            children
                .iter()
                .map(describe_expr)
                .collect::<Vec<_>>()
                .join(", ")
        ),
        Expr::Or(children) => format!(
            "or({})",
            children
                .iter()
                .map(describe_expr)
                .collect::<Vec<_>>()
                .join(", ")
        ),
        _ => describe_expr(expr),
    }
}

/// Evaluate a constraint expression as a boolean over the selected set.
///
/// Distinct from `is_feature_selected` in two ways:
///   - `Implies(a, b)` evaluates to `(not a) or b` — the standard
///     propositional semantics — rather than recursing structurally.
///   - `Excludes(a, b)` evaluates to `not (a and b)`.
///
/// Leaves (feature-name equality, `HasTag`, `HasField` on a known name)
/// are resolved via `extract_feature_name` + membership in `selected`.
/// Unknown expression shapes evaluate to `true` so the solver remains
/// permissive for constraint flavours it does not understand (forward
/// compatibility with richer predicates).
fn eval_constraint(expr: &Expr, selected: &BTreeSet<String>) -> bool {
    if let Some(name) = extract_feature_name(expr) {
        return selected.contains(&name);
    }
    match expr {
        Expr::And(children) => children.iter().all(|c| eval_constraint(c, selected)),
        Expr::Or(children) => children.iter().any(|c| eval_constraint(c, selected)),
        Expr::Not(inner) => !eval_constraint(inner, selected),
        Expr::Implies(a, b) => !eval_constraint(a, selected) || eval_constraint(b, selected),
        Expr::Excludes(a, b) => !(eval_constraint(a, selected) && eval_constraint(b, selected)),
        Expr::BoolLit(v) => *v,
        // Unknown / artifact-oriented predicates (link queries, regex
        // matches, etc.) are not meaningful over a feature selection;
        // treat as satisfied so we do not raise spurious violations.
        _ => true,
    }
}

// ── Tests ──────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;

    fn vehicle_model_yaml() -> &'static str {
        r#"
kind: feature-model
root: vehicle
features:
  vehicle:
    group: mandatory
    children: [engine, safety, market]
  engine:
    group: alternative
    children: [petrol, electric]
  petrol:
    group: leaf
  electric:
    group: leaf
  safety:
    group: optional
    children: [abs, esc, pedestrian-detection]
  abs:
    group: leaf
  esc:
    group: leaf
  pedestrian-detection:
    group: leaf
  market:
    group: alternative
    children: [eu, us, cn]
  eu:
    group: leaf
  us:
    group: leaf
  cn:
    group: leaf
constraints:
  - (implies (= id "eu") (= id "pedestrian-detection"))
  - (excludes (= id "petrol") (= id "cn"))
"#
    }

    #[test]
    fn parse_feature_model_roundtrip() {
        let model = FeatureModel::from_yaml(vehicle_model_yaml()).unwrap();
        assert_eq!(model.root, "vehicle");
        assert_eq!(model.features.len(), 12);
        assert_eq!(model.constraints.len(), 2);
        assert_eq!(model.features["engine"].group, GroupType::Alternative);
        assert_eq!(
            model.features["vehicle"].children,
            vec!["engine", "safety", "market"]
        );
    }

    #[test]
    fn mandatory_propagation() {
        let model = FeatureModel::from_yaml(vehicle_model_yaml()).unwrap();
        let config = VariantConfig {
            name: "eu-electric".into(),
            selects: vec!["electric".into(), "eu".into(), "abs".into()],
        };
        let resolved = solve(&model, &config).unwrap();

        // Root and mandatory children must be present.
        assert!(resolved.effective_features.contains("vehicle"));
        assert!(resolved.effective_features.contains("engine"));
        assert!(resolved.effective_features.contains("safety"));
        assert!(resolved.effective_features.contains("market"));

        // User selections present.
        assert!(resolved.effective_features.contains("electric"));
        assert!(resolved.effective_features.contains("eu"));
        assert!(resolved.effective_features.contains("abs"));

        // `implies eu pedestrian-detection` should have fired.
        assert!(
            resolved.effective_features.contains("pedestrian-detection"),
            "EU implies pedestrian-detection"
        );
    }

    #[test]
    fn alternative_violation_detected() {
        let model = FeatureModel::from_yaml(vehicle_model_yaml()).unwrap();
        let config = VariantConfig {
            name: "two-engines".into(),
            selects: vec!["petrol".into(), "electric".into(), "eu".into()],
        };
        let result = solve(&model, &config);
        assert!(result.is_err());
        let errors = result.unwrap_err();
        assert!(errors.iter().any(|e| matches!(
            e,
            SolveError::AlternativeViolation { parent, .. } if parent == "engine"
        )));
    }

    #[test]
    fn or_group_validation() {
        let yaml = r#"
kind: feature-model
root: app
features:
  app:
    group: mandatory
    children: [auth]
  auth:
    group: or
    children: [oauth, ldap, saml]
  oauth:
    group: leaf
  ldap:
    group: leaf
  saml:
    group: leaf
constraints: []
"#;
        let model = FeatureModel::from_yaml(yaml).unwrap();

        // No auth children selected → or violation.
        let config = VariantConfig {
            name: "no-auth-method".into(),
            selects: vec![],
        };
        let result = solve(&model, &config);
        assert!(result.is_err());
        let errors = result.unwrap_err();
        assert!(errors.iter().any(|e| matches!(
            e,
            SolveError::OrViolation { parent } if parent == "auth"
        )));

        // One selected → ok.
        let config2 = VariantConfig {
            name: "oauth-only".into(),
            selects: vec!["oauth".into()],
        };
        assert!(solve(&model, &config2).is_ok());

        // Two selected → also ok for `or`.
        let config3 = VariantConfig {
            name: "multi-auth".into(),
            selects: vec!["oauth".into(), "ldap".into()],
        };
        assert!(solve(&model, &config3).is_ok());
    }

    #[test]
    fn excludes_constraint() {
        let model = FeatureModel::from_yaml(vehicle_model_yaml()).unwrap();
        // petrol + cn violates `(excludes petrol cn)`.
        let config = VariantConfig {
            name: "petrol-cn".into(),
            selects: vec!["petrol".into(), "cn".into()],
        };
        let result = solve(&model, &config);
        assert!(result.is_err());
        let errors = result.unwrap_err();
        assert!(errors.iter().any(|e| matches!(
            e,
            SolveError::ConstraintViolation(msg) if msg.contains("excludes")
        )));
    }

    #[test]
    fn unknown_feature_detected() {
        let model = FeatureModel::from_yaml(vehicle_model_yaml()).unwrap();
        let config = VariantConfig {
            name: "bad".into(),
            selects: vec!["nonexistent".into()],
        };
        let result = solve(&model, &config);
        assert!(result.is_err());
        assert!(result.unwrap_err().iter().any(|e| matches!(
            e,
            SolveError::UnknownFeature(n) if n == "nonexistent"
        )));
    }

    #[test]
    fn cycle_detection() {
        let yaml = r#"
kind: feature-model
root: a
features:
  a:
    group: mandatory
    children: [b]
  b:
    group: mandatory
    children: [a]
constraints: []
"#;
        let result = FeatureModel::from_yaml(yaml);
        assert!(result.is_err());
        let msg = format!("{}", result.unwrap_err());
        assert!(msg.contains("cycle"), "expected cycle error, got: {msg}");
    }

    #[test]
    fn leaf_with_children_rejected() {
        let yaml = r#"
kind: feature-model
root: a
features:
  a:
    group: leaf
    children: [b]
  b:
    group: leaf
constraints: []
"#;
        let result = FeatureModel::from_yaml(yaml);
        assert!(result.is_err());
        let msg = format!("{}", result.unwrap_err());
        assert!(
            msg.contains("leaf") && msg.contains("children"),
            "expected leaf-with-children error, got: {msg}"
        );
    }

    #[test]
    fn binding_deserialization() {
        let yaml = r#"
bindings:
  pedestrian-detection:
    artifacts: ["REQ-PD-001", "SPEC-PD-001"]
    source: ["src/pd/**/*.rs"]
  abs:
    artifacts: ["REQ-ABS-001"]
    source: []
"#;
        let binding: FeatureBinding = serde_yaml::from_str(yaml).unwrap();
        assert_eq!(binding.bindings.len(), 2);
        assert_eq!(
            binding.bindings["pedestrian-detection"].artifacts,
            vec!["REQ-PD-001", "SPEC-PD-001"]
        );
        assert_eq!(
            binding.bindings["pedestrian-detection"].source,
            vec!["src/pd/**/*.rs"]
        );
    }

    #[test]
    fn variant_config_deserialization() {
        let yaml = r#"
name: eu-electric
selects:
  - electric
  - eu
  - abs
"#;
        let config: VariantConfig = serde_yaml::from_str(yaml).unwrap();
        assert_eq!(config.name, "eu-electric");
        assert_eq!(config.selects, vec!["electric", "eu", "abs"]);
    }

    #[test]
    fn empty_model_with_root_only() {
        let yaml = r#"
kind: feature-model
root: single
features:
  single:
    group: leaf
constraints: []
"#;
        let model = FeatureModel::from_yaml(yaml).unwrap();
        let config = VariantConfig {
            name: "minimal".into(),
            selects: vec![],
        };
        let resolved = solve(&model, &config).unwrap();
        assert_eq!(resolved.effective_features.len(), 1);
        assert!(resolved.effective_features.contains("single"));
    }

    /// Shared model for cross-tree constraint tests: `system` is a
    /// mandatory parent containing an optional subtree with two
    /// independently selectable siblings, so we can test variants where
    /// only one of {feature-x, feature-y} is selected.
    fn cross_tree_model_yaml() -> &'static str {
        r#"
kind: feature-model
root: system
features:
  system:
    group: mandatory
    children: [base, extras]
  base:
    group: leaf
  extras:
    group: optional
    children: [feature-x, feature-y]
  feature-x:
    group: leaf
  feature-y:
    group: leaf
constraints:
  - (implies feature-x (not feature-y))
"#
    }

    #[test]
    fn cross_tree_implies_not_violation_detected() {
        // Regression: `(implies X (not Y))` with both X and Y selected
        // must produce a ConstraintViolation. Before the fix, the solver
        // only used `implies` for forward propagation (selecting
        // consequent features when antecedent was selected) and had no
        // code path that actually evaluated the implication as a logical
        // assertion — so a negated consequent with a selected Y was
        // silently accepted as PASS.
        let model = FeatureModel::from_yaml(cross_tree_model_yaml()).unwrap();
        let config = VariantConfig {
            name: "both-x-and-y".into(),
            selects: vec!["feature-x".into(), "feature-y".into()],
        };
        let result = solve(&model, &config);
        assert!(
            result.is_err(),
            "expected FAIL for `(implies feature-x (not feature-y))` with both selected, got PASS: {result:?}"
        );
        let errors = result.unwrap_err();
        assert!(
            errors.iter().any(|e| matches!(
                e,
                SolveError::ConstraintViolation(msg) if msg.contains("implies")
            )),
            "expected ConstraintViolation for implies, got: {errors:?}"
        );
    }

    #[test]
    fn cross_tree_implies_not_allows_valid_variant() {
        // Companion to the regression test above: when Y is NOT selected,
        // `(implies X (not Y))` must PASS. This guards against an
        // over-eager fix that flags every `implies (not ...)` as a
        // violation.
        let model = FeatureModel::from_yaml(cross_tree_model_yaml()).unwrap();
        let config = VariantConfig {
            name: "x-only".into(),
            selects: vec!["feature-x".into()],
        };
        let result = solve(&model, &config);
        assert!(result.is_ok(), "expected PASS for x-only, got: {result:?}");
    }

    #[test]
    fn cross_tree_implies_positive_propagates() {
        // `(implies feature-x feature-y)` + select only X: the solver
        // propagates Y into the selection and returns PASS. This guards
        // against the fix breaking forward propagation.
        let yaml = r#"
kind: feature-model
root: system
features:
  system:
    group: mandatory
    children: [base, extras]
  base:
    group: leaf
  extras:
    group: optional
    children: [feature-x, feature-y]
  feature-x:
    group: leaf
  feature-y:
    group: leaf
constraints:
  - (implies feature-x feature-y)
"#;
        let model = FeatureModel::from_yaml(yaml).unwrap();
        let config = VariantConfig {
            name: "x-only".into(),
            selects: vec!["feature-x".into()],
        };
        let resolved = solve(&model, &config).unwrap();
        assert!(resolved.effective_features.contains("feature-y"));
    }

    #[test]
    fn ancestor_propagation() {
        // Selecting a deep leaf should auto-select all ancestors.
        let yaml = r#"
kind: feature-model
root: root
features:
  root:
    group: optional
    children: [mid]
  mid:
    group: optional
    children: [deep]
  deep:
    group: leaf
constraints: []
"#;
        let model = FeatureModel::from_yaml(yaml).unwrap();
        let config = VariantConfig {
            name: "deep-select".into(),
            selects: vec!["deep".into()],
        };
        let resolved = solve(&model, &config).unwrap();
        assert!(resolved.effective_features.contains("root"));
        assert!(resolved.effective_features.contains("mid"));
        assert!(resolved.effective_features.contains("deep"));
    }
}
