# Eclipse S-CORE vs pulseengine — way-of-working comparison

**Status**: reference doc. Captures an observational comparison
between two methodologies that solve overlapping problems with
opposite defaults. Not a verdict — useful any time the rivet team
needs to make a positioning decision against an external safety
project.

**Originating context**: the
[`pulseengine/playground-eclipse-score`](https://github.com/pulseengine/playground-eclipse-score)
workspace surfaced these observations while converting eclipse's
sphinx-needs corpus into rivet typed YAML.

## The big shape

**Eclipse S-CORE** is a *document-centric* methodology built on the
Sphinx ecosystem. Their atomic unit is the RST file: prose-with-
embedded-directives that compiles into a published documentation
site. The traceability graph emerges from sphinx-needs directives
that authors hand-write *inside* the RST source. Operationally,
"the work product" is the rendered HTML; "the data" is the
directives that produce it.

**Pulseengine** is a *graph-centric* methodology built on typed YAML.
The atomic unit is a `.yaml` artifact: a structured record validated
against a schema and stored in git. Documents are emitted *from* the
graph, not the other way around. Operationally, "the work product"
is the validated graph; rendering is a downstream concern
(`rivet serve` / `rivet export --format html`).

This is a real difference in default direction, not just storage
format. Eclipse's authors write prose and accidentally form a graph;
pulseengine's authors write graph nodes and rendering follows.

## Axis-by-axis observations

### Storage shape

| | Eclipse | Pulseengine |
|---|---|---|
| Authoring surface | RST directives in `.rst` files | YAML artifacts in `.yaml` files |
| Source-of-truth granularity | One file = one document = multiple needs | One file = many artifacts of mixed types, or one artifact per file (both supported) |
| Mutation model | Edit RST in-place; sphinx rebuilds | Edit YAML in-place; rivet revalidates (incremental via salsa) |
| Schema | `metamodel.yaml` interpreted by Python (`score_metamodel/yaml_parser.py`) at sphinx-build time | `schemas/*.yaml` loaded by Rust at validate time |

### Validation philosophy

Eclipse validates **at render time**: their `score_metamodel/checks/`
Python module runs as Sphinx warnings during
`bazel run //:docs_check`. The build fails if anything is off
(`-W --keep-going`). Validation is a *side-effect of producing the
docs*.

Pulseengine validates **as an operation in its own right**:
`rivet validate` reads the YAML, applies the schema, reports
diagnostics. Docs can be built or not; validation runs either way.
Validation is *first-class*.

This shows up in how each side thinks about CI: eclipse's
`docs_check` *is* the gate; pulseengine has `validate` *plus*
`mutate` *plus* `coverage` *plus* `commits` *plus* `audit`, each
callable independently and each can fail-fast.

### Cross-artifact rules

Eclipse expresses cross-graph rules in **Python**
(`graph_checks.py` with `local_check`/`graph_check` decorators) and
small **YAML expressions** (`metamodel.yaml`'s `graph_checks:`
section using `==/in/and` micro-DSL).

Pulseengine expresses them in the **schema YAML** itself as
declarative `traceability-rules:` entries with `required-link /
required-backlink / source-type / target-types / severity`. Same
rules ("QM can't satisfy ASIL") but the *language they're written in*
is the same language used to declare the artifact types.

### Process modelling

Eclipse models the process **as needs**: workflows are `workflow::`
directives, roles are `role::` directives, work products are
`workproduct::` directives, methods are `gd_method::` directives.
The development process IS data in the same graph as the
requirements it produces. Reading
`process_description/process/process_areas/safety_analysis/
safety_analysis_workflow.rst` you find a typed workflow with
`:input:`, `:output:`, `:responsible:`, `:approved_by:` links.

Pulseengine models the process **as metadata around code**: commit
trailers (`Implements: REQ-NNN`), `rivet commits` enforces them,
`rivet audit` cross-checks AI-session provenance, `ai-session` and
`ai-found-defect` artifacts capture AI authorship. The process
artifacts are about who-authored-what-when, not about
who-reviewed-what-by-whom-when. There's no `workflow` or `role`
artifact type in any pulseengine schema except the eclipse-score
ones added in `score.yaml` round 1.

This is the most visible philosophy difference: eclipse describes the
*human process*, pulseengine describes the *machine-checkable
claims*.

### Safety case

Eclipse's safety case is a **rendered RST document** —
`module_safety_package_fdr.rst` is the safety case, containing
in-line `:need:` citations to ISO 26262 clauses, ASIL evidence, FMEA
references. To assess compliance, an auditor reads the rendered HTML.

Pulseengine's safety case is **a graph of typed artifacts** — STPA
losses → hazards → constraints → UCAs → loss-scenarios, plus FMEA +
DFA + verification + attestation. To assess compliance, an auditor
runs `rivet matrix` / `rivet coverage` / `rivet export` and reads
the *computed* report.

Eclipse: safety case is authored. Pulseengine: safety case is
computed.

### Architecture modelling

Eclipse made **the typed need-graph itself** the architecture model
(see the audit at the corpus oracle: zero `.aadl`/`.sysml`/`.capella`
files across 58 repos, 90+ architecture diagrams generated from the
typed-graph via `score_draw_uml_funcs` registering `draw_feature` /
`draw_component` / `draw_module` / `draw_interface` Jinja callables
that walk typed links and emit PlantUML at sphinx-build time).
Validation is **structural** (link integrity) but not **analytical**
(no scheduling, no latency, no formal property check).

Pulseengine has `spar` (AADL v2.3 frontend with 27+ analysis passes —
scheduling, latency, ARINC 653 partitioning, EMV2 fault trees, ASIL
decomposition solver, modal filtering, piecewise-affine arrival
curves). The model is similarly typed-graph at the surface, but the
analysis layer is much richer.

Both committed to "model is typed graph, no separate modelling-tool
file drifting away from the docs." Pulseengine adds the
analysis-pass layer on top.

### Tool qualification

Eclipse qualifies tools **inside the same graph**: every tool
(clang-tidy, clippy, gtest, etc.) is a `doc_tool::` directive with
`:tcl: LOW`, `:safety_affected: ...`, `:realizes: wp__tool_
verification_report`. The tool qualifies itself by being a node in
the same graph it operates on. Recursive: docs-as-code qualifies
docs-as-code (with `status: evaluated` and no TI/TD analysis — the
ISO 26262 reviewer in our persona panel flagged this as an
audit-day question).

Pulseengine qualifies tools through **dedicated artifact types** and
a published `SAFETY.md` self-claim. The qualification is a separate
construct from the artifact graph; it sits alongside (also
self-claimed today, per the DO-330 reviewer in our persona panel).

### Compliance reporting

Eclipse renders compliance reports **in-page**: `needpie::` and
`needtable::` directives compute coverage live from the graph at
sphinx-build time and embed it in the published HTML. ISO 26262
coverage = a pie chart on the standards page.

Pulseengine renders compliance through **multiple channels**:
- `{{coverage}}` / `{{matrix}}` / `{{table}}` embeds in markdown docs
- `rivet matrix` / `rivet coverage` CLI
- `/api/v1/coverage` JSON API for Grafana
- `rivet export --format html` static `matrix.html` / `coverage.html`
- `rivet serve` live dashboard

Eclipse: one rendering, in-doc. Pulseengine: many renderings, one
data source.

### Cross-repo composition

Eclipse uses **sphinx-needs `external_needs`** plumbed through
Bazel: each downstream repo Bazel-deps the upstream `needs.json`,
which sphinx-needs loads at build time and merges into the local
graph.

Pulseengine uses **`externals:` in rivet.yaml** plumbed through git:
each project declares upstream peers; `rivet sync` materialises them
as `.rivet/repos/<name>/`; `rivet supplier` handles cross-org
boundaries with `derives-from-external` links and content-addressed
hashes. The playground demonstrates this at 58-external scale.

Eclipse: Bazel-mediated, build-time merge.
Pulseengine: git-mediated, declared-dependency model.

### Variants / feature model

Eclipse has **one stakeholder requirement** saying variant
management is needed, with `rationale: tbd`. No metamodel construct.
Their archived `inc_process_variant_management` repo (single-author
experiment with `sphinx_ifelse` for OS-conditional doc rendering,
archived 2025-08+) is the only attempt and was rendering-layer only.

Pulseengine has a **first-class feature-model.yaml** with
attribute-schema, constraints, alternative/or/mandatory groups, plus
bindings + named variants + `rivet variant solve/matrix/explain`
operating on it.

This is the place where the directions diverge most: eclipse has the
*requirement*, pulseengine has the *answer*. The playground's
`variants/` directory is the worked starter example.

### Source-code linking

Eclipse links source to requirements via **comments in source**:
`// req-Id: foo` scanned by `score_source_code_linker` extension at
sphinx-build time, attached as `source_code_link` attributes on the
matching need.

Pulseengine links via **commit trailers**: `Implements: REQ-NNN` in
the commit message body, enforced by `rivet commits` against a
per-commit-message contract. The link is per-commit, not per-line.

Eclipse: fine-grained (source line ↔ requirement). Pulseengine:
coarse-grained (commit ↔ requirement). Both auditable; different
granularity.

### Documentation surface

Eclipse: **the docs ARE the deliverable.** The published HTML site
is what auditors read, what stakeholders cite. The data structure
is in service of the document.

Pulseengine: **the docs are A deliverable.** The data structure is
the primary artifact; HTML export, dashboard, and Grafana embeds are
alternative views. The graph survives independent of any rendering.

## Where they're doing the *same thing* differently

| Same problem | Eclipse | Pulseengine |
|---|---|---|
| "Tag all needs in this subtree" | `needextend :+tags:` at file-top | `tags: [...]` on each artifact (or schema-level base-tag) |
| "Cite a requirement inline" | `:need:`foo`` RST role | `[[foo]]` or `{{artifact:foo}}` markdown |
| "Show coverage per standard" | `needpie::` with filter function | `{{coverage:rule-name}}` embed or `/api/v1/coverage?rule=...` |
| "Track who-did-what" | `workflow + role + workproduct` graph | `commit trailers + ai-session + audit` |
| "Make tool qualification auditable" | `doc_tool` need type + TCL field | `tool-qualification` schema + signed attestation |
| "Render the safety case" | RST → HTML | YAML → markdown → HTML |
| "Cross-repo references" | sphinx-needs `external_needs` via Bazel | rivet `externals:` via git |

## Where they're doing *different things*

| Eclipse does, pulseengine doesn't | Pulseengine does, eclipse doesn't |
|---|---|
| In-page `needtable` / `needpie` widgets at sphinx-build time | Grafana JSON API for external dashboards |
| `:safety:` enum enforced at write time by metamodel regex | STPA / STPA-Sec / STPA-AI schemas |
| Process modelled as graph (workflow / role / workproduct) | Variant model + constraint solver |
| Sphinx layout customisation (`needs_layouts`) | AI provenance + audit (`ai-session`, `ai-found-defect`) |
| Source-line `// req-Id` comments scanned at build time | MC/DC truth tables via `witness` |
| Bazel-driven cross-repo composition | Cross-org typed supplier boundary (`derives-from-external`) |
| | Formal verification integration (Kani, Verus, Rocq) |
| | Falsification methodology explicit in tooling |
| | MCP server for agent-driven traceability |
| | Self-application of qualification dossier as typed artifacts |

## The meta-pattern

Eclipse's setup feels like **a documentation system that became a
requirements system**. Sphinx-needs grew out of Sphinx; the gravity
is toward "make the docs better." Validation, traceability, and
compliance are *features added to* the docs pipeline.

Pulseengine's setup feels like **a verification system that grew
documents**. Rivet started as a graph + schema + validator; docs
were added later. The gravity is toward "make the graph more
provable." Rendering is *features added to* the verification
pipeline.

Same problem space (safety-critical SDLC traceability). Opposite
starting points. Different gravities.

That's the comparison without the verdict.

## When this matters for a rivet positioning decision

Any time someone asks "should rivet adopt approach X from eclipse?"
or "should rivet add a feature Y eclipse has?", the answer depends
on which gravity well it lands in:

- Features that strengthen the graph + analysis (more oracle gates,
  more schema rigor, more typed claims) → aligned with pulseengine's
  gravity, low resistance to land.
- Features that strengthen the doc-rendering surface (more inline
  widgets, richer layouts, sphinx-style live computation in pages)
  → orthogonal to pulseengine's gravity. Land via embeds + the
  Grafana API, not via making rivet docs more Sphinx-like.
- Features that grow the typed metamodel (more standards schemas,
  more cross-repo predicates) → directly in pulseengine's wheelhouse.
- Features that grow the process surface (more workflow/role/
  workproduct types) → tension. Pulseengine traditionally lets git
  + the AI-provenance machinery cover process; eclipse-style
  workflow modelling is a different design.

When the rivet team adds a feature, asking "which gravity is this
pulling toward?" is a quick way to spot whether it's a natural
extension or a methodology drift.
