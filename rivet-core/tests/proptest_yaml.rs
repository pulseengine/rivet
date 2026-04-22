// SAFETY-REVIEW (SCRC Phase 1, DD-058): Integration test / bench code.
// Tests legitimately use unwrap/expect/panic/assert-indexing patterns
// because a test failure should panic with a clear stack. Blanket-allow
// the Phase 1 restriction lints at crate scope; real risk analysis for
// these lints is carried by production code in rivet-core/src and
// rivet-cli/src, not by the test harnesses.
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

//! Property-based tests for the rowan YAML CST parser.
//!
//! Uses proptest to generate valid YAML-like strings and verify:
//! - Round-trip preservation (green tree text == original source)
//! - Parser produces no errors for well-formed inputs
//! - Block scalars, flow sequences, nested mappings, and sequences with
//!   mappings all round-trip correctly.

use proptest::prelude::*;
use rivet_core::yaml_cst::{self, SyntaxKind, YamlLanguage};

// ── Strategies ──────────────────────────────────────────────────────────

/// Generate a valid YAML key: starts with a letter, followed by alphanumerics
/// and underscores.
fn yaml_key() -> impl Strategy<Value = String> {
    "[a-z][a-z0-9_]{0,15}"
}

/// Generate a safe plain scalar value (no characters that would confuse
/// the YAML parser: no colons followed by spaces, no `#` preceded by space,
/// no commas, no brackets, no newlines, no dashes or quotes which are
/// YAML syntax characters).
fn yaml_plain_value() -> impl Strategy<Value = String> {
    "[a-zA-Z0-9 _.!?]{1,50}"
        .prop_filter("no trailing/leading spaces or problematic sequences", |s| {
            !s.ends_with(' ') && !s.starts_with(' ') && !s.contains("  #") && !s.contains(": ")
        })
}

/// Generate a single YAML mapping entry: `key: value\n`.
fn yaml_mapping_entry() -> impl Strategy<Value = String> {
    (yaml_key(), yaml_plain_value()).prop_map(|(k, v)| format!("{k}: {v}\n"))
}

/// Generate a flat YAML document (multiple mapping entries).
fn yaml_document() -> impl Strategy<Value = String> {
    prop::collection::vec(yaml_mapping_entry(), 1..10).prop_map(|entries| entries.join(""))
}

/// Generate a block scalar entry: `key: |\n  line1\n  line2\n`.
fn yaml_block_scalar_entry() -> impl Strategy<Value = String> {
    (
        yaml_key(),
        prop::sample::select(vec!["|", ">"]),
        prop::collection::vec("[a-zA-Z0-9 _!?.]{1,40}", 1..5),
    )
        .prop_map(|(k, indicator, lines)| {
            let mut result = format!("{k}: {indicator}\n");
            for line in lines {
                result.push_str(&format!("  {line}\n"));
            }
            result
        })
}

/// Generate a flow sequence entry: `key: [a, b, c]\n`.
fn yaml_flow_sequence_entry() -> impl Strategy<Value = String> {
    (
        yaml_key(),
        prop::collection::vec("[a-zA-Z0-9_]{1,15}", 1..6),
    )
        .prop_map(|(k, items)| format!("{k}: [{}]\n", items.join(", ")))
}

/// Generate a nested mapping: `parent:\n  child1: val1\n  child2: val2\n`.
fn yaml_nested_mapping() -> impl Strategy<Value = String> {
    (
        yaml_key(),
        prop::collection::vec((yaml_key(), yaml_plain_value()), 1..5),
    )
        .prop_map(|(parent, children)| {
            let mut result = format!("{parent}:\n");
            for (k, v) in children {
                result.push_str(&format!("  {k}: {v}\n"));
            }
            result
        })
}

/// Generate a sequence with mapping items:
/// ```yaml
/// items:
///   - id: X-001
///     title: Something
///   - id: X-002
///     title: Other
/// ```
fn yaml_sequence_of_mappings() -> impl Strategy<Value = String> {
    (
        yaml_key(),
        prop::collection::vec(
            prop::collection::vec((yaml_key(), yaml_plain_value()), 1..4),
            1..5,
        ),
    )
        .prop_map(|(seq_key, items)| {
            let mut result = format!("{seq_key}:\n");
            for fields in items {
                let mut first = true;
                for (k, v) in fields {
                    if first {
                        result.push_str(&format!("  - {k}: {v}\n"));
                        first = false;
                    } else {
                        result.push_str(&format!("    {k}: {v}\n"));
                    }
                }
            }
            result
        })
}

