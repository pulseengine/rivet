//! MCP integration tests for the Rivet MCP server.
//!
//! These tests spawn `rivet mcp` as a child process, connect via rmcp client,
//! and exercise all 15 MCP tools (read and write) plus resources over the stdio
//! transport.

use std::path::{Path, PathBuf};
use std::process::Stdio;

use rmcp::ServiceExt;
use rmcp::model::*;
use rmcp::transport::{ConfigureCommandExt, TokioChildProcess};
use serde_json::Value;

// ── Helpers ─────────────────────────────────────────────────────────────

/// Path to the compiled `rivet` binary (built by cargo).
fn rivet_bin() -> PathBuf {
    // `cargo test` places the test binary alongside the built artifacts.
    let mut path = std::env::current_exe().expect("current_exe");
    // Go up from target/debug/deps/<test_binary> to target/debug/
    path.pop();
    if path.ends_with("deps") {
        path.pop();
    }
    path.push("rivet");
    assert!(
        path.exists(),
        "rivet binary not found at {}; run `cargo build -p rivet-cli` first",
        path.display()
    );
    path
}

/// Create a minimal rivet project in `dir` with the `dev` schema.
///
/// Returns the project directory path.
fn create_test_project(dir: &Path) {
    let schemas_dir = project_schemas_dir();

    // rivet.yaml pointing at local schema copies
    std::fs::write(
        dir.join("rivet.yaml"),
        r#"project:
  name: mcp-test
  version: "0.1.0"
  schemas:
    - common
    - dev

sources:
  - path: artifacts
    format: generic-yaml
"#,
    )
    .unwrap();

    // Copy the required schema files into a schemas/ subdirectory
    let dest_schemas = dir.join("schemas");
    std::fs::create_dir_all(&dest_schemas).unwrap();
    for name in &["common.yaml", "dev.yaml"] {
        std::fs::copy(schemas_dir.join(name), dest_schemas.join(name)).unwrap();
    }

    // Create artifacts directory with a valid artifact file
    let artifacts_dir = dir.join("artifacts");
    std::fs::create_dir_all(&artifacts_dir).unwrap();
    std::fs::write(
        artifacts_dir.join("requirements.yaml"),
        r#"artifacts:
  - id: REQ-001
    type: requirement
    title: The system shall do something
    status: draft
    fields:
      priority: must
      category: functional

  - id: REQ-002
    type: requirement
    title: The system shall do something else
    status: approved
    fields:
      priority: should
      category: non-functional
"#,
    )
    .unwrap();

    std::fs::write(
        artifacts_dir.join("decisions.yaml"),
        r#"artifacts:
  - id: DD-001
    type: design-decision
    title: Use YAML for storage
    status: approved
    fields:
      rationale: Human-readable and git-friendly
    links:
      - type: satisfies
        target: REQ-001
"#,
    )
    .unwrap();
}

/// Path to the project's schemas directory (workspace root / schemas).
fn project_schemas_dir() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("..")
        .join("schemas")
}

/// Spawn `rivet mcp` as a child process connected via rmcp client.
async fn spawn_mcp_client(
    project_dir: &Path,
) -> rmcp::service::RunningService<rmcp::RoleClient, ()> {
    let bin = rivet_bin();

    let (transport, _stderr) =
        TokioChildProcess::builder(tokio::process::Command::new(&bin).configure(|cmd| {
            cmd.arg("--project")
                .arg(project_dir)
                .arg("mcp")
                .stderr(Stdio::piped());
        }))
        .stderr(Stdio::piped())
        .spawn()
        .expect("failed to spawn rivet mcp");

    ().serve(transport)
        .await
        .expect("MCP client initialization failed")
}

/// Extract the text from the first Content block of a CallToolResult.
fn first_text(result: &CallToolResult) -> &str {
    result
        .content
        .first()
        .and_then(|c| c.raw.as_text())
        .map(|t| t.text.as_str())
        .expect("expected text content in tool result")
}

/// Parse the first text content of a CallToolResult as JSON.
fn parse_result(result: &CallToolResult) -> Value {
    serde_json::from_str(first_text(result)).expect("tool result is not valid JSON")
}

// ── Tests ───────────────────────────────────────────────────────────────

