//! `rivet schema migrate` — Phase 1 + Phase 2 of issue #236.
//!
//! Phase 1 shipped mechanical-only migration with full snapshot/abort.
//! Phase 2 adds the conflict-resolution UX: rebase-style conflict
//! markers in artifact YAML, plus `--continue`, `--skip`, `--edit`.
//!
//! Subcommands:
//!   * default (no flag) — plan only; writes plan.yaml + manifest.yaml
//!   * `--apply` — applies mechanical/decidable changes; pauses on the
//!     first conflict and writes markers (Phase 2)
//!   * `--continue` — verify markers gone + validate, advance to next conflict
//!   * `--skip` — restore the conflicted artifact from snapshot, advance
//!   * `--edit <ID>` — re-open a previously-resolved conflict
//!   * `--abort` — restores entire project from snapshot
//!   * `--status` — prints state machine pointer + current conflict
//!   * `--finish` — validates and deletes snapshot

// SAFETY-REVIEW (SCRC Phase 1, DD-058): see schema_cmd.rs for rationale.
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
use std::time::{SystemTime, UNIX_EPOCH};

use anyhow::{Context, Result};

use rivet_core::migrate::{
    self, ActionClass, ChangeKind, MigrationLayout, MigrationManifest, MigrationRecipeFile,
    MigrationState, PlannedChange, ResolutionStatus, RewriteMap,
};

/// Resolve a recipe by `target_preset` against (in order):
///   1. `<schemas_dir>/migrations/<source>-to-<target>.yaml` on disk
///   2. The embedded recipe set
///
/// Phase 1 ships exactly one recipe (`dev-to-aspice`); future phases
/// will gain a recipe registry and possibly remote pull.
pub fn resolve_recipe(
    schemas_dir: &Path,
    source_preset: &str,
    target_preset: &str,
) -> Result<MigrationRecipeFile> {
    let recipe_name = format!("{source_preset}-to-{target_preset}");
    let on_disk = schemas_dir
        .join("migrations")
        .join(format!("{recipe_name}.yaml"));
    if on_disk.exists() {
        return MigrationRecipeFile::load(&on_disk)
            .with_context(|| format!("loading recipe {}", on_disk.display()));
    }
    if let Some(content) = rivet_core::embedded::embedded_migration_recipe(&recipe_name) {
        return MigrationRecipeFile::parse(content)
            .with_context(|| format!("parsing embedded recipe '{recipe_name}'"));
    }
    anyhow::bail!(
        "no migration recipe found for '{source_preset}' -> '{target_preset}'. \
         Searched: {} and embedded recipes ({}). \
         Phase 1 ships only the canned 'dev-to-aspice' recipe — \
         see `rivet docs schema-migrate` for the recipe format.",
        on_disk.display(),
        rivet_core::embedded::MIGRATION_RECIPES
            .iter()
            .map(|(n, _)| *n)
            .collect::<Vec<_>>()
            .join(", "),
    )
}

fn timestamp_dir(source: &str, target: &str) -> String {
    // YYYYMMDD-HHMM in UTC (no calendar lib dependency).
    let secs = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_secs())
        .unwrap_or(0);
    let (y, mo, d, h, mi) = unix_to_ymdhm(secs);
    format!("{y:04}{mo:02}{d:02}-{h:02}{mi:02}-{source}-to-{target}")
}

fn unix_to_ymdhm(secs: u64) -> (u32, u32, u32, u32, u32) {
    // Civil from days, days from secs. Algorithm: Howard Hinnant's
    // "date" header (public domain). Inlined to avoid a chrono dep.
    let days = (secs / 86_400) as i64;
    let secs_in_day = secs % 86_400;
    let h = (secs_in_day / 3600) as u32;
    let mi = ((secs_in_day % 3600) / 60) as u32;

    let z = days + 719_468;
    let era = z.div_euclid(146_097);
    let doe = (z - era * 146_097) as u64;
    let yoe = (doe - doe / 1460 + doe / 36_524 - doe / 146_096) / 365;
    let y = (yoe as i64) + era * 400;
    let doy = doe - (365 * yoe + yoe / 4 - yoe / 100);
    let mp = (5 * doy + 2) / 153;
    let d = (doy - (153 * mp + 2) / 5 + 1) as u32;
    let m = if mp < 10 { mp + 3 } else { mp - 9 } as u32;
    let y = if m <= 2 { y + 1 } else { y } as u32;
    (y, m, d, h, mi)
}

