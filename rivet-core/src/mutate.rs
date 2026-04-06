//! Mutation operations for artifacts.
//!
//! All mutations are schema-validated **before** any file write (DD-028).
//! This module provides:
//! - `next_id`: compute the next sequential ID for a given prefix
//! - `validate_add`: validate a new artifact against the schema
//! - `validate_link`: validate a link addition against the schema
//! - `validate_modify`: validate field modifications against the schema
//!
//! YAML file manipulation is delegated to [`crate::yaml_edit`].

use std::path::{Path, PathBuf};

use crate::error::Error;
use crate::links::LinkGraph;
use crate::model::{Artifact, Link};
use crate::schema::Schema;
use crate::store::Store;

// ── ID generation ────────────────────────────────────────────────────────

/// Derive the ID prefix for an artifact type by inspecting existing artifacts
/// in the store.
///
/// Scans all artifacts of the given type, extracts the prefix from their IDs
/// (the part before the last `-NNN` numeric suffix), and returns the first
/// consistent prefix found.
///
/// **Fallback:** if the store has no artifacts of this type, generates a prefix
/// by uppercasing the type name and stripping hyphens (e.g. `"sw-req"` becomes
/// `"SWREQ"`).
pub fn prefix_for_type(artifact_type: &str, store: &Store) -> String {
    // Scan existing artifacts of this type to learn the prefix convention.
    for id_str in store.by_type(artifact_type) {
        if let Some(dash_pos) = id_str.rfind('-') {
            let prefix = &id_str[..dash_pos];
            let suffix = &id_str[dash_pos + 1..];
            // Verify the suffix is purely numeric (i.e. this is a PREFIX-NNN id).
            if !suffix.is_empty() && suffix.chars().all(|c| c.is_ascii_digit()) {
                return prefix.to_string();
            }
        }
    }

    // Fallback: uppercase the type name with hyphens removed.
    artifact_type
        .split('-')
        .flat_map(|seg| seg.chars())
        .map(|c| c.to_ascii_uppercase())
        .collect()
}

/// Scan the store for the highest numeric suffix with the given prefix and
/// return the next ID. E.g. if `REQ-031` exists, returns `REQ-032`.
///
/// The prefix should NOT include the trailing dash — it is added automatically.
pub fn next_id(store: &Store, prefix: &str) -> String {
    let dash_prefix = format!("{prefix}-");
    let mut max_num: u32 = 0;

    for artifact in store.iter() {
        if let Some(suffix) = artifact.id.strip_prefix(&dash_prefix) {
            if let Ok(n) = suffix.parse::<u32>() {
                if n > max_num {
                    max_num = n;
                }
            }
        }
    }

    let next = max_num + 1;
    // Determine zero-pad width from existing IDs (default 3)
    let width = store
        .iter()
        .filter_map(|a| a.id.strip_prefix(&dash_prefix))
        .filter_map(|s| {
            if s.parse::<u32>().is_ok() {
                Some(s.len())
            } else {
                None
            }
        })
        .max()
        .unwrap_or(3);

    format!("{prefix}-{next:0>width$}")
}

// ── Validation ──────────────────────────────────────────────────────────

/// Validate that a new artifact can be added to the store.
pub fn validate_add(artifact: &Artifact, store: &Store, schema: &Schema) -> Result<(), Error> {
    // Type must exist in schema
    let type_def = schema
        .artifact_type(&artifact.artifact_type)
        .ok_or_else(|| {
            Error::Validation(format!(
                "unknown artifact type '{}'",
                artifact.artifact_type
            ))
        })?;

    // ID must not already exist
    if store.contains(&artifact.id) {
        return Err(Error::Validation(format!(
            "artifact ID '{}' already exists",
            artifact.id
        )));
    }

    // Check required fields
    for field in &type_def.fields {
        if field.required && !artifact.fields.contains_key(&field.name) {
            let has_base = match field.name.as_str() {
                "description" => artifact.description.is_some(),
                "status" => artifact.status.is_some(),
                _ => false,
            };
            if !has_base {
                return Err(Error::Validation(format!(
                    "missing required field '{}' for type '{}'",
                    field.name, artifact.artifact_type
                )));
            }
        }
    }

    // Check allowed values
    for field in &type_def.fields {
        if let Some(allowed) = &field.allowed_values {
            if let Some(value) = artifact.fields.get(&field.name) {
                if let Some(s) = value.as_str() {
                    if !allowed.contains(&s.to_string()) {
                        return Err(Error::Validation(format!(
                            "field '{}' has value '{}', allowed: {:?}",
                            field.name, s, allowed
                        )));
                    }
                }
            }
        }
    }

    // Check status allowed values (if schema defines them via base-fields)
    // Status is a base field and generally freeform, but we'll accept it

    // Validate link types
    for link in &artifact.links {
        if schema.link_type(&link.link_type).is_none() {
            return Err(Error::Validation(format!(
                "unknown link type '{}'",
                link.link_type
            )));
        }
    }

    Ok(())
}

