use std::collections::HashSet;
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

fn build_version() -> &'static str {
    use std::sync::LazyLock;
    static VERSION: LazyLock<String> = LazyLock::new(|| {
        let version = env!("CARGO_PKG_VERSION");
        let commit = env!("RIVET_GIT_COMMIT");
        let branch = env!("RIVET_GIT_BRANCH");
        let dirty: bool = env!("RIVET_GIT_DIRTY").parse().unwrap_or(false);
        let staged: u32 = env!("RIVET_GIT_STAGED").parse().unwrap_or(0);
        let modified: u32 = env!("RIVET_GIT_MODIFIED").parse().unwrap_or(0);
        let untracked: u32 = env!("RIVET_GIT_UNTRACKED").parse().unwrap_or(0);
        let date = env!("RIVET_BUILD_DATE");

        let mut s = format!("{version} ({commit} {branch} {date})");
        if dirty {
            let mut parts = Vec::new();
            if staged > 0 {
                parts.push(format!("{staged} staged"));
            }
            if modified > 0 {
                parts.push(format!("{modified} modified"));
            }
            if untracked > 0 {
                parts.push(format!("{untracked} untracked"));
            }
            if parts.is_empty() {
                s.push_str(" [dirty]");
            } else {
                s.push_str(&format!(" [{}]", parts.join(", ")));
            }
        }
        s
    });
    &VERSION
}

#[derive(Parser)]
#[command(name = "rivet", about = "SDLC artifact traceability and validation", version = build_version())]
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
        /// Output format: "reqif", "generic-yaml", "html"
        #[arg(short, long)]
        format: String,

        /// Output path: file for reqif/generic-yaml, directory for html (default: "dist")
        #[arg(short, long)]
        output: Option<PathBuf>,

        /// Single-page mode: combine all HTML reports into one file (html format only)
        #[arg(long)]
        single_page: bool,
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

    /// Validate a commit message for artifact trailers (pre-commit hook)
    CommitMsgCheck {
        /// Path to the commit message file
        file: PathBuf,
    },

    /// Analyze git commit history for artifact traceability
    Commits {
        /// Only analyze commits after this date (YYYY-MM-DD)
        #[arg(long)]
        since: Option<String>,
        /// Git revision range (e.g., "main..HEAD")
        #[arg(long)]
        range: Option<String>,
        /// Output format: "text" (default) or "json"
        #[arg(short, long, default_value = "text")]
        format: String,
        /// Promote warnings to errors
        #[arg(long)]
        strict: bool,
    },

    /// Start the HTMX-powered dashboard server
    Serve {
        /// Port to listen on
        #[arg(short = 'P', long, default_value = "3000")]
        port: u16,
    },

    /// Sync external project dependencies into .rivet/repos/
    Sync,

    /// Pin external dependencies to exact commits in rivet.lock
    Lock {
        /// Update all pins to latest refs
        #[arg(long)]
        update: bool,
    },

    /// Manage distributed baselines across repos
    Baseline {
        #[command(subcommand)]
        action: BaselineAction,
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

#[derive(Debug, Subcommand)]
enum BaselineAction {
    /// Verify baseline consistency across all externals
    Verify {
        /// Baseline name (e.g., "v1.0")
        name: String,
        /// Fail on missing baseline tags (default: warn only)
        #[arg(long)]
        strict: bool,
    },
    /// List baselines found across externals
    List,
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
    if let Command::Init {
        name,
        preset,
        schema,
        dir,
    } = &cli.command
    {
        return cmd_init(name.as_deref(), preset, schema, dir);
    }
    if let Command::Docs {
        topic,
        grep,
        format,
        context,
    } = &cli.command
    {
        return cmd_docs(topic.as_deref(), grep.as_deref(), format, *context);
    }
    if let Command::Context = &cli.command {
        return cmd_context(&cli);
    }
    if let Command::CommitMsgCheck { file } = &cli.command {
        return cmd_commit_msg_check(&cli, file);
    }

    match &cli.command {
        Command::Init { .. }
        | Command::Docs { .. }
        | Command::Context
        | Command::CommitMsgCheck { .. } => unreachable!(),
        Command::Stpa { path, schema } => cmd_stpa(path, schema.as_deref(), &cli),
        Command::Validate { format } => cmd_validate(&cli, format),
        Command::List {
            r#type,
            status,
            format,
        } => cmd_list(&cli, r#type.as_deref(), status.as_deref(), format),
        Command::Stats { format } => cmd_stats(&cli, format),
        Command::Coverage { format, fail_under } => cmd_coverage(&cli, format, fail_under.as_ref()),
        Command::Matrix {
            from,
            to,
            link,
            direction,
            format,
        } => cmd_matrix(&cli, from, to, link.as_deref(), direction, format),
        Command::Diff { base, head, format } => {
            cmd_diff(&cli, base.as_deref(), head.as_deref(), format)
        }
        Command::Export {
            format,
            output,
            single_page,
        } => cmd_export(&cli, format, output.as_deref(), *single_page),
        Command::Schema { action } => cmd_schema(&cli, action),
        Command::Commits {
            since,
            range,
            format,
            strict,
        } => cmd_commits(&cli, since.as_deref(), range.as_deref(), format, *strict),
        Command::Serve { port } => {
            let port = *port;
            let (
                store,
                schema,
                graph,
                doc_store,
                result_store,
                project_name,
                project_path,
                schemas_dir,
                doc_dirs,
            ) = load_project_full(&cli)?;
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
                doc_dirs,
                port,
            ))?;
            Ok(true)
        }
        Command::Sync => cmd_sync(&cli),
        Command::Lock { update } => cmd_lock(&cli, *update),
        Command::Baseline { action } => match action {
            BaselineAction::Verify { name, strict } => cmd_baseline_verify(&cli, name, *strict),
            BaselineAction::List => cmd_baseline_list(&cli),
        },
        #[cfg(feature = "wasm")]
        Command::Import {
            adapter,
            source,
            config_entries,
        } => cmd_import(adapter, source, config_entries),
    }
}

