use std::borrow::Cow;
use std::collections::HashMap;
use std::path::Path;

use regex::Regex;
use serde::{Deserialize, Serialize};

use crate::model::Artifact;

use crate::error::Error;

// ── YAML file structure ──────────────────────────────────────────────────

/// Top-level structure of a schema YAML file.
#[derive(Debug, Clone, Serialize, Deserialize)]
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
}

#[derive(Debug, Clone, Serialize, Deserialize)]
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

#[derive(Debug, Clone, Serialize, Deserialize)]
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
    /// Maps shorthand array fields to link types for format-specific parsing.
    ///
    /// Example: `{losses: leads-to-loss}` means `losses: [L-1]` in YAML becomes
    /// `links: [{type: leads-to-loss, target: L-1}]`.
    #[serde(default, rename = "shorthand-links")]
    pub shorthand_links: std::collections::BTreeMap<String, String>,
}

/// A common mistake entry with problem description and fix command.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MistakeGuide {
    pub problem: String,
    #[serde(default, rename = "fix-command")]
    pub fix_command: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
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

#[derive(Debug, Clone, Serialize, Deserialize)]
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

#[derive(Debug, Clone, Serialize, Deserialize)]
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

#[derive(Debug, Clone, Serialize, Deserialize)]
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
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, Default, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum Severity {
    Info,
    #[default]
    Warning,
    Error,
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
        let mut artifact_types = HashMap::new();
        let mut link_types = HashMap::new();
        let mut inverse_map = HashMap::new();
        let mut traceability_rules = Vec::new();
        let mut conditional_rules = Vec::new();

        for file in files {
            for at in &file.artifact_types {
                artifact_types.insert(at.name.clone(), at.clone());
            }
            for lt in &file.link_types {
                if let Some(inv) = &lt.inverse {
                    inverse_map.insert(lt.name.clone(), inv.clone());
                    inverse_map.insert(inv.clone(), lt.name.clone());
                }
                link_types.insert(lt.name.clone(), lt.clone());
            }
            traceability_rules.extend(file.traceability_rules.iter().cloned());
            conditional_rules.extend(file.conditional_rules.iter().cloned());
        }

        Schema {
            artifact_types,
            link_types,
            inverse_map,
            traceability_rules,
            conditional_rules,
        }
    }

    /// Look up an artifact type definition by name.
    #[inline]
    pub fn artifact_type(&self, name: &str) -> Option<&ArtifactTypeDef> {
        self.artifact_types.get(name)
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
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::test_helpers::minimal_artifact;
    use std::borrow::Cow;

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
}
