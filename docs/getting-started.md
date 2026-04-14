# Getting Started

Rivet is a schema-driven SDLC artifact manager for safety-critical systems. It keeps
requirements, architecture, design, verification, and safety analysis artifacts as YAML
files in git, then validates link integrity, traceability coverage, and completeness
rules against mergeable schemas.

No database. No external service. Text files and a fast CLI.

---

## Installation

### From source

```bash
git clone https://github.com/pulseengine/rivet.git
cd rivet
cargo install --path rivet-cli
```

### Build only

```bash
cargo build --release
# Binary at target/release/rivet
```

Requires Rust edition 2024 (MSRV 1.89).

---

## Quick Start

### 1. Create a project

Create `rivet.yaml` in your project root:

```yaml
project:
  name: my-project
  version: "0.1.0"
  schemas:
    - common
    - dev

sources:
  - path: artifacts
    format: generic-yaml
```

### 2. Add a schema directory

Copy or symlink the built-in schemas into your project:

```bash
cp -r path/to/rivet/schemas ./schemas
```

Or point Rivet at an external schemas directory with `--schemas`:

```bash
rivet --schemas /path/to/rivet/schemas validate
```

Rivet resolves schemas relative to the project directory by default (looks for `schemas/`).

### 3. Write artifacts

Create `artifacts/requirements.yaml`:

```yaml
artifacts:
  - id: REQ-001
    type: requirement
    title: Text-file-first artifact management
    status: approved
    description: >
      All lifecycle artifacts are stored as YAML files in git repositories.
      No database or external service required for core operation.
    tags: [core]
    fields:
      priority: must
      category: functional

  - id: REQ-002
    type: requirement
    title: Secure boot support
    status: draft
    description: >
      The system shall verify firmware image authenticity before installation.
    tags: [security]
    fields:
      priority: must
      category: functional
```

### 4. Validate

```bash
rivet validate
```

Output:

```
Diagnostics:
  WARN: [REQ-001] Every requirement should be satisfied by at least one design decision or feature
  WARN: [REQ-002] Every requirement should be satisfied by at least one design decision or feature

Result: PASS (2 warnings)
```

Warnings indicate incomplete traceability coverage. Errors indicate broken rules
(missing required links, unknown types, invalid field values). A project with errors
returns a non-zero exit code.

---

## Project Configuration

The `rivet.yaml` file defines what schemas to load and where to find artifacts.

```yaml
project:
  name: my-project          # Project name
  version: "0.1.0"          # Project version (informational)
  schemas:                   # Schema names to load and merge
    - common                 #   Always include common for base link types
    - dev                    #   Domain schema (dev, stpa, aspice, cybersecurity)

sources:                     # Artifact sources
  - path: artifacts          #   Directory or file path (relative to rivet.yaml)
    format: generic-yaml     #   Adapter format: generic-yaml or stpa-yaml
```

Multiple sources can be listed. Each source specifies a path and a format adapter:

```yaml
sources:
  - path: artifacts/requirements.yaml
    format: generic-yaml
  - path: artifacts/features.yaml
    format: generic-yaml
  - path: safety/stpa
    format: stpa-yaml
```

---

## Artifact YAML Format

Artifacts use the generic YAML format. Each file contains an `artifacts` list:

```yaml
artifacts:
  - id: DD-001
    type: design-decision
    title: OSLC over per-tool REST adapters
    status: approved
    description: >
      Use OSLC as the integration protocol instead of writing
      per-tool REST adapters.
    tags: [architecture, oslc]
    links:
      - type: satisfies
        target: REQ-006
    fields:
      rationale: >
        OSLC is an OASIS standard that Polarion, DOORS, and codebeamer
        already support natively.
      alternatives: >
        Per-tool REST adapters. Rejected due to maintenance burden.
```

### Base fields (all artifact types)

