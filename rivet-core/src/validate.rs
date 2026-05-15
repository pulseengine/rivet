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

use crate::document::DocumentStore;
use crate::links::LinkGraph;
use crate::schema::{ArtifactTypeDef, Cardinality, Schema, Severity};
use crate::store::Store;
use regex::Regex;
use std::collections::BTreeMap;
use std::sync::LazyLock;

/// Per-prefix external schemas. Keyed by the external's `prefix` (e.g. `"synth"`).
///
/// `Some(schema)` — the external declared schemas and they loaded; type-check
/// any `<prefix>:<id>` artifact against this schema.
///
/// `None` — the external declared no schemas, or its schemas failed to load;
/// type-check errors for `<prefix>:<id>` artifacts are demoted from ERROR to
/// INFO so the downstream isn't spammed by an external it cannot type-check
/// (issue #245).
pub type ExternalSchemas = BTreeMap<String, Option<Schema>>;

/// Outcome of looking up an artifact's declared type across the main schema
/// and any registered externals.
enum TypeLookup<'a> {
    /// Type resolved — proceed with downstream-style validation.
    Found(&'a ArtifactTypeDef),
    /// Type not declared anywhere we know to look. Emit ERROR.
    Unknown,
    /// Artifact comes from an external whose own schemas we couldn't load.
    /// Emit INFO (permissive fallback).
    UnknownExternalNoSchema {
        /// External prefix that registered without a schema.
        prefix: String,
    },
}

/// Resolve the type definition for an artifact, consulting the external's own
/// schema first when the artifact id is `<prefix>:<…>`.
fn lookup_type<'a>(
    artifact: &crate::model::Artifact,
    schema: &'a Schema,
    externals: &'a ExternalSchemas,
) -> TypeLookup<'a> {
    if let Some((prefix, _)) = artifact.id.split_once(':') {
        if let Some(maybe_ext) = externals.get(prefix) {
            match maybe_ext {
                Some(ext_schema) => {
                    if let Some(td) = ext_schema.artifact_type(&artifact.artifact_type) {
                        return TypeLookup::Found(td);
                    }
                    // External declared schemas but this type isn't in them.
                    // Last-chance: maybe the downstream knows the type.
                    return match schema.artifact_type(&artifact.artifact_type) {
                        Some(td) => TypeLookup::Found(td),
                        None => TypeLookup::Unknown,
                    };
                }
                None => {
                    // External in permissive-fallback mode.
                    return match schema.artifact_type(&artifact.artifact_type) {
                        Some(td) => TypeLookup::Found(td),
                        None => TypeLookup::UnknownExternalNoSchema {
                            prefix: prefix.to_string(),
                        },
                    };
                }
            }
        }
    }
    match schema.artifact_type(&artifact.artifact_type) {
        Some(td) => TypeLookup::Found(td),
        None => TypeLookup::Unknown,
    }
}

/// Regex matching an artifact-id-shaped token in prose: leading
/// uppercase letter, optional uppercase / digit chars, a `-`, and a
/// numeric suffix. `\b` boundaries avoid substrings of larger
/// identifiers. Matches `H-3`, `REQ-028`, `SYSREQ-001`, `CC-12`, etc.
static ID_MENTION_RE: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"\b[A-Z][A-Z0-9]*-[0-9]+\b").unwrap());

/// A single validation diagnostic.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Diagnostic {
    pub severity: Severity,
    pub artifact_id: Option<String>,
    pub rule: String,
    pub message: String,
    /// Source file for diagnostics not tied to an artifact (e.g., parse errors).
    pub source_file: Option<std::path::PathBuf>,
    /// 0-based line number (from serde_yaml error location).
    pub line: Option<u32>,
    /// 0-based column number.
    pub column: Option<u32>,
}

impl Diagnostic {
    /// Create a new diagnostic with no location info.
    pub fn new(
        severity: Severity,
        artifact_id: Option<String>,
        rule: impl Into<String>,
        message: impl Into<String>,
    ) -> Self {
        Self {
            severity,
            artifact_id,
            rule: rule.into(),
            message: message.into(),
            source_file: None,
            line: None,
            column: None,
        }
    }
}

impl std::fmt::Display for Diagnostic {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let level = match self.severity {
            Severity::Error => "ERROR",
            Severity::Warning => "WARN",
            Severity::Info => "INFO",
        };
        // Include file location when available
        if let Some(ref path) = self.source_file {
            let name = path.file_name().and_then(|n| n.to_str()).unwrap_or("?");
            if let Some(line) = self.line {
                write!(f, "  {name}:{}: ", line + 1)?;
            } else {
                write!(f, "  {name}: ")?;
            }
        } else {
            write!(f, "  ")?;
        }
        match &self.artifact_id {
            Some(id) => write!(f, "{level}: [{id}] {}", self.message),
            None => write!(f, "{level}: {}", self.message),
        }
    }
}

/// Reclassify `known-type` and `unknown-link-type` diagnostics emitted by an
/// externals-unaware validator (typically the salsa pipeline) using a
/// per-prefix `ExternalSchemas` map.
///
/// For diagnostics whose `artifact_id` has the form `<prefix>:<id>` and whose
/// prefix is registered in `externals`:
///
/// - **`known-type` ERROR + external has a schema with that type** → diagnostic
///   is dropped (it was a false positive — the type exists in the external's
///   schema set).
/// - **`known-type` ERROR + external has no schema (permissive fallback)** →
///   demoted to INFO with a message explaining type-check was skipped.
/// - **`unknown-link-type` ERROR + external schema declares the link type**
///   → dropped.
/// - **`unknown-link-type` ERROR + external has no schema** → demoted to INFO.
///
/// All other diagnostics pass through unchanged.
///
/// This is the post-pass used by the CLI's salsa validation path
/// (`run_salsa_validation` does not yet thread per-external schemas through
/// the salsa graph; the direct path uses
/// [`validate_with_externals`] instead). The two paths converge on the same
/// final diagnostic set (issue #245).
pub fn reclassify_externals_diagnostics(
    diagnostics: Vec<Diagnostic>,
    store: &Store,
    externals: &ExternalSchemas,
) -> Vec<Diagnostic> {
    if externals.is_empty() {
        return diagnostics;
    }
    diagnostics
        .into_iter()
        .filter_map(|d| reclassify_one(d, store, externals))
        .collect()
}

fn reclassify_one(
    mut d: Diagnostic,
    store: &Store,
    externals: &ExternalSchemas,
) -> Option<Diagnostic> {
    // Only `known-type` and `unknown-link-type` are subject to externals-aware
    // reclassification; everything else passes through unchanged.
    if d.rule != "known-type" && d.rule != "unknown-link-type" {
        return Some(d);
    }
    let Some(id) = d.artifact_id.as_ref() else {
        return Some(d);
    };
    let Some((prefix, _)) = id.split_once(':') else {
        return Some(d);
    };
    let Some(maybe_schema) = externals.get(prefix) else {
        return Some(d);
    };
    match d.rule.as_str() {
        "known-type" => {
            // We need the artifact's type to consult the external schema.
            let Some(art) = store.get(id) else {
                return Some(d);
            };
            match maybe_schema {
                Some(ext_schema) => {
                    if ext_schema.artifact_type(&art.artifact_type).is_some() {
                        // External does declare this type — drop the
                        // false-positive ERROR.
                        None
                    } else {
                        // External has schemas, type still unknown — keep ERROR.
                        Some(d)
                    }
                }
                None => {
                    d.severity = Severity::Info;
                    d.message = format!(
                        "artifact type '{}' not declared in any loaded schema; \
                         external '{}' declares no schemas (or its schemas failed to load), \
                         so type-check is skipped for this prefix",
                        art.artifact_type, prefix
                    );
                    Some(d)
                }
            }
        }
        "unknown-link-type" => {
            // Parse the link-type out of the message; format is
            //   "link type 'foo' is not defined in the schema …"
            let lt = d
                .message
                .split('\'')
                .nth(1)
                .map(str::to_string)
                .unwrap_or_default();
            match maybe_schema {
                Some(ext_schema) => {
                    if !lt.is_empty() && ext_schema.link_types.contains_key(&lt) {
                        None
                    } else {
                        Some(d)
                    }
                }
                None => {
                    d.severity = Severity::Info;
                    d.message = format!(
                        "link type '{}' is not defined in the downstream schema; \
                         external '{}' declares no schemas, so this can't be checked",
                        lt, prefix,
                    );
                    Some(d)
                }
            }
        }
        _ => Some(d),
    }
}

/// Validate a store against a schema and link graph.
///
/// Returns a list of diagnostics (errors, warnings, info).
/// The caller decides whether to fail on errors.
///
/// This is the full validation pipeline including conditional rules.
/// For the salsa incremental layer, use [`validate_structural`] for phases
/// 1-7 and [`evaluate_conditional_rules`](crate::db::evaluate_conditional_rules)
/// for phase 8 as a separate tracked query.
pub fn validate(store: &Store, schema: &Schema, graph: &LinkGraph) -> Vec<Diagnostic> {
    validate_with_externals(store, schema, graph, &BTreeMap::new())
}

/// Validate a store against a schema, link graph, and per-prefix external
/// schemas. Externally-prefixed artifacts (id like `<prefix>:<id>`) are
/// type-checked against `externals[prefix]` when present, so cross-repo
/// projects don't drown in `unknown artifact type` errors for types only
/// defined in their externals' schemas (issue #245).
pub fn validate_with_externals(
    store: &Store,
    schema: &Schema,
    graph: &LinkGraph,
    externals: &ExternalSchemas,
) -> Vec<Diagnostic> {
    let mut diagnostics = validate_structural_with_externals(store, schema, graph, externals);

    // 0. Check conditional rule consistency (schema-level)
    diagnostics.extend(crate::schema::check_conditional_consistency(
        &schema.conditional_rules,
    ));

    // 8. Check conditional rules (pre-compile regexes to avoid re-compilation per artifact)
    for rule in &schema.conditional_rules {
        let compiled_re = rule.when.compile_regex();
        let condition_re = rule.condition.as_ref().and_then(|c| c.compile_regex());
        for artifact in store.iter() {
            // If a precondition is set, it must also match
            if let Some(cond) = &rule.condition {
                if !cond.matches_artifact_with(artifact, condition_re.as_ref()) {
                    continue;
                }
            }
            if rule
                .when
                .matches_artifact_with(artifact, compiled_re.as_ref())
            {
                diagnostics.extend(rule.then.check(artifact, &rule.name, rule.severity));
            }
        }
    }

    // 9. Check status-gate / cross-artifact validation rules.
    //
    // Each rule's `rule:` field is a single s-expression evaluated against
    // every artifact in the store. Fires (emits a diagnostic) when the
    // expression returns false. Rule body typically takes the implies-shape
    //   `(implies <premise> <consequence>)`
    // where the consequence uses `forall-linked` / `exists-linked` to gate
    // on the state of linked artifacts. See `schema::ValidationRule`.
    //
    // The s-expr is parsed once per rule (not per artifact) to keep the
    // hot loop tight.
    diagnostics.extend(evaluate_validation_rules(store, schema, graph));

    diagnostics
}

/// Evaluate `schema.validation_rules` against every artifact in the store.
///
/// Returns one diagnostic per (rule, artifact) pair where the rule's
/// s-expression evaluates to false. Parse errors in a rule body emit a
/// single rule-level diagnostic and skip evaluation against artifacts.
///
/// Severity is downgraded to `Info` for `status: draft` artifacts only
/// when the rule opts in via `draft-downgrade: true` — the default is to
/// fire at full severity (status-gate rules typically gate *by* status,
/// so the rule's `when` clause already filters drafts).
fn evaluate_validation_rules(store: &Store, schema: &Schema, graph: &LinkGraph) -> Vec<Diagnostic> {
    use crate::sexpr_eval;

    let mut out = Vec::new();
    for rule in &schema.validation_rules {
        // Parse the rule body once. A parse failure is itself a
        // schema-level diagnostic — surface it and skip this rule's
        // artifact evaluation.
        let expr = match sexpr_eval::parse_filter(&rule.rule) {
            Ok(e) => e,
            Err(errs) => {
                let detail = errs
                    .iter()
                    .map(|e| e.message.as_str())
                    .collect::<Vec<_>>()
                    .join("; ");
                out.push(Diagnostic {
                    source_file: None,
                    line: None,
                    column: None,
                    severity: Severity::Error,
                    artifact_id: None,
                    rule: rule.id.clone(),
                    message: format!(
                        "validation-rule '{}' has a malformed rule body: {detail}",
                        rule.id
                    ),
                });
                continue;
            }
        };
        let policy: sexpr_eval::MissingTargetPolicy = rule.on_unresolved.into();
        for artifact in store.iter() {
            let holds =
                sexpr_eval::matches_filter_with_policy(&expr, artifact, graph, store, policy);
            if holds {
                continue;
            }
            let severity = if rule.draft_downgrade && artifact.is_draft() {
                Severity::Info
            } else {
                rule.severity
            };
            let message = render_validation_message(rule, artifact);
            out.push(Diagnostic {
                source_file: artifact.source_file.clone(),
                line: None,
                column: None,
                severity,
                artifact_id: Some(artifact.id.clone()),
                rule: rule.id.clone(),
                message,
            });
        }
    }
    out
}

/// Render a `ValidationRule.message` template against an artifact.
///
/// Recognised placeholders (lowercase, exact match): `{id}`, `{type}`,
/// `{status}`, `{title}`, `{rule}`. Unset `status` renders as `<unset>`
/// so the auditor sees the absence rather than an empty string. Unknown
/// placeholders are left in place — surfaces typos in the rule message
/// rather than swallowing them silently.
fn render_validation_message(
    rule: &crate::schema::ValidationRule,
    artifact: &crate::model::Artifact,
) -> String {
    let template = match &rule.message {
        Some(t) => t.as_str(),
        None => {
            return format!(
                "{} ({}) violates validation rule '{}'",
                artifact.id, artifact.artifact_type, rule.id
            );
        }
    };
    template
        .replace("{id}", &artifact.id)
        .replace("{type}", &artifact.artifact_type)
        .replace("{status}", artifact.status.as_deref().unwrap_or("<unset>"))
        .replace("{title}", &artifact.title)
        .replace("{rule}", &rule.id)
}

