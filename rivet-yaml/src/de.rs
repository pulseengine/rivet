//! rivet's own YAML deserializer (REQ-346 S3).
//!
//! The input is parsed by rivet's lossless CST ([`crate::cst`]) into a small
//! owned tree of [`Node`]s, and a `serde::Deserializer` runs over that tree.
//! Scalar typing follows serde_yaml 0.9.34 (ported from its `de.rs`): a plain
//! scalar is typed by the YAML 1.2 core schema when the target accepts any
//! type, and read as its text when the target asks for a string, so
//! `title: 2024` still deserializes into a `String`. Errors carry
//! serde_yaml's path and position (`links[0]: … at line 7 column 9`).
//!
//! Anchors and aliases are expanded: an alias becomes a copy of the node its
//! anchor named, with a cap on the total copied (a "billion laughs" document
//! fails instead of exhausting memory). Tags are refused, and a second
//! document is an error, as the CST reports it.

use std::fmt;

use serde::de::{self, DeserializeSeed, Expected, IntoDeserializer, Unexpected, Visitor};

use crate::cst::{self, SyntaxKind, SyntaxNode};
use crate::cst_text;
use crate::error::{self, ErrorImpl, Pos};
use crate::scalar::{
    digits_but_not_number, parse_bool, parse_f64, parse_negative_int, parse_null, parse_signed_int,
    parse_unsigned_int, visit_int,
};
use crate::{Error, Result};

/// serde_yaml's nesting limit.
const RECURSION_LIMIT: usize = 128;

/// Most nodes alias expansion may copy, in total, for one document.
const ALIAS_EXPANSION_LIMIT: usize = 1_000_000;

// ── Node tree ────────────────────────────────────────────────────────────

#[derive(Debug, Clone)]
pub(crate) struct Node {
    kind: Kind,
    /// Byte offset of the node's start in the input.
    offset: usize,
}

#[derive(Debug, Clone)]
enum Kind {
    /// `plain` is false for quoted and block scalars, which are always text.
    Scalar {
        text: String,
        plain: bool,
    },
    Seq(Vec<Node>),
    Map(Vec<(Node, Node)>),
}

/// Byte offset → 1-based line and column.
struct Lines {
    starts: Vec<usize>,
}

impl Lines {
    fn new(src: &str) -> Self {
        let mut starts = vec![0];
        starts.extend(src.match_indices('\n').map(|(i, _)| i.saturating_add(1)));
        Lines { starts }
    }

    fn pos(&self, offset: usize, path: &Path<'_>) -> Pos {
        let line = match self.starts.binary_search(&offset) {
            Ok(i) => i,
            Err(i) => i.saturating_sub(1),
        };
        let start = self.starts.get(line).copied().unwrap_or(0);
        Pos {
            path: path.to_string(),
            line: line.saturating_add(1),
            column: offset.saturating_sub(start).saturating_add(1),
        }
    }
}

fn syntax_error(lines: &Lines, msg: impl Into<String>, offset: usize) -> Error {
    error::new(ErrorImpl::Syntax(
        msg.into(),
        lines.pos(offset, &Path::Root),
    ))
}

fn offset_of(node: &SyntaxNode) -> usize {
    usize::from(node.text_range().start())
}

/// Parse `src` into a node tree. `None` is an empty document.
fn build(src: &str, lines: &Lines) -> Result<Option<Node>> {
    let (green, errors) = cst::parse(src);
    if let Some(first) = errors.first() {
        return Err(syntax_error(lines, first.message.clone(), first.offset));
    }
    let root = SyntaxNode::new_root(green);
    let builder = Builder {
        lines,
        anchors: std::cell::RefCell::new(std::collections::HashMap::new()),
        expanded: std::cell::Cell::new(0),
    };
    let node = builder.content(&root, 0)?;
    // An empty document (nothing but trivia and markers) is not a null value.
    let has_content = root.descendants_with_tokens().any(|el| {
        matches!(
            el.kind(),
            SyntaxKind::PlainScalar
                | SyntaxKind::SingleQuotedScalar
                | SyntaxKind::DoubleQuotedScalar
                | SyntaxKind::BlockScalar
                | SyntaxKind::Mapping
                | SyntaxKind::Sequence
                | SyntaxKind::FlowSequence
        )
    });
    Ok(has_content.then_some(node))
}