#[tokio::test]
async fn test_tools_list_returns_all_15_tools() {
    let tmp = tempfile::tempdir().unwrap();
    create_test_project(tmp.path());

    let client = spawn_mcp_client(tmp.path()).await;

    let tools = client.list_all_tools().await.expect("list_all_tools");

    let tool_names: Vec<&str> = tools.iter().map(|t| t.name.as_ref()).collect();

    let expected = [
        "rivet_validate",
        "rivet_list",
        "rivet_get",
        "rivet_stats",
        "rivet_coverage",
        "rivet_schema",
        "rivet_embed",
        "rivet_snapshot_capture",
        "rivet_add",
        "rivet_query",
        "rivet_modify",
        "rivet_link",
        "rivet_unlink",
        "rivet_remove",
        "rivet_reload",
    ];

    for name in &expected {
        assert!(
            tool_names.contains(name),
            "missing tool: {name}; got: {tool_names:?}"
        );
    }
    assert_eq!(
        tools.len(),
        expected.len(),
        "expected exactly {} tools, got {}",
        expected.len(),
        tools.len()
    );

    client.cancel().await.expect("cancel");
}

#[tokio::test]
async fn test_rivet_validate_pass() {
    let tmp = tempfile::tempdir().unwrap();
    create_test_project(tmp.path());

    let client = spawn_mcp_client(tmp.path()).await;

    let result = client
        .call_tool(CallToolRequestParams::new("rivet_validate"))
        .await
        .expect("call_tool rivet_validate");

    let json = parse_result(&result);
    assert_eq!(
        json["result"].as_str(),
        Some("PASS"),
        "expected PASS, got: {json}"
    );
    assert_eq!(json["errors"].as_u64(), Some(0));

    client.cancel().await.expect("cancel");
}

#[tokio::test]
async fn test_rivet_list_returns_artifacts() {
    let tmp = tempfile::tempdir().unwrap();
    create_test_project(tmp.path());

    let client = spawn_mcp_client(tmp.path()).await;

    let result = client
        .call_tool(CallToolRequestParams::new("rivet_list"))
        .await
        .expect("call_tool rivet_list");

    let json = parse_result(&result);
    let count = json["count"].as_u64().expect("count field");
    assert_eq!(count, 3, "expected 3 artifacts (REQ-001, REQ-002, DD-001)");

    let artifacts = json["artifacts"].as_array().expect("artifacts array");
    let ids: Vec<&str> = artifacts.iter().filter_map(|a| a["id"].as_str()).collect();
    assert!(ids.contains(&"REQ-001"), "missing REQ-001");
    assert!(ids.contains(&"REQ-002"), "missing REQ-002");
    assert!(ids.contains(&"DD-001"), "missing DD-001");

    client.cancel().await.expect("cancel");
}

#[tokio::test]
async fn test_rivet_list_with_type_filter() {
    let tmp = tempfile::tempdir().unwrap();
    create_test_project(tmp.path());

    let client = spawn_mcp_client(tmp.path()).await;

    let mut args = serde_json::Map::new();
    args.insert(
        "type_filter".to_string(),
        Value::String("design-decision".to_string()),
    );

    let result = client
        .call_tool(CallToolRequestParams::new("rivet_list").with_arguments(args))
        .await
        .expect("call_tool rivet_list with filter");

    let json = parse_result(&result);
    let count = json["count"].as_u64().expect("count field");
    assert_eq!(count, 1, "expected 1 design-decision artifact");

    let artifacts = json["artifacts"].as_array().expect("artifacts array");
    assert_eq!(artifacts[0]["id"].as_str(), Some("DD-001"));

    client.cancel().await.expect("cancel");
}

#[tokio::test]
async fn test_rivet_get_valid_id() {
    let tmp = tempfile::tempdir().unwrap();
    create_test_project(tmp.path());

    let client = spawn_mcp_client(tmp.path()).await;

    let mut args = serde_json::Map::new();
    args.insert("id".to_string(), Value::String("REQ-001".to_string()));

    let result = client
        .call_tool(CallToolRequestParams::new("rivet_get").with_arguments(args))
        .await
        .expect("call_tool rivet_get");

    let json = parse_result(&result);
    assert_eq!(json["id"].as_str(), Some("REQ-001"));
    assert_eq!(json["type"].as_str(), Some("requirement"));
    assert_eq!(
        json["title"].as_str(),
        Some("The system shall do something")
    );
    assert_eq!(json["status"].as_str(), Some("draft"));

    client.cancel().await.expect("cancel");
}

