use std::path::PathBuf;
use std::process::ExitCode;

use anyhow::{Context, Result};
use clap::{Parser, Subcommand};

use rivet_core::coverage;
use rivet_core::diff::{ArtifactDiff, DiagnosticDiff};
use rivet_core::document::{self, DocumentStore};
use rivet_core::links::LinkGraph;
use rivet_core::matrix::{self, Direction};
use rivet_core::results::{self, ResultStore};
use rivet_core::schema::Severity;
use rivet_core::store::Store;
use rivet_core::validate;

mod docs;
mod schema_cmd;
mod serve;

#[derive(Parser)]
#[command(name = "rivet", about = "SDLC artifact traceability and validation")]
struct Cli {
    /// Path to the project directory (containing rivet.yaml)
    #[arg(short, long, default_value = ".")]
    project: PathBuf,

    /// Path to schemas directory
    #[arg(long)]
    schemas: Option<PathBuf>,

    /// Increase verbosity
    #[arg(short, long, action = clap::ArgAction::Count)]
    verbose: u8,

    #[command(subcommand)]
    command: Command,
}

#[derive(Subcommand)]
enum Command {
    /// Initialize a new rivet project
    Init {
        /// Project name (defaults to directory name)
        #[arg(long)]
        name: Option<String>,

        /// Preset: dev (default), aspice, stpa, cybersecurity, aadl
        #[arg(long, default_value = "dev")]
        preset: String,

        /// Schemas to include (overrides preset if given)
        #[arg(long, value_delimiter = ',')]
        schema: Vec<String>,

        /// Directory to initialize (defaults to current directory)
        #[arg(long, default_value = ".")]
        dir: PathBuf,
    },

    /// Validate artifacts against schemas
    Validate {
        /// Output format: "text" (default) or "json"
        #[arg(short, long, default_value = "text")]
        format: String,
    },

    /// List artifacts, optionally filtered by type
    List {
        /// Filter by artifact type
        #[arg(short = 't', long)]
        r#type: Option<String>,

        /// Filter by status
        #[arg(short, long)]
        status: Option<String>,

        /// Output format: "text" (default) or "json"
        #[arg(short, long, default_value = "text")]
        format: String,
    },

    /// Show artifact summary statistics
    Stats {
        /// Output format: "text" (default) or "json"
        #[arg(short, long, default_value = "text")]
        format: String,
    },

    /// Show traceability coverage report
    Coverage {
        /// Output format: "table" (default) or "json"
        #[arg(short, long, default_value = "table")]
        format: String,

        /// Exit with failure if overall coverage is below this percentage
        #[arg(long)]
        fail_under: Option<f64>,
    },

    /// Generate a traceability matrix
    Matrix {
        /// Source artifact type
        #[arg(long)]
        from: String,

        /// Target artifact type
        #[arg(long)]
        to: String,

        /// Link type to trace (default: auto-detect)
        #[arg(long)]
        link: Option<String>,

        /// Direction: "forward" or "backward"
        #[arg(long, default_value = "backward")]
        direction: String,

        /// Output format: "text" (default) or "json"
        #[arg(short, long, default_value = "text")]
        format: String,
    },

    /// Load and validate STPA files directly (without rivet.yaml)
    Stpa {
        /// Path to STPA directory
        path: PathBuf,

        /// Path to STPA schema
        #[arg(long)]
        schema: Option<PathBuf>,
    },

    /// Compare two versions of artifacts and show what changed
    Diff {
        /// Path to the base artifact directory (older version)
        #[arg(long)]
        base: Option<PathBuf>,

        /// Path to the head artifact directory (newer version)
        #[arg(long)]
        head: Option<PathBuf>,

        /// Output format: "text" (default) or "json"
        #[arg(short, long, default_value = "text")]
        format: String,
    },

    /// Export artifacts to a specified format
    Export {
        /// Output format: "reqif", "generic-yaml"
        #[arg(short, long)]
        format: String,

        /// Output file path (stdout if omitted)
        #[arg(short, long)]
        output: Option<PathBuf>,
    },

    /// Introspect loaded schemas (types, links, rules)
    Schema {
        #[command(subcommand)]
        action: SchemaAction,
    },

    /// Built-in documentation (topics, search)
    Docs {
        /// Topic slug to display (omit for topic list)
        topic: Option<String>,

        /// Search across all docs (like grep)
        #[arg(long)]
        grep: Option<String>,

        /// Output format: "text" (default) or "json"
        #[arg(short, long, default_value = "text")]
        format: String,

        /// Context lines around grep matches
        #[arg(short = 'C', long, default_value = "2")]
        context: usize,
    },

    /// Generate .rivet/agent-context.md from current project state
    Context,

    /// Start the HTMX-powered dashboard server
    Serve {
        /// Port to listen on
        #[arg(short = 'P', long, default_value = "3000")]
        port: u16,
    },

    /// Import artifacts using a custom WASM adapter component
    #[cfg(feature = "wasm")]
    Import {
        /// Path to the WASM adapter component file (.wasm)
        #[arg(long)]
        adapter: PathBuf,

        /// Path to the source data (file or directory)
        #[arg(long)]
        source: PathBuf,

        /// Adapter configuration entries (key=value pairs)
        #[arg(long = "config", value_parser = parse_key_val)]
        config_entries: Vec<(String, String)>,
    },
}

