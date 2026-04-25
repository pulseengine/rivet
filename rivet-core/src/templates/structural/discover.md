You are closing a structural traceability gap surfaced by `rivet validate`.

Context:
- Project root: {{project_root}}
- Gap id: {{gap_id}}
- Failing artifact: {{artifact_id}}
- Diagnostic (verbatim from the oracle): {{diagnostic}}
- Owning schema: {{owning_schema}}

Procedure:
1. Read the artifact YAML and the schema's `link-fields` for that artifact
   type. The schema is the ground truth for what links must exist.
2. Decide closure kind. There are exactly two:
   - **link-existing**: the missing link's target already exists as another
     artifact in the project. The fix is a single `rivet link <source>
     <link-type> <target>` invocation.
   - **draft-required**: no suitable target exists; a new artifact stub
     must be drafted. Use the schema's `example:` block as the shape.
3. Propose the closure as a structured object, not prose:
   ```json
   { "kind": "link-existing", "command": "rivet link REQ-001 satisfies DD-001" }
   ```
   or
   ```json
   { "kind": "draft-required", "stub_path": "artifacts/dev/REQ-002.yaml",
     "stub_yaml": "<<full YAML>>" }
   ```
4. Do NOT modify any file. The validator sub-agent runs `rivet validate`
   against your proposal in a fresh worktree before anything lands.

If you cannot identify a target with high confidence, prefer
`draft-required` and flag the assumption — false auto-links are more
expensive than a human reviewing a draft.
