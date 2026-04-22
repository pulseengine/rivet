//! JUnit XML test result importer.
//!
//! Parses JUnit XML test result files (the de-facto standard produced by Maven,
//! pytest, cargo-nextest, etc.) and maps them to Rivet [`TestRun`] / [`TestResult`]
//! structures.
//!
//! ## Artifact ID extraction
//!
//! The importer tries to find a rivet artifact ID in a testcase using these
//! heuristics (first match wins):
//!
//! 1. The `classname` attribute matches an ID pattern directly
//!    (e.g., `classname="REQ-001"`).
//! 2. The `name` or `classname` attribute contains a bracketed ID pattern
//!    (e.g., `name="test_foo [REQ-001]"` → `REQ-001`).
//! 3. Fall back to `classname.name` as a plain string reference.
//!
//! An "artifact ID pattern" is: one or more uppercase letters, a hyphen, then
//! one or more digits (e.g., `REQ-001`, `FEAT-071`, `TEST-013`).

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

use std::collections::HashMap;

use quick_xml::Reader;
use quick_xml::events::Event;

use crate::error::Error;
use crate::results::{RunMetadata, TestResult, TestRun, TestStatus};

// ── Artifact ID detection ────────────────────────────────────────────────────

/// Returns true if `s` is exactly an artifact ID like `REQ-001` or `FEAT-071`.
fn is_artifact_id(s: &str) -> bool {
    let bytes = s.as_bytes();
    let mut i = 0;
    // One or more uppercase ASCII letters
    if i >= bytes.len() || !bytes[i].is_ascii_uppercase() {
        return false;
    }
    while i < bytes.len() && bytes[i].is_ascii_uppercase() {
        i += 1;
    }
    // Hyphen separator
    if i >= bytes.len() || bytes[i] != b'-' {
        return false;
    }
    i += 1;
    // One or more ASCII digits
    if i >= bytes.len() || !bytes[i].is_ascii_digit() {
        return false;
    }
    while i < bytes.len() && bytes[i].is_ascii_digit() {
        i += 1;
    }
    // Nothing else allowed
    i == bytes.len()
}

/// Extract the first `[ARTIFACT-ID]` pattern from a string.
fn extract_bracketed_id(s: &str) -> Option<&str> {
    let mut start = 0;
    while let Some(open) = s[start..].find('[') {
        let abs_open = start + open + 1;
        if let Some(close) = s[abs_open..].find(']') {
            let candidate = &s[abs_open..abs_open + close];
            if is_artifact_id(candidate) {
                return Some(candidate);
            }
            start = abs_open + close + 1;
        } else {
            break;
        }
    }
    None
}

/// Derive the best artifact reference from a testcase's `name` and `classname`.
pub fn artifact_id_for(name: &str, classname: &str) -> String {
    // 1. classname is itself an artifact ID
    if is_artifact_id(classname) {
        return classname.to_string();
    }
    // 2. bracketed ID in name
    if let Some(id) = extract_bracketed_id(name) {
        return id.to_string();
    }
    // 3. bracketed ID in classname
    if let Some(id) = extract_bracketed_id(classname) {
        return id.to_string();
    }
    // 4. fall back to "classname.name" (or just whichever is non-empty)
    match (classname.is_empty(), name.is_empty()) {
        (true, _) => name.to_string(),
        (_, true) => classname.to_string(),
        _ => format!("{}.{}", classname, name),
    }
}

// ── Internal parse model ─────────────────────────────────────────────────────

#[derive(Debug, Default)]
struct ParsedCase {
    name: String,
    classname: String,
    time: Option<String>,
    outcome: Outcome,
    /// Text body of <failure> or <error>, used as fallback message.
    body: Option<String>,
}

#[derive(Debug, Default, PartialEq)]
enum Outcome {
    #[default]
    Pass,
    Fail {
        message: Option<String>,
    },
    Error {
        message: Option<String>,
    },
    Skipped,
}

