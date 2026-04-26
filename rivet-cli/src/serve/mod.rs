// SAFETY-REVIEW (SCRC Phase 1, DD-058): File-scope blanket allow for
// the v0.4.3 clippy restriction-lint escalation. These lints are
// enabled at workspace scope at `warn` so new violations surface in
// CI; the existing call sites here are grandfathered in via this
// file-level allow until Phase 2 (per-site #[allow(...)] + rewrite).
// Rationale per lint class:
//   * unwrap_used / expect_used: legacy sites — many are on parser
//     post-conditions, BTreeMap lookups by key just inserted, or
//     regex::new on literals. Safe to keep; will migrate to ? with
//     typed errors in Phase 2 where user-facing.
//   * indexing_slicing / arithmetic_side_effects: tight math in
//     CST offsets, layout coordinates, and counted-loop indices that
//     is reviewed but not rewritten to checked_* for readability.
//   * as_conversions / cast_possible_truncation / cast_sign_loss:
//     usize<->u32/u64 in offsets where the value range is bounded by
//     input size (bytes of a loaded YAML file).
//   * wildcard_enum_match_arm / match_wildcard_for_single_variants:
//     tolerant parsers intentionally catch-all on token kinds.
//   * panic: only reached on programmer-error invariants.
//   * print_stdout / print_stderr: rivet-cli binary I/O.
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

use std::path::PathBuf;
use std::sync::{Arc, Mutex};

use anyhow::{Context as _, Result};
use axum::Router;
use axum::extract::{Path, State};
use axum::response::IntoResponse;
use axum::routing::{get, post};
use tokio::sync::RwLock;
use tower_http::cors::CorsLayer;

use crate::mcp::RivetServer;
use rmcp::transport::streamable_http_server::{
    StreamableHttpServerConfig, StreamableHttpService, session::local::LocalSessionManager,
};

/// HTMX bundled inline — no CDN dependency, works offline.
const HTMX_JS: &str = include_str!("../../assets/htmx.min.js");

/// Mermaid bundled inline — no CDN dependency, works offline.
const MERMAID_JS: &str = include_str!("../../assets/mermaid.min.js");

/// Embedded WASM/JS assets for single-binary distribution.
/// build.rs generates stub files when spar WASM is not built, so these
/// always compile. The JS runtime detects stubs via a HEAD probe.
mod embedded_wasm {
    pub const SPAR_JS: &str = include_str!("../../assets/wasm/js/spar_wasm.js");
    pub const CORE_WASM: &[u8] = include_bytes!("../../assets/wasm/js/spar_wasm.core.wasm");
    pub const CORE2_WASM: &[u8] = include_bytes!("../../assets/wasm/js/spar_wasm.core2.wasm");
    pub const CORE3_WASM: &[u8] = include_bytes!("../../assets/wasm/js/spar_wasm.core3.wasm");
}

use rivet_core::db::{RivetDatabase, SchemaInputSet, SourceFileSet};
use rivet_core::document::DocumentStore;
use rivet_core::links::LinkGraph;
use rivet_core::model::ProjectConfig;
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

