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
//! This layer calls into them — it does not replace them. The CLI does not use
//! the salsa database yet; that will come in a later phase.

use salsa::Setter;

use crate::coverage::{self, CoverageReport};
use crate::formats::generic::parse_generic_yaml;
use crate::links::LinkGraph;
use crate::model::Artifact;
use crate::schema::{Schema, SchemaFile};
use crate::store::Store;
use crate::validate::Diagnostic;
#[cfg(feature = "rowan-yaml")]
use crate::yaml_hir;

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

/// Parse artifacts from a single source file.
///
/// Detects STPA files by filename and uses the stpa-yaml adapter;
/// Fallback parser using the generic YAML adapter (serde_yaml).
///
/// For files with `artifacts:` top-level key. Files using non-generic
/// formats (STPA sections like `losses:`, `hazards:`) return empty here;
/// they are handled by `parse_artifacts_v2` via schema-driven extraction.
///
/// This is a salsa tracked function — results are memoized and only
/// recomputed when the `SourceFile` content changes.
#[salsa::tracked]
pub fn parse_artifacts(db: &dyn salsa::Database, source: SourceFile) -> Vec<Artifact> {
    let content = source.content(db);
    let path = source.path(db);
    let source_path = std::path::Path::new(&path);

    match parse_generic_yaml(&content, Some(source_path)) {
        Ok(artifacts) => artifacts,
        Err(e) => {
            log::debug!("generic parse skipped for {}: {}", path, e);
            vec![]
        }
    }
}

/// Parse artifacts from a single source file using the schema-driven rowan parser.
///
/// Uses `yaml_hir::extract_schema_driven` which reads `yaml-section` metadata
/// from the schema to discover sections and auto-convert shorthand links.
///
/// This is a salsa tracked function — results are memoized and only
/// recomputed when the `SourceFile` content or `SchemaInputSet` changes.
#[cfg(feature = "rowan-yaml")]
#[salsa::tracked]
pub fn parse_artifacts_v2(
    db: &dyn salsa::Database,
    source: SourceFile,
    schema_set: SchemaInputSet,
) -> Vec<Artifact> {
    let content = source.content(db);
    let path = source.path(db);
    let source_path = std::path::Path::new(&path);

    let schema = build_schema(db, schema_set);
    let parsed = yaml_hir::extract_schema_driven(&content, &schema, Some(source_path));

    parsed.artifacts.into_iter().map(|sa| sa.artifact).collect()
}

/// Collect parse errors from all source files as diagnostics.
///
/// Each file that fails to parse produces a `yaml-parse-error` diagnostic
/// with the serde_yaml error details and line/column position.
#[salsa::tracked]
pub fn collect_parse_errors(
    db: &dyn salsa::Database,
    source_set: SourceFileSet,
) -> Vec<Diagnostic> {
    let mut errors = Vec::new();
    for source in source_set.files(db) {
        let content = source.content(db);
        let path = source.path(db);
        let source_path = std::path::Path::new(&path);

        let result = parse_generic_yaml(&content, Some(source_path))
            .map(|_| ())
            .map_err(|e| e.to_string());

        if let Err(msg) = result {
            // Try to extract line/column from the error message.
            // serde_yaml errors look like: "... at line X column Y"
            let (line, column) = parse_yaml_error_location(&msg);
            let mut diag = Diagnostic::new(
                crate::schema::Severity::Error,
                None,
                "yaml-parse-error",
                format!("{}: {msg}", source_path.display()),
            );
            diag.source_file = Some(source_path.to_path_buf());
            diag.line = line;
            diag.column = column;
            errors.push(diag);
        }
    }
    errors
}

/// Extract line/column from a serde_yaml error message.
fn parse_yaml_error_location(msg: &str) -> (Option<u32>, Option<u32>) {
    // serde_yaml errors contain "at line X column Y"
    if let Some(pos) = msg.find("at line ") {
        let rest = &msg[pos + 8..];
        let parts: Vec<&str> = rest.split_whitespace().collect();
        if parts.len() >= 3 && parts[1] == "column" {
            let line = parts[0].parse::<u32>().ok().map(|l| l.saturating_sub(1)); // 0-based
            let col = parts[2].parse::<u32>().ok().map(|c| c.saturating_sub(1));
            return (line, col);
        }
    }
    (None, None)
}

