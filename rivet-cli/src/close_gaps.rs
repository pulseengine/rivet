// SAFETY-REVIEW (SCRC Phase 1, DD-058): CLI module; file-scope blanket
// allow consistent with rivet-cli. All writes pass through rivet-core's
// ownership guard.
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

//! `rivet close-gaps` — the MVP loop.
//!
//! This is the minimum viable slice: structural pipeline only, dev
//! schema only, auto-close for link-existing gaps only. Emits a JSON
//! payload describing every proposal and persists a full run record
//! under `.rivet/runs/`.
//!
//! Future work (tracked in spec §13 steps 6–14):
//! - Multi-schema composition
//! - decomposition / content / coverage / argument / review / discovery pipelines
//! - Variant-conditional ranking
//! - `--emit pr` with gh integration
//! - Fresh-session validator
//! - Attestation bundle

use std::path::Path;

use anyhow::{Context, Result};
use serde::Serialize;

use rivet_core::runs::{
    self, Invocation, OracleFiring, RunManifest, RunSummary,
};

/// Top-level JSON output of `rivet close-gaps --emit json`. This is the
/// stable API contract every tool adapter consumes — see spec §7.2.
#[derive(Debug, Clone, Serialize)]
pub struct CloseGapsOutput {
    pub run_id: String,
    pub rivet_version: String,
    pub pipelines_active: Vec<String>,
    pub schemas_active: Vec<String>,
    pub variant: Option<String>,
    pub gaps: Vec<GapProposal>,
    pub elapsed_ms: u64,
}

#[derive(Debug, Clone, Serialize)]
pub struct GapProposal {
    pub id: String,
    pub artifact_id: Option<String>,
    pub diagnostic: String,
    pub contributing_oracles: Vec<ContributingOracle>,
    pub rank_weight: i32,
    pub owning_schema: String,
    pub routing: Routing,
    pub reviewers: Vec<String>,
    pub draft_template: Option<String>,
    pub proposed_action: ProposedAction,
    pub validated: Option<bool>,
    pub emitted: Option<EmittedRecord>,
}

#[derive(Debug, Clone, Serialize)]
pub struct ContributingOracle {
    pub oracle_id: String,
    pub schema: String,
    pub weight: i32,
    pub details: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "kebab-case")]
pub enum Routing {
    AutoClose,
    HumanReviewRequired,
    SkippedManualOnly,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "kebab-case", tag = "kind")]
pub enum ProposedAction {
    Link { command: String },
    CreateArtifact { stub_path: String },
    DraftStub { stub_path: String },
    ExternalToolRun { command: String },
    None,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "kebab-case", tag = "kind")]
pub enum EmittedRecord {
    None,
    Commit { sha: String },
    Pr { url: String },
    Patch { path: String },
    CrTicket { id: String },
}

// ── Entry point ────────────────────────────────────────────────────────

pub struct CloseGapsOptions<'a> {
    pub project_root: &'a Path,
    pub schemas_dir: &'a Path,
    pub top_n: usize,
    pub variant: Option<&'a str>,
    pub format: &'a str, // "json" | "text"
    pub dry_run: bool,
    pub rivet_version: &'a str,
    pub invoker: &'a str,
}

