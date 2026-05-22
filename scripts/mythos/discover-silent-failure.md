Please find a piece of **silent-failure slop** in this program.

This is a variant of the Mythos slop hunt (see `HOWTO.md`). The standard
`discover.md` hunts *reachability* slop — code that can be excised
because nothing exercises it. This prompt hunts a different class,
surfaced by the 2026-05-19 cross-git investigation (FEAT-135): code that
**reports success over an input it should have rejected**.

## What silent-failure slop is

A code path where a degraded input — malformed, duplicate, ambiguous,
truncated, missing, or out-of-range — produces a SUCCESS result
(`PASS`, exit 0, an empty `diagnostics` array, a silently-dropped
record) instead of surfacing the problem. The Cederqvist cliff: the
tool reports textual success over a semantically-failed operation.

The cross-git investigation found six instances in the validate / load /
supplier subsystems and they shipped as REQ-062..REQ-076:
- `rivet validate` reported `PASS` over artifact files that failed to
  parse (the skip was a stderr `log::warn!`, uncounted) — REQ-062.
- two artifacts with the same `id` collapsed via `Store::upsert`
  last-write-wins, no diagnostic — REQ-075.
- orphan artifacts (no links) were invisible to `rivet validate` —
  REQ-076.
- `rivet supplier pull` silently overwrote the cache on sha256 drift —
  REQ-068.
- `rivet init --preset <safety-standard>` produced an unvalidatable
  project, exit 0 — REQ-063.

Those subsystems are now fixed. **Hunt elsewhere.** Your job: find the
NEXT one, in `{{file}}`.

## The tell-tale code patterns (priors, not proof)

Rank a path as a silent-failure candidate when you see:
- an error or `Result::Err` discarded — `let _ = ...`, `.ok()`,
  `unwrap_or_default()`, `unwrap_or(...)`, `if let Ok(..)` with no
  `else`, `.map_err(|e| log::warn!(...))` then drop;
- a loop that `continue`s past a bad element without recording it;
- a `match` with `_ => {}` / `_ => Ok(())` on a validation or parse arm;
- "update-or-insert" / last-write-wins on a keyed collection with no
  collision check (`upsert`, `insert` over an existing key, `HashMap`
  overwrite);
- a count or status computed from a *post-degradation* view (e.g.
  counting survivors after a silent drop, so the count looks clean);
- a `--format json` field that omits a problem the text path mentions
  only on stderr, or vice versa.

A prior is not a finding. Leniency is sometimes correct (genuinely
optional fields, documented best-effort paths). You must construct the
degraded input and *show* the wrong silence.

## Oracle — the degraded-input oracle

Slop is **confirmed** when you can exhibit all three:

1. **A degraded input.** Construct a concrete, minimal input that a
   careful tool should reject or flag — and write down, in one
   sentence, the invariant it violates (a stated rule in
   `docs/`, a schema constraint, "two things claim one ID", "the
   bytes changed", "the file did not parse"). If you cannot name the
   violated invariant, it is not slop — stop.

2. **A success result over it.** Run the relevant `rivet` command (or
   call the function in a throwaway test) on the degraded input and
   show it returns success: exit 0, `result: PASS`, an empty / clean
   `diagnostics`, or a silently-mutated-but-unreported state. Paste the
   verbatim output.

3. **The contrast.** Show what a correct tool would do — name the
   diagnostic `rule` it should emit, or the non-zero exit it should
   give. If `rivet` already has a sibling check that DOES catch an
   analogous degradation (e.g. `cited-source-drift` catches file
   drift), cite it as the precedent the gap should match.

If you cannot produce all three, do not report. Hallucinated
silent-failure findings are more expensive than silence.

## Procedure

1. Read `{{file}}`. Identify every spot where it ingests, parses,
   counts, merges, or checks something — those are the candidate
   surfaces. Note the tell-tale patterns above.

2. For the strongest candidate, design the degraded input. Prefer the
   smallest possible: one malformed field, one duplicate key, one
   out-of-range value, one truncated record.

3. Exhibit the success result. Two ways, pick whichever is sound:
   - **End-to-end**: build a temp project / input file and run the
     real `rivet` subcommand. Best evidence.
   - **Unit-level**: a throwaway `#[test]` calling the function
     directly with the degraded input, asserting the (wrong) success.
   Build with `--target-dir /tmp/mythos-sf-build` to dodge the
   environment's default-target flakiness.

4. Confirm the silence is *wrong*, not *intended*. Search `docs/`,
   the schema, and `artifacts/` for a stated invariant the degraded
   input violates. If the leniency is documented as intentional,
   the finding is `no-slop (intended leniency)` — report that
   truthfully.

5. Classify the fix size — this drives the release decision:
   - `SMALL` — a localized fix: add a diagnostic, change a `_ => {}`
     to an error arm, count what was dropped. (→ patch-release
     material.)
   - `LARGE` — needs a new flag, a new diagnostic rule wired through
     multiple layers, an architectural change, or it interacts with
     other subsystems. (→ minor-release material.)

## Output format

- `TARGET_FILE:` {{file}}
- `SURFACE:` the function / code path that ingests or checks
- `CLASS:` silent-failure-slop | no-slop (intended leniency) |
  no-slop (already-diagnosed)
- `VIOLATED_INVARIANT:` one sentence — what rule the degraded input breaks
- `DEGRADED_INPUT:` fenced block — the exact malformed input
- `SUCCESS_RESULT:` fenced block — verbatim output showing the wrong PASS
- `CORRECT_BEHAVIOUR:` what should happen — the diagnostic `rule` or
  non-zero exit; cite a sibling check if one exists
- `VERDICT:` slop-confirmed | no-slop
- `FIX_SIZE:` SMALL | LARGE — with one sentence of why
- `PROPOSED_FIX:` 2-4 sentences — the concrete change
- `NOTES:` anything unexpected, especially a second silent-failure in
  a neighbouring file you noticed while constructing the input
