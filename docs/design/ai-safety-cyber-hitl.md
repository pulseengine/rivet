# AI-Assisted Safety + Cybersecurity Engineering — the Human-in-the-Loop Contract

**Audience:** safety/cybersecurity leads, regulators, and sales engineers fielding
the objection *"but a qualified human still has to do this."*

**Scope:** how rivet frames AI assistance in regulated SDLC work, what the
standards actually require of the human, and the four-point commitment rivet
makes so that AI-authored evidence is honest and auditable.

**Not in scope:** tool qualification (TCL/TQL) of rivet itself — see
`docs/design/iso26262-artifact-mapping.md` §4 and the `iso-pas-8800.yaml`
schema.

---

## 1. TL;DR

The objection *"a qualified human still has to sign off"* is correct, and it
is not an argument against AI assistance — it is the **shape** of AI
assistance in a regulated SDLC. Rivet's frame, in one sentence:

> **AI proposes structure; a qualified human owns judgment; every transition
> between the two is a separately-stamped, git-reviewable event.**

Everything in this document is a consequence of that one sentence.

---

## 2. What the standards actually say about the human

The claims below are from publicly documented clause references. Exact
clause numbers should be re-verified against a paid copy of the standard
before external use — they are marked *(unverified clause-level)* where the
author could not fetch the primary text. The **role existence** and
**sign-off duty** are not in dispute.

| Standard | Human role | What they sign | What AI can NEVER do |
|---|---|---|---|
| ISO 26262:2018 part 2-6 *(unverified)* | Safety assessor (independent, ≥ I2/I3 for ASIL C/D) | Safety case argument, confirmation reviews | Declare a hazard non-credible; waive ASIL; sign the safety case |
| ISO 26262:2018 part 8-6 *(unverified)* | Tool user | Tool qualification rationale (TCL/TQL) | Self-qualify the toolchain |
| IEC 61508-1:2010 clause 8 *(unverified)* | Functional safety assessor | FSA report per SIL | Conclude "SIL met" absent the assessor's signature |
| IEC 62304:2006+A1:2015 clause 4.2 *(unverified)* | Risk manager (per ISO 14971) | Benefit/risk determination, residual-risk acceptability | Waive residual risk; declare device safety class |
| DO-178C §8 + DO-330 | DER (Designated Engineering Representative) + independence for DAL A/B | Stage-of-involvement (SOI) conformance, PSAC/SAS | Replace DER audit; sign DO-330 tool qualification |
| EN 50128:2011 clause 5.1 *(unverified)* | Validator (independent of verifier + designer) | Validation report at SIL 3/4 | Combine designer + validator role |
| ISO/SAE 21434:2021 clause 5.4.2 *(unverified)* | Cybersecurity manager | Cybersecurity case, risk decisions, CAL rationale | Accept a residual cyber risk; sign the cyber case |
| ISO 27001:2022 Annex A | Risk owner per control | Statement of Applicability; residual-risk acceptance | Own a control on a human's behalf |
| IEC 62443-4-1:2018 SM-1 *(unverified)* | Security champion / lead | Secure-development process conformance | Self-attest the SDL |
| ASPICE 4.0 MAN.6 | Process assessor (iNTACS-qualified) | Capability-level rating | Self-rate the process |
| EU AI Act Art. 14 *(summarised from public drafts, unverified verbatim)* | Assigned natural person(s) for human oversight | Decisions about use/override of the AI system | Substitute for the natural person's oversight duties |
| NIST AI RMF 1.0 (2023) — GOVERN function | Accountable AI actor | "Govern 1.2" — roles and responsibilities documented | Replace documented accountability |

The pattern is the same across every row: the **role exists**, the **signature
is by a named human**, and the **judgment cannot be delegated** — to AI,
to a contractor, to a tool, or to a framework.

Three representative quotations worth internalising (paraphrased from public
summaries; quote exactly from the paid standard before publishing
externally):

1. **ISO 26262-2:2018** — the organisation shall assign a person with
   appropriate competence and independence to carry out the safety
   assessment; the competence requirement (experience, training,
   domain knowledge) is non-waivable.
