//! `rivet check review-signoff <id>` — peer-review signoff oracle.
//!
//! Verifies that an artifact in `released` status has a reviewer distinct
//! from its author. The reviewer is looked up in:
//!
//! 1. `artifact.provenance.reviewed-by` (preferred — typed field)
//! 2. `artifact.fields["reviewed-by"]` (legacy / free-form field)
//!
//! The author is taken from `artifact.provenance.created-by`.
//!
//! Optionally, `--role <X>` requires the reviewer's role to match a
//! declared value. The role lookup is `artifact.fields["reviewer-role"]`.
//! If neither a reviewer nor role source is present when required, the
//! oracle fires with a clear "missing signoff data" diagnostic rather
//! than silently passing.
//!
//! This supports ASPICE peer-review and ISO 26262 confirmation-review
//! oracles.
//!
//! Exit codes:
//! * 0 — signoff is valid for the given requirements.
//! * 1 — otherwise (diagnostic printed and JSON emitted on --format json).
//!
//! JSON contract:
//! ```json
//! {
//!   "oracle": "review-signoff",
//!   "artifact_id": "REQ-001",
//!   "ok": false,
//!   "reasons": [ "missing reviewed-by", ... ],
//!   "author": "alice",
//!   "reviewer": null,
//!   "role_required": "safety-manager",
//!   "role_actual": null,
//!   "status": "released"
//! }
//! ```

use rivet_core::model::Artifact;

use serde::Serialize;

/// Oracle verdict for a single artifact.
#[derive(Debug, Clone, Serialize)]
pub struct Report {
    pub oracle: &'static str,
    pub artifact_id: String,
    pub ok: bool,
    pub reasons: Vec<String>,
    pub author: Option<String>,
    pub reviewer: Option<String>,
    pub role_required: Option<String>,
    pub role_actual: Option<String>,
    pub status: Option<String>,
}

/// Look up the reviewer of an artifact from typed provenance or fields.
///
/// Precedence: `provenance.reviewed-by` first, then `fields["reviewed-by"]`.
pub fn reviewer_of(artifact: &Artifact) -> Option<String> {
    if let Some(p) = &artifact.provenance {
        if let Some(r) = &p.reviewed_by {
            if !r.is_empty() {
                return Some(r.clone());
            }
        }
    }
    if let Some(v) = artifact.fields.get("reviewed-by") {
        if let Some(s) = v.as_str() {
            if !s.is_empty() {
                return Some(s.to_string());
            }
        }
    }
    None
}

/// Look up the author from typed provenance.
pub fn author_of(artifact: &Artifact) -> Option<String> {
    artifact
        .provenance
        .as_ref()
        .map(|p| p.created_by.clone())
        .filter(|s| !s.is_empty())
}

/// Look up the role associated with the reviewer.
///
/// Checked in `fields["reviewer-role"]`. Returns `None` when absent.
pub fn reviewer_role_of(artifact: &Artifact) -> Option<String> {
    artifact
        .fields
        .get("reviewer-role")
        .and_then(|v| v.as_str())
        .filter(|s| !s.is_empty())
        .map(str::to_string)
}

/// Evaluate the oracle against a single artifact.
///
/// Only fires for `released` artifacts. For other statuses the oracle
/// vacuously passes (reviewers are not mandated pre-release).
pub fn compute(artifact: &Artifact, required_role: Option<&str>) -> Report {
    let status = artifact.status.clone();
    let author = author_of(artifact);
    let reviewer = reviewer_of(artifact);
    let role_actual = reviewer_role_of(artifact);

    let mut reasons = Vec::new();
    let mut ok = true;

    // The oracle only applies to `released` artifacts.
    if status.as_deref() != Some("released") {
        return Report {
            oracle: "review-signoff",
            artifact_id: artifact.id.clone(),
            ok: true,
            reasons: vec![format!(
                "not applicable: status is {:?}, oracle only applies to 'released'",
                status.as_deref().unwrap_or("<none>")
            )],
            author,
            reviewer,
            role_required: required_role.map(str::to_string),
            role_actual,
            status,
        };
    }

    // Reviewer presence.
    let reviewer_val = match &reviewer {
        Some(r) => r.clone(),
        None => {
            ok = false;
            reasons.push(
                "missing reviewer: set provenance.reviewed-by or fields[\"reviewed-by\"]"
                    .to_string(),
            );
            String::new()
        }
    };

    // Author presence — if neither author nor reviewer is known the oracle
    // should not silently pass; the spec explicitly asked for a clear error.
    let author_val = match &author {
        Some(a) => a.clone(),
        None => {
            ok = false;
            reasons.push(
                "missing author: set provenance.created-by to identify the author".to_string(),
            );
            String::new()
        }
    };

    // Reviewer must differ from author.
    if !reviewer_val.is_empty() && !author_val.is_empty() && reviewer_val == author_val {
        ok = false;
        reasons.push(format!(
            "reviewer ({reviewer_val}) must differ from author ({author_val})"
        ));
    }

    // Role-check if requested.
    if let Some(required) = required_role {
        match &role_actual {
            Some(actual) if actual == required => { /* match */ }
            Some(actual) => {
                ok = false;
                reasons.push(format!(
                    "reviewer role mismatch: required '{required}', actual '{actual}'"
                ));
            }
            None => {
                ok = false;
                reasons.push(format!(
                    "missing reviewer-role: required '{required}', set fields[\"reviewer-role\"]"
                ));
            }
        }
    }

    if ok && reasons.is_empty() {
        reasons.push("signoff valid".to_string());
    }

    Report {
        oracle: "review-signoff",
        artifact_id: artifact.id.clone(),
        ok,
        reasons,
        author,
        reviewer,
        role_required: required_role.map(str::to_string),
        role_actual,
        status,
    }
}

/// Human-readable rendering.
pub fn render_text(report: &Report) -> String {
    let head = if report.ok { "OK" } else { "FAIL" };
    let mut out = format!("review-signoff [{}] on {}\n", head, report.artifact_id);
    out.push_str(&format!(
        "  status: {}\n",
        report.status.as_deref().unwrap_or("<none>")
    ));
    out.push_str(&format!(
        "  author: {}\n",
        report.author.as_deref().unwrap_or("<none>")
    ));
    out.push_str(&format!(
        "  reviewer: {}\n",
        report.reviewer.as_deref().unwrap_or("<none>")
    ));
    if let Some(req) = &report.role_required {
        out.push_str(&format!(
            "  role required: {req}, actual: {}\n",
            report.role_actual.as_deref().unwrap_or("<none>")
        ));
    }
    for r in &report.reasons {
        out.push_str(&format!("  - {r}\n"));
    }
    out
}

/// Canonical JSON rendering.
pub fn render_json(report: &Report) -> String {
    serde_json::to_string_pretty(report).unwrap_or_else(|_| "{}".to_string())
}
