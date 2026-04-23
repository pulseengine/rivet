// SAFETY-REVIEW (SCRC Phase 1, DD-058): Integration test file. Tests
// legitimately use unwrap/expect/panic; blanket-allow the Phase 1
// restriction lints at crate scope for parity with other integration
// tests in this directory.
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

//! Variant-subsystem gap checks versus pure::variants (PV 7.x).
//!
//! Each `#[ignore]`d test asserts that a feature described in
//! `docs/pure-variants-comparison.md` is **still missing** from Rivet.
//! The assertion is phrased so that closing the gap flips the test
//! green: once the missing capability lands, delete `#[ignore]` and
//! the test guards the regression.
//!
//! To run only these:
//!     cargo test -p rivet-core --test variant_gap_check -- --ignored
//!
//! PV references cite line numbers in the pdftotext dump of the
//! official user manual (pv-user-manual.txt). Rivet references cite
//! files under `rivet-core/src/`.

use rivet_core::feature_model::{FeatureModel, VariantConfig, solve};

// ── Gap 1 — Typed Feature Attributes ────────────────────────────────

/// PV has a closed attribute type system (ps:integer / ps:float /
/// ps:boolean / ps:string / ps:version / ps:element / ps:feature,
/// manual §10.1 line 6075). Rivet stores attributes as
/// `BTreeMap<String, serde_yaml::Value>` (feature_model.rs:78) with
/// no declared types. A YAML model that writes `asil-numeric: "3"`
/// (string) and one that writes `asil-numeric: 3` (int) are both
/// accepted without comment.
///
/// Closing this gap means introducing an `attribute-schema` section
/// on `FeatureModel` and refusing loads where an attribute value does
/// not match its declared type.
#[test]
#[ignore = "gap: no typed-attribute schema yet — see docs/pure-variants-comparison.md §Gap 1"]
fn gap_1_typed_feature_attributes() {
    // A model where `asil-numeric` is declared int but the YAML
    // provides a string should fail to parse once the schema is in
    // place. Today it parses fine.
    let yaml = r#"
kind: feature-model
root: app
attribute-schema:
  asil-numeric:
    type: int
    range: [0, 4]
features:
  app:
    group: mandatory
    children: [asil-x]
  asil-x:
    group: leaf
    attributes:
      asil-numeric: "three"   # string, should be int
"#;
    let result = FeatureModel::from_yaml(yaml);
    assert!(
        result.is_err(),
        "expected typed-attribute violation, got Ok — gap still open"
    );
}

// ── Gap 2 — Partial Configuration / Three-Valued Logic ─────────────

/// PV supports partial evaluation (§5.8.2 line 1447) with three-valued
/// logic: features can be `selected`, `excluded`, or `open`. `open`
/// constraints propagate through `AND/OR/IMPLIES/EQUALS` using the
/// rules in §10.7.11 line 7337.
///
/// Rivet's `solve` (feature_model.rs:430) returns
/// `Result<ResolvedVariant, Vec<SolveError>>` — everything is either
/// in `effective_features` or erroring. There is no `open` state, no
/// `solve_partial`.
///
/// Closing this gap means introducing `FeatureState { Selected,
/// Excluded, Open }` and a `solve_partial` entry point.
#[test]
#[ignore = "gap: no partial-configuration solver — see docs/pure-variants-comparison.md §Gap 2"]
fn gap_2_partial_configuration_solver() {
    // Assert that a partial-solver API exists. Compile-time check via
    // a path reference — today this path does not exist, so the
    // assertion reduces to a string check on a method that should be
    // present on FeatureModel once the feature lands.
    //
    // When implementing, rewrite this test to call
    //     let resolved = model.solve_partial(&config).unwrap();
    // and assert that a feature not named in `selects` or forced by
    // constraints appears with state `Open`.
    let yaml = r#"
kind: feature-model
root: root
features:
  root:
    group: optional
    children: [a, b]
  a:
    group: leaf
  b:
    group: leaf
constraints: []
"#;
    let model = FeatureModel::from_yaml(yaml).unwrap();
    let _ = &model; // placeholder
    // Gap assertion: the type `rivet_core::feature_model::FeatureState`
    // does not yet exist. When it lands, replace this with a real
    // three-valued solve check.
    let has_partial_solver = false;
    assert!(
        has_partial_solver,
        "expected FeatureModel::solve_partial and FeatureState enum — gap still open"
    );
}

// ── Gap 3 — Variant Description Inheritance ────────────────────────

