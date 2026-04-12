//! S-expression evaluator for artifact filtering and constraints.
//!
//! Two-layer design:
//!   1. Typed AST (`Expr`) — pure data, no rowan dependency.
//!   2. Lowering from rowan CST (`sexpr::SyntaxNode`) → `Expr`.
//!
//! The evaluator operates on a single artifact + link graph context,
//! returning a boolean for predicate evaluation.

use crate::links::LinkGraph;
use crate::model::Artifact;

// ── Typed AST ───────────────────────────────────────────────────────────

/// A filter/constraint expression.
#[derive(Debug, Clone, PartialEq)]
pub enum Expr {
    // ── Logical connectives ─────────────────────────────────────────
    /// All sub-expressions must be true (variadic).
    And(Vec<Expr>),
    /// At least one sub-expression must be true (variadic).
    Or(Vec<Expr>),
    /// Negation.
    Not(Box<Expr>),
    /// `(implies a b)` ≡ `(or (not a) b)`.
    Implies(Box<Expr>, Box<Expr>),
    /// `(excludes a b)` ≡ `(not (and a b))`.
    Excludes(Box<Expr>, Box<Expr>),

    // ── Comparison predicates ───────────────────────────────────────
    /// `(= field "value")`
    Eq(Accessor, Value),
    /// `(!= field "value")`
    Ne(Accessor, Value),
    /// `(> field value)` — numeric comparison.
    Gt(Accessor, Value),
    /// `(< field value)`
    Lt(Accessor, Value),
    /// `(>= field value)`
    Ge(Accessor, Value),
    /// `(<= field value)`
    Le(Accessor, Value),

    // ── Collection predicates ───────────────────────────────────────
    /// `(in "value" field)` — value is a member of a list field (e.g., tags).
    In(Value, Accessor),
    /// `(has-tag "stpa")` — shorthand for `(in "stpa" tags)`.
    HasTag(Value),
    /// `(has-field "asil")` — field exists and is non-null.
    HasField(Value),
    /// `(matches field "regex")` — regex match on string field.
    Matches(Accessor, Value),
    /// `(contains field "substring")` — substring match.
    Contains(Accessor, Value),

    // ── Link predicates ─────────────────────────────────────────────
    /// `(linked-by "satisfies" _)` — has outgoing link of type.
    LinkedBy(Value, Value),
    /// `(linked-from "implements" _)` — has incoming link of type.
    LinkedFrom(Value, Value),
    /// `(linked-to "SPEC-021")` — has a link targeting specific ID.
    LinkedTo(Value),
    /// `(links-count "satisfies" > 2)` — cardinality check.
    LinksCount(Value, CompOp, Value),

    // ── Literal ─────────────────────────────────────────────────────
    /// Constant boolean (useful after constant folding).
    BoolLit(bool),
}

/// How to access a field on an artifact.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum Accessor {
    /// Named field: "type", "status", "id", "title", "description",
    /// or any key in the `fields` BTreeMap.
    Field(String),
}

/// A literal value in an expression.
#[derive(Debug, Clone, PartialEq)]
pub enum Value {
    Str(String),
    Int(i64),
    Float(f64),
    Bool(bool),
    /// `_` — matches anything (used in link predicates).
    Wildcard,
}

/// Comparison operator for `LinksCount`.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum CompOp {
    Gt,
    Lt,
    Ge,
    Le,
    Eq,
    Ne,
}

// ── Evaluation context ──────────────────────────────────────────────────

/// Context needed to check a predicate against one artifact.
pub struct EvalContext<'a> {
    pub artifact: &'a Artifact,
    pub graph: &'a LinkGraph,
}

// ── Predicate checker ───────────────────────────────────────────────────

