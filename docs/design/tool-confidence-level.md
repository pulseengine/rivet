<!-- rivet-docs-check: design-doc-aspirational-ok -->

# Tool Confidence Level (TCL) — research and design for rivet

**Status:** design / research note (not a qualification opinion)
**Audience:** safety leads, sales engineers fielding TCL questions, rivet
maintainers planning a `tool-qualification` workstream
**Date:** 2026-04-27
**Refs:** `docs/design/iso26262-artifact-mapping.md` §C row 32, `docs/design/ai-safety-cyber-hitl.md`,
`safety/stpa/tool-qualification.yaml`, `safety/stpa-sec/tool-qualification-sec.yaml`,
`schemas/iso-pas-8800.yaml` (`ai-tool-qual`), `schemas/score.yaml` (`tsf.classification`),
`schemas/en-50128.yaml` (`tool-qualification`), `docs/oracles.md`,
`docs/mutation-testing.md`, `SAFETY.md`, `docs/verification.md`.

> **Source-fetch limitation, called out up front.** Live web fetch was
> denied for this session. Standard-clause references in §2 are quoted
> from the author's prior reading and the rivet repo's own training-time
> citations; entries flagged *(unverified clause-level)* must be
> re-checked against a paid copy of the standard before any external
> publication. The internal-rivet citations (file paths and code) are
> verified against `main` at the date above.

---

## 1. Executive summary

Rivet today positions itself in the existing
`safety/stpa/tool-qualification.yaml` STPA at **TCL 1** — a self-claim,
no qualification dossier, scoped to "rivet validates and we trust the
output." That claim is honest as a *target* but is not yet supported by
the dossier-shaped evidence an auditor expects. The user is correct that
**TCL 1 is the wrong terminal answer for an AI-in-the-loop traceability
substrate**: a tool whose explicit job is to make AI-authored evidence
auditable cannot disclaim error-detection responsibility the way a
read-only ALM can. The right level for rivet's intended role is **TCL 2
with a TCL 3 path**, supported by the ingredients already shipped (Verus,
Kani, Rocq, mutation testing, oracle-gated pipelines, cited-source hash
verification, schema-migrate snapshot/abort, structural validators)
plus three new artifacts: a typed `tool-confidence` record, a
qualification dossier topic in `rivet docs`, and an `ai-found-defect`
provenance type. Polarion's TCL 1 self-claim is defensible *only*
because the human review workflow is the detection mechanism — when AI
drafts the artifact, that defence weakens, and rivet's higher bar
becomes the right shape for the same role.

---

## 2. Standards primer — TCL / TQL / TI / TD across five regimes

Each regime asks the same two questions of every development tool used
on a safety project: **Could a tool error end up in the safety case?**
(impact) and **Would we catch it before it does?** (detection /
qualification). Different standards encode the answer with different
letters.

### 2.1 ISO 26262:2018 Part 8, Clause 11 — automotive

*(Clause numbers below are from training-time references; the structure
is widely published in conference talks and TÜV white-papers, but
verbatim wording requires the paid standard.)*

The clause defines two parameters and one derived classification:

- **TI — Tool Impact.** Two values: **TI1** (no possibility that a
  malfunctioning tool inserts/fails-to-detect errors in a safety-related
  item) and **TI2** (such a possibility exists).
- **TD — Tool error Detection.** Three values: **TD1** (high confidence
  the user/process detects a tool error before it reaches the safety
  case), **TD2** (medium confidence), **TD3** (low or no confidence).
- **TCL — Tool Confidence Level.** Derived from the (TI, TD) cell:

  | TI \ TD     | TD1  | TD2  | TD3  |
  |-------------|------|------|------|
  | **TI1**     | TCL1 | TCL1 | TCL1 |
  | **TI2**     | TCL1 | TCL2 | TCL3 |

  TCL1 is the lowest confidence demand (no qualification evidence
  required); TCL3 is the highest. Confusingly, several standards (and
  several rivet documents) use "TCL 1" to mean "highest confidence" —
  see §2.6 below for the convention rivet should adopt.

- **Qualification methods.** For TCL2/TCL3, ISO 26262-8 Table 4 lists:
  (a) **increased confidence from use** (proven-in-use evidence), (b)
  **evaluation of the tool development process** against a recognised
  standard, (c) **validation of the software tool**, (d) **development
  in accordance with a safety standard**. Method choice depends on ASIL
  of the work product the tool touches.

### 2.2 IEC 61508-3:2010 — generic functional safety

- **T1 / T2 / T3 categories.** T1 = no impact on safety code (e.g. text
  editor). T2 = supports verification / cannot insert errors but can
  fail to detect them (e.g. test runner, coverage tool). T3 = generates
  output used directly in safety code or its verification (e.g.
  compiler, code generator, model-to-C tool).