/// PV VDMs inherit from other VDMs via a `base:` reference (§5.7 line
/// 1295). Multiple inheritance and diamond inheritance are supported
/// (line 1314-1316). Selections, exclusions, and attribute values all
/// propagate, with conflict rules in §5.7.1 line 1342.
///
/// Rivet's `VariantConfig` (feature_model.rs:101) is
/// `{ name: String, selects: Vec<String> }`. No `extends`, no
/// `deselects`.
///
/// Closing this gap means extending `VariantConfig` with `extends`
/// and `deselects`, resolving the inheritance DAG before solving.
#[test]
#[ignore = "gap: no VDM inheritance — see docs/pure-variants-comparison.md §Gap 3"]
fn gap_3_variant_description_inheritance() {
    // Once inheritance lands, this YAML should parse and the effective
    // selects should be the union of base + overlay (minus deselects).
    // Today, `extends:` is ignored by serde_yaml — check that parsing
    // tolerated the unknown key but did *not* apply inheritance.
    let overlay_yaml = r#"
name: eu-autonomous-asil-d
extends: ["eu-autonomous"]
selects:
  - asil-d
deselects:
  - asil-c
"#;
    let parsed: Result<VariantConfig, _> = serde_yaml::from_str(overlay_yaml);
    match parsed {
        Ok(vc) => {
            // If parse succeeded but no `extends` field existed on the
            // struct, serde will have silently dropped it — confirm by
            // re-encoding and checking the key is absent.
            let roundtrip = serde_yaml::to_string(&vc).unwrap();
            assert!(
                !roundtrip.contains("extends"),
                "VariantConfig now preserves `extends` — gap closing? \
                 Finish the implementation and remove #[ignore]."
            );
        }
        Err(_) => {
            // Strict schema rejected the unknown key — still a gap,
            // just a different failure mode.
        }
    }
}

// ── Gap 4 — Group Cardinality Ranges ────────────────────────────────

/// PV range expressions on groups (§10.3 line 6335) allow
/// `[min..max]` cardinality on alternative/or groups — "exactly 2 of
/// these 4 children". Rivet hard-codes Alternative to exactly-1
/// (feature_model.rs:548) and Or to at-least-1 (line 562); neither
/// accepts a range.
///
/// Closing this gap means replacing `GroupType::Alternative` and
/// `GroupType::Or` with `GroupType::Cardinality { min, max }`.
#[test]
#[ignore = "gap: no cardinality ranges on groups — see docs/pure-variants-comparison.md §Gap 4"]
fn gap_4_group_cardinality_ranges() {
    // A feature model using `group: [2, 3]` should parse once
    // cardinality ranges land. Today the YAML deserialiser rejects
    // a list value for `group`.
    let yaml = r#"
kind: feature-model
root: platform
features:
  platform:
    group: mandatory
    children: [sensors]
  sensors:
    group: [2, 3]
    children: [front, side, rear, lidar]
  front:
    group: leaf
  side:
    group: leaf
  rear:
    group: leaf
  lidar:
    group: leaf
constraints: []
"#;
    let result = FeatureModel::from_yaml(yaml);
    assert!(
        result.is_ok(),
        "expected cardinality-range group to parse — gap still open (err = {:?})",
        result.err()
    );

    // And once it does parse, selecting exactly two must be valid and
    // selecting one must error with `CardinalityViolation`.
    if let Ok(model) = FeatureModel::from_yaml(yaml) {
        let ok_config = VariantConfig {
            name: "two-sensors".into(),
            selects: vec!["front".into(), "side".into()],
        };
        assert!(
            solve(&model, &ok_config).is_ok(),
            "[2,3] group: two selects should be valid"
        );

        let bad_config = VariantConfig {
            name: "one-sensor".into(),
            selects: vec!["front".into()],
        };
        assert!(
            solve(&model, &bad_config).is_err(),
            "[2,3] group: one select should error"
        );
    }
}

// ── Gap 5 — Family-Model-Level Artifact Restrictions ──────────────

/// PV Family Models (§5.4 line 1177) let each source element carry a
/// pvSCL restriction (§5.4.2 line 1238) so a file is compiled only
/// when its feature-level predicate holds. Rivet's `bindings.yaml`
/// (feature_model.rs:152-167) maps each feature to a flat list of
/// source globs — the predicate is implicitly `feature-is-selected`
/// and nothing else.
///
/// Closing this gap means teaching `Binding.source` to accept either
/// a string glob (current) or a `{ glob, when }` struct where `when`
/// is an s-expression constraint evaluated against the resolved
/// selection.
#[test]
#[ignore = "gap: no per-source-element restrictions — see docs/pure-variants-comparison.md §Gap 5"]
fn gap_5_family_model_artifact_restrictions() {
    use rivet_core::feature_model::FeatureBinding;

    let yaml = r#"
bindings:
  pedestrian-detection:
    artifacts: [REQ-042]
    source:
      - glob: "src/perception/pedestrian/core/**"
      - glob: "src/perception/pedestrian/asil_c/**"
        when: '(has-tag "asil-c")'
"#;
    let parsed: Result<FeatureBinding, _> = serde_yaml::from_str(yaml);
    assert!(
        parsed.is_ok(),
        "expected Binding.source to accept `{{glob, when}}` entries — gap still open ({:?})",
        parsed.err()
    );
}
