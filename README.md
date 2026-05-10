<div align="center">

# Rivet

<sup>Typed knowledge graph + oracle-gated agents + agent-first form factor — the audit substrate for AI-assisted engineering</sup>

&nbsp;

[![CI](https://github.com/pulseengine/rivet/actions/workflows/ci.yml/badge.svg)](https://github.com/pulseengine/rivet/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/pulseengine/rivet/branch/main/graph/badge.svg)](https://codecov.io/gh/pulseengine/rivet)
![Rust](https://img.shields.io/badge/Rust-CE422B?style=flat-square&logo=rust&logoColor=white&labelColor=1a1b27)
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

> **Spar parses. Etch renders. Meld fuses. Rivet binds.**
>
> Rivet is a git-native, schema-driven artifact store with a CLI, an LSP,
> a dashboard, and an MCP server. Agents write the artifacts; mechanical
> oracles gate them; humans review the diff in the pull request.

## Why rivet

Three patterns landed in public over the same six-week window: Karpathy's
LLM Wiki (knowledge compounds), Anthropic's red-team agent scaffold
(verification mechanically gates), and the typed-traceability lineage
that ASPICE / DOORS / sphinx-needs settled decades ago (audit reads the
result). Each pillar in isolation reproduces a known failure mode — the
wiki that drifted into fiction, the test suite green on stale
assumptions, the traceability matrix nobody consults. Run the three
together and the failure modes cancel. See
[*Three patterns colliding*](https://pulseengine.eu/blog/three-patterns-colliding/)
for the synthesis.

Rivet is the typed-traceability pillar realised as one Rust binary with
three driving surfaces (CLI, MCP server, LSP backend) so an AI agent can
pick whichever one fits. Every artifact is provenance-stamped on every
mutation; every commit must carry the typed trailer that ties it back to
a requirement; every change has to survive `rivet validate` before the
PR review even starts. The same one binary serves the dashboard the
human reads, the LSP the editor uses, and the MCP tools the agent calls.

This is not an audit-after-the-fact tool. The point is that the agent
*authors* against the typed schema while the oracle is firing — so the
evidence is born compliant instead of being reverse-engineered later.

## Install

```bash
# From source (recommended while pre-1.0)
cargo install --path rivet-cli

# Or from a release tag
curl -L https://github.com/pulseengine/rivet/releases/download/v0.5.0/rivet-x86_64-unknown-linux-gnu.tar.gz | tar xz

# Or via npm (for `npx @pulseengine/rivet mcp` in MCP clients)
npm install -g @pulseengine/rivet
```

## 30-second demo

```bash
rivet init --preset dev          # 1. scaffold rivet.yaml + schemas/ + artifacts/
rivet add requirement -t "DB write returns ack" --asil B   # 2. add a typed atom
rivet validate                   # 3. oracle: PASS (no diagnostics)
rivet serve --port 3099          # 4. dashboard at http://localhost:3099
rivet docs quickstart            # 5. 10-step embedded guide w/ oracles
```

For a longer walk-through with copy-pasteable steps and an oracle on
each one, run `rivet quickstart` (added in v0.5.0).

## What's in here

`rivet-core` is the validation, schema, and salsa-incremental store
library. `rivet-cli` is the binary — CLI commands, the axum+HTMX
dashboard, the LSP server, the MCP server, and the `close-gaps` /
`pipelines` agent-driven oracle commands. `etch` is the layout engine
behind the traceability graph. `vscode-rivet` is the editor extension.
`schemas/` ships 28 built-in domain schemas (STPA, STPA-Sec, ASPICE 4.0,
Eclipse SCORE, ISO/PAS 8800, IEC 61508, IEC 62304, DO-178C, EN 50128,
GSN safety cases, EU AI Act, AADL, supply-chain, dev). `proofs/rocq/`
and `rivet-core/src/verus_specs.rs` carry the formal-method backstops;
`scripts/mythos/` is the agent-driven slop-hunt pipeline.

## Built-in docs

`rivet docs` lists every embedded topic; `rivet docs <topic>` prints the
content. The whole reference manual ships in the binary — no docs site
to drift, and the LSP serves the same text on hover.

```bash
rivet docs                       # list topics
rivet docs cli                   # CLI command reference
rivet docs schema/stpa           # STPA schema reference
rivet docs --grep variant        # search across all docs
rivet quickstart                 # 10-step oracle-gated walk-through
```

## For agents

- **MCP server** — `rivet mcp` exposes the artifact graph as typed
  tools (query, add, modify, link, unlink, remove, validate). Wire it
  into Claude Code, Cursor, or any MCP-aware client. `npx @pulseengine/rivet mcp`
  for clients that prefer node binaries over rust toolchains.
- **LSP server** — `rivet lsp` runs over stdio with diagnostics, hover,
  go-to-definition, and completions on artifact YAML. The VS Code
  extension is the reference client.
- **Slop-hunt pipeline** — `scripts/mythos/` is a four-prompt
  agent-driven audit (`rank` → `discover` → `validate` → `emit`) that
  finds dead code, duplicate parsers, and untraceable modules in any
  rivet-managed project. Adapted from Anthropic's red-team scaffold.
- **Agent pipelines** — `rivet pipelines list` / `rivet close-gaps`
  read the `agent-pipelines:` block in each schema and walk the
  oracle → rank → close-by-link → emit-trailer loop the agent runs.

## Status

- **CI**: `rivet validate`, `cargo clippy --workspace -- -D warnings`,
  `cargo test --workspace`, `rivet docs check`, Playwright (33 spec
  files), Kani (28 BMC harnesses), Verus, Rocq, mutation testing
  (16-shard rivet-core).
- **Self-hosted dashboard**: rendered to https://pulseengine.eu/reports/rivet/
  on every push to `main`.
- **Release**: see [CHANGELOG.md](CHANGELOG.md). Current line is the
  v0.5.0 series — Mythos pipeline + witness-coverage consumer + variant
  scoping coherence + restored Verus & Rocq + 16-shard mutation testing.

### In flight (honest list)

- **Variant tooling** carries six open product questions (matrix
  emission, t-wise sampling, attribute schema scope, audit cardinality,
  CLI ergonomics, dashboard interplay) tracked under
  `.rivet/mythos/variant-matrix-design.md` and the v0.5.x backlog.
- **Formal-verification gaps**: Verus has 15 proven specs and three
  documented gaps (variant solver completeness, salsa incremental
  fixpoint, ReqIF round-trip). Rocq covers schema and validation
  semantics; the larger gale-style differential-testing bar is a
  follow-up release item.
- **Schema coverage**: 28 schemas ship; STPA-AI and supply-chain
  schemas are still soft-launched and may shift before 1.0.

## Contributing

Read [AGENTS.md](AGENTS.md) for the project conventions and
[CLAUDE.md](CLAUDE.md) for the commit-traceability trailer rules
(every commit touching `rivet-core/src/` or `rivet-cli/src/` must carry
`Implements: REQ-NNN` / `Refs: FEAT-NNN` / `Verifies: REQ-NNN` /
`Fixes: REQ-NNN`, or `Trace: skip` for chore/style/ci/docs/build).

## License

Apache-2.0

## Contact

[github.com/pulseengine](https://github.com/pulseengine) ·
[pulseengine.eu](https://pulseengine.eu)

---

<div align="center">

<sub>Part of <a href="https://github.com/pulseengine">PulseEngine</a> &mdash; toolchain for safety-critical systems</sub>

</div>
