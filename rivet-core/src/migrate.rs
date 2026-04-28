//! Schema migration engine — diff source/target schema sets and rewrite
//! artifacts mechanically.
//!
//! Phase 1 MVP (#236): mechanical-only migration. The diff engine
//! computes a [`RewriteMap`] from a [`MigrationRecipe`] (and optional
//! schema introspection), and [`apply_rewrite`] rewrites a single
//! artifact YAML file in place.
//!
//! See `rivet docs schema-migrate` for the user-facing topic.

// SAFETY-REVIEW (SCRC Phase 1, DD-058): File-scope blanket allow for
// the v0.4.3 clippy restriction-lint escalation. Same rationale as
// neighbouring `rivet-core/src/*.rs` modules — see e.g. schema.rs.
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

use std::collections::{BTreeMap, BTreeSet};
use std::path::{Path, PathBuf};

use serde::{Deserialize, Serialize};

use crate::error::Error;
use crate::schema::Schema;

// ── Recipe shape ────────────────────────────────────────────────────────

/// A canned migration recipe loaded from YAML.
///
/// Recipes are hand-curated mappings between two preset schema sets.
/// See `schemas/migrations/dev-to-aspice.yaml` for the canonical example.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct MigrationRecipeFile {
    pub migration: MigrationRecipe,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct MigrationRecipe {
    pub name: String,
    pub source: PresetRef,
    pub target: PresetRef,
    #[serde(default)]
    pub description: Option<String>,
    #[serde(default, rename = "type-rewrites")]
    pub type_rewrites: Vec<TypeRewrite>,
    #[serde(default, rename = "link-rewrites")]
    pub link_rewrites: Vec<LinkRewrite>,
    #[serde(default)]
    pub policies: MigrationPolicies,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct PresetRef {
    pub preset: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct TypeRewrite {
    pub from: String,
    pub to: String,
    /// Per-field name mapping from source -> target (no value transform yet).
    /// Phase 1 ignores value-mapped enums; they would land in `--apply`'s
    /// conflict path.
    #[serde(default, rename = "field-map")]
    pub field_map: BTreeMap<String, String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct LinkRewrite {
    pub from: String,
    pub to: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(deny_unknown_fields, default)]
pub struct MigrationPolicies {
    /// What to do with fields on the source artifact that have no mapping
    /// to the target type.
    #[serde(rename = "unmapped-fields")]
    pub unmapped_fields: UnmappedFieldPolicy,
    /// What to do with link types not declared in the recipe.
    #[serde(rename = "unmapped-link-types")]
    pub unmapped_link_types: UnmappedLinkPolicy,
}

impl Default for MigrationPolicies {
    fn default() -> Self {
        Self {
            unmapped_fields: UnmappedFieldPolicy::Drop,
            unmapped_link_types: UnmappedLinkPolicy::Keep,
        }
    }
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, Default, PartialEq, Eq)]
#[serde(rename_all = "kebab-case")]
pub enum UnmappedFieldPolicy {
    /// Silently drop the field. Loses data — recommended only for known
    /// throwaway fields.
    #[default]
    Drop,
    /// Stash under `fields.legacy.<original-name>` so nothing is lost.
    KeepAsOrphan,
    /// Treat as a conflict — bails the apply.
    Strict,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, Default, PartialEq, Eq)]
#[serde(rename_all = "kebab-case")]
pub enum UnmappedLinkPolicy {
    /// Keep the link as-is (target type may now be unknown — flagged later
    /// by `rivet validate`, not the migration).
    #[default]
    Keep,
    /// Drop the link.
    Drop,
    /// Treat as a conflict.
    Strict,
}

impl MigrationRecipeFile {
    /// Load a recipe from a YAML file.
    pub fn load(path: &Path) -> Result<Self, Error> {
        let content = std::fs::read_to_string(path)
            .map_err(|e| Error::Io(format!("{}: {}", path.display(), e)))?;
        Self::parse(&content).map_err(|e| Error::Schema(format!("{}: {}", path.display(), e)))
    }

    /// Parse a recipe from YAML text.
    pub fn parse(s: &str) -> Result<Self, serde_yaml::Error> {
        serde_yaml::from_str(s)
    }
}

// ── Diff engine ─────────────────────────────────────────────────────────

/// Action class for a single per-artifact change. Mirrors the rebase
/// `pick / edit / drop` model from #236.
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(rename_all = "kebab-case")]
pub enum ActionClass {
    /// Auto-applicable: schema diff alone is sufficient.
    Mechanical,
    /// Auto-applicable given a policy choice (e.g. "drop unmapped fields").
    DecidableWithPolicy,
    /// Needs human input — Phase 1 bails on these.
    Conflict,
}

