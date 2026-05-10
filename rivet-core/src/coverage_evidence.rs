//! External coverage-evidence consumer.
//!
//! Mirrors the `results.rs` `ResultStore` pattern for branch / MC/DC /
//! line coverage evidence emitted by external tools (e.g. `witness`).
//! On-disk YAML schema is documented in:
//!
//! - upstream emitter: `pulseengine/witness/docs/research/rivet-evidence-consumer.md`
//! - schema URL: `https://pulseengine.eu/witness-rivet-evidence/v1`
//!
//! This is a **separate concept** from `coverage.rs`'s `CoverageReport`,
//! which models internal traceability-rule coverage. Evidence here is
//! per-(artifact, run) and arrives from outside the rivet artefact graph.

// SAFETY-REVIEW (SCRC Phase 1, DD-058): file-scope blanket allow,
// matching the convention established in `results.rs`. Migration to
// per-site allows is Phase 2 work.
#![allow(
    clippy::unwrap_used,
    clippy::expect_used,
    clippy::indexing_slicing,
    clippy::arithmetic_side_effects,
    clippy::as_conversions,
    clippy::cast_possible_truncation,
    clippy::cast_sign_loss,
    clippy::cast_precision_loss,
    clippy::wildcard_enum_match_arm,
    clippy::match_wildcard_for_single_variants,
    clippy::panic,
    clippy::todo,
    clippy::unimplemented,
    clippy::dbg_macro,
    clippy::print_stdout,
    clippy::print_stderr
)]

use std::path::{Path, PathBuf};

use serde::{Deserialize, Serialize};

/// Schema URL the on-disk YAML must advertise. Files with any other
/// `schema:` value are rejected by [`load_evidence`].
pub const SCHEMA_URL: &str = "https://pulseengine.eu/witness-rivet-evidence/v1";

/// Coverage measurement granularity.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum CoverageType {
    /// Per-branch coverage (witness v0.1+v0.2's per-`br_if`/per-arm/per-target).
    Branch,
    /// MC/DC condition decomposition (witness v0.2.1+ when DWARF is present).
    Mcdc,
    /// Source-line coverage (e.g. `wasmcov`-style projections).
    Line,
}

impl std::fmt::Display for CoverageType {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Branch => write!(f, "branch"),
            Self::Mcdc => write!(f, "mcdc"),
            Self::Line => write!(f, "line"),
        }
    }
}

/// One coverage entry — covers one artifact in one run.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CoverageEvidence {
    pub artifact: String,
    pub coverage_type: CoverageType,
    pub total: u64,
    pub covered: u64,
    pub percentage: f64,
    #[serde(default)]
    pub hits: Vec<u64>,
    #[serde(default)]
    pub uncovered_branch_ids: Vec<u32>,
}

impl CoverageEvidence {
    pub fn is_complete(&self) -> bool {
        self.total > 0 && self.covered == self.total
    }

    pub fn computed_percentage(&self) -> f64 {
        if self.total == 0 {
            100.0
        } else {
            (self.covered as f64 / self.total as f64) * 100.0
        }
    }
}

/// Reference to the module the coverage was measured on.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModuleRef {
    pub path: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub digest: Option<ModuleDigest>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModuleDigest {
    pub sha256: String,
}

/// Run metadata, mirroring `results::RunMetadata` for consistency.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RunMetadata {
    pub id: String,
    pub timestamp: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub source: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub environment: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub commit: Option<String>,
}

/// YAML file structure for a coverage run.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CoverageRunFile {
    pub schema: String,
    pub version: String,
    #[serde(default)]
    pub witness_version: Option<String>,
    pub run: RunMetadata,
    pub module: ModuleRef,
    pub evidence: Vec<CoverageEvidence>,
}

/// A loaded coverage run.
#[derive(Debug, Clone)]
pub struct CoverageRun {
    pub run: RunMetadata,
    pub module: ModuleRef,
    pub evidence: Vec<CoverageEvidence>,
    pub source_file: Option<PathBuf>,
}