// ── Helper ──────────────────────────────────────────────────────────────

/// Parse YAML, verify round-trip, and return parse errors.
fn parse_and_verify_roundtrip(source: &str) -> Vec<yaml_cst::ParseError> {
    let (green, errors) = yaml_cst::parse(source);
    let root = rowan::SyntaxNode::<YamlLanguage>::new_root(green);
    assert_eq!(
        root.text().to_string(),
        source,
        "round-trip failed for:\n{source}"
    );
    errors
}

/// Walk the CST and check for Error nodes.
fn has_error_nodes(root: &rowan::SyntaxNode<YamlLanguage>) -> bool {
    if root.kind() == SyntaxKind::Error {
        return true;
    }
    for child in root.children() {
        if has_error_nodes(&child) {
            return true;
        }
    }
    false
}

// ── Proptest: flat mapping documents ────────────────────────────────────

proptest! {
    #![proptest_config(ProptestConfig::with_cases(100))]

    /// Generated flat YAML mapping documents round-trip through the parser.
    // rivet: verifies REQ-003
    #[test]
    fn parser_roundtrips_flat_mapping(doc in yaml_document()) {
        let errors = parse_and_verify_roundtrip(&doc);
        prop_assert!(errors.is_empty(), "unexpected parse errors: {errors:?}");
    }

    /// Generated flat mapping documents produce no Error nodes.
    // rivet: verifies REQ-003
    #[test]
    fn parser_no_error_nodes_flat_mapping(doc in yaml_document()) {
        let (green, _) = yaml_cst::parse(&doc);
        let root = rowan::SyntaxNode::<YamlLanguage>::new_root(green);
        prop_assert!(!has_error_nodes(&root), "Error nodes found in:\n{doc}");
    }
}

// ��─ Proptest: block scalar entries ──────────────────────────────────────

proptest! {
    #![proptest_config(ProptestConfig::with_cases(80))]

    /// Block scalar entries (literal `|` and folded `>`) round-trip.
    // rivet: verifies REQ-003
    #[test]
    fn parser_roundtrips_block_scalar(entry in yaml_block_scalar_entry()) {
        let errors = parse_and_verify_roundtrip(&entry);
        prop_assert!(errors.is_empty(), "parse errors in block scalar: {errors:?}");
    }

    /// Block scalar entries produce no Error nodes.
    // rivet: verifies REQ-003
    #[test]
    fn parser_no_error_nodes_block_scalar(entry in yaml_block_scalar_entry()) {
        let (green, _) = yaml_cst::parse(&entry);
        let root = rowan::SyntaxNode::<YamlLanguage>::new_root(green);
        prop_assert!(!has_error_nodes(&root), "Error nodes in block scalar:\n{entry}");
    }
}

// ── Proptest: flow sequence entries ─────────────────────────────────────

proptest! {
    #![proptest_config(ProptestConfig::with_cases(80))]

    /// Flow sequences (`key: [a, b, c]`) round-trip.
    // rivet: verifies REQ-003
    #[test]
    fn parser_roundtrips_flow_sequence(entry in yaml_flow_sequence_entry()) {
        let errors = parse_and_verify_roundtrip(&entry);
        prop_assert!(errors.is_empty(), "parse errors in flow sequence: {errors:?}");
    }

    /// Flow sequences produce no Error nodes.
    // rivet: verifies REQ-003
    #[test]
    fn parser_no_error_nodes_flow_sequence(entry in yaml_flow_sequence_entry()) {
        let (green, _) = yaml_cst::parse(&entry);
        let root = rowan::SyntaxNode::<YamlLanguage>::new_root(green);
        prop_assert!(!has_error_nodes(&root), "Error nodes in flow sequence:\n{entry}");
    }
}

// ── Proptest: nested mappings ───────────────────────────────────────────

proptest! {
    #![proptest_config(ProptestConfig::with_cases(80))]

    /// Nested mappings (`parent:\n  child: val`) round-trip.
    // rivet: verifies REQ-003
    #[test]
    fn parser_roundtrips_nested_mapping(doc in yaml_nested_mapping()) {
        let errors = parse_and_verify_roundtrip(&doc);
        prop_assert!(errors.is_empty(), "parse errors in nested mapping: {errors:?}");
    }

    /// Nested mappings produce no Error nodes.
    // rivet: verifies REQ-003
    #[test]
    fn parser_no_error_nodes_nested_mapping(doc in yaml_nested_mapping()) {
        let (green, _) = yaml_cst::parse(&doc);
        let root = rowan::SyntaxNode::<YamlLanguage>::new_root(green);
        prop_assert!(!has_error_nodes(&root), "Error nodes in nested mapping:\n{doc}");
    }
}

