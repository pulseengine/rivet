# Commit-to-Artifact Traceability

**Date:** 2026-03-10
**Status:** Approved
**Approach:** Runtime graph integration (Approach B)

## Problem

Safety-critical traceability requires linking implementation evidence
(git commits) to requirements, features, and design decisions.  Without
this link, auditors cannot verify that approved artifacts were actually
implemented, and orphan code changes escape traceability review.

Current state: Rivet validates artifact-to-artifact links but has no
awareness of git history.  Commits use conventional-commit format
(`feat:`, `fix:`) but carry no artifact references.

## Design Decisions

- **DD-011:** Git trailers over inline regex parsing.  Trailers are a
  git standard, machine-parseable via `git log --format='%(trailers)'`,
  and separate traceability metadata from the commit description.

- **DD-012:** Runtime graph integration over materialized YAML.  Commit
  nodes are injected ephemerally into the petgraph link graph at
  analysis time.  Git remains the single source of truth; no redundant
  YAML files to drift.

- **DD-013:** Dual opt-out mechanism.  Conventional-commit type
  exemption (configurable list: `chore`, `style`, `ci`, `docs`, `build`)
  handles routine commits.  Explicit `Trace: skip` trailer handles
  edge cases where a normally-traced type has no artifact mapping.

## Configuration

New `commits` block in `rivet.yaml`:

```yaml
commits:
  # Parser format (only "trailers" initially, extensible)
  format: trailers

  # Trailer key -> Rivet link type mapping
  trailers:
    Implements: implements
    Fixes: fixes
    Verifies: verifies
    Satisfies: satisfies
    Refs: traces-to

  # Conventional-commit types exempt from requiring trailers
  exempt-types:
    - chore
    - style
    - ci
    - docs
    - build

  # Explicit skip trailer
  skip-trailer: "Trace: skip"

  # Paths where commits MUST reference artifacts (orphan detection)
  traced-paths:
    - rivet-core/src/
    - rivet-cli/src/

  # Artifact IDs exempt from "unimplemented" checks (whitelist)
  trace-exempt-artifacts: []
```

The `trailers` map reuses existing schema link types.  No new link
types are needed.

## Commit Message Format

Conventional commits with git trailers in the footer:

```
feat(oslc): add conflict detection for concurrent modifications

Detects ETag mismatches during bidirectional sync and surfaces
conflicts to the developer before overwriting local changes.

Implements: FEAT-012, FEAT-013
Fixes: UCA-O-4
```

Rules:
- Trailers are in the footer (after last blank line), standard git format
- Multiple artifact IDs per trailer: comma-separated
- Multiple trailer types per commit: allowed
- Conventional-commit type extracted from subject prefix (before `:`)

## Components

### 1. `rivet commit-msg-check` Subcommand

Pre-commit hook entry point.  Validates a single commit message file.

**Integration via `.pre-commit-config.yaml`:**

```yaml
- repo: local
  hooks:
    - id: rivet-commit-msg
      name: rivet commit-msg check
      entry: rivet commit-msg-check
      language: system
      stages: [commit-msg]
      always_run: true
```

**Validation flow:**
1. Parse subject line for conventional-commit type
2. If type in `exempt-types` -> pass
3. If `Trace: skip` trailer present -> pass (log info note)
4. Parse trailers, extract artifact IDs via configured `trailers` map
5. No artifact trailers found -> **fail**
6. Validate each artifact ID exists in current store -> **fail** on
   unknown IDs with fuzzy-match suggestion

Fast path: loads only the artifact index (IDs + types), not the full
link graph.

### 2. `rivet commits` Subcommand

History analysis with five report types.

**Usage:**
```bash
rivet commits                    # all commits on current branch
rivet commits --since 2026-01-01 # from a date
rivet commits --range main..HEAD # specific git range
rivet commits --json             # machine-readable output
rivet commits --strict           # promote warnings to errors
```

**Runtime flow:**
1. Load artifact store and build link graph
2. Parse git log with trailers
3. Classify each commit: linked, orphan, exempt, broken-ref
4. Inject ephemeral commit nodes into link graph
5. Compute all five reports

**Five reports:**

| # | Report | Description | Severity |
|---|--------|-------------|----------|
| 1 | Linked commits | Commits with valid artifact trailers | Info |
| 2 | Broken references | Trailers referencing non-existent IDs | Error |
| 3 | Orphan commits | Non-exempt commits touching `traced-paths` without trailers | Warning |
| 4 | Artifact commit coverage | Per-artifact count of referencing commits | Info |
| 5 | Unimplemented artifacts | Artifacts with zero commits, not in `trace-exempt-artifacts` | Warning |

**Exit code:** non-zero on errors (broken references).  `--strict`
promotes warnings (orphans, unimplemented) to errors.

### 3. Dashboard Integration

Opt-in via `rivet serve --commits [--since DATE]`.

- **Artifact detail view:** "Commits" section showing linked commits
  (hash, date, author, subject, link type)
- **Stats page:** commit coverage metrics alongside artifact stats
- **Graph view:** commit nodes as distinct shape/color in petgraph
  visualization

Not in scope for v1: dedicated commits page, real-time git watching.

## Dogfooding Artifacts

New artifacts for Rivet's own tracking:

**Requirements:**
- REQ-017: Commit-to-artifact traceability
- REQ-018: Commit validation at commit time
- REQ-019: Orphan commit detection

**Features:**
- FEAT-029: `rivet commit-msg-check` subcommand
- FEAT-030: `rivet commits` subcommand (5 report types)
- FEAT-031: Configurable trailer-to-link-type mapping
- FEAT-032: Ephemeral commit node injection into link graph

**Design Decisions:**
- DD-011: Git trailers over inline regex
- DD-012: Runtime graph integration over materialized YAML
- DD-013: Type exemption + skip trailer for opt-out

## Traceability Chain

```
REQ-017 <-- satisfies -- FEAT-029, FEAT-030, FEAT-031, FEAT-032
REQ-018 <-- satisfies -- FEAT-029
REQ-019 <-- satisfies -- FEAT-030
DD-011  <-- satisfies -- REQ-017
DD-012  <-- satisfies -- REQ-017
DD-013  <-- satisfies -- REQ-018, REQ-019

Commits implementing these features carry:
  Implements: FEAT-029  (etc.)
...closing the traceability loop on itself.
```
