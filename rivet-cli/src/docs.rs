//! `rivet docs` — built-in searchable documentation.
//!
//! All documentation is embedded in the binary. Topics are searchable
//! via `rivet docs --grep <pattern>` (like a built-in rg).

// SAFETY-REVIEW (SCRC Phase 1, DD-058): File-scope blanket allow for
// the v0.4.3 clippy restriction-lint escalation. These lints are
// enabled at workspace scope at `warn` so new violations surface in
// CI; the existing call sites here are grandfathered in via this
// file-level allow until Phase 2 (per-site #[allow(...)] + rewrite).
// Rationale per lint class:
//   * unwrap_used / expect_used: legacy sites — many are on parser
//     post-conditions, BTreeMap lookups by key just inserted, or
//     regex::new on literals. Safe to keep; will migrate to ? with
//     typed errors in Phase 2 where user-facing.
//   * indexing_slicing / arithmetic_side_effects: tight math in
//     CST offsets, layout coordinates, and counted-loop indices that
//     is reviewed but not rewritten to checked_* for readability.
//   * as_conversions / cast_possible_truncation / cast_sign_loss:
//     usize<->u32/u64 in offsets where the value range is bounded by
//     input size (bytes of a loaded YAML file).
//   * wildcard_enum_match_arm / match_wildcard_for_single_variants:
//     tolerant parsers intentionally catch-all on token kinds.
//   * panic: only reached on programmer-error invariants.
//   * print_stdout / print_stderr: rivet-cli binary I/O.
#![allow(
    clippy::unwrap_used,
    clippy::expect_used,
    clippy::indexing_slicing,
    clippy::arithmetic_side_effects,
    clippy::as_conversions,
    clippy::cast_possible_truncation,
    clippy::cast_sign_loss,
    clippy::wildcard_enum_match_arm,
    clippy::match_wildcard_for_single_variants,
    clippy::panic,
    clippy::todo,
    clippy::unimplemented,
    clippy::dbg_macro,
    clippy::print_stdout,
    clippy::print_stderr
)]

use rivet_core::embedded;

// ── Topic registry ──────────────────────────────────────────────────────

struct DocTopic {
    slug: &'static str,
    title: &'static str,
    category: &'static str,
    content: &'static str,
}

const TOPICS: &[DocTopic] = &[
    // ── Getting started ────────────────────────────────────────────────
    DocTopic {
        slug: "quickstart",
        title: "10-step oracle-gated quickstart",
        category: "Getting started",
        content: QUICKSTART_DOC,
    },
    // ── Reference topics ───────────────────────────────────────────────
    DocTopic {
        slug: "artifact-format",
        title: "YAML artifact file format",
        category: "Reference",
        content: ARTIFACT_FORMAT_DOC,
    },
    DocTopic {
        slug: "rivet-yaml",
        title: "rivet.yaml configuration reference",
        category: "Reference",
        content: RIVET_YAML_DOC,
    },
    DocTopic {
        slug: "cli",
        title: "CLI command reference",
        category: "Reference",
        content: CLI_DOC,
    },
    DocTopic {
        slug: "json-output",
        title: "JSON output format and jq examples",
        category: "Reference",
        content: JSON_DOC,
    },
    DocTopic {
        slug: "documents",
        title: "Documents — markdown with frontmatter, images, and diagrams",
        category: "Reference",
        content: DOCUMENTS_DOC,
    },
    DocTopic {
        slug: "embed-syntax",
        title: "Computed embed syntax for documents and CLI",
        category: "Reference",
        content: EMBED_SYNTAX_DOC,
    },
    DocTopic {
        slug: "commit-traceability",
        title: "Commit-to-artifact traceability via git trailers",
        category: "Reference",
        content: COMMIT_TRACEABILITY_DOC,
    },
    DocTopic {
        slug: "cross-repo",
        title: "Cross-Repository Linking",
        category: "Reference",
        content: CROSS_REPO_DOC,
    },
    DocTopic {
        slug: "mutation",
        title: "CLI mutation commands (add, modify, remove, link, unlink)",
        category: "Reference",
        content: MUTATION_DOC,
    },
    DocTopic {
        slug: "conditional-rules",
        title: "Conditional validation rules (when/then)",
        category: "Reference",
        content: CONDITIONAL_RULES_DOC,
    },
    DocTopic {
        slug: "impact",
        title: "Change impact analysis",
        category: "Reference",
        content: IMPACT_DOC,
    },
    DocTopic {
        slug: "needs-json",
        title: "sphinx-needs JSON import (migration from sphinx-needs)",
        category: "Reference",
        content: NEEDS_JSON_DOC,
    },
    DocTopic {
        slug: "bazel",
        title: "Bazel MODULE.bazel integration for cross-repo discovery",
        category: "Reference",
        content: BAZEL_DOC,
    },
    DocTopic {
        slug: "formal-verification",
        title: "Formal verification strategy (Kani, Verus, Rocq)",
        category: "Reference",
        content: FORMAL_VERIFICATION_DOC,
    },
    DocTopic {
        slug: "html-export",
        title: "HTML export deployment and customization",
        category: "Reference",
        content: HTML_EXPORT_DOC,
    },
    DocTopic {
        slug: "mcp",
        title: "MCP server — wire format, tool catalog, and smoke tests",
        category: "Reference",
        content: MCP_DOC,
    },
    // ── Schema topics ──────────────────────────────────────────────────
    DocTopic {
        slug: "schemas-overview",
        title: "All built-in schemas, bridges, and presets",
        category: "Schemas",
        content: SCHEMAS_OVERVIEW_DOC,
    },
    DocTopic {
        slug: "schema/common",
        title: "Common base fields and link types",
        category: "Schemas",
        content: embedded::SCHEMA_COMMON,
    },
    DocTopic {
        slug: "schema/dev",
        title: "Development tracking schema (requirement, design-decision, feature)",
        category: "Schemas",
        content: embedded::SCHEMA_DEV,
    },
    DocTopic {
        slug: "schema/stpa",
        title: "STPA safety analysis schema (10 types)",
        category: "Schemas",
        content: STPA_DOC,
    },
    DocTopic {
        slug: "schema/stpa-sec",
        title: "STPA-Sec adversarial threat extension",
        category: "Schemas",
        content: STPA_SEC_DOC,
    },
    DocTopic {
        slug: "schema/stpa-ai",
        title: "STPA-for-AI ML lifecycle extension",
        category: "Schemas",
        content: STPA_AI_DOC,
    },
    DocTopic {
        slug: "schema/aspice",
        title: "Automotive SPICE schema (14 types, ASPICE 4.0)",
        category: "Schemas",
        content: ASPICE_DOC,
    },
    DocTopic {
        slug: "schema/cybersecurity",
        title: "Cybersecurity schema (SEC.1-4, 10 types)",
        category: "Schemas",
        content: CYBERSECURITY_DOC,
    },
    DocTopic {
        slug: "schema/aadl",
        title: "AADL architecture schema (spar integration)",
        category: "Schemas",
        content: embedded::SCHEMA_AADL,
    },
    DocTopic {
        slug: "schema/score",
        title: "Eclipse SCORE metamodel schema (20 types)",
        category: "Schemas",
        content: embedded::SCHEMA_SCORE,
    },
    DocTopic {
        slug: "schema/eu-ai-act",
        title: "EU AI Act compliance schema (Annex IV, Articles 9-15)",
        category: "Schemas",
        content: EU_AI_ACT_DOC,
    },
    DocTopic {
        slug: "schema/safety-case",
        title: "GSN safety case schema (Goal Structuring Notation v3)",
        category: "Schemas",
        content: SAFETY_CASE_DOC,
    },
    DocTopic {
        slug: "schema/research",
        title: "Research tracking schema (market, patents, tech eval)",
        category: "Schemas",
        content: embedded::SCHEMA_RESEARCH,
    },
    DocTopic {
        slug: "supply-chain",
        title: "Supply chain schema (SBOM, build attestation, vulnerability, release)",
        category: "Schemas",
        content: SUPPLY_CHAIN_DOC,
    },
];

// ── Embedded documentation ──────────────────────────────────────────────

const ARTIFACT_FORMAT_DOC: &str = r#"# Artifact YAML Format

Artifacts are stored in YAML files under the `artifacts/` directory.
Each file contains an `artifacts:` key with a list of artifact objects.

## Structure

```yaml
artifacts:
  - id: REQ-001            # Unique identifier (required)
    type: requirement       # Artifact type from schema (required)
    title: Short title      # Human-readable title (required)
    status: draft           # Lifecycle status (optional)
    description: >          # Detailed description (optional, supports markdown)
      Multi-line description here.
    tags: [safety, core]    # Categorization tags (optional)
    links:                  # Traceability links (optional)
      - type: satisfies     # Link type from schema
        target: FEAT-001    # Target artifact ID
    fields:                 # Type-specific fields (defined by schema)
      priority: must
      category: functional
```

## ID Conventions

- Use uppercase prefix + number: `REQ-001`, `DD-002`, `FEAT-003`
- Prefix typically matches the artifact type abbreviation
- IDs must be unique across all artifact files in the project

## Multiple Files

Split artifacts across files by domain or lifecycle phase:
- `artifacts/requirements.yaml`
- `artifacts/architecture.yaml`
- `artifacts/verification.yaml`

All files under configured source paths are loaded and merged.

## Field Types

| Type       | Description                     | Example              |
|------------|---------------------------------|----------------------|
| string     | Single-line text                | `priority: must`     |
| text       | Multi-line text (use `>`)       | `description: >`     |
| number     | Numeric value                   | `latency-ms: 50`     |
| boolean    | True/false                      | `safety-relevant: true` |
| structured | Nested YAML object              | `properties: {}`     |
| enum       | One of allowed values           | `status: approved`   |
| list       | YAML list                       | `tags: [a, b]`       |

