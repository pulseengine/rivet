<!-- rivet-docs-check: design-doc-aspirational-ok -->

# ISO 26262:2018 — Artifact Mapping & Gap Analysis for Rivet

**Status:** gap analysis (not a certification opinion)
**Edition mapped:** ISO 26262:2018 (second edition, all parts)
**Audience:** safety engineers evaluating rivet for an automotive program
**Date:** 2026-04-19

This document enumerates the key work products ISO 26262 expects, maps
each to rivet's current schemas, and records the gaps that block an
honest claim of "ISO 26262 support". No schemas are proposed or
implemented here — this is an inventory of fit versus miss.

Rivet does not ship an `iso-26262.yaml` schema today
(`ls schemas/ | grep 26262` returns nothing). The closest neighbours
loaded here are `score.yaml` (Eclipse SCORE, already ASIL-aware),
`iec-61508.yaml` (parent functional-safety standard), `aspice.yaml`
(V-model process), `safety-case.yaml` (GSN), `sotif.yaml`,
`cybersecurity.yaml`, and `iso-pas-8800.yaml` (AI in road vehicles).

---

## Section A — ISO 26262 artifact scope

Parts 3–9 of ISO 26262:2018 carry the technical work-product
expectations. The list below covers ~35 high-signal artifacts an
auditor expects. Clause numbers are cited from training knowledge.

### Part 3 — Concept phase
1. **Item definition** (3-5) — scope, boundaries, operating modes, legal
   assumptions. Downstream: HARA.
2. **HARA** (3-6) — hazardous events with S/E/C → ASIL.
3. **Operational situation** (3-6.4.2) — feeds S/E/C rating.
4. **Hazardous event** (3-6.4.3) — malfunction × situation.
5. **Safety goal** (3-7.4) — ASIL + safe state + FTTI.
6. **Functional Safety Concept** (3-8) — allocation of goals to
   preliminary architecture with safety measures.
7. **Functional Safety Requirement** (3-8.4) — ASIL-typed, derived from
   safety goals.

### Part 4 — System level
8. **Technical Safety Requirement** (4-6).
9. **Technical Safety Concept** (4-6.4).
10. **System architectural design** (4-7).
11. **Safety mechanism** (4-6.4.3) — detector/actuator/degraded mode.
12. **HW-SW interface (HSI) specification** (4-6.4.8 / 5-6).
13. **System verification & integration testing** (4-8, 4-9).
14. **Safety validation** (4-9 / 4-10).
15. **System-level safety analyses** (4-7.4.3) — FTA/FMEA/STPA.

### Part 5 — Hardware
16. **HW safety requirement** (5-6).
17. **HW architectural design** (5-7).
18. **HW detailed design** (5-7.4.2).
19. **FMEDA** (5-8 / Annex D–F) — failure modes with DC and SPFM/LFM
    contributions.
20. **HW metrics — SPFM, LFM** (5-8.4) — numeric targets by ASIL.
21. **PMHF** (5-9) — numeric, ASIL-dependent threshold.
22. **HW integration & verification** (5-10).

### Part 6 — Software
23. **SW safety requirement** (6-6).
24. **SW architectural design** (6-7) — freedom-from-interference.
25. **SW unit design & implementation** (6-8).
26. **SW unit verification** (6-9) — statement/branch/MC-DC per ASIL.
27. **SW integration & verification** (6-10).
28. **SW verification of embedded SW** (6-11).

### Part 8 — Supporting processes
29. **Configuration management** (8-7).
30. **Change management** (8-8).
31. **Safety file / documentation** (8-10).
32. **Tool confidence** (8-11) — TCL (TI × TD); TQL for T3 tools.
33. **SW component qualification** (8-12).
34. **HW component qualification** (8-13).
35. **Proven-in-use** (8-14).
36. **DIA — distributed developments** (8-5).

### Part 9 — ASIL-oriented analyses
37. **ASIL decomposition record** (9-5) — derating + independence.
38. **Criteria for coexistence** (9-6) — mixed-ASIL.
39. **Dependent Failure Analysis** (9-7).
40. **Safety case** (2-6.4.3) — aggregated evidence argument.

---

## Section B — Mapping to rivet's current types

Fidelity legend: **EXACT** — semantics + required fields captured;
**APPROX** — adjacent type exists, some required fields or invariants
missing; **ABSENT** — no matching rivet type.

