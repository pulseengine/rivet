//! Error type for `rivet-yaml`.
//!
//! REQ-346 step 2: `from_str` / `to_string` still delegate to serde_yaml's
//! libyaml-backed parser and emitter, so its errors are carried verbatim in
//! `ErrorImpl::Delegate` — `Display` and `Debug` are forwarded unchanged so
//! every message a test or a user already sees stays byte-identical. That
//! variant is removed when rivet's own parser and emitter replace the delegate.
//! The remaining variants are the ones the ported value model constructs, with
//! serde_yaml 0.9.34's exact message text.

use std::error::Error as StdError;
use std::fmt::{self, Debug, Display};

/// An error from parsing, emitting, or converting YAML.
pub struct Error(Box<ErrorImpl>);

/// Alias for a `Result` with the error type `rivet_yaml::Error`.
pub type Result<T> = std::result::Result<T, Error>;

pub(crate) enum ErrorImpl {
    Message(String),
    /// A parse or emit error from the step-2 delegate. See the module docs.
    Delegate(serde_yaml::Error),
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

impl From<serde_yaml::Error> for Error {
    fn from(err: serde_yaml::Error) -> Self {
        new(ErrorImpl::Delegate(err))
    }
}

impl ErrorImpl {
    fn message(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            ErrorImpl::Message(msg) => f.write_str(msg),
            ErrorImpl::Delegate(err) => Display::fmt(err, f),
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
            ErrorImpl::Delegate(err) => err.source(),
            ErrorImpl::Message(_)
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
            ErrorImpl::Delegate(err) => Debug::fmt(err, f),
            ErrorImpl::Message(_)
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
        new(ErrorImpl::Message(msg.to_string()))
    }
}

impl serde::de::Error for Error {
    fn custom<T: Display>(msg: T) -> Self {
        new(ErrorImpl::Message(msg.to_string()))
    }
}