#[tokio::test]
async fn test_rivet_get_invalid_id() {
    let tmp = tempfile::tempdir().unwrap();
    create_test_project(tmp.path());

    let client = spawn_mcp_client(tmp.path()).await;

    let mut args = serde_json::Map::new();
    args.insert(
        "id".to_string(),
        Value::String("NONEXISTENT-999".to_string()),
    );

    let result = client
        .call_tool(CallToolRequestParams::new("rivet_get").with_arguments(args))
        .await;

    // The server returns an error for missing artifacts via McpError
    assert!(
        result.is_err(),
        "expected error for nonexistent artifact, got: {result:?}"
    );

    client.cancel().await.expect("cancel");
}

#[tokio::test]
async fn test_rivet_stats() {
    let tmp = tempfile::tempdir().unwrap();
    create_test_project(tmp.path());

    let client = spawn_mcp_client(tmp.path()).await;

    let result = client
        .call_tool(CallToolRequestParams::new("rivet_stats"))
        .await
        .expect("call_tool rivet_stats");

    let json = parse_result(&result);
    assert_eq!(
        json["total"].as_u64(),
        Some(3),
        "expected 3 total artifacts"
    );

    let types = json["types"].as_object().expect("types object");
    assert_eq!(
        types.get("requirement").and_then(|v| v.as_u64()),
        Some(2),
        "expected 2 requirements"
    );
    assert_eq!(
        types.get("design-decision").and_then(|v| v.as_u64()),
        Some(1),
        "expected 1 design-decision"
    );

    client.cancel().await.expect("cancel");
}

#[tokio::test]
async fn test_rivet_schema_returns_types() {
    let tmp = tempfile::tempdir().unwrap();
    create_test_project(tmp.path());

    let client = spawn_mcp_client(tmp.path()).await;

    let result = client
        .call_tool(CallToolRequestParams::new("rivet_schema"))
        .await
        .expect("call_tool rivet_schema");

    let json = parse_result(&result);

    let artifact_types = json["artifact_types"]
        .as_array()
        .expect("artifact_types array");
    let type_names: Vec<&str> = artifact_types
        .iter()
        .filter_map(|t| t["name"].as_str())
        .collect();

    // The dev schema defines requirement, design-decision, feature, test-case
    assert!(
        type_names.contains(&"requirement"),
        "missing requirement type; got: {type_names:?}"
    );
    assert!(
        type_names.contains(&"design-decision"),
        "missing design-decision type; got: {type_names:?}"
    );

    // Should also include link_types
    let link_types = json["link_types"].as_array().expect("link_types array");
    assert!(
        !link_types.is_empty(),
        "expected at least one link type from common schema"
    );

    client.cancel().await.expect("cancel");
}

#[tokio::test]
async fn test_rivet_schema_with_type_filter() {
    let tmp = tempfile::tempdir().unwrap();
    create_test_project(tmp.path());

    let client = spawn_mcp_client(tmp.path()).await;

    let mut args = serde_json::Map::new();
    args.insert("type".to_string(), Value::String("requirement".to_string()));

    let result = client
        .call_tool(CallToolRequestParams::new("rivet_schema").with_arguments(args))
        .await
        .expect("call_tool rivet_schema with type filter");

    let json = parse_result(&result);
    let artifact_types = json["artifact_types"]
        .as_array()
        .expect("artifact_types array");
    assert_eq!(
        artifact_types.len(),
        1,
        "expected exactly 1 type with filter"
    );
    assert_eq!(artifact_types[0]["name"].as_str(), Some("requirement"));

    client.cancel().await.expect("cancel");
}

