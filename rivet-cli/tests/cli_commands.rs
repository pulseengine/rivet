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

// ── rivet init ──────────────────────────────────────────────────────────

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
    // `active` status keeps rule severity at its declared level
    // (warning for `requirement-coverage`). Draft would downgrade to info.
    std::fs::write(
        &artifacts,
        "artifacts:\n  - id: REQ-001\n    type: requirement\n    \
         title: Orphan requirement\n    status: active\n    \
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
    for expected in ["validate", "stats", "coverage", "list"] {
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

    for name in ["validate", "stats", "coverage", "list"] {
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
