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

/// B7 (issue #249) — `rivet check sources --strict` is a read-only
/// audit gate. On a clean fixture it exits 0; after editing the source
/// file off-disk, it exits 1 (drift). After `--update --apply` it
/// returns to exit 0.
#[test]
fn check_sources_strict_audit_gate() {
    let tmp = tempfile::tempdir().unwrap();
    let dir = tmp.path();
    let source = seed(dir);
    let original = sha256_hex(b"v1\n");
    write_artifact(dir, &original);

    // Clean fixture: --strict exits 0.
    let out = run_rivet(dir, &["check", "sources", "--strict"]);
    assert!(
        out.status.success(),
        "check sources --strict should pass on clean fixture.\nstdout: {}\nstderr: {}",
        String::from_utf8_lossy(&out.stdout),
        String::from_utf8_lossy(&out.stderr)
    );

    // Drift the source file.
    std::fs::write(&source, "v2\n").unwrap();

    // Now --strict must exit 1 — and crucially MUST NOT modify the YAML.
    let yaml_before = std::fs::read_to_string(dir.join("artifacts").join("req.yaml")).unwrap();
    let out = run_rivet(dir, &["check", "sources", "--strict"]);
    let yaml_after = std::fs::read_to_string(dir.join("artifacts").join("req.yaml")).unwrap();
    assert_eq!(
        yaml_before, yaml_after,
        "--strict must not mutate any YAML; got diff",
    );
    assert!(
        !out.status.success(),
        "check sources --strict should fail on drift.\nstdout: {}\nstderr: {}",
        String::from_utf8_lossy(&out.stdout),
        String::from_utf8_lossy(&out.stderr)
    );

    // Apply the fix in a separate invocation — same as the issue's
    // recommended pattern (audit and fix are not the same command).
    let upd = run_rivet(dir, &["check", "sources", "--update", "--apply"]);
    assert!(upd.status.code() != Some(2));

    // Strict gate should now pass again.
    let out = run_rivet(dir, &["check", "sources", "--strict"]);
    assert!(
        out.status.success(),
        "check sources --strict should pass after --update --apply.\nstdout: {}",
        String::from_utf8_lossy(&out.stdout)
    );
}

/// B7 (issue #249) — --strict and --update are mutually exclusive.
#[test]
fn check_sources_strict_and_update_are_mutually_exclusive() {
    let tmp = tempfile::tempdir().unwrap();
    let dir = tmp.path();
    seed(dir);
    let original = sha256_hex(b"v1\n");
    write_artifact(dir, &original);

    let out = run_rivet(dir, &["check", "sources", "--strict", "--update"]);
    assert!(
        !out.status.success(),
        "expected clap to reject --strict + --update"
    );
    let stderr = String::from_utf8_lossy(&out.stderr);
    assert!(
        stderr.contains("cannot be used") || stderr.contains("conflict"),
        "expected mutex error. stderr: {stderr}",
    );
}

/// B8 (issue #249) — `--strict-cited-source-stale` promotes the
/// previously-Info `cited-source-stale` diagnostic to an Error and
/// makes `validate` exit 1.
#[test]
fn validate_strict_cited_source_stale_fails_on_old_last_checked() {
    let tmp = tempfile::tempdir().unwrap();
    let dir = tmp.path();
    seed(dir);
    let original = sha256_hex(b"v1\n");
    // Override the artifact YAML with a stale last-checked (1970-01-01).
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
        sha256: {original}
        last-checked: 1970-01-01T00:00:00Z
"#
    );
    std::fs::write(dir.join("artifacts").join("req.yaml"), yaml).unwrap();

    // Default validate: passes (Info diagnostic only).
    let out = run_rivet(dir, &["validate", "--direct"]);
    assert!(
        out.status.success(),
        "default validate should pass on stale cited-source.\nstdout: {}",
        String::from_utf8_lossy(&out.stdout)
    );

    // --strict-cited-source-stale: exit 1.
    let out = run_rivet(
        dir,
        &["validate", "--direct", "--strict-cited-source-stale"],
    );
    let stdout = String::from_utf8_lossy(&out.stdout);
    let stderr = String::from_utf8_lossy(&out.stderr);
    assert!(
        !out.status.success(),
        "--strict-cited-source-stale should fail.\nstdout: {stdout}\nstderr: {stderr}"
    );
    // Look for the human-readable text rather than the rule name (the
    // rule name appears only in JSON output).
    assert!(
        stdout.contains("day(s) old") || stderr.contains("day(s) old"),
        "expected stale-age diagnostic. stdout={stdout} stderr={stderr}"
    );
}

