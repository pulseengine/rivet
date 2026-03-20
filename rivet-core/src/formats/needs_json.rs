//! sphinx-needs `needs.json` import adapter.
//!
//! Reads artifacts from a sphinx-needs export file (`needs.json`).  The format
//! contains one or more named "versions", each holding a map of need items.
//! This adapter extracts needs from the current version (identified by the
//! `current_version` key) and converts them to Rivet artifacts.
//!
//! Example `needs.json` (abbreviated):
//!
//! ```json
//! {
//!   "current_version": "1.0",
//!   "versions": {
//!     "1.0": {
//!       "needs": {
//!         "stkh_req__safety": {
//!           "id": "stkh_req__safety",
//!           "type": "stkh_req",
//!           "title": "Automotive Safety",
//!           "description": "Support functional safety up to ASIL-B.",
//!           "status": "valid",
//!           "tags": ["safety"],
//!           "links": ["comp_req__safe_compute"]
//!         }
//!       }
//!     }
//!   }
//! }
//! ```
//!
//! ## Configuration
//!
//! When used through the adapter trait, the `AdapterConfig` entries support:
//!
//! - Keys of the form `type-mapping.<sphinx_type>` → `<rivet_type>` for
//!   explicit type renaming.
//! - `id-transform` → `preserve` to keep IDs as-is (default: underscores to
//!   dashes).
//! - `link-type` → override the default link type (default: `satisfies`).

use std::collections::{BTreeMap, HashMap};
use std::path::Path;

use serde::Deserialize;

use crate::adapter::{Adapter, AdapterConfig, AdapterSource};
use crate::error::Error;
use crate::model::{Artifact, Link};

// ---------------------------------------------------------------------------
// Public configuration types
// ---------------------------------------------------------------------------

/// Configuration for needs.json import.
#[derive(Debug, Clone, Default)]
pub struct NeedsJsonConfig {
    /// Map sphinx-needs type names to rivet schema type names.
    /// e.g., `"stkh_req"` → `"stkh-req"`.
    pub type_mapping: HashMap<String, String>,
    /// How to transform artifact IDs.
    pub id_transform: IdTransform,
    /// Link type to assign to forward links (default: `"satisfies"`).
    pub default_link_type: Option<String>,
}

/// Strategy for transforming sphinx-needs IDs into Rivet IDs.
#[derive(Debug, Clone, Default)]
pub enum IdTransform {
    /// Replace underscores with dashes (default).
    #[default]
    UnderscoresToDashes,
    /// Keep the original ID unchanged.
    Preserve,
}

// ---------------------------------------------------------------------------
// Serde models for the needs.json file
// ---------------------------------------------------------------------------

#[derive(Debug, Deserialize)]
struct NeedsJsonFile {
    current_version: Option<String>,
    #[serde(default)]
    versions: HashMap<String, NeedsVersion>,
}

#[derive(Debug, Deserialize)]
struct NeedsVersion {
    #[serde(default)]
    needs: HashMap<String, NeedsItem>,
}

#[derive(Debug, Deserialize)]
struct NeedsItem {
    id: String,
    #[serde(rename = "type")]
    need_type: Option<String>,
    #[serde(default)]
    title: Option<String>,
    #[serde(default)]
    description: Option<String>,
    #[serde(default)]
    status: Option<String>,
    #[serde(default)]
    tags: Vec<String>,
    #[serde(default)]
    links: Vec<String>,
    // Extra fields are preserved in the artifact's `fields` map.
    #[serde(flatten)]
    extra: HashMap<String, serde_json::Value>,
}

// ---------------------------------------------------------------------------
// Public import function (usable without the Adapter trait)
// ---------------------------------------------------------------------------

/// Parse a `needs.json` string and return Rivet artifacts.
///
/// This is the standalone entry point.  The [`NeedsJsonAdapter`] trait impl
/// delegates here.
pub fn import_needs_json(content: &str, config: &NeedsJsonConfig) -> Result<Vec<Artifact>, Error> {
    import_needs_json_inner(content, config, None)
}

