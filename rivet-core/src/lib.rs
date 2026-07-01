#![allow(clippy::cloned_ref_to_slice_refs)]
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

pub mod adapter;
pub mod agent_pipelines;
pub mod bazel;
pub mod bundle;
pub mod cited_source;
pub mod commits;
pub mod compliance;
pub mod convergence;
pub mod coverage;
pub mod coverage_evidence;
pub mod db;
pub mod diff;
pub mod doc_check;
pub mod document;
pub mod embed;
pub mod embedded;
pub mod error;
pub mod export;
pub mod externals;
pub mod feature_model;
pub mod formats;
pub mod impact;
pub mod junit;
pub mod lifecycle;
pub mod links;
pub mod managed_section;
pub mod markdown;
pub mod matrix;
pub mod migrate;
pub mod model;
pub mod mutate;
#[cfg(feature = "oslc")]
pub mod oslc;
pub mod ownership;
pub mod query;
pub mod remediation;
pub mod reqif;
pub mod result_trace;
pub mod results;
pub mod rivet_version;
pub mod runs;
pub mod schema;
pub mod sexpr;
pub mod sexpr_eval;
pub mod similarity;
pub mod snapshot;
#[cfg(feature = "sql")]
pub mod sql;
pub mod store;
pub mod templates;
pub mod test_scanner;
pub mod validate;
pub mod variant_emit;
pub mod verification_evidence;
pub mod yaml_cst;
pub mod yaml_edit;
pub mod yaml_hir;

#[cfg(test)]
pub mod test_helpers;

#[cfg(kani)]
mod proofs;

#[cfg(feature = "wasm")]
pub mod wasm_runtime;

#[cfg(verus)]
pub mod verus_specs;

use std::path::{Path, PathBuf};

use error::Error;
use model::ProjectConfig;

/// Recursively collect YAML files from a path into (path_string, content) pairs.
///
/// If `path` points to a single file it is read directly.  If it points to a
/// directory the tree is walked recursively and every `.yaml` / `.yml` file is
/// collected.
pub fn collect_yaml_files(path: &Path, out: &mut Vec<(String, String)>) -> Result<(), Error> {
    if path.is_file() {
        let content = std::fs::read_to_string(path)
            .map_err(|e| Error::Io(format!("reading {}: {e}", path.display())))?;
        out.push((path.display().to_string(), content));
    } else if path.is_dir() {
        let entries = std::fs::read_dir(path)
            .map_err(|e| Error::Io(format!("reading directory {}: {e}", path.display())))?;
        for entry in entries {
            let entry = entry.map_err(|e| Error::Io(format!("{e}")))?;
            let p = entry.path();
            if p.is_dir() {
                collect_yaml_files(&p, out)?;
            } else if p
                .extension()
                .is_some_and(|ext| ext == "yaml" || ext == "yml")
            {
                let content = std::fs::read_to_string(&p)
                    .map_err(|e| Error::Io(format!("reading {}: {e}", p.display())))?;
                out.push((p.display().to_string(), content));
            }
        }
    }
    Ok(())
}

/// A fully-loaded project: config, store, schema, and link graph.
///
/// This is the common "load everything" pattern shared by the CLI, MCP server,
/// and web dashboard.  Callers that need documents, test results, or external
/// projects can layer those on top.
pub struct LoadedProject {
    pub config: ProjectConfig,
    pub store: store::Store,
    pub schema: schema::Schema,
    pub graph: links::LinkGraph,
}

/// Resolve the schemas directory for a project, falling back to the binary
/// location or the embedded schemas.
fn resolve_schemas_dir_for(project_dir: &Path) -> PathBuf {
    let project_schemas = project_dir.join("schemas");
    if project_schemas.exists() {
        return project_schemas;
    }

    if let Ok(exe) = std::env::current_exe() {
        if let Some(parent) = exe.parent() {
            let bin_schemas = parent.join("../schemas");
            if bin_schemas.exists() {
                return bin_schemas;
            }
        }
    }

    project_schemas
}

/// Load a project from disk: config, schemas, artifacts, and link graph.
///
/// This is equivalent to the shared core of `ProjectContext::load`,
/// `reload_state`, and the MCP `load_project` helper.
pub fn load_project_full(project_dir: &Path) -> Result<LoadedProject, Error> {
    let config_path = project_dir.join("rivet.yaml");
    let config = load_project_config(&config_path)?;

    let schemas_dir = resolve_schemas_dir_for(project_dir);
    let schema = load_schemas(&config.project.schemas, &schemas_dir)?;

    let mut store = store::Store::new();
    for source in &config.sources {
        let artifacts = load_artifacts(source, project_dir, &schema)?;
        for a in artifacts {
            store.upsert(a);
        }
    }

    let graph = links::LinkGraph::build(&store, &schema);
    Ok(LoadedProject {
        config,
        store,
        schema,
        graph,
    })
}

