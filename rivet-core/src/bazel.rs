// rivet-core/src/bazel.rs
//
//! Rowan-based parser for the `MODULE.bazel` Starlark subset.
//!
//! Only the declarative subset used by Bazel module files is supported:
//! top-level function calls such as `module()`, `bazel_dep()`, `git_override()`,
//! `archive_override()`, and `local_path_override()`.  Unsupported constructs
//! (`load()`, `if`, `for`, variable assignment) are captured as `Error` nodes
//! with human-readable diagnostics so that parsing can continue.

use rowan::GreenNodeBuilder;

// ---------------------------------------------------------------------------
// SyntaxKind
// ---------------------------------------------------------------------------

/// Token and node kinds for the MODULE.bazel micro-grammar.
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash)]
#[repr(u16)]
pub enum SyntaxKind {
    // --- Tokens ---
    /// Whitespace (spaces, tabs — but NOT newlines).
    Whitespace = 0,
    /// A `#`-comment through to end of line (not including the newline).
    Comment,
    /// One or more `\n` (or `\r\n`) characters.
    Newline,
    /// `(`
    LParen,
    /// `)`
    RParen,
    /// `[`
    LBracket,
    /// `]`
    RBracket,
    /// `,`
    Comma,
    /// `=`
    Equals,
    /// A double-quoted string literal including the quotes.
    StringLit,
    /// An integer literal (`[0-9]+`).
    IntegerLit,
    /// The keyword `True`.
    TrueLit,
    /// The keyword `False`.
    FalseLit,
    /// The keyword `None`.
    NoneLit,
    /// An identifier `[a-zA-Z_][a-zA-Z0-9_]*`.
    Ident,
    /// `.`
    Dot,

    // --- Composite nodes ---
    /// The root node of the tree.
    Root,
    /// A top-level function call: `ident(args)`.
    FunctionCall,
    /// The parenthesised argument list (including parens).
    ArgumentList,
    /// A single `key = value` argument.
    KeywordArg,
    /// A list expression `[value, ...]`.
    ListExpr,

    // --- Error recovery ---
    /// A span of text the parser could not interpret.
    Error,
}

impl From<SyntaxKind> for rowan::SyntaxKind {
    fn from(kind: SyntaxKind) -> Self {
        Self(kind as u16)
    }
}

// ---------------------------------------------------------------------------
// Language definition
// ---------------------------------------------------------------------------

/// Rowan language tag for MODULE.bazel.
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash)]
pub enum BazelLanguage {}

impl rowan::Language for BazelLanguage {
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
pub type SyntaxNode = rowan::SyntaxNode<BazelLanguage>;

// ---------------------------------------------------------------------------
// Lexer
// ---------------------------------------------------------------------------

/// A single token produced by the lexer.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Token<'src> {
    pub kind: SyntaxKind,
    pub text: &'src str,
}

