use std::collections::HashMap;
use std::path::PathBuf;
use std::sync::Arc;

use anyhow::{Context as _, Result};
use axum::Router;
use axum::extract::{Path, State};
use axum::response::IntoResponse;
use axum::routing::{get, post};
use tokio::sync::RwLock;

/// HTMX bundled inline — no CDN dependency, works offline.
const HTMX_JS: &str = include_str!("../../assets/htmx.min.js");

/// Mermaid bundled inline — no CDN dependency, works offline.
const MERMAID_JS: &str = include_str!("../../assets/mermaid.min.js");

/// Embedded WASM/JS assets for single-binary distribution.
/// Only available when built with `--features embed-wasm` and assets exist.
#[cfg(feature = "embed-wasm")]
mod embedded_wasm {
    pub const SPAR_JS: &str = include_str!("../../assets/wasm/js/spar_wasm.js");
    pub const CORE_WASM: &[u8] = include_bytes!("../../assets/wasm/js/spar_wasm.core.wasm");
    pub const CORE2_WASM: &[u8] = include_bytes!("../../assets/wasm/js/spar_wasm.core2.wasm");
    pub const CORE3_WASM: &[u8] = include_bytes!("../../assets/wasm/js/spar_wasm.core3.wasm");
}

use rivet_core::document::{DocumentStore, html_escape};
use rivet_core::links::LinkGraph;
use rivet_core::results::ResultStore;
use rivet_core::schema::Schema;
use rivet_core::store::Store;

// ── Repository context ──────────────────────────────────────────────────

/// Git repository status captured at load time.
pub(crate) struct GitInfo {
    pub(crate) branch: String,
    pub(crate) commit_short: String,
    pub(crate) is_dirty: bool,
    pub(crate) dirty_count: usize,
}

/// A discovered sibling project (example or peer).
pub(crate) struct SiblingProject {
    pub(crate) name: String,
    pub(crate) rel_path: String,
}

/// Project context shown in the dashboard header.
pub(crate) struct RepoContext {
    pub(crate) project_name: String,
    pub(crate) project_path: String,
    pub(crate) git: Option<GitInfo>,
    pub(crate) loaded_at: String,
    pub(crate) siblings: Vec<SiblingProject>,
    pub(crate) port: u16,
}

fn capture_git_info(project_path: &std::path::Path) -> Option<GitInfo> {
    let branch = std::process::Command::new("git")
        .args(["rev-parse", "--abbrev-ref", "HEAD"])
        .current_dir(project_path)
        .output()
        .ok()
        .filter(|o| o.status.success())
        .map(|o| String::from_utf8_lossy(&o.stdout).trim().to_string())?;

    let commit_short = std::process::Command::new("git")
        .args(["rev-parse", "--short", "HEAD"])
        .current_dir(project_path)
        .output()
        .ok()
        .filter(|o| o.status.success())
        .map(|o| String::from_utf8_lossy(&o.stdout).trim().to_string())
        .unwrap_or_default();

    let porcelain = std::process::Command::new("git")
        .args(["status", "--porcelain"])
        .current_dir(project_path)
        .output()
        .ok()
        .filter(|o| o.status.success())
        .map(|o| String::from_utf8_lossy(&o.stdout).to_string())
        .unwrap_or_default();

    let dirty_count = porcelain.lines().filter(|l| !l.is_empty()).count();

    Some(GitInfo {
        branch,
        commit_short,
        is_dirty: dirty_count > 0,
        dirty_count,
    })
}