pub(crate) fn capture_git_info(project_path: &std::path::Path) -> Option<GitInfo> {
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

/// Salsa incremental computation state, kept in a `Mutex` because
/// `RivetDatabase` is `!Sync` (it uses thread-local caches internally).
///
/// The `Mutex` is only locked during reload operations. Read-only page
/// handlers never touch it — they use the pre-computed fields in `AppState`.
pub(crate) struct SalsaState {
    pub(crate) db: RivetDatabase,
    pub(crate) source_set: SourceFileSet,
    pub(crate) schema_set: SchemaInputSet,
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
    /// Cached validation diagnostics — computed once at load/reload time
    /// instead of on every page request.
    pub(crate) cached_diagnostics: Vec<rivet_core::validate::Diagnostic>,
    /// Server start time for uptime calculation.
    pub(crate) started_at: std::time::Instant,
    /// Salsa incremental computation state (behind Mutex for thread safety).
    pub(crate) salsa: Mutex<SalsaState>,
    /// Project configuration (needed for incremental reload).
    pub(crate) config: ProjectConfig,
    /// Variant/feature-model data discovered from disk (may be empty).
    pub(crate) variants: variant::ProjectVariants,
}

impl AppState {
    /// Build a [`crate::render::RenderContext`] borrowing from this state.
    pub(crate) fn as_render_context(&self) -> crate::render::RenderContext<'_> {
        crate::render::RenderContext {
            store: &self.store,
            schema: &self.schema,
            graph: &self.graph,
            doc_store: &self.doc_store,
            result_store: &self.result_store,
            diagnostics: &self.cached_diagnostics,
            context: &self.context,
            externals: &self.externals,
            project_path: &self.project_path_buf,
            schemas_dir: &self.schemas_dir,
            baseline: None,
        }
    }

    /// Build a scoped `VariantScope` for the given variant name.
    ///
    /// Returns `Ok(Some(scope))` when scoping succeeded,
    /// `Ok(None)` when the project has no feature model configured, and
    /// `Err(msg)` when the variant name is unknown or the solver fails.
    ///
    /// The returned `VariantScope` owns a filtered `Store` + `LinkGraph`
    /// so that callers can then borrow them via
    /// [`VariantScope::render_context`] for the duration of a render.
    pub(crate) fn build_variant_scope(
        &self,
        variant_name: &str,
    ) -> Result<Option<VariantScope>, String> {
        if !self.variants.has_model() {
            return Ok(None);
        }
        let scope = self.variants.resolve(variant_name)?;

        // Build a filtered store that contains only the bound artifacts.
        let mut scoped_store = rivet_core::store::Store::new();
        for id in &scope.artifact_ids {
            if let Some(a) = self.store.get(id) {
                scoped_store.upsert(a.clone());
            }
        }
        let scoped_graph = rivet_core::links::LinkGraph::build(&scoped_store, &self.schema);

        // Filter cached diagnostics to only those referring to in-scope artifacts.
        let scoped_diags: Vec<rivet_core::validate::Diagnostic> = self
            .cached_diagnostics
            .iter()
            .filter(|d| {
                d.artifact_id
                    .as_ref()
                    .map(|id| scoped_store.contains(id))
                    .unwrap_or(false)
            })
            .cloned()
            .collect();

        Ok(Some(VariantScope {
            name: variant_name.to_string(),
            feature_count: scope.resolved.effective_features.len(),
            artifact_count: scoped_store.len(),
            store: scoped_store,
            graph: scoped_graph,
            diagnostics: scoped_diags,
        }))
    }
}

/// A variant-scoped view over the project's store + graph + diagnostics.
///
/// Owns its filtered collections so callers can hold a `RenderContext`
/// borrowing from it for the duration of a render call.
pub(crate) struct VariantScope {
    pub(crate) name: String,
    pub(crate) feature_count: usize,
    pub(crate) artifact_count: usize,
    pub(crate) store: rivet_core::store::Store,
    pub(crate) graph: rivet_core::links::LinkGraph,
    pub(crate) diagnostics: Vec<rivet_core::validate::Diagnostic>,
}

impl VariantScope {
    /// Borrow this scope as a `RenderContext`, using the passed-in
    /// `AppState` only for fields that are variant-independent (docs,
    /// results, externals, project context).
    pub(crate) fn render_context<'a>(
        &'a self,
        state: &'a AppState,
    ) -> crate::render::RenderContext<'a> {
        crate::render::RenderContext {
            store: &self.store,
            schema: &state.schema,
            graph: &self.graph,
            doc_store: &state.doc_store,
            result_store: &state.result_store,
            diagnostics: &self.diagnostics,
            context: &state.context,
            externals: &state.externals,
            project_path: &state.project_path_buf,
            schemas_dir: &state.schemas_dir,
            baseline: None,
        }
    }
}

/// Convenience alias so handler signatures stay compact.
pub(crate) type SharedState = Arc<RwLock<AppState>>;

