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
mod mcp;
mod render;
mod schema_cmd;
mod serve;

/// Validate that a `--format` value is one of the accepted options.
fn validate_format(format: &str, valid: &[&str]) -> Result<()> {
    if valid.contains(&format) {
        Ok(())
    } else {
        anyhow::bail!(
            "invalid format '{}' — valid options: {}",
            format,
            valid.join(", ")
        );
    }
}

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

        /// Preset: dev (default), aspice, stpa, cybersecurity, aadl, do-178c, en-50128
        /// Preset: dev (default), aspice, stpa, cybersecurity, aadl, iec-61508, iec-62304
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

        /// With --agents: wrap existing AGENTS.md/CLAUDE.md content with
        /// rivet-managed markers (the generated section goes on top, the
        /// previous content is preserved verbatim below).
        #[arg(long, requires = "agents")]
        migrate: bool,

        /// With --agents: overwrite existing AGENTS.md/CLAUDE.md even if
        /// they have no rivet-managed markers. DESTRUCTIVE — replaces the
        /// whole file. Prefer --migrate when possible.
        #[arg(long, requires = "agents")]
        force_regen: bool,

        /// Install git hooks (commit-msg, pre-commit) that call rivet for validation
        #[arg(long)]
        hooks: bool,
    },

    /// Validate artifacts against schemas
    Validate {
        /// Output format: "text" (default) or "json"
        #[arg(short, long, default_value = "text")]
        format: String,

        /// Use direct (non-incremental) validation instead of the default salsa path
        #[arg(long)]
        direct: bool,

        /// Skip cross-repo validation (broken external refs, backlinks, circular deps, version conflicts)
        #[arg(long)]
        skip_external_validation: bool,

        /// Scope validation to a named baseline (cumulative)
        #[arg(long)]
        baseline: Option<String>,

        /// Track failure convergence across runs to detect agent retry loops
        #[arg(long)]
        track_convergence: bool,

        /// Path to feature model YAML file (enables variant-scoped validation)
        #[arg(long)]
        model: Option<PathBuf>,

        /// Path to variant configuration YAML file
        #[arg(long)]
        variant: Option<PathBuf>,

        /// Path to feature-to-artifact binding YAML file
        #[arg(long)]
        binding: Option<PathBuf>,
    },

    /// Show a single artifact by ID
    Get {
        /// Artifact ID to retrieve
        id: String,

        /// Output format: "text" (default), "json", or "yaml"
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

        /// S-expression filter, e.g. '(and (= type "requirement") (has-tag "stpa"))'
        #[arg(long)]
        filter: Option<String>,

        /// Output format: "text" (default) or "json"
        #[arg(short, long, default_value = "text")]
        format: String,

        /// Scope listing to a named baseline (cumulative)
        #[arg(long)]
        baseline: Option<String>,
    },

    /// Show artifact summary statistics
    Stats {
        /// S-expression filter to scope statistics
        #[arg(long)]
        filter: Option<String>,

        /// Output format: "text" (default) or "json"
        #[arg(short, long, default_value = "text")]
        format: String,

        /// Scope statistics to a named baseline (cumulative)
        #[arg(long)]
        baseline: Option<String>,
    },

    /// Show traceability coverage report
    Coverage {
        /// S-expression filter to scope coverage
        #[arg(long)]
        filter: Option<String>,

        /// Output format: "text" (default) or "json"
        #[arg(short, long, default_value = "text")]
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
        /// Output format: "reqif", "generic-yaml", "html", "zola"
        #[arg(short, long)]
        format: String,

        /// Output path: file for reqif/generic-yaml, directory for html/zola (default: "dist")
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

        /// Prefix for Zola export: content goes under content/<prefix>/ and data/<prefix>/
        #[arg(long, default_value = "rivet")]
        prefix: String,

        /// S-expression filter to select artifact subset for export
        #[arg(long)]
        filter: Option<String>,

        /// Install rivet_* shortcode templates into templates/shortcodes/ (Zola only)
        #[arg(long)]
        shortcodes: bool,

        /// Remove existing content/<prefix>/ before writing (prevents stale pages)
        #[arg(long)]
        clean: bool,
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

        /// List available topics (same as `rivet docs` with no args)
        #[arg(long)]
        list: bool,

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

    /// Product line variant management (feature model + constraint solver).
    ///
    /// YAML schema reference: docs/feature-model-schema.md.
    /// Binding file format:   docs/feature-model-bindings.md.
    Variant {
        #[command(subcommand)]
        action: VariantAction,
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
        /// Input format: "junit" (JUnit XML) or "needs-json" (sphinx-needs)
        #[arg(long)]
        format: String,

        /// Input file path
        file: PathBuf,

        /// Output directory for YAML files (default: results/)
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

    /// Stamp artifact(s) with AI provenance metadata
    Stamp {
        /// Artifact ID to stamp (or "all" for all artifacts in a file)
        id: String,
        /// Who created it: "human", "ai", or "ai-assisted"
        #[arg(long, default_value = "ai-assisted")]
        created_by: String,
        /// AI model used (e.g., "claude-opus-4-6")
        #[arg(long)]
        model: Option<String>,
        /// Session identifier
        #[arg(long)]
        session_id: Option<String>,
        /// Human reviewer
        #[arg(long)]
        reviewed_by: Option<String>,
    },

    /// Start the language server (LSP over stdio)
    Lsp,

    /// Start the MCP server (stdio transport)
    Mcp,
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
    /// Validate that loaded schemas are well-formed
    Validate,
    /// Show schema-level metadata and summary
    Info {
        /// Schema name (e.g., "stpa", "dev", "common")
        name: String,
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

#[derive(Subcommand)]
enum VariantAction {
    /// Scaffold a starter feature-model.yaml + bindings/<name>.yaml with
    /// commented fields. See docs/feature-model-schema.md.
    Init {
        /// Variant / project name (used for the bindings file name).
        name: String,

        /// Target directory (default: current directory).
        #[arg(long, default_value = ".")]
        dir: PathBuf,

        /// Overwrite existing files.
        #[arg(long)]
        force: bool,
    },
    /// Check a variant configuration against a feature model
    Check {
        /// Path to feature model YAML file
        #[arg(long)]
        model: PathBuf,

        /// Path to variant configuration YAML file
        #[arg(long)]
        variant: PathBuf,

        /// Output format: "text" (default) or "json"
        #[arg(short, long, default_value = "text")]
        format: String,
    },
    /// List features in a feature model
    List {
        /// Path to feature model YAML file
        #[arg(long)]
        model: PathBuf,

        /// Output format: "text" (default) or "json"
        #[arg(short, long, default_value = "text")]
        format: String,
    },
    /// Solve: propagate a variant selection and show effective features
    Solve {
        /// Path to feature model YAML file
        #[arg(long)]
        model: PathBuf,

        /// Path to variant configuration YAML file
        #[arg(long)]
        variant: PathBuf,

        /// Path to binding model YAML file (optional)
        #[arg(long)]
        binding: Option<PathBuf>,

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
    if let Command::Init {
        name,
        preset,
        schema,
        dir,
        agents,
        migrate,
        force_regen,
        hooks,
    } = &cli.command
    {
        if *agents {
            return cmd_init_agents(&cli, *migrate, *force_regen);
        }
        if *hooks {
            return cmd_init_hooks(dir);
        }
        return cmd_init(name.as_deref(), preset, schema, dir);
    }
    if let Command::Docs {
        topic,
        list,
        grep,
        format,
        context,
    } = &cli.command
    {
        return cmd_docs(topic.as_deref(), *list, grep.as_deref(), format, *context);
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
    if let Command::Mcp = &cli.command {
        return cmd_mcp(&cli);
    }

    match &cli.command {
        Command::Init { .. }
        | Command::Docs { .. }
        | Command::Context
        | Command::CommitMsgCheck { .. }
        | Command::Lsp
        | Command::Mcp => unreachable!(),
        Command::Stpa { path, schema } => cmd_stpa(path, schema.as_deref(), &cli),
        Command::Validate {
            format,
            direct,
            skip_external_validation,
            baseline,
            track_convergence,
            model,
            variant,
            binding,
        } => cmd_validate(
            &cli,
            format,
            *direct,
            *skip_external_validation,
            baseline.as_deref(),
            *track_convergence,
            model.as_deref(),
            variant.as_deref(),
            binding.as_deref(),
        ),
        Command::List {
            r#type,
            status,
            filter,
            format,
            baseline,
        } => cmd_list(
            &cli,
            r#type.as_deref(),
            status.as_deref(),
            filter.as_deref(),
            format,
            baseline.as_deref(),
        ),
        Command::Get { id, format } => cmd_get(&cli, id, format),
        Command::Stats {
            filter,
            format,
            baseline,
        } => cmd_stats(&cli, filter.as_deref(), format, baseline.as_deref()),
        Command::Coverage {
            filter,
            format,
            fail_under,
            tests,
            scan_paths,
            baseline,
        } => {
            if *tests {
                cmd_coverage_tests(&cli, format, scan_paths)
            } else {
                cmd_coverage(
                    &cli,
                    filter.as_deref(),
                    format,
                    fail_under.as_ref(),
                    baseline.as_deref(),
                )
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
            prefix,
            filter,
            shortcodes,
            clean,
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
            prefix,
            filter.as_deref(),
            *shortcodes,
            *clean,
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
            let schemas_dir = resolve_schemas_dir(&cli);
            let project_path =
                std::fs::canonicalize(&cli.project).unwrap_or_else(|_| cli.project.clone());
            let app_state = serve::reload_state(&project_path, &schemas_dir, port)?;
            let rt = tokio::runtime::Runtime::new().context("failed to create tokio runtime")?;
            rt.block_on(serve::run(app_state, bind, watch))?;
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
        Command::Variant { action } => match action {
            VariantAction::Init { name, dir, force } => cmd_variant_init(name, dir, *force),
            VariantAction::Check {
                model,
                variant,
                format,
            } => cmd_variant_check(model, variant, format),
            VariantAction::List { model, format } => cmd_variant_list(model, format),
            VariantAction::Solve {
                model,
                variant,
                binding,
                format,
            } => cmd_variant_solve(&cli, model, variant, binding.as_deref(), format),
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
        Command::Stamp {
            id,
            created_by,
            model,
            session_id,
            reviewed_by,
        } => cmd_stamp(
            &cli,
            id,
            created_by,
            model.as_deref(),
            session_id.as_deref(),
            reviewed_by.as_deref(),
        ),
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
        "eu-ai-act" => Ok(InitPreset {
            schemas: vec!["common", "eu-ai-act"],
            sample_files: vec![("ai-system.yaml", EU_AI_ACT_SAMPLE)],
        }),
        "safety-case" => Ok(InitPreset {
            schemas: vec!["common", "safety-case"],
            sample_files: vec![("safety-case.yaml", SAFETY_CASE_SAMPLE)],
        }),
        "stpa-ai" => Ok(InitPreset {
            schemas: vec!["common", "stpa", "stpa-ai"],
            sample_files: vec![("ml-safety.yaml", STPA_AI_SAMPLE)],
        }),
        "do-178c" => Ok(InitPreset {
            schemas: vec!["common", "do-178c"],
            sample_files: vec![("airborne-sw.yaml", DO_178C_SAMPLE)],
        }),
        "en-50128" => Ok(InitPreset {
            schemas: vec!["common", "en-50128"],
            sample_files: vec![("railway-sw.yaml", EN_50128_SAMPLE)],
        }),
        "iec-61508" => Ok(InitPreset {
            schemas: vec!["common", "iec-61508"],
            sample_files: vec![("safety.yaml", IEC_61508_SAMPLE)],
        }),
        "iec-62304" => Ok(InitPreset {
            schemas: vec!["common", "iec-62304"],
            sample_files: vec![("medical-sw.yaml", IEC_62304_SAMPLE)],
        }),
        "iso-pas-8800" => Ok(InitPreset {
            schemas: vec!["common", "iso-pas-8800"],
            sample_files: vec![("ai-safety.yaml", ISO_PAS_8800_SAMPLE)],
        }),
        "sotif" => Ok(InitPreset {
            schemas: vec!["common", "sotif"],
            sample_files: vec![("sotif-analysis.yaml", SOTIF_SAMPLE)],
        }),
        other => anyhow::bail!(
            "unknown preset: '{other}' (valid: dev, aspice, stpa, stpa-ai, cybersecurity, aadl, eu-ai-act, safety-case, do-178c, en-50128, iec-61508, iec-62304, iso-pas-8800, sotif)"
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

const EU_AI_ACT_SAMPLE: &str = "\
artifacts:
  - id: AI-SYS-001
    type: ai-system-description
    title: AI-Powered Decision Support System
    status: draft
    description: >
      High-risk AI system providing automated recommendations
      for resource allocation in critical infrastructure.
    fields:
      intended-purpose: >
        Real-time analysis of infrastructure telemetry to recommend
        maintenance schedules and resource allocation priorities.
      provider: Example Corp
      risk-class: high-risk

  - id: DS-001
    type: design-specification
    title: Core prediction model design
    status: draft
    description: >
      Gradient-boosted decision tree ensemble for predictive maintenance.
    fields:
      algorithms: >
        XGBoost ensemble with 500 estimators, max depth 8.
        Features: sensor readings, maintenance history, environmental data.
      design-choices: >
        Tree-based model chosen over neural network for interpretability
        and compliance with Art. 13 transparency requirements.
    links:
      - type: satisfies
        target: AI-SYS-001

  - id: DGR-001
    type: data-governance-record
    title: Training data governance
    status: draft
    fields:
      data-sources: >
        3 years of operational telemetry from 200 installations.
        Anonymized maintenance logs from partner organizations.
      collection-method: Automated SCADA export + manual maintenance log entry
      bias-assessment: >
        Geographic bias identified: 80% of data from Northern Europe.
        Mitigation: stratified sampling + synthetic augmentation for
        underrepresented regions.
    links:
      - type: governs
        target: DS-001

  - id: RMP-001
    type: risk-management-process
    title: Continuous risk management
    status: draft
    fields:
      scope: >
        All risks related to the AI system's predictions affecting
        critical infrastructure maintenance decisions.
      methodology: >
        Iterative risk identification using FMEA + STPA hybrid approach.
        Quarterly review cycle with incident-driven ad-hoc reviews.
    links:
      - type: manages-risk-for
        target: AI-SYS-001

  - id: RA-001
    type: risk-assessment
    title: Incorrect maintenance deferral recommendation
    status: draft
    fields:
      risk-description: >
        System recommends deferring maintenance on critical component
        that subsequently fails, causing infrastructure outage.
      likelihood: possible
      severity: major
      risk-level: high
      affected-rights: >
        Right to safety (Art. 6 EU Charter).
        Potential impact on public infrastructure availability.
    links:
      - type: leads-to
        target: AI-SYS-001

  - id: RM-001
    type: risk-mitigation
    title: Confidence threshold with mandatory human review
    status: draft
    fields:
      measure-description: >
        Recommendations below 85% confidence require mandatory human
        engineer review before execution. All critical component
        deferrals require dual sign-off regardless of confidence.
      residual-risk: >
        Human reviewer may rubber-stamp recommendation under time
        pressure. Mitigated by mandatory cooling-off period.
    links:
      - type: mitigates
        target: RA-001

  - id: MON-001
    type: monitoring-measure
    title: Real-time prediction drift monitoring
    status: draft
    fields:
      mechanism-type: drift-detection
      logging-scope: >
        All predictions logged with input features, confidence score,
        and actual outcome (when known). PSI drift score computed daily.
      alert-conditions: >
        Alert when PSI > 0.2 on any feature group or when prediction
        accuracy drops below 90% over rolling 30-day window.
    links:
      - type: monitors
        target: AI-SYS-001

  - id: HO-001
    type: human-oversight-measure
    title: Operator dashboard with override capability
    status: draft
    fields:
      oversight-type: intervention
      capability-description: >
        Operators can view all pending recommendations, inspect the
        reasoning (feature importance), and override or defer any
        recommendation. Emergency shutdown available via dashboard.
    links:
      - type: overseen-by
        target: AI-SYS-001

  - id: TRANS-001
    type: transparency-record
    title: Deployer information package
    status: draft
    fields:
      information-scope: >
        Model card, training data summary, known limitations,
        performance metrics by population subgroup.
      limitations-disclosed: >
        Model trained primarily on Northern European data.
        Performance may degrade for tropical climate installations.
        Not validated for installations older than 20 years.
    links:
      - type: transparency-for
        target: AI-SYS-001
";

const SAFETY_CASE_SAMPLE: &str = "\
artifacts:
  - id: G-001
    type: safety-goal
    title: System is acceptably safe for intended operation
    status: draft
    description: >
      Top-level safety claim for the system under analysis.
    fields:
      claim: >
        The system is acceptably safe for its intended operation,
        considering all identified hazards and operational conditions.
      goal-type: system-level

  - id: C-001
    type: safety-context
    title: Operating environment definition
    status: draft
    fields:
      context-type: scope
      statement: >
        The system operates within its defined operational design domain.
        All identified hazards have been analysed using systematic methods.
    links:
      - type: scopes
        target: G-001

  - id: S-001
    type: safety-strategy
    title: Argue over identified hazards
    status: draft
    fields:
      rationale: >
        Decompose the top-level safety goal by arguing that each
        identified hazard is adequately mitigated through design
        measures and verified by evidence.
      method: decomposition
    links:
      - type: decomposes
        target: G-001

  - id: G-002
    type: safety-goal
    title: Hazard H-001 is adequately mitigated
    status: draft
    fields:
      claim: >
        The identified hazard is mitigated to an acceptable level
        through design measures and operational constraints.
      goal-type: derived
    links:
      - type: sub-goal-of
        target: G-001

  - id: Sn-001
    type: safety-solution
    title: Verification test report for hazard mitigation
    status: draft
    fields:
      evidence-type: test-report
      evidence-ref: TR-001
      confidence: high
    links:
      - type: supports
        target: G-002
";

const STPA_AI_SAMPLE: &str = "\
artifacts:
  - id: L-001
    type: loss
    title: Loss of pedestrian safety
    status: draft
    description: >
      Pedestrian is struck by autonomous vehicle due to perception
      or decision failure, resulting in injury or death.
    fields:
      stakeholders: [pedestrians, vehicle-occupants, operator]

  - id: H-001
    type: hazard
    title: Vehicle fails to stop for pedestrian in crosswalk
    status: draft
    description: >
      Vehicle does not decelerate when a pedestrian is present in
      the planned trajectory, leading to L-001.
    fields:
      severity: catastrophic
    links:
      - type: leads-to-loss
        target: L-001

  - id: CTRL-001
    type: controller
    title: Perception and braking controller
    status: draft
    description: >
      Automated controller responsible for detecting obstacles and
      issuing brake commands.
    fields:
      controller-type: automated

  - id: ML-CTRL-001
    type: ml-controller
    title: Pedestrian detection CNN
    status: draft
    description: >
      Convolutional neural network that detects pedestrians in camera
      frames and outputs bounding boxes with confidence scores.
    fields:
      model-type: cnn
      training-framework: PyTorch
      inference-latency-ms: 35
    links:
      - type: refines
        target: CTRL-001

  - id: TDS-001
    type: training-data-source
    title: Pedestrian detection training dataset
    status: draft
    description: >
      Combined dataset of urban driving scenes with annotated
      pedestrian bounding boxes.
    fields:
      data-sources: >
        NuScenes (40k frames), internal fleet recordings (120k frames),
        synthetic scenes from CARLA simulator (80k frames).
      collection-method: >
        Fleet vehicles equipped with front-facing cameras. Frames
        sampled at 2 Hz during urban driving. Synthetic data generated
        with randomized pedestrian models and lighting.
      labeling-method: Semi-automated with human QA review
      size: 240k annotated frames
      bias-assessment: >
        Under-representation of wheelchair users and children under 5.
        Night-time scenes are 15% of dataset vs 30% of operating hours.
        Mitigation: targeted collection campaign planned for Q3.
      distribution-characteristics: >
        70% daytime, 15% dusk/dawn, 15% night. Urban environments only.
    links:
      - type: trains
        target: ML-CTRL-001

  - id: DH-001
    type: data-hazard
    title: Insufficient night-time pedestrian coverage
    status: draft
    description: >
      Training data under-represents night-time conditions, risking
      degraded detection performance in low-light scenarios.
    fields:
      hazard-category: insufficient-coverage
      affected-population: Pedestrians in low-light conditions
    links:
      - type: leads-to-hazard
        target: H-001

  - id: UCA-001
    type: uca
    title: Controller does not issue brake when pedestrian detected
    status: draft
    description: >
      Not providing a brake command when a pedestrian is detected
      in the vehicle path leads to H-001.
    fields:
      uca-type: not-providing
      context: >
        Pedestrian is in crosswalk, vehicle approaching at city speed.
    links:
      - type: issued-by
        target: CTRL-001
      - type: leads-to-hazard
        target: H-001

  - id: ML-UCA-001
    type: ml-uca
    title: CNN misclassifies pedestrian as background at night
    status: draft
    description: >
      The pedestrian detection model fails to detect a pedestrian
      in low-light conditions due to distribution gap in training data.
    fields:
      ml-failure-mode: misclassification
      operational-design-domain: >
        Urban roads, speed below 50 km/h, ambient light above 1 lux.
    links:
      - type: refines
        target: UCA-001

  - id: MON-001
    type: monitoring-trigger
    title: Detection accuracy drop monitor
    status: draft
    description: >
      Monitors real-time pedestrian detection accuracy against
      ground-truth from shadow-mode lidar cross-check.
    fields:
      metric-name: pedestrian-recall
      threshold: accuracy below 0.95 over rolling 7-day window
      detection-method: >
        Lidar-based shadow detector provides ground-truth labels;
        camera detections compared daily.
    links:
      - type: monitors
        target: ML-CTRL-001

  - id: RTR-001
    type: retraining-requirement
    title: Retrain on low-light failures
    status: draft
    description: >
      When night-time recall drops below threshold, retrain with
      augmented low-light dataset.
    fields:
      trigger-condition: >
        Pedestrian recall at night (ambient light < 10 lux) falls
        below 0.93 for 3 consecutive days.
      validation-criteria: >
        Retrained model must achieve >= 0.96 recall on night-time
        holdout set and not regress on daytime recall (>= 0.98).
      data-requirements: >
        Minimum 20k additional night-time frames with pedestrian
        annotations from diverse urban environments.
    links:
      - type: satisfies
        target: MON-001
";

const DO_178C_SAMPLE: &str = "\
artifacts:
  - id: PSAC-001
    type: plan-for-sw-aspects
    title: Plan for Software Aspects of Certification
    status: draft
    description: >
      PSAC for the flight management software, DAL B.
    fields:
      dal: B

  - id: HLR-001
    type: hw-sw-req
    title: System shall compute flight path within 100ms
    status: draft
    description: >
      The flight management software shall compute an updated
      flight path within 100ms of receiving new navigation data.
    fields:
      dal: B
      derived: false

  - id: LLR-001
    type: lw-sw-req
    title: Path solver shall use WGS-84 geodetic model
    status: draft
    description: >
      The path computation module shall use the WGS-84 geodetic
      model for all coordinate transformations.
    fields:
      dal: B

  - id: DES-001
    type: sw-design
    title: Path computation module design
    status: draft
    description: >
      Architectural design of the path computation module,
      including data flow and timing constraints.
    links:
      - type: satisfies
        target: HLR-001

  - id: TC-001
    type: hw-sw-test-case
    title: Verify flight path computation timing
    status: draft
    description: >
      Test that flight path is computed within 100ms under
      maximum navigation data rate.
    links:
      - type: verifies
        target: HLR-001
";

const EN_50128_SAMPLE: &str = "\
artifacts:
  - id: SIL-001
    type: sw-safety-integrity-req
    title: Interlocking software SIL 4
    status: draft
    description: >
      The interlocking control software shall be developed to SIL 4
      as determined by the system hazard analysis.
    fields:
      sil: SIL-4

  - id: SWREQ-001
    type: sw-req-spec
    title: Route locking shall prevent conflicting movements
    status: draft
    description: >
      The software shall ensure that no two conflicting train
      movements can be simultaneously authorised on overlapping
      track sections.
    links:
      - type: derives-from
        target: SIL-001

  - id: ARCH-001
    type: sw-arch-spec
    title: Interlocking software architecture
    status: draft
    description: >
      Diverse redundant architecture with two independent
      processing channels and a comparator.
    fields:
      architecture-technique: diverse-redundancy

  - id: COMP-001
    type: sw-component
    title: Route conflict checker module
    status: draft
    description: >
      Module implementing route conflict detection logic for
      the primary processing channel.
    links:
      - type: implements
        target: DSGN-001

  - id: DSGN-001
    type: sw-design-spec
    title: Route conflict checker design
    status: draft
    description: >
      Detailed design of the route conflict detection algorithm.

  - id: MT-001
    type: sw-module-test
    title: Route conflict checker module test
    status: draft
    description: >
      Unit tests verifying the route conflict checker against
      all defined conflict scenarios.
    links:
      - type: verifies
        target: COMP-001
";

const IEC_61508_SAMPLE: &str = "\
artifacts:
  - id: SC-001
    type: safety-concept
    title: Emergency shutdown safety concept
    status: draft
    description: >
      Overall safety strategy for the emergency shutdown system
      targeting SIL 3 integrity.
    fields:
      sil-target: SIL-3
      scope: >
        Covers all safety functions related to emergency shutdown
        of the reactor coolant system.

  - id: SR-001
    type: safety-req
    title: Emergency shutdown shall activate within 500ms
    status: draft
    description: >
      The safety-related system shall initiate emergency shutdown
      within 500ms of detecting an over-pressure condition.
    fields:
      sil: SIL-3
      req-type: functional
      allocation: ESD-Controller
    links:
      - type: derives-from
        target: SC-001

  - id: SF-001
    type: safety-function
    title: Over-pressure emergency shutdown
    status: draft
    description: >
      Detects pressure exceeding 150 bar and actuates shutdown valves
      to bring the system to a safe state.
    fields:
      sil: SIL-3
      response-time: 500ms
      diagnostic-coverage: high
";

const IEC_62304_SAMPLE: &str = "\
artifacts:
  - id: SDP-001
    type: sw-dev-plan
    title: Infusion pump software development plan
    status: draft
    description: >
      Software development plan for the infusion pump control software,
      classified as Class C per IEC 62304.

  - id: SWREQ-001
    type: sw-req
    title: Flow rate accuracy within 5%
    status: draft
    description: >
      The infusion pump software shall control the flow rate to within
      +/- 5% of the set rate under all operating conditions.
    fields:
      sw-class: C
      risk-control: Prevents over-infusion hazard
    links:
      - type: derives-from
        target: SDP-001

  - id: ARCH-001
    type: sw-arch-item
    title: Flow control module
    status: draft
    description: >
      Software module responsible for closed-loop flow rate control,
      fully segregated from non-safety user interface code.
    fields:
      segregation-level: full
";

const ISO_PAS_8800_SAMPLE: &str = "\
artifacts:
  - id: AIE-001
    type: ai-element
    title: Pedestrian detection model
    status: draft
    description: >
      Deep learning model for detecting pedestrians from camera images,
      used as the primary perception element for emergency braking.
    fields:
      ai-type: perception
      safety-relevance: ASIL-D

  - id: AISR-001
    type: ai-safety-req
    title: Pedestrian detection recall requirement
    status: draft
    description: >
      The pedestrian detection model shall achieve a minimum recall of
      99.5% on the operational design domain test dataset.
    fields:
      performance-criterion: >
        Recall (true positive rate) for pedestrian detection across all
        lighting and weather conditions in the operational design domain.
      acceptance-threshold: '>= 0.995'
    links:
      - type: derives-from
        target: AIE-001

  - id: AIAM-001
    type: ai-arch-measure
    title: Lidar-camera redundancy for pedestrian detection
    status: draft
    description: >
      Redundant perception channel using lidar point cloud processing
      to cross-validate camera-based pedestrian detections.
    fields:
      measure-type: redundancy
    links:
      - type: satisfies
        target: AISR-001

  - id: AIDM-001
    type: ai-dev-measure
    title: Formal code review for inference pipeline
    status: draft
    description: >
      All code in the inference pipeline undergoes formal review with
      two independent reviewers per change, following MISRA-C guidelines.
    links:
      - type: satisfies
        target: AISR-001

  - id: AIDR-001
    type: ai-data-req
    title: Training data diversity requirement
    status: draft
    description: >
      Training data must include representative samples from all
      operational design domain conditions.
    fields:
      data-quality-metric: ODD coverage completeness
      min-threshold: '>= 95% of defined ODD conditions represented'
    links:
      - type: governs
        target: AIE-001

  - id: AITR-001
    type: ai-training-record
    title: Pedestrian detector v2.3 training run
    status: draft
    description: >
      Training run for pedestrian detection model version 2.3.
    fields:
      dataset-version: PedDataset-v4.1
      hyperparameters: >
        Learning rate: 1e-4, batch size: 64, epochs: 120,
        optimizer: AdamW, weight decay: 0.01.
      metric-results: >
        Recall: 0.997, precision: 0.993, F1: 0.995,
        mAP@0.5: 0.991, inference latency: 28ms.
    links:
      - type: trains
        target: AIE-001

  - id: AIVERIF-001
    type: ai-verification
    title: Pedestrian detector test suite verification
    status: draft
    description: >
      Verification of the pedestrian detection model against the
      safety requirement using the ODD holdout test set.
    links:
      - type: verifies
        target: AIE-001

  - id: AIVAL-001
    type: ai-validation
    title: Operational validation on test track
    status: draft
    description: >
      Validation of the pedestrian detection system in real-world
      test track scenarios covering all ODD conditions.
    links:
      - type: validates
        target: AIE-001

  - id: AIDEP-001
    type: ai-deployment
    title: ECU deployment configuration for v2.3
    status: draft
    description: >
      Deployment configuration for pedestrian detector v2.3 on the
      target ADAS ECU with TensorRT optimization.
    links:
      - type: deploys
        target: AIE-001

  - id: AIMON-001
    type: ai-monitoring
    title: Runtime detection confidence monitor
    status: draft
    description: >
      Monitors average detection confidence scores and flags anomalies
      indicating potential model degradation in the field.
    links:
      - type: monitors
        target: AIE-001

  - id: AITQ-001
    type: ai-tool-qual
    title: Training framework qualification
    status: draft
    description: >
      Qualification of the PyTorch training framework and custom
      data augmentation pipeline used for model development.
    fields:
      tool-class: TQL-2

  - id: AIAA-001
    type: ai-assurance-argument
    title: Pedestrian detection safety argument
    status: draft
    description: >
      Top-level assurance argument that the pedestrian detection AI
      element meets all safety requirements throughout its lifecycle.
    links:
      - type: argues
        target: AIE-001
";

const SOTIF_SAMPLE: &str = "\
artifacts:
  - id: SH-001
    type: sotif-hazard
    title: Phantom braking from sensor noise
    status: draft
    description: >
      The vehicle performs unnecessary emergency braking due to radar
      ghost targets caused by multi-path reflections from guardrails
      or overhead structures.
    fields:
      insufficiency-type: sensor-limitation

  - id: SH-002
    type: sotif-hazard
    title: Missed pedestrian in cluttered scene
    status: draft
    description: >
      The perception system fails to detect a pedestrian when the
      background is visually complex (e.g. crowded storefronts,
      construction zones), leading to late or absent braking.
    fields:
      insufficiency-type: algorithm-limitation

  - id: STC-001
    type: sotif-triggering-condition
    title: Guardrail multi-path radar reflection
    status: draft
    description: >
      Driving alongside metal guardrails in curves where multi-path
      radar reflections create persistent ghost targets at short range.
    fields:
      environment: >
        Highway curve with metal guardrails, speed 80-120 km/h,
        any weather condition.
      probability: Moderate (estimated 1 in 500 guardrail passages)
    links:
      - type: triggers
        target: SH-001

  - id: STC-002
    type: sotif-triggering-condition
    title: Visually cluttered urban intersection
    status: draft
    description: >
      Urban intersection with overlapping pedestrians, signage, and
      construction equipment that degrades detection confidence.
    fields:
      environment: >
        Urban intersection, daytime, cluttered background with
        construction equipment and dense signage.
      probability: Low (estimated 1 in 2000 urban intersections)
    links:
      - type: triggers
        target: SH-002

  - id: SSCEN-001
    type: sotif-scenario
    title: Curved guardrail ghost target scenario
    status: draft
    description: >
      Test scenario: vehicle travels at 100 km/h through a left-hand
      highway curve with continuous metal guardrail on the right side,
      verifying that no false braking occurs.
    fields:
      scenario-type: known-unsafe
    links:
      - type: exercises
        target: STC-001

  - id: SSCEN-002
    type: sotif-scenario
    title: Cluttered intersection pedestrian detection
    status: draft
    description: >
      Test scenario: pedestrian crosses at an intersection with
      construction scaffolding and dense signage in the background,
      verifying timely detection and braking.
    fields:
      scenario-type: known-unsafe
    links:
      - type: exercises
        target: STC-002

  - id: SAC-001
    type: sotif-acceptance-criterion
    title: False positive braking rate
    status: draft
    description: >
      Acceptance criterion for the maximum allowable rate of false
      positive emergency braking events per million kilometers.
    fields:
      metric: false-positive emergency braking events per million km
      target-value: '< 0.1'

  - id: SVERIF-001
    type: sotif-verification
    title: Radar ghost target analysis
    status: draft
    description: >
      Verification that radar processing algorithms correctly filter
      multi-path reflections in all tested guardrail geometries.
    links:
      - type: verifies
        target: SH-001

  - id: SVERIF-002
    type: sotif-verification
    title: Cluttered scene detection verification
    status: draft
    description: >
      Verification that the perception pipeline maintains required
      detection recall in visually cluttered environments.
    links:
      - type: verifies
        target: SH-002

  - id: SVAL-001
    type: sotif-validation
    title: Field driving residual risk validation
    status: draft
    description: >
      Validation over 10 million km of field driving data confirming
      that false positive braking rate meets the acceptance criterion.
    links:
      - type: validates
        target: SAC-001

  - id: SKU-001
    type: sotif-known-unsafe
    title: Guardrail ghost target mitigation
    status: draft
    description: >
      Mitigation strategy: radar signal processing with guardrail
      geometry model to suppress multi-path ghost targets.
    links:
      - type: mitigates
        target: SH-001

  - id: SUU-001
    type: sotif-unknown-unsafe
    title: Adversarial scene exploration
    status: draft
    description: >
      Strategy for discovering unknown unsafe scenarios using
      adversarial perturbation of sensor inputs in simulation.
    fields:
      exploration-method: adversarial-testing
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

    // Report auto-discovered bridge schemas
    let bridges = rivet_core::embedded::discover_bridges(&schemas);
    if !bridges.is_empty() {
        println!("\n  bridge schemas (auto-loaded at runtime):");
        for bridge in &bridges {
            println!("    + {bridge}");
        }
    }

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

/// Install git hooks that delegate to rivet for commit validation.
///
/// Hooks chain with existing hooks: if a hook file already exists, it is
/// renamed to `<hook>.prev` and called after rivet's check succeeds.
/// This allows coexistence with other hook managers (husky, pre-commit, lefthook).
fn cmd_init_hooks(dir: &std::path::Path) -> Result<bool> {
    let dir = if dir == std::path::Path::new(".") {
        std::env::current_dir().context("resolving current directory")?
    } else {
        dir.to_path_buf()
    };

    // Find .git directory (supports worktrees)
    let git_dir_output = std::process::Command::new("git")
        .args(["rev-parse", "--git-dir"])
        .current_dir(&dir)
        .output()
        .context("running git rev-parse --git-dir")?;

    if !git_dir_output.status.success() {
        anyhow::bail!("not a git repository (run from a git working tree)");
    }

    let git_dir = dir.join(String::from_utf8_lossy(&git_dir_output.stdout).trim());
    let hooks_dir = git_dir.join("hooks");
    std::fs::create_dir_all(&hooks_dir)
        .with_context(|| format!("creating {}", hooks_dir.display()))?;

    // Use PATH-based `rivet` so hooks work for any install method.
    // Falls back to absolute path only if rivet is not in PATH.
    let rivet_bin = which_rivet();

    // ── commit-msg hook ─────────────────────────────────────────────
    let commit_msg_path = hooks_dir.join("commit-msg");
    install_hook(
        &commit_msg_path,
        &format!(
            r#"#!/usr/bin/env bash
# Installed by: rivet init --hooks
# Validates commit trailers reference artifact IDs.
"{rivet_bin}" commit-msg-check "$1" || exit $?
"#,
        ),
    )?;
    println!("  installed {}", commit_msg_path.display());

    // ── pre-commit hook ─────────────────────────────────────────────
    let pre_commit_path = hooks_dir.join("pre-commit");
    install_hook(
        &pre_commit_path,
        &format!(
            r#"#!/usr/bin/env bash
# Installed by: rivet init --hooks
# Runs rivet validate and blocks on errors.
output=$("{rivet_bin}" validate --format json 2>/dev/null)
errors=$(echo "$output" | python3 -c "import json,sys; print(json.load(sys.stdin).get('errors',0))" 2>/dev/null || echo "0")
if [ "$errors" -gt 0 ]; then
    echo "rivet validate: $errors error(s). Run 'rivet validate' for details."
    exit 1
fi
"#,
        ),
    )?;
    println!("  installed {}", pre_commit_path.display());

    println!("\nGit hooks installed. Rivet will validate commits automatically.");
    println!("Hooks chain with existing hooks via .prev files.");
    Ok(true)
}

/// Resolve the rivet binary for hooks: prefer PATH-based "rivet" if available,
/// fall back to the current executable's absolute path.
fn which_rivet() -> String {
    // Check if `rivet` is in PATH by running `which rivet`.
    if let Ok(output) = std::process::Command::new("which").arg("rivet").output() {
        if output.status.success() {
            let path = String::from_utf8_lossy(&output.stdout).trim().to_string();
            if !path.is_empty() {
                return path;
            }
        }
    }
    // Fallback: absolute path to current exe.
    std::env::current_exe()
        .map(|p| p.display().to_string())
        .unwrap_or_else(|_| "rivet".to_string())
}

/// Install a hook file, chaining with any existing hook.
///
/// If a hook already exists:
/// 1. Rename it to `<hook>.prev`
/// 2. The new hook calls `<hook>.prev` at the end (after rivet's check)
///
/// This allows coexistence with pre-commit, husky, lefthook, etc.
fn install_hook(path: &std::path::Path, content: &str) -> Result<()> {
    if path.exists() {
        let prev = path.with_extension("prev");
        // Don't overwrite an existing .prev (user may have modified it)
        if !prev.exists() {
            std::fs::rename(path, &prev)
                .with_context(|| format!("backing up {}", path.display()))?;
            eprintln!("  note: existing hook backed up to {}", prev.display());
        }
    }

    // Check for .prev file and append chaining call
    let prev = path.with_extension("prev");
    let chain_snippet = if prev.exists() {
        format!(
            "\n# Chain to previous hook\nif [ -x \"{}\" ]; then\n    \"{}\" \"$@\"\nfi\n",
            prev.display(),
            prev.display()
        )
    } else {
        String::new()
    };

    let final_content = format!("{content}{chain_snippet}");
    std::fs::write(path, &final_content).with_context(|| format!("writing {}", path.display()))?;

    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        std::fs::set_permissions(path, std::fs::Permissions::from_mode(0o755))
            .with_context(|| format!("setting permissions on {}", path.display()))?;
    }
    Ok(())
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
///
/// The generated content is wrapped in `rivet-managed` HTML-comment markers
/// so that manual edits made outside the markers survive regeneration. See
/// [`rivet_core::managed_section`] for the splice semantics.
///
/// Behaviour on an existing file:
/// - Has exactly one marker pair: splice — replace only the managed region.
/// - Has no markers and `migrate` is true: wrap existing content (managed
///   section goes on top, prior content preserved verbatim below).
/// - Has no markers and `force_regen` is true: overwrite the whole file
///   with a freshly markered version (destructive; loud warning printed).
/// - Has no markers and neither flag is set: refuse with exit code 1.
/// - Has multiple marker pairs: refuse with exit code 1 (ambiguous).
fn cmd_init_agents(cli: &Cli, migrate: bool, force_regen: bool) -> Result<bool> {
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
        match rivet_core::load_artifacts(source, &cli.project, &schema) {
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

    // Build the managed body of AGENTS.md. This is what goes *between* the
    // BEGIN/END rivet-managed markers; markers themselves are added by
    // `managed_section::wrap_fresh` / `splice_managed_section`.
    let sentinel = rivet_core::managed_section::MANAGED_SENTINEL;
    let agents_managed = format!(
        r#"{sentinel}

# AGENTS.md — Rivet Project Instructions

> This section was generated by `rivet init --agents`. Re-run the command
> any time artifacts change to keep it current.

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

    // Preamble written above the managed section ONLY when the file is
    // fresh. Users can edit this freely; rivet never rewrites it.
    let agents_preamble = "\
<!-- This file has two kinds of content:

     1. A rivet-managed section (between the BEGIN/END rivet-managed markers
        below) that `rivet init --agents` regenerates from your project state.
        Do not edit inside that region — changes are overwritten.

     2. Everything outside the markers, which rivet never touches. Add your
        own sections, audit notes, and project-specific guidance freely,
        above or below the managed region. -->

";

    // Write AGENTS.md using managed-section splice semantics.
    let agents_path = cli.project.join("AGENTS.md");
    write_managed_file(
        &agents_path,
        &agents_managed,
        agents_preamble,
        migrate,
        force_regen,
    )?;

    // Write CLAUDE.md. It's a short shim pointing at AGENTS.md plus
    // Claude-Code-specific hints. Same marker semantics apply.
    let claude_trailer_line = if config.commits.is_some() {
        "- Commit messages require artifact trailers (Implements/Fixes/Verifies/Satisfies/Refs)\n"
    } else {
        ""
    };
    let claude_managed = format!(
        "\
{sentinel}

# CLAUDE.md

See [AGENTS.md](AGENTS.md) for project instructions.

Additional Claude Code settings:
- Use `rivet validate` to verify changes to artifact YAML files
- Use `rivet list --format json` for machine-readable artifact queries
{claude_trailer_line}",
    );
    let claude_preamble = "\
<!-- Like AGENTS.md, this file splits into a rivet-managed region (auto
     regenerated by `rivet init --agents`) and free-form content outside
     the markers (preserved across regenerations). Put any Claude-Code
     specific hand-authored guidance outside the markers. -->

";
    let claude_path = cli.project.join("CLAUDE.md");
    write_managed_file(
        &claude_path,
        &claude_managed,
        claude_preamble,
        migrate,
        force_regen,
    )?;

    println!(
        "\nGenerated AGENTS.md for project '{}' ({} artifacts, {} types)",
        config.project.name, total_count, type_count
    );

    Ok(true)
}

/// Write a managed file using splice semantics.
///
/// Rules, in priority order:
/// 1. File does not exist: write `preamble + wrap_fresh(managed_body)`.
/// 2. File exists with exactly one marker pair: splice.
/// 3. File exists without markers, `--migrate`: wrap existing content.
/// 4. File exists without markers, `--force-regen`: overwrite (warn loudly).
/// 5. File exists without markers, no flag: refuse with `anyhow::bail!`.
/// 6. File has multiple marker pairs (or other structural problems):
///    refuse with the underlying error message.
fn write_managed_file(
    path: &std::path::Path,
    managed_body: &str,
    fresh_preamble: &str,
    migrate: bool,
    force_regen: bool,
) -> Result<()> {
    use rivet_core::managed_section::{
        self, ManagedSectionError, has_markers, migrate_wrap, splice_managed_section, wrap_fresh,
    };

    let file_label = path
        .file_name()
        .map(|n| n.to_string_lossy().into_owned())
        .unwrap_or_else(|| path.display().to_string());

    if !path.exists() {
        // Fresh file: write preamble + markered block.
        let mut out = String::new();
        out.push_str(fresh_preamble);
        out.push_str(&wrap_fresh(managed_body));
        std::fs::write(path, out).with_context(|| format!("writing {}", path.display()))?;
        println!("  created {}", path.display());
        return Ok(());
    }

    let existing =
        std::fs::read_to_string(path).with_context(|| format!("reading {}", path.display()))?;

    // Fast-path detection so error precedence matches the design doc:
    // `--migrate` only applies when the file has no markers at all; if
    // markers exist we always splice (or surface a multi-marker error).
    if !has_markers(&existing) {
        if migrate {
            let out = migrate_wrap(&existing, managed_body);
            std::fs::write(path, out).with_context(|| format!("writing {}", path.display()))?;
            println!(
                "  migrated {} (wrapped existing content; managed section now on top, prior content preserved below)",
                path.display()
            );
            return Ok(());
        }
        if force_regen {
            eprintln!(
                "warning: --force-regen: overwriting {} with freshly markered content. Any existing content in this file is being discarded.",
                path.display()
            );
            let mut out = String::new();
            out.push_str(fresh_preamble);
            out.push_str(&wrap_fresh(managed_body));
            std::fs::write(path, out).with_context(|| format!("writing {}", path.display()))?;
            println!("  force-regenerated {}", path.display());
            return Ok(());
        }
        anyhow::bail!(
            "{file_label} exists without rivet-managed markers. Refusing to overwrite and destroy existing content.\n\
             Choose one:\n\
               * rivet init --agents --migrate       (safe: wraps existing content below a fresh managed section)\n\
               * rivet init --agents --force-regen   (destructive: replaces the whole file)\n\
               * manually wrap the auto-generated portion with:\n\
                   {begin}\n\
                   ...managed content...\n\
                   {end}\n\
             then re-run `rivet init --agents`.",
            begin = managed_section::BEGIN_MARKER,
            end = managed_section::END_MARKER,
        );
    }

    // File has at least one BEGIN marker — splice (or report structural error).
    match splice_managed_section(&existing, managed_body) {
        Ok(new_content) => {
            std::fs::write(path, new_content)
                .with_context(|| format!("writing {}", path.display()))?;
            println!(
                "  updated {} (managed section only; other content preserved)",
                path.display()
            );
            Ok(())
        }
        Err(ManagedSectionError::MultipleBeginMarkers(lines)) => {
            let lines_str = lines
                .iter()
                .map(|n| n.to_string())
                .collect::<Vec<_>>()
                .join(", ");
            anyhow::bail!(
                "{file_label} has multiple rivet-managed BEGIN markers (lines: {lines_str}). \
                 Refusing to choose which pair to splice. Delete the extras and re-run."
            );
        }
        Err(ManagedSectionError::UnclosedMarker { begin_line }) => {
            anyhow::bail!(
                "{file_label}: BEGIN rivet-managed marker at line {begin_line} has no matching END marker. \
                 Close it with `{end}` and re-run.",
                end = managed_section::END_MARKER,
            );
        }
        Err(ManagedSectionError::OrphanEndMarker { end_line }) => {
            anyhow::bail!(
                "{file_label}: END rivet-managed marker at line {end_line} appears before any BEGIN marker."
            );
        }
        Err(ManagedSectionError::NoMarkers) => {
            // Shouldn't reach here because we checked `has_markers` above,
            // but handle defensively in case the definitions diverge.
            anyhow::bail!(
                "{file_label}: internal error — has_markers reported true but splice found none"
            );
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

    // Load STPA artifacts via schema-driven extraction
    let artifacts = {
        let mut arts = Vec::new();
        for entry in std::fs::read_dir(stpa_dir)
            .with_context(|| format!("reading {}", stpa_dir.display()))?
            .filter_map(|e| e.ok())
        {
            let path = entry.path();
            if path.extension().is_some_and(|ext| ext == "yaml") {
                let content = std::fs::read_to_string(&path)
                    .with_context(|| format!("reading {}", path.display()))?;
                let parsed =
                    rivet_core::yaml_hir::extract_schema_driven(&content, &schema, Some(&path));
                for sa in parsed.artifacts {
                    let mut a = sa.artifact;
                    a.source_file = Some(path.clone());
                    arts.push(a);
                }
            }
        }
        arts
    };

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
#[allow(clippy::too_many_arguments)]
fn cmd_validate(
    cli: &Cli,
    format: &str,
    direct: bool,
    skip_external_validation: bool,
    baseline_name: Option<&str>,
    track_convergence: bool,
    model_path: Option<&std::path::Path>,
    variant_path: Option<&std::path::Path>,
    binding_path: Option<&std::path::Path>,
) -> Result<bool> {
    validate_format(format, &["text", "json"])?;
    check_for_updates();

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

    // Apply variant scoping if --model + --variant + --binding are all provided
    let (store, graph, variant_scope_name) = if let (Some(mp), Some(vp), Some(bp)) =
        (model_path, variant_path, binding_path)
    {
        let model_yaml = std::fs::read_to_string(mp)
            .with_context(|| format!("reading feature model {}", mp.display()))?;
        let fm = rivet_core::feature_model::FeatureModel::from_yaml(&model_yaml)
            .map_err(|e| anyhow::anyhow!("{e}"))?;

        let variant_yaml = std::fs::read_to_string(vp)
            .with_context(|| format!("reading variant config {}", vp.display()))?;
        let vc: rivet_core::feature_model::VariantConfig =
            serde_yaml::from_str(&variant_yaml).context("parsing variant config")?;

        let resolved = rivet_core::feature_model::solve(&fm, &vc).map_err(|errs| {
            let msgs: Vec<String> = errs.iter().map(|e| format!("{e}")).collect();
            anyhow::anyhow!("variant solve failed:\n  {}", msgs.join("\n  "))
        })?;

        let binding_yaml = std::fs::read_to_string(bp)
            .with_context(|| format!("reading binding {}", bp.display()))?;
        let fb: rivet_core::feature_model::FeatureBinding =
            serde_yaml::from_str(&binding_yaml).context("parsing feature binding")?;

        // Collect bound artifact IDs from effective features
        let bound_ids: std::collections::BTreeSet<String> = resolved
            .effective_features
            .iter()
            .flat_map(|f| {
                fb.bindings
                    .get(f)
                    .map(|b| b.artifacts.clone())
                    .unwrap_or_default()
            })
            .collect();

        // Build a scoped store containing only bound artifacts
        let mut scoped = Store::new();
        for id in &bound_ids {
            if let Some(art) = store.get(id) {
                scoped.upsert(art.clone());
            }
        }
        let scoped_graph = LinkGraph::build(&scoped, &schema);
        let vname = resolved.name.clone();
        (scoped, scoped_graph, Some((vname, bound_ids.len())))
    } else if model_path.is_some() || variant_path.is_some() || binding_path.is_some() {
        anyhow::bail!(
            "--model, --variant, and --binding must all be provided together for variant-scoped validation"
        );
    } else {
        (store, graph, None)
    };

    let doc_store = doc_store.unwrap_or_default();

    // Print variant scope header (text mode only; JSON includes it in the output object)
    if let Some((ref vname, bound_count)) = variant_scope_name {
        if format != "json" {
            println!(
                "Variant '{}': {} artifacts in scope, {} resolved in project\n",
                vname,
                bound_count,
                store.len()
            );
        }
    }

    // Core validation: use salsa incremental by default, --direct for legacy path.
    // When baseline or variant scoping is active, salsa validates ALL files and
    // we filter the resulting diagnostics to only include artifacts in the scoped store.
    let is_scoped = baseline_name.is_some() || variant_scope_name.is_some();
    let mut diagnostics = if direct {
        validate::validate(&store, &schema, &graph)
    } else {
        let all_diags = run_salsa_validation(cli, &config)?;
        if is_scoped {
            // Filter diagnostics to only those relevant to the scoped store.
            all_diags
                .into_iter()
                .filter(|d| {
                    d.artifact_id
                        .as_ref()
                        .map(|id| store.contains(id))
                        .unwrap_or(true)
                })
                .collect()
        } else {
            all_diags
        }
    };
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
        let mut output = serde_json::json!({
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
        if let Some((ref vname, bound_count)) = variant_scope_name {
            output["variant"] = serde_json::json!({
                "name": vname,
                "bound_artifacts": bound_count,
                "resolved_artifacts": store.len(),
            });
        }
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

    // ── Convergence tracking ────────────────────────────────────────────
    if track_convergence {
        let convergence_dir = cli.project.join(".rivet");
        let convergence_path = convergence_dir.join("convergence.json");

        let mut tracker = if convergence_path.exists() {
            let json = std::fs::read_to_string(&convergence_path)
                .context("failed to read convergence state")?;
            rivet_core::convergence::ConvergenceTracker::from_json(&json)
                .context("failed to parse convergence state")?
        } else {
            rivet_core::convergence::ConvergenceTracker::new()
        };

        let report = tracker.record_run(&diagnostics);

        // Save updated state.
        std::fs::create_dir_all(&convergence_dir).context("failed to create .rivet directory")?;
        let json = tracker
            .to_json()
            .context("failed to serialize convergence state")?;
        std::fs::write(&convergence_path, json).context("failed to write convergence state")?;

        // Print convergence guidance.
        if !report.repeated_failures.is_empty() || !report.resolved_failures.is_empty() {
            println!();
            println!("Convergence tracking (run #{}):", report.run_number);

            if !report.resolved_failures.is_empty() {
                println!(
                    "  \u{2714} {} failure(s) resolved since last run",
                    report.resolved_failures.len()
                );
            }

            if !report.repeated_failures.is_empty() {
                println!(
                    "  \u{26a0} {} repeated failure(s) \u{2014} {}",
                    report.repeated_failures.len(),
                    report.strategy.guidance()
                );
            }
        }
    }

    Ok(errors == 0 && cross_errors == 0)
}

/// Run core validation via the salsa incremental database.
///
/// This reads all source files and schemas into salsa inputs, then calls the
/// tracked `validate_all` query. Returns the diagnostics for integration into
/// the main `cmd_validate` flow (which adds document, cross-repo, and
/// lifecycle validation on top).
///
/// The salsa path produces identical core diagnostics (structural + conditional
/// rules) to the direct `validate::validate()` call, but benefits from
/// incremental caching when used in watch/LSP modes.
fn run_salsa_validation(cli: &Cli, config: &ProjectConfig) -> Result<Vec<validate::Diagnostic>> {
    use rivet_core::db::RivetDatabase;
    use std::time::Instant;

    let schemas_dir = resolve_schemas_dir(cli);

    // ── Collect schema content (including auto-discovered bridges) ──────
    let schema_contents =
        rivet_core::embedded::load_schema_contents(&config.project.schemas, &schemas_dir);

    // Merge schema files up-front so the non-YAML adapters that need a
    // schema (e.g. stpa-yaml for schema-driven extraction) can be invoked
    // identically to the direct path.
    let merged_schema = rivet_core::load_schemas(&config.project.schemas, &schemas_dir)
        .context("loading schemas for salsa validation")?;

    // ── Collect source file content and adapter-imported artifacts ──────
    //
    // YAML-based formats are fed to salsa as `SourceFile` inputs so every
    // file becomes an incrementally-tracked parse unit. Non-YAML formats
    // (aadl, reqif, needs-json, wasm) can't be represented that way —
    // their adapters operate on directories, binary blobs, or run external
    // tools. We invoke those adapters once here and inject the resulting
    // artifacts into the salsa store via `ExtraArtifactSet` so that
    // cross-format links (e.g. a YAML artifact `modeled-by -> AADL-*`)
    // resolve against the full set of artifacts — matching the direct
    // (`--direct`) path and eliminating the class of phantom
    // "link target does not exist" diagnostics that the salsa path used
    // to report for AADL / ReqIF / needs-json targets.
    let mut source_contents: Vec<(String, String)> = Vec::new();
    let mut extra_artifacts: Vec<rivet_core::model::Artifact> = Vec::new();
    for source in &config.sources {
        let source_path = cli.project.join(&source.path);
        match source.format.as_str() {
            "generic" | "generic-yaml" | "stpa-yaml" => {
                rivet_core::collect_yaml_files(&source_path, &mut source_contents)
                    .with_context(|| format!("reading source '{}'", source.path))?;
            }
            _ => {
                // Non-YAML formats: run the adapter now, inject the
                // resulting artifacts into the salsa store so links to
                // them resolve.
                match rivet_core::load_artifacts(source, &cli.project, &merged_schema) {
                    Ok(artifacts) => extra_artifacts.extend(artifacts),
                    Err(e) => {
                        return Err(anyhow::anyhow!(
                            "loading adapter source '{}' (format: {}): {}",
                            source.path,
                            source.format,
                            e
                        ));
                    }
                }
            }
        }
    }

    // Externals: the direct path (ProjectContext::load) injects external
    // project artifacts with their prefix into the store. The salsa path
    // must do the same or cross-repo link targets become phantom broken
    // links. This mirrors the loop in ProjectContext::load.
    if let Some(ref externals) = config.externals {
        if !externals.is_empty() {
            match rivet_core::externals::load_all_externals(externals, &cli.project) {
                Ok(resolved) => {
                    for ext in resolved {
                        let ext_ids: std::collections::HashSet<String> =
                            ext.artifacts.iter().map(|a| a.id.clone()).collect();
                        for mut artifact in ext.artifacts {
                            artifact.id = format!("{}:{}", ext.prefix, artifact.id);
                            for link in &mut artifact.links {
                                if ext_ids.contains(&link.target) {
                                    link.target = format!("{}:{}", ext.prefix, link.target);
                                }
                            }
                            extra_artifacts.push(artifact);
                        }
                    }
                }
                Err(e) => {
                    log::warn!("could not load externals for salsa validation: {e}");
                }
            }
        }
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
    let extra_count = extra_artifacts.len();
    let extra_set = db.load_extras(extra_artifacts);
    let diagnostics = db.diagnostics_with_extras(source_set, schema_set, extra_set);
    let t_elapsed = t_start.elapsed();

    if cli.verbose > 0 {
        eprintln!(
            "[salsa] validation: {:.1}ms ({} source files, {} adapter artifacts, {} schemas, {} diagnostics)",
            t_elapsed.as_secs_f64() * 1000.0,
            source_contents.len(),
            extra_count,
            schema_contents.len(),
            diagnostics.len(),
        );
    }

    Ok(diagnostics)
}

/// Show a single artifact by ID.
fn cmd_get(cli: &Cli, id: &str, format: &str) -> Result<bool> {
    validate_format(format, &["text", "json", "yaml"])?;
    let ctx = ProjectContext::load(cli)?;

    let Some(artifact) = ctx.store.get(id) else {
        eprintln!("error: artifact '{}' not found", id);
        return Ok(false);
    };

    match format {
        "json" => {
            let links_json: Vec<serde_json::Value> = artifact
                .links
                .iter()
                .map(|l| {
                    serde_json::json!({
                        "type": l.link_type,
                        "target": l.target,
                    })
                })
                .collect();
            let fields_json: serde_json::Value = artifact
                .fields
                .iter()
                .map(|(k, v)| {
                    let json_val = serde_json::to_value(v).unwrap_or(serde_json::Value::Null);
                    (k.clone(), json_val)
                })
                .collect::<serde_json::Map<String, serde_json::Value>>()
                .into();
            let output = serde_json::json!({
                "command": "get",
                "id": artifact.id,
                "type": artifact.artifact_type,
                "title": artifact.title,
                "status": artifact.status.as_deref().unwrap_or(""),
                "description": artifact.description.as_deref().unwrap_or(""),
                "tags": artifact.tags,
                "links": links_json,
                "fields": fields_json,
            });
            println!("{}", serde_json::to_string_pretty(&output).unwrap());
        }
        "yaml" => {
            // Serialize the artifact back to YAML
            let yaml = serde_yaml::to_string(artifact)
                .unwrap_or_else(|e| format!("# failed to serialize: {e}"));
            print!("{yaml}");
        }
        _ => {
            // Human-readable text format
            println!("ID:          {}", artifact.id);
            println!("Type:        {}", artifact.artifact_type);
            println!("Title:       {}", artifact.title);
            println!("Status:      {}", artifact.status.as_deref().unwrap_or("-"));
            if let Some(desc) = &artifact.description {
                println!("Description: {}", desc.trim());
            }
            if !artifact.tags.is_empty() {
                println!("Tags:        {}", artifact.tags.join(", "));
            }
            if !artifact.fields.is_empty() {
                println!("Fields:");
                for (key, value) in &artifact.fields {
                    let val_str = match value {
                        serde_yaml::Value::String(s) => s.clone(),
                        other => serde_yaml::to_string(other)
                            .unwrap_or_default()
                            .trim()
                            .to_string(),
                    };
                    println!("  {}: {}", key, val_str);
                }
            }
            if !artifact.links.is_empty() {
                println!("Links:");
                for link in &artifact.links {
                    println!("  {} -> {}", link.link_type, link.target);
                }
            }
        }
    }

    Ok(true)
}

/// List artifacts.
fn cmd_list(
    cli: &Cli,
    type_filter: Option<&str>,
    status_filter: Option<&str>,
    sexpr_filter: Option<&str>,
    format: &str,
    baseline_name: Option<&str>,
) -> Result<bool> {
    validate_format(format, &["text", "json"])?;
    let ctx = ProjectContext::load(cli)?;
    let store = apply_baseline_scope(ctx.store, baseline_name, &ctx.config);

    let query = rivet_core::query::Query {
        artifact_type: type_filter.map(|s| s.to_string()),
        status: status_filter.map(|s| s.to_string()),
        ..Default::default()
    };

    let mut results = rivet_core::query::execute(&store, &query);

    // Apply s-expression filter if provided.
    if let Some(filter_src) = sexpr_filter {
        let expr = rivet_core::sexpr_eval::parse_filter(filter_src).map_err(|errs| {
            let msgs: Vec<String> = errs.iter().map(|e| e.to_string()).collect();
            anyhow::anyhow!("invalid filter: {}", msgs.join("; "))
        })?;
        let graph = rivet_core::links::LinkGraph::build(&store, &ctx.schema);
        results.retain(|a| {
            rivet_core::sexpr_eval::matches_filter_with_store(&expr, a, &graph, &store)
        });
    }

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
fn cmd_stats(
    cli: &Cli,
    sexpr_filter: Option<&str>,
    format: &str,
    baseline_name: Option<&str>,
) -> Result<bool> {
    validate_format(format, &["text", "json"])?;
    let ctx = ProjectContext::load(cli)?;
    let mut store = apply_baseline_scope(ctx.store, baseline_name, &ctx.config);
    let mut graph = if baseline_name.is_some() {
        LinkGraph::build(&store, &ctx.schema)
    } else {
        ctx.graph
    };

    // Apply s-expression filter if provided.
    if let Some(filter_src) = sexpr_filter {
        let expr = rivet_core::sexpr_eval::parse_filter(filter_src).map_err(|errs| {
            let msgs: Vec<String> = errs.iter().map(|e| e.to_string()).collect();
            anyhow::anyhow!("invalid filter: {}", msgs.join("; "))
        })?;
        let mut filtered = rivet_core::store::Store::default();
        for a in store.iter() {
            if rivet_core::sexpr_eval::matches_filter_with_store(&expr, a, &graph, &store) {
                filtered.upsert(a.clone());
            }
        }
        store = filtered;
        graph = LinkGraph::build(&store, &ctx.schema);
    }

    // Compute stats once — both formats share the same data.
    let stats = compute_stats(&store, &graph);

    if format == "json" {
        let mut types = serde_json::Map::new();
        for (name, count) in &stats.type_counts {
            types.insert(name.clone(), serde_json::json!(count));
        }
        let output = serde_json::json!({
            "command": "stats",
            "total": stats.total,
            "types": types,
            "orphans": stats.orphans,
            "broken_links": stats.broken_links,
        });
        println!("{}", serde_json::to_string_pretty(&output).unwrap());
    } else {
        println!("Artifact summary:");
        for (name, count) in &stats.type_counts {
            println!("  {:30} {:>4}", name, count);
        }
        println!("  {:30} {:>4}", "TOTAL", stats.total);

        if !stats.orphans.is_empty() {
            println!("\nOrphan artifacts (no links): {}", stats.orphans.len());
            for id in &stats.orphans {
                println!("  {}", id);
            }
        }

        if stats.broken_links > 0 {
            println!("\nBroken links: {}", stats.broken_links);
        }
    }

    Ok(true)
}

/// Pre-computed stats shared by text and JSON output paths.
struct StatsResult {
    total: usize,
    type_counts: Vec<(String, usize)>,
    orphans: Vec<String>,
    broken_links: usize,
}

/// Compute artifact stats from the store and link graph.
///
/// The total is derived as the sum of per-type counts so that both text and
/// JSON formats are guaranteed to agree.
fn compute_stats(store: &Store, graph: &LinkGraph) -> StatsResult {
    let mut type_names: Vec<&str> = store.types().collect();
    type_names.sort();
    let type_counts: Vec<(String, usize)> = type_names
        .iter()
        .map(|t| (t.to_string(), store.count_by_type(t)))
        .collect();
    let total: usize = type_counts.iter().map(|(_, c)| c).sum();
    let orphans: Vec<String> = graph.orphans(store).into_iter().cloned().collect();
    StatsResult {
        total,
        type_counts,
        orphans,
        broken_links: graph.broken.len(),
    }
}

/// Show traceability coverage report.
fn cmd_coverage(
    cli: &Cli,
    sexpr_filter: Option<&str>,
    format: &str,
    fail_under: Option<&f64>,
    baseline_name: Option<&str>,
) -> Result<bool> {
    validate_format(format, &["text", "json"])?;
    let ctx = ProjectContext::load(cli)?;
    let mut store = apply_baseline_scope(ctx.store, baseline_name, &ctx.config);
    let schema = ctx.schema;
    let mut graph = if baseline_name.is_some() {
        LinkGraph::build(&store, &schema)
    } else {
        ctx.graph
    };

    // Apply s-expression filter if provided.
    if let Some(filter_src) = sexpr_filter {
        let expr = rivet_core::sexpr_eval::parse_filter(filter_src).map_err(|errs| {
            let msgs: Vec<String> = errs.iter().map(|e| e.to_string()).collect();
            anyhow::anyhow!("invalid filter: {}", msgs.join("; "))
        })?;
        let mut filtered = rivet_core::store::Store::default();
        for a in store.iter() {
            if rivet_core::sexpr_eval::matches_filter_with_store(&expr, a, &graph, &store) {
                filtered.upsert(a.clone());
            }
        }
        store = filtered;
        graph = LinkGraph::build(&store, &schema);
    }

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
    validate_format(format, &["text", "json"])?;
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
    validate_format(format, &["text", "json"])?;
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
    prefix: &str,
    sexpr_filter: Option<&str>,
    shortcodes: bool,
    clean: bool,
) -> Result<bool> {
    validate_format(
        format,
        &[
            "reqif",
            "generic-yaml",
            "generic",
            "html",
            "gherkin",
            "zola",
        ],
    )?;
    if format == "zola" {
        return cmd_export_zola(
            cli,
            output,
            prefix,
            sexpr_filter,
            shortcodes,
            clean,
            baseline_name,
        );
    }
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

/// Export artifacts to a Zola-compatible static site structure.
///
/// Writes content/<prefix>/artifacts/*.md with TOML frontmatter and
/// data/<prefix>/*.json with aggregate data. Additive-only: never
/// modifies existing files outside the prefix namespace.
fn cmd_export_zola(
    cli: &Cli,
    output: Option<&std::path::Path>,
    prefix: &str,
    sexpr_filter: Option<&str>,
    shortcodes: bool,
    clean: bool,
    baseline_name: Option<&str>,
) -> Result<bool> {
    let ctx = ProjectContext::load_with_docs(cli)?;
    let store = apply_baseline_scope(ctx.store, baseline_name, &ctx.config);
    let doc_store = ctx.doc_store.unwrap_or_default();
    let graph = rivet_core::links::LinkGraph::build(&store, &ctx.schema);

    // Apply s-expression filter if provided.
    let artifacts: Vec<&rivet_core::model::Artifact> = if let Some(filter_src) = sexpr_filter {
        let expr = rivet_core::sexpr_eval::parse_filter(filter_src).map_err(|errs| {
            let msgs: Vec<String> = errs.iter().map(|e| e.to_string()).collect();
            anyhow::anyhow!("invalid filter: {}", msgs.join("; "))
        })?;
        store
            .iter()
            .filter(|a| rivet_core::sexpr_eval::matches_filter_with_store(&expr, a, &graph, &store))
            .collect()
    } else {
        store.iter().collect()
    };

    let site_dir = output
        .map(|p| p.to_path_buf())
        .unwrap_or_else(|| std::path::PathBuf::from("."));

    // Validate the output directory looks like a Zola site.
    if !site_dir.join("config.toml").exists() && !site_dir.join("content").exists() {
        eprintln!(
            "warning: {} doesn't look like a Zola site (no config.toml or content/). Creating directories anyway.",
            site_dir.display()
        );
    }

    // Create namespaced directories.
    let content_dir = site_dir.join("content").join(prefix);
    let artifacts_dir = content_dir.join("artifacts");
    let data_dir = site_dir.join("data").join(prefix);

    // REQ-049: --clean removes stale pages before writing.
    if clean {
        if content_dir.exists() {
            std::fs::remove_dir_all(&content_dir)
                .with_context(|| format!("cleaning {}", content_dir.display()))?;
            println!("  cleaned {}", content_dir.display());
        }
        if data_dir.exists() {
            std::fs::remove_dir_all(&data_dir)
                .with_context(|| format!("cleaning {}", data_dir.display()))?;
        }
    }

    std::fs::create_dir_all(&artifacts_dir)
        .with_context(|| format!("creating {}", artifacts_dir.display()))?;
    std::fs::create_dir_all(&data_dir)
        .with_context(|| format!("creating {}", data_dir.display()))?;

    // ── Section index ───────────────────────────────────────────────
    let section_index = format!(
        "\
+++
title = \"{prefix}\"
sort_by = \"title\"
template = \"section.html\"
page_template = \"page.html\"
+++

Artifacts from the **{prefix}** project, exported by [rivet](https://github.com/pulseengine/rivet).
"
    );
    std::fs::write(content_dir.join("_index.md"), &section_index)?;

    let artifacts_index = format!(
        "\
+++
title = \"{prefix} — Artifacts\"
sort_by = \"title\"
+++

{count} artifacts exported.
",
        count = artifacts.len()
    );
    std::fs::write(artifacts_dir.join("_index.md"), &artifacts_index)?;

    // ── Individual artifact pages ───────────────────────────────────
    // Use provenance timestamp from first artifact that has one, or fallback.
    let export_date = artifacts
        .iter()
        .filter_map(|a| a.provenance.as_ref()?.timestamp.as_deref())
        .next()
        .and_then(|ts| ts.get(..10)) // "2026-04-07T..." -> "2026-04-07"
        .unwrap_or("2026-01-01");
    let mut artifact_count = 0;
    for artifact in &artifacts {
        let slug = artifact.id.to_lowercase().replace('.', "-");
        let status = artifact.status.as_deref().unwrap_or("unset");
        let mut all_tags: Vec<String> = artifact.tags.iter().map(|t| format!("\"{t}\"")).collect();
        all_tags.push(format!("\"{}\"", artifact.artifact_type));
        all_tags.push(format!("\"{}\"", status));
        let description_raw = artifact.description.as_deref().unwrap_or("");

        // Use description as fallback title if title is empty.
        let raw_title = if artifact.title.trim().is_empty() {
            description_raw
                .lines()
                .find(|l| !l.trim().is_empty())
                .unwrap_or(&artifact.id)
                .trim()
        } else {
            artifact.title.as_str()
        };

        // Escape title for TOML (replace quotes, collapse to single line).
        let title_escaped = raw_title
            .replace('\\', "\\\\")
            .replace('"', "\\\"")
            .replace('\n', " ");
        // Triple-quoted TOML strings can't contain """ so escape that edge case.
        let description_toml = description_raw.replace("\"\"\"", "\\\"\\\"\\\"");

        let links_md: String = artifact
            .links
            .iter()
            .map(|l| {
                let target_slug = l.target.to_lowercase().replace('.', "-");
                format!(
                    "- **{}** → [{}](/{prefix}/artifacts/{target_slug}/)\n",
                    l.link_type, l.target
                )
            })
            .collect();

        // Include diagram field as Mermaid code block if present.
        let diagram_md = artifact
            .fields
            .get("diagram")
            .and_then(|v| v.as_str())
            .map(|d| format!("\n### Diagram\n\n```mermaid\n{d}\n```\n"))
            .unwrap_or_default();

        // Include rationale field if present (design decisions).
        let rationale_md = artifact
            .fields
            .get("rationale")
            .and_then(|v| v.as_str())
            .map(|r| format!("\n### Rationale\n\n{r}\n"))
            .unwrap_or_default();

        let page = format!(
            "\
+++
title = \"{id}: {title}\"
slug = \"{slug}\"
weight = {weight}
date = {date}

[taxonomies]
tags = [{tags}]

[extra]
id = \"{id}\"
artifact_type = \"{art_type}\"
status = \"{status}\"
description = \"\"\"\n{description}\n\"\"\"
links_count = {links_count}
+++

## {id}: {title}

{desc_body}
{rationale}{diagram}
### Links

{links_md}\
",
            id = artifact.id,
            title = title_escaped,
            slug = slug,
            weight = artifact_count,
            date = export_date,
            art_type = artifact.artifact_type,
            status = status,
            tags = all_tags.join(", "),
            description = description_toml,
            links_count = artifact.links.len(),
            desc_body = description_raw,
            rationale = rationale_md,
            diagram = diagram_md,
            links_md = if links_md.is_empty() {
                "No links.".to_string()
            } else {
                links_md
            },
        );

        let page_path = artifacts_dir.join(format!("{slug}.md"));
        std::fs::write(&page_path, &page)?;
        artifact_count += 1;
    }
    println!(
        "  wrote {artifact_count} artifact pages to {}",
        artifacts_dir.display()
    );

    // ── JSON data files ─────────────────────────────────────────────
    let artifacts_json: Vec<serde_json::Value> = artifacts
        .iter()
        .map(|a| {
            serde_json::json!({
                "id": a.id,
                "type": a.artifact_type,
                "title": a.title,
                "status": a.status.as_deref().unwrap_or("-"),
                "tags": a.tags,
                "links": a.links.iter().map(|l| serde_json::json!({"type": l.link_type, "target": l.target})).collect::<Vec<_>>(),
                "description": a.description.as_deref().unwrap_or(""),
            })
        })
        .collect();

    let data_output = serde_json::json!({
        "project": ctx.config.project.name,
        "prefix": prefix,
        "count": artifacts_json.len(),
        "artifacts": artifacts_json,
    });
    std::fs::write(
        data_dir.join("artifacts.json"),
        serde_json::to_string_pretty(&data_output)?,
    )?;

    // Stats data.
    let mut type_counts = std::collections::BTreeMap::new();
    let mut status_counts = std::collections::BTreeMap::new();
    for a in &artifacts {
        *type_counts.entry(a.artifact_type.clone()).or_insert(0usize) += 1;
        *status_counts
            .entry(a.status.clone().unwrap_or_else(|| "unset".into()))
            .or_insert(0usize) += 1;
    }
    let stats_output = serde_json::json!({
        "total": artifacts.len(),
        "by_type": type_counts,
        "by_status": status_counts,
    });
    std::fs::write(
        data_dir.join("stats.json"),
        serde_json::to_string_pretty(&stats_output)?,
    )?;
    // REQ-049: embed validation result so consumers can verify export freshness.
    let diagnostics = rivet_core::validate::validate(&store, &ctx.schema, &graph);
    let errors = diagnostics
        .iter()
        .filter(|d| d.severity == rivet_core::schema::Severity::Error)
        .count();
    let warnings = diagnostics
        .iter()
        .filter(|d| d.severity == rivet_core::schema::Severity::Warning)
        .count();
    let validation_output = serde_json::json!({
        "result": if errors > 0 { "FAIL" } else { "PASS" },
        "errors": errors,
        "warnings": warnings,
        "artifact_count": artifacts.len(),
        "exported_at": export_date,
    });
    std::fs::write(
        data_dir.join("validation.json"),
        serde_json::to_string_pretty(&validation_output)?,
    )?;
    println!("  wrote data files to {}", data_dir.display());

    // ── Shortcodes (optional) ───────────────────────────────────────
    if shortcodes {
        let shortcodes_dir = site_dir.join("templates").join("shortcodes");
        std::fs::create_dir_all(&shortcodes_dir)?;

        // rivet_artifact shortcode.
        let artifact_shortcode = r#"{# rivet_artifact: embed an artifact card by ID.
   Usage: {{ rivet_artifact(id="REQ-001", prefix="rivet") }}
#}
{% set prefix = prefix | default(value="rivet") %}
{% set data = load_data(path="data/" ~ prefix ~ "/artifacts.json") %}
{% set matches = data.artifacts | filter(attribute="id", value=id) %}
{% if matches | length > 0 %}
{% set art = matches | first %}
<div class="rivet-artifact-card" style="border:1px solid #444; border-radius:6px; padding:12px; margin:8px 0;">
  <div>
    <span style="background:#2563eb;color:#fff;padding:2px 8px;border-radius:3px;font-size:0.85em;">{{ art.type }}</span>
    <span style="background:#059669;color:#fff;padding:2px 8px;border-radius:3px;font-size:0.85em;">{{ art.status }}</span>
  </div>
  <strong><a href="/{{ prefix }}/artifacts/{{ art.id | lower | replace(from=".", to="-") }}/">{{ art.id }}</a></strong>: {{ art.title }}
  {% if art.description %}<p style="margin:4px 0;font-size:0.9em;">{{ art.description | truncate(length=200) }}</p>{% endif %}
</div>
{% else %}
<span style="color:red;">Unknown artifact: {{ id }}</span>
{% endif %}
"#;
        std::fs::write(
            shortcodes_dir.join("rivet_artifact.html"),
            artifact_shortcode,
        )?;

        // rivet_stats shortcode.
        let stats_shortcode = r#"{# rivet_stats: show artifact counts.
   Usage: {{ rivet_stats(prefix="rivet") }}
#}
{% set prefix = prefix | default(value="rivet") %}
{% set data = load_data(path="data/" ~ prefix ~ "/stats.json") %}
<div class="rivet-stats" style="display:flex;gap:16px;flex-wrap:wrap;margin:8px 0;">
  <div style="padding:8px 16px;background:#1e293b;border-radius:6px;">
    <strong>{{ data.total }}</strong> artifacts
  </div>
  {% for type_name, count in data.by_type %}
  <div style="padding:8px 16px;background:#1e293b;border-radius:6px;">
    <strong>{{ count }}</strong> {{ type_name }}
  </div>
  {% endfor %}
</div>
"#;
        std::fs::write(shortcodes_dir.join("rivet_stats.html"), stats_shortcode)?;
        println!("  wrote shortcodes to {}", shortcodes_dir.display());
    }

    // ── Documents ────────────────────────────────────────────────────
    if !doc_store.is_empty() {
        let docs_dir = content_dir.join("docs");
        std::fs::create_dir_all(&docs_dir)?;

        let docs_index = format!(
            "\
+++
title = \"{prefix} — Documents\"
sort_by = \"title\"
+++

{count} document(s) exported.
",
            count = doc_store.len()
        );
        std::fs::write(docs_dir.join("_index.md"), &docs_index)?;

        let mut doc_count = 0;
        for doc in doc_store.iter() {
            let slug: String = doc
                .id
                .to_lowercase()
                .chars()
                .map(|c| if c == '.' || c == ' ' { '-' } else { c })
                .collect();
            let status = doc.status.as_deref().unwrap_or("unset");

            // Resolve [[ID]] wiki-links to Zola internal links.
            let mut body = doc.body.clone();
            while let Some(start) = body.find("[[") {
                if let Some(end) = body[start + 2..].find("]]") {
                    let id = &body[start + 2..start + 2 + end];
                    let target_slug = id.to_lowercase().replace('.', "-");
                    let replacement = format!("[{id}](/{prefix}/artifacts/{target_slug}/)");
                    body.replace_range(start..start + 2 + end + 2, &replacement);
                } else {
                    break;
                }
            }

            let page = format!(
                "\
+++
title = \"{title}\"
slug = \"{slug}\"
weight = {weight}

[extra]
id = \"{id}\"
doc_type = \"{doc_type}\"
status = \"{status}\"
+++

{body}
",
                title = doc.title.replace("\"", "\\\""),
                slug = slug,
                weight = doc_count,
                id = doc.id,
                doc_type = doc.doc_type,
                status = status,
                body = body,
            );

            std::fs::write(docs_dir.join(format!("{slug}.md")), &page)?;
            doc_count += 1;
        }
        println!(
            "  wrote {doc_count} document pages to {}",
            docs_dir.display()
        );
    }

    // ── Fallback templates (only if missing) ──────────────────────
    // Zola requires taxonomy templates when tags are used. If the site
    // has no theme and no templates, generate minimal ones so `zola build` works.
    let templates_dir = site_dir.join("templates");
    let fallback_templates = [
        (
            "taxonomy_list.html",
            "<html><body><h1>{{ taxonomy.name | title }}</h1><ul>{% for term in terms %}<li><a href=\"{{ term.permalink }}\">{{ term.name }}</a> ({{ term.pages | length }})</li>{% endfor %}</ul></body></html>",
        ),
        (
            "taxonomy_single.html",
            "<html><body><h1>{{ term.name }}</h1><ul>{% for page in term.pages %}<li><a href=\"{{ page.permalink }}\">{{ page.title }}</a></li>{% endfor %}</ul></body></html>",
        ),
    ];
    for (name, content) in &fallback_templates {
        let path = templates_dir.join(name);
        if !path.exists() {
            std::fs::create_dir_all(&templates_dir)?;
            std::fs::write(&path, content)?;
        }
    }

    // ── Instructions ────────────────────────────────────────────────
    println!("\nZola export complete ({prefix}).");
    println!("  Content: content/{prefix}/artifacts/");
    if !doc_store.is_empty() {
        println!("  Content: content/{prefix}/docs/");
    }
    println!("  Data:    data/{prefix}/");
    println!("\n  Ensure your config.toml has a 'tags' taxonomy:");
    println!("    [[taxonomies]]");
    println!("    name = \"tags\"");

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

    // Auto-detect baseline snapshot for delta rendering.
    let snap_dir = project_path.join("snapshots");
    let baseline_snapshot = find_latest_snapshot(&snap_dir)
        .ok()
        .and_then(|path| rivet_core::snapshot::read_from_file(&path).ok());
    if let Some(ref snap) = baseline_snapshot {
        eprintln!(
            "delta: comparing against baseline {} ({})",
            snap.git_commit_short, snap.created_at,
        );
    }

    let mut ctx = state.as_render_context();
    ctx.baseline = baseline_snapshot.as_ref();
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
        let eu_ai_act_loaded = rivet_core::compliance::is_eu_ai_act_loaded(&state.schema);
        let eu_ai_act_nav = if eu_ai_act_loaded {
            let eu_count: usize = rivet_core::compliance::EU_AI_ACT_TYPES
                .iter()
                .map(|t| state.store.count_by_type(t))
                .sum();
            let badge = if eu_count > 0 {
                format!("<span class=\"nav-badge\">{eu_count}</span>")
            } else {
                String::new()
            };
            format!("<li><a href=\"../eu-ai-act/index.html\">EU AI Act{badge}</a></li>")
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
    {eu_ai_act_nav}
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
    write_page("eu-ai-act/index.html", "/eu-ai-act", "EU AI Act", out_dir)?;
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
    validate_format(format, &["text", "json"])?;
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
                        direct: false,
                        skip_external_validation: false,
                        baseline: None,
                        track_convergence: false,
                        model: None,
                        variant: None,
                        binding: None,
                    },
                };
                let head_cli = Cli {
                    project: hp.to_path_buf(),
                    schemas: cli.schemas.clone(),
                    verbose: cli.verbose,
                    command: Command::Validate {
                        format: "text".to_string(),
                        direct: false,
                        skip_external_validation: false,
                        baseline: None,
                        track_convergence: false,
                        model: None,
                        variant: None,
                        binding: None,
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
    validate_format(format, &["text", "json"])?;
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
                    provenance: None,
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
                    provenance: None,
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
fn cmd_docs(
    topic: Option<&str>,
    list: bool,
    grep: Option<&str>,
    format: &str,
    context: usize,
) -> Result<bool> {
    validate_format(format, &["text", "json"])?;
    if list {
        // --list explicitly requests the topic listing
        print!("{}", docs::list_topics(format));
    } else if let Some(pattern) = grep {
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
        SchemaAction::List { format } => {
            validate_format(format, &["text", "json"])?;
            schema_cmd::cmd_list(&schema, format)
        }
        SchemaAction::Show { name, format } => {
            validate_format(format, &["text", "json"])?;
            schema_cmd::cmd_show(&schema, name, format)
        }
        SchemaAction::Links { format } => {
            validate_format(format, &["text", "json"])?;
            schema_cmd::cmd_links(&schema, format)
        }
        SchemaAction::Rules { format } => {
            validate_format(format, &["text", "json"])?;
            schema_cmd::cmd_rules(&schema, format)
        }
        SchemaAction::Validate => schema_cmd::cmd_validate(&schema),
        SchemaAction::Info { name, format } => {
            let path = schemas_dir.join(format!("{name}.yaml"));
            let schema_file = if path.exists() {
                rivet_core::schema::Schema::load_file(&path)
                    .with_context(|| format!("loading schema {}", path.display()))?
            } else {
                rivet_core::embedded::load_embedded_schema(name)
                    .map_err(|e| anyhow::anyhow!("{e}"))?
            };
            schema_cmd::cmd_info(&schema_file, format)
        }
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
    let mut store = Store::new();
    for source in &config.sources {
        match rivet_core::load_artifacts(source, &cli.project, &schema) {
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
    validate_format(format, &["text", "json"])?;
    use std::collections::BTreeMap;

    // Load project config
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
        let artifacts = rivet_core::load_artifacts(source, &cli.project, &_schema)
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

fn cmd_baseline_list(cli: &Cli) -> Result<bool> {
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

    rivet_core::snapshot::write_to_file(&snap, &out_path).map_err(|e| anyhow::anyhow!("{e}"))?;

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
    validate_format(format, &["text", "json", "markdown"])?;
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

    let baseline =
        rivet_core::snapshot::read_from_file(&baseline_file).map_err(|e| anyhow::anyhow!("{e}"))?;

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
            let json = serde_json::to_string_pretty(&delta).context("serializing delta")?;
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
        .filter(|e| e.path().extension().is_some_and(|ext| ext == "json"))
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

// ── Variant commands ────────────────────────────────────────────────────

/// Scaffold a starter feature-model.yaml + bindings/<name>.yaml pair.
///
/// Files are annotated with comments documenting every field so the user
/// does not need to open `docs/feature-model-schema.md` to get started.
/// See that document for the full schema reference.
fn cmd_variant_init(name: &str, dir: &std::path::Path, force: bool) -> Result<bool> {
    if name.trim().is_empty() {
        anyhow::bail!("variant name cannot be empty");
    }

    let target = if dir == std::path::Path::new(".") {
        std::env::current_dir().context("resolving current directory")?
    } else {
        dir.to_path_buf()
    };

    std::fs::create_dir_all(&target)
        .with_context(|| format!("creating {}", target.display()))?;
    let bindings_dir = target.join("bindings");
    std::fs::create_dir_all(&bindings_dir)
        .with_context(|| format!("creating {}", bindings_dir.display()))?;

    let fm_path = target.join("feature-model.yaml");
    let binding_path = bindings_dir.join(format!("{name}.yaml"));

    if !force {
        for p in [&fm_path, &binding_path] {
            if p.exists() {
                anyhow::bail!(
                    "refusing to overwrite {} (use --force)",
                    p.display()
                );
            }
        }
    }

    let fm_yaml = r#"# feature-model.yaml — starter template.
# Full reference: docs/feature-model-schema.md
kind: feature-model

# `root` is the always-selected top of the feature tree.
root: product

# Every feature is declared under `features`.
#   group: one of `mandatory`, `optional`, `alternative`, `or`, `leaf`.
#   children: names of child features.
features:
  product:
    group: mandatory
    children: [base, extras]

  base:
    group: leaf

  extras:
    group: or
    children: [telemetry, auth]

  telemetry:
    group: leaf

  auth:
    group: leaf

# Cross-tree constraints (s-expression syntax).
#   Bare feature names mean "this feature is selected".
#   Supported forms: and, or, not, implies, excludes, forall, exists.
constraints:
  # - (implies auth telemetry)
  # - (excludes base telemetry)
"#;

    let binding_yaml = format!(
        r#"# bindings/{name}.yaml — starter template.
# Full reference: docs/feature-model-bindings.md

# `variant:` identifies which variant this file configures and records
# the user's feature selection. The solver adds root, ancestors, mandatory
# descendants, and constraint-implied features on top of `selects`.
variant:
  name: {name}
  selects: [telemetry]

# `bindings:` maps feature names to the artifacts and source files that
# implement them.
bindings:
  telemetry:
    artifacts: []           # e.g. [REQ-001, REQ-002]
    source: []              # e.g. ["src/telemetry/**"]
  auth:
    artifacts: []
    source: []
"#
    );

    std::fs::write(&fm_path, fm_yaml)
        .with_context(|| format!("writing {}", fm_path.display()))?;
    std::fs::write(&binding_path, binding_yaml)
        .with_context(|| format!("writing {}", binding_path.display()))?;

    println!("  wrote {}", fm_path.display());
    println!("  wrote {}", binding_path.display());
    println!();
    println!("Edit the files above, then run:");
    println!("  rivet variant list  --model {}", fm_path.display());
    println!(
        "  rivet variant check --model {} --variant {}",
        fm_path.display(),
        binding_path.display()
    );
    println!("See docs/feature-model-schema.md for the full schema.");

    Ok(true)
}

/// Check a variant configuration against a feature model.
fn cmd_variant_check(
    model_path: &std::path::Path,
    variant_path: &std::path::Path,
    format: &str,
) -> Result<bool> {
    validate_format(format, &["text", "json"])?;

    let model_yaml = std::fs::read_to_string(model_path)
        .with_context(|| format!("reading {}", model_path.display()))?;
    let model = rivet_core::feature_model::FeatureModel::from_yaml(&model_yaml)
        .map_err(|e| anyhow::anyhow!("{e}"))?;

    let variant_yaml = std::fs::read_to_string(variant_path)
        .with_context(|| format!("reading {}", variant_path.display()))?;
    let variant: rivet_core::feature_model::VariantConfig =
        serde_yaml::from_str(&variant_yaml).context("parsing variant config")?;

    match rivet_core::feature_model::solve(&model, &variant) {
        Ok(resolved) => {
            if format == "json" {
                let output = serde_json::json!({
                    "result": "PASS",
                    "variant": resolved.name,
                    "effective_features": resolved.effective_features,
                    "feature_count": resolved.effective_features.len(),
                });
                println!("{}", serde_json::to_string_pretty(&output)?);
            } else {
                println!("Variant '{}': PASS", resolved.name);
                println!(
                    "Effective features ({}):",
                    resolved.effective_features.len()
                );
                for f in &resolved.effective_features {
                    println!("  {f}");
                }
            }
            Ok(true)
        }
        Err(errors) => {
            if format == "json" {
                let errs: Vec<String> = errors.iter().map(|e| format!("{e:?}")).collect();
                let output = serde_json::json!({
                    "result": "FAIL",
                    "variant": variant.name,
                    "errors": errs,
                });
                println!("{}", serde_json::to_string_pretty(&output)?);
            } else {
                eprintln!("Variant '{}': FAIL", variant.name);
                for err in &errors {
                    eprintln!("  {err:?}");
                }
            }
            Ok(false)
        }
    }
}

/// List features in a feature model.
fn cmd_variant_list(model_path: &std::path::Path, format: &str) -> Result<bool> {
    validate_format(format, &["text", "json"])?;

    let model_yaml = std::fs::read_to_string(model_path)
        .with_context(|| format!("reading {}", model_path.display()))?;
    let model = rivet_core::feature_model::FeatureModel::from_yaml(&model_yaml)
        .map_err(|e| anyhow::anyhow!("{e}"))?;

    if format == "json" {
        let features: Vec<serde_json::Value> = model
            .features
            .values()
            .map(|f| {
                serde_json::json!({
                    "name": f.name,
                    "group": format!("{:?}", f.group).to_lowercase(),
                    "children": f.children,
                    "parent": f.parent,
                })
            })
            .collect();
        let output = serde_json::json!({
            "root": model.root,
            "feature_count": model.features.len(),
            "constraint_count": model.constraints.len(),
            "features": features,
        });
        println!("{}", serde_json::to_string_pretty(&output)?);
    } else {
        println!("Feature model (root: {})", model.root);
        println!(
            "{} features, {} constraints\n",
            model.features.len(),
            model.constraints.len()
        );
        print_feature_tree(&model, &model.root, 0);
    }

    Ok(true)
}

fn print_feature_tree(model: &rivet_core::feature_model::FeatureModel, name: &str, depth: usize) {
    use rivet_core::feature_model::GroupType;
    let indent = "  ".repeat(depth);
    if let Some(f) = model.features.get(name) {
        let group_label = match f.group {
            GroupType::Mandatory => " [mandatory]",
            GroupType::Optional => " [optional]",
            GroupType::Alternative => " [alternative]",
            GroupType::Or => " [or]",
            GroupType::Leaf => "",
        };
        println!("{indent}{name}{group_label}");
        for child in &f.children {
            print_feature_tree(model, child, depth + 1);
        }
    }
}

/// Solve a variant and optionally show bound artifacts.
fn cmd_variant_solve(
    cli: &Cli,
    model_path: &std::path::Path,
    variant_path: &std::path::Path,
    binding_path: Option<&std::path::Path>,
    format: &str,
) -> Result<bool> {
    validate_format(format, &["text", "json"])?;

    let model_yaml = std::fs::read_to_string(model_path)
        .with_context(|| format!("reading {}", model_path.display()))?;
    let model = rivet_core::feature_model::FeatureModel::from_yaml(&model_yaml)
        .map_err(|e| anyhow::anyhow!("{e}"))?;

    let variant_yaml = std::fs::read_to_string(variant_path)
        .with_context(|| format!("reading {}", variant_path.display()))?;
    let variant: rivet_core::feature_model::VariantConfig =
        serde_yaml::from_str(&variant_yaml).context("parsing variant config")?;

    let resolved = rivet_core::feature_model::solve(&model, &variant).map_err(|errs| {
        let msgs: Vec<String> = errs.iter().map(|e| format!("{e:?}")).collect();
        anyhow::anyhow!("variant check failed:\n  {}", msgs.join("\n  "))
    })?;

    let binding = if let Some(bp) = binding_path {
        let yaml =
            std::fs::read_to_string(bp).with_context(|| format!("reading {}", bp.display()))?;
        let b: rivet_core::feature_model::FeatureBinding =
            serde_yaml::from_str(&yaml).context("parsing binding")?;
        Some(b)
    } else {
        None
    };

    let bound_artifacts: Vec<String> = if let Some(ref b) = binding {
        resolved
            .effective_features
            .iter()
            .flat_map(|f| {
                b.bindings
                    .get(f)
                    .map(|bind| bind.artifacts.clone())
                    .unwrap_or_default()
            })
            .collect()
    } else {
        Vec::new()
    };

    if format == "json" {
        let output = serde_json::json!({
            "variant": resolved.name,
            "effective_features": resolved.effective_features,
            "feature_count": resolved.effective_features.len(),
            "bound_artifacts": bound_artifacts,
            "bound_artifact_count": bound_artifacts.len(),
        });
        println!("{}", serde_json::to_string_pretty(&output)?);
    } else {
        println!("Variant '{}': PASS", resolved.name);
        let features_list: Vec<&str> = resolved
            .effective_features
            .iter()
            .map(|s| s.as_str())
            .collect();
        println!(
            "Effective features ({}): {}",
            features_list.len(),
            features_list.join(", ")
        );

        if !bound_artifacts.is_empty() {
            println!("\nBound artifacts ({}):", bound_artifacts.len());
            for id in &bound_artifacts {
                println!("  {id}");
            }

            if let Ok(ctx) = ProjectContext::load(cli) {
                let found = bound_artifacts
                    .iter()
                    .filter(|id| ctx.store.get(id).is_some())
                    .count();
                println!(
                    "\nVariant scope: {found}/{} artifacts resolved in project",
                    bound_artifacts.len()
                );
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
    println!(
        "  Artifacts: {} ({})",
        baseline.stats.total as isize + delta.stats.total,
        sign(delta.stats.total)
    );
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
            if delta.diagnostics.new_count == 1 {
                ""
            } else {
                "s"
            },
        ));
    }
    if delta.diagnostics.resolved_count > 0 {
        md.push_str(&format!(
            "**{}** resolved diagnostic{}\n",
            delta.diagnostics.resolved_count,
            if delta.diagnostics.resolved_count == 1 {
                ""
            } else {
                "s"
            },
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

        let schemas_dir = resolve_schemas_dir(cli);
        let schema = rivet_core::load_schemas(&config.project.schemas, &schemas_dir)
            .context("loading schemas")?;

        let mut store = Store::new();
        for source in &config.sources {
            let artifacts = rivet_core::load_artifacts(source, &cli.project, &schema)
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
                            // Collect all IDs in this external so we can prefix
                            // internal link targets consistently.
                            let ext_ids: std::collections::HashSet<String> =
                                ext.artifacts.iter().map(|a| a.id.clone()).collect();
                            for mut artifact in ext.artifacts {
                                // Prefix external artifact IDs so they don't collide
                                artifact.id = format!("{}:{}", ext.prefix, artifact.id);
                                // Prefix link targets that reference artifacts within
                                // this same external project so they resolve correctly.
                                for link in &mut artifact.links {
                                    if ext_ids.contains(&link.target) {
                                        link.target = format!("{}:{}", ext.prefix, link.target);
                                    }
                                }
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
    #[allow(dead_code)]
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

/// Import test results or artifacts from external formats.
fn cmd_import_results(
    format: &str,
    file: &std::path::Path,
    output: &std::path::Path,
) -> Result<bool> {
    match format {
        "junit" => cmd_import_results_junit(file, output),
        "needs-json" => cmd_import_results_needs_json(file, output),
        other => {
            anyhow::bail!("unknown import format: '{other}' (supported: junit, needs-json)")
        }
    }
}

/// Import JUnit XML test results.
fn cmd_import_results_junit(file: &std::path::Path, output: &std::path::Path) -> Result<bool> {
    use rivet_core::junit::{ImportSummary, parse_junit_xml};
    use rivet_core::results::TestRunFile;

    let xml = std::fs::read_to_string(file)
        .with_context(|| format!("failed to read {}", file.display()))?;

    let runs = parse_junit_xml(&xml)
        .with_context(|| format!("failed to parse JUnit XML from {}", file.display()))?;

    if runs.is_empty() {
        println!("No test suites found in {}", file.display());
        return Ok(true);
    }

    std::fs::create_dir_all(output)
        .with_context(|| format!("failed to create output directory {}", output.display()))?;

    for run in &runs {
        let filename = format!("{}.yaml", run.run.id);
        let out_path = output.join(&filename);
        let run_file = TestRunFile {
            run: run.run.clone(),
            results: run.results.clone(),
        };
        let yaml = serde_yaml::to_string(&run_file).context("failed to serialize run to YAML")?;
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

/// Import sphinx-needs `needs.json` and write artifacts as generic YAML.
fn cmd_import_results_needs_json(file: &std::path::Path, output: &std::path::Path) -> Result<bool> {
    use rivet_core::formats::needs_json::{NeedsJsonConfig, import_needs_json};

    let content = std::fs::read_to_string(file)
        .with_context(|| format!("failed to read {}", file.display()))?;

    let config = NeedsJsonConfig::default();
    let artifacts = import_needs_json(&content, &config)
        .with_context(|| format!("failed to parse needs.json from {}", file.display()))?;

    if artifacts.is_empty() {
        println!("No needs found in {}", file.display());
        return Ok(true);
    }

    std::fs::create_dir_all(output)
        .with_context(|| format!("failed to create output directory {}", output.display()))?;

    // Export as generic YAML using the adapter's export function.
    let adapter = rivet_core::formats::generic::GenericYamlAdapter::new();
    let yaml = rivet_core::adapter::Adapter::export(
        &adapter,
        &artifacts,
        &rivet_core::adapter::AdapterConfig::default(),
    )
    .context("failed to serialize artifacts to generic YAML")?;

    let out_path = output.join("needs-import.yaml");
    std::fs::write(&out_path, &yaml)
        .with_context(|| format!("failed to write {}", out_path.display()))?;

    println!(
        "Imported {} artifacts from sphinx-needs → {}",
        artifacts.len(),
        out_path.display(),
    );

    // REQ-050: verify link targets exist within the imported set.
    let imported_ids: std::collections::HashSet<String> =
        artifacts.iter().map(|a| a.id.clone()).collect();
    let mut unresolved = Vec::new();
    for artifact in &artifacts {
        for link in &artifact.links {
            if !imported_ids.contains(&link.target) {
                unresolved.push(format!(
                    "  {} --[{}]--> {} (not found)",
                    artifact.id, link.link_type, link.target
                ));
            }
        }
    }
    drop(imported_ids);

    if !unresolved.is_empty() {
        eprintln!(
            "\nWarning: {} unresolved link target(s) in imported artifacts:",
            unresolved.len()
        );
        for msg in &unresolved {
            eprintln!("{msg}");
        }
        eprintln!("These links point to artifacts not present in the import.");
        eprintln!(
            "Run 'rivet validate' after adding to your project to check against existing artifacts."
        );
    }

    Ok(true)
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
    validate_format(format, &["text", "json"])?;
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
        provenance: None,
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
        set_description: None,
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

/// Stamp an artifact (or all artifacts in its file) with AI provenance metadata.
fn cmd_stamp(
    cli: &Cli,
    id: &str,
    created_by: &str,
    model: Option<&str>,
    session_id: Option<&str>,
    reviewed_by: Option<&str>,
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

    // Generate ISO 8601 timestamp using std (no chrono dependency)
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
    let timestamp = format!("{y:04}-{m:02}-{d:02}T{hours:02}:{minutes:02}:{seconds:02}Z");

    // Collect artifact IDs to stamp
    let ids: Vec<String> = if id == "all" {
        // Stamp every local artifact (skip externals with ':' prefix)
        store
            .iter()
            .filter(|a| !a.id.contains(':'))
            .map(|a| a.id.clone())
            .collect()
    } else {
        // Single artifact
        if !store.contains(id) {
            anyhow::bail!("artifact '{id}' does not exist");
        }
        vec![id.to_string()]
    };

    if ids.is_empty() {
        anyhow::bail!("no artifacts found to stamp");
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

    for (file_path, artifact_ids) in &by_file {
        let content = std::fs::read_to_string(file_path)
            .with_context(|| format!("reading {}", file_path.display()))?;

        let mut editor = rivet_core::yaml_edit::YamlEditor::parse(&content);

        for aid in artifact_ids {
            editor
                .set_provenance(
                    aid,
                    created_by,
                    model,
                    session_id,
                    Some(&timestamp),
                    reviewed_by,
                )
                .map_err(|e| anyhow::anyhow!("{e}"))?;
            stamped += 1;
        }

        std::fs::write(file_path, editor.to_string())
            .with_context(|| format!("writing {}", file_path.display()))?;
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
    validate_format(format, &["text", "html"])?;
    let schemas_dir = resolve_schemas_dir(cli);
    let project_path = cli
        .project
        .canonicalize()
        .unwrap_or_else(|_| cli.project.clone());

    let state = crate::serve::reload_state(&project_path, &schemas_dir, 0)
        .context("loading project for embed")?;

    let request =
        rivet_core::embed::EmbedRequest::parse(query).map_err(|e| anyhow::anyhow!("{e}"))?;

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

fn cmd_mcp(cli: &Cli) -> Result<bool> {
    let rt = tokio::runtime::Runtime::new().context("creating tokio runtime")?;
    rt.block_on(mcp::run(cli.project.clone()))?;
    Ok(true)
}

fn cmd_lsp(cli: &Cli) -> Result<bool> {
    use lsp_server::{Connection, Message, Response};
    use lsp_types::*;
    use rivet_core::db::RivetDatabase;

    eprintln!("rivet lsp: starting language server...");

    let (connection, io_threads) = Connection::stdio();

    let server_capabilities = ServerCapabilities {
        text_document_sync: Some(TextDocumentSyncCapability::Options(
            TextDocumentSyncOptions {
                open_close: Some(true),
                change: Some(TextDocumentSyncKind::FULL),
                save: Some(TextDocumentSyncSaveOptions::SaveOptions(SaveOptions {
                    include_text: Some(false),
                })),
                ..Default::default()
            },
        )),
        hover_provider: Some(HoverProviderCapability::Simple(true)),
        definition_provider: Some(OneOf::Left(true)),
        document_symbol_provider: Some(OneOf::Left(true)),
        completion_provider: Some(CompletionOptions {
            trigger_characters: Some(vec!["[".to_string(), ":".to_string()]),
            ..Default::default()
        }),
        code_action_provider: Some(CodeActionProviderCapability::Simple(true)),
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

    let config_opt = if config_path.exists() {
        match rivet_core::load_project_config(&config_path) {
            Ok(c) => Some(c),
            Err(e) => {
                eprintln!(
                    "rivet lsp: failed to load {}: {e} — running with empty state",
                    config_path.display()
                );
                None
            }
        }
    } else {
        eprintln!("rivet lsp: no rivet.yaml found, running with empty store");
        None
    };

    let (source_set, schema_set) = if let Some(config) = &config_opt {
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
            let _ = rivet_core::collect_yaml_files(&source_path, &mut source_pairs);
        }
        let source_refs: Vec<(&str, &str)> = source_pairs
            .iter()
            .map(|(p, c)| (p.as_str(), c.as_str()))
            .collect();
        let source_set = db.load_sources(&source_refs);

        (source_set, schema_set)
    } else {
        let schema_set = db.load_schemas(&[]);
        let source_set = db.load_sources(&[]);
        (source_set, schema_set)
    };

    // Build supplementary state for rendering
    let store = db.store(source_set, schema_set);
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

    // Publish initial diagnostics from salsa, plus document [[ID]] reference
    // validation.  validate_documents() checks that every [[ID]] wiki-link in
    // markdown documents points to an artifact that exists in the store;
    // broken refs are surfaced as LSP warnings in the source .md file.
    let mut diagnostics = db.diagnostics(source_set, schema_set);
    diagnostics.extend(validate::validate_documents(&doc_store, &store));
    let mut prev_diagnostic_files: std::collections::HashSet<std::path::PathBuf> =
        std::collections::HashSet::new();
    lsp_publish_salsa_diagnostics(
        &connection,
        &diagnostics,
        &store,
        &mut prev_diagnostic_files,
    );
    eprintln!(
        "rivet lsp: initialized with {} artifacts, {} documents (salsa incremental)",
        store.len(),
        doc_store.len()
    );

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
                        let store = db.store(source_set, schema_set);
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
                        let store = db.store(source_set, schema_set);
                        let result = lsp_goto_definition(&params, &store);
                        connection.sender.send(Message::Response(Response {
                            id: req.id,
                            result: Some(serde_json::to_value(result)?),
                            error: None,
                        }))?;
                    }
                    "textDocument/completion" => {
                        let params: CompletionParams = serde_json::from_value(req.params.clone())?;
                        let store = db.store(source_set, schema_set);
                        let schema = db.schema(schema_set);
                        let result = lsp_completion(&params, &store, &schema);
                        connection.sender.send(Message::Response(Response {
                            id: req.id,
                            result: Some(serde_json::to_value(result)?),
                            error: None,
                        }))?;
                    }
                    "textDocument/documentSymbol" => {
                        let params: DocumentSymbolParams =
                            serde_json::from_value(req.params.clone())?;
                        let path = lsp_uri_to_path(&params.text_document.uri);
                        let symbols = if let Some(path) = path {
                            let content = std::fs::read_to_string(&path).unwrap_or_default();
                            lsp_document_symbols(&content)
                        } else {
                            Vec::new()
                        };
                        let response = DocumentSymbolResponse::Nested(symbols);
                        connection.sender.send(Message::Response(Response {
                            id: req.id,
                            result: Some(serde_json::to_value(response)?),
                            error: None,
                        }))?;
                    }
                    "textDocument/codeAction" => {
                        let params: CodeActionParams = serde_json::from_value(req.params.clone())?;
                        let actions = lsp_code_actions(&params);
                        connection.sender.send(Message::Response(Response {
                            id: req.id,
                            result: Some(serde_json::to_value(actions)?),
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
                            baseline: None,
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
                    "textDocument/didOpen" => {
                        if let Ok(params) = serde_json::from_value::<DidOpenTextDocumentParams>(
                            notif.params.clone(),
                        ) {
                            let path = lsp_uri_to_path(&params.text_document.uri);
                            if let Some(path) = path {
                                let path_str = path.to_string_lossy().to_string();
                                let content = params.text_document.text;
                                let updated =
                                    db.update_source(source_set, &path_str, content.clone());
                                if !updated {
                                    // New file not yet tracked — add it to the source set
                                    if path_str.ends_with(".yaml") || path_str.ends_with(".yml") {
                                        db.add_source(source_set, &path_str, content);
                                        eprintln!(
                                            "rivet lsp: added new source file on open: {}",
                                            path_str
                                        );
                                    }
                                }
                                // Publish diagnostics for the opened file
                                let mut new_diagnostics = db.diagnostics(source_set, schema_set);
                                let new_store = db.store(source_set, schema_set);
                                new_diagnostics
                                    .extend(validate::validate_documents(&doc_store, &new_store));
                                lsp_publish_salsa_diagnostics(
                                    &connection,
                                    &new_diagnostics,
                                    &new_store,
                                    &mut prev_diagnostic_files,
                                );
                                eprintln!(
                                    "rivet lsp: didOpen diagnostics for {} ({} diagnostics)",
                                    path_str,
                                    new_diagnostics.len()
                                );
                            }
                        }
                    }
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
                                // and append document [[ID]] reference validation so
                                // broken wiki-links in markdown files are reported.
                                let mut new_diagnostics = db.diagnostics(source_set, schema_set);
                                let new_store = db.store(source_set, schema_set);
                                new_diagnostics
                                    .extend(validate::validate_documents(&doc_store, &new_store));
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
                                render_store = db.store(source_set, schema_set);
                                let render_schema = db.schema(schema_set);
                                render_graph = rivet_core::links::LinkGraph::build(
                                    &render_store,
                                    &render_schema,
                                );
                                diagnostics_cache = db.diagnostics(source_set, schema_set);
                                diagnostics_cache.extend(validate::validate_documents(
                                    &doc_store,
                                    &render_store,
                                ));

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
                                        let mut diagnostics =
                                            db.diagnostics(source_set, schema_set);
                                        let fresh_store = db.store(source_set, schema_set);
                                        diagnostics.extend(validate::validate_documents(
                                            &doc_store,
                                            &fresh_store,
                                        ));
                                        lsp_publish_salsa_diagnostics(
                                            &connection,
                                            &diagnostics,
                                            &fresh_store,
                                            &mut prev_diagnostic_files,
                                        );

                                        // Update render state so custom requests
                                        // (rivet/render, treeData, search) reflect edits
                                        render_store = fresh_store;
                                        render_graph = rivet_core::links::LinkGraph::build(
                                            &render_store,
                                            &render_schema,
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

    // Drop the connection to close the sender channel, allowing the
    // writer IO thread to finish. Without this, io_threads.join() would
    // deadlock because the writer thread blocks on the channel.
    drop(connection);
    io_threads.join()?;
    eprintln!("rivet lsp: shut down");
    Ok(true)
}

// ── LSP helpers ──────────────────────────────────────────────────────────

fn lsp_uri_to_path(uri: &lsp_types::Uri) -> Option<std::path::PathBuf> {
    let s = uri.as_str();
    // Handle both file:///path (Unix) and file:///C:/path (Windows)
    if let Some(rest) = s.strip_prefix("file://") {
        // On Unix: file:///foo → /foo (rest = "/foo")
        // On Windows: file:///C:/foo → C:/foo (rest = "/C:/foo", strip leading /)
        let path_str = if rest.len() > 2 && rest.starts_with('/') && rest.as_bytes()[2] == b':' {
            &rest[1..] // Windows: strip leading / before drive letter
        } else {
            rest
        };
        Some(std::path::PathBuf::from(
            urlencoding::decode(path_str).ok()?.into_owned(),
        ))
    } else {
        None
    }
}

fn lsp_path_to_uri(path: &std::path::Path) -> Option<lsp_types::Uri> {
    let path_str = path.to_string_lossy();
    // On Windows, paths like C:\foo need file:///C:/foo (three slashes)
    let s = if path_str.len() >= 2 && path_str.as_bytes()[1] == b':' {
        format!("file:///{}", path_str.replace('\\', "/"))
    } else {
        format!("file://{}", path_str)
    };
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
        // Resolve source file: parse errors have source_file directly,
        // validation diagnostics look up via artifact_id in the store.
        let (path, line) = if let Some(ref sf) = diag.source_file {
            // Parse error — use embedded line/column if available.
            let line = diag.line.unwrap_or(0);
            (sf.clone(), line)
        } else if let Some(ref art_id) = diag.artifact_id {
            let art = store.get(art_id);
            let sf = art.and_then(|a| a.source_file.as_ref());
            match sf {
                Some(path) => {
                    let line = lsp_find_artifact_line(path, art_id);
                    (path.clone(), line)
                }
                None => continue,
            }
        } else {
            continue;
        };
        let col = diag.column.unwrap_or(0);
        let end_col = if let Some(ref id) = diag.artifact_id {
            col + id.len() as u32 + 6 // "id: " + ID + some padding
        } else {
            col + 20 // reasonable default
        };
        file_diags
            .entry(path)
            .or_default()
            .push(lsp_types::Diagnostic {
                range: Range {
                    start: Position {
                        line,
                        character: col,
                    },
                    end: Position {
                        line,
                        character: end_col,
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

/// Extract document symbols (artifact IDs) from a YAML source string.
///
/// Walks the CST to find all SequenceItem nodes that contain a mapping with
/// an "id" key. Returns a flat list of `DocumentSymbol` values suitable for
/// the `textDocument/documentSymbol` LSP response.
#[allow(deprecated)] // DocumentSymbol.deprecated field is itself deprecated in lsp_types
fn lsp_document_symbols(source: &str) -> Vec<lsp_types::DocumentSymbol> {
    use rivet_core::yaml_cst;

    let (green, _errors) = yaml_cst::parse(source);
    let root = yaml_cst::SyntaxNode::new_root(green);
    let line_starts = yaml_cst::line_starts(source);

    let mut symbols = Vec::new();
    walk_for_symbols(&root, &mut symbols, &line_starts);
    symbols
}

/// Produce code actions (quick-fixes) for "missing required link" diagnostics.
///
/// The LSP client sends us the diagnostics that overlap the cursor range.
/// For each diagnostic whose message matches the cardinality pattern
/// (`requires at least` or `requires exactly`), we generate a workspace-edit
/// code action that inserts a TODO comment reminding the user to add the link.
#[allow(clippy::mutable_key_type)] // Uri has interior mutability but HashMap<Uri, _> is the lsp_types API
fn lsp_code_actions(params: &lsp_types::CodeActionParams) -> Vec<lsp_types::CodeActionOrCommand> {
    let uri = &params.text_document.uri;
    let mut actions = Vec::new();

    for diag in &params.context.diagnostics {
        // Only handle diagnostics produced by rivet
        if diag.source.as_deref() != Some("rivet") {
            continue;
        }

        // Match the two "missing link" message patterns from validate.rs:
        //   "link '<type>' requires at least 1 target, found 0"
        //   "link '<type>' requires exactly 1 target, found 0"
        let msg = &diag.message;
        let link_type = if msg.contains("requires at least") || msg.contains("requires exactly") {
            // Extract the link type name between the single quotes
            msg.split('\'').nth(1).map(|s| s.to_string())
        } else {
            None
        };

        let link_type = match link_type {
            Some(lt) => lt,
            None => continue,
        };

        // Build a TextEdit that inserts a TODO comment on the line after the
        // diagnostic range.  We place it at column 0 of the next line with
        // suitable indentation (4 spaces — typical YAML artifact indent).
        let insert_line = diag.range.end.line + 1;
        let insert_pos = lsp_types::Position {
            line: insert_line,
            character: 0,
        };
        let new_text = format!("    # TODO: add {link_type} link\n");

        let text_edit = lsp_types::TextEdit {
            range: lsp_types::Range {
                start: insert_pos,
                end: insert_pos,
            },
            new_text,
        };

        let mut changes = std::collections::HashMap::new();
        changes.insert(uri.clone(), vec![text_edit]);

        let action = lsp_types::CodeAction {
            title: format!("Add missing '{link_type}' link (TODO)"),
            kind: Some(lsp_types::CodeActionKind::QUICKFIX),
            diagnostics: Some(vec![diag.clone()]),
            edit: Some(lsp_types::WorkspaceEdit {
                changes: Some(changes),
                ..Default::default()
            }),
            is_preferred: Some(true),
            ..Default::default()
        };

        actions.push(lsp_types::CodeActionOrCommand::CodeAction(action));
    }

    actions
}

/// Recursively walk the CST looking for SequenceItem nodes that represent artifacts.
#[allow(deprecated)]
fn walk_for_symbols(
    node: &rivet_core::yaml_cst::SyntaxNode,
    symbols: &mut Vec<lsp_types::DocumentSymbol>,
    line_starts: &[u32],
) {
    use rivet_core::yaml_cst::SyntaxKind;

    if node.kind() == SyntaxKind::SequenceItem {
        if let Some(sym) = extract_symbol_from_item(node, line_starts) {
            symbols.push(sym);
            return; // don't recurse into children of matched items
        }
    }

    for child in node.children() {
        walk_for_symbols(&child, symbols, line_starts);
    }
}

/// Try to extract a `DocumentSymbol` from a SequenceItem node.
///
/// Returns `Some` if the item contains a mapping with an "id" key.
#[allow(deprecated)]
fn extract_symbol_from_item(
    item: &rivet_core::yaml_cst::SyntaxNode,
    line_starts: &[u32],
) -> Option<lsp_types::DocumentSymbol> {
    use rivet_core::yaml_cst::SyntaxKind;

    // The SequenceItem should contain a Mapping
    let mapping = item.children().find(|c| c.kind() == SyntaxKind::Mapping)?;

    let mut id: Option<String> = None;
    let mut id_range: Option<rowan::TextRange> = None;
    let mut title: Option<String> = None;
    let mut art_type: Option<String> = None;

    for entry in mapping.children() {
        if entry.kind() != SyntaxKind::MappingEntry {
            continue;
        }
        let key_node = entry.children().find(|c| c.kind() == SyntaxKind::Key)?;
        let key_text = cst_scalar_text(&key_node)?;
        let value_node = entry.children().find(|c| c.kind() == SyntaxKind::Value);

        match key_text.as_str() {
            "id" => {
                if let Some(ref vn) = value_node {
                    id = cst_scalar_text(vn);
                    id_range = Some(vn.text_range());
                }
            }
            "title" => {
                if let Some(ref vn) = value_node {
                    title = cst_scalar_text(vn);
                }
            }
            "type" => {
                if let Some(ref vn) = value_node {
                    art_type = cst_scalar_text(vn);
                }
            }
            _ => {}
        }
    }

    let id = id?;

    // Build detail string: "type — title" or just title or just type
    let detail = match (art_type, title) {
        (Some(t), Some(ti)) => Some(format!("{t} \u{2014} {ti}")),
        (Some(t), None) => Some(t),
        (None, Some(ti)) => Some(ti),
        (None, None) => None,
    };

    let item_range = item.text_range();
    let sel_range = id_range.unwrap_or(item_range);

    let range = text_range_to_lsp(item_range, line_starts);
    let selection_range = text_range_to_lsp(sel_range, line_starts);

    Some(lsp_types::DocumentSymbol {
        name: id,
        detail,
        kind: lsp_types::SymbolKind::OBJECT,
        tags: None,
        deprecated: None,
        range,
        selection_range,
        children: None,
    })
}

/// Extract the text of the first scalar token descended from a CST node.
///
/// Standalone version for the LSP helpers (mirrors `yaml_hir::scalar_text`).
fn cst_scalar_text(node: &rivet_core::yaml_cst::SyntaxNode) -> Option<String> {
    use rivet_core::yaml_cst::SyntaxKind;

    for token in node.descendants_with_tokens() {
        if let rowan::NodeOrToken::Token(t) = token {
            match t.kind() {
                SyntaxKind::SingleQuotedScalar => {
                    let raw = t.text().to_string();
                    return Some(raw[1..raw.len() - 1].replace("''", "'"));
                }
                SyntaxKind::DoubleQuotedScalar => {
                    let raw = t.text().to_string();
                    return Some(raw[1..raw.len() - 1].to_string());
                }
                SyntaxKind::PlainScalar => {
                    let mut text = t.text().to_string();
                    let mut next = t.next_sibling_or_token();
                    while let Some(sibling) = next {
                        match sibling {
                            rowan::NodeOrToken::Token(ref st) => match st.kind() {
                                SyntaxKind::Newline | SyntaxKind::Comment => break,
                                _ => {
                                    text.push_str(st.text());
                                    next = sibling.next_sibling_or_token();
                                }
                            },
                            rowan::NodeOrToken::Node(_) => break,
                        }
                    }
                    return Some(text.trim_end().to_string());
                }
                _ => {}
            }
        }
    }
    None
}

/// Convert a rowan `TextRange` to an LSP `Range` using a line-starts table.
fn text_range_to_lsp(tr: rowan::TextRange, line_starts: &[u32]) -> lsp_types::Range {
    use rivet_core::yaml_cst;

    let (start_line, start_col) = yaml_cst::offset_to_line_col(line_starts, u32::from(tr.start()));
    let (end_line, end_col) = yaml_cst::offset_to_line_col(line_starts, u32::from(tr.end()));

    lsp_types::Range {
        start: lsp_types::Position {
            line: start_line,
            character: start_col,
        },
        end: lsp_types::Position {
            line: end_line,
            character: end_col,
        },
    }
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

// ── LSP unit tests ─────────────────────────────────────────────────────

#[cfg(test)]
mod lsp_tests {
    use super::*;

    // ── lsp_word_at_position ───────────────────────────────────────────

    #[test]
    fn word_at_position_basic() {
        let content = "id: REQ-001\ntitle: hello world";
        assert_eq!(lsp_word_at_position(content, 0, 5), "REQ-001");
    }

    #[test]
    fn word_at_position_start_of_line() {
        let content = "REQ-001 is important";
        assert_eq!(lsp_word_at_position(content, 0, 0), "REQ-001");
    }

    #[test]
    fn word_at_position_end_of_word() {
        let content = "REQ-001 is important";
        // Cursor right after the last char of the word
        assert_eq!(lsp_word_at_position(content, 0, 7), "REQ-001");
    }

    #[test]
    fn word_at_position_middle_of_word() {
        let content = "links to SWREQ-042 here";
        assert_eq!(lsp_word_at_position(content, 0, 12), "SWREQ-042");
    }

    #[test]
    fn word_at_position_with_underscores() {
        let content = "some_long_identifier = 42";
        assert_eq!(lsp_word_at_position(content, 0, 5), "some_long_identifier");
    }

    #[test]
    fn word_at_position_empty_line() {
        let content = "line one\n\nline three";
        assert_eq!(lsp_word_at_position(content, 1, 0), "");
    }

    #[test]
    fn word_at_position_beyond_last_line() {
        let content = "only one line";
        assert_eq!(lsp_word_at_position(content, 5, 0), "");
    }

    #[test]
    fn word_at_position_cursor_on_whitespace() {
        let content = "hello   world";
        // Cursor in the whitespace gap — no word characters around it
        assert_eq!(lsp_word_at_position(content, 0, 6), "");
    }

    #[test]
    fn word_at_position_multiline() {
        let content = "first line\nsecond REQ-099 here\nthird";
        assert_eq!(lsp_word_at_position(content, 1, 10), "REQ-099");
    }

    #[test]
    fn word_at_position_cursor_past_end_of_line() {
        let content = "short";
        // Cursor at column 100 — beyond line length
        assert_eq!(lsp_word_at_position(content, 0, 100), "short");
    }

    #[test]
    fn word_at_position_special_chars_stop_word() {
        // Colon is not alphanumeric/dash/underscore, so it stops the word
        let content = "target: REQ-001";
        assert_eq!(lsp_word_at_position(content, 0, 0), "target");
        assert_eq!(lsp_word_at_position(content, 0, 8), "REQ-001");
    }

    // ── lsp_find_artifact_line ─────────────────────────────────────────

    #[test]
    fn find_artifact_line_basic() {
        let dir = tempfile::tempdir().unwrap();
        let path = dir.path().join("reqs.yaml");
        std::fs::write(
            &path,
            "artifacts:\n  - id: REQ-001\n    title: First\n  - id: REQ-002\n    title: Second\n",
        )
        .unwrap();

        assert_eq!(lsp_find_artifact_line(&path, "REQ-001"), 1);
        assert_eq!(lsp_find_artifact_line(&path, "REQ-002"), 3);
    }

    #[test]
    fn find_artifact_line_with_dash_prefix() {
        let dir = tempfile::tempdir().unwrap();
        let path = dir.path().join("items.yaml");
        std::fs::write(
            &path,
            "artifacts:\n- id: ITEM-A\n  title: Alpha\n- id: ITEM-B\n  title: Beta\n",
        )
        .unwrap();

        assert_eq!(lsp_find_artifact_line(&path, "ITEM-A"), 1);
        assert_eq!(lsp_find_artifact_line(&path, "ITEM-B"), 3);
    }

    #[test]
    fn find_artifact_line_not_found_returns_zero() {
        let dir = tempfile::tempdir().unwrap();
        let path = dir.path().join("reqs.yaml");
        std::fs::write(&path, "artifacts:\n  - id: REQ-001\n    title: First\n").unwrap();

        assert_eq!(lsp_find_artifact_line(&path, "NONEXISTENT"), 0);
    }

    #[test]
    fn find_artifact_line_nonexistent_file_returns_zero() {
        let path = std::path::PathBuf::from("/tmp/does_not_exist_at_all.yaml");
        assert_eq!(lsp_find_artifact_line(&path, "REQ-001"), 0);
    }

    #[test]
    fn find_artifact_line_distinguishes_id_prefixes() {
        // Ensure "REQ-00" does not match "REQ-001" (exact match only)
        let dir = tempfile::tempdir().unwrap();
        let path = dir.path().join("reqs.yaml");
        std::fs::write(
            &path,
            "artifacts:\n  - id: REQ-001\n    title: A\n  - id: REQ-00\n    title: B\n",
        )
        .unwrap();

        assert_eq!(lsp_find_artifact_line(&path, "REQ-001"), 1);
        assert_eq!(lsp_find_artifact_line(&path, "REQ-00"), 3);
    }

    // ── lsp_uri_to_path / lsp_path_to_uri ──────────────────────────────

    #[test]
    fn uri_to_path_roundtrip() {
        let path = std::path::Path::new("/tmp/project/reqs.yaml");
        let uri = lsp_path_to_uri(path).expect("should produce URI");
        let back = lsp_uri_to_path(&uri).expect("should parse back to path");
        assert_eq!(back, path);
    }

    #[test]
    fn uri_to_path_non_file_returns_none() {
        let uri: lsp_types::Uri = "https://example.com/foo".parse().unwrap();
        assert!(lsp_uri_to_path(&uri).is_none());
    }

    // ── Diagnostic → LSP mapping ───────────────────────────────────────

    /// Helper: build LSP diagnostics from validate::Diagnostic items without
    /// sending them over a connection. Mirrors the mapping logic in
    /// `lsp_publish_salsa_diagnostics`.
    fn map_diagnostics_to_lsp(
        diagnostics: &[validate::Diagnostic],
        store: &Store,
    ) -> std::collections::HashMap<PathBuf, Vec<lsp_types::Diagnostic>> {
        let mut file_diags: std::collections::HashMap<PathBuf, Vec<lsp_types::Diagnostic>> =
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
                let end_col = art_id.len() as u32 + 6; // "id: " + ID + some padding
                file_diags
                    .entry(path.clone())
                    .or_default()
                    .push(lsp_types::Diagnostic {
                        range: lsp_types::Range {
                            start: lsp_types::Position { line, character: 0 },
                            end: lsp_types::Position {
                                line,
                                character: end_col,
                            },
                        },
                        severity: Some(match diag.severity {
                            Severity::Error => lsp_types::DiagnosticSeverity::ERROR,
                            Severity::Warning => lsp_types::DiagnosticSeverity::WARNING,
                            Severity::Info => lsp_types::DiagnosticSeverity::INFORMATION,
                        }),
                        source: Some("rivet".to_string()),
                        message: diag.message.clone(),
                        ..Default::default()
                    });
            }
        }

        file_diags
    }

    #[test]
    fn diagnostic_maps_error_severity() {
        let dir = tempfile::tempdir().unwrap();
        let path = dir.path().join("reqs.yaml");
        std::fs::write(&path, "artifacts:\n  - id: REQ-001\n    title: Test\n").unwrap();

        let mut store = Store::new();
        store
            .insert(rivet_core::model::Artifact {
                id: "REQ-001".into(),
                artifact_type: "requirement".into(),
                title: "Test".into(),
                description: None,
                status: None,
                tags: vec![],
                links: vec![],
                fields: std::collections::BTreeMap::new(),
                provenance: None,
                source_file: Some(path.clone()),
            })
            .unwrap();

        let diagnostics = vec![validate::Diagnostic {
            severity: Severity::Error,
            artifact_id: Some("REQ-001".into()),
            rule: "known-type".into(),
            message: "unknown artifact type 'requirement'".into(),
            source_file: None,
            line: None,
            column: None,
        }];

        let mapped = map_diagnostics_to_lsp(&diagnostics, &store);
        let lsp_diags = mapped.get(&path).expect("should have diagnostics for file");
        assert_eq!(lsp_diags.len(), 1);
        assert_eq!(
            lsp_diags[0].severity,
            Some(lsp_types::DiagnosticSeverity::ERROR)
        );
        assert!(lsp_diags[0].message.contains("unknown artifact type"));
        assert_eq!(lsp_diags[0].range.start.line, 1); // line of "- id: REQ-001"
        assert_eq!(lsp_diags[0].source, Some("rivet".to_string()));
    }

    #[test]
    fn diagnostic_maps_warning_severity() {
        let dir = tempfile::tempdir().unwrap();
        let path = dir.path().join("design.yaml");
        std::fs::write(&path, "artifacts:\n  - id: DD-001\n    title: Decision\n").unwrap();

        let mut store = Store::new();
        store
            .insert(rivet_core::model::Artifact {
                id: "DD-001".into(),
                artifact_type: "design-decision".into(),
                title: "Decision".into(),
                description: None,
                status: None,
                tags: vec![],
                links: vec![],
                fields: std::collections::BTreeMap::new(),
                provenance: None,
                source_file: Some(path.clone()),
            })
            .unwrap();

        let diagnostics = vec![validate::Diagnostic {
            severity: Severity::Warning,
            artifact_id: Some("DD-001".into()),
            rule: "dd-must-satisfy".into(),
            message: "design-decision has no satisfies link".into(),
            source_file: None,
            line: None,
            column: None,
        }];

        let mapped = map_diagnostics_to_lsp(&diagnostics, &store);
        let lsp_diags = mapped.get(&path).unwrap();
        assert_eq!(lsp_diags.len(), 1);
        assert_eq!(
            lsp_diags[0].severity,
            Some(lsp_types::DiagnosticSeverity::WARNING)
        );
    }

    #[test]
    fn diagnostic_maps_info_severity() {
        let dir = tempfile::tempdir().unwrap();
        let path = dir.path().join("info.yaml");
        std::fs::write(&path, "artifacts:\n  - id: INFO-01\n    title: Note\n").unwrap();

        let mut store = Store::new();
        store
            .insert(rivet_core::model::Artifact {
                id: "INFO-01".into(),
                artifact_type: "note".into(),
                title: "Note".into(),
                description: None,
                status: None,
                tags: vec![],
                links: vec![],
                fields: std::collections::BTreeMap::new(),
                provenance: None,
                source_file: Some(path.clone()),
            })
            .unwrap();

        let diagnostics = vec![validate::Diagnostic {
            severity: Severity::Info,
            artifact_id: Some("INFO-01".into()),
            rule: "info-check".into(),
            message: "informational note".into(),
            source_file: None,
            line: None,
            column: None,
        }];

        let mapped = map_diagnostics_to_lsp(&diagnostics, &store);
        let lsp_diags = mapped.get(&path).unwrap();
        assert_eq!(
            lsp_diags[0].severity,
            Some(lsp_types::DiagnosticSeverity::INFORMATION)
        );
    }

    #[test]
    fn diagnostic_without_artifact_id_is_skipped() {
        let store = Store::new();
        let diagnostics = vec![validate::Diagnostic {
            severity: Severity::Error,
            artifact_id: None,
            rule: "schema-level".into(),
            message: "schema error".into(),
            source_file: None,
            line: None,
            column: None,
        }];

        let mapped = map_diagnostics_to_lsp(&diagnostics, &store);
        assert!(
            mapped.is_empty(),
            "diagnostics without artifact_id should be skipped"
        );
    }

    #[test]
    fn diagnostic_for_unknown_artifact_is_skipped() {
        let store = Store::new();
        let diagnostics = vec![validate::Diagnostic {
            severity: Severity::Error,
            artifact_id: Some("MISSING-001".into()),
            rule: "test".into(),
            message: "broken".into(),
            source_file: None,
            line: None,
            column: None,
        }];

        let mapped = map_diagnostics_to_lsp(&diagnostics, &store);
        assert!(
            mapped.is_empty(),
            "diagnostics for unknown artifacts should be skipped"
        );
    }

    #[test]
    fn multiple_diagnostics_grouped_by_file() {
        let dir = tempfile::tempdir().unwrap();
        let path_a = dir.path().join("a.yaml");
        let path_b = dir.path().join("b.yaml");
        std::fs::write(&path_a, "artifacts:\n  - id: A-001\n    title: Alpha\n").unwrap();
        std::fs::write(
            &path_b,
            "artifacts:\n  - id: B-001\n    title: Beta\n  - id: B-002\n    title: Gamma\n",
        )
        .unwrap();

        let mut store = Store::new();
        store
            .insert(rivet_core::model::Artifact {
                id: "A-001".into(),
                artifact_type: "req".into(),
                title: "Alpha".into(),
                description: None,
                status: None,
                tags: vec![],
                links: vec![],
                fields: std::collections::BTreeMap::new(),
                provenance: None,
                source_file: Some(path_a.clone()),
            })
            .unwrap();
        store
            .insert(rivet_core::model::Artifact {
                id: "B-001".into(),
                artifact_type: "req".into(),
                title: "Beta".into(),
                description: None,
                status: None,
                tags: vec![],
                links: vec![],
                fields: std::collections::BTreeMap::new(),
                provenance: None,
                source_file: Some(path_b.clone()),
            })
            .unwrap();
        store
            .insert(rivet_core::model::Artifact {
                id: "B-002".into(),
                artifact_type: "req".into(),
                title: "Gamma".into(),
                description: None,
                status: None,
                tags: vec![],
                links: vec![],
                fields: std::collections::BTreeMap::new(),
                provenance: None,
                source_file: Some(path_b.clone()),
            })
            .unwrap();

        let diagnostics = vec![
            validate::Diagnostic {
                severity: Severity::Error,
                artifact_id: Some("A-001".into()),
                rule: "test".into(),
                message: "error in A".into(),
                source_file: None,
                line: None,
                column: None,
            },
            validate::Diagnostic {
                severity: Severity::Warning,
                artifact_id: Some("B-001".into()),
                rule: "test".into(),
                message: "warning in B first".into(),
                source_file: None,
                line: None,
                column: None,
            },
            validate::Diagnostic {
                severity: Severity::Error,
                artifact_id: Some("B-002".into()),
                rule: "test".into(),
                message: "error in B second".into(),
                source_file: None,
                line: None,
                column: None,
            },
        ];

        let mapped = map_diagnostics_to_lsp(&diagnostics, &store);
        assert_eq!(mapped.len(), 2, "should have two files");
        assert_eq!(mapped[&path_a].len(), 1);
        assert_eq!(mapped[&path_b].len(), 2);
    }

    #[test]
    fn diagnostic_range_points_to_correct_line() {
        let dir = tempfile::tempdir().unwrap();
        let path = dir.path().join("multi.yaml");
        // Third artifact is at line 6 (0-indexed)
        std::fs::write(
            &path,
            "\
artifacts:
  - id: X-001
    title: First
  - id: X-002
    title: Second
  - id: X-003
    title: Third
",
        )
        .unwrap();

        let mut store = Store::new();
        store
            .insert(rivet_core::model::Artifact {
                id: "X-003".into(),
                artifact_type: "req".into(),
                title: "Third".into(),
                description: None,
                status: None,
                tags: vec![],
                links: vec![],
                fields: std::collections::BTreeMap::new(),
                provenance: None,
                source_file: Some(path.clone()),
            })
            .unwrap();

        let diagnostics = vec![validate::Diagnostic {
            severity: Severity::Error,
            artifact_id: Some("X-003".into()),
            rule: "test".into(),
            message: "problem with third".into(),
            source_file: None,
            line: None,
            column: None,
        }];

        let mapped = map_diagnostics_to_lsp(&diagnostics, &store);
        let lsp_diags = mapped.get(&path).unwrap();
        // "  - id: X-003" is on line 5 (0-indexed)
        assert_eq!(lsp_diags[0].range.start.line, 5);
        assert_eq!(lsp_diags[0].range.start.character, 0);
        assert_eq!(lsp_diags[0].range.end.character, 11); // "X-003".len() + 6
    }

    // ── documentSymbol ────────────────────────────────────────────────

    #[test]
    fn document_symbols_extracts_artifact_ids() {
        let yaml = "\
artifacts:
  - id: REQ-001
    type: requirement
    title: First requirement
  - id: REQ-002
    title: Second requirement
";
        let symbols = lsp_document_symbols(yaml);
        assert_eq!(symbols.len(), 2);
        assert_eq!(symbols[0].name, "REQ-001");
        assert_eq!(
            symbols[0].detail.as_deref(),
            Some("requirement \u{2014} First requirement")
        );
        assert_eq!(symbols[0].kind, lsp_types::SymbolKind::OBJECT);
        assert_eq!(symbols[1].name, "REQ-002");
        assert_eq!(symbols[1].detail.as_deref(), Some("Second requirement"));
    }

    #[test]
    fn document_symbols_empty_file() {
        let symbols = lsp_document_symbols("");
        assert!(symbols.is_empty());
    }

    #[test]
    fn document_symbols_no_id_key() {
        let yaml = "\
artifacts:
  - title: No ID here
    type: note
";
        let symbols = lsp_document_symbols(yaml);
        assert!(symbols.is_empty(), "items without id should be skipped");
    }

    #[test]
    fn document_symbols_ranges_are_valid() {
        let yaml = "\
artifacts:
  - id: A-001
    title: Alpha
  - id: A-002
    title: Beta
";
        let symbols = lsp_document_symbols(yaml);
        assert_eq!(symbols.len(), 2);

        // First symbol starts at line 1 (the "- id:" line)
        assert_eq!(symbols[0].range.start.line, 1);
        // Second symbol starts at line 3
        assert_eq!(symbols[1].range.start.line, 3);

        // Selection range should be within the full range
        assert!(symbols[0].selection_range.start.line >= symbols[0].range.start.line);
        assert!(symbols[0].selection_range.end.line <= symbols[0].range.end.line);
    }

    #[test]
    fn document_symbols_quoted_id() {
        let yaml = "\
artifacts:
  - id: 'REQ-Q01'
    title: Quoted ID
";
        let symbols = lsp_document_symbols(yaml);
        assert_eq!(symbols.len(), 1);
        assert_eq!(symbols[0].name, "REQ-Q01");
    }

    // ── Additional documentSymbol tests ────────────────────────────────

    #[test]
    fn document_symbols_skips_items_without_id() {
        let source = "artifacts:\n  - type: requirement\n    title: No ID\n";
        assert!(lsp_document_symbols(source).is_empty());
    }

    #[test]
    fn document_symbols_detail_includes_type_and_title() {
        let source = "artifacts:\n  - id: FEAT-001\n    type: feature\n    title: My Feature\n";
        let symbols = lsp_document_symbols(source);
        assert_eq!(symbols.len(), 1);
        let detail = symbols[0].detail.as_deref().unwrap_or("");
        assert!(
            detail.contains("feature"),
            "detail should contain type: {detail}"
        );
        assert!(
            detail.contains("My Feature"),
            "detail should contain title: {detail}"
        );
    }

    #[test]
    fn document_symbols_stpa_sections() {
        let source = "losses:\n  - id: L-1\n    title: Loss one\nhazards:\n  - id: H-1\n    title: Hazard one\n";
        let symbols = lsp_document_symbols(source);
        assert_eq!(symbols.len(), 2);
    }
}

#[cfg(test)]
mod stats_tests {
    use super::*;
    use rivet_core::store::Store;

    fn make_artifact(id: &str, art_type: &str) -> rivet_core::model::Artifact {
        rivet_core::model::Artifact {
            id: id.into(),
            artifact_type: art_type.into(),
            title: format!("Title of {id}"),
            description: None,
            status: None,
            tags: vec![],
            links: vec![],
            fields: Default::default(),
            provenance: None,
            source_file: None,
        }
    }

    #[test]
    fn stats_total_equals_sum_of_type_counts() {
        let mut store = Store::new();
        store.upsert(make_artifact("R-1", "req"));
        store.upsert(make_artifact("R-2", "req"));
        store.upsert(make_artifact("F-1", "feat"));
        store.upsert(make_artifact("H-1", "hazard"));

        let schema = rivet_core::schema::Schema::merge(&[]);
        let graph = LinkGraph::build(&store, &schema);
        let stats = compute_stats(&store, &graph);

        let sum: usize = stats.type_counts.iter().map(|(_, c)| c).sum();
        assert_eq!(
            stats.total, sum,
            "stats total ({}) must equal sum of type counts ({})",
            stats.total, sum,
        );
        assert_eq!(stats.total, store.len());
    }

    #[test]
    fn stats_total_consistent_after_type_change() {
        let mut store = Store::new();
        store.upsert(make_artifact("A-1", "req"));
        store.upsert(make_artifact("A-2", "req"));
        store.upsert(make_artifact("A-3", "feat"));
        // Change A-1's type
        store.upsert(make_artifact("A-1", "feat"));

        let schema = rivet_core::schema::Schema::merge(&[]);
        let graph = LinkGraph::build(&store, &schema);
        let stats = compute_stats(&store, &graph);

        let sum: usize = stats.type_counts.iter().map(|(_, c)| c).sum();
        assert_eq!(
            stats.total, sum,
            "after type change: total ({}) must equal sum of type counts ({})",
            stats.total, sum,
        );
        assert_eq!(stats.total, 3);
        // No phantom types with 0 count
        for (name, count) in &stats.type_counts {
            assert!(
                *count > 0,
                "type '{name}' has 0 count but still appears in stats"
            );
        }
    }
}
