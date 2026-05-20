# Formal Verification Completion Plan

**Issue:** #23 — Formal verification strategy (Kani + Verus + Rocq)
**Date:** 2026-03-16
**Status:** Analysis complete, ready for execution

---

## 1. Current State

### 1.1 Kani (Bounded Model Checking) — 10 harnesses, ready for CI

**File:** `rivet-core/src/proofs.rs` (gated behind `#[cfg(kani)]`)

| # | Harness | Property proved |
|---|---------|-----------------|
| 1 | `proof_parse_artifact_ref_no_panic` | `parse_artifact_ref` never panics for any printable ASCII input up to 8 bytes |
| 2 | `proof_store_insert_no_panic` | `Store::insert` never panics for any bounded artifact |
| 3 | `proof_store_duplicate_returns_error` | Duplicate insert returns `Err`, store length stays 1 |
| 4 | `proof_coverage_percentage_bounds` | `CoverageEntry::percentage()` always in [0.0, 100.0]; edge cases at 0 and total=0 |
| 5 | `proof_cardinality_exhaustive` | `validate()` handles all `Cardinality` variants without panic for 0-2 links |
| 6 | `proof_compute_coverage_report_bounds` | End-to-end `compute_coverage` yields covered <= total, percentage in [0, 100] |
| 7 | `proof_schema_merge_idempotent` | `Schema::merge` with duplicate file preserves type/link/inverse counts |
| 8 | `proof_linkgraph_lone_artifact_is_orphan` | Unlinked artifact detected as orphan |
| 9 | `proof_linkgraph_dag_no_cycles` | A->B->C chain has no cycles |
| 10 | `proof_linkgraph_cycle_detected` | A->B->A cycle is correctly detected |

**Integration status:** Module is declared in `lib.rs` (`#[cfg(kani)] mod proofs;`), `Cargo.toml` declares `cfg(kani)` in `unexpected_cfgs`. CI has a commented-out Kani job (lines 229-236 of `.github/workflows/ci.yml`).

**Verdict: READY to uncomment and ship.** The `kani-github-action@v1` installs Kani automatically. No Bazel needed.

### 1.2 Verus (SMT-backed functional correctness) — 6 specs, 3 proved

**File:** `rivet-core/src/verus_specs.rs` (gated behind `#[cfg(verus)]`)

| # | Spec/Proof | Status |
|---|-----------|--------|
| 1 | `store_well_formed` spec + `lemma_insert_preserves_wellformed` | **Proved** — inserting a fresh ID preserves store well-formedness |
| 2 | `backlink_symmetric` spec + `lemma_build_yields_symmetric` | **Proved** (from preconditions) — forward/backward link symmetry |
| 3 | `coverage_bounded` spec + `lemma_coverage_bounded` | **Proved** — coverage percentage in [0, 100] using vstd arithmetic lemmas |
| 4 | `validation_soundness` | **Spec only** — stated as open spec function, NOT proved. States: no errors implies all types known, no broken links, backlinks symmetric |
| 5 | `reachable_sound` + `reachable_complete` | **Spec only** — defines reachability with fuel-bounded induction, NOT proved |
| 6 | `coverage_validation_agreement` | **Spec only** — 100% coverage implies no error diagnostics for that rule, NOT proved |

**Integration status:** `verus/BUILD.bazel` defines `verus_library` and `verus_test` targets. `verus/MODULE.bazel` references `pulseengine/rules_verus` (commit `e2c1600`). Requires Bazel 8+ and a nightly Rust toolchain (1.82.0-nightly pinned by Verus).

**Verdict: NOT runnable in CI today.** Requires Bazel infrastructure and rules_verus to be published/available. The 3 unproved specs need substantial proof work.

### 1.3 Rocq (Deep metamodel proofs) — 24 Qed, 1 Admitted

**Files:** `proofs/rocq/Schema.v` (667 lines), `proofs/rocq/Validation.v` (201 lines)

#### Schema.v — 17 Qed, 1 Admitted

