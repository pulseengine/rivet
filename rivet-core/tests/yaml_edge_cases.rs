//! YAML parsing edge-case tests.
//!
//! These tests exercise known pitfalls in YAML parsing as handled by
//! `serde_yaml` 0.9 (which uses YAML 1.2 rules), particularly around
//! boolean coercion, duplicate keys, and numeric string handling.
//! They document the actual behavior so regressions are caught if the
//! underlying YAML library changes.

use rivet_core::formats::generic::parse_generic_yaml;

// ── Boolean coercion (YAML 1.2 vs 1.1) ────────────────────────────────

/// In YAML 1.1, bare `yes` was coerced to boolean `true` (the "Norway
/// problem"). serde_yaml 0.9 uses YAML 1.2, where `yes` is just a
/// string. This test verifies that rivet's YAML parser does NOT coerce
/// `yes` to a boolean — if this ever breaks, it means the parser has
/// regressed to YAML 1.1 semantics.
#[test]
fn priority_yes_is_string_not_boolean() {
    let yaml = r#"
artifacts:
  - id: REQ-001
    type: requirement
    title: Boolean coercion test
    fields:
      priority: yes
"#;

    let artifacts = parse_generic_yaml(yaml, None).expect("should parse");
    assert_eq!(artifacts.len(), 1);
    let priority = artifacts[0]
        .fields
        .get("priority")
        .expect("field 'priority' must exist");

    // serde_yaml 0.9 (YAML 1.2): `yes` stays a string, not coerced to bool.
    assert!(
        priority.is_string(),
        "bare `yes` should stay a string in YAML 1.2, got: {priority:?}"
    );
    assert_eq!(priority.as_str(), Some("yes"));
}

/// Quoting the value also keeps it as a string (same result in YAML 1.2).
#[test]
fn priority_quoted_yes_stays_string() {
    let yaml = r#"
artifacts:
  - id: REQ-002
    type: requirement
    title: Quoted yes test
    fields:
      priority: "yes"
"#;

    let artifacts = parse_generic_yaml(yaml, None).expect("should parse");
    let priority = artifacts[0]
        .fields
        .get("priority")
        .expect("field 'priority' must exist");

    assert!(
        priority.is_string(),
        "quoted 'yes' should remain a string, got: {priority:?}"
    );
    assert_eq!(priority.as_str(), Some("yes"));
}

/// In YAML 1.2, bare `no` is a string, not boolean false.
#[test]
fn field_no_is_string_not_boolean() {
    let yaml = r#"
artifacts:
  - id: REQ-003
    type: requirement
    title: Boolean no test
    fields:
      safety-relevant: no
"#;

    let artifacts = parse_generic_yaml(yaml, None).expect("should parse");
    let field = artifacts[0]
        .fields
        .get("safety-relevant")
        .expect("field must exist");

    assert!(
        field.is_string(),
        "bare `no` should stay a string in YAML 1.2, got: {field:?}"
    );
    assert_eq!(field.as_str(), Some("no"));
}

/// In YAML 1.2, `on`/`off` are strings, not booleans.
#[test]
fn field_on_off_are_strings() {
    let yaml = r#"
artifacts:
  - id: REQ-004
    type: requirement
    title: On/off test
    fields:
      feature-flag: on
      legacy-mode: off
"#;

    let artifacts = parse_generic_yaml(yaml, None).expect("should parse");
    let on_val = &artifacts[0].fields["feature-flag"];
    let off_val = &artifacts[0].fields["legacy-mode"];

    assert!(
        on_val.is_string(),
        "bare `on` should be a string in YAML 1.2, got: {on_val:?}"
    );
    assert_eq!(on_val.as_str(), Some("on"));

    assert!(
        off_val.is_string(),
        "bare `off` should be a string in YAML 1.2, got: {off_val:?}"
    );
    assert_eq!(off_val.as_str(), Some("off"));
}

/// Only `true`/`false` are booleans in YAML 1.2.
#[test]
fn true_false_are_booleans() {
    let yaml = r#"
artifacts:
  - id: REQ-005
    type: requirement
    title: True/false test
    fields:
      flag-a: true
      flag-b: false
"#;

    let artifacts = parse_generic_yaml(yaml, None).expect("should parse");
    let a = &artifacts[0].fields["flag-a"];
    let b = &artifacts[0].fields["flag-b"];

    assert!(a.is_bool(), "bare `true` should be boolean, got: {a:?}");
    assert_eq!(a.as_bool(), Some(true));
    assert!(b.is_bool(), "bare `false` should be boolean, got: {b:?}");
    assert_eq!(b.as_bool(), Some(false));
}

// ── Duplicate keys ─────────────────────────────────────────────────────

/// Duplicate keys in the `fields` BTreeMap: serde_yaml silently keeps
/// the last value. This is a data-loss risk — document the behavior.
#[test]
fn duplicate_field_keys_last_value_wins() {
    let yaml = r#"
artifacts:
  - id: REQ-010
    type: requirement
    title: Duplicate field test
    fields:
      priority: high
      priority: low
"#;

    let artifacts = parse_generic_yaml(yaml, None).expect("should parse");
    let priority = artifacts[0]
        .fields
        .get("priority")
        .expect("field must exist");

    // serde_yaml keeps the last occurrence for map values
    assert_eq!(
        priority.as_str(),
        Some("low"),
        "duplicate key should resolve to last value"
    );
}

