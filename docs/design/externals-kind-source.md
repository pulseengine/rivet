> **Harvested 2026-08-06** from the stale `feat/import-results-sphinx-needs`
> branch (written 2026-06, base `86bf482`, never merged). Preserved as a
> **historical design note**: its observations were true when written and have
> **not** been re-verified against the current implementation. Read it as
> context and as a proposal, not as current documentation.

# PROPOSAL: `externals.<name>.kind: source` — clone-only mode for non-rivet upstreams

**Status**: design proposal, surface change to rivet-core externals loader
**Originating context**: eclipse-score-fork workspace at
`/Users/r/git/pulseengine/eclipse-score-fork/` declares 58 upstream
eclipse-score repos as `externals:` so `rivet sync` + `rivet.lock`
pin them reproducibly. Eclipse repos are not rivet projects — they
have no `rivet.yaml`. Today this produces 58 WARN lines per
`rivet validate` ("external project at ... has no rivet.yaml").
**Estimated effort**: ~30 lines in `rivet-core/src/externals.rs` + doc
note + 1 unit test

## Today's behaviour (live-tested in eclipse-score-fork commit `5ba605e`)

```yaml
externals:
  eclipse-score-score:
    git: https://github.com/eclipse-score/score
    ref: 0b8257991935...
    prefix: score
  # ... 57 more entries
```

```
$ rivet sync
  Synced eclipse-score-score → ./.rivet/repos/score
  ... (×58)
58 externals synced.

$ rivet validate
[WARN  rivet] could not load externals: IO error: external project at
              ./.rivet/repos/score has no rivet.yaml — expected config
              at ./.rivet/repos/score/rivet.yaml
... (×58)
warning: could not load externals for cross-repo validation: ...
... (×58 warnings, no errors)

No issues found.

Result: PASS (2507 warnings)
```

Validation PASSes but every run prints ~58 noisy warnings. The
underlying intent — "I want rivet to pin and sync these repos, but
they aren't rivet projects, don't try to load them" — has no clean way
to express itself.

## Proposed addition

A new optional field `kind:` on each external, two values:

```yaml
externals:
  spar:
    git: https://github.com/pulseengine/spar.git
    ref: 84a7363
    prefix: spar
    # kind: rivet   (default, current behaviour: load rivet artifacts)

  eclipse-score-score:
    git: https://github.com/eclipse-score/score
    ref: 0b8257991935...
    prefix: score
    kind: source    # NEW: clone-only, don't try to load rivet artifacts
```

| `kind:` | sync clones | tries to load rivet artifacts | cross-link `prefix:ID` resolves | useful for |
|---|---|---|---|---|
| `rivet` (default) | ✓ | ✓ | ✓ | Today's behaviour. Cross-repo rivet-aware dependencies (spar, meld, etc.) |
| `source` (new) | ✓ | ✗ | ✗ (no artifacts to resolve to) | Pinned non-rivet sources: sphinx-needs projects, DOORS exports, raw RST/markdown trees, plain code repos that a converter reads |

`kind: source` keeps every other field (git, ref, prefix, path)
working unchanged. The semantic is "this entry is a pinned git
checkout that some other tool will consume — rivet's job is to clone
and pin, not to validate."

## Why this is the right granularity

- **Not a global flag** — a project can mix-and-match. `pulseengine/rivet`
  itself depends on `spar` (rivet-aware, want validation) and could
  someday depend on a non-rivet source repo (raw text, qualified-by-checksum).
  Per-external opt-in covers both.
- **Not a separate top-level block** (`source-externals:`) — the
  conceptual relationship is identical (pinned git ref under rivet's
  cache), only the loader behaviour differs. Mixing them in one block
  with a kind field keeps `rivet sync` semantics uniform.
