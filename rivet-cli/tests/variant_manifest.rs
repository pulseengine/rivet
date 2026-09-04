// SAFETY-REVIEW (SCRC Phase 1, DD-058): Integration test code — blanket
// allow of the restriction family. Tests legitimately use
// unwrap/expect/panic/indexing because a test failure should panic with
// a clear stack; real risk analysis is carried by production code.
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

//! Integration tests for `rivet variant manifest`.
//!
//! Runs the new subcommand against the on-disk fixtures in
//! `examples/variant/` and a synthetic temp-dir fixture exercising the
//! `when:` predicate path. Asserts:
//!   * exit 0 on a valid model+variant+binding triple
//!   * JSON shape includes `variant`, `manifest`, and per-feature globs
//!   * a `when:` clause that evaluates false drops the glob from output

use std::fs;
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
fn rivet_bin() -> std::path::PathBuf {
    std::path::PathBuf::from(env!("CARGO_BIN_EXE_rivet"))
}

fn examples_path(name: &str) -> std::path::PathBuf {
    let manifest = std::path::PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    manifest
        .parent()
        .expect("workspace root")
        .join("examples")
        .join("variant")
        .join(name)
}

#[test]
fn manifest_runs_against_examples_variant_text() {
    let model = examples_path("feature-model.yaml");
    let variant = examples_path("eu-adas-c.yaml");
    let binding = examples_path("bindings.yaml");

    let output = Command::new(rivet_bin())
        .args([
            "variant",
            "manifest",
            "--model",
            model.to_str().unwrap(),
            "--variant",
            variant.to_str().unwrap(),
            "--binding",
            binding.to_str().unwrap(),
        ])
        .output()
        .expect("rivet variant manifest");
    assert!(
        output.status.success(),
        "rivet variant manifest failed: stderr={}",
        String::from_utf8_lossy(&output.stderr)
    );
    let text = String::from_utf8_lossy(&output.stdout);
    assert!(
        text.contains("source manifest") && text.contains("eu-adas-c"),
        "expected text manifest header, got:\n{text}"
    );
}

#[test]
fn manifest_json_output_has_expected_shape() {
    let model = examples_path("feature-model.yaml");
    let variant = examples_path("eu-adas-c.yaml");
    let binding = examples_path("bindings.yaml");

    let output = Command::new(rivet_bin())
        .args([
            "variant",
            "manifest",
            "--model",
            model.to_str().unwrap(),
            "--variant",
            variant.to_str().unwrap(),
            "--binding",
            binding.to_str().unwrap(),
            "--format",
            "json",
        ])
        .output()
        .expect("rivet variant manifest --format json");
    assert!(
        output.status.success(),
        "exit non-zero: stderr={}",
        String::from_utf8_lossy(&output.stderr)
    );
    let v: serde_json::Value = serde_json::from_slice(&output.stdout).expect("valid json");
    assert_eq!(v["variant"], "eu-adas-c");
    assert!(v["manifest"].is_object());
    assert!(v["feature_count"].is_number());
    assert!(v["manifest_entry_count"].is_number());
}