#[derive(Subcommand)]
enum SchemaAction {
    /// List all artifact types
    List {
        /// Output format: "text" (default) or "json"
        #[arg(short, long, default_value = "text")]
        format: String,
    },
    /// Show detailed info for an artifact type
    Show {
        /// Artifact type name
        name: String,
        /// Output format: "text" (default) or "json"
        #[arg(short, long, default_value = "text")]
        format: String,
    },
    /// List all link types with inverses
    Links {
        /// Output format: "text" (default) or "json"
        #[arg(short, long, default_value = "text")]
        format: String,
    },
    /// List all traceability rules
    Rules {
        /// Output format: "text" (default) or "json"
        #[arg(short, long, default_value = "text")]
        format: String,
    },
}

fn main() -> ExitCode {
    let cli = Cli::parse();

    let log_level = match cli.verbose {
        0 => "warn",
        1 => "info",
        _ => "debug",
    };
    env_logger::Builder::from_env(env_logger::Env::default().default_filter_or(log_level))
        .format_timestamp(None)
        .init();

    match run(cli) {
        Ok(success) => {
            if success {
                ExitCode::SUCCESS
            } else {
                ExitCode::FAILURE
            }
        }
        Err(e) => {
            eprintln!("error: {:#}", e);
            ExitCode::FAILURE
        }
    }
}