/// Discover other rivet projects (examples/ and peer directories).
fn discover_siblings(project_path: &std::path::Path) -> Vec<SiblingProject> {
    let mut siblings = Vec::new();

    // Check examples/ subdirectory
    let examples_dir = project_path.join("examples");
    if examples_dir.is_dir() {
        if let Ok(entries) = std::fs::read_dir(&examples_dir) {
            for entry in entries.flatten() {
                let p = entry.path();
                if p.join("rivet.yaml").exists() {
                    if let Some(name) = p.file_name().and_then(|n| n.to_str()) {
                        siblings.push(SiblingProject {
                            name: name.to_string(),
                            rel_path: format!("examples/{name}"),
                        });
                    }
                }
            }
        }
    }

    // If inside examples/, offer root project and peers
    if let Some(parent) = project_path.parent() {
        if parent.file_name().and_then(|n| n.to_str()) == Some("examples") {
            if let Some(root) = parent.parent() {
                if root.join("rivet.yaml").exists() {
                    if let Ok(cfg) = std::fs::read_to_string(root.join("rivet.yaml")) {
                        let root_name = cfg
                            .lines()
                            .find(|l| l.trim().starts_with("name:"))
                            .map(|l| l.trim().trim_start_matches("name:").trim().to_string())
                            .unwrap_or_else(|| {
                                root.file_name()
                                    .and_then(|n| n.to_str())
                                    .unwrap_or("root")
                                    .to_string()
                            });
                        siblings.push(SiblingProject {
                            name: root_name,
                            rel_path: root.display().to_string(),
                        });
                    }
                }
                // Peer examples
                if let Ok(entries) = std::fs::read_dir(parent) {
                    for entry in entries.flatten() {
                        let p = entry.path();
                        if p != project_path && p.join("rivet.yaml").exists() {
                            if let Some(name) = p.file_name().and_then(|n| n.to_str()) {
                                siblings.push(SiblingProject {
                                    name: name.to_string(),
                                    rel_path: p.display().to_string(),
                                });
                            }
                        }
                    }
                }
            }
        }
    }

    siblings.sort_by(|a, b| a.name.cmp(&b.name));
    siblings
}

/// Metadata for a loaded external project, displayed on the dashboard.
pub(crate) struct ExternalInfo {
    pub(crate) prefix: String,
    /// Display source — git URL or local path.
    pub(crate) source: String,
    /// Whether the external has been synced (repo dir exists).
    pub(crate) synced: bool,
    /// Loaded artifacts (empty if not synced).
    pub(crate) store: Store,
}

/// Shared application state loaded once at startup.
pub(crate) struct AppState {
    pub(crate) store: Store,
    pub(crate) schema: Schema,
    pub(crate) graph: LinkGraph,
    pub(crate) doc_store: DocumentStore,
    pub(crate) result_store: ResultStore,
    pub(crate) context: RepoContext,
    /// Canonical path to the project directory (for reload).
    pub(crate) project_path_buf: PathBuf,
    /// Path to the schemas directory (for reload).
    pub(crate) schemas_dir: PathBuf,
    /// Resolved docs directories (for serving images/assets).
    pub(crate) doc_dirs: Vec<PathBuf>,
    /// External projects loaded at startup (empty if none configured).
    pub(crate) externals: Vec<ExternalInfo>,
}

/// Convenience alias so handler signatures stay compact.
pub(crate) type SharedState = Arc<RwLock<AppState>>;

