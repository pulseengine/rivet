//! `rivet next-id`, `add`, `link`, `unlink`, `modify`, `remove`, `stamp` and
//! `batch` — artifact mutation commands.

use anyhow::{Context, Result};

use crate::{
    Cli, ProjectContext, glob_matches, next_id_git_aware, validate_explicit_id, validate_format,
};

/// Print the next available ID for a given artifact type or prefix.
pub(crate) fn cmd_next_id(
    cli: &Cli,
    target: Option<&str>,
    artifact_type: Option<&str>,
    prefix: Option<&str>,
    format: &str,
) -> Result<bool> {
    validate_format(format, &["text", "json"])?;
    use rivet_core::mutate;

    let ctx = ProjectContext::load(cli)?;
    // #518: a parse-broken source is invisible here, so allocating an ID
    // against this partial store would collide with the unparsed artifacts.
    ctx.ensure_no_parse_skips(cli, "allocate an ID")?;
    let store = ctx.store;

    // The positional `target` is a shorthand for --type (it routes through
    // prefix_for_type, which also handles a bare prefix via its uppercase
    // fallback — so `next-id requirement` and `next-id FEAT` both work). The
    // explicit flags win if both are given.
    let effective_type = artifact_type.or(target);
    // #887: the positional routes through `prefix_for_type`, whose fallback
    // flattens hyphens — right for a TYPE name (`sw-req` -> `SWREQ`), wrong for
    // a PREFIX. `next-id REQ-DRV` returned `REQDRV-001`, matching no id in a
    // project whose convention is `REQ-DRV-COMPONENT-NNN`, so the command whose
    // job is "tell me the next id" could not name a new hyphenated series.
    // `--prefix` was already verbatim and correct; this makes the positional
    // agree rather than adding a third spelling.
    //
    // An argument that is already prefix-shaped — uppercase alphanumerics and
    // hyphens — is taken literally. A type name is lowercase by convention, so
    // `requirement` still resolves through the type and learns the project's
    // convention, and a single-segment `FEAT` resolves identically either way.
    let looks_like_literal_prefix = |t: &str| {
        !t.is_empty()
            && t.chars()
                .all(|c| c.is_ascii_uppercase() || c.is_ascii_digit() || c == '-')
    };
    let resolved_prefix = match (effective_type, prefix) {
        (Some(t), _) if looks_like_literal_prefix(t) => t.to_string(),
        (Some(t), _) => mutate::prefix_for_type(t, &store),
        (_, Some(p)) => p.to_string(),
        (None, None) => anyhow::bail!(
            "specify an artifact type or prefix, e.g. `rivet next-id requirement`, \
             `rivet next-id --type feature`, or `rivet next-id --prefix REQ`"
        ),
    };

    let next = next_id_git_aware(&cli.project, &store, &resolved_prefix);

    if format == "json" {
        let json = serde_json::json!({
            "next_id": next,
            "prefix": resolved_prefix,
        });
        println!("{}", serde_json::to_string_pretty(&json)?);
    } else {
        println!("{next}");
    }

    Ok(true)
}

