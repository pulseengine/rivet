//! `rivet check sources` — list / update cited-source stamps.
//!
//! Phase 1: only handles `kind: file`. Remote kinds (`url`, `github`,
//! `oslc`, `reqif`, `polarion`) are listed but skipped with an Info
//! message that points at `--check-remote-sources` (Phase 2).
//!
//! Modes:
//!
//! * default — list every artifact carrying a `cited-source`, with
//!   per-source status: `MATCH`, `DRIFT`, `MISSING-HASH`, `READ-ERROR`,
//!   `SKIPPED-REMOTE`.
//! * `--update` — interactive: prompt `[y/N]` per drifted / missing
//!   stamp, refresh the artifact YAML in place when accepted.
//! * `--update --apply` — non-interactive batch update.
//!
//! JSON contract on `--format json`:
//! ```json
//! {
//!   "oracle": "sources",
//!   "entries": [
//!     {
//!       "artifact_id": "REQ-001",
//!       "uri": "./doc.md",
//!       "kind": "file",
//!       "status": "DRIFT",
//!       "stamped_sha256": "0000…",
//!       "computed_sha256": "ba78…",
//!       "last_checked": "2026-01-01T00:00:00Z"
//!     }
//!   ],
//!   "total": 1,
//!   "by_status": { "match": 0, "drift": 1, "missing_hash": 0, "read_error": 0, "skipped_remote": 0 }
//! }
//! ```

use std::io::{self, BufRead, Write};
use std::path::{Path, PathBuf};

use anyhow::{Context, Result};
use rivet_core::cited_source::{
    self, CheckOutcome, CitedSource, check_cited_source, parse_cited_source,
};
use rivet_core::model::Artifact;
use serde::Serialize;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
#[serde(rename_all = "snake_case")]
pub enum EntryStatus {
    Match,
    Drift,
    MissingHash,
    ReadError,
    SkippedRemote,
    ShapeError,
}

impl EntryStatus {
    fn label(self) -> &'static str {
        match self {
            EntryStatus::Match => "MATCH",
            EntryStatus::Drift => "DRIFT",
            EntryStatus::MissingHash => "MISSING-HASH",
            EntryStatus::ReadError => "READ-ERROR",
            EntryStatus::SkippedRemote => "SKIPPED-REMOTE",
            EntryStatus::ShapeError => "SHAPE-ERROR",
        }
    }
}

#[derive(Debug, Clone, Serialize)]
pub struct Entry {
    pub artifact_id: String,
    pub uri: String,
    pub kind: String,
    pub status: EntryStatus,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub stamped_sha256: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub computed_sha256: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub last_checked: Option<String>,
    /// File path on disk for `kind: file` entries (for `--update`).
    #[serde(skip)]
    pub source_file: Option<PathBuf>,
    /// Free-form detail (e.g. read-error reason or shape-error message).
    #[serde(skip_serializing_if = "Option::is_none")]
    pub detail: Option<String>,
}

#[derive(Debug, Default, Serialize)]
pub struct StatusCounts {
    pub r#match: usize,
    pub drift: usize,
    pub missing_hash: usize,
    pub read_error: usize,
    pub skipped_remote: usize,
    pub shape_error: usize,
}

#[derive(Debug, Serialize)]
pub struct Report {
    pub oracle: &'static str,
    pub entries: Vec<Entry>,
    pub total: usize,
    pub by_status: StatusCounts,
}

/// Compute the listing report from a slice of artifacts.
///
/// `project_root` is used to resolve relative `kind: file` URIs.
pub fn compute<'a>(
    artifacts: impl IntoIterator<Item = &'a Artifact>,
    project_root: &Path,
) -> Report {
    let mut entries = Vec::new();
    let mut by_status = StatusCounts::default();

    for artifact in artifacts {
        let Some(raw) = artifact.fields.get("cited-source") else {
            continue;
        };

        let parsed: CitedSource = match parse_cited_source(raw) {
            Ok(p) => p,
            Err(e) => {
                by_status.shape_error += 1;
                entries.push(Entry {
                    artifact_id: artifact.id.clone(),
                    uri: String::new(),
                    kind: String::new(),
                    status: EntryStatus::ShapeError,
                    stamped_sha256: None,
                    computed_sha256: None,
                    last_checked: None,
                    source_file: artifact.source_file.clone(),
                    detail: Some(e.to_string()),
                });
                continue;
            }
        };

        let outcome = check_cited_source(&parsed, project_root, false);
        let (status, computed, detail) = match &outcome {
            CheckOutcome::Match => (EntryStatus::Match, None, None),
            CheckOutcome::Drift { computed } => (EntryStatus::Drift, Some(computed.clone()), None),
            CheckOutcome::MissingHash { computed } => {
                (EntryStatus::MissingHash, Some(computed.clone()), None)
            }
            CheckOutcome::FileError { reason } => {
                (EntryStatus::ReadError, None, Some(reason.clone()))
            }
            CheckOutcome::SkippedRemote => (EntryStatus::SkippedRemote, None, None),
        };

        match status {
            EntryStatus::Match => by_status.r#match += 1,
            EntryStatus::Drift => by_status.drift += 1,
            EntryStatus::MissingHash => by_status.missing_hash += 1,
            EntryStatus::ReadError => by_status.read_error += 1,
            EntryStatus::SkippedRemote => by_status.skipped_remote += 1,
            EntryStatus::ShapeError => by_status.shape_error += 1,
        }

        entries.push(Entry {
            artifact_id: artifact.id.clone(),
            uri: parsed.uri.clone(),
            kind: parsed.kind.as_str().to_string(),
            status,
            stamped_sha256: parsed.sha256.clone(),
            computed_sha256: computed,
            last_checked: parsed.last_checked.clone(),
            source_file: artifact.source_file.clone(),
            detail,
        });
    }

    let total = entries.len();
    Report {
        oracle: "sources",
        entries,
        total,
        by_status,
    }
}

