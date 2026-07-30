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

//! Integration tests for the `ordeal-certificate` schema (rivet#693
//! Part 2 / ordeal#67): the evidence artifact type describing an
//! `ordeal-cert/v1` bundle.
//!
//! Covers the acceptance criteria mechanically:
//! - schema registration + parse,
//! - golden-file byte-identical round-trip,
//! - `attests-transform` allowed-target enforcement (`link-target-type`),
//! - the coverage split: a RE-CHECKED certificate counts as a
//!   verification link, a never-re-checked one fails validation,
//! - the v1 inline-only reader boundary (`cnf-ref`/`proof-ref` →
//!   legible Unsupported-class error),
//! - the UNSAT "re-checkable pair" conditional rule and the honest SAT
//!   boundary warning.

// rivet: verifies REQ-277

use std::collections::BTreeMap;

use rivet_core::embedded::{SCHEMA_NAMES, embedded_schema, load_embedded_schema};
use rivet_core::links::LinkGraph;
use rivet_core::model::{Artifact, Link};
use rivet_core::schema::{Schema, SchemaFile, Severity};
use rivet_core::store::Store;
use rivet_core::validate::{Diagnostic, validate};

fn parse_schema(name: &str) -> SchemaFile {
    let content =
        embedded_schema(name).unwrap_or_else(|| panic!("embedded schema `{name}` not found"));
    serde_yaml::from_str(content)
        .unwrap_or_else(|e| panic!("schema `{name}` failed to parse as SchemaFile: {e}"))
}

/// Merged schema a consuming project would load: common + dev (for
/// requirement/feature and the requirement-verification coverage rule)
/// + ordeal-certificate.
fn merged_schema() -> Schema {
    Schema::merge(&[
        parse_schema("common"),
        parse_schema("dev"),
        parse_schema("ordeal-certificate"),
    ])
}

fn artifact(id: &str, art_type: &str, status: &str, links: &[(&str, &str)]) -> Artifact {
    Artifact {
        id: id.into(),
        artifact_type: art_type.into(),
        title: format!("Title {id}"),
        description: Some(format!("Description {id}")),
        status: Some(status.into()),
        release: None,
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

fn yaml(v: &str) -> serde_yaml::Value {
    serde_yaml::Value::String(v.into())
}

/// A fully-populated, hash-carrying UNSAT certificate. `rechecked`
/// controls whether the recheck outcome was recorded (`verification-
/// result: pass`) — the axis the coverage split turns on.
fn unsat_cert(id: &str, rechecked: bool, links: &[(&str, &str)]) -> Artifact {
    let mut a = artifact(id, "ordeal-certificate", "implemented", links);
    a.fields.insert("format".into(), yaml("ordeal-cert/v1"));
    a.fields.insert("verdict".into(), yaml("unsat"));
    a.fields.insert(
        "produced-by".into(),
        serde_yaml::from_str("{name: ordeal, version: 0.17.0}").unwrap(),
    );
    a.fields.insert(
        "checked-by".into(),
        serde_yaml::from_str("{name: ordeal-lrat, version: 0.17.0}").unwrap(),
    );
    a.fields
        .insert("attests-claim".into(), yaml("variant-inconsistent"));
    a.fields.insert(
        "cnf-sha256".into(),
        yaml("3f786850e387550fdab836ed7e6dc881de23001b8e6f5f9db38f3ba4a4f4a1a5"),
    );
    a.fields.insert(
        "proof-sha256".into(),
        yaml("89e6c98d92887913cadf06b2adb97f26cde4849b4b1a3b7ec1cbb06cd261f4d9"),
    );
    a.fields.insert(
        "recheck".into(),
        serde_yaml::from_str(
            "{command: 'ordeal-lrat check problem.cnf proof.lrat', expect-exit: 0}",
        )
        .unwrap(),
    );
    if rechecked {
        a.fields.insert("verification-result".into(), yaml("pass"));
    }
    a
}

fn run_validate(artifacts: Vec<Artifact>) -> Vec<Diagnostic> {
    let schema = merged_schema();
    let mut store = Store::default();
    for a in artifacts {
        store.upsert(a);
    }
    let graph = LinkGraph::build(&store, &schema);
    validate(&store, &schema, &graph)
}

fn diags_for_rule<'a>(diags: &'a [Diagnostic], rule: &str) -> Vec<&'a Diagnostic> {
    diags.iter().filter(|d| d.rule == rule).collect()
}

// ── Schema registration ─────────────────────────────────────────────────

