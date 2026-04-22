//! Rowan-based lossless YAML CST parser.
//!
//! Parses the subset of YAML used by rivet artifact files: block mappings,
//! block sequences, flow sequences, scalars (plain, quoted, block), and
//! comments. Preserves all whitespace and comments for round-tripping.
//!
//! Does NOT handle: anchors/aliases, tags, flow mappings, complex keys,
//! multi-document streams, or merge keys. These produce Error nodes.

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

/// Token and node kinds for the YAML CST.
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash)]
#[repr(u16)]
pub enum SyntaxKind {
    // ── Tokens ──────────────────────────────────────────────────────
    /// Spaces or tabs (never spans a newline).
    Whitespace = 0,
    /// A single `\n` or `\r\n`.
    Newline,
    /// `# comment text` through end of line.
    Comment,
    /// `-` (sequence item indicator).
    Dash,
    /// `:` (key-value separator).
    Colon,
    /// `,`
    Comma,
    /// `[`
    LBracket,
    /// `]`
    RBracket,
    /// `|` (literal block scalar indicator).
    Pipe,
    /// `>` (folded block scalar indicator).
    Gt,
    /// Unquoted scalar text (may contain spaces, stops at `:`, `#`, newline).
    PlainScalar,
    /// `'single quoted'` including the quotes.
    SingleQuotedScalar,
    /// `"double quoted"` including the quotes.
    DoubleQuotedScalar,
    /// A continuation line of a block scalar (indented text after `|` or `>`).
    BlockScalarLine,
    /// `---` document start marker.
    DirectiveMarker,
    /// `...` document end marker.
    DocumentEnd,

    // ── Composite nodes ─────────────────────────────────────────────
    /// Root of the tree.
    Root,
    /// A block mapping (sequence of key-value pairs at the same indent).
    Mapping,
    /// A single `key: value` pair.
    MappingEntry,
    /// The key portion of a mapping entry.
    Key,
    /// The value portion of a mapping entry.
    Value,
    /// A block sequence (`- item` lines at the same indent).
    Sequence,
    /// A single `- item`.
    SequenceItem,
    /// A flow sequence `[a, b, c]`.
    FlowSequence,
    /// A `|` or `>` block scalar with continuation lines.
    BlockScalar,

    // ── Error recovery ──────────────────────────────────────────────
    /// A span the parser could not interpret.
    Error,
}

impl From<SyntaxKind> for rowan::SyntaxKind {
    fn from(kind: SyntaxKind) -> Self {
        Self(kind as u16)
    }
}

// ── Language definition ─────────────────────────────────────────────────

/// Rowan language tag for YAML.
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash)]
pub enum YamlLanguage {}

impl rowan::Language for YamlLanguage {
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
pub type SyntaxNode = rowan::SyntaxNode<YamlLanguage>;

// ── Lexer ───────────────────────────────────────────────────────────────

/// A single token produced by the lexer.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Token<'src> {
    pub kind: SyntaxKind,
    pub text: &'src str,
}

