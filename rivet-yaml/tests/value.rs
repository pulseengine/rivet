// SAFETY-REVIEW (SCRC Phase 1, DD-058): Integration test code.
// Tests legitimately use unwrap/expect/panic/assert-indexing patterns
// because a test failure should panic with a clear stack. Blanket-allow
// the Phase 1 restriction lints at crate scope; real risk analysis for
// these lints is carried by production code, not by the test harnesses.
#![allow(
    clippy::unwrap_used,
    clippy::expect_used,
    clippy::indexing_slicing,
    clippy::arithmetic_side_effects,
    clippy::as_conversions,
    clippy::panic,
    clippy::print_stdout,
    clippy::print_stderr,
    clippy::derive_partial_eq_without_eq,
    clippy::eq_op,
    clippy::uninlined_format_args,
    // Upstream line kept verbatim; the lint postdates serde_yaml 0.9.34.
    clippy::needless_borrows_for_generic_args
)]

//! Upstream `serde_yaml` 0.9.34 `tests/test_value.rs`, ported (REQ-346).
//!
//! The value model in this crate is a port of `serde_yaml`'s, so upstream's
//! own value tests are its specification. Changes from upstream, and nothing
//! else: `serde_yaml::` paths are `rivet_yaml::`; `indoc!` literals are
//! written out already dedented (no new dev-dependency); `serde_derive`
//! imports come from `serde`.
//!
//! Parsing still delegates to `serde_yaml` (step 2). When rivet's own parser
//! replaces the delegate it will refuse anchors, aliases, merge keys and tags,
//! so `test_merge`, `test_debug` and `test_tagged` will have to build their
//! input `Value`s directly rather than parse them. Change the input, never
//! the assertion.

use rivet_yaml::{Number, Value};
use serde::de::IntoDeserializer;
use serde::{Deserialize, Serialize};

#[test]
fn test_nan() {
    let pos_nan = rivet_yaml::from_str::<Value>(".nan").unwrap();
    assert!(pos_nan.is_f64());
    assert_eq!(pos_nan, pos_nan);

    let neg_fake_nan = rivet_yaml::from_str::<Value>("-.nan").unwrap();
    assert!(neg_fake_nan.is_string());

    let significand_mask = 0xF_FFFF_FFFF_FFFF;
    let bits = (f64::NAN.copysign(1.0).to_bits() ^ significand_mask) | 1;
    let different_pos_nan = Value::Number(Number::from(f64::from_bits(bits)));
    assert_eq!(pos_nan, different_pos_nan);
}

#[test]
fn test_digits() {
    let num_string = rivet_yaml::from_str::<Value>("01").unwrap();
    assert!(num_string.is_string());
}

#[test]
fn test_into_deserializer() {
    #[derive(Debug, Deserialize, PartialEq)]
    struct Test {
        first: String,
        second: u32,
    }

    let value = rivet_yaml::from_str::<Value>("xyz").unwrap();
    let s = String::deserialize(value.into_deserializer()).unwrap();
    assert_eq!(s, "xyz");

    let value = rivet_yaml::from_str::<Value>("- first\n- second\n- third").unwrap();
    let arr = Vec::<String>::deserialize(value.into_deserializer()).unwrap();
    assert_eq!(arr, &["first", "second", "third"]);

    let value = rivet_yaml::from_str::<Value>("first: abc\nsecond: 99").unwrap();
    let test = Test::deserialize(value.into_deserializer()).unwrap();
    assert_eq!(
        test,
        Test {
            first: "abc".to_string(),
            second: 99
        }
    );
}

#[test]
fn test_merge() {
    // From https://yaml.org/type/merge.html.
    let yaml = "---
- &CENTER { x: 1, y: 2 }
- &LEFT { x: 0, y: 2 }
- &BIG { r: 10 }
- &SMALL { r: 1 }

# All the following maps are equal:

- # Explicit keys
  x: 1
  y: 2
  r: 10
  label: center/big

- # Merge one map
  << : *CENTER
  r: 10
  label: center/big

- # Merge multiple maps
  << : [ *CENTER, *BIG ]
  label: center/big

- # Override
  << : [ *BIG, *LEFT, *SMALL ]
  x: 1
  label: center/big
";

    let mut value: Value = rivet_yaml::from_str(yaml).unwrap();
    value.apply_merge().unwrap();
    for i in 5..=7 {
        assert_eq!(value[4], value[i]);
    }
}

#[test]
fn test_debug() {
    let yaml = "'Null': ~
Bool: true
Number: 1
String: ...
Sequence:
  - true
EmptySequence: []
EmptyMapping: {}
Tagged: !tag true
";

    let value: Value = rivet_yaml::from_str(yaml).unwrap();
    let debug = format!("{:#?}", value);

    let expected = r#"Mapping {
    "Null": Null,
    "Bool": Bool(true),
    "Number": Number(1),
    "String": String("..."),
    "Sequence": Sequence [
        Bool(true),
    ],
    "EmptySequence": Sequence [],
    "EmptyMapping": Mapping {},
    "Tagged": TaggedValue {
        tag: !tag,
        value: Bool(true),
    },
}"#;

    assert_eq!(debug, expected);
}

#[test]
fn test_tagged() {
    #[derive(Serialize)]
    enum Enum {
        Variant(usize),
    }

    let value = rivet_yaml::to_value(&Enum::Variant(0)).unwrap();

    let deserialized: rivet_yaml::Value = rivet_yaml::from_value(value.clone()).unwrap();
    assert_eq!(value, deserialized);

    let serialized = rivet_yaml::to_value(&value).unwrap();
    assert_eq!(value, serialized);
}
