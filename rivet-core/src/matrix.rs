//! Traceability matrix generation.
//!
//! Computes coverage between two artifact types via a specified link type.
//! For example: "which sw-reqs are verified by sw-verification measures?"

use crate::links::LinkGraph;
use crate::store::Store;

/// A single row in the traceability matrix.
#[derive(Debug)]
pub struct MatrixRow {
    pub source_id: String,
    pub source_title: String,
    pub targets: Vec<MatrixTarget>,
}

#[derive(Debug)]
pub struct MatrixTarget {
    pub id: String,
    pub title: String,
}

/// Result of a traceability matrix computation.
#[derive(Debug)]
pub struct TraceabilityMatrix {
    pub source_type: String,
    pub target_type: String,
    pub link_type: String,
    pub rows: Vec<MatrixRow>,
    pub covered: usize,
    pub total: usize,
}

impl TraceabilityMatrix {
    pub fn coverage_pct(&self) -> f64 {
        if self.total == 0 {
            100.0
        } else {
            (self.covered as f64 / self.total as f64) * 100.0
        }
    }
}

/// Compute a traceability matrix: for each artifact of `source_type`,
/// find all artifacts of `target_type` linked via `link_type`.
///
/// If `direction` is Forward, look at forward links from source.
/// If `direction` is Backward, look at backlinks to source (i.e.,
/// which `target_type` artifacts link TO the source).
pub fn compute_matrix(
    store: &Store,
    graph: &LinkGraph,
    source_type: &str,
    target_type: &str,
    link_type: &str,
    direction: Direction,
) -> TraceabilityMatrix {
    let source_ids = store.by_type(source_type);
    let mut rows = Vec::new();
    let mut covered = 0;

    for id in source_ids {
        let Some(artifact) = store.get(id) else {
            continue;
        };
        let targets: Vec<MatrixTarget> = match direction {
            Direction::Forward => graph
                .links_from(id)
                .iter()
                .filter(|l| l.link_type == link_type)
                .filter_map(|l| {
                    let t = store.get(&l.target)?;
                    (t.artifact_type == target_type).then(|| MatrixTarget {
                        id: t.id.clone(),
                        title: t.title.clone(),
                    })
                })
                .collect(),
            Direction::Backward => graph
                .backlinks_to(id)
                .iter()
                .filter(|bl| bl.link_type == link_type)
                .filter_map(|bl| {
                    let s = store.get(&bl.source)?;
                    (s.artifact_type == target_type).then(|| MatrixTarget {
                        id: s.id.clone(),
                        title: s.title.clone(),
                    })
                })
                .collect(),
        };

        if !targets.is_empty() {
            covered += 1;
        }

        rows.push(MatrixRow {
            source_id: id.clone(),
            source_title: artifact.title.clone(),
            targets,
        });
    }

    let total = rows.len();

    TraceabilityMatrix {
        source_type: source_type.to_string(),
        target_type: target_type.to_string(),
        link_type: link_type.to_string(),
        rows,
        covered,
        total,
    }
}

#[derive(Debug, Clone, Copy)]
pub enum Direction {
    /// Source artifact has forward links to target.
    Forward,
    /// Target artifacts have links pointing at source (backlink).
    Backward,
}