/// B9 (issue #249) — `rivet schema migrate --list` enumerates recipes.
#[test]
fn schema_migrate_list_text() {
    let tmp = tempfile::tempdir().unwrap();
    let dir = tmp.path();
    seed(dir);

    let out = run_rivet(dir, &["schema", "migrate", "--list"]);
    assert!(
        out.status.success(),
        "--list should always exit 0.\nstdout: {}\nstderr: {}",
        String::from_utf8_lossy(&out.stdout),
        String::from_utf8_lossy(&out.stderr)
    );
    let stdout = String::from_utf8_lossy(&out.stdout);
    assert!(
        stdout.contains("dev-to-aspice"),
        "expected built-in recipe in output. stdout: {stdout}"
    );
    assert!(
        stdout.contains("built-in"),
        "expected origin column. stdout: {stdout}"
    );
}

/// B9 (issue #249) — `--list --format json` emits valid JSON with the
/// expected shape.
#[test]
fn schema_migrate_list_json() {
    let tmp = tempfile::tempdir().unwrap();
    let dir = tmp.path();
    seed(dir);

    let out = run_rivet(dir, &["schema", "migrate", "--list", "--format", "json"]);
    assert!(out.status.success());
    let stdout = String::from_utf8_lossy(&out.stdout);
    let v: serde_json::Value = serde_json::from_str(&stdout)
        .unwrap_or_else(|e| panic!("not valid JSON: {e}\n--- stdout ---\n{stdout}"));
    assert_eq!(v["oracle"], "schema-migrate-recipes");
    let recipes = v["recipes"].as_array().expect("recipes array");
    assert!(
        recipes.iter().any(|r| r["name"] == "dev-to-aspice"),
        "expected dev-to-aspice in JSON. got: {recipes:?}"
    );
}

/// B9 (issue #249) — project-local recipes appear with origin
/// "project-local".
#[test]
fn schema_migrate_list_includes_project_local() {
    let tmp = tempfile::tempdir().unwrap();
    let dir = tmp.path();
    seed(dir);

    // Write a project-local recipe.
    let migrations = dir.join("schemas").join("migrations");
    std::fs::create_dir_all(&migrations).unwrap();
    std::fs::write(
        migrations.join("dev-to-stpa.yaml"),
        "migration:\n  name: dev-to-stpa\n  source: { preset: dev }\n  target: { preset: stpa }\n  description: 'project-local recipe'\n",
    )
    .unwrap();

    let out = run_rivet(dir, &["schema", "migrate", "--list", "--format", "json"]);
    assert!(out.status.success());
    let stdout = String::from_utf8_lossy(&out.stdout);
    let v: serde_json::Value = serde_json::from_str(&stdout).unwrap();
    let recipes = v["recipes"].as_array().expect("recipes array");
    let local = recipes
        .iter()
        .find(|r| r["name"] == "dev-to-stpa")
        .expect("dev-to-stpa in recipes");
    assert_eq!(local["origin"], "project-local");
}

/// B9 (issue #249) — `--list` and `--apply` are mutually exclusive.
#[test]
fn schema_migrate_list_and_apply_are_mutually_exclusive() {
    let tmp = tempfile::tempdir().unwrap();
    let dir = tmp.path();
    seed(dir);

    let out = run_rivet(dir, &["schema", "migrate", "--list", "--apply", "aspice"]);
    assert!(!out.status.success(), "expected clap to reject mutex");
    let stderr = String::from_utf8_lossy(&out.stderr);
    assert!(
        stderr.contains("cannot be used") || stderr.contains("conflict"),
        "expected mutex error. stderr: {stderr}"
    );
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