/// Lex a MODULE.bazel source string into a sequence of tokens.
///
/// Every byte of the input is accounted for (trivia is kept).
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
                while pos < bytes.len() && bytes[pos] == b'\n' {
                    pos += 1;
                    // also eat a preceding \r that we may have skipped
                }
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
                // keep eating newlines
                while pos < bytes.len() && (bytes[pos] == b'\n' || bytes[pos] == b'\r') {
                    pos += 1;
                }
                tokens.push(Token {
                    kind: SyntaxKind::Newline,
                    text: &source[start..pos],
                });
            }
            // Whitespace (no newlines)
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
                while pos < bytes.len() && bytes[pos] != b'\n' {
                    pos += 1;
                }
                tokens.push(Token {
                    kind: SyntaxKind::Comment,
                    text: &source[start..pos],
                });
            }
            // Single-character tokens
            b'(' => {
                pos += 1;
                tokens.push(Token {
                    kind: SyntaxKind::LParen,
                    text: "(",
                });
            }
            b')' => {
                pos += 1;
                tokens.push(Token {
                    kind: SyntaxKind::RParen,
                    text: ")",
                });
            }
            b'[' => {
                pos += 1;
                tokens.push(Token {
                    kind: SyntaxKind::LBracket,
                    text: "[",
                });
            }
            b']' => {
                pos += 1;
                tokens.push(Token {
                    kind: SyntaxKind::RBracket,
                    text: "]",
                });
            }
            b',' => {
                pos += 1;
                tokens.push(Token {
                    kind: SyntaxKind::Comma,
                    text: ",",
                });
            }
            b'=' => {
                pos += 1;
                tokens.push(Token {
                    kind: SyntaxKind::Equals,
                    text: "=",
                });
            }
            b'.' => {
                pos += 1;
                tokens.push(Token {
                    kind: SyntaxKind::Dot,
                    text: ".",
                });
            }
            // String literal
            b'"' => {
                pos += 1;
                let mut escaped = false;
                while pos < bytes.len() {
                    if escaped {
                        escaped = false;
                        pos += 1;
                    } else if bytes[pos] == b'\\' {
                        escaped = true;
                        pos += 1;
                    } else if bytes[pos] == b'"' {
                        pos += 1;
                        break;
                    } else {
                        pos += 1;
                    }
                }
                tokens.push(Token {
                    kind: SyntaxKind::StringLit,
                    text: &source[start..pos],
                });
            }
            // Ident or keyword
            b'a'..=b'z' | b'A'..=b'Z' | b'_' => {
                while pos < bytes.len()
                    && (bytes[pos].is_ascii_alphanumeric() || bytes[pos] == b'_')
                {
                    pos += 1;
                }
                let text = &source[start..pos];
                let kind = match text {
                    "True" => SyntaxKind::TrueLit,
                    "False" => SyntaxKind::FalseLit,
                    "None" => SyntaxKind::NoneLit,
                    _ => SyntaxKind::Ident,
                };
                tokens.push(Token { kind, text });
            }
            // Integer literal
            b'0'..=b'9' => {
                while pos < bytes.len() && bytes[pos].is_ascii_digit() {
                    pos += 1;
                }
                tokens.push(Token {
                    kind: SyntaxKind::IntegerLit,
                    text: &source[start..pos],
                });
            }
            // Anything else: consume a single byte as Error
            _ => {
                pos += 1;
                tokens.push(Token {
                    kind: SyntaxKind::Error,
                    text: &source[start..pos],
                });
            }
        }
    }

    tokens
}

// ---------------------------------------------------------------------------
// Parser
// ---------------------------------------------------------------------------

/// Recursive-descent parser that builds a rowan `GreenNode`.
struct Parser<'t> {
    tokens: &'t [Token<'t>],
    pos: usize,
    builder: GreenNodeBuilder<'static>,
    errors: Vec<String>,
}

