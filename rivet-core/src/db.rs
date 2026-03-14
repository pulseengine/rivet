//! Salsa incremental computation database for Rivet.
//!
//! This module provides a salsa-based incremental validation layer that wraps
//! the existing validation pipeline. File contents and schema definitions are
//! modeled as salsa inputs; parsing, store construction, link graph building,
//! and validation are tracked functions whose results are cached and
//! automatically invalidated when inputs change.
//!
//! ## Phased adoption
//!
//! The existing `validate()`, `LinkGraph::build()`, `Store`, etc. stay as-is.
//! This layer calls into them — it does not replace them. The CLI opts in via
//! `rivet validate --incremental`.

use salsa::Setter;

use crate::formats::generic::parse_generic_yaml;
use crate::links::LinkGraph;
use crate::model::Artifact;
use crate::schema::{Schema, SchemaFile};
use crate::store::Store;
use crate::validate::Diagnostic;

// ── Salsa inputs ────────────────────────────────────────────────────────

/// A source file tracked as a salsa input.
///
/// Setting the `content` field triggers re-parsing of artifacts from this
/// file and, transitively, revalidation of anything that depends on them.
#[salsa::input]
pub struct SourceFile {
    pub path: String,
    pub content: String,
}

/// A schema file tracked as a salsa input.
///
/// Changing schema content triggers re-merging of the schema and
/// revalidation of all artifacts.
#[salsa::input]
pub struct SchemaInput {
    pub name: String,
    pub content: String,
}

/// Container for all source file inputs.
///
/// Salsa inputs cannot be variadic, so we use a single input that holds a
/// `Vec` of `SourceFile` handles.
#[salsa::input]
pub struct SourceFileSet {
    pub files: Vec<SourceFile>,
}

/// Container for all schema inputs.
#[salsa::input]
pub struct SchemaInputSet {
    pub schemas: Vec<SchemaInput>,
}

// ── Tracked functions ───────────────────────────────────────────────────

/// Parse artifacts from a single source file using the generic YAML adapter.
///
/// This is a salsa tracked function — results are memoized and only
/// recomputed when the `SourceFile` content changes.
#[salsa::tracked]
pub fn parse_artifacts(db: &dyn salsa::Database, source: SourceFile) -> Vec<Artifact> {
    let content = source.content(db);
    let path = source.path(db);
    match parse_generic_yaml(&content, None) {
        Ok(artifacts) => artifacts,
        Err(e) => {
            log::warn!("Failed to parse {}: {}", path, e);
            vec![]
        }
    }
}

/// Run full validation, returning all diagnostics.
///
/// This is the top-level tracked query. It builds the store, schema, and
/// link graph internally, then delegates to the existing `validate()`
/// pipeline. Changing any input file or schema triggers recomputation.
///
/// The store and link graph construction is folded in here rather than
/// being separate tracked functions because `Store` and `LinkGraph` do not
/// (yet) implement the `PartialEq` trait that salsa requires for tracked
/// return types. A future phase may lift them into their own tracked
/// functions once those traits are derived.
#[salsa::tracked]
pub fn validate_all(
    db: &dyn salsa::Database,
    source_set: SourceFileSet,
    schema_set: SchemaInputSet,
) -> Vec<Diagnostic> {
    let (store, schema, graph) = build_pipeline(db, source_set, schema_set);
    crate::validate::validate(&store, &schema, &graph)
}

// ── Internal helpers (non-tracked) ──────────────────────────────────────

/// Build the full Store + Schema + LinkGraph pipeline from salsa inputs.
///
/// This is NOT a tracked function — it is called from tracked functions
/// that need the intermediate results. Salsa still caches the outer
/// tracked call, so this pipeline is only re-executed when inputs change.
fn build_pipeline(
    db: &dyn salsa::Database,
    source_set: SourceFileSet,
    schema_set: SchemaInputSet,
) -> (Store, Schema, LinkGraph) {
    let store = build_store(db, source_set);
    let schema = build_schema(db, schema_set);
    let graph = LinkGraph::build(&store, &schema);
    (store, schema, graph)
}

