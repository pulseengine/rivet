use std::collections::HashSet;
use std::path::PathBuf;
use std::process::ExitCode;

use anyhow::{Context, Result};
use clap::{Parser, Subcommand};

use rivet_core::coverage;
use rivet_core::diff::{ArtifactDiff, DiagnosticDiff};
use rivet_core::document::{self, DocumentStore};
use rivet_core::impact;
use rivet_core::links::LinkGraph;
use rivet_core::matrix::{self, Direction};
use rivet_core::model::ProjectConfig;
use rivet_core::results::{self, ResultStore};
use rivet_core::schema::Severity;
use rivet_core::store::Store;
use rivet_core::validate;

mod docs;
mod render;
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

/// Spawn a background thread to check for newer releases on GitHub.
///
/// The check is rate-limited to once per day via a timestamp file under
/// the platform cache directory (`$XDG_CACHE_HOME`, `$HOME/.cache`,
/// or `%LOCALAPPDATA%` on Windows).  The HTTP request has a 3-second
/// timeout so it never blocks startup.
fn check_for_updates() {
    std::thread::spawn(|| {
        // Resolve platform cache directory without the `dirs` crate.
        let cache_dir = if cfg!(target_os = "windows") {
            std::env::var_os("LOCALAPPDATA").map(PathBuf::from)
        } else {
            std::env::var_os("XDG_CACHE_HOME")
                .map(PathBuf::from)
                .or_else(|| std::env::var_os("HOME").map(|h| PathBuf::from(h).join(".cache")))
        };

        let Some(base) = cache_dir else { return };
        let cache = base.join("rivet").join("update-check");

        // Bail early if we already checked within the last 24 hours.
        if let Ok(meta) = std::fs::metadata(&cache) {
            if let Ok(modified) = meta.modified() {
                if modified.elapsed().unwrap_or_default() < std::time::Duration::from_secs(86400) {
                    return;
                }
            }
        }

        // Query the GitHub releases API (curl, 3-second timeout).
        let Ok(output) = std::process::Command::new("curl")
            .args([
                "-s",
                "-m",
                "3",
                "https://api.github.com/repos/pulseengine/rivet/releases/latest",
            ])
            .output()
        else {
            return;
        };

        if !output.status.success() {
            return;
        }

        let body = String::from_utf8_lossy(&output.stdout);
        if let Some(tag) = body.split("\"tag_name\":\"").nth(1) {
            if let Some(version) = tag.split('"').next() {
                let current = env!("CARGO_PKG_VERSION");
                let latest = version.trim_start_matches('v');
                if latest != current && !current.contains("dev") {
                    eprintln!(
                        "hint: rivet {latest} available (current: {current}). \
                         Run: cargo install rivet-cli"
                    );
                }
            }
        }

        // Touch the cache file so we don't check again for 24 hours.
        if let Some(parent) = cache.parent() {
            std::fs::create_dir_all(parent).ok();
        }
        std::fs::write(&cache, "").ok();
    });
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

        /// Generate AGENTS.md (and CLAUDE.md shim) from current project state
        #[arg(long)]
        agents: bool,
    },

    /// Validate artifacts against schemas
    Validate {
        /// Output format: "text" (default) or "json"
        #[arg(short, long, default_value = "text")]
        format: String,

        /// Use salsa incremental validation (experimental)
        #[arg(long)]
        incremental: bool,

        /// Run both pipelines and verify they produce identical diagnostics (SC-11)
        #[arg(long)]
        verify_incremental: bool,

        /// Skip cross-repo validation (broken external refs, backlinks, circular deps, version conflicts)
        #[arg(long)]
        skip_external_validation: bool,

        /// Scope validation to a named baseline (cumulative)
        #[arg(long)]
        baseline: Option<String>,
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

        /// Scope listing to a named baseline (cumulative)
        #[arg(long)]
        baseline: Option<String>,
    },

    /// Show artifact summary statistics
    Stats {
        /// Output format: "text" (default) or "json"
        #[arg(short, long, default_value = "text")]
        format: String,

        /// Scope statistics to a named baseline (cumulative)
        #[arg(long)]
        baseline: Option<String>,
    },

    /// Show traceability coverage report
    Coverage {
        /// Output format: "table" (default) or "json"
        #[arg(short, long, default_value = "table")]
        format: String,

        /// Exit with failure if overall coverage is below this percentage
        #[arg(long)]
        fail_under: Option<f64>,

        /// Show test-to-requirement coverage from source markers
        #[arg(long)]
        tests: bool,

        /// Directories to scan for test markers (default: src/ tests/)
        #[arg(long = "scan-paths", value_delimiter = ',')]
        scan_paths: Vec<PathBuf>,

        /// Scope coverage to a named baseline (cumulative)
        #[arg(long)]
        baseline: Option<String>,
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

        /// Theme: "dark" (PulseEngine, default) or "light" (clean for printing)
        #[arg(long, default_value = "dark")]
        theme: String,

        /// Offline mode: use system fonts only (no Google Fonts)
        #[arg(long)]
        offline: bool,

        /// URL for the home/back link, written to config.js (e.g. "https://pulseengine.eu/projects/")
        #[arg(long)]
        homepage: Option<String>,

        /// Version label for config.js version switcher (default: from rivet.yaml or "dev")
        #[arg(long)]
        version_label: Option<String>,

        /// JSON array of version entries for config.js switcher: [{"label":"v0.1.0","path":"../v0.1.0/"}]
        #[arg(long)]
        versions: Option<String>,

        /// Scope export to a named baseline (cumulative)
        #[arg(long)]
        baseline: Option<String>,
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
        /// Port to listen on (0 = auto-assign)
        #[arg(short = 'P', long, default_value = "3000")]
        port: u16,
        /// Address to bind to (default: 127.0.0.1, localhost only)
        #[arg(short = 'B', long, default_value = "127.0.0.1")]
        bind: String,
        /// Watch filesystem for changes and auto-reload
        #[arg(long)]
        watch: bool,
    },

    /// Sync external project dependencies into .rivet/repos/
    Sync {
        /// Use local path for all externals that have one, skipping git fetch/clone
        #[arg(long)]
        local: bool,
    },

    /// Pin external dependencies to exact commits in rivet.lock
    Lock {
        /// Update all pins to latest refs
        #[arg(long)]
        update: bool,
    },

    /// Analyze change impact between current state and a baseline
    Impact {
        /// Git ref to compare against (branch, tag, or commit)
        #[arg(long)]
        since: Option<String>,

        /// Path to baseline project directory (containing rivet.yaml)
        #[arg(long)]
        baseline: Option<PathBuf>,

        /// Maximum traversal depth (0 = direct only)
        #[arg(long, default_value = "10")]
        depth: usize,

        /// Output format: "text" (default) or "json"
        #[arg(short, long, default_value = "text")]
        format: String,
    },

    /// Manage distributed baselines across repos
    Baseline {
        #[command(subcommand)]
        action: BaselineAction,
    },

    /// Capture or compare project snapshots for delta tracking
    Snapshot {
        #[command(subcommand)]
        action: SnapshotAction,
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

    /// Import test results or artifacts from external formats
    ImportResults {
        /// Input format (currently: "junit")
        #[arg(long)]
        format: String,

        /// Input file path
        file: PathBuf,

        /// Output directory for results YAML (default: results/)
        #[arg(long, default_value = "results")]
        output: PathBuf,
    },

    /// Print the next available ID for a given artifact type or prefix
    NextId {
        /// Artifact type (e.g., requirement, feature, design-decision)
        #[arg(short = 't', long, group = "id_source")]
        r#type: Option<String>,

        /// ID prefix directly (e.g., REQ, FEAT, DD)
        #[arg(short, long, group = "id_source")]
        prefix: Option<String>,

        /// Output format: "text" (default) or "json"
        #[arg(short, long, default_value = "text")]
        format: String,
    },

    /// Add a new artifact to the project
    Add {
        /// Artifact type (e.g., requirement, feature, design-decision)
        #[arg(short = 't', long)]
        r#type: String,

        /// Artifact title
        #[arg(long)]
        title: String,

        /// Artifact description
        #[arg(long)]
        description: Option<String>,

        /// Lifecycle status (default: draft)
        #[arg(long, default_value = "draft")]
        status: String,

        /// Comma-separated tags
        #[arg(long, value_delimiter = ',')]
        tags: Vec<String>,

        /// Field values as key=value pairs
        #[arg(long = "field", value_parser = parse_key_val_mutation)]
        fields: Vec<(String, String)>,

        /// Links as type:target pairs (e.g., --link "satisfies:REQ-001")
        #[arg(long = "link", value_parser = parse_link_spec)]
        links: Vec<(String, String)>,

        /// Target YAML file to append the artifact to
        #[arg(long)]
        file: Option<PathBuf>,
    },

    /// Add a link between two artifacts
    Link {
        /// Source artifact ID
        source: String,

        /// Link type (e.g., satisfies, implements, derives-from)
        #[arg(short = 't', long = "type")]
        link_type: String,

        /// Target artifact ID
        #[arg(long)]
        target: String,
    },

    /// Remove a link between two artifacts
    Unlink {
        /// Source artifact ID
        source: String,

        /// Link type (e.g., satisfies, implements, derives-from)
        #[arg(short = 't', long = "type")]
        link_type: String,

        /// Target artifact ID
        #[arg(long)]
        target: String,
    },

    /// Modify an existing artifact
    Modify {
        /// Artifact ID to modify
        id: String,

        /// Set the lifecycle status
        #[arg(long)]
        set_status: Option<String>,

        /// Set the title
        #[arg(long)]
        set_title: Option<String>,

        /// Add a tag
        #[arg(long)]
        add_tag: Vec<String>,

        /// Remove a tag
        #[arg(long)]
        remove_tag: Vec<String>,

        /// Set a field value (key=value)
        #[arg(long = "set-field", value_parser = parse_key_val_mutation)]
        set_fields: Vec<(String, String)>,
    },

    /// Remove an artifact from the project
    Remove {
        /// Artifact ID to remove
        id: String,

        /// Force removal even if other artifacts link to this one
        #[arg(long)]
        force: bool,
    },

    /// Apply a batch of mutations from a YAML file
    Batch {
        /// Path to the batch YAML file
        file: PathBuf,
    },

    /// Resolve a computed embed and print the result
    Embed {
        /// Embed query string, e.g. "stats:types" or "coverage:rule-name"
        query: String,

        /// Output format: "html" or "text" (default)
        #[arg(short, long, default_value = "text")]
        format: String,
    },

    /// Start the language server (LSP over stdio)
    Lsp,
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

#[derive(Debug, Subcommand)]
enum SnapshotAction {
    /// Capture a snapshot of the current project state
    Capture {
        /// Snapshot name (default: git tag or HEAD short hash)
        #[arg(long)]
        name: Option<String>,
        /// Output file path (default: snapshots/{name}.json)
        #[arg(short, long)]
        output: Option<PathBuf>,
    },
    /// Compare current state against a baseline snapshot
    Diff {
        /// Path to the baseline snapshot JSON file
        #[arg(long)]
        baseline: Option<PathBuf>,
        /// Output format: "text" (default), "json", or "markdown"
        #[arg(short, long, default_value = "text")]
        format: String,
    },
    /// List available snapshots
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
        agents,
    } = &cli.command
    {
        if *agents {
            return cmd_init_agents(&cli);
        }
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
    if let Command::Lsp = &cli.command {
        return cmd_lsp(&cli);
    }

    match &cli.command {
        Command::Init { .. }
        | Command::Docs { .. }
        | Command::Context
        | Command::CommitMsgCheck { .. }
        | Command::Lsp => unreachable!(),
        Command::Stpa { path, schema } => cmd_stpa(path, schema.as_deref(), &cli),
        Command::Validate {
            format,
            incremental,
            verify_incremental,
            skip_external_validation,
            baseline,
        } => cmd_validate(
            &cli,
            format,
            *incremental,
            *verify_incremental,
            *skip_external_validation,
            baseline.as_deref(),
        ),
        Command::List {
            r#type,
            status,
            format,
            baseline,
        } => cmd_list(
            &cli,
            r#type.as_deref(),
            status.as_deref(),
            format,
            baseline.as_deref(),
        ),
        Command::Stats { format, baseline } => cmd_stats(&cli, format, baseline.as_deref()),
        Command::Coverage {
            format,
            fail_under,
            tests,
            scan_paths,
            baseline,
        } => {
            if *tests {
                cmd_coverage_tests(&cli, format, scan_paths)
            } else {
                cmd_coverage(&cli, format, fail_under.as_ref(), baseline.as_deref())
            }
        }
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
            theme,
            offline,
            homepage,
            version_label,
            versions,
            baseline,
        } => cmd_export(
            &cli,
            format,
            output.as_deref(),
            *single_page,
            theme,
            *offline,
            homepage.as_deref(),
            version_label.as_deref(),
            versions.as_deref(),
            baseline.as_deref(),
        ),
        Command::Impact {
            since,
            baseline,
            depth,
            format,
        } => cmd_impact(&cli, since.as_deref(), baseline.as_deref(), *depth, format),
        Command::Schema { action } => cmd_schema(&cli, action),
        Command::Commits {
            since,
            range,
            format,
            strict,
        } => cmd_commits(&cli, since.as_deref(), range.as_deref(), format, *strict),
        Command::Serve { port, bind, watch } => {
            check_for_updates();
            let port = *port;
            let watch = *watch;
            let bind = bind.clone();
            if bind == "0.0.0.0" || bind == "::" {
                eprintln!(
                    "warning: binding to {} exposes the dashboard to all network interfaces",
                    bind
                );
            }
            let ctx = ProjectContext::load_full(&cli)?;
            let schemas_dir = resolve_schemas_dir(&cli);
            let mut doc_dirs = Vec::new();
            for docs_path in &ctx.config.docs {
                let dir = cli.project.join(docs_path);
                if dir.is_dir() {
                    doc_dirs.push(dir);
                }
            }
            // Collect source dirs for file watcher
            let source_paths: Vec<PathBuf> = ctx
                .config
                .sources
                .iter()
                .map(|s| cli.project.join(&s.path))
                .collect();
            let project_name = ctx.config.project.name.clone();
            let project_path =
                std::fs::canonicalize(&cli.project).unwrap_or_else(|_| cli.project.clone());
            let rt = tokio::runtime::Runtime::new().context("failed to create tokio runtime")?;
            rt.block_on(serve::run(
                ctx.store,
                ctx.schema,
                ctx.graph,
                ctx.doc_store.unwrap_or_default(),
                ctx.result_store.unwrap_or_default(),
                project_name,
                project_path.clone(),
                schemas_dir.clone(),
                doc_dirs.clone(),
                port,
                bind,
                watch,
                source_paths,
            ))?;
            Ok(true)
        }
        Command::Sync { local } => cmd_sync(&cli, *local),
        Command::Lock { update } => cmd_lock(&cli, *update),
        Command::Baseline { action } => match action {
            BaselineAction::Verify { name, strict } => cmd_baseline_verify(&cli, name, *strict),
            BaselineAction::List => cmd_baseline_list(&cli),
        },
        Command::Snapshot { action } => match action {
            SnapshotAction::Capture { name, output } => {
                cmd_snapshot_capture(&cli, name.as_deref(), output.as_deref())
            }
            SnapshotAction::Diff { baseline, format } => {
                cmd_snapshot_diff(&cli, baseline.as_deref(), format)
            }
            SnapshotAction::List => cmd_snapshot_list(&cli),
        },
        #[cfg(feature = "wasm")]
        Command::Import {
            adapter,
            source,
            config_entries,
        } => cmd_import(adapter, source, config_entries),
        Command::ImportResults {
            format,
            file,
            output,
        } => cmd_import_results(format, file, output),
        Command::NextId {
            r#type,
            prefix,
            format,
        } => cmd_next_id(&cli, r#type.as_deref(), prefix.as_deref(), format),
        Command::Add {
            r#type,
            title,
            description,
            status,
            tags,
            fields,
            links,
            file,
        } => cmd_add(
            &cli,
            r#type,
            title,
            description.as_deref(),
            status,
            tags,
            fields,
            links,
            file.as_deref(),
        ),
        Command::Link {
            source,
            link_type,
            target,
        } => cmd_link(&cli, source, link_type, target),
        Command::Unlink {
            source,
            link_type,
            target,
        } => cmd_unlink(&cli, source, link_type, target),
        Command::Modify {
            id,
            set_status,
            set_title,
            add_tag,
            remove_tag,
            set_fields,
        } => cmd_modify(
            &cli,
            id,
            set_status.as_deref(),
            set_title.as_deref(),
            add_tag,
            remove_tag,
            set_fields,
        ),
        Command::Remove { id, force } => cmd_remove(&cli, id, *force),
        Command::Batch { file } => cmd_batch(&cli, file),
        Command::Embed { query, format } => cmd_embed(&cli, query, format),
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

/// Collapse newlines and pipes so a description fits in a markdown table cell.
fn sanitize_for_table(s: &str) -> String {
    s.replace('\n', " ")
        .replace('|', "/")
        .split_whitespace()
        .collect::<Vec<_>>()
        .join(" ")
}

/// Generate AGENTS.md (and CLAUDE.md shim) from current project state.
fn cmd_init_agents(cli: &Cli) -> Result<bool> {
    let config_path = cli.project.join("rivet.yaml");

    // Try to load project config — it's okay if it doesn't exist
    let has_project = config_path.exists();

    if !has_project {
        anyhow::bail!(
            "No rivet.yaml found in {}. Run `rivet init` first, then `rivet init --agents`.",
            cli.project.display()
        );
    }

    let config = rivet_core::load_project_config(&config_path)
        .with_context(|| format!("loading {}", config_path.display()))?;

    let schemas_dir = resolve_schemas_dir(cli);
    let schema = rivet_core::load_schemas(&config.project.schemas, &schemas_dir)
        .context("loading schemas")?;

    // Load artifacts
    let mut store = Store::new();
    for source in &config.sources {
        match rivet_core::load_artifacts(source, &cli.project) {
            Ok(artifacts) => {
                for artifact in artifacts {
                    store.upsert(artifact);
                }
            }
            Err(e) => {
                eprintln!("warning: could not load source '{}': {}", source.path, e);
            }
        }
    }

    // Build link graph and validate
    let graph = LinkGraph::build(&store, &schema);
    let diagnostics = validate::validate(&store, &schema, &graph);
    let error_count = diagnostics
        .iter()
        .filter(|d| d.severity == Severity::Error)
        .count();
    let validation_status = if error_count > 0 {
        format!("{} errors", error_count)
    } else {
        "pass".to_string()
    };

    // Collect artifact types with counts, sorted
    let mut type_counts: Vec<(String, usize)> = store
        .types()
        .map(|t| (t.to_string(), store.count_by_type(t)))
        .collect();
    type_counts.sort_by(|a, b| a.0.cmp(&b.0));

    let total_count = store.len();
    let type_count = type_counts.len();

    // Schema list
    let schema_list = config.project.schemas.join(", ");

    // Source paths
    let source_paths = config
        .sources
        .iter()
        .map(|s| format!("`{}`", s.path))
        .collect::<Vec<_>>()
        .join(", ");

    // Doc paths
    let doc_paths = if config.docs.is_empty() {
        "(none configured)".to_string()
    } else {
        config
            .docs
            .iter()
            .map(|d| format!("`{}`", d))
            .collect::<Vec<_>>()
            .join(", ")
    };

    // Artifact types table
    let mut artifact_types_section = String::new();
    artifact_types_section.push_str("| Type | Count | Description |\n");
    artifact_types_section.push_str("|------|------:|-------------|\n");
    for (type_name, count) in &type_counts {
        let desc = schema
            .artifact_type(type_name)
            .map(|t| sanitize_for_table(&t.description))
            .unwrap_or_default();
        artifact_types_section.push_str(&format!("| `{}` | {} | {} |\n", type_name, count, desc));
    }
    // Also include artifact types that exist in schema but have zero instances
    let mut schema_only_types: Vec<(&String, &rivet_core::schema::ArtifactTypeDef)> = schema
        .artifact_types
        .iter()
        .filter(|(name, _)| !type_counts.iter().any(|(n, _)| n == *name))
        .collect();
    schema_only_types.sort_by_key(|(name, _)| name.to_string());
    for (type_name, type_def) in &schema_only_types {
        let desc = sanitize_for_table(&type_def.description);
        artifact_types_section.push_str(&format!("| `{}` | 0 | {} |\n", type_name, desc));
    }

    // Link types section
    let mut link_types_section = String::new();
    let mut link_type_names: Vec<&String> = schema.link_types.keys().collect();
    link_type_names.sort();
    link_types_section.push_str("| Link Type | Description | Inverse |\n");
    link_types_section.push_str("|-----------|-------------|--------|\n");
    for lt_name in &link_type_names {
        let lt = &schema.link_types[*lt_name];
        let inverse = lt.inverse.as_deref().unwrap_or("-");
        link_types_section.push_str(&format!(
            "| `{}` | {} | `{}` |\n",
            lt_name, lt.description, inverse
        ));
    }

    // Commit traceability section
    let commits_section = if let Some(ref commits) = config.commits {
        let mut s = String::new();
        s.push_str("\n## Commit Traceability\n\n");
        s.push_str("This project enforces commit-to-artifact traceability.\n\n");
        if !commits.trailers.is_empty() {
            s.push_str("Required git trailers:\n");
            let mut trailers: Vec<_> = commits.trailers.iter().collect();
            trailers.sort_by_key(|(k, _)| (*k).clone());
            for (trailer, link_type) in &trailers {
                s.push_str(&format!(
                    "- `{}` -> maps to link type `{}`\n",
                    trailer, link_type
                ));
            }
        }
        if !commits.exempt_types.is_empty() {
            s.push_str(&format!(
                "\nExempt artifact types (no trailer required): {}\n",
                commits
                    .exempt_types
                    .iter()
                    .map(|t| format!("`{}`", t))
                    .collect::<Vec<_>>()
                    .join(", ")
            ));
        }
        s.push_str(&format!(
            "\nTo skip traceability for a commit, add: `{}`\n",
            commits.skip_trailer
        ));
        s
    } else {
        String::new()
    };

    // Build the AGENTS.md content
    let agents_md = format!(
        r#"<!-- Auto-generated by `rivet init --agents`. Re-run to update after artifact changes. -->
# AGENTS.md — Rivet Project Instructions

> This file was generated by `rivet init --agents`. Re-run the command
> any time artifacts change to keep this file current.

## Project Overview

This project uses **Rivet** for SDLC artifact traceability.
- Config: `rivet.yaml`
- Schemas: {schema_list}
- Artifacts: {total_count} across {type_count} types
- Validation: `rivet validate` (current status: {validation_status})

## Available Commands

| Command | Purpose | Example |
|---------|---------|---------|
| `rivet validate` | Check link integrity, coverage, required fields | `rivet validate --format json` |
| `rivet list` | List artifacts with filters | `rivet list --type requirement --format json` |
| `rivet stats` | Show artifact counts by type | `rivet stats --format json` |
| `rivet add` | Create a new artifact | `rivet add -t requirement --title "..." --link "satisfies:SC-1"` |
| `rivet link` | Add a link between artifacts | `rivet link SOURCE -t satisfies --target TARGET` |
| `rivet serve` | Start the dashboard | `rivet serve --port 3000` |
| `rivet export` | Generate HTML reports | `rivet export --format html --output ./dist` |
| `rivet impact` | Show change impact | `rivet impact --since HEAD~1` |
| `rivet coverage` | Show traceability coverage | `rivet coverage --format json` |
| `rivet diff` | Compare artifact versions | `rivet diff --base path/old --head path/new` |

## Artifact Types

{artifact_types_section}
## Working with Artifacts

### File Structure
- Artifacts are stored as YAML files in: {source_paths}
- Schema definitions: `schemas/` directory
- Documents: {doc_paths}

### Creating Artifacts
```bash
rivet add -t requirement --title "New requirement" --status draft --link "satisfies:SC-1"
```

### Validating Changes
Always run `rivet validate` after modifying artifact YAML files.
Use `rivet validate --format json` for machine-readable output.

### Link Types

{link_types_section}
## Conventions

- Artifact IDs follow the pattern: PREFIX-NNN (e.g., REQ-001, FEAT-042)
- Use `rivet add` to create artifacts (auto-generates next ID)
- Always include traceability links when creating artifacts
- Run `rivet validate` before committing
{commits_section}"#
    );

    // Write AGENTS.md (always regenerate — reflects current project state)
    let agents_path = cli.project.join("AGENTS.md");
    let agents_verb = if agents_path.exists() {
        "updated"
    } else {
        "created"
    };
    std::fs::write(&agents_path, &agents_md)
        .with_context(|| format!("writing {}", agents_path.display()))?;
    println!("  {agents_verb} {}", agents_path.display());

    // Generate CLAUDE.md shim if it doesn't already exist
    let claude_path = cli.project.join("CLAUDE.md");
    if !claude_path.exists() {
        let trailer_line = if config.commits.is_some() {
            "- Commit messages require artifact trailers (Implements/Fixes/Verifies/Satisfies/Refs)\n"
        } else {
            ""
        };
        let claude_md = format!(
            r#"# CLAUDE.md

See [AGENTS.md](AGENTS.md) for project instructions.

Additional Claude Code settings:
- Use `rivet validate` to verify changes to artifact YAML files
- Use `rivet list --format json` for machine-readable artifact queries
{trailer_line}"#
        );
        std::fs::write(&claude_path, &claude_md)
            .with_context(|| format!("writing {}", claude_path.display()))?;
        println!("  created {}", claude_path.display());
    } else {
        println!("  CLAUDE.md already exists, skipping");
    }

    println!(
        "\nGenerated AGENTS.md for project '{}' ({} artifacts, {} types)",
        config.project.name, total_count, type_count
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
fn cmd_validate(
    cli: &Cli,
    format: &str,
    incremental: bool,
    verify_incremental: bool,
    skip_external_validation: bool,
    baseline_name: Option<&str>,
) -> Result<bool> {
    check_for_updates();

    // When --incremental is set (or --verify-incremental), run the salsa path.
    if incremental || verify_incremental {
        return cmd_validate_incremental(cli, format, verify_incremental);
    }

    let ctx = ProjectContext::load_with_docs(cli)?;
    let ProjectContext {
        config,
        store,
        schema,
        graph,
        doc_store,
        ..
    } = ctx;

    // Apply baseline scoping if requested
    let (store, graph) = if let Some(bl) = baseline_name {
        if let Some(ref baselines) = config.baselines {
            let scoped = store.scoped(bl, baselines);
            let scoped_graph = LinkGraph::build(&scoped, &schema);
            println!("Baseline: {bl} ({} artifacts in scope)\n", scoped.len());
            (scoped, scoped_graph)
        } else {
            eprintln!("warning: --baseline specified but no baselines defined in rivet.yaml");
            (store, graph)
        }
    } else {
        (store, graph)
    };

    let doc_store = doc_store.unwrap_or_default();
    let mut diagnostics = validate::validate(&store, &schema, &graph);
    diagnostics.extend(validate::validate_documents(&doc_store, &store));

    // Cross-repo link validation (skipped with --skip-external-validation)
    let mut cross_repo_broken: Vec<rivet_core::externals::BrokenRef> = Vec::new();
    let mut backlinks: Vec<rivet_core::externals::CrossRepoBacklink> = Vec::new();
    let mut circular_deps: Vec<rivet_core::externals::CircularDependency> = Vec::new();
    let mut version_conflicts: Vec<rivet_core::externals::VersionConflict> = Vec::new();
    if !skip_external_validation {
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

                        cross_repo_broken = rivet_core::externals::validate_refs(
                            &all_refs,
                            &local_ids,
                            &external_ids,
                        );

                        // Compute backlinks from external artifacts pointing to local artifacts
                        backlinks = rivet_core::externals::compute_backlinks(&resolved, &local_ids);
                    }
                    Err(e) => {
                        eprintln!(
                            "  warning: could not load externals for cross-repo validation: {e}"
                        );
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
    }

    // Lifecycle completeness check
    let all_artifacts: Vec<_> = store.iter().cloned().collect();
    let lifecycle_gaps =
        rivet_core::lifecycle::check_lifecycle_completeness(&all_artifacts, &schema, &graph);

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
        let total_errors = errors + cross_errors;
        let result_str = if total_errors > 0 { "FAIL" } else { "PASS" };
        let output = serde_json::json!({
            "result": result_str,
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

/// Incremental validation via the salsa database.
///
/// This reads all source files and schemas into salsa inputs, then calls the
/// tracked `validate_all` query. When `verify` is true, it also runs the
/// existing sequential pipeline and asserts the diagnostics match (SC-11).
fn cmd_validate_incremental(cli: &Cli, format: &str, verify: bool) -> Result<bool> {
    use rivet_core::db::RivetDatabase;
    use std::time::Instant;

    let config_path = cli.project.join("rivet.yaml");
    let config = rivet_core::load_project_config(&config_path)
        .with_context(|| format!("loading {}", config_path.display()))?;

    let schemas_dir = resolve_schemas_dir(cli);

    // ── Collect schema content ──────────────────────────────────────────
    let mut schema_contents: Vec<(String, String)> = Vec::new();
    for name in &config.project.schemas {
        let path = schemas_dir.join(format!("{name}.yaml"));
        if path.exists() {
            let content = std::fs::read_to_string(&path)
                .with_context(|| format!("reading schema {}", path.display()))?;
            schema_contents.push((name.clone(), content));
        } else if let Some(content) = rivet_core::embedded::embedded_schema(name) {
            schema_contents.push((name.clone(), content.to_string()));
        } else {
            log::warn!("schema '{name}' not found on disk or embedded");
        }
    }

    // ── Collect source file content ─────────────────────────────────────
    let mut source_contents: Vec<(String, String)> = Vec::new();
    for source in &config.sources {
        let source_path = cli.project.join(&source.path);
        // The salsa db only handles generic YAML parsing; skip other formats.
        if source.format != "generic" && source.format != "generic-yaml" {
            log::info!(
                "incremental: skipping source '{}' (format '{}' not yet supported, using adapter fallback)",
                source.path,
                source.format,
            );
            continue;
        }
        collect_yaml_files(&source_path, &mut source_contents)
            .with_context(|| format!("reading source '{}'", source.path))?;
    }

    // ── Build salsa database and run validation ─────────────────────────
    let db = RivetDatabase::new();

    let schema_refs: Vec<(&str, &str)> = schema_contents
        .iter()
        .map(|(n, c)| (n.as_str(), c.as_str()))
        .collect();
    let source_refs: Vec<(&str, &str)> = source_contents
        .iter()
        .map(|(p, c)| (p.as_str(), c.as_str()))
        .collect();

    let t_start = Instant::now();
    let schema_set = db.load_schemas(&schema_refs);
    let source_set = db.load_sources(&source_refs);
    let diagnostics = db.diagnostics(source_set, schema_set);
    let t_elapsed = t_start.elapsed();

    if cli.verbose > 0 {
        eprintln!(
            "[incremental] cold-cache validation: {:.1}ms ({} source files, {} schemas, {} diagnostics)",
            t_elapsed.as_secs_f64() * 1000.0,
            source_contents.len(),
            schema_contents.len(),
            diagnostics.len(),
        );
    }

    // ── Verify mode: run both pipelines and compare (SC-11) ─────────────
    if verify {
        let t_seq_start = Instant::now();
        let seq_ctx = ProjectContext::load(cli)?;
        let seq_diagnostics = validate::validate(&seq_ctx.store, &seq_ctx.schema, &seq_ctx.graph);
        let t_seq_elapsed = t_seq_start.elapsed();

        if cli.verbose > 0 {
            eprintln!(
                "[sequential]   full validation: {:.1}ms ({} diagnostics)",
                t_seq_elapsed.as_secs_f64() * 1000.0,
                seq_diagnostics.len(),
            );
        }

        // Compare: sort both by (rule, artifact_id, message) for stable comparison.
        let mut incr_sorted = diagnostics.clone();
        let mut seq_sorted = seq_diagnostics.clone();
        let sort_key = |d: &validate::Diagnostic| {
            (
                d.rule.clone(),
                d.artifact_id.clone().unwrap_or_default(),
                d.message.clone(),
            )
        };
        incr_sorted.sort_by_key(sort_key);
        seq_sorted.sort_by_key(sort_key);

        if incr_sorted == seq_sorted {
            eprintln!(
                "[verify] SC-11 PASS: incremental and sequential pipelines produce identical diagnostics"
            );
        } else {
            eprintln!("[verify] SC-11 FAIL: pipelines diverge!");
            let incr_set: HashSet<String> = incr_sorted.iter().map(|d| format!("{d}")).collect();
            let seq_set: HashSet<String> = seq_sorted.iter().map(|d| format!("{d}")).collect();
            for d in seq_set.difference(&incr_set) {
                eprintln!("  only in sequential: {d}");
            }
            for d in incr_set.difference(&seq_set) {
                eprintln!("  only in incremental: {d}");
            }
        }
    }

    // ── Output (same formatting as the existing path) ───────────────────
    let errors = diagnostics
        .iter()
        .filter(|d| d.severity == Severity::Error)
        .count();
    let warnings = diagnostics
        .iter()
        .filter(|d| d.severity == Severity::Warning)
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
        let result_str = if errors > 0 { "FAIL" } else { "PASS" };
        let output = serde_json::json!({
            "result": result_str,
            "command": "validate",
            "incremental": true,
            "errors": errors,
            "warnings": warnings,
            "diagnostics": diag_json,
        });
        println!("{}", serde_json::to_string_pretty(&output).unwrap());
    } else {
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

/// Recursively collect YAML files from a path into (path_string, content) pairs.
fn collect_yaml_files(path: &std::path::Path, out: &mut Vec<(String, String)>) -> Result<()> {
    if path.is_file() {
        let content =
            std::fs::read_to_string(path).with_context(|| format!("reading {}", path.display()))?;
        out.push((path.display().to_string(), content));
    } else if path.is_dir() {
        let entries = std::fs::read_dir(path)
            .with_context(|| format!("reading directory {}", path.display()))?;
        for entry in entries {
            let entry = entry?;
            let p = entry.path();
            if p.is_dir() {
                collect_yaml_files(&p, out)?;
            } else if p
                .extension()
                .is_some_and(|ext| ext == "yaml" || ext == "yml")
            {
                let content = std::fs::read_to_string(&p)
                    .with_context(|| format!("reading {}", p.display()))?;
                out.push((p.display().to_string(), content));
            }
        }
    }
    Ok(())
}

/// List artifacts.
fn cmd_list(
    cli: &Cli,
    type_filter: Option<&str>,
    status_filter: Option<&str>,
    format: &str,
    baseline_name: Option<&str>,
) -> Result<bool> {
    let ctx = ProjectContext::load(cli)?;
    let store = apply_baseline_scope(ctx.store, baseline_name, &ctx.config);

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
fn cmd_stats(cli: &Cli, format: &str, baseline_name: Option<&str>) -> Result<bool> {
    let ctx = ProjectContext::load(cli)?;
    let store = apply_baseline_scope(ctx.store, baseline_name, &ctx.config);
    let graph = if baseline_name.is_some() {
        LinkGraph::build(&store, &ctx.schema)
    } else {
        ctx.graph
    };

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
fn cmd_coverage(
    cli: &Cli,
    format: &str,
    fail_under: Option<&f64>,
    baseline_name: Option<&str>,
) -> Result<bool> {
    let ctx = ProjectContext::load(cli)?;
    let store = apply_baseline_scope(ctx.store, baseline_name, &ctx.config);
    let schema = ctx.schema;
    let graph = if baseline_name.is_some() {
        LinkGraph::build(&store, &schema)
    } else {
        ctx.graph
    };
    let report = coverage::compute_coverage(&store, &schema, &graph);

    if format == "json" {
        let rules_json: Vec<serde_json::Value> = report
            .entries
            .iter()
            .map(|e| {
                serde_json::json!({
                    "name": e.rule_name,
                    "description": e.description,
                    "source_type": e.source_type,
                    "link_type": e.link_type,
                    "direction": e.direction,
                    "covered": e.covered,
                    "total": e.total,
                    "percentage": (e.percentage() * 10.0).round() / 10.0,
                    "uncovered_ids": e.uncovered_ids,
                })
            })
            .collect();
        let total: usize = report.entries.iter().map(|e| e.total).sum();
        let covered: usize = report.entries.iter().map(|e| e.covered).sum();
        let overall_pct = (report.overall_coverage() * 10.0).round() / 10.0;
        let output = serde_json::json!({
            "rules": rules_json,
            "overall": {
                "covered": covered,
                "total": total,
                "percentage": overall_pct,
            },
        });
        println!("{}", serde_json::to_string_pretty(&output).unwrap());
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

/// Test-to-requirement coverage via source markers.
fn cmd_coverage_tests(cli: &Cli, format: &str, scan_paths: &[PathBuf]) -> Result<bool> {
    use rivet_core::test_scanner;

    let ctx = ProjectContext::load(cli)?;
    let (store, schema) = (ctx.store, ctx.schema);

    // Resolve scan paths: default to src/ and tests/ relative to project dir.
    let paths: Vec<PathBuf> = if scan_paths.is_empty() {
        let mut defaults = Vec::new();
        let src = cli.project.join("src");
        let tests = cli.project.join("tests");
        if src.is_dir() {
            defaults.push(src);
        }
        if tests.is_dir() {
            defaults.push(tests);
        }
        // If neither exists, scan the project root.
        if defaults.is_empty() {
            defaults.push(cli.project.clone());
        }
        defaults
    } else {
        scan_paths
            .iter()
            .map(|p| {
                if p.is_absolute() {
                    p.clone()
                } else {
                    cli.project.join(p)
                }
            })
            .collect()
    };

    let patterns = test_scanner::default_patterns();
    let markers = test_scanner::scan_source_files(&paths, &patterns);
    let coverage = test_scanner::compute_test_coverage(&markers, &store, Some(&schema));

    if format == "json" {
        let json = serde_json::to_string_pretty(&coverage)
            .map_err(|e| anyhow::anyhow!("json serialization: {e}"))?;
        println!("{json}");
        return Ok(true);
    }

    // Text output
    println!("Test traceability coverage");
    println!("==========================");
    println!();

    if !coverage.covered.is_empty() {
        println!("Covered ({}):", coverage.covered.len());
        for (id, markers) in &coverage.covered {
            let label = if markers.len() == 1 {
                "1 test marker".to_string()
            } else {
                format!("{} test markers", markers.len())
            };
            println!("  {id}  {label}");
            for m in markers {
                println!(
                    "    {}:{}  {} ({})",
                    m.file.display(),
                    m.line,
                    m.test_name,
                    m.link_type,
                );
            }
        }
        println!();
    }

    if !coverage.uncovered.is_empty() {
        println!("Uncovered ({}):", coverage.uncovered.len());
        for id in &coverage.uncovered {
            println!("  {id}  No test markers found");
        }
        println!();
    }

    if !coverage.broken_refs.is_empty() {
        println!("Broken references ({}):", coverage.broken_refs.len());
        for m in &coverage.broken_refs {
            println!(
                "  {}:{}  {} -> {} (not found)",
                m.file.display(),
                m.line,
                m.test_name,
                m.target_id,
            );
        }
        println!();
    }

    let covered_count = coverage.covered.len();
    let total_coverable = covered_count + coverage.uncovered.len();
    let pct = if total_coverable > 0 {
        (covered_count as f64 / total_coverable as f64) * 100.0
    } else {
        100.0
    };
    println!(
        "Summary: {}/{} requirements have test coverage ({:.1}%)",
        covered_count, total_coverable, pct,
    );

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
    let ctx = ProjectContext::load(cli)?;
    let (store, graph) = (ctx.store, ctx.graph);

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
#[allow(clippy::too_many_arguments)]
fn cmd_export(
    cli: &Cli,
    format: &str,
    output: Option<&std::path::Path>,
    single_page: bool,
    theme: &str,
    offline: bool,
    homepage: Option<&str>,
    version_label: Option<&str>,
    versions_json: Option<&str>,
    baseline_name: Option<&str>,
) -> Result<bool> {
    if format == "html" {
        return cmd_export_html(
            cli,
            output,
            single_page,
            theme,
            offline,
            homepage,
            version_label,
            versions_json,
        );
    }

    if format == "gherkin" {
        return cmd_export_gherkin(cli, output, baseline_name);
    }

    use rivet_core::adapter::{Adapter, AdapterConfig};

    let ctx = ProjectContext::load(cli)?;
    let store = apply_baseline_scope(ctx.store, baseline_name, &ctx.config);
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
                "unsupported export format: {other} (supported: reqif, generic-yaml, html, gherkin)"
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

/// Export artifacts with acceptance-criteria fields to Gherkin .feature files.
fn cmd_export_gherkin(
    cli: &Cli,
    output: Option<&std::path::Path>,
    baseline_name: Option<&str>,
) -> Result<bool> {
    let ctx = ProjectContext::load(cli)?;
    let baselines = ctx.config.baselines.as_deref().unwrap_or(&[]);
    let store = if let Some(name) = baseline_name {
        ctx.store.scoped(name, baselines)
    } else {
        ctx.store.clone()
    };

    let out_dir = output.unwrap_or(std::path::Path::new("features"));
    std::fs::create_dir_all(out_dir).with_context(|| format!("creating {}", out_dir.display()))?;

    let mut file_count = 0;
    let mut scenario_count = 0;

    for art in store.iter() {
        let criteria = art
            .fields
            .get("acceptance-criteria")
            .and_then(|v| v.as_sequence());
        let Some(criteria) = criteria else { continue };
        if criteria.is_empty() {
            continue;
        }

        // Build .feature file
        let mut feature = String::new();
        feature.push_str(&format!(
            "# Generated from {} by rivet export --gherkin\n",
            art.id
        ));
        feature.push_str(&format!("Feature: {} — {}\n", art.id, art.title));
        if let Some(ref desc) = art.description {
            for line in desc.lines().take(5) {
                feature.push_str(&format!("  {}\n", line.trim()));
            }
        }
        feature.push('\n');

        // Generate linked requirements as tags
        let req_tags: Vec<String> = art
            .links
            .iter()
            .filter(|l| l.link_type == "verifies" || l.link_type == "satisfies")
            .map(|l| format!("@{}", l.target))
            .collect();

        for (i, criterion) in criteria.iter().enumerate() {
            let text = criterion.as_str().unwrap_or_default();
            if text.is_empty() {
                continue;
            }

            // Parse "Given X, When Y, Then Z" or just use as-is
            if !req_tags.is_empty() {
                feature.push_str(&format!("  {}\n", req_tags.join(" ")));
            }
            feature.push_str(&format!("  Scenario: {} criterion {}\n", art.id, i + 1));

            // Try to parse structured given/when/then
            let parts: Vec<&str> = text.splitn(3, ',').collect();
            if parts.len() >= 3
                && parts[0].trim().to_lowercase().starts_with("given")
                && parts[1].trim().to_lowercase().starts_with("when")
            {
                feature.push_str(&format!("    {}\n", parts[0].trim()));
                feature.push_str(&format!("    {}\n", parts[1].trim()));
                feature.push_str(&format!("    {}\n", parts[2].trim()));
            } else {
                // Freeform — wrap in Given/Then
                feature.push_str(
                    "    Given the system is operational
",
                );
                feature.push_str(&format!("    Then {}\n", text));
            }
            feature.push('\n');
            scenario_count += 1;
        }

        // Write to file
        let filename = format!("{}.feature", art.id.to_lowercase().replace('-', "_"));
        let path = out_dir.join(&filename);
        std::fs::write(&path, &feature).with_context(|| format!("writing {}", path.display()))?;
        file_count += 1;
    }

    eprintln!(
        "Exported {} scenarios across {} .feature files to {}",
        scenario_count,
        file_count,
        out_dir.display()
    );

    if file_count == 0 {
        eprintln!(
            "hint: No artifacts have acceptance-criteria fields. Add them:\n\
             rivet modify TEST-001 --set-field 'acceptance-criteria=[\"Given X, When Y, Then Z\"]'"
        );
    }

    Ok(true)
}

/// Export to a static HTML site using the dashboard render module.
///
/// This generates one standalone `.html` file per view, using the same
/// render functions as `rivet serve`. No HTMX is included — all links
/// are plain `<a href="...">` anchors that work in any static file server
/// or offline browser.
#[allow(clippy::too_many_arguments)]
fn cmd_export_html(
    cli: &Cli,
    output: Option<&std::path::Path>,
    _single_page: bool,
    _theme: &str,
    _offline: bool,
    _homepage: Option<&str>,
    _version_label: Option<&str>,
    _versions_json: Option<&str>,
) -> Result<bool> {
    use crate::render::styles;
    use crate::serve::components::ViewParams;

    let schemas_dir = resolve_schemas_dir(cli);
    let project_path = cli
        .project
        .canonicalize()
        .unwrap_or_else(|_| cli.project.clone());

    // Load project state using the same pipeline as `rivet serve`.
    let state = serve::reload_state(&project_path, &schemas_dir, 0)
        .context("loading project for export")?;
    let ctx = state.as_render_context();
    let params = ViewParams::default();

    // SC-EMBED-1: warn when working tree is dirty.
    if let Some(ref git) = state.context.git {
        if git.is_dirty {
            eprintln!(
                "warning: working tree is dirty ({} uncommitted change{}) — exported data may not match any commit",
                git.dirty_count,
                if git.dirty_count == 1 { "" } else { "s" },
            );
        }
    }

    // ── Mermaid JS (inlined so the site works offline) ──────────────
    const MERMAID_JS: &str = include_str!("../assets/mermaid.min.js");

    // ── Static layout wrapper ────────────────────────────────────────
    // Produces a full HTML document with CSS + Mermaid, a nav sidebar
    // with plain <a href="..."> links, and the page content in <main>.
    // No HTMX is included — this is a completely static site.
    let artifact_count = state.store.len();
    let error_count = state
        .cached_diagnostics
        .iter()
        .filter(|d| d.severity == rivet_core::schema::Severity::Error)
        .count();

    let wrap_page = |title: &str, content: &str| -> String {
        let version = env!("CARGO_PKG_VERSION");
        let project_name = &state.context.project_name;
        let error_badge = if error_count > 0 {
            format!("<span class=\"nav-badge nav-badge-error\">{error_count}</span>")
        } else {
            "<span class=\"nav-badge\">OK</span>".to_string()
        };
        let doc_count = state.doc_store.len();
        let doc_badge = if doc_count > 0 {
            format!("<span class=\"nav-badge\">{doc_count}</span>")
        } else {
            String::new()
        };
        let stpa_types = [
            "loss",
            "hazard",
            "sub-hazard",
            "system-constraint",
            "controller",
            "controlled-process",
            "control-action",
            "uca",
            "controller-constraint",
            "loss-scenario",
        ];
        let stpa_count: usize = stpa_types
            .iter()
            .map(|t| state.store.count_by_type(t))
            .sum();
        let stpa_nav = if stpa_count > 0 {
            format!(
                "<li><a href=\"stpa/index.html\">STPA \
                 <span class=\"nav-badge\">{stpa_count}</span></a></li>"
            )
        } else {
            String::new()
        };
        format!(
            r#"<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title} — {project_name} — Rivet</title>
<style>{fonts_css}{css}</style>
<script>{mermaid_js}</script>
<script>
mermaid.initialize({{startOnLoad:false,theme:'neutral',securityLevel:'strict'}});
document.addEventListener('DOMContentLoaded',function(){{
  mermaid.run({{querySelector:'.mermaid'}}).catch(function(){{}});
}});
</script>
</head>
<body>
<div class="shell">
<nav role="navigation" aria-label="Main navigation">
  <h1>Rivet</h1>
  <ul>
    <li><a href="../index.html">Overview
      <span class="nav-badge">{artifact_count}</span></a></li>
    <li><a href="../artifacts/index.html">Artifacts
      <span class="nav-badge">{artifact_count}</span></a></li>
    <li><a href="../validate/index.html">Validation
      {error_badge}</a></li>
    <li class="nav-divider"></li>
    <li><a href="../matrix/index.html">Matrix</a></li>
    <li><a href="../coverage/index.html">Coverage</a></li>
    <li><a href="../graph/index.html">Graph</a></li>
    <li><a href="../documents/index.html">Documents{doc_badge}</a></li>
    <li class="nav-divider"></li>
    {stpa_nav}
    <li><a href="../help/index.html">Help &amp; Docs</a></li>
  </ul>
  <div style="padding:.75rem 1rem;font-size:.7rem;color:var(--sidebar-text)">
    v{version}
  </div>
</nav>
<div class="content-area">
<main id="content" role="main">
{content}
<div class="footer">Generated by Rivet v{version} &mdash; <a href="index.html">Back to top</a></div>
</main>
</div>
</div>
</body>
</html>"#,
            fonts_css = styles::FONTS_CSS,
            css = styles::CSS,
            mermaid_js = MERMAID_JS,
        )
    };

    let out_dir = output.unwrap_or(std::path::Path::new("dist"));
    std::fs::create_dir_all(out_dir).with_context(|| format!("creating {}", out_dir.display()))?;

    let mut page_count = 0usize;

    // Helper: render a page, wrap it, and write it to a relative path within out_dir.
    // `rel_path` is like "index.html" or "artifacts/index.html".
    // `page` is the route string passed to render_page().
    let write_page =
        |rel_path: &str, page: &str, title: &str, out_dir: &std::path::Path| -> Result<()> {
            let result = render::render_page(&ctx, page, &params);
            let html = wrap_page(title, &result.html);
            let dest = out_dir.join(rel_path);
            if let Some(parent) = dest.parent() {
                std::fs::create_dir_all(parent)
                    .with_context(|| format!("creating directory {}", parent.display()))?;
            }
            std::fs::write(&dest, &html).with_context(|| format!("writing {}", dest.display()))?;
            Ok(())
        };

    // ── Top-level pages ──────────────────────────────────────────────
    write_page("index.html", "/stats", "Overview", out_dir)?;
    page_count += 1;
    write_page("artifacts/index.html", "/artifacts", "Artifacts", out_dir)?;
    page_count += 1;
    write_page("validate/index.html", "/validate", "Validation", out_dir)?;
    page_count += 1;
    write_page("stpa/index.html", "/stpa", "STPA", out_dir)?;
    page_count += 1;
    write_page("documents/index.html", "/documents", "Documents", out_dir)?;
    page_count += 1;
    write_page("graph/index.html", "/graph", "Graph", out_dir)?;
    page_count += 1;
    write_page("matrix/index.html", "/matrix", "Matrix", out_dir)?;
    page_count += 1;
    write_page("coverage/index.html", "/coverage", "Coverage", out_dir)?;
    page_count += 1;
    write_page("help/index.html", "/help", "Help", out_dir)?;
    page_count += 1;
    write_page(
        "help/schema/index.html",
        "/help/schema",
        "Schema Types",
        out_dir,
    )?;
    page_count += 1;
    write_page("help/links.html", "/help/links", "Link Types", out_dir)?;
    page_count += 1;
    write_page(
        "help/rules.html",
        "/help/rules",
        "Traceability Rules",
        out_dir,
    )?;
    page_count += 1;

    // ── Per-artifact detail pages ────────────────────────────────────
    let artifact_ids: Vec<String> = state.store.iter().map(|a| a.id.clone()).collect();
    for id in &artifact_ids {
        let rel = format!("artifacts/{id}.html");
        let page = format!("/artifacts/{id}");
        write_page(&rel, &page, id, out_dir)?;
        page_count += 1;
    }

    // ── Per-schema-type help pages ───────────────────────────────────
    let schema_type_names: Vec<String> = state.schema.artifact_types.keys().cloned().collect();
    for name in &schema_type_names {
        let rel = format!("help/schema/{name}.html");
        let page = format!("/help/schema/{name}");
        write_page(&rel, &page, name, out_dir)?;
        page_count += 1;
    }

    // ── Per-document detail pages ────────────────────────────────────
    let doc_ids: Vec<String> = state.doc_store.iter().map(|d| d.id.clone()).collect();
    for id in &doc_ids {
        let rel = format!("documents/{id}.html");
        let page = format!("/documents/{id}");
        write_page(&rel, &page, id, out_dir)?;
        page_count += 1;
    }

    eprintln!("Exported {page_count} pages to {}/", out_dir.display());
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
                        incremental: false,
                        verify_incremental: false,
                        skip_external_validation: false,
                        baseline: None,
                    },
                };
                let head_cli = Cli {
                    project: hp.to_path_buf(),
                    schemas: cli.schemas.clone(),
                    verbose: cli.verbose,
                    command: Command::Validate {
                        format: "text".to_string(),
                        incremental: false,
                        verify_incremental: false,
                        skip_external_validation: false,
                        baseline: None,
                    },
                };
                let bc = ProjectContext::load(&base_cli)?;
                let hc = ProjectContext::load(&head_cli)?;
                (bc.store, bc.schema, bc.graph, hc.store, hc.schema, hc.graph)
            }
            _ => {
                // Default: load the project twice (same working tree). This
                // is a placeholder — a future version will compare against
                // the last clean git state.
                let c1 = ProjectContext::load(cli)?;
                let c2 = ProjectContext::load(cli)?;
                (c1.store, c1.schema, c1.graph, c2.store, c2.schema, c2.graph)
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

/// Analyze change impact between current state and a baseline.
fn cmd_impact(
    cli: &Cli,
    since: Option<&str>,
    baseline: Option<&std::path::Path>,
    depth: usize,
    format: &str,
) -> Result<bool> {
    let ctx = ProjectContext::load(cli)?;
    let (current_store, graph) = (ctx.store, ctx.graph);

    // Load baseline store
    let baseline_store = if let Some(git_ref) = since {
        // Load from git ref using `git show <ref>:<file>` for each source file
        load_baseline_from_git(cli, git_ref)?
    } else if let Some(baseline_dir) = baseline {
        // Load from a baseline directory
        impact::load_baseline_from_dir(baseline_dir)
            .with_context(|| format!("loading baseline from '{}'", baseline_dir.display()))?
    } else {
        anyhow::bail!("specify either --since <git-ref> or --baseline <path>");
    };

    let result = impact::compute_impact(&current_store, &baseline_store, &graph, depth);

    if format == "json" {
        let changed_json: Vec<serde_json::Value> = result
            .changed
            .iter()
            .map(|c| {
                let title = current_store
                    .get(&c.id)
                    .map(|a| a.title.as_str())
                    .unwrap_or("");
                serde_json::json!({
                    "id": c.id,
                    "title": title,
                    "summary": c.change_summary,
                })
            })
            .collect();
        let direct_json: Vec<serde_json::Value> = result
            .directly_affected
            .iter()
            .map(|a| {
                let title = current_store
                    .get(&a.id)
                    .map(|ar| ar.title.as_str())
                    .unwrap_or("");
                serde_json::json!({
                    "id": a.id,
                    "title": title,
                    "reason": a.reason_chain,
                    "depth": a.depth,
                })
            })
            .collect();
        let transitive_json: Vec<serde_json::Value> = result
            .transitively_affected
            .iter()
            .map(|a| {
                let title = current_store
                    .get(&a.id)
                    .map(|ar| ar.title.as_str())
                    .unwrap_or("");
                serde_json::json!({
                    "id": a.id,
                    "title": title,
                    "reason": a.reason_chain,
                    "depth": a.depth,
                })
            })
            .collect();
        let output = serde_json::json!({
            "command": "impact",
            "changed": changed_json,
            "directly_affected": direct_json,
            "transitively_affected": transitive_json,
            "added": result.added,
            "removed": result.removed,
            "summary": {
                "changed": result.changed.len(),
                "direct": result.directly_affected.len(),
                "transitive": result.transitively_affected.len(),
                "added": result.added.len(),
                "removed": result.removed.len(),
                "total": result.total(),
            },
        });
        println!("{}", serde_json::to_string_pretty(&output).unwrap());
    } else {
        // Text output
        if !result.changed.is_empty() {
            println!("Changed artifacts ({}):", result.changed.len());
            for c in &result.changed {
                let title = current_store
                    .get(&c.id)
                    .map(|a| a.title.as_str())
                    .unwrap_or("");
                println!("  {:12} {} ({})", c.id, title, c.change_summary);
            }
        }

        if !result.added.is_empty() {
            println!("\nAdded artifacts ({}):", result.added.len());
            for id in &result.added {
                let title = current_store
                    .get(id)
                    .map(|a| a.title.as_str())
                    .unwrap_or("");
                println!("  {:12} {}", id, title);
            }
        }

        if !result.removed.is_empty() {
            println!("\nRemoved artifacts ({}):", result.removed.len());
            for id in &result.removed {
                println!("  {}", id);
            }
        }

        if !result.directly_affected.is_empty() {
            println!("\nDirectly affected ({}):", result.directly_affected.len());
            for a in &result.directly_affected {
                let title = current_store
                    .get(&a.id)
                    .map(|ar| ar.title.as_str())
                    .unwrap_or("");
                let reason = if a.reason_chain.is_empty() {
                    String::new()
                } else {
                    format!(" ({})", a.reason_chain.join(" "))
                };
                println!("  {:12} {}{}", a.id, title, reason);
            }
        }

        if !result.transitively_affected.is_empty() {
            println!(
                "\nTransitively affected ({}):",
                result.transitively_affected.len()
            );
            for a in &result.transitively_affected {
                let title = current_store
                    .get(&a.id)
                    .map(|ar| ar.title.as_str())
                    .unwrap_or("");
                let reason = if a.reason_chain.is_empty() {
                    String::new()
                } else {
                    format!(" ({})", a.reason_chain.join(" "))
                };
                println!("  {:12} {}{}", a.id, title, reason);
            }
        }

        println!(
            "\nImpact summary: {} changed, {} direct, {} transitive, {} added, {} removed, {} total",
            result.changed.len(),
            result.directly_affected.len(),
            result.transitively_affected.len(),
            result.added.len(),
            result.removed.len(),
            result.total(),
        );
    }

    Ok(true)
}

/// Load a baseline store from a git ref by extracting artifact files at that ref.
fn load_baseline_from_git(cli: &Cli, git_ref: &str) -> Result<Store> {
    let config_path = cli.project.join("rivet.yaml");

    // Read rivet.yaml at the git ref
    let config_content = git_show_file(&cli.project, git_ref, "rivet.yaml")
        .with_context(|| format!("reading rivet.yaml at ref '{git_ref}'"))?;

    let config: rivet_core::model::ProjectConfig = serde_yaml::from_str(&config_content)
        .with_context(|| format!("parsing rivet.yaml at ref '{git_ref}'"))?;

    // We need the current schemas to parse — load them from the working tree
    let schemas_dir = resolve_schemas_dir(cli);
    let _schema = rivet_core::load_schemas(&config.project.schemas, &schemas_dir)
        .context("loading schemas")?;

    // For each source, list files at the git ref and parse them
    let mut store = Store::new();

    for source in &config.sources {
        let source_path = &source.path;

        // List files in the source directory at the given ref
        let files = git_ls_tree_files(&cli.project, git_ref, source_path)
            .with_context(|| format!("listing files in '{source_path}' at ref '{git_ref}'"))?;

        for file_path in &files {
            // Only process YAML files
            if !file_path.ends_with(".yaml") && !file_path.ends_with(".yml") {
                continue;
            }

            let content = match git_show_file(&cli.project, git_ref, file_path) {
                Ok(c) => c,
                Err(e) => {
                    log::warn!("could not read {file_path} at {git_ref}: {e}");
                    continue;
                }
            };

            // Parse using the appropriate adapter
            let artifacts = match parse_yaml_content(&content, &source.format, file_path) {
                Ok(a) => a,
                Err(e) => {
                    log::warn!("could not parse {file_path} at {git_ref}: {e}");
                    continue;
                }
            };

            for artifact in artifacts {
                store.upsert(artifact);
            }
        }
    }

    // Also try to load artifacts from the current config if the baseline
    // config path doesn't exist at git ref (fallback for comparison)
    if store.is_empty() && config_path.exists() {
        log::warn!("no artifacts loaded from git ref '{git_ref}', baseline may be empty");
    }

    Ok(store)
}

/// Run `git show <ref>:<path>` to get file contents at a git ref.
fn git_show_file(repo_dir: &std::path::Path, git_ref: &str, path: &str) -> Result<String> {
    let output = std::process::Command::new("git")
        .args(["show", &format!("{git_ref}:{path}")])
        .current_dir(repo_dir)
        .output()
        .context("running git show")?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        anyhow::bail!("git show {git_ref}:{path} failed: {stderr}");
    }

    Ok(String::from_utf8_lossy(&output.stdout).into_owned())
}

/// Run `git ls-tree` to list files in a directory at a git ref.
fn git_ls_tree_files(
    repo_dir: &std::path::Path,
    git_ref: &str,
    dir_path: &str,
) -> Result<Vec<String>> {
    let output = std::process::Command::new("git")
        .args(["ls-tree", "-r", "--name-only", git_ref, dir_path])
        .current_dir(repo_dir)
        .output()
        .context("running git ls-tree")?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        anyhow::bail!("git ls-tree failed: {stderr}");
    }

    let stdout = String::from_utf8_lossy(&output.stdout);
    let files: Vec<String> = stdout.lines().map(|l| l.to_string()).collect();
    Ok(files)
}

/// Parse YAML content into artifacts using the specified format adapter.
fn parse_yaml_content(
    content: &str,
    format: &str,
    file_path: &str,
) -> Result<Vec<rivet_core::model::Artifact>> {
    match format {
        "generic" | "generic-yaml" => {
            // Parse as generic YAML artifacts
            let wrapper: GenericYamlWrapper =
                serde_yaml::from_str(content).with_context(|| format!("parsing {file_path}"))?;
            let artifacts = wrapper
                .artifacts
                .into_iter()
                .map(|raw| rivet_core::model::Artifact {
                    id: raw.id,
                    artifact_type: raw.r#type,
                    title: raw.title,
                    description: raw.description,
                    status: raw.status,
                    tags: raw.tags,
                    links: raw
                        .links
                        .into_iter()
                        .map(|l| rivet_core::model::Link {
                            link_type: l.r#type,
                            target: l.target,
                        })
                        .collect(),
                    fields: raw.fields,
                    source_file: Some(std::path::PathBuf::from(file_path)),
                })
                .collect();
            Ok(artifacts)
        }
        "stpa-yaml" => {
            // For STPA, fall back to generic parsing of the YAML structure
            let wrapper: GenericYamlWrapper =
                serde_yaml::from_str(content).with_context(|| format!("parsing {file_path}"))?;
            let artifacts = wrapper
                .artifacts
                .into_iter()
                .map(|raw| rivet_core::model::Artifact {
                    id: raw.id,
                    artifact_type: raw.r#type,
                    title: raw.title,
                    description: raw.description,
                    status: raw.status,
                    tags: raw.tags,
                    links: raw
                        .links
                        .into_iter()
                        .map(|l| rivet_core::model::Link {
                            link_type: l.r#type,
                            target: l.target,
                        })
                        .collect(),
                    fields: raw.fields,
                    source_file: Some(std::path::PathBuf::from(file_path)),
                })
                .collect();
            Ok(artifacts)
        }
        other => anyhow::bail!("unsupported format for git baseline: {other}"),
    }
}

/// Raw YAML structure for parsing artifact files from git show output.
#[derive(serde::Deserialize)]
struct GenericYamlWrapper {
    #[serde(default)]
    artifacts: Vec<RawArtifact>,
}

#[derive(serde::Deserialize)]
struct RawArtifact {
    id: String,
    #[serde(rename = "type")]
    r#type: String,
    title: String,
    #[serde(default)]
    description: Option<String>,
    #[serde(default)]
    status: Option<String>,
    #[serde(default)]
    tags: Vec<String>,
    #[serde(default)]
    links: Vec<RawLink>,
    #[serde(default, flatten)]
    fields: std::collections::BTreeMap<String, serde_yaml::Value>,
}

#[derive(serde::Deserialize)]
struct RawLink {
    #[serde(rename = "type")]
    r#type: String,
    target: String,
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
    let ctx = ProjectContext::load_with_docs(cli)?;
    let config = ctx.config;
    let store = ctx.store;
    let schema = ctx.schema;
    let graph = ctx.graph;
    let doc_store = ctx.doc_store.unwrap_or_default();
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

fn cmd_sync(cli: &Cli, local_only: bool) -> Result<bool> {
    let config = rivet_core::load_project_config(&cli.project.join("rivet.yaml"))
        .with_context(|| format!("loading {}", cli.project.join("rivet.yaml").display()))?;
    let externals = config.externals.as_ref();
    if externals.is_none() || externals.unwrap().is_empty() {
        eprintln!("No externals declared in rivet.yaml");
        return Ok(true);
    }
    let externals = externals.unwrap();

    if local_only {
        eprintln!("Using --local: preferring path externals, skipping git fetch/clone");
    }

    // Ensure .rivet/ is gitignored
    let added = rivet_core::externals::ensure_gitignore(&cli.project)?;
    if added {
        eprintln!("Added .rivet/ to .gitignore");
    }

    let results = rivet_core::externals::sync_all(externals, &cli.project, local_only)?;
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
    for (name, entry) in &lock.pins {
        let short_sha = &entry.commit[..8.min(entry.commit.len())];
        let source = entry.git.as_deref().unwrap_or("(local path)");
        eprintln!("  {name} -> {short_sha} ({source})");
    }
    rivet_core::externals::write_lockfile(&lock, &cli.project)?;
    eprintln!("\nWrote rivet.lock with {} pins", lock.pins.len());
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

// ── Snapshot commands ───────────────────────────────────────────────────

fn cmd_snapshot_capture(
    cli: &Cli,
    name: Option<&str>,
    output: Option<&std::path::Path>,
) -> Result<bool> {
    let schemas_dir = resolve_schemas_dir(cli);
    let project_path = cli
        .project
        .canonicalize()
        .unwrap_or_else(|_| cli.project.clone());

    let state = crate::serve::reload_state(&project_path, &schemas_dir, 0)
        .context("loading project for snapshot")?;

    let git_ctx = match &state.context.git {
        Some(git) => rivet_core::snapshot::GitContext {
            commit: git.commit_short.clone(), // short is what we have from serve
            commit_short: git.commit_short.clone(),
            tag: None, // TODO: detect git tag
            dirty: git.is_dirty,
        },
        None => rivet_core::snapshot::GitContext {
            commit: "unknown".to_string(),
            commit_short: "unknown".to_string(),
            tag: None,
            dirty: false,
        },
    };

    let snap = rivet_core::snapshot::capture_with_data(
        &state.store,
        &state.cached_diagnostics,
        &rivet_core::coverage::compute_coverage(&state.store, &state.schema, &state.graph),
        &git_ctx,
    );

    // Determine output path
    let snap_name = name.unwrap_or(&git_ctx.commit_short);
    let out_path = match output {
        Some(p) => p.to_path_buf(),
        None => project_path
            .join("snapshots")
            .join(format!("{snap_name}.json")),
    };

    rivet_core::snapshot::write_to_file(&snap, &out_path)
        .map_err(|e| anyhow::anyhow!("{e}"))?;

    eprintln!(
        "Snapshot captured: {} ({} artifacts, {:.1}% coverage, {} diagnostics)",
        out_path.display(),
        snap.stats.total,
        snap.coverage.overall,
        snap.diagnostics.errors + snap.diagnostics.warnings + snap.diagnostics.infos,
    );

    Ok(true)
}

fn cmd_snapshot_diff(
    cli: &Cli,
    baseline_path: Option<&std::path::Path>,
    format: &str,
) -> Result<bool> {
    let schemas_dir = resolve_schemas_dir(cli);
    let project_path = cli
        .project
        .canonicalize()
        .unwrap_or_else(|_| cli.project.clone());

    // Load baseline
    let baseline_file = match baseline_path {
        Some(p) => p.to_path_buf(),
        None => {
            // Auto-detect: find most recent snapshot in snapshots/
            let snap_dir = project_path.join("snapshots");
            find_latest_snapshot(&snap_dir)?
        }
    };

    let baseline = rivet_core::snapshot::read_from_file(&baseline_file)
        .map_err(|e| anyhow::anyhow!("{e}"))?;

    // Capture current state
    let state = crate::serve::reload_state(&project_path, &schemas_dir, 0)
        .context("loading project for snapshot diff")?;

    let git_ctx = match &state.context.git {
        Some(git) => rivet_core::snapshot::GitContext {
            commit: git.commit_short.clone(),
            commit_short: git.commit_short.clone(),
            tag: None,
            dirty: git.is_dirty,
        },
        None => rivet_core::snapshot::GitContext {
            commit: "unknown".to_string(),
            commit_short: "unknown".to_string(),
            tag: None,
            dirty: false,
        },
    };

    let current = rivet_core::snapshot::capture_with_data(
        &state.store,
        &state.cached_diagnostics,
        &rivet_core::coverage::compute_coverage(&state.store, &state.schema, &state.graph),
        &git_ctx,
    );

    // Check schema version compatibility (SC-EMBED-6)
    if baseline.schema_version != current.schema_version {
        eprintln!(
            "warning: snapshot schema version mismatch (baseline: {}, current: {}) — delta may be inaccurate",
            baseline.schema_version, current.schema_version,
        );
    }

    let delta = rivet_core::snapshot::compute_delta(&baseline, &current);

    match format {
        "json" => {
            let json = serde_json::to_string_pretty(&delta)
                .context("serializing delta")?;
            println!("{json}");
        }
        "markdown" => {
            println!("{}", format_delta_markdown(&delta, &baseline));
        }
        _ => {
            print_delta_text(&delta, &baseline);
        }
    }

    Ok(true)
}

fn cmd_snapshot_list(cli: &Cli) -> Result<bool> {
    let project_path = cli
        .project
        .canonicalize()
        .unwrap_or_else(|_| cli.project.clone());
    let snap_dir = project_path.join("snapshots");

    if !snap_dir.exists() {
        println!("No snapshots directory found.");
        return Ok(true);
    }

    let mut entries: Vec<_> = std::fs::read_dir(&snap_dir)
        .context("reading snapshots directory")?
        .filter_map(|e| e.ok())
        .filter(|e| {
            e.path()
                .extension()
                .is_some_and(|ext| ext == "json")
        })
        .collect();

    entries.sort_by_key(|e| e.file_name());

    if entries.is_empty() {
        println!("No snapshots found in {}/", snap_dir.display());
    } else {
        println!("Snapshots ({}):", entries.len());
        for entry in &entries {
            if let Ok(snap) = rivet_core::snapshot::read_from_file(&entry.path()) {
                println!(
                    "  {} — {} artifacts, {:.1}% cov, {} errors ({})",
                    entry.file_name().to_string_lossy(),
                    snap.stats.total,
                    snap.coverage.overall,
                    snap.diagnostics.errors,
                    snap.created_at,
                );
            } else {
                println!("  {} (invalid)", entry.file_name().to_string_lossy());
            }
        }
    }

    Ok(true)
}

fn find_latest_snapshot(snap_dir: &std::path::Path) -> Result<std::path::PathBuf> {
    if !snap_dir.exists() {
        anyhow::bail!("no snapshots directory found — run `rivet snapshot capture` first");
    }

    let mut files: Vec<_> = std::fs::read_dir(snap_dir)
        .context("reading snapshots directory")?
        .filter_map(|e| e.ok())
        .filter(|e| e.path().extension().is_some_and(|ext| ext == "json"))
        .collect();

    files.sort_by_key(|e| {
        e.metadata()
            .ok()
            .and_then(|m| m.modified().ok())
            .unwrap_or(std::time::SystemTime::UNIX_EPOCH)
    });

    files
        .last()
        .map(|e| e.path())
        .ok_or_else(|| anyhow::anyhow!("no snapshot files found in {}", snap_dir.display()))
}

fn print_delta_text(
    delta: &rivet_core::snapshot::SnapshotDelta,
    baseline: &rivet_core::snapshot::Snapshot,
) {
    let sign = |v: isize| -> String {
        if v > 0 {
            format!("+{v}")
        } else {
            format!("{v}")
        }
    };

    println!(
        "Delta: {} → {}",
        baseline.git_commit_short, delta.current_commit
    );
    println!("  Artifacts: {} ({})", baseline.stats.total as isize + delta.stats.total, sign(delta.stats.total));
    for (t, &change) in &delta.stats.by_type {
        if change != 0 {
            println!("    {t}: {}", sign(change));
        }
    }
    let fsign = |v: f64| -> String {
        if v > 0.0 {
            format!("+{v:.1}%")
        } else {
            format!("{v:.1}%")
        }
    };
    println!("  Coverage: {}", fsign(delta.coverage.overall));
    println!(
        "  Diagnostics: {} new, {} resolved, errors {}",
        delta.diagnostics.new_count,
        delta.diagnostics.resolved_count,
        sign(delta.diagnostics.errors),
    );
}

fn format_delta_markdown(
    delta: &rivet_core::snapshot::SnapshotDelta,
    baseline: &rivet_core::snapshot::Snapshot,
) -> String {
    let sign = |v: isize| -> String {
        if v > 0 {
            format!("+{v}")
        } else {
            format!("{v}")
        }
    };

    let mut md = format!(
        "## Rivet Delta: {} → {}\n\n",
        baseline.git_commit_short, delta.current_commit
    );
    md.push_str("| Metric | Value | Δ |\n|--------|-------|---|\n");
    md.push_str(&format!(
        "| Artifacts | {} | {} |\n",
        baseline.stats.total as isize + delta.stats.total,
        sign(delta.stats.total),
    ));
    let cov = baseline.coverage.overall + delta.coverage.overall;
    let cov_delta = if delta.coverage.overall > 0.0 {
        format!("+{:.1}%", delta.coverage.overall)
    } else {
        format!("{:.1}%", delta.coverage.overall)
    };
    md.push_str(&format!("| Coverage | {cov:.1}% | {cov_delta} |\n"));
    md.push_str(&format!(
        "| Errors | {} | {} |\n",
        baseline.diagnostics.errors as isize + delta.diagnostics.errors,
        sign(delta.diagnostics.errors),
    ));
    if delta.diagnostics.new_count > 0 {
        md.push_str(&format!(
            "\n**{}** new diagnostic{}\n",
            delta.diagnostics.new_count,
            if delta.diagnostics.new_count == 1 { "" } else { "s" },
        ));
    }
    if delta.diagnostics.resolved_count > 0 {
        md.push_str(&format!(
            "**{}** resolved diagnostic{}\n",
            delta.diagnostics.resolved_count,
            if delta.diagnostics.resolved_count == 1 { "" } else { "s" },
        ));
    }
    md
}

/// Apply baseline scoping to a store if a baseline name is provided.
///
/// Returns the original store unmodified when no baseline is requested
/// or when no baselines are configured in the project.
fn apply_baseline_scope(
    store: Store,
    baseline_name: Option<&str>,
    config: &ProjectConfig,
) -> Store {
    let Some(bl) = baseline_name else {
        return store;
    };
    if let Some(ref baselines) = config.baselines {
        let scoped = store.scoped(bl, baselines);
        eprintln!("Baseline: {bl} ({} artifacts in scope)", scoped.len());
        scoped
    } else {
        eprintln!("warning: --baseline specified but no baselines defined in rivet.yaml");
        store
    }
}

struct ProjectContext {
    config: ProjectConfig,
    store: Store,
    schema: rivet_core::schema::Schema,
    graph: LinkGraph,
    doc_store: Option<DocumentStore>,
    result_store: Option<ResultStore>,
}

impl ProjectContext {
    /// Load project with artifacts, schema, and link graph.
    fn load(cli: &Cli) -> Result<Self> {
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

        // Load external project artifacts so cross-repo references resolve
        if let Some(ref externals) = config.externals {
            if !externals.is_empty() {
                match rivet_core::externals::load_all_externals(externals, &cli.project) {
                    Ok(resolved) => {
                        for ext in resolved {
                            for mut artifact in ext.artifacts {
                                // Prefix external artifact IDs so they don't collide
                                artifact.id = format!("{}:{}", ext.prefix, artifact.id);
                                store.upsert(artifact);
                            }
                        }
                    }
                    Err(e) => {
                        log::warn!("could not load externals: {e}");
                    }
                }
            }
        }

        let graph = LinkGraph::build(&store, &schema);
        Ok(Self {
            config,
            store,
            schema,
            graph,
            doc_store: None,
            result_store: None,
        })
    }

    /// Load project with artifacts, schema, link graph, and documents.
    fn load_with_docs(cli: &Cli) -> Result<Self> {
        let mut ctx = Self::load(cli)?;

        let mut doc_store = DocumentStore::new();
        for docs_path in &ctx.config.docs {
            let dir = cli.project.join(docs_path);
            let docs = document::load_documents(&dir)
                .with_context(|| format!("loading docs from '{docs_path}'"))?;
            for doc in docs {
                doc_store.insert(doc);
            }
        }
        ctx.doc_store = Some(doc_store);
        Ok(ctx)
    }

    /// Load project with artifacts, schema, link graph, documents, and test results.
    fn load_full(cli: &Cli) -> Result<Self> {
        let mut ctx = Self::load_with_docs(cli)?;

        let mut result_store = ResultStore::new();
        if let Some(ref results_path) = ctx.config.results {
            let dir = cli.project.join(results_path);
            let runs = results::load_results(&dir)
                .with_context(|| format!("loading results from '{results_path}'"))?;
            for run in runs {
                result_store.insert(run);
            }
        }
        ctx.result_store = Some(result_store);
        Ok(ctx)
    }
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

/// Import test results from external formats (currently: JUnit XML).
fn cmd_import_results(
    format: &str,
    file: &std::path::Path,
    output: &std::path::Path,
) -> Result<bool> {
    use rivet_core::junit::{ImportSummary, parse_junit_xml};
    use rivet_core::results::TestRunFile;

    match format {
        "junit" => {
            let xml = std::fs::read_to_string(file)
                .with_context(|| format!("failed to read {}", file.display()))?;

            let runs = parse_junit_xml(&xml)
                .with_context(|| format!("failed to parse JUnit XML from {}", file.display()))?;

            if runs.is_empty() {
                println!("No test suites found in {}", file.display());
                return Ok(true);
            }

            std::fs::create_dir_all(output).with_context(|| {
                format!("failed to create output directory {}", output.display())
            })?;

            for run in &runs {
                let filename = format!("{}.yaml", run.run.id);
                let out_path = output.join(&filename);
                let run_file = TestRunFile {
                    run: run.run.clone(),
                    results: run.results.clone(),
                };
                let yaml =
                    serde_yaml::to_string(&run_file).context("failed to serialize run to YAML")?;
                std::fs::write(&out_path, &yaml)
                    .with_context(|| format!("failed to write {}", out_path.display()))?;
            }

            let summary = ImportSummary::from_runs(&runs);
            println!(
                "Imported {} test results ({} pass, {} fail, {} error, {} skip) → {}",
                summary.total,
                summary.pass,
                summary.fail,
                summary.error,
                summary.skip,
                output.display(),
            );

            Ok(true)
        }
        other => {
            anyhow::bail!("unknown import format: '{other}' (supported: junit)")
        }
    }
}

/// Parse a key=value pair for mutation commands.
fn parse_key_val_mutation(s: &str) -> Result<(String, String), String> {
    let pos = s
        .find('=')
        .ok_or_else(|| format!("invalid KEY=VALUE: no '=' found in '{s}'"))?;
    Ok((s[..pos].to_string(), s[pos + 1..].to_string()))
}

/// Parse a link specification as "type:target" (e.g., "satisfies:REQ-001").
fn parse_link_spec(s: &str) -> Result<(String, String), String> {
    let pos = s
        .find(':')
        .ok_or_else(|| format!("invalid link spec: expected 'type:target', got '{s}'"))?;
    let link_type = s[..pos].trim().to_string();
    let target = s[pos + 1..].trim().to_string();
    if link_type.is_empty() || target.is_empty() {
        return Err(format!(
            "invalid link spec: both type and target must be non-empty in '{s}'"
        ));
    }
    Ok((link_type, target))
}

/// Print the next available ID for a given artifact type or prefix.
fn cmd_next_id(
    cli: &Cli,
    artifact_type: Option<&str>,
    prefix: Option<&str>,
    format: &str,
) -> Result<bool> {
    use rivet_core::mutate;

    let ctx = ProjectContext::load(cli)?;
    let store = ctx.store;

    let resolved_prefix = match (artifact_type, prefix) {
        (Some(t), _) => mutate::prefix_for_type(t, &store),
        (_, Some(p)) => p.to_string(),
        (None, None) => anyhow::bail!("either --type or --prefix must be specified"),
    };

    let next = mutate::next_id(&store, &resolved_prefix);

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
fn cmd_add(
    cli: &Cli,
    artifact_type: &str,
    title: &str,
    description: Option<&str>,
    status: &str,
    tags: &[String],
    fields: &[(String, String)],
    links: &[(String, String)],
    file: Option<&std::path::Path>,
) -> Result<bool> {
    use rivet_core::model::{Artifact, Link};
    use rivet_core::mutate;
    use std::collections::BTreeMap;

    let ctx = ProjectContext::load(cli)?;
    let (store, schema) = (ctx.store, ctx.schema);

    // Resolve prefix for the type
    let prefix = mutate::prefix_for_type(artifact_type, &store);

    // Generate ID
    let id = mutate::next_id(&store, &prefix);

    // Build fields map
    let mut fields_map: BTreeMap<String, serde_yaml::Value> = BTreeMap::new();
    for (key, value) in fields {
        fields_map.insert(key.clone(), serde_yaml::Value::String(value.clone()));
    }

    // Build links
    let link_vec: Vec<Link> = links
        .iter()
        .map(|(link_type, target)| Link {
            link_type: link_type.clone(),
            target: target.clone(),
        })
        .collect();

    let artifact = Artifact {
        id: id.clone(),
        artifact_type: artifact_type.to_string(),
        title: title.to_string(),
        description: description.map(|s| s.to_string()),
        status: Some(status.to_string()),
        tags: tags.to_vec(),
        links: link_vec,
        fields: fields_map,
        source_file: None,
    };

    // Validate before writing (DD-028)
    mutate::validate_add(&artifact, &store, &schema).context("validation failed")?;

    // Determine target file
    let target_file = if let Some(f) = file {
        cli.project.join(f)
    } else {
        mutate::find_file_for_type(artifact_type, &store).ok_or_else(|| {
            anyhow::anyhow!(
                "no existing file found for type '{}'. Use --file to specify one.",
                artifact_type
            )
        })?
    };

    // Write to file
    mutate::append_artifact_to_file(&artifact, &target_file)
        .with_context(|| format!("writing to {}", target_file.display()))?;

    println!("{id}");

    Ok(true)
}

/// Add a link between two artifacts.
fn cmd_link(cli: &Cli, source_id: &str, link_type: &str, target_id: &str) -> Result<bool> {
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
    };

    mutate::add_link_to_file(source_id, &link, &source_file)
        .with_context(|| format!("updating {}", source_file.display()))?;

    println!("linked {} --[{}]--> {}", source_id, link_type, target_id);

    Ok(true)
}

/// Remove a link between two artifacts.
fn cmd_unlink(cli: &Cli, source_id: &str, link_type: &str, target_id: &str) -> Result<bool> {
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
fn cmd_modify(
    cli: &Cli,
    id: &str,
    set_status: Option<&str>,
    set_title: Option<&str>,
    add_tags: &[String],
    remove_tags: &[String],
    set_fields: &[(String, String)],
) -> Result<bool> {
    use rivet_core::mutate::{self, ModifyParams};

    let ctx = ProjectContext::load(cli)?;
    let (store, schema) = (ctx.store, ctx.schema);

    let params = ModifyParams {
        set_status: set_status.map(|s| s.to_string()),
        set_title: set_title.map(|s| s.to_string()),
        add_tags: add_tags.to_vec(),
        remove_tags: remove_tags.to_vec(),
        set_fields: set_fields.to_vec(),
    };

    // Validate before writing (DD-028)
    mutate::validate_modify(id, &params, &store, &schema).context("validation failed")?;

    let source_file = mutate::find_source_file(id, &store)
        .ok_or_else(|| anyhow::anyhow!("cannot determine source file for '{id}'"))?;

    mutate::modify_artifact_in_file(id, &params, &source_file, &store)
        .with_context(|| format!("updating {}", source_file.display()))?;

    println!("modified {id}");

    Ok(true)
}

/// Remove an artifact from the project.
fn cmd_remove(cli: &Cli, id: &str, force: bool) -> Result<bool> {
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
        fields: std::collections::BTreeMap<String, serde_yaml::Value>,
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
fn cmd_batch(cli: &Cli, file: &std::path::Path) -> Result<bool> {
    use rivet_core::model::{Artifact, Link};
    use rivet_core::mutate;

    let content = std::fs::read_to_string(file)
        .with_context(|| format!("reading batch file {}", file.display()))?;

    let batch: BatchFile = serde_yaml::from_str(&content).with_context(|| "parsing batch file")?;

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
                        }
                    })
                    .collect();

                let artifact = Artifact {
                    id: id.clone(),
                    artifact_type: artifact_type.clone(),
                    title: title.clone(),
                    description: description.clone(),
                    status: Some(status.as_deref().unwrap_or("draft").to_string()),
                    tags: tags.clone(),
                    links: link_vec,
                    fields: fields.clone(),
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

    // ── Phase 2: apply all mutations ────────────────────────────────────
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
                        }
                    })
                    .collect();

                let artifact = Artifact {
                    id: id.clone(),
                    artifact_type: artifact_type.clone(),
                    title: title.clone(),
                    description: description.clone(),
                    status: Some(status.as_deref().unwrap_or("draft").to_string()),
                    tags: tags.clone(),
                    links: link_vec,
                    fields: fields.clone(),
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

                mutate::append_artifact_to_file(&artifact, &target_file)
                    .with_context(|| format!("writing to {}", target_file.display()))?;

                println!("added {}", id);
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
                };

                mutate::add_link_to_file(&source, &link, &source_file)
                    .with_context(|| format!("updating {}", source_file.display()))?;

                println!("linked {} --[{}]--> {}", source, link_type, target);
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

                mutate::modify_artifact_in_file(&id, &params, &source_file, &store)
                    .with_context(|| format!("updating {}", source_file.display()))?;

                println!("modified {}", id);
            }
        }
    }

    println!(
        "\nbatch: applied {} mutation(s) successfully",
        batch.mutations.len()
    );
    Ok(true)
}

fn cmd_embed(cli: &Cli, query: &str, format: &str) -> Result<bool> {
    let schemas_dir = resolve_schemas_dir(cli);
    let project_path = cli
        .project
        .canonicalize()
        .unwrap_or_else(|_| cli.project.clone());

    let state = crate::serve::reload_state(&project_path, &schemas_dir, 0)
        .context("loading project for embed")?;

    let request = rivet_core::embed::EmbedRequest::parse(query)
        .map_err(|e| anyhow::anyhow!("{e}"))?;

    let embed_ctx = rivet_core::embed::EmbedContext {
        store: &state.store,
        schema: &state.schema,
        graph: &state.graph,
        diagnostics: &state.cached_diagnostics,
        baseline: None,
    };

    match rivet_core::embed::resolve_embed(&request, &embed_ctx) {
        Ok(html) => {
            if format == "html" {
                println!("{html}");
            } else {
                println!("{}", strip_html_tags(&html));
            }
            Ok(true)
        }
        Err(e) => {
            eprintln!("{e}");
            Ok(false)
        }
    }
}

/// Minimal HTML tag stripper for terminal-friendly output.
fn strip_html_tags(html: &str) -> String {
    let mut result = String::with_capacity(html.len());
    let mut in_tag = false;
    let mut prev_was_newline = false;
    for ch in html.chars() {
        if ch == '<' {
            in_tag = true;
            continue;
        }
        if ch == '>' {
            in_tag = false;
            continue;
        }
        if !in_tag {
            if ch == '\n' {
                if !prev_was_newline {
                    result.push('\n');
                    prev_was_newline = true;
                }
            } else {
                prev_was_newline = false;
                result.push(ch);
            }
        }
    }
    result
        .replace("&amp;", "&")
        .replace("&lt;", "<")
        .replace("&gt;", ">")
        .replace("&quot;", "\"")
}

fn cmd_lsp(cli: &Cli) -> Result<bool> {
    use lsp_server::{Connection, Message, Response};
    use lsp_types::*;
    use rivet_core::db::RivetDatabase;

    eprintln!("rivet lsp: starting language server...");

    let (connection, io_threads) = Connection::stdio();

    let server_capabilities = ServerCapabilities {
        text_document_sync: Some(TextDocumentSyncCapability::Kind(TextDocumentSyncKind::FULL)),
        hover_provider: Some(HoverProviderCapability::Simple(true)),
        definition_provider: Some(OneOf::Left(true)),
        completion_provider: Some(CompletionOptions {
            trigger_characters: Some(vec!["[".to_string(), ":".to_string()]),
            ..Default::default()
        }),
        ..Default::default()
    };

    let init_params = connection.initialize(serde_json::to_value(server_capabilities).unwrap())?;
    let params: InitializeParams = serde_json::from_value(init_params)?;

    // Determine project root from workspace folders or root_uri
    #[allow(deprecated)]
    let project_dir = params
        .root_uri
        .as_ref()
        .and_then(|u| {
            let s = u.as_str();
            s.strip_prefix("file://").map(std::path::PathBuf::from)
        })
        .unwrap_or_else(|| cli.project.clone());

    eprintln!("rivet lsp: project root: {}", project_dir.display());

    // Initialize salsa database for incremental computation
    let mut db = RivetDatabase::new();
    let config_path = project_dir.join("rivet.yaml");
    let schemas_dir = resolve_schemas_dir(cli);

    let (source_set, schema_set) = if config_path.exists() {
        let config = rivet_core::load_project_config(&config_path).unwrap_or_else(|e| {
            eprintln!("rivet lsp: failed to load config: {e}");
            std::process::exit(1);
        });

        // Load schema contents into salsa inputs
        let schema_contents =
            rivet_core::embedded::load_schema_contents(&config.project.schemas, &schemas_dir);
        let schema_refs: Vec<(&str, &str)> = schema_contents
            .iter()
            .map(|(n, c)| (n.as_str(), c.as_str()))
            .collect();
        let schema_set = db.load_schemas(&schema_refs);

        // Discover all YAML source files and load them into salsa inputs
        let mut source_pairs: Vec<(String, String)> = Vec::new();
        for source in &config.sources {
            let source_path = project_dir.join(&source.path);
            let _ = collect_yaml_files(&source_path, &mut source_pairs);
        }
        let source_refs: Vec<(&str, &str)> = source_pairs
            .iter()
            .map(|(p, c)| (p.as_str(), c.as_str()))
            .collect();
        let source_set = db.load_sources(&source_refs);

        (source_set, schema_set)
    } else {
        eprintln!("rivet lsp: no rivet.yaml found, running with empty store");
        let schema_set = db.load_schemas(&[]);
        let source_set = db.load_sources(&[]);
        (source_set, schema_set)
    };

    // Publish initial diagnostics from salsa
    let store = db.store(source_set);
    let diagnostics = db.diagnostics(source_set, schema_set);
    let mut prev_diagnostic_files: std::collections::HashSet<std::path::PathBuf> =
        std::collections::HashSet::new();
    lsp_publish_salsa_diagnostics(
        &connection,
        &diagnostics,
        &store,
        &mut prev_diagnostic_files,
    );
    eprintln!(
        "rivet lsp: initialized with {} artifacts (salsa incremental)",
        store.len()
    );

    // Build supplementary state for rendering
    let render_schema = db.schema(schema_set);
    let mut render_graph = rivet_core::links::LinkGraph::build(&store, &render_schema);

    let mut doc_store = rivet_core::document::DocumentStore::new();
    let mut result_store = rivet_core::results::ResultStore::new();

    // Load documents and results from config
    if config_path.exists() {
        if let Ok(config) = rivet_core::load_project_config(&config_path) {
            for docs_path in &config.docs {
                let dir = project_dir.join(docs_path);
                if let Ok(docs) = rivet_core::document::load_documents(&dir) {
                    for doc in docs {
                        doc_store.insert(doc);
                    }
                }
            }
            if let Some(ref results_path) = config.results {
                let dir = project_dir.join(results_path);
                if let Ok(runs) = rivet_core::results::load_results(&dir) {
                    for run in runs {
                        result_store.insert(run);
                    }
                }
            }
        }
    }

    let repo_context = crate::serve::RepoContext {
        project_name: project_dir
            .file_name()
            .and_then(|n| n.to_str())
            .unwrap_or("unknown")
            .to_string(),
        project_path: project_dir.display().to_string(),
        git: crate::serve::capture_git_info(&project_dir),
        loaded_at: String::new(),
        siblings: Vec::new(),
        port: 0,
    };

    let externals: Vec<crate::serve::ExternalInfo> = Vec::new();
    let mut render_store = store;
    let mut diagnostics_cache = diagnostics;

    // Main message loop
    for msg in &connection.receiver {
        match msg {
            Message::Request(req) => {
                if connection.handle_shutdown(&req)? {
                    break;
                }
                let method = req.method.as_str();
                match method {
                    "textDocument/hover" => {
                        let params: HoverParams = serde_json::from_value(req.params.clone())?;
                        let store = db.store(source_set);
                        let result = lsp_hover(&params, &store);
                        connection.sender.send(Message::Response(Response {
                            id: req.id,
                            result: Some(serde_json::to_value(result)?),
                            error: None,
                        }))?;
                    }
                    "textDocument/definition" => {
                        let params: GotoDefinitionParams =
                            serde_json::from_value(req.params.clone())?;
                        let store = db.store(source_set);
                        let result = lsp_goto_definition(&params, &store);
                        connection.sender.send(Message::Response(Response {
                            id: req.id,
                            result: Some(serde_json::to_value(result)?),
                            error: None,
                        }))?;
                    }
                    "textDocument/completion" => {
                        let params: CompletionParams = serde_json::from_value(req.params.clone())?;
                        let store = db.store(source_set);
                        let schema = db.schema(schema_set);
                        let result = lsp_completion(&params, &store, &schema);
                        connection.sender.send(Message::Response(Response {
                            id: req.id,
                            result: Some(serde_json::to_value(result)?),
                            error: None,
                        }))?;
                    }
                    "rivet/render" => {
                        let params: serde_json::Value = req.params.clone();
                        let page = params.get("page").and_then(|v| v.as_str()).unwrap_or("/");
                        let seq = params.get("seq").and_then(|v| v.as_u64()).unwrap_or(0);
                        let view_params = params
                            .get("params")
                            .and_then(|p| {
                                serde_json::from_value::<crate::serve::components::ViewParams>(
                                    p.clone(),
                                )
                                .ok()
                            })
                            .unwrap_or_default();

                        let ctx = crate::render::RenderContext {
                            store: &render_store,
                            schema: &render_schema,
                            graph: &render_graph,
                            doc_store: &doc_store,
                            result_store: &result_store,
                            diagnostics: &diagnostics_cache,
                            context: &repo_context,
                            externals: &externals,
                            project_path: &project_dir,
                            schemas_dir: &schemas_dir,
                        };

                        let result = crate::render::render_page(&ctx, page, &view_params);

                        // If we have a source file but no line, find the artifact's line
                        let source_line = result.source_line.or_else(|| {
                            if let (Some(sf), true) =
                                (&result.source_file, page.starts_with("/artifacts/"))
                            {
                                let (path, _query) = page.split_once('?').unwrap_or((page, ""));
                                let rest = &path["/artifacts/".len()..];
                                let (id, _) = rest.split_once('/').unwrap_or((rest, ""));
                                let full_path = if std::path::Path::new(sf).is_absolute() {
                                    std::path::PathBuf::from(sf)
                                } else {
                                    project_dir.join(sf)
                                };
                                let line = lsp_find_artifact_line(&full_path, id);
                                Some(line)
                            } else {
                                None
                            }
                        });

                        connection.sender.send(Message::Response(Response {
                            id: req.id,
                            result: Some(serde_json::json!({
                                "html": result.html,
                                "title": result.title,
                                "sourceFile": result.source_file,
                                "sourceLine": source_line,
                                "seq": seq,
                            })),
                            error: None,
                        }))?;
                    }
                    "rivet/treeData" => {
                        let params: serde_json::Value = req.params.clone();
                        let parent = params.get("parent").and_then(|v| v.as_str());

                        let response_value = match parent {
                            None => {
                                // Documents from DocumentStore (markdown docs)
                                let documents: Vec<_> = doc_store
                                    .iter()
                                    .map(|doc| {
                                        let source = doc
                                            .source_file
                                            .as_ref()
                                            .map(|p| p.display().to_string())
                                            .unwrap_or_default();
                                        serde_json::json!({
                                            "kind": "document", "label": &doc.title,
                                            "description": &source,
                                            "path": &doc.id,
                                            "page": format!("/documents/{}", &doc.id)
                                        })
                                    })
                                    .collect();

                                // Artifact source files (YAML files with artifacts)
                                let mut file_map: std::collections::BTreeMap<
                                    String,
                                    (String, usize),
                                > = std::collections::BTreeMap::new();
                                for artifact in render_store.iter() {
                                    if let Some(ref sf) = artifact.source_file {
                                        let path = sf.display().to_string();
                                        let entry =
                                            file_map.entry(path.clone()).or_insert_with(|| {
                                                let name = std::path::Path::new(&path)
                                                    .file_stem()
                                                    .and_then(|s| s.to_str())
                                                    .unwrap_or("unknown")
                                                    .replace('-', " ");
                                                let name = name
                                                    .split_whitespace()
                                                    .map(|w| {
                                                        let mut c = w.chars();
                                                        match c.next() {
                                                            None => String::new(),
                                                            Some(f) => {
                                                                f.to_uppercase().to_string()
                                                                    + c.as_str()
                                                            }
                                                        }
                                                    })
                                                    .collect::<Vec<_>>()
                                                    .join(" ");
                                                (name, 0)
                                            });
                                        entry.1 += 1;
                                    }
                                }
                                let sources: Vec<_> = file_map
                                    .iter()
                                    .map(|(path, (name, count))| {
                                        serde_json::json!({
                                            "kind": "source", "label": name, "description": path,
                                            "artifactCount": count, "path": path
                                        })
                                    })
                                    .collect();

                                let views = vec![
                                    serde_json::json!({"kind":"view","label":"Stats","page":"/stats","icon":"dashboard"}),
                                    serde_json::json!({"kind":"view","label":"Artifacts","page":"/artifacts","icon":"symbol-class"}),
                                    serde_json::json!({"kind":"view","label":"Validation","page":"/validate","icon":"pass"}),
                                    serde_json::json!({"kind":"view","label":"STPA","page":"/stpa","icon":"shield"}),
                                    serde_json::json!({"kind":"view","label":"Documents","page":"/documents","icon":"book"}),
                                    serde_json::json!({"kind":"view","label":"Graph","page":"/graph","icon":"type-hierarchy"}),
                                    serde_json::json!({"kind":"view","label":"Matrix","page":"/matrix","icon":"table"}),
                                    serde_json::json!({"kind":"view","label":"Coverage","page":"/coverage","icon":"checklist"}),
                                    serde_json::json!({"kind":"view","label":"Source","page":"/source","icon":"code"}),
                                    serde_json::json!({"kind":"view","label":"Traceability","page":"/traceability","icon":"git-compare"}),
                                    serde_json::json!({"kind":"view","label":"Doc Linkage","page":"/doc-linkage","icon":"link"}),
                                ];

                                let help = vec![
                                    serde_json::json!({"kind":"view","label":"Help","page":"/help","icon":"question"}),
                                    serde_json::json!({"kind":"view","label":"Schema Types","page":"/help/schema","icon":"symbol-class"}),
                                    serde_json::json!({"kind":"view","label":"Link Types","page":"/help/links","icon":"link"}),
                                    serde_json::json!({"kind":"view","label":"Traceability Rules","page":"/help/rules","icon":"checklist"}),
                                    serde_json::json!({"kind":"view","label":"Documentation","page":"/help/docs","icon":"notebook"}),
                                ];

                                let mut categories = vec![
                                    serde_json::json!({"kind":"category","label":"Views","children":views}),
                                    serde_json::json!({"kind":"category","label":"Help","children":help}),
                                ];
                                if !sources.is_empty() {
                                    categories.push(serde_json::json!({"kind":"category","label":"Artifact Files","children":sources}));
                                }
                                if !documents.is_empty() {
                                    categories.insert(0, serde_json::json!({"kind":"category","label":"Documents","children":documents}));
                                }

                                serde_json::json!({ "items": categories })
                            }
                            Some(parent_path) => {
                                // Expand source file: show artifacts from this file
                                let mut items: Vec<_> = render_store.iter()
                                    .filter(|a| a.source_file.as_ref().is_some_and(|sf| sf.display().to_string() == parent_path))
                                    .map(|a| serde_json::json!({
                                        "kind":"artifact","label":&a.id,"description":&a.title,
                                        "page":format!("/artifacts/{}",a.id),"type":&a.artifact_type,
                                        "sourceFile":parent_path
                                    }))
                                    .collect();
                                items.sort_by(|a, b| a["label"].as_str().cmp(&b["label"].as_str()));
                                serde_json::json!({"items": items})
                            }
                        };

                        connection.sender.send(Message::Response(Response {
                            id: req.id,
                            result: Some(response_value),
                            error: None,
                        }))?;
                    }
                    "rivet/css" => {
                        let css = format!(
                            "{}\n{}",
                            crate::render::styles::FONTS_CSS,
                            crate::render::styles::CSS
                        );
                        connection.sender.send(Message::Response(Response {
                            id: req.id,
                            result: Some(serde_json::to_value(css)?),
                            error: None,
                        }))?;
                    }
                    "rivet/search" => {
                        let params: serde_json::Value = req.params.clone();
                        let query = params.get("query").and_then(|v| v.as_str()).unwrap_or("");
                        let query_lower = query.to_lowercase();

                        let mut results: Vec<serde_json::Value> = Vec::new();

                        if !query_lower.is_empty() {
                            for artifact in render_store.iter() {
                                let id_str = artifact.id.to_string();
                                if id_str.to_lowercase().contains(&query_lower)
                                    || artifact.title.to_lowercase().contains(&query_lower)
                                {
                                    results.push(serde_json::json!({
                                        "id": id_str,
                                        "title": artifact.title,
                                        "type": artifact.artifact_type,
                                        "page": format!("/artifacts/{}", id_str),
                                    }));
                                }
                            }

                            for doc in doc_store.iter() {
                                if doc.id.to_lowercase().contains(&query_lower)
                                    || doc.title.to_lowercase().contains(&query_lower)
                                {
                                    results.push(serde_json::json!({
                                        "id": doc.id,
                                        "title": doc.title,
                                        "type": "document",
                                        "page": format!("/documents/{}", doc.id),
                                    }));
                                }
                            }

                            results.truncate(50);
                        }

                        connection.sender.send(Message::Response(Response {
                            id: req.id,
                            result: Some(serde_json::json!({ "results": results })),
                            error: None,
                        }))?;
                    }
                    _ => {
                        eprintln!("rivet lsp: unhandled request: {method}");
                        connection.sender.send(Message::Response(Response {
                            id: req.id,
                            result: Some(serde_json::Value::Null),
                            error: None,
                        }))?;
                    }
                }
            }
            Message::Notification(notif) => {
                match notif.method.as_str() {
                    "textDocument/didSave" => {
                        if let Ok(params) = serde_json::from_value::<DidSaveTextDocumentParams>(
                            notif.params.clone(),
                        ) {
                            let path = lsp_uri_to_path(&params.text_document.uri);
                            if let Some(path) = path {
                                let path_str = path.to_string_lossy().to_string();
                                // Read the saved file content from disk
                                let content = std::fs::read_to_string(&path).unwrap_or_default();
                                let updated =
                                    db.update_source(source_set, &path_str, content.clone());
                                if !updated {
                                    // New file not yet tracked — add it to the source set
                                    if path_str.ends_with(".yaml") || path_str.ends_with(".yml") {
                                        db.add_source(source_set, &path_str, content);
                                        eprintln!("rivet lsp: added new source file: {}", path_str);
                                    }
                                }
                                // Re-query diagnostics (salsa recomputes only what changed)
                                let new_diagnostics = db.diagnostics(source_set, schema_set);
                                let new_store = db.store(source_set);
                                lsp_publish_salsa_diagnostics(
                                    &connection,
                                    &new_diagnostics,
                                    &new_store,
                                    &mut prev_diagnostic_files,
                                );
                                eprintln!(
                                    "rivet lsp: incremental revalidation complete ({} diagnostics, {} artifacts)",
                                    new_diagnostics.len(),
                                    new_store.len()
                                );

                                // Rebuild render state
                                render_store = db.store(source_set);
                                let render_schema = db.schema(schema_set);
                                render_graph = rivet_core::links::LinkGraph::build(
                                    &render_store,
                                    &render_schema,
                                );
                                diagnostics_cache = db.diagnostics(source_set, schema_set);

                                // Send artifactsChanged notification
                                let changed_notification = lsp_server::Notification {
                                    method: "rivet/artifactsChanged".to_string(),
                                    params: serde_json::json!({
                                        "artifactCount": render_store.len(),
                                        "documentCount": doc_store.len(),
                                        "changedFiles": [path_str.clone()]
                                    }),
                                };
                                connection
                                    .sender
                                    .send(Message::Notification(changed_notification))?;
                            }
                        }
                    }
                    "textDocument/didChange" => {
                        // Text sync is FULL, so each change provides the complete document
                        if let Ok(params) = serde_json::from_value::<DidChangeTextDocumentParams>(
                            notif.params.clone(),
                        ) {
                            let path = lsp_uri_to_path(&params.text_document.uri);
                            if let Some(path) = path {
                                let path_str = path.to_string_lossy().to_string();
                                // With FULL sync, the last content change is the whole document
                                if let Some(change) = params.content_changes.last() {
                                    let updated = db.update_source(
                                        source_set,
                                        &path_str,
                                        change.text.clone(),
                                    );
                                    if updated {
                                        // Re-query diagnostics incrementally
                                        let diagnostics = db.diagnostics(source_set, schema_set);
                                        let store = db.store(source_set);
                                        lsp_publish_salsa_diagnostics(
                                            &connection,
                                            &diagnostics,
                                            &store,
                                            &mut prev_diagnostic_files,
                                        );
                                    }
                                }
                            }
                        }
                    }
                    _ => {}
                }
            }
            Message::Response(_) => {}
        }
    }

    io_threads.join()?;
    eprintln!("rivet lsp: shut down");
    Ok(true)
}

// ── LSP helpers ──────────────────────────────────────────────────────────

fn lsp_uri_to_path(uri: &lsp_types::Uri) -> Option<std::path::PathBuf> {
    let s = uri.as_str();
    s.strip_prefix("file://").map(std::path::PathBuf::from)
}

fn lsp_path_to_uri(path: &std::path::Path) -> Option<lsp_types::Uri> {
    let s = format!("file://{}", path.display());
    s.parse().ok()
}

fn lsp_find_artifact_line(path: &std::path::Path, artifact_id: &str) -> u32 {
    std::fs::read_to_string(path)
        .unwrap_or_default()
        .lines()
        .enumerate()
        .find(|(_, line)| {
            let t = line.trim();
            t == format!("id: {artifact_id}") || t == format!("- id: {artifact_id}")
        })
        .map(|(i, _)| i as u32)
        .unwrap_or(0)
}

fn lsp_word_at_position(content: &str, line: u32, character: u32) -> String {
    content
        .lines()
        .nth(line as usize)
        .map(|l| {
            let chars: Vec<char> = l.chars().collect();
            let pos = (character as usize).min(chars.len());
            let start = (0..pos)
                .rev()
                .find(|&i| {
                    !chars
                        .get(i)
                        .map(|c| c.is_alphanumeric() || *c == '-' || *c == '_')
                        .unwrap_or(false)
                })
                .map(|i| i + 1)
                .unwrap_or(0);
            let end = (pos..chars.len())
                .find(|&i| {
                    !chars
                        .get(i)
                        .map(|c| c.is_alphanumeric() || *c == '-' || *c == '_')
                        .unwrap_or(false)
                })
                .unwrap_or(chars.len());
            chars[start..end].iter().collect()
        })
        .unwrap_or_default()
}

/// Publish diagnostics from salsa's incremental validation output.
///
/// Takes pre-computed diagnostics and the current store (both from salsa),
/// maps them to LSP diagnostic notifications grouped by source file.
///
/// `prev_diagnostic_files` tracks which files had diagnostics on the previous
/// call. Files that previously had diagnostics but no longer do receive an
/// explicit empty publish, clearing stale markers in the editor. This handles
/// the cross-file case: fixing a broken link in file A clears diagnostics in
/// file B that referenced A, even if B has no artifacts being reloaded.
fn lsp_publish_salsa_diagnostics(
    connection: &lsp_server::Connection,
    diagnostics: &[validate::Diagnostic],
    store: &Store,
    prev_diagnostic_files: &mut std::collections::HashSet<std::path::PathBuf>,
) {
    use lsp_types::*;

    let mut file_diags: std::collections::HashMap<std::path::PathBuf, Vec<lsp_types::Diagnostic>> =
        std::collections::HashMap::new();

    for diag in diagnostics {
        let art_id = match diag.artifact_id {
            Some(ref id) => id.as_str(),
            None => continue,
        };
        let art = store.get(art_id);
        let source_file = art.and_then(|a| a.source_file.as_ref());
        if let Some(path) = source_file {
            let line = lsp_find_artifact_line(path, art_id);
            file_diags
                .entry(path.clone())
                .or_default()
                .push(lsp_types::Diagnostic {
                    range: Range {
                        start: Position { line, character: 0 },
                        end: Position {
                            line,
                            character: 100,
                        },
                    },
                    severity: Some(match diag.severity {
                        rivet_core::schema::Severity::Error => DiagnosticSeverity::ERROR,
                        rivet_core::schema::Severity::Warning => DiagnosticSeverity::WARNING,
                        rivet_core::schema::Severity::Info => DiagnosticSeverity::INFORMATION,
                    }),
                    source: Some("rivet".to_string()),
                    message: diag.message.clone(),
                    ..Default::default()
                });
        }
    }

    // Publish diagnostics for files that currently have them
    for (path, diags) in &file_diags {
        if let Some(uri) = lsp_path_to_uri(path) {
            let params = PublishDiagnosticsParams {
                uri,
                diagnostics: diags.clone(),
                version: None,
            };
            let _ = connection.sender.send(lsp_server::Message::Notification(
                lsp_server::Notification {
                    method: "textDocument/publishDiagnostics".to_string(),
                    params: serde_json::to_value(params).unwrap(),
                },
            ));
        }
    }

    // Clear diagnostics for files that had them last time but no longer do.
    // This covers cross-file cases (e.g. fixing a broken link in ucas.yaml
    // clears stale errors in controller-constraints.yaml) and also the edge
    // case where a file's artifacts were removed from the store entirely.
    for path in prev_diagnostic_files.iter() {
        if !file_diags.contains_key(path) {
            if let Some(uri) = lsp_path_to_uri(path) {
                let params = PublishDiagnosticsParams {
                    uri,
                    diagnostics: Vec::new(),
                    version: None,
                };
                let _ = connection.sender.send(lsp_server::Message::Notification(
                    lsp_server::Notification {
                        method: "textDocument/publishDiagnostics".to_string(),
                        params: serde_json::to_value(params).unwrap(),
                    },
                ));
            }
        }
    }

    // Update the tracked set to reflect this publish cycle
    *prev_diagnostic_files = file_diags.keys().cloned().collect();

    eprintln!(
        "rivet lsp: published {} diagnostics across {} files",
        diagnostics.len(),
        file_diags.len()
    );
}

fn lsp_hover(params: &lsp_types::HoverParams, store: &Store) -> Option<lsp_types::Hover> {
    let uri = &params.text_document_position_params.text_document.uri;
    let pos = params.text_document_position_params.position;
    let path = lsp_uri_to_path(uri)?;
    let content = std::fs::read_to_string(&path).ok()?;
    let word = lsp_word_at_position(&content, pos.line, pos.character);

    let art = store.get(&word)?;
    let mut md = format!("**{}** `{}`\n\n", art.title, art.artifact_type);
    if let Some(ref desc) = art.description {
        let short = if desc.len() > 300 {
            format!("{}...", &desc[..300])
        } else {
            desc.clone()
        };
        md.push_str(&short);
        md.push('\n');
    }
    md.push_str(&format!(
        "\nStatus: `{}`",
        art.status.as_deref().unwrap_or("—")
    ));
    if !art.links.is_empty() {
        md.push_str(&format!(" | Links: {}", art.links.len()));
    }
    if !art.tags.is_empty() {
        md.push_str(&format!(" | Tags: {}", art.tags.join(", ")));
    }

    Some(lsp_types::Hover {
        contents: lsp_types::HoverContents::Markup(lsp_types::MarkupContent {
            kind: lsp_types::MarkupKind::Markdown,
            value: md,
        }),
        range: None,
    })
}

fn lsp_goto_definition(
    params: &lsp_types::GotoDefinitionParams,
    store: &Store,
) -> Option<lsp_types::Location> {
    let uri = &params.text_document_position_params.text_document.uri;
    let pos = params.text_document_position_params.position;
    let path = lsp_uri_to_path(uri)?;
    let content = std::fs::read_to_string(&path).ok()?;
    let word = lsp_word_at_position(&content, pos.line, pos.character);

    let art = store.get(&word)?;
    let source = art.source_file.as_ref()?;
    let line = lsp_find_artifact_line(source, &word);
    let target_uri = lsp_path_to_uri(source)?;

    Some(lsp_types::Location {
        uri: target_uri,
        range: lsp_types::Range {
            start: lsp_types::Position { line, character: 0 },
            end: lsp_types::Position { line, character: 0 },
        },
    })
}

fn lsp_completion(
    params: &lsp_types::CompletionParams,
    store: &Store,
    schema: &rivet_core::schema::Schema,
) -> Option<lsp_types::CompletionList> {
    let uri = &params.text_document_position.text_document.uri;
    let pos = params.text_document_position.position;
    let path = lsp_uri_to_path(uri)?;
    let content = std::fs::read_to_string(&path).ok()?;
    let line_text = content.lines().nth(pos.line as usize).unwrap_or("");
    let trimmed = line_text.trim();

    let mut items = Vec::new();

    if trimmed.starts_with("target:") || trimmed.starts_with("- target:") || trimmed.contains("[[")
    {
        // Suggest artifact IDs
        for art in store.iter() {
            items.push(lsp_types::CompletionItem {
                label: art.id.clone(),
                kind: Some(lsp_types::CompletionItemKind::REFERENCE),
                detail: Some(format!("{} ({})", art.title, art.artifact_type)),
                ..Default::default()
            });
        }
    } else if trimmed.starts_with("type:") || trimmed.starts_with("- type:") {
        // Suggest artifact types seen in the store
        let mut types: Vec<String> = store.types().map(|t| t.to_string()).collect();
        types.sort();
        types.dedup();
        for t in types {
            let desc = schema.artifact_type(&t).map(|td| td.description.clone());
            items.push(lsp_types::CompletionItem {
                label: t,
                kind: Some(lsp_types::CompletionItemKind::CLASS),
                detail: desc,
                ..Default::default()
            });
        }
    }

    Some(lsp_types::CompletionList {
        is_incomplete: false,
        items,
    })
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