/// `rivet schema migrate <target>` (plan).
pub fn cmd_plan(
    project_root: &Path,
    schemas_dir: &Path,
    source_preset: &str,
    target_preset: &str,
) -> Result<bool> {
    // 1. Resolve recipe.
    let recipe_file = resolve_recipe(schemas_dir, source_preset, target_preset)?;
    let recipe = &recipe_file.migration;

    // 2. Load source artifacts.
    let project = rivet_core::load_project_full(project_root)
        .with_context(|| format!("loading project {}", project_root.display()))?;

    // 3. Load target schema (used for unmapped-field detection).
    let target_schemas = match target_preset {
        "aspice" => vec!["common".to_string(), "aspice".to_string()],
        "stpa" => vec!["common".to_string(), "stpa".to_string()],
        // Fall back to the recipe's preset name as a single schema
        // identifier — unknown presets will fail loud here.
        other => vec!["common".to_string(), other.to_string()],
    };
    let target_schema = rivet_core::load_schemas(&target_schemas, schemas_dir)
        .with_context(|| format!("loading target schemas {target_schemas:?}"))?;

    // 4. Compute the rewrite map.
    let artifacts: Vec<rivet_core::model::Artifact> = project.store.iter().cloned().collect();
    let rewrite = migrate::diff_artifacts(recipe, &artifacts, Some(&target_schema));

    // 5. Persist to .rivet/migrations/<ts>/.
    let dir_name = timestamp_dir(source_preset, target_preset);
    let layout = MigrationLayout::new(project_root, &dir_name);
    std::fs::create_dir_all(&layout.root)
        .with_context(|| format!("creating {}", layout.root.display()))?;

    write_plan(&layout, &rewrite)?;
    write_manifest(&layout, recipe, &rewrite, MigrationState::Planned)?;
    layout.write_state(MigrationState::Planned)?;

    // 6. Human summary.
    let mech = rewrite.count(ActionClass::Mechanical);
    let dec = rewrite.count(ActionClass::DecidableWithPolicy);
    let conf = rewrite.count(ActionClass::Conflict);
    println!("Migration plan: {} -> {}", source_preset, target_preset);
    println!("  recipe:        {}", recipe.name);
    println!("  artifacts:     {}", artifacts.len());
    println!("  mechanical:    {mech}");
    println!("  decidable:     {dec}  (resolved by recipe policy)");
    println!("  conflicts:     {conf}  (need human input)");
    println!("  plan written:  {}", layout.plan_path().display());
    println!("  state:         PLANNED");
    println!();
    println!("Next: rivet schema migrate {target_preset} --apply");
    if conf > 0 {
        println!(
            "  WARNING: {conf} conflict(s) present — Phase 1 --apply will bail. \
             Edit the plan or wait for Phase 2 conflict-marker support."
        );
    }
    Ok(true)
}