pub fn run(opts: CloseGapsOptions) -> Result<bool> {
    let started_at_inst = std::time::Instant::now();
    let started_at = now_iso8601();

    // 1. Load active pipelines
    let pipelines = crate::pipelines_cmd::load_pipelines(opts.project_root, opts.schemas_dir)
        .context("loading agent-pipelines blocks")?;
    if pipelines.is_empty() {
        anyhow::bail!(
            "no active schema declares an agent-pipelines: block — run `rivet pipelines list` to confirm"
        );
    }
    let pipeline_names: Vec<String> = pipelines
        .iter()
        .flat_map(|(_, ap)| ap.pipelines.keys().cloned())
        .collect();
    let schema_names: Vec<String> = pipelines.iter().map(|(s, _)| s.clone()).collect();
    let schemas_versions: std::collections::BTreeMap<String, String> = schema_names
        .iter()
        .map(|s| (s.clone(), opts.rivet_version.to_string()))
        .collect();

    // 2. Open run record
    let run_id = runs::new_run_id();
    let manifest = RunManifest {
        run_id: run_id.clone(),
        started_at: started_at.clone(),
        ended_at: None,
        rivet_version: opts.rivet_version.to_string(),
        template_version: 1,
        schemas: schemas_versions,
        pipelines_active: pipeline_names.clone(),
        variant: opts.variant.map(|s| s.to_string()),
        invocation: Invocation {
            cli: format!("rivet close-gaps{}", opts.variant.map(|v| format!(" --variant {v}")).unwrap_or_default()),
            cwd: opts.project_root.display().to_string(),
            invoker: opts.invoker.to_string(),
        },
        summary: RunSummary::default(),
        exit_code: None,
    };
    let handle = runs::open_run(opts.project_root, &manifest)?;

    // 3. Run the structural oracle (rivet validate equivalent, but
    //    via the in-process validator for speed and to avoid a fork).
    let (diagnostics, firings) = run_structural_oracle(opts.project_root, &pipelines, opts.schemas_dir)?;
    handle.write_json("diagnostics.json", &diagnostics)?;
    handle.write_json("oracle-firings.json", &firings)?;

    // 4. Rank + route. MVP: each firing becomes one gap, routed by the
    //    first matching auto-close rule or human-review rule in the
    //    first pipeline whose uses-oracles references the oracle.
    let mut proposals = build_proposals(&pipelines, &firings);

    // 5. Deterministic order + top-N
    proposals.sort_by(|a, b| b.rank_weight.cmp(&a.rank_weight).then(a.id.cmp(&b.id)));
    if opts.top_n > 0 && proposals.len() > opts.top_n {
        proposals.truncate(opts.top_n);
    }
    handle.write_json("ranked.json", &proposals)?;
    handle.write_json("proposals.json", &proposals)?;
    handle.write_json("validated.json", &serde_json::json!([]))?; // MVP: no fresh-validate yet
    handle.write_json("emitted.json", &serde_json::json!([]))?; // MVP: no emit yet

    // 6. Finalise manifest summary
    let summary = RunSummary {
        gaps_found: firings.iter().filter(|f| f.fired).count() as u32,
        ranked_top_n: proposals.len() as u32,
        auto_closed: 0, // MVP: dry-run only
        human_review: proposals
            .iter()
            .filter(|p| matches!(p.routing, Routing::HumanReviewRequired))
            .count() as u32,
        skipped: proposals
            .iter()
            .filter(|p| matches!(p.routing, Routing::SkippedManualOnly))
            .count() as u32,
        errored: 0,
    };
    let ended_at = now_iso8601();
    handle.finalise(ended_at.clone(), 0, summary.clone())?;

    let elapsed_ms = started_at_inst.elapsed().as_millis() as u64;

    // 7. Emit requested format to stdout
    let output = CloseGapsOutput {
        run_id: run_id.clone(),
        rivet_version: opts.rivet_version.to_string(),
        pipelines_active: pipeline_names,
        schemas_active: schema_names,
        variant: opts.variant.map(|s| s.to_string()),
        gaps: proposals,
        elapsed_ms,
    };

    match opts.format {
        "json" => {
            println!("{}", serde_json::to_string_pretty(&output)?);
        }
        "text" | _ => {
            println!("Run: {}", output.run_id);
            println!(
                "  pipelines: [{}]",
                output.pipelines_active.join(", ")
            );
            println!("  gaps:      {}", output.gaps.len());
            println!("  elapsed:   {} ms", output.elapsed_ms);
            println!();
            for g in &output.gaps {
                let routing = match g.routing {
                    Routing::AutoClose => "auto-close",
                    Routing::HumanReviewRequired => "human-review",
                    Routing::SkippedManualOnly => "skipped",
                };
                println!(
                    "  [{}][w={}] {} — {}",
                    routing,
                    g.rank_weight,
                    g.artifact_id.as_deref().unwrap_or("?"),
                    g.diagnostic,
                );
            }
            if output.gaps.is_empty() {
                println!("  (no gaps surfaced by any active oracle)");
            }
        }
    }

    Ok(true)
}

// ── Oracle execution ───────────────────────────────────────────────────

/// MVP: run the in-process `rivet_core::validate` equivalent. When the
/// oracle library lands, this becomes a general dispatcher over the
/// `command:` field of each oracle declaration.
fn run_structural_oracle(
    project_root: &Path,
    pipelines: &[(String, rivet_core::agent_pipelines::AgentPipelines)],
    _schemas_dir: &Path,
) -> Result<(serde_json::Value, Vec<OracleFiring>)> {
    // Load the project
    let loaded = rivet_core::load_project_full(project_root)
        .context("loading project for structural oracle")?;
    let diagnostics = rivet_core::validate::validate(&loaded.store, &loaded.schema, &loaded.graph);

    let mut firings = Vec::new();
    let now = now_iso8601();
    for (schema, ap) in pipelines {
        // Match every oracle whose command starts with "rivet validate"
        // (the structural oracle). Command parsing stays simple for MVP.
        for oracle in &ap.oracles {
            if !oracle.command.trim_start().starts_with("rivet validate") {
                continue;
            }
            for d in &diagnostics {
                firings.push(OracleFiring {
                    oracle_id: oracle.id.clone(),
                    schema: schema.clone(),
                    artifact_id: d.artifact_id.clone(),
                    fired: d.severity == rivet_core::schema::Severity::Error,
                    details: d.message.clone(),
                    captured_at: now.clone(),
                });
            }
        }
    }

    let diag_json = serde_json::to_value(
        diagnostics
            .iter()
            .map(|d| {
                serde_json::json!({
                    "severity": format!("{:?}", d.severity).to_lowercase(),
                    "artifact_id": d.artifact_id,
                    "message": d.message,
                })
            })
            .collect::<Vec<_>>(),
    )?;
    Ok((diag_json, firings))
}

