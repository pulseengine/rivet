---
id: DOC-SCHEMA-REFERENCE
title: Schema Reference
type: reference
status: current
tags: [schema, reference, stpa, aspice, cybersecurity, safety]
---

# Schema Reference

Rivet schemas are YAML files that define artifact types, link types, field constraints,
and traceability rules. Multiple schemas are merged at load time -- a project typically
loads `common` plus one or more domain schemas.

---

## Available Schemas

The `schemas/` directory ships a catalogue of domain schemas covering systems-safety
analysis, automotive process models, functional-safety standards, AI-safety regulation,
and supply-chain compliance, plus a set of *bridge* schemas that wire those domains
together. Every domain schema implicitly extends `common`.

This catalogue grows; the table below is a snapshot, not a hard contract. The
authoritative inventory is whatever `schemas/*.yaml` actually contains in the repository
you are using -- run `ls schemas/` to see it.

### Domain schemas

<!-- AUDIT: verified 2026-05-21 -->
As of this writing the directory ships 21 domain schemas and 8 bridge schemas.

| Schema           | Domain                                                            |
|------------------|-------------------------------------------------------------------|
| `common`         | Base fields and link types shared by every schema                 |
| `dev`            | Lightweight software-development tracking (Rivet dogfoods this)   |
| `stpa`           | STPA systems-theoretic process analysis (the full four-step model)|
| `stpa-sec`       | STPA-Sec security-extended analysis                               |
| `stpa-ai`        | STPA-for-AI: ML-lifecycle hazards, data provenance, retraining     |
| `aspice`         | Automotive SPICE PAM v4.0 V-model                                 |
| `cybersecurity`  | Automotive cybersecurity (SEC.1-4 / ISO/SAE 21434)                |
| `iso-26262`      | ISO 26262 road-vehicle functional safety                          |
| `iso-pas-8800`   | ISO/PAS 8800 AI safety lifecycle for road vehicles                |
| `sotif`          | ISO 21448 Safety Of The Intended Functionality                   |
| `do-178c`        | DO-178C airborne software certification                           |
| `en-50128`       | EN 50128 railway software safety                                  |
| `iec-61508`      | IEC 61508 functional safety of E/E/PE systems                     |
| `iec-62304`      | IEC 62304 medical-device software lifecycle                       |
| `eu-ai-act`      | EU AI Act technical documentation for high-risk AI systems        |
| `safety-case`    | GSN (Goal Structuring Notation) structured safety arguments       |
| `aadl`           | AADL architecture components, flows, and analysis results         |
| `score`          | Eclipse SCORE metamodel (ASIL-rated open-source software)         |
| `supply-chain`   | Software supply chain: SBOM, build provenance, CVE tracking       |
| `vv-coverage`    | Repo-level V&V technique coverage matrix                          |
| `research`       | Market research, competitive analysis, patent landscape           |

### Bridge schemas

Bridge schemas declare cross-domain link types so artifacts modelled under one schema can
trace into another (e.g. an STPA hazard linked to an ISO 26262 safety goal). Load a bridge
schema alongside both of the domain schemas it connects.

| Bridge schema                     | Connects                                  |
|-----------------------------------|--------------------------------------------|
| `stpa-dev.bridge`                 | STPA analysis <-> `dev` requirements        |
| `iso-8800-stpa.bridge`            | ISO/PAS 8800 <-> STPA                       |
| `sotif-stpa.bridge`               | SOTIF <-> STPA                              |
| `eu-ai-act-stpa.bridge`           | EU AI Act <-> STPA                          |
| `eu-ai-act-aspice.bridge`         | EU AI Act <-> ASPICE                        |
| `safety-case-stpa.bridge`         | GSN safety case <-> STPA                    |
| `safety-case-eu-ai-act.bridge`    | GSN safety case <-> EU AI Act               |
| `supply-chain-dev.bridge`         | Supply chain <-> `dev` requirements         |

