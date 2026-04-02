//! MCP (Model Context Protocol) server for Rivet.
//!
//! Implements the MCP protocol over stdio using JSON-RPC 2.0.
//! This allows AI coding assistants (Claude Code, Cursor, etc.) to interact
//! with Rivet projects programmatically — validating artifacts, listing them,
//! and querying project statistics.

use std::collections::BTreeMap;
use std::io::{self, BufRead, Write};
use std::path::Path;

use anyhow::{Context, Result};
use serde_json::{Value, json};

use rivet_core::coverage;
use rivet_core::embed::{EmbedContext, EmbedRequest, resolve_embed};
use rivet_core::links::LinkGraph;
use rivet_core::model::{Artifact, Link};
use rivet_core::mutate;
use rivet_core::schema::Severity;
use rivet_core::snapshot;
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
        json!({
            "name": "rivet_get",
            "description": "Look up a single artifact by ID and return its full details: type, title, status, description, tags, links, and domain-specific fields.",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "project_dir": {
                        "type": "string",
                        "description": "Path to the project directory containing rivet.yaml. Defaults to the current working directory."
                    },
                    "id": {
                        "type": "string",
                        "description": "Artifact ID (e.g., 'REQ-001', 'DD-003')"
                    }
                },
                "required": ["id"]
            }
        }),
        json!({
            "name": "rivet_coverage",
            "description": "Compute traceability coverage for all rules (or a specific rule). Returns overall percentage and per-rule breakdown with uncovered artifact IDs.",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "project_dir": {
                        "type": "string",
                        "description": "Path to the project directory containing rivet.yaml. Defaults to the current working directory."
                    },
                    "rule": {
                        "type": "string",
                        "description": "Optional rule name filter — return only the matching rule"
                    }
                },
                "required": []
            }
        }),
        json!({
            "name": "rivet_schema",
            "description": "Introspect the project schema: artifact types (with fields and link-fields), link types, and traceability rules. Optionally filter to a single artifact type.",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "project_dir": {
                        "type": "string",
                        "description": "Path to the project directory containing rivet.yaml. Defaults to the current working directory."
                    },
                    "type": {
                        "type": "string",
                        "description": "Optional artifact type to inspect (e.g., 'requirement'). Omit to list all types."
                    }
                },
                "required": []
            }
        }),
        json!({
            "name": "rivet_embed",
            "description": "Resolve a computed embed query and return rendered HTML. Embeds provide dynamic views of project data (stats, coverage, diagnostics, matrix).",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "project_dir": {
                        "type": "string",
                        "description": "Path to the project directory containing rivet.yaml. Defaults to the current working directory."
                    },
                    "query": {
                        "type": "string",
                        "description": "Embed query string, e.g. 'stats:types', 'coverage', 'diagnostics'"
                    }
                },
                "required": ["query"]
            }
        }),
        json!({
            "name": "rivet_snapshot_capture",
            "description": "Capture a project snapshot (stats, coverage, diagnostics) tagged with git commit info. Writes a JSON file to the snapshots/ directory.",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "project_dir": {
                        "type": "string",
                        "description": "Path to the project directory containing rivet.yaml. Defaults to the current working directory."
                    },
                    "name": {
                        "type": "string",
                        "description": "Snapshot name (used as filename). Defaults to the short git commit hash."
                    }
                },
                "required": []
            }
        }),
        json!({
            "name": "rivet_add",
            "description": "Create a new artifact in the project. Validates against the schema before writing. Appends to the appropriate YAML source file.",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "project_dir": {
                        "type": "string",
                        "description": "Path to the project directory containing rivet.yaml. Defaults to the current working directory."
                    },
                    "type": {
                        "type": "string",
                        "description": "Artifact type (must match a type defined in the schema)"
                    },
                    "title": {
                        "type": "string",
                        "description": "Human-readable title for the artifact"
                    },
                    "status": {
                        "type": "string",
                        "description": "Lifecycle status (e.g., 'draft', 'approved')"
                    },
                    "description": {
                        "type": "string",
                        "description": "Detailed description (supports markdown)"
                    },
                    "tags": {
                        "type": "array",
                        "items": { "type": "string" },
                        "description": "Tags for categorization"
                    },
                    "links": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "type": { "type": "string" },
                                "target": { "type": "string" }
                            },
                            "required": ["type", "target"]
                        },
                        "description": "Typed links to other artifacts"
                    },
                    "fields": {
                        "type": "object",
                        "description": "Domain-specific fields (validated against schema)"
                    }
                },
                "required": ["type", "title"]
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

