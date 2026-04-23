//! `.rivet/runs/` — append-only pipeline audit trail.
//!
//! Every invocation of `rivet close-gaps` (and manual `rivet runs record`)
//! writes a timestamped directory here with the full provenance of the
//! pipeline run: the diagnostics at that moment, the ranking applied, the
//! proposals produced, the fresh-session validator outcome, what actually
//! landed as a commit/PR, and an in-toto attestation bundle.
//!
//! Runs are append-only. `rivet upgrade` refuses to touch them. Old runs
//! serve three purposes: human audit trail, agent memory (last run's
//! ranking affects this run's priorities), and pipeline retrospection
//! (`rivet runs diff a b`).
//!
//! Directory layout for one run:
//!
//! ```text
//! .rivet/runs/<ISO-timestamp>-<nonce>/
//! ├── manifest.json           — summary + invocation + schema pins
//! ├── diagnostics.json        — raw validator + oracle output
//! ├── oracle-firings.json     — structured per-oracle-per-artifact results
//! ├── ranked.json             — ordered gap list with contributing oracles
//! ├── proposals.json          — proposed actions per gap
//! ├── validated.json          — fresh-session validator re-runs
//! ├── emitted.json            — what actually landed (commits, PRs)
//! └── attestation-bundle.json — in-toto predicates per oracle firing
//! ```

use std::collections::BTreeMap;
use std::path::{Path, PathBuf};

use serde::{Deserialize, Serialize};

use crate::error::Error;
use crate::ownership::{guard_write, WriteMode};

// ── Manifest ───────────────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub struct RunManifest {
    /// `<ISO-timestamp>-<nonce>` that matches the directory name.
    pub run_id: String,
    /// ISO 8601 UTC timestamp, start of run.
    pub started_at: String,
    /// ISO 8601 UTC timestamp, end of run. `None` for in-progress runs.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub ended_at: Option<String>,
    pub rivet_version: String,
    pub template_version: u32,
    /// Active schemas at the time of the run, with versions.
    pub schemas: BTreeMap<String, String>,
    /// Pipeline names active for this invocation (e.g. ["vmodel", "coverage"]).
    pub pipelines_active: Vec<String>,
    /// Variant scope, if any.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub variant: Option<String>,
    pub invocation: Invocation,
    pub summary: RunSummary,
    /// Exit code at run completion; `None` while in-progress.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub exit_code: Option<i32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Invocation {
    /// The command line as invoked (joined argv).
    pub cli: String,
    /// Working directory.
    pub cwd: String,
    /// Who invoked this: `"ci"`, `"human:<user>"`, `"agent:<tool>"`.
    pub invoker: String,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub struct RunSummary {
    pub gaps_found: u32,
    pub ranked_top_n: u32,
    pub auto_closed: u32,
    pub human_review: u32,
    pub skipped: u32,
    pub errored: u32,
}

// ── Oracle firings ─────────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OracleFiring {
    /// Oracle declaration id (from `agent-pipelines.oracles`).
    pub oracle_id: String,
    /// Schema that owns the oracle.
    pub schema: String,
    /// Artifact that tripped the oracle; None for schema-wide checks.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub artifact_id: Option<String>,
    /// `true` if the oracle reported a violation.
    pub fired: bool,
    /// Human-readable description of the violation.
    pub details: String,
    /// ISO 8601 UTC timestamp when this oracle was invoked.
    pub captured_at: String,
}

// ── Write surface ──────────────────────────────────────────────────────

/// Open a new run directory. Creates `<.rivet/runs/<id>/>` and writes the
/// initial manifest. Returns a handle that other write operations use.
pub fn open_run(project_root: &Path, manifest: &RunManifest) -> Result<RunHandle, Error> {
    let rivet_dir = project_root.join(".rivet");
    let run_dir = rivet_dir.join("runs").join(&manifest.run_id);

    guard_write(
        &rivet_dir,
        &run_dir.join("manifest.json"),
        WriteMode::Runtime,
        false,
    )?;

    std::fs::create_dir_all(&run_dir)
        .map_err(|e| Error::Io(format!("creating run dir {}: {e}", run_dir.display())))?;

    let manifest_path = run_dir.join("manifest.json");
    let manifest_json = serde_json::to_string_pretty(manifest)
        .map_err(|e| Error::Results(format!("serialising manifest: {e}")))?;
    std::fs::write(&manifest_path, &manifest_json)
        .map_err(|e| Error::Io(format!("writing {}: {e}", manifest_path.display())))?;

    Ok(RunHandle {
        run_dir,
        rivet_dir,
    })
}

