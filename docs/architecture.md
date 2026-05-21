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

The library crate has grown well beyond the original core set. The table below groups the
modules by concern; consult `ls rivet-core/src/` for the authoritative file list.

**Artifact model and storage**

| Module       | Purpose                                                          |
|--------------|------------------------------------------------------------------|
| `model`      | Core data types: `Artifact`, `Link`, `ProjectConfig`, `SourceConfig` |
| `store`      | In-memory artifact store with by-ID and by-type indexing         |
| `schema`     | Schema loading, merging, artifact type and link type definitions |
| `links`      | `LinkGraph` construction via petgraph, backlinks, orphan detection |
| `document`   | Markdown documents with YAML frontmatter and wiki-link references |
| `results`    | Test run results model, YAML loading, and `ResultStore`          |

**Validation, coverage, and analysis**

| Module       | Purpose                                                          |
|--------------|------------------------------------------------------------------|
| `validate`   | Validation engine: types, fields, cardinality, traceability rules |
| `coverage`   | Traceability coverage computation per rule                       |
| `coverage_evidence` | Coverage-to-evidence cross-checking                        |
| `matrix`     | Traceability matrix computation (forward and backward)           |
| `query`      | Query engine: filter artifacts by type, status, tag, link presence |
| `diff`       | Artifact diff and diagnostic diff between two store snapshots    |
| `impact`     | Change-impact analysis between store snapshots                   |
| `convergence`| Convergence / gap-closure tracking                               |
| `doc_check`  | Documentation invariants (`rivet docs check`) over `.md` bodies  |
| `lifecycle`  | Artifact status lifecycle transitions and gating                 |
| `compliance` | Compliance-report computation across domain schemas              |

**Incremental engine (rowan + salsa)**

| Module        | Purpose                                                         |
|---------------|-----------------------------------------------------------------|
| `db`          | salsa database: tracked queries and incremental revalidation    |
| `yaml_cst`    | Lossless YAML concrete syntax tree (rowan)                      |
| `yaml_hir`    | Higher-level YAML IR: artifact / link extraction from the CST   |
| `yaml_edit`   | Structure-preserving YAML edits for `rivet add` / `modify`      |
| `sexpr`       | S-expression parser for `validation-rules:` / status gates      |
| `sexpr_eval`  | S-expression evaluator against the artifact store               |

**Cross-repo, variants, and provenance**

| Module          | Purpose                                                       |
|-----------------|---------------------------------------------------------------|
| `externals`     | Cross-repo `externals:` resolution, `git clone`/`fetch`, lock |
| `baseline`      | Named baseline tags and baseline-scoped validation            |
| `snapshot`      | Point-in-time store snapshots for diff / impact               |
| `feature_model` | Feature-model parsing and SAT-style constraint checking       |
| `variant_emit`  | Variant-resolved artifact emission                            |
| `commits`       | Git commit-trailer parsing and commit-to-artifact coverage    |
| `cited_source`  | `cited-source` hash tracking and drift detection              |
| `ownership`     | Artifact ownership / `CODEOWNERS`-style attribution           |

**Mutation, formats, and integration**

| Module         | Purpose                                                        |
|----------------|----------------------------------------------------------------|
| `mutate`       | Schema-validated artifact mutation (`add`, `modify`, `link`, …) |
| `adapter`      | Adapter trait and configuration for import/export              |
| `reqif`        | ReqIF 1.2 XML import/export adapter                            |
| `oslc`         | OSLC client library (not exposed as a CLI subcommand — see §7) |
| `wasm_runtime` | WASM component adapter runtime (feature-gated)                 |
| `bazel`        | MODULE.bazel parsing for build-system-aware cross-repo discovery|
| `mcp`          | Model Context Protocol server primitives                       |
| `export`       | HTML / Zola static-site export                                 |
| `embed`        | `{{stats:}}` / `{{coverage:}}` embed expansion in doc bodies   |
| `verus_specs`  | Verus specification scaffolding for formal verification        |
| `proofs`       | Proof-artifact tracking (Kani / Verus / Rocq)                  |
| `formats/`     | Format-specific adapters: `generic` (YAML), `aadl`, `needs_json`|
| `error`        | Unified error type for the library                             |

