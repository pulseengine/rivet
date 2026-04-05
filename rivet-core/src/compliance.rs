//! EU AI Act compliance reporting.
//!
//! Maps artifact types from the `eu-ai-act` schema to Annex IV sections
//! and computes per-section completeness.

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
        && schema
            .artifact_types
            .contains_key("conformity-declaration")
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
}
