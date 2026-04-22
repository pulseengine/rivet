//! Traceability matrix generation.
//!
//! Computes coverage between two artifact types via a specified link type.
//! For example: "which sw-reqs are verified by sw-verification measures?"

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
