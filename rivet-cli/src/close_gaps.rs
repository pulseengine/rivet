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

use rivet_core::runs::{self, Invocation, OracleFiring, RunManifest, RunSummary};

/// Top-level JSON output of `rivet close-gaps --format json`.
///
/// **Rivet's role here is mechanical**: list the oracle firings, sorted,
/// with enough context that an orchestrator's own prompts (the
/// `discover.md` / `validate.md` / `emit.md` the project scaffolds into
/// `.rivet/templates/pipelines/<kind>/`) can act on them.
///
/// Deliberately absent: routing decisions, template-pair paths per gap,
/// proposed-action prescription. Those are the orchestrator's call,
/// not rivet's. See the project blog post "Spec-driven development is
/// half the loop" — "no LLM narrative in the loop — just the
/// validator's diagnostic and the agent's proposed closure."
#[derive(Debug, Clone, Serialize)]
pub struct CloseGapsOutput {
    pub run_id: String,
    pub rivet_version: String,
    pub pipelines_active: Vec<String>,
    pub schemas_active: Vec<String>,
    pub variant: Option<String>,
    pub gaps: Vec<GapReport>,
    pub elapsed_ms: u64,
}

/// One oracle firing, surfaced to the orchestrator with minimal context.
/// The orchestrator (an AI agent or a shell script or a human) decides
/// what to do with it. Rivet does not classify or route.
#[derive(Debug, Clone, Serialize)]
pub struct GapReport {
    /// Stable id within this run (`gap-0`, `gap-1`, …).
    pub id: String,
    /// Artifact the oracle tripped on, if any.
    pub artifact_id: Option<String>,
    /// Verbatim oracle diagnostic message.
    pub diagnostic: String,
    /// Which oracles fired on this artifact, and at what weight.
    pub contributing_oracles: Vec<ContributingOracle>,
    /// Deterministic sort key. Computed from the contributing oracles'
    /// weights; orchestrators may re-sort or ignore it.
    pub rank_weight: i32,
    /// Schema whose oracle surfaced this gap first. Used only for
    /// grouping / attribution, not for routing decisions.
    pub owning_schema: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct ContributingOracle {
    pub oracle_id: String,
    pub schema: String,
    pub weight: i32,
    pub details: String,
}

// ── Entry point ────────────────────────────────────────────────────────

pub struct CloseGapsOptions<'a> {
    pub project_root: &'a Path,
    pub schemas_dir: &'a Path,
    pub top_n: usize,
    pub variant: Option<&'a str>,
    pub format: &'a str, // "json" | "text"
    /// Reserved for the `--dry-run` flag plumb-through; not yet read.
    #[allow(dead_code)]
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
            cli: format!(
                "rivet close-gaps{}",
                opts.variant
                    .map(|v| format!(" --variant {v}"))
                    .unwrap_or_default()
            ),
            cwd: opts.project_root.display().to_string(),
            invoker: opts.invoker.to_string(),
        },
        summary: RunSummary::default(),
        exit_code: None,
    };
    let handle = runs::open_run(opts.project_root, &manifest)?;

    // 3. Run the structural oracle (rivet validate equivalent, but
    //    via the in-process validator for speed and to avoid a fork).
    let (diagnostics, firings) =
        run_structural_oracle(opts.project_root, &pipelines, opts.schemas_dir)?;
    handle.write_json("diagnostics.json", &diagnostics)?;
    handle.write_json("oracle-firings.json", &firings)?;

    // 4. Build gap reports — no routing, no classification.
    let mut gaps = build_gap_reports(&pipelines, &firings);

    // 5. Deterministic order + top-N — rank_weight is advisory.
    gaps.sort_by(|a, b| b.rank_weight.cmp(&a.rank_weight).then(a.id.cmp(&b.id)));
    if opts.top_n > 0 && gaps.len() > opts.top_n {
        gaps.truncate(opts.top_n);
    }
    handle.write_json("ranked.json", &gaps)?;
    handle.write_json("proposals.json", &gaps)?;

    // 6. Finalise manifest summary. Orchestrator outcomes (validate /
    //    emit counts) are reported back via `rivet runs record` — rivet
    //    doesn't know those at plan time.
    let summary = RunSummary {
        gaps_found: firings.iter().filter(|f| f.fired).count() as u32,
        ranked_top_n: gaps.len() as u32,
        auto_closed: 0,
        human_review: 0,
        skipped: 0,
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
        gaps,
        elapsed_ms,
    };

    match opts.format {
        "json" => {
            println!("{}", serde_json::to_string_pretty(&output)?);
        }
        _ => {
            println!("Run: {}", output.run_id);
            println!("  pipelines: [{}]", output.pipelines_active.join(", "));
            println!("  gaps:      {}", output.gaps.len());
            println!("  elapsed:   {} ms", output.elapsed_ms);
            println!();
            for g in &output.gaps {
                println!(
                    "  [{}][w={}] {} — {}",
                    g.owning_schema,
                    g.rank_weight,
                    g.artifact_id.as_deref().unwrap_or("?"),
                    g.diagnostic,
                );
            }
            if output.gaps.is_empty() {
                println!("  (no gaps surfaced by any active oracle)");
            } else {
                println!();
                println!("  See `.rivet/templates/pipelines/<kind>/{{discover,validate,emit}}.md`");
                println!("  for the project's own closure procedure. Rivet does not prescribe");
                println!("  routing; the orchestrator's prompts decide per gap.");
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

// ── Gap-report construction ────────────────────────────────────────────

/// Build one `GapReport` per oracle firing. Rivet's contribution is
/// purely mechanical: attribute each firing to its schema, attach the
/// schema's oracle weight for sorting, and move on. No routing, no
/// closure-kind classification, no template dispatch — those are the
/// orchestrator's job.
fn build_gap_reports(
    pipelines: &[(String, rivet_core::agent_pipelines::AgentPipelines)],
    firings: &[OracleFiring],
) -> Vec<GapReport> {
    let mut out = Vec::new();
    for (i, f) in firings.iter().filter(|f| f.fired).enumerate() {
        // Owning schema: the first schema whose pipelines reference the
        // firing's oracle id. Same-oracle-across-schemas tie-breaks by
        // rivet.yaml load order (BTreeMap gives deterministic iteration).
        let owning_schema = pipelines
            .iter()
            .find(|(_s, ap)| {
                ap.pipelines
                    .values()
                    .any(|p| p.uses_oracles.iter().any(|u| u == &f.oracle_id))
            })
            .map(|(s, _)| s.clone())
            .unwrap_or_else(|| f.schema.clone());

        out.push(GapReport {
            id: format!("gap-{i}"),
            artifact_id: f.artifact_id.clone(),
            diagnostic: f.details.clone(),
            contributing_oracles: vec![ContributingOracle {
                oracle_id: f.oracle_id.clone(),
                schema: f.schema.clone(),
                weight: 10,
                details: f.details.clone(),
            }],
            // Flat weight until the multi-schema `rank-by` composition
            // lands; rivet sorts gaps by weight, orchestrator may ignore.
            rank_weight: 10,
            owning_schema,
        });
    }
    out
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
