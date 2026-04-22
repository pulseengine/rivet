//! Predicate matrix tests for the s-expression filter/evaluator.
//!
//! Every predicate recognised by `sexpr_eval::lower` gets three tests:
//!   1. positive — predicate matches an artifact that satisfies it.
//!   2. negative — predicate does not match a conflicting artifact.
//!   3. malformed — parser/lowerer rejects a bad shape with a clear error.
//!
//! Goal: close the coverage gaps identified by the sexpr audit —
//! `!=`, `>`, `<`, `>=`, `<=`, `linked-from`, `count`, `reachable-from`,
//! `reachable-to`, plus malformed-arity checks for every predicate.

use std::collections::BTreeMap;

use rivet_core::links::LinkGraph;
use rivet_core::model::{Artifact, Link};
use rivet_core::schema::Schema;
use rivet_core::sexpr_eval::{self, matches_filter, matches_filter_with_store};
use rivet_core::store::Store;

// ── Fixtures ────────────────────────────────────────────────────────────

/// Artifact used for single-artifact predicate checks.
///
/// Mirrors the fixture in `sexpr_eval::tests::test_artifact` plus a few
/// extras that this matrix exercises (numeric fields, multiple links).
fn base_artifact() -> Artifact {
    Artifact {
        id: "REQ-001".into(),
        artifact_type: "requirement".into(),
        title: "Safety goal for pedestrian detection".into(),
        description: Some("STPA-derived requirement".into()),
        status: Some("approved".into()),
        tags: vec!["stpa".into(), "safety".into(), "eu".into()],
        links: vec![
            Link {
                link_type: "satisfies".into(),
                target: "SC-1".into(),
            },
            Link {
                link_type: "satisfies".into(),
                target: "SC-3".into(),
            },
            Link {
                link_type: "implements".into(),
                target: "DD-001".into(),
            },
        ],
        fields: {
            let mut m = BTreeMap::new();
            m.insert("priority".into(), serde_yaml::Value::String("must".into()));
            m.insert(
                "asil".into(),
                serde_yaml::Value::String("ASIL-D".into()),
            );
            m.insert(
                "level".into(),
                serde_yaml::Value::Number(serde_yaml::Number::from(3_i64)),
            );
            m
        },
        provenance: None,
        source_file: None,
    }
}

/// Empty link graph — suitable for predicates that don't look at backlinks.
fn empty_graph() -> LinkGraph {
    LinkGraph::build(&Store::default(), &Schema::merge(&[]))
}

/// Helper that parses + runs a filter against a single artifact.
fn ok(filter: &str, artifact: &Artifact) -> bool {
    let expr = sexpr_eval::parse_filter(filter)
        .unwrap_or_else(|errs| panic!("parse failed for {filter:?}: {errs:?}"));
    matches_filter(&expr, artifact, &empty_graph())
}

/// Helper that asserts a filter fails to parse/lower.
fn err(filter: &str) -> Vec<sexpr_eval::FilterError> {
    sexpr_eval::parse_filter(filter)
        .err()
        .unwrap_or_else(|| panic!("expected parse_filter({filter:?}) to fail"))
}

// ── Equality / inequality ──────────────────────────────────────────────

