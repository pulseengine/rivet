//! Agent-facing diagnostic remediation.
//!
//! A validation [`Diagnostic`] tells you *what* is wrong. For an AI agent (or a
//! human) the more valuable question is *what to do about it* — and, crucially,
//! **which of the competing fixes is the right one**. The witnessed failure mode
//! that motivated this module: an agent saw
//!
//! ```text
//! ERROR: [TE-008] link 'traces-to' targets 'FEAT-019' (type 'feature'),
//!        allowed target types: ["requirement", "design-decision"]
//! ```
//!
//! and "fixed forward" by inventing type-invalid links on sibling artifacts —
//! turning 26 warnings into 8 errors — because the message stated the rule but
//! not the *remedy* or its *trade-off* (fix the artifact vs. widen the schema).
//!
//! This module re-derives a structured [`Remediation`] from the diagnostic plus
//! the live `schema` + `store` the renderer already holds. It is computed as a
//! **post-construction pass keyed by `Diagnostic::rule`** — deliberately *not* a
//! field threaded through the ~70 `Diagnostic` construction sites. That keeps the
//! hot validation path untouched and the remediation knowledge centralized here,
//! where it can grow rule-by-rule.
//!
//! Each `Remediation` carries:
//! - a one-line `summary` of the decision the fixer faces,
//! - ordered `fix_options` (the *usual* fix first), each tagged with a
//!   [`FixKind`] so a tool can tell "edit the artifact" from "edit the schema",
//! - a `doc_topic` slug resolvable via `rivet docs diagnostics/<rule>`.
//!
//! rivet: implements REQ-124

use crate::schema::{Cardinality, Schema};
use crate::store::Store;
use crate::validate::Diagnostic;

/// Mirror of validate.rs `link_satisfies_field`: a link counts toward a link
/// field if its type matches exactly, or is the `<type>-external` cross-repo
/// variant of it. Kept local so cardinality remediation counts identically to
/// the validator that emitted the diagnostic.
fn link_satisfies_field(actual: &str, required: &str) -> bool {
    actual == required
        || actual
            .strip_suffix("-external")
            .is_some_and(|base| base == required)
}

/// Which surface a fix touches. Lets a tool/agent distinguish "the artifact is
/// wrong" (the common case) from "the schema is wrong" (rare, deliberate).
#[derive(Debug, Clone, Copy, PartialEq, Eq, serde::Serialize)]
#[serde(rename_all = "kebab-case")]
pub enum FixKind {
    /// Edit the offending artifact (repoint a link, remove it, change a value).
    FixArtifact,
    /// Edit the schema (widen `target-types`, add a link type, relax cardinality).
    AdjustSchema,
}

impl FixKind {
    /// Short human label used in the rendered `help:` block.
    pub fn label(self) -> &'static str {
        match self {
            FixKind::FixArtifact => "fix the artifact",
            FixKind::AdjustSchema => "adjust the schema",
        }
    }
}

/// One concrete way to resolve a diagnostic.
#[derive(Debug, Clone, PartialEq, Eq, serde::Serialize)]
pub struct FixOption {
    pub kind: FixKind,
    /// Actionable prose: exactly what to change, with the offending values named.
    pub detail: String,
    /// Concrete identifiers relevant to this option (e.g. the allowed target
    /// types, or the schema field to edit). Empty when not applicable.
    #[serde(skip_serializing_if = "Vec::is_empty", default)]
    pub targets: Vec<String>,
}

/// Structured remediation for a single diagnostic.
#[derive(Debug, Clone, PartialEq, Eq, serde::Serialize)]
pub struct Remediation {
    /// One line framing the decision the fixer faces.
    pub summary: String,
    /// Ordered fixes, *most likely correct first*.
    pub fix_options: Vec<FixOption>,
    /// `rivet docs <doc_topic>` for the long-form explanation.
    pub doc_topic: String,
}

impl Remediation {
    /// Render a rustc-style indented `help:` block for terminal output.
    /// `base` is the leading indent (validate uses two spaces per line).
    pub fn to_help_text(&self, base: &str) -> String {
        let mut out = String::new();
        out.push_str(&format!("{base}help: {}\n", self.summary));
        for opt in &self.fix_options {
            out.push_str(&format!(
                "{base}      - {}: {}\n",
                opt.kind.label(),
                opt.detail
            ));
        }
        out.push_str(&format!("{base}see:  rivet docs {}", self.doc_topic));
        out
    }
}