/// A single planned change against an artifact.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(deny_unknown_fields)]
pub struct PlannedChange {
    pub artifact_id: String,
    /// File path relative to the project root. Optional because some
    /// artifacts may be virtual; in practice every artifact has a source
    /// file in Phase 1.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub source_file: Option<String>,
    pub action: ActionClass,
    pub change: ChangeKind,
}

/// What the change actually does.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "kebab-case", tag = "kind")]
pub enum ChangeKind {
    /// Artifact's `type:` is being renamed.
    TypeRename { from: String, to: String },
    /// A link's `type:` is being renamed (we don't track the specific
    /// link target here; the apply walks all links of the affected
    /// type).
    LinkTypeRename { from: String, to: String },
    /// A field is being renamed inside the artifact's `fields:` map.
    FieldRename {
        in_type: String,
        from: String,
        to: String,
    },
    /// A field is being dropped because the target type doesn't have it.
    FieldDrop {
        in_type: String,
        field: String,
        policy: UnmappedFieldPolicy,
    },
    /// A field would need value-mapping (e.g. enum -> different enum),
    /// which Phase 1 doesn't auto-resolve.
    FieldValueConflict {
        in_type: String,
        field: String,
        from_value: String,
        target_constraint: String,
    },
}

/// The full per-artifact rewrite plan.
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq)]
#[serde(deny_unknown_fields)]
pub struct RewriteMap {
    pub recipe_name: String,
    pub source_preset: String,
    pub target_preset: String,
    pub changes: Vec<PlannedChange>,
}

impl RewriteMap {
    pub fn count(&self, class: ActionClass) -> usize {
        self.changes.iter().filter(|c| c.action == class).count()
    }

    pub fn has_conflicts(&self) -> bool {
        self.count(ActionClass::Conflict) > 0
    }

    /// Group all changes by source file for application.
    pub fn by_file(&self) -> BTreeMap<String, Vec<&PlannedChange>> {
        let mut out: BTreeMap<String, Vec<&PlannedChange>> = BTreeMap::new();
        for c in &self.changes {
            if let Some(f) = &c.source_file {
                out.entry(f.clone()).or_default().push(c);
            }
        }
        out
    }
}

