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

use std::collections::BTreeMap;
use std::path::PathBuf;

use serde::{Deserialize, Serialize};

/// Unique identifier for an artifact (e.g., "L-1", "H-3.2", "SWREQ-012").
pub type ArtifactId = String;

/// Statuses that indicate an artifact should be fully traced in the lifecycle.
pub const TRACED_STATUSES: &[&str] = &["implemented", "done", "approved", "accepted", "verified"];

/// A typed, directional link from one artifact to another.
///
/// `target` is always the in-store artifact ID. For most link types this
/// is the only piece of target metadata. For cross-organizational
/// `*-external` link types (issue #288, design doc §4.2), the YAML
/// target may be a mapping; the mapping's `anchor:` becomes `target`
/// and the rest (org / contract / doc-id / last-synced / sha256) is
/// captured in [`external`](Self::external). Existing flat-string
/// `target: ID` continues to round-trip unchanged.
#[derive(Debug, Clone, Default, PartialEq, Eq)]
pub struct Link {
    /// Semantic type of this link (e.g., "leads-to-loss", "verifies").
    pub link_type: String,
    /// Target artifact ID — for `*-external` link types, equal to the
    /// referenced `external-anchor` artifact (the mapping's `anchor:` key).
    pub target: ArtifactId,
    /// Structured cross-org payload — populated only when the YAML
    /// `target:` was a mapping (i.e. `*-external` link types). `None`
    /// for the flat string form used by every other link type.
    pub external: Option<ExternalLinkTarget>,
}

/// Structured cross-organizational link metadata.
///
/// Carried by `*-external` link types (currently
/// `derives-from-external`). The `anchor` is the in-store
/// `external-anchor` artifact this link terminates at — coverage and
/// link-graph machinery use that as the actual target. The other
/// fields describe *what* was delegated, *to whom*, and *which
/// revision the upstream tool delivered*.
///
/// Mirrors `cited-source` semantics: `sha256` plus `last-synced`
/// stamp the snapshot. The auditor can verify the upstream
/// document hasn't drifted since the supplier handed it over.
#[derive(Debug, Clone, Default, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ExternalLinkTarget {
    /// Originating organization (e.g. `acme-electronics`). Free-form
    /// short name — matches the `source-of-truth.org` on the anchor.
    pub org: String,
    /// Contract / PO / DIA reference. Matches the anchor's
    /// `contract-reference` field at the audit-trail level.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub contract: Option<String>,
    /// Foreign ID at the supplier (e.g. their ReqIF identifier).
    #[serde(default, rename = "doc-id", skip_serializing_if = "Option::is_none")]
    pub doc_id: Option<String>,
    /// ISO-8601 date of the last successful pull.
    #[serde(
        default,
        rename = "last-synced",
        skip_serializing_if = "Option::is_none"
    )]
    pub last_synced: Option<String>,
    /// Hex sha256 of the wire payload the supplier delivered.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub sha256: Option<String>,
    /// Local `external-anchor` artifact ID. Required: this is what
    /// the in-store traceability graph follows.
    pub anchor: ArtifactId,
}

// ── Link YAML round-trip ─────────────────────────────────────────────────
//
// YAML accepts two `target:` shapes:
//
//   target: REQ-001                  # flat string — every existing link type
//
//   target:                          # mapping — *-external link types only
//     org: acme
//     contract: PO-4711
//     doc-id: REQ-SW-022
//     anchor: ANCHOR-ACME-001
//
// `Link::target` is always populated with the in-store ID; for the
// mapping form that's the `anchor:` field. The remaining mapping
// keys land in `Link::external`. Serialization preserves whichever
// shape was used: a link with `external: Some(...)` emits the
// mapping form, otherwise the flat string.

#[derive(Serialize, Deserialize)]
#[serde(untagged)]
enum LinkTargetWire {
    Flat(String),
    Structured(ExternalLinkTarget),
}

#[derive(Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
struct LinkWire {
    #[serde(rename = "type")]
    link_type: String,
    target: LinkTargetWire,
}

impl serde::Serialize for Link {
    fn serialize<S: serde::Serializer>(&self, serializer: S) -> Result<S::Ok, S::Error> {
        let target = match &self.external {
            Some(ext) => LinkTargetWire::Structured(ext.clone()),
            None => LinkTargetWire::Flat(self.target.clone()),
        };
        let wire = LinkWire {
            link_type: self.link_type.clone(),
            target,
        };
        wire.serialize(serializer)
    }
}

impl<'de> serde::Deserialize<'de> for Link {
    fn deserialize<D: serde::Deserializer<'de>>(deserializer: D) -> Result<Self, D::Error> {
        let wire = LinkWire::deserialize(deserializer)?;
        Ok(match wire.target {
            LinkTargetWire::Flat(s) => Link {
                link_type: wire.link_type,
                target: s,
                external: None,
            },
            LinkTargetWire::Structured(ext) => {
                if ext.anchor.is_empty() {
                    return Err(serde::de::Error::custom(
                        "structured link target requires non-empty 'anchor' field",
                    ));
                }
                let target = ext.anchor.clone();
                Link {
                    link_type: wire.link_type,
                    target,
                    external: Some(ext),
                }
            }
        })
    }
}

impl Link {
    /// Construct a plain link by ID. Convenience used in tests and
    /// non-external code paths.
    pub fn new<S, T>(link_type: S, target: T) -> Self
    where
        S: Into<String>,
        T: Into<ArtifactId>,
    {
        Link {
            link_type: link_type.into(),
            target: target.into(),
            external: None,
        }
    }
}

