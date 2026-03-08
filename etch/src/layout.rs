//! Sugiyama-style hierarchical (layered) DAG layout.
//!
//! The algorithm has four phases:
//!
//! 1. **Rank assignment** — topological longest-path, with optional forced
//!    ranks per node type.
//! 2. **Ordering within ranks** — barycenter heuristic (4 sweeps) to minimise
//!    edge crossings.
//! 3. **Coordinate assignment** — simple placement on a grid with centering.
//! 4. **Edge routing** — polyline waypoints through intermediate ranks.

use std::collections::HashMap;

use petgraph::Direction;
use petgraph::graph::{EdgeIndex, Graph, NodeIndex};
use petgraph::visit::EdgeRef;

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

/// Direction of the rank axis.
#[derive(Debug, Clone, Copy, Default, PartialEq, Eq)]
pub enum RankDirection {
    /// Ranks grow downward (root at top).
    #[default]
    TopToBottom,
    /// Ranks grow rightward (root at left).
    LeftToRight,
}

/// Options that control the layout algorithm.
#[derive(Debug, Clone)]
pub struct LayoutOptions {
    /// Width of every node box (px).
    pub node_width: f64,
    /// Height of every node box (px).
    pub node_height: f64,
    /// Vertical distance between rank baselines.
    pub rank_separation: f64,
    /// Horizontal distance between adjacent nodes in the same rank.
    pub node_separation: f64,
    /// Overall flow direction.
    pub rank_direction: RankDirection,
    /// Force nodes whose `node_type` matches a key to a specific rank.
    /// Ranks are 0-based; lower ranks are rendered closer to the root.
    pub type_ranks: HashMap<String, usize>,
}

impl Default for LayoutOptions {
    fn default() -> Self {
        Self {
            node_width: 180.0,
            node_height: 50.0,
            rank_separation: 80.0,
            node_separation: 40.0,
            rank_direction: RankDirection::default(),
            type_ranks: HashMap::new(),
        }
    }
}

/// Display-level information about a node supplied by the caller.
#[derive(Debug, Clone)]
pub struct NodeInfo {
    /// Unique identifier (used in SVG `data-id` and edge lookup).
    pub id: String,
    /// Primary label rendered inside the node.
    pub label: String,
    /// Logical type — used for coloring / grouping.
    pub node_type: String,
    /// Optional secondary text (e.g. a title below the ID).
    pub sublabel: Option<String>,
}

/// Display-level information about an edge supplied by the caller.
#[derive(Debug, Clone)]
pub struct EdgeInfo {
    /// Label rendered along the edge path.
    pub label: String,
}

/// A positioned node produced by the layout algorithm.
#[derive(Debug, Clone)]
pub struct LayoutNode {
    /// Unique identifier (mirrors [`NodeInfo::id`]).
    pub id: String,
    /// X coordinate of the top-left corner.
    pub x: f64,
    /// Y coordinate of the top-left corner.
    pub y: f64,
    /// Width of the node box.
    pub width: f64,
    /// Height of the node box.
    pub height: f64,
    /// Assigned rank (layer index).
    pub rank: usize,
    /// Primary label.
    pub label: String,
    /// Node type (for theming).
    pub node_type: String,
    /// Optional secondary label.
    pub sublabel: Option<String>,
}

/// A routed edge produced by the layout algorithm.
#[derive(Debug, Clone)]
pub struct LayoutEdge {
    /// Source node ID.
    pub source_id: String,
    /// Target node ID.
    pub target_id: String,
    /// Edge label.
    pub label: String,
    /// Ordered polyline waypoints `(x, y)`.
    pub points: Vec<(f64, f64)>,
}

/// Complete layout result.
#[derive(Debug, Clone)]
pub struct GraphLayout {
    /// Positioned nodes.
    pub nodes: Vec<LayoutNode>,
    /// Routed edges.
    pub edges: Vec<LayoutEdge>,
    /// Total width of the bounding box.
    pub width: f64,
    /// Total height of the bounding box.
    pub height: f64,
}

