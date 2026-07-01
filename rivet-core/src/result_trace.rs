//! Forward req → test-result trace (#547 / REQ-238).
//!
//! The trace graph is authored "upstream": a verification/test artifact carries
//! an outgoing `verifies` link to the requirement it covers, and its pass/fail
//! outcome lives in the [`ResultStore`] keyed by that verification's id. So
//! "given a requirement, what are its test results?" means walking **backlinks**
//! (incoming links) from the requirement — possibly several hops, e.g. the
//! ASPICE chain `sw-req <- sw-detail-design <- unit-verification` — and reading
//! the latest result for each reached artifact.
//!
//! This module computes that trace as plain data; the CLI and the `rivet serve`
//! dashboard render it (the dashboard adds the graphical view).

// SAFETY-REVIEW (SCRC Phase 1, DD-058): file-scope allow, see sibling modules.
#![allow(
    clippy::unwrap_used,
    clippy::expect_used,
    clippy::indexing_slicing,
    clippy::arithmetic_side_effects
)]

use std::collections::{BTreeSet, VecDeque};

use crate::links::LinkGraph;
use crate::results::{ResultStore, TestStatus};

/// One artifact reached while tracing backwards from a requirement toward its
/// test evidence.
#[derive(Debug, Clone, PartialEq, Eq, serde::Serialize)]
pub struct ResultTraceNode {
    /// The reached artifact's id.
    pub artifact_id: String,
    /// The id one hop closer to the root that this node links to (its parent in
    /// the trace tree) — so a consumer can draw edges. `None` for depth-1 nodes
    /// whose parent is the root itself is still the root's id.
    pub via_target: String,
    /// The link type connecting this node to `via_target` (e.g. `verifies`,
    /// `satisfies`).
    pub link_type: String,
    /// Hops from the root requirement (1 = directly links to it).
    pub distance: usize,
    /// Latest test-result status for this artifact, if the result store has one.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub status: Option<TestStatus>,
}

impl ResultTraceNode {
    /// True when this node carries an actual test outcome (i.e. it is a leaf
    /// verification with a recorded result), as opposed to an intermediate
    /// design/architecture artifact on the path.
    pub fn has_result(&self) -> bool {
        self.status.is_some()
    }
}

/// Trace from a requirement to the test results that cover it.
///
/// Breadth-first over backlinks from `root`, up to `max_depth` hops (a sane
/// default is 4 — long enough for the ASPICE V, short enough to stay cheap).
/// Every reached artifact is returned once (nearest distance wins), annotated
/// with its latest test-result status if any. The result is sorted by
/// `(distance, artifact_id)` for stable rendering. `root` itself is not
/// included.
pub fn trace_test_results(
    root: &str,
    graph: &LinkGraph,
    results: &ResultStore,
    max_depth: usize,
) -> Vec<ResultTraceNode> {
    let mut seen: BTreeSet<String> = BTreeSet::new();
    seen.insert(root.to_string());
    let mut out: Vec<ResultTraceNode> = Vec::new();
    let mut queue: VecDeque<(String, usize)> = VecDeque::new();
    queue.push_back((root.to_string(), 0));

    while let Some((current, depth)) = queue.pop_front() {
        if depth >= max_depth {
            continue;
        }
        // Deterministic order: sort backlinks by (source, link_type).
        let mut backlinks: Vec<&crate::links::Backlink> =
            graph.backlinks_to(&current).iter().collect();
        backlinks.sort_by(|a, b| a.source.cmp(&b.source).then(a.link_type.cmp(&b.link_type)));
        for bl in backlinks {
            if !seen.insert(bl.source.clone()) {
                continue;
            }
            let status = results
                .latest_for(&bl.source)
                .map(|(_, r)| r.status.clone());
            out.push(ResultTraceNode {
                artifact_id: bl.source.clone(),
                via_target: current.clone(),
                link_type: bl.link_type.clone(),
                distance: depth + 1,
                status,
            });
            queue.push_back((bl.source.clone(), depth + 1));
        }
    }

    out.sort_by(|a, b| {
        a.distance
            .cmp(&b.distance)
            .then(a.artifact_id.cmp(&b.artifact_id))
    });
    out
}

/// Roll up a trace into a one-line verdict for the root requirement: does it
/// have any test evidence, and did all recorded results pass?
#[derive(Debug, Clone, Copy, PartialEq, Eq, serde::Serialize)]
#[serde(rename_all = "kebab-case")]
pub enum TraceVerdict {
    /// At least one reached verification recorded a result, and every recorded
    /// result passed.
    Passing,
    /// At least one reached verification recorded a failing/erroring result.
    Failing,
    /// No reached artifact has any recorded test result.
    NoEvidence,
}