/// Check whether an expression holds for a single artifact.
///
/// This is a pure function: it pattern-matches the AST and resolves
/// field accesses against the artifact struct and link graph.
/// No arbitrary code execution — only structured predicate evaluation.
pub fn check(expr: &Expr, ctx: &EvalContext) -> bool {
    match expr {
        // Logical connectives
        Expr::And(exprs) => exprs.iter().all(|e| check(e, ctx)),
        Expr::Or(exprs) => exprs.iter().any(|e| check(e, ctx)),
        Expr::Not(e) => !check(e, ctx),
        Expr::Implies(a, b) => !check(a, ctx) || check(b, ctx),
        Expr::Excludes(a, b) => !(check(a, ctx) && check(b, ctx)),

        // Comparison predicates
        Expr::Eq(acc, val) => resolve_str(acc, ctx.artifact) == value_to_str(val),
        Expr::Ne(acc, val) => resolve_str(acc, ctx.artifact) != value_to_str(val),
        Expr::Gt(acc, val) => compare_numeric(acc, val, ctx.artifact, |a, b| a > b),
        Expr::Lt(acc, val) => compare_numeric(acc, val, ctx.artifact, |a, b| a < b),
        Expr::Ge(acc, val) => compare_numeric(acc, val, ctx.artifact, |a, b| a >= b),
        Expr::Le(acc, val) => compare_numeric(acc, val, ctx.artifact, |a, b| a <= b),

        // Collection predicates
        Expr::In(val, acc) => {
            let needle = value_to_str(val);
            resolve_list(acc, ctx.artifact)
                .iter()
                .any(|item| *item == needle)
        }
        Expr::HasTag(val) => {
            let tag = value_to_str(val);
            ctx.artifact.tags.iter().any(|t| *t == tag)
        }
        Expr::HasField(val) => {
            let name = value_to_str(val);
            resolve_field_exists(&name, ctx.artifact)
        }
        Expr::Matches(acc, val) => {
            let text = resolve_str(acc, ctx.artifact);
            let pattern = value_to_str(val);
            regex::Regex::new(&pattern)
                .map(|re| re.is_match(&text))
                .unwrap_or(false)
        }
        Expr::Contains(acc, val) => {
            let text = resolve_str(acc, ctx.artifact);
            let needle = value_to_str(val);
            text.contains(&needle)
        }

        // Link predicates
        Expr::LinkedBy(link_type, target) => {
            let lt = value_to_str(link_type);
            let tgt = value_to_str(target);
            ctx.artifact.links.iter().any(|l| {
                l.link_type == lt && (matches!(target, Value::Wildcard) || l.target == tgt)
            })
        }
        Expr::LinkedFrom(link_type, _source) => {
            let lt = value_to_str(link_type);
            let backlinks = ctx.graph.backlinks_to(&ctx.artifact.id);
            backlinks.iter().any(|bl| bl.link_type == lt)
        }
        Expr::LinkedTo(target_id) => {
            let tgt = value_to_str(target_id);
            ctx.artifact.links.iter().any(|l| l.target == tgt)
        }
        Expr::LinksCount(link_type, op, val) => {
            let lt = value_to_str(link_type);
            let count = ctx.artifact.links.iter().filter(|l| l.link_type == lt).count() as i64;
            let threshold = value_to_i64(val);
            match op {
                CompOp::Gt => count > threshold,
                CompOp::Lt => count < threshold,
                CompOp::Ge => count >= threshold,
                CompOp::Le => count <= threshold,
                CompOp::Eq => count == threshold,
                CompOp::Ne => count != threshold,
            }
        }

        Expr::BoolLit(b) => *b,
    }
}

// ── Field resolution ────────────────────────────────────────────────────

fn resolve_str(acc: &Accessor, artifact: &Artifact) -> String {
    match acc {
        Accessor::Field(name) => match name.as_str() {
            "id" => artifact.id.clone(),
            "type" => artifact.artifact_type.clone(),
            "title" => artifact.title.clone(),
            "description" => artifact.description.clone().unwrap_or_default(),
            "status" => artifact.status.clone().unwrap_or_default(),
            other => artifact
                .fields
                .get(other)
                .map(yaml_value_to_string)
                .unwrap_or_default(),
        },
    }
}

fn resolve_list(acc: &Accessor, artifact: &Artifact) -> Vec<String> {
    match acc {
        Accessor::Field(name) => match name.as_str() {
            "tags" => artifact.tags.clone(),
            other => artifact
                .fields
                .get(other)
                .and_then(|v| match v {
                    serde_yaml::Value::Sequence(seq) => {
                        Some(seq.iter().map(yaml_value_to_string).collect())
                    }
                    _ => None,
                })
                .unwrap_or_default(),
        },
    }
}

fn resolve_field_exists(name: &str, artifact: &Artifact) -> bool {
    match name {
        "id" | "type" | "title" => true,
        "description" => artifact.description.is_some(),
        "status" => artifact.status.is_some(),
        "tags" => !artifact.tags.is_empty(),
        other => artifact.fields.contains_key(other),
    }
}

