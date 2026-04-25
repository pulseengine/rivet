// SAFETY-REVIEW (SCRC Phase 1, DD-058): CLI module; file-scope blanket
// allow consistent with the rest of rivet-cli. All writes pass through
// rivet-core's ownership guard.
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

//! `rivet templates` — inspect, render, copy, and diff prompt templates.
//!
//! Templates live in `rivet_core::templates`. This CLI surface lets users:
//!
//! - `list`         — show every kind (built-in + project-override) and
//!                    which files are present
//! - `show`         — print one template's body, raw or substituted
//! - `copy-to-project` — vendor a kind's embedded files into
//!                    `.rivet/templates/pipelines/<kind>/`, recording
//!                    provenance in `.rivet/.rivet-version`
//! - `diff`         — show the unified diff between a project override
//!                    and the current embedded version (drift detector)

use std::collections::BTreeMap;
use std::path::Path;

use anyhow::{Context, Result};

use rivet_core::ownership::{WriteMode, guard_write};
use rivet_core::rivet_version::{FileRecord, RivetVersion, ScaffoldedFrom, content_sha256};
use rivet_core::templates::{
    self, TemplateFile, embedded_marker, kind_is_known, list_kinds, list_project_overrides, load,
    override_path, resolve, substitute,
};

// ── shared helpers ─────────────────────────────────────────────────────

fn validate_format(fmt: &str) -> Result<()> {
    match fmt {
        "text" | "json" | "raw" | "rendered" => Ok(()),
        other => Err(anyhow::anyhow!(
            "unknown --format `{other}`: expected `text`, `json`, `raw`, or `rendered`"
        )),
    }
}

/// Parse a `<kind>/<file>` argument used by `show` / `diff`.
fn parse_kind_slash_file(arg: &str) -> Result<(String, TemplateFile)> {
    let (kind, file) = arg.split_once('/').ok_or_else(|| {
        anyhow::anyhow!("expected `<kind>/<file>.md`, e.g. `structural/discover.md`; got `{arg}`")
    })?;
    let tf = TemplateFile::from_filename(file).ok_or_else(|| {
        anyhow::anyhow!(
            "unknown template file `{file}`; expected discover.md, validate.md, emit.md, or rank.md"
        )
    })?;
    Ok((kind.to_string(), tf))
}

/// Parse a `key=value` argument from `--var key=value` repetitions.
fn parse_var(s: &str) -> Result<(String, String)> {
    let (k, v) = s
        .split_once('=')
        .ok_or_else(|| anyhow::anyhow!("--var expects `key=value`, got `{s}`"))?;
    Ok((k.to_string(), v.to_string()))
}

// ── list ────────────────────────────────────────────────────────────────

pub fn cmd_list(project_root: &Path, format: &str) -> Result<bool> {
    validate_format(format)?;

    // Build a unified view: for each kind (built-in + project-override),
    // which files exist and where (embedded vs override).
    let mut kinds: Vec<String> = list_kinds().iter().map(|s| s.to_string()).collect();
    let overrides = list_project_overrides(project_root);
    for (k, _) in &overrides {
        if !kinds.iter().any(|x| x == k) {
            kinds.push(k.clone());
        }
    }
    kinds.sort();
    kinds.dedup();

    if format == "json" {
        let mut arr: Vec<serde_json::Value> = Vec::new();
        for k in &kinds {
            let mut files: Vec<serde_json::Value> = Vec::new();
            for f in TemplateFile::all() {
                let embedded = load(k, *f).is_some();
                let override_present = project_root.join(override_path(k, *f)).exists();
                if !embedded && !override_present {
                    continue;
                }
                files.push(serde_json::json!({
                    "file": f.filename(),
                    "embedded": embedded,
                    "override": override_present,
                    "path": if override_present {
                        override_path(k, *f).display().to_string()
                    } else {
                        embedded_marker(k, *f)
                    },
                }));
            }
            arr.push(serde_json::json!({
                "kind": k,
                "builtin": list_kinds().contains(&k.as_str()),
                "files": files,
            }));
        }
        println!("{}", serde_json::to_string_pretty(&arr)?);
    } else {
        if kinds.is_empty() {
            println!("(no template kinds — built-ins absent? this is a bug)");
            return Ok(true);
        }
        for k in &kinds {
            let builtin = list_kinds().contains(&k.as_str());
            let suffix = if builtin { "" } else { "  (project-only)" };
            println!("{k}{suffix}");
            for f in TemplateFile::all() {
                let embedded = load(k, *f).is_some();
                let override_present = project_root.join(override_path(k, *f)).exists();
                if !embedded && !override_present {
                    continue;
                }
                let where_str = match (embedded, override_present) {
                    (true, true) => "embedded + override",
                    (true, false) => "embedded",
                    (false, true) => "override (project-only)",
                    (false, false) => continue,
                };
                println!("  {}  ({})", f.filename(), where_str);
            }
        }
    }
    Ok(true)
}