/// AI provenance metadata for an artifact.
///
/// Tracks whether an artifact was created by a human, AI, or AI-assisted
/// workflow, along with optional details about the model, session, and
/// human reviewer.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(deny_unknown_fields)]
pub struct Provenance {
    /// Origin of the artifact: "human", "ai", or "ai-assisted".
    #[serde(rename = "created-by")]
    pub created_by: String,
    /// AI model identifier (e.g., "claude-opus-4-6").
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub model: Option<String>,
    /// Session identifier for the AI interaction.
    #[serde(
        default,
        skip_serializing_if = "Option::is_none",
        rename = "session-id"
    )]
    pub session_id: Option<String>,
    /// ISO 8601 timestamp of creation.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub timestamp: Option<String>,
    /// Human reviewer who approved this artifact.
    #[serde(
        default,
        skip_serializing_if = "Option::is_none",
        rename = "reviewed-by"
    )]
    pub reviewed_by: Option<String>,
    /// Federation provenance — populated only when this artifact was
    /// imported from another organization via `rivet supplier pull`
    /// (issue #288). The block is omitted entirely for first-party
    /// artifacts and AI/human-authored ones.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub federation: Option<FederationProvenance>,
}

/// Cross-organizational provenance for a federated artifact.
///
/// Stamped on every artifact written under `.rivet/supplier-cache/`
/// by `rivet supplier pull` (issue #288, design doc §4.6). The
/// auditor uses this block to reconstruct: which supplier, which
/// contract, which payload (by sha256), and when the pull happened.
///
/// Parallels the AI [`Provenance`] block in spirit — both answer
/// "where did this artifact come from?" — but the dimension is
/// cross-org instead of cross-author.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(deny_unknown_fields)]
pub struct FederationProvenance {
    /// Originating organization (e.g. `acme-electronics`).
    #[serde(rename = "source-org")]
    pub source_org: String,
    /// Tool of record at the supplier (e.g. `reqif-1.2`, `polarion-3.21`,
    /// `doors-9.7`). Free-form string — matches the anchor's
    /// `received-status` variant where applicable.
    #[serde(rename = "source-tool")]
    pub source_tool: String,
    /// Foreign artifact ID at the supplier.
    #[serde(rename = "source-id")]
    pub source_id: String,
    /// Local `external-anchor` artifact ID this import belongs to.
    pub anchor: ArtifactId,
    /// ISO-8601 timestamp the pull completed.
    #[serde(rename = "fetched-at")]
    pub fetched_at: String,
    /// Hex sha256 of the wire payload at fetch time.
    #[serde(rename = "source-hash")]
    pub source_hash: String,
    /// Path to the mapping recipe applied at import (Phase 3). `None`
    /// in Phase 2 — fields land in `fields:` as-imported.
    #[serde(
        default,
        rename = "mapping-recipe",
        skip_serializing_if = "Option::is_none"
    )]
    pub mapping_recipe: Option<String>,
}

/// An artifact — the fundamental unit of the data model.
///
/// Artifacts represent any lifecycle element: requirements, architecture
/// components, test specifications, STPA losses/hazards/UCAs, etc.
/// The `artifact_type` field determines which schema rules apply.
///
/// Base fields (`id`, `title`, `description`, `status`, `tags`, `links`)
/// are first-class struct members.  Domain-specific properties live in the
/// `fields` map and are validated against the schema.
///
/// **`Default` note:** `id`, `artifact_type`, `title` default to empty
/// strings; all collections empty; all `Option` fields `None`. Useful
/// for test construction via
/// `Artifact { id: "X".into(), artifact_type: "req".into(), ..Default::default() }`.
/// Production code always parses from YAML and never relies on defaults
/// being meaningful.
#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
pub struct Artifact {
    /// Unique identifier.
    pub id: ArtifactId,

    /// Type name — must match an artifact type defined in a loaded schema.
    pub artifact_type: String,

    /// Human-readable title.
    pub title: String,

    /// Detailed description (supports markdown).
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,

    /// Lifecycle status (e.g., "draft", "approved", "obsolete").
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub status: Option<String>,

    /// Release this artifact is scoped to (e.g. "v0.21.0"). First-class
    /// release-planning dimension (#516): an unassigned artifact is backlog;
    /// readiness is "which artifacts in `release: vX.Y` are not yet verified".
    /// Free-form for now; a validated release registry is a follow-up.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub release: Option<String>,

    /// Arbitrary tags for categorization and filtering.
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub tags: Vec<String>,

    /// Typed links to other artifacts.
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub links: Vec<Link>,

    /// Domain-specific fields (validated against schema).
    #[serde(default, skip_serializing_if = "BTreeMap::is_empty")]
    pub fields: BTreeMap<String, serde_yaml::Value>,

    /// Per-variant field overrides (issue #255, single-master overlay).
    ///
    /// Outer key: variant config name (e.g. `automotive`, `industrial`,
    /// `consumer` — the `name:` field of a file under
    /// `artifacts/variants/`). Inner map: same shape as `fields`,
    /// keyed by field name, value is the variant-specific override.
    ///
    /// Resolution semantics (option A from
    /// `docs/design/variant-aware-properties.md`):
    /// - When no variant is active (`fields_for_variant(None)`), the
    ///   default `fields` map is returned unchanged.
    /// - When a variant is active and present in this map, its
    ///   per-field overrides are overlaid on top of `fields` (later
    ///   wins). Fields not declared in the variant inherit the
    ///   default.
    /// - When a variant is active but not declared here, the default
    ///   `fields` map is returned (silent fallback — the artifact
    ///   simply has no variant-specific differentiation).
    #[serde(
        default,
        rename = "fields-per-variant",
        skip_serializing_if = "BTreeMap::is_empty"
    )]
    pub fields_per_variant: BTreeMap<String, BTreeMap<String, serde_yaml::Value>>,

    /// AI provenance metadata.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub provenance: Option<Provenance>,

    /// Source file this artifact was loaded from.
    #[serde(skip)]
    pub source_file: Option<PathBuf>,
}

