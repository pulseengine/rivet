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

fn rivet_bin() -> std::path::PathBuf {
    if let Ok(bin) = std::env::var("CARGO_BIN_EXE_rivet") {
        return std::path::PathBuf::from(bin);
    }
    let manifest = std::path::PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    let workspace_root = manifest.parent().expect("workspace root");
    workspace_root.join("target").join("debug").join("rivet")
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