struct Builder<'a> {
    lines: &'a Lines,
    /// Nodes named by an anchor so far, in document order.
    anchors: std::cell::RefCell<std::collections::HashMap<String, Node>>,
    /// Nodes copied by alias expansion so far.
    expanded: std::cell::Cell<usize>,
}

impl Node {
    fn size(&self) -> usize {
        match &self.kind {
            Kind::Scalar { .. } => 1,
            Kind::Seq(items) => items.iter().map(Node::size).fold(1, usize::saturating_add),
            Kind::Map(entries) => entries
                .iter()
                .map(|(k, v)| k.size().saturating_add(v.size()))
                .fold(1, usize::saturating_add),
        }
    }
}

#[allow(
    clippy::wildcard_enum_match_arm,
    reason = "each match takes the CST kinds that carry content and skips the \
              rest (trivia, punctuation); a new content kind needs a deliberate arm \
              wherever it appears, which the CST's own tests exercise"
)]
impl Builder<'_> {
    /// The value held by `container`: a `Root`, `Value`, `Key` or
    /// `SequenceItem` node.
    fn content(&self, container: &SyntaxNode, depth: usize) -> Result<Node> {
        let anchor = container
            .children_with_tokens()
            .filter_map(|el| el.into_token())
            .find(|t| t.kind() == SyntaxKind::Anchor);
        let node = self.content_unanchored(container, depth)?;
        if let Some(anchor) = anchor {
            self.define(anchor.text(), &node);
        }
        Ok(node)
    }

    fn define(&self, anchor_text: &str, node: &Node) {
        let name = anchor_text.trim_start_matches('&').to_string();
        self.anchors.borrow_mut().insert(name, node.clone());
    }

    /// The node an alias (`*name`) stands for, copied.
    fn alias(&self, alias_text: &str, offset: usize) -> Result<Node> {
        let name = alias_text.trim_start_matches('*');
        let Some(node) = self.anchors.borrow().get(name).cloned() else {
            return Err(syntax_error(
                self.lines,
                format!("unknown anchor `{name}`"),
                offset,
            ));
        };
        let total = self.expanded.get().saturating_add(node.size());
        if total > ALIAS_EXPANSION_LIMIT {
            return Err(syntax_error(
                self.lines,
                "repetition limit exceeded",
                offset,
            ));
        }
        self.expanded.set(total);
        Ok(Node { offset, ..node })
    }

    fn content_unanchored(&self, container: &SyntaxNode, depth: usize) -> Result<Node> {
        if depth > RECURSION_LIMIT {
            return Err(error::new(ErrorImpl::RecursionLimitExceeded));
        }
        for child in container.children() {
            match child.kind() {
                SyntaxKind::Mapping => return self.mapping(&child, depth.saturating_add(1)),
                SyntaxKind::Sequence => {
                    return self.block_sequence(&child, depth.saturating_add(1));
                }
                SyntaxKind::FlowSequence => {
                    return self.flow_sequence(&child, depth.saturating_add(1));
                }
                SyntaxKind::BlockScalar => {
                    let text = cst_text::block_scalar_text(container).unwrap_or_default();
                    return Ok(Node {
                        kind: Kind::Scalar { text, plain: false },
                        offset: offset_of(&child),
                    });
                }
                SyntaxKind::Error => {
                    return Err(syntax_error(self.lines, "invalid YAML", offset_of(&child)));
                }
                _ => {}
            }
        }
        for token in container
            .children_with_tokens()
            .filter_map(|el| el.into_token())
        {
            let offset = usize::from(token.text_range().start());
            match token.kind() {
                SyntaxKind::SingleQuotedScalar | SyntaxKind::DoubleQuotedScalar => {
                    return Ok(Node {
                        kind: Kind::Scalar {
                            text: cst_text::unquote_scalar(token.kind(), token.text()),
                            plain: false,
                        },
                        offset,
                    });
                }
                SyntaxKind::Alias => return self.alias(token.text(), offset),
                SyntaxKind::PlainScalar => {
                    let text = cst_text::scalar_text(container)
                        .unwrap_or_else(|| token.text().to_string());
                    self.refuse_unsupported(&text, offset)?;
                    self.refuse_mapping_value(container, offset)?;
                    return Ok(Node {
                        kind: Kind::Scalar { text, plain: true },
                        offset,
                    });
                }
                _ => {}
            }
        }
        // Nothing here: an empty value, which YAML reads as null.
        Ok(Node {
            kind: Kind::Scalar {
                text: String::new(),
                plain: true,
            },
            offset: usize::from(container.text_range().end()),
        })
    }

    /// Tags (`!t`) are not supported. The CST lexes them as plain text, so
    /// they are caught here rather than read as strings that start with `!`.
    fn refuse_unsupported(&self, text: &str, offset: usize) -> Result<()> {
        if text.starts_with('!') {
            return Err(syntax_error(
                self.lines,
                "YAML tags are not supported; write the value out in full",
                offset,
            ));
        }
        Ok(())
    }

    /// A plain scalar in block context may not contain `: ` (YAML 1.2
    /// `ns-plain-char`): `title: a: b` is an error in YAML, in serde_yaml and
    /// in PyYAML. The CST accepts it so the edit path can still work on such a
    /// file, but reading it as the string `a: b` would accept YAML that every
    /// other tool rejects, so this reports it where serde_yaml did.
    fn refuse_mapping_value(&self, container: &SyntaxNode, offset: usize) -> Result<()> {
        // The scalar's own tokens, from its first one to a comment (where
        // `scalar_text` stops too): a `:` in a trailing comment is fine.
        for token in container
            .children_with_tokens()
            .filter_map(|el| el.into_token())
        {
            let start = usize::from(token.text_range().start());
            if start < offset {
                continue;
            }
            if token.kind() == SyntaxKind::Comment {
                break;
            }
            if token.kind() == SyntaxKind::Colon {
                return Err(syntax_error(
                    self.lines,
                    "mapping values are not allowed in this context",
                    start,
                ));
            }
            let text = token.text();
            let colon = text.match_indices(':').map(|(i, _)| i).find(|&i| {
                matches!(
                    text.as_bytes().get(i.saturating_add(1)),
                    None | Some(b' ' | b'\t' | b'\n' | b'\r')
                )
            });
            if let Some(i) = colon {
                return Err(syntax_error(
                    self.lines,
                    "mapping values are not allowed in this context",
                    start.saturating_add(i),
                ));
            }
        }
        Ok(())
    }

    fn mapping(&self, map: &SyntaxNode, depth: usize) -> Result<Node> {
        let mut entries = Vec::new();
        for entry in map
            .children()
            .filter(|c| c.kind() == SyntaxKind::MappingEntry)
        {
            let Some(key) = entry.children().find(|c| c.kind() == SyntaxKind::Key) else {
                continue;
            };
            let key = self.content(&key, depth)?;
            let value = match entry.children().find(|c| c.kind() == SyntaxKind::Value) {
                Some(v) => self.content(&v, depth)?,
                None => Node {
                    kind: Kind::Scalar {
                        text: String::new(),
                        plain: true,
                    },
                    offset: usize::from(entry.text_range().end()),
                },
            };
            entries.push((key, value));
        }
        Ok(Node {
            kind: Kind::Map(entries),
            offset: offset_of(map),
        })
    }

    fn block_sequence(&self, seq: &SyntaxNode, depth: usize) -> Result<Node> {
        let mut items = Vec::new();
        for item in seq
            .children()
            .filter(|c| c.kind() == SyntaxKind::SequenceItem)
        {
            items.push(self.content(&item, depth)?);
        }
        Ok(Node {
            kind: Kind::Seq(items),
            offset: offset_of(seq),
        })
    }

    /// `[a, b c, 'd, e', {k: v}, [x]]`: items are separated by commas. A
    /// plain item can span several tokens (`b c`), so tokens are gathered up to
    /// the next comma rather than read one per item.
    fn flow_sequence(&self, seq: &SyntaxNode, depth: usize) -> Result<Node> {
        let mut items = Vec::new();
        let mut plain = String::new();
        let mut plain_at = None;
        // An anchor names the item that follows it: (anchor text, that item's
        // index once pushed).
        let mut pending_anchor: Option<(String, usize)> = None;
        let flush = |plain: &mut String, plain_at: &mut Option<usize>, items: &mut Vec<Node>| {
            if let Some(offset) = plain_at.take() {
                let text = plain.trim().to_string();
                plain.clear();
                self.refuse_unsupported(&text, offset)?;
                items.push(Node {
                    kind: Kind::Scalar { text, plain: true },
                    offset,
                });
            }
            Ok::<(), Error>(())
        };
        for el in seq.children_with_tokens() {
            if let Some((anchor, index)) = &pending_anchor {
                if let Some(item) = items.get(*index) {
                    self.define(anchor, item);
                    pending_anchor = None;
                }
            }
            match el {
                rowan::NodeOrToken::Token(t) => match t.kind() {
                    SyntaxKind::PlainScalar => {
                        plain_at.get_or_insert(usize::from(t.text_range().start()));
                        plain.push_str(t.text());
                    }
                    SyntaxKind::Whitespace | SyntaxKind::Newline if plain_at.is_some() => {
                        plain.push(' ');
                    }
                    SyntaxKind::SingleQuotedScalar | SyntaxKind::DoubleQuotedScalar => {
                        flush(&mut plain, &mut plain_at, &mut items)?;
                        items.push(Node {
                            kind: Kind::Scalar {
                                text: cst_text::unquote_scalar(t.kind(), t.text()),
                                plain: false,
                            },
                            offset: usize::from(t.text_range().start()),
                        });
                    }
                    SyntaxKind::Comma | SyntaxKind::RBracket => {
                        flush(&mut plain, &mut plain_at, &mut items)?;
                    }
                    SyntaxKind::Anchor => {
                        flush(&mut plain, &mut plain_at, &mut items)?;
                        pending_anchor = Some((t.text().to_string(), items.len()));
                        continue;
                    }
                    SyntaxKind::Alias => {
                        flush(&mut plain, &mut plain_at, &mut items)?;
                        items.push(self.alias(t.text(), usize::from(t.text_range().start()))?);
                    }
                    _ => {}
                },
                rowan::NodeOrToken::Node(n) => {
                    flush(&mut plain, &mut plain_at, &mut items)?;
                    match n.kind() {
                        SyntaxKind::Mapping => {
                            items.push(self.mapping(&n, depth.saturating_add(1))?)
                        }
                        SyntaxKind::FlowSequence => {
                            items.push(self.flow_sequence(&n, depth.saturating_add(1))?)
                        }
                        SyntaxKind::Error => {
                            return Err(syntax_error(self.lines, "invalid YAML", offset_of(&n)));
                        }
                        _ => {}
                    }
                }
            }
        }
        flush(&mut plain, &mut plain_at, &mut items)?;
        if let Some((anchor, index)) = &pending_anchor {
            if let Some(item) = items.get(*index) {
                self.define(anchor, item);
            }
        }
        Ok(Node {
            kind: Kind::Seq(items),
            offset: offset_of(seq),
        })
    }
}