// ── Proposal construction ──────────────────────────────────────────────

fn build_proposals(
    pipelines: &[(String, rivet_core::agent_pipelines::AgentPipelines)],
    firings: &[OracleFiring],
) -> Vec<GapProposal> {
    let mut out = Vec::new();
    for (i, f) in firings.iter().filter(|f| f.fired).enumerate() {
        // Find the owning schema's routing config
        let (owning_schema, routing, reviewers, draft_template) =
            route_firing(pipelines, f).unwrap_or_else(|| {
                (
                    f.schema.clone(),
                    Routing::SkippedManualOnly,
                    Vec::new(),
                    None,
                )
            });
        out.push(GapProposal {
            id: format!("gap-{i}"),
            artifact_id: f.artifact_id.clone(),
            diagnostic: f.details.clone(),
            contributing_oracles: vec![ContributingOracle {
                oracle_id: f.oracle_id.clone(),
                schema: f.schema.clone(),
                weight: 10,
                details: f.details.clone(),
            }],
            rank_weight: 10, // MVP flat weight; real ranking comes with schema rank-by rules
            owning_schema,
            routing,
            reviewers,
            draft_template,
            proposed_action: ProposedAction::None,
            validated: None,
            emitted: None,
        });
    }
    out
}

fn route_firing(
    pipelines: &[(String, rivet_core::agent_pipelines::AgentPipelines)],
    firing: &OracleFiring,
) -> Option<(String, Routing, Vec<String>, Option<String>)> {
    for (schema, ap) in pipelines {
        if schema != &firing.schema {
            continue;
        }
        for (_pname, pipeline) in &ap.pipelines {
            if !pipeline.uses_oracles.iter().any(|u| u == &firing.oracle_id) {
                continue;
            }
            // Route: auto-close if any auto-close rule's when.oracle matches
            for rule in &pipeline.auto_close {
                if rule_matches_oracle(&rule.when, &firing.oracle_id) {
                    return Some((
                        schema.clone(),
                        Routing::AutoClose,
                        rule.reviewers.clone(),
                        rule.draft_template.clone(),
                    ));
                }
            }
            for rule in &pipeline.human_review_required {
                if rule_matches_oracle(&rule.when, &firing.oracle_id) {
                    return Some((
                        schema.clone(),
                        Routing::HumanReviewRequired,
                        rule.reviewers.clone(),
                        rule.draft_template.clone(),
                    ));
                }
            }
            // Fallback: human-review default if uses-oracles matches but no rule does
            return Some((schema.clone(), Routing::HumanReviewRequired, Vec::new(), None));
        }
    }
    None
}

fn rule_matches_oracle(
    when: &rivet_core::agent_pipelines::MatchClause,
    oracle_id: &str,
) -> bool {
    match when.get("oracle") {
        Some(serde_yaml::Value::String(s)) if s == oracle_id => true,
        _ => false,
    }
}

// ── Helpers ────────────────────────────────────────────────────────────

fn now_iso8601() -> String {
    // Simple UTC ISO-8601 without chrono dep. Hour+minute+second precision.
    let secs = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs();
    let total_days = (secs / 86_400) as i64;
    let rem = secs % 86_400;
    let h = rem / 3600;
    let m = (rem / 60) % 60;
    let s = rem % 60;
    let (y, mo, d) = civil_from_days(total_days);
    format!("{y:04}-{mo:02}-{d:02}T{h:02}:{m:02}:{s:02}Z")
}

fn civil_from_days(z: i64) -> (i64, u32, u32) {
    let z = z + 719_468;
    let era = if z >= 0 { z } else { z - 146_096 } / 146_097;
    let doe = (z - era * 146_097) as u32;
    let yoe = (doe - doe / 1460 + doe / 36524 - doe / 146_096) / 365;
    let y = yoe as i64 + era * 400;
    let doy = doe - (365 * yoe + yoe / 4 - yoe / 100);
    let mp = (5 * doy + 2) / 153;
    let d = doy - (153 * mp + 2) / 5 + 1;
    let m = if mp < 10 { mp + 3 } else { mp - 9 };
    let y = if m <= 2 { y + 1 } else { y };
    (y, m, d)
}
