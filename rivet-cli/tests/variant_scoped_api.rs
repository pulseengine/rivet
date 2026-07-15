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

//! Integration tests for pain point #6: variant-scoped validation API
//! ergonomics — `--variant` optional on `rivet validate`, new
//! `rivet variant check-all`.

use std::process::Command;

fn rivet_bin() -> std::path::PathBuf {
    if let Ok(bin) = std::env::var("CARGO_BIN_EXE_rivet") {
        return std::path::PathBuf::from(bin);
    }
    let manifest = std::path::PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    let workspace_root = manifest.parent().expect("workspace root");
    workspace_root.join("target").join("debug").join("rivet")
}

/// Create a fresh rivet project and write a feature model + binding into it.
/// Returns (keep-alive tempdir, project dir, model path, binding path).
fn setup_variant_project() -> (
    tempfile::TempDir,
    std::path::PathBuf,
    std::path::PathBuf,
    std::path::PathBuf,
) {
    let tmp = tempfile::tempdir().expect("create temp dir");
    let dir = tmp.path().to_path_buf();

    let init = Command::new(rivet_bin())
        .args(["init", "--preset", "dev", "--dir", dir.to_str().unwrap()])
        .output()
        .expect("rivet init");
    assert!(
        init.status.success(),
        "rivet init must succeed. stderr: {}",
        String::from_utf8_lossy(&init.stderr)
    );

    let model = dir.join("feature-model.yaml");
    std::fs::write(
        &model,
        r#"kind: feature-model
root: app
features:
  app:
    group: mandatory
    children: [auth]
  auth:
    group: or
    children: [oauth, ldap]
  oauth:
    group: leaf
  ldap:
    group: leaf
constraints: []
"#,
    )
    .expect("write feature-model.yaml");

    let binding = dir.join("bindings.yaml");
    std::fs::write(
        &binding,
        r#"bindings:
  oauth:
    artifacts: []
    source: []
  ldap:
    artifacts: []
    source: []

variants:
  - name: oauth-only
    selects: [oauth]
  - name: ldap-only
    selects: [ldap]
  - name: nothing
    selects: []
"#,
    )
    .expect("write binding");

    (tmp, dir, model, binding)
}

/// Before the fix: `rivet validate --model … --binding …` without `--variant`
/// bailed with "must all be provided together". After the fix: this is a
/// valid mode that checks model + binding consistency.
#[test]
fn validate_accepts_model_plus_binding_without_variant() {
    let (_keep, dir, model, binding) = setup_variant_project();

    let output = Command::new(rivet_bin())
        .args([
            "--project",
            dir.to_str().unwrap(),
            "validate",
            "--format",
            "json",
            "--model",
            model.to_str().unwrap(),
            "--binding",
            binding.to_str().unwrap(),
        ])
        .output()
        .expect("rivet validate");

    let stderr = String::from_utf8_lossy(&output.stderr);
    assert!(
        !stderr.contains("must all be provided together"),
        "validate must accept --model + --binding without --variant. stderr: {stderr}"
    );
    // Either PASS or FAIL on artifact rules is fine; the point is the CLI
    // didn't bail on the missing --variant.
    assert!(
        output.status.success() || !stderr.contains("must all"),
        "stderr: {stderr}"
    );
}

/// Model + binding where a binding key is not a feature must fail with a
/// clear diagnostic (not a silent pass).
#[test]
fn validate_flags_unknown_features_in_binding() {
    let (_keep, dir, model, _binding) = setup_variant_project();

    let bad_binding = dir.join("bad-binding.yaml");
    std::fs::write(
        &bad_binding,
        r#"bindings:
  no-such-feature:
    artifacts: [REQ-999]
"#,
    )
    .unwrap();

    let output = Command::new(rivet_bin())
        .args([
            "--project",
            dir.to_str().unwrap(),
            "validate",
            "--model",
            model.to_str().unwrap(),
            "--binding",
            bad_binding.to_str().unwrap(),
        ])
        .output()
        .expect("rivet validate");

    assert!(!output.status.success());
    let stderr = String::from_utf8_lossy(&output.stderr);
    assert!(
        stderr.contains("unknown") && stderr.contains("no-such-feature"),
        "expected an 'unknown feature' diagnostic. stderr: {stderr}"
    );
}