/// Compute remediation for a diagnostic, re-deriving the specifics from the live
/// schema + store. Returns `None` for rules that have no remediation guidance
/// yet (the renderer simply prints the bare diagnostic in that case).
pub fn remediation_for(diag: &Diagnostic, schema: &Schema, store: &Store) -> Option<Remediation> {
    match diag.rule.as_str() {
        "link-target-type" => link_target_type(diag, schema, store),
        "broken-link" => broken_link(diag, store),
        "unknown-link-type" => unknown_link_type(diag, schema, store),
        "required-field" => required_field(diag, schema, store),
        "allowed-values" => allowed_values(diag, schema, store),
        "cardinality" => cardinality(diag, schema, store),
        "unknown-field" => unknown_field(diag, schema, store),
        "known-type" => known_type(diag, schema, store),
        _ => None,
    }
}

/// `required-field`: a field the schema marks `required: true` is absent.
///   A. add the field to the artifact (usual);
///   B. make the field optional in the schema (if it should not be mandatory).
fn required_field(diag: &Diagnostic, schema: &Schema, store: &Store) -> Option<Remediation> {
    let source_id = diag.artifact_id.as_deref()?;
    let artifact = store.get(source_id)?;
    let type_def = schema.artifact_type(&artifact.artifact_type)?;

    // Re-find the first required-but-missing field, matching validate.rs step 2
    // (base fields `description`/`status` satisfy the requirement too).
    let missing = type_def.fields.iter().find(|f| {
        if !f.required || artifact.fields.contains_key(&f.name) {
            return false;
        }
        match f.name.as_str() {
            "description" => artifact.description.is_none(),
            "status" => artifact.status.is_none(),
            _ => true,
        }
    })?;

    Some(Remediation {
        summary: format!(
            "field '{}' is required for type '{}' but is missing on '{}'. \
             Usually the artifact needs the field; relax the schema only if the \
             field should not be mandatory for this type.",
            missing.name, artifact.artifact_type, source_id,
        ),
        fix_options: vec![
            FixOption {
                kind: FixKind::FixArtifact,
                detail: format!(
                    "Add the '{field}' field to '{src}' (e.g. \
                     `rivet modify {src} --field {field}=<value>`, or edit the YAML).",
                    field = missing.name,
                    src = source_id,
                ),
                targets: vec![missing.name.clone()],
            },
            FixOption {
                kind: FixKind::AdjustSchema,
                detail: format!(
                    "If '{field}' should not be mandatory for '{at}', set `required: false` \
                     on that field in the schema. This relaxes it for ALL '{at}' artifacts.",
                    field = missing.name,
                    at = artifact.artifact_type,
                ),
                targets: vec![missing.name.clone()],
            },
        ],
        doc_topic: "diagnostics/required-field".to_string(),
    })
}

/// `allowed-values`: a field's value is outside the schema's `allowed-values`.
///   A. change the value to one of the allowed set (usual);
///   B. add the value to `allowed-values` (if it is legitimately valid).
fn allowed_values(diag: &Diagnostic, schema: &Schema, store: &Store) -> Option<Remediation> {
    let source_id = diag.artifact_id.as_deref()?;
    let artifact = store.get(source_id)?;
    let type_def = schema.artifact_type(&artifact.artifact_type)?;

    // Find the first field with an allow-list whose present value is outside it.
    // Mirror validate.rs: compare the value's string form against the set.
    for field in &type_def.fields {
        let Some(allowed) = &field.allowed_values else {
            continue;
        };
        let Some(value) = artifact.fields.get(&field.name) else {
            continue;
        };
        let actual = yaml_scalar_string(value);
        let Some(actual) = actual else { continue };
        if allowed.iter().any(|a| a == &actual) {
            continue;
        }
        let allowed_list = allowed.join(", ");
        return Some(Remediation {
            summary: format!(
                "field '{}' on '{}' has value '{}', which is not in the allowed set [{}]. \
                 Usually the value is wrong; widen the schema only if '{}' is a legitimate value.",
                field.name, source_id, actual, allowed_list, actual,
            ),
            fix_options: vec![
                FixOption {
                    kind: FixKind::FixArtifact,
                    detail: format!(
                        "On '{src}': change field '{field}' to one of [{allowed_list}].",
                        src = source_id,
                        field = field.name,
                    ),
                    targets: allowed.clone(),
                },
                FixOption {
                    kind: FixKind::AdjustSchema,
                    detail: format!(
                        "If '{actual}' is a legitimate value, add it to the `allowed-values` of \
                         field '{field}' on artifact type '{at}' in the schema.",
                        field = field.name,
                        at = artifact.artifact_type,
                    ),
                    targets: vec![actual.clone()],
                },
            ],
            doc_topic: "diagnostics/allowed-values".to_string(),
        });
    }
    None
}

