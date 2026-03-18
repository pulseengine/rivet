---
id: SRS-001
type: specification
title: System Requirements Specification
status: draft
glossary:
  STPA: Systems-Theoretic Process Analysis
  STPA-Sec: STPA extended for adversarial/security analysis
  UCA: Unsafe Control Action
  CIA: Confidentiality, Integrity, Availability (information security triad)
  ASPICE: Automotive SPICE
  OSLC: Open Services for Lifecycle Collaboration
  ReqIF: Requirements Interchange Format
  WASM: WebAssembly
---

# System Requirements Specification

## 1. Purpose

This document specifies the system-level requirements for **Rivet**, an SDLC
traceability tool for safety-critical systems.  Rivet manages lifecycle
artifacts (requirements, designs, tests, STPA analyses) as version-controlled
YAML files and validates their traceability links against composable schemas.

## 2. Scope

Rivet targets Automotive SPICE, ISO 26262, and ISO/SAE 21434 workflows.  It
replaces heavyweight ALM tools with a text-file-first, git-friendly approach.

## 3. Functional Requirements

### 3.1 Artifact Management

[[REQ-001]] defines the core principle: artifacts live as human-readable YAML
files under version control.

[[REQ-002]] extends this to STPA artifacts — losses, hazards, unsafe control
actions, causal factors, and loss scenarios.

### 3.2 Traceability

[[REQ-003]] requires full Automotive SPICE V-model traceability, from
stakeholder requirements down to unit verification and back.

[[REQ-004]] mandates a validation engine that checks link integrity,
cardinality constraints, required fields, and traceability coverage.

### 3.3 Schema System

[[REQ-010]] requires schema-driven validation where artifact types, fields,
link types, and traceability rules are defined declaratively.

[[REQ-015]] aligns schemas with ASPICE 4.0 terminology (verification replaces
test).

[[REQ-016]] adds cybersecurity schema support for ISO/SAE 21434 and ASPICE
SEC.1-4.

### 3.4 Interoperability

[[REQ-005]] covers ReqIF 1.2 import/export for requirements interchange with
tools like DOORS, Polarion, and codebeamer.

[[REQ-006]] specifies OSLC-based bidirectional synchronization rather than
per-tool REST adapters.

[[REQ-008]] enables WASM component adapters for custom format plugins.

### 3.5 User Interface

[[REQ-007]] requires both a CLI and an HTTP serve pattern for the dashboard.

### 3.6 Quality

[[REQ-012]] mandates comprehensive CI quality gates (fmt, clippy, test, miri,
audit, deny, vet, coverage).

[[REQ-013]] requires performance benchmarks with regression detection.

[[REQ-014]] structures test artifacts to mirror the ASPICE SWE.4/5/6 levels.

[[REQ-009]] ties test results to GitHub releases as evidence artifacts.

[[REQ-011]] pins Rust edition 2024 with MSRV 1.85.

### 3.7 V-Model Traceability Flow

The following diagram shows the ASPICE V-model traceability chain from
stakeholder needs through to verification evidence:

```mermaid
graph LR
    REQ[REQ<br/>Requirements] -->|satisfies| DD[DD<br/>Design Decisions]
    REQ -->|allocated-to| ARCH[ARCH<br/>Architecture]
    DD -->|implemented-by| FEAT[FEAT<br/>Features]
    ARCH -->|allocated-from| FEAT
    FEAT -->|verified-by| TEST[TEST<br/>Verification]
    TEST -->|evidence| RES[Results<br/>Evidence]
    style REQ fill:#e8f4fd,stroke:#0550ae
    style DD fill:#fff3cd,stroke:#856404
    style ARCH fill:#f0e6ff,stroke:#6639ba
    style FEAT fill:#d1ecf1,stroke:#0c5460
    style TEST fill:#e6ffe6,stroke:#15713a
    style RES fill:#f8d7da,stroke:#721c24
```

Every requirement must trace to both a design decision and a feature
implementation.  Every feature must be verified by at least one TEST artifact.

### 3.8 STPA Safety Analysis

Rivet's safety is analyzed using STPA (Systems-Theoretic Process Analysis),
producing:

- **[[L-1]]–[[L-6]]** — System losses (what we must prevent)
- **[[H-1]]–[[H-12]]** — Hazards leading to those losses
- **[[SC-1]]–[[SC-14]]** — System constraints preventing each hazard
- Controllers, UCAs, controller constraints, and loss scenarios in `safety/stpa/`

The STPA hierarchy is browsable from the **STPA** dashboard section.

### 3.9 STPA-Sec Security Analysis

Rivet is also analyzed under STPA-Sec — the adversarial extension of STPA
described in Leveson & Thomas (STPA Handbook, 2018).  STPA-Sec adds one
question at each analysis step: *how could an adversary introduce this
unsafe condition?*

The security analysis in `safety/stpa-sec/` covers:

- **[[SL-1]]–[[SL-5]]** — Security losses (CIA-triad violations)
- **[[SH-1]]–[[SH-6]]** — Security hazards (exploitable system states)
- **[[SSC-1]]–[[SSC-6]]** — Security constraints (required mitigations)
- **[[SUCA-CLI-1]]**, **[[SUCA-DASH-1]]**, etc. — Security UCAs with `adversarial-causation` fields
- **[[SLS-1]]–[[SLS-7]]** — Security loss scenarios (concrete attack paths)

Key threats identified:
1. Supply-chain artifact injection via git remote compromise ([[SLS-1]])
2. OSLC MITM with TLS certificate validation disabled ([[SLS-2]])
3. XSS via crafted artifact description in dashboard or export ([[SLS-3]], [[SLS-4]])
4. YAML bomb DoS in CI pipeline ([[SLS-5]])
5. OSLC URL hijack by insider ([[SLS-6]])
6. Unauthenticated dashboard exposed on CI runner ([[SLS-7]])

The STPA-Sec analysis is browsable from the **STPA** dashboard section
(scroll below the STPA hierarchy).

### 3.10 Key Requirement Details

The following requirement is the cornerstone of the system:

{{artifact:REQ-001}}

And the design decision that shapes tool integration:

{{artifact:DD-001}}

## 4. Glossary

See the glossary panel below (defined in document frontmatter).