// ── show ────────────────────────────────────────────────────────────────

pub fn cmd_show(project_root: &Path, target: &str, format: &str, vars: &[String]) -> Result<bool> {
    let render_mode = match format {
        "raw" => false,
        "rendered" => true,
        // legacy aliases
        "text" => false,
        other => {
            return Err(anyhow::anyhow!(
                "unknown --format `{other}` for `templates show`: expected `raw` or `rendered`"
            ));
        }
    };
    let (kind, file) = parse_kind_slash_file(target)?;
    let body = resolve(project_root, &kind, file)
        .with_context(|| format!("resolving template `{target}`"))?;
    let out = if render_mode {
        let map: BTreeMap<String, String> =
            vars.iter().map(|s| parse_var(s)).collect::<Result<_>>()?;
        substitute(&body, &map)
    } else {
        body
    };
    print!("{out}");
    if !out.ends_with('\n') {
        println!();
    }
    Ok(true)
}

// ── copy-to-project ─────────────────────────────────────────────────────

pub fn cmd_copy_to_project(
    project_root: &Path,
    kind: &str,
    rivet_version: &str,
    format: &str,
) -> Result<bool> {
    validate_format(format)?;
    if !kind_is_known(project_root, kind) {
        anyhow::bail!(
            "unknown template kind `{kind}` — built-ins: [{}]",
            list_kinds().join(", ")
        );
    }
    let rivet_dir = project_root.join(".rivet");
    std::fs::create_dir_all(rivet_dir.join("templates/pipelines").join(kind))
        .with_context(|| format!("creating .rivet/templates/pipelines/{kind}/"))?;

    let mut copied: Vec<(String, String)> = Vec::new(); // (path-rel-to-project, sha)
    let mut skipped: Vec<String> = Vec::new();

    for f in TemplateFile::all() {
        let Some(body) = load(kind, *f) else { continue };
        let rel = override_path(kind, *f);
        let abs = project_root.join(&rel);

        // Ownership guard: templates dir is RivetOwned, so Scaffold mode
        // is the right write mode here.
        guard_write(&rivet_dir, &abs, WriteMode::Scaffold, abs.exists())?;

        if abs.exists() {
            skipped.push(rel.display().to_string());
            continue;
        }
        std::fs::write(&abs, body).with_context(|| format!("writing {}", abs.display()))?;
        copied.push((rel.display().to_string(), content_sha256(body.as_bytes())));
    }

    // Update .rivet/.rivet-version with new file records. We try to
    // preserve whatever's already there, only adding/replacing entries
    // for the files we just wrote.
    update_pin_file(&rivet_dir, rivet_version, &copied)?;

    if format == "json" {
        let out = serde_json::json!({
            "kind": kind,
            "copied": copied.iter().map(|(p, s)| serde_json::json!({
                "path": p,
                "scaffolded_sha": s,
            })).collect::<Vec<_>>(),
            "skipped": skipped,
        });
        println!("{}", serde_json::to_string_pretty(&out)?);
    } else {
        if copied.is_empty() {
            println!("nothing to copy: every file for kind `{kind}` already exists");
        } else {
            println!("Copied {} file(s) for kind `{kind}`:", copied.len());
            for (p, _) in &copied {
                println!("  {p}");
            }
        }
        if !skipped.is_empty() {
            println!("Skipped (already present):");
            for s in &skipped {
                println!("  {s}");
            }
        }
    }
    Ok(true)
}

fn update_pin_file(
    rivet_dir: &Path,
    rivet_version: &str,
    copied: &[(String, String)],
) -> Result<()> {
    let pin_path = rivet_dir.join(".rivet-version");
    // Ownership: .rivet-version is RivetOwned, Scaffold or Upgrade allowed.
    guard_write(rivet_dir, &pin_path, WriteMode::Scaffold, pin_path.exists())?;

    let mut existing = if pin_path.exists() {
        let content = std::fs::read_to_string(&pin_path)
            .with_context(|| format!("reading {}", pin_path.display()))?;
        RivetVersion::from_yaml(&content)
            .with_context(|| format!("parsing {}", pin_path.display()))?
    } else {
        RivetVersion {
            rivet_cli: rivet_version.to_string(),
            template_version: 1,
            scaffolded_at: now_iso8601(),
            files: Vec::new(),
            scaffolded_from: ScaffoldedFrom {
                templates_version: 1,
                schemas: BTreeMap::new(),
            },
        }
    };

    for (rel, sha) in copied {
        let from_template = derive_from_template_marker(rel);
        let record = FileRecord {
            path: rel.clone(),
            from_template,
            scaffolded_sha: sha.clone(),
        };
        // Replace existing entry for this path, or append.
        if let Some(pos) = existing.files.iter().position(|r| r.path == rel.as_str()) {
            existing.files[pos] = record;
        } else {
            existing.files.push(record);
        }
    }

    let yaml = existing
        .to_yaml()
        .context("serialising updated .rivet-version")?;
    std::fs::write(&pin_path, yaml).with_context(|| format!("writing {}", pin_path.display()))?;
    Ok(())
}