Schemas are located in `schemas/` relative to the project directory. The remaining
sections of this document describe the structurally distinct schemas (`common`, `dev`,
`stpa`, `aspice`, `cybersecurity`) field-by-field; the standards-aligned schemas above
follow the same shape and are best read directly from their YAML, which carries an
extensive header comment per file.

---

## Common Schema

**File:** `schemas/common.yaml`

The common schema defines base fields present on every artifact and the link types shared
across all domains. Every domain schema implicitly extends `common`.

### Base fields

| Field         | Type          | Required | Description                              |
|---------------|---------------|----------|------------------------------------------|
| `id`          | string        | yes      | Unique identifier                        |
| `title`       | string        | yes      | Human-readable title                     |
| `description` | text          | no       | Detailed description (supports markdown) |
| `status`      | enum          | no       | Lifecycle status                         |
| `tags`        | list\<string> | no       | Arbitrary tags for categorization        |

### Link types

| Link             | Inverse          | Description                                    |
|------------------|------------------|------------------------------------------------|
| `traces-to`      | `traced-from`    | General traceability between any artifacts     |
| `satisfies`      | `satisfied-by`   | Source fulfils the target                       |
| `refines`        | `refined-by`     | Source is a refinement of the target            |
| `verifies`       | `verified-by`    | Source verifies or validates the target         |
| `implements`     | `implemented-by` | Source implements the target                    |
| `derives-from`   | `derived-into`   | Source is derived from the target               |
| `mitigates`      | `mitigated-by`   | Source mitigates or prevents the target         |
| `allocated-to`   | `allocated-from` | Source is allocated to the target               |
| `constrained-by` | `constrains`     | Source is constrained by the target             |

When `source-types` and `target-types` are omitted on a link type, any artifact type may
use it. Domain schemas may add restrictions.

---

## Dev Schema

**File:** `schemas/dev.yaml` | **Extends:** common

Lightweight artifact types for tracking requirements, design decisions, and features
within a software project. Used by Rivet to track its own development (dogfooding).

### Artifact types

#### `requirement`

A functional or non-functional requirement.

| Field      | Type   | Required | Allowed values                                  |
|------------|--------|----------|-------------------------------------------------|
| `priority` | string | no       | `must`, `should`, `could`, `wont`               |
| `category` | string | no       | `functional`, `non-functional`, `constraint`, `interface` |

Link fields:
- `satisfies` (zero-or-many) -- link to any artifact this requirement satisfies
- `derives-from` (zero-or-many) -- link to parent requirements

#### `design-decision`

An architectural or design decision with rationale.

| Field          | Type | Required | Description                |
|----------------|------|----------|----------------------------|
| `rationale`    | text | yes      | Why this decision was made |
| `alternatives` | text | no       | Rejected alternatives      |

Link fields:
- `satisfies` (one-or-many, required) -- must link to at least one `requirement`

#### `feature`

A user-visible capability or feature.

| Field   | Type   | Required | Allowed values                            |
|---------|--------|----------|-------------------------------------------|
| `phase` | string | no       | `phase-1`, `phase-2`, `phase-3`, `future` |

Link fields:
- `satisfies` (one-or-many) -- link to requirements this feature satisfies
- `implements` (zero-or-many) -- link to artifacts this feature implements

### Additional link types

| Link          | Inverse           | Description                              |
|---------------|-------------------|------------------------------------------|
| `depends-on`  | `depended-on-by`  | Source depends on target being completed  |

### Traceability rules

| Rule                     | Severity | Description                                        |
|--------------------------|----------|----------------------------------------------------|
| `requirement-coverage`   | warning  | Every requirement should be satisfied by a decision or feature |
| `decision-justification` | error    | Every design decision must link to a requirement   |

### Example artifact

```yaml
artifacts:
  - id: DD-001
    type: design-decision
    title: OSLC over per-tool REST adapters
    status: approved
    tags: [architecture, oslc]
    links:
      - type: satisfies
        target: REQ-006
    fields:
      rationale: >
        OSLC is an OASIS standard that Polarion, DOORS, and codebeamer
        already support natively. One adapter handles all tools.
      alternatives: >
        Per-tool REST adapters. Rejected due to maintenance burden.
```