/// The embedded ordeal-certificate schema loads, is registered in
/// SCHEMA_NAMES, and declares the artifact type, the typed link, the
/// conditional rule, and all three validation rules.
#[test]
fn ordeal_certificate_schema_registered_and_declares_the_contract() {
    assert!(
        SCHEMA_NAMES.contains(&"ordeal-certificate"),
        "SCHEMA_NAMES must include 'ordeal-certificate'"
    );

    let file = load_embedded_schema("ordeal-certificate")
        .expect("ordeal-certificate schema must load and parse");
    assert_eq!(file.schema.name, "ordeal-certificate");

    let type_names: Vec<&str> = file
        .artifact_types
        .iter()
        .map(|t| t.name.as_str())
        .collect();
    assert_eq!(type_names, vec!["ordeal-certificate"]);

    // The AC field list, mapped recognizably from the ordeal-cert/v1
    // envelope.
    let cert = &file.artifact_types[0];
    let fields: Vec<&str> = cert.fields.iter().map(|f| f.name.as_str()).collect();
    for expected in [
        "format",
        "verdict",
        "produced-by",
        "checked-by",
        "attests-kind",
        "attests-claim",
        "attests-standards",
        "cnf-sha256",
        "cnf-ref",
        "proof-sha256",
        "proof-ref",
        "recheck",
        "verification-result",
    ] {
        assert!(fields.contains(&expected), "missing field `{expected}`");
    }

    // Typed attests-transform link with declared allowed targets.
    let link = file
        .link_types
        .iter()
        .find(|l| l.name == "attests-transform")
        .expect("attests-transform link type must be declared");
    assert_eq!(link.inverse.as_deref(), Some("transform-attested-by"));
    assert!(
        !link.target_types.is_empty(),
        "attests-transform must declare allowed targets"
    );

    let rule_ids: Vec<&str> = file
        .validation_rules
        .iter()
        .map(|r| r.id.as_str())
        .collect();
    for expected in [
        "V-ordeal-cert-recheck-gates-verifies",
        "V-ordeal-cert-v1-inline-only",
        "V-ordeal-cert-sat-is-self-checked",
    ] {
        assert!(rule_ids.contains(&expected), "missing rule `{expected}`");
    }
    assert!(
        file.conditional_rules
            .iter()
            .any(|r| r.name == "unsat-cert-carries-recheckable-pair"),
        "missing conditional rule"
    );
}

// ── Golden file: byte-identical round-trip ──────────────────────────────

/// The golden fixture round-trips byte-identically through the lossless
/// CST parser, parses into the expected artifact shape, and validates
/// with zero errors against common+dev+ordeal-certificate.
#[test]
fn golden_fixture_roundtrips_byte_identical_and_validates_clean() {
    let path = std::path::PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("tests/fixtures/ordeal-certificate.yaml");
    let source = std::fs::read_to_string(&path).expect("read golden fixture");

    // Byte-identical CST round-trip.
    let (green, errors) = rivet_core::yaml_cst::parse(&source);
    assert!(
        errors.is_empty(),
        "golden fixture must parse cleanly: {errors:?}"
    );
    let root = rowan::SyntaxNode::<rivet_core::yaml_cst::YamlLanguage>::new_root(green);
    assert_eq!(
        root.text().to_string(),
        source,
        "golden fixture must round-trip byte-identically"
    );

    // Serde parse into artifacts with the expected shape.
    let artifacts = rivet_core::formats::generic::parse_generic_yaml(&source, Some(&path))
        .expect("golden fixture must parse as generic-yaml artifacts");
    assert_eq!(artifacts.len(), 3, "REQ + FEAT + certificate");
    let cert = artifacts
        .iter()
        .find(|a| a.artifact_type == "ordeal-certificate")
        .expect("certificate artifact present");
    assert_eq!(cert.id, "OC-900");
    assert_eq!(
        cert.fields.get("format").and_then(|v| v.as_str()),
        Some("ordeal-cert/v1")
    );
    assert_eq!(
        cert.fields.get("verdict").and_then(|v| v.as_str()),
        Some("unsat")
    );
    let recheck = cert.fields.get("recheck").expect("recheck block present");
    assert_eq!(
        recheck.get("command").and_then(|v| v.as_str()),
        Some("ordeal-lrat check problem.cnf proof.lrat")
    );
    assert_eq!(
        recheck
            .get("expect-exit")
            .and_then(serde_yaml::Value::as_i64),
        Some(0)
    );
    assert!(
        cert.links
            .iter()
            .any(|l| l.link_type == "attests-transform" && l.target == "FEAT-900"),
        "attests-transform link present"
    );

    // Zero errors when validated as a store.
    let diags = run_validate(artifacts);
    let errors: Vec<_> = diags
        .iter()
        .filter(|d| d.severity == Severity::Error)
        .collect();
    assert!(
        errors.is_empty(),
        "golden fixture must validate error-free: {errors:?}"
    );
}

