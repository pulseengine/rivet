Please find a piece of slop in this program.

Context you must use:
- This is rivet, a Rust traceability + artifact tool built around a
  Salsa-incremental database, a Rowan-based YAML CST, and a set of
  format adapters. The authoritative claims about what the code should
  do live in `artifacts/` (requirements, feature-model, decisions) and
  in the commit trailer convention documented in `CLAUDE.md`.
- Focus on ONE file: {{file}}. You may read any other file in the repo
  to confirm or refute your hypothesis, but do not report slop outside
  {{file}}.
- Slop classes to look for, in priority order:
    (1) parser duplication — another file in `rivet-core/src/` parses
        the same input format. Cite the other file.
    (2) dead branches — match arms, error cases, or `pub` functions
        that no caller in the workspace ever reaches under any cfg.
    (3) aspirational abstraction — trait methods or engine hooks whose
        only implementations are in test-only `impl` blocks or
        `#[allow(dead_code)]` stubs.
    (4) pretense — a comment or docstring claims "supports X" but no
        test exercises X end-to-end (or the test depends on an
        artifact outside the repo).

Oracle design (v2 — excision primary, trace interpretive):

Slop is **confirmed** when the excision oracle passes (tests + validate
+ commits still succeed with the symbol stubbed). Trace does NOT veto a
confirmed excision — instead, trace is used to **classify** the slop:

  - Excision passes AND symbol-scoped trace EMPTY → orphan slop
    (`PROPOSED_OUTCOME: delete`).
  - Excision passes AND symbol-scoped trace NON-EMPTY → aspirational
    slop — someone specced it, nobody wired it up
    (`PROPOSED_OUTCOME: add-test` OR `document-as-non-goal`).
  - Excision FAILS on any command (non-baseline failure) → the symbol
    IS exercised → not slop, finding REJECTED.

The v2 oracle defeats two v1 flaws:
  - **Granularity**: excise at `pub fn` or method level, not whole
    module. The narrower the excision the stronger the finding.
  - **Trailer passthrough**: use `git log -L :SYMBOL:file.rs` so only
    commits that touched the **specific symbol** count. File-level
    trailer trace is noise.

Procedure (do these in order; do not skip):

1. Identify the narrowest excision candidate in {{file}}. Prefer a
   single `pub fn` or method body. `#[allow(dead_code)]` items are
   priors. If you want to target multiple symbols, do so in ONE patch
   only if they are independently dead — all-or-nothing.

2. BASELINE run first. On a clean worktree, record the pristine
   result of EVERY command that can produce noise unrelated to the
   excision. Run:

       cargo clippy --workspace --all-targets -- -D warnings 2>&1 | tail -40
       cargo run --bin rivet --quiet -- validate 2>&1 | tail -5
       cargo run --bin rivet --quiet -- commits 2>&1 | tail -5

   Note exit codes and last lines for each. Clippy, validate, and
   commits may all be non-zero on pristine main due to pre-existing
   lint / schema issues. The oracle rule for these three is
   "excised output must match baseline," not "must be zero." Only
   `build` and `test` need true exit-0.

3. Apply the excision as a literal source edit in this worktree (NOT a
   commit). Use `unimplemented!("slop-hunt excision: {{file}}::FN")`
   for function bodies. For traits, replace each method body
   separately. For whole-module excision, gate the `mod X;` line in
   `lib.rs` with `#[cfg(not(all()))]` — NOT `#[cfg(never)]`. The
   `never` form trips the `unexpected_cfgs` lint under `-D warnings`
   (post-Rust 1.80) and fabricates a false oracle failure.
   `#[cfg(not(all()))]` is recognized and always-false, producing
   no lint noise.

4. Run the excision oracle with `timeout: 600000` (10 min) per cargo
   command:

       cargo build --workspace --all-targets 2>&1 | tail -40
       cargo test --workspace --no-fail-fast 2>&1 | tail -80
       cargo clippy --workspace --all-targets -- -D warnings 2>&1 | tail -40
       cargo run --bin rivet --quiet -- validate 2>&1 | tail -10
       cargo run --bin rivet --quiet -- commits 2>&1 | tail -10
       # Playwright gate: run ONLY if {{file}} is a frontend surface
       # (rivet-cli/src/web.rs, src/serve*.rs, src/docs.rs,
       # rivet-cli/templates/**, vscode-rivet/**). Otherwise write
       # "playwright: skipped (backend-only)".
       ( cd tests/playwright && npx playwright test --reporter=line 2>&1 | tail -40 )

   Oracle rule:
     - For `build` and `test`: must exit 0. (These are green on
       pristine main; any failure after excision ⇒ code exercised.)
     - For `clippy`, `validate`, `commits`: must match BASELINE output
       from step 2. Pristine main may have pre-existing lint / schema
       noise; the relevant question is whether excision introduces
       NEW errors. Any new error line caused by excision ⇒ code
       exercised.
     - If any command is exercised-by-excision → finding REJECTED.
       Stop. Do not continue to step 5.