---

## STPA Schema

**File:** `schemas/stpa.yaml` | **Extends:** common | **Version:** 0.1.0

Artifact types for a complete STPA (Systems-Theoretic Process Analysis) following the
STPA Handbook (Leveson & Thomas, 2018). Covers all four STPA steps.

### Artifact types

#### Step 1a -- `loss`

An undesired event involving something of value to stakeholders. Losses define what the
analysis aims to prevent.

| Field          | Type          | Required |
|----------------|---------------|----------|
| `stakeholders` | list\<string> | no       |

No required links. Losses are the root of the STPA hierarchy.

#### Step 1b -- `hazard`

A system state that, together with worst-case environmental conditions, leads to a loss.

| Field      | Type   | Required | Allowed values                                    |
|------------|--------|----------|---------------------------------------------------|
| `severity` | string | no       | `catastrophic`, `critical`, `marginal`, `negligible` |

Link fields:
- `losses` via `leads-to-loss` (one-or-many, required) -- must link to at least one `loss`

#### Step 1b -- `sub-hazard`

A refinement of a hazard into a more specific unsafe condition.

Link fields:
- `parent` via `refines` (exactly-one, required) -- must refine exactly one `hazard`

#### Step 1c -- `system-constraint`

A condition that must be satisfied to prevent a hazard. Each constraint is the inversion
of a hazard.

| Field           | Type   | Required |
|-----------------|--------|----------|
| `spec-baseline` | string | no       |

Link fields:
- `hazards` via `prevents` (one-or-many, required) -- must prevent at least one `hazard` or `sub-hazard`

#### Step 2 -- `controller`

A system component (human or automated) responsible for issuing control actions.

| Field             | Type          | Required | Allowed values                              |
|-------------------|---------------|----------|---------------------------------------------|
| `controller-type` | string        | no       | `human`, `automated`, `human-and-automated` |
| `source-file`     | string        | no       | Source file implementing this controller     |
| `process-model`   | list\<string> | no       | Controller's beliefs about process state     |

No required links.

#### Step 2 -- `controlled-process`

A process being controlled -- the physical or data transformation acted upon by controllers.
No required fields or links.

#### Step 2 -- `control-action`

An action issued by a controller to a controlled process or another controller.

| Field    | Type   | Required |
|----------|--------|----------|
| `action` | string | yes      |

Link fields:
- `source` via `issued-by` (exactly-one, required) -- the issuing `controller`
- `target` via `acts-on` (exactly-one, required) -- the target `controlled-process` or `controller`

#### Step 3 -- `uca` (Unsafe Control Action)

A control action that, in a particular context, leads to a hazard. Four UCA types
(provably complete): not-providing, providing, too-early-too-late, stopped-too-soon.

| Field       | Type   | Required | Allowed values                                          |
|-------------|--------|----------|---------------------------------------------------------|
| `uca-type`  | string | yes      | `not-providing`, `providing`, `too-early-too-late`, `stopped-too-soon` |
| `context`   | text   | no       | The context in which the control action is unsafe        |
| `rationale` | text   | no       | Why this UCA leads to the linked hazards                 |

Link fields:
- `controller` via `issued-by` (exactly-one, required) -- the responsible `controller`
- `hazards` via `leads-to-hazard` (one-or-many, required) -- hazards this UCA leads to

#### Step 3b -- `controller-constraint`

A constraint on a controller's behavior derived by inverting a UCA.

| Field        | Type | Required |
|--------------|------|----------|
| `constraint` | text | yes      |

Link fields:
- `controller` via `constrains-controller` (exactly-one, required)
- `ucas` via `inverts-uca` (one-or-many, required)
- `hazards` via `prevents` (one-or-many, required)

#### Step 4 -- `loss-scenario`