impl<'t> Parser<'t> {
    fn new(tokens: &'t [Token<'t>]) -> Self {
        Self {
            tokens,
            pos: 0,
            builder: GreenNodeBuilder::new(),
            errors: Vec::new(),
        }
    }

    // -- helpers --

    fn current(&self) -> Option<SyntaxKind> {
        self.tokens.get(self.pos).map(|t| t.kind)
    }

    fn current_text(&self) -> &str {
        self.tokens.get(self.pos).map_or("", |t| t.text)
    }

    /// Advance past the current token, adding it as a leaf to the builder.
    fn bump(&mut self) {
        if let Some(tok) = self.tokens.get(self.pos) {
            self.builder.token(tok.kind.into(), tok.text);
            self.pos += 1;
        }
    }

    /// Advance past the current token, but record it under a different kind.
    fn bump_as(&mut self, kind: SyntaxKind) {
        if let Some(tok) = self.tokens.get(self.pos) {
            self.builder.token(kind.into(), tok.text);
            self.pos += 1;
        }
    }

    /// Skip any whitespace/newline/comment tokens, adding them as trivia.
    fn skip_trivia(&mut self) {
        while let Some(kind) = self.current() {
            match kind {
                SyntaxKind::Whitespace | SyntaxKind::Newline | SyntaxKind::Comment => self.bump(),
                _ => break,
            }
        }
    }

    /// Expect a specific token kind; emit error if not found.
    fn expect(&mut self, expected: SyntaxKind) {
        if self.current() == Some(expected) {
            self.bump();
        } else {
            let found = self.current().map_or("EOF".into(), |k| format!("{k:?}"));
            self.errors
                .push(format!("expected {expected:?}, found {found}"));
        }
    }

    // -- grammar rules --

    fn parse_root(&mut self) {
        self.builder.start_node(SyntaxKind::Root.into());

        loop {
            self.skip_trivia();
            if self.current().is_none() {
                break;
            }
            // We expect a top-level function call starting with an Ident.
            if self.current() == Some(SyntaxKind::Ident) {
                // Peek ahead (skipping trivia) to see what follows the ident.
                let next_non_trivia = self.peek_non_trivia(1);
                match next_non_trivia {
                    Some(SyntaxKind::LParen) => {
                        // Own the name string before any mutable borrow of self
                        // (avoids Miri provenance issue with overlapping borrows).
                        let name = self.current_text().to_owned();
                        if matches!(name.as_str(), "load" | "exports_files" | "package") {
                            self.emit_error_until_end_of_statement(&format!(
                                "unsupported: {name}() statement"
                            ));
                        } else {
                            self.parse_function_call();
                        }
                    }
                    Some(SyntaxKind::Dot) => {
                        // Method-call chain: e.g. `use_repo(ext, "repo")`
                        // after something like `ext = use_extension(...)`.
                        // For now treat the whole ident.ident(...) as unsupported.
                        self.emit_error_until_end_of_statement(
                            "unsupported: dotted expression / method call",
                        );
                    }
                    Some(SyntaxKind::Equals) => {
                        // Variable assignment — unsupported.
                        self.emit_error_until_end_of_statement("unsupported: variable assignment");
                    }
                    _ => {
                        self.emit_error_until_end_of_statement("expected function call");
                    }
                }
            } else {
                // Something other than an ident at top level — error recovery.
                self.emit_error_until_end_of_statement("unexpected token at top level");
            }
        }

        self.builder.finish_node(); // Root
    }

    /// Peek past the next `skip` non-trivia tokens and return the kind.
    fn peek_non_trivia(&self, mut skip: usize) -> Option<SyntaxKind> {
        let mut i = self.pos;
        while i < self.tokens.len() {
            let kind = self.tokens[i].kind;
            match kind {
                SyntaxKind::Whitespace | SyntaxKind::Newline | SyntaxKind::Comment => {
                    i += 1;
                }
                _ => {
                    if skip == 0 {
                        return Some(kind);
                    }
                    skip -= 1;
                    i += 1;
                }
            }
        }
        None
    }

    fn parse_function_call(&mut self) {
        self.builder.start_node(SyntaxKind::FunctionCall.into());

        // Function name (Ident already confirmed by caller).
        self.bump(); // Ident

        self.skip_trivia();
        self.parse_argument_list();

        self.builder.finish_node(); // FunctionCall
    }

    fn parse_argument_list(&mut self) {
        self.builder.start_node(SyntaxKind::ArgumentList.into());

        self.expect(SyntaxKind::LParen);

        loop {
            self.skip_trivia();
            match self.current() {
                None | Some(SyntaxKind::RParen) => break,
                Some(SyntaxKind::Ident) => {
                    let next = self.peek_non_trivia(1);
                    if next == Some(SyntaxKind::Equals) {
                        self.parse_keyword_arg();
                    } else {
                        // Positional argument — parse the value directly.
                        self.parse_value();
                    }
                }
                _ => {
                    // Could be a positional value (string, int, list, bool, None).
                    self.parse_value();
                }
            }
            self.skip_trivia();
            if self.current() == Some(SyntaxKind::Comma) {
                self.bump(); // Comma
            }
        }

        self.skip_trivia();
        self.expect(SyntaxKind::RParen);

        self.builder.finish_node(); // ArgumentList
    }

    fn parse_keyword_arg(&mut self) {
        self.builder.start_node(SyntaxKind::KeywordArg.into());

        self.bump(); // Ident (key)
        self.skip_trivia();
        self.expect(SyntaxKind::Equals);
        self.skip_trivia();
        self.parse_value();

        self.builder.finish_node(); // KeywordArg
    }

    fn parse_value(&mut self) {
        match self.current() {
            Some(SyntaxKind::StringLit)
            | Some(SyntaxKind::IntegerLit)
            | Some(SyntaxKind::TrueLit)
            | Some(SyntaxKind::FalseLit)
            | Some(SyntaxKind::NoneLit) => {
                self.bump();
            }
            Some(SyntaxKind::LBracket) => self.parse_list(),
            Some(SyntaxKind::Ident) => {
                // Could be a bare identifier used as a positional arg (e.g. variable reference).
                // We'll just emit it; HIR can decide if it's meaningful.
                self.bump();
            }
            _ => {
                let text = self.current_text().to_string();
                self.errors
                    .push(format!("unexpected token in value position: \"{text}\""));
                self.bump_as(SyntaxKind::Error);
            }
        }
    }

    fn parse_list(&mut self) {
        self.builder.start_node(SyntaxKind::ListExpr.into());

        self.bump(); // LBracket

        loop {
            self.skip_trivia();
            match self.current() {
                None | Some(SyntaxKind::RBracket) => break,
                _ => self.parse_value(),
            }
            self.skip_trivia();
            if self.current() == Some(SyntaxKind::Comma) {
                self.bump(); // Comma
            }
        }

        self.skip_trivia();
        self.expect(SyntaxKind::RBracket);

        self.builder.finish_node(); // ListExpr
    }

    /// Error recovery: wrap everything up to the next newline (or matching paren)
    /// in an Error node.
    ///
    /// Uses direct index access to `self.tokens[self.pos]` instead of
    /// `self.current()` + `self.bump()` to avoid overlapping `&self` / `&mut self`
    /// borrows that Miri flags as UB under strict provenance.
    fn emit_error_until_end_of_statement(&mut self, msg: &str) {
        self.errors.push(msg.to_string());
        self.builder.start_node(SyntaxKind::Error.into());

        let mut depth: i32 = 0;
        loop {
            if self.pos >= self.tokens.len() {
                break;
            }
            let kind = self.tokens[self.pos].kind;
            match kind {
                SyntaxKind::Newline if depth <= 0 => {
                    // Don't consume the newline itself — leave it for trivia.
                    break;
                }
                SyntaxKind::LParen | SyntaxKind::LBracket => {
                    depth += 1;
                    let text = self.tokens[self.pos].text;
                    self.builder.token(kind.into(), text);
                    self.pos += 1;
                }
                SyntaxKind::RParen | SyntaxKind::RBracket => {
                    depth -= 1;
                    let text = self.tokens[self.pos].text;
                    self.builder.token(kind.into(), text);
                    self.pos += 1;
                    if depth <= 0 {
                        break;
                    }
                }
                _ => {
                    let text = self.tokens[self.pos].text;
                    self.builder.token(kind.into(), text);
                    self.pos += 1;
                }
            }
        }

        self.builder.finish_node(); // Error
    }
}