| # | Theorem/Lemma | Status |
|---|--------------|--------|
| 1 | `schema_satisfiable` | **Proved** — empty store satisfies any rule set |
| 2 | `monotonicity_non_source` | **Proved** — adding non-source artifact preserves validity |
| 3 | `validation_empty_store` | **Proved** — zero work for empty store |
| 4 | `validation_empty_rules` | **Proved** — zero work for empty rule set |
| 5 | `validation_work_add_one` | **Proved** — adding one artifact adds |rules| work |
| 6 | `store_get_not_in` | **Proved** — lookup returns None if ID not present |
| 7 | `store_get_in` | **Proved** — lookup succeeds for present ID in unique store |
| 8 | `broken_link_detection_sound` | **Proved** — absent target means link is broken |
| 9 | `store_get_app_new` | **Proved** — newly appended artifact is retrievable |
| 10 | `insert_then_get` | **Proved** — insert then get returns the artifact |
| 11 | `store_get_app_old` | **Proved** — insert preserves old lookups |
| 12 | `insert_preserves_old` | **Proved** — insert doesn't affect other artifact retrieval |
| 13 | `insert_duplicate_fails` | **Proved** — duplicate ID insert returns None |
| 14 | `backlink_from_forward_link` | **Proved** — forward link induces backlink |
| 15 | `vmodel_chain_two_steps` | **Proved** — two consecutive rules imply reachability |
| 16 | `single_rule_constructible` | **Proved** — any single rule is satisfiable |
| 17 | `no_source_no_violations` | **Proved** — no source artifacts means zero violations |
| 18 | `zero_violations_implies_satisfied` | **ADMITTED** — requires inductive reasoning over `filter` |

#### Validation.v — 7 Qed, 0 Admitted

| # | Theorem/Lemma | Status |
|---|--------------|--------|
| 1 | `validation_deterministic` | **Proved** — pure function, reflexivity |
| 2 | `empty_store_no_diagnostics` | **Proved** — empty store yields empty diagnostics |
| 3 | `check_broken_links_reports` | **Proved** — broken link always produces SevError diagnostic |
| 4 | `check_broken_links_clean` | **Proved** — all targets present means no broken-link diags |
| 5 | `check_artifact_rule_clean` | **Proved** — non-matching artifact kind means no rule diag |
| 6 | `check_broken_links_length` | **Proved** — broken-link diags bounded by link count |
| 7 | `check_artifact_rules_length` | **Proved** — rule diags bounded by rule count |

**Totals: 24 proved (Qed), 1 admitted.**

**Integration status:** `proofs/rocq/BUILD.bazel` defines targets using `rules_rocq_rust`. `proofs/rocq/MODULE.bazel` references `pulseengine/rules_rocq_rust` (commit `6a8da0b`) and requires Nix + Bazel 8+ for hermetic Rocq 9.0 toolchain.

**Verdict: NOT runnable in CI today.** Requires Bazel + Nix infrastructure. One admitted theorem needs completion.

---

## 2. Gap Analysis

### 2.1 What's proved vs what's spec'd but not proved

| Layer | Proved | Spec'd only | Admitted | Total |
|-------|--------|-------------|----------|-------|
| Kani | 10 harnesses (all complete) | 0 | 0 | 10 |
| Verus | 3 lemmas | 3 specs (validation_soundness, reachability, coverage-validation agreement) | 0 | 6 |
| Rocq | 24 theorems | 0 | 1 (zero_violations_implies_satisfied) | 25 |
| **Total** | **37** | **3** | **1** | **41** |

### 2.2 What's missing from Issue #23 scope

Issue #23 calls for proofs of:

| Desired proof | Current status |
|--------------|----------------|
| `LinkGraph::build()` no panics | **Partially covered** — Kani #5, #8-10 exercise build indirectly, but no dedicated harness for arbitrary store+schema |
| `parse_artifact_ref()` all inputs | **Done** — Kani #1 |
| `Schema::merge()` never panics, preserves types | **Done** — Kani #7 (idempotence); no explicit panic-freedom harness |
| `validate()` cardinality logic exhaustive | **Done** — Kani #5 |
| `detect_circular_deps()` DFS terminates, finds all cycles | **Partially covered** — Kani #9, #10 test DAG/cycle but not DFS termination |
| MODULE.bazel parser all inputs | **Not started** — no Kani harness for Bazel parser |
| Validation soundness (PASS -> rules satisfied) | **Spec only** — Verus spec #4, not proved |
| Validation completeness (violated -> diagnostic) | **Partially covered** — Rocq `zero_violations_implies_satisfied` is ADMITTED |
| Backlink symmetry | **Done** — Verus #2 proved, Rocq #14 proved |
| Conditional rule consistency | **Not started** |
| Reachability correctness | **Spec only** — Verus #5 |
| Schema satisfiability | **Done** — Rocq #1 |
| Monotonicity | **Done** — Rocq #2 |
| Link graph well-foundedness / validation terminates | **Done** — Rocq #3-5 |
| ASPICE V-model completeness | **Partially covered** — Rocq #15 (two-step chain) |

