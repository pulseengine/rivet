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

use std::borrow::Cow;
use std::collections::HashMap;
use std::path::Path;

use regex::Regex;
use serde::{Deserialize, Serialize};

use crate::model::Artifact;

use crate::error::Error;

// ── YAML file structure ──────────────────────────────────────────────────

/// Top-level structure of a schema YAML file.
///
/// **`Default` impl note:** all collection fields are empty, the
/// agent-pipelines block is `None`, and `schema` falls through to
/// `SchemaMetadata::default()` (empty `name`/`version`). The intent is
/// to let test sites construct minimal SchemaFiles with
/// `..SchemaFile::default()` without enumerating every collection
/// field — production code always loads from YAML and never relies on
/// the default values being meaningful.
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct SchemaFile {
    pub schema: SchemaMetadata,
    #[serde(default, rename = "base-fields")]
    pub base_fields: Vec<FieldDef>,
    #[serde(default, rename = "artifact-types")]
    pub artifact_types: Vec<ArtifactTypeDef>,
    #[serde(default, rename = "link-types")]
    pub link_types: Vec<LinkTypeDef>,
    #[serde(default, rename = "traceability-rules")]
    pub traceability_rules: Vec<TraceabilityRule>,
    #[serde(default, rename = "conditional-rules")]
    pub conditional_rules: Vec<ConditionalRule>,
    /// Status-gate / cross-artifact validation rules. Each entry is a
    /// single s-expression evaluated against every artifact in the store
    /// — fires (emits a diagnostic) when the expression returns false.
    /// Typical shape: `(implies <premise> <consequence>)` where the
    /// consequence uses `forall-linked` / `exists-linked` to gate on
    /// the state of linked artifacts.
    #[serde(default, rename = "validation-rules")]
    pub validation_rules: Vec<ValidationRule>,
    /// Optional agent-pipelines block: declares oracles + pipelines for
    /// `rivet close-gaps`. See `rivet_core::agent_pipelines`. Schemas
    /// without this block are invisible to the pipeline runner.
    #[serde(default, rename = "agent-pipelines")]
    pub agent_pipelines: Option<crate::agent_pipelines::AgentPipelines>,
}

/// **`Default` impl note:** `name` and `version` default to empty
/// strings. YAML deserialisation still requires both to be present
/// (serde's `deny_unknown_fields` + required-by-type semantics); the
/// `Default` is only useful for in-memory test construction via
/// `SchemaMetadata { name: "x".into(), ..Default::default() }`.
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct SchemaMetadata {
    pub name: String,
    pub version: String,
    #[serde(default)]
    pub namespace: Option<String>,
    #[serde(default)]
    pub description: Option<String>,
    #[serde(default)]
    pub extends: Vec<String>,
    #[serde(default, rename = "min-rivet-version")]
    pub min_rivet_version: Option<String>,
    #[serde(default)]
    pub license: Option<String>,
}

// ── Artifact type definition ─────────────────────────────────────────────

/// `Default` impl: empty `name` and `description`, every collection
/// empty, every `Option` field `None`. Useful for test construction
/// via `ArtifactTypeDef { name: "foo".into(), ..Default::default() }`
/// — keeps new fields additive without breaking call sites.
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ArtifactTypeDef {
    pub name: String,
    pub description: String,
    #[serde(default)]
    pub fields: Vec<FieldDef>,
    #[serde(default, rename = "link-fields")]
    pub link_fields: Vec<LinkFieldDef>,
    #[serde(default, rename = "aspice-process")]
    pub aspice_process: Option<String>,
    /// Common mistakes and fix guidance for AI agents and help pages.
    #[serde(default, rename = "common-mistakes")]
    pub common_mistakes: Vec<MistakeGuide>,
    /// Example YAML snippet shown in help pages and guide output.
    #[serde(default)]
    pub example: Option<String>,
    /// YAML section key for format-specific parsing (e.g., "losses" for loss type).
    ///
    /// When set, the schema-driven parser looks for this top-level key in YAML
    /// files and extracts artifacts from it. Shorthand link fields (e.g., `hazards: [H-1]`)
    /// are auto-converted to links using `shorthand-links` mapping.
    #[serde(default, rename = "yaml-section")]
    pub yaml_section: Option<String>,
    /// Additional YAML section keys (for types with multiple sections in one file).
    ///
    /// Example: UCAs split across `core-ucas`, `oslc-ucas`, etc. Each section
    /// maps to the same artifact type with the same shorthand-link conversions.
    #[serde(default, rename = "yaml-sections")]
    pub yaml_sections: Vec<String>,
    /// Suffix pattern for auto-discovering YAML section names.
    ///
    /// When set, any top-level YAML key ending with this suffix (e.g., `-ucas`)
    /// is treated as an additional section for this artifact type, even if not
    /// listed in `yaml-sections`.  This avoids hardcoding project-specific
    /// section names in the schema.
    #[serde(default, rename = "yaml-section-suffix")]
    pub yaml_section_suffix: Option<String>,
    /// Maps shorthand array fields to link types for format-specific parsing.
    ///
    /// Example: `{losses: leads-to-loss}` means `losses: [L-1]` in YAML becomes
    /// `links: [{type: leads-to-loss, target: L-1}]`.
    #[serde(default, rename = "shorthand-links")]
    pub shorthand_links: std::collections::BTreeMap<String, String>,
}

/// A common mistake entry with problem description and fix command.
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct MistakeGuide {
    pub problem: String,
    #[serde(default, rename = "fix-command")]
    pub fix_command: Option<String>,
}

impl ArtifactTypeDef {
    /// Merge `other` (a later-declared form of the same-named type) into
    /// `self` (the earlier-declared form). Fixes issue #154: previously
    /// `Schema::merge` did a plain `HashMap::insert` and silently
    /// dropped the base schema's fields when a bridge/overlay schema
    /// re-declared the type.
    ///
    /// Merge semantics, per field:
    /// - Scalar `Option`s (`aspice_process`, `example`, `yaml_section`,
    ///   `yaml_section_suffix`): later-`Some` wins, else keep earlier.
    /// - `description`: later wins when non-empty, else keep earlier.
    /// - `fields`, `link_fields`: union by `name`; later wins on
    ///   same-name conflicts. (Order: earlier-declared first, then
    ///   later additions in declaration order.)
    /// - `shorthand_links`, `common_mistakes`, `yaml_sections`: union
    ///   (later additions appended; map keys merged, later wins).
    pub fn merge_in_place(&mut self, other: ArtifactTypeDef) {
        if !other.description.trim().is_empty() {
            self.description = other.description;
        }
        if other.aspice_process.is_some() {
            self.aspice_process = other.aspice_process;
        }
        if other.example.is_some() {
            self.example = other.example;
        }
        if other.yaml_section.is_some() {
            self.yaml_section = other.yaml_section;
        }
        if other.yaml_section_suffix.is_some() {
            self.yaml_section_suffix = other.yaml_section_suffix;
        }
        merge_named_vec(&mut self.fields, other.fields, |f| f.name.clone());
        merge_named_vec(&mut self.link_fields, other.link_fields, |f| f.name.clone());
        for s in other.yaml_sections {
            if !self.yaml_sections.contains(&s) {
                self.yaml_sections.push(s);
            }
        }
        self.shorthand_links.extend(other.shorthand_links);
        self.common_mistakes.extend(other.common_mistakes);
    }
}

impl LinkTypeDef {
    /// Merge `other` into `self`. Mirrors `ArtifactTypeDef::merge_in_place`:
    /// scalar fields take the later value when non-empty, list fields
    /// union (dedup), inverse from later wins if set.
    pub fn merge_in_place(&mut self, other: LinkTypeDef) {
        if !other.description.trim().is_empty() {
            self.description = other.description;
        }
        if other.inverse.is_some() {
            self.inverse = other.inverse;
        }
        for t in other.source_types {
            if !self.source_types.contains(&t) {
                self.source_types.push(t);
            }
        }
        for t in other.target_types {
            if !self.target_types.contains(&t) {
                self.target_types.push(t);
            }
        }
    }
}

