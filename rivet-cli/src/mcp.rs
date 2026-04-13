//! MCP (Model Context Protocol) server for Rivet.
//!
//! Uses the official `rmcp` crate for protocol handling over stdio.
//! This allows AI coding assistants (Claude Code, Cursor, etc.) to interact
//! with Rivet projects programmatically — validating artifacts, listing them,
//! and querying project statistics.

use std::collections::BTreeMap;
use std::path::{Path, PathBuf};
use std::sync::{Arc, RwLock};

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

use rmcp::handler::server::router::tool::ToolRouter;
use rmcp::handler::server::wrapper::Parameters;
use rmcp::model::*;
use rmcp::{
    ErrorData as McpError, ServerHandler, ServiceExt, schemars, tool, tool_handler, tool_router,
};

// ── Project loading ────────────────────────────────────────────────────

struct McpProject {
    store: Store,
    schema: rivet_core::schema::Schema,
    graph: LinkGraph,
}

fn load_project(project_dir: &Path) -> Result<McpProject> {
    let loaded = rivet_core::load_project_full(project_dir)
        .with_context(|| format!("loading project from {}", project_dir.display()))?;
    Ok(McpProject {
        store: loaded.store,
        schema: loaded.schema,
        graph: loaded.graph,
    })
}

// ── Parameter structs ──────────────────────────────────────────────────

#[derive(Debug, serde::Deserialize, schemars::JsonSchema)]
#[allow(dead_code)] // constructed by rmcp via deserialization
pub struct ValidateParams {}

#[derive(Debug, serde::Deserialize, schemars::JsonSchema)]
pub struct ListParams {
    #[schemars(description = "Filter by artifact type (e.g., 'requirement', 'hazard')")]
    pub type_filter: Option<String>,
    #[schemars(description = "Filter by status (e.g., 'draft', 'approved')")]
    pub status_filter: Option<String>,
}

#[derive(Debug, serde::Deserialize, schemars::JsonSchema)]
#[allow(dead_code)] // constructed by rmcp via deserialization
pub struct StatsParams {}

#[derive(Debug, serde::Deserialize, schemars::JsonSchema)]
pub struct GetParams {
    #[schemars(description = "Artifact ID to retrieve")]
    pub id: String,
}

#[derive(Debug, serde::Deserialize, schemars::JsonSchema)]
pub struct CoverageParams {
    #[schemars(description = "Filter by traceability rule name")]
    pub rule: Option<String>,
}

#[derive(Debug, serde::Deserialize, schemars::JsonSchema)]
pub struct SchemaParams {
    #[schemars(description = "Filter by artifact type name")]
    pub r#type: Option<String>,
}

#[derive(Debug, serde::Deserialize, schemars::JsonSchema)]
pub struct EmbedParams {
    #[schemars(description = "Embed query string (e.g., 'coverage:matrix', 'artifact:REQ-001')")]
    pub query: String,
}

#[derive(Debug, serde::Deserialize, schemars::JsonSchema)]
pub struct SnapshotCaptureParams {
    #[schemars(description = "Snapshot name (defaults to git commit short hash)")]
    pub name: Option<String>,
}

#[derive(Debug, serde::Deserialize, schemars::JsonSchema)]
pub struct AddParams {
    #[schemars(description = "Artifact type (e.g., 'requirement', 'feature')")]
    pub r#type: String,
    #[schemars(description = "Artifact title")]
    pub title: String,
    #[schemars(description = "Artifact status (e.g., 'draft')")]
    pub status: Option<String>,
    #[schemars(description = "Artifact description")]
    pub description: Option<String>,
    #[schemars(description = "Tags for the artifact")]
    pub tags: Option<Vec<String>>,
    #[schemars(description = "Typed links to other artifacts")]
    pub links: Option<Vec<LinkParam>>,
    #[schemars(description = "Domain-specific fields")]
    pub fields: Option<serde_json::Map<String, Value>>,
}

#[derive(Debug, serde::Deserialize, schemars::JsonSchema)]
pub struct LinkParam {
    pub r#type: String,
    pub target: String,
}