5. Run the symbol-scoped traceability query. This replaces the v1
   file-level trailer check. For each symbol in your excision set:

       git log -L ':{{SYMBOL}}:{{file}}' --format="%H %s" 2>/dev/null | \
         awk '/^[0-9a-f]{40} / {print $1}' | sort -u | \
         while read sha; do
           git log -1 --format="%B" "$sha" | \
             grep -qE "^(Implements|Refs|Fixes|Verifies): " && echo "$sha traced"
         done

   Note: `git log -L` only works from HEAD (git error "more than one
   commit to dig from" with `--all`). A `.gitattributes` entry
   `*.rs diff=rust` must exist for the symbol-regex form to work; the
   repo ships this.

   If `git log -L` reports the symbol is not found (rare — e.g. macro
   expansion), fall back to line-range log:

       git log -L {{LO}},{{HI}}:{{file}} --format="%H" 2>/dev/null | \
         awk '/^[0-9a-f]{40}/ {print}' | sort -u | while read sha; do
           git log -1 --format="%B" "$sha" | \
             grep -qE "^(Implements|Refs|Fixes|Verifies): " && echo "$sha traced"
         done

   Also run the artifact-reference query, but tightened to include the
   symbol name not just the file path:

       cargo run --bin rivet --quiet -- list --format json | \
         jq -r --arg p "{{file}}" --arg s "{{SYMBOL}}" '
           .[] | select(
             (.description // "" | (contains($p) and contains($s))) or
             (.fields["source-ref"] // "" | (contains($p) and contains($s)))
           ) | .id'

   Also run the inline-annotation query — rivet uses
   `// rivet: (verifies|implements|refs|fixes) REQ-N` comments on
   tests to link tests to requirements. The artifact corpus does not
   capture this; grep the source directly:

       rg -n "// rivet: (verifies|implements|refs|fixes) [A-Z]+-[0-9]+" \
         -- "{{file}}"

   If this turns up a requirement ID that is `approved` status, the
   target is aspirational-slop (somebody wrote tests verifying a
   requirement but never wired the code to a runtime path), not
   orphan-slop. Classify accordingly.

   Record all three outputs. Empty across all three = orphan;
   non-empty in any = aspirational.

6. Determine the CLASS and OUTCOME:
     - Empty trace → `CLASS: orphan-slop` → `OUTCOME: delete`.
     - Non-empty trace → `CLASS: aspirational-slop` → `OUTCOME:
       add-test` (if the spec genuinely wants this built) or
       `document-as-non-goal` (if the spec has drifted and the
       aspiration is no longer current).
     - If you propose `add-test`, name the exact test that would
       exercise the symbol end-to-end.
     - If you propose `document-as-non-goal`, name the artifact (REQ
       or FEAT) that should be marked `deferred` or `rejected`.

If steps 4 rejects, the finding is REJECTED — report truthfully with
the first exercising command's output. Do NOT fabricate a different
finding. **Hallucinations are more expensive than silence.**

Output format:

- `TARGET_FILE:` {{file}}
- `SYMBOL / LINES:` the excision target(s)
- `CLASS:` orphan-slop | aspirational-slop | parser-duplication |
  no-slop
- `HYPOTHESIS:` one sentence
- `BASELINE_OUTPUT:` fenced block — validate + commits on pristine
  tree, verbatim last lines
- `EXCISION_PATCH:` fenced diff, ready to `git apply`
- `EXCISION_ORACLE_OUTPUT:` fenced block with verbatim tails; note
  baseline-match for validate/commits
- `SYMBOL_TRACE_OUTPUT:` fenced block with git log -L output AND
  artifact jq output, per symbol
- `VERDICT:` slop-confirmed | no-slop (code-exercised)
- `PROPOSED_OUTCOME:` delete | add-test | document-as-non-goal
- `CANDIDATE_ARTIFACT_LINK:` REQ/FEAT/DD id (if aspirational) or
  "none fits"
- `NOTES:` anything unexpected, especially chain-slop (a neighboring
  file whose only non-test caller is YOUR target)