/// Validate that a link can be added.
///
/// External targets (IDs containing `:`, e.g. `meld:SH-1`) are accepted even
/// when they are not present in the store, because the external repository may
/// not be cached locally.  When the external artifact *is* loaded in the store
/// (prefixed), the normal duplicate-link check still applies.
pub fn validate_link(
    source_id: &str,
    link_type: &str,
    target_id: &str,
    store: &Store,
    schema: &Schema,
) -> Result<(), Error> {
    // Source must exist (always local)
    if !store.contains(source_id) {
        return Err(Error::Validation(format!(
            "source artifact '{}' does not exist",
            source_id
        )));
    }

    // Target must exist — but external refs (containing ':') are allowed even
    // when the external repo is not loaded, since the remote artifacts may not
    // be cached.
    let target_is_external = target_id.contains(':');
    if !store.contains(target_id) && !target_is_external {
        return Err(Error::Validation(format!(
            "target artifact '{}' does not exist",
            target_id
        )));
    }

    // Link type must exist in schema
    if schema.link_type(link_type).is_none() {
        return Err(Error::Validation(format!(
            "unknown link type '{}'",
            link_type
        )));
    }

    // Check for duplicate link
    let source = store.get(source_id).unwrap();
    if source
        .links
        .iter()
        .any(|l| l.link_type == link_type && l.target == target_id)
    {
        return Err(Error::Validation(format!(
            "link '{} -> {} ({})'  already exists",
            source_id, target_id, link_type
        )));
    }

    Ok(())
}

/// Validate that an unlink operation is valid.
pub fn validate_unlink(
    source_id: &str,
    link_type: &str,
    target_id: &str,
    store: &Store,
) -> Result<(), Error> {
    let source = store.get(source_id).ok_or_else(|| {
        Error::Validation(format!("source artifact '{}' does not exist", source_id))
    })?;

    if !source
        .links
        .iter()
        .any(|l| l.link_type == link_type && l.target == target_id)
    {
        return Err(Error::Validation(format!(
            "no link '{} -> {} ({})' found",
            source_id, target_id, link_type
        )));
    }

    Ok(())
}

/// Parameters for a modify operation.
#[derive(Debug, Default)]
pub struct ModifyParams {
    pub set_status: Option<String>,
    pub set_title: Option<String>,
    pub add_tags: Vec<String>,
    pub remove_tags: Vec<String>,
    pub set_fields: Vec<(String, String)>,
}

/// Validate that a modify operation is valid.
pub fn validate_modify(
    id: &str,
    params: &ModifyParams,
    store: &Store,
    schema: &Schema,
) -> Result<(), Error> {
    let artifact = store
        .get(id)
        .ok_or_else(|| Error::Validation(format!("artifact '{}' does not exist", id)))?;

    let type_def = schema
        .artifact_type(&artifact.artifact_type)
        .ok_or_else(|| {
            Error::Validation(format!(
                "unknown artifact type '{}'",
                artifact.artifact_type
            ))
        })?;

    // Validate field allowed values
    for (key, value) in &params.set_fields {
        if let Some(field) = type_def.fields.iter().find(|f| f.name == *key) {
            if let Some(allowed) = &field.allowed_values {
                if !allowed.contains(value) {
                    return Err(Error::Validation(format!(
                        "field '{}' value '{}' not in allowed values: {:?}",
                        key, value, allowed
                    )));
                }
            }
        }
    }

    Ok(())
}

/// Validate that a remove operation is valid.
/// Returns the list of incoming link source IDs if any exist and `force` is false.
pub fn validate_remove(
    id: &str,
    force: bool,
    store: &Store,
    graph: &LinkGraph,
) -> Result<(), Error> {
    if !store.contains(id) {
        return Err(Error::Validation(format!(
            "artifact '{}' does not exist",
            id
        )));
    }

    if !force {
        let backlinks = graph.backlinks_to(id);
        if !backlinks.is_empty() {
            let sources: Vec<String> = backlinks
                .iter()
                .map(|bl| format!("{} ({})", bl.source, bl.link_type))
                .collect();
            return Err(Error::Validation(format!(
                "artifact '{}' has {} incoming link(s): {}. Use --force to remove anyway.",
                id,
                backlinks.len(),
                sources.join(", ")
            )));
        }
    }

    Ok(())
}

