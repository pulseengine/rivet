//! Traceability coverage reporting.
//!
//! Auto-discovers traceability rules from the schema and computes
//! per-rule coverage percentages.  Each rule checks whether artifacts of
//! a given source type have the required forward or backward links.

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

use crate::links::LinkGraph;
use crate::schema::Schema;
use crate::store::Store;

/// Coverage result for a single traceability rule.
///
/// 3-state coverage (issue #253): `covered + external_boundary +
/// uncovered_ids.len() == total`. `external_boundary` counts source
/// artifacts whose chain terminates at an `external-anchor` whose
/// `expected-derived-types` covers the rule's target type — i.e. the
/// derivative is delegated to a supplier, not missing.
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
    /// Number of source artifacts that satisfy the rule in-house.
    pub covered: usize,
    /// Number of source artifacts whose derivative is delegated to a
    /// supplier (terminates at an `external-anchor`). Issue #253 MVP.
    #[serde(default, skip_serializing_if = "is_zero")]
    pub external_boundary: usize,
    /// IDs of source artifacts counted as `external_boundary`.
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub external_boundary_ids: Vec<String>,
    /// Total source artifacts of the given type.
    pub total: usize,
    /// IDs of artifacts that are NOT covered (strictly missing, NOT
    /// counting `external_boundary_ids`).
    pub uncovered_ids: Vec<String>,
}

