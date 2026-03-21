<div align="center">

# Rivet

<sup>SDLC traceability for safety-critical systems</sup>

&nbsp;

[![CI](https://github.com/pulseengine/rivet/actions/workflows/ci.yml/badge.svg)](https://github.com/pulseengine/rivet/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/pulseengine/rivet/branch/main/graph/badge.svg)](https://codecov.io/gh/pulseengine/rivet)
![Rust](https://img.shields.io/badge/Rust-CE422B?style=flat-square&logo=rust&logoColor=white&labelColor=1a1b27)
![YAML](https://img.shields.io/badge/YAML-654FF0?style=flat-square&logoColor=white&labelColor=1a1b27)
![STPA](https://img.shields.io/badge/STPA-654FF0?style=flat-square&logoColor=white&labelColor=1a1b27)
![ASPICE](https://img.shields.io/badge/ASPICE-654FF0?style=flat-square&logoColor=white&labelColor=1a1b27)
![License: Apache-2.0](https://img.shields.io/badge/License-Apache--2.0-blue?style=flat-square&labelColor=1a1b27)

&nbsp;

<h6>
  <a href="https://github.com/pulseengine/spar">Spar</a>
  &middot;
  <a href="https://github.com/pulseengine/etch">Etch</a>
  &middot;
  <a href="https://github.com/pulseengine/meld">Meld</a>
</h6>

</div>

&nbsp;

Spar parses. Etch renders. Meld fuses. **Rivet binds.**

Rivet is a schema-driven SDLC artifact manager for safety-critical systems. It keeps requirements, architecture, design, test specifications, and safety analysis artifacts as YAML files in git — then validates link integrity, traceability coverage, and completeness rules against mergeable schemas.

No database, no external service, just text files and a fast Rust CLI.

## Features

- **Schema-driven validation** — artifact types, link types, cardinality, traceability rules
- **STPA + STPA-Sec** — full safety and security analysis with 15+ artifact types
- **ASPICE V-model** — stakeholder→system→software→verification traceability chain
- **Eclipse SCORE** — 40+ artifact types from the SCORE metamodel
- **Dashboard** — `rivet serve` with filter/sort/pagination, graph, STPA hierarchy, print mode
- **LSP server** — `rivet lsp` with diagnostics, hover, go-to-definition, completions (salsa incremental)
- **VS Code extension** — embedded dashboard, live validation, Cmd+K search
- **HTML export** — static site with STPA, graph, documents, matrix, coverage
- **Gherkin export** — `rivet export --gherkin` generates .feature files from acceptance criteria
- **Self-contained binary** — HTMX, Mermaid, fonts bundled; works offline
- **Cross-repo linking** — `rivet sync` with external project references
- **Baseline scoping** — `rivet validate --baseline v0.1.0` for version-scoped validation
- **AI agent support** — `rivet init --agents` generates AGENTS.md (25+ tools)
- **ReqIF 1.2** — import/export for DOORS, Polarion, codebeamer interchange
- **235+ Playwright E2E tests** — full route coverage with CI integration

## Quick Start

```bash
# Install
cargo install --path rivet-cli

# Initialize a project
rivet init --preset dev

# Validate artifacts
rivet validate

# Start the dashboard
rivet serve

# Start with live reload on file changes
rivet serve --watch

# Show artifact stats
rivet stats

# Generate AGENTS.md for AI coding agents
rivet init --agents
```

## Dashboard

```bash
rivet serve --port 3000
```

The dashboard provides:
- Artifact list with filter/sort/pagination
- Traceability graph (Etch layout engine)
- STPA + STPA-Sec hierarchy with filter bar
- Coverage matrix
- Document viewer with `[[ID]]` wiki-links
- Source browser with artifact cross-references
- Validation diagnostics with severity filtering
- Cmd+K global search
- Print mode (`?print=1`)

## VS Code Extension

The `vscode-rivet` extension provides:
- LSP client with real-time diagnostics (squiggly lines on broken links)
- Hover info (artifact title, type, description)
- Go-to-definition (click artifact ID → jump to YAML source)
- Completions (artifact IDs, link types from schema)
- Embedded dashboard as a WebView panel

```bash
cd vscode-rivet && npm install && npm run compile
```

## How It Works

1. **Define schemas** — YAML files declaring artifact types, link types, field constraints
2. **Write artifacts** — YAML files with typed, linked lifecycle artifacts
3. **Validate** — Rivet checks link integrity, required fields, cardinality, traceability rules

```
rivet.yaml              # Project config
schemas/
  common.yaml           # Base link types (satisfies, verifies, ...)
  stpa.yaml             # STPA methodology (10 types, 7 rules)
  stpa-sec.yaml         # STPA-Sec adversarial analysis (5 types)
  aspice.yaml           # ASPICE V-model (14 types, 10 rules)
  cybersecurity.yaml    # ISO 21434 / ASPICE SEC.1-4 (10 types)
  score.yaml            # Eclipse SCORE metamodel (40+ types)
  dev.yaml              # Lightweight dev tracking (3 types)
  aadl.yaml             # AADL architecture (3 types)
artifacts/              # Your lifecycle artifacts
safety/stpa/            # STPA analysis files
safety/stpa-sec/        # STPA-Sec security analysis
docs/                   # Documents with {{artifact:ID}} embeds
```

## Adapters

- **generic-yaml** — canonical format with explicit `type` and `links`
- **stpa-yaml** — STPA analysis files (losses, hazards, UCAs, control structure)
- **aadl** — AADL architecture via spar (direct `.aadl` parsing or JSON)
- **reqif** — ReqIF 1.2 XML for ALM tool interchange
- **needs-json** — sphinx-needs JSON export import
- **WASM components** — custom format adapters via WIT interface

## CLI Commands

| Command | Purpose |
|---------|---------|
| `rivet validate` | Check link integrity, coverage, required fields |
| `rivet list` | List artifacts with type/status/search filters |
| `rivet stats` | Show artifact counts by type |
| `rivet serve` | Start the interactive dashboard |
| `rivet lsp` | Start the LSP server (for editors) |
| `rivet add` | Create a new artifact with auto-generated ID |
| `rivet link` | Add a link between artifacts |
| `rivet modify` | Update artifact fields |
| `rivet remove` | Remove an artifact |
| `rivet batch` | Atomic multi-mutation from a YAML file |
| `rivet export` | Generate HTML, ReqIF, YAML, or Gherkin output |
| `rivet import` | Import from ReqIF, sphinx-needs JSON |
| `rivet impact` | Show change impact analysis |
| `rivet coverage` | Show traceability coverage |
| `rivet matrix` | Compute traceability matrix |
| `rivet sync` | Sync external project dependencies |
| `rivet commits` | Check commit-to-artifact traceability |
| `rivet init` | Initialize a new project or generate AGENTS.md |

## Architecture

```
rivet-core/     # Library: model, store, links, schema, validation, adapters, LSP DB
rivet-cli/      # Binary: CLI commands, axum+HTMX dashboard, LSP server
etch/           # Graph layout engine (Sugiyama, compound, orthogonal routing)
vscode-rivet/   # VS Code extension (LSP client, WebView dashboard)
schemas/        # Built-in domain schemas (8 schemas)
```

## Dogfooding

Rivet tracks its own development — 447 artifacts across 19 types, validated on every commit.

```bash
$ rivet validate
Result: PASS (0 warnings)

$ rivet stats
  requirement         36
  design-decision     39
  feature             80
  hazard              18
  uca                 57
  sec-loss             5
  sec-hazard           6
  ...
  TOTAL              447
```

## Development

```bash
cargo build                    # Build
cargo test --all               # 500+ tests
cargo clippy -- -D warnings    # Lint
cargo fmt                      # Format
rivet validate                 # Self-validate
cd tests/playwright && npx playwright test  # 235+ E2E tests
```

## License

Apache-2.0

---

<div align="center">

<sub>Part of <a href="https://github.com/pulseengine">PulseEngine</a> &mdash; toolchain for safety-critical systems</sub>

</div>
