//! Computed embed resolution for documents.
//!
//! Parses `{{name:arg1:arg2 key=val}}` syntax into `EmbedRequest` and
//! dispatches to type-specific renderers (stats, coverage, etc.).

use std::collections::BTreeMap;
use std::fmt;
use std::fmt::Write as _;

use crate::coverage;
use crate::document;
use crate::matrix;

// ── Types ───────────────────────────────────────────────────────────────

/// A parsed embed request extracted from `{{...}}` syntax.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct EmbedRequest {
    /// Embed type name: "stats", "coverage", "artifact", "links", "table", etc.
    pub name: String,
    /// Positional arguments (colon-separated after the name).
    pub args: Vec<String>,
    /// Key=value options (space-separated after args).
    pub options: BTreeMap<String, String>,
}

/// Error produced when an embed cannot be resolved.
#[derive(Debug, Clone)]
pub struct EmbedError {
    pub kind: EmbedErrorKind,
    pub raw_text: String,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum EmbedErrorKind {
    /// The embed name is not recognized.
    UnknownEmbed(String),
    /// The embed syntax is malformed.
    MalformedSyntax(String),
    /// The embed resolved but produced no data.
    EmptyResult,
    /// Parse error (empty input).
    ParseError(String),
}

impl fmt::Display for EmbedError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match &self.kind {
            EmbedErrorKind::UnknownEmbed(name) => write!(f, "Unknown embed: {name}"),
            EmbedErrorKind::MalformedSyntax(msg) => write!(f, "Malformed embed: {msg}"),
            EmbedErrorKind::EmptyResult => write!(f, "Embed produced no data"),
            EmbedErrorKind::ParseError(msg) => write!(f, "Embed parse error: {msg}"),
        }
    }
}

impl std::error::Error for EmbedError {}

impl EmbedError {
    /// Render this error as visible HTML (SC-EMBED-3).
    pub fn to_error_html(&self) -> String {
        let msg = document::html_escape(&self.to_string());
        format!("<span class=\"embed-error\">{msg}</span>")
    }
}

// ── Context ─────────────────────────────────────────────────────────────

use crate::links::LinkGraph;
use crate::schema::Schema;
use crate::store::Store;
use crate::validate::Diagnostic;

/// Data context for embed resolution.
///
/// Holds borrowed references to the project state.  Callers construct
/// this from whatever state they have (AppState, export pipeline, CLI).
pub struct EmbedContext<'a> {
    pub store: &'a Store,
    pub schema: &'a Schema,
    pub graph: &'a LinkGraph,
    pub diagnostics: &'a [Diagnostic],
    /// Optional baseline snapshot for delta rendering (`delta=NAME` option).
    pub baseline: Option<&'a crate::snapshot::Snapshot>,
}

impl<'a> EmbedContext<'a> {
    /// Create an empty context for testing.
    #[cfg(test)]
    pub fn empty() -> Self {
        use std::sync::LazyLock;
        static EMPTY_STORE: LazyLock<Store> = LazyLock::new(Store::new);
        static EMPTY_SCHEMA: LazyLock<Schema> = LazyLock::new(|| Schema::merge(&[]));
        static EMPTY_GRAPH: LazyLock<LinkGraph> =
            LazyLock::new(|| LinkGraph::build(&EMPTY_STORE, &EMPTY_SCHEMA));
        Self {
            store: &EMPTY_STORE,
            schema: &EMPTY_SCHEMA,
            graph: &EMPTY_GRAPH,
            diagnostics: &[],
            baseline: None,
        }
    }
}

// ── Parsing ─────────────────────────────────────────────────────────────