/// Union two named vectors: items in `incoming` either replace existing
/// items with the same name (later wins) or are appended in declaration
/// order. Preserves the original order of `dst` for items that were
/// already present.
fn merge_named_vec<T, F: Fn(&T) -> String>(dst: &mut Vec<T>, incoming: Vec<T>, name_of: F) {
    for item in incoming {
        let name = name_of(&item);
        if let Some(slot) = dst.iter_mut().find(|d| name_of(*d) == name) {
            *slot = item;
        } else {
            dst.push(item);
        }
    }
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct FieldDef {
    pub name: String,
    #[serde(rename = "type")]
    pub field_type: String,
    #[serde(default)]
    pub required: bool,
    #[serde(default)]
    pub description: Option<String>,
    #[serde(default, rename = "allowed-values")]
    pub allowed_values: Option<Vec<String>>,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct LinkFieldDef {
    pub name: String,
    #[serde(rename = "link-type")]
    pub link_type: String,
    #[serde(default, rename = "target-types")]
    pub target_types: Vec<String>,
    #[serde(default)]
    pub required: bool,
    #[serde(default)]
    pub cardinality: Cardinality,
    /// Free-form description shown in schema docs and AI hints.
    #[serde(default)]
    pub description: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq)]
#[serde(rename_all = "kebab-case")]
pub enum Cardinality {
    ExactlyOne,
    #[default]
    ZeroOrMany,
    ZeroOrOne,
    OneOrMany,
}

// ── Link type definition ─────────────────────────────────────────────────

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct LinkTypeDef {
    pub name: String,
    #[serde(default)]
    pub inverse: Option<String>,
    pub description: String,
    #[serde(default, rename = "source-types")]
    pub source_types: Vec<String>,
    #[serde(default, rename = "target-types")]
    pub target_types: Vec<String>,
}

// ── Traceability rule ────────────────────────────────────────────────────

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct TraceabilityRule {
    pub name: String,
    pub description: String,
    #[serde(rename = "source-type")]
    pub source_type: String,
    #[serde(default, rename = "required-link")]
    pub required_link: Option<String>,
    #[serde(default, rename = "required-backlink")]
    pub required_backlink: Option<String>,
    #[serde(default, rename = "target-types")]
    pub target_types: Vec<String>,
    #[serde(default, rename = "from-types")]
    pub from_types: Vec<String>,
    #[serde(default)]
    pub severity: Severity,
    /// Alternative backlink shapes that satisfy this rule. Each entry
    /// is a `(link-type, from-types)` pair — used by safety-case schemas
    /// to express "supported-by OR decomposed-by OR has-sub-goal" without
    /// duplicating the whole rule.
    #[serde(default, rename = "alternate-backlinks")]
    pub alternate_backlinks: Vec<AlternateBacklink>,
}

/// One alternative backlink shape inside a TraceabilityRule.
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct AlternateBacklink {
    #[serde(rename = "link-type")]
    pub link_type: String,
    #[serde(default, rename = "from-types")]
    pub from_types: Vec<String>,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, Default, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum Severity {
    Info,
    #[default]
    Warning,
    Error,
}

// ── Validation rules (status gates, cross-artifact predicates) ──────────

/// What a `forall-linked` / `exists-linked` quantifier inside a rule's
/// s-expression should do when a link target ID doesn't resolve to an
/// artifact in the local store. YAML-facing name; converts into the
/// engine-side [`crate::sexpr_eval::MissingTargetPolicy`].
///
/// - `skip` (default): treat the unresolved link as vacuous (true for
///   forall, no-contribution for exists). Composes with the existing
///   `broken-links` validation phase — true link breakage is reported
///   there, not by every rule that walks the graph.
/// - `fail`: count an unresolved target as a body-predicate failure.
///   Strictest interpretation; use for safety-critical gates where the
///   absence of evidence is evidence of absence.
#[derive(Debug, Clone, Copy, Serialize, Deserialize, Default, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum MissingTargetPolicyName {
    #[default]
    Skip,
    Fail,
}

impl From<MissingTargetPolicyName> for crate::sexpr_eval::MissingTargetPolicy {
    fn from(name: MissingTargetPolicyName) -> Self {
        match name {
            MissingTargetPolicyName::Skip => Self::Skip,
            MissingTargetPolicyName::Fail => Self::Fail,
        }
    }
}

/// A status-gate / cross-artifact validation rule.
///
/// Each rule is a single s-expression evaluated against every artifact
/// in the store — fires (emits a diagnostic) when the expression
/// returns false. The canonical shape is
/// `(implies <premise> <consequence>)`, where the consequence uses
/// `forall-linked` / `exists-linked` to gate on the state of linked
/// artifacts.
///
/// Example:
///
/// ```yaml
/// validation-rules:
///   - id: V-verif-needs-approved-req
///     description: |
///       A sys/sw/unit-verification can only be approved or released
///       when every requirement it verifies is approved.
///     rule: |
///       (implies
///         (and (or (= type "sys-verification") (= type "sw-verification"))
///              (or (= status "approved") (= status "released")))
///         (forall-linked "verifies" (= status "approved")))
///     on-unresolved: fail
///     severity: error
///     message: |
///       {id} ({type}) is {status} but verifies one or more requirements
///       that are not approved.
/// ```
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ValidationRule {
    /// Rule identifier — surfaced in diagnostics and the `{rule}`
    /// message-template placeholder. Convention: short kebab-case like
    /// `V-verif-needs-approved-req`.
    pub id: String,
    #[serde(default)]
    pub description: Option<String>,
    /// The single s-expression body. Parsed once at validation time and
    /// applied per artifact. The artifact under test is the implicit
    /// `ctx.artifact` for the outer scope; link-traversing quantifiers
    /// shift context to targets/sources.
    pub rule: String,
    /// Missing-target handling for `forall-linked` / `exists-linked`
    /// inside `rule`. Default: skip.
    #[serde(default, rename = "on-unresolved")]
    pub on_unresolved: MissingTargetPolicyName,
    /// If true, violations on `status: draft` artifacts are downgraded
    /// to `Severity::Info` (matches the existing traceability-rule
    /// behaviour). Default: false — status-gate rules typically gate
    /// *by* status, so the rule's `when` clause already filters drafts.
    #[serde(default, rename = "draft-downgrade")]
    pub draft_downgrade: bool,
    /// Diagnostic severity when the rule fires. Default: error.
    #[serde(default = "default_severity")]
    pub severity: Severity,
    /// Optional message template. Placeholders `{id}`, `{type}`,
    /// `{status}`, `{title}`, `{rule}` are substituted from the artifact
    /// under test (and the rule itself for `{rule}`). If absent, a
    /// default message names the rule and the artifact.
    #[serde(default)]
    pub message: Option<String>,
}

// ── Conditional rules ───────────────────────────────────────────────────

fn default_severity() -> Severity {
    Severity::Error
}

/// A conditional validation rule: when a condition is true, require something.
///
/// When `condition` is present, BOTH `condition` AND `when` must match for the
/// rule to fire. This enables compound rules like "AI-generated artifacts with
/// active status must have a reviewer".
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ConditionalRule {
    pub name: String,
    #[serde(default)]
    pub description: Option<String>,
    /// Optional precondition filter — when present, must also match.
    #[serde(default)]
    pub condition: Option<Condition>,
    pub when: Condition,
    pub then: Requirement,
    #[serde(default = "default_severity")]
    pub severity: Severity,
}

/// A condition that tests an artifact field value.
///
/// YAML examples:
/// ```yaml
/// when:
///   field: status
///   equals: approved
/// ```
/// ```yaml
/// when:
///   field: safety
///   matches: "ASIL_.*"
/// ```
/// ```yaml
/// when:
///   field: rationale
///   exists: true
/// ```
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(try_from = "ConditionRaw")]
pub enum Condition {
    Equals { field: String, value: String },
    Matches { field: String, pattern: String },
    Exists { field: String },
}

/// Raw intermediate form for deserializing `Condition` from flat YAML.
#[derive(Deserialize)]
struct ConditionRaw {
    field: String,
    #[serde(default)]
    equals: Option<String>,
    #[serde(default)]
    matches: Option<String>,
    #[serde(default)]
    exists: Option<bool>,
}

impl TryFrom<ConditionRaw> for Condition {
    type Error = String;

    fn try_from(raw: ConditionRaw) -> Result<Self, Self::Error> {
        let count =
            raw.equals.is_some() as u8 + raw.matches.is_some() as u8 + raw.exists.is_some() as u8;
        if count == 0 {
            return Err("condition must have one of 'equals', 'matches', or 'exists'".to_string());
        }
        if count > 1 {
            return Err(
                "condition must have exactly one of 'equals', 'matches', or 'exists'".to_string(),
            );
        }
        if let Some(value) = raw.equals {
            Ok(Condition::Equals {
                field: raw.field,
                value,
            })
        } else if let Some(pattern) = raw.matches {
            Ok(Condition::Matches {
                field: raw.field,
                pattern,
            })
        } else {
            Ok(Condition::Exists { field: raw.field })
        }
    }
}

// Manual Serialize implementation for Condition → flat YAML output
impl Condition {
    /// Check whether an artifact satisfies this condition.
    ///
    /// **Note:** For `Matches` conditions this compiles the regex on every call.
    /// In hot loops, prefer [`matches_artifact_with`] and pre-compile via
    /// [`compile_regex`].
    #[inline]
    pub fn matches_artifact(&self, artifact: &Artifact) -> bool {
        match self {
            Condition::Equals { field, value } => {
                get_field_value(artifact, field).is_some_and(|v| v == *value)
            }
            Condition::Matches { field, pattern } => {
                let Ok(re) = Regex::new(pattern) else {
                    return false;
                };
                get_field_value(artifact, field).is_some_and(|v| re.is_match(&v))
            }
            Condition::Exists { field } => get_field_value(artifact, field).is_some(),
        }
    }

    /// Like [`matches_artifact`] but accepts a pre-compiled regex for `Matches`
    /// conditions, avoiding repeated `Regex::new` calls in tight loops.
    #[inline]
    pub fn matches_artifact_with(&self, artifact: &Artifact, compiled: Option<&Regex>) -> bool {
        match self {
            Condition::Equals { field, value } => {
                get_field_value(artifact, field).is_some_and(|v| v == *value)
            }
            Condition::Matches { field, .. } => {
                if let Some(re) = compiled {
                    get_field_value(artifact, field).is_some_and(|v| re.is_match(&v))
                } else {
                    // Fallback: compile inline (shouldn't normally happen)
                    self.matches_artifact(artifact)
                }
            }
            Condition::Exists { field } => get_field_value(artifact, field).is_some(),
        }
    }

    /// Pre-compile the regex for a `Matches` condition.
    /// Returns `None` for `Equals` / `Exists` conditions or invalid patterns.
    pub fn compile_regex(&self) -> Option<Regex> {
        match self {
            Condition::Matches { pattern, .. } => Regex::new(pattern).ok(),
            _ => None,
        }
    }

