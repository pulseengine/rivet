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

use rivet_core::model::ProjectConfig;

// rivet: verifies REQ-020
#[test]
fn externals_parsed_from_yaml() {
    let yaml = r#"
project:
  name: test
  version: "0.1.0"
  schemas: [common, dev]
sources: []
externals:
  rivet:
    git: https://github.com/pulseengine/rivet
    ref: main
    prefix: rivet
  meld:
    path: ../meld
    prefix: meld
"#;
    let config: ProjectConfig = serde_yaml::from_str(yaml).unwrap();
    let ext = config.externals.as_ref().unwrap();
    assert_eq!(ext.len(), 2);

    let rivet = &ext["rivet"];
    assert_eq!(
        rivet.git.as_deref(),
        Some("https://github.com/pulseengine/rivet")
    );
    assert_eq!(rivet.git_ref.as_deref(), Some("main"));
    assert_eq!(rivet.prefix, "rivet");

    let meld = &ext["meld"];
    assert_eq!(meld.path.as_deref(), Some("../meld"));
    assert!(meld.git.is_none());
    assert_eq!(meld.prefix, "meld");
}

// rivet: verifies REQ-020
#[test]
fn no_externals_is_none() {
    let yaml = r#"
project:
  name: test
  version: "0.1.0"
  schemas: [common]
sources: []
"#;
    let config: ProjectConfig = serde_yaml::from_str(yaml).unwrap();
    assert!(config.externals.is_none());
}