/// Build a fresh `AppState` by loading everything from disk.
fn reload_state(
    project_path: &std::path::Path,
    schemas_dir: &std::path::Path,
    port: u16,
) -> Result<AppState> {
    let config_path = project_path.join("rivet.yaml");
    let config = rivet_core::load_project_config(&config_path)
        .with_context(|| format!("loading {}", config_path.display()))?;

    let schema = rivet_core::load_schemas(&config.project.schemas, schemas_dir)
        .context("loading schemas")?;

    let mut store = Store::new();
    for source in &config.sources {
        let artifacts = rivet_core::load_artifacts(source, project_path)
            .with_context(|| format!("loading source '{}'", source.path))?;
        for artifact in artifacts {
            store.upsert(artifact);
        }
    }

    let graph = LinkGraph::build(&store, &schema);

    let mut doc_store = DocumentStore::new();
    let mut doc_dirs = Vec::new();
    for docs_path in &config.docs {
        let dir = project_path.join(docs_path);
        if dir.is_dir() {
            doc_dirs.push(dir.clone());
        }
        let docs = rivet_core::document::load_documents(&dir)
            .with_context(|| format!("loading docs from '{docs_path}'"))?;
        for doc in docs {
            doc_store.insert(doc);
        }
    }

    let mut result_store = ResultStore::new();
    if let Some(ref results_path) = config.results {
        let dir = project_path.join(results_path);
        let runs = rivet_core::results::load_results(&dir)
            .with_context(|| format!("loading results from '{results_path}'"))?;
        for run in runs {
            result_store.insert(run);
        }
    }

    // ── Load external projects ────────────────────────────────────────
    let mut externals = Vec::new();
    if let Some(ref ext_map) = config.externals {
        let cache_dir = project_path.join(".rivet/repos");
        for ext in ext_map.values() {
            let source = ext
                .git
                .as_deref()
                .or(ext.path.as_deref())
                .unwrap_or("unknown")
                .to_string();
            let ext_dir =
                rivet_core::externals::resolve_external_dir(ext, &cache_dir, project_path);
            let synced = ext_dir.join("rivet.yaml").exists();
            let mut ext_store = Store::new();
            if synced {
                if let Ok(artifacts) = rivet_core::externals::load_external_project(&ext_dir) {
                    for a in artifacts {
                        ext_store.upsert(a);
                    }
                }
            }
            externals.push(ExternalInfo {
                prefix: ext.prefix.clone(),
                source,
                synced,
                store: ext_store,
            });
        }
    }

    let git = capture_git_info(project_path);
    let loaded_at = std::process::Command::new("date")
        .arg("+%H:%M:%S")
        .output()
        .ok()
        .filter(|o| o.status.success())
        .map(|o| String::from_utf8_lossy(&o.stdout).trim().to_string())
        .unwrap_or_else(|| "unknown".into());
    let siblings = discover_siblings(project_path);
    let project_name = config.project.name.clone();

    let context = RepoContext {
        project_name,
        project_path: project_path.display().to_string(),
        git,
        loaded_at,
        siblings,
        port,
    };

    Ok(AppState {
        store,
        schema,
        graph,
        doc_store,
        result_store,
        context,
        project_path_buf: project_path.to_path_buf(),
        schemas_dir: schemas_dir.to_path_buf(),
        doc_dirs,
        externals,
    })
}

/// Start the axum HTTP server on the given port.
#[allow(clippy::too_many_arguments)]
pub async fn run(
    store: Store,
    schema: Schema,
    graph: LinkGraph,
    doc_store: DocumentStore,
    result_store: ResultStore,
    project_name: String,
    project_path: PathBuf,
    schemas_dir: PathBuf,
    doc_dirs: Vec<PathBuf>,
    port: u16,
) -> Result<()> {
    let git = capture_git_info(&project_path);
    let loaded_at = std::process::Command::new("date")
        .arg("+%H:%M:%S")
        .output()
        .ok()
        .filter(|o| o.status.success())
        .map(|o| String::from_utf8_lossy(&o.stdout).trim().to_string())
        .unwrap_or_else(|| "unknown".into());
    let siblings = discover_siblings(&project_path);
    let context = RepoContext {
        project_name,
        project_path: project_path.display().to_string(),
        git,
        loaded_at,
        siblings,
        port,
    };

    let state: SharedState = Arc::new(RwLock::new(AppState {
        store,
        schema,
        graph,
        doc_store,
        result_store,
        context,
        project_path_buf: project_path,
        schemas_dir,
        doc_dirs,
        externals: Vec::new(),
    }));

    let app = Router::new()
        .route("/", get(views::index))
        .route("/artifacts", get(views::artifacts_list))
        .route("/artifacts/{id}", get(views::artifact_detail))
        .route("/artifacts/{id}/preview", get(views::artifact_preview))
        .route("/artifacts/{id}/graph", get(views::artifact_graph))
        .route("/validate", get(views::validate_view))
        .route("/matrix", get(views::matrix_view))
        .route("/matrix/cell", get(views::matrix_cell_detail))
        .route("/graph", get(views::graph_view))
        .route("/stats", get(views::stats_view))
        .route("/coverage", get(views::coverage_view))
        .route("/documents", get(views::documents_list))
        .route("/documents/{id}", get(views::document_detail))
        .route("/search", get(views::search_view))
        .route("/verification", get(views::verification_view))
        .route("/stpa", get(views::stpa_view))
        .route("/results", get(views::results_view))
        .route("/results/{run_id}", get(views::result_detail))
        .route("/source", get(views::source_tree_view))
        .route("/source/{*path}", get(views::source_file_view))
        .route("/source-raw/{*path}", get(source_raw))
        .route("/diff", get(views::diff_view))
        .route("/doc-linkage", get(views::doc_linkage_view))
        .route("/traceability", get(views::traceability_view))
        .route("/traceability/history", get(views::traceability_history))
        .route("/api/links/{id}", get(api_artifact_links))
        .route("/wasm/{*path}", get(wasm_asset))
        .route("/help", get(views::help_view))
        .route("/help/docs", get(views::help_docs_list))
        .route("/help/docs/{*slug}", get(views::help_docs_topic))
        .route("/help/schema", get(views::help_schema_list))
        .route("/help/schema/{name}", get(views::help_schema_show))
        .route("/help/links", get(views::help_links_view))
        .route("/help/rules", get(views::help_rules_view))
        .route("/externals", get(views::externals_list))
        .route("/externals/{prefix}", get(views::external_detail))
        .route("/docs-asset/{*path}", get(docs_asset))
        .route("/assets/htmx.js", get(htmx_asset))
        .route("/assets/mermaid.js", get(mermaid_asset))
        .route("/reload", post(reload_handler))
        .with_state(state.clone())
        .layer(axum::middleware::from_fn_with_state(state, wrap_full_page))
        .layer(axum::middleware::map_response(
            |mut response: axum::response::Response| async move {
                response.headers_mut().insert(
                    "Content-Security-Policy",
                    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'"
                        .parse()
                        .unwrap(),
                );
                response
            },
        ));

    let addr = format!("0.0.0.0:{port}");
    eprintln!("rivet dashboard listening on http://localhost:{port}");

    let listener = tokio::net::TcpListener::bind(&addr).await?;
    axum::serve(listener, app).await?;
    Ok(())
}

