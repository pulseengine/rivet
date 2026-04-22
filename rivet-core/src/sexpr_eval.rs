//! S-expression evaluator for artifact filtering and constraints.
//!
//! Two-layer design:
//!   1. Typed AST (`Expr`) — pure data, no rowan dependency.
//!   2. Lowering from rowan CST (`sexpr::SyntaxNode`) → `Expr`.
//!
//! The evaluator operates on a single artifact + link graph context,
//! returning a boolean for predicate evaluation.

// SAFETY-REVIEW (SCRC Phase 1, DD-058): File-scope blanket allow for
// the v0.4.3 clippy restriction-lint escalation. These lints are
// enabled at workspace scope at `warn` so new violations surface in
// CI; the existing call sites here are grandfathered in via this
// file-level allow until Phase 2 (per-site #[allow(...)] + rewrite).
// Rationale per lint class:
//   * unwrap_used / expect_used: legacy sites — many are on parser
//     post-conditions, BTreeMap lookups by key just inserted, or
//     regex::new on literals. Safe to keep; will migrate to ? with
//     typed errors in Phase 2 where user-facing.
//   * indexing_slicing / arithmetic_side_effects: tight math in
//     CST offsets, layout coordinates, and counted-loop indices that
//     is reviewed but not rewritten to checked_* for readability.
//   * as_conversions / cast_possible_truncation / cast_sign_loss:
//     usize<->u32/u64 in offsets where the value range is bounded by
//     input size (bytes of a loaded YAML file).
//   * wildcard_enum_match_arm / match_wildcard_for_single_variants:
//     tolerant parsers intentionally catch-all on token kinds.
//   * panic: only reached on programmer-error invariants.
//   * print_stdout / print_stderr: rivet-cli binary I/O.
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

use crate::links::LinkGraph;
use crate::model::Artifact;
use crate::store::Store;

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

    // ── Quantifiers (require Store access) ────────────────────────
    /// `(forall <scope> <predicate>)` — all artifacts in scope satisfy predicate.
    /// Scope is a filter expression; predicate is checked per matching artifact.
    Forall(Box<Expr>, Box<Expr>),
    /// `(exists <scope> <predicate>)` — at least one artifact in scope satisfies predicate.
    Exists(Box<Expr>, Box<Expr>),
    /// `(count <scope>)` — number of artifacts matching scope (compared via parent).
    Count(Box<Expr>),

    // ── Graph traversal ─────────────────────────────────────────────
    /// `(reachable-from "REQ-001" "satisfies")` — true if current artifact is
    /// reachable from the given start via the given link type.
    ReachableFrom(Value, Value),
    /// `(reachable-to "TEST-090" "verifies")` — true if the given target is
    /// reachable from the current artifact via the given link type.
    ReachableTo(Value, Value),

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
///
/// For quantifier expressions (forall, exists, count), the `store` field
/// must be set. Single-artifact predicates work without it.
pub struct EvalContext<'a> {
    pub artifact: &'a Artifact,
    pub graph: &'a LinkGraph,
    /// Required for quantifier expressions. None = quantifiers return false.
    pub store: Option<&'a Store>,
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
            resolve_list(acc, ctx.artifact).contains(&needle)
        }
        Expr::HasTag(val) => {
            let tag = value_to_str(val);
            ctx.artifact.tags.contains(&tag)
        }
        Expr::HasField(val) => {
            let name = value_to_str(val);
            resolve_field_exists(&name, ctx.artifact)
        }
        Expr::Matches(acc, val) => {
            let text = resolve_str(acc, ctx.artifact);
            let pattern = value_to_str(val);
            // REQ-048: bound regex size to prevent ReDoS.
            regex::RegexBuilder::new(&pattern)
                .size_limit(1 << 20) // 1MB compiled size limit
                .build()
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
            let count = ctx
                .artifact
                .links
                .iter()
                .filter(|l| l.link_type == lt)
                .count() as i64;
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

        // Quantifiers
        Expr::Forall(scope, predicate) => {
            let Some(store) = ctx.store else {
                return false;
            };
            store.iter().all(|a| {
                let scope_ctx = EvalContext {
                    artifact: a,
                    graph: ctx.graph,
                    store: ctx.store,
                };
                // If artifact doesn't match scope, it's vacuously true
                if !check(scope, &scope_ctx) {
                    return true;
                }
                check(predicate, &scope_ctx)
            })
        }
        Expr::Exists(scope, predicate) => {
            let Some(store) = ctx.store else {
                return false;
            };
            store.iter().any(|a| {
                let scope_ctx = EvalContext {
                    artifact: a,
                    graph: ctx.graph,
                    store: ctx.store,
                };
                check(scope, &scope_ctx) && check(predicate, &scope_ctx)
            })
        }
        Expr::Count(_scope) => {
            // Count is not a boolean predicate on its own — it's used
            // inside comparison expressions. Return true if count > 0.
            let Some(store) = ctx.store else {
                return false;
            };
            store.iter().any(|a| {
                let scope_ctx = EvalContext {
                    artifact: a,
                    graph: ctx.graph,
                    store: ctx.store,
                };
                check(_scope, &scope_ctx)
            })
        }

        // Graph traversal
        Expr::ReachableFrom(start_id, link_type) => {
            let start = value_to_str(start_id);
            let lt = value_to_str(link_type);
            let reachable = ctx.graph.reachable(&start, &lt);
            reachable.contains(&ctx.artifact.id)
        }
        Expr::ReachableTo(target_id, link_type) => {
            let target = value_to_str(target_id);
            let lt = value_to_str(link_type);
            let reachable = ctx.graph.reachable(&ctx.artifact.id, &lt);
            reachable.contains(&target)
        }

        Expr::BoolLit(b) => *b,
    }
}