/// `cardinality`: the number of links of a field's type violates its cardinality
/// (exactly-one / at-least-one / at-most-one). Both surfaces are legitimate:
///   A. add or remove links to meet the constraint;
///   B. change the link field's `cardinality` in the schema.
fn cardinality(diag: &Diagnostic, schema: &Schema, store: &Store) -> Option<Remediation> {
    let source_id = diag.artifact_id.as_deref()?;
    let artifact = store.get(source_id)?;
    let type_def = schema.artifact_type(&artifact.artifact_type)?;

    for link_field in &type_def.link_fields {
        let count = artifact
            .links
            .iter()
            .filter(|l| link_satisfies_field(&l.link_type, &link_field.link_type))
            .count();
        // Mirror validate.rs step 4 exactly.
        let (constraint, artifact_fix) = match link_field.cardinality {
            Cardinality::ExactlyOne if count != 1 => (
                "exactly 1",
                if count == 0 {
                    format!("add one '{}' link", link_field.link_type)
                } else {
                    format!("remove all but one '{}' link", link_field.link_type)
                },
            ),
            Cardinality::OneOrMany if count == 0 && link_field.required => (
                "at least 1",
                format!("add at least one '{}' link", link_field.link_type),
            ),
            Cardinality::ZeroOrOne if count > 1 => (
                "at most 1",
                format!("remove all but one '{}' link", link_field.link_type),
            ),
            _ => continue,
        };

        return Some(Remediation {
            summary: format!(
                "the '{lt}' link on '{src}' must occur {constraint}, but {count} are present. \
                 Fix the links, or change the field's cardinality in the schema if the rule \
                 itself is wrong.",
                lt = link_field.link_type,
                src = source_id,
            ),
            fix_options: vec![
                FixOption {
                    kind: FixKind::FixArtifact,
                    detail: format!("On '{src}': {artifact_fix}.", src = source_id),
                    targets: vec![link_field.link_type.clone()],
                },
                FixOption {
                    kind: FixKind::AdjustSchema,
                    detail: format!(
                        "If the constraint is wrong, change the `cardinality` of link field \
                         '{field}' on artifact type '{at}' in the schema.",
                        field = link_field.name,
                        at = artifact.artifact_type,
                    ),
                    targets: vec![link_field.name.clone()],
                },
            ],
            doc_topic: "diagnostics/cardinality".to_string(),
        });
    }
    None
}

/// `unknown-field`: an artifact carries a field the schema does not declare for
/// its type. Both surfaces apply (typo vs. a real field the schema is missing).
fn unknown_field(diag: &Diagnostic, schema: &Schema, store: &Store) -> Option<Remediation> {
    let source_id = diag.artifact_id.as_deref()?;
    let artifact = store.get(source_id)?;
    let type_def = schema.artifact_type(&artifact.artifact_type)?;

    let known: std::collections::HashSet<&str> =
        type_def.fields.iter().map(|f| f.name.as_str()).collect();
    let unknown = artifact
        .fields
        .keys()
        .find(|k| !known.contains(k.as_str()))?;

    let mut declared: Vec<String> = type_def.fields.iter().map(|f| f.name.clone()).collect();
    declared.sort();
    let declared_list = if declared.is_empty() {
        "(none declared)".to_string()
    } else {
        declared.join(", ")
    };

    Some(Remediation {
        summary: format!(
            "field '{}' on '{}' is not declared in the schema for type '{}'. \
             Either it is a typo/stray field (fix the artifact) or a real field the \
             schema is missing (declare it).",
            unknown, source_id, artifact.artifact_type,
        ),
        fix_options: vec![
            FixOption {
                kind: FixKind::FixArtifact,
                detail: format!(
                    "On '{src}': remove the '{field}' field, or rename it to a declared field \
                     [{declared_list}].",
                    src = source_id,
                    field = unknown,
                ),
                targets: declared.clone(),
            },
            FixOption {
                kind: FixKind::AdjustSchema,
                detail: format!(
                    "If '{field}' is a real field for '{at}', declare it under that type's \
                     `fields:` in the schema.",
                    field = unknown,
                    at = artifact.artifact_type,
                ),
                targets: vec![unknown.clone()],
            },
        ],
        doc_topic: "diagnostics/unknown-field".to_string(),
    })
}

