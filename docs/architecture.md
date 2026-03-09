---
id: ARCH-001
type: architecture
title: Rivet System Architecture
status: approved
glossary:
  STPA: Systems-Theoretic Process Analysis
  ASPICE: Automotive SPICE
  OSLC: Open Services for Lifecycle Collaboration
  ReqIF: Requirements Interchange Format
  WASM: WebAssembly
  WIT: WASM Interface Types
  HTMX: Hypermedia-driven AJAX
  CLI: Command-Line Interface
  YAML: YAML Ain't Markup Language
---

# Rivet System Architecture

## 1. System Overview

Rivet is a Rust-based SDLC traceability tool for safety-critical systems. It
manages lifecycle artifacts (requirements, designs, tests, STPA analyses) as
version-controlled YAML files and validates their traceability links against
composable schemas.

The system is structured as two crates following [[DD-006]]:

- **rivet-core** -- Library crate containing all domain logic: artifact model,
  adapters, schema loading, link graph, validation, coverage, matrix
  computation, diff, document system, query engine, and format-specific
  adapters.

- **rivet-cli** -- Binary crate providing the `rivet` command-line tool and
  the axum + HTMX dashboard server. Depends on rivet-core for all domain
  operations.

This flat crate structure keeps module boundaries clear without deep nesting.
The library/binary split ensures that rivet-core can be consumed as a Rust
dependency by other tools or tested independently.

### System Architecture Diagram

The top-level system with its core and CLI subsystems:

```aadl
root: RivetSystem::Rivet.Impl
```

### Core Process Internals

The core library process showing all domain logic modules and their data flow:

```aadl
root: RivetSystem::RivetCore.Impl
```

### CLI Process

The CLI binary process with command dispatch and HTTP serve handler:

```aadl
root: RivetSystem::RivetCli.Impl
```

## 2. Module Structure

### 2.1 rivet-core Modules

| Module       | Purpose                                                          |
|--------------|------------------------------------------------------------------|
| `model`      | Core data types: `Artifact`, `Link`, `ProjectConfig`, `SourceConfig` |
| `store`      | In-memory artifact store with by-ID and by-type indexing         |
| `schema`     | Schema loading, merging, artifact type and link type definitions |
| `links`      | `LinkGraph` construction via petgraph, backlinks, orphan detection |
| `validate`   | Validation engine: types, fields, cardinality, traceability rules |
| `coverage`   | Traceability coverage computation per rule                       |
| `matrix`     | Traceability matrix computation (forward and backward)           |
| `query`      | Query engine: filter artifacts by type, status, tag, link presence |
| `diff`       | Artifact diff and diagnostic diff between two store snapshots    |
| `document`   | Markdown documents with YAML frontmatter and wiki-link references |
| `results`    | Test run results model, YAML loading, and `ResultStore`          |
| `adapter`    | Adapter trait and configuration for import/export                |
| `reqif`      | ReqIF 1.2 XML import/export adapter                             |
| `oslc`       | OSLC client for discovery, query, CRUD, and sync (feature-gated) |
| `wasm_runtime` | WASM component adapter runtime (feature-gated)                 |
| `error`      | Unified error type for the library                               |
| `formats/`   | Format-specific adapters: `generic` (YAML), `stpa` (STPA YAML)  |

### 2.2 rivet-cli Modules

| Module  | Purpose                                                              |
|---------|----------------------------------------------------------------------|
| `main`  | CLI entry point, clap argument parsing, subcommand dispatch          |
| `serve` | axum HTTP server with HTMX-rendered dashboard pages                  |

## 3. Data Flow

The core data pipeline follows a consistent flow from YAML files through to
validation results:

```
  rivet.yaml
      |
      v
  ProjectConfig
      |
      +---> Schema loading (schemas/*.yaml)
      |         |
      |         v
      |     Schema::merge() --> merged Schema
      |
      +---> Artifact loading (sources/*.yaml)
                |
                v
            Adapter::import() --> Vec<Artifact>
                |
                v
            Store (in-memory, indexed by ID and type)
                |
                +---> LinkGraph::build(&store, &schema)
                |         |
                |         v
                |     petgraph DiGraph (nodes = artifacts, edges = links)
                |         |
                |         +---> validate::validate()  --> Vec<Diagnostic>
                |         +---> coverage::compute()   --> CoverageReport
                |         +---> matrix::compute()     --> TraceabilityMatrix
                |         +---> graph.orphans()       --> orphan detection
                |         +---> graph.broken          --> broken links
                |
                +---> query::execute(&store, &query) --> filtered artifacts
                +---> diff::ArtifactDiff::compute()  --> change analysis
```

### 3.1 Schema Loading

Schemas are loaded from YAML files and merged using `Schema::merge()`. Each
schema file declares artifact types with field definitions, link-field
constraints (cardinality, target types), and traceability rules. The merge
operation combines types and link types from multiple schemas, enabling
composition: a project can load `common + dev`, `common + stpa`,
`common + aspice + cybersecurity`, or any combination.

This design is specified by [[REQ-010]] and [[DD-003]].

### 3.2 Adapter Pipeline

Adapters implement the `Adapter` trait, which defines `import()` and
`export()` methods. Three native adapters exist:

1. **GenericYamlAdapter** -- Canonical YAML format with explicit type, links
   array, and fields map. Used for Rivet's own artifacts.
2. **StpaYamlAdapter** -- Imports STPA analysis artifacts from the meld
   project's YAML format (losses, hazards, UCAs, etc.).
3. **ReqIfAdapter** -- Import/export for OMG ReqIF 1.2 XML, enabling
   interchange with DOORS, Polarion, and codebeamer ([[REQ-005]]).

The WASM adapter runtime ([[DD-004]]) and OSLC sync adapter ([[DD-001]])
extend this pipeline for plugin formats and remote tool synchronization.

```aadl
root: RivetAdapters::WasmRuntime.Impl
```

### 3.3 Link Graph

The `LinkGraph` module uses petgraph ([[DD-002]]) to build a directed graph
where nodes are artifacts and edges are links. The graph provides:

- **Forward links** -- `links_from(id)` returns outgoing links
- **Backlinks** -- `backlinks_to(id)` returns incoming links with inverse type
- **Broken links** -- Links where the target artifact doesn't exist
- **Orphans** -- Artifacts with no incoming or outgoing links
- **Reachability** -- `reachable(id, link_type)` for transitive closure

### 3.4 Validation Engine

The validator ([[REQ-004]]) checks artifacts against the merged schema:

1. **Known type** -- Every artifact's type must exist in the schema
2. **Required fields** -- Type-specific required fields must be present
3. **Allowed values** -- Field values must match the schema's allowed set
4. **Link cardinality** -- Link counts must satisfy exactly-one, one-or-many,
   zero-or-one, or zero-or-many constraints
5. **Link target types** -- Link targets must have the correct artifact type
6. **Broken links** -- All link targets must exist in the store
7. **Traceability rules** -- Forward and backward link coverage rules

Diagnostics are returned with severity levels (error, warning, info) and the
caller decides whether to fail on errors.

## 4. Dashboard Architecture

```aadl
root: RivetDashboard::Dashboard.Impl
```

The HTTP dashboard follows [[DD-005]], using axum as the server framework and
HTMX for dynamic page updates without a JavaScript build toolchain.

### 4.1 Server Structure

The `serve` module in rivet-cli sets up an axum `Router` with routes for:

- `/` -- Project overview with artifact counts, validation status, and context
- `/artifacts` -- Browsable artifact list with type/status filters
- `/artifact/:id` -- Single artifact detail with links and backlinks
- `/matrix` -- Traceability matrix view
- `/coverage` -- Coverage report
- `/docs` -- Document browser
- `/doc/:id` -- Single document rendered as HTML
- `/results` -- Test result runs and history
- `/graph` -- Interactive link graph visualization (SVG via etch)

### 4.2 Application State