fn import_needs_json_inner(
    content: &str,
    config: &NeedsJsonConfig,
    source: Option<&Path>,
) -> Result<Vec<Artifact>, Error> {
    let file: NeedsJsonFile = serde_json::from_str(content)
        .map_err(|e| Error::Adapter(format!("needs.json parse error: {e}")))?;

    // Pick the version to import: honour `current_version`, else take the
    // first (and often only) entry.
    let version = match &file.current_version {
        Some(cv) => file
            .versions
            .get(cv)
            .or_else(|| file.versions.get(""))
            .ok_or_else(|| {
                Error::Adapter(format!(
                    "needs.json: current_version \"{cv}\" not found in versions"
                ))
            })?,
        None => file
            .versions
            .values()
            .next()
            .ok_or_else(|| Error::Adapter("needs.json: no versions found".into()))?,
    };

    let link_type = config.default_link_type.as_deref().unwrap_or("satisfies");

    let mut artifacts: Vec<Artifact> = version
        .needs
        .values()
        .map(|item| convert_need(item, config, link_type, source))
        .collect();

    // Deterministic output order.
    artifacts.sort_by(|a, b| a.id.cmp(&b.id));

    Ok(artifacts)
}

fn transform_id(id: &str, transform: &IdTransform) -> String {
    match transform {
        IdTransform::UnderscoresToDashes => id.replace('_', "-"),
        IdTransform::Preserve => id.to_owned(),
    }
}

fn map_type(sphinx_type: &str, mapping: &HashMap<String, String>) -> String {
    if let Some(mapped) = mapping.get(sphinx_type) {
        return mapped.clone();
    }
    // Default: replace underscores with dashes.
    sphinx_type.replace('_', "-")
}

/// Keys produced by sphinx-needs that are already captured in first-class
/// Artifact fields or are display-only metadata.  We exclude these from
/// the `fields` map to avoid redundancy.
const EXCLUDED_EXTRA_KEYS: &[&str] = &[
    "links_back",
    "is_need",
    "is_part",
    "type_name",
    "type_prefix",
    "type_color",
    "type_style",
    "docname",
    "sections",
    "content",
    "constraints",
    "constraints_passed",
    "constraints_results",
    "parent_need",
    "parent_needs",
    "has_dead_links",
    "has_forbidden_dead_links",
    "arch",
    "external_css",
    "external_url",
    "full_title",
    "hide",
    "hide_tags",
    "hide_status",
    "collapse",
    "layout",
    "style",
    "delete",
    "jinja_content",
    "template",
    "pre_template",
    "post_template",
    "is_external",
    "is_modified",
    "modifications",
    "doctype",
    "target_id",
    "parts",
    "id_parent",
    "id_complete",
    "signature",
    "prefix",
    "url",
    "max_content_lines",
];

fn json_value_to_yaml(v: &serde_json::Value) -> serde_yaml::Value {
    match v {
        serde_json::Value::Null => serde_yaml::Value::Null,
        serde_json::Value::Bool(b) => serde_yaml::Value::Bool(*b),
        serde_json::Value::Number(n) => {
            if let Some(i) = n.as_i64() {
                serde_yaml::Value::Number(serde_yaml::Number::from(i))
            } else if let Some(f) = n.as_f64() {
                serde_yaml::Value::Number(serde_yaml::Number::from(f))
            } else {
                serde_yaml::Value::String(n.to_string())
            }
        }
        serde_json::Value::String(s) => serde_yaml::Value::String(s.clone()),
        serde_json::Value::Array(arr) => {
            serde_yaml::Value::Sequence(arr.iter().map(json_value_to_yaml).collect())
        }
        serde_json::Value::Object(map) => {
            let mapping = map
                .iter()
                .map(|(k, v)| (serde_yaml::Value::String(k.clone()), json_value_to_yaml(v)))
                .collect();
            serde_yaml::Value::Mapping(mapping)
        }
    }
}