/// Add a new artifact to the project.
#[allow(clippy::too_many_arguments)]
pub(crate) fn cmd_add(
    cli: &Cli,
    artifact_type: &str,
    title: &str,
    explicit_id: Option<&str>,
    description: Option<&str>,
    status: &str,
    release: Option<&str>,
    tags: &[String],
    fields: &[(String, String)],
    links: &[(String, String)],
    file: Option<&std::path::Path>,
    created_by: Option<&str>,
    model: Option<&str>,
) -> Result<bool> {
    use rivet_core::model::{Artifact, Link, Provenance};
    use rivet_core::mutate;
    use std::collections::BTreeMap;

    // Provenance stamping at creation (issue #476). `--created-by` falls back
    // to the RIVET_PROVENANCE_CREATED_BY env var so CI / agent environments can
    // set it once. When neither is present, no provenance block is written
    // (prior behavior preserved). Validate the value up front, before any work.
    let created_by_owned = created_by
        .map(str::to_string)
        .or_else(|| std::env::var("RIVET_PROVENANCE_CREATED_BY").ok())
        .filter(|s| !s.is_empty());
    if let Some(cb) = created_by_owned.as_deref() {
        match cb {
            "human" | "ai" | "ai-assisted" => {}
            other => anyhow::bail!(
                "invalid --created-by value '{other}'. Must be one of: human, ai, ai-assisted"
            ),
        }
    }
    let provenance = created_by_owned.map(|cb| Provenance {
        created_by: cb,
        model: model.map(str::to_string),
        session_id: None,
        timestamp: Some(current_utc_timestamp()),
        reviewed_by: None,
        federation: None,
    });

    let ctx = ProjectContext::load(cli)?;
    // #518: refuse to add when a source failed to parse — otherwise the new ID
    // is allocated against a partial store (collides with the unparsed file's
    // artifacts) and we'd append to a possibly-broken file.
    ctx.ensure_no_parse_skips(cli, "add an artifact")?;
    let (store, schema) = (ctx.store, ctx.schema);

    // #880: `--id` lets the caller name the artifact directly. Shape-validated
    // here; uniqueness is validated below by `validate_add`. Without `--id`, we
    // resolve the prefix for the type and pick the next number (git-aware:
    // never reissue an ID burned by an open branch or a reverted commit —
    // #479).
    let id = if let Some(explicit) = explicit_id {
        validate_explicit_id(explicit)?;
        explicit.to_string()
    } else {
        let prefix = mutate::prefix_for_type(artifact_type, &store);
        next_id_git_aware(&cli.project, &store, &prefix)
    };

    // #887 / REQ-330: a first-class base field passed via `--field` used to be
    // misfiled into custom `fields:` instead of the top-level key. The value
    // was not lost — `rivet get` displayed it — but `rivet list --release`
    // returned nothing, because release readiness is a query over the top-level
    // `release:`. An artifact invisible to the thing the field exists for, that
    // looks correct on inspection, is the worst of the three outcomes.
    //
    // Rejected rather than silently rerouted, which is the reporter's own
    // judgement: "A rejection would have been fine. Silence was not." Rerouting
    // would also make `--field x=` mean two different things depending on the
    // name, which is harder to explain than a refusal.
    const BASE_FIELDS: &[(&str, &str)] = &[
        ("release", "--release"),
        ("status", "--status"),
        ("title", "--title"),
        ("description", "--description"),
        ("id", "--id"),
        ("type", "--type"),
        ("tags", "--tags"),
    ];
    for (key, _) in fields {
        if let Some((name, flag)) = BASE_FIELDS.iter().find(|(n, _)| *n == key.as_str()) {
            anyhow::bail!(
                "`--field {name}=…` sets a CUSTOM field, but `{name}` is a top-level \
                 base field — it would be written under `fields:` and stay invisible \
                 to `rivet list --{name}` and the release queries. Use `{flag} …` instead."
            );
        }
    }

    // Build fields map
    //
    // #1021: `--field k=v` used to store `v` unconditionally as
    // `Value::String`, ignoring the schema's declared `type`. On an
    // `ordeal-certificate` the result was `produced-by: "{name: ordeal,
    // version: 0.23.0}"` — a quoted string literal — and `rivet validate`
    // accepted it (REQ-385's field-type-mismatch check covered only
    // boolean/numeric). Route through the sibling `rivet modify` helper so
    // the two write paths share one coercion contract: structured declared
    // types (mapping, sequence/list, boolean, numeric) are parsed and
    // written as real YAML; a parse failure refuses the add instead of
    // silently falling back to a string.
    let mut fields_map: BTreeMap<String, rivet_yaml::Value> = BTreeMap::new();
    for (key, value) in fields {
        let typed_scalar = mutate::typed_field_scalar(&schema, artifact_type, key, value)
            .with_context(|| format!("validating --field {key}={value} against schema"))?;
        let typed_value = match typed_scalar {
            Some(s) => rivet_yaml::from_str::<rivet_yaml::Value>(&s)
                .with_context(|| format!("parsing typed --field value for '{key}' as YAML: {s}"))?,
            None => rivet_yaml::Value::String(value.clone()),
        };
        fields_map.insert(key.clone(), typed_value);
    }

    // Build links
    let link_vec: Vec<Link> = links
        .iter()
        .map(|(link_type, target)| Link {
            link_type: link_type.clone(),
            target: target.clone(),
            external: None,
        })
        .collect();

    let artifact = Artifact {
        id: id.clone(),
        artifact_type: artifact_type.to_string(),
        title: title.to_string(),
        description: description.map(|s| s.to_string()),
        status: Some(status.to_string()),
        release: release.map(str::to_string),
        tags: tags.to_vec(),
        links: link_vec,
        fields: fields_map,
        fields_per_variant: Default::default(),
        provenance,
        source_file: None,
    };

    // Validate before writing (DD-028)
    mutate::validate_add(&artifact, &store, &schema).context("validation failed")?;

    // REQ-158 / #397: non-blocking near-duplicate-intent note. `rivet add`
    // already rejects a duplicate *id*; this nudges on a duplicate *intent*
    // (a same-type artifact with a highly similar title) so a backlog doesn't
    // accrete near-duplicates — but still adds (it's advisory, not an error).
    // Uses the same Jaccard signal as the `near-duplicate-intent` validate
    // diagnostic, so the two surfaces agree.
    {
        use rivet_core::similarity::{NEAR_DUPLICATE_INTENT_THRESHOLD, intent_similarity};
        let mut best: Option<(f64, &str, &str)> = None;
        for other in store.iter() {
            if other.artifact_type != artifact_type {
                continue;
            }
            let sim = intent_similarity(title, &other.title);
            if sim < NEAR_DUPLICATE_INTENT_THRESHOLD {
                continue;
            }
            // Pick the most-similar existing artifact; break ties by lowest id
            // so the note is DETERMINISTIC. `store.iter()` is HashMap order, so
            // without an explicit tie-break two equally-similar artifacts (e.g.
            // titles identical after stopword-stripping) would surface
            // unpredictably across runs (REQ-158 regression caught in CI).
            let better = match best {
                None => true,
                Some((b_sim, b_id, _)) => sim > b_sim || (sim == b_sim && other.id.as_str() < b_id),
            };
            if better {
                best = Some((sim, other.id.as_str(), other.title.as_str()));
            }
        }
        if let Some((sim, oid, otitle)) = best {
            eprintln!(
                "note: intent is {}% similar to existing {} \"{}\" — adding anyway; \
                 consolidate or differentiate if it's a duplicate",
                (sim * 100.0).round() as u32,
                oid,
                otitle
            );
        }
    }

    // #490: a directory source can declare `layout: per-id`, writing one
    // `<ID>.yaml` per artifact so two parallel adds never share a file. The read
    // path globs the directory regardless of layout; only the add target moves.
    // Default stays single-file (append to `<type>s.yaml`) for backward compat.
    use rivet_core::model::SourceLayout;
    let layout_for_dir = |dir: &std::path::Path| -> SourceLayout {
        ctx.config
            .sources
            .iter()
            .filter(|s| matches!(s.format.as_str(), "generic" | "generic-yaml"))
            .find(|s| {
                let sp = cli.project.join(&s.path);
                dir == sp || dir.starts_with(&sp)
            })
            .map(|s| s.layout)
            .unwrap_or_default()
    };

    // Determine target file
    let target_file = if let Some(f) = file {
        let p = cli.project.join(f);
        // An explicit directory target means one file per artifact.
        if p.is_dir() {
            p.join(format!("{id}.yaml"))
        } else {
            p
        }
    } else if let Some(existing) = mutate::find_file_for_type(artifact_type, &store) {
        // Artifacts of this type already live somewhere. If the owning source is
        // per-id, the new artifact gets its own `<ID>.yaml` file instead of
        // being appended to a sibling's file (#490).
        let is_per_id = existing
            .parent()
            .is_some_and(|d| layout_for_dir(d) == SourceLayout::PerId);
        if is_per_id {
            let dir = existing
                .parent()
                .unwrap_or(existing.as_path())
                .to_path_buf();
            dir.join(format!("{id}.yaml"))
        } else {
            existing
        }
    } else {
        // #552: no file holds this type yet — synthesize a default in the
        // project's first generic-yaml source (e.g. `design-decision` ->
        // `artifacts/design-decisions.yaml`) instead of forcing the user to
        // pass --file just to add the FIRST artifact of a type. Created with an
        // `artifacts:` header below if absent.
        let src_cfg = ctx
            .config
            .sources
            .iter()
            .find(|s| matches!(s.format.as_str(), "generic" | "generic-yaml"))
            .ok_or_else(|| {
                anyhow::anyhow!(
                    "no generic-yaml source in rivet.yaml to add a '{artifact_type}' to. \
                     Use --file to specify a target."
                )
            })?;
        let src = cli.project.join(&src_cfg.path);
        if src_cfg.layout == SourceLayout::PerId && src.is_dir() {
            src.join(format!("{id}.yaml"))
        } else if src.is_dir() {
            src.join(format!("{artifact_type}s.yaml"))
        } else {
            src
        }
    };

    // #552: ensure the target file exists with an `artifacts:` list header, so
    // the first artifact of a type can be added without --file.
    if !target_file.exists() {
        if let Some(parent) = target_file.parent() {
            std::fs::create_dir_all(parent)
                .with_context(|| format!("creating {}", parent.display()))?;
        }
        std::fs::write(&target_file, "artifacts:\n")
            .with_context(|| format!("creating {}", target_file.display()))?;
        println!("  created {}", target_file.display());
    }

    // Write to file
    mutate::append_artifact_to_file(&artifact, &target_file)
        .with_context(|| format!("writing to {}", target_file.display()))?;

    println!("{id}");

    Ok(true)
}