#[derive(Debug, Default)]
struct ParsedSuite {
    name: String,
    timestamp: Option<String>,
    cases: Vec<ParsedCase>,
}

// ── Parser ───────────────────────────────────────────────────────────────────

/// Tracks what text-content context we are in.
#[derive(Debug, PartialEq)]
enum TextContext {
    Failure,
    Error,
    None,
}

/// Parse JUnit XML and return one [`TestRun`] per `<testsuite>` element.
///
/// Both `<testsuites>` wrappers and bare `<testsuite>` roots are accepted.
pub fn parse_junit_xml(xml: &str) -> Result<Vec<TestRun>, Error> {
    let suites = parse_suites(xml)?;
    Ok(suites
        .into_iter()
        .enumerate()
        .map(|(i, s)| suite_to_run(s, i))
        .collect())
}

fn parse_suites(xml: &str) -> Result<Vec<ParsedSuite>, Error> {
    let mut reader = Reader::from_str(xml);
    reader.config_mut().trim_text(true);

    let mut suites: Vec<ParsedSuite> = Vec::new();
    let mut current_suite: Option<ParsedSuite> = None;
    let mut current_case: Option<ParsedCase> = None;
    let mut text_ctx = TextContext::None;
    let mut buf = Vec::new();

    // Helper closures as inline logic below.
    loop {
        match reader.read_event_into(&mut buf) {
            Err(e) => return Err(Error::Adapter(format!("JUnit XML parse error: {e}"))),
            Ok(Event::Eof) => break,

            Ok(Event::Start(ref e)) | Ok(Event::Empty(ref e)) => {
                let tag = tag_name(e);
                let attrs = collect_attrs(e);

                match tag.as_str() {
                    "testsuite" => {
                        // Commit any previous suite
                        if let Some(s) = current_suite.take() {
                            suites.push(s);
                        }
                        current_suite = Some(ParsedSuite {
                            name: attrs.get("name").cloned().unwrap_or_default(),
                            timestamp: attrs.get("timestamp").cloned(),
                            cases: Vec::new(),
                        });
                        current_case = None;
                        text_ctx = TextContext::None;
                    }
                    "testcase" => {
                        // Commit any previous case
                        if let Some(c) = current_case.take() {
                            push_case(&mut current_suite, c);
                        }
                        current_case = Some(ParsedCase {
                            name: attrs.get("name").cloned().unwrap_or_default(),
                            classname: attrs.get("classname").cloned().unwrap_or_default(),
                            time: attrs.get("time").cloned(),
                            outcome: Outcome::Pass,
                            body: None,
                        });
                        text_ctx = TextContext::None;
                    }
                    "failure" => {
                        if let Some(ref mut c) = current_case {
                            c.outcome = Outcome::Fail {
                                message: attrs.get("message").cloned(),
                            };
                        }
                        text_ctx = TextContext::Failure;
                    }
                    "error" => {
                        if let Some(ref mut c) = current_case {
                            c.outcome = Outcome::Error {
                                message: attrs.get("message").cloned(),
                            };
                        }
                        text_ctx = TextContext::Error;
                    }
                    "skipped" | "skip" => {
                        if let Some(ref mut c) = current_case {
                            c.outcome = Outcome::Skipped;
                        }
                    }
                    _ => {}
                }
            }

            Ok(Event::End(ref e)) => {
                let tag = std::str::from_utf8(e.local_name().as_ref())
                    .unwrap_or("")
                    .to_lowercase();
                match tag.as_str() {
                    "failure" | "error" => {
                        text_ctx = TextContext::None;
                    }
                    "testcase" => {
                        if let Some(c) = current_case.take() {
                            push_case(&mut current_suite, c);
                        }
                        text_ctx = TextContext::None;
                    }
                    "testsuite" => {
                        // Flush pending case first
                        if let Some(c) = current_case.take() {
                            push_case(&mut current_suite, c);
                        }
                        if let Some(s) = current_suite.take() {
                            suites.push(s);
                        }
                        text_ctx = TextContext::None;
                    }
                    _ => {}
                }
            }

            Ok(Event::Text(ref e))
                if text_ctx == TextContext::Failure || text_ctx == TextContext::Error =>
            {
                if let Some(ref mut c) = current_case {
                    if c.body.is_none() {
                        let text = e
                            .unescape()
                            .map(|s| s.trim().to_string())
                            .unwrap_or_default();
                        if !text.is_empty() {
                            c.body = Some(text);
                        }
                    }
                }
            }

            _ => {}
        }
        buf.clear();
    }

    // Flush any trailing state (document without proper close tags)
    if let Some(c) = current_case.take() {
        push_case(&mut current_suite, c);
    }
    if let Some(s) = current_suite.take() {
        suites.push(s);
    }

    Ok(suites)
}