fn yaml_value_to_string(v: &serde_yaml::Value) -> String {
    match v {
        serde_yaml::Value::String(s) => s.clone(),
        serde_yaml::Value::Number(n) => n.to_string(),
        serde_yaml::Value::Bool(b) => b.to_string(),
        serde_yaml::Value::Null => String::new(),
        _ => format!("{v:?}"),
    }
}

fn value_to_str(val: &Value) -> String {
    match val {
        Value::Str(s) => s.clone(),
        Value::Int(i) => i.to_string(),
        Value::Float(f) => f.to_string(),
        Value::Bool(b) => b.to_string(),
        Value::Wildcard => "_".into(),
    }
}

fn value_to_i64(val: &Value) -> i64 {
    match val {
        Value::Int(i) => *i,
        Value::Float(f) => *f as i64,
        Value::Str(s) => s.parse().unwrap_or(0),
        _ => 0,
    }
}

fn compare_numeric(
    acc: &Accessor,
    val: &Value,
    artifact: &Artifact,
    cmp: fn(f64, f64) -> bool,
) -> bool {
    let field_str = resolve_str(acc, artifact);
    let field_num: f64 = field_str.parse().unwrap_or(f64::NAN);
    let threshold = match val {
        Value::Int(i) => *i as f64,
        Value::Float(f) => *f,
        Value::Str(s) => s.parse().unwrap_or(f64::NAN),
        _ => f64::NAN,
    };
    cmp(field_num, threshold)
}

// ── CST → AST Lowering ─────────────────────────────────────────────────

/// Error from lowering a CST to a typed AST.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct LowerError {
    pub offset: usize,
    pub message: String,
}

/// Error from parsing + lowering a filter expression.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct FilterError {
    pub offset: usize,
    pub message: String,
}

impl std::fmt::Display for FilterError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "offset {}: {}", self.offset, self.message)
    }
}

/// Parse a filter string into a typed expression.
///
/// Combines parsing (CST) and lowering (AST) in one step.
pub fn parse_filter(source: &str) -> Result<Expr, Vec<FilterError>> {
    use crate::sexpr;

    let (green, parse_errors) = sexpr::parse(source);
    if !parse_errors.is_empty() {
        return Err(parse_errors
            .into_iter()
            .map(|e| FilterError {
                offset: e.offset,
                message: e.message,
            })
            .collect());
    }

    let root = sexpr::SyntaxNode::new_root(green);
    lower(&root).map_err(|errs| {
        errs.into_iter()
            .map(|e| FilterError {
                offset: e.offset,
                message: e.message,
            })
            .collect()
    })
}

/// Convenience: parse a filter and check it against one artifact.
pub fn matches_filter(expr: &Expr, artifact: &Artifact, graph: &LinkGraph) -> bool {
    let ctx = EvalContext { artifact, graph };
    check(expr, &ctx)
}

/// Lower a rowan s-expression CST root into a typed `Expr`.
pub fn lower(root: &crate::sexpr::SyntaxNode) -> Result<Expr, Vec<LowerError>> {
    use crate::sexpr::SyntaxKind as SK;

    let mut errors = Vec::new();
    let mut exprs = Vec::new();

    for child in root.children() {
        match SK::from(child.kind()) {
            SK::List => {
                if let Some(e) = lower_list(&child, &mut errors) {
                    exprs.push(e);
                }
            }
            SK::Atom => match lower_atom_expr(&child) {
                Some(e) => exprs.push(e),
                None => errors.push(LowerError {
                    offset: child.text_range().start().into(),
                    message: "unexpected atom at top level".into(),
                }),
            },
            SK::Error => {
                errors.push(LowerError {
                    offset: child.text_range().start().into(),
                    message: "syntax error".into(),
                });
            }
            _ => {} // trivia
        }
    }

    if !errors.is_empty() {
        return Err(errors);
    }

    match exprs.len() {
        0 => Ok(Expr::BoolLit(true)), // empty filter matches everything
        1 => Ok(exprs.into_iter().next().unwrap()),
        _ => Ok(Expr::And(exprs)), // multiple top-level = implicit and
    }
}