/// Write-side handle to an open run. Each write goes through the ownership
/// guard so the `AppendOnly` policy is enforced by a single code path.
#[derive(Debug, Clone)]
pub struct RunHandle {
    run_dir: PathBuf,
    rivet_dir: PathBuf,
}

impl RunHandle {
    pub fn dir(&self) -> &Path {
        &self.run_dir
    }

    /// Write a named JSON sidecar into the run directory. Filename should
    /// be one of the canonical ones (`diagnostics.json`, `ranked.json`, …).
    pub fn write_json<T: Serialize>(&self, filename: &str, value: &T) -> Result<(), Error> {
        let path = self.run_dir.join(filename);
        guard_write(&self.rivet_dir, &path, WriteMode::Runtime, false)?;
        let json = serde_json::to_string_pretty(value)
            .map_err(|e| Error::Results(format!("serialising {filename}: {e}")))?;
        std::fs::write(&path, json)
            .map_err(|e| Error::Io(format!("writing {}: {e}", path.display())))?;
        Ok(())
    }

    /// Finalise the run by updating `manifest.json` with `ended_at`,
    /// `exit_code`, and the final summary.
    pub fn finalise(
        &self,
        ended_at: String,
        exit_code: i32,
        summary: RunSummary,
    ) -> Result<(), Error> {
        let manifest_path = self.run_dir.join("manifest.json");
        let content = std::fs::read_to_string(&manifest_path).map_err(|e| {
            Error::Io(format!("reading {}: {e}", manifest_path.display()))
        })?;
        let mut manifest: RunManifest = serde_json::from_str(&content).map_err(|e| {
            Error::Results(format!(
                "parsing existing manifest {}: {e}",
                manifest_path.display()
            ))
        })?;
        manifest.ended_at = Some(ended_at);
        manifest.exit_code = Some(exit_code);
        manifest.summary = summary;
        let json = serde_json::to_string_pretty(&manifest)
            .map_err(|e| Error::Results(format!("serialising manifest: {e}")))?;
        std::fs::write(&manifest_path, json)
            .map_err(|e| Error::Io(format!("writing {}: {e}", manifest_path.display())))?;
        Ok(())
    }
}

// ── Read surface ───────────────────────────────────────────────────────

#[derive(Debug, Clone)]
pub struct RunEntry {
    pub run_id: String,
    pub manifest: RunManifest,
    pub path: PathBuf,
}

/// List all runs under `.rivet/runs/`, newest first. Entries that fail to
/// parse are logged and skipped; they do not fail the listing.
pub fn list_runs(project_root: &Path) -> Result<Vec<RunEntry>, Error> {
    let runs_dir = project_root.join(".rivet").join("runs");
    if !runs_dir.exists() {
        return Ok(Vec::new());
    }
    let mut entries = Vec::new();
    let read = std::fs::read_dir(&runs_dir)
        .map_err(|e| Error::Io(format!("reading {}: {e}", runs_dir.display())))?;
    for entry in read {
        let entry = entry.map_err(|e| Error::Io(format!("run-dir entry: {e}")))?;
        let dir = entry.path();
        if !dir.is_dir() {
            continue;
        }
        let manifest_path = dir.join("manifest.json");
        if !manifest_path.exists() {
            continue;
        }
        match std::fs::read_to_string(&manifest_path) {
            Ok(content) => match serde_json::from_str::<RunManifest>(&content) {
                Ok(manifest) => entries.push(RunEntry {
                    run_id: manifest.run_id.clone(),
                    manifest,
                    path: dir,
                }),
                Err(e) => log::warn!(
                    "skipping run {}: invalid manifest: {e}",
                    dir.display()
                ),
            },
            Err(e) => log::warn!(
                "skipping run {}: cannot read manifest: {e}",
                dir.display()
            ),
        }
    }
    entries.sort_by(|a, b| b.manifest.started_at.cmp(&a.manifest.started_at));
    Ok(entries)
}

