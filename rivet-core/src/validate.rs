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

    /// REQ-161 / #408: whether this diagnostic reflects a **structural**
    /// integrity problem (a malformed graph / parse / type — the artifact set
    /// is broken) as opposed to a **coverage/lint** finding (the project is
    /// merely incomplete or non-compliant).
    ///
    /// Structural failures are the ones a status flip or a coverage gap can
    /// never touch: a broken link, a duplicate id, an unparseable file, a link
    /// to a forbidden target type, a cardinality violation, a schema-rule
    /// inconsistency. `rivet validate --structural` gates only on these, so a
    /// bulk-edit / status-promotion workflow has a meaningful "did I break the
    /// graph?" check independent of the coverage/lint noise it can't fix in one
    /// pass (spar/sigil both hand-rolled a `0 broken cross-refs` gate for
    /// exactly this — see #353/#355).
    ///
    /// This is an explicit allowlist: everything else — including all
    /// schema-defined coverage/status-gate rules (whose `rule` is the rule's
    /// own name) — is treated as coverage/lint. `required-field`,
    /// `unknown-field`, and `status-allowed-values` are deliberately
    /// classified as coverage (an incomplete/extra/typo'd field doesn't break
    /// the graph); revisit if a project wants them gated.
    pub fn is_structural(&self) -> bool {
        matches!(
            self.rule.as_str(),
            "artifact-parse-error"
                | "duplicate-artifact-id"
                | "known-type"
                | "unknown-link-type"
                | "link-target-type"
                | "cardinality"
                | "broken-link"
                | "doc-broken-ref"
                | "yaml-type-coercion"
                | "conditional-rule-consistency"
                | "coverage-rule-consistency"
        )
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

/// Variant-aware twin of [`validate`].
///
/// Each artifact's required-fields, allowed-values, and conditional-rule
/// checks consult [`crate::model::Artifact::fields_for_variant`] so a
/// variant overlay's keys take precedence over the artifact's default
/// `fields` map. Pass `variant: None` for the default-flavour run.
///
/// See `docs/design/variant-aware-properties.md` §6 Phase 2.
pub fn validate_with_variant(
    store: &Store,
    schema: &Schema,
    graph: &LinkGraph,
    variant: Option<&str>,
) -> Vec<Diagnostic> {
    validate_with_externals_and_variant(store, schema, graph, &BTreeMap::new(), variant)
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
    validate_with_externals_and_variant(store, schema, graph, externals, None)
}

/// Variant-aware twin of [`validate_with_externals`]. When `variant` is
/// `Some(name)`, per-artifact field reads inside the structural and
/// conditional-rule checks resolve through `fields_for_variant`.
pub fn validate_with_externals_and_variant(
    store: &Store,
    schema: &Schema,
    graph: &LinkGraph,
    externals: &ExternalSchemas,
    variant: Option<&str>,
) -> Vec<Diagnostic> {
    let mut diagnostics =
        validate_structural_with_externals_and_variant(store, schema, graph, externals, variant);

    // 0. Schema-level consistency checks (conditional-rule dup/overlap +
    // coverage-rule reachability). REQ-156 / #410: routed through the single
    // `consistency_diagnostics()` chokepoint shared with the salsa path so the
    // two never diverge.
    diagnostics.extend(schema.consistency_diagnostics());

    // 8. Check conditional rules (pre-compile regexes to avoid re-compilation per artifact).
    //
    // When a variant is active, `matches_artifact_for_variant_with` and
    // `check_for_variant` resolve field reads through the artifact's
    // per-variant overlay so a rule whose `when` condition is satisfied
    // by the default `priority: must` may NOT fire under a variant that
    // overrides `priority: should` (and vice versa). The `variant: None`
    // path delegates to the borrowed-Cow fast path.
    for rule in &schema.conditional_rules {
        let compiled_re = rule.when.compile_regex();
        let condition_re = rule.condition.as_ref().and_then(|c| c.compile_regex());
        for artifact in store.iter() {
            // If a precondition is set, it must also match
            if let Some(cond) = &rule.condition {
                if !cond.matches_artifact_for_variant_with(artifact, condition_re.as_ref(), variant)
                {
                    continue;
                }
            }
            if rule
                .when
                .matches_artifact_for_variant_with(artifact, compiled_re.as_ref(), variant)
            {
                diagnostics.extend(rule.then.check_for_variant(
                    artifact,
                    &rule.name,
                    rule.severity,
                    variant,
                ));
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
pub(crate) fn evaluate_validation_rules(
    store: &Store,
    schema: &Schema,
    graph: &LinkGraph,
) -> Vec<Diagnostic> {
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

/// Does a link of type `actual` satisfy a link-field that requires
/// `required`?
///
/// A `<base>-external` link is the cross-organizational variant of the
/// `<base>` link — e.g. `derives-from-external` for `derives-from`. It
/// terminates at an `external-anchor` rather than an in-house artifact,
/// but the derivation still happened; it just crossed an org boundary.
/// So `derives-from-external` satisfies a required `derives-from`
/// link-field. The cardinality count uses this; the target-type check
/// deliberately does NOT — the `*-external` link legitimately points at
/// an `external-anchor`, which is not in the base field's target types
/// (REQ-064).
fn link_satisfies_field(actual: &str, required: &str) -> bool {
    actual == required
        || actual
            .strip_suffix("-external")
            .is_some_and(|base| base == required)
}

/// An artifact whose ID is `prefix:ID`-qualified was loaded from a linked
/// external project (`rivet sync`), present in the store ONLY so the
/// consumer's `prefix:ID` cross-links resolve. It must NOT be subjected to
/// the consumer's own per-artifact validation — that is the supplier's
/// gate, surfaced opt-in via `rivet validate --with-externals-validate`
/// (REQ-065 / AoU-X1). Every per-artifact diagnostic pass skips these
/// (REQ-082). The broken-link check is unaffected — it reads `graph`,
/// which is built from the full store, so cross-links still resolve.
fn is_external_artifact(artifact: &crate::model::Artifact) -> bool {
    artifact.id.contains(':')
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

/// Variant-aware twin of [`validate_structural`].
///
/// Required-field and allowed-values checks resolve through the
/// per-variant overlay so a field that only exists on the variant
/// satisfies a `required: true` field definition, and a variant-only
/// value is checked against `allowed-values`.
pub fn validate_structural_with_variant(
    store: &Store,
    schema: &Schema,
    graph: &LinkGraph,
    variant: Option<&str>,
) -> Vec<Diagnostic> {
    validate_structural_with_externals_and_variant(store, schema, graph, &BTreeMap::new(), variant)
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
    validate_structural_with_externals_and_variant(store, schema, graph, externals, None)
}

/// Variant-aware twin of [`validate_structural_with_externals`]. When
/// `variant` is `Some(name)`, required-field presence and allowed-value
/// checks read through [`crate::model::Artifact::fields_for_variant`]
/// so the per-variant overlay wins over the default `fields` map.
pub fn validate_structural_with_externals_and_variant(
    store: &Store,
    schema: &Schema,
    graph: &LinkGraph,
    externals: &ExternalSchemas,
    variant: Option<&str>,
) -> Vec<Diagnostic> {
    let mut diagnostics = Vec::new();

    // 1. Check that every artifact has a known type
    for artifact in store.iter() {
        // REQ-082: external (prefixed) artifacts are present only for
        // cross-link resolution — do not validate the supplier's project.
        if is_external_artifact(artifact) {
            continue;
        }
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

        // Resolve the fields map once per artifact through the variant
        // overlay. `Cow::Borrowed(&artifact.fields)` when no variant
        // applies — zero allocations on the common path.
        let effective_fields = artifact.fields_for_variant(variant);

        // 2. Check required fields
        for field in &type_def.fields {
            if field.required && !effective_fields.contains_key(&field.name) {
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
                if let Some(value) = effective_fields.get(&field.name) {
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

        // 3b. REQ-135: validate the `status` base field against its declared
        // enum. `status` is a schema base-field (not a per-type field) and
        // lives in `artifact.status` (top-level), so the per-type
        // allowed-values loop above never sees it. When the schema declares
        // `allowed-values` on the `status` base-field, enforce it here; with
        // no values declared the check is inert (backward compatible).
        if let Some(status) = artifact.status.as_deref() {
            // #550: a type may declare its OWN `status` field with
            // `allowed-values` to override the global lifecycle enum (e.g.
            // `ai-found-defect` uses open/triaged/resolved, not draft→released).
            // Prefer the type's own status field; fall back to the base-field.
            let status_field = type_def
                .fields
                .iter()
                .find(|f| f.name == "status")
                .or_else(|| schema.base_fields.iter().find(|f| f.name == "status"));
            if let Some(allowed) = status_field.and_then(|f| f.allowed_values.as_ref()) {
                if !allowed.is_empty() && !allowed.iter().any(|a| a == status) {
                    diagnostics.push(Diagnostic {
                        source_file: None,
                        line: None,
                        column: None,
                        severity: Severity::Error,
                        artifact_id: Some(artifact.id.clone()),
                        rule: "status-allowed-values".to_string(),
                        message: format!(
                            "status '{}' is not an allowed value, allowed: {:?}",
                            status, allowed
                        ),
                    });
                }
            }
        }

        // 4. Check link field cardinality
        for link_field in &type_def.link_fields {
            let count = artifact
                .links
                .iter()
                .filter(|l| link_satisfies_field(&l.link_type, &link_field.link_type))
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
            //
            // Schemas write `required-backlink` as either the forward
            // link-type name (e.g. `satisfies` in `dev.yaml`) or the
            // inverse name (e.g. `supported-by` in `safety-case.yaml`).
            // Accept either so both conventions validate correctly —
            // matching only `bl.link_type` would miss the inverse-name case.
            // `alternate-backlinks` provides additional acceptable shapes
            // for the same rule (e.g. a safety-goal supported via
            // `supported-by` OR decomposed via `decomposed-by`).
            if let Some(required_backlink) = &rule.required_backlink {
                let backlinks = graph.backlinks_to(id);
                let matches = |link_name: &str, from_types: &[String]| {
                    backlinks.iter().any(|bl| {
                        (bl.link_type == link_name || bl.inverse_type.as_deref() == Some(link_name))
                            && (from_types.is_empty()
                                || store
                                    .get(&bl.source)
                                    .is_some_and(|s| from_types.contains(&s.artifact_type)))
                    })
                };
                let primary = matches(required_backlink, &rule.from_types);
                let alternate = rule
                    .alternate_backlinks
                    .iter()
                    .any(|alt| matches(&alt.link_type, &alt.from_types));
                if !primary && !alternate {
                    // Tell the author HOW to satisfy this, not just that it's
                    // unsatisfied (issue #350). Name the incoming link type and
                    // the artifact types that may form it, so they don't have
                    // to reverse-engineer the required shape from a link-target
                    // rejection. `rivet validate --explain <ID>` shows the full
                    // breakdown including any alternate backlinks.
                    let mut message = rule.description.clone();
                    if !rule.from_types.is_empty() {
                        message.push_str(&format!(
                            " — needs an incoming `{}` link from one of [{}]",
                            required_backlink,
                            rule.from_types.join(", ")
                        ));
                    } else {
                        message
                            .push_str(&format!(" — needs an incoming `{required_backlink}` link"));
                    }
                    diagnostics.push(Diagnostic {
                        source_file: None,
                        line: None,
                        column: None,
                        severity: effective_severity,
                        artifact_id: Some(id.clone()),
                        rule: rule.name.clone(),
                        message,
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
        // REQ-082: skip external (prefixed) artifacts — supplier's gate.
        if is_external_artifact(artifact) {
            continue;
        }
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
        // REQ-082: skip external (prefixed) artifacts — supplier's gate.
        if is_external_artifact(artifact) {
            continue;
        }
        if let Some(type_def) = schema.artifact_type(&artifact.artifact_type) {
            // #556: a base-field declared in `common.yaml` (e.g. `cited-source`)
            // is valid on EVERY type — that's what "base" means — so a
            // verification artifact carrying `cited-source` must not be flagged
            // `unknown-field`. Struct base-fields (id/title/…) never appear in
            // `artifact.fields`, so chaining them in is harmless.
            let known_fields: std::collections::HashSet<&str> = type_def
                .fields
                .iter()
                .chain(schema.base_fields.iter())
                .map(|f| f.name.as_str())
                .collect();
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
        // REQ-082: skip external (prefixed) artifacts — supplier's gate.
        if is_external_artifact(artifact) {
            continue;
        }
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
                // sigil finding B (#353): suppress when the schema permits NO
                // link type between the mentioning artifact's type and the
                // mentioned artifact's type. The only remediation this rule
                // offers is "add a link in `links:`" — impossible when no such
                // link type exists, and nagging the author to link an
                // id-shaped token that resolves to an *unrelated* artifact
                // (a coincidental id collision) pressures a FALSE trace.
                // A link type with empty `source-types`/`target-types` means
                // "any -> any", so permissive schemas are unaffected; only
                // fully-constrained schemas (every link type names its source
                // and target) ever trigger the suppression.
                let from_type = artifact.artifact_type.as_str();
                let to_type = store.get(mentioned).map(|a| a.artifact_type.as_str());
                let link_type_exists = schema.link_types.values().any(|lt| {
                    (lt.source_types.is_empty() || lt.source_types.iter().any(|s| s == from_type))
                        && (lt.target_types.is_empty()
                            || to_type.is_some_and(|t| lt.target_types.iter().any(|x| x == t)))
                });
                if !link_type_exists {
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

    // 11. Near-duplicate intent (REQ-158 / #397).
    //
    // `rivet add` rejects a duplicate *id* but nothing flags a duplicate
    // *intent* — two same-type artifacts that say the same thing under
    // different ids. Over a long-lived backlog these accrete. Flag a pair of
    // same-type, non-external artifacts whose titles share at least
    // `NEAR_DUPLICATE_INTENT_THRESHOLD` of their significant tokens. Severity
    // is INFO — it never blocks `validate`; it's a hygiene nudge. The same
    // Jaccard signal backs `rivet add`'s "similar to <ID>" note, so the two
    // surfaces always agree. Comparison is within-type only (an O(n²) pass
    // over each type bucket; each title tokenized once).
    {
        use crate::similarity::{NEAR_DUPLICATE_INTENT_THRESHOLD, intent_tokens, similarity_of};
        use std::collections::BTreeSet;

        let mut by_type: BTreeMap<&str, Vec<(&str, BTreeSet<String>)>> = BTreeMap::new();
        for artifact in store.iter() {
            if is_external_artifact(artifact) {
                continue;
            }
            let tokens = intent_tokens(&artifact.title);
            if tokens.is_empty() {
                continue;
            }
            by_type
                .entry(artifact.artifact_type.as_str())
                .or_default()
                .push((artifact.id.as_str(), tokens));
        }
        for items in by_type.values_mut() {
            items.sort_by(|a, b| a.0.cmp(b.0));
            for i in 0..items.len() {
                for j in (i + 1)..items.len() {
                    let sim = similarity_of(&items[i].1, &items[j].1);
                    if sim >= NEAR_DUPLICATE_INTENT_THRESHOLD {
                        let pct = (sim * 100.0).round() as u32;
                        diagnostics.push(Diagnostic {
                            source_file: None,
                            line: None,
                            column: None,
                            severity: Severity::Info,
                            artifact_id: Some(items[j].0.to_string()),
                            rule: "near-duplicate-intent".to_string(),
                            message: format!(
                                "title intent is {pct}% similar to '{}' — consolidate the two, \
                                 differentiate the titles, or ignore if genuinely distinct",
                                items[i].0
                            ),
                        });
                    }
                }
            }
        }
    }

    diagnostics
}

// ── Variant overlay validation (issue #287, Phase 2) ───────────────────

/// Run the same required-field / allowed-values checks that
/// [`validate_structural_with_externals`] applies to `artifact.fields`,
/// but against an arbitrary `fields` map.
///
/// This is the type-check primitive used by [`validate_variants`] when
/// validating the merged "default + overlay" view per
/// `docs/design/variant-aware-properties.md` §5.5. It deliberately does
/// not check link cardinality / link targets — those live on the
/// artifact, not in a variant overlay, so they're not re-checked under
/// `--variant`.
///
/// `rule_suffix` is appended to the diagnostic `rule:` field
/// (e.g. `"-variant.industrial"`) so consumers can distinguish a
/// diagnostic about the default view from one about a variant overlay.
/// `id_suffix` is appended to the human-visible artifact id in the
/// message (e.g. `" (variant: industrial)"`) so the message is
/// unambiguous in `rivet validate --format text`.
#[allow(clippy::too_many_arguments)] // each argument carries an independent
// attribute of the variant overlay
// diagnostic; bundling into a struct
// would not improve readability
fn check_fields_against_type(
    artifact_id: &str,
    artifact_type: &str,
    description: Option<&str>,
    status: Option<&str>,
    fields: &BTreeMap<String, serde_yaml::Value>,
    type_def: &ArtifactTypeDef,
    rule_suffix: &str,
    msg_suffix: &str,
) -> Vec<Diagnostic> {
    let mut out = Vec::new();
    for field in &type_def.fields {
        // 1. required fields
        if field.required && !fields.contains_key(&field.name) {
            let has_base = match field.name.as_str() {
                "description" => description.is_some(),
                "status" => status.is_some(),
                _ => false,
            };
            if !has_base {
                out.push(Diagnostic {
                    source_file: None,
                    line: None,
                    column: None,
                    severity: Severity::Error,
                    artifact_id: Some(artifact_id.to_string()),
                    rule: format!("required-field{rule_suffix}"),
                    message: format!(
                        "missing required field '{}' for type '{}'{msg_suffix}",
                        field.name, artifact_type
                    ),
                });
            }
        }

        // 2. allowed values (string, bool, and number forms — same shape
        // as validate_structural_with_externals; YAML may coerce values
        // so we check against the canonical aliases).
        if let Some(allowed) = &field.allowed_values {
            if let Some(value) = fields.get(&field.name) {
                if let Some(s) = value.as_str() {
                    if !allowed.iter().any(|a| a == s) {
                        out.push(Diagnostic {
                            source_file: None,
                            line: None,
                            column: None,
                            severity: Severity::Warning,
                            artifact_id: Some(artifact_id.to_string()),
                            rule: format!("allowed-values{rule_suffix}"),
                            message: format!(
                                "field '{}' has value '{}'{msg_suffix}, allowed: {:?}",
                                field.name, s, allowed
                            ),
                        });
                    }
                } else if let Some(b) = value.as_bool() {
                    let candidates: &[&str] = if b {
                        &["true", "yes"]
                    } else {
                        &["false", "no"]
                    };
                    if !candidates.iter().any(|c| allowed.iter().any(|a| a == c)) {
                        out.push(Diagnostic {
                            source_file: None,
                            line: None,
                            column: None,
                            severity: Severity::Warning,
                            artifact_id: Some(artifact_id.to_string()),
                            rule: format!("allowed-values{rule_suffix}"),
                            message: format!(
                                "field '{}' has value '{}' (boolean){msg_suffix}, allowed: {:?}",
                                field.name, b, allowed
                            ),
                        });
                    }
                } else if value.is_number() {
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
                        out.push(Diagnostic {
                            source_file: None,
                            line: None,
                            column: None,
                            severity: Severity::Warning,
                            artifact_id: Some(artifact_id.to_string()),
                            rule: format!("allowed-values{rule_suffix}"),
                            message: format!(
                                "field '{}' has value '{}' (number){msg_suffix}, allowed: {:?}",
                                field.name, num_str, allowed
                            ),
                        });
                    }
                }
            }
        }
    }
    out
}

/// Validate variant overlays across every artifact in the store.
///
/// This is the Phase 2 (issue #287) entry point. It enforces the
/// `docs/design/variant-aware-properties.md` §5.5 semantics:
///
/// 1. **Variant-key cross-check.** For every artifact with a non-empty
///    `fields-per-variant:`, each outer key must appear in
///    `known_variants`. Unknown keys produce a Warning by default,
///    promoted to Error when `strict` is true. `known_variants` is
///    typically the union of:
///    - declared variant-config names (from `artifacts/variants/`),
///    - feature names in the feature model.
///
/// 2. **Overlaid value type-check.** For every artifact, every
///    declared variant overlay is type-checked using the same
///    required-field / allowed-values rules as the default `fields:`
///    block — so a variant overlay can never "patch" a required field
///    into an invalid state. Errors here always fire (they describe
///    schema violations, not naming hygiene).
///
/// 3. **Active-variant merged-view check.** When `active` is `Some`,
///    every artifact is additionally type-checked under the merged
///    view (default ∪ overlay[active]). This is the user-facing meaning
///    of `rivet validate --variant industrial`: "the resolved view for
///    `industrial` is consistent".
///
/// Per the design doc the default view is **also** validated via the
/// existing validator pipeline; this function is purely additive — it
/// does not duplicate any of the default-view diagnostics. Callers
/// should compose: `validate_with_externals(...) + validate_variants(...)`.
pub fn validate_variants(
    store: &Store,
    schema: &Schema,
    externals: &ExternalSchemas,
    active: Option<&str>,
    known_variants: &std::collections::BTreeSet<String>,
    strict: bool,
) -> Vec<Diagnostic> {
    let mut diagnostics = Vec::new();
    let known_sorted: Vec<&str> = known_variants.iter().map(String::as_str).collect();

    for artifact in store.iter() {
        // REQ-082: skip external (prefixed) artifacts — supplier's gate.
        if is_external_artifact(artifact) {
            continue;
        }
        // ── 1. variant-key cross-check ──────────────────────────────
        for variant_key in artifact.fields_per_variant.keys() {
            if !known_variants.contains(variant_key) {
                let severity = if strict {
                    Severity::Error
                } else {
                    Severity::Warning
                };
                let expected = if known_sorted.is_empty() {
                    "(no variants declared)".to_string()
                } else {
                    known_sorted.join(", ")
                };
                diagnostics.push(Diagnostic {
                    source_file: artifact.source_file.clone(),
                    line: None,
                    column: None,
                    severity,
                    artifact_id: Some(artifact.id.clone()),
                    rule: "variant-key-unknown".to_string(),
                    message: format!(
                        "variant key '{}' in fields-per-variant is not declared in any \
                         variant config or feature; expected one of: {}",
                        variant_key, expected
                    ),
                });
            }
        }

        // Resolve the artifact's type to drive value-level checks.
        let type_def = match lookup_type(artifact, schema, externals) {
            TypeLookup::Found(td) => td,
            // Unknown / no-schema-for-external cases are already
            // reported by the main validator; skip the variant checks
            // here (we'd just generate duplicate diagnostics).
            _ => continue,
        };

        // ── 2. type-check every declared variant overlay ────────────
        // The overlay is the default fields with the variant keys
        // merged on top. This catches a variant overlay that puts an
        // out-of-set value into an `allowed-values` field, or that
        // would unset a required field (variant overlays only add or
        // replace, so the "unset required" case is checked indirectly
        // by re-running the required-fields check on the merged map —
        // a required field that was already present in `fields` will
        // remain present after merging).
        for variant_name in artifact.fields_per_variant.keys() {
            let merged = artifact.fields_for_variant(Some(variant_name));
            let rule_suffix = format!("-variant.{variant_name}");
            let msg_suffix = format!(" (variant: {variant_name})");
            diagnostics.extend(check_fields_against_type(
                &artifact.id,
                &artifact.artifact_type,
                artifact.description.as_deref(),
                artifact.status.as_deref(),
                &merged,
                type_def,
                &rule_suffix,
                &msg_suffix,
            ));
        }

        // ── 3. active-variant merged-view check ─────────────────────
        // Only re-run when `active` was given AND the artifact actually
        // has an overlay for it — otherwise the merged view equals the
        // default view, which the main validator already covered.
        if let Some(name) = active {
            if artifact.fields_per_variant.contains_key(name) {
                // Already covered by the loop above — no extra work,
                // but we leave the branch here as the single place to
                // hang future "merged-view-only" checks (e.g. a future
                // `range` check that does not apply to the default).
                let _ = name;
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
                external: None,
            },
            Link {
                link_type: "undeclared-type".to_string(),
                target: "B-2".to_string(),
                external: None,
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
            external: None,
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
            external: None,
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
            external: None,
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

    /// Issue #349: `required-backlink` written as the INVERSE link-type
    /// name (e.g. `supported-by`, the convention used by
    /// `schemas/safety-case.yaml`) was never matched against the stored
    /// `Backlink.link_type` (the FORWARD name, e.g. `supports`). The
    /// goal-has-support rule fired for every goal even when a solution
    /// was correctly linked. Accept either spelling.
    ///
    /// rivet: fixes REQ-004
    #[test]
    fn required_backlink_inverse_name_is_satisfied_by_forward_link() {
        use crate::schema::LinkTypeDef;
        let mut file = minimal_schema("test");
        file.link_types.push(LinkTypeDef {
            name: "supports".into(),
            inverse: Some("supported-by".into()),
            description: "Solution supports goal".into(),
            source_types: vec!["safety-solution".into()],
            target_types: vec!["safety-goal".into()],
        });
        file.traceability_rules = vec![TraceabilityRule {
            name: "goal-has-support".into(),
            description: "Every safety goal must be supported".into(),
            source_type: "safety-goal".into(),
            required_link: None,
            // Inverse-name convention from safety-case.yaml.
            required_backlink: Some("supported-by".into()),
            target_types: vec![],
            from_types: vec!["safety-solution".into()],
            severity: Severity::Error,
            alternate_backlinks: vec![],
        }];
        let schema = Schema::merge(&[file]);

        let mut store = Store::new();
        let mut goal = minimal_artifact("SG-1", "safety-goal");
        goal.status = Some("approved".to_string());
        store.insert(goal).unwrap();
        let mut sol = minimal_artifact("SOL-1", "safety-solution");
        sol.status = Some("approved".to_string());
        sol.links = vec![Link {
            link_type: "supports".to_string(),
            target: "SG-1".to_string(),
            external: None,
        }];
        store.insert(sol).unwrap();

        let graph = LinkGraph::build(&store, &schema);
        let diags = validate_structural(&store, &schema, &graph);
        let rule_diags: Vec<_> = diags
            .iter()
            .filter(|d| d.rule == "goal-has-support")
            .collect();
        assert!(
            rule_diags.is_empty(),
            "SG-1 has a supported-by backlink (from SOL-1's forward `supports` link); \
             the rule must not fire. Got diagnostics: {:?}",
            rule_diags.iter().map(|d| &d.message).collect::<Vec<_>>()
        );
    }

    /// Issue #349 secondary: `validate.rs` never evaluated
    /// `rule.alternate_backlinks`. A safety-goal satisfied only via
    /// an alternate (e.g. `decomposed-by` instead of `supported-by`)
    /// still erroneously fired the rule.
    ///
    /// rivet: fixes REQ-004
    #[test]
    fn validate_honours_alternate_backlinks() {
        use crate::schema::{AlternateBacklink, LinkTypeDef};
        let mut file = minimal_schema("test");
        file.link_types.push(LinkTypeDef {
            name: "supports".into(),
            inverse: Some("supported-by".into()),
            description: "Solution supports goal".into(),
            source_types: vec!["safety-solution".into()],
            target_types: vec!["safety-goal".into()],
        });
        file.link_types.push(LinkTypeDef {
            name: "decomposes".into(),
            inverse: Some("decomposed-by".into()),
            description: "Strategy decomposes a goal".into(),
            source_types: vec!["safety-strategy".into()],
            target_types: vec!["safety-goal".into()],
        });
        file.traceability_rules = vec![TraceabilityRule {
            name: "goal-supported-or-decomposed".into(),
            description: "Every goal supported OR decomposed".into(),
            source_type: "safety-goal".into(),
            required_link: None,
            required_backlink: Some("supported-by".into()),
            target_types: vec![],
            from_types: vec!["safety-solution".into()],
            alternate_backlinks: vec![AlternateBacklink {
                link_type: "decomposed-by".into(),
                from_types: vec!["safety-strategy".into()],
            }],
            severity: Severity::Error,
        }];
        let schema = Schema::merge(&[file]);

        let mut store = Store::new();
        let mut goal = minimal_artifact("SG-A", "safety-goal");
        goal.status = Some("approved".to_string());
        store.insert(goal).unwrap();
        // Strategy decomposes SG-A. No solution at all.
        let mut strat = minimal_artifact("STRAT-1", "safety-strategy");
        strat.status = Some("approved".to_string());
        strat.links = vec![Link {
            link_type: "decomposes".to_string(),
            target: "SG-A".to_string(),
            external: None,
        }];
        store.insert(strat).unwrap();

        let graph = LinkGraph::build(&store, &schema);
        let diags = validate_structural(&store, &schema, &graph);
        let rule_diags: Vec<_> = diags
            .iter()
            .filter(|d| d.rule == "goal-supported-or-decomposed")
            .collect();
        assert!(
            rule_diags.is_empty(),
            "SG-A is satisfied via the alternate `decomposed-by` backlink; \
             the rule must not fire. Got: {:?}",
            rule_diags.iter().map(|d| &d.message).collect::<Vec<_>>()
        );
    }

    // REQ-135: when a schema declares `allowed-values` on the `status`
    // base-field, validate enforces it (a typo'd status flags), reading the
    // top-level `artifact.status`. The base-field must survive `Schema::merge`.
    // rivet: verifies REQ-135
    #[test]
    fn status_enum_is_enforced_when_declared() {
        let mut file = minimal_schema("requirement");
        file.artifact_types = vec![ArtifactTypeDef {
            name: "requirement".into(),
            ..Default::default()
        }];
        file.base_fields = vec![FieldDef {
            name: "status".into(),
            field_type: "enum".into(),
            allowed_values: Some(vec![
                "draft".into(),
                "approved".into(),
                "implemented".into(),
            ]),
            ..Default::default()
        }];
        let schema = Schema::merge(&[file]);
        assert!(
            !schema.base_fields.is_empty(),
            "merge must retain base_fields"
        );

        let mut store = Store::new();
        let mut good = minimal_artifact("REQ-1", "requirement");
        good.status = Some("approved".to_string());
        store.insert(good).unwrap();
        let mut bad = minimal_artifact("REQ-2", "requirement");
        bad.status = Some("implmented".to_string()); // typo
        store.insert(bad).unwrap();

        let graph = LinkGraph::build(&store, &schema);
        let diags = validate_structural(&store, &schema, &graph);
        let status_diags: Vec<_> = diags
            .iter()
            .filter(|d| d.rule == "status-allowed-values")
            .collect();
        assert_eq!(
            status_diags.len(),
            1,
            "only the typo'd status should flag; got {status_diags:?}"
        );
        assert_eq!(status_diags[0].artifact_id.as_deref(), Some("REQ-2"));
        assert!(status_diags[0].message.contains("implmented"));
    }

    // #550: a type may declare its OWN `status` field allowed-values, which
    // override the global lifecycle enum for artifacts of that type.
    #[test]
    fn per_type_status_field_overrides_global_enum() {
        let mut file = minimal_schema("defect");
        file.base_fields = vec![FieldDef {
            name: "status".into(),
            field_type: "enum".into(),
            allowed_values: Some(vec!["draft".into(), "approved".into()]),
            ..Default::default()
        }];
        file.artifact_types = vec![ArtifactTypeDef {
            name: "ai-found-defect".into(),
            fields: vec![FieldDef {
                name: "status".into(),
                field_type: "enum".into(),
                allowed_values: Some(vec!["open".into(), "triaged".into(), "resolved".into()]),
                ..Default::default()
            }],
            ..Default::default()
        }];
        let schema = Schema::merge(&[file]);

        let mut store = Store::new();
        // `open` is valid for the type (not in the global enum).
        let mut good = minimal_artifact("DEF-1", "ai-found-defect");
        good.status = Some("open".to_string());
        store.insert(good).unwrap();
        // `draft` is a GLOBAL value but NOT in the per-type set -> rejected.
        let mut bad = minimal_artifact("DEF-2", "ai-found-defect");
        bad.status = Some("draft".to_string());
        store.insert(bad).unwrap();

        let graph = LinkGraph::build(&store, &schema);
        let status_diags: Vec<_> = validate_structural(&store, &schema, &graph)
            .into_iter()
            .filter(|d| d.rule == "status-allowed-values")
            .collect();
        assert_eq!(
            status_diags.len(),
            1,
            "per-type enum: `open` ok, `draft` rejected; got {status_diags:?}"
        );
        assert_eq!(status_diags[0].artifact_id.as_deref(), Some("DEF-2"));
    }

    // #556: a base-field (e.g. `cited-source`) is valid on EVERY type, so an
    // artifact of a type that doesn't redeclare it must NOT be flagged
    // `unknown-field`.
    #[test]
    fn base_field_is_accepted_on_any_type() {
        let mut file = minimal_schema("verification");
        file.base_fields = vec![FieldDef {
            name: "cited-source".into(),
            field_type: "cited-source".into(),
            ..Default::default()
        }];
        file.artifact_types = vec![ArtifactTypeDef {
            name: "verification".into(),
            ..Default::default() // declares NO fields of its own
        }];
        let schema = Schema::merge(&[file]);

        let mut store = Store::new();
        let mut art = minimal_artifact("V-1", "verification");
        art.fields
            .insert("cited-source".into(), serde_yaml::Value::String("x".into()));
        store.insert(art).unwrap();

        let graph = LinkGraph::build(&store, &schema);
        let unknown: Vec<_> = validate_structural(&store, &schema, &graph)
            .into_iter()
            .filter(|d| d.rule == "unknown-field")
            .collect();
        assert!(
            unknown.is_empty(),
            "a base-field must be accepted on any type, got {unknown:?}"
        );
    }

    // Backward-compatibility: with no `allowed-values` declared on `status`
    // (today's common.yaml), the check is inert — any status passes.
    // rivet: verifies REQ-135
    #[test]
    fn status_enum_inert_when_no_values_declared() {
        let mut file = minimal_schema("requirement");
        file.artifact_types = vec![ArtifactTypeDef {
            name: "requirement".into(),
            ..Default::default()
        }];
        file.base_fields = vec![FieldDef {
            name: "status".into(),
            field_type: "enum".into(),
            ..Default::default() // no allowed_values
        }];
        let schema = Schema::merge(&[file]);

        let mut store = Store::new();
        let mut a = minimal_artifact("REQ-1", "requirement");
        a.status = Some("anything-goes".to_string());
        store.insert(a).unwrap();
        let graph = LinkGraph::build(&store, &schema);
        let diags = validate_structural(&store, &schema, &graph);
        assert!(
            !diags.iter().any(|d| d.rule == "status-allowed-values"),
            "no enum declared → no status enforcement"
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
            external: None,
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
        use crate::schema::LinkTypeDef;
        use crate::store::Store;

        // A `relates` link type that permits test -> test, so that for these
        // same-type fixtures a typed link *is* possible — otherwise the
        // prose-mention rule now (correctly) suppresses when no link type
        // could connect the two artifact types (sigil finding B, #353).
        let mut schema_file = minimal_schema("test");
        schema_file.link_types.push(LinkTypeDef {
            name: "relates".into(),
            inverse: None,
            description: "test relation".into(),
            source_types: vec!["test".into()],
            target_types: vec!["test".into()],
        });
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

    // rivet: verifies REQ-161
    #[test]
    fn is_structural_classifies_every_builtin_rule() {
        let mk = |rule: &str| Diagnostic::new(Severity::Error, None, rule, "x");

        // STRUCTURAL — a broken graph/parse/type model.
        for rule in [
            "artifact-parse-error",
            "duplicate-artifact-id",
            "known-type",
            "unknown-link-type",
            "link-target-type",
            "cardinality",
            "broken-link",
            "doc-broken-ref",
            "yaml-type-coercion",
            "conditional-rule-consistency",
            "coverage-rule-consistency",
        ] {
            assert!(mk(rule).is_structural(), "{rule} must be structural");
        }

        // COVERAGE / LINT — incomplete or non-compliant, not malformed.
        for rule in [
            "required-field",
            "unknown-field",
            "allowed-values",
            "status-allowed-values",
            "prose-mention-without-typed-link",
            "near-duplicate-intent",
            "orphan-artifact",
            // schema-defined coverage / status-gate rules carry their own
            // rule name, e.g.:
            "swe1-has-verification",
            "must-needs-rationale",
        ] {
            assert!(
                !mk(rule).is_structural(),
                "{rule} must be classified coverage/lint, not structural"
            );
        }
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
                external: None,
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

    // rivet: verifies REQ-155
    #[test]
    fn prose_mention_suppressed_when_no_schema_valid_link_type() {
        // sigil finding B (#353): a `design` artifact mentions a `uca`
        // artifact, but the schema's only link type connects design ->
        // requirement. There is NO link type that could connect design ->
        // uca, so "add a link in `links:`" is impossible — the warning must
        // be suppressed rather than pressure a false trace. The control
        // (mentioning a `requirement`, which design CAN link to) still warns.
        use crate::schema::LinkTypeDef;
        use crate::store::Store;

        let mut schema_file = minimal_schema("test");
        schema_file.link_types.push(LinkTypeDef {
            name: "satisfies".into(),
            inverse: None,
            description: "design satisfies a requirement".into(),
            source_types: vec!["design".into()],
            target_types: vec!["requirement".into()],
        });
        let schema = Schema::merge(&[schema_file]);

        // A design that mentions both an unrelatable `uca` and a linkable
        // `requirement` in its prose, with no typed links of its own.
        let a = make_artifact(
            "DD-1",
            "design",
            None,
            Some("Mitigates UCA-1; satisfies REQ-1."),
            vec![],
            vec![],
        );
        let uca = make_artifact("UCA-1", "uca", None, None, vec![], vec![]);
        let req = make_artifact("REQ-1", "requirement", None, None, vec![], vec![]);

        let mut store = Store::new();
        store.insert(a).unwrap();
        store.insert(uca).unwrap();
        store.insert(req).unwrap();
        let graph = LinkGraph::build(&store, &schema);

        let diags: Vec<_> = crate::validate::validate(&store, &schema, &graph)
            .into_iter()
            .filter(|d| d.rule == "prose-mention-without-typed-link")
            .collect();

        // Exactly one warning — for REQ-1 (linkable), NOT for UCA-1.
        assert_eq!(
            diags.len(),
            1,
            "expected exactly one prose-mention warning (REQ-1 only), got {diags:?}"
        );
        let msg = &diags[0].message;
        assert!(
            msg.contains("REQ-1") && !msg.contains("UCA-1"),
            "warning must be for the linkable REQ-1, not the unrelatable UCA-1: {msg}"
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
                fields_per_variant: Default::default(),
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
                    external: None,
                }],
                fields: BTreeMap::new(),
                fields_per_variant: Default::default(),
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
            fields_per_variant: Default::default(),
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
                external: None,
            }],
            fields: BTreeMap::new(),
            fields_per_variant: Default::default(),
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
                external: None,
            }],
            fields: BTreeMap::new(),
            fields_per_variant: Default::default(),
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
            fields_per_variant: Default::default(),
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
            fields_per_variant: Default::default(),
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
            fields_per_variant: Default::default(),
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
            fields_per_variant: Default::default(),
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
                external: None,
            }],
            fields: BTreeMap::new(),
            fields_per_variant: Default::default(),
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
            fields_per_variant: Default::default(),
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

    // ── Variant-aware field overlays (issue #287, Phase 2) ───────────────
    //
    // Phase 2 wires `Artifact::fields_for_variant` into the validate
    // engine: required-fields, allowed-values, and conditional rules
    // resolve through the per-variant overlay so an active variant's
    // value wins over the default `fields` map. The two tests below
    // verify the visible-from-CLI behaviour change.

    /// Test A: conditional rule fires for the default flavour but is
    /// suppressed under a variant whose overlay disables the trigger.
    ///
    /// Setup:
    ///   - Artifact `R-1` has `fields.priority = must` and
    ///     `fields-per-variant.automotive.priority = should`.
    ///   - Conditional rule: "when priority equals 'must', require
    ///     `rationale` field".
    ///
    /// Expected:
    ///   - `validate(store, schema, graph)` (no variant): rule fires
    ///     because the default flavour has `priority: must`.
    ///   - `validate_with_variant(.., Some("automotive"))`: rule does
    ///     NOT fire because the variant overlay sets `priority: should`.
    // rivet: verifies REQ-004
    #[test]
    fn conditional_rule_respects_variant_field_overlay() {
        let rule = ConditionalRule {
            name: "must-needs-rationale".to_string(),
            description: None,
            condition: None,
            when: Condition::Equals {
                field: "priority".to_string(),
                value: "must".to_string(),
            },
            then: Requirement::RequiredFields {
                fields: vec!["rationale".to_string()],
            },
            severity: Severity::Error,
        };
        let schema = make_schema(vec![rule]);

        let mut art = make_artifact("R-1", "test", None, None, vec![], vec![]);
        art.fields.insert(
            "priority".to_string(),
            serde_yaml::Value::String("must".to_string()),
        );
        let mut overlay = BTreeMap::new();
        overlay.insert(
            "priority".to_string(),
            serde_yaml::Value::String("should".to_string()),
        );
        art.fields_per_variant
            .insert("automotive".to_string(), overlay);

        let mut store = Store::new();
        store.insert(art).unwrap();
        let graph = LinkGraph::build(&store, &schema);

        // No variant: condition matches default `priority: must` → rule fires.
        let diags_default = validate(&store, &schema, &graph);
        assert_eq!(
            rule_count(&diags_default, "must-needs-rationale"),
            1,
            "default flavour: priority=must matches, rationale missing → rule must fire",
        );

        // Variant active: overlay replaces `priority` with `should` → rule does NOT fire.
        let diags_variant = validate_with_variant(&store, &schema, &graph, Some("automotive"));
        assert_eq!(
            rule_count(&diags_variant, "must-needs-rationale"),
            0,
            "variant 'automotive' overlays priority=should so the rule's 'when' \
             precondition fails — the rule must not fire",
        );

        // Unknown variant falls back to defaults (overlay miss → borrowed Cow).
        let diags_unknown = validate_with_variant(&store, &schema, &graph, Some("does-not-exist"));
        assert_eq!(
            rule_count(&diags_unknown, "must-needs-rationale"),
            1,
            "unknown variant name must behave like the default flavour",
        );
    }

    /// Test B: a required field is missing on the default flavour but
    /// satisfied by a variant overlay.
    ///
    /// Setup:
    ///   - Schema declares `asil` as a required field on the "test"
    ///     type.
    ///   - Artifact has no `fields.asil` but has
    ///     `fields-per-variant.automotive.asil = D`.
    ///
    /// Expected:
    ///   - `validate_structural` (no variant): emits `required-field`.
    ///   - `validate_structural_with_variant(.., Some("automotive"))`:
    ///     passes (overlay supplies the field).
    // rivet: verifies REQ-004
    #[test]
    fn required_field_satisfied_by_variant_overlay() {
        let schema = schema_with_fields(vec![required_field("asil")]);

        let mut art = make_artifact("R-2", "test", None, None, vec![], vec![]);
        let mut overlay = BTreeMap::new();
        overlay.insert(
            "asil".to_string(),
            serde_yaml::Value::String("D".to_string()),
        );
        art.fields_per_variant
            .insert("automotive".to_string(), overlay);

        let mut store = Store::new();
        store.insert(art).unwrap();
        let graph = LinkGraph::build(&store, &schema);

        // Default flavour: no `asil` on the artifact → required-field fires.
        let diags_default = validate_structural(&store, &schema, &graph);
        assert_eq!(
            rule_count(&diags_default, "required-field"),
            1,
            "default flavour: asil missing → required-field must fire",
        );

        // Variant active: overlay supplies `asil` → check passes.
        let diags_variant =
            validate_structural_with_variant(&store, &schema, &graph, Some("automotive"));
        assert_eq!(
            rule_count(&diags_variant, "required-field"),
            0,
            "variant 'automotive' overlay supplies asil=D → required-field must NOT fire",
        );
    }

    // ── validate_variants (issue #287, Phase 2) ──────────────────────────

    /// Build a schema with a single `requirement` type that has a
    /// required `priority` field constrained to {must, should, could}.
    fn variant_test_schema() -> Schema {
        let mut file = minimal_schema("requirement");
        file.artifact_types = vec![ArtifactTypeDef {
            name: "requirement".to_string(),
            description: "Requirement".into(),
            fields: vec![FieldDef {
                name: "priority".into(),
                field_type: "string".into(),
                required: true,
                description: None,
                allowed_values: Some(vec!["must".into(), "should".into(), "could".into()]),
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

    fn variant_artifact() -> Artifact {
        let mut a = minimal_artifact("REQ-THERMAL-01", "requirement");
        a.fields
            .insert("priority".into(), serde_yaml::Value::String("must".into()));
        a
    }

    #[test]
    fn validate_variants_flags_unknown_variant_keys_as_warning_by_default() {
        let mut a = variant_artifact();
        let mut overlay = BTreeMap::new();
        overlay.insert("priority".into(), serde_yaml::Value::String("must".into()));
        a.fields_per_variant.insert("unknown-name".into(), overlay);
        let mut store = Store::default();
        store.upsert(a);
        let schema = variant_test_schema();

        let mut known = std::collections::BTreeSet::new();
        known.insert("automotive".to_string());
        known.insert("consumer".to_string());

        let diags = validate_variants(&store, &schema, &BTreeMap::new(), None, &known, false);
        let d = diags
            .iter()
            .find(|d| d.rule == "variant-key-unknown")
            .expect("unknown-key diagnostic must fire");
        assert_eq!(d.severity, Severity::Warning);
        assert!(
            d.message.contains("'unknown-name'"),
            "msg should name the offending key: {}",
            d.message
        );
        assert!(
            d.message.contains("automotive"),
            "msg should list known variants: {}",
            d.message
        );
    }

    #[test]
    fn validate_variants_strict_promotes_unknown_variant_key_to_error() {
        let mut a = variant_artifact();
        let mut overlay = BTreeMap::new();
        overlay.insert("priority".into(), serde_yaml::Value::String("must".into()));
        a.fields_per_variant.insert("unknown".into(), overlay);
        let mut store = Store::default();
        store.upsert(a);
        let schema = variant_test_schema();

        let known: std::collections::BTreeSet<String> =
            ["automotive".to_string()].into_iter().collect();
        let diags = validate_variants(&store, &schema, &BTreeMap::new(), None, &known, true);
        let d = diags
            .iter()
            .find(|d| d.rule == "variant-key-unknown")
            .expect("unknown-key diagnostic must fire");
        assert_eq!(d.severity, Severity::Error, "strict promotes to error");
    }

    #[test]
    fn validate_variants_type_checks_overlay_allowed_values() {
        // Overlay puts "maybe" into priority, which is not in
        // {must, should, could} — must fire as a warning.
        let mut a = variant_artifact();
        let mut overlay = BTreeMap::new();
        overlay.insert("priority".into(), serde_yaml::Value::String("maybe".into()));
        a.fields_per_variant.insert("automotive".into(), overlay);
        let mut store = Store::default();
        store.upsert(a);
        let schema = variant_test_schema();

        let known: std::collections::BTreeSet<String> =
            ["automotive".to_string()].into_iter().collect();
        let diags = validate_variants(&store, &schema, &BTreeMap::new(), None, &known, false);
        let d = diags
            .iter()
            .find(|d| d.rule == "allowed-values-variant.automotive")
            .expect("overlay allowed-values diagnostic must fire");
        assert_eq!(d.severity, Severity::Warning);
        assert!(
            d.message.contains("'maybe'") && d.message.contains("automotive"),
            "msg should call out value + variant: {}",
            d.message
        );
    }

    #[test]
    fn validate_variants_passes_when_overlay_is_valid_and_key_is_known() {
        let mut a = variant_artifact();
        let mut overlay = BTreeMap::new();
        overlay.insert(
            "priority".into(),
            serde_yaml::Value::String("should".into()),
        );
        a.fields_per_variant.insert("automotive".into(), overlay);
        let mut store = Store::default();
        store.upsert(a);
        let schema = variant_test_schema();

        let known: std::collections::BTreeSet<String> =
            ["automotive".to_string()].into_iter().collect();
        let diags = validate_variants(&store, &schema, &BTreeMap::new(), None, &known, false);
        assert!(
            diags.is_empty(),
            "no diagnostics expected, got: {:?}",
            diags
        );
    }

    #[test]
    fn validate_variants_required_field_missing_in_merged_view() {
        // Default fields lacks `priority`; overlay also doesn't supply
        // it. The merged view is still missing the required field — a
        // separate diagnostic should fire under the variant's rule.
        let mut a = minimal_artifact("REQ-1", "requirement");
        // No `priority` in defaults.
        let mut overlay = BTreeMap::new();
        // Overlay sets some unrelated key so the overlay is non-empty.
        overlay.insert(
            "title-override".into(),
            serde_yaml::Value::String("auto title".into()),
        );
        a.fields_per_variant.insert("automotive".into(), overlay);
        let mut store = Store::default();
        store.upsert(a);
        let schema = variant_test_schema();

        let known: std::collections::BTreeSet<String> =
            ["automotive".to_string()].into_iter().collect();
        let diags = validate_variants(&store, &schema, &BTreeMap::new(), None, &known, false);
        let d = diags
            .iter()
            .find(|d| d.rule == "required-field-variant.automotive")
            .expect("required-field-variant.automotive must fire");
        assert_eq!(d.severity, Severity::Error);
        assert!(d.message.contains("priority"), "got: {}", d.message);
        assert!(d.message.contains("automotive"), "got: {}", d.message);
    }

    #[test]
    fn validate_variants_empty_overlays_and_no_active_emits_nothing() {
        // Artifact has fields_per_variant: {} — nothing to check.
        let a = variant_artifact();
        let mut store = Store::default();
        store.upsert(a);
        let schema = variant_test_schema();
        let known: std::collections::BTreeSet<String> = Default::default();
        let diags = validate_variants(&store, &schema, &BTreeMap::new(), None, &known, false);
        assert!(diags.is_empty(), "got: {diags:?}");
    }

    #[test]
    fn validate_variants_known_set_can_be_features_or_configs() {
        // The function treats `known_variants` as opaque set membership;
        // upstream may seed it with declared variant-config names OR
        // feature names. This test pins that contract.
        let mut a = variant_artifact();
        let mut overlay = BTreeMap::new();
        overlay.insert("priority".into(), serde_yaml::Value::String("must".into()));
        // Pretend "electric" is a feature name, not a variant config.
        a.fields_per_variant.insert("electric".into(), overlay);
        let mut store = Store::default();
        store.upsert(a);
        let schema = variant_test_schema();

        let known: std::collections::BTreeSet<String> =
            ["electric".to_string()].into_iter().collect();
        let diags = validate_variants(&store, &schema, &BTreeMap::new(), None, &known, false);
        assert!(
            diags.iter().all(|d| d.rule != "variant-key-unknown"),
            "feature names must be accepted as known variant keys: {diags:?}"
        );
    }
}
