//! Test run results model and loader.
//!
//! Results are stored as YAML files, each representing a single test run
//! with per-artifact pass/fail/skip results.

use std::path::{Path, PathBuf};

use serde::{Deserialize, Serialize};

/// Outcome of a single test.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum TestStatus {
    Pass,
    Fail,
    Skip,
    Error,
    Blocked,
}

impl TestStatus {
    pub fn is_pass(&self) -> bool {
        matches!(self, Self::Pass)
    }
    pub fn is_fail(&self) -> bool {
        matches!(self, Self::Fail | Self::Error)
    }
}

impl std::fmt::Display for TestStatus {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Pass => write!(f, "pass"),
            Self::Fail => write!(f, "fail"),
            Self::Skip => write!(f, "skip"),
            Self::Error => write!(f, "error"),
            Self::Blocked => write!(f, "blocked"),
        }
    }
}

/// A single test result for one artifact in a run.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TestResult {
    /// The artifact ID this result is for (e.g., "UVER-1").
    pub artifact: String,
    pub status: TestStatus,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub duration: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub message: Option<String>,
}

/// Metadata for a test run.
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

/// YAML file structure for a test run.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TestRunFile {
    pub run: RunMetadata,
    pub results: Vec<TestResult>,
}

/// A loaded test run.
#[derive(Debug, Clone)]
pub struct TestRun {
    pub run: RunMetadata,
    pub results: Vec<TestResult>,
    pub source_file: Option<PathBuf>,
}

/// Aggregate statistics for a result set.
#[derive(Debug, Clone, Default)]
pub struct ResultSummary {
    pub total_runs: usize,
    pub total_results: usize,
    pub pass_count: usize,
    pub fail_count: usize,
    pub skip_count: usize,
    pub error_count: usize,
    pub blocked_count: usize,
}

impl ResultSummary {
    pub fn pass_rate(&self) -> f64 {
        if self.total_results == 0 {
            return 0.0;
        }
        (self.pass_count as f64 / self.total_results as f64) * 100.0
    }
}

/// In-memory collection of test runs.
#[derive(Debug, Default)]
pub struct ResultStore {
    runs: Vec<TestRun>,
}

impl ResultStore {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn insert(&mut self, run: TestRun) {
        self.runs.push(run);
        // Keep sorted by timestamp descending (newest first)
        self.runs
            .sort_by(|a, b| b.run.timestamp.cmp(&a.run.timestamp));
    }

    pub fn is_empty(&self) -> bool {
        self.runs.is_empty()
    }

    pub fn len(&self) -> usize {
        self.runs.len()
    }

    /// All runs, sorted newest first.
    pub fn runs(&self) -> &[TestRun] {
        &self.runs
    }

    /// Get a specific run by ID.
    pub fn get_run(&self, run_id: &str) -> Option<&TestRun> {
        self.runs.iter().find(|r| r.run.id == run_id)
    }

    /// Latest result for a given artifact ID across all runs.
    /// Returns the run metadata and the test result.
    pub fn latest_for(&self, artifact_id: &str) -> Option<(&RunMetadata, &TestResult)> {
        // runs are sorted newest first, so first match is latest
        for run in &self.runs {
            if let Some(result) = run.results.iter().find(|r| r.artifact == artifact_id) {
                return Some((&run.run, result));
            }
        }
        None
    }

    /// All results for a specific artifact across all runs (newest first).
    pub fn history_for(&self, artifact_id: &str) -> Vec<(&RunMetadata, &TestResult)> {
        self.runs
            .iter()
            .filter_map(|run| {
                run.results
                    .iter()
                    .find(|r| r.artifact == artifact_id)
                    .map(|result| (&run.run, result))
            })
            .collect()
    }

    /// Aggregate summary across all runs.
    pub fn summary(&self) -> ResultSummary {
        let mut s = ResultSummary {
            total_runs: self.runs.len(),
            ..Default::default()
        };
        // Count from the latest run only for overall stats
        if let Some(latest) = self.runs.first() {
            for r in &latest.results {
                s.total_results += 1;
                match r.status {
                    TestStatus::Pass => s.pass_count += 1,
                    TestStatus::Fail => s.fail_count += 1,
                    TestStatus::Skip => s.skip_count += 1,
                    TestStatus::Error => s.error_count += 1,
                    TestStatus::Blocked => s.blocked_count += 1,
                }
            }
        }
        s
    }
}