| Field         | Type          | Required | Description                              |
|---------------|---------------|----------|------------------------------------------|
| `id`          | string        | yes      | Unique identifier (e.g. `REQ-001`)       |
| `type`        | string        | yes      | Artifact type defined in a loaded schema |
| `title`       | string        | yes      | Human-readable title                     |
| `description` | text          | no       | Detailed description (supports markdown) |
| `status`      | enum          | no       | Lifecycle status                         |
| `tags`        | list\<string> | no       | Arbitrary tags for categorization        |

### Links

The `links` list declares typed, directional relationships to other artifacts:

```yaml
links:
  - type: satisfies        # Link type name (defined in schema)
    target: REQ-001        # Target artifact ID
  - type: derives-from
    target: SYSREQ-003
```

Link types have automatic inverse computation. If artifact A `satisfies` artifact B,
then B is automatically `satisfied-by` A. Inverses do not need to be declared manually.

### Custom fields

The `fields` map holds type-specific data. Schemas define which fields are allowed,
required, and what values are valid:

```yaml
fields:
  priority: must                              # enum field
  category: functional                        # enum field
  rationale: "Performance was the driver."    # text field
  preconditions:                              # list<string> field
    - HSM provisioned
    - Test firmware available
```

---

## Schema System

Rivet schemas are YAML files that define artifact types, link types, field constraints,
and traceability rules. Schemas are **mergeable** -- a project loads multiple schemas
and Rivet combines them into a single rule set.

Every project should include `common` as the base schema. Domain schemas extend it:

```yaml
schemas:
  - common        # Base link types (satisfies, verifies, derives-from, ...)
  - aspice        # ASPICE V-model types and traceability rules
```

Or combine multiple domains:

```yaml
schemas:
  - common
  - aspice
  - cybersecurity
```

See [schemas.md](schemas.md) for the full schema reference.

### Schema structure

A schema file declares:

```yaml
schema:
  name: my-schema
  version: "0.1.0"
  extends: [common]
  description: My domain schema.

artifact-types:
  - name: my-artifact
    description: A custom artifact type
    fields:
      - name: priority
        type: string
        required: false
        allowed-values: [high, medium, low]
    link-fields:
      - name: satisfies
        link-type: satisfies
        target-types: [requirement]
        required: true
        cardinality: one-or-many

link-types:
  - name: my-link
    inverse: my-link-inverse
    description: A custom link type

traceability-rules:
  - name: my-rule
    description: Every my-artifact must satisfy a requirement
    source-type: my-artifact
    required-link: satisfies
    target-types: [requirement]
    severity: error
```

### Field types

| Type             | Description                           |
|------------------|---------------------------------------|
| `string`         | Single-line text, optionally with `allowed-values` |
| `text`           | Multi-line text (markdown supported)  |
| `number`         | Numeric value                         |
| `list<string>`   | List of strings                       |
| `structured`     | Arbitrary nested YAML structure       |
| `enum`           | String with `allowed-values` list     |

### Link field cardinality

| Cardinality      | Meaning                              |
|------------------|--------------------------------------|
| `exactly-one`    | Must link to exactly one target      |
| `one-or-many`    | Must link to one or more targets     |
| `zero-or-one`    | Optional, at most one target         |
| `zero-or-many`   | Optional, any number of targets      |

### Traceability rules

Rules define coverage and completeness checks. Two directions:

**Forward** (`required-link`): The source artifact must have an outgoing link of
the specified type to one of the target types.

```yaml
- name: decision-justification
  description: Every design decision must link to at least one requirement
  source-type: design-decision
  required-link: satisfies
  target-types: [requirement]
  severity: error
```

**Backward** (`required-backlink`): The source artifact must be the target of an
incoming link of the specified type from one of the listed `from-types`.

```yaml
- name: requirement-coverage
  description: Every requirement should be satisfied by a design decision or feature
  source-type: requirement
  required-backlink: satisfies
  from-types: [design-decision, feature]
  severity: warning
```