impl Artifact {
    /// Return all link targets of a given link type.
    #[inline]
    pub fn links_of_type(&self, link_type: &str) -> Vec<&ArtifactId> {
        self.links
            .iter()
            .filter(|l| l.link_type == link_type)
            .map(|l| &l.target)
            .collect()
    }

    /// Check whether this artifact has any link of the given type.
    #[inline]
    pub fn has_link_type(&self, link_type: &str) -> bool {
        self.links.iter().any(|l| l.link_type == link_type)
    }

    /// Return the baseline this artifact belongs to, if any.
    ///
    /// The baseline is read from the `baseline` key in the `fields` map
    /// rather than being a first-class struct field, keeping the data
    /// model backward-compatible.
    pub fn baseline(&self) -> Option<&str> {
        self.fields.get("baseline").and_then(|v| v.as_str())
    }

    /// Case-insensitive comparison of the artifact's status to the
    /// given lifecycle marker. Returns `false` when `status` is `None`.
    ///
    /// Replaces the long-form
    /// `artifact.status.as_deref().map(str::to_lowercase).as_deref() == Some("draft")`
    /// pattern that appeared at every status-aware site. Status remains
    /// `Option<String>` at the schema level (projects use custom
    /// lifecycle markers); this method only encapsulates the casing /
    /// nul-safety dance.
    #[inline]
    pub fn status_is(&self, lifecycle: &str) -> bool {
        self.status
            .as_deref()
            .is_some_and(|s| s.eq_ignore_ascii_case(lifecycle))
    }

    /// Convenience: `true` iff the artifact's status is `draft`
    /// (case-insensitive). The most common status check in the codebase
    /// (every traceability rule's draft-downgrade goes through this).
    #[inline]
    pub fn is_draft(&self) -> bool {
        self.status_is("draft")
    }

    /// Convenience: `true` iff the artifact's status is `approved`
    /// (case-insensitive).
    #[inline]
    pub fn is_approved(&self) -> bool {
        self.status_is("approved")
    }

    /// Convenience: `true` iff the artifact's status is `released`
    /// (case-insensitive).
    #[inline]
    pub fn is_released(&self) -> bool {
        self.status_is("released")
    }

    /// Resolve the effective `fields` map for a given variant.
    ///
    /// Returns a `Cow<...>`:
    /// - `Borrowed(&self.fields)` when no overlay applies (no variant,
    ///   unknown variant, or empty overlay) — zero allocations.
    /// - `Owned(merged)` when the variant has overrides — clones the
    ///   default map once and overlays the variant's keys on top.
    ///
    /// Per `docs/design/variant-aware-properties.md` §5.2, the merge is
    /// a flat `BTreeMap` overlay: variant keys override default keys;
    /// default keys not mentioned in the variant carry through.
    pub fn fields_for_variant(
        &self,
        variant: Option<&str>,
    ) -> std::borrow::Cow<'_, BTreeMap<String, serde_yaml::Value>> {
        let Some(name) = variant else {
            return std::borrow::Cow::Borrowed(&self.fields);
        };
        let Some(overlay) = self.fields_per_variant.get(name) else {
            return std::borrow::Cow::Borrowed(&self.fields);
        };
        if overlay.is_empty() {
            return std::borrow::Cow::Borrowed(&self.fields);
        }
        let mut merged = self.fields.clone();
        for (k, v) in overlay {
            merged.insert(k.clone(), v.clone());
        }
        std::borrow::Cow::Owned(merged)
    }
}

/// One `acceptance-criteria` entry, in either of the two shapes an author may
/// write (#856 / REQ-313).
///
/// The field is declared `list<string>`, and a bare string stays the normal
/// case. But `list<string>` is not enforced per element, so an author who needs
/// to record that a criterion is not yet dischargeable can — and does — write a
/// mapping instead, and it validates clean today. Before this type existed the
/// mapping form was then **silently dropped** by the gherkin export: the
/// generated `.feature` file carried a header and no scenarios, because the
/// exporter called `as_str()` and skipped anything that returned `None`.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct AcceptanceCriterion {
    /// The criterion prose — the bare string, or the mapping's `text`.
    pub text: String,
    /// Declared lifecycle of the criterion, e.g. `blocked`. `None` for a bare
    /// string, which carries no such claim.
    pub status: Option<String>,
    /// What the author says must happen first — a release name or an artifact
    /// id. Only meaningful alongside a `status`.
    pub blocked_by: Option<String>,
}

impl AcceptanceCriterion {
    /// True when the author has explicitly declared this criterion as not yet
    /// dischargeable. Only an explicit `blocked` counts, so the declaration is
    /// always something written on purpose.
    pub fn is_blocked(&self) -> bool {
        self.status.as_deref() == Some("blocked")
    }
}