/// Compute a [`RewriteMap`] from a recipe + the source artifacts.
///
/// `target_schema` is consulted (when `Some`) to detect unmapped fields
/// for the "decidable-with-policy" / "conflict" classes. When `None`,
/// every recipe entry is treated as mechanical and unmapped-field
/// detection is skipped — useful for a "what does the recipe say?"
/// dry-run.
pub fn diff_artifacts(
    recipe: &MigrationRecipe,
    artifacts: &[crate::model::Artifact],
    target_schema: Option<&Schema>,
) -> RewriteMap {
    let mut changes = Vec::new();

    let type_map: BTreeMap<&str, &TypeRewrite> = recipe
        .type_rewrites
        .iter()
        .map(|tr| (tr.from.as_str(), tr))
        .collect();
    let link_map: BTreeMap<&str, &LinkRewrite> = recipe
        .link_rewrites
        .iter()
        .map(|lr| (lr.from.as_str(), lr))
        .collect();

    for artifact in artifacts {
        let source_file = artifact
            .source_file
            .as_ref()
            .map(|p| p.display().to_string());

        // ── 1. Type rename ────────────────────────────────────────────
        let target_type_name: String =
            if let Some(tr) = type_map.get(artifact.artifact_type.as_str()) {
                if tr.from != tr.to {
                    changes.push(PlannedChange {
                        artifact_id: artifact.id.clone(),
                        source_file: source_file.clone(),
                        action: ActionClass::Mechanical,
                        change: ChangeKind::TypeRename {
                            from: tr.from.clone(),
                            to: tr.to.clone(),
                        },
                    });
                }
                tr.to.clone()
            } else {
                artifact.artifact_type.clone()
            };

        // ── 2. Link-type renames ──────────────────────────────────────
        // Collect distinct link types on this artifact. We emit one
        // change per (artifact, source link type) so the manifest reads
        // naturally.
        let mut seen_link_types: BTreeSet<&str> = BTreeSet::new();
        for link in &artifact.links {
            if !seen_link_types.insert(link.link_type.as_str()) {
                continue;
            }
            if let Some(lr) = link_map.get(link.link_type.as_str()) {
                if lr.from != lr.to {
                    changes.push(PlannedChange {
                        artifact_id: artifact.id.clone(),
                        source_file: source_file.clone(),
                        action: ActionClass::Mechanical,
                        change: ChangeKind::LinkTypeRename {
                            from: lr.from.clone(),
                            to: lr.to.clone(),
                        },
                    });
                }
            }
        }

        // ── 3. Field-level changes ────────────────────────────────────
        let target_type_def = target_schema.and_then(|s| s.artifact_type(&target_type_name));
        let target_field_names: BTreeSet<String> = target_type_def
            .map(|t| t.fields.iter().map(|f| f.name.clone()).collect())
            .unwrap_or_default();

        let field_map: BTreeMap<&str, &str> = type_map
            .get(artifact.artifact_type.as_str())
            .map(|tr| {
                tr.field_map
                    .iter()
                    .map(|(k, v)| (k.as_str(), v.as_str()))
                    .collect()
            })
            .unwrap_or_default();

        for field_name in artifact.fields.keys() {
            // Renames declared in the recipe.
            if let Some(target_name) = field_map.get(field_name.as_str()) {
                if *target_name != field_name {
                    changes.push(PlannedChange {
                        artifact_id: artifact.id.clone(),
                        source_file: source_file.clone(),
                        action: ActionClass::Mechanical,
                        change: ChangeKind::FieldRename {
                            in_type: target_type_name.clone(),
                            from: field_name.clone(),
                            to: (*target_name).to_string(),
                        },
                    });
                }
                continue;
            }
            // No explicit mapping. If we have a target schema, check
            // whether the same-named field exists on the target type.
            // If it does, this is a no-op. If it doesn't, apply policy.
            if target_type_def.is_some() && !target_field_names.contains(field_name) {
                let action = match recipe.policies.unmapped_fields {
                    UnmappedFieldPolicy::Drop | UnmappedFieldPolicy::KeepAsOrphan => {
                        ActionClass::DecidableWithPolicy
                    }
                    UnmappedFieldPolicy::Strict => ActionClass::Conflict,
                };
                changes.push(PlannedChange {
                    artifact_id: artifact.id.clone(),
                    source_file: source_file.clone(),
                    action,
                    change: ChangeKind::FieldDrop {
                        in_type: target_type_name.clone(),
                        field: field_name.clone(),
                        policy: recipe.policies.unmapped_fields,
                    },
                });
            }
        }
    }

    RewriteMap {
        recipe_name: recipe.name.clone(),
        source_preset: recipe.source.preset.clone(),
        target_preset: recipe.target.preset.clone(),
        changes,
    }
}

// ── Apply path ──────────────────────────────────────────────────────────