| # | ISO 26262 artifact | Rivet type (schema) | Fidelity | Notes |
|---|---|---|---|---|
| 1 | Item definition | `stkh-req` (score) / `requirement` (dev) | APPROX | No "item" container; scope/boundaries/assumptions not structured. |
| 2 | HARA | `hazard-risk-assessment` (iec-61508) + `hazard` (stpa) | APPROX | Has risk-level/consequence/frequency but no **S/E/C** triad or ASIL derivation. |
| 3 | Operational situation | none | ABSENT | `sotif-scenario` is closest but SOTIF-scoped (triggering conditions, not 26262 S/E/C drivers). |
| 4 | Hazardous event | `hazard` (stpa) | APPROX | No situation-coupling, no ASIL field. |
| 5 | Safety goal | `safety-goal` (safety-case) | APPROX | `asil` field exists (QM/A–D) but no `safe-state`, no `ftti`, no link to HARA item. |
| 6 | Functional Safety Concept | `safety-concept` (iec-61508) | APPROX | Uses SIL, not ASIL; no FSC-specific structure. |
| 7 | Functional Safety Requirement | `safety-req` (iec-61508) / `feat-req` (score) | APPROX | score has `safety-level: ASIL_A..D`; iec-61508 uses SIL. Neither enforces ASIL inheritance from parent goal. |
| 8 | Technical Safety Requirement | `comp-req` (score) / `system-req` (aspice) | APPROX | ASIL present in score; decomposition link semantics absent. |
| 9 | Technical Safety Concept | `safety-concept` (iec-61508) | APPROX | Same as FSC — SIL-typed. |
| 10 | System architectural design | `system-arch-component` (aspice) / `comp` (score) | EXACT | score has ASIL + interfaces. |
| 11 | Safety mechanism | `ai-arch-measure` (iso-pas-8800) / `controller-constraint` (stpa) | APPROX | No first-class "safety-mechanism" with DC / reaction time / latency. |
| 12 | HSI specification | none | ABSENT | No HW-SW interface artifact; `interfaces` is a free-form `structured` field on components. |
| 13 | System verification | `sys-verification` (aspice) / `test-spec` (score) | EXACT | |
| 14 | Safety validation | `validation` (iec-61508) / `sw-validation` (en-50128) | EXACT | |
| 15 | Safety analyses (system) | `fmea-entry` (score) / full STPA suite (stpa) | EXACT | STPA artifacts are the strongest coverage rivet has. |
| 16 | HW safety requirement | `safety-req` (iec-61508) | APPROX | Generic safety-req; not HW-specific. |
| 17 | HW architectural design | `hw-arch` (iec-61508) | APPROX | Has HFT/SFF but those are 61508-era; SPFM/LFM fields absent. |
| 18 | HW detailed design | none | ABSENT | No HW detailed-design type. |
| 19 | FMEDA | `fmea-entry` (score) | APPROX | Has failure-mode/effect/cause/severity/RPN — lacks diagnostic-coverage percentage, SPFM/LFM contribution, safe/dangerous-fraction classification. |
| 20 | SPFM / LFM metrics | none | ABSENT | No typed numeric fields nor ASIL-threshold rules. |
| 21 | PMHF | none | ABSENT | |
| 22 | HW integration & verification | `validation` (iec-61508) | APPROX | Generic validation; not HW-specific. |
| 23 | SW safety requirement | `sw-safety-req` (iec-61508) / `sw-req` (aspice) | EXACT | |
| 24 | SW architectural design | `sw-arch-component` (aspice) / `sw-arch` (iec-61508) | EXACT | Coexistence / freedom-from-interference not modelled. |
| 25 | SW unit design | `sw-detail-design` (aspice) / `dd-sta`/`dd-dyn` (score) | EXACT | |
| 26 | SW unit verification | `unit-verification` (aspice) / `sw-verification` (iec-61508) | APPROX | No coverage-metric fields (statement / branch / MC/DC) nor ASIL-keyed thresholds. |
| 27 | SW integration & verification | `sw-integration-verification` (aspice) | EXACT | |
| 28 | SW verification of embedded SW | `sw-verification` (aspice) | EXACT | |
| 29 | Configuration management | `sw-config-index` (do-178c) | APPROX | Aerospace-flavoured SCI, not a 26262 CM plan. |
| 30 | Change management | `change-request` (iec-62304) / `modification-request` (iec-61508) / `change-management` (en-50128) | EXACT | |
| 31 | Safety file / documentation | `doc` (score) | APPROX | Generic document; no "safety file" aggregation. |
| 32 | Tool confidence / TCL + TQL | `tool-qualification` (en-50128) / `tool-req` + `tsf` (score) / `ai-tool-qual` (iso-pas-8800) | APPROX | score has `classification: TI1..TI3`; iso-pas-8800 has TQL-1..5 for AI. No TCL (TI × TD) matrix, no TD classification field. |
| 33 | SW component qualification | `safety-manual` (iec-61508) | APPROX | Weak — no qualification evidence structure. |
| 34 | HW component qualification | none | ABSENT | |
| 35 | Proven-in-use | none | ABSENT | No operational-history artifact, no failure-rate-from-field field. |
| 36 | DIA / distributed development | none | ABSENT | No multi-party agreement artifact; `provenance.reviewed-by` is single-field. |
| 37 | ASIL decomposition | none | ABSENT | `asil` / `safety-level` exists as an enum on several types, but **no decomposition link type and no validation rule that parent ASIL ≥ Σ children's derated ASILs**. |
| 38 | Coexistence criteria | `dfa-entry` (score) | APPROX | DFA entry exists but freedom-from-interference between mixed-ASIL components is not an enforced invariant. |
| 39 | DFA | `dfa-entry` (score) | EXACT | |
| 40 | Safety case | full `safety-case.yaml` (GSN) | EXACT | Goal/Strategy/Solution/Context/Justification/AwayGoal all present; `asil` field on `safety-goal`. |

