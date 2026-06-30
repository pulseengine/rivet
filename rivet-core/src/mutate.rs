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
    next_id_considering(store, prefix, std::iter::empty::<&str>())
}

/// Like [`next_id`], but also considers a set of externally-claimed IDs when
/// picking the next free number — IDs that are *not* in the working-tree store
/// but have nonetheless been burned (e.g. claimed by an open PR/branch or by a
/// commit that was later reverted). Issue #479: scanning only the local store
/// hands out IDs already live elsewhere, producing two artifacts with the same
/// ID. The caller (the CLI) supplies the burned IDs from git history; core
/// stays IO-free.
///
/// `extra_ids` may contain IDs of any prefix and any shape; only those matching
/// `{prefix}-{number}` contribute. The returned ID's zero-pad width is still
/// derived from the *store* (the project's own convention), falling back to the
/// width seen among the extra IDs, then to 3.
pub fn next_id_considering<I, S>(store: &Store, prefix: &str, extra_ids: I) -> String
where
    I: IntoIterator<Item = S>,
    S: AsRef<str>,
{
    let dash_prefix = format!("{prefix}-");

    let parse_num = |id: &str| -> Option<(u32, usize)> {
        id.strip_prefix(&dash_prefix)
            .and_then(|suffix| suffix.parse::<u32>().ok().map(|n| (n, suffix.len())))
    };

    let mut max_num: u32 = 0;
    // Width is taken from the store's own IDs first (the project convention).
    let mut store_width: Option<usize> = None;
    for artifact in store.iter() {
        if let Some((n, w)) = parse_num(&artifact.id) {
            max_num = max_num.max(n);
            store_width = Some(store_width.map_or(w, |cur: usize| cur.max(w)));
        }
    }

    // Burned IDs raise the floor but only contribute width if the store had none.
    let mut extra_width: Option<usize> = None;
    for id in extra_ids {
        if let Some((n, w)) = parse_num(id.as_ref()) {
            max_num = max_num.max(n);
            extra_width = Some(extra_width.map_or(w, |cur: usize| cur.max(w)));
        }
    }

    let next = max_num + 1;
    let width = store_width.or(extra_width).unwrap_or(3);
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

    // Check status against the declared enum (REQ-135). `status` is a base
    // field; when the schema declares `allowed-values` on it, reject values
    // outside the set at mutation time (so a typo never reaches a file).
    if let Some(status) = artifact.status.as_deref() {
        check_status_allowed(status, &artifact.artifact_type, schema)?;
    }

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
    let Some(source) = store.get(source_id) else {
        return Err(Error::Validation(format!(
            "source artifact '{}' not found in store",
            source_id
        )));
    };
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

/// Reserved top-level artifact keys that must never be written via `set_fields`.
///
/// These live at the top level of an artifact mapping (not under `fields:`)
/// and each has a dedicated path: base struct members (`id`, `type`, `title`,
/// `description`, `status`, `tags`, `links`), the domain `fields:` sub-map
/// itself, `provenance:` metadata, and the `source-file:` loader hint.
///
/// If a caller passes one of these through `set_fields`, `validate_modify`
/// returns an error rather than silently nesting it under `fields:` (which
/// would corrupt the artifact shape) or emitting an unquoted top-level scalar
/// whose content (backticks, newlines) could break YAML parsing.
pub const RESERVED_TOP_LEVEL_KEYS: &[&str] = &[
    "id",
    "type",
    "title",
    "description",
    "status",
    "release",
    "tags",
    "links",
    "fields",
    "provenance",
    "source-file",
];

/// Parameters for a modify operation.
///
/// `set_fields` targets the **domain `fields:` sub-map only**. Top-level
/// metadata (title, status, description, ...) has dedicated setters to
/// avoid ambiguity and to enable value-type-specific YAML emission.
#[derive(Debug, Default)]
pub struct ModifyParams {
    pub set_status: Option<String>,
    /// Set the top-level `release:` scope (e.g. "v0.21.0"). First-class
    /// release-planning dimension (#516).
    pub set_release: Option<String>,
    pub set_title: Option<String>,
    /// Set the top-level `description:` of the artifact.
    ///
    /// Values are emitted with YAML-safe quoting — newlines trigger a
    /// block-literal scalar, special characters trigger a double-quoted
    /// scalar. See [`crate::yaml_edit`] for the emitter.
    pub set_description: Option<String>,
    pub add_tags: Vec<String>,
    pub remove_tags: Vec<String>,
    /// Domain-specific fields under the artifact's `fields:` map.
    ///
    /// Keys must not collide with [`RESERVED_TOP_LEVEL_KEYS`]; use
    /// `set_title`, `set_status`, `set_description`, `add_tags`, etc. for
    /// those instead. Validated by [`validate_modify`].
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

    // Reject attempts to write reserved top-level keys through `set_fields`.
    // See [`RESERVED_TOP_LEVEL_KEYS`] for the rationale (scope + YAML safety).
    for (key, _) in &params.set_fields {
        if RESERVED_TOP_LEVEL_KEYS.contains(&key.as_str()) {
            let hint = match key.as_str() {
                "title" => " — use the `title` / `set_title` parameter",
                "status" => " — use the `status` / `set_status` parameter",
                "description" => " — use the `description` / `set_description` parameter",
                "tags" => " — use the `add_tags` / `remove_tags` parameters",
                _ => "",
            };
            return Err(Error::Validation(format!(
                "'{key}' is a reserved top-level artifact key and cannot be set via \
                 `set_fields` (which targets the `fields:` sub-map){hint}"
            )));
        }
    }

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

    // REQ-135: a `--set-status` value must be in the declared status enum.
    if let Some(status) = params.set_status.as_deref() {
        check_status_allowed(status, &artifact.artifact_type, schema)?;
    }

    Ok(())
}

/// REQ-135: reject a status outside the `status` base-field's declared
/// `allowed-values`. Inert (Ok) when no enum is declared — keeps status
/// free-form for schemas that don't opt in.
fn check_status_allowed(status: &str, artifact_type: &str, schema: &Schema) -> Result<(), Error> {
    // #550: a type may override the global lifecycle enum with its own `status`
    // field allowed-values (e.g. ai-found-defect: open/triaged/resolved). Prefer
    // the type's own status field; fall back to the base-field enum.
    if let Some(allowed) = schema
        .artifact_type(artifact_type)
        .and_then(|t| t.fields.iter().find(|f| f.name == "status"))
        .or_else(|| schema.base_fields.iter().find(|f| f.name == "status"))
        .and_then(|f| f.allowed_values.as_ref())
    {
        if !allowed.is_empty() && !allowed.iter().any(|a| a == status) {
            return Err(Error::Validation(format!(
                "status '{status}' is not an allowed value, allowed: {allowed:?}"
            )));
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
///
/// Iterates in **id-sorted** order (not `store.iter()`'s HashMap order) so a
/// type spanning more than one source file always routes a new artifact to
/// the same destination — the file of the lowest-id existing artifact of that
/// type. With raw `store.iter()` the destination flipped between runs on
/// identical input (HashMap uses a per-process random seed), so `rivet add`
/// could non-deterministically fragment a type across files (#629).
pub fn find_file_for_type(artifact_type: &str, store: &Store) -> Option<PathBuf> {
    for artifact in store.iter_sorted() {
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

    use crate::yaml_edit::{yaml_quote_inline_scalar, yaml_render_scalar_value};

    lines.push(format!("  - id: {}", artifact.id));
    lines.push(format!("    type: {}", artifact.artifact_type));
    // Values are YAML-safe-quoted (colons, leading specials, etc.) and
    // multi-line values become block-literal scalars — reusing the same emitter
    // the modify/set path uses, so `add` never writes invalid YAML.
    lines.push(format!(
        "    title: {}",
        yaml_quote_inline_scalar(&artifact.title)
    ));

    if let Some(ref status) = artifact.status {
        lines.push(format!("    status: {}", yaml_quote_inline_scalar(status)));
    }

    if let Some(ref release) = artifact.release {
        lines.push(format!(
            "    release: {}",
            yaml_quote_inline_scalar(release)
        ));
    }

    if let Some(ref desc) = artifact.description {
        lines.push(format!(
            "    description: {}",
            yaml_render_scalar_value(desc, 4)
        ));
    }

    if !artifact.tags.is_empty() {
        let tag_list: Vec<String> = artifact
            .tags
            .iter()
            .map(|t| yaml_quote_inline_scalar(t))
            .collect();
        lines.push(format!("    tags: [{}]", tag_list.join(", ")));
    }

    if !artifact.fields.is_empty() {
        lines.push("    fields:".to_string());
        for (key, value) in &artifact.fields {
            match value {
                serde_yaml::Value::String(s) => {
                    lines.push(format!("      {key}: {}", yaml_render_scalar_value(s, 6)));
                }
                serde_yaml::Value::Number(n) => lines.push(format!("      {key}: {n}")),
                serde_yaml::Value::Bool(b) => lines.push(format!("      {key}: {b}")),
                // Nested sequence/mapping: emit as properly-indented YAML under
                // the key (serde produces valid YAML; we just shift it right),
                // not as a block-scalar string — so a list field stays a list.
                other => {
                    lines.push(format!("      {key}:"));
                    let nested = serde_yaml::to_string(other).unwrap_or_default();
                    for nl in nested.lines() {
                        if nl.is_empty() {
                            lines.push(String::new());
                        } else {
                            lines.push(format!("        {nl}"));
                        }
                    }
                }
            }
        }
    }

    if !artifact.links.is_empty() {
        lines.push("    links:".to_string());
        for link in &artifact.links {
            lines.push(format!("      - type: {}", link.link_type));
            lines.push(format!("        target: {}", link.target));
        }
    }

    // Provenance (issue #476): when `rivet add --created-by` stamps an
    // artifact at creation, emit the block here — otherwise the field would be
    // silently dropped on write (the serializer is the single source of truth
    // for `add` output). Field order matches yaml_edit::set_provenance so the
    // add-path and stamp-path produce identical blocks.
    if let Some(ref prov) = artifact.provenance {
        lines.push("    provenance:".to_string());
        lines.push(format!("      created-by: {}", prov.created_by));
        if let Some(ref m) = prov.model {
            lines.push(format!("      model: {m}"));
        }
        if let Some(ref sid) = prov.session_id {
            lines.push(format!("      session-id: {sid}"));
        }
        if let Some(ref ts) = prov.timestamp {
            lines.push(format!("      timestamp: {ts}"));
        }
        if let Some(ref rb) = prov.reviewed_by {
            lines.push(format!("      reviewed-by: {rb}"));
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
                yaml_section_suffix: None,
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
                yaml_section_suffix: None,
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

    // #629: when a type spans more than one source file, `rivet add` must
    // route a new artifact deterministically — to the file of the LOWEST-id
    // existing artifact of that type — not to whichever file `store.iter()`'s
    // HashMap order happens to surface first.
    // rivet: verifies REQ-031
    #[test]
    fn find_file_for_type_is_deterministic_when_type_spans_files() {
        // A `requirement` type split across two files: the lowest id lives in
        // requirements.yaml; a higher id lives in extra.yaml.
        let mut store = Store::new();
        let mut hi = minimal_artifact("REQ-900", "requirement");
        hi.source_file = Some(PathBuf::from("artifacts/extra.yaml"));
        store.insert(hi).unwrap();
        let mut lo = minimal_artifact("REQ-001", "requirement");
        lo.source_file = Some(PathBuf::from("artifacts/requirements.yaml"));
        store.insert(lo).unwrap();
        let mut mid = minimal_artifact("REQ-500", "requirement");
        mid.source_file = Some(PathBuf::from("artifacts/extra.yaml"));
        store.insert(mid).unwrap();

        // The lowest-id artifact (REQ-001) decides the destination, every call.
        let expected = Some(PathBuf::from("artifacts/requirements.yaml"));
        for _ in 0..16 {
            assert_eq!(
                find_file_for_type("requirement", &store),
                expected,
                "routing must be stable across calls (lowest-id file wins)"
            );
        }
    }

    // #479: burned IDs (claimed in git history but absent from the working
    // tree) must raise the allocation floor so next-id never reissues them.
    // rivet: verifies REQ-031
    #[test]
    fn next_id_considering_skips_burned_ids() {
        let store = make_test_store(); // REQ-001, REQ-002 present -> bare next is REQ-003.

        // A reverted REQ-009 lingers only in git history: skip past it.
        let burned = ["REQ-009", "FEAT-007", "junk", "REQ-xyz"];
        assert_eq!(
            next_id_considering(&store, "REQ", burned),
            "REQ-010",
            "must clear the highest burned REQ id, not just the store max"
        );
        // Other prefixes are unaffected by REQ burns.
        assert_eq!(next_id_considering(&store, "DD", burned), "DD-001");

        // Burned below the store max changes nothing.
        assert_eq!(next_id_considering(&store, "REQ", ["REQ-001"]), "REQ-003");

        // Width follows the store convention even when a burned id is wider.
        assert_eq!(next_id_considering(&store, "REQ", ["REQ-0042"]), "REQ-043");
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

    /// REQ-135 (#354): `modify --set-status` rejects a value outside the
    /// declared status enum; accepts a valid one; inert when no enum declared.
    // rivet: verifies REQ-135
    #[test]
    fn validate_modify_rejects_status_outside_enum() {
        let mut sf = minimal_schema("test");
        sf.artifact_types = vec![ArtifactTypeDef {
            name: "requirement".to_string(),
            ..Default::default()
        }];
        sf.base_fields = vec![FieldDef {
            name: "status".to_string(),
            field_type: "enum".to_string(),
            allowed_values: Some(vec![
                "draft".to_string(),
                "approved".to_string(),
                "implemented".to_string(),
            ]),
            ..Default::default()
        }];
        let schema = Schema::merge(&[sf]);

        let mut store = Store::new();
        let mut a = minimal_artifact("REQ-1", "requirement");
        a.status = Some("draft".to_string());
        store.insert(a).unwrap();

        let bad = ModifyParams {
            set_status: Some("implmented".to_string()), // typo
            ..Default::default()
        };
        let err = validate_modify("REQ-1", &bad, &store, &schema).unwrap_err();
        assert!(
            err.to_string().contains("implmented") && err.to_string().contains("allowed"),
            "must reject the typo'd status; got {err}"
        );

        let good = ModifyParams {
            set_status: Some("implemented".to_string()),
            ..Default::default()
        };
        assert!(validate_modify("REQ-1", &good, &store, &schema).is_ok());
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

    #[test]
    fn render_artifact_yaml_multiline_and_colon_is_valid_parseable_yaml() {
        // Regression: a newline in the description emitted a folded `>` scalar
        // whose continuation lines were unindented (column 0), and a colon in
        // the title was left unquoted — both produced INVALID YAML that broke
        // the whole artifacts file on the next load. (REQ-198 / mutate add path)
        let mut artifact = artifact_with_links("REQ-099", "requirement", &[]);
        artifact.title = "Multi word: with colon".to_string();
        artifact.description = Some("Line one.\nLine two with \"quotes\".".to_string());
        artifact.status = Some("draft".to_string());
        artifact.tags = vec!["core".to_string()];

        let body = render_artifact_yaml(&artifact);
        // Must parse as a real artifacts document (the bug failed here).
        let doc = format!("schema: dev\nartifacts:\n{body}");
        let parsed: serde_yaml::Value =
            serde_yaml::from_str(&doc).expect("rendered artifact YAML must parse");
        let art = &parsed["artifacts"][0];
        assert_eq!(art["title"].as_str(), Some("Multi word: with colon"));
        assert_eq!(
            art["description"].as_str(),
            Some("Line one.\nLine two with \"quotes\"."),
            "multi-line description must round-trip exactly"
        );
    }

    #[test]
    fn render_artifact_yaml_nested_field_value_stays_structured() {
        // A list/map field value (reachable via batch/MCP) must serialize as an
        // indented nested structure, not collapse into a block-literal string.
        // (REQ-199)
        let mut artifact = artifact_with_links("REQ-099", "requirement", &[]);
        artifact.title = "T".to_string();
        artifact.fields.insert(
            "owners".to_string(),
            serde_yaml::Value::Sequence(vec![
                serde_yaml::Value::String("alice".to_string()),
                serde_yaml::Value::String("bob".to_string()),
            ]),
        );

        let body = render_artifact_yaml(&artifact);
        let doc = format!("schema: dev\nartifacts:\n{body}");
        let parsed: serde_yaml::Value =
            serde_yaml::from_str(&doc).expect("rendered artifact YAML must parse");
        let owners = &parsed["artifacts"][0]["fields"]["owners"];
        assert!(
            owners.is_sequence(),
            "a list field must stay a sequence, got: {owners:?}"
        );
        assert_eq!(owners[0].as_str(), Some("alice"));
        assert_eq!(owners[1].as_str(), Some("bob"));
    }

    #[test]
    fn render_artifact_yaml_emits_provenance_when_present() {
        // Issue #476: `rivet add --created-by` stamps provenance at creation;
        // the serializer must emit it (else the field is silently dropped on
        // write — the REQ-196/200 class of no-op). Verify the block round-trips
        // with the canonical kebab-case keys.
        use crate::model::Provenance;
        let mut artifact = artifact_with_links("REQ-099", "requirement", &[]);
        artifact.title = "T".to_string();
        artifact.provenance = Some(Provenance {
            created_by: "ai-assisted".to_string(),
            model: Some("claude-opus-4-8".to_string()),
            session_id: None,
            timestamp: Some("2026-06-05T00:00:00Z".to_string()),
            reviewed_by: None,
            federation: None,
        });

        let body = render_artifact_yaml(&artifact);
        let doc = format!("schema: dev\nartifacts:\n{body}");
        let parsed: serde_yaml::Value =
            serde_yaml::from_str(&doc).expect("rendered artifact YAML must parse");
        let prov = &parsed["artifacts"][0]["provenance"];
        assert_eq!(prov["created-by"].as_str(), Some("ai-assisted"));
        assert_eq!(prov["model"].as_str(), Some("claude-opus-4-8"));
        assert_eq!(prov["timestamp"].as_str(), Some("2026-06-05T00:00:00Z"));
        // Omitted optional fields must not appear at all.
        assert!(prov.get("session-id").is_none());
        assert!(prov.get("reviewed-by").is_none());
    }

    #[test]
    fn render_artifact_yaml_omits_provenance_when_absent() {
        // Default behavior preserved: no provenance block when none is set.
        let mut artifact = artifact_with_links("REQ-099", "requirement", &[]);
        artifact.title = "T".to_string();
        artifact.provenance = None;
        let body = render_artifact_yaml(&artifact);
        assert!(
            !body.contains("provenance:"),
            "unstamped add must not emit a provenance block, got:\n{body}"
        );
    }
}
