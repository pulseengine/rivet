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

// ── Embed registry ──────────────────────────────────────────────────────

/// A single entry in the embed registry.
///
/// Every `{{name[:args...]}}` token that `resolve_embed` or the document
/// inline resolver knows about has a matching `EmbedSpec`.  This is the
/// single source of truth for `rivet docs embeds`, the dashboard Help view,
/// and any future UX that needs to enumerate embeds.
#[derive(Debug, Clone, Copy)]
pub struct EmbedSpec {
    /// Embed name as it appears after `{{`.
    pub name: &'static str,
    /// Compact signature, e.g. `[section]` or `(sexpr) [limit=N]`.
    pub args: &'static str,
    /// One-line description for the listing.
    pub summary: &'static str,
    /// Runnable example that users can paste into a document.
    pub example: &'static str,
    /// True if handled by the inline resolver in `document.rs` rather than
    /// by `resolve_embed`.  Legacy embeds still appear in listings.
    pub legacy: bool,
}

/// The canonical list of registered embeds.
///
/// Order is the order shown to users; group newest (or least-known) embeds
/// near the top of their family so they are discoverable.
pub const EMBED_REGISTRY: &[EmbedSpec] = &[
    EmbedSpec {
        name: "stats",
        args: "[section|type:NAME]",
        summary: "Project statistics (types, status, validation) or count for a single type",
        example: "{{stats}}  /  {{stats:types}}  /  {{stats:type:requirement}}",
        legacy: false,
    },
    EmbedSpec {
        name: "coverage",
        args: "[rule]",
        summary: "Traceability coverage bars; with a rule name, lists uncovered IDs",
        example: "{{coverage}}  /  {{coverage:req-implements-feat}}",
        legacy: false,
    },
    EmbedSpec {
        name: "diagnostics",
        args: "[severity]",
        summary: "Validation findings (all, or filtered by error|warning|info)",
        example: "{{diagnostics}}  /  {{diagnostics:error}}",
        legacy: false,
    },
    EmbedSpec {
        name: "matrix",
        args: "[FROM:TO]",
        summary: "Traceability matrix — one per schema rule, or a specific type pair",
        example: "{{matrix}}  /  {{matrix:requirement:feature}}",
        legacy: false,
    },
    EmbedSpec {
        name: "query",
        args: "(sexpr) [limit=N]",
        summary: "Results of an s-expression filter as a compact table (id/type/title/status)",
        example: "{{query:(and (= type \"requirement\") (has-tag \"stpa\"))}}",
        legacy: false,
    },
    EmbedSpec {
        name: "group",
        args: "FIELD",
        summary: "Count-by-value table grouping artifacts by the given field",
        example: "{{group:status}}  /  {{group:asil}}",
        legacy: false,
    },
    // Legacy embeds — resolved inline in document.rs, but still listed here
    // so users can discover them via `rivet docs embeds`.
    EmbedSpec {
        name: "artifact",
        args: "ID[:modifier[:depth]]",
        summary: "Inline card for a single artifact (default|full|links|upstream|downstream|chain)",
        example: "{{artifact:REQ-001}}  /  {{artifact:REQ-001:full}}",
        legacy: true,
    },
    EmbedSpec {
        name: "links",
        args: "ID",
        summary: "Incoming + outgoing link table for an artifact",
        example: "{{links:REQ-001}}",
        legacy: true,
    },
    EmbedSpec {
        name: "table",
        args: "TYPE:FIELDS",
        summary: "Filtered artifact table for a single type with comma-separated columns",
        example: "{{table:requirement:id,title,status}}",
        legacy: true,
    },
];

/// Return the full embed registry.
///
/// Convenience accessor — callers that want the raw slice can also use
/// `EMBED_REGISTRY` directly.
pub fn registry() -> &'static [EmbedSpec] {
    EMBED_REGISTRY
}

// ── Parsing ─────────────────────────────────────────────────────────────

