//! Project snapshot for baseline comparison and delta tracking.
//!
//! A snapshot captures the full project state (stats, coverage, diagnostics)
//! at a point in time, tagged with git commit info. Used for:
//! - `rivet snapshot diff` to compare current vs baseline
//! - `delta=BASELINE` option on embeds to show changes
//! - CI workflows to post PR delta comments

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

use std::collections::BTreeMap;

use serde::{Deserialize, Serialize};

use crate::coverage::{self, CoverageReport};
use crate::links::LinkGraph;
use crate::schema::Schema;
use crate::store::Store;
use crate::validate::{self, Diagnostic};

// ── Snapshot format ─────────────────────────────────────────────────────

/// Schema version for forward compatibility (SC-EMBED-6).
/// v2 (REQ-400): coverage percentages are `null` for an empty scope instead
/// of 100. v1 snapshots still read; their recorded 100 stays as recorded.
pub const SCHEMA_VERSION: u32 = 2;

/// A full project snapshot for baseline comparison.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Snapshot {
    pub rivet_version: String,
    pub schema_version: u32,
    pub created_at: String,
    pub git_commit: String,
    pub git_commit_short: String,
    pub git_tag: Option<String>,
    pub git_dirty: bool,
    pub stats: StatsData,
    pub coverage: CoverageData,
    pub diagnostics: DiagnosticsData,
}

/// Artifact statistics captured in a snapshot.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StatsData {
    pub total: usize,
    pub by_type: BTreeMap<String, usize>,
    pub by_status: BTreeMap<String, usize>,
}

/// Coverage data captured in a snapshot.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CoverageData {
    /// `None` (JSON `null`) when nothing is in scope (REQ-400): the same
    /// "n/a" every other surface reports, not a green 100.
    pub overall: Option<f64>,
    pub rules: Vec<CoverageRuleData>,
}

/// A single coverage rule entry in a snapshot.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CoverageRuleData {
    pub rule: String,
    pub source_type: String,
    pub covered: usize,
    pub total: usize,
    /// `None` when the rule has nothing to score (REQ-400).
    pub percentage: Option<f64>,
}

/// Diagnostics data captured in a snapshot.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DiagnosticsData {
    pub errors: usize,
    pub warnings: usize,
    pub infos: usize,
    pub items: Vec<DiagnosticItem>,
}

/// A single diagnostic entry in a snapshot.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DiagnosticItem {
    pub severity: String,
    pub artifact_id: Option<String>,
    pub rule: String,
    pub message: String,
}

// ── Capture ─────────────────────────────────────────────────────────────

/// Git info for snapshot creation.
pub struct GitContext {
    pub commit: String,
    pub commit_short: String,
    pub tag: Option<String>,
    pub dirty: bool,
}

/// Capture a snapshot from the current project state.
pub fn capture(store: &Store, schema: &Schema, graph: &LinkGraph, git: &GitContext) -> Snapshot {
    let diagnostics_vec = validate::validate(store, schema, graph);
    let coverage_report = coverage::compute_coverage(store, schema, graph);

    capture_with_data(store, &diagnostics_vec, &coverage_report, git)
}