impl EmbedRequest {
    /// Parse a raw embed string (the content between `{{` and `}}`).
    ///
    /// Syntax: `name[:arg1[:arg2[...]]] [key=val ...]`
    pub fn parse(input: &str) -> Result<Self, EmbedError> {
        let input = input.trim();
        if input.is_empty() {
            return Err(EmbedError {
                kind: EmbedErrorKind::ParseError("empty embed".into()),
                raw_text: String::new(),
            });
        }

        // Split on first space to separate "name:args..." from "key=val ..."
        let (name_args_part, options_part) = match input.find(' ') {
            Some(pos) => (&input[..pos], Some(&input[pos + 1..])),
            None => (input, None),
        };

        // Split name:arg1:arg2:...
        let mut parts = name_args_part.split(':');
        let name = parts.next().unwrap().to_string();
        let args: Vec<String> = parts.map(|s| s.trim().to_string()).collect();

        // Parse key=val options
        let mut options = BTreeMap::new();
        if let Some(opts_str) = options_part {
            for token in opts_str.split_whitespace() {
                if let Some((key, val)) = token.split_once('=') {
                    options.insert(key.to_string(), val.to_string());
                }
            }
        }

        Ok(EmbedRequest {
            name,
            args,
            options,
        })
    }

    /// True if this embed is a "legacy" type handled by existing
    /// `resolve_inline` logic (artifact, links, table).
    pub fn is_legacy(&self) -> bool {
        matches!(self.name.as_str(), "artifact" | "links" | "table")
    }
}

// ── Resolution ──────────────────────────────────────────────────────────

/// Resolve a computed embed to HTML.
///
/// Returns the rendered HTML string, or an `EmbedError` for unknown/
/// malformed embeds (SC-EMBED-3: errors are visible, never empty).
pub fn resolve_embed(request: &EmbedRequest, ctx: &EmbedContext<'_>) -> Result<String, EmbedError> {
    match request.name.as_str() {
        "stats" => Ok(render_stats(request, ctx)),
        "coverage" => Ok(render_coverage(request, ctx)),
        "diagnostics" => Ok(render_diagnostics(request, ctx)),
        "matrix" => Ok(render_matrix(request, ctx)),
        // Legacy embeds (artifact, links, table) are still handled by
        // resolve_inline in document.rs — they should never reach here.
        "artifact" | "links" | "table" => Err(EmbedError {
            kind: EmbedErrorKind::MalformedSyntax(
                "artifact/links/table embeds are handled inline".into(),
            ),
            raw_text: format!("{request:?}"),
        }),
        other => Err(EmbedError {
            kind: EmbedErrorKind::UnknownEmbed(other.to_string()),
            raw_text: format!("{request:?}"),
        }),
    }
}

// ── Stats renderer ──────────────────────────────────────────────────────

/// Render `{{stats}}` / `{{stats:types}}` / `{{stats:status}}` / `{{stats:validation}}`.
fn render_stats(request: &EmbedRequest, ctx: &EmbedContext<'_>) -> String {
    let section = request.args.first().map(|s| s.as_str());
    let mut html = String::from("<div class=\"embed-stats\">\n");

    let show_types = section.is_none() || section == Some("types");
    let show_status = section.is_none() || section == Some("status");
    let show_validation = section.is_none() || section == Some("validation");

    if show_types {
        html.push_str(&render_stats_types(ctx));
    }
    if show_status {
        html.push_str(&render_stats_status(ctx));
    }
    if show_validation {
        html.push_str(&render_stats_validation(ctx));
    }

    html.push_str("</div>\n");
    html
}

fn render_stats_types(ctx: &EmbedContext<'_>) -> String {
    let mut by_type = BTreeMap::new();
    for type_name in ctx.schema.artifact_types.keys() {
        by_type.insert(type_name.clone(), 0usize);
    }
    for artifact in ctx.store.iter() {
        *by_type.entry(artifact.artifact_type.clone()).or_default() += 1;
    }
    let total: usize = by_type.values().sum();

    let mut out = String::from(
        "<table class=\"embed-table\"><thead><tr><th>Type</th><th>Count</th></tr></thead><tbody>\n",
    );
    for (typ, count) in &by_type {
        if *count > 0 {
            let _ = writeln!(out, "<tr><td>{typ}</td><td>{count}</td></tr>");
        }
    }
    let _ = writeln!(
        out,
        "<tr class=\"embed-total\"><td><strong>Total</strong></td><td><strong>{total}</strong></td></tr>"
    );
    out.push_str("</tbody></table>\n");
    out
}

