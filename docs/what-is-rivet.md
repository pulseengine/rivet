<!-- rivet-docs-check: design-doc-aspirational-ok -->
<!-- AUDIT-FILE: verified 2026-04-22 — positioning doc may reference planned
     v0.5.0 features and counts that drift with the artifact tree. -->

# rivet: because AI agents still don't remember why

The faster AI agents produce code, the more it matters to prove *why*
each line exists. rivet keeps the chain from requirement to test to
evidence as YAML in git — machine-readable, agent-writable, validated
in CI. v0.4.1 extends that: every artifact can be authored by an
MCP-connected agent, cross-verified by rivet's schema engine, and
reviewed by a human in the pull request — all three in the same
commit.

This document is the frame, the per-situation playbook, and an
explicit list of things rivet is *not*. Every capability below is
something you can verify today in the current tree unless it is
marked **(planned for v0.5.0)** or **(in progress)**.

---

## 1. The frame: Evidence as Code

Sphinx-Needs calls itself *Engineering as Code*. That framing assumes
a human author and a doc-as-code publishing pipeline. Good frame —
for human-authored workflows.

rivet's centre of gravity is different. The assumption is that **AI
agents draft the artifacts** — requirements, hazards, design
decisions, test specs, variant bindings — and a human **reviews the
diff in a pull request**. That shift changes the tool's job:

- Every artifact carries a **provenance record**: human vs ai vs
  ai-assisted, which model, which session, when, reviewed by whom.
- Every change must survive **machine validation** before it counts
  as evidence: link integrity, cardinality, schema rules,
  s-expression constraints, variant consistency.
- The change surface is **git-native**, so the PR review *is* the
  approval step — not a separate workflow in a separate tool.
- Agents read and mutate the evidence graph through a typed
  interface, not a screen-scrape.

That is what rivet is: a git-native, schema-driven evidence store
with an LSP, a dashboard, an MCP server, and formal-verification
scaffolding. AI agents author, humans cross-verify, the same PR
carries both.

---

## 2. What rivet is (one paragraph)

rivet is a **git-native, schema-driven artifact store** with a
**CLI**, an **LSP server**, a **dashboard** (`rivet serve`), and an
**MCP server** (`rivet mcp`) that exposes the artifact graph to AI
agents as typed tools. It ships 27 schemas covering STPA, STPA-Sec,
ASPICE 4.0, Eclipse SCORE, ISO/PAS 8800, IEC 61508, IEC 62304,
DO-178C, EN 50128, GSN safety cases, and the EU AI Act — plus the
cross-schema bridges between them. It imports ReqIF 1.2, JUnit XML,
and sphinx-needs JSON. It exports ReqIF, HTML, Zola, Gherkin, and
generic YAML. Validation runs on a salsa-backed incremental engine;
every mutation stamps AI provenance. The core validation rules are
backed by 27 Kani bounded-model-checking harnesses, Verus specs,
Rocq proofs, and 324 Playwright end-to-end tests across 28 spec
files.

---

## 3. Who rivet is for

- **Safety-critical teams with a compliance standard.** ISO 26262
  (via IEC 61508), DO-178C, EN 50128, IEC 62304, ISO/PAS 8800, or the
  EU AI Act — there is a schema in `schemas/` that is at least a
  starting point. See
  [docs/design/polarion-reqif-fidelity.md](design/polarion-reqif-fidelity.md)
  for a field-by-field audit of what survives ReqIF interchange.

- **Rust and embedded teams running AI pair-programming.** rivet is
  written in Rust and dogfoods itself: 219+ artifacts across
  requirements, features, design decisions, hazards, UCAs, tests, and
  verifications. If Claude Code, Cursor, or Gemini already write your
  code, `rivet mcp` and `rivet stamp` are the point where the
  *evidence* survives the session.

- **ASPICE programs that want a free alternative to Polarion for
  traceability.** rivet cannot replace Polarion's live collaborative
  editing — but for the traceability graph, ReqIF export, and
  coverage reporting, `rivet validate && rivet export --format reqif`
  produces audit evidence from a git repo in seconds.

- **AI platform teams building agentic-SDLC workflows.** The
  `provenance` field captures `created-by`, `model`, `session-id`,
  `timestamp`, and `reviewed-by` on every artifact. `rivet stamp`
  writes them in a shape that passes schema validation.

---

## 4. The use-case palette