fn lower_list(
    node: &crate::sexpr::SyntaxNode,
    errors: &mut Vec<LowerError>,
) -> Option<Expr> {
    let children: Vec<_> = node.children().collect();
    if children.is_empty() {
        return Some(Expr::BoolLit(true));
    }

    let head = &children[0];
    let form_name = extract_symbol(head)?;
    let args: Vec<_> = children[1..].to_vec();
    let offset: usize = node.text_range().start().into();

    match form_name.as_str() {
        "and" => {
            let sub: Vec<Expr> = args
                .iter()
                .filter_map(|a| lower_child(a, errors))
                .collect();
            Some(Expr::And(sub))
        }
        "or" => {
            let sub: Vec<Expr> = args
                .iter()
                .filter_map(|a| lower_child(a, errors))
                .collect();
            Some(Expr::Or(sub))
        }
        "not" => {
            if args.len() != 1 {
                errors.push(LowerError {
                    offset,
                    message: "'not' requires exactly 1 argument".into(),
                });
                return None;
            }
            lower_child(&args[0], errors).map(|e| Expr::Not(Box::new(e)))
        }
        "implies" => {
            if args.len() != 2 {
                errors.push(LowerError {
                    offset,
                    message: "'implies' requires exactly 2 arguments".into(),
                });
                return None;
            }
            let a = lower_child(&args[0], errors)?;
            let b = lower_child(&args[1], errors)?;
            Some(Expr::Implies(Box::new(a), Box::new(b)))
        }
        "excludes" => {
            if args.len() != 2 {
                errors.push(LowerError {
                    offset,
                    message: "'excludes' requires exactly 2 arguments".into(),
                });
                return None;
            }
            let a = lower_child(&args[0], errors)?;
            let b = lower_child(&args[1], errors)?;
            Some(Expr::Excludes(Box::new(a), Box::new(b)))
        }

        "=" | "!=" | ">" | "<" | ">=" | "<=" => {
            if args.len() != 2 {
                errors.push(LowerError {
                    offset,
                    message: format!("'{form_name}' requires exactly 2 arguments"),
                });
                return None;
            }
            let acc = extract_accessor(&args[0])?;
            let val = extract_value(&args[1])?;
            Some(match form_name.as_str() {
                "=" => Expr::Eq(acc, val),
                "!=" => Expr::Ne(acc, val),
                ">" => Expr::Gt(acc, val),
                "<" => Expr::Lt(acc, val),
                ">=" => Expr::Ge(acc, val),
                "<=" => Expr::Le(acc, val),
                _ => unreachable!(),
            })
        }

        "in" => {
            if args.len() != 2 {
                errors.push(LowerError {
                    offset,
                    message: "'in' requires exactly 2 arguments".into(),
                });
                return None;
            }
            let val = extract_value(&args[0])?;
            let acc = extract_accessor(&args[1])?;
            Some(Expr::In(val, acc))
        }
        "has-tag" => {
            if args.len() != 1 {
                errors.push(LowerError {
                    offset,
                    message: "'has-tag' requires exactly 1 argument".into(),
                });
                return None;
            }
            let val = extract_value(&args[0])?;
            Some(Expr::HasTag(val))
        }
        "has-field" => {
            if args.len() != 1 {
                errors.push(LowerError {
                    offset,
                    message: "'has-field' requires exactly 1 argument".into(),
                });
                return None;
            }
            let val = extract_value(&args[0])?;
            Some(Expr::HasField(val))
        }
        "matches" => {
            if args.len() != 2 {
                errors.push(LowerError {
                    offset,
                    message: "'matches' requires exactly 2 arguments".into(),
                });
                return None;
            }
            let acc = extract_accessor(&args[0])?;
            let val = extract_value(&args[1])?;
            Some(Expr::Matches(acc, val))
        }
        "contains" => {
            if args.len() != 2 {
                errors.push(LowerError {
                    offset,
                    message: "'contains' requires exactly 2 arguments".into(),
                });
                return None;
            }
            let acc = extract_accessor(&args[0])?;
            let val = extract_value(&args[1])?;
            Some(Expr::Contains(acc, val))
        }

        "linked-by" => {
            if args.is_empty() || args.len() > 2 {
                errors.push(LowerError {
                    offset,
                    message: "'linked-by' requires 1-2 arguments".into(),
                });
                return None;
            }
            let lt = extract_value(&args[0])?;
            let tgt = if args.len() == 2 {
                extract_value(&args[1])?
            } else {
                Value::Wildcard
            };
            Some(Expr::LinkedBy(lt, tgt))
        }
        "linked-from" => {
            if args.is_empty() || args.len() > 2 {
                errors.push(LowerError {
                    offset,
                    message: "'linked-from' requires 1-2 arguments".into(),
                });
                return None;
            }
            let lt = extract_value(&args[0])?;
            let src = if args.len() == 2 {
                extract_value(&args[1])?
            } else {
                Value::Wildcard
            };
            Some(Expr::LinkedFrom(lt, src))
        }
        "linked-to" => {
            if args.len() != 1 {
                errors.push(LowerError {
                    offset,
                    message: "'linked-to' requires exactly 1 argument".into(),
                });
                return None;
            }
            let val = extract_value(&args[0])?;
            Some(Expr::LinkedTo(val))
        }
        "links-count" => {
            if args.len() != 3 {
                errors.push(LowerError {
                    offset,
                    message: "'links-count' requires exactly 3 arguments (type op value)".into(),
                });
                return None;
            }
            let lt = extract_value(&args[0])?;
            let op_str = extract_symbol(&args[1]).unwrap_or_default();
            let op = match op_str.as_str() {
                ">" => CompOp::Gt,
                "<" => CompOp::Lt,
                ">=" => CompOp::Ge,
                "<=" => CompOp::Le,
                "=" => CompOp::Eq,
                "!=" => CompOp::Ne,
                _ => {
                    errors.push(LowerError {
                        offset,
                        message: format!("invalid operator '{op_str}' in links-count"),
                    });
                    return None;
                }
            };
            let val = extract_value(&args[2])?;
            Some(Expr::LinksCount(lt, op, val))
        }

        unknown => {
            errors.push(LowerError {
                offset,
                message: format!("unknown form '{unknown}'"),
            });
            None
        }
    }
}

