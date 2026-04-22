# What is rivet?

> **rivet is the audit substrate for AI-assisted engineering —
> every artifact, link, and decision carries evidence a human can
> review in a pull request.**

This document exists because users keep asking the same question in
different shapes: *"is rivet for me?"*, *"what do I use it for?"*,
*"how is it different from Sphinx-Needs / Polarion / DOORS?"*. The
honest answer is: **rivet is a general template to link and validate
SDLC evidence, and per situation you use it differently.** The
generality is the point — and also the problem this doc is trying to
solve.

What follows is a frame, a per-situation playbook, and an explicit
list of things rivet is *not*. Every capability below is something
you can verify today in the current tree unless it is marked **(planned
for v0.5.0)** or **(in progress)**.

---

## 1. The frame: Evidence as Code

Sphinx-Needs calls itself **Engineering as Code**. That framing
assumes a human engineer is the author and the doc-as-code pipeline
is the publisher. It is an excellent frame — for human-authored
workflows.

rivet is aimed at a different centre of gravity. The assumption is
that **AI agents are drafting the artifacts** — requirements, hazards,
design decisions, test specs, variant bindings — and a human is
**reviewing the diff in a pull request**. That shift changes what the
tool has to do:

- Every artifact needs a verifiable **provenance record**: who (human
  vs ai vs ai-assisted), which model, which session, when, reviewed
  by whom.
- Every change must survive **machine validation** before it is
  trustworthy as evidence: link integrity, cardinality, schema rules,
  s-expression constraints, variant consistency.
- The change surface must be **git-native** so the human's PR review
  *is* the approval step — not a separate workflow in a separate tool.
- Agents must be able to read and mutate the evidence graph through a
  typed interface, not a screen-scrape.

That is what rivet is: a git-native, schema-driven evidence store
with an LSP, a dashboard, an MCP server, and formal-verification
scaffolding — built so that AI coding agents can author artifacts and
humans can cross-verify them in the same pull request.

