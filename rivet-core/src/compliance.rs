//! EU AI Act compliance reporting.
//!
//! Maps artifact types from the `eu-ai-act` schema to Annex IV sections
//! and computes per-section completeness.

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

use serde::Serialize;

use crate::schema::Schema;
use crate::store::Store;

/// A single Annex IV section with its required artifact types and coverage.
#[derive(Debug, Clone, Serialize)]
pub struct ComplianceSection {
    /// Section identifier (e.g., "annex-iv-1").
    pub id: String,
    /// Human-readable section title.
    pub title: String,
    /// EU AI Act article/annex reference.
    pub reference: String,
    /// Artifact types required for this section.
    pub required_types: Vec<String>,
    /// Artifact types that have at least one artifact in the store.
    pub covered_types: Vec<String>,
    /// Artifact types that have zero artifacts.
    pub missing_types: Vec<String>,
    /// Coverage percentage (0..100).
    pub coverage_pct: f64,
}

/// Full EU AI Act compliance report.
#[derive(Debug, Clone, Serialize)]
pub struct ComplianceReport {
    /// Per-section compliance status.
    pub sections: Vec<ComplianceSection>,
    /// Overall compliance percentage.
    pub overall_pct: f64,
    /// Total artifact count across all EU AI Act types.
    pub total_artifacts: usize,
    /// Whether the EU AI Act schema is loaded.
    pub schema_loaded: bool,
}

/// Mapping from Annex IV sections to artifact types.
///
/// This is the canonical mapping of EU AI Act documentation requirements
/// to rivet artifact types defined in `schemas/eu-ai-act.yaml`.
const ANNEX_IV_SECTIONS: &[(&str, &str, &str, &[&str])] = &[
    (
        "annex-iv-1",
        "General Description",
        "Annex IV \u{00a7}1",
        &["ai-system-description"],
    ),
    (
        "annex-iv-2",
        "Design & Development",
        "Annex IV \u{00a7}2",
        &[
            "design-specification",
            "data-governance-record",
            "third-party-component",
        ],
    ),
    (
        "annex-iv-3",
        "Monitoring & Logging",
        "Annex IV \u{00a7}3 + Art. 12",
        &["monitoring-measure"],
    ),
    (
        "annex-iv-4",
        "Performance Evaluation",
        "Annex IV \u{00a7}4 + Art. 15",
        &["performance-evaluation"],
    ),
    (
        "annex-iv-5",
        "Risk Management",
        "Annex IV \u{00a7}5 + Art. 9",
        &[
            "risk-management-process",
            "risk-assessment",
            "risk-mitigation",
            "misuse-risk",
        ],
    ),
    (
        "annex-iv-5a",
        "Transparency & Human Oversight",
        "Art. 13 + Art. 14",
        &["transparency-record", "human-oversight-measure"],
    ),
    (
        "annex-iv-6",
        "Technical Documentation Updates",
        "Annex IV \u{00a7}6",
        &["documentation-update"],
    ),
    (
        "annex-iv-7",
        "Standards Reference",
        "Annex IV \u{00a7}7",
        &["standards-reference"],
    ),
    (
        "annex-iv-8",
        "Conformity Declaration",
        "Annex IV \u{00a7}8 + Art. 47",
        &["conformity-declaration"],
    ),
    (
        "annex-iv-9",
        "Post-Market Monitoring",
        "Annex IV \u{00a7}9 + Art. 72",
        &["post-market-plan"],
    ),
];

/// All EU AI Act artifact type names (used for filtering).
pub const EU_AI_ACT_TYPES: &[&str] = &[
    "ai-system-description",
    "design-specification",
    "data-governance-record",
    "third-party-component",
    "monitoring-measure",
    "performance-evaluation",
    "risk-management-process",
    "risk-assessment",
    "risk-mitigation",
    "misuse-risk",
    "transparency-record",
    "human-oversight-measure",
    "documentation-update",
    "standards-reference",
    "conformity-declaration",
    "post-market-plan",
];