This is a representative grouping, not an exhaustive file list; smaller support modules
(`agent_pipelines`, `test_scanner`, `runs`, `templates`, `migrate`, `bundle`, …) round
out the crate.

### 2.2 rivet-cli Modules

| Module          | Purpose                                                       |
|-----------------|---------------------------------------------------------------|
| `main`          | CLI entry point, clap argument parsing, subcommand dispatch   |
| `check`         | Oracle subcommands (`rivet check ...`) — see `docs/oracles.md`|
| `close_gaps`    | `rivet close-gaps` gap-closure driver                         |
| `docs`          | `rivet docs <topic>` / `rivet docs check` documentation tools |
| `mcp`           | `rivet mcp` Model Context Protocol server entry point         |
| `serve`         | axum HTTP server with HTMX-rendered dashboard pages           |
| `render`        | Server-side HTML rendering helpers for `serve`                |
| `schema_cmd`    | `rivet schema` inspection subcommands                         |
| `pipelines_cmd` | `rivet pipelines` agent-pipeline runner                       |
| `runs_cmd`      | `rivet runs` evidence-run management                          |
| `migrate_cmd`   | `rivet schema migrate` schema-migration subcommand            |
| `templates_cmd` | `rivet templates` scaffold subcommand                         |

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
`export()` methods. The native adapters under `rivet-core/src/formats/` are:

1. **GenericYamlAdapter** (`generic`) -- Canonical YAML format with explicit type, links
   array, and fields map. Used for Rivet's own artifacts.
2. **AadlAdapter** (`aadl`) -- Imports AADL architecture models (components, flows,
   analysis results) for the architecture-level traceability bridge.
3. **NeedsJsonAdapter** (`needs_json`) -- Imports sphinx-needs `needs.json` exports with
   configurable type mapping ([[REQ-025]]).

Two further adapters live alongside the format adapters: the **ReqIfAdapter**
(`rivet-core/src/reqif.rs`) for OMG ReqIF 1.2 XML import/export ([[REQ-005]], enabling
interchange with DOORS, Polarion, and codebeamer), and the WASM adapter runtime
([[DD-004]]) for plugin formats.

The `oslc` module ([[DD-001]]) is a client *library* for OSLC discovery, query, and CRUD;
it is **not** wired to a `rivet` CLI subcommand. OSLC has no command-line
surface today — neither an `oslc` subcommand nor an `--oslc` flag on
`sync` — see §7.

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

The `schemas/` directory ships a catalogue of domain schemas — STPA, ASPICE 4.0,
ISO 26262, ISO/PAS 8800, SOTIF, DO-178C, EN 50128, IEC 61508, IEC 62304, the EU AI Act,
GSN safety cases, AADL, Eclipse SCORE, supply-chain — plus a set of *bridge* schemas that
declare cross-domain link types. The structurally distinct examples are summarised below;
the canonical inventory is `docs/schemas.md` and, ultimately, `schemas/*.yaml` itself.

| Schema          | Domain                         |
|-----------------|--------------------------------|
| `common`        | Base fields and link types     |
| `dev`           | Development tracking           |
| `stpa`          | STPA safety analysis           |
| `aspice`        | ASPICE v4.0 V-model            |
| `cybersecurity` | SEC.1-4, ISO/SAE 21434         |

See `docs/schemas.md` for the full domain and bridge-schema catalogue.

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

- [[DD-001]] -- OSLC over per-tool REST adapters for external tool sync. The decision
  stands and the `oslc` client library exists, but OSLC is **not** exposed as a CLI
  subcommand in the current release; `rivet --help` has no `oslc` entry. See
  `docs/plans/2026-03-16-oslc-analysis.md` for the deliberate non-shipping rationale.
- [[DD-002]] -- petgraph for link graph operations
- [[DD-003]] -- Mergeable YAML schemas for domain composition
- [[DD-004]] -- WIT-based WASM adapter interface for plugins
- [[DD-005]] -- axum + HTMX serve pattern for the dashboard
- [[DD-006]] -- Flat crate structure (rivet-core + rivet-cli)
- [[DD-007]] -- Test results tied to GitHub releases
- [[DD-008]] -- Rust edition 2024 with comprehensive CI
- [[DD-009]] -- Criterion benchmarks as KPI baselines
- [[DD-010]] -- ASPICE 4.0 terminology and composable cybersecurity schema