/// `known-type`: an artifact's `type:` is not declared in any loaded schema.
///   A. fix a typo'd type or use a declared one (usual);
///   B. declare the type in the schema, or load the schema that defines it.
fn known_type(diag: &Diagnostic, schema: &Schema, store: &Store) -> Option<Remediation> {
    let source_id = diag.artifact_id.as_deref()?;
    let artifact = store.get(source_id)?;
    // Only remediate when the type really is undeclared (skip the external
    // permissive-fallback variant, which carries the same rule but is Info).
    if schema.artifact_type(&artifact.artifact_type).is_some() {
        return None;
    }

    let mut declared: Vec<String> = schema.artifact_types.keys().cloned().collect();
    declared.sort();
    let declared_list = if declared.is_empty() {
        "(none declared)".to_string()
    } else {
        declared.join(", ")
    };

    Some(Remediation {
        summary: format!(
            "artifact '{}' has type '{}', which no loaded schema declares. \
             Either the type is wrong/typo'd (fix the artifact) or the schema that defines \
             it is not loaded / is missing the type (fix the schema/config).",
            source_id, artifact.artifact_type,
        ),
        fix_options: vec![
            FixOption {
                kind: FixKind::FixArtifact,
                detail: format!(
                    "On '{src}': set `type:` to one of the declared types [{declared_list}], \
                     or correct a typo.",
                    src = source_id,
                ),
                targets: declared.clone(),
            },
            FixOption {
                kind: FixKind::AdjustSchema,
                detail: format!(
                    "If '{at}' is a real type, declare it in your schema's `artifact-types:`, \
                     or add the schema that defines it to `project.schemas` in rivet.yaml.",
                    at = artifact.artifact_type,
                ),
                targets: vec![artifact.artifact_type.clone()],
            },
        ],
        doc_topic: "diagnostics/known-type".to_string(),
    })
}

/// Render a YAML scalar the way validate.rs compares it against `allowed-values`
/// (string / bool / number → canonical string). Returns `None` for non-scalars.
fn yaml_scalar_string(value: &serde_yaml::Value) -> Option<String> {
    if let Some(s) = value.as_str() {
        return Some(s.to_string());
    }
    if let Some(b) = value.as_bool() {
        return Some(b.to_string());
    }
    if let Some(u) = value.as_u64() {
        return Some(u.to_string());
    }
    if let Some(i) = value.as_i64() {
        return Some(i.to_string());
    }
    value.as_f64().map(|f| f.to_string())
}

/// `unknown-link-type`: a link uses a `link-type` the schema never declares in
/// `link-types:`. Here *both* surfaces are legitimate — unlike a broken link,
/// the link type may simply be missing from an otherwise-correct schema:
///   A. change the link to a declared type, or remove it;
///   B. declare the link type in the schema's `link-types:`.
fn unknown_link_type(diag: &Diagnostic, schema: &Schema, store: &Store) -> Option<Remediation> {
    let source_id = diag.artifact_id.as_deref()?;
    let artifact = store.get(source_id)?;

    // Match the validator exactly (validate.rs step "unknown-link-type"): a
    // link type is known iff it is a key in `link-types:`. The validator does
    // NOT treat inverse names as declared, so neither do we — otherwise we
    // could return None for a diagnostic the validator actually emitted.
    let undeclared = artifact
        .links
        .iter()
        .find(|l| !schema.link_types.contains_key(&l.link_type))?;

    // Offer the declared types as the menu to switch to.
    let mut declared: Vec<String> = schema.link_types.keys().cloned().collect();
    declared.sort();
    let declared_list = if declared.is_empty() {
        "(none declared)".to_string()
    } else {
        declared.join(", ")
    };

    Some(Remediation {
        summary: format!(
            "the link type '{}' on '{}' is not declared in the schema's 'link-types:'. \
             Either the link uses the wrong/typo'd type (fix the artifact) or the schema \
             is missing a real link type (declare it).",
            undeclared.link_type, source_id,
        ),
        fix_options: vec![
            FixOption {
                kind: FixKind::FixArtifact,
                detail: format!(
                    "On '{src}': change the link to one of the declared types [{declared_list}], \
                     or remove the '{lt}' link if it was a mistake.",
                    src = source_id,
                    lt = undeclared.link_type,
                ),
                targets: declared.clone(),
            },
            FixOption {
                kind: FixKind::AdjustSchema,
                detail: format!(
                    "If '{lt}' is a genuine relationship in your methodology, declare it under \
                     'link-types:' in your schema (with its inverse), then it will validate for \
                     every artifact.",
                    lt = undeclared.link_type,
                ),
                targets: vec![undeclared.link_type.clone()],
            },
        ],
        doc_topic: "diagnostics/unknown-link-type".to_string(),
    })
}

