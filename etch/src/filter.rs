//! Graph filtering utilities.
//!
//! These helpers produce new [`petgraph::Graph`] instances by subsetting an
//! existing graph.  They are generic over node and edge weights and therefore
//! work with any domain model.

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

use std::collections::{HashMap, HashSet, VecDeque};

use petgraph::Direction;
use petgraph::graph::{Graph, NodeIndex};
use petgraph::visit::EdgeRef;

/// Extract a subgraph centred on `focus` within `depth` hops.
///
/// Both incoming and outgoing edges are followed.  The returned graph
/// preserves all edges whose **both** endpoints are within reach.
///
/// # Examples
///
/// ```
/// use petgraph::Graph;
/// use etch::filter::ego_subgraph;
///
/// let mut g = Graph::new();
/// let a = g.add_node("A");
/// let b = g.add_node("B");
/// let c = g.add_node("C");
/// let d = g.add_node("D");
/// g.add_edge(a, b, "ab");
/// g.add_edge(b, c, "bc");
/// g.add_edge(c, d, "cd");
///
/// let sub = ego_subgraph(&g, b, 1);
/// assert_eq!(sub.node_count(), 3); // A, B, C
/// assert_eq!(sub.edge_count(), 2); // ab, bc
/// ```
pub fn ego_subgraph<N: Clone, E: Clone>(
    graph: &Graph<N, E>,
    focus: NodeIndex,
    depth: usize,
) -> Graph<N, E> {
    // BFS in both directions from `focus`, up to `depth` hops.
    let mut visited: HashSet<NodeIndex> = HashSet::new();
    let mut queue: VecDeque<(NodeIndex, usize)> = VecDeque::new();

    visited.insert(focus);
    queue.push_back((focus, 0));

    while let Some((node, dist)) = queue.pop_front() {
        if dist >= depth {
            continue;
        }

        for dir in &[Direction::Outgoing, Direction::Incoming] {
            for neighbour in graph.neighbors_directed(node, *dir) {
                if visited.insert(neighbour) {
                    queue.push_back((neighbour, dist + 1));
                }
            }
        }
    }

    build_subgraph(graph, &visited)
}

/// Filter graph to only include nodes matching `predicate`.
///
/// Edges are retained when **both** endpoints satisfy the predicate.
///
/// # Examples
///
/// ```
/// use petgraph::Graph;
/// use etch::filter::filter_nodes;
///
/// let mut g = Graph::new();
/// let a = g.add_node("A");
/// let b = g.add_node("B");
/// let c = g.add_node("C");
/// g.add_edge(a, b, "ab");
/// g.add_edge(b, c, "bc");
///
/// let sub = filter_nodes(&g, |_idx, label| *label != "C");
/// assert_eq!(sub.node_count(), 2);
/// assert_eq!(sub.edge_count(), 1);
/// ```
pub fn filter_nodes<N: Clone, E: Clone>(
    graph: &Graph<N, E>,
    predicate: impl Fn(NodeIndex, &N) -> bool,
) -> Graph<N, E> {
    let keep: HashSet<NodeIndex> = graph
        .node_indices()
        .filter(|&idx| predicate(idx, &graph[idx]))
        .collect();

    build_subgraph(graph, &keep)
}