// ── Path (for error messages) ───────────────────────────────────────────

/// Path to the current value, rendered as serde_yaml renders it
/// (`artifacts[0].links[1]`, `.` at the root).
#[derive(Clone, Copy)]
enum Path<'a> {
    Root,
    Seq { parent: &'a Path<'a>, index: usize },
    Map { parent: &'a Path<'a>, key: &'a str },
    Unknown { parent: &'a Path<'a> },
}

#[allow(
    clippy::wildcard_enum_match_arm,
    reason = "serde_yaml's Path rendering: every non-root parent renders the same way"
)]
impl fmt::Display for Path<'_> {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        struct Parent<'a>(&'a Path<'a>);
        impl fmt::Display for Parent<'_> {
            fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
                match self.0 {
                    Path::Root => Ok(()),
                    path => write!(f, "{path}."),
                }
            }
        }
        match self {
            Path::Root => f.write_str("."),
            Path::Seq { parent, index } => write!(f, "{parent}[{index}]"),
            Path::Map { parent, key } => write!(f, "{}{key}", Parent(parent)),
            Path::Unknown { parent } => write!(f, "{}?", Parent(parent)),
        }
    }
}

// ── Deserializer ────────────────────────────────────────────────────────

/// Deserialize a `T` from YAML text with rivet's own parser.
pub(crate) fn from_str<T>(src: &str) -> Result<T>
where
    T: de::DeserializeOwned,
{
    let lines = Lines::new(src);
    match build(src, &lines)? {
        Some(node) => T::deserialize(NodeDe {
            node: &node,
            path: Path::Root,
            lines: &lines,
        }),
        // serde_yaml reads an empty document as a missing value: fine for an
        // Option or unit, "EOF while parsing a value" for anything else.
        None => T::deserialize(EmptyDe),
    }
}