/// Lex a YAML source string into tokens.
///
/// Every byte of the input is accounted for (whitespace and comments are kept).
pub fn lex(source: &str) -> Vec<Token<'_>> {
    let mut tokens = Vec::new();
    let bytes = source.as_bytes();
    let mut pos = 0;

    while pos < bytes.len() {
        let start = pos;
        let b = bytes[pos];

        match b {
            // Newline
            b'\n' => {
                pos += 1;
                tokens.push(Token {
                    kind: SyntaxKind::Newline,
                    text: &source[start..pos],
                });
            }
            b'\r' => {
                pos += 1;
                if pos < bytes.len() && bytes[pos] == b'\n' {
                    pos += 1;
                }
                tokens.push(Token {
                    kind: SyntaxKind::Newline,
                    text: &source[start..pos],
                });
            }
            // Whitespace (spaces/tabs, not newlines)
            b' ' | b'\t' => {
                while pos < bytes.len() && (bytes[pos] == b' ' || bytes[pos] == b'\t') {
                    pos += 1;
                }
                tokens.push(Token {
                    kind: SyntaxKind::Whitespace,
                    text: &source[start..pos],
                });
            }
            // Comment
            b'#' => {
                while pos < bytes.len() && bytes[pos] != b'\n' && bytes[pos] != b'\r' {
                    pos += 1;
                }
                tokens.push(Token {
                    kind: SyntaxKind::Comment,
                    text: &source[start..pos],
                });
            }
            // Dash: could be `---` (directive marker), `- ` (sequence item), or plain scalar
            b'-' => {
                if pos + 2 < bytes.len() && bytes[pos + 1] == b'-' && bytes[pos + 2] == b'-' {
                    // Check it's `---` at start of line or followed by whitespace/newline/EOF
                    let after = pos + 3;
                    if after >= bytes.len()
                        || bytes[after] == b'\n'
                        || bytes[after] == b'\r'
                        || bytes[after] == b' '
                    {
                        pos += 3;
                        tokens.push(Token {
                            kind: SyntaxKind::DirectiveMarker,
                            text: &source[start..pos],
                        });
                        continue;
                    }
                }
                // `- ` or `-\n` = sequence indicator
                if pos + 1 >= bytes.len()
                    || bytes[pos + 1] == b' '
                    || bytes[pos + 1] == b'\n'
                    || bytes[pos + 1] == b'\r'
                {
                    pos += 1;
                    tokens.push(Token {
                        kind: SyntaxKind::Dash,
                        text: &source[start..pos],
                    });
                } else {
                    // Part of a plain scalar (e.g., `- ` is NOT this, but `-foo` is)
                    pos = lex_plain_scalar(source, bytes, pos);
                    tokens.push(Token {
                        kind: SyntaxKind::PlainScalar,
                        text: &source[start..pos],
                    });
                }
            }
            // Colon: only a separator when followed by space, newline, or EOF
            b':' => {
                if pos + 1 >= bytes.len()
                    || bytes[pos + 1] == b' '
                    || bytes[pos + 1] == b'\n'
                    || bytes[pos + 1] == b'\r'
                {
                    pos += 1;
                    tokens.push(Token {
                        kind: SyntaxKind::Colon,
                        text: &source[start..pos],
                    });
                } else {
                    // Part of plain scalar (e.g., `http://example.com`)
                    pos = lex_plain_scalar(source, bytes, pos);
                    tokens.push(Token {
                        kind: SyntaxKind::PlainScalar,
                        text: &source[start..pos],
                    });
                }
            }
            b',' => {
                pos += 1;
                tokens.push(Token {
                    kind: SyntaxKind::Comma,
                    text: &source[start..pos],
                });
            }
            b'[' => {
                pos += 1;
                tokens.push(Token {
                    kind: SyntaxKind::LBracket,
                    text: &source[start..pos],
                });
            }
            b']' => {
                pos += 1;
                tokens.push(Token {
                    kind: SyntaxKind::RBracket,
                    text: &source[start..pos],
                });
            }
            b'|' => {
                pos += 1;
                tokens.push(Token {
                    kind: SyntaxKind::Pipe,
                    text: &source[start..pos],
                });
            }
            b'>' => {
                pos += 1;
                tokens.push(Token {
                    kind: SyntaxKind::Gt,
                    text: &source[start..pos],
                });
            }
            // Document end marker
            b'.' if pos + 2 < bytes.len() && bytes[pos + 1] == b'.' && bytes[pos + 2] == b'.' => {
                pos += 3;
                tokens.push(Token {
                    kind: SyntaxKind::DocumentEnd,
                    text: &source[start..pos],
                });
            }
            // Single-quoted scalar — must close on the same line.
            // If no closing quote before newline, treat as plain scalar.
            b'\'' => {
                pos += 1;
                let mut closed = false;
                while pos < bytes.len() && bytes[pos] != b'\n' && bytes[pos] != b'\r' {
                    if bytes[pos] == b'\'' {
                        pos += 1;
                        // Escaped quote '' inside single-quoted string
                        if pos < bytes.len() && bytes[pos] == b'\'' {
                            pos += 1;
                            continue;
                        }
                        closed = true;
                        break;
                    }
                    pos += 1;
                }
                if closed {
                    tokens.push(Token {
                        kind: SyntaxKind::SingleQuotedScalar,
                        text: &source[start..pos],
                    });
                } else {
                    // No closing quote on this line — treat as plain scalar
                    // (common in block scalar content like: Rivet's, don't)
                    pos = lex_plain_scalar(source, bytes, start);
                    tokens.push(Token {
                        kind: SyntaxKind::PlainScalar,
                        text: &source[start..pos],
                    });
                }
            }
            // Double-quoted scalar — must close on the same line.
            b'"' => {
                pos += 1;
                let mut closed = false;
                while pos < bytes.len() && bytes[pos] != b'"' {
                    if bytes[pos] == b'\n' || bytes[pos] == b'\r' {
                        break;
                    }
                    if bytes[pos] == b'\\' {
                        pos += 1; // skip escaped char
                    }
                    pos += 1;
                }
                if pos < bytes.len() && bytes[pos] == b'"' {
                    pos += 1; // closing quote
                    closed = true;
                }
                if closed {
                    tokens.push(Token {
                        kind: SyntaxKind::DoubleQuotedScalar,
                        text: &source[start..pos],
                    });
                } else {
                    // No closing quote on this line — treat as plain scalar
                    pos = lex_plain_scalar(source, bytes, start);
                    tokens.push(Token {
                        kind: SyntaxKind::PlainScalar,
                        text: &source[start..pos],
                    });
                }
            }
            // Plain scalar (anything else)
            _ => {
                pos = lex_plain_scalar(source, bytes, pos);
                tokens.push(Token {
                    kind: SyntaxKind::PlainScalar,
                    text: &source[start..pos],
                });
            }
        }
    }

    tokens
}