/// Parse a MODULE.bazel source string, returning the green tree and any diagnostics.
pub fn parse(source: &str) -> (rowan::GreenNode, Vec<String>) {
    let tokens = lex(source);
    let mut parser = Parser::new(&tokens);
    parser.parse_root();
    let green = parser.builder.finish();
    (green, parser.errors)
}

// ---------------------------------------------------------------------------
// HIR — typed extraction
// ---------------------------------------------------------------------------

/// A parsed MODULE.bazel file.
#[derive(Debug, Clone, Default)]
pub struct BazelModule {
    /// The module name (from the `module()` call).
    pub name: Option<String>,
    /// The module version (from the `module()` call).
    pub version: Option<String>,
    /// Module compatibility level.
    pub compatibility_level: Option<i64>,
    /// All `bazel_dep()` entries.
    pub deps: Vec<BazelDep>,
    /// All override entries.
    pub overrides: Vec<Override>,
    /// Diagnostics collected during parsing or HIR extraction.
    pub diagnostics: Vec<String>,
}

/// A single `bazel_dep(name = "...", version = "...")`.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct BazelDep {
    pub name: String,
    pub version: String,
    pub dev_dependency: bool,
}

/// An override declaration (git, archive, or local path).
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum Override {
    Git {
        module_name: String,
        remote: String,
        commit: String,
    },
    Archive {
        module_name: String,
        urls: Vec<String>,
    },
    LocalPath {
        module_name: String,
        path: String,
    },
}

