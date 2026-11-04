//! `rivet verify` and `rivet trace-results` — evidence-gated verification.

use anyhow::Result;

use crate::{
    Cli, ModifyCaller, ProjectContext, cmd_modify_inner, default_marker_scan_paths, validate_format,
};

/// #547 (REQ-238): trace a requirement FORWARD to the test results that cover
/// it — the reverse of the authored `verifies` direction. Text tree or JSON
/// (the JSON is what the `rivet serve` graphical trace view consumes). Exits
/// non-zero only when a covering test recorded a FAILING result, so it is
/// usable as a per-requirement gate.
pub(crate) fn cmd_trace_results(cli: &Cli, id: &str, depth: usize, format: &str) -> Result<bool> {
    use rivet_core::result_trace::{TraceVerdict, trace_test_results, verdict};
    use rivet_core::results::{ResultStore, TestStatus};
    validate_format(format, &["text", "json"])?;
    let ctx = ProjectContext::load_full(cli)?;
    ctx.warn_parse_error_skips(cli);
    if !ctx.store.contains(id) {
        anyhow::bail!("artifact '{id}' not found");
    }
    let empty = ResultStore::new();
    let results = ctx.result_store.as_ref().unwrap_or(&empty);
    let nodes = trace_test_results(id, &ctx.graph, results, depth);
    let v = verdict(&nodes);
    let ok = !matches!(v, TraceVerdict::Failing);

    let badge = |s: Option<&TestStatus>| match s {
        Some(TestStatus::Pass) => "pass",
        Some(TestStatus::Fail) => "FAIL",
        Some(TestStatus::Error) => "ERROR",
        Some(TestStatus::Skip) => "skip",
        Some(TestStatus::Blocked) => "blocked",
        None => "·",
    };

    if format == "json" {
        println!(
            "{}",
            serde_json::to_string_pretty(&serde_json::json!({
                "command": "trace-results",
                "root": id,
                "verdict": v,
                "nodes": nodes,
            }))?
        );
    } else {
        let verdict_str = match v {
            TraceVerdict::Passing => "\u{2713} passing",
            TraceVerdict::Failing => "\u{2717} failing",
            TraceVerdict::NoEvidence => "\u{2014} no test evidence",
        };
        println!("Test-result trace for {id}: {verdict_str}");
        if nodes.is_empty() {
            println!("  (nothing traces to {id})");
        }
        for n in &nodes {
            let indent = "  ".repeat(n.distance);
            println!(
                "{indent}{} --{}--> {}   [{}]",
                n.artifact_id,
                n.link_type,
                n.via_target,
                badge(n.status.as_ref())
            );
        }
    }
    Ok(ok)
}

/// #559: advance an artifact to `verified` when it has verifying evidence —
/// an incoming `verifies` link from an artifact that is itself verified or
/// later (#1037), OR a `// rivet: verifies <ID>` source marker.
/// Opt-in and auditable (no auto-advance); the artifact must be `implemented`.
pub(crate) fn cmd_verify(
    cli: &Cli,
    id: &str,
    scan: &[std::path::PathBuf],
    dry_run: bool,
) -> Result<bool> {
    use rivet_core::test_scanner;

    // Scope the loaded store/graph borrows so cmd_modify can reload below.
    // Each incoming `verifies` link as (source id, its status, whether the
    // source is itself verified or later). Only the latter is evidence: an
    // `implemented` test specification has not shown anything yet (#1037).
    let links: Vec<(String, String, bool)> = {
        let ctx = ProjectContext::load(cli)?;
        let artifact = ctx
            .store
            .get(id)
            .ok_or_else(|| anyhow::anyhow!("artifact '{id}' not found"))?;
        match artifact.status.as_deref() {
            Some("verified") => {
                println!("{id} is already verified — nothing to do.");
                return Ok(true);
            }
            Some("implemented") => {}
            other => anyhow::bail!(
                "refusing to verify '{id}': status is '{}', expected 'implemented'. \
                 Only an implemented artifact can be advanced to verified.",
                other.unwrap_or("(none)")
            ),
        }
        ctx.graph
            .backlinks_of_type(id, "verifies")
            .iter()
            .map(|bl| {
                let source = ctx.store.get(&bl.source);
                (
                    bl.source.to_string(),
                    source
                        .and_then(|a| a.status.clone())
                        .unwrap_or_else(|| "no status".to_string()),
                    source.is_some_and(|a| a.carries_verification()),
                )
            })
            .collect()
    };
    let (qualifying, weak): (Vec<_>, Vec<_>) = links.iter().partition(|(_, _, ok)| *ok);

    // Source-marker evidence: `// rivet: verifies <ID>`. Default scan dirs are
    // workspace-aware and shared with `coverage --tests` (#603).
    let paths: Vec<std::path::PathBuf> = if scan.is_empty() {
        default_marker_scan_paths(&cli.project)
    } else {
        scan.to_vec()
    };
    let markers = test_scanner::scan_source_files_in_project(
        &cli.project,
        &paths,
        &test_scanner::default_patterns(),
    );
    let marker_hits: Vec<&test_scanner::TestMarker> = markers
        .iter()
        .filter(|m| m.target_id == id && m.link_type == "verifies")
        .collect();

    let named = |set: &[&(String, String, bool)]| {
        set.iter()
            .map(|(src, status, _)| format!("{src} ({status})"))
            .collect::<Vec<_>>()
            .join(", ")
    };
    if qualifying.is_empty() && marker_hits.is_empty() {
        if weak.is_empty() {
            anyhow::bail!(
                "refusing to verify '{id}': no verifying evidence. Add an incoming \
                 `verifies` link from a test/verification artifact, or a \
                 `// rivet: verifies {id}` marker in a test, then re-run."
            );
        }
        anyhow::bail!(
            "refusing to verify '{id}': every artifact that verifies it is unverified \
             itself: {}. A verifying artifact must be verified (or released/accepted) \
             before it is evidence; verify it first, or add a \
             `// rivet: verifies {id}` marker in a test.",
            named(&weak)
        );
    }
    if !qualifying.is_empty() {
        println!("  evidence: verified by {}", named(&qualifying));
    }
    if !weak.is_empty() {
        println!("  not counted (not verified themselves): {}", named(&weak));
    }
    if let Some(first) = marker_hits.first() {
        println!(
            "  evidence: {} source `verifies` marker(s) (e.g. {}:{})",
            marker_hits.len(),
            first.file.display(),
            first.line
        );
    }

    if dry_run {
        println!("dry run: {id} would be advanced implemented -> verified (nothing written)");
        return Ok(true);
    }

    // Advance via the shared modify write-path (validation + YAML edit). This is
    // the ONLY privileged caller: the evidence check above is what entitles it
    // to write `verified`, which every other writer is refused (REQ-381).
    cmd_modify_inner(
        cli,
        Some(id),
        None,
        false,
        Some("verified"),
        None,
        None,
        None,
        &[],
        &[],
        &[],
        ModifyCaller::VerifyAfterEvidenceCheck,
    )
}