// ── link-target-type enforcement ────────────────────────────────────────

/// `attests-transform` may target a requirement/feature/design-decision/
/// aadl-component; anything else draws a `link-target-type` error.
#[test]
fn attests_transform_allowed_targets_are_enforced() {
    // Right-type target: a feature.
    let feat = artifact(
        "FEAT-1",
        "feature",
        "implemented",
        &[("satisfies", "REQ-1")],
    );
    let req = artifact("REQ-1", "requirement", "implemented", &[]);
    let good = unsat_cert(
        "OC-1",
        true,
        &[("attests-transform", "FEAT-1"), ("verifies", "REQ-1")],
    );
    let diags = run_validate(vec![req.clone(), feat.clone(), good]);
    assert!(
        diags_for_rule(&diags, "link-target-type").is_empty(),
        "feature is an allowed attests-transform target: {diags:?}"
    );

    // Wrong-type target: a dev `verification` artifact is NOT an allowed
    // transform target.
    let ver = artifact(
        "VER-1",
        "verification",
        "implemented",
        &[("verifies", "REQ-1")],
    );
    let bad = unsat_cert(
        "OC-2",
        true,
        &[("attests-transform", "VER-1"), ("verifies", "REQ-1")],
    );
    let diags = run_validate(vec![req, feat, ver, bad]);
    let hits = diags_for_rule(&diags, "link-target-type");
    assert_eq!(
        hits.len(),
        1,
        "wrong-type attests-transform target must fire link-target-type: {diags:?}"
    );
    assert!(
        hits[0].message.contains("attests-transform"),
        "{}",
        hits[0].message
    );
}

// ── Coverage split: re-checked counts, never-re-checked does not ────────

/// A re-checked certificate (`verification-result: pass`) is a
/// verification link: its `verifies` backlink satisfies the dev
/// `requirement-verification` coverage rule and draws no gate error. A
/// certificate whose recheck was never run fails validation when it
/// claims `verifies` — it cannot silently count as coverage.
#[test]
fn recheck_split_governs_verification_coverage() {
    let gate = "V-ordeal-cert-recheck-gates-verifies";

    // REQ-A: verified by a RE-CHECKED certificate.
    let req_a = artifact("REQ-A", "requirement", "implemented", &[]);
    let cert_ok = unsat_cert("OC-A", true, &[("verifies", "REQ-A")]);

    // REQ-B: "verified" by a NEVER-re-checked certificate.
    let req_b = artifact("REQ-B", "requirement", "implemented", &[]);
    let cert_unchecked = unsat_cert("OC-B", false, &[("verifies", "REQ-B")]);

    // REQ-C: baseline — no verification at all.
    let req_c = artifact("REQ-C", "requirement", "implemented", &[]);

    let diags = run_validate(vec![req_a, cert_ok, req_b, cert_unchecked, req_c]);

    // The re-checked certificate is clean and counts: no gate error on
    // OC-A, no requirement-verification gap on REQ-A.
    assert!(
        !diags
            .iter()
            .any(|d| d.rule == gate && d.artifact_id.as_deref() == Some("OC-A")),
        "re-checked certificate must not fire the gate: {diags:?}"
    );
    assert!(
        !diags.iter().any(|d| {
            d.rule == "requirement-verification" && d.artifact_id.as_deref() == Some("REQ-A")
        }),
        "re-checked certificate must satisfy requirement-verification for REQ-A: {diags:?}"
    );

    // The never-re-checked certificate fails validation (error severity).
    let unchecked_hits: Vec<_> = diags
        .iter()
        .filter(|d| d.rule == gate && d.artifact_id.as_deref() == Some("OC-B"))
        .collect();
    assert_eq!(
        unchecked_hits.len(),
        1,
        "never-re-checked certificate with a verifies link must fire the gate: {diags:?}"
    );
    assert_eq!(unchecked_hits[0].severity, Severity::Error);
    assert!(
        unchecked_hits[0].message.contains("never"),
        "gate message must say the recheck never ran: {}",
        unchecked_hits[0].message
    );

    // Baseline: the coverage rule itself is active — REQ-C is flagged.
    assert!(
        diags.iter().any(|d| {
            d.rule == "requirement-verification" && d.artifact_id.as_deref() == Some("REQ-C")
        }),
        "unverified REQ-C must be flagged by requirement-verification: {diags:?}"
    );

    // A certificate with NO verifies links and no recheck is fine — it is
    // an ingested claim, just not verification evidence.
    let req = artifact("REQ-D", "requirement", "implemented", &[]);
    let dormant = unsat_cert("OC-D", false, &[]);
    let diags = run_validate(vec![req, dormant]);
    assert!(
        diags_for_rule(&diags, gate).is_empty(),
        "a certificate without verifies links needs no recheck record: {diags:?}"
    );
}