fn convert_need(
    item: &NeedsItem,
    config: &NeedsJsonConfig,
    link_type: &str,
    source: Option<&Path>,
) -> Artifact {
    let id = transform_id(&item.id, &config.id_transform);
    let artifact_type = map_type(
        item.need_type.as_deref().unwrap_or("unknown"),
        &config.type_mapping,
    );
    let title = item.title.clone().unwrap_or_else(|| id.clone());

    // Convert forward links.
    let links: Vec<Link> = item
        .links
        .iter()
        .map(|target| Link {
            link_type: link_type.to_owned(),
            target: transform_id(target, &config.id_transform),
        })
        .collect();

    // Status: sphinx-needs uses empty string for "no status".
    let status = item
        .status
        .as_deref()
        .filter(|s| !s.is_empty())
        .map(|s| s.to_owned());

    let description = item
        .description
        .as_deref()
        .filter(|s| !s.is_empty())
        .map(|s| s.to_owned());

    // Preserve interesting extra fields.
    let mut fields = BTreeMap::new();
    for (k, v) in &item.extra {
        if EXCLUDED_EXTRA_KEYS.contains(&k.as_str()) {
            continue;
        }
        // Skip null / empty-string / empty-array values.
        match v {
            serde_json::Value::Null => continue,
            serde_json::Value::String(s) if s.is_empty() => continue,
            serde_json::Value::Array(a) if a.is_empty() => continue,
            _ => {}
        }
        fields.insert(k.replace('_', "-"), json_value_to_yaml(v));
    }

    Artifact {
        id,
        artifact_type,
        title,
        description,
        status,
        tags: item.tags.clone(),
        links,
        fields,
        source_file: source.map(|p| p.to_path_buf()),
    }
}

// ---------------------------------------------------------------------------
// Adapter trait implementation
// ---------------------------------------------------------------------------

/// Adapter for importing sphinx-needs `needs.json` files.
pub struct NeedsJsonAdapter {
    supported: Vec<String>,
}

impl NeedsJsonAdapter {
    pub fn new() -> Self {
        Self { supported: vec![] }
    }
}

impl Default for NeedsJsonAdapter {
    fn default() -> Self {
        Self::new()
    }
}

impl Adapter for NeedsJsonAdapter {
    fn id(&self) -> &str {
        "needs-json"
    }

    fn name(&self) -> &str {
        "sphinx-needs JSON"
    }

    fn supported_types(&self) -> &[String] {
        &self.supported
    }

    fn import(
        &self,
        source: &AdapterSource,
        config: &AdapterConfig,
    ) -> Result<Vec<Artifact>, Error> {
        let nj_config = adapter_config_to_needs_config(config);

        match source {
            AdapterSource::Path(path) => {
                let content = std::fs::read_to_string(path)
                    .map_err(|e| Error::Io(format!("{}: {e}", path.display())))?;
                import_needs_json_inner(&content, &nj_config, Some(path))
            }
            AdapterSource::Bytes(bytes) => {
                let content = std::str::from_utf8(bytes)
                    .map_err(|e| Error::Adapter(format!("invalid UTF-8: {e}")))?;
                import_needs_json_inner(content, &nj_config, None)
            }
            AdapterSource::Directory(dir) => import_needs_json_directory(dir, &nj_config),
        }
    }

    fn export(&self, _artifacts: &[Artifact], _config: &AdapterConfig) -> Result<Vec<u8>, Error> {
        Err(Error::Adapter(
            "needs-json adapter does not support export".into(),
        ))
    }
}

/// Walk a directory for `*.json` files and import each as needs.json.
fn import_needs_json_directory(
    dir: &Path,
    config: &NeedsJsonConfig,
) -> Result<Vec<Artifact>, Error> {
    let mut artifacts = Vec::new();
    let entries =
        std::fs::read_dir(dir).map_err(|e| Error::Io(format!("{}: {e}", dir.display())))?;

    for entry in entries {
        let entry = entry.map_err(|e| Error::Io(e.to_string()))?;
        let path = entry.path();
        if path.extension().is_some_and(|ext| ext == "json") {
            let content = std::fs::read_to_string(&path)
                .map_err(|e| Error::Io(format!("{}: {e}", path.display())))?;
            match import_needs_json_inner(&content, config, Some(&path)) {
                Ok(arts) => artifacts.extend(arts),
                Err(e) => log::warn!("skipping {}: {e}", path.display()),
            }
        } else if path.is_dir() {
            artifacts.extend(import_needs_json_directory(&path, config)?);
        }
    }

    Ok(artifacts)
}

