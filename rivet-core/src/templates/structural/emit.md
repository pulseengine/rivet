You are emitting the commit + PR body for a confirmed structural closure.

Context:
- Run id: {{run_id}}
- Gap id: {{gap_id}}
- Confirmed proposal: {{proposal_json}}
- Validator stdout tail: {{validator_tail}}
- Owning schema: {{owning_schema}}
- Trailer template (from the schema's `emit.trailer`): {{trailer}}

Procedure:
1. Stage exactly the files the proposal touched. Nothing else.
2. Compose a commit message in this shape:

   ```
   <type>(<scope>): <imperative one-line summary>

   Closed by rivet run {{run_id}} (gap {{gap_id}}).
   <one paragraph: what changed and why this satisfies the diagnostic>

   {{trailer}}
   ```

3. The PR body uses this shape:

   ```
   ## What
   <one bullet per closure landed in this run>

   ## Why
   <the diagnostic, verbatim>

   ## Verification
   - `rivet validate` cold: PASS (run {{run_id}})
   - Validator log: .rivet/runs/{{run_id}}/validated.json
   ```

Constraints:
- Never bypass `rivet validate` with `--no-verify`.
- The trailer ({{trailer}}) is mandatory. CI rejects commits to
  rivet-core/src/ or rivet-cli/src/ without an artifact trailer.
- One closure = one commit. Do not bundle.
