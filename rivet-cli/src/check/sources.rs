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
    self, CheckOutcome, CitedSource, STALE_DAYS_DEFAULT, StaleStatus, check_cited_source,
    classify_staleness_now, parse_cited_source,
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

/// Side-channel staleness report — orthogonal to `EntryStatus` because a
/// `MATCH` entry can still be stale (last-checked is old or missing).
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
#[serde(rename_all = "snake_case")]
pub enum StaleVerdict {
    Fresh,
    MissingTimestamp,
    Old,
    Unparseable,
}

impl StaleVerdict {
    fn label(self) -> &'static str {
        match self {
            StaleVerdict::Fresh => "FRESH",
            StaleVerdict::MissingTimestamp => "STALE-MISSING",
            StaleVerdict::Old => "STALE-OLD",
            StaleVerdict::Unparseable => "STALE-UNPARSEABLE",
        }
    }

    fn from_status(s: StaleStatus) -> Self {
        match s {
            StaleStatus::Fresh => StaleVerdict::Fresh,
            StaleStatus::Missing => StaleVerdict::MissingTimestamp,
            StaleStatus::Old { .. } => StaleVerdict::Old,
            StaleStatus::Unparseable => StaleVerdict::Unparseable,
        }
    }

    /// True for any non-fresh verdict — used by `--strict` exit code.
    pub fn is_stale(self) -> bool {
        !matches!(self, StaleVerdict::Fresh)
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
    /// Side-channel: `last-checked` freshness verdict. Always emitted
    /// for kind: file entries; omitted (None) for shape-errors and remote-skipped.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub stale: Option<StaleVerdict>,
    /// Age in days when `stale = Old`. None otherwise.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub stale_age_days: Option<i64>,
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
    pub stale: usize,
}

