//! Agent convergence tracking — detects when AI agents get stuck in retry loops
//! by tracking validation failure signatures across runs.

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
use std::fmt;

use serde::{Deserialize, Serialize};

use crate::schema::Severity;
use crate::validate::Diagnostic;

// ── Failure signature ──────────────────────────────────────────────────

/// Normalized fingerprint for a validation failure.
///
/// Format: `{severity}:{rule}:{artifact_id}:{message_hash}`
#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct FailureSignature(pub String);

impl FailureSignature {
    /// Build a deterministic signature from a diagnostic.
    pub fn from_diagnostic(d: &Diagnostic) -> Self {
        let severity = severity_str(d.severity);
        let artifact = d.artifact_id.as_deref().unwrap_or("_");
        let msg_hash = simple_hash(&d.message);
        FailureSignature(format!("{severity}:{}:{artifact}:{msg_hash:016x}", d.rule))
    }
}

impl fmt::Display for FailureSignature {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_str(&self.0)
    }
}

/// Deterministic (non-cryptographic) hash for message strings.
///
/// Uses FNV-1a so the result is stable across runs and platforms.
fn simple_hash(s: &str) -> u64 {
    let mut hash: u64 = 0xcbf29ce484222325; // FNV offset basis
    for byte in s.bytes() {
        hash ^= u64::from(byte);
        hash = hash.wrapping_mul(0x100000001b3); // FNV prime
    }
    hash
}

fn severity_str(s: Severity) -> &'static str {
    match s {
        Severity::Error => "error",
        Severity::Warning => "warning",
        Severity::Info => "info",
    }
}

// ── Failure record ─────────────────────────────────────────────────────

/// Tracks how many times a particular failure has occurred.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct FailureRecord {
    /// Number of validation runs where this failure appeared.
    pub occurrence_count: u32,
    /// Run number when this failure was first seen.
    pub first_seen: u32,
    /// Run number when this failure was last seen.
    pub last_seen: u32,
}

// ── Retry strategy ─────────────────────────────────────────────────────

/// Recommended strategy based on how many times a failure has recurred.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum RetryStrategy {
    /// First occurrence — just show the diagnostic.
    Normal,
    /// Second occurrence — read the diagnostic more carefully.
    ExpandedContext,
    /// Third occurrence — try something fundamentally different.
    DifferentApproach,
    /// Four or more — flag for human review.
    HumanReview,
}

impl RetryStrategy {
    /// Select a strategy based on occurrence count.
    pub fn from_count(count: u32) -> Self {
        match count {
            0 | 1 => RetryStrategy::Normal,
            2 => RetryStrategy::ExpandedContext,
            3 => RetryStrategy::DifferentApproach,
            _ => RetryStrategy::HumanReview,
        }
    }

    /// Human-readable guidance message.
    pub fn guidance(&self) -> &'static str {
        match self {
            RetryStrategy::Normal => "New failure — review the diagnostic.",
            RetryStrategy::ExpandedContext => "This failed before. Read the diagnostic carefully.",
            RetryStrategy::DifferentApproach => {
                "Your approach is NOT working. Try something fundamentally different."
            }
            RetryStrategy::HumanReview => "Flagged for human review.",
        }
    }
}

impl fmt::Display for RetryStrategy {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_str(self.guidance())
    }
}

// ── Convergence report ─────────────────────────────────────────────────

/// Report produced after recording a validation run.
#[derive(Debug, Clone)]
pub struct ConvergenceReport {
    /// Overall recommended strategy (worst-case across all repeated failures).
    pub strategy: RetryStrategy,
    /// Failures that appeared in a previous run and are still present.
    pub repeated_failures: Vec<(FailureSignature, FailureRecord)>,
    /// Failures appearing for the first time in this run.
    pub new_failures: Vec<FailureSignature>,
    /// Failures that were previously tracked but did not appear in this run.
    pub resolved_failures: Vec<FailureSignature>,
    /// Current run number.
    pub run_number: u32,
}

