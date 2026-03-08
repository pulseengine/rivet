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

        /// Schemas to include (e.g. common,dev or common,aspice)
        #[arg(long, value_delimiter = ',', default_values_t = ["common".to_string(), "dev".to_string()])]
        schema: Vec<String>,

        /// Directory to initialize (defaults to current directory)
        #[arg(long, default_value = ".")]
        dir: PathBuf,
    },

    /// Validate artifacts against schemas
    Validate,

    /// List artifacts, optionally filtered by type
    List {
        /// Filter by artifact type
        #[arg(short = 't', long)]
        r#type: Option<String>,

        /// Filter by status
        #[arg(short, long)]
        status: Option<String>,
    },

    /// Show artifact summary statistics
    Stats,

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
    // Init does not need a loaded project; handle it first.
    if let Command::Init { name, schema, dir } = &cli.command {
        return cmd_init(name.as_deref(), schema, dir);
    }

    match &cli.command {
        Command::Init { .. } => unreachable!(),
        Command::Stpa { path, schema } => cmd_stpa(path, schema.as_deref(), &cli),
        Command::Validate => cmd_validate(&cli),
        Command::List { r#type, status } => cmd_list(&cli, r#type.as_deref(), status.as_deref()),
        Command::Stats => cmd_stats(&cli),
        Command::Coverage { format, fail_under } => cmd_coverage(&cli, format, fail_under.as_ref()),
        Command::Matrix {
            from,
            to,
            link,
            direction,
        } => cmd_matrix(&cli, from, to, link.as_deref(), direction),
        Command::Diff { base, head } => cmd_diff(&cli, base.as_deref(), head.as_deref()),
        Command::Export { format, output } => cmd_export(&cli, format, output.as_deref()),
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
fn cmd_init(name: Option<&str>, schemas: &[String], dir: &std::path::Path) -> Result<bool> {
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

    // Build schema list for the config
    let schema_entries: String = schemas
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
fn cmd_validate(cli: &Cli) -> Result<bool> {
    let (store, schema, graph, doc_store) = load_project_with_docs(cli)?;
    let mut diagnostics = validate::validate(&store, &schema, &graph);
    diagnostics.extend(validate::validate_documents(&doc_store, &store));

    if !doc_store.is_empty() {
        println!(
            "Loaded {} documents with {} artifact references",
            doc_store.len(),
            doc_store.all_references().len()
        );
    }

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
    } else {
        println!("Result: PASS ({} warnings)", warnings);
        Ok(true)
    }
}

/// List artifacts.
fn cmd_list(cli: &Cli, type_filter: Option<&str>, status_filter: Option<&str>) -> Result<bool> {
    let (store, _, _) = load_project(cli)?;

    let query = rivet_core::query::Query {
        artifact_type: type_filter.map(|s| s.to_string()),
        status: status_filter.map(|s| s.to_string()),
        ..Default::default()
    };

    let results = rivet_core::query::execute(&store, &query);

    for artifact in &results {
        let status = artifact.status.as_deref().unwrap_or("-");
        let links = artifact.links.len();
        println!(
            "  {:20} {:25} {:12} {:3} links  {}",
            artifact.id, artifact.artifact_type, status, links, artifact.title
        );
    }
    println!("\n{} artifacts", results.len());

    Ok(true)
}

/// Print summary statistics.
fn cmd_stats(cli: &Cli) -> Result<bool> {
    let (store, _, graph) = load_project(cli)?;
    print_stats(&store);

    let orphans = graph.orphans(&store);
    if !orphans.is_empty() {
        println!("\nOrphan artifacts (no links): {}", orphans.len());
        for id in &orphans {
            println!("  {}", id);
        }
    }

    if !graph.broken.is_empty() {
        println!("\nBroken links: {}", graph.broken.len());
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
                    command: Command::Validate,
                };
                let head_cli = Cli {
                    project: hp.to_path_buf(),
                    schemas: cli.schemas.clone(),
                    verbose: cli.verbose,
                    command: Command::Validate,
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
