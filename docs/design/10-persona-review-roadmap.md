---
id: DOC-DESIGN-10-PERSONA-ROADMAP
title: 10-persona review of rivet ↔ eclipse-score — roadmap synthesis
type: design-decision
status: current
tags: [design, roadmap, qualification, persona-review, eclipse-score]
---

# 10-persona review — roadmap synthesis

A side-by-side review of rivet and `eclipse-score`, performed by ten
named personas during the sphinx-needs corpus conversion experiment
(2026-05-24). The eclipse-score-fork workspace is the concrete
deliverable the review hung on. This document captures the synthesis
that drives the v0.14.0+ roadmap. Falsifiable-claim items are filed
separately as `REQ-093` … `REQ-100`; this document is the *why*.

## The ten personas

| #   | Persona                                          | Verdict (one line) |
| --- | ------------------------------------------------ | ------------------ |
| P1  | Dr. Maria Hess — ISO 26262 assessor (eclipse)    | Typed graph good; self-attested "valid", unqualified tool, FDR placeholders → findings |
| P2  | Hiroshi Tanaka — OEM architect (eclipse)         | Honest metamodel; zero AUTOSAR/ARXML/DOORS = deal-breaker for OEM adoption |
| P3  | Kjell Andersen — CI/DevOps (eclipse)             | Three-mode build mature; `-W --keep-going` wrong PR gate, `pull_request_target` + `contents:write` is a security hole |
| P4  | Priya Ramanan — 1st-week contributor (eclipse)   | Devcontainer thoughtful; contribute info fragmented, metamodel narrative absent, persistency arch a stub |
| P5  | Prof. Dubois — safety researcher (eclipse)       | Typed checkable graph closer to MBSA than DOORS; FDR row 2 "argument intentionally not provided" — compliance trace ≠ safety case |
| P6  | Dr. Maria Hess — same assessor (rivet)           | Self-deprecating typed qualification claim earns trust; independence not proved (parsers shared), FUTURE oracles unimplemented, releases unsigned |
| P7  | Col. Whittaker — DO-178C/DO-330 (rivet)          | Honest scope, traceability gated; no DO-330 TQP/TOR/TVCP/TCI/TAS — TQL-2 narrative, not TQL-2 tool |
| P8  | Aditi Krishnamurthy — AI engineer (rivet)        | MCP catalog small + typed + orthogonal; mutation→reload manual, no batch/idempotency = retry pain at scale |
| P9  | Yusuf El-Masri — 1st-day Rust contributor (rivet) | Doc-comments work, tests real, lint policy principled; 17-lint `#![allow]` copy-paste, `Error` too coarse, 55 top-level modules sprawl |
| P10 | Elena Carrasco — CTO (side-by-side)              | Eclipse = consortium brand; rivet = born-compliant + agent-first + falsification discipline. **Hybrid: eclipse as SoR, rivet as oracle layer. Bus factor: ONE.** |

## Universally liked (cross-stack)

1. **Typed metamodel as single inspectable source of truth.** Hess /
   Tanaka / Dubois / Ramanan / El-Masri. Whether it's eclipse's
   `metamodel.yaml` or rivet's `schemas/*.yaml`, ONE file that defines
   types + links + rules is load-bearing trust.
2. **Honest scope statements that name what's NOT done.** Hess
   explicitly contrasts: eclipse's tool qualification reads like vibes;
   rivet's dossier opens with "self-claimed, one Admitted Rocq theorem,
   27 Kani harnesses not 2000" — and earns trust because it admits
   gaps. People trust falsification over confidence.
3. **Graph-checking that catches structural mistakes mechanically.**
   Hess / Dubois / Whittaker. `QM cannot satisfy ASIL` is a graph
   predicate, not a review checklist.
4. **Reproducible build / git-native CM.** Andersen / Tanaka /
   Whittaker. YAML/RST in git + deterministic pipeline > DOORS DB +
   nightly export.

## Universally disliked (cross-stack)

The five recurring complaints — the actual product-improvement signal:

1. **Tool qualification asserted, not assessed.** Eclipse: `doc_as_code`
   is qualified by itself, no TI/TD analysis. Rivet: TCL1 self-claim,
   AI-assisted authoring, no independent reviewer per
   ISO 26262-2 §6.4.7. Both need external assessor signoff before any
   OEM consumes the output as evidence.
2. **Independence of verification layers not proved.** Eclipse:
   `graph_checks` share the parser. Rivet: Kani / Verus / Rocq /
   proptest all share the `Artifact` model and YAML parser. The
   "product of miss rates" argument collapses if the parser has a bug.
   → [[REQ-098]]
