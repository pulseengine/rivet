//! rivet's own YAML emitter (REQ-346 S5).
//!
//! Writes a [`Value`] the way serde_yaml 0.9.34 wrote it through libyaml with
//! serde_yaml's settings (Unicode on, unlimited width, two-space indent), so
//! files rivet writes do not change when the emitter does. The scalar-style
//! decision is a port of libyaml's `yaml_emitter_analyze_scalar` and
//! `yaml_emitter_select_scalar_style`, fed serde_yaml's style hint; the
//! writers follow libyaml's plain, single-quoted, double-quoted and literal
//! writers.

use std::fmt::Write as _;

use crate::Value;
use crate::de::visit_hint;
use crate::value::Tag;

/// libyaml treats a key longer than this as complex (`? key`).
const SIMPLE_KEY_MAX: usize = 128;

/// Emit `value` as a YAML document, as serde_yaml's `to_string` did.
pub(crate) fn emit(value: &Value) -> String {
    let mut out = String::new();
    let mut e = Emitter { out: &mut out };
    e.node(value, 0, Ctx::Root);
    if !out.ends_with('\n') {
        out.push('\n');
    }
    out
}

/// Where a node is being written, which decides how it starts.
#[derive(Clone, Copy, PartialEq, Eq)]
enum Ctx {
    /// The document root.
    Root,
    /// After `key:` in a block mapping.
    MapValue,
    /// After `- ` in a block sequence.
    SeqItem,
    /// After `? ` (a complex key).
    ComplexKey,
}

struct Emitter<'a> {
    out: &'a mut String,
}

impl Emitter<'_> {
    /// Start a new line unless the last write (a literal block) already
    /// ended one, as libyaml's `write_indent` does.
    fn newline(&mut self) {
        if !self.out.ends_with('\n') {
            self.out.push('\n');
        }
    }

    fn indent(&mut self, n: usize) {
        self.out.extend(std::iter::repeat_n(' ', n));
    }

    /// Write `value`. `indent` is the column a block collection's lines start at.
    fn node(&mut self, value: &Value, indent: usize, ctx: Ctx) {
        match value {
            Value::Mapping(m) if !m.is_empty() => {
                match ctx {
                    Ctx::MapValue => {
                        self.newline();
                        self.indent(indent);
                    }
                    Ctx::Root | Ctx::SeqItem | Ctx::ComplexKey => {}
                }
                let mut first = true;
                for (k, v) in m {
                    if !first {
                        self.newline();
                        self.indent(indent);
                    }
                    first = false;
                    self.entry(k, v, indent);
                }
            }
            Value::Sequence(s) if !s.is_empty() => {
                // A sequence under a mapping key is not indented (libyaml's
                // indentless sequence); one inside a sequence item continues
                // on the item's line.
                match ctx {
                    Ctx::MapValue => {
                        self.newline();
                        self.indent(indent.saturating_sub(2));
                    }
                    Ctx::Root | Ctx::SeqItem | Ctx::ComplexKey => {}
                }
                let item_col = match ctx {
                    Ctx::MapValue => indent.saturating_sub(2),
                    Ctx::Root | Ctx::SeqItem | Ctx::ComplexKey => indent,
                };
                let mut first = true;
                for item in s {
                    if !first {
                        self.newline();
                        self.indent(item_col);
                    }
                    first = false;
                    self.out.push_str("- ");
                    self.node(item, item_col.saturating_add(2), Ctx::SeqItem);
                }
            }
            Value::Mapping(_) => self.after_indicator(ctx, "{}"),
            Value::Sequence(_) => self.after_indicator(ctx, "[]"),
            Value::Tagged(tagged) => {
                self.after_indicator(ctx, &tag_text(&tagged.tag));
                match &tagged.value {
                    Value::Mapping(m) if !m.is_empty() => {
                        self.newline();
                        self.indent(indent);
                        self.node(&tagged.value, indent, Ctx::Root);
                    }
                    Value::Sequence(s) if !s.is_empty() => {
                        self.newline();
                        self.indent(indent);
                        self.node(&tagged.value, indent, Ctx::Root);
                    }
                    Value::Null
                    | Value::Bool(_)
                    | Value::Number(_)
                    | Value::String(_)
                    | Value::Sequence(_)
                    | Value::Mapping(_)
                    | Value::Tagged(_) => {
                        self.out.push(' ');
                        self.node(&tagged.value, indent, Ctx::SeqItem);
                    }
                }
            }
            Value::Null => self.after_indicator(ctx, "null"),
            Value::Bool(b) => self.after_indicator(ctx, if *b { "true" } else { "false" }),
            Value::Number(n) => {
                let text = n.to_string();
                self.after_indicator(ctx, &text);
            }
            Value::String(s) => self.string(s, indent, ctx, false),
        }
    }

    /// A one-line scalar or flow token after its indicator.
    fn after_indicator(&mut self, ctx: Ctx, text: &str) {
        if ctx == Ctx::MapValue {
            self.out.push(' ');
        }
        self.out.push_str(text);
    }

    fn entry(&mut self, key: &Value, value: &Value, indent: usize) {
        if is_simple_key(key) {
            match key {
                Value::String(s) => self.string(s, indent, Ctx::Root, true),
                Value::Null
                | Value::Bool(_)
                | Value::Number(_)
                | Value::Sequence(_)
                | Value::Mapping(_)
                | Value::Tagged(_) => self.node(key, indent, Ctx::Root),
            }
            self.out.push(':');
            self.node(value, indent.saturating_add(2), Ctx::MapValue);
        } else {
            self.out.push_str("? ");
            self.node(key, indent.saturating_add(2), Ctx::ComplexKey);
            self.newline();
            self.indent(indent);
            self.out.push(':');
            self.node(value, indent.saturating_add(2), Ctx::MapValue);
        }
    }

    /// Write a string scalar in the style libyaml would choose.
    fn string(&mut self, s: &str, indent: usize, ctx: Ctx, simple_key: bool) {
        let a = analyze(s);
        let mut style = if s.contains('\n') {
            Style::Literal
        } else if visit_hint(s) {
            Style::SingleQuoted
        } else {
            Style::Plain
        };
        if simple_key && a.multiline {
            style = Style::DoubleQuoted;
        }
        if style == Style::Plain && (!a.block_plain_allowed || (s.is_empty() && simple_key)) {
            style = Style::SingleQuoted;
        }
        if style == Style::SingleQuoted && !a.single_quoted_allowed {
            style = Style::DoubleQuoted;
        }
        if style == Style::Literal && (!a.block_allowed || simple_key) {
            style = Style::DoubleQuoted;
        }
        if ctx == Ctx::MapValue {
            self.out.push(' ');
        }
        match style {
            Style::Plain => self.out.push_str(s),
            Style::SingleQuoted => {
                let block_indent = match ctx {
                    Ctx::Root => 2,
                    Ctx::MapValue | Ctx::SeqItem | Ctx::ComplexKey => indent,
                };
                write_single_quoted(self.out, s, block_indent);
            }
            Style::DoubleQuoted => write_double_quoted(self.out, s),
            Style::Literal => {
                let block_indent = match ctx {
                    Ctx::Root => 2,
                    Ctx::MapValue | Ctx::SeqItem | Ctx::ComplexKey => indent,
                };
                write_literal(self.out, s, block_indent);
            }
        }
    }
}