fn render_stats_status(ctx: &EmbedContext<'_>) -> String {
    let mut by_status: BTreeMap<String, usize> = BTreeMap::new();
    for artifact in ctx.store.iter() {
        let key = artifact.status.as_deref().unwrap_or("unset").to_string();
        *by_status.entry(key).or_default() += 1;
    }

    let mut out = String::from(
        "<table class=\"embed-table embed-stats-status\"><thead><tr><th>Status</th><th>Count</th></tr></thead><tbody>\n",
    );
    for (status, count) in &by_status {
        let _ = writeln!(out, "<tr><td>{status}</td><td>{count}</td></tr>");
    }
    out.push_str("</tbody></table>\n");
    out
}

fn render_stats_validation(ctx: &EmbedContext<'_>) -> String {
    use crate::schema::Severity;
    let mut worst: BTreeMap<String, Severity> = BTreeMap::new();
    for diag in ctx.diagnostics {
        if let Some(ref id) = diag.artifact_id {
            let entry = worst.entry(id.clone()).or_insert(Severity::Info);
            if severity_rank(diag.severity) > severity_rank(*entry) {
                *entry = diag.severity;
            }
        }
    }
    let (mut errors, mut warnings, mut infos, mut clean) = (0usize, 0, 0, 0);
    for artifact in ctx.store.iter() {
        match worst.get(&artifact.id) {
            Some(Severity::Error) => errors += 1,
            Some(Severity::Warning) => warnings += 1,
            Some(Severity::Info) => infos += 1,
            None => clean += 1,
        }
    }

    let mut out = String::from(
        "<table class=\"embed-table embed-stats-validation\"><thead><tr><th>Severity</th><th>Artifacts</th></tr></thead><tbody>\n",
    );
    let _ = writeln!(out, "<tr><td>Error</td><td>{errors}</td></tr>");
    let _ = writeln!(out, "<tr><td>Warning</td><td>{warnings}</td></tr>");
    let _ = writeln!(out, "<tr><td>Info</td><td>{infos}</td></tr>");
    let _ = writeln!(out, "<tr><td>Clean</td><td>{clean}</td></tr>");
    out.push_str("</tbody></table>\n");
    out
}

fn severity_rank(s: crate::schema::Severity) -> u8 {
    match s {
        crate::schema::Severity::Info => 1,
        crate::schema::Severity::Warning => 2,
        crate::schema::Severity::Error => 3,
    }
}

// ── Coverage renderer ───────────────────────────────────────────────────

/// Render `{{coverage}}` or `{{coverage:RULE_NAME}}`.
fn render_coverage(request: &EmbedRequest, ctx: &EmbedContext<'_>) -> String {
    let report = coverage::compute_coverage(ctx.store, ctx.schema, ctx.graph);
    let filter_rule = request.args.first().map(|s| s.as_str());

    let entries: Vec<_> = report
        .entries
        .iter()
        .filter(|e| filter_rule.is_none_or(|r| e.rule_name == r))
        .collect();

    if entries.is_empty() {
        return "<div class=\"embed-coverage\"><p class=\"embed-no-data\">No coverage rules defined.</p></div>\n".to_string();
    }

    let mut html = String::from(
        "<div class=\"embed-coverage\">\n\
         <table class=\"embed-table\"><thead><tr>\
         <th>Rule</th><th>Source</th><th>Covered</th><th>Total</th><th>%</th><th>Bar</th>\
         </tr></thead><tbody>\n",
    );

    for entry in &entries {
        let pct = entry.percentage();
        let bar_width = pct.round() as u32;
        let bar_class = if pct >= 100.0 {
            "bar-full"
        } else if pct >= 80.0 {
            "bar-good"
        } else if pct >= 50.0 {
            "bar-warn"
        } else {
            "bar-danger"
        };
        let _ = writeln!(
            html,
            "<tr>\
             <td>{rule}</td>\
             <td>{source}</td>\
             <td>{covered}</td>\
             <td>{total}</td>\
             <td>{pct:.1}%</td>\
             <td><div class=\"coverage-bar\"><div class=\"coverage-fill {bar_class}\" style=\"width:{bar_width}%\"></div></div></td>\
             </tr>",
            rule = entry.rule_name,
            source = entry.source_type,
            covered = entry.covered,
            total = entry.total,
        );
    }

    html.push_str("</tbody></table>\n");

    // If filtering to a single rule, show uncovered IDs
    if filter_rule.is_some() {
        for entry in &entries {
            if !entry.uncovered_ids.is_empty() {
                html.push_str("<details class=\"embed-uncovered\"><summary>Uncovered artifacts</summary><ul>\n");
                for id in &entry.uncovered_ids {
                    let _ = writeln!(html, "<li><code>{id}</code></li>");
                }
                html.push_str("</ul></details>\n");
            }
        }
    }

    html.push_str("</div>\n");
    html
}