struct NodeDe<'n, 'p> {
    node: &'n Node,
    path: Path<'p>,
    lines: &'n Lines,
}

impl NodeDe<'_, '_> {
    fn pos(&self) -> Pos {
        self.lines.pos(self.node.offset, &self.path)
    }

    fn fix(&self, err: Error) -> Error {
        err.fix_pos(|| self.pos())
    }

    fn invalid_type(&self, exp: &dyn Expected) -> Error {
        let err = match &self.node.kind {
            Kind::Scalar { text, plain: true } => match visit_scalar(InvalidType { exp }, text) {
                Ok(void) => match void {},
                Err(err) => err,
            },
            Kind::Scalar { text, plain: false } => {
                de::Error::invalid_type(Unexpected::Str(text), exp)
            }
            Kind::Seq(_) => de::Error::invalid_type(Unexpected::Seq, exp),
            Kind::Map(_) => de::Error::invalid_type(Unexpected::Map, exp),
        };
        self.fix(err)
    }

    fn plain(&self) -> Option<&str> {
        match &self.node.kind {
            Kind::Scalar { text, plain: true } => Some(text),
            Kind::Scalar { .. } | Kind::Seq(_) | Kind::Map(_) => None,
        }
    }

    fn is_null(&self) -> bool {
        self.plain()
            .is_some_and(|t| t.is_empty() || parse_null(t.as_bytes()).is_some())
    }
}