/// Add a link between two artifacts.
pub(crate) fn cmd_link(
    cli: &Cli,
    source_id: &str,
    link_type: &str,
    target_id: &str,
) -> Result<bool> {
    use rivet_core::model::Link;
    use rivet_core::mutate;

    let ctx = ProjectContext::load(cli)?;
    let (store, schema) = (ctx.store, ctx.schema);

    // Validate before writing (DD-028)
    mutate::validate_link(source_id, link_type, target_id, &store, &schema)
        .context("validation failed")?;

    let source_file = mutate::find_source_file(source_id, &store)
        .ok_or_else(|| anyhow::anyhow!("cannot determine source file for '{source_id}'"))?;

    let link = Link {
        link_type: link_type.to_string(),
        target: target_id.to_string(),
        external: None,
    };

    mutate::add_link_to_file(source_id, &link, &source_file)
        .with_context(|| format!("updating {}", source_file.display()))?;

    println!("linked {} --[{}]--> {}", source_id, link_type, target_id);

    Ok(true)
}

/// Remove a link between two artifacts.
pub(crate) fn cmd_unlink(
    cli: &Cli,
    source_id: &str,
    link_type: &str,
    target_id: &str,
) -> Result<bool> {
    use rivet_core::mutate;

    let ctx = ProjectContext::load(cli)?;
    let store = ctx.store;

    // Validate the link exists
    mutate::validate_unlink(source_id, link_type, target_id, &store)
        .context("validation failed")?;

    let source_file = mutate::find_source_file(source_id, &store)
        .ok_or_else(|| anyhow::anyhow!("cannot determine source file for '{source_id}'"))?;

    mutate::remove_link_from_file(source_id, link_type, target_id, &source_file)
        .with_context(|| format!("updating {}", source_file.display()))?;

    println!("unlinked {} --[{}]--> {}", source_id, link_type, target_id);

    Ok(true)
}