- **Annex C-D / Table A.3** *(unverified clause-level)* lists
  techniques required per SIL: T3 tools at SIL 3/4 require validation
  evidence, T2 at SIL 3/4 requires demonstrated suitability, T1 needs
  none.
- The IEC 61508 framing is closer to TI than to TD — the category
  records *what the tool can do*, not what the user catches. TD is
  implicit in the qualification activities for T2/T3.

### 2.3 DO-178C / DO-330 — civil aviation

- **DO-178C §12.2** classifies tools as **Tool Type 1** (output
  becomes part of airborne software), **Tool Type 2** (eliminates,
  reduces, or automates verification activities and could fail to
  detect errors), and **Tool Type 3** (legacy term, merged into the
  others in the C revision).
- **DO-330 TQL-1 to TQL-5.** The Tool Qualification Level matrix maps
  (Tool Type, DAL of the software the tool affects) to a TQL:

  | Tool criteria \ DAL  | A    | B    | C    | D    |
  |----------------------|------|------|------|------|
  | Criteria 1 (Type 1)  | TQL-1| TQL-2| TQL-3| TQL-4|
  | Criteria 2 (Type 2)  | TQL-4| TQL-4| TQL-5| TQL-5|
  | Criteria 3 (Type 2 mild) | TQL-5| TQL-5| TQL-5| TQL-5|

  *(Cell values from training-time references; the matrix shape is
  widely published, exact entries should be re-checked.)*
  TQL-1 demands the most rigorous DO-330 process activities; TQL-5 the
  least.

### 2.4 EN 50128:2011 — railway software

- **Class T1 / T2 / T3** mirrors IEC 61508. Clause 6.7 *(unverified)*
  enumerates qualification expectations: documented requirements,
  verified outputs, traceability of tool versions. SIL 3/4 raise the
  bar for T2/T3.
- The rivet schema `schemas/en-50128.yaml` already declares a
  `tool-qualification` artifact-type (currently with empty `fields:` —
  a bookkeeping placeholder, not a typed record).

### 2.5 ISO/SAE 21434:2021 — automotive cybersecurity

- Tool considerations live in **Clause 5.4.6** *(unverified)*: tools
  affecting cybersecurity work products inherit confidence-management
  obligations analogous to ISO 26262-8 §11. The standard does not
  introduce a separate TCL/TQL ladder; the expectation is that the
  same tool be qualified once for the joint safety + security
  toolchain. Practical impact: a TCL2 claim should cover both the
  STPA artifact set *and* the STPA-Sec artifact set rivet ships.

### 2.6 ISO/PAS 8800:2024 — AI in road vehicles

- Introduces a five-level **TQL-1..TQL-5** ladder for tools that author,
  verify, or qualify AI elements. The rivet schema
  `schemas/iso-pas-8800.yaml` exposes this as the `ai-tool-qual.tool-class`
  field.
- Higher TQL is required when the tool touches data quality, training,
  or operational evidence for the AI element. A traceability tool
  binding `requirement` to `ai-element` (rivet's exact role) sits
  squarely in this ladder's middle range, not at TQL-5 (lowest).

### 2.7 Numbering convention warning

ISO 26262, EN 50128, IEC 61508: **lower number = lower bar.** TCL3 / T3
demand the most evidence.

DO-330, ISO/PAS 8800: **lower number = higher bar.** TQL-1 demands the
most evidence.

Rivet's `safety/stpa/tool-qualification.yaml` line 14 says
"Tool Confidence Level (TCL): TCL 1 (highest)." That is the **DO-330
convention** applied to a 26262 acronym — sloppy and an audit-review
flag in itself. The rivet documentation should switch consistently to
the standard-native numbering and never abbreviate "TCL 1" without the
regime in front of it. **Recommendation A1** (see §8): rename the
existing artifact's TCL annotation to "ISO 26262 TCL3" (highest) or
"DO-330 TQL-2" (whichever frame the team picks for v0.5.0).

---

## 3. Polarion's TCL claim — analysis

*(Live fetch of Polarion's tool-qualification kit was unavailable this
session. The summary below is from prior reading and `docs/design/polarion-reqif-fidelity.md`.
Verbatim quotation requires re-fetch from siemens.com before external
use.)*

### 3.1 What Siemens publicly says

- Siemens publishes a **Polarion ALM Tool Qualification Kit** for ISO
  26262 (and adjacent IEC 62304 / DO-178C kits). It is a *self-claim*
  package with a tool-operational-requirements document, a verification
  procedure, qualification report, and a tool-error log. *(unverified
  in this session; reproduce against current Siemens download portal
  before quoting.)*
- The classification typically asserted in their kit is **TCL1 in ISO
  26262 terms** — i.e. *no qualification evidence required* — based on
  the argument that **Polarion is a passive ALM repository whose output
  is reviewed by qualified humans** before it is used in the safety
  case. The kit covers the residual TI2/TD1 risk by documenting the
  human review workflow as the detection mechanism.
- This is a TI2/TD1 → TCL1 argument. It is internally consistent: an
  ALM tool *can* output a wrong artifact (TI2), but the standard
  workflow inserts a human reviewer between Polarion's output and the
  safety case (TD1).

### 3.2 Is the user right that TCL1 is "too low"?

**The user is right for rivet, and only conditionally right for Polarion.**

The TI2/TD1 → TCL1 derivation is sound *given the assumption that the
human review is independent and competent*. That assumption holds
reasonably well when:

- The artifact author is a human who typed the requirement.
- The reviewer reads the *full* artifact text, not a summary.
- The reviewer's domain knowledge is sufficient to detect a wrong link.

It begins to fail when:

- The author is an AI and the reviewer's effective oversight is "skim
  the diff." (Automation bias is a recognised effect — EU AI Act
  Article 14 explicitly names it as something the human-oversight
  designate must be trained against.)