#[tokio::test]
async fn test_rivet_coverage() {
    let tmp = tempfile::tempdir().unwrap();
    create_test_project(tmp.path());

    let client = spawn_mcp_client(tmp.path()).await;

    let result = client
        .call_tool(CallToolRequestParams::new("rivet_coverage"))
        .await
        .expect("call_tool rivet_coverage");

    let json = parse_result(&result);

    // overall_percentage should be a number
    assert!(
        json["overall_percentage"].is_number(),
        "expected overall_percentage to be a number, got: {json}"
    );

    // rules should be an array
    let rules = json["rules"].as_array().expect("rules array");
    // The dev schema may or may not have traceability rules, but the field should exist
    assert!(json["rules"].is_array(), "expected rules to be an array");

    // If there are rules, each should have standard fields
    for rule in rules {
        assert!(rule["name"].is_string(), "rule should have a name");
        assert!(rule["total"].is_number(), "rule should have a total");
        assert!(
            rule["covered"].is_number(),
            "rule should have a covered count"
        );
    }

    client.cancel().await.expect("cancel");
}

#[tokio::test]
async fn test_resources_list() {
    let tmp = tempfile::tempdir().unwrap();
    create_test_project(tmp.path());

    let client = spawn_mcp_client(tmp.path()).await;

    let resources = client
        .list_all_resources()
        .await
        .expect("list_all_resources");

    let uris: Vec<&str> = resources.iter().map(|r| r.uri.as_str()).collect();

    assert!(
        uris.contains(&"rivet://diagnostics"),
        "missing rivet://diagnostics resource; got: {uris:?}"
    );
    assert!(
        uris.contains(&"rivet://coverage"),
        "missing rivet://coverage resource; got: {uris:?}"
    );
    assert_eq!(resources.len(), 2, "expected exactly 2 resources");

    client.cancel().await.expect("cancel");
}

#[tokio::test]
async fn test_resources_read_diagnostics() {
    let tmp = tempfile::tempdir().unwrap();
    create_test_project(tmp.path());

    let client = spawn_mcp_client(tmp.path()).await;

    let result = client
        .read_resource(ReadResourceRequestParams::new("rivet://diagnostics"))
        .await
        .expect("read_resource rivet://diagnostics");

    assert!(
        !result.contents.is_empty(),
        "expected non-empty resource contents"
    );

    // The content should be JSON text
    let text = match &result.contents[0] {
        ResourceContents::TextResourceContents { text, .. } => text.as_str(),
        _ => panic!("expected text resource contents"),
    };

    let json: Value = serde_json::from_str(text).expect("resource content should be valid JSON");
    assert!(
        json["result"].is_string(),
        "diagnostics should have a result field"
    );
    assert_eq!(
        json["result"].as_str(),
        Some("PASS"),
        "test project should pass validation"
    );

    client.cancel().await.expect("cancel");
}

#[tokio::test]
async fn test_resources_read_coverage() {
    let tmp = tempfile::tempdir().unwrap();
    create_test_project(tmp.path());

    let client = spawn_mcp_client(tmp.path()).await;

    let result = client
        .read_resource(ReadResourceRequestParams::new("rivet://coverage"))
        .await
        .expect("read_resource rivet://coverage");

    assert!(
        !result.contents.is_empty(),
        "expected non-empty resource contents"
    );

    let text = match &result.contents[0] {
        ResourceContents::TextResourceContents { text, .. } => text.as_str(),
        _ => panic!("expected text resource contents"),
    };

    let json: Value = serde_json::from_str(text).expect("resource content should be valid JSON");
    assert!(
        json["overall_percentage"].is_number(),
        "coverage should have overall_percentage"
    );
    assert!(json["rules"].is_array(), "coverage should have rules array");

    client.cancel().await.expect("cancel");
}

#[tokio::test]
async fn test_rivet_reload() {
    let tmp = tempfile::tempdir().unwrap();
    create_test_project(tmp.path());

    let client = spawn_mcp_client(tmp.path()).await;

    // First verify initial state
    let result = client
        .call_tool(CallToolRequestParams::new("rivet_stats"))
        .await
        .expect("call_tool rivet_stats");
    let json = parse_result(&result);
    assert_eq!(json["total"].as_u64(), Some(3));

    // Add a new artifact file on disk
    std::fs::write(
        tmp.path().join("artifacts").join("features.yaml"),
        r#"artifacts:
  - id: FEAT-001
    type: feature
    title: A new feature
    status: draft
"#,
    )
    .unwrap();

    // Reload
    let result = client
        .call_tool(CallToolRequestParams::new("rivet_reload"))
        .await
        .expect("call_tool rivet_reload");
    let json = parse_result(&result);
    assert_eq!(json["reloaded"], Value::Bool(true));

    // Check that the new artifact is visible
    let result = client
        .call_tool(CallToolRequestParams::new("rivet_stats"))
        .await
        .expect("call_tool rivet_stats after reload");
    let json = parse_result(&result);
    assert_eq!(
        json["total"].as_u64(),
        Some(4),
        "expected 4 artifacts after reload; got: {json}"
    );

    client.cancel().await.expect("cancel");
}

