---
id: ROAD-001
type: specification
title: Product Roadmap and Feature Plan
status: approved
glossary:
  STPA: Systems-Theoretic Process Analysis
  ASPICE: Automotive SPICE
  OSLC: Open Services for Lifecycle Collaboration
  ReqIF: Requirements Interchange Format
  WASM: WebAssembly
  HTMX: Hypermedia-driven AJAX
---

# Product Roadmap

## Phase 1 — Core Engine (Complete)

Phase 1 established the foundation: artifact model, adapters, schema system,
link graph, validation, and CLI tooling.

### Adapters

- [[FEAT-001]] — STPA YAML adapter for importing meld's safety analysis artifacts
- [[FEAT-002]] — Generic YAML adapter for canonical artifact format

### Schema & Validation

- [[FEAT-003]] — Schema loading and merging (common + domain overlays)
- [[FEAT-005]] — Validation engine (types, fields, links, traceability rules)
- [[FEAT-016]] — ASPICE 4.0 schema alignment (v4.0 verification types)
- [[FEAT-017]] — Cybersecurity schema (SEC.1-4, TARA, 10 artifact types)

### Graph & Traceability

- [[FEAT-004]] — Link graph with petgraph (cycles, orphans, reachability)
- [[FEAT-006]] — Traceability matrix computation with coverage percentages

### CLI

- [[FEAT-007]] — `rivet validate` command
- [[FEAT-008]] — `rivet stpa` command for direct STPA validation

### Testing & Quality

- [[FEAT-013]] — Property-based tests (proptest) for randomized verification
- [[FEAT-014]] — Integration test suite (dogfood, roundtrip, schema merge)
- [[FEAT-015]] — Criterion benchmarks at 100/1000/10000 scales

## Phase 2 — Dashboard & Interchange (In Progress)

Phase 2 adds the web dashboard and interchange formats for external tool
integration.

### Dashboard

- [[FEAT-009]] — HTTP serve with HTMX dashboard (axum, no frontend framework)

The dashboard provides: artifact browsing, validation results, traceability
graph (via etch layout engine), coverage matrix, document viewer with markdown
rendering, source code viewer with line-level anchors, document linkage view,
verification tracking, test results, git diff view, and project switcher.

### Interchange

- [[FEAT-010]] — ReqIF 1.2 import/export adapter

### AADL Architecture Integration

- [[FEAT-018]] — AADL adapter via spar CLI JSON (Layer 1 import)
- [[FEAT-019]] — AADL architecture dogfood (rivet models itself in arch/)

The `arch/` directory contains AADL models for rivet's own architecture:
`RivetSystem` (top-level system + core/cli processes), `RivetAdapters`
(extensible adapter subsystem + WASM runtime), and `RivetDashboard`
(axum/HTMX serve handler with view renderers and graph visualizer).

## Phase 2.5 — Documentation & Agent Support (Complete)

Phase 2.5 added built-in documentation, schema introspection, agent context
generation, and machine-readable output — making rivet self-describing and
consumable by both humans and AI agents.

### Embedded Schemas & Scaffolding

- [[FEAT-021]] — Schemas compiled into binary (include_str! with disk fallback)
- [[FEAT-026]] — `rivet init --preset` for schema-aware project scaffolding

### CLI Introspection Commands

- [[FEAT-022]] — `rivet docs` with topic browsing, grep search, --format json
- [[FEAT-023]] — `rivet schema` introspection (list, show, links, rules)
- [[FEAT-024]] — `rivet context` generates .rivet/agent-context.md for AI agents

### Machine-Readable Output

- [[FEAT-025]] — `--format json` envelope on all CLI commands

### Dashboard Enhancements

- [[FEAT-027]] — Server-side syntax highlighting in source viewer and docs
- [[FEAT-028]] — Help & Docs dashboard section (schema browser, link types, rules)

## Phase 3 — Sync & Extensibility (Planned)

Phase 3 enables bidirectional synchronization with external ALM tools and
runtime extensibility through WASM components.

### OSLC Integration

- [[FEAT-011]] — OSLC RM/QM client for Polarion, DOORS, codebeamer sync

### WASM Runtime

- [[FEAT-012]] — WASM component adapters loaded at runtime via WIT interface
- [[FEAT-020]] — AADL browser rendering via spar WASM module

## Test Coverage

The following test artifacts verify feature implementations:

- [[TEST-001]] — Store and model unit tests
- [[TEST-002]] — STPA adapter and schema tests
- [[TEST-003]] — Schema validation and merge tests
- [[TEST-004]] — Link graph and coverage tests
- [[TEST-005]] — ReqIF roundtrip tests
- [[TEST-006]] — Property-based tests (proptest)
- [[TEST-007]] — Integration test suite
- [[TEST-008]] — Diff module tests
- [[TEST-009]] — Document system tests
- [[TEST-010]] — Results model tests
