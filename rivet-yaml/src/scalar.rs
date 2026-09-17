// Ported from serde_yaml 0.9.34 — https://github.com/dtolnay/serde-yaml
// Copyright (c) David Tolnay. Licensed MIT OR Apache-2.0; used here under
// Apache-2.0. See rivet-yaml/NOTICE.
//
// REQ-346: serde_yaml was archived upstream (0.9.34+deprecated, 2024-03-25).
// The value model below is safe Rust with no dependency on the unmaintained
// libyaml translation, so rivet takes ownership of it verbatim rather than
// re-deriving its semantics — `Mapping::remove` being `swap_remove`, float
// normalisation in `Number`'s `Eq`/`Hash`, the tagged-value protocol. Changes
// from upstream are limited to module paths unless marked `RIVET:`.

//! YAML 1.2 core-schema scalar resolution: null, bool, integer, float.
//!
//! Ported from serde_yaml's `de.rs`. These are pure functions over scalar text
//! with no parser dependency, and they are what rivet's own deserializer will
//! use to type plain scalars (REQ-346 step 3).

use serde::de::Visitor;
use std::num::ParseIntError;

// The ported helpers use both the crate's one-argument `Result<T>` and std's
// two-argument `Result<T, E>`; a defaulted parameter serves both spellings.
type Result<T, E = crate::Error> = std::result::Result<T, E>;

fn parse_null(scalar: &[u8]) -> Option<()> {
    match scalar {
        b"null" | b"Null" | b"NULL" | b"~" => Some(()),
        _ => None,
    }
}

fn parse_bool(scalar: &str) -> Option<bool> {
    match scalar {
        "true" | "True" | "TRUE" => Some(true),
        "false" | "False" | "FALSE" => Some(false),
        _ => None,
    }
}

fn parse_unsigned_int<T>(
    scalar: &str,
    from_str_radix: fn(&str, radix: u32) -> Result<T, ParseIntError>,
) -> Option<T> {
    let unpositive = scalar.strip_prefix('+').unwrap_or(scalar);
    if let Some(rest) = unpositive.strip_prefix("0x") {
        if rest.starts_with(['+', '-']) {
            return None;
        }
        if let Ok(int) = from_str_radix(rest, 16) {
            return Some(int);
        }
    }
    if let Some(rest) = unpositive.strip_prefix("0o") {
        if rest.starts_with(['+', '-']) {
            return None;
        }
        if let Ok(int) = from_str_radix(rest, 8) {
            return Some(int);
        }
    }
    if let Some(rest) = unpositive.strip_prefix("0b") {
        if rest.starts_with(['+', '-']) {
            return None;
        }
        if let Ok(int) = from_str_radix(rest, 2) {
            return Some(int);
        }
    }
    if unpositive.starts_with(['+', '-']) {
        return None;
    }
    if digits_but_not_number(scalar) {
        return None;
    }
    from_str_radix(unpositive, 10).ok()
}

fn parse_signed_int<T>(
    scalar: &str,
    from_str_radix: fn(&str, radix: u32) -> Result<T, ParseIntError>,
) -> Option<T> {
    let unpositive = if let Some(unpositive) = scalar.strip_prefix('+') {
        if unpositive.starts_with(['+', '-']) {
            return None;
        }
        unpositive
    } else {
        scalar
    };
    if let Some(rest) = unpositive.strip_prefix("0x") {
        if rest.starts_with(['+', '-']) {
            return None;
        }
        if let Ok(int) = from_str_radix(rest, 16) {
            return Some(int);
        }
    }
    if let Some(rest) = scalar.strip_prefix("-0x") {
        let negative = format!("-{}", rest);
        if let Ok(int) = from_str_radix(&negative, 16) {
            return Some(int);
        }
    }
    if let Some(rest) = unpositive.strip_prefix("0o") {
        if rest.starts_with(['+', '-']) {
            return None;
        }
        if let Ok(int) = from_str_radix(rest, 8) {
            return Some(int);
        }
    }
    if let Some(rest) = scalar.strip_prefix("-0o") {
        let negative = format!("-{}", rest);
        if let Ok(int) = from_str_radix(&negative, 8) {
            return Some(int);
        }
    }
    if let Some(rest) = unpositive.strip_prefix("0b") {
        if rest.starts_with(['+', '-']) {
            return None;
        }
        if let Ok(int) = from_str_radix(rest, 2) {
            return Some(int);
        }
    }
    if let Some(rest) = scalar.strip_prefix("-0b") {
        let negative = format!("-{}", rest);
        if let Ok(int) = from_str_radix(&negative, 2) {
            return Some(int);
        }
    }
    if digits_but_not_number(scalar) {
        return None;
    }
    from_str_radix(unpositive, 10).ok()
}

fn parse_negative_int<T>(
    scalar: &str,
    from_str_radix: fn(&str, radix: u32) -> Result<T, ParseIntError>,
) -> Option<T> {
    if let Some(rest) = scalar.strip_prefix("-0x") {
        let negative = format!("-{}", rest);
        if let Ok(int) = from_str_radix(&negative, 16) {
            return Some(int);
        }
    }
    if let Some(rest) = scalar.strip_prefix("-0o") {
        let negative = format!("-{}", rest);
        if let Ok(int) = from_str_radix(&negative, 8) {
            return Some(int);
        }
    }
    if let Some(rest) = scalar.strip_prefix("-0b") {
        let negative = format!("-{}", rest);
        if let Ok(int) = from_str_radix(&negative, 2) {
            return Some(int);
        }
    }
    if digits_but_not_number(scalar) {
        return None;
    }
    from_str_radix(scalar, 10).ok()
}

pub(crate) fn parse_f64(scalar: &str) -> Option<f64> {
    let unpositive = if let Some(unpositive) = scalar.strip_prefix('+') {
        if unpositive.starts_with(['+', '-']) {
            return None;
        }
        unpositive
    } else {
        scalar
    };
    if let ".inf" | ".Inf" | ".INF" = unpositive {
        return Some(f64::INFINITY);
    }
    if let "-.inf" | "-.Inf" | "-.INF" = scalar {
        return Some(f64::NEG_INFINITY);
    }
    if let ".nan" | ".NaN" | ".NAN" = scalar {
        return Some(f64::NAN.copysign(1.0));
    }
    if let Ok(float) = unpositive.parse::<f64>() {
        if float.is_finite() {
            return Some(float);
        }
    }
    None
}

pub(crate) fn digits_but_not_number(scalar: &str) -> bool {
    // Leading zero(s) followed by numeric characters is a string according to
    // the YAML 1.2 spec. https://yaml.org/spec/1.2/spec.html#id2761292
    let scalar = scalar.strip_prefix(['-', '+']).unwrap_or(scalar);
    scalar.len() > 1 && scalar.starts_with('0') && scalar[1..].bytes().all(|b| b.is_ascii_digit())
}

pub(crate) fn visit_int<'de, V>(visitor: V, v: &str) -> Result<Result<V::Value>, V>
where
    V: Visitor<'de>,
{
    if let Some(int) = parse_unsigned_int(v, u64::from_str_radix) {
        return Ok(visitor.visit_u64(int));
    }
    if let Some(int) = parse_negative_int(v, i64::from_str_radix) {
        return Ok(visitor.visit_i64(int));
    }
    if let Some(int) = parse_unsigned_int(v, u128::from_str_radix) {
        return Ok(visitor.visit_u128(int));
    }
    if let Some(int) = parse_negative_int(v, i128::from_str_radix) {
        return Ok(visitor.visit_i128(int));
    }
    Err(visitor)
}