## 8. Phase 3 Architecture Extensions

### 8.1 Incremental Validation (rowan + salsa)

The validation pipeline (section 3) will be restructured as salsa tracked
queries ([[REQ-029]], [[DD-024]]). Each step in the current sequential
pipeline becomes a salsa query with automatic dependency tracking:

```
artifact_source(file)  →  parse_artifacts(file)  →  artifact_store()
       ↓                                                    ↓
merged_schema()  ────────────────→  evaluate_conditional_rules()
                                            ↓
                                    link_graph()  →  validate()
```

When a file changes, salsa re-evaluates only affected queries. This enables:
- Sub-millisecond incremental revalidation for IDE integration
- Free change impact analysis ([[REQ-024]], [[DD-019]]) — impacted artifacts
  are exactly the invalidated salsa queries
- Conditional rule evaluation ([[REQ-023]], [[DD-018]]) — rules re-fire only
  when their dependent fields change

rowan ([[REQ-028]], [[DD-023]]) provides lossless CST for new parsers
(MODULE.bazel, future schema/artifact parsers). Same architecture as spar.

**STPA coverage:** H-9 (stale incremental results), SC-11 (incremental must
equal full validation), UCA-C-10..C-14, CC-C-10..C-14.

### 8.2 CLI Mutation Commands

New subcommands ([[REQ-031]], [[DD-028]]) for schema-validated artifact
mutation: `add`, `modify`, `remove`, `link`, `unlink`, `next-id`.

Architecture: new `rivet-core/src/mutate.rs` module with `validate_mutation()`
pre-check before any file write. All mutations go through the full schema and
store validation before touching disk.

**STPA coverage:** Satisfies SC-1 (validate cross-references before output)
and SC-2 (never silently discard artifacts).

### 8.3 Build-System Integration

Build-system providers ([[REQ-027]], [[DD-022]]) discover cross-repo
dependencies from Bazel MODULE.bazel or Nix flake.lock. The MODULE.bazel
parser ([[FEAT-046]]) uses rowan for a Starlark subset CST.

Bazel integration path:
1. Parse MODULE.bazel directly (no Bazel install needed, rowan CST)
2. Optional: shell out to `bazel mod graph --output json` for resolved paths
3. Resolve external repo filesystem paths via `output_base/external/`

Nix integration: parse `flake.lock` JSON with serde_json.

Distribution: `rules_rivet` Bazel module and Nix flake ([[FEAT-045]]).

**STPA coverage:** H-11 (parser misparse), SC-13 (reject unrecognized
constructs), UCA-C-15..C-17, CC-C-15..C-17.

### 8.4 Formal Verification

Three-layer verification pyramid ([[REQ-030]]):

1. **Kani** ([[DD-025]], [[FEAT-049]]) — bounded model checking for panic
   freedom. 10-15 proof harnesses for core algorithms. New CI job.
2. **Verus** ([[DD-026]], [[FEAT-050]]) — inline functional correctness proofs.
   Validation soundness (PASS → all rules satisfied) and completeness (rule
   violated → diagnostic emitted).
3. **Rocq** ([[DD-027]], [[FEAT-051]]) — metamodel semantic proofs via
   coq-of-rust. Schema satisfiability, rule consistency, ASPICE V-model
   completeness.

**STPA coverage:** H-12 (proof-model divergence), SC-14 (proofs verify actual
implementation).

### 8.5 Conditional Validation Rules

Schema extension ([[REQ-023]], [[DD-018]], [[FEAT-040]]) with `when`/`then`
syntax for state-dependent validation. Rule consistency checking at schema
load time per SC-12.

**STPA coverage:** H-10 (contradictory rules), SC-12 (verify rule consistency
before applying), UCA-C-12, CC-C-12.

### 8.6 sphinx-needs Migration Path

needs.json import adapter ([[REQ-025]], [[DD-020]], [[FEAT-042]]) with
configurable type mapping. SCORE metamodel as a rivet schema. Enables
zero-friction evaluation for sphinx-needs projects.

### 8.7 Test-to-Requirement Traceability

Source scanner ([[REQ-026]], [[DD-021]], [[FEAT-043]]) extracting traceability
markers from test code. Ephemeral injection into the link graph, same pattern
as commit traceability ([[DD-012]]).

### 8.8 Security Hardening