Severity levels: `error` (validation fails), `warning` (reported but passes),
`info` (informational).

---

## Link Types

### Common link types (always available)

| Link            | Inverse         | Description                                |
|-----------------|-----------------|--------------------------------------------|
| `traces-to`     | `traced-from`   | General traceability between any artifacts |
| `satisfies`     | `satisfied-by`  | Source fulfils the target                   |
| `refines`       | `refined-by`    | Source is a refinement of the target        |
| `verifies`      | `verified-by`   | Source verifies or validates the target     |
| `implements`    | `implemented-by`| Source implements the target                |
| `derives-from`  | `derived-into`  | Source is derived from the target           |
| `mitigates`     | `mitigated-by`  | Source mitigates or prevents the target     |
| `allocated-to`  | `allocated-from`| Source is allocated to the target           |
| `constrained-by`| `constrains`    | Source is constrained by the target         |

Domain schemas add additional link types. See [schemas.md](schemas.md) for the full list.

---

## CLI Commands

### Global options

```
rivet [OPTIONS] <COMMAND>

Options:
  -p, --project <PATH>    Path to project directory (default: .)
      --schemas <PATH>    Path to schemas directory
  -v, --verbose           Increase verbosity (-v info, -vv debug)
```

### `rivet validate`

Validate all artifacts against loaded schemas. Checks field constraints, link integrity,
target type restrictions, cardinality rules, and traceability rules.

```bash
rivet validate
```

Returns exit code 0 on pass (warnings allowed), non-zero on errors.

### `rivet list`

List artifacts with optional filters.

```bash
rivet list                          # All artifacts
rivet list -t requirement           # Filter by type
rivet list --status approved        # Filter by status
rivet list -t feature --status draft
```

### `rivet stats`

Print artifact summary statistics, orphan artifacts (no links), and broken link counts.

```bash
rivet stats
```

Output:

```
Artifact summary:
  design-decision                       6
  feature                              12
  requirement                          12
  TOTAL                                30

Orphan artifacts (no links): 3
  REQ-009
  REQ-011
  REQ-012
```

### `rivet matrix`

Generate a traceability matrix showing coverage between two artifact types.

```bash
rivet matrix --from requirement --to feature --link satisfies --direction backward
```

Options:

| Flag          | Description                                  |
|---------------|----------------------------------------------|
| `--from`      | Source artifact type                          |
| `--to`        | Target artifact type                         |
| `--link`      | Link type to trace (auto-detected if omitted)|
| `--direction` | `forward` or `backward` (default: backward)  |

Output:

```
Traceability: requirement -> feature (via 'satisfies')

  REQ-001              -> FEAT-001, FEAT-002
  REQ-002              -> FEAT-001
  REQ-009              -> (none)

Coverage: 8/12 (66.7%)
```

### `rivet stpa`

Load and validate STPA files directly, without a `rivet.yaml` configuration. Useful for
standalone STPA analysis directories.

```bash
rivet stpa path/to/stpa/
rivet stpa path/to/stpa/ --schema custom-stpa.yaml
```

Automatically loads the `common` and `stpa` schemas from the schemas directory.

### `rivet export`

Export all project artifacts to a specified format.

```bash
rivet export --format reqif --output artifacts.reqif
rivet export --format generic-yaml                       # stdout
```

Supported formats: `reqif` (ReqIF 1.2 XML), `generic-yaml`.

### `rivet serve`

Start the HTMX-powered dashboard server.

```bash
rivet serve                 # Default port 3000
rivet serve --port 8080
```

Opens a web dashboard at `http://localhost:3000` with:

- Artifact listing and detail views
- Validation diagnostics
- Traceability matrix
- Statistics summary
- Schema browser

### `rivet import` (requires `wasm` feature)

Import artifacts using a custom WASM adapter component.

```bash
rivet import --adapter my-adapter.wasm --source data/ --config key=value
```

