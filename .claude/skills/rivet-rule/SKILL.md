---
name: rivet-rule
description: Oracle-gated gap-closure loop for rivet projects. Use this skill when the user asks to close traceability gaps, work with rivet artifacts, or when editing files under artifacts/**/*.yaml. The CLI does the ranking, validation, and fresh-session oracle work — this skill wraps it so the agent doesn't re-implement the loop.
---

# rivet-rule

The [rivet](https://github.com/pulseengine/rivet) tool validates SDLC
artifact traceability against a schema and surfaces gaps (missing links,
missing required fields, inconsistent decomposition). This skill invokes
rivet's oracle-gated gap-closure loop and hands the structured result
back to you for any follow-up that genuinely requires an LLM.

**Load-bearing rule**: everything mechanical lives in `rivet close-gaps`.
Do not re-implement the ranking, validator, or oracle logic in your
prompts. Run the CLI, parse its JSON, act on it.

## When to trigger

Invoke this skill when:
- The user asks to "close gaps", "fix traceability", "run rivet", or similar
- The user edits `artifacts/**/*.yaml` and asks you to verify
- You need to report on the current state of traceability in a rivet project
- The user references a rivet diagnostic, requirement id, or safety artifact

Do NOT trigger when:
- The user is working on code unrelated to rivet artifacts
- A project has no `rivet.yaml`
- A question is about rivet's CLI surface itself (check `docs/` or `rivet --help`)

## The loop

```bash
# 1. Confirm pipeline config is valid (hard gate).
rivet pipelines validate

# 2. Run the loop. JSON output is the contract.
rivet close-gaps --format json [--variant <name>]
```

Parse the JSON. For each gap:

| `routing`                | What you do |
|--------------------------|-------------|
| `auto-close`             | CLI has already proposed the fix. Usually nothing for you. Report the PR/patch. |
| `human-review-required`  | CLI has written a draft stub from `draft_template`. Read the stub + the artifact, fill in project-specific content using `.rivet/agents/rivet-rule.md` and `.rivet/context/*`, propose the completed artifact back. |
| `skipped-manual-only`    | Note in your next summary. Do NOT retry automatically. |

Every invocation is logged to `.rivet/runs/<id>/`. Before proposing a
closure, check `rivet runs show <recent-id>` — if the same gap was
proposed and skipped three runs ago, that's a signal the automated
closure is wrong, not that you should retry harder.

## Output contract (the JSON `rivet close-gaps --format json` emits)

```jsonc
{
  "run_id": "2026-04-23T16-00-00Z-abcd",
  "rivet_version": "0.5.0",
  "pipelines_active": ["vmodel"],
  "schemas_active": ["dev", "iec-62262"],
  "variant": null,
  "gaps": [
    {
      "id": "gap-0",
      "artifact_id": "REQ-PED-042",
      "diagnostic": "missing required link 'verifies' from class-C requirement",
      "contributing_oracles": [
        { "oracle_id": "structural-trace", "schema": "iec-62262", "weight": 50, "details": "..." }
      ],
      "rank_weight": 50,
      "owning_schema": "iec-62262",
      "routing": "human-review-required",
      "reviewers": ["qa-lead", "safety-officer"],
      "draft_template": "templates/stubs/unit-test-plan.yaml.tmpl",
      "proposed_action": { "kind": "draft-stub", "stub_path": "..." },
      "validated": null,
      "emitted": null
    }
  ],
  "elapsed_ms": 142
}
```

## Constraints on what you do

- **Never retry a mechanical closure yourself** — that's `rivet close-gaps`' job. If it didn't auto-close, don't fake it.
- **Never commit without running `rivet validate` cold** — the fresh-session validator is the only thing that proves your fix works.
- **Every commit that touches `artifacts/**/*.yaml` needs an artifact trailer** — see `.rivet/agents/rivet-rule.md` for the project's trailer format.
- **Content gaps (mitigation, risk-control, safety-goal) require domain expertise** — draft, don't invent. When you fill in a stub, explicitly flag any assumption you made so a human reviewer can check it.
- **Read `.rivet/context/` first** — review roles, domain glossary, risk tolerance. Those are project-defined; your prompt shouldn't override them.

## Reference files in this project

- `.rivet/agents/rivet-rule.md` — the project-specialised version of this skill (if scaffolded)
- `.rivet/context/review-roles.yaml` — reviewer group definitions
- `.rivet/context/domain-glossary.md` — project-specific terminology
- `.rivet/runs/` — append-only audit trail of every pipeline invocation

## Quickstart for a fresh project

```bash
# First-time setup (only if .rivet/ is absent)
rivet init --agents --bootstrap

# Resolve any Tier-3 placeholders the bootstrap left
$EDITOR .rivet/context/review-roles.yaml
$EDITOR .rivet/context/risk-tolerance.yaml

# Confirm the gate passes
rivet pipelines validate

# Now you can close gaps
rivet close-gaps --format json
```

## When things go wrong

- `rivet pipelines validate` fails → fix `.rivet/context/` files; do not bypass
- `rivet close-gaps` errors "no active schema declares an agent-pipelines: block" → the project's schemas predate 0.5.0 or the user has overridden schemas that don't ship the block; propose adding it
- An auto-close proposal from a prior run was reverted → that's a signal; read `.rivet/runs/<id>/notes.md` if present, ask the user rather than retrying
