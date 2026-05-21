---
id: DOC-ORACLES
title: "Oracles — rivet check"
type: reference
status: current
tags: [oracles, check, ci, agent-pipelines, reference]
---

# Oracles — `rivet check ...`

Oracles are reusable, mechanical checks that either pass (exit 0) or fire
(exit 1 + diagnostics). Each oracle is narrow by design so an agent
pipeline declared in a schema's `agent-pipelines:` block can gate a step
on a single oracle's outcome.

This document lists the oracle catalog shipped in v0.10.1 and their JSON
output schemas. The JSON shape is the contract pipelines consume —
downstream tools must not re-parse text output.

The catalog currently has five oracles, all variants of the `CheckAction`
enum in `rivet-cli/src/main.rs`:

| Oracle             | Purpose                                                       |
|--------------------|---------------------------------------------------------------|
| `bidirectional`    | Every forward link with a declared inverse has its inverse    |
| `review-signoff`   | A `released` artifact has a reviewer distinct from the author |
| `gaps-json`        | Canonical JSON gap summary grouped by artifact                |
| `sources`          | `cited-source` hash status (match / drift / missing / stale)  |
| `ai-defects-open`  | Block release on open `ai-found-defect` against shipped work  |

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

All oracles in this catalog live under the `rivet check ...`
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

## 4. `rivet check sources`

Walks every artifact carrying a `cited-source` and classifies its hash
status against the referenced file. The cited-source mechanism is how
Rivet detects drift between an artifact and an upstream document it cites.

```
rivet check sources [--update [--apply]] [--strict] [--format text|json]
```

Three modes:

- **default** — read-only listing of every cited-source and its status.
- **`--update`** — refresh `sha256` + `last-checked` stamps; prompts
  per-artifact unless paired with `--apply` for a non-interactive batch.
- **`--strict`** — read-only audit gate. Walks every cited-source and
  exits non-zero if anything has drifted, is missing a hash, is stale
  (`last-checked` older than 30 days or absent), or could not be read.
  Mutually exclusive with `--update`.

Status values: `match`, `drift`, `missing-hash`, `read-error`,
`skipped-remote`, `stale`. Phase 1 handles `kind: file` cited sources;
remote sources are skipped (see `rivet docs schema-cited-sources`).

In CI, `rivet check sources --strict` is the gate; `--update --apply` is
the (separate) fix invocation.

## 5. `rivet check ai-defects-open`

Blocks a release when an unresolved AI-found defect still attaches to
shipped work. The oracle fires if any `ai-found-defect` with
`triage-status: open` links to an artifact whose `status` is `released`
or `approved`, **or** if a defect's `triaged-by` equals the originating
session's `invoker` (a DPO segregation-of-duties violation — the same
person cannot both author and clear the defect).

```
rivet check ai-defects-open [--format text|json]
```

This oracle is the operational primitive for the Tool Confidence Level
(TCL) workstream. The tool-qualification dossier
(`docs/design/tool-qualification-dossier.md`, also `rivet docs
tool-qualification`) cites this loop as the TD1 detection layer that
compensates for eroded human review when the upstream author is an AI
assistant. Without this gate the TD1 claim has no mechanical backing.

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
      - id: verify-cited-sources
        oracles: [sources]
      - id: block-open-ai-defects
        oracles: [ai-defects-open]
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
