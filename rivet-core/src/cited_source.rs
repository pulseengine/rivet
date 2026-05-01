// SAFETY-REVIEW (SCRC Phase 1, DD-058): File-scope blanket allow for
// the v0.4.3 clippy restriction-lint escalation. These lints are enabled
// at workspace scope at `warn` so new violations surface in CI; existing
// call sites here are grandfathered in via this file-level allow until
// Phase 2 (per-site #[allow(...)] + rewrite). Rationale per lint class:
// see other rivet-core modules.
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

//! Typed `cited-source` field — sha256-stamped reference to an external source.
//!
//! See `rivet docs schema-cited-sources` for the user-facing reference.
//!
//! Phase 1 scope (issue #237):
//! - First-class typed schema field with shape `{ uri, kind, sha256, last-checked }`.
//! - URI scheme allowlist, enforced at validation time.
//! - `kind: file` backend — re-read the file on disk, recompute sha256,
//!   compare to the stamped value.
//! - Remote kinds (`url`, `github`, `oslc`, `reqif`, `polarion`) are
//!   recognised by the schema but Phase 1 does NOT implement their
//!   backends. They round-trip through the validator unchanged with an
//!   Info diagnostic when `--check-remote-sources` is requested.

use std::path::{Path, PathBuf};

use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};

use crate::model::Artifact;
use crate::schema::Severity;
use crate::validate::Diagnostic;

/// Allowed `cited-source.kind` values.
///
/// Phase 1 only implements `File`. The other kinds round-trip but are
/// skipped at validate time unless `--check-remote-sources` is set
/// (which becomes a real backend in Phase 2).
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum CitedSourceKind {
    File,
    Url,
    Github,
    Oslc,
    Reqif,
    Polarion,
}

impl CitedSourceKind {
    /// Human-readable label.
    pub fn as_str(self) -> &'static str {
        match self {
            CitedSourceKind::File => "file",
            CitedSourceKind::Url => "url",
            CitedSourceKind::Github => "github",
            CitedSourceKind::Oslc => "oslc",
            CitedSourceKind::Reqif => "reqif",
            CitedSourceKind::Polarion => "polarion",
        }
    }

    /// True for kinds whose backend is implemented in Phase 1.
    pub fn is_local(self) -> bool {
        matches!(self, CitedSourceKind::File)
    }
}

/// Parsed and validated `cited-source` field.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct CitedSource {
    pub uri: String,
    pub kind: CitedSourceKind,
    pub sha256: Option<String>,
    pub last_checked: Option<String>,
}

/// URI schemes the cited-source field accepts. Schemes outside this
/// allowlist are rejected at validate time — defence against arbitrary
/// schemes from untrusted YAML (exfiltration / SSRF surface).
pub const ALLOWED_URI_SCHEMES: &[&str] = &[
    "file", "http", "https", "github", "oslc", "reqif", "polarion",
];

/// Extract the scheme component of a URI, lowercased.
///
/// Recognises both the canonical `scheme://rest` form and the bare
/// `scheme:rest` form (e.g. `javascript:alert(1)`, `mailto:x@y`). The
/// scheme component must satisfy the RFC 3986 grammar
/// (`ALPHA *( ALPHA / DIGIT / "+" / "-" / "." )`); other prefixes (like
/// drive letters `C:\…` or naked windows paths) return `None` so the
/// caller can treat them as relative.
pub fn uri_scheme(uri: &str) -> Option<String> {
    // Find the first `:` and verify everything before it is a valid scheme.
    let colon = uri.find(':')?;
    let head = &uri[..colon];
    if head.is_empty() {
        return None;
    }
    let mut chars = head.chars();
    let first = chars.next()?;
    if !first.is_ascii_alphabetic() {
        return None;
    }
    if !chars.all(|c| c.is_ascii_alphanumeric() || c == '+' || c == '-' || c == '.') {
        return None;
    }
    // Reject single-letter schemes (the "C:" drive-letter case on Windows).
    if head.len() == 1 {
        return None;
    }
    Some(head.to_ascii_lowercase())
}

/// Compute the hex-encoded sha256 of a byte slice.
pub fn sha256_hex(bytes: &[u8]) -> String {
    let mut hasher = Sha256::new();
    hasher.update(bytes);
    let digest = hasher.finalize();
    let mut s = String::with_capacity(64);
    for byte in digest.iter() {
        use std::fmt::Write;
        let _ = write!(&mut s, "{byte:02x}");
    }
    s
}

/// Compute the sha256 of a file's contents.
pub fn sha256_file(path: &Path) -> std::io::Result<String> {
    let bytes = std::fs::read(path)?;
    Ok(sha256_hex(&bytes))
}

/// Errors encountered when interpreting a raw `cited-source` field.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum CitedSourceParseError {
    /// The field is not a YAML mapping.
    NotAMapping,
    /// Required `uri` is missing or not a string.
    MissingUri,
    /// Required `kind` is missing or not a string.
    MissingKind,
    /// `kind` is not one of the allowed values.
    UnknownKind(String),
    /// URI uses an unrecognised scheme.
    UnknownScheme(String),
}

impl std::fmt::Display for CitedSourceParseError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            CitedSourceParseError::NotAMapping => {
                write!(f, "cited-source must be a mapping with uri/kind keys")
            }
            CitedSourceParseError::MissingUri => {
                write!(f, "cited-source missing required 'uri' (string)")
            }
            CitedSourceParseError::MissingKind => {
                write!(f, "cited-source missing required 'kind' (string)")
            }
            CitedSourceParseError::UnknownKind(k) => write!(
                f,
                "cited-source.kind = '{k}' is not one of file|url|github|oslc|reqif|polarion"
            ),
            CitedSourceParseError::UnknownScheme(s) => write!(
                f,
                "cited-source.uri uses scheme '{s}' which is not in the allowlist {ALLOWED_URI_SCHEMES:?}"
            ),
        }
    }
}

