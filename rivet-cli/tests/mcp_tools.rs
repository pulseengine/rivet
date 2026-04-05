//! MCP tool integration tests — exercise MCP JSON-RPC protocol end-to-end.
//!
//! Creates a temporary project directory with rivet.yaml, a schema, and
//! artifact files, then sends JSON-RPC requests to `rivet mcp` and verifies
//! the response structure and content.

use std::io::Write;
use std::process::{Command, Stdio};

use serde_json::{Value, json};

/// Locate the `rivet` binary built by cargo.
fn rivet_bin() -> std::path::PathBuf {
    if let Ok(bin) = std::env::var("CARGO_BIN_EXE_rivet") {
        return std::path::PathBuf::from(bin);
    }
    let manifest = std::path::PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    let workspace_root = manifest.parent().expect("workspace root");
    workspace_root.join("target").join("debug").join("rivet")
}

/// Project root for referencing schema files.
fn project_root() -> std::path::PathBuf {
    std::path::PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .parent()
        .expect("workspace root")
        .to_path_buf()
}

/// Create a temporary project directory with schemas, rivet.yaml, and artifacts.
/// Returns the temp directory handle (drop to clean up) and its path.
fn setup_test_project() -> (tempfile::TempDir, std::path::PathBuf) {
    let tmp = tempfile::tempdir().expect("create temp dir");
    let dir = tmp.path().to_path_buf();

    // Copy common and dev schemas
    let schemas_dir = dir.join("schemas");
    std::fs::create_dir_all(&schemas_dir).expect("create schemas dir");
    let source_schemas = project_root().join("schemas");
    for schema_name in &["common.yaml", "dev.yaml"] {
        let src = source_schemas.join(schema_name);
        let dst = schemas_dir.join(schema_name);
        std::fs::copy(&src, &dst).unwrap_or_else(|e| {
            panic!("copy schema {}: {e}", src.display());
        });
    }

    // Create rivet.yaml
    let config = "\
project:
  name: mcp-test
  version: \"0.1.0\"
  schemas:
    - common
    - dev

sources:
  - path: artifacts
    format: generic-yaml
";
    std::fs::write(dir.join("rivet.yaml"), config).expect("write rivet.yaml");

    // Create artifacts directory with test artifacts
    let artifacts_dir = dir.join("artifacts");
    std::fs::create_dir_all(&artifacts_dir).expect("create artifacts dir");

    let artifacts_yaml = "\
artifacts:
  - id: REQ-001
    type: requirement
    title: System shall validate artifacts
    status: approved
    tags: [core, safety]
    fields:
      priority: must
    links:
      - type: satisfies
        target: DD-001
  - id: REQ-002
    type: requirement
    title: System shall support multiple schemas
    status: draft
    tags: [core]
    fields:
      priority: should
  - id: DD-001
    type: design-decision
    title: Use YAML for artifact storage
    status: approved
    fields:
      rationale: Human-readable and git-friendly
    links:
      - type: satisfies
        target: REQ-001
  - id: FEAT-001
    type: feature
    title: CLI validation command
    status: active
    links:
      - type: implements
        target: REQ-001
";
    std::fs::write(artifacts_dir.join("test-artifacts.yaml"), artifacts_yaml)
        .expect("write artifacts");

    (tmp, dir)
}

/// Send a JSON-RPC request to `rivet mcp` and parse the response.
///
/// Sends the `initialize` handshake first, then the actual request.
/// Returns the parsed JSON-RPC response for the actual request.
fn mcp_call(_project_dir: &std::path::Path, method: &str, params: Value) -> Value {
    let mut child = Command::new(rivet_bin())
        .args(["mcp"])
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .expect("spawn rivet mcp");

    let stdin = child.stdin.as_mut().expect("open stdin");

    // Send initialize request
    let init_req = json!({
        "jsonrpc": "2.0",
        "id": 1,
        "method": "initialize",
        "params": {}
    });
    writeln!(stdin, "{}", serde_json::to_string(&init_req).unwrap()).expect("write init");

    // Send the actual tool call
    let tool_req = json!({
        "jsonrpc": "2.0",
        "id": 2,
        "method": method,
        "params": params,
    });
    writeln!(stdin, "{}", serde_json::to_string(&tool_req).unwrap()).expect("write request");

    // Close stdin to signal EOF
    drop(child.stdin.take());

    let output = child.wait_with_output().expect("wait for rivet mcp");

    let stdout = String::from_utf8_lossy(&output.stdout);

    // Parse all lines of output; find the response with id=2
    let mut response: Option<Value> = None;
    for line in stdout.lines() {
        let line = line.trim();
        if line.is_empty() {
            continue;
        }
        if let Ok(val) = serde_json::from_str::<Value>(line) {
            if val.get("id") == Some(&json!(2)) {
                response = Some(val);
                break;
            }
        }
    }

    response.unwrap_or_else(|| {
        panic!(
            "no response with id=2 found in MCP output.\nstdout:\n{stdout}\nstderr:\n{}",
            String::from_utf8_lossy(&output.stderr)
        )
    })
}