## Link Types

Links express traceability relationships between artifacts:

| Link Type      | Inverse        | Use Case                           |
|----------------|----------------|------------------------------------|
| satisfies      | satisfied-by   | Feature satisfies a requirement    |
| derives-from   | derived-into   | SW req derives from system req     |
| verifies       | verified-by    | Test verifies a requirement        |
| implements     | implemented-by | Decision implements a requirement  |
| allocated-to   | allocated-from | Req allocated to arch component    |
| traces-to      | traced-from    | General traceability               |
| mitigates      | mitigated-by   | Control mitigates a hazard         |
| constrained-by | constrains     | Action constrained by constraint   |
"#;

const RIVET_YAML_DOC: &str = r#"# rivet.yaml Configuration

The `rivet.yaml` file defines the project configuration.

## Structure

```yaml
project:
  name: my-project          # Project name
  version: "0.1.0"          # Version string
  schemas:                  # Schemas to load (merged in order)
    - common                # Always include — base fields, link types
    - dev                   # Development tracking types
    # - aspice              # ASPICE V-model types
    # - stpa                # STPA safety analysis types
    # - cybersecurity       # ISO 21434 types
    # - aadl                # AADL architecture types

sources:                    # Artifact sources
  - path: artifacts         # Directory or file path
    format: generic-yaml    # Adapter: generic-yaml, stpa-yaml, aadl, reqif
    # config:               # Adapter-specific config (optional)
    #   key: value

docs:                       # Documentation directories (for [[ID]] scanning)
  - docs                    # legacy: just a path
  - path: arch              # detailed: path + opt-out allowlist
    exclude:                # silently skip these (still scanned otherwise)
      - "generated/**"      # `**` matches any subtree
      - "*.draft.md"        # bare patterns match the file name only

results: results            # Test results directory (JUnit XML, LCOV)
```

### Loud-by-default doc scanning

The doc scanner emits a stderr warning for every `.md` file it declines
(no YAML front-matter, malformed front-matter). This is by design:
silently-skipped files don't participate in the link graph, so artifact
IDs in their prose go invisible. The warning includes a hint to add the
file to `docs[].exclude` if the silence was intentional. A summary line
at the end of the scan reports `<loaded> loaded, <warned> skipped,
<excluded> excluded by allowlist`.

## Available Schemas

| Name           | Types | Description                              |
|----------------|-------|------------------------------------------|
| common         | 0     | Base fields, 8 link types                |
| dev            | 3     | requirement, design-decision, feature    |
| stpa           | 10    | STPA losses through scenarios            |
| stpa-sec       | 6     | STPA-Sec adversarial threat extension    |
| stpa-ai        | 5     | STPA-for-AI ML lifecycle extension       |
| aspice         | 14    | ASPICE 4.0 SYS.1-5, SWE.1-6             |
| cybersecurity  | 10    | SEC.1-4, TARA, ISO 21434                 |
| aadl           | 3     | AADL components, analysis, flows         |
| score          | 20    | Eclipse SCORE metamodel (ISO 26262)      |
| eu-ai-act      | 8     | EU AI Act Annex IV, Articles 9-15        |
| safety-case    | 6     | GSN safety argument (Goal, Strategy, ...) |
| research       | 5     | Market analysis, patents, tech eval      |

See `rivet docs schemas-overview` for details on each schema, which presets
use them, and how bridge schemas connect domains.

## Available Adapters

| Format       | Description                         |
|--------------|-------------------------------------|
| generic-yaml | Canonical YAML artifact files       |
| stpa-yaml    | Meld STPA safety analysis YAML      |
| aadl         | AADL files via spar (library)       |
| reqif        | ReqIF 1.2 XML import/export         |
"#;

const CLI_DOC: &str = r#"# CLI Command Reference

## Project Commands

```
rivet validate              Validate all artifacts against schemas
rivet list [-t TYPE]        List artifacts (filter by type/status)
rivet get ID                Show a single artifact by ID (text/json/yaml)
rivet stats                 Summary statistics and orphan detection
rivet coverage              Traceability coverage report
rivet matrix --from X --to Y  Traceability matrix between types
rivet diff                  Compare artifact versions
rivet export -f FORMAT      Export to reqif, generic-yaml, or html
rivet serve [-P PORT]       Start HTMX dashboard (default: 3000)
rivet commits [--since N]   Commit-artifact traceability analysis
rivet commit-msg-check F    Validate commit message trailers (hook)
rivet impact --since REF    Change impact analysis (transitive)
```

## Embed and Snapshot Commands

```
rivet embed QUERY           Resolve a computed embed (e.g. "stats:types")
rivet embed QUERY -f html   Render embed as HTML fragment
rivet snapshot capture      Capture current project state to JSON
rivet snapshot diff         Compare current state against a baseline
rivet snapshot list         List all captured snapshots
```

## MCP Server

```
rivet mcp                          Start the MCP server (stdio transport)
rivet mcp --list-tools             Print the registered tool catalog and exit
rivet mcp --list-tools -f json     Emit the JSON-RPC tools/list payload
rivet mcp --probe                  Run an in-process tools/call rivet_list smoke test
```

Exposes rivet tools to AI agents via the Model Context Protocol.
The server uses stdio transport and only binds to the local process.
See `rivet docs mcp` for the wire format, the 15-tool catalog, and the
3-message handshake.

## Schema Commands

```
rivet schema list           List all artifact types
rivet schema show TYPE      Show type details with example YAML
rivet schema links          List all link types with inverses
rivet schema rules          List all traceability rules
```

## Documentation Commands

```
rivet docs                  List available documentation topics
rivet docs TOPIC            Show a specific topic
rivet docs --grep PATTERN   Search across all documentation
```

## Scaffolding

```
rivet init                  Initialize a new project (dev preset)
rivet init --preset aspice  Initialize with ASPICE schema + examples
rivet context               Generate .rivet/agent-context.md
```

Available presets: `dev`, `aspice`, `stpa`, `stpa-ai`, `cybersecurity`,
`aadl`, `eu-ai-act`, `safety-case`.

## Mutation Commands

```
rivet add --type TYPE --title TITLE   Create a new artifact
rivet modify ID --set-status STATUS   Update artifact fields
rivet link SRC --type T --target DST  Add a traceability link
rivet unlink SRC --type T --target DST  Remove a link
rivet remove ID                       Remove an artifact
rivet next-id --type TYPE             Next available ID for a type
```

## Import Commands

```
rivet import-results --format junit FILE  Import JUnit XML test results
```

## Global Flags

```
-p, --project PATH   Project directory (default: .)
    --schemas PATH   Schemas directory override
-v, --verbose        Increase verbosity (-v info, -vv debug)
```

## JSON Output

Most commands support `--format json` for machine-readable output:

```
rivet schema list --format json
rivet schema show sw-req --format json
rivet validate --format json
rivet list --format json
rivet get ID --format json
rivet stats --format json
rivet coverage --format json
rivet embed QUERY --format html
rivet snapshot diff --format json
rivet docs --grep PATTERN --format json
```
"#;

const JSON_DOC: &str = r#"# JSON Output Format & jq Examples

All `--format json` output follows a consistent envelope:

```json
{
  "command": "command-name",
  "data": { ... }
}
```

## jq Recipes

### List all artifact type names
```bash
rivet schema list --format json | jq -r '.artifact_types[].name'
```

### Show fields for a specific type
```bash
rivet schema show sw-req --format json | jq '.artifact_type.fields[]'
```

### Get required fields only
```bash
rivet schema show sw-req --format json | jq '[.artifact_type.fields[] | select(.required)]'
```

### List all link types and inverses
```bash
rivet schema links --format json | jq -r '.link_types[] | "\(.name) <-> \(.inverse // "none")"'
```

### Get validation errors only
```bash
rivet validate --format json | jq '[.diagnostics[] | select(.severity == "error")]'
```

### Count artifacts by type
```bash
rivet stats --format json | jq '.types'
```

### List artifacts of a specific type
```bash
rivet list -t requirement --format json | jq -r '.artifacts[].id'
```

### Get uncovered artifacts from coverage
```bash
rivet coverage --format json | jq '[.entries[] | select(.uncovered_ids | length > 0)]'
```

### Search docs and get matching lines
```bash
rivet docs --grep "verification" --format json | jq -r '.matches[] | "\(.topic):\(.line): \(.text)"'
```

### Generate a type reference table
```bash
rivet schema list --format json | jq -r '.artifact_types[] | [.name, .description] | @tsv'
```

### Check if validation passes
```bash
rivet validate --format json | jq -e '.errors == 0' > /dev/null && echo "PASS" || echo "FAIL"
```
"#;

const DOCUMENTS_DOC: &str = r#"# Documents

Rivet treats markdown files as first-class project documents. Documents are
loaded from directories listed under `docs:` in `rivet.yaml`, parsed for
YAML frontmatter, and scanned for artifact references.

## Directory Layout

```yaml
# rivet.yaml
docs:
  - docs        # loads docs/*.md recursively
  - arch        # loads arch/*.md recursively
```

Each `.md` file becomes a document in the dashboard's Documents view.

## Frontmatter

Every document should start with a YAML frontmatter block:

```yaml
---
id: DOC-SRS
title: Software Requirements Specification
type: specification
status: approved
tags: [requirements, safety]
---
```