fn push_case(suite: &mut Option<ParsedSuite>, case: ParsedCase) {
    if let Some(s) = suite {
        s.cases.push(case);
    }
}

fn tag_name(e: &quick_xml::events::BytesStart<'_>) -> String {
    std::str::from_utf8(e.local_name().as_ref())
        .unwrap_or("")
        .to_lowercase()
}

fn collect_attrs(e: &quick_xml::events::BytesStart<'_>) -> HashMap<String, String> {
    let mut map = HashMap::new();
    for attr in e.attributes().flatten() {
        if let (Ok(key), Ok(val)) = (
            std::str::from_utf8(attr.key.local_name().as_ref()),
            attr.unescape_value(),
        ) {
            map.insert(key.to_string(), val.into_owned());
        }
    }
    map
}

// ── Conversion ───────────────────────────────────────────────────────────────

fn suite_to_run(suite: ParsedSuite, index: usize) -> TestRun {
    let safe_name: String = suite
        .name
        .chars()
        .map(|c| {
            if c.is_alphanumeric() || c == '-' || c == '_' {
                c
            } else {
                '-'
            }
        })
        .collect();
    let run_id = if safe_name.is_empty() {
        format!("junit-import-{index}")
    } else {
        format!("junit-{safe_name}")
    };

    let timestamp = suite
        .timestamp
        .unwrap_or_else(|| "1970-01-01T00:00:00Z".to_string());

    let results = suite.cases.into_iter().map(case_to_result).collect();

    TestRun {
        run: RunMetadata {
            id: run_id,
            timestamp,
            source: Some("junit-xml".to_string()),
            environment: None,
            commit: None,
        },
        results,
        source_file: None,
    }
}

fn case_to_result(c: ParsedCase) -> TestResult {
    let artifact = artifact_id_for(&c.name, &c.classname);
    let duration = c.time.map(|t| format!("{t}s"));

    // Prefer the `message` attribute; fall back to element text body.
    let message = match &c.outcome {
        Outcome::Fail { message: Some(m) } => Some(m.clone()),
        Outcome::Error { message: Some(m) } => Some(m.clone()),
        Outcome::Fail { message: None } | Outcome::Error { message: None } => c.body,
        _ => None,
    };

    let status = match c.outcome {
        Outcome::Pass => TestStatus::Pass,
        Outcome::Fail { .. } => TestStatus::Fail,
        Outcome::Error { .. } => TestStatus::Error,
        Outcome::Skipped => TestStatus::Skip,
    };

    TestResult {
        artifact,
        status,
        duration,
        message,
    }
}

// ── Import summary ────────────────────────────────────────────────────────────

/// Aggregate statistics over the runs produced by an import.
pub struct ImportSummary {
    pub total: usize,
    pub pass: usize,
    pub fail: usize,
    pub error: usize,
    pub skip: usize,
}