/// Load one run by id. Returns `Ok(None)` if the run does not exist.
pub fn load_run(project_root: &Path, run_id: &str) -> Result<Option<RunEntry>, Error> {
    let dir = project_root.join(".rivet").join("runs").join(run_id);
    if !dir.exists() {
        return Ok(None);
    }
    let manifest_path = dir.join("manifest.json");
    let content = std::fs::read_to_string(&manifest_path)
        .map_err(|e| Error::Io(format!("reading {}: {e}", manifest_path.display())))?;
    let manifest: RunManifest = serde_json::from_str(&content)
        .map_err(|e| Error::Results(format!("parsing {}: {e}", manifest_path.display())))?;
    Ok(Some(RunEntry {
        run_id: run_id.to_string(),
        manifest,
        path: dir,
    }))
}

/// Generate a new run id of the form `<ISO-UTC>-<4-char-nonce>`.
///
/// The nonce is a short hex string derived from a stable-ish source so
/// two runs started in the same second on the same machine don't collide.
pub fn new_run_id() -> String {
    let now = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default();
    let secs = now.as_secs();
    let nanos = now.subsec_nanos();
    // 4-char hex from nanos — enough nonce for practical collision avoidance.
    let nonce = format!("{:04x}", (nanos >> 16) as u16);
    // Simple ISO-like format; we format without chrono to keep the dep set small.
    let (y, mo, d, h, m, s) = epoch_to_ymdhms(secs as i64);
    format!(
        "{y:04}-{mo:02}-{d:02}T{h:02}-{m:02}-{s:02}Z-{nonce}"
    )
}

/// Convert a unix timestamp to (year, month, day, hour, minute, second)
/// in UTC. Uses the standard civil-from-days algorithm.
fn epoch_to_ymdhms(epoch: i64) -> (i64, u32, u32, u32, u32, u32) {
    let days = epoch.div_euclid(86_400);
    let secs = epoch.rem_euclid(86_400) as u32;
    let h = secs / 3600;
    let m = (secs / 60) % 60;
    let s = secs % 60;
    let (y, mo, d) = civil_from_days(days);
    (y, mo, d, h, m, s)
}