/// `link-target-type`: a link points to an artifact whose type the schema does
/// not list in that link field's `target-types`. The exact case that misled the
/// sibling agent. Two genuine fixes, *artifact-first*:
///   A. repoint the link to an allowed type, or remove it (usual);
///   B. add the offending type to the schema's `target-types` (rare — only if
///      the schema is actually too narrow).
fn link_target_type(diag: &Diagnostic, schema: &Schema, store: &Store) -> Option<Remediation> {
    let source_id = diag.artifact_id.as_deref()?;
    let artifact = store.get(source_id)?;
    let type_def = schema.artifact_type(&artifact.artifact_type)?;

    // Re-find the offending (link_field, link, target) triple exactly as the
    // validator did (validate.rs step 5): exact link-type match, target exists,
    // target type not in a non-empty allow-list.
    for link_field in &type_def.link_fields {
        if link_field.target_types.is_empty() {
            continue;
        }
        for link in &artifact.links {
            if link.link_type != link_field.link_type {
                continue;
            }
            let Some(target) = store.get(&link.target) else {
                continue;
            };
            if link_field.target_types.contains(&target.artifact_type) {
                continue;
            }

            let allowed = &link_field.target_types;
            let allowed_list = allowed.join(", ");
            return Some(Remediation {
                summary: format!(
                    "'{}' is a '{}', which is not an allowed target for the '{}' link. \
                     Usually the artifact is wrong (repoint or drop the link); \
                     only widen the schema if a '{}' really is a valid '{}' target.",
                    link.target,
                    target.artifact_type,
                    link.link_type,
                    target.artifact_type,
                    link.link_type,
                ),
                fix_options: vec![
                    FixOption {
                        kind: FixKind::FixArtifact,
                        detail: format!(
                            "On '{src}', change the '{lt}' link to point at an artifact whose \
                             type is one of [{allowed_list}] — or remove the link if '{src}' \
                             should not trace to '{tgt}'. Do NOT invent links on other artifacts \
                             to satisfy this.",
                            src = source_id,
                            lt = link.link_type,
                            tgt = link.target,
                        ),
                        targets: allowed.clone(),
                    },
                    FixOption {
                        kind: FixKind::AdjustSchema,
                        detail: format!(
                            "Only if a '{tt}' is genuinely a valid '{lt}' target: add '{tt}' to \
                             the 'target-types' of link field '{field}' on artifact type '{at}' \
                             in your schema. This relaxes the rule for ALL '{at}' artifacts, so \
                             prefer fixing the link unless the schema is truly too narrow.",
                            tt = target.artifact_type,
                            lt = link.link_type,
                            field = link_field.name,
                            at = artifact.artifact_type,
                        ),
                        targets: vec![target.artifact_type.clone()],
                    },
                ],
                doc_topic: "diagnostics/link-target-type".to_string(),
            });
        }
    }
    None
}