fn run(cli: Cli) -> Result<bool> {
    // Commands that don't need a loaded project.
    if let Command::Init { name, preset, schema, dir } = &cli.command {
        return cmd_init(name.as_deref(), preset, schema, dir);
    }
    if let Command::Docs { topic, grep, format, context } = &cli.command {
        return cmd_docs(topic.as_deref(), grep.as_deref(), format, *context);
    }
    if let Command::Context = &cli.command {
        return cmd_context(&cli);
    }

    match &cli.command {
        Command::Init { .. } | Command::Docs { .. } | Command::Context => unreachable!(),
        Command::Stpa { path, schema } => cmd_stpa(path, schema.as_deref(), &cli),
        Command::Validate { format } => cmd_validate(&cli, format),
        Command::List { r#type, status, format } => cmd_list(&cli, r#type.as_deref(), status.as_deref(), format),
        Command::Stats { format } => cmd_stats(&cli, format),
        Command::Coverage { format, fail_under } => cmd_coverage(&cli, format, fail_under.as_ref()),
        Command::Matrix {
            from,
            to,
            link,
            direction,
            format,
        } => cmd_matrix(&cli, from, to, link.as_deref(), direction, format),
        Command::Diff { base, head, format } => cmd_diff(&cli, base.as_deref(), head.as_deref(), format),
        Command::Export { format, output } => cmd_export(&cli, format, output.as_deref()),
        Command::Schema { action } => cmd_schema(&cli, action),
        Command::Serve { port } => {
            let port = *port;
            let (store, schema, graph, doc_store, result_store, project_name, project_path, schemas_dir) =
                load_project_full(&cli)?;
            let rt = tokio::runtime::Runtime::new().context("failed to create tokio runtime")?;
            rt.block_on(serve::run(
                store,
                schema,
                graph,
                doc_store,
                result_store,
                project_name,
                project_path,
                schemas_dir,
                port,
            ))?;
            Ok(true)
        }
        #[cfg(feature = "wasm")]
        Command::Import {
            adapter,
            source,
            config_entries,
        } => cmd_import(adapter, source, config_entries),
    }
}

/// Initialize a new rivet project.
fn cmd_init(name: Option<&str>, preset: &str, schemas: &[String], dir: &std::path::Path) -> Result<bool> {
    let dir = if dir == std::path::Path::new(".") {
        std::env::current_dir().context("resolving current directory")?
    } else {
        dir.to_path_buf()
    };

    let project_name = name.map(|s| s.to_string()).unwrap_or_else(|| {
        dir.file_name()
            .map(|n| n.to_string_lossy().into_owned())
            .unwrap_or_else(|| "my-project".to_string())
    });

    // Check for existing rivet.yaml
    let config_path = dir.join("rivet.yaml");
    if config_path.exists() {
        eprintln!(
            "warning: {} already exists, skipping init",
            config_path.display()
        );
        return Ok(false);
    }

    // Ensure the target directory exists
    std::fs::create_dir_all(&dir)
        .with_context(|| format!("creating directory {}", dir.display()))?;

    // Resolve schemas: use explicit --schema if given, otherwise derive from preset
    let resolved_schemas: Vec<String> = if schemas.is_empty() {
        match preset {
            "aspice" => vec!["common".to_string(), "aspice".to_string()],
            "stpa" => vec!["common".to_string(), "stpa".to_string()],
            "cybersecurity" => vec!["common".to_string(), "cybersecurity".to_string()],
            "aadl" => vec!["common".to_string(), "aadl".to_string()],
            _ => vec!["common".to_string(), "dev".to_string()],
        }
    } else {
        schemas.to_vec()
    };

    // Build schema list for the config
    let schema_entries: String = resolved_schemas
        .iter()
        .map(|s| format!("    - {s}"))
        .collect::<Vec<_>>()
        .join("\n");

    // Write rivet.yaml
    let config_content = format!(
        "\
project:
  name: {project_name}
  version: \"0.1.0\"
  schemas:
{schema_entries}

sources:
  - path: artifacts
    format: generic-yaml
"
    );
    std::fs::write(&config_path, &config_content)
        .with_context(|| format!("writing {}", config_path.display()))?;
    println!("  created {}", config_path.display());

    // Create artifacts/ directory with a sample file
    let artifacts_dir = dir.join("artifacts");
    std::fs::create_dir_all(&artifacts_dir)
        .with_context(|| format!("creating {}", artifacts_dir.display()))?;

    let sample_artifact_path = artifacts_dir.join("requirements.yaml");
    let sample_artifact = "\
artifacts:
  - id: REQ-001
    type: requirement
    title: First requirement
    status: draft
    description: >
      Describe what the system shall do.
    tags: [core]
    fields:
      priority: must
      category: functional
";
    std::fs::write(&sample_artifact_path, sample_artifact)
        .with_context(|| format!("writing {}", sample_artifact_path.display()))?;
    println!("  created {}", sample_artifact_path.display());

    // Create docs/ directory with a sample document
    let docs_dir = dir.join("docs");
    std::fs::create_dir_all(&docs_dir)
        .with_context(|| format!("creating {}", docs_dir.display()))?;

    let sample_doc_path = docs_dir.join("getting-started.md");
    let sample_doc = format!(
        "\
# {project_name}

Getting started with your rivet project.

## Overview

This project uses [rivet](https://github.com/pulseengine/rivet) for SDLC artifact
traceability and validation. Artifacts are stored as YAML files in `artifacts/` and
validated against schemas listed in `rivet.yaml`.

## Quick start

```bash
rivet validate     # Validate all artifacts
rivet list         # List all artifacts
rivet stats        # Show summary statistics
```
"
    );
    std::fs::write(&sample_doc_path, &sample_doc)
        .with_context(|| format!("writing {}", sample_doc_path.display()))?;
    println!("  created {}", sample_doc_path.display());

    println!(
        "\nInitialized rivet project '{}' in {}",
        project_name,
        dir.display()
    );

    Ok(true)
}

/// Load STPA files directly and validate them.
fn cmd_stpa(
    stpa_dir: &std::path::Path,
    schema_path: Option<&std::path::Path>,
    cli: &Cli,
) -> Result<bool> {
    // Load schema
    let schemas_dir = resolve_schemas_dir(cli);
    let schema = if let Some(path) = schema_path {
        let file = rivet_core::schema::Schema::load_file(path).context("loading schema")?;
        rivet_core::schema::Schema::merge(&[file])
    } else {
        let mut files = Vec::new();
        for name in &["common", "stpa"] {
            let path = schemas_dir.join(format!("{}.yaml", name));
            if path.exists() {
                files.push(
                    rivet_core::schema::Schema::load_file(&path)
                        .with_context(|| format!("loading {}", path.display()))?,
                );
            }
        }
        rivet_core::schema::Schema::merge(&files)
    };

    // Load STPA artifacts
    let artifacts =
        rivet_core::formats::stpa::import_stpa_directory(stpa_dir).context("loading STPA files")?;

    println!(
        "Loaded {} artifacts from {}",
        artifacts.len(),
        stpa_dir.display()
    );

    // Build store
    let mut store = Store::new();
    for artifact in artifacts {
        store.upsert(artifact);
    }

    // Print stats
    print_stats(&store);

    // Build link graph and validate
    let graph = LinkGraph::build(&store, &schema);
    let diagnostics = validate::validate(&store, &schema, &graph);

    print_diagnostics(&diagnostics);

    let errors = diagnostics
        .iter()
        .filter(|d| d.severity == Severity::Error)
        .count();
    let warnings = diagnostics
        .iter()
        .filter(|d| d.severity == Severity::Warning)
        .count();

    println!();
    if errors > 0 {
        println!("Result: FAIL ({} errors, {} warnings)", errors, warnings);
        Ok(false)
    } else if warnings > 0 {
        println!("Result: PASS with {} warnings", warnings);
        Ok(true)
    } else {
        println!("Result: PASS");
        Ok(true)
    }
}

/// Validate a full project (with rivet.yaml).
fn cmd_validate(cli: &Cli, format: &str) -> Result<bool> {
    let (store, schema, graph, doc_store) = load_project_with_docs(cli)?;
    let mut diagnostics = validate::validate(&store, &schema, &graph);
    diagnostics.extend(validate::validate_documents(&doc_store, &store));

    let errors = diagnostics
        .iter()
        .filter(|d| d.severity == Severity::Error)
        .count();
    let warnings = diagnostics
        .iter()
        .filter(|d| d.severity == Severity::Warning)
        .count();
    let infos = diagnostics
        .iter()
        .filter(|d| d.severity == Severity::Info)
        .count();

    if format == "json" {
        let diag_json: Vec<serde_json::Value> = diagnostics
            .iter()
            .map(|d| {
                serde_json::json!({
                    "severity": format!("{:?}", d.severity).to_lowercase(),
                    "artifact_id": d.artifact_id,
                    "message": d.message,
                })
            })
            .collect();
        let output = serde_json::json!({
            "command": "validate",
            "errors": errors,
            "warnings": warnings,
            "infos": infos,
            "diagnostics": diag_json,
        });
        println!("{}", serde_json::to_string_pretty(&output).unwrap());
    } else {
        if !doc_store.is_empty() {
            println!(
                "Loaded {} documents with {} artifact references",
                doc_store.len(),
                doc_store.all_references().len()
            );
        }

        print_diagnostics(&diagnostics);

        println!();
        if errors > 0 {
            println!("Result: FAIL ({} errors, {} warnings)", errors, warnings);
        } else {
            println!("Result: PASS ({} warnings)", warnings);
        }
    }

    Ok(errors == 0)
}

/// List artifacts.
fn cmd_list(cli: &Cli, type_filter: Option<&str>, status_filter: Option<&str>, format: &str) -> Result<bool> {
    let (store, _, _) = load_project(cli)?;

    let query = rivet_core::query::Query {
        artifact_type: type_filter.map(|s| s.to_string()),
        status: status_filter.map(|s| s.to_string()),
        ..Default::default()
    };

    let results = rivet_core::query::execute(&store, &query);

    if format == "json" {
        let artifacts_json: Vec<serde_json::Value> = results
            .iter()
            .map(|a| {
                serde_json::json!({
                    "id": a.id,
                    "type": a.artifact_type,
                    "title": a.title,
                    "status": a.status.as_deref().unwrap_or("-"),
                    "links": a.links.len(),
                })
            })
            .collect();
        let output = serde_json::json!({
            "command": "list",
            "count": results.len(),
            "artifacts": artifacts_json,
        });
        println!("{}", serde_json::to_string_pretty(&output).unwrap());
    } else {
        for artifact in &results {
            let status = artifact.status.as_deref().unwrap_or("-");
            let links = artifact.links.len();
            println!(
                "  {:20} {:25} {:12} {:3} links  {}",
                artifact.id, artifact.artifact_type, status, links, artifact.title
            );
        }
        println!("\n{} artifacts", results.len());
    }

    Ok(true)
}

/// Print summary statistics.
fn cmd_stats(cli: &Cli, format: &str) -> Result<bool> {
    let (store, _, graph) = load_project(cli)?;

    let orphans = graph.orphans(&store);

    if format == "json" {
        let mut types = serde_json::Map::new();
        let mut type_names: Vec<&str> = store.types().collect();
        type_names.sort();
        for t in &type_names {
            types.insert(t.to_string(), serde_json::json!(store.count_by_type(t)));
        }
        let output = serde_json::json!({
            "command": "stats",
            "total": store.len(),
            "types": types,
            "orphans": orphans,
            "broken_links": graph.broken.len(),
        });
        println!("{}", serde_json::to_string_pretty(&output).unwrap());
    } else {
        print_stats(&store);

        if !orphans.is_empty() {
            println!("\nOrphan artifacts (no links): {}", orphans.len());
            for id in &orphans {
                println!("  {}", id);
            }
        }

        if !graph.broken.is_empty() {
            println!("\nBroken links: {}", graph.broken.len());
        }
    }

    Ok(true)
}

/// Show traceability coverage report.
fn cmd_coverage(cli: &Cli, format: &str, fail_under: Option<&f64>) -> Result<bool> {
    let (store, schema, graph) = load_project(cli)?;
    let report = coverage::compute_coverage(&store, &schema, &graph);

    if format == "json" {
        let json = report
            .to_json()
            .map_err(|e| anyhow::anyhow!("json serialization: {e}"))?;
        println!("{json}");
    } else {
        println!("Traceability Coverage Report\n");
        println!(
            "  {:<30} {:<20} {:>8} {:>8} {:>8}",
            "Rule", "Source Type", "Covered", "Total", "%"
        );
        println!("  {}", "-".repeat(80));

        for entry in &report.entries {
            println!(
                "  {:<30} {:<20} {:>8} {:>8} {:>7.1}%",
                entry.rule_name,
                entry.source_type,
                entry.covered,
                entry.total,
                entry.percentage()
            );
        }

        let overall = report.overall_coverage();
        println!("  {}", "-".repeat(80));
        println!("  {:<52} {:>7.1}%", "Overall (weighted)", overall);

        // Show uncovered artifacts
        let has_uncovered = report.entries.iter().any(|e| !e.uncovered_ids.is_empty());
        if has_uncovered {
            println!("\nUncovered artifacts:");
            for entry in &report.entries {
                if !entry.uncovered_ids.is_empty() {
                    println!("  {} ({}):", entry.rule_name, entry.source_type);
                    for id in &entry.uncovered_ids {
                        println!("    {}", id);
                    }
                }
            }
        }
    }

    if let Some(&threshold) = fail_under {
        let overall = report.overall_coverage();
        if overall < threshold {
            eprintln!(
                "\nerror: overall coverage {:.1}% is below threshold {:.1}%",
                overall, threshold
            );
            return Ok(false);
        }
    }

    Ok(true)
}

/// Generate a traceability matrix.
fn cmd_matrix(
    cli: &Cli,
    from: &str,
    to: &str,
    link_type: Option<&str>,
    direction: &str,
    format: &str,
) -> Result<bool> {
    let (store, _schema, graph) = load_project(cli)?;

    let dir = match direction {
        "forward" | "fwd" => Direction::Forward,
        "backward" | "back" | "bwd" => Direction::Backward,
        _ => anyhow::bail!("direction must be 'forward' or 'backward'"),
    };

    // Auto-detect link type if not specified
    let link = link_type.unwrap_or(match dir {
        Direction::Forward => "traces-to",
        Direction::Backward => "verifies",
    });

    let result = matrix::compute_matrix(&store, &graph, from, to, link, dir);

    if format == "json" {
        let rows_json: Vec<serde_json::Value> = result
            .rows
            .iter()
            .map(|row| {
                let targets: Vec<&str> = row.targets.iter().map(|t| t.id.as_str()).collect();
                serde_json::json!({
                    "source_id": row.source_id,
                    "targets": targets,
                })
            })
            .collect();
        let output = serde_json::json!({
            "command": "matrix",
            "source_type": result.source_type,
            "target_type": result.target_type,
            "link_type": result.link_type,
            "covered": result.covered,
            "total": result.total,
            "rows": rows_json,
        });
        println!("{}", serde_json::to_string_pretty(&output).unwrap());
    } else {
        println!(
            "Traceability: {} -> {} (via '{}')\n",
            result.source_type, result.target_type, result.link_type
        );

        for row in &result.rows {
            if row.targets.is_empty() {
                println!("  {:20} -> (none)", row.source_id);
            } else {
                let targets: Vec<&str> = row.targets.iter().map(|t| t.id.as_str()).collect();
                println!("  {:20} -> {}", row.source_id, targets.join(", "));
            }
        }

        println!(
            "\nCoverage: {}/{} ({:.1}%)",
            result.covered,
            result.total,
            result.coverage_pct()
        );
    }

    Ok(true)
}

/// Export all project artifacts in the specified format.
fn cmd_export(cli: &Cli, format: &str, output: Option<&std::path::Path>) -> Result<bool> {
    use rivet_core::adapter::{Adapter, AdapterConfig};

    let (store, _, _) = load_project(cli)?;
    let artifacts: Vec<_> = store.iter().cloned().collect();
    let config = AdapterConfig::default();

    let bytes = match format {
        "reqif" => {
            let adapter = rivet_core::reqif::ReqIfAdapter::new();
            adapter
                .export(&artifacts, &config)
                .map_err(|e| anyhow::anyhow!("{e}"))?
        }
        "generic-yaml" | "generic" => {
            let adapter = rivet_core::formats::generic::GenericYamlAdapter::new();
            adapter
                .export(&artifacts, &config)
                .map_err(|e| anyhow::anyhow!("{e}"))?
        }
        other => {
            anyhow::bail!("unsupported export format: {other} (supported: reqif, generic-yaml)")
        }
    };

    if let Some(path) = output {
        std::fs::write(path, &bytes).with_context(|| format!("writing {}", path.display()))?;
        println!(
            "Exported {} artifacts to {}",
            artifacts.len(),
            path.display()
        );
    } else {
        use std::io::Write;
        std::io::stdout()
            .write_all(&bytes)
            .context("writing to stdout")?;
    }

    Ok(true)
}

/// Compare two artifact sets and display the differences.
fn cmd_diff(
    cli: &Cli,
    base_path: Option<&std::path::Path>,
    head_path: Option<&std::path::Path>,
    format: &str,
) -> Result<bool> {
    let (base_store, base_schema, base_graph, head_store, head_schema, head_graph) =
        match (base_path, head_path) {
            (Some(bp), Some(hp)) => {
                // Explicit --base and --head directories: load each as a
                // standalone project.
                let base_cli = Cli {
                    project: bp.to_path_buf(),
                    schemas: cli.schemas.clone(),
                    verbose: cli.verbose,
                    command: Command::Validate { format: "text".to_string() },
                };
                let head_cli = Cli {
                    project: hp.to_path_buf(),
                    schemas: cli.schemas.clone(),
                    verbose: cli.verbose,
                    command: Command::Validate { format: "text".to_string() },
                };
                let (bs, bsc, bg) = load_project(&base_cli)?;
                let (hs, hsc, hg) = load_project(&head_cli)?;
                (bs, bsc, bg, hs, hsc, hg)
            }
            _ => {
                // Default: load the project twice (same working tree). This
                // is a placeholder — a future version will compare against
                // the last clean git state.
                let (s1, sc1, g1) = load_project(cli)?;
                let (s2, sc2, g2) = load_project(cli)?;
                (s1, sc1, g1, s2, sc2, g2)
            }
        };

    // Compute artifact diff
    let diff = ArtifactDiff::compute(&base_store, &head_store);

    // Compute diagnostic diff
    let base_diags = validate::validate(&base_store, &base_schema, &base_graph);
    let head_diags = validate::validate(&head_store, &head_schema, &head_graph);
    let diag_diff = DiagnosticDiff::compute(&base_diags, &head_diags);

    if format == "json" {
        let modified_json: Vec<serde_json::Value> = diff
            .modified
            .iter()
            .map(|change| {
                let mut changes = Vec::new();
                if let Some((old, new)) = &change.title_changed {
                    changes.push(format!("title: {} -> {}", old, new));
                }
                if change.description_changed {
                    changes.push("description: changed".to_string());
                }
                if let Some((old, new)) = &change.status_changed {
                    let old_s = old.as_deref().unwrap_or("(none)");
                    let new_s = new.as_deref().unwrap_or("(none)");
                    changes.push(format!("status: {} -> {}", old_s, new_s));
                }
                if let Some((old, new)) = &change.type_changed {
                    changes.push(format!("type: {} -> {}", old, new));
                }
                for tag in &change.tags_added {
                    changes.push(format!("tag added: {}", tag));
                }
                for tag in &change.tags_removed {
                    changes.push(format!("tag removed: {}", tag));
                }
                for link in &change.links_added {
                    changes.push(format!("link added: {} -> {}", link.link_type, link.target));
                }
                for link in &change.links_removed {
                    changes.push(format!("link removed: {} -> {}", link.link_type, link.target));
                }
                for field in &change.fields_changed {
                    changes.push(format!("field changed: {}", field));
                }
                serde_json::json!({
                    "id": change.id,
                    "changes": changes,
                })
            })
            .collect();

        let output = serde_json::json!({
            "command": "diff",
            "added": diff.added,
            "removed": diff.removed,
            "modified": modified_json,
            "summary": diff.summary(),
        });
        println!("{}", serde_json::to_string_pretty(&output).unwrap());
    } else {
        // ── Display ──────────────────────────────────────────────────────

        let use_color = std::io::IsTerminal::is_terminal(&std::io::stdout());

        let green = |s: &str| {
            if use_color {
                format!("\x1b[32m{s}\x1b[0m")
            } else {
                format!("+ {s}")
            }
        };
        let red = |s: &str| {
            if use_color {
                format!("\x1b[31m{s}\x1b[0m")
            } else {
                format!("- {s}")
            }
        };
        let yellow = |s: &str| {
            if use_color {
                format!("\x1b[33m{s}\x1b[0m")
            } else {
                format!("~ {s}")
            }
        };

        // Added
        for id in &diff.added {
            let title = head_store.get(id).map(|a| a.title.as_str()).unwrap_or("");
            println!("{}", green(&format!("{id}  {title}")));
        }

        // Removed
        for id in &diff.removed {
            let title = base_store.get(id).map(|a| a.title.as_str()).unwrap_or("");
            println!("{}", red(&format!("{id}  {title}")));
        }

        // Modified
        for change in &diff.modified {
            println!("{}", yellow(&change.id));

            if let Some((old, new)) = &change.title_changed {
                println!("  title: {} -> {}", red(old), green(new));
            }
            if change.description_changed {
                println!("  description: changed");
            }
            if let Some((old, new)) = &change.status_changed {
                let old_s = old.as_deref().unwrap_or("(none)");
                let new_s = new.as_deref().unwrap_or("(none)");
                println!("  status: {} -> {}", red(old_s), green(new_s));
            }
            if let Some((old, new)) = &change.type_changed {
                println!("  type: {} -> {}", red(old), green(new));
            }
            for tag in &change.tags_added {
                println!("  tag: {}", green(tag));
            }
            for tag in &change.tags_removed {
                println!("  tag: {}", red(tag));
            }
            for link in &change.links_added {
                println!(
                    "  link: {}",
                    green(&format!("{} -> {}", link.link_type, link.target))
                );
            }
            for link in &change.links_removed {
                println!(
                    "  link: {}",
                    red(&format!("{} -> {}", link.link_type, link.target))
                );
            }
            for field in &change.fields_changed {
                println!("  field changed: {field}");
            }
        }

        // Summary
        println!();
        println!("{}", diff.summary());

        // Diagnostic diff
        if !diag_diff.is_empty() {
            println!();
            for d in &diag_diff.new_errors {
                println!("{}", red(&format!("NEW  {d}")));
            }
            for d in &diag_diff.resolved_errors {
                println!("{}", green(&format!("RESOLVED  {d}")));
            }
            for d in &diag_diff.new_warnings {
                println!("{}", yellow(&format!("NEW  {d}")));
            }
            for d in &diag_diff.resolved_warnings {
                println!("{}", green(&format!("RESOLVED  {d}")));
            }
            println!("{}", diag_diff.summary());
        }
    }

    Ok(true)
}

/// Show built-in docs (no project load needed).
fn cmd_docs(topic: Option<&str>, grep: Option<&str>, format: &str, context: usize) -> Result<bool> {
    if let Some(pattern) = grep {
        print!("{}", docs::grep_docs(pattern, format, context));
    } else if let Some(slug) = topic {
        print!("{}", docs::show_topic(slug, format));
    } else {
        print!("{}", docs::list_topics(format));
    }
    Ok(true)
}

/// Introspect loaded schemas.
fn cmd_schema(cli: &Cli, action: &SchemaAction) -> Result<bool> {
    let schemas_dir = resolve_schemas_dir(cli);
    let config_path = cli.project.join("rivet.yaml");
    let schema_names = if config_path.exists() {
        let config = rivet_core::load_project_config(&config_path)
            .with_context(|| format!("loading {}", config_path.display()))?;
        config.project.schemas
    } else {
        vec!["common".to_string(), "dev".to_string()]
    };
    let schema = rivet_core::load_schemas(&schema_names, &schemas_dir)
        .context("loading schemas")?;

    let output = match action {
        SchemaAction::List { format } => schema_cmd::cmd_list(&schema, format),
        SchemaAction::Show { name, format } => schema_cmd::cmd_show(&schema, name, format),
        SchemaAction::Links { format } => schema_cmd::cmd_links(&schema, format),
        SchemaAction::Rules { format } => schema_cmd::cmd_rules(&schema, format),
    };
    print!("{output}");
    Ok(true)
}

/// Generate .rivet/agent-context.md from project state.
fn cmd_context(cli: &Cli) -> Result<bool> {
    let (store, schema, graph, doc_store) = load_project_with_docs(cli)?;
    let diagnostics = validate::validate(&store, &schema, &graph);

    let rivet_dir = cli.project.join(".rivet");
    std::fs::create_dir_all(&rivet_dir)
        .with_context(|| format!("creating {}", rivet_dir.display()))?;

    let mut out = String::new();
    out.push_str("# Rivet Agent Context\n\n");
    out.push_str("Auto-generated — do not edit.\n\n");

    // Artifact summary
    out.push_str("## Artifacts\n\n");
    let mut types: Vec<&str> = store.types().collect();
    types.sort();
    out.push_str("| Type | Count |\n|------|-------|\n");
    for t in &types {
        out.push_str(&format!("| {} | {} |\n", t, store.count_by_type(t)));
    }
    out.push_str(&format!("| **Total** | **{}** |\n\n", store.len()));

    // Schema types
    out.push_str("## Available Types\n\n");
    let mut stypes: Vec<_> = schema.artifact_types.values().collect();
    stypes.sort_by_key(|t| &t.name);
    for t in &stypes {
        out.push_str(&format!("- `{}` — {}\n", t.name, t.description));
    }

    // Link types
    out.push_str("\n## Link Types\n\n");
    let mut links: Vec<_> = schema.link_types.values().collect();
    links.sort_by_key(|l| &l.name);
    for l in &links {
        let inv = l.inverse.as_deref().unwrap_or("-");
        out.push_str(&format!("- `{}` (inverse: `{}`)\n", l.name, inv));
    }

    // Validation summary
    let errors = diagnostics.iter().filter(|d| d.severity == Severity::Error).count();
    let warnings = diagnostics.iter().filter(|d| d.severity == Severity::Warning).count();
    out.push_str(&format!(
        "\n## Validation\n\n{} errors, {} warnings\n\n",
        errors, warnings
    ));

    // Documents
    if !doc_store.is_empty() {
        out.push_str(&format!("## Documents\n\n{} loaded\n", doc_store.len()));
    }

    let context_path = rivet_dir.join("agent-context.md");
    std::fs::write(&context_path, &out)
        .with_context(|| format!("writing {}", context_path.display()))?;
    println!("Generated {}", context_path.display());
    Ok(true)
}

// ── Helpers ──────────────────────────────────────────────────────────────

fn resolve_schemas_dir(cli: &Cli) -> PathBuf {
    if let Some(dir) = &cli.schemas {
        dir.clone()
    } else {
        // Look for schemas/ relative to the project dir, then relative to the binary
        let project_schemas = cli.project.join("schemas");
        if project_schemas.exists() {
            return project_schemas;
        }

        // Try relative to the binary location
        if let Ok(exe) = std::env::current_exe() {
            if let Some(parent) = exe.parent() {
                let bin_schemas = parent.join("../schemas");
                if bin_schemas.exists() {
                    return bin_schemas;
                }
            }
        }

        // Fallback: look in known locations
        let cwd_schemas = PathBuf::from("schemas");
        if cwd_schemas.exists() {
            return cwd_schemas;
        }

        project_schemas
    }
}

fn load_project(cli: &Cli) -> Result<(Store, rivet_core::schema::Schema, LinkGraph)> {
    let config_path = cli.project.join("rivet.yaml");
    let config = rivet_core::load_project_config(&config_path)
        .with_context(|| format!("loading {}", config_path.display()))?;

    let schemas_dir = resolve_schemas_dir(cli);
    let schema = rivet_core::load_schemas(&config.project.schemas, &schemas_dir)
        .context("loading schemas")?;

    let mut store = Store::new();
    for source in &config.sources {
        let artifacts = rivet_core::load_artifacts(source, &cli.project)
            .with_context(|| format!("loading source '{}'", source.path))?;
        for artifact in artifacts {
            store.upsert(artifact);
        }
    }

    let graph = LinkGraph::build(&store, &schema);
    Ok((store, schema, graph))
}

fn load_project_with_docs(
    cli: &Cli,
) -> Result<(Store, rivet_core::schema::Schema, LinkGraph, DocumentStore)> {
    let config_path = cli.project.join("rivet.yaml");
    let config = rivet_core::load_project_config(&config_path)
        .with_context(|| format!("loading {}", config_path.display()))?;

    let schemas_dir = resolve_schemas_dir(cli);
    let schema = rivet_core::load_schemas(&config.project.schemas, &schemas_dir)
        .context("loading schemas")?;

    let mut store = Store::new();
    for source in &config.sources {
        let artifacts = rivet_core::load_artifacts(source, &cli.project)
            .with_context(|| format!("loading source '{}'", source.path))?;
        for artifact in artifacts {
            store.upsert(artifact);
        }
    }

    let graph = LinkGraph::build(&store, &schema);

    // Load documents from configured directories.
    let mut doc_store = DocumentStore::new();
    for docs_path in &config.docs {
        let dir = cli.project.join(docs_path);
        let docs = document::load_documents(&dir)
            .with_context(|| format!("loading docs from '{docs_path}'"))?;
        for doc in docs {
            doc_store.insert(doc);
        }
    }

    Ok((store, schema, graph, doc_store))
}

#[allow(clippy::type_complexity)]
fn load_project_full(
    cli: &Cli,
) -> Result<(
    Store,
    rivet_core::schema::Schema,
    LinkGraph,
    DocumentStore,
    ResultStore,
    String,
    PathBuf,
    PathBuf,
)> {
    let config_path = cli.project.join("rivet.yaml");
    let config = rivet_core::load_project_config(&config_path)
        .with_context(|| format!("loading {}", config_path.display()))?;

    let schemas_dir = resolve_schemas_dir(cli);
    let schema = rivet_core::load_schemas(&config.project.schemas, &schemas_dir)
        .context("loading schemas")?;

    let mut store = Store::new();
    for source in &config.sources {
        let artifacts = rivet_core::load_artifacts(source, &cli.project)
            .with_context(|| format!("loading source '{}'", source.path))?;
        for artifact in artifacts {
            store.upsert(artifact);
        }
    }

    let graph = LinkGraph::build(&store, &schema);

    // Load documents
    let mut doc_store = DocumentStore::new();
    for docs_path in &config.docs {
        let dir = cli.project.join(docs_path);
        let docs = document::load_documents(&dir)
            .with_context(|| format!("loading docs from '{docs_path}'"))?;
        for doc in docs {
            doc_store.insert(doc);
        }
    }

    // Load test results
    let mut result_store = ResultStore::new();
    if let Some(ref results_path) = config.results {
        let dir = cli.project.join(results_path);
        let runs = results::load_results(&dir)
            .with_context(|| format!("loading results from '{results_path}'"))?;
        for run in runs {
            result_store.insert(run);
        }
    }

    let project_name = config.project.name.clone();
    let project_path = std::fs::canonicalize(&cli.project)
        .unwrap_or_else(|_| cli.project.clone());

    Ok((
        store,
        schema,
        graph,
        doc_store,
        result_store,
        project_name,
        project_path,
        schemas_dir,
    ))
}

fn print_stats(store: &Store) {
    println!("Artifact summary:");
    let mut types: Vec<&str> = store.types().collect();
    types.sort();
    for t in &types {
        println!("  {:30} {:>4}", t, store.count_by_type(t));
    }
    println!("  {:30} {:>4}", "TOTAL", store.len());
}

/// Parse a key=value pair for adapter configuration.
#[cfg(feature = "wasm")]
fn parse_key_val(s: &str) -> Result<(String, String), String> {
    let pos = s
        .find('=')
        .ok_or_else(|| format!("invalid KEY=VALUE: no '=' found in '{s}'"))?;
    Ok((s[..pos].to_string(), s[pos + 1..].to_string()))
}

/// Import artifacts using a WASM adapter component.
#[cfg(feature = "wasm")]
fn cmd_import(
    adapter_path: &std::path::Path,
    source_path: &std::path::Path,
    config_entries: &[(String, String)],
) -> Result<bool> {
    use rivet_core::adapter::{Adapter, AdapterConfig, AdapterSource};
    use rivet_core::wasm_runtime::WasmAdapterRuntime;
    use std::collections::BTreeMap;

    println!("Loading WASM adapter: {}", adapter_path.display());

    let runtime = WasmAdapterRuntime::with_defaults().context("failed to create WASM runtime")?;

    let adapter = runtime
        .load_adapter(adapter_path)
        .context("failed to load WASM adapter")?;

    println!("  Adapter ID:   {}", adapter.id());
    println!("  Adapter name: {}", adapter.name());

    let source = if source_path.is_dir() {
        AdapterSource::Directory(source_path.to_path_buf())
    } else {
        AdapterSource::Path(source_path.to_path_buf())
    };

    let config = AdapterConfig {
        entries: config_entries
            .iter()
            .cloned()
            .collect::<BTreeMap<String, String>>(),
    };

    let artifacts = adapter
        .import(&source, &config)
        .context("adapter import failed")?;

    println!("\nImported {} artifacts:", artifacts.len());
    for artifact in &artifacts {
        println!(
            "  {:20} {:25} {}",
            artifact.id, artifact.artifact_type, artifact.title
        );
    }

    Ok(true)
}

fn print_diagnostics(diagnostics: &[validate::Diagnostic]) {
    if diagnostics.is_empty() {
        println!("\nNo issues found.");
        return;
    }

    println!("\nDiagnostics:");
    let mut errors = Vec::new();
    let mut warnings = Vec::new();
    let mut infos = Vec::new();

    for d in diagnostics {
        match d.severity {
            Severity::Error => errors.push(d),
            Severity::Warning => warnings.push(d),
            Severity::Info => infos.push(d),
        }
    }

    for d in &errors {
        println!("{d}");
    }
    for d in &warnings {
        println!("{d}");
    }
    for d in &infos {
        println!("{d}");
    }
}