impl ConvergenceReport {
    /// Human-readable summary of the convergence state.
    pub fn summary(&self) -> String {
        let mut parts = Vec::new();

        if !self.repeated_failures.is_empty() {
            parts.push(format!(
                "{} repeated failure(s)",
                self.repeated_failures.len()
            ));
        }
        if !self.new_failures.is_empty() {
            parts.push(format!("{} new failure(s)", self.new_failures.len()));
        }
        if !self.resolved_failures.is_empty() {
            parts.push(format!(
                "{} resolved failure(s)",
                self.resolved_failures.len()
            ));
        }

        if parts.is_empty() {
            "No failures tracked.".to_string()
        } else {
            format!("Run #{}: {}", self.run_number, parts.join(", "))
        }
    }
}

// ── Convergence tracker ────────────────────────────────────────────────

/// Persistent tracker that records failure signatures across validation runs.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConvergenceTracker {
    /// Total number of validation runs recorded.
    pub run_count: u32,
    /// Map from failure signature to its record.
    pub failures: HashMap<FailureSignature, FailureRecord>,
}

impl Default for ConvergenceTracker {
    fn default() -> Self {
        Self::new()
    }
}

impl ConvergenceTracker {
    /// Create a new, empty tracker.
    pub fn new() -> Self {
        Self {
            run_count: 0,
            failures: HashMap::new(),
        }
    }

    /// Record a validation run and produce a convergence report.
    ///
    /// `diagnostics` are the diagnostics from the current validation run.
    pub fn record_run(&mut self, diagnostics: &[Diagnostic]) -> ConvergenceReport {
        self.run_count += 1;
        let current_run = self.run_count;

        // Compute signatures for current diagnostics.
        let current_sigs: HashMap<FailureSignature, ()> = diagnostics
            .iter()
            .map(|d| (FailureSignature::from_diagnostic(d), ()))
            .collect();

        let mut repeated = Vec::new();
        let mut new_failures = Vec::new();

        // Update records for current failures.
        for sig in current_sigs.keys() {
            let record = self.failures.entry(sig.clone()).or_insert(FailureRecord {
                occurrence_count: 0,
                first_seen: current_run,
                last_seen: current_run,
            });

            let was_new = record.occurrence_count == 0;
            record.occurrence_count += 1;
            record.last_seen = current_run;

            if was_new {
                new_failures.push(sig.clone());
            } else {
                repeated.push((sig.clone(), record.clone()));
            }
        }

        // Detect resolved failures (present in tracker but not in current run).
        let resolved: Vec<FailureSignature> = self
            .failures
            .keys()
            .filter(|sig| !current_sigs.contains_key(*sig))
            .cloned()
            .collect();

        // Remove resolved failures from the tracker.
        for sig in &resolved {
            self.failures.remove(sig);
        }

        // Determine overall strategy (worst-case across repeated failures).
        let strategy = repeated
            .iter()
            .map(|(_, rec)| RetryStrategy::from_count(rec.occurrence_count))
            .max_by_key(|s| match s {
                RetryStrategy::Normal => 0,
                RetryStrategy::ExpandedContext => 1,
                RetryStrategy::DifferentApproach => 2,
                RetryStrategy::HumanReview => 3,
            })
            .unwrap_or(RetryStrategy::Normal);

        ConvergenceReport {
            strategy,
            repeated_failures: repeated,
            new_failures,
            resolved_failures: resolved,
            run_number: current_run,
        }
    }

    /// Serialize the tracker to JSON.
    pub fn to_json(&self) -> Result<String, serde_json::Error> {
        serde_json::to_string_pretty(self)
    }

    /// Deserialize a tracker from JSON.
    pub fn from_json(json: &str) -> Result<Self, serde_json::Error> {
        serde_json::from_str(json)
    }
}

// ── Tests ──────────────────────────────────────────────────────────────

#[cfg(test)]
#[allow(clippy::cloned_ref_to_slice_refs)]
mod tests {
    use super::*;
    use crate::schema::Severity;
    use crate::validate::Diagnostic;

