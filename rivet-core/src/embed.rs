//! Computed embed resolution for documents.
//!
//! Parses `{{name:arg1:arg2 key=val}}` syntax into `EmbedRequest` and
//! dispatches to type-specific renderers (stats, coverage, etc.).

use std::collections::BTreeMap;
use std::fmt;

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

// ── Resolution (stub — real dispatchers added in Task 2) ────────────────

/// Resolve a computed embed to HTML.
///
/// Returns the rendered HTML string, or an `EmbedError` for unknown/
/// malformed embeds (SC-EMBED-3: errors are visible, never empty).
pub fn resolve_embed(
    request: &EmbedRequest,
    _ctx: &EmbedContext<'_>,
) -> Result<String, EmbedError> {
    match request.name.as_str() {
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
