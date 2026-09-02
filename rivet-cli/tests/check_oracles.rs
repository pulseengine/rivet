// SAFETY-REVIEW (SCRC Phase 1, DD-058): Integration test / bench code.
// Tests legitimately use unwrap/expect/panic/assert-indexing patterns
// because a test failure should panic with a clear stack. Blanket-allow
// the Phase 1 restriction lints at crate scope.
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

//! Integration tests for the three `rivet check …` oracle subcommands.
//!
//! Each oracle has at least one positive (passes) and one negative (fires)
//! scenario. Assertions check exit code + JSON output shape.

use std::path::{Path, PathBuf};
use std::process::Command;
/// Absolute path to the `rivet` binary under test.
///
/// `env!` (compile time), NOT `std::env::var` (run time). Cargo sets
/// `CARGO_BIN_EXE_<name>` for an integration test and substitutes the real
/// path at build time. Reading it at RUN time works under `cargo test`,
/// which happens to leave the variable in the test process environment, but
/// nextest spawns test processes itself and does not — so the old code fell
/// through to a hardcoded `<workspace>/target/debug/rivet` that ignores
/// `CARGO_TARGET_DIR` entirely. See REQ-314.
fn rivet_bin() -> PathBuf {
    PathBuf::from(env!("CARGO_BIN_EXE_rivet"))
}

/// Minimal schema: one artifact type, one link type with inverse, plus
/// whatever else is needed for validation to accept a clean project.
///
/// Both `satisfies` and `satisfied-by` are declared as authorable link
/// types so that `rivet check bidirectional` fires when the inverse is
/// missing (per #648, the oracle skips forward links whose declared
/// inverse is not itself authorable). Test 1 (`_passes_when_every_forward_link_has_inverse`)
/// and test 2 (`_fires_when_inverse_missing`) both rely on this schema
/// staying bidirectionally-authorable.
const MINIMAL_SCHEMA: &str = r#"schema:
  name: oracle-test
  version: "0.1.0"
  description: Minimal test schema for oracle integration tests.

artifact-types:
  - name: requirement
    description: A requirement

  - name: design-decision
    description: A design decision

link-types:
  - name: satisfies
    inverse: satisfied-by
    description: Source satisfies target
    source-types: [design-decision]
    target-types: [requirement]

  - name: satisfied-by
    inverse: satisfies
    description: Target is satisfied by source
    source-types: [requirement]
    target-types: [design-decision]
"#;

const MINIMAL_RIVET_YAML: &str = r#"project:
  name: oracle-test
  version: "0.1.0"
  schemas:
    - oracle-test
sources:
  - path: artifacts
    format: generic-yaml
"#;

/// Build a minimal project in `dir`: writes rivet.yaml, schemas/oracle-test.yaml,
/// and an empty artifacts/ directory. The caller then writes per-test
/// artifact YAMLs into `artifacts/`.
fn seed_project(dir: &Path) {
    std::fs::create_dir_all(dir.join("schemas")).unwrap();
    std::fs::create_dir_all(dir.join("artifacts")).unwrap();
    std::fs::write(dir.join("rivet.yaml"), MINIMAL_RIVET_YAML).unwrap();
    std::fs::write(dir.join("schemas").join("oracle-test.yaml"), MINIMAL_SCHEMA).unwrap();
}