The server holds shared state behind `Arc<RwLock<...>>`:

- `Store` -- All loaded artifacts
- `Schema` -- Merged schema
- `LinkGraph` -- Precomputed link graph
- `DocumentStore` -- Loaded markdown documents
- `ResultStore` -- Test result runs
- `RepoContext` -- Git branch, commit, dirty state, sibling projects

### 4.3 Page Layout

Every page shares a common layout with:

- **Context bar** -- Project name, git branch/commit, dirty indicator,
  loaded-at timestamp, and sibling project links
- **Navigation** -- Horizontal nav bar linking to all major views
- **Content area** -- Route-specific content rendered as HTML fragments

HTMX provides partial page updates: clicking a navigation link fetches only
the content fragment and swaps it into the page, avoiding full reloads.

## 5. Schema System

### 5.1 Schema Files

Schema files are YAML documents defining:

```yaml
schema:
  name: dev
  version: "0.1.0"
  extends: [common]

artifact-types:
  - name: requirement
    fields: [...]
    link-fields: [...]

link-types:
  - name: satisfies
    inverse: satisfied-by

traceability-rules:
  - name: requirement-coverage
    source-type: requirement
    required-backlink: satisfies
    severity: warning
```

### 5.2 Available Schemas

| Schema          | Types | Link Types | Rules | Domain                         |
|-----------------|-------|------------|-------|--------------------------------|
| `common`        | 0     | 9          | 0     | Base fields and link types     |
| `dev`           | 3     | 1          | 2     | Development tracking           |
| `stpa`          | 10    | 5          | 7     | STPA safety analysis           |
| `aspice`        | 14    | 2          | 10    | ASPICE v4.0 V-model            |
| `cybersecurity` | 10    | 2          | 10    | SEC.1-4, ISO/SAE 21434         |

### 5.3 Merge Semantics

When schemas are merged, artifact types, link types, and traceability rules
are combined by name. If two schemas define the same type, the later
definition wins. Inverse mappings are rebuilt after merge. This enables
domain-specific schemas to extend common definitions without duplication.

## 6. Test Results as Evidence

[[REQ-009]] specifies that test execution results are tied to releases as
evidence. The `results` module ([[DD-007]]) implements this:

- **TestRunFile** -- YAML format with run metadata and per-artifact results
- **ResultStore** -- In-memory collection sorted by timestamp
- **TestStatus** -- Pass, fail, skip, error, blocked
- **ResultSummary** -- Aggregate statistics with pass rate

Results files are loaded from a configured directory and displayed in the
dashboard alongside artifacts they verify.

## 7. Design Decisions

This architecture reflects the following key decisions:

- [[DD-001]] -- OSLC over per-tool REST adapters for external tool sync
- [[DD-002]] -- petgraph for link graph operations
- [[DD-003]] -- Mergeable YAML schemas for domain composition
- [[DD-004]] -- WIT-based WASM adapter interface for plugins
- [[DD-005]] -- axum + HTMX serve pattern for the dashboard
- [[DD-006]] -- Flat crate structure (rivet-core + rivet-cli)
- [[DD-007]] -- Test results tied to GitHub releases
- [[DD-008]] -- Rust edition 2024 with comprehensive CI
- [[DD-009]] -- Criterion benchmarks as KPI baselines
- [[DD-010]] -- ASPICE 4.0 terminology and composable cybersecurity schema

## 8. Requirements Coverage

This document addresses the following requirements:

- [[REQ-001]] -- Text-file-first artifact management (section 2, 3)
- [[REQ-004]] -- Validation engine (section 3.4)
- [[REQ-005]] -- ReqIF 1.2 import/export (section 3.2)
- [[REQ-006]] -- OSLC-based tool synchronization (section 3.2)
- [[REQ-007]] -- CLI and serve pattern (section 4)
- [[REQ-008]] -- WASM component adapters (section 3.2)
- [[REQ-009]] -- Test results as release evidence (section 6)
- [[REQ-010]] -- Schema-driven validation (section 5)
