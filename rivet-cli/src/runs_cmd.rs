// SAFETY-REVIEW (SCRC Phase 1, DD-058): CLI binary I/O module; follows
// the rivet-cli file-scope blanket-allow pattern. User-facing errors
// already flow through anyhow; unwrap/expect in this file are on
// JSON serialisation of values we just constructed.
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

//! `rivet runs` — audit trail surface over `.rivet/runs/`.
//!
//! Subcommands:
//! - `rivet runs list` — list recent runs, newest first
//! - `rivet runs show <id>` — full detail on one run
//! - `rivet runs query [filters]` — filterable over manifests
//!
//! Runs are append-only. This module never writes to `.rivet/runs/`;
//! it only reads. `rivet close-gaps` is the only writer.

use std::path::Path;

use anyhow::{Context, Result};

use rivet_core::runs::{self, RunEntry};

/// `rivet runs list` implementation.
///
/// Prints the last N runs (or all, if limit is 0) to stdout. Format is
/// either "text" (default — a human-readable table) or "json" (machine).
pub fn cmd_list(project_root: &Path, limit: usize, format: &str) -> Result<bool> {
    validate_format(format)?;
    let mut entries = runs::list_runs(project_root)?;
    if limit > 0 && entries.len() > limit {
        entries.truncate(limit);
    }

    if format == "json" {
        let items: Vec<_> = entries.iter().map(run_entry_to_json).collect();
        let out = serde_json::json!({
            "total": entries.len(),
            "runs": items,
        });
        println!("{}", serde_json::to_string_pretty(&out)?);
    } else {
        if entries.is_empty() {
            println!("no runs recorded in .rivet/runs/");
            return Ok(true);
        }
        println!(
            "{:<30}  {:<10}  {:>4}  {:>4}  {:>4}  {}",
            "run_id", "status", "gaps", "auto", "rev", "invoker"
        );
        for e in &entries {
            let status = status_label(e);
            let m = &e.manifest;
            println!(
                "{:<30}  {:<10}  {:>4}  {:>4}  {:>4}  {}",
                e.run_id,
                status,
                m.summary.gaps_found,
                m.summary.auto_closed,
                m.summary.human_review,
                m.invocation.invoker,
            );
        }
    }
    Ok(true)
}

/// `rivet runs show <id>` implementation.
///
/// Loads the run's manifest and prints all sidecar file sizes +
/// summary counts. For `--format json`, dumps the full manifest.
pub fn cmd_show(project_root: &Path, run_id: &str, format: &str) -> Result<bool> {
    validate_format(format)?;
    let entry = runs::load_run(project_root, run_id)
        .with_context(|| format!("loading run `{run_id}`"))?
        .ok_or_else(|| anyhow::anyhow!("run `{run_id}` not found under .rivet/runs/"))?;

    if format == "json" {
        let sidecars = sidecar_sizes(&entry);
        let out = serde_json::json!({
            "manifest": &entry.manifest,
            "sidecars": sidecars,
            "path": entry.path.display().to_string(),
        });
        println!("{}", serde_json::to_string_pretty(&out)?);
    } else {
        let m = &entry.manifest;
        println!("Run: {}", m.run_id);
        println!("  started_at:   {}", m.started_at);
        println!(
            "  ended_at:     {}",
            m.ended_at.as_deref().unwrap_or("(in progress)")
        );
        println!("  status:       {}", status_label(&entry));
        println!("  rivet:        {} (templates v{})", m.rivet_version, m.template_version);
        println!(
            "  schemas:      {}",
            m.schemas
                .iter()
                .map(|(k, v)| format!("{k}@{v}"))
                .collect::<Vec<_>>()
                .join(", ")
        );
        println!("  pipelines:    {}", m.pipelines_active.join(", "));
        if let Some(ref v) = m.variant {
            println!("  variant:      {v}");
        }
        println!("  invoker:      {}", m.invocation.invoker);
        println!("  cli:          {}", m.invocation.cli);
        println!();
        println!("Summary:");
        println!("  gaps_found:    {}", m.summary.gaps_found);
        println!("  ranked_top_n:  {}", m.summary.ranked_top_n);
        println!("  auto_closed:   {}", m.summary.auto_closed);
        println!("  human_review:  {}", m.summary.human_review);
        println!("  skipped:       {}", m.summary.skipped);
        println!("  errored:       {}", m.summary.errored);
        println!();
        println!("Sidecars (in {}):", entry.path.display());
        for (name, size) in sidecar_sizes(&entry) {
            println!("  {name:<25}  {size:>10} bytes");
        }
    }
    Ok(true)
}