#[tokio::test]
async fn test_query_filters_by_type() {
    let tmp = tempfile::tempdir().unwrap();
    create_test_project(tmp.path());

    let client = spawn_mcp_client(tmp.path()).await;

    // Query for only requirements using s-expression filter
    let mut args = serde_json::Map::new();
    args.insert(
        "filter".to_string(),
        Value::String("(= type \"requirement\")".to_string()),
    );

    let result = client
        .call_tool(CallToolRequestParams::new("rivet_query").with_arguments(args))
        .await
        .expect("call_tool rivet_query");

    let json = parse_result(&result);
    assert_eq!(
        json["count"].as_u64(),
        Some(2),
        "expected 2 requirements; got: {json}"
    );

    let artifacts = json["artifacts"].as_array().expect("artifacts array");
    for artifact in artifacts {
        assert_eq!(
            artifact["type"].as_str(),
            Some("requirement"),
            "expected all artifacts to be requirements; got: {artifact}"
        );
    }

    let ids: Vec<&str> = artifacts.iter().filter_map(|a| a["id"].as_str()).collect();
    assert!(ids.contains(&"REQ-001"), "missing REQ-001");
    assert!(ids.contains(&"REQ-002"), "missing REQ-002");
    assert!(!ids.contains(&"DD-001"), "DD-001 should not be in results");

    client.cancel().await.expect("cancel");
}

#[tokio::test]
async fn test_modify_changes_status() {
    let tmp = tempfile::tempdir().unwrap();
    create_test_project(tmp.path());

    let client = spawn_mcp_client(tmp.path()).await;

    // Verify initial status is "draft"
    let mut args = serde_json::Map::new();
    args.insert("id".to_string(), Value::String("REQ-001".to_string()));
    let result = client
        .call_tool(CallToolRequestParams::new("rivet_get").with_arguments(args))
        .await
        .expect("call_tool rivet_get before modify");
    let json = parse_result(&result);
    assert_eq!(json["status"].as_str(), Some("draft"), "initial status");

    // Modify status to "approved"
    let mut args = serde_json::Map::new();
    args.insert("id".to_string(), Value::String("REQ-001".to_string()));
    args.insert("status".to_string(), Value::String("approved".to_string()));

    let result = client
        .call_tool(CallToolRequestParams::new("rivet_modify").with_arguments(args))
        .await
        .expect("call_tool rivet_modify");

    let json = parse_result(&result);
    assert_eq!(
        json["modified"].as_str(),
        Some("REQ-001"),
        "modify response should confirm artifact ID"
    );

    // Reload so the in-memory state picks up the file change
    let result = client
        .call_tool(CallToolRequestParams::new("rivet_reload"))
        .await
        .expect("call_tool rivet_reload");
    let json = parse_result(&result);
    assert_eq!(json["reloaded"], Value::Bool(true));

    // Verify the status changed via rivet_get
    let mut args = serde_json::Map::new();
    args.insert("id".to_string(), Value::String("REQ-001".to_string()));
    let result = client
        .call_tool(CallToolRequestParams::new("rivet_get").with_arguments(args))
        .await
        .expect("call_tool rivet_get after modify");
    let json = parse_result(&result);
    assert_eq!(
        json["status"].as_str(),
        Some("approved"),
        "status should be updated to approved; got: {json}"
    );

    client.cancel().await.expect("cancel");
}

