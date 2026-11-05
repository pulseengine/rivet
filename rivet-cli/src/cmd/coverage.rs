//! `rivet coverage` — traceability, test-marker and V&V matrix coverage.

use std::path::PathBuf;

use anyhow::{Context, Result};

use rivet_core::coverage;
use rivet_core::links::LinkGraph;
use rivet_core::store::Store;

use crate::{
    Cli, ProjectContext, apply_baseline_scope, default_marker_scan_paths, load_result_store,
    marker_verified_ids, resolve_variant_arg, validate_format,
};

/// Show traceability coverage report.
pub(crate) fn cmd_coverage(
    cli: &Cli,
    sexpr_filter: Option<&str>,
    format: &str,
    fail_under: Option<&f64>,
    baseline_name: Option<&str>,
    variant_arg: Option<&str>,
    strict_empty: bool,
) -> Result<bool> {
    validate_format(format, &["text", "json"])?;
    let ctx = ProjectContext::load(cli)?;
    let mut store = apply_baseline_scope(ctx.store, baseline_name, &ctx.config);
    let schema = ctx.schema;
    // REQ-389: `verifies` source markers are verification evidence.
    let markers = marker_verified_ids(&cli.project);
    let mut graph = if baseline_name.is_some() {
        LinkGraph::build(&store, &schema)
    } else {
        ctx.graph
    }
    .with_marker_evidence(markers.iter().cloned());

    // Resolve `--variant` once so we can stamp the report header (and,
    // in a later phase, scope delegated chains). Today the variant
    // does not yet alter coverage counts — the chain-rewriting work is
    // a follow-up — but we surface the active variant in both text and
    // JSON output for traceability per issue #287 acceptance criterion 4.
    let variant_name: Option<String> = match variant_arg {
        Some(arg) => Some(resolve_variant_arg(&cli.project, arg)?.1),
        None => None,
    };

    // Apply s-expression filter if provided.
    if let Some(filter_src) = sexpr_filter {
        let expr = rivet_core::sexpr_eval::parse_filter(filter_src).map_err(|errs| {
            let msgs: Vec<String> = errs.iter().map(|e| e.to_string()).collect();
            anyhow::anyhow!("invalid filter: {}", msgs.join("; "))
        })?;
        let mut filtered = rivet_core::store::Store::default();
        for a in store.iter() {
            if rivet_core::sexpr_eval::matches_filter_with_store(&expr, a, &graph, &store) {
                filtered.upsert(a.clone());
            }
        }
        store = filtered;
        graph = LinkGraph::build(&store, &schema).with_marker_evidence(markers.iter().cloned());
    }

    let mut report = coverage::compute_coverage(&store, &schema, &graph);

    // REQ-320 (#871 part 2): apply the project's unmodelled-rule declarations.
    // The rules STAY in the report — hiding them is the failure this replaces.
    // A declaration that no longer holds is an error: an exemption that
    // outlives its reason is the same defect as the 100% it replaced.
    let unmodelled_problems = match ctx.config.coverage.as_ref() {
        Some(cov_cfg) => coverage::mark_unmodelled(&mut report, &cov_cfg.unmodelled_rules),
        None => Vec::new(),
    };
    let report = report;

    // #808: distinguish "no artifacts to score" (n/a) from "100%
    // coverage." A rule with total=0 emits `null` for both percentages;
    // a machine consumer can then tell a satisfied gate from an empty
    // one without inspecting `total`.
    // REQ-387: `None` (an empty scope) is `null`, never a number.
    let pct_or_null = |pct: Option<f64>| -> serde_json::Value {
        pct.map_or(serde_json::Value::Null, |p| {
            serde_json::json!((p * 10.0).round() / 10.0)
        })
    };

    if format == "json" {
        let rules_json: Vec<serde_json::Value> = report
            .entries
            .iter()
            .map(|e| {
                let empty = e.is_empty_scope();
                serde_json::json!({
                    "name": e.rule_name,
                    "description": e.description,
                    "source_type": e.source_type,
                    "link_type": e.link_type,
                    "direction": e.direction,
                    "covered": e.covered,
                    "external_boundary": e.external_boundary,
                    "external_boundary_ids": e.external_boundary_ids,
                    "total": e.total,
                    "empty_scope": empty,
                    "percentage": pct_or_null(e.percentage_opt()),
                    "accounted_percentage": pct_or_null(e.accounted_percentage_opt()),
                    "uncovered_ids": e.uncovered_ids,
                    // REQ-320: present only when the project declared it, so a
                    // reader can tell an unmodelled level from an empty
                    // population nobody claimed.
                    "unmodelled": e.unmodelled,
                })
            })
            .collect();
        // REQ-111: these aggregate per-RULE denominators (an artifact satisfying
        // N rules is counted N times) — NOT the distinct-artifact `total` that
        // `stats` JSON reports. Emit under `checks_*` keys so the same key name
        // `total` never carries two different cardinalities across commands.
        let checks_total: usize = report.entries.iter().map(|e| e.total).sum();
        let checks_covered: usize = report.entries.iter().map(|e| e.covered).sum();
        let external_boundary: usize = report.entries.iter().map(|e| e.external_boundary).sum();
        let report_empty = report.is_empty_scope();
        let overall_pct = pct_or_null(report.overall_coverage_opt());
        // V-closure: intersection of all rules per source type (both sides of
        // the V). Each entry rounds its percentage to one decimal to match the
        // text view and the `overall` block.
        let closure_json: Vec<serde_json::Value> = report
            .v_closure()
            .into_iter()
            .map(|c| {
                let empty = c.is_empty_scope();
                serde_json::json!({
                    "source_type": c.source_type,
                    "rule_names": c.rule_names,
                    "closed": c.closed,
                    "total": c.total,
                    "empty_scope": empty,
                    "open_ids": c.open_ids,
                    "percentage": pct_or_null(c.percentage_opt()),
                })
            })
            .collect();
        let mut output = serde_json::json!({
            "command": "coverage",
            "rules": rules_json,
            "overall": {
                "checks_covered": checks_covered,
                "external_boundary": external_boundary,
                "checks_total": checks_total,
                "empty_scope": report_empty,
                "percentage": overall_pct,
            },
            "closure": closure_json,
        });
        if let Some(ref name) = variant_name {
            output["variant"] = serde_json::Value::String(name.clone());
        }
        // Echo the threshold + pass/fail result when --fail-under is in
        // effect so CI consumers can programmatically distinguish a
        // clean run from a gated failure without parsing stderr.
        if let Some(&threshold) = fail_under {
            // REQ-387: an empty scope cannot meet a threshold. This said
            // `passed: true` while the same run exited 1 for the empty load.
            let passed = report
                .overall_coverage_opt()
                .is_some_and(|o| o >= threshold);
            output["threshold"] = serde_json::json!({
                "fail_under": threshold,
                "passed": passed,
            });
        }
        // REQ-320: a declaration that no longer holds is reported, named, and
        // fails the run.
        if !unmodelled_problems.is_empty() {
            output["unmodelled_problems"] = serde_json::json!(unmodelled_problems);
        }
        println!("{}", serde_json::to_string_pretty(&output).unwrap());
    } else {
        let any_boundary = report.entries.iter().any(|e| e.external_boundary > 0);
        println!("Traceability Coverage Report\n");
        if let Some(ref name) = variant_name {
            println!("Variant: {name}\n");
        }
        // #808: if the whole report is empty-scope (project loaded zero
        // scoring artifacts), lead with a big red note so the reader
        // never mistakes an empty gate for a passing one.
        if report.is_empty_scope() {
            println!("  \u{26A0}  No artifacts loaded — every rule scores n/a (0/0).");
            println!(
                "      Check `sources:` in rivet.yaml resolve to files that parse as artifacts,"
            );
            println!("      or pass `--strict-empty` to fail the run on this state.\n");
        }
        if any_boundary {
            println!(
                "  {:<30} {:<20} {:>8} {:>9} {:>8} {:>8}",
                "Rule", "Source Type", "Covered", "Boundary", "Total", "%"
            );
        } else {
            println!(
                "  {:<30} {:<20} {:>8} {:>8} {:>8}",
                "Rule", "Source Type", "Covered", "Total", "%"
            );
        }
        println!("  {}", "-".repeat(80));

        // Format helper: "n/a" for empty scope, "N.N%" otherwise. Keeps
        // the width stable so column alignment survives either state.
        let fmt_pct = |pct: Option<f64>| -> String {
            match pct {
                None => format!("{:>7}%", "n/a"),
                Some(p) => format!("{:>7.1}%", p),
            }
        };

        for entry in &report.entries {
            if any_boundary {
                println!(
                    "  {:<30} {:<20} {:>8} {:>9} {:>8} {}",
                    entry.rule_name,
                    entry.source_type,
                    entry.covered,
                    entry.external_boundary,
                    entry.total,
                    fmt_pct(entry.percentage_opt())
                );
            } else {
                println!(
                    "  {:<30} {:<20} {:>8} {:>8} {}",
                    entry.rule_name,
                    entry.source_type,
                    entry.covered,
                    entry.total,
                    fmt_pct(entry.percentage_opt())
                );
            }
            // #895: for a failing (non-100%) rule, print the link the rule
            // requires directly under the tally so the reader can act on
            // it without opening the schema. The line repeats the rule
            // name so a plain `grep <rule>` on the report also returns
            // the remediation info. Empty-scope rules (0/0) and 100%
            // rules are skipped — remediation isn't the question there.
            if entry.percentage_opt().is_some_and(|p| p < 100.0) {
                let arrow = match entry.direction {
                    rivet_core::coverage::CoverageDirection::Forward => "→",
                    rivet_core::coverage::CoverageDirection::Backward => "←",
                };
                let targets = if entry.target_types.is_empty() {
                    "(any)".to_string()
                } else {
                    format!("[{}]", entry.target_types.join(", "))
                };
                println!(
                    "    {} needs: {} {} {}",
                    entry.rule_name, entry.link_type, arrow, targets
                );
            }
        }

        // #848: name the declared exemptions rather than leaving them implicit.
        // A goal that carries GSN's `undeveloped: true` is out of the
        // denominator above, and that has to be visible — otherwise the reader
        // sees 100% and cannot tell a complete argument from one with declared
        // gaps. Printed as a count per rule, not folded into the percentage.
        let exempt_lines: Vec<String> = report
            .entries
            .iter()
            .filter(|e| e.exempt > 0)
            .map(|e| {
                format!(
                    "  {:<30} {} declared exempt (not counted): {}",
                    e.rule_name,
                    e.exempt,
                    e.exempt_ids.join(", ")
                )
            })
            .collect();
        if !exempt_lines.is_empty() {
            println!();
            for line in &exempt_lines {
                println!("{line}");
            }
        }

        println!("  {}", "-".repeat(80));
        println!(
            "  {:<52} {}",
            "Overall (weighted)",
            fmt_pct(report.overall_coverage_opt())
        );

        // V-closure: for any source type governed by >1 rule, the share that
        // satisfies EVERY rule (e.g. requirements that are both satisfied AND
        // verified — both sides of the V closed). Strictly stronger than the
        // per-rule numbers above, so it gets its own line.
        let closure = report.v_closure();
        for c in &closure {
            let label = format!(
                "V-closure: {} (all {} rules)",
                c.source_type,
                c.rule_names.len()
            );
            println!(
                "  {:<52} {}  [{}/{}]",
                label,
                fmt_pct(c.percentage_opt()),
                c.closed,
                c.total
            );
        }

        // 3-state breakdown for the auditor — only printed when at least
        // one boundary exists, to keep the common case uncluttered.
        if any_boundary {
            let total: usize = report.entries.iter().map(|e| e.total).sum();
            let covered: usize = report.entries.iter().map(|e| e.covered).sum();
            let boundary: usize = report.entries.iter().map(|e| e.external_boundary).sum();
            let uncovered: usize = report.entries.iter().map(|e| e.uncovered_ids.len()).sum();
            println!(
                "  Breakdown: {} satisfied, {} external-boundary, {} uncovered (of {})",
                covered, boundary, uncovered, total
            );
        }

        // Show uncovered artifacts
        let has_uncovered = report.entries.iter().any(|e| !e.uncovered_ids.is_empty());
        if has_uncovered {
            println!("\nUncovered artifacts:");
            for entry in &report.entries {
                if !entry.uncovered_ids.is_empty() {
                    println!("  {} ({}):", entry.rule_name, entry.source_type);
                    for id in &entry.uncovered_ids {
                        println!("    {}", id);
                    }
                }
            }
        }

        // Show external-boundary artifacts (issue #253). Distinct list
        // because the auditor needs "delegated to supplier" to read
        // differently from "missing in our store."
        let has_boundary = report
            .entries
            .iter()
            .any(|e| !e.external_boundary_ids.is_empty());
        if has_boundary {
            println!("\nExternal-boundary artifacts (delegated to supplier):");
            for entry in &report.entries {
                if !entry.external_boundary_ids.is_empty() {
                    println!("  {} ({}):", entry.rule_name, entry.source_type);
                    for id in &entry.external_boundary_ids {
                        println!("    {}", id);
                    }
                }
            }
        }
    }

    // #788 / REQ-329: plain coverage counts graph-level `verifies` backlinks.
    // A marker-driven project has none, so this view reports 0% for the very
    // requirements `coverage --tests` reports at 100% — and `rivet verify`
    // accepts exactly those markers as sufficient evidence to advance a
    // requirement. Two views of one evidence set, up to 100 points apart, with
    // nothing telling a release gate it is reading the narrower one.
    //
    // Since REQ-389 A1 the rules credit full `verifies` markers, so what is
    // left for this note is `partially-verifies` markers: evidence `rivet
    // verify` accepts that the rules deliberately do not count as full
    // verification. It makes that remaining gap visible, as this tool does for
    // empty scopes (#808), unchecked cross-refs (#854) and unmodelled rules
    // (REQ-320).
    if format != "json" {
        // Only rules that want `verifies` evidence. A marker IS a `verifies`
        // claim and says nothing about, say, a `satisfies` backlink — scoping
        // this to every rule would announce marker evidence for rules a marker
        // can never satisfy, which is the wrong-cause failure this note exists
        // to prevent. Caught by a test, after a negative control failed to
        // redden: an unscoped filter reported 2 where the rule reported 1.
        let uncovered: std::collections::BTreeSet<&str> = report
            .entries
            .iter()
            .filter(|e| e.link_type == "verifies")
            .flat_map(|e| e.uncovered_ids.iter().map(String::as_str))
            .collect();
        if !uncovered.is_empty() {
            let paths = default_marker_scan_paths(&cli.project);
            let markers = rivet_core::test_scanner::scan_source_files_in_project(
                &cli.project,
                &paths,
                &rivet_core::test_scanner::default_patterns(),
            );
            let with_marker: std::collections::BTreeSet<&str> = markers
                .iter()
                .map(|m| m.target_id.as_str())
                .filter(|id| uncovered.contains(id))
                .collect();
            if !with_marker.is_empty() {
                println!();
                println!(
                    "  i  {} requirement(s) counted as uncovered here DO carry source-marker",
                    with_marker.len()
                );
                println!(
                    "     evidence, which these link rules cannot see. `rivet verify` accepts it."
                );
                println!("     Run `rivet coverage --tests` for the marker view.");
                let mut shown: Vec<&str> = with_marker.into_iter().collect();
                shown.sort_unstable();
                for id in shown.iter().take(5) {
                    println!("       {id}");
                }
                if shown.len() > 5 {
                    println!("       … and {} more", shown.len() - 5);
                }
            }
        }
    }

    // #808: `--strict-empty` fails the run when the project loaded
    // zero scoring artifacts — the state where the legacy overall_coverage
    // would report 100% and slip the gate. Runs BEFORE --fail-under so
    // the specific "no artifacts loaded" diagnostic isn't overridden by
    // the generic "coverage below threshold" one.
    if strict_empty && report.is_empty_scope() {
        eprintln!(
            "\nerror: coverage has no scoring artifacts — every rule scored n/a (0/0) (--strict-empty)"
        );
        return Ok(false);
    }

    // REQ-320: a declaration in `coverage.unmodelled-rules` that no longer
    // holds fails the run. Reported before --fail-under so the specific
    // diagnostic is not masked by a generic threshold message, and always —
    // not only under a flag — because a stale exemption silently shrinks the
    // denominator every later number is computed against.
    if !unmodelled_problems.is_empty() {
        eprintln!("\nerror: unmodelled-rule declaration(s) no longer hold:");
        for p in &unmodelled_problems {
            eprintln!("  {}: {}", p.rule, p.message);
        }
        return Ok(false);
    }

    if let Some(&threshold) = fail_under {
        // Empty scope trivially "passes" the threshold check with legacy
        // math (overall = 100.0) but the user set a threshold to gate on
        // real coverage — refuse to declare a passing gate when there
        // was nothing to score.
        if report.is_empty_scope() {
            eprintln!(
                "\nerror: coverage has no scoring artifacts — --fail-under {:.1}% cannot be evaluated against an empty load",
                threshold
            );
            return Ok(false);
        }
        let overall = report
            .overall_coverage_opt()
            .expect("the empty load returned above");
        if overall < threshold {
            eprintln!(
                "\nerror: overall coverage {:.1}% is below threshold {:.1}% (--fail-under)",
                overall, threshold
            );
            return Ok(false);
        } else if format != "json" {
            println!(
                "\n\u{2714} coverage {:.1}% meets threshold {:.1}%",
                overall, threshold
            );
        }
    }

    Ok(true)
}

