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

// rivet: verifies REQ-017
#[test]
fn parse_commits_config_from_yaml() {
    let yaml = r#"
project:
  name: test
  schemas: [common, dev]
sources: []
commits:
  format: trailers
  trailers:
    Implements: implements
    Fixes: fixes
  exempt-types: [chore, style, ci, docs, build]
  skip-trailer: "Trace: skip"
  traced-paths:
    - src/
  trace-exempt-artifacts:
    - FEAT-099
"#;
    let config: ProjectConfig = serde_yaml::from_str(yaml).unwrap();
    let commits = config.commits.expect("commits should parse");
    assert_eq!(commits.format, "trailers");
    assert_eq!(commits.trailers.len(), 2);
    assert_eq!(commits.trailers.get("Implements").unwrap(), "implements");
    assert_eq!(commits.exempt_types.len(), 5);
    assert_eq!(commits.skip_trailer, "Trace: skip");
    assert_eq!(commits.traced_paths, vec!["src/"]);
    assert_eq!(commits.trace_exempt_artifacts, vec!["FEAT-099"]);
}

// rivet: verifies REQ-017
#[test]
fn commits_config_optional() {
    let yaml = "project:\n  name: test\n  schemas: [common]\nsources: []\n";
    let config: ProjectConfig = serde_yaml::from_str(yaml).unwrap();
    assert!(config.commits.is_none());
}