fn tag_text(tag: &Tag) -> String {
    let t = tag.to_string();
    if t.starts_with('!') {
        t
    } else {
        format!("!{t}")
    }
}

/// Whether libyaml writes `key` as `key:` rather than `? key`.
fn is_simple_key(key: &Value) -> bool {
    match key {
        Value::String(s) => s.len() <= SIMPLE_KEY_MAX && !analyze(s).multiline,
        Value::Null | Value::Bool(_) | Value::Number(_) => true,
        Value::Sequence(s) => s.is_empty(),
        Value::Mapping(m) => m.is_empty(),
        Value::Tagged(_) => false,
    }
}

#[derive(Clone, Copy, PartialEq, Eq)]
enum Style {
    Plain,
    SingleQuoted,
    DoubleQuoted,
    Literal,
}

/// libyaml's `scalar_data` flags for a block-context scalar.
struct Analysis {
    multiline: bool,
    block_plain_allowed: bool,
    single_quoted_allowed: bool,
    block_allowed: bool,
}

fn is_break(c: char) -> bool {
    matches!(c, '\r' | '\n' | '\u{85}' | '\u{2028}' | '\u{2029}')
}

fn is_blankz(c: Option<char>) -> bool {
    match c {
        None => true,
        Some(c) => c == ' ' || c == '\t' || is_break(c),
    }
}

/// libyaml's `IS_PRINTABLE`.
fn is_printable(c: char) -> bool {
    matches!(u32::from(c),
        0x0A | 0x20..=0x7E | 0xA0..=0xD7FF | 0xE000..=0xFFFD | 0x10000..=0x10FFFF)
        && c != '\u{FEFF}'
}