/// Test-to-requirement coverage via source markers.
pub(crate) fn cmd_coverage_tests(cli: &Cli, format: &str, scan_paths: &[PathBuf]) -> Result<bool> {
    validate_format(format, &["text", "json"])?;
    use rivet_core::test_scanner;

    let ctx = ProjectContext::load(cli)?;
    let result_store = load_result_store(cli, &ctx.config)?;
    let (store, schema, graph) = (ctx.store, ctx.schema, ctx.graph);

    // Resolve scan paths: workspace-aware defaults shared with `rivet verify`
    // so the two agree on where markers live (#603).
    let paths: Vec<PathBuf> = if scan_paths.is_empty() {
        default_marker_scan_paths(&cli.project)
    } else {
        scan_paths
            .iter()
            .map(|p| {
                if p.is_absolute() {
                    p.clone()
                } else {
                    cli.project.join(p)
                }
            })
            .collect()
    };

    let patterns = test_scanner::default_patterns();
    let markers = test_scanner::scan_source_files_in_project(&cli.project, &paths, &patterns);
    let mut coverage = test_scanner::compute_test_coverage(&markers, &store, Some(&schema));
    // #1128: a passing recorded result (a HITL/silicon run, imported JUnit)
    // covers a requirement no source marker names.
    let rc = match result_store.as_ref() {
        Some(results) => test_scanner::result_coverage(&coverage, &graph, results),
        None => test_scanner::ResultCoverage {
            still_uncovered: coverage.uncovered.clone(),
            ..Default::default()
        },
    };
    coverage.uncovered = rc.still_uncovered.clone();

    // #1168: the clause discharge `rivet verify` recorded (#838), next to the
    // marker count, so `1 test marker` no longer reads as a full discharge.
    let discharge_of = |id: &str| {
        store
            .get(id)
            .and_then(rivet_core::discharge::discharge_state)
    };
    let discharge_cell =
        |id: &str| discharge_of(id).map_or_else(|| "\u{2014}".to_string(), |s| s.cell());

    if format == "json" {
        let mut json = serde_json::to_value(&coverage)
            .map_err(|e| anyhow::anyhow!("json serialization: {e}"))?;
        // Added only when non-empty, so a project that records no results
        // gets exactly the JSON it got before.
        if !rc.covered_by_results.is_empty() {
            json["covered_by_results"] = serde_json::to_value(&rc.covered_by_results)?;
        }
        if !rc.uncovered_evidence.is_empty() {
            json["uncovered_evidence"] = serde_json::to_value(&rc.uncovered_evidence)?;
        }
        // Keyed by artifact id, for every reported requirement whose
        // description states clauses or carries a discharge record; an id
        // missing here has no clause list. Added only when non-empty.
        let discharge: serde_json::Map<String, serde_json::Value> = coverage
            .covered
            .iter()
            .map(|(id, _)| id)
            .chain(rc.covered_by_results.iter().map(|(id, _)| id))
            .chain(coverage.uncovered.iter())
            .filter_map(|id| {
                let state = discharge_of(id)?;
                Some(serde_json::to_value(state).map(|v| (id.clone(), v)))
            })
            .collect::<Result<_, _>>()?;
        if !discharge.is_empty() {
            json["discharge"] = serde_json::Value::Object(discharge);
        }
        println!("{}", serde_json::to_string_pretty(&json)?);
        return Ok(true);
    }

    // Text output
    println!("Test traceability coverage");
    println!("==========================");
    println!();

    if !coverage.covered.is_empty() {
        println!("Covered ({}):", coverage.covered.len());
        for (id, markers) in &coverage.covered {
            let label = if markers.len() == 1 {
                "1 test marker".to_string()
            } else {
                format!("{} test markers", markers.len())
            };
            println!("  {id}  {label}  clauses {}", discharge_cell(id));
            for m in markers {
                println!(
                    "    {}:{}  {} ({})",
                    m.file.display(),
                    m.line,
                    m.test_name,
                    m.link_type,
                );
            }
        }
        println!();
    }

    if !rc.covered_by_results.is_empty() {
        println!(
            "Covered by recorded results ({}):",
            rc.covered_by_results.len()
        );
        for (id, hits) in &rc.covered_by_results {
            println!(
                "  {id}  no test marker; passing recorded result  clauses {}",
                discharge_cell(id)
            );
            for h in hits {
                let env = h
                    .environment
                    .as_deref()
                    .map(|e| format!(" @ {e}"))
                    .unwrap_or_default();
                let against = if &h.artifact_id == id {
                    "recorded against it".to_string()
                } else {
                    format!("via {}", h.artifact_id)
                };
                println!("    run {}{env}  {} ({against})", h.run_id, h.status);
            }
        }
        println!();
    }

    if !coverage.uncovered.is_empty() {
        println!("Uncovered ({}):", coverage.uncovered.len());
        for id in &coverage.uncovered {
            let why = match rc.uncovered_evidence.get(id) {
                Some(rivet_core::result_trace::EvidenceState::Failing) => {
                    "; latest recorded result FAILS"
                }
                Some(rivet_core::result_trace::EvidenceState::NotExercised) => {
                    "; recorded results are only skipped/blocked"
                }
                _ => "",
            };
            println!("  {id}  No test markers found{why}");
        }
        println!();
    }

    if !coverage.broken_refs.is_empty() {
        println!("Broken references ({}):", coverage.broken_refs.len());
        for m in &coverage.broken_refs {
            println!(
                "  {}:{}  {} -> {} (not found)",
                m.file.display(),
                m.line,
                m.test_name,
                m.target_id,
            );
        }
        println!();
    }

    let covered_count = coverage.covered.len() + rc.covered_by_results.len();
    let total_coverable = covered_count + coverage.uncovered.len();
    let pct = if total_coverable > 0 {
        (covered_count as f64 / total_coverable as f64) * 100.0
    } else {
        100.0
    };
    println!(
        "Summary: {}/{} requirements have test coverage ({:.1}%)",
        covered_count, total_coverable, pct,
    );

    Ok(true)
}

