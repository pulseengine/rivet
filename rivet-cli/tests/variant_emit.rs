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

//! Integration tests for `rivet variant features / value / attr`.
//!
//! The unit tests in `rivet_core::variant_emit::tests` cover format
//! rendering against a hand-built model. These integration tests go
//! end-to-end through the CLI (parsing → loader → solver → emitter →
//! stdout/exit-code) on real YAML files, so a regression in any layer
//! is caught here.

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

/// Write a minimal model + variant to a temp dir and return (model, variant) paths.
fn write_fixture(dir: &std::path::Path) -> (std::path::PathBuf, std::path::PathBuf) {
    let model = dir.join("feature-model.yaml");
    fs::write(
        &model,
        r#"
root: rt
features:
  rt:
    group: mandatory
    children: [core, asil-c]
  core:
    group: leaf
    attributes:
      version: "1.2.3"
  asil-c:
    group: leaf
    attributes:
      asil-numeric: 3
      reqs: "fmea-dfa"
"#,
    )
    .unwrap();
    let variant = dir.join("prod.yaml");
    fs::write(
        &variant,
        r#"
name: prod
selects:
  - core
  - asil-c
"#,
    )
    .unwrap();
    (model, variant)
}

fn run_features(model: &std::path::Path, variant: &std::path::Path, fmt: &str) -> (bool, String) {
    let output = Command::new(rivet_bin())
        .args([
            "variant",
            "features",
            "--model",
            model.to_str().unwrap(),
            "--variant",
            variant.to_str().unwrap(),
            "--format",
            fmt,
        ])
        .output()
        .expect("rivet variant features");
    (
        output.status.success(),
        String::from_utf8_lossy(&output.stdout).into_owned(),
    )
}

#[test]
fn features_env_end_to_end() {
    let tmp = tempfile::tempdir().unwrap();
    let (m, v) = write_fixture(tmp.path());
    let (ok, out) = run_features(&m, &v, "env");
    assert!(ok);
    assert!(out.contains("export RIVET_FEATURE_ASIL_C=1"));
    assert!(out.contains("export RIVET_ATTR_ASIL_C_ASIL_NUMERIC='3'"));
}

#[test]
fn features_cargo_end_to_end() {
    let tmp = tempfile::tempdir().unwrap();
    let (m, v) = write_fixture(tmp.path());
    let (ok, out) = run_features(&m, &v, "cargo");
    assert!(ok);
    assert!(out.contains("cargo:rustc-env=RIVET_VARIANT=prod"));
    assert!(out.contains("cargo:rustc-cfg=rivet_feature=\"asil-c\""));
}

#[test]
fn features_cmake_end_to_end() {
    let tmp = tempfile::tempdir().unwrap();
    let (m, v) = write_fixture(tmp.path());
    let (ok, out) = run_features(&m, &v, "cmake");
    assert!(ok);
    assert!(out.contains("set(RIVET_FEATURE_ASIL_C ON)"));
    assert!(out.contains("add_compile_definitions("));
}

#[test]
fn features_cpp_header_end_to_end() {
    let tmp = tempfile::tempdir().unwrap();
    let (m, v) = write_fixture(tmp.path());
    let (ok, out) = run_features(&m, &v, "cpp-header");
    assert!(ok);
    assert!(out.contains("#ifndef RIVET_VARIANT_H"));
    assert!(out.contains("#define RIVET_ATTR_ASIL_C_REQS \"fmea-dfa\""));
}

#[test]
fn features_bazel_end_to_end() {
    let tmp = tempfile::tempdir().unwrap();
    let (m, v) = write_fixture(tmp.path());
    let (ok, out) = run_features(&m, &v, "bazel");
    assert!(ok);
    assert!(out.contains("RIVET_ATTRS = {"));
    assert!(out.contains("\"asil-c\":"));
}

#[test]
fn features_make_end_to_end() {
    let tmp = tempfile::tempdir().unwrap();
    let (m, v) = write_fixture(tmp.path());
    let (ok, out) = run_features(&m, &v, "make");
    assert!(ok);
    assert!(out.contains("RIVET_VARIANT := prod"));
    assert!(out.contains("RIVET_ATTR_ASIL_C_ASIL_NUMERIC := 3"));
}

