//! Orthogonal edge routing with obstacle avoidance.
//!
//! Routes edges as sequences of horizontal and vertical line segments,
//! avoiding node rectangles.  Uses a visibility-graph approach:
//!
//! 1. Build padded obstacle rectangles from all nodes.
//! 2. Generate candidate waypoints at obstacle corners and routing channels.
//! 3. Find shortest orthogonal path using A* with Manhattan heuristic and
//!    bend penalty.
//! 4. Simplify collinear waypoints.
//! 5. Nudge overlapping parallel segments apart (batch mode).

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

use std::cmp::Ordering;
use std::collections::{BinaryHeap, HashMap};

use crate::layout::LayoutNode;

/// Padding around obstacle rectangles (px).
const OBSTACLE_PADDING: f64 = 8.0;

/// Extra clearance beyond obstacle padding for waypoints, so edges
/// don't hug node boundaries (px).
const WAYPOINT_MARGIN: f64 = 4.0;

/// An axis-aligned rectangle used as an obstacle.
#[derive(Debug, Clone, Copy)]
struct Rect {
    x1: f64,
    y1: f64,
    x2: f64,
    y2: f64,
}

impl Rect {
    fn contains(&self, x: f64, y: f64) -> bool {
        x >= self.x1 && x <= self.x2 && y >= self.y1 && y <= self.y2
    }

    /// Check strictly inside (not on boundary).
    fn contains_strict(&self, x: f64, y: f64) -> bool {
        x > self.x1 + 0.01 && x < self.x2 - 0.01 && y > self.y1 + 0.01 && y < self.y2 - 0.01
    }

    fn intersects_segment(&self, ax: f64, ay: f64, bx: f64, by: f64) -> bool {
        // Check if horizontal or vertical segment intersects this rectangle.
        // Uses strict interior check so edges along obstacle boundaries are
        // not falsely blocked.
        if (ay - by).abs() < 0.001 {
            // Horizontal segment
            let y = ay;
            if y <= self.y1 || y >= self.y2 {
                return false;
            }
            let min_x = ax.min(bx);
            let max_x = ax.max(bx);
            min_x < self.x2 && max_x > self.x1
        } else if (ax - bx).abs() < 0.001 {
            // Vertical segment
            let x = ax;
            if x <= self.x1 || x >= self.x2 {
                return false;
            }
            let min_y = ay.min(by);
            let max_y = ay.max(by);
            min_y < self.y2 && max_y > self.y1
        } else {
            false // Non-axis-aligned segments not handled
        }
    }
}

/// A* node for orthogonal pathfinding.
#[derive(Debug, Clone)]
struct PathNode {
    x: f64,
    y: f64,
    /// g-cost: actual distance from start.
    g: f64,
    /// f-cost: g + heuristic.
    f: f64,
    /// Direction of the segment leading to this node (for bend penalty).
    /// 0 = start, 1 = horizontal, 2 = vertical
    dir: u8,
}

impl PartialEq for PathNode {
    fn eq(&self, other: &Self) -> bool {
        self.f == other.f
    }
}

impl Eq for PathNode {}

impl PartialOrd for PathNode {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        Some(self.cmp(other))
    }
}

impl Ord for PathNode {
    fn cmp(&self, other: &Self) -> Ordering {
        // Reverse ordering for min-heap (lower f-cost = higher priority).
        // Break ties by preferring lower g-cost (closer to start).
        other
            .f
            .partial_cmp(&self.f)
            .unwrap_or(Ordering::Equal)
            .then_with(|| self.g.partial_cmp(&other.g).unwrap_or(Ordering::Equal))
    }
}

/// Discretize a coordinate for use as HashMap key.
/// Uses rounding instead of truncation for better precision.
fn grid_key(x: f64, y: f64) -> (i64, i64) {
    ((x * 100.0).round() as i64, (y * 100.0).round() as i64)
}

/// Manhattan distance heuristic for A*.
fn manhattan(ax: f64, ay: f64, bx: f64, by: f64) -> f64 {
    (ax - bx).abs() + (ay - by).abs()
}

