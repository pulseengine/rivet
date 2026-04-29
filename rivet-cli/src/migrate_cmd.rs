//! `rivet schema migrate` — Phase 1 implementation of issue #236.
//!
//! Mechanical-only migration with full snapshot/abort. No conflict
//! resolution UI yet (Phase 2).
//!
//! Subcommands:
//!   * default (no flag) — plan only; writes plan.yaml + manifest.yaml
//!   * `--apply`         — applies mechanical-only changes; bails on conflict
//!   * `--abort`         — restores from snapshot
//!   * `--status`        — prints state machine pointer
//!   * `--finish`        — validates and deletes snapshot

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
    self, ActionClass, MigrationLayout, MigrationManifest, MigrationRecipeFile, MigrationState,
    RewriteMap,
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
    if rewrite.has_conflicts() {
        anyhow::bail!(
            "migration plan has {} conflict(s); Phase 1 --apply is mechanical-only. \
             Inspect {} and resolve conflicts manually, or wait for Phase 2's \
             rebase-style conflict markers.",
            rewrite.count(ActionClass::Conflict),
            layout.plan_path().display(),
        );
    }

    // 3. Mark IN_PROGRESS, snapshot the current state.
    layout.write_state(MigrationState::InProgress)?;
    snapshot_project(project_root, &layout.snapshot_dir())?;

    // 4. Resolve recipe again (we need the live recipe object for apply).
    let recipe_file = resolve_recipe(schemas_dir, source_preset, target_preset)?;
    let recipe = &recipe_file.migration;

    // 5. Apply per-file.
    let by_file = rewrite.by_file();
    let mut rewrites_applied = 0usize;
    for (file_path, changes) in &by_file {
        let path = PathBuf::from(file_path);
        let original = std::fs::read_to_string(&path)
            .with_context(|| format!("reading {}", path.display()))?;
        let new_content = migrate::apply_to_file(&original, changes, recipe)
            .with_context(|| format!("rewriting {}", path.display()))?;
        if new_content != original {
            std::fs::write(&path, &new_content)
                .with_context(|| format!("writing {}", path.display()))?;
            rewrites_applied += 1;
        }
    }

    // 6. Mark COMPLETE.
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
