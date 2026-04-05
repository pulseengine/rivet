//! Shared test helpers for constructing schema and artifact fixtures.
//!
//! Centralises `SchemaFile`, `Artifact`, `Store`, and `LinkGraph` construction
//! so that adding a new field to any of these types requires updating only
//! this module instead of every test file.

use std::collections::BTreeMap;

use crate::links::LinkGraph;
use crate::model::{Artifact, Link};
use crate::schema::{Schema, SchemaFile, SchemaMetadata};
use crate::store::Store;

/// Create a minimal `SchemaFile` with sensible defaults.
///
/// All `Vec` fields default to empty; all `Option` fields default to `None`.
/// Callers can mutate the returned value to set specific fields before
/// passing it to `Schema::merge`.
pub fn minimal_schema(name: &str) -> SchemaFile {
    SchemaFile {
        schema: SchemaMetadata {
            name: name.into(),
            version: "0.1.0".into(),
            namespace: None,
            description: None,
            extends: vec![],
            min_rivet_version: None,
            license: None,
        },
        base_fields: vec![],
        artifact_types: vec![],
        link_types: vec![],
        traceability_rules: vec![],
        conditional_rules: vec![],
        // Future fields get default values here -- ONE place to update.
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
        tags: vec![],
        links: vec![],
        fields: BTreeMap::new(),
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
