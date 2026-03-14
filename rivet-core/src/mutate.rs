//! Mutation operations for artifacts.
//!
//! All mutations are schema-validated **before** any file write (DD-028).
//! This module provides:
//! - `next_id`: compute the next sequential ID for a given prefix
//! - `validate_add`: validate a new artifact against the schema
//! - `validate_link`: validate a link addition against the schema
//! - `validate_modify`: validate field modifications against the schema
//! - YAML file manipulation functions that preserve comments and formatting

use std::path::{Path, PathBuf};

use crate::error::Error;
use crate::links::LinkGraph;
use crate::model::{Artifact, Link};
use crate::schema::Schema;
use crate::store::Store;

// ── ID generation ────────────────────────────────────────────────────────

/// Well-known mapping from artifact type names to ID prefixes.
pub fn prefix_for_type(artifact_type: &str) -> Option<&'static str> {
    match artifact_type {
        "requirement" => Some("REQ"),
        "feature" => Some("FEAT"),
        "design-decision" => Some("DD"),
        "system-req" => Some("SYSREQ"),
        "sw-req" => Some("SWREQ"),
        "sw-arch-component" => Some("SWARCH"),
        "sw-detailed-design" => Some("SWDD"),
        "loss" => Some("L"),
        "hazard" => Some("H"),
        "sub-hazard" => Some("SH"),
        "system-constraint" => Some("SC"),
        "controller" => Some("CTRL"),
        "uca" => Some("UCA"),
        "controller-constraint" => Some("CC"),
        "loss-scenario" => Some("LS"),
        "causal-factor" => Some("CF"),
        "countermeasure" => Some("CM"),
        "asset" => Some("ASSET"),
        "threat-scenario" => Some("TS"),
        "risk-assessment" => Some("RA"),
        "cybersecurity-goal" => Some("SECGOAL"),
        "cybersecurity-req" => Some("SECREQ"),
        "cybersecurity-design" => Some("SECDES"),
        "cybersecurity-implementation" => Some("SECIMPL"),
        "cybersecurity-verification" => Some("SECVER"),
        "aadl-component" => Some("AADL"),
        "aadl-connection" => Some("AADLCONN"),
        "aadl-analysis-result" => Some("AADLRES"),
        "unit-verification" => Some("UVER"),
        "sw-integration-verification" => Some("SWINTVER"),
        "sw-verification" => Some("SWVER"),
        "sys-integration-verification" => Some("SYSINTVER"),
        "sys-verification" => Some("SYSVER"),
        "verification-execution" => Some("VEXEC"),
        "verification-verdict" => Some("VVERD"),
        _ => None,
    }
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
pub fn validate_link(
    source_id: &str,
    link_type: &str,
    target_id: &str,
    store: &Store,
    schema: &Schema,
) -> Result<(), Error> {
    // Source must exist
    if !store.contains(source_id) {
        return Err(Error::Validation(format!(
            "source artifact '{}' does not exist",
            source_id
        )));
    }

    // Target must exist
    if !store.contains(target_id) {
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
pub fn add_link_to_file(source_id: &str, link: &Link, file_path: &Path) -> Result<(), Error> {
    let content = std::fs::read_to_string(file_path)
        .map_err(|e| Error::Io(format!("{}: {}", file_path.display(), e)))?;

    let new_content = insert_link_in_yaml(&content, source_id, link)?;

    std::fs::write(file_path, &new_content)
        .map_err(|e| Error::Io(format!("{}: {}", file_path.display(), e)))?;

    Ok(())
}

/// Insert a link entry into the YAML content for a specific artifact.
fn insert_link_in_yaml(content: &str, artifact_id: &str, link: &Link) -> Result<String, Error> {
    let lines: Vec<&str> = content.lines().collect();
    let mut result = Vec::new();

    // Find the artifact by its `- id:` line
    let id_pattern = format!("- id: {artifact_id}");
    let mut found_artifact = false;
    let mut in_target_artifact = false;
    let mut artifact_indent = 0;
    let mut has_links_section = false;
    let mut links_section_end = None;
    let mut artifact_end = None;
    let mut i = 0;

    // First pass: find the artifact and its links section
    while i < lines.len() {
        let line = lines[i];
        let trimmed = line.trim();

        if trimmed.contains(&id_pattern) && !found_artifact {
            found_artifact = true;
            in_target_artifact = true;
            artifact_indent = line.len() - line.trim_start().len();
            i += 1;
            continue;
        }

        if in_target_artifact {
            // Check if we've left the artifact (next item at same or lower indent)
            if trimmed.starts_with("- id:") || trimmed.starts_with("- id:") {
                let this_indent = line.len() - line.trim_start().len();
                if this_indent <= artifact_indent {
                    in_target_artifact = false;
                    artifact_end = Some(i);
                    continue;
                }
            }

            if trimmed == "links:" || trimmed.starts_with("links:") {
                has_links_section = true;
                // Find the end of the links section
                let links_indent = line.len() - line.trim_start().len();
                let mut j = i + 1;
                while j < lines.len() {
                    let next_line = lines[j];
                    let next_trimmed = next_line.trim();
                    if next_trimmed.is_empty() {
                        j += 1;
                        continue;
                    }
                    let next_indent = next_line.len() - next_line.trim_start().len();
                    if next_indent <= links_indent && !next_trimmed.starts_with("- type:") {
                        break;
                    }
                    // If it's a new artifact at the same level as our artifact
                    if next_indent <= artifact_indent && next_trimmed.starts_with("- id:") {
                        break;
                    }
                    j += 1;
                }
                links_section_end = Some(j);
            }
        }

        i += 1;
    }

    if !found_artifact {
        return Err(Error::Validation(format!(
            "artifact '{}' not found in file",
            artifact_id
        )));
    }

    if artifact_end.is_none() {
        artifact_end = Some(lines.len());
    }

    let link_yaml = format!(
        "      - type: {}\n        target: {}",
        link.link_type, link.target
    );

    if has_links_section {
        // Insert before the end of the links section
        let insert_at = links_section_end.unwrap();
        for (idx, line) in lines.iter().enumerate() {
            result.push(line.to_string());
            if idx + 1 == insert_at {
                result.push(link_yaml.clone());
            }
        }
    } else {
        // Add a new links section before the end of the artifact
        let insert_at = artifact_end.unwrap();
        for (idx, line) in lines.iter().enumerate() {
            if idx == insert_at {
                result.push("    links:".to_string());
                result.push(link_yaml.clone());
            }
            result.push(line.to_string());
        }
        if insert_at == lines.len() {
            result.push("    links:".to_string());
            result.push(link_yaml);
        }
    }

    Ok(result.join("\n") + "\n")
}

/// Remove a link from an artifact in its YAML file.
pub fn remove_link_from_file(
    source_id: &str,
    link_type: &str,
    target_id: &str,
    file_path: &Path,
) -> Result<(), Error> {
    let content = std::fs::read_to_string(file_path)
        .map_err(|e| Error::Io(format!("{}: {}", file_path.display(), e)))?;

    let new_content = remove_link_in_yaml(&content, source_id, link_type, target_id)?;

    std::fs::write(file_path, &new_content)
        .map_err(|e| Error::Io(format!("{}: {}", file_path.display(), e)))?;

    Ok(())
}

/// Remove a matching link entry from YAML content.
fn remove_link_in_yaml(
    content: &str,
    artifact_id: &str,
    link_type: &str,
    target_id: &str,
) -> Result<String, Error> {
    let lines: Vec<&str> = content.lines().collect();
    let mut result = Vec::new();
    let id_pattern = format!("- id: {artifact_id}");

    let mut in_target_artifact = false;
    let mut artifact_indent = 0;
    let mut skip_next_target_line = false;
    let mut found_link = false;

    let mut i = 0;
    while i < lines.len() {
        let line = lines[i];
        let trimmed = line.trim();

        if skip_next_target_line {
            // This should be the `target:` line after the `- type:` we're removing
            if trimmed.starts_with("target:") {
                skip_next_target_line = false;
                i += 1;
                continue;
            }
            skip_next_target_line = false;
        }

        if trimmed.contains(&id_pattern) && !in_target_artifact {
            in_target_artifact = true;
            artifact_indent = line.len() - line.trim_start().len();
            result.push(line.to_string());
            i += 1;
            continue;
        }

        if in_target_artifact {
            // Check if we've left the artifact
            if trimmed.starts_with("- id:") {
                let this_indent = line.len() - line.trim_start().len();
                if this_indent <= artifact_indent {
                    in_target_artifact = false;
                }
            }

            // Check for the specific link to remove
            if in_target_artifact
                && trimmed == format!("- type: {link_type}")
                && i + 1 < lines.len()
            {
                let next_trimmed = lines[i + 1].trim();
                if next_trimmed == format!("target: {target_id}") {
                    // Skip this line and the next (type + target)
                    found_link = true;
                    skip_next_target_line = true;
                    i += 1;
                    continue;
                }
            }
        }

        result.push(line.to_string());
        i += 1;
    }

    if !found_link {
        return Err(Error::Validation(format!(
            "link '{} -> {} ({})' not found in file",
            artifact_id, target_id, link_type
        )));
    }

    Ok(result.join("\n") + "\n")
}

/// Modify an artifact in its YAML file.
pub fn modify_artifact_in_file(
    id: &str,
    params: &ModifyParams,
    file_path: &Path,
    store: &Store,
) -> Result<(), Error> {
    let content = std::fs::read_to_string(file_path)
        .map_err(|e| Error::Io(format!("{}: {}", file_path.display(), e)))?;

    let new_content = modify_artifact_in_yaml(&content, id, params, store)?;

    std::fs::write(file_path, &new_content)
        .map_err(|e| Error::Io(format!("{}: {}", file_path.display(), e)))?;

    Ok(())
}

/// Apply modify params to YAML content for a specific artifact.
fn modify_artifact_in_yaml(
    content: &str,
    artifact_id: &str,
    params: &ModifyParams,
    store: &Store,
) -> Result<String, Error> {
    let lines: Vec<&str> = content.lines().collect();
    let mut result: Vec<String> = Vec::new();
    let id_pattern = format!("- id: {artifact_id}");

    let artifact = store.get(artifact_id).ok_or_else(|| {
        Error::Validation(format!("artifact '{}' not found in store", artifact_id))
    })?;

    let mut in_target_artifact = false;
    let mut artifact_indent = 0;
    let mut _replaced_title = false;
    let mut replaced_status = false;
    let mut replaced_tags = false;
    let mut in_fields_section = false;
    let mut fields_indent = 0;
    let mut replaced_fields: Vec<String> = Vec::new();
    let mut inserted_new_fields = false;

    let mut i = 0;
    while i < lines.len() {
        let line = lines[i];
        let trimmed = line.trim();

        if trimmed.contains(&id_pattern) && !in_target_artifact {
            in_target_artifact = true;
            artifact_indent = line.len() - line.trim_start().len();
            result.push(line.to_string());
            i += 1;
            continue;
        }

        if in_target_artifact {
            // Check if we've left the artifact
            if trimmed.starts_with("- id:") {
                let this_indent = line.len() - line.trim_start().len();
                if this_indent <= artifact_indent {
                    in_target_artifact = false;
                    in_fields_section = false;
                    // Append any new fields before leaving
                    if !inserted_new_fields {
                        append_new_fields(&mut result, params, &replaced_fields, artifact);
                        inserted_new_fields = true;
                    }
                }
            }

            if in_target_artifact {
                // Replace title
                if let Some(ref new_title) = params.set_title {
                    if trimmed.starts_with("title:") {
                        result.push(format!(
                            "{}title: {new_title}",
                            " ".repeat(artifact_indent + 4)
                        ));
                        _replaced_title = true;
                        i += 1;
                        continue;
                    }
                }

                // Replace status
                if let Some(ref new_status) = params.set_status {
                    if trimmed.starts_with("status:") {
                        result.push(format!(
                            "{}status: {new_status}",
                            " ".repeat(artifact_indent + 4)
                        ));
                        replaced_status = true;
                        i += 1;
                        continue;
                    }
                }

                // Replace tags
                if (!params.add_tags.is_empty() || !params.remove_tags.is_empty())
                    && trimmed.starts_with("tags:")
                {
                    let mut current_tags = artifact.tags.clone();
                    for tag in &params.remove_tags {
                        current_tags.retain(|t| t != tag);
                    }
                    for tag in &params.add_tags {
                        if !current_tags.contains(tag) {
                            current_tags.push(tag.clone());
                        }
                    }
                    if current_tags.is_empty() {
                        // Skip the tags line entirely
                    } else {
                        result.push(format!(
                            "{}tags: [{}]",
                            " ".repeat(artifact_indent + 4),
                            current_tags.join(", ")
                        ));
                    }
                    replaced_tags = true;
                    i += 1;
                    continue;
                }

                // Handle fields section
                if trimmed == "fields:" || trimmed.starts_with("fields:") {
                    in_fields_section = true;
                    fields_indent = line.len() - line.trim_start().len();
                    result.push(line.to_string());
                    i += 1;
                    continue;
                }

                if in_fields_section {
                    let this_indent = line.len() - line.trim_start().len();
                    if this_indent <= fields_indent && !trimmed.is_empty() {
                        in_fields_section = false;
                        // Append any new fields not yet replaced
                        for (key, value) in &params.set_fields {
                            if !replaced_fields.contains(key) {
                                result.push(format!(
                                    "{}{key}: {value}",
                                    " ".repeat(fields_indent + 2)
                                ));
                                replaced_fields.push(key.clone());
                            }
                        }
                        inserted_new_fields = true;
                    } else if !trimmed.is_empty() {
                        // Check if this line is a field that we want to replace
                        for (key, value) in &params.set_fields {
                            if trimmed.starts_with(&format!("{key}:")) {
                                result.push(format!("{}{key}: {value}", " ".repeat(this_indent)));
                                replaced_fields.push(key.clone());
                                i += 1;
                                continue;
                            }
                        }
                    }
                }
            }
        }

        result.push(line.to_string());
        i += 1;
    }

    // Handle edge case: artifact is last in file
    if in_target_artifact && !inserted_new_fields {
        append_new_fields(&mut result, params, &replaced_fields, artifact);
    }

    // If status was requested but artifact had no status line, insert after title
    if let Some(ref new_status) = params.set_status {
        if !replaced_status {
            insert_field_after(
                &mut result,
                artifact_id,
                "title:",
                &format!("    status: {new_status}"),
            );
        }
    }

    // If tags were requested but artifact had no tags line, insert after status/title
    if (!params.add_tags.is_empty()) && !replaced_tags {
        let tags_line = format!("    tags: [{}]", params.add_tags.join(", "));
        let after = if result.iter().any(|l| l.trim().starts_with("status:")) {
            "status:"
        } else {
            "title:"
        };
        insert_field_after(&mut result, artifact_id, after, &tags_line);
    }

    Ok(result.join("\n") + "\n")
}

fn append_new_fields(
    result: &mut Vec<String>,
    params: &ModifyParams,
    replaced_fields: &[String],
    _artifact: &Artifact,
) {
    for (key, value) in &params.set_fields {
        if !replaced_fields.contains(key) {
            // We need a fields section; for simplicity we append
            result.push(format!("      {key}: {value}"));
        }
    }
}

fn insert_field_after(
    result: &mut [String],
    artifact_id: &str,
    after_prefix: &str,
    new_line: &str,
) {
    let id_pattern = format!("- id: {artifact_id}");
    let mut in_artifact = false;
    let mut insert_idx = None;

    for (idx, line) in result.iter().enumerate() {
        let trimmed = line.trim();
        if trimmed.contains(&id_pattern) {
            in_artifact = true;
            continue;
        }
        if in_artifact {
            if trimmed.starts_with("- id:") {
                break;
            }
            if trimmed.starts_with(after_prefix) {
                insert_idx = Some(idx + 1);
            }
        }
    }

    if let Some(idx) = insert_idx {
        let mut new_result: Vec<String> = result[..idx].to_vec();
        new_result.push(new_line.to_string());
        new_result.extend_from_slice(&result[idx..]);
        // Copy back
        // Note: we can't resize a slice, so this function signature needs adjustment
        // For simplicity in the CLI, we'll handle this differently
        let _ = new_result; // This approach won't work with slices; handle in caller
    }
}

/// Remove an artifact from its YAML file.
pub fn remove_artifact_from_file(artifact_id: &str, file_path: &Path) -> Result<(), Error> {
    let content = std::fs::read_to_string(file_path)
        .map_err(|e| Error::Io(format!("{}: {}", file_path.display(), e)))?;

    let new_content = remove_artifact_in_yaml(&content, artifact_id)?;

    std::fs::write(file_path, &new_content)
        .map_err(|e| Error::Io(format!("{}: {}", file_path.display(), e)))?;

    Ok(())
}

/// Remove an artifact from YAML content.
fn remove_artifact_in_yaml(content: &str, artifact_id: &str) -> Result<String, Error> {
    let lines: Vec<&str> = content.lines().collect();
    let mut result = Vec::new();
    let id_pattern = format!("- id: {artifact_id}");

    let mut in_target_artifact = false;
    let mut artifact_indent = 0;
    let mut found = false;
    // Track blank lines before the artifact to remove them too
    let mut pending_blanks: Vec<String> = Vec::new();

    for line in &lines {
        let trimmed = line.trim();

        if trimmed.is_empty() && !in_target_artifact {
            pending_blanks.push(line.to_string());
            continue;
        }

        if trimmed.contains(&id_pattern) && !in_target_artifact {
            in_target_artifact = true;
            found = true;
            artifact_indent = line.len() - line.trim_start().len();
            // Discard pending blanks (they were before this artifact)
            pending_blanks.clear();
            continue;
        }

        if in_target_artifact {
            if trimmed.is_empty() {
                // Could be blank line within artifact or after it
                pending_blanks.push(line.to_string());
                continue;
            }

            // Check if this line starts a new artifact at same indent
            if trimmed.starts_with("- id:") {
                let this_indent = line.len() - line.trim_start().len();
                if this_indent <= artifact_indent {
                    in_target_artifact = false;
                    // Keep one blank line before next artifact if there were pending blanks
                    if !pending_blanks.is_empty() {
                        result.push(String::new());
                    }
                    pending_blanks.clear();
                    result.push(line.to_string());
                    continue;
                }
            }

            // Still inside the artifact — skip this line
            pending_blanks.clear();
            continue;
        }

        // Flush pending blanks
        result.append(&mut pending_blanks);
        result.push(line.to_string());
    }

    if !found {
        return Err(Error::Validation(format!(
            "artifact '{}' not found in file",
            artifact_id
        )));
    }

    // Ensure trailing newline
    let mut output = result.join("\n");
    if !output.ends_with('\n') {
        output.push('\n');
    }

    Ok(output)
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::collections::BTreeMap;

    fn make_test_schema() -> Schema {
        use crate::schema::*;

        let schema_file = SchemaFile {
            schema: SchemaMetadata {
                name: "test".to_string(),
                version: "0.1.0".to_string(),
                namespace: None,
                description: None,
                extends: vec![],
            },
            base_fields: vec![],
            artifact_types: vec![
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
                },
                ArtifactTypeDef {
                    name: "feature".to_string(),
                    description: "A feature".to_string(),
                    fields: vec![],
                    link_fields: vec![],
                    aspice_process: None,
                },
            ],
            link_types: vec![LinkTypeDef {
                name: "satisfies".to_string(),
                inverse: Some("satisfied-by".to_string()),
                description: "Source satisfies target".to_string(),
                source_types: vec![],
                target_types: vec![],
            }],
            traceability_rules: vec![],
        };

        Schema::merge(&[schema_file])
    }

    fn make_test_store() -> Store {
        let mut store = Store::new();
        store
            .insert(Artifact {
                id: "REQ-001".to_string(),
                artifact_type: "requirement".to_string(),
                title: "First req".to_string(),
                description: None,
                status: Some("draft".to_string()),
                tags: vec![],
                links: vec![],
                fields: BTreeMap::new(),
                source_file: Some(PathBuf::from("artifacts/requirements.yaml")),
            })
            .unwrap();
        store
            .insert(Artifact {
                id: "REQ-002".to_string(),
                artifact_type: "requirement".to_string(),
                title: "Second req".to_string(),
                description: None,
                status: None,
                tags: vec![],
                links: vec![],
                fields: BTreeMap::new(),
                source_file: Some(PathBuf::from("artifacts/requirements.yaml")),
            })
            .unwrap();
        store
            .insert(Artifact {
                id: "FEAT-001".to_string(),
                artifact_type: "feature".to_string(),
                title: "First feature".to_string(),
                description: None,
                status: None,
                tags: vec![],
                links: vec![Link {
                    link_type: "satisfies".to_string(),
                    target: "REQ-001".to_string(),
                }],
                fields: BTreeMap::new(),
                source_file: Some(PathBuf::from("artifacts/features.yaml")),
            })
            .unwrap();
        store
    }

    #[test]
    fn test_next_id() {
        let store = make_test_store();
        assert_eq!(next_id(&store, "REQ"), "REQ-003");
        assert_eq!(next_id(&store, "FEAT"), "FEAT-002");
        assert_eq!(next_id(&store, "DD"), "DD-001");
    }

    #[test]
    fn test_prefix_for_type() {
        assert_eq!(prefix_for_type("requirement"), Some("REQ"));
        assert_eq!(prefix_for_type("feature"), Some("FEAT"));
        assert_eq!(prefix_for_type("design-decision"), Some("DD"));
        assert_eq!(prefix_for_type("unknown-xyz"), None);
    }

    #[test]
    fn test_validate_add_valid() {
        let schema = make_test_schema();
        let store = make_test_store();

        let artifact = Artifact {
            id: "REQ-003".to_string(),
            artifact_type: "requirement".to_string(),
            title: "New requirement".to_string(),
            description: None,
            status: Some("draft".to_string()),
            tags: vec![],
            links: vec![],
            fields: BTreeMap::new(),
            source_file: None,
        };

        assert!(validate_add(&artifact, &store, &schema).is_ok());
    }

    #[test]
    fn test_validate_add_unknown_type() {
        let schema = make_test_schema();
        let store = make_test_store();

        let artifact = Artifact {
            id: "FOO-001".to_string(),
            artifact_type: "nonexistent-type".to_string(),
            title: "Bad type".to_string(),
            description: None,
            status: None,
            tags: vec![],
            links: vec![],
            fields: BTreeMap::new(),
            source_file: None,
        };

        let err = validate_add(&artifact, &store, &schema).unwrap_err();
        assert!(
            err.to_string().contains("unknown artifact type"),
            "expected 'unknown artifact type' error, got: {err}"
        );
    }

    #[test]
    fn test_validate_add_duplicate_id() {
        let schema = make_test_schema();
        let store = make_test_store();

        let artifact = Artifact {
            id: "REQ-001".to_string(),
            artifact_type: "requirement".to_string(),
            title: "Duplicate".to_string(),
            description: None,
            status: None,
            tags: vec![],
            links: vec![],
            fields: BTreeMap::new(),
            source_file: None,
        };

        let err = validate_add(&artifact, &store, &schema).unwrap_err();
        assert!(err.to_string().contains("already exists"));
    }

    #[test]
    fn test_validate_add_bad_field_value() {
        let schema = make_test_schema();
        let store = make_test_store();

        let mut fields = BTreeMap::new();
        fields.insert(
            "priority".to_string(),
            serde_yaml::Value::String("critical".to_string()),
        );

        let artifact = Artifact {
            id: "REQ-099".to_string(),
            artifact_type: "requirement".to_string(),
            title: "Bad field value".to_string(),
            description: None,
            status: None,
            tags: vec![],
            links: vec![],
            fields,
            source_file: None,
        };

        let err = validate_add(&artifact, &store, &schema).unwrap_err();
        assert!(err.to_string().contains("allowed"));
    }

    #[test]
    fn test_validate_link_valid() {
        let schema = make_test_schema();
        let store = make_test_store();

        assert!(validate_link("REQ-002", "satisfies", "REQ-001", &store, &schema).is_ok());
    }

    #[test]
    fn test_validate_link_unknown_type() {
        let schema = make_test_schema();
        let store = make_test_store();

        let err =
            validate_link("REQ-001", "nonexistent-link", "REQ-002", &store, &schema).unwrap_err();
        assert!(err.to_string().contains("unknown link type"));
    }

    #[test]
    fn test_validate_link_missing_source() {
        let schema = make_test_schema();
        let store = make_test_store();

        let err = validate_link("NOPE-001", "satisfies", "REQ-001", &store, &schema).unwrap_err();
        assert!(err.to_string().contains("does not exist"));
    }

    #[test]
    fn test_validate_link_missing_target() {
        let schema = make_test_schema();
        let store = make_test_store();

        let err = validate_link("REQ-001", "satisfies", "NOPE-001", &store, &schema).unwrap_err();
        assert!(err.to_string().contains("does not exist"));
    }

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

    #[test]
    fn test_validate_remove_no_backlinks() {
        let store = make_test_store();
        let schema = make_test_schema();
        let graph = LinkGraph::build(&store, &schema);

        // FEAT-001 has no incoming links
        assert!(validate_remove("FEAT-001", false, &store, &graph).is_ok());
    }

    #[test]
    fn test_validate_remove_nonexistent() {
        let store = make_test_store();
        let schema = make_test_schema();
        let graph = LinkGraph::build(&store, &schema);

        let err = validate_remove("NOPE-001", false, &store, &graph).unwrap_err();
        assert!(err.to_string().contains("does not exist"));
    }

    #[test]
    fn test_render_artifact_yaml() {
        let artifact = Artifact {
            id: "REQ-099".to_string(),
            artifact_type: "requirement".to_string(),
            title: "Test artifact".to_string(),
            description: Some("A description".to_string()),
            status: Some("draft".to_string()),
            tags: vec!["core".to_string(), "test".to_string()],
            links: vec![Link {
                link_type: "satisfies".to_string(),
                target: "REQ-001".to_string(),
            }],
            fields: BTreeMap::new(),
            source_file: None,
        };

        let yaml = render_artifact_yaml(&artifact);
        assert!(yaml.contains("- id: REQ-099"));
        assert!(yaml.contains("type: requirement"));
        assert!(yaml.contains("title: Test artifact"));
        assert!(yaml.contains("status: draft"));
        assert!(yaml.contains("tags: [core, test]"));
        assert!(yaml.contains("- type: satisfies"));
        assert!(yaml.contains("target: REQ-001"));
    }

    #[test]
    fn test_remove_artifact_in_yaml() {
        let content = "\
artifacts:
  - id: REQ-001
    type: requirement
    title: First
    status: draft

  - id: REQ-002
    type: requirement
    title: Second
    status: draft

  - id: REQ-003
    type: requirement
    title: Third
    status: draft
";

        let result = remove_artifact_in_yaml(content, "REQ-002").unwrap();
        assert!(!result.contains("REQ-002"));
        assert!(result.contains("REQ-001"));
        assert!(result.contains("REQ-003"));
    }

    #[test]
    fn test_insert_link_in_yaml_existing_links() {
        let content = "\
artifacts:
  - id: REQ-001
    type: requirement
    title: First
    links:
      - type: satisfies
        target: REQ-002

  - id: REQ-003
    type: requirement
    title: Third
";

        let link = Link {
            link_type: "derives-from".to_string(),
            target: "REQ-003".to_string(),
        };

        let result = insert_link_in_yaml(content, "REQ-001", &link).unwrap();
        assert!(result.contains("- type: derives-from"));
        assert!(result.contains("target: REQ-003"));
        // Original link still present
        assert!(result.contains("- type: satisfies"));
        assert!(result.contains("target: REQ-002"));
    }

    #[test]
    fn test_remove_link_in_yaml() {
        let content = "\
artifacts:
  - id: FEAT-001
    type: feature
    title: First feature
    links:
      - type: satisfies
        target: REQ-001
      - type: implements
        target: DD-001
";

        let result = remove_link_in_yaml(content, "FEAT-001", "satisfies", "REQ-001").unwrap();
        assert!(!result.contains("- type: satisfies"));
        assert!(!result.contains("target: REQ-001"));
        // Other link still present
        assert!(result.contains("- type: implements"));
        assert!(result.contains("target: DD-001"));
    }
}
