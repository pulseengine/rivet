// SAFETY-REVIEW (SCRC Phase 1, DD-058): Integration test crate; tests
// legitimately use unwrap/panic/indexing — failures should panic loudly.
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

//! Integration tests for `rivet templates …`.

use std::path::{Path, PathBuf};
use std::process::Command;

fn rivet_bin() -> PathBuf {
    if let Ok(bin) = std::env::var("CARGO_BIN_EXE_rivet") {
        return PathBuf::from(bin);
    }
    let manifest = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    let workspace_root = manifest.parent().expect("workspace root");
    workspace_root.join("target").join("debug").join("rivet")
}

const MINIMAL_RIVET_YAML: &str = r#"project:
  name: tmpl-test
  version: "0.1.0"
  schemas: []
sources: []
"#;

fn seed_project(dir: &Path) {
    std::fs::write(dir.join("rivet.yaml"), MINIMAL_RIVET_YAML).unwrap();
}

fn run_rivet(dir: &Path, args: &[&str]) -> std::process::Output {
    let mut cmd = Command::new(rivet_bin());
    cmd.arg("--project").arg(dir);
    for a in args {
        cmd.arg(a);
    }
    cmd.output().expect("spawn rivet")
}

// ── list ───────────────────────────────────────────────────────────────

#[test]
fn templates_list_text_includes_both_builtin_kinds() {
    let tmp = tempfile::tempdir().unwrap();
    seed_project(tmp.path());

    let out = run_rivet(tmp.path(), &["templates", "list"]);
    let stdout = String::from_utf8_lossy(&out.stdout);
    let stderr = String::from_utf8_lossy(&out.stderr);
    assert!(
        out.status.success(),
        "expected success; stderr={stderr}; stdout={stdout}"
    );
    assert!(stdout.contains("structural"), "stdout: {stdout}");
    assert!(stdout.contains("discovery"), "stdout: {stdout}");
    assert!(stdout.contains("discover.md"), "stdout: {stdout}");
}

#[test]
fn templates_list_json_emits_array() {
    let tmp = tempfile::tempdir().unwrap();
    seed_project(tmp.path());

    let out = run_rivet(tmp.path(), &["templates", "list", "--format", "json"]);
    let stdout = String::from_utf8_lossy(&out.stdout);
    assert!(
        out.status.success(),
        "stderr: {}",
        String::from_utf8_lossy(&out.stderr)
    );

    let v: serde_json::Value = serde_json::from_str(&stdout).expect("stdout must be valid JSON");
    let arr = v.as_array().expect("top-level is an array");
    let kinds: Vec<&str> = arr.iter().map(|k| k["kind"].as_str().unwrap()).collect();
    assert!(kinds.contains(&"structural"), "kinds: {kinds:?}");
    assert!(kinds.contains(&"discovery"), "kinds: {kinds:?}");

    // Each entry has builtin + files[]
    for entry in arr {
        assert!(entry["builtin"].is_boolean());
        assert!(entry["files"].is_array());
    }
}

// ── show ───────────────────────────────────────────────────────────────

#[test]
fn templates_show_structural_validate_succeeds_raw() {
    let tmp = tempfile::tempdir().unwrap();
    seed_project(tmp.path());

    let out = run_rivet(tmp.path(), &["templates", "show", "structural/validate.md"]);
    let stdout = String::from_utf8_lossy(&out.stdout);
    let stderr = String::from_utf8_lossy(&out.stderr);
    assert!(
        out.status.success(),
        "expected success; stderr={stderr}; stdout={stdout}"
    );
    assert!(stdout.contains("fresh validator"), "stdout: {stdout}");
    // raw mode keeps placeholders verbatim
    assert!(stdout.contains("{{run_id}}"), "stdout: {stdout}");
}

#[test]
fn templates_show_rendered_substitutes_vars() {
    let tmp = tempfile::tempdir().unwrap();
    seed_project(tmp.path());

    let out = run_rivet(
        tmp.path(),
        &[
            "templates",
            "show",
            "structural/validate.md",
            "--format",
            "rendered",
            "--var",
            "run_id=R-1",
            "--var",
            "gap_id=gap-3",
            "--var",
            "proposal_json={\"x\":1}",
            "--var",
            "diagnostic=missing link",
        ],
    );
    let stdout = String::from_utf8_lossy(&out.stdout);
    assert!(
        out.status.success(),
        "stderr: {}",
        String::from_utf8_lossy(&out.stderr)
    );
    assert!(stdout.contains("Run id: R-1"), "stdout: {stdout}");
    assert!(stdout.contains("gap-3"), "stdout: {stdout}");
    assert!(
        !stdout.contains("{{run_id}}"),
        "rendered should consume placeholder; stdout: {stdout}"
    );
}

#[test]
fn templates_show_unknown_target_fails() {
    let tmp = tempfile::tempdir().unwrap();
    seed_project(tmp.path());

    let out = run_rivet(tmp.path(), &["templates", "show", "no-such/discover.md"]);
    let stderr = String::from_utf8_lossy(&out.stderr);
    assert!(
        !out.status.success(),
        "expected failure for unknown kind; stderr: {stderr}"
    );
}