/// Recursively collect YAML files from a path into (path_string, content) pairs.
fn collect_yaml_files(path: &std::path::Path, out: &mut Vec<(String, String)>) -> Result<()> {
    if path.is_file() {
        let content =
            std::fs::read_to_string(path).with_context(|| format!("reading {}", path.display()))?;
        out.push((path.display().to_string(), content));
    } else if path.is_dir() {
        let entries = std::fs::read_dir(path)
            .with_context(|| format!("reading directory {}", path.display()))?;
        for entry in entries {
            let entry = entry?;
            let p = entry.path();
            if p.is_dir() {
                collect_yaml_files(&p, out)?;
            } else if p
                .extension()
                .is_some_and(|ext| ext == "yaml" || ext == "yml")
            {
                let content = std::fs::read_to_string(&p)
                    .with_context(|| format!("reading {}", p.display()))?;
                out.push((p.display().to_string(), content));
            }
        }
    }
    Ok(())
}

/// Collect schema content from disk (with embedded fallback), suitable for salsa.
fn collect_schema_contents(
    schema_names: &[String],
    schemas_dir: &std::path::Path,
) -> Vec<(String, String)> {
    rivet_core::embedded::load_schema_contents(schema_names, schemas_dir)
}

/// Load external projects.
fn load_externals(config: &ProjectConfig, project_path: &std::path::Path) -> Vec<ExternalInfo> {
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
    externals
}

/// Load documents and results from config, returning (doc_store, result_store, doc_dirs).
fn load_docs_and_results(
    config: &ProjectConfig,
    project_path: &std::path::Path,
) -> Result<(DocumentStore, ResultStore, Vec<PathBuf>)> {
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

    Ok((doc_store, result_store, doc_dirs))
}

/// Build a fresh `AppState` by loading everything from disk.
///
/// Initializes a salsa `RivetDatabase` for incremental recomputation on
/// subsequent reloads. The initial load populates both salsa inputs and
/// the cached output fields (store, schema, graph, diagnostics).
pub(crate) fn reload_state(
    project_path: &std::path::Path,
    schemas_dir: &std::path::Path,
    port: u16,
) -> Result<AppState> {
    let config_path = project_path.join("rivet.yaml");
    let config = rivet_core::load_project_config(&config_path)
        .with_context(|| format!("loading {}", config_path.display()))?;

    // ── Initialize salsa database ────────────────────────────────────
    let db = RivetDatabase::new();

    // Load schema content into salsa inputs
    let schema_contents = collect_schema_contents(&config.project.schemas, schemas_dir);
    let schema_refs: Vec<(&str, &str)> = schema_contents
        .iter()
        .map(|(n, c)| (n.as_str(), c.as_str()))
        .collect();
    let schema_set = db.load_schemas(&schema_refs);

    // Collect source file content into salsa inputs
    let mut source_contents: Vec<(String, String)> = Vec::new();
    for source in &config.sources {
        let source_path = project_path.join(&source.path);
        collect_yaml_files(&source_path, &mut source_contents)
            .with_context(|| format!("reading source '{}'", source.path))?;
    }
    let source_refs: Vec<(&str, &str)> = source_contents
        .iter()
        .map(|(p, c)| (p.as_str(), c.as_str()))
        .collect();
    let source_set = db.load_sources(&source_refs);

    // ── Compute outputs from salsa ───────────────────────────────────
    let store = db.store(source_set, schema_set);
    let schema = db.schema(schema_set);
    let graph = LinkGraph::build(&store, &schema);
    let cached_diagnostics = db.diagnostics(source_set, schema_set);

    // ── Load non-salsa state (docs, results, externals) ──────────────
    let (doc_store, result_store, doc_dirs) = load_docs_and_results(&config, project_path)?;
    let externals = load_externals(&config, project_path);
    let variants = variant::ProjectVariants::discover(project_path, &config);

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
        cached_diagnostics,
        started_at: std::time::Instant::now(),
        salsa: Mutex::new(SalsaState {
            db,
            source_set,
            schema_set,
        }),
        config,
        variants,
    })
}