/// Extract the tool result JSON from an MCP response.
///
/// MCP responses wrap tool output in `result.content[0].text` as a JSON string.
fn extract_tool_result(response: &Value) -> Value {
    let text = response
        .pointer("/result/content/0/text")
        .and_then(Value::as_str)
        .unwrap_or_else(|| {
            panic!(
                "expected result.content[0].text in response: {}",
                serde_json::to_string_pretty(response).unwrap()
            )
        });
    serde_json::from_str(text)
        .unwrap_or_else(|e| panic!("tool result text is not valid JSON: {e}\ntext: {text}"))
}

/// Check if the MCP response indicates an error.
fn is_error_response(response: &Value) -> bool {
    response
        .pointer("/result/isError")
        .and_then(Value::as_bool)
        .unwrap_or(false)
}

// ── rivet_validate ──────────────────────────────────────────────────────

#[test]
fn mcp_validate_returns_pass_for_valid_project() {
    let (_tmp, dir) = setup_test_project();
    let response = mcp_call(
        &dir,
        "tools/call",
        json!({
            "name": "rivet_validate",
            "arguments": {
                "project_dir": dir.to_str().unwrap()
            }
        }),
    );

    assert!(!is_error_response(&response), "expected success response");
    let result = extract_tool_result(&response);
    assert_eq!(result["result"], "PASS", "validation should pass: {result}");
    assert_eq!(result["errors"], 0, "should have 0 errors: {result}");
}

// ── rivet_list ──────────────────────────────────────────────────────────

#[test]
fn mcp_list_returns_all_artifacts() {
    let (_tmp, dir) = setup_test_project();
    let response = mcp_call(
        &dir,
        "tools/call",
        json!({
            "name": "rivet_list",
            "arguments": {
                "project_dir": dir.to_str().unwrap()
            }
        }),
    );

    assert!(!is_error_response(&response));
    let result = extract_tool_result(&response);
    assert_eq!(
        result["count"].as_u64().unwrap(),
        4,
        "should list 4 artifacts: {result}"
    );
    assert!(result["artifacts"].is_array());
    assert_eq!(result["artifacts"].as_array().unwrap().len(), 4);
}

#[test]
fn mcp_list_filters_by_type() {
    let (_tmp, dir) = setup_test_project();
    let response = mcp_call(
        &dir,
        "tools/call",
        json!({
            "name": "rivet_list",
            "arguments": {
                "project_dir": dir.to_str().unwrap(),
                "type_filter": "requirement"
            }
        }),
    );

    assert!(!is_error_response(&response));
    let result = extract_tool_result(&response);
    assert_eq!(
        result["count"].as_u64().unwrap(),
        2,
        "should list 2 requirements: {result}"
    );
}

// ── rivet_get ──────────��────────────────────────��───────────────────────

#[test]
fn mcp_get_returns_artifact_details() {
    let (_tmp, dir) = setup_test_project();
    let response = mcp_call(
        &dir,
        "tools/call",
        json!({
            "name": "rivet_get",
            "arguments": {
                "project_dir": dir.to_str().unwrap(),
                "id": "REQ-001"
            }
        }),
    );

    assert!(!is_error_response(&response));
    let result = extract_tool_result(&response);
    assert_eq!(result["id"], "REQ-001");
    assert_eq!(result["type"], "requirement");
    assert_eq!(result["title"], "System shall validate artifacts");
    assert_eq!(result["status"], "approved");
    assert!(result["tags"].is_array());
    assert!(result["links"].is_array());
    assert!(result["fields"].is_object());
}

#[test]
fn mcp_get_returns_error_for_unknown_id() {
    let (_tmp, dir) = setup_test_project();
    let response = mcp_call(
        &dir,
        "tools/call",
        json!({
            "name": "rivet_get",
            "arguments": {
                "project_dir": dir.to_str().unwrap(),
                "id": "NONEXISTENT"
            }
        }),
    );

    assert!(
        is_error_response(&response),
        "should return error for unknown artifact ID"
    );
}

// ── rivet_stats ─────────────────────────────────────────────────────────

#[test]
fn mcp_stats_includes_type_counts() {
    let (_tmp, dir) = setup_test_project();
    let response = mcp_call(
        &dir,
        "tools/call",
        json!({
            "name": "rivet_stats",
            "arguments": {
                "project_dir": dir.to_str().unwrap()
            }
        }),
    );

    assert!(!is_error_response(&response));
    let result = extract_tool_result(&response);
    assert_eq!(
        result["total"].as_u64().unwrap(),
        4,
        "should have 4 artifacts total: {result}"
    );
    assert!(result["types"].is_object(), "should have types object");
    let types = result["types"].as_object().unwrap();
    assert_eq!(
        types.get("requirement").and_then(Value::as_u64),
        Some(2),
        "should have 2 requirements"
    );
    assert_eq!(
        types.get("design-decision").and_then(Value::as_u64),
        Some(1),
        "should have 1 design-decision"
    );
    assert_eq!(
        types.get("feature").and_then(Value::as_u64),
        Some(1),
        "should have 1 feature"
    );
}

