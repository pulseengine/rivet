# Coverage Gap Analysis: STPA, Commits, and Test Traceability

**Date:** 2026-03-16
**Scope:** Rivet v0.2.0 — comprehensive gap analysis across commit traceability,
test coverage, STPA completeness, and lifecycle traceability.

---

## Executive Summary

| Metric | Current | Target | Gap |
|--------|---------|--------|-----|
| Commit coverage | 11.1% (10/90) | 50%+ | 80 artifacts uncovered |
| Test traceability markers | 0 source markers | 31 REQ markers | No `// rivet: verifies` annotations exist |
| STPA loss scenarios | 19 scenarios | ~27 needed | 8 UCAs lack loss scenarios (UCA-C-10 through UCA-C-17) |
| Lifecycle coverage gaps | 44 artifacts | 0 | Missing downstream links on approved artifacts |
| Validation warnings | 2 | 0 | FEAT-050/051 use `phase-4` (not in allowed values) |
| Schema coverage rules | 100% (all 10 rules) | 100% | Link-level coverage is complete |

---

## Part 1: Commit Coverage Gap

### Current State

`rivet commits` reports **11.1% artifact coverage** (10/90 traceable artifacts).

- **Linked commits:** 1
- **Orphan commits:** 23 (no artifact trailers)
- **Exempt commits:** 13
- **Broken refs:** 0

### Artifacts Without Commit Coverage (80 total)

#### Requirements (12 uncovered out of 31)

| ID | Title | Status | Notes |
|----|-------|--------|-------|
| REQ-020 | Cross-repository artifact linking | draft | Phase 3 — not yet implemented |
| REQ-021 | Distributed baselining | draft | Phase 3 |
| REQ-022 | Single-binary WASM asset embedding | draft | Phase 3 |
| REQ-023 | Conditional validation rules | draft | Phase 3 |
| REQ-024 | Change impact analysis | draft | Phase 3 |
| REQ-025 | sphinx-needs JSON import | draft | Phase 3 |
| REQ-026 | Test-to-requirement traceability extraction | draft | Phase 3 |
| REQ-027 | Build-system-aware cross-repo discovery | draft | Phase 3 |
| REQ-028 | Diagnostic-quality parsing with lossless syntax trees | draft | Phase 3 |
| REQ-029 | Incremental validation via dependency-tracked computation | draft | Phase 3 |
| REQ-030 | Formal correctness guarantees | draft | Phase 3-4 |
| REQ-031 | Schema-validated artifact mutation from CLI | draft | Phase 3 |

**Analysis:** All 12 uncovered REQs are draft/Phase 3+. The 19 approved REQs
also lack commit coverage because commits predate the trailer system. This is
the biggest gap — retroactively tagging existing commits is not practical.

#### Design Decisions (15 uncovered out of 28)

DD-014 through DD-028 — all Phase 3 decisions with no implementing commits yet.

#### Features (25 uncovered out of 67)

FEAT-033 through FEAT-057 — all draft/Phase 3 features awaiting implementation.

#### STPA Artifacts (28 uncovered)

- H-9, H-10, H-11, H-12 and sub-hazards (8 total) — added in Phase 2.5
- SC-11 through SC-14 (4 total) — added in Phase 2.5
- UCA-C-10 through UCA-C-17 (8 total) — added in Phase 2.5
- CC-C-10 through CC-C-17 (8 total) — added in Phase 2.5

### Path from 11.1% to 50%+

**Strategy 1: Tag future commits (organic growth)**
- Each Phase 3 implementation commit should reference its REQ/FEAT/DD.
- With 8 parallel workstreams, 5-10 tagged commits per workstream would cover
  ~40-80 artifacts, reaching 50%+ within one sprint.

**Strategy 2: Retroactive coverage for approved artifacts**
- The 19 approved REQs and ~30 approved FEATs implemented in Phase 1-2 have
  implementing commits but those commits lack trailers.
