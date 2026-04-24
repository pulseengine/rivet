# Mythos-Style Slop Hunt — Rivet Reality Audit

A four-prompt pipeline adapted from the Anthropic Mythos red-team template
(red.anthropic.com, April 2026). Sigil uses it to hunt security bugs; we
use it to hunt **slop** — code that claims to use a good technique but
doesn't really, homegrown reimplementations with no justification, modules
with no callers, features advertised in comments that no test exercises.

The architecture is the same as Mythos: let the agent reason freely, but
require a machine-checkable oracle for every reported finding so
hallucinations don't ship as follow-up work.

## What counts as "slop"

One of:
- Module or function that can be stubbed (`unimplemented!()` / `#[cfg(never)]`)
  and every test + `rivet validate` + Playwright run still passes — i.e.
  the code is unexercised.
- Parser / format adapter that duplicates another one in the tree, where
  the two are not cross-validated and one is the lazy shortcut.
- Abstraction whose comments promise extensibility (WASM adapters,
  plugin traits, "user-supplied X") but no test exercises the full
  promised contract.
- Code path with no commit trailer (`Implements:` / `Refs:` / `Fixes:` /
  `Verifies:`) and no artifact that references it by path — i.e. the code
  drifted from the spec or was never traced to one.

## Prerequisites

- A Claude Code session in the rivet repo (Opus 4.x recommended for the
  discover pass — it has to reason about Rust semantics).
- `cargo`, `rg`, `jq`, and a working Playwright install for the
  excision oracle. See §3 for the exact commands.
- Git history with trailer conventions already enforced (rivet has this —
  see `CLAUDE.md` "Commit Traceability").

## 1. Four prompt templates in `scripts/mythos/`

- **`rank.md`** — agent ranks every rivet-core/rivet-cli source file 1–5
  by slop likelihood. The rubric is the non-portable part (§2).
- **`discover.md`** — Mythos-style discovery prompt plus the v2
  **excision-primary / trace-interpretive** oracle (§3).
- **`validate.md`** — fresh-agent validator that re-runs excision and
  trace and filters uninteresting findings.
- **`emit.md`** — converts a confirmed finding into a draft
  `design-decision` artifact ready to append to `artifacts/decisions.yaml`.

## 2. Ranking rubric (non-portable — see `rank.md`)

5 tiers, named by concrete path patterns, not abstract categories:

```
5 (parser sprawl — highest slop risk): every parse_* entry point and format adapter
4 (aspirational abstraction): traits/engines with "pluggable" claims
3 (large single-purpose module): 1000+ LOC files doing one domain's work
2 (supporting, plausibly load-bearing): validation, db, coverage
1 (config / model / error types): structural, hard to slop
```

Straddle rule: if a file sits between two tiers, pick the higher. Run
the rank pass once, then **patch the rubric** if any file required an
override. A good rubric produces zero overrides on re-run.

## 3. Oracle design (v2 — excision primary, trace interpretive)

The v1 design ("two independent failing oracles") produced false
rejections during the first audit round: a file with 80% exercised
code + 20% aspirational dead methods passed the file-level trace and
falsely cleared the 20%. Specifically, `rivet-core/src/wasm_runtime.rs`
contains three `#[allow(dead_code)]` methods with zero callers plus a
`call_analyze` with none — yet the file-level trace passed via
unrelated later commits. v2 fixes this.

**Primary oracle — Excision (ground-truth reachability).**
The agent submits a patch stubbing the target symbol with
`unimplemented!("slop-hunt excision: path::SYMBOL")`. The excised tree
must still satisfy:

```
cargo build --workspace --all-targets
cargo test --workspace --no-fail-fast
cargo clippy --workspace --all-targets -- -D warnings
cargo run --bin rivet --quiet -- validate   # must match baseline
cargo run --bin rivet --quiet -- commits    # must match baseline
# Playwright only if {{file}} is a frontend surface (see §6)
( cd tests/playwright && npx playwright test )
```

`clippy`, `validate`, and `commits` may all be non-zero on pristine
main due to pre-existing lint / schema noise. The rule is:
- `build` / `test` must exit 0.
- `clippy` / `validate` / `commits` must **match baseline** (recorded
  on a pristine checkout before applying the patch). Any NEW error
  line introduced by excision ⇒ symbol is exercised ⇒ finding
  rejected. Pre-existing lint noise in unrelated files is not
  evidence against the finding.

If excision passes, slop is **confirmed** — whether to delete, test,
or document it depends on the interpretive oracle below.

**Interpretive oracle — Symbol-scoped trace (classifies slop kind).**
Trace is *not* a veto. It answers: was the excised symbol ever specced
or committed with intent, or did it appear in code without a spec?

