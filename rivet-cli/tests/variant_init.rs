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

//! Integration tests for `rivet variant init` scaffolder (pain point #3).
//!
//! The scaffolder writes a starter `feature-model.yaml` and
//! `bindings/<name>.yaml` with commented fields so users don't need to
//! reverse-engineer the schema. See `docs/feature-model-schema.md`.

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

#[test]
fn variant_init_creates_starter_files() {
    let tmp = tempfile::tempdir().expect("create temp dir");
    let dir = tmp.path();

    let output = Command::new(rivet_bin())
        .args(["variant", "init", "myapp", "--dir", dir.to_str().unwrap()])
        .output()
        .expect("rivet variant init");

    assert!(
        output.status.success(),
        "rivet variant init must succeed. stderr: {}",
        String::from_utf8_lossy(&output.stderr)
    );

    let fm = dir.join("feature-model.yaml");
    let bind = dir.join("bindings").join("myapp.yaml");
    assert!(fm.exists(), "feature-model.yaml not written");
    assert!(bind.exists(), "bindings/myapp.yaml not written");

    let fm_content = std::fs::read_to_string(&fm).unwrap();
    assert!(
        fm_content.contains("kind: feature-model"),
        "feature-model.yaml should declare `kind: feature-model`. got:\n{fm_content}"
    );
    assert!(
        fm_content.contains("group:"),
        "feature-model.yaml should document `group:` fields"
    );
    assert!(
        fm_content.contains("docs/feature-model-schema.md"),
        "feature-model.yaml should point at the schema reference"
    );

    let bind_content = std::fs::read_to_string(&bind).unwrap();
    assert!(
        bind_content.contains("variant:"),
        "bindings file should contain a `variant:` key"
    );
    assert!(
        bind_content.contains("bindings:"),
        "bindings file should contain a `bindings:` key"
    );
}

#[test]
fn variant_init_refuses_to_overwrite_without_force() {
    let tmp = tempfile::tempdir().expect("create temp dir");
    let dir = tmp.path();

    std::fs::write(dir.join("feature-model.yaml"), "pre-existing content").expect("seed file");

    let output = Command::new(rivet_bin())
        .args(["variant", "init", "myapp", "--dir", dir.to_str().unwrap()])
        .output()
        .expect("rivet variant init");

    assert!(
        !output.status.success(),
        "rivet variant init must refuse to overwrite without --force"
    );
    let stderr = String::from_utf8_lossy(&output.stderr);
    assert!(
        stderr.contains("refusing to overwrite") || stderr.contains("--force"),
        "stderr should mention --force. got: {stderr}"
    );

    // Original content must survive.
    let content = std::fs::read_to_string(dir.join("feature-model.yaml")).unwrap();
    assert_eq!(content, "pre-existing content");
}

#[test]
fn variant_init_scaffolds_valid_feature_model() {
    // The scaffolded feature-model.yaml must be loadable by rivet variant list
    // without parse errors — otherwise the docs example is broken and we'd
    // ship a starter template that fails on first use.
    let tmp = tempfile::tempdir().expect("create temp dir");
    let dir = tmp.path();

    let output = Command::new(rivet_bin())
        .args(["variant", "init", "myapp", "--dir", dir.to_str().unwrap()])
        .output()
        .expect("rivet variant init");
    assert!(output.status.success());

    let list = Command::new(rivet_bin())
        .args([
            "variant",
            "list",
            "--model",
            dir.join("feature-model.yaml").to_str().unwrap(),
        ])
        .output()
        .expect("rivet variant list");
    assert!(
        list.status.success(),
        "scaffolded feature-model.yaml must parse. stderr: {}",
        String::from_utf8_lossy(&list.stderr)
    );
}