fn lower_child(
    node: &crate::sexpr::SyntaxNode,
    errors: &mut Vec<LowerError>,
) -> Option<Expr> {
    use crate::sexpr::SyntaxKind as SK;

    match SK::from(node.kind()) {
        SK::List => lower_list(node, errors),
        SK::Atom => lower_atom_expr(node).or_else(|| {
            errors.push(LowerError {
                offset: node.text_range().start().into(),
                message: format!(
                    "bare symbol '{}' in expression position; did you mean a list?",
                    node.text()
                ),
            });
            None
        }),
        _ => None,
    }
}

fn lower_atom_expr(node: &crate::sexpr::SyntaxNode) -> Option<Expr> {
    use crate::sexpr::SyntaxKind as SK;

    let token = node.first_token()?;
    match SK::from(token.kind()) {
        SK::BoolTrue => Some(Expr::BoolLit(true)),
        SK::BoolFalse => Some(Expr::BoolLit(false)),
        _ => None,
    }
}

fn extract_symbol(node: &crate::sexpr::SyntaxNode) -> Option<String> {
    use crate::sexpr::SyntaxKind as SK;

    if SK::from(node.kind()) == SK::Atom {
        let token = node.first_token()?;
        let kind = SK::from(token.kind());
        if kind == SK::Symbol {
            return Some(token.text().to_string());
        }
    }
    None
}

fn extract_accessor(node: &crate::sexpr::SyntaxNode) -> Option<Accessor> {
    let name = extract_symbol(node)?;
    Some(Accessor::Field(name))
}

fn extract_value(node: &crate::sexpr::SyntaxNode) -> Option<Value> {
    use crate::sexpr::SyntaxKind as SK;

    if SK::from(node.kind()) != SK::Atom {
        return None;
    }
    let token = node.first_token()?;
    let kind = SK::from(token.kind());
    let text = token.text();

    match kind {
        SK::StringLit => {
            let inner = &text[1..text.len() - 1];
            let unescaped = inner.replace("\\\"", "\"").replace("\\\\", "\\");
            Some(Value::Str(unescaped))
        }
        SK::IntLit => text.parse::<i64>().ok().map(Value::Int),
        SK::FloatLit => text.parse::<f64>().ok().map(Value::Float),
        SK::BoolTrue => Some(Value::Bool(true)),
        SK::BoolFalse => Some(Value::Bool(false)),
        SK::Wildcard => Some(Value::Wildcard),
        SK::Symbol => Some(Value::Str(text.to_string())),
        _ => None,
    }
}

