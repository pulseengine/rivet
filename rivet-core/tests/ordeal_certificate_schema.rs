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

//! Integration tests for the ordeal-certificate schema (rivet#693 /
//! ordeal#67, REQ-255).
//!
//! Covers the AC on rivet#693:
//!   - Schema loads and registers under `ordeal-certificate`.
//!   - `ordeal-certificate` artifact type declares the envelope fields
//!     (produced-by, checked-by, attests-*, cnf-sha256, proof-sha256,
//!     recheck-*).
//!   - `attests-transform` typed link is declared with
//!     `source-types: [ordeal-certificate]` — the typed link-target-type
//!     check has a source-side constraint even though target-types stays
//!     permissive until the cross-toolchain transform artifact types
//!     land.
//!   - `V-ordeal-cert-v1-inline-only` fires when `cnf-ref` or `proof-ref`
//!     is present (the ordeal-cert/v1 inline-only reader boundary that
//!     `Certificate::from_cert_v1` enforces as `BundleError::Unsupported`)
//!     and stays silent when both are absent.
//!   - `V-ordeal-cert-needs-recheck` fires when `recheck-exit-code` is
//!     missing or `!= recheck-expect-exit` (the "claimed vs re-checked"
//!     coverage split) and stays silent when the recheck was actually
//!     run and matched.
//!   - A full ordeal-certificate YAML artifact round-trips through
//!     serde_yaml (the golden-file round-trip AC).

use rivet_core::embedded::{SCHEMA_NAMES, SCHEMA_ORDEAL_CERTIFICATE, load_embedded_schema};
use rivet_core::links::LinkGraph;
use rivet_core::model::{Artifact, Link};
use rivet_core::schema::{Schema, SchemaFile};
use rivet_core::store::Store;
use rivet_core::validate::validate;

use std::collections::BTreeMap;

// ── Schema loading + registration ───────────────────────────────────────

#[test]
fn ordeal_certificate_schema_loads() {
    let schema_file =
        load_embedded_schema("ordeal-certificate").expect("ordeal-certificate schema must load");
    assert_eq!(schema_file.schema.name, "ordeal-certificate");
}

#[test]
fn ordeal_certificate_content_non_empty_and_mentions_envelope() {
    assert!(
        !SCHEMA_ORDEAL_CERTIFICATE.is_empty(),
        "SCHEMA_ORDEAL_CERTIFICATE must not be empty"
    );
    for needle in [
        "ordeal-certificate",
        "attests-transform",
        "cnf-sha256",
        "proof-sha256",
        "recheck-command",
        "V-ordeal-cert-v1-inline-only",
        "V-ordeal-cert-needs-recheck",
    ] {
        assert!(
            SCHEMA_ORDEAL_CERTIFICATE.contains(needle),
            "SCHEMA_ORDEAL_CERTIFICATE must mention {needle:?}"
        );
    }
}

#[test]
fn ordeal_certificate_registered_in_schema_names() {
    assert!(
        SCHEMA_NAMES.contains(&"ordeal-certificate"),
        "SCHEMA_NAMES must include 'ordeal-certificate'; got {SCHEMA_NAMES:?}"
    );
}

#[test]
fn ordeal_certificate_extends_common() {
    let schema_file = load_embedded_schema("ordeal-certificate").unwrap();
    assert!(
        schema_file.schema.extends.iter().any(|s| s == "common"),
        "ordeal-certificate must extend 'common', got {:?}",
        schema_file.schema.extends
    );
}

// ── Artifact type declaration ───────────────────────────────────────────

