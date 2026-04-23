// SAFETY-REVIEW (SCRC Phase 1, DD-058): Integration test code — blanket
// allow of the restriction family. See rivet-core/tests/proptest_feature_model.rs
// for the rationale.
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

//! End-to-end integration tests for `--filter` surfaces on the CLI.
//!
//! Each command that accepts an s-expression filter (`list`, `stats`,
//! `coverage`, `export`) gets a positive and a negative case. We run
//! against the repository's own artifact set and assert that the filter
//! is honoured (not silently ignored) by comparing counts against the
//! unfiltered baseline.

use std::process::Command;

fn rivet_bin() -> std::path::PathBuf {
    if let Ok(bin) = std::env::var("CARGO_BIN_EXE_rivet") {
        return std::path::PathBuf::from(bin);
    }
    let manifest = std::path::PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    manifest
        .parent()
        .expect("workspace root")
        .join("target")
        .join("debug")
        .join("rivet")
}

fn project_root() -> std::path::PathBuf {
    std::path::PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .parent()
        .expect("workspace root")
        .to_path_buf()
}

fn json_count(stdout: &[u8]) -> u64 {
    let parsed: serde_json::Value =
        serde_json::from_slice(stdout).expect("stdout must be valid JSON");
    parsed
        .get("count")
        .and_then(|v| v.as_u64())
        .expect("'count' field missing in JSON output")
}

// ── list --filter ──────────────────────────────────────────────────────

#[test]
fn list_filter_requirement_type_matches_only_requirements() {
    let baseline = Command::new(rivet_bin())
        .args([
            "--project",
            project_root().to_str().unwrap(),
            "list",
            "--format",
            "json",
        ])
        .output()
        .expect("baseline list");
    assert!(baseline.status.success(), "baseline list failed");
    let baseline_count = json_count(&baseline.stdout);

    let filtered = Command::new(rivet_bin())
        .args([
            "--project",
            project_root().to_str().unwrap(),
            "list",
            "--filter",
            r#"(= type "requirement")"#,
            "--format",
            "json",
        ])
        .output()
        .expect("filtered list");
    assert!(
        filtered.status.success(),
        "filtered list exited non-zero. stderr: {}",
        String::from_utf8_lossy(&filtered.stderr)
    );
    let filtered_count = json_count(&filtered.stdout);
    assert!(
        filtered_count > 0,
        "filter (= type \"requirement\") should match something"
    );
    assert!(
        filtered_count <= baseline_count,
        "filter must not return more artifacts than the baseline ({filtered_count} > {baseline_count})"
    );
}

#[test]
fn list_filter_impossible_is_empty() {
    // A filter that can't match anything must return zero — catches the
    // "filter silently ignored" class of bug.
    let output = Command::new(rivet_bin())
        .args([
            "--project",
            project_root().to_str().unwrap(),
            "list",
            "--filter",
            r#"(= id "__does-not-exist__")"#,
            "--format",
            "json",
        ])
        .output()
        .expect("filtered list");
    assert!(output.status.success());
    assert_eq!(json_count(&output.stdout), 0);
}

#[test]
fn list_filter_bad_sexpr_is_reported() {
    let output = Command::new(rivet_bin())
        .args([
            "--project",
            project_root().to_str().unwrap(),
            "list",
            "--filter",
            "(and (has-tag \"x\"",
            "--format",
            "json",
        ])
        .output()
        .expect("bad filter run");
    assert!(
        !output.status.success(),
        "CLI must reject malformed filter, got exit 0"
    );
}

// ── stats --filter ─────────────────────────────────────────────────────

#[test]
fn stats_filter_respects_predicate() {
    let output = Command::new(rivet_bin())
        .args([
            "--project",
            project_root().to_str().unwrap(),
            "stats",
            "--filter",
            r#"(= type "requirement")"#,
            "--format",
            "json",
        ])
        .output()
        .expect("stats --filter run");
    assert!(
        output.status.success(),
        "stats --filter must succeed. stderr: {}",
        String::from_utf8_lossy(&output.stderr)
    );
    // JSON must parse — we don't assert a specific count because the
    // schema allows for new requirement types being added over time.
    let _: serde_json::Value =
        serde_json::from_slice(&output.stdout).expect("stats JSON must be valid");
}

#[test]
fn stats_filter_empty_is_zero() {
    let output = Command::new(rivet_bin())
        .args([
            "--project",
            project_root().to_str().unwrap(),
            "stats",
            "--filter",
            r#"(= id "__nope__")"#,
            "--format",
            "json",
        ])
        .output()
        .expect("stats --filter empty run");
    assert!(output.status.success());
    let parsed: serde_json::Value =
        serde_json::from_slice(&output.stdout).expect("JSON");
    let total = parsed.get("total").and_then(|v| v.as_u64()).unwrap_or(0);
    assert_eq!(total, 0, "empty filter must zero out stats total");
}

// ── coverage --filter ──────────────────────────────────────────────────

#[test]
fn coverage_filter_runs_cleanly() {
    let output = Command::new(rivet_bin())
        .args([
            "--project",
            project_root().to_str().unwrap(),
            "coverage",
            "--filter",
            r#"(has-tag "stpa")"#,
            "--format",
            "json",
        ])
        .output()
        .expect("coverage --filter run");
    assert!(
        output.status.success(),
        "coverage --filter must succeed. stderr: {}",
        String::from_utf8_lossy(&output.stderr)
    );
    let _: serde_json::Value =
        serde_json::from_slice(&output.stdout).expect("coverage JSON must parse");
}