A causal pathway describing how a UCA could occur or how the control action could be
improperly executed.

| Field            | Type          | Required | Allowed values                                                   |
|------------------|---------------|----------|------------------------------------------------------------------|
| `scenario-type`  | string        | no       | `controller-failure`, `inadequate-control-algorithm`, `inadequate-process-model`, `inadequate-feedback`, `process-model-flaw`, `coordination-failure`, `actuator-failure`, `sensor-failure`, `control-path` |
| `causal-factors` | list\<string> | no       | Contributing causes                                               |

Link fields:
- `uca` via `caused-by-uca` (zero-or-many) -- the UCA(s) this scenario explains
- `hazards` via `leads-to-hazard` (one-or-many, required) -- hazards this scenario leads to

### STPA link types

| Link                    | Inverse                   | Source types                    | Target types               |
|-------------------------|---------------------------|---------------------------------|----------------------------|
| `leads-to-loss`         | `loss-caused-by`          | hazard, sub-hazard              | loss                       |
| `prevents`              | `prevented-by`            | system-constraint, controller-constraint | hazard, sub-hazard |
| `leads-to-hazard`       | `hazard-caused-by`        | uca, loss-scenario              | hazard, sub-hazard         |
| `inverts-uca`           | `inverted-by`             | controller-constraint           | uca                        |
| `issued-by`             | `issues`                  | uca, control-action             | controller                 |
| `constrains-controller` | `controller-constrained-by` | controller-constraint         | controller                 |
| `acts-on`               | `acted-on-by`             | control-action                  | controlled-process, controller |
| `caused-by-uca`         | `causes-scenario`         | loss-scenario                   | uca                        |

### Traceability rules

| Rule                             | Severity | Description                                              |
|----------------------------------|----------|----------------------------------------------------------|
| `hazard-has-loss`                | error    | Every hazard must link to at least one loss              |
| `constraint-has-hazard`          | error    | Every system constraint must link to a hazard            |
| `uca-has-hazard`                 | error    | Every UCA must link to at least one hazard               |
| `uca-has-controller`             | error    | Every UCA must link to a controller                      |
| `controller-constraint-has-uca`  | error    | Every controller constraint must link to a UCA           |
| `hazard-has-constraint`          | warning  | Every hazard should be addressed by a constraint         |
| `uca-has-controller-constraint`  | warning  | Every UCA should be addressed by a controller constraint |

---

## ASPICE Schema

**File:** `schemas/aspice.yaml` | **Extends:** common | **Version:** 0.2.0

Artifact types and traceability rules for the full Automotive SPICE V-model, aligned
with ASPICE PAM v4.0.

### Terminology (ASPICE 4.0)

ASPICE 4.0 introduced key terminology changes from v3.x:

- "Test case" is now **"verification measure"** -- broader scope including review,
  static analysis, formal verification, simulation, and inspection (not just testing)
- SWE.5 expanded to include component verification
- SWE.6 and SYS.5 renamed from "qualification test" to "verification"

All verification method fields accept: `automated-test`, `manual-test`, `review`,
`static-analysis`, `formal-verification`, `simulation`, `inspection`, `walkthrough`.

### Artifact types -- Left side of V (specification)

| Type                   | ASPICE Process | Description                           |
|------------------------|----------------|---------------------------------------|
| `stakeholder-req`      | SYS.1          | Stakeholder requirement               |
| `system-req`           | SYS.2          | System requirement                    |
| `system-arch-component`| SYS.3          | System architectural element          |
| `sw-req`               | SWE.1          | Software requirement                  |
| `sw-arch-component`    | SWE.2          | Software architectural element        |
| `sw-detail-design`     | SWE.3          | Detailed design / unit specification  |

### Artifact types -- Right side of V (verification)

| Type                          | ASPICE Process | Description                                |
|-------------------------------|----------------|--------------------------------------------|
| `unit-verification`           | SWE.4          | Unit verification measure                  |
| `sw-integration-verification` | SWE.5          | SW component + integration verification    |
| `sw-verification`             | SWE.6          | SW verification against SW requirements    |
| `sys-integration-verification`| SYS.4          | System integration verification            |
| `sys-verification`            | SYS.5          | System verification against system reqs    |

