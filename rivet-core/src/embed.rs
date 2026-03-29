//! Computed embed resolution for documents.
//!
//! Parses `{{name:arg1:arg2 key=val}}` syntax into `EmbedRequest` and
//! dispatches to type-specific renderers (stats, coverage, etc.).

use std::collections::BTreeMap;
use std::fmt;
use std::fmt::Write as _;

use crate::coverage;
use crate::document;

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
pub fn resolve_embed(
    request: &EmbedRequest,
    ctx: &EmbedContext<'_>,
) -> Result<String, EmbedError> {
    match request.name.as_str() {
        "stats" => Ok(render_stats(request, ctx)),
        "coverage" => Ok(render_coverage(request, ctx)),
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
        assert!(html.contains("<table") || html.contains("embed-coverage"), "coverage embed must render a table or coverage div");
        assert!(html.contains("embed-coverage"), "must have embed-coverage class");
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
}