#[derive(Debug, serde::Deserialize, schemars::JsonSchema)]
pub struct ModifyParams {
    #[schemars(description = "Artifact ID to modify")]
    pub id: String,
    #[schemars(description = "New status value")]
    pub status: Option<String>,
    #[schemars(description = "New title")]
    pub title: Option<String>,
    #[schemars(description = "Tags to add")]
    pub add_tags: Option<Vec<String>>,
    #[schemars(description = "Tags to remove")]
    pub remove_tags: Option<Vec<String>>,
    #[schemars(description = "Fields to set as key=value pairs")]
    pub set_fields: Option<Vec<String>>,
}

#[derive(Debug, serde::Deserialize, schemars::JsonSchema)]
pub struct McpLinkParams {
    #[schemars(description = "Source artifact ID")]
    pub source: String,
    #[schemars(description = "Link type (e.g., 'satisfies', 'implements')")]
    pub link_type: String,
    #[schemars(description = "Target artifact ID")]
    pub target: String,
}

#[derive(Debug, serde::Deserialize, schemars::JsonSchema)]
pub struct RemoveParams {
    #[schemars(description = "Artifact ID to remove")]
    pub id: String,
    #[schemars(description = "Force removal even if other artifacts link to this one")]
    pub force: Option<bool>,
}

#[derive(Debug, serde::Deserialize, schemars::JsonSchema)]
pub struct QueryParams {
    #[schemars(
        description = "S-expression filter, e.g. '(and (= type \"requirement\") (has-tag \"stpa\"))'"
    )]
    pub filter: String,
    #[schemars(description = "Maximum number of results (default: 100)")]
    pub limit: Option<usize>,
}

// ── RivetServer ────────────────────────────────────────────────────────

#[derive(Clone)]
pub struct RivetServer {
    tool_router: ToolRouter<Self>,
    project_dir: Arc<PathBuf>,
    /// Cached project state — loaded once at startup, refreshed via rivet_reload.
    ///
    /// Lock ordering: read-only tools acquire read lock via `with_project()`.
    /// `rivet_reload` acquires write lock. Since rmcp serializes tool calls
    /// (one at a time over stdio), concurrent read+write cannot occur in
    /// normal operation. The RwLock is defensive for future multi-transport use.
    project: Arc<RwLock<McpProject>>,
}

impl RivetServer {
    fn dir(&self) -> &Path {
        &self.project_dir
    }

    fn err(msg: impl std::fmt::Display) -> McpError {
        McpError::new(
            rmcp::model::ErrorCode::INTERNAL_ERROR,
            msg.to_string(),
            None,
        )
    }

    /// Execute a closure with read access to the cached project.
    fn with_project<T>(&self, f: impl FnOnce(&McpProject) -> Result<T>) -> Result<T, McpError> {
        let guard = self
            .project
            .read()
            .map_err(|e| Self::err(format!("lock: {e}")))?;
        f(&guard).map_err(Self::err)
    }
}

#[tool_router]
impl RivetServer {
    pub fn new(project_dir: PathBuf) -> Result<Self> {
        let project = load_project(&project_dir)
            .map_err(|e| anyhow::anyhow!("failed to load project: {e}"))?;
        Ok(Self {
            tool_router: Self::tool_router(),
            project_dir: Arc::new(project_dir),
            project: Arc::new(RwLock::new(project)),
        })
    }

    /// Create a `RivetServer` from pre-loaded state (used by the dashboard's
    /// MCP-over-HTTP endpoint so we don't reload from disk).
    pub fn from_shared(
        project_dir: PathBuf,
        store: Store,
        schema: rivet_core::schema::Schema,
        graph: LinkGraph,
    ) -> Self {
        Self {
            tool_router: Self::tool_router(),
            project_dir: Arc::new(project_dir),
            project: Arc::new(RwLock::new(McpProject {
                store,
                schema,
                graph,
            })),
        }
    }

    #[tool(description = "Validate artifacts against schemas and return diagnostics")]
    fn rivet_validate(&self) -> Result<CallToolResult, McpError> {
        let result = self.with_project(|proj| Ok(tool_validate_cached(proj)))?;
        Ok(CallToolResult::success(vec![Content::text(
            serde_json::to_string_pretty(&result).unwrap_or_default(),
        )]))
    }

