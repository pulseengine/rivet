# LSP + Salsa Incremental Architecture Design

**Date:** 2026-03-21
**Builds on:** [rowan + salsa completion plan](2026-03-16-rowan-salsa-completion.md)
**Related artifacts:** REQ-029, REQ-036, DD-032, FEAT-056, FEAT-057

---

## 1. Current State Summary

### What exists today in rivet-core/src/db.rs

The salsa 0.26 database is already functional:

- **Inputs:** `SourceFile` (path + content), `SchemaInput` (name + content), with `SourceFileSet` / `SchemaInputSet` containers.
- **Tracked functions:** `parse_artifacts(file) -> Vec<Artifact>`, `validate_all(sources, schemas) -> Vec<Diagnostic>`, `evaluate_conditional_rules(sources, schemas) -> Vec<Diagnostic>`.
- **Non-tracked helpers:** `build_pipeline`, `build_store`, `build_schema` -- called from tracked functions but not individually cached because `Store` and `LinkGraph` lack `PartialEq`.
- **Concrete database:** `RivetDatabase` with `load_schemas()`, `load_sources()`, `update_source()`, `store()`, `schema()`, `diagnostics()`.
- **16 tests** covering incremental recomputation, conditional rules, determinism, and boundary cases.
- **CLI integration:** `rivet validate --incremental` and `--verify-incremental` flags (opt-in).

### What exists in spar (reference architecture)

Spar's LSP at `/Volumes/Home/git/pulseengine/spar/crates/spar-cli/src/lsp.rs` uses:

- **`lsp-server` 0.7 + `lsp-types` 0.97** (synchronous, single-threaded event loop on stdin/stdout)
- **`ServerState`** struct holding: `documents` (open file contents), `item_trees` (parsed HIR per file), `global_scope` (workspace-wide name resolution), `open_files` list
- **Full text sync** (`TextDocumentSyncKind::FULL`) -- on each change, full document replaces previous
- **Features:** diagnostics, hover, document symbols, go-to-definition, completions, code actions, formatting, rename, inlay hints, workspace symbols
- **No salsa in the LSP path** -- spar-base-db has a salsa database but the LSP does its own HashMap-based caching with `ItemTree` per file and a `GlobalScope` rebuilt on each change
- **File watchers** registered for `**/*.aadl` to pick up disk changes outside the editor

### Key differences: Rivet vs Spar for LSP

| Aspect | Spar | Rivet |
|--------|------|-------|
| File format | AADL (custom grammar) | YAML (well-known format) |
| Parser | Hand-written rowan CST | serde_yaml (no CST today) |
| Token-level precision | Yes (rowan TextSize) | No (line-level at best) |
| Workspace scope | All `.aadl` files | Files listed in `rivet.yaml` sources |
| Cross-file references | Classifier references | Artifact ID links |
| Incremental DB | salsa (not used in LSP) | salsa (should be used in LSP) |
| Runtime | Sync (lsp-server) | Async available (tokio already in tree) |

---

## 2. Architecture Decision: lsp-server vs tower-lsp

### Recommendation: `lsp-server` (same as spar)

**Against the earlier DD-032 recommendation of tower-lsp.** Rationale:

1. **Consistency with spar.** Both PulseEngine projects use the same LSP library. Shared patterns, shared bugs, shared knowledge.

2. **tower-lsp is unmaintained.** The crate has had minimal activity. The `lsp-server` crate is maintained as part of rust-analyzer's ecosystem (the most battle-tested Rust LSP).

3. **Simplicity.** `lsp-server` is a thin transport layer (~300 lines of glue). The complexity lives in our domain logic, not the protocol layer. We do not need tower middleware or async request handling -- artifact YAML validation is CPU-bound and fast enough to run synchronously.

4. **Tokio is not needed for LSP.** The LSP server runs on stdin/stdout. The existing tokio dependency is for `rivet serve` (axum). The LSP process is separate -- it does not share a runtime with the dashboard.

5. **Known pattern.** Spar's LSP is ~1200 lines and covers 11 features. We can port the structural pattern directly.

**If tower-lsp becomes actively maintained or we need async request handling (e.g., for OSLC remote validation), we can migrate. The domain logic is transport-agnostic.**

### Alternative considered: async-lsp

The `async-lsp` crate is a newer alternative that uses tower's Service trait without tower-lsp's specific abstractions. Worth watching but too young for production use.

---

## 3. Crate Structure Decision

### Recommendation: Option B -- `rivet lsp` subcommand in rivet-cli

**Not a separate `rivet-lsp` crate.** Rationale:

1. **Single binary.** Users install `rivet` and get everything: validate, serve, lsp. No separate binary to manage.

2. **Spar's pattern.** Spar puts its LSP in `spar-cli/src/lsp.rs` as a subcommand. It works well.

3. **Shared state types.** The LSP needs `RivetDatabase`, `Store`, `Schema`, `Diagnostic` -- all from rivet-core. A separate crate would just re-export these.

4. **Build time.** `lsp-server` and `lsp-types` are small crates. Adding them to rivet-cli does not meaningfully increase build time.

5. **Feature gate if needed.** We can put the LSP behind `rivet-cli/features = ["lsp"]` and gate the `lsp-server`/`lsp-types` dependencies. But the default should include it.

### File layout

```
rivet-cli/
  src/
    main.rs          -- adds `Lsp` variant to Command enum
    lsp/
      mod.rs         -- run_lsp_server(), main_loop(), ServerState
      diagnostics.rs -- rivet Diagnostic -> LSP Diagnostic conversion
      hover.rs       -- hover handlers
      completion.rs  -- completion handlers
      definition.rs  -- go-to-definition
      symbols.rs     -- document symbols, workspace symbols
      actions.rs     -- code actions
      util.rs        -- offset/position conversion, URI helpers
```

Splitting into submodules (unlike spar's single file) because Rivet's LSP domain is more complex: YAML position tracking, schema-aware completions, multi-source-format awareness. Spar's 1200-line single file works for AADL but would be unwieldy for Rivet's richer feature set.

---

## 4. Salsa Database Design for LSP

### 4.1 Why use salsa in the LSP (unlike spar)

Spar's LSP does not use its salsa database. It re-parses on every change and manually caches `ItemTree` per file. This works because AADL parsing is fast and the scope rebuild is cheap.

Rivet should use salsa because:

1. **Validation is expensive.** Building the full link graph + running 8-phase validation across 300+ artifacts on every keystroke is wasteful. Salsa caches intermediate results.

2. **The database already exists.** `RivetDatabase` with all tracked functions is ready. The LSP just needs to feed it file changes and read results.

3. **Cross-file dependencies are complex.** Changing a link target in file A affects validation results for file B (broken links, traceability coverage). Salsa tracks these dependencies automatically.

4. **Shared with other consumers.** The same database design serves `rivet validate --watch`, `rivet serve` (dashboard), and `rivet lsp`. One investment, three payoffs.

### 4.2 Salsa Inputs

The existing inputs are sufficient. No new salsa input types are needed for the LSP:

```rust
// Already in db.rs:
#[salsa::input]
pub struct SourceFile {
    pub path: String,
    pub content: String,
}

#[salsa::input]
pub struct SchemaInput {
    pub name: String,
    pub content: String,
}

#[salsa::input]
pub struct SourceFileSet { pub files: Vec<SourceFile> }

#[salsa::input]
pub struct SchemaInputSet { pub schemas: Vec<SchemaInput> }
```

The LSP `ServerState` will hold:
- A `RivetDatabase` instance
- The `SourceFileSet` and `SchemaInputSet` handles
- A mapping from file URI to `SourceFile` salsa key (for targeted updates)

### 4.3 Tracked Functions: Existing + New

**Existing (no changes needed):**

```rust
#[salsa::tracked]
fn parse_artifacts(db: &dyn salsa::Database, source: SourceFile) -> Vec<Artifact>;

#[salsa::tracked]
fn validate_all(db, source_set, schema_set) -> Vec<Diagnostic>;

#[salsa::tracked]
fn evaluate_conditional_rules(db, source_set, schema_set) -> Vec<Diagnostic>;
```

**New tracked functions for LSP features:**

```rust
/// All artifact IDs in the workspace, sorted. Used for completions.
/// Cached -- only recomputed when any source file changes.
#[salsa::tracked]
fn all_artifact_ids(db: &dyn salsa::Database, source_set: SourceFileSet) -> Vec<String>;

/// All artifact type names from the merged schema. Used for type completions.
#[salsa::tracked]
fn all_type_names(db: &dyn salsa::Database, schema_set: SchemaInputSet) -> Vec<String>;

/// All link type names from the merged schema. Used for link type completions.
#[salsa::tracked]
fn all_link_types(db: &dyn salsa::Database, schema_set: SchemaInputSet) -> Vec<String>;

/// Artifact index: map from artifact ID -> (source file path, line number).
/// Used for go-to-definition. Cached per source file.
#[salsa::tracked]
fn artifact_locations(db: &dyn salsa::Database, source: SourceFile)
    -> Vec<(String, usize)>;  // (artifact_id, line_number)

/// Diagnostics for a single file (filtered from all_diagnostics).
/// This is NOT a salsa tracked function -- it is a simple filter on the
/// validate_all result, done in the LSP layer. Salsa caches validate_all;
/// the per-file filter is cheap.
```

### 4.4 How Incremental Recomputation Works for YAML

**Scenario:** User edits `artifacts/requirements.yaml` in VS Code.

1. LSP receives `textDocument/didChange` with full document text.
2. `ServerState` calls `db.update_source(source_set, "artifacts/requirements.yaml", new_content)`.
3. Salsa marks the `SourceFile` input as changed.
4. Next query (e.g., `db.diagnostics(source_set, schema_set)`) triggers:
   - `parse_artifacts` re-runs for the changed file only. Other files' parse results are cached.
   - `build_store` re-assembles the `Store` (cheap: iterate cached parse results).
   - `build_schema` is **not** re-run (schema files did not change).
   - `LinkGraph::build` re-runs (depends on the store).
   - `validate_structural` re-runs (depends on store + schema + graph).
   - `evaluate_conditional_rules` re-runs (depends on store + schema).
5. LSP publishes diagnostics to the client.

**What is NOT recomputed:**
- Parsing of unchanged source files
- Schema merging (schemas did not change)
- If the edit does not change the parse result (e.g., whitespace-only), salsa detects the `Vec<Artifact>` is identical and short-circuits all downstream queries

**Future optimization (Phase D1 from the completion plan):**
Per-artifact salsa tracking would allow changing one artifact in a multi-artifact file to skip re-validation of the others. This requires `#[salsa::tracked] struct TrackedArtifact` with artifact ID as identity key. Not needed for initial LSP -- file-level granularity is fast enough for 300 artifacts.

### 4.5 Connecting to the Existing Validation Pipeline

The LSP does **not** replace the validation pipeline. It wraps it:

```
rivet validate (CLI)
    └── validate::validate()  ← direct call, no salsa
    └── validate::validate() via db.diagnostics() ← --incremental flag

rivet lsp
    └── db.diagnostics()  ← always uses salsa

rivet serve
    └── db.diagnostics()  ← future: shared salsa DB (Phase A7)
```

The `validate::validate()` and `validate::validate_structural()` functions remain unchanged. The salsa tracked functions call them. The LSP reads results from salsa. This layered architecture means:

- **No breaking changes** to the batch pipeline
- **SC-11 parity** can be verified: `--verify-incremental` confirms salsa produces identical results
- **One validation implementation** serves all consumers

---

## 5. LSP Server Design

### 5.1 ServerState

```rust
struct ServerState {
    /// The salsa incremental database.
    db: RivetDatabase,

    /// Handle to all source file inputs.
    source_set: SourceFileSet,

    /// Handle to all schema inputs.
    schema_set: SchemaInputSet,

    /// Map from file URI string -> SourceFile salsa key.
    /// Enables O(1) lookup for targeted updates on didChange.
    uri_to_source: HashMap<String, SourceFile>,

    /// Project configuration from rivet.yaml.
    config: ProjectConfig,

    /// Workspace root directory.
    workspace_root: PathBuf,

    /// URIs of files currently open in the editor.
    open_files: Vec<String>,

    /// Cached line indices for open files (for offset <-> position conversion).
    /// Rebuilt when file content changes.
    line_indices: HashMap<String, LineIndex>,
}
```

### 5.2 Initialization Sequence

```
1. Client sends initialize request
2. Server extracts workspace root from InitializeParams
3. Server looks for rivet.yaml in workspace root
4. Server loads ProjectConfig from rivet.yaml
5. Server loads all schema files listed in config.project.schemas
   -> Creates SchemaInput for each, builds SchemaInputSet
6. Server scans all source directories listed in config.sources
   -> Creates SourceFile for each YAML file found, builds SourceFileSet
7. Server stores the SourceFileSet, SchemaInputSet, and uri_to_source map
8. Server runs initial validation: db.diagnostics(source_set, schema_set)
9. Server responds with capabilities
10. Server registers file watchers for *.yaml in workspace
```

### 5.3 Capabilities

```rust
fn server_capabilities() -> ServerCapabilities {
    ServerCapabilities {
        text_document_sync: Some(TextDocumentSyncCapability::Kind(
            TextDocumentSyncKind::FULL
        )),
        hover_provider: Some(HoverProviderCapability::Simple(true)),
        definition_provider: Some(OneOf::Left(true)),
        document_symbol_provider: Some(OneOf::Left(true)),
        completion_provider: Some(CompletionOptions {
            trigger_characters: Some(vec![
                ":".to_string(),  // after "target:" or "type:"
                " ".to_string(),  // after "- id: "
            ]),
            resolve_provider: Some(false),
            ..Default::default()
        }),
        workspace_symbol_provider: Some(OneOf::Left(true)),
        code_action_provider: Some(CodeActionProviderCapability::Simple(true)),
        ..Default::default()
    }
}
```

### 5.4 Feature Implementations (Priority Order)

#### Feature 1: Diagnostics

**Trigger:** `didOpen`, `didChange`, `didSave`, `didChangeWatchedFiles`

**Implementation:**

```rust
fn publish_diagnostics(state: &ServerState, connection: &Connection, uri: &Uri) {
    // Get all diagnostics from the salsa database.
    let all_diags = state.db.diagnostics(state.source_set, state.schema_set);

    // Filter to diagnostics relevant to this file.
    let file_path = uri_to_path(uri);
    let file_diags: Vec<_> = all_diags.iter()
        .filter(|d| diagnostic_belongs_to_file(d, &file_path, &state.db, state.source_set))
        .collect();

    // Convert rivet::Diagnostic -> lsp_types::Diagnostic
    let lsp_diags = file_diags.iter().map(|d| {
        let severity = match d.severity {
            Severity::Error => DiagnosticSeverity::ERROR,
            Severity::Warning => DiagnosticSeverity::WARNING,
            Severity::Info => DiagnosticSeverity::INFORMATION,
        };

        // Position: currently line-level only (no rowan CST yet).
        // Use artifact_locations() to find the line of the artifact.
        let range = find_diagnostic_range(d, state, uri);

        lsp_types::Diagnostic {
            range,
            severity: Some(severity),
            source: Some("rivet".to_string()),
            code: Some(NumberOrString::String(d.rule.clone())),
            message: d.message.clone(),
            ..Default::default()
        }
    }).collect();

    // Publish.
    let params = PublishDiagnosticsParams {
        uri: uri.clone(),
        diagnostics: lsp_diags,
        version: None,
    };
    send_notification::<PublishDiagnostics>(connection, params);
}
```

**Diagnostic range resolution** (before rowan CST):
- If the diagnostic has an `artifact_id`, scan the file content for `- id: {artifact_id}` to find the line.
- Map the rule to a specific field when possible (e.g., `required-field` -> find the artifact block, report at the `- id:` line).
- Fallback: line 0, column 0.

**Diagnostic range resolution** (after rowan CST -- Phase B):
- Diagnostics carry `TextRange` from the CST.
- Convert `TextRange` to `Position` using a `LineIndex`.
- Precise to the character.

**Cross-file diagnostic publishing:**
When file A changes and creates a broken link to an artifact in file B, we need to publish updated diagnostics for file B too. Strategy: on any change, re-publish diagnostics for all open files (same as spar). This is cheap because `db.diagnostics()` is cached and only the filter + conversion runs per file.

#### Feature 2: Go-to-Definition

**Trigger:** `textDocument/definition` request

**Implementation:**

```rust
fn handle_goto_definition(state: &ServerState, params: GotoDefinitionParams)
    -> Option<GotoDefinitionResponse>
{
    let uri = &params.text_document_position_params.text_document.uri;
    let pos = params.text_document_position_params.position;
    let source = state.file_content(uri)?;

    // Find the word at the cursor position.
    let word = word_at_position(&source, pos)?;

    // Check if this word is an artifact ID.
    let store = state.db.store(state.source_set);
    let artifact = store.get(&word)?;

    // Find the artifact's source file and line.
    let source_path = artifact.source_file.as_ref()?;
    let target_uri = path_to_uri(source_path);

    // Find the "- id: {word}" line in the target file.
    let target_content = state.file_content_by_path(source_path)?;
    let line = find_artifact_line(&target_content, &word)?;

    Some(GotoDefinitionResponse::Scalar(Location {
        uri: target_uri,
        range: Range::new(
            Position::new(line as u32, 0),
            Position::new(line as u32, 0),
        ),
    }))
}
```

**Where go-to-definition activates:**
- In `links:` blocks: `target: REQ-001` -- click REQ-001 to jump to its definition
- In `[[REQ-001]]` references in markdown documents
- In any YAML value that matches a known artifact ID

**Word extraction strategy** (before rowan CST):
Use a simple regex or character scan at the cursor position. Artifact IDs match the pattern `[A-Z]+-[A-Z]*-?\d+` (e.g., REQ-001, DD-023, SUCA-CLI-1, H-1.2). Scan left and right from cursor to find word boundaries.

#### Feature 3: Hover

**Trigger:** `textDocument/hover` request

**Implementation:**

When hovering over an artifact ID, show:

```markdown
**REQ-001** (requirement)

**System shall be safe**

Status: approved
Links: 3 outgoing, 5 incoming
Source: artifacts/requirements.yaml:12

---
*satisfies:* DD-001, DD-003
*verified-by:* TEST-001, TEST-002, TEST-003
```

When hovering over a `type:` value, show the artifact type definition from the schema:

```markdown
**requirement** (aspice schema)

A system-level requirement

Required fields: priority, req-type
Link fields: derives-from (-> sys-req), verified-by (<- test-case)
```

When hovering over a link type, show the link type definition:

```markdown
**satisfies**

Design satisfies a requirement
Inverse: satisfied-by
Source types: design-decision
Target types: requirement
```

#### Feature 4: Completions

**Trigger:** Typing after specific YAML keys

**Context detection strategy:**

The LSP must determine what kind of completion to offer based on the cursor's YAML context. Without a rowan CST, we use a line-scanning approach:

```rust
enum CompletionContext {
    /// Cursor is after "target: " inside a links block
    LinkTarget { current_link_type: Option<String> },
    /// Cursor is after "type: " on an artifact
    ArtifactType,
    /// Cursor is after "- type: " inside a links block
    LinkType,
    /// Cursor is after "status: "
    Status,
    /// Cursor is after a field name with allowed-values in the schema
    FieldValue { field_name: String, artifact_type: String },
    /// No completion context detected
    None,
}

fn detect_completion_context(content: &str, position: Position) -> CompletionContext {
    let line = content.lines().nth(position.line as usize)?;
    let prefix = &line[..position.character as usize];

    // Check what key we're completing a value for
    if prefix.trim_start().starts_with("target:") {
        // Look upward for the enclosing "- type:" to know the link type
        CompletionContext::LinkTarget { current_link_type: find_enclosing_link_type(content, position) }
    } else if prefix.trim_start().starts_with("type:") && !is_inside_links_block(content, position) {
        CompletionContext::ArtifactType
    } else if prefix.trim_start().starts_with("type:") && is_inside_links_block(content, position) {
        CompletionContext::LinkType
    } else if prefix.trim_start().starts_with("status:") {
        CompletionContext::Status
    } else {
        CompletionContext::None
    }
}
```

**Completion items by context:**

| Context | Source | Items |
|---------|--------|-------|
| `LinkTarget` | `all_artifact_ids(db, source_set)` | All artifact IDs, filtered by valid target types if link type is known |
| `ArtifactType` | `all_type_names(db, schema_set)` | All type names from all loaded schemas |
| `LinkType` | `all_link_types(db, schema_set)` | All link type names from all loaded schemas |
| `Status` | Schema `allowed-values` for status | lifecycle statuses (draft, approved, etc.) |
| `FieldValue` | Schema `allowed-values` for the field | Enum values from the schema field definition |

**Schema-aware filtering for link targets:**

When the user types `target: ` inside a links block with `type: satisfies`, the completion should only offer artifact IDs whose type is in the `target-types` list for the `satisfies` link type definition. This requires:

1. Detect the current link type from the enclosing `- type: satisfies` line
2. Look up the link type definition in the schema: `target-types: [requirement]`
3. Filter the artifact ID list to only those with `artifact_type == "requirement"`

#### Feature 5: Code Actions

**5a. Create Missing Artifact**

When a broken-link diagnostic exists (target ID does not exist), offer a code action:

```
Quick Fix: Create artifact 'REQ-042'
```

This creates a new artifact stub in the appropriate file (determined by naming convention or the file that contains the most artifacts of the expected type).

**5b. Add Required Link**

When a traceability-rule diagnostic exists (e.g., "DD-001 missing satisfies link to requirement"), offer:

```
Quick Fix: Add 'satisfies' link to DD-001
```

This inserts a links block (or appends to an existing one) using `yaml_edit::YamlEditor` for correct indentation.

**5c. Fix Allowed Values**

When an allowed-values diagnostic exists, offer:

```
Quick Fix: Change 'status' to 'approved' (currently 'aproved')
```

#### Feature 6: Document Symbols

**What to show in the outline view:**

```
artifacts/requirements.yaml
  REQ-001 (requirement) - "System shall be safe"
  REQ-002 (requirement) - "System shall be reliable"
  REQ-003 (requirement) - "System shall be traceable"
```

Each artifact becomes a `DocumentSymbol` with:
- `name`: artifact ID
- `detail`: artifact type + title
- `kind`: `SymbolKind::STRUCT` (closest semantic match)
- `range`: line range of the artifact block (computed by scanning for `- id:` boundaries)
- `children`: none (artifacts are flat)

#### Feature 7: Workspace Symbols

**`workspace/symbol` query:**

Search across all artifacts in the workspace by ID or title. User types "REQ" and sees all requirements. User types "safe" and sees all artifacts with "safe" in the title.

```rust
fn handle_workspace_symbol(state: &ServerState, params: WorkspaceSymbolParams)
    -> Option<WorkspaceSymbolResponse>
{
    let query = params.query.to_lowercase();
    let store = state.db.store(state.source_set);

    let symbols: Vec<SymbolInformation> = store.iter()
        .filter(|a| {
            a.id.to_lowercase().contains(&query)
            || a.title.to_lowercase().contains(&query)
        })
        .map(|a| {
            SymbolInformation {
                name: a.id.clone(),
                kind: SymbolKind::STRUCT,
                location: artifact_location(a, state),
                container_name: Some(a.artifact_type.clone()),
                ..Default::default()
            }
        })
        .collect();

    Some(WorkspaceSymbolResponse::Flat(symbols))
}
```

---

## 6. Crate Dependency Graph

```
                    ┌──────────────────────────┐
                    │      VS Code Extension    │
                    │   (rivet-vscode, TypeScript)│
                    └────────────┬─────────────┘
                                 │ spawns process, stdio
                                 ▼
                    ┌──────────────────────────┐
                    │       rivet-cli           │
                    │                          │
                    │  main.rs (Cli, Command)  │
                    │  serve/  (axum + HTMX)   │
                    │  lsp/    (lsp-server)    │ ← NEW
                    │                          │
                    │  deps:                   │
                    │    rivet-core            │
                    │    lsp-server  0.7       │ ← NEW
                    │    lsp-types  0.97       │ ← NEW
                    │    clap, axum, tokio...  │
                    └────────────┬─────────────┘
                                 │
                                 ▼
                    ┌──────────────────────────┐
                    │       rivet-core          │
                    │                          │
                    │  db.rs     (salsa DB)    │
                    │  validate.rs             │
                    │  store.rs, links.rs      │
                    │  schema.rs, model.rs     │
                    │  yaml_edit.rs            │
                    │  formats/ (adapters)     │
                    │                          │
                    │  deps:                   │
                    │    salsa 0.26            │
                    │    serde_yaml, petgraph  │
                    │    rowan (future CST)    │
                    └──────────────────────────┘
```

No new crates. Two new dependencies added to `rivet-cli/Cargo.toml`:
- `lsp-server = "0.7"`
- `lsp-types = "0.97"`

---

## 7. Key Types and Traits

### 7.1 In rivet-core (no changes to existing types)

```rust
// Already exists:
pub struct RivetDatabase { storage: salsa::Storage<Self> }
pub struct SourceFile { path: String, content: String }     // salsa::input
pub struct SchemaInput { name: String, content: String }    // salsa::input
pub struct Diagnostic { severity, artifact_id, rule, message }
pub struct Store { artifacts: HashMap<ArtifactId, Artifact> }
pub struct Schema { artifact_types, link_types, traceability_rules, conditional_rules }
pub struct Artifact { id, artifact_type, title, description, status, tags, links, fields, source_file }
pub struct LinkGraph { forward, backward, broken, graph, node_map }
```

### 7.2 In rivet-core (new additions for LSP support)

```rust
/// Source location for a diagnostic. Added to Diagnostic struct.
/// Phase A4 from the completion plan.
pub struct SourceLocation {
    pub file: PathBuf,
    pub line: u32,       // 0-based
    pub column: u32,     // 0-based
    pub end_line: u32,
    pub end_column: u32,
}

// Extended Diagnostic (backward-compatible addition):
pub struct Diagnostic {
    pub severity: Severity,
    pub artifact_id: Option<String>,
    pub rule: String,
    pub message: String,
    pub location: Option<SourceLocation>,  // NEW
}
```

### 7.3 In rivet-cli/src/lsp/ (new)

```rust
/// Line index for fast offset <-> line:column conversion.
pub struct LineIndex {
    /// Byte offset of the start of each line.
    line_starts: Vec<u32>,
}

impl LineIndex {
    pub fn new(text: &str) -> Self;
    pub fn line_col(&self, offset: u32) -> (u32, u32);
    pub fn offset(&self, line: u32, col: u32) -> u32;
}

/// LSP server state. Wraps the salsa database and editor state.
pub struct ServerState {
    db: RivetDatabase,
    source_set: SourceFileSet,
    schema_set: SchemaInputSet,
    uri_to_source: HashMap<String, SourceFile>,
    config: ProjectConfig,
    workspace_root: PathBuf,
    open_files: Vec<String>,
    line_indices: HashMap<String, LineIndex>,
}
```

---

## 8. VS Code Extension Design

### 8.1 Extension Identity

```json
{
  "name": "rivet-vscode",
  "displayName": "Rivet — SDLC Traceability",
  "publisher": "pulseengine",
  "description": "Language support for Rivet artifact YAML files",
  "categories": ["Programming Languages", "Linters"],
  "activationEvents": [
    "workspaceContains:rivet.yaml"
  ]
}
```

### 8.2 Language ID Strategy

**Do NOT register a custom language.** Artifact files are plain YAML. Registering a custom language ID would break existing YAML tooling (syntax highlighting, bracket matching, YAML schema validation).

Instead:
- Activate when `rivet.yaml` exists in the workspace root
- Apply to all `.yaml` files within source directories listed in `rivet.yaml`
- Co-exist with the built-in YAML extension and redhat.vscode-yaml

**File association via `documentSelector` in LSP client configuration:**

```typescript
const clientOptions: LanguageClientOptions = {
    documentSelector: [
        { scheme: 'file', language: 'yaml', pattern: '**/artifacts/**/*.yaml' },
        { scheme: 'file', language: 'yaml', pattern: '**/safety/**/*.yaml' },
        { scheme: 'file', language: 'yaml', pattern: '**/schemas/**/*.yaml' },
        { scheme: 'file', language: 'yaml', pattern: '**/rivet.yaml' },
    ],
};
```

Better: read `rivet.yaml` at activation time and construct the glob patterns dynamically from `config.sources[*].path`.

### 8.3 Server Lifecycle

```typescript
import { LanguageClient, ServerOptions } from 'vscode-languageclient/node';

let client: LanguageClient;

export function activate(context: vscode.ExtensionContext) {
    // Find the rivet binary.
    const rivetPath = vscode.workspace.getConfiguration('rivet').get<string>('path')
        || 'rivet';

    const serverOptions: ServerOptions = {
        command: rivetPath,
        args: ['lsp'],
    };

    client = new LanguageClient(
        'rivet',
        'Rivet Language Server',
        serverOptions,
        clientOptions,
    );

    client.start();
}

export function deactivate(): Thenable<void> | undefined {
    return client?.stop();
}
```

### 8.4 Extension Settings

```json
{
  "rivet.path": {
    "type": "string",
    "default": "rivet",
    "description": "Path to the rivet binary"
  },
  "rivet.validation.onSave": {
    "type": "boolean",
    "default": true,
    "description": "Run validation on file save"
  },
  "rivet.validation.onType": {
    "type": "boolean",
    "default": true,
    "description": "Run validation as you type"
  },
  "rivet.completion.artifactIds": {
    "type": "boolean",
    "default": true,
    "description": "Suggest artifact IDs in link targets"
  }
}
```

### 8.5 Extension Features Beyond LSP

Some features can be contributed by the extension directly, without LSP:

- **Tree view:** Show all artifacts organized by type in the explorer sidebar (via a TreeDataProvider that calls `rivet list --json`).
- **Status bar:** Show artifact count and validation status.
- **Commands:** `rivet.validate` (run full validation), `rivet.openDashboard` (run `rivet serve` and open browser).
- **CodeLens:** Show backlink counts above each `- id:` line (e.g., "3 references").

These are additive and can come after the initial LSP integration.

---

## 9. Migration Path: Batch -> Incremental -> LSP

### Phase 1: Current State (done)

- Batch validation: `rivet validate` runs sequential pipeline
- Incremental validation: `rivet validate --incremental` uses salsa (opt-in)
- Dashboard: `rivet serve` reloads everything per request

### Phase 2: Foundation (Phase A from completion plan)

- A1: Add `PartialEq` to `Store`, `LinkGraph`
- A2: Lift `build_store`, `build_schema` to tracked functions
- A4: Add `SourceLocation` to `Diagnostic`
- A5: Make incremental the default

### Phase 3: LSP Skeleton

- Add `lsp-server` + `lsp-types` to rivet-cli
- Add `Lsp` variant to CLI `Command` enum
- Implement `ServerState` with salsa `RivetDatabase`
- Implement initialization: load `rivet.yaml`, schemas, sources
- Implement `didOpen` / `didChange` / `didSave` -> `db.update_source()`
- Publish diagnostics (line-level accuracy from artifact ID scanning)

### Phase 4: Core LSP Features

- Go-to-definition (artifact ID -> source file:line)
- Hover (artifact summary, type info, link type info)
- Completions (artifact IDs, types, link types, allowed values)
- Document symbols (artifact outline)
- Workspace symbols (search by ID or title)

### Phase 5: VS Code Extension

- Minimal extension: activate on rivet.yaml, spawn `rivet lsp`
- Document selector from rivet.yaml source paths
- Settings for binary path
- Publish to VS Code marketplace

### Phase 6: Advanced Features (after rowan CST, Phase B)

- Character-level diagnostic precision via rowan TextRange
- Code actions (create artifact, add link, fix values)
- Rename artifact ID (workspace-wide refactor)
- Document formatting
- Inlay hints (show link target titles inline)

---

## 10. Risks and Open Questions

### Risk: YAML Position Tracking Without rowan

Before Phase B (rowan CST for YAML), we cannot point diagnostics at the exact character. Mitigation: scan for `- id: {ID}` patterns to get line-level accuracy. This is good enough for initial release -- most YAML LSP servers work at line granularity.

### Risk: Large Workspaces

A workspace with 1000+ artifact files could make the initial load slow. Mitigation: load files lazily (parse on first access) and use background threads for initial workspace scan. The salsa database handles incremental updates efficiently after initial load.

### Risk: Multiple YAML Schemas in One Workspace

A workspace might have `rivet.yaml` artifact files alongside other YAML files (CI configs, Kubernetes manifests). The LSP should not validate non-rivet YAML files. Mitigation: the `documentSelector` patterns are derived from `rivet.yaml` source paths. Only files within those paths receive diagnostics.

### Risk: Schema Hot-Reload

Schema files rarely change, but when they do (e.g., adding a new artifact type), the LSP must reload. Currently `SchemaInputSet` is created at startup. For schema changes, the LSP must either restart or implement schema file watching + `SchemaInput` content updates.

### Open Question: Debouncing

When the user types rapidly, each keystroke triggers `didChange`. Should we debounce validation? Options:
- **No debounce** (spar's approach): validation is fast enough with salsa caching. Try this first.
- **100ms debounce**: wait 100ms after last keystroke before publishing diagnostics. Use if validation is slow for large projects.

### Open Question: Multi-root Workspaces

VS Code supports multi-root workspaces. Each root might have its own `rivet.yaml`. Should we spawn one LSP process per root, or handle multiple roots in one process? Recommendation: one process per root (simpler, matches rust-analyzer's model).

---

## 11. Artifacts to Create

| ID | Type | Title | Links |
|----|------|-------|-------|
| DD-040 | design-decision | Use lsp-server (not tower-lsp) for Rivet LSP | satisfies REQ-036 |
| DD-041 | design-decision | LSP as rivet-cli subcommand, not separate crate | satisfies REQ-036 |
| DD-042 | design-decision | Salsa database shared between LSP and validation pipeline | satisfies REQ-029, REQ-036 |
| FEAT-060 | feature | `rivet lsp` subcommand starts LSP server on stdio | satisfies REQ-036, implements DD-041 |
| FEAT-061 | feature | LSP diagnostics with line-level accuracy | satisfies REQ-036, implements DD-042 |
| FEAT-062 | feature | LSP go-to-definition for artifact ID references | satisfies REQ-036 |
| FEAT-063 | feature | LSP completions for artifact IDs, types, and link types | satisfies REQ-036 |

---

## 12. Implementation Estimate

| Task | Effort | Dependencies |
|------|--------|-------------|
| LSP skeleton + didOpen/didChange/diagnostics | 2 days | Phase A4 (source locations) |
| Go-to-definition | 1 day | LSP skeleton |
| Hover | 1 day | LSP skeleton |
| Completions (artifact IDs, types, link types) | 2 days | LSP skeleton |
| Document symbols | 0.5 days | LSP skeleton |
| Workspace symbols | 0.5 days | LSP skeleton |
| Code actions (basic) | 1 day | yaml_edit.rs integration |
| VS Code extension (minimal) | 1 day | LSP working |
| VS Code extension (tree view, status bar) | 2 days | Extension working |
| **Total** | **~11 days** | |

This excludes Phase A and Phase B work (salsa foundation and rowan CST) which are covered in the completion plan.
