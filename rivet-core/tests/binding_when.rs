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

//! Coverage for Gap 5 — per-source `when:` clauses on `FeatureBinding`.
//!
//! Each test exercises one slice of the new behaviour:
//!   * static globs still parse (backward compat with v0.4.3 shape)
//!   * the `{ glob, when }` shape parses
//!   * an invalid sexpr in `when:` errors at solve time with the binding
//!     name + when text + parser error
//!   * a `when:` that evaluates to true keeps the glob in the manifest
//!   * a `when:` that evaluates to false drops the glob
//!   * `ResolvedVariant.source_manifest` is populated end-to-end for the
//!     example fixture under `examples/variant/`.

use std::path::PathBuf;

use rivet_core::feature_model::{
    Binding, FeatureBinding, FeatureModel, SourceEntry, VariantConfig, solve_with_bindings,
};

const VEHICLE_MODEL: &str = r#"
kind: feature-model
root: vehicle
features:
  vehicle:
    group: mandatory
    children: [engine, market]
  engine:
    group: alternative
    children: [petrol, electric]
  petrol:
    group: leaf
  electric:
    group: leaf
  market:
    group: alternative
    children: [eu, us]
  eu:
    group: leaf
  us:
    group: leaf
constraints: []
"#;

#[test]
fn legacy_string_globs_still_parse() {
    let yaml = r#"
bindings:
  pedestrian-detection:
    artifacts: [REQ-042]
    source:
      - "src/perception/pedestrian/**"
      - "src/perception/common/**"
"#;
    let binding: FeatureBinding =
        serde_yaml::from_str(yaml).expect("legacy bare-string source must parse");
    let pd = &binding.bindings["pedestrian-detection"];
    assert_eq!(pd.source.len(), 2);
    assert_eq!(pd.source[0].glob, "src/perception/pedestrian/**");
    assert!(pd.source[0].when.is_none());
    assert_eq!(pd.source[1].glob, "src/perception/common/**");
    assert!(pd.source[1].when.is_none());
}