// ── V&V coverage matrix (rivet#188 sub-issue 2) ────────────────────────
//
// Reads `repo-status` artifacts (schema `vv-coverage`, sub-issue 1, PR #232)
// from the local project and renders a per-repo × per-technique matrix in
// text, json, markdown, or html. Cell values:
//
//   - "absent"  — technique not in `techniques-applied`
//   - "applied" — in `techniques-applied`, not in `techniques-gated-in-ci`
//   - "gated"   — in `techniques-gated-in-ci` (implies applied)
//
// JSON uses those exact strings; the human-readable formats use a small
// glyph legend documented in the rendered output.

#[derive(Debug)]
struct RepoStatusRow {
    id: String,
    repo: String,
    applied: Vec<String>,
    gated: Vec<String>,
    notes: Option<String>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
enum MatrixCell {
    Absent,
    Applied,
    Gated,
}

impl MatrixCell {
    fn for_row(row: &RepoStatusRow, technique: &str) -> Self {
        if row.gated.iter().any(|t| t == technique) {
            Self::Gated
        } else if row.applied.iter().any(|t| t == technique) {
            Self::Applied
        } else {
            Self::Absent
        }
    }

    fn json_str(self) -> &'static str {
        match self {
            Self::Absent => "absent",
            Self::Applied => "applied",
            Self::Gated => "gated",
        }
    }

