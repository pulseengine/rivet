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

//! CLI integration tests — exercise the `rivet` binary end-to-end.
//!
//! Uses `std::process::Command` to invoke the built binary and verify
//! stdout/stderr content and exit codes.

use std::process::Command;

/// Locate the `rivet` binary built by cargo.
fn rivet_bin() -> std::path::PathBuf {
    // `cargo test` sets CARGO_BIN_EXE_rivet` when the binary is declared
    // in Cargo.toml. Fall back to constructing the path manually.
    if let Ok(bin) = std::env::var("CARGO_BIN_EXE_rivet") {
        return std::path::PathBuf::from(bin);
    }
    // Construct path from CARGO_MANIFEST_DIR -> workspace target directory
    let manifest = std::path::PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    let workspace_root = manifest.parent().expect("workspace root");
    workspace_root.join("target").join("debug").join("rivet")
}

/// Project root (one level up from rivet-cli/).
fn project_root() -> std::path::PathBuf {
    std::path::PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .parent()
        .expect("workspace root")
        .to_path_buf()
}

// ── rivet docs ──────────────────────────────────────────────────────────

/// `rivet docs` (no args) lists all available topics.
#[test]
fn docs_list_topics() {
    let output = Command::new(rivet_bin())
        .args(["docs"])
        .output()
        .expect("failed to execute rivet docs");

    assert!(output.status.success(), "rivet docs must exit 0");

    let stdout = String::from_utf8_lossy(&output.stdout);
    assert!(
        stdout.contains("artifact-format"),
        "topic list must include 'artifact-format', got:\n{stdout}"
    );
    assert!(
        stdout.contains("rivet-yaml"),
        "topic list must include 'rivet-yaml', got:\n{stdout}"
    );
}

/// `rivet docs --list` explicitly lists all available topics.
#[test]
fn docs_list_flag() {
    let output = Command::new(rivet_bin())
        .args(["docs", "--list"])
        .output()
        .expect("failed to execute rivet docs --list");

    assert!(output.status.success(), "rivet docs --list must exit 0");

    let stdout = String::from_utf8_lossy(&output.stdout);
    assert!(
        stdout.contains("artifact-format"),
        "topic list must include 'artifact-format', got:\n{stdout}"
    );
    assert!(
        stdout.contains("rivet-yaml"),
        "topic list must include 'rivet-yaml', got:\n{stdout}"
    );
}

/// `rivet docs artifact-format` shows the topic content.
#[test]
fn docs_show_topic() {
    let output = Command::new(rivet_bin())
        .args(["docs", "artifact-format"])
        .output()
        .expect("failed to execute rivet docs artifact-format");

    assert!(
        output.status.success(),
        "rivet docs artifact-format must exit 0"
    );

    let stdout = String::from_utf8_lossy(&output.stdout);
    assert!(
        stdout.contains("Artifact YAML Format"),
        "topic content must include 'Artifact YAML Format', got:\n{stdout}"
    );
}

/// `rivet docs --grep verification` finds matches across documentation.
#[test]
fn docs_grep_finds_matches() {
    let output = Command::new(rivet_bin())
        .args(["docs", "--grep", "verification"])
        .output()
        .expect("failed to execute rivet docs --grep");

    assert!(output.status.success(), "rivet docs --grep must exit 0");

    let stdout = String::from_utf8_lossy(&output.stdout);
    assert!(
        stdout.contains("verification") || stdout.contains("Verification"),
        "grep output must contain 'verification', got:\n{stdout}"
    );
    // Should show match counts or individual matches
    assert!(
        stdout.contains("match"),
        "grep output must mention matches, got:\n{stdout}"
    );
}

/// `rivet docs --format json` produces valid JSON output.
#[test]
fn docs_list_json() {
    let output = Command::new(rivet_bin())
        .args(["docs", "--format", "json"])
        .output()
        .expect("failed to execute rivet docs --format json");

    assert!(
        output.status.success(),
        "rivet docs --format json must exit 0"
    );

    let stdout = String::from_utf8_lossy(&output.stdout);
    let parsed: serde_json::Value =
        serde_json::from_str(&stdout).expect("docs list JSON must be valid");

    assert_eq!(
        parsed.get("command").and_then(|v| v.as_str()),
        Some("docs-list"),
        "JSON envelope must have command 'docs-list'"
    );
    assert!(
        parsed.get("topics").and_then(|v| v.as_array()).is_some(),
        "JSON must contain a 'topics' array"
    );
}

/// `rivet docs --grep verification --format json` produces valid JSON with matches.
#[test]
fn docs_grep_json() {
    let output = Command::new(rivet_bin())
        .args(["docs", "--grep", "verification", "--format", "json"])
        .output()
        .expect("failed to execute rivet docs --grep --format json");

    assert!(output.status.success());

    let stdout = String::from_utf8_lossy(&output.stdout);
    let parsed: serde_json::Value = serde_json::from_str(&stdout).expect("grep JSON must be valid");

    assert_eq!(
        parsed.get("command").and_then(|v| v.as_str()),
        Some("docs-grep"),
    );
    assert!(
        parsed
            .get("match_count")
            .and_then(|v| v.as_u64())
            .unwrap_or(0)
            > 0,
        "grep must find at least one match for 'verification'"
    );
}

// ── rivet schema ────────────────────────────────────────────────────────

/// `rivet schema list` (run against the project) lists artifact types.
#[test]
fn schema_list() {
    let output = Command::new(rivet_bin())
        .args([
            "--project",
            project_root().to_str().unwrap(),
            "schema",
            "list",
        ])
        .output()
        .expect("failed to execute rivet schema list");

    assert!(
        output.status.success(),
        "rivet schema list must exit 0. stderr: {}",
        String::from_utf8_lossy(&output.stderr)
    );

    let stdout = String::from_utf8_lossy(&output.stdout);
    assert!(
        stdout.contains("Artifact types"),
        "schema list must contain 'Artifact types', got:\n{stdout}"
    );
}

/// `rivet schema list --format json` produces valid JSON with artifact_types.
#[test]
fn schema_list_json() {
    let output = Command::new(rivet_bin())
        .args([
            "--project",
            project_root().to_str().unwrap(),
            "schema",
            "list",
            "--format",
            "json",
        ])
        .output()
        .expect("failed to execute rivet schema list --format json");

    assert!(
        output.status.success(),
        "rivet schema list --format json must exit 0. stderr: {}",
        String::from_utf8_lossy(&output.stderr)
    );

    let stdout = String::from_utf8_lossy(&output.stdout);
    let parsed: serde_json::Value =
        serde_json::from_str(&stdout).expect("schema list JSON must be valid");

    assert_eq!(
        parsed.get("command").and_then(|v| v.as_str()),
        Some("schema-list"),
    );
    assert!(
        parsed
            .get("artifact_types")
            .and_then(|v| v.as_array())
            .is_some(),
        "JSON must contain 'artifact_types' array"
    );
    assert!(
        parsed.get("count").and_then(|v| v.as_u64()).unwrap_or(0) > 0,
        "schema list must report at least one type"
    );
}

/// REQ-213 / #510: `rivet schema presets` lists the declarable embedded
/// schemas — needs NO project (the user runs it before one exists) and must
/// include the standards that prompted the report.
#[test]
fn schema_presets_lists_declarable_standards_without_a_project() {
    // Deliberately run from a temp dir with no rivet.yaml.
    let tmp = tempfile::tempdir().expect("temp dir");
    let output = Command::new(rivet_bin())
        .args(["schema", "presets", "--format", "json"])
        .current_dir(tmp.path())
        .output()
        .expect("failed to execute rivet schema presets");

    assert!(
        output.status.success(),
        "rivet schema presets must exit 0 with no project. stderr: {}",
        String::from_utf8_lossy(&output.stderr)
    );

    let parsed: serde_json::Value =
        serde_json::from_slice(&output.stdout).expect("schema presets JSON must be valid");
    let presets = parsed
        .get("presets")
        .and_then(|v| v.as_array())
        .expect("presets array");
    let names: Vec<&str> = presets
        .iter()
        .filter_map(|p| p.get("name").and_then(|v| v.as_str()))
        .collect();
    for standard in ["do-178c", "iso-26262", "iec-61508", "en-50128", "common"] {
        assert!(
            names.contains(&standard),
            "schema presets must list '{standard}'; got {names:?}"
        );
    }
    // Each preset carries a version and a type count.
    for p in presets {
        assert!(p.get("version").and_then(|v| v.as_str()).is_some());
        assert!(p.get("types").and_then(|v| v.as_u64()).is_some());
    }
}

// ── rivet init ──────────────────────────────────────────────────────────

/// #431: `rivet init --vendor-schemas` writes the resolved built-in schemas
/// on-disk so validation is pinned against rivet upgrades (the loader prefers
/// `schemas/<name>.yaml` over the embedded copy), and is idempotent (won't
/// clobber an existing/edited schema file).
#[test]
fn init_vendor_schemas_pins_schemas_on_disk() {
    let tmp = tempfile::tempdir().expect("create temp dir");
    let dir = tmp.path();
    let dirs = dir.to_str().unwrap();

    let out = Command::new(rivet_bin())
        .args([
            "init",
            "--preset",
            "aspice",
            "--vendor-schemas",
            "--dir",
            dirs,
        ])
        .output()
        .expect("run rivet init --vendor-schemas");
    assert!(
        out.status.success(),
        "init --vendor-schemas must exit 0. stderr: {}",
        String::from_utf8_lossy(&out.stderr)
    );

    // The resolved set (common + aspice) must be written on-disk.
    let schemas_dir = dir.join("schemas");
    let common = schemas_dir.join("common.yaml");
    let aspice = schemas_dir.join("aspice.yaml");
    assert!(common.exists(), "common.yaml must be vendored");
    assert!(aspice.exists(), "aspice.yaml must be vendored");

    // validate must now resolve schemas from on-disk (pinned), not embedded.
    let val = Command::new(rivet_bin())
        .args(["--project", dirs, "validate"])
        .output()
        .expect("run rivet validate");
    let combined = format!(
        "{}{}",
        String::from_utf8_lossy(&val.stdout),
        String::from_utf8_lossy(&val.stderr)
    );
    assert!(
        combined.contains("on-disk"),
        "validate must report schemas resolved on-disk after vendoring; got:\n{combined}"
    );

    // Idempotent: a locally-edited schema must survive a re-vendor. `init`
    // refuses when rivet.yaml exists, so remove it (keeping schemas/) to let the
    // vendor path run again and exercise its exists-guard.
    std::fs::write(&common, "# locally edited sentinel\n").expect("edit vendored schema");
    std::fs::remove_file(dir.join("rivet.yaml")).expect("remove rivet.yaml");
    let out2 = Command::new(rivet_bin())
        .args([
            "init",
            "--preset",
            "aspice",
            "--vendor-schemas",
            "--dir",
            dirs,
        ])
        .output()
        .expect("re-run init --vendor-schemas");
    assert!(
        out2.status.success(),
        "re-run init must exit 0. stderr: {}",
        String::from_utf8_lossy(&out2.stderr)
    );
    let kept = std::fs::read_to_string(&common).expect("read vendored schema");
    assert!(
        kept.contains("locally edited sentinel"),
        "re-vendoring must not overwrite an existing schema file"
    );
}

/// `rivet init --preset stpa` creates rivet.yaml and artifacts in a temp dir.
#[test]
fn init_stpa_preset() {
    let tmp = tempfile::tempdir().expect("create temp dir");
    let dir = tmp.path();

    let output = Command::new(rivet_bin())
        .args(["init", "--preset", "stpa", "--dir", dir.to_str().unwrap()])
        .output()
        .expect("failed to execute rivet init");

    assert!(
        output.status.success(),
        "rivet init --preset stpa must exit 0. stderr: {}",
        String::from_utf8_lossy(&output.stderr)
    );

    // rivet.yaml must exist
    let config_path = dir.join("rivet.yaml");
    assert!(config_path.exists(), "rivet.yaml must be created");

    // Read and verify config content
    let config_content = std::fs::read_to_string(&config_path).expect("read rivet.yaml");
    assert!(
        config_content.contains("stpa"),
        "rivet.yaml must reference 'stpa' schema, got:\n{config_content}"
    );
    assert!(
        config_content.contains("common"),
        "rivet.yaml must reference 'common' schema"
    );

    // artifacts/ directory must exist with sample file
    let artifacts_dir = dir.join("artifacts");
    assert!(
        artifacts_dir.exists(),
        "artifacts/ directory must be created"
    );

    // Should have a safety.yaml sample file (STPA preset creates safety.yaml)
    let safety_path = artifacts_dir.join("safety.yaml");
    assert!(
        safety_path.exists(),
        "artifacts/safety.yaml must be created for stpa preset"
    );

    // docs/ directory should exist
    let docs_dir = dir.join("docs");
    assert!(docs_dir.exists(), "docs/ directory must be created");
}

/// `rivet init` with default preset creates a dev project.
#[test]
fn init_dev_preset() {
    let tmp = tempfile::tempdir().expect("create temp dir");
    let dir = tmp.path();

    let output = Command::new(rivet_bin())
        .args(["init", "--dir", dir.to_str().unwrap()])
        .output()
        .expect("failed to execute rivet init");

    assert!(
        output.status.success(),
        "rivet init must exit 0. stderr: {}",
        String::from_utf8_lossy(&output.stderr)
    );

    let config_path = dir.join("rivet.yaml");
    assert!(config_path.exists(), "rivet.yaml must be created");

    let config_content = std::fs::read_to_string(&config_path).expect("read rivet.yaml");
    assert!(
        config_content.contains("dev"),
        "default rivet.yaml must reference 'dev' schema"
    );

    // Should have requirements.yaml sample
    let req_path = dir.join("artifacts").join("requirements.yaml");
    assert!(
        req_path.exists(),
        "artifacts/requirements.yaml must be created for dev preset"
    );
}

/// Regression test for REQ-063: the four safety-critical industry-standard
/// presets (`do-178c`, `en-50128`, `iec-61508`, `iec-62304`) must produce
/// projects that `rivet validate` accepts.
///
/// Before the fix, `rivet init --preset iec-61508` exited 0 and wrote a
/// `rivet.yaml` naming a schema that was neither embedded in the binary nor
/// written to disk; the next `rivet validate` failed with
/// `Schema error: schema '<name>' not found on disk or as embedded schema`.
/// The fix embeds the four schemas in the binary alongside the working five.
///
/// This test is itself a mechanical oracle: it drives the real `rivet`
/// binary end-to-end (`init` then `validate`) and asserts both exit 0,
/// mirroring the `init_stpa_preset` pattern.
#[test]
fn init_safety_critical_presets_produce_validating_projects() {
    for preset in ["do-178c", "en-50128", "iec-61508", "iec-62304"] {
        let tmp = tempfile::tempdir().expect("create temp dir");
        let dir = tmp.path();

        // init must exit 0
        let init_out = Command::new(rivet_bin())
            .args(["init", "--preset", preset, "--dir", dir.to_str().unwrap()])
            .output()
            .expect("failed to execute rivet init");
        assert!(
            init_out.status.success(),
            "rivet init --preset {preset} must exit 0. stderr:\n{}",
            String::from_utf8_lossy(&init_out.stderr)
        );

        // rivet.yaml must reference the preset's schema
        let config_path = dir.join("rivet.yaml");
        assert!(
            config_path.exists(),
            "rivet.yaml must be created for {preset}"
        );

        // validate the freshly-initialized project — must exit 0 with no errors
        let validate_out = Command::new(rivet_bin())
            .args([
                "--project",
                dir.to_str().unwrap(),
                "validate",
                "--format",
                "json",
            ])
            .output()
            .expect("failed to execute rivet validate");
        assert!(
            validate_out.status.success(),
            "rivet validate must exit 0 for preset {preset}. stderr:\n{}",
            String::from_utf8_lossy(&validate_out.stderr)
        );

        let stdout = String::from_utf8_lossy(&validate_out.stdout);
        let parsed: serde_json::Value = serde_json::from_str(&stdout)
            .unwrap_or_else(|e| panic!("validate JSON must be valid for {preset}: {e}"));
        let errors = parsed.get("errors").and_then(|v| v.as_u64()).unwrap_or(999);
        assert_eq!(
            errors, 0,
            "freshly-initialized {preset} project must have 0 validation errors, got {errors}"
        );
    }
}

// ── rivet validate ──────────────────────────────────────────────────────

/// `rivet validate --format json` produces valid JSON with "command":"validate".
#[test]
fn validate_json() {
    let output = Command::new(rivet_bin())
        .args([
            "--project",
            project_root().to_str().unwrap(),
            "validate",
            "--format",
            "json",
        ])
        .output()
        .expect("failed to execute rivet validate --format json");

    // validate may exit non-zero if there are errors, but JSON output should
    // still be valid.
    let stdout = String::from_utf8_lossy(&output.stdout);
    let parsed: serde_json::Value =
        serde_json::from_str(&stdout).expect("validate JSON must be valid");

    assert_eq!(
        parsed.get("command").and_then(|v| v.as_str()),
        Some("validate"),
        "JSON envelope must have command 'validate'"
    );
    assert!(
        parsed
            .get("diagnostics")
            .and_then(|v| v.as_array())
            .is_some(),
        "JSON must contain a 'diagnostics' array"
    );
    // errors/warnings fields should be present
    assert!(
        parsed.get("errors").is_some(),
        "JSON must contain 'errors' count"
    );
    assert!(
        parsed.get("warnings").is_some(),
        "JSON must contain 'warnings' count"
    );
}

/// REQ-062 / F2: `rivet validate` must surface a malformed artifact file
/// as an Error diagnostic — not swallow it to a stderr log line under a
/// green PASS. A file with top-level `id:`/`type:` (an artifact written
/// without the `artifacts:` wrapper) must fail validation. A legitimate
/// non-artifact file (`bindings.yaml`) must NOT add an error (F2b).
///
/// rivet: verifies REQ-062
#[test]
fn validate_surfaces_parse_error_on_malformed_artifact_file() {
    let tmp = tempfile::tempdir().expect("create temp dir");
    let dir = tmp.path();

    let init = Command::new(rivet_bin())
        .args(["init", "--preset", "dev", "--dir", dir.to_str().unwrap()])
        .output()
        .expect("failed to execute rivet init");
    assert!(
        init.status.success(),
        "rivet init must exit 0. stderr: {}",
        String::from_utf8_lossy(&init.stderr)
    );

    // F2a: an artifact written WITHOUT the required `artifacts:` wrapper.
    std::fs::write(
        dir.join("artifacts").join("malformed.yaml"),
        "id: REQ-OOPS\ntype: requirement\ntitle: Forgot the artifacts wrapper\n",
    )
    .expect("write malformed.yaml");

    let out = Command::new(rivet_bin())
        .args([
            "--project",
            dir.to_str().unwrap(),
            "validate",
            "--format",
            "json",
        ])
        .output()
        .expect("failed to execute rivet validate");

    assert!(
        !out.status.success(),
        "validate must exit non-zero when an artifact file fails to parse"
    );
    let parsed: serde_json::Value =
        serde_json::from_slice(&out.stdout).expect("validate JSON must be valid");
    assert_eq!(
        parsed.get("result").and_then(|v| v.as_str()),
        Some("FAIL"),
        "result must be FAIL; got: {parsed}"
    );
    assert!(
        parsed.get("errors").and_then(|v| v.as_u64()).unwrap_or(0) >= 1,
        "errors must be >= 1; got: {parsed}"
    );
    let diags = parsed
        .get("diagnostics")
        .and_then(|v| v.as_array())
        .expect("diagnostics array");
    let parse_err = diags
        .iter()
        .find(|d| d.get("rule").and_then(|r| r.as_str()) == Some("artifact-parse-error"));
    let parse_err = parse_err.unwrap_or_else(|| {
        panic!("expected a diagnostic with rule 'artifact-parse-error'; got: {parsed}")
    });
    assert!(
        parse_err
            .get("message")
            .and_then(|m| m.as_str())
            .is_some_and(|m| m.contains("malformed.yaml")),
        "the artifact-parse-error message must name the malformed file; got: {parse_err}"
    );

    // F2b: a legitimate non-artifact file under the same source path must
    // NOT contribute an error. Capture the error count, add bindings.yaml,
    // and assert the count does not grow.
    let errors_before = parsed.get("errors").and_then(|v| v.as_u64()).unwrap_or(0);
    std::fs::write(
        dir.join("artifacts").join("bindings.yaml"),
        "bindings:\n  - feature: core\n    artifact: REQ-001\n",
    )
    .expect("write bindings.yaml");

    let out2 = Command::new(rivet_bin())
        .args([
            "--project",
            dir.to_str().unwrap(),
            "validate",
            "--format",
            "json",
        ])
        .output()
        .expect("failed to execute rivet validate (2)");
    let parsed2: serde_json::Value =
        serde_json::from_slice(&out2.stdout).expect("validate JSON (2) must be valid");
    assert_eq!(
        parsed2.get("errors").and_then(|v| v.as_u64()).unwrap_or(0),
        errors_before,
        "a legitimate non-artifact file (bindings.yaml) must not add an error; got: {parsed2}"
    );
}

/// #350 / #652 (REQ-237): the lifecycle completeness gap for an implemented
/// sw-req must NAME the verification types the author can attach. REQ-237's
/// goal (#350, "direct test -> sw-req link without full ASPICE chain") is
/// completed by #652, which made `unit-verification` /
/// `sw-integration-verification` reach `sw-req` via `verifies`. So the gap now
/// names all three directly-linkable verification types and no longer routes
/// through the `sw-detail-design` chain — the chain hint was the stopgap for
/// the pre-#652 schema where direct linking was impossible.
///
/// rivet: verifies REQ-237
#[test]
fn lifecycle_gap_names_the_aspice_verification_chain() {
    let tmp = tempfile::tempdir().expect("temp dir");
    let dir = tmp.path();
    let dirs = dir.to_str().unwrap();
    std::fs::create_dir_all(dir.join("artifacts")).unwrap();
    std::fs::write(
        dir.join("rivet.yaml"),
        "project:\n  name: p\n  schemas: [common, aspice]\n\
         sources:\n  - path: artifacts\n    format: generic-yaml\n",
    )
    .unwrap();
    // An implemented sw-req with an upstream link (so the gap lists specific
    // missing verification types rather than "no downstream artifacts").
    std::fs::write(
        dir.join("artifacts/a.yaml"),
        "artifacts:\n  \
         - id: SYS-001\n    type: system-req\n    title: sys\n    status: approved\n  \
         - id: SL-TR-003\n    type: sw-req\n    title: sw\n    status: implemented\n    \
             links:\n      - type: derives-from\n        target: SYS-001\n",
    )
    .unwrap();

    let out = Command::new(rivet_bin())
        .args(["--project", dirs, "validate"])
        .output()
        .expect("validate");
    // The gap hints are emitted on stderr alongside the gap list.
    let err = String::from_utf8_lossy(&out.stderr);
    // Post-#652 the hint names every directly-linkable verification type for the
    // sw-req, instead of routing through the design chain.
    assert!(
        err.contains("unit-verification")
            && err.contains("sw-integration-verification")
            && err.contains("sw-verification"),
        "the lifecycle gap must name the directly-linkable verification types for \
         the sw-req; stderr:\n{err}"
    );
}

/// #556 (REQ-236): `rivet check verification-evidence` flags a verification
/// step whose `cargo test <filter>` names a test that does not exist — the
/// silent-drift case (`cargo test typo` exits 0 with "0 passed", keeping the
/// requirement falsely `verified`). A step naming a real test passes; a
/// non-cargo step is ignored.
///
/// rivet: verifies REQ-236
#[test]
fn check_verification_evidence_flags_missing_named_test() {
    let tmp = tempfile::tempdir().expect("temp dir");
    let dir = tmp.path();
    let dirs = dir.to_str().unwrap();
    std::fs::create_dir_all(dir.join("artifacts")).unwrap();
    std::fs::create_dir_all(dir.join("src")).unwrap();
    std::fs::write(
        dir.join("rivet.yaml"),
        "project:\n  name: p\n  schemas: [common, dev]\n\
         sources:\n  - path: artifacts\n    format: generic-yaml\n",
    )
    .unwrap();
    std::fs::write(
        dir.join("src/lib.rs"),
        "#[test]\nfn real_relocation_test() { assert!(true); }\n",
    )
    .unwrap();
    std::fs::write(
        dir.join("artifacts/a.yaml"),
        "artifacts:\n  \
         - id: FV-001\n    type: requirement\n    title: v\n    status: implemented\n    \
             fields:\n      steps:\n        \
             - run: \"cargo test -p p real_relocation_test\"\n        \
             - run: \"cargo test -p p renamed_or_typod_test\"\n        \
             - run: \"make lint\"\n",
    )
    .unwrap();

    let out = Command::new(rivet_bin())
        .args([
            "--project",
            dirs,
            "check",
            "verification-evidence",
            "--format",
            "json",
        ])
        .output()
        .expect("check");
    assert!(
        !out.status.success(),
        "must exit non-zero when a named test is missing"
    );
    let v: serde_json::Value = serde_json::from_slice(&out.stdout).expect("json");
    // 2 cargo-test steps checked (the `make lint` step is ignored).
    assert_eq!(v["named_test_steps_checked"], 2);
    let missing: Vec<&str> = v["missing"]
        .as_array()
        .unwrap()
        .iter()
        .map(|m| m["filter"].as_str().unwrap())
        .collect();
    assert_eq!(missing, vec!["renamed_or_typod_test"]);
}

/// REQ-283: `rivet validate --strict` is compliance-gate mode — it promotes the
/// field-correctness lint rules (`allowed-values`: a value outside the schema
/// enum; `unknown-field`: a typo'd/undeclared field name) from Warning/Info to
/// ERROR, so the gate FAILS on them. The default run stays lenient (PASS), since
/// a project may carry pre-existing violations. Without this, `validate` PASS
/// proved link integrity + required-fields but said nothing about field values.
///
/// rivet: verifies REQ-283
#[test]
fn validate_strict_escalates_allowed_values_and_unknown_field_to_errors() {
    let tmp = tempfile::tempdir().expect("temp dir");
    let dir = tmp.path();
    let dirs = dir.to_str().unwrap();
    std::fs::create_dir_all(dir.join("artifacts")).unwrap();
    // `category` is an allowed-values enum field on the base `requirement` type.
    std::fs::write(
        dir.join("rivet.yaml"),
        "project:\n  name: p\n  schemas: [common, dev]\n\
         sources:\n  - path: artifacts\n    format: generic-yaml\n",
    )
    .unwrap();
    std::fs::write(
        dir.join("artifacts/a.yaml"),
        "artifacts:\n  \
         - id: REQ-1\n    type: requirement\n    title: t\n    status: draft\n    \
             fields:\n      category: banana\n      bogus_field: x\n",
    )
    .unwrap();

    // Default: lenient — the enum violation is a Warning, the unknown field Info.
    let out = Command::new(rivet_bin())
        .args(["--project", dirs, "validate"])
        .output()
        .expect("validate");
    assert!(
        out.status.success(),
        "default validate must PASS over an out-of-enum value + unknown field"
    );

    // --strict: both are promoted to Error → the gate FAILS.
    let strict = Command::new(rivet_bin())
        .args([
            "--project",
            dirs,
            "validate",
            "--strict",
            "--format",
            "json",
        ])
        .output()
        .expect("validate --strict");
    assert!(
        !strict.status.success(),
        "validate --strict must FAIL when a field value is out-of-enum or a field is unknown"
    );
    let v: serde_json::Value = serde_json::from_slice(&strict.stdout).expect("json");
    let empty = vec![];
    let rules: Vec<&str> = v["diagnostics"]
        .as_array()
        .unwrap_or(&empty)
        .iter()
        .filter(|d| d["severity"] == "error")
        .filter_map(|d| d["rule"].as_str())
        .collect();
    assert!(
        rules.contains(&"allowed-values"),
        "allowed-values must be an ERROR under --strict, got errors: {rules:?}"
    );
    assert!(
        rules.contains(&"unknown-field"),
        "unknown-field must be an ERROR under --strict, got errors: {rules:?}"
    );
}

/// REQ-280: a verification step that selects tests via a `cargo nextest run -E`
/// FILTERSET (`test(/regex/)`, set operators) must NOT be reported as a missing
/// test — the earlier parser leaked the filterset (quotes and all) as a bogus
/// positional substring filter, false-erroring against Ford's linc-mesh. Such a
/// step is reported as SKIPPED (not verified) and the check still exits 0.
///
/// rivet: verifies REQ-280
#[test]
fn check_verification_evidence_skips_nextest_filterset_not_errors() {
    let tmp = tempfile::tempdir().expect("temp dir");
    let dir = tmp.path();
    let dirs = dir.to_str().unwrap();
    std::fs::create_dir_all(dir.join("artifacts")).unwrap();
    std::fs::create_dir_all(dir.join("src")).unwrap();
    std::fs::write(
        dir.join("rivet.yaml"),
        "project:\n  name: p\n  schemas: [common, dev]\n\
         sources:\n  - path: artifacts\n    format: generic-yaml\n",
    )
    .unwrap();
    std::fs::write(
        dir.join("src/lib.rs"),
        "#[test]\nfn decode_message() { assert!(true); }\n",
    )
    .unwrap();
    // A filterset step (must be skipped, not errored) + a real positional step.
    std::fs::write(
        dir.join("artifacts/a.yaml"),
        "artifacts:\n  \
         - id: FV-001\n    type: requirement\n    title: v\n    status: implemented\n    \
             fields:\n      steps:\n        \
             - run: \"cargo nextest run -p p --lib -E 'test(/message::/)'\"\n        \
             - run: \"cargo test -p p decode_message\"\n",
    )
    .unwrap();

    let out = Command::new(rivet_bin())
        .args([
            "--project",
            dirs,
            "check",
            "verification-evidence",
            "--format",
            "json",
        ])
        .output()
        .expect("check");
    assert!(
        out.status.success(),
        "a nextest filterset must be skipped, not false-errored"
    );
    let v: serde_json::Value = serde_json::from_slice(&out.stdout).expect("json");
    assert_eq!(v["ok"], true);
    // The filterset step is not counted as a checked positional filter.
    assert_eq!(v["named_test_steps_checked"], 1);
    assert!(v["missing"].as_array().unwrap().is_empty());
    let skipped = v["skipped"].as_array().unwrap();
    assert_eq!(
        skipped.len(),
        1,
        "the filterset step is reported as skipped"
    );
    assert_eq!(skipped[0]["artifact"], "FV-001");
}

/// #547 (REQ-238): `rivet trace-results <req>` walks FORWARD from a requirement
/// to the test results that cover it (the reverse of the authored `verifies`
/// direction) and rolls up a pass/fail verdict — the data behind the graphical
/// dashboard trace view. Exits non-zero when a covering test failed.
///
/// rivet: verifies REQ-238
#[test]
fn trace_results_forward_from_requirement_to_test_outcome() {
    let tmp = tempfile::tempdir().expect("temp dir");
    let dir = tmp.path();
    let dirs = dir.to_str().unwrap();
    std::fs::create_dir_all(dir.join("artifacts")).unwrap();
    std::fs::create_dir_all(dir.join("results")).unwrap();
    std::fs::write(
        dir.join("rivet.yaml"),
        "project:\n  name: p\n  schemas: [common, dev]\n\
         sources:\n  - path: artifacts\n    format: generic-yaml\nresults: results\n",
    )
    .unwrap();
    std::fs::write(
        dir.join("artifacts/a.yaml"),
        "artifacts:\n  \
         - id: REQ-1\n    type: requirement\n    title: r\n    status: approved\n  \
         - id: TEST-1\n    type: test\n    title: t\n    status: approved\n    \
             links:\n      - type: verifies\n        target: REQ-1\n",
    )
    .unwrap();
    let write_result = |status: &str| {
        std::fs::write(
            dir.join("results/run1.yaml"),
            format!(
                "run:\n  id: run-1\n  timestamp: \"2026-07-01T00:00:00Z\"\n\
                 results:\n  - artifact: TEST-1\n    status: {status}\n"
            ),
        )
        .unwrap();
    };

    // Passing result → verdict passing, exit 0, TEST-1 reached with status.
    write_result("pass");
    let out = Command::new(rivet_bin())
        .args([
            "--project",
            dirs,
            "trace-results",
            "REQ-1",
            "--format",
            "json",
        ])
        .output()
        .expect("trace-results");
    assert!(out.status.success());
    let v: serde_json::Value = serde_json::from_slice(&out.stdout).expect("json");
    assert_eq!(v["verdict"], "passing");
    assert_eq!(v["nodes"][0]["artifact_id"], "TEST-1");
    assert_eq!(v["nodes"][0]["status"], "pass");

    // Failing result → exit non-zero (gate-usable).
    write_result("fail");
    let out2 = Command::new(rivet_bin())
        .args(["--project", dirs, "trace-results", "REQ-1"])
        .output()
        .expect("trace-results");
    assert!(
        !out2.status.success(),
        "a failing covering test must make trace-results exit non-zero"
    );
}

/// #620 (REQ-241): `rivet validate` (default salsa path) and
/// `rivet validate --direct` (library path) must produce IDENTICAL results
/// on the same project. A user reported them disagreeing — one flagging
/// errors the other didn't. The substantive divergence (self-links counted
/// as closing a rule) was fixed in #627; the last residual difference was
/// the `--explain <id>` hint naming a different example artifact because the
/// two paths collect artifacts in different orders. Both are now covered.
///
/// rivet: verifies REQ-241
#[test]
fn validate_and_direct_produce_identical_output() {
    let tmp = tempfile::tempdir().expect("create temp dir");
    let dir = tmp.path();
    let dirs = dir.to_str().unwrap();
    assert!(
        Command::new(rivet_bin())
            .args(["init", "--preset", "dev", "--dir", dirs])
            .output()
            .expect("init")
            .status
            .success()
    );
    // A project that exercises coverage gaps, a self-satisfying link (the
    // #627 case), and multiple artifacts (so any order-dependent hint or
    // list would diverge between the two paths).
    std::fs::write(
        dir.join("artifacts").join("reqs.yaml"),
        "artifacts:\n  \
         - id: REQ-001\n    type: requirement\n    title: self-sat\n    status: approved\n    \
           links:\n      - type: satisfies\n        target: REQ-001\n  \
         - id: REQ-002\n    type: requirement\n    title: second\n    status: approved\n  \
         - id: REQ-003\n    type: requirement\n    title: third\n    status: approved\n",
    )
    .unwrap();

    let run = |extra: &[&str]| -> String {
        let mut args = vec!["--project", dirs, "validate"];
        args.extend_from_slice(extra);
        let out = Command::new(rivet_bin())
            .args(&args)
            .output()
            .expect("validate");
        // Drop the `Schemas:` provenance footer (identical here, but not the
        // subject of the test) and sort so ordering of independent diagnostic
        // lines is not itself the assertion — the content must match.
        let mut lines: Vec<String> = String::from_utf8_lossy(&out.stdout)
            .lines()
            .filter(|l| !l.starts_with("Schemas:"))
            .map(str::to_string)
            .collect();
        lines.sort();
        lines.join("\n")
    };

    let salsa = run(&[]);
    let direct = run(&["--direct"]);
    assert_eq!(
        salsa, direct,
        "`validate` and `validate --direct` must produce identical results (#620)"
    );
}