#[inline]
fn is_zero(n: &usize) -> bool {
    *n == 0
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
#[serde(rename_all = "lowercase")]
pub enum CoverageDirection {
    Forward,
    Backward,
}

impl CoverageEntry {
    /// In-house coverage percentage (0..100). Counts only `covered`,
    /// excluding `external_boundary`. Returns 100 when total is 0.
    pub fn percentage(&self) -> f64 {
        if self.total == 0 {
            100.0
        } else {
            (self.covered as f64 / self.total as f64) * 100.0
        }
    }

    /// Combined accounted percentage: `(covered + external_boundary) /
    /// total`. Issue #253: an auditor sees this as "what's not strictly
    /// missing from the trace — either we satisfy it, or a supplier
    /// owes it on a recorded boundary." Returns 100 when total is 0.
    pub fn accounted_percentage(&self) -> f64 {
        if self.total == 0 {
            100.0
        } else {
            ((self.covered + self.external_boundary) as f64 / self.total as f64) * 100.0
        }
    }
}

/// V-closure for one source artifact type: the *intersection* of every
/// traceability rule that applies to it.
///
/// Per-rule coverage answers "how many requirements are satisfied?" and,
/// separately, "how many are verified?" — but a release needs the **both**:
/// a requirement is closed in the V only when it is satisfied (left side)
/// *and* verified (right side). This is strictly stronger than per-rule
/// coverage — a type can be 100% on each rule individually yet have lower
/// closure when *different* artifacts miss *different* rules.
///
/// `closed` follows the same 3-state convention as [`CoverageEntry`]: an
/// artifact is closed when it is not *strictly missing* on any applicable
/// rule (covered OR external-boundary on each). `open_ids` is the union of
/// the applicable rules' `uncovered_ids` — the artifacts missing at least
/// one side.
#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
pub struct ClosureEntry {
    /// Source artifact type (e.g. `"requirement"`).
    pub source_type: String,
    /// Names of the rules intersected (always ≥ 2).
    pub rule_names: Vec<String>,
    /// Total source artifacts of this type.
    pub total: usize,
    /// Artifacts not strictly missing on any applicable rule.
    pub closed: usize,
    /// IDs strictly missing on at least one applicable rule (sorted, unique).
    pub open_ids: Vec<String>,
}

impl ClosureEntry {
    /// Closure percentage (0..100). Returns 100 when total is 0.
    pub fn percentage(&self) -> f64 {
        if self.total == 0 {
            100.0
        } else {
            (self.closed as f64 / self.total as f64) * 100.0
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

    /// V-closure across every source type that is governed by more than one
    /// traceability rule — the intersection of those rules (e.g. the count
    /// of requirements that are BOTH satisfied AND verified). Source types
    /// with a single rule are omitted: their closure is just that rule's
    /// coverage, so there is nothing new to report. Entries preserve the
    /// first-seen order of source types in `self.entries`.
    pub fn v_closure(&self) -> Vec<ClosureEntry> {
        use std::collections::BTreeSet;

        // Group rule-entries by source type, preserving first-seen order.
        let mut order: Vec<&str> = Vec::new();
        for e in &self.entries {
            if !order.contains(&e.source_type.as_str()) {
                order.push(&e.source_type);
            }
        }

        let mut out = Vec::new();
        for st in order {
            let group: Vec<&CoverageEntry> = self
                .entries
                .iter()
                .filter(|e| e.source_type == st)
                .collect();
            if group.len() < 2 {
                continue;
            }
            // Every rule over the same source type sees the same artifact
            // population; take the max defensively in case a rule scoped its
            // total differently.
            let total = group.iter().map(|e| e.total).max().unwrap_or(0);
            let open: BTreeSet<&str> = group
                .iter()
                .flat_map(|e| e.uncovered_ids.iter().map(String::as_str))
                .collect();
            let open_ids: Vec<String> = open.iter().map(|s| s.to_string()).collect();
            let closed = total.saturating_sub(open_ids.len());
            out.push(ClosureEntry {
                source_type: st.to_string(),
                rule_names: group.iter().map(|e| e.rule_name.clone()).collect(),
                total,
                closed,
                open_ids,
            });
        }
        out
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
        let mut external_boundary = 0usize;
        let mut external_boundary_ids = Vec::new();
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
                CoverageDirection::Backward => {
                    // Schemas write the backlink name as either the forward
                    // link-type (e.g. `satisfies`) or the inverse
                    // (e.g. `supported-by`); accept either. `alternate-backlinks`
                    // adds further acceptable shapes (e.g. a safety-goal that
                    // is `supported-by` OR `decomposed-by` OR `has-sub-goal`).
                    let backlinks = graph.backlinks_to(id);
                    let backlink_matches = |link_name: &str, from_types: &[String]| {
                        backlinks
                            .iter()
                            // Same reasoning as forward: a backlink from the
                            // artifact to itself (self-referential link) cannot
                            // count as "satisfied by a different artifact."
                            .filter(|bl| bl.source != *id)
                            .filter(|bl| {
                                bl.link_type == link_name
                                    || bl.inverse_type.as_deref() == Some(link_name)
                            })
                            .any(|bl| {
                                if from_types.is_empty() {
                                    true
                                } else {
                                    store
                                        .get(&bl.source)
                                        .is_some_and(|a| from_types.contains(&a.artifact_type))
                                }
                            })
                    };
                    backlink_matches(&link_type, &target_types)
                        || rule
                            .alternate_backlinks
                            .iter()
                            .any(|alt| backlink_matches(&alt.link_type, &alt.from_types))
                }
            };

            if has_match {
                covered += 1;
            } else if terminates_at_external_anchor(store, graph, id, &target_types) {
                external_boundary += 1;
                external_boundary_ids.push(id.clone());
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
            external_boundary,
            external_boundary_ids,
            total,
            uncovered_ids,
        });
    }

    CoverageReport { entries }
}

/// Issue #253: does any forward link from `id` reach an `external-anchor`
/// artifact whose `expected-derived-types` field declares at least one
/// of `target_types`? If so, the unsatisfied rule should count as
/// `external_boundary` rather than `uncovered`.
///
/// Walks only the *outgoing* links (any link type — supplier delegation
/// is a property of the artifact's existence at the chain end, not of
/// a specific link predicate). Self-links are ignored to match the
/// forward-coverage rule above.
fn terminates_at_external_anchor(
    store: &Store,
    graph: &LinkGraph,
    id: &str,
    rule_target_types: &[String],
) -> bool {
    for link in graph.links_from(id) {
        if link.target == id {
            continue;
        }
        let Some(target_art) = store.get(&link.target) else {
            continue;
        };
        if target_art.artifact_type != "external-anchor" {
            continue;
        }
        // The anchor's `expected-derived-types` field is a YAML list of
        // strings. Accept the boundary only when the rule's required
        // target type set overlaps the anchor's expected derivatives
        // (or when the rule has no target-type restriction at all).
        if rule_target_types.is_empty() {
            return true;
        }
        let Some(expected) = target_art.fields.get("expected-derived-types") else {
            // Anchor without an explicit contract: be conservative —
            // only honour the boundary when the rule is unrestricted.
            continue;
        };
        let serde_yaml::Value::Sequence(items) = expected else {
            continue;
        };
        let anchor_provides: Vec<&str> = items.iter().filter_map(|v| v.as_str()).collect();
        if anchor_provides
            .iter()
            .any(|t| rule_target_types.iter().any(|rt| rt == t))
        {
            return true;
        }
    }
    false
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
                alternate_backlinks: vec![],
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
                alternate_backlinks: vec![],
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
            alternate_backlinks: vec![],
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

    /// Issue #253: an artifact whose chain ends at an `external-anchor`
    /// counts as `external_boundary`, not `uncovered`. The boundary
    /// signal is honoured only when the anchor's
    /// `expected-derived-types` includes the rule's target type — so
    /// the auditor sees "delegated to supplier" only for the *kind* of
    /// derivative the supplier was actually contracted to deliver.
    ///
    /// rivet: verifies REQ-004
    #[test]
    fn external_anchor_terminates_chain_as_boundary_not_uncovered() {
        // Rule: every DD must `satisfies` a `requirement` upstream.
        let mut file = minimal_schema("test");
        file.traceability_rules = vec![TraceabilityRule {
            name: "dd-justification".into(),
            description: "Every DD must satisfy a req".into(),
            source_type: "design-decision".into(),
            required_link: Some("satisfies".into()),
            required_backlink: None,
            target_types: vec!["requirement".into()],
            from_types: vec![],
            severity: Severity::Error,
            alternate_backlinks: vec![],
        }];
        let schema = Schema::merge(&[file]);

        let mut store = Store::new();
        store
            .insert(minimal_artifact("REQ-001", "requirement"))
            .unwrap();
        // DD-A satisfies REQ-001 in-house → covered.
        store
            .insert(artifact_with_links(
                "DD-A",
                "design-decision",
                &[("satisfies", "REQ-001")],
            ))
            .unwrap();
        // DD-B has no satisfies link and no anchor → uncovered.
        store
            .insert(minimal_artifact("DD-B", "design-decision"))
            .unwrap();
        // DD-C terminates at an external-anchor that declares it covers
        // requirements → external_boundary.
        let mut anchor = minimal_artifact("ANCHOR-ACME-001", "external-anchor");
        anchor.fields.insert(
            "expected-derived-types".into(),
            serde_yaml::Value::Sequence(vec![serde_yaml::Value::String("requirement".into())]),
        );
        store.insert(anchor).unwrap();
        store
            .insert(artifact_with_links(
                "DD-C",
                "design-decision",
                &[("derives-from", "ANCHOR-ACME-001")],
            ))
            .unwrap();

        let graph = LinkGraph::build(&store, &schema);
        let report = compute_coverage(&store, &schema, &graph);
        let entry = &report.entries[0];

        assert_eq!(entry.covered, 1, "DD-A satisfies in-house");
        assert_eq!(entry.external_boundary, 1, "DD-C delegated to anchor");
        assert_eq!(entry.external_boundary_ids, vec!["DD-C"]);
        assert_eq!(entry.uncovered_ids, vec!["DD-B"], "DD-B genuinely missing");
        assert_eq!(entry.total, 3);

        // 3-state sum invariant: every source artifact lands in exactly
        // one bucket.
        assert_eq!(
            entry.covered + entry.external_boundary + entry.uncovered_ids.len(),
            entry.total
        );

        // Percentages: covered alone is 1/3 ≈ 33.3%, but the accounted
        // figure (covered + boundary) is 2/3 ≈ 66.7%.
        assert!((entry.percentage() - 33.333).abs() < 0.1);
        assert!((entry.accounted_percentage() - 66.666).abs() < 0.1);
    }

    /// An external-anchor whose `expected-derived-types` does NOT include
    /// the rule's target type must NOT trigger the boundary classification —
    /// otherwise an unrelated anchor would silently absorb every coverage
    /// gap that happens to link to it.
    ///
    /// rivet: verifies REQ-004
    #[test]
    fn external_anchor_only_counts_when_expected_types_match() {
        let mut file = minimal_schema("test");
        file.traceability_rules = vec![TraceabilityRule {
            name: "dd-justification".into(),
            description: "Every DD must satisfy a req".into(),
            source_type: "design-decision".into(),
            required_link: Some("satisfies".into()),
            required_backlink: None,
            target_types: vec!["requirement".into()],
            from_types: vec![],
            severity: Severity::Error,
            alternate_backlinks: vec![],
        }];
        let schema = Schema::merge(&[file]);

        let mut store = Store::new();
        // Anchor delivers *verifications*, not requirements → off-contract
        // for this rule.
        let mut anchor = minimal_artifact("ANCHOR-X", "external-anchor");
        anchor.fields.insert(
            "expected-derived-types".into(),
            serde_yaml::Value::Sequence(vec![serde_yaml::Value::String("verification".into())]),
        );
        store.insert(anchor).unwrap();
        store
            .insert(artifact_with_links(
                "DD-1",
                "design-decision",
                &[("derives-from", "ANCHOR-X")],
            ))
            .unwrap();

        let graph = LinkGraph::build(&store, &schema);
        let report = compute_coverage(&store, &schema, &graph);
        let entry = &report.entries[0];

        assert_eq!(entry.external_boundary, 0, "anchor off-contract");
        assert_eq!(
            entry.uncovered_ids,
            vec!["DD-1"],
            "must remain uncovered, not silently absorbed"
        );
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
            alternate_backlinks: vec![],
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

    /// Issue #349: schemas write `required-backlink` as either the forward
    /// link-type name (`supports`) or its inverse name (`supported-by`).
    /// safety-case.yaml uses the inverse-name convention. With the bug,
    /// no artifact was ever counted as covered for such rules because the
    /// stored `Backlink.link_type` is the forward name. This regression
    /// test pins the fix: both conventions must produce identical coverage.
    ///
    /// rivet: fixes REQ-004
    #[test]
    fn required_backlink_matches_inverse_link_type_name() {
        use crate::schema::LinkTypeDef;
        let mut file = minimal_schema("test");
        // Declare the link type with its inverse — mirrors safety-case.yaml.
        file.link_types.push(LinkTypeDef {
            name: "supports".into(),
            inverse: Some("supported-by".into()),
            description: "Solution supports goal".into(),
            source_types: vec!["safety-solution".into()],
            target_types: vec!["safety-goal".into()],
        });
        file.traceability_rules = vec![TraceabilityRule {
            name: "goal-has-support".into(),
            description: "Every safety goal must be supported by evidence".into(),
            source_type: "safety-goal".into(),
            required_link: None,
            // INVERSE name — the case that was silently broken.
            required_backlink: Some("supported-by".into()),
            target_types: vec![],
            from_types: vec!["safety-solution".into()],
            severity: Severity::Error,
            alternate_backlinks: vec![],
        }];
        let schema = Schema::merge(&[file]);

        let mut store = Store::new();
        store
            .insert(minimal_artifact("SG-1", "safety-goal"))
            .unwrap();
        // SOL-1 has the FORWARD link `supports → SG-1`. The auto-computed
        // backlink to SG-1 stores `link_type = "supports"` and
        // `inverse_type = Some("supported-by")`.
        store
            .insert(artifact_with_links(
                "SOL-1",
                "safety-solution",
                &[("supports", "SG-1")],
            ))
            .unwrap();

        let graph = LinkGraph::build(&store, &schema);
        let report = compute_coverage(&store, &schema, &graph);
        let entry = report
            .entries
            .iter()
            .find(|e| e.rule_name == "goal-has-support")
            .expect("rule should produce a coverage entry");

        assert_eq!(
            entry.covered, 1,
            "SG-1 is supported-by SOL-1 (via the forward `supports` link); \
             coverage must count it even though the rule names the inverse"
        );
        assert!(entry.uncovered_ids.is_empty(), "no goals are uncovered");
    }

    /// Issue #349 secondary: `alternate-backlinks` were never evaluated.
    /// Safety-case schemas express "supported-by OR decomposed-by OR
    /// has-sub-goal" via this field; an artifact satisfied only via an
    /// alternate must still count as covered.
    ///
    /// rivet: fixes REQ-004
    #[test]
    fn coverage_honours_alternate_backlinks() {
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
            name: "goal-has-support".into(),
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
        // SG-A is decomposed (alternate) — no `supports` backlink. Must
        // still count as covered.
        store
            .insert(minimal_artifact("SG-A", "safety-goal"))
            .unwrap();
        store
            .insert(artifact_with_links(
                "STRAT-1",
                "safety-strategy",
                &[("decomposes", "SG-A")],
            ))
            .unwrap();
        // SG-B has neither — uncovered.
        store
            .insert(minimal_artifact("SG-B", "safety-goal"))
            .unwrap();

        let graph = LinkGraph::build(&store, &schema);
        let report = compute_coverage(&store, &schema, &graph);
        let entry = report
            .entries
            .iter()
            .find(|e| e.rule_name == "goal-has-support")
            .expect("rule should produce a coverage entry");

        assert_eq!(entry.covered, 1, "SG-A covered via alternate backlink");
        assert_eq!(entry.uncovered_ids, vec!["SG-B"]);
        assert_eq!(entry.total, 2);
    }

    fn rule_entry(rule: &str, source: &str, total: usize, uncovered: &[&str]) -> CoverageEntry {
        CoverageEntry {
            rule_name: rule.into(),
            description: String::new(),
            source_type: source.into(),
            link_type: "x".into(),
            direction: CoverageDirection::Backward,
            target_types: vec![],
            covered: total - uncovered.len(),
            external_boundary: 0,
            external_boundary_ids: vec![],
            total,
            uncovered_ids: uncovered.iter().map(|s| s.to_string()).collect(),
        }
    }

    // rivet: verifies REQ-228
    #[test]
    fn v_closure_is_the_intersection_not_the_per_rule_average() {
        // Two rules over `requirement`: satisfies (left side of the V) and
        // verifies (right side). REQ-002 misses satisfies; REQ-003 misses
        // verifies. Each rule alone is 2/3, but only REQ-001 is closed on
        // BOTH — closure is 1/3, strictly lower than either rule.
        let report = CoverageReport {
            entries: vec![
                rule_entry("req-satisfies", "requirement", 3, &["REQ-002"]),
                rule_entry("req-verifies", "requirement", 3, &["REQ-003"]),
            ],
        };

        let closure = report.v_closure();
        assert_eq!(closure.len(), 1, "one source type with ≥2 rules");
        let c = &closure[0];
        assert_eq!(c.source_type, "requirement");
        assert_eq!(c.rule_names, vec!["req-satisfies", "req-verifies"]);
        assert_eq!(c.total, 3);
        assert_eq!(c.closed, 1, "only REQ-001 satisfies BOTH rules");
        assert_eq!(c.open_ids, vec!["REQ-002", "REQ-003"]);
        assert!((c.percentage() - 33.333).abs() < 0.01);
    }

    #[test]
    fn v_closure_omits_single_rule_types_and_counts_external_boundary_as_closed() {
        let mut satisfies = rule_entry("req-satisfies", "requirement", 3, &[]);
        // REQ-003 is delegated to a supplier on the verifies side: it is an
        // external-boundary, NOT strictly missing, so it stays closed.
        let mut verifies = rule_entry("req-verifies", "requirement", 3, &[]);
        verifies.covered = 2;
        verifies.external_boundary = 1;
        verifies.external_boundary_ids = vec!["REQ-003".into()];
        satisfies.covered = 3;

        let report = CoverageReport {
            entries: vec![
                satisfies,
                verifies,
                // A single-rule type contributes no closure entry.
                rule_entry("dd-justifies", "design-decision", 2, &["DD-002"]),
            ],
        };

        let closure = report.v_closure();
        assert_eq!(closure.len(), 1, "design-decision (single rule) omitted");
        assert_eq!(closure[0].source_type, "requirement");
        assert_eq!(
            closure[0].closed, 3,
            "external-boundary REQ-003 counts as closed (accounted)"
        );
        assert!(closure[0].open_ids.is_empty());
    }
}