/// Run full validation, returning all diagnostics.
///
/// This is the top-level tracked query. It composes structural validation
/// (phases 1-7) with conditional-rule evaluation (phase 8) as separate
/// tracked queries. Salsa caches each independently — changing an
/// artifact only re-evaluates conditional rules when the condition's
/// input fields actually changed, and structural validation is unaffected
/// by schema-only changes to conditional rules.
///
/// The store construction is folded in here rather than being a separate
/// tracked function because `Store` does not (yet) implement the
/// `PartialEq` trait that salsa requires for tracked return types.
/// The link graph, however, is built via the tracked `build_link_graph`
/// function and shared across callers.
#[salsa::tracked]
pub fn validate_all(
    db: &dyn salsa::Database,
    source_set: SourceFileSet,
    schema_set: SchemaInputSet,
) -> Vec<Diagnostic> {
    // Parse errors come first — if a file can't be parsed, its artifacts
    // are missing and will cause cascading broken-link errors.
    let mut diagnostics = collect_parse_errors(db, source_set);

    let (store, schema, graph) = build_pipeline(db, source_set, schema_set);

    // Structural validation (phases 1-7)
    diagnostics.extend(crate::validate::validate_structural(
        &store, &schema, &graph,
    ));

    // Conditional rules (phase 8) — separate tracked query for finer
    // invalidation granularity.
    diagnostics.extend(evaluate_conditional_rules(db, source_set, schema_set));

    diagnostics
}

/// Evaluate conditional validation rules as a separate tracked query.
///
/// This function is cached independently from structural validation.
/// When only an artifact's field values change, salsa re-evaluates this
/// function without re-running the (typically more expensive) structural
/// validation. Conversely, when conditional rules are added or modified
/// in the schema, only this function is re-evaluated — structural
/// validation results are served from cache.
///
/// ## Salsa memoization note
///
/// Both `validate_all` and this function call `build_pipeline`, which is a
/// plain (non-tracked) helper. The tracked functions that `build_pipeline`
/// delegates to (`parse_artifacts` / `parse_artifacts_v2`) are individually
/// cached by salsa, so the repeated calls do NOT re-parse source files —
/// only the lightweight store/schema assembly runs twice.
#[salsa::tracked]
pub fn evaluate_conditional_rules(
    db: &dyn salsa::Database,
    source_set: SourceFileSet,
    schema_set: SchemaInputSet,
) -> Vec<Diagnostic> {
    let (store, schema, _graph) = build_pipeline(db, source_set, schema_set);

    let mut diagnostics = Vec::new();

    // Check rule consistency first (duplicate names, overlapping requirements)
    diagnostics.extend(crate::schema::check_conditional_consistency(
        &schema.conditional_rules,
    ));

    // Evaluate each conditional rule against each artifact (pre-compile regexes)
    for rule in &schema.conditional_rules {
        let compiled_re = rule.when.compile_regex();
        let condition_re = rule.condition.as_ref().and_then(|c| c.compile_regex());
        for artifact in store.iter() {
            // If a precondition is set, it must also match
            if let Some(cond) = &rule.condition {
                if !cond.matches_artifact_with(artifact, condition_re.as_ref()) {
                    continue;
                }
            }
            if rule
                .when
                .matches_artifact_with(artifact, compiled_re.as_ref())
            {
                diagnostics.extend(rule.then.check(artifact, &rule.name, rule.severity));
            }
        }
    }

    diagnostics
}

/// Build the link graph as a tracked function.
///
/// This is memoized by salsa — when `build_link_graph` is called from
/// multiple tracked functions (`validate_all`, `evaluate_conditional_rules`,
/// `compute_coverage_tracked`), the graph is built only once per revision.
///
/// `LinkGraph` implements `PartialEq`/`Eq` (comparing forward, backward,
/// and broken link maps) so that salsa can detect when the graph has not
/// semantically changed, enabling further downstream memoization.
#[salsa::tracked]
pub fn build_link_graph(
    db: &dyn salsa::Database,
    source_set: SourceFileSet,
    schema_set: SchemaInputSet,
) -> LinkGraph {
    let store = build_store(db, source_set, schema_set);
    let schema = build_schema(db, schema_set);
    LinkGraph::build(&store, &schema)
}

