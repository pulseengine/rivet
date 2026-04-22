// SAFETY-REVIEW (SCRC Phase 1, DD-058): Integration test / bench code.
// Tests legitimately use unwrap/expect/panic/assert-indexing patterns
// because a test failure should panic with a clear stack. Blanket-allow
// the Phase 1 restriction lints at crate scope; real risk analysis for
// these lints is carried by production code in rivet-core/src and
// rivet-cli/src, not by the test harnesses.
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

//! Integration tests for pain point #8: `rivet variant solve` output
//! must distinguish user-selected features from ones added via
//! mandatory propagation or constraint implication. JSON output stays
//! backwards-compatible: `effective_features` + `feature_count` are
//! preserved, a new `origins` map is added alongside.

use std::process::Command;

fn rivet_bin() -> std::path::PathBuf {
    if let Ok(bin) = std::env::var("CARGO_BIN_EXE_rivet") {
        return std::path::PathBuf::from(bin);
    }
    let manifest = std::path::PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    let workspace_root = manifest.parent().expect("workspace root");
    workspace_root.join("target").join("debug").join("rivet")
}

fn write_model_and_variant() -> (
    tempfile::TempDir,
    std::path::PathBuf,
    std::path::PathBuf,
) {
    let tmp = tempfile::tempdir().unwrap();
    let dir = tmp.path().to_path_buf();

    let model = dir.join("feature-model.yaml");
    std::fs::write(
        &model,
        r#"kind: feature-model
root: app
features:
  app:
    group: mandatory
    children: [base, auth]
  base:
    group: leaf
  auth:
    group: optional
    children: [oauth, token-cache]
  oauth:
    group: leaf
  token-cache:
    group: leaf
constraints:
  - (implies oauth token-cache)
"#,
    )
    .unwrap();

    let variant = dir.join("variant.yaml");
    std::fs::write(
        &variant,
        r#"name: oauth-variant
selects: [auth, oauth]
"#,
    )
    .unwrap();

    (tmp, model, variant)
}

/// Text output must prefix each feature with `+` and label the origin
/// so the user can distinguish selected/mandatory/implied.
#[test]
fn variant_solve_text_output_labels_origins() {
    let (_keep, model, variant) = write_model_and_variant();

    let out = Command::new(rivet_bin())
        .args([
            "variant",
            "solve",
            "--model",
            model.to_str().unwrap(),
            "--variant",
            variant.to_str().unwrap(),
        ])
        .output()
        .expect("rivet variant solve");

    assert!(
        out.status.success(),
        "solve must succeed. stderr: {}",
        String::from_utf8_lossy(&out.stderr)
    );
    let stdout = String::from_utf8_lossy(&out.stdout);

    // Root + mandatory ancestor labeled as mandatory.
    assert!(
        stdout.contains("app") && stdout.contains("(mandatory)"),
        "root `app` must be labeled (mandatory). stdout:\n{stdout}"
    );
    assert!(
        stdout.contains("base") && stdout.lines().any(|l| l.contains("base") && l.contains("(mandatory)")),
        "base is a mandatory child of app. stdout:\n{stdout}"
    );
    // User-named features carry (selected).
    assert!(
        stdout.lines().any(|l| l.contains("oauth") && l.contains("(selected)")),
        "oauth is user-selected. stdout:\n{stdout}"
    );
    // Constraint-implied feature carries "implied by".
    assert!(
        stdout.lines().any(|l| l.contains("token-cache") && l.contains("implied by oauth")),
        "token-cache must be labeled `implied by oauth`. stdout:\n{stdout}"
    );
    // Prefix `+` per the pain-point spec.
    assert!(
        stdout.lines().any(|l| l.trim_start().starts_with("+ ")),
        "effective features should be prefixed with `+`. stdout:\n{stdout}"
    );
}

/// JSON output must stay backwards-compatible: legacy fields are still
/// present; `origins` is additive.
#[test]
fn variant_solve_json_output_is_backwards_compatible() {
    let (_keep, model, variant) = write_model_and_variant();

    let out = Command::new(rivet_bin())
        .args([
            "variant",
            "solve",
            "--model",
            model.to_str().unwrap(),
            "--variant",
            variant.to_str().unwrap(),
            "--format",
            "json",
        ])
        .output()
        .expect("rivet variant solve --format json");
    assert!(out.status.success());

    let stdout = String::from_utf8_lossy(&out.stdout);
    let v: serde_json::Value = serde_json::from_str(&stdout).expect("parse JSON");

    // Legacy fields preserved.
    assert!(v["variant"].as_str().is_some());
    assert!(v["effective_features"].is_array());
    assert!(v["feature_count"].is_number());

    // New field: origins map keyed by feature name, each with `kind`.
    let origins = v["origins"]
        .as_object()
        .expect("origins must be an object");
    assert!(!origins.is_empty());

    let token_cache = origins
        .get("token-cache")
        .expect("token-cache must have an origin");
    assert_eq!(token_cache["kind"], "implied");
    assert_eq!(token_cache["by"], "oauth");

    let oauth = origins.get("oauth").expect("oauth must have an origin");
    assert_eq!(oauth["kind"], "selected");

    let app = origins.get("app").expect("root must have an origin");
    assert_eq!(app["kind"], "mandatory");
}
