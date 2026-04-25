You are emitting a new `design-decision` entry to append to
`artifacts/decisions.yaml`. The rivet schema is defined in
`schemas/dev.yaml` under `- name: design-decision` — consult it for
the exact field set and allowed values. Do not invent fields.

Input:
- Confirmed slop-hunt finding (below)
- Validator's chosen `OUTCOME`
---
{{confirmed_report}}
OUTCOME: {{outcome}}
---

Rules:

1. The new id is the next unused `DD-N` by integer suffix. Read the
   existing file to determine it.

2. Required fields (per `schemas/dev.yaml` :: `design-decision`):
     - `id`, `type: design-decision`, `title`, `status: draft`
     - `description` — state the slop class, the file, and the
       proposed outcome in one short paragraph. Reference the file
       path and symbol explicitly.
     - `tags` — MUST include `[audit, slop-hunt]`, plus one of
       `[parser-duplication | dead-branch | aspirational-abstraction |
        untraced-code | pretense]`.
     - `links` — follow rule 3 below.
     - `fields.rationale` — REQUIRED. Quote the excision oracle
       output and the traceability oracle output verbatim inside this
       field, fenced. Without the verbatim oracle output the artifact
       itself is slop and `rivet validate` will not trust it.
     - `fields.alternatives` — list the outcomes the validator
       considered and why the chosen one won.
     - `fields.source-ref` — the file path and line range the finding
       covers, in `path/to/file.rs:LO-HI` form.
     - `fields.baseline` — the current workspace version from
       `Cargo.toml` of `rivet-core`.

3. Links — the schema requires at least one `satisfies` link on every
   `design-decision` (rivet validate emits
   "link 'satisfies' requires at least 1 target" otherwise):
     - If OUTCOME is `delete` (orphan-slop): emit
       `links: [{type: satisfies, target: REQ-004}]`. The audit finding
       IS a traceability assertion — the decision that "no requirement
       governs this code" itself satisfies REQ-004.
     - If OUTCOME is `add-test` (aspirational-slop where the spec is
       current): emit `links: [{type: satisfies, target: <named REQ/FEAT>}]`.
     - If OUTCOME is `document-as-non-goal` (aspirational-slop where
       the spec has drifted): emit
       `links: [{type: satisfies, target: REQ-004}]` and also mark the
       original REQ or FEAT as `status: deferred` in a separate
       artifact edit.
     - If OUTCOME is `unify-with-{path}`: emit
       `links: [{type: supersedes, target: {existing-DD-if-any}},
                {type: satisfies, target: REQ-028}]` (or whichever
       requirement motivates unification). Do NOT invent link types.

4. Status MUST be `draft` on first emission. A human promotes to
   `approved` after deciding whether to delete / unify / test.

5. Provenance:
     - `created-by: ai-assisted`
     - `model: {whatever model ran the emit pass}`
     - `timestamp: <now as ISO-8601>`
     - `session-id: mythos-slop-hunt-{{file basename}}`

6. Commit trailer requirement: remind the human in the `description`
   that the commit that appends this artifact MUST carry a
   `Implements: REQ-004` trailer (traceability) OR `Trace: skip` with
   justification. This is how the audit's own output stays traced.

Emit ONLY the YAML block for the new artifact, nothing else — ready
to paste under `artifacts:` in `artifacts/decisions.yaml`. Indent two
spaces (match the existing file).

Template skeleton (fill in, don't modify structure):

```yaml
  - id: DD-NNN
    type: design-decision
    title: <imperative: "Delete X" | "Unify X with Y" | "Add tests for X" | "Link X to REQ-N">
    status: draft
    description: >
      Slop-hunt audit confirmed that <symbol> in <file> is
      <class-explanation>. Proposed outcome: <outcome>. Commit
      appending this artifact must carry `Implements: REQ-004` or
      `Trace: skip`.
    tags: [audit, slop-hunt, <class>]
    links:
      - type: satisfies        # REQ-004 for orphan-slop; see rule 3
        target: REQ-NNN
    fields:
      baseline: <workspace version>
      source-ref: <path:lo-hi>
      rationale: |
        Excision oracle output:
        ```
        <verbatim tail of cargo build / test / clippy / rivet validate / playwright>
        ```
        Traceability oracle output:
        ```
        <verbatim output of git-log trailer query and rivet list jq query>
        ```
      alternatives: >
        <outcomes considered, why the chosen one won>
    provenance:
      created-by: ai-assisted
      model: <model id>
      session-id: mythos-slop-hunt-<file basename>
      timestamp: <ISO-8601>
```
