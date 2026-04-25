//! Rowan-based lossless s-expression parser.
//!
//! Parses s-expressions used for rivet filter/constraint/query language.
//! Preserves all whitespace and comments for round-tripping and diagnostic
//! reporting with exact byte spans.
//!
//! Syntax:
//!   expr     = atom | list
//!   list     = '(' expr* ')'
//!   atom     = string | integer | float | bool | wildcard | symbol
//!   string   = '"' ... '"'  (with \" escaping)
//!   integer  = [+-]? [0-9]+
//!   float    = [+-]? [0-9]+ '.' [0-9]*
//!   bool     = 'true' | 'false'
//!   wildcard = '_'
//!   symbol   = [a-zA-Z_!?] [a-zA-Z0-9_\-!?.*]*
//!   comment  = ';' ... newline

// SAFETY-REVIEW (SCRC Phase 1, DD-058): File-scope blanket allow for
// the v0.4.3 clippy restriction-lint escalation. These lints are
// enabled at workspace scope at `warn` so new violations surface in
// CI; the existing call sites here are grandfathered in via this
// file-level allow until Phase 2 (per-site #[allow(...)] + rewrite).
// Rationale per lint class:
//   * unwrap_used / expect_used: legacy sites — many are on parser
//     post-conditions, BTreeMap lookups by key just inserted, or
//     regex::new on literals. Safe to keep; will migrate to ? with
//     typed errors in Phase 2 where user-facing.
//   * indexing_slicing / arithmetic_side_effects: tight math in
//     CST offsets, layout coordinates, and counted-loop indices that
//     is reviewed but not rewritten to checked_* for readability.
//   * as_conversions / cast_possible_truncation / cast_sign_loss:
//     usize<->u32/u64 in offsets where the value range is bounded by
//     input size (bytes of a loaded YAML file).
//   * wildcard_enum_match_arm / match_wildcard_for_single_variants:
//     tolerant parsers intentionally catch-all on token kinds.
//   * panic: only reached on programmer-error invariants.
//   * print_stdout / print_stderr: rivet-cli binary I/O.
#![allow(
    clippy::unwrap_used,
    clippy::expect_used,
    clippy::indexing_slicing,
    clippy::arithmetic_side_effects,
    clippy::as_conversions,
    clippy::cast_possible_truncation,
    clippy::cast_sign_loss,
    clippy::wildcard_enum_match_arm,
    clippy::match_wildcard_for_single_variants,
    clippy::panic,
    clippy::todo,
    clippy::unimplemented,
    clippy::dbg_macro,
    clippy::print_stdout,
    clippy::print_stderr
)]

use rowan::GreenNodeBuilder;

// ── Syntax kinds ────────────────────────────────────────────────────────

/// Token and node kinds for the s-expression CST.
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash)]
#[repr(u16)]
pub enum SyntaxKind {
    // ── Tokens ──────────────────────────────────────────────────────
    /// `(`
    LParen = 0,
    /// `)`
    RParen,
    /// Spaces, tabs, or newlines.
    Whitespace,
    /// `; comment text` through end of line.
    Comment,
    /// `"double quoted"` including the quotes.
    StringLit,
    /// Integer literal: `42`, `-1`, `+0`.
    IntLit,
    /// Float literal: `3.14`, `-0.5`.
    FloatLit,
    /// `true`
    BoolTrue,
    /// `false`
    BoolFalse,
    /// `_` (wildcard / don't care).
    Wildcard,
    /// Unquoted symbol: `and`, `type`, `has-tag`, `linked-by`, etc.
    Symbol,

    // ── Composite nodes ─────────────────────────────────────────────
    /// Root of the tree (may contain multiple exprs).
    Root,
    /// A parenthesised list: `(form arg1 arg2 ...)`.
    List,
    /// A single atom (wraps one token).
    Atom,

    // ── Error recovery ──────────────────────────────────────────────
    /// A span the parser could not interpret.
    Error,
}

impl SyntaxKind {
    /// True for tokens that carry no semantic content.
    pub fn is_trivia(self) -> bool {
        matches!(self, SyntaxKind::Whitespace | SyntaxKind::Comment)
    }
}

impl From<SyntaxKind> for rowan::SyntaxKind {
    fn from(kind: SyntaxKind) -> Self {
        Self(kind as u16)
    }
}

// ── Language definition ─────────────────────────────────────────────────

/// Rowan language tag for s-expressions.
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash)]
pub enum SExprLanguage {}