/// Render the report as human text.
pub fn render_text(report: &Report) -> String {
    use std::fmt::Write;
    let mut out = String::new();
    if report.entries.is_empty() {
        out.push_str("No artifacts have a cited-source field.\n");
        return out;
    }
    let _ = writeln!(out, "{:<14} {:<14} {:<8} URI", "ARTIFACT", "STATUS", "KIND",);
    for e in &report.entries {
        let _ = writeln!(
            out,
            "{:<14} {:<14} {:<8} {}",
            e.artifact_id,
            e.status.label(),
            e.kind,
            e.uri
        );
        if let Some(detail) = &e.detail {
            let _ = writeln!(out, "    detail: {detail}");
        }
        if let (Some(stamped), Some(computed)) = (&e.stamped_sha256, &e.computed_sha256) {
            if e.status == EntryStatus::Drift {
                let _ = writeln!(out, "    stamped : {stamped}");
                let _ = writeln!(out, "    computed: {computed}");
            }
        }
    }
    let _ = writeln!(out);
    let _ = writeln!(
        out,
        "Total: {} (match: {}, drift: {}, missing-hash: {}, read-error: {}, skipped-remote: {}, shape-error: {})",
        report.total,
        report.by_status.r#match,
        report.by_status.drift,
        report.by_status.missing_hash,
        report.by_status.read_error,
        report.by_status.skipped_remote,
        report.by_status.shape_error,
    );
    if report.by_status.skipped_remote > 0 {
        let _ = writeln!(
            out,
            "note: {} remote-kind source(s) skipped — Phase 2 will add `--check-remote-sources` backends",
            report.by_status.skipped_remote,
        );
    }
    out
}

/// Apply updates to drifted / missing-hash entries.
///
/// `interactive` triggers a per-entry y/N prompt on stdin. With
/// `interactive=false` the function applies every drift / missing-hash
/// fix without asking (the `--apply` mode).
///
/// Returns the number of entries updated.
pub fn apply_updates(report: &Report, interactive: bool) -> Result<usize> {
    let now = current_iso8601_utc();
    let mut applied = 0;
    let stdin = io::stdin();
    let mut stdin_lock = stdin.lock();

    for e in &report.entries {
        let needs_update = matches!(e.status, EntryStatus::Drift | EntryStatus::MissingHash);
        if !needs_update {
            if e.status == EntryStatus::SkippedRemote {
                eprintln!(
                    "  skipping {}: kind={} — use --check-remote-sources for remote kinds (Phase 2)",
                    e.artifact_id, e.kind
                );
            }
            continue;
        }
        let Some(computed) = e.computed_sha256.as_deref() else {
            continue;
        };
        let Some(file) = e.source_file.as_deref() else {
            eprintln!("  skipping {}: artifact source file unknown", e.artifact_id);
            continue;
        };

        if interactive {
            print!("Update {} sha256 to {}? [y/N] ", e.artifact_id, computed);
            io::stdout().flush().ok();
            let mut buf = String::new();
            stdin_lock.read_line(&mut buf)?;
            let answer = buf.trim().to_ascii_lowercase();
            if !(answer == "y" || answer == "yes") {
                continue;
            }
        }

        cited_source::update_cited_source_in_file(file, &e.artifact_id, computed, &now)
            .with_context(|| format!("updating cited-source for {}", e.artifact_id))?;
        applied += 1;
    }

    Ok(applied)
}

/// Best-effort ISO-8601 UTC timestamp without pulling chrono in.
fn current_iso8601_utc() -> String {
    use std::time::{SystemTime, UNIX_EPOCH};
    let now = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs() as i64;

    // Convert epoch seconds into Y/M/D/H/M/S using a fixed-point algorithm.
    // Days since 1970-01-01:
    let days = now.div_euclid(86_400);
    let secs_of_day = now.rem_euclid(86_400);
    let h = secs_of_day / 3600;
    let m = (secs_of_day % 3600) / 60;
    let s = secs_of_day % 60;

    // Date math: Howard Hinnant's "civil_from_days".
    let z = days + 719_468;
    let era = if z >= 0 { z } else { z - 146_096 } / 146_097;
    let doe = (z - era * 146_097) as u64;
    let yoe = (doe - doe / 1460 + doe / 36524 - doe / 146_096) / 365;
    let y = (yoe as i64) + era * 400;
    let doy = doe - (365 * yoe + yoe / 4 - yoe / 100);
    let mp = (5 * doy + 2) / 153;
    let d = doy - (153 * mp + 2) / 5 + 1;
    let m_civil = if mp < 10 { mp + 3 } else { mp - 9 };
    let y = if m_civil <= 2 { y + 1 } else { y };

    format!(
        "{:04}-{:02}-{:02}T{:02}:{:02}:{:02}Z",
        y, m_civil, d, h, m, s
    )
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn current_iso8601_format_is_well_formed() {
        let s = current_iso8601_utc();
        // Expect "YYYY-MM-DDTHH:MM:SSZ"
        assert_eq!(s.len(), 20);
        assert!(s.ends_with('Z'));
        assert!(s.contains('T'));
    }
}