/// Parse a `serde_yaml::Value` into a typed `CitedSource`.
///
/// Validates that:
/// - the value is a mapping
/// - `uri` and `kind` are present and stringy
/// - `kind` is one of the allowed enum values
/// - the URI scheme (when one is present) is in `ALLOWED_URI_SCHEMES`
///   (relative paths and bare filenames are accepted for `kind: file`)
pub fn parse_cited_source(value: &serde_yaml::Value) -> Result<CitedSource, CitedSourceParseError> {
    let map = value
        .as_mapping()
        .ok_or(CitedSourceParseError::NotAMapping)?;

    let uri = map
        .get(serde_yaml::Value::String("uri".into()))
        .and_then(|v| v.as_str())
        .ok_or(CitedSourceParseError::MissingUri)?
        .to_string();

    let kind_raw = map
        .get(serde_yaml::Value::String("kind".into()))
        .and_then(|v| v.as_str())
        .ok_or(CitedSourceParseError::MissingKind)?;

    let kind = match kind_raw {
        "file" => CitedSourceKind::File,
        "url" => CitedSourceKind::Url,
        "github" => CitedSourceKind::Github,
        "oslc" => CitedSourceKind::Oslc,
        "reqif" => CitedSourceKind::Reqif,
        "polarion" => CitedSourceKind::Polarion,
        other => return Err(CitedSourceParseError::UnknownKind(other.to_string())),
    };

    // Scheme allowlist enforcement. Relative paths (no `://`) are
    // accepted only for kind: file — otherwise the URI must declare a
    // scheme. file paths without a scheme are interpreted relative to
    // the project root in `validate_cited_source`.
    if let Some(scheme) = uri_scheme(&uri) {
        if !ALLOWED_URI_SCHEMES.contains(&scheme.as_str()) {
            return Err(CitedSourceParseError::UnknownScheme(scheme));
        }
    }

    let sha256 = map
        .get(serde_yaml::Value::String("sha256".into()))
        .and_then(|v| v.as_str())
        .map(|s| s.to_string());

    let last_checked = map
        .get(serde_yaml::Value::String("last-checked".into()))
        .and_then(|v| v.as_str())
        .map(|s| s.to_string());

    Ok(CitedSource {
        uri,
        kind,
        sha256,
        last_checked,
    })
}

/// Resolve a `kind: file` URI to an absolute filesystem path.
///
/// Accepts:
/// - bare relative paths (e.g. `./testdata/source.txt`) — joined to `project_root`
/// - bare absolute paths (e.g. `/etc/hosts`) — used as-is
/// - `file://` URIs — the path component is extracted
pub fn resolve_file_uri(uri: &str, project_root: &Path) -> PathBuf {
    if let Some(rest) = uri.strip_prefix("file://") {
        let p = Path::new(rest);
        if p.is_absolute() {
            return p.to_path_buf();
        }
        return project_root.join(p);
    }

    let p = Path::new(uri);
    if p.is_absolute() {
        p.to_path_buf()
    } else {
        project_root.join(p)
    }
}

/// Outcome of checking a single `cited-source` field against its source.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum CheckOutcome {
    /// sha256 matches — no drift.
    Match,
    /// sha256 differs from the file on disk. Carries the freshly computed hash.
    Drift { computed: String },
    /// `sha256` field was missing from the artifact YAML; carries computed.
    MissingHash { computed: String },
    /// The file referenced by the URI could not be read.
    FileError { reason: String },
    /// Phase 1 does not implement this kind's backend; skipped.
    SkippedRemote,
}

/// Default staleness threshold (in days) for `last-checked`.
///
/// `cited-source-stale` Info diagnostics fire when `last-checked` is
/// missing or older than this many days. Phase 1 ships a single global
/// default; per-schema overrides are deferred to a follow-up feature.
pub const STALE_DAYS_DEFAULT: i64 = 30;

/// Parse an ISO-8601 UTC timestamp (`YYYY-MM-DDTHH:MM:SSZ`) into epoch
/// seconds. Returns `None` if the string is malformed.
///
/// Hand-rolled to avoid pulling chrono into the core. Accepts the
/// canonical `Z` form rivet emits via [`current_iso8601_utc`]; tolerates
/// fractional seconds like `2026-04-27T12:00:00.123Z` by truncating.
pub fn parse_iso8601_utc(s: &str) -> Option<i64> {
    // Strip trailing Z (required) and any fractional seconds.
    let s = s.strip_suffix('Z')?;
    // Strip fractional seconds (e.g. `.123`).
    let s = match s.find('.') {
        Some(i) => &s[..i],
        None => s,
    };
    // Expect "YYYY-MM-DDTHH:MM:SS"
    let (date, time) = s.split_once('T')?;

    let (year_s, rest) = date.split_once('-')?;
    let (month_s, day_s) = rest.split_once('-')?;
    let year: i64 = year_s.parse().ok()?;
    let month: i64 = month_s.parse().ok()?;
    let day: i64 = day_s.parse().ok()?;
    if !(1..=12).contains(&month) || !(1..=31).contains(&day) {
        return None;
    }

    let (hour_s, rest) = time.split_once(':')?;
    let (minute_s, second_s) = rest.split_once(':')?;
    let hour: i64 = hour_s.parse().ok()?;
    let minute: i64 = minute_s.parse().ok()?;
    let second: i64 = second_s.parse().ok()?;
    if !(0..24).contains(&hour) || !(0..60).contains(&minute) || !(0..=60).contains(&second) {
        return None;
    }

    // Howard Hinnant's "days_from_civil" — inverse of the civil_from_days
    // used to format these timestamps elsewhere in the codebase.
    let y = if month <= 2 { year - 1 } else { year };
    let era = if y >= 0 { y } else { y - 399 } / 400;
    let yoe = y - era * 400; // [0, 399]
    let m = month;
    let d = day;
    let doy = (153 * (if m > 2 { m - 3 } else { m + 9 }) + 2) / 5 + d - 1; // [0, 365]
    let doe = yoe * 365 + yoe / 4 - yoe / 100 + doy; // [0, 146096]
    let days = era * 146_097 + doe - 719_468;

    Some(days * 86_400 + hour * 3600 + minute * 60 + second)
}