- The reviewer relies on the tool's *aggregate* output (coverage
  percentages, pass/fail summaries) rather than re-deriving each
  judgment.
- The tool surface is large enough that no single reviewer can hold the
  full toolchain configuration in their head.

Both the second and third bullet apply to *any* sufficiently rich ALM
under heavy use, AI or not. The first bullet is the AI-specific
intensifier the user is pointing at: it doesn't fundamentally change
the math, but it makes TD1 (high detection confidence) much harder to
defend with a straight face. In TI/TD terms, **AI-authored content shifts
TD from TD1 to TD2 unless the tool itself supplies a non-human
detection layer.** That non-human detection layer is precisely what
rivet ships (validate, oracle-gated pipelines, cited-source hashing)
and what plain Polarion does not.

So Polarion's TCL1 is conditionally honest *for human-authored
content* and increasingly threadbare *for AI-authored content*. Rivet's
opportunity is to be the tool that lets the customer keep TCL1 by
contributing TD-raising machinery to the toolchain, **not** to claim
TCL1 as a passive ALM peer of Polarion.

### 3.3 Scope and conditional language to expect

Customer claims based on the Polarion kit are typically conditioned on:

- "When used as configured" — the qualification covers a specific
  configuration baseline; user-added scripts / extensions / custom
  workflows fall outside.
- "When integrated with X" — the kit may presume specific integrations
  (Polarion → Jenkins, Polarion → Bitbucket) and exclude others.
- The kit is a *supplier-provided argument*; the project's safety
  manager still owns the final TCL decision in the project context.

Rivet should adopt the same shape: any qualification claim must name
the configuration baseline, the integrations in scope, and the
explicit responsibility split with the customer's safety manager.

---

## 4. Competitor baseline — what other ALM / traceability tools claim

| Tool | Public TCL/TQL claim | Basis | Source posture |
|---|---|---|---|
| **IBM DOORS / DOORS Next** | ISO 26262 TCL1 / IEC 61508 T2 in customer dossiers; not generally a public claim | Self + customer audit | Closed; per-customer NDA dossier |
| **Siemens Polarion ALM** | ISO 26262 TCL1 via supplier kit | Self-claim + reviewer-as-detection | Public-ish (kit available to customers) |
| **PTC codeBeamer** | ISO 26262 / IEC 62304 / DO-178C "tool qualification kit" available | Self + supplier kit | Per-customer |
| **Jama Connect** | "Compliant-ready" framing (ISO 26262, IEC 62304) — TCL1 typical | Self-claim, human-review-as-detection | Public marketing |
| **Ansys medini analyze** | ISO 26262 TCL3 (highest) for FMEDA / FTA — *they* generate numeric safety evidence | Validation + supplier kit | Public |
| **BTC EmbeddedPlatform** | ISO 26262 TCL3 / DO-330 TQL-4 for back-to-back & MIL/SIL/PIL | Validation + supplier kit | Public |
| **sphinx-needs** | No TCL claim. Project-level documentation only. | None | OSS |
| **strictDoc** | No TCL claim. | None | OSS |
| **rivet (today)** | Aspirational TCL3-per-26262 (highest, miscalled "TCL1" in the existing STPA), no dossier yet | Self-STPA, no kit | OSS |

*(Rows above are from training-time references and `docs/design/polarion-reqif-fidelity.md`;
verify current marketing claims against vendor sites before publishing externally.)*

The pattern is consistent: **passive ALM stays at TCL1 by leaning on
human review; tools that *generate* numeric safety output (medini, BTC)
go all the way to TCL3 with a real validation dossier.** Rivet sits in
the middle: it is not a pure ALM (it generates coverage metrics, runs
oracles, scores variants, validates traceability rules) and it is not a
numeric safety calculator (it does not compute SPFM/LFM/PMHF).

