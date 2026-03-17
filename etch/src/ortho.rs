//! Orthogonal edge routing with obstacle avoidance.
//!
//! Routes edges as sequences of horizontal and vertical line segments,
//! avoiding node rectangles.  Uses a simplified visibility-graph approach:
//!
//! 1. Build padded obstacle rectangles from all nodes.
//! 2. Generate candidate waypoints at obstacle corners.
//! 3. Find shortest orthogonal path using A* with bend penalty.

use std::cmp::Ordering;
use std::collections::{BinaryHeap, HashMap};

use crate::layout::LayoutNode;

/// Padding around obstacle rectangles (px).
const OBSTACLE_PADDING: f64 = 6.0;

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

    fn intersects_segment(&self, ax: f64, ay: f64, bx: f64, by: f64) -> bool {
        // Check if horizontal or vertical segment intersects this rectangle
        if (ay - by).abs() < 0.001 {
            // Horizontal segment
            let y = ay;
            if y < self.y1 || y > self.y2 {
                return false;
            }
            let min_x = ax.min(bx);
            let max_x = ax.max(bx);
            min_x < self.x2 && max_x > self.x1
        } else if (ax - bx).abs() < 0.001 {
            // Vertical segment
            let x = ax;
            if x < self.x1 || x > self.x2 {
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
    cost: f64,
    /// Direction of the segment leading to this node (for bend penalty).
    /// 0 = start, 1 = horizontal, 2 = vertical
    dir: u8,
}

impl PartialEq for PathNode {
    fn eq(&self, other: &Self) -> bool {
        self.cost == other.cost
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
        // Reverse ordering for min-heap
        other
            .cost
            .partial_cmp(&self.cost)
            .unwrap_or(Ordering::Equal)
    }
}

/// Discretize a coordinate for use as HashMap key.
fn grid_key(x: f64, y: f64) -> (i64, i64) {
    ((x * 100.0) as i64, (y * 100.0) as i64)
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
    _port_stub_length: f64,
) -> Vec<(f64, f64)> {
    // Trivial case: same point
    if (src.0 - tgt.0).abs() < 0.001 && (src.1 - tgt.1).abs() < 0.001 {
        return vec![src];
    }

    // If source and target share an axis, try direct line
    let obstacles = build_obstacles(nodes);

    if can_route_direct(&obstacles, src, tgt) {
        return if (src.0 - tgt.0).abs() < 0.001 || (src.1 - tgt.1).abs() < 0.001 {
            vec![src, tgt]
        } else {
            // One bend: go horizontal then vertical
            let mid = (tgt.0, src.1);
            if !segment_blocked(&obstacles, src.0, src.1, mid.0, mid.1)
                && !segment_blocked(&obstacles, mid.0, mid.1, tgt.0, tgt.1)
            {
                vec![src, mid, tgt]
            } else {
                let mid2 = (src.0, tgt.1);
                if !segment_blocked(&obstacles, src.0, src.1, mid2.0, mid2.1)
                    && !segment_blocked(&obstacles, mid2.0, mid2.1, tgt.0, tgt.1)
                {
                    vec![src, mid2, tgt]
                } else {
                    route_with_astar(&obstacles, src, tgt, bend_penalty)
                }
            }
        };
    }

    route_with_astar(&obstacles, src, tgt, bend_penalty)
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
    // Generate candidate waypoints from obstacle corners + src/tgt
    let mut candidates: Vec<(f64, f64)> = vec![src, tgt];

    for r in obstacles {
        // Add corner points (slightly outside the obstacle)
        candidates.push((r.x1, r.y1));
        candidates.push((r.x2, r.y1));
        candidates.push((r.x1, r.y2));
        candidates.push((r.x2, r.y2));
    }

    // Also add axis-aligned projections of src/tgt through obstacle corners
    for r in obstacles {
        candidates.push((src.0, r.y1));
        candidates.push((src.0, r.y2));
        candidates.push((r.x1, src.1));
        candidates.push((r.x2, src.1));
        candidates.push((tgt.0, r.y1));
        candidates.push((tgt.0, r.y2));
        candidates.push((r.x1, tgt.1));
        candidates.push((r.x2, tgt.1));
    }

    // Filter out candidates inside obstacles
    candidates.retain(|&(x, y)| !obstacles.iter().any(|r| r.contains(x, y)));

    // Deduplicate
    candidates.sort_by(|a, b| {
        a.0.partial_cmp(&b.0)
            .unwrap_or(Ordering::Equal)
            .then(a.1.partial_cmp(&b.1).unwrap_or(Ordering::Equal))
    });
    candidates.dedup_by(|a, b| (a.0 - b.0).abs() < 0.01 && (a.1 - b.1).abs() < 0.01);

    // A* search
    let src_key = grid_key(src.0, src.1);
    let tgt_key = grid_key(tgt.0, tgt.1);

    let mut heap = BinaryHeap::new();
    type GridKey = (i64, i64);
    // (cost, direction, predecessor)
    let mut best: HashMap<GridKey, (f64, u8, Option<GridKey>)> = HashMap::new();

    heap.push(PathNode {
        x: src.0,
        y: src.1,
        cost: 0.0,
        dir: 0,
    });
    best.insert(src_key, (0.0, 0, None));

    while let Some(current) = heap.pop() {
        let cur_key = grid_key(current.x, current.y);

        if cur_key == tgt_key {
            break;
        }

        if let Some(&(best_cost, _, _)) = best.get(&cur_key)
            && current.cost > best_cost + 0.001
        {
            continue;
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

            let new_cost = current.cost + dist + bend_cost;

            let is_better = match best.get(&c_key) {
                Some(&(prev_cost, _, _)) => new_cost < prev_cost - 0.001,
                None => true,
            };

            if is_better {
                best.insert(c_key, (new_cost, dir, Some(cur_key)));
                heap.push(PathNode {
                    x: cx,
                    y: cy,
                    cost: new_cost,
                    dir,
                });
            }
        }
    }

    // Reconstruct path
    let mut path = Vec::new();
    let mut key = tgt_key;

    loop {
        match best.get(&key) {
            Some(&(_, _, Some(prev))) => {
                // Find the point for this key
                let (x, y) = (key.0 as f64 / 100.0, key.1 as f64 / 100.0);
                path.push((x, y));
                key = prev;
            }
            _ => {
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

    path
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
        // Should have one bend (3 points)
        assert!(path.len() >= 2);
        // All segments orthogonal
        for w in path.windows(2) {
            let dx = (w[0].0 - w[1].0).abs();
            let dy = (w[0].1 - w[1].1).abs();
            assert!(
                dx < 0.1 || dy < 0.1,
                "non-orthogonal: ({},{})->({},{})",
                w[0].0,
                w[0].1,
                w[1].0,
                w[1].1
            );
        }
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

        // All segments orthogonal
        for w in path.windows(2) {
            let dx = (w[0].0 - w[1].0).abs();
            let dy = (w[0].1 - w[1].1).abs();
            assert!(dx < 0.1 || dy < 0.1, "non-orthogonal segment");
        }
    }

    #[test]
    fn all_segments_orthogonal() {
        let nodes = vec![
            make_node("A", 0.0, 0.0, 80.0, 40.0),
            make_node("B", 200.0, 0.0, 80.0, 40.0),
            make_node("C", 100.0, 100.0, 80.0, 40.0),
        ];
        let path = route_orthogonal(&nodes, (80.0, 20.0), (200.0, 120.0), 20.0, 10.0);

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
}