/// Map a project-relative override path to the canonical
/// `templates/pipelines/<kind>/<file>.md@v1` marker recorded in the pin.
fn derive_from_template_marker(rel: &str) -> String {
    let stripped = rel.strip_prefix(".rivet/").unwrap_or(rel);
    format!("{stripped}@v1")
}

// ── diff ────────────────────────────────────────────────────────────────

pub fn cmd_diff(project_root: &Path, target: &str, format: &str) -> Result<bool> {
    validate_format(format)?;
    let (kind, file) = parse_kind_slash_file(target)?;

    let override_abs = project_root.join(override_path(&kind, file));
    if !override_abs.exists() {
        if format == "json" {
            println!(
                "{}",
                serde_json::json!({
                    "kind": kind,
                    "file": file.filename(),
                    "status": "no-override",
                    "message": "skip: file has not been copied; nothing to diff"
                })
            );
        } else {
            println!(
                "skip: {} not present at {}; copy it first with \
                 `rivet templates copy-to-project {kind}`",
                target,
                override_abs.display()
            );
        }
        return Ok(true);
    }
    let Some(embedded) = load(&kind, file) else {
        anyhow::bail!(
            "no embedded template `{kind}/{}` to diff against (project-only kind)",
            file.filename()
        );
    };
    let project = std::fs::read_to_string(&override_abs)
        .with_context(|| format!("reading {}", override_abs.display()))?;

    let diff_text = unified_diff(&project, embedded, &override_abs.display().to_string());
    let drift = project != embedded;

    if format == "json" {
        println!(
            "{}",
            serde_json::to_string_pretty(&serde_json::json!({
                "kind": kind,
                "file": file.filename(),
                "drift": drift,
                "override_path": override_abs.display().to_string(),
                "diff": diff_text,
            }))?
        );
    } else if drift {
        println!("{diff_text}");
    } else {
        println!(
            "(no drift: project override matches embedded `{kind}/{}`)",
            file.filename()
        );
    }
    // Exit 0 either way; the JSON `drift` flag is the machine signal.
    Ok(true)
}

/// Tiny unified-diff implementation good enough for human-readable
/// drift reports. Not minimal — it shows every line in both files
/// when content differs. Avoids pulling in a diff crate.
fn unified_diff(project: &str, embedded: &str, project_label: &str) -> String {
    let mut out = String::new();
    out.push_str(&format!("--- {project_label} (project)\n"));
    out.push_str("+++ embedded (current rivet)\n");
    let p_lines: Vec<&str> = project.lines().collect();
    let e_lines: Vec<&str> = embedded.lines().collect();
    let max = p_lines.len().max(e_lines.len());
    for i in 0..max {
        let p = p_lines.get(i).copied();
        let e = e_lines.get(i).copied();
        match (p, e) {
            (Some(a), Some(b)) if a == b => {
                out.push_str(&format!(" {a}\n"));
            }
            (Some(a), Some(b)) => {
                out.push_str(&format!("-{a}\n"));
                out.push_str(&format!("+{b}\n"));
            }
            (Some(a), None) => {
                out.push_str(&format!("-{a}\n"));
            }
            (None, Some(b)) => {
                out.push_str(&format!("+{b}\n"));
            }
            (None, None) => {}
        }
    }
    out
}

fn now_iso8601() -> String {
    let secs = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs();
    let total_days = (secs / 86_400) as i64;
    let rem = secs % 86_400;
    let h = rem / 3600;
    let m = (rem / 60) % 60;
    let s = rem % 60;
    let (y, mo, d) = civil_from_days(total_days);
    format!("{y:04}-{mo:02}-{d:02}T{h:02}:{m:02}:{s:02}Z")
}

fn civil_from_days(z: i64) -> (i64, u32, u32) {
    let z = z + 719_468;
    let era = if z >= 0 { z } else { z - 146_096 } / 146_097;
    let doe = (z - era * 146_097) as u32;
    let yoe = (doe - doe / 1460 + doe / 36524 - doe / 146_096) / 365;
    let y = yoe as i64 + era * 400;
    let doy = doe - (365 * yoe + yoe / 4 - yoe / 100);
    let mp = (5 * doy + 2) / 153;
    let d = doy - (153 * mp + 2) / 5 + 1;
    let m = if mp < 10 { mp + 3 } else { mp - 9 };
    let y = if m <= 2 { y + 1 } else { y };
    (y, m, d)
}