3. **Release-channel integrity gap.** Eclipse: CI gate, no signed
   attestation, no SBOM, no checker-version manifest. Rivet:
   `SHA256SUMS` was unsigned until v0.10.x; git tags unsigned. A tool
   whose output IS compliance evidence needs signed releases.
   → [[REQ-094]]
4. **Cross-tool integration weak.** Eclipse: zero AUTOSAR/ARXML/AADL/
   ReqIF — deal-breaker for OEM adoption. Rivet: no DO-330 shape,
   no DOORS bridge yet, MCP write tools out-of-qualification-scope.
   → [[REQ-097]] (DO-330), follow-on for OEM bridges.
5. **Bus factor / maintainer base.** Eclipse: Eclipse WG but the
   variant attempt was one person and got archived. Rivet: ~372 of 373
   commits are one author. **The single most decisive finding in the
   panel.**

## Rivet-specific friction (the agent-finishable items)

| Friction                                                                                  | Persona       | Severity for                  |
| ----------------------------------------------------------------------------------------- | ------------- | ----------------------------- |
| Three FUTURE oracles (asil-decomposition / coverage-threshold / method-table-compliance)  | Hess          | ISO 26262 assessors           |
| No DO-330 shape (TQP / TOR / TVCP / TCI / TAS)                                            | Whittaker     | Avionics / space              |
| MCP: no batch, no idempotency, manual reload after mutation, stringified content          | Krishnamurthy | Agent-fleet operators         |
| 17-lint `#![allow]` copy-paste, `Error` too coarse, 55 top-level modules                  | El-Masri      | New contributors              |
| Commit-trailer enforcement day-7 friction, no tooling support                             | El-Masri      | New contributors              |
| Pre-1.0, schema deltas still landing, Verus assumes, Rocq Admitted                        | Carrasco      | 4-year commits                |

## Roadmap, filtered through pulseengine principles

Every candidate runs through four gates:
- **Falsification over prediction** — does it make a claim mechanically falsifiable?
- **Defense-in-depth** — does it add a check, not a soft-review?
- **MBSE-mandatory** — does it make the model drive the build?
- **Typed compliance** — does it preserve the typed-graph property?

### Filed as REQs (the falsifiable-claim items)

| REQ      | What                                                                       | Baseline       | Source col |
| -------- | -------------------------------------------------------------------------- | -------------- | ---------- |
| REQ-093  | Implement the 3 FUTURE oracles (asil-decomposition / coverage-threshold / method-table-compliance) | v0.14.0-track | A1 |
| REQ-094  | Reproducible-build oracle + sigstore-signed release verification          | v0.14.0-track  | A4         |
| REQ-095  | `cargo build` invokes `rivet validate` for crates declaring `rivet.yaml`  | v0.14.0-track  | B1         |
| REQ-096  | SACM 2.x safety-case schema with deductive-sufficiency mechanisation      | v0.15.0-track  | A2         |
| REQ-097  | DO-330 tool-qualification artifacts (TQP/TOR/TVCP/TCI/TAS) typed schema   | v0.14.0-track  | A6         |
| REQ-098  | Independence-of-verification-layers oracle (shared-code-paths gate)       | v0.14.0-track  | A3         |
| REQ-099  | `rivet_apply` MCP tool — idempotency + atomic + auto-reload + diagnostics | v0.14.0-track  | A5 / C6    |

A v1.0 readiness gate is deliberately **not** filed as a separate REQ.
The decision: see how far we can progress through the v0.14.0+
backlog without pre-committing to a 1.0 milestone; 1.0 ships when
the natural state of the work meets Carrasco's flip-condition (b),
not when a calendar says so.

Filed against `artifacts/requirements.yaml` so the dogfooding pattern
holds: REQ → acceptance step → mechanical check on PR.

### Rejected up-front (don't pass the principle gates)

- "Add more reviewer-only validation" — soft-oracle.
- "Reduce strict-lint policy to make Rust easier" — weakens
  defense-in-depth.
- "Bridge to DOORS as primary path" — DOORS-as-master inverts the
  typed-substrate philosophy; bridge as import/export is fine, master
  is not.

### Not filed — design-doc material (B-tier MBSE linkages)

These are too small for their own REQ but worth doing as PRs in
sequence. Implementation order suggested:

1. **B3 — Source-comment scanner** (`// rivet: REQ-NNN` per-line
   linker). Already specced as [[REQ-092]] in v0.13.0's CHANGELOG;
   counts as the eclipse-source-code-linker parity item.
2. **B6 — spar AADL → WIT → rivet typed-artifacts closed loop.**
   Already underway per the pulseengine-toolchain memory; nothing to
   add here.
3. **B7 — witness MC/DC import.** Wrap with
   `rivet import-results --format witness`; closes the witness→rivet
   evidence loop the [[req-086-witness-mcdc]] PoC was scaffolding for.
4. **B5 — `rivet validate --since <baseline>` as pre-merge git hook.**
   Trivial extension of existing baseline machinery.
5. **B4 — `rivet variant ci-config --provider gh-actions`.** Variant
   matrix already emits a matrix; generating the full workflow is the
   natural extension.
6. **B2 — `rivet variant features --format cargo-features` writes
   Cargo.toml feature blocks.** Closes the
   "variant-pruning-rust-mcdc" loop end-to-end.

### Not filed — follow-on engineering work (C-tier maintenance)

Genuine improvements but they're *tasks*, not *requirements*. Track
as issues / project chores:

- **C1** 1.0 release — captured by REQ-100.
- **C2** Second committed maintainer org — strategic; see "Eclipse
  adoption" below.
- **C3** `rivet contribute new-feature <area>` scaffolder + Phase-2
  lint migration with a deadline. Day-7 friction directly addressed.
- **C4** `Error` enum: path-aware typed variants, drop `String`
  payloads. `thiserror`-mature shape.
- **C5** `rivet commits --suggest-trailers` reads diff, suggests
  `Implements:`. One CLI = day-7 friction halved.
- **C7** Structured-content MCP responses when upstream MCP supports
  them. Wait for upstream, then switch.
- **C8** `OnceLock<Regex>` for parser hot regexes. Hygiene fix.
- **C9** Module reorganisation (core/ io/ formats/ validate/).
  Post-1.0; high-risk churn pre-1.0.
- **C10** ReqIF / DOORS / AUTOSAR import adapters. Reduces switching
  cost; bigger lift, post-1.0.

## Strategic findings — Carrasco's hybrid verdict

The CTO did not pick a winner. She picked a hybrid:

> **Adopt eclipse-score as the system of record. Pilot rivet as the
> agent / oracle layer over it. The fork is the proof this hybrid
> works.**

**Flip-conditions** (any two trigger rivet-primary):

- **(a)** A second committed maintainer org appears.
- **(b)** Rivet ships 1.0 with TCL dossier and a signed support SLA.
- **(c)** Eclipse formally adopts rivet (or equivalent typed substrate)
  as upstream.

(a) and (b) are inside our control. (c) is org-strategic and held —
no proactive outreach until (b) lands.

Concrete implication: the v0.14.0 / v1.0 roadmap is the flip-condition
roadmap. The eclipse-score fork is the proof the bridge works; rivet
doesn't need to win against eclipse — it needs to *be* the typed
substrate eclipse adopts.

## Highest-leverage sequence

If executed in this order, every step strictly increases flip-condition
progress without changing direction:

1. **REQ-091 (rowan fix) + parallel agent's `feat/import-results-sphinx-needs`** —
   v0.13.1. Already planned. Closes the silent-grading-hole and ships
   the eclipse-score importer that surfaced it.
2. **REQ-093 + REQ-094 + REQ-095** — v0.14.0. The three items that
   convert rivet's TCL dossier from "narrative" to "tool" — Carrasco
   flip-condition (b) prerequisites.
3. **REQ-097 + REQ-098** — v0.14.0+. DO-330 dossier shape +
   independence oracle close Whittaker's findings.
4. **REQ-099** — v0.14.0. Unblocks agent fleets per Krishnamurthy.
5. **C1 + C2** — when the natural state of the v0.14.0 backlog
   reaches Carrasco's flip-condition (b). Second-maintainer-org
   engagement begins when 1.0 is *visible*, not before.
6. **REQ-096** — v0.15.0+. SACM safety-case schema; promotes rivet
   from "traceability infra" to "assurance case infra".

## What this document does NOT do

- Pick eclipse-score as the upstream-of-record (we already do, per the
  fork architecture).
- Commit to a v1.0 date or a 1.0-readiness REQ. The position: see how
  far we can progress without pre-committing the gate. 1.0 ships when
  the natural state of the work meets it.
- Promise eclipse adoption — flip-condition (c) is held. Captured here
  for visibility, not pursued.
