// SAFETY-REVIEW (SCRC Phase 1, DD-058): Integration test / smoke harness.
// Tests legitimately use unwrap/expect/panic/assert-indexing patterns
// because a test failure should panic with a clear stack.
#![allow(
    clippy::unwrap_used,
    clippy::expect_used,
    clippy::indexing_slicing,
    clippy::panic,
    clippy::print_stdout,
    clippy::print_stderr
)]

//! End-to-end coverage for the validation-rules surface across the
//! shipped V-model preset schemas.
//!
//! Each test:
//!   1. Parses a real preset YAML (so the YAML→`ValidationRule` deserialiser
//!      and the s-expression body together get exercised end-to-end).
//!   2. Constructs a minimal artifact set that matches the rule's premise.
//!   3. Runs `rivet_core::validate::validate(...)` and checks that the
//!      rule fires on the bad shape and stays silent on the clean shape.

use rivet_core::embedded::embedded_schema;
use rivet_core::links::LinkGraph;
use rivet_core::model::{Artifact, Link};
use rivet_core::schema::{Schema, SchemaFile};
use rivet_core::store::Store;
use rivet_core::validate::validate;

use std::collections::BTreeMap;

fn parse_schema(name: &str) -> SchemaFile {
    let content =
        embedded_schema(name).unwrap_or_else(|| panic!("embedded schema `{name}` not found"));
    serde_yaml::from_str(content)
        .unwrap_or_else(|e| panic!("schema `{name}` failed to parse as SchemaFile: {e}"))
}

fn artifact(id: &str, art_type: &str, status: &str, links: &[(&str, &str)]) -> Artifact {
    Artifact {
        id: id.into(),
        artifact_type: art_type.into(),
        title: format!("Title {id}"),
        description: None,
        status: Some(status.into()),
        tags: vec![],
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

/// The aspice preset declares status-gate rules for sys/sw/unit
/// verification. Confirm the YAML deserialises and that the SYS.5 rule
/// fires on the bad shape but stays silent on the clean shape.
#[test]
fn aspice_status_gate_rules_loaded_and_fire() {
    let file = parse_schema("aspice");
    assert!(
        !file.validation_rules.is_empty(),
        "aspice.yaml must declare validation-rules; got 0"
    );
    assert!(
        file.validation_rules
            .iter()
            .any(|r| r.id == "V-sys-verification-needs-approved-req"),
        "expected V-sys-verification-needs-approved-req in aspice.yaml; got {:?}",
        file.validation_rules
            .iter()
            .map(|r| &r.id)
            .collect::<Vec<_>>()
    );

    let schema = Schema::merge(&[file]);

    // Bad shape: approved sys-verification → draft system-req.
    let req_draft = artifact("REQ-100", "system-req", "draft", &[]);
    let verifier_bad = artifact(
        "V-200",
        "sys-verification",
        "approved",
        &[("verifies", "REQ-100")],
    );

    // Clean shape: approved sys-verification → approved system-req.
    let req_ok = artifact("REQ-101", "system-req", "approved", &[]);
    let verifier_clean = artifact(
        "V-201",
        "sys-verification",
        "approved",
        &[("verifies", "REQ-101")],
    );

    let mut store = Store::default();
    for a in [
        req_draft,
        verifier_bad.clone(),
        req_ok,
        verifier_clean.clone(),
    ] {
        store.upsert(a);
    }
    let graph = LinkGraph::build(&store, &schema);

    let diags = validate(&store, &schema, &graph);
    let gate_diags: Vec<_> = diags
        .iter()
        .filter(|d| d.rule == "V-sys-verification-needs-approved-req")
        .collect();

    assert_eq!(
        gate_diags.len(),
        1,
        "exactly one violation expected on V-200; got {:#?}",
        gate_diags
    );
    assert_eq!(gate_diags[0].artifact_id.as_deref(), Some("V-200"));
    assert!(
        gate_diags[0].message.contains("V-200"),
        "diagnostic message should mention the offending artifact id; got {:?}",
        gate_diags[0].message
    );
}

/// All status-gate rules across every shipped preset must have a well-
/// formed s-expression body. Catches typos in rule bodies before they
/// ship — a malformed `rule:` would otherwise surface only as a runtime
/// diagnostic on first use.
#[test]
fn all_preset_validation_rules_parse_cleanly() {
    use rivet_core::embedded::SCHEMA_NAMES;
    use rivet_core::sexpr_eval::parse_filter;

    let mut total_rules = 0;
    for &name in SCHEMA_NAMES {
        let file = parse_schema(name);
        for rule in &file.validation_rules {
            total_rules += 1;
            parse_filter(&rule.rule).unwrap_or_else(|errs| {
                panic!(
                    "schema `{name}` validation-rule `{}` failed to parse: {:?}\n\nrule body:\n{}",
                    rule.id, errs, rule.rule
                )
            });
        }
    }
    // aspice ships 3 rules today. If this drops, someone removed rules
    // without notice — fail loudly so the audit-coverage regression is
    // surfaced in CI rather than discovered in a customer escalation.
    assert!(
        total_rules >= 3,
        "expected at least 3 shipped status-gate rules across presets; got {total_rules}"
    );
}