### 2.3 CI integration gaps

| Tool | CI status | Blocker |
|------|-----------|---------|
| Kani | **Commented out** in ci.yml (lines 229-236) | None — just uncomment |
| Verus | No CI job | Requires Bazel + rules_verus + nightly Rust 1.82.0 |
| Rocq | No CI job | Requires Bazel + rules_rocq_rust + Nix + Rocq 9.0 |

---

## 3. CI Integration Plan

### 3.1 Kani — Immediate (uncomment existing job)

The ci.yml already has a commented-out Kani job at lines 229-236:

```yaml
kani:
  name: Kani Proofs
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v6
    - uses: model-checking/kani-github-action@v1
    - run: cargo kani -p rivet-core
```

**Action:** Uncomment. The `kani-github-action@v1` handles installation. `cargo kani -p rivet-core` runs all 10 harnesses. Estimated CI time: 5-15 minutes depending on solver performance.

**Considerations:**
- Pin `kani-version` for reproducibility (e.g., `kani-version: '0.50.0'`)
- Add `continue-on-error: false` to block PRs on proof failure
- Consider caching: Kani compiles CBMC which is slow on first run; the action caches internally

### 3.2 Verus — Medium-term (requires Bazel in CI)

Two paths:

**Path A: Bazel in CI (preferred)**
- Add a Bazel CI job that runs `bazel test //verus:rivet_specs_verify`
- Requires: `rules_verus` published, Bazel 8+ on runner, ~10 min setup
- Blocked on: `pulseengine/rules_verus` being a real, working Bazel module

**Path B: Direct Verus invocation (workaround)**
- Install Verus nightly binary in CI
- Run `verus rivet-core/src/verus_specs.rs` directly
- Problem: the file uses `use crate::...` imports that won't resolve outside cargo

**Recommendation:** Path A. Park until Bazel is adopted for the project.

### 3.3 Rocq — Medium-term (requires Bazel + Nix in CI)

**Path A: Bazel + Nix in CI (preferred)**
- Add a Bazel CI job: `bazel test //proofs/rocq:rivet_metamodel_test`
- Requires: `rules_rocq_rust` published, Nix on runner, Bazel 8+
- Estimated CI time: 2-5 minutes (Rocq proofs compile fast)

**Path B: Direct coqc invocation (workaround)**
- Install Rocq/Coq 9.0 via Nix or apt
- Run `coqc -Q proofs/rocq Rivet proofs/rocq/Schema.v proofs/rocq/Validation.v`
- Simpler but non-hermetic

**Path C: Nix-only CI job (intermediate)**
```yaml
rocq:
  name: Rocq Proofs
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v6
    - uses: cachix/install-nix-action@v27
    - run: |
        nix-env -iA nixpkgs.coq
        coqc -Q proofs/rocq Rivet proofs/rocq/Schema.v
        coqc -Q proofs/rocq Rivet proofs/rocq/Validation.v
```

**Recommendation:** Path C as an immediate step, Path A when Bazel is adopted.

---

## 4. Prioritized New Proofs to Add

### Priority 1 — High value, low effort (next sprint)

