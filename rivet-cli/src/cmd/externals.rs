//! `rivet sync`, `rivet lock`, `rivet externals` and `rivet baseline` —
//! cross-repo external sync, lockfile pinning, discovery and baselines.

use std::path::Path;

use anyhow::{Context, Result};

use crate::Cli;

pub(crate) fn cmd_sync(cli: &Cli, local_only: bool, force: bool, locked: bool) -> Result<bool> {
    let config_path = cli.project.join("rivet.yaml");
    if !config_path.exists() {
        let project_dir =
            std::fs::canonicalize(&cli.project).unwrap_or_else(|_| cli.project.clone());
        anyhow::bail!(
            "no rivet.yaml found in {}\n\nTo initialize a new project, run: rivet init",
            project_dir.display()
        );
    }
    let config = rivet_core::load_project_config(&config_path)
        .with_context(|| format!("loading {}", config_path.display()))?;
    let externals = config.externals.as_ref();
    if externals.is_none() || externals.unwrap().is_empty() {
        eprintln!("No externals declared in rivet.yaml");
        return Ok(true);
    }
    let externals = externals.unwrap();

    if locked && local_only {
        anyhow::bail!(
            "--locked and --local are contradictory: --locked checks out the exact commits in \
             rivet.lock, while --local skips git entirely and uses the working tree. Pick one."
        );
    }
    if local_only {
        eprintln!("Using --local: preferring path externals, skipping git fetch/clone");
    }
    if force {
        eprintln!("Using --force: will discard uncommitted changes in git external checkouts");
    }

    // Ensure .rivet/ is gitignored
    let added = rivet_core::externals::ensure_gitignore(&cli.project)?;
    if added {
        eprintln!("Added .rivet/ to .gitignore");
    }

    if locked {
        // REQ-311 / #853: resolve from the lockfile, and say which commit each
        // external landed on so a CI log records what was actually validated.
        let Some(lock) = rivet_core::externals::read_lockfile(&cli.project)? else {
            anyhow::bail!(
                "--locked was requested but there is no rivet.lock. Run `rivet lock` to record \
                 pins first; syncing at branch heads under --locked would be the float this \
                 flag exists to prevent."
            );
        };
        let results =
            rivet_core::externals::sync_all_locked(externals, &cli.project, &lock, force)?;
        for (name, path, commit) in &results {
            eprintln!("  Synced {} → {} @ {}", name, path.display(), commit);
        }
        eprintln!("\n{} externals synced at locked commits.", results.len());
        return Ok(true);
    }

    let results = rivet_core::externals::sync_all(externals, &cli.project, local_only, force)?;
    for (name, path) in &results {
        eprintln!("  Synced {} → {}", name, path.display());
    }
    eprintln!("\n{} externals synced.", results.len());

    // Check if a lockfile exists and warn about version drift
    if let Some(lock) = rivet_core::externals::read_lockfile(&cli.project)? {
        let cache_dir = cli.project.join(".rivet/repos");
        for (name, entry) in &lock.pins {
            if let Some(ext) = externals.get(name) {
                // Same source `rivet lock` pins (#1138), so the warning
                // compares like with like instead of the local path: checkout.
                let Ok(ext_dir) = rivet_core::externals::lock_source_dir(
                    ext,
                    &cache_dir,
                    &cli.project,
                    local_only,
                ) else {
                    continue;
                };
                if ext_dir.join(".git").exists() {
                    if let Ok(current) = rivet_core::externals::git_head_sha(&ext_dir) {
                        if current != entry.commit {
                            eprintln!(
                                "  Warning: {} is at {} but lockfile pins {}",
                                name,
                                &current[..8.min(current.len())],
                                &entry.commit[..8.min(entry.commit.len())]
                            );
                        }
                    }
                }
            }
        }
    }

    Ok(true)
}

pub(crate) fn cmd_externals_discover(path: &Path, format: &str) -> Result<bool> {
    let bazel = rivet_core::providers::discover_bazel_externals(path)
        .map_err(|e| anyhow::anyhow!("bazel discovery: {e}"))?;
    let nix = rivet_core::providers::discover_nix_externals(path)
        .map_err(|e| anyhow::anyhow!("nix discovery: {e}"))?;

    let mut all = bazel;
    all.extend(nix);

    match format {
        "json" => {
            let out =
                serde_json::to_string_pretty(&all).context("serializing discovered externals")?;
            println!("{out}");
        }
        _ => {
            if all.is_empty() {
                println!(
                    "No externals discovered in {} (looked for MODULE.bazel, flake.lock).",
                    path.display()
                );
            } else {
                println!(
                    "Discovered {} external(s) in {}:",
                    all.len(),
                    path.display()
                );
                for ext in &all {
                    println!("  {} ({}, version {})", ext.name, ext.source, ext.version);
                    if let Some(url) = &ext.git_url {
                        println!("    git: {url}");
                    }
                    if let Some(r) = &ext.git_ref {
                        println!("    ref: {r}");
                    }
                    if let Some(p) = &ext.local_path {
                        println!("    path: {}", p.display());
                    }
                }
            }
        }
    }
    Ok(true)
}

