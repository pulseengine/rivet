//! `rivet docs` — built-in searchable documentation.
//!
//! All documentation is embedded in the binary. Topics are searchable
//! via `rivet docs --grep <pattern>` (like a built-in rg).

use rivet_core::embedded;

// ── Topic registry ──────────────────────────────────────────────────────

struct DocTopic {
    slug: &'static str,
    title: &'static str,
    category: &'static str,
    content: &'static str,
}

const TOPICS: &[DocTopic] = &[
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
        slug: "commit-traceability",
        title: "Commit-to-artifact traceability via git trailers",
        category: "Reference",
        content: COMMIT_TRACEABILITY_DOC,
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
        slug: "cross-repo",
        title: "Cross-Repository Linking",
        category: "Reference",
        content: CROSS_REPO_DOC,
    },
    DocTopic {
        slug: "formal-verification",
        title: "Formal Verification with Rocq (Coq)",
        category: "Methodology",
        content: FORMAL_VERIFICATION_DOC,
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
  - docs

results: results            # Test results directory (JUnit XML, LCOV)
```

## Available Schemas

| Name           | Types | Description                        |
|----------------|-------|------------------------------------|
| common         | 0     | Base fields, 8 link types          |
| dev            | 3     | requirement, design-decision, feature |
| stpa           | 10    | STPA losses through scenarios      |
| aspice         | 14    | ASPICE 4.0 SYS.1-5, SWE.1-6       |
| cybersecurity  | 10    | SEC.1-4, TARA, ISO 21434           |
| aadl           | 3     | AADL components, analysis, flows   |

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
rivet stats                 Summary statistics and orphan detection
rivet coverage              Traceability coverage report
rivet matrix --from X --to Y  Traceability matrix between types
rivet diff                  Compare artifact versions
rivet export -f FORMAT      Export to reqif or generic-yaml
rivet serve [-P PORT]       Start HTMX dashboard (default: 3000)
rivet commits [--since N]   Commit-artifact traceability analysis
rivet commit-msg-check F    Validate commit message trailers (hook)
```

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
rivet stats --format json
rivet coverage --format json
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

const FORMAL_VERIFICATION_DOC: &str = r#"# Formal Verification with Rocq (Coq)

## Overview

Rivet's validation engine semantics are formally verified using the
Rocq theorem prover (formerly Coq). The proofs live in `proofs/rocq/`
and are compiled via Bazel using `rules_rocq_rust`.

This provides mechanized guarantees that go beyond testing:
properties hold for **all** possible inputs, not just test cases.

## What Is Verified

### Schema.v — Core Metamodel (10 theorems)

| Theorem | Property |
|---------|----------|
| `schema_satisfiable` | Any rule set admits a valid store |
| `monotonicity_non_source` | Adding non-source artifacts preserves validity |
| `validation_work_add_one` | Validation work is O(n * rules) |
| `broken_link_detection_sound` | All broken links are reported |
| `insert_then_get` | Inserted artifacts are retrievable |
| `insert_preserves_old` | Insert does not affect other artifacts |
| `insert_duplicate_fails` | Duplicate IDs are rejected |
| `backlink_from_forward_link` | Forward links induce backlinks |
| `vmodel_chain_two_steps` | Rule chains imply reachability |
| `store_get_in` | Known artifacts are findable (unique IDs) |

### Validation.v — Engine Properties

| Theorem | Property |
|---------|----------|
| `validation_deterministic` | Same input produces same output |
| `empty_store_no_diagnostics` | Empty store is always clean |
| `check_broken_links_reports` | Broken links produce error diagnostics |
| `check_broken_links_clean` | Valid links produce no diagnostics |
| `check_broken_links_length` | At most one diagnostic per link |
| `check_artifact_rules_length` | At most one diagnostic per rule |

## Correspondence to Rust Code

The Rocq specifications model these Rust types:

| Rocq Type | Rust Type | Source |
|-----------|-----------|--------|
| `Artifact` | `model::Artifact` | `rivet-core/src/model.rs` |
| `Link` | `model::Link` | `rivet-core/src/model.rs` |
| `Store` | `store::Store` | `rivet-core/src/store.rs` |
| `TraceRule` | `schema::TraceabilityRule` | `rivet-core/src/schema.rs` |
| `Diagnostic` | `validate::Diagnostic` | `rivet-core/src/validate.rs` |
| `Severity` | `schema::Severity` | `rivet-core/src/schema.rs` |

## Building the Proofs

### Prerequisites

- Nix package manager (provides hermetic Rocq 9.0 toolchain)
- Bazel 8+ with bzlmod enabled

### Commands

```bash
# Compile all proofs
bazel build //proofs/rocq:rivet_metamodel

# Run proof verification test
bazel test //proofs/rocq:rivet_metamodel_test

# Compile individual files
bazel build //proofs/rocq:rivet_schema
bazel build //proofs/rocq:rivet_validation
```

### Bazel Integration

The proofs use `rules_rocq_rust` from `pulseengine/rules_rocq_rust`:

```starlark
# proofs/rocq/MODULE.bazel
bazel_dep(name = "rules_rocq_rust", version = "0.1.0")
git_override(
    module_name = "rules_rocq_rust",
    remote = "https://github.com/pulseengine/rules_rocq_rust.git",
    commit = "6a8da0bd...",
)
```

## Design Rationale

The formal model specifies **intended behavior** rather than translating
Rust code directly (via rocq-of-rust). This is deliberate:

1. **Abstraction** — The Rocq model captures essential properties without
   coupling to HashMap internals, serde machinery, or error types.
2. **Stability** — Refactoring Rust code does not break proofs as long
   as the behavioral specification still holds.
3. **Readability** — The Rocq types serve as a mathematical specification
   document that complements the Rust implementation.

## References

- Rocq (Coq) Theorem Prover: https://rocq-prover.org/
- rocq-of-rust (Rust-to-Rocq translator): https://github.com/formal-land/rocq-of-rust
- rules_rocq_rust (Bazel rules): https://github.com/pulseengine/rules_rocq_rust
- [[REQ-023]], [[DD-018]], [[FEAT-040]]
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