### Artifact types -- Execution results

| Type                      | Description                                              |
|---------------------------|----------------------------------------------------------|
| `verification-execution`  | A verification run against a specific version            |
| `verification-verdict`    | Pass/fail verdict for a single measure in an execution   |

Verdict values: `pass`, `fail`, `blocked`, `skipped`, `error`.

### Key fields

**`verification-criteria`** (on `system-req`, `sw-req`): ASPICE 4.0 requires requirements
to specify how they will be verified. This field captures those criteria.

**`method`** (on all verification types): The verification method used.

### Required link chains

The ASPICE schema enforces the V-model traceability:

```
stakeholder-req                             sys-verification
       |                                          |
       v  derives-from                  verifies  v
   system-req                               system-req
       |                                          |
       v  allocated-from             verifies     v
   system-arch-component        sys-integration-verification
       |                                          |
       v  derives-from                  verifies  v
     sw-req                         system-arch-component
       |                                          |
       v  allocated-from             verifies     v
   sw-arch-component            sw-integration-verification
       |                                          |
       v  refines                       verifies  v
   sw-detail-design                sw-arch-component
                                                  |
                                        verifies  v
                                  unit-verification
                                                  |
                                        verifies  v
                                    sw-detail-design
```

### ASPICE-specific link types

| Link                  | Inverse             | Description                               |
|-----------------------|---------------------|-------------------------------------------|
| `result-of`           | `has-result`        | Verdict is result of a verification measure |
| `part-of-execution`   | `contains-verdict`  | Verdict belongs to an execution run       |

### Traceability rules

| Rule                       | Severity | Description                                            |
|----------------------------|----------|--------------------------------------------------------|
| `sys2-derives-from-sys1`   | error    | System req must derive from stakeholder req            |
| `swe1-derives-from-sys`    | error    | SW req must derive from system req or arch component   |
| `swe2-allocated-from-swe1` | error    | SW arch must be allocated from SW req                  |
| `swe3-refines-swe2`        | error    | Detailed design must refine an arch component          |
| `swe4-verifies-swe3`       | error    | Unit verification must verify a detailed design        |
| `swe6-verifies-swe1`       | error    | SW verification must verify a SW requirement           |
| `sys5-verifies-sys2`       | error    | System verification must verify a system requirement   |
| `swe1-has-verification`    | warning  | Every SW req should be verified                        |
| `sys2-has-verification`    | warning  | Every system req should be verified                    |
| `swe3-has-verification`    | warning  | Every detailed design should be verified               |

---

## Cybersecurity Schema

**File:** `schemas/cybersecurity.yaml` | **Extends:** common | **Version:** 0.1.0

Artifact types for automotive cybersecurity engineering aligned with Automotive SPICE
v4.0 cybersecurity plug-in (SEC.1-4) and ISO/SAE 21434.

### Artifact types -- TARA (MAN.7)

| Type               | Description                                            |
|--------------------|--------------------------------------------------------|
| `asset`            | Item of value requiring protection (data, function, component) |
| `threat-scenario`  | Potential attack scenario against an asset             |
| `risk-assessment`  | Combined risk level from threat feasibility and impact |

#### `asset` fields

| Field                       | Type          | Required | Allowed values                                     |
|-----------------------------|---------------|----------|----------------------------------------------------|
| `asset-type`                | string        | no       | `data`, `function`, `component`, `interface`, `key-material` |
| `cybersecurity-properties`  | list\<string> | no       | CIA properties (confidentiality, integrity, etc.)  |

#### `threat-scenario` fields

| Field                | Type   | Required | Allowed values                        |
|----------------------|--------|----------|---------------------------------------|
| `attack-vector`      | string | no       | `network`, `physical`, `local`, `adjacent` |
| `attack-feasibility` | string | no       | `high`, `medium`, `low`, `very-low`   |
| `impact`             | string | no       | `severe`, `major`, `moderate`, `negligible` |

