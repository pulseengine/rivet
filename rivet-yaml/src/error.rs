//! Error type for `rivet-yaml`.
//!
//! Messages keep serde_yaml 0.9.34's wording and form (`path: message at line
//! L column C`), so what a user or a test already matches on is unchanged
//! now that rivet parses and emits YAML itself (REQ-346).

use std::error::Error as StdError;
use std::fmt::{self, Debug, Display};

/// An error from parsing, emitting, or converting YAML.
pub struct Error(Box<ErrorImpl>);

/// Alias for a `Result` with the error type `rivet_yaml::Error`.
pub type Result<T> = std::result::Result<T, Error>;

/// Where in the input an error arose: serde_yaml's `Pos`, rendered the same
/// way (`path: message at line L column C`).
pub(crate) struct Pos {
    pub(crate) path: String,
    /// 1-based line and column.
    pub(crate) line: usize,
    pub(crate) column: usize,
}

pub(crate) enum ErrorImpl {
    Message(String, Option<Pos>),
    /// The CST rejected the input (rivet's own parser, REQ-346).
    Syntax(String, Pos),
    RecursionLimitExceeded,
    BytesUnsupported,
    ScalarInMerge,
    TaggedInMerge,
    ScalarInMergeElement,
    SequenceInMergeElement,
    EmptyTag,
    FailedToParseNumber,
}

pub(crate) fn new(inner: ErrorImpl) -> Error {
    Error(Box::new(inner))
}

impl ErrorImpl {
    fn message(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            ErrorImpl::Message(msg, None) => f.write_str(msg),
            ErrorImpl::Message(msg, Some(pos)) => {
                if pos.path != "." {
                    write!(f, "{}: ", pos.path)?;
                }
                f.write_str(msg)?;
                write!(f, " at line {} column {}", pos.line, pos.column)
            }
            ErrorImpl::Syntax(msg, pos) => {
                write!(f, "{msg} at line {} column {}", pos.line, pos.column)
            }
            ErrorImpl::RecursionLimitExceeded => f.write_str("recursion limit exceeded"),
            ErrorImpl::BytesUnsupported => {
                f.write_str("serialization and deserialization of bytes in YAML is not implemented")
            }
            ErrorImpl::ScalarInMerge => {
                f.write_str("expected a mapping or list of mappings for merging, but found scalar")
            }
            ErrorImpl::TaggedInMerge => f.write_str("unexpected tagged value in merge"),
            ErrorImpl::ScalarInMergeElement => {
                f.write_str("expected a mapping for merging, but found scalar")
            }
            ErrorImpl::SequenceInMergeElement => {
                f.write_str("expected a mapping for merging, but found sequence")
            }
            ErrorImpl::EmptyTag => f.write_str("empty YAML tag is not allowed"),
            ErrorImpl::FailedToParseNumber => f.write_str("failed to parse YAML number"),
        }
    }
}

impl StdError for Error {
    fn source(&self) -> Option<&(dyn StdError + 'static)> {
        match self.0.as_ref() {
            ErrorImpl::Message(..)
            | ErrorImpl::Syntax(..)
            | ErrorImpl::RecursionLimitExceeded
            | ErrorImpl::BytesUnsupported
            | ErrorImpl::ScalarInMerge
            | ErrorImpl::TaggedInMerge
            | ErrorImpl::ScalarInMergeElement
            | ErrorImpl::SequenceInMergeElement
            | ErrorImpl::EmptyTag
            | ErrorImpl::FailedToParseNumber => None,
        }
    }
}

impl Display for Error {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        self.0.message(f)
    }
}

impl Debug for Error {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let inner = self.0.as_ref();
        match inner {
            ErrorImpl::Message(..)
            | ErrorImpl::Syntax(..)
            | ErrorImpl::RecursionLimitExceeded
            | ErrorImpl::BytesUnsupported
            | ErrorImpl::ScalarInMerge
            | ErrorImpl::TaggedInMerge
            | ErrorImpl::ScalarInMergeElement
            | ErrorImpl::SequenceInMergeElement
            | ErrorImpl::EmptyTag
            | ErrorImpl::FailedToParseNumber => {
                let other = inner;
                struct Msg<'a>(&'a ErrorImpl);
                impl Display for Msg<'_> {
                    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
                        self.0.message(f)
                    }
                }
                write!(f, "Error({:?})", Msg(other).to_string())
            }
        }
    }
}

impl serde::ser::Error for Error {
    fn custom<T: Display>(msg: T) -> Self {
        new(ErrorImpl::Message(msg.to_string(), None))
    }
}

impl serde::de::Error for Error {
    fn custom<T: Display>(msg: T) -> Self {
        new(ErrorImpl::Message(msg.to_string(), None))
    }
}

/// A 1-based line and column in the input.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct Location {
    /// 1-based line.
    pub line: usize,
    /// 1-based column.
    pub column: usize,
}

impl Error {
    /// Where in the input the error arose, when it carries a position
    /// (REQ-408: `rivet yaml to-json` reports it as `file:line:column`).
    pub fn location(&self) -> Option<Location> {
        match self.0.as_ref() {
            ErrorImpl::Message(_, Some(pos)) | ErrorImpl::Syntax(_, pos) => Some(Location {
                line: pos.line,
                column: pos.column,
            }),
            ErrorImpl::Message(_, None)
            | ErrorImpl::RecursionLimitExceeded
            | ErrorImpl::BytesUnsupported
            | ErrorImpl::ScalarInMerge
            | ErrorImpl::TaggedInMerge
            | ErrorImpl::ScalarInMergeElement
            | ErrorImpl::SequenceInMergeElement
            | ErrorImpl::EmptyTag
            | ErrorImpl::FailedToParseNumber => None,
        }
    }

    /// The message without its trailing ` at line L column C`.
    pub fn message_without_location(&self) -> String {
        match self.0.as_ref() {
            ErrorImpl::Message(msg, Some(pos)) if pos.path != "." => {
                format!("{}: {msg}", pos.path)
            }
            ErrorImpl::Message(msg, Some(_)) | ErrorImpl::Syntax(msg, _) => msg.clone(),
            ErrorImpl::Message(_, None)
            | ErrorImpl::RecursionLimitExceeded
            | ErrorImpl::BytesUnsupported
            | ErrorImpl::ScalarInMerge
            | ErrorImpl::TaggedInMerge
            | ErrorImpl::ScalarInMergeElement
            | ErrorImpl::SequenceInMergeElement
            | ErrorImpl::EmptyTag
            | ErrorImpl::FailedToParseNumber => self.to_string(),
        }
    }

    /// Attach a position to an error a `Visitor` raised without one, as
    /// serde_yaml's `fix_mark` does. Errors that already carry one keep it.
    pub(crate) fn fix_pos(mut self, pos: impl FnOnce() -> Pos) -> Self {
        if let ErrorImpl::Message(_, none @ None) = self.0.as_mut() {
            *none = Some(pos());
        }
        self
    }
}