/// Load a project configuration from a `rivet.yaml` file.
pub fn load_project_config(path: &Path) -> Result<ProjectConfig, Error> {
    let content = std::fs::read_to_string(path)
        .map_err(|e| Error::Io(format!("{}: {}", path.display(), e)))?;
    let config: ProjectConfig = serde_yaml::from_str(&content)
        .map_err(|e| Error::Schema(format!("{}: {}", path.display(), e)))?;
    Ok(config)
}

/// Load schemas from the built-in schemas directory or from file paths.
///
/// Falls back to embedded (compiled-in) schemas when files are not on disk.
pub fn load_schemas(schema_names: &[String], schemas_dir: &Path) -> Result<schema::Schema, Error> {
    embedded::load_schemas_with_fallback(schema_names, schemas_dir)
}

/// Load artifacts from a source using the appropriate adapter.
///
/// The `schema` parameter enables schema-driven extraction for formats
/// like `stpa-yaml` that use non-standard top-level YAML keys. Pass
/// `&Schema::default()` if no schema is available.
pub fn load_artifacts(
    source: &model::SourceConfig,
    base_dir: &Path,
    schema: &schema::Schema,
) -> Result<Vec<model::Artifact>, Error> {
    load_artifacts_inner(source, base_dir, schema, true)
}

/// Like [`load_artifacts`], but suppresses the per-file `skipping <file>`
/// WARN that a `generic`/`generic-yaml` directory import emits for a
/// malformed *artifact* file.
///
/// Use when re-loading a source that has *already* been loaded (and warned
/// about) once — notably `rivet validate`'s REQ-075 duplicate-id re-scan,
/// which runs after `ProjectContext::load` already loaded+warned. Without
/// this the same `skipping …` line printed twice (REQ-157 / #406). The hard
/// `artifact-parse-error` ERROR is unaffected — it derives from
/// [`LoadReport::skipped`], not from this log line.
pub fn load_artifacts_quiet(
    source: &model::SourceConfig,
    base_dir: &Path,
    schema: &schema::Schema,
) -> Result<Vec<model::Artifact>, Error> {
    load_artifacts_inner(source, base_dir, schema, false)
}

fn load_artifacts_inner(
    source: &model::SourceConfig,
    base_dir: &Path,
    schema: &schema::Schema,
    warn_skips: bool,
) -> Result<Vec<model::Artifact>, Error> {
    let path = base_dir.join(&source.path);

    let adapter_config = adapter::AdapterConfig {
        entries: source.config.clone(),
    };

    let source_input = if path.is_dir() {
        adapter::AdapterSource::Directory(path)
    } else {
        adapter::AdapterSource::Path(path)
    };

    match source.format.as_str() {
        "stpa-yaml" => {
            // STPA files use schema-driven extraction with yaml-section metadata.
            import_with_schema(&source_input, schema)
        }
        "generic" | "generic-yaml" => {
            let adapter = formats::generic::GenericYamlAdapter::new().with_warn_skips(warn_skips);
            adapter::Adapter::import(&adapter, &source_input, &adapter_config)
        }
        "reqif" => {
            let adapter = reqif::ReqIfAdapter::new();
            adapter::Adapter::import(&adapter, &source_input, &adapter_config)
        }
        "aadl" => {
            let adapter = formats::aadl::AadlAdapter::new();
            adapter::Adapter::import(&adapter, &source_input, &adapter_config)
        }
        #[cfg(feature = "wasm")]
        "wasm" => {
            let adapter_path = source.adapter.as_ref().ok_or_else(|| {
                Error::Adapter(
                    "format 'wasm' requires an 'adapter' field pointing to a .wasm component"
                        .into(),
                )
            })?;
            let wasm_path = base_dir.join(adapter_path);
            let runtime = wasm_runtime::WasmAdapterRuntime::with_defaults()
                .map_err(|e| Error::Adapter(format!("WASM runtime init failed: {e}")))?;
            let wasm_adapter = runtime
                .load_adapter(&wasm_path)
                .map_err(|e| Error::Adapter(format!("failed to load WASM adapter: {e}")))?;
            adapter::Adapter::import(&wasm_adapter, &source_input, &adapter_config)
        }
        #[cfg(not(feature = "wasm"))]
        "wasm" => Err(Error::Adapter(
            "WASM adapter support requires the 'wasm' feature flag".into(),
        )),
        other => Err(Error::Adapter(format!("unknown format: {}", other))),
    }
}

