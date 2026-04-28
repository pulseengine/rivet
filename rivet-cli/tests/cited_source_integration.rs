// SAFETY-REVIEW (SCRC Phase 1, DD-058): Integration test code. Allows
// the same restriction lints as other integration tests in this crate.
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

//! Integration test for the Phase 1 `cited-source` flow.
//!
//! Covers issue #237 acceptance criteria:
//! - Schema accepts the typed `cited-source` field.
//! - `rivet validate` PASSes when the stamp matches the file.
//! - Edit the file → `rivet validate` emits a `cited-source-drift` diagnostic.
//! - `rivet validate --strict-cited-sources` exits 1 on drift.
//! - `rivet check sources --update --apply` refreshes the stamp.

use std::path::{Path, PathBuf};
use std::process::Command;

use sha2::{Digest, Sha256};

fn rivet_bin() -> PathBuf {
    if let Ok(bin) = std::env::var("CARGO_BIN_EXE_rivet") {
        return PathBuf::from(bin);
    }
    let manifest = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    let workspace_root = manifest.parent().expect("workspace root");
    workspace_root.join("target").join("debug").join("rivet")
}

const SCHEMA: &str = r#"schema:
  name: cs-test
  version: "0.1.0"
  description: Minimal test schema with cited-source.

artifact-types:
  - name: requirement
    description: A requirement
    fields:
      - name: cited-source
        type: cited-source
        required: false
        description: cited-source field

link-types: []
"#;

const RIVET_YAML: &str = r#"project:
  name: cs-test
  version: "0.1.0"
  schemas:
    - cs-test
sources:
  - path: artifacts
    format: generic-yaml
"#;

fn sha256_hex(bytes: &[u8]) -> String {
    let mut h = Sha256::new();
    h.update(bytes);
    let digest = h.finalize();
    let mut s = String::with_capacity(64);
    for byte in digest.iter() {
        use std::fmt::Write;
        let _ = write!(&mut s, "{byte:02x}");
    }
    s
}

fn seed(dir: &Path) -> PathBuf {
    std::fs::create_dir_all(dir.join("schemas")).unwrap();
    std::fs::create_dir_all(dir.join("artifacts")).unwrap();
    std::fs::create_dir_all(dir.join("testdata")).unwrap();
    std::fs::write(dir.join("rivet.yaml"), RIVET_YAML).unwrap();
    std::fs::write(dir.join("schemas").join("cs-test.yaml"), SCHEMA).unwrap();
    let source = dir.join("testdata").join("source.txt");
    std::fs::write(&source, "v1\n").unwrap();
    source
}

fn write_artifact(dir: &Path, sha: &str) {
    let yaml = format!(
        r#"artifacts:
  - id: REQ-001
    type: requirement
    title: A test requirement
    status: draft
    fields:
      cited-source:
        uri: ./testdata/source.txt
        kind: file
        sha256: {sha}
        last-checked: 2026-04-27T00:00:00Z
"#
    );
    std::fs::write(dir.join("artifacts").join("req.yaml"), yaml).unwrap();
}

fn run_rivet(dir: &Path, args: &[&str]) -> std::process::Output {
    let mut cmd = Command::new(rivet_bin());
    cmd.arg("--project")
        .arg(dir)
        .arg("--schemas")
        .arg(dir.join("schemas"));
    for a in args {
        cmd.arg(a);
    }
    cmd.output().expect("spawn rivet")
}

#[test]
fn validate_passes_when_hash_matches() {
    let tmp = tempfile::tempdir().unwrap();
    let dir = tmp.path();
    seed(dir);
    let original = sha256_hex(b"v1\n");
    write_artifact(dir, &original);

    let out = run_rivet(dir, &["validate", "--direct"]);
    assert!(
        out.status.success(),
        "validate should pass when hash matches\nstdout: {}\nstderr: {}",
        String::from_utf8_lossy(&out.stdout),
        String::from_utf8_lossy(&out.stderr)
    );

    let stdout = String::from_utf8_lossy(&out.stdout);
    assert!(stdout.contains("PASS"), "stdout: {stdout}");
    assert!(
        !stdout.contains("cited-source-drift"),
        "no drift expected: {stdout}"
    );
}