/// A port of libyaml's `yaml_emitter_analyze_scalar` (block context only;
/// rivet never emits flow collections with content).
fn analyze(s: &str) -> Analysis {
    if s.is_empty() {
        return Analysis {
            multiline: false,
            block_plain_allowed: true,
            single_quoted_allowed: true,
            block_allowed: false,
        };
    }
    let mut block_indicators = s.starts_with("---") || s.starts_with("...");
    let (mut line_breaks, mut special) = (false, false);
    let (mut leading_space, mut leading_break) = (false, false);
    let (mut trailing_space, mut trailing_break) = (false, false);
    let (mut break_space, mut space_break) = (false, false);
    let (mut previous_space, mut previous_break) = (false, false);
    let chars: Vec<char> = s.chars().collect();
    let mut preceded_by_whitespace = true;
    let last = chars.len().saturating_sub(1);
    for (i, &c) in chars.iter().enumerate() {
        let followed_by_whitespace = is_blankz(chars.get(i.saturating_add(1)).copied());
        if i == 0 {
            if matches!(
                c,
                '#' | ','
                    | '['
                    | ']'
                    | '{'
                    | '}'
                    | '&'
                    | '*'
                    | '!'
                    | '|'
                    | '>'
                    | '\''
                    | '"'
                    | '%'
                    | '@'
                    | '`'
            ) {
                block_indicators = true;
            }
            if (c == '?' || c == ':') && followed_by_whitespace {
                block_indicators = true;
            }
            if c == '-' && followed_by_whitespace {
                block_indicators = true;
            }
        } else {
            if c == ':' && followed_by_whitespace {
                block_indicators = true;
            }
            if c == '#' && preceded_by_whitespace {
                block_indicators = true;
            }
        }
        if !is_printable(c) {
            special = true;
        }
        if is_break(c) {
            line_breaks = true;
        }
        if c == ' ' {
            if i == 0 {
                leading_space = true;
            }
            if i == last {
                trailing_space = true;
            }
            if previous_break {
                break_space = true;
            }
            previous_space = true;
            previous_break = false;
        } else if is_break(c) {
            if i == 0 {
                leading_break = true;
            }
            if i == last {
                trailing_break = true;
            }
            if previous_space {
                space_break = true;
            }
            previous_space = false;
            previous_break = true;
        } else {
            previous_space = false;
            previous_break = false;
        }
        preceded_by_whitespace = is_blankz(Some(c));
    }
    let mut a = Analysis {
        multiline: line_breaks,
        block_plain_allowed: true,
        single_quoted_allowed: true,
        block_allowed: true,
    };
    if leading_space || leading_break || trailing_space || trailing_break {
        a.block_plain_allowed = false;
    }
    if trailing_space {
        a.block_allowed = false;
    }
    if break_space {
        a.block_plain_allowed = false;
        a.single_quoted_allowed = false;
    }
    if space_break || special {
        a.block_plain_allowed = false;
        a.single_quoted_allowed = false;
        a.block_allowed = false;
    }
    if line_breaks || block_indicators {
        a.block_plain_allowed = false;
    }
    a
}

/// libyaml's single-quoted writer: `'` doubled; a line break (only the
/// Unicode separators reach here, since `\n` selects a literal block) is
/// written and the next line indented.
fn write_single_quoted(out: &mut String, s: &str, indent: usize) {
    out.push('\'');
    let mut after_break = false;
    for c in s.chars() {
        if is_break(c) {
            out.push(c);
            after_break = true;
            continue;
        }
        if after_break {
            out.extend(std::iter::repeat_n(' ', indent));
            after_break = false;
        }
        if c == '\'' {
            out.push_str("''");
        } else {
            out.push(c);
        }
    }
    out.push('\'');
}

/// libyaml's double-quoted writer, without line folding (unlimited width).
fn write_double_quoted(out: &mut String, s: &str) {
    out.push('"');
    for c in s.chars() {
        let escape = !is_printable(c) || c == '\u{FEFF}' || is_break(c) || c == '"' || c == '\\';
        if !escape {
            out.push(c);
            continue;
        }
        out.push('\\');
        match c {
            '\0' => out.push('0'),
            '\u{7}' => out.push('a'),
            '\u{8}' => out.push('b'),
            '\t' => out.push('t'),
            '\n' => out.push('n'),
            '\u{B}' => out.push('v'),
            '\u{C}' => out.push('f'),
            '\r' => out.push('r'),
            '\u{1B}' => out.push('e'),
            '"' => out.push('"'),
            '\\' => out.push('\\'),
            '\u{85}' => out.push('N'),
            '\u{A0}' => out.push('_'),
            '\u{2028}' => out.push('L'),
            '\u{2029}' => out.push('P'),
            other => {
                let v = u32::from(other);
                let _ = if v <= 0xFF {
                    write!(out, "x{v:02X}")
                } else if v <= 0xFFFF {
                    write!(out, "u{v:04X}")
                } else {
                    write!(out, "U{v:08X}")
                };
            }
        }
    }
    out.push('"');
}