**Totals (40 artifacts):** EXACT 13 (32.5%), APPROX 17 (42.5%), ABSENT 10 (25%).

---

## Section C — Gap register (top 10 by blast radius)

Ranked by how much an ISO 26262 programme suffers without the artifact.

| Rank | Gap | Clause | Why it can't be faked with existing types | Minimum type sketch | Effort |
|---|---|---|---|---|---|
| 1 | **ASIL + ASIL decomposition** | 3-7.4.4, 9-5 | Several schemas have `asil` / `safety-level` as an enum field, but rivet has no link type (`decomposes-asil`) and no validation rule enforcing that decomposed children carry a valid derated ASIL combination (D → B+B, C+A, D+QM (with independence)). Cross-field validator logic does not support numeric/enumerated inheritance. | `asil-decomposition` artifact with `parent-asil`, `child-asils`, `independence-evidence`; new `decomposes-asil` link; traceability rule over link cardinality + enum arithmetic. | Medium (schema S, validator M) |
| 2 | **FMEDA with SPFM/LFM/DC/PMHF fields** | 5-8, 5-9, Annex D–F | `fmea-entry` (score) captures descriptive FMEA (mode/effect/cause/S/O/D/RPN) but has no `diagnostic-coverage %`, `failure-rate (FIT)`, `safe-faults %`, `spfm-contribution`, `lfm-contribution` numeric fields — and no aggregation rule rolling up per-element contributions into element-level SPFM/LFM and system-level PMHF against ASIL thresholds. | New `fmeda-entry`, `hw-element`, `hw-metric-target` types; numeric-comparison validation rules (`spfm >= 0.90` for ASIL B, `0.97` for ASIL C/D, etc.). | Large (schema M, validator L — needs numeric comparisons with ASIL-keyed thresholds) |
| 3 | **Item definition** | 3-5 | `stkh-req` is a requirement, not a scope/boundary/assumption container. Auditors expect a single anchor describing the item, its boundary, its legal assumptions, its operating modes — an item is a first-class thing HARA attaches to. | New `item` type with `boundary`, `external-interfaces`, `operating-modes`, `legal-assumptions`, `vehicle-context`. | Small |
| 4 | **HARA S/E/C → ASIL** | 3-6.4.3–3-6.4.4 | `hazard-risk-assessment` in iec-61508 uses SIL-era risk level/consequence/frequency, not the 26262 triad (Severity S0–S3, Exposure E0–E4, Controllability C0–C3). Auditors require the S/E/C values on every hazardous event plus the lookup yielding ASIL. | New `hazardous-event` type with `severity: S0..S3`, `exposure: E0..E4`, `controllability: C0..C3`, computed/stated `asil`; validation rule that ASIL matches S/E/C lookup. | Medium |
| 5 | **HSI specification** | 4-6.4.8 / 5-6 | Free-form `interfaces: structured` on components is not a signoff artifact. The HSI is a deliverable jointly owned by HW and SW teams and must list signals, timing, error handling, and shared safety mechanisms. | New `hsi-spec` type with `signals`, `timing-budget`, `shared-safety-mechanisms`, `hw-side-owner`, `sw-side-owner`. | Small |
| 6 | **Safety mechanism (typed)** | 4-6.4.3 | Currently implicit in `ai-arch-measure` (SOTIF/AI-scoped) or `controller-constraint` (STPA). No first-class safety mechanism with diagnostic coverage, detection latency, reaction time, safe-state transition. | New `safety-mechanism` type with `dc-percent`, `detection-latency`, `reaction-time`, `ftti-budget`, `safe-state-ref`. | Small |
| 7 | **Safe state + FTTI on safety goal** | 3-7.4.2 | `safety-goal` (safety-case) has `asil` but no `safe-state` and no `ftti`. These are mandatory on every safety goal and downstream timing budgets depend on them. | Add `safe-state: text`, `ftti-ms: number`, `warning-time: number` fields to `safety-goal` or introduce `safety-goal-26262` specialisation. | Small |
| 8 | **Tool confidence (TCL/TD)** | 8-11 | score has `classification: TI1..TI3` (impact), iso-pas-8800 has `tool-class: TQL-1..5` (AI-scoped). Neither captures TD (Tool error Detection) and the TCL matrix (TI × TD → TCL1..3) used by 26262. | New `tool-confidence` type with `ti: TI1..TI3`, `td: TD1..TD3`, derived `tcl: TCL1..TCL3`, link to `tool-req`; qualification evidence link for TCL2/TCL3. | Small |
| 9 | **DIA — Development Interface Agreement** | 8-5 | No multi-party agreement artifact; `provenance.reviewed-by` is one free-form string. A DIA governs work-split between OEM and tier-1/tier-2 suppliers. | New `dia` type with `parties`, `allocated-activities`, `deliverables`, `responsibility-matrix`, `signoff-status`. | Small |
| 10 | **Coverage metrics per ASIL** | 6-9, tables | `sw-verification` / `unit-verification` have no coverage fields. ISO 26262 tables 12/13/15 demand statement/branch/MC-DC coverage at specified ASILs. | Add `coverage-metrics` mapping (`statement %`, `branch %`, `mcdc %`, `call-coverage %`) to verification types, with ASIL-keyed threshold rules. | Small–Medium |