    fn glyph(self) -> &'static str {
        match self {
            Self::Absent => "·",
            Self::Applied => "○",
            Self::Gated => "●",
        }
    }
}

const MATRIX_LEGEND: &str = "legend: · absent  ○ applied (not CI-gated)  ● applied + CI-gated";

fn read_string_list(
    fields: &std::collections::BTreeMap<String, rivet_yaml::Value>,
    key: &str,
) -> Vec<String> {
    fields
        .get(key)
        .and_then(|v| v.as_sequence())
        .map(|seq| {
            seq.iter()
                .filter_map(|v| v.as_str())
                .map(str::to_owned)
                .collect()
        })
        .unwrap_or_default()
}

fn collect_repo_status_rows(store: &Store) -> Vec<RepoStatusRow> {
    let mut rows: Vec<RepoStatusRow> = store
        .iter()
        .filter(|a| a.artifact_type == "repo-status")
        .map(|a| {
            let repo = a
                .fields
                .get("repo")
                .and_then(|v| v.as_str())
                .map(str::to_owned)
                .unwrap_or_else(|| a.id.to_string());
            let applied = read_string_list(&a.fields, "techniques-applied");
            let gated = read_string_list(&a.fields, "techniques-gated-in-ci");
            let notes = a
                .fields
                .get("notes")
                .and_then(|v| v.as_str())
                .map(str::trim)
                .filter(|s| !s.is_empty())
                .map(str::to_owned);
            RepoStatusRow {
                id: a.id.to_string(),
                repo,
                applied,
                gated,
                notes,
            }
        })
        .collect();
    rows.sort_by(|a, b| a.repo.cmp(&b.repo).then_with(|| a.id.cmp(&b.id)));
    rows
}

