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

//! Integration tests for REQ-083: `rivet variant` commands accept a
//! `feature-model-binding` file in place of a plain feature model and
//! transparently compose the multi-file tree.
//!
//! rivet: verifies REQ-083

use std::process::Command;

fn rivet_bin() -> std::path::PathBuf {
    if let Ok(bin) = std::env::var("CARGO_BIN_EXE_rivet") {
        return std::path::PathBuf::from(bin);
    }
    let manifest = std::path::PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    let workspace_root = manifest.parent().expect("workspace root");
    workspace_root.join("target").join("debug").join("rivet")
}

/// Write a two-file composition (vehicle + powertrain sub-model) and a
/// binding that mounts powertrain under the `pwt` prefix. Returns the
/// temp dir (kept alive by the caller) and the binding-file path.
fn write_composition() -> (tempfile::TempDir, std::path::PathBuf) {
    let tmp = tempfile::tempdir().unwrap();
    let dir = tmp.path().to_path_buf();

    std::fs::write(
        dir.join("powertrain.yaml"),
        r#"kind: feature-model
root: powertrain
features:
  powertrain:
    group: alternative
    children: [four-wheel, two-wheel]
  four-wheel: { group: leaf }
  two-wheel: { group: leaf }
"#,
    )
    .unwrap();
    std::fs::write(
        dir.join("vehicle.yaml"),
        r#"kind: feature-model
root: vehicle
features:
  vehicle:
    group: mandatory
    children: [powertrain]
  powertrain:
    group: mandatory
"#,
    )
    .unwrap();
    let binding = dir.join("binding.yaml");
    std::fs::write(
        &binding,
        r#"kind: feature-model-binding
compose:
  - parent: vehicle.yaml
    mount:
      powertrain:
        model: powertrain.yaml
        prefix: pwt
"#,
    )
    .unwrap();
    (tmp, binding)
}

/// `rivet variant list --model <binding>` composes the multi-file model
/// and lists the sub-model's features under their mount prefix.
#[test]
fn variant_list_composes_multi_file_model() {
    let (_keep, binding) = write_composition();

    let out = Command::new(rivet_bin())
        .args(["variant", "list", "--model", binding.to_str().unwrap()])
        .output()
        .expect("rivet variant list");

    assert!(
        out.status.success(),
        "list of a composition binding must succeed. stderr: {}",
        String::from_utf8_lossy(&out.stderr)
    );
    let stdout = String::from_utf8_lossy(&out.stdout);
    assert!(stdout.contains("root: vehicle"), "stdout:\n{stdout}");
    // Sub-model features appear under the mount prefix.
    assert!(stdout.contains("pwt:powertrain"), "stdout:\n{stdout}");
    assert!(stdout.contains("pwt:four-wheel"), "stdout:\n{stdout}");
    assert!(stdout.contains("pwt:two-wheel"), "stdout:\n{stdout}");
}

/// `rivet variant solve` against a composition resolves a variant that
/// selects a prefixed sub-model feature.
#[test]
fn variant_solve_resolves_prefixed_selection() {
    let (_keep, binding) = write_composition();
    let dir = binding.parent().unwrap();
    let variant = dir.join("variant.yaml");
    std::fs::write(&variant, "name: four-wheeler\nselects: [pwt:four-wheel]\n").unwrap();

    let out = Command::new(rivet_bin())
        .args([
            "variant",
            "solve",
            "--model",
            binding.to_str().unwrap(),
            "--variant",
            variant.to_str().unwrap(),
        ])
        .output()
        .expect("rivet variant solve");

    assert!(
        out.status.success(),
        "solve of a composition must succeed. stderr: {}",
        String::from_utf8_lossy(&out.stderr)
    );
    let stdout = String::from_utf8_lossy(&out.stdout);
    assert!(
        stdout.contains("pwt:four-wheel"),
        "the prefixed selection must appear in the effective set. stdout:\n{stdout}"
    );
}

