# CLAUDE.md

See [AGENTS.md](AGENTS.md) for project instructions.

## Validation and Queries
- Use `rivet validate` to verify changes to artifact YAML files
- Use `rivet list --format json` for machine-readable artifact queries
- A Claude Code pre-commit hook runs `rivet validate` before each commit
  (configured in `.claude/settings.json`)

## Commit Traceability (MANDATORY)
Every commit that touches files in `rivet-core/src/` or `rivet-cli/src/`
MUST include artifact trailers. This is the single most important convention
in this project. Without trailers, commits become "orphans" that break
traceability coverage.

Add trailers in the commit message body (after a blank line):
```
Implements: REQ-028, REQ-029
Fixes: REQ-004
Verifies: REQ-010
Refs: FEAT-001
```

Quick reference for common work:
- Parser/CST changes -> `Implements: REQ-028`
- Incremental/salsa changes -> `Implements: REQ-029`
- Validation changes -> `Implements: REQ-004` or `Fixes: REQ-004`
- Schema changes -> `Implements: REQ-010`
- CLI commands -> `Implements: REQ-007`
- Dashboard/serve -> `Refs: FEAT-001`
- MCP server -> `Refs: FEAT-010`
- STPA artifacts -> `Implements: REQ-002`
- Test additions -> `Verifies: REQ-NNN` (the requirement being tested)

Exempt types (no trailer needed): chore, style, ci, docs, build.
To skip explicitly: add `Trace: skip` trailer.

See AGENTS.md "Commit Traceability" section for the full trailer reference
and retroactive traceability map.

## AI Provenance
- AI provenance is auto-stamped via PostToolUse hook when artifact files are edited
- When manually stamping, include model: `rivet stamp <ID> --created-by ai-assisted --model claude-opus-4-6`
