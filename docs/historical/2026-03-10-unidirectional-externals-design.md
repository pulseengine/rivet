# Unidirectional External Repo Imports — Design

## Goal

Enable rivet projects to consume requirements from non-rivet repositories
(Doorstop, StrictDoc, sphinx-needs, RTEMS, DOORS/Polarion CSV) as readonly
external dependencies, parsed natively, with cross-linking via prefixed IDs
and reverse-index coverage analysis.

## Architecture

**Externals config extension.** The existing `externals:` block gains two
optional fields: `format:` and `import-path:`. When `format:` is set to a
non-rivet value, the external is treated as readonly/unidirectional.

```yaml
externals:
  # Rivet project (bidirectional, existing behavior)
  loom:
    git: https://github.com/pulseengine/loom
    ref: main
    prefix: loom

  # Doorstop project (unidirectional, readonly)
  space-ros:
    git: https://github.com/ros-safety/requirements-playground
    ref: main
    prefix: ros
    format: doorstop
    import-path: reqs/

  # StrictDoc project (unidirectional, readonly)
  zephyr:
    git: https://github.com/zephyrproject-rtos/reqmgmt
    ref: main
    prefix: zep
    format: sdoc
    import-path: docs/
```

**Rules:**
- `format: rivet` (or omitted) = existing bidirectional behavior, expects
  `rivet.yaml` in root
- Any other `format:` = readonly, parsed by the named adapter, no backlink
  expectation from upstream
- `import-path:` scopes parsing to a subdirectory (defaults to repo root)
- Readonly externals skip transitive dependency resolution (they don't have
  `rivet.yaml`)

## Sync Pipeline

1. `rivet sync` clones/fetches the external repo to `.rivet/repos/<prefix>/`
2. For readonly externals, run the format-specific adapter on
   `<cache-dir>/<import-path>`
3. Artifacts get prefixed IDs: `zep:ZEP-SRS-1-1`, `ros:REQ-001`
4. Artifacts stored in memory for validation — never written to disk

## Reverse Index

For readonly externals, rivet builds a reverse index: external artifact →
list of local artifacts linking to it. This enables:

- `rivet validate` reports unresolved cross-links
- `rivet coverage` shows upstream coverage — which external reqs are traced
  by our artifacts
- Dashboard shows "linked from" on external artifact detail views

## Adapter Priority

1. **Doorstop** — trivial YAML parse, validates the full pipeline
2. **StrictDoc SDoc** — custom DSL parser, Zephyr use case
3. **sphinx-needs JSON** — migration path from sphinx-needs

## Doorstop Adapter

Walks directory trees looking for `.doorstop.yml` files to discover
documents, then reads each `{UID}.yml` item file.

**Discovery:** Find all `.doorstop.yml` → extract `prefix`, `parent`,
`digits`, `sep`.

**Field mapping:**

| Doorstop | Rivet |
|----------|-------|
| filename stem | id |
| `header` | title |
| `text` | description |
| `active: false` | status = "inactive" |
| `active: true` | status = "active" |
| `links` (list) | links with type traces-to (fingerprint hashes stripped) |
| `derived` | field: derived |
| `level` | field: level |
| `references` | field: references (source traceability) |
| extra YAML keys | artifact fields |

**Artifact type:** Derived from the Doorstop document prefix lowercase
(e.g., `sys`, `swrs`, `tst`). Configurable via `config:` block if custom
type names are needed.

**Document hierarchy:** The `parent` field in `.doorstop.yml` defines link
direction. When resolving links, Doorstop items reference parent-document
UIDs. These map directly to rivet's typed link relations.

**Example:** Doorstop item `SWRS-001.yml` with `header: "Publish frequency"`
becomes:

```yaml
id: SWRS-001
type: swrs
title: Publish frequency
description: "The localization system must publish a pose at a rate of x Hz."
status: active
links:
  - type: traces-to
    target: SYS-042
fields:
  level: "1.1.1"
  derived: false
```

## StrictDoc SDoc Adapter

