//! Traceability coverage reporting.
//!
//! Auto-discovers traceability rules from the schema and computes
//! per-rule coverage percentages.  Each rule checks whether artifacts of
//! a given source type have the required forward or backward links.

use serde::Serialize;

use crate::links::LinkGraph;
use crate::schema::Schema;
use crate::store::Store;

/// Coverage result for a single traceability rule.
#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
pub struct CoverageEntry {
    /// Rule name from the schema.
    pub rule_name: String,
    /// Human-readable description.
    pub description: String,
    /// Source artifact type being checked.
    pub source_type: String,
    /// The link type that is required (forward or backward).
    pub link_type: String,
    /// Whether the check uses forward links or backlinks.
    pub direction: CoverageDirection,
    /// Target / from types for the required link.
    pub target_types: Vec<String>,
    /// Number of source artifacts that satisfy the rule.
    pub covered: usize,
    /// Total source artifacts of the given type.
    pub total: usize,
    /// IDs of artifacts that are NOT covered.
    pub uncovered_ids: Vec<String>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
#[serde(rename_all = "lowercase")]
pub enum CoverageDirection {
    Forward,
    Backward,
}

impl CoverageEntry {
    /// Coverage percentage (0..100).  Returns 100 when total is 0.
    pub fn percentage(&self) -> f64 {
        if self.total == 0 {
            100.0
        } else {
            (self.covered as f64 / self.total as f64) * 100.0
        }
    }
}

/// Full coverage report across all traceability rules.
#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
pub struct CoverageReport {
    pub entries: Vec<CoverageEntry>,
}

impl CoverageReport {
    /// Overall coverage: weighted average across all rules (by artifact count).
    pub fn overall_coverage(&self) -> f64 {
        let total: usize = self.entries.iter().map(|e| e.total).sum();
        if total == 0 {
            return 100.0;
        }
        let covered: usize = self.entries.iter().map(|e| e.covered).sum();
        (covered as f64 / total as f64) * 100.0
    }

    /// Serialize the report to a JSON string.
    pub fn to_json(&self) -> Result<String, serde_json::Error> {
        serde_json::to_string_pretty(self)
    }
}

/// Compute coverage for every traceability rule in the schema.
pub fn compute_coverage(store: &Store, schema: &Schema, graph: &LinkGraph) -> CoverageReport {
    let mut entries = Vec::new();

    for rule in &schema.traceability_rules {
        let source_ids = store.by_type(&rule.source_type);
        let total = source_ids.len();
        let mut covered = 0usize;
        let mut uncovered_ids = Vec::new();

        let (link_type, direction, target_types) = if let Some(ref req_link) = rule.required_link {
            (
                req_link.clone(),
                CoverageDirection::Forward,
                rule.target_types.clone(),
            )
        } else if let Some(ref req_bl) = rule.required_backlink {
            (
                req_bl.clone(),
                CoverageDirection::Backward,
                rule.from_types.clone(),
            )
        } else {
            // Rule has neither required-link nor required-backlink; skip.
            continue;
        };

        for id in source_ids {
            let has_match = match direction {
                CoverageDirection::Forward => graph
                    .links_from(id)
                    .iter()
                    // Self-satisfying links (DD-001 → DD-001) must not count:
                    // an author could otherwise close the loop on their own
                    // artifact and pass coverage with zero upstream trace.
                    .filter(|l| l.link_type == link_type && l.target != *id)
                    .any(|l| {
                        if target_types.is_empty() {
                            true
                        } else {
                            store
                                .get(&l.target)
                                .is_some_and(|a| target_types.contains(&a.artifact_type))
                        }
                    }),
                CoverageDirection::Backward => graph
                    .backlinks_to(id)
                    .iter()
                    // Same reasoning as forward: a backlink from the artifact
                    // to itself (self-referential link) cannot count as
                    // "satisfied by a different artifact."
                    .filter(|bl| bl.link_type == link_type && bl.source != *id)
                    .any(|bl| {
                        if target_types.is_empty() {
                            true
                        } else {
                            store
                                .get(&bl.source)
                                .is_some_and(|a| target_types.contains(&a.artifact_type))
                        }
                    }),
            };

            if has_match {
                covered += 1;
            } else {
                uncovered_ids.push(id.clone());
            }
        }

        entries.push(CoverageEntry {
            rule_name: rule.name.clone(),
            description: rule.description.clone(),
            source_type: rule.source_type.clone(),
            link_type: link_type.clone(),
            direction,
            target_types,
            covered,
            total,
            uncovered_ids,
        });
    }

    CoverageReport { entries }
}

// ── Tests ────────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;
    use crate::schema::{Severity, TraceabilityRule};
    use crate::test_helpers::{artifact_with_links, minimal_artifact, minimal_schema};