impl rowan::Language for SExprLanguage {
    type Kind = SyntaxKind;

    fn kind_from_raw(raw: rowan::SyntaxKind) -> SyntaxKind {
        assert!(raw.0 <= SyntaxKind::Error as u16);
        // SAFETY: SyntaxKind is repr(u16) with contiguous discriminants.
        unsafe { std::mem::transmute(raw.0) }
    }

    fn kind_to_raw(kind: SyntaxKind) -> rowan::SyntaxKind {
        kind.into()
    }
}

/// Convenience alias.
pub type SyntaxNode = rowan::SyntaxNode<SExprLanguage>;

// ── Lexer ───────────────────────────────────────────────────────────────

/// A single token produced by the lexer.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Token<'src> {
    pub kind: SyntaxKind,
    pub text: &'src str,
}

/// Lex an s-expression source string into tokens.
///
/// Never fails — unknown bytes produce single-character Error tokens.
pub fn lex(source: &str) -> Vec<Token<'_>> {
    let mut tokens = Vec::new();
    let bytes = source.as_bytes();
    let mut i = 0;

    while i < bytes.len() {
        let start = i;
        match bytes[i] {
            b'(' => {
                tokens.push(Token {
                    kind: SyntaxKind::LParen,
                    text: &source[i..i + 1],
                });
                i += 1;
            }
            b')' => {
                tokens.push(Token {
                    kind: SyntaxKind::RParen,
                    text: &source[i..i + 1],
                });
                i += 1;
            }
            b';' => {
                // Comment: consume to end of line.
                while i < bytes.len() && bytes[i] != b'\n' {
                    i += 1;
                }
                tokens.push(Token {
                    kind: SyntaxKind::Comment,
                    text: &source[start..i],
                });
            }
            b' ' | b'\t' | b'\n' | b'\r' => {
                while i < bytes.len() && matches!(bytes[i], b' ' | b'\t' | b'\n' | b'\r') {
                    i += 1;
                }
                tokens.push(Token {
                    kind: SyntaxKind::Whitespace,
                    text: &source[start..i],
                });
            }
            b'"' => {
                // String literal with \" escaping.
                i += 1; // skip opening quote
                while i < bytes.len() {
                    if bytes[i] == b'\\' && i + 1 < bytes.len() {
                        i += 2; // skip escaped character
                    } else if bytes[i] == b'"' {
                        i += 1; // skip closing quote
                        break;
                    } else {
                        i += 1;
                    }
                }
                tokens.push(Token {
                    kind: SyntaxKind::StringLit,
                    text: &source[start..i],
                });
            }
            b'0'..=b'9' | b'+' | b'-'
                if {
                    // Distinguish sign from symbol: +/- is numeric only if followed by digit.
                    let is_sign = matches!(bytes[i], b'+' | b'-');
                    !is_sign || (i + 1 < bytes.len() && bytes[i + 1].is_ascii_digit())
                } =>
            {
                let mut is_float = false;
                if matches!(bytes[i], b'+' | b'-') {
                    i += 1;
                }
                while i < bytes.len() && bytes[i].is_ascii_digit() {
                    i += 1;
                }
                if i < bytes.len()
                    && bytes[i] == b'.'
                    && i + 1 < bytes.len()
                    && bytes[i + 1].is_ascii_digit()
                {
                    is_float = true;
                    i += 1; // skip dot
                    while i < bytes.len() && bytes[i].is_ascii_digit() {
                        i += 1;
                    }
                }
                let kind = if is_float {
                    SyntaxKind::FloatLit
                } else {
                    SyntaxKind::IntLit
                };
                tokens.push(Token {
                    kind,
                    text: &source[start..i],
                });
            }
            _ if is_symbol_start(bytes[i]) => {
                while i < bytes.len() && is_symbol_cont(bytes[i]) {
                    i += 1;
                }
                let text = &source[start..i];
                let kind = match text {
                    "true" => SyntaxKind::BoolTrue,
                    "false" => SyntaxKind::BoolFalse,
                    "_" => SyntaxKind::Wildcard,
                    _ => SyntaxKind::Symbol,
                };
                tokens.push(Token { kind, text });
            }
            _ => {
                // Unknown byte — advance one character (UTF-8 aware).
                let ch = source[i..].chars().next().unwrap();
                i += ch.len_utf8();
                tokens.push(Token {
                    kind: SyntaxKind::Error,
                    text: &source[start..i],
                });
            }
        }
    }

    tokens
}