    /// Variant-aware twin of [`matches_artifact_with`].
    ///
    /// Resolves the field value through the artifact's per-variant
    /// overlay when `variant` is `Some(_)`. When `variant` is `None`,
    /// behaves identically to [`matches_artifact_with`].
    #[inline]
    pub fn matches_artifact_for_variant_with(
        &self,
        artifact: &Artifact,
        compiled: Option<&Regex>,
        variant: Option<&str>,
    ) -> bool {
        // Fast path: no variant means no overlay; preserve borrowed-Cow path.
        if variant.is_none() {
            return self.matches_artifact_with(artifact, compiled);
        }
        match self {
            Condition::Equals { field, value } => {
                get_field_value_for_variant(artifact, field, variant).is_some_and(|v| v == *value)
            }
            Condition::Matches { field, pattern } => {
                if let Some(re) = compiled {
                    get_field_value_for_variant(artifact, field, variant)
                        .is_some_and(|v| re.is_match(&v))
                } else {
                    // Inline-compile fallback to match the non-variant path
                    // (callers should normally pre-compile via `compile_regex`).
                    let Ok(re) = Regex::new(pattern) else {
                        return false;
                    };
                    get_field_value_for_variant(artifact, field, variant)
                        .is_some_and(|v| re.is_match(&v))
                }
            }
            Condition::Exists { field } => {
                get_field_value_for_variant(artifact, field, variant).is_some()
            }
        }
    }
}

/// Get a string value for a field from an artifact, checking base fields first.
///
/// Returns a `Cow<str>` to avoid cloning when the value is already a `&str`.
///
/// Supports dotted paths (e.g., `provenance.created-by`) to traverse into
/// nested YAML mappings stored in the artifact's `fields` map.
#[inline]
fn get_field_value<'a>(artifact: &'a Artifact, field: &str) -> Option<Cow<'a, str>> {
    // Fast path: check for dotted path first
    if let Some(dot_pos) = field.find('.') {
        let root = &field[..dot_pos];
        let rest = &field[dot_pos + 1..];
        // Dotted paths only apply to the fields map
        let root_val = artifact.fields.get(root)?;
        return resolve_dotted_path(root_val, rest);
    }

    match field {
        "status" => artifact.status.as_deref().map(Cow::Borrowed),
        "description" => artifact.description.as_deref().map(Cow::Borrowed),
        "title" => Some(Cow::Borrowed(&artifact.title)),
        "id" => Some(Cow::Borrowed(&artifact.id)),
        _ => {
            // Check tags: if field == "tags", join them
            if field == "tags" {
                if artifact.tags.is_empty() {
                    None
                } else {
                    Some(Cow::Owned(artifact.tags.join(",")))
                }
            } else {
                // Check fields map
                artifact.fields.get(field).and_then(yaml_value_to_cow)
            }
        }
    }
}

/// Convert a `serde_yaml::Value` to a `Cow<str>`.
///
/// Returns `None` for null values; returns a debug representation for
/// complex types (sequences, mappings).
fn yaml_value_to_cow(v: &serde_yaml::Value) -> Option<Cow<'_, str>> {
    match v {
        serde_yaml::Value::String(s) => Some(Cow::Borrowed(s.as_str())),
        serde_yaml::Value::Bool(b) => Some(Cow::Owned(b.to_string())),
        serde_yaml::Value::Number(n) => Some(Cow::Owned(n.to_string())),
        serde_yaml::Value::Null => None,
        _ => Some(Cow::Owned(format!("{v:?}"))),
    }
}

/// Resolve a dotted path within a `serde_yaml::Value`.
///
/// For example, given a mapping `{created-by: ai, reviewed-by: alice}` and
/// `rest = "created-by"`, returns `Some(Cow::Borrowed("ai"))`.
///
/// Supports arbitrary nesting depth (e.g., `a.b.c`).
fn resolve_dotted_path<'a>(value: &'a serde_yaml::Value, rest: &str) -> Option<Cow<'a, str>> {
    let mapping = value.as_mapping()?;
    if let Some(dot_pos) = rest.find('.') {
        let key = &rest[..dot_pos];
        let remainder = &rest[dot_pos + 1..];
        let child = mapping.get(key)?;
        resolve_dotted_path(child, remainder)
    } else {
        let child = mapping.get(rest)?;
        yaml_value_to_cow(child)
    }
}

/// Variant-aware twin of [`get_field_value`].
///
/// Reads from the artifact's per-variant overlay (via
/// [`Artifact::fields_for_variant`]) so a condition like
/// `field: priority, equals: should` resolves against the variant
/// overlay's `priority` if the variant set one, falling back to the
/// default `fields` map otherwise.
///
/// Returns owned `String` (rather than `Cow<'a, str>`) because the
/// merged map produced by `fields_for_variant` is short-lived when a
/// variant is active. When `variant` is `None`, we delegate to the
/// borrowed-Cow fast path.
///
/// Base fields (`status`, `description`, `title`, `id`, `tags`) are NOT
/// overlay-able — variants only affect entries in the `fields` map,
/// matching the design in `docs/design/variant-aware-properties.md` §5.2.
#[inline]
pub(crate) fn get_field_value_for_variant(
    artifact: &Artifact,
    field: &str,
    variant: Option<&str>,
) -> Option<String> {
    // When no variant is active, defer to the borrowed-Cow fast path
    // to avoid the merge clone.
    if variant.is_none() {
        return get_field_value(artifact, field).map(|c| c.into_owned());
    }

    // Dotted paths (e.g. `provenance.created-by`) read from the fields
    // map only — and we want them variant-aware too.
    if let Some(dot_pos) = field.find('.') {
        let root = &field[..dot_pos];
        let rest = &field[dot_pos + 1..];
        let merged = artifact.fields_for_variant(variant);
        let root_val = merged.get(root)?;
        return resolve_dotted_path(root_val, rest).map(Cow::into_owned);
    }

    match field {
        "status" => artifact.status.clone(),
        "description" => artifact.description.clone(),
        "title" => Some(artifact.title.clone()),
        "id" => Some(artifact.id.clone()),
        _ => {
            if field == "tags" {
                if artifact.tags.is_empty() {
                    None
                } else {
                    Some(artifact.tags.join(","))
                }
            } else {
                let merged = artifact.fields_for_variant(variant);
                merged
                    .get(field)
                    .and_then(yaml_value_to_cow)
                    .map(Cow::into_owned)
            }
        }
    }
}

/// A requirement that must be met when a condition holds.
///
/// YAML examples:
/// ```yaml
/// then:
///   required-fields: [verification-criteria]
/// ```
/// ```yaml
/// then:
///   required-links: [mitigated_by]
/// ```
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(try_from = "RequirementRaw")]
pub enum Requirement {
    RequiredFields { fields: Vec<String> },
    RequiredLinks { link_types: Vec<String> },
}

/// Raw intermediate form for deserializing `Requirement` from flat YAML.
#[derive(Deserialize)]
struct RequirementRaw {
    #[serde(default, rename = "required-fields")]
    required_fields: Option<Vec<String>>,
    #[serde(default, rename = "required-links")]
    required_links: Option<Vec<String>>,
}

impl TryFrom<RequirementRaw> for Requirement {
    type Error = String;

    fn try_from(raw: RequirementRaw) -> Result<Self, Self::Error> {
        match (raw.required_fields, raw.required_links) {
            (Some(fields), None) => Ok(Requirement::RequiredFields { fields }),
            (None, Some(link_types)) => Ok(Requirement::RequiredLinks { link_types }),
            (Some(_), Some(_)) => Err(
                "requirement must have exactly one of 'required-fields' or 'required-links'"
                    .to_string(),
            ),
            (None, None) => Err(
                "requirement must have one of 'required-fields' or 'required-links'".to_string(),
            ),
        }
    }
}

impl Requirement {
    /// Check if an artifact meets this requirement.
    ///
    /// Returns `Some(Diagnostic)` if the requirement is NOT met.
    pub fn check(
        &self,
        artifact: &Artifact,
        rule_name: &str,
        severity: Severity,
    ) -> Vec<crate::validate::Diagnostic> {
        let mut diags = Vec::new();
        match self {
            Requirement::RequiredFields { fields } => {
                for field_name in fields {
                    let has_field = get_field_value(artifact, field_name).is_some();
                    if !has_field {
                        diags.push(crate::validate::Diagnostic { source_file: None, line: None, column: None,
                            severity,
                            artifact_id: Some(artifact.id.clone()),
                            rule: rule_name.to_string(),
                            message: format!(
                                "conditional rule '{}': field '{}' is required when condition is met",
                                rule_name, field_name
                            ),
                        });
                    }
                }
            }
            Requirement::RequiredLinks { link_types } => {
                for lt in link_types {
                    if !artifact.has_link_type(lt) {
                        diags.push(crate::validate::Diagnostic { source_file: None, line: None, column: None,
                            severity,
                            artifact_id: Some(artifact.id.clone()),
                            rule: rule_name.to_string(),
                            message: format!(
                                "conditional rule '{}': link type '{}' is required when condition is met",
                                rule_name, lt
                            ),
                        });
                    }
                }
            }
        }
        diags
    }

    /// Variant-aware twin of [`check`]. `RequiredFields` reads through
    /// the per-variant overlay so a field declared only on the variant
    /// satisfies the requirement.
    ///
    /// `RequiredLinks` is not variant-aware (Phase 2 deliberately keeps
    /// links variant-flat — see `docs/design/variant-aware-properties.md`
    /// §6 Phase 2 scope: "fields only").
    pub fn check_for_variant(
        &self,
        artifact: &Artifact,
        rule_name: &str,
        severity: Severity,
        variant: Option<&str>,
    ) -> Vec<crate::validate::Diagnostic> {
        if variant.is_none() {
            return self.check(artifact, rule_name, severity);
        }
        match self {
            Requirement::RequiredFields { fields } => {
                let mut diags = Vec::new();
                for field_name in fields {
                    let has_field =
                        get_field_value_for_variant(artifact, field_name, variant).is_some();
                    if !has_field {
                        diags.push(crate::validate::Diagnostic {
                            source_file: None,
                            line: None,
                            column: None,
                            severity,
                            artifact_id: Some(artifact.id.clone()),
                            rule: rule_name.to_string(),
                            message: format!(
                                "conditional rule '{}': field '{}' is required when condition is met",
                                rule_name, field_name
                            ),
                        });
                    }
                }
                diags
            }
            Requirement::RequiredLinks { .. } => {
                // Links remain variant-agnostic in Phase 2.
                self.check(artifact, rule_name, severity)
            }
        }
    }
}