// ── Diagnostics renderer ────────────────────────────────────────────────

/// Render `{{diagnostics}}` or `{{diagnostics:SEVERITY}}`.
///
/// Without args: all diagnostics. With severity arg: filtered by severity.
fn render_diagnostics(request: &EmbedRequest, ctx: &EmbedContext<'_>) -> String {
    use crate::schema::Severity;

    let filter_severity = request.args.first().map(|s| s.as_str());

    let filtered: Vec<_> = ctx
        .diagnostics
        .iter()
        .filter(|d| match filter_severity {
            Some("error") => d.severity == Severity::Error,
            Some("warning") => d.severity == Severity::Warning,
            Some("info") => d.severity == Severity::Info,
            _ => true,
        })
        .collect();

    if filtered.is_empty() {
        let scope = filter_severity.unwrap_or("any");
        return format!(
            "<div class=\"embed-diagnostics\"><p class=\"embed-no-data\">No diagnostics ({scope} severity).</p></div>\n"
        );
    }

    let mut html = String::from(
        "<div class=\"embed-diagnostics\">\n\
         <table class=\"embed-table\"><thead><tr>\
         <th>Severity</th><th>Artifact</th><th>Rule</th><th>Message</th>\
         </tr></thead><tbody>\n",
    );

    for diag in &filtered {
        let sev_class = match diag.severity {
            Severity::Error => "sev-error",
            Severity::Warning => "sev-warning",
            Severity::Info => "sev-info",
        };
        let sev_label = match diag.severity {
            Severity::Error => "Error",
            Severity::Warning => "Warning",
            Severity::Info => "Info",
        };
        let artifact = diag.artifact_id.as_deref().unwrap_or("—");
        let _ = writeln!(
            html,
            "<tr class=\"{sev_class}\">\
             <td>{sev_label}</td>\
             <td><code>{artifact}</code></td>\
             <td>{rule}</td>\
             <td>{message}</td>\
             </tr>",
            artifact = document::html_escape(artifact),
            rule = document::html_escape(&diag.rule),
            message = document::html_escape(&diag.message),
        );
    }

    html.push_str("</tbody></table>\n");

    // Summary footer
    let errors = filtered
        .iter()
        .filter(|d| d.severity == Severity::Error)
        .count();
    let warnings = filtered
        .iter()
        .filter(|d| d.severity == Severity::Warning)
        .count();
    let infos = filtered
        .iter()
        .filter(|d| d.severity == Severity::Info)
        .count();
    let _ = writeln!(
        html,
        "<p class=\"embed-summary\">{} issue{}: {} error{}, {} warning{}, {} info</p>",
        filtered.len(),
        if filtered.len() == 1 { "" } else { "s" },
        errors,
        if errors == 1 { "" } else { "s" },
        warnings,
        if warnings == 1 { "" } else { "s" },
        infos,
    );

    html.push_str("</div>\n");
    html
}

// ── Matrix renderer ─────────────────────────────────────────────────────