/// `rivet schema migrate <target> --apply`.
///
/// Phase 2: applies all mechanical/decidable changes immediately. If
/// the plan has conflicts, pauses at the first one — writing
/// rebase-style markers into the affected artifact YAML and setting
/// state to CONFLICT. The user resolves with `--continue` / `--skip`
/// / `--abort`.
pub fn cmd_apply(
    project_root: &Path,
    schemas_dir: &Path,
    source_preset: &str,
    target_preset: &str,
) -> Result<bool> {
    // 1. Resolve the latest planned migration. If none, plan first.
    let layout = match migrate::find_latest_migration(project_root) {
        Some(l) if matches!(l.read_state().ok(), Some(MigrationState::Planned)) => l,
        _ => {
            println!("No PLANNED migration found — running plan first.");
            cmd_plan(project_root, schemas_dir, source_preset, target_preset)?;
            migrate::find_latest_migration(project_root)
                .ok_or_else(|| anyhow::anyhow!("plan failed to write a migration directory"))?
        }
    };

    // 2. Load the plan.
    let rewrite = read_plan(&layout)?;

    // 3. Mark IN_PROGRESS, snapshot the current state.
    layout.write_state(MigrationState::InProgress)?;
    snapshot_project(project_root, &layout.snapshot_dir())?;

    // 4. Resolve recipe again (we need the live recipe object for apply).
    let recipe_file = resolve_recipe(schemas_dir, source_preset, target_preset)?;
    let recipe = &recipe_file.migration;

    // 5. Apply mechanical/decidable per-file (skip conflict-class entries).
    let by_file = rewrite.by_file();
    let mut rewrites_applied = 0usize;
    for (file_path, changes) in &by_file {
        let path = resolve_artifact_path(project_root, file_path);
        let original = std::fs::read_to_string(&path)
            .with_context(|| format!("reading {}", path.display()))?;
        let new_content = migrate::apply_to_file_partial(&original, changes, recipe)
            .with_context(|| format!("rewriting {}", path.display()))?;
        if new_content != original {
            std::fs::write(&path, &new_content)
                .with_context(|| format!("writing {}", path.display()))?;
            rewrites_applied += 1;
        }
    }

    // 6. Pause at the first unresolved conflict, if any.
    if let Some(conflict) = next_unresolved_conflict(&layout, &rewrite)? {
        write_markers_for_conflict(&layout, &conflict, source_preset, target_preset)?;
        layout.write_state(MigrationState::Conflict)?;
        layout.write_current_conflict(Some(&conflict.artifact_id))?;
        update_manifest_state(&layout, MigrationState::Conflict)?;
        record_resolution(&layout, &conflict.artifact_id, ResolutionStatus::Pending)?;

        let total = rewrite.count(ActionClass::Conflict);
        println!(
            "Applied migration: {} (paused on conflict)",
            rewrite.recipe_name
        );
        println!("  files rewritten:  {rewrites_applied}");
        println!("  state:            CONFLICT");
        println!(
            "  current conflict: {} ({} of {})",
            conflict.artifact_id, 1, total
        );
        if let Some(file) = &conflict.source_file {
            println!("  edit file:        {file}");
        }
        println!();
        println!("Next steps:");
        println!(
            "  1. Open the file above and pick a value (remove the <<<<<<<, =======, >>>>>>> markers)."
        );
        println!(
            "  2. rivet schema migrate {target_preset} --continue   # advance after resolving"
        );
        println!(
            "  3. rivet schema migrate {target_preset} --skip       # drop this artifact from the migration"
        );
        println!("  4. rivet schema migrate {target_preset} --abort      # restore everything");
        // Non-zero exit so CI catches an unfinished migration.
        return Ok(false);
    }

    // 7. No conflicts — full COMPLETE.
    layout.write_state(MigrationState::Complete)?;
    update_manifest_state(&layout, MigrationState::Complete)?;

    println!("Applied migration: {}", rewrite.recipe_name);
    println!("  files rewritten:  {rewrites_applied}");
    println!("  total changes:    {}", rewrite.changes.len());
    println!("  state:            COMPLETE");
    println!("  snapshot at:      {}", layout.snapshot_dir().display());
    println!();
    println!("Next: rivet validate     # check the migrated tree");
    println!("      rivet schema migrate {target_preset} --finish   # delete snapshot");
    println!("      rivet schema migrate {target_preset} --abort    # restore pre-migration state");
    Ok(true)
}

