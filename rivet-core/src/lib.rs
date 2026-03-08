pub mod adapter;
pub mod error;
pub mod formats;
pub mod links;
pub mod matrix;
pub mod model;
#[cfg(feature = "oslc")]
pub mod oslc;
pub mod query;
pub mod reqif;
pub mod schema;
pub mod store;
pub mod validate;

#[cfg(feature = "wasm")]
pub mod wasm_runtime;

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
pub fn load_schemas(schema_names: &[String], schemas_dir: &Path) -> Result<schema::Schema, Error> {
    let mut files = Vec::new();

    for name in schema_names {
        let path = schemas_dir.join(format!("{}.yaml", name));
        if path.exists() {
            let file = schema::Schema::load_file(&path)?;
            files.push(file);
        } else {
            log::warn!("schema file not found: {}", path.display());
        }
    }

    Ok(schema::Schema::merge(&files))
}

/// Load artifacts from a source using the appropriate adapter.
pub fn load_artifacts(
    source: &model::SourceConfig,
    base_dir: &Path,
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
            let adapter = formats::stpa::StpaYamlAdapter::new();
            adapter::Adapter::import(&adapter, &source_input, &adapter_config)
        }
        "generic" | "generic-yaml" => {
            let adapter = formats::generic::GenericYamlAdapter::new();
            adapter::Adapter::import(&adapter, &source_input, &adapter_config)
        }
        "reqif" => {
            let adapter = reqif::ReqIfAdapter::new();
            adapter::Adapter::import(&adapter, &source_input, &adapter_config)
        }
        other => Err(Error::Adapter(format!("unknown format: {}", other))),
    }
}