pub(crate) fn cmd_lock(cli: &Cli, update: bool, local_only: bool) -> Result<bool> {
    let config_path = cli.project.join("rivet.yaml");
    if !config_path.exists() {
        let project_dir =
            std::fs::canonicalize(&cli.project).unwrap_or_else(|_| cli.project.clone());
        anyhow::bail!(
            "no rivet.yaml found in {}\n\nTo initialize a new project, run: rivet init",
            project_dir.display()
        );
    }
    let config = rivet_core::load_project_config(&config_path)
        .with_context(|| format!("loading {}", config_path.display()))?;
    let externals = config.externals.as_ref();
    if externals.is_none() || externals.unwrap().is_empty() {
        eprintln!("No externals declared in rivet.yaml");
        return Ok(true);
    }
    let externals = externals.unwrap();
    // #1138: `--update` used to print "refreshes all pins to latest refs" and
    // then do exactly what a plain `lock` does. It now syncs first, so the
    // pins are the declared refs' current heads.
    if update {
        eprintln!("Syncing externals to their declared refs before pinning (--update)");
        rivet_core::externals::sync_all(externals, &cli.project, local_only, false)?;
    }
    if local_only {
        eprintln!("Using --local: pinning the path: working tree of externals that have one");
    }
    let lock = rivet_core::externals::generate_lockfile_with(externals, &cli.project, local_only)?;
    for (name, entry) in &lock.pins {
        let short_sha = &entry.commit[..8.min(entry.commit.len())];
        let source = entry.git.as_deref().unwrap_or("(local path)");
        eprintln!("  {name} -> {short_sha} ({source})");
    }
    rivet_core::externals::write_lockfile(&lock, &cli.project)?;
    eprintln!("\nWrote rivet.lock with {} pins", lock.pins.len());
    Ok(true)
}

pub(crate) fn cmd_baseline_verify(cli: &Cli, name: &str, strict: bool) -> Result<bool> {
    let config_path = cli.project.join("rivet.yaml");
    if !config_path.exists() {
        let project_dir =
            std::fs::canonicalize(&cli.project).unwrap_or_else(|_| cli.project.clone());
        anyhow::bail!(
            "no rivet.yaml found in {}\n\nTo initialize a new project, run: rivet init",
            project_dir.display()
        );
    }
    let config = rivet_core::load_project_config(&config_path)
        .with_context(|| "Failed to load rivet.yaml")?;

    let externals = match config.externals.as_ref() {
        Some(e) if !e.is_empty() => e,
        _ => {
            eprintln!("No externals declared in rivet.yaml");
            return Ok(true);
        }
    };

    let verification = rivet_core::externals::verify_baseline(name, externals, &cli.project)?;

    let mut all_present = true;

    // Report local status
    match &verification.local_status {
        rivet_core::externals::BaselineStatus::Present { commit } => {
            eprintln!(
                "  local: baseline/{} @ {}",
                name,
                &commit[..8.min(commit.len())]
            );
        }
        rivet_core::externals::BaselineStatus::Missing => {
            eprintln!("  local: baseline/{} MISSING", name);
            all_present = false;
        }
    }

    // Report external statuses
    for (prefix, status) in &verification.external_statuses {
        match status {
            rivet_core::externals::BaselineStatus::Present { commit } => {
                eprintln!(
                    "  {}: baseline/{} @ {}",
                    prefix,
                    name,
                    &commit[..8.min(commit.len())]
                );
            }
            rivet_core::externals::BaselineStatus::Missing => {
                eprintln!("  {}: baseline/{} MISSING", prefix, name);
                all_present = false;
            }
        }
    }

    if all_present {
        eprintln!("\nBaseline {} verified — all repos tagged.", name);
        Ok(true)
    } else if strict {
        eprintln!("\nBaseline {} FAILED — missing tags (strict mode).", name);
        Ok(false)
    } else {
        eprintln!(
            "\nBaseline {} partial — some repos missing tags (warning).",
            name
        );
        Ok(true) // warnings don't fail
    }
}

pub(crate) fn cmd_baseline_list(cli: &Cli) -> Result<bool> {
    let config_path = cli.project.join("rivet.yaml");
    if !config_path.exists() {
        let project_dir =
            std::fs::canonicalize(&cli.project).unwrap_or_else(|_| cli.project.clone());
        anyhow::bail!(
            "no rivet.yaml found in {}\n\nTo initialize a new project, run: rivet init",
            project_dir.display()
        );
    }
    let config = rivet_core::load_project_config(&config_path)
        .with_context(|| "Failed to load rivet.yaml")?;

    // List local baselines
    let local_tags = rivet_core::externals::list_baseline_tags(&cli.project)?;
    eprintln!("Local baselines:");
    if local_tags.is_empty() {
        eprintln!("  (none)");
    } else {
        for tag in &local_tags {
            eprintln!("  baseline/{}", tag);
        }
    }

    // List external baselines
    if let Some(externals) = config.externals.as_ref() {
        let cache_dir = cli.project.join(".rivet/repos");
        for ext in externals.values() {
            let ext_dir =
                rivet_core::externals::resolve_external_dir(ext, &cache_dir, &cli.project);
            if ext_dir.exists() {
                let tags = rivet_core::externals::list_baseline_tags(&ext_dir)?;
                eprintln!("\n{} baselines:", ext.prefix);
                if tags.is_empty() {
                    eprintln!("  (none)");
                } else {
                    for tag in &tags {
                        eprintln!("  baseline/{}", tag);
                    }
                }
            }
        }
    }

    Ok(true)
}
