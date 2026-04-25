//! `rivet check gaps-json` — canonical JSON summary of validation gaps.
//!
//! Runs `rivet_core::validate::validate` internally, groups the
//! diagnostics by artifact, and emits a single JSON document that
//! downstream oracles (e.g. `rivet close-gaps`) can consume without
//! re-parsing validator output.
//!
//! Exit codes:
//! * 0 — no error-severity diagnostics (warnings and infos are reported
//!   in the JSON but do not fail the gate).
//! * 1 — one or more error-severity diagnostics.
//!
//! JSON contract:
//! ```json
//! {
//!   "oracle": "gaps-json",
//!   "gaps": [
//!     { "artifact_id": "REQ-001",
//!       "severity": "error",
//!       "diagnostics": [
//!         { "severity": "error", "rule": "...", "message": "..." }
//!       ]
//!     }
//!   ],
//!   "total": 3,
//!   "by_severity": { "error": 1, "warning": 2, "info": 0 }
//! }
//! ```
//!
//! The per-artifact `severity` is the max severity across that artifact's
//! diagnostics (error > warning > info). Diagnostics without an
//! `artifact_id` (file-level / schema-level) are bucketed under the
//! synthetic key `"<global>"` so pipelines can see them.

use std::collections::BTreeMap;

use rivet_core::links::LinkGraph;
use rivet_core::schema::{Schema, Severity};
use rivet_core::store::Store;
use rivet_core::validate::{self, Diagnostic};

use serde::Serialize;

const GLOBAL_BUCKET: &str = "<global>";

#[derive(Debug, Clone, Serialize, PartialEq, Eq)]
pub struct DiagnosticEntry {
    pub severity: String,
    pub rule: String,
    pub message: String,
}

#[derive(Debug, Clone, Serialize, PartialEq, Eq)]
pub struct ArtifactGap {
    pub artifact_id: String,
    pub severity: String,
    pub diagnostics: Vec<DiagnosticEntry>,
}

#[derive(Debug, Clone, Serialize)]
pub struct SeverityCounts {
    pub error: usize,
    pub warning: usize,
    pub info: usize,
}

#[derive(Debug, Clone, Serialize)]
pub struct Report {
    pub oracle: &'static str,
    pub gaps: Vec<ArtifactGap>,
    pub total: usize,
    pub by_severity: SeverityCounts,
}

fn severity_str(s: Severity) -> &'static str {
    match s {
        Severity::Error => "error",
        Severity::Warning => "warning",
        Severity::Info => "info",
    }
}

fn severity_rank(s: &str) -> u8 {
    match s {
        "error" => 3,
        "warning" => 2,
        "info" => 1,
        _ => 0,
    }
}

/// Compute the gaps report from raw diagnostics.
///
/// Factored out for test harnesses that want to bypass project loading.
pub fn compute_from_diagnostics(diagnostics: &[Diagnostic]) -> Report {
    let mut bucket: BTreeMap<String, Vec<DiagnosticEntry>> = BTreeMap::new();
    let mut counts = SeverityCounts {
        error: 0,
        warning: 0,
        info: 0,
    };

    for d in diagnostics {
        let sev = severity_str(d.severity);
        match d.severity {
            Severity::Error => counts.error += 1,
            Severity::Warning => counts.warning += 1,
            Severity::Info => counts.info += 1,
        }
        let key = d
            .artifact_id
            .clone()
            .unwrap_or_else(|| GLOBAL_BUCKET.to_string());
        bucket.entry(key).or_default().push(DiagnosticEntry {
            severity: sev.to_string(),
            rule: d.rule.clone(),
            message: d.message.clone(),
        });
    }

    let mut gaps: Vec<ArtifactGap> = bucket
        .into_iter()
        .map(|(artifact_id, mut diagnostics)| {
            // Stable sub-order: severity rank desc, then rule asc, then message asc.
            diagnostics.sort_by(|a, b| {
                severity_rank(&b.severity)
                    .cmp(&severity_rank(&a.severity))
                    .then_with(|| a.rule.cmp(&b.rule))
                    .then_with(|| a.message.cmp(&b.message))
            });
            let top = diagnostics
                .iter()
                .map(|d| severity_rank(&d.severity))
                .max()
                .unwrap_or(0);
            let severity = match top {
                3 => "error",
                2 => "warning",
                1 => "info",
                _ => "info",
            }
            .to_string();
            ArtifactGap {
                artifact_id,
                severity,
                diagnostics,
            }
        })
        .collect();

    // Stable order across artifacts: worst severity first, then id.
    gaps.sort_by(|a, b| {
        severity_rank(&b.severity)
            .cmp(&severity_rank(&a.severity))
            .then_with(|| a.artifact_id.cmp(&b.artifact_id))
    });

    Report {
        oracle: "gaps-json",
        total: diagnostics.len(),
        by_severity: counts,
        gaps,
    }
}

/// Run validation against a loaded project and compute the gaps report.
pub fn compute(store: &Store, schema: &Schema, graph: &LinkGraph) -> Report {
    let diagnostics = validate::validate(store, schema, graph);
    compute_from_diagnostics(&diagnostics)
}

pub fn render_json(report: &Report) -> String {
    serde_json::to_string_pretty(report).unwrap_or_else(|_| "{}".to_string())
}

pub fn render_text(report: &Report) -> String {
    let mut out = format!(
        "gaps-json: {} diagnostic(s) across {} artifact(s) (errors={}, warnings={}, info={})\n",
        report.total,
        report.gaps.len(),
        report.by_severity.error,
        report.by_severity.warning,
        report.by_severity.info,
    );
    for g in &report.gaps {
        out.push_str(&format!(
            "  {} [{}] — {} diagnostic(s)\n",
            g.artifact_id,
            g.severity,
            g.diagnostics.len()
        ));
        for d in &g.diagnostics {
            out.push_str(&format!("    {}: [{}] {}\n", d.severity, d.rule, d.message));
        }
    }
    out
}