// ---------------------------------------------------------------------------
// Public entry point
// ---------------------------------------------------------------------------

/// Compute a hierarchical layout for the given directed graph.
///
/// `node_info` and `edge_info` are closures that translate caller-owned
/// node/edge weights into the display-level [`NodeInfo`] / [`EdgeInfo`]
/// structs.  This keeps the crate completely domain-agnostic.
///
/// The function handles cycles gracefully — edges participating in cycles
/// are still routed, but their source nodes are placed according to the
/// topological order of the underlying DAG (after ignoring back-edges for
/// rank assignment).
pub fn layout<N, E>(
    graph: &Graph<N, E>,
    node_info: &impl Fn(NodeIndex, &N) -> NodeInfo,
    edge_info: &impl Fn(EdgeIndex, &E) -> EdgeInfo,
    options: &LayoutOptions,
) -> GraphLayout {
    if graph.node_count() == 0 {
        return GraphLayout {
            nodes: Vec::new(),
            edges: Vec::new(),
            width: 0.0,
            height: 0.0,
        };
    }

    // Collect node info up-front so we can reference it throughout.
    let infos: HashMap<NodeIndex, NodeInfo> = graph
        .node_indices()
        .map(|idx| (idx, node_info(idx, &graph[idx])))
        .collect();

    // Build NodeIndex → id map for edge routing.
    let idx_to_id: HashMap<NodeIndex, String> = infos
        .iter()
        .map(|(&idx, info)| (idx, info.id.clone()))
        .collect();

    // Phase 1 — rank assignment.
    let ranks = assign_ranks(graph, &infos, options);

    // Phase 2 — ordering within ranks (barycenter heuristic).
    let mut rank_lists = build_rank_lists(graph, &ranks);
    for _ in 0..4 {
        sweep_down(graph, &mut rank_lists, &ranks);
        sweep_up(graph, &mut rank_lists, &ranks);
    }

    // Phase 3 — coordinate assignment.
    let (layout_nodes, total_w, total_h) = assign_coordinates(&rank_lists, &infos, &ranks, options);

    // Phase 4 — edge routing.
    let layout_edges = route_edges(graph, edge_info, &layout_nodes, &idx_to_id, options);

    GraphLayout {
        nodes: layout_nodes,
        edges: layout_edges,
        width: total_w,
        height: total_h,
    }
}

// ---------------------------------------------------------------------------
// Phase 1: Rank assignment (longest-path from sources)
// ---------------------------------------------------------------------------

fn assign_ranks<N, E>(
    graph: &Graph<N, E>,
    infos: &HashMap<NodeIndex, NodeInfo>,
    options: &LayoutOptions,
) -> HashMap<NodeIndex, usize> {
    let mut ranks: HashMap<NodeIndex, usize> = HashMap::new();

    // Compute in-degrees for a Kahn-style topological traversal that
    // tolerates cycles (cycle members are appended after the DAG portion).
    let mut in_deg: HashMap<NodeIndex, usize> = HashMap::new();
    for idx in graph.node_indices() {
        in_deg.insert(idx, 0);
    }
    for edge in graph.edge_references() {
        *in_deg.entry(edge.target()).or_insert(0) += 1;
    }

    let mut queue: Vec<NodeIndex> = in_deg
        .iter()
        .filter(|&(_, deg)| *deg == 0)
        .map(|(&idx, _)| idx)
        .collect();

    // Stable sort for deterministic output.
    queue.sort_by(|a, b| infos[a].id.cmp(&infos[b].id));

    let mut topo_order: Vec<NodeIndex> = Vec::with_capacity(graph.node_count());
    let mut head = 0usize;

    while head < queue.len() {
        let node = queue[head];
        head += 1;
        topo_order.push(node);

        let mut successors: Vec<NodeIndex> = graph
            .neighbors_directed(node, Direction::Outgoing)
            .collect();
        successors.sort_by(|a, b| infos[a].id.cmp(&infos[b].id));

        for succ in successors {
            let deg = in_deg.get_mut(&succ).unwrap();
            *deg -= 1;
            if *deg == 0 {
                queue.push(succ);
            }
        }
    }

    // Any remaining nodes are in cycles — append them.
    if topo_order.len() < graph.node_count() {
        for idx in graph.node_indices() {
            if !topo_order.contains(&idx) {
                topo_order.push(idx);
            }
        }
    }

    // Longest-path rank assignment (forward pass).
    for &idx in &topo_order {
        let parent_rank: Option<usize> = graph
            .neighbors_directed(idx, Direction::Incoming)
            .filter_map(|pred| ranks.get(&pred).copied())
            .max();
        let rank = match parent_rank {
            Some(r) => r + 1,
            None => 0,
        };
        ranks.insert(idx, rank);
    }

    // Apply forced type_ranks overrides.
    if !options.type_ranks.is_empty() {
        for (&idx, info) in infos {
            if let Some(&forced) = options.type_ranks.get(&info.node_type) {
                ranks.insert(idx, forced);
            }
        }
    }

    ranks
}