- Option A: Create one `chore: retroactive traceability tagging` commit per
  artifact batch (e.g., all Phase 1 REQs) with Implements trailers.
- Option B: Add the implementing commit SHAs to the artifact YAML as a
  `commits` field — but this is not how `rivet commits` works (it scans git log).
- **Recommended:** Accept that Phase 1-2 commits are organically unlinked.
  Focus enforcement on Phase 3+ commits. The `rivet commit-msg-check` hook
  (FEAT-029) will prevent future orphans.

**Strategy 3: Reduce the denominator**
- STPA artifacts (hazards, UCAs, controller-constraints, loss-scenarios) are
  safety analysis — they don't have "implementing commits" in the traditional
  sense. Consider adding them to `trace-exempt-artifacts` in rivet.yaml.
- If 28 STPA artifacts are exempted, the denominator drops from 90 to 62,
  and achieving 50% requires covering ~31 artifacts.

**Projected coverage with Phase 3 discipline:**
- Phase 3 has ~25 FEATs + ~12 REQs + ~15 DDs to implement = ~52 artifacts.
- If each gets 1+ tagged commit: (10 + 52) / 90 = **68.9%**
- With STPA exemptions: (10 + 52) / 62 = **100%**

---

## Part 2: Test Coverage Gap

### Current State

`rivet coverage` reports **100%** on all 10 schema-level coverage rules.
This means every requirement has a feature satisfying it, every hazard has
a constraint, every UCA has a controller constraint, etc.

However, **zero source-level test traceability markers** exist. A grep for
`rivet: verifies` across rivet-core/src/ and rivet-core/tests/ returned
no results.

### Test Files and What They Cover

| Test File | Tests | Effective REQ Coverage |
|-----------|-------|----------------------|
| rivet-core/src/diff.rs | 5 unit tests | REQ-001 (store diffs) |
| rivet-core/src/lifecycle.rs | 4 unit tests | REQ-004 (validation lifecycle) |
| rivet-core/src/document.rs | 8 unit tests | REQ-001, REQ-007 (document system) |
| rivet-core/tests/integration.rs | ~18 integration tests | REQ-001, REQ-003, REQ-004, REQ-007, REQ-010 |
| rivet-core/tests/stpa_roundtrip.rs | ~4 tests | REQ-002 (STPA) |
| rivet-core/tests/proptest_core.rs | 6 proptest properties | REQ-001, REQ-004, REQ-010 |
| rivet-core/tests/oslc_integration.rs | ~2 tests | REQ-006 (OSLC) |
| rivet-core/tests/docs_schema.rs | ~2 tests | REQ-007 (docs) |
| rivet-core/tests/commits_integration.rs | ~4 tests | REQ-017, REQ-018, REQ-019 |
| rivet-core/tests/commits_config.rs | ~3 tests | REQ-017 (config parsing) |
| rivet-core/tests/externals_config.rs | ~3 tests | REQ-020 (cross-repo) |
| rivet-core/tests/mutate_integration.rs | ~8 tests | REQ-031 (mutations) |

### Requirements With Tests But No Markers

These requirements have tests that exercise them, but the tests lack
`// rivet: verifies REQ-XXX` annotations:

- **REQ-001** — Store/model unit tests (diff.rs, document.rs, integration.rs)
- **REQ-002** — STPA roundtrip tests
- **REQ-003** — Integration tests (ASPICE rules)
- **REQ-004** — Link graph tests, proptest, integration
- **REQ-005** — ReqIF integration tests (stub)
- **REQ-007** — Document and CLI integration tests
- **REQ-010** — Schema merge tests, proptest
- **REQ-014** — All TEST-* artifacts verify this
- **REQ-017** — commits_integration.rs, commits_config.rs
- **REQ-018** — commits_integration.rs (commit-msg-check)
- **REQ-019** — commits_integration.rs (orphan detection)
- **REQ-020** — externals_config.rs
- **REQ-031** — mutate_integration.rs