// ── File operations ─────────────────────────────────────────────────────

/// Find the source file for an artifact by scanning the store.
pub fn find_source_file(id: &str, store: &Store) -> Option<PathBuf> {
    store.get(id).and_then(|a| a.source_file.clone())
}

/// Find the appropriate file for a new artifact of a given type by looking
/// at where existing artifacts of that type are stored.
pub fn find_file_for_type(artifact_type: &str, store: &Store) -> Option<PathBuf> {
    for artifact in store.iter() {
        if artifact.artifact_type == artifact_type {
            if let Some(ref path) = artifact.source_file {
                return Some(path.clone());
            }
        }
    }
    None
}

/// Append a new artifact to a YAML file that uses the `artifacts:` list format.
pub fn append_artifact_to_file(artifact: &Artifact, file_path: &Path) -> Result<(), Error> {
    let content = std::fs::read_to_string(file_path)
        .map_err(|e| Error::Io(format!("{}: {}", file_path.display(), e)))?;

    let yaml_block = render_artifact_yaml(artifact);

    // Append to end of file
    let mut new_content = content;
    if !new_content.ends_with('\n') {
        new_content.push('\n');
    }
    new_content.push('\n');
    new_content.push_str(&yaml_block);

    std::fs::write(file_path, &new_content)
        .map_err(|e| Error::Io(format!("{}: {}", file_path.display(), e)))?;

    Ok(())
}

/// Render a single artifact as YAML suitable for appending under `artifacts:`.
fn render_artifact_yaml(artifact: &Artifact) -> String {
    let mut lines = Vec::new();

    lines.push(format!("  - id: {}", artifact.id));
    lines.push(format!("    type: {}", artifact.artifact_type));
    lines.push(format!("    title: {}", artifact.title));

    if let Some(ref status) = artifact.status {
        lines.push(format!("    status: {status}"));
    }

    if let Some(ref desc) = artifact.description {
        lines.push(format!("    description: >\n      {desc}"));
    }

    if !artifact.tags.is_empty() {
        let tag_list: Vec<String> = artifact.tags.clone();
        lines.push(format!("    tags: [{}]", tag_list.join(", ")));
    }

    if !artifact.fields.is_empty() {
        lines.push("    fields:".to_string());
        for (key, value) in &artifact.fields {
            let val_str = match value {
                serde_yaml::Value::String(s) => s.clone(),
                serde_yaml::Value::Number(n) => n.to_string(),
                serde_yaml::Value::Bool(b) => b.to_string(),
                other => serde_yaml::to_string(other)
                    .unwrap_or_default()
                    .trim()
                    .to_string(),
            };
            lines.push(format!("      {key}: {val_str}"));
        }
    }

    if !artifact.links.is_empty() {
        lines.push("    links:".to_string());
        for link in &artifact.links {
            lines.push(format!("      - type: {}", link.link_type));
            lines.push(format!("        target: {}", link.target));
        }
    }

    lines.join("\n") + "\n"
}

/// Add a link entry to an artifact in its YAML file.
///
/// Delegates to [`crate::yaml_edit`] for indentation-safe editing.
pub fn add_link_to_file(source_id: &str, link: &Link, file_path: &Path) -> Result<(), Error> {
    crate::yaml_edit::add_link_to_file(source_id, link, file_path)
}

/// Remove a link from an artifact in its YAML file.
///
/// Delegates to [`crate::yaml_edit`] for indentation-safe editing.
pub fn remove_link_from_file(
    source_id: &str,
    link_type: &str,
    target_id: &str,
    file_path: &Path,
) -> Result<(), Error> {
    crate::yaml_edit::remove_link_from_file(source_id, link_type, target_id, file_path)
}

/// Modify an artifact in its YAML file.
///
/// Delegates to [`crate::yaml_edit`] for indentation-safe editing.
pub fn modify_artifact_in_file(
    id: &str,
    params: &ModifyParams,
    file_path: &Path,
    store: &Store,
) -> Result<(), Error> {
    crate::yaml_edit::modify_artifact_in_file(id, params, file_path, store)
}