/// Middleware: for direct browser requests (no HX-Request header) to view routes,
/// wrap the handler's partial HTML in the full page layout. This replaces the old
/// `/?goto=` redirect pattern and fixes query-param loss, hash-fragment loss, and
/// the async replaceState race condition.
async fn wrap_full_page(
    State(state): State<SharedState>,
    req: axum::extract::Request,
    next: axum::middleware::Next,
) -> axum::response::Response {
    let path = req.uri().path().to_string();
    let query = req.uri().query().unwrap_or("").to_string();
    let is_htmx = req.headers().contains_key("hx-request");
    let is_print = query.contains("print=1");
    let method = req.method().clone();

    let response = next.run(req).await;

    // Only wrap GET requests to view routes (not /, assets, or APIs)
    if method == axum::http::Method::GET
        && !is_htmx
        && path != "/"
        && !path.starts_with("/api/")
        && !path.starts_with("/wasm/")
        && !path.starts_with("/source-raw/")
        && !path.starts_with("/docs-asset/")
    {
        let bytes = axum::body::to_bytes(response.into_body(), 16 * 1024 * 1024)
            .await
            .unwrap_or_default();
        let content = String::from_utf8_lossy(&bytes);
        let app = state.read().await;
        if is_print {
            return layout::print_layout(&content, &app).into_response();
        }
        return layout::page_layout(&content, &app).into_response();
    }

    response
}

/// GET /api/links/{id} — return JSON array of AADL-prefixed artifact IDs linked
/// to the given artifact (forward links, backlinks, and self if applicable).
async fn api_artifact_links(
    State(state): State<SharedState>,
    Path(id): Path<String>,
) -> axum::Json<Vec<String>> {
    let state = state.read().await;
    let graph = &state.graph;

    let mut linked_ids = Vec::new();

    // Forward links from this artifact
    for link in graph.links_from(&id) {
        if link.target.starts_with("AADL-") {
            linked_ids.push(link.target.clone());
        }
    }

    // Backlinks to this artifact
    for bl in graph.backlinks_to(&id) {
        if bl.source.starts_with("AADL-") {
            linked_ids.push(bl.source.clone());
        }
    }

    // If this IS an AADL artifact, include self
    if id.starts_with("AADL-") {
        linked_ids.push(id);
    }

    axum::Json(linked_ids)
}

