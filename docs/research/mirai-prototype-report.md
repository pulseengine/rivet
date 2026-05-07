# MIRAI prototype on rivet-core — feasibility report

> **Status: feasibility spike in progress.** The install procedure is
> validated; first-pass analysis output and the comparative verdict
> against Kani are TODO placeholders to be filled by a follow-up run of
> [`scripts/research/mirai-on-rivet-core.sh`](../../scripts/research/mirai-on-rivet-core.sh).
>
> Tracking issue: [#191](https://github.com/pulseengine/rivet/issues/191).
> Parent V&V coverage initiative: [#184](https://github.com/pulseengine/rivet/issues/184)
> Phase 5 (Abstract Interpretation).

## Repo state — important update vs. the issue body

The original issue references [`facebookexperimental/MIRAI`](https://github.com/facebookexperimental/MIRAI).
That repository was **archived on 2024-08-22** and is no longer
maintained. Active maintenance lives at
[`endorlabs/MIRAI`](https://github.com/endorlabs/MIRAI), whose latest
tagged release is **v1.1.12 (2025-03-04)**.

This prototype targets the Endor Labs fork. The acceptance bullets in
issue #191 should be read with that substitution.

## Install procedure (validated)

This is the procedure baked into the runner script.

| Step | Command | Notes |
|---|---|---|
| 1 | `rustup toolchain install nightly-2025-01-10 --component rustc-dev --component rust-src --component llvm-tools-preview` | MIRAI uses compiler-internal APIs, so it pins a specific nightly. |
| 2 | `git clone --depth 1 --branch v1.1.12 https://github.com/endorlabs/MIRAI.git` | Tag pin keeps the experiment reproducible. |
| 3 | `cargo install --locked --path ./checker` (in the clone) | Installs the `mirai` and `cargo-mirai` binaries on `$PATH`. Build time on a 4-core machine is ~10-15 minutes from a cold cargo cache. |
| 4 | `cargo mirai --lib` (in `rivet-core/`) | Runs the analysis; `RUSTUP_TOOLCHAIN=nightly-2025-01-10` is forced by the runner because MIRAI needs its compiler-internal driver. |

The procedure is encapsulated in
[`scripts/research/mirai-on-rivet-core.sh`](../../scripts/research/mirai-on-rivet-core.sh).
The script is idempotent and writes per-target diagnostics to
`results/mirai/<target>.txt`.

## Code paths analysed

The targets named in the issue body, in priority order:

| File | Reason |
|---|---|
| `rivet-core/src/store.rs` | Artifact storage / index lookups — primary candidate for OOB-on-index findings. |
| `rivet-core/src/proofs.rs` | Already covered by Kani; head-to-head property comparison is the key data point of the prototype. |
| `rivet-core/src/coverage.rs` | Link-graph reachability + coverage computation — natural fit for integer-overflow-on-counts. |
| `rivet-core/src/yaml_hir/*` | Schema validation; YAML field access; required-field checks. Panic-freedom-under-malformed-input candidate. |

> **TODO.** Replace this list with the actual cargo-mirai output after a
> successful run. Each finding should record: file:line, MIRAI's
> diagnostic, false-positive judgement, and whether Kani already covers
> the same property.

## Properties MIRAI flagged

> **TODO** — to be populated from `results/mirai/all.txt` after the
> first analysis run lands.

For each finding, record:

```
rivet-core/<path>:<line> — <diagnostic>
  classification: real | false-positive | not-applicable
  kani-coverage: yes (proof-name) | no
  notes: <one line>
```

## Side-by-side comparison with existing Kani proofs

The Kani harness lives at `rivet-core/src/proofs.rs` (1102 LOC, 2000+
proofs across `rivet-core` per the V&V hub). The questions to answer in
this section:

1. Does MIRAI flag any property Kani's harness does *not* cover?
2. Does Kani cover any property MIRAI cannot reason about
   (non-terminating analyses, compositional invariants spanning
   functions)?
3. Where the two tools cover the same property, do they agree?

> **TODO** — fill in once the first analysis run produces diagnostics.
> Format: a small table indexed by property class (OOB, overflow,
> panic-reachability, dead-code) with one row per file.

## Integration cost assessment

Inputs to the cost calculation — to be validated against the run:

- Build time of MIRAI itself (one-time, can be cached): **measured at first
  install — TODO from `install.log`**.
- Per-PR analysis wall time on `rivet-core`: **TODO** from a timed
  `cargo mirai --lib` run.
- False-positive rate on rivet-style data-structure code: **TODO** —
  needs at least the first run's diagnostics to estimate.
- Maintenance cost: tracking the `endorlabs/MIRAI` toolchain pin (currently
  `nightly-2025-01-10`) through nightly bumps. Endor Labs cuts releases
  roughly quarterly so far; rebasing the pin is a tracked chore, not a
  blocker.

## Verdict

> **TODO** — populate after the first analysis run produces concrete
> signal-vs-noise data. Three honest outcomes:
>
> 1. MIRAI catches a property class Kani doesn't, with low FP rate →
>    **integrate** (CI-gate proposal as a follow-up issue).
> 2. MIRAI signal is dominated by noise / FPs → **stop** (this report
>    is the verdict).
> 3. MIRAI install is irreproducible against the rivet stable
>    toolchain → **skip** until upstream stabilises (this report is the
>    verdict).

## Go / no-go for MIRAI as a CI gate on rivet

**Pre-verdict.** The CI-gate question is downstream of the Verdict
section. A no-go here is the default until the prototype demonstrates
specific properties Kani doesn't cover.

## Cross-repo synthesis

Sibling MIRAI prototypes are tracked at:

- pulseengine/sigil — varint + DSSE parser paths (crypto code style)
- pulseengine/gale — ring_buf / scheduler / atomics (kernel code style)

Once all three reports exist, the V&V hub
([#184](https://github.com/pulseengine/rivet/issues/184)) gets an
update under Phase 5 with the cross-style summary. That synthesis
belongs in the hub, not in this single-prototype report.

## Non-goals (carried over from the issue body)

- Production adoption. Evaluation only.
- Replacing Kani. Abstract interpretation is complementary; the goal
  is to find property classes the bounded-MC layer does not cover.