/// REQ-064: a `derives-from-external` link (the cross-org variant of
/// `derives-from`, terminating at an `external-anchor`) must satisfy a
/// required `derives-from` link-field. Before the fix the cardinality
/// check counted only exact `derives-from` links, so a sw-req that
/// derived from an external anchor failed with a spurious
/// `link 'derives-from' requires at least 1 target, found 0` Error.
///
/// rivet: verifies REQ-064
#[test]
fn validate_accepts_derives_from_external_structured_target() {
    let tmp = tempfile::tempdir().expect("create temp dir");
    let dir = tmp.path();
    let init = Command::new(rivet_bin())
        .args(["init", "--preset", "aspice", "--dir", dir.to_str().unwrap()])
        .output()
        .expect("rivet init");
    assert!(
        init.status.success(),
        "init: {}",
        String::from_utf8_lossy(&init.stderr)
    );

    std::fs::write(
        dir.join("artifacts").join("ext.yaml"),
        "artifacts:\n\
         \x20 - id: ANCHOR-X\n\
         \x20   type: external-anchor\n\
         \x20   title: ACME anchor\n\
         \x20   status: approved\n\
         \x20   fields:\n\
         \x20     source-of-truth: {org: acme, contract: PO-1, doc-id: D-1}\n\
         \x20     expected-derived-types: [sw-req]\n\
         \x20     received-status: received-other\n\
         \x20 - id: SWREQ-X\n\
         \x20   type: sw-req\n\
         \x20   title: Derives from an external anchor\n\
         \x20   status: draft\n\
         \x20   fields: {req-type: functional, priority: must}\n\
         \x20   links:\n\
         \x20     - type: derives-from-external\n\
         \x20       target: {org: acme, contract: PO-1, doc-id: D-1, anchor: ANCHOR-X}\n",
    )
    .expect("write ext.yaml");

    let out = Command::new(rivet_bin())
        .args([
            "--project",
            dir.to_str().unwrap(),
            "validate",
            "--format",
            "json",
        ])
        .output()
        .expect("rivet validate");
    let parsed: serde_json::Value =
        serde_json::from_slice(&out.stdout).expect("validate JSON must be valid");
    let diags = parsed
        .get("diagnostics")
        .and_then(|v| v.as_array())
        .expect("diagnostics array");
    let spurious = diags.iter().any(|d| {
        d.get("artifact_id").and_then(|a| a.as_str()) == Some("SWREQ-X")
            && d.get("rule").and_then(|r| r.as_str()) == Some("cardinality")
            && d.get("message")
                .and_then(|m| m.as_str())
                .is_some_and(|m| m.contains("requires at least 1 target"))
    });
    assert!(
        !spurious,
        "a derives-from-external link must satisfy the derives-from \
         link-field cardinality; got: {parsed}"
    );
}

/// REQ-075 / F2: two artifacts that declare the same `id` collapse
/// silently — `Store::upsert` is last-write-wins, so by the time
/// `validate::validate` runs only one survives and the validator is
/// structurally blind to the collision. `rivet validate` must detect the
/// duplicate at LOAD time and emit a `duplicate-artifact-id` Error
/// diagnostic naming both source files. Verified for both the two-files
/// case and the twice-in-one-file case.
///
/// rivet: verifies REQ-075
#[test]
fn validate_detects_duplicate_artifact_ids() {
    let tmp = tempfile::tempdir().expect("create temp dir");
    let dir = tmp.path();

    let init = Command::new(rivet_bin())
        .args(["init", "--preset", "dev", "--dir", dir.to_str().unwrap()])
        .output()
        .expect("failed to execute rivet init");
    assert!(
        init.status.success(),
        "rivet init must exit 0. stderr: {}",
        String::from_utf8_lossy(&init.stderr)
    );

    // Two artifact files that both declare `id: REQ-DUP`. `upsert` keeps
    // only one; the load-time duplicate check must still see both.
    std::fs::write(
        dir.join("artifacts").join("file-a.yaml"),
        "artifacts:\n  - id: REQ-DUP\n    type: requirement\n    \
         title: First definition\n    status: draft\n    \
         fields:\n      priority: must\n      category: functional\n",
    )
    .expect("write file-a.yaml");
    std::fs::write(
        dir.join("artifacts").join("file-b.yaml"),
        "artifacts:\n  - id: REQ-DUP\n    type: requirement\n    \
         title: Second definition\n    status: draft\n    \
         fields:\n      priority: must\n      category: functional\n",
    )
    .expect("write file-b.yaml");

    let out = Command::new(rivet_bin())
        .args([
            "--project",
            dir.to_str().unwrap(),
            "validate",
            "--format",
            "json",
        ])
        .output()
        .expect("failed to execute rivet validate");

    assert!(
        !out.status.success(),
        "validate must exit non-zero when an artifact id is duplicated"
    );
    let parsed: serde_json::Value =
        serde_json::from_slice(&out.stdout).expect("validate JSON must be valid");
    assert_eq!(
        parsed.get("result").and_then(|v| v.as_str()),
        Some("FAIL"),
        "result must be FAIL; got: {parsed}"
    );
    assert!(
        parsed.get("errors").and_then(|v| v.as_u64()).unwrap_or(0) >= 1,
        "errors must be >= 1; got: {parsed}"
    );
    let diags = parsed
        .get("diagnostics")
        .and_then(|v| v.as_array())
        .expect("diagnostics array");
    let dup = diags
        .iter()
        .find(|d| d.get("rule").and_then(|r| r.as_str()) == Some("duplicate-artifact-id"))
        .unwrap_or_else(|| {
            panic!("expected a diagnostic with rule 'duplicate-artifact-id'; got: {parsed}")
        });
    let msg = dup
        .get("message")
        .and_then(|m| m.as_str())
        .expect("duplicate diagnostic must have a message");
    assert!(
        msg.contains("REQ-DUP"),
        "the duplicate-artifact-id message must name the colliding id; got: {msg}"
    );
    assert!(
        msg.contains("file-a.yaml") && msg.contains("file-b.yaml"),
        "the duplicate-artifact-id message must name both source files; got: {msg}"
    );

    // The same ID twice within a SINGLE file's `artifacts:` list.
    let tmp2 = tempfile::tempdir().expect("create temp dir 2");
    let dir2 = tmp2.path();
    let init2 = Command::new(rivet_bin())
        .args(["init", "--preset", "dev", "--dir", dir2.to_str().unwrap()])
        .output()
        .expect("failed to execute rivet init (2)");
    assert!(init2.status.success(), "rivet init (2) must exit 0");
    std::fs::write(
        dir2.join("artifacts").join("requirements.yaml"),
        "artifacts:\n  - id: REQ-DUP\n    type: requirement\n    \
         title: First\n    status: draft\n    \
         fields:\n      priority: must\n      category: functional\n  \
         - id: REQ-DUP\n    type: requirement\n    \
         title: Second\n    status: draft\n    \
         fields:\n      priority: must\n      category: functional\n",
    )
    .expect("write requirements.yaml with duplicate");

    let out2 = Command::new(rivet_bin())
        .args([
            "--project",
            dir2.to_str().unwrap(),
            "validate",
            "--format",
            "json",
        ])
        .output()
        .expect("failed to execute rivet validate (2)");
    assert!(
        !out2.status.success(),
        "validate must exit non-zero for two same-id entries in one file"
    );
    let parsed2: serde_json::Value =
        serde_json::from_slice(&out2.stdout).expect("validate JSON (2) must be valid");
    let diags2 = parsed2
        .get("diagnostics")
        .and_then(|v| v.as_array())
        .expect("diagnostics array (2)");
    assert!(
        diags2
            .iter()
            .any(|d| d.get("rule").and_then(|r| r.as_str()) == Some("duplicate-artifact-id")),
        "two same-id entries in one file must produce a duplicate-artifact-id diagnostic; \
         got: {parsed2}"
    );
}

/// REQ-076: an orphan artifact — no inbound and no outbound links,
/// disconnected from the traceability graph — must be surfaced by
/// `rivet validate` as an `orphan-artifact` diagnostic. Severity is
/// Warning by default (so a project with orphans does not hard-fail),
/// promotable to Error with `--strict-orphans`.
///
/// rivet: verifies REQ-076
#[test]
fn validate_reports_orphans_as_warnings() {
    let tmp = tempfile::tempdir().expect("create temp dir");
    let dir = tmp.path();

    let init = Command::new(rivet_bin())
        .args(["init", "--preset", "dev", "--dir", dir.to_str().unwrap()])
        .output()
        .expect("failed to execute rivet init");
    assert!(
        init.status.success(),
        "rivet init must exit 0. stderr: {}",
        String::from_utf8_lossy(&init.stderr)
    );

    // Replace the seeded artifacts with a single requirement that has no
    // links of any kind — a textbook orphan.
    std::fs::write(
        dir.join("artifacts").join("requirements.yaml"),
        "artifacts:\n  - id: REQ-ORPHAN\n    type: requirement\n    \
         title: Disconnected requirement\n    status: draft\n    \
         fields:\n      priority: must\n      category: functional\n",
    )
    .expect("write requirements.yaml");

    // Default run: orphan surfaces as a Warning; the run still exits 0
    // (orphans must not hard-fail by default).
    let out = Command::new(rivet_bin())
        .args([
            "--project",
            dir.to_str().unwrap(),
            "validate",
            "--format",
            "json",
        ])
        .output()
        .expect("failed to execute rivet validate");
    let parsed: serde_json::Value =
        serde_json::from_slice(&out.stdout).expect("validate JSON must be valid");
    let diags = parsed
        .get("diagnostics")
        .and_then(|v| v.as_array())
        .expect("diagnostics array");
    let orphan = diags
        .iter()
        .find(|d| {
            d.get("rule").and_then(|r| r.as_str()) == Some("orphan-artifact")
                && d.get("artifact_id").and_then(|a| a.as_str()) == Some("REQ-ORPHAN")
        })
        .unwrap_or_else(|| {
            panic!("expected an orphan-artifact diagnostic for REQ-ORPHAN; got: {parsed}")
        });
    assert_eq!(
        orphan.get("severity").and_then(|s| s.as_str()),
        Some("warning"),
        "orphan-artifact must default to severity 'warning'; got: {orphan}"
    );

    // `--strict-orphans` promotes the same diagnostic to Error and the
    // run exits non-zero.
    let strict = Command::new(rivet_bin())
        .args([
            "--project",
            dir.to_str().unwrap(),
            "validate",
            "--format",
            "json",
            "--strict-orphans",
        ])
        .output()
        .expect("failed to execute rivet validate --strict-orphans");
    assert!(
        !strict.status.success(),
        "validate --strict-orphans must exit non-zero when an orphan exists"
    );
    let parsed_strict: serde_json::Value =
        serde_json::from_slice(&strict.stdout).expect("strict validate JSON must be valid");
    assert_eq!(
        parsed_strict.get("result").and_then(|v| v.as_str()),
        Some("FAIL"),
        "result must be FAIL under --strict-orphans; got: {parsed_strict}"
    );
    let strict_orphan = parsed_strict
        .get("diagnostics")
        .and_then(|v| v.as_array())
        .expect("strict diagnostics array")
        .iter()
        .find(|d| {
            d.get("rule").and_then(|r| r.as_str()) == Some("orphan-artifact")
                && d.get("artifact_id").and_then(|a| a.as_str()) == Some("REQ-ORPHAN")
        })
        .unwrap_or_else(|| {
            panic!("expected an orphan-artifact diagnostic under --strict-orphans; got: {parsed_strict}")
        });
    assert_eq!(
        strict_orphan.get("severity").and_then(|s| s.as_str()),
        Some("error"),
        "orphan-artifact must be severity 'error' under --strict-orphans; got: {strict_orphan}"
    );
}

/// REQ-065 / AoU-X1: by default the consumer's `rivet validate` says
/// nothing about a linked external's own validation state — the
/// `cross_repo_diagnostics` array is empty. `--with-externals-validate`
/// runs validate inside each external and surfaces its diagnostics.
///
/// rivet: verifies REQ-065
#[test]
fn validate_with_externals_validate_surfaces_supplier_diagnostics() {
    let root = tempfile::tempdir().expect("temp dir");
    let supplier = root.path().join("supplier");
    let consumer = root.path().join("consumer");
    std::fs::create_dir_all(&supplier).unwrap();
    std::fs::create_dir_all(&consumer).unwrap();

    // Supplier: a dev project with two deliberately invalid-priority reqs.
    let init_s = Command::new(rivet_bin())
        .args([
            "init",
            "--preset",
            "dev",
            "--dir",
            supplier.to_str().unwrap(),
        ])
        .output()
        .expect("init supplier");
    assert!(
        init_s.status.success(),
        "init supplier: {}",
        String::from_utf8_lossy(&init_s.stderr)
    );
    std::fs::write(
        supplier.join("artifacts").join("reqs.yaml"),
        "artifacts:\n\
         \x20 - id: REQ-S1\n    type: requirement\n    title: Bad priority one\n\
         \x20   status: approved\n    fields: {priority: NotValid, category: functional}\n\
         \x20 - id: REQ-S2\n    type: requirement\n    title: Bad priority two\n\
         \x20   status: approved\n    fields: {priority: AlsoBad, category: functional}\n",
    )
    .expect("write supplier reqs");

    // Consumer: links the supplier as a path external.
    let init_c = Command::new(rivet_bin())
        .args([
            "init",
            "--preset",
            "dev",
            "--dir",
            consumer.to_str().unwrap(),
        ])
        .output()
        .expect("init consumer");
    assert!(
        init_c.status.success(),
        "init consumer: {}",
        String::from_utf8_lossy(&init_c.stderr)
    );
    std::fs::write(
        consumer.join("rivet.yaml"),
        format!(
            "project:\n  name: consumer\n  version: \"0.1.0\"\n  schemas: [common, dev]\n\
             externals:\n  sup:\n    path: {}\n    prefix: sup\n\
             sources:\n  - path: artifacts\n    format: generic-yaml\n",
            supplier.display()
        ),
    )
    .expect("write consumer rivet.yaml");
    let sync = Command::new(rivet_bin())
        .args(["--project", consumer.to_str().unwrap(), "sync"])
        .output()
        .expect("rivet sync");
    assert!(
        sync.status.success(),
        "sync: {}",
        String::from_utf8_lossy(&sync.stderr)
    );

    // Default validate — cross_repo_diagnostics MUST be empty.
    let plain = Command::new(rivet_bin())
        .args([
            "--project",
            consumer.to_str().unwrap(),
            "validate",
            "--format",
            "json",
        ])
        .output()
        .expect("validate plain");
    let plain_json: serde_json::Value =
        serde_json::from_slice(&plain.stdout).expect("plain validate JSON");
    assert_eq!(
        plain_json
            .get("cross_repo_diagnostics")
            .and_then(|v| v.as_array())
            .map(|a| a.len()),
        Some(0),
        "default validate must not surface external diagnostics; got: {plain_json}"
    );

    // --with-externals-validate — MUST surface the supplier's warnings.
    let withv = Command::new(rivet_bin())
        .args([
            "--project",
            consumer.to_str().unwrap(),
            "validate",
            "--with-externals-validate",
            "--format",
            "json",
        ])
        .output()
        .expect("validate --with-externals-validate");
    let withv_json: serde_json::Value =
        serde_json::from_slice(&withv.stdout).expect("validate JSON");
    let crd = withv_json
        .get("cross_repo_diagnostics")
        .and_then(|v| v.as_array())
        .expect("cross_repo_diagnostics array");
    assert!(
        crd.len() >= 3,
        "expected >= 3 supplier diagnostics; got {}: {withv_json}",
        crd.len()
    );
    let first = &crd[0];
    for key in [
        "source_project",
        "source_artifact_id",
        "severity",
        "rule",
        "message",
    ] {
        assert!(first.get(key).is_some(), "entry missing '{key}': {first}");
    }
    assert_eq!(
        first.get("source_project").and_then(|v| v.as_str()),
        Some("sup"),
        "source_project must be the external prefix; got: {first}"
    );
}

/// REQ-082: a linked external repo's OWN schema violations must not be
/// counted against the consumer's default `rivet validate`. External
/// (`prefix:ID`) artifacts are in the store only so cross-links resolve;
/// validating the supplier's project is opt-in (`--with-externals-validate`).
///
/// rivet: verifies REQ-082
#[test]
fn validate_does_not_count_external_repo_violations() {
    let root = tempfile::tempdir().expect("temp dir");
    let supplier = root.path().join("supplier");
    let consumer = root.path().join("consumer");
    std::fs::create_dir_all(&supplier).unwrap();
    std::fs::create_dir_all(&consumer).unwrap();

    // Supplier: a dev project carrying a real schema violation
    // (out-of-enum priority) — the kind of error that, before REQ-082,
    // flooded the consumer's error total after `rivet sync`.
    let init_s = Command::new(rivet_bin())
        .args([
            "init",
            "--preset",
            "dev",
            "--dir",
            supplier.to_str().unwrap(),
        ])
        .output()
        .expect("init supplier");
    assert!(
        init_s.status.success(),
        "init supplier: {}",
        String::from_utf8_lossy(&init_s.stderr)
    );
    std::fs::write(
        supplier.join("artifacts").join("bad.yaml"),
        "artifacts:\n\
         \x20 - id: REQ-SUPPLIER-BAD\n    type: requirement\n\
         \x20   title: Supplier req with an invalid priority\n\
         \x20   status: approved\n\
         \x20   fields: {priority: TotallyInvalid, category: functional}\n",
    )
    .expect("write supplier bad.yaml");

    let init_c = Command::new(rivet_bin())
        .args([
            "init",
            "--preset",
            "dev",
            "--dir",
            consumer.to_str().unwrap(),
        ])
        .output()
        .expect("init consumer");
    assert!(
        init_c.status.success(),
        "init consumer: {}",
        String::from_utf8_lossy(&init_c.stderr)
    );
    std::fs::write(
        consumer.join("rivet.yaml"),
        format!(
            "project:\n  name: consumer\n  version: \"0.1.0\"\n  schemas: [common, dev]\n\
             externals:\n  sup:\n    path: {}\n    prefix: sup\n\
             sources:\n  - path: artifacts\n    format: generic-yaml\n",
            supplier.display()
        ),
    )
    .expect("write consumer rivet.yaml");
    let sync = Command::new(rivet_bin())
        .args(["--project", consumer.to_str().unwrap(), "sync"])
        .output()
        .expect("rivet sync");
    assert!(
        sync.status.success(),
        "sync: {}",
        String::from_utf8_lossy(&sync.stderr)
    );

    let out = Command::new(rivet_bin())
        .args([
            "--project",
            consumer.to_str().unwrap(),
            "validate",
            "--format",
            "json",
        ])
        .output()
        .expect("validate");
    let parsed: serde_json::Value = serde_json::from_slice(&out.stdout).expect("validate JSON");
    let diags = parsed
        .get("diagnostics")
        .and_then(|v| v.as_array())
        .expect("diagnostics array");
    let external_diags: Vec<_> = diags
        .iter()
        .filter(|d| {
            d.get("artifact_id")
                .and_then(|a| a.as_str())
                .is_some_and(|id| id.starts_with("sup:"))
        })
        .collect();
    assert!(
        external_diags.is_empty(),
        "the consumer's validate must not carry diagnostics for the \
         external repo's own artifacts; got: {external_diags:?}"
    );
}

/// #649 / DD-017 / REQ-065 (AoU-X1): the consumer's default `rivet
/// validate` must NOT fail on the SUPPLIER'S own outgoing external
/// references — a consumer that declares only supplier `sup` cannot be
/// expected to know or declare supplier's own externals (DD-017:
/// "declare direct deps only"). The consumer's cross-ref check now
/// walks only consumer-owned links; supplier internals stay in the
/// supplier's validation gate.
///
/// The reverse case must still fire: a consumer artifact whose own link
/// targets an undeclared prefix continues to surface `UnknownPrefix`.
///
/// rivet: verifies REQ-065
#[test]
fn validate_does_not_leak_transitive_external_prefixes() {
    let root = tempfile::tempdir().expect("temp dir");
    let supplier = root.path().join("supplier");
    let consumer = root.path().join("consumer");
    std::fs::create_dir_all(&supplier).unwrap();
    std::fs::create_dir_all(&consumer).unwrap();

    // Supplier: a dev project whose own artifact carries an outgoing
    // link to `super:REQ-EXT` — a prefix that would be one of the
    // supplier's own externals. The consumer never declares `super:`.
    let init_s = Command::new(rivet_bin())
        .args([
            "init",
            "--preset",
            "dev",
            "--dir",
            supplier.to_str().unwrap(),
        ])
        .output()
        .expect("init supplier");
    assert!(
        init_s.status.success(),
        "init supplier: {}",
        String::from_utf8_lossy(&init_s.stderr)
    );
    std::fs::write(
        supplier.join("artifacts").join("with-transitive.yaml"),
        "artifacts:\n\
         \x20 - id: REQ-SUPPLIER-A\n    type: requirement\n\
         \x20   title: Supplier req linking to its own external\n\
         \x20   status: approved\n\
         \x20   fields: {priority: must, category: functional}\n\
         \x20   links:\n\
         \x20     - type: satisfies\n\
         \x20       target: super:REQ-EXT\n",
    )
    .expect("write supplier with-transitive.yaml");

    // Consumer: declares supplier ONLY; never mentions `super:`. It
    // ALSO carries a legitimately broken outgoing ref of its own
    // (`xyz:REQ-BOGUS`) so we can assert the counter-case: the fix
    // must not silently accept the consumer's own broken external refs.
    let init_c = Command::new(rivet_bin())
        .args([
            "init",
            "--preset",
            "dev",
            "--dir",
            consumer.to_str().unwrap(),
        ])
        .output()
        .expect("init consumer");
    assert!(
        init_c.status.success(),
        "init consumer: {}",
        String::from_utf8_lossy(&init_c.stderr)
    );
    std::fs::write(
        consumer.join("artifacts").join("bogus.yaml"),
        "artifacts:\n\
         \x20 - id: REQ-CONS-A\n    type: requirement\n\
         \x20   title: Consumer req with a locally-broken external ref\n\
         \x20   status: approved\n\
         \x20   fields: {priority: must, category: functional}\n\
         \x20   links:\n\
         \x20     - type: satisfies\n\
         \x20       target: xyz:REQ-BOGUS\n",
    )
    .expect("write consumer bogus.yaml");
    std::fs::write(
        consumer.join("rivet.yaml"),
        format!(
            "project:\n  name: consumer\n  version: \"0.1.0\"\n  schemas: [common, dev]\n\
             externals:\n  sup:\n    path: {}\n    prefix: sup\n\
             sources:\n  - path: artifacts\n    format: generic-yaml\n",
            supplier.display()
        ),
    )
    .expect("write consumer rivet.yaml");
    let sync = Command::new(rivet_bin())
        .args(["--project", consumer.to_str().unwrap(), "sync"])
        .output()
        .expect("rivet sync");
    assert!(
        sync.status.success(),
        "sync: {}",
        String::from_utf8_lossy(&sync.stderr)
    );

    let out = Command::new(rivet_bin())
        .args([
            "--project",
            consumer.to_str().unwrap(),
            "validate",
            "--format",
            "json",
        ])
        .output()
        .expect("validate");
    let parsed: serde_json::Value = serde_json::from_slice(&out.stdout).expect("validate JSON");
    let broken = parsed
        .get("broken_cross_refs")
        .and_then(|v| v.as_array())
        .expect("broken_cross_refs array");
    let leaked: Vec<_> = broken
        .iter()
        .filter(|b| {
            b.get("reference")
                .and_then(|r| r.as_str())
                .is_some_and(|r| r.starts_with("super:"))
        })
        .collect();
    assert!(
        leaked.is_empty(),
        "#649: supplier's own external refs must NOT leak into the \
         consumer's cross-ref check; got: {leaked:?}"
    );
    let own_bad: Vec<_> = broken
        .iter()
        .filter(|b| {
            b.get("reference")
                .and_then(|r| r.as_str())
                .is_some_and(|r| r.starts_with("xyz:"))
        })
        .collect();
    assert!(
        !own_bad.is_empty(),
        "the consumer's own broken external ref (`xyz:REQ-BOGUS`) must \
         still surface as an UnknownPrefix broken cross-ref; got only: {broken:?}"
    );
}

// ── rivet stats ─────────────────────────────────────────────────────────

/// `rivet stats --format json` produces valid JSON with total count.
#[test]
fn stats_json() {
    let output = Command::new(rivet_bin())
        .args([
            "--project",
            project_root().to_str().unwrap(),
            "stats",
            "--format",
            "json",
        ])
        .output()
        .expect("failed to execute rivet stats --format json");

    assert!(
        output.status.success(),
        "rivet stats --format json must exit 0. stderr: {}",
        String::from_utf8_lossy(&output.stderr)
    );

    let stdout = String::from_utf8_lossy(&output.stdout);
    let parsed: serde_json::Value =
        serde_json::from_str(&stdout).expect("stats JSON must be valid");

    assert_eq!(
        parsed.get("command").and_then(|v| v.as_str()),
        Some("stats"),
    );
    assert!(
        parsed.get("total").and_then(|v| v.as_u64()).unwrap_or(0) > 0,
        "stats must report at least one artifact"
    );
    assert!(
        parsed.get("types").is_some(),
        "stats JSON must contain 'types' breakdown"
    );
}

// ── rivet list ──────────────────────────────────────────────────────────

/// `rivet list --format json` produces valid JSON with artifacts array.
#[test]
fn list_json() {
    let output = Command::new(rivet_bin())
        .args([
            "--project",
            project_root().to_str().unwrap(),
            "list",
            "--format",
            "json",
        ])
        .output()
        .expect("failed to execute rivet list --format json");

    assert!(
        output.status.success(),
        "rivet list --format json must exit 0. stderr: {}",
        String::from_utf8_lossy(&output.stderr)
    );

    let stdout = String::from_utf8_lossy(&output.stdout);
    let parsed: serde_json::Value = serde_json::from_str(&stdout).expect("list JSON must be valid");

    assert_eq!(parsed.get("command").and_then(|v| v.as_str()), Some("list"),);
    assert!(
        parsed.get("artifacts").and_then(|v| v.as_array()).is_some(),
        "list JSON must contain 'artifacts' array"
    );
    assert!(
        parsed.get("count").and_then(|v| v.as_u64()).unwrap_or(0) > 0,
        "list must report at least one artifact"
    );
}

/// `rivet sql` runs read-only SQL over the store with no server/MCP (REQ-229).
/// Covers the schema projection and a JOIN (the V-closure query).
// rivet: verifies REQ-229
#[test]
fn sql_join_and_json_over_the_store() {
    // JOIN: requirements with no incoming `verifies` link — the V-closure set.
    let output = Command::new(rivet_bin())
        .args([
            "--project",
            project_root().to_str().unwrap(),
            "sql",
            "SELECT id FROM artifacts WHERE type='requirement' \
             AND id NOT IN (SELECT target FROM links WHERE link_type='verifies') \
             ORDER BY id",
            "--format",
            "json",
        ])
        .output()
        .expect("failed to execute rivet sql");

    assert!(
        output.status.success(),
        "rivet sql must exit 0. stderr: {}",
        String::from_utf8_lossy(&output.stderr)
    );
    let stdout = String::from_utf8_lossy(&output.stdout);
    let parsed: serde_json::Value = serde_json::from_str(&stdout).expect("sql JSON must be valid");
    let rows = parsed
        .as_array()
        .expect("sql --format json is an array of rows");
    assert!(
        rows.iter()
            .all(|r| r.get("id").and_then(|v| v.as_str()).is_some()),
        "each row must carry the projected `id` column"
    );
}

/// A throwaway dev project with one implemented requirement carrying sibling
/// fields, for SQL write tests (REQ-230).
fn sql_write_project() -> tempfile::TempDir {
    let tmp = tempfile::tempdir().expect("create temp dir");
    let dir = tmp.path();
    let init = Command::new(rivet_bin())
        .args(["init", "--preset", "dev", "--dir", dir.to_str().unwrap()])
        .output()
        .expect("init");
    assert!(
        init.status.success(),
        "init must succeed: {}",
        String::from_utf8_lossy(&init.stderr)
    );
    std::fs::write(
        dir.join("artifacts").join("requirements.yaml"),
        "artifacts:\n  - id: REQ-001\n    type: requirement\n    \
         title: A requirement\n    status: implemented\n    \
         fields:\n      priority: must\n      category: functional\n",
    )
    .expect("write fixture");
    tmp
}

/// `rivet sql` UPDATE changes status and preserves sibling fields (REQ-230) —
/// the round-trip-fidelity guard against the `render_artifact_yaml` allowlist.
// rivet: verifies REQ-230
#[test]
fn sql_write_updates_status_and_preserves_siblings() {
    let tmp = sql_write_project();
    let dir = tmp.path();
    let out = Command::new(rivet_bin())
        .args([
            "--project",
            dir.to_str().unwrap(),
            "sql",
            "UPDATE artifacts SET status='verified' WHERE id='REQ-001'",
        ])
        .output()
        .expect("sql write");
    assert!(
        out.status.success(),
        "write must succeed. stderr: {}",
        String::from_utf8_lossy(&out.stderr)
    );
    let content = std::fs::read_to_string(dir.join("artifacts").join("requirements.yaml")).unwrap();
    assert!(content.contains("status: verified"), "status updated");
    assert!(
        content.contains("priority: must") && content.contains("category: functional"),
        "sibling fields must survive the SQL UPDATE (allowlist-drop guard):\n{content}"
    );
}

/// `rivet sql` rejects an invalid status and leaves the file unchanged (REQ-230).
// rivet: verifies REQ-230
#[test]
fn sql_write_rejects_invalid_value_atomically() {
    let tmp = sql_write_project();
    let dir = tmp.path();
    let out = Command::new(rivet_bin())
        .args([
            "--project",
            dir.to_str().unwrap(),
            "sql",
            "UPDATE artifacts SET status='not-a-status' WHERE id='REQ-001'",
        ])
        .output()
        .expect("sql write");
    assert!(!out.status.success(), "an off-enum status must be rejected");
    let content = std::fs::read_to_string(dir.join("artifacts").join("requirements.yaml")).unwrap();
    assert!(
        content.contains("status: implemented"),
        "file must be unchanged on rejection:\n{content}"
    );
}

/// `rivet list --format json` artifacts have expected fields.
#[test]
fn list_json_artifact_fields() {
    let output = Command::new(rivet_bin())
        .args([
            "--project",
            project_root().to_str().unwrap(),
            "list",
            "--format",
            "json",
        ])
        .output()
        .expect("failed to execute rivet list --format json");

    assert!(output.status.success());

    let stdout = String::from_utf8_lossy(&output.stdout);
    let parsed: serde_json::Value = serde_json::from_str(&stdout).expect("valid JSON");

    let artifacts = parsed
        .get("artifacts")
        .and_then(|v| v.as_array())
        .expect("artifacts array");
    assert!(!artifacts.is_empty(), "must have at least one artifact");

    // Every artifact should have id, type, title
    for artifact in artifacts {
        assert!(
            artifact.get("id").and_then(|v| v.as_str()).is_some(),
            "artifact must have 'id'"
        );
        assert!(
            artifact.get("type").and_then(|v| v.as_str()).is_some(),
            "artifact must have 'type'"
        );
        assert!(
            artifact.get("title").and_then(|v| v.as_str()).is_some(),
            "artifact must have 'title'"
        );
    }
}

/// REQ-211 / #506: `rivet list --format json` is summary-only (no
/// description/tags/fields); `--full` adds them in bulk, matching the
/// `get <ID> --format json` shape. Verify the presence/absence split and
/// that `--full`'s `fields` equals `get`'s `fields` for the same id.
#[test]
fn list_json_full_includes_rich_fields() {
    let root = project_root();
    let root_str = root.to_str().unwrap();
    let run = |args: &[&str]| {
        let mut full_args = vec!["--project", root_str];
        full_args.extend_from_slice(args);
        let out = Command::new(rivet_bin())
            .args(&full_args)
            .output()
            .expect("execute rivet");
        assert!(
            out.status.success(),
            "rivet {:?} must exit 0. stderr: {}",
            args,
            String::from_utf8_lossy(&out.stderr)
        );
        serde_json::from_slice::<serde_json::Value>(&out.stdout).expect("valid JSON")
    };

    // Plain list: summary-only — no rich keys.
    let plain = run(&["list", "--format", "json"]);
    let plain_first = plain["artifacts"]
        .as_array()
        .and_then(|a| a.first())
        .expect("at least one artifact");
    assert!(
        plain_first.get("description").is_none()
            && plain_first.get("tags").is_none()
            && plain_first.get("fields").is_none(),
        "plain `list --format json` must NOT carry description/tags/fields"
    );

    // --full: every artifact carries description (string), tags (array),
    // fields (object).
    let full = run(&["list", "--format", "json", "--full"]);
    let full_arts = full["artifacts"].as_array().expect("artifacts array");
    assert!(!full_arts.is_empty());
    for a in full_arts {
        assert!(
            a.get("description").map(|v| v.is_string()).unwrap_or(false),
            "--full artifact {} must have a string 'description'",
            a.get("id").and_then(|v| v.as_str()).unwrap_or("?")
        );
        assert!(
            a.get("tags").map(|v| v.is_array()).unwrap_or(false),
            "--full artifact must have an array 'tags'"
        );
        assert!(
            a.get("fields").map(|v| v.is_object()).unwrap_or(false),
            "--full artifact must have an object 'fields'"
        );
    }

    // --full's `fields` for a known id must equal `get`'s `fields`.
    let id = full_arts[0]["id"].as_str().expect("id");
    let got = run(&["get", id, "--format", "json"]);
    assert_eq!(
        full_arts[0].get("fields"),
        got.get("fields"),
        "list --full fields must equal get fields for {id}"
    );
}