    fn make_diag(
        severity: Severity,
        rule: &str,
        artifact_id: Option<&str>,
        msg: &str,
    ) -> Diagnostic {
        Diagnostic {
            severity,
            artifact_id: artifact_id.map(String::from),
            rule: rule.to_string(),
            message: msg.to_string(),
            source_file: None,
            line: None,
            column: None,
        }
    }

    // ── Signature generation ───────────────────────────────────────────

    #[test]
    fn signature_is_deterministic() {
        let d = make_diag(
            Severity::Error,
            "missing-link",
            Some("REQ-001"),
            "no trace link",
        );
        let s1 = FailureSignature::from_diagnostic(&d);
        let s2 = FailureSignature::from_diagnostic(&d);
        assert_eq!(s1, s2);
    }

    #[test]
    fn signature_varies_by_severity() {
        let d1 = make_diag(Severity::Error, "rule-a", Some("X"), "msg");
        let d2 = make_diag(Severity::Warning, "rule-a", Some("X"), "msg");
        assert_ne!(
            FailureSignature::from_diagnostic(&d1),
            FailureSignature::from_diagnostic(&d2),
        );
    }

    #[test]
    fn signature_varies_by_rule() {
        let d1 = make_diag(Severity::Error, "rule-a", Some("X"), "msg");
        let d2 = make_diag(Severity::Error, "rule-b", Some("X"), "msg");
        assert_ne!(
            FailureSignature::from_diagnostic(&d1),
            FailureSignature::from_diagnostic(&d2),
        );
    }

    #[test]
    fn signature_varies_by_artifact() {
        let d1 = make_diag(Severity::Error, "rule-a", Some("A"), "msg");
        let d2 = make_diag(Severity::Error, "rule-a", Some("B"), "msg");
        assert_ne!(
            FailureSignature::from_diagnostic(&d1),
            FailureSignature::from_diagnostic(&d2),
        );
    }

    #[test]
    fn signature_varies_by_message() {
        let d1 = make_diag(Severity::Error, "rule-a", Some("X"), "alpha");
        let d2 = make_diag(Severity::Error, "rule-a", Some("X"), "beta");
        assert_ne!(
            FailureSignature::from_diagnostic(&d1),
            FailureSignature::from_diagnostic(&d2),
        );
    }

    #[test]
    fn signature_handles_no_artifact() {
        let d = make_diag(Severity::Warning, "parse-error", None, "bad yaml");
        let sig = FailureSignature::from_diagnostic(&d);
        assert!(
            sig.0.contains(":_:"),
            "expected underscore for missing artifact, got {sig}"
        );
    }

    #[test]
    fn signature_format_has_four_parts() {
        let d = make_diag(Severity::Error, "my-rule", Some("ART-1"), "something broke");
        let sig = FailureSignature::from_diagnostic(&d);
        let parts: Vec<&str> = sig.0.split(':').collect();
        assert_eq!(
            parts.len(),
            4,
            "expected 4 colon-separated parts, got: {sig}"
        );
        assert_eq!(parts[0], "error");
        assert_eq!(parts[1], "my-rule");
        assert_eq!(parts[2], "ART-1");
        // parts[3] is the hex hash
        assert_eq!(parts[3].len(), 16, "hash should be 16 hex chars");
    }

    // ── Record tracking across runs ────────────────────────────────────

    #[test]
    fn first_run_all_new() {
        let mut tracker = ConvergenceTracker::new();
        let diags = vec![
            make_diag(Severity::Error, "r1", Some("A"), "fail"),
            make_diag(Severity::Warning, "r2", Some("B"), "warn"),
        ];
        let report = tracker.record_run(&diags);
        assert_eq!(report.run_number, 1);
        assert_eq!(report.new_failures.len(), 2);
        assert!(report.repeated_failures.is_empty());
        assert!(report.resolved_failures.is_empty());
        assert_eq!(report.strategy, RetryStrategy::Normal);
    }