/// Internal helper: build a new graph containing only the nodes in `keep`
/// and edges whose both endpoints are in `keep`.
fn build_subgraph<N: Clone, E: Clone>(
    graph: &Graph<N, E>,
    keep: &HashSet<NodeIndex>,
) -> Graph<N, E> {
    let mut sub = Graph::new();
    let mut idx_map: HashMap<NodeIndex, NodeIndex> = HashMap::new();

    for &old_idx in keep {
        let new_idx = sub.add_node(graph[old_idx].clone());
        idx_map.insert(old_idx, new_idx);
    }

    for edge in graph.edge_references() {
        if let (Some(&new_src), Some(&new_tgt)) =
            (idx_map.get(&edge.source()), idx_map.get(&edge.target()))
        {
            sub.add_edge(new_src, new_tgt, edge.weight().clone());
        }
    }

    sub
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

#[cfg(test)]
mod tests {
    use super::*;
    use petgraph::Graph;

    #[test]
    fn ego_depth_zero() {
        let mut g = Graph::new();
        let a = g.add_node("A");
        let b = g.add_node("B");
        g.add_edge(a, b, "ab");

        let sub = ego_subgraph(&g, a, 0);
        assert_eq!(sub.node_count(), 1);
        assert_eq!(sub.edge_count(), 0);
    }

    #[test]
    fn ego_depth_one() {
        let mut g = Graph::new();
        let a = g.add_node("A");
        let b = g.add_node("B");
        let c = g.add_node("C");
        let d = g.add_node("D");
        g.add_edge(a, b, "ab");
        g.add_edge(b, c, "bc");
        g.add_edge(c, d, "cd");

        let sub = ego_subgraph(&g, b, 1);
        assert_eq!(sub.node_count(), 3); // A, B, C
        assert_eq!(sub.edge_count(), 2); // ab, bc
    }

    #[test]
    fn ego_depth_two() {
        let mut g = Graph::new();
        let a = g.add_node("A");
        let b = g.add_node("B");
        let c = g.add_node("C");
        let d = g.add_node("D");
        g.add_edge(a, b, "ab");
        g.add_edge(b, c, "bc");
        g.add_edge(c, d, "cd");

        let sub = ego_subgraph(&g, b, 2);
        assert_eq!(sub.node_count(), 4); // all nodes
        assert_eq!(sub.edge_count(), 3); // all edges
    }

    #[test]
    fn ego_follows_incoming_edges() {
        let mut g = Graph::new();
        let a = g.add_node("A");
        let b = g.add_node("B");
        let c = g.add_node("C");
        g.add_edge(a, b, "ab");
        g.add_edge(c, b, "cb");

        // B has incoming from A and C.
        let sub = ego_subgraph(&g, b, 1);
        assert_eq!(sub.node_count(), 3);
        assert_eq!(sub.edge_count(), 2);
    }

    #[test]
    fn filter_nodes_excludes_matching() {
        let mut g = Graph::new();
        let a = g.add_node("A");
        let b = g.add_node("B");
        let c = g.add_node("C");
        g.add_edge(a, b, "ab");
        g.add_edge(b, c, "bc");

        let sub = filter_nodes(&g, |_idx, label| *label != "C");
        assert_eq!(sub.node_count(), 2);
        assert_eq!(sub.edge_count(), 1); // only ab remains
    }

    #[test]
    fn filter_nodes_keep_all() {
        let mut g = Graph::new();
        let a = g.add_node("A");
        let b = g.add_node("B");
        g.add_edge(a, b, "ab");

        let sub = filter_nodes(&g, |_idx, _label| true);
        assert_eq!(sub.node_count(), 2);
        assert_eq!(sub.edge_count(), 1);
    }

    #[test]
    fn filter_nodes_keep_none() {
        let mut g = Graph::new();
        let a = g.add_node("A");
        let b = g.add_node("B");
        g.add_edge(a, b, "ab");

        let sub = filter_nodes(&g, |_idx, _label| false);
        assert_eq!(sub.node_count(), 0);
        assert_eq!(sub.edge_count(), 0);
    }

    #[test]
    fn filter_removes_cross_edges() {
        // If we remove B from A->B->C, both edges should be removed.
        let mut g = Graph::new();
        let a = g.add_node("A");
        let b = g.add_node("B");
        let c = g.add_node("C");
        g.add_edge(a, b, "ab");
        g.add_edge(b, c, "bc");

        let sub = filter_nodes(&g, |_idx, label| *label != "B");
        assert_eq!(sub.node_count(), 2); // A, C
        assert_eq!(sub.edge_count(), 0); // no edges survive
    }
}
