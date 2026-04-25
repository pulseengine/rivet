<!-- Vendored from https://github.com/pulseengine/sigil/blob/main/scripts/mythos/emit.md
     under its repository license. Changes to this file should be proposed
     upstream first where possible. Last synced: 2026-04-23. -->
You are emitting a new `attack-scenario` entry to append to
`artifacts/stpa/attack-scenarios.yaml`. The rivet schema is defined in
`schemas/stpa-sec.yaml` — consult it for the exact field set and
allowed values. Do not invent fields.

Input:
- Confirmed bug report (below)
- Chosen `UCA-N` from the validator
---
{{confirmed_report}}
UCA: {{uca_id}}
---

Rules:
1. Grouping invariant: we group attack-scenarios under UCAs. If
   `artifacts/stpa/attack-scenarios.yaml` already contains an AS-N with
   `exploits` → `{{uca_id}}`, this new finding typically becomes a
   SIBLING AS-M with the same UCA link, NOT a new UCA. Each sibling
   expresses a distinct causal pathway under the same unsafe control
   action.
2. The new id must be the next unused `AS-N` by integer suffix. Read
   the existing file to determine it.
3. Required fields (per `schemas/stpa-sec.yaml`):
     - `id`, `type: attack-scenario`, `title`, `status: draft`
     - `description` (reference the Kani harness and PoC test by
       fully-qualified Rust path, since the bug lives in code, not in
       prose)
     - `fields.attack-type` (one of the allowed values)
     - `fields.attack-feasibility` (overall rating)
     - The five ISO 21434 Annex H factors:
       `elapsed-time`, `specialist-expertise`, `knowledge-of-item`,
       `window-of-opportunity`, `equipment`
     - Impact fields: `impact-safety`, `impact-financial`,
       `impact-operational`, `impact-privacy`
4. Required links:
     - `exploits` → `{{uca_id}}`
     - `exploits` → a `DF-N` data-flow if the bug touches one
     - `executed-by` → at least one `TA-N` from
       `artifacts/stpa/ucas.yaml` (the threat-agents section). Do NOT
       invent a new threat-agent; pick the closest fit.
     - `leads-to-hazard` → the `H-N` that the chosen UCA already
       leads to (transitive — look up in
       `artifacts/stpa/losses-and-hazards.yaml`).
5. Status MUST be `draft` on first emission. A human approves to
   promote to `approved`.

Emit ONLY the YAML block for the new artifact, nothing else — ready to
paste under `artifacts:` in `attack-scenarios.yaml`.
