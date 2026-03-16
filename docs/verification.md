---
id: VER-001
type: specification
title: Verification Strategy and Test Mapping
status: approved
glossary:
  SWE.4: ASPICE Software Unit Verification (proptest, Miri)
  SWE.5: ASPICE Software Integration Verification (cross-module tests)
  SWE.6: ASPICE Software Qualification Verification (full pipeline, benchmarks)
  STPA: Systems-Theoretic Process Analysis
  ASPICE: Automotive SPICE
---

# Verification Strategy and Test Mapping

## 1. Purpose

This document defines the verification strategy for the Rivet project and maps
test suites to the requirements they verify. Rivet dogfoods itself: the same
tool that validates ASPICE traceability for its users is used to track its own
requirements, design decisions, and test coverage.

The test suite is organized to mirror ASPICE SWE.4/5/6 verification levels
as specified by [[REQ-014]].

## 2. Test Suite Overview

The test suite is organized by ASPICE verification level. Actual test counts
are maintained by the test runner — run `cargo test -- --list` for the
current count.

| Level | Category            | Location                              |
|-------|---------------------|---------------------------------------|
| SWE.4 | Unit tests          | `rivet-core/src/*.rs` (`#[cfg(test)]` modules) |
| SWE.4 | Property tests      | `rivet-core/tests/proptest_core.rs`   |
| SWE.4 | Fuzz targets        | `fuzz/fuzz_targets/`                  |
| SWE.5 | Integration tests   | `rivet-core/tests/integration.rs`     |
| SWE.5 | STPA roundtrip      | `rivet-core/tests/stpa_roundtrip.rs`  |
| SWE.6 | Benchmarks          | `rivet-core/benches/`                 |
| SWE.6 | CI quality gates    | `.github/workflows/`                  |

## 3. Unit Tests (SWE.4)

Unit tests live inside `#[cfg(test)]` modules within rivet-core source files.
They verify individual module behavior in isolation. Key modules tested:

- **diff** (`diff.rs`) — structural diff between store snapshots. Verifies [[REQ-001]].
- **document** (`document.rs`) — YAML frontmatter, wiki-link references, HTML rendering. Verifies [[REQ-001]], [[REQ-007]].
- **results** (`results.rs`) — test results model, status predicates, YAML roundtrip. Verifies [[REQ-009]].
- **reqif** (`reqif.rs`) — ReqIF 1.2 XML roundtrip, export validity, minimal parse. Verifies [[REQ-005]].
- **coverage** (`coverage.rs`) — traceability coverage computation, edge cases. Verifies [[REQ-004]].
- **store** (`store.rs`) — insert, lookup, by-type indexing, upsert. Verifies [[REQ-001]].

Test-to-requirement tracing is done via `// rivet: verifies` markers in test
source code (once [[FEAT-043]] ships) or via the TEST-* artifacts in
`artifacts/verification.yaml`.

## 4. Property-Based Tests (SWE.4)

File: `rivet-core/tests/proptest_core.rs`

Property tests use proptest to verify invariants with randomized inputs.
CI runs at 1000 cases per property via `PROPTEST_CASES` env var.

Key properties verified:

- **Store consistency** — inserting N unique artifacts yields retrievable store of size N
- **Duplicate rejection** — inserting the same ID twice is rejected
- **Schema merge idempotence** — merging a schema with itself preserves all types and inverses
- **Backlink symmetry** — every forward link has a corresponding backlink ([[REQ-004]])
- **Validation determinism** — `validate()` on identical inputs produces identical output
- **Type iterator correctness** — `types()` returns exactly the set of inserted types

## 5. Integration Tests (SWE.5)

Files: `rivet-core/tests/integration.rs`, `rivet-core/tests/stpa_roundtrip.rs`

Integration tests exercise cross-module pipelines: loading real schemas,
building stores, computing link graphs, running validation, and computing
traceability matrices.