// ── Conditional rule consistency checks ────────────────────────────────

/// Check conditional rules for internal consistency.
///
/// Currently detects:
/// - Duplicate rule names
/// - Rules with the same `when` condition that have overlapping required fields/links
///   (future-proofing for contradictory requirements when "forbid" is added)
pub fn check_conditional_consistency(
    rules: &[ConditionalRule],
) -> Vec<crate::validate::Diagnostic> {
    let mut diagnostics = Vec::new();

    // Check for duplicate rule names
    let mut seen_names: HashMap<&str, usize> = HashMap::new();
    for (i, rule) in rules.iter().enumerate() {
        if let Some(&prev_idx) = seen_names.get(rule.name.as_str()) {
            diagnostics.push(crate::validate::Diagnostic {
                source_file: None,
                line: None,
                column: None,
                severity: Severity::Warning,
                artifact_id: None,
                rule: "conditional-rule-consistency".to_string(),
                message: format!(
                    "conditional rule '{}' is defined multiple times (indices {} and {})",
                    rule.name, prev_idx, i
                ),
            });
        } else {
            seen_names.insert(&rule.name, i);
        }
    }

    // Check for rules with equivalent conditions that have overlapping requirements.
    // Two conditions are "equivalent" if they have the same variant and same field/value.
    for i in 0..rules.len() {
        for j in (i + 1)..rules.len() {
            if conditions_equivalent(&rules[i].when, &rules[j].when) {
                if let Some(overlap) = requirements_overlap(&rules[i].then, &rules[j].then) {
                    diagnostics.push(crate::validate::Diagnostic { source_file: None, line: None, column: None,
                        severity: Severity::Warning,
                        artifact_id: None,
                        rule: "conditional-rule-consistency".to_string(),
                        message: format!(
                            "conditional rules '{}' and '{}' have the same condition and overlapping requirements: {}",
                            rules[i].name, rules[j].name, overlap
                        ),
                    });
                }
            }
        }
    }

    diagnostics
}

/// Check if two conditions are semantically equivalent.
fn conditions_equivalent(a: &Condition, b: &Condition) -> bool {
    match (a, b) {
        (
            Condition::Equals {
                field: f1,
                value: v1,
            },
            Condition::Equals {
                field: f2,
                value: v2,
            },
        ) => f1 == f2 && v1 == v2,
        (
            Condition::Matches {
                field: f1,
                pattern: p1,
            },
            Condition::Matches {
                field: f2,
                pattern: p2,
            },
        ) => f1 == f2 && p1 == p2,
        (Condition::Exists { field: f1 }, Condition::Exists { field: f2 }) => f1 == f2,
        _ => false,
    }
}

/// Check if two requirements overlap. Returns a description of the overlap if found.
fn requirements_overlap(a: &Requirement, b: &Requirement) -> Option<String> {
    match (a, b) {
        (
            Requirement::RequiredFields { fields: f1 },
            Requirement::RequiredFields { fields: f2 },
        ) => {
            let overlap: Vec<&String> = f1.iter().filter(|f| f2.contains(f)).collect();
            if overlap.is_empty() {
                None
            } else {
                Some(format!(
                    "both require fields: {:?}",
                    overlap.iter().map(|s| s.as_str()).collect::<Vec<_>>()
                ))
            }
        }
        (
            Requirement::RequiredLinks { link_types: l1 },
            Requirement::RequiredLinks { link_types: l2 },
        ) => {
            let overlap: Vec<&String> = l1.iter().filter(|l| l2.contains(l)).collect();
            if overlap.is_empty() {
                None
            } else {
                Some(format!(
                    "both require links: {:?}",
                    overlap.iter().map(|s| s.as_str()).collect::<Vec<_>>()
                ))
            }
        }
        _ => None,
    }
}

// ── Merged schema (the runtime view) ─────────────────────────────────────

/// A merged schema built from one or more schema files.
/// Provides fast lookup by artifact type name and link type name.
#[derive(Debug, Clone)]
pub struct Schema {
    pub artifact_types: HashMap<String, ArtifactTypeDef>,
    pub link_types: HashMap<String, LinkTypeDef>,
    pub inverse_map: HashMap<String, String>,
    pub traceability_rules: Vec<TraceabilityRule>,
    pub conditional_rules: Vec<ConditionalRule>,
    pub validation_rules: Vec<ValidationRule>,
    /// Schema-wide base fields (`base-fields:`) applied to every artifact —
    /// `id`, `title`, `status`, `tags`, … Retained on the merged schema
    /// (REQ-135) so the validator can enforce e.g. a `status` enum; before
    /// this they were parsed onto `SchemaFile` and dropped by `merge`.
    pub base_fields: Vec<FieldDef>,
}

impl Schema {
    /// Load a schema from a YAML file.
    pub fn load_file(path: &Path) -> Result<SchemaFile, Error> {
        let content = std::fs::read_to_string(path)
            .map_err(|e| Error::Io(format!("{}: {}", path.display(), e)))?;
        let schema_file: SchemaFile = serde_yaml::from_str(&content)
            .map_err(|e| Error::Schema(format!("{}: {}", path.display(), e)))?;
        Ok(schema_file)
    }

    /// Build a merged schema from multiple schema files.
    ///
    /// Later files override earlier ones for types/links with the same name.
    pub fn merge(files: &[SchemaFile]) -> Self {
        let mut artifact_types: HashMap<String, ArtifactTypeDef> = HashMap::new();
        let mut link_types: HashMap<String, LinkTypeDef> = HashMap::new();
        let mut inverse_map = HashMap::new();
        let mut traceability_rules = Vec::new();
        let mut conditional_rules = Vec::new();
        let mut validation_rules = Vec::new();
        // REQ-135: union base-fields across files by name (later-wins on the
        // scalar attributes, mirroring artifact-type field merging).
        let mut base_fields: Vec<FieldDef> = Vec::new();

        for file in files {
            for bf in &file.base_fields {
                if let Some(existing) = base_fields.iter_mut().find(|f| f.name == bf.name) {
                    *existing = bf.clone();
                } else {
                    base_fields.push(bf.clone());
                }
            }
            for at in &file.artifact_types {
                let mut at = at.clone();
                // Populate shorthand_links from link_fields so the YAML
                // parser recognises named-field forms like `targets: [X]`
                // as equivalent to `links: [{type: threatens, target: X}]`.
                // Without this, cardinality validation silently skips the
                // named-field form and "required" links appear absent.
                for lf in &at.link_fields {
                    if lf.name != "links" {
                        at.shorthand_links
                            .entry(lf.name.clone())
                            .or_insert_with(|| lf.link_type.clone());
                    }
                }
                // Issue #154: when an overlay/bridge schema declares a
                // type that already exists in a base schema, MERGE
                // (union fields, scalar Options later-wins) instead of
                // REPLACE. The old `insert` silently dropped the base
                // schema's fields whenever the same name reappeared,
                // which broke every bridge schema that re-declared a
                // type to add a single ASIL field or a single `method`
                // field.
                match artifact_types.entry(at.name.clone()) {
                    std::collections::hash_map::Entry::Occupied(mut e) => {
                        e.get_mut().merge_in_place(at);
                    }
                    std::collections::hash_map::Entry::Vacant(e) => {
                        e.insert(at);
                    }
                }
            }
            for lt in &file.link_types {
                if let Some(inv) = &lt.inverse {
                    inverse_map.insert(lt.name.clone(), inv.clone());
                    inverse_map.insert(inv.clone(), lt.name.clone());
                }
                // Same merge semantics for link types (#154): union
                // source-types / target-types, later wins for scalars.
                match link_types.entry(lt.name.clone()) {
                    std::collections::hash_map::Entry::Occupied(mut e) => {
                        e.get_mut().merge_in_place(lt.clone());
                    }
                    std::collections::hash_map::Entry::Vacant(e) => {
                        e.insert(lt.clone());
                    }
                }
            }
            traceability_rules.extend(file.traceability_rules.iter().cloned());
            conditional_rules.extend(file.conditional_rules.iter().cloned());
            validation_rules.extend(file.validation_rules.iter().cloned());
        }

        Schema {
            artifact_types,
            link_types,
            inverse_map,
            traceability_rules,
            conditional_rules,
            validation_rules,
            base_fields,
        }
    }

    /// Return schema-internal consistency issues as human-readable messages.
    /// Callers should surface these as errors — a schema with dangling
    /// link-field references silently breaks cardinality enforcement for
    /// every artifact that uses the undeclared link type, so the schema
    /// should not reach production without review.
    ///
    /// Checks:
    /// - Every `link-field.link_type` is declared in `link-types:`.
    /// - Every `link-field.target_types` names a known artifact type.
    /// - Every traceability rule's `from_types` and target types exist.
    pub fn validate_consistency(&self) -> Vec<String> {
        let mut issues = Vec::new();
        let type_names: std::collections::HashSet<&str> =
            self.artifact_types.keys().map(String::as_str).collect();
        let link_names: std::collections::HashSet<&str> =
            self.link_types.keys().map(String::as_str).collect();

        for at in self.artifact_types.values() {
            for lf in &at.link_fields {
                if !link_names.contains(lf.link_type.as_str()) {
                    issues.push(format!(
                        "type '{}': link-field '{}' references unknown link type '{}'",
                        at.name, lf.name, lf.link_type
                    ));
                }
                for tt in &lf.target_types {
                    if !type_names.contains(tt.as_str()) {
                        issues.push(format!(
                            "type '{}': link-field '{}' target type '{}' is not a known artifact type",
                            at.name, lf.name, tt
                        ));
                    }
                }
            }
        }
        for rule in &self.traceability_rules {
            for from in &rule.from_types {
                if !type_names.contains(from.as_str()) {
                    issues.push(format!(
                        "rule '{}': from-type '{}' is not a known artifact type",
                        rule.name, from
                    ));
                }
            }
            for target in &rule.target_types {
                if !type_names.contains(target.as_str()) {
                    issues.push(format!(
                        "rule '{}': target-type '{}' is not a known artifact type",
                        rule.name, target
                    ));
                }
            }
        }
        issues
    }