/// Type a plain scalar by the YAML 1.2 core schema (serde_yaml's
/// `visit_untagged_scalar`).
fn visit_scalar<'de, V: Visitor<'de>>(visitor: V, v: &str) -> Result<V::Value> {
    if v.is_empty() || parse_null(v.as_bytes()).is_some() {
        return visitor.visit_unit();
    }
    if let Some(boolean) = parse_bool(v) {
        return visitor.visit_bool(boolean);
    }
    let visitor = match visit_int(visitor, v) {
        Ok(result) => return result,
        Err(visitor) => visitor,
    };
    if !digits_but_not_number(v) {
        if let Some(float) = parse_f64(v) {
            return visitor.visit_f64(float);
        }
    }
    visitor.visit_str(v)
}

/// Whether a string must be quoted so it reads back as a string: it would
/// otherwise type as null, a bool or a number, or it is a digit string with a
/// leading zero (serde_yaml's `InferScalarStyle`, used by the emitter).
pub(crate) fn visit_hint(v: &str) -> bool {
    v.is_empty()
        || parse_null(v.as_bytes()).is_some()
        || parse_bool(v).is_some()
        || parse_unsigned_int(v, u128::from_str_radix).is_some()
        || parse_negative_int(v, i128::from_str_radix).is_some()
        || digits_but_not_number(v)
        || parse_f64(v).is_some()
}

/// A visitor that accepts nothing, used to phrase an invalid-type error the
/// way the scalar's own type would (serde_yaml's `InvalidType`).
struct InvalidType<'a> {
    exp: &'a dyn Expected,
}

enum Void {}

impl<'de> Visitor<'de> for InvalidType<'_> {
    type Value = Void;
    fn expecting(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        self.exp.fmt(f)
    }
}

macro_rules! typed_scalar {
    ($name:ident, $parse:expr, $visit:ident) => {
        fn $name<V: Visitor<'de>>(self, visitor: V) -> Result<V::Value> {
            if let Some(text) = self.plain() {
                if let Some(v) = $parse(text) {
                    return visitor.$visit(v).map_err(|e| self.fix(e));
                }
            }
            Err(self.invalid_type(&visitor))
        }
    };
}

