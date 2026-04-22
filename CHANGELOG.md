# Changelog

<!-- AUDIT-FILE: verified 2026-04-19 — all numeric counts in this file
     are historical snapshots taken at release time, not current state. -->

## [0.4.0] — 2026-04-19

### Features

- **Verification pyramid** — STPA-Sec test suite (16 tests), differential YAML parsing (rowan vs serde_yaml), operation-sequence property tests, Kani BMC expanded from 15 to 27 harnesses covering the core public API, Verus/Rocq jobs wired into CI via Bazel (#150)
- **Variant / Product-Line Engineering** — feature-model schema, constraint solver, `rivet variant check/list/solve`, s-expression query language with forall/exists quantifiers and reachable graph traversal
- **Zola static-site export** — multi-project filtered export with `--prefix` namespacing, wiki-link resolution, JSON data files, TOML escaping
- **Sphinx-needs JSON import adapter** — migration path from sphinx-needs projects
- **LSP code actions** — quick-fix for missing-link diagnostics
- **MCP CRUD + integration tests** — query, modify, link, unlink, remove
- **AI-in-the-loop STPA + security analysis**
- **`rivet validate --variant`** — variant-scoped validation
- **EU AI Act runtime evidence**

### Fixes

- **STPA extraction** — suffix-based UCA discovery (e.g. `*-ucas` sections) and nested `control-actions` inside controllers; previously 0 control-action artifacts on real STPA projects, now extracted correctly (#150)
- **`rivet-core` unwrap hardening** — 12 production `unwrap()` sites replaced with safe `let Some(_) = _ else` patterns in validate, matrix, diff, mutate
- **Zola export** — TOML escaping, title fallback, date handling, mermaid block rendering
- **Playwright regressions** — coverage-view strict-mode violation, control-action title assumptions, `/graph` timeout handling (#151)
- **Deps** — rustls-webpki 0.103.12 (patches RUSTSEC-2026-0098 / -0099) (#151)
- **Clippy** — junit.rs `collapsible-match` from Rust 1.95 (#151)
- **Tool qualification** — STPA, requirements, MCP audit, regex bounds, `export --clean`, import verification

### Testing

- **27 Kani BMC harnesses** — up from 15, covering commit parsing, artifact IDs/ranges, trailer parsing, store upsert, diff, validation guards, markdown render, HTML strip
- **Differential YAML parser tests** — 6 tests comparing the rowan parser against serde_yaml for equivalence
- **Proptest operation sequences** — 3 tests fuzzing random insert/upsert/validate sequences against store invariants
- **Dual-crate mutation testing** — rivet-cli now covered alongside rivet-core, 40-minute CI timeout

### CI

- **Kani job enabled** — previously commented out
- **Verus + Rocq jobs** — added via Bazel (marked `continue-on-error: true` pending toolchain stabilization)
- **CLI mutation testing** — added alongside core

## [0.2.0] — 2026-03-21

### Features

- **LSP server** (`rivet lsp`) — language server with diagnostics, hover, go-to-definition, and completion for artifact YAML files; re-validates on file save (#58, #60, #61)
- **Baseline-scoped validation** — `--baseline v0.1.0` flag on validate, list, stats, coverage, export scopes to named artifact sets (#58)
- **STPA-Sec security analysis** — 31 adversarial threat artifacts (5 losses, 6 hazards, 6 constraints, 7 UCAs, 7 scenarios) with dashboard section (#45)
- **Eclipse SCORE schema** — 40+ artifact types mapping the SCORE metamodel for safety-critical automotive/embedded development (#61)
- **Self-contained binary** — HTMX, Mermaid, and Google Fonts bundled via `include_str!`; no CDN dependencies (#45)
- **Dashboard filter/sort/pagination** — `?types=`, `?q=`, `?sort=`, `?dir=`, `?per_page=`, `?page=` on `/artifacts` and `/stpa` (#52)
- **AADL compound graph layout** — nested `aadl-component` containers rendered via Etch compound layout engine (#45)
- **HTML export: STPA + graph pages** — static STPA hierarchy and SVG traceability graph in export output (#45)
- **Document-to-document references** — `[[DOC-ID]]` in document bodies resolves to `.doc-ref` links (#45)
- **`rivet init --agents`** — generates project-aware AGENTS.md (universal AI agent instruction standard, 25+ tools) (#59)
- **`rivet batch`** — atomic multi-mutation files for bulk artifact operations (#43)
- **`rivet add --link`** — add links inline when creating artifacts (#42)
- **`--format json` on validate and coverage** — machine-readable output for all query commands (#43)
- **Cross-repo fixes** — `rivet link` with externals, `--skip-external-validation`, `rivet sync --local` (#45)
- **Reusable UI components** — ViewParams, FilterBar, Pagination, SortableTable extracted to `components.rs` (#56)
- **Startup update check** — non-blocking background thread checks GitHub releases once per 24h (#56)
- **8 new ARCH components** — phase-3 requirements now have architecture allocation (#56)
- **WASM stubs in build.rs** — `--features embed-wasm` removed; build.rs generates stubs automatically (#50)
- **Etch rendering** — port-aware layout, orthogonal routing, interactive HTML, SVG edge render order fixes (#37, #53, #55)

### Security

- **Mermaid `securityLevel: strict`** — prevents XSS via crafted Mermaid diagrams (#61)
- **SSC-3: localhost default** — dashboard binds to 127.0.0.1 by default, warns on 0.0.0.0 (#52)
- **SSC-6: YAML document-size limit** — 10 MB limit in generic and STPA adapters prevents DoS (#52)
- **CSP `font-src data:`** — allows base64-embedded fonts without CSP violations (#47)
- **HTML escaping** — wiki-link IDs, source file refs, results view fields all properly escaped (#61)
- **WASM graceful fallback** — HEAD probe, no console error spam when spar WASM unavailable (#48, #49)

### Performance

- **7.8x store insert speedup** — O(n²) `contains()` → O(1) direct insert (#58)
- **Regex pre-compilation** — conditional validation rules compile regex once, not per-artifact (#58)
- **Zero-copy field reads** — `Cow<str>` for `get_field_value` eliminates unnecessary clones (#58)
- **Cached diagnostics** — `page_layout()` uses cached results instead of recomputing per page view (#61)

### Testing

- **235+ Playwright E2E tests** across 22 spec files covering all routes (#45, #51, #54, #62)
- **Playwright CI job** — runs after unit tests, builds release binary, installs Chromium (#45)
- **Audit regression tests** — 17 tests for security, performance, edge cases, consistency (#62)
- **Mutation testing** — 0 missed mutants in rivet-core (#63)
- **Coverage fixes** — 27 new tests for store, schema, model patch coverage (#60)
- **324 `// rivet: verifies` markers** across 22 source files for test scanner (#52)

### Fixes

- **Navigation `href="#"` eliminated** — all 65 occurrences replaced with real paths (#46)
- **`/assets/*` excluded from layout middleware** — HTMX/Mermaid JS served correctly (#47)
- **Print button** — `new URL()` replaced with string concat, mermaid.js added to print layout (#51, #57)
- **UTF-8 string slicing** — `&title[..26]` → `chars().take(26)` prevents panic on multi-byte chars (#61)
- **Serve integration test timeout** — 5s → 15s for slow CI runners (#45)

### V-Model & Traceability

- **0 lifecycle coverage gaps** — DD-036–039, FEAT-064–065, TEST-011–015 close all holes
- **3 structural gaps closed** — REQ-003 → FEAT-016, REQ-009 → FEAT-014, REQ-022 → DD-039
- **447 artifacts**, validate PASS, 0 warnings

### Infrastructure

- **7 stale branches deleted** — clean branch list (main, gh-pages only)
- **Pre-commit config** — large asset exclusion for mermaid.min.js and fonts.css

## [0.1.0] — 2026-03-14

Initial release. See git history for details.
