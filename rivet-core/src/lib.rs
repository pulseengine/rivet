#![allow(clippy::cloned_ref_to_slice_refs)]

pub mod adapter;
pub mod bazel;
pub mod commits;
pub mod convergence;
pub mod coverage;
pub mod db;
pub mod diff;
pub mod document;
pub mod embed;
pub mod embedded;
pub mod error;
pub mod export;
pub mod externals;
pub mod formats;
pub mod impact;
pub mod junit;
pub mod lifecycle;
pub mod links;
pub mod markdown;
pub mod matrix;
pub mod model;
pub mod mutate;
#[cfg(feature = "oslc")]
pub mod oslc;
pub mod query;
pub mod reqif;
pub mod results;
pub mod schema;
pub mod snapshot;
pub mod store;
pub mod test_scanner;
pub mod validate;
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

use std::path::Path;

use error::Error;
use model::ProjectConfig;

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
            let adapter = formats::generic::GenericYamlAdapter::new();
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
        "needs-json" => {
            let adapter = formats::needs_json::NeedsJsonAdapter::new();
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
        _ => return Err(Error::Adapter("unsupported source type for stpa-yaml".into())),
    };
    let mut artifacts = Vec::new();
    let entries = std::fs::read_dir(dir)
        .map_err(|e| Error::Adapter(format!("read dir {}: {e}", dir.display())))?;
    for entry in entries.filter_map(|e| e.ok()) {
        let path = entry.path();
        if path.extension().is_some_and(|ext| ext == "yaml" || ext == "yml") {
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