/// Incrementally update `AppState` by re-reading source files and letting
/// salsa recompute only what changed.
///
/// Instead of rebuilding everything from scratch, this reads the current
/// file contents from disk and feeds them into the existing salsa database.
/// Salsa's content-equality check means that files whose content hasn't
/// changed will not trigger any downstream recomputation.
///
/// Documents, results, and externals are still reloaded fully (they are
/// cheap and not yet salsa-tracked).
fn reload_state_incremental(state: &mut AppState) -> Result<()> {
    let t_start = std::time::Instant::now();

    let project_path = state.project_path_buf.clone();
    let schemas_dir = state.schemas_dir.clone();

    // Re-read the project config (it may have changed)
    let config_path = project_path.join("rivet.yaml");
    let config = rivet_core::load_project_config(&config_path)
        .with_context(|| format!("loading {}", config_path.display()))?;

    // Lock the salsa state for incremental updates
    let mut salsa = match state.salsa.lock() {
        Ok(guard) => guard,
        Err(poisoned) => {
            log::warn!("salsa mutex was poisoned, recovering");
            poisoned.into_inner()
        }
    };

    // ── Update schema inputs ─────────────────────────────────────────
    // Re-read schema content; salsa will detect if anything actually changed.
    let schema_contents = collect_schema_contents(&config.project.schemas, &schemas_dir);
    let schema_refs: Vec<(&str, &str)> = schema_contents
        .iter()
        .map(|(n, c)| (n.as_str(), c.as_str()))
        .collect();
    // Replace the schema set entirely (schemas change rarely; this is cheap)
    salsa.schema_set = salsa.db.load_schemas(&schema_refs);

    // ── Update source file inputs ────────────────────────────────────
    // Re-read all source files from disk.
    let mut source_contents: Vec<(String, String)> = Vec::new();
    for source in &config.sources {
        let source_path = project_path.join(&source.path);
        collect_yaml_files(&source_path, &mut source_contents)
            .with_context(|| format!("reading source '{}'", source.path))?;
    }

    // Update existing source files and track which paths we've seen.
    let mut updated_paths: std::collections::HashSet<String> = std::collections::HashSet::new();
    for (path, content) in &source_contents {
        updated_paths.insert(path.clone());
        // Copy the handle before the mutable borrow on db
        let ss = salsa.source_set;
        if !salsa.db.update_source(ss, path, content.clone()) {
            // New file — add it to the source set
            let ss = salsa.source_set;
            salsa.source_set = salsa.db.add_source(ss, path, content.clone());
        }
    }

    // Handle deleted files: rebuild the source set without paths that no longer exist.
    let current_files = salsa.source_set.files(&salsa.db);
    let removed: Vec<String> = current_files
        .iter()
        .filter(|sf| !updated_paths.contains(&sf.path(&salsa.db)))
        .map(|sf| sf.path(&salsa.db))
        .collect();
    if !removed.is_empty() {
        // Rebuild source set without deleted files by re-loading from current contents.
        let source_refs: Vec<(&str, &str)> = source_contents
            .iter()
            .map(|(p, c)| (p.as_str(), c.as_str()))
            .collect();
        salsa.source_set = salsa.db.load_sources(&source_refs);
    }

    // ── Re-query salsa (incremental — only changed inputs recompute) ─
    state.store = salsa.db.store(salsa.source_set, salsa.schema_set);
    state.schema = salsa.db.schema(salsa.schema_set);
    state.graph = LinkGraph::build(&state.store, &state.schema);
    state.cached_diagnostics = salsa.db.diagnostics(salsa.source_set, salsa.schema_set);

    // Drop the salsa lock before doing non-salsa work
    drop(salsa);

    // ── Reload non-salsa state ───────────────────────────────────────
    let (doc_store, result_store, doc_dirs) = load_docs_and_results(&config, &project_path)?;
    state.doc_store = doc_store;
    state.result_store = result_store;
    state.doc_dirs = doc_dirs;
    state.externals = load_externals(&config, &project_path);

    // Update context metadata
    state.context.git = capture_git_info(&project_path);
    state.context.loaded_at = std::process::Command::new("date")
        .arg("+%H:%M:%S")
        .output()
        .ok()
        .filter(|o| o.status.success())
        .map(|o| String::from_utf8_lossy(&o.stdout).trim().to_string())
        .unwrap_or_else(|| "unknown".into());

    // Re-discover variant definitions (they live on disk too).
    state.variants = variant::ProjectVariants::discover(&project_path, &config);

    state.config = config;

    let elapsed = t_start.elapsed();
    eprintln!(
        "[watch] incremental reload: {:.1}ms",
        elapsed.as_secs_f64() * 1000.0,
    );

    Ok(())
}