#[test]
fn validate_emits_drift_warning_after_file_edit() {
    let tmp = tempfile::tempdir().unwrap();
    let dir = tmp.path();
    let source = seed(dir);
    let original = sha256_hex(b"v1\n");
    write_artifact(dir, &original);

    // Edit the cited file
    std::fs::write(&source, "v2\n").unwrap();

    let out = run_rivet(dir, &["validate", "--direct"]);
    let stdout = String::from_utf8_lossy(&out.stdout);
    let stderr = String::from_utf8_lossy(&out.stderr);

    // Default fail-on=error: a Warning-level drift does not fail the gate.
    assert!(
        out.status.success(),
        "validate should still PASS at default --fail-on=error.\nstdout: {stdout}\nstderr: {stderr}",
    );
    // The diagnostic message text contains "sha256 mismatch" — the rule
    // name `cited-source-drift` is not in the rendered text.
    assert!(
        stdout.contains("sha256 mismatch") || stderr.contains("sha256 mismatch"),
        "expected drift diagnostic.\nstdout: {stdout}\nstderr: {stderr}",
    );
}

#[test]
fn validate_strict_cited_sources_fails_on_drift() {
    let tmp = tempfile::tempdir().unwrap();
    let dir = tmp.path();
    let source = seed(dir);
    let original = sha256_hex(b"v1\n");
    write_artifact(dir, &original);

    std::fs::write(&source, "v2\n").unwrap();

    let out = run_rivet(dir, &["validate", "--direct", "--strict-cited-sources"]);
    let stdout = String::from_utf8_lossy(&out.stdout);
    let stderr = String::from_utf8_lossy(&out.stderr);

    assert!(
        !out.status.success(),
        "validate --strict-cited-sources should fail on drift.\nstdout: {stdout}\nstderr: {stderr}",
    );
    assert!(
        stdout.contains("sha256 mismatch") || stderr.contains("sha256 mismatch"),
        "drift diag missing: stdout={stdout} stderr={stderr}"
    );
}

#[test]
fn check_sources_update_apply_refreshes_stamp() {
    let tmp = tempfile::tempdir().unwrap();
    let dir = tmp.path();
    let source = seed(dir);
    let original = sha256_hex(b"v1\n");
    write_artifact(dir, &original);

    // Drift the source file.
    std::fs::write(&source, "v2\n").unwrap();
    let new_hash = sha256_hex(b"v2\n");

    // Run the audit-update flow.
    let out = run_rivet(dir, &["check", "sources", "--update", "--apply"]);
    assert!(
        out.status.code() != Some(2),
        "command crashed: {}",
        String::from_utf8_lossy(&out.stderr)
    );

    // Inspect the rewritten artifact.
    let updated_yaml = std::fs::read_to_string(dir.join("artifacts").join("req.yaml")).unwrap();
    assert!(
        updated_yaml.contains(&format!("sha256: {new_hash}")),
        "sha256 was not updated: {updated_yaml}"
    );

    // After update, validate should pass cleanly.
    let v = run_rivet(dir, &["validate", "--direct"]);
    let stdout = String::from_utf8_lossy(&v.stdout);
    assert!(v.status.success(), "validate after update: {stdout}");
    assert!(
        !stdout.contains("cited-source-drift"),
        "drift should be resolved: {stdout}"
    );
}

#[test]
fn check_sources_lists_entries_in_text_mode() {
    let tmp = tempfile::tempdir().unwrap();
    let dir = tmp.path();
    seed(dir);
    let original = sha256_hex(b"v1\n");
    write_artifact(dir, &original);

    let out = run_rivet(dir, &["check", "sources"]);
    let stdout = String::from_utf8_lossy(&out.stdout);

    assert!(stdout.contains("REQ-001"), "stdout: {stdout}");
    assert!(stdout.contains("MATCH"), "stdout: {stdout}");
    assert!(stdout.contains("file"), "stdout: {stdout}");
}

#[test]
fn validate_rejects_arbitrary_uri_scheme() {
    let tmp = tempfile::tempdir().unwrap();
    let dir = tmp.path();
    seed(dir);

    // Write an artifact with an arbitrary URI scheme — must not pass validate.
    let yaml = r#"artifacts:
  - id: REQ-001
    type: requirement
    title: A test requirement
    status: draft
    fields:
      cited-source:
        uri: 'ftp://evil.example.com/exfil'
        kind: url
        sha256: 0000000000000000000000000000000000000000000000000000000000000000
"#;
    std::fs::write(dir.join("artifacts").join("req.yaml"), yaml).unwrap();

    let out = run_rivet(dir, &["validate", "--direct"]);
    let stdout = String::from_utf8_lossy(&out.stdout);
    let stderr = String::from_utf8_lossy(&out.stderr);

    assert!(
        !out.status.success(),
        "validate should fail on unknown URI scheme.\nstdout: {stdout}\nstderr: {stderr}",
    );
    assert!(
        stdout.contains("not in the allowlist") || stderr.contains("not in the allowlist"),
        "expected scheme allowlist error.\nstdout: {stdout}\nstderr: {stderr}",
    );
}
