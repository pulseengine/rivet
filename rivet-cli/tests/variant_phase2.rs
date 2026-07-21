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

//! Integration tests for issue #287 Phase 2:
//!
//! - `artifacts/variants/*.yaml` configs are loaded by the CLI.
//! - `rivet validate --variant <NAME>` honours the per-variant overlay.
//! - `rivet list --variant <NAME>` emits the merged fields view.
//! - `rivet query --sexpr ... --variant <NAME>` filters against the
//!   merged view (so `(= X "Y")` resolves under the overlay).
//! - Coverage stamps the active variant name in its output.

use std::process::Command;

fn rivet_bin() -> std::path::PathBuf {
    if let Ok(bin) = std::env::var("CARGO_BIN_EXE_rivet") {
        return std::path::PathBuf::from(bin);
    }
    let manifest = std::path::PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    let workspace_root = manifest.parent().expect("workspace root");
    workspace_root.join("target").join("debug").join("rivet")
}

/// Spin up a tiny rivet project with:
///   - schemas/requirement.yaml: a `requirement` type with a string
///     `max-temp-c` field constrained to {"70", "80", "100"}.
///   - rivet.yaml that loads schemas/ and artifacts/.
///   - artifacts/reqs.yaml: one requirement with a variant overlay.
///   - artifacts/variants/{auto,industrial}.yaml: two variant configs.
fn setup_phase2_project() -> (tempfile::TempDir, std::path::PathBuf) {
    let tmp = tempfile::tempdir().expect("create temp dir");
    let dir = tmp.path().to_path_buf();

    std::fs::create_dir_all(dir.join("schemas")).unwrap();
    std::fs::create_dir_all(dir.join("artifacts").join("variants")).unwrap();

    std::fs::write(
        dir.join("rivet.yaml"),
        r#"project:
  name: phase2-fixture
  version: "0.1.0"
  schemas:
    - thermal

sources:
  - path: artifacts
    format: generic-yaml
"#,
    )
    .unwrap();

    // Minimal local schema. `--schemas` points the CLI at our dir so we
    // do not rely on rivet's embedded schemas (which don't ship
    // `max-temp-c`).
    std::fs::write(
        dir.join("schemas").join("thermal.yaml"),
        r#"schema:
  name: thermal
  version: "0.1.0"
  description: Thermal envelope test schema

artifact-types:
  - name: requirement
    description: Thermal envelope requirement
    fields:
      - name: max-temp-c
        type: string
        required: true
        allowed-values: ["70", "80", "100"]
"#,
    )
    .unwrap();

    std::fs::write(
        dir.join("artifacts").join("reqs.yaml"),
        r#"artifacts:
  - id: REQ-THERMAL-01
    type: requirement
    title: Operating temperature envelope
    fields:
      max-temp-c: "80"
    fields-per-variant:
      industrial:
        max-temp-c: "100"
      consumer:
        # Out-of-set value: should warn under
        # `allowed-values-variant.consumer`.
        max-temp-c: "999"
"#,
    )
    .unwrap();

    std::fs::write(
        dir.join("artifacts")
            .join("variants")
            .join("industrial.yaml"),
        "name: industrial\nselects: []\n",
    )
    .unwrap();
    std::fs::write(
        dir.join("artifacts")
            .join("variants")
            .join("automotive.yaml"),
        "name: automotive\nselects: []\n",
    )
    .unwrap();

    (tmp, dir)
}

#[test]
fn validate_variant_overlay_flags_out_of_set_value_in_consumer_variant() {
    // `consumer` has an out-of-set value AND is not declared in
    // artifacts/variants/, so we expect two diagnostics:
    //   * allowed-values-variant.consumer (the value '999' violates the
    //     field's allowed-values),
    //   * variant-key-unknown            (consumer is not a known variant
    //     name).
    let (_keep, dir) = setup_phase2_project();
    let out = Command::new(rivet_bin())
        .args([
            "--project",
            dir.to_str().unwrap(),
            "--schemas",
            dir.join("schemas").to_str().unwrap(),
            "validate",
            "--format",
            "json",
            "--direct",
        ])
        .output()
        .expect("rivet validate");

    let stdout = String::from_utf8_lossy(&out.stdout);
    // The CLI's JSON diagnostic schema does not include the internal
    // `rule:` name; match on the user-facing message text instead.
    assert!(
        stdout.contains("(variant: consumer)") && stdout.contains("'999'"),
        "stdout should mention the consumer variant overlay's value \
         '999'. stdout: {stdout}"
    );
    assert!(
        stdout.contains("'consumer'") && stdout.contains("not declared"),
        "stdout should mention the unknown-variant-key diagnostic. \
         stdout: {stdout}"
    );
}