// ---------------------------------------------------------------------------
// Phase 2: Ordering within ranks (barycenter heuristic)
// ---------------------------------------------------------------------------

/// Build a `Vec<Vec<NodeIndex>>`, one inner `Vec` per rank, ordered by rank.
fn build_rank_lists<N, E>(
    _graph: &Graph<N, E>,
    ranks: &HashMap<NodeIndex, usize>,
) -> Vec<Vec<NodeIndex>> {
    let max_rank = ranks.values().copied().max().unwrap_or(0);
    let mut lists: Vec<Vec<NodeIndex>> = vec![Vec::new(); max_rank + 1];
    for (&idx, &rank) in ranks {
        lists[rank].push(idx);
    }
    // Initial deterministic order by node index.
    for list in &mut lists {
        list.sort_by_key(|idx| idx.index());
    }
    lists
}

/// One downward sweep: for each rank (top to bottom), reorder nodes by the
/// average position of their predecessors in the rank above.
fn sweep_down<N, E>(
    graph: &Graph<N, E>,
    rank_lists: &mut [Vec<NodeIndex>],
    ranks: &HashMap<NodeIndex, usize>,
) {
    let num_ranks = rank_lists.len();
    for r in 1..num_ranks {
        let positions_above: HashMap<NodeIndex, usize> = rank_lists[r - 1]
            .iter()
            .enumerate()
            .map(|(pos, &idx)| (idx, pos))
            .collect();

        let mut barycenters: Vec<(NodeIndex, f64)> = rank_lists[r]
            .iter()
            .map(|&idx| {
                let preds: Vec<usize> = graph
                    .neighbors_directed(idx, Direction::Incoming)
                    .filter(|pred| ranks.get(pred).copied() == Some(r - 1))
                    .filter_map(|pred| positions_above.get(&pred).copied())
                    .collect();
                let bc = if preds.is_empty() {
                    f64::MAX
                } else {
                    preds.iter().sum::<usize>() as f64 / preds.len() as f64
                };
                (idx, bc)
            })
            .collect();

        barycenters.sort_by(|a, b| a.1.partial_cmp(&b.1).unwrap_or(std::cmp::Ordering::Equal));
        rank_lists[r] = barycenters.into_iter().map(|(idx, _)| idx).collect();
    }
}

/// One upward sweep: for each rank (bottom to top), reorder nodes by the
/// average position of their successors in the rank below.
fn sweep_up<N, E>(
    graph: &Graph<N, E>,
    rank_lists: &mut [Vec<NodeIndex>],
    ranks: &HashMap<NodeIndex, usize>,
) {
    let num_ranks = rank_lists.len();
    if num_ranks < 2 {
        return;
    }
    for r in (0..num_ranks - 1).rev() {
        let positions_below: HashMap<NodeIndex, usize> = rank_lists[r + 1]
            .iter()
            .enumerate()
            .map(|(pos, &idx)| (idx, pos))
            .collect();

        let mut barycenters: Vec<(NodeIndex, f64)> = rank_lists[r]
            .iter()
            .map(|&idx| {
                let succs: Vec<usize> = graph
                    .neighbors_directed(idx, Direction::Outgoing)
                    .filter(|succ| ranks.get(succ).copied() == Some(r + 1))
                    .filter_map(|succ| positions_below.get(&succ).copied())
                    .collect();
                let bc = if succs.is_empty() {
                    f64::MAX
                } else {
                    succs.iter().sum::<usize>() as f64 / succs.len() as f64
                };
                (idx, bc)
            })
            .collect();

        barycenters.sort_by(|a, b| a.1.partial_cmp(&b.1).unwrap_or(std::cmp::Ordering::Equal));
        rank_lists[r] = barycenters.into_iter().map(|(idx, _)| idx).collect();
    }
}