/// Best-effort current epoch seconds (UTC). Returns 0 on clock errors,
/// which are practically impossible.
fn now_epoch_seconds() -> i64 {
    use std::time::{SystemTime, UNIX_EPOCH};
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_secs() as i64)
        .unwrap_or(0)
}

/// Staleness verdict for a `last-checked` timestamp.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum StaleStatus {
    /// `last-checked` is present and within the freshness window.
    Fresh,
    /// `last-checked` is missing.
    Missing,
    /// `last-checked` is present but older than `threshold_days` (carries
    /// the computed age in days).
    Old { age_days: i64 },
    /// `last-checked` is present but malformed; treated as stale so the
    /// audit doesn't silently pass.
    Unparseable,
}

/// Compute the staleness verdict for an optional `last-checked` value
/// against a threshold (in days). `now_epoch` is exposed for testing.
pub fn classify_staleness(
    last_checked: Option<&str>,
    threshold_days: i64,
    now_epoch: i64,
) -> StaleStatus {
    let Some(s) = last_checked else {
        return StaleStatus::Missing;
    };
    let Some(checked_epoch) = parse_iso8601_utc(s) else {
        return StaleStatus::Unparseable;
    };
    let age_seconds = now_epoch - checked_epoch;
    let age_days = age_seconds.div_euclid(86_400);
    if age_days > threshold_days {
        StaleStatus::Old { age_days }
    } else {
        StaleStatus::Fresh
    }
}

/// Public wrapper that uses the system clock.
pub fn classify_staleness_now(last_checked: Option<&str>, threshold_days: i64) -> StaleStatus {
    classify_staleness(last_checked, threshold_days, now_epoch_seconds())
}

/// Check one `cited-source` field for drift.
///
/// `project_root` is the directory used to resolve relative `kind: file`
/// URIs. `check_remote` is the user's `--check-remote-sources` flag — in
/// Phase 1 this only affects whether remote kinds emit
/// `SkippedRemote` (they always skip the actual hash check).
pub fn check_cited_source(
    src: &CitedSource,
    project_root: &Path,
    _check_remote: bool,
) -> CheckOutcome {
    if !src.kind.is_local() {
        // Phase 2 wires the http/github/oslc/reqif/polarion backends.
        return CheckOutcome::SkippedRemote;
    }

    let path = resolve_file_uri(&src.uri, project_root);
    let computed = match sha256_file(&path) {
        Ok(h) => h,
        Err(e) => {
            return CheckOutcome::FileError {
                reason: format!("{}: {e}", path.display()),
            };
        }
    };

    match &src.sha256 {
        None => CheckOutcome::MissingHash { computed },
        Some(stamped) if stamped.eq_ignore_ascii_case(&computed) => CheckOutcome::Match,
        Some(_) => CheckOutcome::Drift { computed },
    }
}

