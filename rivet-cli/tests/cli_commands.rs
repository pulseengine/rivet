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
