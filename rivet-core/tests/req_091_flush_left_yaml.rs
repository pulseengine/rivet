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

//! REQ-091 regression: the rowan-yaml salsa parser must extract links
//! from artifacts written in YAML's flush-left (zero-indent) list style.
//!
//! Until this fix, `yaml_hir::extract_schema_driven` (the default salsa
//! load path) returned 0 artifacts + 0 diagnostics for flush-left files
//! while `parse_generic_yaml` (the `--direct` legacy path) returned
//! them correctly. The link graph silently disappeared from the
//! validator's grading. Clean-room verified before the fix.
//!
//! Drives `extract_schema_driven` directly with both fixture shapes and
//! asserts identical artifact + link counts.
//!
//! rivet: verifies REQ-091

use rivet_core::schema::Schema;
use rivet_core::yaml_hir::extract_schema_driven;

/// An empty merged Schema is sufficient: when no artifact-type declares
/// `yaml-section: artifacts`, `extract_schema_driven` falls through to
/// the generic `artifacts:`-key extraction path (the same code path the
/// salsa validate stack actually uses for generic-yaml files). That is
/// exactly the path REQ-091 says is broken for flush-left input.
fn empty_schema() -> Schema {
    Schema::merge(&[])
}

/// REQ-091 Acceptance #1 + #4: extract_schema_driven returns 1 artifact
/// + 1 link for flush-left YAML, matching the indented form exactly.
#[test]
fn extract_schema_driven_handles_flush_left_list() {
    let flush = "\
artifacts:
- id: COMP_REQ__FLUSH__A
  type: comp-req
  title: Flush-left
  status: approved
  links:
  - type: satisfies
    target: COMP_REQ__OTHER__B
";
    let indent = "\
artifacts:
  - id: COMP_REQ__INDENT__A
    type: comp-req
    title: Indented
    status: approved
    links:
      - type: satisfies
        target: COMP_REQ__OTHER__B
";
    let schema = empty_schema();

    let f = extract_schema_driven(flush, &schema, None);
    let i = extract_schema_driven(indent, &schema, None);

    assert!(
        f.diagnostics.is_empty(),
        "flush-left fixture must parse without diagnostics; got: {:?}",
        f.diagnostics
    );
    assert!(
        i.diagnostics.is_empty(),
        "indented fixture must parse without diagnostics; got: {:?}",
        i.diagnostics
    );

    assert_eq!(
        f.artifacts.len(),
        1,
        "flush-left: expected 1 artifact, got {}",
        f.artifacts.len()
    );
    assert_eq!(
        i.artifacts.len(),
        1,
        "indented: expected 1 artifact, got {}",
        i.artifacts.len()
    );

    let f_links = &f.artifacts[0].artifact.links;
    let i_links = &i.artifacts[0].artifact.links;
    assert_eq!(
        f_links.len(),
        1,
        "flush-left: expected 1 link (this is the REQ-091 regression — \
         the rowan parser used to drop flush-left sequences entirely)"
    );
    assert_eq!(i_links.len(), 1);
    assert_eq!(f_links[0].link_type, "satisfies");
    assert_eq!(f_links[0].target, "COMP_REQ__OTHER__B");
    assert_eq!(i_links[0].link_type, "satisfies");
    assert_eq!(i_links[0].target, "COMP_REQ__OTHER__B");
}

/// Cross-style parity: flush-left and indented forms must produce
/// structurally-identical artifact records (id excepted) so that the
/// salsa path and the `--direct` path grade identically.
#[test]
fn flush_left_and_indented_produce_equivalent_artifacts() {
    let flush = "\
artifacts:
- id: REQ-A
  type: comp-req
  title: Flush
  status: draft
  links:
  - type: satisfies
    target: REQ-B
  - type: satisfies
    target: REQ-C
";
    let indent = "\
artifacts:
  - id: REQ-A
    type: comp-req
    title: Flush
    status: draft
    links:
      - type: satisfies
        target: REQ-B
      - type: satisfies
        target: REQ-C
";
    let schema = empty_schema();
    let f = extract_schema_driven(flush, &schema, None);
    let i = extract_schema_driven(indent, &schema, None);

    assert_eq!(f.artifacts.len(), i.artifacts.len(), "artifact count mismatch");
    assert_eq!(
        f.artifacts[0].artifact.links.len(),
        i.artifacts[0].artifact.links.len(),
        "link count mismatch (REQ-091)"
    );
    assert_eq!(
        f.artifacts[0].artifact.id,
        i.artifacts[0].artifact.id
    );
    assert_eq!(
        f.artifacts[0].artifact.title,
        i.artifacts[0].artifact.title
    );
}