/// Modify an existing artifact.
#[allow(clippy::too_many_arguments)] // one parameter per CLI `--set-*` flag
pub(crate) fn cmd_modify(
    cli: &Cli,
    id: Option<&str>,
    where_filter: Option<&str>,
    dry_run: bool,
    set_status: Option<&str>,
    set_release: Option<&str>,
    set_title: Option<&str>,
    set_description: Option<&str>,
    add_tags: &[String],
    remove_tags: &[String],
    set_fields: &[(String, String)],
) -> Result<bool> {
    cmd_modify_inner(
        cli,
        id,
        where_filter,
        dry_run,
        set_status,
        set_release,
        set_title,
        set_description,
        add_tags,
        remove_tags,
        set_fields,
        ModifyCaller::User,
    )
}

/// Who is driving a modify. REQ-381: only `rivet verify` may write `verified`,
/// because only it checks the evidence first. An enum rather than a bare bool
/// so the privileged call site reads as a decision in review.
#[derive(Clone, Copy, PartialEq, Eq)]
pub(crate) enum ModifyCaller {
    /// `rivet modify` and anything else a user can point at a status.
    User,
    /// `rivet verify`, after it has confirmed verifying evidence exists.
    VerifyAfterEvidenceCheck,
}

#[allow(clippy::too_many_arguments)]
pub(crate) fn cmd_modify_inner(
    cli: &Cli,
    id: Option<&str>,
    where_filter: Option<&str>,
    dry_run: bool,
    set_status: Option<&str>,
    set_release: Option<&str>,
    set_title: Option<&str>,
    set_description: Option<&str>,
    add_tags: &[String],
    remove_tags: &[String],
    set_fields: &[(String, String)],
    caller: ModifyCaller,
) -> Result<bool> {
    use rivet_core::mutate::{self, ModifyParams};

    let ctx = ProjectContext::load(cli)?;
    let (store, schema, graph) = (ctx.store, ctx.schema, ctx.graph);

    let params = ModifyParams {
        set_status: set_status.map(|s| s.to_string()),
        set_release: set_release.map(|s| s.to_string()),
        set_title: set_title.map(|s| s.to_string()),
        set_description: set_description.map(|s| s.to_string()),
        add_tags: add_tags.to_vec(),
        remove_tags: remove_tags.to_vec(),
        set_fields: set_fields.to_vec(),
    };

    // Resolve the target ID set: either a single positional <ID> or every
    // artifact matching a --where s-expression filter. clap enforces the two
    // are mutually exclusive; require exactly one.
    let target_ids: Vec<String> = match (id, where_filter) {
        (Some(one), None) => vec![one.to_string()],
        (None, Some(filter_src)) => {
            let expr = rivet_core::sexpr_eval::parse_filter(filter_src).map_err(|errs| {
                let msgs: Vec<String> = errs.iter().map(|e| e.to_string()).collect();
                anyhow::anyhow!("invalid --where filter: {}", msgs.join("; "))
            })?;
            let mut ids: Vec<String> = store
                .iter()
                // REQ-366 / #965: externals are READ-ONLY here — they are a
                // vendored copy of another project's tree, so a write would be
                // discarded on the next `rivet sync`. They were being selected,
                // listed by --dry-run, and only rejected deep inside the write
                // loop, after earlier files were already on disk.
                .filter(|a| !mutate::is_external_id(&a.id))
                .filter(|a| {
                    rivet_core::sexpr_eval::matches_filter_with_store(&expr, a, &graph, &store)
                })
                .map(|a| a.id.clone())
                .collect();
            ids.sort();
            ids
        }
        (None, None) => {
            anyhow::bail!("provide an artifact <ID> or a --where filter to select what to modify")
        }
        // Unreachable: clap's `conflicts_with` rejects ID + --where together.
        (Some(_), Some(_)) => anyhow::bail!("pass either an <ID> or --where, not both"),
    };

    if target_ids.is_empty() {
        // A --where that matches nothing is a no-op worth surfacing loudly so
        // an agent doesn't read silence as success.
        println!("no artifacts match the --where filter; nothing modified");
        return Ok(true);
    }

    // --dry-run: show exactly what would change, write nothing.
    if dry_run {
        println!(
            "dry run: {} artifact(s) would be modified:",
            target_ids.len()
        );
        for tid in &target_ids {
            println!("  {tid}");
        }
        return Ok(true);
    }

    // Validate every target BEFORE writing anything, so a bulk modify is
    // all-or-nothing on validation rather than leaving a half-applied set
    // (DD-028). A single invalid target aborts the whole batch.
    for tid in &target_ids {
        match caller {
            ModifyCaller::User => mutate::validate_modify(tid, &params, &store, &schema),
            ModifyCaller::VerifyAfterEvidenceCheck => {
                mutate::validate_modify_for_verify(tid, &params, &store, &schema)
            }
        }
        .with_context(|| format!("validation failed for '{tid}'"))?;
    }

    // Apply in a single in-process pass: load once (above), write each
    // affected file once here. No subprocess re-spawn, so this cannot race
    // the way a shell loop of per-ID `rivet modify` invocations can (#353).
    //
    // REQ-366 / #965: compute EVERY file's new content before writing any of
    // it. The validation pass above made this look all-or-nothing and it was
    // not — a failure raised inside the old write loop left every earlier file
    // already rewritten (reproduced: exit 1 naming `spar:SPAR-THR-001`, eleven
    // files changed). Staging cannot fail halfway because nothing reaches disk
    // until the whole set is computed.
    let mut staged = mutate::StagedWrites::new();
    for tid in &target_ids {
        let source_file = mutate::find_source_file(tid, &store)
            .ok_or_else(|| anyhow::anyhow!("cannot determine source file for '{tid}'"))?;
        // Thread the staged content through, so two artifacts in one file both
        // land instead of the second overwriting the first.
        let base = staged
            .base_content(&source_file)
            .with_context(|| format!("reading {}", source_file.display()))?;
        let updated = mutate::modify_artifact_yaml(&base, tid, &params, &store, &schema)
            .with_context(|| format!("updating {}", source_file.display()))?;
        staged.stage(source_file, updated);
    }
    staged.commit().context("writing staged changes")?;

    if target_ids.len() == 1 {
        println!("modified {}", target_ids[0]);
    } else {
        println!("modified {} artifacts:", target_ids.len());
        for tid in &target_ids {
            println!("  {tid}");
        }
    }

    Ok(true)
}

