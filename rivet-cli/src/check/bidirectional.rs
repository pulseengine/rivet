//! `rivet check bidirectional` — bidirectional traceability oracle.
//!
//! For every link `A -(type)-> B` in the store where the schema declares
//! `type` has an `inverse:`, verify that `B -(inverse)-> A` is present in
//! the store. If any forward link lacks its inverse, the oracle fires.
//!
//! Exit codes:
//! * 0 — every inverse-bearing forward link has its inverse on the target.
//! * 1 — one or more inverses missing; violations printed (and emitted as
//!   JSON on `--format json`).
//!
//! JSON contract (consumed by pipelines):
//! ```json
//! {
//!   "oracle": "bidirectional",
//!   "violations": [
//!     {
//!       "source": "REQ-001",
//!       "link_type": "satisfies",
//!       "target": "DD-001",
//!       "expected_inverse": "satisfied-by"
//!     }
//!   ]
//! }
//! ```

use rivet_core::links::LinkGraph;
use rivet_core::schema::Schema;
use rivet_core::store::Store;

use serde::Serialize;

/// One missing-inverse diagnostic.
#[derive(Debug, Clone, Serialize, PartialEq, Eq)]
pub struct Violation {
    pub source: String,
    pub link_type: String,
    pub target: String,
    pub expected_inverse: String,
}

/// JSON envelope emitted on `--format json`.
#[derive(Debug, Clone, Serialize)]
pub struct Report {
    pub oracle: &'static str,
    pub violations: Vec<Violation>,
}

/// Compute all missing-inverse violations against a loaded project.
///
/// Pure function: takes the data, returns the report. No I/O, no printing.
/// Used by both the CLI wrapper and integration tests.
pub fn compute(store: &Store, schema: &Schema, graph: &LinkGraph) -> Report {
    let mut violations = Vec::new();

    for artifact in store.iter() {
        let src = &artifact.id;
        for link in &artifact.links {
            // Only links that *declare* an inverse in the schema are checked.
            let Some(expected_inverse) = schema.inverse_of(&link.link_type) else {
                continue;
            };
            // Skip broken links — those are a separate validator concern.
            // The target must exist for us to check its backlinks.
            if !store.contains(&link.target) {
                continue;
            }
            // Look at the target's backlinks: the LinkGraph registers every
            // *forward* link's inverse as a Backlink on the target. For
            // symmetry we need the target to have a *forward* link of type
            // `expected_inverse` pointing back at `src`.
            let target_artifact = match store.get(&link.target) {
                Some(a) => a,
                None => continue,
            };
            let has_inverse = target_artifact
                .links
                .iter()
                .any(|l| l.link_type == expected_inverse && l.target == *src);
            if !has_inverse {
                violations.push(Violation {
                    source: src.clone(),
                    link_type: link.link_type.clone(),
                    target: link.target.clone(),
                    expected_inverse: expected_inverse.to_string(),
                });
            }
        }
    }

    // `graph` currently unused — reserved for future cycle / reachability
    // extensions. Reference it to keep the parameter in the signature
    // stable.
    let _ = graph;

    // Deterministic ordering for stable golden tests.
    violations.sort_by(|a, b| {
        (a.source.as_str(), a.link_type.as_str(), a.target.as_str()).cmp(&(
            b.source.as_str(),
            b.link_type.as_str(),
            b.target.as_str(),
        ))
    });

    Report {
        oracle: "bidirectional",
        violations,
    }
}

/// Render the human-readable form.
pub fn render_text(report: &Report) -> String {
    if report.violations.is_empty() {
        return "bidirectional: OK (no missing inverses)\n".to_string();
    }
    let mut out = String::new();
    out.push_str(&format!(
        "bidirectional: {} missing inverse(s)\n",
        report.violations.len()
    ));
    for v in &report.violations {
        out.push_str(&format!(
            "  {} -({}) -> {}: missing inverse '{}' on {}\n",
            v.source, v.link_type, v.target, v.expected_inverse, v.target
        ));
    }
    out
}

/// Render the canonical JSON form.
pub fn render_json(report: &Report) -> String {
    serde_json::to_string_pretty(report).unwrap_or_else(|_| "{}".to_string())
}