### Requirements Without Any Tests

| REQ | Title | Notes |
|-----|-------|-------|
| REQ-006 | OSLC sync | Only stub test, OSLC not implemented |
| REQ-008 | WASM adapters | No WASM runtime tests |
| REQ-009 | Test results as evidence | TEST-010 covers the model, not the release flow |
| REQ-011 | Rust edition 2024 / MSRV | Checked by CI, not unit tested |
| REQ-012 | CI quality gates | Meta-requirement, verified by CI pipeline |
| REQ-013 | Performance benchmarks | Benchmarks exist but not traced |
| REQ-015 | ASPICE 4.0 schemas | Schema tests exist, no marker |
| REQ-016 | Cybersecurity schema | Schema merge tests cover it |
| REQ-021 through REQ-030 | Phase 3 requirements | Not yet implemented |

### Recommendations

1. **Add `// rivet: verifies REQ-XXX` markers** to existing test functions.
   This requires implementing FEAT-043 (test traceability source scanner) first,
   or manually adding markers now in preparation.

2. **Marker format to adopt** (per FEAT-043 design):
   ```rust
   // rivet: verifies REQ-001
   #[test]
   fn test_store_insert_lookup() { ... }
   ```

3. **Priority order for adding markers:**
   - Phase 1: All integration tests in `tests/integration.rs` (~18 tests)
   - Phase 2: Proptest properties in `tests/proptest_core.rs` (6 tests)
   - Phase 3: Unit tests in `src/diff.rs`, `src/document.rs`, `src/lifecycle.rs`
   - Phase 4: Specialized tests (stpa_roundtrip, commits, externals, mutate)

4. **Estimated coverage after markers:** 13/31 REQs with direct test markers
   (42%). Adding markers to existing tests for REQ-015, REQ-016 would reach
   15/31 (48%).

---

## Part 3: STPA Completeness

### 3.1 Missing Hazards for Recent Features

The following features added in Phase 2/2.5 have **no corresponding STPA hazards**:

#### HTML Export Corruption
The dashboard generates HTML for compliance evidence viewing. If the HTML
export contains corrupted data (XSS in artifact fields rendered as HTML,
broken link graphs, missing artifacts from the export), auditors receive
misleading evidence.

**Proposed hazard:**
- **H-13: Rivet dashboard renders artifact content as unescaped HTML, enabling
  XSS or content injection in compliance evidence**
  - Losses: [L-2, L-3] — compliance evidence corruption and data sovereignty
  - This is particularly relevant because the dashboard renders artifact
    descriptions as HTML and serves as audit evidence (SC-6 applies)

#### config.js Injection
The dashboard serves a dynamically generated `config.js` that bootstraps
client-side behavior (WebSocket URLs, feature flags). If this is injectable,
an attacker could redirect the dashboard to exfiltrate artifact data.

**Proposed hazard:**
- **H-14: Rivet dashboard config.js endpoint is injectable, allowing artifact
  data exfiltration or UI manipulation**
  - Losses: [L-3, L-6] — data sovereignty and audit trail

#### WASM Runtime Panics
The spar WASM rendering module runs in the dashboard to render AADL diagrams.
If the WASM module panics on malformed AADL input, it could crash the browser
tab or produce an incomplete rendering that masks architecture gaps.

**Proposed hazard:**
- **H-15: Rivet WASM renderer panics on malformed AADL input, producing
  incomplete architecture diagrams**
  - Losses: [L-1, L-4] — traceability integrity (missing components in diagram)
    and engineering productivity (crashed browser tab)

### 3.2 System Constraint to Requirement Linkage

All 14 system constraints are linked to hazards (verified by `rivet coverage`).

Cross-referencing SCs to REQs:

