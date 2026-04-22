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

//! Differential testing: rowan YAML parser vs serde_yaml.
//!
//! Generates random well-formed YAML artifact documents and parses them with
//! both our rowan-based parser (`yaml_hir::extract_generic_artifacts`) and
//! `serde_yaml`.  Any discrepancy between the two is a bug in one or the other.
//!
//! This is the rivet equivalent of gale's FFI model equivalence testing:
//! the rowan parser is our "implementation" and serde_yaml is the "reference model."

use proptest::prelude::*;
use rivet_core::yaml_hir::extract_generic_artifacts;

// ── Strategies ──────────────────────────────────────────────────────────

/// Generate a valid artifact ID: PREFIX-NNN.
fn arb_artifact_id() -> impl Strategy<Value = String> {
    (
        prop::sample::select(vec!["REQ", "FEAT", "DD", "TEST", "ARCH"]),
        1..999u32,
    )
        .prop_map(|(prefix, num)| format!("{prefix}-{num:03}"))
}

/// Generate a valid artifact type.
fn arb_artifact_type() -> impl Strategy<Value = String> {
    prop::sample::select(vec![
        "requirement".to_string(),
        "feature".to_string(),
        "design-decision".to_string(),
        "test-spec".to_string(),
    ])
}

/// Generate a safe plain scalar value for YAML (no special characters).
fn arb_safe_value() -> impl Strategy<Value = String> {
    "[a-zA-Z][a-zA-Z0-9 _.]{0,40}".prop_filter("no trailing spaces", |s| !s.ends_with(' '))
}

/// Generate optional status field.
fn arb_status() -> impl Strategy<Value = Option<String>> {
    prop::option::of(prop::sample::select(vec![
        "draft".to_string(),
        "approved".to_string(),
        "active".to_string(),
    ]))
}

/// Generate a single artifact as YAML text and its expected field values.
fn arb_artifact_yaml() -> impl Strategy<Value = (String, ExpectedArtifact)> {
    (
        arb_artifact_id(),
        arb_artifact_type(),
        arb_safe_value(),
        arb_status(),
    )
        .prop_map(|(id, atype, title, status)| {
            let mut yaml = format!("  - id: {id}\n    type: {atype}\n    title: {title}\n");
            if let Some(ref s) = status {
                yaml.push_str(&format!("    status: {s}\n"));
            }
            let expected = ExpectedArtifact {
                id,
                artifact_type: atype,
                title,
                status,
            };
            (yaml, expected)
        })
}

/// Expected artifact fields for comparison.
#[derive(Debug, Clone)]
struct ExpectedArtifact {
    id: String,
    artifact_type: String,
    title: String,
    status: Option<String>,
}

/// Generate a complete YAML document with N artifacts.
fn arb_yaml_document(
    n: std::ops::Range<usize>,
) -> impl Strategy<Value = (String, Vec<ExpectedArtifact>)> {
    prop::collection::vec(arb_artifact_yaml(), n).prop_map(|artifacts| {
        let mut yaml = "artifacts:\n".to_string();
        let mut expected = Vec::new();
        for (art_yaml, art_expected) in artifacts {
            yaml.push_str(&art_yaml);
            expected.push(art_expected);
        }
        (yaml, expected)
    })
}

// ── Differential tests ──────────────────────────────────────────────────

