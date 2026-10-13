//! rivet's own YAML value model and serde entry points (REQ-346).
//!
//! serde_yaml was archived upstream in 2024 (0.9.34+deprecated) and reads every
//! artifact rivet loads. This crate gives rivet ownership of that dependency in
//! stages, each landing with zero behaviour change and its own oracle:
//!
//! 1. **The value model** — `Value`, `Mapping`, `Number`, and the serde
//!    (de)serializers over them — ported verbatim from serde_yaml 0.9.34 so
//!    semantics are identical by construction. The public API mirrors
//!    serde_yaml's, so migrating a call site is a path rename.
//! 2. **Parsing** (`from_str`) — delegates to serde_yaml for now; replaced by
//!    rivet's lossless CST, which refuses anchors, aliases, merge keys, tags,
//!    multi-document streams and complex keys.
//! 3. **Emitting** (`to_string`) — delegates to serde_yaml for now; replaced by
//!    a rivet-owned emitter behind a round-trip differential.

#![forbid(unsafe_code)]

/// Lossless rowan CST of a YAML document (moved from rivet-core, REQ-346):
/// the base of rivet's own parser.
pub mod cst;
/// Scalar text from the CST: folding, unescaping, block scalars (REQ-346).
pub mod cst_text;
mod de;
mod emit;
mod error;
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

pub use crate::error::{Error, Result};
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

/// The serde_yaml delegate [`from_str`] used before REQ-346 S3, kept only for
/// the differential tests until serde_yaml is removed.
#[doc(hidden)]
pub fn __from_str_serde_yaml<T>(s: &str) -> Result<T>
where
    T: serde::de::DeserializeOwned,
{
    serde_yaml::from_str(s).map_err(Error::from)
}

/// rivet's own deserializer (REQ-346 S3), compared against [`from_str`]'s
/// serde_yaml delegate by the differential tests until it replaces it.
#[doc(hidden)]
pub fn __from_str_owned<T>(s: &str) -> Result<T>
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

/// The serde_yaml emitter [`to_string`] used before REQ-346 S5, kept only for
/// the differential tests until serde_yaml is removed.
#[doc(hidden)]
pub fn __to_string_serde_yaml<T>(value: &T) -> Result<String>
where
    T: ?Sized + serde::Serialize,
{
    serde_yaml::to_string(value).map_err(Error::from)
}

mod private {
    pub trait Sealed {}
    impl Sealed for usize {}
    impl Sealed for str {}
    impl Sealed for String {}
    impl Sealed for crate::Value {}
    impl<T> Sealed for &T where T: ?Sized + Sealed {}
}