rivet's schema system is domain-agnostic, so the same tool gets used
differently per situation. What follows is a per-situation playbook:
*what question is answered*, *what the AI does*, *what the human
reviews*.

### 4.1 Test-driven development (TDD)

- **Question.** For a given requirement, does a test exist that
  verifies it, and did it pass in the last run?
- **Artifacts.** `requirement`, `test-case`, `test-run`, `verifies`
  link, `test-result` with pass/fail + timestamp.
- **AI does.** Writes the test, then `rivet import-results --format
  junit results.xml` stamps the run into the graph. Proposes
  `verifies` links through the `rivet_link` MCP tool.
- **Human reviews.** The PR — code change and new `verifies` link in
  one diff.

### 4.2 ASPICE process tracking

- **Question.** For each ASPICE process step (SWE.1 through SWE.6,
  SYS.2 through SYS.5, SUP.*), are the required work products present
  and correctly linked?
- **Artifacts.** The `aspice` schema ships 14 artifact types matching
  ASPICE 4.0 V-model.
- **AI does.** Generates SWE.4 `sw-unit-verification-result` entries
  from `rivet import-results --format junit` output. Drafts
  `sw-architecture` records from source files via `rivet discover`
  **(planned for v0.5.0)**.
- **Human reviews.** Whether the generated artifacts represent the
  real work — in a PR, before they become evidence. An assessor still
  signs the final report.
- **Today.** A dogfood project ships **268 ASPICE artifacts at 97%
  coverage**.

### 4.3 ISO 26262 / STPA safety analysis

- **Question.** For each identified hazard, is there a traceable UCA,
  a controller constraint, and a loss scenario?
- **Artifacts.** 34 hazards, 62 UCAs, 62 controller constraints live
  in rivet's own STPA dogfood (`safety/stpa/`), plus the STPA-Sec
  adversarial extension (`safety/stpa-sec/`) and a tool-qualification
  STPA (`safety/stpa/tool-qualification.yaml`).
- **AI does.** Proposes new UCAs from a scenario description using
  the four UCA categories (not-providing / providing / wrong-timing /
  wrong-duration). `rivet validate` runs cross-rule consistency.
- **Human reviews.** The safety engineer signs off on the UCA
  taxonomy and controller-constraint derivation.
- **Limit.** No `iso-26262.yaml` schema yet — today you combine
  `iec-61508.yaml` (ISO 26262 derives from it) with STPA and the
  safety-case schema. A dedicated ISO 26262 work-product schema is
  **planned for v0.5.0**.

### 4.4 Requirements engineering

- **Question.** For each requirement: what design satisfies it, what
  feature realises it, what test verifies it, is the chain complete?
- **Artifacts.** The `REQ → DD → FEAT → TEST` chain with `rivet
  coverage` and `rivet matrix`. `rivet validate --baseline v0.4.0`
  limits the view to artifacts frozen at a given release.
- **AI does.** Drafts requirements from user intent, proposes the
  decomposition tree, emits `satisfies` / `refines` / `verifies`
  links.
- **Human reviews.** The semantic correctness of the decomposition.
  rivet guarantees structural integrity only.

### 4.5 Variant / Product Line Engineering

- **Question.** For a given variant (feature configuration), which
  requirements, tests, and hazards apply — and is the variant
  constraint-satisfiable?
- **Artifacts.** `feature-model.yaml` (the feature tree),
  `variant-config.yaml` (selections), `binding.yaml` (feature →
  artifact links). See `examples/variant/`.
- **AI does.** Proposes variant bindings from user-stated preferences
  and queries the graph in s-expression — `(and (= type "requirement")
  (has-tag "stpa"))` — using the `forall`, `exists`, `reachable-from`,
  `reachable-to` predicates in the evaluator.
- **Human reviews.** Whether the feature-model constraints encode the
  real product-line rules.
- **Dashboard.** When a feature model is in the project, `rivet serve`
  auto-discovers it and renders a header dropdown plus a `/variants`
  overview page. Selecting a variant scopes every artifact list, the
  link graph, and the coverage matrix to that variant's active features.

### 4.6 LLM-assisted code review and authoring

- **Question.** Can my AI agent read the trace graph and propose
  mutations that rivet server-side-validates before I accept them?
