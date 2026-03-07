use std::collections::BTreeMap;
use std::path::PathBuf;

use serde::{Deserialize, Serialize};

/// Unique identifier for an artifact (e.g., "L-1", "H-3.2", "SWREQ-012").
pub type ArtifactId = String;

/// A typed, directional link from one artifact to another.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct Link {
    /// Semantic type of this link (e.g., "leads-to-loss", "verifies").
    pub link_type: String,
    /// Target artifact ID.
    pub target: ArtifactId,
}

/// An artifact — the fundamental unit of the data model.
///
/// Artifacts represent any lifecycle element: requirements, architecture
/// components, test specifications, STPA losses/hazards/UCAs, etc.
/// The `artifact_type` field determines which schema rules apply.
///
/// Base fields (`id`, `title`, `description`, `status`, `tags`, `links`)
/// are first-class struct members.  Domain-specific properties live in the
/// `fields` map and are validated against the schema.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Artifact {
    /// Unique identifier.
    pub id: ArtifactId,

    /// Type name — must match an artifact type defined in a loaded schema.
    pub artifact_type: String,

    /// Human-readable title.
    pub title: String,

    /// Detailed description (supports markdown).
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,

    /// Lifecycle status (e.g., "draft", "approved", "obsolete").
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub status: Option<String>,

    /// Arbitrary tags for categorization and filtering.
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub tags: Vec<String>,

    /// Typed links to other artifacts.
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub links: Vec<Link>,

    /// Domain-specific fields (validated against schema).
    #[serde(default, skip_serializing_if = "BTreeMap::is_empty")]
    pub fields: BTreeMap<String, serde_yaml::Value>,

    /// Source file this artifact was loaded from.
    #[serde(skip)]
    pub source_file: Option<PathBuf>,
}

impl Artifact {
    /// Return all link targets of a given link type.
    pub fn links_of_type(&self, link_type: &str) -> Vec<&ArtifactId> {
        self.links
            .iter()
            .filter(|l| l.link_type == link_type)
            .map(|l| &l.target)
            .collect()
    }

    /// Check whether this artifact has any link of the given type.
    pub fn has_link_type(&self, link_type: &str) -> bool {
        self.links.iter().any(|l| l.link_type == link_type)
    }
}

/// Project configuration loaded from `trace.yaml`.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProjectConfig {
    pub project: ProjectMetadata,
    #[serde(default)]
    pub sources: Vec<SourceConfig>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProjectMetadata {
    pub name: String,
    #[serde(default)]
    pub version: Option<String>,
    #[serde(default)]
    pub schemas: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SourceConfig {
    pub path: String,
    pub format: String,
    #[serde(default)]
    pub config: BTreeMap<String, String>,
}
