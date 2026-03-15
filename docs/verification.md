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

Rivet's test suite consists of 59 tests across four categories:

| Level | Category            | Test Count | File                          |
|-------|---------------------|------------|-------------------------------|
| SWE.4 | Unit tests          | 30         | `rivet-core/src/*.rs`         |
| SWE.4 | Property tests      | 6          | `rivet-core/tests/proptest_core.rs` |
| SWE.5 | Integration tests   | 18         | `rivet-core/tests/integration.rs`   |
| SWE.5 | STPA roundtrip      | 5          | `rivet-core/tests/stpa_roundtrip.rs` |
| SWE.6 | Benchmarks          | 7 groups   | `rivet-core/benches/`         |
| SWE.6 | CI quality gates    | 10 stages  | `.github/workflows/`          |

All 59 tests pass. Zero failures, zero ignored.

## 3. Unit Tests (SWE.4)

Unit tests live inside `#[cfg(test)]` modules within rivet-core source files.
They verify individual module behavior in isolation.

### 3.1 Diff Module (5 tests)

File: `rivet-core/src/diff.rs`

| Test                          | Verifies      |
|-------------------------------|---------------|
| `empty_diff`                  | [[REQ-001]]   |
| `identical_stores`            | [[REQ-001]]   |
| `added_artifact`              | [[REQ-001]]   |
| `removed_artifact`            | [[REQ-001]]   |
| `modified_title`              | [[REQ-001]]   |

The diff module computes structural differences between two store snapshots.
These tests verify that added, removed, modified, and unchanged artifacts are
correctly classified.

### 3.2 Document Module (9 tests)

File: `rivet-core/src/document.rs`

| Test                              | Verifies      |
|-----------------------------------|---------------|
| `parse_frontmatter`              | [[REQ-001]]   |
| `missing_frontmatter_is_error`   | [[REQ-001]]   |
| `document_store`                 | [[REQ-001]]   |
| `render_html_headings`           | [[REQ-007]]   |
| `render_html_resolves_refs`      | [[REQ-007]]   |
| `default_doc_type_when_omitted`  | [[REQ-001]]   |
| `multiple_refs_on_one_line`      | [[REQ-001]]   |
| `extract_references_from_body`   | [[REQ-004]]   |
| `extract_sections_hierarchy`     | [[REQ-007]]   |

Document tests verify YAML frontmatter parsing, wiki-link reference extraction,
HTML rendering, and the document store.

### 3.3 Results Module (9 tests)

File: `rivet-core/src/results.rs`

| Test                              | Verifies      |
|-----------------------------------|---------------|
| `test_status_display`            | [[REQ-009]]   |
| `test_status_is_pass_fail`       | [[REQ-009]]   |
| `test_result_store_insert_and_sort` | [[REQ-009]] |
| `test_latest_for`                | [[REQ-009]]   |
| `test_history_for`               | [[REQ-009]]   |
| `test_summary`                   | [[REQ-009]]   |
| `test_load_results_empty_dir`    | [[REQ-009]]   |
| `test_load_results_nonexistent_dir` | [[REQ-009]] |
| `test_roundtrip_yaml`            | [[REQ-009]]   |

These tests verify the test results model: status enum behavior, result store
ordering, latest/history queries, aggregate statistics, YAML roundtrip
serialization, and edge cases (empty/nonexistent directories).

### 3.4 ReqIF Module (3 tests)

File: `rivet-core/src/reqif.rs`

| Test                              | Verifies      |
|-----------------------------------|---------------|
| `test_export_produces_valid_xml` | [[REQ-005]]   |
| `test_parse_minimal_reqif`       | [[REQ-005]]   |
| `test_roundtrip`                 | [[REQ-005]]   |

These tests verify that ReqIF 1.2 XML export produces valid structure, that
minimal ReqIF documents can be parsed, and that full roundtrip
(export then import) preserves all artifact data.

### 3.5 Coverage Module (4 tests)

File: `rivet-core/src/coverage.rs`

| Test                              | Verifies      |
|-----------------------------------|---------------|
| `full_coverage`                  | [[REQ-004]]   |
| `partial_coverage`               | [[REQ-004]]   |
| `zero_artifacts_gives_100_percent` | [[REQ-004]] |
| `to_json_roundtrip`             | [[REQ-004]]   |

Coverage tests verify the traceability coverage computation engine: full
coverage detection, partial coverage percentage calculation, vacuous truth
for empty sets, and JSON serialization roundtrip.

## 4. Property-Based Tests (SWE.4)

File: `rivet-core/tests/proptest_core.rs`

Property tests use proptest to verify invariants with randomized inputs.
Each test runs 30-50 cases with generated data.

| Test                              | Verifies             |
|-----------------------------------|----------------------|
| `prop_store_insert_all_retrievable` | [[REQ-001]]       |
| `prop_store_rejects_duplicates`  | [[REQ-001]]          |
| `prop_schema_merge_idempotent`   | [[REQ-010]]          |
| `prop_link_graph_backlink_symmetry` | [[REQ-004]]       |
| `prop_validation_determinism`    | [[REQ-004]]          |
| `prop_store_types_match_inserted` | [[REQ-001]]         |

These properties verify:

- **Store consistency** -- Inserting N unique artifacts yields a store of
  size N where every artifact is retrievable by ID and by-type counts match.