/// Build an artifact `Store` from all source file inputs.
fn build_store(db: &dyn salsa::Database, source_set: SourceFileSet) -> Store {
    let sources = source_set.files(db);
    let mut store = Store::new();
    for source in sources {
        for artifact in parse_artifacts(db, source) {
            // Use upsert to avoid panics on duplicate IDs across files.
            store.upsert(artifact);
        }
    }
    store
}

/// Merge all schema inputs into a single `Schema`.
fn build_schema(db: &dyn salsa::Database, schema_set: SchemaInputSet) -> Schema {
    let schema_inputs = schema_set.schemas(db);
    let files: Vec<SchemaFile> = schema_inputs
        .iter()
        .filter_map(|s| {
            let content = s.content(db);
            serde_yaml::from_str(&content).ok()
        })
        .collect();
    Schema::merge(&files)
}

// ── Concrete database ───────────────────────────────────────────────────

/// The concrete salsa database for Rivet.
///
/// Callers create this, load inputs, and then call tracked functions to
/// get cached, incrementally-updated results.
#[salsa::db]
#[derive(Default)]
pub struct RivetDatabase {
    storage: salsa::Storage<Self>,
}

#[salsa::db]
impl salsa::Database for RivetDatabase {}

impl RivetDatabase {
    /// Create a new, empty database.
    pub fn new() -> Self {
        Self::default()
    }

    /// Load schema inputs from YAML content strings.
    ///
    /// Returns a `SchemaInputSet` handle that can be passed to tracked
    /// functions.
    pub fn load_schemas(&self, schemas: &[(&str, &str)]) -> SchemaInputSet {
        let inputs: Vec<SchemaInput> = schemas
            .iter()
            .map(|(name, content)| SchemaInput::new(self, name.to_string(), content.to_string()))
            .collect();
        SchemaInputSet::new(self, inputs)
    }

    /// Load source file inputs from (path, content) pairs.
    ///
    /// Returns a `SourceFileSet` handle that can be passed to tracked
    /// functions.
    pub fn load_sources(&self, sources: &[(&str, &str)]) -> SourceFileSet {
        let inputs: Vec<SourceFile> = sources
            .iter()
            .map(|(path, content)| SourceFile::new(self, path.to_string(), content.to_string()))
            .collect();
        SourceFileSet::new(self, inputs)
    }

    /// Update a single source file's content within an existing set.
    ///
    /// Finds the `SourceFile` with a matching path and updates its content.
    /// Salsa automatically invalidates all downstream queries.
    /// Returns `true` if the file was found and updated.
    pub fn update_source(
        &mut self,
        source_set: SourceFileSet,
        path: &str,
        new_content: String,
    ) -> bool {
        let files = source_set.files(self);
        for sf in files {
            if sf.path(self) == path {
                sf.set_content(self).to(new_content);
                return true;
            }
        }
        false
    }

    /// Get the current store (computed from source inputs).
    pub fn store(&self, source_set: SourceFileSet) -> Store {
        build_store(self, source_set)
    }

    /// Get the current merged schema (computed from schema inputs).
    pub fn schema(&self, schema_set: SchemaInputSet) -> Schema {
        build_schema(self, schema_set)
    }

    /// Get current validation diagnostics (incrementally computed).
    pub fn diagnostics(
        &self,
        source_set: SourceFileSet,
        schema_set: SchemaInputSet,
    ) -> Vec<Diagnostic> {
        validate_all(self, source_set, schema_set)
    }
}

// ── Tests ───────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;

    /// Minimal schema YAML with a single artifact type and a traceability rule.
    const TEST_SCHEMA: &str = r#"
schema:
  name: test
  version: "0.1.0"
artifact-types:
  - name: requirement
    description: A requirement
    fields: []
    link-fields: []
  - name: design-decision
    description: A design decision
    fields: []
    link-fields:
      - name: satisfies
        link-type: satisfies
        target-types: [requirement]
        required: false
        cardinality: zero-or-many
link-types:
  - name: satisfies
    description: Design satisfies a requirement
    inverse: satisfied-by
    source-types: [design-decision]
    target-types: [requirement]
traceability-rules:
  - name: dd-must-satisfy
    description: Every design decision must satisfy a requirement
    source-type: design-decision
    required-link: satisfies
    target-types: [requirement]
    severity: warning
"#;

    /// Source file with one requirement.
    const SOURCE_REQ: &str = r#"
