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

//! Integration tests for commit traceability analysis.

use std::collections::{BTreeMap, BTreeSet, HashSet};

use rivet_core::commits::{ParsedCommit, analyze_commits, is_exempt};

/// Helper to build a `ParsedCommit` with sensible defaults.
fn make_commit(
    hash: &str,
    subject: &str,
    artifact_refs: BTreeMap<String, Vec<String>>,
    changed_files: Vec<String>,
    has_skip_trailer: bool,
) -> ParsedCommit {
    ParsedCommit {
        hash: hash.into(),
        subject: subject.into(),
        body: String::new(),
        author: "Test Author".into(),
        date: "2025-06-01T00:00:00+00:00".into(),
        commit_type: rivet_core::commits::parse_commit_type(subject),
        artifact_refs,
        changed_files,
        has_skip_trailer,
    }
}

/// Create 4 commits (linked, broken-ref, orphan, exempt-by-type), run
/// `analyze_commits`, and assert all 5 report sections are correct.
// rivet: verifies REQ-017
#[test]
fn full_analysis_reports() {
    // Known artifact IDs in the store.
    let known_ids: HashSet<String> = ["REQ-001", "REQ-002", "FEAT-010"]
        .iter()
        .map(|s| s.to_string())
        .collect();

    let exempt_types: Vec<String> = vec!["chore".into(), "ci".into()];
    let traced_paths: Vec<String> = vec!["src/".into()];
    let trace_exempt_artifacts: Vec<String> = vec![];
    let trailer_map: BTreeMap<String, String> = BTreeMap::new();

    // 1. Linked commit: references REQ-001 (exists).
    let mut linked_refs = BTreeMap::new();
    linked_refs.insert("implements".into(), vec!["REQ-001".into()]);
    let linked_commit = make_commit(
        "aaa111",
        "feat: implement parser",
        linked_refs,
        vec!["src/parser.rs".into()],
        false,
    );

    // 2. Broken-ref commit: references REQ-999 (does not exist).
    let mut broken_refs = BTreeMap::new();
    broken_refs.insert("implements".into(), vec!["REQ-999".into()]);
    let broken_commit = make_commit(
        "bbb222",
        "feat: broken reference",
        broken_refs,
        vec!["src/broken.rs".into()],
        false,
    );

    // 3. Orphan commit: no artifact refs, touches traced path.
    let orphan_commit = make_commit(
        "ccc333",
        "feat: orphan work",
        BTreeMap::new(),
        vec!["src/orphan.rs".into()],
        false,
    );

    // 4. Exempt-by-type commit: "chore" is in exempt_types.
    let exempt_commit = make_commit(
        "ddd444",
        "chore: update dependencies",
        BTreeMap::new(),
        vec!["Cargo.toml".into()],
        false,
    );

    let commits = vec![linked_commit, broken_commit, orphan_commit, exempt_commit];

    let analysis = analyze_commits(
        commits,
        &known_ids,
        &exempt_types,
        &traced_paths,
        &trace_exempt_artifacts,
        &trailer_map,
    );

    // --- Linked ---
    // "aaa111" is fully linked; "bbb222" has broken refs but is still placed
    // in the linked vec (with broken refs recorded separately).
    assert_eq!(analysis.linked.len(), 2, "expected 2 linked commits");
    let linked_hashes: BTreeSet<&str> = analysis.linked.iter().map(|c| c.hash.as_str()).collect();
    assert!(linked_hashes.contains("aaa111"));
    assert!(linked_hashes.contains("bbb222"));

    // --- Broken refs ---
    assert_eq!(analysis.broken_refs.len(), 1, "expected 1 broken ref");
    assert_eq!(analysis.broken_refs[0].hash, "bbb222");
    assert_eq!(analysis.broken_refs[0].missing_id, "REQ-999");
    assert_eq!(analysis.broken_refs[0].link_type, "implements");

    // --- Orphans ---
    assert_eq!(analysis.orphans.len(), 1, "expected 1 orphan");
    assert_eq!(analysis.orphans[0].hash, "ccc333");

    // --- Exempt ---
    assert_eq!(analysis.exempt.len(), 1, "expected 1 exempt commit");
    assert_eq!(analysis.exempt[0].hash, "ddd444");

    // --- Artifact coverage ---
    assert!(
        analysis.artifact_coverage.contains("REQ-001"),
        "REQ-001 should be covered"
    );
    assert!(
        !analysis.artifact_coverage.contains("REQ-999"),
        "REQ-999 is not a known ID, should not be in coverage"
    );

    // --- Unimplemented ---
    // REQ-002 and FEAT-010 are known but never referenced by any commit.
    assert!(
        analysis.unimplemented.contains("REQ-002"),
        "REQ-002 should be unimplemented"
    );
    assert!(
        analysis.unimplemented.contains("FEAT-010"),
        "FEAT-010 should be unimplemented (no trace-exempt whitelist here)"
    );
}