- **Artifacts.** All of them, through MCP.
- **AI does.** Calls 15 MCP tools: `rivet_list`, `rivet_get`,
  `rivet_query`, `rivet_stats`, `rivet_coverage`, `rivet_schema`,
  `rivet_embed`, `rivet_add`, `rivet_modify`, `rivet_link`,
  `rivet_unlink`, `rivet_remove`, `rivet_validate`,
  `rivet_snapshot_capture`, `rivet_reload`.
- **Human reviews.** The MCP audit log (`rivet mcp` writes every
  mutation call as JSONL to the project directory) plus the git diff.

### 4.7 Provenance and AI attestation

- **Question.** Which AI session authored which artifact, which model
  produced it, did a human approve it?
- **Artifacts.** Every artifact carries an optional `provenance`
  block: `created-by` (human / ai / ai-assisted), `model`,
  `session-id`, `timestamp`, `reviewed-by`.
- **AI does.** `rivet stamp <ID> --created-by ai-assisted --model
  claude-opus-4-7` on every touch. A PostToolUse hook in
  `.claude/settings.json` automates this.
- **Human reviews.** The stamp record in the PR. Missing or stale
  provenance is a review smell.
- **Why it matters.** EU AI Act Article 12 requires "logging of
  events over the lifecycle"; ISO/PAS 8800 carries an equivalent
  runtime-evidence requirement.

### 4.8 Cross-tool interop

- **Question.** Can I use rivet as an AI-querying and validation
  layer over an existing Polarion, Jira, or DOORS deployment?
- **Artifacts.** `rivet import` from ReqIF 1.2 (DOORS, Polarion,
  codebeamer) and sphinx-needs JSON.
- **Exports.** ReqIF, HTML, Zola (multi-project via `--prefix`),
  Gherkin (`rivet export --gherkin` writes `.feature` files from
  acceptance criteria), generic YAML.
- **Limit.** Direct Polarion REST integration is **planned for
  v0.5.0**.
  [docs/design/polarion-reqif-fidelity.md](design/polarion-reqif-fidelity.md)
  is the field-by-field audit of what the two paths can and cannot
  carry.

### 4.9 Safety case assembly (GSN)

- **Question.** Is there an explicit argument — goal, strategy,
  solution, context, assumption — that links claims to evidence?
- **Artifacts.** `schemas/safety-case.yaml` (GSN 3 community
  standard) plus cross-schema bridges to STPA and EU AI Act in
  `schemas/safety-case-stpa.bridge.yaml` and
  `schemas/safety-case-eu-ai-act.bridge.yaml`.
- **AI does.** Drafts goal / strategy / solution nodes from
  requirements, hazards, and test evidence.
- **Human reviews.** The safety engineer signs off on the argument
  structure. rivet checks that every node references something real.

### 4.10 Tool qualification (TCL / TQL)

- **Question.** Is rivet itself qualified as a development tool for
  my certification context (ISO 26262-8 §11, DO-178C §12.2, IEC
  62304 §8.4)?
- **Artifacts.** `safety/stpa/tool-qualification.yaml` — rivet's own
  STPA-based tool-confidence analysis at TCL 1. Dogfood, and also a
  template you can copy.
- **AI does.** Proposes tool-impact analyses for new rivet features.
- **Human reviews.** The tool user signs off on TCL assignment.
- **Limit.** A full qualification kit (tool operational requirements,
  verification procedure, qualification report) is **planned for
  v0.5.0**.

### 4.11 Spec-driven development

- **Question.** Does my code meet the declared constraints in the
  spec artifacts?
- **Artifacts.** The s-expression evaluator
  (`rivet-core/src/sexpr_eval.rs`) supports `forall`, `exists`,
  `has-tag`, `has-link-type`, `reachable-from`, `reachable-to`,
  arithmetic, equality, and boolean ops. Constraints live in the
  schema next to the artifact type they constrain.
- **AI does.** Writes code; runs `rivet validate` to check that the
  declared constraint language is satisfied.
- **Human reviews.** The constraint in the schema, not the artifact.
  Once reviewed, it re-applies to every artifact of that type
  forever.

---

## 5. Human vs AI split — explicit

