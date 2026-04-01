//! Project snapshot for baseline comparison and delta tracking.
//!
//! A snapshot captures the full project state (stats, coverage, diagnostics)
//! at a point in time, tagged with git commit info. Used for:
//! - `rivet snapshot diff` to compare current vs baseline
//! - `delta=BASELINE` option on embeds to show changes
//! - CI workflows to post PR delta comments

use std::collections::BTreeMap;

use serde::{Deserialize, Serialize};

use crate::coverage::{self, CoverageReport};
use crate::links::LinkGraph;
use crate::schema::Schema;
use crate::store::Store;
use crate::validate::{self, Diagnostic};

// ── Snapshot format ─────────────────────────────────────────────────────

/// Schema version for forward compatibility (SC-EMBED-6).
pub const SCHEMA_VERSION: u32 = 1;

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
    pub overall: f64,
    pub rules: Vec<CoverageRuleData>,
}

/// A single coverage rule entry in a snapshot.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CoverageRuleData {
    pub rule: String,
    pub source_type: String,
    pub covered: usize,
    pub total: usize,
    pub percentage: f64,
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
            percentage: e.percentage(),
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
            overall: coverage_report.overall_coverage(),
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
    pub overall: f64,
    pub rules: Vec<CoverageRuleDelta>,
}

#[derive(Debug, Clone, Serialize)]
pub struct CoverageRuleDelta {
    pub rule: String,
    pub covered: isize,
    pub total: isize,
    pub percentage: f64,
}

#[derive(Debug, Clone, Serialize)]
pub struct DiagnosticsDelta {
    pub errors: isize,
    pub warnings: isize,
    pub new_count: usize,
    pub resolved_count: usize,
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
                percentage: r.percentage - base.map_or(0.0, |b| b.percentage),
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
            overall: current.coverage.overall - baseline.coverage.overall,
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

    #[test]
    fn delta_empty_snapshots() {
        let store = Store::new();
        let schema = Schema::merge(&[]);
        let graph = LinkGraph::build(&store, &schema);
        let snap = capture(&store, &schema, &graph, &dummy_git());

        let delta = compute_delta(&snap, &snap);
        assert_eq!(delta.stats.total, 0);
        assert_eq!(delta.coverage.overall, 0.0);
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