// ── rivet init then validate roundtrip ──────────────────────────────────

/// Initialize a project, then validate it — the sample artifacts should pass.
#[test]
fn init_then_validate_roundtrip() {
    let tmp = tempfile::tempdir().expect("create temp dir");
    let dir = tmp.path();

    // Init
    let init_out = Command::new(rivet_bin())
        .args(["init", "--preset", "dev", "--dir", dir.to_str().unwrap()])
        .output()
        .expect("failed to execute rivet init");
    assert!(init_out.status.success(), "init must succeed");

    // Validate the newly initialized project
    let validate_out = Command::new(rivet_bin())
        .args([
            "--project",
            dir.to_str().unwrap(),
            "validate",
            "--format",
            "json",
        ])
        .output()
        .expect("failed to execute rivet validate");

    let stdout = String::from_utf8_lossy(&validate_out.stdout);
    let parsed: serde_json::Value =
        serde_json::from_str(&stdout).expect("validate JSON must be valid");

    assert_eq!(
        parsed.get("command").and_then(|v| v.as_str()),
        Some("validate"),
    );
    // Sample artifacts should have at most warnings, no errors
    let errors = parsed.get("errors").and_then(|v| v.as_u64()).unwrap_or(999);
    assert_eq!(
        errors, 0,
        "freshly-initialized project should have 0 validation errors, got {errors}"
    );
}

// ── rivet export --format html ──────────────────────────────────────────

/// `rivet export --format html` generates a static site in the output directory.
/// Verifies that index.html, artifacts/index.html, and at least one
/// artifacts/{id}.html exist and contain meaningful content.
#[test]
fn export_html_generates_static_site() {
    let tmp = tempfile::tempdir().expect("create temp dir");
    let out_dir = tmp.path().join("site");

    let output = Command::new(rivet_bin())
        .args([
            "--project",
            project_root().to_str().unwrap(),
            "export",
            "--format",
            "html",
            "--output",
            out_dir.to_str().unwrap(),
        ])
        .output()
        .expect("failed to execute rivet export --format html");

    assert!(
        output.status.success(),
        "rivet export --format html must exit 0. stderr:\n{}",
        String::from_utf8_lossy(&output.stderr)
    );

    // index.html must exist and contain artifact count
    let index_path = out_dir.join("index.html");
    assert!(
        index_path.exists(),
        "index.html must exist at {}",
        index_path.display()
    );
    let index_html = std::fs::read_to_string(&index_path).expect("read index.html");
    assert!(
        index_html.contains("<!DOCTYPE html>"),
        "index.html must be a full HTML document"
    );
    // The stats page mentions total artifacts
    assert!(
        index_html.contains("artifact") || index_html.contains("Artifact"),
        "index.html must mention artifacts"
    );

    // artifacts/index.html must exist
    let artifacts_index = out_dir.join("artifacts").join("index.html");
    assert!(artifacts_index.exists(), "artifacts/index.html must exist");
    let artifacts_html =
        std::fs::read_to_string(&artifacts_index).expect("read artifacts/index.html");
    assert!(
        artifacts_html.contains("<!DOCTYPE html>"),
        "artifacts/index.html must be a full HTML document"
    );

    // At least one artifacts/{id}.html must exist
    let artifacts_dir = out_dir.join("artifacts");
    let has_detail_page = std::fs::read_dir(&artifacts_dir)
        .expect("read artifacts dir")
        .filter_map(|e| e.ok())
        .any(|e| {
            let name = e.file_name();
            let name_str = name.to_string_lossy();
            name_str.ends_with(".html") && name_str != "index.html"
        });
    assert!(
        has_detail_page,
        "at least one artifacts/{{id}}.html must be generated"
    );

    // validate/index.html must exist
    let validate_path = out_dir.join("validate").join("index.html");
    assert!(validate_path.exists(), "validate/index.html must exist");
}

// ── rivet embed ────────────────────────────────────────────────────────

/// `rivet embed "stats:types"` prints a stats table with type counts.
#[test]
fn embed_stats_types() {
    let output = Command::new(rivet_bin())
        .args([
            "--project",
            project_root().to_str().unwrap(),
            "embed",
            "stats:types",
        ])
        .output()
        .expect("failed to execute rivet embed stats:types");

    assert!(
        output.status.success(),
        "rivet embed stats:types must exit 0. stderr: {}",
        String::from_utf8_lossy(&output.stderr)
    );

    let stdout = String::from_utf8_lossy(&output.stdout);
    assert!(
        stdout.contains("Type") && stdout.contains("Count"),
        "should contain a stats table header. Got: {stdout}"
    );
}

/// `rivet embed "coverage"` prints coverage data or a no-rules message.
#[test]
fn embed_coverage() {
    let output = Command::new(rivet_bin())
        .args([
            "--project",
            project_root().to_str().unwrap(),
            "embed",
            "coverage",
        ])
        .output()
        .expect("failed to execute rivet embed coverage");

    assert!(
        output.status.success(),
        "rivet embed coverage must exit 0. stderr: {}",
        String::from_utf8_lossy(&output.stderr)
    );

    let stdout = String::from_utf8_lossy(&output.stdout);
    assert!(
        stdout.contains("Rule") || stdout.contains("No coverage"),
        "should contain coverage output. Got: {stdout}"
    );
}

// ── rivet snapshot ─────────────────────────────────────────────────────

/// `rivet snapshot capture` writes a JSON snapshot file.
#[test]
fn snapshot_capture_writes_file() {
    let tmp = tempfile::tempdir().expect("create temp dir");
    let out_file = tmp.path().join("test-snap.json");

    let output = Command::new(rivet_bin())
        .args([
            "--project",
            project_root().to_str().unwrap(),
            "snapshot",
            "capture",
            "--output",
            out_file.to_str().unwrap(),
        ])
        .output()
        .expect("failed to execute rivet snapshot capture");

    assert!(
        output.status.success(),
        "rivet snapshot capture must exit 0. stderr: {}",
        String::from_utf8_lossy(&output.stderr)
    );

    assert!(out_file.exists(), "snapshot file must be created");
    let content = std::fs::read_to_string(&out_file).expect("read snapshot");
    let parsed: serde_json::Value =
        serde_json::from_str(&content).expect("snapshot must be valid JSON");
    assert!(
        parsed.get("schema_version").is_some(),
        "must have schema_version"
    );
    assert!(parsed.get("stats").is_some(), "must have stats");
    assert!(parsed.get("coverage").is_some(), "must have coverage");
    assert!(parsed.get("diagnostics").is_some(), "must have diagnostics");
}

/// `rivet snapshot list` runs without error.
#[test]
fn snapshot_list_runs() {
    let output = Command::new(rivet_bin())
        .args([
            "--project",
            project_root().to_str().unwrap(),
            "snapshot",
            "list",
        ])
        .output()
        .expect("failed to execute rivet snapshot list");

    assert!(
        output.status.success(),
        "rivet snapshot list must exit 0. stderr: {}",
        String::from_utf8_lossy(&output.stderr)
    );
}

/// `rivet embed "nonexistent"` reports an unknown embed error.
#[test]
fn embed_unknown_returns_error() {
    let output = Command::new(rivet_bin())
        .args([
            "--project",
            project_root().to_str().unwrap(),
            "embed",
            "nonexistent",
        ])
        .output()
        .expect("failed to execute rivet embed nonexistent");

    let stderr = String::from_utf8_lossy(&output.stderr);
    let stdout = String::from_utf8_lossy(&output.stdout);
    let combined = format!("{stdout}{stderr}");
    assert!(
        combined.contains("Unknown embed") || combined.contains("unknown"),
        "unknown embed should produce an error message. Got: {combined}"
    );
}

/// `rivet embed "diagnostics"` prints diagnostics or a no-data message.
#[test]
fn embed_diagnostics() {
    let output = Command::new(rivet_bin())
        .args([
            "--project",
            project_root().to_str().unwrap(),
            "embed",
            "diagnostics",
        ])
        .output()
        .expect("failed to execute rivet embed diagnostics");

    assert!(
        output.status.success(),
        "rivet embed diagnostics must exit 0. stderr: {}",
        String::from_utf8_lossy(&output.stderr)
    );

    let stdout = String::from_utf8_lossy(&output.stdout);
    assert!(
        stdout.contains("Severity") || stdout.contains("No diagnostics"),
        "should contain diagnostics output. Got: {stdout}"
    );
}

/// `rivet embed "matrix"` prints matrix data or a no-rules message.
#[test]
fn embed_matrix() {
    let output = Command::new(rivet_bin())
        .args([
            "--project",
            project_root().to_str().unwrap(),
            "embed",
            "matrix",
        ])
        .output()
        .expect("failed to execute rivet embed matrix");

    assert!(
        output.status.success(),
        "rivet embed matrix must exit 0. stderr: {}",
        String::from_utf8_lossy(&output.stderr)
    );

    let stdout = String::from_utf8_lossy(&output.stdout);
    assert!(
        stdout.contains("covered") || stdout.contains("No traceability"),
        "should contain matrix output. Got: {stdout}"
    );
}

// ── rivet get ──────────────────────────────────────────────────────────

/// `rivet get REQ-001` succeeds and shows the artifact in text format.
#[test]
fn get_text_shows_artifact() {
    let output = Command::new(rivet_bin())
        .args([
            "--project",
            project_root().to_str().unwrap(),
            "get",
            "REQ-001",
        ])
        .output()
        .expect("failed to execute rivet get REQ-001");

    assert!(
        output.status.success(),
        "rivet get REQ-001 must exit 0. stderr: {}",
        String::from_utf8_lossy(&output.stderr)
    );

    let stdout = String::from_utf8_lossy(&output.stdout);
    assert!(
        stdout.contains("REQ-001"),
        "output must contain artifact ID. Got:\n{stdout}"
    );
    assert!(
        stdout.contains("requirement"),
        "output must contain artifact type. Got:\n{stdout}"
    );
    assert!(
        stdout.contains("Text-file-first"),
        "output must contain artifact title. Got:\n{stdout}"
    );
}

/// `rivet get REQ-001 --format json` produces valid JSON with id, type, title.
#[test]
fn get_json_produces_valid_output() {
    let output = Command::new(rivet_bin())
        .args([
            "--project",
            project_root().to_str().unwrap(),
            "get",
            "REQ-001",
            "--format",
            "json",
        ])
        .output()
        .expect("failed to execute rivet get REQ-001 --format json");

    assert!(
        output.status.success(),
        "rivet get REQ-001 --format json must exit 0. stderr: {}",
        String::from_utf8_lossy(&output.stderr)
    );

    let stdout = String::from_utf8_lossy(&output.stdout);
    let parsed: serde_json::Value = serde_json::from_str(&stdout).expect("get JSON must be valid");

    assert_eq!(
        parsed.get("command").and_then(|v| v.as_str()),
        Some("get"),
        "JSON envelope must have command 'get'"
    );
    assert_eq!(
        parsed.get("id").and_then(|v| v.as_str()),
        Some("REQ-001"),
        "JSON must contain correct id"
    );
    assert_eq!(
        parsed.get("type").and_then(|v| v.as_str()),
        Some("requirement"),
        "JSON must contain correct type"
    );
    assert!(
        parsed.get("title").and_then(|v| v.as_str()).is_some(),
        "JSON must contain title"
    );
}

/// issue #358: `rivet get <ID> --format json` exposes INCOMING links
/// (what links to the artifact), not just outbound `links`. REQ-004 is
/// heavily traced-to in rivet's own repo, so it must have incoming links.
#[test]
fn get_json_includes_incoming_links() {
    let output = Command::new(rivet_bin())
        .args([
            "--project",
            project_root().to_str().unwrap(),
            "get",
            "REQ-004",
            "--format",
            "json",
        ])
        .output()
        .expect("failed to execute rivet get REQ-004 --format json");
    assert!(output.status.success(), "rivet get must exit 0");

    let parsed: serde_json::Value =
        serde_json::from_str(&String::from_utf8_lossy(&output.stdout)).expect("valid JSON");
    let incoming = parsed
        .get("incoming_links")
        .and_then(|v| v.as_array())
        .expect("get JSON must expose an 'incoming_links' array");
    assert!(
        !incoming.is_empty(),
        "REQ-004 is widely traced-to; incoming_links must be non-empty"
    );
    let first = &incoming[0];
    assert!(
        first.get("type").and_then(|v| v.as_str()).is_some(),
        "each incoming link has the source's forward 'type'"
    );
    assert!(
        first.get("source").and_then(|v| v.as_str()).is_some(),
        "each incoming link names its 'source' artifact"
    );
}

/// `rivet get NONEXISTENT` returns non-zero exit code and prints an error.
#[test]
fn get_nonexistent_returns_error() {
    let output = Command::new(rivet_bin())
        .args([
            "--project",
            project_root().to_str().unwrap(),
            "get",
            "NONEXISTENT",
        ])
        .output()
        .expect("failed to execute rivet get NONEXISTENT");

    assert!(
        !output.status.success(),
        "rivet get NONEXISTENT must exit non-zero"
    );

    let stderr = String::from_utf8_lossy(&output.stderr);
    assert!(
        stderr.contains("not found"),
        "stderr must mention 'not found'. Got:\n{stderr}"
    );
}

/// issue #357: `rivet validate --min-severity error` only DISPLAYS
/// error-level diagnostics (filtering the low-signal warning/info noise),
/// while leaving counts/exit untouched. rivet's own repo has 0 errors, so
/// the filtered output must contain no `WARN:`/`INFO:` lines and must note
/// what it suppressed.
#[test]
fn validate_min_severity_filters_display() {
    let output = Command::new(rivet_bin())
        .args([
            "--project",
            project_root().to_str().unwrap(),
            "validate",
            "--min-severity",
            "error",
        ])
        .output()
        .expect("failed to execute rivet validate --min-severity error");
    let stdout = String::from_utf8_lossy(&output.stdout);
    assert!(
        !stdout.contains("WARN:") && !stdout.contains("INFO:"),
        "--min-severity error must suppress WARN/INFO lines. Got:\n{stdout}"
    );
    assert!(
        stdout.contains("at or above 'error'"),
        "must note that lower-severity diagnostics were suppressed. Got:\n{stdout}"
    );
}

/// REQ-125 (#349/#350/#358): `rivet validate --explain <ID>` explains a
/// single artifact — its applicable traceability rules (satisfied or missing,
/// and via which link) plus its links. REQ-001 is widely satisfied in rivet's
/// own repo, so its rule must read "satisfied".
#[test]
fn validate_explain_shows_rule_status() {
    let output = Command::new(rivet_bin())
        .args([
            "--project",
            project_root().to_str().unwrap(),
            "validate",
            "--explain",
            "REQ-001",
        ])
        .output()
        .expect("failed to execute rivet validate --explain REQ-001");
    assert!(output.status.success(), "explain must exit 0");
    let stdout = String::from_utf8_lossy(&output.stdout);
    assert!(
        stdout.contains("Traceability rules for type 'requirement'"),
        "must list applicable traceability rules. Got:\n{stdout}"
    );
    assert!(
        stdout.contains("satisfied"),
        "REQ-001 is satisfied; the rule status must say so. Got:\n{stdout}"
    );
    assert!(
        stdout.contains("Incoming links:"),
        "explain must show incoming links. Got:\n{stdout}"
    );
}

/// REQ-128: `rivet list --orphans` lists only artifacts disconnected from
/// the graph. Its count must be a subset of the full list.
#[test]
fn list_orphans_is_subset() {
    let root = project_root();
    let root_str = root.to_str().unwrap();
    let run = |orphans: bool| {
        let mut args = vec!["--project", root_str, "list", "--format", "json"];
        if orphans {
            args.push("--orphans");
        }
        let out = Command::new(rivet_bin())
            .args(&args)
            .output()
            .expect("rivet list failed");
        assert!(out.status.success(), "list must exit 0");
        let v: serde_json::Value =
            serde_json::from_str(&String::from_utf8_lossy(&out.stdout)).expect("valid JSON");
        v["count"].as_u64().expect("count field")
    };
    let all = run(false);
    let orphans = run(true);
    assert!(
        orphans <= all,
        "orphans ({orphans}) must be a subset of all artifacts ({all})"
    );
}

/// REQ-128: `rivet list --rank-by-backlinks` orders by inbound-link count
/// (descending) and emits an `inbound_links` field on each artifact.
#[test]
fn list_rank_by_backlinks_orders_descending() {
    let root = project_root();
    let out = Command::new(rivet_bin())
        .args([
            "--project",
            root.to_str().unwrap(),
            "list",
            "--rank-by-backlinks",
            "--type",
            "requirement",
            "--format",
            "json",
        ])
        .output()
        .expect("rivet list --rank-by-backlinks failed");
    assert!(out.status.success(), "list must exit 0");
    let v: serde_json::Value =
        serde_json::from_str(&String::from_utf8_lossy(&out.stdout)).expect("valid JSON");
    let arts = v["artifacts"].as_array().expect("artifacts array");
    assert!(arts.len() > 1, "need several requirements to rank");

    // Every entry carries the inbound count, and the sequence is
    // non-increasing (most depended-upon first).
    let mut prev: Option<u64> = None;
    for a in arts {
        let n = a["inbound_links"]
            .as_u64()
            .expect("each artifact must carry inbound_links under --rank-by-backlinks");
        if let Some(p) = prev {
            assert!(
                n <= p,
                "ranking must be descending by inbound count: saw {n} after {p}"
            );
        }
        prev = Some(n);
    }
    // The most depended-upon requirement should have a non-trivial fan-in
    // on the dogfood corpus (sanity that counts are real, not all zero).
    assert!(
        arts[0]["inbound_links"].as_u64().unwrap() > 0,
        "top-ranked artifact must have inbound links"
    );
}

/// `rivet get REQ-001 --format yaml` produces YAML output.
#[test]
fn get_yaml_produces_valid_output() {
    let output = Command::new(rivet_bin())
        .args([
            "--project",
            project_root().to_str().unwrap(),
            "get",
            "REQ-001",
            "--format",
            "yaml",
        ])
        .output()
        .expect("failed to execute rivet get REQ-001 --format yaml");

    assert!(
        output.status.success(),
        "rivet get REQ-001 --format yaml must exit 0. stderr: {}",
        String::from_utf8_lossy(&output.stderr)
    );

    let stdout = String::from_utf8_lossy(&output.stdout);
    assert!(
        stdout.contains("REQ-001"),
        "YAML output must contain artifact ID. Got:\n{stdout}"
    );
    assert!(
        stdout.contains("requirement"),
        "YAML output must contain artifact type. Got:\n{stdout}"
    );
}

// ── rivet coverage ─────────────────────────────────────────────────────

/// `rivet coverage --format json` produces valid JSON with overall and rules.
#[test]
fn coverage_json() {
    let output = Command::new(rivet_bin())
        .args([
            "--project",
            project_root().to_str().unwrap(),
            "coverage",
            "--format",
            "json",
        ])
        .output()
        .expect("failed to execute rivet coverage --format json");

    assert!(
        output.status.success(),
        "rivet coverage --format json must exit 0. stderr: {}",
        String::from_utf8_lossy(&output.stderr)
    );

    let stdout = String::from_utf8_lossy(&output.stdout);
    let parsed: serde_json::Value =
        serde_json::from_str(&stdout).expect("coverage JSON must be valid");

    assert!(
        parsed.get("overall").is_some(),
        "coverage JSON must contain 'overall'"
    );
    assert!(
        parsed.get("rules").and_then(|v| v.as_array()).is_some(),
        "coverage JSON must contain 'rules' array"
    );

    // REQ-111: the overall aggregate sums per-rule denominators (an artifact in
    // N rules counts N times), a different cardinality from `stats` JSON's
    // distinct-artifact `total`. It must be exposed under disambiguated
    // `checks_*` keys and must NOT reuse the bare `total`/`covered` names that
    // would collide semantically with the stats command.
    let overall = &parsed["overall"];
    assert!(
        overall
            .get("checks_total")
            .and_then(|v| v.as_u64())
            .is_some(),
        "coverage overall must expose 'checks_total'"
    );
    assert!(
        overall
            .get("checks_covered")
            .and_then(|v| v.as_u64())
            .is_some(),
        "coverage overall must expose 'checks_covered'"
    );
    assert!(
        overall.get("total").is_none(),
        "coverage overall must NOT use the ambiguous key 'total' (REQ-111)"
    );
    assert!(
        overall.get("covered").is_none(),
        "coverage overall must NOT use the ambiguous key 'covered' (REQ-111)"
    );
}

// ── rivet matrix ───────────────────────────────────────────────────────

/// `rivet matrix --format json` produces valid JSON with matrix data.
#[test]
fn matrix_json() {
    let output = Command::new(rivet_bin())
        .args([
            "--project",
            project_root().to_str().unwrap(),
            "matrix",
            "--from",
            "requirement",
            "--to",
            "feature",
            "--format",
            "json",
        ])
        .output()
        .expect("failed to execute rivet matrix --format json");

    assert!(
        output.status.success(),
        "rivet matrix --format json must exit 0. stderr: {}",
        String::from_utf8_lossy(&output.stderr)
    );

    let stdout = String::from_utf8_lossy(&output.stdout);
    let parsed: serde_json::Value =
        serde_json::from_str(&stdout).expect("matrix JSON must be valid");

    assert_eq!(
        parsed.get("command").and_then(|v| v.as_str()),
        Some("matrix"),
    );
    assert!(
        parsed.get("rows").and_then(|v| v.as_array()).is_some(),
        "matrix JSON must contain 'rows' array"
    );
    assert!(
        parsed.get("source_type").and_then(|v| v.as_str()).is_some(),
        "matrix JSON must contain 'source_type'"
    );
    assert!(
        parsed.get("target_type").and_then(|v| v.as_str()).is_some(),
        "matrix JSON must contain 'target_type'"
    );
}

/// An all-empty matrix must not silently read as "no traceability": when the
/// chosen direction yields zero links but the opposite direction would, the
/// command emits an actionable `--direction` hint on stderr. A matrix that
/// does have links emits no such hint.
#[test]
fn matrix_empty_emits_direction_hint() {
    let root = project_root();
    let run = |args: &[&str]| {
        let mut a = vec!["--project", root.to_str().unwrap(), "matrix"];
        a.extend_from_slice(args);
        Command::new(rivet_bin())
            .args(&a)
            .output()
            .expect("rivet matrix")
    };

    // design-decision --satisfies--> requirement is a FORWARD link, so the
    // EXPLICIT `--direction backward` yields an empty matrix and must emit the
    // hint. (Omitting --direction now infers forward — REQ-166 / #402 — so the
    // explicit flag is required to exercise the empty-matrix hint path.)
    let empty = run(&[
        "--from",
        "design-decision",
        "--to",
        "requirement",
        "--link",
        "satisfies",
        "--direction",
        "backward",
    ]);
    assert!(empty.status.success());
    let err = String::from_utf8_lossy(&empty.stderr);
    assert!(
        err.contains("--direction forward") && err.contains("runs the other way"),
        "all-empty matrix must hint at the correct direction; stderr: {err}"
    );

    // The correct direction has links and must NOT emit the hint.
    let ok = run(&[
        "--from",
        "design-decision",
        "--to",
        "requirement",
        "--link",
        "satisfies",
        "--direction",
        "forward",
    ]);
    assert!(ok.status.success());
    let ok_err = String::from_utf8_lossy(&ok.stderr);
    assert!(
        !ok_err.contains("runs the other way"),
        "a matrix with links must not emit the empty-direction hint; stderr: {ok_err}"
    );
}

/// REQ-166 / #402: with `--direction` omitted, `rivet matrix` infers the
/// direction + link type that actually connect from -> to. `design-decision`
/// satisfies `requirement` (a forward link), so `--from design-decision --to
/// requirement` (no flag) must produce a NON-empty matrix via `satisfies` —
/// not the old empty `backward` default. Explicit `--direction` is unchanged.
#[test]
fn matrix_infers_direction_when_omitted() {
    let root = project_root();
    let out = Command::new(rivet_bin())
        .args([
            "--project",
            root.to_str().unwrap(),
            "matrix",
            "--from",
            "design-decision",
            "--to",
            "requirement",
            "--format",
            "json",
        ])
        .output()
        .expect("rivet matrix");
    assert!(out.status.success());
    let v: serde_json::Value =
        serde_json::from_str(&String::from_utf8_lossy(&out.stdout)).expect("matrix JSON");
    assert_eq!(
        v["link_type"], "satisfies",
        "should infer the satisfies link"
    );
    assert!(
        v["covered"].as_u64().unwrap_or(0) > 0,
        "inferred matrix must be non-empty; got {v}"
    );

    // Explicit --direction backward stays the old (empty) behavior — proving
    // inference only changes the omitted path.
    let backward = Command::new(rivet_bin())
        .args([
            "--project",
            root.to_str().unwrap(),
            "matrix",
            "--from",
            "design-decision",
            "--to",
            "requirement",
            "--direction",
            "backward",
            "--format",
            "json",
        ])
        .output()
        .expect("rivet matrix");
    let vb: serde_json::Value =
        serde_json::from_str(&String::from_utf8_lossy(&backward.stdout)).expect("matrix JSON");
    assert_eq!(
        vb["covered"].as_u64().unwrap_or(99),
        0,
        "explicit backward must be unchanged (empty)"
    );
}

// ── rivet next-id ──────────────────────────────────────────────────────

/// `rivet next-id --type requirement --format json` produces valid JSON.
#[test]
fn next_id_json() {
    let output = Command::new(rivet_bin())
        .args([
            "--project",
            project_root().to_str().unwrap(),
            "next-id",
            "--type",
            "requirement",
            "--format",
            "json",
        ])
        .output()
        .expect("failed to execute rivet next-id --format json");

    assert!(
        output.status.success(),
        "rivet next-id --format json must exit 0. stderr: {}",
        String::from_utf8_lossy(&output.stderr)
    );

    let stdout = String::from_utf8_lossy(&output.stdout);
    let parsed: serde_json::Value =
        serde_json::from_str(&stdout).expect("next-id JSON must be valid");

    assert!(
        parsed.get("next_id").and_then(|v| v.as_str()).is_some(),
        "next-id JSON must contain 'next_id'"
    );
    assert!(
        parsed.get("prefix").and_then(|v| v.as_str()).is_some(),
        "next-id JSON must contain 'prefix'"
    );
}

/// `rivet next-id <type>` positional shorthand equals `--type <type>`, and a
/// bare prefix positional works too (#447 / REQ-179).
#[test]
fn next_id_positional_shorthand() {
    let run = |args: &[&str]| -> String {
        let out = Command::new(rivet_bin())
            .args(["--project", project_root().to_str().unwrap()])
            .args(args)
            .output()
            .expect("run rivet next-id");
        assert!(
            out.status.success(),
            "rivet {args:?} must exit 0. stderr: {}",
            String::from_utf8_lossy(&out.stderr)
        );
        String::from_utf8_lossy(&out.stdout).trim().to_string()
    };
    // Positional type == --type.
    assert_eq!(
        run(&["next-id", "requirement"]),
        run(&["next-id", "--type", "requirement"])
    );
    // A bare prefix positional resolves to that prefix's next id.
    assert!(run(&["next-id", "FEAT"]).starts_with("FEAT-"));
    // No argument is a clear error (not a panic / silent success).
    let out = Command::new(rivet_bin())
        .args(["--project", project_root().to_str().unwrap(), "next-id"])
        .output()
        .expect("run rivet next-id with no arg");
    assert!(
        !out.status.success(),
        "next-id with no type/prefix must fail"
    );
}

// ── rivet schema subcommands ───────────────────────────────────────────

/// `rivet schema show requirement --format json` produces valid JSON.
#[test]
fn schema_show_json() {
    let output = Command::new(rivet_bin())
        .args([
            "--project",
            project_root().to_str().unwrap(),
            "schema",
            "show",
            "requirement",
            "--format",
            "json",
        ])
        .output()
        .expect("failed to execute rivet schema show --format json");

    assert!(
        output.status.success(),
        "rivet schema show --format json must exit 0. stderr: {}",
        String::from_utf8_lossy(&output.stderr)
    );

    let stdout = String::from_utf8_lossy(&output.stdout);
    let parsed: serde_json::Value =
        serde_json::from_str(&stdout).expect("schema show JSON must be valid");

    assert_eq!(
        parsed.get("command").and_then(|v| v.as_str()),
        Some("schema-show"),
    );
    assert!(
        parsed.get("artifact_type").is_some(),
        "schema show JSON must contain 'artifact_type'"
    );
}

/// `rivet schema links --format json` produces valid JSON with link_types.
#[test]
fn schema_links_json() {
    let output = Command::new(rivet_bin())
        .args([
            "--project",
            project_root().to_str().unwrap(),
            "schema",
            "links",
            "--format",
            "json",
        ])
        .output()
        .expect("failed to execute rivet schema links --format json");

    assert!(
        output.status.success(),
        "rivet schema links --format json must exit 0. stderr: {}",
        String::from_utf8_lossy(&output.stderr)
    );

    let stdout = String::from_utf8_lossy(&output.stdout);
    let parsed: serde_json::Value =
        serde_json::from_str(&stdout).expect("schema links JSON must be valid");

    assert_eq!(
        parsed.get("command").and_then(|v| v.as_str()),
        Some("schema-links"),
    );
    assert!(
        parsed
            .get("link_types")
            .and_then(|v| v.as_array())
            .is_some(),
        "schema links JSON must contain 'link_types' array"
    );
    assert!(
        parsed.get("count").and_then(|v| v.as_u64()).unwrap_or(0) > 0,
        "schema links must report at least one link type"
    );
}

/// `rivet schema rules --format json` produces valid JSON with rules.
#[test]
fn schema_rules_json() {
    let output = Command::new(rivet_bin())
        .args([
            "--project",
            project_root().to_str().unwrap(),
            "schema",
            "rules",
            "--format",
            "json",
        ])
        .output()
        .expect("failed to execute rivet schema rules --format json");

    assert!(
        output.status.success(),
        "rivet schema rules --format json must exit 0. stderr: {}",
        String::from_utf8_lossy(&output.stderr)
    );

    let stdout = String::from_utf8_lossy(&output.stdout);
    let parsed: serde_json::Value =
        serde_json::from_str(&stdout).expect("schema rules JSON must be valid");

    assert_eq!(
        parsed.get("command").and_then(|v| v.as_str()),
        Some("schema-rules"),
    );
    assert!(
        parsed.get("rules").and_then(|v| v.as_array()).is_some(),
        "schema rules JSON must contain 'rules' array"
    );
    assert!(
        parsed.get("count").and_then(|v| v.as_u64()).unwrap_or(0) > 0,
        "schema rules must report at least one rule"
    );
}

/// `rivet schema info stpa --format json` produces valid JSON with schema metadata.
#[test]
fn schema_info_json() {
    let output = Command::new(rivet_bin())
        .args([
            "--project",
            project_root().to_str().unwrap(),
            "schema",
            "info",
            "stpa",
            "--format",
            "json",
        ])
        .output()
        .expect("failed to execute rivet schema info --format json");

    assert!(
        output.status.success(),
        "rivet schema info --format json must exit 0. stderr: {}",
        String::from_utf8_lossy(&output.stderr)
    );

    let stdout = String::from_utf8_lossy(&output.stdout);
    let parsed: serde_json::Value =
        serde_json::from_str(&stdout).expect("schema info JSON must be valid");

    assert_eq!(
        parsed.get("command").and_then(|v| v.as_str()),
        Some("schema-info"),
    );
    assert_eq!(
        parsed.get("name").and_then(|v| v.as_str()),
        Some("stpa"),
        "schema info must report correct schema name"
    );
    assert!(
        parsed.get("version").is_some(),
        "schema info JSON must contain 'version'"
    );
    assert!(
        parsed.get("artifact_type_count").is_some(),
        "schema info JSON must contain 'artifact_type_count'"
    );
}

/// `rivet schema info <name>` (text) reports whether the schema resolved from
/// an on-disk file (pinned in the project) or the embedded copy (compiled into
/// the binary, changes on upgrade). #431 / REQ-176.
// rivet: verifies REQ-176
#[test]
fn schema_info_reports_source() {
    // Embedded: an empty schemas dir → `common` falls back to the compiled-in
    // copy, and the source line must say so.
    let empty = tempfile::tempdir().unwrap();
    let out = Command::new(rivet_bin())
        .args([
            "--schemas",
            empty.path().to_str().unwrap(),
            "schema",
            "info",
            "common",
        ])
        .output()
        .expect("run schema info (embedded)");
    assert!(
        out.status.success(),
        "stderr: {}",
        String::from_utf8_lossy(&out.stderr)
    );
    let text = String::from_utf8_lossy(&out.stdout);
    assert!(
        text.contains("Source: embedded"),
        "expected embedded source, got:\n{text}"
    );

    // On-disk: a schemas dir holding common.yaml → reported as on-disk (pinned).
    let ondisk = tempfile::tempdir().unwrap();
    std::fs::copy(
        project_root().join("schemas").join("common.yaml"),
        ondisk.path().join("common.yaml"),
    )
    .expect("copy common.yaml");
    let out2 = Command::new(rivet_bin())
        .args([
            "--schemas",
            ondisk.path().to_str().unwrap(),
            "schema",
            "info",
            "common",
        ])
        .output()
        .expect("run schema info (on-disk)");
    assert!(
        out2.status.success(),
        "stderr: {}",
        String::from_utf8_lossy(&out2.stderr)
    );
    let text2 = String::from_utf8_lossy(&out2.stdout);
    assert!(
        text2.contains("Source: on-disk"),
        "expected on-disk source, got:\n{text2}"
    );
}

