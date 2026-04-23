// SAFETY-REVIEW (SCRC Phase 1, DD-058): Integration test / smoke harness.
// Tests legitimately use unwrap/expect/panic/assert-indexing patterns
// because a test failure should panic with a clear stack. Blanket-allow
// the Phase 1 restriction lints at crate scope; real risk analysis for
// these lints is carried by production code in rivet-core/src.
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

//! Smoke test for every shipped schema's `agent-pipelines:` block.
//!
//! For each embedded schema we:
//!   1. parse the schema YAML (so we exercise `SchemaFile` + the
//!      embedded `agent-pipelines:` deserialiser),
//!   2. call `AgentPipelines::validate()` on the block and assert it
//!      returns `Ok(())` — i.e. every `uses-oracles:` entry resolves
//!      and every `when.oracle` reference is consistent.
//!
//! Schemas without an `agent-pipelines:` block are skipped silently.
//!
//! This test does NOT execute oracle commands. References to FUTURE
//! oracles (commands not yet implemented) are fine: the validator only
//! checks intra-block consistency, not whether the command exists on
//! the user's PATH.

use rivet_core::embedded::{embedded_schema, SCHEMA_NAMES};
use rivet_core::schema::SchemaFile;

fn parse_schema(name: &str) -> SchemaFile {
    let content = embedded_schema(name)
        .unwrap_or_else(|| panic!("embedded schema `{name}` not found"));
    serde_yaml::from_str(content)
        .unwrap_or_else(|e| panic!("schema `{name}` failed to parse as SchemaFile: {e}"))
}

#[test]
fn every_shipped_schema_agent_pipelines_block_validates() {
    let mut checked = 0usize;
    let mut skipped = Vec::new();

    for name in SCHEMA_NAMES {
        let schema = parse_schema(name);
        let Some(block) = schema.agent_pipelines else {
            skipped.push(*name);
            continue;
        };
        if let Err(errors) = block.validate() {
            panic!(
                "schema `{name}` agent-pipelines block failed validation:\n  - {}",
                errors.join("\n  - ")
            );
        }
        checked += 1;
    }

    // We expect at least the three shipped pipeline blocks today: dev,
    // aspice, iso-26262. If that changes (more schemas grow blocks), the
    // count rises but the assertion still holds.
    assert!(
        checked >= 3,
        "expected at least 3 schemas with agent-pipelines blocks, got {checked}; skipped: {skipped:?}",
    );
}

#[test]
fn aspice_pipelines_present_and_named() {
    let schema = parse_schema("aspice");
    let block = schema
        .agent_pipelines
        .expect("aspice.yaml must declare agent-pipelines:");
    block.validate().expect("aspice agent-pipelines must validate");

    for expected in ["level-2-trace", "level-2-content", "level-2-review"] {
        assert!(
            block.pipelines.contains_key(expected),
            "aspice agent-pipelines missing pipeline `{expected}`; got {:?}",
            block.pipelines.keys().collect::<Vec<_>>(),
        );
    }
}

#[test]
fn iso_26262_pipelines_present_and_named() {
    let schema = parse_schema("iso-26262");
    let block = schema
        .agent_pipelines
        .expect("iso-26262.yaml must declare agent-pipelines:");
    block.validate().expect("iso-26262 agent-pipelines must validate");

    for expected in ["vmodel", "coverage", "confirmation"] {
        assert!(
            block.pipelines.contains_key(expected),
            "iso-26262 agent-pipelines missing pipeline `{expected}`; got {:?}",
            block.pipelines.keys().collect::<Vec<_>>(),
        );
    }
}

#[test]
fn aspice_oracles_cover_implemented_and_future_set() {
    let schema = parse_schema("aspice");
    let block = schema.agent_pipelines.expect("aspice agent-pipelines");
    let ids: Vec<&str> = block.oracles.iter().map(|o| o.id.as_str()).collect();

    // Implemented today (rivet check bidirectional / review-signoff):
    assert!(ids.contains(&"bidirectional-trace"), "ids: {ids:?}");
    assert!(ids.contains(&"peer-review-signed"), "ids: {ids:?}");

    // FUTURE — oracles documented but not yet wired to a real command:
    for future in ["decomposition-coverage", "work-product-content", "base-practice-coverage"] {
        assert!(
            ids.contains(&future),
            "expected FUTURE oracle `{future}` to be declared in aspice; ids: {ids:?}",
        );
    }
}

#[test]
fn iso_26262_oracles_cover_implemented_and_future_set() {
    let schema = parse_schema("iso-26262");
    let block = schema.agent_pipelines.expect("iso-26262 agent-pipelines");
    let ids: Vec<&str> = block.oracles.iter().map(|o| o.id.as_str()).collect();

    // Implemented today (rivet validate / rivet check review-signoff):
    assert!(ids.contains(&"structural-trace"), "ids: {ids:?}");
    assert!(ids.contains(&"confirmation-review"), "ids: {ids:?}");

    // FUTURE — oracles documented but not yet wired to a real command:
    for future in ["asil-decomposition", "coverage-threshold", "method-table-compliance"] {
        assert!(
            ids.contains(&future),
            "expected FUTURE oracle `{future}` to be declared in iso-26262; ids: {ids:?}",
        );
    }
}