- **Duplicate rejection** -- Inserting the same ID twice is rejected.
- **Schema merge idempotence** -- Merging a schema with itself produces the
  same artifact types, link types, and inverse maps.
- **Backlink symmetry** -- Every forward link in the graph has a corresponding
  backlink at the target node.
- **Validation determinism** -- Running `validate()` twice on identical inputs
  produces identical diagnostic output.
- **Type iterator correctness** -- The `types()` iterator returns exactly the
  set of types that have artifacts in the store.

## 5. Integration Tests (SWE.5)

File: `rivet-core/tests/integration.rs`

Integration tests exercise cross-module pipelines: loading real schemas,
building stores, computing link graphs, running validation, and computing
traceability matrices.

| Test                              | Verifies                    |
|-----------------------------------|-----------------------------|
| `test_dogfood_validate`          | [[REQ-001]], [[REQ-010]]    |
| `test_generic_yaml_roundtrip`    | [[REQ-001]]                 |
| `test_schema_merge_preserves_types` | [[REQ-010]], [[REQ-003]] |
| `test_cybersecurity_schema_merge` | [[REQ-016]]                |
| `test_traceability_matrix`       | [[REQ-004]]                 |
| `test_traceability_matrix_empty` | [[REQ-004]]                 |
| `test_query_filters`             | [[REQ-007]]                 |
| `test_link_graph_integration`    | [[REQ-004]]                 |
| `test_aspice_traceability_rules` | [[REQ-003]], [[REQ-015]]    |
| `test_store_upsert_overwrites`   | [[REQ-001]]                 |
| `test_store_upsert_type_change`  | [[REQ-001]]                 |
| `test_reqif_roundtrip`           | [[REQ-005]]                 |
| `test_reqif_store_integration`   | [[REQ-005]]                 |
| `test_diff_identical_stores`     | [[REQ-001]]                 |
| `test_diff_added_artifact`       | [[REQ-001]]                 |
| `test_diff_removed_artifact`     | [[REQ-001]]                 |
| `test_diff_modified_artifact`    | [[REQ-001]]                 |
| `test_diff_diagnostic_changes`   | [[REQ-004]]                 |

### 5.1 Dogfood Validation

The `test_dogfood_validate` test loads Rivet's own `rivet.yaml`, schemas, and
artifacts, then runs the full validation pipeline. This test must pass with
zero errors. It verifies that Rivet can validate itself -- the most direct
form of dogfooding.

### 5.2 STPA Roundtrip Tests

File: `rivet-core/tests/stpa_roundtrip.rs`

| Test                              | Verifies      |
|-----------------------------------|---------------|
| `test_stpa_schema_loads`         | [[REQ-002]]   |
| `test_store_insert_and_lookup`   | [[REQ-001]]   |
| `test_duplicate_id_rejected`     | [[REQ-001]]   |
| `test_broken_link_detected`      | [[REQ-004]]   |
| `test_validation_catches_unknown_type` | [[REQ-004]], [[REQ-010]] |

These tests verify STPA-specific schema loading and validation: that all
STPA artifact types and link types are present after schema load, that basic
store operations work, and that broken links and unknown types are detected.

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

## 9. Requirement-to-Test Mapping Summary

| Requirement   | Unit | Integration | Property | Total |
|---------------|------|-------------|----------|-------|
| [[REQ-001]]   | 14   | 7           | 3        | 24    |
| [[REQ-002]]   | 0    | 1           | 0        | 1     |
| [[REQ-003]]   | 0    | 2           | 0        | 2     |
| [[REQ-004]]   | 5    | 5           | 2        | 12    |
| [[REQ-005]]   | 3    | 2           | 0        | 5     |
| [[REQ-006]]   | 0    | 0 (gated)   | 0        | 0+    |
| [[REQ-007]]   | 3    | 1           | 0        | 4     |
| [[REQ-009]]   | 9    | 0           | 0        | 9     |
| [[REQ-010]]   | 0    | 2           | 1        | 3     |
| [[REQ-015]]   | 0    | 1           | 0        | 1     |
| [[REQ-016]]   | 0    | 1           | 0        | 1     |

Requirements without direct test coverage ([[REQ-006]], [[REQ-008]],
[[REQ-011]], [[REQ-012]], [[REQ-013]], [[REQ-014]]) are verified through CI
quality gates, feature-gated integration tests, or benchmark KPIs rather than
unit tests.

## 10. Formal Verification (Rocq)

[[REQ-023]] specifies mechanized verification of validation engine properties
using the Rocq (Coq) theorem prover. The proofs live in `proofs/rocq/` and
are compiled via Bazel using `rules_rocq_rust` ([[DD-018]], [[FEAT-040]]).

| File | Theorems | Properties |
|------|----------|------------|
| `Schema.v` | 10 | Satisfiability, monotonicity, termination, broken-link soundness, store consistency, backlink symmetry, V-model reachability |
| `Validation.v` | 6 | Determinism, empty-store cleanliness, broken-link reporting, diagnostic bounds |

Unlike testing, formal verification proves properties for **all** possible
inputs. The Rocq specifications model `Store`, `Schema`, `TraceabilityRule`,
and `Diagnostic` as inductive types and prove that the validation algorithm
satisfies its specification.

Build with: `bazel build //proofs/rocq:rivet_metamodel`
Test with: `bazel test //proofs/rocq:rivet_metamodel_test`