/// A second artifact in a load that claims an `id` already taken by an
/// artifact loaded earlier from the same project.
///
/// `Store::upsert` is keyed by ID and last-write-wins, so two artifacts
/// declaring the same `id` collapse silently — by the time
/// `validate::validate` runs only the survivor exists, and the validator
/// is structurally blind to the collision (REQ-075, F2 family). This type
/// captures the collision at LOAD time, where both copies are still
/// visible, so callers (notably `rivet validate`) can surface it as an
/// Error diagnostic naming both files.
///
/// Cross-repo `prefix:ID` references are namespaced and loaded through a
/// separate path; they never appear here. Only two *local* artifacts
/// colliding produce a `DuplicateId`.
#[derive(Debug, Clone)]
pub struct DuplicateId {
    /// The artifact ID claimed by two artifacts.
    pub id: String,
    /// Source file of the artifact that claimed the ID first (the one
    /// that would be overwritten by `upsert`).
    pub first_file: Option<PathBuf>,
    /// Source file of the later artifact that collided. When two
    /// artifacts in a single file share an ID this equals `first_file`.
    pub second_file: Option<PathBuf>,
}

/// The full result of loading one or more sources: the loaded artifacts
/// plus the load-time anomalies that `load_artifacts` alone would discard
/// — files skipped during a directory import ([`SkippedFile`], REQ-062)
/// and duplicate artifact IDs ([`DuplicateId`], REQ-075).
#[derive(Debug, Default)]
pub struct LoadReport {
    /// The artifacts loaded from the source(s).
    pub artifacts: Vec<model::Artifact>,
    /// YAML files that were not loaded as artifacts, classified by reason.
    pub skipped: Vec<SkippedFile>,
    /// Artifact IDs claimed by more than one artifact.
    pub duplicates: Vec<DuplicateId>,
}

/// Like [`load_artifacts`], but additionally reports YAML files that were
/// skipped during a `generic`/`generic-yaml` directory import.
///
/// `load_artifacts` swallows per-file parse failures to a `log::warn!` line
/// (see `formats::generic::import_generic_directory`), which means a
/// malformed artifact file produces a green PASS over an empty load
/// (REQ-062 / F2). This entrypoint re-walks the source directory via
/// [`formats::generic::scan_skipped_files`] and returns the classified
/// [`SkippedFile`]s alongside the artifacts so callers (notably
/// `rivet validate`) can surface malformed files as Error diagnostics
/// while still silently skipping legitimate non-artifact YAML.
///
/// For non-`generic` formats the skips vec is always empty — those
/// adapters fail loudly rather than skipping files.
///
/// This is a separate function (not a signature change to `load_artifacts`)
/// to keep the `rivet-core` public API semver-compatible.
pub fn load_artifacts_with_skips(
    source: &model::SourceConfig,
    base_dir: &Path,
    schema: &schema::Schema,
) -> Result<(Vec<model::Artifact>, Vec<SkippedFile>), Error> {
    let artifacts = load_artifacts(source, base_dir, schema)?;
    let skips = scan_source_skips(source, base_dir);
    Ok((artifacts, skips))
}

/// Like [`load_artifacts_with_skips`], but also detects duplicate artifact
/// IDs across the loaded artifacts (REQ-075).
///
/// This extends the REQ-062 load-report channel with duplicate detection.
/// Detection happens here, at LOAD time, because once the artifacts are
/// `upsert`ed into a `Store` only the last writer for each ID survives —
/// `validate::validate` can never see the collision.
///
/// Like [`load_artifacts_with_skips`], this is a separate entrypoint so
/// `load_artifacts`'s signature stays semver-stable.
pub fn load_artifacts_with_report(
    source: &model::SourceConfig,
    base_dir: &Path,
    schema: &schema::Schema,
) -> Result<LoadReport, Error> {
    let artifacts = load_artifacts(source, base_dir, schema)?;
    let skipped = scan_source_skips(source, base_dir);
    let duplicates = detect_duplicate_ids(&artifacts);
    Ok(LoadReport {
        artifacts,
        skipped,
        duplicates,
    })
}

/// Like [`load_artifacts_with_report`], but loads via [`load_artifacts_quiet`]
/// so the per-file `skipping <file>` WARN is not re-emitted.
///
/// `rivet validate` calls this for its REQ-075 duplicate-id / REQ-062 skip
/// re-scan, which runs *after* `ProjectContext::load` already loaded the same
/// sources (and emitted the WARN once). Using the noisy
/// [`load_artifacts_with_report`] there printed every malformed-file WARN
/// twice (REQ-157 / #406). The returned `skipped` / `duplicates` — and thus
/// the hard `artifact-parse-error` / `duplicate-artifact-id` ERROR
/// diagnostics — are identical to the noisy variant.
pub fn load_artifacts_with_report_quiet(
    source: &model::SourceConfig,
    base_dir: &Path,
    schema: &schema::Schema,
) -> Result<LoadReport, Error> {
    let artifacts = load_artifacts_quiet(source, base_dir, schema)?;
    let skipped = scan_source_skips(source, base_dir);
    let duplicates = detect_duplicate_ids(&artifacts);
    Ok(LoadReport {
        artifacts,
        skipped,
        duplicates,
    })
}