impl BazelModule {
    /// Walk a CST and extract the typed HIR.
    pub fn from_cst(root: SyntaxNode) -> Self {
        let mut module = Self::default();

        for child in root.children() {
            if child.kind() != SyntaxKind::FunctionCall {
                continue;
            }
            let fn_name = Self::function_name(&child);
            let args = Self::extract_kwargs(&child);

            match fn_name.as_deref() {
                Some("module") => {
                    module.name = args.get("name").and_then(Self::as_string);
                    module.version = args.get("version").and_then(Self::as_string);
                    if let Some(val) = args.get("compatibility_level") {
                        module.compatibility_level = Self::as_int(val);
                    }
                }
                Some("bazel_dep") => {
                    if let (Some(name), Some(version)) = (
                        args.get("name").and_then(Self::as_string),
                        args.get("version").and_then(Self::as_string),
                    ) {
                        let dev = args
                            .get("dev_dependency")
                            .and_then(Self::as_bool)
                            .unwrap_or(false);
                        module.deps.push(BazelDep {
                            name,
                            version,
                            dev_dependency: dev,
                        });
                    } else {
                        module
                            .diagnostics
                            .push("bazel_dep missing name or version".into());
                    }
                }
                Some("git_override") => {
                    if let (Some(mn), Some(remote), Some(commit)) = (
                        args.get("module_name").and_then(Self::as_string),
                        args.get("remote").and_then(Self::as_string),
                        args.get("commit").and_then(Self::as_string),
                    ) {
                        module.overrides.push(Override::Git {
                            module_name: mn,
                            remote,
                            commit,
                        });
                    }
                }
                Some("archive_override") => {
                    if let Some(mn) = args.get("module_name").and_then(Self::as_string) {
                        let urls = args
                            .get("urls")
                            .and_then(Self::as_string_list)
                            .unwrap_or_default();
                        module.overrides.push(Override::Archive {
                            module_name: mn,
                            urls,
                        });
                    }
                }
                Some("local_path_override") => {
                    if let (Some(mn), Some(path)) = (
                        args.get("module_name").and_then(Self::as_string),
                        args.get("path").and_then(Self::as_string),
                    ) {
                        module.overrides.push(Override::LocalPath {
                            module_name: mn,
                            path,
                        });
                    }
                }
                _ => {
                    // Silently ignore unknown calls (e.g. register_toolchains).
                }
            }
        }

        module
    }

    // -- CST navigation helpers --

    fn function_name(call: &SyntaxNode) -> Option<String> {
        for child in call.children_with_tokens() {
            match child {
                rowan::NodeOrToken::Token(tok) if tok.kind() == SyntaxKind::Ident => {
                    return Some(tok.text().to_string());
                }
                rowan::NodeOrToken::Token(tok)
                    if tok.kind() == SyntaxKind::Whitespace
                        || tok.kind() == SyntaxKind::Newline
                        || tok.kind() == SyntaxKind::Comment =>
                {
                    continue;
                }
                _ => break,
            }
        }
        None
    }

    fn extract_kwargs(call: &SyntaxNode) -> std::collections::HashMap<String, SyntaxNode> {
        let mut map = std::collections::HashMap::new();
        for child in call.children() {
            if child.kind() == SyntaxKind::ArgumentList {
                for arg in child.children() {
                    if arg.kind() == SyntaxKind::KeywordArg {
                        if let Some(key) = Self::kwarg_key(&arg) {
                            map.insert(key, arg);
                        }
                    }
                }
            }
        }
        map
    }

    fn kwarg_key(kwarg: &SyntaxNode) -> Option<String> {
        for child in kwarg.children_with_tokens() {
            if let rowan::NodeOrToken::Token(tok) = child {
                if tok.kind() == SyntaxKind::Ident {
                    return Some(tok.text().to_string());
                }
            }
        }
        None
    }