fn matrix_columns(rows: &[RepoStatusRow]) -> Vec<String> {
    let mut cols: Vec<String> = rows
        .iter()
        .flat_map(|r| r.applied.iter().chain(r.gated.iter()).cloned())
        .collect();
    cols.sort();
    cols.dedup();
    cols
}

fn render_matrix_text(rows: &[RepoStatusRow], cols: &[String]) {
    println!("V&V coverage matrix");
    println!("{}", MATRIX_LEGEND);
    println!();

    if rows.is_empty() {
        println!("(no `repo-status` artifacts found)");
        return;
    }

    let repo_w = rows
        .iter()
        .map(|r| r.repo.chars().count())
        .max()
        .unwrap_or(4)
        .max(4);
    let col_w = cols
        .iter()
        .map(|c| c.chars().count())
        .max()
        .unwrap_or(0)
        .max(1);

    // Header.
    print!("  {:<width$}", "repo", width = repo_w);
    for c in cols {
        print!("  {:<width$}", c, width = col_w);
    }
    println!();
    print!("  {}", "-".repeat(repo_w));
    for _ in cols {
        print!("  {}", "-".repeat(col_w));
    }
    println!();

    // Rows.
    for row in rows {
        print!("  {:<width$}", row.repo, width = repo_w);
        for c in cols {
            let cell = MatrixCell::for_row(row, c);
            print!("  {:<width$}", cell.glyph(), width = col_w);
        }
        println!();
    }
}