/// `rivet schema sources` reports each active schema's resolution (on-disk /
/// embedded / missing) and — crucially — succeeds even when a schema can't be
/// loaded, since diagnosing that is the point. #431 / REQ-177.
// rivet: verifies REQ-177
#[test]
fn schema_sources_reports_resolution() {
    let dir = tempfile::tempdir().unwrap();
    std::fs::write(
        dir.path().join("rivet.yaml"),
        "project:\n  name: t\n  schemas: [common, made-up]\n",
    )
    .unwrap();
    // An existing-but-empty schemas dir → nothing vendored, so `common` falls
    // back to embedded and `made-up` is missing.
    let empty = tempfile::tempdir().unwrap();
    let out = Command::new(rivet_bin())
        .args([
            "--project",
            dir.path().to_str().unwrap(),
            "--schemas",
            empty.path().to_str().unwrap(),
            "schema",
            "sources",
            "--format",
            "json",
        ])
        .output()
        .expect("run schema sources");
    assert!(
        out.status.success(),
        "schema sources must succeed despite a missing schema. stderr: {}",
        String::from_utf8_lossy(&out.stderr)
    );
    let v: serde_json::Value =
        serde_json::from_str(&String::from_utf8_lossy(&out.stdout)).expect("valid JSON");
    assert_eq!(
        v.get("command").and_then(|c| c.as_str()),
        Some("schema-sources")
    );
    let schemas = v
        .get("schemas")
        .and_then(|s| s.as_array())
        .expect("schemas array");
    let common = schemas
        .iter()
        .find(|s| s["name"] == "common")
        .expect("common present");
    assert_eq!(common["source"], "embedded");
    let made = schemas
        .iter()
        .find(|s| s["name"] == "made-up")
        .expect("made-up present");
    assert_eq!(made["source"], "missing");
}

/// `validate --explain` on an aspice `sw-req` with a verification coverage gap
/// surfaces the verification types that can attach directly. After #652 made
/// the `swe1-has-verification` satisfiers reachable (unit-verification and
/// sw-integration-verification gained `verifies -> sw-req`), all three
/// verification types link directly — so explain lists all three and no longer
/// annotates any as attaching only via the design chain. #350 / #652 / REQ-178.
// rivet: verifies REQ-178
#[test]
fn explain_names_directly_linkable_verification_type() {
    let dir = tempfile::tempdir().unwrap();
    std::fs::write(
        dir.path().join("rivet.yaml"),
        "project:\n  name: t\n  schemas: [common, aspice]\n\
         sources:\n  - path: artifacts\n    format: generic-yaml\n",
    )
    .unwrap();
    std::fs::create_dir_all(dir.path().join("artifacts")).unwrap();
    std::fs::write(
        dir.path().join("artifacts/a.yaml"),
        "artifacts:\n  - id: SWR-1\n    type: sw-req\n    title: Example\n    status: implemented\n",
    )
    .unwrap();

    let out = Command::new(rivet_bin())
        .args([
            "--project",
            dir.path().to_str().unwrap(),
            "validate",
            "--explain",
            "SWR-1",
        ])
        .output()
        .expect("run validate --explain");
    let text = String::from_utf8_lossy(&out.stdout);
    // Explain surfaces the set of directly-linkable verification types. Post-#652
    // that set is all three (not just sw-verification).
    assert!(
        text.contains("from one of")
            && text.contains("sw-verification")
            && text.contains("unit-verification")
            && text.contains("sw-integration-verification"),
        "explain should list every directly-linkable verification type. got:\n{text}"
    );
}

// ── JSON validity sweep ────────────────────────────────────────────────

/// Comprehensive sweep: every command that accepts `--format json` must
/// produce output that parses as valid JSON on stdout.
#[test]
fn all_json_outputs_are_valid() {
    let project = project_root();
    let p = project.to_str().unwrap();

    // (description, args)
    let cases: Vec<(&str, Vec<&str>)> = vec![
        (
            "validate",
            vec!["--project", p, "validate", "--format", "json"],
        ),
        ("list", vec!["--project", p, "list", "--format", "json"]),
        ("stats", vec!["--project", p, "stats", "--format", "json"]),
        (
            "coverage",
            vec!["--project", p, "coverage", "--format", "json"],
        ),
        (
            "get",
            vec!["--project", p, "get", "REQ-001", "--format", "json"],
        ),
        (
            "schema list",
            vec!["--project", p, "schema", "list", "--format", "json"],
        ),
        (
            "schema show",
            vec![
                "--project",
                p,
                "schema",
                "show",
                "requirement",
                "--format",
                "json",
            ],
        ),
        (
            "schema links",
            vec!["--project", p, "schema", "links", "--format", "json"],
        ),
        (
            "schema rules",
            vec!["--project", p, "schema", "rules", "--format", "json"],
        ),
        (
            "schema info",
            vec!["--project", p, "schema", "info", "stpa", "--format", "json"],
        ),
        (
            "matrix",
            vec![
                "--project",
                p,
                "matrix",
                "--from",
                "requirement",
                "--to",
                "feature",
                "--format",
                "json",
            ],
        ),
        (
            "next-id",
            vec![
                "--project",
                p,
                "next-id",
                "--type",
                "requirement",
                "--format",
                "json",
            ],
        ),
        ("docs", vec!["docs", "--format", "json"]),
        (
            "docs grep",
            vec!["docs", "--grep", "verification", "--format", "json"],
        ),
    ];

    for (label, args) in cases {
        let output = Command::new(rivet_bin())
            .args(&args)
            .output()
            .unwrap_or_else(|e| panic!("failed to execute rivet {label}: {e}"));

        let stdout = String::from_utf8_lossy(&output.stdout);
        let stderr = String::from_utf8_lossy(&output.stderr);

        let parsed: Result<serde_json::Value, _> = serde_json::from_str(&stdout);
        assert!(
            parsed.is_ok(),
            "rivet {label} --format json must produce valid JSON.\n\
             stdout: {stdout}\nstderr: {stderr}\nerror: {}",
            parsed.unwrap_err()
        );
    }
}

// ── rivet validate --fail-on <severity> ─────────────────────────────────

/// Build a small project with a single requirement that has no backlink
/// from a feature. The dev schema's `requirement-coverage` rule is a
/// warning — so validation emits 0 errors and 1 warning. This is the
/// fixture used by the `--fail-on` tests.
///
/// Returns the tempdir so the caller controls its lifetime.
fn warning_only_project() -> tempfile::TempDir {
    let tmp = tempfile::tempdir().expect("create temp dir");
    let dir = tmp.path();

    // Init the dev preset (which seeds REQ-001 satisfied by FEAT-001),
    // then overwrite the sample with a requirement that has no
    // satisfying feature so the coverage warning fires.
    let init = Command::new(rivet_bin())
        .args(["init", "--preset", "dev", "--dir", dir.to_str().unwrap()])
        .output()
        .expect("init");
    assert!(
        init.status.success(),
        "init must succeed: {}",
        String::from_utf8_lossy(&init.stderr)
    );

    let artifacts = dir.join("artifacts").join("requirements.yaml");
    // A non-draft status keeps rule severity at its declared level
    // (warning for `requirement-coverage`); draft would downgrade to info.
    // Must be a canonical lifecycle value (REQ-162) so it doesn't itself
    // raise a `status-allowed-values` ERROR — `approved` fits.
    std::fs::write(
        &artifacts,
        "artifacts:\n  - id: REQ-001\n    type: requirement\n    \
         title: Orphan requirement\n    status: approved\n    \
         description: >\n      Unsatisfied — triggers \
         requirement-coverage warning.\n    tags: [core]\n    \
         fields:\n      priority: must\n      category: functional\n",
    )
    .expect("write fixture");

    tmp
}

/// `rivet validate --fail-on error` (the default) must exit 0 on a
/// project that only emits warnings.
#[test]
fn validate_fail_on_error_ignores_warnings() {
    let tmp = warning_only_project();
    let out = Command::new(rivet_bin())
        .args([
            "--project",
            tmp.path().to_str().unwrap(),
            "validate",
            "--format",
            "json",
            "--fail-on",
            "error",
        ])
        .output()
        .expect("validate");

    let stdout = String::from_utf8_lossy(&out.stdout);
    let stderr = String::from_utf8_lossy(&out.stderr);
    let parsed: serde_json::Value = serde_json::from_str(&stdout).expect("validate JSON");

    // Sanity: 0 errors, at least 1 warning.
    assert_eq!(
        parsed.get("errors").and_then(|v| v.as_u64()).unwrap_or(99),
        0,
        "expected 0 errors, got:\n{stdout}"
    );
    assert!(
        parsed.get("warnings").and_then(|v| v.as_u64()).unwrap_or(0) >= 1,
        "expected >=1 warning, got:\n{stdout}"
    );

    assert!(
        out.status.success(),
        "--fail-on error must exit 0 when there are only warnings.\n\
         stdout: {stdout}\nstderr: {stderr}"
    );
}

/// `rivet validate --fail-on warning` must exit 1 on the same project
/// (warnings promote to failures).
#[test]
fn validate_fail_on_warning_fails_on_warnings() {
    let tmp = warning_only_project();
    let out = Command::new(rivet_bin())
        .args([
            "--project",
            tmp.path().to_str().unwrap(),
            "validate",
            "--format",
            "json",
            "--fail-on",
            "warning",
        ])
        .output()
        .expect("validate");

    let stdout = String::from_utf8_lossy(&out.stdout);
    let stderr = String::from_utf8_lossy(&out.stderr);
    assert!(
        !out.status.success(),
        "--fail-on warning must exit non-zero when warnings are present.\n\
         stdout: {stdout}\nstderr: {stderr}"
    );
}

// ── rivet coverage --fail-under ─────────────────────────────────────────

/// `rivet coverage --format json` echoes the threshold block when
/// `--fail-under` is set. Consumers can check `threshold.passed` to
/// distinguish a clean run from a gated failure without parsing stderr.
#[test]
fn coverage_json_echoes_threshold() {
    let output = Command::new(rivet_bin())
        .args([
            "--project",
            project_root().to_str().unwrap(),
            "coverage",
            "--format",
            "json",
            "--fail-under",
            "0",
        ])
        .output()
        .expect("coverage");
    assert!(output.status.success());
    let parsed: serde_json::Value = serde_json::from_slice(&output.stdout).expect("coverage JSON");
    let threshold = parsed
        .get("threshold")
        .expect("threshold block present when --fail-under set");
    assert_eq!(
        threshold
            .get("fail_under")
            .and_then(|v| v.as_f64())
            .unwrap_or(-1.0),
        0.0
    );
    assert_eq!(
        threshold.get("passed").and_then(|v| v.as_bool()),
        Some(true)
    );
}

/// `rivet coverage --fail-under 0` always succeeds (any coverage ≥ 0%).
#[test]
fn coverage_fail_under_zero_passes() {
    let output = Command::new(rivet_bin())
        .args([
            "--project",
            project_root().to_str().unwrap(),
            "coverage",
            "--fail-under",
            "0",
        ])
        .output()
        .expect("coverage");

    assert!(
        output.status.success(),
        "--fail-under 0 must always pass. stderr:\n{}",
        String::from_utf8_lossy(&output.stderr)
    );
}

/// `rivet coverage --fail-under 101` always fails (no project has > 100%).
#[test]
fn coverage_fail_under_above_100_fails() {
    let output = Command::new(rivet_bin())
        .args([
            "--project",
            project_root().to_str().unwrap(),
            "coverage",
            "--fail-under",
            "101",
        ])
        .output()
        .expect("coverage");

    assert!(
        !output.status.success(),
        "--fail-under 101 must fail. stdout:\n{}",
        String::from_utf8_lossy(&output.stdout)
    );
    let stderr = String::from_utf8_lossy(&output.stderr);
    assert!(
        stderr.contains("below threshold") || stderr.contains("coverage"),
        "error message should mention threshold, got:\n{stderr}"
    );
}

/// Without `--fail-under`, coverage is report-only — a low-coverage
/// project still exits 0.
#[test]
fn coverage_without_fail_under_is_report_only() {
    let output = Command::new(rivet_bin())
        .args([
            "--project",
            project_root().to_str().unwrap(),
            "coverage",
            "--format",
            "json",
        ])
        .output()
        .expect("coverage");

    assert!(
        output.status.success(),
        "coverage without --fail-under must exit 0. stderr:\n{}",
        String::from_utf8_lossy(&output.stderr)
    );
}

// ── rivet coverage --matrix (rivet#188 sub-issue 2) ────────────────────

/// Build a tmpdir project that loads the embedded `vv-coverage` schema
/// and ships three `repo-status` artifacts covering the legend's three
/// states: gated, applied-not-gated, and absent.
fn vv_coverage_project() -> tempfile::TempDir {
    let tmp = tempfile::tempdir().expect("create temp dir");
    let dir = tmp.path();

    std::fs::write(
        dir.join("rivet.yaml"),
        "project:\n  name: vv-coverage-test\n  version: \"0.1.0\"\n  \
         schemas: [common, vv-coverage]\nsources:\n  - path: artifacts\n    \
         format: generic-yaml\n",
    )
    .expect("write rivet.yaml");

    let artifacts_dir = dir.join("artifacts");
    std::fs::create_dir_all(&artifacts_dir).expect("artifacts dir");

    std::fs::write(
        artifacts_dir.join("repo-status.yaml"),
        "artifacts:\n  - id: RS-RIVET\n    type: repo-status\n    \
         title: rivet\n    status: valid\n    fields:\n      \
         repo: pulseengine/rivet\n      \
         techniques-applied: [proptest, miri, kani]\n      \
         techniques-gated-in-ci: [proptest, miri]\n      \
         notes: Reference repo for the V&V matrix\n  \
         - id: RS-LOOM\n    type: repo-status\n    title: loom\n    \
         status: valid\n    fields:\n      repo: pulseengine/loom\n      \
         techniques-applied: [proptest, kani]\n      \
         techniques-gated-in-ci: [proptest]\n  \
         - id: RS-GALE\n    type: repo-status\n    title: gale\n    \
         status: draft\n    fields:\n      repo: pulseengine/gale\n      \
         techniques-applied: [kani]\n",
    )
    .expect("write repo-status fixture");

    tmp
}

/// `--matrix --format markdown` renders a pipe-table with the legend,
/// every repo on its own row, and the union of techniques as columns.
#[test]
fn coverage_matrix_markdown() {
    let tmp = vv_coverage_project();
    let out = Command::new(rivet_bin())
        .args([
            "--project",
            tmp.path().to_str().unwrap(),
            "coverage",
            "--matrix",
            "--format",
            "markdown",
        ])
        .output()
        .expect("coverage --matrix --format markdown");

    let stdout = String::from_utf8_lossy(&out.stdout);
    let stderr = String::from_utf8_lossy(&out.stderr);
    assert!(
        out.status.success(),
        "must exit 0. stdout:\n{stdout}\nstderr:\n{stderr}"
    );

    // Heading + legend.
    assert!(
        stdout.contains("# V&V coverage matrix"),
        "heading. {stdout}"
    );
    assert!(stdout.contains("legend:"), "legend present. {stdout}");
    // Header row + separator (markdown table).
    assert!(stdout.contains("| repo |"), "table header. {stdout}");
    assert!(stdout.contains("|---|"), "table separator. {stdout}");
    // All three repos appear in their own rows.
    for repo in ["pulseengine/rivet", "pulseengine/loom", "pulseengine/gale"] {
        assert!(
            stdout.contains(&format!("| {} |", repo)),
            "row for {repo}. {stdout}"
        );
    }
    // Columns are the union (sorted) of `techniques-applied` across rows.
    for col in ["proptest", "miri", "kani"] {
        assert!(stdout.contains(col), "column {col}. {stdout}");
    }
    // Glyph legend in cells: gated > applied > absent.
    assert!(stdout.contains('●'), "gated glyph. {stdout}");
    assert!(stdout.contains('○'), "applied glyph. {stdout}");
    assert!(stdout.contains('·'), "absent glyph. {stdout}");
}

/// `--matrix --format html` emits a `<table>` with one tbody row per
/// repo and `cell-{absent,applied,gated}` classes for downstream styling.
#[test]
fn coverage_matrix_html() {
    let tmp = vv_coverage_project();
    let out = Command::new(rivet_bin())
        .args([
            "--project",
            tmp.path().to_str().unwrap(),
            "coverage",
            "--matrix",
            "--format",
            "html",
        ])
        .output()
        .expect("coverage --matrix --format html");

    let stdout = String::from_utf8_lossy(&out.stdout);
    let stderr = String::from_utf8_lossy(&out.stderr);
    assert!(
        out.status.success(),
        "must exit 0. stdout:\n{stdout}\nstderr:\n{stderr}"
    );

    assert!(stdout.contains("<section"), "html section. {stdout}");
    assert!(stdout.contains("<table>"), "html table. {stdout}");
    assert!(stdout.contains("<thead>"), "html thead. {stdout}");
    assert!(stdout.contains("<tbody>"), "html tbody. {stdout}");
    assert!(
        stdout.contains("<th scope=\"row\">pulseengine/rivet</th>"),
        "row header for rivet. {stdout}"
    );
    // `&` in headings escaped, classes wired up.
    assert!(stdout.contains("V&amp;V"), "& escaped. {stdout}");
    assert!(stdout.contains("cell-gated"), "gated cell class. {stdout}");
    assert!(
        stdout.contains("cell-applied"),
        "applied cell class. {stdout}"
    );
    assert!(
        stdout.contains("cell-absent"),
        "absent cell class. {stdout}"
    );
}

/// `--matrix --format json` is the structured envelope: `command`,
/// `columns`, and `repos[]` with per-cell `{technique, status}` records.
#[test]
fn coverage_matrix_json() {
    let tmp = vv_coverage_project();
    let out = Command::new(rivet_bin())
        .args([
            "--project",
            tmp.path().to_str().unwrap(),
            "coverage",
            "--matrix",
            "--format",
            "json",
        ])
        .output()
        .expect("coverage --matrix --format json");

    let stdout = String::from_utf8_lossy(&out.stdout);
    let stderr = String::from_utf8_lossy(&out.stderr);
    assert!(
        out.status.success(),
        "must exit 0. stdout:\n{stdout}\nstderr:\n{stderr}"
    );

    let parsed: serde_json::Value = serde_json::from_str(&stdout).expect("matrix JSON must parse");

    assert_eq!(
        parsed.get("command").and_then(|v| v.as_str()),
        Some("coverage-matrix"),
        "command tag. {stdout}"
    );

    let columns = parsed
        .get("columns")
        .and_then(|v| v.as_array())
        .expect("columns array");
    let column_names: Vec<&str> = columns.iter().filter_map(|v| v.as_str()).collect();
    // Sorted union of techniques across all rows.
    assert_eq!(
        column_names,
        vec!["kani", "miri", "proptest"],
        "columns. {stdout}"
    );

    let repos = parsed
        .get("repos")
        .and_then(|v| v.as_array())
        .expect("repos array");
    assert_eq!(repos.len(), 3, "three repo-status rows. {stdout}");

    // Find rivet row, assert the three cell statuses are correct.
    let rivet = repos
        .iter()
        .find(|r| r.get("repo").and_then(|v| v.as_str()) == Some("pulseengine/rivet"))
        .expect("rivet row");
    let cells = rivet
        .get("cells")
        .and_then(|v| v.as_array())
        .expect("rivet cells");
    let by_technique: std::collections::BTreeMap<&str, &str> = cells
        .iter()
        .filter_map(|c| {
            let t = c.get("technique")?.as_str()?;
            let s = c.get("status")?.as_str()?;
            Some((t, s))
        })
        .collect();
    assert_eq!(by_technique.get("proptest"), Some(&"gated"));
    assert_eq!(by_technique.get("miri"), Some(&"gated"));
    assert_eq!(by_technique.get("kani"), Some(&"applied"));

    // gale only applies kani — proptest and miri must be absent.
    let gale = repos
        .iter()
        .find(|r| r.get("repo").and_then(|v| v.as_str()) == Some("pulseengine/gale"))
        .expect("gale row");
    let gale_cells = gale
        .get("cells")
        .and_then(|v| v.as_array())
        .expect("gale cells");
    let gale_by: std::collections::BTreeMap<&str, &str> = gale_cells
        .iter()
        .filter_map(|c| {
            let t = c.get("technique")?.as_str()?;
            let s = c.get("status")?.as_str()?;
            Some((t, s))
        })
        .collect();
    assert_eq!(gale_by.get("kani"), Some(&"applied"));
    assert_eq!(gale_by.get("proptest"), Some(&"absent"));
    assert_eq!(gale_by.get("miri"), Some(&"absent"));
}

/// `--matrix --format text` (default text mode) renders the legend and a
/// fixed-width table that's easy to eyeball in a terminal.
#[test]
fn coverage_matrix_text_default() {
    let tmp = vv_coverage_project();
    let out = Command::new(rivet_bin())
        .args([
            "--project",
            tmp.path().to_str().unwrap(),
            "coverage",
            "--matrix",
        ])
        .output()
        .expect("coverage --matrix");

    let stdout = String::from_utf8_lossy(&out.stdout);
    let stderr = String::from_utf8_lossy(&out.stderr);
    assert!(
        out.status.success(),
        "must exit 0. stdout:\n{stdout}\nstderr:\n{stderr}"
    );

    assert!(stdout.contains("V&V coverage matrix"), "title. {stdout}");
    assert!(stdout.contains("legend:"), "legend. {stdout}");
    assert!(stdout.contains("pulseengine/rivet"), "rivet row. {stdout}");
    assert!(stdout.contains("●"), "gated glyph. {stdout}");
}

/// Unknown `--format` values for `--matrix` fail with a helpful error
/// listing the four valid options.
#[test]
fn coverage_matrix_invalid_format_fails() {
    let tmp = vv_coverage_project();
    let out = Command::new(rivet_bin())
        .args([
            "--project",
            tmp.path().to_str().unwrap(),
            "coverage",
            "--matrix",
            "--format",
            "csv",
        ])
        .output()
        .expect("coverage --matrix --format csv");

    assert!(
        !out.status.success(),
        "invalid format must fail. stdout: {}",
        String::from_utf8_lossy(&out.stdout)
    );
    let stderr = String::from_utf8_lossy(&out.stderr);
    assert!(stderr.contains("invalid format"), "diagnostic. {stderr}");
    for fmt in ["text", "json", "markdown", "html"] {
        assert!(stderr.contains(fmt), "lists '{fmt}'. {stderr}");
    }
}

/// `--matrix` and `--tests` are mutually exclusive at the clap layer so
/// users can't accidentally combine the V&V matrix with the
/// test-marker scanner.
#[test]
fn coverage_matrix_conflicts_with_tests_flag() {
    let tmp = vv_coverage_project();
    let out = Command::new(rivet_bin())
        .args([
            "--project",
            tmp.path().to_str().unwrap(),
            "coverage",
            "--matrix",
            "--tests",
        ])
        .output()
        .expect("coverage --matrix --tests");

    assert!(
        !out.status.success(),
        "matrix + tests must conflict. stdout: {}",
        String::from_utf8_lossy(&out.stdout)
    );
    let stderr = String::from_utf8_lossy(&out.stderr);
    assert!(
        stderr.to_lowercase().contains("conflict") || stderr.contains("cannot be used"),
        "clap conflict diagnostic. {stderr}"
    );
}

/// Empty project — no `repo-status` artifacts — still renders cleanly
/// in every format and exits 0 (the matrix is a report, not a gate).
#[test]
fn coverage_matrix_empty_project() {
    let tmp = tempfile::tempdir().expect("create temp dir");
    let dir = tmp.path();
    std::fs::write(
        dir.join("rivet.yaml"),
        "project:\n  name: empty\n  version: \"0.1.0\"\n  \
         schemas: [common, vv-coverage]\nsources:\n  - path: artifacts\n    \
         format: generic-yaml\n",
    )
    .expect("rivet.yaml");
    std::fs::create_dir_all(dir.join("artifacts")).expect("artifacts");

    for (fmt, marker) in [
        ("text", "no `repo-status` artifacts"),
        ("markdown", "No `repo-status`"),
        ("html", "No <code>repo-status</code>"),
    ] {
        let out = Command::new(rivet_bin())
            .args([
                "--project",
                dir.to_str().unwrap(),
                "coverage",
                "--matrix",
                "--format",
                fmt,
            ])
            .output()
            .expect("coverage --matrix on empty project");
        let stdout = String::from_utf8_lossy(&out.stdout);
        let stderr = String::from_utf8_lossy(&out.stderr);
        assert!(
            out.status.success(),
            "empty {fmt} must exit 0. stdout:\n{stdout}\nstderr:\n{stderr}"
        );
        assert!(
            stdout.contains(marker),
            "{fmt}: empty marker '{marker}' missing. {stdout}"
        );
    }

    // JSON: empty repos array, command tag still set.
    let out = Command::new(rivet_bin())
        .args([
            "--project",
            dir.to_str().unwrap(),
            "coverage",
            "--matrix",
            "--format",
            "json",
        ])
        .output()
        .expect("coverage --matrix --format json on empty project");
    let stdout = String::from_utf8_lossy(&out.stdout);
    let parsed: serde_json::Value =
        serde_json::from_str(&stdout).expect("empty matrix JSON parses");
    assert_eq!(
        parsed.get("command").and_then(|v| v.as_str()),
        Some("coverage-matrix")
    );
    assert!(
        parsed
            .get("repos")
            .and_then(|v| v.as_array())
            .map(|a| a.is_empty())
            == Some(true),
        "repos empty. {stdout}"
    );
}

// ── rivet coverage --aggregate (rivet#188 sub-issue 3) ─────────────────

/// Write two single-repo matrix JSON files (the shape
/// `rivet coverage --matrix --format json` emits) into a fresh tmpdir and
/// return `(tmpdir, path_a, path_b)`.
fn aggregate_inputs() -> (tempfile::TempDir, std::path::PathBuf, std::path::PathBuf) {
    let tmp = tempfile::tempdir().expect("create temp dir");
    let a = tmp.path().join("rivet.json");
    let b = tmp.path().join("loom.json");
    std::fs::write(
        &a,
        r#"{"command":"coverage-matrix","columns":["kani","proptest"],
            "repos":[{"id":"RS-RIVET","repo":"pulseengine/rivet",
            "techniques_applied":["kani","proptest"],
            "techniques_gated_in_ci":["proptest"],"notes":"ref",
            "cells":[{"technique":"kani","status":"applied"},
            {"technique":"proptest","status":"gated"}]}]}"#,
    )
    .expect("write a.json");
    std::fs::write(
        &b,
        r#"{"command":"coverage-matrix","columns":["miri"],
            "repos":[{"id":"RS-LOOM","repo":"pulseengine/loom",
            "techniques_applied":["miri","kani"],"techniques_gated_in_ci":[],
            "notes":null,"cells":[{"technique":"miri","status":"applied"}]}]}"#,
    )
    .expect("write b.json");
    (tmp, a, b)
}

/// `--aggregate a.json b.json --format markdown` merges both repos into one
/// table whose columns are the union of every input's techniques.
#[test]
fn coverage_aggregate_markdown_merges_repos() {
    let (tmp, a, b) = aggregate_inputs();
    let out = Command::new(rivet_bin())
        .args([
            "coverage",
            "--aggregate",
            a.to_str().unwrap(),
            b.to_str().unwrap(),
            "--format",
            "markdown",
        ])
        .output()
        .expect("coverage --aggregate --format markdown");
    let stdout = String::from_utf8_lossy(&out.stdout);
    let stderr = String::from_utf8_lossy(&out.stderr);
    assert!(
        out.status.success(),
        "must exit 0. stdout:\n{stdout}\nstderr:\n{stderr}"
    );
    assert!(
        stdout.contains("# V&V coverage matrix"),
        "heading. {stdout}"
    );
    for repo in ["pulseengine/rivet", "pulseengine/loom"] {
        assert!(
            stdout.contains(&format!("| {} |", repo)),
            "row for {repo}. {stdout}"
        );
    }
    // Union of columns across both files, sorted.
    let header = stdout
        .lines()
        .find(|l| l.starts_with("| repo |"))
        .expect("header row");
    assert_eq!(
        header, "| repo | kani | miri | proptest |",
        "merged columns"
    );
    // rivet has proptest CI-gated.
    assert!(stdout.contains('●'), "gated glyph somewhere. {stdout}");
    drop(tmp);
}

/// The aggregate JSON output uses the same envelope as the per-repo
/// command, so it can be fed straight back into `--aggregate`; duplicate
/// (repo, id) rows are coalesced so re-runs are idempotent.
#[test]
fn coverage_aggregate_json_roundtrips_and_dedups() {
    let (tmp, a, b) = aggregate_inputs();
    // Pass `a` twice plus `b`; the duplicate must not produce a second row.
    let out = Command::new(rivet_bin())
        .args([
            "coverage",
            "--aggregate",
            a.to_str().unwrap(),
            a.to_str().unwrap(),
            b.to_str().unwrap(),
            "--format",
            "json",
        ])
        .output()
        .expect("coverage --aggregate --format json");
    assert!(
        out.status.success(),
        "exit 0: {}",
        String::from_utf8_lossy(&out.stderr)
    );
    let stdout = String::from_utf8_lossy(&out.stdout);
    let parsed: serde_json::Value = serde_json::from_str(&stdout).expect("aggregate JSON parses");
    assert_eq!(
        parsed.get("command").and_then(|v| v.as_str()),
        Some("coverage-matrix")
    );
    let repos = parsed
        .get("repos")
        .and_then(|v| v.as_array())
        .expect("repos array");
    assert_eq!(repos.len(), 2, "duplicate row coalesced. {stdout}");
    assert_eq!(
        parsed
            .get("columns")
            .and_then(|v| v.as_array())
            .map(Vec::len),
        Some(3),
        "merged column count. {stdout}"
    );

    // Re-feed the merged output back into the aggregator: same result.
    let merged = tmp.path().join("merged.json");
    std::fs::write(&merged, stdout.as_bytes()).expect("write merged.json");
    let out2 = Command::new(rivet_bin())
        .args([
            "coverage",
            "--aggregate",
            merged.to_str().unwrap(),
            "--format",
            "json",
        ])
        .output()
        .expect("re-aggregate");
    assert!(out2.status.success(), "re-aggregate exit 0");
    let reparsed: serde_json::Value =
        serde_json::from_str(&String::from_utf8_lossy(&out2.stdout)).expect("re-parse");
    assert_eq!(
        reparsed
            .get("repos")
            .and_then(|v| v.as_array())
            .map(Vec::len),
        Some(2),
        "round-trip preserves rows"
    );
}

