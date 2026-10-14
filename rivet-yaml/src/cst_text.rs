//! Text of CST scalars: plain-scalar continuation folding, quoted-scalar
//! unescaping and line folding, and block-scalar folding and chomping.
//!
//! Moved from rivet-core's yaml_hir (REQ-346 S3) so rivet-yaml's own
//! deserializer and the artifact extractor read scalars with the same code.
//! The behaviour, and the PyYAML-derived expectations in yaml_hir's tests,
//! are unchanged (REQ-361, REQ-363, REQ-364).

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

use crate::cst::{SyntaxKind, SyntaxNode};

fn child_of_kind(node: &SyntaxNode, kind: SyntaxKind) -> Option<SyntaxNode> {
    node.children().find(|c| c.kind() == kind)
}

/// Get the text of the first scalar token descended from `node`.
pub fn scalar_text(node: &SyntaxNode) -> Option<String> {
    for token in node.descendants_with_tokens() {
        if let rowan::NodeOrToken::Token(t) = token {
            let k = t.kind();
            match k {
                SyntaxKind::SingleQuotedScalar | SyntaxKind::DoubleQuotedScalar => {
                    return Some(unquote_scalar(k, t.text()));
                }
                SyntaxKind::PlainScalar => {
                    // The lexer splits plain scalars at commas and brackets.
                    // Collect all sibling tokens to reconstruct the full value.
                    //
                    // A Newline INSIDE this node is a plain-scalar continuation
                    // (REQ-363): the CST keeps a multi-line plain scalar's later
                    // lines in the same Value node, while a single-line value's
                    // line break sits outside it, between MappingEntry siblings.
                    // This used to `break` on any Newline, which truncated every
                    // multi-line plain scalar to its first line — DD-039's
                    // `alternatives:` read as "…Rejected because it". YAML folds
                    // the break: one line break becomes a space, and each blank
                    // line in between contributes a `\n` instead.
                    let mut text = t.text().to_string();
                    let mut next = t.next_sibling_or_token();
                    while let Some(sibling) = next {
                        match sibling {
                            rowan::NodeOrToken::Token(ref st) => match st.kind() {
                                SyntaxKind::Comment => break,
                                SyntaxKind::Newline => {
                                    let mut breaks = 0usize;
                                    let mut resume = None;
                                    let mut look = Some(sibling.clone());
                                    while let Some(el) = look {
                                        match &el {
                                            rowan::NodeOrToken::Token(lt)
                                                if lt.kind() == SyntaxKind::Newline =>
                                            {
                                                breaks += 1;
                                            }
                                            rowan::NodeOrToken::Token(lt)
                                                if lt.kind() == SyntaxKind::Whitespace => {}
                                            // Resume at the next token. A comment
                                            // needs no guard here: resuming at one
                                            // reaches the `Comment => break` arm
                                            // above at once, and the separator just
                                            // pushed is trimmed on return. The guard
                                            // this used to carry was equivalent —
                                            // cargo-mutants could not kill it (#970).
                                            rowan::NodeOrToken::Token(_) => {
                                                resume = Some(el.clone());
                                                break;
                                            }
                                            // A child node ends the scalar.
                                            rowan::NodeOrToken::Node(_) => break,
                                        }
                                        look = el.next_sibling_or_token();
                                    }
                                    // Nothing but trailing breaks before the node
                                    // ends: this was the scalar's last line.
                                    let Some(resume) = resume else { break };
                                    text.truncate(text.trim_end().len());
                                    if breaks == 1 {
                                        text.push(' ');
                                    } else {
                                        text.extend(std::iter::repeat_n('\n', breaks - 1));
                                    }
                                    next = Some(resume);
                                }
                                _ => {
                                    text.push_str(st.text());
                                    next = sibling.next_sibling_or_token();
                                }
                            },
                            rowan::NodeOrToken::Node(_) => break,
                        }
                    }
                    let trimmed = text.trim_end().to_string();
                    return Some(trimmed);
                }
                _ => {}
            }
        }
    }
    None
}