The honest peer group for rivet is **medini / BTC**, not Polarion. The
practical bar is therefore **TCL2 with a TCL3 path**, not "match
Polarion's TCL1."

---

## 5. Rivet's safeguards mapped to TI / TD

The TI / TD framing is the right axis to evaluate each rivet feature
against. *Lower TI* means the tool *cannot* introduce / fail-to-detect
an error in the first place. *Higher TD* means even if the tool errs,
the user / process catches it before it reaches the safety case.

### 5.1 What rivet actually authors versus consumes

Rivet's **direct outputs** that could become safety-case evidence:

1. `rivet validate` PASS/FAIL verdicts (used as gating evidence in CI).
2. `rivet coverage` numeric percentages (used as evidence of trace
   completeness).
3. `rivet export` / Zola export pages (used as the *form* in which
   evidence reaches an auditor).
4. ReqIF / OSLC roundtrip outputs (used to feed Polarion / DOORS).
5. Commit-traceability matrix from `rivet commits` (used as evidence
   that code changes trace to requirements).
6. Variant-emit manifest (used to scope a release to a configuration).
7. `rivet check <oracle>` JSON envelopes (gating decisions in
   pipelines).

Each of those is a TI2 surface — a wrong output here can degrade the
safety case. There is no TI1 (no-impact) feature in rivet's main path,
and that is the point: rivet exists to be in the safety case, not
adjacent to it.

### 5.2 TD-raising machinery rivet already ships

For each safeguard, the question is: *does it lower TI (rivet cannot
emit a wrong output here) or raise TD (even if rivet does, we catch it
before it lands in the safety case)?*

| # | Safeguard | TI / TD effect | Strength | Reference |
|---|---|---|---|---|
| 1 | **Typed schema with `deny_unknown_fields`** | Lowers TI: ill-typed input fails fast, not silently | Strong | `rivet-core/src/model.rs:62-100` |
| 2 | **Bidirectional link oracle (`rivet check bidirectional`)** | Raises TD: forward/inverse link drift is a bidir-clean violation | Strong | `docs/oracles.md` §1 |
| 3 | **Schema-driven validation (`rivet validate`)** | Lowers TI: link cardinality, allowed-values, traceability-rules enforced before output | Strong | `rivet-core/src/validate.rs` |
| 4 | **Verus specs (`#[cfg(verus)]`)** | Lowers TI for the verified subset (partial coverage) | Medium (partial) | `rivet-core/src/verus_specs.rs`, `verus/BUILD.bazel` |
| 5 | **Kani BMC harnesses** | Lowers TI: panic-freedom + key invariants of validate / coverage / parse-artifact-ref proven up to bounded inputs | Strong (bounded) | `rivet-core/src/proofs.rs` |
| 6 | **Rocq proofs (`proofs/rocq/Schema.v`, `Validation.v`)** | Lowers TI: schema-satisfiability, monotonicity, validation termination, broken-link soundness, store insert/lookup, backlink symmetry — all proved | Strong (axiomatic) | `proofs/rocq/Schema.v` §1 header |
| 7 | **Mutation testing 16-shard** | Raises TD on the test suite itself: catches assertions that don't constrain behaviour | Strong (ASIL B/C/D thresholds 0.80 / 0.85 / 0.90) | `docs/mutation-testing.md` |
| 8 | **Property-based tests + proptest_core** | Lowers TI: store consistency, validation determinism, backlink symmetry randomly stress-tested | Strong | `docs/verification.md` §4 |
| 9 | **Differential testing against ref parser** | Lowers TI on the YAML parser specifically | Strong | `rivet-core/tests/yaml_test_suite.rs` |
| 10 | **Provenance auto-stamp (PostToolUse hook)** | Raises TD: every AI-touched artifact is labelled, so reviewer knows what to scrutinise | Strong | `schemas/common.yaml` `provenance` block + Claude Code hook |
| 11 | **Cited-source hash verification** | Raises TD: an external source cited in a rivet artifact is hashed at stamp time; drift is detected on next validate | Strong (file backend, Phase 1) | `rivet-core/src/cited_source.rs` |
| 12 | **Schema-migrate snapshot/abort** | Lowers TI on migrations: a migration that would corrupt the store is aborted before write | Strong | `rivet-core/src/migrate.rs` (see `rivet docs schema-migrate`) |
| 13 | **Oracle-gated agent pipelines** | Raises TD on AI-authored content: every agent step must clear a deterministic oracle before merge | Strong | `docs/oracles.md` "Pipeline wiring" |
| 14 | **`rivet docs check` (docs-coverage gate)** | Raises TD on documentation-claim drift: stale "runs in CI" / "N artifacts" claims are caught | Medium | `rivet-core/src/doc_check.rs` |
| 15 | **`rivet check review-signoff`** | Raises TD: a `released` artifact whose reviewer == author fires; closes the "AI approved its own work" loophole | Strong | `docs/oracles.md` §2 |
| 16 | **Commit-trailer enforcement (`rivet commits`)** | Raises TD on the commit→artifact link: code change without trailer fails CI | Strong | `CLAUDE.md` "Commit Traceability" |
| 17 | **`rivet validate` deterministic across re-runs (proptest)** | Lowers TI: same input twice gives same output (no nondeterminism in the safety verdict) | Strong | proptest "Validation determinism" |
| 18 | **Restriction-lint set (SCRC Phase 1, DD-058/DD-059)** | Lowers TI: panic / unwrap / arithmetic-side-effects / cast-truncation lints are workspace-`warn` and CI-`-D warnings`. Source-level UB classes blocked. | Strong | `SAFETY.md`, `Cargo.toml` `[workspace.lints.clippy]` |
| 19 | **STPA self-analysis (`safety/stpa/tool-qualification.yaml`)** | Raises TD: the rivet team itself has applied STPA to rivet's outputs; the seven hazards H-TQ-001..007 each have a `system-constraint` saying which oracle / test catches it | Strong | file in repo |