/// Remove an artifact from the project.
pub(crate) fn cmd_remove(cli: &Cli, id: &str, force: bool) -> Result<bool> {
    use rivet_core::mutate;

    let ctx = ProjectContext::load(cli)?;
    let (store, _schema, graph) = (ctx.store, ctx.schema, ctx.graph);

    // Validate before writing (DD-028)
    mutate::validate_remove(id, force, &store, &graph).context("validation failed")?;

    let source_file = mutate::find_source_file(id, &store)
        .ok_or_else(|| anyhow::anyhow!("cannot determine source file for '{id}'"))?;

    mutate::remove_artifact_from_file(id, &source_file)
        .with_context(|| format!("updating {}", source_file.display()))?;

    println!("removed {id}");

    Ok(true)
}

/// Return the relative paths of files changed since `git_ref` (committed
/// changes plus uncommitted modifications). Empty vec on git error so
/// `--changed-since` degrades to "no matches" rather than panicking.
fn files_changed_since(project: &std::path::Path, git_ref: &str) -> Result<Vec<String>> {
    use std::process::Command as Cmd;
    let mut paths = Vec::new();
    // Committed changes since ref.
    if let Ok(out) = Cmd::new("git")
        .args(["diff", "--name-only", git_ref, "--"])
        .current_dir(project)
        .output()
    {
        if out.status.success() {
            for line in String::from_utf8_lossy(&out.stdout).lines() {
                if !line.is_empty() {
                    paths.push(line.to_string());
                }
            }
        }
    }
    // Uncommitted modifications.
    if let Ok(out) = Cmd::new("git")
        .args(["status", "--porcelain"])
        .current_dir(project)
        .output()
    {
        if out.status.success() {
            for line in String::from_utf8_lossy(&out.stdout).lines() {
                if let Some(path) = line.get(3..) {
                    paths.push(path.to_string());
                }
            }
        }
    }
    paths.sort();
    paths.dedup();
    Ok(paths)
}

/// Current UTC time as an ISO 8601 `YYYY-MM-DDTHH:MM:SSZ` string, computed
/// with std only (no chrono dependency). Shared by `cmd_stamp` and
/// `cmd_add`'s provenance stamping so the two surfaces emit identical
/// timestamps.
fn current_utc_timestamp() -> String {
    let now = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap();
    let secs = now.as_secs();
    // Convert to UTC date-time components
    let days = secs / 86400;
    let day_secs = secs % 86400;
    let hours = day_secs / 3600;
    let minutes = (day_secs % 3600) / 60;
    let seconds = day_secs % 60;
    // Civil date from days since epoch (algorithm from Howard Hinnant)
    let z = days as i64 + 719468;
    let era = if z >= 0 { z } else { z - 146096 } / 146097;
    let doe = (z - era * 146097) as u64;
    let yoe = (doe - doe / 1460 + doe / 36524 - doe / 146096) / 365;
    let y = yoe as i64 + era * 400;
    let doy = doe - (365 * yoe + yoe / 4 - yoe / 100);
    let mp = (5 * doy + 2) / 153;
    let d = doy - (153 * mp + 2) / 5 + 1;
    let m = if mp < 10 { mp + 3 } else { mp - 9 };
    let y = if m <= 2 { y + 1 } else { y };
    format!("{y:04}-{m:02}-{d:02}T{hours:02}:{minutes:02}:{seconds:02}Z")
}