    #[test]
    fn second_run_detects_repeated() {
        let mut tracker = ConvergenceTracker::new();
        let diags = vec![make_diag(Severity::Error, "r1", Some("A"), "fail")];

        let _r1 = tracker.record_run(&diags);
        let r2 = tracker.record_run(&diags);

        assert_eq!(r2.run_number, 2);
        assert_eq!(r2.repeated_failures.len(), 1);
        assert!(r2.new_failures.is_empty());
        assert_eq!(r2.repeated_failures[0].1.occurrence_count, 2);
        assert_eq!(r2.strategy, RetryStrategy::ExpandedContext);
    }

    #[test]
    fn third_run_escalates_to_different_approach() {
        let mut tracker = ConvergenceTracker::new();
        let diags = vec![make_diag(Severity::Error, "r1", Some("A"), "fail")];

        let _r1 = tracker.record_run(&diags);
        let _r2 = tracker.record_run(&diags);
        let r3 = tracker.record_run(&diags);

        assert_eq!(r3.strategy, RetryStrategy::DifferentApproach);
        assert_eq!(r3.repeated_failures[0].1.occurrence_count, 3);
    }

    #[test]
    fn fourth_run_escalates_to_human_review() {
        let mut tracker = ConvergenceTracker::new();
        let diags = vec![make_diag(Severity::Error, "r1", Some("A"), "fail")];

        for _ in 0..4 {
            tracker.record_run(&diags);
        }
        // The 4th run produces the report with HumanReview
        // (already captured by the last record_run above,
        // but let's do a 5th to verify 4+ stays at HumanReview)
        let r5 = tracker.record_run(&diags);
        assert_eq!(r5.strategy, RetryStrategy::HumanReview);
    }

    // ── Strategy escalation ────────────────────────────────────────────

    #[test]
    fn strategy_escalation_sequence() {
        assert_eq!(RetryStrategy::from_count(0), RetryStrategy::Normal);
        assert_eq!(RetryStrategy::from_count(1), RetryStrategy::Normal);
        assert_eq!(RetryStrategy::from_count(2), RetryStrategy::ExpandedContext);
        assert_eq!(
            RetryStrategy::from_count(3),
            RetryStrategy::DifferentApproach
        );
        assert_eq!(RetryStrategy::from_count(4), RetryStrategy::HumanReview);
        assert_eq!(RetryStrategy::from_count(100), RetryStrategy::HumanReview);
    }

    #[test]
    fn worst_case_strategy_wins() {
        let mut tracker = ConvergenceTracker::new();
        let persistent = make_diag(Severity::Error, "r1", Some("A"), "persistent");
        let fresh = make_diag(Severity::Warning, "r2", Some("B"), "new thing");

        // Run 1-3 with persistent failure only.
        for _ in 0..3 {
            tracker.record_run(&[persistent.clone()]);
        }

        // Run 4 adds a new failure alongside the persistent one.
        let report = tracker.record_run(&[persistent.clone(), fresh]);
        // persistent is now at count=4 -> HumanReview
        // fresh is new -> Normal
        // Overall strategy should be HumanReview (worst case).
        assert_eq!(report.strategy, RetryStrategy::HumanReview);
        assert_eq!(report.new_failures.len(), 1);
        assert_eq!(report.repeated_failures.len(), 1);
    }

    // ── Resolved failure detection ─────────────────────────────────────

    #[test]
    fn resolved_failures_detected() {
        let mut tracker = ConvergenceTracker::new();
        let d1 = make_diag(Severity::Error, "r1", Some("A"), "fail");
        let d2 = make_diag(Severity::Warning, "r2", Some("B"), "warn");

        // Run 1: both failures present.
        tracker.record_run(&[d1.clone(), d2.clone()]);

        // Run 2: only d1 remains.
        let report = tracker.record_run(&[d1]);

        assert_eq!(report.resolved_failures.len(), 1);
        let resolved_sig = FailureSignature::from_diagnostic(&d2);
        assert!(report.resolved_failures.contains(&resolved_sig));
    }