// ── v1 inline-only reader boundary ──────────────────────────────────────

/// `cnf-ref` / `proof-ref` indirection surfaces as a legible
/// Unsupported-class validation error (mirroring ordeal's
/// BundleError::Unsupported), not a mystery failure.
#[test]
fn ref_indirection_is_a_legible_unsupported_error() {
    let rule = "V-ordeal-cert-v1-inline-only";
    let req = artifact("REQ-1", "requirement", "implemented", &[]);

    for ref_field in ["cnf-ref", "proof-ref"] {
        let mut cert = unsat_cert("OC-REF", true, &[("verifies", "REQ-1")]);
        cert.fields
            .insert(ref_field.into(), yaml("blobs/problem.cnf.zst"));
        let diags = run_validate(vec![req.clone(), cert]);
        let hits = diags_for_rule(&diags, rule);
        assert_eq!(hits.len(), 1, "`{ref_field}` must fire {rule}: {diags:?}");
        assert_eq!(hits[0].severity, Severity::Error);
        let msg = &hits[0].message;
        assert!(
            msg.contains("unsupported") && msg.contains("inline") && msg.contains("Unsupported"),
            "the error must be legible about the v1 inline-only boundary: {msg}"
        );
    }

    // Inline bundle: no boundary error.
    let inline_cert = unsat_cert("OC-IN", true, &[("verifies", "REQ-1")]);
    let diags = run_validate(vec![req, inline_cert]);
    assert!(diags_for_rule(&diags, rule).is_empty(), "{diags:?}");
}

// ── UNSAT re-checkable pair + honest SAT boundary ───────────────────────

/// An `unsat` certificate must carry the re-checkable pair (checker +
/// both content hashes); a `sat` one is exempt (self-checked model).
#[test]
fn unsat_verdict_requires_the_recheckable_pair() {
    let rule = "unsat-cert-carries-recheckable-pair";

    // Strip the pair from an unsat cert → three required-field errors.
    let mut bare = unsat_cert("OC-BARE", false, &[]);
    bare.fields.remove("checked-by");
    bare.fields.remove("cnf-sha256");
    bare.fields.remove("proof-sha256");
    let diags = run_validate(vec![bare]);
    let hits = diags_for_rule(&diags, rule);
    assert_eq!(
        hits.len(),
        3,
        "unsat without checked-by/cnf-sha256/proof-sha256 must fire {rule} 3x: {diags:?}"
    );

    // A sat certificate does not need the pair.
    let mut sat = unsat_cert("OC-SAT", false, &[]);
    sat.fields.insert("verdict".into(), yaml("sat"));
    sat.fields
        .insert("attests-claim".into(), yaml("variant-consistent"));
    sat.fields.remove("checked-by");
    sat.fields.remove("cnf-sha256");
    sat.fields.remove("proof-sha256");
    let diags = run_validate(vec![sat]);
    assert!(diags_for_rule(&diags, rule).is_empty(), "{diags:?}");
}

/// The honest SAT boundary: a `sat` certificate used as a `verifies`
/// source draws a warning — the model is self-checked, not
/// independently re-checked.
#[test]
fn sat_certificate_as_verifies_source_warns() {
    let rule = "V-ordeal-cert-sat-is-self-checked";
    let req = artifact("REQ-1", "requirement", "implemented", &[]);

    let mut sat = unsat_cert("OC-SAT", true, &[("verifies", "REQ-1")]);
    sat.fields.insert("verdict".into(), yaml("sat"));
    sat.fields
        .insert("attests-claim".into(), yaml("variant-consistent"));
    let diags = run_validate(vec![req.clone(), sat]);
    let hits = diags_for_rule(&diags, rule);
    assert_eq!(hits.len(), 1, "SAT + verifies must warn: {diags:?}");
    assert_eq!(hits[0].severity, Severity::Warning);
    assert!(
        hits[0].message.contains("self-checked"),
        "{}",
        hits[0].message
    );

    // An unsat certificate as a verifies source does not warn.
    let unsat = unsat_cert("OC-U", true, &[("verifies", "REQ-1")]);
    let diags = run_validate(vec![req, unsat]);
    assert!(diags_for_rule(&diags, rule).is_empty(), "{diags:?}");
}