- **Not inferred from "rivet.yaml absent"** — silent inference is the
  failure mode the current behaviour falls into. Explicit `kind:` is
  honest about intent and fails loudly if eclipse-score ever DOES ship
  a rivet.yaml at the same path (then `kind: source` keeps ignoring it,
  per the author's intent, vs. surprise mode-change).

## What changes in code

The `rivet-core` externals loader has one branch that today is:

```rust
// pseudo-code, real path: rivet-core/src/externals.rs
let cfg_path = repo_dir.join("rivet.yaml");
if !cfg_path.exists() {
    return Err(Error::Io(format!(
        "external project at {} has no rivet.yaml — expected config at {}",
        repo_dir.display(), cfg_path.display(),
    )));
}
// ... continue loading external project's artifacts
```

Add a guard:

```rust
if external.kind == ExternalKind::Source {
    // `kind: source` — externally-pinned data, no rivet artifacts
    // expected at this path. Sync clones; loading is a no-op.
    return Ok(LoadedExternal::sourceonly(prefix));
}
let cfg_path = repo_dir.join("rivet.yaml");
if !cfg_path.exists() {
    return Err(...);
}
// ...
```

Plus the corresponding `ExternalKind` enum (`Rivet` | `Source`) with
serde default `Rivet`, deserialisation, schema doc.

## Tests

1. Unit: `externals.kind: source` parses, defaults to `Rivet` when
   absent.
2. Integration: an external entry with `kind: source` and no rivet.yaml
   at the target produces zero diagnostics on `rivet validate`.
3. Integration: an external entry with `kind: rivet` (default) and no
   rivet.yaml continues to produce the current "has no rivet.yaml" WARN.
   (Backwards-compatibility floor.)
4. Cross-check: an external with `kind: source` does NOT register a
   cross-link namespace — `prefix:SOME_ID` references resolve to
   `dangling-cross-ref` errors. (Documents the explicit no-cross-link
   semantic.)

## Documentation impact

- `rivet docs cross-repo` — add a third row to the "Two cross-repo
  mechanisms" table (it becomes "Three cross-repo mechanisms"), or
  add a `kind:` axis to the existing table.
- The proposal also slightly weakens the binary-choice framing of
  `externals:` vs `external-anchor` (DD-067 / cross-git-investigation.yaml)
  — `kind: source` is essentially "externals: with the convenience of
  git cloning but the no-artifact semantic of external-anchor". Worth
  noting in DD-067 that `kind: source` is the middle-ground option.

## Where this lands in the wider ecosystem

The eclipse-score-fork at `/Users/r/git/pulseengine/eclipse-score-fork/`
is the first realistic consumer: 58 externals with `kind: source`
turns the cosmetic 58-WARN noise into clean output AND makes the
"rivet eats its own dogfood for cross-repo pinning" story complete.

Any future pulseengine fork that tracks non-rivet upstream sources
(DOORS export drops, a sphinx-needs project, a vendored doc tree, a
git submodule replacement) gets the same clean treatment with one
extra line per external.

## Open questions

1. **Naming.** `kind: source` reads cleanly. Alternatives considered:
   `loader: none`, `mode: clone-only`, `non-rivet: true`. `kind:` matches
   the rivet artifact-type convention (every artifact has a `type:`,
   every external could have a `kind:`).

2. **Future kinds.** Could we add `kind: reqif`, `kind: doors-export`,
   `kind: oslc` that auto-invoke the appropriate adapter? Not in v1 —
   keep `kind:` two-valued until at least one third-kind is concretely
   needed.

3. **`rivet sync --kind source` filter.** Should `rivet sync` grow a
   filter so an integrator can sync just the source externals (the
   non-rivet ones a converter consumes) without touching rivet-kind
   ones (which might be slow to clone)? Probably yes as a follow-up,
   not part of the minimal landing.

4. **Cross-link resolution semantics.** If `kind: source` means no
   cross-links resolve, what does `target: source-prefix:SOMETHING`
   mean? Today it would be `dangling-cross-ref`. The proposal keeps
   that; could alternately auto-warn "cross-link to a kind:source
   external — did you mean to use kind:rivet?" Could be added later
   if the failure mode bites.