/// Aggregate statistics over a `CoverageStore`.
#[derive(Debug, Clone, Default)]
pub struct CoverageSummary {
    pub total_runs: usize,
    pub total_artifacts: usize,
    pub total_branches: u64,
    pub covered_branches: u64,
}

impl CoverageSummary {
    pub fn percentage(&self) -> f64 {
        if self.total_branches == 0 {
            100.0
        } else {
            (self.covered_branches as f64 / self.total_branches as f64) * 100.0
        }
    }
}

/// In-memory collection of coverage runs, indexed for `latest_for` and
/// `history_for` lookups.
#[derive(Debug, Default)]
pub struct CoverageStore {
    runs: Vec<CoverageRun>,
}

impl CoverageStore {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn insert(&mut self, run: CoverageRun) {
        self.runs.push(run);
        self.runs
            .sort_by(|a, b| b.run.timestamp.cmp(&a.run.timestamp));
    }

    pub fn is_empty(&self) -> bool {
        self.runs.is_empty()
    }

    pub fn len(&self) -> usize {
        self.runs.len()
    }

    pub fn runs(&self) -> &[CoverageRun] {
        &self.runs
    }

    /// Latest coverage entry for a given artifact id.
    pub fn latest_for(&self, artifact_id: &str) -> Option<(&RunMetadata, &CoverageEvidence)> {
        for run in &self.runs {
            if let Some(ev) = run.evidence.iter().find(|e| e.artifact == artifact_id) {
                return Some((&run.run, ev));
            }
        }
        None
    }

    /// All coverage entries for a given artifact, newest first.
    pub fn history_for(&self, artifact_id: &str) -> Vec<(&RunMetadata, &CoverageEvidence)> {
        self.runs
            .iter()
            .filter_map(|run| {
                run.evidence
                    .iter()
                    .find(|e| e.artifact == artifact_id)
                    .map(|ev| (&run.run, ev))
            })
            .collect()
    }

    /// Aggregate summary computed from the latest run.
    pub fn summary(&self) -> CoverageSummary {
        let mut s = CoverageSummary {
            total_runs: self.runs.len(),
            ..Default::default()
        };
        if let Some(latest) = self.runs.first() {
            s.total_artifacts = latest.evidence.len();
            for e in &latest.evidence {
                s.total_branches += e.total;
                s.covered_branches += e.covered;
            }
        }
        s
    }
}

/// Load a single coverage YAML file. Rejects unknown `schema:` values.
pub fn load_evidence(path: &Path) -> Result<CoverageRun, crate::error::Error> {
    let content = std::fs::read_to_string(path)
        .map_err(|e| crate::error::Error::CoverageEvidence(format!("{}: {e}", path.display())))?;
    let file: CoverageRunFile = serde_yaml::from_str(&content)
        .map_err(|e| crate::error::Error::CoverageEvidence(format!("{}: {e}", path.display())))?;
    if file.schema != SCHEMA_URL {
        return Err(crate::error::Error::CoverageEvidence(format!(
            "{}: unknown schema `{}` (expected `{SCHEMA_URL}`)",
            path.display(),
            file.schema
        )));
    }
    Ok(CoverageRun {
        run: file.run,
        module: file.module,
        evidence: file.evidence,
        source_file: Some(path.to_path_buf()),
    })
}