/// Validate every artifact's `cited-source` field and return the
/// resulting diagnostics.
///
/// `project_root` is used to resolve relative `kind: file` URIs. The
/// `strict` flag promotes drift / missing-hash diagnostics from
/// `Severity::Warning` to `Severity::Error` (the
/// `--strict-cited-sources` CLI flag). `strict_stale` similarly
/// promotes `cited-source-stale` from `Severity::Info` to
/// `Severity::Error` (the `--strict-cited-source-stale` flag).
pub fn validate_cited_sources(
    artifacts: impl IntoIterator<Item = Artifact>,
    project_root: &Path,
    strict: bool,
    strict_stale: bool,
    check_remote: bool,
) -> Vec<Diagnostic> {
    let mut diagnostics = Vec::new();
    let drift_severity = if strict {
        Severity::Error
    } else {
        Severity::Warning
    };
    let stale_severity = if strict_stale {
        Severity::Error
    } else {
        Severity::Info
    };
    let now = now_epoch_seconds();

    for artifact in artifacts {
        let Some(raw) = artifact.fields.get("cited-source") else {
            continue;
        };
        let parsed = match parse_cited_source(raw) {
            Ok(p) => p,
            Err(e) => {
                diagnostics.push(Diagnostic::new(
                    Severity::Error,
                    Some(artifact.id.clone()),
                    "cited-source-shape",
                    e.to_string(),
                ));
                continue;
            }
        };

        let outcome = check_cited_source(&parsed, project_root, check_remote);
        match outcome {
            CheckOutcome::Match => {}
            CheckOutcome::Drift { computed } => {
                diagnostics.push(Diagnostic::new(
                    drift_severity,
                    Some(artifact.id.clone()),
                    "cited-source-drift",
                    format!(
                        "cited-source '{}' (kind: {}) sha256 mismatch — stamped {} but file hashes to {}",
                        parsed.uri,
                        parsed.kind.as_str(),
                        parsed.sha256.as_deref().unwrap_or("(unknown)"),
                        computed,
                    ),
                ));
            }
            CheckOutcome::MissingHash { computed } => {
                diagnostics.push(Diagnostic::new(
                    drift_severity,
                    Some(artifact.id.clone()),
                    "cited-source-drift",
                    format!(
                        "cited-source '{}' (kind: {}) is missing the sha256 stamp; current file hashes to {} — run `rivet check sources --update --apply` to set",
                        parsed.uri,
                        parsed.kind.as_str(),
                        computed,
                    ),
                ));
            }
            CheckOutcome::FileError { reason } => {
                diagnostics.push(Diagnostic::new(
                    Severity::Error,
                    Some(artifact.id.clone()),
                    "cited-source-drift",
                    format!(
                        "cited-source '{}' (kind: file) could not be read: {reason}",
                        parsed.uri,
                    ),
                ));
            }
            CheckOutcome::SkippedRemote => {
                if check_remote {
                    diagnostics.push(Diagnostic::new(
                        Severity::Info,
                        Some(artifact.id.clone()),
                        "cited-source-skipped",
                        format!(
                            "cited-source '{}' (kind: {}) — remote backend not yet implemented (Phase 2)",
                            parsed.uri,
                            parsed.kind.as_str(),
                        ),
                    ));
                }
            }
        }

        if parsed.kind.is_local() {
            let stale = classify_staleness(parsed.last_checked.as_deref(), STALE_DAYS_DEFAULT, now);
            match stale {
                StaleStatus::Fresh => {}
                StaleStatus::Missing => {
                    diagnostics.push(Diagnostic::new(
                        stale_severity,
                        Some(artifact.id.clone()),
                        "cited-source-stale",
                        format!(
                            "cited-source '{}' has no 'last-checked' timestamp; consider running `rivet check sources --update`",
                            parsed.uri,
                        ),
                    ));
                }
                StaleStatus::Old { age_days } => {
                    diagnostics.push(Diagnostic::new(
                        stale_severity,
                        Some(artifact.id.clone()),
                        "cited-source-stale",
                        format!(
                            "cited-source '{}' last-checked is {age_days} day(s) old (threshold: {STALE_DAYS_DEFAULT}); re-verify with `rivet check sources --update`",
                            parsed.uri,
                        ),
                    ));
                }
                StaleStatus::Unparseable => {
                    diagnostics.push(Diagnostic::new(
                        stale_severity,
                        Some(artifact.id.clone()),
                        "cited-source-stale",
                        format!(
                            "cited-source '{}' has an unparseable 'last-checked' timestamp ({}); expected ISO-8601 UTC like 2026-04-27T12:00:00Z",
                            parsed.uri,
                            parsed.last_checked.as_deref().unwrap_or(""),
                        ),
                    ));
                }
            }
        }
    }

    diagnostics
}