| SC | Hazard | Linked to REQ? | Notes |
|----|--------|---------------|-------|
| SC-1 | H-1 | REQ-031 (via links) | Yes |
| SC-2 | H-2 | REQ-031 (via links) | Yes |
| SC-3 | H-3 | No direct REQ link | Should link to REQ-004 |
| SC-4 | H-4 | No direct REQ link | Should link to REQ-005, REQ-006 |
| SC-5 | H-5 | No direct REQ link | Should link to REQ-006 |
| SC-6 | H-6 | No direct REQ link | **Gap** — no REQ for report verification gating |
| SC-7 | H-7 | No direct REQ link | Should link to REQ-017 |
| SC-8 | H-8 | No direct REQ link | Should link to REQ-006 |
| SC-9 | H-4 | No direct REQ link | Should link to REQ-005 |
| SC-10 | H-1, H-3 | No direct REQ link | Should link to REQ-020 |
| SC-11 | H-9 | REQ-029 (via links) | Yes |
| SC-12 | H-10 | REQ-023 (via links) | Yes |
| SC-13 | H-11 | REQ-028 (via links) | Yes |
| SC-14 | H-12 | REQ-030 (via links) | Yes |

**Gap:** SC-3 through SC-10 have no `satisfies` link from any requirement.
The constraints exist but no requirement explicitly commits to satisfying them.

### 3.3 UCA to Hazard Linkage

All 45 UCAs are linked to hazards (100% coverage per `rivet coverage`). No gaps.

### 3.4 Loss Scenarios for UCA-C-10 through UCA-C-17

**Current state:** The loss-scenarios.yaml has 19 scenarios. UCA-C-10 through
UCA-C-17 (the incremental validation and parser UCAs added in Phase 2.5) have
**zero loss scenarios**. This is a significant STPA completeness gap.

**Missing loss scenarios (8 needed):**

| UCA | Description | Proposed Loss Scenario |
|-----|-------------|----------------------|
| UCA-C-10 | Salsa doesn't invalidate on file change | LS-C-5: Developer edits YAML, `rivet validate` returns cached PASS from salsa, new validation error is missed. Developer merges broken traceability. |
| UCA-C-11 | Conditional rules not re-evaluated on field change | LS-C-6: Artifact status changes from draft to approved, conditional rule requiring verification-criteria doesn't fire, approved artifact ships without verification evidence. |
| UCA-C-12 | Contradictory conditional rules applied | LS-C-7: Schema update adds rule A requiring field X when status=approved, existing rule B forbids field X when safety=ASIL_B. Engineers cannot make ASIL_B approved artifacts valid, disable validation entirely. |
| UCA-C-13 | Incremental != full validation results | LS-C-8: After a sequence of edits, incremental validation reports PASS. A colleague runs full validation on the same files and gets 3 errors. Trust in the tool collapses, team abandons automated validation. |
| UCA-C-14 | Conditional rules evaluated before schema loads | LS-C-9: Schema file with 5 conditional rules is loaded after validation begins. Only 2 of 5 rules apply. Safety-critical field requirements from the remaining 3 rules are never checked. |
| UCA-C-15 | Parser misses git_override | LS-C-10: MODULE.bazel pins dependency to a specific commit via git_override, but parser extracts registry version. Cross-repo validation runs against wrong commit, reports coverage for artifacts that don't exist in the pinned version. |
| UCA-C-16 | Parser silently skips unsupported Starlark | LS-C-11: MODULE.bazel uses load() to import a macro that declares 5 dependencies. Parser silently skips load(), missing all 5 repos. Cross-repo validation has blind spots for 5 modules. |
| UCA-C-17 | Parser extracts wrong module name | LS-C-12: Parser bug swaps name= and version= keyword values in bazel_dep(). Cross-repo links resolve against "1.2.3" (the version string used as module name), which doesn't exist, but the error message is confusing. |

### 3.5 HTML Export Controller

The dashboard (`CTRL-DASH`) is currently modeled as a read-only display
controller. However, the HTML it serves is **de facto compliance evidence** —
auditors view the dashboard to verify traceability coverage. SC-6 states:

> "Rivet must generate compliance reports only from verified traceability data."

The dashboard currently has no validation gate — it renders whatever data is
loaded, whether validated or not. This means:

**Proposed controller extension:** Add control actions to CTRL-DASH:
- **CA-DASH-2:** Render compliance-grade HTML pages (coverage matrix, validation
  summary, artifact detail pages used as audit evidence)
- **CA-DASH-3:** Export static HTML snapshots for offline audit review

**Proposed UCAs for export controller:**
- **UCA-D-3:** Dashboard exports compliance HTML without running validation
  first (hazards: H-6, H-3)
- **UCA-D-4:** Dashboard exports HTML containing unescaped artifact content
  that renders as executable JavaScript (hazards: L-3, H-7)
- **UCA-D-5:** Dashboard exports HTML snapshot that omits artifacts from
  partially-loaded sources (hazards: H-2, H-3)

---

## Part 4: Artifact Inventory for v0.2.0

### New STPA Artifacts Needed

#### Hazards (3 new)

| ID | Title | Losses |
|----|-------|--------|
| H-13 | Dashboard renders unescaped HTML content in compliance evidence | L-2, L-3 |
| H-14 | Dashboard config.js endpoint is injectable | L-3, L-6 |
| H-15 | WASM renderer panics on malformed input, producing incomplete diagrams | L-1, L-4 |

#### System Constraints (3 new)

| ID | Title | Hazards |
|----|-------|---------|
| SC-15 | Dashboard must HTML-escape all artifact content before rendering | H-13 |
| SC-16 | Dashboard must sanitize all dynamically generated JavaScript | H-14 |
| SC-17 | WASM renderers must trap panics and return error SVGs, never crash | H-15 |

#### UCAs (3 new for dashboard export)

| ID | Controller | Description | Hazards |
|----|-----------|-------------|---------|
| UCA-D-3 | CTRL-DASH | Dashboard exports compliance HTML without validation gate | H-6, H-3 |
| UCA-D-4 | CTRL-DASH | Dashboard renders unescaped content as executable HTML | H-13 |
| UCA-D-5 | CTRL-DASH | Dashboard exports partial data from incomplete source loading | H-2, H-3 |

#### Controller Constraints (3 new)

| ID | Constraint | UCAs |
|----|-----------|------|
| CC-D-3 | Dashboard must gate compliance-grade pages on successful validation | UCA-D-3 |
| CC-D-4 | Dashboard must HTML-escape all artifact-sourced content | UCA-D-4 |
| CC-D-5 | Dashboard must verify all sources loaded before generating export | UCA-D-5 |

#### Loss Scenarios (8 new for incremental/parser UCAs + 3 for dashboard)

| ID | Title | UCA |
|----|-------|-----|
| LS-C-5 | Salsa cache returns stale validation pass after file edit | UCA-C-10 |
| LS-C-6 | Conditional rule misses status change to approved | UCA-C-11 |
| LS-C-7 | Contradictory rules make ASIL_B approval impossible | UCA-C-12 |
| LS-C-8 | Incremental/full validation divergence erodes tool trust | UCA-C-13 |
| LS-C-9 | Schema loads after validation, missing conditional rules | UCA-C-14 |
| LS-C-10 | Parser misses git_override, validates wrong commit | UCA-C-15 |
| LS-C-11 | Parser silently skips load(), missing 5 dependencies | UCA-C-16 |
| LS-C-12 | Parser swaps keyword args, resolves wrong module | UCA-C-17 |
| LS-D-1 | Dashboard shows green metrics without validation gate | UCA-D-3 |
| LS-D-2 | XSS in artifact description executes in auditor's browser | UCA-D-4 |
| LS-D-3 | HTML export omits STPA artifacts from unmounted source | UCA-D-5 |

### Missing Test Traceability Markers

**Immediate action (no code change needed, just comments):**