    /// Extract a string value from a KeywordArg node.
    fn as_string(kwarg: &SyntaxNode) -> Option<String> {
        for child in kwarg.children_with_tokens() {
            if let rowan::NodeOrToken::Token(tok) = child {
                if tok.kind() == SyntaxKind::StringLit {
                    let raw = tok.text();
                    // Strip surrounding quotes.
                    return Some(raw[1..raw.len() - 1].to_string());
                }
            }
        }
        None
    }

    /// Extract a boolean value from a KeywordArg node.
    fn as_bool(kwarg: &SyntaxNode) -> Option<bool> {
        for child in kwarg.children_with_tokens() {
            if let rowan::NodeOrToken::Token(tok) = child {
                match tok.kind() {
                    SyntaxKind::TrueLit => return Some(true),
                    SyntaxKind::FalseLit => return Some(false),
                    _ => {}
                }
            }
        }
        None
    }

    /// Extract an integer value from a KeywordArg node.
    fn as_int(kwarg: &SyntaxNode) -> Option<i64> {
        for child in kwarg.children_with_tokens() {
            if let rowan::NodeOrToken::Token(tok) = child {
                if tok.kind() == SyntaxKind::IntegerLit {
                    return tok.text().parse::<i64>().ok();
                }
            }
        }
        None
    }