impl ImportSummary {
    pub fn from_runs(runs: &[TestRun]) -> Self {
        let mut s = Self {
            total: 0,
            pass: 0,
            fail: 0,
            error: 0,
            skip: 0,
        };
        for run in runs {
            for r in &run.results {
                s.total += 1;
                match r.status {
                    TestStatus::Pass => s.pass += 1,
                    TestStatus::Fail => s.fail += 1,
                    TestStatus::Error => s.error += 1,
                    TestStatus::Skip => s.skip += 1,
                    TestStatus::Blocked => {}
                }
            }
        }
        s
    }
}

// ── Tests ─────────────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;

    // --- artifact ID helpers ---

    #[test]
    fn test_is_artifact_id() {
        assert!(is_artifact_id("REQ-001"));
        assert!(is_artifact_id("FEAT-071"));
        assert!(is_artifact_id("TEST-013"));
        assert!(is_artifact_id("AB-1"));
        assert!(!is_artifact_id("req-001")); // lowercase
        assert!(!is_artifact_id("REQ001")); // missing hyphen
        assert!(!is_artifact_id("REQ-")); // no digits
        assert!(!is_artifact_id("-001")); // no prefix
        assert!(!is_artifact_id("")); // empty
        assert!(!is_artifact_id("REQ-001 extra")); // trailing content
        assert!(!is_artifact_id("com.example.MyTest")); // classname
    }

    #[test]
    fn test_extract_bracketed_id() {
        assert_eq!(extract_bracketed_id("test_foo [REQ-001]"), Some("REQ-001"));
        assert_eq!(
            extract_bracketed_id("some test [FEAT-071] for feature"),
            Some("FEAT-071")
        );
        assert_eq!(extract_bracketed_id("no brackets here"), None);
        assert_eq!(extract_bracketed_id("[not-an-id]"), None);
        assert_eq!(extract_bracketed_id("[REQ-001]"), Some("REQ-001"));
    }

    #[test]
    fn test_artifact_id_for_classname_is_id() {
        assert_eq!(artifact_id_for("some test", "REQ-001"), "REQ-001");
    }

    #[test]
    fn test_artifact_id_for_bracketed_in_name() {
        assert_eq!(
            artifact_id_for("validate braking [FEAT-071]", "com.example"),
            "FEAT-071"
        );
    }

    #[test]
    fn test_artifact_id_for_bracketed_in_classname() {
        assert_eq!(
            artifact_id_for("test_something", "suite [TEST-013]"),
            "TEST-013"
        );
    }

    #[test]
    fn test_artifact_id_for_fallback() {
        assert_eq!(
            artifact_id_for("test_foo", "com.example.MyTest"),
            "com.example.MyTest.test_foo"
        );
        assert_eq!(artifact_id_for("test_foo", ""), "test_foo");
        assert_eq!(artifact_id_for("", "com.example"), "com.example");
    }

    // --- XML parser ---

    const SAMPLE_JUNIT: &str = r#"<?xml version="1.0" encoding="UTF-8"?>
<testsuites>
  <testsuite name="rivet.core.tests" tests="4" failures="1" errors="1" time="0.5"
             timestamp="2026-03-28T10:00:00Z">
    <testcase name="test_validate_ok [REQ-001]" classname="rivet.core" time="0.1"/>
    <testcase name="test_validate_fail" classname="FEAT-071" time="0.2">
      <failure message="assertion failed: expected Ok(())">Details here</failure>
    </testcase>
    <testcase name="test_timeout" classname="com.example.IntegrationTest" time="0.0">
      <error message="Timed out after 5s"/>
    </testcase>
    <testcase name="test_skipped" classname="com.example.SkipTest" time="0.0">
      <skipped/>
    </testcase>
  </testsuite>
