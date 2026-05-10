//! Schema migration engine — diff source/target schema sets and rewrite
//! artifacts mechanically, with rebase-style conflict resolution.
//!
//! Phase 1 (#236): mechanical-only migration. The diff engine computes
//! a [`RewriteMap`] from a [`MigrationRecipe`] (and optional schema
//! introspection), and [`apply_to_file`] rewrites a single artifact
//! YAML file in place.
//!
//! Phase 2 (#236): conflict resolution UX. The diff engine now flags
//! `FieldValueConflict` for any source field whose value violates the
//! target field's `allowed_values` enum. [`apply_to_file_partial`] is
//! the conflict-tolerant variant of `apply_to_file` (skips Conflict-
//! class entries instead of bailing). [`write_conflict_markers`]
//! splices git-rebase-style markers into a YAML file for the user to
//! resolve, and [`scan_conflict_markers`] is the inverse used by
//! `--continue` and the `MigrationConflict` doc-check invariant.
//! [`restore_artifact_from_snapshot`] backs the `--skip` subcommand.
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

// ── Recipe registry (discovery) ─────────────────────────────────────────

/// Where a registered migration recipe came from.
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "kebab-case")]
pub enum RecipeOrigin {
    /// Compiled into the binary via `include_str!`.
    BuiltIn,
    /// Loaded from `<schemas-dir>/migrations/*.yaml`.
    ProjectLocal,
}

impl RecipeOrigin {
    /// Human-readable label.
    pub fn as_str(self) -> &'static str {
        match self {
            RecipeOrigin::BuiltIn => "built-in",
            RecipeOrigin::ProjectLocal => "project-local",
        }
    }
}

/// A recipe entry surfaced by [`list_recipes`].
///
/// Designed for `rivet schema migrate --list` and any future programmatic
/// consumer (dashboard, MCP). Carries only metadata — the full
/// [`MigrationRecipe`] is loaded lazily via [`MigrationRecipeFile`].
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct RecipeEntry {
    pub name: String,
    pub source_preset: String,
    pub target_preset: String,
    pub description: Option<String>,
    pub origin: RecipeOrigin,
    /// Absolute path on disk for project-local recipes; None for built-ins.
    pub path: Option<PathBuf>,
}