The **dogfood validation** test (`test_dogfood_validate`) loads Rivet's own
`rivet.yaml`, schemas, and artifacts, then runs the full validation pipeline.
This test must pass with zero errors — it verifies that Rivet can validate
itself, the most direct form of dogfooding.

## 6. OSLC Integration Tests

File: `rivet-core/tests/oslc_integration.rs`

These tests are feature-gated behind `#[cfg(feature = "oslc")]` and use
wiremock to simulate an OSLC-compliant ALM tool. They verify [[REQ-006]]:

- Service Provider Catalog discovery
- OSLC RM query with filtering (oslc.where, oslc.select)
- Single resource GET
- Resource creation (POST to creation factory)
- Resource update (PUT)
- Pull via SyncAdapter (OSLC resources converted to Rivet artifacts)
- Mixed resource type handling (RM, QM, CM)
- Error handling (404, 500, malformed JSON)
- Authentication (basic auth, bearer token)
- Pagination (next_page link)

## 7. Benchmarks (SWE.6)

[[REQ-013]] and [[DD-009]] specify criterion benchmarks at multiple scales.
Seven benchmark groups measure core operations at 100, 1000, and 10000
artifact scales:

| Benchmark Group        | Measures                                |
|------------------------|-----------------------------------------|
| `store_insert`         | Artifact insertion throughput            |
| `store_lookup`         | By-ID and by-type lookup latency         |
| `schema_load`          | Schema file loading and merge time       |
| `link_graph_build`     | petgraph construction from store         |
| `validate`             | Full validation pass duration            |
| `matrix_compute`       | Traceability matrix computation          |
| `coverage_compute`     | Coverage report generation               |

## 8. CI Quality Gates (SWE.6)

[[REQ-012]] and [[DD-008]] mandate the following CI stages, each acting as
a qualification gate:

| Gate           | Tool                | What it catches                        |
|----------------|---------------------|----------------------------------------|
| `fmt`          | `cargo fmt`         | Code style violations                  |
| `clippy`       | `clippy -D warnings`| Lint warnings, unsafe patterns         |
| `test`         | `cargo test`        | Functional regressions                 |
| `miri`         | `cargo +nightly miri` | Undefined behavior, memory safety   |
| `proptest`     | proptest            | Invariant violations with random input |
| `audit`        | `cargo audit`       | Known CVEs in dependencies             |
| `deny`         | `cargo deny`        | License violations, duplicate deps     |
| `vet`          | `cargo vet`         | Supply chain verification              |
| `coverage`     | `cargo llvm-cov`    | Code coverage metrics                  |
| `msrv`         | MSRV 1.85 check     | Backward compatibility ([[REQ-011]])   |

## 9. Requirement-to-Test Mapping

Test-to-requirement traceability is tracked via TEST-* artifacts in
`artifacts/verification.yaml` and (once implemented) via `// rivet: verifies`
source markers scanned by [[FEAT-043]].

Run `rivet coverage` to see the current requirement-to-test coverage. Do not
maintain test count tables manually — they are unmaintainable and immediately
stale.

## 10. Formal Verification Strategy (Phase 3)

[[REQ-030]] specifies formal correctness guarantees at three levels, forming a
verification pyramid that builds on the existing test infrastructure.

### 10.1 Kani Bounded Model Checking

[[DD-025]], [[FEAT-049]]

Kani proof harnesses exhaustively check all inputs within configurable bounds.
Each harness proves a specific property about the actual compiled code (per
SC-14). Target: 10-15 harnesses covering:

| Target | Property proven |
|--------|----------------|
| `parse_artifact_ref()` | No panics for any `&str` input |
| `Schema::merge()` | No panics, all input types preserved |
| `LinkGraph::build()` | No panics for any valid store+schema |
| `LinkGraph::build()` | Backlink symmetry: forward A→B implies backward B←A |
| `validate()` cardinality | All `Cardinality` enum arms handled |
| `has_cycles()` | Terminates for graphs up to N nodes |
| `reachable()` | Result is a subset of all nodes, terminates |
| `orphans()` | Orphan set has no links or backlinks |
| `detect_circular_deps()` | DFS terminates for any graph |
| `Store::insert()` | Duplicate returns error |
| `compute_coverage()` | Coverage always in `[0.0, 1.0]` |