/// `rivet schema migrate <target> --continue`.
pub fn cmd_continue(project_root: &Path, schemas_dir: &Path) -> Result<bool> {
    let layout = migrate::find_latest_migration(project_root)
        .ok_or_else(|| anyhow::anyhow!("no migration directory found"))?;
    let state = layout.read_state()?;
    if state != MigrationState::Conflict {
        anyhow::bail!(
            "migration is in state '{}', not CONFLICT — nothing to continue",
            state.as_str()
        );
    }
    let current = layout
        .read_current_conflict()
        .ok_or_else(|| anyhow::anyhow!("CONFLICT state but no current-conflict pointer"))?;
    let rewrite = read_plan(&layout)?;
    let conflict = migrate::first_conflict_for_artifact(&rewrite, &current).ok_or_else(|| {
        anyhow::anyhow!("plan has no conflict for current-conflict pointer {current}")
    })?;
    let file_rel = conflict
        .source_file
        .clone()
        .ok_or_else(|| anyhow::anyhow!("conflict has no source_file"))?;
    let path = resolve_artifact_path(project_root, &file_rel);
    let content =
        std::fs::read_to_string(&path).with_context(|| format!("reading {}", path.display()))?;
    let hits = migrate::scan_conflict_markers(&content);
    if !hits.is_empty() {
        anyhow::bail!(
            "{} still contains {} conflict marker(s) at line(s) {:?}; \
             remove them and pick a value before --continue",
            path.display(),
            hits.len(),
            hits
        );
    }

    // Sanity-check that the file still parses as YAML.
    serde_yaml::from_str::<serde_yaml::Value>(&content)
        .with_context(|| format!("post-resolution {} is not valid YAML", path.display()))?;

    record_resolution(&layout, &current, ResolutionStatus::Resolved)?;
    layout.write_current_conflict(None)?;

    // Advance to next conflict (if any).
    if let Some(next) = next_unresolved_conflict(&layout, &rewrite)? {
        // Determine source/target for marker labelling — the manifest
        // captured them when the plan was written.
        let manifest = read_manifest(&layout)?;
        write_markers_for_conflict(
            &layout,
            &next,
            &manifest.source_preset,
            &manifest.target_preset,
        )?;
        layout.write_state(MigrationState::Conflict)?;
        layout.write_current_conflict(Some(&next.artifact_id))?;
        update_manifest_state(&layout, MigrationState::Conflict)?;
        record_resolution(&layout, &next.artifact_id, ResolutionStatus::Pending)?;

        println!("Resolved {current}.");
        println!("Next conflict:  {}", next.artifact_id);
        if let Some(f) = &next.source_file {
            println!("Edit file:      {f}");
        }
        return Ok(false);
    }

    layout.write_state(MigrationState::Complete)?;
    update_manifest_state(&layout, MigrationState::Complete)?;
    let _ = schemas_dir; // not needed once we read manifest above
    println!("Resolved {current}.");
    println!("Migration complete. State: COMPLETE.");
    println!("Next: rivet validate");
    println!("      rivet schema migrate <target> --finish");
    Ok(true)
}

