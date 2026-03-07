use std::collections::HashMap;
use std::path::Path;

use serde::{Deserialize, Serialize};

use crate::error::Error;

// ── YAML file structure ──────────────────────────────────────────────────

/// Top-level structure of a schema YAML file.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SchemaFile {
    pub schema: SchemaMetadata,
    #[serde(default, rename = "base-fields")]
    pub base_fields: Vec<FieldDef>,
    #[serde(default, rename = "artifact-types")]
    pub artifact_types: Vec<ArtifactTypeDef>,
    #[serde(default, rename = "link-types")]
    pub link_types: Vec<LinkTypeDef>,
    #[serde(default, rename = "traceability-rules")]
    pub traceability_rules: Vec<TraceabilityRule>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SchemaMetadata {
    pub name: String,
    pub version: String,
    #[serde(default)]
    pub namespace: Option<String>,
    #[serde(default)]
    pub description: Option<String>,
    #[serde(default)]
    pub extends: Vec<String>,
}

// ── Artifact type definition ─────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ArtifactTypeDef {
    pub name: String,
    pub description: String,
    #[serde(default)]
    pub fields: Vec<FieldDef>,
    #[serde(default, rename = "link-fields")]
    pub link_fields: Vec<LinkFieldDef>,
    #[serde(default, rename = "aspice-process")]
    pub aspice_process: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FieldDef {
    pub name: String,
    #[serde(rename = "type")]
    pub field_type: String,
    #[serde(default)]
    pub required: bool,
    #[serde(default)]
    pub description: Option<String>,
    #[serde(default, rename = "allowed-values")]
    pub allowed_values: Option<Vec<String>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LinkFieldDef {
    pub name: String,
    #[serde(rename = "link-type")]
    pub link_type: String,
    #[serde(default, rename = "target-types")]
    pub target_types: Vec<String>,
    #[serde(default)]
    pub required: bool,
    #[serde(default)]
    pub cardinality: Cardinality,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq)]
#[serde(rename_all = "kebab-case")]
pub enum Cardinality {
    ExactlyOne,
    #[default]
    ZeroOrMany,
    ZeroOrOne,
    OneOrMany,
}

// ── Link type definition ─────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LinkTypeDef {
    pub name: String,
    #[serde(default)]
    pub inverse: Option<String>,
    pub description: String,
    #[serde(default, rename = "source-types")]
    pub source_types: Vec<String>,
    #[serde(default, rename = "target-types")]
    pub target_types: Vec<String>,
}

// ── Traceability rule ────────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TraceabilityRule {
    pub name: String,
    pub description: String,
    #[serde(rename = "source-type")]
    pub source_type: String,
    #[serde(default, rename = "required-link")]
    pub required_link: Option<String>,
    #[serde(default, rename = "required-backlink")]
    pub required_backlink: Option<String>,
    #[serde(default, rename = "target-types")]
    pub target_types: Vec<String>,
    #[serde(default, rename = "from-types")]
    pub from_types: Vec<String>,
    #[serde(default)]
    pub severity: Severity,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum Severity {
    Info,
    #[default]
    Warning,
    Error,
}

// ── Merged schema (the runtime view) ─────────────────────────────────────

/// A merged schema built from one or more schema files.
/// Provides fast lookup by artifact type name and link type name.
#[derive(Debug, Clone)]
pub struct Schema {
    pub artifact_types: HashMap<String, ArtifactTypeDef>,
    pub link_types: HashMap<String, LinkTypeDef>,
    pub inverse_map: HashMap<String, String>,
    pub traceability_rules: Vec<TraceabilityRule>,
}

impl Schema {
    /// Load a schema from a YAML file.
    pub fn load_file(path: &Path) -> Result<SchemaFile, Error> {
        let content = std::fs::read_to_string(path)
            .map_err(|e| Error::Io(format!("{}: {}", path.display(), e)))?;
        let schema_file: SchemaFile = serde_yaml::from_str(&content)
            .map_err(|e| Error::Schema(format!("{}: {}", path.display(), e)))?;
        Ok(schema_file)
    }

    /// Build a merged schema from multiple schema files.
    ///
    /// Later files override earlier ones for types/links with the same name.
    pub fn merge(files: &[SchemaFile]) -> Self {
        let mut artifact_types = HashMap::new();
        let mut link_types = HashMap::new();
        let mut inverse_map = HashMap::new();
        let mut traceability_rules = Vec::new();

        for file in files {
            for at in &file.artifact_types {
                artifact_types.insert(at.name.clone(), at.clone());
            }
            for lt in &file.link_types {
                if let Some(inv) = &lt.inverse {
                    inverse_map.insert(lt.name.clone(), inv.clone());
                    inverse_map.insert(inv.clone(), lt.name.clone());
                }
                link_types.insert(lt.name.clone(), lt.clone());
            }
            traceability_rules.extend(file.traceability_rules.iter().cloned());
        }

        Schema {
            artifact_types,
            link_types,
            inverse_map,
            traceability_rules,
        }
    }

    /// Look up an artifact type definition by name.
    pub fn artifact_type(&self, name: &str) -> Option<&ArtifactTypeDef> {
        self.artifact_types.get(name)
    }

    /// Look up a link type definition by name.
    pub fn link_type(&self, name: &str) -> Option<&LinkTypeDef> {
        self.link_types.get(name)
    }

    /// Get the inverse link type name, if one is defined.
    pub fn inverse_of(&self, link_type: &str) -> Option<&str> {
        self.inverse_map.get(link_type).map(|s| s.as_str())
    }
}
