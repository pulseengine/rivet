<div align="center">

# Rivet

<sup>SDLC traceability for safety-critical systems</sup>

&nbsp;

[![CI](https://github.com/pulseengine/rivet/actions/workflows/ci.yml/badge.svg)](https://github.com/pulseengine/rivet/actions/workflows/ci.yml)
![Rust](https://img.shields.io/badge/Rust-CE422B?style=flat-square&logo=rust&logoColor=white&labelColor=1a1b27)
![YAML](https://img.shields.io/badge/YAML-654FF0?style=flat-square&logoColor=white&labelColor=1a1b27)
![STPA](https://img.shields.io/badge/STPA-654FF0?style=flat-square&logoColor=white&labelColor=1a1b27)
![ASPICE](https://img.shields.io/badge/ASPICE-654FF0?style=flat-square&logoColor=white&labelColor=1a1b27)
![License: Apache-2.0](https://img.shields.io/badge/License-Apache--2.0-blue?style=flat-square&labelColor=1a1b27)

&nbsp;

<h6>
  <a href="https://github.com/pulseengine/meld">Meld</a>
  &middot;
  <a href="https://github.com/pulseengine/loom">Loom</a>
  &middot;
  <a href="https://github.com/pulseengine/synth">Synth</a>
  &middot;
  <a href="https://github.com/pulseengine/kiln">Kiln</a>
  &middot;
  <a href="https://github.com/pulseengine/sigil">Sigil</a>
</h6>

</div>

&nbsp;

Meld fuses. Loom weaves. Synth transpiles. Kiln fires. Sigil seals. **Rivet binds.**

Rivet is a schema-driven SDLC artifact manager for safety-critical systems. It keeps requirements, architecture, design, test specifications, and safety analysis artifacts as YAML files in git — then validates link integrity, traceability coverage, and completeness rules against mergeable schemas. No database, no external service, just text files and a fast CLI.

Built for Automotive SPICE and STPA workflows, with ReqIF interchange and OSLC sync on the roadmap.

## Quick Start

```bash
# From source
cargo install --path rivet-cli

# Validate a project
rivet validate

# Validate STPA files directly
rivet stpa path/to/stpa/

# Show artifact stats
rivet stats

# Traceability matrix
rivet matrix --from requirement --to feature --link satisfies --direction backward
```

## How It Works

1. **Define schemas** — YAML files declaring artifact types, link types, field constraints, and traceability rules
2. **Write artifacts** — YAML files with typed, linked lifecycle artifacts
3. **Validate** — Rivet loads schemas, imports artifacts, builds a link graph, and checks everything

```
rivet.yaml          # Project config: which schemas, which sources
schemas/
  common.yaml       # Base link types (satisfies, verifies, derives-from, ...)
  stpa.yaml         # STPA artifact types and completeness rules
  aspice.yaml       # ASPICE V-model types and traceability rules
  dev.yaml          # Lightweight dev tracking (requirements, decisions, features)
artifacts/
  requirements.yaml # Your artifacts in generic YAML format
  decisions.yaml
  features.yaml
```

### Schema-Driven Validation

Schemas define what's valid. Rivet enforces it:

- **Artifact types** — known types with required/optional fields and allowed values
- **Link types** — typed, directional with automatic inverse computation
- **Cardinality** — exactly-one, one-or-many, zero-or-one, zero-or-many
- **Target types** — which artifact types a link may point to
- **Traceability rules** — "every hazard must link to at least one loss" (error), "every requirement should be covered" (warning)

### Adapters

Rivet uses pluggable adapters to import artifacts from different formats:

- **generic-yaml** — canonical format with explicit `type` and `links` array
- **stpa-yaml** — imports from STPA analysis files (losses, hazards, UCAs, control structure)
- **WASM components** — adapter interface defined via WIT for custom formats

## Dogfooding

Rivet tracks its own development. Run `rivet validate` in this repo to see 30 artifacts (12 requirements, 6 design decisions, 12 features) validated against the `dev` schema with traceability coverage checks.

```bash
$ rivet validate
Diagnostics:
  WARN: [REQ-009] Every requirement should be satisfied by at least one design decision or feature
  WARN: [REQ-011] Every requirement should be satisfied by at least one design decision or feature
  WARN: [REQ-012] Every requirement should be satisfied by at least one design decision or feature

Result: PASS (3 warnings)

$ rivet matrix --from requirement --to feature --link satisfies --direction backward
Coverage: 8/12 (66.7%)
```

## Supported Domains

### STPA (Systems-Theoretic Process Analysis)

10 artifact types covering the full STPA methodology: losses, hazards, sub-hazards, system constraints, controllers, controlled processes, control actions, UCAs, controller constraints, and loss scenarios. 7 completeness rules enforce proper linking.

### Automotive SPICE

14 artifact types spanning the V-model from stakeholder requirements through system/software architecture, design, and testing. 10 traceability rules encode ASPICE bidirectional traceability requirements.

## Architecture

```
rivet-core/         # Library: model, store, links (petgraph), schema, validation, adapters
rivet-cli/          # Binary: validate, list, stats, matrix, stpa commands
schemas/            # Built-in domain schemas (common, stpa, aspice, dev)
artifacts/          # Rivet's own lifecycle artifacts (dogfooding)
wit/                # WIT interface for WASM component adapters
```

## Development

```bash
cargo build                # Build
cargo test                 # Test (5 integration tests)
cargo clippy -- -D warnings  # Lint
cargo fmt                  # Format
rivet validate             # Self-validate
```

## Roadmap

| Phase | Feature | Status |
|-------|---------|--------|
| 1 | STPA + ASPICE schemas, validation, CLI | Done |
| 1 | Generic YAML + STPA adapters | Done |
| 1 | Link graph, traceability matrix | Done |
| 1 | Dogfooding (self-tracking) | Done |
| 2 | `rivet serve` (axum + HTMX dashboard) | Planned |
| 2 | ReqIF 1.2 import/export | Planned |
| 3 | OSLC client (Polarion, DOORS sync) | Planned |
| 3 | WASM adapter runtime | Planned |

## License

Apache-2.0

---

<div align="center">

<sub>Part of <a href="https://github.com/pulseengine">PulseEngine</a> &mdash; formally verified WebAssembly toolchain for safety-critical systems</sub>

</div>
