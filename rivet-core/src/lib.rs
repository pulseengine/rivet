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
    load_project_config_with_report(path).map(|(cfg, _)| cfg)
}

/// The known-good top-level keys on `ProjectConfig`. Must stay in sync
/// with the struct definition in `model.rs`; a drift here means the
/// #808 `unknown-config-key` diagnostic false-fires on a legitimate
/// key, so it's kept alphabetically ordered next to the struct so a
/// diff makes the pair impossible to miss.
pub const KNOWN_RIVET_YAML_TOP_LEVEL_KEYS: &[&str] = &[
    "baselines",
    "commits",
    "docs",
    "docs-check",
    "externals",
    "project",
    "release",
    "results",
    "sources",
];

/// Load a project configuration from a `rivet.yaml` file, additionally
/// returning any top-level YAML keys that aren't declared on
/// [`ProjectConfig`]. #808: those keys get an `unknown-config-key`
/// diagnostic in `cmd_validate` rather than a hard load failure —
/// downstream projects may legitimately carry extra top-level keys
/// (sigil ships `schemas-path:`), and hard-failing on them would break
/// every such user for no gain over a diagnostic.
pub fn load_project_config_with_report(path: &Path) -> Result<(ProjectConfig, Vec<String>), Error> {
    let content = std::fs::read_to_string(path)
        .map_err(|e| Error::Io(format!("{}: {}", path.display(), e)))?;
    let config: ProjectConfig = serde_yaml::from_str(&content)
        .map_err(|e| Error::Schema(format!("{}: {}", path.display(), e)))?;
    // Post-parse: enumerate the raw top-level keys and note any that
    // aren't in the known-good set. Failure to re-parse as a plain
    // Value (already-succeeded typed parse implies re-parseability)
    // returns an empty list, so a race on the file can't invent a
    // spurious diagnostic — worst case it goes unreported this run.
    let unknown_keys: Vec<String> = serde_yaml::from_str::<serde_yaml::Value>(&content)
        .ok()
        .and_then(|v| match v {
            serde_yaml::Value::Mapping(m) => Some(m),
            _ => None,
        })
        .map(|m| {
            let mut keys: Vec<String> = m
                .into_iter()
                .filter_map(|(k, _)| match k {
                    serde_yaml::Value::String(s) => Some(s),
                    _ => None,
                })
                .filter(|k| !KNOWN_RIVET_YAML_TOP_LEVEL_KEYS.contains(&k.as_str()))
                .collect();
            keys.sort();
            keys
        })
        .unwrap_or_default();
    Ok((config, unknown_keys))
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
///
/// Every collision fires — including two artifacts in the same file
/// (a real bug the loader can't rule out) and two artifacts across two
/// files (the classic ID clash). To silence the *self*-collisions that
/// arise when a `rivet.yaml` `sources` overlap loads one file twice
/// (#746), use [`detect_duplicate_ids_excluding_overlaps`] with the set
/// of overlapped files from [`detect_source_overlaps`].
pub fn detect_duplicate_ids_for_validate(artifacts: &[model::Artifact]) -> Vec<DuplicateId> {
    detect_duplicate_ids(artifacts)
}

/// Like [`detect_duplicate_ids_for_validate`] but silences self-collisions
/// (two artifacts with identical `id` AND identical resolved
/// `source_file`) for files listed in `overlapped_files`. Used by
/// `rivet validate` after [`detect_source_overlaps`] identifies which
/// files were double-loaded by overlapping `rivet.yaml` `sources`
/// entries — those collisions are symptoms of the config, not of the
/// artifacts, and are reported once as an `overlapping-source` warning
/// pointing at `rivet.yaml` instead of N per-id errors pointing at the
/// same file (#746).
///
/// Genuine within-file duplicates in a NON-overlapped file still fire —
/// that's a real bug (`Store::upsert` would silently pick a survivor).
pub fn detect_duplicate_ids_excluding_overlaps(
    artifacts: &[model::Artifact],
    overlapped_files: &std::collections::HashSet<PathBuf>,
) -> Vec<DuplicateId> {
    detect_duplicate_ids_inner(artifacts, overlapped_files)
}

/// One pair of `rivet.yaml` `sources` entries that resolve to overlapping
/// on-disk paths — the outer one contains (or equals) the inner one.
///
/// A rivet.yaml that lists a directory AND individual files inside it
/// (typically to mix formats per-file, since directory sources apply one
/// format to every file) loads each covered file twice, once via each
/// entry, producing self-collisions in the duplicate-id scan and doubling
/// the work. Diagnostics point at rivet.yaml rather than the artifacts
/// they surface as (#746).
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct SourceOverlap {
    /// The `sources[]` index (0-based) of the entry whose path *contains*
    /// (or equals) the other. When two entries resolve to the same file,
    /// this is the earlier index.
    pub outer_index: usize,
    /// The `path` string as written in `rivet.yaml` for the outer entry.
    pub outer_path: String,
    /// The `format` of the outer entry — reported so the user can see
    /// which of the two formats will apply if the overlap is left in.
    pub outer_format: String,
    /// The `sources[]` index (0-based) of the entry whose path is
    /// *contained by* (or equal to) the outer entry.
    pub inner_index: usize,
    /// The `path` string as written in `rivet.yaml` for the inner entry.
    pub inner_path: String,
    /// The `format` of the inner entry.
    pub inner_format: String,
}

/// Detect `sources[]` entries in `rivet.yaml` whose on-disk paths overlap.
///
/// An overlap is either (a) the same resolved path appearing in two
/// entries, or (b) one entry's resolved path being a directory that
/// contains another entry's resolved path. Both cases cause the same
/// file to be loaded twice — once per source — which then produces
/// self-collisions in `detect_duplicate_ids` and (silently) makes
/// which-format-wins depend on source order.
///
/// Overlaps are reported at most once per pair and always in deterministic
/// order (sorted by `(outer_index, inner_index)`) so the resulting
/// diagnostics are byte-stable across runs (also #746).
///
/// A missing / unresolvable path is not itself an overlap — the caller
/// (a directory source's on-disk existence, format-specific loading)
/// reports those. This scan is purely about pairwise overlap and skips
/// entries that fail to `canonicalize`.
pub fn detect_source_overlaps(config: &ProjectConfig, base_dir: &Path) -> Vec<SourceOverlap> {
    // Canonicalize each source's path exactly once. `None` means the path
    // failed to canonicalize (missing on disk, permission error) — we
    // simply don't compare it, since we can't reason about its containment
    // relationships without a real resolved path.
    let resolved: Vec<Option<PathBuf>> = config
        .sources
        .iter()
        .map(|s| base_dir.join(&s.path).canonicalize().ok())
        .collect();

    let mut overlaps = Vec::new();
    for (i, ri) in resolved.iter().enumerate() {
        let Some(pi) = ri else { continue };
        for (j, rj) in resolved.iter().enumerate().skip(i + 1) {
            let Some(pj) = rj else { continue };
            // Which side is the outer (containing) source? When the two
            // paths are equal, the earlier `sources[]` index wins the
            // outer slot — arbitrary but stable, so diagnostics don't
            // flip between runs.
            let (outer_index, inner_index) = if pi == pj || path_contains(pi, pj) {
                (i, j)
            } else if path_contains(pj, pi) {
                (j, i)
            } else {
                continue;
            };
            overlaps.push(SourceOverlap {
                outer_index,
                outer_path: config.sources[outer_index].path.clone(),
                outer_format: config.sources[outer_index].format.clone(),
                inner_index,
                inner_path: config.sources[inner_index].path.clone(),
                inner_format: config.sources[inner_index].format.clone(),
            });
        }
    }
    overlaps.sort_by_key(|o| (o.outer_index, o.inner_index));
    overlaps
}

/// True if `outer` is a strict ancestor directory of `inner` (i.e. `inner`
/// lives somewhere under `outer`). Both must be canonicalized paths.
fn path_contains(outer: &Path, inner: &Path) -> bool {
    outer != inner && inner.starts_with(outer)
}

/// Scan a loaded artifact list for IDs claimed by more than one artifact.
///
/// The first artifact to claim an ID is remembered; every later artifact
/// with the same ID yields one [`DuplicateId`] pairing the first file with
/// the colliding file. Two collisions on the same ID produce two entries.
///
/// Every collision fires unconditionally. To exclude the specific
/// self-collision case where two overlapping `rivet.yaml` sources load
/// the same file twice (#746), use [`detect_duplicate_ids_excluding_overlaps`].
fn detect_duplicate_ids(artifacts: &[model::Artifact]) -> Vec<DuplicateId> {
    detect_duplicate_ids_inner(artifacts, &std::collections::HashSet::new())
}

/// Shared implementation. When `overlapped_files` is non-empty, a
/// same-id collision whose "first" and "second" source paths are both
/// `Some(p)`, canonicalize to the same on-disk path, and `p` is a member
/// of `overlapped_files`, is silently dropped. Otherwise every collision
/// fires — including two artifacts in the same file (a real bug the
/// loader can't rule out for every format) and two artifacts across two
/// files (the classic ID clash).
fn detect_duplicate_ids_inner(
    artifacts: &[model::Artifact],
    overlapped_files: &std::collections::HashSet<PathBuf>,
) -> Vec<DuplicateId> {
    let mut seen: std::collections::HashMap<&str, Option<PathBuf>> =
        std::collections::HashMap::new();
    let mut duplicates = Vec::new();
    for a in artifacts {
        match seen.get(a.id.as_str()) {
            Some(first_file) => {
                // #746: suppress ONLY when both artifacts have the same
                // resolved on-disk source AND that source is one of the
                // files known to be loaded twice via overlapping
                // rivet.yaml `sources`. A within-file duplicate in a
                // file that isn't part of an overlap is still a real
                // bug and continues to fire.
                if !overlapped_files.is_empty()
                    && is_same_overlapped_file(
                        first_file.as_deref(),
                        a.source_file.as_deref(),
                        overlapped_files,
                    )
                {
                    continue;
                }
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

/// True when both paths are `Some`, resolve to the same on-disk file
/// (via `canonicalize`), and that resolved path is listed in
/// `overlapped_files`. Missing-file fallback compares paths literally.
fn is_same_overlapped_file(
    a: Option<&Path>,
    b: Option<&Path>,
    overlapped_files: &std::collections::HashSet<PathBuf>,
) -> bool {
    let (Some(x), Some(y)) = (a, b) else {
        return false;
    };
    let (cx, cy) = match (x.canonicalize(), y.canonicalize()) {
        (Ok(cx), Ok(cy)) => (cx, cy),
        _ => (x.to_path_buf(), y.to_path_buf()),
    };
    cx == cy && overlapped_files.contains(&cx)
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

#[cfg(test)]
mod tests {
    use super::*;

    fn make_artifact(id: &str, source_file: Option<PathBuf>) -> model::Artifact {
        let mut a = model::Artifact {
            id: id.into(),
            artifact_type: "requirement".into(),
            title: id.into(),
            ..model::Artifact::default()
        };
        a.source_file = source_file;
        a
    }

    // rivet: verifies REQ-004
    // #746 regression: same-file self-collisions from an overlapping
    // `rivet.yaml` sources config must NOT surface as
    // `duplicate-artifact-id` errors, but ONLY when the caller supplies
    // the overlapped-file set. Without that context (the default
    // `detect_duplicate_ids_for_validate` path) every collision still
    // fires so genuine within-file duplicates aren't silently masked.
    #[test]
    fn excluding_overlaps_suppresses_self_collision_from_overlapping_sources() {
        let tmp = tempfile::tempdir().unwrap();
        let path = tmp.path().join("validation.yaml");
        std::fs::write(&path, "- id: REQ-1\n").unwrap();
        let canon = path.canonicalize().unwrap();

        // Two artifacts with the same id both stamped with the same
        // resolved source file — the shape produced when `rivet.yaml`
        // lists both a directory source AND an individual file source
        // inside it.
        let artifacts = vec![
            make_artifact("REQ-1", Some(path.clone())),
            make_artifact("REQ-1", Some(path.clone())),
        ];

        // Default (no overlap context) — the collision still fires.
        // Preserves the genuine within-file duplicate signal for callers
        // that can't distinguish it from an overlap.
        assert_eq!(
            detect_duplicate_ids_for_validate(&artifacts).len(),
            1,
            "without overlap context, self-collisions must still fire"
        );

        // With the file marked as overlapped — collision is suppressed
        // because it's now known to be an overlapping-source symptom.
        let mut overlapped = std::collections::HashSet::new();
        overlapped.insert(canon);
        assert!(
            detect_duplicate_ids_excluding_overlaps(&artifacts, &overlapped).is_empty(),
            "with overlap context, self-collisions on an overlapped file must be silent"
        );
    }

    // rivet: verifies REQ-004
    // #746 aftershock: even with an overlap context, collisions where the
    // colliding file is NOT the overlapped one must still fire. This
    // guards against overzealous suppression from a broadly-scoped
    // overlap set.
    #[test]
    fn excluding_overlaps_still_fires_on_non_overlapped_files() {
        let tmp = tempfile::tempdir().unwrap();
        let overlap_path = tmp.path().join("in-overlap.yaml");
        let other_path = tmp.path().join("elsewhere.yaml");
        std::fs::write(&overlap_path, "- id: X\n").unwrap();
        std::fs::write(&other_path, "- id: X\n").unwrap();
        let overlap_canon = overlap_path.canonicalize().unwrap();

        // Two same-id artifacts BOTH stamped with a file that is not in
        // the overlap set — a real within-file duplicate that must still
        // surface.
        let artifacts = vec![
            make_artifact("REQ-1", Some(other_path.clone())),
            make_artifact("REQ-1", Some(other_path.clone())),
        ];
        let mut overlapped = std::collections::HashSet::new();
        overlapped.insert(overlap_canon);
        assert_eq!(
            detect_duplicate_ids_excluding_overlaps(&artifacts, &overlapped).len(),
            1,
            "a within-file duplicate in a file NOT part of the overlap must still fire"
        );
    }

    // rivet: verifies REQ-004
    // #746: the whole point of canonicalizing both `source_file`s before
    // the overlap-set membership check is to bring textually-different
    // but semantically-equivalent paths into equality — the exact shape
    // rivet.yaml can produce when the same file is referenced through
    // different path spellings across two overlapping sources. Without
    // canonicalization the two paths compare unequal, membership lookup
    // misses, and the phantom `duplicate-artifact-id` leaks back through.
    //
    // Uses `subdir/..` traversal to differ textually — `.` components
    // are silently normalized by `PathBuf::PartialEq` (via
    // `Path::components`) so they can't be used to force literal
    // inequality, but `..` components are preserved verbatim and only
    // resolved by `canonicalize` (which walks the filesystem). This
    // kills the "delete match arm `(Ok(cx), Ok(cy))`" mutation on
    // `is_same_overlapped_file` — with that arm deleted, both sides
    // fall through to the un-canonicalized fallback and compare
    // unequal, the suppression doesn't fire, and this assertion fails.
    #[test]
    fn excluding_overlaps_suppresses_via_canonicalize_on_textually_distinct_paths() {
        let tmp = tempfile::tempdir().unwrap();
        // Both `subdir` and `file.yaml` must exist for `canonicalize` on
        // `subdir/../file.yaml` to succeed — it walks each component.
        std::fs::create_dir(tmp.path().join("subdir")).unwrap();
        let file = tmp.path().join("file.yaml");
        std::fs::write(&file, "- id: REQ-1\n").unwrap();
        let canon = file.canonicalize().unwrap();

        // Textually distinct: `dir/file.yaml` vs `dir/subdir/../file.yaml`.
        // `PathBuf::PartialEq` uses `Path::components`, which normalizes
        // `.` away but preserves `..`, so the second form retains a `..`
        // component and compares unequal to the first. Both canonicalize
        // to the same on-disk file.
        let path_a = tmp.path().join("file.yaml");
        let path_b = tmp.path().join("subdir").join("..").join("file.yaml");
        assert_ne!(
            path_a, path_b,
            "premise: paths must differ textually for this test to \
             exercise the canonicalize branch of is_same_overlapped_file"
        );
        assert_eq!(
            path_a.canonicalize().unwrap(),
            path_b.canonicalize().unwrap(),
            "premise: both must canonicalize to the same on-disk file"
        );

        let artifacts = vec![
            make_artifact("REQ-1", Some(path_a)),
            make_artifact("REQ-1", Some(path_b)),
        ];
        let mut overlapped = std::collections::HashSet::new();
        overlapped.insert(canon);
        assert!(
            detect_duplicate_ids_excluding_overlaps(&artifacts, &overlapped).is_empty(),
            "self-collision must be suppressed even when the two source_file \
             paths differ textually but canonicalize to the same on-disk \
             file — that's why is_same_overlapped_file canonicalizes both \
             sides before the overlap-set membership check"
        );
    }

    // rivet: verifies REQ-004
    // #746: genuine cross-file collisions must still fire — the same id
    // in two DIFFERENT files is a real bug (the second silently
    // overwrites the first) and continues to surface as
    // `duplicate-artifact-id`.
    #[test]
    fn detect_duplicate_ids_still_fires_on_cross_file_collision() {
        let tmp = tempfile::tempdir().unwrap();
        let a_path = tmp.path().join("a.yaml");
        let b_path = tmp.path().join("b.yaml");
        std::fs::write(&a_path, "- id: REQ-1\n").unwrap();
        std::fs::write(&b_path, "- id: REQ-1\n").unwrap();

        let artifacts = vec![
            make_artifact("REQ-1", Some(a_path)),
            make_artifact("REQ-1", Some(b_path)),
        ];
        let dups = detect_duplicate_ids(&artifacts);
        assert_eq!(
            dups.len(),
            1,
            "genuine cross-file collision must still fire; got {dups:?}"
        );
    }

    // rivet: verifies REQ-081
    // Importers that don't stamp `source_file` (e.g. `import_needs_json`
    // called without a path) rely on this scan to catch their own
    // uniqueness violations. Two `None` source files with colliding ids
    // must always fire, regardless of overlap context.
    #[test]
    fn detect_duplicate_ids_still_fires_when_both_source_files_are_none() {
        let artifacts = vec![make_artifact("REQ-1", None), make_artifact("REQ-1", None)];
        assert_eq!(
            detect_duplicate_ids_for_validate(&artifacts).len(),
            1,
            "None-source collision must still fire (no overlap ctx)"
        );
        // Even with a non-empty overlap set — the None sources aren't
        // members of any overlapped-file set.
        let mut overlapped = std::collections::HashSet::new();
        overlapped.insert(PathBuf::from("/nonexistent/overlap.yaml"));
        assert_eq!(
            detect_duplicate_ids_excluding_overlaps(&artifacts, &overlapped).len(),
            1,
            "None-source collision must still fire (with overlap ctx)"
        );
    }

    // rivet: verifies REQ-004
    // #746: two `sources` entries that resolve to the same file are
    // reported as an overlap with `outer_path == inner_path`.
    #[test]
    fn detect_source_overlaps_flags_same_resolved_path() {
        let tmp = tempfile::tempdir().unwrap();
        let file = tmp.path().join("shared.yaml");
        std::fs::write(&file, "- id: X\n").unwrap();

        let config = project_config_with_sources(vec![
            make_source("shared.yaml", "generic-yaml"),
            make_source("./shared.yaml", "stpa-yaml"),
        ]);

        let overlaps = detect_source_overlaps(&config, tmp.path());
        assert_eq!(overlaps.len(), 1, "got {overlaps:?}");
        assert_eq!(overlaps[0].outer_index, 0);
        assert_eq!(overlaps[0].inner_index, 1);
        assert_eq!(overlaps[0].outer_path, "shared.yaml");
        assert_eq!(overlaps[0].inner_path, "./shared.yaml");
        // Both formats surfaced so the user can see which will apply
        // last-write-wins.
        assert_eq!(overlaps[0].outer_format, "generic-yaml");
        assert_eq!(overlaps[0].inner_format, "stpa-yaml");
    }

    // rivet: verifies REQ-004
    // #746: a directory source that contains an individually-listed file
    // source is reported as an overlap. This is the shape from the
    // issue's spar reproducer.
    #[test]
    fn detect_source_overlaps_flags_directory_containing_file() {
        let tmp = tempfile::tempdir().unwrap();
        let dir = tmp.path().join("stpa");
        std::fs::create_dir(&dir).unwrap();
        let file = dir.join("validation.yaml");
        std::fs::write(&file, "- id: X\n").unwrap();

        let config = project_config_with_sources(vec![
            make_source("stpa", "stpa-yaml"),
            make_source("stpa/validation.yaml", "generic-yaml"),
        ]);

        let overlaps = detect_source_overlaps(&config, tmp.path());
        assert_eq!(overlaps.len(), 1, "got {overlaps:?}");
        assert_eq!(overlaps[0].outer_index, 0);
        assert_eq!(overlaps[0].outer_path, "stpa");
        assert_eq!(overlaps[0].inner_index, 1);
        assert_eq!(overlaps[0].inner_path, "stpa/validation.yaml");
    }

    // rivet: verifies REQ-004
    // #746: disjoint `sources` are NOT reported. Two unrelated directories
    // (or a directory and a sibling file) must produce no overlap.
    #[test]
    fn detect_source_overlaps_ignores_disjoint_sources() {
        let tmp = tempfile::tempdir().unwrap();
        std::fs::create_dir(tmp.path().join("a")).unwrap();
        std::fs::create_dir(tmp.path().join("b")).unwrap();
        std::fs::write(tmp.path().join("a/x.yaml"), "- id: X\n").unwrap();
        std::fs::write(tmp.path().join("b/y.yaml"), "- id: Y\n").unwrap();

        let config = project_config_with_sources(vec![
            make_source("a", "generic-yaml"),
            make_source("b", "generic-yaml"),
        ]);

        assert!(detect_source_overlaps(&config, tmp.path()).is_empty());
    }

    fn make_source(path: &str, format: &str) -> model::SourceConfig {
        model::SourceConfig {
            path: path.into(),
            format: format.into(),
            adapter: None,
            layout: model::SourceLayout::default(),
            config: std::collections::BTreeMap::new(),
        }
    }

    fn project_config_with_sources(sources: Vec<model::SourceConfig>) -> ProjectConfig {
        ProjectConfig {
            project: model::ProjectMetadata {
                name: "test".into(),
                version: None,
                schemas: Vec::new(),
                schema_pins: std::collections::BTreeMap::new(),
            },
            sources,
            docs: Vec::new(),
            results: None,
            commits: None,
            release: None,
            externals: None,
            baselines: None,
            docs_check: None,
        }
    }
}