fn tool_get(project_dir: &Path, id: &str) -> Result<Value> {
    let proj = load_project(project_dir)?;
    let artifact = proj
        .store
        .get(id)
        .ok_or_else(|| anyhow::anyhow!("artifact '{}' not found", id))?;

    let links_json: Vec<Value> = artifact
        .links
        .iter()
        .map(|l| {
            json!({
                "type": l.link_type,
                "target": l.target,
            })
        })
        .collect();

    let fields_json: Value = artifact
        .fields
        .iter()
        .map(|(k, v)| {
            let val = match v {
                serde_yaml::Value::String(s) => Value::String(s.clone()),
                serde_yaml::Value::Number(n) => {
                    if let Some(i) = n.as_i64() {
                        json!(i)
                    } else if let Some(f) = n.as_f64() {
                        json!(f)
                    } else {
                        Value::String(n.to_string())
                    }
                }
                serde_yaml::Value::Bool(b) => Value::Bool(*b),
                other => Value::String(
                    serde_yaml::to_string(other)
                        .unwrap_or_default()
                        .trim()
                        .to_string(),
                ),
            };
            (k.clone(), val)
        })
        .collect::<serde_json::Map<String, Value>>()
        .into();

    Ok(json!({
        "id": artifact.id,
        "type": artifact.artifact_type,
        "title": artifact.title,
        "status": artifact.status.as_deref().unwrap_or("-"),
        "description": artifact.description.as_deref().unwrap_or(""),
        "tags": artifact.tags,
        "links": links_json,
        "fields": fields_json,
    }))
}

fn tool_coverage(project_dir: &Path, rule_filter: Option<&str>) -> Result<Value> {
    let proj = load_project(project_dir)?;
    let report = coverage::compute_coverage(&proj.store, &proj.schema, &proj.graph);

    let rules_json: Vec<Value> = report
        .entries
        .iter()
        .filter(|e| rule_filter.map(|f| e.rule_name == f).unwrap_or(true))
        .map(|e| {
            json!({
                "name": e.rule_name,
                "source_type": e.source_type,
                "covered": e.covered,
                "total": e.total,
                "percentage": (e.percentage() * 100.0).round() / 100.0,
                "uncovered_ids": e.uncovered_ids,
            })
        })
        .collect();

    Ok(json!({
        "overall_percentage": (report.overall_coverage() * 100.0).round() / 100.0,
        "rules": rules_json,
    }))
}

fn tool_schema(project_dir: &Path, type_filter: Option<&str>) -> Result<Value> {
    let proj = load_project(project_dir)?;

    // Artifact types
    let artifact_types_json: Vec<Value> = proj
        .schema
        .artifact_types
        .values()
        .filter(|at| type_filter.map(|f| at.name == f).unwrap_or(true))
        .map(|at| {
            let fields: Vec<Value> = at
                .fields
                .iter()
                .map(|f| {
                    json!({
                        "name": f.name,
                        "type": f.field_type,
                        "required": f.required,
                        "description": f.description,
                        "allowed_values": f.allowed_values,
                    })
                })
                .collect();

            let link_fields: Vec<Value> = at
                .link_fields
                .iter()
                .map(|lf| {
                    json!({
                        "name": lf.name,
                        "link_type": lf.link_type,
                        "target_types": lf.target_types,
                        "required": lf.required,
                    })
                })
                .collect();

            json!({
                "name": at.name,
                "description": at.description,
                "fields": fields,
                "link_fields": link_fields,
            })
        })
        .collect();

    // Link types
    let link_types_json: Vec<Value> = proj
        .schema
        .link_types
        .values()
        .map(|lt| {
            json!({
                "name": lt.name,
                "inverse": lt.inverse,
                "description": lt.description,
                "source_types": lt.source_types,
                "target_types": lt.target_types,
            })
        })
        .collect();

    // Traceability rules
    let rules_json: Vec<Value> = proj
        .schema
        .traceability_rules
        .iter()
        .map(|r| {
            json!({
                "name": r.name,
                "description": r.description,
                "source_type": r.source_type,
                "required_link": r.required_link,
                "required_backlink": r.required_backlink,
                "target_types": r.target_types,
                "from_types": r.from_types,
            })
        })
        .collect();

    Ok(json!({
        "artifact_types": artifact_types_json,
        "link_types": link_types_json,
        "traceability_rules": rules_json,
    }))
}