| Field  | Required | Description                              |
|--------|----------|------------------------------------------|
| id     | yes      | Unique document identifier               |
| title  | yes      | Display title                            |
| type   | no       | Document type (specification, plan, etc.) |
| status | no       | Lifecycle status (draft, approved, etc.)  |
| tags   | no       | Categorization tags                      |

## Artifact References

Use `[[ID]]` syntax to reference artifacts anywhere in the document body:

```markdown
The latency requirement [[REQ-001]] is satisfied by design decision [[DD-005]].
```

These are rendered as clickable links in the dashboard and tracked in the
document-artifact linkage view. Broken references (IDs not found in the
artifact store) are visually flagged.

## Images

Embed images using standard markdown syntax:

```markdown
![Architecture diagram](images/arch-overview.png)
![Sequence flow](images/flow.svg)
```

Images are resolved relative to the document's `docs:` directory.
Place images in a subdirectory (e.g. `docs/images/`) and reference them
with a relative path.

Supported formats: PNG, JPEG, GIF, SVG, WebP.

In the dashboard, image paths are served via `/docs-asset/` — e.g.
`images/arch.png` in a doc becomes `/docs-asset/images/arch.png`.

## Mermaid Diagrams

Embed diagrams using fenced code blocks with the `mermaid` language tag:

````markdown
```mermaid
graph TD
    REQ-001 -->|satisfies| FEAT-001
    REQ-001 -->|derives-from| SYS-REQ-001
    DD-005 -->|implements| REQ-001
```
````

Mermaid diagrams are rendered client-side in the dashboard. Supported
diagram types include:

- **flowchart / graph** — dependency and flow diagrams
- **sequence** — interaction sequences
- **state** — state machines
- **class** — structure diagrams
- **gantt** — timeline views
- **C4** — architecture (C4 model)

### Tips

- Use artifact IDs as node names to match traceability
- Keep diagrams focused (10-20 nodes max) for readability
- The `mermaid` block is passed through as-is in CLI text output

## AADL Diagrams

If you have spar (AADL parser) integration, use `aadl` code blocks:

````markdown
```aadl
root: flight_controller
```
````

These are rendered as interactive architecture diagrams via the WASM runtime.

## Sections and TOC

Headings (`##`, `###`, etc.) are parsed into sections. Documents with more
than two sections automatically get a table of contents in the dashboard.
Section-level artifact reference counts are shown in the TOC.

## Computed Embeds

Use `{{name}}` syntax to embed computed project data inline in documents:

### Artifact embeds (legacy)

```markdown
{{artifact:REQ-001}}            — inline artifact card
{{artifact:REQ-001:full}}       — full card with description, tags, links
{{links:REQ-001}}               — incoming/outgoing link table
{{table:requirement:id,title}}  — filtered artifact table
```

### Stats embed

```markdown
{{stats}}                       — full stats table (types, status, validation)
{{stats:types}}                 — artifact counts by type only
{{stats:status}}                — counts by status only
{{stats:validation}}            — validation summary only
```

### Coverage embed

```markdown
{{coverage}}                    — all traceability rules with percentage bars
{{coverage:rule-name}}          — single rule with uncovered artifact IDs
```

### Diagnostics embed

```markdown
{{diagnostics}}                 — all validation issues
{{diagnostics:error}}           — errors only
{{diagnostics:warning}}         — warnings only
```

### Matrix embed

```markdown
{{matrix}}                      — one matrix per traceability rule
{{matrix:requirement:feature}}  — specific source→target matrix
```

### Error handling

Unknown or malformed embeds render as a visible error (`embed-error` class),
never an empty string. This ensures broken embeds are noticed during review.

### In HTML export

Computed embeds in exported HTML include a provenance footer with the git
commit hash and timestamp, so reviewers can trace when data was generated.

## Validation

Documents participate in validation:

- **Broken references**: `[[ID]]` pointing to nonexistent artifacts are warnings
- **Coverage**: The doc-linkage view shows which artifacts are referenced in docs
- **Orphan detection**: Artifacts never referenced in any document are flagged
"#;

const COMMIT_TRACEABILITY_DOC: &str = r#"# Commit-to-Artifact Traceability

Rivet tracks which git commits implement, fix, verify, or otherwise relate
to artifacts using **git trailers** — standard key-value pairs in commit
message footers.

## Configuration

Add a `commits:` block to `rivet.yaml`:

```yaml
commits:
  format: trailers                # Only "trailers" is supported currently
  trailers:                       # Maps trailer key → link type
    Implements: implements
    Fixes: fixes
    Verifies: verifies
    Satisfies: satisfies
    Refs: traces-to
  exempt-types:                   # Conventional-commit types that skip checks
    - chore
    - style
    - ci
    - docs
    - build
  skip-trailer: "Trace: skip"    # Explicit opt-out trailer
  traced-paths:                   # Only commits touching these paths are orphans
    - src/
  trace-exempt-artifacts: []      # Artifacts that won't be flagged as unimplemented
```

## Commit Message Format

Reference artifacts using configured trailer keys in the commit footer:

```
feat(parser): add streaming token support

Reworked the parser to handle streaming tokens for better
memory efficiency in large files.

Implements: FEAT-042
Fixes: REQ-015
```

Multiple artifact IDs can be listed on one line, separated by commas:

```
Implements: FEAT-042, FEAT-043
Verifies: REQ-015, REQ-016
```

## Exemption Mechanisms

There are two ways to opt out of trailer requirements:

1. **Conventional-commit type exemption:** Commits whose type (the prefix
   before `:`) matches `exempt-types` are automatically exempt. For example,
   `chore: update deps` is exempt if `chore` is in the list.

2. **Explicit skip trailer:** Add the configured `skip-trailer` value to any
   commit message to skip validation:

   ```
   refactor: rename internal helper

   Trace: skip
   ```

## Pre-Commit Hook

