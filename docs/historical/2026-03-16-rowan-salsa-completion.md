# rowan + salsa Incremental Validation: Completion Plan

**Issue:** [#22 — rowan + salsa incremental validation architecture](https://github.com/pulseengine/rivet/issues/22)
**Date:** 2026-03-16
**Artifacts:** REQ-028, REQ-029, DD-023, DD-024, FEAT-046, FEAT-047, FEAT-048

---

## 1. Current State Assessment

### 1.1 What Works Today

**Layer 1 — rowan CST (MODULE.bazel only):**
- `rivet-core/src/bazel.rs` — Complete rowan-based parser for MODULE.bazel Starlark subset
- ~20 `SyntaxKind` variants (tokens + composite nodes + error recovery)
- Hand-written lexer + recursive-descent parser emitting `GreenNode`
- HIR extraction (`BazelModule`) from CST: `module()`, `bazel_dep()`, overrides
- Error recovery — `load()`, variable assignment, dotted expressions wrapped as `Error` nodes
- 10 tests covering lexer, CST, HIR, error recovery, and realistic input

**Layer 2 — salsa incremental database:**
- `rivet-core/src/db.rs` — Complete salsa 0.26 database with:
  - **Inputs:** `SourceFile` (path + content), `SchemaInput` (name + content), set containers for both
  - **Tracked queries:** `parse_artifacts(file)`, `validate_all(sources, schemas)`, `evaluate_conditional_rules(sources, schemas)`
  - **Helper functions (non-tracked):** `build_pipeline`, `build_store`, `build_schema`
  - **Concrete database:** `RivetDatabase` with `load_schemas()`, `load_sources()`, `update_source()`, `store()`, `schema()`, `diagnostics()`, `conditional_diagnostics()`
- CLI integration: `rivet validate --incremental` and `--verify-incremental` flags
- Verification mode: SC-11 parity check comparing incremental vs sequential pipelines
- 16 database tests covering: empty DB, unlinked/linked artifacts, incremental updates, determinism, add/remove artifacts, conditional rules, rule composition, consistency checks

**Layer 3 — Supporting infrastructure:**
- `yaml_edit.rs` — Indentation-aware YAML editor (lossless roundtrip for mutations)
- `impact.rs` — Change impact analysis via BFS on link graph
- `validate.rs` — 8-phase validation: `validate_structural()` (phases 1-7) + conditional rules (phase 8)
- `store.rs` — In-memory artifact store with type indexing
- `links.rs` — petgraph-based link graph with forward/backward/broken links

### 1.2 What Does NOT Work Yet

1. **CLI does not default to incremental** — `--incremental` is opt-in, sequential pipeline is default
2. **Only `generic-yaml` format supported in salsa path** — STPA, AADL, ReqIF, needs-json formats are skipped
3. **No rowan CST for artifact/schema YAML files** — parsing goes through serde_yaml, no span information
4. **No source location on diagnostics** — `Diagnostic` struct has no file path, line, or column
5. **Store and LinkGraph lack `PartialEq`** — cannot be salsa tracked return types (noted in db.rs comments)
6. **`build_store` and `build_schema` are non-tracked** — pipeline runs twice in `validate_all` + `evaluate_conditional_rules`
7. **No file watching** — incremental database is created fresh each invocation, no warm-cache reuse
8. **No LSP server** — no `tower-lsp` or `lsp-server` integration
9. **No per-file artifact granularity in salsa** — `parse_artifacts` returns `Vec<Artifact>`, not individually tracked artifacts
10. **Impact analysis does not use salsa** — `impact.rs` uses separate diff-based approach

---

## 2. Architecture: LSP-Ready State

### 2.1 Target Query Graph

```
                    ┌─────────────────┐
                    │  File Watcher   │  (notify crate)
                    │  or LSP client  │
                    └────────┬────────┘
                             │ set_content(path, text)
                             ▼
┌────────────────────────────────────────────────────────────┐
│                     RivetDatabase                          │
│                                                            │
│  ┌──────────────┐    ┌──────────────┐                      │
│  │ SourceFile   │    │ SchemaInput  │    salsa::input      │
│  │ path+content │    │ name+content │                      │
│  └──────┬───────┘    └──────┬───────┘                      │
│         │                   │                              │
│         ▼                   ▼                              │
│  ┌──────────────┐    ┌──────────────┐                      │
│  │parse_artifact│    │ parse_schema │    salsa::tracked    │
│  │   s(file)    │    │   (file)     │    (per-file)        │
│  └──────┬───────┘    └──────┬───────┘                      │
│         │                   │                              │
│         ▼                   ▼                              │
│  ┌──────────────┐    ┌──────────────┐                      │
│  │ ArtifactSet  │    │MergedSchema  │    salsa::tracked    │
│  │  (all files) │    │ (all schemas)│    (aggregates)      │
│  └──────┬───────┘    └──────┬───────┘                      │
│         │                   │                              │
│         └───────┬───────────┘                              │
│                 ▼                                          │
│          ┌─────────────┐                                   │
│          │  LinkGraph   │         salsa::tracked           │
│          │(+broken refs)│                                  │
│          └──────┬──────┘                                   │
│                 │                                          │
│        ┌────────┼────────┐                                 │
│        ▼        ▼        ▼                                 │
│  ┌──────────┐ ┌─────┐ ┌──────────────┐                    │
│  │structural│ │trace│ │ conditional  │  salsa::tracked    │
│  │validation│ │rules│ │   rules      │  (per-category)    │
│  └────┬─────┘ └──┬──┘ └──────┬───────┘                    │
│       │          │           │                             │
│       └──────────┼───────────┘                             │
│                  ▼                                         │
│          ┌──────────────┐                                  │
│          │ all_diagnost │      salsa::tracked              │
│          │    ics()     │      (top-level)                 │
│          └──────┬───────┘                                  │
│                 │                                          │
│                 ▼                                          │
│          ┌──────────────┐                                  │
│          │  Diagnostic  │      With file path,             │
│          │  + SourceLoc │      line:col spans              │
│          └──────────────┘                                  │
└────────────────────────────────────────────────────────────┘
                  │
                  ▼
    ┌─────────────────────────┐
    │   LSP / CLI / Dashboard │
    │   textDocument/         │
    │   publishDiagnostics    │
    └─────────────────────────┘
```

### 2.2 Key Architectural Properties

- **Single database instance** shared across CLI (watch mode), dashboard (serve), and LSP
- **File-level granularity** for invalidation: changing one YAML file re-parses only that file
- **Per-category validation** tracked separately: structural, traceability, conditional rules
- **Diagnostic spans** traceable to source locations via rowan TextRange or line:col pairs
- **Same DB serves all consumers**: `rivet validate`, `rivet serve`, `rivet lsp`

---

## 3. Remaining Work Items

### Phase A: Make Incremental the Default (no rowan required)

**A1. Derive `PartialEq` for Store and LinkGraph** (~1 day)
- Add `#[derive(PartialEq)]` to `Store`, `LinkGraph`, and all transitive types
- For `LinkGraph`: need `PartialEq` on `ResolvedLink`, `Backlink` (already `Clone + Debug`)
- petgraph `DiGraph` does not implement `PartialEq`; either skip the graph field from comparison or store it separately
- This unblocks making `build_store` and `build_schema` into salsa tracked functions, eliminating the duplicate pipeline execution noted in db.rs

**A2. Lift `build_store` and `build_schema` to tracked functions** (~0.5 day)
- Currently non-tracked helpers called from both `validate_all` and `evaluate_conditional_rules`
- With PartialEq on return types, these become `#[salsa::tracked]` functions
- Eliminates redundant store/schema assembly on every validation call

**A3. Add all adapter formats to the salsa path** (~2 days)
- Currently `cmd_validate_incremental` skips sources with format != "generic" / "generic-yaml"
- Need to route STPA, AADL, ReqIF, needs-json through the salsa database
- Strategy: add a `parse_artifacts_with_adapter(db, source, format)` tracked function that dispatches to the correct adapter
- Each adapter's parse result (Vec<Artifact>) is cached per file

**A4. Source location on Diagnostic** (~1 day)
- Add `source_file: Option<String>` and `source_line: Option<usize>` to `Diagnostic`
- Populate from `Artifact::source_file` (already tracked) and serde_yaml error positions
- No rowan needed — serde_yaml provides line numbers for parse errors; artifact `source_file` provides file paths
- Validate pipeline propagates source_file through to diagnostics

**A5. Remove `--incremental` flag, make salsa the default** (~0.5 day)
- Keep `--verify-incremental` as a safety check for transition period
- Add `--no-incremental` escape hatch (legacy sequential mode)
- Update CLI tests to use the salsa path
- Gate behind a transition period: `--incremental` prints deprecation notice

**A6. File-watching warm-cache mode for CLI** (~2 days)
- Add `rivet validate --watch` using the `notify` crate
- Holds `RivetDatabase` in memory between file changes
- On file change: `db.update_source(path, new_content)` then `db.diagnostics()`
- Demonstrates the core incremental value: sub-ms revalidation on warm cache
- This is the simplest proof of salsa's value proposition

**A7. Integrate salsa into `rivet serve` dashboard** (~2 days)
- Dashboard currently reloads all artifacts on each request
- Share `RivetDatabase` behind an `Arc<RwLock<_>>` in the axum state
- File watcher updates the database; handlers read cached results
- Validation page, stats, graph all query the same warm database

### Phase B: rowan CST for Artifact YAML Files

**B1. Design YAML CST SyntaxKind enum** (~1 day)
- Define `YamlSyntaxKind` covering the subset Rivet uses:
  - `Root`, `Document`, `MappingEntry`, `SequenceEntry`, `BlockMapping`, `FlowSequence`
  - `Key`, `Colon`, `Value`, `Dash`, `Indent`, `Comment`, `Newline`, `ScalarValue`, `StringLit`
  - `ArtifactsBlock`, `ArtifactEntry` (higher-level composite nodes)
  - `Error` for recovery
- Define `YamlLanguage` implementing `rowan::Language`

**B2. YAML lexer** (~2 days)
- Indentation-sensitive tokenizer for the artifact YAML subset
- Must handle: block scalars (`>`, `|`), flow sequences (`[...]`), quoted strings, comments
- Produce tokens with exact byte positions for span tracking
- This is more complex than the MODULE.bazel lexer due to indentation significance

**B3. YAML recursive-descent parser** (~3 days)
- Build `GreenNode` CST from token stream
- Error recovery: partial parse on malformed YAML still produces usable CST
- Must produce `ArtifactEntry` nodes for each `- id:` block
- Span information on every node enables diagnostic-quality error reporting

**B4. Replace serde_yaml parsing with rowan CST path** (~2 days)
- `parse_generic_yaml()` currently uses serde_yaml
- New path: lex -> parse -> CST -> HIR extraction (Artifact structs)
- HIR extraction walks the CST to produce the same `Vec<Artifact>` output
- serde_yaml path kept as fallback; feature flag or runtime switch

**B5. Schema file rowan CST** (~2 days)
- Separate `SchemaSyntaxKind` or reuse `YamlSyntaxKind` for schema YAML
- Schema files have a known structure; CST enables better error messages for malformed schemas
- Lower priority than artifact CST — schemas change infrequently

**B6. Wire rowan spans into Diagnostic** (~1 day)
- `Diagnostic` gains `text_range: Option<rowan::TextRange>` field
- Validation functions that detect errors from CST-parsed artifacts attach the span
- Conversion to line:col via a line index computed from source text

### Phase C: LSP Server

**C1. Add `tower-lsp` dependency and server skeleton** (~1 day)
- New crate `rivet-lsp` or module in `rivet-cli`
- Implement `LanguageServer` trait with stub handlers
- `rivet lsp` subcommand starts the server on stdin/stdout

**C2. `textDocument/didOpen` and `textDocument/didChange`** (~1 day)
- On open: load file content into `RivetDatabase` via `SourceFile::new()`
- On change: `db.update_source(path, new_content)`
- Trigger revalidation, publish diagnostics

**C3. `textDocument/publishDiagnostics`** (~1 day)
- Convert `Diagnostic` (with source location) to LSP `Diagnostic`
- Map `Severity::Error` -> `DiagnosticSeverity::Error`, etc.
- Publish to client after each revalidation

**C4. `textDocument/completion`** (~2 days)
- Artifact ID completion in `links:` target fields
- Artifact type completion in `type:` fields
- Link type completion in `links:` type fields
- Schema-aware: only suggest valid target types for a given link type

**C5. `textDocument/hover`** (~1 day)
- Hover over artifact ID in `links:` shows target artifact summary
- Hover over link type shows schema description
- Hover over artifact type shows type definition

**C6. `textDocument/definition`** (~1 day)
- Go-to-definition on artifact IDs in link targets
- Jump to the `- id:` line in the target artifact's source file
- Requires `source_file` to be populated on all artifacts

**C7. VS Code extension packaging** (~2 days)
- Extension activates for `*.yaml` files in projects with `rivet.yaml`
- Ships `rivet` binary, starts `rivet lsp`
- Configuration: schema path, project root
- This is the commercial value play for Eclipse SCORE adoption

### Phase D: Advanced Incremental Features

**D1. Per-artifact salsa tracking** (~2 days)
- Currently `parse_artifacts()` returns `Vec<Artifact>` — the entire file
- Add `#[salsa::tracked]` struct `TrackedArtifact` wrapping individual artifacts
- `parse_artifacts()` returns `Vec<TrackedArtifact>`
- Changing one artifact in a multi-artifact file only invalidates that artifact's downstream queries
- Requires careful design: tracked structs need stable identity across re-parses

**D2. Salsa-powered impact analysis** (~1 day)
- Replace `impact.rs` BFS approach with salsa query invalidation
- "What is impacted by changing file X?" = "What salsa queries would re-execute?"
- salsa does not currently expose its dependency graph externally; may need to track this manually
- Alternative: keep BFS impact but feed it from the salsa-cached link graph

**D3. Cross-repo incremental validation** (~3 days)
- `externals.rs` already supports cross-repo artifact linking
- External artifacts become `SourceFile` inputs with a "repo:path" key
- File watching spans multiple repo directories
- Invalidation boundary: external changes re-trigger local link validation but not external schema validation

**D4. Document validation in salsa** (~1 day)
- `validate_documents()` checks `[[ID]]` references in markdown documents
- Add `DocumentInput` salsa input and `validate_document_refs()` tracked function
- Document changes only revalidate affected document references

---

## 4. Migration Strategy

### Principle: No Breaking Changes

Every phase is additive. The sequential pipeline (`validate()` in validate.rs) remains functional throughout. The salsa path produces identical results (verified by SC-11).

### Phase Ordering and Dependencies

```
Phase A (Foundation)          Phase B (rowan YAML)        Phase C (LSP)
━━━━━━━━━━━━━━━━━━━          ━━━━━━━━━━━━━━━━━━          ━━━━━━━━━━━━
A1 PartialEq ──┐              B1 SyntaxKind enum          C1 server skeleton
A2 tracked fn ─┤              B2 YAML lexer ──┐           C2 didOpen/didChange
A3 all adapters│              B3 YAML parser ─┤           C3 publishDiagnostics
A4 source locs ┤              B4 replace serde┤           C4 completion
A5 default ────┤              B5 schema CST   │           C5 hover
A6 --watch ────┤              B6 spans ────────┘           C6 definition
A7 serve ──────┘                                          C7 VS Code ext

A must complete ──→ B can start (B needs stable salsa infra)
A must complete ──→ C can start (C needs source locations)
B6 feeds ─────────→ C3 (spans make LSP diagnostics precise)
```

### Transition Timeline

| Milestone | Items | Key Deliverable |
|-----------|-------|----------------|
| **v0.2.0** | A1-A5 | Incremental is default; all adapters supported |
| **v0.3.0** | A6-A7, B1-B3 | Watch mode, dashboard integration, YAML CST prototype |
| **v0.4.0** | B4-B6, C1-C3 | rowan-parsed artifacts, basic LSP with diagnostics |
| **v0.5.0** | C4-C7, D1-D2 | Full LSP, VS Code extension, per-artifact tracking |
| **v1.0.0** | D3-D4 | Cross-repo incremental, document validation |

---

## 5. New Artifacts Needed

### Requirements

| ID | Title | Rationale |
|----|-------|-----------|
| REQ-033 | Source location tracking on validation diagnostics | Diagnostics without file:line are unusable for LSP and large projects |
| REQ-034 | File-watching incremental validation mode | Core value proposition of salsa — sub-ms revalidation on file change |
| REQ-035 | YAML lossless CST with rowan | Enables error recovery, span-based diagnostics, and LSP features |
| REQ-036 | Language Server Protocol support for artifact YAML | IDE integration for SCORE adoption; commercial VS Code extension play |

### Design Decisions

| ID | Title | Rationale |
|----|-------|-----------|
| DD-031 | YAML CST SyntaxKind design for artifact/schema files | The YAML subset used by Rivet is small enough for a hand-written parser but needs indentation sensitivity |
| DD-032 | tower-lsp over lsp-server for Rivet LSP | tower-lsp is async and composable with axum; lsp-server is sync. spar could go either way but Rivet already has tokio |
| DD-033 | notify crate for file watching in CLI and dashboard | Cross-platform file watching; same approach as rust-analyzer |

### Features

| ID | Title | Links |
|----|-------|-------|
| FEAT-053 | Source locations on all validation diagnostics | satisfies REQ-033 |
| FEAT-054 | `rivet validate --watch` with warm salsa cache | satisfies REQ-034, implements DD-024 |
| FEAT-055 | YAML rowan CST parser for artifact files | satisfies REQ-035, implements DD-031 |
| FEAT-056 | `rivet lsp` Language Server Protocol implementation | satisfies REQ-036, implements DD-032 |
| FEAT-057 | VS Code extension for Rivet artifact YAML | satisfies REQ-036 |
| FEAT-058 | salsa integration in `rivet serve` dashboard | satisfies REQ-029, implements DD-024 |

### STPA Artifacts (extend existing)

The following existing STPA artifacts already cover incremental validation safety:
- **H-9:** Incremental validation returns stale results (hazard)
- **SC-11:** Incremental must equal full validation (safety constraint)
- **UCA-C-10..C-14:** Incremental validation UCAs
- **CC-C-10..C-14:** Causal chain for incremental errors

New loss scenario needed:
- **LS-NEW:** LSP server publishes stale diagnostics after rapid file edits due to race between file watcher and salsa query execution

---

## 6. Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| YAML indentation parsing is hard to get right | B2-B3 take longer than estimated | Start with a minimal subset (artifact files only), reuse yaml_edit.rs knowledge |
| salsa 0.26 API instability | API changes break db.rs | Pin to exact version; salsa 0.26 is stable (used by spar, rust-analyzer uses fork) |
| PartialEq on petgraph DiGraph | A1 blocked — DiGraph has no PartialEq | Store the graph behind an opaque wrapper; compare by node/edge counts or skip graph from PartialEq |
| Per-artifact tracking identity issues | D1 correctness — re-parse changes artifact identity | Use artifact ID as the salsa identity key; handle ID renames as remove+add |
| LSP adoption requires VS Code extension | C7 is cross-ecosystem work (TypeScript) | Start with a minimal extension; existing YAML LSP extensions can be adapted |

---

## 7. Success Criteria

1. **`rivet validate` defaults to incremental** — no `--incremental` flag needed
2. **SC-11 always passes** — `--verify-incremental` confirms parity on every CI run
3. **`rivet validate --watch`** shows sub-10ms revalidation on file change (warm cache)
4. **`rivet serve` dashboard** uses shared salsa database — no full reload per request
5. **`rivet lsp`** publishes diagnostics with file:line:col accuracy
6. **VS Code extension** provides completion, hover, and go-to-definition for artifact YAML
7. **All adapter formats** (generic, stpa, aadl, reqif, needs-json) route through salsa

---

## 8. Relation to Phase 3 Workstreams

This plan is workstream 7 ("rowan + salsa incremental validation") from the
[Phase 3 parallel workstreams design](2026-03-14-phase3-parallel-workstreams-design.md).

It intersects with:
- **Workstream 3** (CLI mutation safety) — mutations should invalidate the salsa cache
- **Workstream 4** (dashboard) — shared salsa database for serve
- **Workstream 6** (cross-repo) — external artifacts as salsa inputs
- **Workstream 8** (SCORE adoption) — LSP/VS Code extension is a key selling point
