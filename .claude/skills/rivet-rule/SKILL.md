---
name: rivet-rule
description: For rivet projects — run `rivet validate` / `rivet close-gaps` and act on the diagnostics yourself. Rivet is a mechanical oracle; the closure decisions are yours per the project-scaffolded prompts.
---

# rivet-rule

Rivet is a **mechanical oracle**: `rivet validate` emits diagnostics,
`rivet check <oracle>` runs purpose-specific checks, `rivet close-gaps`
surfaces a ranked list of firings with enough context to act on.
Rivet does not classify, route, or prescribe closure — those decisions
live in the project's own `.rivet/templates/pipelines/<kind>/*.md`
prompt files (scaffolded by `rivet init --agents --bootstrap`, then
owned by the project).

The blog post *Spec-driven development is half the loop* is the
design reference. The one-sentence summary: "the tools require
V-model shape, and the agent responds to the errors the tools
produce. The door is locked until you follow the rules."

## When to trigger

- The user asks to close gaps, fix traceability, or work with rivet artifacts
- The user edits `artifacts/**/*.yaml`
- The user references a rivet diagnostic

## What to do

1. **Run `rivet validate`** (or `rivet close-gaps --format json` if you want
   gap-oriented grouping with schema context). Read the diagnostics verbatim.

2. **Consult the project's own closure procedure** under
   `.rivet/templates/pipelines/<kind>/discover.md` — scaffolded by the
   project, owned by the project, may have been customised for their domain.
   The kind to use is declared per-pipeline in the active schema's
   `agent-pipelines:` block (see `rivet pipelines show <schema>`).

3. **Propose closures per the discover.md procedure**, not a pattern I
   bring from outside. If the discover.md says "run one agent per gap in
   parallel with a minimal prompt," do that. If it says "flag the gap to
   a human," flag it. Rivet doesn't tell you which; the project does.

4. **Validate in a fresh session** — the validate.md procedure in the
   template pair will say to run `rivet validate` cold (new process, in a
   scratch worktree, against the proposed change). The fresh-session
   property comes for free from invoking the CLI in a new process; rivet
   doesn't implement it, the orchestrator realises it by calling rivet.

5. **Only emit when the validator agrees.** Per the mythos pattern —
   "hallucinations are more expensive than silence."

6. **Record outcomes**: `rivet runs record` (when available) or add to
   `.rivet/runs/<id>/notes.md`. Audit trail is the product.

## Do not

- Invent content (a missing `rationale` field needs domain judgment; draft + flag)
- Trust `rivet close-gaps` output as prescriptive — it's a diagnostic list, not a workflow
- Treat `rivet pipelines validate` as a gate — it's advisory unless you pass `--strict`
- Add fields rivet didn't ship for — if the JSON doesn't have routing, don't manufacture one
- Retry mechanical closures that failed validate in a prior run without asking the user

## Project-specific override

`.rivet/agents/rivet-rule.md` — if present, read it. It's the project's
specialisation of this skill (reviewer groups, domain terms, risk
tolerance, local process conventions). The project owns it; rivet never
rewrites it after scaffold.

## Quick reference

```bash
rivet validate                           # the oracle. Use it often.
rivet close-gaps --format json           # gap list with schema context
rivet pipelines list                     # what pipelines this project has
rivet pipelines show <schema>            # one schema's agent-pipelines block
rivet pipelines validate                 # advisory config check (add --strict for CI)
rivet templates list                     # which template kinds ship / are overridden
rivet templates show <kind>/<file>       # read a prompt template
rivet runs list                          # audit trail
rivet runs show <id>                     # one run's detail
rivet check bidirectional                # link-inverse consistency oracle
rivet check gaps-json                    # structured validator output
rivet check review-signoff <id>          # peer-review independence oracle
```

## When something breaks

- `rivet validate` errors — read the diagnostic, consult the relevant discover.md, propose a closure
- A proposal fails fresh-session validate — read the new diagnostic, don't retry blindly
- Pipeline config warnings (`rivet pipelines validate`) — fix the `.rivet/context/` entries before running close-gaps; advisory, not a gate