// ── Tests ───────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;
    use crate::links::LinkGraph;
    use crate::model::{Artifact, Link};
    use std::collections::BTreeMap;
    use std::path::PathBuf;

    fn test_artifact() -> Artifact {
        Artifact {
            id: "REQ-001".into(),
            artifact_type: "requirement".into(),
            title: "Test requirement".into(),
            description: Some("A test requirement for STPA".into()),
            status: Some("approved".into()),
            tags: vec!["stpa".into(), "safety".into(), "eu".into()],
            links: vec![
                Link { link_type: "satisfies".into(), target: "SC-1".into() },
                Link { link_type: "satisfies".into(), target: "SC-3".into() },
                Link { link_type: "implements".into(), target: "DD-001".into() },
            ],
            fields: {
                let mut m = BTreeMap::new();
                m.insert("priority".into(), serde_yaml::Value::String("must".into()));
                m.insert("category".into(), serde_yaml::Value::String("functional".into()));
                m.insert("baseline".into(), serde_yaml::Value::String("v0.1.0".into()));
                m
            },
            provenance: None,
            source_file: Some(PathBuf::from("artifacts/requirements.yaml")),
        }
    }

    fn empty_graph() -> LinkGraph {
        use crate::schema::Schema;
        use crate::store::Store;
        let store = Store::default();
        let schema = Schema::merge(&[]);
        LinkGraph::build(&store, &schema)
    }

    fn run(expr: &Expr, artifact: &Artifact) -> bool {
        let graph = empty_graph();
        let ctx = EvalContext { artifact, graph: &graph };
        check(expr, &ctx)
    }

    #[test]
    fn filter_type_eq() {
        let expr = parse_filter(r#"(= type "requirement")"#).unwrap();
        assert!(run(&expr, &test_artifact()));
    }

    #[test]
    fn filter_type_ne() {
        let expr = parse_filter(r#"(= type "feature")"#).unwrap();
        assert!(!run(&expr, &test_artifact()));
    }

    #[test]
    fn filter_status() {
        let expr = parse_filter(r#"(= status "approved")"#).unwrap();
        assert!(run(&expr, &test_artifact()));
    }

    #[test]
    fn filter_has_tag() {
        let expr = parse_filter(r#"(has-tag "stpa")"#).unwrap();
        assert!(run(&expr, &test_artifact()));
        let expr = parse_filter(r#"(has-tag "automotive")"#).unwrap();
        assert!(!run(&expr, &test_artifact()));
    }

    #[test]
    fn filter_and() {
        let expr = parse_filter(r#"(and (= type "requirement") (has-tag "eu"))"#).unwrap();
        assert!(run(&expr, &test_artifact()));
        let expr = parse_filter(r#"(and (= type "requirement") (has-tag "missing"))"#).unwrap();
        assert!(!run(&expr, &test_artifact()));
    }

    #[test]
    fn filter_or() {
        let expr = parse_filter(r#"(or (= type "feature") (has-tag "stpa"))"#).unwrap();
        assert!(run(&expr, &test_artifact()));
    }

    #[test]
    fn filter_not() {
        let expr = parse_filter(r#"(not (= type "feature"))"#).unwrap();
        assert!(run(&expr, &test_artifact()));
    }

    #[test]
    fn filter_implies() {
        let expr = parse_filter(r#"(implies (= type "requirement") (has-tag "stpa"))"#).unwrap();
        assert!(run(&expr, &test_artifact()));
    }

    #[test]
    fn filter_has_field() {
        let expr = parse_filter(r#"(has-field "priority")"#).unwrap();
        assert!(run(&expr, &test_artifact()));
        let expr = parse_filter(r#"(has-field "nonexistent")"#).unwrap();
        assert!(!run(&expr, &test_artifact()));
    }

    #[test]
    fn filter_in() {
        let expr = parse_filter(r#"(in "safety" tags)"#).unwrap();
        assert!(run(&expr, &test_artifact()));
    }

    #[test]
    fn filter_contains() {
        let expr = parse_filter(r#"(contains title "requirement")"#).unwrap();
        assert!(run(&expr, &test_artifact()));
    }

    #[test]
    fn filter_matches_regex() {
        let expr = parse_filter(r#"(matches id "^REQ-\\d+")"#).unwrap();
        assert!(run(&expr, &test_artifact()));
    }

    #[test]
    fn filter_linked_by() {
        let expr = parse_filter(r#"(linked-by "satisfies" _)"#).unwrap();
        assert!(run(&expr, &test_artifact()));
        let expr = parse_filter(r#"(linked-by "verifies" _)"#).unwrap();
        assert!(!run(&expr, &test_artifact()));
    }

    #[test]
    fn filter_linked_to() {
        let expr = parse_filter(r#"(linked-to "SC-1")"#).unwrap();
        assert!(run(&expr, &test_artifact()));
    }

    #[test]
    fn filter_links_count() {
        let expr = parse_filter(r#"(links-count "satisfies" > 1)"#).unwrap();
        assert!(run(&expr, &test_artifact()));
        let expr = parse_filter(r#"(links-count "satisfies" = 2)"#).unwrap();
        assert!(run(&expr, &test_artifact()));
        let expr = parse_filter(r#"(links-count "satisfies" > 5)"#).unwrap();
        assert!(!run(&expr, &test_artifact()));
    }

    #[test]
    fn filter_field_access() {
        let expr = parse_filter(r#"(= priority "must")"#).unwrap();
        assert!(run(&expr, &test_artifact()));
    }

    #[test]
    fn filter_nested() {
        let expr = parse_filter(
            r#"(and (= type "requirement") (or (has-tag "stpa") (has-tag "automotive")) (not (= status "draft")))"#,
        )
        .unwrap();
        assert!(run(&expr, &test_artifact()));
    }

    #[test]
    fn empty_filter_matches_all() {
        let expr = parse_filter("").unwrap();
        assert!(run(&expr, &test_artifact()));
    }

    #[test]
    fn parse_error_reported() {
        let result = parse_filter("(and a");
        assert!(result.is_err());
    }

    // ── Logical equivalence unit tests ──────────────────────────────

    #[test]
    fn de_morgan_and() {
        let a = test_artifact();
        let p = Expr::HasTag(Value::Str("stpa".into()));
        let q = Expr::HasTag(Value::Str("eu".into()));
        let lhs = Expr::Not(Box::new(Expr::And(vec![p.clone(), q.clone()])));
        let rhs = Expr::Or(vec![Expr::Not(Box::new(p)), Expr::Not(Box::new(q))]);
        assert_eq!(run(&lhs, &a), run(&rhs, &a));
    }

    #[test]
    fn de_morgan_or() {
        let a = test_artifact();
        let p = Expr::HasTag(Value::Str("stpa".into()));
        let q = Expr::HasTag(Value::Str("missing".into()));
        let lhs = Expr::Not(Box::new(Expr::Or(vec![p.clone(), q.clone()])));
        let rhs = Expr::And(vec![Expr::Not(Box::new(p)), Expr::Not(Box::new(q))]);
        assert_eq!(run(&lhs, &a), run(&rhs, &a));
    }

    #[test]
    fn double_negation() {
        let a = test_artifact();
        let p = Expr::HasTag(Value::Str("stpa".into()));
        let double_neg = Expr::Not(Box::new(Expr::Not(Box::new(p.clone()))));
        assert_eq!(run(&double_neg, &a), run(&p, &a));
    }

    #[test]
    fn implies_equivalence() {
        let a = test_artifact();
        let p = Expr::Eq(Accessor::Field("type".into()), Value::Str("requirement".into()));
        let q = Expr::HasTag(Value::Str("stpa".into()));
        let lhs = Expr::Implies(Box::new(p.clone()), Box::new(q.clone()));
        let rhs = Expr::Or(vec![Expr::Not(Box::new(p)), q]);
        assert_eq!(run(&lhs, &a), run(&rhs, &a));
    }

    #[test]
    fn excludes_equivalence() {
        let a = test_artifact();
        let p = Expr::HasTag(Value::Str("stpa".into()));
        let q = Expr::HasTag(Value::Str("missing".into()));
        let lhs = Expr::Excludes(Box::new(p.clone()), Box::new(q.clone()));
        let rhs = Expr::Not(Box::new(Expr::And(vec![p, q])));
        assert_eq!(run(&lhs, &a), run(&rhs, &a));
    }
}