    /// Extract a list-of-strings from a KeywordArg whose value is a ListExpr.
    fn as_string_list(kwarg: &SyntaxNode) -> Option<Vec<String>> {
        for child in kwarg.children() {
            if child.kind() == SyntaxKind::ListExpr {
                let mut items = Vec::new();
                for tok in child.children_with_tokens() {
                    if let rowan::NodeOrToken::Token(t) = tok {
                        if t.kind() == SyntaxKind::StringLit {
                            let raw = t.text();
                            items.push(raw[1..raw.len() - 1].to_string());
                        }
                    }
                }
                return Some(items);
            }
        }
        None
    }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/// Parse a MODULE.bazel source string and return the typed `BazelModule`.
pub fn parse_module_bazel(source: &str) -> BazelModule {
    let (green, errors) = parse(source);
    let root = SyntaxNode::new_root(green);
    let mut module = BazelModule::from_cst(root);
    module.diagnostics.extend(errors);
    module
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

#[cfg(test)]
mod tests {
    use super::*;

    // -- lexer tests --

    #[test]
    fn lex_all_token_kinds() {
        let src = r#"module( name = "foo" , version = "1.0" ) # comment
bazel_dep(name = "bar", version = "2.0", dev_dependency = True)
42 False None [1, 2]
"#;
        let tokens = lex(src);
        let kinds: Vec<SyntaxKind> = tokens.iter().map(|t| t.kind).collect();

        assert!(kinds.contains(&SyntaxKind::Ident));
        assert!(kinds.contains(&SyntaxKind::LParen));
        assert!(kinds.contains(&SyntaxKind::RParen));
        assert!(kinds.contains(&SyntaxKind::LBracket));
        assert!(kinds.contains(&SyntaxKind::RBracket));
        assert!(kinds.contains(&SyntaxKind::Comma));
        assert!(kinds.contains(&SyntaxKind::Equals));
        assert!(kinds.contains(&SyntaxKind::StringLit));
        assert!(kinds.contains(&SyntaxKind::IntegerLit));
        assert!(kinds.contains(&SyntaxKind::TrueLit));
        assert!(kinds.contains(&SyntaxKind::FalseLit));
        assert!(kinds.contains(&SyntaxKind::NoneLit));
        assert!(kinds.contains(&SyntaxKind::Comment));
        assert!(kinds.contains(&SyntaxKind::Whitespace));
        assert!(kinds.contains(&SyntaxKind::Newline));
    }

    #[test]
    fn lex_string_with_escapes() {
        let src = r#""hello \"world\"""#;
        let tokens = lex(src);
        assert_eq!(tokens.len(), 1);
        assert_eq!(tokens[0].kind, SyntaxKind::StringLit);
        assert_eq!(tokens[0].text, r#""hello \"world\"""#);
    }

    // -- parser (CST) tests --

    #[test]
    fn parse_bazel_dep() {
        let src = r#"bazel_dep(name = "foo", version = "1.0")"#;
        let (green, errors) = parse(src);
        assert!(errors.is_empty(), "unexpected errors: {errors:?}");

        let root = SyntaxNode::new_root(green);
        assert_eq!(root.kind(), SyntaxKind::Root);

        // Should have one FunctionCall child.
        let calls: Vec<_> = root
            .children()
            .filter(|n| n.kind() == SyntaxKind::FunctionCall)
            .collect();
        assert_eq!(calls.len(), 1);

        // The call should contain an ArgumentList with two KeywordArgs.
        let arg_list = calls[0]
            .children()
            .find(|n| n.kind() == SyntaxKind::ArgumentList)
            .expect("no ArgumentList");
        let kwargs: Vec<_> = arg_list
            .children()
            .filter(|n| n.kind() == SyntaxKind::KeywordArg)
            .collect();
        assert_eq!(kwargs.len(), 2);
    }

    #[test]
    fn parse_git_override() {
        let src = r#"git_override(
    module_name = "foo",
    remote = "https://github.com/foo/bar.git",
    commit = "abc123",
)"#;
        let (green, errors) = parse(src);
        assert!(errors.is_empty(), "unexpected errors: {errors:?}");

        let root = SyntaxNode::new_root(green);
        let calls: Vec<_> = root
            .children()
            .filter(|n| n.kind() == SyntaxKind::FunctionCall)
            .collect();
        assert_eq!(calls.len(), 1);

        let arg_list = calls[0]
            .children()
            .find(|n| n.kind() == SyntaxKind::ArgumentList)
            .expect("no ArgumentList");
        let kwargs: Vec<_> = arg_list
            .children()
            .filter(|n| n.kind() == SyntaxKind::KeywordArg)
            .collect();
        assert_eq!(kwargs.len(), 3);
    }

    #[test]
    fn parse_module_call() {
        let src = r#"module(name = "my_project", version = "1.0.0")"#;
        let (green, errors) = parse(src);
        assert!(errors.is_empty(), "unexpected errors: {errors:?}");

        let root = SyntaxNode::new_root(green);
        let calls: Vec<_> = root
            .children()
            .filter(|n| n.kind() == SyntaxKind::FunctionCall)
            .collect();
        assert_eq!(calls.len(), 1);
    }

    #[test]
    fn parse_list_expression() {
        let src = r#"archive_override(
    module_name = "foo",
    urls = ["https://a.com/a.tar.gz", "https://b.com/b.tar.gz"],
)"#;
        let (green, errors) = parse(src);
        assert!(errors.is_empty(), "unexpected errors: {errors:?}");

        let root = SyntaxNode::new_root(green);
        // Find the ListExpr somewhere in the tree.
        fn find_list(node: &SyntaxNode) -> Option<SyntaxNode> {
            if node.kind() == SyntaxKind::ListExpr {
                return Some(node.clone());
            }
            for child in node.children() {
                if let Some(found) = find_list(&child) {
                    return Some(found);
                }
            }
            None
        }
        let list_node = find_list(&root).expect("no ListExpr found");
        // The list should contain two StringLit tokens.
        let strings: Vec<_> = list_node
            .children_with_tokens()
            .filter_map(|c| match c {
                rowan::NodeOrToken::Token(t) if t.kind() == SyntaxKind::StringLit => {
                    Some(t.text().to_string())
                }
                _ => None,
            })
            .collect();
        assert_eq!(strings.len(), 2);
    }

    // -- HIR tests --

    #[test]
    fn hir_extract_bazel_dep() {
        let src = r#"bazel_dep(name = "rules_go", version = "0.41.0", dev_dependency = True)"#;
        let module = parse_module_bazel(src);
        assert!(module.diagnostics.is_empty(), "{:?}", module.diagnostics);
        assert_eq!(module.deps.len(), 1);
        assert_eq!(module.deps[0].name, "rules_go");
        assert_eq!(module.deps[0].version, "0.41.0");
        assert!(module.deps[0].dev_dependency);
    }

    #[test]
    fn hir_extract_git_override() {
        let src = r#"git_override(
    module_name = "rules_go",
    remote = "https://github.com/bazelbuild/rules_go.git",
    commit = "deadbeef",
)"#;
        let module = parse_module_bazel(src);
        assert!(module.diagnostics.is_empty(), "{:?}", module.diagnostics);
        assert_eq!(module.overrides.len(), 1);
        match &module.overrides[0] {
            Override::Git {
                module_name,
                remote,
                commit,
            } => {
                assert_eq!(module_name, "rules_go");
                assert_eq!(remote, "https://github.com/bazelbuild/rules_go.git");
                assert_eq!(commit, "deadbeef");
            }
            other => panic!("expected Git override, got {other:?}"),
        }
    }