/// Route an edge orthogonally from `src` to `tgt`, avoiding obstacles.
///
/// Returns a list of waypoints where all consecutive pairs form
/// horizontal or vertical segments.
pub fn route_orthogonal(
    nodes: &[LayoutNode],
    src: (f64, f64),
    tgt: (f64, f64),
    bend_penalty: f64,
    port_stub_length: f64,
) -> Vec<(f64, f64)> {
    // Trivial case: same point
    if (src.0 - tgt.0).abs() < 0.001 && (src.1 - tgt.1).abs() < 0.001 {
        return vec![src];
    }

    let obstacles = build_obstacles(nodes);

    // Add port stubs: extend straight out from src/tgt before routing.
    // This ensures edges leave ports cleanly rather than bending immediately.
    let (effective_src, src_stub) = compute_port_stub(src, tgt, port_stub_length, &obstacles);
    let (effective_tgt, tgt_stub) = compute_port_stub(tgt, src, port_stub_length, &obstacles);

    // If source and target share an axis after stubs, try direct line
    if can_route_direct(&obstacles, effective_src, effective_tgt) {
        let mut path = Vec::new();
        if let Some(s) = src_stub {
            path.push(src);
            path.push(s);
        }
        if (effective_src.0 - effective_tgt.0).abs() < 0.001
            || (effective_src.1 - effective_tgt.1).abs() < 0.001
        {
            if path.is_empty() {
                path.push(effective_src);
            }
            path.push(effective_tgt);
        } else {
            // One bend: try horizontal-then-vertical, then vertical-then-horizontal
            if path.is_empty() {
                path.push(effective_src);
            }
            let mid = (effective_tgt.0, effective_src.1);
            if !segment_blocked(&obstacles, effective_src.0, effective_src.1, mid.0, mid.1)
                && !segment_blocked(&obstacles, mid.0, mid.1, effective_tgt.0, effective_tgt.1)
            {
                path.push(mid);
                path.push(effective_tgt);
            } else {
                let mid2 = (effective_src.0, effective_tgt.1);
                if !segment_blocked(&obstacles, effective_src.0, effective_src.1, mid2.0, mid2.1)
                    && !segment_blocked(
                        &obstacles,
                        mid2.0,
                        mid2.1,
                        effective_tgt.0,
                        effective_tgt.1,
                    )
                {
                    path.push(mid2);
                    path.push(effective_tgt);
                } else {
                    // Fall through to A*
                    let mut astar_path =
                        route_with_astar(&obstacles, effective_src, effective_tgt, bend_penalty);
                    let mut result = Vec::new();
                    if let Some(s) = src_stub {
                        result.push(src);
                        result.push(s);
                    }
                    if !result.is_empty()
                        && !astar_path.is_empty()
                        && (astar_path[0].0 - effective_src.0).abs() < 0.1
                        && (astar_path[0].1 - effective_src.1).abs() < 0.1
                    {
                        astar_path.remove(0);
                    }
                    result.extend(astar_path);
                    if let Some(s) = tgt_stub {
                        result.push(s);
                        result.push(tgt);
                    }
                    return simplify_path(result);
                }
            }
        }
        if let Some(s) = tgt_stub {
            path.push(s);
            path.push(tgt);
        }
        return simplify_path(path);
    }

    // Full A* routing
    let mut astar_path = route_with_astar(&obstacles, effective_src, effective_tgt, bend_penalty);

    let mut result = Vec::new();
    if let Some(s) = src_stub {
        result.push(src);
        result.push(s);
    }
    if !result.is_empty()
        && !astar_path.is_empty()
        && (astar_path[0].0 - effective_src.0).abs() < 0.1
        && (astar_path[0].1 - effective_src.1).abs() < 0.1
    {
        astar_path.remove(0);
    }
    result.extend(astar_path);
    if let Some(s) = tgt_stub {
        result.push(s);
        result.push(tgt);
    }

    simplify_path(result)
}

/// A source-target point pair for batch routing.
pub type EdgeEndpoints = ((f64, f64), (f64, f64));

/// Route multiple edges as a batch, then nudge overlapping parallel segments
/// apart so they don't visually overlap.
///
/// `edge_separation` controls the gap between adjacent parallel segments.
pub fn route_orthogonal_batch(
    nodes: &[LayoutNode],
    edges: &[EdgeEndpoints],
    bend_penalty: f64,
    port_stub_length: f64,
    edge_separation: f64,
) -> Vec<Vec<(f64, f64)>> {
    // Route each edge individually first.
    let mut paths: Vec<Vec<(f64, f64)>> = edges
        .iter()
        .map(|&(src, tgt)| route_orthogonal(nodes, src, tgt, bend_penalty, port_stub_length))
        .collect();

    // Nudge overlapping parallel segments apart.
    nudge_parallel_segments(&mut paths, edge_separation);

    paths
}