/// `broken-link`: a link targets an id that does not exist in the store. Fixes:
///   A. correct a typo'd id, create the missing artifact, or remove the link;
///   B. (cross-repo) declare the target's project as an external so the id
///      resolves. No schema change applies.
fn broken_link(diag: &Diagnostic, store: &Store) -> Option<Remediation> {
    let source_id = diag.artifact_id.as_deref()?;
    let artifact = store.get(source_id)?;

    // Find the first link whose target is absent from the store.
    let dangling = artifact
        .links
        .iter()
        .find(|l| store.get(&l.target).is_none())?;

    Some(Remediation {
        summary: format!(
            "'{}' targets '{}', which does not exist in the store. \
             The fix is always on the artifact side (or its externals config); \
             never the schema.",
            dangling.link_type, dangling.target,
        ),
        fix_options: vec![
            FixOption {
                kind: FixKind::FixArtifact,
                detail: format!(
                    "On '{src}': fix a typo in the target id '{tgt}', create the artifact \
                     '{tgt}' if it is genuinely missing, or remove the '{lt}' link if it is \
                     no longer needed.",
                    src = source_id,
                    tgt = dangling.target,
                    lt = dangling.link_type,
                ),
                targets: vec![dangling.target.clone()],
            },
            FixOption {
                kind: FixKind::FixArtifact,
                detail: format!(
                    "If '{tgt}' lives in another repository, declare that repo as an external \
                     in rivet.yaml (and `rivet sync`) so the cross-repo id resolves, instead of \
                     treating it as a local artifact.",
                    tgt = dangling.target,
                ),
                targets: vec![dangling.target.clone()],
            },
        ],
        doc_topic: "diagnostics/broken-link".to_string(),
    })
}

#[cfg(test)]
#[allow(clippy::unwrap_used, clippy::indexing_slicing)]
mod tests {
    use super::*;
    use crate::model::{Artifact, Link};
    use crate::schema::{ArtifactTypeDef, FieldDef, LinkFieldDef, Schema, SchemaFile, Severity};
    use crate::store::Store;
    use crate::validate::Diagnostic;

    /// Schema: a `test` type whose `rel` link may only reach a `requirement`.
    fn schema_with_restricted_link() -> Schema {
        let file = SchemaFile {
            artifact_types: vec![
                ArtifactTypeDef {
                    name: "test".to_string(),
                    link_fields: vec![LinkFieldDef {
                        name: "rel-field".to_string(),
                        link_type: "rel".to_string(),
                        target_types: vec!["requirement".to_string()],
                        ..Default::default()
                    }],
                    ..Default::default()
                },
                ArtifactTypeDef {
                    name: "requirement".to_string(),
                    ..Default::default()
                },
                ArtifactTypeDef {
                    name: "feature".to_string(),
                    ..Default::default()
                },
            ],
            ..Default::default()
        };
        Schema::merge(&[file])
    }

    fn artifact(id: &str, ty: &str, links: Vec<Link>) -> Artifact {
        Artifact {
            id: id.to_string(),
            artifact_type: ty.to_string(),
            links,
            ..Default::default()
        }
    }

    fn link(target: &str) -> Link {
        Link {
            link_type: "rel".to_string(),
            target: target.to_string(),
            external: None,
        }
    }

    // rivet: verifies REQ-124
    #[test]
    fn link_target_type_offers_artifact_first_then_schema() {
        let schema = schema_with_restricted_link();
        let mut store = Store::new();
        store.upsert(artifact("FEAT-1", "feature", vec![]));
        store.upsert(artifact("TE-1", "test", vec![link("FEAT-1")]));

        let diag = Diagnostic::new(
            Severity::Error,
            Some("TE-1".to_string()),
            "link-target-type",
            "irrelevant — remediation is re-derived from schema+store, not the message",
        );

        let rem = remediation_for(&diag, &schema, &store).expect("should produce remediation");
        assert_eq!(rem.doc_topic, "diagnostics/link-target-type");
        assert_eq!(rem.fix_options.len(), 2);
        // The artifact fix must come first (the usual correct action) and name
        // the allowed target type.
        assert_eq!(rem.fix_options[0].kind, FixKind::FixArtifact);
        assert_eq!(rem.fix_options[0].targets, vec!["requirement".to_string()]);
        // The schema fix is the rare second option, naming the offending type.
        assert_eq!(rem.fix_options[1].kind, FixKind::AdjustSchema);
        assert_eq!(rem.fix_options[1].targets, vec!["feature".to_string()]);
    }

    // rivet: verifies REQ-124
    #[test]
    fn link_target_type_none_when_target_is_allowed() {
        let schema = schema_with_restricted_link();
        let mut store = Store::new();
        store.upsert(artifact("REQ-1", "requirement", vec![]));
        store.upsert(artifact("TE-1", "test", vec![link("REQ-1")]));

        let diag = Diagnostic::new(
            Severity::Error,
            Some("TE-1".to_string()),
            "link-target-type",
            "",
        );
        // The link is actually valid → nothing to remediate.
        assert!(remediation_for(&diag, &schema, &store).is_none());
    }