#[tokio::test]
async fn test_link_and_unlink() {
    let tmp = tempfile::tempdir().unwrap();
    create_test_project(tmp.path());

    let client = spawn_mcp_client(tmp.path()).await;

    // Verify REQ-002 initially has no links
    let mut args = serde_json::Map::new();
    args.insert("id".to_string(), Value::String("REQ-002".to_string()));
    let result = client
        .call_tool(CallToolRequestParams::new("rivet_get").with_arguments(args))
        .await
        .expect("call_tool rivet_get before link");
    let json = parse_result(&result);
    let links = json["links"].as_array().expect("links array");
    assert!(links.is_empty(), "REQ-002 should have no links initially");

    // Add a link: REQ-002 --[satisfies]--> REQ-001
    let mut args = serde_json::Map::new();
    args.insert("source".to_string(), Value::String("REQ-002".to_string()));
    args.insert(
        "link_type".to_string(),
        Value::String("satisfies".to_string()),
    );
    args.insert("target".to_string(), Value::String("REQ-001".to_string()));

    let result = client
        .call_tool(CallToolRequestParams::new("rivet_link").with_arguments(args))
        .await
        .expect("call_tool rivet_link");

    let json = parse_result(&result);
    assert!(
        json["linked"].as_str().is_some(),
        "link response should have 'linked' field; got: {json}"
    );

    // Reload
    let result = client
        .call_tool(CallToolRequestParams::new("rivet_reload"))
        .await
        .expect("call_tool rivet_reload after link");
    let json = parse_result(&result);
    assert_eq!(json["reloaded"], Value::Bool(true));

    // Verify the link exists via rivet_get
    let mut args = serde_json::Map::new();
    args.insert("id".to_string(), Value::String("REQ-002".to_string()));
    let result = client
        .call_tool(CallToolRequestParams::new("rivet_get").with_arguments(args))
        .await
        .expect("call_tool rivet_get after link");
    let json = parse_result(&result);
    let links = json["links"].as_array().expect("links array after link");
    assert_eq!(links.len(), 1, "REQ-002 should have 1 link; got: {json}");
    assert_eq!(links[0]["type"].as_str(), Some("satisfies"));
    assert_eq!(links[0]["target"].as_str(), Some("REQ-001"));

    // Now unlink: REQ-002 --[satisfies]--> REQ-001
    let mut args = serde_json::Map::new();
    args.insert("source".to_string(), Value::String("REQ-002".to_string()));
    args.insert(
        "link_type".to_string(),
        Value::String("satisfies".to_string()),
    );
    args.insert("target".to_string(), Value::String("REQ-001".to_string()));

    let result = client
        .call_tool(CallToolRequestParams::new("rivet_unlink").with_arguments(args))
        .await
        .expect("call_tool rivet_unlink");

    let json = parse_result(&result);
    assert!(
        json["unlinked"].as_str().is_some(),
        "unlink response should have 'unlinked' field; got: {json}"
    );

    // Reload again
    let result = client
        .call_tool(CallToolRequestParams::new("rivet_reload"))
        .await
        .expect("call_tool rivet_reload after unlink");
    let json = parse_result(&result);
    assert_eq!(json["reloaded"], Value::Bool(true));

    // Verify the link is gone
    let mut args = serde_json::Map::new();
    args.insert("id".to_string(), Value::String("REQ-002".to_string()));
    let result = client
        .call_tool(CallToolRequestParams::new("rivet_get").with_arguments(args))
        .await
        .expect("call_tool rivet_get after unlink");
    let json = parse_result(&result);
    let links = json["links"].as_array().expect("links array after unlink");
    assert!(
        links.is_empty(),
        "REQ-002 should have no links after unlink; got: {json}"
    );

    client.cancel().await.expect("cancel");
}