/// Strip quotes from a scalar token.
pub fn unquote_scalar(kind: SyntaxKind, raw: &str) -> String {
    match kind {
        SyntaxKind::SingleQuotedScalar => unquote_single_quoted(&raw[1..raw.len() - 1]),
        SyntaxKind::DoubleQuotedScalar => unescape_double_quoted(&raw[1..raw.len() - 1]),
        _ => raw.to_string(),
    }
}

/// Fold the line break the caller has just consumed inside a quoted scalar
/// (YAML 1.2 §7.3.1 and §7.3.2 flow line folding, REQ-364).
///
/// A quoted scalar may span lines, and its line breaks are not content. White
/// space before an unescaped break is dropped (but not white space produced by
/// an escape, which ends before `protected_len`), a single break becomes one
/// space, each following empty line becomes one `\n`, and indentation on the
/// next line is dropped. An escaped break (`\` at the end of a line in a
/// double-quoted scalar) joins the lines with nothing, but still keeps its
/// empty lines. PyYAML reads `"alpha\` break `\n  gamma"` as `alphagamma` and
/// `"alpha\` break, empty line, `  gamma"` as `alpha\ngamma`.
fn fold_flow_break(
    first: char,
    chars: &mut std::iter::Peekable<std::str::Chars<'_>>,
    result: &mut String,
    protected_len: usize,
    escaped: bool,
) {
    if first == '\r' && chars.peek() == Some(&'\n') {
        chars.next();
    }
    if !escaped {
        while result.len() > protected_len && result.ends_with([' ', '\t']) {
            result.pop();
        }
    }
    let mut empty_lines = 0usize;
    loop {
        while matches!(chars.peek(), Some(' ' | '\t')) {
            chars.next();
        }
        match chars.peek() {
            Some('\r') => {
                chars.next();
                if chars.peek() == Some(&'\n') {
                    chars.next();
                }
                empty_lines += 1;
            }
            Some('\n') => {
                chars.next();
                empty_lines += 1;
            }
            _ => break,
        }
    }
    if empty_lines > 0 {
        result.extend(std::iter::repeat_n('\n', empty_lines));
    } else if !escaped {
        result.push(' ');
    }
}

/// Decode a single-quoted scalar's content: `''` is one quote, and line
/// breaks fold (REQ-364).
pub fn unquote_single_quoted(inner: &str) -> String {
    let mut result = String::with_capacity(inner.len());
    let mut chars = inner.chars().peekable();
    while let Some(c) = chars.next() {
        match c {
            '\'' if chars.peek() == Some(&'\'') => {
                chars.next();
                result.push('\'');
            }
            '\n' | '\r' => fold_flow_break(c, &mut chars, &mut result, 0, false),
            _ => result.push(c),
        }
    }
    result
}