impl EmbedRequest {
    /// Parse a raw embed string (the content between `{{` and `}}`).
    ///
    /// Syntax: `name[:arg1[:arg2[...]]] [key=val ...]`
    ///
    /// Special case: when `name == "query"` the first argument is an
    /// s-expression which contains `(`, `)`, `"` and its own `:` — so
    /// naive `split(':')` / `split_whitespace()` would corrupt it. The
    /// parser therefore requires the query form `query:(...)` and
    /// captures balanced parens as the single positional arg, leaving any
    /// trailing `key=val` options after the closing `)` intact.
    pub fn parse(input: &str) -> Result<Self, EmbedError> {
        let input = input.trim();
        if input.is_empty() {
            return Err(EmbedError {
                kind: EmbedErrorKind::ParseError("empty embed".into()),
                raw_text: String::new(),
            });
        }

        // Peel off the embed name (everything up to the first ':' or space).
        let name_end = input
            .find(|c: char| c == ':' || c.is_whitespace())
            .unwrap_or(input.len());
        let name = input[..name_end].to_string();
        let rest = input[name_end..].trim_start_matches(':');

        // ── Balanced-paren form for `query` ────────────────────────
        // `{{query:(..balanced..) key=val}}`.  Any colons, spaces, and
        // quotes inside the parens belong to the s-expression.
        if name == "query" {
            let rest_trim = rest.trim_start();
            if !rest_trim.starts_with('(') {
                return Err(EmbedError {
                    kind: EmbedErrorKind::MalformedSyntax(
                        "query embed requires a parenthesised s-expression: {{query:(...)}}"
                            .into(),
                    ),
                    raw_text: input.to_string(),
                });
            }
            let (sexpr, tail) = match extract_balanced_parens(rest_trim) {
                Some(pair) => pair,
                None => {
                    return Err(EmbedError {
                        kind: EmbedErrorKind::MalformedSyntax(
                            "unbalanced parentheses in query embed".into(),
                        ),
                        raw_text: input.to_string(),
                    });
                }
            };

            let mut options = BTreeMap::new();
            for token in tail.split_whitespace() {
                if let Some((key, val)) = token.split_once('=') {
                    options.insert(key.to_string(), val.to_string());
                } else {
                    // Reject colon-prefixed syntax and other non-`key=value`
                    // tokens so they don't get silently dropped (SC-EMBED-3).
                    return Err(EmbedError {
                        kind: EmbedErrorKind::MalformedSyntax(format!(
                            "unrecognized option `{token}` — use `key=value` form \
                             (e.g. `limit=10`, not `:limit 10`)"
                        )),
                        raw_text: input.to_string(),
                    });
                }
            }
            return Ok(EmbedRequest {
                name,
                args: vec![sexpr.to_string()],
                options,
            });
        }

        // ── Classic form: name:arg1:arg2 key=val ... ───────────────
        // (Re-assemble input so the whitespace/option parser sees the
        //  original shape.)
        let tail_full = if rest.is_empty() { input } else { rest };
        // If `rest` is a slice of `input`, we need to re-anchor the "name"
        // prefix logic on the tail (arguments only).
        let args_and_options = if name_end == input.len() {
            ""
        } else {
            input[name_end..].trim_start_matches(':')
        };
        let (args_part, options_part) = match args_and_options.find(' ') {
            Some(pos) => (
                &args_and_options[..pos],
                Some(&args_and_options[pos + 1..]),
            ),
            None => (args_and_options, None),
        };

        let args: Vec<String> = if args_part.is_empty() {
            Vec::new()
        } else {
            args_part.split(':').map(|s| s.trim().to_string()).collect()
        };

        let mut options = BTreeMap::new();
        if let Some(opts_str) = options_part {
            for token in opts_str.split_whitespace() {
                if let Some((key, val)) = token.split_once('=') {
                    options.insert(key.to_string(), val.to_string());
                }
            }
        }

        // Silence unused-variable lint for the legacy shadow.
        let _ = tail_full;

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
        "coverage" => render_coverage(request, ctx),
        "diagnostics" => render_diagnostics(request, ctx),
        "matrix" => render_matrix(request, ctx),
        "query" => render_query(request, ctx),
        "group" => render_group(request, ctx),
        // Legacy embeds (artifact, links, table) are rendered by
        // `resolve_inline` while a markdown document is being processed —
        // not by this top-level resolver. So `rivet embed table:foo:bar`
        // can't produce a card on its own; it only renders correctly when
        // the token appears inside a doc that runs through the markdown
        // pipeline (rivet serve, rivet export --format html, embeds in
        // rendered prose). Inform the caller plainly so they don't waste
        // time chasing the empty result.
        "artifact" | "links" | "table" => Err(EmbedError {
            kind: EmbedErrorKind::MalformedSyntax(format!(
                "{} embed renders inside markdown documents (rivet serve / \
                 rivet export --format html). The CLI `rivet embed` command \
                 can't render it standalone — embed it in a doc and view \
                 the rendered output instead.",
                request.name
            )),
            raw_text: format!("{request:?}"),
        }),
        other => Err(EmbedError {
            kind: EmbedErrorKind::UnknownEmbed(other.to_string()),
            raw_text: format!("{request:?}"),
        }),
    }
}

/// Extract the balanced-parenthesis prefix from a string that starts with `(`.
///
/// Returns `(inside_parens_including_outer, tail_after_close)` on success.
/// Respects string literals so that `"foo)bar"` does not close the group.
fn extract_balanced_parens(s: &str) -> Option<(&str, &str)> {
    let bytes = s.as_bytes();
    if bytes.first() != Some(&b'(') {
        return None;
    }
    let mut depth = 0i32;
    let mut in_string = false;
    let mut escape = false;
    for (i, b) in bytes.iter().enumerate() {
        let c = *b;
        if in_string {
            if escape {
                escape = false;
            } else if c == b'\\' {
                escape = true;
            } else if c == b'"' {
                in_string = false;
            }
            continue;
        }
        match c {
            b'"' => in_string = true,
            b'(' => depth += 1,
            b')' => {
                depth -= 1;
                if depth == 0 {
                    // include the closing paren in the first slice
                    let (head, tail) = s.split_at(i + 1);
                    return Some((head, tail));
                }
            }
            _ => {}
        }
    }
    None
}

// ── Stats renderer ──────────────────────────────────────────────────────