/// GET /source-raw/{*path} — serve a project file as raw text (for WASM client-side rendering).
async fn source_raw(
    State(state): State<SharedState>,
    Path(raw_path): Path<String>,
) -> impl IntoResponse {
    let state = state.read().await;
    let project_path = &state.project_path_buf;
    let decoded = urlencoding::decode(&raw_path).unwrap_or(std::borrow::Cow::Borrowed(&raw_path));
    let rel_path = decoded.as_ref();

    let full_path = project_path.join(rel_path);
    let canonical = match full_path.canonicalize() {
        Ok(p) => p,
        Err(_) => {
            return (axum::http::StatusCode::NOT_FOUND, "not found").into_response();
        }
    };
    let canonical_project = match project_path.canonicalize() {
        Ok(p) => p,
        Err(_) => {
            return (axum::http::StatusCode::INTERNAL_SERVER_ERROR, "error").into_response();
        }
    };
    if !canonical.starts_with(&canonical_project) {
        return (axum::http::StatusCode::FORBIDDEN, "forbidden").into_response();
    }

    let metadata = match std::fs::symlink_metadata(&full_path) {
        Ok(m) => m,
        Err(_) => return (axum::http::StatusCode::NOT_FOUND, "not found").into_response(),
    };

    // Directory: return JSON listing of filenames.
    if metadata.is_dir() {
        let mut entries = Vec::new();
        if let Ok(dir) = std::fs::read_dir(&full_path) {
            for entry in dir.flatten() {
                if let Some(name) = entry.file_name().to_str() {
                    entries.push(name.to_string());
                }
            }
        }
        entries.sort();
        let json = serde_json::to_string(&entries).unwrap_or_else(|_| "[]".into());
        return (
            axum::http::StatusCode::OK,
            [(axum::http::header::CONTENT_TYPE, "application/json")],
            json,
        )
            .into_response();
    }

    match std::fs::read_to_string(&full_path) {
        Ok(content) => (
            axum::http::StatusCode::OK,
            [(
                axum::http::header::CONTENT_TYPE,
                "text/plain; charset=utf-8",
            )],
            content,
        )
            .into_response(),
        Err(_) => (axum::http::StatusCode::NOT_FOUND, "not found").into_response(),
    }
}

/// GET /assets/htmx.js — serve bundled HTMX (no CDN dependency).
async fn htmx_asset() -> impl IntoResponse {
    (
        axum::http::StatusCode::OK,
        [
            (axum::http::header::CONTENT_TYPE, "application/javascript"),
            (axum::http::header::CACHE_CONTROL, "public, max-age=86400"),
        ],
        HTMX_JS,
    )
}

/// GET /assets/mermaid.js — serve bundled Mermaid (no CDN dependency).
async fn mermaid_asset() -> impl IntoResponse {
    (
        axum::http::StatusCode::OK,
        [
            (axum::http::header::CONTENT_TYPE, "application/javascript"),
            (axum::http::header::CACHE_CONTROL, "public, max-age=86400"),
        ],
        MERMAID_JS,
    )
}