</testsuites>"#;

    #[test]
    fn test_parse_junit_xml_basic() {
        let runs = parse_junit_xml(SAMPLE_JUNIT).expect("parse failed");
        assert_eq!(runs.len(), 1);
        let run = &runs[0];
        assert_eq!(run.run.id, "junit-rivet-core-tests");
        assert_eq!(run.run.timestamp, "2026-03-28T10:00:00Z");
        assert_eq!(run.run.source, Some("junit-xml".to_string()));
        assert_eq!(run.results.len(), 4);
    }

    #[test]
    fn test_parse_junit_pass_result() {
        let runs = parse_junit_xml(SAMPLE_JUNIT).expect("parse failed");
        let r = &runs[0].results[0];
        assert_eq!(r.artifact, "REQ-001");
        assert_eq!(r.status, TestStatus::Pass);
        assert_eq!(r.duration, Some("0.1s".to_string()));
        assert!(r.message.is_none());
    }

    #[test]
    fn test_parse_junit_fail_result() {
        let runs = parse_junit_xml(SAMPLE_JUNIT).expect("parse failed");
        let r = &runs[0].results[1];
        assert_eq!(r.artifact, "FEAT-071"); // classname is artifact ID
        assert_eq!(r.status, TestStatus::Fail);
        assert_eq!(
            r.message,
            Some("assertion failed: expected Ok(())".to_string())
        );
    }

    #[test]
    fn test_parse_junit_error_result() {
        let runs = parse_junit_xml(SAMPLE_JUNIT).expect("parse failed");
        let r = &runs[0].results[2];
        assert_eq!(r.artifact, "com.example.IntegrationTest.test_timeout");
        assert_eq!(r.status, TestStatus::Error);
        assert_eq!(r.message, Some("Timed out after 5s".to_string()));
    }

    #[test]
    fn test_parse_junit_skipped_result() {
        let runs = parse_junit_xml(SAMPLE_JUNIT).expect("parse failed");
        let r = &runs[0].results[3];
        assert_eq!(r.artifact, "com.example.SkipTest.test_skipped");
        assert_eq!(r.status, TestStatus::Skip);
    }

    #[test]
    fn test_parse_junit_multiple_suites() {
        let xml = r#"<testsuites>
  <testsuite name="Suite-A" timestamp="2026-01-01T00:00:00Z">
    <testcase name="t1" classname="REQ-001" time="0.1"/>
  </testsuite>
  <testsuite name="Suite-B" timestamp="2026-01-02T00:00:00Z">
    <testcase name="t2" classname="REQ-002" time="0.2">
      <failure message="oops"/>
    </testcase>
  </testsuite>
</testsuites>"#;
        let runs = parse_junit_xml(xml).expect("parse failed");
        assert_eq!(runs.len(), 2);
        assert_eq!(runs[0].run.id, "junit-Suite-A");
        assert_eq!(runs[1].run.id, "junit-Suite-B");
        assert_eq!(runs[0].results[0].status, TestStatus::Pass);
        assert_eq!(runs[1].results[0].status, TestStatus::Fail);
    }

    #[test]
    fn test_parse_junit_bare_testsuite() {
        let xml = r#"<testsuite name="bare" timestamp="2026-03-01T00:00:00Z">
  <testcase name="t1" classname="REQ-010" time="0.05"/>
</testsuite>"#;
        let runs = parse_junit_xml(xml).expect("parse failed");
        assert_eq!(runs.len(), 1);
        assert_eq!(runs[0].results[0].artifact, "REQ-010");
    }

    #[test]
    fn test_import_summary() {
        let runs = parse_junit_xml(SAMPLE_JUNIT).expect("parse failed");
        let s = ImportSummary::from_runs(&runs);
        assert_eq!(s.total, 4);
        assert_eq!(s.pass, 1);
        assert_eq!(s.fail, 1);
        assert_eq!(s.error, 1);
        assert_eq!(s.skip, 1);
    }

    #[test]
    fn test_parse_junit_no_suites() {
        let xml = "<testsuites/>";
        let runs = parse_junit_xml(xml).expect("parse failed");
        assert!(runs.is_empty());
    }

    #[test]
    fn test_parse_junit_does_not_panic_on_malformed() {
        // Should not panic even on garbage input
        let _ = parse_junit_xml("not xml at all <<<");
    }
}