impl<'de> de::Deserializer<'de> for NodeDe<'_, '_> {
    type Error = Error;

    fn deserialize_any<V: Visitor<'de>>(self, visitor: V) -> Result<V::Value> {
        let result = match &self.node.kind {
            Kind::Scalar { text, plain: true } => visit_scalar(visitor, text),
            Kind::Scalar { text, plain: false } => visitor.visit_str(text),
            Kind::Seq(items) => self.visit_seq(items, visitor),
            Kind::Map(entries) => self.visit_map(entries, visitor),
        };
        result.map_err(|e| self.fix(e))
    }

    typed_scalar!(deserialize_bool, parse_bool, visit_bool);
    typed_scalar!(
        deserialize_i64,
        |t| parse_signed_int(t, i64::from_str_radix),
        visit_i64
    );
    typed_scalar!(
        deserialize_i128,
        |t| parse_signed_int(t, i128::from_str_radix),
        visit_i128
    );
    typed_scalar!(
        deserialize_u64,
        |t| parse_unsigned_int(t, u64::from_str_radix),
        visit_u64
    );
    typed_scalar!(
        deserialize_u128,
        |t| parse_unsigned_int(t, u128::from_str_radix),
        visit_u128
    );
    typed_scalar!(deserialize_f64, parse_f64, visit_f64);

    fn deserialize_i8<V: Visitor<'de>>(self, visitor: V) -> Result<V::Value> {
        self.deserialize_i64(visitor)
    }
    fn deserialize_i16<V: Visitor<'de>>(self, visitor: V) -> Result<V::Value> {
        self.deserialize_i64(visitor)
    }
    fn deserialize_i32<V: Visitor<'de>>(self, visitor: V) -> Result<V::Value> {
        self.deserialize_i64(visitor)
    }
    fn deserialize_u8<V: Visitor<'de>>(self, visitor: V) -> Result<V::Value> {
        self.deserialize_u64(visitor)
    }
    fn deserialize_u16<V: Visitor<'de>>(self, visitor: V) -> Result<V::Value> {
        self.deserialize_u64(visitor)
    }
    fn deserialize_u32<V: Visitor<'de>>(self, visitor: V) -> Result<V::Value> {
        self.deserialize_u64(visitor)
    }
    fn deserialize_f32<V: Visitor<'de>>(self, visitor: V) -> Result<V::Value> {
        self.deserialize_f64(visitor)
    }
    fn deserialize_char<V: Visitor<'de>>(self, visitor: V) -> Result<V::Value> {
        self.deserialize_str(visitor)
    }

    /// Any scalar is its own text when a string is asked for, plain or not
    /// (serde_yaml's `deserialize_str`).
    fn deserialize_str<V: Visitor<'de>>(self, visitor: V) -> Result<V::Value> {
        match &self.node.kind {
            Kind::Scalar { text, .. } => visitor.visit_str(text).map_err(|e| self.fix(e)),
            Kind::Seq(_) | Kind::Map(_) => Err(self.invalid_type(&visitor)),
        }
    }
    fn deserialize_string<V: Visitor<'de>>(self, visitor: V) -> Result<V::Value> {
        self.deserialize_str(visitor)
    }
    fn deserialize_identifier<V: Visitor<'de>>(self, visitor: V) -> Result<V::Value> {
        self.deserialize_str(visitor)
    }

    fn deserialize_bytes<V: Visitor<'de>>(self, _visitor: V) -> Result<V::Value> {
        Err(error::new(ErrorImpl::BytesUnsupported))
    }
    fn deserialize_byte_buf<V: Visitor<'de>>(self, _visitor: V) -> Result<V::Value> {
        Err(error::new(ErrorImpl::BytesUnsupported))
    }

    fn deserialize_option<V: Visitor<'de>>(self, visitor: V) -> Result<V::Value> {
        if self.is_null() {
            visitor.visit_none()
        } else {
            visitor.visit_some(self)
        }
    }

    fn deserialize_unit<V: Visitor<'de>>(self, visitor: V) -> Result<V::Value> {
        if self.is_null() {
            return visitor.visit_unit();
        }
        match &self.node.kind {
            Kind::Scalar { text, .. } => {
                Err(self.fix(de::Error::invalid_value(Unexpected::Str(text), &"null")))
            }
            Kind::Seq(_) | Kind::Map(_) => Err(self.invalid_type(&visitor)),
        }
    }
    fn deserialize_unit_struct<V: Visitor<'de>>(
        self,
        _name: &'static str,
        visitor: V,
    ) -> Result<V::Value> {
        self.deserialize_unit(visitor)
    }

    fn deserialize_newtype_struct<V: Visitor<'de>>(
        self,
        _name: &'static str,
        visitor: V,
    ) -> Result<V::Value> {
        visitor.visit_newtype_struct(self)
    }

    /// An empty plain scalar reads as an empty sequence, as in serde_yaml.
    fn deserialize_seq<V: Visitor<'de>>(self, visitor: V) -> Result<V::Value> {
        match &self.node.kind {
            Kind::Seq(items) => self.visit_seq(items, visitor).map_err(|e| self.fix(e)),
            Kind::Scalar { text, plain: true } if text.is_empty() => {
                self.visit_seq(&[], visitor).map_err(|e| self.fix(e))
            }
            Kind::Scalar { .. } | Kind::Map(_) => Err(self.invalid_type(&visitor)),
        }
    }
    fn deserialize_tuple<V: Visitor<'de>>(self, _len: usize, visitor: V) -> Result<V::Value> {
        self.deserialize_seq(visitor)
    }
    fn deserialize_tuple_struct<V: Visitor<'de>>(
        self,
        _name: &'static str,
        _len: usize,
        visitor: V,
    ) -> Result<V::Value> {
        self.deserialize_seq(visitor)
    }

    /// An empty plain scalar reads as an empty mapping, as in serde_yaml.
    fn deserialize_map<V: Visitor<'de>>(self, visitor: V) -> Result<V::Value> {
        match &self.node.kind {
            Kind::Map(entries) => self.visit_map(entries, visitor).map_err(|e| self.fix(e)),
            Kind::Scalar { text, plain: true } if text.is_empty() => {
                self.visit_map(&[], visitor).map_err(|e| self.fix(e))
            }
            Kind::Scalar { .. } | Kind::Seq(_) => Err(self.invalid_type(&visitor)),
        }
    }
    fn deserialize_struct<V: Visitor<'de>>(
        self,
        _name: &'static str,
        _fields: &'static [&'static str],
        visitor: V,
    ) -> Result<V::Value> {
        self.deserialize_map(visitor)
    }

    /// A unit variant is a scalar naming it. serde_yaml 0.9 writes any other
    /// variant with a YAML tag, which rivet does not support, so a mapping or
    /// sequence here gets serde_yaml's own message.
    fn deserialize_enum<V: Visitor<'de>>(
        self,
        _name: &'static str,
        _variants: &'static [&'static str],
        visitor: V,
    ) -> Result<V::Value> {
        let unexpected = match &self.node.kind {
            Kind::Scalar { text, .. } => {
                return visitor
                    .visit_enum(text.as_str().into_deserializer())
                    .map_err(|e: Error| self.fix(e));
            }
            Kind::Map(_) => Unexpected::Map,
            Kind::Seq(_) => Unexpected::Seq,
        };
        Err(self.fix(de::Error::invalid_type(
            unexpected,
            &"a YAML tag starting with '!'",
        )))
    }

    fn deserialize_ignored_any<V: Visitor<'de>>(self, visitor: V) -> Result<V::Value> {
        visitor.visit_unit()
    }
}