fn render_matrix_markdown(rows: &[RepoStatusRow], cols: &[String]) {
    println!("# V&V coverage matrix\n");
    println!("_{}_\n", MATRIX_LEGEND);

    if rows.is_empty() {
        println!("_No `repo-status` artifacts found in the local project._");
        return;
    }

    // Header row.
    print!("| repo |");
    for c in cols {
        print!(" {} |", c);
    }
    println!();
    // Separator.
    print!("|---|");
    for _ in cols {
        print!("---|");
    }
    println!();
    // Body.
    for row in rows {
        print!("| {} |", row.repo);
        for c in cols {
            let cell = MatrixCell::for_row(row, c);
            print!(" {} |", cell.glyph());
        }
        println!();
    }
}

fn html_escape(input: &str) -> String {
    input
        .replace('&', "&amp;")
        .replace('<', "&lt;")
        .replace('>', "&gt;")
        .replace('"', "&quot;")
        .replace('\'', "&#39;")
}

fn render_matrix_html(rows: &[RepoStatusRow], cols: &[String]) {
    println!("<section class=\"vv-coverage-matrix\">");
    println!("  <h1>V&amp;V coverage matrix</h1>");
    println!("  <p class=\"legend\">{}</p>", html_escape(MATRIX_LEGEND));

    if rows.is_empty() {
        println!("  <p><em>No <code>repo-status</code> artifacts found.</em></p>");
        println!("</section>");
        return;
    }

    println!("  <table>");
    print!("    <thead><tr><th>repo</th>");
    for c in cols {
        print!("<th>{}</th>", html_escape(c));
    }
    println!("</tr></thead>");
    println!("    <tbody>");
    for row in rows {
        print!(
            "      <tr><th scope=\"row\">{}</th>",
            html_escape(&row.repo)
        );
        for c in cols {
            let cell = MatrixCell::for_row(row, c);
            print!(
                "<td class=\"cell-{}\">{}</td>",
                cell.json_str(),
                cell.glyph()
            );
        }
        println!("</tr>");
    }
    println!("    </tbody>");
    println!("  </table>");
    println!("</section>");
}