artifacts:
  - id: REQ-001
    type: requirement
    title: System shall be safe
"#;

    /// Source file with a design decision linked to REQ-001.
    const SOURCE_DD_LINKED: &str = r#"
artifacts:
  - id: DD-001
    type: design-decision
    title: Use memory isolation
    links:
      - type: satisfies
        target: REQ-001
"#;

    /// Source file with a design decision that has no links.
    const SOURCE_DD_UNLINKED: &str = r#"
artifacts:
  - id: DD-001
    type: design-decision
    title: Use memory isolation
"#;

    // ── Test 1: empty database ──────────────────────────────────────────

    #[test]
    fn empty_database_no_diagnostics() {
        let db = RivetDatabase::new();
        let sources = db.load_sources(&[]);
        let schemas = db.load_schemas(&[("test", TEST_SCHEMA)]);

        let diags = db.diagnostics(sources, schemas);
        assert!(diags.is_empty(), "empty project should have no diagnostics");
    }

    // ── Test 2: create database with source + schema, get diagnostics ───

    #[test]
    fn diagnostics_for_unlinked_dd() {
        let db = RivetDatabase::new();
        let sources = db.load_sources(&[
            ("reqs.yaml", SOURCE_REQ),
            ("design.yaml", SOURCE_DD_UNLINKED),
        ]);
        let schemas = db.load_schemas(&[("test", TEST_SCHEMA)]);

        let diags = db.diagnostics(sources, schemas);

        // DD-001 has no satisfies link -> should produce a warning from
        // the "dd-must-satisfy" traceability rule.
        let dd_warnings: Vec<_> = diags
            .iter()
            .filter(|d| d.artifact_id.as_deref() == Some("DD-001"))
            .filter(|d| d.rule == "dd-must-satisfy")
            .collect();
        assert!(
            !dd_warnings.is_empty(),
            "expected a traceability warning for DD-001, got: {diags:?}"
        );
    }

    // ── Test 3: linked DD produces no traceability warning ──────────────

    #[test]
    fn no_warning_when_dd_is_linked() {
        let db = RivetDatabase::new();
        let sources =
            db.load_sources(&[("reqs.yaml", SOURCE_REQ), ("design.yaml", SOURCE_DD_LINKED)]);
        let schemas = db.load_schemas(&[("test", TEST_SCHEMA)]);

        let diags = db.diagnostics(sources, schemas);
        let dd_warnings: Vec<_> = diags
            .iter()
            .filter(|d| d.artifact_id.as_deref() == Some("DD-001"))
            .filter(|d| d.rule == "dd-must-satisfy")
            .collect();
        assert!(
            dd_warnings.is_empty(),
            "expected no traceability warning for linked DD-001, got: {dd_warnings:?}"
        );
    }

    // ── Test 4: update source file triggers recomputation ───────────────

    #[test]
    fn update_source_triggers_recomputation() {
        let mut db = RivetDatabase::new();
        let sources = db.load_sources(&[
            ("reqs.yaml", SOURCE_REQ),
            ("design.yaml", SOURCE_DD_UNLINKED),
        ]);
        let schemas = db.load_schemas(&[("test", TEST_SCHEMA)]);

        // Before update: DD-001 has no links -> warning expected.
        let diags_before = db.diagnostics(sources, schemas);
        let had_warning = diags_before
            .iter()
            .any(|d| d.artifact_id.as_deref() == Some("DD-001") && d.rule == "dd-must-satisfy");
        assert!(had_warning, "expected warning before update");

        // Update the design file to add a link.
        let updated = db.update_source(sources, "design.yaml", SOURCE_DD_LINKED.to_string());
        assert!(updated, "update_source should find the file");

        // After update: DD-001 now has a satisfies link -> warning should be gone.
        let diags_after = db.diagnostics(sources, schemas);
        let still_has_warning = diags_after
            .iter()
            .any(|d| d.artifact_id.as_deref() == Some("DD-001") && d.rule == "dd-must-satisfy");
        assert!(
            !still_has_warning,
            "expected no warning after update, got: {diags_after:?}"
        );
    }

    // ── Test 5: same inputs produce deterministic output ────────────────

    #[test]
    fn deterministic_output() {
        let db = RivetDatabase::new();
        let sources = db.load_sources(&[
            ("reqs.yaml", SOURCE_REQ),
            ("design.yaml", SOURCE_DD_UNLINKED),
        ]);
        let schemas = db.load_schemas(&[("test", TEST_SCHEMA)]);

        let diags_a = db.diagnostics(sources, schemas);
        let diags_b = db.diagnostics(sources, schemas);

        assert_eq!(
            diags_a, diags_b,
            "same inputs must produce identical diagnostics"
        );
    }

    // ── Test 6: adding artifact shows up in the store ───────────────────

    #[test]
    fn adding_artifact_appears_in_store() {
        let mut db = RivetDatabase::new();
        let sources = db.load_sources(&[("reqs.yaml", SOURCE_REQ)]);

        // Initially: 1 artifact (REQ-001).
        let store = db.store(sources);
        assert_eq!(store.len(), 1);
        assert!(store.contains("REQ-001"));

        // Add a second artifact by updating the file content.
        let combined = r#"
artifacts:
  - id: REQ-001
    type: requirement
    title: System shall be safe
  - id: REQ-002
    type: requirement
    title: System shall be reliable
"#;
        db.update_source(sources, "reqs.yaml", combined.to_string());

        let store = db.store(sources);
        assert_eq!(store.len(), 2);
        assert!(store.contains("REQ-001"));
        assert!(store.contains("REQ-002"));
    }

    // ── Test 7: removing artifact shows updated diagnostics ─────────────

    #[test]
    fn removing_artifact_updates_diagnostics() {
        let mut db = RivetDatabase::new();
        let sources =
            db.load_sources(&[("reqs.yaml", SOURCE_REQ), ("design.yaml", SOURCE_DD_LINKED)]);
        let schemas = db.load_schemas(&[("test", TEST_SCHEMA)]);

        // Before: DD-001 links to REQ-001 -> no broken-link diagnostic.
        let diags_before = db.diagnostics(sources, schemas);
        let broken_before: Vec<_> = diags_before
            .iter()
            .filter(|d| d.rule == "broken-link")
            .collect();
        assert!(broken_before.is_empty(), "no broken links initially");

        // Remove REQ-001 by making reqs.yaml empty.
        let empty_source = "artifacts: []\n";
        db.update_source(sources, "reqs.yaml", empty_source.to_string());

        // After: DD-001 links to REQ-001 which no longer exists -> broken link.
        let diags_after = db.diagnostics(sources, schemas);
        let broken_after: Vec<_> = diags_after
            .iter()
            .filter(|d| d.rule == "broken-link")
            .collect();
        assert!(
            !broken_after.is_empty(),
            "expected broken-link diagnostic after removing target, got: {diags_after:?}"
        );
    }

    // ── Test 8: update_source returns false for unknown path ────────────

    #[test]
    fn update_unknown_path_returns_false() {
        let mut db = RivetDatabase::new();
        let sources = db.load_sources(&[("reqs.yaml", SOURCE_REQ)]);

        let updated = db.update_source(sources, "nonexistent.yaml", "".to_string());
        assert!(!updated, "updating an unknown path should return false");
    }

    // ── Test 9: parse_artifacts tracked function ────────────────────────

    #[test]
    fn parse_artifacts_from_source() {
        let db = RivetDatabase::new();
        let source = SourceFile::new(&db, "test.yaml".to_string(), SOURCE_REQ.to_string());

        let artifacts = parse_artifacts(&db, source);
        assert_eq!(artifacts.len(), 1);
        assert_eq!(artifacts[0].id, "REQ-001");
        assert_eq!(artifacts[0].artifact_type, "requirement");
    }

    // ── Test 10: merged schema via build_schema ─────────────────────────

    #[test]
    fn merged_schema_parses_correctly() {
        let db = RivetDatabase::new();
        let schema_set = db.load_schemas(&[("test", TEST_SCHEMA)]);

        let schema = db.schema(schema_set);
        assert!(schema.artifact_type("requirement").is_some());
        assert!(schema.artifact_type("design-decision").is_some());
        assert!(schema.link_type("satisfies").is_some());
        assert_eq!(schema.inverse_of("satisfies"), Some("satisfied-by"));
    }
}