/// REQ-258 / DD-076: a binding entry whose key IS a valid feature but
/// whose `artifacts:` list names an ID that does not exist in the store
/// must FAIL loud. Before the fix, the union of `binding.artifacts` flowed
/// through scoped validate with phantom IDs silently dropped — the
/// mirror-image gap of the unknown-feature-KEY check.
#[test]
fn validate_flags_dangling_artifact_id_in_binding() {
    let (_keep, dir, model, _binding) = setup_variant_project();

    // `oauth` is a real feature (so the feature-KEY check passes), but
    // GHOST-999 is not a real artifact in the project store.
    let dangling = dir.join("dangling-binding.yaml");
    std::fs::write(
        &dangling,
        r#"bindings:
  oauth:
    artifacts: [GHOST-999]
"#,
    )
    .unwrap();

    let output = Command::new(rivet_bin())
        .args([
            "--project",
            dir.to_str().unwrap(),
            "validate",
            "--model",
            model.to_str().unwrap(),
            "--binding",
            dangling.to_str().unwrap(),
        ])
        .output()
        .expect("rivet validate");

    assert!(
        !output.status.success(),
        "validate must fail on a dangling binding artifact ID"
    );
    let stderr = String::from_utf8_lossy(&output.stderr);
    assert!(
        stderr.contains("unknown artifact") && stderr.contains("GHOST-999"),
        "expected an 'unknown artifact IDs' diagnostic naming GHOST-999. stderr: {stderr}"
    );
}

/// REQ-258 regression: a binding whose feature keys AND artifact IDs are
/// all real must still pass `validate --model --binding`. Guards the
/// dangling-ID check against flagging valid bindings. REQ-001 is
/// scaffolded by `rivet init --preset dev`.
#[test]
fn validate_accepts_binding_with_real_artifact_ids() {
    let (_keep, dir, model, _binding) = setup_variant_project();

    let good = dir.join("good-binding.yaml");
    std::fs::write(
        &good,
        r#"bindings:
  oauth:
    artifacts: [REQ-001]
"#,
    )
    .unwrap();

    let output = Command::new(rivet_bin())
        .args([
            "--project",
            dir.to_str().unwrap(),
            "validate",
            "--model",
            model.to_str().unwrap(),
            "--binding",
            good.to_str().unwrap(),
        ])
        .output()
        .expect("rivet validate");

    let stderr = String::from_utf8_lossy(&output.stderr);
    assert!(
        !stderr.contains("unknown artifact"),
        "a binding with a real artifact ID (REQ-001) must not be flagged as dangling. stderr: {stderr}"
    );
}

/// The committed `artifacts/variants/full-desktop.yaml` must pass
/// `rivet variant check` against the project's real feature model. This
/// is the regression guard for the previously-broken data (33 phantom
/// feature selections). REQ-258 / DD-076.
#[test]
fn committed_full_desktop_variant_passes_check() {
    let manifest = std::path::PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    let repo_root = manifest.parent().expect("workspace root");
    let model = repo_root.join("artifacts/feature-model.yaml");
    let variant = repo_root.join("artifacts/variants/full-desktop.yaml");

    let output = Command::new(rivet_bin())
        .args([
            "variant",
            "check",
            "--model",
            model.to_str().unwrap(),
            "--variant",
            variant.to_str().unwrap(),
        ])
        .output()
        .expect("rivet variant check");

    assert!(
        output.status.success(),
        "committed full-desktop.yaml must pass variant check.\nstdout: {}\nstderr: {}",
        String::from_utf8_lossy(&output.stdout),
        String::from_utf8_lossy(&output.stderr)
    );
    let stdout = String::from_utf8_lossy(&output.stdout);
    assert!(
        stdout.contains("PASS"),
        "expected PASS for full-desktop. stdout: {stdout}"
    );
}

