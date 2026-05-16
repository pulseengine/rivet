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
                external: None,
            })
            .collect(),
        fields: BTreeMap::new(),
        fields_per_variant: Default::default(),
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

/// Rich V-model graph: 14 artifacts spanning the full SYS / SW / Unit
/// hierarchy with mixed approval state. Validates against the full
/// aspice preset (all 3 status-gate rules). Confirms each rule fires on
/// exactly its expected violations and stays silent everywhere else —
/// catches the "my new rule accidentally hits unrelated artifacts" class
/// of regression you'd never notice in unit tests.
#[test]
fn aspice_rich_v_model_graph_rules_fire_precisely() {
    let file = parse_schema("aspice");
    let schema = Schema::merge(&[file]);

    // Build a representative V-model:
    //
    //  Stakeholder REQs (top)
    //   STK-001 approved   STK-002 approved
    //         │                  │
    //   System REQs
    //   SYS-001 approved   SYS-002 draft   SYS-003 approved
    //         │                                │
    //   SW REQs
    //   SW-001 approved   SW-002 approved  SW-003 draft
    //         │                  │              │
    //   SW Detail Designs
    //   DD-001 approved   DD-002 draft     DD-003 approved
    //         │                  │              │
    //   Unit Verifications (SWE.4 — gate against sw-detail-design)
    //   UV-001 approved verifies DD-001  ← clean
    //   UV-002 approved verifies DD-002  ← VIOLATES SWE.4 gate (DD-002 draft)
    //
    //   SW Verifications (SWE.6 — gate against sw-req)
    //   SWV-001 approved verifies SW-001  ← clean
    //   SWV-002 approved verifies SW-003  ← VIOLATES SWE.6 gate (SW-003 draft)
    //
    //   Sys Verifications (SYS.5 — gate against system-req)
    //   SYV-001 approved verifies SYS-001  ← clean
    //   SYV-002 approved verifies SYS-002  ← VIOLATES SYS.5 gate (SYS-002 draft)

    let mut store = Store::default();
    for a in [
        artifact("STK-001", "stakeholder-req", "approved", &[]),
        artifact("STK-002", "stakeholder-req", "approved", &[]),
        artifact("SYS-001", "system-req", "approved", &[]),
        artifact("SYS-002", "system-req", "draft", &[]),
        artifact("SYS-003", "system-req", "approved", &[]),
        artifact("SW-001", "sw-req", "approved", &[]),
        artifact("SW-002", "sw-req", "approved", &[]),
        artifact("SW-003", "sw-req", "draft", &[]),
        artifact("DD-001", "sw-detail-design", "approved", &[]),
        artifact("DD-002", "sw-detail-design", "draft", &[]),
        artifact("DD-003", "sw-detail-design", "approved", &[]),
        // Unit verifications (SWE.4).
        artifact(
            "UV-001",
            "unit-verification",
            "approved",
            &[("verifies", "DD-001")],
        ),
        artifact(
            "UV-002",
            "unit-verification",
            "approved",
            &[("verifies", "DD-002")],
        ),
        // SW verifications (SWE.6).
        artifact(
            "SWV-001",
            "sw-verification",
            "approved",
            &[("verifies", "SW-001")],
        ),
        artifact(
            "SWV-002",
            "sw-verification",
            "approved",
            &[("verifies", "SW-003")],
        ),
        // Sys verifications (SYS.5).
        artifact(
            "SYV-001",
            "sys-verification",
            "approved",
            &[("verifies", "SYS-001")],
        ),
        artifact(
            "SYV-002",
            "sys-verification",
            "approved",
            &[("verifies", "SYS-002")],
        ),
    ] {
        store.upsert(a);
    }
    let graph = LinkGraph::build(&store, &schema);
    let diags = validate(&store, &schema, &graph);

    // Pull only status-gate diagnostics (ignore the project-level
    // diagnostics from earlier phases — those depend on the full schema
    // and aren't what this test exercises).
    let by_rule = |id: &str| -> Vec<&rivet_core::validate::Diagnostic> {
        diags.iter().filter(|d| d.rule == id).collect()
    };

    // Each rule should fire exactly once, on its expected target.
    let sys_diags = by_rule("V-sys-verification-needs-approved-req");
    let sw_diags = by_rule("V-sw-verification-needs-approved-req");
    let unit_diags = by_rule("V-unit-verification-needs-approved-design");

    assert_eq!(
        sys_diags.len(),
        1,
        "SYS.5 gate must fire exactly once; got {sys_diags:#?}"
    );
    assert_eq!(sys_diags[0].artifact_id.as_deref(), Some("SYV-002"));

    assert_eq!(
        sw_diags.len(),
        1,
        "SWE.6 gate must fire exactly once; got {sw_diags:#?}"
    );
    assert_eq!(sw_diags[0].artifact_id.as_deref(), Some("SWV-002"));

    assert_eq!(
        unit_diags.len(),
        1,
        "SWE.4 gate must fire exactly once; got {unit_diags:#?}"
    );
    assert_eq!(unit_diags[0].artifact_id.as_deref(), Some("UV-002"));

    // And — critically — no rule fires on a clean verifier or on any
    // requirement / design artifact. The gates apply only to the
    // verification-typed artifacts whose premise matches.
    for clean_id in [
        "STK-001", "STK-002", "SYS-001", "SYS-002", "SYS-003", "SW-001", "SW-002", "SW-003",
        "DD-001", "DD-002", "DD-003", "UV-001", "SWV-001", "SYV-001",
    ] {
        let stray: Vec<_> = diags
            .iter()
            .filter(|d| {
                d.artifact_id.as_deref() == Some(clean_id)
                    && (d.rule == "V-sys-verification-needs-approved-req"
                        || d.rule == "V-sw-verification-needs-approved-req"
                        || d.rule == "V-unit-verification-needs-approved-design")
            })
            .collect();
        assert!(
            stray.is_empty(),
            "no status-gate diagnostic should target {clean_id}; got: {stray:#?}"
        );
    }
}