#[test]
fn struct_form_with_when_parses() {
    let yaml = r#"
bindings:
  pedestrian-detection:
    artifacts: [REQ-042]
    source:
      - glob: src/perception/pedestrian/**
      - glob: src/perception/pedestrian/asil_d/**
        when: '(has-tag "asil-d")'
"#;
    let binding: FeatureBinding =
        serde_yaml::from_str(yaml).expect("struct-form source must parse");
    let pd = &binding.bindings["pedestrian-detection"];
    assert_eq!(pd.source.len(), 2);
    assert!(pd.source[0].when.is_none());
    assert_eq!(pd.source[1].when.as_deref(), Some(r#"(has-tag "asil-d")"#));
}

#[test]
fn mixed_legacy_and_struct_shapes_in_one_binding() {
    // Real users will migrate one entry at a time. Both shapes coexisting
    // in the same `source:` list must work without an explicit version
    // bump.
    let yaml = r#"
bindings:
  feat:
    source:
      - "always-here.rs"
      - { glob: "conditional.rs", when: "(has-tag \"electric\")" }
"#;
    let binding: FeatureBinding = serde_yaml::from_str(yaml).expect("mixed shape");
    let f = &binding.bindings["feat"];
    assert_eq!(f.source[0].glob, "always-here.rs");
    assert!(f.source[0].when.is_none());
    assert_eq!(f.source[1].glob, "conditional.rs");
    assert_eq!(f.source[1].when.as_deref(), Some(r#"(has-tag "electric")"#));
}

#[test]
fn when_true_keeps_glob() {
    let model = FeatureModel::from_yaml(VEHICLE_MODEL).unwrap();
    let mut bindings = std::collections::BTreeMap::new();
    bindings.insert(
        "electric".to_string(),
        Binding {
            artifacts: vec!["REQ-EL-001".into()],
            source: vec![
                SourceEntry {
                    glob: "src/electric/core/**".into(),
                    when: None,
                },
                SourceEntry {
                    glob: "src/electric/eu/**".into(),
                    when: Some(r#"(has-tag "eu")"#.into()),
                },
            ],
        },
    );
    let binding = FeatureBinding {
        bindings,
        variants: vec![],
    };
    let cfg = VariantConfig {
        name: "eu-electric".into(),
        selects: vec!["electric".into(), "eu".into()],
    };
    let resolved = solve_with_bindings(&model, &cfg, &binding).unwrap();
    let paths = resolved.source_manifest.get("electric").unwrap();
    assert!(paths.contains(&PathBuf::from("src/electric/core/**")));
    assert!(
        paths.contains(&PathBuf::from("src/electric/eu/**")),
        "(has-tag \"eu\") should be true when eu is selected"
    );
}

#[test]
fn when_false_drops_glob() {
    let model = FeatureModel::from_yaml(VEHICLE_MODEL).unwrap();
    let mut bindings = std::collections::BTreeMap::new();
    bindings.insert(
        "electric".to_string(),
        Binding {
            artifacts: vec![],
            source: vec![
                SourceEntry {
                    glob: "src/electric/core/**".into(),
                    when: None,
                },
                SourceEntry {
                    glob: "src/electric/us/**".into(),
                    when: Some(r#"(has-tag "us")"#.into()),
                },
            ],
        },
    );
    let binding = FeatureBinding {
        bindings,
        variants: vec![],
    };
    let cfg = VariantConfig {
        name: "eu-electric".into(),
        // eu, NOT us
        selects: vec!["electric".into(), "eu".into()],
    };
    let resolved = solve_with_bindings(&model, &cfg, &binding).unwrap();
    let paths = resolved.source_manifest.get("electric").unwrap();
    assert!(paths.contains(&PathBuf::from("src/electric/core/**")));
    assert!(
        !paths.contains(&PathBuf::from("src/electric/us/**")),
        "(has-tag \"us\") with us NOT selected should drop the glob"
    );
}

#[test]
fn invalid_when_expression_fails_loud() {
    let model = FeatureModel::from_yaml(VEHICLE_MODEL).unwrap();
    let mut bindings = std::collections::BTreeMap::new();
    bindings.insert(
        "electric".to_string(),
        Binding {
            artifacts: vec![],
            source: vec![SourceEntry {
                glob: "src/electric/**".into(),
                when: Some("(this is not a valid sexpr".into()),
            }],
        },
    );
    let binding = FeatureBinding {
        bindings,
        variants: vec![],
    };
    let cfg = VariantConfig {
        name: "ev".into(),
        selects: vec!["electric".into(), "eu".into()],
    };
    let errs = solve_with_bindings(&model, &cfg, &binding).unwrap_err();
    let combined: String = errs
        .iter()
        .map(|e| format!("{e}"))
        .collect::<Vec<_>>()
        .join("\n");
    assert!(
        combined.contains("electric") && combined.contains("when"),
        "error must cite binding name + when expression context, got:\n{combined}"
    );
}

#[test]
fn source_manifest_only_lists_effective_features() {
    // A binding entry for a feature NOT in the resolved selection must
    // not appear in the manifest. The manifest is keyed by what the
    // variant actually pulled in.
    let model = FeatureModel::from_yaml(VEHICLE_MODEL).unwrap();
    let mut bindings = std::collections::BTreeMap::new();
    bindings.insert(
        "petrol".to_string(),
        Binding {
            artifacts: vec![],
            source: vec![SourceEntry {
                glob: "src/petrol/**".into(),
                when: None,
            }],
        },
    );
    bindings.insert(
        "electric".to_string(),
        Binding {
            artifacts: vec![],
            source: vec![SourceEntry {
                glob: "src/electric/**".into(),
                when: None,
            }],
        },
    );
    let binding = FeatureBinding {
        bindings,
        variants: vec![],
    };
    let cfg = VariantConfig {
        name: "ev".into(),
        selects: vec!["electric".into(), "eu".into()],
    };
    let resolved = solve_with_bindings(&model, &cfg, &binding).unwrap();
    assert!(resolved.source_manifest.contains_key("electric"));
    assert!(
        !resolved.source_manifest.contains_key("petrol"),
        "petrol is not selected; its globs must not appear in the manifest"
    );
}

#[test]
fn end_to_end_against_examples_variant_fixture() {
    // Smoke-test against the on-disk example bindings/feature-model.
    // Should solve and produce a non-empty manifest for at least one
    // selected feature.
    let root = std::env::var("CARGO_MANIFEST_DIR").unwrap();
    let model_path = std::path::Path::new(&root)
        .parent()
        .unwrap()
        .join("examples/variant/feature-model.yaml");
    let bindings_path = std::path::Path::new(&root)
        .parent()
        .unwrap()
        .join("examples/variant/bindings.yaml");
    let variant_path = std::path::Path::new(&root)
        .parent()
        .unwrap()
        .join("examples/variant/eu-adas-c.yaml");

    let model_yaml = std::fs::read_to_string(&model_path).expect("read model");
    let model = FeatureModel::from_yaml(&model_yaml).expect("parse model");
    let bindings_yaml = std::fs::read_to_string(&bindings_path).expect("read bindings");
    let binding: FeatureBinding = serde_yaml::from_str(&bindings_yaml).expect("parse bindings");
    let variant_yaml = std::fs::read_to_string(&variant_path).expect("read variant");
    let cfg: VariantConfig = serde_yaml::from_str(&variant_yaml).expect("parse variant");

    let resolved = solve_with_bindings(&model, &cfg, &binding).expect("eu-adas-c must solve");
    assert!(
        !resolved.source_manifest.is_empty(),
        "examples/variant fixture should produce a non-empty manifest"
    );
}