    // rivet: verifies REQ-124
    #[test]
    fn broken_link_offers_only_artifact_side_fixes() {
        let schema = schema_with_restricted_link();
        let mut store = Store::new();
        store.upsert(artifact("TE-1", "test", vec![link("REQ-404")]));

        let diag = Diagnostic::new(Severity::Error, Some("TE-1".to_string()), "broken-link", "");

        let rem = remediation_for(&diag, &schema, &store).expect("should produce remediation");
        assert_eq!(rem.doc_topic, "diagnostics/broken-link");
        assert!(!rem.fix_options.is_empty());
        // A broken link is never a schema problem.
        assert!(
            rem.fix_options
                .iter()
                .all(|o| o.kind == FixKind::FixArtifact)
        );
        assert!(
            rem.fix_options
                .iter()
                .any(|o| o.targets == vec!["REQ-404".to_string()])
        );
    }

    // rivet: verifies REQ-124
    #[test]
    fn unknown_link_type_offers_both_surfaces() {
        let schema = schema_with_restricted_link();
        let mut store = Store::new();
        // 'rel' is declared as a link field's link_type but is NOT a declared
        // link *type* in this minimal schema (link_types is empty), so it is
        // treated as unknown here — exactly the surface we want to exercise.
        store.upsert(artifact("TE-1", "test", vec![link("REQ-1")]));
        store.upsert(artifact("REQ-1", "requirement", vec![]));

        let diag = Diagnostic::new(
            Severity::Error,
            Some("TE-1".to_string()),
            "unknown-link-type",
            "",
        );
        let rem = remediation_for(&diag, &schema, &store).expect("should produce remediation");
        assert_eq!(rem.doc_topic, "diagnostics/unknown-link-type");
        assert_eq!(rem.fix_options.len(), 2);
        assert_eq!(rem.fix_options[0].kind, FixKind::FixArtifact);
        assert_eq!(rem.fix_options[1].kind, FixKind::AdjustSchema);
        assert_eq!(rem.fix_options[1].targets, vec!["rel".to_string()]);
    }

    // rivet: verifies REQ-124
    #[test]
    fn unknown_rule_has_no_remediation() {
        let schema = schema_with_restricted_link();
        let store = Store::new();
        let diag = Diagnostic::new(Severity::Warning, None, "some-future-rule", "");
        assert!(remediation_for(&diag, &schema, &store).is_none());
    }

    // rivet: verifies REQ-124
    #[test]
    fn help_text_is_rustc_style_and_cites_the_doc() {
        let schema = schema_with_restricted_link();
        let mut store = Store::new();
        store.upsert(artifact("FEAT-1", "feature", vec![]));
        store.upsert(artifact("TE-1", "test", vec![link("FEAT-1")]));
        let diag = Diagnostic::new(
            Severity::Error,
            Some("TE-1".to_string()),
            "link-target-type",
            "",
        );
        let rem = remediation_for(&diag, &schema, &store).unwrap();

        let text = rem.to_help_text("    ");
        assert!(text.contains("    help: "));
        assert!(text.contains("- fix the artifact: "));
        assert!(text.contains("- adjust the schema: "));
        assert!(text.contains("see:  rivet docs diagnostics/link-target-type"));
    }

    // ── field / cardinality / type rules ────────────────────────────────

    /// A `widget` type with: a required `rationale` field, a `priority` field
    /// constrained to an allow-list, and an `owns` link that must be exactly-one.
    fn schema_rich() -> Schema {
        let file = SchemaFile {
            artifact_types: vec![
                ArtifactTypeDef {
                    name: "widget".to_string(),
                    fields: vec![
                        FieldDef {
                            name: "rationale".to_string(),
                            field_type: "text".to_string(),
                            required: true,
                            ..Default::default()
                        },
                        FieldDef {
                            name: "priority".to_string(),
                            field_type: "string".to_string(),
                            allowed_values: Some(vec!["low".to_string(), "high".to_string()]),
                            ..Default::default()
                        },
                    ],
                    link_fields: vec![LinkFieldDef {
                        name: "owns-field".to_string(),
                        link_type: "owns".to_string(),
                        cardinality: Cardinality::ExactlyOne,
                        ..Default::default()
                    }],
                    ..Default::default()
                },
                ArtifactTypeDef {
                    name: "requirement".to_string(),
                    ..Default::default()
                },
            ],
            ..Default::default()
        };
        Schema::merge(&[file])
    }

