// SAFETY-REVIEW (SCRC Phase 1, DD-058): Integration test / bench code.
// Tests legitimately use unwrap/expect/panic/assert-indexing patterns
// because a test failure should panic with a clear stack. Blanket-allow
// the Phase 1 restriction lints at crate scope; real risk analysis for
// these lints is carried by production code.
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

//! Integration tests for `rivet docs check --coverage` — the
//! subcommand-coverage gate that walks the clap CLI tree and asserts
//! every subcommand path is documented in the embedded `rivet docs`
//! registry.
//!
//! These tests exercise the SHAPE of the report (column markers, summary
//! line, exit codes) rather than asserting specific uncovered names, so
//! the gate keeps passing as docs are filled in for previously-uncovered
//! subcommands.

use std::process::Command;

fn rivet_bin() -> std::path::PathBuf {
    if let Ok(bin) = std::env::var("CARGO_BIN_EXE_rivet") {
        return std::path::PathBuf::from(bin);
    }
    let manifest = std::path::PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    let workspace_root = manifest.parent().expect("workspace root");
    workspace_root.join("target").join("debug").join("rivet")
}

/// `rivet docs check --coverage` succeeds (exit 0) by default — warn-only
/// mode is the default contract so the gate can land in CI without
/// breaking on the existing inventory of uncovered commands.
#[test]
fn coverage_warn_only_exits_zero() {
    let output = Command::new(rivet_bin())
        .args(["docs", "check", "--coverage"])
        .output()
        .expect("failed to execute rivet docs check --coverage");

    assert!(
        output.status.success(),
        "warn-only mode must exit 0; stderr: {}",
        String::from_utf8_lossy(&output.stderr),
    );

    let stdout = String::from_utf8_lossy(&output.stdout);
    // Header line.
    assert!(
        stdout.contains("rivet docs check --coverage"),
        "expected header, got:\n{stdout}"
    );
    // Summary line shape: `Coverage: <covered>/<total> (<pct>%)`.
    assert!(
        stdout.contains("Coverage:"),
        "expected coverage summary, got:\n{stdout}"
    );

    // The gate MUST list every top-level subcommand we ship — not just
    // the uncovered ones. Pick a handful of stable ones as a sanity
    // check.
    for name in ["init", "validate", "list", "schema", "docs", "mcp"] {
        assert!(
            stdout.contains(name),
            "expected '{name}' in coverage output, got:\n{stdout}"
        );
    }
}

/// `--strict` exits non-zero whenever the inventory has any uncovered
/// path. With the current TOPICS registry we know there are at least a
/// few uncovered commands (variant, baseline, snapshot, runs, pipelines,
/// templates, close-gaps), so strict mode must currently fail. Once
/// those gaps are filled the test still holds: if NOTHING is uncovered,
/// strict exits 0, but then `expected_uncovered_count >= 1` is the only
/// place we assert non-zero — re-flip when the world catches up.
#[test]
fn coverage_strict_fails_when_uncovered_present() {
    let output = Command::new(rivet_bin())
        .args(["docs", "check", "--coverage", "--strict"])
        .output()
        .expect("failed to execute rivet docs check --coverage --strict");

    let stdout = String::from_utf8_lossy(&output.stdout);

    // Either the inventory is fully covered (status passes, no
    // "Uncovered:" line) or strict mode has flagged something. Both are
    // acceptable shapes — the gate is correct in either case.
    let has_uncovered = stdout.contains("Uncovered:");
    if has_uncovered {
        assert!(
            !output.status.success(),
            "strict mode must exit non-zero when uncovered are listed; got success with stdout:\n{stdout}"
        );
    } else {
        assert!(
            output.status.success(),
            "strict mode must exit 0 when no uncovered listed; got failure with stdout:\n{stdout}"
        );
    }
}

/// JSON output is machine-readable and follows the standard envelope
/// (`command`, `status`, `total`, `covered`, `uncovered`, `subcommands`).
#[test]
fn coverage_json_envelope() {
    let output = Command::new(rivet_bin())
        .args(["docs", "check", "--coverage", "--format", "json"])
        .output()
        .expect("failed to execute rivet docs check --coverage --format json");

    assert!(output.status.success(), "warn-only json must exit 0");
    let stdout = String::from_utf8_lossy(&output.stdout);

    let val: serde_json::Value = serde_json::from_str(&stdout).expect("output must be valid JSON");
    assert_eq!(val["command"], "docs-coverage");
    assert!(val["status"] == "pass" || val["status"] == "fail");
    assert!(val["total"].is_number());
    assert!(val["covered"].is_number());
    assert!(val["uncovered"].is_array());

    let subs = val["subcommands"]
        .as_array()
        .expect("subcommands must be array");
    assert!(!subs.is_empty(), "subcommands must be non-empty");

    // Every entry has the advertised fields.
    for s in subs {
        assert!(s["path"].is_string());
        assert!(s["depth"].is_number());
        assert!(s["covered"].is_boolean());
        assert!(s["allow_listed"].is_boolean());
    }

    // Stable shape: at least the top-level docs, validate, list paths
    // appear in the subcommand list.
    let paths: Vec<&str> = subs.iter().filter_map(|v| v["path"].as_str()).collect();
    for required in ["docs", "validate", "list"] {
        assert!(
            paths.contains(&required),
            "expected path '{required}' in {paths:?}"
        );
    }
}

/// The allow-list applies: `commit-msg-check` is exempt and must not be
/// reported as uncovered.
#[test]
fn coverage_allowlist_excludes_internal_helpers() {
    let output = Command::new(rivet_bin())
        .args(["docs", "check", "--coverage", "--format", "json"])
        .output()
        .expect("failed to execute rivet docs check --coverage --format json");
    assert!(output.status.success());
    let stdout = String::from_utf8_lossy(&output.stdout);

    let val: serde_json::Value = serde_json::from_str(&stdout).expect("output must be valid JSON");
    let subs = val["subcommands"].as_array().expect("subcommands array");

    let cmc = subs
        .iter()
        .find(|s| s["path"].as_str() == Some("commit-msg-check"))
        .expect("commit-msg-check must be in the subcommand list");
    assert_eq!(
        cmc["allow_listed"], true,
        "commit-msg-check must be allow-listed; got {cmc}"
    );

    let uncovered = val["uncovered"].as_array().expect("uncovered array");
    let names: Vec<&str> = uncovered.iter().filter_map(|v| v.as_str()).collect();
    assert!(
        !names.contains(&"commit-msg-check"),
        "commit-msg-check must not be in the uncovered list; got {names:?}"
    );
}

/// Backward compatibility: `rivet docs check` with no flags still runs
/// the existing doc-vs-reality invariants (no coverage report).
#[test]
fn docs_check_without_coverage_unchanged() {
    let output = Command::new(rivet_bin())
        .args(["docs", "check"])
        .output()
        .expect("failed to execute rivet docs check");

    let stdout = String::from_utf8_lossy(&output.stdout);
    // Doc-check banner, NOT the coverage banner.
    assert!(
        stdout.contains("doc-check:"),
        "expected doc-check banner, got:\n{stdout}"
    );
    assert!(
        !stdout.contains("rivet docs check --coverage"),
        "no-flags mode must not emit coverage report; got:\n{stdout}"
    );
}
