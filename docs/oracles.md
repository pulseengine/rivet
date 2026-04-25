# Oracles — `rivet check ...`

Oracles are reusable, mechanical checks that either pass (exit 0) or fire
(exit 1 + diagnostics). Each oracle is narrow by design so an agent
pipeline declared in a schema's `agent-pipelines:` block can gate a step
on a single oracle's outcome.

This document lists the oracle catalog shipped in v0.4.3 and their JSON
output schemas. The JSON shape is the contract pipelines consume —
downstream tools must not re-parse text output.

## General contract

All oracles accept a `--format {text|json}` flag. JSON is emitted on
stdout. Human-readable text is printed on stdout when `--format text` is
set (default for most oracles). Violations are also mirrored on stderr so
pipelines that only care about exit codes still see a useful signal in
their CI logs.

Exit codes:

- `0` — oracle passes (no violations).
- `1` — oracle fires (one or more violations).
- `2` — invocation error (unknown artifact, invalid format, etc.).

All three oracles in this catalog live under the `rivet check ...`
subcommand namespace.

## 1. `rivet check bidirectional`

Verifies that every forward link `A -(type)-> B` whose `type` declares an
`inverse:` in the schema has its inverse registered on `B`.

```
rivet check bidirectional [--format text|json]
```

**JSON output:**

```json
{
  "oracle": "bidirectional",
  "violations": [
    {
      "source": "DD-001",
      "link_type": "satisfies",
      "target": "REQ-001",
      "expected_inverse": "satisfied-by"
    }
  ]
}
```

- An empty `violations` array and exit 0 means the project is bidir-clean.
- Broken links (target missing from the store) are ignored — those are a
  separate validator concern.

**Typical failure causes:**

- Author forgot to add the reciprocal link when creating a new artifact.
- A link type was renamed but not all references migrated.

## 2. `rivet check review-signoff`

Verifies that an artifact in `released` status has a reviewer distinct
from the author. Optionally requires the reviewer's role to match a
declared value.

```
rivet check review-signoff <ID> [--role ROLE] [--format text|json]
```

Reviewer lookup order:

1. `artifact.provenance.reviewed-by` (preferred — typed field)
2. `artifact.fields["reviewed-by"]` (legacy free-form field)

Author lookup:

- `artifact.provenance.created-by`

Role lookup (when `--role` is given):

- `artifact.fields["reviewer-role"]`

**JSON output:**

```json
{
  "oracle": "review-signoff",
  "artifact_id": "REQ-001",
  "ok": false,
  "reasons": [
    "reviewer (alice) must differ from author (alice)"
  ],
  "author": "alice",
  "reviewer": "alice",
  "role_required": "safety-manager",
  "role_actual": null,
  "status": "released"
}
```

- Artifacts whose status is not `released` vacuously pass the oracle
  (reviewers are not mandated pre-release). The `reasons` array reports
  "not applicable".
- Missing reviewer or missing author each produce a distinct reason, so
  `rivet close-gaps` can target the right fix.

## 3. `rivet check gaps-json`

Runs `rivet validate` internally and emits a single canonical JSON
document grouping diagnostics by artifact. Feeds downstream oracles
(including `rivet close-gaps`) without re-parsing validator output.

```
rivet check gaps-json [--baseline NAME] [--format json|text]
```

- Default format is `json` — this oracle's primary consumer is another
  tool.
- `--baseline` scopes validation to a named baseline (cumulative), the
  same way `rivet validate --baseline` does.

**JSON output:**

```json
{
  "oracle": "gaps-json",
  "gaps": [
    {
      "artifact_id": "DD-042",
      "severity": "error",
      "diagnostics": [
        {
          "severity": "error",
          "rule": "broken-link",
          "message": "link 'satisfies' target 'REQ-NONEXISTENT' not found"
        }
      ]
    }
  ],
  "total": 1,
  "by_severity": { "error": 1, "warning": 0, "info": 0 }
}
```

- Per-artifact `severity` is the max across that artifact's diagnostics.
- Diagnostics without an artifact ID (file-level / schema-level) are
  bucketed under the synthetic key `"<global>"`.
- Exit code reflects `by_severity.error`: oracle fires iff `error > 0`.
  Warnings and infos are reported in the JSON but do not fail the gate.

## Pipeline wiring

An agent pipeline step in a schema declares which oracles must pass before
the step is considered complete:

```yaml
agent-pipelines:
  - name: release-readiness
    steps:
      - id: verify-bidirectional
        oracles: [bidirectional]
      - id: verify-signoff
        oracles: [review-signoff]
      - id: collect-gaps
        oracles: [gaps-json]
```

The runner exec's `rivet check <oracle>` with `--format json` and captures
the JSON envelope. On exit 1 the step is blocked; on exit 0 the step
continues.

## Adding new oracles

New oracles live under `rivet-cli/src/check/<name>.rs` and are wired as a
variant of `CheckAction` in `rivet-cli/src/main.rs`. Each module exposes:

- `compute(...)` — pure function returning a `Report` struct.
- `render_text(&Report)` / `render_json(&Report)` — formatters.

Each oracle must:

- Emit a stable JSON envelope with an `"oracle"` discriminator.
- Be deterministic (sort arrays by canonical keys for golden testability).
- Return exit 0 on pass, 1 on fire.
- Have a positive and a negative integration test in
  `rivet-cli/tests/check_oracles.rs`.