/// Read one `acceptance-criteria` entry, accepting both shapes.
///
/// Returns `None` only when there is no usable prose at all — an empty string,
/// or a mapping with no non-empty `text`. Callers should treat `None` as
/// "nothing to render", not as "skip silently": the whole point of REQ-313 is
/// that a criterion which cannot be read must not vanish without a word.
pub fn parse_acceptance_criterion(value: &serde_yaml::Value) -> Option<AcceptanceCriterion> {
    match value {
        serde_yaml::Value::String(s) if !s.trim().is_empty() => Some(AcceptanceCriterion {
            text: s.clone(),
            status: None,
            blocked_by: None,
        }),
        serde_yaml::Value::Mapping(m) => {
            let get = |k: &str| {
                m.get(serde_yaml::Value::String(k.to_string()))
                    .and_then(|v| v.as_str())
                    .map(str::to_string)
            };
            let text = get("text")?;
            if text.trim().is_empty() {
                return None;
            }
            Some(AcceptanceCriterion {
                text,
                status: get("status"),
                blocked_by: get("blocked-by").or_else(|| get("blocked_by")),
            })
        }
        _ => None,
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::test_helpers::minimal_artifact;

    #[test]
    fn artifact_baseline_returns_field_value() {
        let mut a = minimal_artifact("A-1", "req");
        a.fields.insert(
            "baseline".into(),
            serde_yaml::Value::String("v0.2.0".into()),
        );
        assert_eq!(a.baseline(), Some("v0.2.0"));
    }

    #[test]
    fn artifact_baseline_returns_none_when_missing() {
        let a = minimal_artifact("A-1", "req");
        assert_eq!(a.baseline(), None);
    }

    #[test]
    fn artifact_baseline_returns_none_for_non_string() {
        let mut a = minimal_artifact("A-1", "req");
        a.fields
            .insert("baseline".into(), serde_yaml::Value::Bool(true));
        assert_eq!(a.baseline(), None);
    }

    #[test]
    fn status_is_case_insensitive() {
        let mut a = minimal_artifact("A-1", "req");
        a.status = Some("Draft".into());
        assert!(a.status_is("draft"), "case-insensitive match");
        assert!(a.status_is("DRAFT"));
        assert!(a.status_is("Draft"));
        assert!(!a.status_is("approved"));
    }

    #[test]
    fn status_is_returns_false_for_none() {
        let mut a = minimal_artifact("A-1", "req");
        a.status = None;
        assert!(!a.is_draft());
        assert!(!a.is_approved());
        assert!(!a.is_released());
        assert!(!a.status_is("anything"));
    }

    #[test]
    fn is_draft_and_is_approved_and_is_released_match_known_values() {
        let mut a = minimal_artifact("A-1", "req");
        a.status = Some("draft".into());
        assert!(a.is_draft());
        assert!(!a.is_approved());

        a.status = Some("APPROVED".into());
        assert!(a.is_approved());
        assert!(!a.is_draft());

        a.status = Some("released".into());
        assert!(a.is_released());
    }

    #[test]
    fn status_is_handles_custom_lifecycle_markers() {
        let mut a = minimal_artifact("A-1", "req");
        a.status = Some("needs-review".into());
        assert!(a.status_is("needs-review"));
        assert!(a.status_is("Needs-Review"));
        assert!(!a.is_draft());
        assert!(!a.is_approved());
    }

    // ── fields-per-variant (#255) ────────────────────────────────────

    fn art_with_variant_overrides() -> Artifact {
        let mut a = minimal_artifact("REQ-THERMAL-01", "requirement");
        a.fields
            .insert("max-temp-c".into(), serde_yaml::Value::Number(80.into()));
        a.fields
            .insert("priority".into(), serde_yaml::Value::String("must".into()));
        a.fields_per_variant.insert("automotive".into(), {
            let mut m = BTreeMap::new();
            m.insert("max-temp-c".into(), serde_yaml::Value::Number(80.into()));
            m.insert(
                "min-temp-c".into(),
                serde_yaml::Value::Number((-40i64).into()),
            );
            m
        });
        a.fields_per_variant.insert("industrial".into(), {
            let mut m = BTreeMap::new();
            m.insert("max-temp-c".into(), serde_yaml::Value::Number(100.into()));
            m
        });
        a
    }

    #[test]
    fn fields_for_variant_none_returns_default_fields() {
        let a = art_with_variant_overrides();
        let f = a.fields_for_variant(None);
        assert!(matches!(f, std::borrow::Cow::Borrowed(_)));
        assert_eq!(f.get("max-temp-c"), a.fields.get("max-temp-c"));
        assert_eq!(f.get("priority"), a.fields.get("priority"));
    }

    #[test]
    fn fields_for_variant_unknown_returns_default_fields() {
        let a = art_with_variant_overrides();
        let f = a.fields_for_variant(Some("consumer"));
        assert!(
            matches!(f, std::borrow::Cow::Borrowed(_)),
            "unknown variant must fall back to default fields, not allocate"
        );
    }

    #[test]
    fn fields_for_variant_known_overlays_and_keeps_unmentioned_defaults() {
        let a = art_with_variant_overrides();
        let f = a.fields_for_variant(Some("industrial"));
        // Industrial variant overrides max-temp-c but doesn't mention
        // priority — priority must inherit from default.
        assert_eq!(
            f.get("max-temp-c"),
            Some(&serde_yaml::Value::Number(100.into())),
            "industrial overrides max-temp-c to 100"
        );
        assert_eq!(
            f.get("priority"),
            Some(&serde_yaml::Value::String("must".into())),
            "priority inherits from default"
        );
    }

    #[test]
    fn fields_for_variant_known_adds_new_keys() {
        let a = art_with_variant_overrides();
        let f = a.fields_for_variant(Some("automotive"));
        // Automotive adds min-temp-c which the default doesn't have.
        assert_eq!(
            f.get("min-temp-c"),
            Some(&serde_yaml::Value::Number((-40i64).into()))
        );
    }

    #[test]
    fn fields_for_variant_yaml_roundtrip_preserves_overlay() {
        // Serialise an artifact with fields-per-variant, parse it back,
        // confirm the typed field survives the round-trip via serde.
        let a = art_with_variant_overrides();
        let yaml = serde_yaml::to_string(&a).unwrap();
        let parsed: Artifact = serde_yaml::from_str(&yaml).unwrap();
        assert_eq!(parsed.fields_per_variant.len(), 2);
        assert!(parsed.fields_per_variant.contains_key("automotive"));
        assert!(parsed.fields_per_variant.contains_key("industrial"));
        // Resolver still produces the right overlay after round-trip.
        let f = parsed.fields_for_variant(Some("industrial"));
        assert_eq!(
            f.get("max-temp-c"),
            Some(&serde_yaml::Value::Number(100.into()))
        );
    }

    #[test]
    fn baseline_config_deserializes() {
        let yaml = r#"
name: v0.1.0
description: Initial release
"#;
        let config: BaselineConfig = serde_yaml::from_str(yaml).unwrap();
        assert_eq!(config.name, "v0.1.0");
        assert_eq!(config.description.as_deref(), Some("Initial release"));
    }

    #[test]
    fn baseline_config_deserializes_without_description() {
        let yaml = "name: v0.2.0\n";
        let config: BaselineConfig = serde_yaml::from_str(yaml).unwrap();
        assert_eq!(config.name, "v0.2.0");
        assert_eq!(config.description, None);
    }

    #[test]
    fn baseline_config_list_deserializes() {
        let yaml = r#"
- name: v0.1.0
  description: First baseline
- name: v0.2.0
- name: v0.3.0
  description: Third baseline
"#;
        let configs: Vec<BaselineConfig> = serde_yaml::from_str(yaml).unwrap();
        assert_eq!(configs.len(), 3);
        assert_eq!(configs[0].name, "v0.1.0");
        assert_eq!(configs[1].description, None);
        assert_eq!(configs[2].name, "v0.3.0");
    }

    // ── derives-from-external structured target (#288) ──────────────

    /// Flat-string target round-trips unchanged — every existing
    /// link type. Regression test: the new custom (de)serializer for
    /// `Link` must not break the legacy shape.
    ///
    /// Verifies: REQ-010
    #[test]
    fn link_flat_target_yaml_roundtrip() {
        let l = Link::new("satisfies", "REQ-001");
        let yaml = serde_yaml::to_string(&l).unwrap();
        assert!(
            yaml.contains("type: satisfies"),
            "flat-link YAML should include type, got: {yaml}"
        );
        assert!(
            yaml.contains("target: REQ-001"),
            "flat-link YAML should include scalar target, got: {yaml}"
        );
        // Round-trip parse.
        let parsed: Link = serde_yaml::from_str(&yaml).unwrap();
        assert_eq!(parsed.link_type, "satisfies");
        assert_eq!(parsed.target, "REQ-001");
        assert!(parsed.external.is_none(), "no structured external");
    }

    /// Structured `target:` mapping parses to `external: Some(...)`
    /// with the `anchor:` value mirrored into `target`. This is the
    /// Phase 2 wire shape the design doc §4.2 specifies.
    ///
    /// Verifies: REQ-010
    #[test]
    fn link_structured_target_yaml_parse() {
        let yaml = "
type: derives-from-external
target:
  org: acme-electronics
  contract: PO-4711
  doc-id: REQ-SW-022
  last-synced: 2026-04-20
  sha256: 7f3c0000
  anchor: ANCHOR-ACME-001
";
        let parsed: Link = serde_yaml::from_str(yaml).unwrap();
        assert_eq!(parsed.link_type, "derives-from-external");
        assert_eq!(
            parsed.target, "ANCHOR-ACME-001",
            "structured target must mirror `anchor:` into Link.target"
        );
        let ext = parsed
            .external
            .expect("structured target populates external");
        assert_eq!(ext.org, "acme-electronics");
        assert_eq!(ext.contract.as_deref(), Some("PO-4711"));
        assert_eq!(ext.doc_id.as_deref(), Some("REQ-SW-022"));
        assert_eq!(ext.last_synced.as_deref(), Some("2026-04-20"));
        assert_eq!(ext.sha256.as_deref(), Some("7f3c0000"));
        assert_eq!(ext.anchor, "ANCHOR-ACME-001");
    }

    /// Structured target serializes back to the mapping form (not the
    /// flat string), so `rivet add --to ...` and edit tooling can
    /// round-trip without losing the cross-org metadata.
    ///
    /// Verifies: REQ-010
    #[test]
    fn link_structured_target_yaml_serialize_then_parse() {
        let original = Link {
            link_type: "derives-from-external".into(),
            target: "ANCHOR-X".into(),
            external: Some(ExternalLinkTarget {
                org: "acme".into(),
                contract: Some("PO-1".into()),
                doc_id: Some("REQ-99".into()),
                last_synced: None,
                sha256: Some("deadbeef".into()),
                anchor: "ANCHOR-X".into(),
            }),
        };
        let yaml = serde_yaml::to_string(&original).unwrap();
        // The output MUST be the structured mapping form, not `target: ANCHOR-X`.
        assert!(
            yaml.contains("anchor: ANCHOR-X"),
            "serialized YAML should carry anchor:, got: {yaml}"
        );
        assert!(
            yaml.contains("org: acme"),
            "serialized YAML should carry org:, got: {yaml}"
        );
        // Round-trip back.
        let parsed: Link = serde_yaml::from_str(&yaml).unwrap();
        assert_eq!(parsed, original, "structured link must round-trip exactly");
    }

    /// A structured target missing `anchor:` is a hard schema error —
    /// without it, the in-store graph has nothing to follow. We surface
    /// it at deserialize time rather than producing a silent
    /// not-yet-loaded link.
    ///
    /// Verifies: REQ-010
    #[test]
    fn link_structured_target_requires_anchor() {
        let yaml = "
type: derives-from-external
target:
  org: acme
  contract: PO-1
  anchor: \"\"
";
        let err = serde_yaml::from_str::<Link>(yaml).unwrap_err();
        let msg = err.to_string();
        assert!(
            msg.contains("anchor"),
            "missing-anchor error should mention 'anchor', got: {msg}"
        );
    }

    // ── FederationProvenance shape (#288) ────────────────────────────

    /// `FederationProvenance` round-trips through serde_yaml with the
    /// canonical dashed-key form (`source-org`, `fetched-at`, …).
    ///
    /// Verifies: REQ-010
    #[test]
    fn federation_provenance_yaml_roundtrip() {
        let fp = FederationProvenance {
            source_org: "acme-electronics".into(),
            source_tool: "reqif-1.2".into(),
            source_id: "REQ-SW-022".into(),
            anchor: "ANCHOR-ACME-001".into(),
            fetched_at: "2026-05-16T08:00:00Z".into(),
            source_hash: "deadbeef".into(),
            mapping_recipe: None,
        };
        let yaml = serde_yaml::to_string(&fp).unwrap();
        assert!(yaml.contains("source-org: acme-electronics"));
        assert!(yaml.contains("source-tool: reqif-1.2"));
        assert!(yaml.contains("source-id: REQ-SW-022"));
        assert!(yaml.contains("anchor: ANCHOR-ACME-001"));
        assert!(
            yaml.contains("fetched-at: '2026-05-16T08:00:00Z'")
                || yaml.contains("fetched-at: \"2026-05-16T08:00:00Z\"")
                || yaml.contains("fetched-at: 2026-05-16T08:00:00Z")
        );
        assert!(yaml.contains("source-hash: deadbeef"));
        let parsed: FederationProvenance = serde_yaml::from_str(&yaml).unwrap();
        assert_eq!(parsed, fp);
    }

    /// `Provenance` carries an optional `federation:` block, omitted
    /// from serialized YAML when `None`. Stays backward-compatible
    /// with existing AI-provenance YAML.
    ///
    /// Verifies: REQ-010
    #[test]
    fn provenance_federation_block_is_optional() {
        let prov = Provenance {
            created_by: "ai-assisted".into(),
            model: Some("claude-opus-4-7".into()),
            session_id: None,
            timestamp: Some("2026-05-16T08:00:00Z".into()),
            reviewed_by: None,
            federation: None,
        };
        let yaml = serde_yaml::to_string(&prov).unwrap();
        assert!(
            !yaml.contains("federation"),
            "federation: None should not appear in YAML, got: {yaml}"
        );
        // Add federation block, expect it to surface.
        let prov_fed = Provenance {
            federation: Some(FederationProvenance {
                source_org: "acme".into(),
                source_tool: "reqif-1.2".into(),
                source_id: "X-1".into(),
                anchor: "ANCHOR-1".into(),
                fetched_at: "2026-05-16T08:00:00Z".into(),
                source_hash: "abc".into(),
                mapping_recipe: None,
            }),
            ..prov.clone()
        };
        let yaml2 = serde_yaml::to_string(&prov_fed).unwrap();
        assert!(
            yaml2.contains("federation:"),
            "federation: Some(...) must surface, got: {yaml2}"
        );
        assert!(yaml2.contains("source-org: acme"));
        let parsed: Provenance = serde_yaml::from_str(&yaml2).unwrap();
        assert_eq!(parsed.federation, prov_fed.federation);
    }
    fn yaml(src: &str) -> serde_yaml::Value {
        serde_yaml::from_str(src).expect("yaml")
    }

    /// REQ-313: both shapes parse, and a bare string carries no blocked claim.
    ///
    /// rivet: verifies REQ-313
    #[test]
    fn parses_both_criterion_shapes() {
        let s = parse_acceptance_criterion(&yaml("\"Given X, When Y, Then Z\"")).unwrap();
        assert_eq!(s.text, "Given X, When Y, Then Z");
        assert_eq!(s.status, None);
        assert!(!s.is_blocked(), "a bare string declares nothing");

        let m = parse_acceptance_criterion(&yaml(
            "text: \"Given the next release, When it completes, Then delta.html returns 200\"\nstatus: blocked\nblocked-by: v3.2.6",
        ))
        .unwrap();
        assert!(m.text.starts_with("Given the next release"));
        assert_eq!(m.status.as_deref(), Some("blocked"));
        assert_eq!(m.blocked_by.as_deref(), Some("v3.2.6"));
        assert!(m.is_blocked());
    }

    /// Only an explicit `blocked` is a declaration. Anything else keeps the
    /// criterion ordinary, so the category cannot be entered by accident.
    ///
    /// rivet: verifies REQ-313
    #[test]
    fn only_an_explicit_blocked_status_declares_a_criterion_blocked() {
        for st in ["draft", "BLOCKED", "", "pending"] {
            let c = parse_acceptance_criterion(&yaml(&format!("text: \"t\"\nstatus: \"{st}\"")))
                .unwrap();
            assert!(!c.is_blocked(), "status {st:?} must not count as blocked");
        }
    }

    /// Nothing usable yields None so the caller can say so, rather than the
    /// exporter silently skipping it — which is the defect REQ-313 is about.
    ///
    /// rivet: verifies REQ-313
    #[test]
    fn unusable_criteria_are_reported_as_none_not_skipped_silently() {
        assert!(parse_acceptance_criterion(&yaml("\"\"")).is_none());
        assert!(parse_acceptance_criterion(&yaml("\"   \"")).is_none());
        assert!(parse_acceptance_criterion(&yaml("status: blocked")).is_none());
        assert!(parse_acceptance_criterion(&yaml("text: \"  \"")).is_none());
        assert!(parse_acceptance_criterion(&yaml("[1, 2]")).is_none());
    }

    /// `blocked_by` is accepted in both spellings — the schema uses kebab-case
    /// but authors reach for snake_case, and silently ignoring one would put
    /// the blocker back where the tool cannot see it.
    ///
    /// rivet: verifies REQ-313
    #[test]
    fn blocked_by_accepts_both_spellings() {
        let a = parse_acceptance_criterion(&yaml("text: t\nblocked-by: v1")).unwrap();
        let b = parse_acceptance_criterion(&yaml("text: t\nblocked_by: v1")).unwrap();
        assert_eq!(a.blocked_by.as_deref(), Some("v1"));
        assert_eq!(b.blocked_by.as_deref(), Some("v1"));
    }
}

/// Configuration for a named baseline (release scope).
///
/// Baselines are declared in order in `rivet.yaml`. Validation and
/// coverage can be scoped to a baseline, which cumulatively includes
/// all artifacts from earlier baselines.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BaselineConfig {
    pub name: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
}