fn is_symbol_start(b: u8) -> bool {
    b.is_ascii_alphabetic() || matches!(b, b'_' | b'!' | b'?' | b'>' | b'<' | b'=')
}

fn is_symbol_cont(b: u8) -> bool {
    b.is_ascii_alphanumeric()
        || matches!(
            b,
            b'_' | b'-' | b'!' | b'?' | b'.' | b'*' | b'>' | b'<' | b'='
        )
}

// ── Parser ──────────────────────────────────────────────────────────────

/// Parse error with byte offset.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ParseError {
    pub offset: usize,
    pub message: String,
}

/// Parse an s-expression source into a rowan green tree.
///
/// Returns the green node and any parse errors. The tree always round-trips:
/// `SyntaxNode::new_root(parse(s).0).text() == s` for all inputs.
pub fn parse(source: &str) -> (rowan::GreenNode, Vec<ParseError>) {
    let tokens = lex(source);
    let mut p = Parser {
        tokens,
        pos: 0,
        builder: GreenNodeBuilder::new(),
        errors: Vec::new(),
        source,
    };

    p.builder.start_node(SyntaxKind::Root.into());
    while !p.at_end() {
        p.skip_trivia();
        if p.at_end() {
            break;
        }
        p.parse_expr();
    }
    // Consume any trailing trivia.
    p.eat_remaining_trivia();
    p.builder.finish_node();

    (p.builder.finish(), p.errors)
}

struct Parser<'src> {
    tokens: Vec<Token<'src>>,
    pos: usize,
    builder: GreenNodeBuilder<'static>,
    errors: Vec<ParseError>,
    source: &'src str,
}

impl<'src> Parser<'src> {
    fn at_end(&self) -> bool {
        self.pos >= self.tokens.len()
    }

    fn current(&self) -> Option<&Token<'src>> {
        self.tokens.get(self.pos)
    }

    fn current_kind(&self) -> Option<SyntaxKind> {
        self.current().map(|t| t.kind)
    }

    fn current_offset(&self) -> usize {
        if let Some(t) = self.current() {
            // Calculate byte offset from source start.
            t.text.as_ptr() as usize - self.source.as_ptr() as usize
        } else {
            self.source.len()
        }
    }

    /// Advance past the current token, adding it to the green tree.
    fn bump(&mut self) {
        if let Some(t) = self.tokens.get(self.pos) {
            self.builder.token(t.kind.into(), t.text);
            self.pos += 1;
        }
    }

    /// Consume whitespace and comment tokens, adding them to the tree.
    fn skip_trivia(&mut self) {
        while let Some(kind) = self.current_kind() {
            if kind.is_trivia() {
                self.bump();
            } else {
                break;
            }
        }
    }

    /// Consume all remaining tokens (trivia at end of input).
    fn eat_remaining_trivia(&mut self) {
        while !self.at_end() {
            self.bump();
        }
    }

    fn parse_expr(&mut self) {
        self.skip_trivia();
        match self.current_kind() {
            Some(SyntaxKind::LParen) => self.parse_list(),
            Some(SyntaxKind::RParen) => {
                // Unexpected closing paren — wrap in error node.
                let offset = self.current_offset();
                self.builder.start_node(SyntaxKind::Error.into());
                self.bump();
                self.builder.finish_node();
                self.errors.push(ParseError {
                    offset,
                    message: "unexpected ')'".into(),
                });
            }
            Some(kind) if !kind.is_trivia() => self.parse_atom(),
            _ => {}
        }
    }

    fn parse_list(&mut self) {
        self.builder.start_node(SyntaxKind::List.into());
        self.bump(); // consume '('

        loop {
            self.skip_trivia();
            match self.current_kind() {
                Some(SyntaxKind::RParen) => {
                    self.bump(); // consume ')'
                    break;
                }
                None => {
                    // EOF without closing paren — error recovery.
                    let offset = self.current_offset();
                    self.errors.push(ParseError {
                        offset,
                        message: "expected ')', found end of input".into(),
                    });
                    break;
                }
                _ => self.parse_expr(),
            }
        }

        self.builder.finish_node();
    }

    fn parse_atom(&mut self) {
        self.builder.start_node(SyntaxKind::Atom.into());
        self.bump();
        self.builder.finish_node();
    }
}