2. **ISO/SAE 21434:2021** — the organisation shall define responsibilities
   and authorities for cybersecurity and appoint a cybersecurity manager;
   the cybersecurity case requires a judgment of residual risk
   acceptability by that role.
3. **EU AI Act Article 14 (paraphrased)** — high-risk AI systems must be
   effectively overseen by natural persons during the period in which they
   are in use; those persons must be able to fully understand the system's
   capacities and limitations, remain aware of automation bias, correctly
   interpret output, and decide not to use or override the output.

Rivet's design should make each of those sign-off events **a distinct,
inspectable record** — never an implicit consequence of the AI having
written the file.

---

## 3. How existing tools handle the tension

Live web fetch was not available this session; the vendor summaries below
are from the author's prior reading and are flagged *(unverified)* — quote
text must be re-fetched before external use.

- **Jama Connect Advisor** *(unverified)* — AI **"suggests improvements"**
  to requirements using INCOSE rules. Explicitly advisory; the engineer
  accepts/edits/rejects inside Jama's review workflow. **Honest framing.**
- **Siemens Polarion + Industrial Copilot** *(unverified)* — "generative
  assistance" rather than autonomous authoring; Polarion's workflow gates
  (draft → reviewed → approved, with 21 CFR Part 11 e-signature) are the
  compliance anchor. Honest framing lives in the workflow, not the AI
  pitch.
- **Codebeamer (PTC) AI** *(unverified)* — "AI-powered requirement
  generation" with explicit "human must review and approve" caveat.
- **Ansys medini analyze** *(unverified)* — automates bookkeeping around
  the HARA; does not claim to do the HARA.
- **BTC EmbeddedPlatform** *(unverified)* — AI as **proof-engine
  accelerator**, not a safety decision-maker. Consistent with
  DO-178C/DO-330 tool-qualification logic.
- **TÜV SÜD / Rheinland AI advisory** *(unverified)* — repeatedly: AI is
  a tool whose output **must be verifiable by a qualified human**, and
  any tool in a safety argument must be qualified (TCL/TQL). This is the
  external frame rivet aligns with: **tool output ≠ safety evidence;
  verified tool output, reviewed by a qualified human, is safety
  evidence.**

The honest tools share three traits: (1) AI output is labelled on every
artifact it touched; (2) sign-off is a separate workflow state performed
by a named human, not a side effect of authoring; (3) the AI does not
sign. Overclaiming blurs authorship and approval, markets the AI as doing
the engineer's job, or omits qualifiers like "suggested" / "draft."

---

## 4. The pattern: AI proposes, human approves

Every layer of safety/cyber work can be split into **structural** work
(what the AI is good at) and **judgment** work (what the standards require
a human to do). Rivet's CLI already maps cleanly onto this split.

| Layer | AI role | Human role | Rivet today |
|---|---|---|---|
| **Authoring** | Drafts `hazard`, `uca`, `threat`, `requirement` YAML from natural-language input or prior artifacts | Decides whether the drafted item is a real hazard / real threat / credible scenario | `rivet add` + auto-stamp via PostToolUse hook |
| **Linking** | Suggests `satisfies`, `mitigates`, `verifies`, `decomposes-asil` links from text similarity | Confirms the link is semantically sound | `rivet link` / `rivet unlink` |
| **Structural validation** | Runs schema, cardinality, enum, bridge-rule, and cross-tree variant checks | Decides which warnings are real | `rivet validate` (lints, not judgments) |
| **Gap detection** | Reports orphan artifacts, missing verification, uncovered requirements | Decides which gaps block release | `rivet coverage` |
| **Summarisation** | Renders an artifact subset (`rivet list`, `rivet embed`, `rivet query`) | Interprets the summary against the system context | `rivet list`, `rivet query`, `rivet embed`, dashboard (`rivet serve`) |
| **Sign-off** | **Never** | Names themselves in the provenance record with rationale | `rivet stamp --reviewed-by <human-id>` (see §5) |

The line between "proposes" and "approves" is the line between a lint
warning and a regulator-facing claim. Rivet enforces it at the file level:
a provenance block with `created-by: ai-assisted` and no `reviewed-by`
field is a draft. A provenance block with both is a reviewed artifact.
Everything else is a bug in the workflow.

---