/// Summarise a trace (as produced by [`trace_test_results`]).
pub fn verdict(nodes: &[ResultTraceNode]) -> TraceVerdict {
    let mut any = false;
    let mut all_pass = true;
    for n in nodes {
        match n.status.as_ref() {
            Some(TestStatus::Pass) => any = true,
            Some(_) => {
                any = true;
                all_pass = false;
            }
            None => {}
        }
    }
    match (any, all_pass) {
        (false, _) => TraceVerdict::NoEvidence,
        (true, true) => TraceVerdict::Passing,
        (true, false) => TraceVerdict::Failing,
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::model::{Artifact, Link};
    use crate::results::{RunMetadata, TestResult, TestRun};
    use crate::schema::Schema;
    use crate::store::Store;

    fn artifact(id: &str, ty: &str, links: &[(&str, &str)]) -> Artifact {
        Artifact {
            id: id.to_string(),
            artifact_type: ty.to_string(),
            links: links.iter().map(|(lt, tgt)| Link::new(*lt, *tgt)).collect(),
            ..Default::default()
        }
    }

    fn run(results: &[(&str, TestStatus)]) -> TestRun {
        TestRun {
            run: RunMetadata {
                id: "r1".into(),
                timestamp: "2026-07-01".into(),
                source: None,
                environment: None,
                commit: None,
            },
            results: results
                .iter()
                .map(|(id, st)| TestResult {
                    artifact: id.to_string(),
                    status: st.clone(),
                    duration: None,
                    message: None,
                })
                .collect(),
            source_file: None,
        }
    }

    #[test]
    fn traces_multi_hop_aspice_chain_to_results() {
        // sw-req <- (satisfies) sw-detail-design <- (verifies) unit-verification
        let mut store = Store::new();
        store.insert(artifact("REQ-1", "sw-req", &[])).unwrap();
        store
            .insert(artifact(
                "DD-1",
                "sw-detail-design",
                &[("satisfies", "REQ-1")],
            ))
            .unwrap();
        store
            .insert(artifact(
                "UV-1",
                "unit-verification",
                &[("verifies", "DD-1")],
            ))
            .unwrap();
        let graph = LinkGraph::build(&store, &Schema::merge(&[]));

        let mut results = ResultStore::new();
        results.insert(run(&[("UV-1", TestStatus::Pass)]));

        let trace = trace_test_results("REQ-1", &graph, &results, 4);
        // Both DD-1 (depth 1, no result) and UV-1 (depth 2, pass) are reached.
        assert_eq!(trace.len(), 2);
        assert_eq!(trace[0].artifact_id, "DD-1");
        assert_eq!(trace[0].distance, 1);
        assert!(!trace[0].has_result());
        assert_eq!(trace[1].artifact_id, "UV-1");
        assert_eq!(trace[1].distance, 2);
        assert_eq!(trace[1].status, Some(TestStatus::Pass));
        assert_eq!(verdict(&trace), TraceVerdict::Passing);
    }

    #[test]
    fn a_failing_result_makes_the_verdict_failing() {
        let mut store = Store::new();
        store.insert(artifact("REQ-1", "requirement", &[])).unwrap();
        store
            .insert(artifact("T-1", "test", &[("verifies", "REQ-1")]))
            .unwrap();
        store
            .insert(artifact("T-2", "test", &[("verifies", "REQ-1")]))
            .unwrap();
        let graph = LinkGraph::build(&store, &Schema::merge(&[]));
        let mut results = ResultStore::new();
        results.insert(run(&[("T-1", TestStatus::Pass), ("T-2", TestStatus::Fail)]));

        let trace = trace_test_results("REQ-1", &graph, &results, 4);
        assert_eq!(trace.len(), 2);
        assert_eq!(verdict(&trace), TraceVerdict::Failing);
    }

    #[test]
    fn no_backlinks_or_no_results_is_no_evidence() {
        let mut store = Store::new();
        store.insert(artifact("REQ-1", "requirement", &[])).unwrap();
        store
            .insert(artifact(
                "DD-1",
                "design-decision",
                &[("satisfies", "REQ-1")],
            ))
            .unwrap();
        let graph = LinkGraph::build(&store, &Schema::merge(&[]));
        let results = ResultStore::new();

        let trace = trace_test_results("REQ-1", &graph, &results, 4);
        assert_eq!(trace.len(), 1); // DD-1 reached, but no result
        assert_eq!(verdict(&trace), TraceVerdict::NoEvidence);
    }

    #[test]
    fn depth_limit_is_respected() {
        let mut store = Store::new();
        store.insert(artifact("REQ-1", "requirement", &[])).unwrap();
        store
            .insert(artifact("A", "x", &[("satisfies", "REQ-1")]))
            .unwrap();
        store
            .insert(artifact("B", "x", &[("satisfies", "A")]))
            .unwrap();
        let graph = LinkGraph::build(&store, &Schema::merge(&[]));
        let results = ResultStore::new();

        let trace = trace_test_results("REQ-1", &graph, &results, 1);
        assert_eq!(trace.len(), 1); // only A (depth 1); B is at depth 2
        assert_eq!(trace[0].artifact_id, "A");
    }
}