    // -- error recovery --

    #[test]
    fn error_recovery_load_statement() {
        let src = r#"load("@rules_go//go:defs.bzl", "go_library")
bazel_dep(name = "foo", version = "1.0")
"#;
        let module = parse_module_bazel(src);

        // The load() should produce an error diagnostic.
        assert!(
            !module.diagnostics.is_empty(),
            "expected at least one diagnostic for load()"
        );

        // But the subsequent bazel_dep should still be parsed.
        assert_eq!(module.deps.len(), 1);
        assert_eq!(module.deps[0].name, "foo");

        // CST should contain an Error node.
        let (green, _) = parse(src);
        let root = SyntaxNode::new_root(green);
        let has_error = root.children().any(|n| n.kind() == SyntaxKind::Error);
        assert!(has_error, "expected Error node in CST for load()");
    }

    // -- realistic MODULE.bazel --

    #[test]
    fn parse_realistic_module_bazel() {
        let src = r#"# MODULE.bazel for a realistic Bazel project
module(
    name = "my_project",
    version = "2.1.0",
    compatibility_level = 1,
)

bazel_dep(name = "rules_go", version = "0.41.0")
bazel_dep(name = "rules_rust", version = "0.30.0")
bazel_dep(name = "protobuf", version = "24.4", dev_dependency = True)
bazel_dep(name = "gazelle", version = "0.34.0")

git_override(
    module_name = "rules_go",
    remote = "https://github.com/bazelbuild/rules_go.git",
    commit = "abc123def456",
)

archive_override(
    module_name = "protobuf",
    urls = ["https://github.com/protocolbuffers/protobuf/archive/v24.4.tar.gz"],
)

local_path_override(
    module_name = "my_local_lib",
    path = "../my_local_lib",
)
"#;
        let module = parse_module_bazel(src);
        assert!(
            module.diagnostics.is_empty(),
            "unexpected diagnostics: {:?}",
            module.diagnostics
        );

        // module() metadata
        assert_eq!(module.name.as_deref(), Some("my_project"));
        assert_eq!(module.version.as_deref(), Some("2.1.0"));
        assert_eq!(module.compatibility_level, Some(1));

        // deps
        assert_eq!(module.deps.len(), 4);
        assert_eq!(module.deps[0].name, "rules_go");
        assert!(!module.deps[0].dev_dependency);
        assert_eq!(module.deps[2].name, "protobuf");
        assert!(module.deps[2].dev_dependency);

        // overrides
        assert_eq!(module.overrides.len(), 3);
        assert!(matches!(&module.overrides[0], Override::Git { .. }));
        assert!(
            matches!(&module.overrides[1], Override::Archive { module_name, urls }
            if module_name == "protobuf" && urls.len() == 1)
        );
        assert!(
            matches!(&module.overrides[2], Override::LocalPath { module_name, path }
            if module_name == "my_local_lib" && path == "../my_local_lib")
        );
    }

    // -- error recovery: variable assignment --

    #[test]
    fn error_recovery_variable_assignment() {
        let src = r#"_SOME_VAR = "hello"
module(name = "test", version = "0.1.0")
"#;
        let module = parse_module_bazel(src);

        // The assignment should produce a diagnostic.
        assert!(
            module
                .diagnostics
                .iter()
                .any(|d| d.contains("variable assignment")),
            "expected variable assignment diagnostic, got: {:?}",
            module.diagnostics
        );

        // The module call should still be extracted.
        assert_eq!(module.name.as_deref(), Some("test"));
    }
}