fn tool_embed(project_dir: &Path, query: &str) -> Result<Value> {
    let proj = load_project(project_dir)?;
    let diagnostics = validate::validate(&proj.store, &proj.schema, &proj.graph);

    let request =
        EmbedRequest::parse(query).map_err(|e| anyhow::anyhow!("embed parse error: {e}"))?;

    let ctx = EmbedContext {
        store: &proj.store,
        schema: &proj.schema,
        graph: &proj.graph,
        diagnostics: &diagnostics,
        baseline: None,
    };

    let html = resolve_embed(&request, &ctx)
        .map_err(|e| anyhow::anyhow!("embed resolution error: {e}"))?;

    Ok(json!({
        "html": html,
    }))
}

fn tool_snapshot_capture(project_dir: &Path, name: Option<&str>) -> Result<Value> {
    let proj = load_project(project_dir)?;

    // Detect git info
    let git_commit = std::process::Command::new("git")
        .args(["rev-parse", "HEAD"])
        .current_dir(project_dir)
        .output()
        .ok()
        .and_then(|o| {
            if o.status.success() {
                Some(String::from_utf8_lossy(&o.stdout).trim().to_string())
            } else {
                None
            }
        })
        .unwrap_or_else(|| "unknown".to_string());

    let git_commit_short = std::process::Command::new("git")
        .args(["rev-parse", "--short", "HEAD"])
        .current_dir(project_dir)
        .output()
        .ok()
        .and_then(|o| {
            if o.status.success() {
                Some(String::from_utf8_lossy(&o.stdout).trim().to_string())
            } else {
                None
            }
        })
        .unwrap_or_else(|| "unknown".to_string());

    let git_dirty = std::process::Command::new("git")
        .args(["status", "--porcelain"])
        .current_dir(project_dir)
        .output()
        .ok()
        .map(|o| !o.stdout.is_empty())
        .unwrap_or(false);

    let git_ctx = snapshot::GitContext {
        commit: git_commit.clone(),
        commit_short: git_commit_short.clone(),
        tag: None,
        dirty: git_dirty,
    };

    let snap = snapshot::capture(&proj.store, &proj.schema, &proj.graph, &git_ctx);

    let snapshot_name = name.unwrap_or(&git_commit_short);
    let snapshot_path = project_dir
        .join("snapshots")
        .join(format!("{snapshot_name}.json"));

    snapshot::write_to_file(&snap, &snapshot_path).map_err(|e| anyhow::anyhow!("{e}"))?;

    Ok(json!({
        "path": snapshot_path.display().to_string(),
        "name": snapshot_name,
        "git_commit": git_commit_short,
        "git_dirty": git_dirty,
        "stats_total": snap.stats.total,
        "coverage_overall": (snap.coverage.overall * 100.0).round() / 100.0,
        "diagnostics_errors": snap.diagnostics.errors,
        "diagnostics_warnings": snap.diagnostics.warnings,
    }))
}