#[test]
fn features_json_end_to_end() {
    let tmp = tempfile::tempdir().unwrap();
    let (m, v) = write_fixture(tmp.path());
    let (ok, out) = run_features(&m, &v, "json");
    assert!(ok);
    let parsed: serde_json::Value = serde_json::from_str(&out).unwrap();
    assert_eq!(parsed["variant"], "prod");
    assert_eq!(parsed["attributes"]["asil-c"]["asil-numeric"], 3);
}

#[test]
fn features_loud_on_constraint_violation() {
    let tmp = tempfile::tempdir().unwrap();
    // Hand-rolled model with an alternative group; variant violates XOR
    let model = tmp.path().join("feature-model.yaml");
    fs::write(
        &model,
        r#"
root: rt
features:
  rt:
    group: mandatory
    children: [lvl]
  lvl:
    group: alternative
    children: [a, b]
  a: { group: leaf }
  b: { group: leaf }
"#,
    )
    .unwrap();
    let variant = tmp.path().join("bad.yaml");
    fs::write(&variant, "name: bad\nselects:\n  - a\n  - b\n").unwrap();

    let output = Command::new(rivet_bin())
        .args([
            "variant",
            "features",
            "--model",
            model.to_str().unwrap(),
            "--variant",
            variant.to_str().unwrap(),
            "--format",
            "env",
        ])
        .output()
        .expect("rivet variant features");

    assert!(!output.status.success(), "must exit non-zero");
    let stderr = String::from_utf8_lossy(&output.stderr);
    assert!(stderr.contains("constraint check"), "stderr: {stderr}");
}

#[test]
fn value_selected_and_unselected() {
    let tmp = tempfile::tempdir().unwrap();
    let (m, v) = write_fixture(tmp.path());

    let yes = Command::new(rivet_bin())
        .args([
            "variant",
            "value",
            "--model",
            m.to_str().unwrap(),
            "--variant",
            v.to_str().unwrap(),
            "asil-c",
        ])
        .output()
        .unwrap();
    assert!(yes.status.success());
    assert!(String::from_utf8_lossy(&yes.stdout).trim() == "on");

    // Feature exists in model but won't be selected unless listed
    let model_only = tmp.path().join("model-only.yaml");
    fs::write(
        &model_only,
        r#"
root: rt
features:
  rt: { group: optional, children: [a, b] }
  a: { group: leaf }
  b: { group: leaf }
"#,
    )
    .unwrap();
    let var_a = tmp.path().join("var-a.yaml");
    fs::write(&var_a, "name: va\nselects:\n  - a\n").unwrap();
    let no = Command::new(rivet_bin())
        .args([
            "variant",
            "value",
            "--model",
            model_only.to_str().unwrap(),
            "--variant",
            var_a.to_str().unwrap(),
            "b",
        ])
        .output()
        .unwrap();
    assert_eq!(no.status.code(), Some(1));
    assert!(String::from_utf8_lossy(&no.stdout).trim() == "off");
}

#[test]
fn value_unknown_feature_exits_two() {
    let tmp = tempfile::tempdir().unwrap();
    let (m, v) = write_fixture(tmp.path());
    let out = Command::new(rivet_bin())
        .args([
            "variant",
            "value",
            "--model",
            m.to_str().unwrap(),
            "--variant",
            v.to_str().unwrap(),
            "does-not-exist",
        ])
        .output()
        .unwrap();
    assert_eq!(out.status.code(), Some(2));
}

#[test]
fn explain_single_feature_shows_origin_and_attrs() {
    let tmp = tempfile::tempdir().unwrap();
    let (m, v) = write_fixture(tmp.path());
    let out = Command::new(rivet_bin())
        .args([
            "variant",
            "explain",
            "--model",
            m.to_str().unwrap(),
            "--variant",
            v.to_str().unwrap(),
            "asil-c",
        ])
        .output()
        .unwrap();
    assert!(out.status.success());
    let stdout = String::from_utf8_lossy(&out.stdout);
    assert!(stdout.contains("Feature: asil-c"));
    assert!(stdout.contains("selected in variant `prod`: true"));
    assert!(stdout.contains("user-selected via `selects:`"));
    assert!(stdout.contains("asil-numeric = 3"));
    assert!(stdout.contains("reqs = \"fmea-dfa\""));
}