fn write_artifact(dir: &Path, name: &str, content: &str) {
    std::fs::write(dir.join("artifacts").join(name), content).unwrap();
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

// ── bidirectional oracle ───────────────────────────────────────────────

#[test]
fn bidirectional_passes_when_every_forward_link_has_inverse() {
    let tmp = tempfile::tempdir().unwrap();
    let dir = tmp.path();
    seed_project(dir);

    // REQ-001 has a satisfied-by inverse to DD-001 that satisfies REQ-001.
    write_artifact(
        dir,
        "req.yaml",
        r#"artifacts:
  - id: REQ-001
    type: requirement
    title: a requirement
    status: draft
    links:
      - type: satisfied-by
        target: DD-001
"#,
    );
    write_artifact(
        dir,
        "dd.yaml",
        r#"artifacts:
  - id: DD-001
    type: design-decision
    title: a design decision
    status: draft
    links:
      - type: satisfies
        target: REQ-001
"#,
    );

    let out = run_rivet(dir, &["check", "bidirectional", "--format", "json"]);
    let stdout = String::from_utf8_lossy(&out.stdout);
    let stderr = String::from_utf8_lossy(&out.stderr);
    assert!(
        out.status.success(),
        "expected success; stderr={stderr}; stdout={stdout}"
    );

    let v: serde_json::Value = serde_json::from_str(&stdout).expect("stdout must be valid JSON");
    assert_eq!(v["oracle"], "bidirectional");
    assert_eq!(
        v["violations"].as_array().unwrap().len(),
        0,
        "expected no violations, got: {}",
        stdout
    );
}

#[test]
fn bidirectional_fires_when_inverse_missing() {
    let tmp = tempfile::tempdir().unwrap();
    let dir = tmp.path();
    seed_project(dir);

    // DD-001 satisfies REQ-001, but REQ-001 has no satisfied-by link back.
    write_artifact(
        dir,
        "req.yaml",
        r#"artifacts:
  - id: REQ-001
    type: requirement
    title: a requirement
    status: draft
"#,
    );
    write_artifact(
        dir,
        "dd.yaml",
        r#"artifacts:
  - id: DD-001
    type: design-decision
    title: a design decision
    status: draft
    links:
      - type: satisfies
        target: REQ-001
"#,
    );

    let out = run_rivet(dir, &["check", "bidirectional", "--format", "json"]);
    let stdout = String::from_utf8_lossy(&out.stdout);
    let stderr = String::from_utf8_lossy(&out.stderr);
    assert!(
        !out.status.success(),
        "expected failure; stdout={stdout}; stderr={stderr}"
    );

    let v: serde_json::Value = serde_json::from_str(&stdout).expect("stdout must be valid JSON");
    assert_eq!(v["oracle"], "bidirectional");
    let viols = v["violations"].as_array().unwrap();
    assert_eq!(viols.len(), 1, "expected exactly one violation: {stdout}");
    assert_eq!(viols[0]["source"], "DD-001");
    assert_eq!(viols[0]["link_type"], "satisfies");
    assert_eq!(viols[0]["target"], "REQ-001");
    assert_eq!(viols[0]["expected_inverse"], "satisfied-by");
}

/// Schema that declares `satisfies` with an inverse name but does NOT
/// declare that inverse (`satisfied-by`) as its own authorable link type.
/// This is the shape called out in #648 (aspice embeds `satisfies`,
/// `verifies`, `derives-from` this way): the inverse cannot be
/// materialized without failing `rivet validate` — so the bidirectional
/// oracle must treat the forward link as sufficient.
const UNIDIRECTIONAL_SCHEMA: &str = r#"schema:
  name: oracle-test-uni
  version: "0.1.0"
  description: Schema whose `satisfies` inverse is not itself authorable.

artifact-types:
  - name: requirement
    description: A requirement

  - name: design-decision
    description: A design decision

link-types:
  - name: satisfies
    inverse: satisfied-by
    description: Source satisfies target
    source-types: [design-decision]
    target-types: [requirement]
"#;

const UNIDIRECTIONAL_RIVET_YAML: &str = r#"project:
  name: oracle-test-uni
  version: "0.1.0"
  schemas:
    - oracle-test-uni
sources:
  - path: artifacts
    format: generic-yaml
"#;

fn seed_unidirectional_project(dir: &Path) {
    std::fs::create_dir_all(dir.join("schemas")).unwrap();
    std::fs::create_dir_all(dir.join("artifacts")).unwrap();
    std::fs::write(dir.join("rivet.yaml"), UNIDIRECTIONAL_RIVET_YAML).unwrap();
    std::fs::write(
        dir.join("schemas").join("oracle-test-uni.yaml"),
        UNIDIRECTIONAL_SCHEMA,
    )
    .unwrap();
}

/// #648 kill criterion: on a schema whose `satisfies.inverse` is not
/// declared as an authorable link type, a project that only authors
/// forward `satisfies` links must reach `bidirectional: OK` *and* pass
/// `rivet validate` at the same time. Before this fix, the oracle
/// demanded a `satisfied-by` inverse on every REQ, but validate rejected
/// that inverse as `unknown-link-type` — one oracle's green was another
/// oracle's red.
#[test]
fn bidirectional_and_validate_both_pass_when_inverse_is_not_authorable() {
    let tmp = tempfile::tempdir().unwrap();
    let dir = tmp.path();
    seed_unidirectional_project(dir);

    // DD-001 authors the forward `satisfies` link. REQ-001 authors
    // nothing — the schema forbids `satisfied-by`, and the fix means the
    // bidirectional oracle no longer demands it.
    write_artifact(
        dir,
        "req.yaml",
        r#"artifacts:
  - id: REQ-001
    type: requirement
    title: a requirement
    status: draft
"#,
    );
    write_artifact(
        dir,
        "dd.yaml",
        r#"artifacts:
  - id: DD-001
    type: design-decision
    title: a design decision
    status: draft
    links:
      - type: satisfies
        target: REQ-001
"#,
    );

    // Half 1: bidirectional oracle green.
    let bi = run_rivet(dir, &["check", "bidirectional", "--format", "json"]);
    let bi_stdout = String::from_utf8_lossy(&bi.stdout);
    let bi_stderr = String::from_utf8_lossy(&bi.stderr);
    assert!(
        bi.status.success(),
        "expected bidirectional OK; stdout={bi_stdout}; stderr={bi_stderr}"
    );
    let bi_v: serde_json::Value =
        serde_json::from_str(&bi_stdout).expect("bidirectional stdout must be valid JSON");
    assert_eq!(bi_v["oracle"], "bidirectional");
    assert_eq!(
        bi_v["violations"].as_array().unwrap().len(),
        0,
        "expected zero bidirectional violations, got: {bi_stdout}"
    );

    // Half 2: validate green — no unknown-link-type error for the inverse,
    // because we never authored it.
    let val = run_rivet(dir, &["validate", "--format", "json"]);
    let val_stdout = String::from_utf8_lossy(&val.stdout);
    let val_stderr = String::from_utf8_lossy(&val.stderr);
    assert!(
        val.status.success(),
        "expected validate PASS; stdout={val_stdout}; stderr={val_stderr}"
    );
    // No `unknown-link-type` diagnostic anywhere in the validate output.
    assert!(
        !val_stdout.contains("unknown-link-type") && !val_stderr.contains("unknown-link-type"),
        "validate should not emit unknown-link-type; stdout={val_stdout}; stderr={val_stderr}"
    );
}

// ── review-signoff oracle ──────────────────────────────────────────────

#[test]
fn review_signoff_passes_when_reviewer_distinct_and_role_matches() {
    let tmp = tempfile::tempdir().unwrap();
    let dir = tmp.path();
    seed_project(dir);

    write_artifact(
        dir,
        "req.yaml",
        r#"artifacts:
  - id: REQ-001
    type: requirement
    title: a released requirement
    status: released
    provenance:
      created-by: alice
      reviewed-by: bob
    fields:
      reviewer-role: safety-manager
"#,
    );

    let out = run_rivet(
        dir,
        &[
            "check",
            "review-signoff",
            "REQ-001",
            "--role",
            "safety-manager",
            "--format",
            "json",
        ],
    );
    let stdout = String::from_utf8_lossy(&out.stdout);
    let stderr = String::from_utf8_lossy(&out.stderr);
    assert!(
        out.status.success(),
        "expected success; stdout={stdout}; stderr={stderr}"
    );

    let v: serde_json::Value = serde_json::from_str(&stdout).expect("stdout must be valid JSON");
    assert_eq!(v["oracle"], "review-signoff");
    assert_eq!(v["artifact_id"], "REQ-001");
    assert_eq!(v["ok"], true);
    assert_eq!(v["author"], "alice");
    assert_eq!(v["reviewer"], "bob");
    assert_eq!(v["role_required"], "safety-manager");
    assert_eq!(v["role_actual"], "safety-manager");
}

#[test]
fn review_signoff_fires_when_reviewer_same_as_author() {
    let tmp = tempfile::tempdir().unwrap();
    let dir = tmp.path();
    seed_project(dir);

    write_artifact(
        dir,
        "req.yaml",
        r#"artifacts:
  - id: REQ-002
    type: requirement
    title: bad release
    status: released
    provenance:
      created-by: alice
      reviewed-by: alice
"#,
    );

    let out = run_rivet(
        dir,
        &["check", "review-signoff", "REQ-002", "--format", "json"],
    );
    let stdout = String::from_utf8_lossy(&out.stdout);
    let stderr = String::from_utf8_lossy(&out.stderr);
    assert!(
        !out.status.success(),
        "expected failure; stdout={stdout}; stderr={stderr}"
    );

    let v: serde_json::Value = serde_json::from_str(&stdout).expect("stdout must be valid JSON");
    assert_eq!(v["oracle"], "review-signoff");
    assert_eq!(v["ok"], false);
    let reasons = v["reasons"].as_array().unwrap();
    assert!(
        reasons
            .iter()
            .any(|r| r.as_str().unwrap().contains("must differ from author")),
        "expected 'must differ from author' reason, got {reasons:?}"
    );
}

#[test]
fn review_signoff_fires_when_reviewer_missing() {
    let tmp = tempfile::tempdir().unwrap();
    let dir = tmp.path();
    seed_project(dir);

    write_artifact(
        dir,
        "req.yaml",
        r#"artifacts:
  - id: REQ-003
    type: requirement
    title: released but unreviewed
    status: released
    provenance:
      created-by: alice
"#,
    );

    let out = run_rivet(
        dir,
        &["check", "review-signoff", "REQ-003", "--format", "json"],
    );
    let stdout = String::from_utf8_lossy(&out.stdout);
    assert!(!out.status.success(), "expected failure; stdout={stdout}");

    let v: serde_json::Value = serde_json::from_str(&stdout).unwrap();
    assert_eq!(v["ok"], false);
    let reasons = v["reasons"].as_array().unwrap();
    assert!(
        reasons
            .iter()
            .any(|r| r.as_str().unwrap().contains("missing reviewer")),
        "expected 'missing reviewer' reason: {reasons:?}"
    );
}

// ── gaps-json oracle ───────────────────────────────────────────────────

#[test]
fn gaps_json_passes_on_clean_project() {
    let tmp = tempfile::tempdir().unwrap();
    let dir = tmp.path();
    seed_project(dir);

    write_artifact(
        dir,
        "req.yaml",
        r#"artifacts:
  - id: REQ-001
    type: requirement
    title: clean requirement
    status: draft
"#,
    );

    let out = run_rivet(dir, &["check", "gaps-json"]);
    let stdout = String::from_utf8_lossy(&out.stdout);
    let stderr = String::from_utf8_lossy(&out.stderr);
    assert!(
        out.status.success(),
        "expected success on clean project; stdout={stdout}; stderr={stderr}"
    );

    let v: serde_json::Value = serde_json::from_str(&stdout).expect("stdout must be valid JSON");
    assert_eq!(v["oracle"], "gaps-json");
    assert_eq!(v["by_severity"]["error"], 0);
}

#[test]
fn gaps_json_fires_when_artifact_has_errors() {
    let tmp = tempfile::tempdir().unwrap();
    let dir = tmp.path();
    seed_project(dir);

    // Broken link — target doesn't exist.  Validator emits a broken-link
    // error which the oracle picks up.
    write_artifact(
        dir,
        "dd.yaml",
        r#"artifacts:
  - id: DD-042
    type: design-decision
    title: dd with dangling link
    status: draft
    links:
      - type: satisfies
        target: REQ-NONEXISTENT
"#,
    );

    let out = run_rivet(dir, &["check", "gaps-json"]);
    let stdout = String::from_utf8_lossy(&out.stdout);
    assert!(
        !out.status.success(),
        "expected failure on broken-link project; stdout={stdout}"
    );

    let v: serde_json::Value = serde_json::from_str(&stdout).unwrap();
    assert_eq!(v["oracle"], "gaps-json");
    let error_count = v["by_severity"]["error"].as_u64().unwrap();
    assert!(error_count >= 1, "expected at least one error: {stdout}");
    let gaps = v["gaps"].as_array().unwrap();
    assert!(!gaps.is_empty(), "expected gaps entries: {stdout}");

    // Sanity: the DD-042 artifact should appear in the gaps.
    assert!(
        gaps.iter().any(|g| g["artifact_id"] == "DD-042"),
        "expected DD-042 in gaps list: {stdout}"
    );
}