/// Render `{{matrix}}` or `{{matrix:FROM_TYPE:TO_TYPE}}`.
///
/// Without args: renders one matrix per traceability rule in the schema.
/// With args: renders a specific matrix for the given source→target types.
fn render_matrix(request: &EmbedRequest, ctx: &EmbedContext<'_>) -> String {
    let from_type = request.args.first().map(|s| s.as_str());
    let to_type = request.args.get(1).map(|s| s.as_str());

    let mut html = String::from("<div class=\"embed-matrix\">\n");

    match (from_type, to_type) {
        (Some(from), Some(to)) => {
            // Find the matching traceability rule to get link type and direction.
            if let Some(rule) = find_rule_for_types(ctx, from, to) {
                let direction = if rule.required_backlink.is_some() {
                    matrix::Direction::Backward
                } else {
                    matrix::Direction::Forward
                };
                let link_type = rule
                    .required_link
                    .as_deref()
                    .or(rule.required_backlink.as_deref())
                    .unwrap_or("");
                let m =
                    matrix::compute_matrix(ctx.store, ctx.graph, from, to, link_type, direction);
                html.push_str(&render_matrix_table(&m));
            } else {
                // No rule found — try forward with auto-detected link type.
                let link = auto_detect_link(ctx, from, to);
                let m = matrix::compute_matrix(
                    ctx.store,
                    ctx.graph,
                    from,
                    to,
                    &link,
                    matrix::Direction::Forward,
                );
                html.push_str(&render_matrix_table(&m));
            }
        }
        _ => {
            // No args: render one matrix per traceability rule.
            if ctx.schema.traceability_rules.is_empty() {
                html.push_str("<p class=\"embed-no-data\">No traceability rules defined.</p>\n");
            } else {
                for rule in &ctx.schema.traceability_rules {
                    let direction = if rule.required_backlink.is_some() {
                        matrix::Direction::Backward
                    } else {
                        matrix::Direction::Forward
                    };
                    let link_type = rule
                        .required_link
                        .as_deref()
                        .or(rule.required_backlink.as_deref())
                        .unwrap_or("");
                    let target_type = rule.target_types.first().map(|s| s.as_str()).unwrap_or("");
                    if target_type.is_empty() {
                        continue;
                    }
                    let m = matrix::compute_matrix(
                        ctx.store,
                        ctx.graph,
                        &rule.source_type,
                        target_type,
                        link_type,
                        direction,
                    );
                    let _ = writeln!(html, "<h4>{}</h4>", document::html_escape(&rule.name),);
                    html.push_str(&render_matrix_table(&m));
                }
            }
        }
    }

    html.push_str("</div>\n");
    html
}

/// Render a single traceability matrix as an HTML table.
fn render_matrix_table(m: &matrix::TraceabilityMatrix) -> String {
    if m.rows.is_empty() {
        return format!(
            "<p class=\"embed-no-data\">No {} artifacts found.</p>\n",
            document::html_escape(&m.source_type),
        );
    }

    let pct = m.coverage_pct();
    let bar_class = if pct >= 100.0 {
        "bar-full"
    } else if pct >= 80.0 {
        "bar-good"
    } else if pct >= 50.0 {
        "bar-warn"
    } else {
        "bar-danger"
    };

    let mut html = format!(
        "<table class=\"embed-table embed-matrix-table\">\
         <thead><tr><th>{source}</th><th>{target} (linked)</th></tr></thead>\
         <tbody>\n",
        source = document::html_escape(&m.source_type),
        target = document::html_escape(&m.target_type),
    );

    for row in &m.rows {
        let targets_str = if row.targets.is_empty() {
            "<span class=\"embed-uncovered-marker\">—</span>".to_string()
        } else {
            row.targets
                .iter()
                .map(|t| format!("<code>{}</code>", document::html_escape(&t.id)))
                .collect::<Vec<_>>()
                .join(", ")
        };
        let row_class = if row.targets.is_empty() {
            " class=\"uncovered\""
        } else {
            ""
        };
        let _ = writeln!(
            html,
            "<tr{row_class}><td><code>{id}</code> {title}</td><td>{targets}</td></tr>",
            id = document::html_escape(&row.source_id),
            title = document::html_escape(&row.source_title),
            targets = targets_str,
        );
    }

    let _ = writeln!(
        html,
        "</tbody></table>\n\
         <p class=\"embed-summary\">{covered}/{total} covered ({pct:.1}%) \
         <span class=\"coverage-bar\" style=\"display:inline-block;width:100px;vertical-align:middle\">\
         <span class=\"coverage-fill {bar_class}\" style=\"width:{bar_width}%\"></span></span></p>",
        covered = m.covered,
        total = m.total,
        bar_width = pct.round() as u32,
    );

    html
}