## 5. Rivet's four-point HITL contract

These are the commitments a rivet customer can hold us to. Items marked
**(today)** are implemented in main. Items marked **(v0.5.0 proposal)**
are gaps called out honestly so sales does not overstate.

### 5.1 Every AI-authored artifact carries provenance **(today)**

`schemas/common.yaml` defines a `provenance` block with `created-by` ∈
{`human`, `ai`, `ai-assisted`}, `model`, `session-id`, `timestamp`, and
`reviewed-by`. The `ai-generated-needs-review` conditional rule already
fires a warning if an `ai`/`ai-assisted` artifact reaches `status: active`
without a `reviewed-by` field (see `schemas/common.yaml` lines ~108–119).
The Claude Code PostToolUse hook auto-stamps on file edits so provenance
cannot be forgotten.

Hardening proposed for v0.5.0:

- Promote `ai-generated-needs-review` from `severity: warning` to
  `severity: error` on `status: approved` (not just `active`).
- Add a lint that rejects `status: approved` when `reviewed-by` is an
  AI identifier (regex match on `ai`/`ai-assisted`/known model ids).
  This is the single validation rule that closes the "AI approved its
  own work" loophole.

### 5.2 Human sign-off is a separate provenance entry **(today, with caveats)**

`rivet stamp --reviewed-by <human-id>` already exists in
`rivet-cli/src/main.rs` (see the `Stamp` subcommand around line 682 and
`cmd_stamp` around line 7462). The gap is ergonomic, not fundamental:

- The reviewer's **rationale** is not yet a structured field — it lives
  in the commit message or a free-text note. **Proposal: add a
  `rationale` subfield to `provenance.reviewed-by` and require it for
  artifacts with `asil` ≥ B or `cal` ≥ 2.**
- There is no dedicated `rivet approve <id>` subcommand distinct from
  `rivet stamp`. Stamp is the right machinery — a thin `rivet approve`
  alias that defaults `--created-by` to the current `$USER` and requires
  `--rationale` would be the obvious sugar.
- Electronic-signature support (FDA 21 CFR Part 11, EU eIDAS) is **not**
  claimed. Rivet records who-reviewed-what in git; Part 11 attestation
  requires an external signature flow rivet does not ship.

### 5.3 Audit-trail view **(v0.5.0 proposal)**

Git history + provenance stamps together contain every authoring and
review event, but the view has to be assembled manually today. The
missing piece is `rivet audit-trail <artifact-id>` — a subcommand that
walks git history and interleaves commits, `created-by` transitions,
`reviewed-by` transitions, and status transitions (`draft` → `active` →
`approved` → `superseded`) chronologically. The reviewer would see the
complete authored-by-AI → approved-by-Jane-Doe → modified-by-AI →
re-approved-by-Jane-Doe chain at a glance. This is the single most
requested feature for auditor-facing demos.

### 5.4 Structural-only enforcement, with the boundary made explicit **(today)**

`rivet validate` is 100% structural: schema compliance, cardinality,
enum membership, link-target existence, orphan detection, variant
cross-tree constraints, coverage. **Rivet never claims to assess
credibility, sufficiency, or acceptability.** That boundary is not a
limitation dressed up as a virtue — it is the whole point. The moment a
structural validator claims to make a safety judgment, its output stops
being evidence the human can rely on and starts being evidence the human
has to disprove.

Customer-facing phrasing for this line:

> Rivet can tell you whether your hazard is *linked*. Only a qualified
> safety engineer can tell you whether it is *real*.

---

## 6. FAQ — pocket answers to the objection

**"But AI can't do safety analysis."** Correct, and rivet does not claim
it does. Rivet makes the *artifacts of a human's safety analysis*
machine-readable, agent-writable at the authoring layer, and
git-reviewable at every transition. The qualified engineer still owns
every judgment call — their sign-off now arrives with full structural
validation, coverage data, and provenance trail attached.

**"How do I know the AI didn't hallucinate a requirement?"** Three
defences: (1) every AI-authored artifact carries `created-by: ai-assisted`
+ model + timestamp, so the hallucination is labelled; (2) every artifact
flows through a git PR where the human reviews the diff; (3) `rivet
validate` catches the dangling links and schema violations hallucinations
often produce. None of these is a hallucination detector — the reviewer
is. Rivet makes their review cheaper.

