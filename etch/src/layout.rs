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
    /// Padding inside container nodes (px).
    pub container_padding: f64,
    /// Height of the container header (for the label) (px).
    pub container_header: f64,
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
            container_padding: 20.0,
            container_header: 30.0,
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
    /// Optional parent container ID.  When set, this node is placed
    /// *inside* the container whose [`NodeInfo::id`] matches.  The layout
    /// algorithm lays out each container's children independently and then
    /// sizes the container to fit its content.
    pub parent: Option<String>,
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
    /// `true` when this node is a container with children laid out inside.
    pub is_container: bool,
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

    // Check if this is a compound graph (any node has a parent).
    let has_compound = infos.values().any(|info| info.parent.is_some());

    if has_compound {
        return layout_compound(graph, &infos, edge_info, options);
    }

    // --- Flat layout (original algorithm) ---

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
    let (layout_nodes, total_w, total_h) =
        assign_coordinates(&rank_lists, &infos, &ranks, options, &HashMap::new());

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

/// Per-node size overrides for variable-size nodes (containers).
fn node_size(
    idx: NodeIndex,
    options: &LayoutOptions,
    size_overrides: &HashMap<NodeIndex, (f64, f64)>,
) -> (f64, f64) {
    size_overrides
        .get(&idx)
        .copied()
        .unwrap_or((options.node_width, options.node_height))
}