Rivet provides a commit-msg hook for the [pre-commit](https://pre-commit.com)
framework. Add it to `.pre-commit-config.yaml`:

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

The hook validates each commit message:
- Checks that at least one artifact trailer is present
- Verifies that referenced artifact IDs exist in the project
- Suggests close matches for typos (Levenshtein distance)
- Passes exempt commits and those with the skip trailer

## `rivet commits` Command

Analyze the full git history for commit-artifact traceability:

```
rivet commits                    # Analyze all commits
rivet commits --since 30        # Only last 30 days
rivet commits --range main..dev  # Specific commit range
rivet commits --format json      # Machine-readable output
rivet commits --strict           # Exit 1 if any orphan or broken ref
```

### Report Sections

1. **Linked commits** — Commits with valid artifact trailers
2. **Broken references** — Commits referencing non-existent artifact IDs
3. **Orphan commits** — Non-exempt commits touching `traced-paths` without trailers
4. **Artifact coverage** — How many artifacts have at least one linked commit
5. **Unimplemented artifacts** — Artifacts with no commit evidence (minus exemptions)

### Path-Based Orphan Detection

Only commits that modify files under `traced-paths` are flagged as orphans.
Commits that only touch documentation, CI config, or other non-traced paths
are not considered orphans even without trailers.

### Exempt Artifact Whitelist

Use `trace-exempt-artifacts` to list artifact IDs that should not appear in
the "unimplemented" report — useful when retrofitting traceability onto an
existing project where historical commits lack trailers.
"#;

const CROSS_REPO_DOC: &str = r#"# Cross-Repository Artifact Linking

## Overview

Rivet supports linking artifacts across multiple git repositories using
a mesh topology. Any rivet project can declare dependencies on other rivet
projects and reference their artifacts using prefixed IDs.

## Configuration

Declare external dependencies in `rivet.yaml`:

```yaml
externals:
  rivet:
    git: https://github.com/pulseengine/rivet
    ref: main
    prefix: rivet
  meld:
    path: ../meld
    prefix: meld
```

- `git` — clone URL for the external repo
- `path` — local filesystem path (alternative to `git`)
- `ref` — git ref to checkout (branch, tag, or commit SHA)
- `prefix` — short alias used in cross-links; must be unique

## Cross-Link Syntax

In artifact YAML, reference external artifacts with `prefix:ID`:

```yaml
links:
  - type: traces-to
    target: rivet:REQ-001
  - type: mitigates
    target: meld:H-1
```

Resolution rules:
- Bare IDs (no colon) resolve locally as usual
- Prefixed IDs (`prefix:ID`) resolve against the named external
- Unknown prefixes are validation errors
- Missing IDs in the external are broken-reference errors

## Commands

### `rivet sync`

Fetches external repos into `.rivet/repos/` cache:

```
rivet sync
```

For `git` externals: clones or fetches the repo
For `path` externals: creates a symlink

### `rivet lock`

Pins all externals to exact commit SHAs in `rivet.lock`:

```
rivet lock
rivet lock --update   # refresh to latest refs
```

### `rivet validate` (with externals)

Validates cross-repo links in addition to local validation:
- Loads external artifacts from `.rivet/repos/` cache
- Checks all prefixed references resolve correctly
- Detects circular dependencies between repos
- Reports version conflicts (same repo at different refs)
- Checks lifecycle completeness (V-model coverage)

### `rivet baseline verify <name>`

Verifies baseline consistency across repos:

```
rivet baseline verify v1.0
rivet baseline verify v1.0 --strict
```

Checks each external for `baseline/<name>` tag.
Without `--strict`: missing tags are warnings.
With `--strict`: missing tags are errors.

## Distributed Baselining

Repos participate in baselines by tagging: `git tag baseline/v1.0`

- Tags follow the convention `baseline/<name>`
- Each repo tags itself independently
- `rivet baseline verify` checks consistency across repos
- No central platform repository required

## Design Decisions

- **DD-014**: Prefixed IDs (`rivet:REQ-001`) over URI-style references
- **DD-015**: Mesh topology — any repo links to any other
- **DD-016**: Distributed baselining — repos tag themselves
- **DD-017**: Transitive dependency resolution — declare direct deps only
"#;

const STPA_DOC: &str = concat!(
    include_str!("../../schemas/stpa.yaml"),
    r#"

## References

- Leveson, N.G. & Thomas, J.P. (2018). *STPA Handbook*.
  MIT Partnership for Systems Approaches to Safety and Security (PSASS).
  https://psas.scripts.mit.edu/home/get_file.php?name=STPA_handbook.pdf
- Leveson, N.G. (2011). *Engineering a Safer World*.
  MIT Press. https://mitpress.mit.edu/9780262533690/
"#
);

const ASPICE_DOC: &str = concat!(
    include_str!("../../schemas/aspice.yaml"),
    r#"

## References

- Automotive SPICE Process Assessment / Reference Model v4.0.
  VDA Quality Management Center.
  https://www.automotivespice.com/
- intacs — International Assessor Certification Scheme.
  https://www.intacs.info/
"#
);

const CYBERSECURITY_DOC: &str = concat!(
    include_str!("../../schemas/cybersecurity.yaml"),
    r#"

## References

- ISO/SAE 21434:2021 — Road vehicles — Cybersecurity engineering.
  https://www.iso.org/standard/70918.html
- UNECE WP.29 Regulation No. 155 — Cyber security and cyber security
  management system.
  https://unece.org/transport/documents/2021/03/standards/un-regulation-no-155
"#
);

// ── Public API ──────────────────────────────────────────────────────────

/// List all available documentation topics.
pub fn list_topics(format: &str) -> String {
    if format == "json" {
        let items: Vec<serde_json::Value> = TOPICS
            .iter()
            .map(|t| {
                serde_json::json!({
                    "slug": t.slug,
                    "title": t.title,
                    "category": t.category,
                })
            })
            .collect();
        return serde_json::to_string_pretty(&serde_json::json!({
            "command": "docs-list",
            "topics": items,
        }))
        .unwrap_or_default();
    }

    let mut out = String::new();
    out.push_str("Available documentation topics:\n\n");

    let mut current_cat = "";
    for t in TOPICS {
        if t.category != current_cat {
            if !current_cat.is_empty() {
                out.push('\n');
            }
            out.push_str(&format!("  {}\n", t.category));
            current_cat = t.category;
        }
        out.push_str(&format!("    {:<24} {}\n", t.slug, t.title));
    }

    out.push_str("\nUsage:\n");
    out.push_str("  rivet docs <topic>          Show a topic\n");
    out.push_str("  rivet docs --grep <pat>     Search across all docs\n");
    out.push_str("  rivet docs <topic> -f json  Machine-readable output\n");
    out
}

/// List every registered computed embed token.
///
/// Sourced from `rivet_core::embed::EMBED_REGISTRY` so the listing never
/// drifts from what `resolve_embed` actually dispatches.
pub fn list_embeds(format: &str) -> String {
    let specs = rivet_core::embed::registry();

    if format == "json" {
        let items: Vec<serde_json::Value> = specs
            .iter()
            .map(|s| {
                serde_json::json!({
                    "name": s.name,
                    "args": s.args,
                    "summary": s.summary,
                    "example": s.example,
                    "legacy": s.legacy,
                })
            })
            .collect();
        return serde_json::to_string_pretty(&serde_json::json!({
            "command": "docs-embeds",
            "embeds": items,
        }))
        .unwrap_or_default();
    }

    // Plain-text: aligned columns with a short footer pointing to the
    // full syntax reference and to `rivet embed` for CLI rendering.
    let name_w = specs.iter().map(|s| s.name.len()).max().unwrap_or(4);
    let args_w = specs.iter().map(|s| s.args.len()).max().unwrap_or(6);
    let mut out = String::new();
    out.push_str("Registered computed embeds:\n\n");
    out.push_str(&format!(
        "  {:<nw$}  {:<aw$}  SUMMARY\n",
        "NAME",
        "ARGS",
        nw = name_w,
        aw = args_w
    ));
    for s in specs {
        let marker = if s.legacy { " (inline)" } else { "" };
        out.push_str(&format!(
            "  {:<nw$}  {:<aw$}  {}{}\n",
            s.name,
            s.args,
            s.summary,
            marker,
            nw = name_w,
            aw = args_w
        ));
    }
    out.push_str("\nExamples:\n");
    for s in specs {
        out.push_str(&format!("  {:<nw$}  {}\n", s.name, s.example, nw = name_w));
    }
    out.push_str("\nUsage:\n");
    out.push_str("  rivet embed <NAME>[:args]     Render any embed from the CLI\n");
    out.push_str("  rivet docs embed-syntax       Full {{...}} syntax reference\n");
    out
}

/// Show a specific topic.
pub fn show_topic(slug: &str, format: &str) -> String {
    let Some(topic) = TOPICS.iter().find(|t| t.slug == slug) else {
        let mut out = format!("Unknown topic: {slug}\n\nAvailable topics:\n");
        for t in TOPICS {
            out.push_str(&format!("  {:<24} {}\n", t.slug, t.title));
        }
        return out;
    };

    if format == "json" {
        return serde_json::to_string_pretty(&serde_json::json!({
            "command": "docs-show",
            "topic": topic.slug,
            "title": topic.title,
            "category": topic.category,
            "content": topic.content,
        }))
        .unwrap_or_default();
    }

    let mut out = String::new();
    out.push_str(&format!("# {} — {}\n\n", topic.slug, topic.title));
    out.push_str(topic.content);
    out
}

/// Search across all documentation for a pattern (like rg).
pub fn grep_docs(pattern: &str, format: &str, context: usize) -> String {
    let pattern_lower = pattern.to_lowercase();

    let mut all_matches: Vec<GrepMatch> = Vec::new();

    for topic in TOPICS {
        for (i, line) in topic.content.lines().enumerate() {
            if line.to_lowercase().contains(&pattern_lower) {
                let lines: Vec<&str> = topic.content.lines().collect();
                let start = i.saturating_sub(context);
                let end = (i + context + 1).min(lines.len());
                let context_before: Vec<String> =
                    lines[start..i].iter().map(|l| l.to_string()).collect();
                let context_after: Vec<String> =
                    lines[(i + 1)..end].iter().map(|l| l.to_string()).collect();

                all_matches.push(GrepMatch {
                    topic: topic.slug,
                    line_num: i + 1,
                    text: line.to_string(),
                    context_before,
                    context_after,
                });
            }
        }
    }

    if format == "json" {
        let items: Vec<serde_json::Value> = all_matches
            .iter()
            .map(|m| {
                serde_json::json!({
                    "topic": m.topic,
                    "line": m.line_num,
                    "text": m.text,
                    "context_before": m.context_before,
                    "context_after": m.context_after,
                })
            })
            .collect();
        return serde_json::to_string_pretty(&serde_json::json!({
            "command": "docs-grep",
            "pattern": pattern,
            "match_count": items.len(),
            "matches": items,
        }))
        .unwrap_or_default();
    }

    if all_matches.is_empty() {
        return format!("No matches for: {pattern}\n");
    }

    let mut out = String::new();
    let mut prev_topic = "";
    for m in &all_matches {
        if m.topic != prev_topic {
            if !prev_topic.is_empty() {
                out.push_str("--\n");
            }
            prev_topic = m.topic;
        }
        for (j, cl) in m.context_before.iter().enumerate() {
            let ln = m.line_num - m.context_before.len() + j;
            out.push_str(&format!("{}:{}: {}\n", m.topic, ln, cl));
        }
        out.push_str(&format!("{}:{}> {}\n", m.topic, m.line_num, m.text));
        for (j, cl) in m.context_after.iter().enumerate() {
            out.push_str(&format!("{}:{}: {}\n", m.topic, m.line_num + 1 + j, cl));
        }
    }
    out.push_str(&format!(
        "\n{} matches across {} topics\n",
        all_matches.len(),
        {
            let mut topics: Vec<&str> = all_matches.iter().map(|m| m.topic).collect();
            topics.dedup();
            topics.len()
        }
    ));
    out
}

struct GrepMatch {
    topic: &'static str,
    line_num: usize,
    text: String,
    context_before: Vec<String>,
    context_after: Vec<String>,
}

// ── HTML export documentation ───────────────────────────────────────────

const HTML_EXPORT_DOC: &str = r#"# HTML Export — Deployment and Customization

## Overview

`rivet export --format html` generates a self-contained static site for
compliance evidence and audit publishing. The export produces 11+ HTML pages:

- **index.html** — dashboard with artifact counts, validation summary, coverage
- **requirements.html** — all artifacts grouped by type with anchor IDs
- **documents.html** — document index with links to individual document pages
- **doc-{ID}.html** — individual documents with resolved `[[ID]]` links
- **matrix.html** — traceability matrix (type x type)
- **coverage.html** — per-rule traceability coverage
- **validation.html** — diagnostics and rule check results
- **config.js** — runtime configuration (edit after deployment, no rebuild)

Pages are self-contained by default: CSS is embedded inline with no external
dependencies. The site works offline and can be served by any static HTTP server.

Runtime customization is done entirely through `config.js` — no rebuild needed.

## Generated Files

```
dist/
  config.js           # Runtime configuration (edit after deployment)
  index.html          # Dashboard with artifact counts, validation, coverage
  requirements.html   # All artifacts grouped by type with anchor IDs
  documents.html      # Document index with links to individual docs
  doc-{ID}.html       # Individual documents with resolved [[ID]] links
  matrix.html         # Traceability matrix (type x type)
  coverage.html       # Per-rule traceability coverage
  validation.html     # Diagnostics and rule check results
  README.html         # What this export is and how to customize it
```

## config.js Reference

The `config.js` file is a plain JavaScript file loaded by every page. It sets
deployment-specific values without rebuilding the HTML:

```javascript
var RIVET_EXPORT = {
  // Back-link to project portal (empty string to hide)
  homepage: "https://example.com/projects/",

  // Display name in the homepage back-link
  projectName: "My Project",

  // Current version label in the version switcher
  versionLabel: "v0.1.0",

  // Other versions for the dropdown (paths relative to this directory)
  versions: [
    { "label": "v0.1.0", "path": "../v0.1.0/" },
    { "label": "v0.2.0", "path": "../v0.2.0/" }
  ],

  // Optional: external CSS URL to replace embedded styles
  // externalCss: "/main.css",
};
```

When `config.js` is missing or `RIVET_EXPORT` is undefined, pages degrade
gracefully: the homepage link and version switcher remain hidden, and
embedded styles are used.

## CSS Classes Reference

### Layout

| Class              | Description                                     |
|--------------------|-------------------------------------------------|
| `.export-header`   | Top navigation bar wrapper                      |
| `.home-link`       | Homepage back-link (populated by config.js)      |
| `.version-switcher`| Version dropdown container                       |
| `.nav-links`       | Navigation link group (Overview, Requirements…) |
| `.summary-grid`    | Dashboard summary cards grid                     |
| `.summary-card`    | Individual summary card                          |

### Artifacts

| Class              | Description                                     |
|--------------------|-------------------------------------------------|
| `.artifact-section`| Individual artifact block                        |
| `.artifact-id`     | Artifact ID heading                              |
| `.artifact-meta`   | Metadata line (type, status)                     |
| `.type-badge`      | Artifact type badge                              |
| `.status-badge`    | Status badge                                     |
| `.badge-approved`  | Status color: approved (green)                   |
| `.badge-draft`     | Status color: draft (amber)                      |
| `.badge-default`   | Status color: fallback (muted)                   |
| `.tag`             | Artifact tag pill                                |
| `.artifact-ref`    | Clickable artifact reference link                |

### Documents

| Class                    | Description                               |
|--------------------------|-------------------------------------------|
| `.doc-card`              | Document card on index page               |
| `.doc-meta`              | Document metadata                         |
| `.doc-body`              | Rendered document content                 |
| `.artifact-embed`        | Embedded artifact card in documents       |
| `.artifact-embed-header` | Embed header (ID + type)                  |
| `.artifact-embed-title`  | Embed title line                          |
| `.artifact-embed-desc`   | Embed description block                   |

### Matrix

| Class          | Description                                        |
|----------------|----------------------------------------------------|
| `.cell-green`  | Coverage-colored cell: linked (green)               |
| `.cell-yellow` | Coverage-colored cell: partially linked (yellow)    |
| `.cell-red`    | Coverage-colored cell: missing link (red)           |

### Validation

| Class              | Description                                     |
|--------------------|-------------------------------------------------|
| `.diag-list`       | Diagnostics list                                 |
| `.diag-rule`       | Rule name in diagnostic                          |
| `.severity-error`  | Severity color: error (red)                      |
| `.severity-warning`| Severity color: warning (amber)                  |
| `.severity-info`   | Severity color: info (accent blue)               |

### Table of Contents

| Class        | Description                                          |
|--------------|------------------------------------------------------|
| `.toc`       | Table of contents container                          |
| `.toc-item`  | Individual TOC entry                                 |

## Theming

CSS custom properties control all colors and fonts. Override them in an
external stylesheet to match your organization's branding:

```css
:root {
  --bg: #0f1117;
  --bg-card: rgba(26, 29, 39, 0.72);
  --border: #252836;
  --text: #e1e4ed;
  --text-muted: #8b90a0;
  --accent: #6c8cff;
  --green: #4ade80;
  --amber: #fbbf24;
  --red: #f87171;
  --font: "Atkinson Hyperlegible Next", system-ui, sans-serif;
  --font-mono: "Atkinson Hyperlegible Mono", monospace;
  --radius: 12px;
}
```

To use an external CSS file from a parent site:

```javascript
// In config.js
var RIVET_EXPORT = {
  externalCss: "/main.css",  // replaces embedded styles
};
```

When `externalCss` is set, all embedded `<style>` tags are removed and a
`<link rel="stylesheet">` is injected pointing to the given URL. This lets
you maintain a single CSS source for your entire site.

## Deployment Examples

### Static hosting (any web server)

```bash
rivet export --format html --output dist/
# Copy to web server
scp -r dist/ server:/var/www/compliance/
# Edit config.js on the server
```

### GitHub Pages

```bash
rivet export --format html --output docs/compliance/
git add docs/compliance/
git push  # GitHub Pages serves it
```

### Under a parent site (e.g., pulseengine.eu)

```bash
rivet export --format html --output dist/
cp -r dist/ /srv/pulseengine.eu/release/rivet/v0.1.0/compliance/
# Edit config.js:
# homepage: "https://pulseengine.eu/projects/"
# externalCss: "/main.css"
```

### Multiple versions side by side

```
/release/rivet/
  v0.1.0/compliance/  <- config.js has versions pointing to siblings
  v0.2.0/compliance/
  latest/compliance/   <- symlink to current
```

## CLI Flags

```
rivet export --format html [OPTIONS]

Options:
  --output <DIR>           Output directory (default: dist/)
  --single-page            All reports in one HTML file
  --theme <dark|light>     Color theme (default: dark)
  --offline                Use system fonts (no Google Fonts)
  --homepage <URL>         Homepage URL written to config.js
  --version-label <LABEL>  Version label written to config.js
  --versions <JSON>        Version entries written to config.js
```

When `--single-page` is used, all reports are combined into a single
`index.html` with internal anchors.  `config.js` is not generated in
single-page mode (everything is inline).
"#;

// ── MCP server documentation ────────────────────────────────────────────

const MCP_DOC: &str = r#"# MCP Server — Wire Format, Tool Catalog, and Smoke Tests

## Overview

`rivet mcp` exposes the typed-graph (artifacts, links, schemas, validation,
coverage, snapshots) to MCP-speaking clients — Claude Code, Cursor, custom
agents — via the [Model Context Protocol](https://modelcontextprotocol.io/).
The server runs in-process: it loads the project once, caches the store /
schema / link graph, and serves all subsequent tool calls from that cache.

The server has no network surface. Transport is stdio: the client launches
`rivet mcp` as a child process and exchanges JSON-RPC messages over the
child's stdin / stdout. Mutations land in the project's YAML files on disk;
the cache is refreshed on demand via the `rivet_reload` tool.

For a list of every tool the server advertises with one-line summaries, run
`rivet mcp --list-tools`. For a quick "is the server reachable from my
project?" smoke test, run `rivet mcp --probe`. Both are described below.

## Wire Format

The wire format is **line-delimited JSON-RPC 2.0** over stdio. Each message
is one line of JSON terminated by `\n`. There is **no** Content-Length
framing of the kind LSP uses — clients that wrap the transport with LSP
framing will see no responses and time out.

A message is either a request (has `id`), a response (has `id` and either
`result` or `error`), or a notification (no `id`, no response expected).

```
{"jsonrpc":"2.0","id":1,"method":"initialize","params":{...}}\n
{"jsonrpc":"2.0","id":1,"result":{...}}\n
{"jsonrpc":"2.0","method":"notifications/initialized"}\n
{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}\n
```

Anything emitted on stderr is diagnostic / log output; clients should
forward it to their own logs but never parse it as JSON-RPC.

## The 3-Message Handshake

Every session starts with the same handshake. The middle message is a
**notification** — no `id`, no response — and is easy to forget. Servers
that follow the spec strictly will reject `tools/list` until they see it.

1. **Client → server**: `initialize` request. The client declares its
   protocol version and capabilities.

   ```json
   {
     "jsonrpc": "2.0",
     "id": 1,
     "method": "initialize",
     "params": {
       "protocolVersion": "2024-11-05",
       "capabilities": {},
       "clientInfo": {"name": "my-client", "version": "0.1.0"}
     }
   }
   ```

2. **Server → client**: `initialize` response. Lists the server's
   capabilities (rivet advertises `tools` and `resources`).

   ```json
   {
     "jsonrpc": "2.0",
     "id": 1,
     "result": {
       "protocolVersion": "2024-11-05",
       "capabilities": {"tools": {...}, "resources": {...}},
       "serverInfo": {"name": "rivet", "version": "0.5.0"}
     }
   }
   ```

3. **Client → server**: `notifications/initialized` notification. **No
   id, no response.** This is the gate — the server treats it as the
   client's signal that it is ready to receive tool calls.

   ```json
   {"jsonrpc": "2.0", "method": "notifications/initialized"}
   ```

After the notification, the client may freely send `tools/list`,
`tools/call`, `resources/list`, and `resources/read` requests.

## The 15-Tool Catalog

The server registers fifteen tools. The authoritative listing — including
the full input schema for each — is `rivet mcp --list-tools` (text) or
`rivet mcp --list-tools --format json` (the JSON-RPC `tools/list` payload).

| Tool                    | Purpose                                                  | Inputs (required first)                |
|-------------------------|----------------------------------------------------------|----------------------------------------|
| `rivet_validate`        | Run validators, return PASS / FAIL with diagnostics      | (none)                                 |
| `rivet_list`            | List artifacts, optional type / status filters           | `type_filter?`, `status_filter?`       |
| `rivet_get`             | Fetch one artifact (fields, links, metadata)             | `id`                                   |
| `rivet_stats`           | Counts by type, orphans, broken-link totals              | (none)                                 |
| `rivet_coverage`        | Per-rule traceability coverage                           | `rule?`                                |
| `rivet_schema`          | Artifact types, link types, traceability rules           | `type?`                                |
| `rivet_query`           | S-expression filter; matches with full bodies            | `filter`, `limit?`                     |
| `rivet_embed`           | Resolve a `{{...}}` embed (e.g. `coverage:matrix`)       | `query`                                |
| `rivet_snapshot_capture`| Persist a validation snapshot for delta tracking         | `name?`                                |
| `rivet_add`             | Insert a new artifact via CST mutation                   | `type`, `title`, `status?`, ...        |
| `rivet_modify`          | Mutate fields / status / tags on an existing artifact    | `id`, then any of the setters          |
| `rivet_link`            | Add a typed link between two artifacts                   | `source`, `link_type`, `target`        |
| `rivet_unlink`          | Remove a typed link                                      | `source`, `link_type`, `target`        |
| `rivet_remove`          | Delete an artifact (refuses if backlinked unless force)  | `id`, `force?`                         |
| `rivet_reload`          | Reload the cache from disk after external file changes   | (none)                                 |

The first nine tools are read-only and run against the cache. The next
five mutate YAML on disk and require a `rivet_reload` afterwards (see
"Mutation Convention" below). `rivet_reload` itself is the cache primitive.

In addition to tools, the server publishes two **resources**:

- `rivet://diagnostics` — the JSON of the latest validation run.
- `rivet://coverage` — the JSON of the latest coverage report.
- `rivet://artifacts/{id}` — the JSON of a single artifact (computed on read).

## Response Envelope Gotcha

`tools/call` replies look like:

```json
{
  "jsonrpc": "2.0",
  "id": 17,
  "result": {
    "content": [
      {"type": "text", "text": "{\"count\": 759, \"artifacts\": [...]}"}
    ],
    "isError": false
  }
}
```

The structured payload — the actual artifact list, diagnostic dump, etc. —
arrives as a **stringified JSON document inside `result.content[0].text`**.
Clients must parse that string a second time to get a usable object. This
is intentional on the MCP side (the `text` content type is reserved for
LLM-readable strings), but it surprises everyone the first time. A
typed-content variant is on the MCP roadmap; until then, every client
that wants structured output writes:

```python
result = call_tool("rivet_list", {})
payload = json.loads(result["content"][0]["text"])
```

`rivet mcp --probe` does this parse for you and prints the inner JSON
directly, which is one of the reasons it exists.

## Smoke-Test Recipes

Three ways to verify a server is reachable, in order of effort.

### 1. `rivet mcp --list-tools`

The fastest sanity check — does not start the server, does not need a
project. Just enumerates the tool catalog the server would advertise.

```
$ rivet mcp --list-tools
rivet MCP server — 15 registered tools

  rivet_add
    Add a new artifact to the project via CST mutation. Call rivet_reload after.
    params: description?, fields?, links?, status?, tags?, title, type
  ...
```

For the JSON-RPC `tools/list` payload exactly as the wire server would
return it (useful for unit-testing client code without a subprocess):

```
$ rivet mcp --list-tools --format json | jq '.result.tools[].name'
"rivet_add"
"rivet_coverage"
...
```

### 2. `rivet mcp --probe`

Runs the in-process equivalent of `tools/call rivet_list` (no arguments)
against the current project and prints the decoded payload. Confirms the
project loads, the schema parses, and the cache populates — i.e. that
the same code path a real MCP client would hit actually returns artifacts.

```
$ rivet mcp --probe
{
  "count": 759,
  "artifacts": [
    {"id": "REQ-001", "type": "requirement", ...},
    ...
  ]
}
```

Exits non-zero if the project fails to load. Pair with `--project <path>`
to probe a project other than the current directory.

### 3. Bash-Only Wire Test

For clients that want to verify the wire shape directly, pipe JSON-RPC
into `rivet mcp` and read the responses back out. This is the only
recipe that exercises the actual stdio transport:

```bash
{
  printf '%s\n' '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"sh","version":"0"}}}'
  printf '%s\n' '{"jsonrpc":"2.0","method":"notifications/initialized"}'
  printf '%s\n' '{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}'
  sleep 0.5
} | rivet mcp 2>/dev/null | head -3
```

You should see three JSON lines: an `initialize` response, no body for
the notification (the server emits nothing for notifications), then a
`tools/list` response with the fifteen tools embedded in
`result.tools`. The `sleep` is needed because the server reads stdin
until EOF and would otherwise block waiting for the next request.

## Mutation Convention

The five mutation tools — `rivet_add`, `rivet_modify`, `rivet_link`,
`rivet_unlink`, `rivet_remove` — write directly to the project's YAML
files via the same CST-preserving mutator the CLI uses. They do **not**
update the in-memory cache that the read tools serve from.

Right after a successful mutation, the client must call `rivet_reload`
to refresh the cache. Otherwise subsequent `rivet_list`, `rivet_get`,
`rivet_validate`, etc. will return stale data — they will not see the
artifact that was just added, or will still see the link that was just
removed.

```
rivet_add { ... }       → file changes on disk, cache stale
rivet_reload            → cache repopulates from disk
rivet_validate          → fresh diagnostics, includes the new artifact
```

This split exists by design: the mutator runs in milliseconds, while
`rivet_reload` walks the full project (parser, schema check, link graph
rebuild). Batching N mutations + 1 reload at the end is much cheaper
than reloading after each one. Audit log entries (under
`.rivet/mcp-audit.jsonl`) are written immediately by the mutators
regardless — reload state does not affect the audit trail.

## Pointers

- MCP specification: <https://modelcontextprotocol.io/>
- Crate used by rivet: `rmcp` — <https://crates.io/crates/rmcp>
- Integration tests: `rivet-cli/tests/mcp_integration.rs`
- CLI reference: `rivet docs cli`
- Mutation semantics: `rivet docs mutation`

Related: [[FEAT-010]], [[REQ-007]], [[REQ-047]]
"#;

// ── Phase 3 documentation topics ────────────────────────────────────────

const MUTATION_DOC: &str = r#"# CLI Mutation Commands

Schema-validated artifact management from the command line.
All mutations are validated against the loaded schema BEFORE any file is written.
If validation fails, no file is touched.

## Commands

### `rivet add`

Create a new artifact with auto-generated ID:

    rivet add --type requirement --title "My requirement" --status draft --tags safety,core
    # → Created REQ-032

Options: `--type` (required), `--title` (required), `--status`, `--tags t1,t2`,
`--field key=value` (repeatable), `--file <target.yaml>`.

### `rivet modify`

Update an existing artifact's fields:

    rivet modify REQ-023 --set-status approved --add-tag verified
    rivet modify DD-018 --set-field rationale="Updated rationale"

### `rivet link`

Add a traceability link between artifacts:

    rivet link REQ-023 --type satisfies --target SC-12
    # Validates: both IDs exist, link type valid for source→target types

### `rivet unlink`

Remove an existing link:

    rivet unlink REQ-023 --type satisfies --target SC-12

### `rivet remove`

Remove an artifact (checks for incoming links):

    rivet remove FEAT-042          # Refuses if other artifacts link to it
    rivet remove FEAT-042 --force  # Removes anyway, warns about broken links

### `rivet next-id`

Compute the next available ID for a type or prefix:

    rivet next-id --type requirement   # → REQ-032
    rivet next-id --prefix FEAT        # → FEAT-058
    rivet next-id --type requirement --format json

## Validation

Every mutation validates against the loaded schema:
- **add**: type exists, ID unique, required fields present, status in allowed values
- **link**: source and target exist, link type exists, valid for source→target types
- **modify**: artifact exists, new values conform to schema
- **remove**: artifact exists, no incoming links (unless --force)

Related: [[REQ-031]], [[DD-028]], [[FEAT-052]]..[[FEAT-056]]
"#;

const CONDITIONAL_RULES_DOC: &str = r#"# Conditional Validation Rules

Schema extension for state-dependent validation using `when`/`then` syntax.

## Schema Syntax

```yaml
conditional-rules:
  - name: approved-requires-verification-criteria
    description: Approved requirements must have verification criteria
    when:
      field: status
      equals: approved
    then:
      required-fields: [verification-criteria]
    severity: error

  - name: asil-requires-mitigation
    when:
      field: safety
      matches: "ASIL_.*"
    then:
      required-links: [mitigated_by]
    severity: warning
```

## Condition Types

- **equals**: `{ field: <name>, equals: <value> }` — exact string match
- **matches**: `{ field: <name>, matches: <regex> }` — regex pattern match
- **exists**: `{ field: <name>, exists: true }` — field is present and non-empty

## Requirement Types

- **required-fields**: `{ required-fields: [field1, field2] }` — fields must be present
- **required-links**: `{ required-links: [link_type1] }` — outgoing links of type must exist

## Rule Consistency

At schema load time, rivet checks that conditional rules don't contradict
each other. If two rules with the same condition impose conflicting
requirements, the schema is rejected with a diagnostic.

Related: [[REQ-023]], [[DD-018]], [[FEAT-040]]
"#;

const IMPACT_DOC: &str = r#"# Change Impact Analysis

Detect which artifacts changed and compute the transitive set of affected
artifacts via the link graph.

## Usage

    rivet impact --since main           # Compare against main branch
    rivet impact --since v0.5.0         # Compare against a tag
    rivet impact --baseline ./old/      # Compare against a directory
    rivet impact --since HEAD~5 --depth 2  # Limit traversal depth
    rivet impact --since main --format json

## How It Works

1. **Content hashing**: Each artifact gets a deterministic hash of its
   title, description, status, fields, tags, and links.
2. **Diff**: Changed artifacts are those with different hashes between
   current state and baseline.
3. **BFS traversal**: From each changed artifact, walks the link graph
   (both forward and backward links) to find affected artifacts.
4. **Depth separation**: Direct dependents (depth 1) vs transitive (depth 2+).

## Output

    Changed artifacts (2):
      REQ-023  (status: draft → approved)
      DD-018   (description modified)

    Directly affected (1):
      FEAT-040 (← satisfies REQ-023)

    Impact summary: 2 changed, 1 direct, 0 transitive, 3 total

Related: [[REQ-024]], [[DD-019]], [[FEAT-041]]
"#;

const NEEDS_JSON_DOC: &str = r#"# sphinx-needs JSON Import

Import artifacts from sphinx-needs `needs.json` export files. Provides a
migration path for projects using sphinx-needs-based toolchains like
Eclipse SCORE.

## Configuration

```yaml
sources:
  - path: imported/needs.json
    format: needs-json
    config:
      type-mapping.stkh_req: stkh-req
      type-mapping.comp_req: comp-req
      type-mapping.sw_req: sw-req
      id-transform: underscores-to-dashes
      link-type: satisfies
```

## Options

- **type-mapping.<src>: <dst>** — Map sphinx-needs type names to rivet schema
  types. Unmapped types default to underscore-to-dash conversion.
- **id-transform** — `underscores-to-dashes` (default) or `preserve`.
- **link-type** — Link type for the `links` array (default: `satisfies`).

## How It Works

1. Parses the `needs.json` structure (versions → needs map)
2. Applies type mapping and ID transform to each need
3. Converts `links` arrays to rivet `Link` structs
4. Preserves extra fields (excluding sphinx-needs display metadata)
5. Returns `Vec<Artifact>` ready for the standard pipeline

## Migrating from sphinx-needs

1. Export: `sphinx-build -b needs . _build` (produces `needs.json`)
2. Add to rivet.yaml with type mappings matching your sphinx-needs types
3. Run `rivet validate` to check all links resolve
4. Iterate on type mappings until validation passes

Related: [[REQ-025]], [[DD-020]], [[FEAT-042]]
"#;

const BAZEL_DOC: &str = r#"# Bazel MODULE.bazel Integration

Parse Bazel MODULE.bazel files to discover cross-repo dependencies for
traceability validation without requiring Bazel to be installed.

## Supported Constructs

The parser handles the MODULE.bazel subset of Starlark:

- `module(name, version, compatibility_level)`
- `bazel_dep(name, version, dev_dependency)`
- `git_override(module_name, remote, commit)`
- `archive_override(module_name, urls, strip_prefix, integrity)`
- `local_path_override(module_name, path)`
- `single_version_override(module_name, version)`

Unsupported constructs (`load()`, variable assignments, conditionals) emit
diagnostics and parsing continues with error recovery.

## Architecture

Three-layer parser using rowan for lossless CST:

1. **Lexer** — Hand-written tokenizer producing `(SyntaxKind, &str)` pairs
2. **Parser** — Recursive descent building rowan `GreenNode` CST
3. **HIR** — Typed extraction: `BazelModule` with deps and overrides

## Usage

```rust
use rivet_core::bazel::parse_module_bazel;

let module = parse_module_bazel(source);
for dep in &module.deps {
    println!("{} @ {}", dep.name, dep.version);
}
for d in &module.diagnostics {
    eprintln!("warning: {}", d);
}
```

Related: [[REQ-027]], [[REQ-028]], [[DD-023]], [[FEAT-046]]
"#;

const FORMAL_VERIFICATION_DOC: &str = r#"# Formal Verification

Rivet uses a three-layer verification pyramid to prove correctness of its
validation engine, supporting ISO 26262 tool qualification at TCL 1.

## Layer 1: Kani (Bounded Model Checking)

Proof harnesses in `rivet-core/src/proofs.rs` behind `#[cfg(kani)]`.
Proves absence of panics and basic properties for core algorithms:

- `parse_artifact_ref()` — no panics for any string input
- `Store::insert()` — no panics, duplicates return error
- `Schema::merge()` — idempotent, no panics
- `compute_coverage()` — percentage always in [0.0, 100.0]
- `LinkGraph` — orphan detection, cycle detection correctness

Run: `cargo kani -p rivet-core` (requires Kani installation)

## Layer 2: Verus (Functional Correctness) — Planned

Inline `requires`/`ensures` annotations proving:
- Soundness: PASS implies all rules satisfied
- Completeness: rule violated implies diagnostic emitted
- Backlink symmetry: forward A→B implies backward B←A

## Layer 3: Rocq (Metamodel Proofs) — Planned

Schema semantics modeled in Rocq via coq-of-rust:
- Schema satisfiability (rules not contradictory)
- ASPICE V-model completeness
- Validation termination

Related: [[REQ-030]], [[DD-025]]..[[DD-027]], [[FEAT-049]]..[[FEAT-051]]
"#;

// ── Embed syntax documentation ─────────────────────────────────────────

const EMBED_SYNTAX_DOC: &str = r#"# Computed Embed Syntax

Rivet documents and the CLI support `{{name}}` syntax for embedding live
project data. Embeds are resolved at render time (dashboard, HTML export)
or via `rivet embed QUERY`.

## CLI Usage

```
rivet embed stats              # full stats table (text)
rivet embed stats:types        # artifact counts by type
rivet embed coverage -f html   # coverage bars as HTML fragment
```

## Embed Types

### {{stats}} — Project statistics

```markdown
{{stats}}               Full stats table (types, status, validation)
{{stats:types}}         Artifact counts by type only
{{stats:status}}        Counts by status only
{{stats:validation}}    Validation summary only
```

### {{coverage}} — Traceability coverage

```markdown
{{coverage}}            All traceability rules with percentage bars
{{coverage:rule-name}}  Single rule with uncovered artifact IDs
```

### {{diagnostics}} — Validation diagnostics

```markdown
{{diagnostics}}         All validation issues (errors + warnings)
{{diagnostics:error}}   Errors only
{{diagnostics:warning}} Warnings only
```

### {{matrix}} — Traceability matrix

```markdown
{{matrix}}                          One matrix per traceability rule
{{matrix:requirement:feature}}      Specific source-to-target matrix
```

### {{artifact:ID}} — Inline artifact card

```markdown
{{artifact:REQ-001}}          Compact artifact card (ID, type, title)
{{artifact:REQ-001:full}}     Full card with description, tags, links
```

### {{links:ID}} — Link table for an artifact

```markdown
{{links:REQ-001}}             Incoming and outgoing link table
```

### {{table:TYPE:FIELDS}} — Filtered artifact table

```markdown
{{table:requirement:id,title,status}}         Table of requirements
{{table:hazard:id,title,description}}         Table of hazards
```

Generates an HTML/text table listing all artifacts of TYPE with the
specified FIELDS as columns. Fields are resolved from the artifact's
standard properties (id, title, status, type, tags) and custom fields.

## Error Handling

- Unknown embed names render as a visible `embed-error` element
- Malformed queries (missing colon separator, unknown sub-key) produce
  a descriptive error message in the output
- Embeds never silently produce empty output

## In HTML Export

Computed embeds in exported HTML include a provenance footer with the
git commit hash and timestamp, so reviewers can trace when the data
was generated.

## In the Dashboard

Embeds are resolved server-side and injected into the document view.
They update live when artifacts change (no page reload needed in the
HTMX dashboard).

## Security

- Embed names are a fixed allow-list; no user-defined embeds
- No embed can trigger file I/O, shell execution, or unbounded computation
- See STPA-Sec constraint SSC-IMPL-003
"#;

// ── Schemas overview documentation ─────────────────────────────────────

const SCHEMAS_OVERVIEW_DOC: &str = r#"# Schemas Overview

Rivet ships 13 built-in schemas covering safety, automotive, AI compliance,
cybersecurity, supply chain, and general development. Schemas are loaded by
name in `rivet.yaml` and merged in order.

## Core Schemas

| Schema         | Types | Preset           | Description                              |
|----------------|-------|------------------|------------------------------------------|
| common         | 0     | (all presets)    | Base fields (id, title, status, tags, links) and 8 link types |
| dev            | 3     | `dev`            | requirement, design-decision, feature    |
| research       | 5     | —                | market-analysis, patent, tech-eval, competitor-analysis, academic-ref |
| supply-chain   | 4     | —                | sbom-component, build-attestation, vulnerability, release-artifact (CRA, SBOM, SLSA) |

## Safety Schemas

| Schema         | Types | Preset           | Description                              |
|----------------|-------|------------------|------------------------------------------|
| stpa           | 10    | `stpa`           | STPA Steps 1-4: losses, hazards, system-constraints, control-structure, UCAs, controller-constraints, loss-scenarios |
| stpa-sec       | 6     | —                | STPA-Sec extension: sec-loss, sec-hazard, sec-constraint, sec-uca, sec-scenario, sec-control-action (CIA triad, attacker model) |
| stpa-ai        | 5     | `stpa-ai`        | STPA-for-AI: ml-data-source, ml-hazard, ml-uca, ml-scenario, ml-monitor (training provenance, retraining loops) |
| safety-case    | 6     | `safety-case`    | GSN v3: goal, strategy, solution, context, justification, away-goal |

## Automotive and Industrial Schemas

| Schema         | Types | Preset           | Description                              |
|----------------|-------|------------------|------------------------------------------|
| aspice         | 14    | `aspice`         | Automotive SPICE 4.0: SYS.1-5, SWE.1-6 (V-model from stakeholder req to verification) |
| cybersecurity  | 10    | `cybersecurity`  | ISO 21434 / UNECE R155: SEC.1-4, TARA, cybersecurity goals, claims, controls |
| aadl           | 3     | `aadl`           | AADL architecture: aadl-component, aadl-analysis, aadl-flow (via spar integration) |
| score          | 20    | —                | Eclipse SCORE metamodel: ISO 26262 V-model, FMEA, DFA, process support |

## Regulatory Schemas

| Schema         | Types | Preset           | Description                              |
|----------------|-------|------------------|------------------------------------------|
| eu-ai-act      | 8     | `eu-ai-act`      | EU AI Act Annex IV: risk-assessment, risk-mitigation, data-governance, human-oversight, accuracy-spec, robustness-spec, transparency-doc, post-market-plan |

## Bridge Schemas

Bridge schemas add cross-domain link types and traceability rules between
two schemas. They are loaded automatically when both schemas are present,
or can be added explicitly.

| Bridge                          | Connects              | Key link types                          |
|---------------------------------|-----------------------|-----------------------------------------|
| eu-ai-act-stpa.bridge           | eu-ai-act + stpa      | risk-identified-by-stpa, mitigation-from-constraint |
| eu-ai-act-aspice.bridge         | eu-ai-act + aspice    | ai-req-traces-to-stkh, ai-verified-by   |
| safety-case-stpa.bridge         | safety-case + stpa    | goal-supported-by-analysis, solution-from-constraint |
| safety-case-eu-ai-act.bridge    | safety-case + eu-ai-act | goal-for-compliance, solution-from-assessment |
| stpa-dev.bridge                 | stpa + dev            | hazard-traces-to-req, constraint-implements-req |
| supply-chain-dev.bridge         | supply-chain + dev    | requirement-addresses-vulnerability, feature-produces-release |

Bridge files live in `schemas/` with the `.bridge.yaml` extension.

## Presets

`rivet init --preset NAME` configures schemas automatically:

| Preset         | Schemas loaded                  |
|----------------|---------------------------------|
| dev            | common, dev                     |
| aspice         | common, aspice                  |
| stpa           | common, stpa                    |
| stpa-ai        | common, stpa, stpa-ai           |
| cybersecurity  | common, cybersecurity           |
| aadl           | common, dev, aadl               |
| eu-ai-act      | common, eu-ai-act               |
| safety-case    | common, safety-case             |

## Combining Schemas

Schemas are additive. List multiple schemas to combine domains:

```yaml
project:
  schemas:
    - common
    - stpa
    - stpa-sec
    - eu-ai-act       # adds AI Act types
    # Bridge loaded automatically when both eu-ai-act and stpa are present
```

## Validation Features

Schemas drive validation. Key diagnostic rules include:

- **unknown-type** — artifact uses a type not defined in any loaded schema
- **unknown-link-type** — link uses a type not in the schema
- **unknown-field** — artifact has a field not declared for its type
- **type-aware coercion** — field values are coerced to the declared type
  (e.g., `"42"` to `42` for number fields) before validation
- **conditional rules** — `when`/`then` rules enforce state-dependent requirements
  (see `rivet docs conditional-rules`)
- **traceability rules** — schemas define required link chains (e.g., every
  requirement must be verified-by at least one test)
"#;

// ── Schema doc constants (concat with references) ──────────────────────

const EU_AI_ACT_DOC: &str = concat!(
    include_str!("../../schemas/eu-ai-act.yaml"),
    r#"

## References

- EU AI Act full text: https://artificialintelligenceact.eu/
- Annex IV (Technical Documentation): https://artificialintelligenceact.eu/annex/4/
- Article 9 (Risk Management): https://artificialintelligenceact.eu/article/9/
"#
);

const SAFETY_CASE_DOC: &str = concat!(
    include_str!("../../schemas/safety-case.yaml"),
    r#"

## References

- GSN Community Standard v3 (2021).
  https://scsc.uk/gsn
- Kelly, T.P. (1998). *Arguing Safety — A Systematic Approach to
  Managing Safety Cases*. PhD thesis, University of York.
"#
);

const STPA_AI_DOC: &str = concat!(
    include_str!("../../schemas/stpa-ai.yaml"),
    r#"

## References

- Leveson, N.G. & Thomas, J.P. (2018). *STPA Handbook*.
- Abdulkhaleq, A. et al. STPA for ML-based systems.
- ISO/IEC 23894:2023 — AI Risk Management.
"#
);

const STPA_SEC_DOC: &str = concat!(
    include_str!("../../schemas/stpa-sec.yaml"),
    r#"

## References

- Leveson, N.G. & Thomas, J.P. (2018). *STPA Handbook*, Chapter 2
  (security extension).
- Young, W. & Leveson, N.G. (2014). *An Integrated Approach to Safety
  and Security Based on Systems Theory*. CACM 57(2).
"#
);

const SUPPLY_CHAIN_DOC: &str = concat!(
    include_str!("../../schemas/supply-chain.yaml"),
    r#"

# Supply Chain Schema

## What it covers

The supply-chain schema tracks four categories of software supply chain
artifacts for regulatory compliance (EU Cyber Resilience Act, NTIA SBOM,
SLSA):

- **SBOM components** (`sbom-component`) — software bill of materials entries
  with name, version, license (SPDX), package URL (purl), and supplier.
- **Build attestations** (`build-attestation`) — SLSA-style provenance
  linking a release artifact to its builder, source repo, commit ref, and
  cryptographic digest.
- **Vulnerabilities** (`vulnerability`) — known CVEs with severity (CVSS),
  remediation status, and links to affected components.
- **Release artifacts** (`release-artifact`) — binaries, containers, or
  packages with digest, signing status, and SBOM component manifest.

## Enabling the schema

Add `supply-chain` to the `schemas` list in `rivet.yaml`:

```yaml
project:
  name: my-project
  schemas:
    - common
    - dev
    - supply-chain         # adds SBOM, attestation, vuln, release types
```

To also bridge supply chain artifacts to dev requirements and features,
both schemas will automatically load the `supply-chain-dev.bridge` which
adds `requirement-addresses-vulnerability` and `feature-produces-release`
link types.

## Example artifacts

### SBOM component

```yaml
artifacts:
  - id: SBOM-001
    type: sbom-component
    title: serde
    status: active
    fields:
      component-name: serde
      version: "1.0.200"
      license: MIT OR Apache-2.0
      purl: pkg:cargo/serde@1.0.200
      supplier: David Tolnay
```

### Build attestation

```yaml
artifacts:
  - id: BA-001
    type: build-attestation
    title: v1.2.3 release build
    status: active
    fields:
      builder: github-actions
      source-repo: https://github.com/org/repo
      source-ref: abc123def456
      digest: sha256:deadbeef...
      build-timestamp: "2026-03-15T10:30:00Z"
      slsa-level: "3"
    links:
      - type: attests-build-of
        target: REL-001
```

### Vulnerability

```yaml
artifacts:
  - id: VULN-001
    type: vulnerability
    title: "CVE-2025-12345: buffer overflow in libfoo"
    status: active
    fields:
      cve-id: CVE-2025-12345
      severity: high
      cvss-score: "8.1"
      vuln-status: investigating
      remediation: Upgrade libfoo to >= 2.1.0
    links:
      - type: affects
        target: SBOM-042
```

### Release artifact

```yaml
artifacts:
  - id: REL-001
    type: release-artifact
    title: myapp-v1.2.3-linux-x86_64.tar.gz
    status: active
    fields:
      artifact-name: myapp-v1.2.3-linux-x86_64.tar.gz
      version: "1.2.3"
      digest: sha256:deadbeef...
      signing-status: signed
      artifact-type: archive
    links:
      - type: contains
        target: SBOM-001
      - type: contains
        target: SBOM-002
```

## Link types

| Link type              | Inverse              | Description                                     |
|------------------------|----------------------|-------------------------------------------------|
| `attests-build-of`     | `build-attested-by`  | Build attestation certifies provenance of release |
| `affects`              | `affected-by`        | Vulnerability affects an SBOM component          |
| `contains`             | `contained-in`       | Release artifact contains an SBOM component      |

With the `supply-chain-dev` bridge:

| Link type                            | Inverse                              | Description                                       |
|--------------------------------------|--------------------------------------|---------------------------------------------------|
| `requirement-addresses-vulnerability`| `vulnerability-addressed-by-requirement` | Requirement addresses a known vulnerability   |
| `feature-produces-release`           | `release-produced-by-feature`        | Feature produces a release artifact               |

## Traceability rules

| Rule                               | Severity | Description                                          |
|------------------------------------|----------|------------------------------------------------------|
| `release-has-attestation`          | warning  | Every release artifact should have a build attestation |
| `vulnerability-has-affected-component` | error | Every vulnerability must link to an affected component |
| `critical-vuln-has-requirement`    | warning  | Critical/high vulns should be addressed by a requirement (bridge) |

## References

- EU Cyber Resilience Act (CRA):
  https://digital-strategy.ec.europa.eu/en/policies/cyber-resilience-act
- NTIA SBOM Minimum Elements:
  https://www.ntia.gov/page/software-bill-materials
- SLSA (Supply-chain Levels for Software Artifacts):
  https://slsa.dev/
- in-toto attestation framework:
  https://in-toto.io/
"#
);

const QUICKSTART_DOC: &str = include_str!("quickstart.md");