fn render_matrix_json(rows: &[RepoStatusRow], cols: &[String]) {
    let repos_json: Vec<serde_json::Value> = rows
        .iter()
        .map(|r| {
            let cells: Vec<serde_json::Value> = cols
                .iter()
                .map(|c| {
                    let cell = MatrixCell::for_row(r, c);
                    serde_json::json!({
                        "technique": c,
                        "status": cell.json_str(),
                    })
                })
                .collect();
            serde_json::json!({
                "id": r.id,
                "repo": r.repo,
                "techniques_applied": r.applied,
                "techniques_gated_in_ci": r.gated,
                "notes": r.notes,
                "cells": cells,
            })
        })
        .collect();

    let output = serde_json::json!({
        "command": "coverage-matrix",
        "columns": cols,
        "repos": repos_json,
    });
    println!("{}", serde_json::to_string_pretty(&output).unwrap());
}

/// Render the V&V coverage matrix from `repo-status` artifacts.
pub(crate) fn cmd_coverage_matrix(
    cli: &Cli,
    format: &str,
    baseline_name: Option<&str>,
) -> Result<bool> {
    validate_format(format, &["text", "json", "markdown", "html"])?;
    let ctx = ProjectContext::load(cli)?;
    let store = apply_baseline_scope(ctx.store, baseline_name, &ctx.config);

    let rows = collect_repo_status_rows(&store);
    let cols = matrix_columns(&rows);

    match format {
        "json" => render_matrix_json(&rows, &cols),
        "markdown" => render_matrix_markdown(&rows, &cols),
        "html" => render_matrix_html(&rows, &cols),
        _ => render_matrix_text(&rows, &cols),
    }

    Ok(true)
}