#[allow(clippy::too_many_arguments)]
pub(crate) fn cmd_stamp(
    cli: &Cli,
    id: &str,
    created_by: &str,
    model: Option<&str>,
    session_id: Option<&str>,
    reviewed_by: Option<&str>,
    type_filter: Option<&str>,
    changed_since: Option<&str>,
    missing_provenance: bool,
) -> Result<bool> {
    use rivet_core::mutate;

    // Validate created-by value
    match created_by {
        "human" | "ai" | "ai-assisted" => {}
        other => anyhow::bail!(
            "invalid --created-by value '{other}'. Must be one of: human, ai, ai-assisted"
        ),
    }

    let ctx = ProjectContext::load(cli)?;
    let store = ctx.store;

    let timestamp = current_utc_timestamp();

    // Collect artifact IDs to stamp.
    // Filter pipeline (applied in order, each shrinks the candidate set):
    //   1. id == "all" → every local artifact;
    //      id is glob (contains '*' or '?') → match by id;
    //      id is plain → exact ID match.
    //   2. --type pattern: glob on id (`SEC-*`) or exact artifact-type name.
    //   3. --changed-since <ref>: artifact's source file changed in git.
    //   4. --missing-provenance: artifact has no provenance: block.
    let mut ids: Vec<String> = if id == "all" || id.contains('*') || id.contains('?') {
        let pattern = if id == "all" { "*" } else { id };
        store
            .iter()
            .filter(|a| !a.id.contains(':'))
            .filter(|a| glob_matches(pattern, &a.id))
            .map(|a| a.id.clone())
            .collect()
    } else {
        if !store.contains(id) {
            anyhow::bail!("artifact '{id}' does not exist");
        }
        vec![id.to_string()]
    };

    if let Some(pat) = type_filter {
        ids.retain(|aid| {
            let Some(art) = store.get(aid) else {
                return false;
            };
            // Glob form on ID, otherwise exact artifact-type name.
            if pat.contains('*') || pat.contains('?') {
                glob_matches(pat, &art.id)
            } else {
                art.artifact_type == pat
            }
        });
    }

    if let Some(git_ref) = changed_since {
        let changed = files_changed_since(&cli.project, git_ref)?;
        ids.retain(|aid| {
            let Some(art) = store.get(aid) else {
                return false;
            };
            let Some(sf) = art.source_file.as_ref() else {
                return false;
            };
            let sf_str = sf.to_string_lossy();
            changed
                .iter()
                .any(|c| sf_str.ends_with(c.as_str()) || c.ends_with(sf_str.as_ref()))
        });
    }

    if missing_provenance {
        // Provenance is a first-class Option<Provenance> struct field on
        // Artifact, not a custom entry in the `fields:` BTreeMap.
        // Checking `fields.get("provenance")` always returned None,
        // making this filter a no-op and causing
        // `rivet stamp all --missing-provenance` to overwrite timestamps
        // on every existing artifact — silent-accept of a buggy filter.
        ids.retain(|aid| store.get(aid).is_some_and(|a| a.provenance.is_none()));
    }

    if ids.is_empty() {
        anyhow::bail!(
            "no artifacts found to stamp (after filters: type={:?}, changed_since={:?}, missing_provenance={})",
            type_filter,
            changed_since,
            missing_provenance
        );
    }

    let mut stamped = 0;
    // Group artifacts by source file to minimize file I/O
    let mut by_file: std::collections::BTreeMap<std::path::PathBuf, Vec<String>> =
        std::collections::BTreeMap::new();
    for aid in &ids {
        if let Some(source_file) = mutate::find_source_file(aid, &store) {
            by_file.entry(source_file).or_default().push(aid.clone());
        }
        // Skip artifacts without source files (externals, etc.)
    }

    let mut skipped: Vec<(String, String)> = Vec::new();
    for (file_path, artifact_ids) in &by_file {
        let content = std::fs::read_to_string(file_path)
            .with_context(|| format!("reading {}", file_path.display()))?;

        let mut editor = rivet_core::yaml_edit::YamlEditor::parse(&content);
        let mut file_touched = false;

        for aid in artifact_ids {
            // Nested artifacts (e.g. STPA control-actions inside a
            // controller entry) can be visible to the store walk but
            // invisible to the YamlEditor CST walk. Warn and skip
            // instead of bailing the whole batch — the caller usually
            // wants "stamp everything I can" not "stamp everything or
            // nothing".
            // MERGE, not replace (#912). `set_provenance` overwrites the
            // whole block, so the documented hook form — `--created-by`
            // alone — erased `model` on 270 artifacts and `session-id` on 4
            // in this repository's own tree and advanced `timestamp` on 575.
            // `timestamp` is create-only: `model.rs` documents it as the time
            // of creation and the Polarion export maps it to
            // `WorkItem.created`, so advancing it falsifies a creation date.
            match editor.merge_provenance(
                aid,
                created_by,
                model,
                session_id,
                Some(&timestamp),
                reviewed_by,
            ) {
                Ok(()) => {
                    stamped += 1;
                    file_touched = true;
                }
                Err(e) => skipped.push((aid.clone(), e.to_string())),
            }
        }

        if file_touched {
            std::fs::write(file_path, editor.to_string())
                .with_context(|| format!("writing {}", file_path.display()))?;
        }
    }
    if !skipped.is_empty() {
        eprintln!("stamp: skipped {} artifact(s):", skipped.len());
        for (aid, reason) in &skipped {
            eprintln!("  {aid}: {reason}");
        }
    }

    if stamped == 1 {
        println!("stamped {}", ids[0]);
    } else {
        println!("stamped {stamped} artifacts");
    }

    Ok(true)
}