/// Capture a snapshot with pre-computed diagnostics and coverage.
pub fn capture_with_data(
    store: &Store,
    diagnostics: &[Diagnostic],
    coverage_report: &CoverageReport,
    git: &GitContext,
) -> Snapshot {
    // Stats
    let mut by_type = BTreeMap::new();
    for art in store.iter() {
        *by_type.entry(art.artifact_type.clone()).or_insert(0usize) += 1;
    }
    let mut by_status = BTreeMap::new();
    for art in store.iter() {
        let key = art.status.as_deref().unwrap_or("unset").to_string();
        *by_status.entry(key).or_insert(0usize) += 1;
    }

    // Coverage
    let rules: Vec<CoverageRuleData> = coverage_report
        .entries
        .iter()
        .map(|e| CoverageRuleData {
            rule: e.rule_name.clone(),
            source_type: e.source_type.clone(),
            covered: e.covered,
            total: e.total,
            percentage: e.percentage_opt(),
        })
        .collect();

    // Diagnostics
    let errors = diagnostics
        .iter()
        .filter(|d| d.severity == crate::schema::Severity::Error)
        .count();
    let warnings = diagnostics
        .iter()
        .filter(|d| d.severity == crate::schema::Severity::Warning)
        .count();
    let infos = diagnostics
        .iter()
        .filter(|d| d.severity == crate::schema::Severity::Info)
        .count();
    let items: Vec<DiagnosticItem> = diagnostics
        .iter()
        .map(|d| DiagnosticItem {
            severity: format!("{:?}", d.severity).to_lowercase(),
            artifact_id: d.artifact_id.clone(),
            rule: d.rule.clone(),
            message: d.message.clone(),
        })
        .collect();

    // Timestamp
    let created_at = crate::embed::epoch_to_iso8601();

    Snapshot {
        rivet_version: env!("CARGO_PKG_VERSION").to_string(),
        schema_version: SCHEMA_VERSION,
        created_at,
        git_commit: git.commit.clone(),
        git_commit_short: git.commit_short.clone(),
        git_tag: git.tag.clone(),
        git_dirty: git.dirty,
        stats: StatsData {
            total: store.len(),
            by_type,
            by_status,
        },
        coverage: CoverageData {
            overall: coverage_report.overall_coverage_opt(),
            rules,
        },
        diagnostics: DiagnosticsData {
            errors,
            warnings,
            infos,
            items,
        },
    }
}

// ── Delta computation ───────────────────────────────────────────────────

/// Delta between two snapshots.
#[derive(Debug, Clone, Serialize)]
pub struct SnapshotDelta {
    pub baseline_commit: String,
    pub current_commit: String,
    pub stats: StatsDelta,
    pub coverage: CoverageDelta,
    pub diagnostics: DiagnosticsDelta,
}

#[derive(Debug, Clone, Serialize)]
pub struct StatsDelta {
    pub total: isize,
    pub by_type: BTreeMap<String, isize>,
}

#[derive(Debug, Clone, Serialize)]
pub struct CoverageDelta {
    /// `None` when either side has nothing in scope: there is no change to
    /// report against an empty scope (REQ-400).
    pub overall: Option<f64>,
    pub rules: Vec<CoverageRuleDelta>,
}

#[derive(Debug, Clone, Serialize)]
pub struct CoverageRuleDelta {
    pub rule: String,
    pub covered: isize,
    pub total: isize,
    /// `None` when either side has nothing to score (REQ-400).
    pub percentage: Option<f64>,
}

#[derive(Debug, Clone, Serialize)]
pub struct DiagnosticsDelta {
    pub errors: isize,
    pub warnings: isize,
    pub new_count: usize,
    pub resolved_count: usize,
}

/// The change between two coverage percentages; `None` when either has
/// nothing in scope (REQ-400).
fn percentage_delta(current: Option<f64>, baseline: Option<f64>) -> Option<f64> {
    Some(current? - baseline?)
}