| Task | Human | AI agent |
|---|---|---|
| Author a requirement | reviews and approves the PR | drafts YAML from user intent via `rivet_add` |
| Link artifacts | reviews `satisfies` / `verifies` / `refines` edges in the diff | proposes links via `rivet_link` |
| Validation | runs `rivet validate` locally before PR | receives structured diagnostics via `rivet_validate` |
| Coverage reports | reads the dashboard at `rivet serve` | embeds `{{coverage}}` in generated docs via `rivet_embed` |
| Variant check | reads PASS/FAIL on `rivet validate --variant` | generates variant bindings from feature preferences |
| Provenance | reviews the `provenance` block in the stamp | calls `rivet stamp` on every touch (or PostToolUse hook) |
| Compliance export | signs the report | produces ReqIF, Zola, or JSON on demand via `rivet export` |
| Tool qualification | assigns TCL / TQL | drafts tool-impact analysis for new rivet features |
| Schema changes | reviews schema semantics | does not touch schemas unless asked |

The asymmetry is the design. The human owns semantic correctness;
the AI owns volume. rivet is the substrate that makes the handover
trustworthy.

---

## 6. What rivet is NOT

Honesty over hype.

- **Not a replacement for Polarion's live collaborative editing.**
  rivet is git-based. Two humans editing the same YAML file at the
  same time is a merge conflict, not a live cursor.
- **Not a direct Polarion / Jira / DOORS connector today.** ReqIF
  import/export works. Direct REST to Polarion is
  **planned for v0.5.0** — design already in
  [docs/design/polarion-reqif-fidelity.md](design/polarion-reqif-fidelity.md).
- **Not yet a turnkey ISO 26262 solution.** No `iso-26262.yaml`
  schema today. You assemble from `iec-61508.yaml` + STPA + safety
  case + your own overlay. Dedicated schema **planned for v0.5.0**.
- **Not yet distributed via npm.** `claude mcp add rivet npx -y
  @pulseengine/rivet mcp` is **planned for v0.5.0**. Today: `cargo
  install --path rivet-cli` and point your MCP client at the built
  binary.
- **Not suitable for teams without git discipline.** Artifacts live
  in the repo. Branches, PRs, and reviews are the workflow — not a
  bolt-on.
- **Not a secrets store.** Artifacts are text files. Indexed,
  validated, rendered — not encrypted.
- **Not a project-management tool.** No Gantt, no sprint planning,
  no Kanban. rivet tracks engineering artifacts, not tickets.

---

## 7. Quick start

Shortest path from zero to validated evidence.

```bash
# 1. Install (npm distribution planned for v0.5.0)
cargo install --path rivet-cli

# 2. Initialise a project (preset: dev / aspice / stpa / iec-61508 / ...)
rivet init --preset dev

# 3. (Optional) Install git hooks and AGENTS.md for AI coding agents
rivet init --hooks
rivet init --agents

# 4. Add an artifact
rivet add requirement --title "System must reject malformed YAML" --status draft

# 5. Link it
rivet link REQ-001 satisfies FEAT-001

# 6. Validate — this is the evidence test
rivet validate

# 7. Browse
rivet serve --port 3000

# 8. Wire an AI agent — the MCP server speaks to Claude, Cursor, Gemini, ...
#    Today (local binary):
#      claude mcp add rivet /absolute/path/to/rivet mcp
#    Planned for v0.5.0 (npm):
#      claude mcp add rivet npx -y @pulseengine/rivet mcp
```

From step 6 you have evidence that would pass a PR review. From step
8 an AI agent can read and propose mutations to the graph, each one
server-side-validated before it lands.

---

## 8. Where to go next

- **CLI reference.** `rivet docs --list` for all built-in topics, or
  the `## CLI Commands` table in [README.md](../README.md).
- **Getting started tutorial.**
  [docs/getting-started.md](getting-started.md).
- **Architecture.** [docs/architecture.md](architecture.md).
- **Schemas in depth.** [docs/schemas.md](schemas.md).
- **STPA methodology dogfood.** [docs/stpa-sec.md](stpa-sec.md) plus
  `safety/stpa/` and `safety/stpa-sec/`.
- **Verification evidence.** [docs/verification.md](verification.md)
  — 27 Kani BMC harnesses, Verus specs, Rocq proofs, 324 Playwright
  end-to-end tests.
- **Polarion / ReqIF fidelity audit.**
  [docs/design/polarion-reqif-fidelity.md](design/polarion-reqif-fidelity.md).
- **Roadmap.** [docs/roadmap.md](roadmap.md).
- **Audit report.** [docs/audit-report.md](audit-report.md) — state
  of doc-vs-reality after PR #171's audit.

---

*Last updated 2026-04-19 for v0.4.1 positioning. If a claim in this
doc does not match the tree at `main` HEAD, file an issue — the
purpose of rivet is that its own evidence chain is audit-grade.*