Not in top-10 but worth recording: **proven-in-use** (ABSENT), **HW component qualification** (ABSENT), **HW detailed design** (ABSENT), **item-vs-element distinction**, **coexistence/freedom-from-interference** (APPROX — needs memory/timing-partitioning link semantics).

---

## Section D — Recommendation

**Can rivet honestly claim "ISO 26262 support" today?** No. 32.5% EXACT
coverage is below the bar. Several of the ABSENT artifacts (ASIL
decomposition, FMEDA with SPFM/LFM/PMHF, HSI, item definition,
hazardous event with S/E/C) are not cosmetic — they are core evidence
items auditors open on page one. Rivet is, however, measurably closer
than most generic requirements tools: STPA coverage is complete, GSN
safety case is complete, ASPICE V-model is complete, DFA/FMEA
descriptive form exists via score, and the schema system is extensible
enough that a bridging profile is tractable.

**Minimum schema PR to make a qualified claim honest.** A new
`iso-26262.yaml` schema under `schemas/` (planned for v0.5.0) that
`extends: [common, score, safety-case, stpa]` and adds the ten types
from Section C plus two link types: `decomposes-asil` and
`item-covers-hazard`. That gets rivet from 32.5% EXACT to roughly 75%
EXACT without disturbing existing schemas.

**What cannot be fixed by schema alone.** Three items need validator
changes in `rivet-core`:

1. **ASIL decomposition arithmetic.** The rule "parent ASIL D may
   decompose to (B+B), (C+A), or (D+QM with proven independence)" is
   enum arithmetic, not a simple `required-link` rule. The
   `traceability-rules` DSL in `schema.rs` has `condition.field / values`
   but no cross-artifact numeric/enumerated comparison.
2. **SPFM/LFM/PMHF threshold checks.** These are numeric comparisons
   against ASIL-keyed thresholds aggregated over sets of linked
   artifacts. Current rules are structural (link exists / doesn't), not
   numeric-aggregating.
3. **ASIL inheritance down a link chain.** Today a `comp-req` with
   `safety-level: ASIL_A` can `satisfies` a `feat-req` with
   `safety-level: ASIL_D` with no complaint. An invariant that child
   ASIL ≥ parent ASIL (or explicit decomposition record) needs validator
   support.

Beyond those three, the process/signoff semantics (review gates,
independent-assessor signoff for ASIL C/D, baseline freezes at
milestones) are partly expressible via `status` + `provenance.reviewed-by`
but are not audit-grade: rivet has no separate independent-assessor
identity, no signoff timestamp chain, no immutable-baseline guarantee.

---

## Section E — Caveats

- The author of this document is not a certified ISO 26262 functional
  safety assessor. This mapping is a developer-facing gap list, not a
  certification opinion.
- All clause numbers are cited from training knowledge of ISO
  26262:2018 and must be re-checked against the published standard
  before being relied on in a safety submission.
- Mapping fidelity does not equal audit acceptance. A schema may
  structurally represent an artifact while still missing the
  process/signoff/baseline fields an assessor expects.
- Where fidelity is **EXACT**, it is structural only — rivet does not
  enforce review workflow, independence of the assessor, or immutability
  of baselined artifacts beyond what `status` + git history provide.
- The 2011 and 2018 editions of ISO 26262 differ significantly (Part 11
  semiconductor, Part 12 motorcycles added in 2018; HARA tables
  clarified; SOTIF scope excluded in favour of ISO 21448). This mapping
  targets the 2018 edition only.

Refs: REQ-010 (schema-driven validation), FEAT-001 (rivet engine).