/// libyaml's literal (`|`) writer with its indentation and chomping hints.
fn write_literal(out: &mut String, s: &str, indent: usize) {
    out.push('|');
    if s.starts_with(' ') || s.starts_with(is_break) {
        // libyaml writes best_indent (2) as the indentation indicator.
        out.push('2');
    }
    let mut chars = s.chars().rev();
    match chars.next() {
        None => out.push('-'),
        Some(last) if !is_break(last) => out.push('-'),
        Some(_) => match chars.next() {
            None => out.push('+'),
            Some(prev) if is_break(prev) => out.push('+'),
            Some(_) => {}
        },
    }
    out.push('\n');
    let mut at_line_start = true;
    for c in s.chars() {
        if is_break(c) {
            out.push('\n');
            at_line_start = true;
        } else {
            if at_line_start {
                out.extend(std::iter::repeat_n(' ', indent));
                at_line_start = false;
            }
            out.push(c);
        }
    }
}

#[cfg(test)]
#[allow(
    clippy::unwrap_used,
    reason = "test code: a failure should panic with a clear message"
)]
mod tests {
    use crate::{Mapping, Value, to_string};

    fn s(text: &str) -> String {
        to_string(&Value::from(text)).unwrap()
    }

    /// Expected text is serde_yaml's, from `tests/golden/emitter_strings.txt`.
    // rivet: verifies REQ-346
    #[test]
    fn scalar_styles_follow_libyaml() {
        assert_eq!(s("a b"), "a b\n");
        assert_eq!(s("1"), "'1'\n", "would read back as a number");
        assert_eq!(s("true"), "'true'\n");
        assert_eq!(s(""), "''\n");
        assert_eq!(s("- x"), "'- x'\n", "a block indicator");
        assert_eq!(s("a: b"), "'a: b'\n");
        assert_eq!(s("it's"), "it's\n");
        assert_eq!(s("tab\there"), "\"tab\\there\"\n", "not printable: escaped");
        assert_eq!(s("ls\u{2028}x"), "'ls\u{2028}  x'\n");
        assert_eq!(s("line\n"), "|\n  line\n");
        assert_eq!(s("line\n\n"), "|+\n  line\n\n");
        assert_eq!(s("a\nb"), "|-\n  a\n  b\n");
        assert_eq!(s(" lead\nx"), "|2-\n   lead\n  x\n");
        assert_eq!(
            s("trail \nx"),
            "\"trail \\nx\"\n",
            "trailing space forbids a block"
        );
    }

    // rivet: verifies REQ-346
    #[test]
    fn block_layout_matches_serde_yaml() {
        let v: Value = crate::from_str(
            "a:\n  b: 1\nc:\n- x\n- y\nd: {}\ne: []\nf:\n- k: 1\n  j: 2\n- - p\n  - q\ng: |-\n  l1\n  l2\n",
        )
        .unwrap();
        assert_eq!(
            to_string(&v).unwrap(),
            "a:\n  b: 1\nc:\n- x\n- y\nd: {}\ne: []\nf:\n- k: 1\n  j: 2\n- - p\n  - q\ng: |-\n  l1\n  l2\n"
        );
    }

    #[test]
    fn keys_that_cannot_be_simple_use_the_complex_form() {
        let mut m = Mapping::new();
        m.insert(Value::from("line\n"), Value::from("v"));
        assert_eq!(to_string(&m).unwrap(), "? |\n  line\n: v\n");
        let long = "k".repeat(129);
        let mut m = Mapping::new();
        m.insert(Value::from(long.as_str()), Value::from("v"));
        assert_eq!(to_string(&m).unwrap(), format!("? {long}\n: v\n"));
        let mut m = Mapping::new();
        m.insert(Value::from("k".repeat(128).as_str()), Value::from("v"));
        assert!(
            to_string(&m).unwrap().starts_with("kkk"),
            "128 bytes is still simple"
        );
    }
}