### 5.3 What is *missing* to support a real TCL2 claim

Honest gaps blocking a TCL2 dossier:

- **Tool Operational Requirements (TOR)** document. ISO 26262 §11 / DO-330
  expect a TOR — "what the tool is for, what it is *not* for, the use
  cases and assumptions." Rivet has `docs/what-is-rivet.md` and
  `docs/getting-started.md` but no TOR-shaped artifact.
- **Configuration baseline.** A TCL2 claim must name the qualified
  binary version, schema versions, oracle versions, and dependency
  hashes. Rivet has Cargo.lock + `cargo deny` but no published
  baseline manifest tied to a release.
- **Tool error log + classification.** ISO 26262 §11 expects a
  *known-issues log* with risk-classified entries. Rivet has GitHub
  issues but no qualification-flavoured `tool-defect` artifact type.
- **Qualification-test suite (separate from the project's own tests).**
  Rivet's test suite proves rivet-core invariants. A qualification kit
  re-states, in an auditor-friendly procedure document, *which inputs
  rivet shall produce which outputs for*. The existing tests are the
  raw material; they need a docstring + procedure document on top.
- **`tool-confidence` typed artifact.** Already noted as a gap in
  `docs/design/iso26262-artifact-mapping.md` row 32 (Section C #8). The
  schema sketch there is small and tractable — see §7 below.
- **`ai-found-defect` artifact type.** No type today exists for
  recording an AI-flagged contradiction in the artifact graph. This is
  exactly the surface the user identified as missing.
- **Independence of authoring vs verification.** `rivet validate` is
  authored by the same team that authors rivet's artifacts — for a
  customer's qualification it is "self-test." The customer must be
  able to run an *independent* validation harness; today they can
  (rivet is open source) but the TCL2 dossier needs to make this
  explicit.

---

## 6. The AI-in-the-loop angle

This is the decisive section for the user's question. The traditional
TI2/TD1 → TCL1 argument relies on a human review step that is *the*
detection mechanism. When the same human reviews twenty AI-authored
artifacts in a sitting, that review step degrades — not because the
human is incompetent but because the *unit of judgment* (one artifact
versus the diff of an entire feature batch) shifted under them.

### 6.1 Where rivet's TD machinery substitutes for the eroded human review

| Erosion vector | Rivet's mechanical compensator | Caught how |
|---|---|---|
| AI hallucinates a link target | `rivet validate` broken-link check | At commit time / pre-commit hook |
| AI hallucinates a *plausible* link target that exists but is semantically wrong | `rivet check bidirectional` + schema's `source-types` / `target-types` constraints | At validate time |
| AI cites a paper that doesn't exist | cited-source `kind: file` hash mismatch | At validate time (with `--check-remote-sources` for URLs once Phase 2 lands) |
| AI claims "all 47 requirements verified" when 3 are unverified | `rivet coverage` recomputes from artifacts, not from claim text | At validate time |
| AI re-uses an artifact ID for a different concept | unique-ID enforcement in `Store::insert` (proptest "Duplicate rejection") | At parse time |
| AI approves its own work | `rivet check review-signoff` (reviewer must differ from author) | At release-gate time |
| AI commits without traceability trailer | `rivet commits` CI gate + commit-msg hook | At commit time |
| AI introduces a contradiction across two artifacts | s-expression evaluator's `forall` / `exists` quantifiers in `traceability-rules` | At validate time |
| AI silently changes the meaning of a schema | schema-migrate snapshot/abort | At migrate time |
| AI's edits drift from a documentation claim | `rivet docs check` invariant engine | At CI time |
| AI introduces typed-but-unwired code (Mythos #1) | oracle-pair (excision + git history) under `rivet pipelines` | At pipeline run |

The *shape* of the substitution is: **rivet replaces the implicit
"human caught it on review" with explicit deterministic oracles whose
JSON output is itself an audit artifact.** Each row above is a TD-raise
that is mechanically replayable — the auditor can see *which* oracle
caught *which* defect *when*, by re-running it.

### 6.2 The missing piece — `ai-found-defect`

The user's specific concern is: when AI flags a contradiction (rather
than introduces one), that *finding* is itself a tool output that
should be traceable. Today, rivet has nowhere to put it. The agent
finds the contradiction, reports it in chat, the human acknowledges,
the artifact graph never records the event.

Proposed artifact type:

```yaml
# schemas/common.yaml — additive, type lives in the common base
artifact-types:
  - name: ai-found-defect
    description: >
      A defect (contradiction, broken invariant, missing link, stale
      reference, etc.) reported by an AI agent against the artifact
      graph. The defect has structured provenance (which agent,
      which oracle, which session) so a human reviewer can re-run the
      finding and either accept it (escalating to a defect-correction
      change-request) or reject it (recording the rejection rationale).
    fields:
      - { name: severity,       type: string, required: true,
          allowed-values: [info, warning, error, critical] }
      - { name: detection-method, type: string, required: true,
          allowed-values: [oracle, validate, agent-reasoning,
                           cited-source-drift, doc-check, manual] }
      - { name: oracle-id,      type: string, required: false,
          description: "ID of the oracle that fired, if any" }
      - { name: detected-by,    type: string, required: true,
          description: "agent identifier (e.g. claude-opus-4-7)" }
      - { name: session-id,     type: string, required: false }
      - { name: reproducer,     type: string, required: false,
          description: "shell command that reproduces the finding" }
      - { name: triage-status,  type: string, required: true,
          allowed-values: [open, accepted, rejected, deduplicated],
          default: open }
      - { name: rejection-rationale, type: string, required: false }
    link-fields:
      - { name: against,        link-type: defect-against,
          target-types: ["*"], cardinality: one-or-many, required: true }
      - { name: corrected-by,   link-type: corrects,
          target-types: [change-request, design-decision],
          cardinality: zero-or-many }
```

Crucial properties:

- It is **first-class typed evidence**, not chat history.
- It carries the **reproducer** so a future auditor can replay the
  finding deterministically.
- The triage state machine forces a human to either accept or reject;
  there is no "lost in the chat" outcome.
- It is link-targeted at the offending artifact, so impact analysis
  (`rivet impact`) sees AI-flagged defects the same as human-filed
  ones.

This is the artifact that operationalises the user's intent: *"any
error found while AI is working would get reflected into [the safety
case]."* The reflection is the typed `ai-found-defect`, the
traceability is the `defect-against` link, the closure is the
`corrects` link. None of these exist today.

### 6.3 How AI-found-defect composes with the TCL claim

In TI/TD terms the new artifact does both jobs:

- **Lowers TI of the AI subsystem.** Today rivet has TD-raising oracles
  but no record of *the AI itself catching errors*; once
  `ai-found-defect` exists, the AI's detection successes become
  evidence the toolchain works.
- **Raises TD on the artifact graph.** A reviewer-facing dashboard
  view of open `ai-found-defect`s becomes a hard pre-release gate: no
  artifact reaches `released` while a `defect-against` link points at
  it from an `open` finding.

Together with the existing 19 safeguards in §5.2 this is enough to
defend a **TI2/TD1 → TCL1** position even for AI-authored content,
which is what the user is implicitly asking for.

---

## 7. Design proposal

### 7.1 Three-layer dossier outline

A `rivet docs tool-qualification` topic and a
`docs/design/tool-qualification-dossier.md` companion would carry these
sections:

1. **Tool Operational Requirements (TOR).** What rivet is, what it is
   not, scope of qualified use, scope of *unqualified* use. Includes
   the "structural-only enforcement" disclaimer from `ai-safety-cyber-hitl.md` §5.4.
2. **Tool Use Cases.** Enumerated authoring / linking / validating /
   reporting / exporting cases, each with input → output → known
   limitation rows.
3. **Tool Verification Plan.** Maps each use case to the oracle / test /
   proof that demonstrates correctness. The 19-row table in §5.2 above
   is the seed.
4. **Configuration Baseline.** Released binary version, Cargo.lock
   hash, schemas/ hash, oracle inventory, MCP-tool inventory,
   dependency vet status (`cargo vet`).
5. **Known Limitations & Defect Log.** The current set of open issues
   with risk classification — which TI/TD cell they sit in.
6. **Tool Error Detection & Reporting Process.** How a customer
   reports a tool error; how rivet triages it; SLA. Pointer to the
   `ai-found-defect` artifact type for in-project findings.
7. **TCL/TQL Position Statement per Regime.** ISO 26262, IEC 61508,
   DO-178C, EN 50128, ISO/PAS 8800 — the claim, the basis, the
   conditions of use. **The claim is per-customer-project; rivet
   provides the dossier, the customer's safety manager makes the
   decision.**

### 7.2 New artifacts and code surfaces (smallest viable)

**Schema**
- `tool-confidence` artifact in `schemas/iso-26262.yaml` (matches
  `iso26262-artifact-mapping.md` §C #8): fields `ti: TI1..TI2`,
  `td: TD1..TD3`, `tcl` derived, link-fields for `qualification-evidence`.
- `ai-found-defect` artifact in `schemas/common.yaml` (so every preset
  inherits it).
- `defect-against` link type and `corrects` link type in
  `schemas/common.yaml`.

**CLI**
- `rivet docs tool-qualification` topic, sourced from
  `docs/design/tool-qualification-dossier.md`.
- `rivet check ai-defects-open` oracle: fires when any
  `ai-found-defect` with `triage-status: open` has a `defect-against`
  link to an artifact whose `status` is `released` or `approved`. This
  is the gate that operationalises §6.2.
- `rivet --qualification-mode` flag (or environment variable
  `RIVET_QUALIFICATION_MODE=1`) that disables features outside the
  qualified set. Initial proposal: disables `rivet add --no-validate`,
  forces `--check-remote-sources` on validate, requires `provenance.reviewed-by`
  on every `released` artifact, disables MCP write tools that bypass
  validation.
- `rivet stats --qualification` to emit a configuration-baseline
  manifest (binary version, schema hashes, oracle list, dependency
  vet) for the dossier.

**Tests / proofs**
- A new Rocq theorem in `proofs/rocq/Validation.v`:
  `validate_no_false_pass` — every artifact whose links violate
  `target-types` is reported by `validate`. (The current 4-theorem set
  proves *broken-link* soundness; this widens to all link-type
  violations.)
- A property test for `ai-found-defect` triage state machine: every
  finding has exactly one terminal state (accepted | rejected |
  deduplicated) and one open state.
- A qualification-flavoured integration test:
  `rivet-core/tests/qualification_kit.rs` — runs the dossier examples
  end-to-end and golden-checks the JSON envelopes.

### 7.3 Renaming the existing STPA's TCL annotation

`safety/stpa/tool-qualification.yaml` line 14 needs the §2.7
correction. Two options:

- **Option A:** keep the ISO 26262 framing, change "TCL 1 (highest)"
  to "TCL 3 (highest demand)." Audit-clean, project-internal change.
- **Option B:** switch to DO-330 framing, change to "TQL-2." Useful if
  rivet is more often deployed in DO-178C contexts.

Option A is the lighter change; recommended.

### 7.4 Smallest deliverable that moves the needle

In order of "hours to ship × audit-impact-per-hour":

1. **Rename TCL annotation in the existing STPA** (1h, removes a
   literal audit-flag in our own dogfood file). Recommendation A1.
2. **Add `tool-confidence` typed artifact to `schemas/iso-26262.yaml`**
   (4h, closes `iso26262-artifact-mapping.md` row 32). Recommendation A2.
3. **Add `ai-found-defect` to `schemas/common.yaml`** (4h, the only
   way the user's "AI errors get reflected" requirement becomes a
   typed artifact). Recommendation A3.
4. **Write `docs/design/tool-qualification-dossier.md` + `rivet docs tool-qualification`**
   (1-2 days, replaces the customer-facing "where's your kit?"
   conversation with a doc URL). Recommendation A4.
5. **Add `rivet --qualification-mode` flag + `rivet stats --qualification`** (1 day,
   gives the customer's safety manager a one-command snapshot for the
   dossier). Recommendation A5.

Total: roughly one developer-week to move from "TCL1 in our own
dogfood STPA" to "TCL2 dossier draft published, reviewable."

---

## 8. Recommendation

### 8.1 The user's framing is correct, with one nuance

> "Polarion is TCL1 because Siemens is backing it up; for rivet that
> level must be larger because we want the tool to be part of the
> toolchain especially to ensure any error found while AI is working
> would get reflected into this."

Yes. The nuance: **Polarion's TCL1 is TI2/TD1 where the human review
is the TD layer; rivet's TCL1-target is TI2/TD1 where rivet's *own
mechanical detection* is the TD layer.** Same letter, different
underlying argument, much stronger evidence base.

The number rivet should aim for, in ISO 26262 numbering, is therefore:

- **TI2** (rivet output can affect the safety case — yes, by design).
- **TD1** (rivet's own validate / oracles / cited-source / docs-check /
  ai-found-defect mechanism gives high detection confidence even when
  the upstream author is an AI).
- **→ TCL1** in 26262 *units*, but with the qualification-evidence
  bundle of a TCL2 tool, because the TD1 claim is non-trivial and
  must be defended.

In DO-330 units: **TQL-4 with TQL-3 path** — the practical equivalent
for a tool that automates verification activities (Tool Type 2) on
DAL-B/C work.

### 8.2 Concrete next step

**Open an issue and start workstream A.** The five A-items in §7.4 are
sized for one developer-week. The dossier draft is the long pole; the
schema additions are mechanical.

Single most important open question for the user:

> **Which regime is the lead?** ISO 26262 (automotive), DO-178C
> (aviation), or IEC 62304 (medical)? The answer governs the dossier
> structure, the TCL/TQL numbering, and which customer pilots to
> prioritise. The other two follow as cross-walks. Without picking
> one, the dossier ends up a "supports five regimes" generic kit —
> which is exactly the shape Polarion ships and exactly the shape the
> user's instinct says is too low.

### 8.3 What this design *does not* claim

- Rivet is **not** TCL-qualified today. The work above produces a
  *dossier*; the customer's safety manager makes the project-level
  qualification call.
- The `ai-found-defect` type does **not** turn AI-flagged contradictions
  into safety-case evidence. It turns them into *traceable defect
  records* that a qualified human still has to triage.
- The `--qualification-mode` flag does **not** make rivet a
  development-tool-per-safety-standard. It restricts rivet to a
  qualifiable subset of its features so the dossier scope stays
  manageable.

These three honest disclaimers belong on the `rivet docs tool-qualification`
topic.

---

## 9. Sources

Internal (verified against `main` at 2026-04-27):

- `docs/design/iso26262-artifact-mapping.md` — §C row 32 "Tool
  confidence (TCL/TD)" gap; numbering of `tool-confidence` schema
  proposal.
- `docs/design/ai-safety-cyber-hitl.md` — §2 standard-by-standard
  human-role table; §5 four-point HITL contract.
- `docs/design/polarion-reqif-fidelity.md` — Polarion field mapping;
  status-enum and provenance gaps.
- `docs/design/ai-evidence-trend-research.md` — competitor-tool field
  map (BTC, medini, codeBeamer, Polarion, Jama).
- `safety/stpa/tool-qualification.yaml` — the existing TCL claim
  (mis-numbered, see §2.7).
- `safety/stpa-sec/tool-qualification-sec.yaml` — security STPA
  for the qualification toolchain.
- `schemas/iso-pas-8800.yaml` — `ai-tool-qual.tool-class: TQL-1..5`.
- `schemas/score.yaml` — `tsf.classification: TI1..TI3`.
- `schemas/en-50128.yaml` — `tool-qualification` artifact type
  (placeholder).
- `docs/oracles.md` — oracle catalog (bidirectional, review-signoff,
  gaps-json).
- `docs/mutation-testing.md` — ASIL-keyed mutation-score floors.
- `docs/verification.md` — ASPICE SWE.4/5/6 mapping; proptest catalog.
- `SAFETY.md` — SCRC Phase 1/2 lint set; Verus/Kani/Rocq inventory.
- `proofs/rocq/Schema.v` — six theorems already proved; `Validation.v`
  for the new `validate_no_false_pass` proposal.
- `rivet-core/src/cited_source.rs` — sha256 stamping; Phase 1 file
  backend, Phase 2 URL backend.
- `rivet-core/src/doc_check.rs` — eight documentation invariants.

External (cited from training-time references; **re-fetch before
external publication** — live web access was denied this session):

- ISO 26262-8:2018 §11 — Tool qualification; TI/TD/TCL framework;
  Table 4 qualification methods.
- ISO 26262-6 Table 13 — coverage techniques per ASIL (mutation
  analysis recommended at C/D).
- IEC 61508-3:2010 — T1/T2/T3 categories, Annex C-D tables.
- DO-178C §12.2 + DO-330 — TQL-1..5 matrix.
- EN 50128:2011 §6.7 — tool qualification expectations.
- ISO/SAE 21434:2021 §5.4.6 — cybersecurity tool considerations.
- ISO/PAS 8800:2024 — TQL-1..5 for AI element tools.
- Siemens Polarion ALM Tool Qualification Kit (siemens.com,
  publicly downloadable) — TI2/TD1/TCL1 self-claim with reviewer-as-detection
  defence.
- EU AI Act Article 14 — automation-bias warning relevant to §3.2.
