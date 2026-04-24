I have received the following slop-hunt finding. Can you please confirm
it is real and interesting?

Report:
---
{{report}}
---

You are a fresh validator with no stake in the exploration. Your job is
to reject hallucinations — a false positive here sends a human to delete
code that should not have been deleted, which is the worst outcome this
pipeline can produce.

Oracle design (v2): excision is primary (ground-truth reachability);
trace classifies slop but does not veto confirmed excision. Your job
is to reproduce both halves yourself.

Procedure:

1. Read the cited file and symbol BEFORE reading the hypothesis. Form
   your own view of what the code does. Run `rg -F "SYMBOL" --type rust`
   yourself and confirm the discovery agent's caller list — do not
   trust their search. Check for macro expansion, derive targets, and
   build-script call sites.

2. Record BASELINE from a pristine checkout (no patch applied):

       cargo clippy --workspace --all-targets -- -D warnings 2>&1 | tail -40
       cargo run --bin rivet --quiet -- validate 2>&1 | tail -5
       cargo run --bin rivet --quiet -- commits 2>&1 | tail -5

   Clippy, validate, and commits may all exit non-zero on the pristine
   tree due to pre-existing lint / schema noise. A finding is only
   rejected by excision if the excised output differs from baseline
   for THESE three. `build` and `test` must still exit 0.

3. Apply the EXCISION_PATCH from the report. Run:

       cargo build --workspace --all-targets
       cargo test --workspace --no-fail-fast
       cargo clippy --workspace --all-targets -- -D warnings
       cargo run --bin rivet --quiet -- validate
       cargo run --bin rivet --quiet -- commits
       # Playwright only when file is a frontend surface (see HOWTO §6)
       ( cd tests/playwright && npx playwright test --reporter=line )

   Oracle rule:
     - `build`/`test`: must exit 0. Any failure = finding REJECTED.
     - `clippy`/`validate`/`commits`: must match BASELINE from step 2.
       New error lines = finding REJECTED. Clippy output in particular
       often carries pre-existing lint noise in unrelated files; only
       NEW clippy errors originating from the excised code matter.

   Feature-flag check: if the target symbol is under `#[cfg(feature =
   "...")]`, re-run with `--all-features` or the specific feature set
   that guards it. A symbol that appears unused only because its
   feature is off is NOT slop — report `VERDICT: not-confirmed
   (feature-gated)` with the feature name.

   If any command fails non-baseline, reply `VERDICT: not-confirmed`
   with the first failing command's output. Stop.

4. Reproduce the symbol-scoped trace query yourself. For each symbol
   in the excision set:

       git log -L ':SYMBOL:PATH' --format="%H %s" 2>/dev/null | \
         awk '/^[0-9a-f]{40} / {print $1}' | sort -u | \
         while read sha; do
           git log -1 --format="%B" "$sha" | \
             grep -qE "^(Implements|Refs|Fixes|Verifies): " && echo "$sha traced"
         done

       cargo run --bin rivet --quiet -- list --format json | \
         jq -r --arg p "PATH" --arg s "SYMBOL" '
           .[] | select(
             (.description // "" | (contains($p) and contains($s))) or
             (.fields["source-ref"] // "" | (contains($p) and contains($s)))
           ) | .id'

   Also grep for inline `// rivet: (verifies|implements|refs|fixes)`
   annotations on tests:

       rg -n "// rivet: (verifies|implements|refs|fixes) [A-Z]+-[0-9]+" \
         -- PATH

   If any test in the file verifies a requirement whose status is
   `approved`, the correct outcome is NOT `delete` — it is `add-test`
   (wire the code to a runtime path) or `document-as-non-goal` (mark
   the requirement `deferred`).

   Use your combined output to classify:
     - All three queries empty → orphan-slop (outcome should be
       `delete`).
     - Any of the three non-empty → aspirational-slop (outcome should
       be `add-test` or `document-as-non-goal`).

   If the discovery agent's CLASS disagrees with your trace output,
   mark `VERDICT: confirmed-but-outcome-changed` and name the correct
   class.

5. Uninteresting filters. If excision and trace both confirm, ask: is
   this finding interesting? NOT interesting if any of:

     - The excised symbol is a trait method required by a trait impl
       whose presence is itself justified. Trait-shape boilerplate is
       not slop.
     - The symbol is a `#[derive]` target or a `Debug`/`Display`
       implementation. Derives are not slop.
     - The excised symbol is a public re-export in `lib.rs`. Re-exports
       are not slop.
     - The code is in `etch/` or `fuzz/` (out of audit scope).
     - The symbol is a chain-slop case where the IMMEDIATE target IS
       exercised but its transitively-dead caller is the real slop.
       Redirect the finding to the caller file instead. Use
       `VERDICT: confirmed-but-target-changed`.

6. Outcome sanity check:
     - `delete` — confirm no `artifacts/` entry names this symbol as
       future work. If an artifact says "planned" or "in progress,"
       the outcome should be `add-test` + `add-artifact-link`.
     - `add-test` — name the specific end-to-end test that would
       exercise the symbol. If you can't name one, the outcome is
       probably `document-as-non-goal`.
     - `document-as-non-goal` — name the REQ or FEAT that should be
       marked `deferred` / `rejected`.

Output:

- `VERDICT: confirmed | not-confirmed | confirmed-but-outcome-changed |
  confirmed-but-target-changed`
- `CLASS: orphan-slop | aspirational-slop | parser-duplication`
  (only on confirmed)
- `OUTCOME: delete | add-test | document-as-non-goal` (only on
  confirmed)
- `BASELINE_OUTPUT:` fenced block, your own pristine run of validate +
  commits
- `ORACLE_EVIDENCE:` fenced block, your own reproduction of the
  excision run
- `TRACE_EVIDENCE:` fenced block, your own symbol-scoped trace output
- `REASON:` one paragraph. If an outcome changed, say what and why.
