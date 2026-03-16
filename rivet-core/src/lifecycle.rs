use std::collections::{BTreeMap, HashSet};

use crate::links::LinkGraph;
use crate::model::{Artifact, TRACED_STATUSES};
use crate::schema::Schema;

/// A gap in the lifecycle traceability chain.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct LifecycleGap {
    /// The artifact with incomplete coverage.
    pub artifact_id: String,
    pub artifact_type: String,
    pub artifact_status: Option<String>,
    /// What's missing.
    pub missing: Vec<String>,
}

/// Check lifecycle completeness for artifacts using schema traceability rules.
///
/// For each artifact type that has traceability rules expecting backlinks or
/// forward links, verify that approved/implemented artifacts satisfy them.
/// Reports gaps where the traceability chain is incomplete.
///
/// Derives expectations from the schema rather than hardcoding type mappings.
pub fn check_lifecycle_completeness(
    artifacts: &[Artifact],
    schema: &Schema,
    graph: &LinkGraph,
) -> Vec<LifecycleGap> {
    // Build expected downstream types from the schema's traceability rules.
    // A rule with source_type X and required_backlink from_types [Y, Z] means
    // X expects backlinks from types Y or Z.
    let mut expected_backlink_types: BTreeMap<String, HashSet<String>> = BTreeMap::new();
    for rule in &schema.traceability_rules {
        if rule.required_backlink.is_some() {
            for from_type in &rule.from_types {
                expected_backlink_types
                    .entry(rule.source_type.clone())
                    .or_default()
                    .insert(from_type.clone());
            }
        }
    }

    // Statuses that imply "this should be fully traced"
    let traced_statuses: HashSet<&str> = TRACED_STATUSES.iter().copied().collect();

    // Build artifact type lookup
    let artifact_type_map: BTreeMap<&str, &str> = artifacts
        .iter()
        .map(|a| (a.id.as_str(), a.artifact_type.as_str()))
        .collect();

    let mut gaps = Vec::new();

    for artifact in artifacts {
        // Skip verification artifacts — those with verifies/partially-verifies
        // links are leaf nodes in the traceability chain
        let is_verification = artifact
            .links
            .iter()
            .any(|l| l.link_type.contains("verifies"));
        if is_verification {
            continue;
        }

        // Only check artifact types that have traceability rules expecting backlinks
        let expected = match expected_backlink_types.get(&artifact.artifact_type) {
            Some(types) if !types.is_empty() => types,
            _ => continue,
        };

        // Only check artifacts with "done"-like status
        let status = match &artifact.status {
            Some(s) => s.as_str(),
            None => continue,
        };
        if !traced_statuses.contains(status) {
            continue;
        }

        // Collect types that link TO this artifact (backlinks from the graph)
        let backlink_types: HashSet<&str> = graph
            .backlinks_to(&artifact.id)
            .iter()
            .filter_map(|bl| artifact_type_map.get(bl.source.as_str()).copied())
            .collect();

        // Also check what this artifact links TO (forward links)
        // e.g., FEAT-001 --implements--> DD-031 means design-decision is covered
        let forward_types: HashSet<&str> = artifact
            .links
            .iter()
            .filter_map(|l| artifact_type_map.get(l.target.as_str()).copied())
            .collect();

        // Combine both directions
        let mut covered_types: HashSet<&str> = backlink_types;
        covered_types.extend(forward_types);

        // Find missing expected types
        let missing: Vec<String> = expected
            .iter()
            .filter(|t| !covered_types.contains(t.as_str()))
            .cloned()
            .collect();

        if !missing.is_empty() {
            gaps.push(LifecycleGap {
                artifact_id: artifact.id.clone(),
                artifact_type: artifact.artifact_type.clone(),
                artifact_status: artifact.status.clone(),
                missing: if covered_types.is_empty() {
                    vec!["no downstream artifacts found".into()]
                } else {
                    missing
                },
            });
        }
    }

    gaps
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::schema::{Schema, Severity, TraceabilityRule};
    use crate::store::Store;
    use crate::test_helpers::{artifact_with_links, minimal_schema};

    fn make_artifact(
        id: &str,
        atype: &str,
        status: Option<&str>,
        links: Vec<(&str, &str)>,
    ) -> Artifact {
        let mut a = artifact_with_links(id, atype, &links);
        a.status = status.map(|s| s.into());
        a
    }

    fn make_schema_with_rules(rules: Vec<TraceabilityRule>) -> Schema {
        let mut file = minimal_schema("test");
        file.traceability_rules = rules;
        Schema::merge(&[file])
    }

    fn build_graph(artifacts: &[Artifact], schema: &Schema) -> LinkGraph {
        let mut store = Store::new();
        for a in artifacts {
            let _ = store.insert(a.clone());
        }
        LinkGraph::build(&store, schema)
    }

    // rivet: verifies REQ-004
    #[test]
    fn implemented_req_without_downstream_reports_gap() {
        let schema = make_schema_with_rules(vec![TraceabilityRule {
            name: "req-needs-feature".into(),
            description: "Requirements need features".into(),
            source_type: "requirement".into(),
            required_link: None,
            required_backlink: Some("satisfies".into()),
            target_types: vec![],
            from_types: vec!["feature".into()],
            severity: Severity::Warning,
        }]);
        let artifacts = vec![make_artifact(
            "REQ-001",
            "requirement",
            Some("implemented"),
            vec![],
        )];
        let graph = build_graph(&artifacts, &schema);
        let gaps = check_lifecycle_completeness(&artifacts, &schema, &graph);
        assert_eq!(gaps.len(), 1);
        assert_eq!(gaps[0].artifact_id, "REQ-001");
    }

    // rivet: verifies REQ-004
    #[test]
    fn implemented_req_with_feature_has_coverage() {
        let schema = make_schema_with_rules(vec![TraceabilityRule {
            name: "req-needs-feature".into(),
            description: "Requirements need features".into(),
            source_type: "requirement".into(),
            required_link: None,
            required_backlink: Some("satisfies".into()),
            target_types: vec![],
            from_types: vec!["feature".into()],
            severity: Severity::Warning,
        }]);
        let artifacts = vec![
            make_artifact("REQ-001", "requirement", Some("implemented"), vec![]),
            make_artifact(
                "FEAT-001",
                "feature",
                Some("done"),
                vec![("satisfies", "REQ-001")],
            ),
        ];
        let graph = build_graph(&artifacts, &schema);
        let gaps = check_lifecycle_completeness(&artifacts, &schema, &graph);
        // REQ-001 has a feature satisfying it — no gap for requirement
        let req_gaps: Vec<_> = gaps.iter().filter(|g| g.artifact_id == "REQ-001").collect();
        assert!(
            req_gaps.is_empty(),
            "REQ with satisfying feature should have no gap"
        );
    }

    // rivet: partially-verifies REQ-004
    #[test]
    fn draft_req_not_checked() {
        let schema = make_schema_with_rules(vec![TraceabilityRule {
            name: "req-needs-feature".into(),
            description: "Requirements need features".into(),
            source_type: "requirement".into(),
            required_link: None,
            required_backlink: Some("satisfies".into()),
            target_types: vec![],
            from_types: vec!["feature".into()],
            severity: Severity::Warning,
        }]);
        let artifacts = vec![make_artifact(
            "REQ-001",
            "requirement",
            Some("draft"),
            vec![],
        )];
        let graph = build_graph(&artifacts, &schema);
        let gaps = check_lifecycle_completeness(&artifacts, &schema, &graph);
        assert!(gaps.is_empty()); // draft status not checked
    }

    // rivet: verifies REQ-004
    #[test]
    fn fully_covered_req_no_gap() {
        let schema = make_schema_with_rules(vec![TraceabilityRule {
            name: "req-needs-feature".into(),
            description: "reqs need features".into(),
            source_type: "requirement".into(),
            required_link: None,
            required_backlink: Some("satisfies".into()),
            target_types: vec![],
            from_types: vec!["feature".into(), "design-decision".into()],
            severity: Severity::Warning,
        }]);
        let artifacts = vec![
            make_artifact("REQ-001", "requirement", Some("implemented"), vec![]),
            make_artifact("FEAT-001", "feature", None, vec![("satisfies", "REQ-001")]),
            make_artifact(
                "DD-001",
                "design-decision",
                None,
                vec![("satisfies", "REQ-001")],
            ),
        ];
        let graph = build_graph(&artifacts, &schema);
        let gaps = check_lifecycle_completeness(&artifacts, &schema, &graph);
        assert!(gaps.is_empty()); // all expected types present
    }
}