    /// REQ-156 / #410: the single source of truth for *schema-level*
    /// (artifact-independent) consistency diagnostics. Both the salsa
    /// (`db.rs`) and direct (`validate::validate*`) validation paths MUST call
    /// exactly this, so a new schema-level check lands on every surface at
    /// once and can never diverge between `rivet validate` and
    /// `validate --direct` (the bug class REQ-146 / #355 just fixed for
    /// status-gate rules). Adding a future check is a one-line edit here that
    /// cannot be partially applied across call sites.
    pub fn consistency_diagnostics(&self) -> Vec<crate::validate::Diagnostic> {
        let mut diagnostics = check_conditional_consistency(&self.conditional_rules);
        diagnostics.extend(self.check_coverage_rule_consistency());
        diagnostics
    }

    /// REQ-148 / #350: flag a `required-backlink` coverage rule that
    /// advertises a `from-type` the schema's own link rules can never let
    /// form the backlink — the "advertises an unsatisfiable satisfier" class.
    ///
    /// A `required-backlink: <RB>` rule on `source-type: <ST>` with
    /// `from-types: [F, …]` claims an artifact of type `F` satisfies the rule
    /// by forming an outgoing `<RB>` link to the `<ST>` artifact. But if `F`'s
    /// type declares an `<RB>` link-field whose `target-types` excludes `<ST>`,
    /// the `link-target-type` rule rejects that very link, so `F` can never
    /// satisfy the rule. (aspice `swe1-has-verification` lists
    /// `unit-verification`, whose `verifies` link-field targets only
    /// `sw-detail-design`, not `sw-req` — exactly the detour reported on #350.)
    ///
    /// Conservative — prefers false-negatives. Only flags when `F` *declares*
    /// an `<RB>` link-field whose targets demonstrably exclude `<ST>`. If `F`
    /// declares no `<RB>` link-field at all the link is target-unconstrained
    /// (the `link-target-type` rule never fires), so it is not flagged.
    /// Whether the right fix is to widen the link-field or drop the from-type
    /// is a schema-author decision; this check only surfaces the contradiction.
    /// `alternate-backlinks` are checked against their own link type.
    pub fn check_coverage_rule_consistency(&self) -> Vec<crate::validate::Diagnostic> {
        let mut diagnostics = Vec::new();
        for rule in &self.traceability_rules {
            let Some(backlink) = rule.required_backlink.as_deref() else {
                continue;
            };
            let st = rule.source_type.as_str();
            // (link-type, from-types) pairs: the primary backlink + alternates.
            let mut checks: Vec<(&str, &[String])> = vec![(backlink, rule.from_types.as_slice())];
            for alt in &rule.alternate_backlinks {
                checks.push((alt.link_type.as_str(), alt.from_types.as_slice()));
            }
            for (link_type, from_types) in checks {
                for from in from_types {
                    if let Some(allowed) = self.unsatisfiable_backlink_targets(from, link_type, st)
                    {
                        diagnostics.push(crate::validate::Diagnostic {
                            source_file: None,
                            line: None,
                            column: None,
                            severity: Severity::Warning,
                            artifact_id: None,
                            rule: "coverage-rule-consistency".to_string(),
                            message: format!(
                                "coverage rule '{}' lists from-type '{}' as a '{}' satisfier for \
                                 '{}', but '{}'s '{}' link-field only targets {:?} — it can never \
                                 form '{}' --{}--> '{}', so that satisfier is unreachable (widen \
                                 the link-field's target-types or drop the from-type)",
                                rule.name,
                                from,
                                link_type,
                                st,
                                from,
                                link_type,
                                allowed,
                                from,
                                link_type,
                                st
                            ),
                        });
                    }
                }
            }
        }
        diagnostics
    }

    /// Helper for [`Self::check_coverage_rule_consistency`]. Returns
    /// `Some(allowed_targets)` when type `from` declares a `link_type`
    /// link-field that demonstrably cannot target `to` (backlink
    /// unsatisfiable); `None` when it can, is unconstrained, or `from`
    /// declares no such link-field.
    fn unsatisfiable_backlink_targets(
        &self,
        from: &str,
        link_type: &str,
        to: &str,
    ) -> Option<Vec<String>> {
        let td = self.artifact_types.get(from)?;
        let matching: Vec<&LinkFieldDef> = td
            .link_fields
            .iter()
            .filter(|lf| lf.link_type == link_type)
            .collect();
        if matching.is_empty() {
            // No declared link-field for this link type -> target-unconstrained.
            return None;
        }
        let satisfiable = matching
            .iter()
            .any(|lf| lf.target_types.is_empty() || lf.target_types.iter().any(|t| t == to));
        if satisfiable {
            return None;
        }
        let mut allowed: Vec<String> = matching
            .iter()
            .flat_map(|lf| lf.target_types.iter().cloned())
            .collect();
        allowed.sort();
        allowed.dedup();
        Some(allowed)
    }

    /// Look up an artifact type definition by name.
    #[inline]
    pub fn artifact_type(&self, name: &str) -> Option<&ArtifactTypeDef> {
        self.artifact_types.get(name)
    }

    /// Whether an artifact of `from_type` can form a `link_type` link that
    /// targets an artifact of `target_type`, per the schema's per-type link
    /// field target allow-list.
    ///
    /// An empty (or absent) `target-types` allow-list means *unconstrained*, so
    /// the link is permitted — and an unknown `from_type` (or a type that
    /// doesn't declare this link field) is treated as permitted too, to avoid
    /// over-asserting impossibility. Used to tell a user, when a required
    /// backlink lists several source types, which of them can actually attach
    /// here directly vs. only via an intermediate artifact (#350 / REQ-178).
    pub fn from_type_can_link(&self, from_type: &str, link_type: &str, target_type: &str) -> bool {
        let Some(td) = self.artifact_type(from_type) else {
            return true;
        };
        match td.link_fields.iter().find(|lf| lf.link_type == link_type) {
            Some(lf) => {
                lf.target_types.is_empty() || lf.target_types.iter().any(|t| t == target_type)
            }
            None => true,
        }
    }

    /// Look up a link type definition by name.
    #[inline]
    pub fn link_type(&self, name: &str) -> Option<&LinkTypeDef> {
        self.link_types.get(name)
    }

    /// Get the inverse link type name, if one is defined.
    #[inline]
    pub fn inverse_of(&self, link_type: &str) -> Option<&str> {
        self.inverse_map.get(link_type).map(|s| s.as_str())
    }