// ---------------------------------------------------------------------------
// Phase 3: Coordinate assignment
// ---------------------------------------------------------------------------

fn assign_coordinates(
    rank_lists: &[Vec<NodeIndex>],
    infos: &HashMap<NodeIndex, NodeInfo>,
    ranks: &HashMap<NodeIndex, usize>,
    options: &LayoutOptions,
) -> (Vec<LayoutNode>, f64, f64) {
    let mut nodes: Vec<LayoutNode> = Vec::new();
    let mut max_x: f64 = 0.0;
    let mut max_y: f64 = 0.0;

    // Compute the maximum rank width so we can center narrower ranks.
    let rank_widths: Vec<f64> = rank_lists
        .iter()
        .map(|list| {
            if list.is_empty() {
                0.0
            } else {
                list.len() as f64 * options.node_width
                    + (list.len() as f64 - 1.0) * options.node_separation
            }
        })
        .collect();

    let global_max_width = rank_widths.iter().cloned().fold(0.0f64, f64::max);

    for (rank, list) in rank_lists.iter().enumerate() {
        let rank_width = rank_widths[rank];
        let x_offset = (global_max_width - rank_width) / 2.0;

        for (pos, &idx) in list.iter().enumerate() {
            let info = &infos[&idx];
            let (x, y) = match options.rank_direction {
                RankDirection::TopToBottom => {
                    let x = x_offset + pos as f64 * (options.node_width + options.node_separation);
                    let y = rank as f64 * (options.node_height + options.rank_separation);
                    (x, y)
                }
                RankDirection::LeftToRight => {
                    let x = rank as f64 * (options.node_width + options.rank_separation);
                    let y = x_offset + pos as f64 * (options.node_height + options.node_separation);
                    (x, y)
                }
            };

            if x + options.node_width > max_x {
                max_x = x + options.node_width;
            }
            if y + options.node_height > max_y {
                max_y = y + options.node_height;
            }

            nodes.push(LayoutNode {
                id: info.id.clone(),
                x,
                y,
                width: options.node_width,
                height: options.node_height,
                rank: *ranks.get(&idx).unwrap_or(&rank),
                label: info.label.clone(),
                node_type: info.node_type.clone(),
                sublabel: info.sublabel.clone(),
            });
        }
    }

    (nodes, max_x, max_y)
}

// ---------------------------------------------------------------------------
// Phase 4: Edge routing
// ---------------------------------------------------------------------------

fn route_edges<N, E>(
    graph: &Graph<N, E>,
    edge_info: &impl Fn(EdgeIndex, &E) -> EdgeInfo,
    layout_nodes: &[LayoutNode],
    idx_to_id: &HashMap<NodeIndex, String>,
    options: &LayoutOptions,
) -> Vec<LayoutEdge> {
    let node_pos: HashMap<&str, &LayoutNode> =
        layout_nodes.iter().map(|n| (n.id.as_str(), n)).collect();

    let mut edges: Vec<LayoutEdge> = Vec::new();

    for edge_ref in graph.edge_references() {
        let src_idx = edge_ref.source();
        let tgt_idx = edge_ref.target();
        let eidx = edge_ref.id();
        let info = edge_info(eidx, edge_ref.weight());

        let src_id = match idx_to_id.get(&src_idx) {
            Some(id) => id,
            None => continue,
        };
        let tgt_id = match idx_to_id.get(&tgt_idx) {
            Some(id) => id,
            None => continue,
        };

        let src_node = match node_pos.get(src_id.as_str()) {
            Some(n) => n,
            None => continue,
        };
        let tgt_node = match node_pos.get(tgt_id.as_str()) {
            Some(n) => n,
            None => continue,
        };

        let points = compute_waypoints(src_node, tgt_node, options);

        edges.push(LayoutEdge {
            source_id: src_id.clone(),
            target_id: tgt_id.clone(),
            label: info.label,
            points,
        });
    }

    edges
}