/// Howard Hinnant's civil-from-days algorithm.
fn civil_from_days(z: i64) -> (i64, u32, u32) {
    let z = z + 719_468;
    let era = if z >= 0 { z } else { z - 146_096 } / 146_097;
    let doe = (z - era * 146_097) as u32;
    let yoe = (doe - doe / 1460 + doe / 36524 - doe / 146_096) / 365;
    let y = yoe as i64 + era * 400;
    let doy = doe - (365 * yoe + yoe / 4 - yoe / 100);
    let mp = (5 * doy + 2) / 153;
    let d = doy - (153 * mp + 2) / 5 + 1;
    let m = if mp < 10 { mp + 3 } else { mp - 9 };
    let y = if m <= 2 { y + 1 } else { y };
    (y, m, d)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn sample_manifest(id: &str) -> RunManifest {
        RunManifest {
            run_id: id.to_string(),
            started_at: "2026-04-23T16:00:00Z".into(),
            ended_at: None,
            rivet_version: "0.5.0".into(),
            template_version: 1,
            schemas: [("dev".to_string(), "0.5.0".to_string())]
                .into_iter()
                .collect(),
            pipelines_active: vec!["vmodel".into()],
            variant: None,
            invocation: Invocation {
                cli: "rivet close-gaps --emit json".into(),
                cwd: "/tmp/proj".into(),
                invoker: "human:test".into(),
            },
            summary: RunSummary::default(),
            exit_code: None,
        }
    }

    #[test]
    fn open_run_writes_manifest() {
        let tmp = tempfile::tempdir().unwrap();
        let manifest = sample_manifest("2026-04-23T00-00-00Z-abcd");
        let handle = open_run(tmp.path(), &manifest).expect("open_run");
        let path = handle.dir().join("manifest.json");
        assert!(path.exists());
        let content = std::fs::read_to_string(&path).unwrap();
        let parsed: RunManifest = serde_json::from_str(&content).unwrap();
        assert_eq!(parsed.run_id, "2026-04-23T00-00-00Z-abcd");
    }

    #[test]
    fn finalise_updates_manifest() {
        let tmp = tempfile::tempdir().unwrap();
        let manifest = sample_manifest("2026-04-23T00-00-00Z-efgh");
        let handle = open_run(tmp.path(), &manifest).unwrap();
        let mut summary = RunSummary::default();
        summary.gaps_found = 5;
        summary.auto_closed = 3;
        handle
            .finalise("2026-04-23T16:02:15Z".to_string(), 0, summary)
            .unwrap();
        let loaded = load_run(tmp.path(), "2026-04-23T00-00-00Z-efgh")
            .unwrap()
            .expect("run present");
        assert_eq!(loaded.manifest.exit_code, Some(0));
        assert_eq!(loaded.manifest.summary.gaps_found, 5);
        assert!(loaded.manifest.ended_at.is_some());
    }

    #[test]
    fn list_runs_orders_newest_first() {
        let tmp = tempfile::tempdir().unwrap();
        let mut m1 = sample_manifest("run-a");
        m1.started_at = "2026-04-23T10:00:00Z".into();
        let mut m2 = sample_manifest("run-b");
        m2.started_at = "2026-04-23T12:00:00Z".into();
        open_run(tmp.path(), &m1).unwrap();
        open_run(tmp.path(), &m2).unwrap();
        let list = list_runs(tmp.path()).unwrap();
        assert_eq!(list.len(), 2);
        assert_eq!(list[0].run_id, "run-b"); // newest first
        assert_eq!(list[1].run_id, "run-a");
    }

    #[test]
    fn write_json_sidecar() {
        let tmp = tempfile::tempdir().unwrap();
        let handle = open_run(tmp.path(), &sample_manifest("rid")).unwrap();
        let firings = vec![OracleFiring {
            oracle_id: "structural-trace".into(),
            schema: "dev".into(),
            artifact_id: Some("REQ-001".into()),
            fired: true,
            details: "missing required link".into(),
            captured_at: "2026-04-23T16:00:01Z".into(),
        }];
        handle.write_json("oracle-firings.json", &firings).unwrap();
        let path = handle.dir().join("oracle-firings.json");
        assert!(path.exists());
        let parsed: Vec<OracleFiring> =
            serde_json::from_str(&std::fs::read_to_string(&path).unwrap()).unwrap();
        assert_eq!(parsed.len(), 1);
        assert_eq!(parsed[0].oracle_id, "structural-trace");
    }

    #[test]
    fn new_run_id_format() {
        let id = new_run_id();
        // e.g. "2026-04-23T16-00-00Z-abcd"
        assert!(id.contains('T') && id.contains('Z'));
        assert!(id.len() >= 25);
    }

    #[test]
    fn civil_from_days_known_values() {
        // 2026-04-23 is 20566 days since 1970-01-01
        let (y, m, d) = civil_from_days(20566);
        assert_eq!((y, m, d), (2026, 4, 23));
    }

    #[test]
    fn list_runs_empty_when_no_runs_dir() {
        let tmp = tempfile::tempdir().unwrap();
        let list = list_runs(tmp.path()).unwrap();
        assert!(list.is_empty());
    }

    #[test]
    fn list_runs_skips_malformed() {
        let tmp = tempfile::tempdir().unwrap();
        let runs_dir = tmp.path().join(".rivet/runs/broken");
        std::fs::create_dir_all(&runs_dir).unwrap();
        std::fs::write(runs_dir.join("manifest.json"), "{ not valid json").unwrap();

        // Also add a valid one
        open_run(tmp.path(), &sample_manifest("good")).unwrap();

        let list = list_runs(tmp.path()).unwrap();
        assert_eq!(list.len(), 1);
        assert_eq!(list[0].run_id, "good");
    }
}
