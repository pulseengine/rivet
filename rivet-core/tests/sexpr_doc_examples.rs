// SAFETY-REVIEW (SCRC Phase 1, DD-058): Integration test code — blanket
// allow of the restriction family. See rivet-core/tests/proptest_feature_model.rs
// for the rationale.
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

//! Regression tests for every s-expression example in the user docs.
//!
//! If a docstring says "here's how to use this predicate", the example
//! MUST parse cleanly and evaluate to the advertised result. Documented
//! examples that don't work are worse than no documentation — they break
//! user trust the moment they're copy-pasted.

use std::collections::BTreeMap;

use rivet_core::links::LinkGraph;
use rivet_core::model::{Artifact, Link};
use rivet_core::schema::Schema;
use rivet_core::sexpr_eval::{self, matches_filter_with_store};
use rivet_core::store::Store;

fn art(
    id: &str,
    t: &str,
    tags: &[&str],
    status: Option<&str>,
    links: &[(&str, &str)],
) -> Artifact {
    Artifact {
        id: id.into(),
        artifact_type: t.into(),
        title: format!("title of {id}"),
        description: None,
        status: status.map(|s| s.to_string()),
        tags: tags.iter().map(|s| s.to_string()).collect(),
        links: links
            .iter()
            .map(|(lt, tgt)| Link {
                link_type: (*lt).into(),
                target: (*tgt).into(),
            })
            .collect(),
        fields: BTreeMap::new(),
        provenance: None,
        source_file: None,
    }
}

fn fixture() -> (Store, LinkGraph) {
    let arts = vec![
        art(
            "REQ-001",
            "requirement",
            &["stpa", "safety"],
            Some("approved"),
            &[("satisfies", "REQ-004")],
        ),
        art(
            "REQ-002",
            "requirement",
            &["eu"],
            Some("draft"),
            &[("satisfies", "REQ-004")],
        ),
        art(
            "REQ-003",
            "requirement",
            &["safety"],
            Some("approved"),
            &[
                ("satisfies", "REQ-004"),
                ("satisfies", "REQ-001"),
                ("satisfies", "REQ-002"),
            ],
        ),
        art(
            "REQ-004",
            "requirement",
            &["core"],
            Some("approved"),
            &[],
        ),
        art("FEAT-001", "feature", &[], Some("approved"), &[]),
    ];
    let mut s = Store::default();
    for a in arts {
        s.upsert(a);
    }
    let g = LinkGraph::build(&s, &Schema::merge(&[]));
    (s, g)
}

fn count_matches(filter: &str, store: &Store, graph: &LinkGraph) -> usize {
    let expr = sexpr_eval::parse_filter(filter)
        .unwrap_or_else(|errs| panic!("docs example {filter:?} failed to parse: {errs:?}"));
    store
        .iter()
        .filter(|a| matches_filter_with_store(&expr, a, graph, store))
        .count()
}

// Every example below is copy-pasted from `docs/getting-started.md`
// (the "S-Expression Filtering" section).

#[test]
fn docs_example_simple_type_equals() {
    // `rivet list --filter '(= type "requirement")'`
    let (store, graph) = fixture();
    assert_eq!(count_matches(r#"(= type "requirement")"#, &store, &graph), 4);
}

#[test]
fn docs_example_and_with_has_tag() {
    // `rivet list --filter '(and (has-tag "stpa") (= status "approved"))'`
    let (store, graph) = fixture();
    assert_eq!(
        count_matches(
            r#"(and (has-tag "stpa") (= status "approved"))"#,
            &store,
            &graph
        ),
        1 // REQ-001
    );
}

#[test]
fn docs_example_not_status_draft() {
    // `rivet list --filter '(not (= status "draft"))'`
    let (store, graph) = fixture();
    // Everything except REQ-002.
    assert_eq!(count_matches(r#"(not (= status "draft"))"#, &store, &graph), 4);
}

#[test]
fn docs_example_linked_by_wildcard() {
    // `rivet list --filter '(linked-by "satisfies" _)'`
    let (store, graph) = fixture();
    // REQ-001, REQ-002, REQ-003 have satisfies links; REQ-004 and FEAT-001 don't.
    assert_eq!(
        count_matches(r#"(linked-by "satisfies" _)"#, &store, &graph),
        3
    );
}

#[test]
fn docs_example_links_count_gt_two() {
    // `rivet list --filter '(links-count "satisfies" > 2)'`
    let (store, graph) = fixture();
    // Only REQ-003 has 3 satisfies links.
    assert_eq!(
        count_matches(r#"(links-count "satisfies" > 2)"#, &store, &graph),
        1
    );
}

#[test]
fn docs_example_exists_quantifier() {
    // `rivet list --filter '(exists (= type "requirement") (has-tag "safety"))'`
    //
    // `exists` is a global property — every artifact gets the same
    // boolean. Either every artifact matches (if at least one
    // requirement has "safety") or none do.
    let (store, graph) = fixture();
    let n = count_matches(
        r#"(exists (= type "requirement") (has-tag "safety"))"#,
        &store,
        &graph,
    );
    assert_eq!(n, store.len());
}

#[test]
fn docs_example_reachable_from() {
    // `rivet list --filter '(reachable-from "REQ-001" "satisfies")'`
    //
    // REQ-001 --satisfies--> REQ-004, so REQ-004 is reachable.
    let (store, graph) = fixture();
    assert_eq!(
        count_matches(r#"(reachable-from "REQ-001" "satisfies")"#, &store, &graph),
        1 // REQ-004
    );
}

#[test]
fn docs_example_has_tag_safety() {
    // `rivet coverage --filter '(has-tag "safety")'`
    //
    // Same filter as a coverage scope. REQ-001 and REQ-003 have "safety".
    let (store, graph) = fixture();
    assert_eq!(count_matches(r#"(has-tag "safety")"#, &store, &graph), 2);
}

// Ensure the predicate listing from the doc body (not the examples
// block itself) includes nothing that the parser can't accept. The
// error classifier must not trip on these names.

#[test]
fn docs_listed_predicates_all_parse_as_forms() {
    // Minimal valid shapes for each predicate the docs advertise.
    let cases = [
        r#"(= type "requirement")"#,
        r#"(!= type "feature")"#,
        r#"(> level 0)"#,
        r#"(< level 10)"#,
        r#"(>= level 1)"#,
        r#"(<= level 3)"#,
        r#"(in "safety" tags)"#,
        r#"(has-tag "stpa")"#,
        r#"(has-field "priority")"#,
        r#"(matches id ".*")"#,
        r#"(contains title "req")"#,
        r#"(linked-by "satisfies")"#,
        r#"(linked-from "satisfies")"#,
        r#"(linked-to "REQ-001")"#,
        r#"(links-count "satisfies" > 1)"#,
        r#"(and true false)"#,
        r#"(or true false)"#,
        r#"(not true)"#,
        r#"(implies true false)"#,
        r#"(excludes true false)"#,
        r#"(forall true true)"#,
        r#"(exists true true)"#,
        r#"(count true)"#,
        r#"(reachable-from "REQ-001" "satisfies")"#,
        r#"(reachable-to "REQ-001" "satisfies")"#,
    ];
    for c in cases {
        assert!(
            sexpr_eval::parse_filter(c).is_ok(),
            "advertised predicate shape did not parse: {c}"
        );
    }
}