/// `rivet schema migrate <target> --skip`.
pub fn cmd_skip(project_root: &Path, schemas_dir: &Path) -> Result<bool> {
    let layout = migrate::find_latest_migration(project_root)
        .ok_or_else(|| anyhow::anyhow!("no migration directory found"))?;
    let state = layout.read_state()?;
    if state != MigrationState::Conflict {
        anyhow::bail!(
            "migration is in state '{}', not CONFLICT — nothing to skip",
            state.as_str()
        );
    }
    let current = layout
        .read_current_conflict()
        .ok_or_else(|| anyhow::anyhow!("CONFLICT state but no current-conflict pointer"))?;
    let rewrite = read_plan(&layout)?;
    let conflict = migrate::first_conflict_for_artifact(&rewrite, &current).ok_or_else(|| {
        anyhow::anyhow!("plan has no conflict for current-conflict pointer {current}")
    })?;
    let file_rel = conflict
        .source_file
        .clone()
        .ok_or_else(|| anyhow::anyhow!("conflict has no source_file"))?;

    // The snapshot stores files relative to project root.
    let relative_for_snapshot: PathBuf = {
        let p = PathBuf::from(&file_rel);
        if p.is_absolute() {
            p.strip_prefix(project_root).map(PathBuf::from).unwrap_or(p)
        } else {
            p
        }
    };

    // The project file currently has conflict markers, so it isn't
    // parseable YAML. Rebuild it from the snapshot by re-applying the
    // mechanical/decidable changes for *all other* artifacts in the
    // file, then swap in the snapshot's pristine copy of the
    // conflicted artifact.
    let manifest = read_manifest(&layout)?;
    let recipe_file = resolve_recipe(
        schemas_dir,
        &manifest.source_preset,
        &manifest.target_preset,
    )?;
    let recipe = &recipe_file.migration;

    let snap_file_path = layout.snapshot_dir().join(&relative_for_snapshot);
    let snap_text = std::fs::read_to_string(&snap_file_path)
        .with_context(|| format!("reading {}", snap_file_path.display()))?;
    let rewrite = read_plan(&layout)?;
    // All changes for this file, sans the conflicts on the artifact
    // we're skipping (so the rest still gets the mechanical pass).
    let changes_for_file: Vec<&PlannedChange> = rewrite
        .changes
        .iter()
        .filter(|c| {
            c.source_file
                .as_deref()
                .is_some_and(|f| f == file_rel.as_str())
        })
        .filter(|c| !(c.artifact_id == current && c.action == ActionClass::Conflict))
        .collect();
    let rebuilt = migrate::apply_to_file_partial(&snap_text, &changes_for_file, recipe)
        .with_context(|| format!("rebuilding {}", snap_file_path.display()))?;
    let abs_proj_path = resolve_artifact_path(project_root, &file_rel);
    std::fs::write(&abs_proj_path, rebuilt)
        .with_context(|| format!("writing {}", abs_proj_path.display()))?;

    // Now swap the conflicted artifact back to its pre-migration form.
    migrate::restore_artifact_from_snapshot(
        &layout.snapshot_dir(),
        project_root,
        &relative_for_snapshot,
        &current,
    )
    .with_context(|| format!("restoring {current} from snapshot"))?;

    record_resolution(&layout, &current, ResolutionStatus::Skipped)?;
    layout.write_current_conflict(None)?;

    if let Some(next) = next_unresolved_conflict(&layout, &rewrite)? {
        let manifest = read_manifest(&layout)?;
        write_markers_for_conflict(
            &layout,
            &next,
            &manifest.source_preset,
            &manifest.target_preset,
        )?;
        layout.write_state(MigrationState::Conflict)?;
        layout.write_current_conflict(Some(&next.artifact_id))?;
        update_manifest_state(&layout, MigrationState::Conflict)?;
        record_resolution(&layout, &next.artifact_id, ResolutionStatus::Pending)?;
        println!("Skipped {current}. Restored from snapshot.");
        println!("Next conflict:  {}", next.artifact_id);
        if let Some(f) = &next.source_file {
            println!("Edit file:      {f}");
        }
        return Ok(false);
    }

    layout.write_state(MigrationState::Complete)?;
    update_manifest_state(&layout, MigrationState::Complete)?;
    println!("Skipped {current}. Restored from snapshot.");
    println!("Migration complete. State: COMPLETE.");
    Ok(true)
}

/// `rivet schema migrate <target> --edit <ID>`.
pub fn cmd_edit(project_root: &Path, artifact_id: &str) -> Result<bool> {
    let layout = migrate::find_latest_migration(project_root)
        .ok_or_else(|| anyhow::anyhow!("no migration directory found"))?;
    let rewrite = read_plan(&layout)?;
    let conflict = migrate::first_conflict_for_artifact(&rewrite, artifact_id)
        .ok_or_else(|| anyhow::anyhow!("no conflict in the plan for artifact {artifact_id}"))?;
    let manifest = read_manifest(&layout)?;
    write_markers_for_conflict(
        &layout,
        conflict,
        &manifest.source_preset,
        &manifest.target_preset,
    )?;
    layout.write_state(MigrationState::Conflict)?;
    layout.write_current_conflict(Some(artifact_id))?;
    update_manifest_state(&layout, MigrationState::Conflict)?;
    record_resolution(&layout, artifact_id, ResolutionStatus::Pending)?;
    println!("Re-opened conflict for {artifact_id}.");
    println!("State: CONFLICT");
    if let Some(f) = &conflict.source_file {
        println!("Edit file:  {f}");
    }
    println!("Run --continue or --skip after resolving.");
    Ok(true)
}