/// Spawn a detached background thread that watches the filesystem for changes
/// to artifact YAML files, schema files, and documents, then triggers a reload.
fn spawn_file_watcher(
    port: u16,
    project_path: &std::path::Path,
    schemas_dir: &std::path::Path,
    source_paths: &[PathBuf],
    doc_dirs: &[PathBuf],
) {
    use notify::{RecursiveMode, Watcher};
    use std::sync::mpsc;
    use std::time::{Duration, Instant};

    let (tx, rx) = mpsc::channel();

    let mut watcher =
        match notify::recommended_watcher(move |res: notify::Result<notify::Event>| {
            if let Ok(event) = res {
                use notify::EventKind;
                match event.kind {
                    EventKind::Create(_) | EventKind::Modify(_) | EventKind::Remove(_) => {
                        // Filter to only relevant file extensions
                        let dominated = event.paths.iter().any(|p| {
                            p.extension()
                                .and_then(|e| e.to_str())
                                .is_some_and(|ext| matches!(ext, "yaml" | "yml" | "md"))
                        });
                        if dominated {
                            let _ = tx.send(());
                        }
                    }
                    _ => {}
                }
            }
        }) {
            Ok(w) => w,
            Err(e) => {
                eprintln!("[watch] failed to create file watcher: {e}");
                return;
            }
        };

    // Watch rivet.yaml
    let rivet_yaml = project_path.join("rivet.yaml");
    if rivet_yaml.exists() {
        if let Err(e) = watcher.watch(&rivet_yaml, RecursiveMode::NonRecursive) {
            eprintln!("[watch] failed to watch {}: {e}", rivet_yaml.display());
        }
    }

    // Watch schemas directory
    if schemas_dir.exists() {
        if let Err(e) = watcher.watch(schemas_dir, RecursiveMode::Recursive) {
            eprintln!("[watch] failed to watch {}: {e}", schemas_dir.display());
        }
    }

    // Watch source directories
    for src in source_paths {
        if src.exists() {
            let mode = if src.is_dir() {
                RecursiveMode::Recursive
            } else {
                RecursiveMode::NonRecursive
            };
            if let Err(e) = watcher.watch(src, mode) {
                eprintln!("[watch] failed to watch {}: {e}", src.display());
            }
        }
    }

    // Watch doc directories
    for doc_dir in doc_dirs {
        if doc_dir.exists() {
            if let Err(e) = watcher.watch(doc_dir, RecursiveMode::Recursive) {
                eprintln!("[watch] failed to watch {}: {e}", doc_dir.display());
            }
        }
    }

    // Detached thread — dies when the process exits
    std::thread::spawn(move || {
        // Keep the watcher alive for the lifetime of this thread
        let _watcher = watcher;
        let debounce = Duration::from_millis(300);
        let mut last_reload = Instant::now() - debounce;

        loop {
            // Block until we get a change notification
            if rx.recv().is_err() {
                break; // Sender dropped, watcher gone
            }

            // Drain any additional events that arrived
            while rx.try_recv().is_ok() {}

            // Debounce: skip if we reloaded recently
            let elapsed = last_reload.elapsed();
            if elapsed < debounce {
                std::thread::sleep(debounce - elapsed);
                // Drain again after sleeping
                while rx.try_recv().is_ok() {}
            }

            eprintln!("[watch] reloading...");
            last_reload = Instant::now();

            // Fire POST /reload with HX-Request header
            match std::net::TcpStream::connect(format!("127.0.0.1:{port}")) {
                Ok(mut stream) => {
                    use std::io::Write;
                    let request = format!(
                        "POST /reload HTTP/1.1\r\n\
                         Host: 127.0.0.1:{port}\r\n\
                         HX-Request: true\r\n\
                         Content-Length: 0\r\n\
                         Connection: close\r\n\
                         \r\n"
                    );
                    let _ = stream.write_all(request.as_bytes());
                    let _ = stream.flush();
                    // Read response (don't care about contents, just drain)
                    let _ = std::io::Read::read_to_end(&mut stream, &mut Vec::new());
                }
                Err(e) => {
                    eprintln!("[watch] failed to connect for reload: {e}");
                }
            }
        }
    });

    eprintln!("[watch] watching for file changes...");
}