// ── Batch types and command ──────────────────────────────────────────────

/// A batch file containing multiple mutations to apply atomically.
#[derive(Debug, serde::Deserialize)]
struct BatchFile {
    mutations: Vec<BatchMutation>,
}

/// A single mutation within a batch file.
#[derive(Debug, serde::Deserialize)]
#[serde(tag = "action", rename_all = "lowercase")]
enum BatchMutation {
    Add {
        #[serde(rename = "type")]
        artifact_type: String,
        title: String,
        #[serde(default)]
        description: Option<String>,
        #[serde(default)]
        status: Option<String>,
        #[serde(default)]
        tags: Vec<String>,
        #[serde(default)]
        links: Vec<BatchLink>,
        #[serde(default)]
        fields: std::collections::BTreeMap<String, rivet_yaml::Value>,
    },
    Link {
        source: String,
        link_type: String,
        target: String,
    },
    Modify {
        id: String,
        #[serde(default)]
        set_status: Option<String>,
        #[serde(default)]
        set_title: Option<String>,
        #[serde(default)]
        set_fields: Vec<BatchFieldSet>,
    },
}

/// A link entry within a batch add mutation.
#[derive(Debug, serde::Deserialize)]
struct BatchLink {
    #[serde(rename = "type")]
    link_type: String,
    target: String,
}

/// A field assignment within a batch modify mutation.
#[derive(Debug, serde::Deserialize)]
struct BatchFieldSet {
    key: String,
    value: String,
}