/// GET /wasm/{*path} — serve jco-transpiled WASM assets for browser-side rendering.
async fn wasm_asset(Path(path): Path<String>) -> impl IntoResponse {
    let content_type = if path.ends_with(".js") {
        "application/javascript"
    } else if path.ends_with(".wasm") {
        "application/wasm"
    } else if path.ends_with(".d.ts") {
        "application/typescript"
    } else {
        "application/octet-stream"
    };

    // Try embedded assets first (when built with embed-wasm feature).
    #[cfg(feature = "embed-wasm")]
    {
        let bytes: Option<&[u8]> = match path.as_str() {
            "spar_wasm.js" => Some(embedded_wasm::SPAR_JS.as_bytes()),
            "spar_wasm.core.wasm" => Some(embedded_wasm::CORE_WASM),
            "spar_wasm.core2.wasm" => Some(embedded_wasm::CORE2_WASM),
            "spar_wasm.core3.wasm" => Some(embedded_wasm::CORE3_WASM),
            _ => None,
        };
        if let Some(data) = bytes {
            return (
                axum::http::StatusCode::OK,
                [
                    (axum::http::header::CONTENT_TYPE, content_type),
                    (axum::http::header::CACHE_CONTROL, "public, max-age=86400"),
                ],
                data.to_vec(),
            )
                .into_response();
        }
    }

    // Fallback to filesystem (development mode).
    // Try the workspace assets dir first, then next to the binary.
    let candidates = [
        std::env::current_dir()
            .unwrap_or_default()
            .join("rivet-cli/assets/wasm/js")
            .join(&path),
        std::env::current_exe()
            .unwrap_or_default()
            .parent()
            .unwrap_or(std::path::Path::new("."))
            .join("assets/wasm/js")
            .join(&path),
    ];

    for candidate in &candidates {
        if let Ok(bytes) = std::fs::read(candidate) {
            return (
                axum::http::StatusCode::OK,
                [
                    (axum::http::header::CONTENT_TYPE, content_type),
                    (axum::http::header::CACHE_CONTROL, "no-cache"),
                ],
                bytes,
            )
                .into_response();
        }
    }

    (
        axum::http::StatusCode::NOT_FOUND,
        [(axum::http::header::CONTENT_TYPE, "text/plain")],
        format!("WASM asset not found: {path}").into_bytes(),
    )
        .into_response()
}

/// POST /reload — re-read the project from disk and replace the shared state.
///
/// Uses the `HX-Current-URL` header (sent automatically by HTMX) to redirect
/// back to the current page after reload, preserving the user's position.
async fn reload_handler(
    State(state): State<SharedState>,
    headers: axum::http::HeaderMap,
) -> impl IntoResponse {
    let (project_path, schemas_dir, port) = {
        let guard = state.read().await;
        (
            guard.project_path_buf.clone(),
            guard.schemas_dir.clone(),
            guard.context.port,
        )
    };

    match reload_state(&project_path, &schemas_dir, port) {
        Ok(new_state) => {
            let mut guard = state.write().await;
            *guard = new_state;

            // Redirect back to wherever the user was (HTMX sends HX-Current-URL).
            // Extract the path portion from the full URL (e.g. "http://localhost:3001/documents/DOC-001" → "/documents/DOC-001").
            // Navigate back to wherever the user was (HTMX sends HX-Current-URL).
            // HX-Location does a client-side HTMX navigation (fetch + swap + push-url).
            let redirect_url = headers
                .get("HX-Current-URL")
                .and_then(|v| v.to_str().ok())
                .and_then(|full_url| {
                    full_url
                        .find("://")
                        .and_then(|i| full_url[i + 3..].find('/'))
                        .map(|j| {
                            let start = full_url.find("://").unwrap() + 3 + j;
                            full_url[start..].to_owned()
                        })
                })
                .unwrap_or_else(|| "/".to_owned());

            let location_json = format!(
                "{{\"path\":\"{}\",\"target\":\"#content\"}}",
                redirect_url.replace('"', "\\\"")
            );

            (
                axum::http::StatusCode::OK,
                [("HX-Location", location_json)],
                "reloaded".to_owned(),
            )
        }
        Err(e) => {
            eprintln!("reload error: {e:#}");
            (
                axum::http::StatusCode::INTERNAL_SERVER_ERROR,
                [(
                    "HX-Location",
                    "{\"path\":\"/\",\"target\":\"#content\"}".to_owned(),
                )],
                format!("reload failed: {e}"),
            )
        }
    }
}

/// GET /docs-asset/{*path} — serve static files (images, SVG, etc.) from docs directories.
async fn docs_asset(
    State(state): State<SharedState>,
    Path(path): Path<String>,
) -> impl IntoResponse {
    let state = state.read().await;

    // Sanitize: reject path traversal
    if path.contains("..") {
        return (
            axum::http::StatusCode::BAD_REQUEST,
            [("Content-Type", "text/plain")],
            Vec::new(),
        );
    }

    // Search through all doc directories for the requested file
    for dir in &state.doc_dirs {
        let file_path = dir.join(&path);
        if file_path.is_file() {
            if let Ok(bytes) = std::fs::read(&file_path) {
                let content_type =
                    match file_path.extension().and_then(|e| e.to_str()).unwrap_or("") {
                        "png" => "image/png",
                        "jpg" | "jpeg" => "image/jpeg",
                        "gif" => "image/gif",
                        "svg" => "image/svg+xml",
                        "webp" => "image/webp",
                        "pdf" => "application/pdf",
                        _ => "application/octet-stream",
                    };
                return (
                    axum::http::StatusCode::OK,
                    [("Content-Type", content_type)],
                    bytes,
                );
            }
        }
    }

    (
        axum::http::StatusCode::NOT_FOUND,
        [("Content-Type", "text/plain")],
        b"not found".to_vec(),
    )
}