---

## Dashboard

`rivet serve` starts an axum HTTP server with an HTMX-driven dashboard. The dashboard
provides a read-only view of the project state -- it loads all artifacts and schemas at
startup.

### Routes

| Path               | View                        |
|--------------------|-----------------------------|
| `/`                | Dashboard index             |
| `/artifacts`       | Artifact list (filterable)  |
| `/artifacts/{id}`  | Artifact detail with links  |
| `/validate`        | Validation diagnostics      |
| `/matrix`          | Traceability matrix         |
| `/stats`           | Statistics summary          |
| `/schemas`         | Schema browser              |

Start the dashboard and open `http://localhost:3000` in a browser:

```bash
rivet serve
# rivet dashboard listening on http://localhost:3000
```

---

## Examples

### Dev dogfooding

Rivet tracks its own development. The repository root contains:

```
rivet.yaml           # Loads common + dev schemas
schemas/
  common.yaml        # Base link types
  dev.yaml           # requirement, design-decision, feature types
artifacts/
  requirements.yaml  # 12 requirements
  decisions.yaml     # 6 design decisions
  features.yaml      # 12 features
```

Run `rivet validate` in the repo root to validate 30+ artifacts with traceability
coverage checks.

### STPA analysis

For standalone STPA analysis (e.g. from [Meld](https://github.com/pulseengine/meld)):

```bash
rivet stpa /path/to/meld/safety/stpa/
```

This loads STPA YAML files (losses, hazards, control structure, UCAs, controller
constraints, loss scenarios) and validates them against the STPA schema's 7 completeness
rules.

### Cybersecurity (ASPICE SEC.1-4)

The `examples/cybersecurity/` directory demonstrates a full cybersecurity traceability
chain aligned with ISO/SAE 21434 and ASPICE v4.0 SEC processes.

```
examples/cybersecurity/
  rivet.yaml             # Loads common + cybersecurity schemas
  cybersecurity.yaml     # Assets, threats, risk assessments, goals, requirements,
                         #   designs, implementations, verifications
```

The traceability chain flows:

```
Asset -> Threat Scenario -> Risk Assessment
                         -> Cybersecurity Goal -> Cybersecurity Req
                                              -> Cybersecurity Design
                                              -> Cybersecurity Implementation
                                              -> Cybersecurity Verification
```

Run from the example directory:

```bash
cd examples/cybersecurity
rivet --schemas ../../schemas validate
```

---

## AADL Architecture Integration (spar)

Rivet integrates with [spar](https://github.com/pulseengine/spar), an AADL v2.2
toolchain, to make architecture models first-class lifecycle artifacts. AADL
components become traceable from requirements through architecture to verification.

### Setup

1. Add the `aadl` schema to your `rivet.yaml`:

```yaml
project:
  schemas:
    - common
    - dev
    - aadl       # AADL architecture types
```

2. Create an `arch/` directory with your `.aadl` files and list it under `docs:`:

```yaml
docs:
  - docs
  - arch         # AADL models (browsable in dashboard, used for diagrams)
```

3. Build or fetch the spar WASM component for browser-side diagram rendering:

```bash
# Option A: build from spar source (requires spar repo + wasm32-wasip2 target)
./scripts/build-wasm.sh /path/to/spar

# Option B: fetch pre-built from GitHub releases
./scripts/fetch-wasm.sh
```

`build-wasm.sh` compiles spar to WASM and runs jco transpilation in one step.
The output lands in `rivet-cli/assets/wasm/js/`.

If you only have the `.wasm` file, transpile manually:

```bash
npx @bytecodealliance/jco transpile rivet-cli/assets/wasm/spar_wasm.wasm \
  --instantiation async -o rivet-cli/assets/wasm/js/
```

### Architecture artifacts

Create hand-authored architecture artifacts in your YAML sources that trace to
requirements and reference AADL components:

```yaml
artifacts:
  - id: ARCH-001
    type: system-arch-component
    title: Core validation engine
    status: approved
    description: >
      The validation module that checks artifacts against merged schemas.
    links:
      - type: allocated-from
        target: REQ-004
    fields:
      aadl-classifier: RivetSystem::RivetCore.Impl
```

The `aadl` schema defines `aadl-component`, `aadl-analysis-result`, and
`aadl-flow` artifact types with traceability rules linking them to requirements.

### Architecture diagrams in documents

Embed AADL architecture diagrams in any markdown document using fenced code
blocks with the `aadl` language tag:

````markdown
## System Architecture

```aadl
root: MyPackage::MySystem.Impl
```

The system consists of three subsystems...
````

When viewed in the dashboard (`rivet serve`), these blocks render as interactive
SVG diagrams. The spar WASM component runs client-side in the browser -- it
parses the `.aadl` files, instantiates the specified root, and renders the
component hierarchy as SVG with:

- Color-coded nodes by AADL category (system, process, thread, etc.)
- Zoom controls (+/−/reset) and mouse wheel zoom
- Click-drag panning
- Clickable nodes that navigate to the corresponding artifact

### Dashboard views

Run `rivet serve` and the dashboard provides:

- **Documents** -- Architecture docs with rendered AADL diagrams inline
- **Source browser** -- Browse `.aadl` files with syntax highlighting
- **Coverage** -- Traceability coverage showing which AADL components trace to
  requirements and which lack allocation
- **Matrix** -- Traceability matrix from requirements to architecture components

### How it works

The AADL diagram rendering is fully client-side:

1. The dashboard serves the jco-transpiled spar WASM module at `/wasm/`
2. When a page contains an `aadl` diagram block, the browser JS:
   - Fetches `.aadl` file contents from `/source-raw/arch/`
   - Loads the WASM module with a virtual WASI filesystem containing those files
   - Calls `renderer.render(root, [])` to get SVG
   - Inserts the SVG into the page
3. No spar CLI installation required on the server

### Layer 2: Rust library integration

For automated import of AADL components as rivet artifacts (without hand-authoring),
rivet-core includes an AADL adapter behind the `aadl` feature flag that uses
`spar-hir` as a Rust library:

```yaml
sources:
  - path: arch
    format: aadl
    config:
      root: MyPackage::MySystem.Impl
```

This parses `.aadl` files, runs analyses, and creates artifacts automatically.
Enable with `cargo build --features aadl`. Note: auto-imported artifacts need
traceability links added separately to avoid orphans.

---

## S-Expression Filtering

Filter artifacts using s-expressions — one syntax for CLI, API, constraints, and queries.

```bash
# Basic filtering
rivet list --filter '(= type "requirement")'
rivet list --filter '(and (has-tag "stpa") (= status "approved"))'
rivet list --filter '(not (= status "draft"))'

# Link predicates
rivet list --filter '(linked-by "satisfies" _)'
rivet list --filter '(links-count "satisfies" > 2)'

# Quantifiers (checks across all artifacts)
rivet list --filter '(exists (= type "requirement") (has-tag "safety"))'

# Graph traversal
rivet list --filter '(reachable-from "REQ-004" "satisfies")'

# Combine with other flags
rivet stats --filter '(= type "feature")'
rivet coverage --filter '(has-tag "safety")'
```

Available predicates: `=`, `!=`, `>`, `<`, `>=`, `<=`, `in`, `has-tag`, `has-field`,
`matches` (regex), `contains`, `linked-by`, `linked-from`, `linked-to`, `links-count`.

Logical: `and`, `or`, `not`, `implies`, `excludes`.

Quantifiers: `forall`, `exists`, `count`.

Graph: `reachable-from`, `reachable-to`.

---

## Variant Management (Product Line Engineering)

Manage product variants with feature models, constraint solving, and artifact scoping.

### Feature Model

Define your product line as a YAML feature tree:

```yaml
# feature-model.yaml
kind: feature-model
root: vehicle-platform
features:
  vehicle-platform:
    group: mandatory
    children: [market, safety-level, feature-set]
  market:
    group: alternative
    children: [eu, us, cn]
  eu:
    group: leaf
  # ... more features
constraints:
  - (implies eu pedestrian-detection)
  - (implies autonomous (and adas asil-d))
```

Group types: `mandatory` (all children), `alternative` (exactly one), `or` (at least one), `optional`, `leaf`.

### Variant Configuration

```yaml
# eu-adas-c.yaml
name: eu-adas-c
selects: [eu, adas, asil-c]
```

### Commands

```bash
# List feature tree
rivet variant list --model feature-model.yaml

# Check variant validity (constraint solving)
rivet variant check --model feature-model.yaml --variant eu-adas-c.yaml

# Solve and show bound artifacts
rivet variant solve --model fm.yaml --variant v.yaml --binding bindings.yaml

# Validate only variant-scoped artifacts
rivet validate --model fm.yaml --variant v.yaml --binding bindings.yaml
```

---

## Zola Export

Export artifacts to an existing Zola static site. Additive-only, namespaced by prefix.

```bash
# Export all artifacts
rivet export --format zola --output /path/to/zola-site --prefix rivet

# Export only requirements
rivet export --format zola --output ./site --prefix rivet \
  --filter '(= type "requirement")'

# Export STPA analysis as a separate section
rivet export --format zola --output ./site --prefix safety \
  --filter '(has-tag "stpa")'

# Include shortcodes + clean stale pages
rivet export --format zola --output ./site --prefix rivet \
  --shortcodes --clean
```

Generated structure:
- `content/<prefix>/artifacts/*.md` — one page per artifact with TOML frontmatter
- `content/<prefix>/docs/*.md` — documents with resolved `[[ID]]` wiki-links
- `data/<prefix>/artifacts.json` — full data for `load_data()`
- `data/<prefix>/validation.json` — PASS/FAIL status for export freshness

Shortcodes (with `--shortcodes`):
- `{{ rivet_artifact(id="REQ-001", prefix="rivet") }}` — inline artifact card
- `{{ rivet_stats(prefix="rivet") }}` — type/status breakdown

---

## Migrating from Sphinx-Needs

Import sphinx-needs `needs.json` exports:

```bash
rivet import-results --format needs-json needs.json --output artifacts/
rivet validate  # verify imported artifacts
```

The importer:
- Normalizes IDs (`REQ_001` to `REQ-001`)
- Maps links to `satisfies` (configurable)
- Preserves tags, status, description
- Warns about unresolved link targets

---

## MCP Server (AI Agent Integration)

Rivet exposes 15 tools via the Model Context Protocol:

```bash
rivet mcp  # stdio transport
```

Tools: `rivet_validate`, `rivet_list`, `rivet_get`, `rivet_stats`, `rivet_coverage`,
`rivet_schema`, `rivet_embed`, `rivet_snapshot_capture`, `rivet_add`, `rivet_query`,
`rivet_modify`, `rivet_link`, `rivet_unlink`, `rivet_remove`, `rivet_reload`.

All mutations are audit-logged to `.rivet/mcp-audit.jsonl`.

---

## Git Hooks

```bash
rivet init --hooks  # installs commit-msg + pre-commit hooks
```

**Important**: Git hooks are convenience tooling, not security controls.
`git commit --no-verify` bypasses them. CI must independently run
`rivet commits` and `rivet validate` as required checks.

---

## Next Steps

- Read the [schema reference](schemas.md) for full details on all built-in schemas
- Browse the `artifacts/` directory in the repo for real-world examples
- Run `rivet validate` on your own project to see it in action
- Try `rivet export --format zola` to publish your artifacts as a static site
- Use `rivet variant` to manage product line configurations