/// Convert flat `AdapterConfig` entries into a structured `NeedsJsonConfig`.
///
/// Recognised keys:
/// - `type-mapping.<sphinx_type>` = `<rivet_type>`
/// - `id-transform` = `preserve` | `underscores-to-dashes` (default)
/// - `link-type` = `<type>` (default: `satisfies`)
fn adapter_config_to_needs_config(config: &AdapterConfig) -> NeedsJsonConfig {
    let mut type_mapping = HashMap::new();

    for (key, value) in &config.entries {
        if let Some(sphinx_type) = key.strip_prefix("type-mapping.") {
            type_mapping.insert(sphinx_type.to_owned(), value.clone());
        }
    }

    let id_transform = match config.get("id-transform") {
        Some("preserve") => IdTransform::Preserve,
        _ => IdTransform::UnderscoresToDashes,
    };

    let default_link_type = config.get("link-type").map(|s| s.to_owned());

    NeedsJsonConfig {
        type_mapping,
        id_transform,
        default_link_type,
    }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

#[cfg(test)]
mod tests {
    use super::*;

    /// Helper: build a minimal needs.json string.
    fn minimal_needs_json(needs_body: &str) -> String {
        format!(
            r#"{{
                "current_version": "1.0",
                "versions": {{
                    "1.0": {{
                        "needs": {{ {needs_body} }}
                    }}
                }}
            }}"#
        )
    }

    fn one_need() -> String {
        minimal_needs_json(
            r#"
            "stkh_req__safety": {
                "id": "stkh_req__safety",
                "type": "stkh_req",
                "title": "Automotive Safety",
                "description": "Support ASIL-B.",
                "status": "valid",
                "tags": ["safety", "asil"],
                "links": ["comp_req__safe_compute"],
                "is_need": true,
                "is_part": false,
                "type_name": "Stakeholder Requirement"
            }
            "#,
        )
    }

    // ----- Test: minimal parse ------------------------------------------

    // rivet: verifies REQ-025
    #[test]
    fn parse_minimal_one_need() {
        let json = one_need();
        let arts = import_needs_json(&json, &Default::default()).unwrap();
        assert_eq!(arts.len(), 1);
        let a = &arts[0];
        assert_eq!(a.id, "stkh-req--safety");
        assert_eq!(a.artifact_type, "stkh-req");
        assert_eq!(a.title, "Automotive Safety");
        assert_eq!(a.description.as_deref(), Some("Support ASIL-B."));
        assert_eq!(a.status.as_deref(), Some("valid"));
        assert_eq!(a.tags, vec!["safety", "asil"]);
    }

    // ----- Test: type mapping -------------------------------------------

    // rivet: verifies REQ-025
    #[test]
    fn type_mapping_transforms_types() {
        let json = one_need();
        let mut mapping = HashMap::new();
        mapping.insert("stkh_req".into(), "stakeholder-requirement".into());

        let config = NeedsJsonConfig {
            type_mapping: mapping,
            ..Default::default()
        };
        let arts = import_needs_json(&json, &config).unwrap();
        assert_eq!(arts[0].artifact_type, "stakeholder-requirement");
    }

    // ----- Test: ID transform -------------------------------------------

    // rivet: verifies REQ-025
    #[test]
    fn id_transform_underscores_to_dashes() {
        let json = one_need();
        let arts = import_needs_json(&json, &Default::default()).unwrap();
        assert_eq!(arts[0].id, "stkh-req--safety");
        // Link targets also transformed.
        assert_eq!(arts[0].links[0].target, "comp-req--safe-compute");
    }

    // rivet: verifies REQ-025
    #[test]
    fn id_transform_preserve() {
        let json = one_need();
        let config = NeedsJsonConfig {
            id_transform: IdTransform::Preserve,
            ..Default::default()
        };
        let arts = import_needs_json(&json, &config).unwrap();
        assert_eq!(arts[0].id, "stkh_req__safety");
        assert_eq!(arts[0].links[0].target, "comp_req__safe_compute");
    }

    // ----- Test: links converted ----------------------------------------

    // rivet: verifies REQ-025
    #[test]
    fn links_converted_to_link_structs() {
        let json = one_need();
        let arts = import_needs_json(&json, &Default::default()).unwrap();
        assert_eq!(arts[0].links.len(), 1);
        assert_eq!(arts[0].links[0].link_type, "satisfies");
        assert_eq!(arts[0].links[0].target, "comp-req--safe-compute");
    }

    // rivet: verifies REQ-025
    #[test]
    fn custom_link_type() {
        let json = one_need();
        let config = NeedsJsonConfig {
            default_link_type: Some("traces-to".into()),
            ..Default::default()
        };
        let arts = import_needs_json(&json, &config).unwrap();
        assert_eq!(arts[0].links[0].link_type, "traces-to");
    }

    // ----- Test: extra fields preserved ---------------------------------

    // rivet: verifies REQ-025
    #[test]
    fn extra_fields_preserved() {
        let json = minimal_needs_json(
            r#"
            "req__abc": {
                "id": "req__abc",
                "type": "req",
                "title": "ABC",
                "status": "",
                "tags": [],
                "links": [],
                "priority": "high",
                "safety_level": "ASIL-B"
            }
            "#,
        );
        let arts = import_needs_json(&json, &Default::default()).unwrap();
        let a = &arts[0];
        // Extra fields should be present (underscores replaced with dashes in keys).
        assert_eq!(
            a.fields.get("priority"),
            Some(&serde_yaml::Value::String("high".into()))
        );
        assert_eq!(
            a.fields.get("safety-level"),
            Some(&serde_yaml::Value::String("ASIL-B".into()))
        );
        // Empty status should become None.
        assert!(a.status.is_none());
    }

    // ----- Test: empty needs.json ---------------------------------------

    // rivet: verifies REQ-025
    #[test]
    fn empty_needs_produces_empty_vec() {
        let json = minimal_needs_json("");
        let arts = import_needs_json(&json, &Default::default()).unwrap();
        assert!(arts.is_empty());
    }

    // ----- Test: invalid JSON returns error ------------------------------

    // rivet: verifies REQ-025
    #[test]
    fn invalid_json_returns_error() {
        let result = import_needs_json("NOT JSON {{{", &Default::default());
        assert!(result.is_err());
        let err = result.unwrap_err();
        assert!(
            err.to_string().contains("parse error"),
            "unexpected error: {err}"
        );
    }

    // ----- Test: missing versions key -----------------------------------

    // rivet: verifies REQ-025
    #[test]
    fn no_versions_returns_error() {
        let json = r#"{ "current_version": "1.0", "versions": {} }"#;
        let result = import_needs_json(json, &Default::default());
        assert!(result.is_err());
    }

    // ----- Test: multi-need with links between them ---------------------

    // rivet: verifies REQ-025
    #[test]
    fn multiple_needs_with_inter_links() {
        let json = minimal_needs_json(
            r#"
            "stkh_req__perf": {
                "id": "stkh_req__perf",
                "type": "stkh_req",
                "title": "Performance",
                "status": "valid",
                "tags": [],
                "links": ["comp_req__fast"]
            },
            "comp_req__fast": {
                "id": "comp_req__fast",
                "type": "comp_req",
                "title": "Fast Processing",
                "status": "draft",
                "tags": ["perf"],
                "links": []
            }
            "#,
        );
        let arts = import_needs_json(&json, &Default::default()).unwrap();
        assert_eq!(arts.len(), 2);
        // Sorted by ID.
        assert_eq!(arts[0].id, "comp-req--fast");
        assert_eq!(arts[1].id, "stkh-req--perf");
        assert_eq!(arts[1].links[0].target, "comp-req--fast");
    }

    // ----- Test: adapter config conversion ------------------------------

    // rivet: verifies REQ-025
    #[test]
    fn adapter_config_to_needs_config_round_trip() {
        let mut entries = BTreeMap::new();
        entries.insert("type-mapping.stkh_req".into(), "stakeholder-req".into());
        entries.insert("type-mapping.comp_req".into(), "component-req".into());
        entries.insert("id-transform".into(), "preserve".into());
        entries.insert("link-type".into(), "derives-from".into());

        let ac = AdapterConfig { entries };
        let nc = adapter_config_to_needs_config(&ac);

        assert_eq!(
            nc.type_mapping.get("stkh_req"),
            Some(&"stakeholder-req".to_owned())
        );
        assert_eq!(
            nc.type_mapping.get("comp_req"),
            Some(&"component-req".to_owned())
        );
        assert!(matches!(nc.id_transform, IdTransform::Preserve));
        assert_eq!(nc.default_link_type.as_deref(), Some("derives-from"));
    }

    // ----- Test: version fallback (empty-string key) --------------------

    // rivet: verifies REQ-025
    #[test]
    fn version_fallback_empty_string_key() {
        let json = r#"{
            "current_version": "",
            "versions": {
                "": {
                    "needs": {
                        "req__x": {
                            "id": "req__x",
                            "type": "req",
                            "title": "X"
                        }
                    }
                }
            }
        }"#;
        let arts = import_needs_json(json, &Default::default()).unwrap();
        assert_eq!(arts.len(), 1);
        assert_eq!(arts[0].id, "req--x");
    }
}