/// Advance past a plain (unquoted) scalar value.
///
/// Stops at: newline, `#` preceded by space, `: ` (colon+space), `,`, `]`, `}`.
fn lex_plain_scalar(_source: &str, bytes: &[u8], start: usize) -> usize {
    let mut pos = start;
    while pos < bytes.len() {
        match bytes[pos] {
            b'\n' | b'\r' => break,
            b'#' if pos > start && bytes[pos - 1] == b' ' => break,
            b':' if pos + 1 < bytes.len()
                && (bytes[pos + 1] == b' '
                    || bytes[pos + 1] == b'\n'
                    || bytes[pos + 1] == b'\r') =>
            {
                break;
            }
            b':' if pos + 1 >= bytes.len() => break,
            b',' | b']' | b'}' => break,
            _ => pos += 1,
        }
    }
    // Trim trailing whitespace from the scalar
    while pos > start && (bytes[pos - 1] == b' ' || bytes[pos - 1] == b'\t') {
        pos -= 1;
    }
    // If we trimmed everything, take at least one char
    if pos == start && start < bytes.len() {
        pos = start + 1;
    }
    pos
}

// ── Parser ──────────────────────────────────────────────────────────────

/// Parse errors with byte offset.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ParseError {
    pub offset: usize,
    pub message: String,
}

/// Parse a YAML source string into a rowan green tree.
///
/// Returns the green node and any parse errors. The tree is lossless:
/// `SyntaxNode::new_root(green).text() == source`.
pub fn parse(source: &str) -> (rowan::GreenNode, Vec<ParseError>) {
    let tokens = lex(source);
    let mut parser = Parser::new(&tokens, source);
    parser.parse_root();
    let green = parser.builder.finish();
    (green, parser.errors)
}

struct Parser<'src> {
    tokens: &'src [Token<'src>],
    pos: usize,
    builder: GreenNodeBuilder<'static>,
    errors: Vec<ParseError>,
    /// Cumulative byte offset for error reporting.
    byte_offset: usize,
    /// Source bytes for indent computation.
    source_bytes: &'src [u8],
}