/// Verify that artifacts listed in `trace_exempt_artifacts` do not appear in
/// the `unimplemented` set, even when no commit references them.
// rivet: verifies REQ-017
#[test]
fn trace_exempt_artifacts_excluded_from_unimplemented() {
    let known_ids: HashSet<String> = ["REQ-001", "REQ-002", "FEAT-010"]
        .iter()
        .map(|s| s.to_string())
        .collect();

    let exempt_types: Vec<String> = vec![];
    let traced_paths: Vec<String> = vec![]; // empty = all paths traced
    let trace_exempt_artifacts: Vec<String> = vec!["REQ-002".into(), "FEAT-010".into()];
    let trailer_map: BTreeMap<String, String> = BTreeMap::new();

    // Single linked commit covering REQ-001.
    let mut refs = BTreeMap::new();
    refs.insert("implements".into(), vec!["REQ-001".into()]);
    let commit = make_commit(
        "aaa111",
        "feat: implement REQ-001",
        refs,
        vec!["src/main.rs".into()],
        false,
    );

    let analysis = analyze_commits(
        vec![commit],
        &known_ids,
        &exempt_types,
        &traced_paths,
        &trace_exempt_artifacts,
        &trailer_map,
    );

    // REQ-001 is covered by the commit.
    assert!(
        !analysis.unimplemented.contains("REQ-001"),
        "REQ-001 is covered, must not be unimplemented"
    );

    // REQ-002 and FEAT-010 are uncovered but trace-exempt -- must NOT appear.
    assert!(
        !analysis.unimplemented.contains("REQ-002"),
        "REQ-002 is trace-exempt, must not appear in unimplemented"
    );
    assert!(
        !analysis.unimplemented.contains("FEAT-010"),
        "FEAT-010 is trace-exempt, must not appear in unimplemented"
    );

    // The unimplemented set should be empty.
    assert!(
        analysis.unimplemented.is_empty(),
        "unimplemented set should be empty but got: {:?}",
        analysis.unimplemented
    );
}

/// Verify that a commit with the skip trailer (`has_skip_trailer = true`) is
/// classified as exempt regardless of its conventional-commit type.
// rivet: verifies REQ-017
#[test]
fn skip_trailer_exemption() {
    let known_ids: HashSet<String> = ["REQ-001"].iter().map(|s| s.to_string()).collect();
    let exempt_types: Vec<String> = vec![]; // no type-based exemptions
    let traced_paths: Vec<String> = vec![]; // all paths traced
    let trace_exempt_artifacts: Vec<String> = vec![];
    let trailer_map: BTreeMap<String, String> = BTreeMap::new();

    // A "feat" commit that would normally be an orphan, but carries skip trailer.
    let commit = make_commit(
        "skip111",
        "feat: exploratory spike",
        BTreeMap::new(),
        vec!["src/spike.rs".into()],
        true, // has_skip_trailer
    );

    // Verify is_exempt directly.
    assert!(
        is_exempt(&commit, &exempt_types),
        "commit with skip trailer must be exempt"
    );

    // Verify it lands in the exempt bucket after full analysis.
    let analysis = analyze_commits(
        vec![commit],
        &known_ids,
        &exempt_types,
        &traced_paths,
        &trace_exempt_artifacts,
        &trailer_map,
    );

    assert_eq!(analysis.exempt.len(), 1, "expected 1 exempt commit");
    assert_eq!(analysis.exempt[0].hash, "skip111");
    assert!(
        analysis.orphans.is_empty(),
        "skip-trailer commit must not appear in orphans"
    );
    assert!(
        analysis.linked.is_empty(),
        "skip-trailer commit must not appear in linked"
    );
}