/// Load all test run YAML files from a directory.
pub fn load_results(dir: &Path) -> anyhow::Result<Vec<TestRun>> {
    let mut runs = Vec::new();

    if !dir.exists() {
        return Ok(runs);
    }

    let mut entries: Vec<_> = std::fs::read_dir(dir)?
        .filter_map(|e| e.ok())
        .filter(|e| {
            let p = e.path();
            matches!(p.extension().and_then(|x| x.to_str()), Some("yaml" | "yml"))
        })
        .collect();
    entries.sort_by_key(|e| e.path());

    for entry in entries {
        let path = entry.path();
        let content = std::fs::read_to_string(&path)?;
        let file: TestRunFile = serde_yaml::from_str(&content)
            .map_err(|e| anyhow::anyhow!("{}: {e}", path.display()))?;
        runs.push(TestRun {
            run: file.run,
            results: file.results,
            source_file: Some(path),
        });
    }

    Ok(runs)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn make_run(id: &str, timestamp: &str, results: Vec<TestResult>) -> TestRun {
        TestRun {
            run: RunMetadata {
                id: id.to_string(),
                timestamp: timestamp.to_string(),
                source: None,
                environment: None,
                commit: None,
            },
            results,
            source_file: None,
        }
    }

    fn make_result(artifact: &str, status: TestStatus) -> TestResult {
        TestResult {
            artifact: artifact.to_string(),
            status,
            duration: None,
            message: None,
        }
    }

    #[test]
    fn test_status_display() {
        assert_eq!(TestStatus::Pass.to_string(), "pass");
        assert_eq!(TestStatus::Fail.to_string(), "fail");
        assert_eq!(TestStatus::Skip.to_string(), "skip");
        assert_eq!(TestStatus::Error.to_string(), "error");
        assert_eq!(TestStatus::Blocked.to_string(), "blocked");
    }

    #[test]
    fn test_status_is_pass_fail() {
        assert!(TestStatus::Pass.is_pass());
        assert!(!TestStatus::Fail.is_pass());
        assert!(!TestStatus::Skip.is_pass());
        assert!(!TestStatus::Error.is_pass());
        assert!(!TestStatus::Blocked.is_pass());

        assert!(TestStatus::Fail.is_fail());
        assert!(TestStatus::Error.is_fail());
        assert!(!TestStatus::Pass.is_fail());
        assert!(!TestStatus::Skip.is_fail());
        assert!(!TestStatus::Blocked.is_fail());
    }

    #[test]
    fn test_result_store_insert_and_sort() {
        let mut store = ResultStore::new();
        assert!(store.is_empty());

        let run_old = make_run(
            "run-1",
            "2026-03-01T00:00:00Z",
            vec![make_result("A-1", TestStatus::Pass)],
        );
        let run_new = make_run(
            "run-2",
            "2026-03-05T00:00:00Z",
            vec![make_result("A-1", TestStatus::Fail)],
        );

        // Insert older first, then newer
        store.insert(run_old);
        store.insert(run_new);

        assert_eq!(store.len(), 2);
        // Newest first
        assert_eq!(store.runs()[0].run.id, "run-2");
        assert_eq!(store.runs()[1].run.id, "run-1");
    }

    #[test]
    fn test_latest_for() {
        let mut store = ResultStore::new();

        store.insert(make_run(
            "run-1",
            "2026-03-01T00:00:00Z",
            vec![make_result("A-1", TestStatus::Fail)],
        ));
        store.insert(make_run(
            "run-2",
            "2026-03-05T00:00:00Z",
            vec![make_result("A-1", TestStatus::Pass)],
        ));

        let (meta, result) = store.latest_for("A-1").unwrap();
        assert_eq!(meta.id, "run-2");
        assert_eq!(result.status, TestStatus::Pass);

        assert!(store.latest_for("NONEXISTENT").is_none());
    }

    #[test]
    fn test_history_for() {
        let mut store = ResultStore::new();

        store.insert(make_run(
            "run-1",
            "2026-03-01T00:00:00Z",
            vec![make_result("A-1", TestStatus::Fail)],
        ));
        store.insert(make_run(
            "run-2",
            "2026-03-05T00:00:00Z",
            vec![make_result("A-1", TestStatus::Pass)],
        ));
        store.insert(make_run(
            "run-3",
            "2026-03-03T00:00:00Z",
            vec![make_result("B-1", TestStatus::Skip)],
        ));

        let history = store.history_for("A-1");
        assert_eq!(history.len(), 2);
        // Newest first
        assert_eq!(history[0].0.id, "run-2");
        assert_eq!(history[0].1.status, TestStatus::Pass);
        assert_eq!(history[1].0.id, "run-1");
        assert_eq!(history[1].1.status, TestStatus::Fail);

        // B-1 only appears in run-3
        let history_b = store.history_for("B-1");
        assert_eq!(history_b.len(), 1);
        assert_eq!(history_b[0].0.id, "run-3");
    }

    #[test]
    fn test_summary() {
        let mut store = ResultStore::new();

        store.insert(make_run(
            "run-1",
            "2026-03-01T00:00:00Z",
            vec![
                make_result("A-1", TestStatus::Pass),
                make_result("A-2", TestStatus::Fail),
            ],
        ));
        store.insert(make_run(
            "run-2",
            "2026-03-05T00:00:00Z",
            vec![
                make_result("A-1", TestStatus::Pass),
                make_result("A-2", TestStatus::Pass),
                make_result("A-3", TestStatus::Skip),
                make_result("A-4", TestStatus::Error),
                make_result("A-5", TestStatus::Blocked),
            ],
        ));

        let summary = store.summary();
        assert_eq!(summary.total_runs, 2);
        // Stats come from the latest run only (run-2)
        assert_eq!(summary.total_results, 5);
        assert_eq!(summary.pass_count, 2);
        assert_eq!(summary.fail_count, 0);
        assert_eq!(summary.skip_count, 1);
        assert_eq!(summary.error_count, 1);
        assert_eq!(summary.blocked_count, 1);
        // pass_rate = 2/5 = 40%
        assert!((summary.pass_rate() - 40.0).abs() < f64::EPSILON);
    }

    #[test]
    fn test_load_results_empty_dir() {
        let dir = std::env::temp_dir().join("rivet_test_empty_results");
        let _ = std::fs::create_dir_all(&dir);
        // Remove any leftover yaml files
        if let Ok(entries) = std::fs::read_dir(&dir) {
            for entry in entries.flatten() {
                let _ = std::fs::remove_file(entry.path());
            }
        }

        let runs = load_results(&dir).unwrap();
        assert!(runs.is_empty());

        let _ = std::fs::remove_dir(&dir);
    }

    #[test]
    fn test_load_results_nonexistent_dir() {
        let dir = std::env::temp_dir().join("rivet_test_nonexistent_results_dir");
        let _ = std::fs::remove_dir_all(&dir); // ensure it doesn't exist
        let runs = load_results(&dir).unwrap();
        assert!(runs.is_empty());
    }

    #[test]
    fn test_roundtrip_yaml() {
        let run_file = TestRunFile {
            run: RunMetadata {
                id: "run-roundtrip".to_string(),
                timestamp: "2026-03-08T12:00:00Z".to_string(),
                source: Some("CI".to_string()),
                environment: Some("HIL bench".to_string()),
                commit: Some("abc123".to_string()),
            },
            results: vec![
                TestResult {
                    artifact: "UVER-1".to_string(),
                    status: TestStatus::Pass,
                    duration: Some("1.5s".to_string()),
                    message: None,
                },
                TestResult {
                    artifact: "UVER-2".to_string(),
                    status: TestStatus::Fail,
                    duration: None,
                    message: Some("Threshold exceeded".to_string()),
                },
                TestResult {
                    artifact: "UVER-3".to_string(),
                    status: TestStatus::Skip,
                    duration: None,
                    message: None,
                },
                TestResult {
                    artifact: "UVER-4".to_string(),
                    status: TestStatus::Error,
                    duration: None,
                    message: Some("Runtime panic".to_string()),
                },
                TestResult {
                    artifact: "UVER-5".to_string(),
                    status: TestStatus::Blocked,
                    duration: None,
                    message: Some("Dependency unavailable".to_string()),
                },
            ],
        };

        let yaml = serde_yaml::to_string(&run_file).unwrap();
        let deserialized: TestRunFile = serde_yaml::from_str(&yaml).unwrap();

        assert_eq!(deserialized.run.id, run_file.run.id);
        assert_eq!(deserialized.run.timestamp, run_file.run.timestamp);
        assert_eq!(deserialized.run.source, run_file.run.source);
        assert_eq!(deserialized.run.environment, run_file.run.environment);
        assert_eq!(deserialized.run.commit, run_file.run.commit);
        assert_eq!(deserialized.results.len(), run_file.results.len());

        for (orig, deser) in run_file.results.iter().zip(deserialized.results.iter()) {
            assert_eq!(orig.artifact, deser.artifact);
            assert_eq!(orig.status, deser.status);
            assert_eq!(orig.duration, deser.duration);
            assert_eq!(orig.message, deser.message);
        }
    }
}
