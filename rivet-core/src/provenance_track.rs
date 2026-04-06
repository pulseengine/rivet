//! Provenance tracking for AI-touched artifact files.
//!
//! Records which files were modified by AI tools so that `rivet provenance apply`
//! can stamp the appropriate artifacts with provenance metadata.
//!
//! State is stored in `.rivet/provenance-pending.json` (gitignored, local-only).

use serde::{Deserialize, Serialize};
use std::path::Path;

/// A record that an AI tool modified a specific file.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProvenanceMark {
    /// Path to the modified file (relative to project root).
    pub file: String,
    /// ISO 8601 timestamp of the modification.
    pub timestamp: String,
    /// Name of the tool that made the modification (e.g., "Edit", "Write").
    pub tool: String,
}

/// Pending provenance marks awaiting application.
#[derive(Debug, Default, Serialize, Deserialize)]
pub struct PendingProvenance {
    /// List of files marked as AI-touched.
    pub marks: Vec<ProvenanceMark>,
}

/// Relative path to the pending provenance state file.
const PENDING_FILE: &str = ".rivet/provenance-pending.json";

impl PendingProvenance {
    /// Load pending provenance state from disk. Returns default if not found.
    pub fn load(project_dir: &Path) -> Self {
        let path = project_dir.join(PENDING_FILE);
        match std::fs::read_to_string(&path) {
            Ok(content) => serde_json::from_str(&content).unwrap_or_default(),
            Err(_) => Self::default(),
        }
    }

    /// Save pending provenance state to disk.
    pub fn save(&self, project_dir: &Path) -> std::io::Result<()> {
        let path = project_dir.join(PENDING_FILE);
        if let Some(parent) = path.parent() {
            std::fs::create_dir_all(parent)?;
        }
        let json = serde_json::to_string_pretty(self)?;
        std::fs::write(&path, json)
    }

    /// Mark a file as AI-touched. Updates timestamp if already marked.
    pub fn mark(&mut self, file: &str, tool: &str) {
        let timestamp = now_iso8601();
        if let Some(existing) = self.marks.iter_mut().find(|m| m.file == file) {
            existing.timestamp = timestamp;
            existing.tool = tool.to_string();
        } else {
            self.marks.push(ProvenanceMark {
                file: file.to_string(),
                timestamp,
                tool: tool.to_string(),
            });
        }
    }

    /// Clear all pending marks.
    pub fn clear(&mut self) {
        self.marks.clear();
    }

    /// Check if there are no pending marks.
    pub fn is_empty(&self) -> bool {
        self.marks.is_empty()
    }

    /// Delete the pending state file from disk.
    pub fn delete_file(project_dir: &Path) {
        let path = project_dir.join(PENDING_FILE);
        let _ = std::fs::remove_file(path);
    }
}

/// Generate an ISO 8601 UTC timestamp (public entry point for CLI).
pub fn now_iso8601_public() -> String {
    now_iso8601()
}

/// Generate an ISO 8601 UTC timestamp without external dependencies.
///
/// Produces a string like "2026-04-05T12:34:56Z".
fn now_iso8601() -> String {
    let duration = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default();
    let secs = duration.as_secs();

    // Convert Unix timestamp to calendar date/time (UTC).
    // Algorithm based on Howard Hinnant's civil_from_days.
    let days = (secs / 86400) as i64;
    let time_of_day = secs % 86400;
    let hours = time_of_day / 3600;
    let minutes = (time_of_day % 3600) / 60;
    let seconds = time_of_day % 60;

    // Days since 0000-03-01 (shifted epoch for leap year handling)
    let z = days + 719468;
    let era = if z >= 0 { z } else { z - 146096 } / 146097;
    let doe = (z - era * 146097) as u64; // day of era [0, 146096]
    let yoe = (doe - doe / 1460 + doe / 36524 - doe / 146096) / 365;
    let y = yoe as i64 + era * 400;
    let doy = doe - (365 * yoe + yoe / 4 - yoe / 100);
    let mp = (5 * doy + 2) / 153;
    let d = doy - (153 * mp + 2) / 5 + 1;
    let m = if mp < 10 { mp + 3 } else { mp - 9 };
    let y = if m <= 2 { y + 1 } else { y };

    format!(
        "{:04}-{:02}-{:02}T{:02}:{:02}:{:02}Z",
        y, m, d, hours, minutes, seconds
    )
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn mark_save_load_roundtrip() {
        let dir = tempfile::tempdir().unwrap();
        let mut pending = PendingProvenance::default();
        pending.mark("safety/hazards.yaml", "Edit");
        pending.mark("artifacts/requirements.yaml", "Write");
        pending.save(dir.path()).unwrap();

        let loaded = PendingProvenance::load(dir.path());
        assert_eq!(loaded.marks.len(), 2);
        assert_eq!(loaded.marks[0].file, "safety/hazards.yaml");
        assert_eq!(loaded.marks[0].tool, "Edit");
        assert_eq!(loaded.marks[1].file, "artifacts/requirements.yaml");
    }

    #[test]
    fn mark_idempotent_updates_timestamp() {
        let mut pending = PendingProvenance::default();
        pending.mark("safety/hazards.yaml", "Edit");
        let first_ts = pending.marks[0].timestamp.clone();
        // Same file again (tool may differ)
        pending.mark("safety/hazards.yaml", "Write");
        assert_eq!(pending.marks.len(), 1);
        assert_eq!(pending.marks[0].tool, "Write");
        // Timestamp should be at least as recent
        assert!(pending.marks[0].timestamp >= first_ts);
    }

    #[test]
    fn clear_removes_all() {
        let mut pending = PendingProvenance::default();
        pending.mark("a.yaml", "Edit");
        pending.mark("b.yaml", "Edit");
        assert!(!pending.is_empty());
        pending.clear();
        assert!(pending.is_empty());
        assert_eq!(pending.marks.len(), 0);
    }

    #[test]
    fn load_missing_returns_default() {
        let dir = tempfile::tempdir().unwrap();
        let loaded = PendingProvenance::load(dir.path());
        assert!(loaded.is_empty());
    }

    #[test]
    fn now_iso8601_format() {
        let ts = now_iso8601();
        // Should be like 2026-04-05T12:34:56Z
        assert!(ts.ends_with('Z'));
        assert_eq!(ts.len(), 20);
        assert_eq!(&ts[4..5], "-");
        assert_eq!(&ts[7..8], "-");
        assert_eq!(&ts[10..11], "T");
        assert_eq!(&ts[13..14], ":");
        assert_eq!(&ts[16..17], ":");
    }

    #[test]
    fn delete_file_removes_state() {
        let dir = tempfile::tempdir().unwrap();
        let mut pending = PendingProvenance::default();
        pending.mark("a.yaml", "Edit");
        pending.save(dir.path()).unwrap();
        assert!(dir.path().join(".rivet/provenance-pending.json").exists());

        PendingProvenance::delete_file(dir.path());
        assert!(!dir.path().join(".rivet/provenance-pending.json").exists());
    }
}