// ── V&V coverage matrix — cross-repo aggregator (rivet#188 sub-issue 3) ─
//
// The file-based aggregator: each repo's CI runs
// `rivet coverage --matrix --format json` and uploads the result; a
// top-level job collects those JSON files and merges them with
// `rivet coverage --aggregate a.json b.json ... --format {text,markdown,html,json}`.
// No GitHub API access is needed — the inputs are plain files.

fn json_string_list(value: Option<&serde_json::Value>) -> Vec<String> {
    value
        .and_then(serde_json::Value::as_array)
        .map(|seq| {
            seq.iter()
                .filter_map(|v| v.as_str())
                .map(str::to_owned)
                .collect()
        })
        .unwrap_or_default()
}

/// Parse one JSON matrix file (the envelope emitted by `render_matrix_json`)
/// into `RepoStatusRow`s.
fn parse_matrix_json_file(path: &std::path::Path) -> Result<Vec<RepoStatusRow>> {
    let text = std::fs::read_to_string(path)
        .with_context(|| format!("reading matrix JSON {}", path.display()))?;
    let value: serde_json::Value = serde_json::from_str(&text)
        .with_context(|| format!("parsing matrix JSON {}", path.display()))?;
    let repos = value
        .get("repos")
        .and_then(serde_json::Value::as_array)
        .ok_or_else(|| {
            anyhow::anyhow!(
                "{}: not a `rivet coverage --matrix --format json` document \
                 (missing `repos` array)",
                path.display()
            )
        })?;
    let mut rows = Vec::with_capacity(repos.len());
    for repo in repos {
        let repo_name = repo.get("repo").and_then(serde_json::Value::as_str);
        let id = repo.get("id").and_then(serde_json::Value::as_str);
        let (id, repo_name) = match (id, repo_name) {
            (Some(i), Some(r)) => (i.to_owned(), r.to_owned()),
            (Some(i), None) => (i.to_owned(), i.to_owned()),
            (None, Some(r)) => (r.to_owned(), r.to_owned()),
            (None, None) => {
                anyhow::bail!(
                    "{}: a `repos` entry has neither `id` nor `repo`",
                    path.display()
                )
            }
        };
        let notes = repo
            .get("notes")
            .and_then(serde_json::Value::as_str)
            .map(str::trim)
            .filter(|s| !s.is_empty())
            .map(str::to_owned);
        rows.push(RepoStatusRow {
            id,
            repo: repo_name,
            applied: json_string_list(repo.get("techniques_applied")),
            gated: json_string_list(repo.get("techniques_gated_in_ci")),
            notes,
        });
    }
    Ok(rows)
}

/// Merge several JSON matrices into one and render it.
pub(crate) fn cmd_coverage_matrix_aggregate(format: &str, paths: &[PathBuf]) -> Result<bool> {
    validate_format(format, &["text", "json", "markdown", "html"])?;

    let mut rows: Vec<RepoStatusRow> = Vec::new();
    let mut seen: std::collections::HashSet<(String, String)> = std::collections::HashSet::new();
    for path in paths {
        for row in parse_matrix_json_file(path)? {
            // First occurrence of a (repo, id) pair wins; later files that
            // re-state the same row are ignored so re-running the aggregator
            // over overlapping inputs is idempotent.
            if seen.insert((row.repo.clone(), row.id.clone())) {
                rows.push(row);
            }
        }
    }
    rows.sort_by(|a, b| a.repo.cmp(&b.repo).then_with(|| a.id.cmp(&b.id)));
    let cols = matrix_columns(&rows);

    match format {
        "json" => render_matrix_json(&rows, &cols),
        "markdown" => render_matrix_markdown(&rows, &cols),
        "html" => render_matrix_html(&rows, &cols),
        _ => render_matrix_text(&rows, &cols),
    }

    Ok(true)
}
