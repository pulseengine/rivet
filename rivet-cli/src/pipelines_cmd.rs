// SAFETY-REVIEW (SCRC Phase 1, DD-058): CLI module; file-scope blanket
// allow matches the rest of rivet-cli. User-facing errors flow through
// anyhow; unwrap sites are on JSON serialisation of values we control.
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

//! `rivet pipelines` — declarative view over agent-pipelines blocks.
//!
//! Subcommands:
//! - `rivet pipelines list` — list active pipelines across all loaded schemas
//! - `rivet pipelines show <schema>` — dump the resolved agent-pipelines block
//! - `rivet pipelines validate` — enforce Tier-3 resolution, unknown oracle refs,
//!   missing reviewer groups, missing context keys. The hard gate that
//!   `rivet close-gaps` depends on.

use std::path::Path;

use anyhow::{Context, Result};

use rivet_core::agent_pipelines::AgentPipelines;
use rivet_core::embedded;

/// Load the project's active schemas, return them paired with their
/// `agent-pipelines:` block (if any).
///
/// `project_root` is the rivet.yaml directory; `schemas_dir` is the
/// override directory (or the default resolved from the binary). The
/// caller is responsible for passing these correctly — usually
/// `main.rs::resolve_schemas_dir`.
pub fn load_pipelines(
    project_root: &Path,
    schemas_dir: &Path,
) -> Result<Vec<(String, AgentPipelines)>> {
    let config_path = project_root.join("rivet.yaml");
    let config = rivet_core::load_project_config(&config_path)
        .with_context(|| format!("loading {}", config_path.display()))?;

    let mut out = Vec::new();
    for schema_name in &config.project.schemas {
        if let Some(block) = agent_pipelines_for(schemas_dir, schema_name)? {
            out.push((schema_name.clone(), block));
        }
    }
    Ok(out)
}

/// Locate and re-parse the schema YAML to pick up the agent-pipelines:
/// block. Tries on-disk first (user-shipped override), then embedded.
fn agent_pipelines_for(
    schemas_dir: &Path,
    name: &str,
) -> Result<Option<AgentPipelines>> {
    let on_disk = schemas_dir.join(format!("{name}.yaml"));
    if on_disk.exists() {
        let content = std::fs::read_to_string(&on_disk)
            .with_context(|| format!("reading {}", on_disk.display()))?;
        return extract_block(&content);
    }
    // Embedded fallback: the SchemaFile was parsed, and our extended
    // SchemaFile now carries the block as a first-class field.
    if let Ok(sf) = embedded::load_embedded_schema(name) {
        return Ok(sf.agent_pipelines);
    }
    Ok(None)
}

fn extract_block(content: &str) -> Result<Option<AgentPipelines>> {
    let raw: serde_yaml::Value = serde_yaml::from_str(content)
        .context("parsing schema YAML for agent-pipelines extraction")?;
    let Some(block) = raw.get("agent-pipelines") else {
        return Ok(None);
    };
    let typed: AgentPipelines = serde_yaml::from_value(block.clone())
        .context("parsing agent-pipelines: block")?;
    Ok(Some(typed))
}

// ── list ───────────────────────────────────────────────────────────────

pub fn cmd_list(project_root: &Path, schemas_dir: &Path, format: &str) -> Result<bool> {
    validate_format(format)?;
    let pipelines = load_pipelines(project_root, schemas_dir)?;

    if format == "json" {
        let mut out = serde_json::Map::new();
        for (schema, ap) in &pipelines {
            let pl: Vec<_> = ap
                .pipelines
                .iter()
                .map(|(name, p)| {
                    serde_json::json!({
                        "name": name,
                        "description": p.description,
                        "uses_oracles": p.uses_oracles,
                    })
                })
                .collect();
            out.insert(schema.clone(), serde_json::Value::Array(pl));
        }
        println!("{}", serde_json::to_string_pretty(&out)?);
    } else if pipelines.is_empty() {
        println!("no schemas declare an agent-pipelines: block");
    } else {
        for (schema, ap) in &pipelines {
            if ap.pipelines.is_empty() {
                continue;
            }
            println!("{schema}:");
            for (name, p) in &ap.pipelines {
                println!(
                    "  {name}  (uses-oracles: {})",
                    p.uses_oracles.join(", ")
                );
                if !p.description.is_empty() {
                    println!("    └ {}", p.description);
                }
            }
        }
    }
    Ok(true)
}

// ── show ───────────────────────────────────────────────────────────────

pub fn cmd_show(
    project_root: &Path,
    schemas_dir: &Path,
    schema_name: &str,
    format: &str,
) -> Result<bool> {
    validate_format(format)?;
    let pipelines = load_pipelines(project_root, schemas_dir)?;
    let Some((_, ap)) = pipelines.iter().find(|(s, _)| s == schema_name) else {
        anyhow::bail!("schema `{schema_name}` has no agent-pipelines: block or is not active");
    };
    if format == "json" {
        println!("{}", serde_json::to_string_pretty(ap)?);
    } else {
        println!("Schema: {schema_name}");
        println!();
        println!("Oracles ({}):", ap.oracles.len());
        for o in &ap.oracles {
            println!("  {}", o.id);
            println!("    command:  {}", o.command);
            if !o.description.is_empty() {
                println!("    descr:    {}", o.description);
            }
        }
        println!();
        println!("Pipelines ({}):", ap.pipelines.len());
        for (name, p) in &ap.pipelines {
            println!("  {name}:");
            println!("    uses-oracles:         [{}]", p.uses_oracles.join(", "));
            println!("    rank-by rules:        {}", p.rank_by.len());
            println!("    auto-close rules:     {}", p.auto_close.len());
            println!(
                "    human-review rules:   {}",
                p.human_review_required.len()
            );
        }
    }
    Ok(true)
}

