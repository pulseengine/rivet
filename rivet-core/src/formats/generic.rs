//! Generic YAML format adapter.
//!
//! Reads artifacts from YAML files using the canonical format:
//!
//! ```yaml
//! artifacts:
//!   - id: SWREQ-001
//!     type: sw-req
//!     title: Memory isolation
//!     description: ...
//!     status: approved
//!     tags: [safety]
//!     links:
//!       - type: derives-from
//!         target: SYSREQ-010
//!     fields:
//!       priority: must
//!       req-type: safety
//! ```

use std::collections::BTreeMap;
use std::path::Path;

use serde::Deserialize;

use crate::adapter::{Adapter, AdapterConfig, AdapterSource};
use crate::error::Error;
use crate::model::{Artifact, Link};

pub struct GenericYamlAdapter {
    supported: Vec<String>,
}

impl GenericYamlAdapter {
    pub fn new() -> Self {
        Self {
            supported: vec![], // accepts all types
        }
    }
}

impl Default for GenericYamlAdapter {
    fn default() -> Self {
        Self::new()
    }
}

impl Adapter for GenericYamlAdapter {
    fn id(&self) -> &str {
        "generic-yaml"
    }
    fn name(&self) -> &str {
        "Generic YAML Format"
    }
    fn supported_types(&self) -> &[String] {
        &self.supported
    }
    fn import(
        &self,
        source: &AdapterSource,
        _config: &AdapterConfig,
    ) -> Result<Vec<Artifact>, Error> {
        match source {
            AdapterSource::Path(path) => import_generic_file(path),
            AdapterSource::Directory(dir) => import_generic_directory(dir),
            AdapterSource::Bytes(bytes) => {
                let content = std::str::from_utf8(bytes)
                    .map_err(|e| Error::Adapter(format!("invalid UTF-8: {}", e)))?;
                parse_generic_yaml(content, None)
            }
        }
    }
    fn export(&self, artifacts: &[Artifact], _config: &AdapterConfig) -> Result<Vec<u8>, Error> {
        let file = GenericFile {
            artifacts: artifacts
                .iter()
                .map(|a| GenericArtifact {
                    id: a.id.clone(),
                    artifact_type: a.artifact_type.clone(),
                    title: a.title.clone(),
                    description: a.description.clone(),
                    status: a.status.clone(),
                    tags: a.tags.clone(),
                    links: a
                        .links
                        .iter()
                        .map(|l| GenericLink {
                            link_type: l.link_type.clone(),
                            target: l.target.clone(),
                        })
                        .collect(),
                    fields: a.fields.clone(),
                })
                .collect(),
        };
        let yaml = serde_yaml::to_string(&file)?;
        Ok(yaml.into_bytes())
    }
}

#[derive(Deserialize, serde::Serialize)]
struct GenericFile {
    artifacts: Vec<GenericArtifact>,
}

#[derive(Deserialize, serde::Serialize)]
struct GenericArtifact {
    id: String,
    #[serde(rename = "type")]
    artifact_type: String,
    title: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    description: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    status: Option<String>,
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    tags: Vec<String>,
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    links: Vec<GenericLink>,
    #[serde(default, skip_serializing_if = "BTreeMap::is_empty")]
    fields: BTreeMap<String, serde_yaml::Value>,
}

#[derive(Deserialize, serde::Serialize)]
struct GenericLink {
    #[serde(rename = "type")]
    link_type: String,
    target: String,
}

pub fn parse_generic_yaml(content: &str, source: Option<&Path>) -> Result<Vec<Artifact>, Error> {
    let file: GenericFile = serde_yaml::from_str(content)?;

    Ok(file
        .artifacts
        .into_iter()
        .map(|a| Artifact {
            id: a.id,
            artifact_type: a.artifact_type,
            title: a.title,
            description: a.description,
            status: a.status,
            tags: a.tags,
            links: a
                .links
                .into_iter()
                .map(|l| Link {
                    link_type: l.link_type,
                    target: l.target,
                })
                .collect(),
            fields: a.fields,
            source_file: source.map(|p| p.to_path_buf()),
        })
        .collect())
}

fn import_generic_file(path: &Path) -> Result<Vec<Artifact>, Error> {
    let content = std::fs::read_to_string(path)
        .map_err(|e| Error::Io(format!("{}: {}", path.display(), e)))?;
    parse_generic_yaml(&content, Some(path))
}

fn import_generic_directory(dir: &Path) -> Result<Vec<Artifact>, Error> {
    let mut artifacts = Vec::new();
    let entries =
        std::fs::read_dir(dir).map_err(|e| Error::Io(format!("{}: {}", dir.display(), e)))?;

    for entry in entries {
        let entry = entry.map_err(|e| Error::Io(e.to_string()))?;
        let path = entry.path();
        if path
            .extension()
            .is_some_and(|ext| ext == "yaml" || ext == "yml")
        {
            match import_generic_file(&path) {
                Ok(arts) => artifacts.extend(arts),
                Err(e) => log::warn!("skipping {}: {}", path.display(), e),
            }
        } else if path.is_dir() {
            artifacts.extend(import_generic_directory(&path)?);
        }
    }

    Ok(artifacts)
}