    #[tool(description = "List artifacts with optional type/status filters")]
    fn rivet_list(
        &self,
        Parameters(p): Parameters<ListParams>,
    ) -> Result<CallToolResult, McpError> {
        let result = self.with_project(|proj| {
            Ok(tool_list_cached(
                proj,
                p.type_filter.as_deref(),
                p.status_filter.as_deref(),
            ))
        })?;
        Ok(CallToolResult::success(vec![Content::text(
            serde_json::to_string_pretty(&result).unwrap_or_default(),
        )]))
    }

    #[tool(description = "Get artifact counts by type, orphan count, and broken links")]
    fn rivet_stats(&self) -> Result<CallToolResult, McpError> {
        let result = self.with_project(|proj| Ok(tool_stats_cached(proj)))?;
        Ok(CallToolResult::success(vec![Content::text(
            serde_json::to_string_pretty(&result).unwrap_or_default(),
        )]))
    }

    #[tool(description = "Get a single artifact by ID with all fields, links, and metadata")]
    fn rivet_get(&self, Parameters(p): Parameters<GetParams>) -> Result<CallToolResult, McpError> {
        let result = self.with_project(|proj| tool_get_cached(proj, &p.id))?;
        Ok(CallToolResult::success(vec![Content::text(
            serde_json::to_string_pretty(&result).unwrap_or_default(),
        )]))
    }

    #[tool(description = "Compute traceability coverage per rule")]
    fn rivet_coverage(
        &self,
        Parameters(p): Parameters<CoverageParams>,
    ) -> Result<CallToolResult, McpError> {
        let result = self.with_project(|proj| Ok(tool_coverage_cached(proj, p.rule.as_deref())))?;
        Ok(CallToolResult::success(vec![Content::text(
            serde_json::to_string_pretty(&result).unwrap_or_default(),
        )]))
    }

    #[tool(description = "Query schema: artifact types, link types, traceability rules")]
    fn rivet_schema(
        &self,
        Parameters(p): Parameters<SchemaParams>,
    ) -> Result<CallToolResult, McpError> {
        let result = self.with_project(|proj| Ok(tool_schema_cached(proj, p.r#type.as_deref())))?;
        Ok(CallToolResult::success(vec![Content::text(
            serde_json::to_string_pretty(&result).unwrap_or_default(),
        )]))
    }

    #[tool(description = "Resolve an embed query (coverage matrix, artifact details, etc.)")]
    fn rivet_embed(
        &self,
        Parameters(p): Parameters<EmbedParams>,
    ) -> Result<CallToolResult, McpError> {
        let result = self.with_project(|proj| tool_embed_cached(proj, &p.query))?;
        Ok(CallToolResult::success(vec![Content::text(
            serde_json::to_string_pretty(&result).unwrap_or_default(),
        )]))
    }

    #[tool(description = "Capture a validation snapshot for delta tracking")]
    fn rivet_snapshot_capture(
        &self,
        Parameters(p): Parameters<SnapshotCaptureParams>,
    ) -> Result<CallToolResult, McpError> {
        let result = tool_snapshot_capture(self.dir(), p.name.as_deref()).map_err(Self::err)?;
        Ok(CallToolResult::success(vec![Content::text(
            serde_json::to_string_pretty(&result).unwrap_or_default(),
        )]))
    }

    #[tool(
        description = "Add a new artifact to the project via CST mutation. Call rivet_reload after."
    )]
    fn rivet_add(&self, Parameters(p): Parameters<AddParams>) -> Result<CallToolResult, McpError> {
        let args = json!({
            "type": p.r#type,
            "title": p.title,
            "status": p.status,
            "description": p.description,
            "tags": p.tags.unwrap_or_default(),
            "links": p.links.unwrap_or_default().into_iter().map(|l| json!({"type": l.r#type, "target": l.target})).collect::<Vec<_>>(),
            "fields": p.fields.unwrap_or_default(),
        });
        let result = tool_add(self.dir(), &args).map_err(Self::err)?;
        Ok(CallToolResult::success(vec![Content::text(
            serde_json::to_string_pretty(&result).unwrap_or_default(),
        )]))
    }

    #[tool(
        description = "Query artifacts using an s-expression filter. Returns matching artifacts with full details."
    )]
    fn rivet_query(
        &self,
        Parameters(p): Parameters<QueryParams>,
    ) -> Result<CallToolResult, McpError> {
        let result = self.with_project(|proj| tool_query(proj, &p))?;
        Ok(CallToolResult::success(vec![Content::text(
            serde_json::to_string_pretty(&result).unwrap_or_default(),
        )]))
    }

    #[tool(
        description = "Modify an existing artifact (status, title, tags, fields). Call rivet_reload after."
    )]
    fn rivet_modify(
        &self,
        Parameters(p): Parameters<ModifyParams>,
    ) -> Result<CallToolResult, McpError> {
        let result = tool_modify(self.dir(), &p).map_err(Self::err)?;
        Ok(CallToolResult::success(vec![Content::text(
            serde_json::to_string_pretty(&result).unwrap_or_default(),
        )]))
    }