/// Compute traceability coverage as a tracked function.
///
/// Results are memoized by salsa and only recomputed when source files
/// or schema inputs change. Multiple callers within the same revision
/// get the cached result for free.
#[salsa::tracked]
pub fn compute_coverage_tracked(
    db: &dyn salsa::Database,
    source_set: SourceFileSet,
    schema_set: SchemaInputSet,
) -> CoverageReport {
    let store = build_store(db, source_set, schema_set);
    let schema = build_schema(db, schema_set);
    let graph = build_link_graph(db, source_set, schema_set);
    coverage::compute_coverage(&store, &schema, &graph)
}

// ── Internal helpers (non-tracked) ──────────────────────────────────────

/// Build the full Store + Schema + LinkGraph pipeline from salsa inputs.
///
/// This is NOT a tracked function — it is called from tracked functions
/// that need the intermediate results. The link graph is obtained from
/// the tracked `build_link_graph` function, so it is memoized across
/// callers.
fn build_pipeline(
    db: &dyn salsa::Database,
    source_set: SourceFileSet,
    schema_set: SchemaInputSet,
) -> (Store, Schema, LinkGraph) {
    let store = build_store(db, source_set, schema_set);
    let schema = build_schema(db, schema_set);
    let graph = build_link_graph(db, source_set, schema_set);
    (store, schema, graph)
}