/// Duplicate top-level struct keys (e.g., two `title:` fields) cause a
/// deserialization error in serde_yaml. This is stricter than the YAML
/// spec (which says the behavior is undefined) — document it.
#[test]
fn duplicate_struct_key_is_error() {
    let yaml = r#"
artifacts:
  - id: REQ-011
    type: requirement
    title: First title
    title: Second title
"#;

    let result = parse_generic_yaml(yaml, None);
    assert!(
        result.is_err(),
        "duplicate struct key (title) should produce a parse error"
    );
    let err_msg = result.unwrap_err().to_string();
    assert!(
        err_msg.contains("duplicate field"),
        "error message should mention duplicate field, got: {err_msg}"
    );
}

// ── Numeric string coercion ────────────────────────────────────────────

/// Bare `1.0` is parsed as a float, not a string. This is a footgun
/// when field values like version numbers are written without quotes.
#[test]
fn numeric_looking_field_parsed_as_number() {
    let yaml = r#"
artifacts:
  - id: REQ-020
    type: requirement
    title: Version field
    fields:
      version: 1.0
"#;

    let artifacts = parse_generic_yaml(yaml, None).expect("should parse");
    let version = &artifacts[0].fields["version"];

    // serde_yaml parses `1.0` as a float
    assert!(
        version.is_f64() || version.is_number(),
        "bare `1.0` should be parsed as a number, got: {version:?}"
    );
}

/// Quoting `1.0` keeps it as a string.
#[test]
fn quoted_version_stays_string() {
    let yaml = r#"
artifacts:
  - id: REQ-021
    type: requirement
    title: Quoted version field
    fields:
      version: "1.0"
"#;

    let artifacts = parse_generic_yaml(yaml, None).expect("should parse");
    let version = &artifacts[0].fields["version"];

    assert!(
        version.is_string(),
        "quoted '1.0' should remain a string, got: {version:?}"
    );
    assert_eq!(version.as_str(), Some("1.0"));
}

/// Bare integers in field values are parsed as integers.
#[test]
fn bare_integer_parsed_as_number() {
    let yaml = r#"
artifacts:
  - id: REQ-022
    type: requirement
    title: Integer field
    fields:
      count: 42
"#;

    let artifacts = parse_generic_yaml(yaml, None).expect("should parse");
    let count = &artifacts[0].fields["count"];

    assert!(
        count.is_u64() || count.is_i64() || count.is_number(),
        "bare `42` should be parsed as an integer, got: {count:?}"
    );
}

// ── Parse-error handling ───────────────────────────────────────────────

/// Completely invalid YAML should return an error, not panic.
#[test]
fn invalid_yaml_returns_error() {
    let yaml = "artifacts:\n  - id: [unclosed bracket\n    title: Bad";
    let result = parse_generic_yaml(yaml, None);
    assert!(result.is_err(), "invalid YAML should return Err");
}

/// Missing required fields (id, type, title) should produce a parse error.
#[test]
fn missing_required_fields_returns_error() {
    let yaml = r#"
artifacts:
  - id: REQ-030
    title: Missing type field
"#;

    let result = parse_generic_yaml(yaml, None);
    assert!(
        result.is_err(),
        "artifact missing 'type' field should be a parse error"
    );
}

/// An empty artifacts list should parse successfully and return no artifacts.
#[test]
fn empty_artifacts_list_parses_ok() {
    let yaml = "artifacts: []\n";
    let artifacts = parse_generic_yaml(yaml, None).expect("should parse");
    assert!(artifacts.is_empty());
}

/// Ensure multiline description is preserved correctly.
#[test]
fn multiline_description_preserved() {
    let yaml = r#"
artifacts:
  - id: REQ-040
    type: requirement
    title: Multiline test
    description: |
      This is a multiline
      description with YAML
      block scalar syntax.
"#;

    let artifacts = parse_generic_yaml(yaml, None).expect("should parse");
    let desc = artifacts[0]
        .description
        .as_ref()
        .expect("description must exist");
    assert!(
        desc.contains("multiline"),
        "description should contain 'multiline'"
    );
    assert!(desc.contains('\n'), "block scalar should preserve newlines");
}

/// A completely empty YAML document (no `artifacts` key) should fail.
#[test]
fn empty_document_returns_error() {
    let yaml = "---\n";
    let result = parse_generic_yaml(yaml, None);
    assert!(result.is_err(), "empty document should be an error");
}

/// A YAML key with a null value (`artifacts:` with no list) is treated
/// as an empty list by serde_yaml due to the default deserialization.
/// This test documents that it does NOT error — it returns zero artifacts.
#[test]
fn null_artifacts_returns_empty() {
    let yaml = "artifacts:\n";
    // serde_yaml deserializes null as the default (empty Vec)
    let artifacts = parse_generic_yaml(yaml, None).expect("should parse");
    assert!(
        artifacts.is_empty(),
        "null artifacts list should parse as empty"
    );
}