/// Apply a [`RewriteMap`] to an artifact YAML file and return the new
/// content. Mechanical-only — bails if any conflict-class change touches
/// the file.
///
/// We work at the parsed `serde_yaml::Value` level rather than CST
/// editing for simplicity and because Phase 1 explicitly does not
/// preserve formatting (snapshots cover the rollback story). The result
/// is canonical-formatted YAML via `serde_yaml::to_string`.
pub fn apply_to_file(
    original: &str,
    file_changes: &[&PlannedChange],
    recipe: &MigrationRecipe,
) -> Result<String, Error> {
    // Bail loudly on any conflict in this file.
    if file_changes
        .iter()
        .any(|c| c.action == ActionClass::Conflict)
    {
        return Err(Error::Schema(format!(
            "file has {} conflict(s); --apply is mechanical-only in Phase 1",
            file_changes
                .iter()
                .filter(|c| c.action == ActionClass::Conflict)
                .count()
        )));
    }

    let mut doc: serde_yaml::Value = serde_yaml::from_str(original).map_err(Error::Yaml)?;

    let artifacts = doc
        .as_mapping_mut()
        .and_then(|m| m.get_mut("artifacts"))
        .and_then(|v| v.as_sequence_mut());

    let Some(artifacts) = artifacts else {
        // No `artifacts:` key — nothing to do. Return original.
        return Ok(original.to_string());
    };

    let type_map: BTreeMap<&str, &TypeRewrite> = recipe
        .type_rewrites
        .iter()
        .map(|tr| (tr.from.as_str(), tr))
        .collect();
    let link_map: BTreeMap<&str, &LinkRewrite> = recipe
        .link_rewrites
        .iter()
        .map(|lr| (lr.from.as_str(), lr))
        .collect();

    // Collect changes by artifact id for fast lookup.
    let mut field_renames: BTreeMap<String, BTreeMap<String, String>> = BTreeMap::new();
    let mut field_drops: BTreeMap<String, Vec<(String, UnmappedFieldPolicy)>> = BTreeMap::new();
    for c in file_changes {
        match &c.change {
            ChangeKind::FieldRename { from, to, .. } => {
                field_renames
                    .entry(c.artifact_id.clone())
                    .or_default()
                    .insert(from.clone(), to.clone());
            }
            ChangeKind::FieldDrop { field, policy, .. } => {
                field_drops
                    .entry(c.artifact_id.clone())
                    .or_default()
                    .push((field.clone(), *policy));
            }
            _ => {}
        }
    }

    for artifact in artifacts.iter_mut() {
        let Some(map) = artifact.as_mapping_mut() else {
            continue;
        };

        let id = map
            .get(serde_yaml::Value::String("id".into()))
            .and_then(|v| v.as_str())
            .map(|s| s.to_string())
            .unwrap_or_default();

        // ── Type rename ──────────────────────────────────────────────
        let current_type = map
            .get(serde_yaml::Value::String("type".into()))
            .and_then(|v| v.as_str())
            .map(|s| s.to_string());

        if let Some(t) = current_type.as_deref() {
            if let Some(tr) = type_map.get(t) {
                map.insert(
                    serde_yaml::Value::String("type".into()),
                    serde_yaml::Value::String(tr.to.clone()),
                );
            }
        }

        // ── Link-type renames ────────────────────────────────────────
        if let Some(links) = map
            .get_mut(serde_yaml::Value::String("links".into()))
            .and_then(|v| v.as_sequence_mut())
        {
            for link in links.iter_mut() {
                if let Some(link_map_val) = link.as_mapping_mut() {
                    let current_type = link_map_val
                        .get(serde_yaml::Value::String("type".into()))
                        .and_then(|v| v.as_str())
                        .map(|s| s.to_string());
                    if let Some(t) = current_type.as_deref() {
                        if let Some(lr) = link_map.get(t) {
                            link_map_val.insert(
                                serde_yaml::Value::String("type".into()),
                                serde_yaml::Value::String(lr.to.clone()),
                            );
                        }
                    }
                }
            }
        }

        // ── Field renames + drops ───────────────────────────────────
        // Both can apply to either the inline mapping (top-level keys
        // outside of `links` / `id` / `type` / etc.) or to the
        // `fields:` sub-mapping. We migrate both for compatibility
        // with both YAML conventions used in the codebase.
        if let Some(renames) = field_renames.get(&id) {
            apply_field_renames(map, renames);
        }
        if let Some(drops) = field_drops.get(&id) {
            apply_field_drops(map, drops);
        }
    }

    serde_yaml::to_string(&doc).map_err(Error::Yaml)
}