/// Check whether the EU AI Act schema is loaded by testing for its
/// characteristic artifact types.
pub fn is_eu_ai_act_loaded(schema: &Schema) -> bool {
    // If at least the core type exists, consider the schema loaded
    schema.artifact_types.contains_key("ai-system-description")
        && schema.artifact_types.contains_key("conformity-declaration")
}

/// Compute EU AI Act compliance for the given store and schema.
pub fn compute_compliance(store: &Store, schema: &Schema) -> ComplianceReport {
    let schema_loaded = is_eu_ai_act_loaded(schema);

    if !schema_loaded {
        return ComplianceReport {
            sections: Vec::new(),
            overall_pct: 0.0,
            total_artifacts: 0,
            schema_loaded: false,
        };
    }

    let mut sections = Vec::new();
    let mut total_required = 0usize;
    let mut total_covered = 0usize;
    let mut total_artifacts = 0usize;

    for &(id, title, reference, types) in ANNEX_IV_SECTIONS {
        let mut covered_types = Vec::new();
        let mut missing_types = Vec::new();

        for &typ in types {
            let count = store.count_by_type(typ);
            total_artifacts += count;
            if count > 0 {
                covered_types.push(typ.to_string());
            } else {
                missing_types.push(typ.to_string());
            }
        }

        let required = types.len();
        let covered = covered_types.len();
        total_required += required;
        total_covered += covered;

        let coverage_pct = if required == 0 {
            100.0
        } else {
            (covered as f64 / required as f64) * 100.0
        };

        sections.push(ComplianceSection {
            id: id.to_string(),
            title: title.to_string(),
            reference: reference.to_string(),
            required_types: types.iter().map(|s| s.to_string()).collect(),
            covered_types,
            missing_types,
            coverage_pct,
        });
    }

    let overall_pct = if total_required == 0 {
        100.0
    } else {
        (total_covered as f64 / total_required as f64) * 100.0
    };

    ComplianceReport {
        sections,
        overall_pct,
        total_artifacts,
        schema_loaded,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn empty_schema() -> Schema {
        Schema {
            artifact_types: std::collections::HashMap::new(),
            link_types: std::collections::HashMap::new(),
            inverse_map: std::collections::HashMap::new(),
            traceability_rules: Vec::new(),
            conditional_rules: Vec::new(),
        }
    }

    #[test]
    fn test_no_schema_loaded() {
        let store = Store::new();
        let schema = empty_schema();
        let report = compute_compliance(&store, &schema);
        assert!(!report.schema_loaded);
        assert!(report.sections.is_empty());
    }

    #[test]
    fn test_eu_ai_act_types_list() {
        // Verify all types in ANNEX_IV_SECTIONS are in EU_AI_ACT_TYPES
        for &(_, _, _, types) in ANNEX_IV_SECTIONS {
            for &t in types {
                assert!(
                    EU_AI_ACT_TYPES.contains(&t),
                    "type {t} in ANNEX_IV_SECTIONS but not in EU_AI_ACT_TYPES"
                );
            }
        }
    }

    // ── Mutation-pinning tests ─────────────────────────────────────────
    //
    // Each test pins a specific surviving mutant reported by
    // `cargo mutants -p rivet-core --file rivet-core/src/compliance.rs`.

    use crate::schema::ArtifactTypeDef;
    use crate::test_helpers::minimal_artifact;

    fn schema_with_types(types: &[&str]) -> Schema {
        let mut s = empty_schema();
        for t in types {
            s.artifact_types.insert(
                (*t).to_string(),
                ArtifactTypeDef {
                    name: (*t).to_string(),
                    description: String::new(),
                    fields: vec![],
                    link_fields: vec![],
                    aspice_process: None,
                    common_mistakes: vec![],
                    example: None,
                    yaml_section: None,
                    yaml_sections: vec![],
                    yaml_section_suffix: None,
                    shorthand_links: Default::default(),
                },
            );
        }
        s
    }

    fn full_eu_ai_act_schema() -> Schema {
        schema_with_types(EU_AI_ACT_TYPES)
    }

    // Verifies: REQ-004
    // Kills:
    //   compliance.rs:181:5 replace is_eu_ai_act_loaded -> false
    //   compliance.rs:182:9 replace && with || in is_eu_ai_act_loaded
    #[test]
    fn is_eu_ai_act_loaded_requires_both_anchor_types() {
        // Both core anchor types present → true.
        let full = schema_with_types(&["ai-system-description", "conformity-declaration"]);
        assert!(
            is_eu_ai_act_loaded(&full),
            "expected full schema to be detected as loaded",
        );

        // Only one of the two anchor types → must be false; pins:
        //   - constant-false replacement (would still say false)
        //   - && replaced with ||  (would say true on either alone)
        let only_ai = schema_with_types(&["ai-system-description"]);
        assert!(
            !is_eu_ai_act_loaded(&only_ai),
            "&& must require BOTH anchor types — replacing with || would let this pass",
        );
        let only_conf = schema_with_types(&["conformity-declaration"]);
        assert!(!is_eu_ai_act_loaded(&only_conf),);

        // Empty schema → false. Combined with the `full` case above this
        // also kills the constant-false replacement.
        assert!(!is_eu_ai_act_loaded(&empty_schema()));
    }

    // Verifies: REQ-004
    // Kills:
    //   compliance.rs:209:29 replace += with -= in compute_compliance
    //   compliance.rs:209:29 replace += with *= in compute_compliance
    //   compliance.rs:210:22 replace > with == in compute_compliance
    //   compliance.rs:210:22 replace > with < in compute_compliance
    //   compliance.rs:210:22 replace > with >= in compute_compliance
    //   compliance.rs:219:24 replace += with *= in compute_compliance
    //   compliance.rs:219:24 replace += with -= in compute_compliance
    //   compliance.rs:220:23 replace += with -= in compute_compliance
    //   compliance.rs:220:23 replace += with *= in compute_compliance
    //   compliance.rs:222:40 replace == with != in compute_compliance
    //   compliance.rs:225:48 replace * with + in compute_compliance
    //   compliance.rs:225:48 replace * with / in compute_compliance
    //   compliance.rs:225:29 replace / with % in compute_compliance
    //   compliance.rs:225:29 replace / with * in compute_compliance
    //   compliance.rs:239:41 replace == with != in compute_compliance
    //   compliance.rs:242:31 replace / with % in compute_compliance
    //   compliance.rs:242:31 replace / with * in compute_compliance
    //   compliance.rs:242:56 replace * with + in compute_compliance
    //   compliance.rs:242:56 replace * with / in compute_compliance
    #[test]
    fn compute_compliance_partial_section_arithmetic() {
        // Build a schema that defines all EU AI Act types so the report
        // is generated, but a store with only SOME of them populated.
        // This forces non-zero values into the count/required arithmetic
        // that the surviving mutants would otherwise leave equal.
        let schema = full_eu_ai_act_schema();
        let mut store = Store::new();

        // annex-iv-1 fully covered (1/1 type, 1 artifact).
        store
            .insert(minimal_artifact("AI-001", "ai-system-description"))
            .unwrap();
        // annex-iv-2 partially covered: 2/3 types, 4 artifacts total.
        store
            .insert(minimal_artifact("DS-001", "design-specification"))
            .unwrap();
        store
            .insert(minimal_artifact("DS-002", "design-specification"))
            .unwrap();
        store
            .insert(minimal_artifact("DG-001", "data-governance-record"))
            .unwrap();
        store
            .insert(minimal_artifact("DG-002", "data-governance-record"))
            .unwrap();
        // annex-iv-8 fully covered.
        store
            .insert(minimal_artifact("CD-001", "conformity-declaration"))
            .unwrap();

        let report = compute_compliance(&store, &schema);
        assert!(report.schema_loaded, "schema must report as loaded");

        // total_artifacts pins `total_artifacts +=` (lines 209/210):
        //   1 (AI) + 4 (DS+DG) + 1 (CD) = 6.
        //   `-=` would give a negative usize (panic) or wrap.
        //   `*=` from initial 0 stays 0.
        //   `==` instead of `>` would never push covered types.
        assert_eq!(
            report.total_artifacts, 6,
            "total_artifacts must sum every count: 1 + 2 + 2 + 1 = 6",
        );

        // annex-iv-1: full (1/1). coverage_pct = 100.0.
        let s1 = report
            .sections
            .iter()
            .find(|s| s.id == "annex-iv-1")
            .unwrap();
        assert_eq!(s1.covered_types.len(), 1);
        assert_eq!(s1.missing_types.len(), 0);
        assert!((s1.coverage_pct - 100.0).abs() < 1e-9);

        // annex-iv-2: 2/3 types covered. coverage_pct = 200/3 ≈ 66.667.
        // This pins:
        //   * with +  → 2/3 + 100 = 100.667
        //   * with /  → (2/3)/100 = 0.00667
        //   / with *  → 2*3 = 6, *100 = 600
        //   / with %  → 2%3 = 2, *100 = 200
        let s2 = report
            .sections
            .iter()
            .find(|s| s.id == "annex-iv-2")
            .unwrap();
        assert_eq!(s2.covered_types.len(), 2);
        assert_eq!(s2.missing_types.len(), 1);
        assert!(
            (s2.coverage_pct - (200.0 / 3.0)).abs() < 1e-9,
            "annex-iv-2 coverage_pct = {}, expected ~66.667",
            s2.coverage_pct,
        );

        // annex-iv-3: 0/1 type covered. coverage_pct = 0.0.
        // Pins the `count > 0` mutants — `==` or `>=` would push the
        // missing type into covered_types when count is 0.
        let s3 = report
            .sections
            .iter()
            .find(|s| s.id == "annex-iv-3")
            .unwrap();
        assert_eq!(s3.covered_types.len(), 0);
        assert_eq!(s3.missing_types.len(), 1);
        assert!((s3.coverage_pct - 0.0).abs() < 1e-9);

        // Overall: total_required = sum of required_types over all
        // sections (1+3+1+1+4+2+1+1+1+1 = 16). total_covered = 4
        // (annex-iv-1: 1, annex-iv-2: 2, annex-iv-8: 1, others: 0).
        // overall_pct = 4 / 16 * 100 = 25.0 — distinct from any
        // arithmetic-mutant value (50.0 from `+`, 0.0 from `*`, etc.).
        let total_required: usize = report.sections.iter().map(|s| s.required_types.len()).sum();
        assert_eq!(total_required, 16);
        let total_covered: usize = report.sections.iter().map(|s| s.covered_types.len()).sum();
        assert_eq!(total_covered, 4);
        let expected = 4.0 / 16.0 * 100.0;
        assert!(
            (report.overall_pct - expected).abs() < 1e-9,
            "overall_pct = {}, expected ~{expected}",
            report.overall_pct,
        );
    }

    // Verifies: REQ-004
    // Kills:
    //   compliance.rs:239:41 replace == with != in compute_compliance
    //   (overall_pct branch when total_required == 0)
    #[test]
    fn compute_compliance_overall_pct_when_total_required_zero() {
        // We can't currently construct a schema_loaded report with
        // total_required == 0 because ANNEX_IV_SECTIONS is non-empty.
        // The branch is only reachable via an empty schema (which short-
        // circuits) — so we cannot pin the inner branch from outside.
        // The companion test above pins `==` indirectly by checking the
        // arithmetic path. This test documents the structural invariant.
        let report = compute_compliance(&Store::new(), &empty_schema());
        // Empty schema short-circuit: overall_pct must be 0.0, not 100.0.
        // This still kills constant-replacement mutants on the early
        // return path even though the inner `==` branch is theoretical.
        assert!(!report.schema_loaded);
        assert_eq!(report.sections.len(), 0);
        assert!((report.overall_pct - 0.0).abs() < f64::EPSILON);
    }
}