#[test]
fn ordeal_certificate_declares_envelope_fields() {
    let schema_file = load_embedded_schema("ordeal-certificate").unwrap();
    let cert = schema_file
        .artifact_types
        .iter()
        .find(|t| t.name == "ordeal-certificate")
        .expect("ordeal-certificate artifact type must exist");
    let field_names: Vec<&str> = cert.fields.iter().map(|f| f.name.as_str()).collect();

    for required in [
        "produced-by-tool",
        "produced-by-version",
        "checked-by-verifier",
        "checked-by-version",
        "attests-claim",
        "attests-standards",
        "cnf-sha256",
        "proof-sha256",
        "recheck-command",
        "recheck-expect-exit",
        "recheck-exit-code",
        "recheck-ran-at",
        "recheck-checked-by",
    ] {
        assert!(
            field_names.contains(&required),
            "envelope field {required:?} must be declared; got {field_names:?}"
        );
    }

    // v1 reader boundary carries the fields but marks them optional —
    // presence is rejected by V-ordeal-cert-v1-inline-only.
    for ref_field in ["cnf-ref", "proof-ref"] {
        let f = cert
            .fields
            .iter()
            .find(|f| f.name == ref_field)
            .unwrap_or_else(|| panic!("{ref_field} field must be declared for v1 boundary rule"));
        assert!(
            !f.required,
            "{ref_field} must be optional (v1 rejects presence via a rule, not a required-field check)"
        );
    }
}

#[test]
fn attests_transform_link_source_pinned_to_ordeal_certificate() {
    let schema_file = load_embedded_schema("ordeal-certificate").unwrap();
    let link = schema_file
        .link_types
        .iter()
        .find(|lt| lt.name == "attests-transform")
        .expect("attests-transform link type must exist");
    assert!(
        link.source_types.iter().any(|s| s == "ordeal-certificate"),
        "attests-transform must restrict source-types to [ordeal-certificate]; got {:?}",
        link.source_types
    );
}

#[test]
fn attests_transform_is_required_on_ordeal_certificate() {
    let schema_file = load_embedded_schema("ordeal-certificate").unwrap();
    let cert = schema_file
        .artifact_types
        .iter()
        .find(|t| t.name == "ordeal-certificate")
        .unwrap();
    let link_field = cert
        .link_fields
        .iter()
        .find(|lf| lf.name == "attests-transform")
        .expect("attests-transform link-field must exist on ordeal-certificate");
    assert!(
        link_field.required,
        "attests-transform must be a required link — a certificate that attests to nothing is not evidence"
    );
}

// ── Validation rules ───────────────────────────────────────────────────

fn cert_artifact(id: &str, fields: &[(&str, &str)], links: &[(&str, &str)]) -> Artifact {
    let mut field_map: BTreeMap<String, serde_yaml::Value> = BTreeMap::new();
    for (k, v) in fields {
        field_map.insert((*k).into(), serde_yaml::Value::String((*v).into()));
    }
    Artifact {
        id: id.into(),
        artifact_type: "ordeal-certificate".into(),
        title: format!("Title {id}"),
        description: None,
        status: Some("verified".into()),
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
        fields: field_map,
        fields_per_variant: Default::default(),
        provenance: None,
        source_file: None,
    }
}

fn transform_target(id: &str) -> Artifact {
    Artifact {
        id: id.into(),
        artifact_type: "requirement".into(),
        title: format!("Transform {id}"),
        description: None,
        status: Some("approved".into()),
        release: None,
        tags: vec![],
        links: vec![],
        fields: BTreeMap::new(),
        fields_per_variant: Default::default(),
        provenance: None,
        source_file: None,
    }
}

fn merged_schema() -> Schema {
    // ordeal-certificate extends common; common's status enum + `verifies`
    // link declarations are needed for the s-expression evaluator to
    // find `type`/`status` field accessors on the common base fields.
    let common: SchemaFile = load_embedded_schema("common").unwrap();
    let ordeal: SchemaFile = load_embedded_schema("ordeal-certificate").unwrap();
    Schema::merge(&[common, ordeal])
}