/// Configuration for commit-to-artifact traceability.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CommitsConfig {
    #[serde(default = "default_commits_format")]
    pub format: String,
    #[serde(default)]
    pub trailers: BTreeMap<String, String>,
    #[serde(default, rename = "exempt-types")]
    pub exempt_types: Vec<String>,
    #[serde(default = "default_skip_trailer", rename = "skip-trailer")]
    pub skip_trailer: String,
    #[serde(default, rename = "traced-paths")]
    pub traced_paths: Vec<String>,
    #[serde(default, rename = "trace-exempt-artifacts")]
    pub trace_exempt_artifacts: Vec<String>,
}

fn default_commits_format() -> String {
    "trailers".into()
}

fn default_skip_trailer() -> String {
    "Trace: skip".into()
}

/// Configuration for a single external project dependency.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ExternalProject {
    /// Git clone URL (mutually exclusive with `path`).
    #[serde(default)]
    pub git: Option<String>,
    /// Local filesystem path (mutually exclusive with `git`).
    #[serde(default)]
    pub path: Option<String>,
    /// Git ref to checkout (branch, tag, or commit SHA).
    #[serde(default, rename = "ref")]
    pub git_ref: Option<String>,
    /// Short prefix used in cross-links (e.g., "rivet" for "rivet:REQ-001").
    pub prefix: String,
}