/// Build an artifact `Store` from all source file inputs.
///
/// When the `rowan-yaml` feature is enabled, uses the schema-driven rowan
/// parser (`parse_artifacts_v2`) which reads `yaml-section` metadata from
/// the schema. In debug builds, both parsers run and their output is
fn build_store(
    db: &dyn salsa::Database,
    source_set: SourceFileSet,
    schema_set: SchemaInputSet,
) -> Store {
    #[cfg(not(feature = "rowan-yaml"))]
    let _ = schema_set;

    let sources = source_set.files(db);
    let mut store = Store::new();
    for source in sources {
        #[cfg(feature = "rowan-yaml")]
        let artifacts = parse_artifacts_v2(db, source, schema_set);

        #[cfg(not(feature = "rowan-yaml"))]
        let artifacts = parse_artifacts(db, source);

        for artifact in artifacts {
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

    /// Get the current store (computed from source and schema inputs).
    pub fn store(&self, source_set: SourceFileSet, schema_set: SchemaInputSet) -> Store {
        build_store(self, source_set, schema_set)
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

    /// Get only the conditional-rule diagnostics (incrementally computed).
    ///
    /// Useful for inspecting conditional rule results separately from
    /// structural validation.
    pub fn conditional_diagnostics(
        &self,
        source_set: SourceFileSet,
        schema_set: SchemaInputSet,
    ) -> Vec<Diagnostic> {
        evaluate_conditional_rules(self, source_set, schema_set)
    }

    /// Get the link graph (incrementally computed, salsa-tracked).
    pub fn link_graph(&self, source_set: SourceFileSet, schema_set: SchemaInputSet) -> LinkGraph {
        build_link_graph(self, source_set, schema_set)
    }

    /// Get traceability coverage (incrementally computed, salsa-tracked).
    pub fn coverage(
        &self,
        source_set: SourceFileSet,
        schema_set: SchemaInputSet,
    ) -> CoverageReport {
        compute_coverage_tracked(self, source_set, schema_set)
    }

    /// Add a new source file to an existing source file set.
    ///
    /// Creates a new `SourceFile` input and rebuilds the set with the
    /// additional file included. Returns the updated `SourceFileSet`.
    pub fn add_source(
        &mut self,
        source_set: SourceFileSet,
        path: &str,
        content: String,
    ) -> SourceFileSet {
        let new_file = SourceFile::new(self, path.to_string(), content);
        let mut files = source_set.files(self);
        files.push(new_file);
        source_set.set_files(self).to(files);
        source_set
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

    // rivet: verifies REQ-029
    #[test]
    fn empty_database_no_diagnostics() {
        let db = RivetDatabase::new();
        let sources = db.load_sources(&[]);
        let schemas = db.load_schemas(&[("test", TEST_SCHEMA)]);

        let diags = db.diagnostics(sources, schemas);
        assert!(diags.is_empty(), "empty project should have no diagnostics");
    }

    // ── Test 2: create database with source + schema, get diagnostics ───

    // rivet: verifies REQ-029
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

    // rivet: verifies REQ-029
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

    // rivet: verifies REQ-029
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

    // rivet: verifies REQ-029
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

    // rivet: verifies REQ-029
    #[test]
    fn adding_artifact_appears_in_store() {
        let mut db = RivetDatabase::new();
        let sources = db.load_sources(&[("reqs.yaml", SOURCE_REQ)]);
        let schemas = db.load_schemas(&[("test", TEST_SCHEMA)]);

        // Initially: 1 artifact (REQ-001).
        let store = db.store(sources, schemas);
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

        let store = db.store(sources, schemas);
        assert_eq!(store.len(), 2);
        assert!(store.contains("REQ-001"));
        assert!(store.contains("REQ-002"));
    }

    // ── Test 7: removing artifact shows updated diagnostics ─────────────

    // rivet: verifies REQ-029
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

    // rivet: verifies REQ-029
    #[test]
    fn update_unknown_path_returns_false() {
        let mut db = RivetDatabase::new();
        let sources = db.load_sources(&[("reqs.yaml", SOURCE_REQ)]);

        let updated = db.update_source(sources, "nonexistent.yaml", "".to_string());
        assert!(!updated, "updating an unknown path should return false");
    }

    // ── Test 9: parse_artifacts tracked function ────────────────────────

    // rivet: verifies REQ-029
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

    // rivet: verifies REQ-029
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

    // ── Conditional rules tracked query tests ────────────────────────────

    /// Schema with a conditional rule: approved artifacts must have a description.
    const SCHEMA_WITH_CONDITIONAL: &str = r#"
schema:
  name: test-conditional
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
conditional-rules:
  - name: approved-needs-desc
    when:
      field: status
      equals: approved
    then:
      required-fields: [description]
    severity: error
"#;

    /// Schema with duplicate conditional rule names (for consistency test).
    const SCHEMA_WITH_DUP_RULES: &str = r#"
schema:
  name: test-dup
  version: "0.1.0"
artifact-types:
  - name: requirement
    description: A requirement
    fields: []
    link-fields: []
conditional-rules:
  - name: same-name
    when:
      field: status
      equals: approved
    then:
      required-fields: [description]
    severity: error
  - name: same-name
    when:
      field: status
      equals: draft
    then:
      required-fields: [rationale]
    severity: warning
"#;

    /// Source with an approved requirement that has no description.
    const SOURCE_REQ_APPROVED_NO_DESC: &str = r#"
artifacts:
  - id: REQ-010
    type: requirement
    title: Approved without description
    status: approved
"#;

    /// Source with an approved requirement that has a description.
    const SOURCE_REQ_APPROVED_WITH_DESC: &str = r#"
artifacts:
  - id: REQ-010
    type: requirement
    title: Approved with description
    status: approved
    description: This requirement is fully described
"#;

    /// Source with a draft requirement (condition should NOT match).
    const SOURCE_REQ_DRAFT: &str = r#"
artifacts:
  - id: REQ-010
    type: requirement
    title: Draft requirement
    status: draft
"#;

    // ── Test 11: evaluate_conditional_rules returns diagnostics ──────────

    // rivet: verifies REQ-029
    #[test]
    fn conditional_rules_fire_for_matching_artifacts() {
        let db = RivetDatabase::new();
        let sources = db.load_sources(&[("reqs.yaml", SOURCE_REQ_APPROVED_NO_DESC)]);
        let schemas = db.load_schemas(&[("test", SCHEMA_WITH_CONDITIONAL)]);

        let diags = db.conditional_diagnostics(sources, schemas);

        // REQ-010 is approved but has no description -> conditional rule fires.
        let cond_diags: Vec<_> = diags
            .iter()
            .filter(|d| d.rule == "approved-needs-desc")
            .collect();
        assert_eq!(
            cond_diags.len(),
            1,
            "expected 1 conditional diagnostic for approved artifact without description, got: {diags:?}"
        );
        assert_eq!(cond_diags[0].artifact_id.as_deref(), Some("REQ-010"),);
        assert_eq!(cond_diags[0].severity, crate::schema::Severity::Error);
    }

    // ── Test 12: conditional rules do not fire when condition is unmet ───

    // rivet: verifies REQ-029
    #[test]
    fn conditional_rules_skip_non_matching_artifacts() {
        let db = RivetDatabase::new();
        let sources = db.load_sources(&[("reqs.yaml", SOURCE_REQ_DRAFT)]);
        let schemas = db.load_schemas(&[("test", SCHEMA_WITH_CONDITIONAL)]);

        let diags = db.conditional_diagnostics(sources, schemas);

        // REQ-010 is draft -> condition (status=approved) not met -> no diagnostic.
        let cond_diags: Vec<_> = diags
            .iter()
            .filter(|d| d.rule == "approved-needs-desc")
            .collect();
        assert!(
            cond_diags.is_empty(),
            "draft artifact should not trigger approved-needs-desc, got: {cond_diags:?}"
        );
    }

    // ── Test 13: adding a conditional rule re-evaluates ──────────────────

    // rivet: verifies REQ-029
    #[test]
    fn adding_conditional_rule_triggers_reevaluation() {
        let db = RivetDatabase::new();
        let sources = db.load_sources(&[("reqs.yaml", SOURCE_REQ_APPROVED_NO_DESC)]);

        // Start without conditional rules.
        let schemas = db.load_schemas(&[("test", TEST_SCHEMA)]);
        let diags_before = db.conditional_diagnostics(sources, schemas);
        let cond_before: Vec<_> = diags_before
            .iter()
            .filter(|d| d.rule == "approved-needs-desc")
            .collect();
        assert!(
            cond_before.is_empty(),
            "no conditional rules in schema -> no conditional diagnostics"
        );

        // Now load a schema with conditional rules.
        let schemas_with_rules = db.load_schemas(&[("test", SCHEMA_WITH_CONDITIONAL)]);
        let diags_after = db.conditional_diagnostics(sources, schemas_with_rules);
        let cond_after: Vec<_> = diags_after
            .iter()
            .filter(|d| d.rule == "approved-needs-desc")
            .collect();
        assert_eq!(
            cond_after.len(),
            1,
            "adding conditional rule should produce diagnostics"
        );
    }

    // ── Test 14: conditional rules compose with structural validation ────

    // rivet: verifies REQ-029
    #[test]
    fn conditional_and_structural_compose_in_validate_all() {
        let db = RivetDatabase::new();

        // DD-001 is unlinked (structural: dd-must-satisfy warning) and
        // REQ-010 is approved without description (conditional: approved-needs-desc error).
        let sources = db.load_sources(&[
            ("reqs.yaml", SOURCE_REQ_APPROVED_NO_DESC),
            ("design.yaml", SOURCE_DD_UNLINKED),
        ]);
        let schemas = db.load_schemas(&[("test", SCHEMA_WITH_CONDITIONAL)]);

        let diags = db.diagnostics(sources, schemas);

        // Should have the structural traceability warning.
        let structural: Vec<_> = diags
            .iter()
            .filter(|d| d.rule == "dd-must-satisfy")
            .collect();
        assert!(
            !structural.is_empty(),
            "expected structural dd-must-satisfy warning in composed diagnostics"
        );

        // Should also have the conditional rule error.
        let conditional: Vec<_> = diags
            .iter()
            .filter(|d| d.rule == "approved-needs-desc")
            .collect();
        assert!(
            !conditional.is_empty(),
            "expected conditional approved-needs-desc error in composed diagnostics"
        );
    }

    // ── Test 15: rule consistency errors included in diagnostics ─────────

    // rivet: verifies REQ-029
    #[test]
    fn rule_consistency_errors_in_conditional_diagnostics() {
        let db = RivetDatabase::new();
        let sources = db.load_sources(&[("reqs.yaml", SOURCE_REQ)]);
        let schemas = db.load_schemas(&[("test", SCHEMA_WITH_DUP_RULES)]);

        let diags = db.conditional_diagnostics(sources, schemas);

        // Duplicate rule name "same-name" should produce a consistency warning.
        let consistency: Vec<_> = diags
            .iter()
            .filter(|d| d.rule == "conditional-rule-consistency")
            .collect();
        assert!(
            !consistency.is_empty(),
            "expected consistency diagnostic for duplicate rule names, got: {diags:?}"
        );
        assert!(
            consistency[0].message.contains("same-name"),
            "consistency diagnostic should mention the duplicate name"
        );
    }

    // ── Test 16: conditional diagnostics absent when requirement met ─────

    // rivet: verifies REQ-029
    #[test]
    fn no_conditional_diagnostic_when_requirement_satisfied() {
        let db = RivetDatabase::new();
        let sources = db.load_sources(&[("reqs.yaml", SOURCE_REQ_APPROVED_WITH_DESC)]);
        let schemas = db.load_schemas(&[("test", SCHEMA_WITH_CONDITIONAL)]);

        let diags = db.conditional_diagnostics(sources, schemas);

        // REQ-010 is approved and HAS a description -> no diagnostic.
        let cond_diags: Vec<_> = diags
            .iter()
            .filter(|d| d.rule == "approved-needs-desc")
            .collect();
        assert!(
            cond_diags.is_empty(),
            "approved artifact with description should pass, got: {cond_diags:?}"
        );
    }

    // ── Test 17: build_link_graph tracked function ─────────────────────────

    // rivet: verifies REQ-029
    #[test]
    fn build_link_graph_tracked() {
        let db = RivetDatabase::new();
        let sources =
            db.load_sources(&[("reqs.yaml", SOURCE_REQ), ("design.yaml", SOURCE_DD_LINKED)]);
        let schemas = db.load_schemas(&[("test", TEST_SCHEMA)]);

        let graph = db.link_graph(sources, schemas);

        // DD-001 has a forward link to REQ-001
        let fwd = graph.links_from("DD-001");
        assert_eq!(fwd.len(), 1);
        assert_eq!(fwd[0].target, "REQ-001");
        assert_eq!(fwd[0].link_type, "satisfies");

        // REQ-001 has a backlink from DD-001
        let bwd = graph.backlinks_to("REQ-001");
        assert_eq!(bwd.len(), 1);
        assert_eq!(bwd[0].source, "DD-001");

        // No broken links
        assert!(graph.broken.is_empty());
    }

    // ── Test 18: build_link_graph returns same result on repeated call ──────

    // rivet: verifies REQ-029
    #[test]
    fn link_graph_deterministic() {
        let db = RivetDatabase::new();
        let sources =
            db.load_sources(&[("reqs.yaml", SOURCE_REQ), ("design.yaml", SOURCE_DD_LINKED)]);
        let schemas = db.load_schemas(&[("test", TEST_SCHEMA)]);

        let graph_a = db.link_graph(sources, schemas);
        let graph_b = db.link_graph(sources, schemas);
        assert_eq!(
            graph_a, graph_b,
            "repeated calls must produce identical link graphs"
        );
    }

    // ── Test 19: compute_coverage_tracked function ─────────────────────────

    // rivet: verifies REQ-029
    #[test]
    fn coverage_tracked_basic() {
        let db = RivetDatabase::new();
        let sources =
            db.load_sources(&[("reqs.yaml", SOURCE_REQ), ("design.yaml", SOURCE_DD_LINKED)]);
        let schemas = db.load_schemas(&[("test", TEST_SCHEMA)]);

        let report = db.coverage(sources, schemas);

        // The schema has one traceability rule: dd-must-satisfy
        assert_eq!(report.entries.len(), 1);
        let entry = &report.entries[0];
        assert_eq!(entry.rule_name, "dd-must-satisfy");
        // DD-001 links to REQ-001 via satisfies -> 100% coverage
        assert_eq!(entry.covered, 1);
        assert_eq!(entry.total, 1);
        assert!(entry.uncovered_ids.is_empty());
    }

    // ── Test 20: coverage updates when source changes ──────────────────────

    // rivet: verifies REQ-029
    #[test]
    fn coverage_updates_on_source_change() {
        let mut db = RivetDatabase::new();
        let sources =
            db.load_sources(&[("reqs.yaml", SOURCE_REQ), ("design.yaml", SOURCE_DD_LINKED)]);
        let schemas = db.load_schemas(&[("test", TEST_SCHEMA)]);

        // Before: DD-001 links to REQ-001 -> full coverage
        let report_before = db.coverage(sources, schemas);
        assert_eq!(report_before.entries[0].covered, 1);

        // Remove the link
        db.update_source(sources, "design.yaml", SOURCE_DD_UNLINKED.to_string());

        // After: DD-001 has no link -> zero coverage
        let report_after = db.coverage(sources, schemas);
        assert_eq!(report_after.entries[0].covered, 0);
        assert_eq!(report_after.entries[0].uncovered_ids, vec!["DD-001"]);
    }

    // ── Test 21: coverage deterministic ────────────────────────────────────

    // rivet: verifies REQ-029
    #[test]
    fn coverage_deterministic() {
        let db = RivetDatabase::new();
        let sources =
            db.load_sources(&[("reqs.yaml", SOURCE_REQ), ("design.yaml", SOURCE_DD_LINKED)]);
        let schemas = db.load_schemas(&[("test", TEST_SCHEMA)]);

        let report_a = db.coverage(sources, schemas);
        let report_b = db.coverage(sources, schemas);
        assert_eq!(
            report_a, report_b,
            "repeated coverage calls must produce identical reports"
        );
    }
}
