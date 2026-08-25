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

/// One node of the trace rendered as a tree rather than a flat list.
///
/// [`trace_test_results`] already returns a tree — it walks breadth-first with a
/// `seen` set, so every reached artifact has exactly one `via_target` — but it
/// returns that tree flattened, which is why the dashboard rendered deep ASPICE
/// chains as an undifferentiated wall of hops.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct TraceTreeNode<'a> {
    /// The flat node this tree entry wraps.
    pub node: &'a ResultTraceNode,
    /// Nodes one hop further from the requirement.
    pub children: Vec<TraceTreeNode<'a>>,
}

impl TraceTreeNode<'_> {
    /// Total nodes in this subtree, including itself.
    pub fn len(&self) -> usize {
        1 + self.children.iter().map(TraceTreeNode::len).sum::<usize>()
    }

    /// Always false — a `TraceTreeNode` contains at least itself. Present
    /// because clippy asks for it alongside `len`.
    pub fn is_empty(&self) -> bool {
        false
    }
}

/// Rebuild the parent/child structure that [`trace_test_results`] flattens.
///
/// Nodes are attached to the entry whose `artifact_id` equals their
/// `via_target`; those pointing at `root` become top-level.
///
/// A node whose `via_target` names something not in `nodes` and is not `root`
/// is **kept at top level, not dropped**. Silently discarding it would make the
/// rendered tree smaller than the trace it claims to show — a view that looks
/// complete while omitting hops is exactly the failure this trace exists to
/// prevent. [`tree_preserves_every_node`] pins that.
pub fn as_tree<'a>(root: &str, nodes: &'a [ResultTraceNode]) -> Vec<TraceTreeNode<'a>> {
    use std::collections::BTreeMap;

    // child via_target -> the nodes hanging off it, input order preserved.
    let mut by_parent: BTreeMap<&str, Vec<&'a ResultTraceNode>> = BTreeMap::new();
    for n in nodes {
        by_parent.entry(n.via_target.as_str()).or_default().push(n);
    }
    fn build<'a>(
        parent: &str,
        by_parent: &BTreeMap<&str, Vec<&'a ResultTraceNode>>,
        on_path: &mut Vec<String>,
    ) -> Vec<TraceTreeNode<'a>> {
        by_parent
            .get(parent)
            .map(|kids| {
                kids.iter()
                    .filter_map(|n| {
                        let id = n.artifact_id.as_str();
                        // `trace_test_results` cannot produce a cycle — its
                        // `seen` set makes the walk a tree — but a hand-built
                        // or future input could, and unguarded recursion would
                        // turn that into a stack overflow.
                        //
                        // This tracks the CURRENT PATH rather than capping
                        // depth. An earlier version bailed out past depth 64,
                        // which silently dropped the entire subtree — the exact
                        // node loss `tree_preserves_every_node` forbids, and
                        // invisible because nothing exercised the guard. The
                        // rivet-core mutation gate is what surfaced it: the
                        // comparison survived mutation, meaning no test
                        // distinguished `>` from `==`. A legitimately deep
                        // chain must render in full; only a genuine revisit is
                        // skipped.
                        if on_path.iter().any(|p| p == id) {
                            return None;
                        }
                        on_path.push(id.to_string());
                        let children = build(id, by_parent, on_path);
                        on_path.pop();
                        Some(TraceTreeNode { node: n, children })
                    })
                    .collect()
            })
            .unwrap_or_default()
    }

    fn collect_ids(nodes: &[TraceTreeNode<'_>], out: &mut std::collections::BTreeSet<String>) {
        for n in nodes {
            out.insert(n.node.artifact_id.clone());
            collect_ids(&n.children, out);
        }
    }

    let mut on_path: Vec<String> = vec![root.to_string()];
    let mut out = build(root, &by_parent, &mut on_path);

    // Nothing may be lost. Rather than special-casing orphans, sweep for any
    // input node absent from the tree and re-home it at top level. That covers
    // both a parent that was never reached and a group of nodes cycling among
    // themselves with no path from the root. Neither is reachable from
    // `trace_test_results`, and both would otherwise vanish silently — a
    // rendered tree smaller than the trace it claims to show.
    let mut rendered = std::collections::BTreeSet::new();
    collect_ids(&out, &mut rendered);
    for n in nodes {
        if rendered.contains(&n.artifact_id) {
            continue;
        }
        let mut path = vec![n.artifact_id.clone()];
        let subtree = TraceTreeNode {
            node: n,
            children: build(&n.artifact_id, &by_parent, &mut path),
        };
        collect_ids(std::slice::from_ref(&subtree), &mut rendered);
        out.push(subtree);
    }
    out
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
                    links: Vec::new(),
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

    fn node(id: &str, via: &str, dist: usize) -> ResultTraceNode {
        ResultTraceNode {
            artifact_id: id.into(),
            via_target: via.into(),
            link_type: "verifies".into(),
            distance: dist,
            status: None,
        }
    }

    /// REQ-274: the flat trace is already a tree; `as_tree` restores the shape
    /// so deep chains can render folded instead of as a wall of hops.
    ///
    /// rivet: verifies REQ-274
    #[test]
    fn tree_nests_a_deep_chain() {
        // REQ-1 <- DD-1 <- UT-1 : the ASPICE-style chain from the issue.
        let flat = vec![node("DD-1", "REQ-1", 1), node("UT-1", "DD-1", 2)];
        let tree = as_tree("REQ-1", &flat);
        assert_eq!(tree.len(), 1, "only DD-1 hangs off the requirement");
        assert_eq!(tree[0].node.artifact_id, "DD-1");
        assert_eq!(tree[0].children.len(), 1);
        assert_eq!(tree[0].children[0].node.artifact_id, "UT-1");
        assert!(tree[0].children[0].children.is_empty());
    }

    /// Siblings at the same depth stay siblings, and input order is preserved
    /// so the rendered tree matches the deterministic order the walk produced.
    ///
    /// rivet: verifies REQ-274
    #[test]
    fn tree_keeps_siblings_and_input_order() {
        let flat = vec![
            node("A", "REQ-1", 1),
            node("B", "REQ-1", 1),
            node("A-child", "A", 2),
        ];
        let tree = as_tree("REQ-1", &flat);
        let ids: Vec<&str> = tree.iter().map(|t| t.node.artifact_id.as_str()).collect();
        assert_eq!(ids, vec!["A", "B"]);
        assert_eq!(tree[0].children.len(), 1);
        assert!(tree[1].children.is_empty());
    }

    /// The load-bearing invariant: a rendered tree must show every hop the
    /// flat trace contains. A view that silently omits nodes is worse than a
    /// flat one, because it looks complete.
    ///
    /// Covers the orphan case too — a node whose parent was never reached must
    /// surface at top level rather than vanish.
    ///
    /// rivet: verifies REQ-274
    #[test]
    fn tree_preserves_every_node() {
        let cases: Vec<Vec<ResultTraceNode>> = vec![
            vec![],
            vec![node("A", "REQ-1", 1)],
            vec![node("A", "REQ-1", 1), node("B", "A", 2), node("C", "B", 3)],
            vec![
                node("A", "REQ-1", 1),
                node("B", "REQ-1", 1),
                node("C", "A", 2),
            ],
            // orphan: parent "GHOST" is not in the set and is not the root
            vec![node("A", "REQ-1", 1), node("ORPHAN", "GHOST", 2)],
        ];
        for flat in cases {
            let tree = as_tree("REQ-1", &flat);
            let total: usize = tree.iter().map(TraceTreeNode::len).sum();
            assert_eq!(
                total,
                flat.len(),
                "tree dropped nodes: {} in, {} out — input {:?}",
                flat.len(),
                total,
                flat.iter().map(|n| &n.artifact_id).collect::<Vec<_>>()
            );
        }
    }

    /// An empty trace yields an empty tree rather than a phantom root.
    ///
    /// rivet: verifies REQ-274
    #[test]
    fn tree_of_empty_trace_is_empty() {
        assert!(as_tree("REQ-1", &[]).is_empty());
    }

    /// The rivet-core mutation gate found the depth guard untested — the `>`
    /// comparison survived mutation to both `==` and `>=`, meaning no test
    /// distinguished them. Writing the test exposed a real defect: the guard
    /// bailed out past depth 64 and silently dropped the whole subtree, which
    /// is the node loss `tree_preserves_every_node` exists to forbid.
    ///
    /// A legitimately deep chain must render in full.
    ///
    /// rivet: verifies REQ-274
    #[test]
    fn a_very_deep_chain_keeps_every_node() {
        const DEPTH: usize = 200;
        let mut flat = vec![node("N0", "REQ-1", 1)];
        for i in 1..DEPTH {
            flat.push(node(&format!("N{i}"), &format!("N{}", i - 1), i + 1));
        }
        let tree = as_tree("REQ-1", &flat);
        let total: usize = tree.iter().map(TraceTreeNode::len).sum();
        assert_eq!(total, DEPTH, "a {DEPTH}-deep chain lost nodes");

        // and it is genuinely nested, not flattened into siblings
        assert_eq!(tree.len(), 1);
        let mut n = &tree[0];
        let mut walked = 1;
        while let Some(child) = n.children.first() {
            n = child;
            walked += 1;
        }
        assert_eq!(walked, DEPTH, "chain is not nested to full depth");
    }

    /// A cyclic input cannot come from `trace_test_results`, but it must
    /// terminate rather than recurse forever if it ever arrives — and its
    /// nodes must still surface rather than vanish.
    ///
    /// rivet: verifies REQ-274
    #[test]
    fn a_cycle_terminates_and_keeps_its_nodes() {
        let flat = vec![node("A", "B", 1), node("B", "A", 2)];
        let tree = as_tree("REQ-1", &flat);
        let total: usize = tree.iter().map(TraceTreeNode::len).sum();
        assert_eq!(
            total,
            flat.len(),
            "a cycle unreachable from the root must still surface both nodes"
        );
    }

    /// `is_empty` exists because clippy requires it alongside `len`; a node
    /// always contains at least itself. Pinned so it cannot silently become
    /// `true` and make a populated subtree read as empty — the mutation gate
    /// flagged exactly that substitution as surviving.
    ///
    /// rivet: verifies REQ-274
    #[test]
    fn a_tree_node_is_never_empty() {
        let flat = vec![node("A", "REQ-1", 1), node("B", "A", 2)];
        let tree = as_tree("REQ-1", &flat);
        assert!(!tree[0].is_empty());
        assert!(!tree[0].children[0].is_empty());
        assert_eq!(tree[0].len(), 2);
        assert_eq!(tree[0].children[0].len(), 1);
    }
}