/// Apply a batch of mutations from a YAML file.
pub(crate) fn cmd_batch(cli: &Cli, file: &std::path::Path) -> Result<bool> {
    use rivet_core::model::{Artifact, Link};
    use rivet_core::mutate;

    let content = std::fs::read_to_string(file)
        .with_context(|| format!("reading batch file {}", file.display()))?;

    let batch: BatchFile = rivet_yaml::from_str(&content).with_context(|| "parsing batch file")?;

    if batch.mutations.is_empty() {
        println!("batch: no mutations to apply");
        return Ok(true);
    }

    let ctx = ProjectContext::load(cli)?;
    let mut store = ctx.store;
    let schema = ctx.schema;

    // Track the ID generated by the most recent "add" for $prev substitution.
    let mut prev_id: Option<String> = None;

    // ── Phase 1: validate all mutations before applying any ─────────────
    // We clone the store so validation can see the effects of earlier adds
    // in the batch without modifying the real files yet.
    let mut validation_store = store.clone();
    let mut planned_ids: Vec<Option<String>> = Vec::new();
    let mut validation_prev: Option<String> = None;

    for (i, mutation) in batch.mutations.iter().enumerate() {
        match mutation {
            BatchMutation::Add {
                artifact_type,
                title,
                description,
                status,
                tags,
                links,
                fields,
            } => {
                let prefix = mutate::prefix_for_type(artifact_type, &validation_store);
                let id = mutate::next_id(&validation_store, &prefix);

                let link_vec: Vec<Link> = links
                    .iter()
                    .map(|l| {
                        let target = substitute_prev(&l.target, &validation_prev);
                        Link {
                            link_type: l.link_type.clone(),
                            target,
                            external: None,
                        }
                    })
                    .collect();

                let artifact = Artifact {
                    id: id.clone(),
                    artifact_type: artifact_type.clone(),
                    title: title.clone(),
                    description: description.clone(),
                    status: Some(status.as_deref().unwrap_or("draft").to_string()),
                    release: None,
                    tags: tags.clone(),
                    links: link_vec,
                    fields: fields.clone(),
                    fields_per_variant: Default::default(),
                    provenance: None,
                    source_file: None,
                };

                mutate::validate_add(&artifact, &validation_store, &schema)
                    .with_context(|| format!("batch mutation #{}: add '{}'", i + 1, id))?;

                // Insert into validation store so subsequent mutations can reference it
                validation_store.upsert(artifact);
                validation_prev = Some(id.clone());
                planned_ids.push(Some(id));
            }
            BatchMutation::Link {
                source,
                link_type,
                target,
            } => {
                let source = substitute_prev(source, &validation_prev);
                let target = substitute_prev(target, &validation_prev);
                mutate::validate_link(&source, link_type, &target, &validation_store, &schema)
                    .with_context(|| {
                        format!(
                            "batch mutation #{}: link {} --[{}]--> {}",
                            i + 1,
                            source,
                            link_type,
                            target
                        )
                    })?;
                planned_ids.push(None);
            }
            BatchMutation::Modify {
                id,
                set_status,
                set_title,
                set_fields,
            } => {
                let id = substitute_prev(id, &validation_prev);
                let params = mutate::ModifyParams {
                    set_status: set_status.clone(),
                    set_title: set_title.clone(),
                    set_fields: set_fields
                        .iter()
                        .map(|f| (f.key.clone(), f.value.clone()))
                        .collect(),
                    ..Default::default()
                };
                mutate::validate_modify(&id, &params, &validation_store, &schema)
                    .with_context(|| format!("batch mutation #{}: modify '{}'", i + 1, id))?;
                planned_ids.push(None);
            }
        }
    }

    // ── Phase 2: compute every file, then commit ────────────────────────
    // REQ-367 / #955: Phase 1 validates everything, which reads as
    // all-or-nothing — and then this phase used to write one file at a time.
    // A failure here (notably `find_file_for_type` returning None, which
    // Phase 1 never checked) left every earlier mutation already on disk with
    // the command exiting non-zero. Nothing now reaches disk until the whole
    // batch is computed.
    let mut staged = mutate::StagedWrites::new();
    let mut applied: Vec<String> = Vec::new();
    for (i, mutation) in batch.mutations.iter().enumerate() {
        match mutation {
            BatchMutation::Add {
                artifact_type,
                title,
                description,
                status,
                tags,
                links,
                fields,
            } => {
                let prefix = mutate::prefix_for_type(artifact_type, &store);
                let id = mutate::next_id(&store, &prefix);

                let link_vec: Vec<Link> = links
                    .iter()
                    .map(|l| {
                        let target = substitute_prev(&l.target, &prev_id);
                        Link {
                            link_type: l.link_type.clone(),
                            target,
                            external: None,
                        }
                    })
                    .collect();

                let artifact = Artifact {
                    id: id.clone(),
                    artifact_type: artifact_type.clone(),
                    title: title.clone(),
                    description: description.clone(),
                    status: Some(status.as_deref().unwrap_or("draft").to_string()),
                    release: None,
                    tags: tags.clone(),
                    links: link_vec,
                    fields: fields.clone(),
                    fields_per_variant: Default::default(),
                    provenance: None,
                    source_file: None,
                };

                // Find target file
                let target_file =
                    mutate::find_file_for_type(artifact_type, &store).ok_or_else(|| {
                        anyhow::anyhow!(
                            "batch mutation #{}: no existing file found for type '{}'. \
                             Add an artifact of this type first or use `rivet add --file`.",
                            i + 1,
                            artifact_type
                        )
                    })?;

                let base = staged
                    .base_content(&target_file)
                    .with_context(|| format!("reading {}", target_file.display()))?;
                staged.stage(target_file, mutate::append_artifact_yaml(&base, &artifact));

                applied.push(format!("added {id}"));
                store.upsert(artifact);
                prev_id = Some(id);
            }
            BatchMutation::Link {
                source,
                link_type,
                target,
            } => {
                let source = substitute_prev(source, &prev_id);
                let target = substitute_prev(target, &prev_id);

                let source_file = mutate::find_source_file(&source, &store).ok_or_else(|| {
                    anyhow::anyhow!(
                        "batch mutation #{}: cannot determine source file for '{}'",
                        i + 1,
                        source
                    )
                })?;

                let link = Link {
                    link_type: link_type.clone(),
                    target: target.clone(),
                    external: None,
                };

                let base = staged
                    .base_content(&source_file)
                    .with_context(|| format!("reading {}", source_file.display()))?;
                let updated = mutate::add_link_yaml(&base, &source, &link)
                    .with_context(|| format!("updating {}", source_file.display()))?;
                staged.stage(source_file, updated);

                applied.push(format!("linked {source} --[{link_type}]--> {target}"));
            }
            BatchMutation::Modify {
                id,
                set_status,
                set_title,
                set_fields,
            } => {
                let id = substitute_prev(id, &prev_id);

                let params = mutate::ModifyParams {
                    set_status: set_status.clone(),
                    set_title: set_title.clone(),
                    set_fields: set_fields
                        .iter()
                        .map(|f| (f.key.clone(), f.value.clone()))
                        .collect(),
                    ..Default::default()
                };

                let source_file = mutate::find_source_file(&id, &store).ok_or_else(|| {
                    anyhow::anyhow!(
                        "batch mutation #{}: cannot determine source file for '{}'",
                        i + 1,
                        id
                    )
                })?;

                let base = staged
                    .base_content(&source_file)
                    .with_context(|| format!("reading {}", source_file.display()))?;
                let updated = mutate::modify_artifact_yaml(&base, &id, &params, &store, &schema)
                    .with_context(|| format!("updating {}", source_file.display()))?;
                staged.stage(source_file, updated);

                applied.push(format!("modified {id}"));
            }
        }
    }

    // Nothing above touched the disk. Commit the whole batch, or none of it.
    let files = staged.commit().context("writing staged batch changes")?;
    for line in &applied {
        println!("{line}");
    }
    println!(
        "\nbatch: applied {} mutation(s) across {} file(s) successfully",
        batch.mutations.len(),
        files
    );
    Ok(true)
}

/// Substitute `$prev` in a string with the most recently generated ID.
fn substitute_prev(s: &str, prev: &Option<String>) -> String {
    if s == "$prev" {
        prev.as_deref().unwrap_or("$prev").to_string()
    } else if s.contains("$prev") {
        match prev {
            Some(id) => s.replace("$prev", id),
            None => s.to_string(),
        }
    } else {
        s.to_string()
    }
}