/// `rivet runs query` implementation.
///
/// Filters by pipeline name, schema, variant, status, or invoker
/// substring. Prints JSON by default for machine consumption.
pub fn cmd_query(
    project_root: &Path,
    pipeline: Option<&str>,
    schema: Option<&str>,
    variant: Option<&str>,
    status: Option<&str>,
    invoker_contains: Option<&str>,
    format: &str,
) -> Result<bool> {
    validate_format(format)?;
    let entries = runs::list_runs(project_root)?;
    let filtered: Vec<_> = entries
        .into_iter()
        .filter(|e| match_entry(e, pipeline, schema, variant, status, invoker_contains))
        .collect();

    if format == "json" {
        let items: Vec<_> = filtered.iter().map(run_entry_to_json).collect();
        let out = serde_json::json!({
            "total": filtered.len(),
            "runs": items,
        });
        println!("{}", serde_json::to_string_pretty(&out)?);
    } else {
        if filtered.is_empty() {
            println!("no runs match query");
            return Ok(true);
        }
        for e in &filtered {
            println!("{}  {}  {}", e.run_id, status_label(e), e.manifest.invocation.invoker);
        }
    }
    Ok(true)
}

// ── Helpers ────────────────────────────────────────────────────────────

fn validate_format(fmt: &str) -> Result<()> {
    match fmt {
        "text" | "json" => Ok(()),
        other => Err(anyhow::anyhow!(
            "unknown --format `{other}`: expected `text` or `json`"
        )),
    }
}

fn run_entry_to_json(e: &RunEntry) -> serde_json::Value {
    serde_json::json!({
        "run_id": e.run_id,
        "started_at": e.manifest.started_at,
        "ended_at": e.manifest.ended_at,
        "status": status_label(e),
        "rivet_version": e.manifest.rivet_version,
        "pipelines": e.manifest.pipelines_active,
        "variant": e.manifest.variant,
        "invoker": e.manifest.invocation.invoker,
        "summary": e.manifest.summary,
        "path": e.path.display().to_string(),
    })
}

fn status_label(e: &RunEntry) -> String {
    match (e.manifest.ended_at.as_ref(), e.manifest.exit_code) {
        (None, _) => "running".to_string(),
        (Some(_), Some(0)) => "success".to_string(),
        (Some(_), Some(code)) => format!("exit {code}"),
        (Some(_), None) => "ended".to_string(),
    }
}

fn sidecar_sizes(entry: &RunEntry) -> Vec<(String, u64)> {
    let mut out = Vec::new();
    for sidecar in [
        "manifest.json",
        "diagnostics.json",
        "oracle-firings.json",
        "ranked.json",
        "proposals.json",
        "validated.json",
        "emitted.json",
        "attestation-bundle.json",
    ] {
        let p = entry.path.join(sidecar);
        if let Ok(meta) = std::fs::metadata(&p) {
            out.push((sidecar.to_string(), meta.len()));
        }
    }
    out
}

fn match_entry(
    e: &RunEntry,
    pipeline: Option<&str>,
    schema: Option<&str>,
    variant: Option<&str>,
    status: Option<&str>,
    invoker_contains: Option<&str>,
) -> bool {
    if let Some(p) = pipeline {
        if !e.manifest.pipelines_active.iter().any(|x| x == p) {
            return false;
        }
    }
    if let Some(s) = schema {
        if !e.manifest.schemas.contains_key(s) {
            return false;
        }
    }
    if let Some(v) = variant {
        if e.manifest.variant.as_deref() != Some(v) {
            return false;
        }
    }
    if let Some(want) = status {
        if status_label(e) != want {
            return false;
        }
    }
    if let Some(needle) = invoker_contains {
        if !e.manifest.invocation.invoker.contains(needle) {
            return false;
        }
    }
    true
}