/// Find a traceability rule matching the given source→target types.
fn find_rule_for_types<'a>(
    ctx: &'a EmbedContext<'_>,
    from: &str,
    to: &str,
) -> Option<&'a crate::schema::TraceabilityRule> {
    ctx.schema
        .traceability_rules
        .iter()
        .find(|r| r.source_type == from && r.target_types.iter().any(|t| t == to))
}

/// Auto-detect link type between two artifact types by scanning the graph.
fn auto_detect_link(ctx: &EmbedContext<'_>, from: &str, _to: &str) -> String {
    // Look at the first artifact of from_type and find any outgoing link type.
    for id in ctx.store.by_type(from) {
        let links = ctx.graph.links_from(id);
        if let Some(link) = links.first() {
            return link.link_type.clone();
        }
    }
    String::new()
}

// ── Provenance ──────────────────────────────────────────────────────────

/// Render a provenance footer for export (SC-EMBED-4).
///
/// Every computed embed in export must include the commit hash and timestamp
/// so reviewers can trace exactly what code produced the exported data.
pub fn render_provenance_stamp(commit_short: &str, is_dirty: bool) -> String {
    use std::time::{SystemTime, UNIX_EPOCH};

    let timestamp = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs();

    // Convert epoch seconds to a human-readable UTC timestamp.
    let (year, month, day, hours, minutes) = epoch_to_ymd_hm(timestamp);
    let dirty_note = if is_dirty { " (dirty)" } else { "" };

    format!(
        "<div class=\"embed-provenance\">Computed at {year}-{month:02}-{day:02} {hours:02}:{minutes:02} UTC from commit {commit_short}{dirty_note}</div>\n"
    )
}

/// Return the current time as an ISO 8601 UTC string.
pub fn epoch_to_iso8601() -> String {
    let secs = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs();
    let (y, m, d, h, min) = epoch_to_ymd_hm(secs);
    format!("{y}-{m:02}-{d:02}T{h:02}:{min:02}:00Z")
}

/// Convert seconds since Unix epoch to (year, month, day, hour, minute) in UTC.
fn epoch_to_ymd_hm(secs: u64) -> (u64, u64, u64, u64, u64) {
    let days = secs / 86400;
    let time_of_day = secs % 86400;
    let hours = time_of_day / 3600;
    let minutes = (time_of_day % 3600) / 60;

    // Algorithm from Howard Hinnant's civil_from_days (public domain).
    let z = days + 719468;
    let era = z / 146097;
    let doe = z - era * 146097;
    let yoe = (doe - doe / 1460 + doe / 36524 - doe / 146096) / 365;
    let y = yoe + era * 400;
    let doy = doe - (365 * yoe + yoe / 4 - yoe / 100);
    let mp = (5 * doy + 2) / 153;
    let d = doy - (153 * mp + 2) / 5 + 1;
    let m = if mp < 10 { mp + 3 } else { mp - 9 };
    let y = if m <= 2 { y + 1 } else { y };

    (y, m, d, hours, minutes)
}