#[test]
fn manifest_when_clause_filters_globs_end_to_end() {
    let tmp = tempfile::tempdir().unwrap();
    let model_path = tmp.path().join("model.yaml");
    fs::write(
        &model_path,
        r#"
kind: feature-model
root: vehicle
features:
  vehicle:
    group: mandatory
    children: [engine, market]
  engine:
    group: alternative
    children: [petrol, electric]
  petrol:
    group: leaf
  electric:
    group: leaf
  market:
    group: alternative
    children: [eu, us]
  eu:
    group: leaf
  us:
    group: leaf
constraints: []
"#,
    )
    .unwrap();
    let variant_path = tmp.path().join("variant.yaml");
    fs::write(
        &variant_path,
        r#"
name: ev-eu
selects:
  - electric
  - eu
"#,
    )
    .unwrap();
    let binding_path = tmp.path().join("bindings.yaml");
    fs::write(
        &binding_path,
        r#"
bindings:
  electric:
    artifacts: [REQ-EL-001]
    source:
      - glob: src/electric/core/**
      - glob: src/electric/eu/**
        when: (has-tag "eu")
      - glob: src/electric/us/**
        when: (has-tag "us")
"#,
    )
    .unwrap();

    let output = Command::new(rivet_bin())
        .args([
            "variant",
            "manifest",
            "--model",
            model_path.to_str().unwrap(),
            "--variant",
            variant_path.to_str().unwrap(),
            "--binding",
            binding_path.to_str().unwrap(),
            "--format",
            "json",
        ])
        .output()
        .expect("rivet variant manifest --format json");
    assert!(
        output.status.success(),
        "exit non-zero: stderr={}",
        String::from_utf8_lossy(&output.stderr)
    );
    let v: serde_json::Value = serde_json::from_slice(&output.stdout).expect("valid json");
    let electric = v["manifest"]["electric"].as_array().expect("electric arr");
    let strs: Vec<String> = electric
        .iter()
        .map(|x| x.as_str().unwrap().to_string())
        .collect();
    assert!(strs.contains(&"src/electric/core/**".to_string()));
    assert!(
        strs.contains(&"src/electric/eu/**".to_string()),
        "eu-selected variant must include the eu-conditional glob"
    );
    assert!(
        !strs.contains(&"src/electric/us/**".to_string()),
        "us is not selected; the us-conditional glob must not appear"
    );
}

/// Write a minimal model + variant + single-source-glob binding into `dir`.
/// The variant selects `core`, whose binding carries one `source:` glob.
fn write_min_manifest_fixture(dir: &std::path::Path, glob: &str) {
    fs::write(
        dir.join("model.yaml"),
        "kind: feature-model\nroot: app\nfeatures:\n  app:\n    group: mandatory\n    children: [core]\n  core:\n    group: leaf\nconstraints: []\n",
    )
    .unwrap();
    fs::write(dir.join("variant.yaml"), "name: v\nselects: [core]\n").unwrap();
    fs::write(
        dir.join("bindings.yaml"),
        format!("bindings:\n  core:\n    artifacts: []\n    source:\n      - glob: {glob}\n"),
    )
    .unwrap();
}

fn manifest_args(dir: &std::path::Path, extra: &[&str]) -> Vec<String> {
    let mut a = vec![
        "--project".to_string(),
        dir.to_str().unwrap().to_string(),
        "variant".to_string(),
        "manifest".to_string(),
        "--model".to_string(),
        dir.join("model.yaml").to_str().unwrap().to_string(),
        "--variant".to_string(),
        dir.join("variant.yaml").to_str().unwrap().to_string(),
        "--binding".to_string(),
        dir.join("bindings.yaml").to_str().unwrap().to_string(),
    ];
    a.extend(extra.iter().map(|s| s.to_string()));
    a
}

/// REQ-265c: a source glob whose literal base directory does not exist on
/// disk is surfaced as a loud stderr warning AND a JSON `source_warnings`
/// entry — but without `--strict` the command still exits 0.
#[test]
fn manifest_warns_on_missing_source_base() {
    let tmp = tempfile::tempdir().unwrap();
    write_min_manifest_fixture(tmp.path(), "src/absent/**");
    // `src/absent` is deliberately NOT created under tmp.

    let output = Command::new(rivet_bin())
        .args(manifest_args(tmp.path(), &["--format", "json"]))
        .output()
        .expect("rivet variant manifest");

    assert!(
        output.status.success(),
        "must exit 0 without --strict. stderr: {}",
        String::from_utf8_lossy(&output.stderr)
    );
    let stderr = String::from_utf8_lossy(&output.stderr);
    assert!(
        stderr.contains("warning") && stderr.contains("src/absent"),
        "expected a loud missing-source warning. stderr: {stderr}"
    );
    let v: serde_json::Value = serde_json::from_slice(&output.stdout).expect("valid json");
    let warns = v["source_warnings"]
        .as_array()
        .expect("source_warnings array");
    assert_eq!(warns.len(), 1, "exactly one missing base. json: {v}");
    assert_eq!(warns[0]["missing_base"], "src/absent");
    assert_eq!(warns[0]["feature"], "core");
}

/// REQ-265c: `--strict` escalates a missing source base to a nonzero exit.
#[test]
fn manifest_strict_fails_on_missing_source_base() {
    let tmp = tempfile::tempdir().unwrap();
    write_min_manifest_fixture(tmp.path(), "src/absent/**");

    let output = Command::new(rivet_bin())
        .args(manifest_args(tmp.path(), &["--strict"]))
        .output()
        .expect("rivet variant manifest --strict");

    assert!(
        !output.status.success(),
        "--strict must exit nonzero when a source base is missing"
    );
    let stderr = String::from_utf8_lossy(&output.stderr);
    assert!(
        stderr.contains("--strict") && stderr.contains("missing base"),
        "expected a strict-mode error. stderr: {stderr}"
    );
}

/// REQ-265c guard: a source glob whose base directory DOES exist produces no
/// warning and an empty `source_warnings` list — verification must not flag
/// valid sources.
#[test]
fn manifest_no_warning_when_source_base_exists() {
    let tmp = tempfile::tempdir().unwrap();
    write_min_manifest_fixture(tmp.path(), "src/present/**");
    fs::create_dir_all(tmp.path().join("src").join("present")).unwrap();

    let output = Command::new(rivet_bin())
        .args(manifest_args(tmp.path(), &["--strict", "--format", "json"]))
        .output()
        .expect("rivet variant manifest");

    assert!(
        output.status.success(),
        "a present source base must not warn or fail, even under --strict. stderr: {}",
        String::from_utf8_lossy(&output.stderr)
    );
    let v: serde_json::Value = serde_json::from_slice(&output.stdout).expect("valid json");
    assert_eq!(
        v["source_warnings"].as_array().expect("array").len(),
        0,
        "no warnings expected for an existing base. json: {v}"
    );
}