impl<'n, 'p> NodeDe<'n, 'p> {
    fn visit_seq<'de, V: Visitor<'de>>(&self, items: &'n [Node], visitor: V) -> Result<V::Value> {
        let mut access = SeqAccess {
            items: items.iter().enumerate(),
            parent: &self.path,
            lines: self.lines,
        };
        let value = visitor.visit_seq(&mut access)?;
        if access.items.len() != 0 {
            return Err(de::Error::invalid_length(items.len(), &"fewer elements"));
        }
        Ok(value)
    }

    fn visit_map<'de, V: Visitor<'de>>(
        &self,
        entries: &'n [(Node, Node)],
        visitor: V,
    ) -> Result<V::Value> {
        let mut access = MapAccess {
            entries: entries.iter(),
            value: None,
            parent: &self.path,
            lines: self.lines,
        };
        visitor.visit_map(&mut access)
    }
}

struct SeqAccess<'n, 'p> {
    items: std::iter::Enumerate<std::slice::Iter<'n, Node>>,
    parent: &'p Path<'p>,
    lines: &'n Lines,
}

impl<'de> de::SeqAccess<'de> for SeqAccess<'_, '_> {
    type Error = Error;

    fn next_element_seed<T: DeserializeSeed<'de>>(&mut self, seed: T) -> Result<Option<T::Value>> {
        match self.items.next() {
            Some((index, node)) => seed
                .deserialize(NodeDe {
                    node,
                    path: Path::Seq {
                        parent: self.parent,
                        index,
                    },
                    lines: self.lines,
                })
                .map(Some),
            None => Ok(None),
        }
    }

    fn size_hint(&self) -> Option<usize> {
        Some(self.items.len())
    }
}