**"What about liability?"** Unchanged. The qualified engineer bears the
regulatory responsibility, exactly as before. Rivet provides **evidence
that their sign-off was informed** — validation passed, coverage
reports, traceability chain — not a shift of liability to a tool vendor.
Tool-qualification constraints are explicit in `iso-pas-8800.yaml`.

**"How is this different from just using Copilot?"** Copilot authors
code. Rivet authors the **traceability chain that proves the code
satisfies a safety requirement.** Different artifact class: Copilot's
output lives in `.rs` / `.c` / `.py`; rivet's output lives in
`artifacts/*.yaml` and `safety/**/*.yaml` and connects code commits to
hazards, UCAs, verification, and safety-case claims. You need both.

**"Can I get TÜV / a safety assessor to accept rivet-generated
artifacts?"** Not yet — the path is a pilot engagement. Rivet maps its
schemas to ISO 26262 / IEC 61508 / IEC 62304 / DO-178C / EN 50128 /
ISO 21434 work products (see `docs/design/iso26262-artifact-mapping.md`),
but mapping fidelity is not audit acceptance. Customer-development path:
(1) rivet produces the structured evidence, (2) the customer's qualified
engineer signs off, (3) the assessor accepts the signed evidence — not
the tool's output directly.

---

## 7. What rivet explicitly does NOT claim

These lines go in every sales deck, unedited:

- Rivet does **not** perform safety analysis.
- Rivet does **not** assess hazard credibility or threat likelihood.
- Rivet does **not** replace a safety assessor, cybersecurity manager,
  DER, validator, or process assessor.
- Rivet itself is **not** currently TCL- or TQL-qualified under
  ISO 26262-8 / DO-330 / IEC 61508-3 — tool qualification is a separate
  programme (see `schemas/iso-pas-8800.yaml` for the model).
- Rivet does **not** guarantee regulatory compliance. It produces
  artifacts a qualified human uses *toward* compliance.
- Rivet does **not** provide 21 CFR Part 11 / eIDAS electronic
  signatures. Reviewer attribution is recorded in git + provenance; a
  separate signature flow is required for Part 11 attestation.

Stating these up front is the credibility move. Vendors who don't say
them are the ones auditors don't trust.

---

## 8. Cross-references and proposed follow-ups

- `docs/design/iso26262-artifact-mapping.md` (PR #164, merged) —
  the fidelity register for ISO 26262:2018. Every row in §2 of that
  doc resolves to a sign-off by a named human; this HITL doc is the
  procedural backing.
- `docs/design/ai-evidence-trend-research.md` (PR #173, open) —
  the category positioning; this doc is the concrete HITL contract
  inside that category.
- `docs/what-is-rivet.md` (PR #172, open) — the top-level
  positioning. Two text updates are proposed (not made here):
  1. Add a "Human-in-the-loop" section directly after "Who it's for,"
     linking to this doc as the authoritative source.
  2. Add a top-level "What rivet does NOT do" section using §7
     verbatim.

### Implementation backlog inferred from §5

1. Promote `ai-generated-needs-review` to `error` on `status: approved`.
2. Add a lint forbidding `reviewed-by` matching AI identifiers on
   approved artifacts (the self-approval loophole).
3. Add `provenance.reviewed-by.rationale` as a structured subfield;
   require it for `asil ≥ B` or `cal ≥ 2`.
4. Add `rivet approve <id>` as an ergonomic alias for `rivet stamp`
   with `--rationale` required.
5. Add `rivet audit-trail <id>` as the chronological view over git
   history + provenance transitions.

Each of these is a small-to-medium change against `rivet-cli/src` and
`schemas/common.yaml`; the largest single item is the audit-trail
subcommand, which requires walking `git log --follow` with YAML diff
parsing. None requires rethinking the model.

---

*Trailers: `Refs: FEAT-001` (Evidence-as-Code positioning),
`Refs: REQ-002` (STPA artifact support — the cyber-safety joint analysis
pattern), `Refs: REQ-030` (formal verification — the structural-only
enforcement boundary).*