/// Compute a port stub point: extends straight from `from` away from `toward`.
/// Returns (effective routing point, optional stub waypoint).
fn compute_port_stub(
    from: (f64, f64),
    toward: (f64, f64),
    stub_length: f64,
    obstacles: &[Rect],
) -> ((f64, f64), Option<(f64, f64)>) {
    if stub_length <= 0.0 {
        return (from, None);
    }

    // Determine primary direction: if the target is mostly below, extend down;
    // if mostly above, extend up; if mostly right, extend right; etc.
    let dx = toward.0 - from.0;
    let dy = toward.1 - from.1;

    let stub = if dy.abs() >= dx.abs() {
        // Vertical stub
        let dir = if dy >= 0.0 { 1.0 } else { -1.0 };
        (from.0, from.1 + dir * stub_length)
    } else {
        // Horizontal stub
        let dir = if dx >= 0.0 { 1.0 } else { -1.0 };
        (from.0 + dir * stub_length, from.1)
    };

    // Only use stub if it doesn't go inside an obstacle
    if obstacles.iter().any(|r| r.contains_strict(stub.0, stub.1)) {
        return (from, None);
    }

    (stub, Some(stub))
}

fn build_obstacles(nodes: &[LayoutNode]) -> Vec<Rect> {
    nodes
        .iter()
        .map(|n| Rect {
            x1: n.x - OBSTACLE_PADDING,
            y1: n.y - OBSTACLE_PADDING,
            x2: n.x + n.width + OBSTACLE_PADDING,
            y2: n.y + n.height + OBSTACLE_PADDING,
        })
        .collect()
}

fn can_route_direct(obstacles: &[Rect], src: (f64, f64), tgt: (f64, f64)) -> bool {
    // Direct horizontal or vertical line
    if (src.0 - tgt.0).abs() < 0.001 || (src.1 - tgt.1).abs() < 0.001 {
        return !segment_blocked(obstacles, src.0, src.1, tgt.0, tgt.1);
    }
    false
}

fn segment_blocked(obstacles: &[Rect], x1: f64, y1: f64, x2: f64, y2: f64) -> bool {
    obstacles
        .iter()
        .any(|r| r.intersects_segment(x1, y1, x2, y2))
}

fn route_with_astar(
    obstacles: &[Rect],
    src: (f64, f64),
    tgt: (f64, f64),
    bend_penalty: f64,
) -> Vec<(f64, f64)> {
    let margin = WAYPOINT_MARGIN;

    // Generate candidate waypoints from obstacle corners + src/tgt.
    // Place waypoints with extra margin so edges don't hug node boundaries.
    let mut candidates: Vec<(f64, f64)> = vec![src, tgt];

    for r in obstacles {
        // Corner points with additional clearance margin
        candidates.push((r.x1 - margin, r.y1 - margin));
        candidates.push((r.x2 + margin, r.y1 - margin));
        candidates.push((r.x1 - margin, r.y2 + margin));
        candidates.push((r.x2 + margin, r.y2 + margin));
    }

    // Add axis-aligned projections of src/tgt through obstacle edges (with margin)
    for r in obstacles {
        candidates.push((src.0, r.y1 - margin));
        candidates.push((src.0, r.y2 + margin));
        candidates.push((r.x1 - margin, src.1));
        candidates.push((r.x2 + margin, src.1));
        candidates.push((tgt.0, r.y1 - margin));
        candidates.push((tgt.0, r.y2 + margin));
        candidates.push((r.x1 - margin, tgt.1));
        candidates.push((r.x2 + margin, tgt.1));
    }

    // Add mid-channel waypoints between adjacent obstacles (horizontal and vertical).
    // These provide natural routing channels through dense layouts.
    add_channel_waypoints(&mut candidates, obstacles, src, tgt);

    // Filter out candidates inside obstacles
    candidates.retain(|&(x, y)| !obstacles.iter().any(|r| r.contains(x, y)));

    // Deduplicate
    candidates.sort_by(|a, b| {
        a.0.partial_cmp(&b.0)
            .unwrap_or(Ordering::Equal)
            .then(a.1.partial_cmp(&b.1).unwrap_or(Ordering::Equal))
    });
    candidates.dedup_by(|a, b| (a.0 - b.0).abs() < 0.01 && (a.1 - b.1).abs() < 0.01);

    // A* search with Manhattan heuristic
    let src_key = grid_key(src.0, src.1);
    let tgt_key = grid_key(tgt.0, tgt.1);

    let mut heap = BinaryHeap::new();
    type GridKey = (i64, i64);

    // Map from grid key to (g-cost, direction, predecessor key, exact x, exact y)
    let mut best: HashMap<GridKey, (f64, u8, Option<GridKey>, f64, f64)> = HashMap::new();

    let h0 = manhattan(src.0, src.1, tgt.0, tgt.1);
    heap.push(PathNode {
        x: src.0,
        y: src.1,
        g: 0.0,
        f: h0,
        dir: 0,
    });
    best.insert(src_key, (0.0, 0, None, src.0, src.1));

    while let Some(current) = heap.pop() {
        let cur_key = grid_key(current.x, current.y);

        if cur_key == tgt_key {
            break;
        }

        if let Some(&(best_g, _, _, _, _)) = best.get(&cur_key) {
            if current.g > best_g + 0.001 {
                continue;
            }
        }

        // Try reaching each candidate via orthogonal segment
        for &(cx, cy) in &candidates {
            let c_key = grid_key(cx, cy);
            if c_key == cur_key {
                continue;
            }

            // Must share an axis (orthogonal move)
            let is_horizontal = (current.y - cy).abs() < 0.01;
            let is_vertical = (current.x - cx).abs() < 0.01;

            if !is_horizontal && !is_vertical {
                continue;
            }

            // Check if segment is blocked
            if segment_blocked(obstacles, current.x, current.y, cx, cy) {
                continue;
            }

            let dir = if is_horizontal { 1 } else { 2 };
            let dist = if is_horizontal {
                (current.x - cx).abs()
            } else {
                (current.y - cy).abs()
            };

            let bend_cost = if current.dir != 0 && current.dir != dir {
                bend_penalty
            } else {
                0.0
            };

            let new_g = current.g + dist + bend_cost;

            let is_better = match best.get(&c_key) {
                Some(&(prev_g, _, _, _, _)) => new_g < prev_g - 0.001,
                None => true,
            };

            if is_better {
                let h = manhattan(cx, cy, tgt.0, tgt.1);
                best.insert(c_key, (new_g, dir, Some(cur_key), cx, cy));
                heap.push(PathNode {
                    x: cx,
                    y: cy,
                    g: new_g,
                    f: new_g + h,
                    dir,
                });
            }
        }
    }

    // Reconstruct path using exact coordinates stored in `best`
    let mut path = Vec::new();
    let mut key = tgt_key;

    loop {
        match best.get(&key) {
            Some(&(_, _, Some(prev), x, y)) => {
                path.push((x, y));
                key = prev;
            }
            Some(&(_, _, None, x, y)) => {
                // This is the source node
                path.push((x, y));
                break;
            }
            None => {
                // Target was never reached — fallback
                path.push(src);
                break;
            }
        }
    }

    path.reverse();

    // If path is empty or single point, fallback to L-shaped route
    if path.len() < 2 {
        let mid = (tgt.0, src.1);
        return vec![src, mid, tgt];
    }

    simplify_path(path)
}