#[test]
fn validate_variant_overlay_passes_for_in_set_industrial_variant() {
    // Industrial has a value (100) in the allowed-values set AND the
    // variant name is declared. The overlay therefore contributes no
    // diagnostics for REQ-THERMAL-01 industrial.
    let (_keep, dir) = setup_phase2_project();
    let out = Command::new(rivet_bin())
        .args([
            "--project",
            dir.to_str().unwrap(),
            "--schemas",
            dir.join("schemas").to_str().unwrap(),
            "validate",
            "--variant",
            "industrial",
            "--format",
            "json",
            "--direct",
        ])
        .output()
        .expect("rivet validate");

    let stdout = String::from_utf8_lossy(&out.stdout);
    assert!(
        !stdout.contains("allowed-values-variant.industrial"),
        "industrial overlay must validate cleanly. stdout: {stdout}"
    );
}

#[test]
fn validate_strict_variants_promotes_unknown_key_to_error() {
    let (_keep, dir) = setup_phase2_project();
    let out = Command::new(rivet_bin())
        .args([
            "--project",
            dir.to_str().unwrap(),
            "--schemas",
            dir.join("schemas").to_str().unwrap(),
            "validate",
            "--strict-variants",
            "--format",
            "json",
            "--direct",
        ])
        .output()
        .expect("rivet validate");
    let stdout = String::from_utf8_lossy(&out.stdout);
    // Under --strict-variants the unknown-key diagnostic must be an
    // error. The CLI emits `severity: "error"` (lowercase) in JSON;
    // pair it with the unique-to-this-diagnostic message snippet to
    // avoid false positives from unrelated errors.
    let v: serde_json::Value =
        serde_json::from_str(&stdout).expect("validate --format json emits JSON");
    let diags = v["diagnostics"].as_array().expect("diagnostics array");
    let strict_err = diags.iter().any(|d| {
        d["severity"].as_str() == Some("error")
            && d["message"]
                .as_str()
                .is_some_and(|m| m.contains("fields-per-variant"))
    });
    assert!(
        strict_err,
        "expected unknown-variant-key at error severity under \
         --strict-variants. diagnostics: {diags:?}"
    );
}

#[test]
fn validate_unknown_variant_name_errors_with_list_of_known_names() {
    let (_keep, dir) = setup_phase2_project();
    let out = Command::new(rivet_bin())
        .args([
            "--project",
            dir.to_str().unwrap(),
            "--schemas",
            dir.join("schemas").to_str().unwrap(),
            "validate",
            "--variant",
            "no-such-variant",
            "--direct",
        ])
        .output()
        .expect("rivet validate");
    assert!(!out.status.success());
    let stderr = String::from_utf8_lossy(&out.stderr);
    assert!(
        stderr.contains("no-such-variant"),
        "stderr should name the bad argument. stderr: {stderr}"
    );
    assert!(
        stderr.contains("industrial") && stderr.contains("automotive"),
        "stderr should list available variants. stderr: {stderr}"
    );
}

#[test]
fn list_variant_emits_merged_fields_in_json() {
    let (_keep, dir) = setup_phase2_project();
    let out = Command::new(rivet_bin())
        .args([
            "--project",
            dir.to_str().unwrap(),
            "--schemas",
            dir.join("schemas").to_str().unwrap(),
            "list",
            "--variant",
            "industrial",
            "--format",
            "json",
        ])
        .output()
        .expect("rivet list");
    assert!(
        out.status.success(),
        "rivet list must succeed. stderr: {}",
        String::from_utf8_lossy(&out.stderr)
    );
    let stdout = String::from_utf8_lossy(&out.stdout);
    let v: serde_json::Value = serde_json::from_str(&stdout).expect("valid JSON");
    assert_eq!(v["variant"], "industrial");
    let arts = v["artifacts"].as_array().expect("artifacts array");
    let req = arts
        .iter()
        .find(|a| a["id"] == "REQ-THERMAL-01")
        .expect("REQ-THERMAL-01 in results");
    assert_eq!(
        req["fields"]["max-temp-c"], "100",
        "industrial overlay must promote max-temp-c to 100. got {req}"
    );
}