/// Structural validation only (phases 1-7).
///
/// Validates types, required fields, allowed values, link cardinality,
/// link target types, broken links, and traceability rules.
/// Conditional rules (phase 8) are NOT included — the salsa layer runs
/// those as a separate tracked query for finer-grained invalidation.
pub fn validate_structural(store: &Store, schema: &Schema, graph: &LinkGraph) -> Vec<Diagnostic> {
    validate_structural_with_externals(store, schema, graph, &BTreeMap::new())
}

/// Structural validation aware of per-prefix external schemas.
///
/// Behaves like [`validate_structural`] but consults `externals[prefix]` when
/// the artifact's id has the form `<prefix>:<id>`, so an external's own types
/// resolve cleanly under its prefix without polluting the downstream's type
/// namespace. When `externals[prefix]` is `None` (the external declared no
/// schemas or its schemas failed to load), unknown-type and unknown-link-type
/// findings for that prefix are demoted from ERROR to INFO — the permissive
/// fallback specified in issue #245.
pub fn validate_structural_with_externals(
    store: &Store,
    schema: &Schema,
    graph: &LinkGraph,
    externals: &ExternalSchemas,
) -> Vec<Diagnostic> {
    let mut diagnostics = Vec::new();

    // 1. Check that every artifact has a known type
    for artifact in store.iter() {
        let type_def = match lookup_type(artifact, schema, externals) {
            TypeLookup::Found(td) => td,
            TypeLookup::Unknown => {
                diagnostics.push(Diagnostic {
                    source_file: None,
                    line: None,
                    column: None,
                    severity: Severity::Error,
                    artifact_id: Some(artifact.id.clone()),
                    rule: "known-type".to_string(),
                    message: format!("unknown artifact type '{}'", artifact.artifact_type),
                });
                continue;
            }
            TypeLookup::UnknownExternalNoSchema { prefix } => {
                diagnostics.push(Diagnostic {
                    source_file: None,
                    line: None,
                    column: None,
                    severity: Severity::Info,
                    artifact_id: Some(artifact.id.clone()),
                    rule: "known-type".to_string(),
                    message: format!(
                        "artifact type '{}' not declared in any loaded schema; \
                         external '{}' declares no schemas (or its schemas failed to load), \
                         so type-check is skipped for this prefix",
                        artifact.artifact_type, prefix
                    ),
                });
                continue;
            }
        };

        // 2. Check required fields
        for field in &type_def.fields {
            if field.required && !artifact.fields.contains_key(&field.name) {
                // Also check if the field name matches a base field (description, etc.)
                let has_base = match field.name.as_str() {
                    "description" => artifact.description.is_some(),
                    "status" => artifact.status.is_some(),
                    _ => false,
                };
                if !has_base {
                    diagnostics.push(Diagnostic {
                        source_file: None,
                        line: None,
                        column: None,
                        severity: Severity::Error,
                        artifact_id: Some(artifact.id.clone()),
                        rule: "required-field".to_string(),
                        message: format!(
                            "missing required field '{}' for type '{}'",
                            field.name, artifact.artifact_type
                        ),
                    });
                }
            }

            // 3. Check allowed values
            if let Some(allowed) = &field.allowed_values {
                if let Some(value) = artifact.fields.get(&field.name) {
                    if let Some(s) = value.as_str() {
                        // Value is already a YAML string — straightforward check
                        if !allowed.iter().any(|a| a == s) {
                            diagnostics.push(Diagnostic {
                                source_file: None,
                                line: None,
                                column: None,
                                severity: Severity::Warning,
                                artifact_id: Some(artifact.id.clone()),
                                rule: "allowed-values".to_string(),
                                message: format!(
                                    "field '{}' has value '{}', allowed: {:?}",
                                    field.name, s, allowed
                                ),
                            });
                        }
                    } else if let Some(b) = value.as_bool() {
                        // YAML 1.1 coerces yes/no/on/off/true/false to booleans.
                        // Check canonical and common aliases against allowed values.
                        let candidates: &[&str] = if b {
                            &["true", "yes"]
                        } else {
                            &["false", "no"]
                        };
                        if !candidates.iter().any(|c| allowed.iter().any(|a| a == c)) {
                            diagnostics.push(Diagnostic {
                                source_file: None,
                                line: None,
                                column: None,
                                severity: Severity::Warning,
                                artifact_id: Some(artifact.id.clone()),
                                rule: "allowed-values".to_string(),
                                message: format!(
                                    "field '{}' has value '{}' (boolean), allowed: {:?}",
                                    field.name, b, allowed
                                ),
                            });
                        }
                        // Warn when field is declared as string but YAML coerced the value
                        if field.field_type == "string" {
                            diagnostics.push(Diagnostic { source_file: None, line: None, column: None,
                                severity: Severity::Warning,
                                artifact_id: Some(artifact.id.clone()),
                                rule: "yaml-type-coercion".to_string(),
                                message: format!(
                                    "field '{}' is declared as string but YAML parsed the value as boolean ({}); consider quoting it",
                                    field.name, b
                                ),
                            });
                        }
                    } else if value.is_number() {
                        // YAML coerces unquoted numbers (1.0, 42, etc.)
                        let num_str = if let Some(u) = value.as_u64() {
                            u.to_string()
                        } else if let Some(i) = value.as_i64() {
                            i.to_string()
                        } else if let Some(f) = value.as_f64() {
                            f.to_string()
                        } else {
                            format!("{:?}", value)
                        };
                        if !allowed.iter().any(|a| a == &num_str) {
                            diagnostics.push(Diagnostic {
                                source_file: None,
                                line: None,
                                column: None,
                                severity: Severity::Warning,
                                artifact_id: Some(artifact.id.clone()),
                                rule: "allowed-values".to_string(),
                                message: format!(
                                    "field '{}' has value '{}' (number), allowed: {:?}",
                                    field.name, num_str, allowed
                                ),
                            });
                        }
                        // Warn when field is declared as string but YAML coerced the value
                        if field.field_type == "string" {
                            diagnostics.push(Diagnostic { source_file: None, line: None, column: None,
                                severity: Severity::Warning,
                                artifact_id: Some(artifact.id.clone()),
                                rule: "yaml-type-coercion".to_string(),
                                message: format!(
                                    "field '{}' is declared as string but YAML parsed the value as number ({}); consider quoting it",
                                    field.name, num_str
                                ),
                            });
                        }
                    }
                }
            }
        }

        // 4. Check link field cardinality
        for link_field in &type_def.link_fields {
            let count = artifact
                .links
                .iter()
                .filter(|l| l.link_type == link_field.link_type)
                .count();

            match link_field.cardinality {
                Cardinality::ExactlyOne if count != 1 => {
                    diagnostics.push(Diagnostic {
                        source_file: None,
                        line: None,
                        column: None,
                        severity: Severity::Error,
                        artifact_id: Some(artifact.id.clone()),
                        rule: "cardinality".to_string(),
                        message: format!(
                            "link '{}' requires exactly 1 target, found {}",
                            link_field.link_type, count
                        ),
                    });
                }
                Cardinality::OneOrMany if count == 0 && link_field.required => {
                    diagnostics.push(Diagnostic {
                        source_file: None,
                        line: None,
                        column: None,
                        severity: Severity::Error,
                        artifact_id: Some(artifact.id.clone()),
                        rule: "cardinality".to_string(),
                        message: format!(
                            "link '{}' requires at least 1 target, found 0",
                            link_field.link_type
                        ),
                    });
                }
                Cardinality::ZeroOrOne if count > 1 => {
                    diagnostics.push(Diagnostic {
                        source_file: None,
                        line: None,
                        column: None,
                        severity: Severity::Warning,
                        artifact_id: Some(artifact.id.clone()),
                        rule: "cardinality".to_string(),
                        message: format!(
                            "link '{}' allows at most 1 target, found {}",
                            link_field.link_type, count
                        ),
                    });
                }
                _ => {}
            }

            // 5. Check link target types
            for link in &artifact.links {
                if link.link_type != link_field.link_type {
                    continue;
                }
                if let Some(target) = store.get(&link.target) {
                    if !link_field.target_types.is_empty()
                        && !link_field.target_types.contains(&target.artifact_type)
                    {
                        diagnostics.push(Diagnostic {
                            source_file: None,
                            line: None,
                            column: None,
                            severity: Severity::Error,
                            artifact_id: Some(artifact.id.clone()),
                            rule: "link-target-type".to_string(),
                            message: format!(
                                "link '{}' targets '{}' (type '{}'), allowed target types: {:?}",
                                link.link_type,
                                link.target,
                                target.artifact_type,
                                link_field.target_types
                            ),
                        });
                    }
                }
            }
        }
    }

    // 6. Check broken links
    for broken in &graph.broken {
        diagnostics.push(Diagnostic {
            source_file: None,
            line: None,
            column: None,
            severity: Severity::Error,
            artifact_id: Some(broken.source.clone()),
            rule: "broken-link".to_string(),
            message: format!(
                "link '{}' targets '{}' which does not exist",
                broken.link_type, broken.target
            ),
        });
    }

    // 7. Check traceability rules (forward + backlink coverage)
    for rule in &schema.traceability_rules {
        for id in store.by_type(&rule.source_type) {
            let Some(artifact) = store.get(id) else {
                continue;
            };

            // Draft artifacts get downgraded to Info for traceability rule violations.
            // Active and approved artifacts receive full error-level enforcement.
            let effective_severity = if artifact.is_draft() {
                Severity::Info
            } else {
                rule.severity
            };

            // Forward link check.
            //
            // Empty `target_types` means "match any artifact type" — same
            // convention used by `coverage::compute_coverage` and by
            // `LinkFieldDef` checks (validate.rs ~L310). Without this
            // unification, `rivet validate` and `rivet coverage` disagree on
            // the same rule + data: validate would report a false-positive
            // violation while coverage would count the link as satisfying.
            if let Some(required_link) = &rule.required_link {
                let has_link = artifact.links.iter().any(|l| {
                    l.link_type == *required_link
                        && (rule.target_types.is_empty()
                            || store
                                .get(&l.target)
                                .is_some_and(|t| rule.target_types.contains(&t.artifact_type)))
                });
                if !has_link {
                    diagnostics.push(Diagnostic {
                        source_file: None,
                        line: None,
                        column: None,
                        severity: effective_severity,
                        artifact_id: Some(id.clone()),
                        rule: rule.name.clone(),
                        message: format!(
                            "{}: missing '{}' link to {:?}",
                            rule.description, required_link, rule.target_types
                        ),
                    });
                }
            }

            // Backlink check (coverage). Empty `from_types` means "match any"
            // — same convention as `coverage::compute_coverage`.
            if let Some(required_backlink) = &rule.required_backlink {
                let has_backlink = graph.backlinks_to(id).iter().any(|bl| {
                    bl.link_type == *required_backlink
                        && (rule.from_types.is_empty()
                            || store
                                .get(&bl.source)
                                .is_some_and(|s| rule.from_types.contains(&s.artifact_type)))
                });
                if !has_backlink {
                    diagnostics.push(Diagnostic {
                        source_file: None,
                        line: None,
                        column: None,
                        severity: effective_severity,
                        artifact_id: Some(id.clone()),
                        rule: rule.name.clone(),
                        message: rule.description.clone(),
                    });
                }
            }
        }
    }

    // 8. Check unknown link types (not defined in schema).
    // Elevated from Warning to Error: an undeclared link-type means the
    // schema's cardinality and target-type guarantees silently don't apply
    // to those links — the same severity as a broken required-link link,
    // not a soft advisory. Pin to one diagnostic per (artifact, link-type)
    // pair so a typo doesn't drown the report.
    //
    // For externally-prefixed artifacts, also accept link types declared
    // in their external's schema. If the external declared no schemas
    // (permissive-fallback), demote unknown-link-type to INFO for that
    // prefix — same rationale as the unknown-artifact-type fallback above
    // (issue #245).
    use std::collections::BTreeSet;
    let known_link_types: BTreeSet<&str> = schema.link_types.keys().map(String::as_str).collect();
    for artifact in store.iter() {
        let (ext_prefix, ext_known): (Option<&str>, BTreeSet<&str>) =
            match artifact.id.split_once(':') {
                Some((prefix, _)) => match externals.get(prefix) {
                    Some(Some(ext_schema)) => (
                        Some(prefix),
                        ext_schema.link_types.keys().map(String::as_str).collect(),
                    ),
                    Some(None) => (Some(prefix), BTreeSet::new()),
                    None => (None, BTreeSet::new()),
                },
                None => (None, BTreeSet::new()),
            };
        let mut seen: BTreeSet<&str> = BTreeSet::new();
        for link in &artifact.links {
            let lt = link.link_type.as_str();
            if known_link_types.contains(lt) || ext_known.contains(lt) {
                continue;
            }
            if !seen.insert(lt) {
                continue;
            }
            // External-prefixed artifact whose external has no schema:
            // demote to INFO instead of suppressing entirely so the user
            // still sees what's happening.
            let no_schema_external =
                matches!(ext_prefix.and_then(|p| externals.get(p)), Some(None));
            let severity = if no_schema_external {
                Severity::Info
            } else {
                Severity::Error
            };
            let message = if no_schema_external {
                format!(
                    "link type '{}' is not defined in the downstream schema; \
                     external '{}' declares no schemas, so this can't be checked",
                    lt,
                    ext_prefix.unwrap_or("?"),
                )
            } else {
                format!(
                    "link type '{}' is not defined in the schema \
                     — declare it in link-types: or remove the link",
                    lt
                )
            };
            diagnostics.push(Diagnostic {
                source_file: None,
                line: None,
                column: None,
                severity,
                artifact_id: Some(artifact.id.clone()),
                rule: "unknown-link-type".to_string(),
                message,
            });
        }
    }

    // 9. Check unknown fields (not defined in schema for this artifact type)
    for artifact in store.iter() {
        if let Some(type_def) = schema.artifact_type(&artifact.artifact_type) {
            let known_fields: std::collections::HashSet<&str> =
                type_def.fields.iter().map(|f| f.name.as_str()).collect();
            for field_name in artifact.fields.keys() {
                if !known_fields.contains(field_name.as_str()) {
                    diagnostics.push(Diagnostic {
                        source_file: None,
                        line: None,
                        column: None,
                        severity: Severity::Info,
                        artifact_id: Some(artifact.id.clone()),
                        rule: "unknown-field".to_string(),
                        message: format!(
                            "field '{}' is not defined in schema for type '{}'",
                            field_name, artifact.artifact_type
                        ),
                    });
                }
            }
        }
    }

    // 10. Prose-mention without typed link.
    //
    // When an artifact's `description` (or a string-typed value in
    // `fields`) names another artifact id (e.g. "satisfies REQ-028"),
    // that mention should be matched by a typed link to keep the prose
    // and the typed graph coherent. Severity is Warning, not Error:
    // authors sometimes mention an id casually ("similar to DD-001") and
    // the warning is the discipline nudge — not a hard rule. Use
    // `--fail-on warning` for projects that want hard enforcement.
    //
    // Suppress when:
    //   * the mention is the artifact's own id (self-reference),
    //   * the mentioned id does not resolve in the corpus (broken refs
    //     are a separate concern; see broken-link / doc-broken-ref),
    //   * the artifact already has any typed link to that id.
    //
    // Dedupe per (artifact, mentioned-id) so that prose mentioning
    // REQ-028 three times yields one warning, matching the
    // unknown-link-type pass's per-(artifact, link-type) policy.
    // (BTreeSet is already imported at the top of pass 8 above.)
    for artifact in store.iter() {
        let linked_targets: BTreeSet<&str> =
            artifact.links.iter().map(|l| l.target.as_str()).collect();
        let mut warned: BTreeSet<String> = BTreeSet::new();

        let mut scan = |text: &str| {
            for m in ID_MENTION_RE.find_iter(text) {
                let mentioned = m.as_str();
                if mentioned == artifact.id {
                    continue;
                }
                if !store.contains(mentioned) {
                    continue;
                }
                if linked_targets.contains(mentioned) {
                    continue;
                }
                if !warned.insert(mentioned.to_string()) {
                    continue;
                }
                diagnostics.push(Diagnostic {
                    source_file: None,
                    line: None,
                    column: None,
                    severity: Severity::Warning,
                    artifact_id: Some(artifact.id.clone()),
                    rule: "prose-mention-without-typed-link".to_string(),
                    message: format!(
                        "prose mentions '{mentioned}' but no typed link to it; \
                         add a link in `links:` or remove the mention"
                    ),
                });
            }
        };

        if let Some(desc) = &artifact.description {
            scan(desc);
        }
        for value in artifact.fields.values() {
            if let Some(s) = value.as_str() {
                scan(s);
            }
        }
    }

    diagnostics
}