#[derive(Debug, Default, Serialize)]
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
                    stale: None,
                    stale_age_days: None,
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

        // Compute the staleness side-channel for kind: file. Remote
        // kinds skip this — we can't reason about freshness without
        // the actual backend.
        let (stale, stale_age_days) = if parsed.kind.is_local() {
            let s = classify_staleness_now(parsed.last_checked.as_deref(), STALE_DAYS_DEFAULT);
            let age = match s {
                StaleStatus::Old { age_days } => Some(age_days),
                _ => None,
            };
            let v = StaleVerdict::from_status(s);
            if v.is_stale() {
                by_status.stale += 1;
            }
            (Some(v), age)
        } else {
            (None, None)
        };

        entries.push(Entry {
            artifact_id: artifact.id.clone(),
            uri: parsed.uri.clone(),
            kind: parsed.kind.as_str().to_string(),
            status,
            stamped_sha256: parsed.sha256.clone(),
            computed_sha256: computed,
            last_checked: parsed.last_checked.clone(),
            stale,
            stale_age_days,
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
/// The single file path a `source-ref` names, or `None` when the value is not
/// strictly path-shaped.
///
/// `source-ref` is a plain string with no drift detection (REQ-358). Measuring
/// the corpus showed the values are not homogeneous: of 55, only 17 name one
/// resolvable file. The rest are code-location NOTES — multi-file brace globs,
/// line ranges spanning two files, prose, and URLs. So a rot check has to
/// decide what it is even looking at before it can resolve anything.
///
/// CONSERVATIVE BY DESIGN: a false positive fails a build over prose, so only
/// a strictly path-shaped value is accepted — no whitespace, no prose
/// punctuation, no scheme — with an optional `:line` or `:start-end` suffix
/// that is stripped. Prose containing a real path is a false NEGATIVE, which
/// is the direction worth erring in.
pub fn source_ref_path(value: &str) -> Option<&str> {
    let v = value.trim();
    if v.is_empty() || v.contains(char::is_whitespace) {
        return None;
    }
    // A scheme means it is not a repo-relative file.
    if v.contains("://") {
        return None;
    }
    // Brace globs, lists and sentence punctuation are notes, not paths.
    if v.contains(['{', '}', '(', ')', ';', '+', '—']) {
        return None;
    }

    // Strip one trailing `:line` or `:start-end`. A colon with anything else
    // after it (a second path, a label) is not a line anchor.
    let base = match v.rsplit_once(':') {
        Some((head, tail))
            if !tail.is_empty()
                && tail
                    .chars()
                    .all(|c| c.is_ascii_digit() || c == '-' || c == ',') =>
        {
            head
        }
        Some(_) => return None,
        None => v,
    };

    // A path with a comma left in it was a multi-range note.
    if base.is_empty() || base.contains(',') {
        return None;
    }
    Some(base)
}

/// Artifacts whose `source-ref` is path-shaped but names a file that does not
/// exist — a reference that looks valid and points at nothing.
///
/// Returns `(artifact_id, raw_value, missing_base)`.
pub fn rotted_source_refs<'a>(
    artifacts: impl Iterator<Item = &'a rivet_core::model::Artifact>,
    project_root: &std::path::Path,
) -> Vec<(String, String, String)> {
    let mut out = Vec::new();
    for a in artifacts {
        let Some(raw) = a.fields.get("source-ref").and_then(|v| v.as_str()) else {
            continue;
        };
        let Some(base) = source_ref_path(raw) else {
            continue;
        };
        if !project_root.join(base).exists() {
            out.push((a.id.to_string(), raw.to_owned(), base.to_owned()));
        }
    }
    out.sort();
    out
}

/// Why this run should fail, or `None` to pass.
///
/// Two independent obligations, and the order matters for the message:
///
/// 1. The POPULATION. `rivet check sources` is a drift gate, and its exit code
///    was `firing == 0` summed over drift / missing-hash / read-error /
///    shape-error (plus stale under `--strict`). On a corpus with no
///    cited-sources every one of those is 0, so the command exited 0 having
///    checked nothing. The text output says so plainly — "No artifacts have a
///    cited-source field." — but a pipeline reads the exit code, and there 0
///    meant "sources verified" when the population was empty. That is absence
///    reported as success, on the assurance chain, where citation freshness is
///    the evidence.
///
/// 2. The DRIFT itself, unchanged.
///
/// `min` is a caller-opted floor, not a changed default: a project with no
/// citations is a legitimate configuration and keeps exiting 0 at `min == 0`.
/// Meeting the floor never excuses drift — checked by its own test, because a
/// flag that could mask the defect the command exists to find would be worse
/// than the gap it closes.
pub fn gate_reason(report: &Report, strict: bool, min: usize) -> Option<String> {
    if report.total < min {
        return Some(if report.total == 0 {
            format!(
                "--min {min} was requested but this run checked nothing: no artifact \
                 carries a cited-source field. Exiting 0 here would report an empty \
                 population as a verified one."
            )
        } else {
            format!(
                "--min {min} was requested but only {} cited-source(s) were found. \
                 Citations may have been removed since the floor was set.",
                report.total
            )
        });
    }

    let c = &report.by_status;
    let mut reasons: Vec<String> = Vec::new();
    for (n, label) in [
        (c.drift, "drift"),
        (c.missing_hash, "missing-hash"),
        (c.read_error, "read-error"),
        (c.shape_error, "shape-error"),
    ] {
        if n > 0 {
            reasons.push(format!("{n} {label}"));
        }
    }
    if strict && c.stale > 0 {
        reasons.push(format!("{} stale", c.stale));
    }
    if reasons.is_empty() {
        None
    } else {
        Some(format!("cited-source check failed: {}", reasons.join(", ")))
    }
}

pub fn render_text(report: &Report) -> String {
    use std::fmt::Write;
    let mut out = String::new();
    if report.entries.is_empty() {
        out.push_str("No artifacts have a cited-source field.\n");
        return out;
    }
    let _ = writeln!(
        out,
        "{:<14} {:<14} {:<18} {:<8} URI",
        "ARTIFACT", "STATUS", "FRESHNESS", "KIND",
    );
    for e in &report.entries {
        let stale_label = e.stale.map(|s| s.label()).unwrap_or("-");
        let _ = writeln!(
            out,
            "{:<14} {:<14} {:<18} {:<8} {}",
            e.artifact_id,
            e.status.label(),
            stale_label,
            e.kind,
            e.uri
        );
        if let Some(detail) = &e.detail {
            let _ = writeln!(out, "    detail: {detail}");
        }
        if let Some(age) = e.stale_age_days {
            let _ = writeln!(
                out,
                "    last-checked age: {age} day(s) (threshold: {STALE_DAYS_DEFAULT})"
            );
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
        "Total: {} (match: {}, drift: {}, missing-hash: {}, read-error: {}, skipped-remote: {}, shape-error: {}, stale: {})",
        report.total,
        report.by_status.r#match,
        report.by_status.drift,
        report.by_status.missing_hash,
        report.by_status.read_error,
        report.by_status.skipped_remote,
        report.by_status.shape_error,
        report.by_status.stale,
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
pub(crate) fn current_iso8601_utc() -> String {
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
    // ── REQ-358: source-ref points at files that no longer exist ────────────
    //
    // The maintainer reported that aadl-component carries `source-ref` as a
    // plain string, so a file can change under a valid-looking reference.
    // Measuring the corpus found something worse than drift — two references
    // point at files that were DELETED, and nothing has ever flagged it:
    //
    //   ARCH-ADAPT-STPA  rivet-core/src/formats/stpa.rs:1  deleted in #123
    //   ARCH-DASH-001    rivet-cli/src/serve.rs:1          deleted in #40
    //
    // The file did not change under the reference. It vanished, and the
    // reference still looks fine.
    //
    // WHY NOT JUST MIGRATE ALL 55 TO cited-source, which is what the plan in
    // REQ-358 originally said: because they are not all citations. Measured by
    // type — 19 aadl-component, 25 design-decision, 11 feature — and by shape,
    // only 17 are a resolvable single file. The rest are code-location NOTES:
    // multi-file brace globs, line ranges across two files, and prose. A
    // cited-source is a single URI with one sha256 by construction, so forcing
    // those in would lose information rather than gain assurance. They keep
    // `source-ref`, which is exactly why source-ref needs a rot check of its
    // own rather than only a deprecation.
    //
    // CONSERVATIVE BY DESIGN. A false positive here fails a build over prose,
    // so only a strictly path-shaped value is resolved at all: no whitespace,
    // no prose punctuation, optional `:line` or `:a-b` suffix. Prose that
    // happens to contain a real path is a false NEGATIVE, which is the
    // direction worth erring in.

    #[test]
    fn a_path_shaped_ref_yields_its_base() {
        assert_eq!(
            source_ref_path("rivet-core/src/lib.rs:1"),
            Some("rivet-core/src/lib.rs")
        );
        assert_eq!(
            source_ref_path("arch/rivet_system.aadl:49-54"),
            Some("arch/rivet_system.aadl")
        );
        assert_eq!(
            source_ref_path("rivet-core/src/store.rs"),
            Some("rivet-core/src/store.rs")
        );
    }

    /// Everything that is NOT a single resolvable path must be declined, or
    /// the check fires on prose. Each of these is a real value from the corpus.
    #[test]
    fn notes_and_prose_are_declined_not_resolved() {
        for v in [
            "rivet-core/src/{sexpr,commits,reqif,formats/needs_json}.rs",
            "rivet-core/src/formats/needs_json.rs:367-454,683-705 + rivet-core/src/lib.rs:252",
            "new: rivet-core/src/sql/ (executor + vtab module); rivet-cli/src/main.rs",
            "serde docs: https://serde.rs/container-attrs.html#deny_unknown_fields",
            "rivet-cli/src/main.rs — cmd_stamp_all filter predicate.",
            "https://example.com/spec.pdf",
        ] {
            assert_eq!(source_ref_path(v), None, "must decline: {v}");
        }
    }

    /// Each guard, ISOLATED. Found by surviving mutants: every fixture above
    /// trips two or three guards at once, so deleting any single one left the
    /// others catching them and three separate mutations went unnoticed. A
    /// fixture that exercises a guard only incidentally asserts nothing about
    /// it.
    #[test]
    fn each_guard_is_load_bearing_on_its_own() {
        // whitespace ONLY — no braces, no scheme, no sentence punctuation
        assert_eq!(source_ref_path("src/lib.rs and also src/other.rs"), None);
        // brace ONLY
        assert_eq!(source_ref_path("src/{a}.rs"), None);
        // scheme ONLY. The PORT matters: without it the colon-tail rule already
        // declines a URL (the tail after the last colon is not numeric), so the
        // scheme guard looks redundant and a mutation deleting it survives.
        // With a numeric port the tail IS numeric, the base becomes
        // "https://example.com", and it would be resolved as a repo-relative
        // path that cannot exist — a false positive on a URL.
        assert_eq!(source_ref_path("https://example.com:8080"), None);
        assert_eq!(source_ref_path("https://example.com/a.txt"), None);
        // trailing non-numeric colon segment ONLY
        assert_eq!(source_ref_path("src/lib.rs:notaline"), None);
        // comma-range remnant ONLY
        assert_eq!(source_ref_path("src/a.rs,src/b.rs"), None);
    }

    fn artifact_with_source_ref(id: &str, value: &str) -> rivet_core::model::Artifact {
        let mut a = rivet_core::model::Artifact {
            id: id.into(),
            artifact_type: "aadl-component".into(),
            title: "t".into(),
            ..Default::default()
        };
        a.fields.insert(
            "source-ref".into(),
            serde_yaml::Value::String(value.to_owned()),
        );
        a
    }

    /// The COLLECTOR, which had no test at all — a surviving mutant that made
    /// `rotted_source_refs` return nothing reddened nothing.
    // rivet: verifies REQ-358
    #[test]
    fn the_collector_reports_a_missing_base_and_spares_a_live_one() {
        let root = std::path::Path::new(env!("CARGO_MANIFEST_DIR"))
            .parent()
            .expect("workspace root");
        let arts = [
            artifact_with_source_ref("A-1", "rivet-core/src/does-not-exist.rs:1"),
            artifact_with_source_ref("A-2", "rivet-core/src/lib.rs:1"),
            artifact_with_source_ref("A-3", "prose about src/lib.rs and things"),
        ];
        let found = rotted_source_refs(arts.iter(), root);
        assert_eq!(found.len(), 1, "exactly the missing one: {found:?}");
        assert_eq!(found[0].0, "A-1");
        assert_eq!(found[0].2, "rivet-core/src/does-not-exist.rs");
        // A-2 is the control: without a live reference in the fixture this
        // would pass on a build where nothing resolves.
        assert!(
            !found.iter().any(|(id, _, _)| id == "A-2"),
            "a live reference must not be reported"
        );
    }

    /// An artifact with no `source-ref` must not be reached at all.
    #[test]
    fn the_collector_ignores_artifacts_without_a_source_ref() {
        let root = std::path::Path::new(env!("CARGO_MANIFEST_DIR"));
        let a = rivet_core::model::Artifact {
            id: "A-9".into(),
            artifact_type: "requirement".into(),
            title: "t".into(),
            ..Default::default()
        };
        assert!(rotted_source_refs([a].iter(), root).is_empty());
    }

    /// The two real rotted references, and a live one as the control. Without
    /// the control this would pass on a build where NOTHING resolves.
    // rivet: verifies REQ-358
    #[test]
    fn the_corpus_rot_is_detected_and_live_refs_are_not() {
        let root = std::path::Path::new(env!("CARGO_MANIFEST_DIR"))
            .parent()
            .expect("workspace root");
        for dead in [
            "rivet-core/src/formats/stpa.rs:1",
            "rivet-cli/src/serve.rs:1",
        ] {
            let base = source_ref_path(dead).expect("path-shaped");
            assert!(
                !root.join(base).exists(),
                "{dead} is the recorded rot — if this now exists, the reference was \
                 fixed and this test must be updated rather than deleted"
            );
        }
        let live = source_ref_path("rivet-core/src/lib.rs:1").expect("path-shaped");
        assert!(
            root.join(live).exists(),
            "control: a live reference must resolve, or the check is vacuous"
        );
    }

    // ── REQ-357: a drift gate that examined nothing must not report success ──
    //
    // `rivet check sources` is the cited-source drift gate. Its exit code was
    // `firing == 0`, summed over drift / missing-hash / read-error /
    // shape-error (+ stale under --strict). On a corpus with NO cited-sources
    // every one of those counters is 0, so the command exits 0 having checked
    // nothing. Measured on this repository:
    //
    //   $ rivet check sources
    //   No artifacts have a cited-source field.
    //   $ echo $?
    //   0
    //
    // The text output is honest. The EXIT CODE is not: a pipeline that runs
    // this as an audit gate reads 0 as "sources verified" when the population
    // was empty. Absence reported as success — and on the assurance chain,
    // where citation freshness is the evidence.
    //
    // The fix is a positive control the caller opts into, not a changed
    // default: a project with no citations is a legitimate configuration and
    // must keep exiting 0.

    fn rep(total: usize, drift: usize, stale: usize) -> Report {
        Report {
            total,
            by_status: StatusCounts {
                r#match: total.saturating_sub(drift + stale),
                drift,
                stale,
                ..Default::default()
            },
            ..Default::default()
        }
    }

    #[test]
    fn min_zero_is_the_current_behaviour_and_accepts_an_empty_corpus() {
        assert_eq!(gate_reason(&rep(0, 0, 0), false, 0), None);
    }

    // rivet: verifies REQ-357
    #[test]
    fn an_empty_corpus_fails_when_a_minimum_is_required() {
        let why = gate_reason(&rep(0, 0, 0), false, 1)
            .expect("requiring 1 citation over an empty corpus must fail");
        assert!(
            why.contains("0") && why.contains("checked nothing"),
            "the message must say the population was empty, not merely that a \
             threshold was missed: {why}"
        );
    }

    /// The shortfall must be reported against the REQUESTED minimum, so a
    /// corpus that shrank below it is caught too — not only the empty case.
    #[test]
    fn a_shrunken_corpus_fails_against_its_declared_minimum() {
        let why = gate_reason(&rep(3, 0, 0), false, 5).expect("3 < 5 must fail");
        assert!(why.contains('3') && why.contains('5'), "got: {why}");
        assert_eq!(gate_reason(&rep(5, 0, 0), false, 5), None, "5 >= 5 passes");
    }

    /// --min is a floor on the population, NOT a substitute for the drift
    /// check. A corpus that meets the minimum and has drifted must still fail,
    /// or the new flag would mask the defect the command exists to find.
    // rivet: verifies REQ-357
    #[test]
    fn meeting_the_minimum_does_not_excuse_drift() {
        let why = gate_reason(&rep(5, 2, 0), false, 5).expect("drift must still fire");
        assert!(why.contains("drift"), "got: {why}");
    }

    /// And the two compose: --strict adds stale to the firing set, and that
    /// must survive a satisfied --min.
    #[test]
    fn strict_stale_still_fires_under_a_satisfied_minimum() {
        assert_eq!(
            gate_reason(&rep(5, 0, 2), false, 5),
            None,
            "stale is quiet without --strict"
        );
        let why = gate_reason(&rep(5, 0, 2), true, 5).expect("--strict must fire on stale");
        assert!(why.contains("stale"), "got: {why}");
    }

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