// ── rivet_schema ─────────────���───────────────────────────��──────────────

#[test]
fn mcp_schema_returns_type_definitions() {
    let (_tmp, dir) = setup_test_project();
    let response = mcp_call(
        &dir,
        "tools/call",
        json!({
            "name": "rivet_schema",
            "arguments": {
                "project_dir": dir.to_str().unwrap()
            }
        }),
    );

    assert!(!is_error_response(&response));
    let result = extract_tool_result(&response);
    assert!(result["artifact_types"].is_array());
    assert!(result["link_types"].is_array());
    assert!(result["traceability_rules"].is_array());

    let artifact_types = result["artifact_types"].as_array().unwrap();
    assert!(
        !artifact_types.is_empty(),
        "should have at least one artifact type"
    );

    // Verify requirement type is present
    let req_type = artifact_types.iter().find(|at| at["name"] == "requirement");
    assert!(req_type.is_some(), "should include 'requirement' type");
}

#[test]
fn mcp_schema_filters_by_type() {
    let (_tmp, dir) = setup_test_project();
    let response = mcp_call(
        &dir,
        "tools/call",
        json!({
            "name": "rivet_schema",
            "arguments": {
                "project_dir": dir.to_str().unwrap(),
                "type": "requirement"
            }
        }),
    );

    assert!(!is_error_response(&response));
    let result = extract_tool_result(&response);
    let artifact_types = result["artifact_types"].as_array().unwrap();
    assert_eq!(
        artifact_types.len(),
        1,
        "should return exactly 1 type when filtered"
    );
    assert_eq!(artifact_types[0]["name"], "requirement");
}

// ── rivet_coverage ──────────────────────────────────────────────────────

#[test]
fn mcp_coverage_returns_report() {
    let (_tmp, dir) = setup_test_project();
    let response = mcp_call(
        &dir,
        "tools/call",
        json!({
            "name": "rivet_coverage",
            "arguments": {
                "project_dir": dir.to_str().unwrap()
            }
        }),
    );

    assert!(!is_error_response(&response));
    let result = extract_tool_result(&response);
    assert!(
        result["overall_percentage"].is_number(),
        "should have overall_percentage"
    );
    assert!(result["rules"].is_array(), "should have rules array");
}

// ── unknown tool ────────────���─────────────────────────────────��─────────

#[test]
fn mcp_unknown_tool_returns_error() {
    let (_tmp, dir) = setup_test_project();
    let response = mcp_call(
        &dir,
        "tools/call",
        json!({
            "name": "nonexistent_tool",
            "arguments": {
                "project_dir": dir.to_str().unwrap()
            }
        }),
    );

    assert!(
        is_error_response(&response),
        "should return error for unknown tool"
    );
}

// ── tools/list ──────────────────────────────────��───────────────────────

#[test]
fn mcp_tools_list_returns_all_tools() {
    let (_tmp, dir) = setup_test_project();
    let response = mcp_call(&dir, "tools/list", json!({}));

    let tools = response
        .pointer("/result/tools")
        .and_then(Value::as_array)
        .expect("should have tools array in response");

    // Verify expected tool names are present
    let tool_names: Vec<&str> = tools.iter().filter_map(|t| t["name"].as_str()).collect();

    for expected in &[
        "rivet_validate",
        "rivet_list",
        "rivet_get",
        "rivet_stats",
        "rivet_coverage",
        "rivet_schema",
        "rivet_embed",
        "rivet_add",
    ] {
        assert!(
            tool_names.contains(expected),
            "tools/list should include '{expected}', got: {tool_names:?}"
        );
    }
}

// ── initialize ──────────────────────────────────────────────────────────

#[test]
fn mcp_initialize_returns_server_info() {
    let (_tmp, _dir) = setup_test_project();

    let mut child = Command::new(rivet_bin())
        .args(["mcp"])
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .expect("spawn rivet mcp");

    let stdin = child.stdin.as_mut().expect("open stdin");

    let init_req = json!({
        "jsonrpc": "2.0",
        "id": 1,
        "method": "initialize",
        "params": {}
    });
    writeln!(stdin, "{}", serde_json::to_string(&init_req).unwrap()).expect("write init");
    drop(child.stdin.take());

    let output = child.wait_with_output().expect("wait for rivet mcp");
    let stdout = String::from_utf8_lossy(&output.stdout);

    let response: Value = stdout
        .lines()
        .filter_map(|line| serde_json::from_str::<Value>(line.trim()).ok())
        .find(|v| v.get("id") == Some(&json!(1)))
        .expect("should get initialize response");

    assert_eq!(response["jsonrpc"], "2.0");
    assert!(response.get("result").is_some(), "should have result");
    let result = &response["result"];
    assert!(
        result["serverInfo"]["name"].as_str().is_some(),
        "should have serverInfo.name"
    );
    assert!(
        result["capabilities"]["tools"].is_object(),
        "should declare tools capability"
    );
}