struct MapAccess<'n, 'p> {
    entries: std::slice::Iter<'n, (Node, Node)>,
    value: Option<&'n (Node, Node)>,
    parent: &'p Path<'p>,
    lines: &'n Lines,
}

impl<'de> de::MapAccess<'de> for MapAccess<'_, '_> {
    type Error = Error;

    fn next_key_seed<K: DeserializeSeed<'de>>(&mut self, seed: K) -> Result<Option<K::Value>> {
        match self.entries.next() {
            Some(entry) => {
                self.value = Some(entry);
                seed.deserialize(NodeDe {
                    node: &entry.0,
                    path: Path::Unknown {
                        parent: self.parent,
                    },
                    lines: self.lines,
                })
                .map(Some)
            }
            None => Ok(None),
        }
    }

    fn next_value_seed<V: DeserializeSeed<'de>>(&mut self, seed: V) -> Result<V::Value> {
        let Some((key, value)) = self.value.take() else {
            return Err(de::Error::custom("value requested before key"));
        };
        let key_text = match &key.kind {
            Kind::Scalar { text, .. } => Some(text.as_str()),
            Kind::Seq(_) | Kind::Map(_) => None,
        };
        let path = match key_text {
            Some(key) => Path::Map {
                parent: self.parent,
                key,
            },
            None => Path::Unknown {
                parent: self.parent,
            },
        };
        seed.deserialize(NodeDe {
            node: value,
            path,
            lines: self.lines,
        })
    }

    fn size_hint(&self) -> Option<usize> {
        Some(self.entries.len())
    }
}

/// The deserializer for an empty document (serde_yaml's `Event::Void`).
struct EmptyDe;

impl<'de> de::Deserializer<'de> for EmptyDe {
    type Error = Error;

    fn deserialize_any<V: Visitor<'de>>(self, visitor: V) -> Result<V::Value> {
        visitor.visit_none()
    }
    fn deserialize_option<V: Visitor<'de>>(self, visitor: V) -> Result<V::Value> {
        visitor.visit_none()
    }
    fn deserialize_unit<V: Visitor<'de>>(self, visitor: V) -> Result<V::Value> {
        visitor.visit_unit()
    }
    fn deserialize_seq<V: Visitor<'de>>(self, visitor: V) -> Result<V::Value> {
        visitor.visit_seq(de::value::SeqDeserializer::<_, Error>::new(
            std::iter::empty::<()>(),
        ))
    }
    fn deserialize_map<V: Visitor<'de>>(self, visitor: V) -> Result<V::Value> {
        visitor.visit_map(de::value::MapDeserializer::<_, Error>::new(
            std::iter::empty::<((), ())>(),
        ))
    }
    fn deserialize_struct<V: Visitor<'de>>(
        self,
        _name: &'static str,
        _fields: &'static [&'static str],
        visitor: V,
    ) -> Result<V::Value> {
        self.deserialize_map(visitor)
    }

    serde::forward_to_deserialize_any! {
        bool i8 i16 i32 i64 i128 u8 u16 u32 u64 u128 f32 f64 char str string
        bytes byte_buf unit_struct newtype_struct tuple tuple_struct enum
        identifier ignored_any
    }
}