fn assign_coordinates(
    rank_lists: &[Vec<NodeIndex>],
    infos: &HashMap<NodeIndex, NodeInfo>,
    ranks: &HashMap<NodeIndex, usize>,
    options: &LayoutOptions,
    size_overrides: &HashMap<NodeIndex, (f64, f64)>,
) -> (Vec<LayoutNode>, f64, f64) {
    let mut nodes: Vec<LayoutNode> = Vec::new();
    let mut max_x: f64 = 0.0;
    let mut max_y: f64 = 0.0;

    // Compute per-rank width and height (max node height determines rank spacing).
    let rank_widths: Vec<f64> = rank_lists
        .iter()
        .map(|list| {
            if list.is_empty() {
                return 0.0;
            }
            let total_w: f64 = list
                .iter()
                .map(|&idx| node_size(idx, options, size_overrides).0)
                .sum();
            total_w + (list.len() as f64 - 1.0) * options.node_separation
        })
        .collect();

    let rank_heights: Vec<f64> = rank_lists
        .iter()
        .map(|list| {
            list.iter()
                .map(|&idx| node_size(idx, options, size_overrides).1)
                .fold(options.node_height, f64::max)
        })
        .collect();

    let global_max_width = rank_widths.iter().cloned().fold(0.0f64, f64::max);

    // Cumulative Y offset per rank (for variable-height ranks).
    let mut rank_y: Vec<f64> = Vec::with_capacity(rank_lists.len());
    let mut cum_y = 0.0;
    for (i, _) in rank_lists.iter().enumerate() {
        rank_y.push(cum_y);
        cum_y += rank_heights[i] + options.rank_separation;
    }

    for (rank, list) in rank_lists.iter().enumerate() {
        let rank_width = rank_widths[rank];
        let x_offset = (global_max_width - rank_width) / 2.0;

        let mut x_cursor = x_offset;
        for &idx in list {
            let info = &infos[&idx];
            let (nw, nh) = node_size(idx, options, size_overrides);
            let is_container = size_overrides.contains_key(&idx);

            let (x, y) = match options.rank_direction {
                RankDirection::TopToBottom => {
                    // Center node vertically within its rank row.
                    let y = rank_y[rank] + (rank_heights[rank] - nh) / 2.0;
                    (x_cursor, y)
                }
                RankDirection::LeftToRight => {
                    let x = rank_y[rank] + (rank_heights[rank] - nw) / 2.0;
                    (x, x_cursor)
                }
            };

            if x + nw > max_x {
                max_x = x + nw;
            }
            if y + nh > max_y {
                max_y = y + nh;
            }

            nodes.push(LayoutNode {
                id: info.id.clone(),
                x,
                y,
                width: nw,
                height: nh,
                rank: *ranks.get(&idx).unwrap_or(&rank),
                label: info.label.clone(),
                node_type: info.node_type.clone(),
                sublabel: info.sublabel.clone(),
                is_container,
            });

            x_cursor += nw + options.node_separation;
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
// Compound (nested/hierarchical) layout
// ---------------------------------------------------------------------------

/// Recursive bottom-up compound layout.
///
/// 1. Build containment tree from `NodeInfo::parent`.
/// 2. Bottom-up: lay out each container's children using Sugiyama, then size
///    the container to fit its children + padding + header.
/// 3. Lay out root-level nodes (some with variable sizes) using Sugiyama.
/// 4. Translate all children to absolute coordinates.
/// 5. Route edges globally.
fn layout_compound<N, E>(
    graph: &Graph<N, E>,
    infos: &HashMap<NodeIndex, NodeInfo>,
    edge_info: &impl Fn(EdgeIndex, &E) -> EdgeInfo,
    options: &LayoutOptions,
) -> GraphLayout {
    let id_to_idx: HashMap<&str, NodeIndex> = infos
        .iter()
        .map(|(&idx, info)| (info.id.as_str(), idx))
        .collect();

    // Build children map: parent_idx → [child_idx, ...]
    let mut children_of: HashMap<NodeIndex, Vec<NodeIndex>> = HashMap::new();
    let mut root_nodes: Vec<NodeIndex> = Vec::new();

    for (&idx, info) in infos {
        match &info.parent {
            Some(parent_id) => {
                if let Some(&parent_idx) = id_to_idx.get(parent_id.as_str()) {
                    children_of.entry(parent_idx).or_default().push(idx);
                } else {
                    root_nodes.push(idx); // parent not found, treat as root
                }
            }
            None => root_nodes.push(idx),
        }
    }

    root_nodes.sort_by(|a, b| infos[a].id.cmp(&infos[b].id));

    // Find all containers and determine depth (for bottom-up ordering).
    let containers: Vec<NodeIndex> = children_of.keys().copied().collect();
    let container_depths = compute_container_depths(&containers, infos, &id_to_idx);

    // Sort containers by depth (deepest first = bottom-up).
    let mut sorted_containers: Vec<NodeIndex> = containers.clone();
    sorted_containers.sort_by(|a, b| {
        container_depths
            .get(b)
            .cmp(&container_depths.get(a))
            .then_with(|| infos[a].id.cmp(&infos[b].id))
    });

    // Bottom-up: lay out each container's children, compute sizes.
    let mut container_sizes: HashMap<NodeIndex, (f64, f64)> = HashMap::new();
    let mut child_layouts: HashMap<NodeIndex, Vec<LayoutNode>> = HashMap::new();
    let pad = options.container_padding;
    let hdr = options.container_header;

    for &container_idx in &sorted_containers {
        let children = match children_of.get(&container_idx) {
            Some(c) => c,
            None => continue,
        };

        // Build sub-graph of just these children.
        let child_set: std::collections::HashSet<NodeIndex> = children.iter().copied().collect();
        let mut sub_graph: Graph<NodeIndex, ()> = Graph::new();
        let mut orig_to_sub: HashMap<NodeIndex, NodeIndex> = HashMap::new();

        for &child_idx in children {
            let sub_idx = sub_graph.add_node(child_idx);
            orig_to_sub.insert(child_idx, sub_idx);
        }

        // Add edges between children (skip edges to nodes outside this container).
        for edge in graph.edge_references() {
            let src = edge.source();
            let tgt = edge.target();
            if child_set.contains(&src) && child_set.contains(&tgt) {
                if let (Some(&s), Some(&t)) = (orig_to_sub.get(&src), orig_to_sub.get(&tgt)) {
                    sub_graph.add_edge(s, t, ());
                }
            }
        }

        // Build infos for sub-graph nodes (map sub_idx → original info).
        let sub_infos: HashMap<NodeIndex, NodeInfo> = sub_graph
            .node_indices()
            .map(|sub_idx| {
                let orig_idx = sub_graph[sub_idx];
                (sub_idx, infos[&orig_idx].clone())
            })
            .collect();

        // Sub-nodes that are themselves containers get their computed sizes.
        let mut sub_sizes: HashMap<NodeIndex, (f64, f64)> = HashMap::new();
        for &sub_idx in sub_infos.keys() {
            let orig_idx = sub_graph[sub_idx];
            if let Some(&size) = container_sizes.get(&orig_idx) {
                sub_sizes.insert(sub_idx, size);
            }
        }

        // Run flat layout on the sub-graph.
        let sub_ranks = assign_ranks(&sub_graph, &sub_infos, options);
        let mut sub_rank_lists = build_rank_lists(&sub_graph, &sub_ranks);
        for _ in 0..4 {
            sweep_down(&sub_graph, &mut sub_rank_lists, &sub_ranks);
            sweep_up(&sub_graph, &mut sub_rank_lists, &sub_ranks);
        }
        let (mut sub_nodes, sub_w, sub_h) =
            assign_coordinates(&sub_rank_lists, &sub_infos, &sub_ranks, options, &sub_sizes);

        // Map sub-graph IDs back to original IDs and store child layouts.
        // Sub-graph nodes are in relative coordinates (origin at 0,0).
        // Merge any grandchild layouts into the flat list.
        let mut all_children_nodes: Vec<LayoutNode> = Vec::new();
        for sub_node in &mut sub_nodes {
            let orig_idx_opt = sub_graph
                .node_indices()
                .find(|&si| sub_infos[&si].id == sub_node.id);
            if let Some(sub_idx) = orig_idx_opt {
                let orig_idx = sub_graph[sub_idx];
                // If this child is itself a container, pull its laid-out children
                // and translate them relative to this child's position.
                if let Some(grandchildren) = child_layouts.remove(&orig_idx) {
                    let offset_x = sub_node.x + pad;
                    let offset_y = sub_node.y + hdr;
                    for mut gc in grandchildren {
                        gc.x += offset_x;
                        gc.y += offset_y;
                        all_children_nodes.push(gc);
                    }
                }
            }
            all_children_nodes.push(sub_node.clone());
        }

        // Container size = content + padding + header.
        let container_w = sub_w + pad * 2.0;
        let container_h = sub_h + pad + hdr;
        container_sizes.insert(
            container_idx,
            (
                container_w.max(options.node_width),
                container_h.max(options.node_height),
            ),
        );
        child_layouts.insert(container_idx, all_children_nodes);
    }

    // Now lay out the root level with variable sizes for containers.
    let root_set: std::collections::HashSet<NodeIndex> = root_nodes.iter().copied().collect();
    let mut root_graph: Graph<NodeIndex, ()> = Graph::new();
    let mut orig_to_root: HashMap<NodeIndex, NodeIndex> = HashMap::new();

    for &root_idx in &root_nodes {
        let r_idx = root_graph.add_node(root_idx);
        orig_to_root.insert(root_idx, r_idx);
    }

    // Add edges between root-level nodes.
    // An edge between two nodes in different root-level subtrees
    // becomes an edge between their root ancestors.
    for edge in graph.edge_references() {
        let src_root = find_root_ancestor(edge.source(), infos, &id_to_idx);
        let tgt_root = find_root_ancestor(edge.target(), infos, &id_to_idx);
        if src_root != tgt_root && root_set.contains(&src_root) && root_set.contains(&tgt_root) {
            if let (Some(&s), Some(&t)) = (orig_to_root.get(&src_root), orig_to_root.get(&tgt_root))
            {
                // Avoid duplicate edges.
                if !root_graph.contains_edge(s, t) {
                    root_graph.add_edge(s, t, ());
                }
            }
        }
    }

    let root_infos: HashMap<NodeIndex, NodeInfo> = root_graph
        .node_indices()
        .map(|r_idx| {
            let orig_idx = root_graph[r_idx];
            (r_idx, infos[&orig_idx].clone())
        })
        .collect();

    let mut root_sizes: HashMap<NodeIndex, (f64, f64)> = HashMap::new();
    for &r_idx in root_infos.keys() {
        let orig_idx = root_graph[r_idx];
        if let Some(&size) = container_sizes.get(&orig_idx) {
            root_sizes.insert(r_idx, size);
        }
    }

    let root_ranks = assign_ranks(&root_graph, &root_infos, options);
    let mut root_rank_lists = build_rank_lists(&root_graph, &root_ranks);
    for _ in 0..4 {
        sweep_down(&root_graph, &mut root_rank_lists, &root_ranks);
        sweep_up(&root_graph, &mut root_rank_lists, &root_ranks);
    }
    let (root_layout_nodes, total_w, total_h) = assign_coordinates(
        &root_rank_lists,
        &root_infos,
        &root_ranks,
        options,
        &root_sizes,
    );

    // Build final node list: root nodes + translated children.
    let mut all_nodes: Vec<LayoutNode> = Vec::new();

    for root_node in &root_layout_nodes {
        // Find original index for this root node.
        let orig_idx = root_graph
            .node_indices()
            .find(|&ri| root_infos[&ri].id == root_node.id)
            .map(|ri| root_graph[ri]);

        if let Some(orig_idx) = orig_idx {
            if let Some(children) = child_layouts.remove(&orig_idx) {
                // Translate children to be inside this container.
                let offset_x = root_node.x + pad;
                let offset_y = root_node.y + hdr;
                for mut child in children {
                    child.x += offset_x;
                    child.y += offset_y;
                    all_nodes.push(child);
                }
            }
        }

        all_nodes.push(root_node.clone());
    }

    // Route edges globally using final positions.
    let idx_to_id: HashMap<NodeIndex, String> = infos
        .iter()
        .map(|(&idx, info)| (idx, info.id.clone()))
        .collect();
    let layout_edges = route_edges(graph, edge_info, &all_nodes, &idx_to_id, options);

    GraphLayout {
        nodes: all_nodes,
        edges: layout_edges,
        width: total_w,
        height: total_h,
    }
}

/// Compute nesting depth for each container (0 = no parent, 1 = parent is root, etc.).
fn compute_container_depths(
    containers: &[NodeIndex],
    infos: &HashMap<NodeIndex, NodeInfo>,
    id_to_idx: &HashMap<&str, NodeIndex>,
) -> HashMap<NodeIndex, usize> {
    let container_set: std::collections::HashSet<NodeIndex> = containers.iter().copied().collect();
    let mut depths: HashMap<NodeIndex, usize> = HashMap::new();

    fn depth_of(
        idx: NodeIndex,
        infos: &HashMap<NodeIndex, NodeInfo>,
        id_to_idx: &HashMap<&str, NodeIndex>,
        container_set: &std::collections::HashSet<NodeIndex>,
        cache: &mut HashMap<NodeIndex, usize>,
    ) -> usize {
        if let Some(&d) = cache.get(&idx) {
            return d;
        }
        let d = match &infos[&idx].parent {
            Some(parent_id) => {
                if let Some(&parent_idx) = id_to_idx.get(parent_id.as_str()) {
                    if container_set.contains(&parent_idx) {
                        1 + depth_of(parent_idx, infos, id_to_idx, container_set, cache)
                    } else {
                        0
                    }
                } else {
                    0
                }
            }
            None => 0,
        };
        cache.insert(idx, d);
        d
    }

    for &idx in containers {
        depth_of(idx, infos, id_to_idx, &container_set, &mut depths);
    }
    depths
}

/// Walk up parent chain to find the root-level ancestor.
fn find_root_ancestor(
    idx: NodeIndex,
    infos: &HashMap<NodeIndex, NodeInfo>,
    id_to_idx: &HashMap<&str, NodeIndex>,
) -> NodeIndex {
    let mut current = idx;
    loop {
        match &infos[&current].parent {
            Some(parent_id) => {
                if let Some(&parent_idx) = id_to_idx.get(parent_id.as_str()) {
                    current = parent_idx;
                } else {
                    return current;
                }
            }
            None => return current,
        }
    }
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
            parent: None,
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

    // -----------------------------------------------------------------------
    // Compound (nested) layout tests
    // -----------------------------------------------------------------------

    #[test]
    fn compound_one_level_nesting() {
        // Container S with two children A, B inside; edge A→B.
        let mut g = Graph::new();
        let _s = g.add_node("S");
        let a = g.add_node("A");
        let b = g.add_node("B");
        g.add_edge(a, b, "ab");

        let result = layout(
            &g,
            &|_idx, n: &&str| NodeInfo {
                id: n.to_string(),
                label: n.to_string(),
                node_type: "default".into(),
                sublabel: None,
                parent: if *n == "A" || *n == "B" {
                    Some("S".into())
                } else {
                    None
                },
            },
            &simple_edge_info,
            &LayoutOptions::default(),
        );

        // Should have 3 nodes: S (container), A, B.
        assert_eq!(result.nodes.len(), 3);

        let node_s = result.nodes.iter().find(|n| n.id == "S").unwrap();
        let node_a = result.nodes.iter().find(|n| n.id == "A").unwrap();
        let node_b = result.nodes.iter().find(|n| n.id == "B").unwrap();

        // S must be a container.
        assert!(node_s.is_container, "S should be a container");
        assert!(!node_a.is_container);
        assert!(!node_b.is_container);

        // Children must be positioned inside the container.
        assert!(node_a.x >= node_s.x, "A.x should be inside S");
        assert!(node_a.y >= node_s.y, "A.y should be inside S");
        assert!(node_b.x >= node_s.x, "B.x should be inside S");
        assert!(node_b.y >= node_s.y, "B.y should be inside S");

        // Container must be large enough to contain children.
        assert!(
            node_s.width > 0.0 && node_s.height > 0.0,
            "container should have positive size"
        );
        let s_right = node_s.x + node_s.width;
        let s_bottom = node_s.y + node_s.height;
        assert!(
            node_a.x + node_a.width <= s_right + 1.0,
            "A right edge should be inside S"
        );
        assert!(
            node_b.x + node_b.width <= s_right + 1.0,
            "B right edge should be inside S"
        );
        assert!(
            node_b.y + node_b.height <= s_bottom + 1.0,
            "B bottom edge should be inside S"
        );
    }

    #[test]
    fn compound_two_level_nesting() {
        // Root R contains P; P contains T1, T2; edge T1→T2.
        let mut g = Graph::new();
        let _r = g.add_node("R");
        let _p = g.add_node("P");
        let t1 = g.add_node("T1");
        let t2 = g.add_node("T2");
        g.add_edge(t1, t2, "link");

        let result = layout(
            &g,
            &|_idx, n: &&str| NodeInfo {
                id: n.to_string(),
                label: n.to_string(),
                node_type: "default".into(),
                sublabel: None,
                parent: match *n {
                    "P" => Some("R".into()),
                    "T1" | "T2" => Some("P".into()),
                    _ => None,
                },
            },
            &simple_edge_info,
            &LayoutOptions::default(),
        );

        assert_eq!(result.nodes.len(), 4);

        let node_r = result.nodes.iter().find(|n| n.id == "R").unwrap();
        let node_p = result.nodes.iter().find(|n| n.id == "P").unwrap();
        let node_t1 = result.nodes.iter().find(|n| n.id == "T1").unwrap();
        let node_t2 = result.nodes.iter().find(|n| n.id == "T2").unwrap();

        // Both R and P are containers.
        assert!(node_r.is_container);
        assert!(node_p.is_container);
        assert!(!node_t1.is_container);
        assert!(!node_t2.is_container);

        // P must be inside R.
        assert!(node_p.x >= node_r.x);
        assert!(node_p.y >= node_r.y);

        // T1 and T2 must be inside P.
        assert!(node_t1.x >= node_p.x);
        assert!(node_t1.y >= node_p.y);
        assert!(node_t2.x >= node_p.x);
        assert!(node_t2.y >= node_p.y);

        // Transitive: T1, T2 must also be inside R.
        assert!(node_t1.x >= node_r.x);
        assert!(node_t1.y >= node_r.y);
    }

    #[test]
    fn compound_sibling_containers() {
        // Two sibling containers P1, P2 at root level, each with one child.
        let mut g = Graph::new();
        let _p1 = g.add_node("P1");
        let _p2 = g.add_node("P2");
        let a = g.add_node("A");
        let b = g.add_node("B");
        g.add_edge(a, b, "cross");

        let result = layout(
            &g,
            &|_idx, n: &&str| NodeInfo {
                id: n.to_string(),
                label: n.to_string(),
                node_type: "default".into(),
                sublabel: None,
                parent: match *n {
                    "A" => Some("P1".into()),
                    "B" => Some("P2".into()),
                    _ => None,
                },
            },
            &simple_edge_info,
            &LayoutOptions::default(),
        );

        let node_p1 = result.nodes.iter().find(|n| n.id == "P1").unwrap();
        let node_p2 = result.nodes.iter().find(|n| n.id == "P2").unwrap();
        let node_a = result.nodes.iter().find(|n| n.id == "A").unwrap();
        let node_b = result.nodes.iter().find(|n| n.id == "B").unwrap();

        assert!(node_p1.is_container);
        assert!(node_p2.is_container);

        // A inside P1, B inside P2.
        assert!(node_a.x >= node_p1.x);
        assert!(node_b.x >= node_p2.x);

        // Cross-container edge should exist.
        assert_eq!(result.edges.len(), 1);
        assert_eq!(result.edges[0].source_id, "A");
        assert_eq!(result.edges[0].target_id, "B");
    }

    #[test]
    fn compound_container_larger_than_leaf() {
        // A container with 3 children should be wider/taller than default leaf size.
        let mut g = Graph::new();
        let _s = g.add_node("S");
        let a = g.add_node("A");
        let b = g.add_node("B");
        let c = g.add_node("C");
        g.add_edge(a, b, "ab");
        g.add_edge(b, c, "bc");

        let opts = LayoutOptions::default();

        let result = layout(
            &g,
            &|_idx, n: &&str| NodeInfo {
                id: n.to_string(),
                label: n.to_string(),
                node_type: "default".into(),
                sublabel: None,
                parent: if *n != "S" { Some("S".into()) } else { None },
            },
            &simple_edge_info,
            &opts,
        );

        let node_s = result.nodes.iter().find(|n| n.id == "S").unwrap();

        // Container must be larger than a default leaf node.
        assert!(
            node_s.width > opts.node_width,
            "container width {} should exceed default {}",
            node_s.width,
            opts.node_width
        );
        assert!(
            node_s.height > opts.node_height,
            "container height {} should exceed default {}",
            node_s.height,
            opts.node_height
        );
    }

    #[test]
    fn compound_mixed_root_and_container() {
        // Mix of root-level leaf nodes and containers.
        let mut g = Graph::new();
        let _s = g.add_node("S");
        let a = g.add_node("A");
        let b = g.add_node("B");
        let leaf = g.add_node("Leaf");
        g.add_edge(a, b, "ab");
        g.add_edge(_s, leaf, "s-leaf");

        let result = layout(
            &g,
            &|_idx, n: &&str| NodeInfo {
                id: n.to_string(),
                label: n.to_string(),
                node_type: "default".into(),
                sublabel: None,
                parent: match *n {
                    "A" | "B" => Some("S".into()),
                    _ => None,
                },
            },
            &simple_edge_info,
            &LayoutOptions::default(),
        );

        // All 4 nodes should be present.
        assert_eq!(result.nodes.len(), 4);

        let node_s = result.nodes.iter().find(|n| n.id == "S").unwrap();
        let node_leaf = result.nodes.iter().find(|n| n.id == "Leaf").unwrap();

        assert!(node_s.is_container);
        assert!(!node_leaf.is_container);
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
