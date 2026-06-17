//! `rivet check docs` — enumerate every candidate path the doc scanner
//! considered and tag each `loaded` / `skipped (<reason>)` /
//! `excluded (<glob>)`.
//!
//! Dedicated read-only oracle so the doc-scan status is queryable
//! without a full `rivet validate` pass. Mirrors the conventions of
//! `rivet check sources`: human-text default, `--format json` for
//! mechanical assertions, `--strict` exits non-zero when any candidate
//! is skipped. Explicit `excluded` allowlist matches do **not** trip
//! `--strict` — those are user opt-in, not an oversight.
//!
//! JSON contract on `--format json`:
//! ```json
//! {
//!   "oracle": "docs",
//!   "entries": [
//!     { "path": "docs/foo.md", "status": "loaded" },
//!     { "path": "docs/bar.md", "status": "skipped",  "reason": "no YAML frontmatter" },
//!     { "path": "docs/gen.md", "status": "excluded", "reason": "generated-*.md" }
//!   ],
//!   "total": 3,
//!   "by_status": { "loaded": 1, "skipped": 1, "excluded": 1 }
//! }
//! ```

use std::path::Path;

use anyhow::{Context, Result};
use rivet_core::document::{self, DocScanStatus};
use serde::Serialize;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
#[serde(rename_all = "snake_case")]
pub enum EntryStatus {
    Loaded,
    Skipped,
    Excluded,
}

#[derive(Debug, Clone, Serialize)]
pub struct Entry {
    /// Path relative to the project root, with forward slashes — stable
    /// across platforms so JSON consumers can pattern-match without
    /// caring whether the harness ran on Windows.
    pub path: String,
    pub status: EntryStatus,
    /// For `skipped`: the human-readable reason (`"no YAML frontmatter"`
    /// or the frontmatter parse-error message). For `excluded`: the
    /// matching glob from `docs[].exclude`. Omitted for `loaded`.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub reason: Option<String>,
}

#[derive(Debug, Default, Serialize)]
pub struct StatusCounts {
    pub loaded: usize,
    pub skipped: usize,
    pub excluded: usize,
}

#[derive(Debug, Serialize)]
pub struct Report {
    pub oracle: &'static str,
    pub entries: Vec<Entry>,
    pub total: usize,
    pub by_status: StatusCounts,
}

/// Build the report from the project's configured `docs:` entries.
///
/// Iterates each `DocsEntry`, runs `scan_documents` per directory, and
/// flattens the per-path results into a single ordered list. Paths are
/// normalized relative to `project_root` with forward slashes.
pub fn compute(project_root: &Path, docs: &[rivet_core::model::DocsEntry]) -> Result<Report> {
    let mut entries = Vec::new();
    let mut by_status = StatusCounts::default();

    for entry in docs {
        let dir = project_root.join(entry.path());
        let scanned = document::scan_documents(&dir, entry.exclude())
            .with_context(|| format!("scanning docs from '{}'", entry.path()))?;

        for sd in scanned {
            let (status, reason) = match sd.status {
                DocScanStatus::Loaded => (EntryStatus::Loaded, None),
                DocScanStatus::Skipped(r) => (EntryStatus::Skipped, Some(r)),
                DocScanStatus::Excluded(p) => (EntryStatus::Excluded, Some(p)),
            };
            match status {
                EntryStatus::Loaded => by_status.loaded += 1,
                EntryStatus::Skipped => by_status.skipped += 1,
                EntryStatus::Excluded => by_status.excluded += 1,
            }
            entries.push(Entry {
                path: relative_display(project_root, &sd.path),
                status,
                reason,
            });
        }
    }

    let total = entries.len();
    Ok(Report {
        oracle: "docs",
        entries,
        total,
        by_status,
    })
}

/// Render `path` relative to `project_root` using forward slashes, so
/// the JSON shape is stable across platforms. Falls back to the
/// absolute path on a strip failure (canonicalization mismatch).
fn relative_display(project_root: &Path, path: &Path) -> String {
    let rel = path.strip_prefix(project_root).unwrap_or(path);
    rel.to_string_lossy().replace('\\', "/")
}

/// Render the report as human-readable text: one line per entry plus a
/// trailing summary count.
pub fn render_text(report: &Report) -> String {
    use std::fmt::Write;
    let mut out = String::new();
    if report.entries.is_empty() {
        out.push_str("No doc candidates found (check the `docs:` block in rivet.yaml).\n");
        return out;
    }
    for e in &report.entries {
        match (&e.status, &e.reason) {
            (EntryStatus::Loaded, _) => {
                let _ = writeln!(out, "loaded: {}", e.path);
            }
            (EntryStatus::Skipped, Some(r)) => {
                let _ = writeln!(out, "skipped: {}: {}", e.path, r);
            }
            (EntryStatus::Excluded, Some(p)) => {
                let _ = writeln!(out, "excluded: {} (matched: {})", e.path, p);
            }
            // The reasonless skipped/excluded branches are unreachable
            // by construction in `compute`, but render them gracefully
            // rather than panic if anyone wires up the type by hand.
            (EntryStatus::Skipped, None) => {
                let _ = writeln!(out, "skipped: {}", e.path);
            }
            (EntryStatus::Excluded, None) => {
                let _ = writeln!(out, "excluded: {}", e.path);
            }
        }
    }
    let _ = writeln!(out);
    let _ = writeln!(
        out,
        "Total: {} (loaded: {}, skipped: {}, excluded: {})",
        report.total, report.by_status.loaded, report.by_status.skipped, report.by_status.excluded,
    );
    out
}

/// Returns `true` on pass / `false` on fail (per the oracle convention).
///
/// Pass: every candidate is either `loaded` or explicitly `excluded`.
/// Fail (only under `--strict`): any candidate is `skipped` — i.e. a
/// file the scanner declined and the user did **not** allowlist.
pub fn strict_passes(report: &Report) -> bool {
    report.by_status.skipped == 0
}
