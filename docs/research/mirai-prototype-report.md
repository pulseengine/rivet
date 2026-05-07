# MIRAI prototype on rivet-core — feasibility report

> **Status: feasibility spike — verdict reached (negative).**
>
> MIRAI v1.1.12's pinned toolchain (`nightly-2025-01-10`, rustc 1.86.0-nightly)
> cannot build today's rivet-core. Two independent blockers:
>   1. `rivet-core` declares `rust-version = 1.89`; cargo refuses without
>      `--ignore-rust-version`.
>   2. With that flag, the rivet dependency graph (specifically
>      `spar-annex` via the `spar` external) uses **`let_chains`**, which
>      is stable on rust ≥ 1.88 (June 2025) but is still gated as
>      `#![feature(let_chains)]` in the January-2025 nightly MIRAI pins.
>
> Concrete artefacts in [`results/mirai/`](../../results/mirai/) capture
> the install log, the MSRV refusal, and the let-chains compile error.
>
> **Recommendation: hold the prototype** until MIRAI bumps its nightly
> past `let_chains` stabilization (rustc ≥ 1.88, ≥ 2025-04 nightly). At
> that point the runner script in this PR is a one-shot resumption.
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

**No analysis output was produced** — `cargo mirai --lib` aborts before
emitting any MIR-level diagnostics (see "Verdict"). The intended targets,
preserved for the resumption run, are:

| File | Reason |
|---|---|
| `rivet-core/src/store.rs` | Artifact storage / index lookups — primary candidate for OOB-on-index findings. |
| `rivet-core/src/proofs.rs` | Already covered by Kani; head-to-head property comparison is the key data point of the prototype. |
| `rivet-core/src/coverage.rs` | Link-graph reachability + coverage computation — natural fit for integer-overflow-on-counts. |
| `rivet-core/src/yaml_hir/*` | Schema validation; YAML field access; required-field checks. Panic-freedom-under-malformed-input candidate. |

## Properties MIRAI flagged

None. The compile abort is upstream of MIR generation, so MIRAI's
abstract interpreter never runs.

## Side-by-side comparison with existing Kani proofs

Not produced this run — the gating step (build under MIRAI's pinned
nightly) did not succeed. The comparison plan stays valid for the
resumption run:

The Kani harness lives at `rivet-core/src/proofs.rs` (1102 LOC, 2000+
proofs across `rivet-core` per the V&V hub). The questions to answer in
the resumption run:

1. Does MIRAI flag any property Kani's harness does *not* cover?
2. Does Kani cover any property MIRAI cannot reason about
   (non-terminating analyses, compositional invariants spanning
   functions)?
3. Where the two tools cover the same property, do they agree?

## Integration cost assessment

What this run measured (committed under [`results/mirai/`](../../results/mirai/)):

- **MIRAI checker compile time**: 17m 40s on a 4-core / 15 GiB-RAM
  sandbox, release profile, cold cargo cache (see
  `results/mirai/install-summary.txt`).
- **`librustc_driver` linkage quirk**: the installed `mirai` /
  `cargo-mirai` binaries fail with
  `error while loading shared libraries: librustc_driver-….so` unless
  `LD_LIBRARY_PATH` is set to MIRAI's pinned toolchain `lib/` directory.
  The runner script handles this; ad-hoc invocations need the env var
  too. Worth a one-line note in any future onboarding doc.
- **Toolchain incompatibility**: see Verdict.

What this run did *not* measure (gated on a successful build):

- Per-PR analysis wall time on `rivet-core`.
- False-positive rate on rivet-style data-structure code.
- Maintenance cost beyond the toolchain-bump cadence.

## Verdict

**Outcome 3 from the framing**: MIRAI's pinned toolchain is
irreproducible against today's rivet stable toolchain. The prototype is
**held** until the upstream pin moves past `let_chains` stabilization.

Two independent blockers, captured in
[`results/mirai/`](../../results/mirai/):

### Blocker 1 — MSRV refusal

`results/mirai/run-msrv.txt`:

```
error: rustc 1.86.0-nightly is not supported by the following packages:
  rivet-core@0.8.0 requires rustc 1.89
  smol_str@0.3.6 requires rustc 1.89
```

`cargo` refuses to build because `rivet-core/Cargo.toml` declares
`rust-version = "1.89"` and the MIRAI-pinned nightly is rustc 1.86.0
(2025-01-09). Bypassing this with `--ignore-rust-version` exposes
Blocker 2.

### Blocker 2 — `let_chains` not stable in the pinned nightly

`results/mirai/run-let-chains.txt` (excerpt from a 918-line build log):

```
error[E0658]: `let` expressions in this position are unstable
   --> /root/.cargo/git/checkouts/spar-…/crates/spar-annex/src/ba/grammar.rs:918:12
    |
918 |     ) && let Some(cm) = lhs
    |          ^^^^^^^^^^^^^^^^^^
    = note: see issue #53667 <https://github.com/rust-lang/rust/issues/53667> for more information
    = help: add `#![feature(let_chains)]` to the crate attributes to enable
    = note: this compiler was built on 2025-01-09; consider upgrading it if it is out of date
```

`let_chains` (RFC 2497 / tracking issue #53667) was stabilized in stable
Rust around mid-2025 (rust ≥ 1.88). The `spar-annex` crate (pulled in
via the `spar` external; rivet's own source is also on rust 2024 edition
with `let_chains` use) relies on the stable form. The MIRAI-pinned
nightly predates the stabilization, so even with
`--ignore-rust-version` the dependency graph fails to compile.

### Why this blocks the spike, not just rivet-core

This is **not** a problem unique to rivet — any sufficiently-modern
crate depending on `let_chains` will hit the same wall. The fix lives
upstream:

- `endorlabs/MIRAI` would need to bump its `rust-toolchain.toml`
  channel past `nightly-2025-04-XX` (whichever first carries the
  stabilized `let_chains`).
- A v1.1.13+ release on the new pin makes the rivet prototype
  immediately resumable via the runner script in this PR.

Tracking the upstream pin bump as a follow-up rather than vendoring an
older spar-annex into rivet keeps the experiment honest — the goal is
to evaluate MIRAI against rivet's actual code, not against a stripped
fixture.

## Go / no-go for MIRAI as a CI gate on rivet

**No-go (current).** The blocker is upstream-toolchain-pin churn, not
rivet code. A CI gate that pins MIRAI v1.1.12 + nightly-2025-01-10
cannot run today; revisiting becomes worthwhile once Endor Labs ships
a release on a `let_chains`-stable nightly.

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
