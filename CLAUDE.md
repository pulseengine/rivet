# CLAUDE.md

See [AGENTS.md](AGENTS.md) for project instructions.

Additional Claude Code settings:
- Use `rivet validate` to verify changes to artifact YAML files
- Use `rivet list --format json` for machine-readable artifact queries
- Commit messages require artifact trailers (Implements/Fixes/Verifies/Satisfies/Refs)
- A Claude Code pre-commit hook runs `rivet validate` before each commit
  (configured in `.claude/settings.json`)
- AI provenance is auto-stamped via PostToolUse hook when artifact files are edited
- When manually stamping, include model: `rivet stamp <ID> --created-by ai-assisted --model claude-opus-4-6`