// ── copy-to-project ────────────────────────────────────────────────────

#[test]
fn templates_copy_to_project_creates_files_and_records_provenance() {
    let tmp = tempfile::tempdir().unwrap();
    seed_project(tmp.path());

    let out = run_rivet(
        tmp.path(),
        &[
            "templates",
            "copy-to-project",
            "structural",
            "--format",
            "json",
        ],
    );
    let stdout = String::from_utf8_lossy(&out.stdout);
    let stderr = String::from_utf8_lossy(&out.stderr);
    assert!(
        out.status.success(),
        "expected success; stderr={stderr}; stdout={stdout}"
    );
    let v: serde_json::Value = serde_json::from_str(&stdout).expect("json");
    assert_eq!(v["kind"], "structural");
    let copied = v["copied"].as_array().unwrap();
    assert_eq!(copied.len(), 3, "structural ships 3 files: {stdout}");

    // Each canonical file landed
    for f in &["discover.md", "validate.md", "emit.md"] {
        let p = tmp
            .path()
            .join(".rivet/templates/pipelines/structural")
            .join(f);
        assert!(p.exists(), "expected {} to exist", p.display());
    }

    // Pin file got per-file records
    let pin_path = tmp.path().join(".rivet/.rivet-version");
    assert!(pin_path.exists(), "expected .rivet/.rivet-version");
    let pin = std::fs::read_to_string(&pin_path).unwrap();
    assert!(
        pin.contains("templates/pipelines/structural/discover.md@v1"),
        "pin file should record from-template: {pin}"
    );
    assert!(
        pin.contains("scaffolded-sha"),
        "pin file should record sha: {pin}"
    );
}

#[test]
fn templates_copy_to_project_skips_existing() {
    let tmp = tempfile::tempdir().unwrap();
    seed_project(tmp.path());

    // First copy
    let _ = run_rivet(tmp.path(), &["templates", "copy-to-project", "structural"]);
    // Second copy: no overwrites, all skipped.
    let out = run_rivet(
        tmp.path(),
        &[
            "templates",
            "copy-to-project",
            "structural",
            "--format",
            "json",
        ],
    );
    let stdout = String::from_utf8_lossy(&out.stdout);
    assert!(
        out.status.success(),
        "stderr: {}",
        String::from_utf8_lossy(&out.stderr)
    );

    let v: serde_json::Value = serde_json::from_str(&stdout).expect("json");
    assert_eq!(v["copied"].as_array().unwrap().len(), 0);
    assert_eq!(v["skipped"].as_array().unwrap().len(), 3);
}

#[test]
fn templates_copy_to_project_unknown_kind_fails() {
    let tmp = tempfile::tempdir().unwrap();
    seed_project(tmp.path());

    let out = run_rivet(tmp.path(), &["templates", "copy-to-project", "nope"]);
    assert!(!out.status.success());
}

// ── diff ───────────────────────────────────────────────────────────────

#[test]
fn templates_diff_shows_drift_after_user_edit() {
    let tmp = tempfile::tempdir().unwrap();
    seed_project(tmp.path());

    // Copy templates so they exist on disk
    let _ = run_rivet(tmp.path(), &["templates", "copy-to-project", "structural"]);
    // Mutate the project copy
    let target = tmp
        .path()
        .join(".rivet/templates/pipelines/structural/discover.md");
    let mut content = std::fs::read_to_string(&target).unwrap();
    content.push_str("\n## Project addition\nLocal customisation.\n");
    std::fs::write(&target, content).unwrap();

    // Diff (text)
    let out = run_rivet(tmp.path(), &["templates", "diff", "structural/discover.md"]);
    let stdout = String::from_utf8_lossy(&out.stdout);
    assert!(
        out.status.success(),
        "stderr: {}",
        String::from_utf8_lossy(&out.stderr)
    );
    assert!(
        stdout.contains("Project addition"),
        "expected drift in diff: {stdout}"
    );
    assert!(
        stdout.contains("---") && stdout.contains("+++"),
        "expected unified-diff hunks: {stdout}"
    );

    // Diff (json) — drift should be true
    let out = run_rivet(
        tmp.path(),
        &[
            "templates",
            "diff",
            "structural/discover.md",
            "--format",
            "json",
        ],
    );
    let stdout = String::from_utf8_lossy(&out.stdout);
    let v: serde_json::Value = serde_json::from_str(&stdout).expect("json");
    assert_eq!(v["drift"], true);
}

#[test]
fn templates_diff_skips_when_not_copied() {
    let tmp = tempfile::tempdir().unwrap();
    seed_project(tmp.path());

    let out = run_rivet(tmp.path(), &["templates", "diff", "structural/discover.md"]);
    let stdout = String::from_utf8_lossy(&out.stdout);
    assert!(
        out.status.success(),
        "stderr: {}",
        String::from_utf8_lossy(&out.stderr)
    );
    assert!(stdout.contains("skip"), "expected skip notice: {stdout}");
}