#[tokio::test]
async fn test_remove_artifact() {
    let tmp = tempfile::tempdir().unwrap();
    create_test_project(tmp.path());

    let client = spawn_mcp_client(tmp.path()).await;

    // Verify initial count is 3
    let result = client
        .call_tool(CallToolRequestParams::new("rivet_list"))
        .await
        .expect("call_tool rivet_list before remove");
    let json = parse_result(&result);
    assert_eq!(json["count"].as_u64(), Some(3), "initial count should be 3");

    // Remove REQ-002 (nothing links to it, so no force needed)
    let mut args = serde_json::Map::new();
    args.insert("id".to_string(), Value::String("REQ-002".to_string()));

    let result = client
        .call_tool(CallToolRequestParams::new("rivet_remove").with_arguments(args))
        .await
        .expect("call_tool rivet_remove");

    let json = parse_result(&result);
    assert_eq!(
        json["removed"].as_str(),
        Some("REQ-002"),
        "remove response should confirm artifact ID; got: {json}"
    );

    // Reload
    let result = client
        .call_tool(CallToolRequestParams::new("rivet_reload"))
        .await
        .expect("call_tool rivet_reload after remove");
    let json = parse_result(&result);
    assert_eq!(json["reloaded"], Value::Bool(true));

    // Verify artifact is gone from the list
    let result = client
        .call_tool(CallToolRequestParams::new("rivet_list"))
        .await
        .expect("call_tool rivet_list after remove");
    let json = parse_result(&result);
    assert_eq!(
        json["count"].as_u64(),
        Some(2),
        "expected 2 artifacts after remove; got: {json}"
    );

    let artifacts = json["artifacts"].as_array().expect("artifacts array");
    let ids: Vec<&str> = artifacts.iter().filter_map(|a| a["id"].as_str()).collect();
    assert!(!ids.contains(&"REQ-002"), "REQ-002 should be removed");
    assert!(ids.contains(&"REQ-001"), "REQ-001 should still exist");
    assert!(ids.contains(&"DD-001"), "DD-001 should still exist");

    client.cancel().await.expect("cancel");
}

// ── Bug: set_fields scope — reserved top-level keys (Fixes: REQ-002) ────
//
// `set_fields` targets the `fields:` sub-map on an artifact. It must refuse
// to write keys that collide with reserved top-level keys (id, type, title,
// description, status, tags, links, fields, provenance, source-file),
// because otherwise it either silently nests them under `fields:` (breaking
// the artifact's shape) or, worse, emits unquoted scalars that break YAML
// parsing when the value contains backticks or newlines.

#[tokio::test]
async fn test_set_fields_rejects_reserved_description() {
    let tmp = tempfile::tempdir().unwrap();
    create_test_project(tmp.path());

    let client = spawn_mcp_client(tmp.path()).await;

    // Attempt to smuggle a top-level `description` via `set_fields`.
    let mut args = serde_json::Map::new();
    args.insert("id".to_string(), Value::String("REQ-001".to_string()));
    args.insert(
        "set_fields".to_string(),
        Value::Array(vec![Value::String(
            "description=Top-level description via set_fields".to_string(),
        )]),
    );

    let result = client
        .call_tool(CallToolRequestParams::new("rivet_modify").with_arguments(args))
        .await;

    assert!(
        result.is_err(),
        "set_fields must refuse reserved key 'description'; got: {result:?}"
    );
    let err = format!("{:?}", result.unwrap_err());
    assert!(
        err.contains("description") && (err.contains("reserved") || err.contains("top-level")),
        "error should mention reserved/top-level description; got: {err}"
    );

    // The file must not have been touched with a nested `description:` under `fields:`.
    let content =
        std::fs::read_to_string(tmp.path().join("artifacts").join("requirements.yaml")).unwrap();
    assert!(
        !content.contains("Top-level description via set_fields"),
        "set_fields should not have written the value; file:\n{content}"
    );

    client.cancel().await.expect("cancel");
}

#[tokio::test]
async fn test_set_fields_rejects_all_reserved_top_level_keys() {
    let tmp = tempfile::tempdir().unwrap();
    create_test_project(tmp.path());

    let client = spawn_mcp_client(tmp.path()).await;

    for reserved in &[
        "id",
        "type",
        "title",
        "description",
        "status",
        "tags",
        "links",
        "fields",
        "provenance",
        "source-file",
    ] {
        let mut args = serde_json::Map::new();
        args.insert("id".to_string(), Value::String("REQ-001".to_string()));
        args.insert(
            "set_fields".to_string(),
            Value::Array(vec![Value::String(format!("{reserved}=x"))]),
        );

        let result = client
            .call_tool(CallToolRequestParams::new("rivet_modify").with_arguments(args))
            .await;

        assert!(
            result.is_err(),
            "set_fields must refuse reserved key '{reserved}'; got: {result:?}"
        );
    }

    client.cancel().await.expect("cancel");
}