impl<'src> Parser<'src> {
    fn new(tokens: &'src [Token<'src>], source: &'src str) -> Self {
        Self {
            tokens,
            pos: 0,
            builder: GreenNodeBuilder::new(),
            errors: Vec::new(),
            byte_offset: 0,
            source_bytes: source.as_bytes(),
        }
    }

    // ── Token access ────────────────────────────────────────────────

    fn current(&self) -> Option<&Token<'src>> {
        self.tokens.get(self.pos)
    }

    fn current_kind(&self) -> Option<SyntaxKind> {
        self.current().map(|t| t.kind)
    }

    fn at(&self, kind: SyntaxKind) -> bool {
        self.current_kind() == Some(kind)
    }

    fn at_eof(&self) -> bool {
        self.pos >= self.tokens.len()
    }

    /// Consume the current token, adding it to the builder.
    fn bump(&mut self) {
        if self.pos < self.tokens.len() {
            let kind = self.tokens[self.pos].kind;
            let text = self.tokens[self.pos].text;
            self.builder.token(kind.into(), text);
            self.byte_offset += text.len();
            self.pos += 1;
        }
    }

    /// Consume the current token, adding it with a different kind.
    fn bump_as(&mut self, kind: SyntaxKind) {
        if self.pos < self.tokens.len() {
            let text = self.tokens[self.pos].text;
            self.builder.token(kind.into(), text);
            self.byte_offset += text.len();
            self.pos += 1;
        }
    }

    /// Consume newlines and comments, but NOT leading whitespace on a new line
    /// (since whitespace determines YAML structure).
    fn eat_trivia(&mut self) {
        loop {
            match self.current_kind() {
                Some(SyntaxKind::Newline) => self.bump(),
                Some(SyntaxKind::Comment) => self.bump(),
                Some(SyntaxKind::Whitespace) => {
                    // Only eat whitespace if it's NOT at the start of a line
                    // (i.e., there's non-newline content before it on this line).
                    // If the previous token was a Newline, this whitespace is
                    // structurally significant (indent) — don't eat it here.
                    if self.pos > 0 && self.tokens[self.pos - 1].kind == SyntaxKind::Newline {
                        break; // This is line-leading indent — stop
                    }
                    self.bump();
                }
                _ => break,
            }
        }
    }

    /// Consume whitespace (not newlines or comments).
    fn eat_spaces(&mut self) {
        while self.at(SyntaxKind::Whitespace) {
            self.bump();
        }
    }

    /// Get the column (indent level) of the current token in the source text.
    ///
    /// Computes from `byte_offset` by walking back to find the last newline.
    fn current_indent(&self) -> usize {
        if self.pos >= self.tokens.len() {
            return 0;
        }
        // byte_offset points to the start of the current token.
        // Walk back in the source to find the start of the current line.
        let src = self.source_bytes;
        let mut col = 0;
        let mut offset = self.byte_offset;
        while offset > 0 {
            offset -= 1;
            if src[offset] == b'\n' {
                break;
            }
            col += 1;
        }
        if offset == 0 && src[0] != b'\n' {
            col = self.byte_offset; // at start of file
        }
        col
    }

    // ── Parsing ─────────────────────────────────────────────────────

    fn parse_root(&mut self) {
        self.builder.start_node(SyntaxKind::Root.into());
        self.eat_trivia();
        // Skip document start marker if present
        if self.at(SyntaxKind::DirectiveMarker) {
            self.bump();
            self.eat_trivia();
        }
        // Parse root content (mapping or sequence)
        if !self.at_eof() {
            if self.at(SyntaxKind::Dash) {
                self.parse_block_sequence(0);
            } else {
                self.parse_block_mapping(0);
            }
        }
        // Consume any remaining trivia
        while !self.at_eof() {
            self.bump();
        }
        self.builder.finish_node();
    }

    fn parse_block_mapping(&mut self, min_indent: usize) {
        self.builder.start_node(SyntaxKind::Mapping.into());
        loop {
            self.eat_trivia();
            // Consume line-leading whitespace (indent)
            if self.at(SyntaxKind::Whitespace) {
                self.bump();
            }
            if self.at_eof() {
                break;
            }
            let indent = self.current_indent();
            if indent < min_indent {
                break;
            }
            // Must be at a key (plain scalar, quoted scalar)
            match self.current_kind() {
                Some(
                    SyntaxKind::PlainScalar
                    | SyntaxKind::SingleQuotedScalar
                    | SyntaxKind::DoubleQuotedScalar,
                ) => {
                    self.parse_mapping_entry(indent);
                }
                Some(SyntaxKind::Comment) => {
                    // Indent-aligned comment line (e.g. `  # explanation`).
                    // Eat the comment and any trailing newline; do not flag
                    // as an error or interrupt the mapping.
                    self.bump();
                    if self.at(SyntaxKind::Newline) {
                        self.bump();
                    }
                }
                Some(SyntaxKind::Dash) if indent == min_indent => {
                    // Sequence at same indent — we're done with this mapping
                    break;
                }
                Some(SyntaxKind::DirectiveMarker | SyntaxKind::DocumentEnd) => break,
                _ => {
                    // Error recovery: skip this line
                    self.builder.start_node(SyntaxKind::Error.into());
                    self.errors.push(ParseError {
                        offset: self.byte_offset,
                        message: format!("expected mapping key, found {:?}", self.current_kind()),
                    });
                    self.skip_to_next_line();
                    self.builder.finish_node();
                }
            }
        }
        self.builder.finish_node();
    }

    fn parse_mapping_entry(&mut self, entry_indent: usize) {
        self.builder.start_node(SyntaxKind::MappingEntry.into());

        // Key
        self.builder.start_node(SyntaxKind::Key.into());
        self.bump(); // consume the key scalar
        self.builder.finish_node();

        // Expect colon
        self.eat_spaces();
        if self.at(SyntaxKind::Colon) {
            self.bump();
        } else {
            self.errors.push(ParseError {
                offset: self.byte_offset,
                message: "expected ':' after mapping key".into(),
            });
            self.builder.finish_node();
            return;
        }

        // Value
        self.eat_spaces();
        self.builder.start_node(SyntaxKind::Value.into());

        match self.current_kind() {
            // Block scalar: | or >
            Some(SyntaxKind::Pipe | SyntaxKind::Gt) => {
                self.parse_block_scalar(entry_indent);
            }
            // Flow sequence: [...]
            Some(SyntaxKind::LBracket) => {
                self.parse_flow_sequence();
            }
            // Inline scalar value on the same line — consume everything until newline.
            // This handles values containing colons like "title: This is: complex"
            Some(
                SyntaxKind::PlainScalar
                | SyntaxKind::SingleQuotedScalar
                | SyntaxKind::DoubleQuotedScalar,
            ) => {
                // Consume all tokens on this line as part of the value
                while !self.at_eof()
                    && !self.at(SyntaxKind::Newline)
                    && !self.at(SyntaxKind::Comment)
                {
                    self.bump();
                }
                // Eat trailing comment on the same line
                if self.at(SyntaxKind::Comment) {
                    self.bump();
                }
                // Multi-line plain scalars: consume continuation lines that
                // are indented deeper than the entry and don't start a new
                // mapping entry or sequence item.
                while self.at(SyntaxKind::Newline) {
                    if !self.is_plain_scalar_continuation(entry_indent) {
                        break;
                    }
                    self.bump(); // newline
                    while !self.at_eof()
                        && !self.at(SyntaxKind::Newline)
                        && !self.at(SyntaxKind::Comment)
                    {
                        self.bump();
                    }
                    if self.at(SyntaxKind::Comment) {
                        self.bump();
                    }
                }
            }
            // Newline: value is on the next line (nested mapping or sequence)
            Some(SyntaxKind::Newline) | Some(SyntaxKind::Comment) => {
                // Eat newline + comments
                while matches!(
                    self.current_kind(),
                    Some(SyntaxKind::Newline | SyntaxKind::Comment | SyntaxKind::Whitespace)
                ) {
                    self.bump();
                }
                if !self.at_eof() {
                    let child_indent = self.current_indent();
                    if child_indent > entry_indent {
                        if self.at(SyntaxKind::Dash) {
                            self.parse_block_sequence(child_indent);
                        } else {
                            self.parse_block_mapping(child_indent);
                        }
                    }
                    // If child_indent <= entry_indent, empty value
                }
            }
            // Empty value or EOF
            _ => {}
        }

        self.builder.finish_node(); // Value
        self.builder.finish_node(); // MappingEntry
    }

    fn parse_block_sequence(&mut self, min_indent: usize) {
        self.builder.start_node(SyntaxKind::Sequence.into());
        loop {
            self.eat_trivia();
            if self.at(SyntaxKind::Whitespace) {
                self.bump();
            }
            // Comments at/above sequence indent are trivia — consume and retry
            if self.at(SyntaxKind::Comment) {
                self.bump();
                continue;
            }
            if self.at_eof() {
                break;
            }
            let indent = self.current_indent();
            if indent < min_indent {
                break;
            }
            if !self.at(SyntaxKind::Dash) {
                break;
            }

            self.builder.start_node(SyntaxKind::SequenceItem.into());
            self.bump(); // consume `-`
            self.eat_spaces();

            // Item value
            match self.current_kind() {
                Some(SyntaxKind::LBracket) => {
                    self.parse_flow_sequence();
                }
                Some(SyntaxKind::Pipe | SyntaxKind::Gt) => {
                    self.parse_block_scalar(indent);
                }
                Some(
                    SyntaxKind::PlainScalar
                    | SyntaxKind::SingleQuotedScalar
                    | SyntaxKind::DoubleQuotedScalar,
                ) => {
                    // Could be a simple scalar OR the start of a mapping (key: value)
                    // Peek ahead for colon
                    let has_colon = self.peek_colon_after_scalar();
                    if has_colon {
                        // This is a nested mapping inside the sequence item
                        let item_indent = indent + 2; // items are indented past the `-`
                        self.parse_block_mapping(self.current_indent());
                        let _ = item_indent;
                    } else {
                        // Consume all tokens on this line (handles commas in values)
                        while !self.at_eof()
                            && !self.at(SyntaxKind::Newline)
                            && !self.at(SyntaxKind::Comment)
                        {
                            self.bump();
                        }
                        if self.at(SyntaxKind::Comment) {
                            self.bump();
                        }
                    }
                }
                Some(SyntaxKind::Newline | SyntaxKind::Comment) => {
                    // Eat trivia, then check for nested content
                    while matches!(
                        self.current_kind(),
                        Some(SyntaxKind::Newline | SyntaxKind::Comment | SyntaxKind::Whitespace)
                    ) {
                        self.bump();
                    }
                    if !self.at_eof() {
                        let child_indent = self.current_indent();
                        if child_indent > indent {
                            if self.at(SyntaxKind::Dash) {
                                self.parse_block_sequence(child_indent);
                            } else {
                                self.parse_block_mapping(child_indent);
                            }
                        }
                    }
                }
                _ => {}
            }

            self.builder.finish_node(); // SequenceItem
        }
        self.builder.finish_node(); // Sequence
    }

    fn parse_flow_sequence(&mut self) {
        self.builder.start_node(SyntaxKind::FlowSequence.into());
        self.bump(); // consume `[`

        loop {
            self.eat_trivia();
            if self.at_eof() || self.at(SyntaxKind::RBracket) {
                break;
            }
            // Consume a value
            match self.current_kind() {
                Some(
                    SyntaxKind::PlainScalar
                    | SyntaxKind::SingleQuotedScalar
                    | SyntaxKind::DoubleQuotedScalar,
                ) => {
                    self.bump();
                }
                Some(SyntaxKind::LBracket) => {
                    self.parse_flow_sequence(); // nested
                }
                _ => {
                    // Error: unexpected token in flow sequence
                    self.builder.start_node(SyntaxKind::Error.into());
                    self.errors.push(ParseError {
                        offset: self.byte_offset,
                        message: "unexpected token in flow sequence".into(),
                    });
                    self.bump();
                    self.builder.finish_node();
                }
            }
            self.eat_trivia();
            if self.at(SyntaxKind::Comma) {
                self.bump();
            }
        }

        if self.at(SyntaxKind::RBracket) {
            self.bump();
        } else {
            self.errors.push(ParseError {
                offset: self.byte_offset,
                message: "expected ']' to close flow sequence".into(),
            });
        }
        self.builder.finish_node();
    }

    fn parse_block_scalar(&mut self, parent_indent: usize) {
        self.builder.start_node(SyntaxKind::BlockScalar.into());
        self.bump(); // consume `|` or `>`

        // Optional chomp/keep indicator and width on the same line
        self.eat_spaces();
        if matches!(
            self.current_kind(),
            Some(SyntaxKind::PlainScalar | SyntaxKind::Dash)
        ) {
            self.bump_as(SyntaxKind::PlainScalar); // chomp indicator like `|+`, `|-`, `|2`
        }
        if self.at(SyntaxKind::Comment) {
            self.bump();
        }

        // Consume newline after header
        if self.at(SyntaxKind::Newline) {
            self.bump();
        }

        // Consume continuation lines (indented deeper than parent)
        loop {
            if self.at_eof() {
                break;
            }
            // Check if next content line is indented deeper
            let mut lookahead = self.pos;
            let mut line_indent = 0;
            let mut is_blank = true;
            while lookahead < self.tokens.len() {
                match self.tokens[lookahead].kind {
                    SyntaxKind::Whitespace => {
                        line_indent = self.tokens[lookahead].text.len();
                        lookahead += 1;
                    }
                    SyntaxKind::Newline => {
                        // Blank line — keep it as part of block scalar
                        break;
                    }
                    _ => {
                        is_blank = false;
                        break;
                    }
                }
            }

            if is_blank && lookahead < self.tokens.len() {
                // Blank line: consume whitespace + newline
                while self.pos <= lookahead && !self.at_eof() {
                    self.bump_as(SyntaxKind::BlockScalarLine);
                }
                continue;
            }

            if line_indent <= parent_indent {
                break; // Back to parent indent or less — end of block scalar
            }

            // Consume the entire line as BlockScalarLine
            while !self.at_eof() && !self.at(SyntaxKind::Newline) {
                self.bump_as(SyntaxKind::BlockScalarLine);
            }
            if self.at(SyntaxKind::Newline) {
                self.bump_as(SyntaxKind::BlockScalarLine);
            }
        }

        self.builder.finish_node();
    }

    // ── Helpers ─────────────────────────────────────────────────────

    /// Check if the line after the current Newline is a plain scalar
    /// continuation (indented deeper than `entry_indent`, not a new
    /// mapping entry or sequence item, and not blank).
    fn is_plain_scalar_continuation(&self, entry_indent: usize) -> bool {
        // self.pos should be at a Newline token
        let mut la = self.pos + 1;
        let mut line_indent = 0;

        // Measure indent
        if la < self.tokens.len() && self.tokens[la].kind == SyntaxKind::Whitespace {
            line_indent = self.tokens[la].text.len();
            la += 1;
        }

        // Must be indented deeper than the mapping entry
        if line_indent <= entry_indent {
            return false;
        }

        // Must have content (not blank)
        if la >= self.tokens.len() {
            return false;
        }
        match self.tokens[la].kind {
            SyntaxKind::Newline => false, // blank line
            SyntaxKind::Dash => false,    // sequence indicator
            SyntaxKind::Comment => false, // comment-only line
            SyntaxKind::PlainScalar
            | SyntaxKind::SingleQuotedScalar
            | SyntaxKind::DoubleQuotedScalar => {
                // Check if it looks like a mapping entry (key followed by colon)
                let mut peek = la + 1;
                while peek < self.tokens.len() && self.tokens[peek].kind == SyntaxKind::Whitespace {
                    peek += 1;
                }
                if peek < self.tokens.len() && self.tokens[peek].kind == SyntaxKind::Colon {
                    return false; // it's a mapping entry, not a continuation
                }
                true
            }
            _ => true, // other content tokens are continuations
        }
    }

    /// Look ahead to see if there's a colon after the current scalar on the same line.
    fn peek_colon_after_scalar(&self) -> bool {
        let mut i = self.pos + 1;
        while i < self.tokens.len() {
            match self.tokens[i].kind {
                SyntaxKind::Whitespace => i += 1,
                SyntaxKind::Colon => return true,
                SyntaxKind::Newline | SyntaxKind::Comment => return false,
                _ => return false,
            }
        }
        false
    }

    /// Skip tokens until the next newline (for error recovery).
    fn skip_to_next_line(&mut self) {
        while !self.at_eof() {
            if self.at(SyntaxKind::Newline) {
                self.bump();
                return;
            }
            self.bump();
        }
    }
}