Link fields: `targets` via `threatens` (one-or-many, required) -- must target at least one `asset`

#### `risk-assessment` fields

| Field            | Type   | Required | Allowed values                               |
|------------------|--------|----------|----------------------------------------------|
| `risk-level`     | string | yes      | `unacceptable`, `conditional`, `acceptable`  |
| `risk-treatment` | string | no       | `mitigate`, `avoid`, `transfer`, `accept`    |

Link fields: `threat` via `assesses` (exactly-one, required) -- must assess one `threat-scenario`

### Artifact types -- SEC processes

| Type                           | ASPICE Process | Description                              |
|--------------------------------|----------------|------------------------------------------|
| `cybersecurity-goal`           | SEC.1          | Top-level cybersecurity requirement      |
| `cybersecurity-req`            | SEC.1          | Detailed cybersecurity requirement       |
| `cybersecurity-design`         | SEC.2          | Security mechanism or architecture       |
| `cybersecurity-implementation` | SEC.3          | Code, configuration, key provisioning    |
| `cybersecurity-verification`   | SEC.4          | Verification measure (pentest, fuzz, review) |

#### `cybersecurity-goal` fields

| Field                   | Type   | Required | Allowed values  |
|-------------------------|--------|----------|-----------------|
| `cal`                   | string | no       | `1`, `2`, `3`, `4` (Cybersecurity Assurance Level) |
| `verification-criteria` | text   | no       |                 |

Link fields: `mitigates` (one-or-many, required) -- must mitigate at least one `threat-scenario`

#### `cybersecurity-verification` methods

The cybersecurity verification type includes security-specific methods:
`penetration-test`, `fuzz-test`, `code-review`, `static-analysis`, `vulnerability-scan`,
`automated-test`, `manual-test`, `formal-verification`.

### Required link chain

```
asset <- threatens <- threat-scenario <- assesses <- risk-assessment
                              ^
                              |  mitigates
                    cybersecurity-goal
                              |  derives-from
                    cybersecurity-req
                              |  satisfies
                    cybersecurity-design
                              |  implements
                    cybersecurity-implementation
                              |  verifies
                    cybersecurity-verification
```

### Cybersecurity-specific link types

| Link         | Inverse         | Source types       | Target types       |
|--------------|-----------------|--------------------|--------------------|
| `threatens`  | `threatened-by` | threat-scenario    | asset              |
| `assesses`   | `assessed-by`   | risk-assessment    | threat-scenario    |

### Traceability rules

| Rule                        | Severity | Description                                           |
|-----------------------------|----------|-------------------------------------------------------|
| `threat-has-asset`          | error    | Every threat must target an asset                     |
| `risk-has-threat`           | error    | Every risk assessment must assess a threat            |
| `goal-mitigates-threat`     | error    | Every goal must mitigate a threat                     |
| `req-derives-from-goal`     | error    | Every cybersecurity req must derive from a goal       |
| `design-satisfies-req`      | error    | Every design must satisfy a cybersecurity req         |
| `impl-implements-design`    | error    | Every implementation must implement a design          |
| `verification-verifies-sec` | error    | Every verification must verify a req, design, or impl |
| `sec-req-has-verification`  | warning  | Every cybersecurity req should be verified            |
| `sec-req-has-design`        | warning  | Every cybersecurity req should have a design          |
| `threat-has-goal`           | warning  | Every unacceptable threat should be mitigated         |

### Example artifact

```yaml
artifacts:
  - id: CSV-001
    type: cybersecurity-verification
    title: Secure boot signature rejection test
    status: approved
    tags: [secure-boot, test]
    fields:
      method: automated-test
      preconditions:
        - HSM provisioned with OEM test root-of-trust key
        - Test firmware images with valid, corrupted, and absent signatures
      steps:
        - step: 1
          action: Flash a validly signed firmware image
          expected: Image accepted and written to application partition
        - step: 2
          action: Flash an image with a corrupted signature
          expected: Bootloader rejects the image and retains previous firmware
    links:
      - type: verifies
        target: CSREQ-001
```