    fn widget_with(fields: Vec<(&str, &str)>, links: Vec<Link>) -> Artifact {
        let mut a = Artifact {
            id: "W-1".to_string(),
            artifact_type: "widget".to_string(),
            links,
            ..Default::default()
        };
        for (k, v) in fields {
            a.fields
                .insert(k.to_string(), serde_yaml::Value::String(v.to_string()));
        }
        a
    }

    fn diag(rule: &str) -> Diagnostic {
        Diagnostic::new(Severity::Error, Some("W-1".to_string()), rule, "")
    }

    // rivet: verifies REQ-124
    #[test]
    fn required_field_offers_add_then_relax() {
        let schema = schema_rich();
        let mut store = Store::new();
        store.upsert(widget_with(vec![("priority", "low")], vec![]));
        let rem = remediation_for(&diag("required-field"), &schema, &store).unwrap();
        assert_eq!(rem.doc_topic, "diagnostics/required-field");
        assert_eq!(rem.fix_options[0].kind, FixKind::FixArtifact);
        assert_eq!(rem.fix_options[0].targets, vec!["rationale".to_string()]);
        assert_eq!(rem.fix_options[1].kind, FixKind::AdjustSchema);
    }

    // rivet: verifies REQ-124
    #[test]
    fn allowed_values_offers_pick_then_extend() {
        let schema = schema_rich();
        let mut store = Store::new();
        store.upsert(widget_with(
            vec![("rationale", "x"), ("priority", "urgent")],
            vec![],
        ));
        let rem = remediation_for(&diag("allowed-values"), &schema, &store).unwrap();
        assert_eq!(rem.doc_topic, "diagnostics/allowed-values");
        assert_eq!(rem.fix_options[0].kind, FixKind::FixArtifact);
        assert_eq!(
            rem.fix_options[0].targets,
            vec!["low".to_string(), "high".to_string()]
        );
        assert_eq!(rem.fix_options[1].targets, vec!["urgent".to_string()]);
    }

    // rivet: verifies REQ-124
    #[test]
    fn cardinality_offers_fix_links_then_change_rule() {
        let schema = schema_rich();
        let mut store = Store::new();
        // exactly-one 'owns' but zero present → violation.
        store.upsert(widget_with(vec![("rationale", "x")], vec![]));
        let rem = remediation_for(&diag("cardinality"), &schema, &store).unwrap();
        assert_eq!(rem.doc_topic, "diagnostics/cardinality");
        assert!(rem.summary.contains("exactly 1"));
        assert_eq!(rem.fix_options[0].kind, FixKind::FixArtifact);
        assert_eq!(rem.fix_options[1].kind, FixKind::AdjustSchema);
    }

    // rivet: verifies REQ-124
    #[test]
    fn unknown_field_offers_remove_then_declare() {
        let schema = schema_rich();
        let mut store = Store::new();
        store.upsert(widget_with(
            vec![("rationale", "x"), ("frobnitz", "?")],
            vec![],
        ));
        let rem = remediation_for(&diag("unknown-field"), &schema, &store).unwrap();
        assert_eq!(rem.doc_topic, "diagnostics/unknown-field");
        assert_eq!(rem.fix_options[1].kind, FixKind::AdjustSchema);
        assert_eq!(rem.fix_options[1].targets, vec!["frobnitz".to_string()]);
    }

    // rivet: verifies REQ-124
    #[test]
    fn known_type_offers_fix_type_then_load_schema() {
        let schema = schema_rich();
        let mut store = Store::new();
        let mut a = widget_with(vec![], vec![]);
        a.artifact_type = "wodget".to_string(); // undeclared typo
        store.upsert(a);
        let rem = remediation_for(&diag("known-type"), &schema, &store).unwrap();
        assert_eq!(rem.doc_topic, "diagnostics/known-type");
        assert_eq!(rem.fix_options[0].kind, FixKind::FixArtifact);
        assert!(rem.fix_options[0].targets.contains(&"widget".to_string()));
        assert_eq!(rem.fix_options[1].targets, vec!["wodget".to_string()]);
    }

    // rivet: verifies REQ-124
    #[test]
    fn known_type_none_when_type_is_declared() {
        let schema = schema_rich();
        let mut store = Store::new();
        store.upsert(widget_with(vec![("rationale", "x")], vec![]));
        // 'widget' IS declared → the Info permissive-fallback variant, no remedy.
        assert!(remediation_for(&diag("known-type"), &schema, &store).is_none());
    }
}