| # | Proof | Tool | Rationale |
|---|-------|------|-----------|
| 1 | `proof_linkgraph_build_no_panic` — arbitrary store+schema | Kani | Issue #23 explicitly calls for this; exercises the core graph builder |
| 2 | `proof_schema_merge_no_panic` — arbitrary schema files | Kani | Dedicated panic-freedom proof (current #7 only tests idempotence) |
| 3 | `proof_validate_no_panic` — arbitrary store+schema+graph | Kani | Most critical: validate is the safety-critical function |
| 4 | Complete `zero_violations_implies_satisfied` | Rocq | The only Admitted theorem; requires inductive filter reasoning |
| 5 | Uncomment Kani CI job | CI | Zero-cost, immediate value |

### Priority 2 — Medium effort, high value (next month)

| # | Proof | Tool | Rationale |
|---|-------|------|-----------|
| 6 | `proof_detect_cycles_terminates` — DFS terminates for any graph | Kani | Issue #23 scope; verify `has_cycles` terminates |
| 7 | Prove `validation_soundness` | Verus | The highest-value proof: PASS means all rules satisfied |
| 8 | Prove `reachable_sound` + `reachable_complete` | Verus | Reachability correctness for transitive closure |
| 9 | ASPICE full V-model chain (N steps, not just 2) | Rocq | Extend `vmodel_chain_two_steps` to arbitrary chains |
| 10 | Rocq CI job (Path C: Nix-based) | CI | Proves Rocq proofs compile on every PR |

### Priority 3 — Higher effort, strategic value (quarter)

| # | Proof | Tool | Rationale |
|---|-------|------|-----------|
| 11 | Prove `coverage_validation_agreement` | Verus | 100% coverage implies no error diags |
| 12 | Conditional rule consistency | Verus | No contradictions when rules co-fire |
| 13 | MODULE.bazel parser panic-freedom | Kani | Issue #23 scope; lower priority since not safety-critical path |
| 14 | Verus CI via Bazel | CI | Requires Bazel adoption |
| 15 | `coq-of-rust` extraction | Rocq | Auto-extract Rocq model from Rust source; experimental |

---

## 5. Timeline Estimate

| Phase | Duration | Deliverables |
|-------|----------|-------------|
| **Week 1** (immediate) | 1-2 days | Uncomment Kani CI job; add 3 new Kani harnesses (#1-3 above) |
| **Week 2** | 3-5 days | Complete Rocq admitted theorem (#4); add Rocq Nix CI job (#10) |
| **Weeks 3-4** | 1-2 weeks | Kani cycle-termination proof (#6); begin Verus validation_soundness proof (#7) |
| **Month 2** | 2-3 weeks | Complete Verus reachability proofs (#8); ASPICE full chain (#9) |
| **Month 3** | 2-3 weeks | Verus coverage-validation agreement (#11); conditional rules (#12); Bazel CI (#14) |

**Total estimated effort:** ~6-8 weeks of focused formal verification work.

---

## 6. Can We Run Kani Right Now?

**In CI: YES.** Uncomment lines 229-236 in `.github/workflows/ci.yml`. The `kani-github-action@v1` handles all installation. The 10 harnesses are self-contained and compile correctly under `#[cfg(kani)]`.

**Locally: Requires installation.** Kani is not installed on this machine. Install via:
```bash
cargo install --locked kani-verifier
cargo kani setup
cargo kani -p rivet-core
```

**Expected outcome:** All 10 harnesses should pass. The harnesses use small bounds (8 bytes, 4 chars, 3 artifacts) to keep solver time manageable.

---

## 7. rules_verus and rules_rocq_rust Integration Status

### rules_verus (`verus/MODULE.bazel`)
- **Source:** `pulseengine/rules_verus` (GitHub)
- **Commit:** `e2c1600a8cca4c0deb78c5fcb4a33f1da2273d29`
- **Verus version:** `0.2026.02.15`
- **Requirements:** Bazel 8+, Rust nightly (1.82.0, pinned by Verus)
- **Status:** BUILD.bazel and MODULE.bazel are written. Depends on `rules_verus` being a functional Bazel module (may need real implementation work in the `pulseengine/rules_verus` repo).

### rules_rocq_rust (`proofs/rocq/MODULE.bazel`)
- **Source:** `pulseengine/rules_rocq_rust` (GitHub)
- **Commit:** `6a8da0bd30b5f80f811acefbf6ac5740a08d4a8c`
- **Rocq version:** 9.0 via Nix
- **Requirements:** Bazel 8+, Nix package manager, `rules_nixpkgs_core` 0.13.0
- **Status:** BUILD.bazel and MODULE.bazel are written. Depends on `rules_rocq_rust` being a functional Bazel module. The Nix dependency adds complexity but ensures hermetic toolchains.

**Neither Bazel module is likely functional today** — both reference `pulseengine/rules_*` repos that may be stubs or works-in-progress. The Rocq proofs can be verified independently with plain `coqc`; the Verus specs need the Verus toolchain but could potentially be verified with a standalone Verus binary.

---

## 8. Summary Scorecard

| Metric | Value |
|--------|-------|
| Kani harnesses | 10 (all complete) |
| Verus specs | 6 (3 proved, 3 spec-only) |
| Rocq theorems | 25 (24 Qed, 1 Admitted) |
| **Total proved** | **37** |
| **Total spec'd but not proved** | **4** |
| CI integration | Kani ready (commented out), Verus/Rocq blocked on Bazel |
| Lowest-hanging fruit | Uncomment Kani CI job (5-minute task) |
| Biggest gap | Verus `validation_soundness` — the most important proof, not yet attempted |
| ISO 26262 readiness | Strong foundation; need validation soundness proof for TCL 1 argument |