/// A binding with a missing sub-model file fails loudly (non-zero exit,
/// the missing path named) — never a silent skip.
#[test]
fn variant_list_broken_mount_fails_loudly() {
    let tmp = tempfile::tempdir().unwrap();
    let dir = tmp.path();
    std::fs::write(
        dir.join("vehicle.yaml"),
        r#"kind: feature-model
root: vehicle
features:
  vehicle:
    group: mandatory
    children: [powertrain]
  powertrain:
    group: mandatory
"#,
    )
    .unwrap();
    let binding = dir.join("binding.yaml");
    std::fs::write(
        &binding,
        r#"kind: feature-model-binding
compose:
  - parent: vehicle.yaml
    mount:
      powertrain:
        model: nonexistent.yaml
        prefix: pwt
"#,
    )
    .unwrap();

    let out = Command::new(rivet_bin())
        .args(["variant", "list", "--model", binding.to_str().unwrap()])
        .output()
        .expect("rivet variant list");

    assert!(
        !out.status.success(),
        "a binding with a missing sub-model file must fail"
    );
    let stderr = String::from_utf8_lossy(&out.stderr);
    assert!(
        stderr.contains("nonexistent.yaml"),
        "the error must name the missing file. stderr:\n{stderr}"
    );
}

/// REQ-085 v2: `rivet variant list --model <binding>` resolves mounts
/// of the form `<external-prefix>:<inner-path>` against the consumer's
/// `rivet.yaml` externals — so a cross-repo feature-model mount works
/// end-to-end through the CLI, riding the existing `rivet sync` /
/// `externals:` plumbing without any binding-side git config.
///
/// rivet: verifies REQ-085
#[test]
fn variant_list_resolves_cross_repo_mount_via_rivet_yaml_externals() {
    let tmp = tempfile::tempdir().unwrap();
    let consumer = tmp.path().join("consumer");
    let ext = tmp.path().join("externals").join("pwt-fake");
    std::fs::create_dir_all(consumer.join("artifacts")).unwrap();
    std::fs::create_dir_all(&ext).unwrap();

    // External: minimal rivet.yaml + the feature-model file that the
    // consumer's binding will mount via the `pwt` prefix.
    std::fs::write(
        ext.join("rivet.yaml"),
        r#"project:
  name: pwt-external
  version: "0.1.0"
  schemas: [common]
"#,
    )
    .unwrap();
    std::fs::write(
        ext.join("powertrain.yaml"),
        r#"kind: feature-model
root: powertrain
features:
  powertrain:
    group: alternative
    children: [four-wheel, two-wheel]
  four-wheel: { group: leaf }
  two-wheel: { group: leaf }
"#,
    )
    .unwrap();

    // Consumer: rivet.yaml declares the `pwt` external via `path:`,
    // top model, and a binding mounting `pwt:powertrain.yaml`.
    std::fs::write(
        consumer.join("rivet.yaml"),
        format!(
            r#"project:
  name: consumer
  version: "0.1.0"
  schemas: [common]
sources: [{{ path: artifacts, format: generic-yaml }}]
externals:
  pwt:
    path: {}
    prefix: pwt
"#,
            ext.display()
        ),
    )
    .unwrap();
    std::fs::write(
        consumer.join("vehicle.yaml"),
        r#"kind: feature-model
root: vehicle
features:
  vehicle:
    group: mandatory
    children: [powertrain]
  powertrain:
    group: mandatory
"#,
    )
    .unwrap();
    let binding = consumer.join("binding.yaml");
    std::fs::write(
        &binding,
        r#"kind: feature-model-binding
compose:
  - parent: vehicle.yaml
    mount:
      powertrain:
        model: pwt:powertrain.yaml
        prefix: pwt
"#,
    )
    .unwrap();

    let out = Command::new(rivet_bin())
        .args(["variant", "list", "--model", binding.to_str().unwrap()])
        .current_dir(&consumer)
        .output()
        .expect("rivet variant list");

    assert!(
        out.status.success(),
        "list of a cross-repo binding must succeed. stderr: {}",
        String::from_utf8_lossy(&out.stderr)
    );
    let stdout = String::from_utf8_lossy(&out.stdout);
    assert!(stdout.contains("pwt:powertrain"), "stdout:\n{stdout}");
    assert!(stdout.contains("pwt:four-wheel"), "stdout:\n{stdout}");
    assert!(stdout.contains("pwt:two-wheel"), "stdout:\n{stdout}");
}