// ── Tests ───────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;

    fn parse_text(source: &str) -> String {
        let (green, _) = parse(source);
        SyntaxNode::new_root(green).text().to_string()
    }

    #[test]
    fn round_trip_simple() {
        let cases = [
            "",
            "hello",
            "(and a b)",
            "(= type \"requirement\")",
            "(and (= status \"draft\") (has-tag \"stpa\"))",
            "  (or x y)  ",
            "; comment\n(a b)",
            "(not (not x))",
            "(implies a (and b c))",
            "(links-count satisfies > 2)",
            "42 -1 3.14 true false _",
        ];
        for s in cases {
            assert_eq!(parse_text(s), s, "round-trip failed for: {s:?}");
        }
    }

    #[test]
    fn error_recovery_missing_rparen() {
        let source = "(and a b";
        let (green, errors) = parse(source);
        let text = SyntaxNode::new_root(green).text().to_string();
        assert_eq!(text, source, "round-trip must hold even with errors");
        assert_eq!(errors.len(), 1);
        assert!(errors[0].message.contains("expected ')'"));
    }

    #[test]
    fn error_recovery_unexpected_rparen() {
        let source = ")extra";
        let (green, errors) = parse(source);
        let text = SyntaxNode::new_root(green).text().to_string();
        assert_eq!(text, source);
        assert_eq!(errors.len(), 1);
        assert!(errors[0].message.contains("unexpected ')'"));
    }

    #[test]
    fn error_recovery_nested_missing() {
        let source = "(a (b c)";
        let (green, errors) = parse(source);
        let text = SyntaxNode::new_root(green).text().to_string();
        assert_eq!(text, source);
        assert_eq!(errors.len(), 1);
    }

    #[test]
    fn lex_string_with_escapes() {
        let tokens = lex(r#""hello \"world\"""#);
        assert_eq!(tokens.len(), 1);
        assert_eq!(tokens[0].kind, SyntaxKind::StringLit);
        assert_eq!(tokens[0].text, r#""hello \"world\"""#);
    }

    #[test]
    fn lex_numbers() {
        let tokens = lex("42 -3 +7 3.14 -0.5");
        let kinds: Vec<_> = tokens
            .iter()
            .filter(|t| !t.kind.is_trivia())
            .map(|t| t.kind)
            .collect();
        assert_eq!(
            kinds,
            vec![
                SyntaxKind::IntLit,
                SyntaxKind::IntLit,
                SyntaxKind::IntLit,
                SyntaxKind::FloatLit,
                SyntaxKind::FloatLit,
            ]
        );
    }

    #[test]
    fn lex_keywords() {
        let tokens = lex("true false _ and or not implies");
        let kinds: Vec<_> = tokens
            .iter()
            .filter(|t| !t.kind.is_trivia())
            .map(|t| t.kind)
            .collect();
        assert_eq!(
            kinds,
            vec![
                SyntaxKind::BoolTrue,
                SyntaxKind::BoolFalse,
                SyntaxKind::Wildcard,
                SyntaxKind::Symbol,
                SyntaxKind::Symbol,
                SyntaxKind::Symbol,
                SyntaxKind::Symbol,
            ]
        );
    }

    #[test]
    fn lex_comment() {
        let tokens = lex("; this is a comment\n(a b)");
        assert_eq!(tokens[0].kind, SyntaxKind::Comment);
        assert_eq!(tokens[0].text, "; this is a comment");
    }

    #[test]
    fn deeply_nested() {
        let source = "((((((x))))))";
        let (green, errors) = parse(source);
        assert!(errors.is_empty());
        let text = SyntaxNode::new_root(green).text().to_string();
        assert_eq!(text, source);
    }

    #[test]
    fn empty_list() {
        let source = "()";
        let (green, errors) = parse(source);
        assert!(errors.is_empty());
        assert_eq!(SyntaxNode::new_root(green).text().to_string(), source);
    }

    #[test]
    fn multiple_top_level_exprs() {
        let source = "(a b) (c d)";
        let (green, errors) = parse(source);
        assert!(errors.is_empty());
        assert_eq!(SyntaxNode::new_root(green).text().to_string(), source);
    }

    #[test]
    fn symbol_with_dots_and_stars() {
        let tokens = lex("fields.priority links.satisfies.*");
        let kinds: Vec<_> = tokens
            .iter()
            .filter(|t| !t.kind.is_trivia())
            .map(|t| t.kind)
            .collect();
        assert_eq!(kinds, vec![SyntaxKind::Symbol, SyntaxKind::Symbol]);
    }
}