/// Process YAML double-quoted escape sequences, folding line breaks (REQ-364).
///
/// Handles: `\\`, `\"`, `\n`, `\t`, `\r`, `\/`, `\0`, and `\uXXXX`.
pub fn unescape_double_quoted(s: &str) -> String {
    let mut result = String::with_capacity(s.len());
    let mut chars = s.chars().peekable();
    // Everything before this length came from an escape and is content even
    // if it is white space; folding must not trim it.
    let mut protected_len = 0usize;
    // Set when the previous iteration decoded an escape. Applied at the top of
    // the next iteration because several escape arms leave via `continue`.
    let mut after_escape = false;
    while let Some(c) = chars.next() {
        if after_escape {
            protected_len = result.len();
            after_escape = false;
        }
        if c == '\n' || c == '\r' {
            fold_flow_break(c, &mut chars, &mut result, protected_len, false);
            continue;
        }
        if c == '\\' {
            if let Some(&brk @ ('\n' | '\r')) = chars.peek() {
                chars.next();
                fold_flow_break(brk, &mut chars, &mut result, protected_len, true);
                continue;
            }
            after_escape = true;
            match chars.next() {
                Some('\\') => result.push('\\'),
                Some('"') => result.push('"'),
                Some('n') => result.push('\n'),
                Some('t') => result.push('\t'),
                // `\` followed by a literal tab is a tab (YAML 1.2 `ns-esc-tab`).
                Some('\t') => result.push('\t'),
                Some('r') => result.push('\r'),
                Some('/') => result.push('/'),
                Some('0') => result.push('\0'),
                Some('a') => result.push('\u{07}'), // bell
                Some('b') => result.push('\u{08}'), // backspace
                Some('e') => result.push('\u{1B}'), // escape
                Some('v') => result.push('\u{0B}'), // vertical tab
                Some(' ') => result.push(' '),
                Some('N') => result.push('\u{85}'),   // next line
                Some('_') => result.push('\u{A0}'),   // non-breaking space
                Some('L') => result.push('\u{2028}'), // line separator
                Some('P') => result.push('\u{2029}'), // paragraph separator
                Some('x') => {
                    // \xXX — 2-digit hex
                    let hex: String = chars.by_ref().take(2).collect();
                    if hex.len() == 2 {
                        if let Ok(cp) = u32::from_str_radix(&hex, 16) {
                            if let Some(ch) = char::from_u32(cp) {
                                result.push(ch);
                                continue;
                            }
                        }
                    }
                    // Malformed — emit literally
                    result.push('\\');
                    result.push('x');
                    result.push_str(&hex);
                }
                Some('u') => {
                    // \uXXXX — 4-digit hex
                    let hex: String = chars.by_ref().take(4).collect();
                    if hex.len() == 4 {
                        if let Ok(cp) = u32::from_str_radix(&hex, 16) {
                            if let Some(ch) = char::from_u32(cp) {
                                result.push(ch);
                                continue;
                            }
                        }
                    }
                    // Malformed — emit literally
                    result.push('\\');
                    result.push('u');
                    result.push_str(&hex);
                }
                Some('U') => {
                    // \UXXXXXXXX — 8-digit hex
                    let hex: String = chars.by_ref().take(8).collect();
                    if hex.len() == 8 {
                        if let Ok(cp) = u32::from_str_radix(&hex, 16) {
                            if let Some(ch) = char::from_u32(cp) {
                                result.push(ch);
                                continue;
                            }
                        }
                    }
                    // Malformed — emit literally
                    result.push('\\');
                    result.push('U');
                    result.push_str(&hex);
                }
                Some(other) => {
                    // Unknown escape — preserve literally
                    result.push('\\');
                    result.push(other);
                }
                None => {
                    // Trailing backslash — preserve literally
                    result.push('\\');
                }
            }
        } else {
            result.push(c);
        }
    }
    result
}