STPA-Sec analysis (H-13, H-14, H-17) identified four attack surfaces requiring
hardening in the current architecture.

#### 8.8.1 Content-Security-Policy Headers

The dashboard server (serve.rs) must set a strict CSP header on all responses:

```
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'
```

This mitigates XSS from H-13 even if HTML escaping is missed in one rendering
path. The `'unsafe-inline'` exception for styles is required by the current
inline CSS approach and should be removed once styles are extracted to a file.

**STPA coverage:** SC-15 (HTML-escape all content), H-13 (XSS via unescaped
artifact content).

#### 8.8.2 Markdown HTML Sanitization

The pulldown-cmark renderer in document.rs must sanitize raw HTML blocks. Two
layers of defense:

1. **Output escaping** -- All artifact field values (title, description, custom
   fields) must be HTML-escaped at the output boundary before interpolation into
   HTML. The `html_escape()` function in document.rs handles `&`, `<`, `>`, `"`.
   serve.rs routes must use this function for all artifact-derived content.

2. **Markdown raw HTML filtering** -- pulldown-cmark's `ENABLE_STRIKETHROUGH`
   and similar extensions are safe, but `Event::Html` and `Event::InlineHtml`
   events must be escaped or stripped. Image URLs must be restricted to
   `http://`, `https://`, and relative paths (no `javascript:` or `data:`
   schemes).

**STPA coverage:** SC-15, H-13.1 (script injection), H-13.2 (image URL
injection).

#### 8.8.3 Git Clone Hook Protection

The externals module (externals.rs) executes `git clone` and `git fetch` for
cross-repo artifact linking ([[REQ-020]]). To prevent arbitrary code execution
via git hooks (H-17), all git operations must:

1. Pass `--config core.hooksPath=/dev/null` to disable post-checkout and other
   hooks in cloned repositories.
2. Use `--depth 1` for initial clones when only HEAD is needed, reducing the
   attack surface from malicious repository history.
3. Log the URL and commit SHA being fetched for audit trail purposes.

**STPA coverage:** SC-19 (git clone hook protection), H-17 (arbitrary code
execution via hooks), UCA-L-6.

#### 8.8.4 WASM Adapter Output Validation

The WASM runtime (wasm_runtime.rs) loads third-party adapter components that
return imported artifacts. Beyond existing fuel metering and memory limits,
the host must validate adapter output ([[REQ-008]]):

1. **Count verification** -- The adapter must report the expected artifact count
   as a separate return value. The host compares the declared count against the
   actual returned count and rejects mismatches.
2. **ID pattern check** -- All returned artifact IDs must match expected patterns
   for the declared type. IDs that do not match the schema's ID prefix
   conventions are flagged.
3. **Schema validation** -- All returned artifacts pass full schema validation
   before acceptance into the store (this already exists but is noted for
   completeness).

**STPA coverage:** SC-16 (WASM output validation), H-14 (untrusted adapter
code), UCA-C-21.

## 9. Requirements Coverage

This document addresses the following requirements:

- [[REQ-001]] -- Text-file-first artifact management (section 2, 3)
- [[REQ-004]] -- Validation engine (section 3.4)
- [[REQ-005]] -- ReqIF 1.2 import/export (section 3.2)
- [[REQ-006]] -- OSLC-based tool synchronization (section 3.2)
- [[REQ-007]] -- CLI and serve pattern (section 4)
- [[REQ-008]] -- WASM component adapters (section 3.2)
- [[REQ-009]] -- Test results as release evidence (section 6)
- [[REQ-010]] -- Schema-driven validation (section 5)
- [[REQ-023]] -- Conditional validation rules (section 8.5)
- [[REQ-024]] -- Change impact analysis (section 8.1)
- [[REQ-025]] -- sphinx-needs JSON import (section 8.6)
- [[REQ-026]] -- Test-to-requirement traceability (section 8.7)
- [[REQ-027]] -- Build-system-aware cross-repo discovery (section 8.3)
- [[REQ-028]] -- Diagnostic-quality parsing with rowan (section 8.1)
- [[REQ-029]] -- Incremental validation via salsa (section 8.1)
- [[REQ-030]] -- Formal correctness guarantees (section 8.4)
- [[REQ-031]] -- Schema-validated CLI mutation (section 8.2)