// ── Field resolution ────────────────────────────────────────────────────

/// Resolve a field accessor to a string value for s-expression comparisons.
///
/// Missing fields intentionally resolve to the empty string so filters like
/// `(= asil "ASIL-D")` naturally exclude artifacts without an `asil` field
/// rather than erroring out. This is filter semantics, not silent-accept:
/// the caller wants "show artifacts whose asil = ASIL-D", and an artifact
/// without `asil` correctly does NOT match. Reject-on-missing would make
/// every cross-type query unusable.
///
/// Typos in field names should be caught by the schema layer
/// (`deny_unknown_fields`) at YAML load time, not by the query evaluator.
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
///
/// `note` carries an optional human-readable hint separate from the raw
/// parser `message`. When the input is detected to look like infix syntax
/// (`A and B`) or is missing outer parentheses, the hint points the user
/// at the expected s-expression form. Consumers that want just the short
/// parser detail can read `message` directly; the `Display` impl renders
/// both.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct FilterError {
    pub offset: usize,
    pub message: String,
    /// Optional semantic note added by `parse_filter` on top of the
    /// positional parser message.
    pub note: Option<String>,
}

impl std::fmt::Display for FilterError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "offset {}: {}", self.offset, self.message)?;
        if let Some(ref n) = self.note {
            write!(f, "\n  note: {n}")?;
        }
        Ok(())
    }
}