/// A non-JSON or wrong-shaped input fails with a diagnostic naming the file.
#[test]
fn coverage_aggregate_bad_input_fails() {
    let tmp = tempfile::tempdir().expect("temp dir");
    let bad = tmp.path().join("nope.json");
    std::fs::write(&bad, "this is not json").expect("write");
    let out = Command::new(rivet_bin())
        .args(["coverage", "--aggregate", bad.to_str().unwrap()])
        .output()
        .expect("coverage --aggregate bad");
    assert!(!out.status.success(), "must fail on bad input");
    let stderr = String::from_utf8_lossy(&out.stderr);
    assert!(stderr.contains("nope.json"), "names the file. {stderr}");

    let wrong = tmp.path().join("wrong.json");
    std::fs::write(&wrong, r#"{"hello":"world"}"#).expect("write");
    let out = Command::new(rivet_bin())
        .args(["coverage", "--aggregate", wrong.to_str().unwrap()])
        .output()
        .expect("coverage --aggregate wrong");
    assert!(!out.status.success(), "must fail on wrong shape");
    let stderr = String::from_utf8_lossy(&out.stderr);
    assert!(
        stderr.contains("wrong.json") && stderr.contains("repos"),
        "explains missing repos. {stderr}"
    );
}

/// `rivet stats --format json` exposes diagnostic counts so consumers
/// don't need a second `rivet validate --format json` call just to
/// get the severity breakdown.
#[test]
fn stats_json_includes_diagnostic_counts() {
    let output = Command::new(rivet_bin())
        .args([
            "--project",
            project_root().to_str().unwrap(),
            "stats",
            "--format",
            "json",
        ])
        .output()
        .expect("stats");

    assert!(
        output.status.success(),
        "rivet stats must exit 0: {}",
        String::from_utf8_lossy(&output.stderr)
    );

    let stdout = String::from_utf8_lossy(&output.stdout);
    let parsed: serde_json::Value =
        serde_json::from_str(&stdout).expect("stats JSON must be valid");

    // Backward-compat: existing fields still present.
    assert!(parsed.get("total").is_some(), "'total' still present");
    assert!(parsed.get("types").is_some(), "'types' still present");

    // New fields, numeric, >=0.
    for field in ["errors", "warnings", "infos"] {
        let v = parsed.get(field);
        assert!(
            v.is_some(),
            "stats JSON must include '{field}' count, got: {stdout}"
        );
        assert!(
            v.unwrap().is_u64(),
            "'{field}' must be a number, got: {}",
            v.unwrap()
        );
    }
}

/// Counts in `rivet stats --format json` must match what
/// `rivet validate --format json` reports for the same project.
#[test]
fn stats_json_counts_match_validate() {
    let root = project_root();
    let root_str = root.to_str().unwrap();

    let stats = Command::new(rivet_bin())
        .args(["--project", root_str, "stats", "--format", "json"])
        .output()
        .expect("stats");
    assert!(stats.status.success());
    let stats_json: serde_json::Value = serde_json::from_slice(&stats.stdout).expect("stats JSON");

    let validate = Command::new(rivet_bin())
        .args(["--project", root_str, "validate", "--format", "json"])
        .output()
        .expect("validate");
    let validate_json: serde_json::Value =
        serde_json::from_slice(&validate.stdout).expect("validate JSON");

    for field in ["errors", "warnings", "infos"] {
        let s = stats_json.get(field).and_then(|v| v.as_u64());
        let v = validate_json.get(field).and_then(|v| v.as_u64());
        assert_eq!(
            s, v,
            "stats vs validate disagree on '{field}': stats={s:?} validate={v:?}"
        );
    }
}

// ── rivet schema list-json / get-json ───────────────────────────────────

/// `rivet schema list-json --format json` lists all shipped JSON
/// schemas describing `--format json` output shapes.
#[test]
fn schema_list_json_produces_valid_output() {
    let output = Command::new(rivet_bin())
        .args([
            "--project",
            project_root().to_str().unwrap(),
            "schema",
            "list-json",
            "--format",
            "json",
        ])
        .output()
        .expect("schema list-json");

    assert!(
        output.status.success(),
        "schema list-json must succeed: {}",
        String::from_utf8_lossy(&output.stderr)
    );
    let parsed: serde_json::Value = serde_json::from_slice(&output.stdout).expect("valid JSON");
    assert_eq!(
        parsed.get("command").and_then(|v| v.as_str()),
        Some("schema-list-json"),
    );
    let schemas = parsed
        .get("schemas")
        .and_then(|v| v.as_array())
        .expect("schemas array");
    let names: Vec<&str> = schemas
        .iter()
        .filter_map(|e| e.get("name").and_then(|v| v.as_str()))
        .collect();
    for expected in ["validate", "stats", "coverage", "list", "query"] {
        assert!(
            names.contains(&expected),
            "expected '{expected}' in list, got {names:?}"
        );
    }
    // Every shipped schema must resolve to an existing file on disk.
    for entry in schemas {
        assert_eq!(
            entry.get("exists").and_then(|v| v.as_bool()),
            Some(true),
            "schema entry must exist on disk: {entry}"
        );
    }
}

/// `rivet schema get-json <name>` prints the path to the schema file,
/// and `--content` reads the schema.
#[test]
fn schema_get_json_returns_path_and_content() {
    let root_str = project_root();
    let root_str = root_str.to_str().unwrap();

    for name in ["validate", "stats", "coverage", "list", "query"] {
        // Path mode
        let out = Command::new(rivet_bin())
            .args(["--project", root_str, "schema", "get-json", name])
            .output()
            .expect("get-json path");
        assert!(
            out.status.success(),
            "get-json {name} must succeed: {}",
            String::from_utf8_lossy(&out.stderr)
        );
        let path_str = String::from_utf8_lossy(&out.stdout).trim().to_string();
        let path = std::path::PathBuf::from(&path_str);
        assert!(
            path.exists(),
            "path '{path_str}' printed by get-json {name} must exist"
        );

        // Content mode — verify it's valid JSON and looks like a schema.
        let out = Command::new(rivet_bin())
            .args([
                "--project",
                root_str,
                "schema",
                "get-json",
                name,
                "--content",
            ])
            .output()
            .expect("get-json --content");
        assert!(out.status.success());
        let content: serde_json::Value =
            serde_json::from_slice(&out.stdout).expect("schema JSON parseable");
        assert_eq!(
            content.get("$schema").and_then(|v| v.as_str()),
            Some("https://json-schema.org/draft/2020-12/schema"),
            "{name} schema must declare draft-2020-12"
        );
        assert!(
            content.get("title").and_then(|v| v.as_str()).is_some(),
            "{name} schema must have a title"
        );
    }
}

/// An unknown schema name is rejected with a helpful message.
#[test]
fn schema_get_json_unknown_name_rejected() {
    let out = Command::new(rivet_bin())
        .args([
            "--project",
            project_root().to_str().unwrap(),
            "schema",
            "get-json",
            "bogus",
        ])
        .output()
        .expect("get-json");

    assert!(!out.status.success());
    let stderr = String::from_utf8_lossy(&out.stderr);
    assert!(
        stderr.contains("unknown") || stderr.contains("valid names"),
        "error must list valid names, got: {stderr}"
    );
}

/// Every shipped JSON schema file must itself be parseable as JSON
/// (catches hand-written typos at CI time).
#[test]
fn shipped_json_schemas_are_valid_json() {
    let schemas_dir = project_root().join("schemas").join("json");
    for name in [
        "validate-output.schema.json",
        "stats-output.schema.json",
        "coverage-output.schema.json",
        "list-output.schema.json",
    ] {
        let path = schemas_dir.join(name);
        let content = std::fs::read_to_string(&path)
            .unwrap_or_else(|e| panic!("read {}: {e}", path.display()));
        let parsed: serde_json::Value = serde_json::from_str(&content)
            .unwrap_or_else(|e| panic!("{} is not valid JSON: {e}", path.display()));
        // Minimal well-formed JSON Schema: must be an object with $schema,
        // title, type.
        assert!(parsed.is_object(), "{name} must be a JSON object");
        for key in ["$schema", "title", "type"] {
            assert!(parsed.get(key).is_some(), "{name} must declare '{key}'");
        }
    }
}

/// The `rivet validate --format json` output must conform to the shipped
/// schema — this catches drift between the CLI output shape and the
/// published schema.
#[test]
fn validate_json_output_matches_shipped_schema() {
    let out = Command::new(rivet_bin())
        .args([
            "--project",
            project_root().to_str().unwrap(),
            "validate",
            "--format",
            "json",
        ])
        .output()
        .expect("validate");

    let parsed: serde_json::Value = serde_json::from_slice(&out.stdout).expect("validate JSON");

    // Light-weight schema conformance (no external crate): check the
    // required fields listed in validate-output.schema.json are all
    // present with the expected types.
    let schema_path = project_root()
        .join("schemas")
        .join("json")
        .join("validate-output.schema.json");
    let schema: serde_json::Value =
        serde_json::from_str(&std::fs::read_to_string(&schema_path).expect("read schema"))
            .expect("schema JSON");
    let required = schema
        .get("required")
        .and_then(|v| v.as_array())
        .expect("required array");
    for req in required {
        let key = req.as_str().expect("required[] is string");
        assert!(
            parsed.get(key).is_some(),
            "validate JSON missing required field '{key}'"
        );
    }
    // `command` field must match the const in the schema.
    assert_eq!(
        parsed.get("command").and_then(|v| v.as_str()),
        Some("validate"),
    );
}

/// Same conformance check for `rivet stats --format json`.
#[test]
fn stats_json_output_matches_shipped_schema() {
    let out = Command::new(rivet_bin())
        .args([
            "--project",
            project_root().to_str().unwrap(),
            "stats",
            "--format",
            "json",
        ])
        .output()
        .expect("stats");

    let parsed: serde_json::Value = serde_json::from_slice(&out.stdout).expect("stats JSON");

    let schema_path = project_root()
        .join("schemas")
        .join("json")
        .join("stats-output.schema.json");
    let schema: serde_json::Value =
        serde_json::from_str(&std::fs::read_to_string(&schema_path).expect("read schema"))
            .expect("schema JSON");
    let required = schema
        .get("required")
        .and_then(|v| v.as_array())
        .expect("required array");
    for req in required {
        let key = req.as_str().expect("required[] is string");
        assert!(
            parsed.get(key).is_some(),
            "stats JSON missing required field '{key}'"
        );
    }
    assert_eq!(
        parsed.get("command").and_then(|v| v.as_str()),
        Some("stats")
    );
}

/// An invalid `--fail-on` value is rejected up-front.
#[test]
fn validate_fail_on_invalid_value_rejected() {
    let out = Command::new(rivet_bin())
        .args([
            "--project",
            project_root().to_str().unwrap(),
            "validate",
            "--fail-on",
            "bogus",
        ])
        .output()
        .expect("validate");

    assert!(!out.status.success(), "--fail-on bogus must fail");
    let stderr = String::from_utf8_lossy(&out.stderr);
    assert!(
        stderr.contains("bogus") || stderr.contains("fail-on"),
        "error must mention the bad value, got: {stderr}"
    );
}

// ── rivet query (REQ-007) ───────────────────────────────────────────────

/// `rivet query --sexpr ... --format ids` prints one ID per line.
#[test]
fn query_ids_format_matches_list_filter() {
    let bin = rivet_bin();
    let root = project_root();

    // `rivet list --type requirement` — one line per matching artifact (id + title).
    let list_out = Command::new(&bin)
        .args([
            "--project",
            &root.display().to_string(),
            "list",
            "--type",
            "requirement",
        ])
        .output()
        .expect("run rivet list");
    assert!(list_out.status.success(), "rivet list must succeed");
    let list_stdout = String::from_utf8_lossy(&list_out.stdout);

    // `rivet query --sexpr '(= type "requirement")' --format ids` → only IDs.
    let query_out = Command::new(&bin)
        .args([
            "--project",
            &root.display().to_string(),
            "query",
            "--sexpr",
            r#"(= type "requirement")"#,
            "--limit",
            "1000",
            "--format",
            "ids",
        ])
        .output()
        .expect("run rivet query");
    assert!(
        query_out.status.success(),
        "rivet query must succeed; stderr: {}",
        String::from_utf8_lossy(&query_out.stderr)
    );
    let query_stdout = String::from_utf8_lossy(&query_out.stdout);
    let query_ids: Vec<&str> = query_stdout.lines().filter(|l| !l.is_empty()).collect();

    assert!(
        !query_ids.is_empty(),
        "rivet query must return some requirements; got:\n{query_stdout}"
    );

    // Every ID that `rivet query` reports must also appear somewhere in
    // `rivet list`'s output — confirms the two surfaces agree.
    for id in &query_ids {
        assert!(
            list_stdout.contains(id),
            "id {id} from `rivet query` not found in `rivet list --type requirement` output",
        );
    }
}

/// `rivet query --format json` produces MCP-shape output: filter, count,
/// total, truncated, artifacts[].
#[test]
fn query_json_format_envelope() {
    let bin = rivet_bin();
    let root = project_root();

    let out = Command::new(&bin)
        .args([
            "--project",
            &root.display().to_string(),
            "query",
            "--sexpr",
            r#"(= type "requirement")"#,
            "--limit",
            "5",
            "--format",
            "json",
        ])
        .output()
        .expect("run rivet query");

    assert!(
        out.status.success(),
        "rivet query --format json must succeed; stderr: {}",
        String::from_utf8_lossy(&out.stderr)
    );
    let stdout = String::from_utf8_lossy(&out.stdout);
    let val: serde_json::Value = serde_json::from_str(&stdout).expect("output must be valid JSON");

    assert_eq!(
        val["filter"].as_str(),
        Some(r#"(= type "requirement")"#),
        "filter field must echo input",
    );
    assert!(val["count"].is_number(), "count must be a number");
    assert!(val["total"].is_number(), "total must be a number");
    assert!(val["truncated"].is_boolean(), "truncated must be a bool");
    let arts = val["artifacts"]
        .as_array()
        .expect("artifacts must be array");
    assert!(arts.len() <= 5, "respects --limit");
    for a in arts {
        assert!(a["id"].is_string());
        assert!(a["type"].is_string());
        assert!(a["title"].is_string());
    }
}

/// Invalid filter → non-zero exit with a helpful error.
#[test]
fn query_invalid_filter_reports_parse_error() {
    let bin = rivet_bin();
    let root = project_root();

    let out = Command::new(&bin)
        .args([
            "--project",
            &root.display().to_string(),
            "query",
            "--sexpr",
            "(and (= type", // unbalanced
        ])
        .output()
        .expect("run rivet query");

    assert!(!out.status.success(), "unbalanced filter must fail");
    let stderr = String::from_utf8_lossy(&out.stderr);
    assert!(
        stderr.contains("invalid filter") || stderr.contains("filter"),
        "stderr should mention the filter error; got: {stderr}"
    );
}

// ── rivet externals discover ────────────────────────────────────────────
// rivet: verifies REQ-027

/// `rivet externals discover` reads MODULE.bazel and reports bazel_dep entries,
/// enriching them with git_override URLs and commits.
#[test]
fn externals_discover_bazel_text() {
    let tmp = tempfile::tempdir().unwrap();
    std::fs::write(
        tmp.path().join("MODULE.bazel"),
        r#"module(name = "test_project", version = "1.0.0")
bazel_dep(name = "rules_go", version = "0.41.0")
bazel_dep(name = "rules_rust", version = "0.30.0")
git_override(module_name = "rules_rust", remote = "https://github.com/bazelbuild/rules_rust", commit = "abc123def456")
"#,
    )
    .unwrap();

    let out = Command::new(rivet_bin())
        .args([
            "externals",
            "discover",
            "--path",
            tmp.path().to_str().unwrap(),
        ])
        .output()
        .expect("run rivet externals discover");

    assert!(
        out.status.success(),
        "must exit 0; stderr: {}",
        String::from_utf8_lossy(&out.stderr)
    );
    let stdout = String::from_utf8_lossy(&out.stdout);
    assert!(stdout.contains("Discovered 2 external(s)"), "got: {stdout}");
    assert!(
        stdout.contains("rules_go (bazel, version 0.41.0)"),
        "got: {stdout}"
    );
    assert!(
        stdout.contains("rules_rust (bazel, version 0.30.0)"),
        "got: {stdout}"
    );
    assert!(
        stdout.contains("git: https://github.com/bazelbuild/rules_rust"),
        "git_override URL must be surfaced; got: {stdout}"
    );
    assert!(
        stdout.contains("ref: abc123def456"),
        "commit ref; got: {stdout}"
    );
}

/// `rivet externals discover --format json` emits parseable JSON with the
/// serde-derived shape of `DiscoveredExternal`.
#[test]
fn externals_discover_bazel_json() {
    let tmp = tempfile::tempdir().unwrap();
    std::fs::write(
        tmp.path().join("MODULE.bazel"),
        r#"module(name = "test_project", version = "1.0.0")
bazel_dep(name = "rules_go", version = "0.41.0")
"#,
    )
    .unwrap();

    let out = Command::new(rivet_bin())
        .args([
            "externals",
            "discover",
            "--path",
            tmp.path().to_str().unwrap(),
            "--format",
            "json",
        ])
        .output()
        .expect("run rivet externals discover --format json");

    assert!(out.status.success(), "must exit 0");
    let stdout = String::from_utf8_lossy(&out.stdout);
    let parsed: serde_json::Value =
        serde_json::from_str(&stdout).expect("output must be valid JSON");
    let arr = parsed.as_array().expect("top-level must be array");
    assert_eq!(arr.len(), 1, "one dep");
    assert_eq!(arr[0]["name"], "rules_go");
    assert_eq!(arr[0]["source"], "bazel");
    assert_eq!(arr[0]["version"], "0.41.0");
}

/// With no manifests present, the command reports zero externals (not an error).
#[test]
fn externals_discover_empty_project() {
    let tmp = tempfile::tempdir().unwrap();
    let out = Command::new(rivet_bin())
        .args([
            "externals",
            "discover",
            "--path",
            tmp.path().to_str().unwrap(),
        ])
        .output()
        .expect("run rivet externals discover");

    assert!(out.status.success(), "empty project is not an error");
    let stdout = String::from_utf8_lossy(&out.stdout);
    assert!(
        stdout.contains("No externals discovered"),
        "should say 'No externals discovered'; got: {stdout}"
    );
}

// ── rivet variant matrix ────────────────────────────────────────────────
// rivet: verifies FEAT-001

fn write_matrix_fixture(dir: &std::path::Path) {
    let model = r#"
kind: feature-model
root: product
features:
  product:
    group: mandatory
    children: [scope]
    attributes:
      asil: "QM"
      ci-runner: "ubuntu-latest"
  scope:
    group: alternative
    children: [tiny, full]
  tiny:
    group: leaf
  full:
    group: leaf
constraints: []
"#;
    let binding = r#"
bindings: {}
variants:
  - name: tiny-ci
    selects: [tiny]
  - name: full-ci
    selects: [full]
"#;
    std::fs::write(dir.join("model.yaml"), model).unwrap();
    std::fs::write(dir.join("binding.yaml"), binding).unwrap();
}

/// End-to-end: the command prints a GHA strategy fragment for each
/// variant in the binding, with fail-fast: false by default.
#[test]
fn variant_matrix_emits_github_actions_fragment() {
    let tmp = tempfile::tempdir().unwrap();
    write_matrix_fixture(tmp.path());

    let out = Command::new(rivet_bin())
        .args([
            "variant",
            "matrix",
            "--model",
            tmp.path().join("model.yaml").to_str().unwrap(),
            "--binding",
            tmp.path().join("binding.yaml").to_str().unwrap(),
        ])
        .output()
        .expect("run rivet variant matrix");

    assert!(
        out.status.success(),
        "stderr: {}",
        String::from_utf8_lossy(&out.stderr)
    );
    let stdout = String::from_utf8_lossy(&out.stdout);
    assert!(stdout.contains("strategy:"), "got: {stdout}");
    assert!(stdout.contains("fail-fast: false"));
    assert!(stdout.contains("- variant: tiny-ci"));
    assert!(stdout.contains("- variant: full-ci"));
    assert!(stdout.contains("attr_asil: \"QM\""));
    assert!(stdout.contains("runner: ubuntu-latest"));
    // Round-trips as YAML.
    let _: serde_yaml::Value =
        serde_yaml::from_str(&stdout).expect("emitted fragment is valid YAML");
}

/// `--variant NAME` restricts the matrix to a single entry.
#[test]
fn variant_matrix_filters_by_variant_name() {
    let tmp = tempfile::tempdir().unwrap();
    write_matrix_fixture(tmp.path());

    let out = Command::new(rivet_bin())
        .args([
            "variant",
            "matrix",
            "--model",
            tmp.path().join("model.yaml").to_str().unwrap(),
            "--binding",
            tmp.path().join("binding.yaml").to_str().unwrap(),
            "--variant",
            "full-ci",
        ])
        .output()
        .expect("run rivet variant matrix --variant");

    assert!(out.status.success());
    let stdout = String::from_utf8_lossy(&out.stdout);
    assert!(stdout.contains("- variant: full-ci"));
    assert!(!stdout.contains("- variant: tiny-ci"));
    assert!(stdout.contains("Variants:     1 (filtered from 2)"));
}

/// An empty binding exits non-zero with a guiding error.
#[test]
fn variant_matrix_empty_binding_errors() {
    let tmp = tempfile::tempdir().unwrap();
    std::fs::write(
        tmp.path().join("model.yaml"),
        r#"kind: feature-model
root: p
features:
  p:
    group: mandatory
constraints: []
"#,
    )
    .unwrap();
    std::fs::write(
        tmp.path().join("binding.yaml"),
        "bindings: {}\nvariants: []\n",
    )
    .unwrap();

    let out = Command::new(rivet_bin())
        .args([
            "variant",
            "matrix",
            "--model",
            tmp.path().join("model.yaml").to_str().unwrap(),
            "--binding",
            tmp.path().join("binding.yaml").to_str().unwrap(),
        ])
        .output()
        .expect("run rivet variant matrix");

    assert!(!out.status.success(), "empty matrix must error");
    let stderr = String::from_utf8_lossy(&out.stderr);
    assert!(
        stderr.contains("no variants to emit"),
        "stderr should guide user; got: {stderr}"
    );
}

/// Opt-in actionlint test. Runs only when (a) `RIVET_ACTIONLINT=1` is
/// set (set by CI; off locally by default), and (b) the `actionlint`
/// binary is on PATH. Otherwise prints a skip message and passes.
///
/// This is the strongest possible mechanical check that the emitted
/// workflow is GHA-valid: actionlint statically validates the syntax
/// against the GHA schema. Failure here means we emitted malformed
/// workflow YAML that would fail at dispatch time.
// rivet: verifies FEAT-130
#[test]
fn variant_matrix_actionlint_validates_emitted_workflow() {
    if std::env::var("RIVET_ACTIONLINT").as_deref() != Ok("1") {
        eprintln!("[skipped] set RIVET_ACTIONLINT=1 to enable");
        return;
    }
    if Command::new("actionlint")
        .arg("--version")
        .output()
        .is_err()
    {
        eprintln!("[skipped] actionlint not on PATH");
        return;
    }

    let tmp = tempfile::tempdir().unwrap();
    write_matrix_fixture(tmp.path());

    // Emit a job-wrapped fragment, which actionlint can validate as a
    // standalone (almost-)workflow.
    let out = Command::new(rivet_bin())
        .args([
            "variant",
            "matrix",
            "--model",
            tmp.path().join("model.yaml").to_str().unwrap(),
            "--binding",
            tmp.path().join("binding.yaml").to_str().unwrap(),
            "--wrap",
            "job",
        ])
        .output()
        .expect("run rivet variant matrix --wrap job");
    assert!(out.status.success());
    let fragment = String::from_utf8_lossy(&out.stdout);

    // Wrap the job fragment in a complete workflow shell so actionlint
    // sees a parseable file. The `on: push` is the minimum trigger.
    let workflow = format!("name: ci\non:\n  push:\n{fragment}");
    let wf_path = tmp.path().join("test.yml");
    std::fs::write(&wf_path, workflow).unwrap();

    let lint = Command::new("actionlint")
        .arg(&wf_path)
        .output()
        .expect("run actionlint");

    if !lint.status.success() {
        let stdout = String::from_utf8_lossy(&lint.stdout);
        let stderr = String::from_utf8_lossy(&lint.stderr);
        let body = std::fs::read_to_string(&wf_path).unwrap_or_default();
        panic!(
            "actionlint failed:\n--- stdout ---\n{stdout}\n--- stderr ---\n{stderr}\n\
             --- workflow ---\n{body}"
        );
    }
}

/// `--variants-dir` loads standalone variant YAMLs alongside binding-inline.
#[test]
fn variant_matrix_loads_variants_dir() {
    let tmp = tempfile::tempdir().unwrap();
    write_matrix_fixture(tmp.path());
    // Wipe inline variants; put them as files instead.
    std::fs::write(
        tmp.path().join("binding.yaml"),
        "bindings: {}\nvariants: []\n",
    )
    .unwrap();
    let vdir = tmp.path().join("variants");
    std::fs::create_dir(&vdir).unwrap();
    std::fs::write(
        vdir.join("tiny-ci.yaml"),
        "name: tiny-ci\nselects: [tiny]\n",
    )
    .unwrap();
    std::fs::write(
        vdir.join("full-ci.yaml"),
        "name: full-ci\nselects: [full]\n",
    )
    .unwrap();

    let out = Command::new(rivet_bin())
        .args([
            "variant",
            "matrix",
            "--model",
            tmp.path().join("model.yaml").to_str().unwrap(),
            "--binding",
            tmp.path().join("binding.yaml").to_str().unwrap(),
            "--variants-dir",
            vdir.to_str().unwrap(),
        ])
        .output()
        .expect("run rivet variant matrix --variants-dir");

    assert!(
        out.status.success(),
        "stderr: {}",
        String::from_utf8_lossy(&out.stderr)
    );
    let stdout = String::from_utf8_lossy(&out.stdout);
    assert!(stdout.contains("- variant: tiny-ci"));
    assert!(stdout.contains("- variant: full-ci"));
}

// ── rivet bundle (issue #206) ───────────────────────────────────────────

/// `rivet bundle <ID> --depth 0` returns just the root.
#[test]
fn bundle_depth_zero_root_only() {
    let output = Command::new(rivet_bin())
        .args([
            "--project",
            project_root().to_str().unwrap(),
            "bundle",
            "FEAT-001",
            "--depth",
            "0",
        ])
        .output()
        .expect("run rivet bundle");

    assert!(
        output.status.success(),
        "rivet bundle must exit 0. stderr: {}",
        String::from_utf8_lossy(&output.stderr)
    );

    let stdout = String::from_utf8_lossy(&output.stdout);
    assert!(stdout.contains("# rivet bundle (count=1, depth-max=0)"));
    assert!(stdout.contains("- id: FEAT-001"));
    // depth-0 must NOT pull in neighbours
    assert!(!stdout.contains("- id: REQ-001"));
    assert!(!stdout.contains("- id: REQ-002"));
    assert!(!stdout.contains("- id: DD-031"));
}

/// `rivet bundle <ID> --depth 1 --as yaml` emits inline `# linktype -> target`
/// annotations and the depth-1 closure.
#[test]
fn bundle_depth_one_yaml_with_annotations() {
    let output = Command::new(rivet_bin())
        .args([
            "--project",
            project_root().to_str().unwrap(),
            "bundle",
            "FEAT-001",
            "--depth",
            "1",
            "--as",
            "yaml",
        ])
        .output()
        .expect("run rivet bundle");

    assert!(
        output.status.success(),
        "rivet bundle must exit 0. stderr: {}",
        String::from_utf8_lossy(&output.stderr)
    );

    let stdout = String::from_utf8_lossy(&output.stdout);
    assert!(stdout.contains("- id: FEAT-001"), "root absent: {stdout}");
    assert!(stdout.contains("- id: REQ-001"), "neighbour REQ-001 absent");
    assert!(stdout.contains("- id: REQ-002"), "neighbour REQ-002 absent");
    assert!(
        stdout.contains("# satisfies -> REQ-002"),
        "inline link annotation missing"
    );
    assert!(
        stdout.contains("# implements -> DD-031"),
        "inline link annotation missing"
    );
}

/// `rivet bundle <ID> --as jsonl` emits one JSON record per line, each
/// independently parseable.
#[test]
fn bundle_jsonl_format() {
    let output = Command::new(rivet_bin())
        .args([
            "--project",
            project_root().to_str().unwrap(),
            "bundle",
            "FEAT-001",
            "--depth",
            "1",
            "--as",
            "jsonl",
        ])
        .output()
        .expect("run rivet bundle");

    assert!(
        output.status.success(),
        "rivet bundle --as jsonl must exit 0. stderr: {}",
        String::from_utf8_lossy(&output.stderr)
    );

    let stdout = String::from_utf8_lossy(&output.stdout);
    let lines: Vec<&str> = stdout.lines().filter(|l| !l.is_empty()).collect();
    assert!(
        lines.len() >= 2,
        "jsonl needs root + neighbours, got {}",
        lines.len()
    );
    for line in &lines {
        let parsed: serde_json::Value =
            serde_json::from_str(line).expect("each jsonl line must be valid JSON");
        assert!(
            parsed.get("id").is_some(),
            "each entry must have an `id` field"
        );
        assert!(
            parsed.get("depth").is_some(),
            "each entry must have a `depth` field"
        );
    }
}

/// Missing artifact root → non-zero exit and a clear error message.
#[test]
fn bundle_missing_root_fails() {
    let output = Command::new(rivet_bin())
        .args([
            "--project",
            project_root().to_str().unwrap(),
            "bundle",
            "DOES-NOT-EXIST-9999",
        ])
        .output()
        .expect("run rivet bundle");

    assert!(
        !output.status.success(),
        "rivet bundle on missing root must exit non-zero"
    );
    let stderr = String::from_utf8_lossy(&output.stderr);
    assert!(
        stderr.contains("DOES-NOT-EXIST-9999") || stderr.contains("not found"),
        "stderr must explain the missing root, got: {stderr}"
    );
}

/// Invalid `--as` value is rejected with a clear error.
#[test]
fn bundle_invalid_format_fails() {
    let output = Command::new(rivet_bin())
        .args([
            "--project",
            project_root().to_str().unwrap(),
            "bundle",
            "FEAT-001",
            "--as",
            "xml",
        ])
        .output()
        .expect("run rivet bundle");

    assert!(
        !output.status.success(),
        "rivet bundle --as xml must exit non-zero"
    );
    let stderr = String::from_utf8_lossy(&output.stderr);
    assert!(
        stderr.contains("yaml") && stderr.contains("jsonl"),
        "stderr must list valid formats, got: {stderr}"
    );
}

// ── rivet stats --qualification / --qualification-mode (TCL A5) ─────────

#[test]
fn stats_qualification_emits_baseline_manifest_for_dogfood() {
    // The rivet repo dogfoods its own tool-confidence claim
    // (safety/tool-qualification/rivet-tool-confidence.yaml). The
    // baseline manifest must surface it as TQ-CONF-RIVET at TCL1.
    let output = Command::new(rivet_bin())
        .args([
            "--project",
            project_root().to_str().unwrap(),
            "stats",
            "--qualification",
        ])
        .output()
        .expect("run rivet stats --qualification");
    assert!(
        output.status.success(),
        "stats --qualification must exit 0. stderr: {}",
        String::from_utf8_lossy(&output.stderr)
    );
    let stdout = String::from_utf8_lossy(&output.stdout);
    let value: serde_json::Value = serde_json::from_str(&stdout).expect("valid JSON");
    assert_eq!(value["command"], "stats --qualification");
    let confs = value["tool_confidence"].as_array().expect("array");
    let rivet_claim = confs
        .iter()
        .find(|c| c["id"] == "TQ-CONF-RIVET")
        .expect("TQ-CONF-RIVET present");
    assert_eq!(rivet_claim["tcl"], "TCL1");
    assert_eq!(rivet_claim["regime"], "iso-26262");
}

#[test]
fn qualification_mode_blocks_sync() {
    // --qualification-mode refuses sync (out-of-scope per the dossier).
    let output = Command::new(rivet_bin())
        .args([
            "--project",
            project_root().to_str().unwrap(),
            "--qualification-mode",
            "sync",
            "--local",
        ])
        .output()
        .expect("run rivet --qualification-mode sync");
    assert!(
        !output.status.success(),
        "sync must be refused under --qualification-mode"
    );
    let stderr = String::from_utf8_lossy(&output.stderr);
    assert!(
        stderr.contains("qualification-mode") && stderr.contains("sync"),
        "stderr must mention qualification-mode + sync, got: {stderr}"
    );
}

// ── rivet check ai-defects-open (TCL workstream B) ──────────────────────

/// Build a project with an `ai-found-defect` linked to a status-X
/// requirement, with triage-status Y, optionally with same operator
/// as session invoker (self-triage scenario).
fn ai_defects_project(triage: &str, target_status: &str, self_triage: bool) -> tempfile::TempDir {
    let tmp = tempfile::tempdir().expect("create temp dir");
    let dir = tmp.path();

    let init = Command::new(rivet_bin())
        .args(["init", "--preset", "dev", "--dir", dir.to_str().unwrap()])
        .output()
        .expect("rivet init");
    assert!(init.status.success(), "init failed: {init:?}");

    let invoker = "alice@example.com";
    let triaged_by = if self_triage {
        invoker
    } else {
        "bob@example.com"
    };
    let req_path = dir.join("artifacts").join("requirements.yaml");
    let existing = std::fs::read_to_string(&req_path).expect("read");
    let extra = format!(
        r#"
  - id: REQ-RELEASED
    type: requirement
    title: Released requirement
    status: {target_status}
  - id: AI-SESS-001
    type: ai-session
    title: Test session
    status: approved
    fields:
      session-id: test-session-abc
      model-id: claude-opus-4-7
      invoker: {invoker}
  - id: AID-001
    type: ai-found-defect
    title: Defect against released
    status: approved
    fields:
      severity: major
      triage-status: {triage}
      detected-by: validate
      triaged-by: {triaged_by}
    links:
      - type: defect-against
        target: REQ-RELEASED
      - type: produced-by
        target: AI-SESS-001
"#
    );
    std::fs::write(&req_path, format!("{existing}{extra}")).expect("write");
    tmp
}

#[test]
fn ai_defects_open_passes_when_triaged_and_no_self_triage() {
    let tmp = ai_defects_project("accepted", "released", false);
    let output = Command::new(rivet_bin())
        .args([
            "--project",
            tmp.path().to_str().unwrap(),
            "check",
            "ai-defects-open",
            "--format",
            "json",
        ])
        .output()
        .expect("run check ai-defects-open");
    let stdout = String::from_utf8_lossy(&output.stdout);
    let value: serde_json::Value = serde_json::from_str(&stdout).expect("valid json");
    assert_eq!(
        value["passed"], true,
        "must pass when triage != open. got: {value}"
    );
}

#[test]
fn ai_defects_open_fails_on_open_defect_against_released() {
    let tmp = ai_defects_project("open", "released", false);
    let output = Command::new(rivet_bin())
        .args([
            "--project",
            tmp.path().to_str().unwrap(),
            "check",
            "ai-defects-open",
            "--format",
            "json",
        ])
        .output()
        .expect("run check ai-defects-open");
    assert!(
        !output.status.success(),
        "must exit non-zero when open defect links to released artifact"
    );
    let stdout = String::from_utf8_lossy(&output.stdout);
    let value: serde_json::Value = serde_json::from_str(&stdout).expect("valid json");
    assert_eq!(value["passed"], false);
    assert_eq!(value["summary"]["open_against_released_count"], 1);
    assert_eq!(value["open_against_released"][0]["defect"], "AID-001");
}

#[test]
fn ai_defects_open_fails_on_self_triage_segregation_violation() {
    // Defect triage-status is accepted (Gate 1 passes), but triaged-by ==
    // session invoker — Gate 2 (DPO segregation) must fire.
    let tmp = ai_defects_project("accepted", "draft", true);
    let output = Command::new(rivet_bin())
        .args([
            "--project",
            tmp.path().to_str().unwrap(),
            "check",
            "ai-defects-open",
            "--format",
            "json",
        ])
        .output()
        .expect("run check ai-defects-open");
    assert!(
        !output.status.success(),
        "must exit non-zero when triaged-by == session invoker"
    );
    let stdout = String::from_utf8_lossy(&output.stdout);
    let value: serde_json::Value = serde_json::from_str(&stdout).expect("valid json");
    assert_eq!(value["passed"], false);
    assert_eq!(value["summary"]["self_triaged_count"], 1);
    assert_eq!(value["self_triaged"][0]["triaged_by"], "alice@example.com");
}

// ── rivet supplier (#253 MVP) ───────────────────────────────────────────

/// Build a minimal project with one `external-anchor` artifact and a
/// design-decision that links to it. Used by the supplier smoke tests.
fn supplier_project() -> tempfile::TempDir {
    let tmp = tempfile::tempdir().expect("create temp dir");
    let dir = tmp.path();

    let init = Command::new(rivet_bin())
        .args(["init", "--preset", "dev", "--dir", dir.to_str().unwrap()])
        .output()
        .expect("rivet init");
    assert!(init.status.success(), "init failed: {:?}", init);

    // Append an external anchor + a delegating DD to the requirements file.
    //
    // NB: use a raw string. Plain `"\<newline>..."` literals trigger Rust's
    // whitespace-eating line continuation, which silently strips leading
    // indentation and breaks YAML at column 0.
    let req_path = dir.join("artifacts").join("requirements.yaml");
    let existing = std::fs::read_to_string(&req_path).expect("read requirements");
    let extra = r#"
  - id: ANCHOR-ACME-001
    type: external-anchor
    title: Supplier ACME — SW driver pack
    status: approved
    fields:
      source-of-truth:
        org: acme-electronics
        contract: PO-4711
      expected-derived-types:
        - requirement
      received-status: not-received
      contract-reference: DIA-2026-001
  - id: DD-DELEGATED
    type: design-decision
    title: Delegated to supplier
    status: approved
    links:
      - type: derives-from
        target: ANCHOR-ACME-001
"#;
    std::fs::write(&req_path, format!("{existing}{extra}")).expect("write requirements");
    tmp
}

#[test]
fn supplier_list_text_output() {
    let tmp = supplier_project();
    let output = Command::new(rivet_bin())
        .args([
            "--project",
            tmp.path().to_str().unwrap(),
            "supplier",
            "list",
        ])
        .output()
        .expect("run supplier list");

    assert!(
        output.status.success(),
        "supplier list must exit 0. stderr: {}",
        String::from_utf8_lossy(&output.stderr)
    );
    let stdout = String::from_utf8_lossy(&output.stdout);
    assert!(
        stdout.contains("ANCHOR-ACME-001"),
        "list must show the anchor ID, got: {stdout}"
    );
    assert!(
        stdout.contains("not-received"),
        "list must show received-status, got: {stdout}"
    );
}

#[test]
fn supplier_list_json_shape() {
    let tmp = supplier_project();
    let output = Command::new(rivet_bin())
        .args([
            "--project",
            tmp.path().to_str().unwrap(),
            "supplier",
            "list",
            "--format",
            "json",
        ])
        .output()
        .expect("run supplier list --format json");

    assert!(output.status.success(), "json must succeed");
    let stdout = String::from_utf8_lossy(&output.stdout);
    let value: serde_json::Value = serde_json::from_str(&stdout).expect("valid json");
    assert_eq!(value["command"], "supplier list");
    assert_eq!(value["count"], 1);
    assert_eq!(value["anchors"][0]["id"], "ANCHOR-ACME-001");
    assert_eq!(value["anchors"][0]["received_status"], "not-received");
    assert_eq!(value["anchors"][0]["contract_reference"], "DIA-2026-001");
}

#[test]
fn supplier_check_classifies_delegated_dd_as_boundary() {
    let tmp = supplier_project();
    let output = Command::new(rivet_bin())
        .args([
            "--project",
            tmp.path().to_str().unwrap(),
            "supplier",
            "check",
            "--format",
            "json",
        ])
        .output()
        .expect("run supplier check");

    assert!(output.status.success(), "check must succeed");
    let stdout = String::from_utf8_lossy(&output.stdout);
    let value: serde_json::Value = serde_json::from_str(&stdout).expect("valid json");

    // At least one rule should report DD-DELEGATED as external-boundary.
    let rules = value["rules"].as_array().expect("rules array");
    let saw_boundary = rules.iter().any(|r| {
        r["external_boundary_ids"]
            .as_array()
            .is_some_and(|ids| ids.iter().any(|i| i == "DD-DELEGATED"))
    });
    assert!(
        saw_boundary,
        "DD-DELEGATED must be classified as external_boundary, got: {value}"
    );
}

// ── rivet audit (#127 Phase 2) ─────────────────────────────────────────
// Verifies: REQ-004

/// Initialize a git repo with `git init`, a baseline commit, and then a
/// second commit whose message is `message` authored by `author_email`.
/// Returns (baseline_sha, target_sha) — pass `--since <baseline_sha>` to
/// `rivet audit` so the second commit appears in the range.
fn audit_init_git_repo(
    dir: &std::path::Path,
    message: &str,
    author_email: &str,
) -> (String, String) {
    let run = |args: &[&str]| {
        let out = Command::new("git")
            .args(args)
            .current_dir(dir)
            .output()
            .expect("git command");
        assert!(
            out.status.success(),
            "git {} failed: {}",
            args.join(" "),
            String::from_utf8_lossy(&out.stderr)
        );
        out
    };

    run(&["init", "-q", "-b", "main"]);
    run(&["config", "user.email", "baseline@example.com"]);
    run(&["config", "user.name", "Baseline"]);
    run(&["config", "commit.gpgsign", "false"]);

    // Baseline commit — guaranteed not AI-authored.
    std::fs::write(dir.join("README.md"), "# audit test\n").expect("write README");
    run(&["add", "README.md"]);
    run(&["commit", "-q", "-m", "chore: baseline"]);
    let baseline_out = Command::new("git")
        .args(["rev-parse", "HEAD"])
        .current_dir(dir)
        .output()
        .expect("rev-parse baseline");
    let baseline = String::from_utf8_lossy(&baseline_out.stdout)
        .trim()
        .to_string();

    // Target commit — message + author are caller-controlled.
    run(&["config", "user.email", author_email]);
    run(&["config", "user.name", "Audit Test"]);
    std::fs::write(dir.join("file.txt"), "payload\n").expect("write file.txt");
    run(&["add", "file.txt"]);
    run(&["commit", "-q", "-m", message]);
    let target_out = Command::new("git")
        .args(["rev-parse", "HEAD"])
        .current_dir(dir)
        .output()
        .expect("rev-parse target");
    let target = String::from_utf8_lossy(&target_out.stdout)
        .trim()
        .to_string();

    (baseline, target)
}

/// Write a minimal rivet.yaml + artifact YAML, ready for `rivet audit`.
fn audit_write_project(dir: &std::path::Path, artifacts_yaml: &str) {
    std::fs::write(
        dir.join("rivet.yaml"),
        "project:\n  name: audit-test\n  version: \"0.1.0\"\n  \
         schemas: [common]\nsources:\n  - path: artifacts\n    \
         format: generic-yaml\n",
    )
    .expect("write rivet.yaml");
    let artifacts_dir = dir.join("artifacts");
    std::fs::create_dir_all(&artifacts_dir).expect("artifacts dir");
    std::fs::write(artifacts_dir.join("sessions.yaml"), artifacts_yaml)
        .expect("write sessions.yaml");
}

/// Gate 1 passes when every AI-authored commit has a matching `ai-session`.
#[test]
fn audit_passes_when_ai_commits_have_matching_sessions() {
    let tmp = tempfile::tempdir().expect("tempdir");
    let dir = tmp.path();

    let (baseline, target) = audit_init_git_repo(
        dir,
        "feat: do a thing\n\nCo-Authored-By: Claude <noreply@anthropic.com>\n",
        "alice@example.com",
    );
    let short = &target[..7];

    let artifacts = format!(
        "artifacts:\n  - id: AI-SESS-001\n    type: ai-session\n    \
         title: claude session\n    fields:\n      \
         session-id: abc-123\n      model-id: claude-opus-4-7\n      \
         commit-sha: \"{short}\"\n"
    );
    audit_write_project(dir, &artifacts);

    let out = Command::new(rivet_bin())
        .args([
            "--project",
            dir.to_str().unwrap(),
            "audit",
            "--since",
            &baseline,
            "--strict",
        ])
        .output()
        .expect("rivet audit");

    assert!(
        out.status.success(),
        "audit must pass; stdout:\n{}\nstderr:\n{}",
        String::from_utf8_lossy(&out.stdout),
        String::from_utf8_lossy(&out.stderr)
    );
    let stdout = String::from_utf8_lossy(&out.stdout);
    assert!(
        stdout.contains("audit: PASS"),
        "expected PASS line; got:\n{stdout}"
    );
}

/// Gate 1 fails (with `--strict`) when an AI-authored commit has no matching
/// `ai-session`. Without `--strict`, the same project must still exit 0 but
/// still print the violation in the report.
#[test]
fn audit_fails_when_ai_commit_has_no_session() {
    let tmp = tempfile::tempdir().expect("tempdir");
    let dir = tmp.path();

    let (baseline, target) = audit_init_git_repo(
        dir,
        "feat: orphan ai commit\n\nCo-Authored-By: Claude <noreply@anthropic.com>\n",
        "alice@example.com",
    );

    // Project with NO ai-session artifacts.
    audit_write_project(dir, "artifacts: []\n");

    // --strict: must fail.
    let out = Command::new(rivet_bin())
        .args([
            "--project",
            dir.to_str().unwrap(),
            "audit",
            "--since",
            &baseline,
            "--strict",
        ])
        .output()
        .expect("rivet audit --strict");
    assert!(
        !out.status.success(),
        "audit --strict must fail when AI commits lack sessions; stdout:\n{}",
        String::from_utf8_lossy(&out.stdout)
    );
    let stdout = String::from_utf8_lossy(&out.stdout);
    assert!(
        stdout.contains("audit: FAIL"),
        "FAIL banner; got:\n{stdout}"
    );
    assert!(
        stdout.contains(&target[..7]),
        "short SHA listed; got:\n{stdout}"
    );

    // Without --strict: exit 0, but report still printed.
    let lenient = Command::new(rivet_bin())
        .args([
            "--project",
            dir.to_str().unwrap(),
            "audit",
            "--since",
            &baseline,
        ])
        .output()
        .expect("rivet audit");
    assert!(
        lenient.status.success(),
        "no-strict run must exit 0 even with violations"
    );
    let lenient_out = String::from_utf8_lossy(&lenient.stdout);
    assert!(
        lenient_out.contains("audit: FAIL"),
        "lenient run still prints the report; got:\n{lenient_out}"
    );
}

/// Gate 2 fails when an `ai-session.commit-sha` points at a missing or
/// unreachable commit.
#[test]
fn audit_fails_when_session_points_at_missing_commit() {
    let tmp = tempfile::tempdir().expect("tempdir");
    let dir = tmp.path();

    let (baseline, _target) =
        audit_init_git_repo(dir, "chore: scaffold human\n", "alice@example.com");

    // Session points at a SHA that does NOT exist in the repo.
    let artifacts = "artifacts:\n  - id: AI-SESS-666\n    type: ai-session\n    \
         title: fabricated\n    fields:\n      session-id: zzz\n      \
         model-id: claude-opus-4-7\n      commit-sha: deadbeefdeadbeef\n";
    audit_write_project(dir, artifacts);

    let out = Command::new(rivet_bin())
        .args([
            "--project",
            dir.to_str().unwrap(),
            "audit",
            "--since",
            &baseline,
            "--strict",
        ])
        .output()
        .expect("rivet audit --strict");
    assert!(
        !out.status.success(),
        "audit --strict must fail when session points at missing commit"
    );
    let stdout = String::from_utf8_lossy(&out.stdout);
    assert!(stdout.contains("AI-SESS-666"), "session id; got:\n{stdout}");
    assert!(
        stdout.contains("deadbeefdeadbeef"),
        "missing sha listed; got:\n{stdout}"
    );
    assert!(
        stdout.contains("not-found"),
        "reason 'not-found'; got:\n{stdout}"
    );
}

/// JSON envelope shape on a failing project. Verifies the documented keys
/// so downstream CI consumers can rely on them.
#[test]
fn audit_json_envelope_shape_on_failure() {
    let tmp = tempfile::tempdir().expect("tempdir");
    let dir = tmp.path();

    let (baseline, target) = audit_init_git_repo(
        dir,
        "feat: another orphan\n\nCo-Authored-By: Claude <noreply@anthropic.com>\n",
        "alice@example.com",
    );
    audit_write_project(dir, "artifacts: []\n");

    let out = Command::new(rivet_bin())
        .args([
            "--project",
            dir.to_str().unwrap(),
            "audit",
            "--since",
            &baseline,
            "--format",
            "json",
        ])
        .output()
        .expect("rivet audit --format json");

    let stdout = String::from_utf8_lossy(&out.stdout);
    let parsed: serde_json::Value =
        serde_json::from_str(&stdout).expect("audit --format json must emit valid JSON");

    assert_eq!(
        parsed.get("command").and_then(|v| v.as_str()),
        Some("audit"),
        "command field; got: {parsed}"
    );
    assert_eq!(
        parsed.get("passed").and_then(|v| v.as_bool()),
        Some(false),
        "passed=false; got: {parsed}"
    );
    let viol = parsed
        .get("violations")
        .and_then(|v| v.get("ai_commits_without_session"))
        .and_then(|v| v.as_array())
        .expect("violations array present");
    assert_eq!(viol.len(), 1, "one violation; got: {parsed}");
    let entry = &viol[0];
    assert_eq!(
        entry.get("rule").and_then(|v| v.as_str()),
        Some("audit.ai-commit-without-session"),
        "rule key; got: {entry}"
    );
    assert!(
        entry
            .get("commit")
            .and_then(|v| v.as_str())
            .is_some_and(|c| target.starts_with(c)),
        "commit short SHA prefixes full sha; got: {entry}"
    );
    assert_eq!(
        parsed
            .get("summary")
            .and_then(|s| s.get("total_violations"))
            .and_then(|v| v.as_u64()),
        Some(1),
        "summary.total_violations; got: {parsed}"
    );
}

// ── rivet supplier pull (#288 Phase 2) ───────────────────────────────────

/// Build a fresh dev-preset project, append an `external-anchor`
/// whose `cited-source` points to a local fixture, return the temp
/// dir alongside the file path so each test can choose what to
/// stamp/fetch.
fn supplier_pull_project_with_file(
    payload: &[u8],
    stamp_correct_hash: bool,
) -> (tempfile::TempDir, std::path::PathBuf) {
    use sha2::{Digest, Sha256};
    let tmp = tempfile::tempdir().expect("create temp dir");
    let dir = tmp.path();

    let init = Command::new(rivet_bin())
        .args(["init", "--preset", "dev", "--dir", dir.to_str().unwrap()])
        .output()
        .expect("rivet init");
    assert!(init.status.success(), "init failed: {init:?}");

    // Write the payload at a stable relative path.
    let payload_path = dir.join("suppliers").join("acme.bin");
    std::fs::create_dir_all(payload_path.parent().unwrap()).unwrap();
    std::fs::write(&payload_path, payload).expect("write payload");

    // Compute hash (or pick a wrong one).
    let mut hasher = Sha256::new();
    hasher.update(payload);
    let real_hash = format!("{:x}", hasher.finalize());
    let stamped = if stamp_correct_hash {
        real_hash.clone()
    } else {
        "0".repeat(64)
    };

    let req_path = dir.join("artifacts").join("requirements.yaml");
    let existing = std::fs::read_to_string(&req_path).expect("read requirements");
    let extra = format!(
        r#"
  - id: ANCHOR-ACME-001
    type: external-anchor
    title: Supplier ACME — bin payload
    status: approved
    fields:
      source-of-truth:
        org: acme-electronics
        contract: PO-4711
      expected-derived-types:
        - requirement
      received-status: not-received
      contract-reference: DIA-2026-001
      cited-source:
        uri: suppliers/acme.bin
        kind: file
        sha256: {stamped}
"#
    );
    std::fs::write(&req_path, format!("{existing}{extra}")).expect("write requirements");
    (tmp, payload_path)
}

/// Happy path: `rivet supplier pull` for a `kind: file` anchor with
/// a correctly stamped sha256 writes the payload + a manifest into
/// `.rivet/supplier-cache/<org>/<contract>/` and exits 0.
///
/// Verifies: REQ-007
#[test]
fn supplier_pull_kind_file_writes_cache_and_manifest() {
    let payload = b"-- supplier payload v1 --";
    let (tmp, _) = supplier_pull_project_with_file(payload, true);
    let output = Command::new(rivet_bin())
        .args([
            "--project",
            tmp.path().to_str().unwrap(),
            "supplier",
            "pull",
            "ANCHOR-ACME-001",
            "--format",
            "json",
        ])
        .output()
        .expect("run supplier pull");

    assert!(
        output.status.success(),
        "supplier pull must exit 0. stderr: {}",
        String::from_utf8_lossy(&output.stderr)
    );
    let stdout = String::from_utf8_lossy(&output.stdout);
    let value: serde_json::Value = serde_json::from_str(&stdout).expect("valid json");
    assert_eq!(value["command"], "supplier pull");
    assert_eq!(value["anchor"], "ANCHOR-ACME-001");
    assert_eq!(value["org"], "acme-electronics");
    assert_eq!(value["contract"], "PO-4711");
    assert_eq!(value["kind"], "file");

    // Verify cache files exist under the expected layout.
    let cache = tmp
        .path()
        .join(".rivet")
        .join("supplier-cache")
        .join("acme-electronics")
        .join("PO-4711");
    let payload_path = cache.join("ANCHOR-ACME-001.bin");
    let manifest_path = cache.join("ANCHOR-ACME-001.manifest.yaml");
    assert!(payload_path.exists(), "payload cached at {payload_path:?}");
    assert!(
        manifest_path.exists(),
        "manifest written at {manifest_path:?}"
    );
    let cached_bytes = std::fs::read(&payload_path).unwrap();
    assert_eq!(cached_bytes, payload, "payload bytes must match exactly");
    let manifest = std::fs::read_to_string(&manifest_path).unwrap();
    assert!(
        manifest.contains("source-org: acme-electronics"),
        "manifest must carry source-org, got: {manifest}"
    );
    assert!(
        manifest.contains("source-tool: file"),
        "manifest must carry source-tool, got: {manifest}"
    );
    assert!(
        manifest.contains("anchor: ANCHOR-ACME-001"),
        "manifest must carry anchor, got: {manifest}"
    );
    assert!(
        manifest.contains("source-hash:"),
        "manifest must carry source-hash, got: {manifest}"
    );
}

/// Stamped sha256 that doesn't match the payload bytes refuses to
/// write the cache (the auditor must re-stamp first). The error
/// surfaces on stderr with a `drift` message.
///
/// Verifies: REQ-007
#[test]
fn supplier_pull_refuses_on_sha256_drift() {
    let payload = b"-- supplier payload v1 --";
    let (tmp, _) = supplier_pull_project_with_file(payload, false);
    let output = Command::new(rivet_bin())
        .args([
            "--project",
            tmp.path().to_str().unwrap(),
            "supplier",
            "pull",
            "ANCHOR-ACME-001",
        ])
        .output()
        .expect("run supplier pull");

    assert!(
        !output.status.success(),
        "supplier pull must exit non-zero on stamped-hash drift"
    );
    let stderr = String::from_utf8_lossy(&output.stderr);
    assert!(
        stderr.contains("drift") || stderr.contains("sha256"),
        "error should mention sha256 drift, got: {stderr}"
    );
    // No cache should be written.
    let cache = tmp
        .path()
        .join(".rivet")
        .join("supplier-cache")
        .join("acme-electronics")
        .join("PO-4711");
    let payload_path = cache.join("ANCHOR-ACME-001.bin");
    assert!(
        !payload_path.exists(),
        "drift must NOT write a cache entry, but found {payload_path:?}"
    );
}

/// Re-running `rivet supplier pull` with the same source is a no-op
/// on the payload bytes (idempotent) and only refreshes the manifest.
///
/// Verifies: REQ-007
#[test]
fn supplier_pull_idempotent_on_re_run() {
    let payload = b"-- supplier payload v1 --";
    let (tmp, _) = supplier_pull_project_with_file(payload, true);

    let first = Command::new(rivet_bin())
        .args([
            "--project",
            tmp.path().to_str().unwrap(),
            "supplier",
            "pull",
            "ANCHOR-ACME-001",
            "--format",
            "json",
        ])
        .output()
        .expect("first pull");
    assert!(first.status.success(), "first pull must succeed");
    let v1: serde_json::Value =
        serde_json::from_slice(&first.stdout).expect("valid json on first pull");
    assert_eq!(v1["bytes_unchanged"], serde_json::Value::Bool(false));

    let second = Command::new(rivet_bin())
        .args([
            "--project",
            tmp.path().to_str().unwrap(),
            "supplier",
            "pull",
            "ANCHOR-ACME-001",
            "--format",
            "json",
        ])
        .output()
        .expect("second pull");
    assert!(second.status.success(), "second pull must succeed");
    let v2: serde_json::Value =
        serde_json::from_slice(&second.stdout).expect("valid json on second pull");
    assert_eq!(
        v2["bytes_unchanged"],
        serde_json::Value::Bool(true),
        "re-pull with identical bytes must report bytes_unchanged=true"
    );
}

/// REQ-068 regression: `rivet supplier pull` is the authorisation
/// point for supplier bytes. After a first pull stamps the cache with
/// sha256 X, mutating the supplier file so it hashes to Y must make a
/// flagless re-pull refuse — exit non-zero with an error naming both
/// X and Y plus the supplier identity (org + contract), and leaving
/// the cache untouched. Re-running with `--accept-drift` is the
/// explicit auditor authorisation path: it exits 0 and overwrites the
/// cache with the new bytes.
///
/// Verifies: REQ-068
#[test]
fn supplier_pull_refuses_on_sha256_drift_without_accept_flag() {
    use sha2::{Digest, Sha256};

    let payload_v1 = b"-- supplier payload v1 --";
    let (tmp, payload_path) = supplier_pull_project_with_file(payload_v1, true);
    let project = tmp.path().to_str().unwrap().to_string();

    // First pull: establishes the cache + manifest stamped to hash X.
    let first = Command::new(rivet_bin())
        .args([
            "--project",
            &project,
            "supplier",
            "pull",
            "ANCHOR-ACME-001",
            "--format",
            "json",
        ])
        .output()
        .expect("first pull");
    assert!(
        first.status.success(),
        "first pull must succeed. stderr: {}",
        String::from_utf8_lossy(&first.stderr)
    );

    let cache = tmp
        .path()
        .join(".rivet")
        .join("supplier-cache")
        .join("acme-electronics")
        .join("PO-4711");
    let cached_payload = cache.join("ANCHOR-ACME-001.bin");
    assert_eq!(
        std::fs::read(&cached_payload).unwrap(),
        payload_v1,
        "first pull caches v1 bytes"
    );

    let mut h1 = Sha256::new();
    h1.update(payload_v1);
    let hash_x = format!("{:x}", h1.finalize());

    // Mutate the supplier file so its bytes now hash to Y != X.
    let payload_v2 = b"-- supplier payload v2 (revised by supplier) --";
    std::fs::write(&payload_path, payload_v2).expect("mutate supplier file");
    let mut h2 = Sha256::new();
    h2.update(payload_v2);
    let hash_y = format!("{:x}", h2.finalize());
    assert_ne!(hash_x, hash_y, "sanity: the mutation must change the hash");

    // Flagless re-pull: must refuse and name both hashes + identity.
    let drift = Command::new(rivet_bin())
        .args(["--project", &project, "supplier", "pull", "ANCHOR-ACME-001"])
        .output()
        .expect("drift pull");
    assert!(
        !drift.status.success(),
        "pull on sha256 drift must exit non-zero without --accept-drift"
    );
    let stderr = String::from_utf8_lossy(&drift.stderr);
    assert!(
        stderr.contains(&hash_x),
        "drift error must name the prior sha256 X ({hash_x}), got: {stderr}"
    );
    assert!(
        stderr.contains(&hash_y),
        "drift error must name the new sha256 Y ({hash_y}), got: {stderr}"
    );
    assert!(
        stderr.contains("acme-electronics") && stderr.contains("PO-4711"),
        "drift error must name the supplier identity (org + contract), got: {stderr}"
    );
    // The refusal must NOT overwrite the cache.
    assert_eq!(
        std::fs::read(&cached_payload).unwrap(),
        payload_v1,
        "a refused drift pull must leave the cache untouched"
    );

    // `--accept-drift`: explicit auditor authorisation → exit 0,
    // cache overwritten with the new bytes.
    let accepted = Command::new(rivet_bin())
        .args([
            "--project",
            &project,
            "supplier",
            "pull",
            "ANCHOR-ACME-001",
            "--accept-drift",
            "--format",
            "json",
        ])
        .output()
        .expect("accept-drift pull");
    assert!(
        accepted.status.success(),
        "pull --accept-drift must exit 0. stderr: {}",
        String::from_utf8_lossy(&accepted.stderr)
    );
    let v: serde_json::Value =
        serde_json::from_slice(&accepted.stdout).expect("valid json on accept-drift pull");
    assert_eq!(v["drift_accepted"], serde_json::Value::Bool(true));
    assert_eq!(v["source_hash"], hash_y);
    assert_eq!(
        std::fs::read(&cached_payload).unwrap(),
        payload_v2,
        "accept-drift pull must overwrite the cache with the new bytes"
    );

    // The anchor must be re-stamped to Y so a subsequent re-pull of
    // the SAME bytes is idempotent (not a fresh drift).
    let re_pull = Command::new(rivet_bin())
        .args([
            "--project",
            &project,
            "supplier",
            "pull",
            "ANCHOR-ACME-001",
            "--format",
            "json",
        ])
        .output()
        .expect("idempotent re-pull after accept-drift");
    assert!(
        re_pull.status.success(),
        "re-pull of identical accepted bytes must exit 0. stderr: {}",
        String::from_utf8_lossy(&re_pull.stderr)
    );
}

/// `kind: reqif` end-to-end: minimal well-formed ReqIF in the
/// project, anchored cited-source, hash agrees → cache layout
/// shows `.reqif` extension and `source-tool: reqif-1.2`.
///
/// Verifies: REQ-007
#[test]
fn supplier_pull_kind_reqif_writes_reqif_extension() {
    use sha2::{Digest, Sha256};
    let tmp = tempfile::tempdir().expect("create temp dir");
    let dir = tmp.path();

    let init = Command::new(rivet_bin())
        .args(["init", "--preset", "dev", "--dir", dir.to_str().unwrap()])
        .output()
        .expect("rivet init");
    assert!(init.status.success(), "init failed: {init:?}");

    let reqif_xml = r#"<?xml version="1.0" encoding="UTF-8"?>
<REQ-IF xmlns="http://www.omg.org/spec/ReqIF/20110401/reqif.xsd">
  <THE-HEADER>
    <REQ-IF-HEADER IDENTIFIER="hdr-1">
      <SOURCE-TOOL-ID>supplier-tool</SOURCE-TOOL-ID>
      <TITLE>Supplier delivery</TITLE>
    </REQ-IF-HEADER>
  </THE-HEADER>
  <CORE-CONTENT>
    <REQ-IF-CONTENT>
      <DATATYPES />
      <SPEC-TYPES />
      <SPEC-OBJECTS />
      <SPEC-RELATIONS />
      <SPECIFICATIONS />
    </REQ-IF-CONTENT>
  </CORE-CONTENT>
</REQ-IF>
"#;
    let payload_path = dir.join("suppliers").join("acme.reqif");
    std::fs::create_dir_all(payload_path.parent().unwrap()).unwrap();
    std::fs::write(&payload_path, reqif_xml).expect("write reqif");
    let mut hasher = Sha256::new();
    hasher.update(reqif_xml.as_bytes());
    let stamped = format!("{:x}", hasher.finalize());

    let req_path = dir.join("artifacts").join("requirements.yaml");
    let existing = std::fs::read_to_string(&req_path).expect("read requirements");
    let extra = format!(
        r#"
  - id: ANCHOR-REQIF-001
    type: external-anchor
    title: Supplier ACME — reqif payload
    status: approved
    fields:
      source-of-truth:
        org: acme-electronics
        contract: PO-9000
      expected-derived-types:
        - requirement
      received-status: received-as-reqif
      cited-source:
        uri: suppliers/acme.reqif
        kind: reqif
        sha256: {stamped}
"#
    );
    std::fs::write(&req_path, format!("{existing}{extra}")).expect("write requirements");

    let output = Command::new(rivet_bin())
        .args([
            "--project",
            dir.to_str().unwrap(),
            "supplier",
            "pull",
            "ANCHOR-REQIF-001",
            "--format",
            "json",
        ])
        .output()
        .expect("run supplier pull");
    assert!(
        output.status.success(),
        "kind: reqif pull must succeed. stderr: {}",
        String::from_utf8_lossy(&output.stderr)
    );
    let v: serde_json::Value = serde_json::from_slice(&output.stdout).expect("json");
    assert_eq!(v["kind"], "reqif");

    let cache = dir
        .join(".rivet")
        .join("supplier-cache")
        .join("acme-electronics")
        .join("PO-9000");
    let payload_in_cache = cache.join("ANCHOR-REQIF-001.reqif");
    assert!(payload_in_cache.exists(), "cache must hold .reqif file");
    let manifest = std::fs::read_to_string(cache.join("ANCHOR-REQIF-001.manifest.yaml")).unwrap();
    assert!(
        manifest.contains("source-tool: reqif-1.2"),
        "manifest must mark source-tool as reqif-1.2, got: {manifest}"
    );
}

/// Non-existent anchor ID fails with a clear "no artifact" error.
///
/// Verifies: REQ-007
#[test]
fn supplier_pull_unknown_anchor_errors() {
    let tmp = supplier_project();
    let output = Command::new(rivet_bin())
        .args([
            "--project",
            tmp.path().to_str().unwrap(),
            "supplier",
            "pull",
            "ANCHOR-DOES-NOT-EXIST",
        ])
        .output()
        .expect("run supplier pull");

    assert!(
        !output.status.success(),
        "unknown anchor must exit non-zero"
    );
    let stderr = String::from_utf8_lossy(&output.stderr);
    assert!(
        stderr.contains("ANCHOR-DOES-NOT-EXIST"),
        "error must name the missing anchor, got: {stderr}"
    );
}

/// #353: `--quiet` suppresses the WARN-level log preamble (e.g. the externals
/// "could not load" notice) while leaving the command's stdout and
/// hard-error reporting intact.
#[test]
fn quiet_suppresses_warn_preamble() {
    let tmp = tempfile::tempdir().expect("create temp dir");
    let root = tmp.path();
    std::fs::create_dir_all(root.join("artifacts")).unwrap();
    // A bad external path triggers a deterministic WARN ("could not load
    // externals: …") at default log level.
    std::fs::write(
        root.join("rivet.yaml"),
        "project:\n  name: t\n  version: \"0.1.0\"\n  schemas:\n    - common\n\
         sources:\n  - path: artifacts\n    format: generic-yaml\n\
         externals:\n  missing:\n    path: /nonexistent/path/xyz\n    prefix: missing\n",
    )
    .unwrap();
    std::fs::write(
        root.join("artifacts").join("reqs.yaml"),
        "artifacts:\n  - id: REQ-1\n    type: requirement\n    title: A\n    status: draft\n",
    )
    .unwrap();

    let run = |quiet: bool| {
        let mut args = vec!["--project", root.to_str().unwrap()];
        if quiet {
            args.push("--quiet");
        }
        args.push("list");
        Command::new(rivet_bin())
            .args(&args)
            .output()
            .expect("rivet list")
    };

    let default = run(false);
    let quiet = run(true);
    assert!(default.status.success() && quiet.status.success());

    let default_err = String::from_utf8_lossy(&default.stderr);
    let quiet_err = String::from_utf8_lossy(&quiet.stderr);
    assert!(
        default_err.contains("WARN"),
        "default run should emit the WARN preamble; got: {default_err}"
    );
    assert!(
        !quiet_err.contains("WARN"),
        "--quiet must suppress WARN-level logs; got: {quiet_err}"
    );
    // stdout is unaffected — the artifact still lists.
    assert!(
        String::from_utf8_lossy(&quiet.stdout).contains("REQ-1"),
        "--quiet must not alter stdout"
    );
}

/// #403: `rivet impact --since <ref>` must report only genuinely-changed
/// artifacts, not the whole corpus. Regression for the bespoke baseline parser
/// that diverged from the live loader and flagged hundreds of unchanged
/// artifacts as added/changed. Here REQ-2 is untouched and must NOT appear.
#[test]
fn impact_since_reports_only_real_changes() {
    let tmp = tempfile::tempdir().expect("temp dir");
    let dir = tmp.path();
    let git = |args: &[&str]| {
        let o = Command::new("git")
            .args(args)
            .current_dir(dir)
            .output()
            .expect("git");
        assert!(
            o.status.success(),
            "git {:?}: {}",
            args,
            String::from_utf8_lossy(&o.stderr)
        );
    };
    git(&["init", "-q", "-b", "main"]);
    git(&["config", "user.email", "t@example.com"]);
    git(&["config", "user.name", "T"]);
    git(&["config", "commit.gpgsign", "false"]);
    std::fs::write(
        dir.join("rivet.yaml"),
        "project:\n  name: t\n  version: \"0.1.0\"\n  schemas: [common, dev]\n\
         sources:\n  - path: artifacts\n    format: generic-yaml\n",
    )
    .unwrap();
    std::fs::create_dir_all(dir.join("artifacts")).unwrap();
    let reqs = dir.join("artifacts").join("reqs.yaml");
    // Baseline: REQ-1, REQ-2.
    std::fs::write(
        &reqs,
        "artifacts:\n  - id: REQ-1\n    type: requirement\n    title: One\n    status: draft\n  \
         - id: REQ-2\n    type: requirement\n    title: Two\n    status: draft\n",
    )
    .unwrap();
    git(&["add", "-A"]);
    git(&["commit", "-q", "-m", "baseline"]);

    // Change: REQ-1 title edited, REQ-3 added; REQ-2 untouched.
    std::fs::write(
        &reqs,
        "artifacts:\n  - id: REQ-1\n    type: requirement\n    title: One CHANGED\n    status: draft\n  \
         - id: REQ-2\n    type: requirement\n    title: Two\n    status: draft\n  \
         - id: REQ-3\n    type: requirement\n    title: Three\n    status: draft\n",
    )
    .unwrap();
    git(&["add", "-A"]);
    git(&["commit", "-q", "-m", "change"]);

    let out = Command::new(rivet_bin())
        .args([
            "--project",
            dir.to_str().unwrap(),
            "impact",
            "--since",
            "HEAD~1",
            "--format",
            "json",
        ])
        .output()
        .expect("rivet impact");
    assert!(
        out.status.success(),
        "impact exit: {}",
        String::from_utf8_lossy(&out.stderr)
    );
    let v: serde_json::Value =
        serde_json::from_str(&String::from_utf8_lossy(&out.stdout)).expect("impact JSON");

    let changed: Vec<&str> = v["changed"]
        .as_array()
        .unwrap()
        .iter()
        .filter_map(|c| c["id"].as_str())
        .collect();
    let added: Vec<&str> = v["added"]
        .as_array()
        .unwrap()
        .iter()
        .filter_map(|a| a.as_str())
        .collect();
    // Exactly the real edit + the real add — and the untouched REQ-2 absent.
    assert_eq!(
        changed,
        vec!["REQ-1"],
        "only REQ-1 changed; got {changed:?}"
    );
    assert_eq!(added, vec!["REQ-3"], "only REQ-3 added; got {added:?}");
    assert!(
        !changed.contains(&"REQ-2") && !added.contains(&"REQ-2"),
        "unchanged REQ-2 must not appear"
    );
}

/// REQ-154 / #353: a `generic-yaml` source file with a valid `artifacts:`
/// list plus one unknown top-level key is dropped whole. `rivet list` (and
/// `stats`) must then print a loud "source(s) skipped" block to stderr
/// instead of silently returning a smaller graph — while a clean project
/// emits no such block.
#[test]
fn list_reports_parse_error_skipped_sources() {
    let tmp = tempfile::tempdir().expect("temp dir");
    let dir = tmp.path();
    std::fs::write(
        dir.join("rivet.yaml"),
        "project:\n  name: t\n  version: \"0.1.0\"\n  schemas: [common, dev]\n\
         sources:\n  - path: artifacts\n    format: generic-yaml\n",
    )
    .unwrap();
    std::fs::create_dir_all(dir.join("artifacts")).unwrap();
    let reqs = dir.join("artifacts").join("reqs.yaml");

    // A stray top-level key alongside a valid `artifacts:` list — the whole
    // file is dropped from the graph.
    std::fs::write(
        &reqs,
        "loss-coverage:\n  - foo\nartifacts:\n  - id: REQ-1\n    type: requirement\n    \
         title: One\n    status: draft\n",
    )
    .unwrap();

    let run = |sub: &str| {
        Command::new(rivet_bin())
            .args(["--project", dir.to_str().unwrap(), sub])
            .output()
            .expect("rivet")
    };

    let list = run("list");
    assert!(list.status.success(), "list must still exit 0");
    let list_err = String::from_utf8_lossy(&list.stderr);
    assert!(
        list_err.contains("source(s) skipped") && list_err.contains("reqs.yaml"),
        "list must loudly name the dropped source; stderr: {list_err}"
    );

    let stats = run("stats");
    let stats_err = String::from_utf8_lossy(&stats.stderr);
    assert!(
        stats_err.contains("source(s) skipped") && stats_err.contains("reqs.yaml"),
        "stats must loudly name the dropped source; stderr: {stats_err}"
    );

    // Clean case: a well-formed file emits no skip block.
    std::fs::write(
        &reqs,
        "artifacts:\n  - id: REQ-1\n    type: requirement\n    title: One\n    status: draft\n",
    )
    .unwrap();
    let clean = run("list");
    assert!(clean.status.success());
    let clean_err = String::from_utf8_lossy(&clean.stderr);
    assert!(
        !clean_err.contains("source(s) skipped"),
        "a clean project must not emit a skip block; stderr: {clean_err}"
    );
}

/// REQ-157 / #406: `rivet validate` must emit the per-file `skipping <file>`
/// WARN exactly ONCE for a malformed `generic-yaml` source — it used to print
/// twice (once from `ProjectContext::load`, once from the duplicate-id
/// re-scan). The hard `artifact-parse-error` ERROR must still fire (FAIL).
#[test]
fn validate_emits_single_skip_warn_for_malformed_source() {
    let tmp = tempfile::tempdir().expect("temp dir");
    let dir = tmp.path();
    std::fs::write(
        dir.join("rivet.yaml"),
        "project:\n  name: t\n  version: \"0.1.0\"\n  schemas: [common, dev]\n\
         sources:\n  - path: artifacts\n    format: generic-yaml\n",
    )
    .unwrap();
    std::fs::create_dir_all(dir.join("artifacts")).unwrap();
    // Valid `artifacts:` list plus a stray top-level key -> whole file is a
    // ParseError skip.
    std::fs::write(
        dir.join("artifacts").join("reqs.yaml"),
        "loss-coverage:\n  - foo\nartifacts:\n  - id: REQ-1\n    type: requirement\n    \
         title: One\n    status: draft\n",
    )
    .unwrap();

    let out = Command::new(rivet_bin())
        .args(["--project", dir.to_str().unwrap(), "validate"])
        .output()
        .expect("rivet validate");
    let combined = format!(
        "{}{}",
        String::from_utf8_lossy(&out.stdout),
        String::from_utf8_lossy(&out.stderr)
    );

    let skip_warns = combined
        .lines()
        .filter(|l| l.contains("skipping") && l.contains("reqs.yaml"))
        .count();
    assert_eq!(
        skip_warns, 1,
        "the per-file skip WARN must print exactly once (was 2); output:\n{combined}"
    );
    assert!(
        combined.contains("failed to parse"),
        "the hard artifact-parse-error ERROR must still fire; output:\n{combined}"
    );
    assert!(
        !out.status.success(),
        "validate must FAIL on a malformed artifact source"
    );
}

/// #559: `rivet verify <REQ>` advances an implemented requirement to `verified`
/// when a verifying source-marker (`// rivet: verifies <ID>`) exists, and
/// refuses when there's no evidence.
#[test]
fn verify_advances_on_marker_evidence_and_refuses_without() {
    let tmp = tempfile::tempdir().expect("temp dir");
    let dir = tmp.path();
    let dirs = dir.to_str().unwrap();
    let run = |args: &[&str]| {
        Command::new(rivet_bin())
            .args(["--project", dirs])
            .args(args)
            .output()
            .expect("run rivet")
    };
    assert!(
        Command::new(rivet_bin())
            .args(["init", "--preset", "dev", "--dir", dirs])
            .output()
            .expect("init")
            .status
            .success()
    );
    std::fs::write(
        dir.join("artifacts/reqs.yaml"),
        "artifacts:\n  - id: REQ-9\n    type: requirement\n    title: T\n    status: implemented\n  - id: REQ-8\n    type: requirement\n    title: U\n    status: implemented\n",
    )
    .unwrap();
    std::fs::create_dir_all(dir.join("tests")).unwrap();
    std::fs::write(
        dir.join("tests/t.rs"),
        "// rivet: verifies REQ-9\nfn t() {}\n",
    )
    .unwrap();

    // REQ-9 has a marker -> verify advances it.
    let ok = run(&["verify", "REQ-9"]);
    assert!(
        ok.status.success(),
        "verify REQ-9 must succeed with marker evidence; stderr: {}",
        String::from_utf8_lossy(&ok.stderr)
    );
    let reqs = std::fs::read_to_string(dir.join("artifacts/reqs.yaml")).unwrap();
    assert!(
        reqs.contains("id: REQ-9") && reqs.contains("status: verified"),
        "REQ-9 must now be verified; got:\n{reqs}"
    );

    // REQ-8 has no evidence -> verify refuses (non-zero).
    let no = run(&["verify", "REQ-8"]);
    assert!(
        !no.status.success(),
        "verify REQ-8 must refuse without evidence"
    );
    assert!(
        String::from_utf8_lossy(&no.stderr).contains("no verifying evidence"),
        "refusal must explain the missing evidence"
    );
}

/// #574: in a cargo WORKSPACE layout — no `./src` or `./tests` at the project
/// root, crates live in `<member>/src/` — `rivet verify <ID>` must still find
/// `// rivet: verifies <ID>` markers by DEFAULT (the project-root fallback
/// scan), without an explicit `--scan`. Guards the fallback so a future
/// refactor cannot silently reintroduce #574.
///
/// rivet: verifies REQ-226
#[test]
fn verify_default_scan_finds_markers_in_workspace_member_crate() {
    let tmp = tempfile::tempdir().expect("temp dir");
    let dir = tmp.path();
    let dirs = dir.to_str().unwrap();
    assert!(
        Command::new(rivet_bin())
            .args(["init", "--preset", "dev", "--dir", dirs])
            .output()
            .expect("init")
            .status
            .success()
    );
    std::fs::write(
        dir.join("artifacts/reqs.yaml"),
        "artifacts:\n  - id: REQ-9\n    type: requirement\n    title: T\n    status: implemented\n",
    )
    .unwrap();
    // Workspace shape: the marker lives in a member crate's src/, NOT in a
    // root ./src or ./tests (which a workspace root does not have).
    std::fs::create_dir_all(dir.join("member-crate/src")).unwrap();
    std::fs::write(
        dir.join("member-crate/src/lib.rs"),
        "// rivet: verifies REQ-9\nfn t() {}\n",
    )
    .unwrap();
    // Guard the test premise: there is no root ./src or ./tests to scan.
    assert!(!dir.join("src").exists(), "premise: no root ./src");
    assert!(!dir.join("tests").exists(), "premise: no root ./tests");

    // Default scan (no --scan) must discover the member-crate marker.
    let out = Command::new(rivet_bin())
        .args(["--project", dirs, "verify", "REQ-9"])
        .output()
        .expect("run rivet verify");
    assert!(
        out.status.success(),
        "verify must find the workspace member-crate marker by default (#574); stderr: {}",
        String::from_utf8_lossy(&out.stderr)
    );
    let reqs = std::fs::read_to_string(dir.join("artifacts/reqs.yaml")).unwrap();
    assert!(
        reqs.contains("status: verified"),
        "REQ-9 must be advanced to verified via the default workspace scan; got:\n{reqs}"
    );
}

/// #516: the first-class `release:` field must round-trip end-to-end through the
/// real loader without data loss — load from YAML, query via `(= release …)`,
/// set via `modify --set-release`, and keep sibling artifacts intact. Guards
/// against the silent-drop class of bug (e.g. the rowan-yaml loader, where a
/// missed field extraction makes the value vanish on load — REQ-091 history).
///
/// rivet: verifies REQ-010
#[test]
fn release_field_loads_sets_and_filters_without_loss() {
    let tmp = tempfile::tempdir().expect("temp dir");
    let dir = tmp.path();
    let dirs = dir.to_str().unwrap();
    let run = |args: &[&str]| {
        Command::new(rivet_bin())
            .args(["--project", dirs])
            .args(args)
            .output()
            .expect("run rivet")
    };
    assert!(
        Command::new(rivet_bin())
            .args(["init", "--preset", "dev", "--dir", dirs])
            .output()
            .expect("init")
            .status
            .success()
    );
    std::fs::write(
        dir.join("artifacts/reqs.yaml"),
        "artifacts:\n  \
         - id: REQ-9\n    type: requirement\n    title: T\n    status: implemented\n    release: v0.21.0\n  \
         - id: REQ-8\n    type: requirement\n    title: U\n    status: draft\n",
    )
    .unwrap();

    // 1) `release:` survives the load — filter by it returns REQ-9. (If the
    //    loader dropped it, resolve would yield "" and this would not match.)
    let f = run(&[
        "list",
        "--filter",
        "(= release \"v0.21.0\")",
        "--format",
        "json",
    ]);
    let out = String::from_utf8_lossy(&f.stdout);
    assert!(
        out.contains("REQ-9") && !out.contains("REQ-8"),
        "release must load and be filterable; got:\n{out}"
    );

    // 2) set release on the sibling, then confirm round-trip + no data loss.
    let m = run(&["modify", "REQ-8", "--set-release", "v0.21.0"]);
    assert!(
        m.status.success(),
        "modify --set-release must succeed; stderr: {}",
        String::from_utf8_lossy(&m.stderr)
    );
    let reqs = std::fs::read_to_string(dir.join("artifacts/reqs.yaml")).unwrap();
    assert!(
        reqs.contains("id: REQ-9") && reqs.contains("id: REQ-8"),
        "both artifacts must remain after the edit; got:\n{reqs}"
    );
    assert!(
        reqs.contains("release: v0.21.0"),
        "the set release must be written; got:\n{reqs}"
    );

    // 3) both artifacts now scoped to the release.
    let f2 = run(&[
        "list",
        "--filter",
        "(= release \"v0.21.0\")",
        "--format",
        "json",
    ]);
    let out2 = String::from_utf8_lossy(&f2.stdout);
    assert!(
        out2.contains("REQ-9") && out2.contains("REQ-8"),
        "both artifacts must now be in release v0.21.0; got:\n{out2}"
    );

    // 4) the project still validates (file is not corrupted).
    assert!(
        run(&["validate"]).status.success(),
        "project must still validate after release edits"
    );
}

/// REQ-232 (#516): `rivet list --release <ver>` is the release-planning view —
/// it keeps only artifacts scoped to that release and composes with the other
/// filters. Sugar for `--filter '(= release "<ver>")'`.
///
/// rivet: verifies REQ-232
#[test]
fn list_release_flag_filters_by_release_scope() {
    let tmp = tempfile::tempdir().expect("temp dir");
    let dir = tmp.path();
    let dirs = dir.to_str().unwrap();
    assert!(
        Command::new(rivet_bin())
            .args(["init", "--preset", "dev", "--dir", dirs])
            .output()
            .expect("init")
            .status
            .success()
    );
    std::fs::write(
        dir.join("artifacts/reqs.yaml"),
        "artifacts:\n  \
         - id: REQ-9\n    type: requirement\n    title: A\n    status: draft\n    release: v1.0.0\n  \
         - id: REQ-8\n    type: requirement\n    title: B\n    status: draft\n    release: v2.0.0\n  \
         - id: REQ-7\n    type: requirement\n    title: C\n    status: draft\n",
    )
    .unwrap();
    let run = |args: &[&str]| {
        let out = Command::new(rivet_bin())
            .args(["--project", dirs])
            .args(args)
            .output()
            .expect("run rivet");
        String::from_utf8_lossy(&out.stdout).into_owned()
    };

    // --release keeps only the matching artifact.
    let v1 = run(&["list", "--release", "v1.0.0", "--format", "json"]);
    assert!(
        v1.contains("REQ-9") && !v1.contains("REQ-8") && !v1.contains("REQ-7"),
        "--release v1.0.0 must keep only REQ-9; got:\n{v1}"
    );

    // Unassigned artifacts (no release) are excluded.
    let v2 = run(&["list", "--release", "v2.0.0", "--format", "json"]);
    assert!(
        v2.contains("REQ-8") && !v2.contains("REQ-7"),
        "--release v2.0.0 must keep only REQ-8; got:\n{v2}"
    );

    // Composes with --status (REQ-9 is draft → still matches).
    let combined = run(&[
        "list",
        "--release",
        "v1.0.0",
        "--status",
        "draft",
        "--format",
        "json",
    ]);
    assert!(
        combined.contains("REQ-9"),
        "--release must compose with --status; got:\n{combined}"
    );

    // Unknown release → empty.
    let none = run(&["list", "--release", "v9.9.9", "--format", "json"]);
    assert!(
        !none.contains("REQ-"),
        "an unknown release must list nothing; got:\n{none}"
    );
}

/// REQ-233 (#516): `rivet release status <ver>` reports the readiness burn-down
/// — the not-yet-verified set — and exits non-zero while the release is not
/// cuttable, zero once every scoped artifact is verified/accepted.
///
/// rivet: verifies REQ-233
#[test]
fn release_status_reports_burn_down_and_exit_code() {
    let tmp = tempfile::tempdir().expect("temp dir");
    let dir = tmp.path();
    let dirs = dir.to_str().unwrap();
    assert!(
        Command::new(rivet_bin())
            .args(["init", "--preset", "dev", "--dir", dirs])
            .output()
            .expect("init")
            .status
            .success()
    );
    let reqs = dir.join("artifacts/reqs.yaml");
    // Two in v1.0.0: one verified, one still proposed → not cuttable.
    std::fs::write(
        &reqs,
        "artifacts:\n  \
         - id: REQ-9\n    type: requirement\n    title: A\n    status: verified\n    release: v1.0.0\n  \
         - id: REQ-8\n    type: requirement\n    title: B\n    status: proposed\n    release: v1.0.0\n",
    )
    .unwrap();

    let status = Command::new(rivet_bin())
        .args(["--project", dirs, "release", "status", "v1.0.0"])
        .output()
        .expect("release status");
    let out = String::from_utf8_lossy(&status.stdout);
    assert!(
        out.contains("REQ-8") && out.contains("NOT cuttable"),
        "must list the not-yet-verified artifact and flag not-cuttable; got:\n{out}"
    );
    assert!(
        !status.status.success(),
        "must exit non-zero while the release is not cuttable (so CI can gate)"
    );

    // Verify REQ-8 → now everything is done → cuttable, exit zero.
    std::fs::write(
        &reqs,
        "artifacts:\n  \
         - id: REQ-9\n    type: requirement\n    title: A\n    status: verified\n    release: v1.0.0\n  \
         - id: REQ-8\n    type: requirement\n    title: B\n    status: verified\n    release: v1.0.0\n",
    )
    .unwrap();
    let status2 = Command::new(rivet_bin())
        .args(["--project", dirs, "release", "status", "v1.0.0"])
        .output()
        .expect("release status");
    assert!(
        status2.status.success(),
        "must exit zero once every scoped artifact is verified; stdout:\n{}",
        String::from_utf8_lossy(&status2.stdout)
    );
    assert!(
        String::from_utf8_lossy(&status2.stdout).contains("Cuttable"),
        "must report the release as cuttable"
    );
}

/// #628: an EMPTY release scope (a version nobody has assigned artifacts to,
/// or — most commonly — a mistyped version) must NOT report as cuttable. A
/// `rivet release status vX.Y.Z || fail` CI gate must not green on "ship a
/// release containing nothing".
///
/// rivet: verifies REQ-234
#[test]
fn release_status_empty_scope_is_not_cuttable() {
    let tmp = tempfile::tempdir().expect("temp dir");
    let dir = tmp.path();
    let dirs = dir.to_str().unwrap();
    assert!(
        Command::new(rivet_bin())
            .args(["init", "--preset", "dev", "--dir", dirs])
            .output()
            .expect("init")
            .status
            .success()
    );
    // One artifact, scoped to v1.0.0 — NOT to the version we query below.
    let reqs = dir.join("artifacts/reqs.yaml");
    std::fs::write(
        &reqs,
        "artifacts:\n  \
         - id: REQ-9\n    type: requirement\n    title: A\n    status: verified\n    release: v1.0.0\n",
    )
    .unwrap();

    // A version nobody scoped: empty scope must be non-zero (text + json).
    let status = Command::new(rivet_bin())
        .args(["--project", dirs, "release", "status", "v2.0.0"])
        .output()
        .expect("release status");
    assert!(
        !status.status.success(),
        "empty scope must exit non-zero so a CI gate can't green a typo'd/empty release; stdout:\n{}",
        String::from_utf8_lossy(&status.stdout)
    );

    let json = Command::new(rivet_bin())
        .args([
            "--project",
            dirs,
            "release",
            "status",
            "v2.0.0",
            "--format",
            "json",
        ])
        .output()
        .expect("release status json");
    let v: serde_json::Value =
        serde_json::from_slice(&json.stdout).expect("json output must parse");
    assert_eq!(v["total"], 0, "no artifacts should be scoped to v2.0.0");
    assert_eq!(
        v["cuttable"], false,
        "an empty release scope must not be cuttable"
    );
}

/// REQ-254 (#673): `rivet release check <ver> --variant <name>` cross-checks a
/// release against a variant — partitioning release-tagged artifacts into
/// in-scope / out-of-scope / variant-only AND running the release-readiness
/// predicate scoped to the intersection. Verifies: (a) an artifact tagged for
/// the release but outside the variant lands in out-of-scope; (b) cuttability
/// reflects ONLY the in-scope set (an unready out-of-scope artifact does not
/// block, but an unready in-scope one does); (c) `--format json` carries the id
/// lists; (d) `--strict` fails on any out-of-scope artifact.
///
/// rivet: verifies REQ-254
#[test]
fn release_check_partitions_release_against_variant() {
    let tmp = tempfile::tempdir().expect("temp dir");
    let dir = tmp.path();
    let dirs = dir.to_str().unwrap();
    assert!(
        Command::new(rivet_bin())
            .args(["init", "--preset", "dev", "--dir", dirs])
            .output()
            .expect("init")
            .status
            .success()
    );

    // Three requirements, all tagged for v1.0.0. REQ-1/REQ-2 are bound by the
    // `core` feature; REQ-3 by `extra`. REQ-3 is deliberately NOT release-ready.
    std::fs::write(
        dir.join("artifacts/reqs.yaml"),
        "artifacts:\n  \
         - id: REQ-1\n    type: requirement\n    title: Core one\n    status: verified\n    release: v1.0.0\n  \
         - id: REQ-2\n    type: requirement\n    title: Core two\n    status: verified\n    release: v1.0.0\n  \
         - id: REQ-3\n    type: requirement\n    title: Extra\n    status: proposed\n    release: v1.0.0\n",
    )
    .unwrap();

    // Feature model: `core` and `extra` are freely-selectable children.
    std::fs::write(
        dir.join("artifacts/feature-model.yaml"),
        "kind: feature-model\nroot: product\nfeatures:\n  \
         product:\n    group: optional\n    children: [core, extra]\n  \
         core:\n    group: leaf\n  \
         extra:\n    group: leaf\nconstraints: []\n",
    )
    .unwrap();
    std::fs::write(
        dir.join("artifacts/bindings.yaml"),
        "bindings:\n  \
         core:\n    artifacts: [REQ-1, REQ-2]\n  \
         extra:\n    artifacts: [REQ-3]\n",
    )
    .unwrap();

    let variants_dir = dir.join("artifacts/variants");
    std::fs::create_dir_all(&variants_dir).unwrap();
    // `minimal` selects only `core` → binds {REQ-1, REQ-2}.
    std::fs::write(
        variants_dir.join("minimal.yaml"),
        "name: minimal\nselects:\n  - core\n",
    )
    .unwrap();
    // `full` selects both → binds {REQ-1, REQ-2, REQ-3}.
    std::fs::write(
        variants_dir.join("full.yaml"),
        "name: full\nselects:\n  - core\n  - extra\n",
    )
    .unwrap();

    // ── minimal: REQ-3 (unready) is OUT of scope → cuttable, exit 0. ──────
    let out = Command::new(rivet_bin())
        .args([
            "--project",
            dirs,
            "release",
            "check",
            "v1.0.0",
            "--variant",
            "minimal",
        ])
        .output()
        .expect("release check");
    let text = String::from_utf8_lossy(&out.stdout);
    assert!(
        out.status.success(),
        "in-scope set (REQ-1, REQ-2) is all verified → cuttable → exit 0; stdout:\n{text}\nstderr:\n{}",
        String::from_utf8_lossy(&out.stderr)
    );
    assert!(
        text.contains("out-of-scope") && text.contains("REQ-3"),
        "REQ-3 is tagged for the release but outside `minimal` → must appear as out-of-scope; got:\n{text}"
    );
    assert!(
        text.contains("Cuttable"),
        "release must be cuttable within the variant; got:\n{text}"
    );

    // ── minimal --format json: id lists + cuttable. ─────────────────────
    let jout = Command::new(rivet_bin())
        .args([
            "--project",
            dirs,
            "release",
            "check",
            "v1.0.0",
            "--variant",
            "minimal",
            "--format",
            "json",
        ])
        .output()
        .expect("release check json");
    let v: serde_json::Value = serde_json::from_slice(&jout.stdout).expect("json parses");
    let ids = |k: &str| -> Vec<String> {
        v[k].as_array()
            .unwrap()
            .iter()
            .map(|x| x.as_str().unwrap().to_string())
            .collect()
    };
    assert_eq!(
        ids("in_scope"),
        vec!["REQ-1", "REQ-2"],
        "in_scope = intersection"
    );
    assert_eq!(
        ids("out_of_scope"),
        vec!["REQ-3"],
        "out_of_scope = tagged \\ variant"
    );
    assert!(
        ids("variant_only").is_empty(),
        "no variant-only artifacts here"
    );
    assert_eq!(v["cuttable"], true, "in-scope all verified → cuttable");
    assert_eq!(v["variant"], "minimal");

    // ── minimal --strict: out-of-scope non-empty → exit non-zero. ───────
    let sout = Command::new(rivet_bin())
        .args([
            "--project",
            dirs,
            "release",
            "check",
            "v1.0.0",
            "--variant",
            "minimal",
            "--strict",
        ])
        .output()
        .expect("release check strict");
    assert!(
        !sout.status.success(),
        "--strict must fail when any release artifact is out-of-scope; stdout:\n{}",
        String::from_utf8_lossy(&sout.stdout)
    );

    // ── full: REQ-3 (unready) is now IN scope → NOT cuttable, exit non-zero.
    // This proves cuttability tracks the in-scope set, not the whole release.
    let fout = Command::new(rivet_bin())
        .args([
            "--project",
            dirs,
            "release",
            "check",
            "v1.0.0",
            "--variant",
            "full",
            "--format",
            "json",
        ])
        .output()
        .expect("release check full");
    let fv: serde_json::Value = serde_json::from_slice(&fout.stdout).expect("json parses");
    assert_eq!(
        fv["cuttable"], false,
        "REQ-3 is now in-scope and not release-ready → not cuttable"
    );
    assert!(
        !fout.status.success(),
        "an unready in-scope artifact must drive a non-zero exit"
    );
    let fin_scope = fv["in_scope"].as_array().unwrap();
    assert_eq!(
        fin_scope.len(),
        3,
        "all three artifacts are in scope for `full`"
    );
}

/// REQ-240 (#612): `rivet release status` readiness is configurable via
/// `rivet.yaml`'s `release:` block — the built-in verified/accepted set can be
/// extended by `ready-when`, and `require: coverage` derives readiness from
/// validate V-closure so a V-model/ASPICE project (which verifies via links,
/// not a status flip) can green the gate. An approved-but-V-closed artifact is
/// the discriminating case: not ready by status, ready by coverage.
///
/// rivet: verifies REQ-240
#[test]
fn release_status_ready_when_and_coverage_modes() {
    let tmp = tempfile::tempdir().expect("temp dir");
    let dir = tmp.path();
    let dirs = dir.to_str().unwrap();
    std::fs::create_dir_all(dir.join("schemas")).unwrap();
    std::fs::create_dir_all(dir.join("artifacts")).unwrap();
    // A minimal schema with one traceability rule: a widget must be traced by
    // a part. WID-001 is `approved` (not verified) but its V is CLOSED via
    // PART-001 — so it discriminates status-readiness from coverage-readiness.
    std::fs::write(
        dir.join("schemas/mini.yaml"),
        "schema:\n  name: mini\n  version: \"0.1.0\"\n\
         artifact-types:\n  \
         - name: widget\n    description: W\n    link-fields:\n      \
             - name: traces\n        link-type: traces\n        cardinality: zero-or-many\n  \
         - name: part\n    description: P\n    link-fields:\n      \
             - name: traces\n        link-type: traces\n        cardinality: zero-or-many\n\
         traceability-rules:\n  \
         - name: widget-traced\n    description: every widget must be traced by a part\n    \
             source-type: widget\n    required-backlink: traces\n    from-types: [part]\n    \
             severity: warning\n",
    )
    .unwrap();
    std::fs::write(
        dir.join("artifacts/a.yaml"),
        "artifacts:\n  \
         - id: WID-001\n    type: widget\n    title: closed\n    status: approved\n    release: v1.0.0\n  \
         - id: PART-001\n    type: part\n    title: part\n    status: approved\n    \
             links:\n      - type: traces\n        target: WID-001\n",
    )
    .unwrap();

    let write_cfg = |release_block: &str| {
        std::fs::write(
            dir.join("rivet.yaml"),
            format!(
                "project:\n  name: p\n  schemas: [mini]\n\
                 sources:\n  - path: artifacts\n    format: generic-yaml\n{release_block}"
            ),
        )
        .unwrap();
    };
    let cuttable = || -> bool {
        let out = Command::new(rivet_bin())
            .args([
                "--project",
                dirs,
                "release",
                "status",
                "v1.0.0",
                "--format",
                "json",
            ])
            .output()
            .expect("release status");
        let v: serde_json::Value = serde_json::from_slice(&out.stdout).expect("json");
        // exit code and the json flag must agree
        assert_eq!(v["cuttable"].as_bool().unwrap(), out.status.success());
        v["cuttable"].as_bool().unwrap()
    };

    // Default (status mode): approved != verified → not cuttable.
    write_cfg("");
    assert!(!cuttable(), "status mode: an approved artifact must block");

    // ready-when: [approved] → approved now counts → cuttable.
    write_cfg("release:\n  ready-when: [approved]\n");
    assert!(cuttable(), "ready-when must extend the ready set");

    // require: coverage → WID-001's V is closed → cuttable even though approved.
    write_cfg("release:\n  require: coverage\n");
    assert!(
        cuttable(),
        "coverage mode: a V-closed artifact must be ready"
    );

    // require: coverage but V OPEN (drop the tracing part) → not cuttable.
    std::fs::write(
        dir.join("artifacts/a.yaml"),
        "artifacts:\n  - id: WID-001\n    type: widget\n    title: open\n    status: approved\n    release: v1.0.0\n",
    )
    .unwrap();
    assert!(
        !cuttable(),
        "coverage mode: an artifact with an open V must block"
    );
}

/// REQ-234 (#516): `rivet release move <id> <ver>` re-targets an artifact to a
/// release, logging the old → new transition; idempotent when already scoped.
///
/// rivet: verifies REQ-234
#[test]
fn release_move_retargets_and_logs_scope_change() {
    let tmp = tempfile::tempdir().expect("temp dir");
    let dir = tmp.path();
    let dirs = dir.to_str().unwrap();
    assert!(
        Command::new(rivet_bin())
            .args(["init", "--preset", "dev", "--dir", dirs])
            .output()
            .expect("init")
            .status
            .success()
    );
    std::fs::write(
        dir.join("artifacts/reqs.yaml"),
        "artifacts:\n  \
         - id: REQ-9\n    type: requirement\n    title: A\n    status: draft\n    release: v1.0.0\n  \
         - id: REQ-8\n    type: requirement\n    title: B\n    status: draft\n",
    )
    .unwrap();
    let run = |args: &[&str]| {
        let out = Command::new(rivet_bin())
            .args(["--project", dirs])
            .args(args)
            .output()
            .expect("run rivet");
        (
            out.status.success(),
            String::from_utf8_lossy(&out.stdout).into_owned(),
        )
    };

    // Move an assigned artifact: logs the transition, re-targets the scope.
    let (ok, out) = run(&["release", "move", "REQ-9", "v2.0.0"]);
    assert!(ok, "move must succeed; got:\n{out}");
    assert!(
        out.contains("v1.0.0") && out.contains("v2.0.0"),
        "must log the old → new release transition; got:\n{out}"
    );
    let (_, v2) = run(&["list", "--release", "v2.0.0", "--format", "json"]);
    assert!(
        v2.contains("REQ-9"),
        "REQ-9 must now be in v2.0.0; got:\n{v2}"
    );
    let (_, v1) = run(&["list", "--release", "v1.0.0", "--format", "json"]);
    assert!(
        !v1.contains("REQ-9"),
        "REQ-9 must no longer be in v1.0.0; got:\n{v1}"
    );

    // Move an unassigned artifact: transition from "(unassigned)".
    let (ok2, out2) = run(&["release", "move", "REQ-8", "v2.0.0"]);
    assert!(
        ok2,
        "moving an unassigned artifact must succeed; got:\n{out2}"
    );
    assert!(
        out2.contains("unassigned") && out2.contains("v2.0.0"),
        "must log the move from unassigned; got:\n{out2}"
    );

    // Idempotent: moving to the same release is a no-op.
    let (ok3, out3) = run(&["release", "move", "REQ-9", "v2.0.0"]);
    assert!(
        ok3 && out3.contains("nothing to do"),
        "must be idempotent; got:\n{out3}"
    );
}

/// REQ-235 (#490, DD-070): `rivet shard <file>` splits a single-file source into
/// one `<ID>.yaml` per artifact with NO data loss and full field fidelity, and
/// is reversible — if the project can't re-find the artifacts (the rivet.yaml
/// source points at the file, not its directory), it restores the original and
/// refuses.
///
/// rivet: verifies REQ-235
#[test]
fn shard_splits_source_into_per_id_files_reversibly() {
    // --- Happy path: a directory source shards cleanly, losslessly. ---
    let tmp = tempfile::tempdir().expect("temp dir");
    let dir = tmp.path();
    let dirs = dir.to_str().unwrap();
    assert!(
        Command::new(rivet_bin())
            .args(["init", "--preset", "dev", "--dir", dirs])
            .output()
            .expect("init")
            .status
            .success()
    );
    std::fs::write(
        dir.join("artifacts/reqs.yaml"),
        "artifacts:\n  \
         - id: REQ-9\n    type: requirement\n    title: A\n    status: draft\n    tags: [safety]\n    fields:\n      priority: must\n  \
         - id: REQ-8\n    type: requirement\n    title: B\n    status: draft\n",
    )
    .unwrap();
    let count = |d: &str| -> usize {
        let out = Command::new(rivet_bin())
            .args(["--project", d, "list", "--format", "json"])
            .output()
            .expect("list");
        String::from_utf8_lossy(&out.stdout)
            .matches("\"id\"")
            .count()
    };
    let before = count(dirs);

    let sh = Command::new(rivet_bin())
        .args(["--project", dirs, "shard", "artifacts/reqs.yaml"])
        .output()
        .expect("shard");
    assert!(
        sh.status.success(),
        "shard must succeed; stderr: {}",
        String::from_utf8_lossy(&sh.stderr)
    );
    assert!(
        !dir.join("artifacts/reqs.yaml").exists(),
        "the original single file must be removed"
    );
    assert!(
        dir.join("artifacts/reqs/REQ-9.yaml").exists()
            && dir.join("artifacts/reqs/REQ-8.yaml").exists(),
        "one <ID>.yaml per artifact must be written"
    );
    assert_eq!(before, count(dirs), "no artifact may be lost in the shard");
    // Field fidelity — tags and domain fields survive the split.
    let r9 = std::fs::read_to_string(dir.join("artifacts/reqs/REQ-9.yaml")).unwrap();
    assert!(
        r9.contains("safety") && r9.contains("priority") && r9.contains("must"),
        "all fields must be preserved; got:\n{r9}"
    );
    assert!(
        Command::new(rivet_bin())
            .args(["--project", dirs, "validate"])
            .output()
            .expect("validate")
            .status
            .success(),
        "the project must still validate after sharding"
    );

    // --- Safety: a file-source shard restores the original and refuses. ---
    let tmp2 = tempfile::tempdir().expect("temp dir");
    let d2 = tmp2.path();
    std::fs::create_dir_all(d2.join("artifacts")).unwrap();
    std::fs::write(
        d2.join("rivet.yaml"),
        "project:\n  name: t\n  version: \"0.1.0\"\n  schemas: [common, dev]\n\
         sources:\n  - path: artifacts/r.yaml\n    format: generic-yaml\n",
    )
    .unwrap();
    std::fs::write(
        d2.join("artifacts/r.yaml"),
        "artifacts:\n  - id: REQ-1\n    type: requirement\n    title: t\n    status: draft\n",
    )
    .unwrap();
    let d2s = d2.to_str().unwrap();
    let sh2 = Command::new(rivet_bin())
        .args(["--project", d2s, "shard", "artifacts/r.yaml"])
        .output()
        .expect("shard");
    assert!(
        !sh2.status.success(),
        "shard must refuse when the source points at the file, not its dir"
    );
    assert!(
        String::from_utf8_lossy(&sh2.stderr).contains("Restored"),
        "must report that it restored the original; stderr: {}",
        String::from_utf8_lossy(&sh2.stderr)
    );
    assert!(
        d2.join("artifacts/r.yaml").exists() && !d2.join("artifacts/r").exists(),
        "the original must be restored and the partial dir cleaned up"
    );
    assert_eq!(
        count(d2s),
        1,
        "no artifact may be lost on the aborted shard"
    );
}

/// REQ-236 (#556): `cited-source` is declared on the verification types in the
/// aspice preset, so a hash-stamped pointer to the test source file is accepted
/// (not rejected as an undeclared field) and `rivet check sources` drift-tracks
/// it — the requirement→test evidence can no longer silently rot.
///
/// rivet: verifies REQ-236
#[test]
fn cited_source_accepted_on_sw_verification() {
    let tmp = tempfile::tempdir().expect("temp dir");
    let dir = tmp.path();
    let dirs = dir.to_str().unwrap();
    std::fs::create_dir_all(dir.join("artifacts")).unwrap();
    std::fs::create_dir_all(dir.join("tests")).unwrap();
    std::fs::write(
        dir.join("rivet.yaml"),
        "project:\n  name: t\n  version: \"0.1.0\"\n  schemas: [common, aspice]\n\
         sources:\n  - path: artifacts\n    format: generic-yaml\n",
    )
    .unwrap();
    std::fs::write(dir.join("tests/hal.rs"), "fn t() {}\n").unwrap();
    std::fs::write(
        dir.join("artifacts/v.yaml"),
        "artifacts:\n  \
         - id: SWR-1\n    type: sw-req\n    title: HAL requirement\n    status: approved\n  \
         - id: FV-1\n    type: sw-verification\n    title: HAL verification\n    status: draft\n    fields:\n      method: automated-test\n      cited-source:\n        uri: tests/hal.rs\n        kind: file\n    links:\n      - type: verifies\n        target: SWR-1\n",
    )
    .unwrap();

    // The cited-source field must NOT be rejected as undeclared on the
    // verification type (the #556 symptom).
    let val = Command::new(rivet_bin())
        .args(["--project", dirs, "validate"])
        .output()
        .expect("validate");
    let combined = format!(
        "{}{}",
        String::from_utf8_lossy(&val.stdout),
        String::from_utf8_lossy(&val.stderr)
    );
    assert!(
        !combined.contains("'cited-source' is not defined"),
        "cited-source must be declared on sw-verification; got:\n{combined}"
    );

    // `check sources` must recognize and drift-track the cited test file.
    let cs = Command::new(rivet_bin())
        .args(["--project", dirs, "check", "sources"])
        .output()
        .expect("check sources");
    let cs_out = String::from_utf8_lossy(&cs.stdout);
    assert!(
        cs_out.contains("FV-1") && cs_out.contains("tests/hal.rs"),
        "check sources must track the verification's cited test file; got:\n{cs_out}"
    );
}

/// #552: `rivet add --type <T>` must create a default file for the type when
/// none exists yet, instead of erroring "no existing file found … use --file".
/// You shouldn't need --file just to add the FIRST artifact of a type.
#[test]
fn add_creates_default_file_for_a_new_type() {
    let tmp = tempfile::tempdir().expect("temp dir");
    let dir = tmp.path();
    let dirs = dir.to_str().unwrap();
    let init = Command::new(rivet_bin())
        .args(["init", "--preset", "dev", "--dir", dirs])
        .output()
        .expect("init");
    assert!(init.status.success(), "init must succeed");

    // The dev preset writes requirements.yaml but no design-decisions file.
    assert!(!dir.join("artifacts/design-decisions.yaml").exists());

    let add = Command::new(rivet_bin())
        .args([
            "--project",
            dirs,
            "add",
            "--type",
            "design-decision",
            "--title",
            "First decision",
            "--field",
            "rationale=because",
        ])
        .output()
        .expect("add");
    assert!(
        add.status.success(),
        "adding the first design-decision (no --file) must succeed; stderr: {}",
        String::from_utf8_lossy(&add.stderr)
    );
    assert!(
        dir.join("artifacts/design-decisions.yaml").exists(),
        "add must have created a default design-decisions.yaml"
    );
}

/// #490: a source with `layout: per-id` makes `rivet add` write one `<ID>.yaml`
/// file per artifact in the source directory, so two parallel adds never touch
/// the same file (the structural cure for the requirements.yaml merge-conflict
/// tax). The directory read path loads them all. Default (single-file) layout
/// is unchanged — covered by `add_creates_default_file_for_a_new_type`.
///
/// rivet: verifies REQ-007
#[test]
fn add_with_per_id_layout_writes_one_file_per_artifact() {
    let tmp = tempfile::tempdir().expect("temp dir");
    let dir = tmp.path();
    let dirs = dir.to_str().unwrap();
    std::fs::create_dir_all(dir.join("artifacts/requirements")).unwrap();
    std::fs::write(
        dir.join("rivet.yaml"),
        "project:\n  name: t\n  version: \"0.1.0\"\n  schemas: [common, dev]\n\
         sources:\n  - path: artifacts/requirements\n    format: generic-yaml\n    layout: per-id\n",
    )
    .unwrap();

    let add = |title: &str| {
        Command::new(rivet_bin())
            .args([
                "--project",
                dirs,
                "add",
                "--type",
                "requirement",
                "--title",
                title,
            ])
            .output()
            .expect("add")
    };
    assert!(add("First").status.success(), "first add must succeed");
    assert!(add("Second").status.success(), "second add must succeed");

    // Two adds → two distinct files, and NO shared per-type `requirements.yaml`.
    let entries: Vec<String> = std::fs::read_dir(dir.join("artifacts/requirements"))
        .unwrap()
        .filter_map(|e| e.ok().map(|e| e.file_name().to_string_lossy().into_owned()))
        .collect();
    assert_eq!(
        entries.len(),
        2,
        "per-id must write one file per artifact; got {entries:?}"
    );
    assert!(
        !entries.iter().any(|n| n == "requirements.yaml"),
        "per-id must not append to a shared requirements.yaml; got {entries:?}"
    );
    assert!(
        entries.iter().all(|n| n.ends_with(".yaml")),
        "per-id files should be `<ID>.yaml`; got {entries:?}"
    );

    // The directory read path loads both artifacts.
    let list = Command::new(rivet_bin())
        .args(["--project", dirs, "list", "--format", "json"])
        .output()
        .expect("list");
    let out = String::from_utf8_lossy(&list.stdout);
    assert_eq!(
        out.matches("\"id\"").count(),
        2,
        "both per-id artifacts must load via the directory source; got:\n{out}"
    );
}

/// REQ-158 / #397: `rivet validate` emits a `near-duplicate-intent` INFO for a
/// pair of same-type artifacts with highly similar titles, and NOT for a
/// distinct one. `rivet add` emits a non-blocking note for a similar new title.
#[test]
fn near_duplicate_intent_validate_and_add() {
    let tmp = tempfile::tempdir().expect("temp dir");
    let dir = tmp.path();
    std::fs::write(
        dir.join("rivet.yaml"),
        "project:\n  name: t\n  version: \"0.1.0\"\n  schemas: [common, dev]\n\
         sources:\n  - path: artifacts\n    format: generic-yaml\n",
    )
    .unwrap();
    std::fs::create_dir_all(dir.join("artifacts")).unwrap();
    std::fs::write(
        dir.join("artifacts").join("r.yaml"),
        "artifacts:\n  \
         - id: REQ-1\n    type: requirement\n    title: \"Export must bundle JavaScript for offline viewing\"\n    status: draft\n  \
         - id: REQ-2\n    type: requirement\n    title: \"Export should bundle the JavaScript for offline viewing\"\n    status: draft\n  \
         - id: REQ-3\n    type: requirement\n    title: \"Parser builds a lossless concrete syntax tree\"\n    status: draft\n",
    )
    .unwrap();

    // validate --format json: exactly one near-duplicate-intent diagnostic,
    // on REQ-2 (the later of the similar pair), none mentioning REQ-3.
    let out = Command::new(rivet_bin())
        .args([
            "--project",
            dir.to_str().unwrap(),
            "validate",
            "--direct",
            "--format",
            "json",
        ])
        .output()
        .expect("rivet validate");
    let v: serde_json::Value =
        serde_json::from_str(&String::from_utf8_lossy(&out.stdout)).expect("validate JSON");
    let dups: Vec<&serde_json::Value> = v["diagnostics"]
        .as_array()
        .expect("diagnostics array")
        .iter()
        .filter(|d| d["rule"] == "near-duplicate-intent")
        .collect();
    assert_eq!(
        dups.len(),
        1,
        "exactly one near-duplicate-intent diagnostic expected, got {dups:?}"
    );
    assert_eq!(dups[0]["artifact_id"], "REQ-2");

    // rivet add with a similar title -> non-blocking note on stderr, still adds.
    let add_dup = Command::new(rivet_bin())
        .args([
            "--project",
            dir.to_str().unwrap(),
            "add",
            "--type",
            "requirement",
            "--title",
            "Export should bundle the javascript for offline viewing",
            "--status",
            "draft",
        ])
        .output()
        .expect("rivet add");
    assert!(
        add_dup.status.success(),
        "add must still succeed (advisory)"
    );
    let add_err = String::from_utf8_lossy(&add_dup.stderr);
    assert!(
        add_err.contains("intent is") && add_err.contains("REQ-1"),
        "add must emit a near-duplicate note naming REQ-1; stderr: {add_err}"
    );

    // rivet add with a distinct title -> no note.
    let add_ok = Command::new(rivet_bin())
        .args([
            "--project",
            dir.to_str().unwrap(),
            "add",
            "--type",
            "requirement",
            "--title",
            "Salsa incremental recomputation invalidates only changed inputs",
            "--status",
            "draft",
        ])
        .output()
        .expect("rivet add");
    let ok_err = String::from_utf8_lossy(&add_ok.stderr);
    assert!(
        !ok_err.contains("intent is"),
        "a distinct title must not emit a near-duplicate note; stderr: {ok_err}"
    );
}

/// REQ-161 / #408: `rivet validate --structural` gates only on structural
/// integrity. A broken link (structural) makes it FAIL; a project whose only
/// problems are coverage/lint (a missing required field) PASSes `--structural`
/// while normal validate FAILs.
#[test]
fn validate_structural_gates_on_structural_only() {
    let mk = |body: &str| {
        let tmp = tempfile::tempdir().expect("temp dir");
        let dir = tmp.path().to_path_buf();
        std::fs::write(
            dir.join("rivet.yaml"),
            "project:\n  name: t\n  version: \"0.1.0\"\n  schemas: [common, dev]\n\
             sources:\n  - path: artifacts\n    format: generic-yaml\n",
        )
        .unwrap();
        std::fs::create_dir_all(dir.join("artifacts")).unwrap();
        std::fs::write(dir.join("artifacts").join("r.yaml"), body).unwrap();
        (tmp, dir)
    };
    let run = |dir: &std::path::Path, args: &[&str]| {
        let mut a = vec!["--project", dir.to_str().unwrap(), "validate", "--direct"];
        a.extend_from_slice(args);
        Command::new(rivet_bin())
            .args(&a)
            .output()
            .expect("validate")
    };

    // (a) A broken link is STRUCTURAL -> --structural still FAILs.
    let (_t1, d1) = mk("artifacts:\n  - id: REQ-1\n    type: requirement\n    \
         title: One\n    status: draft\n    links:\n      - type: traces-to\n        target: GHOST-1\n");
    let s1 = run(&d1, &["--structural"]);
    assert!(
        !s1.status.success(),
        "a broken link must FAIL --structural; stdout:\n{}",
        String::from_utf8_lossy(&s1.stdout)
    );
    assert!(
        String::from_utf8_lossy(&s1.stdout).contains("does not exist"),
        "the broken-link diagnostic must be shown under --structural"
    );

    // (b) A schema-typed missing required field is COVERAGE/LINT. Use a type
    // with a required field; omit it. --structural PASSes even if normal fails.
    // (Use an undeclared field which is the unknown-field coverage rule —
    // simplest cross-schema case that is non-structural by our taxonomy.)
    let (_t2, d2) = mk("artifacts:\n  - id: REQ-1\n    type: requirement\n    \
         title: One\n    status: draft\n    fields:\n      bogus_undeclared: x\n");
    let s2 = run(&d2, &["--structural"]);
    assert!(
        s2.status.success(),
        "a project whose only issues are coverage/lint must PASS --structural; stdout:\n{}",
        String::from_utf8_lossy(&s2.stdout)
    );
}

/// REQ-167 / #426: `rivet trace <id>` is the discoverable namesake verb for the
/// per-artifact traceability view — it must exit 0, render the artifact + its
/// links, produce the SAME output as `validate --explain <id>`, and be
/// deterministic across runs (REQ-167 / #415 sort fix on the link lists).
#[test]
fn trace_command_renders_and_is_deterministic() {
    let root = project_root();
    let run = |args: &[&str]| {
        let mut a = vec!["--project", root.to_str().unwrap()];
        a.extend_from_slice(args);
        Command::new(rivet_bin()).args(&a).output().expect("rivet")
    };

    let t1 = run(&["trace", "REQ-001"]);
    assert!(t1.status.success(), "rivet trace must exit 0");
    let s1 = String::from_utf8_lossy(&t1.stdout);
    assert!(
        s1.contains("REQ-001") && s1.contains("Incoming links:"),
        "trace output must show the artifact and its links; got:\n{s1}"
    );

    // Deterministic across runs (link lists sorted, not HashMap-ordered).
    let t2 = run(&["trace", "REQ-001"]);
    assert_eq!(
        s1,
        String::from_utf8_lossy(&t2.stdout),
        "rivet trace output must be reproducible run-to-run"
    );

    // Same view as `validate --explain` (trace wraps cmd_explain).
    let explain = run(&["validate", "--explain", "REQ-001"]);
    assert_eq!(
        s1,
        String::from_utf8_lossy(&explain.stdout),
        "rivet trace must match validate --explain"
    );

    // Unknown subcommand previously; now a real command — unknown ID is a
    // clean not-found, not a clap error.
    let missing = run(&["trace", "NOPE-999"]);
    assert!(
        String::from_utf8_lossy(&missing.stderr).contains("not found"),
        "trace of a missing id should report not-found"
    );
}

// ── agent CLI ergonomics (REQ-188) ─────────────────────────────────────

#[test]
fn link_positional_target_is_parsed() {
    // Regression: `rivet link <source> <target> --type <t>` (target as a second
    // positional) previously errored "unexpected argument '<target>'". The
    // positional must now be parsed (the command may still fail for unrelated
    // reasons, but never with a clap parse error about the second positional).
    let tmp = tempfile::tempdir().expect("create temp dir");
    let p = tmp.path().to_str().unwrap().to_string();
    let init = Command::new(rivet_bin())
        .args(["init", "--dir", &p])
        .output()
        .expect("init");
    assert!(init.status.success(), "init must succeed");
    let out = Command::new(rivet_bin())
        .args([
            "--project",
            &p,
            "link",
            "REQ-001",
            "REQ-002",
            "--type",
            "traces-to",
        ])
        .output()
        .expect("link run");
    assert!(
        !String::from_utf8_lossy(&out.stderr).contains("unexpected argument"),
        "positional target must be parsed, not rejected by clap. stderr: {}",
        String::from_utf8_lossy(&out.stderr)
    );
}

#[test]
fn link_no_target_is_reported() {
    let tmp = tempfile::tempdir().expect("create temp dir");
    let p = tmp.path().to_str().unwrap().to_string();
    Command::new(rivet_bin())
        .args(["init", "--dir", &p])
        .output()
        .expect("init");
    let out = Command::new(rivet_bin())
        .args(["--project", &p, "link", "REQ-001", "--type", "traces-to"])
        .output()
        .expect("link run");
    assert!(
        !out.status.success(),
        "`rivet link` with no target must error, got exit 0"
    );
    assert!(
        String::from_utf8_lossy(&out.stderr).contains("target"),
        "error must mention the missing target"
    );
}

#[test]
fn init_preset_help_lists_all_presets() {
    // The --preset help must list every preset `resolve_preset` accepts, with
    // no duplicated/contradictory lines (the doc-comment had two partial,
    // conflicting lists). REQ-188.
    let out = Command::new(rivet_bin())
        .args(["init", "--help"])
        .output()
        .expect("init --help");
    let help = String::from_utf8_lossy(&out.stdout);
    for preset in [
        "aspice",
        "stpa-ai",
        "cybersecurity",
        "aadl",
        "eu-ai-act",
        "safety-case",
        "do-178c",
        "en-50128",
        "iec-61508",
        "iec-62304",
        "iso-pas-8800",
        "sotif",
    ] {
        assert!(
            help.contains(preset),
            "init --help must list preset '{preset}'; got:\n{help}"
        );
    }
}

#[test]
fn modify_help_has_no_duplicated_summary() {
    let out = Command::new(rivet_bin())
        .args(["modify", "--help"])
        .output()
        .expect("modify --help");
    let help = String::from_utf8_lossy(&out.stdout);
    assert!(
        !help.contains("Modify an existing artifact Modify an existing artifact"),
        "modify --help must not stutter its summary; got:\n{help}"
    );
}

/// `rivet query --format json` must carry the same `command` envelope field as
/// list/stats/coverage/validate, and expose the keys query-output.schema.json
/// documents. REQ-189 (envelope consistency).
#[test]
fn query_json_output_has_command_envelope() {
    let out = Command::new(rivet_bin())
        .args([
            "--project",
            project_root().to_str().unwrap(),
            "query",
            "--sexpr",
            r#"(= type "requirement")"#,
            "--format",
            "json",
        ])
        .output()
        .expect("query --format json");
    assert!(
        out.status.success(),
        "query --format json must succeed: {}",
        String::from_utf8_lossy(&out.stderr)
    );
    let v: serde_json::Value = serde_json::from_slice(&out.stdout).expect("valid JSON");
    assert_eq!(
        v.get("command").and_then(|c| c.as_str()),
        Some("query"),
        "query JSON must carry command=\"query\" for envelope consistency with list/stats/coverage"
    );
    for key in ["filter", "count", "total", "truncated", "artifacts"] {
        assert!(
            v.get(key).is_some(),
            "query JSON must expose '{key}' (per query-output.schema.json)"
        );
    }
}

/// `rivet commits --format json` must carry the `command` envelope field like
/// every other machine-readable command (validate/get/list/stats/coverage/
/// query/matrix/diff/impact). commits was the last one missing it. REQ-192.
/// (Exit code is not asserted: a repo with broken trailers exits non-zero but
/// still emits the JSON document.)
#[test]
fn commits_json_output_has_command_envelope() {
    let out = Command::new(rivet_bin())
        .args([
            "--project",
            project_root().to_str().unwrap(),
            "commits",
            "--format",
            "json",
        ])
        .output()
        .expect("commits --format json");
    let v: serde_json::Value =
        serde_json::from_slice(&out.stdout).expect("commits must emit valid JSON");
    assert_eq!(
        v.get("command").and_then(|c| c.as_str()),
        Some("commits"),
        "commits JSON must carry command=\"commits\" for envelope consistency"
    );
}

/// `rivet snapshot diff <baseline>` must accept the baseline path positionally
/// (previously it errored "unexpected argument" — only --baseline worked).
/// Mirrors the next-id/query/link positional shorthands. REQ-194.
#[test]
fn snapshot_diff_accepts_positional_baseline() {
    let tmp = tempfile::tempdir().expect("create temp dir");
    let p = tmp.path().to_str().unwrap().to_string();
    let snap = tmp.path().join("snap.json");
    assert!(
        Command::new(rivet_bin())
            .args(["init", "--dir", &p])
            .output()
            .expect("init")
            .status
            .success(),
        "init must succeed"
    );
    let cap = Command::new(rivet_bin())
        .args([
            "--project",
            &p,
            "snapshot",
            "capture",
            "--output",
            snap.to_str().unwrap(),
        ])
        .output()
        .expect("snapshot capture");
    assert!(
        cap.status.success(),
        "capture must succeed: {}",
        String::from_utf8_lossy(&cap.stderr)
    );
    // Positional baseline (no --baseline flag).
    let out = Command::new(rivet_bin())
        .args(["--project", &p, "snapshot", "diff", snap.to_str().unwrap()])
        .output()
        .expect("snapshot diff");
    assert!(
        !String::from_utf8_lossy(&out.stderr).contains("unexpected argument"),
        "positional baseline must be parsed, not rejected by clap. stderr: {}",
        String::from_utf8_lossy(&out.stderr)
    );
    assert!(
        out.status.success(),
        "diff against the just-captured snapshot must succeed. stderr: {}",
        String::from_utf8_lossy(&out.stderr)
    );
}

/// `rivet variant solve --variant <name>` must resolve a bare name from
/// artifacts/variants/<name>.yaml, like `query --variant` already does (#466);
/// a direct path must still work (additive). REQ-195.
#[test]
fn variant_solve_accepts_bare_variant_name() {
    let root = project_root();
    let model = root.join("artifacts/feature-model.yaml");
    let path = root.join("artifacts/variants/dashboard-only.yaml");
    if !model.is_file() || !path.is_file() {
        return; // fixtures moved; nothing to assert
    }

    // Bare name (the regression — previously errored "No such file").
    let by_name = Command::new(rivet_bin())
        .args([
            "--project",
            root.to_str().unwrap(),
            "variant",
            "solve",
            "--model",
            model.to_str().unwrap(),
            "--variant",
            "dashboard-only",
        ])
        .output()
        .expect("variant solve by name");
    assert!(
        by_name.status.success(),
        "variant solve --variant <name> must resolve the name. stderr: {}",
        String::from_utf8_lossy(&by_name.stderr)
    );

    // Direct path still works (additive guarantee).
    let by_path = Command::new(rivet_bin())
        .args([
            "--project",
            root.to_str().unwrap(),
            "variant",
            "solve",
            "--model",
            model.to_str().unwrap(),
            "--variant",
            path.to_str().unwrap(),
        ])
        .output()
        .expect("variant solve by path");
    assert!(
        by_path.status.success(),
        "variant solve --variant <path> must still work. stderr: {}",
        String::from_utf8_lossy(&by_path.stderr)
    );
}

/// #518: a source file broken by a parse error must make MUTATING / ID-allocating
/// commands (next-id, add) HARD-FAIL — not silently skip the file and allocate an
/// ID that collides with its (now-invisible) artifacts.
#[test]
fn mutating_commands_refuse_on_parse_broken_source() {
    let tmp = tempfile::tempdir().expect("temp dir");
    let dir = tmp.path();
    let dirs = dir.to_str().unwrap();

    let init = Command::new(rivet_bin())
        .args(["init", "--preset", "dev", "--dir", dirs])
        .output()
        .expect("init");
    assert!(
        init.status.success(),
        "init: {}",
        String::from_utf8_lossy(&init.stderr)
    );

    // Sanity: next-id succeeds on the clean store.
    let ok = Command::new(rivet_bin())
        .args(["--project", dirs, "next-id", "requirement"])
        .output()
        .expect("next-id");
    assert!(
        ok.status.success(),
        "next-id should succeed on a clean store"
    );

    // Corrupt an artifacts source with a YAML parse error (an unquoted colon).
    let target = std::fs::read_dir(dir.join("artifacts"))
        .expect("artifacts dir")
        .filter_map(|e| e.ok().map(|e| e.path()))
        .find(|p| p.extension().map(|x| x == "yaml").unwrap_or(false))
        .expect("an artifacts yaml");
    let mut content = std::fs::read_to_string(&target).unwrap();
    content.push_str("\n  - id: REQ-BROKEN\n    title: bad: unquoted colon\n");
    std::fs::write(&target, content).unwrap();

    // next-id must now REFUSE (non-zero) and explain why.
    let nid = Command::new(rivet_bin())
        .args(["--project", dirs, "next-id", "requirement"])
        .output()
        .expect("next-id");
    assert!(
        !nid.status.success(),
        "next-id must hard-fail when a source failed to parse (#518)"
    );
    let err = String::from_utf8_lossy(&nid.stderr);
    assert!(
        err.contains("refusing") && err.contains("parse"),
        "next-id refusal must explain the parse skip; got: {err}"
    );

    // add must also REFUSE.
    let add = Command::new(rivet_bin())
        .args([
            "--project",
            dirs,
            "add",
            "--type",
            "requirement",
            "--title",
            "x",
        ])
        .output()
        .expect("add");
    assert!(
        !add.status.success(),
        "add must hard-fail when a source failed to parse (#518)"
    );
}

/// #500: a clap parse failure (e.g. the non-global `--project` placed AFTER the
/// subcommand) used to leave stdout empty, so a `--format json` consumer got a
/// cryptic "EOF while parsing". Now such invocations also emit a one-line JSON
/// error envelope on stdout, while non-JSON invocations keep clap's stderr-only
/// behavior.
#[test]
fn json_consumers_get_an_error_envelope_on_parse_failure() {
    // `--project` after the subcommand is a parse error; with --format json we
    // must get a JSON envelope on stdout (not empty), exit non-zero.
    let bad = Command::new(rivet_bin())
        .args(["validate", "--format", "json", "--project", "."])
        .output()
        .expect("run rivet");
    assert!(
        !bad.status.success(),
        "a misplaced --project must still fail"
    );
    let stdout = String::from_utf8_lossy(&bad.stdout);
    let parsed: serde_json::Value = serde_json::from_str(stdout.trim())
        .unwrap_or_else(|e| panic!("stdout must be a JSON envelope, got {stdout:?}: {e}"));
    assert!(
        parsed.get("error").and_then(|v| v.as_str()).is_some(),
        "envelope must carry an 'error' string"
    );
    assert!(
        parsed
            .get("hint")
            .and_then(|v| v.as_str())
            .is_some_and(|h| h.contains("BEFORE the subcommand")),
        "envelope must hint at the arg-position fix; got: {stdout}"
    );

    // Same parse error WITHOUT a JSON request: stdout stays empty (clap writes
    // its message to stderr), preserving the human path.
    let bad_text = Command::new(rivet_bin())
        .args(["validate", "--project", "."])
        .output()
        .expect("run rivet");
    assert!(!bad_text.status.success());
    assert!(
        bad_text.stdout.is_empty(),
        "non-JSON parse error must not print an envelope to stdout; got: {}",
        String::from_utf8_lossy(&bad_text.stdout)
    );
}

/// #479: next-id must not reissue an ID that is claimed in git history (a
/// commit trailer / subject) but absent from the working tree — the
/// reverted-but-burned trap (e.g. REQ-209). Git awareness is best-effort and
/// can be disabled with RIVET_NEXTID_NO_GIT.
#[test]
fn next_id_skips_ids_burned_in_git_history() {
    let tmp = tempfile::tempdir().expect("temp dir");
    let dir = tmp.path();
    let dirs = dir.to_str().unwrap();

    let init = Command::new(rivet_bin())
        .args(["init", "--preset", "dev", "--dir", dirs])
        .output()
        .expect("init");
    assert!(
        init.status.success(),
        "init: {}",
        String::from_utf8_lossy(&init.stderr)
    );

    // Establish a git repo and commit a message that *claims* a REQ id far above
    // anything in the working tree, then leave that id absent from the store —
    // exactly the shape of a reverted commit or an unmerged branch.
    let git = |args: &[&str]| {
        let out = Command::new("git")
            .args(args)
            .current_dir(dir)
            .output()
            .expect("git");
        assert!(
            out.status.success(),
            "git {args:?}: {}",
            String::from_utf8_lossy(&out.stderr)
        );
    };
    git(&["init", "-q"]);
    git(&["config", "user.email", "t@example.com"]);
    git(&["config", "user.name", "t"]);
    git(&["add", "-A"]);
    git(&[
        "commit",
        "-q",
        "-m",
        "feat: burn an id\n\nImplements: REQ-994",
    ]);

    let next_id = |env_no_git: bool| -> (String, String) {
        let mut cmd = Command::new(rivet_bin());
        cmd.args(["--project", dirs, "next-id", "requirement"]);
        if env_no_git {
            cmd.env("RIVET_NEXTID_NO_GIT", "1");
        }
        let out = cmd.output().expect("next-id");
        assert!(
            out.status.success(),
            "next-id must succeed. stderr: {}",
            String::from_utf8_lossy(&out.stderr)
        );
        (
            String::from_utf8_lossy(&out.stdout).trim().to_string(),
            String::from_utf8_lossy(&out.stderr).to_string(),
        )
    };

    // Git-aware: must clear the burned REQ-994 -> REQ-995, with a stderr note.
    let (id, stderr) = next_id(false);
    assert_eq!(
        id, "REQ-995",
        "next-id must skip past the git-burned REQ-994; got {id}"
    );
    assert!(
        stderr.contains("git history") && stderr.contains("REQ-995"),
        "a skip must emit an explanatory stderr note; got: {stderr}"
    );

    // Escape hatch: RIVET_NEXTID_NO_GIT ignores git history entirely, so the
    // allocation falls back to the (much lower) working-tree maximum.
    let (bare, _) = next_id(true);
    assert_ne!(
        bare, "REQ-995",
        "RIVET_NEXTID_NO_GIT must allocate from the working tree only, ignoring REQ-994"
    );
    assert!(
        bare.starts_with("REQ-") && bare.as_str() < "REQ-994",
        "tree-only id must be below the burned id; got {bare}"
    );
}

// ── REQ-261: feature-model attribute_warnings surfaced by validate ──────────
// rivet: verifies REQ-261

/// Scaffold a project whose feature-model declares an `attribute-schema:` and
/// a per-feature `attributes:` map carrying ONE unknown key (`asil-numric`, a
/// typo of `asil-numeric`). That unknown key bypasses the type/range audit and
/// populates `FeatureModel::attribute_warnings`. Returns the project dir.
fn write_attribute_warning_project(unknown_key: bool) -> tempfile::TempDir {
    let tmp = tempfile::tempdir().expect("temp dir");
    let dir = tmp.path();
    let dirs = dir.to_str().unwrap();
    assert!(
        Command::new(rivet_bin())
            .args(["init", "--preset", "dev", "--dir", dirs])
            .output()
            .expect("init")
            .status
            .success()
    );

    // `compliance` is declared + valid; the typo'd `asil-numric` is only
    // present in the unknown-key variant of the fixture.
    let unit_attrs = if unknown_key {
        "    attributes:\n      compliance: unece-r157\n      asil-numric: 3\n"
    } else {
        "    attributes:\n      compliance: unece-r157\n"
    };
    let model = format!(
        "kind: feature-model\nroot: app\nattribute-schema:\n  \
         compliance:\n    type: enum\n    values: [unece-r157]\nfeatures:\n  \
         app:\n    group: mandatory\n    children: [unit]\n  \
         unit:\n    group: leaf\n{unit_attrs}"
    );
    std::fs::write(dir.join("artifacts/feature-model.yaml"), model).unwrap();
    // Empty bindings keep the model+binding path clean of unknown-feature /
    // dangling-artifact errors, isolating the attribute-warning behaviour.
    std::fs::write(dir.join("artifacts/bindings.yaml"), "bindings: {}\n").unwrap();
    tmp
}

/// (a) A model with an unknown attribute key surfaces a `warning:`-prefixed
/// line on stderr through `validate --model … --binding …`, and still exits 0
/// (the load succeeded; the warning is advisory without `--strict-variants`).
#[test]
fn validate_model_binding_surfaces_attribute_warning_on_stderr() {
    let tmp = write_attribute_warning_project(true);
    let dir = tmp.path();
    let dirs = dir.to_str().unwrap();

    let out = Command::new(rivet_bin())
        .args([
            "--project",
            dirs,
            "validate",
            "--model",
            dir.join("artifacts/feature-model.yaml").to_str().unwrap(),
            "--binding",
            dir.join("artifacts/bindings.yaml").to_str().unwrap(),
        ])
        .output()
        .expect("validate --model --binding");

    let stderr = String::from_utf8_lossy(&out.stderr);
    assert!(
        stderr.contains("warning: feature-model attribute:") && stderr.contains("asil-numric"),
        "unknown attribute key must be surfaced on stderr; stderr:\n{stderr}"
    );
    // Advisory only: exit 0.
    assert!(
        out.status.success(),
        "without --strict-variants the attribute warning must not fail the run; \
         stdout:\n{}\nstderr:\n{stderr}",
        String::from_utf8_lossy(&out.stdout)
    );
}

/// (b) `--strict-variants` escalates the attribute warning to a hard error, so
/// the run exits non-zero.
#[test]
fn validate_strict_variants_escalates_attribute_warning_to_error() {
    let tmp = write_attribute_warning_project(true);
    let dir = tmp.path();
    let dirs = dir.to_str().unwrap();

    let out = Command::new(rivet_bin())
        .args([
            "--project",
            dirs,
            "validate",
            "--model",
            dir.join("artifacts/feature-model.yaml").to_str().unwrap(),
            "--binding",
            dir.join("artifacts/bindings.yaml").to_str().unwrap(),
            "--strict-variants",
        ])
        .output()
        .expect("validate --strict-variants");

    assert!(
        !out.status.success(),
        "--strict-variants must fail the run when the model has attribute warnings; \
         stdout:\n{}\nstderr:\n{}",
        String::from_utf8_lossy(&out.stdout),
        String::from_utf8_lossy(&out.stderr),
    );
    let stderr = String::from_utf8_lossy(&out.stderr);
    assert!(
        stderr.contains("asil-numric"),
        "the failing run must still name the offending key; stderr:\n{stderr}"
    );
}

/// (c) Regression: a model whose every attribute key IS declared produces no
/// attribute warning and passes clean (exit 0, no `feature-model attribute`
/// line on stderr) even under `--strict-variants`.
#[test]
fn validate_known_attributes_only_produces_no_warning() {
    let tmp = write_attribute_warning_project(false);
    let dir = tmp.path();
    let dirs = dir.to_str().unwrap();

    let out = Command::new(rivet_bin())
        .args([
            "--project",
            dirs,
            "validate",
            "--model",
            dir.join("artifacts/feature-model.yaml").to_str().unwrap(),
            "--binding",
            dir.join("artifacts/bindings.yaml").to_str().unwrap(),
            "--strict-variants",
        ])
        .output()
        .expect("validate known-only --strict-variants");

    let stderr = String::from_utf8_lossy(&out.stderr);
    assert!(
        !stderr.contains("feature-model attribute:"),
        "a model with only declared attribute keys must emit no attribute warning; \
         stderr:\n{stderr}"
    );
    assert!(
        out.status.success(),
        "known-only attributes must pass even under --strict-variants; stdout:\n{}\nstderr:\n{stderr}",
        String::from_utf8_lossy(&out.stdout)
    );
}
