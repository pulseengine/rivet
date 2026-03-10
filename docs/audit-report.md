---
id: AUDIT-001
type: report
title: Rivet Project Quality Audit Report
date: 2026-03-09
status: current
---

# Rivet Project Quality Audit Report

**Date:** 2026-03-09
**Scope:** Source-ref integrity, test coverage, benchmarks, fuzz/mutation testing, traceability

---

## 1. Source-Ref Link Integrity

Audited all `source-ref` and `aadl-file` fields across 85 artifacts.

| Metric | Count |
|--------|-------|
| Total source-refs | 20 |
| Valid | 19 |
| Fixed this audit | 1 |
| Implemented artifacts missing source-ref | 1 |

**Fixed:** DD-002 referenced `rivet-core/src/graph.rs:1` (file renamed to `links.rs`).
Corrected to `rivet-core/src/links.rs:1`.

**Missing:** ARCH-DASH-GRAPH ("Graph Visualizer — etch") has no `source-ref`. This is
an external dependency so no local source-ref applies.

All other 19 source-refs resolve to existing files at correct line numbers.

---

## 2. Test Coverage

### 2.1 Test Inventory

| Level | Tests | Framework |
|-------|-------|-----------|
| Unit tests | 61 | `#[test]` in-module |
| Integration tests | 77 | `rivet-core/tests/`, `rivet-cli/tests/` |
| Property-based | 6 | proptest (50 cases local, 1000 in CI) |
| Serve lint | 4 | Source-code structural invariants |
| Live server | 3 | HTTP integration with TcpStream |
| **Total** | **~151** | |

### 2.2 Module Coverage Map