/// One entry in the `docs:` list of `rivet.yaml`.
///
/// Two surface forms are accepted (untagged) so existing configs stay valid:
///
/// ```yaml
/// docs:
///   - docs                                    # legacy: just a path
///   - path: arch                              # detailed: path + opt-out globs
///     exclude: ["generated/**", "*.draft.md"]
/// ```
///
/// `exclude` patterns are matched against the path of a candidate file
/// *relative to the docs entry's path* and use a small glob dialect:
/// `*` matches any sequence of characters except `/`, `**` matches any
/// sequence including `/`, `?` matches a single character. A pattern with
/// no `/` matches against the file name only (so `*.draft.md` matches at
/// every depth).
///
/// A file that matches any `exclude` pattern is silently skipped during
/// the docs scan — no warning, no participation in the link graph. Files
/// that the scanner declines for other reasons (missing front-matter,
/// malformed front-matter) trigger a stderr warning so the user can
/// either fix them or extend `exclude:`.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(untagged)]
pub enum DocsEntry {
    /// Legacy form: a bare path string. No exclude list.
    Path(String),
    /// Detailed form: explicit path plus an opt-out allowlist.
    Detailed {
        path: String,
        #[serde(default)]
        exclude: Vec<String>,
    },
}

impl DocsEntry {
    /// Path component of the entry (relative to the project root).
    #[must_use]
    pub fn path(&self) -> &str {
        match self {
            DocsEntry::Path(p) => p.as_str(),
            DocsEntry::Detailed { path, .. } => path.as_str(),
        }
    }