/// Compute the delta between a baseline snapshot and the current snapshot.
pub fn compute_delta(baseline: &Snapshot, current: &Snapshot) -> SnapshotDelta {
    // Stats delta
    let mut by_type = BTreeMap::new();
    for (t, &count) in &current.stats.by_type {
        let base = baseline.stats.by_type.get(t).copied().unwrap_or(0) as isize;
        by_type.insert(t.clone(), count as isize - base);
    }
    for (t, &count) in &baseline.stats.by_type {
        by_type.entry(t.clone()).or_insert(-(count as isize));
    }

    // Coverage delta
    let coverage_rules: Vec<CoverageRuleDelta> = current
        .coverage
        .rules
        .iter()
        .map(|r| {
            let base = baseline.coverage.rules.iter().find(|b| b.rule == r.rule);
            CoverageRuleDelta {
                rule: r.rule.clone(),
                covered: r.covered as isize - base.map_or(0, |b| b.covered as isize),
                total: r.total as isize - base.map_or(0, |b| b.total as isize),
                // A rule the baseline lacks counts from 0, as before.
                percentage: percentage_delta(
                    r.percentage,
                    base.map_or(Some(0.0), |b| b.percentage),
                ),
            }
        })
        .collect();

    // Diagnostics delta — count NEW and RESOLVED
    let baseline_keys: std::collections::HashSet<_> = baseline
        .diagnostics
        .items
        .iter()
        .map(|d| (&d.artifact_id, &d.rule, &d.message))
        .collect();
    let current_keys: std::collections::HashSet<_> = current
        .diagnostics
        .items
        .iter()
        .map(|d| (&d.artifact_id, &d.rule, &d.message))
        .collect();

    let new_count = current_keys.difference(&baseline_keys).count();
    let resolved_count = baseline_keys.difference(&current_keys).count();

    SnapshotDelta {
        baseline_commit: baseline.git_commit_short.clone(),
        current_commit: current.git_commit_short.clone(),
        stats: StatsDelta {
            total: current.stats.total as isize - baseline.stats.total as isize,
            by_type,
        },
        coverage: CoverageDelta {
            overall: percentage_delta(current.coverage.overall, baseline.coverage.overall),
            rules: coverage_rules,
        },
        diagnostics: DiagnosticsDelta {
            errors: current.diagnostics.errors as isize - baseline.diagnostics.errors as isize,
            warnings: current.diagnostics.warnings as isize
                - baseline.diagnostics.warnings as isize,
            new_count,
            resolved_count,
        },
    }
}

// ── I/O ─────────────────────────────────────────────────────────────────

/// Write a snapshot to a JSON file.
pub fn write_to_file(snapshot: &Snapshot, path: &std::path::Path) -> Result<(), String> {
    let json =
        serde_json::to_string_pretty(snapshot).map_err(|e| format!("serializing snapshot: {e}"))?;
    if let Some(parent) = path.parent() {
        std::fs::create_dir_all(parent)
            .map_err(|e| format!("creating directory {}: {e}", parent.display()))?;
    }
    std::fs::write(path, json).map_err(|e| format!("writing {}: {e}", path.display()))
}

/// Read a snapshot from a JSON file.
pub fn read_from_file(path: &std::path::Path) -> Result<Snapshot, String> {
    let content =
        std::fs::read_to_string(path).map_err(|e| format!("reading {}: {e}", path.display()))?;
    serde_json::from_str(&content).map_err(|e| format!("parsing {}: {e}", path.display()))
}