/// Start the axum HTTP server on the given port.
///
/// Accepts a pre-built `AppState` (with salsa database) and a bind address.
/// File watching is enabled when `watch` is true.
pub async fn run(app_state: AppState, bind: String, watch: bool) -> Result<()> {
    let port = app_state.context.port;

    // Clone paths before moving into AppState so they remain available for the watcher.
    let project_path_for_watch = app_state.project_path_buf.clone();
    let schemas_dir_for_watch = app_state.schemas_dir.clone();
    let doc_dirs_for_watch = app_state.doc_dirs.clone();
    let source_paths: Vec<PathBuf> = app_state
        .config
        .sources
        .iter()
        .map(|s| app_state.project_path_buf.join(&s.path))
        .collect();

    let state: SharedState = Arc::new(RwLock::new(app_state));

    // ── MCP over Streamable HTTP ───────────────────────────────────────
    //
    // Creates an MCP endpoint at /mcp that reuses the same project data as
    // the dashboard.  Each MCP session snapshots the current store/schema/graph
    // so that a dashboard reload is picked up by new sessions automatically.
    let mcp_state = state.clone();
    let mcp_project_path = project_path_for_watch.clone();
    let mcp_config = StreamableHttpServerConfig::default()
        .with_stateful_mode(false)
        .with_json_response(true);
    let mcp_service: StreamableHttpService<RivetServer, LocalSessionManager> =
        StreamableHttpService::new(
            move || {
                // Snapshot the dashboard state into a fresh RivetServer.
                // `try_read()` avoids blocking the tokio runtime if a reload
                // is in progress — in that (rare) case we return an error and
                // the MCP client retries.
                let guard = mcp_state.try_read().map_err(|_| {
                    std::io::Error::new(
                        std::io::ErrorKind::WouldBlock,
                        "project is reloading, retry shortly",
                    )
                })?;
                Ok(RivetServer::from_shared(
                    mcp_project_path.clone(),
                    guard.store.clone(),
                    guard.schema.clone(),
                    guard.graph.clone(),
                ))
            },
            Arc::new(LocalSessionManager::default()),
            mcp_config,
        );

    // Build the dashboard view routes once, then mount them at both
    // `/` (the regular dashboard) and `/embed` (sidebar-free for
    // iframe / VS Code WebView embedding).
    //
    // Mounting via `Router::nest` is the supported axum 0.8 way to
    // handle prefix-stripping — the inner router sees `/artifacts/{id}`
    // for both `/artifacts/REQ-001` and `/embed/artifacts/REQ-001`. An
    // earlier version of `wrap_full_page` tried to strip `/embed` by
    // mutating the request URI in middleware, but axum 0.8's router
    // ignores URI mutation done in `from_fn_with_state` middleware
    // (the matcher uses internal path state set up beforehand). The
    // result was a wrapped 404 — see `tests/serve_integration.rs ::
    // embed_artifact_returns_200_with_embed_layout` for the regression
    // guard.
    let view_routes = || -> Router<SharedState> {
        Router::new()
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
            .route("/eu-ai-act", get(views::eu_ai_act_view))
            .route("/results", get(views::results_view))
            .route("/results/{run_id}", get(views::result_detail))
            .route("/source", get(views::source_tree_view))
            .route("/source/{*path}", get(views::source_file_view))
            .route("/diff", get(views::diff_view))
            .route("/doc-linkage", get(views::doc_linkage_view))
            .route("/traceability", get(views::traceability_view))
            .route("/traceability/history", get(views::traceability_history))
            .route("/help", get(views::help_view))
            .route("/help/docs", get(views::help_docs_list))
            .route("/help/docs/{*slug}", get(views::help_docs_topic))
            .route("/help/schema", get(views::help_schema_list))
            .route("/help/schema/{name}", get(views::help_schema_show))
            .route("/help/links", get(views::help_links_view))
            .route("/help/rules", get(views::help_rules_view))
            .route("/externals", get(views::externals_list))
            .route("/externals/{prefix}", get(views::external_detail))
            .route("/variants", get(views::variants_list))
    };

    let app = Router::new()
        .merge(view_routes())
        .nest("/embed", view_routes())
        // Routes that exist only at the root (assets, APIs, hooks).
        .route("/source-raw/{*path}", get(source_raw))
        .route("/api/links/{id}", get(api_artifact_links))
        .route("/oembed", get(api::oembed))
        .nest(
            "/api/v1",
            Router::new()
                .route("/health", get(api::health))
                .route("/stats", get(api::stats))
                .route("/artifacts", get(api::artifacts))
                .route("/diagnostics", get(api::diagnostics))
                .route("/coverage", get(api::coverage))
                .layer(CorsLayer::permissive())
                .with_state(state.clone()),
        )
        .route("/wasm/{*path}", get(wasm_asset))
        .route("/docs-asset/{*path}", get(docs_asset))
        .route("/assets/htmx.js", get(htmx_asset))
        .route("/assets/mermaid.js", get(mermaid_asset))
        .route("/reload", post(reload_handler))
        .nest_service("/mcp", mcp_service)
        .with_state(state.clone())
        .layer(axum::middleware::from_fn_with_state(state.clone(), wrap_full_page))
        .layer(axum::middleware::map_response(
            |mut response: axum::response::Response| async move {
                response.headers_mut().insert(
                    "Content-Security-Policy",
                    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self'; frame-ancestors *"
                        .parse()
                        .unwrap(),
                );
                response
            },
        ));

    let addr = format!("{bind}:{port}");
    let listener = tokio::net::TcpListener::bind(&addr).await?;
    let actual_port = listener.local_addr()?.port();

    // When port=0 the OS picks a free port — update the stored context.
    if actual_port != port {
        let mut guard = state.write().await;
        guard.context.port = actual_port;
    }

    eprintln!("rivet dashboard listening on http://{bind}:{actual_port}");
    eprintln!("  MCP endpoint: http://{bind}:{actual_port}/mcp");

    if watch {
        spawn_file_watcher(
            actual_port,
            &project_path_for_watch,
            &schemas_dir_for_watch,
            &source_paths,
            &doc_dirs_for_watch,
        );
    }

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
    let original_path = req.uri().path().to_string();
    let query = req.uri().query().unwrap_or("").to_string();
    let is_htmx = req.headers().contains_key("hx-request");
    let is_print = query.contains("print=1");
    let is_embed = query.contains("embed=1")
        || original_path.starts_with("/embed/")
        || original_path == "/embed";
    let method = req.method().clone();

    // The /embed/* routes are registered separately via
    // `Router::nest("/embed", …)` (see `run` above) so we do NOT mutate
    // the request URI here.  An earlier version of this middleware
    // tried to strip /embed in-place via `head.uri = rewritten`, but
    // axum 0.8's router consults internal path state set up before
    // top-level `from_fn_with_state` middleware runs and ignores the
    // URI mutation — confirmed by `tests/serve_integration.rs ::
    // embed_artifact_returns_200_with_embed_layout`, which kept seeing
    // a wrapped 404 with the in-place rewrite.
    //
    // What we still need from `is_embed` here: pick the right layout
    // when wrapping the inner handler's HTML body below.
    let path = if is_embed && original_path.starts_with("/embed") {
        original_path
            .strip_prefix("/embed")
            .unwrap_or("/")
            .to_string()
    } else {
        original_path
    };

    let response = next.run(req).await;

    // Only wrap GET requests to view routes (not assets or APIs)
    // For "/" without print/embed, the index handler already renders the full page.
    //
    // /search is a fragment-only endpoint — the Cmd+K JS fetches it via
    // `fetch()` (no `HX-Request` header) and dumps the body into
    // `#cmd-k-results`. If we wrap it in the full layout, a second
    // `<input id="cmd-k-input">` ends up nested inside `#cmd-k-results`,
    // tripping Playwright's strict-mode locator and confusing keyboard
    // navigation. Treat /search like the other API endpoints.
    if method == axum::http::Method::GET
        && !is_htmx
        && (path != "/" || is_print || is_embed)
        && !path.starts_with("/api/")
        && !path.starts_with("/mcp")
        && !path.starts_with("/oembed")
        && !path.starts_with("/search")
        && !path.starts_with("/assets/")
        && !path.starts_with("/wasm/")
        && !path.starts_with("/source-raw/")
        && !path.starts_with("/docs-asset/")
    {
        // Capture status before consuming the body so we can re-apply it after
        // wrapping; otherwise .into_response() defaults to 200 and silently
        // turns explicit error statuses (e.g. 400 from variant_error_response)
        // into successful responses.
        let status = response.status();
        let bytes = axum::body::to_bytes(response.into_body(), 16 * 1024 * 1024)
            .await
            .unwrap_or_default();
        let content = String::from_utf8_lossy(&bytes);
        let app = state.read().await;
        let mut wrapped = if is_print {
            layout::print_layout(&content, &app).into_response()
        } else if is_embed {
            layout::embed_layout(&content, &app).into_response()
        } else {
            let active_variant = extract_variant_from_query(&query);
            layout::page_layout_with_variant(&content, &app, active_variant.as_deref())
                .into_response()
        };
        *wrapped.status_mut() = status;
        return wrapped;
    }

    response
}