/// Bulk evaluation under the aspice preset: 100 verifiers, each linked
/// to a randomised-approval requirement. Confirms phase 9 doesn't have
/// O(N²) behaviour on realistic stores and doesn't double-report or
/// miss diagnostics under volume.
#[test]
fn aspice_phase_9_scales_to_100_verifiers() {
    let file = parse_schema("aspice");
    let schema = Schema::merge(&[file]);

    let mut store = Store::default();
    let mut expected_violations = 0;
    for i in 0..100 {
        // Half of the requirements are draft, half approved.
        let req_status = if i % 2 == 0 { "approved" } else { "draft" };
        store.upsert(artifact(
            &format!("REQ-{i:03}"),
            "system-req",
            req_status,
            &[],
        ));
        // Every verifier is approved.
        store.upsert(artifact(
            &format!("VER-{i:03}"),
            "sys-verification",
            "approved",
            &[("verifies", &format!("REQ-{i:03}"))],
        ));
        if req_status == "draft" {
            expected_violations += 1;
        }
    }
    let graph = LinkGraph::build(&store, &schema);

    let start = std::time::Instant::now();
    let diags = validate(&store, &schema, &graph);
    let elapsed = start.elapsed();

    let gate_diags: Vec<_> = diags
        .iter()
        .filter(|d| d.rule == "V-sys-verification-needs-approved-req")
        .collect();
    assert_eq!(
        gate_diags.len(),
        expected_violations,
        "expected {expected_violations} SYS.5 violations (one per draft target); got {} diagnostics",
        gate_diags.len()
    );

    // Performance smoke: full validate of 200 artifacts should finish
    // well inside 1 second on any developer laptop. The threshold is
    // intentionally generous — we're catching O(N²) regressions, not
    // tuning the hot path.
    assert!(
        elapsed.as_secs() < 1,
        "full validate of 200-artifact store took {elapsed:?}; suspected O(N²) regression"
    );
}