    #[tool(description = "Add a link between two artifacts. Call rivet_reload after.")]
    fn rivet_link(
        &self,
        Parameters(p): Parameters<McpLinkParams>,
    ) -> Result<CallToolResult, McpError> {
        let result =
            tool_link(self.dir(), &p.source, &p.link_type, &p.target).map_err(Self::err)?;
        Ok(CallToolResult::success(vec![Content::text(
            serde_json::to_string_pretty(&result).unwrap_or_default(),
        )]))
    }

    #[tool(description = "Remove a link between two artifacts. Call rivet_reload after.")]
    fn rivet_unlink(
        &self,
        Parameters(p): Parameters<McpLinkParams>,
    ) -> Result<CallToolResult, McpError> {
        let result =
            tool_unlink(self.dir(), &p.source, &p.link_type, &p.target).map_err(Self::err)?;
        Ok(CallToolResult::success(vec![Content::text(
            serde_json::to_string_pretty(&result).unwrap_or_default(),
        )]))
    }

    #[tool(description = "Remove an artifact from the project. Call rivet_reload after.")]
    fn rivet_remove(
        &self,
        Parameters(p): Parameters<RemoveParams>,
    ) -> Result<CallToolResult, McpError> {
        let result = tool_remove(self.dir(), &p.id, p.force.unwrap_or(false)).map_err(Self::err)?;
        Ok(CallToolResult::success(vec![Content::text(
            serde_json::to_string_pretty(&result).unwrap_or_default(),
        )]))
    }

    #[tool(description = "Reload project from disk after file changes")]
    fn rivet_reload(&self) -> Result<CallToolResult, McpError> {
        let new_proj = load_project(self.dir()).map_err(Self::err)?;
        let mut guard = self
            .project
            .write()
            .map_err(|e| Self::err(format!("lock: {e}")))?;
        *guard = new_proj;
        Ok(CallToolResult::success(vec![Content::text(
            json!({"reloaded": true}).to_string(),
        )]))
    }
}

#[tool_handler]
impl ServerHandler for RivetServer {
    fn get_info(&self) -> ServerInfo {
        ServerInfo::new(
            ServerCapabilities::builder()
                .enable_tools()
                .enable_resources()
                .build(),
        )
    }

    async fn list_resources(
        &self,
        _: Option<PaginatedRequestParams>,
        _: rmcp::service::RequestContext<rmcp::service::RoleServer>,
    ) -> std::result::Result<ListResourcesResult, McpError> {
        Ok(ListResourcesResult {
            resources: vec![
                RawResource::new("rivet://diagnostics", "diagnostics")
                    .with_description("Validation diagnostics as JSON")
                    .with_mime_type("application/json")
                    .no_annotation(),
                RawResource::new("rivet://coverage", "coverage")
                    .with_description("Traceability coverage report as JSON")
                    .with_mime_type("application/json")
                    .no_annotation(),
            ],
            next_cursor: None,
            meta: None,
        })
    }

    async fn read_resource(
        &self,
        request: ReadResourceRequestParams,
        _: rmcp::service::RequestContext<rmcp::service::RoleServer>,
    ) -> std::result::Result<ReadResourceResult, McpError> {
        let uri = request.uri.as_str();
        match uri {
            "rivet://diagnostics" => {
                let result = self.with_project(|p| Ok(tool_validate_cached(p)))?;
                Ok(ReadResourceResult::new(vec![ResourceContents::text(
                    serde_json::to_string_pretty(&result).unwrap_or_default(),
                    request.uri.clone(),
                )]))
            }
            "rivet://coverage" => {
                let result = self.with_project(|p| Ok(tool_coverage_cached(p, None)))?;
                Ok(ReadResourceResult::new(vec![ResourceContents::text(
                    serde_json::to_string_pretty(&result).unwrap_or_default(),
                    request.uri.clone(),
                )]))
            }
            _ if uri.starts_with("rivet://artifacts/") => {
                let id = &uri["rivet://artifacts/".len()..];
                let result = self.with_project(|p| tool_get_cached(p, id))?;
                Ok(ReadResourceResult::new(vec![ResourceContents::text(
                    serde_json::to_string_pretty(&result).unwrap_or_default(),
                    request.uri.clone(),
                )]))
            }
            _ => Err(McpError::new(
                rmcp::model::ErrorCode::INVALID_PARAMS,
                format!("unknown resource: {uri}"),
                None,
            )),
        }
    }
}