/// Load all coverage YAML files from a directory. Files that fail to
/// parse are reported but do not abort the load — the rest of the
/// directory still becomes available. Files with the wrong schema URL
/// are skipped with a warning to stderr.
pub fn load_evidence_dir(dir: &Path) -> Result<Vec<CoverageRun>, crate::error::Error> {
    let mut runs = Vec::new();

    if !dir.exists() {
        return Ok(runs);
    }

    let mut entries: Vec<_> = std::fs::read_dir(dir)
        .map_err(|e| crate::error::Error::CoverageEvidence(format!("{}: {e}", dir.display())))?
        .filter_map(|e| e.ok())
        .filter(|e| {
            let p = e.path();
            matches!(p.extension().and_then(|x| x.to_str()), Some("yaml" | "yml"))
        })
        .collect();
    entries.sort_by_key(|e| e.path());

    for entry in entries {
        let path = entry.path();
        match load_evidence(&path) {
            Ok(run) => runs.push(run),
            Err(crate::error::Error::CoverageEvidence(msg)) => {
                eprintln!("warning: skipping coverage file: {msg}");
            }
            Err(other) => return Err(other),
        }
    }

    Ok(runs)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn make_run(id: &str, timestamp: &str, evidence: Vec<CoverageEvidence>) -> CoverageRun {
        CoverageRun {
            run: RunMetadata {
                id: id.to_string(),
                timestamp: timestamp.to_string(),
                source: None,
                environment: None,
                commit: None,
            },
            module: ModuleRef {
                path: "app.wasm".to_string(),
                digest: None,
            },
            evidence,
            source_file: None,
        }
    }

    fn ev(artifact: &str, total: u64, covered: u64) -> CoverageEvidence {
        CoverageEvidence {
            artifact: artifact.to_string(),
            coverage_type: CoverageType::Branch,
            total,
            covered,
            percentage: if total == 0 {
                100.0
            } else {
                (covered as f64 / total as f64) * 100.0
            },
            hits: vec![],
            uncovered_branch_ids: vec![],
        }
    }

    // rivet: verifies REQ-009
    #[test]
    fn coverage_type_display() {
        assert_eq!(CoverageType::Branch.to_string(), "branch");
        assert_eq!(CoverageType::Mcdc.to_string(), "mcdc");
        assert_eq!(CoverageType::Line.to_string(), "line");
    }

    // rivet: verifies REQ-009
    #[test]
    fn coverage_evidence_is_complete() {
        assert!(ev("A", 10, 10).is_complete());
        assert!(!ev("A", 10, 9).is_complete());
        assert!(!ev("A", 0, 0).is_complete());
    }

    // rivet: verifies REQ-009
    #[test]
    fn store_inserts_and_sorts_newest_first() {
        let mut store = CoverageStore::new();
        store.insert(make_run("r1", "2026-04-20T00:00:00Z", vec![]));
        store.insert(make_run("r2", "2026-04-25T00:00:00Z", vec![]));
        store.insert(make_run("r3", "2026-04-22T00:00:00Z", vec![]));
        assert_eq!(store.len(), 3);
        assert_eq!(store.runs()[0].run.id, "r2");
        assert_eq!(store.runs()[1].run.id, "r3");
        assert_eq!(store.runs()[2].run.id, "r1");
    }

    // rivet: verifies REQ-009
    #[test]
    fn latest_and_history_for() {
        let mut store = CoverageStore::new();
        store.insert(make_run("r1", "2026-04-20T00:00:00Z", vec![ev("A", 10, 5)]));
        store.insert(make_run(
            "r2",
            "2026-04-25T00:00:00Z",
            vec![ev("A", 10, 8), ev("B", 4, 4)],
        ));
        let (meta, e) = store.latest_for("A").unwrap();
        assert_eq!(meta.id, "r2");
        assert_eq!(e.covered, 8);
        let history = store.history_for("A");
        assert_eq!(history.len(), 2);
        assert_eq!(history[0].0.id, "r2");
        assert_eq!(history[1].0.id, "r1");
        assert!(store.latest_for("nonexistent").is_none());
    }

    // rivet: verifies REQ-009
    #[test]
    fn summary_aggregates_latest_run() {
        let mut store = CoverageStore::new();
        store.insert(make_run(
            "r-old",
            "2026-04-20T00:00:00Z",
            vec![ev("A", 100, 50)],
        ));
        store.insert(make_run(
            "r-new",
            "2026-04-25T00:00:00Z",
            vec![ev("A", 10, 8), ev("B", 4, 4)],
        ));
        let s = store.summary();
        assert_eq!(s.total_runs, 2);
        assert_eq!(s.total_artifacts, 2);
        assert_eq!(s.total_branches, 14);
        assert_eq!(s.covered_branches, 12);
        let pct = s.percentage();
        assert!((pct - (12.0 / 14.0 * 100.0)).abs() < 1e-9);
    }

    // rivet: verifies REQ-009
    #[test]
    fn load_evidence_round_trips() {
        let dir = std::env::temp_dir().join("rivet_test_cov_evidence_roundtrip");
        let _ = std::fs::create_dir_all(&dir);
        let path = dir.join("ev.yaml");
        let yaml = format!(
            "schema: {SCHEMA_URL}\n\
             version: '1.0'\n\
             witness_version: '0.3.0'\n\
             run:\n\
            \x20 id: r1\n\
            \x20 timestamp: '2026-04-25T00:00:00Z'\n\
             module:\n\
            \x20 path: app.wasm\n\
             evidence:\n\
            \x20 - artifact: REQ-001\n\
            \x20   coverage_type: branch\n\
            \x20   total: 4\n\
            \x20   covered: 3\n\
            \x20   percentage: 75.0\n\
            \x20   hits: [1, 0, 2, 1]\n\
            \x20   uncovered_branch_ids: [1]\n"
        );
        std::fs::write(&path, yaml).unwrap();
        let run = load_evidence(&path).unwrap();
        assert_eq!(run.run.id, "r1");
        assert_eq!(run.evidence.len(), 1);
        assert_eq!(run.evidence[0].artifact, "REQ-001");
        assert_eq!(run.evidence[0].covered, 3);
        let _ = std::fs::remove_dir_all(&dir);
    }

    // rivet: verifies REQ-009
    #[test]
    fn load_evidence_rejects_unknown_schema() {
        let dir = std::env::temp_dir().join("rivet_test_cov_evidence_bad_schema");
        let _ = std::fs::create_dir_all(&dir);
        let path = dir.join("ev.yaml");
        let yaml = "schema: https://example.com/other/v1\n\
                    version: '1.0'\n\
                    run:\n  id: r1\n  timestamp: '2026-04-25T00:00:00Z'\n\
                    module:\n  path: app.wasm\n\
                    evidence: []\n";
        std::fs::write(&path, yaml).unwrap();
        let result = load_evidence(&path);
        assert!(matches!(
            result,
            Err(crate::error::Error::CoverageEvidence(_))
        ));
        let _ = std::fs::remove_dir_all(&dir);
    }

    // rivet: verifies REQ-009
    #[test]
    fn load_dir_skips_unknown_schema_files() {
        let dir = std::env::temp_dir().join("rivet_test_cov_evidence_mixed_dir");
        let _ = std::fs::remove_dir_all(&dir);
        std::fs::create_dir_all(&dir).unwrap();

        // valid file
        let valid = format!(
            "schema: {SCHEMA_URL}\nversion: '1.0'\n\
             run:\n  id: r1\n  timestamp: '2026-04-25T00:00:00Z'\n\
             module:\n  path: a.wasm\n\
             evidence: []\n"
        );
        std::fs::write(dir.join("a.yaml"), valid).unwrap();

        // wrong-schema file
        let wrong = "schema: https://example.com/wrong/v1\nversion: '1.0'\n\
                     run:\n  id: r2\n  timestamp: '2026-04-25T00:00:00Z'\n\
                     module:\n  path: b.wasm\n\
                     evidence: []\n";
        std::fs::write(dir.join("b.yaml"), wrong).unwrap();

        let runs = load_evidence_dir(&dir).unwrap();
        assert_eq!(runs.len(), 1);
        assert_eq!(runs[0].run.id, "r1");

        let _ = std::fs::remove_dir_all(&dir);
    }

    // rivet: verifies REQ-009
    #[test]
    fn load_dir_nonexistent_returns_empty() {
        let dir = std::env::temp_dir().join("rivet_test_cov_evidence_nonexistent");
        let _ = std::fs::remove_dir_all(&dir);
        let runs = load_evidence_dir(&dir).unwrap();
        assert!(runs.is_empty());
    }

    // ── Mutation-pinning tests ─────────────────────────────────────────
    //
    // These tests pin specific surviving mutants reported by
    // `cargo mutants -p rivet-core --file rivet-core/src/coverage_evidence.rs`.
    // Each test asserts a value that the mutant cannot satisfy.

    // rivet: verifies REQ-009
    // Kills:
    //   coverage_evidence.rs:86:9 replace computed_percentage -> 0.0
    //   coverage_evidence.rs:86:9 replace computed_percentage -> 1.0
    //   coverage_evidence.rs:86:9 replace computed_percentage -> -1.0
    //   coverage_evidence.rs:89:55 replace * with + in computed_percentage
    //   coverage_evidence.rs:89:55 replace * with / in computed_percentage
    //   coverage_evidence.rs:89:34 replace / with % in computed_percentage
    //   coverage_evidence.rs:89:34 replace / with * in computed_percentage
    #[test]
    fn computed_percentage_partial_value() {
        // 3/4 = 0.75 ; * 100 = 75.0 — distinguishes:
        //   const 0.0 / 1.0 / -1.0 (none equal 75.0)
        //   * with +  → 0.75 + 100  = 100.75    (≠ 75.0)
        //   * with /  → 0.75 / 100  = 0.0075    (≠ 75.0)
        //   / with %  → 3 % 4 = 3 → 3.0 * 100 = 300.0 (≠ 75.0)
        //   / with *  → 3 * 4 = 12 → 12.0 * 100 = 1200.0 (≠ 75.0)
        let e = ev("X", 4, 3);
        let p = e.computed_percentage();
        assert!(
            (p - 75.0).abs() < 1e-9,
            "computed_percentage(4,3) = {p}, expected 75.0",
        );
    }

    // rivet: verifies REQ-009
    // Kills: coverage_evidence.rs:86:23 replace == with != in computed_percentage
    #[test]
    fn computed_percentage_total_zero_returns_one_hundred() {
        // total == 0 branch: must return exactly 100.0.
        // Mutant `!=` flips the branch and would compute (0/0)*100 = NaN.
        let e = ev("Y", 0, 0);
        let p = e.computed_percentage();
        assert!(
            (p - 100.0).abs() < f64::EPSILON,
            "computed_percentage(0,0) = {p}, expected 100.0",
        );
    }

    // rivet: verifies REQ-009
    // Kills: coverage_evidence.rs:86:23 replace == with != in computed_percentage
    //   (companion to the total==0 case — confirms total>0 path runs)
    #[test]
    fn computed_percentage_total_nonzero_full_coverage() {
        // total > 0 branch must NOT short-circuit to 100.0 unconditionally;
        // this case happens to also be 100.0 but goes through the math
        // path. Combined with the partial test above, the 100.0 const
        // mutants are killed.
        let e = ev("Z", 5, 5);
        assert!((e.computed_percentage() - 100.0).abs() < f64::EPSILON);
    }

    // rivet: verifies REQ-009
    // Kills:
    //   coverage_evidence.rs:179:9 replace CoverageStore::is_empty -> true
    //   coverage_evidence.rs:179:9 replace CoverageStore::is_empty -> false
    #[test]
    fn coverage_store_is_empty_true_on_new() {
        // Mutant `false`: empty store would report non-empty.
        let store = CoverageStore::new();
        assert!(store.is_empty());
    }

    // rivet: verifies REQ-009
    #[test]
    fn coverage_store_is_empty_false_after_insert() {
        // Mutant `true`: a populated store would report empty.
        let mut store = CoverageStore::new();
        store.insert(make_run("r1", "2026-04-25T00:00:00Z", vec![]));
        assert!(!store.is_empty());
    }
}