    /// The glob patterns whose matching files are silently excluded from
    /// the rivet-doc scan. Empty for legacy bare-path entries.
    #[must_use]
    pub fn exclude(&self) -> &[String] {
        match self {
            DocsEntry::Path(_) => &[],
            DocsEntry::Detailed { exclude, .. } => exclude.as_slice(),
        }
    }
}

impl From<String> for DocsEntry {
    fn from(s: String) -> Self {
        DocsEntry::Path(s)
    }
}

impl From<&str> for DocsEntry {
    fn from(s: &str) -> Self {
        DocsEntry::Path(s.to_string())
    }
}

/// Release-readiness configuration (`release:` in `rivet.yaml`), consumed by
/// `rivet release status` (#612 / REQ-240).
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct ReleaseConfig {
    /// Extra artifact statuses that count as release-ready, beyond the built-in
    /// `verified`/`accepted` — e.g. a project whose lifecycle gates on an
    /// `approved` sign-off. The escape hatch for a project's own definition of
    /// done.
    #[serde(default, rename = "ready-when")]
    pub ready_when: Vec<String>,
    /// How `rivet release status` decides an artifact is release-ready:
    /// - `"status"` (default): the status string (plus `ready-when`).
    /// - `"coverage"`: ALSO count an artifact ready when its V is closed —
    ///   every validate coverage rule that applies to its type is satisfied —
    ///   regardless of the status string. This lets V-model / ASPICE projects,
    ///   which verify via links rather than a status flip, green the gate.
    ///   Purely additive: a `verified`/`accepted`/`ready-when` artifact still
    ///   counts, so switching to `coverage` never makes a release *less*
    ///   cuttable.
    #[serde(default)]
    pub require: Option<String>,
}

/// Project-level coverage configuration (REQ-320).
#[derive(Debug, Clone, Default, Serialize, Deserialize, PartialEq)]
#[serde(deny_unknown_fields)]
pub struct CoverageConfig {
    /// Rules the project declares it does not model.
    #[serde(default, rename = "unmodelled-rules")]
    pub unmodelled_rules: Vec<UnmodelledRule>,
}

/// A rule a project declares out of scope, with the reason it is out of scope.
///
/// The reason is REQUIRED. A declaration without one is indistinguishable from
/// suppressing an inconvenient row, which is the thing this must not become.
#[derive(Debug, Clone, Default, Serialize, Deserialize, PartialEq)]
#[serde(deny_unknown_fields)]
pub struct UnmodelledRule {
    /// Rule name, as it appears in `rivet coverage`.
    pub rule: String,
    /// Why this project does not model it.
    pub reason: String,
}