/// Update an artifact's `cited-source.sha256` and `last-checked` fields
/// in place by re-writing the YAML file at `file_path`. Returns `Ok(true)`
/// if the file was modified, `Ok(false)` if no change was needed.
///
/// Uses a line-oriented edit to preserve comments and ordering. The
/// strategy is:
///
/// 1. Find the artifact block by `- id: <id>`.
/// 2. Within that block, find `cited-source:` (under `fields:`).
/// 3. Walk the nested mapping until we find `sha256:` and `last-checked:`,
///    replacing or inserting them.
///
/// Limitations:
/// - The `cited-source:` block must already be a YAML mapping (not a flow
///   `{}` form). Phase 1 ships only the canonical block form.
/// - Comments inside the cited-source block are preserved verbatim.
pub fn update_cited_source_in_file(
    file_path: &Path,
    artifact_id: &str,
    new_sha256: &str,
    new_last_checked: &str,
) -> Result<bool, std::io::Error> {
    let content = std::fs::read_to_string(file_path)?;
    let lines: Vec<String> = content.lines().map(str::to_string).collect();

    // Locate the artifact block
    let id_marker_a = format!("- id: {artifact_id}");
    let id_marker_b = format!("- id: \"{artifact_id}\"");
    let id_marker_c = format!("- id: '{artifact_id}'");
    let block_start = lines.iter().position(|l| {
        let t = l.trim_start();
        t.starts_with(&id_marker_a) || t.starts_with(&id_marker_b) || t.starts_with(&id_marker_c)
    });

    let Some(block_start) = block_start else {
        return Err(std::io::Error::new(
            std::io::ErrorKind::NotFound,
            format!(
                "artifact '{artifact_id}' not found in {}",
                file_path.display()
            ),
        ));
    };

    // Determine the indent of fields in this block (the `id:` line indent)
    let field_indent = lines[block_start].find('-').map(|d| d + 2).unwrap_or(2);

    // Find next `- id:` (or EOF) — that's the block end
    let block_end = lines
        .iter()
        .enumerate()
        .skip(block_start + 1)
        .find(|(_, l)| {
            let t = l.trim_start();
            t.starts_with("- id:") || t.starts_with("- id ")
        })
        .map(|(i, _)| i)
        .unwrap_or(lines.len());

    // Locate `fields:` line within the block
    let fields_line = (block_start + 1..block_end).find(|&i| {
        let line = &lines[i];
        let trimmed = line.trim();
        let indent = line.len() - line.trim_start().len();
        indent == field_indent && trimmed.starts_with("fields:")
    });

    let Some(fields_line) = fields_line else {
        return Err(std::io::Error::new(
            std::io::ErrorKind::InvalidData,
            format!("artifact '{artifact_id}' has no `fields:` section to host cited-source"),
        ));
    };

    let sub_indent = field_indent + 2;

    // Locate the `cited-source:` line under `fields:`
    let cited_source_line = (fields_line + 1..block_end).find(|&i| {
        let line = &lines[i];
        let trimmed = line.trim();
        let indent = line.len() - line.trim_start().len();
        indent == sub_indent && trimmed.starts_with("cited-source:")
    });

    let Some(cited_source_line) = cited_source_line else {
        return Err(std::io::Error::new(
            std::io::ErrorKind::InvalidData,
            format!("artifact '{artifact_id}' has no cited-source: under fields:"),
        ));
    };

    // The cited-source block's interior fields should be at indent +2 from cited-source
    let inner_indent = sub_indent + 2;

    // Find the end of the cited-source block — first line at indent <= sub_indent
    let cs_block_end = (cited_source_line + 1..block_end)
        .find(|&i| {
            let line = &lines[i];
            if line.trim().is_empty() {
                return false;
            }
            let indent = line.len() - line.trim_start().len();
            indent <= sub_indent
        })
        .unwrap_or(block_end);

    // Find existing sha256 / last-checked lines.
    let mut sha256_line: Option<usize> = None;
    let mut last_checked_line: Option<usize> = None;
    for (i, line) in lines
        .iter()
        .enumerate()
        .take(cs_block_end)
        .skip(cited_source_line + 1)
    {
        let trimmed = line.trim();
        let indent = line.len() - line.trim_start().len();
        if indent != inner_indent {
            continue;
        }
        if trimmed.starts_with("sha256:") {
            sha256_line = Some(i);
        } else if trimmed.starts_with("last-checked:") {
            last_checked_line = Some(i);
        }
    }

    let mut new_lines = lines.clone();
    let pad = " ".repeat(inner_indent);

    let new_sha_line = format!("{pad}sha256: {new_sha256}");
    let new_lc_line = format!("{pad}last-checked: {new_last_checked}");

    let mut changed = false;

    match sha256_line {
        Some(i) => {
            if new_lines[i] != new_sha_line {
                new_lines[i] = new_sha_line;
                changed = true;
            }
        }
        None => {
            new_lines.insert(cs_block_end, new_sha_line);
            changed = true;
        }
    }

    // Recompute end after possible insertion above
    let cs_block_end_after_sha = if sha256_line.is_none() {
        cs_block_end + 1
    } else {
        cs_block_end
    };

    let last_checked_line = if sha256_line.is_none() {
        last_checked_line.map(|i| if i >= cs_block_end { i + 1 } else { i })
    } else {
        last_checked_line
    };

    match last_checked_line {
        Some(i) => {
            if new_lines[i] != new_lc_line {
                new_lines[i] = new_lc_line;
                changed = true;
            }
        }
        None => {
            new_lines.insert(cs_block_end_after_sha, new_lc_line);
            changed = true;
        }
    }

    if changed {
        let mut out = new_lines.join("\n");
        if content.ends_with('\n') && !out.ends_with('\n') {
            out.push('\n');
        }
        std::fs::write(file_path, out)?;
    }

    Ok(changed)
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::collections::BTreeMap;
    use std::io::Write;

    fn yaml_value(s: &str) -> serde_yaml::Value {
        serde_yaml::from_str(s).expect("valid YAML")
    }

    #[test]
    fn sha256_hex_matches_known_vector() {
        // sha256("abc") = ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad
        assert_eq!(
            sha256_hex(b"abc"),
            "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"
        );
    }

    #[test]
    fn sha256_hex_empty_input() {
        // sha256("") = e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
        assert_eq!(
            sha256_hex(b""),
            "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
        );
    }

    #[test]
    fn sha256_file_round_trip() {
        let mut f = tempfile::NamedTempFile::new().unwrap();
        f.write_all(b"hello world").unwrap();
        let h = sha256_file(f.path()).unwrap();
        assert_eq!(h, sha256_hex(b"hello world"));
    }

    #[test]
    fn uri_scheme_extraction() {
        assert_eq!(uri_scheme("file:///tmp/x"), Some("file".into()));
        assert_eq!(uri_scheme("https://example.com"), Some("https".into()));
        assert_eq!(uri_scheme("HTTPS://x"), Some("https".into()));
        assert_eq!(uri_scheme("./local"), None);
        assert_eq!(uri_scheme("plain.txt"), None);
    }

    #[test]
    fn parse_minimal_cited_source() {
        let v = yaml_value("uri: ./x.md\nkind: file");
        let cs = parse_cited_source(&v).unwrap();
        assert_eq!(cs.uri, "./x.md");
        assert_eq!(cs.kind, CitedSourceKind::File);
        assert_eq!(cs.sha256, None);
    }

    #[test]
    fn parse_full_cited_source() {
        let v = yaml_value(
            r#"
uri: file:///tmp/source.txt
kind: file
sha256: ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad
last-checked: 2026-04-28T14:30:00Z
"#,
        );
        let cs = parse_cited_source(&v).unwrap();
        assert_eq!(cs.kind, CitedSourceKind::File);
        assert!(cs.sha256.is_some());
        assert!(cs.last_checked.is_some());
    }

    #[test]
    fn parse_rejects_unknown_kind() {
        let v = yaml_value("uri: x\nkind: bogus");
        let err = parse_cited_source(&v).unwrap_err();
        assert!(matches!(err, CitedSourceParseError::UnknownKind(_)));
    }

    #[test]
    fn parse_rejects_unknown_scheme() {
        let v = yaml_value("uri: ftp://evil.example.com/exfil\nkind: url");
        let err = parse_cited_source(&v).unwrap_err();
        assert!(matches!(err, CitedSourceParseError::UnknownScheme(_)));
    }

    #[test]
    fn parse_rejects_javascript_uri() {
        // SSRF / exfiltration mitigation: arbitrary schemes from untrusted
        // YAML must be rejected before any backend touches them.
        let v = yaml_value("uri: 'javascript:alert(1)'\nkind: url");
        let err = parse_cited_source(&v).unwrap_err();
        assert!(matches!(err, CitedSourceParseError::UnknownScheme(_)));
    }

    #[test]
    fn parse_accepts_relative_path_for_file_kind() {
        let v = yaml_value("uri: ./testdata/source.txt\nkind: file");
        assert!(parse_cited_source(&v).is_ok());
    }

    #[test]
    fn parse_rejects_missing_uri() {
        let v = yaml_value("kind: file");
        assert!(matches!(
            parse_cited_source(&v).unwrap_err(),
            CitedSourceParseError::MissingUri
        ));
    }

    #[test]
    fn parse_rejects_missing_kind() {
        let v = yaml_value("uri: x");
        assert!(matches!(
            parse_cited_source(&v).unwrap_err(),
            CitedSourceParseError::MissingKind
        ));
    }

    #[test]
    fn check_file_match() {
        let dir = tempfile::tempdir().unwrap();
        let p = dir.path().join("doc.md");
        std::fs::write(&p, "hello").unwrap();
        let stamped = sha256_hex(b"hello");

        let cs = CitedSource {
            uri: "doc.md".into(),
            kind: CitedSourceKind::File,
            sha256: Some(stamped),
            last_checked: Some("2026-04-27T00:00:00Z".into()),
        };
        let outcome = check_cited_source(&cs, dir.path(), false);
        assert_eq!(outcome, CheckOutcome::Match);
    }

    #[test]
    fn check_file_drift() {
        let dir = tempfile::tempdir().unwrap();
        let p = dir.path().join("doc.md");
        std::fs::write(&p, "hello").unwrap();

        let cs = CitedSource {
            uri: "doc.md".into(),
            kind: CitedSourceKind::File,
            sha256: Some("0".repeat(64)),
            last_checked: None,
        };
        match check_cited_source(&cs, dir.path(), false) {
            CheckOutcome::Drift { computed } => {
                assert_eq!(computed, sha256_hex(b"hello"));
            }
            other => panic!("expected Drift, got {other:?}"),
        }
    }

    #[test]
    fn check_file_missing_hash() {
        let dir = tempfile::tempdir().unwrap();
        let p = dir.path().join("doc.md");
        std::fs::write(&p, "hello").unwrap();

        let cs = CitedSource {
            uri: "doc.md".into(),
            kind: CitedSourceKind::File,
            sha256: None,
            last_checked: None,
        };
        match check_cited_source(&cs, dir.path(), false) {
            CheckOutcome::MissingHash { .. } => {}
            other => panic!("expected MissingHash, got {other:?}"),
        }
    }

    #[test]
    fn check_remote_kind_skipped() {
        let cs = CitedSource {
            uri: "https://example.com".into(),
            kind: CitedSourceKind::Url,
            sha256: None,
            last_checked: None,
        };
        let outcome = check_cited_source(&cs, Path::new("."), false);
        assert_eq!(outcome, CheckOutcome::SkippedRemote);
    }

    #[test]
    fn validate_cited_sources_emits_drift_diagnostic() {
        let dir = tempfile::tempdir().unwrap();
        let p = dir.path().join("doc.md");
        std::fs::write(&p, "v1").unwrap();
        let original_hash = sha256_hex(b"v1");

        // mutate the file
        std::fs::write(&p, "v2").unwrap();

        let mut artifact = Artifact {
            id: "REQ-1".into(),
            artifact_type: "requirement".into(),
            title: "t".into(),
            description: None,
            status: None,
            tags: vec![],
            links: vec![],
            fields: BTreeMap::new(),
            provenance: None,
            source_file: None,
        };
        let mut cs_map = serde_yaml::Mapping::new();
        cs_map.insert("uri".into(), "doc.md".into());
        cs_map.insert("kind".into(), "file".into());
        cs_map.insert("sha256".into(), original_hash.into());
        artifact
            .fields
            .insert("cited-source".into(), serde_yaml::Value::Mapping(cs_map));

        let diags = validate_cited_sources(vec![artifact], dir.path(), false, false, false);
        assert!(diags.iter().any(|d| d.rule == "cited-source-drift"));
    }

    #[test]
    fn validate_cited_sources_strict_promotes_to_error() {
        let dir = tempfile::tempdir().unwrap();
        let p = dir.path().join("doc.md");
        std::fs::write(&p, "v1").unwrap();
        let original_hash = sha256_hex(b"v1");
        std::fs::write(&p, "v2").unwrap();

        let mut artifact = Artifact {
            id: "REQ-1".into(),
            artifact_type: "requirement".into(),
            title: "t".into(),
            description: None,
            status: None,
            tags: vec![],
            links: vec![],
            fields: BTreeMap::new(),
            provenance: None,
            source_file: None,
        };
        let mut cs_map = serde_yaml::Mapping::new();
        cs_map.insert("uri".into(), "doc.md".into());
        cs_map.insert("kind".into(), "file".into());
        cs_map.insert("sha256".into(), original_hash.into());
        artifact
            .fields
            .insert("cited-source".into(), serde_yaml::Value::Mapping(cs_map));

        let diags = validate_cited_sources(vec![artifact], dir.path(), true, false, false);
        let drift = diags
            .iter()
            .find(|d| d.rule == "cited-source-drift")
            .expect("drift diag");
        assert_eq!(drift.severity, Severity::Error);
    }

    #[test]
    fn validate_cited_sources_no_field_no_diag() {
        let artifact = Artifact {
            id: "REQ-1".into(),
            artifact_type: "requirement".into(),
            title: "t".into(),
            description: None,
            status: None,
            tags: vec![],
            links: vec![],
            fields: BTreeMap::new(),
            provenance: None,
            source_file: None,
        };
        let diags = validate_cited_sources(vec![artifact], Path::new("."), false, false, false);
        assert!(diags.is_empty());
    }

    #[test]
    fn resolve_file_uri_relative() {
        let root = Path::new("/proj");
        assert_eq!(
            resolve_file_uri("./x.md", root),
            PathBuf::from("/proj/./x.md")
        );
    }

    #[test]
    fn resolve_file_uri_absolute() {
        let root = Path::new("/proj");
        assert_eq!(
            resolve_file_uri("/etc/hosts", root),
            PathBuf::from("/etc/hosts")
        );
    }

    #[test]
    fn resolve_file_uri_with_scheme() {
        let root = Path::new("/proj");
        assert_eq!(
            resolve_file_uri("file:///etc/hosts", root),
            PathBuf::from("/etc/hosts")
        );
        assert_eq!(
            resolve_file_uri("file://relative/path", root),
            PathBuf::from("/proj/relative/path")
        );
    }

    #[test]
    fn update_cited_source_replaces_existing_fields() {
        let dir = tempfile::tempdir().unwrap();
        let yaml_path = dir.path().join("a.yaml");
        let original = "\
artifacts:
  - id: REQ-001
    type: requirement
    title: Test
    fields:
      cited-source:
        uri: ./doc.md
        kind: file
        sha256: 0000000000000000000000000000000000000000000000000000000000000000
        last-checked: 2026-01-01T00:00:00Z
";
        std::fs::write(&yaml_path, original).unwrap();

        let changed =
            update_cited_source_in_file(&yaml_path, "REQ-001", "abc123", "2026-04-27T12:00:00Z")
                .unwrap();
        assert!(changed);

        let updated = std::fs::read_to_string(&yaml_path).unwrap();
        assert!(updated.contains("sha256: abc123"));
        assert!(updated.contains("last-checked: 2026-04-27T12:00:00Z"));
        // No duplicate sha256 lines
        assert_eq!(updated.matches("sha256:").count(), 1);
        assert_eq!(updated.matches("last-checked:").count(), 1);
    }

    #[test]
    fn update_cited_source_inserts_missing_fields() {
        let dir = tempfile::tempdir().unwrap();
        let yaml_path = dir.path().join("a.yaml");
        // Note: cited-source block exists but lacks sha256 / last-checked
        let original = "\
artifacts:
  - id: REQ-001
    type: requirement
    title: Test
    fields:
      cited-source:
        uri: ./doc.md
        kind: file
";
        std::fs::write(&yaml_path, original).unwrap();

        let changed =
            update_cited_source_in_file(&yaml_path, "REQ-001", "deadbeef", "2026-04-27T12:00:00Z")
                .unwrap();
        assert!(changed);

        let updated = std::fs::read_to_string(&yaml_path).unwrap();
        assert!(updated.contains("sha256: deadbeef"));
        assert!(updated.contains("last-checked: 2026-04-27T12:00:00Z"));
    }

    #[test]
    fn parse_iso8601_known_round_trip() {
        // 1970-01-01T00:00:00Z is epoch 0.
        assert_eq!(parse_iso8601_utc("1970-01-01T00:00:00Z"), Some(0));
        // 2026-04-27T00:00:00Z — sanity: positive seconds.
        assert!(parse_iso8601_utc("2026-04-27T00:00:00Z").unwrap() > 0);
        // Fractional seconds tolerated.
        assert_eq!(parse_iso8601_utc("1970-01-01T00:00:01.123Z"), Some(1));
        // Non-UTC / no Z is rejected.
        assert_eq!(parse_iso8601_utc("2026-04-27T00:00:00"), None);
        // Garbage rejected.
        assert_eq!(parse_iso8601_utc("not-a-date"), None);
    }

    #[test]
    fn classify_staleness_fresh_missing_old() {
        // now = 2026-04-27T00:00:00Z (epoch 1777_564_800)
        let now = parse_iso8601_utc("2026-04-27T00:00:00Z").unwrap();
        // 10 days ago — fresh under 30d threshold.
        let recent = parse_iso8601_utc("2026-04-17T00:00:00Z").unwrap();
        assert_eq!(now - recent, 10 * 86_400);
        let s = "2026-04-17T00:00:00Z";
        assert_eq!(classify_staleness(Some(s), 30, now), StaleStatus::Fresh);

        // 60 days ago — stale under 30d threshold.
        let s = "2026-02-26T00:00:00Z";
        match classify_staleness(Some(s), 30, now) {
            StaleStatus::Old { age_days } => assert!(age_days > 30),
            other => panic!("expected Old, got {other:?}"),
        }

        // Missing.
        assert_eq!(classify_staleness(None, 30, now), StaleStatus::Missing);

        // Unparseable.
        assert_eq!(
            classify_staleness(Some("2026-13-99"), 30, now),
            StaleStatus::Unparseable
        );
    }

    #[test]
    fn validate_cited_sources_stale_default_is_info() {
        // A cited-source with no last-checked yields a stale Info diag.
        let dir = tempfile::tempdir().unwrap();
        let p = dir.path().join("doc.md");
        std::fs::write(&p, "v1").unwrap();
        let h = sha256_hex(b"v1");

        let mut artifact = Artifact {
            id: "REQ-1".into(),
            artifact_type: "requirement".into(),
            title: "t".into(),
            description: None,
            status: None,
            tags: vec![],
            links: vec![],
            fields: BTreeMap::new(),
            provenance: None,
            source_file: None,
        };
        let mut cs_map = serde_yaml::Mapping::new();
        cs_map.insert("uri".into(), "doc.md".into());
        cs_map.insert("kind".into(), "file".into());
        cs_map.insert("sha256".into(), h.into());
        // Note: no last-checked
        artifact
            .fields
            .insert("cited-source".into(), serde_yaml::Value::Mapping(cs_map));

        let diags = validate_cited_sources(vec![artifact], dir.path(), false, false, false);
        let stale = diags
            .iter()
            .find(|d| d.rule == "cited-source-stale")
            .expect("stale diag");
        assert_eq!(stale.severity, Severity::Info);
    }

    #[test]
    fn validate_cited_sources_strict_stale_promotes_to_error() {
        let dir = tempfile::tempdir().unwrap();
        let p = dir.path().join("doc.md");
        std::fs::write(&p, "v1").unwrap();
        let h = sha256_hex(b"v1");

        let mut artifact = Artifact {
            id: "REQ-1".into(),
            artifact_type: "requirement".into(),
            title: "t".into(),
            description: None,
            status: None,
            tags: vec![],
            links: vec![],
            fields: BTreeMap::new(),
            provenance: None,
            source_file: None,
        };
        let mut cs_map = serde_yaml::Mapping::new();
        cs_map.insert("uri".into(), "doc.md".into());
        cs_map.insert("kind".into(), "file".into());
        cs_map.insert("sha256".into(), h.into());
        // Old last-checked: 1970-01-01.
        cs_map.insert("last-checked".into(), "1970-01-01T00:00:00Z".into());
        artifact
            .fields
            .insert("cited-source".into(), serde_yaml::Value::Mapping(cs_map));

        let diags = validate_cited_sources(vec![artifact], dir.path(), false, true, false);
        let stale = diags
            .iter()
            .find(|d| d.rule == "cited-source-stale")
            .expect("stale diag");
        assert_eq!(stale.severity, Severity::Error);
        assert!(stale.message.contains("day(s) old"));
    }

    #[test]
    fn validate_cited_sources_fresh_last_checked_no_stale_diag() {
        // A cited-source with a fresh last-checked produces no stale diag.
        let dir = tempfile::tempdir().unwrap();
        let p = dir.path().join("doc.md");
        std::fs::write(&p, "v1").unwrap();
        let h = sha256_hex(b"v1");

        // Synthesize a "now-ish" timestamp by formatting the current epoch.
        let fresh = {
            let secs = now_epoch_seconds();
            // Keep it simple: subtract 1 hour. The format is permitted as long as it parses.
            // Use the helper from the sources module path indirectly: format inline.
            let days = secs.div_euclid(86_400);
            let secs_of_day = secs.rem_euclid(86_400);
            let h = secs_of_day / 3600;
            let m = (secs_of_day % 3600) / 60;
            let s = secs_of_day % 60;
            let z = days + 719_468;
            let era = if z >= 0 { z } else { z - 146_096 } / 146_097;
            let doe = (z - era * 146_097) as u64;
            let yoe = (doe - doe / 1460 + doe / 36524 - doe / 146_096) / 365;
            let y = (yoe as i64) + era * 400;
            let doy = doe - (365 * yoe + yoe / 4 - yoe / 100);
            let mp = (5 * doy + 2) / 153;
            let d = doy - (153 * mp + 2) / 5 + 1;
            let m_civ = if mp < 10 { mp + 3 } else { mp - 9 };
            let y = if m_civ <= 2 { y + 1 } else { y };
            format!("{:04}-{:02}-{:02}T{:02}:{:02}:{:02}Z", y, m_civ, d, h, m, s)
        };

        let mut artifact = Artifact {
            id: "REQ-1".into(),
            artifact_type: "requirement".into(),
            title: "t".into(),
            description: None,
            status: None,
            tags: vec![],
            links: vec![],
            fields: BTreeMap::new(),
            provenance: None,
            source_file: None,
        };
        let mut cs_map = serde_yaml::Mapping::new();
        cs_map.insert("uri".into(), "doc.md".into());
        cs_map.insert("kind".into(), "file".into());
        cs_map.insert("sha256".into(), h.into());
        cs_map.insert("last-checked".into(), fresh.into());
        artifact
            .fields
            .insert("cited-source".into(), serde_yaml::Value::Mapping(cs_map));

        let diags = validate_cited_sources(vec![artifact], dir.path(), false, false, false);
        assert!(
            diags.iter().all(|d| d.rule != "cited-source-stale"),
            "expected no stale diag, got: {diags:?}"
        );
    }

    #[test]
    fn update_cited_source_idempotent() {
        let dir = tempfile::tempdir().unwrap();
        let yaml_path = dir.path().join("a.yaml");
        let original = "\
artifacts:
  - id: REQ-001
    type: requirement
    title: Test
    fields:
      cited-source:
        uri: ./doc.md
        kind: file
        sha256: deadbeef
        last-checked: 2026-04-27T12:00:00Z
";
        std::fs::write(&yaml_path, original).unwrap();

        let changed =
            update_cited_source_in_file(&yaml_path, "REQ-001", "deadbeef", "2026-04-27T12:00:00Z")
                .unwrap();
        assert!(!changed);
    }
}