Use `git log -L` at **symbol granularity** — NOT file granularity —
because v1's file-level trailer check gave credit to unrelated refactor
commits that happened to touch the file:

```
# (a) commits that touched THIS SYMBOL with a trailer
git log -L ':{{SYMBOL}}:{{file}}' --format="%H %s" 2>/dev/null |
  awk '/^[0-9a-f]{40} / {print $1}' | sort -u |
  while read sha; do
    git log -1 --format="%B" "$sha" |
      grep -qE "^(Implements|Refs|Fixes|Verifies): " && echo "$sha traced"
  done

# (b) artifacts that reference this symbol specifically
cargo run --bin rivet --quiet -- list --format json |
  jq -r --arg p "{{file}}" --arg s "{{SYMBOL}}" '
    .[] | select(
      (.description // "" | (contains($p) and contains($s))) or
      (.fields["source-ref"] // "" | (contains($p) and contains($s)))
    ) | .id'
```

Classification:
- Excision passes AND trace EMPTY → `CLASS: orphan-slop`.
  `OUTCOME: delete`. Nobody specced it; nobody calls it.
- Excision passes AND trace NON-EMPTY → `CLASS: aspirational-slop`.
  `OUTCOME: add-test` (if the spec is current) or
  `document-as-non-goal` (if the spec has drifted).
- Excision fails → finding REJECTED. Symbol is exercised.

`discover.md` requires a passing excision as the confirmation signal.
"If you cannot produce a passing excision, do not report.
Hallucinations are more expensive than silence." — load-bearing
sentence, do not soften.

## 4. Run the pipeline

From a Claude Code session in `/Users/r/git/pulseengine/rivet`:

1. `Read scripts/mythos/rank.md` → JSON ranking of rivet-core + rivet-cli
   sources. Save to `.rivet/mythos/ranking.json`.
2. For each rank-≥4 file: new session (parallel), paste `discover.md`
   with `{{file}}` substituted. Output = structured finding report.
3. For each finding: **fresh session** with `validate.md`. The
   validator re-runs excision and trace and enforces the v2 oracle
   semantics. Reject anything that doesn't reconfirm — the discovery
   agent is motivated to defend its own hypothesis; the validator is
   not.
4. For each confirmed: `emit.md` produces a `draft` `design-decision`
   entry. Human promotes to `approved` after deciding delete vs. unify
   vs. add-test.

One agent per file in step 2 is Mythos's parallelism trick. Do not run
one agent across the whole codebase — it converges on surface issues.

## 5. Per-finding outcomes

A confirmed finding is a decision point, not an auto-delete signal. The
emitted `design-decision` proposes one of:

- **Delete** — excision passes, no trace, no plan to exercise it.
- **Unify** — the code is real but duplicates another implementation;
  propose merging.
- **Test** — the code is real but untraced/unexercised; propose adding
  tests and a `Refs: FEAT-NNN` / `Implements: REQ-NNN` trail.
- **Document the gap** — the technique is aspirational (e.g. WASM
  adapters) and we accept the gap for now; emit a requirement that
  tracks it.

The point of the pipeline is **not** to delete code aggressively. The
point is to force each questionable module through a decision, so slop
becomes either justified (a linked REQ + test) or excised.

## 6. Gotchas

- **Playwright gate.** Playwright runs only when `{{file}}` is part of
  the frontend/HTML/VSIX/serve surface. Concretely, run Playwright iff
  the path matches any of:
    - `rivet-cli/src/web.rs`
    - `rivet-cli/src/serve*.rs` / anything under a `serve/` module
    - `rivet-cli/src/docs.rs` and anything producing HTML output
    - `rivet-cli/templates/**`
    - `vscode-rivet/**`
  Otherwise write `playwright: skipped (backend-only)` into the oracle
  output. Never silently omit.
- **Feature-gated code misfires oracle A.** A file under `#[cfg(feature = "x")]`
  that's not built by default will pass excision trivially. The validator
  must run excision with the feature enabled — see `validate.md`.
- **`rivet list` indexing lag.** If you just added an artifact that
  references a file, the db cache may be stale. Re-run `rivet list` with
  `--no-cache` if the trace query surprises you.
- **Validators must be fresh sessions.** Reusing discovery context lets
  the agent defend its own hypothesis.

## 7. Emission target

Findings emit as `design-decision` artifacts in
`artifacts/decisions.yaml`, with `status: draft` and `tags: [audit,
slop-hunt]`. We do not add a new artifact type — reusing
`design-decision` means no schema change and no new validation rules.
See `emit.md` for the exact template.

The `rationale` field must quote the oracle output verbatim. Without
that, the artifact itself becomes slop.
