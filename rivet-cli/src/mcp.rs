//! MCP (Model Context Protocol) server for Rivet.
//!
//! Implements the MCP protocol over stdio using JSON-RPC 2.0.
//! This allows AI coding assistants (Claude Code, Cursor, etc.) to interact
//! with Rivet projects programmatically — validating artifacts, listing them,
//! and querying project statistics.

use std::io::{self, BufRead, Write};
use std::path::Path;

use anyhow::{Context, Result};
use serde_json::{Value, json};

use rivet_core::links::LinkGraph;
use rivet_core::schema::Severity;
use rivet_core::store::Store;
use rivet_core::validate;

// ── JSON-RPC helpers ────────────────────────────────────────────────────

fn jsonrpc_result(id: Value, result: Value) -> Value {
    json!({
        "jsonrpc": "2.0",
        "id": id,
        "result": result,
    })
}

fn jsonrpc_error(id: Value, code: i64, message: &str) -> Value {
    json!({
        "jsonrpc": "2.0",
        "id": id,
        "error": {
            "code": code,
            "message": message,
        },
    })
}

// ── Tool definitions ────────────────────────────────────────────────────

fn tool_definitions() -> Vec<Value> {
    vec![
        json!({
            "name": "rivet_validate",
            "description": "Validate artifacts against schemas and return diagnostics. Returns errors, warnings, and informational messages about the project's artifact consistency.",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "project_dir": {
                        "type": "string",
                        "description": "Path to the project directory containing rivet.yaml. Defaults to the current working directory."
                    }
                },
                "required": []
            }
        }),
        json!({
            "name": "rivet_list",
            "description": "List artifacts in the project, optionally filtered by type. Returns artifact IDs, types, titles, statuses, and link counts.",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "project_dir": {
                        "type": "string",
                        "description": "Path to the project directory containing rivet.yaml. Defaults to the current working directory."
                    },
                    "type_filter": {
                        "type": "string",
                        "description": "Filter by artifact type (e.g., 'requirement', 'design-decision')"
                    },
                    "status_filter": {
                        "type": "string",
                        "description": "Filter by lifecycle status (e.g., 'draft', 'active', 'approved')"
                    }
                },
                "required": []
            }
        }),
        json!({
            "name": "rivet_stats",
            "description": "Return project statistics: artifact counts by type, total count, orphan artifacts (no links), and broken link count.",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "project_dir": {
                        "type": "string",
                        "description": "Path to the project directory containing rivet.yaml. Defaults to the current working directory."
                    }
                },
                "required": []
            }
        }),
    ]
}

// ── Project loading (simplified from main.rs) ───────────────────────────

struct McpProject {
    store: Store,
    schema: rivet_core::schema::Schema,
    graph: LinkGraph,
}

fn load_project(project_dir: &Path) -> Result<McpProject> {
    let config_path = project_dir.join("rivet.yaml");
    let config = rivet_core::load_project_config(&config_path)
        .with_context(|| format!("loading {}", config_path.display()))?;

    // Resolve schemas directory
    let schemas_dir = {
        let project_schemas = project_dir.join("schemas");
        if project_schemas.exists() {
            project_schemas
        } else if let Ok(exe) = std::env::current_exe() {
            if let Some(parent) = exe.parent() {
                let bin_schemas = parent.join("../schemas");
                if bin_schemas.exists() {
                    bin_schemas
                } else {
                    project_schemas
                }
            } else {
                project_schemas
            }
        } else {
            project_schemas
        }
    };

    let schema = rivet_core::load_schemas(&config.project.schemas, &schemas_dir)
        .context("loading schemas")?;

    let mut store = Store::new();
    for source in &config.sources {
        let artifacts = rivet_core::load_artifacts(source, project_dir)
            .with_context(|| format!("loading source '{}'", source.path))?;
        for artifact in artifacts {
            store.upsert(artifact);
        }
    }

    let graph = LinkGraph::build(&store, &schema);
    Ok(McpProject {
        store,
        schema,
        graph,
    })
}

// ── Tool implementations ────────────────────────────────────────────────

fn tool_validate(project_dir: &Path) -> Result<Value> {
    let proj = load_project(project_dir)?;
    let diagnostics = validate::validate(&proj.store, &proj.schema, &proj.graph);

    let errors = diagnostics
        .iter()
        .filter(|d| d.severity == Severity::Error)
        .count();
    let warnings = diagnostics
        .iter()
        .filter(|d| d.severity == Severity::Warning)
        .count();
    let infos = diagnostics
        .iter()
        .filter(|d| d.severity == Severity::Info)
        .count();

    let diag_json: Vec<Value> = diagnostics
        .iter()
        .map(|d| {
            json!({
                "severity": format!("{:?}", d.severity).to_lowercase(),
                "artifact_id": d.artifact_id,
                "message": d.message,
            })
        })
        .collect();

    let result_str = if errors > 0 { "FAIL" } else { "PASS" };
    Ok(json!({
        "result": result_str,
        "errors": errors,
        "warnings": warnings,
        "infos": infos,
        "diagnostics": diag_json,
    }))
}