/// Extract block-scalar text from a Value node, applying YAML's `|` / `>`
/// semantics and the `-` / `+` chomping indicators.
///
/// This used to join body lines with `\n` whether the header was `|` or `>`,
/// and always clip to one trailing newline. `>` was therefore read as `|`, and
/// `-`/`+` were ignored. Live on the production read path: `safety/stpa` loads
/// through here, and 148 of 154 STPA descriptions disagreed with PyYAML
/// (`...Rivet\nvalidation...` where folding yields `...Rivet validation...`).
/// The on-disk source was never touched — `yaml_edit` preserves the block
/// byte-for-byte — so correcting the reader corrects the store.
///
/// The folding rule is a port of PyYAML's `scan_block_scalar` rather than a
/// fresh reading of the spec, because the subtle cases (blank lines inside a
/// folded scalar, more-indented lines, `+` keeping trailing blank lines) are
/// exactly where a hand-derived rule goes wrong. Every expectation in the
/// `folded_scalar_*` / `literal_scalar_*` tests is PyYAML's output.
pub fn block_scalar_text(value_node: &SyntaxNode) -> Option<String> {
    let block = child_of_kind(value_node, SyntaxKind::BlockScalar)?;

    // Recover the raw source text. The token-stream approach
    // (iterating `BlockScalarLine` tokens) is broken for any block
    // scalar whose content contains YAML flow-syntax characters (`,`,
    // `]`, `}`, `:` followed by space) — `lex_plain_scalar` at
    // `yaml_cst.rs:401` breaks scalars at those characters, producing
    // many sub-line tokens per source line. Reconstructing from the
    // token stream then splits "config loading, schema merging," into
    // separate "lines" because each comma-terminated clause is its own
    // token, and the whitespace-only tokens between them become `\n`s.
    //
    // The raw node text covers `|\n      <line1>\n      <line2>...`
    // exactly as written. We strip the header (`|`, optional chomp
    // indicator, optional comment, trailing newline) and dedent by the
    // common leading-whitespace prefix.
    let raw = block.text().to_string();
    let mut iter = raw.lines();
    let header = iter.next()?.trim_start(); // `|` or `>` line, plus any chomp / comment
    let folded = match header.chars().next() {
        Some('|') => false,
        Some('>') => true,
        _ => return None,
    };
    // Indicators follow the style character in either order (`|-2`, `|2-`),
    // up to whitespace or a comment. Only chomping changes the value here; an
    // explicit indentation digit is accepted and ignored because content
    // indent is recovered from the body below.
    let chomp = header
        .chars()
        .skip(1)
        .take_while(|c| !c.is_whitespace() && *c != '#')
        .fold(Chomp::Clip, |acc, c| match c {
            '-' => Chomp::Strip,
            '+' => Chomp::Keep,
            _ => acc,
        });

    let body_lines: Vec<&str> = iter.collect();
    if body_lines.is_empty() {
        return Some(String::new());
    }

    // Content indentation as the CST measured it (REQ-346): the explicit
    // indicator over the enclosing collection's column, else the first content
    // line's spaces. Only spaces indent, so a tab after them is content.
    let body_start = raw.find('\n').map_or(raw.len(), |i| i + 1);
    let indent =
        crate::cst::block_scalar_indent(raw.as_bytes(), 0, body_start, enclosing_column(&block));

    // Dedent by exactly `indent` spaces. A line of only spaces is empty unless
    // it is longer than the indentation, when the excess is content.
    let dedented: Vec<&str> = body_lines
        .iter()
        .map(|line| {
            let line = line.strip_suffix('\r').unwrap_or(line);
            let spaces = line.len() - line.trim_start_matches(' ').len();
            if spaces >= indent {
                line.get(indent..).unwrap_or("")
            } else if line.trim_start_matches(' ').is_empty() {
                ""
            } else {
                // Less indented than the content: the CST ends the scalar
                // before such a line, so this is only reached on odd input.
                line.trim_start_matches(' ')
            }
        })
        .collect();

    Some(fold_and_chomp(&dedented, folded, chomp))
}

/// The column of the collection a block scalar belongs to: the mapping
/// entry's or sequence item's first token. Found by walking back to the line
/// start token by token, not by slicing the source, which would be quadratic.
fn enclosing_column(block: &SyntaxNode) -> usize {
    let owner = block.ancestors().find(|n| {
        matches!(
            n.kind(),
            SyntaxKind::MappingEntry | SyntaxKind::SequenceItem
        )
    });
    let Some(first) = owner.and_then(|n| n.first_token()) else {
        return 0;
    };
    let mut column = 0usize;
    let mut token = first.prev_token();
    while let Some(t) = token {
        // The line break may be a `Newline` or the last `BlockScalarLine` of a
        // block scalar just above, so look for the break in the text itself.
        if let Some(i) = t.text().rfind('\n') {
            column = column.saturating_add(t.text().len().saturating_sub(i + 1));
            break;
        }
        column = column.saturating_add(t.text().len());
        token = t.prev_token();
    }
    column
}

/// YAML block-scalar chomping indicator.
#[derive(Clone, Copy)]
enum Chomp {
    /// No indicator: keep exactly one final line break.
    Clip,
    /// `-`: remove the final line break and trailing blank lines.
    Strip,
    /// `+`: keep the final line break and every trailing blank line.
    Keep,
}

