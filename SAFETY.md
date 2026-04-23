# Safety posture

This file documents how `rivet` implements recommendations from the
[Safety-Critical Rust Consortium (SCRC)](https://github.com/rustsec)
coding guidelines. Reviewers evaluating the codebase for use in
safety-critical product lines should start here.

## Summary

| Area | Status | Reference |
|------|--------|-----------|
| Restriction lints (unwrap/panic/indexing/arithmetic/casts) | enforced at `warn` workspace-wide with file-scope SAFETY-REVIEW allows | DD-058, DD-059 |
| Unsafe-block hygiene lints | enforced; zero violations | DD-063 |
| Memory-safety trap lints (`mem_forget`, `transmute_undefined_repr`, `uninit_assumed_init`, `mem_replace_with_uninit`) | enforced; zero violations | DD-063 |
| Supply chain | `cargo-audit`, `cargo-deny`, `cargo-vet` in CI | see `.github/workflows/ci.yml` |
| Miri UB detection | enabled in CI for library tests | see `miri` job |
| Property testing | `proptest` on parser + solver | `rivet-core/tests/proptest_*.rs` |
| Fuzzing | `cargo-fuzz` campaigns in CI | see `fuzz` job |
| Mutation testing | `cargo-mutants` in CI | see `mutants` job |
| Formal verification (bounded) | Kani BMC harnesses | `rivet-core/src/proofs.rs` |
| Formal verification (proof obligations) | Verus specs (partial coverage) | `#[cfg(verus)]` modules |
| External axiomatisation | Rocq proofs for type invariants | `verification/rocq/` |
| Differential testing | golden regression suite against reference parser | `rivet-core/tests/yaml_test_suite.rs` |

## Lint set

Two tiers are enforced at `warn` across the workspace (see
`Cargo.toml` `[workspace.lints.clippy]`):

### Phase 1 — core restriction family (DD-059)

The classic footgun set. Most production files have **file-scope**
`#![allow(…)]` with a `SAFETY-REVIEW (SCRC Phase 1, DD-058)` rationale
comment that grandfathers pre-existing call sites. CI enforces
`cargo clippy --all-targets --workspace -- -D warnings` so any new
violation blocks the PR.

- Panic-adjacent: `unwrap_used`, `expect_used`, `panic`, `todo`, `unimplemented`
- Indexing & arithmetic: `indexing_slicing`, `arithmetic_side_effects`
- Lossy conversion: `as_conversions`, `cast_possible_truncation`, `cast_sign_loss`
- Match discipline: `wildcard_enum_match_arm`, `match_wildcard_for_single_variants`
- I/O discipline: `print_stdout`, `print_stderr`, `dbg_macro`

### Phase 2 opening — unsafe-block hygiene & memory-safety (DD-063)

Zero violations in the current tree; these lints catch *future* regressions.

- Unsafe-block review: `undocumented_unsafe_blocks`, `multiple_unsafe_ops_per_block`
- Leaks & UB: `mem_forget`, `mem_replace_with_uninit`, `transmute_undefined_repr`, `uninit_assumed_init`
- Concurrency traps: `rc_mutex`, `mutex_atomic`
- Clarity: `same_name_method`, `lossy_float_literal`, `empty_drop`
- Control flow: `exit` (grandfathered on three CLI exit-code sites in `rivet-cli`)

## Phase 2 migration plan

File-scope blanket allows from Phase 1 are a **migration aid**, not a
safety claim. Each is expected to move to one of two end states:

1. **Rewrite to non-lint form** — e.g. `indexing_slicing` site becomes
   `.get(i).ok_or(Error::…)?`, `unwrap_used` becomes `?` with a typed
   error, `arithmetic_side_effects` becomes `checked_add`/`saturating_add`
   where wraparound is a real risk.
2. **Per-site `#[allow(...)]`** with an inline `SAFETY-REVIEW:` comment
   giving the specific reason the lint is acceptable at that call.

First file migrated as the reference pattern: `rivet-core/src/matrix.rs`
(see git history on this file). Two per-site allows with inline
rationale; the file-scope blanket was removed.

## Tests as safety harness

Every predicate in the s-expression filter evaluator has three tests
(positive / negative / edge) in `sexpr_predicate_matrix.rs`. The
feature-model solver has property-based tests in
`proptest_feature_model.rs` checking: solver never panics, resolved
variants satisfy group constraints, propagation only adds features.

`rivet-core/tests/sexpr_fuzz.rs` runs four invariants on random inputs:
parser never panics, lowering never panics, parse/lower/eval is
deterministic, and `expr → sexpr → parse → lower` roundtrips are
equivalent.

## Reporting a safety issue

If you believe you've found a memory-safety, soundness, or panic-from-
user-input issue, please follow the instructions in `SECURITY.md`
(to be added) or file a private security advisory on the GitHub
repository.