    #[test]
    fn resolved_failures_removed_from_tracker() {
        let mut tracker = ConvergenceTracker::new();
        let d1 = make_diag(Severity::Error, "r1", Some("A"), "fail");

        tracker.record_run(&[d1.clone()]);
        // Run with no failures resolves d1.
        let report = tracker.record_run(&[]);
        assert_eq!(report.resolved_failures.len(), 1);
        assert!(tracker.failures.is_empty());
    }

    #[test]
    fn resolved_then_reintroduced() {
        let mut tracker = ConvergenceTracker::new();
        let d = make_diag(Severity::Error, "r1", Some("A"), "fail");

        // Run 1: introduce.
        tracker.record_run(&[d.clone()]);
        // Run 2: resolve.
        tracker.record_run(&[]);
        // Run 3: reintroduce — should be treated as new.
        let report = tracker.record_run(&[d]);
        assert_eq!(report.new_failures.len(), 1);
        assert!(report.repeated_failures.is_empty());
    }

    // ── JSON serialization/deserialization ──────────────────────────────

    #[test]
    fn json_round_trip() {
        let mut tracker = ConvergenceTracker::new();
        let diags = vec![
            make_diag(Severity::Error, "r1", Some("A"), "fail"),
            make_diag(Severity::Warning, "r2", Some("B"), "warn"),
        ];
        tracker.record_run(&diags);
        tracker.record_run(&diags);

        let json = tracker.to_json().unwrap();
        let restored = ConvergenceTracker::from_json(&json).unwrap();

        assert_eq!(restored.run_count, tracker.run_count);
        assert_eq!(restored.failures.len(), tracker.failures.len());
        for (sig, record) in &tracker.failures {
            let restored_record = restored.failures.get(sig).expect("signature should exist");
            assert_eq!(restored_record, record);
        }
    }

    #[test]
    fn json_empty_tracker() {
        let tracker = ConvergenceTracker::new();
        let json = tracker.to_json().unwrap();
        let restored = ConvergenceTracker::from_json(&json).unwrap();
        assert_eq!(restored.run_count, 0);
        assert!(restored.failures.is_empty());
    }

    #[test]
    fn json_deserialization_from_literal() {
        let json = r#"{
            "run_count": 2,
            "failures": {
                "error:r1:A:00cafe0000000000": {
                    "occurrence_count": 2,
                    "first_seen": 1,
                    "last_seen": 2
                }
            }
        }"#;
        let tracker = ConvergenceTracker::from_json(json).unwrap();
        assert_eq!(tracker.run_count, 2);
        assert_eq!(tracker.failures.len(), 1);
    }

    // ── Report summary ─────────────────────────────────────────────────

    #[test]
    fn report_summary_no_failures() {
        let mut tracker = ConvergenceTracker::new();
        let report = tracker.record_run(&[]);
        assert_eq!(report.summary(), "No failures tracked.");
    }

    #[test]
    fn report_summary_with_failures() {
        let mut tracker = ConvergenceTracker::new();
        let d = make_diag(Severity::Error, "r1", Some("A"), "fail");
        tracker.record_run(&[d.clone()]);
        let report = tracker.record_run(&[d]);
        let summary = report.summary();
        assert!(summary.contains("1 repeated failure(s)"), "got: {summary}");
        assert!(summary.starts_with("Run #2"), "got: {summary}");
    }

    // ── Duplicate diagnostics in single run ────────────────────────────

    #[test]
    fn duplicate_diagnostics_collapsed() {
        let mut tracker = ConvergenceTracker::new();
        let d = make_diag(Severity::Error, "r1", Some("A"), "fail");
        // Same diagnostic appears twice in one run.
        let report = tracker.record_run(&[d.clone(), d]);
        // Should count as a single failure, not two.
        assert_eq!(report.new_failures.len(), 1);
        assert_eq!(tracker.failures.len(), 1);
    }
}