Add `// rivet: verifies REQ-XXX` to these test files:

| File | Tests | Markers to Add |
|------|-------|---------------|
| rivet-core/tests/integration.rs | 18 tests | REQ-001, REQ-003, REQ-004, REQ-007, REQ-010 |
| rivet-core/tests/proptest_core.rs | 6 tests | REQ-001, REQ-004, REQ-010 |
| rivet-core/tests/stpa_roundtrip.rs | 4 tests | REQ-002, REQ-004 |
| rivet-core/src/diff.rs | 5 tests | REQ-001 |
| rivet-core/src/document.rs | 8 tests | REQ-001, REQ-007 |
| rivet-core/src/lifecycle.rs | 4 tests | REQ-004 |
| rivet-core/tests/commits_integration.rs | 4 tests | REQ-017, REQ-018, REQ-019 |
| rivet-core/tests/commits_config.rs | 3 tests | REQ-017 |
| rivet-core/tests/externals_config.rs | 3 tests | REQ-020 |
| rivet-core/tests/mutate_integration.rs | 8 tests | REQ-031 |

**Total:** ~63 test functions need markers for ~15 distinct REQs.

### Lifecycle Coverage Gaps to Close

44 approved artifacts are missing downstream links (from `rivet validate`):

**Requirements missing aadl-component allocation (7):**
REQ-012, REQ-013, REQ-014, REQ-015, REQ-016, REQ-017, REQ-018, REQ-019

**Features missing design-decision links (5):**
FEAT-001, FEAT-002, FEAT-009, FEAT-010, FEAT-018

**Features with no downstream artifacts at all (28):**
All TEST-* and many FEAT-* approved artifacts — these are leaf nodes
(test artifacts and features) that by nature have no further downstream.
Consider adding a lifecycle rule exemption for `feature` artifacts with
tags containing `testing` or `swe-*`.

### Validation Warnings to Fix

| Artifact | Issue | Fix |
|----------|-------|-----|
| FEAT-050 | `phase: phase-4` not in allowed values | Add `phase-4` to allowed values in dev.yaml, or change to `future` |
| FEAT-051 | `phase: phase-4` not in allowed values | Same fix |

---

## Priority Action Plan

### Immediate (this sprint)

1. Fix FEAT-050/051 phase value warnings
2. Add 8 loss scenarios for UCA-C-10 through UCA-C-17
3. Add `// rivet: verifies` markers to top 3 test files (~30 tests)
4. Ensure all Phase 3 commits use artifact trailers

### Short-term (next sprint)

5. Add H-13/H-14/H-15 hazards and associated SC/UCA/CC/LS artifacts
6. Add SC-3 through SC-10 `satisfies` links from requirements
7. Add remaining test markers (~33 tests)
8. Consider STPA artifact exemption from commit coverage denominator

### Medium-term (Phase 3)

9. Implement FEAT-043 (test traceability source scanner) to automate marker extraction
10. Implement FEAT-029 (commit-msg-check) to prevent future orphan commits
11. Add missing DD links for FEAT-001, FEAT-002, FEAT-009, FEAT-010, FEAT-018
12. Add lifecycle rule exemptions for leaf-node test features

---

## Artifact Count Summary

| Category | Existing | New Needed | Total After |
|----------|----------|-----------|-------------|
| Losses | 6 | 0 | 6 |
| Hazards | 12 | 3 | 15 |
| Sub-hazards | 10 | 0 | 10 |
| System constraints | 14 | 3 | 17 |
| UCAs | 45 | 3 | 48 |
| Controller constraints | 45 | 3 | 48 |
| Loss scenarios | 19 | 11 | 30 |
| **STPA total** | **151** | **23** | **174** |
| Requirements | 31 | 0 | 31 |
| Design decisions | 28 | 0 | 28 |
| Features | 67 | 0 | 67 |
| AADL components | 21 | 0 | 21 |
| **Grand total** | **328** | **23** | **351** |
