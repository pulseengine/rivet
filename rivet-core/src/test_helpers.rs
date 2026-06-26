//! Shared test helpers for constructing schema and artifact fixtures.
//!
//! Centralises `SchemaFile`, `Artifact`, `Store`, and `LinkGraph` construction
//! so that adding a new field to any of these types requires updating only
//! this module instead of every test file.

// SAFETY-REVIEW (SCRC Phase 1, DD-058): File-scope blanket allow for
// the v0.4.3 clippy restriction-lint escalation. These lints are
// enabled at workspace scope at `warn` so new violations surface in
// CI; the existing call sites here are grandfathered in via this
// file-level allow until Phase 2 (per-site #[allow(...)] + rewrite).
// Rationale per lint class:
//   * unwrap_used / expect_used: legacy sites — many are on parser
//     post-conditions, BTreeMap lookups by key just inserted, or
//     regex::new on literals. Safe to keep; will migrate to ? with
//     typed errors in Phase 2 where user-facing.
//   * indexing_slicing / arithmetic_side_effects: tight math in
//     CST offsets, layout coordinates, and counted-loop indices that
//     is reviewed but not rewritten to checked_* for readability.
//   * as_conversions / cast_possible_truncation / cast_sign_loss:
//     usize<->u32/u64 in offsets where the value range is bounded by
//     input size (bytes of a loaded YAML file).
//   * wildcard_enum_match_arm / match_wildcard_for_single_variants:
//     tolerant parsers intentionally catch-all on token kinds.
//   * panic: only reached on programmer-error invariants.
//   * print_stdout / print_stderr: rivet-cli binary I/O.
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

use std::collections::BTreeMap;

use crate::links::LinkGraph;
use crate::model::{Artifact, Link};
use crate::schema::{Schema, SchemaFile, SchemaMetadata};
use crate::store::Store;

/// Create a minimal `SchemaFile` with sensible defaults.
///
/// Uses `SchemaFile::default()` (which `SchemaMetadata::default()`
/// fans out to empty strings) and sets only `schema.name` /
/// `schema.version`. Future fields added to `SchemaFile` get their
/// default values automatically — callers using `minimal_schema(...)`
/// don't need source changes when new fields land.
pub fn minimal_schema(name: &str) -> SchemaFile {
    SchemaFile {
        schema: SchemaMetadata {
            name: name.into(),
            version: "0.1.0".into(),
            ..Default::default()
        },
        ..Default::default()
    }
}

/// Create a minimal artifact with sensible defaults.
///
/// Sets `title` to `"Test {id}"` and leaves all optional / collection
/// fields empty or `None`.
pub fn minimal_artifact(id: &str, art_type: &str) -> Artifact {
    Artifact {
        id: id.into(),
        artifact_type: art_type.into(),
        title: format!("Test {id}"),
        description: None,
        status: None,
        release: None,
        tags: vec![],
        links: vec![],
        fields: BTreeMap::new(),
        fields_per_variant: Default::default(),
        provenance: None,
        source_file: None,
    }
}

/// Create an artifact with a status.
pub fn artifact_with_status(id: &str, art_type: &str, status: &str) -> Artifact {
    let mut a = minimal_artifact(id, art_type);
    a.status = Some(status.into());
    a
}

/// Create an artifact with links.
///
/// Each tuple is `(link_type, target_id)`.
pub fn artifact_with_links(id: &str, art_type: &str, links: &[(&str, &str)]) -> Artifact {
    let mut a = minimal_artifact(id, art_type);
    a.links = links
        .iter()
        .map(|(lt, t)| Link {
            link_type: lt.to_string(),
            target: t.to_string(),
            external: None,
        })
        .collect();
    a
}

/// Build a `Store` from a list of artifacts.
pub fn store_from(artifacts: Vec<Artifact>) -> Store {
    let mut store = Store::new();
    for a in artifacts {
        store.insert(a).unwrap();
    }
    store
}

/// Build a merged `Schema`, a `Store`, and a `LinkGraph` in one step.
pub fn pipeline(schema_file: SchemaFile, artifacts: Vec<Artifact>) -> (Schema, Store, LinkGraph) {
    let schema = Schema::merge(&[schema_file]);
    let store = store_from(artifacts);
    let graph = LinkGraph::build(&store, &schema);
    (schema, store, graph)
}