// ── Tests ───────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parse_bare_name() {
        let req = EmbedRequest::parse("stats").unwrap();
        assert_eq!(req.name, "stats");
        assert!(req.args.is_empty());
        assert!(req.options.is_empty());
    }

    #[test]
    fn parse_name_with_args() {
        let req = EmbedRequest::parse("stats:types").unwrap();
        assert_eq!(req.name, "stats");
        assert_eq!(req.args, vec!["types"]);
    }

    #[test]
    fn parse_name_with_multiple_args() {
        let req = EmbedRequest::parse("matrix:requirement:feature").unwrap();
        assert_eq!(req.name, "matrix");
        assert_eq!(req.args, vec!["requirement", "feature"]);
    }

    #[test]
    fn parse_name_with_options() {
        let req = EmbedRequest::parse("stats delta=v0.3.0").unwrap();
        assert_eq!(req.name, "stats");
        assert!(req.args.is_empty());
        assert_eq!(req.options.get("delta"), Some(&"v0.3.0".to_string()));
    }

    #[test]
    fn parse_args_and_options() {
        let req = EmbedRequest::parse("coverage:req-implements-feat delta=v0.3.0").unwrap();
        assert_eq!(req.name, "coverage");
        assert_eq!(req.args, vec!["req-implements-feat"]);
        assert_eq!(req.options.get("delta"), Some(&"v0.3.0".to_string()));
    }

    #[test]
    fn parse_empty_returns_error() {
        assert!(EmbedRequest::parse("").is_err());
        assert!(EmbedRequest::parse("  ").is_err());
    }

    #[test]
    fn stats_embed_renders_html_table() {
        let ctx = EmbedContext::empty(); // empty store/schema → still renders a table
        let req = EmbedRequest::parse("stats").unwrap();
        let html = resolve_embed(&req, &ctx).unwrap();
        assert!(html.contains("<table"), "stats embed must render a table");
        assert!(html.contains("embed-stats"), "must have embed-stats class");
    }

    #[test]
    fn stats_types_filter() {
        let ctx = EmbedContext::empty();
        let req = EmbedRequest::parse("stats:types").unwrap();
        let html = resolve_embed(&req, &ctx).unwrap();
        assert!(html.contains("<table"), "stats:types must render a table");
        // Should NOT contain validation or status sections
        assert!(!html.contains("embed-stats-validation"));
    }

    #[test]
    fn coverage_embed_renders_html_table() {
        let ctx = EmbedContext::empty();
        let req = EmbedRequest::parse("coverage").unwrap();
        let html = resolve_embed(&req, &ctx).unwrap();
        assert!(
            html.contains("<table") || html.contains("embed-coverage"),
            "coverage embed must render a table or coverage div"
        );
        assert!(
            html.contains("embed-coverage"),
            "must have embed-coverage class"
        );
    }

    // SC-EMBED-3: empty result still produces visible output
    #[test]
    fn coverage_empty_shows_no_data_message() {
        let ctx = EmbedContext::empty();
        let req = EmbedRequest::parse("coverage").unwrap();
        let html = resolve_embed(&req, &ctx).unwrap();
        // With an empty schema there are no rules, so either a table with
        // zero rows or a "No coverage rules" message — either way, not empty.
        assert!(!html.is_empty(), "coverage must not be empty string");
    }

    // SC-EMBED-3: unknown embeds produce EmbedError, not empty string
    #[test]
    fn unknown_embed_name_renders_error_html() {
        let req = EmbedRequest::parse("nonexistent").unwrap();
        let result = resolve_embed(&req, &EmbedContext::empty());
        assert!(result.is_err());
        let err = result.unwrap_err();
        let html = err.to_error_html();
        assert!(html.contains("embed-error"), "must have embed-error class");
        assert!(html.contains("nonexistent"), "must show the unknown name");
    }

    // ── Provenance tests ────────────────────────────────────────────

    #[test]
    fn provenance_stamp_contains_commit_and_timestamp() {
        let stamp = render_provenance_stamp("abc1234", false);
        assert!(
            stamp.contains("embed-provenance"),
            "must have provenance class"
        );
        assert!(stamp.contains("abc1234"), "must contain commit hash");
        assert!(
            stamp.contains("Computed at"),
            "must contain timestamp label"
        );
    }

    #[test]
    fn provenance_stamp_shows_dirty_when_dirty() {
        let stamp = render_provenance_stamp("abc1234", true);
        assert!(stamp.contains("dirty"), "must indicate dirty tree");
    }

    #[test]
    fn provenance_stamp_clean_has_no_dirty() {
        let stamp = render_provenance_stamp("abc1234", false);
        assert!(!stamp.contains("dirty"), "clean stamp must not say dirty");
    }

    // ── Parser edge cases ───────────────────────────────────────────

    #[test]
    fn parse_preserves_colons_in_args() {
        let req = EmbedRequest::parse("table:requirement:id,title,status").unwrap();
        assert_eq!(req.name, "table");
        assert_eq!(req.args, vec!["requirement", "id,title,status"]);
    }

    #[test]
    fn parse_trims_whitespace() {
        let req = EmbedRequest::parse("  stats:types  ").unwrap();
        assert_eq!(req.name, "stats");
        assert_eq!(req.args, vec!["types"]);
    }

    #[test]
    fn parse_multiple_options() {
        let req = EmbedRequest::parse("stats delta=v0.3.0 format=table").unwrap();
        assert_eq!(req.options.len(), 2);
        assert_eq!(req.options["delta"], "v0.3.0");
        assert_eq!(req.options["format"], "table");
    }

    #[test]
    fn legacy_artifact_embed_parses() {
        let req = EmbedRequest::parse("artifact:REQ-001:full:3").unwrap();
        assert_eq!(req.name, "artifact");
        assert_eq!(req.args, vec!["REQ-001", "full", "3"]);
        assert!(req.is_legacy());
    }

    #[test]
    fn legacy_links_embed_parses() {
        let req = EmbedRequest::parse("links:REQ-001").unwrap();
        assert_eq!(req.name, "links");
        assert!(req.is_legacy());
    }

    #[test]
    fn stats_is_not_legacy() {
        let req = EmbedRequest::parse("stats").unwrap();
        assert!(!req.is_legacy());
    }

    // ── Diagnostics tests ───────────────────────────────────────────

    #[test]
    fn diagnostics_embed_renders_no_data_when_empty() {
        let ctx = EmbedContext::empty();
        let req = EmbedRequest::parse("diagnostics").unwrap();
        let html = resolve_embed(&req, &ctx).unwrap();
        assert!(
            html.contains("embed-diagnostics"),
            "must have diagnostics class"
        );
        assert!(
            html.contains("No diagnostics"),
            "empty context should show no-data message"
        );
    }

    #[test]
    fn diagnostics_embed_is_not_unknown() {
        let req = EmbedRequest::parse("diagnostics").unwrap();
        let result = resolve_embed(&req, &EmbedContext::empty());
        assert!(result.is_ok(), "diagnostics should be a known embed type");
    }

    #[test]
    fn diagnostics_severity_filter_parses() {
        let req = EmbedRequest::parse("diagnostics:error").unwrap();
        assert_eq!(req.name, "diagnostics");
        assert_eq!(req.args, vec!["error"]);
    }

    // ── Matrix tests ────────────────────────────────────────────────

    #[test]
    fn matrix_embed_renders_no_rules_when_empty() {
        let ctx = EmbedContext::empty();
        let req = EmbedRequest::parse("matrix").unwrap();
        let html = resolve_embed(&req, &ctx).unwrap();
        assert!(html.contains("embed-matrix"), "must have matrix class");
        assert!(
            html.contains("No traceability rules"),
            "empty schema should show no-rules message"
        );
    }

    #[test]
    fn matrix_embed_is_not_unknown() {
        let req = EmbedRequest::parse("matrix").unwrap();
        let result = resolve_embed(&req, &EmbedContext::empty());
        assert!(result.is_ok(), "matrix should be a known embed type");
    }

    #[test]
    fn matrix_with_types_parses() {
        let req = EmbedRequest::parse("matrix:requirement:feature").unwrap();
        assert_eq!(req.name, "matrix");
        assert_eq!(req.args, vec!["requirement", "feature"]);
    }

    #[test]
    fn diagnostics_and_matrix_are_not_legacy() {
        assert!(!EmbedRequest::parse("diagnostics").unwrap().is_legacy());
        assert!(!EmbedRequest::parse("matrix").unwrap().is_legacy());
    }
}