    /// True if `link_type` is declared as its own `link-types:` entry — i.e.
    /// a project may materialize links of that type. A name that only appears
    /// as an `inverse:` on some other link type (with no `LinkTypeDef` of its
    /// own) is not authorable: `rivet validate` will reject artifacts that
    /// carry such links with `unknown-link-type`. Callers that reason about
    /// what a project can *write* (as opposed to what edges the schema
    /// implies) use this predicate. Notably the `bidirectional` oracle uses
    /// it to avoid demanding an inverse the schema forbids authoring — see
    /// #648.
    #[inline]
    pub fn is_authorable_link_type(&self, link_type: &str) -> bool {
        self.link_types.contains_key(link_type)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::test_helpers::minimal_artifact;
    use std::borrow::Cow;

    // rivet: verifies REQ-178
    #[test]
    fn from_type_can_link_respects_link_field_targets() {
        // Use the real embedded aspice schema (the #350 scenario).
        let schema = crate::embedded::load_schemas_with_fallback(
            &["common".to_string(), "aspice".to_string()],
            std::path::Path::new("/nonexistent-schemas-dir"),
        )
        .expect("embedded common+aspice must load");

        // sw-verification CAN `verifies` a sw-req (its link-field allows it)…
        assert!(schema.from_type_can_link("sw-verification", "verifies", "sw-req"));
        // …and after #652, unit-verification CAN too — its `verifies` now targets
        // sw-req alongside sw-detail-design so the `swe1-has-verification`
        // coverage-rule satisfier is reachable.
        assert!(schema.from_type_can_link("unit-verification", "verifies", "sw-req"));
        assert!(schema.from_type_can_link("unit-verification", "verifies", "sw-detail-design"));
        // …but the check still respects the target list: sw-arch-component is not
        // among unit-verification's `verifies` targets, so this stays false.
        assert!(!schema.from_type_can_link("unit-verification", "verifies", "sw-arch-component"));
        // Unknown types / undeclared links are treated as permitted (no over-assert).
        assert!(schema.from_type_can_link("made-up-type", "verifies", "sw-req"));
    }

    /// Build an artifact with custom fields in the `fields` map.
    fn artifact_with_fields(id: &str, fields: Vec<(&str, serde_yaml::Value)>) -> Artifact {
        let mut a = minimal_artifact(id, "test");
        for (k, v) in fields {
            a.fields.insert(k.to_string(), v);
        }
        a
    }

    // ── get_field_value tests ────────────────────────────────────────────

    #[test]
    fn get_field_value_returns_borrowed_for_id() {
        let a = minimal_artifact("X-1", "test");
        let val = get_field_value(&a, "id");
        assert_eq!(val, Some(Cow::Borrowed("X-1")));
    }

    #[test]
    fn get_field_value_returns_borrowed_for_title() {
        let a = minimal_artifact("X-1", "test");
        let val = get_field_value(&a, "title");
        assert_eq!(val, Some(Cow::Borrowed("Test X-1")));
    }

    #[test]
    fn get_field_value_returns_borrowed_for_status() {
        let mut a = minimal_artifact("X-1", "test");
        a.status = Some("approved".into());
        let val = get_field_value(&a, "status");
        assert_eq!(val, Some(Cow::Borrowed("approved")));
    }

    #[test]
    fn get_field_value_returns_none_for_missing_status() {
        let a = minimal_artifact("X-1", "test");
        let val = get_field_value(&a, "status");
        assert_eq!(val, None);
    }

    #[test]
    fn get_field_value_returns_borrowed_for_description() {
        let mut a = minimal_artifact("X-1", "test");
        a.description = Some("A description".into());
        let val = get_field_value(&a, "description");
        assert_eq!(val, Some(Cow::Borrowed("A description")));
    }

    #[test]
    fn get_field_value_returns_none_for_missing_description() {
        let a = minimal_artifact("X-1", "test");
        let val = get_field_value(&a, "description");
        assert_eq!(val, None);
    }

    #[test]
    fn get_field_value_tags_empty_returns_none() {
        let a = minimal_artifact("X-1", "test");
        let val = get_field_value(&a, "tags");
        assert_eq!(val, None);
    }

    #[test]
    fn get_field_value_tags_joined() {
        let mut a = minimal_artifact("X-1", "test");
        a.tags = vec!["safety".into(), "asil-b".into()];
        let val = get_field_value(&a, "tags");
        assert_eq!(val, Some(Cow::<str>::Owned("safety,asil-b".into())));
    }

    #[test]
    fn get_field_value_custom_string_field() {
        let a = artifact_with_fields(
            "X-1",
            vec![("safety", serde_yaml::Value::String("ASIL_B".into()))],
        );
        let val = get_field_value(&a, "safety");
        assert_eq!(val, Some(Cow::Borrowed("ASIL_B")));
    }

    #[test]
    fn get_field_value_custom_bool_field() {
        let a = artifact_with_fields("X-1", vec![("critical", serde_yaml::Value::Bool(true))]);
        let val = get_field_value(&a, "critical");
        assert_eq!(val, Some(Cow::<str>::Owned("true".into())));
    }

    #[test]
    fn get_field_value_custom_number_field() {
        let a = artifact_with_fields(
            "X-1",
            vec![(
                "priority",
                serde_yaml::Value::Number(serde_yaml::Number::from(42)),
            )],
        );
        let val = get_field_value(&a, "priority");
        assert_eq!(val, Some(Cow::<str>::Owned("42".into())));
    }

    #[test]
    fn get_field_value_missing_custom_field() {
        let a = minimal_artifact("X-1", "test");
        let val = get_field_value(&a, "nonexistent");
        assert_eq!(val, None);
    }

    // ── compile_regex tests ──────────────────────────────────────────────

    #[test]
    fn compile_regex_returns_some_for_matches_condition() {
        let cond = Condition::Matches {
            field: "safety".into(),
            pattern: "ASIL_.*".into(),
        };
        let re = cond.compile_regex();
        assert!(re.is_some());
        assert!(re.unwrap().is_match("ASIL_B"));
    }

    #[test]
    fn compile_regex_returns_none_for_equals_condition() {
        let cond = Condition::Equals {
            field: "status".into(),
            value: "approved".into(),
        };
        assert!(cond.compile_regex().is_none());
    }

    #[test]
    fn compile_regex_returns_none_for_exists_condition() {
        let cond = Condition::Exists {
            field: "description".into(),
        };
        assert!(cond.compile_regex().is_none());
    }

    #[test]
    fn compile_regex_returns_none_for_invalid_pattern() {
        let cond = Condition::Matches {
            field: "x".into(),
            pattern: "[invalid(".into(),
        };
        assert!(cond.compile_regex().is_none());
    }

    // ── matches_artifact_with tests ──────────────────────────────────────

    #[test]
    fn matches_artifact_with_precompiled_regex() {
        let cond = Condition::Matches {
            field: "safety".into(),
            pattern: "ASIL_.*".into(),
        };
        let re = cond.compile_regex();
        let a = artifact_with_fields(
            "X-1",
            vec![("safety", serde_yaml::Value::String("ASIL_D".into()))],
        );
        assert!(cond.matches_artifact_with(&a, re.as_ref()));
    }

    #[test]
    fn matches_artifact_with_precompiled_regex_no_match() {
        let cond = Condition::Matches {
            field: "safety".into(),
            pattern: "ASIL_.*".into(),
        };
        let re = cond.compile_regex();
        let a = artifact_with_fields(
            "X-1",
            vec![("safety", serde_yaml::Value::String("QM".into()))],
        );
        assert!(!cond.matches_artifact_with(&a, re.as_ref()));
    }

    #[test]
    fn matches_artifact_with_none_regex_falls_back() {
        // When compiled regex is None for a Matches condition, falls back to
        // inline compilation via matches_artifact.
        let cond = Condition::Matches {
            field: "safety".into(),
            pattern: "ASIL_.*".into(),
        };
        let a = artifact_with_fields(
            "X-1",
            vec![("safety", serde_yaml::Value::String("ASIL_C".into()))],
        );
        assert!(cond.matches_artifact_with(&a, None));
    }

    #[test]
    fn matches_artifact_with_equals_ignores_compiled() {
        let cond = Condition::Equals {
            field: "status".into(),
            value: "approved".into(),
        };
        let mut a = minimal_artifact("X-1", "test");
        a.status = Some("approved".into());
        // Pass Some regex even though it's Equals — should be ignored
        let dummy_re = Regex::new(".*").unwrap();
        assert!(cond.matches_artifact_with(&a, Some(&dummy_re)));
    }

    #[test]
    fn matches_artifact_with_exists_ignores_compiled() {
        let cond = Condition::Exists {
            field: "description".into(),
        };
        let mut a = minimal_artifact("X-1", "test");
        a.description = Some("present".into());
        assert!(cond.matches_artifact_with(&a, None));
    }

    // ── dotted field access tests ───────────────────────────────────────

    /// Helper: create a provenance mapping as a serde_yaml::Value.
    fn provenance_mapping(entries: &[(&str, &str)]) -> serde_yaml::Value {
        let mut map = serde_yaml::Mapping::new();
        for (k, v) in entries {
            map.insert(
                serde_yaml::Value::String(k.to_string()),
                serde_yaml::Value::String(v.to_string()),
            );
        }
        serde_yaml::Value::Mapping(map)
    }

    #[test]
    fn get_field_value_dotted_path_simple() {
        let a = artifact_with_fields(
            "X-1",
            vec![(
                "provenance",
                provenance_mapping(&[("created-by", "ai"), ("reviewed-by", "alice")]),
            )],
        );
        let val = get_field_value(&a, "provenance.created-by");
        assert_eq!(val, Some(Cow::Borrowed("ai")));
    }

    #[test]
    fn get_field_value_dotted_path_missing_leaf() {
        let a = artifact_with_fields(
            "X-1",
            vec![("provenance", provenance_mapping(&[("created-by", "ai")]))],
        );
        let val = get_field_value(&a, "provenance.reviewed-by");
        assert_eq!(val, None);
    }

    #[test]
    fn get_field_value_dotted_path_missing_root() {
        let a = minimal_artifact("X-1", "test");
        let val = get_field_value(&a, "provenance.created-by");
        assert_eq!(val, None);
    }

    #[test]
    fn get_field_value_dotted_path_root_not_mapping() {
        let a = artifact_with_fields(
            "X-1",
            vec![("provenance", serde_yaml::Value::String("flat".into()))],
        );
        let val = get_field_value(&a, "provenance.created-by");
        assert_eq!(val, None);
    }

    #[test]
    fn get_field_value_dotted_path_deeply_nested() {
        let mut inner = serde_yaml::Mapping::new();
        inner.insert(
            serde_yaml::Value::String("key".into()),
            serde_yaml::Value::String("deep-value".into()),
        );
        let mut outer = serde_yaml::Mapping::new();
        outer.insert(
            serde_yaml::Value::String("nested".into()),
            serde_yaml::Value::Mapping(inner),
        );
        let a = artifact_with_fields("X-1", vec![("root", serde_yaml::Value::Mapping(outer))]);
        let val = get_field_value(&a, "root.nested.key");
        assert_eq!(val, Some(Cow::Borrowed("deep-value")));
    }

    #[test]
    fn condition_matches_dotted_field() {
        let cond = Condition::Matches {
            field: "provenance.created-by".into(),
            pattern: "^(ai|ai-assisted)$".into(),
        };
        let a = artifact_with_fields(
            "X-1",
            vec![("provenance", provenance_mapping(&[("created-by", "ai")]))],
        );
        assert!(cond.matches_artifact(&a));
    }

    #[test]
    fn condition_matches_dotted_field_no_match() {
        let cond = Condition::Matches {
            field: "provenance.created-by".into(),
            pattern: "^(ai|ai-assisted)$".into(),
        };
        let a = artifact_with_fields(
            "X-1",
            vec![("provenance", provenance_mapping(&[("created-by", "human")]))],
        );
        assert!(!cond.matches_artifact(&a));
    }

    #[test]
    fn condition_exists_dotted_field() {
        let cond = Condition::Exists {
            field: "provenance.reviewed-by".into(),
        };
        let a = artifact_with_fields(
            "X-1",
            vec![(
                "provenance",
                provenance_mapping(&[("created-by", "ai"), ("reviewed-by", "alice")]),
            )],
        );
        assert!(cond.matches_artifact(&a));
    }

    #[test]
    fn condition_exists_dotted_field_missing() {
        let cond = Condition::Exists {
            field: "provenance.reviewed-by".into(),
        };
        let a = artifact_with_fields(
            "X-1",
            vec![("provenance", provenance_mapping(&[("created-by", "ai")]))],
        );
        assert!(!cond.matches_artifact(&a));
    }

    // ── compound conditional rule (condition + when) tests ──────────────

    #[test]
    fn ai_generated_active_without_reviewer_gets_warning() {
        use crate::schema::{ArtifactTypeDef, Condition, ConditionalRule, Requirement, Severity};
        use crate::test_helpers::{minimal_schema, pipeline};

        let mut schema_file = minimal_schema("test");
        schema_file.artifact_types.push(ArtifactTypeDef {
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
            shorthand_links: Default::default(),
        });
        schema_file.conditional_rules.push(ConditionalRule {
            name: "ai-generated-needs-review".into(),
            description: Some(
                "AI-generated artifacts with active status must have a reviewer".into(),
            ),
            condition: Some(Condition::Matches {
                field: "provenance.created-by".into(),
                pattern: "^(ai|ai-assisted)$".into(),
            }),
            when: Condition::Equals {
                field: "status".into(),
                value: "active".into(),
            },
            then: Requirement::RequiredFields {
                fields: vec!["provenance.reviewed-by".into()],
            },
            severity: Severity::Warning,
        });

        // AI-generated, active, no reviewer
        let mut art = minimal_artifact("REQ-1", "requirement");
        art.status = Some("active".into());
        art.fields.insert(
            "provenance".into(),
            provenance_mapping(&[("created-by", "ai")]),
        );

        let (schema, store, graph) = pipeline(schema_file, vec![art]);
        let diags = crate::validate::validate(&store, &schema, &graph);

        let rule_diags: Vec<_> = diags
            .iter()
            .filter(|d| d.rule == "ai-generated-needs-review")
            .collect();
        assert_eq!(rule_diags.len(), 1);
        assert_eq!(rule_diags[0].severity, Severity::Warning);
        assert!(rule_diags[0].message.contains("provenance.reviewed-by"));
    }

    #[test]
    fn ai_generated_active_with_reviewer_passes() {
        use crate::schema::{ArtifactTypeDef, Condition, ConditionalRule, Requirement, Severity};
        use crate::test_helpers::{minimal_schema, pipeline};

        let mut schema_file = minimal_schema("test");
        schema_file.artifact_types.push(ArtifactTypeDef {
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
            shorthand_links: Default::default(),
        });
        schema_file.conditional_rules.push(ConditionalRule {
            name: "ai-generated-needs-review".into(),
            description: Some(
                "AI-generated artifacts with active status must have a reviewer".into(),
            ),
            condition: Some(Condition::Matches {
                field: "provenance.created-by".into(),
                pattern: "^(ai|ai-assisted)$".into(),
            }),
            when: Condition::Equals {
                field: "status".into(),
                value: "active".into(),
            },
            then: Requirement::RequiredFields {
                fields: vec!["provenance.reviewed-by".into()],
            },
            severity: Severity::Warning,
        });

        // AI-generated, active, WITH reviewer
        let mut art = minimal_artifact("REQ-1", "requirement");
        art.status = Some("active".into());
        art.fields.insert(
            "provenance".into(),
            provenance_mapping(&[("created-by", "ai"), ("reviewed-by", "alice")]),
        );

        let (schema, store, graph) = pipeline(schema_file, vec![art]);
        let diags = crate::validate::validate(&store, &schema, &graph);

        let rule_diags: Vec<_> = diags
            .iter()
            .filter(|d| d.rule == "ai-generated-needs-review")
            .collect();
        assert_eq!(rule_diags.len(), 0);
    }

    #[test]
    fn human_authored_active_not_affected_by_ai_rule() {
        use crate::schema::{ArtifactTypeDef, Condition, ConditionalRule, Requirement, Severity};
        use crate::test_helpers::{minimal_schema, pipeline};

        let mut schema_file = minimal_schema("test");
        schema_file.artifact_types.push(ArtifactTypeDef {
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
            shorthand_links: Default::default(),
        });
        schema_file.conditional_rules.push(ConditionalRule {
            name: "ai-generated-needs-review".into(),
            description: Some(
                "AI-generated artifacts with active status must have a reviewer".into(),
            ),
            condition: Some(Condition::Matches {
                field: "provenance.created-by".into(),
                pattern: "^(ai|ai-assisted)$".into(),
            }),
            when: Condition::Equals {
                field: "status".into(),
                value: "active".into(),
            },
            then: Requirement::RequiredFields {
                fields: vec!["provenance.reviewed-by".into()],
            },
            severity: Severity::Warning,
        });

        // Human-authored, active, no reviewer
        let mut art = minimal_artifact("REQ-1", "requirement");
        art.status = Some("active".into());
        art.fields.insert(
            "provenance".into(),
            provenance_mapping(&[("created-by", "human")]),
        );

        let (schema, store, graph) = pipeline(schema_file, vec![art]);
        let diags = crate::validate::validate(&store, &schema, &graph);

        let rule_diags: Vec<_> = diags
            .iter()
            .filter(|d| d.rule == "ai-generated-needs-review")
            .collect();
        assert_eq!(
            rule_diags.len(),
            0,
            "human-authored artifact should not trigger AI review rule"
        );
    }

    #[test]
    fn ai_generated_draft_not_affected_by_active_rule() {
        use crate::schema::{ArtifactTypeDef, Condition, ConditionalRule, Requirement, Severity};
        use crate::test_helpers::{minimal_schema, pipeline};

        let mut schema_file = minimal_schema("test");
        schema_file.artifact_types.push(ArtifactTypeDef {
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
            shorthand_links: Default::default(),
        });
        schema_file.conditional_rules.push(ConditionalRule {
            name: "ai-generated-needs-review".into(),
            description: Some(
                "AI-generated artifacts with active status must have a reviewer".into(),
            ),
            condition: Some(Condition::Matches {
                field: "provenance.created-by".into(),
                pattern: "^(ai|ai-assisted)$".into(),
            }),
            when: Condition::Equals {
                field: "status".into(),
                value: "active".into(),
            },
            then: Requirement::RequiredFields {
                fields: vec!["provenance.reviewed-by".into()],
            },
            severity: Severity::Warning,
        });

        // AI-generated but draft status — rule should NOT fire
        let mut art = minimal_artifact("REQ-1", "requirement");
        art.status = Some("draft".into());
        art.fields.insert(
            "provenance".into(),
            provenance_mapping(&[("created-by", "ai")]),
        );

        let (schema, store, graph) = pipeline(schema_file, vec![art]);
        let diags = crate::validate::validate(&store, &schema, &graph);

        let rule_diags: Vec<_> = diags
            .iter()
            .filter(|d| d.rule == "ai-generated-needs-review")
            .collect();
        assert_eq!(
            rule_diags.len(),
            0,
            "draft AI artifact should not trigger review rule"
        );
    }

    // ── Issue #154: schema merge should UNION, not REPLACE ──────────────

    fn mk_schema_file(name: &str, types: Vec<ArtifactTypeDef>) -> SchemaFile {
        SchemaFile {
            schema: SchemaMetadata {
                name: name.into(),
                version: "0.1.0".into(),
                namespace: None,
                description: None,
                extends: vec![],
                min_rivet_version: None,
                license: None,
            },
            base_fields: vec![],
            artifact_types: types,
            link_types: vec![],
            traceability_rules: vec![],
            conditional_rules: vec![],
            validation_rules: vec![],
            agent_pipelines: None,
        }
    }

    fn mk_type(name: &str, fields: Vec<&str>, link_fields: Vec<(&str, &str)>) -> ArtifactTypeDef {
        ArtifactTypeDef {
            name: name.into(),
            description: format!("{name} type"),
            fields: fields
                .into_iter()
                .map(|f| FieldDef {
                    name: f.into(),
                    field_type: "string".into(),
                    required: false,
                    description: None,
                    allowed_values: None,
                })
                .collect(),
            link_fields: link_fields
                .into_iter()
                .map(|(name, link_type)| LinkFieldDef {
                    name: name.into(),
                    link_type: link_type.into(),
                    target_types: vec![],
                    required: false,
                    cardinality: Cardinality::ZeroOrMany,
                    description: None,
                })
                .collect(),
            aspice_process: None,
            common_mistakes: vec![],
            example: None,
            yaml_section: None,
            yaml_sections: vec![],
            yaml_section_suffix: None,
            shorthand_links: std::collections::BTreeMap::new(),
        }
    }

    /// Issue #154: when a bridge / overlay schema declares the same-name
    /// type as a base schema, the base's `fields` were silently dropped.
    /// After the fix, the two field-sets must union by name.
    #[test]
    fn merge_same_name_artifact_type_unions_fields() {
        let base = mk_schema_file(
            "base",
            vec![mk_type("feature", vec!["phase", "baseline"], vec![])],
        );
        let overlay = mk_schema_file("overlay", vec![mk_type("feature", vec!["method"], vec![])]);
        let schema = Schema::merge(&[base, overlay]);

        let feat = schema
            .artifact_types
            .get("feature")
            .expect("feature type must survive merge");
        let field_names: Vec<&str> = feat.fields.iter().map(|f| f.name.as_str()).collect();
        assert!(
            field_names.contains(&"phase"),
            "base 'phase' must survive overlay merge — issue #154"
        );
        assert!(
            field_names.contains(&"baseline"),
            "base 'baseline' must survive overlay merge"
        );
        assert!(
            field_names.contains(&"method"),
            "overlay 'method' must be added"
        );
    }

    /// `link_fields` get the same treatment — overlay must not drop the
    /// base's link-fields.
    #[test]
    fn merge_same_name_artifact_type_unions_link_fields() {
        let base = mk_schema_file(
            "base",
            vec![mk_type("feature", vec![], vec![("satisfies", "satisfies")])],
        );
        let overlay = mk_schema_file(
            "overlay",
            vec![mk_type(
                "feature",
                vec![],
                vec![("derives-from", "derives-from")],
            )],
        );
        let schema = Schema::merge(&[base, overlay]);

        let feat = schema.artifact_types.get("feature").unwrap();
        let lf_names: Vec<&str> = feat.link_fields.iter().map(|f| f.name.as_str()).collect();
        assert!(lf_names.contains(&"satisfies"), "base link-field survives");
        assert!(
            lf_names.contains(&"derives-from"),
            "overlay link-field is added"
        );
    }

    /// After merging, `shorthand_links` must contain entries for all
    /// link-fields from BOTH schemas — guards the secondary issue (the
    /// stpa-yaml shorthand expansion silently stops working when a
    /// bridge schema redeclares a type without its parent link-fields).
    #[test]
    fn merge_preserves_shorthand_links_from_parent() {
        let base = mk_schema_file(
            "base",
            vec![mk_type("uca", vec![], vec![("controller", "issued-by")])],
        );
        let overlay = mk_schema_file("overlay", vec![mk_type("uca", vec!["criticality"], vec![])]);
        let schema = Schema::merge(&[base, overlay]);

        let uca = schema.artifact_types.get("uca").unwrap();
        assert!(
            uca.shorthand_links.contains_key("controller"),
            "base shorthand-link must survive bridge re-declaration"
        );
    }

    /// Merging the same file twice must be a no-op (idempotence).
    #[test]
    fn merge_idempotent_with_same_file_twice() {
        let file = mk_schema_file(
            "self",
            vec![mk_type("feature", vec!["phase", "baseline"], vec![])],
        );
        let once = Schema::merge(&[file.clone()]);
        let twice = Schema::merge(&[file.clone(), file]);

        let f1 = once.artifact_types.get("feature").unwrap();
        let f2 = twice.artifact_types.get("feature").unwrap();
        assert_eq!(
            f1.fields.len(),
            f2.fields.len(),
            "merging a file with itself must not duplicate fields"
        );
        assert_eq!(f1.link_fields.len(), f2.link_fields.len());
    }

    /// Two non-conflicting overlays should produce the same merged shape
    /// regardless of declaration order.
    #[test]
    fn merge_order_independent_for_disjoint_additions() {
        let base = mk_schema_file("base", vec![mk_type("feature", vec!["phase"], vec![])]);
        let overlay_a = mk_schema_file("a", vec![mk_type("feature", vec!["method"], vec![])]);
        let overlay_b = mk_schema_file("b", vec![mk_type("feature", vec!["criticality"], vec![])]);

        let ab = Schema::merge(&[base.clone(), overlay_a.clone(), overlay_b.clone()]);
        let ba = Schema::merge(&[base, overlay_b, overlay_a]);

        let mut ab_fields: Vec<String> = ab
            .artifact_types
            .get("feature")
            .unwrap()
            .fields
            .iter()
            .map(|f| f.name.clone())
            .collect();
        let mut ba_fields: Vec<String> = ba
            .artifact_types
            .get("feature")
            .unwrap()
            .fields
            .iter()
            .map(|f| f.name.clone())
            .collect();
        ab_fields.sort();
        ba_fields.sort();
        assert_eq!(ab_fields, ba_fields, "field set must be order-independent");
    }

    /// Link-type union: `source-types` and `target-types` accumulate
    /// across schemas that redeclare the same link type.
    #[test]
    fn merge_same_name_link_type_unions_target_types() {
        let base = mk_schema_file("base", vec![]);
        let mut base = base;
        base.link_types.push(LinkTypeDef {
            name: "derives-from".into(),
            inverse: Some("derived-into".into()),
            description: "base".into(),
            source_types: vec!["requirement".into()],
            target_types: vec!["stakeholder-req".into()],
        });
        let overlay = mk_schema_file("overlay", vec![]);
        let mut overlay = overlay;
        overlay.link_types.push(LinkTypeDef {
            name: "derives-from".into(),
            inverse: None,
            description: "overlay extension".into(),
            source_types: vec![],
            target_types: vec!["sys-req".into()],
        });
        let schema = Schema::merge(&[base, overlay]);

        let lt = schema.link_types.get("derives-from").unwrap();
        assert!(
            lt.target_types.contains(&"stakeholder-req".into()),
            "base target-type survives"
        );
        assert!(
            lt.target_types.contains(&"sys-req".into()),
            "overlay target-type is added"
        );
        assert_eq!(
            lt.inverse,
            Some("derived-into".into()),
            "base inverse survives when overlay doesn't redeclare it"
        );
    }

    // ── coverage-rule consistency (REQ-148 / #350) ──────────────────────────

    /// Helper: an artifact type whose `verifies` link-field targets exactly
    /// `targets` (empty = any).
    fn verifier_type(name: &str, targets: &[&str]) -> ArtifactTypeDef {
        let mut td = mk_type(name, vec![], vec![]);
        td.link_fields = vec![LinkFieldDef {
            name: "verifies".into(),
            link_type: "verifies".into(),
            target_types: targets.iter().map(|s| (*s).into()).collect(),
            required: false,
            cardinality: Cardinality::ZeroOrMany,
            description: None,
        }];
        td
    }

    #[test]
    fn coverage_rule_flags_unsatisfiable_from_type() {
        // Mirrors aspice `swe1-has-verification`: sw-req needs an incoming
        // `verifies` from [sw-verification, unit-verification], but
        // unit-verification's `verifies` link-field only targets
        // sw-detail-design — it can never verifies a sw-req.
        let mut file = mk_schema_file(
            "aspice-mini",
            vec![
                mk_type("sw-req", vec![], vec![]),
                mk_type("sw-detail-design", vec![], vec![]),
                verifier_type("sw-verification", &["sw-req"]),
                verifier_type("unit-verification", &["sw-detail-design"]),
            ],
        );
        file.link_types.push(LinkTypeDef {
            name: "verifies".into(),
            inverse: None,
            description: "verifies".into(),
            source_types: vec![],
            target_types: vec![],
        });
        file.traceability_rules.push(TraceabilityRule {
            name: "swe1-has-verification".into(),
            description: "every sw-req is verified".into(),
            source_type: "sw-req".into(),
            required_link: None,
            required_backlink: Some("verifies".into()),
            target_types: vec![],
            from_types: vec!["sw-verification".into(), "unit-verification".into()],
            severity: Severity::Warning,
            alternate_backlinks: vec![],
        });
        let schema = Schema::merge(&[file]);

        let diags = schema.check_coverage_rule_consistency();
        assert_eq!(
            diags.len(),
            1,
            "exactly one unsatisfiable satisfier (unit-verification), got: {:#?}",
            diags.iter().map(|d| &d.message).collect::<Vec<_>>()
        );
        assert_eq!(diags[0].rule, "coverage-rule-consistency");
        let msg = &diags[0].message;
        assert!(
            msg.contains("unit-verification") && !msg.contains("'sw-verification'"),
            "must flag unit-verification (the unreachable one), not sw-verification: {msg}"
        );
    }

    #[test]
    fn consistency_diagnostics_aggregates_conditional_and_coverage_checks() {
        // REQ-156 / #410: the single chokepoint both validation paths call
        // must surface BOTH schema-level check families. Build a schema that
        // trips each: a duplicated conditional rule name (conditional-rule-
        // consistency) and an unsatisfiable coverage from-type
        // (coverage-rule-consistency).
        let mut file = mk_schema_file(
            "both",
            vec![
                mk_type("sw-req", vec![], vec![]),
                mk_type("sw-detail-design", vec![], vec![]),
                verifier_type("unit-verification", &["sw-detail-design"]),
            ],
        );
        file.link_types.push(LinkTypeDef {
            name: "verifies".into(),
            inverse: None,
            description: "verifies".into(),
            source_types: vec![],
            target_types: vec![],
        });
        file.traceability_rules.push(TraceabilityRule {
            name: "swe1-has-verification".into(),
            description: "every sw-req is verified".into(),
            source_type: "sw-req".into(),
            required_link: None,
            required_backlink: Some("verifies".into()),
            target_types: vec![],
            from_types: vec!["unit-verification".into()],
            severity: Severity::Warning,
            alternate_backlinks: vec![],
        });
        let dup = ConditionalRule {
            name: "dup-rule".into(),
            description: None,
            condition: None,
            when: Condition::Equals {
                field: "status".into(),
                value: "active".into(),
            },
            then: Requirement::RequiredFields {
                fields: vec!["x".into()],
            },
            severity: Severity::Warning,
        };
        file.conditional_rules.push(dup.clone());
        file.conditional_rules.push(dup);
        let schema = Schema::merge(&[file]);

        let diags = schema.consistency_diagnostics();
        let rules: std::collections::HashSet<&str> =
            diags.iter().map(|d| d.rule.as_str()).collect();
        assert!(
            rules.contains("conditional-rule-consistency"),
            "chokepoint must include conditional-rule checks, got {rules:?}"
        );
        assert!(
            rules.contains("coverage-rule-consistency"),
            "chokepoint must include coverage-rule checks, got {rules:?}"
        );
    }

    #[test]
    fn coverage_rule_silent_when_all_from_types_linkable() {
        // Both verifiers can target sw-req -> no diagnostic.
        let mut file = mk_schema_file(
            "aspice-ok",
            vec![
                mk_type("sw-req", vec![], vec![]),
                verifier_type("sw-verification", &["sw-req"]),
                verifier_type("alt-verification", &[]), // empty = any target
            ],
        );
        file.link_types.push(LinkTypeDef {
            name: "verifies".into(),
            inverse: None,
            description: "verifies".into(),
            source_types: vec![],
            target_types: vec![],
        });
        file.traceability_rules.push(TraceabilityRule {
            name: "swe1-has-verification".into(),
            description: "every sw-req is verified".into(),
            source_type: "sw-req".into(),
            required_link: None,
            required_backlink: Some("verifies".into()),
            target_types: vec![],
            from_types: vec!["sw-verification".into(), "alt-verification".into()],
            severity: Severity::Warning,
            alternate_backlinks: vec![],
        });
        let schema = Schema::merge(&[file]);
        assert!(
            schema.check_coverage_rule_consistency().is_empty(),
            "all from-types can form the backlink -> no diagnostic"
        );
    }
}