/// `rivet schema migrate <target> --abort`.
pub fn cmd_abort(project_root: &Path) -> Result<bool> {
    let layout = migrate::find_latest_migration(project_root)
        .ok_or_else(|| anyhow::anyhow!("no migration directory found"))?;
    let snapshot = layout.snapshot_dir();
    if !snapshot.exists() {
        anyhow::bail!(
            "no snapshot at {} — was this migration ever applied?",
            snapshot.display()
        );
    }
    // Restore: the snapshot contains the project tree as it was before
    // --apply. Walk the snapshot and copy each file back over its
    // original location, then remove the migration directory.
    restore_from_snapshot(&snapshot, project_root)?;
    migrate::remove_tree(&layout.root)?;

    println!("Aborted migration. Project restored to pre-migration state.");
    Ok(true)
}

/// `rivet schema migrate <target> --status`.
pub fn cmd_status(project_root: &Path) -> Result<bool> {
    match migrate::find_latest_migration(project_root) {
        None => {
            println!("No migration in flight.");
        }
        Some(layout) => {
            let state = layout.read_state().unwrap_or(MigrationState::Planned);
            println!("Migration:  {}", layout.root.display());
            println!("State:      {}", state.as_str());
            if let Ok(manifest_yaml) = std::fs::read_to_string(layout.manifest_path()) {
                if let Ok(manifest) = serde_yaml::from_str::<MigrationManifest>(&manifest_yaml) {
                    println!("Recipe:     {}", manifest.recipe);
                    println!(
                        "Changes:    {} mechanical, {} decidable, {} conflicts",
                        manifest.mechanical_count,
                        manifest.decidable_count,
                        manifest.conflict_count
                    );
                    if !manifest.resolutions.is_empty() {
                        let resolved = manifest
                            .resolutions
                            .values()
                            .filter(|s| matches!(s, ResolutionStatus::Resolved))
                            .count();
                        let skipped = manifest
                            .resolutions
                            .values()
                            .filter(|s| matches!(s, ResolutionStatus::Skipped))
                            .count();
                        let pending = manifest
                            .resolutions
                            .values()
                            .filter(|s| matches!(s, ResolutionStatus::Pending))
                            .count();
                        println!(
                            "Resolutions: {resolved} resolved, {skipped} skipped, {pending} pending"
                        );
                    }
                }
            }
            if state == MigrationState::Conflict {
                if let Some(current) = layout.read_current_conflict() {
                    println!("Current conflict: {current}");
                    // Surface the file the user should edit.
                    if let Ok(rewrite) = read_plan(&layout) {
                        if let Some(c) = migrate::first_conflict_for_artifact(&rewrite, &current) {
                            if let Some(f) = &c.source_file {
                                println!("Edit file:        {f}");
                            }
                        }
                    }
                    println!();
                    println!("Run one of:");
                    println!("  rivet schema migrate <target> --continue   # after resolving");
                    println!("  rivet schema migrate <target> --skip       # drop this artifact");
                    println!("  rivet schema migrate <target> --abort      # restore everything");
                }
            }
        }
    }
    Ok(true)
}

/// `rivet schema migrate <target> --finish`.
pub fn cmd_finish(project_root: &Path) -> Result<bool> {
    let layout = migrate::find_latest_migration(project_root)
        .ok_or_else(|| anyhow::anyhow!("no migration directory to finish"))?;
    let state = layout.read_state()?;
    if state != MigrationState::Complete {
        anyhow::bail!(
            "migration is in state '{}', not COMPLETE — apply first",
            state.as_str()
        );
    }
    // Delete the snapshot. Keep plan.yaml + manifest.yaml for audit.
    migrate::remove_tree(&layout.snapshot_dir())?;
    println!("Migration finished. Snapshot deleted.");
    println!("  manifest retained: {}", layout.manifest_path().display());
    Ok(true)
}

