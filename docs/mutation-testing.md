# Mutation testing with cargo-mutants

This document captures rivet's mutation-testing pattern so other
pulseengine repos can adopt it consistently. It is the canonical
reference for the [`templates/cargo-mutants`](../templates/cargo-mutants/)
template files.

## Why mutation testing

Mutation testing measures **test-suite adequacy**: it perturbs the
code under test and counts how many perturbations the suite catches.
A test suite that achieves high line/branch coverage but kills few
mutants is a suite full of assertions that don't actually constrain
behaviour.

Mutation score is recognised under:

- **IEC 61508 Annex C.5.12** — table C.13 lists "mutation analysis"
  as a recommended technique for verifying test-case completeness.
- **ISO 26262-6 Table 13** — recommended for ASIL C/D unit-test
  coverage assessment.
- **EN 50128** and **DO-178C** treat mutation analysis as
  acceptable evidence of structural-coverage robustness.

For Rust specifically, mutation score is the most credible answer to
the open MC/DC-for-Rust problem: Rust has no production MC/DC tooling,
and mutation analysis fills the same evidentiary slot.

## When to run

| Stage | Cost | Recommendation |
|---|---|---|
| Pre-commit | Too slow (minutes per file) | Skip |
| Pre-push (smoke) | 1–5 min on one crate | Optional; rivet does this |
| CI nightly | 30–90 min per crate | Required for ASIL ≥ B / DAL ≥ C |
| Pre-release | Hours, full workspace | Required for ASIL D / DAL A |

The nightly CI gate is the load-bearing one — it is the only level at
which a meaningful mutation score is computed and recorded. The
pre-push smoke is just a sanity check that mutation testing still
runs at all.

## Score targets per safety level

These are PulseEngine internal targets. They are stricter than any
single standard requires because we apply mutation-score as the
primary structural-coverage gate for Rust.

| Safety level | Mutation-score floor | Rationale |
|---|---|---|
| QM / DAL E | no requirement | Mutation testing optional |
| ASIL A / DAL D | ≥ 0.70 | Catch obvious assertion gaps |
| ASIL B / DAL C | ≥ 0.80 | Match IEC 61508 SIL 2 expectations |
| ASIL C / DAL B | ≥ 0.85 | |
| ASIL D / DAL A | ≥ 0.90 | Closes the MC/DC-for-Rust gap |

Record the target on the relevant `test-spec` artifact via
`mutation-score-target` and the measured value on each `test-exec` via
`mutation-score`. `rivet validate` will (in a future change tracked
under #188) compare measured vs. target and surface drift.

## Recording results in rivet

The schema fields land in `schemas/score.yaml`:

```yaml
- id: TEST-SPEC-007
  type: test-spec
  title: rivet-core unit tests
  fields:
    safety-level: ASIL_C
    mutation-score-target: 0.85

- id: TEST-EXEC-2026-04-27
  type: test-exec
  fields:
    version: v0.5.0
    commit: 92ad95d
    timestamp: 2026-04-27T02:00:00Z
    mutation-score: 0.872
    mutants-tested: 481
    mutants-killed: 419
    mutants-missed: 49
    mutants-timeout: 8
    mutants-unviable: 5
  links:
    - type: belongs-to
      target: TEST-SPEC-007
```

`mutants-tested = mutants-killed + mutants-missed + mutants-timeout
+ mutants-unviable`. cargo-mutants treats `timeout` as caught and
`unviable` (didn't compile) as excluded, so:

```
mutation-score = (killed + timeout) / (tested - unviable)
```

## Marking unreachable mutants

Some mutants are unreachable by construction (defensive `assert!` on
type-system invariants, debug-only `tracing::debug!` calls that have
no observable effect, etc.). Skipping them is fine if you can justify
the rationale — record the rationale alongside the skip so an
auditor can read both together.

### Per-call skip via `mutants.toml`

For pattern-wide skips (e.g., all `tracing::debug!` calls), use the
`skip_calls` array in `mutants.toml`. The template ships with
`tracing::trace` and `tracing::debug` excluded by default.

### Per-function skip via attribute

For ad-hoc skips on a specific function, add an attribute and a
comment justifying it:

```rust
// cargo-mutants: defensive bounds check; mutating the comparison
// would corrupt unrelated proofs that rely on this invariant.
#[cfg_attr(test, mutants::skip)]
fn assert_index_in_bounds(i: usize, len: usize) {
    assert!(i < len);
}
```

The cfg_attr scoping keeps the attribute out of release builds.

## Adopting in another pulseengine repo

1. Copy the template files:
   ```sh
   cp rivet/templates/cargo-mutants/mutants.toml .
   cp rivet/templates/cargo-mutants/mutants.yml .github/workflows/
   ```
2. Edit `.github/workflows/mutants.yml` — replace the `matrix.crate`
   list with your crates.
3. Edit `mutants.toml` — tighten `exclude_globs` and `skip_calls` for
   crate-specific noise.
4. Add (or update) a `test-spec` artifact that names the suite under
   test and sets `mutation-score-target` per the table above.
5. After the first nightly run, file `test-exec` artifacts to record
   measured scores. Automate this in your CI workflow.

## Open questions / non-goals

- **Cross-repo aggregation** is tracked separately in
  [#188](https://github.com/pulseengine/rivet/issues/188). The schema
  fields above are designed to feed that dashboard; rendering belongs
  to the coverage-matrix initiative.
- **Mutation testing of proof code** (Verus, Rocq, Lean) is out of
  scope. The proofs verify, by definition, the property they
  state — there is no "test suite" to mutate against them.
- **Differential mutation** (testing mutants against a delta rather
  than a full suite) is not yet templated; cargo-mutants supports it
  via `--in-diff` but our nightly schedule runs full suites today.