proptest! {
    #![proptest_config(ProptestConfig::with_cases(100))]

    /// Core differential test: both parsers must extract the same artifacts.
    #[test]
    fn rowan_matches_serde_yaml(
        (yaml, expected) in arb_yaml_document(1..8)
    ) {
        // --- Track 1: Our rowan parser ---
        let rowan_result = extract_generic_artifacts(&yaml);

        // --- Track 2: serde_yaml reference model ---
        let serde_result: serde_yaml::Value = serde_yaml::from_str(&yaml)
            .expect("serde_yaml must parse our generated YAML");
        let serde_artifacts = serde_result["artifacts"]
            .as_sequence()
            .expect("artifacts must be a sequence");

        // --- Differential comparison ---

        // Same number of artifacts
        prop_assert_eq!(
            rowan_result.artifacts.len(),
            serde_artifacts.len(),
            "artifact count mismatch: rowan={}, serde={}",
            rowan_result.artifacts.len(),
            serde_artifacts.len(),
        );

        prop_assert_eq!(
            rowan_result.artifacts.len(),
            expected.len(),
            "artifact count mismatch vs expected",
        );

        // No parse errors from rowan
        let errors: Vec<_> = rowan_result.diagnostics.iter()
            .filter(|d| matches!(d.severity, rivet_core::schema::Severity::Error))
            .collect();
        prop_assert!(
            errors.is_empty(),
            "rowan produced errors for valid YAML: {:?}",
            errors.iter().map(|d| &d.message).collect::<Vec<_>>(),
        );

        // Each artifact matches expected values
        for (i, (rowan_art, exp)) in rowan_result
            .artifacts
            .iter()
            .zip(expected.iter())
            .enumerate()
        {
            prop_assert!(
                rowan_art.artifact.id == exp.id,
                "artifact {}: ID mismatch: rowan={}, expected={}",
                i, rowan_art.artifact.id, exp.id,
            );
            prop_assert!(
                rowan_art.artifact.artifact_type == exp.artifact_type,
                "artifact {}: type mismatch: rowan={}, expected={}",
                i, rowan_art.artifact.artifact_type, exp.artifact_type,
            );
            prop_assert!(
                rowan_art.artifact.title == exp.title,
                "artifact {}: title mismatch: rowan={}, expected={}",
                i, rowan_art.artifact.title, exp.title,
            );
            prop_assert!(
                rowan_art.artifact.status == exp.status,
                "artifact {}: status mismatch: rowan={:?}, expected={:?}",
                i, rowan_art.artifact.status, exp.status,
            );

            // Also compare against serde_yaml extraction
            let serde_art = &serde_artifacts[i];
            let serde_id = serde_art["id"].as_str().unwrap_or("");
            let serde_type = serde_art["type"].as_str().unwrap_or("");
            let serde_title = serde_art["title"].as_str().unwrap_or("");

            prop_assert!(
                rowan_art.artifact.id == serde_id,
                "artifact {}: rowan ID ({}) != serde ID ({})",
                i, rowan_art.artifact.id, serde_id,
            );
            prop_assert!(
                rowan_art.artifact.artifact_type == serde_type,
                "artifact {}: rowan type ({}) != serde type ({})",
                i, rowan_art.artifact.artifact_type, serde_type,
            );
            prop_assert!(
                rowan_art.artifact.title == serde_title,
                "artifact {}: rowan title ({}) != serde title ({})",
                i, rowan_art.artifact.title, serde_title,
            );
        }
    }

    /// Verify rowan parser never panics on any generated YAML.
    #[test]
    fn rowan_parser_panic_freedom(
        (yaml, _) in arb_yaml_document(0..15)
    ) {
        // Must not panic regardless of input
        let _ = extract_generic_artifacts(&yaml);
    }

    /// Verify both parsers agree on empty artifact lists.
    #[test]
    fn empty_artifacts_agreement(
        header in "[a-z]{1,10}"
    ) {
        let yaml = format!("{header}:\n  - id: X-1\n    type: req\n    title: t\n");
        let rowan_result = extract_generic_artifacts(&yaml);
        // Non-"artifacts" key → rowan should find nothing
        if header != "artifacts" {
            prop_assert!(
                rowan_result.artifacts.is_empty(),
                "non-artifacts key '{}' should produce no artifacts",
                header,
            );
        }
    }
}

// ── Deterministic differential tests ────────────────────────────────────

#[test]
fn differential_basic_artifact() {
    let yaml = "\
artifacts:
  - id: REQ-001
    type: requirement
    title: Basic requirement
    status: approved
";
    let rowan = extract_generic_artifacts(yaml);
    let serde: serde_yaml::Value = serde_yaml::from_str(yaml).unwrap();

    assert_eq!(rowan.artifacts.len(), 1);
    assert_eq!(rowan.artifacts[0].artifact.id, "REQ-001");
    assert_eq!(
        rowan.artifacts[0].artifact.id,
        serde["artifacts"][0]["id"].as_str().unwrap()
    );
    assert_eq!(
        rowan.artifacts[0].artifact.title,
        serde["artifacts"][0]["title"].as_str().unwrap()
    );
}

#[test]
fn differential_multiple_artifacts() {
    let yaml = "\
artifacts:
  - id: REQ-001
    type: requirement
    title: First
  - id: REQ-002
    type: requirement
    title: Second
  - id: FEAT-001
    type: feature
    title: Third
";
    let rowan = extract_generic_artifacts(yaml);
    let serde: serde_yaml::Value = serde_yaml::from_str(yaml).unwrap();
    let serde_arts = serde["artifacts"].as_sequence().unwrap();

    assert_eq!(rowan.artifacts.len(), serde_arts.len());
    for (i, (r, s)) in rowan.artifacts.iter().zip(serde_arts.iter()).enumerate() {
        assert_eq!(
            r.artifact.id,
            s["id"].as_str().unwrap(),
            "artifact {i} ID mismatch"
        );
    }
}

#[test]
fn differential_with_links() {
    let yaml = "\
artifacts:
  - id: REQ-001
    type: requirement
    title: With links
    links:
      - type: satisfies
        target: SC-001
      - type: implements
        target: DD-001
";
    let rowan = extract_generic_artifacts(yaml);
    let serde: serde_yaml::Value = serde_yaml::from_str(yaml).unwrap();

    assert_eq!(rowan.artifacts.len(), 1);
    assert_eq!(rowan.artifacts[0].artifact.links.len(), 2);

    let serde_links = serde["artifacts"][0]["links"].as_sequence().unwrap();
    assert_eq!(rowan.artifacts[0].artifact.links.len(), serde_links.len());

    for (i, (r, s)) in rowan.artifacts[0]
        .artifact
        .links
        .iter()
        .zip(serde_links.iter())
        .enumerate()
    {
        assert_eq!(
            r.target,
            s["target"].as_str().unwrap(),
            "link {i} target mismatch"
        );
        assert_eq!(
            r.link_type,
            s["type"].as_str().unwrap(),
            "link {i} type mismatch"
        );
    }
}
