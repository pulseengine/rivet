---
id: SEC-ANALYSIS-001
type: specification
title: STPA-Sec Security Analysis
status: approved
glossary:
  STPA-Sec: STPA extended for adversarial/security analysis
  CIA: Confidentiality, Integrity, Availability
  UCA: Unsafe Control Action
  MITM: Man-in-the-Middle attack
  XSS: Cross-Site Scripting
  DoS: Denial of Service
---

# STPA-Sec Security Analysis

## 1. Methodology

STPA-Sec is the adversarial extension of STPA (Systems-Theoretic Process
Analysis).  Where standard STPA asks "what system states lead to losses?",
STPA-Sec adds: **"how could an adversary introduce or exploit those states?"**

The extension adds one question at each of the four STPA analysis steps:

| Step | Standard STPA | STPA-Sec addition |
|------|---------------|-------------------|
| 1 — Losses & hazards | What system states lead to losses? | Which CIA properties does each loss violate? |
| 2 — Control structure | What control actions exist? | Which channels can an adversary intercept? |
| 3 — UCAs | When is a control action unsafe? | How could an adversary *cause* the UCA? |
| 4 — Scenarios | What causal pathways lead to a UCA? | How could the adversary inject/spoof/tamper with feedback or control paths? |

The adversary model covers four attacker types: external-network, insider,
supply-chain, and physical.

## 2. Security Losses

The analysis identifies five security losses covering all three CIA properties:

{{artifact:SL-1}}

{{artifact:SL-2}}

{{artifact:SL-3}}

{{artifact:SL-4}}

{{artifact:SL-5}}

## 3. Security Hazards

Six exploitable system states are identified:

{{artifact:SH-1}}

{{artifact:SH-2}}

{{artifact:SH-3}}

{{artifact:SH-4}}

{{artifact:SH-5}}

{{artifact:SH-6}}

## 4. Security Constraints

Each hazard has a corresponding constraint that eliminates or mitigates it:

| Hazard | Constraint | Summary |
|--------|------------|---------|
| SH-1 | [[SSC-1]] | Validate import provenance and integrity |
| SH-2 | [[SSC-2]] | Detect unauthorized store modifications |
| SH-3 | [[SSC-3]] | No unauthenticated network exposure |
| SH-4 | [[SSC-4]] | HTML-escape all rendered artifact content |
| SH-5 | [[SSC-5]] | OSLC URL allowlist validation |
| SH-6 | [[SSC-6]] | YAML/ReqIF parsing resource limits |

## 5. Security UCAs

Seven security Unsafe Control Actions are defined — one per controller
component.  Each includes an `adversarial-causation` field explaining the
specific attack path:

- **[[SUCA-CLI-1]]**: CLI does not validate import source provenance
- **[[SUCA-CLI-2]]**: CLI provides HTML export without content sanitization
- **[[SUCA-DASH-1]]**: Dashboard serves artifacts without authentication
- **[[SUCA-DASH-2]]**: Dashboard provides un-escaped content in HTML
- **[[SUCA-CORE-1]]**: Validation engine has no YAML parsing resource limits
- **[[SUCA-OSLC-1]]**: OSLC sync has no server URL allowlist
- **[[SUCA-OSLC-2]]**: OSLC sync does not verify TLS certificate authenticity

## 6. Attack Scenarios

Seven concrete attack scenarios are documented:

| ID | Title | Vector | Attacker |
|----|-------|--------|---------|
| [[SLS-1]] | Git remote compromise — artifact replacement | network | external |
| [[SLS-2]] | OSLC MITM — requirement injection | adjacent | external |
| [[SLS-3]] | XSS via crafted artifact in dashboard | local | insider |
| [[SLS-4]] | XSS via crafted artifact in HTML export | local | insider |
| [[SLS-5]] | YAML bomb DoS in CI pipeline | network | supply-chain |
| [[SLS-6]] | rivet.yaml URL hijack — artifact exfiltration | local | insider |
| [[SLS-7]] | Unauthenticated dashboard on CI runner | network | external |

## 7. Relationship to Standard STPA

The STPA-Sec analysis in `safety/stpa-sec/` complements, not replaces, the
standard STPA analysis in `safety/stpa/`.  The safety analysis identifies
accidental system failures; the security analysis identifies adversarial
exploitation.

Both analyses share the same control structure (controllers and controlled
processes) defined in `safety/stpa/control-structure.yaml`.

Both analyses are browsable together from the **STPA** dashboard section.

## 8. Implementation Status

Current mitigations in place as of v0.2.0-dev:

| Constraint | Status | Evidence |
|------------|--------|---------|
| [[SSC-4]] HTML escaping | ✅ Implemented | `html_escape()` in all views; see `serve/views.rs` |
| [[SSC-6]] YAML size limits | ⚠️ Partial | serde_yaml 0.9+ limits aliases; no doc-size limit yet |
| [[SSC-3]] Localhost default | ⚠️ Partial | Configurable but not enforced by default |
| [[SSC-1]] Provenance check | ❌ Planned | Phase 3 |
| [[SSC-2]] Store integrity | ❌ Planned | Phase 3 (git-based verification) |
| [[SSC-5]] URL allowlist | ❌ Planned | Phase 3 (OSLC implementation) |