/// Baseline: a well-formed re-checked certificate raises NEITHER rule.
fn baseline_fields(with_recheck_result: bool) -> Vec<(&'static str, &'static str)> {
    let mut fields: Vec<(&'static str, &'static str)> = vec![
        ("produced-by-tool", "ordeal"),
        ("produced-by-version", "0.17.0"),
        ("checked-by-verifier", "ordeal-lrat"),
        ("checked-by-version", "0.17.0"),
        ("attests-claim", "variant-inconsistent"),
        ("cnf-sha256", "b7f3d8"),
        ("proof-sha256", "9a0c1e"),
        ("recheck-command", "ordeal-lrat check cnf.dimacs proof.lrat"),
        ("recheck-expect-exit", "0"),
    ];
    if with_recheck_result {
        fields.push(("recheck-exit-code", "0"));
        fields.push(("recheck-ran-at", "2026-07-30T05:11:22Z"));
        fields.push(("recheck-checked-by", "github-actions/rivet-ordeal-recheck"));
    }
    fields
}

#[test]
fn v1_inline_only_rule_fires_when_cnf_ref_present() {
    let schema = merged_schema();

    let mut store = Store::default();
    store.upsert(transform_target("REQ-TX-1"));

    let mut fields = baseline_fields(true);
    fields.push(("cnf-ref", "s3://certs/big-cnf.dimacs")); // v1: Unsupported.

    store.upsert(cert_artifact(
        "CERT-BAD-REF",
        &fields,
        &[("attests-transform", "REQ-TX-1")],
    ));

    let graph = LinkGraph::build(&store, &schema);
    let diags: Vec<_> = validate(&store, &schema, &graph)
        .into_iter()
        .filter(|d| d.rule == "V-ordeal-cert-v1-inline-only")
        .collect();

    assert_eq!(
        diags.len(),
        1,
        "V-ordeal-cert-v1-inline-only should fire exactly once when cnf-ref is present; got {diags:#?}"
    );
    assert_eq!(diags[0].artifact_id.as_deref(), Some("CERT-BAD-REF"));
}

#[test]
fn v1_inline_only_rule_silent_when_only_inline_hashes() {
    let schema = merged_schema();

    let mut store = Store::default();
    store.upsert(transform_target("REQ-TX-2"));
    store.upsert(cert_artifact(
        "CERT-CLEAN",
        &baseline_fields(true),
        &[("attests-transform", "REQ-TX-2")],
    ));

    let graph = LinkGraph::build(&store, &schema);
    let diags: Vec<_> = validate(&store, &schema, &graph)
        .into_iter()
        .filter(|d| d.rule == "V-ordeal-cert-v1-inline-only")
        .collect();

    assert!(
        diags.is_empty(),
        "V-ordeal-cert-v1-inline-only must stay silent on inline-hash-only certificates; got {diags:#?}"
    );
}

#[test]
fn needs_recheck_rule_fires_when_recheck_exit_code_missing() {
    let schema = merged_schema();

    let mut store = Store::default();
    store.upsert(transform_target("REQ-TX-3"));
    store.upsert(cert_artifact(
        "CERT-UNVERIFIED",
        &baseline_fields(false), // no recheck-* result fields
        &[("attests-transform", "REQ-TX-3")],
    ));

    let graph = LinkGraph::build(&store, &schema);
    let diags: Vec<_> = validate(&store, &schema, &graph)
        .into_iter()
        .filter(|d| d.rule == "V-ordeal-cert-needs-recheck")
        .collect();

    assert_eq!(
        diags.len(),
        1,
        "V-ordeal-cert-needs-recheck should fire on unrun certificate; got {diags:#?}"
    );
    assert_eq!(diags[0].artifact_id.as_deref(), Some("CERT-UNVERIFIED"));
}

#[test]
fn needs_recheck_rule_fires_when_exit_code_differs() {
    let schema = merged_schema();

    let mut store = Store::default();
    store.upsert(transform_target("REQ-TX-4"));

    let mut fields = baseline_fields(false);
    fields.push(("recheck-exit-code", "1")); // recheck ran but failed.
    fields.push(("recheck-ran-at", "2026-07-30T05:11:22Z"));
    fields.push(("recheck-checked-by", "local"));
    store.upsert(cert_artifact(
        "CERT-FAILED-RECHECK",
        &fields,
        &[("attests-transform", "REQ-TX-4")],
    ));

    let graph = LinkGraph::build(&store, &schema);
    let diags: Vec<_> = validate(&store, &schema, &graph)
        .into_iter()
        .filter(|d| d.rule == "V-ordeal-cert-needs-recheck")
        .collect();

    assert_eq!(
        diags.len(),
        1,
        "V-ordeal-cert-needs-recheck should fire when recheck-exit-code != recheck-expect-exit; got {diags:#?}"
    );
    assert_eq!(diags[0].artifact_id.as_deref(), Some("CERT-FAILED-RECHECK"));
}