/// Remove an artifact from its YAML file.
///
/// Delegates to [`crate::yaml_edit`] for indentation-safe editing.
pub fn remove_artifact_from_file(artifact_id: &str, file_path: &Path) -> Result<(), Error> {
    crate::yaml_edit::remove_artifact_from_file(artifact_id, file_path)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::schema::*;
    use crate::test_helpers::{
        artifact_with_links, artifact_with_status, minimal_artifact, minimal_schema,
    };
    use std::collections::BTreeMap;

    fn make_test_schema() -> Schema {
        let mut schema_file = minimal_schema("test");
        schema_file.artifact_types = vec![
            ArtifactTypeDef {
                name: "requirement".to_string(),
                description: "A requirement".to_string(),
                fields: vec![FieldDef {
                    name: "priority".to_string(),
                    field_type: "string".to_string(),
                    required: false,
                    description: None,
                    allowed_values: Some(vec![
                        "must".to_string(),
                        "should".to_string(),
                        "could".to_string(),
                    ]),
                }],
                link_fields: vec![],
                aspice_process: None,
                common_mistakes: vec![],
                example: None,
                yaml_section: None,
                yaml_sections: vec![],
                shorthand_links: std::collections::BTreeMap::new(),
            },
            ArtifactTypeDef {
                name: "feature".to_string(),
                description: "A feature".to_string(),
                fields: vec![],
                link_fields: vec![],
                aspice_process: None,
                common_mistakes: vec![],
                example: None,
                yaml_section: None,
                yaml_sections: vec![],
                shorthand_links: std::collections::BTreeMap::new(),
            },
        ];
        schema_file.link_types = vec![LinkTypeDef {
            name: "satisfies".to_string(),
            inverse: Some("satisfied-by".to_string()),
            description: "Source satisfies target".to_string(),
            source_types: vec![],
            target_types: vec![],
        }];

        Schema::merge(&[schema_file])
    }

    fn make_test_store() -> Store {
        let mut store = Store::new();
        let mut req1 = artifact_with_status("REQ-001", "requirement", "draft");
        req1.title = "First req".to_string();
        req1.source_file = Some(PathBuf::from("artifacts/requirements.yaml"));
        store.insert(req1).unwrap();

        let mut req2 = minimal_artifact("REQ-002", "requirement");
        req2.title = "Second req".to_string();
        req2.source_file = Some(PathBuf::from("artifacts/requirements.yaml"));
        store.insert(req2).unwrap();

        let mut feat1 = artifact_with_links("FEAT-001", "feature", &[("satisfies", "REQ-001")]);
        feat1.title = "First feature".to_string();
        feat1.source_file = Some(PathBuf::from("artifacts/features.yaml"));
        store.insert(feat1).unwrap();

        store
    }

    // rivet: verifies REQ-031
    #[test]
    fn test_next_id() {
        let store = make_test_store();
        assert_eq!(next_id(&store, "REQ"), "REQ-003");
        assert_eq!(next_id(&store, "FEAT"), "FEAT-002");
        assert_eq!(next_id(&store, "DD"), "DD-001");
    }

    // rivet: verifies REQ-031
    #[test]
    fn test_prefix_for_type_from_store() {
        let store = make_test_store();
        // Derives prefix from existing artifacts in the store.
        assert_eq!(prefix_for_type("requirement", &store), "REQ");
        assert_eq!(prefix_for_type("feature", &store), "FEAT");
    }

    // rivet: verifies REQ-031
    #[test]
    fn test_prefix_for_type_fallback() {
        let store = Store::new();
        // No artifacts — falls back to uppercased type name with hyphens removed.
        assert_eq!(prefix_for_type("requirement", &store), "REQUIREMENT");
        assert_eq!(prefix_for_type("design-decision", &store), "DESIGNDECISION");
        assert_eq!(prefix_for_type("sw-req", &store), "SWREQ");
    }

    // rivet: verifies REQ-031
    #[test]
    fn test_validate_add_valid() {
        let schema = make_test_schema();
        let store = make_test_store();

        let artifact = artifact_with_status("REQ-003", "requirement", "draft");

        assert!(validate_add(&artifact, &store, &schema).is_ok());
    }

    // rivet: verifies REQ-031
    #[test]
    fn test_validate_add_unknown_type() {
        let schema = make_test_schema();
        let store = make_test_store();

        let artifact = minimal_artifact("FOO-001", "nonexistent-type");

        let err = validate_add(&artifact, &store, &schema).unwrap_err();
        assert!(
            err.to_string().contains("unknown artifact type"),
            "expected 'unknown artifact type' error, got: {err}"
        );
    }

    // rivet: verifies REQ-031
    #[test]
    fn test_validate_add_duplicate_id() {
        let schema = make_test_schema();
        let store = make_test_store();

        let artifact = minimal_artifact("REQ-001", "requirement");

        let err = validate_add(&artifact, &store, &schema).unwrap_err();
        assert!(err.to_string().contains("already exists"));
    }

    // rivet: verifies REQ-031
    #[test]
    fn test_validate_add_bad_field_value() {
        let schema = make_test_schema();
        let store = make_test_store();

        let mut fields = BTreeMap::new();
        fields.insert(
            "priority".to_string(),
            serde_yaml::Value::String("critical".to_string()),
        );

        let mut artifact = minimal_artifact("REQ-099", "requirement");
        artifact.title = "Bad field value".to_string();
        artifact.fields = fields;

        let err = validate_add(&artifact, &store, &schema).unwrap_err();
        assert!(err.to_string().contains("allowed"));
    }

    // rivet: verifies REQ-031
    #[test]
    fn test_validate_link_valid() {
        let schema = make_test_schema();
        let store = make_test_store();

        assert!(validate_link("REQ-002", "satisfies", "REQ-001", &store, &schema).is_ok());
    }

    // rivet: verifies REQ-031
    #[test]
    fn test_validate_link_unknown_type() {
        let schema = make_test_schema();
        let store = make_test_store();

        let err =
            validate_link("REQ-001", "nonexistent-link", "REQ-002", &store, &schema).unwrap_err();
        assert!(err.to_string().contains("unknown link type"));
    }

    // rivet: verifies REQ-031
    #[test]
    fn test_validate_link_missing_source() {
        let schema = make_test_schema();
        let store = make_test_store();

        let err = validate_link("NOPE-001", "satisfies", "REQ-001", &store, &schema).unwrap_err();
        assert!(err.to_string().contains("does not exist"));
    }

    // rivet: verifies REQ-031
    #[test]
    fn test_validate_link_missing_target() {
        let schema = make_test_schema();
        let store = make_test_store();

        let err = validate_link("REQ-001", "satisfies", "NOPE-001", &store, &schema).unwrap_err();
        assert!(err.to_string().contains("does not exist"));
    }

    // rivet: verifies REQ-031
    #[test]
    fn test_validate_remove_with_backlinks() {
        let store = make_test_store();
        let schema = make_test_schema();
        let graph = LinkGraph::build(&store, &schema);

        // REQ-001 has an incoming link from FEAT-001
        let err = validate_remove("REQ-001", false, &store, &graph).unwrap_err();
        assert!(err.to_string().contains("incoming link"));
        assert!(err.to_string().contains("FEAT-001"));

        // With force, it should succeed
        assert!(validate_remove("REQ-001", true, &store, &graph).is_ok());
    }

    // rivet: verifies REQ-031
    #[test]
    fn test_validate_remove_no_backlinks() {
        let store = make_test_store();
        let schema = make_test_schema();
        let graph = LinkGraph::build(&store, &schema);

        // FEAT-001 has no incoming links
        assert!(validate_remove("FEAT-001", false, &store, &graph).is_ok());
    }

    // rivet: verifies REQ-031
    #[test]
    fn test_validate_remove_nonexistent() {
        let store = make_test_store();
        let schema = make_test_schema();
        let graph = LinkGraph::build(&store, &schema);

        let err = validate_remove("NOPE-001", false, &store, &graph).unwrap_err();
        assert!(err.to_string().contains("does not exist"));
    }

    // rivet: verifies REQ-031
    #[test]
    fn test_render_artifact_yaml() {
        let mut artifact =
            artifact_with_links("REQ-099", "requirement", &[("satisfies", "REQ-001")]);
        artifact.title = "Test artifact".to_string();
        artifact.description = Some("A description".to_string());
        artifact.status = Some("draft".to_string());
        artifact.tags = vec!["core".to_string(), "test".to_string()];

        let yaml = render_artifact_yaml(&artifact);
        assert!(yaml.contains("- id: REQ-099"));
        assert!(yaml.contains("type: requirement"));
        assert!(yaml.contains("title: Test artifact"));
        assert!(yaml.contains("status: draft"));
        assert!(yaml.contains("tags: [core, test]"));
        assert!(yaml.contains("- type: satisfies"));
        assert!(yaml.contains("target: REQ-001"));
    }
}