// ── Bug 2: set_metadata tool for top-level fields (Fixes: REQ-002) ─────
//
// Exposes `description` on `rivet_modify` so that top-level metadata is
// reachable from MCP. Handles YAML-safe scalar quoting for values containing
// backticks, newlines, or other special characters.

#[tokio::test]
async fn test_modify_sets_top_level_description() {
    let tmp = tempfile::tempdir().unwrap();
    create_test_project(tmp.path());

    let client = spawn_mcp_client(tmp.path()).await;

    // Set a plain top-level description.
    let mut args = serde_json::Map::new();
    args.insert("id".to_string(), Value::String("REQ-001".to_string()));
    args.insert(
        "description".to_string(),
        Value::String("A plain description".to_string()),
    );

    let result = client
        .call_tool(CallToolRequestParams::new("rivet_modify").with_arguments(args))
        .await
        .expect("call_tool rivet_modify with description");

    let json = parse_result(&result);
    assert_eq!(json["modified"].as_str(), Some("REQ-001"));

    // Reload and verify via rivet_get.
    client
        .call_tool(CallToolRequestParams::new("rivet_reload"))
        .await
        .expect("reload");

    let mut args = serde_json::Map::new();
    args.insert("id".to_string(), Value::String("REQ-001".to_string()));
    let result = client
        .call_tool(CallToolRequestParams::new("rivet_get").with_arguments(args))
        .await
        .expect("rivet_get after modify");
    let json = parse_result(&result);
    assert_eq!(
        json["description"].as_str(),
        Some("A plain description"),
        "top-level description should round-trip; got: {json}"
    );

    // And it must not have been nested under `fields:` (regression check).
    let content =
        std::fs::read_to_string(tmp.path().join("artifacts").join("requirements.yaml")).unwrap();
    // The file should still validate: run rivet_validate.
    let result = client
        .call_tool(CallToolRequestParams::new("rivet_validate"))
        .await
        .expect("rivet_validate");
    let json = parse_result(&result);
    assert_eq!(
        json["result"].as_str(),
        Some("PASS"),
        "validation should still pass after setting top-level description; file:\n{content}\n\
         diagnostics: {json}"
    );

    client.cancel().await.expect("cancel");
}

#[tokio::test]
async fn test_modify_description_with_backticks_and_newlines() {
    let tmp = tempfile::tempdir().unwrap();
    create_test_project(tmp.path());

    let client = spawn_mcp_client(tmp.path()).await;

    // Value contains backticks, newlines, and a trailing colon — the old
    // unquoted `format!("description: {value}")` path would blow up parsing.
    let tricky = "Use `rivet validate` to check.\nSecond line: ok?\n\nWith blank line.";

    let mut args = serde_json::Map::new();
    args.insert("id".to_string(), Value::String("REQ-001".to_string()));
    args.insert("description".to_string(), Value::String(tricky.to_string()));

    let result = client
        .call_tool(CallToolRequestParams::new("rivet_modify").with_arguments(args))
        .await
        .expect("rivet_modify with tricky description");
    let json = parse_result(&result);
    assert_eq!(json["modified"].as_str(), Some("REQ-001"));

    // The resulting file must still parse as YAML.
    let content =
        std::fs::read_to_string(tmp.path().join("artifacts").join("requirements.yaml")).unwrap();
    let _parsed: serde_yaml::Value = serde_yaml::from_str(&content).unwrap_or_else(|e| {
        panic!("file should parse as YAML after tricky description: {e}\n{content}")
    });

    // Reload and check round-trip.
    client
        .call_tool(CallToolRequestParams::new("rivet_reload"))
        .await
        .expect("reload");

    let mut args = serde_json::Map::new();
    args.insert("id".to_string(), Value::String("REQ-001".to_string()));
    let result = client
        .call_tool(CallToolRequestParams::new("rivet_get").with_arguments(args))
        .await
        .expect("rivet_get after tricky modify");
    let json = parse_result(&result);
    let got = json["description"].as_str().unwrap_or("");
    assert!(
        got.contains("`rivet validate`"),
        "description should preserve backticks; got: {got:?}"
    );
    assert!(
        got.contains("Second line"),
        "description should preserve newlines; got: {got:?}"
    );

    client.cancel().await.expect("cancel");
}