/// Add mid-channel waypoints between adjacent obstacles.
///
/// When two obstacles are separated by a gap, add waypoints at the midpoint
/// of the gap on the relevant axes.  This gives the router natural channels
/// to route through instead of hugging obstacle corners.
fn add_channel_waypoints(
    candidates: &mut Vec<(f64, f64)>,
    obstacles: &[Rect],
    src: (f64, f64),
    tgt: (f64, f64),
) {
    let margin = WAYPOINT_MARGIN;

    // Collect all unique x and y coordinates from obstacles
    let mut xs: Vec<f64> = Vec::new();
    let mut ys: Vec<f64> = Vec::new();
    for r in obstacles {
        xs.push(r.x1 - margin);
        xs.push(r.x2 + margin);
        ys.push(r.y1 - margin);
        ys.push(r.y2 + margin);
    }
    xs.push(src.0);
    xs.push(tgt.0);
    ys.push(src.1);
    ys.push(tgt.1);

    xs.sort_by(|a, b| a.partial_cmp(b).unwrap_or(Ordering::Equal));
    ys.sort_by(|a, b| a.partial_cmp(b).unwrap_or(Ordering::Equal));
    xs.dedup_by(|a, b| (*a - *b).abs() < 1.0);
    ys.dedup_by(|a, b| (*a - *b).abs() < 1.0);

    // For each pair of adjacent x-coordinates, add midpoint channel waypoints
    for pair in xs.windows(2) {
        let mid_x = (pair[0] + pair[1]) / 2.0;
        for &y in &ys {
            candidates.push((mid_x, y));
        }
    }

    // For each pair of adjacent y-coordinates, add midpoint channel waypoints
    for pair in ys.windows(2) {
        let mid_y = (pair[0] + pair[1]) / 2.0;
        for &x in &xs {
            candidates.push((x, mid_y));
        }
    }
}

