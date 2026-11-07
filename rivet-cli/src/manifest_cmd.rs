//! `rivet manifest export` (#1159): write the repository boundary manifest
//! (`pulseengine.manifest.json`) from the project's `provides` / `consumes`
//! artifacts. The document conforms to `schemas/pulseengine.manifest.v1.json`.
//!
//! Exit codes: 0 exported; 1 a manifest artifact has a validation error
//! (nothing is written); 2 usage — a bad flag value (clap) or a project that
//! does not load the `manifest` schema.

use std::path::{Path, PathBuf};

use anyhow::{Context, Result};
use clap::Subcommand;
use rivet_core::manifest::{self, CONSUMES_TYPE, PROVIDES_TYPE};
use rivet_core::schema::Severity;

use crate::{Cli, ProjectContext};

#[derive(Debug, Subcommand)]
pub(crate) enum ManifestAction {
    /// Export the boundary manifest (`pulseengine.manifest/1`) as JSON.
    ///
    /// Reads every `provides` / `consumes` artifact (the `manifest` schema
    /// must be listed in rivet.yaml), refuses with exit 1 if any of them has
    /// a validation error, and otherwise prints the document to stdout or
    /// writes it to `--output`.
    Export {
        /// Output format (only "json")
        #[arg(short, long, default_value = "json", value_parser = ["json"])]
        format: String,

        /// Write to this file instead of stdout. An existing directory gets
        /// `pulseengine.manifest.json` inside it.
        #[arg(short, long)]
        output: Option<PathBuf>,

        /// Repository identity for the `repo` field (default: the project
        /// name from rivet.yaml)
        #[arg(long)]
        repo: Option<String>,

        /// Release tag for `release.tag` (default: null)
        #[arg(long)]
        tag: Option<String>,
    },
}

pub(crate) fn run(cli: &Cli, action: &ManifestAction) -> Result<bool> {
    match action {
        ManifestAction::Export {
            format: _,
            output,
            repo,
            tag,
        } => cmd_export(cli, output.as_deref(), repo.as_deref(), tag.as_deref()),
    }
}

fn cmd_export(
    cli: &Cli,
    output: Option<&Path>,
    repo: Option<&str>,
    tag: Option<&str>,
) -> Result<bool> {
    let ctx = ProjectContext::load(cli)?;
    ctx.warn_parse_error_skips(cli);

    if ctx.schema.artifact_type(PROVIDES_TYPE).is_none()
        && ctx.schema.artifact_type(CONSUMES_TYPE).is_none()
    {
        eprintln!(
            "error: the `manifest` schema is not loaded — add `manifest` to \
             `schemas:` in rivet.yaml (see `rivet docs manifest`)"
        );
        std::process::exit(2);
    }

    // Refuse to export a manifest whose entries do not validate: a consumer
    // would otherwise read a pin with no value, an unknown kind, etc.
    let diagnostics = rivet_core::validate::validate(&ctx.store, &ctx.schema, &ctx.graph);
    let errors: Vec<_> = diagnostics
        .iter()
        .filter(|d| d.severity == Severity::Error)
        .filter(|d| {
            d.artifact_id
                .as_deref()
                .and_then(|id| ctx.store.get(id))
                .is_some_and(|a| {
                    a.artifact_type == PROVIDES_TYPE || a.artifact_type == CONSUMES_TYPE
                })
        })
        .collect();
    if !errors.is_empty() {
        for d in &errors {
            eprintln!(
                "ERROR: {} [{}] {}",
                d.artifact_id.as_deref().unwrap_or("-"),
                d.rule,
                d.message
            );
        }
        eprintln!(
            "manifest export refused: {} validation error(s) on provides/consumes artifacts \
             (run `rivet validate`)",
            errors.len()
        );
        return Ok(false);
    }

    let opts = manifest::ExportOptions {
        repo: repo
            .map(str::to_string)
            .unwrap_or_else(|| ctx.config.project.name.clone()),
        tag: tag.map(str::to_string),
    };
    let doc = manifest::export(&ctx.store, &ctx.schema, &opts);
    let mut text = serde_json::to_string_pretty(&doc).context("serializing manifest")?;
    text.push('\n');

    match output {
        None => print!("{text}"),
        Some(p) => {
            let path = if p.is_dir() {
                p.join(manifest::MANIFEST_FILE_NAME)
            } else {
                p.to_path_buf()
            };
            std::fs::write(&path, &text).with_context(|| format!("writing {}", path.display()))?;
            eprintln!("wrote {}", path.display());
        }
    }
    Ok(true)
}