/// Validate document `[[ID]]` references against the artifact store.
///
/// Returns diagnostics for any reference that points to a non-existent artifact.
pub fn validate_documents(doc_store: &DocumentStore, store: &Store) -> Vec<Diagnostic> {
    let mut diagnostics = Vec::new();

    for doc in doc_store.iter() {
        for reference in &doc.references {
            if !store.contains(&reference.artifact_id) {
                diagnostics.push(Diagnostic {
                    // Attach the document's source file and the reference's
                    // 1-based line (converted to 0-based) so the LSP can
                    // publish positioned diagnostics in the markdown file.
                    source_file: doc.source_file.clone(),
                    line: Some(reference.line.saturating_sub(1) as u32),
                    column: Some(reference.col as u32),
                    severity: Severity::Warning,
                    artifact_id: Some(doc.id.clone()),
                    rule: "doc-broken-ref".into(),
                    message: format!(
                        "document references [[{}]] which does not exist",
                        reference.artifact_id
                    ),
                });
            }
        }
    }

    diagnostics
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::links::LinkGraph;
    use crate::model::{Artifact, Link};
    use crate::schema::{
        ArtifactTypeDef, Condition, ConditionalRule, FieldDef, LinkFieldDef, Requirement, Severity,
        TraceabilityRule,
    };
    use crate::test_helpers::{minimal_artifact, minimal_schema};
    use std::collections::BTreeMap;

    /// Helper: create an artifact with given id, type, status, optional fields, and links.
    fn make_artifact(
        id: &str,
        artifact_type: &str,
        status: Option<&str>,
        description: Option<&str>,
        fields: Vec<(&str, &str)>,
        links: Vec<Link>,
    ) -> Artifact {
        let mut field_map = BTreeMap::new();
        for (k, v) in fields {
            field_map.insert(k.to_string(), serde_yaml::Value::String(v.to_string()));
        }
        let mut a = minimal_artifact(id, artifact_type);
        a.description = description.map(|s| s.to_string());
        a.status = status.map(|s| s.to_string());
        a.links = links;
        a.fields = field_map;
        a
    }

    /// Helper: create a minimal schema that knows about the "test" artifact type.
    fn make_schema(conditional_rules: Vec<ConditionalRule>) -> Schema {
        let mut file = minimal_schema("test");
        file.artifact_types = vec![ArtifactTypeDef {
            name: "test".to_string(),
            description: "Test type".to_string(),
            fields: vec![],
            link_fields: vec![],
            aspice_process: None,
            common_mistakes: vec![],
            example: None,
            yaml_section: None,
            yaml_sections: vec![],
            yaml_section_suffix: None,
            shorthand_links: std::collections::BTreeMap::new(),
        }];
        file.conditional_rules = conditional_rules;
        Schema::merge(&[file])
    }

    // rivet: verifies REQ-023
    #[test]
    fn condition_equals_matches_correct_status() {
        let cond = Condition::Equals {
            field: "status".to_string(),
            value: "approved".to_string(),
        };
        let art = make_artifact("A-1", "test", Some("approved"), None, vec![], vec![]);
        assert!(cond.matches_artifact(&art));
    }

    // rivet: verifies REQ-023
    #[test]
    fn condition_equals_does_not_match_wrong_status() {
        let cond = Condition::Equals {
            field: "status".to_string(),
            value: "approved".to_string(),
        };
        let art = make_artifact("A-1", "test", Some("draft"), None, vec![], vec![]);
        assert!(!cond.matches_artifact(&art));
    }

    // rivet: verifies REQ-023
    #[test]
    fn condition_equals_does_not_match_missing_status() {
        let cond = Condition::Equals {
            field: "status".to_string(),
            value: "approved".to_string(),
        };
        let art = make_artifact("A-1", "test", None, None, vec![], vec![]);
        assert!(!cond.matches_artifact(&art));
    }

    // rivet: verifies REQ-023
    #[test]
    fn condition_matches_regex() {
        let cond = Condition::Matches {
            field: "safety".to_string(),
            pattern: "ASIL_.*".to_string(),
        };
        let art = make_artifact(
            "A-1",
            "test",
            None,
            None,
            vec![("safety", "ASIL_B")],
            vec![],
        );
        assert!(cond.matches_artifact(&art));
    }

    // rivet: verifies REQ-023
    #[test]
    fn condition_matches_regex_no_match() {
        let cond = Condition::Matches {
            field: "safety".to_string(),
            pattern: "ASIL_.*".to_string(),
        };
        let art = make_artifact("A-1", "test", None, None, vec![("safety", "QM")], vec![]);
        assert!(!cond.matches_artifact(&art));
    }

    // rivet: verifies REQ-023
    #[test]
    fn condition_exists_present_field() {
        let cond = Condition::Exists {
            field: "description".to_string(),
        };
        let art = make_artifact(
            "A-1",
            "test",
            None,
            Some("Has a description"),
            vec![],
            vec![],
        );
        assert!(cond.matches_artifact(&art));
    }

    // rivet: verifies REQ-023
    #[test]
    fn condition_exists_missing_field() {
        let cond = Condition::Exists {
            field: "description".to_string(),
        };
        let art = make_artifact("A-1", "test", None, None, vec![], vec![]);
        assert!(!cond.matches_artifact(&art));
    }

    // rivet: verifies REQ-004
    #[test]
    fn required_fields_catches_missing_field() {
        let req = Requirement::RequiredFields {
            fields: vec!["description".to_string()],
        };
        let art = make_artifact("A-1", "test", Some("approved"), None, vec![], vec![]);
        let diags = req.check(&art, "test-rule", Severity::Error);
        assert_eq!(diags.len(), 1);
        assert!(diags[0].message.contains("description"));
        assert_eq!(diags[0].severity, Severity::Error);
    }

    // rivet: verifies REQ-004
    #[test]
    fn required_fields_passes_when_field_present() {
        let req = Requirement::RequiredFields {
            fields: vec!["description".to_string()],
        };
        let art = make_artifact(
            "A-1",
            "test",
            Some("approved"),
            Some("Has desc"),
            vec![],
            vec![],
        );
        let diags = req.check(&art, "test-rule", Severity::Error);
        assert!(diags.is_empty());
    }

    // rivet: verifies REQ-004
    #[test]
    fn required_links_catches_missing_link() {
        let req = Requirement::RequiredLinks {
            link_types: vec!["mitigated_by".to_string()],
        };
        let art = make_artifact("A-1", "test", None, None, vec![], vec![]);
        let diags = req.check(&art, "test-rule", Severity::Warning);
        assert_eq!(diags.len(), 1);
        assert!(diags[0].message.contains("mitigated_by"));
        assert_eq!(diags[0].severity, Severity::Warning);
    }

    // rivet: verifies REQ-004
    #[test]
    fn unknown_link_type_is_error_not_warning() {
        // Regression guard: v0.4.1 emitted Warning for links whose type
        // wasn't declared in the schema, so validation stayed PASS even
        // though the cardinality and target-type guarantees silently
        // didn't apply. Now promoted to Error — one per unique
        // (artifact, link_type) pair to avoid noise.
        use crate::store::Store;

        let schema_file = minimal_schema("test");
        let schema = Schema::merge(&[schema_file]);

        let mut art = minimal_artifact("A-1", "test");
        art.links = vec![
            Link {
                link_type: "undeclared-type".to_string(),
                target: "B-1".to_string(),
            },
            Link {
                link_type: "undeclared-type".to_string(),
                target: "B-2".to_string(),
            },
        ];
        let mut store = Store::new();
        let _ = store.insert(art);
        let graph = LinkGraph::build(&store, &schema);

        let diags = crate::validate::validate(&store, &schema, &graph);
        let unknown: Vec<_> = diags
            .iter()
            .filter(|d| d.rule == "unknown-link-type")
            .collect();
        assert_eq!(
            unknown.len(),
            1,
            "must emit exactly one diagnostic per (artifact, link-type) pair: {unknown:?}",
        );
        assert_eq!(
            unknown[0].severity,
            Severity::Error,
            "unknown link type must be Error, got {:?}",
            unknown[0].severity
        );
    }

    // rivet: verifies REQ-010
    #[test]
    fn schema_consistency_flags_dangling_link_field_refs() {
        // Regression guard: a schema with link-field.link_type pointing to
        // an undeclared link type must be flagged at schema-check time,
        // not silently tolerated until artifacts start being validated.
        let mut file = minimal_schema("test");
        file.artifact_types = vec![ArtifactTypeDef {
            name: "test".to_string(),
            description: "Test type".to_string(),
            fields: vec![],
            link_fields: vec![LinkFieldDef {
                name: "satisfies".to_string(),
                link_type: "nonexistent-link-type".to_string(),
                required: false,
                cardinality: Cardinality::ZeroOrMany,
                target_types: vec!["another-missing-type".to_string()],
                description: None,
            }],
            aspice_process: None,
            common_mistakes: vec![],
            example: None,
            yaml_section: None,
            yaml_sections: vec![],
            yaml_section_suffix: None,
            shorthand_links: std::collections::BTreeMap::new(),
        }];
        let schema = Schema::merge(&[file]);
        let issues = schema.validate_consistency();
        assert!(
            issues.iter().any(|i| i.contains("nonexistent-link-type")),
            "must flag undeclared link type: got {issues:?}",
        );
        assert!(
            issues.iter().any(|i| i.contains("another-missing-type")),
            "must flag unknown target type: got {issues:?}",
        );
    }

    // rivet: verifies REQ-004
    #[test]
    fn required_links_passes_when_link_present() {
        let req = Requirement::RequiredLinks {
            link_types: vec!["mitigated_by".to_string()],
        };
        let links = vec![Link {
            link_type: "mitigated_by".to_string(),
            target: "MIT-1".to_string(),
        }];
        let art = make_artifact("A-1", "test", None, None, vec![], links);
        let diags = req.check(&art, "test-rule", Severity::Warning);
        assert!(diags.is_empty());
    }

    // rivet: verifies REQ-023
    #[test]
    fn conditional_rule_only_fires_when_condition_true() {
        let rule = ConditionalRule {
            name: "approved-needs-desc".to_string(),
            description: None,
            condition: None,
            when: Condition::Equals {
                field: "status".to_string(),
                value: "approved".to_string(),
            },
            then: Requirement::RequiredFields {
                fields: vec!["description".to_string()],
            },
            severity: Severity::Error,
        };

        let schema = make_schema(vec![rule]);

        // Artifact with status=draft (condition NOT met) -- no description, no diagnostic
        let mut store = Store::new();
        store
            .insert(make_artifact(
                "A-1",
                "test",
                Some("draft"),
                None,
                vec![],
                vec![],
            ))
            .unwrap();
        let graph = LinkGraph::build(&store, &schema);
        let diags = validate(&store, &schema, &graph);
        let cond_diags: Vec<_> = diags
            .iter()
            .filter(|d| d.rule == "approved-needs-desc")
            .collect();
        assert!(cond_diags.is_empty(), "should not fire for draft status");

        // Artifact with status=approved (condition met) -- no description, should fire
        let mut store2 = Store::new();
        store2
            .insert(make_artifact(
                "A-2",
                "test",
                Some("approved"),
                None,
                vec![],
                vec![],
            ))
            .unwrap();
        let graph2 = LinkGraph::build(&store2, &schema);
        let diags2 = validate(&store2, &schema, &graph2);
        let cond_diags2: Vec<_> = diags2
            .iter()
            .filter(|d| d.rule == "approved-needs-desc")
            .collect();
        assert_eq!(
            cond_diags2.len(),
            1,
            "should fire for approved without desc"
        );
    }

    // rivet: verifies REQ-023
    #[test]
    fn rule_with_warning_severity_produces_warning() {
        let rule = ConditionalRule {
            name: "warn-rule".to_string(),
            description: None,
            condition: None,
            when: Condition::Equals {
                field: "status".to_string(),
                value: "approved".to_string(),
            },
            then: Requirement::RequiredFields {
                fields: vec!["description".to_string()],
            },
            severity: Severity::Warning,
        };

        let schema = make_schema(vec![rule]);

        let mut store = Store::new();
        store
            .insert(make_artifact(
                "A-1",
                "test",
                Some("approved"),
                None,
                vec![],
                vec![],
            ))
            .unwrap();
        let graph = LinkGraph::build(&store, &schema);
        let diags = validate(&store, &schema, &graph);
        let cond_diags: Vec<_> = diags.iter().filter(|d| d.rule == "warn-rule").collect();
        assert_eq!(cond_diags.len(), 1);
        assert_eq!(cond_diags[0].severity, Severity::Warning);
    }

    // rivet: verifies REQ-023
    #[test]
    fn serde_roundtrip_conditional_rule_equals() {
        let yaml = r#"
name: test-rule
when:
  field: status
  equals: approved
then:
  required-fields: [description]
severity: warning
"#;
        let rule: ConditionalRule = serde_yaml::from_str(yaml).unwrap();
        assert_eq!(rule.name, "test-rule");
        assert!(matches!(rule.when, Condition::Equals { .. }));
        assert!(matches!(rule.then, Requirement::RequiredFields { .. }));
        assert_eq!(rule.severity, Severity::Warning);
    }

    // rivet: verifies REQ-023
    #[test]
    fn serde_roundtrip_conditional_rule_matches() {
        let yaml = r#"
name: asil-rule
when:
  field: safety
  matches: "ASIL_.*"
then:
  required-links: [mitigated_by]
severity: error
"#;
        let rule: ConditionalRule = serde_yaml::from_str(yaml).unwrap();
        assert!(matches!(rule.when, Condition::Matches { .. }));
        assert!(matches!(rule.then, Requirement::RequiredLinks { .. }));
    }

    // rivet: verifies REQ-023
    #[test]
    fn serde_roundtrip_conditional_rule_exists() {
        let yaml = r#"
name: exists-rule
when:
  field: rationale
  exists: true
then:
  required-fields: [alternatives]
"#;
        let rule: ConditionalRule = serde_yaml::from_str(yaml).unwrap();
        assert!(matches!(rule.when, Condition::Exists { .. }));
        // Default severity should be Error
        assert_eq!(rule.severity, Severity::Error);
    }

    // rivet: verifies REQ-023
    #[test]
    fn consistency_detects_duplicate_names() {
        let rules = vec![
            ConditionalRule {
                name: "dup".to_string(),
                description: None,
                condition: None,
                when: Condition::Equals {
                    field: "status".to_string(),
                    value: "a".to_string(),
                },
                then: Requirement::RequiredFields {
                    fields: vec!["x".to_string()],
                },
                severity: Severity::Error,
            },
            ConditionalRule {
                name: "dup".to_string(),
                description: None,
                condition: None,
                when: Condition::Equals {
                    field: "status".to_string(),
                    value: "b".to_string(),
                },
                then: Requirement::RequiredFields {
                    fields: vec!["y".to_string()],
                },
                severity: Severity::Error,
            },
        ];
        let diags = crate::schema::check_conditional_consistency(&rules);
        assert!(!diags.is_empty());
        assert!(diags[0].message.contains("dup"));
    }

    /// Helper: build a Schema with a single traceability rule requiring a forward link.
    fn make_schema_with_forward_traceability_rule() -> Schema {
        let mut file = minimal_schema("test");
        file.artifact_types = vec![ArtifactTypeDef {
            name: "design-decision".to_string(),
            description: "Design decision".to_string(),
            fields: vec![],
            link_fields: vec![],
            aspice_process: None,
            common_mistakes: vec![],
            example: None,
            yaml_section: None,
            yaml_sections: vec![],
            yaml_section_suffix: None,
            shorthand_links: std::collections::BTreeMap::new(),
        }];
        file.traceability_rules = vec![TraceabilityRule {
            name: "dd-needs-satisfies".into(),
            description: "Every design-decision must satisfy a requirement".into(),
            source_type: "design-decision".into(),
            required_link: Some("satisfies".into()),
            required_backlink: None,
            target_types: vec!["requirement".into()],
            from_types: vec![],
            severity: Severity::Error,
            alternate_backlinks: vec![],
        }];
        Schema::merge(&[file])
    }

    // rivet: verifies FEAT-070
    #[test]
    fn draft_artifact_missing_required_link_gets_info_severity() {
        let schema = make_schema_with_forward_traceability_rule();
        let mut store = Store::new();
        // Draft artifact — missing the required 'satisfies' link
        let mut art = minimal_artifact("DD-001", "design-decision");
        art.status = Some("draft".to_string());
        store.insert(art).unwrap();
        let graph = LinkGraph::build(&store, &schema);
        let diags = validate_structural(&store, &schema, &graph);
        let rule_diags: Vec<_> = diags
            .iter()
            .filter(|d| d.rule == "dd-needs-satisfies")
            .collect();
        assert_eq!(rule_diags.len(), 1, "should produce one diagnostic");
        assert_eq!(
            rule_diags[0].severity,
            Severity::Info,
            "draft artifact traceability violation must be Info, not Error"
        );
    }

    // rivet: verifies FEAT-070
    #[test]
    fn active_artifact_missing_required_link_gets_error_severity() {
        let schema = make_schema_with_forward_traceability_rule();
        let mut store = Store::new();
        // Active artifact — missing the required 'satisfies' link
        let mut art = minimal_artifact("DD-002", "design-decision");
        art.status = Some("active".to_string());
        store.insert(art).unwrap();
        let graph = LinkGraph::build(&store, &schema);
        let diags = validate_structural(&store, &schema, &graph);
        let rule_diags: Vec<_> = diags
            .iter()
            .filter(|d| d.rule == "dd-needs-satisfies")
            .collect();
        assert_eq!(rule_diags.len(), 1, "should produce one diagnostic");
        assert_eq!(
            rule_diags[0].severity,
            Severity::Error,
            "active artifact traceability violation must be Error"
        );
    }

    // rivet: verifies FEAT-070
    #[test]
    fn approved_artifact_missing_required_link_gets_error_severity() {
        let schema = make_schema_with_forward_traceability_rule();
        let mut store = Store::new();
        // Approved artifact — missing the required 'satisfies' link
        let mut art = minimal_artifact("DD-003", "design-decision");
        art.status = Some("approved".to_string());
        store.insert(art).unwrap();
        let graph = LinkGraph::build(&store, &schema);
        let diags = validate_structural(&store, &schema, &graph);
        let rule_diags: Vec<_> = diags
            .iter()
            .filter(|d| d.rule == "dd-needs-satisfies")
            .collect();
        assert_eq!(rule_diags.len(), 1, "should produce one diagnostic");
        assert_eq!(
            rule_diags[0].severity,
            Severity::Error,
            "approved artifact traceability violation must be Error"
        );
    }

    // rivet: verifies REQ-023
    #[test]
    fn consistency_detects_overlapping_requirements() {
        let rules = vec![
            ConditionalRule {
                name: "rule-a".to_string(),
                description: None,
                condition: None,
                when: Condition::Equals {
                    field: "status".to_string(),
                    value: "approved".to_string(),
                },
                then: Requirement::RequiredFields {
                    fields: vec!["description".to_string()],
                },
                severity: Severity::Error,
            },
            ConditionalRule {
                name: "rule-b".to_string(),
                description: None,
                condition: None,
                when: Condition::Equals {
                    field: "status".to_string(),
                    value: "approved".to_string(),
                },
                then: Requirement::RequiredFields {
                    fields: vec!["description".to_string(), "rationale".to_string()],
                },
                severity: Severity::Warning,
            },
        ];
        let diags = crate::schema::check_conditional_consistency(&rules);
        assert!(!diags.is_empty());
        assert!(diags[0].message.contains("overlapping"));
    }

    // ── YAML type coercion tests ─────────────────────────────────────────

    /// Helper: build a schema whose single artifact type has a field with
    /// `allowed-values` and a specific `type`.
    fn make_schema_with_allowed_field(
        field_name: &str,
        field_type: &str,
        allowed: Vec<&str>,
    ) -> Schema {
        let mut file = minimal_schema("test");
        file.artifact_types = vec![ArtifactTypeDef {
            name: "test".to_string(),
            description: "Test type".to_string(),
            fields: vec![FieldDef {
                name: field_name.to_string(),
                field_type: field_type.to_string(),
                required: false,
                description: None,
                allowed_values: Some(allowed.into_iter().map(String::from).collect()),
            }],
            link_fields: vec![],
            aspice_process: None,
            common_mistakes: vec![],
            example: None,
            yaml_section: None,
            yaml_sections: vec![],
            yaml_section_suffix: None,
            shorthand_links: std::collections::BTreeMap::new(),
        }];
        Schema::merge(&[file])
    }

    /// Helper: build an artifact whose field holds a raw `serde_yaml::Value`.
    fn make_artifact_with_yaml_field(
        id: &str,
        field_name: &str,
        value: serde_yaml::Value,
    ) -> Artifact {
        let mut a = minimal_artifact(id, "test");
        a.fields.insert(field_name.to_string(), value);
        a
    }

    // rivet: verifies REQ-004
    #[test]
    fn allowed_values_rejects_yaml_bool_not_in_list() {
        // `yes` in YAML 1.1 is parsed as boolean `true`.
        // allowed values are ["draft", "active"] — boolean must be rejected.
        let schema = make_schema_with_allowed_field("priority", "string", vec!["draft", "active"]);
        let mut store = Store::new();
        store
            .insert(make_artifact_with_yaml_field(
                "A-1",
                "priority",
                serde_yaml::Value::Bool(true),
            ))
            .unwrap();
        let graph = LinkGraph::build(&store, &schema);
        let diags = validate_structural(&store, &schema, &graph);

        let av_diags: Vec<_> = diags
            .iter()
            .filter(|d| d.rule == "allowed-values")
            .collect();
        assert_eq!(
            av_diags.len(),
            1,
            "should emit allowed-values diagnostic for boolean not in list"
        );
        assert!(av_diags[0].message.contains("boolean"));
    }

    // rivet: verifies REQ-004
    #[test]
    fn allowed_values_accepts_yaml_bool_when_yes_in_list() {
        // If "yes" is in allowed values, boolean `true` should be accepted.
        let schema = make_schema_with_allowed_field("enabled", "string", vec!["yes", "no"]);
        let mut store = Store::new();
        store
            .insert(make_artifact_with_yaml_field(
                "A-1",
                "enabled",
                serde_yaml::Value::Bool(true),
            ))
            .unwrap();
        let graph = LinkGraph::build(&store, &schema);
        let diags = validate_structural(&store, &schema, &graph);

        let av_diags: Vec<_> = diags
            .iter()
            .filter(|d| d.rule == "allowed-values")
            .collect();
        assert!(
            av_diags.is_empty(),
            "should NOT emit allowed-values when 'yes' is in allowed list for bool true"
        );
    }

    // rivet: verifies REQ-004
    #[test]
    fn allowed_values_accepts_yaml_bool_false_when_no_in_list() {
        let schema = make_schema_with_allowed_field("enabled", "string", vec!["yes", "no"]);
        let mut store = Store::new();
        store
            .insert(make_artifact_with_yaml_field(
                "A-1",
                "enabled",
                serde_yaml::Value::Bool(false),
            ))
            .unwrap();
        let graph = LinkGraph::build(&store, &schema);
        let diags = validate_structural(&store, &schema, &graph);

        let av_diags: Vec<_> = diags
            .iter()
            .filter(|d| d.rule == "allowed-values")
            .collect();
        assert!(
            av_diags.is_empty(),
            "should NOT emit allowed-values when 'no' is in allowed list for bool false"
        );
    }

    // rivet: verifies REQ-004
    #[test]
    fn allowed_values_rejects_yaml_number_not_in_list() {
        let schema = make_schema_with_allowed_field("level", "string", vec!["1", "2", "3"]);
        let mut store = Store::new();
        // serde_yaml parses unquoted `99` as a number
        store
            .insert(make_artifact_with_yaml_field(
                "A-1",
                "level",
                serde_yaml::Value::Number(serde_yaml::Number::from(99)),
            ))
            .unwrap();
        let graph = LinkGraph::build(&store, &schema);
        let diags = validate_structural(&store, &schema, &graph);

        let av_diags: Vec<_> = diags
            .iter()
            .filter(|d| d.rule == "allowed-values")
            .collect();
        assert_eq!(
            av_diags.len(),
            1,
            "should emit allowed-values diagnostic for number not in list"
        );
        assert!(av_diags[0].message.contains("number"));
    }

    // rivet: verifies REQ-004
    #[test]
    fn allowed_values_accepts_yaml_number_when_in_list() {
        let schema = make_schema_with_allowed_field("level", "string", vec!["1", "2", "3"]);
        let mut store = Store::new();
        store
            .insert(make_artifact_with_yaml_field(
                "A-1",
                "level",
                serde_yaml::Value::Number(serde_yaml::Number::from(2)),
            ))
            .unwrap();
        let graph = LinkGraph::build(&store, &schema);
        let diags = validate_structural(&store, &schema, &graph);

        let av_diags: Vec<_> = diags
            .iter()
            .filter(|d| d.rule == "allowed-values")
            .collect();
        assert!(
            av_diags.is_empty(),
            "should NOT emit allowed-values when number string representation is in list"
        );
    }

    // rivet: verifies REQ-004
    #[test]
    fn yaml_type_coercion_warning_for_bool_in_string_field() {
        let schema = make_schema_with_allowed_field("enabled", "string", vec!["yes", "no"]);
        let mut store = Store::new();
        store
            .insert(make_artifact_with_yaml_field(
                "A-1",
                "enabled",
                serde_yaml::Value::Bool(true),
            ))
            .unwrap();
        let graph = LinkGraph::build(&store, &schema);
        let diags = validate_structural(&store, &schema, &graph);

        let coercion_diags: Vec<_> = diags
            .iter()
            .filter(|d| d.rule == "yaml-type-coercion")
            .collect();
        assert_eq!(
            coercion_diags.len(),
            1,
            "should emit yaml-type-coercion warning for bool in string field"
        );
        assert!(coercion_diags[0].message.contains("boolean"));
        assert!(coercion_diags[0].message.contains("quoting"));
        assert_eq!(coercion_diags[0].severity, Severity::Warning);
    }

    // rivet: verifies REQ-004
    #[test]
    fn yaml_type_coercion_warning_for_number_in_string_field() {
        let schema = make_schema_with_allowed_field("level", "string", vec!["1", "2", "3"]);
        let mut store = Store::new();
        store
            .insert(make_artifact_with_yaml_field(
                "A-1",
                "level",
                serde_yaml::Value::Number(serde_yaml::Number::from(2)),
            ))
            .unwrap();
        let graph = LinkGraph::build(&store, &schema);
        let diags = validate_structural(&store, &schema, &graph);

        let coercion_diags: Vec<_> = diags
            .iter()
            .filter(|d| d.rule == "yaml-type-coercion")
            .collect();
        assert_eq!(
            coercion_diags.len(),
            1,
            "should emit yaml-type-coercion warning for number in string field"
        );
        assert!(coercion_diags[0].message.contains("number"));
        assert!(coercion_diags[0].message.contains("quoting"));
        assert_eq!(coercion_diags[0].severity, Severity::Warning);
    }

    // rivet: verifies REQ-004
    #[test]
    fn no_coercion_warning_for_non_string_field_type() {
        // When the field type is "boolean" (not "string"), we should NOT emit
        // the yaml-type-coercion warning — the YAML type matches the schema intent.
        let schema = make_schema_with_allowed_field("flag", "boolean", vec!["true", "false"]);
        let mut store = Store::new();
        store
            .insert(make_artifact_with_yaml_field(
                "A-1",
                "flag",
                serde_yaml::Value::Bool(true),
            ))
            .unwrap();
        let graph = LinkGraph::build(&store, &schema);
        let diags = validate_structural(&store, &schema, &graph);

        let coercion_diags: Vec<_> = diags
            .iter()
            .filter(|d| d.rule == "yaml-type-coercion")
            .collect();
        assert!(
            coercion_diags.is_empty(),
            "should NOT emit coercion warning when field type is boolean"
        );
    }

    // ── Cross-consumer semantics: validate vs coverage on empty target/from types ──

    /// Before the Mythos fix, `validate::validate` and `coverage::compute_coverage`
    /// disagreed on rules where `target-types` / `from-types` were empty:
    ///
    /// - validate: empty ⇒ "match nothing" (false-positive violation)
    /// - coverage: empty ⇒ "match any"      (reports fully covered)
    ///
    /// This test pins that they must never contradict each other on the same
    /// schema + artifact set.
    ///
    /// rivet: fixes REQ-004 verifies REQ-010
    #[test]
    fn validate_and_coverage_agree_on_empty_target_types_forward_rule() {
        // A traceability rule with `required-link` but no `target-types` — the
        // ambiguous shape that caused the contradiction.
        let mut file = minimal_schema("test");
        file.artifact_types = vec![
            ArtifactTypeDef {
                name: "design-decision".to_string(),
                description: "DD".to_string(),
                fields: vec![],
                link_fields: vec![],
                aspice_process: None,
                common_mistakes: vec![],
                example: None,
                yaml_section: None,
                yaml_sections: vec![],
                yaml_section_suffix: None,
                shorthand_links: std::collections::BTreeMap::new(),
            },
            ArtifactTypeDef {
                name: "requirement".to_string(),
                description: "REQ".to_string(),
                fields: vec![],
                link_fields: vec![],
                aspice_process: None,
                common_mistakes: vec![],
                example: None,
                yaml_section: None,
                yaml_sections: vec![],
                yaml_section_suffix: None,
                shorthand_links: std::collections::BTreeMap::new(),
            },
        ];
        file.traceability_rules = vec![TraceabilityRule {
            name: "dd-needs-satisfies-any".into(),
            description: "Every DD must satisfy something".into(),
            source_type: "design-decision".into(),
            required_link: Some("satisfies".into()),
            required_backlink: None,
            target_types: vec![], // empty — the ambiguous case
            from_types: vec![],
            severity: Severity::Error,
            alternate_backlinks: vec![],
        }];
        let schema = Schema::merge(&[file]);

        let mut store = Store::new();
        let mut dd = minimal_artifact("DD-001", "design-decision");
        dd.status = Some("approved".to_string());
        dd.links = vec![Link {
            link_type: "satisfies".to_string(),
            target: "REQ-001".to_string(),
        }];
        store.insert(dd).unwrap();
        store
            .insert(minimal_artifact("REQ-001", "requirement"))
            .unwrap();

        let graph = LinkGraph::build(&store, &schema);
        let diags = validate_structural(&store, &schema, &graph);
        let rule_diags: Vec<_> = diags
            .iter()
            .filter(|d| d.rule == "dd-needs-satisfies-any")
            .collect();

        let coverage = crate::coverage::compute_coverage(&store, &schema, &graph);
        let entry = coverage
            .entries
            .iter()
            .find(|e| e.rule_name == "dd-needs-satisfies-any")
            .expect("rule should produce a coverage entry");

        // DD-001 has a satisfies link to REQ-001. Both tools must agree.
        let validate_says_covered = rule_diags.is_empty();
        let coverage_says_covered = entry.covered == entry.total && entry.total > 0;
        assert_eq!(
            validate_says_covered, coverage_says_covered,
            "validate and coverage must agree (validate_covered={}, coverage={}/{})",
            validate_says_covered, entry.covered, entry.total
        );
    }

    /// Same contradiction test but for the backlink path (empty `from-types`).
    ///
    /// rivet: fixes REQ-004 verifies REQ-010
    #[test]
    fn validate_and_coverage_agree_on_empty_from_types_backlink_rule() {
        let mut file = minimal_schema("test");
        file.artifact_types = vec![
            ArtifactTypeDef {
                name: "requirement".to_string(),
                description: "REQ".to_string(),
                fields: vec![],
                link_fields: vec![],
                aspice_process: None,
                common_mistakes: vec![],
                example: None,
                yaml_section: None,
                yaml_sections: vec![],
                yaml_section_suffix: None,
                shorthand_links: std::collections::BTreeMap::new(),
            },
            ArtifactTypeDef {
                name: "design-decision".to_string(),
                description: "DD".to_string(),
                fields: vec![],
                link_fields: vec![],
                aspice_process: None,
                common_mistakes: vec![],
                example: None,
                yaml_section: None,
                yaml_sections: vec![],
                yaml_section_suffix: None,
                shorthand_links: std::collections::BTreeMap::new(),
            },
        ];
        file.traceability_rules = vec![TraceabilityRule {
            name: "req-backlinked-by-any".into(),
            description: "Every req must be satisfied by something".into(),
            source_type: "requirement".into(),
            required_link: None,
            required_backlink: Some("satisfies".into()),
            target_types: vec![],
            from_types: vec![], // empty — the ambiguous case
            severity: Severity::Error,
            alternate_backlinks: vec![],
        }];
        let schema = Schema::merge(&[file]);

        let mut store = Store::new();
        store
            .insert(minimal_artifact("REQ-001", "requirement"))
            .unwrap();
        let mut dd = minimal_artifact("DD-001", "design-decision");
        dd.status = Some("approved".to_string());
        dd.links = vec![Link {
            link_type: "satisfies".to_string(),
            target: "REQ-001".to_string(),
        }];
        store.insert(dd).unwrap();

        let graph = LinkGraph::build(&store, &schema);
        let diags = validate_structural(&store, &schema, &graph);
        let rule_diags: Vec<_> = diags
            .iter()
            .filter(|d| d.rule == "req-backlinked-by-any")
            .collect();

        let coverage = crate::coverage::compute_coverage(&store, &schema, &graph);
        let entry = coverage
            .entries
            .iter()
            .find(|e| e.rule_name == "req-backlinked-by-any")
            .expect("rule should produce a coverage entry");

        let validate_says_covered = rule_diags.is_empty();
        let coverage_says_covered = entry.covered == entry.total && entry.total > 0;
        assert_eq!(
            validate_says_covered, coverage_says_covered,
            "validate and coverage must agree (validate_covered={}, coverage={}/{})",
            validate_says_covered, entry.covered, entry.total
        );
    }

    // ── Mutation-pinning tests for link cardinality ────────────────────
    //
    // Each test pins one or more surviving mutants in
    // `validate_structural`'s cardinality-and-target-type block (lines
    // 296-345). Strategy: build a schema that defines exactly one
    // link_field with a chosen cardinality, then drive the artifact's
    // link count to each interesting boundary.

    /// Schema with a single artifact type "test" that has one link
    /// field "satisfies" with the given cardinality and `required` flag.
    /// Target type is "tgt".
    fn cardinality_schema(card: Cardinality, required: bool) -> Schema {
        let mut file = minimal_schema("test");
        file.artifact_types = vec![
            ArtifactTypeDef {
                name: "test".to_string(),
                description: String::new(),
                fields: vec![],
                link_fields: vec![LinkFieldDef {
                    name: "satisfies".to_string(),
                    link_type: "satisfies".to_string(),
                    target_types: vec!["tgt".to_string()],
                    required,
                    cardinality: card,
                    description: None,
                }],
                aspice_process: None,
                common_mistakes: vec![],
                example: None,
                yaml_section: None,
                yaml_sections: vec![],
                yaml_section_suffix: None,
                shorthand_links: std::collections::BTreeMap::new(),
            },
            ArtifactTypeDef {
                name: "tgt".to_string(),
                description: String::new(),
                fields: vec![],
                link_fields: vec![],
                aspice_process: None,
                common_mistakes: vec![],
                example: None,
                yaml_section: None,
                yaml_sections: vec![],
                yaml_section_suffix: None,
                shorthand_links: std::collections::BTreeMap::new(),
            },
        ];
        Schema::merge(&[file])
    }

    fn link(target: &str) -> Link {
        Link {
            link_type: "satisfies".to_string(),
            target: target.to_string(),
        }
    }

    /// Build a Store + LinkGraph from the artifact under test plus
    /// some target artifacts.
    fn run_validate(
        schema: &Schema,
        artifact: Artifact,
        targets: Vec<Artifact>,
    ) -> Vec<Diagnostic> {
        let mut store = Store::new();
        store.insert(artifact).unwrap();
        for t in targets {
            store.insert(t).unwrap();
        }
        let graph = LinkGraph::build(&store, schema);
        validate_structural(&store, schema, &graph)
    }

    fn rule_count(diags: &[Diagnostic], rule: &str) -> usize {
        diags.iter().filter(|d| d.rule == rule).count()
    }

    // Verifies: REQ-004
    // Kills:
    //   validate.rs:297:44 replace match guard `count != 1` with true/false
    //   validate.rs:297:50 replace `!=` with `==`
    //   validate.rs:293:41 replace `==` with `!=`  (link_type filter)
    #[test]
    fn cardinality_exactly_one_distinguishes_zero_one_two() {
        let schema = cardinality_schema(Cardinality::ExactlyOne, false);
        let targets = vec![
            minimal_artifact("T-1", "tgt"),
            minimal_artifact("T-2", "tgt"),
        ];

        // 0 links: must produce a diagnostic.
        let art_0 = make_artifact("A", "test", None, None, vec![], vec![]);
        let d0 = run_validate(&schema, art_0, targets.clone());
        assert_eq!(
            rule_count(&d0, "cardinality"),
            1,
            "ExactlyOne with 0 links must emit cardinality diagnostic; \
             mutating `count != 1` -> true would emit when count is 1; \
             mutating it to false would never emit",
        );

        // 1 link: must NOT produce a diagnostic.
        let art_1 = make_artifact("A", "test", None, None, vec![], vec![link("T-1")]);
        let d1 = run_validate(&schema, art_1, targets.clone());
        assert_eq!(
            rule_count(&d1, "cardinality"),
            0,
            "ExactlyOne with 1 link must NOT emit; mutant `count != 1` -> \
             true would emit anyway",
        );

        // 2 links: must produce a diagnostic.
        let art_2 = make_artifact(
            "A",
            "test",
            None,
            None,
            vec![],
            vec![link("T-1"), link("T-2")],
        );
        let d2 = run_validate(&schema, art_2, targets);
        assert_eq!(
            rule_count(&d2, "cardinality"),
            1,
            "ExactlyOne with 2 links must emit; mutant `count != 1` -> false \
             would not emit. Also pins `==` -> `!=` on link_type filter \
             which would mis-count.",
        );
    }

    // Verifies: REQ-004
    // Kills:
    //   validate.rs:311:43 replace match guard `count == 0 && link_field.required` with true/false
    //   validate.rs:311:49 replace `==` with `!=`
    //   validate.rs:311:54 replace `&&` with `||`
    #[test]
    fn cardinality_one_or_many_only_emits_when_required_and_zero() {
        // required=true: 0 links → emit; 1 link → no emit.
        let schema_req = cardinality_schema(Cardinality::OneOrMany, true);
        let targets = vec![minimal_artifact("T-1", "tgt")];

        let art_zero = make_artifact("A", "test", None, None, vec![], vec![]);
        let d_zero_req = run_validate(&schema_req, art_zero.clone(), targets.clone());
        assert_eq!(
            rule_count(&d_zero_req, "cardinality"),
            1,
            "OneOrMany required=true with 0 links must emit; \
             mutating `count == 0` -> false would not emit; \
             mutating the entire guard to false would also not emit",
        );

        let art_one = make_artifact("A", "test", None, None, vec![], vec![link("T-1")]);
        let d_one_req = run_validate(&schema_req, art_one, targets.clone());
        assert_eq!(
            rule_count(&d_one_req, "cardinality"),
            0,
            "OneOrMany required=true with 1 link must not emit; \
             mutating guard to true would emit; \
             mutating `==` -> `!=` would emit when count != 0",
        );

        // required=false: 0 links → must NOT emit (the && short-circuits).
        let schema_nonreq = cardinality_schema(Cardinality::OneOrMany, false);
        let d_zero_nonreq = run_validate(&schema_nonreq, art_zero, targets);
        assert_eq!(
            rule_count(&d_zero_nonreq, "cardinality"),
            0,
            "OneOrMany required=false with 0 links must not emit; \
             mutating `&&` -> `||` would emit even though required=false",
        );
    }

    // Verifies: REQ-004
    // Kills:
    //   validate.rs:325:43 replace match guard `count > 1` with true/false
    //   validate.rs:325:49 replace `>` with `==`/`<`/`>=`
    #[test]
    fn cardinality_zero_or_one_distinguishes_zero_one_two() {
        let schema = cardinality_schema(Cardinality::ZeroOrOne, false);
        let targets = vec![
            minimal_artifact("T-1", "tgt"),
            minimal_artifact("T-2", "tgt"),
        ];

        // 0 links: must NOT emit.
        let art_0 = make_artifact("A", "test", None, None, vec![], vec![]);
        assert_eq!(
            rule_count(
                &run_validate(&schema, art_0, targets.clone()),
                "cardinality",
            ),
            0,
            "ZeroOrOne with 0 links must not emit; mutant `count > 1` -> \
             true / `>` -> `>=` would emit",
        );

        // 1 link: must NOT emit.
        let art_1 = make_artifact("A", "test", None, None, vec![], vec![link("T-1")]);
        assert_eq!(
            rule_count(
                &run_validate(&schema, art_1, targets.clone()),
                "cardinality",
            ),
            0,
            "ZeroOrOne with 1 link must not emit; mutant `>` -> `==` (i.e. \
             count == 1) would falsely emit; mutant `>` -> `>=` would too",
        );

        // 2 links: must emit.
        let art_2 = make_artifact(
            "A",
            "test",
            None,
            None,
            vec![],
            vec![link("T-1"), link("T-2")],
        );
        assert_eq!(
            rule_count(&run_validate(&schema, art_2, targets), "cardinality"),
            1,
            "ZeroOrOne with 2 links must emit; mutant `count > 1` -> false / \
             `>` -> `<` would not emit",
        );
    }

    // Verifies: REQ-004
    // Kills:
    //   validate.rs:344:35 replace `!=` with `==` in link target-type loop
    //   validate.rs:348:24 delete `!` (target_types.is_empty())
    //   validate.rs:349:25 replace `&&` with `||`
    //   validate.rs:349:28 delete `!` (target_types.contains)
    #[test]
    fn link_target_type_filter_pins_inequality_and_negations() {
        let schema = cardinality_schema(Cardinality::ExactlyOne, false);
        // Wrong-type target: should emit a "link-target-type" diagnostic.
        // Right-type target: should not.
        let wrong_target = make_artifact("T-WRONG", "test", None, None, vec![], vec![]);
        let right_target = minimal_artifact("T-RIGHT", "tgt");

        // Artifact links to wrong type.
        let art_wrong = make_artifact("A", "test", None, None, vec![], vec![link("T-WRONG")]);
        let diags = run_validate(&schema, art_wrong, vec![wrong_target.clone()]);
        assert_eq!(
            rule_count(&diags, "link-target-type"),
            1,
            "wrong-type target must produce link-target-type diagnostic; \
             mutating `!= -> ==` on the link_type filter would skip the \
             check; deleting `!` on `target_types.is_empty()` would treat \
             the type list as empty and admit any target",
        );

        // Artifact links to right type → no link-target-type diagnostic.
        let art_right = make_artifact("A", "test", None, None, vec![], vec![link("T-RIGHT")]);
        let diags = run_validate(&schema, art_right, vec![right_target]);
        assert_eq!(
            rule_count(&diags, "link-target-type"),
            0,
            "right-type target must NOT produce link-target-type diagnostic; \
             mutating `&& -> ||` or deleting `!` on `target_types.contains` \
             would emit incorrectly",
        );
    }

    // Verifies: REQ-004
    // Kills:
    //   validate.rs:81:9 replace Diagnostic::fmt -> Ok(Default::default())
    #[test]
    fn diagnostic_display_writes_message() {
        let d = Diagnostic::new(
            Severity::Error,
            Some("REQ-001".to_string()),
            "rule-name",
            "the message",
        );
        let s = format!("{d}");
        // Mutant returns Ok(()) and writes nothing — would be empty.
        assert!(!s.is_empty(), "Diagnostic Display must not be empty");
        assert!(s.contains("the message"));
    }

    /// Schema with a single artifact type "test" that has the given fields.
    fn schema_with_fields(fields: Vec<FieldDef>) -> Schema {
        let mut file = minimal_schema("test");
        file.artifact_types = vec![ArtifactTypeDef {
            name: "test".to_string(),
            description: String::new(),
            fields,
            link_fields: vec![],
            aspice_process: None,
            common_mistakes: vec![],
            example: None,
            yaml_section: None,
            yaml_sections: vec![],
            yaml_section_suffix: None,
            shorthand_links: std::collections::BTreeMap::new(),
        }];
        Schema::merge(&[file])
    }

    fn required_field(name: &str) -> FieldDef {
        FieldDef {
            name: name.to_string(),
            field_type: "string".to_string(),
            required: true,
            description: None,
            allowed_values: None,
        }
    }

    // Verifies: REQ-004
    // Kills:
    //   validate.rs:170:31 replace `&&` with `||`
    //   validate.rs:170:34 delete `!` on `!artifact.fields.contains_key(...)`
    //   validate.rs:177:20 delete `!` on `!has_base`
    //   validate.rs:173:21 delete match arm "description"
    //   validate.rs:174:21 delete match arm "status"
    #[test]
    fn required_field_check_distinguishes_present_and_missing() {
        // Case A: field is required and missing → emit "required-field".
        let schema = schema_with_fields(vec![required_field("safety")]);
        let art_missing = make_artifact("A", "test", None, None, vec![], vec![]);
        let d_missing = run_validate(&schema, art_missing, vec![]);
        assert_eq!(
            rule_count(&d_missing, "required-field"),
            1,
            "missing required field must emit; mutating `&&` -> `||` would \
             also emit (so this case alone doesn't pin), but together with \
             case B below that mutant flips behaviour",
        );

        // Case B: field is required and present → NO diagnostic.
        let art_present =
            make_artifact("A", "test", None, None, vec![("safety", "ASIL_B")], vec![]);
        let d_present = run_validate(&schema, art_present, vec![]);
        assert_eq!(
            rule_count(&d_present, "required-field"),
            0,
            "required field that is present must NOT emit; mutating `!` \
             on contains_key (line 170:34) flips: would emit when field is \
             present. Mutating `&&` -> `||` (line 170:31) makes the guard \
             enter even when field.required=false, also wrong here.",
        );

        // Case C: required field "description" is satisfied by the
        // top-level Artifact.description rather than fields map.
        let schema_desc = schema_with_fields(vec![required_field("description")]);
        let art_desc = make_artifact(
            "A",
            "test",
            None,
            Some("a real description"),
            vec![],
            vec![],
        );
        let d_desc = run_validate(&schema_desc, art_desc, vec![]);
        assert_eq!(
            rule_count(&d_desc, "required-field"),
            0,
            "description on the artifact itself must satisfy a required \
             'description' field. Mutating `delete match arm \"description\"` \
             (line 173) drops the special case — has_base becomes false, \
             diagnostic gets emitted. Mutating `delete !` on `!has_base` \
             (line 177) inverts the gate — diagnostic gets emitted.",
        );

        // Case D: required "status" satisfied by the top-level status.
        let schema_status = schema_with_fields(vec![required_field("status")]);
        let art_status = make_artifact("A", "test", Some("approved"), None, vec![], vec![]);
        let d_status = run_validate(&schema_status, art_status, vec![]);
        assert_eq!(
            rule_count(&d_status, "required-field"),
            0,
            "status on the artifact must satisfy a required 'status' field; \
             mutating `delete match arm \"status\"` (line 174) breaks this.",
        );
    }

    // Verifies: REQ-004
    // Kills:
    //   validate.rs:198:28 delete `!` on `!allowed.iter().any(...)`
    //   validate.rs:198:54 replace `==` with `!=`
    #[test]
    fn allowed_values_string_check_distinguishes_in_and_out_of_set() {
        // Field with explicit allowed-values list.
        let schema = schema_with_fields(vec![FieldDef {
            name: "safety".to_string(),
            field_type: "string".to_string(),
            required: false,
            description: None,
            allowed_values: Some(vec!["ASIL_A".into(), "ASIL_B".into()]),
        }]);

        // Out-of-set value → emit "allowed-values".
        let art_bad = make_artifact("A", "test", None, None, vec![("safety", "ASIL_X")], vec![]);
        let d_bad = run_validate(&schema, art_bad, vec![]);
        assert_eq!(
            rule_count(&d_bad, "allowed-values"),
            1,
            "out-of-set value must emit; deleting `!` on `!any(==)` (line \
             198:28) would emit only when value IS in set; replacing `==` \
             with `!=` (line 198:54) would treat any non-equal item as \
             matching, so the inner closure becomes \"any inequality\" — \
             with multiple allowed values, that's true for at least one, \
             so the outer .any() returns true and the negation skips emit",
        );

        // In-set value → no diagnostic.
        let art_good = make_artifact("A", "test", None, None, vec![("safety", "ASIL_B")], vec![]);
        let d_good = run_validate(&schema, art_good, vec![]);
        assert_eq!(
            rule_count(&d_good, "allowed-values"),
            0,
            "in-set value must not emit; replacing `==` with `!=` would \
             flip the per-item check and emit incorrectly",
        );
    }

    // Verifies: REQ-004
    // Kills:
    //   validate.rs:523:5 replace validate_documents -> Vec<Diagnostic> with vec![]
    //   validate.rs:527:16 delete `!` in validate_documents (would invert
    //     the missing-id check)
    #[test]
    fn validate_documents_emits_for_unknown_artifact_reference() {
        // validate_documents flags documents that reference artifact IDs
        // not present in the store. Build a doc store containing one
        // reference to a non-existent ID.
        use crate::document::{DocReference, Document, DocumentStore};
        use std::collections::BTreeMap;
        let mut docs = DocumentStore::new();
        let doc = Document {
            id: "DOC-1".to_string(),
            doc_type: "document".to_string(),
            title: "Test Doc".to_string(),
            status: None,
            glossary: BTreeMap::new(),
            body: String::new(),
            sections: vec![],
            references: vec![DocReference {
                artifact_id: "MISSING".to_string(),
                line: 1,
                col: 0,
                byte_offset: 0,
                len: 11,
            }],
            source_file: None,
        };
        docs.insert(doc);
        let store = Store::new();
        let diags = validate_documents(&docs, &store);
        // Mutant `vec![]` returns zero diagnostics regardless of input.
        // Mutant `delete !` flips the check: would emit only when the
        // reference IS present, i.e. zero in this case.
        assert_eq!(
            diags.len(),
            1,
            "validate_documents must emit exactly one diagnostic for a \
             reference to a missing artifact",
        );
        assert_eq!(diags[0].rule, "doc-broken-ref");
    }

    // --- prose-mention-without-typed-link (issue #207) ---
    //
    // Helper: build a two-artifact store where `description_of_a` is
    // arbitrary prose attached to A-1, and B-1 is a target that may or
    // may not be referenced by a typed link. Returns just the prose-
    // mention diagnostics filtered out of a full validation pass.
    fn prose_mention_diags(
        description_of_a: Option<&str>,
        a_fields: Vec<(&str, &str)>,
        a_links: Vec<Link>,
    ) -> Vec<Diagnostic> {
        use crate::store::Store;

        let schema_file = minimal_schema("test");
        let schema = Schema::merge(&[schema_file]);

        let a = make_artifact("A-1", "test", None, description_of_a, a_fields, a_links);
        let b = make_artifact("B-1", "test", None, None, vec![], vec![]);

        let mut store = Store::new();
        store.insert(a).unwrap();
        store.insert(b).unwrap();
        let graph = LinkGraph::build(&store, &schema);

        crate::validate::validate(&store, &schema, &graph)
            .into_iter()
            .filter(|d| d.rule == "prose-mention-without-typed-link")
            .collect()
    }

    // rivet: verifies REQ-004
    #[test]
    fn prose_mention_warns_when_no_typed_link() {
        let diags = prose_mention_diags(Some("This artifact relates to B-1."), vec![], vec![]);
        assert_eq!(diags.len(), 1, "expected one warning, got {diags:?}");
        assert_eq!(diags[0].severity, Severity::Warning);
        assert_eq!(diags[0].artifact_id.as_deref(), Some("A-1"));
        assert!(
            diags[0].message.contains("B-1"),
            "message should name the mentioned id: {}",
            diags[0].message
        );
    }

    // rivet: verifies REQ-004
    #[test]
    fn prose_mention_suppressed_when_typed_link_present() {
        let diags = prose_mention_diags(
            Some("This artifact relates to B-1."),
            vec![],
            vec![Link {
                link_type: "satisfies".to_string(),
                target: "B-1".to_string(),
            }],
        );
        assert!(
            diags.is_empty(),
            "typed link to B-1 must suppress prose-mention warning, got {diags:?}"
        );
    }

    // rivet: verifies REQ-004
    #[test]
    fn prose_mention_suppressed_when_self_reference() {
        let diags = prose_mention_diags(
            Some("This artifact, A-1, is the canonical example."),
            vec![],
            vec![],
        );
        assert!(
            diags.is_empty(),
            "self-id mention must not warn, got {diags:?}"
        );
    }

    // rivet: verifies REQ-004
    #[test]
    fn prose_mention_suppressed_when_id_does_not_resolve() {
        // GHOST-999 is not in the store; broken-ref handling is a
        // separate concern, not this rule's job.
        let diags = prose_mention_diags(Some("Unlike GHOST-999, this works."), vec![], vec![]);
        assert!(
            diags.is_empty(),
            "unresolved id must not warn, got {diags:?}"
        );
    }

    // rivet: verifies REQ-004
    #[test]
    fn prose_mention_scans_string_field_values() {
        // The mention is in a string-typed `fields` value, not in
        // `description`. Should still warn.
        let diags = prose_mention_diags(
            None,
            vec![("rationale", "Decided like B-1 was decided.")],
            vec![],
        );
        assert_eq!(diags.len(), 1, "expected one warning, got {diags:?}");
        assert!(diags[0].message.contains("B-1"));
    }

    // rivet: verifies REQ-004
    #[test]
    fn prose_mention_dedupes_per_id_per_artifact() {
        // Three mentions of B-1 in the same description must yield
        // exactly one warning, matching the unknown-link-type pass's
        // per-(artifact, link-type) dedup policy.
        let diags = prose_mention_diags(
            Some("B-1 here. B-1 again. And once more: B-1."),
            vec![],
            vec![],
        );
        assert_eq!(
            diags.len(),
            1,
            "repeated mentions of one id must dedupe, got {diags:?}"
        );
    }

    // ── Validation rules / status gates (phase 9) ───────────────────────

    /// End-to-end: a V-model status gate rule fires for a verification
    /// whose `verifies` target is draft, but stays silent for a clean
    /// verifier. Also exercises the `{id}` / `{type}` / `{status}`
    /// message-template substitution.
    #[test]
    #[cfg_attr(miri, ignore)]
    fn validation_rule_status_gate_end_to_end() {
        use crate::links::LinkGraph;
        use crate::model::{Artifact, Link};
        use crate::schema::{MissingTargetPolicyName, Severity, ValidationRule};
        use std::collections::BTreeMap;

        fn req(id: &str, status: &str) -> Artifact {
            Artifact {
                id: id.into(),
                artifact_type: "requirement".into(),
                title: format!("Title {id}"),
                description: None,
                status: Some(status.into()),
                tags: vec![],
                links: vec![],
                fields: BTreeMap::new(),
                provenance: None,
                source_file: None,
            }
        }
        fn verifier(id: &str, status: &str, target: &str) -> Artifact {
            Artifact {
                id: id.into(),
                artifact_type: "sys-verification".into(),
                title: format!("Verifier {id}"),
                description: None,
                status: Some(status.into()),
                tags: vec![],
                links: vec![Link {
                    link_type: "verifies".into(),
                    target: target.into(),
                }],
                fields: BTreeMap::new(),
                provenance: None,
                source_file: None,
            }
        }

        let req_ok = req("REQ-001", "approved");
        let req_draft = req("REQ-002", "draft");
        let v_clean = verifier("V-001", "approved", "REQ-001");
        let v_bad = verifier("V-002", "approved", "REQ-002");

        let mut store = Store::default();
        for a in [
            req_ok.clone(),
            req_draft.clone(),
            v_clean.clone(),
            v_bad.clone(),
        ] {
            store.upsert(a);
        }

        let rule = ValidationRule {
            id: "V-verif-needs-approved-req".into(),
            description: None,
            rule: r#"
                (implies
                  (and (= type "sys-verification")
                       (= status "approved"))
                  (forall-linked "verifies" (= status "approved")))
            "#
            .into(),
            on_unresolved: MissingTargetPolicyName::default(),
            draft_downgrade: false,
            severity: Severity::Error,
            message: Some(
                "{id} ({type}) is {status} but verifies a non-approved requirement".into(),
            ),
        };

        let mut schema = Schema::merge(&[]);
        schema.validation_rules.push(rule);
        let graph = LinkGraph::build(&store, &schema);

        let diags = validate(&store, &schema, &graph);
        let gate_diags: Vec<_> = diags
            .iter()
            .filter(|d| d.rule == "V-verif-needs-approved-req")
            .collect();

        assert_eq!(
            gate_diags.len(),
            1,
            "exactly one violation expected (V-002 -> REQ-002[draft]); got {gate_diags:?}"
        );
        let d = gate_diags[0];
        assert_eq!(d.severity, Severity::Error);
        assert_eq!(d.artifact_id.as_deref(), Some("V-002"));
        assert!(d.message.contains("V-002"), "{:?}", d.message);
        assert!(d.message.contains("sys-verification"), "{:?}", d.message);
        assert!(d.message.contains("approved"), "{:?}", d.message);
    }

    /// A rule with a malformed s-expression body emits a rule-level
    /// diagnostic rather than panicking or silently passing every artifact.
    #[test]
    #[cfg_attr(miri, ignore)]
    fn validation_rule_parse_error_surfaces_diagnostic() {
        use crate::schema::{Severity, ValidationRule};

        let store = Store::default();
        let mut schema = Schema::merge(&[]);
        schema.validation_rules.push(ValidationRule {
            id: "broken-rule".into(),
            description: None,
            rule: "(unclosed".into(), // syntax error
            on_unresolved: Default::default(),
            draft_downgrade: false,
            severity: Severity::Error,
            message: None,
        });
        let graph = crate::links::LinkGraph::build(&store, &schema);

        let diags = validate(&store, &schema, &graph);
        let rule_err: Vec<_> = diags.iter().filter(|d| d.rule == "broken-rule").collect();
        assert_eq!(
            rule_err.len(),
            1,
            "parse error must surface as exactly one diagnostic; got {rule_err:?}"
        );
        assert_eq!(rule_err[0].severity, Severity::Error);
        assert!(
            rule_err[0].message.contains("malformed"),
            "{:?}",
            rule_err[0].message
        );
    }

    /// `draft-downgrade: true` causes violations on `status: draft`
    /// artifacts to render at Info instead of the declared severity.
    /// Without the flag, drafts fire at full severity.
    #[test]
    #[cfg_attr(miri, ignore)]
    fn validation_rule_draft_downgrade_opt_in() {
        use crate::links::LinkGraph;
        use crate::model::Artifact;
        use crate::schema::{Severity, ValidationRule};
        use std::collections::BTreeMap;

        let mut art = Artifact {
            id: "X-001".into(),
            artifact_type: "thing".into(),
            title: "T".into(),
            description: None,
            status: Some("draft".into()),
            tags: vec![],
            links: vec![],
            fields: BTreeMap::new(),
            provenance: None,
            source_file: None,
        };

        let mut store = Store::default();
        store.upsert(art.clone());

        // The rule always fails (BoolLit(false) shape via `(not true)`).
        let make_rule = |id: &str, downgrade: bool| ValidationRule {
            id: id.into(),
            description: None,
            rule: "(not true)".into(),
            on_unresolved: Default::default(),
            draft_downgrade: downgrade,
            severity: Severity::Error,
            message: None,
        };

        // Without draft-downgrade: error.
        let mut schema = Schema::merge(&[]);
        schema
            .validation_rules
            .push(make_rule("always-fail-no-dd", false));
        let graph = LinkGraph::build(&store, &schema);
        let diags = validate(&store, &schema, &graph);
        let d = diags
            .iter()
            .find(|d| d.rule == "always-fail-no-dd")
            .expect("rule must fire");
        assert_eq!(d.severity, Severity::Error);

        // With draft-downgrade: info (because artifact is draft).
        let mut schema = Schema::merge(&[]);
        schema
            .validation_rules
            .push(make_rule("always-fail-dd", true));
        let graph = LinkGraph::build(&store, &schema);
        let diags = validate(&store, &schema, &graph);
        let d = diags
            .iter()
            .find(|d| d.rule == "always-fail-dd")
            .expect("rule must fire");
        assert_eq!(d.severity, Severity::Info);

        // With draft-downgrade but non-draft artifact: still error.
        art.status = Some("approved".into());
        let mut store2 = Store::default();
        store2.upsert(art);
        let mut schema = Schema::merge(&[]);
        schema
            .validation_rules
            .push(make_rule("always-fail-dd-approved", true));
        let graph = LinkGraph::build(&store2, &schema);
        let diags = validate(&store2, &schema, &graph);
        let d = diags
            .iter()
            .find(|d| d.rule == "always-fail-dd-approved")
            .expect("rule must fire");
        assert_eq!(d.severity, Severity::Error);
    }

    // ── Phase interactions — broken links, rule merge, severity ─────────

    /// A broken link (target doesn't exist) under `on-unresolved: skip`
    /// must produce exactly ONE diagnostic — the existing phase-6
    /// `broken-link` finding — and the validation-rule must stay silent
    /// (vacuous-true for that link).
    #[test]
    #[cfg_attr(miri, ignore)]
    fn skip_policy_lets_broken_links_phase_handle_breakage_alone() {
        use crate::links::LinkGraph;
        use crate::model::{Artifact, Link};
        use crate::schema::{MissingTargetPolicyName, Severity, ValidationRule};
        use std::collections::BTreeMap;

        // Verifier points at a target that doesn't exist in the store.
        let verifier = Artifact {
            id: "V-001".into(),
            artifact_type: "sys-verification".into(),
            title: "V".into(),
            description: None,
            status: Some("approved".into()),
            tags: vec![],
            links: vec![Link {
                link_type: "verifies".into(),
                target: "REQ-MISSING".into(),
            }],
            fields: BTreeMap::new(),
            provenance: None,
            source_file: None,
        };

        let mut store = Store::default();
        store.upsert(verifier);

        let mut schema = Schema::merge(&[]);
        schema.validation_rules.push(ValidationRule {
            id: "V-needs-approved-req".into(),
            description: None,
            rule: r#"
                (implies (= type "sys-verification")
                  (forall-linked "verifies" (= status "approved")))
            "#
            .into(),
            on_unresolved: MissingTargetPolicyName::Skip,
            draft_downgrade: false,
            severity: Severity::Error,
            message: None,
        });
        let graph = LinkGraph::build(&store, &schema);
        let diags = validate(&store, &schema, &graph);

        // Phase 6: broken-link fires.
        let broken: Vec<_> = diags.iter().filter(|d| d.rule == "broken-link").collect();
        assert_eq!(
            broken.len(),
            1,
            "expected exactly one broken-link diagnostic"
        );

        // Phase 9: status-gate must stay silent (Skip → vacuous-true on
        // unresolved + the only outbound link is unresolved → audit-strict
        // false. Wait, that would fire. Let me think again).
        //
        // Actually: forall-linked over 1 unresolved link with Skip policy
        // contributes vacuous-true. The full set of resolvable targets is
        // empty, but we count the link as "passing vacuously" — so the
        // forall over the unresolved-only set is true (every link's
        // contribution is true under Skip). Audit-strict empty fires only
        // when there are NO links of that type at all; here there is one,
        // it's just unresolved.
        let gate: Vec<_> = diags
            .iter()
            .filter(|d| d.rule == "V-needs-approved-req")
            .collect();
        assert_eq!(
            gate.len(),
            0,
            "Skip policy must leave the gate silent on an unresolved-only \
             link; the broken-links phase already reports breakage. \
             got: {gate:#?}"
        );
    }

    /// `on-unresolved: fail` causes the gate to fire on broken links too.
    /// Both diagnostics surface — they report distinct facets: the link is
    /// broken (phase 6) AND the rule cannot be satisfied because of it
    /// (phase 9). This is correct double-coverage, not double-reporting:
    /// the rule fields differ (`broken-link` vs `<rule-id>`).
    #[test]
    #[cfg_attr(miri, ignore)]
    fn fail_policy_emits_alongside_broken_links() {
        use crate::links::LinkGraph;
        use crate::model::{Artifact, Link};
        use crate::schema::{MissingTargetPolicyName, Severity, ValidationRule};
        use std::collections::BTreeMap;

        let verifier = Artifact {
            id: "V-001".into(),
            artifact_type: "sys-verification".into(),
            title: "V".into(),
            description: None,
            status: Some("approved".into()),
            tags: vec![],
            links: vec![Link {
                link_type: "verifies".into(),
                target: "REQ-MISSING".into(),
            }],
            fields: BTreeMap::new(),
            provenance: None,
            source_file: None,
        };
        let mut store = Store::default();
        store.upsert(verifier);

        let mut schema = Schema::merge(&[]);
        schema.validation_rules.push(ValidationRule {
            id: "V-fail-policy".into(),
            description: None,
            rule: r#"
                (implies (= type "sys-verification")
                  (forall-linked "verifies" (= status "approved")))
            "#
            .into(),
            on_unresolved: MissingTargetPolicyName::Fail,
            draft_downgrade: false,
            severity: Severity::Error,
            message: None,
        });
        let graph = LinkGraph::build(&store, &schema);
        let diags = validate(&store, &schema, &graph);

        // Both phases fire, reporting distinct rules.
        let broken: Vec<_> = diags.iter().filter(|d| d.rule == "broken-link").collect();
        let gate: Vec<_> = diags.iter().filter(|d| d.rule == "V-fail-policy").collect();
        assert_eq!(broken.len(), 1, "broken-link phase must still fire");
        assert_eq!(
            gate.len(),
            1,
            "Fail policy must surface the gate violation too"
        );
        // The two diagnostics target the same artifact but report
        // different rules — auditor sees both.
        assert_eq!(broken[0].artifact_id.as_deref(), Some("V-001"));
        assert_eq!(gate[0].artifact_id.as_deref(), Some("V-001"));
    }

    /// Two schemas that declare validation-rules with the SAME `id:` —
    /// `Schema::merge` concats them rather than deduping. If a rule body
    /// differs between the two, both fire independently. Document the
    /// behaviour so downstream users can rely on it (or so a future PR
    /// can introduce deduplication with explicit semantics).
    #[test]
    #[cfg_attr(miri, ignore)]
    fn schema_merge_concats_validation_rules_by_id() {
        use crate::schema::{
            MissingTargetPolicyName, SchemaFile, SchemaMetadata, Severity, ValidationRule,
        };

        let mk_rule = |id: &str, body: &str| ValidationRule {
            id: id.into(),
            description: None,
            rule: body.into(),
            on_unresolved: MissingTargetPolicyName::Skip,
            draft_downgrade: false,
            severity: Severity::Error,
            message: None,
        };
        let mk_file = |name: &str, rules: Vec<ValidationRule>| SchemaFile {
            schema: SchemaMetadata {
                name: name.into(),
                version: "0.1.0".into(),
                ..Default::default()
            },
            validation_rules: rules,
            ..Default::default()
        };

        // Two files; both declare a rule with id "shared-id" (different
        // bodies). Plus each file has a unique rule.
        let a = mk_file(
            "a",
            vec![
                mk_rule("shared-id", "(= type \"x\")"),
                mk_rule("only-in-a", "(= type \"y\")"),
            ],
        );
        let b = mk_file(
            "b",
            vec![
                mk_rule("shared-id", "(= type \"z\")"),
                mk_rule("only-in-b", "(= type \"w\")"),
            ],
        );
        let schema = Schema::merge(&[a, b]);

        // All four rules present — concat semantics, no dedup.
        assert_eq!(schema.validation_rules.len(), 4);
        let ids: Vec<&str> = schema
            .validation_rules
            .iter()
            .map(|r| r.id.as_str())
            .collect();
        // Two copies of "shared-id" — one from each file, preserving
        // the order in which the files were merged.
        let shared_count = ids.iter().filter(|i| **i == "shared-id").count();
        assert_eq!(
            shared_count, 2,
            "shared id appears once per declaring file; got ids: {ids:?}"
        );
    }

    /// **Negative input: empty rule body.** A rule whose `rule:` field is
    /// the empty string parses (the s-expr parser returns `BoolLit(true)`
    /// for empty input — "empty filter matches everything"). Applied as a
    /// rule, that means the rule is inert — never fires. This is
    /// consistent with the filter semantics elsewhere but probably
    /// surprises authors. Documented here so a future PR can decide
    /// whether to reject empty rule bodies at schema-validation time.
    #[test]
    #[cfg_attr(miri, ignore)]
    fn empty_rule_body_is_inert_not_panic() {
        use crate::links::LinkGraph;
        use crate::model::Artifact;
        use crate::schema::{Severity, ValidationRule};
        use std::collections::BTreeMap;

        let art = Artifact {
            id: "X".into(),
            artifact_type: "thing".into(),
            title: "T".into(),
            description: None,
            status: Some("approved".into()),
            tags: vec![],
            links: vec![],
            fields: BTreeMap::new(),
            provenance: None,
            source_file: None,
        };
        let mut store = Store::default();
        store.upsert(art);

        let mut schema = Schema::merge(&[]);
        schema.validation_rules.push(ValidationRule {
            id: "empty-body".into(),
            description: None,
            rule: "".into(), // empty
            on_unresolved: Default::default(),
            draft_downgrade: false,
            severity: Severity::Error,
            message: None,
        });
        let graph = LinkGraph::build(&store, &schema);
        let diags = validate(&store, &schema, &graph);
        // No diagnostic for "empty-body" — rule is inert.
        assert!(
            !diags.iter().any(|d| d.rule == "empty-body"),
            "empty rule body must not fire any diagnostic; got: {diags:#?}"
        );
    }

    /// **Negative input: whitespace-only rule body.** Same shape as empty
    /// — the s-expr parser tolerates trivia. Rule should be inert, not
    /// panic.
    #[test]
    #[cfg_attr(miri, ignore)]
    fn whitespace_only_rule_body_is_inert() {
        use crate::links::LinkGraph;
        use crate::model::Artifact;
        use crate::schema::{Severity, ValidationRule};
        use std::collections::BTreeMap;

        let art = Artifact {
            id: "X".into(),
            artifact_type: "thing".into(),
            title: "T".into(),
            description: None,
            status: Some("approved".into()),
            tags: vec![],
            links: vec![],
            fields: BTreeMap::new(),
            provenance: None,
            source_file: None,
        };
        let mut store = Store::default();
        store.upsert(art);

        let mut schema = Schema::merge(&[]);
        schema.validation_rules.push(ValidationRule {
            id: "whitespace-body".into(),
            description: None,
            rule: "   \n  \t  ".into(),
            on_unresolved: Default::default(),
            draft_downgrade: false,
            severity: Severity::Error,
            message: None,
        });
        let graph = LinkGraph::build(&store, &schema);
        let diags = validate(&store, &schema, &graph);
        assert!(!diags.iter().any(|d| d.rule == "whitespace-body"));
    }

    /// **Negative input: unknown operator.** Like `(bogus-op type "x")`.
    /// The lowering phase rejects unknown heads with an error. The phase-9
    /// pipeline must catch that and surface a rule-level diagnostic
    /// pointing at the rule by id, not panic or silently pass.
    #[test]
    #[cfg_attr(miri, ignore)]
    fn unknown_operator_in_rule_body_surfaces_diagnostic() {
        use crate::schema::{Severity, ValidationRule};

        let store = Store::default();
        let mut schema = Schema::merge(&[]);
        schema.validation_rules.push(ValidationRule {
            id: "uses-bogus-op".into(),
            description: None,
            rule: r#"(bogus-op type "requirement")"#.into(),
            on_unresolved: Default::default(),
            draft_downgrade: false,
            severity: Severity::Error,
            message: None,
        });
        let graph = crate::links::LinkGraph::build(&store, &schema);
        let diags = validate(&store, &schema, &graph);
        let d = diags
            .iter()
            .find(|d| d.rule == "uses-bogus-op")
            .expect("parse error must surface a diagnostic, got none");
        assert_eq!(d.severity, Severity::Error);
        assert!(
            d.message.contains("malformed") || d.message.contains("unknown"),
            "expected message to mention the parse failure; got {:?}",
            d.message
        );
    }

    /// **Negative input: mismatched parens.** Lower should reject; phase
    /// 9 surfaces a rule-level diagnostic.
    #[test]
    #[cfg_attr(miri, ignore)]
    fn mismatched_parens_surface_diagnostic() {
        use crate::schema::{Severity, ValidationRule};

        let store = Store::default();
        let mut schema = Schema::merge(&[]);
        schema.validation_rules.push(ValidationRule {
            id: "bad-parens".into(),
            description: None,
            rule: r#"(and (= type "x") (= status "approved""#.into(), // missing closing parens
            on_unresolved: Default::default(),
            draft_downgrade: false,
            severity: Severity::Error,
            message: None,
        });
        let graph = crate::links::LinkGraph::build(&store, &schema);
        let diags = validate(&store, &schema, &graph);
        assert!(
            diags.iter().any(|d| d.rule == "bad-parens"),
            "mismatched parens must surface a rule-level diagnostic"
        );
    }

    /// **Negative input: rule body references a field that doesn't exist
    /// on any artifact.** `resolve_str` returns the empty string for
    /// missing fields (filter semantics — "show artifacts whose
    /// non-existent-field = X" correctly excludes everyone). The rule
    /// should not panic and should evaluate predictably.
    #[test]
    #[cfg_attr(miri, ignore)]
    fn rule_referencing_unknown_field_evaluates_predictably() {
        use crate::links::LinkGraph;
        use crate::model::Artifact;
        use crate::schema::{Severity, ValidationRule};
        use std::collections::BTreeMap;

        let art = Artifact {
            id: "X".into(),
            artifact_type: "thing".into(),
            title: "T".into(),
            description: None,
            status: Some("approved".into()),
            tags: vec![],
            links: vec![],
            fields: BTreeMap::new(),
            provenance: None,
            source_file: None,
        };
        let mut store = Store::default();
        store.upsert(art);

        let mut schema = Schema::merge(&[]);
        // Rule premise references `nonexistent-field` — resolves to "".
        // Premise `(= nonexistent-field "anything")` becomes `"" == "anything"`
        // which is false. `(implies false _)` is true. So the rule
        // doesn't fire. No panic.
        schema.validation_rules.push(ValidationRule {
            id: "unknown-field-vacuous".into(),
            description: None,
            rule: r#"(implies (= nonexistent-field "anything") (= type "thing"))"#.into(),
            on_unresolved: Default::default(),
            draft_downgrade: false,
            severity: Severity::Error,
            message: None,
        });
        let graph = LinkGraph::build(&store, &schema);
        let diags = validate(&store, &schema, &graph);
        assert!(
            !diags.iter().any(|d| d.rule == "unknown-field-vacuous"),
            "unknown-field premise should be false → implies true → no \
             diagnostic; got: {diags:#?}"
        );
    }

    /// **Negative input: very long rule body.** A 50 KB rule body of
    /// nested `(and ...)` ops must lower and evaluate without crashing.
    /// Catches stack overflows in the recursive lowering or evaluator.
    #[test]
    #[cfg_attr(miri, ignore)]
    fn very_long_rule_body_does_not_panic() {
        use crate::schema::{Severity, ValidationRule};

        // Nest 100 `(and …)` levels. Reasonably deep without being so
        // pathological as to legitimately overflow Rust's default 8 MB
        // main-thread stack.
        let mut body = "true".to_string();
        for _ in 0..100 {
            body = format!("(and {body} true)");
        }

        let store = Store::default();
        let mut schema = Schema::merge(&[]);
        schema.validation_rules.push(ValidationRule {
            id: "very-deep".into(),
            description: None,
            rule: body,
            on_unresolved: Default::default(),
            draft_downgrade: false,
            severity: Severity::Error,
            message: None,
        });
        let graph = crate::links::LinkGraph::build(&store, &schema);
        // Reaching here without panic is the assertion.
        let _diags = validate(&store, &schema, &graph);
    }

    /// **Negative input: `verifies` link-type with a leading/trailing
    /// space typo.** `(forall-linked " verifies " body)` filters links
    /// whose link_type equals `" verifies "` literally — none match.
    /// Audit-strict empty fires. Author's typo surfaces as a real-looking
    /// rule violation (every approved verifier fires), making the typo
    /// loud rather than silent.
    #[test]
    #[cfg_attr(miri, ignore)]
    fn rule_link_type_typo_surfaces_loudly() {
        use crate::links::LinkGraph;
        use crate::model::{Artifact, Link};
        use crate::schema::{Severity, ValidationRule};
        use std::collections::BTreeMap;

        let req = Artifact {
            id: "REQ-001".into(),
            artifact_type: "requirement".into(),
            title: "R".into(),
            description: None,
            status: Some("approved".into()),
            tags: vec![],
            links: vec![],
            fields: BTreeMap::new(),
            provenance: None,
            source_file: None,
        };
        let verifier = Artifact {
            id: "V-001".into(),
            artifact_type: "sys-verification".into(),
            title: "V".into(),
            description: None,
            status: Some("approved".into()),
            tags: vec![],
            links: vec![Link {
                link_type: "verifies".into(), // correct
                target: "REQ-001".into(),
            }],
            fields: BTreeMap::new(),
            provenance: None,
            source_file: None,
        };
        let mut store = Store::default();
        store.upsert(req);
        store.upsert(verifier);

        let mut schema = Schema::merge(&[]);
        // Author typo: " verifies " with spaces.
        schema.validation_rules.push(ValidationRule {
            id: "typo-link-type".into(),
            description: None,
            rule: r#"
                (implies (= type "sys-verification")
                  (forall-linked " verifies " (= status "approved")))
            "#
            .into(),
            on_unresolved: Default::default(),
            draft_downgrade: false,
            severity: Severity::Error,
            message: None,
        });
        let graph = LinkGraph::build(&store, &schema);
        let diags = validate(&store, &schema, &graph);

        // Audit-strict empty fires: the typo means the filter matches no
        // links, the gate fails, and the verifier shows up in diagnostics.
        // The auditor seeing "every approved verifier violates this rule"
        // will (correctly) suspect the rule itself.
        let typo_diags: Vec<_> = diags
            .iter()
            .filter(|d| d.rule == "typo-link-type")
            .collect();
        assert_eq!(
            typo_diags.len(),
            1,
            "typo'd link type should make audit-strict empty fire on \
             every matching artifact, surfacing the typo loudly"
        );
        assert_eq!(typo_diags[0].artifact_id.as_deref(), Some("V-001"));
    }

    /// Severity-downgrade interaction: the new validation-rules phase 9
    /// must NOT inherit the phase-7 traceability-rule draft-downgrade.
    /// They're independent severity pipelines — each rule kind owns its
    /// own downgrade decision. Confirms my opt-in design isn't
    /// accidentally subverted.
    #[test]
    #[cfg_attr(miri, ignore)]
    fn traceability_rule_downgrade_does_not_leak_into_validation_rules() {
        use crate::links::LinkGraph;
        use crate::model::Artifact;
        use crate::schema::{Severity, ValidationRule};
        use std::collections::BTreeMap;

        // Draft artifact. Phase-7 traceability-rule violations would
        // downgrade to Info. Phase-9 validation-rule violations must
        // NOT — unless the rule opts in via draft_downgrade: true.
        let art = Artifact {
            id: "A-001".into(),
            artifact_type: "thing".into(),
            title: "T".into(),
            description: None,
            status: Some("draft".into()),
            tags: vec![],
            links: vec![],
            fields: BTreeMap::new(),
            provenance: None,
            source_file: None,
        };
        let mut store = Store::default();
        store.upsert(art);

        let mut schema = Schema::merge(&[]);
        schema.validation_rules.push(ValidationRule {
            id: "always-fails".into(),
            description: None,
            rule: "(not true)".into(),
            on_unresolved: Default::default(),
            draft_downgrade: false, // opt-OUT explicitly
            severity: Severity::Error,
            message: None,
        });
        let graph = LinkGraph::build(&store, &schema);
        let diags = validate(&store, &schema, &graph);
        let d = diags
            .iter()
            .find(|d| d.rule == "always-fails")
            .expect("rule must fire");
        assert_eq!(
            d.severity,
            Severity::Error,
            "phase-7 traceability draft-downgrade must NOT cascade into \
             phase-9 validation rules"
        );
    }
}