fn apply_field_renames(map: &mut serde_yaml::Mapping, renames: &BTreeMap<String, String>) {
    // Operate on top-level keys.
    for (from, to) in renames {
        let key = serde_yaml::Value::String(from.clone());
        if let Some(value) = map.remove(&key) {
            map.insert(serde_yaml::Value::String(to.clone()), value);
        }
    }
    // Operate on nested `fields:` mapping.
    if let Some(fields) = map
        .get_mut(serde_yaml::Value::String("fields".into()))
        .and_then(|v| v.as_mapping_mut())
    {
        for (from, to) in renames {
            let key = serde_yaml::Value::String(from.clone());
            if let Some(value) = fields.remove(&key) {
                fields.insert(serde_yaml::Value::String(to.clone()), value);
            }
        }
    }
}

fn apply_field_drops(map: &mut serde_yaml::Mapping, drops: &[(String, UnmappedFieldPolicy)]) {
    // We only operate on the nested `fields:` mapping for drops —
    // top-level keys like `id`, `title`, `status`, `links`, `tags`,
    // `description` are base fields and not dropped by the migration.
    let Some(fields) = map
        .get_mut(serde_yaml::Value::String("fields".into()))
        .and_then(|v| v.as_mapping_mut())
    else {
        return;
    };
    let mut legacy_stash: Vec<(String, serde_yaml::Value)> = Vec::new();
    for (field, policy) in drops {
        let key = serde_yaml::Value::String(field.clone());
        let Some(value) = fields.remove(&key) else {
            continue;
        };
        if matches!(policy, UnmappedFieldPolicy::KeepAsOrphan) {
            legacy_stash.push((field.clone(), value));
        }
        // Drop / Strict: nothing else to do (Strict was already
        // diagnosed as a conflict and we wouldn't get here).
    }
    if !legacy_stash.is_empty() {
        // Get-or-create the `legacy` sub-mapping.
        let legacy_key = serde_yaml::Value::String("legacy".into());
        let legacy_map = match fields.get_mut(&legacy_key) {
            Some(serde_yaml::Value::Mapping(m)) => m,
            _ => {
                fields.insert(
                    legacy_key.clone(),
                    serde_yaml::Value::Mapping(serde_yaml::Mapping::new()),
                );
                fields
                    .get_mut(&legacy_key)
                    .and_then(|v| v.as_mapping_mut())
                    .expect("just inserted")
            }
        };
        for (k, v) in legacy_stash {
            legacy_map.insert(serde_yaml::Value::String(k), v);
        }
    }
}

// ── Snapshot ────────────────────────────────────────────────────────────

/// Recursively copy a directory tree from `src` to `dst`. Used for
/// the pre-migration snapshot. Symlinks are not followed; binary files
/// are byte-copied. If `src` is a file, `dst` is treated as the
/// destination *file* path (its parent directory is created).
pub fn copy_tree(src: &Path, dst: &Path) -> Result<(), Error> {
    if !src.exists() {
        return Ok(());
    }

    if src.is_file() {
        if let Some(parent) = dst.parent() {
            std::fs::create_dir_all(parent)
                .map_err(|e| Error::Io(format!("creating {}: {}", parent.display(), e)))?;
        }
        std::fs::copy(src, dst).map_err(|e| {
            Error::Io(format!(
                "copying {} -> {}: {}",
                src.display(),
                dst.display(),
                e
            ))
        })?;
        return Ok(());
    }

    std::fs::create_dir_all(dst)
        .map_err(|e| Error::Io(format!("creating {}: {}", dst.display(), e)))?;

    let entries = std::fs::read_dir(src)
        .map_err(|e| Error::Io(format!("reading {}: {}", src.display(), e)))?;
    for entry in entries.filter_map(|e| e.ok()) {
        let path = entry.path();
        let name = entry.file_name();
        let target = dst.join(&name);
        if path.is_dir() {
            copy_tree(&path, &target)?;
        } else {
            std::fs::copy(&path, &target).map_err(|e| {
                Error::Io(format!(
                    "copying {} -> {}: {}",
                    path.display(),
                    target.display(),
                    e
                ))
            })?;
        }
    }
    Ok(())
}

/// Recursively delete a directory tree (best-effort).
pub fn remove_tree(path: &Path) -> Result<(), Error> {
    if !path.exists() {
        return Ok(());
    }
    std::fs::remove_dir_all(path)
        .map_err(|e| Error::Io(format!("removing {}: {}", path.display(), e)))
}

// ── Migration directory layout ─────────────────────────────────────────