#[test]
fn explain_single_feature_json_mode() {
    let tmp = tempfile::tempdir().unwrap();
    let (m, v) = write_fixture(tmp.path());
    let out = Command::new(rivet_bin())
        .args([
            "variant",
            "explain",
            "--model",
            m.to_str().unwrap(),
            "--variant",
            v.to_str().unwrap(),
            "--format",
            "json",
            "asil-c",
        ])
        .output()
        .unwrap();
    assert!(out.status.success());
    let v: serde_json::Value = serde_json::from_str(&String::from_utf8_lossy(&out.stdout)).unwrap();
    assert_eq!(v["feature"], "asil-c");
    assert_eq!(v["selected"], true);
    assert_eq!(v["origin"]["kind"], "selected");
    assert_eq!(v["attributes"]["asil-numeric"], 3);
}

#[test]
fn explain_full_variant_audit_lists_origins_and_unselected() {
    let tmp = tempfile::tempdir().unwrap();
    // Model with an optional feature so we get both selected and unselected
    let model = tmp.path().join("feature-model.yaml");
    fs::write(
        &model,
        r#"
root: rt
features:
  rt: { group: optional, children: [a, b, c] }
  a: { group: leaf }
  b: { group: leaf }
  c: { group: leaf }
"#,
    )
    .unwrap();
    let variant = tmp.path().join("v.yaml");
    fs::write(&variant, "name: v\nselects:\n  - a\n").unwrap();

    let out = Command::new(rivet_bin())
        .args([
            "variant",
            "explain",
            "--model",
            model.to_str().unwrap(),
            "--variant",
            variant.to_str().unwrap(),
        ])
        .output()
        .unwrap();
    assert!(out.status.success());
    let stdout = String::from_utf8_lossy(&out.stdout);
    assert!(stdout.contains("Variant audit: `v`"));
    assert!(stdout.contains("Effective features"));
    assert!(stdout.contains("+ a"));
    assert!(stdout.contains("Unselected features"));
    assert!(stdout.contains("- b"));
    assert!(stdout.contains("- c"));
}

/// Smoke every formatter against the shipped examples/variant/ fixture.
/// Catches regressions where a format change works on a toy model but
/// breaks on a realistic one (constraint-driven inclusion, multiple
/// attribute types per feature, non-trivial tree depth).
#[test]
fn every_format_renders_realistic_example() {
    let manifest = std::path::PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    let workspace_root = manifest.parent().expect("workspace root");
    let model = workspace_root.join("examples/variant/feature-model.yaml");
    let variant = workspace_root.join("examples/variant/eu-adas-c.yaml");
    if !model.exists() || !variant.exists() {
        // Keep this test silent if the examples dir is stripped from
        // a release tarball — real users run it against the repo.
        return;
    }
    for fmt in [
        "json",
        "env",
        "cargo",
        "cmake",
        "cpp-header",
        "bazel",
        "make",
    ] {
        let out = Command::new(rivet_bin())
            .args([
                "variant",
                "features",
                "--model",
                model.to_str().unwrap(),
                "--variant",
                variant.to_str().unwrap(),
                "--format",
                fmt,
            ])
            .output()
            .unwrap_or_else(|e| panic!("rivet variant features --format {fmt}: {e}"));
        assert!(
            out.status.success(),
            "--format {fmt} failed: stderr={}",
            String::from_utf8_lossy(&out.stderr)
        );
        let stdout = String::from_utf8_lossy(&out.stdout);
        // Every format should mention the variant name and ASIL-C
        // (the headline feature from the example).
        assert!(
            stdout.contains("eu-adas-c"),
            "--format {fmt}: variant name missing in output:\n{stdout}"
        );
        let feature_markers = ["ASIL_C", "asil-c"];
        assert!(
            feature_markers.iter().any(|m| stdout.contains(m)),
            "--format {fmt}: no asil-c marker in output:\n{stdout}"
        );
    }
}

#[test]
fn attr_prints_scalar_and_errors_on_missing_key() {
    let tmp = tempfile::tempdir().unwrap();
    let (m, v) = write_fixture(tmp.path());

    let ok = Command::new(rivet_bin())
        .args([
            "variant",
            "attr",
            "--model",
            m.to_str().unwrap(),
            "--variant",
            v.to_str().unwrap(),
            "asil-c",
            "asil-numeric",
        ])
        .output()
        .unwrap();
    assert!(ok.status.success());
    assert_eq!(String::from_utf8_lossy(&ok.stdout).trim(), "3");

    let missing = Command::new(rivet_bin())
        .args([
            "variant",
            "attr",
            "--model",
            m.to_str().unwrap(),
            "--variant",
            v.to_str().unwrap(),
            "asil-c",
            "not-a-real-key",
        ])
        .output()
        .unwrap();
    assert_eq!(missing.status.code(), Some(2));
}
