use std::path::PathBuf;
use std::process::ExitCode;

use anyhow::{Context, Result};
use clap::{Parser, Subcommand};

use rivet_core::links::LinkGraph;
use rivet_core::matrix::{self, Direction};
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

    /// Start the HTMX-powered dashboard server
    Serve {
        /// Port to listen on
        #[arg(short = 'P', long, default_value = "3000")]
        port: u16,
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
    match &cli.command {
        Command::Stpa { path, schema } => cmd_stpa(path, schema.as_deref(), &cli),
        Command::Validate => cmd_validate(&cli),
        Command::List { r#type, status } => cmd_list(&cli, r#type.as_deref(), status.as_deref()),
        Command::Stats => cmd_stats(&cli),
        Command::Matrix {
            from,
            to,
            link,
            direction,
        } => cmd_matrix(&cli, from, to, link.as_deref(), direction),
        Command::Serve { port } => {
            let port = *port;
            let (store, schema, graph) = load_project(&cli)?;
            let rt = tokio::runtime::Runtime::new().context("failed to create tokio runtime")?;
            rt.block_on(serve::run(store, schema, graph, port))?;
            Ok(true)
        }
    }
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
    let (store, schema, graph) = load_project(cli)?;
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

fn print_stats(store: &Store) {
    println!("Artifact summary:");
    let mut types: Vec<&str> = store.types().collect();
    types.sort();
    for t in &types {
        println!("  {:30} {:>4}", t, store.count_by_type(t));
    }
    println!("  {:30} {:>4}", "TOTAL", store.len());
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