// ── Tests ───────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;

    fn dummy_git() -> GitContext {
        GitContext {
            commit: "abc1234def5678".to_string(),
            commit_short: "abc1234".to_string(),
            tag: Some("v0.3.0".to_string()),
            dirty: false,
        }
    }

    #[test]
    fn capture_empty_snapshot() {
        let store = Store::new();
        let schema = Schema::merge(&[]);
        let graph = LinkGraph::build(&store, &schema);
        let snap = capture(&store, &schema, &graph, &dummy_git());

        assert_eq!(snap.schema_version, SCHEMA_VERSION);
        assert_eq!(snap.git_commit_short, "abc1234");
        assert_eq!(snap.stats.total, 0);
        assert_eq!(snap.diagnostics.errors, 0);
    }

    #[test]
    fn snapshot_roundtrip_json() {
        let store = Store::new();
        let schema = Schema::merge(&[]);
        let graph = LinkGraph::build(&store, &schema);
        let snap = capture(&store, &schema, &graph, &dummy_git());

        let json = serde_json::to_string(&snap).unwrap();
        let parsed: Snapshot = serde_json::from_str(&json).unwrap();

        assert_eq!(parsed.schema_version, snap.schema_version);
        assert_eq!(parsed.git_commit, snap.git_commit);
        assert_eq!(parsed.stats.total, snap.stats.total);
    }

    // rivet: verifies REQ-400
    /// v2: an empty scope is stored as null, not 100, and serializes so.
    #[test]
    fn empty_scope_coverage_is_null_not_100() {
        let store = Store::new();
        let schema = Schema::merge(&[]);
        let graph = LinkGraph::build(&store, &schema);
        let snap = capture(&store, &schema, &graph, &dummy_git());
        assert_eq!(snap.schema_version, 2);
        assert_eq!(snap.coverage.overall, None);
        let json = serde_json::to_value(&snap).unwrap();
        assert!(json["coverage"]["overall"].is_null(), "{json}");
    }

    // rivet: verifies REQ-400
    /// A delta against a side with nothing in scope is null; two scored sides
    /// subtract; a rule the baseline lacks counts from 0.
    #[test]
    fn coverage_deltas_are_null_against_an_empty_scope() {
        let store = Store::new();
        let schema = Schema::merge(&[]);
        let graph = LinkGraph::build(&store, &schema);
        let base = capture(&store, &schema, &graph, &dummy_git());
        let rule = |pct: Option<f64>| CoverageRuleData {
            rule: "r".into(),
            source_type: "requirement".into(),
            covered: 1,
            total: 2,
            percentage: pct,
        };
        let mut scored = base.clone();
        scored.coverage.overall = Some(50.0);
        scored.coverage.rules = vec![rule(Some(50.0))];

        let from_empty = compute_delta(&base, &scored);
        assert_eq!(from_empty.coverage.overall, None);
        assert_eq!(
            from_empty.coverage.rules[0].percentage,
            Some(50.0),
            "new rule counts from 0"
        );

        let mut later = scored.clone();
        later.coverage.overall = Some(75.0);
        later.coverage.rules = vec![CoverageRuleData {
            covered: 3,
            total: 4,
            ..rule(Some(75.0))
        }];
        let d = compute_delta(&scored, &later);
        assert_eq!(d.coverage.overall, Some(25.0));
        assert_eq!(d.coverage.rules[0].percentage, Some(25.0));
        assert_eq!(d.coverage.rules[0].covered, 2, "3 - 1");
        assert_eq!(d.coverage.rules[0].total, 2, "4 - 2");

        let mut emptied = later.clone();
        emptied.coverage.rules = vec![rule(None)];
        assert_eq!(
            compute_delta(&later, &emptied).coverage.rules[0].percentage,
            None
        );
    }

    // rivet: verifies REQ-400
    /// v1 snapshots (a number, 100 for an empty scope) still read.
    #[test]
    fn v1_snapshot_with_a_numeric_overall_still_reads() {
        let store = Store::new();
        let schema = Schema::merge(&[]);
        let graph = LinkGraph::build(&store, &schema);
        let mut json =
            serde_json::to_value(capture(&store, &schema, &graph, &dummy_git())).unwrap();
        json["schema_version"] = serde_json::json!(1);
        json["coverage"]["overall"] = serde_json::json!(100.0);
        let parsed: Snapshot = serde_json::from_value(json).unwrap();
        assert_eq!(parsed.schema_version, 1);
        assert_eq!(
            parsed.coverage.overall,
            Some(100.0),
            "recorded value stays as recorded"
        );
    }

    #[test]
    fn delta_empty_snapshots() {
        let store = Store::new();
        let schema = Schema::merge(&[]);
        let graph = LinkGraph::build(&store, &schema);
        let snap = capture(&store, &schema, &graph, &dummy_git());

        let delta = compute_delta(&snap, &snap);
        assert_eq!(delta.stats.total, 0);
        // REQ-400: nothing in scope on either side, so no coverage change.
        assert_eq!(delta.coverage.overall, None);
        assert_eq!(delta.diagnostics.new_count, 0);
        assert_eq!(delta.diagnostics.resolved_count, 0);
    }

    #[test]
    fn snapshot_records_git_dirty(/* SC-EMBED-2 */) {
        let store = Store::new();
        let schema = Schema::merge(&[]);
        let graph = LinkGraph::build(&store, &schema);
        let mut git = dummy_git();
        git.dirty = true;
        let snap = capture(&store, &schema, &graph, &git);
        assert!(
            snap.git_dirty,
            "snapshot must record dirty tree (SC-EMBED-2)"
        );
    }

    #[test]
    fn snapshot_schema_version_set(/* SC-EMBED-6 */) {
        let store = Store::new();
        let schema = Schema::merge(&[]);
        let graph = LinkGraph::build(&store, &schema);
        let snap = capture(&store, &schema, &graph, &dummy_git());
        assert_eq!(
            snap.schema_version, SCHEMA_VERSION,
            "must include schema_version (SC-EMBED-6)"
        );
    }
}