// ── Plumbing helpers ────────────────────────────────────────────────────

fn write_plan(layout: &MigrationLayout, rewrite: &RewriteMap) -> Result<()> {
    let yaml = serde_yaml::to_string(rewrite).context("serializing plan")?;
    std::fs::write(layout.plan_path(), yaml)
        .with_context(|| format!("writing {}", layout.plan_path().display()))?;
    Ok(())
}

fn read_plan(layout: &MigrationLayout) -> Result<RewriteMap> {
    let yaml = std::fs::read_to_string(layout.plan_path())
        .with_context(|| format!("reading {}", layout.plan_path().display()))?;
    serde_yaml::from_str(&yaml).with_context(|| "parsing plan.yaml".to_string())
}

fn write_manifest(
    layout: &MigrationLayout,
    recipe: &rivet_core::migrate::MigrationRecipe,
    rewrite: &RewriteMap,
    state: MigrationState,
) -> Result<()> {
    let manifest = MigrationManifest {
        recipe: recipe.name.clone(),
        source_preset: recipe.source.preset.clone(),
        target_preset: recipe.target.preset.clone(),
        created_at: format!("unix:{}", current_unix_secs()),
        state,
        mechanical_count: rewrite.count(ActionClass::Mechanical),
        decidable_count: rewrite.count(ActionClass::DecidableWithPolicy),
        conflict_count: rewrite.count(ActionClass::Conflict),
        resolutions: std::collections::BTreeMap::new(),
    };
    let yaml = serde_yaml::to_string(&manifest).context("serializing manifest")?;
    std::fs::write(layout.manifest_path(), yaml)
        .with_context(|| format!("writing {}", layout.manifest_path().display()))?;
    Ok(())
}

fn update_manifest_state(layout: &MigrationLayout, state: MigrationState) -> Result<()> {
    let path = layout.manifest_path();
    if !path.exists() {
        return Ok(());
    }
    let yaml = std::fs::read_to_string(&path).context("reading manifest")?;
    let mut manifest: MigrationManifest =
        serde_yaml::from_str(&yaml).context("parsing manifest")?;
    manifest.state = state;
    let yaml = serde_yaml::to_string(&manifest).context("serializing manifest")?;
    std::fs::write(&path, yaml).context("writing manifest")?;
    Ok(())
}

/// Resolve a path stored in plan.yaml against the project root. Handles
/// both absolute paths (Phase 1 — `load_project_full` stamps absolute
/// `source_file`s onto artifacts) and relative paths (test fixtures
/// hand-write the plan).
fn resolve_artifact_path(project_root: &Path, raw: &str) -> PathBuf {
    let p = PathBuf::from(raw);
    if p.is_absolute() {
        p
    } else {
        project_root.join(p)
    }
}

fn read_manifest(layout: &MigrationLayout) -> Result<MigrationManifest> {
    let yaml = std::fs::read_to_string(layout.manifest_path()).context("reading manifest")?;
    serde_yaml::from_str(&yaml).context("parsing manifest")
}

fn record_resolution(
    layout: &MigrationLayout,
    artifact_id: &str,
    status: ResolutionStatus,
) -> Result<()> {
    let path = layout.manifest_path();
    if !path.exists() {
        return Ok(());
    }
    let yaml = std::fs::read_to_string(&path).context("reading manifest")?;
    let mut manifest: MigrationManifest =
        serde_yaml::from_str(&yaml).context("parsing manifest")?;
    manifest.resolutions.insert(artifact_id.to_string(), status);
    let yaml = serde_yaml::to_string(&manifest).context("serializing manifest")?;
    std::fs::write(&path, yaml).context("writing manifest")?;
    Ok(())
}