fn tool_list(
    project_dir: &Path,
    type_filter: Option<&str>,
    status_filter: Option<&str>,
) -> Result<Value> {
    let proj = load_project(project_dir)?;

    let query = rivet_core::query::Query {
        artifact_type: type_filter.map(|s| s.to_string()),
        status: status_filter.map(|s| s.to_string()),
        ..Default::default()
    };
    let results = rivet_core::query::execute(&proj.store, &query);

    let artifacts_json: Vec<Value> = results
        .iter()
        .map(|a| {
            json!({
                "id": a.id,
                "type": a.artifact_type,
                "title": a.title,
                "status": a.status.as_deref().unwrap_or("-"),
                "links": a.links.len(),
            })
        })
        .collect();

    Ok(json!({
        "count": results.len(),
        "artifacts": artifacts_json,
    }))
}

fn tool_stats(project_dir: &Path) -> Result<Value> {
    let proj = load_project(project_dir)?;
    let orphans = proj.graph.orphans(&proj.store);

    let mut types = serde_json::Map::new();
    let mut type_names: Vec<&str> = proj.store.types().collect();
    type_names.sort();
    for t in &type_names {
        types.insert(t.to_string(), json!(proj.store.count_by_type(t)));
    }

    Ok(json!({
        "total": proj.store.len(),
        "types": types,
        "orphans": orphans,
        "broken_links": proj.graph.broken.len(),
    }))
}

// ── Tool dispatch ───────────────────────────────────────────────────────

fn dispatch_tool(name: &str, arguments: &Value) -> Value {
    let project_dir_str = arguments
        .get("project_dir")
        .and_then(Value::as_str)
        .unwrap_or(".");
    let project_dir = std::path::PathBuf::from(project_dir_str);

    let result = match name {
        "rivet_validate" => tool_validate(&project_dir),
        "rivet_list" => {
            let type_filter = arguments.get("type_filter").and_then(Value::as_str);
            let status_filter = arguments.get("status_filter").and_then(Value::as_str);
            tool_list(&project_dir, type_filter, status_filter)
        }
        "rivet_stats" => tool_stats(&project_dir),
        _ => {
            return json!({
                "content": [{
                    "type": "text",
                    "text": format!("Unknown tool: {name}"),
                }],
                "isError": true,
            });
        }
    };

    match result {
        Ok(value) => json!({
            "content": [{
                "type": "text",
                "text": serde_json::to_string_pretty(&value).unwrap_or_default(),
            }],
        }),
        Err(e) => json!({
            "content": [{
                "type": "text",
                "text": format!("Error: {e:#}"),
            }],
            "isError": true,
        }),
    }
}

// ── Request handler ─────────────────────────────────────────────────────

fn handle_request(method: &str, params: &Value, id: Value) -> Option<Value> {
    match method {
        "initialize" => Some(jsonrpc_result(
            id,
            json!({
                "protocolVersion": "2024-11-05",
                "capabilities": {
                    "tools": {}
                },
                "serverInfo": {
                    "name": "rivet-mcp",
                    "version": env!("CARGO_PKG_VERSION"),
                }
            }),
        )),
        "notifications/initialized" => {
            // Client acknowledges initialization — no response needed.
            None
        }
        "tools/list" => Some(jsonrpc_result(
            id,
            json!({
                "tools": tool_definitions(),
            }),
        )),
        "tools/call" => {
            let name = params.get("name").and_then(Value::as_str).unwrap_or("");
            let arguments = params.get("arguments").cloned().unwrap_or(json!({}));

            let result = dispatch_tool(name, &arguments);
            Some(jsonrpc_result(id, result))
        }
        "ping" => Some(jsonrpc_result(id, json!({}))),
        _ => Some(jsonrpc_error(
            id,
            -32601,
            &format!("Method not found: {method}"),
        )),
    }
}

// ── Main server loop ────────────────────────────────────────────────────

/// Run the MCP server, reading JSON-RPC messages from stdin and writing
/// responses to stdout.  Diagnostics go to stderr.
pub fn run() -> Result<()> {
    eprintln!("rivet mcp: starting MCP server (stdio transport)...");

    let stdin = io::stdin();
    let mut stdout = io::stdout();

    for line in stdin.lock().lines() {
        let line = line.context("reading stdin")?;
        let line = line.trim();
        if line.is_empty() {
            continue;
        }

        let msg: Value = match serde_json::from_str(line) {
            Ok(v) => v,
            Err(e) => {
                eprintln!("rivet mcp: invalid JSON: {e}");
                let err = jsonrpc_error(Value::Null, -32700, &format!("Parse error: {e}"));
                writeln!(stdout, "{}", serde_json::to_string(&err).unwrap())?;
                stdout.flush()?;
                continue;
            }
        };

        let method = msg.get("method").and_then(Value::as_str).unwrap_or("");
        let params = msg.get("params").cloned().unwrap_or(json!({}));
        let id = msg.get("id").cloned().unwrap_or(Value::Null);

        // Notifications have no id — we still process them but don't respond.
        let is_notification = !msg.as_object().is_some_and(|o| o.contains_key("id"));

        if is_notification {
            // Process the notification (side effects only).
            let _ = handle_request(method, &params, Value::Null);
            continue;
        }

        if let Some(response) = handle_request(method, &params, id.clone()) {
            let response_str = serde_json::to_string(&response).context("serializing response")?;
            writeln!(stdout, "{response_str}")?;
            stdout.flush()?;
        }
    }

    eprintln!("rivet mcp: stdin closed, shutting down.");
    Ok(())
}