#[test]
fn query_variant_resolves_overlay_in_sexpr_filter() {
    let (_keep, dir) = setup_phase2_project();
    // The default value of max-temp-c is "80"; only with --variant
    // industrial does the field resolve to "100".
    let out = Command::new(rivet_bin())
        .args([
            "--project",
            dir.to_str().unwrap(),
            "--schemas",
            dir.join("schemas").to_str().unwrap(),
            "query",
            "--sexpr",
            r#"(= max-temp-c "100")"#,
            "--variant",
            "industrial",
            "--format",
            "ids",
        ])
        .output()
        .expect("rivet query");
    assert!(
        out.status.success(),
        "rivet query must succeed. stderr: {}",
        String::from_utf8_lossy(&out.stderr)
    );
    let stdout = String::from_utf8_lossy(&out.stdout);
    assert!(
        stdout.contains("REQ-THERMAL-01"),
        "industrial overlay must satisfy the filter. stdout: {stdout}"
    );

    // Sanity: same query without the variant must NOT match (the
    // default value is "80").
    let out_no_variant = Command::new(rivet_bin())
        .args([
            "--project",
            dir.to_str().unwrap(),
            "--schemas",
            dir.join("schemas").to_str().unwrap(),
            "query",
            "--sexpr",
            r#"(= max-temp-c "100")"#,
            "--format",
            "ids",
        ])
        .output()
        .expect("rivet query (no variant)");
    let no_var_stdout = String::from_utf8_lossy(&out_no_variant.stdout);
    assert!(
        !no_var_stdout.contains("REQ-THERMAL-01"),
        "without --variant the default value '80' should not match. \
         stdout: {no_var_stdout}"
    );
}

#[test]
fn coverage_stamps_variant_name_in_text_header() {
    let (_keep, dir) = setup_phase2_project();
    let out = Command::new(rivet_bin())
        .args([
            "--project",
            dir.to_str().unwrap(),
            "--schemas",
            dir.join("schemas").to_str().unwrap(),
            "coverage",
            "--variant",
            "industrial",
        ])
        .output()
        .expect("rivet coverage");
    assert!(
        out.status.success(),
        "coverage must succeed. stderr: {}",
        String::from_utf8_lossy(&out.stderr)
    );
    let stdout = String::from_utf8_lossy(&out.stdout);
    assert!(
        stdout.contains("Variant: industrial"),
        "coverage output must stamp the active variant. stdout: {stdout}"
    );
}

#[test]
fn coverage_stamps_variant_name_in_json() {
    let (_keep, dir) = setup_phase2_project();
    let out = Command::new(rivet_bin())
        .args([
            "--project",
            dir.to_str().unwrap(),
            "--schemas",
            dir.join("schemas").to_str().unwrap(),
            "coverage",
            "--variant",
            "industrial",
            "--format",
            "json",
        ])
        .output()
        .expect("rivet coverage");
    let stdout = String::from_utf8_lossy(&out.stdout);
    let v: serde_json::Value = serde_json::from_str(&stdout).expect("valid JSON");
    assert_eq!(v["variant"], "industrial");
}

/// REQ-265 slice (d): `rivet export --variant <NAME>` applies the per-variant
/// field overlay before export, so a variant-scoped compliance export needs no
/// hand-translation of IDs into an s-expr `--filter`. Mirrors
/// `query --variant`: the default `max-temp-c` is "80"; only under the
/// `industrial` variant does it resolve to "100".
#[test]
fn export_variant_applies_field_overlay() {
    let (_keep, dir) = setup_phase2_project();
    let out_file = dir.join("export-industrial.yaml");

    let out = Command::new(rivet_bin())
        .args([
            "--project",
            dir.to_str().unwrap(),
            "--schemas",
            dir.join("schemas").to_str().unwrap(),
            "export",
            "--format",
            "generic-yaml",
            "--output",
            out_file.to_str().unwrap(),
            "--variant",
            "industrial",
        ])
        .output()
        .expect("rivet export --variant");
    assert!(
        out.status.success(),
        "export --variant must succeed. stderr: {}",
        String::from_utf8_lossy(&out.stderr)
    );
    let exported = std::fs::read_to_string(&out_file).expect("read export");
    // The industrial overlay replaces the top-level max-temp-c "80" with
    // "100", so the default value "80" no longer appears anywhere (no variant
    // in the fixture uses 80). The generic-yaml export also round-trips the
    // `fields-per-variant` block, so "100" alone is not a discriminator.
    assert!(
        exported.contains("100"),
        "industrial overlay must put max-temp-c=100 in the export. got:\n{exported}"
    );
    assert!(
        !exported.contains("'80'") && !exported.contains(": 80"),
        "the default value 80 must be overwritten by the industrial overlay. got:\n{exported}"
    );

    // Without --variant, the top-level field keeps its default value "80".
    let out_default = dir.join("export-default.yaml");
    let out2 = Command::new(rivet_bin())
        .args([
            "--project",
            dir.to_str().unwrap(),
            "--schemas",
            dir.join("schemas").to_str().unwrap(),
            "export",
            "--format",
            "generic-yaml",
            "--output",
            out_default.to_str().unwrap(),
        ])
        .output()
        .expect("rivet export (no variant)");
    assert!(out2.status.success());
    let exported_default = std::fs::read_to_string(&out_default).expect("read default export");
    assert!(
        exported_default.contains("'80'") || exported_default.contains(": 80"),
        "without --variant the default max-temp-c=80 must be exported at top level. got:\n{exported_default}"
    );
}
