use std::collections::BTreeMap;
use std::path::PathBuf;

use serde::{Deserialize, Serialize};

/// Unique identifier for an artifact (e.g., "L-1", "H-3.2", "SWREQ-012").
pub type ArtifactId = String;

/// Statuses that indicate an artifact should be fully traced in the lifecycle.
pub const TRACED_STATUSES: &[&str] = &["implemented", "done", "approved", "accepted", "verified"];

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
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
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
    #[inline]
    pub fn links_of_type(&self, link_type: &str) -> Vec<&ArtifactId> {
        self.links
            .iter()
            .filter(|l| l.link_type == link_type)
            .map(|l| &l.target)
            .collect()
    }

    /// Check whether this artifact has any link of the given type.
    #[inline]
    pub fn has_link_type(&self, link_type: &str) -> bool {
        self.links.iter().any(|l| l.link_type == link_type)
    }

    /// Return the baseline this artifact belongs to, if any.
    ///
    /// The baseline is read from the `baseline` key in the `fields` map
    /// rather than being a first-class struct field, keeping the data
    /// model backward-compatible.
    pub fn baseline(&self) -> Option<&str> {
        self.fields.get("baseline").and_then(|v| v.as_str())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::test_helpers::minimal_artifact;

    #[test]
    fn artifact_baseline_returns_field_value() {
        let mut a = minimal_artifact("A-1", "req");
        a.fields.insert(
            "baseline".into(),
            serde_yaml::Value::String("v0.2.0".into()),
        );
        assert_eq!(a.baseline(), Some("v0.2.0"));
    }

    #[test]
    fn artifact_baseline_returns_none_when_missing() {
        let a = minimal_artifact("A-1", "req");
        assert_eq!(a.baseline(), None);
    }

    #[test]
    fn artifact_baseline_returns_none_for_non_string() {
        let mut a = minimal_artifact("A-1", "req");
        a.fields
            .insert("baseline".into(), serde_yaml::Value::Bool(true));
        assert_eq!(a.baseline(), None);
    }

    #[test]
    fn baseline_config_deserializes() {
        let yaml = r#"
name: v0.1.0
description: Initial release
"#;
        let config: BaselineConfig = serde_yaml::from_str(yaml).unwrap();
        assert_eq!(config.name, "v0.1.0");
        assert_eq!(config.description.as_deref(), Some("Initial release"));
    }

    #[test]
    fn baseline_config_deserializes_without_description() {
        let yaml = "name: v0.2.0\n";
        let config: BaselineConfig = serde_yaml::from_str(yaml).unwrap();
        assert_eq!(config.name, "v0.2.0");
        assert_eq!(config.description, None);
    }

    #[test]
    fn baseline_config_list_deserializes() {
        let yaml = r#"
- name: v0.1.0
  description: First baseline
- name: v0.2.0
- name: v0.3.0
  description: Third baseline
"#;
        let configs: Vec<BaselineConfig> = serde_yaml::from_str(yaml).unwrap();
        assert_eq!(configs.len(), 3);
        assert_eq!(configs[0].name, "v0.1.0");
        assert_eq!(configs[1].description, None);
        assert_eq!(configs[2].name, "v0.3.0");
    }
}

/// Configuration for a named baseline (release scope).
///
/// Baselines are declared in order in `rivet.yaml`. Validation and
/// coverage can be scoped to a baseline, which cumulatively includes
/// all artifacts from earlier baselines.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BaselineConfig {
    pub name: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
}

/// Configuration for commit-to-artifact traceability.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CommitsConfig {
    #[serde(default = "default_commits_format")]
    pub format: String,
    #[serde(default)]
    pub trailers: BTreeMap<String, String>,
    #[serde(default, rename = "exempt-types")]
    pub exempt_types: Vec<String>,
    #[serde(default = "default_skip_trailer", rename = "skip-trailer")]
    pub skip_trailer: String,
    #[serde(default, rename = "traced-paths")]
    pub traced_paths: Vec<String>,
    #[serde(default, rename = "trace-exempt-artifacts")]
    pub trace_exempt_artifacts: Vec<String>,
}

fn default_commits_format() -> String {
    "trailers".into()
}

fn default_skip_trailer() -> String {
    "Trace: skip".into()
}

/// Configuration for a single external project dependency.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ExternalProject {
    /// Git clone URL (mutually exclusive with `path`).
    #[serde(default)]
    pub git: Option<String>,
    /// Local filesystem path (mutually exclusive with `git`).
    #[serde(default)]
    pub path: Option<String>,
    /// Git ref to checkout (branch, tag, or commit SHA).
    #[serde(default, rename = "ref")]
    pub git_ref: Option<String>,
    /// Short prefix used in cross-links (e.g., "rivet" for "rivet:REQ-001").
    pub prefix: String,
}

/// Project configuration loaded from `rivet.yaml`.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProjectConfig {
    pub project: ProjectMetadata,
    #[serde(default)]
    pub sources: Vec<SourceConfig>,
    /// Directories containing markdown documents (with YAML frontmatter).
    #[serde(default)]
    pub docs: Vec<String>,
    /// Directory containing test result YAML files.
    #[serde(default)]
    pub results: Option<String>,
    /// Commit traceability configuration.
    #[serde(default)]
    pub commits: Option<CommitsConfig>,
    /// External project dependencies for cross-repo linking.
    #[serde(default)]
    pub externals: Option<BTreeMap<String, ExternalProject>>,
    /// Named baselines for scoped validation and coverage.
    /// Order matters: earlier baselines are cumulatively included in later ones.
    #[serde(default)]
    pub baselines: Option<Vec<BaselineConfig>>,
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
    /// Path to a WASM adapter component (only used when `format: "wasm"`).
    #[serde(default)]
    pub adapter: Option<String>,
    #[serde(default)]
    pub config: BTreeMap<String, String>,
}