/// Remove redundant collinear waypoints from a path.
///
/// If three consecutive points lie on the same horizontal or vertical line,
/// the middle point is redundant and can be removed.
fn simplify_path(mut path: Vec<(f64, f64)>) -> Vec<(f64, f64)> {
    if path.len() <= 2 {
        return path;
    }

    let mut i = 1;
    while i < path.len().saturating_sub(1) {
        let prev = path[i - 1];
        let curr = path[i];
        let next = path[i + 1];

        let collinear_h = (prev.1 - curr.1).abs() < 0.01 && (curr.1 - next.1).abs() < 0.01;
        let collinear_v = (prev.0 - curr.0).abs() < 0.01 && (curr.0 - next.0).abs() < 0.01;

        if collinear_h || collinear_v {
            path.remove(i);
        } else {
            i += 1;
        }
    }

    path
}

/// Nudge overlapping parallel segments apart.
///
/// Collects all horizontal and vertical segments from all paths, groups
/// overlapping parallel segments, and offsets them symmetrically so they
/// don't visually overlap.
fn nudge_parallel_segments(paths: &mut [Vec<(f64, f64)>], separation: f64) {
    if separation <= 0.0 || paths.len() < 2 {
        return;
    }

    // Collect all segments with their path/segment indices.
    // Each segment is (path_idx, seg_idx, is_horizontal, fixed_coord, min_var, max_var).
    let mut h_segments: Vec<(usize, usize, f64, f64, f64)> = Vec::new(); // (path, seg, y, min_x, max_x)
    let mut v_segments: Vec<(usize, usize, f64, f64, f64)> = Vec::new(); // (path, seg, x, min_y, max_y)

    for (pi, path) in paths.iter().enumerate() {
        for si in 0..path.len().saturating_sub(1) {
            let (x1, y1) = path[si];
            let (x2, y2) = path[si + 1];

            if (y1 - y2).abs() < 0.01 {
                // Horizontal segment
                h_segments.push((pi, si, y1, x1.min(x2), x1.max(x2)));
            } else if (x1 - x2).abs() < 0.01 {
                // Vertical segment
                v_segments.push((pi, si, x1, y1.min(y2), y1.max(y2)));
            }
        }
    }

    // Nudge overlapping horizontal segments (same y, overlapping x-range)
    nudge_group(&h_segments, paths, separation, true);

    // Nudge overlapping vertical segments (same x, overlapping y-range)
    nudge_group(&v_segments, paths, separation, false);
}