// ── Cached tool implementations (use pre-loaded McpProject) ─────────────

fn tool_validate_cached(proj: &McpProject) -> Value {
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
        .map(|d| json!({"severity": format!("{:?}", d.severity).to_lowercase(), "artifact_id": d.artifact_id, "message": d.message}))
        .collect();

    let result_str = if errors > 0 { "FAIL" } else { "PASS" };
    json!({"result": result_str, "errors": errors, "warnings": warnings, "infos": infos, "diagnostics": diag_json})
}

fn tool_list_cached(
    proj: &McpProject,
    type_filter: Option<&str>,
    status_filter: Option<&str>,
) -> Value {
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

    json!({"count": results.len(), "artifacts": artifacts_json})
}

fn tool_stats_cached(proj: &McpProject) -> Value {
    let orphans = proj.graph.orphans(&proj.store);

    let mut types = serde_json::Map::new();
    let mut type_names: Vec<&str> = proj.store.types().collect();
    type_names.sort();
    for t in &type_names {
        types.insert(t.to_string(), json!(proj.store.count_by_type(t)));
    }

    json!({"total": proj.store.len(), "types": types, "orphans": orphans, "broken_links": proj.graph.broken.len()})
}

fn tool_get_cached(proj: &McpProject, id: &str) -> Result<Value> {
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

fn tool_coverage_cached(proj: &McpProject, rule_filter: Option<&str>) -> Value {
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

    json!({"overall_percentage": (report.overall_coverage() * 100.0).round() / 100.0, "rules": rules_json})
}

fn tool_schema_cached(proj: &McpProject, type_filter: Option<&str>) -> Value {
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

    json!({"artifact_types": artifact_types_json, "link_types": link_types_json, "traceability_rules": rules_json})
}

fn tool_embed_cached(proj: &McpProject, query: &str) -> Result<Value> {
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
    let proj = load_project(project_dir)?; // disk-based (snapshot/add only)

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
    let proj = load_project(project_dir)?; // disk-based (snapshot/add only)

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
        provenance: None,
        source_file: None,
    };

    mutate::validate_add(&artifact, &proj.store, &proj.schema)
        .map_err(|e| anyhow::anyhow!("validation failed: {e}"))?;

    let file_path = mutate::find_file_for_type(artifact_type, &proj.store).ok_or_else(|| {
        anyhow::anyhow!(
            "no existing source file found for type '{}'; create one manually first",
            artifact_type
        )
    })?;

    let abs_path = if file_path.is_relative() {
        project_dir.join(&file_path)
    } else {
        file_path.clone()
    };

    mutate::append_artifact_to_file(&artifact, &abs_path)
        .map_err(|e| anyhow::anyhow!("failed to write artifact: {e}"))?;

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

// ── Query tool helper ─────────────────────────────────────────────────

fn tool_query(proj: &McpProject, params: &QueryParams) -> Result<Value> {
    let expr = rivet_core::sexpr_eval::parse_filter(&params.filter).map_err(|errs| {
        let msgs: Vec<String> = errs.iter().map(|e| e.to_string()).collect();
        anyhow::anyhow!("invalid filter: {}", msgs.join("; "))
    })?;

    let limit = params.limit.unwrap_or(100);
    let mut results: Vec<Value> = Vec::new();

    for artifact in proj.store.iter() {
        if !rivet_core::sexpr_eval::matches_filter_with_store(
            &expr,
            artifact,
            &proj.graph,
            &proj.store,
        ) {
            continue;
        }
        let links_json: Vec<Value> = artifact
            .links
            .iter()
            .map(|l| json!({"type": l.link_type, "target": l.target}))
            .collect();
        results.push(json!({
            "id": artifact.id,
            "type": artifact.artifact_type,
            "title": artifact.title,
            "status": artifact.status.as_deref().unwrap_or("-"),
            "tags": artifact.tags,
            "links": links_json,
            "description": artifact.description.as_deref().unwrap_or(""),
        }));
        if results.len() >= limit {
            break;
        }
    }

    Ok(json!({
        "filter": params.filter,
        "count": results.len(),
        "artifacts": results,
    }))
}

// ── Mutation tool helpers ──────────────────────────────────────────────

fn tool_modify(project_dir: &Path, p: &ModifyParams) -> Result<Value> {
    use rivet_core::mutate;

    let proj = load_project(project_dir)?;

    let set_fields: Vec<(String, String)> = p
        .set_fields
        .as_deref()
        .unwrap_or_default()
        .iter()
        .filter_map(|s| {
            let (k, v) = s.split_once('=')?;
            Some((k.to_string(), v.to_string()))
        })
        .collect();

    let params = mutate::ModifyParams {
        set_status: p.status.clone(),
        set_title: p.title.clone(),
        add_tags: p.add_tags.clone().unwrap_or_default(),
        remove_tags: p.remove_tags.clone().unwrap_or_default(),
        set_fields,
    };

    mutate::validate_modify(&p.id, &params, &proj.store, &proj.schema)?;

    let source_file = mutate::find_source_file(&p.id, &proj.store)
        .ok_or_else(|| anyhow::anyhow!("cannot find source file for '{}'", p.id))?;

    mutate::modify_artifact_in_file(&p.id, &params, &source_file, &proj.store)?;

    Ok(json!({ "modified": p.id, "file": source_file.display().to_string() }))
}

fn tool_link(project_dir: &Path, source: &str, link_type: &str, target: &str) -> Result<Value> {
    use rivet_core::model::Link;
    use rivet_core::mutate;

    let proj = load_project(project_dir)?;

    mutate::validate_link(source, link_type, target, &proj.store, &proj.schema)?;

    let source_file = mutate::find_source_file(source, &proj.store)
        .ok_or_else(|| anyhow::anyhow!("cannot find source file for '{source}'"))?;

    let link = Link {
        link_type: link_type.to_string(),
        target: target.to_string(),
    };

    mutate::add_link_to_file(source, &link, &source_file)?;

    Ok(
        json!({ "linked": format!("{source} --[{link_type}]--> {target}"), "file": source_file.display().to_string() }),
    )
}

fn tool_unlink(project_dir: &Path, source: &str, link_type: &str, target: &str) -> Result<Value> {
    use rivet_core::mutate;

    let proj = load_project(project_dir)?;

    mutate::validate_unlink(source, link_type, target, &proj.store)?;

    let source_file = mutate::find_source_file(source, &proj.store)
        .ok_or_else(|| anyhow::anyhow!("cannot find source file for '{source}'"))?;

    mutate::remove_link_from_file(source, link_type, target, &source_file)?;

    Ok(
        json!({ "unlinked": format!("{source} --[{link_type}]--> {target}"), "file": source_file.display().to_string() }),
    )
}

fn tool_remove(project_dir: &Path, id: &str, force: bool) -> Result<Value> {
    use rivet_core::mutate;

    let proj = load_project(project_dir)?;

    mutate::validate_remove(id, force, &proj.store, &proj.graph)?;

    let source_file = mutate::find_source_file(id, &proj.store)
        .ok_or_else(|| anyhow::anyhow!("cannot find source file for '{id}'"))?;

    mutate::remove_artifact_from_file(id, &source_file)?;

    Ok(json!({ "removed": id, "file": source_file.display().to_string() }))
}

// ── Entry point ────────────────────────────────────────────────────────

/// Run the MCP server using rmcp over stdio transport.
pub async fn run(project_dir: PathBuf) -> Result<()> {
    eprintln!("rivet mcp: starting MCP server (rmcp stdio transport)...");

    let server = RivetServer::new(project_dir)?;
    let service = server
        .serve(rmcp::transport::stdio())
        .await
        .context("starting MCP stdio transport")?;

    service.waiting().await?;

    eprintln!("rivet mcp: shutting down.");
    Ok(())
}