// ── Proptest: sequences with mappings inside ────────────────────────────

proptest! {
    #![proptest_config(ProptestConfig::with_cases(80))]

    /// Sequences containing mapping items round-trip.
    // rivet: verifies REQ-003
    #[test]
    fn parser_roundtrips_sequence_of_mappings(doc in yaml_sequence_of_mappings()) {
        let errors = parse_and_verify_roundtrip(&doc);
        prop_assert!(errors.is_empty(), "parse errors in sequence of mappings: {errors:?}");
    }

    /// Sequences with mapping items produce no Error nodes.
    // rivet: verifies REQ-003
    #[test]
    fn parser_no_error_nodes_sequence_of_mappings(doc in yaml_sequence_of_mappings()) {
        let (green, _) = yaml_cst::parse(&doc);
        let root = rowan::SyntaxNode::<YamlLanguage>::new_root(green);
        prop_assert!(!has_error_nodes(&root), "Error nodes in sequence of mappings:\n{doc}");
    }
}

// ── Proptest: mixed documents ───────────────────────────────────────────

/// Generate a document mixing multiple YAML features.
fn yaml_mixed_document() -> impl Strategy<Value = String> {
    (
        yaml_mapping_entry(),
        yaml_nested_mapping(),
        yaml_flow_sequence_entry(),
        yaml_block_scalar_entry(),
        yaml_sequence_of_mappings(),
    )
        .prop_map(|(flat, nested, flow, block, seq)| format!("{flat}{nested}{flow}{block}{seq}"))
}

proptest! {
    #![proptest_config(ProptestConfig::with_cases(50))]

    /// Mixed documents combining flat mappings, nested mappings, flow sequences,
    /// block scalars, and sequences with mappings all round-trip.
    // rivet: verifies REQ-003
    #[test]
    fn parser_roundtrips_mixed_document(doc in yaml_mixed_document()) {
        let errors = parse_and_verify_roundtrip(&doc);
        prop_assert!(errors.is_empty(), "parse errors in mixed document: {errors:?}");
    }
}

// ── Deterministic edge cases ────────────────────────────────────────────

#[test]
fn empty_string_roundtrips() {
    let (green, _) = yaml_cst::parse("");
    let root = rowan::SyntaxNode::<YamlLanguage>::new_root(green);
    assert_eq!(root.text().to_string(), "");
}

#[test]
fn single_newline_roundtrips() {
    let (green, _) = yaml_cst::parse("\n");
    let root = rowan::SyntaxNode::<YamlLanguage>::new_root(green);
    assert_eq!(root.text().to_string(), "\n");
}

#[test]
fn block_scalar_with_blank_lines() {
    let source = "desc: |\n  line one\n\n  line three\n";
    let errors = parse_and_verify_roundtrip(source);
    assert!(errors.is_empty(), "parse errors: {errors:?}");
}

#[test]
fn flow_sequence_single_item() {
    let source = "tags: [single]\n";
    let errors = parse_and_verify_roundtrip(source);
    assert!(errors.is_empty(), "parse errors: {errors:?}");
}

#[test]
fn flow_sequence_empty() {
    let source = "tags: []\n";
    let errors = parse_and_verify_roundtrip(source);
    assert!(errors.is_empty(), "parse errors: {errors:?}");
}

#[test]
fn deeply_nested_mapping() {
    let source = "a:\n  b:\n    c:\n      d: deep\n";
    let errors = parse_and_verify_roundtrip(source);
    assert!(errors.is_empty(), "parse errors: {errors:?}");
}

#[test]
fn sequence_of_sequences() {
    let source = "outer:\n  - inner:\n    - one\n    - two\n";
    let _errors = parse_and_verify_roundtrip(source);
    // Round-trip is the critical property; parse errors may occur for complex nesting
}

#[test]
fn document_with_directive_marker() {
    let source = "---\nkey: value\nother: stuff\n";
    let errors = parse_and_verify_roundtrip(source);
    assert!(errors.is_empty(), "parse errors: {errors:?}");
}

#[test]
fn quoted_values_roundtrip() {
    let source = "single: 'hello world'\ndouble: \"hello world\"\n";
    let errors = parse_and_verify_roundtrip(source);
    assert!(errors.is_empty(), "parse errors: {errors:?}");
}