    fn test_schema() -> Schema {
        let mut file = minimal_schema("test");
        file.traceability_rules = vec![
            TraceabilityRule {
                name: "req-coverage".into(),
                description: "Every req should be satisfied".into(),
                source_type: "requirement".into(),
                required_link: None,
                required_backlink: Some("satisfies".into()),
                target_types: vec![],
                from_types: vec!["design-decision".into()],
                severity: Severity::Warning,
            },
            TraceabilityRule {
                name: "dd-justification".into(),
                description: "Every DD must satisfy a req".into(),
                source_type: "design-decision".into(),
                required_link: Some("satisfies".into()),
                required_backlink: None,
                target_types: vec!["requirement".into()],
                from_types: vec![],
                severity: Severity::Error,
            },
        ];
        Schema::merge(&[file])
    }

    // rivet: verifies REQ-004
    #[test]
    fn full_coverage() {
        let schema = test_schema();
        let mut store = Store::new();
        store
            .insert(minimal_artifact("REQ-001", "requirement"))
            .unwrap();
        store
            .insert(artifact_with_links(
                "DD-001",
                "design-decision",
                &[("satisfies", "REQ-001")],
            ))
            .unwrap();

        let graph = LinkGraph::build(&store, &schema);
        let report = compute_coverage(&store, &schema, &graph);

        assert_eq!(report.entries.len(), 2);

        // req-coverage: REQ-001 has a backlink from DD-001 via satisfies
        let req_entry = &report.entries[0];
        assert_eq!(req_entry.rule_name, "req-coverage");
        assert_eq!(req_entry.covered, 1);
        assert_eq!(req_entry.total, 1);
        assert!((req_entry.percentage() - 100.0).abs() < f64::EPSILON);

        // dd-justification: DD-001 has forward link satisfies -> REQ-001
        let dd_entry = &report.entries[1];
        assert_eq!(dd_entry.rule_name, "dd-justification");
        assert_eq!(dd_entry.covered, 1);
        assert_eq!(dd_entry.total, 1);

        assert!((report.overall_coverage() - 100.0).abs() < f64::EPSILON);
    }

    // rivet: verifies REQ-004
    #[test]
    fn partial_coverage() {
        let schema = test_schema();
        let mut store = Store::new();
        store
            .insert(minimal_artifact("REQ-001", "requirement"))
            .unwrap();
        store
            .insert(minimal_artifact("REQ-002", "requirement"))
            .unwrap();
        store
            .insert(artifact_with_links(
                "DD-001",
                "design-decision",
                &[("satisfies", "REQ-001")],
            ))
            .unwrap();

        let graph = LinkGraph::build(&store, &schema);
        let report = compute_coverage(&store, &schema, &graph);

        // req-coverage: 1/2 covered
        let req_entry = &report.entries[0];
        assert_eq!(req_entry.covered, 1);
        assert_eq!(req_entry.total, 2);
        assert!((req_entry.percentage() - 50.0).abs() < f64::EPSILON);
        assert_eq!(req_entry.uncovered_ids, vec!["REQ-002"]);

        // overall: 2 covered out of 3 total
        assert!((report.overall_coverage() - 66.666_666_666_666_66).abs() < 0.01);
    }

