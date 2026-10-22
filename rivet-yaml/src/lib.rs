//! rivet's own YAML: value model, parser and emitter (REQ-346).
//!
//! serde_yaml was archived upstream in 2024 (0.9.34+deprecated) and read every
//! artifact rivet loaded. This crate replaced it in stages:
//!
//! 1. **The value model** — `Value`, `Mapping`, `Number`, and the serde
//!    (de)serializers over them — ported from serde_yaml 0.9.34, so the public
//!    API mirrors serde_yaml's and migrating a call site is a path rename.
//! 2. **Parsing** (`from_str`) — rivet's lossless CST ([`cst`]) and a serde
//!    deserializer over it (`de`). Anchors and aliases are expanded; tags,
//!    complex keys and multi-document streams are refused, and merge keys are
//!    not expanded.
//! 3. **Emitting** (`to_string`) — a port of libyaml's scalar-style rules with
//!    serde_yaml's settings, so the files rivet writes are unchanged.
//!
//! Before serde_yaml was removed, parser and emitter were compared with it on
//! every YAML file and docs YAML block in this repository and agreed byte for
//! byte; `tests/yaml_corpus.rs` keeps the round-trip and a golden of
//! serde_yaml's emitter output.

#![forbid(unsafe_code)]

/// Lossless rowan CST of a YAML document (moved from rivet-core, REQ-346):
/// the base of rivet's own parser.
pub mod cst;
/// Scalar text from the CST: folding, unescaping, block scalars (REQ-346).
pub mod cst_text;
mod de;
mod emit;
mod error;
pub mod json;
#[allow(
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
    clippy::match_like_matches_macro,
    clippy::needless_borrows_for_generic_args,
    clippy::needless_lifetimes,
    clippy::unnecessary_map_or,
    clippy::legacy_numeric_constants,
    clippy::same_name_method,
    clippy::lossy_float_literal,
    reason = "DD-058: ported verbatim from serde_yaml 0.9.34 (see NOTICE); lint \
              findings are upstream's reviewed code, and keeping the port \
              byte-close is what makes its semantics identical by construction"
)]
pub mod mapping;
#[allow(
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
    clippy::match_like_matches_macro,
    clippy::needless_borrows_for_generic_args,
    clippy::needless_lifetimes,
    clippy::unnecessary_map_or,
    clippy::legacy_numeric_constants,
    clippy::same_name_method,
    clippy::lossy_float_literal,
    reason = "DD-058: ported verbatim from serde_yaml 0.9.34 (see NOTICE)"
)]
mod number;
#[allow(
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
    clippy::match_like_matches_macro,
    clippy::needless_borrows_for_generic_args,
    clippy::needless_lifetimes,
    clippy::unnecessary_map_or,
    clippy::legacy_numeric_constants,
    reason = "DD-058: ported verbatim from serde_yaml 0.9.34 (see NOTICE)"
)]
#[allow(
    dead_code,
    reason = "REQ-346 step 3: parse_null / parse_bool / parse_signed_int are the \
              plain-scalar resolution rivet's own deserializer will call; step 2 \
              reaches only the number-parsing path"
)]
mod scalar;
#[allow(
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
    clippy::match_like_matches_macro,
    clippy::needless_borrows_for_generic_args,
    clippy::needless_lifetimes,
    clippy::unnecessary_map_or,
    clippy::legacy_numeric_constants,
    clippy::same_name_method,
    clippy::lossy_float_literal,
    reason = "DD-058: ported verbatim from serde_yaml 0.9.34 (see NOTICE)"
)]
pub mod value;

pub use crate::error::{Error, Location, Result};
pub use crate::mapping::Mapping;
pub use crate::value::{Index, Number, Sequence, Value, from_value, to_value};

/// Deserialize a `T` from YAML text.
///
/// REQ-346 step 2: delegates to serde_yaml. `T`'s own `Deserialize` impl runs
/// against serde_yaml's deserializer, so a `T` containing `rivet_yaml::Value`
/// drives the ported `Value` visitor — the same code serde_yaml uses.
pub fn from_str<T>(s: &str) -> Result<T>
where
    T: serde::de::DeserializeOwned,
{
    de::from_str(s)
}

/// Serialize a `T` to YAML text.
///
/// REQ-346 step 2: delegates to serde_yaml's emitter.
pub fn to_string<T>(value: &T) -> Result<String>
where
    T: ?Sized + serde::Serialize,
{
    Ok(emit::emit(&to_value(value)?))
}

mod private {
    pub trait Sealed {}
    impl Sealed for usize {}
    impl Sealed for str {}
    impl Sealed for String {}
    impl Sealed for crate::Value {}
    impl<T> Sealed for &T where T: ?Sized + Sealed {}
}