Format-agnostic LLM comprehension studies (e.g.
[arxiv.org/abs/2604.13108](https://arxiv.org/abs/2604.13108)) suggest
it does not matter much whether the artifact store is YAML, JSON,
Markdown, or s-expressions — what matters is that the *structure* is
explicit and the *provenance* is recoverable. rivet picks YAML as the
on-disk format because humans have to review it; the agent doesn't
care either way.

---

## 2. What rivet is (one paragraph)

rivet is a **git-native, schema-driven artifact store** with a
**CLI**, an **LSP server**, a **dashboard** (`rivet serve`), and an
**MCP server** (`rivet mcp`) that exposes the artifact graph to AI
agents as typed tools. It ships with domain schemas for STPA,
STPA-Sec, ASPICE 4.0, Eclipse SCORE, ISO/PAS 8800, IEC 61508, IEC
62304, DO-178C, EN 50128, GSN safety cases, and the EU AI Act — plus
the cross-schema bridges between them. It imports ReqIF 1.2, JUnit
XML, and sphinx-needs JSON. It exports ReqIF, HTML, Zola, Gherkin,
and generic YAML. It validates with a salsa-backed incremental
engine, records AI provenance on every mutation, and is backed by 27
Kani bounded-model-checking harnesses, Verus specs, Rocq proofs for
the core validation rules, and roughly 324 Playwright end-to-end
tests across 28 spec files.

---

## 3. Who rivet is for

- **Safety-critical teams with a compliance standard.** If you are
  working to ISO 26262 (via IEC 61508), DO-178C, IEC 61508, EN 50128,
  IEC 62304, ISO/PAS 8800, or the EU AI Act, there is a schema in
  `schemas/` that is at least a starting point. See
  [docs/design/polarion-reqif-fidelity.md](design/polarion-reqif-fidelity.md)
  for a field-by-field honesty audit of what survives the ReqIF
  interchange.

- **Rust and embedded teams running AI pair-programming.** rivet is
  written in Rust and eats its own dog food (219+ artifacts across
  requirements, features, design decisions, hazards, UCAs, tests,
  verifications). If you already use Claude Code / Cursor / Gemini
  to write code and you want the *evidence* to survive the session,
  `rivet mcp` and `rivet stamp` are the point.

- **ASPICE programs that want a free alternative to Polarion for
  traceability.** rivet cannot replace Polarion's live collaborative
  editing — but for the traceability graph, ReqIF export, and
  coverage reporting, `rivet validate && rivet export --format reqif`
  gets you audit evidence from a git repo in seconds.

- **AI platform teams building agentic-SDLC workflows** where the
  evidence must outlive the conversation. rivet's `provenance` field
  captures `created-by`, `model`, `session-id`, `timestamp`, and
  `reviewed-by` on every artifact — and `rivet stamp` writes them in
  a way that passes schema validation.

---

## 4. The use-case palette

This is the hard part. rivet's schema system is domain-agnostic, so
the same tool is used very differently per situation. What follows
is a per-situation playbook — *what question does it answer*, *what
does the AI do*, *what does the human review*.

### 4.1 Test-driven development (TDD)

- **Question answered.** For a given requirement, does a test exist
  that verifies it, and did it pass in the last run?
- **Artifacts used.** `requirement`, `test-case`, `test-run`,
  `verifies` link, `test-result` with pass/fail + timestamp.
- **AI does.** Writes the test, then runs `rivet import-results
  --format junit results.xml` to stamp the run into the graph.
  Proposes `verifies` links via `rivet_link` on MCP.
- **Human reviews.** The PR — both the code change and the new
  `verifies` link — in one diff.

### 4.2 ASPICE tracking

- **Question answered.** For each ASPICE process step (SWE.1 through
  SWE.6, SYS.2 through SYS.5, SUP.*), are the required work products
  present and correctly linked?
- **Artifacts used.** The `aspice` schema ships 14 artifact types
  matching the ASPICE 4.0 V-model.
- **AI does.** Generates `sw-unit-verification-result` (SWE.4) entries
  from test output. Drafts `sw-architecture` records from code.
- **Human reviews.** Whether the generated artifacts accurately
  represent the real work — in a PR, before they become evidence.
- **Limit.** No turnkey ASPICE assessment kit. You still need an
  assessor. See [roadmap](roadmap.md).

### 4.3 ISO 26262 / STPA safety analysis

- **Question answered.** For each identified hazard, is there a
  traceable UCA, a controller constraint, and a loss scenario?
- **Artifacts used.** 34 hazards, 62 UCAs, 62 controller constraints
  in rivet's own STPA dogfood (`safety/stpa/`), plus the STPA-Sec
  adversarial extension (`safety/stpa-sec/`) and the tool
  qualification analysis (`safety/stpa/tool-qualification.yaml`).
- **AI does.** Proposes new UCAs from a scenario description using
  the four UCA categories (not-providing / providing / wrong-timing /
  wrong-duration). Runs cross-rule consistency via `rivet validate`.
- **Human reviews.** Safety engineer signs off on the UCA taxonomy
  and the controller-constraint derivation.
- **Limit.** There is no `iso-26262.yaml` schema yet — today you use
  `iec-61508.yaml` (ISO 26262 is derived from IEC 61508) plus the
  STPA and safety-case schemas. A dedicated ISO 26262 work-product
  schema is **planned for v0.5.0**.

### 4.4 Requirements engineering

- **Question answered.** For each requirement, what design satisfies
  it, what feature realises it, what test verifies it, and is there
  coverage across the chain?
- **Artifacts used.** The classic `REQ → DD → FEAT → TEST` chain with
  `rivet coverage` and `rivet matrix`. Baseline scoping via
  `rivet validate --baseline v0.4.0` limits the view to artifacts
  frozen at a given release.
- **AI does.** Drafts requirements from user intent, proposes the
  decomposition tree, emits `satisfies`/`refines`/`verifies` links.
- **Human reviews.** The semantic correctness of the decomposition —
  rivet only guarantees structural integrity.

### 4.5 Variant / Product Line Engineering

- **Question answered.** For a given variant (feature configuration),
  which requirements, tests, and hazards apply — and is the variant
  constraint-satisfiable?
- **Artifacts used.** `feature-model.yaml` (the feature tree),
  `variant-config.yaml` (selections), `binding.yaml` (feature →
  artifact links). See `examples/variant/`.
- **AI does.** Proposes variant bindings from user-stated
  preferences. Queries via s-expression — `(and (= type
  "requirement") (has-tag "stpa"))` — using the `forall`, `exists`,
  `reachable-from`, `reachable-to` predicates built into the
  evaluator.
- **Human reviews.** Whether the feature-model constraints encode
  the real product line rules.

### 4.6 LLM-assisted code review and authoring

- **Question answered.** Can my AI agent read the trace graph and
  propose mutations that rivet server-side-validates before I accept
  them?
- **Artifacts used.** All of them, via MCP.
- **AI does.** Calls the MCP tools: `rivet_list`, `rivet_get`,
  `rivet_query`, `rivet_stats`, `rivet_coverage`, `rivet_schema`,
  `rivet_embed`, `rivet_add`, `rivet_modify`, `rivet_link`,
  `rivet_unlink`, `rivet_remove`, `rivet_validate`,
  `rivet_snapshot_capture`, `rivet_reload`.
- **Human reviews.** The MCP audit log (`rivet mcp` writes every
  mutation call as JSONL to the project directory) plus the git diff.

### 4.7 Provenance and AI attestation

- **Question answered.** Which AI session authored which artifact,
  which model produced it, and did a human approve it?
- **Artifacts used.** Every artifact has an optional `provenance`
  object: `created-by` (human / ai / ai-assisted), `model`,
  `session-id`, `timestamp`, `reviewed-by`.
- **AI does.** `rivet stamp <ID> --created-by ai-assisted --model
  claude-opus-4-7` on every touch. A PostToolUse hook in
  `.claude/settings.json` automates this.
- **Human reviews.** The stamp record in the PR. Missing or stale
  provenance is a review smell.
- **Why it matters.** Prep for EU AI Act Article 12 ("logging of
  events over the lifecycle") and the analogous runtime-evidence
  requirements in ISO/PAS 8800.

### 4.8 Cross-tool interop

- **Question answered.** Can I use rivet as an AI-querying and
  validation layer over an existing Polarion, Jira, or DOORS
  deployment?
- **Artifacts used.** `rivet import` from ReqIF 1.2 (DOORS / Polarion
  / codebeamer) and sphinx-needs JSON.
- **Exports.** ReqIF, HTML, Zola (multi-project with `--prefix`),
  Gherkin (`rivet export --gherkin` generates `.feature` files from
  acceptance criteria), and generic YAML.
- **Limit.** Direct Polarion REST integration is **planned for
  v0.5.0**. See
  [docs/design/polarion-reqif-fidelity.md](design/polarion-reqif-fidelity.md)
  for a field-by-field audit of what the two paths can and cannot
  carry — today and after v0.5.0.

### 4.9 Safety case assembly (GSN)

- **Question answered.** Is there an explicit argument — goal,
  strategy, solution, context, assumption — that links claims to
  evidence?
- **Artifacts used.** `schemas/safety-case.yaml` (GSN 3 community
  standard) with cross-schema bridges to STPA and EU AI Act
  (`schemas/safety-case-stpa.bridge.yaml`,
  `schemas/safety-case-eu-ai-act.bridge.yaml`).
- **AI does.** Drafts goal / strategy / solution nodes from
  requirements + hazards + test evidence.
- **Human reviews.** The safety engineer signs off on the argument
  structure — rivet checks that every node references something
  real.

### 4.10 Tool qualification (TCL / TQL)

- **Question answered.** Is rivet itself qualified as a development
  tool for my certification context (ISO 26262-8 §11, DO-178C §12.2,
  IEC 62304 §8.4)?
- **Artifacts used.** `safety/stpa/tool-qualification.yaml` is
  rivet's own STPA-based tool-confidence analysis (TCL 1). It is
  dogfood, but it is also a template you can copy into your project
  and adapt.
- **AI does.** Proposes tool-impact analyses for new rivet features.
- **Human reviews.** The tool user signs off on TCL assignment.
- **Limit.** A full qualification kit (tool operational requirements,
  verification procedure, qualification report) is **planned for
  v0.5.0**.

### 4.11 Spec-driven development

- **Question answered.** Does my code meet the declared constraints
  in the spec artifacts?
- **Artifacts used.** The s-expression evaluator
  (`rivet-core/src/sexpr_eval.rs`) supports `forall`, `exists`,
  `has-tag`, `has-link-type`, `reachable-from`, `reachable-to`,
  arithmetic, equality, boolean ops. Constraints live in the schema
  next to the artifact type they constrain.
- **AI does.** Writes code; runs `rivet validate` to check the
  declared constraint language is satisfied.
- **Human reviews.** The constraint itself in the schema, not the
  artifact. Once a constraint is reviewed, it re-applies to every
  artifact of that type forever.

---

## 5. Human vs AI split — explicit

| Task | Human does | AI agent does |
|---|---|---|
| Authoring a requirement | reviews + approves the PR | drafts YAML from user intent via `rivet_add` |
| Linking artifacts | reviews the `satisfies`/`verifies`/`refines` edges in the diff | proposes links via `rivet_link` on MCP |
| Validation | runs `rivet validate` locally before PR | gets structured diagnostics via `rivet_validate` tool |
| Coverage reports | reads the dashboard at `rivet serve` | embeds `{{coverage}}` in generated docs via `rivet_embed` |
| Variant check | reads PASS/FAIL on `rivet validate --variant` | generates variant bindings from feature preferences |
| Provenance | reviews the `provenance` block in the stamp | calls `rivet stamp` on every touch (or PostToolUse hook) |
| Compliance export | signs the report | produces ReqIF / Zola / JSON on demand via `rivet export` |
| Tool qualification | assigns TCL / TQL | proposes tool-impact analysis for new rivet features |
| Schema changes | reviews the schema semantics | never touches schemas unless explicitly asked |

The *asymmetry* is the design: the human owns semantic correctness;
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
  **planned for v0.5.0** — the design is already in
  [docs/design/polarion-reqif-fidelity.md](design/polarion-reqif-fidelity.md).
- **Not yet a turnkey ISO 26262 solution.** There is no
  `iso-26262.yaml` schema today. You assemble from `iec-61508.yaml`
  + STPA + safety-case + your own overlay. A dedicated schema is
  **planned for v0.5.0**.
- **Not yet distributed via npm.** The `claude mcp add rivet npx -y
  @pulseengine/rivet mcp` flow is **planned for v0.5.0**. Today you
  install via `cargo install --path rivet-cli` and point your MCP
  client at the built binary.
- **Not suitable for teams without git discipline.** The artifacts
  live in the repo. Branches, PRs, and reviews are the workflow —
  not a bolt-on.
- **Not a secrets store, CI-secret manager, or credential vault.**
  Artifacts are text files; they are indexed, validated, and
  rendered, but they are not encrypted.
- **Not a project-management tool.** No Gantt, no sprint planning,
  no Kanban. rivet tracks traceable engineering artifacts, not
  tickets.

---

## 7. Quick start

Shortest path from zero to validated evidence.

```bash
# 1. Install (npm distribution planned for v0.5.0)
cargo install --path rivet-cli

# 2. Initialise a project (choose a preset: dev / aspice / stpa / iec-61508 / ...)
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
8 an AI agent can read and propose mutations to the graph, all
server-side-validated before the mutation lands.

---

## 8. Where to go next

- **CLI reference.** `rivet docs --list` for all built-in topics, or
  the `## CLI Commands` table in [README.md](../README.md).
- **Getting started tutorial.**
  [docs/getting-started.md](getting-started.md).
- **Architecture.** [docs/architecture.md](architecture.md).
- **Schemas in depth.** [docs/schemas.md](schemas.md).
- **STPA methodology dogfood.** [docs/stpa-sec.md](stpa-sec.md) plus
  `safety/stpa/` and `safety/stpa-sec/` in the repo.
- **Verification evidence.** [docs/verification.md](verification.md)
  — 27 Kani BMC harnesses, Verus specs, Rocq proofs for the core
  validation rules, 324 Playwright end-to-end tests.
- **Polarion / ReqIF fidelity audit.**
  [docs/design/polarion-reqif-fidelity.md](design/polarion-reqif-fidelity.md)
  — field-by-field honesty about what survives the interchange.
- **Roadmap.** [docs/roadmap.md](roadmap.md).
- **Audit report.** [docs/audit-report.md](audit-report.md) — the
  current state of doc-vs-reality after PR #171's audit.

---

*Last updated 2026-04-19 for v0.4.1 positioning. If a claim in this
doc does not match the tree at `main` HEAD, file an issue — the
purpose of rivet is that its own evidence chain is audit-grade.*