#[test]
fn eq_matches_known_field() {
    assert!(ok(r#"(= type "requirement")"#, &base_artifact()));
    assert!(ok(r#"(= status "approved")"#, &base_artifact()));
    assert!(ok(r#"(= priority "must")"#, &base_artifact()));
    assert!(ok(r#"(= asil "ASIL-D")"#, &base_artifact()));
}

#[test]
fn eq_no_match_on_different_value() {
    assert!(!ok(r#"(= type "feature")"#, &base_artifact()));
    assert!(!ok(r#"(= status "draft")"#, &base_artifact()));
}

#[test]
fn eq_missing_field_resolves_to_empty() {
    // `nonexistent` field -> empty string; equality against empty string holds.
    assert!(ok(r#"(= nonexistent "")"#, &base_artifact()));
    assert!(!ok(r#"(= nonexistent "something")"#, &base_artifact()));
}

#[test]
fn eq_rejects_missing_argument() {
    let errs = err(r#"(= type)"#);
    assert!(
        errs.iter().any(|e| e.message.contains("'=' requires")),
        "expected arity complaint, got {errs:?}"
    );
}

#[test]
fn eq_rejects_extra_argument() {
    let errs = err(r#"(= type "requirement" "extra")"#);
    assert!(errs.iter().any(|e| e.message.contains("'=' requires")));
}

#[test]
fn ne_matches_when_values_differ() {
    assert!(ok(r#"(!= type "feature")"#, &base_artifact()));
}

#[test]
fn ne_no_match_when_values_equal() {
    assert!(!ok(r#"(!= type "requirement")"#, &base_artifact()));
}

#[test]
fn ne_rejects_wrong_arity() {
    let errs = err(r#"(!= type)"#);
    assert!(errs.iter().any(|e| e.message.contains("'!=' requires")));
}

// ── Numeric comparisons: >, <, >=, <= ──────────────────────────────────

#[test]
fn gt_matches_on_numeric_field() {
    assert!(ok(r#"(> level 2)"#, &base_artifact()));
    assert!(ok(r#"(> level 0)"#, &base_artifact()));
}

#[test]
fn gt_no_match_when_field_not_greater() {
    assert!(!ok(r#"(> level 3)"#, &base_artifact()));
    assert!(!ok(r#"(> level 10)"#, &base_artifact()));
}

#[test]
fn gt_non_numeric_field_is_false() {
    // Non-numeric string parsed as NaN — every comparison with NaN is false.
    assert!(!ok(r#"(> type 0)"#, &base_artifact()));
}

#[test]
fn gt_rejects_wrong_arity() {
    let errs = err(r#"(> level)"#);
    assert!(errs.iter().any(|e| e.message.contains("'>' requires")));
}

#[test]
fn lt_matches_below_threshold() {
    assert!(ok(r#"(< level 10)"#, &base_artifact()));
}

#[test]
fn lt_no_match_above_threshold() {
    assert!(!ok(r#"(< level 1)"#, &base_artifact()));
}

#[test]
fn lt_rejects_wrong_arity() {
    let errs = err(r#"(< level 1 extra)"#);
    assert!(errs.iter().any(|e| e.message.contains("'<' requires")));
}

#[test]
fn ge_inclusive_boundary() {
    // level = 3, so (>= level 3) matches the boundary.
    assert!(ok(r#"(>= level 3)"#, &base_artifact()));
    assert!(!ok(r#"(>= level 4)"#, &base_artifact()));
}

#[test]
fn ge_rejects_wrong_arity() {
    let errs = err(r#"(>=)"#);
    assert!(errs.iter().any(|e| e.message.contains("'>=' requires")));
}

#[test]
fn le_inclusive_boundary() {
    assert!(ok(r#"(<= level 3)"#, &base_artifact()));
    assert!(!ok(r#"(<= level 2)"#, &base_artifact()));
}

#[test]
fn le_accepts_float_literals() {
    // Float literal path — exercises the `Value::Float -> f64` branch.
    assert!(ok(r#"(<= level 3.5)"#, &base_artifact()));
    assert!(!ok(r#"(<= level 2.5)"#, &base_artifact()));
}

// ── `in` — membership on list-valued fields ────────────────────────────

#[test]
fn in_matches_existing_tag() {
    assert!(ok(r#"(in "safety" tags)"#, &base_artifact()));
}

#[test]
fn in_no_match_when_value_absent() {
    assert!(!ok(r#"(in "missing" tags)"#, &base_artifact()));
}

#[test]
fn in_on_scalar_field_returns_false() {
    // `type` is scalar, not a list — `in` should return false, not error.
    assert!(!ok(r#"(in "requirement" type)"#, &base_artifact()));
}

#[test]
fn in_rejects_wrong_arity() {
    let errs = err(r#"(in tags)"#);
    assert!(errs.iter().any(|e| e.message.contains("'in' requires")));
}

// ── has-tag ────────────────────────────────────────────────────────────

#[test]
fn has_tag_matches_present_tag() {
    assert!(ok(r#"(has-tag "stpa")"#, &base_artifact()));
}

#[test]
fn has_tag_no_match_when_absent() {
    assert!(!ok(r#"(has-tag "automotive")"#, &base_artifact()));
}

#[test]
fn has_tag_rejects_missing_argument() {
    let errs = err(r#"(has-tag)"#);
    assert!(errs.iter().any(|e| e.message.contains("'has-tag' requires")));
}

#[test]
fn has_tag_rejects_extra_argument() {
    let errs = err(r#"(has-tag "a" "b")"#);
    assert!(errs.iter().any(|e| e.message.contains("'has-tag' requires")));
}

// ── has-field ──────────────────────────────────────────────────────────

#[test]
fn has_field_matches_present_named_field() {
    assert!(ok(r#"(has-field "priority")"#, &base_artifact()));
    assert!(ok(r#"(has-field "status")"#, &base_artifact()));
    assert!(ok(r#"(has-field "description")"#, &base_artifact()));
}

#[test]
fn has_field_no_match_absent() {
    assert!(!ok(r#"(has-field "nonexistent")"#, &base_artifact()));
}

#[test]
fn has_field_well_known_always_present() {
    assert!(ok(r#"(has-field "id")"#, &base_artifact()));
    assert!(ok(r#"(has-field "type")"#, &base_artifact()));
    assert!(ok(r#"(has-field "title")"#, &base_artifact()));
}

#[test]
fn has_field_rejects_wrong_arity() {
    let errs = err(r#"(has-field)"#);
    assert!(errs.iter().any(|e| e.message.contains("'has-field' requires")));
}

// ── matches (regex) ────────────────────────────────────────────────────

#[test]
fn matches_regex_on_id() {
    assert!(ok(r#"(matches id "^REQ-\\d+$")"#, &base_artifact()));
}

#[test]
fn matches_no_match_for_non_matching_regex() {
    assert!(!ok(r#"(matches id "^FEAT-")"#, &base_artifact()));
}

#[test]
fn matches_invalid_regex_is_parse_error() {
    // v0.4.3: malformed regex patterns are rejected at lower time with
    // a clear error rather than silently matching nothing at runtime.
    // Previously this returned false safely; audit flagged that users
    // mistake silent empty-match for "filter excluded everything" and
    // waste debugging time. `err()` here exercises the lower path and
    // asserts the diagnostic names the regex compile failure.
    let errs = err(r#"(matches id "[")"#);
    assert!(
        errs.iter()
            .any(|e| e.message.to_lowercase().contains("regex")),
        "invalid regex must produce a parse error mentioning 'regex': got {errs:?}"
    );
}

#[test]
fn matches_rejects_wrong_arity() {
    let errs = err(r#"(matches id)"#);
    assert!(errs.iter().any(|e| e.message.contains("'matches' requires")));
}

// ── contains ───────────────────────────────────────────────────────────

#[test]
fn contains_matches_substring() {
    assert!(ok(r#"(contains title "pedestrian")"#, &base_artifact()));
}

#[test]
fn contains_no_match_when_substring_absent() {
    assert!(!ok(r#"(contains title "bicycle")"#, &base_artifact()));
}

#[test]
fn contains_rejects_wrong_arity() {
    let errs = err(r#"(contains title)"#);
    assert!(errs.iter().any(|e| e.message.contains("'contains' requires")));
}

// ── linked-by ──────────────────────────────────────────────────────────

#[test]
fn linked_by_matches_when_link_type_exists() {
    assert!(ok(r#"(linked-by "satisfies" _)"#, &base_artifact()));
    assert!(ok(r#"(linked-by "implements" _)"#, &base_artifact()));
}

#[test]
fn linked_by_no_match_when_link_type_differs() {
    assert!(!ok(r#"(linked-by "verifies" _)"#, &base_artifact()));
}

#[test]
fn linked_by_matches_specific_target() {
    assert!(ok(r#"(linked-by "satisfies" "SC-1")"#, &base_artifact()));
}

#[test]
fn linked_by_no_match_wrong_target() {
    assert!(!ok(
        r#"(linked-by "satisfies" "SC-99")"#,
        &base_artifact()
    ));
}

#[test]
fn linked_by_accepts_single_argument_defaults_wildcard() {
    // One-arg form: equivalent to `_` wildcard target.
    assert!(ok(r#"(linked-by "satisfies")"#, &base_artifact()));
    assert!(!ok(r#"(linked-by "verifies")"#, &base_artifact()));
}

#[test]
fn linked_by_rejects_too_many_args() {
    let errs = err(r#"(linked-by "satisfies" _ "extra")"#);
    assert!(errs.iter().any(|e| e.message.contains("'linked-by'")));
}

#[test]
fn linked_by_rejects_no_args() {
    let errs = err(r#"(linked-by)"#);
    assert!(errs.iter().any(|e| e.message.contains("'linked-by'")));
}

// ── linked-to ──────────────────────────────────────────────────────────

#[test]
fn linked_to_matches_target_id() {
    assert!(ok(r#"(linked-to "SC-1")"#, &base_artifact()));
    assert!(ok(r#"(linked-to "DD-001")"#, &base_artifact()));
}

#[test]
fn linked_to_no_match_for_missing_target() {
    assert!(!ok(r#"(linked-to "SC-99")"#, &base_artifact()));
}

#[test]
fn linked_to_rejects_wrong_arity() {
    let errs = err(r#"(linked-to)"#);
    assert!(errs.iter().any(|e| e.message.contains("'linked-to' requires")));
}

// ── linked-from (REQUIRES STORE GRAPH) ─────────────────────────────────

#[test]
fn linked_from_matches_incoming_link_type() {
    // Build a 2-artifact store where `SC-1` is linked FROM `REQ-001`.
    let req = base_artifact(); // has `(satisfies -> SC-1)` and more
    let sc = Artifact {
        id: "SC-1".into(),
        artifact_type: "system-constraint".into(),
        title: "System constraint 1".into(),
        description: None,
        status: Some("approved".into()),
        tags: vec![],
        links: vec![],
        fields: BTreeMap::new(),
        provenance: None,
        source_file: None,
    };
    let mut store = Store::default();
    store.upsert(req);
    store.upsert(sc.clone());
    let schema = Schema::merge(&[]);
    let graph = LinkGraph::build(&store, &schema);

    let expr = sexpr_eval::parse_filter(r#"(linked-from "satisfies" _)"#).unwrap();
    assert!(matches_filter_with_store(&expr, &sc, &graph, &store));
}

#[test]
fn linked_from_no_match_when_no_incoming_link() {
    let orphan = Artifact {
        id: "ORP-1".into(),
        artifact_type: "requirement".into(),
        title: "Orphan".into(),
        description: None,
        status: None,
        tags: vec![],
        links: vec![],
        fields: BTreeMap::new(),
        provenance: None,
        source_file: None,
    };
    let mut store = Store::default();
    store.upsert(orphan.clone());
    let schema = Schema::merge(&[]);
    let graph = LinkGraph::build(&store, &schema);

    let expr = sexpr_eval::parse_filter(r#"(linked-from "satisfies" _)"#).unwrap();
    assert!(!matches_filter_with_store(&expr, &orphan, &graph, &store));
}

#[test]
fn linked_from_no_match_wrong_link_type() {
    // Same target as the positive test but a link type with no instances.
    let req = base_artifact();
    let sc = Artifact {
        id: "SC-1".into(),
        artifact_type: "system-constraint".into(),
        title: "System constraint 1".into(),
        description: None,
        status: None,
        tags: vec![],
        links: vec![],
        fields: BTreeMap::new(),
        provenance: None,
        source_file: None,
    };
    let mut store = Store::default();
    store.upsert(req);
    store.upsert(sc.clone());
    let graph = LinkGraph::build(&store, &Schema::merge(&[]));

    let expr = sexpr_eval::parse_filter(r#"(linked-from "verifies" _)"#).unwrap();
    assert!(!matches_filter_with_store(&expr, &sc, &graph, &store));
}

#[test]
fn linked_from_rejects_wrong_arity() {
    let errs = err(r#"(linked-from)"#);
    assert!(errs.iter().any(|e| e.message.contains("'linked-from'")));
}

/// Regression: the source-filter argument of `linked-from` was silently
/// ignored. `(linked-from "satisfies" "REQ-A")` must only match when
/// REQ-A is actually the source of an incoming satisfies link.
#[test]
fn linked_from_source_filter_is_honoured() {
    // Two different requirements both link into SC-1 via satisfies.
    let req_a = Artifact {
        id: "REQ-A".into(),
        artifact_type: "requirement".into(),
        title: "A".into(),
        description: None,
        status: None,
        tags: vec![],
        links: vec![Link {
            link_type: "satisfies".into(),
            target: "SC-1".into(),
        }],
        fields: BTreeMap::new(),
        provenance: None,
        source_file: None,
    };
    let req_b = Artifact {
        id: "REQ-B".into(),
        artifact_type: "requirement".into(),
        title: "B".into(),
        description: None,
        status: None,
        tags: vec![],
        links: vec![Link {
            link_type: "satisfies".into(),
            target: "SC-1".into(),
        }],
        fields: BTreeMap::new(),
        provenance: None,
        source_file: None,
    };
    let sc = Artifact {
        id: "SC-1".into(),
        artifact_type: "system-constraint".into(),
        title: "SC".into(),
        description: None,
        status: None,
        tags: vec![],
        links: vec![],
        fields: BTreeMap::new(),
        provenance: None,
        source_file: None,
    };
    let mut store = Store::default();
    store.upsert(req_a);
    store.upsert(req_b);
    store.upsert(sc.clone());
    let graph = LinkGraph::build(&store, &Schema::merge(&[]));

    // Specific existing source → matches.
    let specific = sexpr_eval::parse_filter(r#"(linked-from "satisfies" "REQ-A")"#).unwrap();
    assert!(matches_filter_with_store(&specific, &sc, &graph, &store));

    // Wildcard also matches.
    let wild = sexpr_eval::parse_filter(r#"(linked-from "satisfies" _)"#).unwrap();
    assert!(matches_filter_with_store(&wild, &sc, &graph, &store));

    // Non-existent source MUST not match — this is the bug fix.
    let missing =
        sexpr_eval::parse_filter(r#"(linked-from "satisfies" "REQ-NOPE")"#).unwrap();
    assert!(
        !matches_filter_with_store(&missing, &sc, &graph, &store),
        "`(linked-from \"satisfies\" \"REQ-NOPE\")` must not match when no such source exists"
    );
}

// ── links-count ────────────────────────────────────────────────────────

#[test]
fn links_count_greater_than() {
    assert!(ok(r#"(links-count "satisfies" > 1)"#, &base_artifact()));
}

#[test]
fn links_count_exact() {
    assert!(ok(r#"(links-count "satisfies" = 2)"#, &base_artifact()));
}

#[test]
fn links_count_less_than() {
    assert!(ok(r#"(links-count "satisfies" < 3)"#, &base_artifact()));
}

#[test]
fn links_count_not_equal() {
    assert!(ok(r#"(links-count "satisfies" != 99)"#, &base_artifact()));
    assert!(!ok(r#"(links-count "satisfies" != 2)"#, &base_artifact()));
}

#[test]
fn links_count_ge_le_boundary() {
    assert!(ok(r#"(links-count "satisfies" >= 2)"#, &base_artifact()));
    assert!(!ok(r#"(links-count "satisfies" >= 3)"#, &base_artifact()));
    assert!(ok(r#"(links-count "satisfies" <= 2)"#, &base_artifact()));
    assert!(!ok(r#"(links-count "satisfies" <= 1)"#, &base_artifact()));
}

#[test]
fn links_count_rejects_bad_operator() {
    let errs = err(r#"(links-count "satisfies" foo 1)"#);
    assert!(
        errs.iter().any(|e| e.message.contains("invalid operator")),
        "expected invalid-operator message, got {errs:?}"
    );
}

#[test]
fn links_count_rejects_wrong_arity() {
    let errs = err(r#"(links-count "satisfies" >)"#);
    assert!(errs.iter().any(|e| e.message.contains("'links-count'")));
}

#[test]
fn links_count_rejects_non_symbol_operator() {
    // String-literal as operator should be flagged, not silently parsed.
    let errs = err(r#"(links-count "satisfies" ">" 1)"#);
    assert!(errs
        .iter()
        .any(|e| e.message.contains("'links-count' second argument")));
}

// ── not / and / or / implies / excludes ────────────────────────────────

#[test]
fn not_rejects_zero_args() {
    let errs = err(r#"(not)"#);
    assert!(errs.iter().any(|e| e.message.contains("'not' requires")));
}

#[test]
fn not_rejects_multiple_args() {
    let errs = err(r#"(not a b)"#);
    assert!(errs.iter().any(|e| e.message.contains("'not' requires")));
}

#[test]
fn and_variadic_all_true_is_true() {
    // Variadic — more than two sub-expressions.
    assert!(ok(
        r#"(and (= type "requirement") (has-tag "stpa") (has-tag "safety"))"#,
        &base_artifact()
    ));
}

#[test]
fn and_variadic_one_false_is_false() {
    assert!(!ok(
        r#"(and (= type "requirement") (has-tag "missing") (has-tag "safety"))"#,
        &base_artifact()
    ));
}

#[test]
fn and_zero_args_is_identity_true() {
    // `(and)` with no sub-expressions is vacuously true.
    assert!(ok(r#"(and)"#, &base_artifact()));
}

#[test]
fn or_zero_args_is_identity_false() {
    // `(or)` with no sub-expressions is vacuously false.
    assert!(!ok(r#"(or)"#, &base_artifact()));
}

#[test]
fn implies_rejects_wrong_arity() {
    let errs = err(r#"(implies a)"#);
    assert!(errs.iter().any(|e| e.message.contains("'implies' requires")));
}

#[test]
fn excludes_semantics_match_definition() {
    // (excludes A B) == (not (and A B))
    let a = base_artifact();
    // A: has-tag "stpa" — true
    // B: has-tag "missing" — false
    assert!(ok(
        r#"(excludes (has-tag "stpa") (has-tag "missing"))"#,
        &a
    ));
    // Both true → excludes is false.
    assert!(!ok(
        r#"(excludes (has-tag "stpa") (has-tag "safety"))"#,
        &a
    ));
}

#[test]
fn excludes_rejects_wrong_arity() {
    let errs = err(r#"(excludes a)"#);
    assert!(errs
        .iter()
        .any(|e| e.message.contains("'excludes' requires")));
}

// ── forall / exists / count — require a Store ──────────────────────────

fn make_req(id: &str, tags: &[&str]) -> Artifact {
    Artifact {
        id: id.into(),
        artifact_type: "requirement".into(),
        title: format!("title of {id}"),
        description: None,
        status: Some("approved".into()),
        tags: tags.iter().map(|s| s.to_string()).collect(),
        links: vec![],
        fields: BTreeMap::new(),
        provenance: None,
        source_file: None,
    }
}

fn store_of(arts: Vec<Artifact>) -> (Store, LinkGraph) {
    let mut s = Store::default();
    for a in arts {
        s.upsert(a);
    }
    let g = LinkGraph::build(&s, &Schema::merge(&[]));
    (s, g)
}

#[test]
fn forall_positive_via_parse_filter() {
    let (store, graph) = store_of(vec![
        make_req("REQ-1", &["safety"]),
        make_req("REQ-2", &["safety"]),
    ]);
    let expr = sexpr_eval::parse_filter(
        r#"(forall (= type "requirement") (has-tag "safety"))"#,
    )
    .unwrap();
    let any = store.iter().next().unwrap();
    assert!(matches_filter_with_store(&expr, any, &graph, &store));
}

#[test]
fn forall_negative_one_violates() {
    let (store, graph) = store_of(vec![
        make_req("REQ-1", &["safety"]),
        make_req("REQ-2", &[]), // violates
    ]);
    let expr = sexpr_eval::parse_filter(
        r#"(forall (= type "requirement") (has-tag "safety"))"#,
    )
    .unwrap();
    let any = store.iter().next().unwrap();
    assert!(!matches_filter_with_store(&expr, any, &graph, &store));
}

#[test]
fn forall_rejects_wrong_arity() {
    let errs = err(r#"(forall (= type "requirement"))"#);
    assert!(errs.iter().any(|e| e.message.contains("'forall' requires")));
}

#[test]
fn exists_positive_via_parse_filter() {
    let (store, graph) = store_of(vec![
        make_req("REQ-1", &[]),
        make_req("REQ-2", &["safety"]),
    ]);
    let expr = sexpr_eval::parse_filter(
        r#"(exists (= type "requirement") (has-tag "safety"))"#,
    )
    .unwrap();
    let any = store.iter().next().unwrap();
    assert!(matches_filter_with_store(&expr, any, &graph, &store));
}

#[test]
fn exists_negative_no_match() {
    let (store, graph) = store_of(vec![
        make_req("REQ-1", &[]),
        make_req("REQ-2", &["eu"]),
    ]);
    let expr = sexpr_eval::parse_filter(
        r#"(exists (= type "requirement") (has-tag "safety"))"#,
    )
    .unwrap();
    let any = store.iter().next().unwrap();
    assert!(!matches_filter_with_store(&expr, any, &graph, &store));
}

#[test]
fn exists_rejects_wrong_arity() {
    let errs = err(r#"(exists true)"#);
    assert!(errs.iter().any(|e| e.message.contains("'exists' requires")));
}

#[test]
fn count_positive_any_match() {
    // `count` returns true if any artifact matches the scope.
    let (store, graph) = store_of(vec![make_req("REQ-1", &["safety"])]);
    let expr = sexpr_eval::parse_filter(
        r#"(count (has-tag "safety"))"#,
    )
    .unwrap();
    let any = store.iter().next().unwrap();
    assert!(matches_filter_with_store(&expr, any, &graph, &store));
}

#[test]
fn count_negative_no_match() {
    let (store, graph) = store_of(vec![make_req("REQ-1", &[])]);
    let expr = sexpr_eval::parse_filter(
        r#"(count (has-tag "safety"))"#,
    )
    .unwrap();
    let any = store.iter().next().unwrap();
    assert!(!matches_filter_with_store(&expr, any, &graph, &store));
}

#[test]
fn count_rejects_wrong_arity() {
    let errs = err(r#"(count)"#);
    assert!(errs.iter().any(|e| e.message.contains("'count' requires")));
}

#[test]
fn quantifier_without_store_is_safe_false() {
    // No store → forall/exists return false. We can parse + evaluate
    // against an unrelated artifact without crashing.
    let expr = sexpr_eval::parse_filter(r#"(exists true (has-tag "safety"))"#).unwrap();
    let a = base_artifact();
    assert!(!matches_filter(&expr, &a, &empty_graph()));
}

// ── reachable-from / reachable-to ───────────────────────────────────────

fn chain_store() -> (Store, LinkGraph) {
    // A -> B -> C via "satisfies"
    let mk = |id: &str, tgt: Option<&str>| Artifact {
        id: id.into(),
        artifact_type: "requirement".into(),
        title: id.into(),
        description: None,
        status: None,
        tags: vec![],
        links: tgt
            .map(|t| vec![Link {
                link_type: "satisfies".into(),
                target: t.into(),
            }])
            .unwrap_or_default(),
        fields: BTreeMap::new(),
        provenance: None,
        source_file: None,
    };
    let a = mk("REQ-A", Some("REQ-B"));
    let b = mk("REQ-B", Some("REQ-C"));
    let c = mk("REQ-C", None);
    store_of(vec![a, b, c])
}

#[test]
fn reachable_from_matches_transitive() {
    // From REQ-A via "satisfies" reaches REQ-B, REQ-C.
    let (store, graph) = chain_store();
    let expr = sexpr_eval::parse_filter(r#"(reachable-from "REQ-A" "satisfies")"#).unwrap();
    let b = store.get("REQ-B").unwrap();
    let c = store.get("REQ-C").unwrap();
    assert!(matches_filter_with_store(&expr, b, &graph, &store));
    assert!(matches_filter_with_store(&expr, c, &graph, &store));
}

#[test]
fn reachable_from_excludes_source() {
    let (store, graph) = chain_store();
    let expr = sexpr_eval::parse_filter(r#"(reachable-from "REQ-A" "satisfies")"#).unwrap();
    let a = store.get("REQ-A").unwrap();
    // `reachable()` removes the start node from results.
    assert!(!matches_filter_with_store(&expr, a, &graph, &store));
}

#[test]
fn reachable_from_wrong_link_type_no_match() {
    let (store, graph) = chain_store();
    let expr = sexpr_eval::parse_filter(r#"(reachable-from "REQ-A" "verifies")"#).unwrap();
    let c = store.get("REQ-C").unwrap();
    assert!(!matches_filter_with_store(&expr, c, &graph, &store));
}

#[test]
fn reachable_from_rejects_wrong_arity() {
    let errs = err(r#"(reachable-from "REQ-A")"#);
    assert!(errs
        .iter()
        .any(|e| e.message.contains("'reachable-from' requires")));
}

#[test]
fn reachable_to_matches_downstream() {
    let (store, graph) = chain_store();
    // From REQ-A, `REQ-C` is reachable via "satisfies".
    let expr = sexpr_eval::parse_filter(r#"(reachable-to "REQ-C" "satisfies")"#).unwrap();
    let a = store.get("REQ-A").unwrap();
    assert!(matches_filter_with_store(&expr, a, &graph, &store));
}

#[test]
fn reachable_to_no_match_wrong_direction() {
    let (store, graph) = chain_store();
    // From REQ-C there is no outgoing satisfies to REQ-A.
    let expr = sexpr_eval::parse_filter(r#"(reachable-to "REQ-A" "satisfies")"#).unwrap();
    let c = store.get("REQ-C").unwrap();
    assert!(!matches_filter_with_store(&expr, c, &graph, &store));
}

#[test]
fn reachable_to_rejects_wrong_arity() {
    let errs = err(r#"(reachable-to "REQ-A")"#);
    assert!(errs
        .iter()
        .any(|e| e.message.contains("'reachable-to' requires")));
}

// ── Structural error cases ─────────────────────────────────────────────

#[test]
fn unknown_head_form_is_rejected() {
    let errs = err(r#"(foobar a b)"#);
    assert!(errs
        .iter()
        .any(|e| e.message.contains("unknown form 'foobar'")));
}

#[test]
fn bare_symbol_at_top_level_is_rejected() {
    // `foo` is a symbol atom, not a bool — top-level atoms must be booleans.
    let errs = err(r#"foo"#);
    assert!(errs
        .iter()
        .any(|e| e.message.contains("unexpected atom at top level")));
}

#[test]
fn unclosed_paren_is_rejected() {
    let errs = err(r#"(and (has-tag "x")"#);
    assert!(!errs.is_empty());
    assert!(errs.iter().any(|e| e.message.contains("expected ')'")));
}

#[test]
fn unexpected_close_paren_is_rejected() {
    let errs = err(r#")"#);
    assert!(errs.iter().any(|e| e.message.contains("unexpected ')'")));
}

#[test]
fn empty_list_evaluates_true() {
    // `()` lowers to BoolLit(true) — documented behaviour.
    let expr = sexpr_eval::parse_filter("()").unwrap();
    assert!(matches_filter(&expr, &base_artifact(), &empty_graph()));
}

#[test]
fn multiple_top_level_exprs_combine_as_and() {
    // Two top-level forms are joined with AND.
    let expr = sexpr_eval::parse_filter(
        r#"(= type "requirement") (has-tag "stpa")"#,
    )
    .unwrap();
    assert!(matches_filter(&expr, &base_artifact(), &empty_graph()));

    let expr2 = sexpr_eval::parse_filter(
        r#"(= type "requirement") (has-tag "missing")"#,
    )
    .unwrap();
    assert!(!matches_filter(&expr2, &base_artifact(), &empty_graph()));
}