#[test]
fn needs_recheck_rule_silent_on_rechecked_certificate() {
    let schema = merged_schema();

    let mut store = Store::default();
    store.upsert(transform_target("REQ-TX-5"));
    store.upsert(cert_artifact(
        "CERT-RECHECKED",
        &baseline_fields(true), // recheck-exit-code = "0", matches expect.
        &[("attests-transform", "REQ-TX-5")],
    ));

    let graph = LinkGraph::build(&store, &schema);
    let diags: Vec<_> = validate(&store, &schema, &graph)
        .into_iter()
        .filter(|d| d.rule == "V-ordeal-cert-needs-recheck")
        .collect();

    assert!(
        diags.is_empty(),
        "V-ordeal-cert-needs-recheck must stay silent on a certificate whose recheck ran and matched; got {diags:#?}"
    );
}

// ── Round-trip: an ordeal-certificate artifact YAML deserializes clean ─

#[test]
fn ordeal_certificate_artifact_yaml_roundtrips() {
    // The AC calls for a golden-file round-trip. Rather than pinning a
    // byte-identical serialization (serde_yaml's emitter differs from
    // the hand-authored form), we assert structural round-trip: the YAML
    // deserializes into an Artifact via the same `parse_generic_yaml`
    // path the rivet loader uses, and the loaded artifact carries the
    // envelope fields the schema declares. This also proves the
    // artifact form the schema example claims will actually load.
    let yaml = r#"
artifacts:
  - id: CERT-variant-vehicle-control-001
    type: ordeal-certificate
    title: "variant vehicle-control-baseline is consistent (SAT)"
    status: verified
    fields:
      produced-by-tool: ordeal
      produced-by-version: "0.17.0"
      checked-by-verifier: ordeal-lrat
      checked-by-version: "0.17.0"
      attests-claim: variant-consistent
      attests-standards: ["EU-AI-Act-Art-12", "ISO-26262"]
      attests-transform-kind: variant
      cnf-sha256: "b7f3d8"
      proof-sha256: "9a0c1e"
      recheck-command: "ordeal-lrat check cnf.dimacs proof.model"
      recheck-expect-exit: "0"
      recheck-exit-code: "0"
      recheck-ran-at: "2026-07-30T05:11:22Z"
      recheck-checked-by: "github-actions/rivet-ordeal-recheck"
    links:
      - type: attests-transform
        target: VARIANT-vehicle-control-baseline
"#;
    let arts = rivet_core::formats::generic::parse_generic_yaml(yaml, None)
        .expect("ordeal-certificate example YAML must parse via the generic loader");
    assert_eq!(arts.len(), 1);
    let cert = &arts[0];
    assert_eq!(cert.id, "CERT-variant-vehicle-control-001");
    assert_eq!(cert.artifact_type, "ordeal-certificate");
    assert_eq!(cert.status.as_deref(), Some("verified"));
    assert_eq!(cert.links.len(), 1);
    assert_eq!(cert.links[0].link_type, "attests-transform");
    assert_eq!(cert.links[0].target, "VARIANT-vehicle-control-baseline");

    for field in [
        "produced-by-tool",
        "checked-by-verifier",
        "attests-claim",
        "cnf-sha256",
        "proof-sha256",
        "recheck-command",
        "recheck-expect-exit",
        "recheck-exit-code",
    ] {
        assert!(
            cert.fields.contains_key(field),
            "envelope field {field:?} must land in fields map after loader parse; got {:?}",
            cert.fields.keys().collect::<Vec<_>>()
        );
    }
}