/// Compute polyline waypoints between two positioned nodes.
///
/// For adjacent ranks the path is source-bottom-center to target-top-center.
/// For edges spanning multiple ranks, intermediate waypoints are inserted at
/// each intervening rank boundary.
fn compute_waypoints(
    src: &LayoutNode,
    tgt: &LayoutNode,
    _options: &LayoutOptions,
) -> Vec<(f64, f64)> {
    let src_cx = src.x + src.width / 2.0;
    let tgt_cx = tgt.x + tgt.width / 2.0;

    let (src_attach_y, tgt_attach_y) = if src.rank <= tgt.rank {
        (src.y + src.height, tgt.y) // normal: bottom of source to top of target
    } else {
        (src.y, tgt.y + tgt.height) // back-edge: top of source to bottom of target
    };

    let mut points = vec![(src_cx, src_attach_y)];

    // Insert intermediate waypoints for long edges (spanning > 1 rank).
    let rank_diff = tgt.rank.abs_diff(src.rank);

    if rank_diff > 1 {
        for i in 1..rank_diff {
            let frac = i as f64 / rank_diff as f64;
            let mid_x = src_cx + (tgt_cx - src_cx) * frac;
            let mid_y = src_attach_y + (tgt_attach_y - src_attach_y) * frac;
            points.push((mid_x, mid_y));
        }
    }

    points.push((tgt_cx, tgt_attach_y));
    points
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

#[cfg(test)]
mod tests {
    use super::*;
    use petgraph::Graph;

    fn simple_node_info(_idx: NodeIndex, label: &&str) -> NodeInfo {
        NodeInfo {
            id: label.to_string(),
            label: label.to_string(),
            node_type: "default".into(),
            sublabel: None,
        }
    }

    fn simple_edge_info(_idx: EdgeIndex, label: &&str) -> EdgeInfo {
        EdgeInfo {
            label: label.to_string(),
        }
    }

    #[test]
    fn empty_graph() {
        let g: Graph<&str, &str> = Graph::new();
        let result = layout(
            &g,
            &simple_node_info,
            &simple_edge_info,
            &LayoutOptions::default(),
        );
        assert!(result.nodes.is_empty());
        assert!(result.edges.is_empty());
        assert_eq!(result.width, 0.0);
        assert_eq!(result.height, 0.0);
    }

    #[test]
    fn single_node() {
        let mut g = Graph::new();
        g.add_node("A");
        let result = layout(
            &g,
            &simple_node_info,
            &simple_edge_info,
            &LayoutOptions::default(),
        );
        assert_eq!(result.nodes.len(), 1);
        assert_eq!(result.nodes[0].id, "A");
        assert_eq!(result.nodes[0].rank, 0);
    }

    #[test]
    fn chain_a_b_c() {
        let mut g = Graph::new();
        let a = g.add_node("A");
        let b = g.add_node("B");
        let c = g.add_node("C");
        g.add_edge(a, b, "ab");
        g.add_edge(b, c, "bc");

        let result = layout(
            &g,
            &simple_node_info,
            &simple_edge_info,
            &LayoutOptions::default(),
        );
        assert_eq!(result.nodes.len(), 3);
        assert_eq!(result.edges.len(), 2);

        let node_a = result.nodes.iter().find(|n| n.id == "A").unwrap();
        let node_b = result.nodes.iter().find(|n| n.id == "B").unwrap();
        let node_c = result.nodes.iter().find(|n| n.id == "C").unwrap();

        assert_eq!(node_a.rank, 0);
        assert_eq!(node_b.rank, 1);
        assert_eq!(node_c.rank, 2);

        // Ranks increase downward.
        assert!(node_a.y < node_b.y);
        assert!(node_b.y < node_c.y);
    }

    #[test]
    fn diamond_graph() {
        let mut g = Graph::new();
        let a = g.add_node("A");
        let b = g.add_node("B");
        let c = g.add_node("C");
        let d = g.add_node("D");
        g.add_edge(a, b, "ab");
        g.add_edge(a, c, "ac");
        g.add_edge(b, d, "bd");
        g.add_edge(c, d, "cd");

        let result = layout(
            &g,
            &simple_node_info,
            &simple_edge_info,
            &LayoutOptions::default(),
        );
        assert_eq!(result.nodes.len(), 4);
        assert_eq!(result.edges.len(), 4);

        let node_a = result.nodes.iter().find(|n| n.id == "A").unwrap();
        let node_b = result.nodes.iter().find(|n| n.id == "B").unwrap();
        let node_c = result.nodes.iter().find(|n| n.id == "C").unwrap();
        let node_d = result.nodes.iter().find(|n| n.id == "D").unwrap();

        assert_eq!(node_a.rank, 0);
        assert_eq!(node_b.rank, 1);
        assert_eq!(node_c.rank, 1);
        assert_eq!(node_d.rank, 2);

        // B and C are in the same rank but at different x positions.
        assert!((node_b.y - node_c.y).abs() < f64::EPSILON);
        assert!((node_b.x - node_c.x).abs() > 1.0);
    }

    #[test]
    fn type_ranks_override() {
        let mut g = Graph::new();
        let a = g.add_node("A");
        let b = g.add_node("B");
        g.add_edge(a, b, "link");

        let mut opts = LayoutOptions::default();
        opts.type_ranks.insert("default".into(), 5);

        let result = layout(&g, &simple_node_info, &simple_edge_info, &opts);
        for node in &result.nodes {
            assert_eq!(node.rank, 5, "node {} should be forced to rank 5", node.id);
        }
    }

    #[test]
    fn cycle_handling() {
        let mut g = Graph::new();
        let a = g.add_node("A");
        let b = g.add_node("B");
        let c = g.add_node("C");
        g.add_edge(a, b, "ab");
        g.add_edge(b, c, "bc");
        g.add_edge(c, a, "ca"); // creates cycle

        // Should not panic.
        let result = layout(
            &g,
            &simple_node_info,
            &simple_edge_info,
            &LayoutOptions::default(),
        );
        assert_eq!(result.nodes.len(), 3);
        assert_eq!(result.edges.len(), 3);
    }

    #[test]
    fn left_to_right_direction() {
        let mut g = Graph::new();
        let a = g.add_node("A");
        let b = g.add_node("B");
        g.add_edge(a, b, "link");

        let opts = LayoutOptions {
            rank_direction: RankDirection::LeftToRight,
            ..Default::default()
        };
        let result = layout(&g, &simple_node_info, &simple_edge_info, &opts);
        let node_a = result.nodes.iter().find(|n| n.id == "A").unwrap();
        let node_b = result.nodes.iter().find(|n| n.id == "B").unwrap();

        // In left-to-right layout, rank increases along x axis.
        assert!(node_a.x < node_b.x);
    }

    #[test]
    fn multi_rank_edge_waypoints() {
        let mut g = Graph::new();
        let a = g.add_node("A");
        let b = g.add_node("B");
        let c = g.add_node("C");
        g.add_edge(a, b, "ab");
        g.add_edge(b, c, "bc");
        g.add_edge(a, c, "ac"); // spans 2 ranks

        let result = layout(
            &g,
            &simple_node_info,
            &simple_edge_info,
            &LayoutOptions::default(),
        );

        let long_edge = result
            .edges
            .iter()
            .find(|e| e.source_id == "A" && e.target_id == "C")
            .expect("should find A->C edge");

        // A->C spans ranks 0..2, so should have 3 waypoints (start, mid, end).
        assert_eq!(long_edge.points.len(), 3);
    }
}