/// Migration state machine pointer.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "UPPERCASE")]
pub enum MigrationState {
    Planned,
    InProgress,
    Complete,
}

impl MigrationState {
    pub fn as_str(&self) -> &'static str {
        match self {
            MigrationState::Planned => "PLANNED",
            MigrationState::InProgress => "IN_PROGRESS",
            MigrationState::Complete => "COMPLETE",
        }
    }
    pub fn parse(s: &str) -> Option<Self> {
        match s.trim() {
            "PLANNED" => Some(MigrationState::Planned),
            "IN_PROGRESS" => Some(MigrationState::InProgress),
            "COMPLETE" => Some(MigrationState::Complete),
            _ => None,
        }
    }
}

/// Per-migration manifest written to `manifest.yaml`.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct MigrationManifest {
    pub recipe: String,
    pub source_preset: String,
    pub target_preset: String,
    pub created_at: String,
    pub state: MigrationState,
    /// Number of mechanical / decidable / conflict changes in the plan.
    pub mechanical_count: usize,
    pub decidable_count: usize,
    pub conflict_count: usize,
}

/// Conventional layout helpers for a single migration directory.
pub struct MigrationLayout {
    pub root: PathBuf,
}

impl MigrationLayout {
    pub fn new(project_root: &Path, dir_name: &str) -> Self {
        Self {
            root: project_root
                .join(".rivet")
                .join("migrations")
                .join(dir_name),
        }
    }
    pub fn plan_path(&self) -> PathBuf {
        self.root.join("plan.yaml")
    }
    pub fn manifest_path(&self) -> PathBuf {
        self.root.join("manifest.yaml")
    }
    pub fn state_path(&self) -> PathBuf {
        self.root.join("state")
    }
    pub fn snapshot_dir(&self) -> PathBuf {
        self.root.join("snapshot")
    }

    pub fn write_state(&self, state: MigrationState) -> Result<(), Error> {
        std::fs::create_dir_all(&self.root)
            .map_err(|e| Error::Io(format!("creating {}: {}", self.root.display(), e)))?;
        std::fs::write(self.state_path(), state.as_str())
            .map_err(|e| Error::Io(format!("writing state: {}", e)))?;
        Ok(())
    }

    pub fn read_state(&self) -> Result<MigrationState, Error> {
        let s = std::fs::read_to_string(self.state_path())
            .map_err(|e| Error::Io(format!("reading state: {}", e)))?;
        MigrationState::parse(&s).ok_or_else(|| Error::Schema(format!("unknown state '{s}'")))
    }
}