// ── validate ───────────────────────────────────────────────────────────

/// Advisory checker over `.rivet/` and each schema's `agent-pipelines:`
/// block. Reports unresolved placeholders, unknown oracle references,
/// unknown `template-kind:` values, and missing reviewer-group mappings.
///
/// **Default behaviour is advisory**: prints the report and exits 0 even
/// when problems are found. This is deliberate — per the blog's
/// "rivet tools produce errors the agent responds to" framing, rivet
/// should not refuse its own subcommand on project-config issues. The
/// `validate` oracle that matters is `rivet validate` (against
/// artifacts). This here is a hygiene check on the pipeline
/// configuration; orchestrators may inspect it, humans decide.
///
/// Pass `strict=true` to make it CI-gating (exit 1 on any error).
pub fn cmd_validate(
    project_root: &Path,
    schemas_dir: &Path,
    format: &str,
    strict: bool,
) -> Result<bool> {
    validate_format(format)?;
    let pipelines = load_pipelines(project_root, schemas_dir)?;
    let mut errors: Vec<String> = Vec::new();
    let mut warnings: Vec<String> = Vec::new();

    // (1)+(2): per-schema internal validation, including unknown
    // template-kind rejection against the project's templates dir.
    for (schema, ap) in &pipelines {
        if let Err(errs) = ap.validate_with_project(project_root) {
            for e in errs {
                errors.push(format!("[{schema}] {e}"));
            }
        }
    }

    // (3): Tier-3 placeholder check — .rivet/context/ must exist and its
    // files must not contain the literal marker `{{PLACEHOLDER}}` in
    // any required field.
    let context_dir = project_root.join(".rivet").join("context");
    if context_dir.exists() {
        if let Ok(entries) = std::fs::read_dir(&context_dir) {
            for entry in entries.flatten() {
                let p = entry.path();
                if p.extension().and_then(|s| s.to_str()) != Some("yaml")
                    && p.extension().and_then(|s| s.to_str()) != Some("md")
                {
                    continue;
                }
                if let Ok(content) = std::fs::read_to_string(&p) {
                    for (idx, line) in content.lines().enumerate() {
                        if line.contains("{{PLACEHOLDER") && !line.contains("accepted-empty") {
                            errors.push(format!(
                                "{} line {}: unresolved placeholder (mark `accepted-empty: <reason>` if intentional)",
                                p.display(),
                                idx + 1
                            ));
                        }
                    }
                }
            }
        }
    } else {
        warnings.push(
            "no .rivet/context/ — run `rivet init --agents --bootstrap` to scaffold it"
                .to_string(),
        );
    }

    // (4): reviewer-group placeholder resolution — any routing rule that
    // references `{context.review-roles.X}` needs `X` defined in
    // review-roles.yaml.
    let review_roles_path = context_dir.join("review-roles.yaml");
    let review_roles: Option<serde_yaml::Value> = if review_roles_path.exists() {
        std::fs::read_to_string(&review_roles_path)
            .ok()
            .and_then(|c| serde_yaml::from_str(&c).ok())
    } else {
        None
    };
    for (schema, ap) in &pipelines {
        for (pname, p) in &ap.pipelines {
            for rule_kind in [&p.auto_close, &p.human_review_required] {
                for (i, r) in rule_kind.iter().enumerate() {
                    for reviewer in &r.reviewers {
                        if let Some(role) = strip_review_roles_prefix(reviewer) {
                            let resolved = review_roles
                                .as_ref()
                                .and_then(|v| v.get(role))
                                .is_some();
                            if !resolved {
                                errors.push(format!(
                                    "[{schema}::{pname}][rule {i}] reviewer `{reviewer}` references review-roles.{role} but .rivet/context/review-roles.yaml has no such entry"
                                ));
                            }
                        }
                    }
                }
            }
        }
    }

    if format == "json" {
        let out = serde_json::json!({
            "errors": errors,
            "warnings": warnings,
            "ok": errors.is_empty(),
            "strict": strict,
        });
        println!("{}", serde_json::to_string_pretty(&out)?);
    } else {
        if !errors.is_empty() {
            println!("Pipeline configuration issues ({}):", errors.len());
            for e in &errors {
                println!("  {e}");
            }
            println!();
            println!(
                "  (advisory — `rivet close-gaps` will still run. Re-run with"
            );
            println!("  `--strict` if you want this to gate CI.)");
        }
        if !warnings.is_empty() {
            println!("Warnings ({}):", warnings.len());
            for w in &warnings {
                println!("  {w}");
            }
        }
        if errors.is_empty() && warnings.is_empty() {
            println!(
                "Pipeline configuration OK ({} schemas, {} oracles)",
                pipelines.len(),
                pipelines.iter().map(|(_, a)| a.oracles.len()).sum::<usize>(),
            );
        }
    }

    // Default: always Ok(true) — this is advisory, not a gate.
    // `--strict`: return Ok(false) on any error to give CI an exit code.
    if strict {
        Ok(errors.is_empty())
    } else {
        Ok(true)
    }
}

fn strip_review_roles_prefix(reviewer: &str) -> Option<&str> {
    let trimmed = reviewer.trim();
    let inner = trimmed.strip_prefix('{').and_then(|s| s.strip_suffix('}'))?;
    inner.strip_prefix("context.review-roles.")
}

fn validate_format(fmt: &str) -> Result<()> {
    match fmt {
        "text" | "json" => Ok(()),
        other => Err(anyhow::anyhow!(
            "unknown --format `{other}`: expected `text` or `json`"
        )),
    }
}