---

## Creating Custom Schemas

To create a custom schema for your domain:

### 1. Create the schema file

```yaml
schema:
  name: my-domain
  version: "0.1.0"
  extends: [common]
  description: Schema for my domain.
```

### 2. Define artifact types

```yaml
artifact-types:
  - name: safety-goal
    description: A top-level safety goal derived from HARA
    fields:
      - name: asil
        type: string
        required: true
        allowed-values: [QM, A, B, C, D]
      - name: safe-state
        type: text
        required: false
    link-fields:
      - name: mitigates
        link-type: mitigates
        target-types: [hazardous-event]
        required: true
        cardinality: one-or-many
```

### 3. Add domain-specific link types (if needed)

```yaml
link-types:
  - name: decomposes
    inverse: decomposed-into
    description: Source is a decomposition of the target
    source-types: [safety-req]
    target-types: [safety-goal]
```

Common link types (`satisfies`, `verifies`, `derives-from`, etc.) are inherited from the
`common` schema and do not need to be redeclared.

### 4. Add traceability rules

```yaml
traceability-rules:
  - name: goal-has-mitigation
    description: Every safety goal must mitigate a hazardous event
    source-type: safety-goal
    required-link: mitigates
    target-types: [hazardous-event]
    severity: error

  - name: goal-has-requirement
    description: Every safety goal should be decomposed into requirements
    source-type: safety-goal
    required-backlink: decomposes
    from-types: [safety-req]
    severity: warning
```

### 5. Register in rivet.yaml

```yaml
project:
  name: my-project
  schemas:
    - common
    - my-domain

sources:
  - path: artifacts
    format: generic-yaml
```

Place `my-domain.yaml` in the `schemas/` directory alongside `common.yaml`.

### Schema merging behavior

When multiple schemas are loaded, Rivet merges them:

- **Artifact types** are unioned **by name**. When two schemas define the same
  type name, their `fields` and `link-fields` are merged by field name (later
  wins on a name conflict) — so a later schema *adds* fields to an existing
  type rather than replacing it wholesale.
- **Link types** are unioned by name. Duplicates are deduplicated.
- **Traceability rules** are concatenated. All rules from all schemas apply.
- **Base fields** are defined by `common` and always present.

This allows composition: load `common` + `aspice` + `cybersecurity` to get V-model
traceability and SEC process coverage in a single project.

### Extending a built-in artifact type with project fields

Because same-named artifact types **merge their fields**, you can add
project-specific fields to a built-in type without forking its schema. This is
the supported fix for the `INFO: field '<x>' is not defined in schema for type
'<t>'` advisories you get when your artifacts carry a field the built-in schema
doesn't declare (e.g. a `crate:` field on an ASPICE `sw-req`).

1. Add a small project-local schema file (e.g. `project-ext.yaml`) under your
   project's `schemas/` directory that re-declares the built-in type name with
   only the extra field(s):

   ```yaml
   # project-ext.yaml  (place it in your project's schemas/ directory)
   schema:
     name: project-ext
     version: "0.1.0"
   artifact-types:
     - name: sw-req            # same name as the built-in ASPICE type
       description: "Project extension: add the crate field to sw-req"
       fields:
         - name: crate
           type: string
           required: false
   ```

2. Register it **after** the built-in schema in `rivet.yaml` so the field
   unions onto the built-in type:

   ```yaml
   project:
     schemas: [common, aspice, project-ext]
   ```

`rivet validate` then accepts `crate:` on a `sw-req` with no `field not defined`
diagnostic, and you keep every built-in field, link, and rule. You only declare
the delta — the built-in type definition is untouched.

(Alternatively, `rivet validate --min-severity warning` hides the INFO-level
`field not defined` advisories without changing the schema.)