/// Discover the most recent migration directory under
/// `<project>/.rivet/migrations`, if any.
pub fn find_latest_migration(project_root: &Path) -> Option<MigrationLayout> {
    let dir = project_root.join(".rivet").join("migrations");
    if !dir.exists() {
        return None;
    }
    let mut entries: Vec<PathBuf> = std::fs::read_dir(&dir)
        .ok()?
        .filter_map(|e| e.ok().map(|e| e.path()))
        .filter(|p| p.is_dir())
        .collect();
    entries.sort();
    entries.last().map(|p| MigrationLayout { root: p.clone() })
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::model::{Artifact, Link};

    fn dev_to_aspice() -> MigrationRecipe {
        MigrationRecipe {
            name: "dev-to-aspice".into(),
            source: PresetRef {
                preset: "dev".into(),
            },
            target: PresetRef {
                preset: "aspice".into(),
            },
            description: None,
            type_rewrites: vec![
                TypeRewrite {
                    from: "requirement".into(),
                    to: "sw-req".into(),
                    field_map: BTreeMap::new(),
                },
                TypeRewrite {
                    from: "feature".into(),
                    to: "sw-arch-component".into(),
                    field_map: BTreeMap::new(),
                },
                TypeRewrite {
                    from: "design-decision".into(),
                    to: "design-decision".into(),
                    field_map: BTreeMap::new(),
                },
            ],
            link_rewrites: vec![LinkRewrite {
                from: "satisfies".into(),
                to: "derives-from".into(),
            }],
            policies: MigrationPolicies::default(),
        }
    }

    fn artifact(id: &str, ty: &str) -> Artifact {
        Artifact {
            id: id.into(),
            artifact_type: ty.into(),
            title: format!("Title {id}"),
            description: None,
            status: Some("draft".into()),
            tags: vec![],
            links: vec![],
            fields: BTreeMap::new(),
            provenance: None,
            source_file: Some(PathBuf::from("artifacts/test.yaml")),
        }
    }

    #[test]
    fn diff_emits_type_rename_for_each_match() {
        let recipe = dev_to_aspice();
        let arts = vec![
            artifact("REQ-001", "requirement"),
            artifact("FEAT-001", "feature"),
            artifact("DD-001", "design-decision"),
        ];
        let map = diff_artifacts(&recipe, &arts, None);
        assert_eq!(
            map.changes.len(),
            2,
            "identity rewrite (DD) should not emit"
        );
        let kinds: Vec<_> = map
            .changes
            .iter()
            .map(|c| match &c.change {
                ChangeKind::TypeRename { from, to } => format!("{from}->{to}"),
                _ => "?".into(),
            })
            .collect();
        assert!(kinds.contains(&"requirement->sw-req".to_string()));
        assert!(kinds.contains(&"feature->sw-arch-component".to_string()));
        assert!(!map.has_conflicts());
        assert_eq!(map.count(ActionClass::Mechanical), 2);
    }

    #[test]
    fn diff_emits_link_rename_only_once_per_artifact() {
        let recipe = dev_to_aspice();
        let mut a = artifact("REQ-001", "requirement");
        a.links = vec![
            Link {
                link_type: "satisfies".into(),
                target: "DD-001".into(),
            },
            Link {
                link_type: "satisfies".into(),
                target: "DD-002".into(),
            },
        ];
        let map = diff_artifacts(&recipe, &[a], None);
        let link_renames = map
            .changes
            .iter()
            .filter(|c| matches!(c.change, ChangeKind::LinkTypeRename { .. }))
            .count();
        assert_eq!(link_renames, 1, "duplicate link types should collapse");
    }

    #[test]
    fn diff_marks_unmapped_field_decidable_with_default_policy() {
        // Build a tiny target schema with `sw-req` having only `priority`.
        let mut target = Schema {
            artifact_types: std::collections::HashMap::new(),
            link_types: std::collections::HashMap::new(),
            inverse_map: std::collections::HashMap::new(),
            traceability_rules: vec![],
            conditional_rules: vec![],
        };
        let sw_req = crate::schema::ArtifactTypeDef {
            name: "sw-req".into(),
            description: "".into(),
            fields: vec![crate::schema::FieldDef {
                name: "priority".into(),
                field_type: "string".into(),
                required: false,
                description: None,
                allowed_values: None,
            }],
            link_fields: vec![],
            aspice_process: None,
            common_mistakes: vec![],
            example: None,
            yaml_section: None,
            yaml_sections: vec![],
            yaml_section_suffix: None,
            shorthand_links: BTreeMap::new(),
        };
        target.artifact_types.insert("sw-req".into(), sw_req);

        let mut a = artifact("REQ-001", "requirement");
        a.fields
            .insert("priority".into(), serde_yaml::Value::String("must".into()));
        a.fields.insert(
            "category".into(),
            serde_yaml::Value::String("functional".into()),
        );

        let recipe = dev_to_aspice();
        let map = diff_artifacts(&recipe, &[a], Some(&target));
        // priority maps cleanly (same name on both sides) -> no event.
        // category has no mapping -> decidable-with-policy (default = drop).
        let drops: Vec<&PlannedChange> = map
            .changes
            .iter()
            .filter(|c| matches!(c.change, ChangeKind::FieldDrop { .. }))
            .collect();
        assert_eq!(drops.len(), 1);
        assert_eq!(drops[0].action, ActionClass::DecidableWithPolicy);
    }

    #[test]
    fn apply_rewrites_type_and_link_in_a_single_file() {
        let recipe = dev_to_aspice();
        let original = r#"artifacts:
  - id: REQ-001
    type: requirement
    title: First
    status: draft
    links:
      - type: satisfies
        target: DD-001
    fields:
      priority: must
"#;
        let changes = [
            PlannedChange {
                artifact_id: "REQ-001".into(),
                source_file: Some("artifacts/x.yaml".into()),
                action: ActionClass::Mechanical,
                change: ChangeKind::TypeRename {
                    from: "requirement".into(),
                    to: "sw-req".into(),
                },
            },
            PlannedChange {
                artifact_id: "REQ-001".into(),
                source_file: Some("artifacts/x.yaml".into()),
                action: ActionClass::Mechanical,
                change: ChangeKind::LinkTypeRename {
                    from: "satisfies".into(),
                    to: "derives-from".into(),
                },
            },
        ];
        let refs: Vec<&PlannedChange> = changes.iter().collect();
        let out = apply_to_file(original, &refs, &recipe).expect("apply");
        assert!(out.contains("type: sw-req"), "type rename: {out}");
        assert!(out.contains("type: derives-from"), "link rename: {out}");
        assert!(!out.contains("type: requirement"));
        assert!(!out.contains("type: satisfies"));
    }

    #[test]
    fn apply_with_keep_as_orphan_stashes_legacy() {
        let mut recipe = dev_to_aspice();
        recipe.policies.unmapped_fields = UnmappedFieldPolicy::KeepAsOrphan;
        let original = r#"artifacts:
  - id: REQ-001
    type: requirement
    title: x
    fields:
      priority: must
      category: functional
"#;
        let changes = [PlannedChange {
            artifact_id: "REQ-001".into(),
            source_file: Some("a.yaml".into()),
            action: ActionClass::DecidableWithPolicy,
            change: ChangeKind::FieldDrop {
                in_type: "sw-req".into(),
                field: "category".into(),
                policy: UnmappedFieldPolicy::KeepAsOrphan,
            },
        }];
        let refs: Vec<&PlannedChange> = changes.iter().collect();
        let out = apply_to_file(original, &refs, &recipe).expect("apply");
        assert!(out.contains("legacy:"), "expected legacy stash: {out}");
        assert!(out.contains("category: functional"));
    }

    #[test]
    fn apply_bails_on_conflict() {
        let recipe = dev_to_aspice();
        let original = "artifacts:\n  - id: x\n    type: requirement\n";
        let changes = [PlannedChange {
            artifact_id: "x".into(),
            source_file: Some("a.yaml".into()),
            action: ActionClass::Conflict,
            change: ChangeKind::FieldValueConflict {
                in_type: "sw-req".into(),
                field: "priority".into(),
                from_value: "5".into(),
                target_constraint: "[must|should|could]".into(),
            },
        }];
        let refs: Vec<&PlannedChange> = changes.iter().collect();
        let err = apply_to_file(original, &refs, &recipe).unwrap_err();
        let msg = format!("{err}");
        assert!(msg.contains("conflict"), "msg: {msg}");
    }

    #[test]
    fn recipe_parses_canonical_dev_to_aspice_yaml() {
        let yaml = r#"migration:
  name: dev-to-aspice
  source: { preset: dev }
  target: { preset: aspice }
  description: |
    Mechanical mapping for the most common dev -> aspice transition.
  type-rewrites:
    - from: requirement
      to: sw-req
    - from: feature
      to: sw-arch-component
    - from: design-decision
      to: design-decision
  link-rewrites:
    - from: satisfies
      to: derives-from
  policies:
    unmapped-fields: keep-as-orphan
    unmapped-link-types: drop
"#;
        let parsed = MigrationRecipeFile::parse(yaml).expect("parse");
        assert_eq!(parsed.migration.name, "dev-to-aspice");
        assert_eq!(parsed.migration.type_rewrites.len(), 3);
        assert_eq!(
            parsed.migration.policies.unmapped_fields,
            UnmappedFieldPolicy::KeepAsOrphan
        );
        assert_eq!(
            parsed.migration.policies.unmapped_link_types,
            UnmappedLinkPolicy::Drop
        );
    }

    #[test]
    fn migration_state_roundtrips_through_string() {
        for s in [
            MigrationState::Planned,
            MigrationState::InProgress,
            MigrationState::Complete,
        ] {
            let parsed = MigrationState::parse(s.as_str()).unwrap();
            assert_eq!(s, parsed);
        }
    }
}
