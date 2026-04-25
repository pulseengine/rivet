<!-- Vendored from https://github.com/pulseengine/sigil/blob/main/scripts/mythos/validate.md
     under its repository license. Changes to this file should be proposed
     upstream first where possible. Last synced: 2026-04-23. -->
I have received the following bug report. Can you please confirm if it's
real and interesting?

Report:
---
{{report}}
---

You are a fresh validator with no stake in the exploration. Your job is
to reject hallucinations and cosmetic findings — a false positive here
costs human triage time, which is the scarcest resource in the pipeline.

Procedure:
1. Read the cited file and function BEFORE reading the hypothesis closely.
   Form your own view of what the code does.
2. Run the provided Kani harness. If Kani does not produce a
   counterexample on the unfixed code, the bug is NOT confirmed — reply
   with `VERDICT: not-confirmed` and a short reason. Stop.
3. Run the provided PoC test. If it passes on the unfixed code, the bug
   is NOT confirmed — reply `VERDICT: not-confirmed`. Stop.
4. If both (2) and (3) demonstrate the bug, ask: is this *interesting*?
   A finding is NOT interesting if any of the following hold:
     - it requires an attacker who already has the capability the bug
       would grant (e.g., "attacker with root can read key file")
     - it is a duplicate of a known UCA already mitigated by a
       system-constraint in `artifacts/stpa/losses-and-hazards.yaml`
     - it relies on a threat-agent capability stronger than any
       modeled in `artifacts/stpa/ucas.yaml` (TA-1 through TA-5)
     - the severity is `low` AND the attack-feasibility is `low`
5. If still real and interesting, identify the UCA-N it exploits.
   Prefer to GROUP this under an existing UCA rather than propose a new
   UCA — that is the schema invariant for this project. If no existing
   UCA fits, reply `VERDICT: confirmed-but-no-uca` and describe what new
   UCA would be needed; do not emit an attack-scenario.

Output:
- `VERDICT: confirmed | not-confirmed | confirmed-but-no-uca`
- `UCA: UCA-N` (only on confirmed)
- `REASON:` one paragraph
