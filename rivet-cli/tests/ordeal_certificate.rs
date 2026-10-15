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

/// #1021: `rivet add --field 'produced-by={name: X, version: Y}'` on an
/// `ordeal-certificate` used to write `produced-by: "{name: X, version:
/// Y}"` — a quoted string literal — and `rivet validate` accepted it
/// because REQ-385's field-type-mismatch check covered only
/// boolean/numeric. This replays the body's repro and pins:
///   1. the written file carries a real YAML mapping, not a string;
///   2. `recheck.command` is reachable as a nested scalar (what consuming
///      rules read), not an opaque string;
///   3. a non-mapping value is refused with a legible error, not silently
///      stored.
///
/// rivet: verifies REQ-385
#[test]
fn add_coerces_mapping_declared_fields_from_the_cli() {
    use rivet_yaml::Value;

    let tmp = cert_project("artifacts: []\n");
    let project = tmp.path().to_str().unwrap();
    let target = tmp.path().join("artifacts").join("evidence.yaml");

    // The body's repro, condensed. One `--field` per mapping to cover the
    // three `type: mapping` fields on `ordeal-certificate`.
    let out = Command::new(rivet_bin())
        .args([
            "--project",
            project,
            "add",
            "--type",
            "ordeal-certificate",
            "--id",
            "OC-ADD-1",
            "--status",
            "verified",
            "--title",
            "mapping-coercion repro",
            "--file",
            target.to_str().unwrap(),
            "--field",
            "format=ordeal-cert/v1",
            "--field",
            "verdict=unsat",
            "--field",
            "produced-by={name: ordeal, version: 0.23.0}",
            "--field",
            "checked-by={name: ordeal-lrat, version: 0.23.0}",
            "--field",
            "attests-claim=x",
            "--field",
            "cnf-sha256=3f786850e387550fdab836ed7e6dc881de23001b8e6f5f9db38f3ba4a4f4a1a5",
            "--field",
            "proof-sha256=89e6c98d92887913cadf06b2adb97f26cde4849b4b1a3b7ec1cbb06cd261f4d9",
            "--field",
            "recheck={command: x, expect-exit: 0}",
        ])
        .output()
        .expect("run rivet add");
    assert!(
        out.status.success(),
        "add must succeed. stdout:\n{}\nstderr:\n{}",
        String::from_utf8_lossy(&out.stdout),
        String::from_utf8_lossy(&out.stderr)
    );

    // Parse the written file and verify every `type: mapping` field is a
    // real YAML mapping — not a quoted string literal of the flow syntax.
    let written = std::fs::read_to_string(&target).expect("read written file");
    let doc: Value = rivet_yaml::from_str(&written).expect("parse written file");
    let artifacts = doc
        .get("artifacts")
        .and_then(Value::as_sequence)
        .expect("artifacts: sequence present");
    let added = artifacts
        .iter()
        .find(|a| a.get("id").and_then(Value::as_str) == Some("OC-ADD-1"))
        .expect("OC-ADD-1 is in the file");
    let fields = added
        .get("fields")
        .and_then(Value::as_mapping)
        .expect("fields: mapping present");
    for key in ["produced-by", "checked-by", "recheck"] {
        let v = fields
            .get(key)
            .unwrap_or_else(|| panic!("field '{key}' present"));
        assert!(
            v.as_mapping().is_some(),
            "field '{key}' must be a real YAML mapping, not {v:?} — \
             on-disk form:\n{written}"
        );
    }
    // `recheck.command` is the specific nested scalar #1021 flagged as
    // unreachable when the parent was a string.
    let command = fields
        .get("recheck")
        .and_then(|v| v.get("command"))
        .and_then(Value::as_str);
    assert_eq!(
        command,
        Some("x"),
        "recheck.command must be reachable as a nested string"
    );

    // Validate the project the add produced — no field-type-mismatch, no
    // other blocker on the mapping fields.
    let v = run_validate(&tmp);
    let v_out = format!(
        "{}{}",
        String::from_utf8_lossy(&v.stdout),
        String::from_utf8_lossy(&v.stderr)
    );
    assert!(
        !v_out.contains("field-type-mismatch"),
        "no field-type-mismatch on the added artifact:\n{v_out}"
    );
}

/// A `--field` value that cannot parse as the declared type must be
/// refused up front with a legible error — never silently stored as a
/// quoted string, which was the whole shape of #1021.
///
/// rivet: verifies REQ-385
#[test]
fn add_refuses_a_non_mapping_value_for_a_mapping_declared_field() {
    let tmp = cert_project("artifacts: []\n");
    let project = tmp.path().to_str().unwrap();
    let target = tmp.path().join("artifacts").join("evidence.yaml");

    let out = Command::new(rivet_bin())
        .args([
            "--project",
            project,
            "add",
            "--type",
            "ordeal-certificate",
            "--id",
            "OC-ADD-BAD-1",
            "--status",
            "draft",
            "--title",
            "non-mapping refused",
            "--file",
            target.to_str().unwrap(),
            "--field",
            "format=ordeal-cert/v1",
            "--field",
            "verdict=unsat",
            "--field",
            "produced-by=just-a-string",
            "--field",
            "attests-claim=x",
        ])
        .output()
        .expect("run rivet add");
    let text = format!(
        "{}{}",
        String::from_utf8_lossy(&out.stdout),
        String::from_utf8_lossy(&out.stderr)
    );
    assert!(
        !out.status.success(),
        "add must refuse a non-mapping value for a mapping-declared field:\n{text}"
    );
    assert!(
        text.contains("produced-by") && text.contains("mapping"),
        "the error must name the field and the declared type:\n{text}"
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