/// Join dedented block-scalar lines, folding when `folded`, then apply `chomp`.
///
/// A port of the loop in PyYAML's `Scanner.scan_block_scalar`. Between two
/// content lines the break is:
///
/// * a single space — when folding, when neither line is more-indented (starts
///   with a space or tab after dedent), and when no blank line separates them;
/// * nothing — in that same folding case when blank lines DO separate them,
///   because each blank line contributes its own `\n` instead;
/// * `\n` — in every other case, including all of `|`.
fn fold_and_chomp(lines: &[&str], folded: bool, chomp: Chomp) -> String {
    let more_indented = |l: &str| l.starts_with([' ', '\t']);

    let mut out = String::new();
    let mut idx = 0;
    let mut breaks = 0usize;
    // Leading blank lines are preserved as line breaks.
    while idx < lines.len() && lines[idx].is_empty() {
        breaks += 1;
        idx += 1;
    }

    let mut saw_content = false;
    while idx < lines.len() {
        out.extend(std::iter::repeat_n('\n', breaks));
        let line = lines[idx];
        out.push_str(line);
        saw_content = true;
        idx += 1;

        breaks = 0;
        while idx < lines.len() && lines[idx].is_empty() {
            breaks += 1;
            idx += 1;
        }
        let Some(next) = lines.get(idx) else {
            break; // `breaks` now counts the trailing blank lines
        };
        if folded && !more_indented(line) && !more_indented(next) {
            if breaks == 0 {
                out.push(' ');
            }
        } else {
            out.push('\n');
        }
    }

    if !saw_content {
        return match chomp {
            Chomp::Keep => "\n".repeat(breaks),
            Chomp::Clip | Chomp::Strip => String::new(),
        };
    }
    match chomp {
        Chomp::Strip => {}
        Chomp::Clip => out.push('\n'),
        Chomp::Keep => {
            out.push('\n');
            out.extend(std::iter::repeat_n('\n', breaks));
        }
    }
    out
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::cst::{SyntaxNode, parse};

    /// The block scalar under `key` in `src`, read as text.
    fn block(src: &str) -> String {
        let (green, errors) = parse(src);
        assert!(errors.is_empty(), "{errors:?}");
        let root = SyntaxNode::new_root(green);
        let holder = root
            .descendants()
            .find(|n| {
                matches!(n.kind(), SyntaxKind::Value | SyntaxKind::SequenceItem)
                    && n.children().any(|c| c.kind() == SyntaxKind::BlockScalar)
            })
            .expect("a block scalar");
        block_scalar_text(&holder).expect("block text")
    }

    #[test]
    fn double_quoted_escapes_and_folding() {
        assert_eq!(unescape_double_quoted("a\\tb\\nc"), "a\tb\nc");
        assert_eq!(
            unescape_double_quoted("tab\\\tx"),
            "tab\tx",
            "`\\` + literal tab"
        );
        assert_eq!(unescape_double_quoted("\\x41\\u00e9\\U0001F600"), "Aé😀");
        assert_eq!(unescape_double_quoted("one\n  two"), "one two");
        assert_eq!(unescape_double_quoted("one\n\n  two"), "one\ntwo");
        assert_eq!(unquote_single_quoted("it''s\n  here"), "it's here");
        assert_eq!(
            unquote_scalar(SyntaxKind::SingleQuotedScalar, "'a''b'"),
            "a'b"
        );
    }

    #[test]
    fn block_scalars_follow_the_indentation_rules() {
        assert_eq!(block("k: |\n  a\n  b\n"), "a\nb\n");
        assert_eq!(block("k: >-\n  a\n  b\n"), "a b");
        assert_eq!(block("k: |+\n  a\n\n"), "a\n\n");
        // An explicit indicator counts from the key's column.
        assert_eq!(block("k: |1\n  a\n"), " a\n");
        assert_eq!(block("- |1\n  a\n"), " a\n");
        // A tab after the indentation is content.
        assert_eq!(block("k: |-\n \tbar\n"), "\tbar");
        // Spaces past the indentation on an otherwise blank line are content.
        assert_eq!(block("k: |\n  x\n   \n"), "x\n \n");
        // A less-indented comment line ends the scalar.
        assert_eq!(block("a: |-\n  # text\n # Clip\nb: 1\n"), "# text");
    }
}