| Module | Unit | Integration | Proptest | Benchmark |
|--------|:----:|:-----------:|:--------:|:---------:|
| schema.rs | — | 5 tests | 1 | 1 group |
| store.rs | — | 4 tests | 2 | 3 groups |
| links.rs | — | 2 tests | 1 | 1 group |
| validate.rs | — | 3 tests | 1 | 1 group |
| matrix.rs | — | 2 tests | — | 1 group |
| diff.rs | 5 | 4 tests | — | — |
| document.rs | 12 | 1 test | — | — |
| query.rs | — | 1 test | — | — |
| results.rs | 9 | — | — | — |
| reqif.rs | 3 | 2 tests | — | — |
| oslc.rs | 27 | 19 tests | — | — |
| coverage.rs | 4 | — | — | — |
| wasm_runtime.rs | 7 | — | — | — |
| adapter.rs | — | 3 tests | — | — |
| formats/* | — | 3 tests | — | — |
| serve.rs | — | 3+4 tests | — | — |
| CLI commands | — | 14 tests | — | — |

### 2.3 Coverage Tooling

- **Tool:** cargo-llvm-cov (LLVM source instrumentation, nightly)
- **CI gate:** 40% minimum line coverage (`--fail-under-lines 40`)
- **Codecov targets:** 60% project, 70% patch
- **Output:** LCOV + HTML report

### 2.4 Gaps

Modules with no unit tests (covered only by integration):
- `schema.rs`, `store.rs`, `links.rs`, `validate.rs`, `matrix.rs`, `query.rs`
- **Mitigated** by extensive integration + proptest coverage

---

## 3. Performance Benchmarks

### 3.1 Inventory

| Group | Scales | Cases |
|-------|--------|-------|
| store_insert | 100/1K/10K | 3 |
| store_lookup | 100/1K/10K | 3 |
| store_by_type | 100/1K/10K | 3 |
| schema_load_and_merge | single | 1 |
| link_graph_build | 100/1K/10K | 3 |
| validate | 100/1K/10K | 3 |
| traceability_matrix | 100/1K/10K | 3 |
| **Total** | | **19** |

### 3.2 KPI Targets

| Operation | 10K artifacts | Target |
|-----------|---------------|--------|
| Store insert | 10,000 | < 10ms |
| Store lookup | 10,000 | < 5ms |
| Link graph build | 10,000 | < 50ms |
| Validation | 10,000 | < 100ms |
| Matrix computation | 10,000 | < 50ms |

### 3.3 CI Integration

- **Workflow:** `.github/workflows/benchmarks.yml`
- **Trigger:** Every push to main and every PR
- **Regression detection:** github-action-benchmark at 120% alert threshold
- **Results:** GitHub Pages historical tracking, PR comment on regression

### 3.4 Gaps

Modules without benchmarks (12 of 21):
- **High priority:** diff, query, adapter (import operations)
- **Medium:** reqif, document, coverage
- **Low:** wasm_runtime, oslc, results, formats/*

---

## 4. Fuzz Testing

**Status: NOT IMPLEMENTED**

- No `fuzz/` directory or `fuzz_target!` macros
- No cargo-fuzz, libfuzzer, or AFL configuration
- No sanitizer configurations (ASAN/TSAN/UBSAN)

### Recommended Fuzz Targets

| Target | Rationale |
|--------|-----------|
| YAML artifact parsing | Untrusted input from user files |
| ReqIF XML import | Complex XML with spec-types/relations |
| Schema merge | Multiple schema files combined |
| Link graph construction | Arbitrary link topologies |
| Document frontmatter parsing | User-authored markdown |

---

## 5. Mutation Testing

**Status: NOT IMPLEMENTED**

- No cargo-mutants configuration or CI job
- No mutants.toml

### What We Have Instead

| Tool | Purpose |
|------|---------|
| Miri | Undefined behavior detection (`-Zmiri-strict-provenance`) |
| Proptest | Property-based invariant testing (6 generators, 1000 cases in CI) |
| Clippy -D warnings | Static analysis gate |
| cargo-audit + cargo-deny | Security + license checks |
| cargo-vet | Supply chain verification |

---

## 6. Traceability Audit

### 6.1 Artifact Summary

| Type | Count | Linked | Verified |
|------|-------|--------|----------|
| Requirements | 16 | 16/16 (100%) | — |
| Design Decisions | 10 | 10/10 (100%) | — |
| Features | 28 | 28/28 (100%) | 23/28 (82%) |
| Architecture | 21 | 21/21 (100%) | — |
| Tests | 10 | 10/10 (100%) | — |
| **Total** | **85** | **85/85** | |

### 6.2 Link Integrity

- **Broken links:** 0
- **Orphan artifacts:** 0
- **Total links:** ~70+
- All link targets resolve to existing artifacts

### 6.3 V-Model Chain Coverage

**Complete chains (REQ → DD → FEAT → TEST):** 4/16 requirements (25%)
- REQ-001, REQ-002, REQ-004, REQ-007

**Partial chains:** 12/16 requirements
- Mostly missing DD or TEST for draft/phase-3 features
- Toolchain requirements (REQ-011/12/13) don't map to features by design

### 6.4 Unverified Features (5)

| Feature | Reason |
|---------|--------|
| FEAT-011 | OSLC sync — draft, phase-3 |
| FEAT-012 | WASM runtime — draft, phase-3 |
| FEAT-018+ | Phase-2/3 roadmap items |

---

## 7. CI Quality Gates Summary

| Gate | Tool | Status |
|------|------|--------|
| Format | cargo fmt | Active |
| Lint | clippy -D warnings | Active |
| YAML lint | yamllint | Active |
| Tests | cargo nextest (JUnit XML) | Active |
| Coverage | llvm-cov (40% threshold) | Active |
| Miri | -Zmiri-strict-provenance | Active |
| Proptest | 1000 cases per property | Active |
| Security audit | cargo-audit (RustSec) | Active |
| License/bans | cargo-deny | Active |
| Supply chain | cargo-vet | Active |
| MSRV | 1.89 | Active |
| Benchmarks | Criterion + regression alerts | Active |
| Fuzz testing | — | **Missing** |
| Mutation testing | — | **Missing** |
| Sanitizers | — | **Missing** |

---

## 8. Recommendations

### High Priority

1. **Add fuzz targets** for YAML parsing, ReqIF import, schema merge, and
   document frontmatter. These are untrusted-input boundaries.

2. **Add cargo-mutants CI job** to measure test effectiveness. Start with
   rivet-core modules that have the most logic: validate, links, schema.

3. **Add benchmarks for diff and query** — these are user-facing operations
   that could regress on large artifact sets.

### Medium Priority

4. **Fix remaining source-ref gap**: ARCH-DASH-GRAPH has no source-ref
   (external dependency, document the exception).

5. **Add unit tests** for schema.rs, store.rs, links.rs where integration
   tests don't cover edge cases.

6. **Raise coverage gate** from 40% to 60% as test suite matures.

### Low Priority

7. **Add sanitizer CI job** (ASAN) for memory safety verification alongside
   Miri.

8. **Extend Miri** to integration tests (currently lib-only).

9. **Add benchmarks for reqif and adapter** import operations once those
   modules stabilize.

---

## 9. Quality Score

| Dimension | Score | Notes |
|-----------|-------|-------|
| Source-ref integrity | 95% | 1 fixed, 1 N/A (external) |
| Test coverage breadth | 85% | All modules tested, some only via integration |
| Benchmark coverage | 55% | 5/12 benchmarkable modules covered |
| Fuzz testing | 0% | Not implemented |
| Mutation testing | 0% | Not implemented |
| Traceability | 95% | 0 broken links, 0 orphans, 82% feature verification |
| CI gates | 80% | 12/15 gates active |
| **Overall** | **73%** | Strong foundation, missing fuzz + mutation |
