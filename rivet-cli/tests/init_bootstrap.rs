// SAFETY-REVIEW (SCRC Phase 1, DD-058): Integration test code — blanket
// allow of the restriction family.
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

//! End-to-end tests for `rivet init --agents --bootstrap`.
//!
//! The scaffolder is load-bearing: it's the single entry point that sets
//! up the project-owned `.rivet/` tree. Every file it writes MUST be
//! idempotent on re-run (owned files kept; pin-file re-written as an
//! append record of the scaffold event) and the resulting tree MUST make
//! `rivet pipelines validate` fire correctly on the placeholder markers.

use std::fs;
use std::process::Command;

fn rivet_bin() -> std::path::PathBuf {
    if let Ok(bin) = std::env::var("CARGO_BIN_EXE_rivet") {
        return std::path::PathBuf::from(bin);
    }
    let manifest = std::path::PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    let workspace_root = manifest.parent().expect("workspace root");
    workspace_root.join("target").join("debug").join("rivet")
}

fn workspace_schemas_dir() -> std::path::PathBuf {
    let manifest = std::path::PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    manifest
        .parent()
        .expect("workspace root")
        .join("schemas")
}

fn setup_project(dir: &std::path::Path) {
    let yaml = r#"project:
  name: smoke
  schemas: [dev]
sources:
  - format: generic-yaml
    path: artifacts
"#;
    fs::write(dir.join("rivet.yaml"), yaml).unwrap();
    fs::create_dir_all(dir.join("artifacts")).unwrap();
    fs::create_dir_all(dir.join("schemas")).unwrap();
    fs::copy(
        workspace_schemas_dir().join("dev.yaml"),
        dir.join("schemas/dev.yaml"),
    )
    .unwrap();
}

fn run_bootstrap(dir: &std::path::Path) -> std::process::Output {
    Command::new(rivet_bin())
        .args([
            "-p",
            dir.to_str().unwrap(),
            "--schemas",
            dir.join("schemas").to_str().unwrap(),
            "init",
            "--agents",
            "--bootstrap",
        ])
        .output()
        .expect("rivet init --agents --bootstrap")
}

#[test]
fn bootstrap_creates_rivet_tree_with_placeholders() {
    let tmp = tempfile::tempdir().unwrap();
    setup_project(tmp.path());

    let out = run_bootstrap(tmp.path());
    assert!(
        out.status.success(),
        "bootstrap failed: stderr={}",
        String::from_utf8_lossy(&out.stderr)
    );

    // Directory tree
    for p in &[
        ".rivet",
        ".rivet/pipelines",
        ".rivet/context",
        ".rivet/agents",
        ".rivet/runs",
    ] {
        assert!(tmp.path().join(p).is_dir(), "{p} should be a dir");
    }

    // Pin file
    let pin = tmp.path().join(".rivet/.rivet-version");
    assert!(pin.is_file(), ".rivet-version should exist");
    let pin_content = fs::read_to_string(&pin).unwrap();
    assert!(pin_content.contains("rivet-cli:"));
    assert!(pin_content.contains("template-version: 1"));

    // Project-owned placeholder files
    for p in &[
        ".rivet/context/review-roles.yaml",
        ".rivet/context/risk-tolerance.yaml",
        ".rivet/context/domain-glossary.md",
        ".rivet/agents/rivet-rule.md",
    ] {
        assert!(tmp.path().join(p).is_file(), "{p} should exist");
    }

    // Content sanity
    let review_roles = fs::read_to_string(tmp.path().join(".rivet/context/review-roles.yaml"))
        .unwrap();
    assert!(review_roles.contains("{{PLACEHOLDER"));
    assert!(review_roles.contains("dev-team"));
}

#[test]
fn bootstrap_rerun_keeps_project_owned_files() {
    let tmp = tempfile::tempdir().unwrap();
    setup_project(tmp.path());
    run_bootstrap(tmp.path());

    // User edits a project-owned file to record their intent
    let rule_path = tmp.path().join(".rivet/agents/rivet-rule.md");
    let edited = "# Custom project rule\n\nMy team has specific conventions.\n";
    fs::write(&rule_path, edited).unwrap();

    // Re-run bootstrap; the file must survive verbatim
    let out = run_bootstrap(tmp.path());
    assert!(out.status.success());
    let after = fs::read_to_string(&rule_path).unwrap();
    assert_eq!(
        after, edited,
        "bootstrap overwrote a project-owned file on re-run"
    );
    let stderr = String::from_utf8_lossy(&out.stderr);
    assert!(
        stderr.contains("kept .rivet/agents/rivet-rule.md"),
        "stderr should announce the file was kept: {stderr}"
    );
}

#[test]
fn pipelines_validate_default_is_advisory() {
    // Default mode (no --strict): exit 0 even when placeholders are
    // unresolved. The report is informational; rivet does not refuse
    // its own subcommand on project-config issues. Issues are still
    // listed in stdout so the operator / CI can log them.
    let tmp = tempfile::tempdir().unwrap();
    setup_project(tmp.path());
    run_bootstrap(tmp.path());

    let out = Command::new(rivet_bin())
        .args([
            "-p",
            tmp.path().to_str().unwrap(),
            "--schemas",
            tmp.path().join("schemas").to_str().unwrap(),
            "pipelines",
            "validate",
        ])
        .output()
        .expect("rivet pipelines validate");

    assert!(
        out.status.success(),
        "default mode must exit 0 (advisory); stderr={}",
        String::from_utf8_lossy(&out.stderr)
    );
    let stdout = String::from_utf8_lossy(&out.stdout);
    assert!(
        stdout.contains("unresolved placeholder"),
        "advisory output should still mention unresolved placeholders: {stdout}"
    );
}

#[test]
fn pipelines_validate_strict_gates_on_errors() {
    // --strict: exit 1 on any error, for CI / pre-commit gating.
    let tmp = tempfile::tempdir().unwrap();
    setup_project(tmp.path());
    run_bootstrap(tmp.path());

    let out = Command::new(rivet_bin())
        .args([
            "-p",
            tmp.path().to_str().unwrap(),
            "--schemas",
            tmp.path().join("schemas").to_str().unwrap(),
            "pipelines",
            "validate",
            "--strict",
        ])
        .output()
        .expect("rivet pipelines validate --strict");

    assert!(
        !out.status.success(),
        "--strict must exit 1 when unresolved placeholders remain"
    );
}

#[test]
fn bootstrap_requires_agents_flag() {
    // --bootstrap without --agents should be rejected by clap
    let tmp = tempfile::tempdir().unwrap();
    setup_project(tmp.path());

    let out = Command::new(rivet_bin())
        .args([
            "-p",
            tmp.path().to_str().unwrap(),
            "init",
            "--bootstrap",
        ])
        .output()
        .expect("rivet init --bootstrap");

    assert!(
        !out.status.success(),
        "--bootstrap alone should fail — needs --agents"
    );
}