/// Re-walk a `generic`/`generic-yaml` source directory and classify the
/// `.yaml`/`.yml` files that failed to import. For non-`generic` formats
/// (or single-file sources) the result is always empty.
fn scan_source_skips(source: &model::SourceConfig, base_dir: &Path) -> Vec<SkippedFile> {
    match source.format.as_str() {
        "generic" | "generic-yaml" => {
            let path = base_dir.join(&source.path);
            if path.is_dir() {
                formats::generic::scan_skipped_files(&path)
            } else {
                Vec::new()
            }
        }
        _ => Vec::new(),
    }
}

/// Scan a loaded artifact list for IDs claimed by more than one artifact.
///
/// Public entrypoint for callers (notably `rivet validate`) that load
/// every source first and need a single project-wide duplicate pass: a
/// collision can straddle two source paths, which per-source
/// [`load_artifacts_with_report`] calls would each miss. Detection happens
/// here, before the artifacts are `upsert`ed into a `Store`, because
/// `upsert` is keyed by ID and last-write-wins (REQ-075).
pub fn detect_duplicate_ids_for_validate(artifacts: &[model::Artifact]) -> Vec<DuplicateId> {
    detect_duplicate_ids(artifacts)
}

/// Scan a loaded artifact list for IDs claimed by more than one artifact.
///
/// The first artifact to claim an ID is remembered; every later artifact
/// with the same ID yields one [`DuplicateId`] pairing the first file with
/// the colliding file. Two collisions on the same ID produce two entries.
fn detect_duplicate_ids(artifacts: &[model::Artifact]) -> Vec<DuplicateId> {
    let mut seen: std::collections::HashMap<&str, Option<PathBuf>> =
        std::collections::HashMap::new();
    let mut duplicates = Vec::new();
    for a in artifacts {
        match seen.get(a.id.as_str()) {
            Some(first_file) => {
                duplicates.push(DuplicateId {
                    id: a.id.clone(),
                    first_file: first_file.clone(),
                    second_file: a.source_file.clone(),
                });
            }
            None => {
                seen.insert(a.id.as_str(), a.source_file.clone());
            }
        }
    }
    duplicates
}

/// Import artifacts from a source using schema-driven rowan extraction.
fn import_with_schema(
    source: &adapter::AdapterSource,
    schema: &schema::Schema,
) -> Result<Vec<model::Artifact>, Error> {
    let dir = match source {
        adapter::AdapterSource::Directory(d) => d.as_path(),
        adapter::AdapterSource::Path(p) => {
            let content = std::fs::read_to_string(p)
                .map_err(|e| Error::Adapter(format!("read {}: {e}", p.display())))?;
            let parsed = yaml_hir::extract_schema_driven(&content, schema, Some(p));
            return Ok(parsed
                .artifacts
                .into_iter()
                .map(|sa| {
                    let mut a = sa.artifact;
                    a.source_file = Some(p.to_path_buf());
                    a
                })
                .collect());
        }
        _ => {
            return Err(Error::Adapter(
                "unsupported source type for stpa-yaml".into(),
            ));
        }
    };
    let mut artifacts = Vec::new();
    let entries = std::fs::read_dir(dir)
        .map_err(|e| Error::Adapter(format!("read dir {}: {e}", dir.display())))?;
    for entry in entries.filter_map(|e| e.ok()) {
        let path = entry.path();
        if path
            .extension()
            .is_some_and(|ext| ext == "yaml" || ext == "yml")
        {
            let content = std::fs::read_to_string(&path)
                .map_err(|e| Error::Adapter(format!("read {}: {e}", path.display())))?;
            let parsed = yaml_hir::extract_schema_driven(&content, schema, Some(&path));
            for sa in parsed.artifacts {
                let mut a = sa.artifact;
                a.source_file = Some(path.clone());
                artifacts.push(a);
            }
        }
    }
    Ok(artifacts)
}

pub mod providers;

/// Re-export of the skipped-file classification types so the CLI can name
/// them without reaching into the `formats::generic` module path.
pub use formats::generic::{SkipKind, SkippedFile};

// `DuplicateId` and `LoadReport` are declared in this module directly;
// they are part of the same load-report channel as `SkippedFile` and are
// already public (no re-export needed).