fn tool_add(project_dir: &Path, arguments: &Value) -> Result<Value> {
    let proj = load_project(project_dir)?;

    let artifact_type = arguments
        .get("type")
        .and_then(Value::as_str)
        .ok_or_else(|| anyhow::anyhow!("missing required field 'type'"))?;
    let title = arguments
        .get("title")
        .and_then(Value::as_str)
        .ok_or_else(|| anyhow::anyhow!("missing required field 'title'"))?;
    let status = arguments.get("status").and_then(Value::as_str);
    let description = arguments.get("description").and_then(Value::as_str);

    // Parse tags
    let tags: Vec<String> = arguments
        .get("tags")
        .and_then(Value::as_array)
        .map(|arr| {
            arr.iter()
                .filter_map(Value::as_str)
                .map(String::from)
                .collect()
        })
        .unwrap_or_default();

    // Parse links
    let links: Vec<Link> = arguments
        .get("links")
        .and_then(Value::as_array)
        .map(|arr| {
            arr.iter()
                .filter_map(|v| {
                    let lt = v.get("type").and_then(Value::as_str)?;
                    let target = v.get("target").and_then(Value::as_str)?;
                    Some(Link {
                        link_type: lt.to_string(),
                        target: target.to_string(),
                    })
                })
                .collect()
        })
        .unwrap_or_default();

    // Parse domain-specific fields
    let fields: BTreeMap<String, serde_yaml::Value> = arguments
        .get("fields")
        .and_then(Value::as_object)
        .map(|obj| {
            obj.iter()
                .map(|(k, v)| {
                    let yaml_val = json_to_yaml_value(v);
                    (k.clone(), yaml_val)
                })
                .collect()
        })
        .unwrap_or_default();

    // Generate next ID
    let prefix = mutate::prefix_for_type(artifact_type, &proj.store);
    let id = mutate::next_id(&proj.store, &prefix);

    let artifact = Artifact {
        id: id.clone(),
        artifact_type: artifact_type.to_string(),
        title: title.to_string(),
        description: description.map(String::from),
        status: status.map(String::from),
        tags,
        links,
        fields,
        source_file: None,
    };

    // Validate before writing
    mutate::validate_add(&artifact, &proj.store, &proj.schema)
        .map_err(|e| anyhow::anyhow!("validation failed: {e}"))?;

    // Find destination file
    let file_path = mutate::find_file_for_type(artifact_type, &proj.store).ok_or_else(|| {
        anyhow::anyhow!(
            "no existing source file found for type '{}'; create one manually first",
            artifact_type
        )
    })?;

    // Make file_path absolute relative to project_dir
    let abs_path = if file_path.is_relative() {
        project_dir.join(&file_path)
    } else {
        file_path.clone()
    };

    mutate::append_artifact_to_file(&artifact, &abs_path)
        .map_err(|e| anyhow::anyhow!("failed to write artifact: {e}"))?;

    // Return the created artifact
    let links_json: Vec<Value> = artifact
        .links
        .iter()
        .map(|l| json!({"type": l.link_type, "target": l.target}))
        .collect();

    Ok(json!({
        "id": artifact.id,
        "type": artifact.artifact_type,
        "title": artifact.title,
        "status": artifact.status.as_deref().unwrap_or("-"),
        "description": artifact.description.as_deref().unwrap_or(""),
        "tags": artifact.tags,
        "links": links_json,
        "file": abs_path.display().to_string(),
    }))
}

/// Convert a serde_json::Value to serde_yaml::Value.
fn json_to_yaml_value(v: &Value) -> serde_yaml::Value {
    match v {
        Value::Null => serde_yaml::Value::Null,
        Value::Bool(b) => serde_yaml::Value::Bool(*b),
        Value::Number(n) => {
            if let Some(i) = n.as_i64() {
                serde_yaml::Value::Number(serde_yaml::Number::from(i))
            } else if let Some(f) = n.as_f64() {
                serde_yaml::Value::Number(serde_yaml::Number::from(f))
            } else {
                serde_yaml::Value::String(n.to_string())
            }
        }
        Value::String(s) => serde_yaml::Value::String(s.clone()),
        Value::Array(arr) => {
            serde_yaml::Value::Sequence(arr.iter().map(json_to_yaml_value).collect())
        }
        Value::Object(obj) => {
            let map: serde_yaml::Mapping = obj
                .iter()
                .map(|(k, v)| (serde_yaml::Value::String(k.clone()), json_to_yaml_value(v)))
                .collect();
            serde_yaml::Value::Mapping(map)
        }
    }
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
        "rivet_get" => {
            let id = arguments.get("id").and_then(Value::as_str).unwrap_or("");
            tool_get(&project_dir, id)
        }
        "rivet_coverage" => {
            let rule = arguments.get("rule").and_then(Value::as_str);
            tool_coverage(&project_dir, rule)
        }
        "rivet_schema" => {
            let type_filter = arguments.get("type").and_then(Value::as_str);
            tool_schema(&project_dir, type_filter)
        }
        "rivet_embed" => {
            let query = arguments.get("query").and_then(Value::as_str).unwrap_or("");
            tool_embed(&project_dir, query)
        }
        "rivet_snapshot_capture" => {
            let name = arguments.get("name").and_then(Value::as_str);
            tool_snapshot_capture(&project_dir, name)
        }
        "rivet_add" => tool_add(&project_dir, arguments),
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