/// Classify a parse failure and produce a human-readable note.
///
/// Detects the three most common user-error shapes:
///   - bare infix: `A and B`, `A && B`
///   - missing outer parens: e.g. `and A B`
///   - unknown head symbol: `(bogus A B)`
///
/// and nudges the user at the expected `(head A B …)` form.
fn classify_filter_error(source: &str, message: &str) -> Option<String> {
    let trimmed = source.trim_start();

    const HEADS: &[&str] = &[
        "and", "or", "not", "implies", "excludes", "=", "!=", ">", "<", ">=", "<=",
        "has-tag", "has-field", "in", "matches", "contains", "linked-by", "linked-from",
        "linked-to", "links-count", "reachable-from", "reachable-to", "forall", "exists",
        "count",
    ];
    const INFIX: &[&str] = &[
        "and", "or", "not", "==", "!=", "&&", "||", ">", "<", ">=", "<=", "implies",
    ];

    if !trimmed.starts_with('(') {
        let tokens_lc: Vec<String> = trimmed
            .split_whitespace()
            .map(|s| s.to_ascii_lowercase())
            .collect();

        // Case 1: first token is a known head symbol → missing outer
        // parens (e.g. `and A B`). Prefer this over the infix note
        // because the fix is a single wrap rather than a restructure.
        if let Some(first) = tokens_lc.first() {
            if HEADS.contains(&first.as_str()) {
                return Some(format!(
                    "looks like missing outer parens; wrap the expression: ({trimmed})"
                ));
            }
        }

        // Case 2: source does not start with '(' and the OPERATOR sits
        // between two operands — that's infix.
        let has_infix = tokens_lc.len() >= 3
            && tokens_lc
                .get(1)
                .is_some_and(|t| INFIX.contains(&t.as_str()));
        if has_infix {
            let suggestion = if tokens_lc.len() == 3 {
                format!(
                    "({} {} {})",
                    tokens_lc[1].replace("&&", "and").replace("||", "or"),
                    tokens_lc[0],
                    tokens_lc[2]
                )
            } else {
                "(and A B)".to_string()
            };
            return Some(format!(
                "expected s-expression form like {suggestion}; got infix syntax"
            ));
        }
    }

    // Case 3: unknown function / head symbol. The lowerer emits a
    // message that typically mentions "unknown form" or "unexpected".
    if message.contains("unknown") || message.contains("unexpected form") {
        return Some(
            "unknown head symbol; see docs/getting-started.md for the supported forms \
             (and/or/not/implies/excludes/=/!=/>/</has-tag/has-field/in/matches/contains/linked-*)"
                .to_string(),
        );
    }

    None
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
                note: classify_filter_error(source, &e.message),
                offset: e.offset,
                message: e.message,
            })
            .collect());
    }

    let root = sexpr::SyntaxNode::new_root(green);
    lower(&root).map_err(|errs| {
        errs.into_iter()
            .map(|e| FilterError {
                note: classify_filter_error(source, &e.message),
                offset: e.offset,
                message: e.message,
            })
            .collect()
    })
}

/// Convenience: parse a filter and check it against one artifact.
pub fn matches_filter(expr: &Expr, artifact: &Artifact, graph: &LinkGraph) -> bool {
    let ctx = EvalContext {
        artifact,
        graph,
        store: None,
    };
    check(expr, &ctx)
}

/// Check a filter with full store access (needed for quantifiers).
pub fn matches_filter_with_store(
    expr: &Expr,
    artifact: &Artifact,
    graph: &LinkGraph,
    store: &Store,
) -> bool {
    let ctx = EvalContext {
        artifact,
        graph,
        store: Some(store),
    };
    check(expr, &ctx)
}