/// Render one of:
/// - `{{stats}}`              — full statistics panel (types + status + validation)
/// - `{{stats:types}}`        — just the type-count table
/// - `{{stats:status}}`       — just the status-count table
/// - `{{stats:validation}}`   — just the per-severity table
/// - `{{stats:type:NAME}}`    — single count for the named artifact type
fn render_stats(request: &EmbedRequest, ctx: &EmbedContext<'_>) -> String {
    let section = request.args.first().map(|s| s.as_str());
    let target_type = request.args.get(1).map(|s| s.as_str());

    // Granular form: {{stats:type:requirement}} → single-cell count.
    if section == Some("type") {
        return render_stats_single_type(target_type.unwrap_or(""), ctx);
    }

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

/// Render `{{stats:type:NAME}}` — just the count for a single artifact type.
///
/// Rendered as a compact single-row table so it still looks like the rest of
/// the stats family.  Unknown types render a zero-count row rather than an
/// error: this is the "embed never disappears silently" rule (SC-EMBED-3).
fn render_stats_single_type(type_name: &str, ctx: &EmbedContext<'_>) -> String {
    let name = type_name.trim();
    if name.is_empty() {
        return "<div class=\"embed-stats\"><span class=\"embed-error\">stats:type requires a type name, e.g. <code>{{stats:type:requirement}}</code></span></div>\n".to_string();
    }
    let count = ctx
        .store
        .iter()
        .filter(|a| a.artifact_type == name)
        .count();

    format!(
        "<div class=\"embed-stats embed-stats-single\">\n\
         <table class=\"embed-table\"><thead><tr><th>Type</th><th>Count</th></tr></thead><tbody>\n\
         <tr><td>{typ}</td><td>{count}</td></tr>\n\
         </tbody></table>\n\
         </div>\n",
        typ = document::html_escape(name),
    )
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
fn render_coverage(
    request: &EmbedRequest,
    ctx: &EmbedContext<'_>,
) -> Result<String, EmbedError> {
    let report = coverage::compute_coverage(ctx.store, ctx.schema, ctx.graph);
    let filter_rule = request.args.first().map(|s| s.as_str());

    // If the user named a specific rule, verify it exists in the report
    // before silently returning an empty table. A typo'd rule name used
    // to render as "no coverage rules defined" — indistinguishable from
    // a project that genuinely has no rules.
    if let Some(name) = filter_rule {
        let exists = report.entries.iter().any(|e| e.rule_name == name);
        if !exists {
            let known: Vec<&str> =
                report.entries.iter().map(|e| e.rule_name.as_str()).collect();
            let hint = if known.is_empty() {
                "no traceability rules are defined in the loaded schemas".to_string()
            } else {
                format!("known rules: {}", known.join(", "))
            };
            return Err(EmbedError {
                kind: EmbedErrorKind::MalformedSyntax(format!(
                    "coverage rule '{name}' not found — {hint}"
                )),
                raw_text: format!("{request:?}"),
            });
        }
    }

    let entries: Vec<_> = report
        .entries
        .iter()
        .filter(|e| filter_rule.is_none_or(|r| e.rule_name == r))
        .collect();

    if entries.is_empty() {
        return Ok("<div class=\"embed-coverage\"><p class=\"embed-no-data\">No coverage rules defined.</p></div>\n".to_string());
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
    Ok(html)
}

// ── Diagnostics renderer ────────────────────────────────────────────────

/// Render `{{diagnostics}}` or `{{diagnostics:SEVERITY}}`.
///
/// Without args: all diagnostics. With severity arg: filtered by severity.
/// Unknown severity strings are rejected (regression guard for v0.4.1
/// silent-accept where `{{diagnostics:warnings}}` returned everything).
fn render_diagnostics(
    request: &EmbedRequest,
    ctx: &EmbedContext<'_>,
) -> Result<String, EmbedError> {
    use crate::schema::Severity;

    let filter_severity = request.args.first().map(|s| s.as_str());
    if let Some(sev) = filter_severity {
        if !matches!(sev, "error" | "warning" | "info") {
            return Err(EmbedError {
                kind: EmbedErrorKind::MalformedSyntax(format!(
                    "diagnostics severity '{sev}' is not recognised — \
                     use 'error', 'warning', or 'info'"
                )),
                raw_text: format!("{request:?}"),
            });
        }
    }

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
        return Ok(format!(
            "<div class=\"embed-diagnostics\"><p class=\"embed-no-data\">No diagnostics ({scope} severity).</p></div>\n"
        ));
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
    Ok(html)
}

// ── Matrix renderer ─────────────────────────────────────────────────────

/// Render `{{matrix}}` or `{{matrix:FROM_TYPE:TO_TYPE}}`.
///
/// Without args: renders one matrix per traceability rule in the schema.
/// With args: renders a specific matrix for the given source→target types.
/// Unknown artifact-type names are rejected so a typo no longer renders
/// a silent blank table.
fn render_matrix(
    request: &EmbedRequest,
    ctx: &EmbedContext<'_>,
) -> Result<String, EmbedError> {
    let from_type = request.args.first().map(|s| s.as_str());
    let to_type = request.args.get(1).map(|s| s.as_str());

    // Validate explicit type names against the loaded schema before
    // rendering anything — silent acceptance of an unknown type used to
    // render an empty matrix indistinguishable from "rule applies but
    // nothing covered yet". The user couldn't tell their typo from a
    // genuine coverage gap.
    for (label, maybe_name) in [("from", from_type), ("to", to_type)] {
        if let Some(name) = maybe_name {
            if !ctx.schema.artifact_types.contains_key(name) {
                let mut known: Vec<&str> = ctx
                    .schema
                    .artifact_types
                    .keys()
                    .map(String::as_str)
                    .collect();
                known.sort();
                let hint = if known.is_empty() {
                    "no artifact types are loaded".to_string()
                } else {
                    format!("known: {}", known.join(", "))
                };
                return Err(EmbedError {
                    kind: EmbedErrorKind::MalformedSyntax(format!(
                        "matrix {label}-type '{name}' is not a known artifact type — {hint}"
                    )),
                    raw_text: format!("{request:?}"),
                });
            }
        }
    }

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
    Ok(html)
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

// ── Query renderer ──────────────────────────────────────────────────────

/// Default maximum rows a `{{query:...}}` embed will render.
pub const QUERY_EMBED_DEFAULT_LIMIT: usize = 50;
/// Hard upper bound on `limit=N` for `{{query:...}}`; keeps render time bounded.
pub const QUERY_EMBED_MAX_LIMIT: usize = 500;

/// Render `{{query:(s-expr) [limit=N]}}`.
///
/// Reuses `sexpr_eval::parse_filter` and `matches_filter_with_store` — the
/// same path used by `rivet list --filter`, MCP's `rivet_query`, and the
/// `rivet query` CLI — so output IDs agree across all three surfaces.
///
/// Read-only by construction (the evaluator has no I/O), and truncation is
/// reported as a visible footer rather than silently dropping rows.
fn render_query(request: &EmbedRequest, ctx: &EmbedContext<'_>) -> Result<String, EmbedError> {
    let Some(sexpr) = request.args.first() else {
        return Err(EmbedError {
            kind: EmbedErrorKind::MalformedSyntax(
                "query embed requires an s-expression: {{query:(...)}}".into(),
            ),
            raw_text: format!("{request:?}"),
        });
    };

    let expr = crate::sexpr_eval::parse_filter(sexpr).map_err(|errs| {
        let msgs: Vec<String> = errs.iter().map(|e| e.to_string()).collect();
        EmbedError {
            kind: EmbedErrorKind::MalformedSyntax(format!("invalid filter: {}", msgs.join("; "))),
            raw_text: sexpr.clone(),
        }
    })?;

    // Resolve limit: options["limit"] if valid, else default.  Clamped to
    // the hard max so a stray `limit=99999` cannot pin the renderer.
    let limit = request
        .options
        .get("limit")
        .and_then(|s| s.parse::<usize>().ok())
        .unwrap_or(QUERY_EMBED_DEFAULT_LIMIT)
        .min(QUERY_EMBED_MAX_LIMIT);

    // Resolve column list from `fields=id,title,asil` (comma-separated).
    // Defaults to the classic 4-column shape. Each field is resolved via
    // `read_artifact_field` so custom YAML fields work without plumbing.
    const DEFAULT_FIELDS: &[&str] = &["id", "type", "title", "status"];
    let fields: Vec<String> = request
        .options
        .get("fields")
        .map(|s| {
            s.split(',')
                .map(|p| p.trim().to_string())
                .filter(|p| !p.is_empty())
                .collect()
        })
        .filter(|v: &Vec<String>| !v.is_empty())
        .unwrap_or_else(|| DEFAULT_FIELDS.iter().map(|s| s.to_string()).collect());

    let mut matches: Vec<&crate::model::Artifact> = Vec::new();
    let mut total = 0usize;
    for artifact in ctx.store.iter() {
        if crate::sexpr_eval::matches_filter_with_store(&expr, artifact, ctx.graph, ctx.store) {
            total += 1;
            if matches.len() < limit {
                matches.push(artifact);
            }
        }
    }

    let mut html = String::from("<div class=\"embed-query\">\n");
    if total == 0 {
        html.push_str("<p class=\"embed-no-data\">No artifacts match this query.</p>\n");
        html.push_str("</div>\n");
        return Ok(html);
    }

    html.push_str("<table class=\"embed-table\"><thead><tr>");
    for f in &fields {
        let _ = write!(
            html,
            "<th>{}</th>",
            document::html_escape(&column_heading(f))
        );
    }
    html.push_str("</tr></thead><tbody>\n");
    for a in &matches {
        html.push_str("<tr>");
        for f in &fields {
            let raw = read_artifact_field(a, f);
            let cell = if raw.is_empty() { "-".to_string() } else { raw };
            let wrapped = if f == "id" {
                format!("<code>{}</code>", document::html_escape(&cell))
            } else {
                document::html_escape(&cell)
            };
            let _ = write!(html, "<td>{wrapped}</td>");
        }
        html.push_str("</tr>\n");
    }
    html.push_str("</tbody></table>\n");

    if total > matches.len() {
        let _ = writeln!(
            html,
            "<p class=\"embed-summary\">Showing {shown} of {total} — narrow the filter or raise <code>limit=</code> to see more.</p>",
            shown = matches.len(),
        );
    } else {
        let _ = writeln!(
            html,
            "<p class=\"embed-summary\">{total} result{s}.</p>",
            s = if total == 1 { "" } else { "s" },
        );
    }
    html.push_str("</div>\n");
    Ok(html)
}

// ── Group renderer ──────────────────────────────────────────────────────

/// Render `{{group:FIELD}}` — count-by-value table grouping existing
/// artifacts by the given field.
///
/// Examples:
/// - `{{group:status}}` — counts of draft / approved / shipped / unset
/// - `{{group:type}}` — like `{{stats:types}}` without schema pre-population
/// - `{{group:asil}}` — per-ASIL counts from a custom field
/// - `{{group:TYPE:FIELD}}` — group only TYPE artifacts by FIELD
///   (e.g. `{{group:requirement:asil}}` → ASIL distribution across requirements)
///
/// Unset / missing values are bucketed as "unset" so the totals line up with
/// the project artifact count (or the type-scoped subset count for the
/// two-arg form).
fn render_group(request: &EmbedRequest, ctx: &EmbedContext<'_>) -> Result<String, EmbedError> {
    let Some(first) = request.args.first() else {
        return Err(EmbedError {
            kind: EmbedErrorKind::MalformedSyntax(
                "group embed requires a field name: {{group:status}}".into(),
            ),
            raw_text: format!("{request:?}"),
        });
    };
    let first = first.trim();
    if first.is_empty() {
        return Err(EmbedError {
            kind: EmbedErrorKind::MalformedSyntax("group field cannot be empty".into()),
            raw_text: format!("{request:?}"),
        });
    }

    // Two-arg form: {{group:TYPE:FIELD}} — first arg scopes to artifact type,
    // second is the field to group by. One-arg form groups every artifact.
    let (type_filter, field) = match request.args.get(1).map(|s| s.trim()) {
        Some(second) if !second.is_empty() => (Some(first), second),
        _ => (None, first),
    };

    let mut counts: BTreeMap<String, usize> = BTreeMap::new();
    for a in ctx.store.iter() {
        if let Some(t) = type_filter
            && a.artifact_type != t
        {
            continue;
        }
        let raw = read_artifact_field(a, field);
        // Treat empty/missing as "unset" so the totals always add up.
        let bucket = if raw.is_empty() {
            "unset".to_string()
        } else {
            raw
        };
        *counts.entry(bucket).or_default() += 1;
    }

    if counts.is_empty() {
        return Ok(format!(
            "<div class=\"embed-group\"><p class=\"embed-no-data\">No artifacts to group by <code>{}</code>.</p></div>\n",
            document::html_escape(field)
        ));
    }

    let total: usize = counts.values().sum();
    let mut html = String::from("<div class=\"embed-group\">\n");
    let _ = writeln!(
        html,
        "<table class=\"embed-table\"><thead><tr><th>{fld}</th><th>Count</th></tr></thead><tbody>",
        fld = document::html_escape(field),
    );
    for (value, count) in &counts {
        let _ = writeln!(
            html,
            "<tr><td>{v}</td><td>{c}</td></tr>",
            v = document::html_escape(value),
            c = count,
        );
    }
    let _ = writeln!(
        html,
        "<tr class=\"embed-total\"><td><strong>Total</strong></td><td><strong>{total}</strong></td></tr>"
    );
    html.push_str("</tbody></table>\n</div>\n");
    Ok(html)
}

/// Format a field name for use as a table column heading.
/// Capitalizes top-level well-known fields and preserves user custom field
/// names (ASIL → "asil" → "Asil"; tags → "Tags"). Keeps IDs visually prominent.
fn column_heading(name: &str) -> String {
    match name {
        "id" => "ID".to_string(),
        _ => {
            let mut chars = name.chars();
            match chars.next() {
                Some(c) => c.to_ascii_uppercase().to_string() + chars.as_str(),
                None => String::new(),
            }
        }
    }
}

/// Read a single string value for an artifact field by name.
///
/// Handles the well-known top-level fields (id, type, title, status,
/// description) as well as YAML extension fields stored in `fields`.
/// List-valued fields (e.g. `tags`) render as a comma-joined string so
/// `{{group:tags}}` produces stable buckets — individual-tag grouping is
/// a future enhancement.
fn read_artifact_field(a: &crate::model::Artifact, name: &str) -> String {
    match name {
        "id" => a.id.clone(),
        "type" => a.artifact_type.clone(),
        "title" => a.title.clone(),
        "description" => a.description.clone().unwrap_or_default(),
        "status" => a.status.clone().unwrap_or_default(),
        "tags" => a.tags.join(","),
        other => a
            .fields
            .get(other)
            .map(yaml_value_to_plain_string)
            .unwrap_or_default(),
    }
}

fn yaml_value_to_plain_string(v: &serde_yaml::Value) -> String {
    match v {
        serde_yaml::Value::String(s) => s.clone(),
        serde_yaml::Value::Number(n) => n.to_string(),
        serde_yaml::Value::Bool(b) => b.to_string(),
        serde_yaml::Value::Null => String::new(),
        serde_yaml::Value::Sequence(seq) => seq
            .iter()
            .map(yaml_value_to_plain_string)
            .collect::<Vec<_>>()
            .join(","),
        serde_yaml::Value::Mapping(_) | serde_yaml::Value::Tagged(_) => format!("{v:?}"),
    }
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
    fn matrix_embed_rejects_unknown_from_type() {
        // Regression: {{matrix:UnknownType:OtherType}} used to render a
        // blank table (silent accept). Now must error with a hint listing
        // known types.
        let ctx = EmbedContext::empty();
        let req = EmbedRequest::parse("matrix:does-not-exist:other").unwrap();
        let err = resolve_embed(&req, &ctx).unwrap_err();
        let msg = match &err.kind {
            EmbedErrorKind::MalformedSyntax(m) => m.clone(),
            other => panic!("expected MalformedSyntax, got {other:?}"),
        };
        assert!(
            msg.contains("does-not-exist"),
            "error must name the unknown type: {msg}"
        );
        assert!(
            msg.contains("from-type"),
            "error must clarify which arg was wrong: {msg}"
        );
    }

    #[test]
    fn diagnostics_embed_rejects_unknown_severity() {
        // Regression: {{diagnostics:warnings}} (typo) used to silently
        // return ALL diagnostics because the severity match fell to the
        // `_ => true` arm.
        let ctx = EmbedContext::empty();
        let req = EmbedRequest::parse("diagnostics:warnings").unwrap();
        let err = resolve_embed(&req, &ctx).unwrap_err();
        match &err.kind {
            EmbedErrorKind::MalformedSyntax(m) => {
                assert!(
                    m.contains("warnings") && m.contains("warning"),
                    "error must name the bad input and the correct value: {m}"
                );
            }
            other => panic!("expected MalformedSyntax, got {other:?}"),
        }
    }

    #[test]
    fn coverage_embed_rejects_unknown_filter_rule() {
        // Regression: {{coverage:typo-rule}} used to render "no coverage
        // rules defined" — indistinguishable from a project that has no
        // rules. Now errors with a list of known rule names.
        let ctx = EmbedContext::empty();
        let req = EmbedRequest::parse("coverage:does-not-exist").unwrap();
        let err = resolve_embed(&req, &ctx).unwrap_err();
        match &err.kind {
            EmbedErrorKind::MalformedSyntax(m) => {
                assert!(
                    m.contains("does-not-exist"),
                    "error must name the unknown rule: {m}"
                );
            }
            other => panic!("expected MalformedSyntax, got {other:?}"),
        }
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

    // ── Balanced-paren / query parsing ──────────────────────────────

    #[test]
    fn extract_balanced_parens_simple() {
        let (head, tail) = extract_balanced_parens("(= type \"requirement\") limit=5").unwrap();
        assert_eq!(head, "(= type \"requirement\")");
        assert_eq!(tail, " limit=5");
    }

    #[test]
    fn extract_balanced_parens_nested() {
        let (head, tail) =
            extract_balanced_parens("(and (= type \"requirement\") (has-tag \"stpa\"))").unwrap();
        assert_eq!(head, "(and (= type \"requirement\") (has-tag \"stpa\"))");
        assert_eq!(tail, "");
    }

    #[test]
    fn extract_balanced_parens_respects_string_literal() {
        // a `)` inside a string must not close the group
        let (head, _tail) = extract_balanced_parens(r#"(= title "has ) paren")"#).unwrap();
        assert_eq!(head, r#"(= title "has ) paren")"#);
    }

    #[test]
    fn extract_balanced_parens_unbalanced_returns_none() {
        assert!(extract_balanced_parens("(and (=").is_none());
    }

    #[test]
    fn parse_query_captures_whole_sexpr() {
        let req = EmbedRequest::parse("query:(= type \"requirement\")").unwrap();
        assert_eq!(req.name, "query");
        assert_eq!(req.args, vec!["(= type \"requirement\")"]);
    }

    #[test]
    fn parse_query_with_nested_and_options() {
        let req = EmbedRequest::parse(
            "query:(and (= type \"requirement\") (has-tag \"stpa\")) limit=25",
        )
        .unwrap();
        assert_eq!(req.name, "query");
        assert_eq!(
            req.args,
            vec!["(and (= type \"requirement\") (has-tag \"stpa\"))"]
        );
        assert_eq!(req.options.get("limit"), Some(&"25".to_string()));
    }

    #[test]
    fn parse_query_without_parens_errors() {
        let err = EmbedRequest::parse("query:type=requirement").unwrap_err();
        assert!(matches!(err.kind, EmbedErrorKind::MalformedSyntax(_)));
    }

    #[test]
    fn parse_query_with_unbalanced_parens_errors() {
        let err = EmbedRequest::parse("query:(and (= type \"req\"").unwrap_err();
        assert!(matches!(err.kind, EmbedErrorKind::MalformedSyntax(_)));
    }

    // Regression: parser changes for `query` must not break existing embeds.

    #[test]
    fn parse_stats_still_splits_on_colon() {
        let req = EmbedRequest::parse("stats:types").unwrap();
        assert_eq!(req.name, "stats");
        assert_eq!(req.args, vec!["types"]);
    }

    #[test]
    fn parse_table_still_takes_two_args() {
        let req = EmbedRequest::parse("table:requirement:id,title,status").unwrap();
        assert_eq!(req.name, "table");
        assert_eq!(req.args, vec!["requirement", "id,title,status"]);
    }

    // ── Query & group renderers ─────────────────────────────────────

    use crate::links::LinkGraph;
    use crate::model::Artifact;
    use crate::schema::Schema;
    use crate::store::Store;
    use crate::validate::Diagnostic;
    use std::collections::BTreeMap;

    fn make_store(artifacts: Vec<Artifact>) -> Store {
        let mut s = Store::new();
        for a in artifacts {
            s.upsert(a);
        }
        s
    }

    fn plain(id: &str, typ: &str, status: Option<&str>, tags: &[&str]) -> Artifact {
        Artifact {
            id: id.into(),
            artifact_type: typ.into(),
            title: format!("Title of {id}"),
            description: None,
            status: status.map(|s| s.into()),
            tags: tags.iter().map(|t| t.to_string()).collect(),
            links: vec![],
            fields: BTreeMap::new(),
            provenance: None,
            source_file: None,
        }
    }

    fn run_embed(
        query: &str,
        store: &Store,
        schema: &Schema,
        graph: &LinkGraph,
    ) -> Result<String, EmbedError> {
        let req = EmbedRequest::parse(query)?;
        let diags: Vec<Diagnostic> = Vec::new();
        let ctx = EmbedContext {
            store,
            schema,
            graph,
            diagnostics: &diags,
            baseline: None,
        };
        resolve_embed(&req, &ctx)
    }

    // The `{{query:...}}` embed must return the same IDs as
    // `sexpr_eval::matches_filter_with_store` — and therefore the same set
    // that `rivet list --filter` and MCP's `rivet_query` would return.
    #[test]
    fn query_embed_matches_sexpr_filter() {
        let store = make_store(vec![
            plain("REQ-1", "requirement", Some("approved"), &["stpa"]),
            plain("REQ-2", "requirement", Some("draft"), &[]),
            plain("FEAT-1", "feature", Some("approved"), &["stpa"]),
        ]);
        let schema = Schema::merge(&[]);
        let graph = LinkGraph::build(&store, &schema);

        let html = run_embed(
            r#"query:(= type "requirement")"#,
            &store,
            &schema,
            &graph,
        )
        .unwrap();
        assert!(html.contains("REQ-1"), "got: {html}");
        assert!(html.contains("REQ-2"), "got: {html}");
        assert!(!html.contains("FEAT-1"), "got: {html}");

        // Cross-check via the same evaluator directly.  Store iteration
        // order is not guaranteed, so compare as a sorted set.
        let expr = crate::sexpr_eval::parse_filter(r#"(= type "requirement")"#).unwrap();
        let mut direct_ids: Vec<String> = store
            .iter()
            .filter(|a| crate::sexpr_eval::matches_filter_with_store(&expr, a, &graph, &store))
            .map(|a| a.id.clone())
            .collect();
        direct_ids.sort();
        assert_eq!(direct_ids, vec!["REQ-1".to_string(), "REQ-2".to_string()]);
    }

    #[test]
    fn query_embed_no_matches_shows_empty_message() {
        let store = make_store(vec![plain("REQ-1", "requirement", None, &[])]);
        let schema = Schema::merge(&[]);
        let graph = LinkGraph::build(&store, &schema);
        let html = run_embed(r#"query:(= type "feature")"#, &store, &schema, &graph).unwrap();
        assert!(html.contains("No artifacts match"), "got: {html}");
        assert!(html.contains("embed-query"));
    }

    #[test]
    fn query_embed_limit_caps_rows_and_shows_truncation_note() {
        let store = make_store(
            (0..20)
                .map(|i| plain(&format!("REQ-{i:03}"), "requirement", None, &[]))
                .collect(),
        );
        let schema = Schema::merge(&[]);
        let graph = LinkGraph::build(&store, &schema);
        let html = run_embed(
            r#"query:(= type "requirement") limit=3"#,
            &store,
            &schema,
            &graph,
        )
        .unwrap();
        // Only 3 data rows render, and a footer flags the truncation.
        // (Store iteration order is not guaranteed — we assert row count
        //  and the summary, not specific IDs.)
        let row_count = html.matches("<tr>").count();
        assert_eq!(row_count, 4, "expected 1 header + 3 data rows, got: {html}");
        assert!(html.contains("Showing 3 of 20"), "got: {html}");
    }

    #[test]
    fn query_embed_limit_clamped_to_hard_max() {
        // Just verify that an over-limit renders at all without panicking.
        let store = make_store(vec![plain("REQ-1", "requirement", None, &[])]);
        let schema = Schema::merge(&[]);
        let graph = LinkGraph::build(&store, &schema);
        let html = run_embed(
            &format!(
                "query:(= type \"requirement\") limit={}",
                QUERY_EMBED_MAX_LIMIT + 1_000
            ),
            &store,
            &schema,
            &graph,
        )
        .unwrap();
        assert!(html.contains("REQ-1"));
    }

    #[test]
    fn query_embed_malformed_filter_renders_error() {
        let store = Store::new();
        let schema = Schema::merge(&[]);
        let graph = LinkGraph::build(&store, &schema);
        // `(and` unclosed — passes the paren-balancer only when wrapped.
        let req = EmbedRequest::parse("query:(unknown-form)").unwrap();
        let diags: Vec<Diagnostic> = Vec::new();
        let ctx = EmbedContext {
            store: &store,
            schema: &schema,
            graph: &graph,
            diagnostics: &diags,
            baseline: None,
        };
        let err = resolve_embed(&req, &ctx).unwrap_err();
        assert!(matches!(err.kind, EmbedErrorKind::MalformedSyntax(_)));
    }

    #[test]
    fn query_embed_fields_option_customizes_columns() {
        // `fields=id,title,asil` should produce the three columns in order.
        let mut a = plain("REQ-1", "requirement", Some("Auth"), &[]);
        a.fields
            .insert("asil".into(), serde_yaml::Value::String("ASIL-B".into()));
        let store = make_store(vec![a]);
        let schema = Schema::merge(&[]);
        let graph = LinkGraph::build(&store, &schema);
        let html = run_embed(
            "query:(= type \"requirement\") fields=id,title,asil",
            &store,
            &schema,
            &graph,
        )
        .unwrap();
        assert!(html.contains("<th>ID</th>"), "expected ID column: {html}");
        assert!(
            html.contains("<th>Title</th>"),
            "expected Title column: {html}"
        );
        assert!(
            html.contains("<th>Asil</th>"),
            "expected Asil column: {html}"
        );
        assert!(html.contains("ASIL-B"), "custom field value missing: {html}");
        // Default Status column must be absent when `fields=` is overridden.
        assert!(
            !html.contains("<th>Status</th>"),
            "Status column should be suppressed when fields= is set: {html}"
        );
    }

    #[test]
    fn query_embed_rejects_colon_prefixed_option_syntax() {
        // Regression guard: `:limit 10` used to be silently dropped because
        // the parser only recognized `key=value` tokens. Now it is rejected
        // with a hint steering the user to the correct syntax.
        let err = EmbedRequest::parse("query:(= type \"requirement\") :limit 10")
            .unwrap_err();
        let msg = match &err.kind {
            EmbedErrorKind::MalformedSyntax(m) => m.clone(),
            other => panic!("expected MalformedSyntax, got {other:?}"),
        };
        assert!(
            msg.contains("key=value"),
            "error should explain the correct syntax, got: {msg}"
        );
    }

    // ── stats:type:NAME granular form ───────────────────────────────

    #[test]
    fn stats_type_single_name_counts_correctly() {
        let store = make_store(vec![
            plain("A", "requirement", None, &[]),
            plain("B", "requirement", None, &[]),
            plain("C", "feature", None, &[]),
        ]);
        let schema = Schema::merge(&[]);
        let graph = LinkGraph::build(&store, &schema);
        let html = run_embed("stats:type:requirement", &store, &schema, &graph).unwrap();
        assert!(html.contains("embed-stats-single"), "got: {html}");
        // The single-type row must show count = 2 for requirement.
        assert!(html.contains("<td>requirement</td>"), "got: {html}");
        assert!(html.contains("<td>2</td>"), "got: {html}");
        // Must NOT contain the full stats table sections.
        assert!(!html.contains("embed-stats-validation"), "got: {html}");
        assert!(!html.contains("embed-stats-status"), "got: {html}");
    }

    #[test]
    fn stats_type_unknown_type_renders_zero_not_error() {
        let store = make_store(vec![plain("A", "requirement", None, &[])]);
        let schema = Schema::merge(&[]);
        let graph = LinkGraph::build(&store, &schema);
        let html = run_embed("stats:type:nonexistent", &store, &schema, &graph).unwrap();
        // Still renders a table cell (SC-EMBED-3: no silent disappearance).
        assert!(html.contains("<td>nonexistent</td>"), "got: {html}");
        assert!(html.contains("<td>0</td>"), "got: {html}");
    }

    #[test]
    fn stats_type_empty_name_renders_embed_error() {
        let store = Store::new();
        let schema = Schema::merge(&[]);
        let graph = LinkGraph::build(&store, &schema);
        // `{{stats:type}}` with no third arg — flag as user error, visibly.
        let html = run_embed("stats:type", &store, &schema, &graph).unwrap();
        assert!(html.contains("embed-error"), "got: {html}");
    }

    #[test]
    fn stats_type_does_not_break_existing_stats_types() {
        // Regression: the previous {{stats:types}} form must still render
        // the full table.
        let store = make_store(vec![
            plain("A", "requirement", None, &[]),
            plain("B", "feature", None, &[]),
        ]);
        let schema = Schema::merge(&[]);
        let graph = LinkGraph::build(&store, &schema);
        let html = run_embed("stats:types", &store, &schema, &graph).unwrap();
        assert!(html.contains("<table"));
        assert!(html.contains("requirement"));
        assert!(html.contains("feature"));
    }

    // ── {{group:FIELD}} embed ───────────────────────────────────────

    #[test]
    fn group_embed_counts_by_status() {
        let store = make_store(vec![
            plain("A", "requirement", Some("draft"), &[]),
            plain("B", "requirement", Some("approved"), &[]),
            plain("C", "requirement", Some("approved"), &[]),
            plain("D", "requirement", None, &[]), // unset
        ]);
        let schema = Schema::merge(&[]);
        let graph = LinkGraph::build(&store, &schema);
        let html = run_embed("group:status", &store, &schema, &graph).unwrap();
        assert!(html.contains("embed-group"));
        assert!(html.contains("approved"));
        assert!(html.contains("draft"));
        assert!(html.contains("unset"), "got: {html}");
        // 3 + 1 = 4 total
        assert!(html.contains("<strong>4</strong>"), "got: {html}");
    }

    #[test]
    fn group_embed_counts_by_type() {
        let store = make_store(vec![
            plain("A", "requirement", None, &[]),
            plain("B", "feature", None, &[]),
            plain("C", "feature", None, &[]),
        ]);
        let schema = Schema::merge(&[]);
        let graph = LinkGraph::build(&store, &schema);
        let html = run_embed("group:type", &store, &schema, &graph).unwrap();
        // two features, one requirement — assert the cells directly.
        assert!(html.contains("<td>feature</td>"), "got: {html}");
        assert!(html.contains("<td>2</td>"), "got: {html}");
        assert!(html.contains("<td>requirement</td>"), "got: {html}");
        assert!(html.contains("<td>1</td>"), "got: {html}");
    }

    #[test]
    fn group_embed_by_custom_field() {
        // ASIL is a common custom YAML field; group-by that.
        let mut a = plain("A", "requirement", None, &[]);
        a.fields.insert(
            "asil".into(),
            serde_yaml::Value::String("ASIL-B".into()),
        );
        let mut b = plain("B", "requirement", None, &[]);
        b.fields.insert(
            "asil".into(),
            serde_yaml::Value::String("ASIL-B".into()),
        );
        let c = plain("C", "requirement", None, &[]); // no asil → unset
        let store = make_store(vec![a, b, c]);
        let schema = Schema::merge(&[]);
        let graph = LinkGraph::build(&store, &schema);
        let html = run_embed("group:asil", &store, &schema, &graph).unwrap();
        assert!(html.contains("ASIL-B"), "got: {html}");
        assert!(html.contains("<td>2</td>"), "got: {html}");
        assert!(html.contains("unset"), "got: {html}");
    }

    #[test]
    fn group_embed_two_arg_scopes_by_type() {
        // Two-arg form: {{group:TYPE:FIELD}} — scope to artifacts of TYPE,
        // group those by FIELD. Regression guard for the silent-accept bug
        // where the second arg was discarded and every artifact fell into
        // bucket "unset" because FIELD was read as the literal type name.
        let mut req_a = plain("REQ-1", "requirement", None, &[]);
        req_a.fields.insert(
            "asil".into(),
            serde_yaml::Value::String("ASIL-B".into()),
        );
        let mut req_b = plain("REQ-2", "requirement", None, &[]);
        req_b.fields.insert(
            "asil".into(),
            serde_yaml::Value::String("ASIL-D".into()),
        );
        // Non-requirement artifact — should be excluded by type filter.
        let mut test_a = plain("TEST-1", "test", None, &[]);
        test_a.fields.insert(
            "asil".into(),
            serde_yaml::Value::String("ASIL-B".into()),
        );
        let store = make_store(vec![req_a, req_b, test_a]);
        let schema = Schema::merge(&[]);
        let graph = LinkGraph::build(&store, &schema);
        let html =
            run_embed("group:requirement:asil", &store, &schema, &graph).unwrap();
        assert!(html.contains("ASIL-B"), "got: {html}");
        assert!(html.contains("ASIL-D"), "got: {html}");
        // Total must be 2 (only the two requirements), not 3.
        assert!(
            html.contains("<strong>2</strong>"),
            "type filter did not exclude non-requirement artifact — got: {html}"
        );
    }

    #[test]
    fn group_embed_rejects_empty_field() {
        let store = Store::new();
        let schema = Schema::merge(&[]);
        let graph = LinkGraph::build(&store, &schema);
        let req = EmbedRequest::parse("group:").unwrap();
        let diags: Vec<Diagnostic> = Vec::new();
        let ctx = EmbedContext {
            store: &store,
            schema: &schema,
            graph: &graph,
            diagnostics: &diags,
            baseline: None,
        };
        let err = resolve_embed(&req, &ctx).unwrap_err();
        assert!(matches!(err.kind, EmbedErrorKind::MalformedSyntax(_)));
    }

    #[test]
    fn group_embed_empty_store_renders_no_data() {
        let store = Store::new();
        let schema = Schema::merge(&[]);
        let graph = LinkGraph::build(&store, &schema);
        let html = run_embed("group:status", &store, &schema, &graph).unwrap();
        assert!(html.contains("embed-group"), "got: {html}");
        assert!(html.contains("No artifacts"), "got: {html}");
    }

    // ── Registry invariants ─────────────────────────────────────────

    /// Every embed that resolve_embed dispatches must appear in
    /// EMBED_REGISTRY — otherwise `rivet docs embeds` lies by omission.
    #[test]
    fn registry_covers_all_dispatched_embeds() {
        let dispatched = [
            "stats",
            "coverage",
            "diagnostics",
            "matrix",
            "query",
            "group",
            // Legacy — still listed:
            "artifact",
            "links",
            "table",
        ];
        let registered: Vec<&str> = EMBED_REGISTRY.iter().map(|s| s.name).collect();
        for name in &dispatched {
            assert!(
                registered.contains(name),
                "embed '{name}' is dispatched but not in EMBED_REGISTRY",
            );
        }
    }

    /// Each registry entry's example must itself be a parseable embed so
    /// the listing output is copy-pasteable without further editing.
    #[test]
    fn registry_examples_parse() {
        for spec in EMBED_REGISTRY {
            // Strip the outer {{ }} and parse the first example.  Many
            // examples list multiple variants separated by "  /  ";
            // testing the first is enough to catch regressions.
            let first = spec.example.split("  /  ").next().unwrap().trim();
            let inner = first
                .trim_start_matches("{{")
                .trim_end_matches("}}")
                .trim();
            EmbedRequest::parse(inner)
                .unwrap_or_else(|e| panic!("registry example for '{}' failed to parse: {e}", spec.name));
        }
    }

    #[test]
    fn registry_has_stable_entries() {
        // Smoke test: hold the registry to at least these entries.  Stops
        // accidental deletions.
        let names: Vec<&str> = EMBED_REGISTRY.iter().map(|s| s.name).collect();
        for required in ["stats", "coverage", "query", "group", "artifact"] {
            assert!(names.contains(&required));
        }
    }
}