// ── Public API ──────────────────────────────────────────────────────────

/// Compute a line-start offset table from source text.
///
/// Returns a `Vec<u32>` where `line_starts[i]` is the byte offset of line `i`.
/// Line 0 starts at offset 0.
pub fn line_starts(source: &str) -> Vec<u32> {
    let mut starts = vec![0u32];
    for (i, b) in source.bytes().enumerate() {
        if b == b'\n' {
            starts.push((i + 1) as u32);
        }
    }
    starts
}

/// Convert a byte offset to (line, column) using a line-starts table.
///
/// Both line and column are 0-based.
pub fn offset_to_line_col(line_starts: &[u32], offset: u32) -> (u32, u32) {
    let line = line_starts
        .partition_point(|&s| s <= offset)
        .saturating_sub(1);
    let col = offset - line_starts[line];
    (line as u32, col)
}

// ── Tests ───────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;

    fn parse_and_check(source: &str) -> SyntaxNode {
        let (green, errors) = parse(source);
        let root = SyntaxNode::new_root(green);
        // Lossless round-trip
        assert_eq!(
            root.text().to_string(),
            source,
            "round-trip failed for:\n{source}"
        );
        if !errors.is_empty() {
            panic!("unexpected parse errors: {errors:?}");
        }
        root
    }

    #[test]
    fn simple_mapping() {
        parse_and_check("key: value\n");
    }

    /// Regression: a comment-only line inside a mapping must not produce
    /// "expected mapping key, found Some(Comment)". The LSP YAML parser
    /// surfaced a false-positive diagnostic on every CI workflow file
    /// (.github/workflows/*.yml) where line-leading comments are common.
    #[test]
    fn mapping_with_comment_only_line() {
        parse_and_check("key1: value1\n# leading comment line\nkey2: value2\n");
    }

    #[test]
    fn mapping_with_indented_comment_line() {
        parse_and_check("parent:\n  child1: 1\n  # mid comment\n  child2: 2\n");
    }

    #[test]
    fn mapping_with_inline_trailing_comment_on_value() {
        parse_and_check("key: value # trailing\n");
    }

    #[test]
    fn nested_mapping() {
        parse_and_check("parent:\n  child: value\n  other: stuff\n");
    }

    #[test]
    fn sequence() {
        parse_and_check("items:\n  - one\n  - two\n  - three\n");
    }

    #[test]
    fn mapping_in_sequence() {
        parse_and_check(
            "artifacts:\n  - id: REQ-001\n    title: First\n  - id: REQ-002\n    title: Second\n",
        );
    }

    #[test]
    fn flow_sequence() {
        parse_and_check("tags: [foo, bar, baz]\n");
    }

    #[test]
    fn block_scalar_literal() {
        parse_and_check("description: |\n  Line one\n  Line two\n");
    }

    #[test]
    fn block_scalar_folded() {
        parse_and_check("description: >\n  Folded line one\n  Folded line two\n");
    }

    #[test]
    fn comments_preserved() {
        let source = "# Top comment\nkey: value # inline\n";
        parse_and_check(source);
    }

    #[test]
    fn quoted_strings() {
        parse_and_check("single: 'hello world'\ndouble: \"hello world\"\n");
    }

    #[test]
    fn empty_value() {
        parse_and_check("key:\n");
    }

    #[test]
    fn document_start_marker() {
        parse_and_check("---\nkey: value\n");
    }

    #[test]
    fn complex_stpa_structure() {
        let source = "\
losses:
  - id: L-001
    title: Loss of vehicle control
    description: >
      Driver loses ability to control vehicle trajectory.
    stakeholders: [driver, passengers]

hazards:
  - id: H-001
    title: Unintended acceleration
    losses: [L-001]
";
        parse_and_check(source);
    }

    #[test]
    fn generic_artifacts() {
        let source = "\
artifacts:
  - id: REQ-001
    type: requirement
    title: First requirement
    status: draft
    tags: [core, safety]
    links:
      - type: satisfies
        target: FEAT-001
    fields:
      priority: must
";
        parse_and_check(source);
    }

    #[test]
    fn line_starts_computation() {
        let source = "line0\nline1\nline2\n";
        let starts = line_starts(source);
        assert_eq!(starts, vec![0, 6, 12, 18]);
    }

    #[test]
    fn offset_to_line_col_basic() {
        let source = "abc\ndef\nghi\n";
        let starts = line_starts(source);
        assert_eq!(offset_to_line_col(&starts, 0), (0, 0)); // 'a'
        assert_eq!(offset_to_line_col(&starts, 4), (1, 0)); // 'd'
        assert_eq!(offset_to_line_col(&starts, 5), (1, 1)); // 'e'
        assert_eq!(offset_to_line_col(&starts, 8), (2, 0)); // 'g'
    }

    #[test]
    fn url_in_value_not_split() {
        // Colon inside URL should not be treated as mapping separator
        parse_and_check("homepage: http://example.com\n");
    }

    #[test]
    fn colon_in_value() {
        parse_and_check("title: This is a title: with colon\n");
    }

    #[test]
    fn comma_in_sequence_item() {
        parse_and_check(
            "process-model:\n  - Current state of local files\n  - Pending changes, unresolved conflicts\n  - Coverage completeness\n",
        );
    }

    #[test]
    fn comment_between_sequence_items() {
        parse_and_check("items:\n  - one\n  # comment\n  - two\n");
    }

    #[test]
    fn comment_between_mapping_items_in_sequence() {
        parse_and_check(
            "controllers:\n  # first\n  - id: CTRL-1\n    name: First\n  # second\n  - id: CTRL-2\n    name: Second\n",
        );
    }

    #[test]
    fn multiline_plain_scalar() {
        parse_and_check("fields:\n  alt: Rejected because it\n    requires separate deploy.\n");
    }

    #[test]
    fn multiline_plain_scalar_nested() {
        parse_and_check(
            "items:\n  - id: X\n    fields:\n      alt: Rejected because it\n        requires separate deploy.\n\n  - id: Y\n    title: Next\n",
        );
    }

    #[test]
    fn mermaid_in_block_scalar() {
        parse_and_check(
            "diagram: |\n  graph LR\n    A[Rivet] -->|OSLC| B[Polar]\n    style A fill:#e8f4fd\n",
        );
    }

    #[test]
    fn parse_actual_hazards_file() {
        let source = std::fs::read_to_string(
            std::path::Path::new(env!("CARGO_MANIFEST_DIR")).join("../safety/stpa/hazards.yaml"),
        )
        .unwrap();
        let (green, errors) = parse(&source);
        let root = SyntaxNode::new_root(green);
        assert_eq!(root.text().to_string(), source, "round-trip broken");

        fn count_kind(node: &SyntaxNode, kind: SyntaxKind) -> usize {
            let mut n = if node.kind() == kind { 1 } else { 0 };
            for c in node.children() {
                n += count_kind(&c, kind);
            }
            n
        }
        assert_eq!(
            count_kind(&root, SyntaxKind::Error),
            0,
            "should have no Error nodes"
        );
        assert!(errors.is_empty(), "should have no parse errors: {errors:?}");
        assert_eq!(
            count_kind(&root, SyntaxKind::SequenceItem),
            34,
            "should have 34 sequence items (22 hazards + 12 sub-hazards)"
        );
    }

    #[test]
    fn stpa_hazard_sequence() {
        // Exact pattern from hazards.yaml: folded block scalar + flow seq value
        parse_and_check(
            "hazards:\n\
             \x20\x20- id: H-4\n\
             \x20\x20\x20\x20title: Rivet imports mismatched data\n\
             \x20\x20\x20\x20description: >\n\
             \x20\x20\x20\x20\x20\x20Artifact types from external tools are\n\
             \x20\x20\x20\x20\x20\x20mapped incorrectly to Rivet's schema.\n\
             \x20\x20\x20\x20losses: [L-1, L-3]\n\
             \n\
             \x20\x20- id: H-5\n\
             \x20\x20\x20\x20title: Concurrent modification\n\
             \x20\x20\x20\x20losses: [L-1, L-3, L-6]\n",
        );
    }

    #[test]
    fn error_recovery_on_bad_input() {
        let source = "good: value\n][invalid\nbetter: ok\n";
        let (green, errors) = parse(source);
        let root = SyntaxNode::new_root(green);
        // Round-trip still works
        assert_eq!(root.text().to_string(), source);
        // But there should be errors
        assert!(!errors.is_empty(), "should have parse errors");
    }
}