/// Lower a rowan s-expression CST root into a typed `Expr`.
pub fn lower(root: &crate::sexpr::SyntaxNode) -> Result<Expr, Vec<LowerError>> {
    use crate::sexpr::SyntaxKind as SK;

    let mut errors = Vec::new();
    let mut exprs = Vec::new();

    for child in root.children() {
        match child.kind() {
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

fn lower_list(node: &crate::sexpr::SyntaxNode, errors: &mut Vec<LowerError>) -> Option<Expr> {
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
            let sub: Vec<Expr> = args.iter().filter_map(|a| lower_child(a, errors)).collect();
            Some(Expr::And(sub))
        }
        "or" => {
            let sub: Vec<Expr> = args.iter().filter_map(|a| lower_child(a, errors)).collect();
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
            // Reject empty/whitespace operators with a clear message instead
            // of falling through the `_` arm with an "invalid operator ''"
            // string that confuses users who supplied a non-symbol literal.
            let Some(op_str) = extract_symbol(&args[1]) else {
                errors.push(LowerError {
                    offset,
                    message: "'links-count' second argument must be one of \
                              the comparison operators >, <, >=, <=, =, != \
                              (got a non-symbol literal)"
                        .into(),
                });
                return None;
            };
            if op_str.trim().is_empty() {
                errors.push(LowerError {
                    offset,
                    message: "'links-count' second argument is empty — \
                              expected one of >, <, >=, <=, =, !="
                        .into(),
                });
                return None;
            }
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
                        message: format!(
                            "'links-count' invalid operator '{op_str}' — \
                             expected one of >, <, >=, <=, =, !="
                        ),
                    });
                    return None;
                }
            };
            let val = extract_value(&args[2])?;
            Some(Expr::LinksCount(lt, op, val))
        }

        // Quantifiers
        "forall" => {
            if args.len() != 2 {
                errors.push(LowerError {
                    offset,
                    message: "'forall' requires exactly 2 arguments (scope predicate)".into(),
                });
                return None;
            }
            let scope = lower_child(&args[0], errors)?;
            let pred = lower_child(&args[1], errors)?;
            Some(Expr::Forall(Box::new(scope), Box::new(pred)))
        }
        "exists" => {
            if args.len() != 2 {
                errors.push(LowerError {
                    offset,
                    message: "'exists' requires exactly 2 arguments (scope predicate)".into(),
                });
                return None;
            }
            let scope = lower_child(&args[0], errors)?;
            let pred = lower_child(&args[1], errors)?;
            Some(Expr::Exists(Box::new(scope), Box::new(pred)))
        }
        "count" => {
            if args.len() != 1 {
                errors.push(LowerError {
                    offset,
                    message: "'count' requires exactly 1 argument (scope)".into(),
                });
                return None;
            }
            let scope = lower_child(&args[0], errors)?;
            Some(Expr::Count(Box::new(scope)))
        }

        // Graph traversal
        "reachable-from" => {
            if args.len() != 2 {
                errors.push(LowerError {
                    offset,
                    message: "'reachable-from' requires exactly 2 arguments (start-id link-type)"
                        .into(),
                });
                return None;
            }
            let start = extract_value(&args[0])?;
            let lt = extract_value(&args[1])?;
            Some(Expr::ReachableFrom(start, lt))
        }
        "reachable-to" => {
            if args.len() != 2 {
                errors.push(LowerError {
                    offset,
                    message: "'reachable-to' requires exactly 2 arguments (target-id link-type)"
                        .into(),
                });
                return None;
            }
            let target = extract_value(&args[0])?;
            let lt = extract_value(&args[1])?;
            Some(Expr::ReachableTo(target, lt))
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

fn lower_child(node: &crate::sexpr::SyntaxNode, errors: &mut Vec<LowerError>) -> Option<Expr> {
    use crate::sexpr::SyntaxKind as SK;

    match node.kind() {
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
    match token.kind() {
        SK::BoolTrue => Some(Expr::BoolLit(true)),
        SK::BoolFalse => Some(Expr::BoolLit(false)),
        _ => None,
    }
}

fn extract_symbol(node: &crate::sexpr::SyntaxNode) -> Option<String> {
    use crate::sexpr::SyntaxKind as SK;

    if node.kind() == SK::Atom {
        let token = node.first_token()?;
        let kind = token.kind();
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

    if node.kind() != SK::Atom {
        return None;
    }
    let token = node.first_token()?;
    let kind = token.kind();
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
    use crate::schema::Schema;
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
            fields: {
                let mut m = BTreeMap::new();
                m.insert("priority".into(), serde_yaml::Value::String("must".into()));
                m.insert(
                    "category".into(),
                    serde_yaml::Value::String("functional".into()),
                );
                m.insert(
                    "baseline".into(),
                    serde_yaml::Value::String("v0.1.0".into()),
                );
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
        let ctx = EvalContext {
            artifact,
            graph: &graph,
            store: None,
        };
        check(expr, &ctx)
    }

    // Tests below call parse_filter() which builds multi-node rowan trees.
    // Rowan has a known tree-borrows deallocation UB under Miri with large
    // trees (pulseengine/rowan#211). Skip under Miri; the pure evaluator
    // logic is tested by the de_morgan/implies/excludes tests below which
    // construct Expr directly without rowan.

    #[test]
    #[cfg_attr(miri, ignore)]
    fn filter_type_eq() {
        let expr = parse_filter(r#"(= type "requirement")"#).unwrap();
        assert!(run(&expr, &test_artifact()));
    }

    #[test]
    #[cfg_attr(miri, ignore)]
    fn filter_type_ne() {
        let expr = parse_filter(r#"(= type "feature")"#).unwrap();
        assert!(!run(&expr, &test_artifact()));
    }

    #[test]
    #[cfg_attr(miri, ignore)]
    fn filter_status() {
        let expr = parse_filter(r#"(= status "approved")"#).unwrap();
        assert!(run(&expr, &test_artifact()));
    }

    #[test]
    #[cfg_attr(miri, ignore)]
    fn filter_has_tag() {
        let expr = parse_filter(r#"(has-tag "stpa")"#).unwrap();
        assert!(run(&expr, &test_artifact()));
        let expr = parse_filter(r#"(has-tag "automotive")"#).unwrap();
        assert!(!run(&expr, &test_artifact()));
    }

    #[test]
    #[cfg_attr(miri, ignore)]
    fn filter_and() {
        let expr = parse_filter(r#"(and (= type "requirement") (has-tag "eu"))"#).unwrap();
        assert!(run(&expr, &test_artifact()));
        let expr = parse_filter(r#"(and (= type "requirement") (has-tag "missing"))"#).unwrap();
        assert!(!run(&expr, &test_artifact()));
    }

    #[test]
    #[cfg_attr(miri, ignore)]
    fn filter_or() {
        let expr = parse_filter(r#"(or (= type "feature") (has-tag "stpa"))"#).unwrap();
        assert!(run(&expr, &test_artifact()));
    }

    #[test]
    #[cfg_attr(miri, ignore)]
    fn filter_not() {
        let expr = parse_filter(r#"(not (= type "feature"))"#).unwrap();
        assert!(run(&expr, &test_artifact()));
    }

    #[test]
    #[cfg_attr(miri, ignore)]
    fn filter_implies() {
        let expr = parse_filter(r#"(implies (= type "requirement") (has-tag "stpa"))"#).unwrap();
        assert!(run(&expr, &test_artifact()));
    }

    #[test]
    #[cfg_attr(miri, ignore)]
    fn filter_has_field() {
        let expr = parse_filter(r#"(has-field "priority")"#).unwrap();
        assert!(run(&expr, &test_artifact()));
        let expr = parse_filter(r#"(has-field "nonexistent")"#).unwrap();
        assert!(!run(&expr, &test_artifact()));
    }

    #[test]
    #[cfg_attr(miri, ignore)]
    fn filter_in() {
        let expr = parse_filter(r#"(in "safety" tags)"#).unwrap();
        assert!(run(&expr, &test_artifact()));
    }

    #[test]
    #[cfg_attr(miri, ignore)]
    fn filter_contains() {
        let expr = parse_filter(r#"(contains title "requirement")"#).unwrap();
        assert!(run(&expr, &test_artifact()));
    }

    #[test]
    #[cfg_attr(miri, ignore)] // regex crate uses SIMD/FFI incompatible with Miri
    fn filter_matches_regex() {
        let expr = parse_filter(r#"(matches id "^REQ-\\d+")"#).unwrap();
        assert!(run(&expr, &test_artifact()));
    }

    #[test]
    #[cfg_attr(miri, ignore)]
    fn filter_linked_by() {
        let expr = parse_filter(r#"(linked-by "satisfies" _)"#).unwrap();
        assert!(run(&expr, &test_artifact()));
        let expr = parse_filter(r#"(linked-by "verifies" _)"#).unwrap();
        assert!(!run(&expr, &test_artifact()));
    }

    #[test]
    #[cfg_attr(miri, ignore)]
    fn filter_linked_to() {
        let expr = parse_filter(r#"(linked-to "SC-1")"#).unwrap();
        assert!(run(&expr, &test_artifact()));
    }

    #[test]
    #[cfg_attr(miri, ignore)]
    fn filter_links_count() {
        let expr = parse_filter(r#"(links-count "satisfies" > 1)"#).unwrap();
        assert!(run(&expr, &test_artifact()));
        let expr = parse_filter(r#"(links-count "satisfies" = 2)"#).unwrap();
        assert!(run(&expr, &test_artifact()));
        let expr = parse_filter(r#"(links-count "satisfies" > 5)"#).unwrap();
        assert!(!run(&expr, &test_artifact()));
    }

    #[test]
    #[cfg_attr(miri, ignore)]
    fn filter_field_access() {
        let expr = parse_filter(r#"(= priority "must")"#).unwrap();
        assert!(run(&expr, &test_artifact()));
    }

    #[test]
    #[cfg_attr(miri, ignore)]
    fn filter_nested() {
        let expr = parse_filter(
            r#"(and (= type "requirement") (or (has-tag "stpa") (has-tag "automotive")) (not (= status "draft")))"#,
        )
        .unwrap();
        assert!(run(&expr, &test_artifact()));
    }

    #[test]
    #[cfg_attr(miri, ignore)]
    fn empty_filter_matches_all() {
        let expr = parse_filter("").unwrap();
        assert!(run(&expr, &test_artifact()));
    }

    #[test]
    #[cfg_attr(miri, ignore)]
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
        let p = Expr::Eq(
            Accessor::Field("type".into()),
            Value::Str("requirement".into()),
        );
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

    // ── Quantifier scope correctness (REQ-053) ─────────────────────

    fn make_artifact(id: &str, art_type: &str, tags: &[&str]) -> Artifact {
        Artifact {
            id: id.into(),
            artifact_type: art_type.into(),
            title: format!("Title of {id}"),
            description: None,
            status: Some("approved".into()),
            tags: tags.iter().map(|t| t.to_string()).collect(),
            links: vec![],
            fields: BTreeMap::new(),
            provenance: None,
            source_file: None,
        }
    }

    fn store_with(artifacts: Vec<Artifact>) -> Store {
        let mut store = Store::default();
        for a in artifacts {
            store.upsert(a);
        }
        store
    }

    #[test]
    fn forall_uses_store_parameter() {
        let a = make_artifact("REQ-001", "requirement", &["safety"]);
        let b = make_artifact("REQ-002", "requirement", &["safety"]);
        let c = make_artifact("REQ-003", "requirement", &[]); // no safety tag

        // Store with all three: forall requirement has safety tag → false
        let store_all = store_with(vec![a.clone(), b.clone(), c.clone()]);
        let schema = Schema::merge(&[]);
        let graph = LinkGraph::build(&store_all, &schema);

        let expr = Expr::Forall(
            Box::new(Expr::Eq(
                Accessor::Field("type".into()),
                Value::Str("requirement".into()),
            )),
            Box::new(Expr::HasTag(Value::Str("safety".into()))),
        );

        // With full store (has REQ-003 without safety): forall is false
        let ctx_all = EvalContext {
            artifact: &a,
            graph: &graph,
            store: Some(&store_all),
        };
        assert!(!check(&expr, &ctx_all));

        // With scoped store (only REQ-001, REQ-002): forall is true
        let store_scoped = store_with(vec![a.clone(), b.clone()]);
        let graph_scoped = LinkGraph::build(&store_scoped, &schema);
        let ctx_scoped = EvalContext {
            artifact: &a,
            graph: &graph_scoped,
            store: Some(&store_scoped),
        };
        assert!(check(&expr, &ctx_scoped));
    }

    #[test]
    fn exists_uses_store_parameter() {
        let a = make_artifact("REQ-001", "requirement", &["safety"]);
        let b = make_artifact("FEAT-001", "feature", &[]);

        let expr = Expr::Exists(
            Box::new(Expr::Eq(
                Accessor::Field("type".into()),
                Value::Str("requirement".into()),
            )),
            Box::new(Expr::HasTag(Value::Str("safety".into()))),
        );

        let schema = Schema::merge(&[]);

        // Store with requirement: exists is true
        let store_with_req = store_with(vec![a.clone(), b.clone()]);
        let graph = LinkGraph::build(&store_with_req, &schema);
        let ctx = EvalContext {
            artifact: &b,
            graph: &graph,
            store: Some(&store_with_req),
        };
        assert!(check(&expr, &ctx));

        // Store without requirement: exists is false
        let store_no_req = store_with(vec![b.clone()]);
        let graph2 = LinkGraph::build(&store_no_req, &schema);
        let ctx2 = EvalContext {
            artifact: &b,
            graph: &graph2,
            store: Some(&store_no_req),
        };
        assert!(!check(&expr, &ctx2));
    }

    #[test]
    fn quantifier_without_store_returns_false() {
        let a = test_artifact();
        let graph = empty_graph();

        let expr = Expr::Forall(Box::new(Expr::BoolLit(true)), Box::new(Expr::BoolLit(true)));

        // No store → forall returns false (safe default)
        let ctx = EvalContext {
            artifact: &a,
            graph: &graph,
            store: None,
        };
        assert!(!check(&expr, &ctx));
    }

    // ── Error message quality (pain point #7) ───────────────────────

    /// Bare infix like `A and B` must surface a semantic note pointing
    /// at the expected `(and A B)` form — not just a positional parser
    /// offset.
    #[test]
    #[cfg_attr(miri, ignore)]
    fn parse_error_bare_infix_surfaces_note() {
        let result = parse_filter("A and B");
        let errs = result.expect_err("bare infix must fail");
        assert!(!errs.is_empty());
        let note = errs[0]
            .note
            .as_ref()
            .expect("expected a semantic note for infix input");
        assert!(
            note.contains("infix") || note.contains("s-expression"),
            "note should mention s-expression/infix. got: {note}"
        );
        assert!(
            note.contains("(and A B)") || note.contains("(and"),
            "note should suggest (and A B). got: {note}"
        );
        // Display renders both positional detail and the note.
        let rendered = format!("{}", errs[0]);
        assert!(rendered.contains("note:"), "Display should carry the note");
    }

    /// `and A B` — missing outer parens. The classifier should propose
    /// wrapping the expression.
    #[test]
    #[cfg_attr(miri, ignore)]
    fn parse_error_missing_outer_parens_surfaces_note() {
        let result = parse_filter("and A B");
        let errs = result.expect_err("missing parens must fail");
        let note = errs[0]
            .note
            .as_ref()
            .expect("expected a semantic note for missing outer parens");
        assert!(
            note.contains("missing outer parens") && note.contains("(and A B)"),
            "note should suggest wrapping in parens. got: {note}"
        );
    }

    /// `(bogus A B)` — unknown head symbol. Note should reference the
    /// supported forms.
    #[test]
    #[cfg_attr(miri, ignore)]
    fn parse_error_unknown_head_surfaces_note() {
        let result = parse_filter("(bogus A B)");
        let errs = result.expect_err("unknown head must fail");
        let note = errs[0]
            .note
            .as_ref()
            .expect("expected a note on unknown head symbol");
        assert!(
            note.contains("unknown head symbol") && note.contains("and/or/not"),
            "note should list supported forms. got: {note}"
        );
    }

    /// Valid s-expression input must not carry a note — classification
    /// only runs on error paths.
    #[test]
    #[cfg_attr(miri, ignore)]
    fn parse_success_has_no_note() {
        parse_filter("(and (= type \"requirement\") (has-tag \"stpa\"))").unwrap();
    }
}