/// Preset configuration for `rivet init`.
struct InitPreset {
    schemas: Vec<&'static str>,
    /// Each entry: (filename, yaml_content)
    sample_files: Vec<(&'static str, &'static str)>,
}

fn resolve_preset(preset: &str) -> Result<InitPreset> {
    match preset {
        "dev" => Ok(InitPreset {
            schemas: vec!["common", "dev"],
            sample_files: vec![("requirements.yaml", DEV_SAMPLE)],
        }),
        "aspice" => Ok(InitPreset {
            schemas: vec!["common", "aspice"],
            sample_files: vec![("requirements.yaml", ASPICE_SAMPLE)],
        }),
        "stpa" => Ok(InitPreset {
            schemas: vec!["common", "stpa"],
            sample_files: vec![("safety.yaml", STPA_SAMPLE)],
        }),
        "cybersecurity" => Ok(InitPreset {
            schemas: vec!["common", "cybersecurity"],
            sample_files: vec![("security.yaml", CYBERSECURITY_SAMPLE)],
        }),
        "aadl" => Ok(InitPreset {
            schemas: vec!["common", "dev", "aadl"],
            sample_files: vec![("architecture.yaml", AADL_SAMPLE)],
        }),
        other => anyhow::bail!(
            "unknown preset: '{other}' (valid: dev, aspice, stpa, cybersecurity, aadl)"
        ),
    }
}

const DEV_SAMPLE: &str = "\
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

  - id: FEAT-001
    type: feature
    title: Initial feature
    status: draft
    description: >
      A user-visible capability delivered by the project.
    fields:
      phase: phase-1
    links:
      - type: satisfies
        target: REQ-001
";

const ASPICE_SAMPLE: &str = "\
artifacts:
  - id: SYSREQ-001
    type: system-req
    title: System shall provide data logging
    status: draft
    description: >
      The system shall log all sensor data at 100Hz to non-volatile storage.
    fields:
      req-type: functional
      priority: must
      verification-criteria: >
        Verify that sensor data is recorded at 100Hz under nominal load.

  - id: SWREQ-001
    type: sw-req
    title: Logging service shall buffer sensor frames
    status: draft
    description: >
      The logging service shall maintain a ring buffer of at least 1000
      sensor frames to absorb transient write latency.
    fields:
      req-type: functional
      priority: must
    links:
      - type: derives-from
        target: SYSREQ-001

  - id: SWARCH-001
    type: sw-arch-component
    title: SensorLogger component
    status: draft
    description: >
      Software component responsible for buffering and persisting sensor
      data frames.
    links:
      - type: allocated-from
        target: SWREQ-001
";

const STPA_SAMPLE: &str = "\
artifacts:
  - id: L-001
    type: loss
    title: Loss of vehicle control
    status: draft
    description: >
      Driver loses ability to control vehicle trajectory, potentially
      resulting in collision or road departure.
    fields:
      stakeholders: [driver, passengers, other-road-users]

  - id: H-001
    type: hazard
    title: Unintended acceleration while stationary
    status: draft
    description: >
      Vehicle accelerates without driver command while the vehicle is
      stationary, together with traffic conditions, leading to L-001.
    fields:
      severity: catastrophic
    links:
      - type: leads-to-loss
        target: L-001

  - id: UCA-001
    type: uca
    title: Throttle controller provides torque request when vehicle is stationary and driver has not pressed accelerator
    status: draft
    description: >
      Providing a torque request while stationary and no pedal input
      causes unintended acceleration (H-001).
    fields:
      uca-type: providing
      context: >
        Vehicle is stationary, brake applied, accelerator pedal not pressed.
    links:
      - type: issued-by
        target: CTRL-001
      - type: leads-to-hazard
        target: H-001

  - id: CTRL-001
    type: controller
    title: Throttle controller
    status: draft
    description: >
      ECU responsible for computing torque requests from pedal position
      and engine state.
    fields:
      controller-type: automated
";

const CYBERSECURITY_SAMPLE: &str = "\
artifacts:
  - id: TS-001
    type: threat-scenario
    title: Spoofed CAN messages inject false sensor readings
    status: draft
    description: >
      An attacker with physical access to the OBD-II port sends
      crafted CAN frames that spoof wheel-speed sensor values.
    fields:
      attack-vector: physical
      attack-feasibility: medium
      impact: severe
    links:
      - type: threatens
        target: ASSET-001

  - id: ASSET-001
    type: asset
    title: Wheel-speed sensor data
    status: draft
    description: >
      CAN bus messages carrying wheel-speed sensor readings used
      by ABS and ESC controllers.
    fields:
      asset-type: data
      cybersecurity-properties: [integrity, availability]

  - id: SECGOAL-001
    type: cybersecurity-goal
    title: Ensure integrity of wheel-speed data on CAN bus
    status: draft
    description: >
      Wheel-speed sensor messages shall be authenticated to prevent
      injection of spoofed values.
    fields:
      cal: \"3\"
    links:
      - type: mitigates
        target: TS-001