// ── Color palette ────────────────────────────────────────────────────────

pub(crate) fn type_color_map() -> HashMap<String, String> {
    let pairs: &[(&str, &str)] = &[
        // STPA
        ("loss", "#dc3545"),
        ("hazard", "#fd7e14"),
        ("system-constraint", "#20c997"),
        ("controller", "#6f42c1"),
        ("uca", "#e83e8c"),
        ("control-action", "#17a2b8"),
        ("feedback", "#6610f2"),
        ("causal-factor", "#d63384"),
        ("safety-constraint", "#20c997"),
        ("loss-scenario", "#e83e8c"),
        ("controller-constraint", "#20c997"),
        ("controlled-process", "#6610f2"),
        ("sub-hazard", "#fd7e14"),
        // ASPICE
        ("stakeholder-req", "#0d6efd"),
        ("system-req", "#0dcaf0"),
        ("system-architecture", "#198754"),
        ("sw-req", "#198754"),
        ("sw-architecture", "#0d6efd"),
        ("sw-detailed-design", "#6610f2"),
        ("sw-unit", "#6f42c1"),
        ("system-verification", "#6610f2"),
        ("sw-verification", "#6610f2"),
        ("system-integration-verification", "#6610f2"),
        ("sw-integration-verification", "#6610f2"),
        ("sw-unit-verification", "#6610f2"),
        ("qualification-verification", "#6610f2"),
        // Dev
        ("requirement", "#0d6efd"),
        ("design-decision", "#198754"),
        ("feature", "#6f42c1"),
        // STPA-Sec
        ("sec-loss", "#991b1b"),
        ("sec-hazard", "#b91c1c"),
        ("sec-constraint", "#15803d"),
        ("sec-uca", "#be123c"),
        ("sec-scenario", "#9a3412"),
        // Cybersecurity
        ("asset", "#ffc107"),
        ("threat", "#dc3545"),
        ("cybersecurity-req", "#fd7e14"),
        ("vulnerability", "#e83e8c"),
        ("attack-path", "#dc3545"),
        ("cybersecurity-goal", "#0d6efd"),
        ("cybersecurity-control", "#198754"),
        ("security-verification", "#6610f2"),
        ("risk-assessment", "#fd7e14"),
        ("security-event", "#e83e8c"),
    ];
    pairs
        .iter()
        .map(|(k, v)| (k.to_string(), v.to_string()))
        .collect()
}

/// Return a colored badge `<span>` for an artifact type.
///
/// Uses the `type_color_map` hex color as text and computes a 12%-opacity
/// tinted background from it.
pub(crate) fn badge_for_type(type_name: &str) -> String {
    let colors = type_color_map();
    let hex = colors
        .get(type_name)
        .map(|s| s.as_str())
        .unwrap_or("#5b2d9e");
    // Parse hex → rgb
    let hex_digits = hex.trim_start_matches('#');
    let r = u8::from_str_radix(&hex_digits[0..2], 16).unwrap_or(91);
    let g = u8::from_str_radix(&hex_digits[2..4], 16).unwrap_or(45);
    let b = u8::from_str_radix(&hex_digits[4..6], 16).unwrap_or(158);
    format!(
        "<span class=\"badge\" style=\"background:rgba({r},{g},{b},.12);color:{hex};font-family:var(--mono);font-size:.72rem\">{}</span>",
        html_escape(type_name)
    )
}

#[allow(dead_code)]
pub(crate) mod components;
pub(crate) mod js;
pub(crate) mod layout;
pub(crate) mod styles;
mod views;