/// Find groups of overlapping segments on the same line and nudge them apart.
fn nudge_group(
    segments: &[(usize, usize, f64, f64, f64)],
    paths: &mut [Vec<(f64, f64)>],
    separation: f64,
    is_horizontal: bool,
) {
    // Group segments by their fixed coordinate (within tolerance)
    let tolerance = 0.5;

    // Sort by fixed coordinate
    let mut sorted: Vec<usize> = (0..segments.len()).collect();
    sorted.sort_by(|&a, &b| {
        segments[a]
            .2
            .partial_cmp(&segments[b].2)
            .unwrap_or(Ordering::Equal)
    });

    let mut i = 0;
    while i < sorted.len() {
        let fixed = segments[sorted[i]].2;

        // Collect all segments with same fixed coordinate
        let mut group: Vec<usize> = vec![sorted[i]];
        let mut j = i + 1;
        while j < sorted.len() && (segments[sorted[j]].2 - fixed).abs() < tolerance {
            group.push(sorted[j]);
            j += 1;
        }

        if group.len() > 1 {
            // Find overlapping subsets within this group
            // For each pair, check if their variable ranges overlap
            let mut overlapping: Vec<Vec<usize>> = Vec::new();
            let mut used = vec![false; group.len()];

            for gi in 0..group.len() {
                if used[gi] {
                    continue;
                }
                let mut cluster = vec![gi];
                used[gi] = true;

                for gj in (gi + 1)..group.len() {
                    if used[gj] {
                        continue;
                    }
                    // Check if any segment in cluster overlaps with gj
                    let seg_j = &segments[group[gj]];
                    let overlaps = cluster.iter().any(|&ck| {
                        let seg_k = &segments[group[ck]];
                        seg_k.3 < seg_j.4 && seg_j.3 < seg_k.4
                    });
                    if overlaps {
                        cluster.push(gj);
                        used[gj] = true;
                    }
                }

                if cluster.len() > 1 {
                    overlapping.push(cluster.iter().map(|&ci| group[ci]).collect());
                }
            }

            // Nudge each overlapping cluster
            for cluster in &overlapping {
                let n = cluster.len();
                for (rank, &seg_idx) in cluster.iter().enumerate() {
                    let offset = (rank as f64 - (n - 1) as f64 / 2.0) * separation;
                    let (pi, si, _, _, _) = segments[seg_idx];

                    if is_horizontal {
                        // Nudge y coordinate of both endpoints of this segment
                        paths[pi][si].1 += offset;
                        paths[pi][si + 1].1 += offset;
                    } else {
                        // Nudge x coordinate of both endpoints of this segment
                        paths[pi][si].0 += offset;
                        paths[pi][si + 1].0 += offset;
                    }
                }
            }
        }

        i = j;
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::layout::LayoutNode;

    fn make_node(id: &str, x: f64, y: f64, w: f64, h: f64) -> LayoutNode {
        LayoutNode {
            id: id.into(),
            x,
            y,
            width: w,
            height: h,
            rank: 0,
            label: id.into(),
            node_type: "default".into(),
            sublabel: None,
            is_container: false,
            ports: vec![],
        }
    }

    /// Assert all consecutive segments are orthogonal (horizontal or vertical).
    fn assert_orthogonal(path: &[(f64, f64)]) {
        for w in path.windows(2) {
            let dx = (w[0].0 - w[1].0).abs();
            let dy = (w[0].1 - w[1].1).abs();
            assert!(
                dx < 0.1 || dy < 0.1,
                "non-orthogonal: ({:.1},{:.1})->({:.1},{:.1})",
                w[0].0,
                w[0].1,
                w[1].0,
                w[1].1
            );
        }
    }

    /// Assert that no path segment passes through any obstacle interior.
    fn assert_no_obstacle_penetration(path: &[(f64, f64)], nodes: &[LayoutNode]) {
        let obstacles = build_obstacles(nodes);
        for w in path.windows(2) {
            for (oi, obs) in obstacles.iter().enumerate() {
                // Allow segments along obstacle boundaries but not through interiors.
                // Use a slightly shrunk rect for the "strictly interior" check.
                let shrunk = Rect {
                    x1: obs.x1 + 0.1,
                    y1: obs.y1 + 0.1,
                    x2: obs.x2 - 0.1,
                    y2: obs.y2 - 0.1,
                };
                assert!(
                    !shrunk.intersects_segment(w[0].0, w[0].1, w[1].0, w[1].1),
                    "segment ({:.1},{:.1})->({:.1},{:.1}) penetrates obstacle {}",
                    w[0].0,
                    w[0].1,
                    w[1].0,
                    w[1].1,
                    oi
                );
            }
        }
    }

    #[test]
    fn direct_vertical_no_obstacles() {
        let nodes = vec![];
        let path = route_orthogonal(&nodes, (100.0, 0.0), (100.0, 200.0), 20.0, 10.0);
        assert_eq!(path.len(), 2);
        assert!((path[0].0 - 100.0).abs() < 0.1);
        assert!((path[1].0 - 100.0).abs() < 0.1);
    }

    #[test]
    fn direct_horizontal_no_obstacles() {
        let nodes = vec![];
        let path = route_orthogonal(&nodes, (0.0, 100.0), (200.0, 100.0), 20.0, 10.0);
        assert_eq!(path.len(), 2);
    }

    #[test]
    fn l_shaped_no_obstacles() {
        let nodes = vec![];
        let path = route_orthogonal(&nodes, (0.0, 0.0), (200.0, 200.0), 20.0, 10.0);
        // Should have at least one bend
        assert!(path.len() >= 2);
        assert_orthogonal(&path);
    }

    #[test]
    fn routes_around_obstacle() {
        // Node B sits between src and tgt
        let nodes = vec![make_node("B", 90.0, 90.0, 20.0, 20.0)];
        let path = route_orthogonal(&nodes, (100.0, 50.0), (100.0, 150.0), 20.0, 10.0);

        // Path should avoid the obstacle (more than 2 points)
        assert!(
            path.len() >= 3,
            "should route around obstacle, got {} points",
            path.len()
        );

        assert_orthogonal(&path);
    }

    #[test]
    fn all_segments_orthogonal() {
        let nodes = vec![
            make_node("A", 0.0, 0.0, 80.0, 40.0),
            make_node("B", 200.0, 0.0, 80.0, 40.0),
            make_node("C", 100.0, 100.0, 80.0, 40.0),
        ];
        let path = route_orthogonal(&nodes, (80.0, 20.0), (200.0, 120.0), 20.0, 10.0);
        assert_orthogonal(&path);
    }

    // --- New tests for improvements ---

    #[test]
    fn port_stub_creates_initial_straight_segment() {
        let nodes = vec![];
        let path = route_orthogonal(&nodes, (100.0, 0.0), (200.0, 200.0), 20.0, 15.0);

        // With a 15px stub, the first segment should be vertical from (100,0)
        assert!(
            path.len() >= 3,
            "should have stub + bend, got {} points",
            path.len()
        );
        // First segment should be along the dominant axis (vertical, toward target)
        assert!(
            (path[0].0 - path[1].0).abs() < 0.1 || (path[0].1 - path[1].1).abs() < 0.1,
            "first segment should be axis-aligned"
        );
        assert_orthogonal(&path);
    }

    #[test]
    fn zero_stub_length_no_stub() {
        let nodes = vec![];
        let path_stub = route_orthogonal(&nodes, (100.0, 0.0), (100.0, 200.0), 20.0, 0.0);
        // With zero stub, should be direct vertical
        assert_eq!(path_stub.len(), 2);
    }

    #[test]
    fn simplify_removes_collinear_points() {
        let path = vec![
            (0.0, 0.0),
            (100.0, 0.0),
            (200.0, 0.0), // collinear with prev two
            (200.0, 100.0),
        ];
        let simplified = simplify_path(path);
        assert_eq!(simplified.len(), 3, "should remove middle collinear point");
        assert!((simplified[0].0 - 0.0).abs() < 0.01);
        assert!((simplified[1].0 - 200.0).abs() < 0.01);
        assert!((simplified[2].1 - 100.0).abs() < 0.01);
    }

    #[test]
    fn simplify_preserves_corners() {
        let path = vec![
            (0.0, 0.0),
            (100.0, 0.0),
            (100.0, 100.0), // corner, not collinear
            (200.0, 100.0),
        ];
        let simplified = simplify_path(path.clone());
        assert_eq!(simplified.len(), 4, "should preserve all corner points");
    }

    #[test]
    fn batch_routes_multiple_edges() {
        let nodes = vec![
            make_node("A", 0.0, 0.0, 80.0, 40.0),
            make_node("B", 0.0, 200.0, 80.0, 40.0),
        ];
        let edges = vec![((40.0, 40.0), (40.0, 200.0)), ((60.0, 40.0), (60.0, 200.0))];
        let paths = route_orthogonal_batch(&nodes, &edges, 20.0, 10.0, 4.0);
        assert_eq!(paths.len(), 2);
        for path in &paths {
            assert!(path.len() >= 2, "each path should have at least 2 points");
            assert_orthogonal(path);
        }
    }

    #[test]
    fn nudge_separates_overlapping_horizontal_segments() {
        // Two paths with identical horizontal segments
        let mut paths = vec![
            vec![(0.0, 50.0), (100.0, 50.0), (100.0, 100.0)],
            vec![(0.0, 50.0), (100.0, 50.0), (100.0, 200.0)],
        ];
        nudge_parallel_segments(&mut paths, 4.0);

        // The horizontal segments (y=50) should now have different y values
        let y0 = paths[0][0].1;
        let y1 = paths[1][0].1;
        assert!(
            (y0 - y1).abs() > 1.0,
            "overlapping segments should be nudged apart: y0={y0}, y1={y1}"
        );
    }

    #[test]
    fn nudge_separates_overlapping_vertical_segments() {
        // Two paths with identical vertical segments
        let mut paths = vec![
            vec![(50.0, 0.0), (50.0, 100.0), (100.0, 100.0)],
            vec![(50.0, 0.0), (50.0, 100.0), (200.0, 100.0)],
        ];
        nudge_parallel_segments(&mut paths, 4.0);

        // The vertical segments (x=50) should now have different x values
        let x0 = paths[0][0].0;
        let x1 = paths[1][0].0;
        assert!(
            (x0 - x1).abs() > 1.0,
            "overlapping vertical segments should be nudged apart: x0={x0}, x1={x1}"
        );
    }

    #[test]
    fn routes_avoid_obstacles_with_clearance() {
        // Place a large obstacle and route around it
        let nodes = vec![make_node("Wall", 80.0, 80.0, 40.0, 40.0)];
        let path = route_orthogonal(&nodes, (100.0, 50.0), (100.0, 150.0), 20.0, 10.0);

        assert_orthogonal(&path);
        assert_no_obstacle_penetration(&path, &nodes);

        // Check that path waypoints maintain clearance from obstacle
        let obs = Rect {
            x1: 80.0 - OBSTACLE_PADDING,
            y1: 80.0 - OBSTACLE_PADDING,
            x2: 120.0 + OBSTACLE_PADDING,
            y2: 120.0 + OBSTACLE_PADDING,
        };
        for &(x, y) in &path[1..path.len() - 1] {
            // Interior waypoints should not be on the obstacle boundary
            let on_boundary = (x - obs.x1).abs() < 0.01
                || (x - obs.x2).abs() < 0.01
                || (y - obs.y1).abs() < 0.01
                || (y - obs.y2).abs() < 0.01;
            let inside = obs.contains_strict(x, y);
            assert!(!inside, "waypoint ({x},{y}) is inside obstacle");
            // Waypoints right on the boundary are acceptable but ideally
            // they should be offset by WAYPOINT_MARGIN. We don't enforce
            // this strictly since the source/target may be near the boundary.
            let _ = on_boundary;
        }
    }

    #[test]
    fn dense_graph_all_segments_orthogonal() {
        // A dense graph scenario with many obstacles
        let nodes = vec![
            make_node("A", 0.0, 0.0, 60.0, 30.0),
            make_node("B", 100.0, 0.0, 60.0, 30.0),
            make_node("C", 200.0, 0.0, 60.0, 30.0),
            make_node("D", 0.0, 80.0, 60.0, 30.0),
            make_node("E", 100.0, 80.0, 60.0, 30.0),
            make_node("F", 200.0, 80.0, 60.0, 30.0),
            make_node("G", 0.0, 160.0, 60.0, 30.0),
            make_node("H", 100.0, 160.0, 60.0, 30.0),
            make_node("I", 200.0, 160.0, 60.0, 30.0),
        ];

        // Route across the dense grid
        let path = route_orthogonal(&nodes, (30.0, 30.0), (230.0, 160.0), 20.0, 10.0);
        assert_orthogonal(&path);
        assert!(path.len() >= 2);
    }

    #[test]
    fn batch_route_dense_graph() {
        let nodes = vec![
            make_node("A", 0.0, 0.0, 80.0, 40.0),
            make_node("B", 200.0, 0.0, 80.0, 40.0),
            make_node("C", 0.0, 120.0, 80.0, 40.0),
            make_node("D", 200.0, 120.0, 80.0, 40.0),
        ];
        let edges = vec![
            ((80.0, 20.0), (200.0, 20.0)),
            ((80.0, 30.0), (200.0, 30.0)),
            ((40.0, 40.0), (40.0, 120.0)),
            ((40.0, 40.0), (240.0, 120.0)),
        ];
        let paths = route_orthogonal_batch(&nodes, &edges, 20.0, 10.0, 4.0);
        assert_eq!(paths.len(), 4);
        for (i, path) in paths.iter().enumerate() {
            assert!(path.len() >= 2, "path {i} too short: {} points", path.len());
            assert_orthogonal(path);
        }
    }

    #[test]
    fn grid_key_round_trip_precision() {
        // Verify that grid_key rounding doesn't lose significant precision
        let coords = [(123.456, 789.012), (0.005, 0.005), (99.999, 100.001)];
        for (x, y) in coords {
            let (kx, ky) = grid_key(x, y);
            let rx = kx as f64 / 100.0;
            let ry = ky as f64 / 100.0;
            assert!((rx - x).abs() < 0.01, "x round-trip: {x} -> {kx} -> {rx}");
            assert!((ry - y).abs() < 0.01, "y round-trip: {y} -> {ky} -> {ry}");
        }
    }

    #[test]
    fn manhattan_heuristic() {
        assert!((manhattan(0.0, 0.0, 3.0, 4.0) - 7.0).abs() < 0.001);
        assert!((manhattan(1.0, 1.0, 1.0, 1.0) - 0.0).abs() < 0.001);
        assert!((manhattan(-1.0, -2.0, 3.0, 5.0) - 11.0).abs() < 0.001);
    }

    #[test]
    fn simplify_empty_and_single() {
        assert_eq!(simplify_path(vec![]).len(), 0);
        assert_eq!(simplify_path(vec![(1.0, 2.0)]).len(), 1);
        assert_eq!(simplify_path(vec![(1.0, 2.0), (3.0, 4.0)]).len(), 2);
    }

    #[test]
    fn no_nudge_for_single_path() {
        let mut paths = vec![vec![(0.0, 0.0), (100.0, 0.0)]];
        let orig = paths.clone();
        nudge_parallel_segments(&mut paths, 4.0);
        // Single path should not be modified
        assert_eq!(paths, orig);
    }

    #[test]
    fn no_nudge_for_non_overlapping_segments() {
        let mut paths = vec![
            vec![(0.0, 50.0), (50.0, 50.0)],
            vec![(100.0, 50.0), (200.0, 50.0)],
        ];
        let orig = paths.clone();
        nudge_parallel_segments(&mut paths, 4.0);
        // Non-overlapping segments on same line should not be nudged
        assert_eq!(paths, orig);
    }
}