    // rivet: verifies REQ-004
    #[test]
    fn zero_artifacts_gives_100_percent() {
        let schema = test_schema();
        let store = Store::new();
        let graph = LinkGraph::build(&store, &schema);
        let report = compute_coverage(&store, &schema, &graph);

        // Both rules have 0 source artifacts → percentage is 100
        for entry in &report.entries {
            assert_eq!(entry.total, 0);
            assert!((entry.percentage() - 100.0).abs() < f64::EPSILON);
        }
        assert!((report.overall_coverage() - 100.0).abs() < f64::EPSILON);
    }

    // rivet: partially-verifies REQ-004
    #[test]
    fn to_json_roundtrip() {
        let schema = test_schema();
        let store = Store::new();
        let graph = LinkGraph::build(&store, &schema);
        let report = compute_coverage(&store, &schema, &graph);

        let json = report.to_json().expect("serialize");
        assert!(json.contains("req-coverage"));
        assert!(json.contains("dd-justification"));
    }

    /// Self-satisfying links (`source == target`, e.g. `DD-001 → DD-001`)
    /// must not count as satisfying a traceability rule. Otherwise an
    /// author can close the loop on their own artifact and pass CI without
    /// any real upstream trace.
    ///
    /// rivet: fixes REQ-004
    #[test]
    fn self_link_does_not_satisfy_forward_rule() {
        // Rule: every DD must satisfy *any* artifact (target_types empty).
        // Without the fix, a DD that points to itself would count.
        let mut file = minimal_schema("test");
        file.traceability_rules = vec![TraceabilityRule {
            name: "dd-needs-upstream".into(),
            description: "Every DD must satisfy something upstream".into(),
            source_type: "design-decision".into(),
            required_link: Some("satisfies".into()),
            required_backlink: None,
            target_types: vec![], // match any — makes the self-link trap reachable
            from_types: vec![],
            severity: Severity::Error,
        }];
        let schema = Schema::merge(&[file]);

        let mut store = Store::new();
        // DD-001 "satisfies" itself.
        store
            .insert(artifact_with_links(
                "DD-001",
                "design-decision",
                &[("satisfies", "DD-001")],
            ))
            .unwrap();

        let graph = LinkGraph::build(&store, &schema);
        let report = compute_coverage(&store, &schema, &graph);
        let entry = &report.entries[0];
        assert_eq!(entry.rule_name, "dd-needs-upstream");
        assert_eq!(
            entry.covered, 0,
            "DD-001 self-satisfying link must not count as covered"
        );
        assert_eq!(entry.total, 1);
        assert_eq!(entry.uncovered_ids, vec!["DD-001"]);
    }

    /// Backlink direction of the same bug: a DD that claims its own
    /// requirement (e.g. REQ-X backlinked by REQ-X via some self-link)
    /// must not count.
    ///
    /// rivet: fixes REQ-004
    #[test]
    fn self_link_does_not_satisfy_backlink_rule() {
        let mut file = minimal_schema("test");
        file.traceability_rules = vec![TraceabilityRule {
            name: "req-needs-downstream".into(),
            description: "Every req must be satisfied by something".into(),
            source_type: "requirement".into(),
            required_link: None,
            required_backlink: Some("satisfies".into()),
            target_types: vec![],
            from_types: vec![], // match any
            severity: Severity::Warning,
        }];
        let schema = Schema::merge(&[file]);

        let mut store = Store::new();
        // REQ-001 has a self-satisfies link (i.e. REQ-001 → REQ-001).
        // The backlink REQ-001 ← REQ-001 must not count as "satisfied by
        // a downstream artifact."
        store
            .insert(artifact_with_links(
                "REQ-001",
                "requirement",
                &[("satisfies", "REQ-001")],
            ))
            .unwrap();

        let graph = LinkGraph::build(&store, &schema);
        let report = compute_coverage(&store, &schema, &graph);
        let entry = &report.entries[0];
        assert_eq!(entry.rule_name, "req-needs-downstream");
        assert_eq!(
            entry.covered, 0,
            "self-backlink must not count REQ-001 as covered"
        );
        assert_eq!(entry.total, 1);
    }
}