";

const AADL_SAMPLE: &str = "\
artifacts:
  - id: REQ-001
    type: requirement
    title: Sensor data acquisition
    status: draft
    description: >
      The system shall acquire sensor data at a minimum rate of 100Hz.
    fields:
      priority: must
      category: functional

  - id: AADL-001
    type: aadl-component
    title: sensor_acquisition.impl
    status: draft
    description: >
      AADL process implementation for sensor data acquisition,
      containing periodic threads for each sensor channel.
    fields:
      category: process
      aadl-package: sensor_subsystem
      classifier-kind: implementation
    links:
      - type: allocated-from
        target: REQ-001
";

/// Initialize a new rivet project.
fn cmd_init(
    name: Option<&str>,
    preset: &str,
    schema_override: &[String],
    dir: &std::path::Path,
) -> Result<bool> {
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

    // Resolve preset (before I/O so invalid preset fails early)
    let init_preset = resolve_preset(preset)?;

    // Ensure the target directory exists
    std::fs::create_dir_all(&dir)
        .with_context(|| format!("creating directory {}", dir.display()))?;

    // Use --schema override if provided, otherwise use preset defaults
    let schemas: Vec<String> = if schema_override.is_empty() {
        init_preset.schemas.iter().map(|s| s.to_string()).collect()
    } else {
        schema_override.to_vec()
    };

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

    // Create artifacts/ directory with preset-specific sample files
    let artifacts_dir = dir.join("artifacts");
    std::fs::create_dir_all(&artifacts_dir)
        .with_context(|| format!("creating {}", artifacts_dir.display()))?;

    for (filename, content) in &init_preset.sample_files {
        let path = artifacts_dir.join(filename);
        std::fs::write(&path, content).with_context(|| format!("writing {}", path.display()))?;
        println!("  created {}", path.display());
    }

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
        "\nInitialized rivet project '{}' in {} (preset: {preset})",
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

    // Cross-repo link validation
    let config_path = cli.project.join("rivet.yaml");
    let config = rivet_core::load_project_config(&config_path)
        .with_context(|| format!("loading {}", config_path.display()))?;

    let mut cross_repo_broken: Vec<rivet_core::externals::BrokenRef> = Vec::new();
    let mut backlinks: Vec<rivet_core::externals::CrossRepoBacklink> = Vec::new();
    let mut circular_deps: Vec<rivet_core::externals::CircularDependency> = Vec::new();
    let mut version_conflicts: Vec<rivet_core::externals::VersionConflict> = Vec::new();
    if let Some(ref externals) = config.externals {
        if !externals.is_empty() {
            match rivet_core::externals::load_all_externals(externals, &cli.project) {
                Ok(resolved) => {
                    // Build external ID sets
                    let mut external_ids: std::collections::BTreeMap<
                        String,
                        std::collections::HashSet<String>,
                    > = std::collections::BTreeMap::new();
                    for ext in &resolved {
                        let ids: std::collections::HashSet<String> =
                            ext.artifacts.iter().map(|a| a.id.clone()).collect();
                        external_ids.insert(ext.prefix.clone(), ids);
                    }

                    // Collect local IDs and all link targets
                    let local_ids: std::collections::HashSet<String> =
                        store.iter().map(|a| a.id.clone()).collect();
                    let all_refs: Vec<&str> = store
                        .iter()
                        .flat_map(|a| a.links.iter().map(|l| l.target.as_str()))
                        .collect();

                    cross_repo_broken =
                        rivet_core::externals::validate_refs(&all_refs, &local_ids, &external_ids);

                    // Compute backlinks from external artifacts pointing to local artifacts
                    backlinks = rivet_core::externals::compute_backlinks(&resolved, &local_ids);
                }
                Err(e) => {
                    eprintln!("  warning: could not load externals for cross-repo validation: {e}");
                }
            }

            // Detect circular dependencies in the externals graph
            circular_deps = rivet_core::externals::detect_circular_deps(
                externals,
                &config.project.name,
                &cli.project,
            );

            // Detect version conflicts (same repo at different refs)
            version_conflicts = rivet_core::externals::detect_version_conflicts(
                externals,
                &config.project.name,
                &cli.project,
            );
        }
    }

    // Lifecycle completeness check
    let all_artifacts: Vec<_> = store.iter().cloned().collect();
    let lifecycle_gaps = rivet_core::lifecycle::check_lifecycle_completeness(&all_artifacts);

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
    let cross_errors = cross_repo_broken.len();

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
        let cross_json: Vec<serde_json::Value> = cross_repo_broken
            .iter()
            .map(|b| {
                serde_json::json!({
                    "reference": b.reference,
                    "reason": format!("{:?}", b.reason),
                })
            })
            .collect();
        let backlinks_json: Vec<serde_json::Value> = backlinks
            .iter()
            .map(|bl| {
                serde_json::json!({
                    "source_prefix": bl.source_prefix,
                    "source_id": bl.source_id,
                    "target": bl.target,
                })
            })
            .collect();
        let cycles_json: Vec<serde_json::Value> = circular_deps
            .iter()
            .map(|c| {
                serde_json::json!({
                    "chain": c.chain,
                })
            })
            .collect();
        let conflicts_json: Vec<serde_json::Value> = version_conflicts
            .iter()
            .map(|c| {
                serde_json::json!({
                    "repo_identifier": c.repo_identifier,
                    "versions": c.versions.iter().map(|v| {
                        serde_json::json!({
                            "declared_by": v.declared_by,
                            "version": v.version,
                        })
                    }).collect::<Vec<_>>(),
                })
            })
            .collect();
        let lifecycle_json: Vec<serde_json::Value> = lifecycle_gaps
            .iter()
            .map(|g| {
                serde_json::json!({
                    "artifact_id": g.artifact_id,
                    "artifact_type": g.artifact_type,
                    "status": g.artifact_status,
                    "missing": g.missing,
                })
            })
            .collect();
        let output = serde_json::json!({
            "command": "validate",
            "errors": errors,
            "warnings": warnings,
            "infos": infos,
            "cross_repo_broken": cross_errors,
            "backlinks": backlinks.len(),
            "circular_deps": circular_deps.len(),
            "version_conflicts": version_conflicts.len(),
            "lifecycle_gaps": lifecycle_gaps.len(),
            "diagnostics": diag_json,
            "broken_cross_refs": cross_json,
            "cross_repo_backlinks": backlinks_json,
            "circular_dependencies": cycles_json,
            "version_conflict_details": conflicts_json,
            "lifecycle_coverage": lifecycle_json,
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

        if !cross_repo_broken.is_empty() {
            println!();
            println!("Cross-repo link issues:");
            for b in &cross_repo_broken {
                eprintln!("  broken cross-ref: {} — {:?}", b.reference, b.reason);
            }
        }

        if !backlinks.is_empty() {
            println!();
            println!(
                "Cross-repo backlinks: {} (external artifacts linking to local)",
                backlinks.len()
            );
            for bl in &backlinks {
                println!("  {}:{} -> {}", bl.source_prefix, bl.source_id, bl.target);
            }
        }

        if !circular_deps.is_empty() {
            println!();
            println!(
                "warning: {} circular dependency chain(s) detected in externals graph:",
                circular_deps.len()
            );
            for cycle in &circular_deps {
                println!("  {}", cycle.chain.join(" -> "));
            }
        }

        if !version_conflicts.is_empty() {
            println!();
            println!(
                "warning: {} version conflict(s) detected in externals:",
                version_conflicts.len()
            );
            for c in &version_conflicts {
                eprintln!("  {} referenced at different versions:", c.repo_identifier);
                for entry in &c.versions {
                    eprintln!("    {} declares ref: {}", entry.declared_by, entry.version);
                }
            }
        }

        if !lifecycle_gaps.is_empty() {
            println!();
            println!("Lifecycle coverage gaps ({}):", lifecycle_gaps.len());
            for gap in &lifecycle_gaps {
                eprintln!(
                    "  {} ({}, status: {}) — missing: {}",
                    gap.artifact_id,
                    gap.artifact_type,
                    gap.artifact_status.as_deref().unwrap_or("none"),
                    gap.missing.join(", "),
                );
            }
        }

        println!();
        let total_errors = errors + cross_errors;
        if total_errors > 0 {
            println!(
                "Result: FAIL ({} errors, {} warnings, {} broken cross-refs)",
                errors, warnings, cross_errors
            );
        } else {
            println!("Result: PASS ({} warnings)", warnings);
        }
    }

    Ok(errors == 0 && cross_errors == 0)
}

/// List artifacts.
fn cmd_list(
    cli: &Cli,
    type_filter: Option<&str>,
    status_filter: Option<&str>,
    format: &str,
) -> Result<bool> {
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
fn cmd_export(
    cli: &Cli,
    format: &str,
    output: Option<&std::path::Path>,
    single_page: bool,
) -> Result<bool> {
    if format == "html" {
        return cmd_export_html(cli, output, single_page);
    }

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
            anyhow::bail!(
                "unsupported export format: {other} (supported: reqif, generic-yaml, html)"
            )
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

/// Export to a static HTML site (5 pages or single-page).
fn cmd_export_html(cli: &Cli, output: Option<&std::path::Path>, single_page: bool) -> Result<bool> {
    use rivet_core::export;

    let (store, schema, graph) = load_project(cli)?;
    let diagnostics = validate::validate(&store, &schema, &graph);

    // Load project name
    let config_path = cli.project.join("rivet.yaml");
    let config = rivet_core::load_project_config(&config_path)
        .with_context(|| format!("loading {}", config_path.display()))?;
    let project_name = &config.project.name;
    let version = env!("CARGO_PKG_VERSION");

    let out_dir = output.unwrap_or(std::path::Path::new("dist"));

    if single_page {
        let html = export::render_single_page(
            &store,
            &schema,
            &graph,
            &diagnostics,
            project_name,
            version,
        );
        std::fs::create_dir_all(out_dir)
            .with_context(|| format!("creating {}", out_dir.display()))?;
        let path = out_dir.join("index.html");
        std::fs::write(&path, &html).with_context(|| format!("writing {}", path.display()))?;
        println!("Exported single-page report to {}", out_dir.display());
    } else {
        std::fs::create_dir_all(out_dir)
            .with_context(|| format!("creating {}", out_dir.display()))?;

        let pages: Vec<(&str, String)> = vec![
            (
                "index.html",
                export::render_index(&store, &schema, &graph, &diagnostics, project_name, version),
            ),
            (
                "requirements.html",
                export::render_requirements(&store, &schema, &graph),
            ),
            (
                "matrix.html",
                export::render_traceability_matrix(&store, &schema, &graph),
            ),
            (
                "coverage.html",
                export::render_coverage(&store, &schema, &graph),
            ),
            ("validation.html", export::render_validation(&diagnostics)),
        ];

        for (filename, html) in &pages {
            let path = out_dir.join(filename);
            std::fs::write(&path, html).with_context(|| format!("writing {}", path.display()))?;
        }

        println!("Exported {} pages to {}/", pages.len(), out_dir.display());
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
                    command: Command::Validate {
                        format: "text".to_string(),
                    },
                };
                let head_cli = Cli {
                    project: hp.to_path_buf(),
                    schemas: cli.schemas.clone(),
                    verbose: cli.verbose,
                    command: Command::Validate {
                        format: "text".to_string(),
                    },
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
                    changes.push(format!(
                        "link removed: {} -> {}",
                        link.link_type, link.target
                    ));
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
    let schema =
        rivet_core::load_schemas(&schema_names, &schemas_dir).context("loading schemas")?;

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
    let config_path = cli.project.join("rivet.yaml");
    let config = rivet_core::load_project_config(&config_path)
        .with_context(|| format!("loading {}", config_path.display()))?;

    let (store, schema, graph, doc_store) = load_project_with_docs(cli)?;
    let diagnostics = validate::validate(&store, &schema, &graph);
    let coverage_report = coverage::compute_coverage(&store, &schema, &graph);

    let rivet_dir = cli.project.join(".rivet");
    std::fs::create_dir_all(&rivet_dir)
        .with_context(|| format!("creating {}", rivet_dir.display()))?;

    let mut out = String::new();
    out.push_str("# Rivet Agent Context\n\n");
    out.push_str("Auto-generated by `rivet context` — do not edit.\n\n");

    // ── 1. Project configuration ────────────────────────────────────────
    out.push_str("## Project\n\n");
    out.push_str(&format!("- **Name:** {}\n", config.project.name));
    if let Some(ref v) = config.project.version {
        out.push_str(&format!("- **Version:** {v}\n"));
    }
    out.push_str(&format!(
        "- **Schemas:** {}\n",
        config.project.schemas.join(", ")
    ));
    out.push_str(&format!(
        "- **Sources:** {}\n",
        config
            .sources
            .iter()
            .map(|s| format!("{} ({})", s.path, s.format))
            .collect::<Vec<_>>()
            .join(", ")
    ));
    if !config.docs.is_empty() {
        out.push_str(&format!("- **Docs:** {}\n", config.docs.join(", ")));
    }
    if let Some(ref r) = config.results {
        out.push_str(&format!("- **Results:** {r}\n"));
    }
    out.push('\n');

    // ── 2. Artifact summary with example IDs ────────────────────────────
    out.push_str("## Artifacts\n\n");
    let mut types: Vec<&str> = store.types().collect();
    types.sort();
    out.push_str("| Type | Count | Example IDs |\n|------|-------|-------------|\n");
    for t in &types {
        let ids = store.by_type(t);
        let examples: Vec<&str> = ids.iter().take(3).map(|id| id.as_str()).collect();
        out.push_str(&format!(
            "| {} | {} | {} |\n",
            t,
            store.count_by_type(t),
            examples.join(", ")
        ));
    }
    out.push_str(&format!("| **Total** | **{}** | |\n\n", store.len()));

    // ── 3. Schema summary (types + required fields) ─────────────────────
    out.push_str("## Schema\n\n");
    let mut stypes: Vec<_> = schema.artifact_types.values().collect();
    stypes.sort_by_key(|t| &t.name);
    for t in &stypes {
        let required: Vec<&str> = t
            .fields
            .iter()
            .filter(|f| f.required)
            .map(|f| f.name.as_str())
            .collect();
        let req_str = if required.is_empty() {
            String::from("(none)")
        } else {
            required.join(", ")
        };
        out.push_str(&format!(
            "- **`{}`** — {}  \n  Required fields: {}\n",
            t.name, t.description, req_str
        ));
    }

    // Link types
    out.push_str("\n### Link Types\n\n");
    let mut links: Vec<_> = schema.link_types.values().collect();
    links.sort_by_key(|l| &l.name);
    for l in &links {
        let inv = l.inverse.as_deref().unwrap_or("-");
        out.push_str(&format!("- `{}` (inverse: `{}`)\n", l.name, inv));
    }
    out.push('\n');

    // ── 4. Traceability rules ───────────────────────────────────────────
    out.push_str("## Traceability Rules\n\n");
    if schema.traceability_rules.is_empty() {
        out.push_str("No traceability rules defined.\n\n");
    } else {
        out.push_str("| Rule | Source Type | Severity | Description |\n");
        out.push_str("|------|------------|----------|-------------|\n");
        for rule in &schema.traceability_rules {
            let sev = match rule.severity {
                Severity::Error => "error",
                Severity::Warning => "warning",
                Severity::Info => "info",
            };
            out.push_str(&format!(
                "| {} | {} | {} | {} |\n",
                rule.name, rule.source_type, sev, rule.description
            ));
        }
        out.push('\n');
    }

    // ── 5. Coverage summary ─────────────────────────────────────────────
    out.push_str("## Coverage\n\n");
    out.push_str(&format!(
        "**Overall: {:.1}%**\n\n",
        coverage_report.overall_coverage()
    ));
    if !coverage_report.entries.is_empty() {
        out.push_str("| Rule | Source Type | Covered | Total | % |\n");
        out.push_str("|------|------------|---------|-------|---|\n");
        for entry in &coverage_report.entries {
            out.push_str(&format!(
                "| {} | {} | {} | {} | {:.1}% |\n",
                entry.rule_name,
                entry.source_type,
                entry.covered,
                entry.total,
                entry.percentage()
            ));
        }
        out.push('\n');
    }

    // ── 6. Validation summary ───────────────────────────────────────────
    let errors = diagnostics
        .iter()
        .filter(|d| d.severity == Severity::Error)
        .count();
    let warnings = diagnostics
        .iter()
        .filter(|d| d.severity == Severity::Warning)
        .count();
    out.push_str(&format!(
        "## Validation\n\n{} errors, {} warnings\n\n",
        errors, warnings
    ));

    // Documents
    if !doc_store.is_empty() {
        out.push_str(&format!(
            "## Documents\n\n{} documents loaded\n\n",
            doc_store.len()
        ));
    }

    // ── 7. Quick command reference ──────────────────────────────────────
    out.push_str("## Commands\n\n");
    out.push_str("```bash\n");
    out.push_str("rivet validate              # validate all artifacts\n");
    out.push_str("rivet list                  # list all artifacts\n");
    out.push_str("rivet list -t <type>        # filter by type\n");
    out.push_str("rivet stats                 # artifact counts + orphans\n");
    out.push_str("rivet coverage              # traceability coverage report\n");
    out.push_str("rivet matrix --from X --to Y  # traceability matrix\n");
    out.push_str("rivet diff --base A --head B  # compare artifact sets\n");
    out.push_str("rivet schema list           # list schema types\n");
    out.push_str("rivet schema show <type>    # show type details\n");
    out.push_str("rivet schema rules          # list traceability rules\n");
    out.push_str("rivet export -f generic-yaml  # export as YAML\n");
    out.push_str("rivet serve                 # start dashboard on :3000\n");
    out.push_str("rivet context               # regenerate this file\n");
    out.push_str("```\n");

    let context_path = rivet_dir.join("agent-context.md");
    std::fs::write(&context_path, &out)
        .with_context(|| format!("writing {}", context_path.display()))?;
    println!("Generated {}", context_path.display());
    Ok(true)
}

// ── commit-msg-check ─────────────────────────────────────────────────────

fn cmd_commit_msg_check(cli: &Cli, file: &std::path::Path) -> Result<bool> {
    use std::collections::BTreeMap;

    // Read commit message file
    let raw = std::fs::read_to_string(file)
        .with_context(|| format!("reading commit message file '{}'", file.display()))?;

    // Strip comment lines (lines starting with #)
    let message: String = raw
        .lines()
        .filter(|line| !line.starts_with('#'))
        .collect::<Vec<_>>()
        .join("\n");
    let message = message.trim();

    if message.is_empty() {
        // Empty commit message — let git itself handle that
        return Ok(true);
    }

    // Try to load rivet.yaml for commits config
    let config_path = cli.project.join("rivet.yaml");
    let config = match rivet_core::load_project_config(&config_path) {
        Ok(c) => c,
        Err(_) => {
            // No rivet.yaml or invalid — pass silently
            log::debug!("no rivet.yaml found, skipping commit-msg check");
            return Ok(true);
        }
    };

    let commits_cfg = match &config.commits {
        Some(c) => c,
        None => {
            // No commits config — pass silently
            log::debug!("no commits config in rivet.yaml, skipping commit-msg check");
            return Ok(true);
        }
    };

    // Extract subject (first line)
    let subject = message.lines().next().unwrap_or("");

    // Check exempt type
    if let Some(ct) = rivet_core::commits::parse_commit_type(subject) {
        if commits_cfg.exempt_types.iter().any(|et| et == &ct) {
            log::debug!("commit type '{ct}' is exempt");
            return Ok(true);
        }
    }

    // Check skip trailer
    if message
        .lines()
        .any(|line| line.trim() == commits_cfg.skip_trailer)
    {
        log::debug!("skip trailer found");
        return Ok(true);
    }

    // Parse artifact trailers
    let trailer_map: &BTreeMap<String, String> = &commits_cfg.trailers;
    let (artifact_refs, _) =
        rivet_core::commits::parse_commit_message(message, trailer_map, &commits_cfg.skip_trailer);

    let all_ids: Vec<String> = artifact_refs.values().flatten().cloned().collect();

    if all_ids.is_empty() {
        eprintln!("error: commit message has no artifact trailers");
        eprintln!();
        eprintln!("Add one of the following trailers to your commit message:");
        for (trailer_key, link_type) in trailer_map {
            eprintln!("  {trailer_key}: <ARTIFACT-ID>    (link type: {link_type})");
        }
        eprintln!();
        eprintln!("Or add '{}' to skip this check.", commits_cfg.skip_trailer);
        if !commits_cfg.exempt_types.is_empty() {
            eprintln!(
                "Exempt commit types: {}",
                commits_cfg.exempt_types.join(", ")
            );
        }
        return Ok(false);
    }

    // Load store to validate artifact IDs
    let schemas_dir = resolve_schemas_dir(cli);
    let schema = match rivet_core::load_schemas(&config.project.schemas, &schemas_dir) {
        Ok(s) => s,
        Err(e) => {
            log::warn!("could not load schemas: {e}; skipping ID validation");
            return Ok(true);
        }
    };
    let _ = schema; // we only need the store, not schema validation

    let mut store = Store::new();
    for source in &config.sources {
        match rivet_core::load_artifacts(source, &cli.project) {
            Ok(artifacts) => {
                for a in artifacts {
                    store.upsert(a);
                }
            }
            Err(e) => {
                log::warn!(
                    "could not load source '{}': {e}; skipping ID validation",
                    source.path
                );
                return Ok(true);
            }
        }
    }

    // Validate each referenced artifact ID
    let known_ids: HashSet<String> = store.iter().map(|a| a.id.clone()).collect();
    let mut unknown = Vec::new();
    for id in &all_ids {
        if !known_ids.contains(id) {
            unknown.push(id.clone());
        }
    }

    if unknown.is_empty() {
        return Ok(true);
    }

    // Report unknown IDs with fuzzy suggestions
    eprintln!("error: commit references unknown artifact IDs:");
    for uid in &unknown {
        eprint!("  {uid}");
        // Find closest match via Levenshtein
        let mut best: Option<(&str, usize)> = None;
        for kid in &known_ids {
            let d = levenshtein(uid, kid);
            if d <= 3 {
                match best {
                    Some((_, bd)) if d < bd => best = Some((kid, d)),
                    None => best = Some((kid, d)),
                    _ => {}
                }
            }
        }
        if let Some((suggestion, _)) = best {
            eprint!(" (did you mean '{suggestion}'?)");
        }
        eprintln!();
    }
    Ok(false)
}

// ── commits ──────────────────────────────────────────────────────────────

fn cmd_commits(
    cli: &Cli,
    since: Option<&str>,
    range: Option<&str>,
    format: &str,
    strict: bool,
) -> Result<bool> {
    use std::collections::BTreeMap;

    // Load project config
    let config_path = cli.project.join("rivet.yaml");
    let config = rivet_core::load_project_config(&config_path)
        .with_context(|| format!("loading {}", config_path.display()))?;

    let commits_cfg = config
        .commits
        .as_ref()
        .ok_or_else(|| anyhow::anyhow!("no 'commits' section in rivet.yaml"))?;

    // Load artifacts into store
    let schemas_dir = resolve_schemas_dir(cli);
    let _schema = rivet_core::load_schemas(&config.project.schemas, &schemas_dir)
        .context("loading schemas")?;

    let mut store = Store::new();
    for source in &config.sources {
        let artifacts = rivet_core::load_artifacts(source, &cli.project)
            .with_context(|| format!("loading source '{}'", source.path))?;
        for a in artifacts {
            store.upsert(a);
        }
    }

    let known_ids: HashSet<String> = store.iter().map(|a| a.id.clone()).collect();

    // Determine git range
    let git_range = if let Some(r) = range {
        r.to_string()
    } else if let Some(s) = since {
        format!("--since={s} HEAD")
    } else {
        "HEAD".to_string()
    };

    // Resolve project path for git
    let project_path = std::fs::canonicalize(&cli.project).unwrap_or_else(|_| cli.project.clone());

    let trailer_map: &BTreeMap<String, String> = &commits_cfg.trailers;

    let commits = rivet_core::commits::git_log_commits(
        &project_path,
        &git_range,
        trailer_map,
        &commits_cfg.skip_trailer,
    )
    .context("running git log")?;

    let analysis = rivet_core::commits::analyze_commits(
        commits,
        &known_ids,
        &commits_cfg.exempt_types,
        &commits_cfg.traced_paths,
        &commits_cfg.trace_exempt_artifacts,
        trailer_map,
    );

    if format == "json" {
        return cmd_commits_json(&analysis, strict);
    }

    // Text output
    let total = analysis.linked.len() + analysis.orphans.len() + analysis.exempt.len();

    println!("Commit traceability analysis");
    println!("============================");
    println!();
    println!("  Linked:       {:>4}", analysis.linked.len());
    println!("  Orphan:       {:>4}", analysis.orphans.len());
    println!("  Exempt:       {:>4}", analysis.exempt.len());
    println!("  Broken refs:  {:>4}", analysis.broken_refs.len());
    println!("  Total:        {:>4}", total);

    if !analysis.broken_refs.is_empty() {
        println!();
        println!("Broken references:");
        for br in &analysis.broken_refs {
            let short = if br.hash.len() > 8 {
                &br.hash[..8]
            } else {
                &br.hash
            };
            println!(
                "  {short} {}: unknown ID '{}' (trailer: {})",
                br.subject, br.missing_id, br.link_type
            );
        }
    }

    if !analysis.orphans.is_empty() {
        println!();
        println!("Orphan commits (no artifact trailers):");
        for c in &analysis.orphans {
            let short = if c.hash.len() > 8 {
                &c.hash[..8]
            } else {
                &c.hash
            };
            println!("  {short} {}", c.subject);
        }
    }

    if !analysis.unimplemented.is_empty() {
        println!();
        println!("Artifacts with no commit coverage:");
        for id in &analysis.unimplemented {
            println!("  {id}");
        }
    }

    // Coverage table
    if !known_ids.is_empty() {
        let covered = analysis.artifact_coverage.len();
        let trace_exempt_count = commits_cfg.trace_exempt_artifacts.len();
        let trackable = known_ids.len() - trace_exempt_count;
        let pct = if trackable > 0 {
            (covered as f64 / trackable as f64) * 100.0
        } else {
            100.0
        };
        println!();
        println!("Artifact coverage: {covered}/{trackable} ({pct:.1}%)");
    }

    // Exit code
    let has_errors = !analysis.broken_refs.is_empty();
    let has_warnings = !analysis.orphans.is_empty() || !analysis.unimplemented.is_empty();
    let fail = has_errors || (strict && has_warnings);
    Ok(!fail)
}

fn cmd_commits_json(analysis: &rivet_core::commits::CommitAnalysis, strict: bool) -> Result<bool> {
    let json = serde_json::json!({
        "summary": {
            "linked": analysis.linked.len(),
            "orphans": analysis.orphans.len(),
            "exempt": analysis.exempt.len(),
            "broken_refs": analysis.broken_refs.len(),
        },
        "broken_refs": analysis.broken_refs.iter().map(|br| {
            serde_json::json!({
                "hash": br.hash,
                "subject": br.subject,
                "missing_id": br.missing_id,
                "link_type": br.link_type,
            })
        }).collect::<Vec<_>>(),
        "orphans": analysis.orphans.iter().map(|c| {
            serde_json::json!({
                "hash": c.hash,
                "subject": c.subject,
                "date": c.date,
            })
        }).collect::<Vec<_>>(),
        "unimplemented": analysis.unimplemented.iter().collect::<Vec<_>>(),
        "artifact_coverage": analysis.artifact_coverage.iter().collect::<Vec<_>>(),
    });

    println!(
        "{}",
        serde_json::to_string_pretty(&json).context("serializing JSON")?
    );

    let has_errors = !analysis.broken_refs.is_empty();
    let has_warnings = !analysis.orphans.is_empty() || !analysis.unimplemented.is_empty();
    let fail = has_errors || (strict && has_warnings);
    Ok(!fail)
}

/// Compute Levenshtein edit distance between two strings.
fn levenshtein(a: &str, b: &str) -> usize {
    let a_len = a.len();
    let b_len = b.len();

    if a_len == 0 {
        return b_len;
    }
    if b_len == 0 {
        return a_len;
    }

    let mut prev: Vec<usize> = (0..=b_len).collect();
    let mut curr = vec![0; b_len + 1];

    for (i, ca) in a.chars().enumerate() {
        curr[0] = i + 1;
        for (j, cb) in b.chars().enumerate() {
            let cost = if ca == cb { 0 } else { 1 };
            curr[j + 1] = (prev[j] + cost).min(prev[j + 1] + 1).min(curr[j] + 1);
        }
        std::mem::swap(&mut prev, &mut curr);
    }

    prev[b_len]
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

fn cmd_sync(cli: &Cli) -> Result<bool> {
    let config = rivet_core::load_project_config(&cli.project.join("rivet.yaml"))
        .with_context(|| format!("loading {}", cli.project.join("rivet.yaml").display()))?;
    let externals = config.externals.as_ref();
    if externals.is_none() || externals.unwrap().is_empty() {
        eprintln!("No externals declared in rivet.yaml");
        return Ok(true);
    }
    let externals = externals.unwrap();

    // Ensure .rivet/ is gitignored
    let added = rivet_core::externals::ensure_gitignore(&cli.project)?;
    if added {
        eprintln!("Added .rivet/ to .gitignore");
    }

    let results = rivet_core::externals::sync_all(externals, &cli.project)?;
    for (name, path) in &results {
        eprintln!("  Synced {} → {}", name, path.display());
    }
    eprintln!("\n{} externals synced.", results.len());

    // Check if a lockfile exists and warn about version drift
    if let Some(lock) = rivet_core::externals::read_lockfile(&cli.project)? {
        let cache_dir = cli.project.join(".rivet/repos");
        for (name, entry) in &lock.pins {
            if let Some(ext) = externals.get(name) {
                let ext_dir =
                    rivet_core::externals::resolve_external_dir(ext, &cache_dir, &cli.project);
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

fn cmd_lock(cli: &Cli, update: bool) -> Result<bool> {
    if update {
        eprintln!("Note: --update refreshes all pins to latest refs");
    }
    let config = rivet_core::load_project_config(&cli.project.join("rivet.yaml"))
        .with_context(|| format!("loading {}", cli.project.join("rivet.yaml").display()))?;
    let externals = config.externals.as_ref();
    if externals.is_none() || externals.unwrap().is_empty() {
        eprintln!("No externals declared in rivet.yaml");
        return Ok(true);
    }
    let lock = rivet_core::externals::generate_lockfile(externals.unwrap(), &cli.project)?;
    rivet_core::externals::write_lockfile(&lock, &cli.project)?;
    eprintln!("Wrote rivet.lock with {} pins", lock.pins.len());
    Ok(true)
}

fn cmd_baseline_verify(cli: &Cli, name: &str, strict: bool) -> Result<bool> {
    let config = rivet_core::load_project_config(&cli.project.join("rivet.yaml"))
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

fn cmd_baseline_list(cli: &Cli) -> Result<bool> {
    let config = rivet_core::load_project_config(&cli.project.join("rivet.yaml"))
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
    Vec<PathBuf>,
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
    let mut doc_dirs = Vec::new();
    for docs_path in &config.docs {
        let dir = cli.project.join(docs_path);
        if dir.is_dir() {
            doc_dirs.push(dir.clone());
        }
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
    let project_path = std::fs::canonicalize(&cli.project).unwrap_or_else(|_| cli.project.clone());

    Ok((
        store,
        schema,
        graph,
        doc_store,
        result_store,
        project_name,
        project_path,
        schemas_dir,
        doc_dirs,
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