CI integration: new `kani` job using `model-checking/kani-github-action`.

### 10.2 Verus Functional Correctness

[[DD-026]], [[FEAT-050]]

Inline `requires`/`ensures` annotations proving:

- **Soundness:** If `validate()` returns no error diagnostics, all
  traceability rules are satisfied for the given store and schema.
- **Completeness:** For every traceability rule violation in the store,
  `validate()` emits a corresponding diagnostic.
- **Backlink symmetry:** `links_from(A)` contains B ↔ `backlinks_to(B)` contains A.
- **Conditional rule consistency:** If two rules can co-fire on one artifact,
  their `then` requirements do not contradict.
- **Reachability correctness:** `reachable()` returns exactly the transitive
  closure of the specified link type.

### 10.3 Rocq Metamodel Specification

[[DD-027]], [[FEAT-051]]

Schema semantics modeled in Rocq via coq-of-rust translation:

- **Schema satisfiability:** Given a set of traceability rules and conditional
  rules, prove that at least one valid artifact configuration exists (the
  rules are not contradictory).
- **Monotonicity:** Adding an artifact to a valid store preserves validity of
  previously valid artifacts (or formally characterizes when it doesn't).
- **Well-foundedness:** The traceability rule evaluation terminates for any
  finite set of artifacts and rules.
- **ASPICE V-model completeness:** The `aspice.yaml` schema's rules enforce
  the complete V-model chain from stakeholder requirements through system
  and software requirements to design, implementation, and verification.

### 10.4 Verification Pyramid

```
         ╱╲
        ╱  ╲       Rocq / coq-of-rust
       ╱ TQ ╲      Metamodel proofs: satisfiability, monotonicity
      ╱──────╲     (ISO 26262 TCL 1 evidence)
     ╱        ╲
    ╱  Verus   ╲   Functional correctness
   ╱  sound +   ╲  validate() is sound + complete
  ╱  complete    ╲ (inline Rust proofs, SMT-backed)
 ╱────────────────╲
╱                  ╲
╱  Kani  +  proptest ╲  Panic freedom + property testing
╱  + fuzzing + Miri    ╲  (automated, CI-integrated)
╱──────────────────────╲
```

Each layer builds on the one below. The existing test infrastructure (proptest,
fuzzing, Miri, mutation testing) forms the base. Kani fills gaps with exhaustive
bounded checking. Verus adds provable correctness. Rocq provides the deepest
assurance for tool qualification.

**STPA coverage:** H-12 (proof-model divergence), SC-14 (proofs verify actual
implementation).

## 11. Phase 3 Verification Approach

Each phase 3 workstream adds verification at the appropriate level:

- **[[REQ-023]] Conditional rules** — proptest for rule evaluation determinism, Kani for condition matching panic freedom, Rocq for rule consistency proofs
- **[[REQ-025]] needs.json import** — fuzz target for malformed JSON, integration tests with real SCORE data
- **[[REQ-028]] rowan parser** — fuzz target for arbitrary byte input, Kani for parser panic freedom, unit tests for each syntax kind
- **[[REQ-029]] salsa incremental** — proptest comparing incremental vs full validation results, Verus soundness proof
- **[[REQ-030]] formal verification** — the Kani/Verus/Rocq harnesses ARE the verification
- **[[REQ-031]] CLI mutations** — proptest for random mutation sequences never producing invalid YAML, integration tests for all rejection cases

## 12. STPA-Sec Test Requirements

The STPA-Sec analysis (2026-03-16) identified security-relevant hazards that
require dedicated test coverage. These tests supplement the existing functional
test suite with adversarial input testing.

### 12.1 XSS Prevention (H-13, SC-15)

| Test | Description | Verifies |
|------|-------------|----------|
| `test_artifact_title_xss_escaped` | Artifact with title `<script>alert(1)</script>` renders escaped in dashboard HTML | SC-15, UCA-D-3 |
| `test_artifact_description_xss_escaped` | Artifact description with `<img onerror="...">` is sanitized | SC-15, H-13.1 |
| `test_document_markdown_raw_html_stripped` | Markdown `<script>` blocks are escaped or removed from rendered HTML | SC-15, H-13.1 |
| `test_document_image_url_javascript_blocked` | Markdown image with `javascript:` URL scheme is rejected | SC-15, H-13.2 |
| `test_csp_header_present` | Dashboard responses include Content-Security-Policy header | SC-15 |
| `test_embed_card_xss_escaped` | `{{artifact:ID}}` embed with adversarial field values renders escaped | SC-15, UCA-C-25 |

### 12.2 WASM Adapter Output Validation (H-14, SC-16)

| Test | Description | Verifies |
|------|-------------|----------|
| `test_wasm_adapter_count_mismatch_rejected` | Adapter returning more artifacts than declared count is rejected | SC-16, UCA-C-21 |
| `test_wasm_adapter_fabricated_ids_detected` | Adapter-returned IDs not matching expected patterns are flagged | SC-16, UCA-C-21 |
| `test_wasm_fuel_exhaustion_returns_error` | Adapter exceeding fuel limit is terminated with error diagnostic | CC-C-22, UCA-C-22 |
| `test_wasm_symlink_escape_blocked` | Adapter cannot read files outside preopened directories via symlinks | CC-C-23, UCA-C-23 |

### 12.3 Commit Traceability Accuracy (H-15, SC-17)

| Test | Description | Verifies |
|------|-------------|----------|
| `test_commit_iso_reference_not_artifact` | "ISO-26262" in trailer is not counted as artifact reference | SC-17, UCA-C-18 |
| `test_commit_sub_hazard_id_extracted` | "H-1.2" in trailer is correctly extracted as artifact reference | CC-C-19, UCA-C-19 |
| `test_commit_uca_id_extracted` | "UCA-C-10" in trailer is correctly extracted as artifact reference | CC-C-19, UCA-C-19 |
| `test_commit_coverage_validates_against_store` | Only artifact IDs present in the store are counted as coverage | SC-17, UCA-C-18 |

### 12.4 Dashboard Reload Failure Handling (H-16, SC-18)

| Test | Description | Verifies |
|------|-------------|----------|
| `test_reload_yaml_error_returns_error_response` | Reload with malformed YAML returns HTTP error, not 200 OK | SC-18, UCA-D-4 |
| `test_reload_failure_preserves_state` | After failed reload, dashboard serves previous valid state | SC-18 |
| `test_stale_data_indicator_after_failed_reload` | Dashboard pages include stale-data banner after reload failure | SC-18 |

### 12.5 Git Clone Hook Protection (H-17, SC-19)

| Test | Description | Verifies |
|------|-------------|----------|
| `test_git_clone_disables_hooks` | `sync_external()` passes `--config core.hooksPath=/dev/null` to git clone | SC-19, UCA-L-6 |
| `test_external_sync_logs_url_and_sha` | External sync logs the cloned URL and checkout SHA | SC-19 |
| `test_circular_external_deps_detected` | Circular cross-repo dependencies produce a configuration error | CC-C-20, UCA-C-20 |

### 12.6 Document Embed Validation (UCA-C-25)

| Test | Description | Verifies |
|------|-------------|----------|
| `test_validate_documents_checks_embed_refs` | `{{artifact:NOPE-999}}` embed produces a validation diagnostic | CC-C-25, UCA-C-25 |
| `test_validate_documents_checks_wiki_links` | Wiki-link to nonexistent ID produces a validation diagnostic (existing) | SC-1 |