Line-oriented state machine parser for the SDoc DSL. No external
dependency needed.

**Parser states:** document header → section → requirement block →
multiline field (`>>>` ... `<<<`).

**Grammar handling:** Read `[GRAMMAR]` blocks (inline or `.sgra` files) to
discover custom field schemas. Handle `[DOCUMENT_FROM_FILE]` includes.

**Field mapping:**

| SDoc | Rivet |
|------|-------|
| `UID` | id |
| `TITLE` | title |
| `STATEMENT` | description |
| `STATUS` | status |
| `RELATIONS` Parent | links (type: traces-to) |
| `RELATIONS` Parent with `ROLE: Refines` | links (type: refines) |
| `RELATIONS` Parent with `ROLE: Implements` | links (type: implements) |
| `RELATIONS` Parent with `ROLE: Verifies` | links (type: verifies) |
| `TAGS` | tags |
| Custom grammar fields | artifact fields |
| `[[SECTION]]` title | field: section |
| `SingleChoice`/`MultipleChoice` values | string fields |

**Example:** Zephyr's `ZEP-SRS-1-1` becomes:

```yaml
id: ZEP-SRS-1-1
type: sdoc-requirement
title: Creating threads
description: "The Zephyr RTOS shall provide an interface to create a thread."
status: Draft
fields:
  component: Threads
  requirement-type: Functional
links:
  - type: traces-to
    target: ZEP-SYRS-15
  - type: traces-to
    target: ZEP-SYRS-16
```

## Error Handling

- **Missing external repo:** `rivet sync` warns but continues. `rivet
  validate` reports unresolvable prefixed IDs as warnings, not errors.
- **ID collisions:** Prefixed IDs prevent cross-external collisions
  (`ros:REQ-001` vs `rtems:REQ-001`). Duplicate prefixes are rejected at
  config load. Duplicate IDs within a single external: warn, keep first.
- **Unparseable files:** Adapter logs warning per file, continues parsing.
  `rivet validate` summarizes parse failures.
- **Lockfile:** Readonly externals participate in `rivet lock` — pinned to
  exact commit SHA.

## Design Decisions

- **DD-018: Native format parsing over pre-conversion** — rivet parses
  Doorstop, SDoc, etc. directly rather than requiring repos to export to
  rivet YAML. Consuming repos as-is is the whole point.
- **DD-019: Explicit format declaration over auto-detect** — `format:
  doorstop` in config is predictable and debuggable. Auto-detect is
  convenient but fragile for edge cases.
- **DD-020: Reverse index for coverage analysis** — readonly externals
  support "which of our artifacts link to this external artifact" queries,
  enabling upstream coverage reporting.

## Dogfooding Artifacts

### Requirements
- REQ-023: Unidirectional external repo imports with native format parsing
- REQ-024: Doorstop YAML format adapter
- REQ-025: StrictDoc SDoc format adapter

### Design Decisions
- DD-018: Native format parsing over pre-conversion
- DD-019: Explicit format declaration over auto-detect
- DD-020: Reverse index for coverage analysis

### Features
- FEAT-040: `format:` and `import-path:` fields on externals config
- FEAT-041: Doorstop adapter (`.doorstop.yml` discovery, YAML item parsing)
- FEAT-042: StrictDoc SDoc adapter (state machine parser, grammar support)
- FEAT-043: Upstream coverage analysis (reverse index, `rivet coverage`)
- FEAT-044: sphinx-needs JSON adapter (future)

## Prior Art

| Tool | Pattern | Adopted |
|------|---------|---------|
| Doorstop | One YAML per req, prefix+digits UIDs, fingerprint hashes | Field mapping, document hierarchy |
| StrictDoc | Custom DSL, per-document grammars, typed relation roles | Typed link mapping, grammar-to-schema |
| sphinx-needs | JSON export with schema metadata, id_prefix namespace | Migration import path |
| RTEMS | Typed-role links, conditional inclusion | Validates rivet's typed-link design |
| Cargo | Format-specific registry adapters | Adapter-per-format pattern |
