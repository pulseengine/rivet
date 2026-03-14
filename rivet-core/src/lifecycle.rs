use std::collections::{BTreeMap, HashSet};

use crate::model::Artifact;

/// Expected downstream artifact types for lifecycle completeness.
/// Maps artifact_type -> list of expected downstream types that should trace to it.
fn expected_downstream() -> BTreeMap<&'static str, Vec<&'static str>> {
    let mut m = BTreeMap::new();
    // Requirements should be traced by architecture, features, or design decisions
    m.insert(
        "requirement",
        vec!["feature", "aadl-component", "design-decision"],
    );
    // Features should be traced by design decisions or architecture
    m.insert("feature", vec!["design-decision", "aadl-component"]);
    // Design decisions should have implementing features or architecture
    // (These are leaf nodes in many cases, so less strict)
    m
}

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

/// Check lifecycle completeness for artifacts.
///
/// For each requirement/feature that has a "done" or "implemented" status,
/// verify that downstream artifacts exist and link back to it.
/// Reports gaps where the traceability chain is incomplete.
pub fn check_lifecycle_completeness(artifacts: &[Artifact]) -> Vec<LifecycleGap> {
    let downstream_rules = expected_downstream();

    // Build a reverse-link index: target_id -> set of (source_id, source_type)
    let mut linked_by: BTreeMap<String, Vec<(&str, &str)>> = BTreeMap::new();
    for a in artifacts {
        for link in &a.links {
            linked_by
                .entry(link.target.clone())
                .or_default()
                .push((&a.id, &a.artifact_type));
        }
    }

    // Statuses that imply "this should be fully traced"
    let traced_statuses: HashSet<&str> =
        ["implemented", "done", "approved", "accepted", "verified"]
            .iter()
            .copied()
            .collect();

    let mut gaps = Vec::new();

    for artifact in artifacts {
        // Only check artifacts that have downstream expectations
        let expected = match downstream_rules.get(artifact.artifact_type.as_str()) {
            Some(e) => e,
            None => continue,
        };

        // Only check artifacts with "done"-like status
        let status = match &artifact.status {
            Some(s) => s.as_str(),
            None => continue,
        };
        if !traced_statuses.contains(status) {
            continue;
        }

        // Check what actually links to this artifact
        let linkers = linked_by.get(&artifact.id);
        let linker_types: HashSet<&str> = linkers
            .map(|v| v.iter().map(|(_, t)| *t).collect())
            .unwrap_or_default();

        // Find missing downstream types
        let missing: Vec<String> = expected
            .iter()
            .filter(|&&t| !linker_types.contains(t))
            .map(|t| t.to_string())
            .collect();

        // Report if any expected downstream types are missing
        if !missing.is_empty() {
            let has_any_downstream = !linker_types.is_empty();

            gaps.push(LifecycleGap {
                artifact_id: artifact.id.clone(),
                artifact_type: artifact.artifact_type.clone(),
                artifact_status: artifact.status.clone(),
                missing: if has_any_downstream {
                    // Only report truly missing types
                    missing
                } else {
                    // No downstream at all — report everything
                    vec!["no downstream artifacts found".into()]
                },
            });
        }
    }

    gaps
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::model::{Artifact, Link};

    fn make_artifact(
        id: &str,
        atype: &str,
        status: Option<&str>,
        links: Vec<(&str, &str)>,
    ) -> Artifact {
        Artifact {
            id: id.into(),
            artifact_type: atype.into(),
            title: format!("Test {id}"),
            description: None,
            status: status.map(|s| s.into()),
            tags: vec![],
            links: links
                .into_iter()
                .map(|(lt, t)| Link {
                    link_type: lt.into(),
                    target: t.into(),
                })
                .collect(),
            fields: BTreeMap::new(),
            source_file: None,
        }
    }

    #[test]
    fn implemented_req_without_downstream_reports_gap() {
        let artifacts = vec![make_artifact(
            "REQ-001",
            "requirement",
            Some("implemented"),
            vec![],
        )];
        let gaps = check_lifecycle_completeness(&artifacts);
        assert_eq!(gaps.len(), 1);
        assert_eq!(gaps[0].artifact_id, "REQ-001");
    }

    #[test]
    fn implemented_req_with_feature_has_partial_coverage() {
        let artifacts = vec![
            make_artifact("REQ-001", "requirement", Some("implemented"), vec![]),
            make_artifact(
                "FEAT-001",
                "feature",
                Some("done"),
                vec![("satisfies", "REQ-001")],
            ),
        ];
        let gaps = check_lifecycle_completeness(&artifacts);
        // REQ-001 has a feature but no architecture or design-decision → partial gap
        // FEAT-001 has status "done" but no design-decision or aadl-component → gap too
        assert_eq!(gaps.len(), 2);
        let req_gap = gaps.iter().find(|g| g.artifact_id == "REQ-001").unwrap();
        assert!(
            req_gap
                .missing
                .iter()
                .any(|m| m.contains("aadl-component") || m.contains("design-decision"))
        );
        let feat_gap = gaps.iter().find(|g| g.artifact_id == "FEAT-001").unwrap();
        assert!(
            feat_gap
                .missing
                .iter()
                .any(|m| m.contains("no downstream artifacts found"))
        );
    }

    #[test]
    fn draft_req_not_checked() {
        let artifacts = vec![make_artifact(
            "REQ-001",
            "requirement",
            Some("draft"),
            vec![],
        )];
        let gaps = check_lifecycle_completeness(&artifacts);
        assert!(gaps.is_empty()); // draft status not checked
    }

    #[test]
    fn fully_covered_req_no_gap() {
        let artifacts = vec![
            make_artifact("REQ-001", "requirement", Some("implemented"), vec![]),
            make_artifact("FEAT-001", "feature", None, vec![("satisfies", "REQ-001")]),
            make_artifact(
                "DD-001",
                "design-decision",
                None,
                vec![("satisfies", "REQ-001")],
            ),
            make_artifact(
                "ARCH-001",
                "aadl-component",
                None,
                vec![("allocated-from", "REQ-001")],
            ),
        ];
        let gaps = check_lifecycle_completeness(&artifacts);
        assert!(gaps.is_empty()); // all expected downstream types present
    }
}