/// Project configuration loaded from `rivet.yaml`.
///
/// #808 uses a soft-warn (not `deny_unknown_fields`) for unknown
/// top-level keys — a downstream project may legitimately carry its
/// own keys at the top level (sigil's `schemas-path:` is one such),
/// and hard-failing would break every such user. The diagnostic path
/// lives in [`ProjectConfigLoad`] + `cmd_validate` instead: the
/// unknown keys become an `unknown-config-key` Warning by default and
/// an Error under `--strict`.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProjectConfig {
    pub project: ProjectMetadata,
    #[serde(default)]
    pub sources: Vec<SourceConfig>,
    /// Directories containing markdown documents (with YAML frontmatter).
    ///
    /// Each entry may be a bare path (legacy form) or a `{path, exclude}`
    /// table — see [`DocsEntry`] for the allowlist syntax.
    #[serde(default)]
    pub docs: Vec<DocsEntry>,
    /// Directory containing test result YAML files.
    #[serde(default)]
    pub results: Option<String>,
    /// Commit traceability configuration.
    #[serde(default)]
    pub commits: Option<CommitsConfig>,
    /// Release-readiness configuration for `rivet release status` (#612).
    #[serde(default)]
    pub release: Option<ReleaseConfig>,
    /// External project dependencies for cross-repo linking.
    #[serde(default)]
    pub externals: Option<BTreeMap<String, ExternalProject>>,
    /// Rules this project deliberately does not model (REQ-320, #871).
    ///
    /// Adopting a preset for part of its scope drags in the rest of its rules,
    /// and an unmodelled level then renders as an empty row forever —
    /// indistinguishable from one nobody got round to. This is where a project
    /// says which rows are absent BY INTENT.
    #[serde(default)]
    pub coverage: Option<CoverageConfig>,
    /// Named baselines for scoped validation and coverage.
    /// Order matters: earlier baselines are cumulatively included in later ones.
    #[serde(default)]
    pub baselines: Option<Vec<BaselineConfig>>,
    /// Optional `rivet docs check` configuration — exemptions, ignore lists, etc.
    #[serde(default, rename = "docs-check")]
    pub docs_check: Option<DocsCheckConfig>,
}

/// Configuration block for `rivet docs check`. Mapped from `rivet.yaml`'s
/// top-level `docs-check:` key. Used to exempt legitimate external IDs
/// (Jira tickets, Polarion requirements, hazard catalogs, etc.) from the
/// `ArtifactIdValidity` invariant so that StakeholderRequirements docs
/// can reference upstream IDs without breaking the gate.
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct DocsCheckConfig {
    /// External-namespace prefixes that are valid IDs even though no
    /// matching artifact exists in the local store. Example:
    /// `external-namespaces: [GNV, GNR, HZO, UC, FOO]` exempts every
    /// `GNV-396`, `GNR-968`, `HZO-189`, `UC-1`, `FOO-20819` from the
    /// "artifact not found" violation. Match is on the prefix up to
    /// the first `-`.
    #[serde(default, rename = "external-namespaces")]
    pub external_namespaces: Vec<String>,
    /// Free-form regex patterns to skip — escape hatch when the
    /// namespace mechanism isn't enough. Patterns are applied to the
    /// matched ID text and skip the violation when any one matches.
    #[serde(default, rename = "ignore-patterns")]
    pub ignore_patterns: Vec<String>,
    /// Version literals that the `EmbeddedVersionLiterals` invariant
    /// should accept even when they differ from the workspace version.
    /// Use for legitimate references (third-party crate version pins,
    /// MCP protocol revisions, historical CHANGELOG dates). Match is
    /// on the literal as captured (with or without leading `v`):
    ///
    /// ```yaml
    /// docs-check:
    ///   allowed-version-literals:
    ///     - "2024-11-05"   # MCP protocol revision
    ///     - "1.3.0"        # rmcp crate pin
    /// ```
    #[serde(default, rename = "allowed-version-literals")]
    pub allowed_version_literals: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProjectMetadata {
    pub name: String,
    #[serde(default)]
    pub version: Option<String>,
    #[serde(default)]
    pub schemas: Vec<String>,
    /// REQ-249 (#431): pin the expected version of each declared schema so a
    /// rivet upgrade can't silently change validation. `rivet validate` warns
    /// (errors under `--strict`) when a resolved schema's version differs from
    /// its pin. User-owned (unlike the regenerated `.rivet-version`), so the
    /// pin survives upgrades intentionally. Empty map = no pinning.
    #[serde(default, rename = "schema-pins")]
    pub schema_pins: std::collections::BTreeMap<String, String>,
}

/// On-disk layout for how `rivet add` writes new artifacts into a directory
/// source (#490). The read path globs every `*.yaml` in a directory regardless
/// of layout; this only governs the write target.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, Default)]
#[serde(rename_all = "kebab-case")]
pub enum SourceLayout {
    /// All artifacts of a type accumulate in one `<type>s.yaml` file; new
    /// artifacts are appended at EOF. The historical default — two parallel
    /// adds collide on the file's tail.
    #[default]
    SingleFile,
    /// One file per artifact id (`<ID>.yaml`) in the source directory, so two
    /// PRs adding different artifacts touch different files → never conflict.
    PerId,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SourceConfig {
    pub path: String,
    pub format: String,
    /// Path to a WASM adapter component (only used when `format: "wasm"`).
    #[serde(default)]
    pub adapter: Option<String>,
    /// How `rivet add` writes new artifacts into this source (#490).
    #[serde(default)]
    pub layout: SourceLayout,
    #[serde(default)]
    pub config: BTreeMap<String, String>,
}