/// Extract the `variant=...` value from a URL-encoded query string.
///
/// Used to render the variant dropdown + banner on full-page loads so
/// that a bookmarked URL like `/coverage?variant=asil-d` reliably
/// reflects the selected variant.
fn extract_variant_from_query(query: &str) -> Option<String> {
    for pair in query.split('&') {
        if let Some(val) = pair.strip_prefix("variant=") {
            if val.is_empty() {
                return None;
            }
            return Some(
                urlencoding::decode(val)
                    .map(|s| s.into_owned())
                    .unwrap_or_else(|_| val.to_string()),
            );
        }
    }
    None
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

    // Try embedded assets (build.rs generates stubs when spar WASM is not built).
    {
        let bytes: Option<&[u8]> = match path.as_str() {
            "spar_wasm.js" => Some(embedded_wasm::SPAR_JS.as_bytes()),
            "spar_wasm.core.wasm" => Some(embedded_wasm::CORE_WASM),
            "spar_wasm.core2.wasm" => Some(embedded_wasm::CORE2_WASM),
            "spar_wasm.core3.wasm" => Some(embedded_wasm::CORE3_WASM),
            _ => None,
        };
        if let Some(data) = bytes {
            // Stub detection: if the JS is just a comment, return 404 so the
            // HEAD probe in the client knows WASM is unavailable.
            if data.len() < 100 && data.starts_with(b"// stub") {
                return axum::http::StatusCode::NOT_FOUND.into_response();
            }
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

/// POST /reload — incrementally re-read the project from disk using salsa.
///
/// Uses the `HX-Current-URL` header (sent automatically by HTMX) to redirect
/// back to the current page after reload, preserving the user's position.
///
/// Instead of rebuilding everything from scratch, this calls
/// `reload_state_incremental` which feeds updated file contents into the
/// existing salsa database. Salsa only recomputes queries whose inputs
/// actually changed, making reloads much faster for single-file edits.
async fn reload_handler(
    State(state): State<SharedState>,
    headers: axum::http::HeaderMap,
) -> impl IntoResponse {
    let result = {
        let mut guard = state.write().await;
        reload_state_incremental(&mut guard)
    };

    match result {
        Ok(()) => {
            // Use HX-Redirect (full browser navigation) instead of
            // HX-Location targeting #content. The sidebar badges
            // (artifact count, document count, variant count, STPA
            // count, diagnostic count) live OUTSIDE #content, so a
            // partial swap left them stale after every reload. A full
            // page navigation re-renders the whole shell — cheap
            // because HTMX does the redirect in the same browser
            // session and the prior page state was fetched just moments
            // earlier.
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

            (
                axum::http::StatusCode::OK,
                [("HX-Redirect", redirect_url)],
                "reloaded".to_owned(),
            )
        }
        Err(e) => {
            eprintln!("reload error: {e:#}");
            (
                axum::http::StatusCode::INTERNAL_SERVER_ERROR,
                [("HX-Redirect", "/".to_owned())],
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

mod api;
#[allow(dead_code)]
pub(crate) mod components;
pub(crate) mod js;
pub(crate) mod layout;
pub(crate) mod styles;
pub(crate) mod variant;
pub(crate) mod views;