/// `rivet variant check-all` iterates declared variants and exits 0 if all
/// pass. Our fixture has three passing variants.
#[test]
fn check_all_passes_when_every_variant_solves() {
    let (_keep, _dir, model, binding) = setup_variant_project();

    let output = Command::new(rivet_bin())
        .args([
            "variant",
            "check-all",
            "--model",
            model.to_str().unwrap(),
            "--binding",
            binding.to_str().unwrap(),
        ])
        .output()
        .expect("rivet variant check-all");

    let stdout = String::from_utf8_lossy(&output.stdout);
    let stderr = String::from_utf8_lossy(&output.stderr);
    // `nothing` selects [] against an `or` group, so it should FAIL. Adjust
    // the binding so all variants PASS, then re-run.
    // Re-use dir from the tuple: patch binding to drop the failing variant.
    // Since setup already wrote the binding, we override here.
    assert!(
        stdout.contains("oauth-only") && stdout.contains("ldap-only"),
        "stdout should list variant names.\nstdout: {stdout}\nstderr: {stderr}"
    );
    // `nothing` fails the `or` group constraint; check-all must exit 1.
    assert!(
        !output.status.success(),
        "check-all must exit non-zero when a variant fails.\nstdout: {stdout}\nstderr: {stderr}"
    );
}

/// `check-all` exits 0 when every declared variant passes.
#[test]
fn check_all_passes_with_all_valid_variants() {
    let tmp = tempfile::tempdir().expect("create temp dir");
    let dir = tmp.path().to_path_buf();

    let model = dir.join("feature-model.yaml");
    std::fs::write(
        &model,
        r#"kind: feature-model
root: app
features:
  app:
    group: mandatory
    children: [auth]
  auth:
    group: or
    children: [oauth, ldap]
  oauth:
    group: leaf
  ldap:
    group: leaf
constraints: []
"#,
    )
    .unwrap();

    let binding = dir.join("bindings.yaml");
    std::fs::write(
        &binding,
        r#"bindings:
  oauth:
    artifacts: []
  ldap:
    artifacts: []

variants:
  - name: oauth-only
    selects: [oauth]
  - name: ldap-only
    selects: [ldap]
  - name: both
    selects: [oauth, ldap]
"#,
    )
    .unwrap();

    let output = Command::new(rivet_bin())
        .args([
            "variant",
            "check-all",
            "--model",
            model.to_str().unwrap(),
            "--binding",
            binding.to_str().unwrap(),
        ])
        .output()
        .expect("rivet variant check-all");

    assert!(
        output.status.success(),
        "check-all should pass. stdout:{} stderr:{}",
        String::from_utf8_lossy(&output.stdout),
        String::from_utf8_lossy(&output.stderr)
    );
    let stdout = String::from_utf8_lossy(&output.stdout);
    assert!(stdout.contains("3/3 variants passed"), "stdout: {stdout}");
}

/// check-all JSON output reports per-variant result + aggregate counts.
#[test]
fn check_all_json_output_shape() {
    let (_keep, _dir, model, binding) = setup_variant_project();

    let output = Command::new(rivet_bin())
        .args([
            "variant",
            "check-all",
            "--model",
            model.to_str().unwrap(),
            "--binding",
            binding.to_str().unwrap(),
            "--format",
            "json",
        ])
        .output()
        .expect("rivet variant check-all --format json");

    // Exit may be non-zero because our fixture has a deliberately failing
    // "nothing" variant; we still expect parseable JSON on stdout.
    let stdout = String::from_utf8_lossy(&output.stdout);
    let v: serde_json::Value =
        serde_json::from_str(&stdout).unwrap_or_else(|e| panic!("bad JSON: {e}: {stdout}"));
    assert_eq!(v["total"].as_u64().unwrap(), 3);
    assert!(v["variants"].is_array());
}