/// Find the first conflict in the plan that hasn't been resolved or
/// skipped yet. Order matches plan.yaml — stable across `--continue`
/// runs.
fn next_unresolved_conflict(
    layout: &MigrationLayout,
    rewrite: &RewriteMap,
) -> Result<Option<PlannedChange>> {
    let manifest = read_manifest(layout)?;
    for change in &rewrite.changes {
        if change.action != ActionClass::Conflict {
            continue;
        }
        match manifest.resolutions.get(&change.artifact_id) {
            Some(ResolutionStatus::Resolved) | Some(ResolutionStatus::Skipped) => continue,
            _ => return Ok(Some(change.clone())),
        }
    }
    Ok(None)
}

/// Stamp conflict markers on the artifact YAML pointed at by the
/// PlannedChange. Currently supports FieldValueConflict; other conflict
/// kinds (e.g. unmapped-fields-strict) bail with a clear message
/// directing the user at `--abort` for now.
fn write_markers_for_conflict(
    layout: &MigrationLayout,
    conflict: &PlannedChange,
    source_preset: &str,
    target_preset: &str,
) -> Result<()> {
    let file_rel = conflict
        .source_file
        .as_ref()
        .ok_or_else(|| anyhow::anyhow!("conflict change has no source_file"))?;
    // Resolve relative to the project root (= layout.root.parent.parent.parent).
    let project_root = layout
        .root
        .parent()
        .and_then(|p| p.parent())
        .and_then(|p| p.parent())
        .ok_or_else(|| anyhow::anyhow!("cannot derive project root from migration layout"))?;
    let path = resolve_artifact_path(project_root, file_rel);
    let original =
        std::fs::read_to_string(&path).with_context(|| format!("reading {}", path.display()))?;

    match &conflict.change {
        ChangeKind::FieldValueConflict { .. } => {
            let new_content = migrate::write_conflict_markers(
                &original,
                &conflict.artifact_id,
                conflict,
                source_preset,
                target_preset,
            )
            .with_context(|| format!("writing markers into {}", path.display()))?;
            std::fs::write(&path, new_content)
                .with_context(|| format!("writing {}", path.display()))?;
            Ok(())
        }
        other => {
            anyhow::bail!(
                "conflict kind {other:?} is not yet handled by Phase 2 markers; \
                 use --abort and adjust the recipe / source artifact, or wait \
                 for a later phase"
            )
        }
    }
}

fn current_unix_secs() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_secs())
        .unwrap_or(0)
}

/// Snapshot the source-controlled portions of the project (`artifacts/`
/// and `rivet.yaml`). Skip `.rivet/`, `target/`, `.git/`. We keep it
/// minimal because a Phase 1 migration only touches artifact YAML.
fn snapshot_project(project_root: &Path, snapshot_root: &Path) -> Result<()> {
    std::fs::create_dir_all(snapshot_root)
        .with_context(|| format!("creating {}", snapshot_root.display()))?;
    // We always snapshot `artifacts/` because that's what gets
    // rewritten. `rivet.yaml` we copy too so a future user can know
    // what the project looked like.
    for sub in &["artifacts", "rivet.yaml"] {
        let from = project_root.join(sub);
        let to = snapshot_root.join(sub);
        if from.exists() {
            migrate::copy_tree(&from, &to)
                .with_context(|| format!("snapshotting {}", from.display()))?;
        }
    }
    Ok(())
}

/// Mirror of `snapshot_project` — restore the snapshotted subtrees
/// over the project. We blow away `artifacts/` first to clear
/// migration-applied content (otherwise stale rewritten files linger).
fn restore_from_snapshot(snapshot_root: &Path, project_root: &Path) -> Result<()> {
    for sub in &["artifacts", "rivet.yaml"] {
        let from = snapshot_root.join(sub);
        let to = project_root.join(sub);
        if !from.exists() {
            continue;
        }
        if from.is_dir() {
            // Wipe target dir to ensure byte-identical restoration —
            // any file added by the migration must not survive.
            if to.exists() {
                migrate::remove_tree(&to)?;
            }
            migrate::copy_tree(&from, &to)
                .with_context(|| format!("restoring {}", to.display()))?;
        } else {
            std::fs::copy(&from, &to).with_context(|| format!("restoring {}", to.display()))?;
        }
    }
    Ok(())
}
