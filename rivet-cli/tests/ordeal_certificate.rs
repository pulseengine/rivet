// SAFETY-REVIEW (SCRC Phase 1, DD-058): Integration test / bench code.
// Tests legitimately use unwrap/expect/panic/assert-indexing patterns
// because a test failure should panic with a clear stack. Blanket-allow
// the Phase 1 restriction lints at crate scope; real risk analysis for
// these lints is carried by production code.
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

//! End-to-end `rivet validate` runs over `ordeal-certificate` fixture
//! projects (rivet#693 Part 2 / ordeal#67): the re-checked/pass case
//! exits 0, the never-re-checked and `*-ref` indirection cases fail
//! with legible diagnostics, and the docs topic is served.

// rivet: verifies REQ-277

use std::process::Command;

fn rivet_bin() -> std::path::PathBuf {
    if let Ok(bin) = std::env::var("CARGO_BIN_EXE_rivet") {
        return std::path::PathBuf::from(bin);
    }
    let manifest = std::path::PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    let workspace_root = manifest.parent().expect("workspace root");
    workspace_root.join("target").join("debug").join("rivet")
}

/// Build a tmpdir project loading the embedded `ordeal-certificate`
/// schema (plus common+dev) with the given artifacts file.
fn cert_project(artifacts_yaml: &str) -> tempfile::TempDir {
    let tmp = tempfile::tempdir().expect("create temp dir");
    let dir = tmp.path();

    std::fs::write(
        dir.join("rivet.yaml"),
        "project:\n  name: ordeal-cert-test\n  version: \"0.1.0\"\n  \
         schemas: [common, dev, ordeal-certificate]\nsources:\n  - path: artifacts\n    \
         format: generic-yaml\n",
    )
    .expect("write rivet.yaml");

    let artifacts_dir = dir.join("artifacts");
    std::fs::create_dir_all(&artifacts_dir).expect("artifacts dir");
    std::fs::write(artifacts_dir.join("certs.yaml"), artifacts_yaml).expect("write fixture");

    tmp
}

const RECHECKED_CERT: &str = r#"artifacts:
  - id: REQ-1
    type: requirement
    title: Variant tls+nomalloc must be rejected
    status: implemented
    description: Fail closed with a certificate.
  - id: FEAT-1
    type: feature
    title: Consistency decision for tls+nomalloc
    status: implemented
    links:
      - type: satisfies
        target: REQ-1
  - id: OC-1
    type: ordeal-certificate
    title: variant tls+nomalloc inconsistent with feature model
    status: verified
    fields:
      format: ordeal-cert/v1
      verdict: unsat
      produced-by: {name: ordeal, version: 0.17.0}
      checked-by: {name: ordeal-lrat, version: 0.17.0}
      attests-claim: variant-inconsistent
      cnf-sha256: 3f786850e387550fdab836ed7e6dc881de23001b8e6f5f9db38f3ba4a4f4a1a5
      proof-sha256: 89e6c98d92887913cadf06b2adb97f26cde4849b4b1a3b7ec1cbb06cd261f4d9
      recheck: {command: 'ordeal-lrat check problem.cnf proof.lrat', expect-exit: 0}
      verification-result: pass
    links:
      - type: attests-transform
        target: FEAT-1
      - type: verifies
        target: REQ-1
"#;

fn run_validate(tmp: &tempfile::TempDir) -> std::process::Output {
    Command::new(rivet_bin())
        .args(["--project", tmp.path().to_str().unwrap(), "validate"])
        .output()
        .expect("run rivet validate")
}

/// A re-checked (verification-result: pass) certificate validates clean:
/// exit 0, and its `verifies` link satisfies coverage.
#[test]
fn recheck_pass_certificate_validates_clean() {
    let tmp = cert_project(RECHECKED_CERT);
    let out = run_validate(&tmp);
    let stdout = String::from_utf8_lossy(&out.stdout);
    let stderr = String::from_utf8_lossy(&out.stderr);
    assert!(
        out.status.success(),
        "re-checked certificate project must validate.\nstdout:\n{stdout}\nstderr:\n{stderr}"
    );
}

/// Dropping the recorded recheck outcome flips the same project to a
/// failing validate: a never-re-checked certificate must not count as a
/// verification link.
#[test]
fn never_rechecked_certificate_fails_validate() {
    let fixture = RECHECKED_CERT.replace("      verification-result: pass\n", "");
    assert_ne!(fixture, RECHECKED_CERT, "fixture edit must apply");
    let tmp = cert_project(&fixture);
    let out = run_validate(&tmp);
    let stdout = String::from_utf8_lossy(&out.stdout);
    assert!(
        !out.status.success(),
        "never-re-checked certificate with a verifies link must fail validate.\nstdout:\n{stdout}"
    );
    assert!(
        stdout.contains("V-ordeal-cert-recheck-gates-verifies") || stdout.contains("never"),
        "diagnostic must name the recheck gate.\nstdout:\n{stdout}"
    );
}

/// `cnf-ref` indirection fails with the legible v1 inline-only boundary
/// error (mirroring ordeal's BundleError::Unsupported), not a mystery
/// deserialize failure.
#[test]
fn ref_indirection_fails_with_legible_unsupported_error() {
    let fixture = RECHECKED_CERT.replace(
        "      cnf-sha256: 3f786850e387550fdab836ed7e6dc881de23001b8e6f5f9db38f3ba4a4f4a1a5\n",
        "      cnf-sha256: 3f786850e387550fdab836ed7e6dc881de23001b8e6f5f9db38f3ba4a4f4a1a5\n      \
         cnf-ref: blobs/problem.cnf.zst\n",
    );
    assert_ne!(fixture, RECHECKED_CERT, "fixture edit must apply");
    let tmp = cert_project(&fixture);
    let out = run_validate(&tmp);
    let stdout = String::from_utf8_lossy(&out.stdout);
    assert!(
        !out.status.success(),
        "cnf-ref indirection must fail validate.\nstdout:\n{stdout}"
    );
    assert!(
        stdout.contains("unsupported") && stdout.contains("inline"),
        "the boundary error must be legible.\nstdout:\n{stdout}"
    );
}

/// The docs topic is served: `rivet docs schema/ordeal-certificate`
/// explains the shape, the SAT boundary, and the recheck contract.
#[test]
fn docs_topic_is_served() {
    let out = Command::new(rivet_bin())
        .args(["docs", "schema/ordeal-certificate"])
        .output()
        .expect("run rivet docs");
    let stdout = String::from_utf8_lossy(&out.stdout);
    assert!(out.status.success(), "docs topic must exist: {stdout}");
    for needle in [
        "ordeal-cert/v1",
        "SAT boundary",
        "recheck",
        "verification link",
    ] {
        assert!(
            stdout.contains(needle),
            "docs topic must mention `{needle}`:\n{stdout}"
        );
    }
}