/// Enumerate every available migration recipe — built-in and
/// project-local. Project-local recipes (`<schemas_dir>/migrations/*.yaml`)
/// shadow built-ins of the same name (the project-local copy is the one
/// returned).
///
/// Errors loading individual on-disk recipes are returned as `Err` only
/// when the migrations directory itself is unreadable; per-file parse
/// failures are surfaced to the caller as warnings via the second tuple
/// element of the result.
pub fn list_recipes(schemas_dir: &Path) -> (Vec<RecipeEntry>, Vec<String>) {
    use crate::embedded::MIGRATION_RECIPES;

    let mut warnings: Vec<String> = Vec::new();
    let mut by_name: BTreeMap<String, RecipeEntry> = BTreeMap::new();

    // Built-in recipes first.
    for (name, content) in MIGRATION_RECIPES.iter() {
        match MigrationRecipeFile::parse(content) {
            Ok(file) => {
                let r = file.migration;
                by_name.insert(
                    (*name).to_string(),
                    RecipeEntry {
                        name: r.name.clone(),
                        source_preset: r.source.preset.clone(),
                        target_preset: r.target.preset.clone(),
                        description: r.description.clone(),
                        origin: RecipeOrigin::BuiltIn,
                        path: None,
                    },
                );
            }
            Err(e) => warnings.push(format!("built-in recipe '{name}': {e}")),
        }
    }

    // Then walk schemas/migrations/*.yaml. A project-local recipe with
    // the same name as a built-in shadows the built-in.
    let dir = schemas_dir.join("migrations");
    if dir.exists() {
        match std::fs::read_dir(&dir) {
            Ok(rd) => {
                for entry in rd.flatten() {
                    let path = entry.path();
                    if path.extension().and_then(|s| s.to_str()) != Some("yaml") {
                        continue;
                    }
                    match MigrationRecipeFile::load(&path) {
                        Ok(file) => {
                            let r = file.migration;
                            by_name.insert(
                                r.name.clone(),
                                RecipeEntry {
                                    name: r.name.clone(),
                                    source_preset: r.source.preset.clone(),
                                    target_preset: r.target.preset.clone(),
                                    description: r.description.clone(),
                                    origin: RecipeOrigin::ProjectLocal,
                                    path: Some(path.clone()),
                                },
                            );
                        }
                        Err(e) => warnings.push(format!("recipe {}: {e}", path.display())),
                    }
                }
            }
            Err(e) => warnings.push(format!("reading {}: {e}", dir.display())),
        }
    }

    let mut entries: Vec<RecipeEntry> = by_name.into_values().collect();
    entries.sort_by(|a, b| a.name.cmp(&b.name));
    (entries, warnings)
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

        for (field_name, field_value) in &artifact.fields {
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
            // If it does, the value still has to match the target's
            // `allowed_values` — otherwise it's a conflict (e.g.
            // `priority: 5` -> enum [must|should|could|wont]).
            // If the field isn't on the target type, apply the
            // unmapped-fields policy.
            if let Some(target_def) = target_type_def {
                if target_field_names.contains(field_name) {
                    if let Some(target_field) =
                        target_def.fields.iter().find(|f| f.name == *field_name)
                    {
                        if let Some(allowed) = &target_field.allowed_values {
                            let current_value = yaml_value_as_display(field_value);
                            if !allowed.iter().any(|v| v == &current_value) {
                                changes.push(PlannedChange {
                                    artifact_id: artifact.id.clone(),
                                    source_file: source_file.clone(),
                                    action: ActionClass::Conflict,
                                    change: ChangeKind::FieldValueConflict {
                                        in_type: target_type_name.clone(),
                                        field: field_name.clone(),
                                        from_value: current_value,
                                        target_constraint: format!("[{}]", allowed.join("|")),
                                    },
                                });
                            }
                        }
                    }
                } else {
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
/// Phase 2 added [`apply_to_file_partial`] which applies the
/// mechanical / decidable changes and ignores conflicts (they're left
/// for the conflict-marker path).
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

/// Like [`apply_to_file`], but tolerates conflict-class changes by
/// skipping them. Used by the Phase 2 `--apply` walker to apply every
/// auto-resolvable change in a file before pausing on the first
/// conflict (which is then handled by [`write_conflict_markers`]).
pub fn apply_to_file_partial(
    original: &str,
    file_changes: &[&PlannedChange],
    recipe: &MigrationRecipe,
) -> Result<String, Error> {
    let auto: Vec<&PlannedChange> = file_changes
        .iter()
        .filter(|c| c.action != ActionClass::Conflict)
        .copied()
        .collect();
    if auto.is_empty() {
        return Ok(original.to_string());
    }
    apply_to_file(original, &auto, recipe)
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

// ── Conflict markers (Phase 2) ─────────────────────────────────────────

/// Format a `serde_yaml::Value` as a single-line printable string for
/// embedding in conflict markers / diagnostics. Mappings/sequences are
/// rendered via `serde_yaml::to_string` and trimmed; scalars are
/// rendered without surrounding quotes.
pub fn yaml_value_as_display(v: &serde_yaml::Value) -> String {
    match v {
        serde_yaml::Value::Null => "~".to_string(),
        serde_yaml::Value::Bool(b) => b.to_string(),
        serde_yaml::Value::Number(n) => n.to_string(),
        serde_yaml::Value::String(s) => s.clone(),
        other => serde_yaml::to_string(other)
            .unwrap_or_default()
            .trim_end()
            .to_string(),
    }
}

/// Markers used to bracket a conflict region in artifact YAML. These
/// follow git rebase/merge convention with a YAML-friendly header.
pub const CONFLICT_OPEN: &str = "<<<<<<<";
pub const CONFLICT_SEPARATOR: &str = "=======";
pub const CONFLICT_CLOSE: &str = ">>>>>>>";

/// Render conflict markers for a single artifact field-value conflict.
///
/// We don't surgically embed the markers into the existing YAML
/// (that would require a YAML preserving editor we don't have); instead
/// we replace the whole file with a hand-rolled YAML that preserves all
/// other artifacts byte-faithfully, while the conflicted artifact is
/// rewritten into a minimal form with the markers in place. The user
/// edits the file, removes the markers, and runs `--continue`.
///
/// Returns the new file content. The markers look like:
///
/// ```text
/// fields:
///   priority: <<<<<<< source: dev (priority: number)
///     5
///     ======= target: aspice (priority: enum [must|should|could|wont])
///     <choose one>
///     >>>>>>>
/// ```
pub fn write_conflict_markers(
    original: &str,
    artifact_id: &str,
    conflict: &PlannedChange,
    source_preset: &str,
    target_preset: &str,
) -> Result<String, Error> {
    let ChangeKind::FieldValueConflict {
        in_type,
        field,
        from_value,
        target_constraint,
    } = &conflict.change
    else {
        return Err(Error::Schema(
            "write_conflict_markers: only FieldValueConflict supported".into(),
        ));
    };

    let mut doc: serde_yaml::Value = serde_yaml::from_str(original).map_err(Error::Yaml)?;
    let artifacts = doc
        .as_mapping_mut()
        .and_then(|m| m.get_mut("artifacts"))
        .and_then(|v| v.as_sequence_mut())
        .ok_or_else(|| Error::Schema("file has no `artifacts:` sequence".into()))?;

    // Find the artifact by id and stamp a sentinel onto the field so
    // the post-serialise pass can splice in the human-readable markers.
    let sentinel = format!("__RIVET_CONFLICT_SENTINEL__{artifact_id}__{field}__");
    let mut found = false;
    for art in artifacts.iter_mut() {
        let Some(map) = art.as_mapping_mut() else {
            continue;
        };
        let id = map
            .get(serde_yaml::Value::String("id".into()))
            .and_then(|v| v.as_str())
            .map(|s| s.to_string())
            .unwrap_or_default();
        if id != artifact_id {
            continue;
        }
        if let Some(fields) = map
            .get_mut(serde_yaml::Value::String("fields".into()))
            .and_then(|v| v.as_mapping_mut())
        {
            fields.insert(
                serde_yaml::Value::String(field.clone()),
                serde_yaml::Value::String(sentinel.clone()),
            );
        }
        found = true;
        break;
    }
    if !found {
        return Err(Error::Schema(format!(
            "artifact {artifact_id} not found in file"
        )));
    }

    let serialised = serde_yaml::to_string(&doc).map_err(Error::Yaml)?;

    // Splice the sentinel line out and replace it with a multi-line
    // conflict block. We match on `<field>: <sentinel>` so we don't
    // accidentally rewrite a different field. The indentation used for
    // the body lines is two more spaces than the field-line indent.
    let needle = format!("{field}: {sentinel}");
    let replacement = render_conflict_block(
        in_type,
        field,
        source_preset,
        target_preset,
        from_value,
        target_constraint,
    );

    let mut out = String::with_capacity(serialised.len() + replacement.len());
    let mut found_line = false;
    for line in serialised.split_inclusive('\n') {
        if !found_line && line.contains(&needle) {
            found_line = true;
            // preserve leading indent of the original line
            let indent: String = line.chars().take_while(|c| c.is_whitespace()).collect();
            for body_line in replacement.lines() {
                out.push_str(&indent);
                out.push_str(body_line);
                out.push('\n');
            }
        } else {
            out.push_str(line);
        }
    }
    if !found_line {
        return Err(Error::Schema(
            "internal: conflict sentinel was lost during serialisation".into(),
        ));
    }
    Ok(out)
}

fn render_conflict_block(
    in_type: &str,
    field: &str,
    source_preset: &str,
    target_preset: &str,
    from_value: &str,
    target_constraint: &str,
) -> String {
    let mut s = String::new();
    s.push_str(&format!(
        "{field}: {CONFLICT_OPEN} source: {source_preset} ({field}: {from_value})\n"
    ));
    s.push_str(&format!("  {from_value}\n"));
    s.push_str(&format!(
        "  {CONFLICT_SEPARATOR} target: {target_preset} ({in_type}.{field}: {target_constraint})\n"
    ));
    s.push_str("  <choose one>\n");
    s.push_str(&format!("  {CONFLICT_CLOSE}\n"));
    s
}

/// Scan a string for any conflict markers. Returns the line numbers
/// (1-based) on which open/close markers occur.
pub fn scan_conflict_markers(content: &str) -> Vec<usize> {
    let mut hits = Vec::new();
    for (idx, line) in content.lines().enumerate() {
        let l = line.trim_start();
        if l.starts_with(CONFLICT_OPEN)
            || l.starts_with(CONFLICT_SEPARATOR)
            || l.starts_with(CONFLICT_CLOSE)
        {
            hits.push(idx + 1);
        }
    }
    hits
}

/// True if `content` contains any unresolved conflict markers.
pub fn has_conflict_markers(content: &str) -> bool {
    !scan_conflict_markers(content).is_empty()
}

/// Restore a single artifact (by ID) from a snapshot back into the
/// project. Used by `--skip` to drop a conflicted artifact from the
/// migration. The artifact is assumed to live in the same file path on
/// both sides; we read the file from the snapshot, locate the artifact
/// by id, and copy that one entry over the project file.
pub fn restore_artifact_from_snapshot(
    snapshot_root: &Path,
    project_root: &Path,
    relative_file: &Path,
    artifact_id: &str,
) -> Result<(), Error> {
    let snap_path = snapshot_root.join(relative_file);
    let proj_path = project_root.join(relative_file);
    let snap_content = std::fs::read_to_string(&snap_path)
        .map_err(|e| Error::Io(format!("reading {}: {}", snap_path.display(), e)))?;
    let proj_content = std::fs::read_to_string(&proj_path)
        .map_err(|e| Error::Io(format!("reading {}: {}", proj_path.display(), e)))?;

    let mut proj_doc: serde_yaml::Value =
        serde_yaml::from_str(&proj_content).map_err(Error::Yaml)?;
    let snap_doc: serde_yaml::Value = serde_yaml::from_str(&snap_content).map_err(Error::Yaml)?;

    // Find the snapshot version of this artifact.
    let snap_artifact = snap_doc
        .as_mapping()
        .and_then(|m| m.get("artifacts"))
        .and_then(|v| v.as_sequence())
        .and_then(|seq| {
            seq.iter().find(|a| {
                a.as_mapping()
                    .and_then(|m| m.get("id"))
                    .and_then(|v| v.as_str())
                    .map(|s| s == artifact_id)
                    .unwrap_or(false)
            })
        })
        .cloned()
        .ok_or_else(|| {
            Error::Schema(format!(
                "artifact {artifact_id} not in snapshot {}",
                snap_path.display()
            ))
        })?;

    // Replace (or insert) the artifact in the project doc.
    let proj_artifacts = proj_doc
        .as_mapping_mut()
        .and_then(|m| m.get_mut("artifacts"))
        .and_then(|v| v.as_sequence_mut())
        .ok_or_else(|| Error::Schema(format!("no artifacts seq in {}", proj_path.display())))?;
    let mut replaced = false;
    for art in proj_artifacts.iter_mut() {
        let id = art
            .as_mapping()
            .and_then(|m| m.get("id"))
            .and_then(|v| v.as_str())
            .map(|s| s.to_string())
            .unwrap_or_default();
        if id == artifact_id {
            *art = snap_artifact.clone();
            replaced = true;
            break;
        }
    }
    if !replaced {
        proj_artifacts.push(snap_artifact);
    }

    let new_content = serde_yaml::to_string(&proj_doc).map_err(Error::Yaml)?;
    std::fs::write(&proj_path, new_content)
        .map_err(|e| Error::Io(format!("writing {}: {}", proj_path.display(), e)))?;
    Ok(())
}

/// Lookup a conflict in the plan by artifact id. Returns `None` if
/// none of the changes for that artifact are conflict-class.
pub fn first_conflict_for_artifact<'a>(
    rewrite: &'a RewriteMap,
    artifact_id: &str,
) -> Option<&'a PlannedChange> {
    rewrite
        .changes
        .iter()
        .find(|c| c.artifact_id == artifact_id && c.action == ActionClass::Conflict)
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
///
/// Phase 1 (#236) had `Planned / InProgress / Complete`. Phase 2 adds
/// `Conflict` — the in-flight pause state when `--apply` writes
/// rebase-style markers into the affected artifact YAML and waits for
/// the user to resolve them via `--continue` or `--skip`.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "UPPERCASE")]
pub enum MigrationState {
    Planned,
    InProgress,
    Conflict,
    Complete,
}

impl MigrationState {
    pub fn as_str(&self) -> &'static str {
        match self {
            MigrationState::Planned => "PLANNED",
            MigrationState::InProgress => "IN_PROGRESS",
            MigrationState::Conflict => "CONFLICT",
            MigrationState::Complete => "COMPLETE",
        }
    }
    pub fn parse(s: &str) -> Option<Self> {
        match s.trim() {
            "PLANNED" => Some(MigrationState::Planned),
            "IN_PROGRESS" => Some(MigrationState::InProgress),
            "CONFLICT" => Some(MigrationState::Conflict),
            "COMPLETE" => Some(MigrationState::Complete),
            _ => None,
        }
    }
}

/// Per-artifact resolution status tracked through the conflict-resolution
/// flow (Phase 2). Mechanical/decidable changes commit silently; only
/// conflicts produce a journal entry.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum ResolutionStatus {
    /// Conflict markers are currently in the file; user is editing.
    Pending,
    /// User ran `--continue`; markers were removed and the artifact
    /// validated.
    Resolved,
    /// User ran `--skip`; original artifact was restored from snapshot
    /// and the migration moved on.
    Skipped,
}

/// Per-migration manifest written to `manifest.yaml`.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(deny_unknown_fields, default)]
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
    /// Per-artifact resolution status tracked across `--apply` /
    /// `--continue` / `--skip` / `--edit`. Empty until the first
    /// conflict is reached.
    #[serde(default)]
    pub resolutions: BTreeMap<String, ResolutionStatus>,
}

impl Default for MigrationManifest {
    fn default() -> Self {
        Self {
            recipe: String::new(),
            source_preset: String::new(),
            target_preset: String::new(),
            created_at: String::new(),
            state: MigrationState::Planned,
            mechanical_count: 0,
            decidable_count: 0,
            conflict_count: 0,
            resolutions: BTreeMap::new(),
        }
    }
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
    /// Path to the `current-conflict` pointer file (Phase 2). Holds the
    /// artifact ID that `--apply` paused on, or is absent when no
    /// conflict is active.
    pub fn current_conflict_path(&self) -> PathBuf {
        self.root.join("current-conflict")
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

    /// Set or clear the `current-conflict` pointer.
    pub fn write_current_conflict(&self, artifact_id: Option<&str>) -> Result<(), Error> {
        let path = self.current_conflict_path();
        match artifact_id {
            Some(id) => std::fs::write(&path, id)
                .map_err(|e| Error::Io(format!("writing current-conflict: {e}"))),
            None => {
                if path.exists() {
                    std::fs::remove_file(&path)
                        .map_err(|e| Error::Io(format!("removing current-conflict: {e}")))?;
                }
                Ok(())
            }
        }
    }

    /// Read the `current-conflict` pointer (if any).
    pub fn read_current_conflict(&self) -> Option<String> {
        std::fs::read_to_string(self.current_conflict_path())
            .ok()
            .map(|s| s.trim().to_string())
            .filter(|s| !s.is_empty())
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
            MigrationState::Conflict,
            MigrationState::Complete,
        ] {
            let parsed = MigrationState::parse(s.as_str()).unwrap();
            assert_eq!(s, parsed);
        }
    }

    // ── Phase 2: conflict markers ─────────────────────────────────────

    #[test]
    fn diff_emits_field_value_conflict_for_enum_mismatch() {
        // Build a target schema where sw-req.priority is enum.
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
                field_type: "enum".into(),
                required: false,
                description: None,
                allowed_values: Some(vec![
                    "must".into(),
                    "should".into(),
                    "could".into(),
                    "wont".into(),
                ]),
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
        // Numeric priority value that cannot satisfy the enum on the
        // target side.
        a.fields.insert(
            "priority".into(),
            serde_yaml::Value::Number(serde_yaml::Number::from(5)),
        );
        let recipe = dev_to_aspice();
        let map = diff_artifacts(&recipe, &[a], Some(&target));
        let confs: Vec<&PlannedChange> = map
            .changes
            .iter()
            .filter(|c| matches!(c.change, ChangeKind::FieldValueConflict { .. }))
            .collect();
        assert_eq!(confs.len(), 1);
        assert_eq!(confs[0].action, ActionClass::Conflict);
        if let ChangeKind::FieldValueConflict {
            from_value,
            target_constraint,
            ..
        } = &confs[0].change
        {
            assert_eq!(from_value, "5");
            assert!(target_constraint.contains("must"));
        }
    }

    #[test]
    fn write_conflict_markers_round_trips() {
        let original = r#"artifacts:
  - id: REQ-001
    type: requirement
    title: First
    fields:
      priority: 5
"#;
        let conflict = PlannedChange {
            artifact_id: "REQ-001".into(),
            source_file: Some("a.yaml".into()),
            action: ActionClass::Conflict,
            change: ChangeKind::FieldValueConflict {
                in_type: "sw-req".into(),
                field: "priority".into(),
                from_value: "5".into(),
                target_constraint: "[must|should|could|wont]".into(),
            },
        };
        let out = write_conflict_markers(original, "REQ-001", &conflict, "dev", "aspice")
            .expect("markers");
        assert!(out.contains(CONFLICT_OPEN), "open: {out}");
        assert!(out.contains(CONFLICT_SEPARATOR), "sep: {out}");
        assert!(out.contains(CONFLICT_CLOSE), "close: {out}");
        assert!(out.contains("source: dev"), "source label: {out}");
        assert!(out.contains("target: aspice"), "target label: {out}");
        assert!(has_conflict_markers(&out));
    }

    #[test]
    fn scan_conflict_markers_finds_lines() {
        let content = "a: 1\n<<<<<<< x\n  v\n=======\n  w\n>>>>>>>\nb: 2\n";
        let lines = scan_conflict_markers(content);
        assert_eq!(lines, vec![2, 4, 6]);
    }

    #[test]
    fn restore_artifact_from_snapshot_swaps_in_pre_migration_form() {
        let tmp = tempfile::tempdir().unwrap();
        let snap_root = tmp.path().join("snapshot");
        let proj_root = tmp.path().join("project");
        std::fs::create_dir_all(snap_root.join("artifacts")).unwrap();
        std::fs::create_dir_all(proj_root.join("artifacts")).unwrap();

        let snap_yaml = "artifacts:\n  - id: REQ-001\n    type: requirement\n    title: Original\n";
        let proj_yaml = "artifacts:\n  - id: REQ-001\n    type: sw-req\n    title: Migrated\n";
        std::fs::write(snap_root.join("artifacts/x.yaml"), snap_yaml).unwrap();
        std::fs::write(proj_root.join("artifacts/x.yaml"), proj_yaml).unwrap();

        restore_artifact_from_snapshot(
            &snap_root,
            &proj_root,
            std::path::Path::new("artifacts/x.yaml"),
            "REQ-001",
        )
        .unwrap();

        let after = std::fs::read_to_string(proj_root.join("artifacts/x.yaml")).unwrap();
        assert!(after.contains("type: requirement"), "{after}");
        assert!(after.contains("Original"), "{after}");
    }

    #[test]
    fn first_conflict_for_artifact_finds_the_right_one() {
        let rewrite = RewriteMap {
            recipe_name: "x".into(),
            source_preset: "dev".into(),
            target_preset: "aspice".into(),
            changes: vec![
                PlannedChange {
                    artifact_id: "REQ-001".into(),
                    source_file: None,
                    action: ActionClass::Mechanical,
                    change: ChangeKind::TypeRename {
                        from: "requirement".into(),
                        to: "sw-req".into(),
                    },
                },
                PlannedChange {
                    artifact_id: "REQ-001".into(),
                    source_file: None,
                    action: ActionClass::Conflict,
                    change: ChangeKind::FieldValueConflict {
                        in_type: "sw-req".into(),
                        field: "priority".into(),
                        from_value: "5".into(),
                        target_constraint: "[a|b]".into(),
                    },
                },
            ],
        };
        let conf = first_conflict_for_artifact(&rewrite, "REQ-001").unwrap();
        assert_eq!(conf.action, ActionClass::Conflict);
        assert!(first_conflict_for_artifact(&rewrite, "REQ-002").is_none());
    }

    #[test]
    fn apply_to_file_partial_skips_conflicts_but_applies_mechanical() {
        let recipe = dev_to_aspice();
        let original = r#"artifacts:
  - id: REQ-001
    type: requirement
    title: First
    fields:
      priority: 5
"#;
        let changes = [
            PlannedChange {
                artifact_id: "REQ-001".into(),
                source_file: Some("a.yaml".into()),
                action: ActionClass::Mechanical,
                change: ChangeKind::TypeRename {
                    from: "requirement".into(),
                    to: "sw-req".into(),
                },
            },
            PlannedChange {
                artifact_id: "REQ-001".into(),
                source_file: Some("a.yaml".into()),
                action: ActionClass::Conflict,
                change: ChangeKind::FieldValueConflict {
                    in_type: "sw-req".into(),
                    field: "priority".into(),
                    from_value: "5".into(),
                    target_constraint: "[must|should|could|wont]".into(),
                },
            },
        ];
        let refs: Vec<&PlannedChange> = changes.iter().collect();
        let out = apply_to_file_partial(original, &refs, &recipe).expect("partial");
        assert!(out.contains("type: sw-req"));
        assert!(out.contains("priority: 5"), "conflict left for marker pass");
    }

    #[test]
    fn list_recipes_includes_built_in_dev_to_aspice() {
        let dir = tempfile::tempdir().unwrap();
        let (entries, warnings) = list_recipes(dir.path());
        assert!(
            warnings.is_empty(),
            "expected no warnings, got: {warnings:?}"
        );
        let dev = entries
            .iter()
            .find(|r| r.name == "dev-to-aspice")
            .expect("dev-to-aspice in registry");
        assert_eq!(dev.source_preset, "dev");
        assert_eq!(dev.target_preset, "aspice");
        assert_eq!(dev.origin, RecipeOrigin::BuiltIn);
        assert!(dev.path.is_none());
    }

    #[test]
    fn list_recipes_picks_up_project_local_yaml() {
        let dir = tempfile::tempdir().unwrap();
        let migrations = dir.path().join("migrations");
        std::fs::create_dir_all(&migrations).unwrap();
        std::fs::write(
            migrations.join("dev-to-stpa.yaml"),
            "migration:\n  name: dev-to-stpa\n  source: { preset: dev }\n  target: { preset: stpa }\n  description: 'local recipe'\n",
        )
        .unwrap();

        let (entries, warnings) = list_recipes(dir.path());
        assert!(warnings.is_empty(), "warnings: {warnings:?}");
        let local = entries
            .iter()
            .find(|r| r.name == "dev-to-stpa")
            .expect("project-local recipe");
        assert_eq!(local.origin, RecipeOrigin::ProjectLocal);
        assert!(local.path.is_some());
        // built-in still present
        assert!(entries.iter().any(|r| r.name == "dev-to-aspice"));
    }

    #[test]
    fn list_recipes_project_local_shadows_built_in() {
        let dir = tempfile::tempdir().unwrap();
        let migrations = dir.path().join("migrations");
        std::fs::create_dir_all(&migrations).unwrap();
        // Same name as the built-in `dev-to-aspice`, different description.
        std::fs::write(
            migrations.join("dev-to-aspice.yaml"),
            "migration:\n  name: dev-to-aspice\n  source: { preset: dev }\n  target: { preset: aspice }\n  description: 'project override'\n",
        )
        .unwrap();

        let (entries, _warnings) = list_recipes(dir.path());
        let r = entries
            .iter()
            .find(|r| r.name == "dev-to-aspice")
            .expect("dev-to-aspice");
        assert_eq!(r.origin, RecipeOrigin::ProjectLocal);
        assert_eq!(r.description.as_deref(), Some("project override"));
    }
}
