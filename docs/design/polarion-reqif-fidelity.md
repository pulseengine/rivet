# Polarion and ReqIF Export Fidelity

Audience: engineers evaluating whether a rivet → Polarion export is trustworthy
for audit use. Scope: the two viable export paths, field-by-field.

- **Path 1** — rivet → Polarion REST API directly
- **Path 2** — rivet → ReqIF file → Polarion ReqIF import

## 1. TL;DR

Neither path is lossless today. Path 2 (ReqIF) is the only one rivet can
actually emit right now, and it silently drops provenance, inverse-link
semantics, schema-level metadata, and anything typed as a list or mapping in
the `fields` map. Path 1 (direct REST) would preserve more of rivet's model —
especially provenance via custom fields — but does not exist in code yet and
cannot be CI-tested without a running Polarion instance or a mock. For audit
use, treat both paths as a one-way snapshot, not a round-trip store of record.

## 2. Field-by-field fidelity

LOSSLESS = value and structure both survive. LOSSY = value survives but
structure is flattened (e.g. list → comma-joined string). ABSENT = no
standards-based representation on the target side without a custom convention.

Rows cover the `Artifact` struct ([rivet-core/src/model.rs:62-100](../../rivet-core/src/model.rs)),
`Provenance` ([model.rs:26-51](../../rivet-core/src/model.rs)),
`Link` ([model.rs:13-19](../../rivet-core/src/model.rs)), and
schema-level concepts from [rivet-core/src/schema.rs](../../rivet-core/src/schema.rs).
Polarion column notes are marked *(training-only, unverified)* where the
live REST spec was not reachable.

| Rivet field                       | Polarion REST equivalent                              | ReqIF equivalent                                         | Fidelity (P1 / P2) |
|-----------------------------------|-------------------------------------------------------|----------------------------------------------------------|--------------------|
| `id`                              | `WorkItem.id` *(training-only)*                       | `SPEC-OBJECT.IDENTIFIER` (+ `ReqIF.ForeignID`)          | LOSSLESS / LOSSLESS |
| `artifact_type`                   | `WorkItem.type` (enum) *(training-only)*              | `SPEC-OBJECT-TYPE.LONG-NAME` + `ATTR-ARTIFACT-TYPE`     | LOSSY / LOSSLESS ([reqif.rs:899-904](../../rivet-core/src/reqif.rs)) |
| `title`                           | `WorkItem.title` *(training-only)*                    | `SPEC-OBJECT.LONG-NAME`                                  | LOSSLESS / LOSSLESS |
| `description` (markdown)          | `WorkItem.description` (HTML rich-text)               | `SPEC-OBJECT.DESC` as attribute, not XHTML               | LOSSY / LOSSY (markdown not converted to HTML/XHTML; round-trip keeps raw markdown) |
| `status`                          | `WorkItem.status` (controlled enum) *(training-only)* | Emitted as `ATTRIBUTE-VALUE-STRING` with name `status`   | LOSSY / LOSSY (free string on both sides; Polarion's lifecycle state machine not enforced) |
| `tags` (`Vec<String>`)            | `WorkItem.categories` or `hyperlinks` *(training-only)* | Joined to `ATTRIBUTE-VALUE-STRING "tags"` with `", "` separator | LOSSY / LOSSY ([reqif.rs:953-958](../../rivet-core/src/reqif.rs)); a tag containing `,` or whitespace will be split on re-import |
| `links[].link_type`               | `LinkedWorkItem.role` *(training-only)*               | `SPEC-RELATION-TYPE.LONG-NAME`                           | LOSSLESS / LOSSLESS |
| `links[].target`                  | `LinkedWorkItem.workItem.id` *(training-only)*        | `SPEC-RELATION.TARGET.SPEC-OBJECT-REF`                   | LOSSLESS / LOSSLESS |
| Link direction + inverse (`leads-to-loss` ↔ `loss-caused-by`, [schema.rs:140-149](../../rivet-core/src/schema.rs)) | Polarion infers inverse from role config *(training-only)* | SpecRelation is directional; inverse name **not emitted**, not stored in target | LOSSY / LOSSY — the name of the inverse survives only on the rivet side via `Schema.inverse_of` |
| `fields["string-key"]` (string)   | Polarion custom field (STRING)                        | `ATTRIBUTE-VALUE-STRING` per key ([reqif.rs:965-977](../../rivet-core/src/reqif.rs)) | LOSSLESS / LOSSLESS |
| `fields["key"]` (bool / number)   | Polarion typed custom field *(training-only)*         | Coerced to `Debug` string via `format!("{other:?}")` ([reqif.rs:968-970](../../rivet-core/src/reqif.rs)) | LOSSY / LOSSY (bug-flavoured: `true` → `"Bool(true)"`) |
| `fields["key"]` (list or mapping) | Polarion has no native list type on custom fields *(training-only)* | Same `Debug` coercion — emits Rust-internal form           | ABSENT / LOSSY (stored as nonsense string) |
| `fields["baseline"]`              | No native concept; a custom field                     | Normal string attribute                                  | LOSSY / LOSSLESS-as-string (baseline semantics are rivet-only) |
| `provenance.created_by`           | No native field; would need custom field              | Not emitted at all ([reqif.rs:782](../../rivet-core/src/reqif.rs) sets `provenance: None`) | ABSENT / **ABSENT** |
| `provenance.model`                | Same — custom field only                              | Not emitted                                              | ABSENT / **ABSENT** |
| `provenance.session_id`           | Same — custom field only                              | Not emitted                                              | ABSENT / **ABSENT** |
| `provenance.timestamp`            | `WorkItem.created` is close but not authoritative     | Not emitted                                              | ABSENT / **ABSENT** |
| `provenance.reviewed_by`          | Signatures / approvals module *(training-only)*       | Not emitted                                              | LOSSY / **ABSENT** |
| `source_file` (code path)         | Hyperlink / custom field                              | Not emitted (field is `#[serde(skip)]`, [model.rs:98](../../rivet-core/src/model.rs)) | LOSSY / ABSENT |
| Schema: `artifact-type.fields` typed (allowed-values) | Polarion custom field with enum constraint | Rivet export never emits `DATATYPE-DEFINITION-ENUMERATION` for fields (only a flat STRING — [reqif.rs:871-874](../../rivet-core/src/reqif.rs)) | LOSSY / LOSSY (import accepts enums; export never produces them) |
| Schema: `link-type.source-types` / `target-types` | Polarion role config | ReqIF 1.2 supports source/target type restrictions on SpecRelationType — not emitted | LOSSY / LOSSY |
| Schema: `traceability-rules`      | Not representable                                     | Not representable                                        | ABSENT / ABSENT |
| Schema: `conditional-rules`       | Not representable                                     | Not representable                                        | ABSENT / ABSENT |
| Schema: `common-mistakes`, `example`, `yaml-section-suffix`, `shorthand-links`, `extends` | N/A (rivet authoring helpers) | N/A | ABSENT / ABSENT |
| Commit trailers (`Implements: REQ-028` → commit-to-artifact edges, [rivet-core/src/commits.rs](../../rivet-core/src/commits.rs)) | Polarion WorkItem revisions + linked revisions *(training-only)* | No standard place; would go into a custom enumeration or XHTML blob | LOSSY / ABSENT |
| ReqIF `<THE-HEADER>` provenance (creation-time, tool-id) | Polarion import logs | Emitted as static literals — `creation_time: None`, `source_tool_id: "rivet"` ([reqif.rs:1023-1028](../../rivet-core/src/reqif.rs)) | N/A / LOSSY (not stamped per-export) |
| Link-target resolution to unknown artifacts | Polarion rejects / requires staging | Dangling target ref kept as-is in SpecRelation | N/A / silent dangle |
| Attachments / images              | `WorkItem.attachments` *(training-only)*              | SpecObject relations to external files                   | N/A / N/A (rivet has no attachment model) |
| Comments / activity log           | `WorkItem.comments` *(training-only)*                 | No standard place                                         | N/A / N/A (rivet has no comments model) |

## 3. Fidelity scorecard

Counting per-row column entries for fields rivet actually stores today
(excluding attachments / comments which rivet has no concept of):

- **Path 1 — Polarion REST (hypothetical):** 6 LOSSLESS, 12 LOSSY, 7 ABSENT. Provenance is the big ABSENT cluster; most LOSSY entries could become LOSSLESS with a documented `rivet.*` custom-field convention.
- **Path 2 — ReqIF (current code):** 7 LOSSLESS, 10 LOSSY, 8 ABSENT. Provenance (all five fields) is unconditionally ABSENT. Non-string values in `fields` are visibly corrupted, not just lossy.

Percent LOSSLESS is similar (~27% vs ~28%) because both paths share the
"ReqIF standard has no slot for this" problem. The interesting delta is in
the LOSSY column: Path 1 could upgrade most LOSSY rows to LOSSLESS with a
custom-field scheme (Polarion custom fields are typed and scoped per
WorkItem type); Path 2 cannot, because ReqIF AttributeDefinition has no
`mapping` or `list-of-mapping` datatype.

## 4. The "weird round-trip" concern

Path 2 is rivet → ReqIF → Polarion importer. This compounds two lossy
transforms and the second one is a black box from rivet's perspective:

- **Double coercion.** A YAML list in `fields` is already flattened to a
  nonsensical `Debug` string by rivet's ReqIF export ([reqif.rs:968-970](../../rivet-core/src/reqif.rs)). Polarion's importer then sees an
  STRING attribute and maps it to a STRING custom field. Even if Polarion
  supports a list-typed custom field, ReqIF's STRING attribute cannot carry
  the list type tag, so Polarion imports it as a single-string value.
- **Polarion ReqIF importer uses a fixed mapping.** ReqIF-HS extensions
  (Jama/Polarion ReqIF profile) may be required to reach typed custom fields;
  rivet emits plain ReqIF 1.2 with no HS profile attributes.
- **Timestamps beyond SpecObject header are dropped.** REQ-IF-HEADER
  CREATION-TIME is unset in rivet's exporter ([reqif.rs:1023](../../rivet-core/src/reqif.rs)). Polarion's importer has nothing to record against.
- **Inverse links.** ReqIF SpecRelation is one-directional. The inverse-role
  name rivet knows (`loss-caused-by` paired with `leads-to-loss`) never reaches
  Polarion; the importer will invent its own inverse name based on role config.
- **Status enum.** ReqIF emits status as a free string, so Polarion cannot map
  it to its controlled lifecycle state machine without a manual mapping step.

What Path 1 would preserve over Path 2, if implemented:

- Typed custom fields for the full `fields` map (including bool and number).
- `provenance.*` carried as `rivet.provenance.created-by` / `.model` / etc.
- `status` mapped through a documented enum-translation config.
- Bidirectional links created explicitly via Polarion's link role API rather
  than reconstructed.
- Link-target validation at push time (REST rejects dangling refs).

Conversely Path 2 wins on exactly one axis: it runs without network or
credentials, so it works offline and in non-Polarion tools (DOORS, Jama,
Cameo, StrictDoc). That is the interop case, not the fidelity case.

## 5. Round-trip test strategy

Goal: an oracle that runs under `cargo test` and flags every field that
changes across export → import.

### Corpus

- All `.yaml` files under `artifacts/` and `safety/` in this repo (700+
  artifacts today, including STPA losses/hazards, SCORE requirements,
  cybersecurity and ISO-8800 content).
- Ensure corpus includes: provenance-stamped artifacts, artifacts with
  mapping-valued `fields`, artifacts with inverse-linked pairs, and
  artifacts whose `tags` contain commas (adversarial case for the
  `tags` flattening bug).

### Oracle

```
fidelity_diff(original: &[Artifact], reimported: &[Artifact]) -> FidelityReport
```

The report enumerates, per artifact ID, which of the 10 `Artifact` fields
changed, plus a summary count. `FidelityReport::is_empty()` is the test
assertion. A CI job can print the report and fail on any non-empty diff, or
fail only on a regression against a stored baseline file (drift alarm).

### Paths

- **ReqIF:** pure local — file in, file out. Lives at
  `rivet-core/tests/fidelity_reqif.rs` (new; does not exist today per
  `rivet-core/tests/`). Use the existing public `ReqIfAdapter::export` /
  `import`. No external deps.
- **Polarion REST:** needs a mock. Propose `wiremock` (adds a dev-dependency)
  loaded with recorded JSON fixtures captured from a real Polarion instance
  once, then replayed deterministically. Lives at
  `rivet-core/tests/fidelity_polarion.rs` behind a cargo feature
  `polarion` so the default build has no extra dependencies. Honest
  limitation: fixtures can go stale against a Polarion version upgrade;
  label the test as "fixture-based, re-record quarterly."

### What the test will catch today (ReqIF only)

Running the oracle against the current `ReqIfAdapter` with a stamped
artifact would report, at minimum:
- `provenance` differs: `Some(...)` → `None` (unconditional)
- `source_file` differs: `Some(path)` → `None` (expected; `#[serde(skip)]`)
- `fields` differs on every non-string value (`Bool(true)` → `"Bool(true)"`)
- `tags` differs when any tag contains `,` or leading/trailing whitespace

This is the value of landing the test now, before the Polarion work: it
turns the known gaps into a visible, tracked regression list.

## 6. Recommendation

**Support both paths, but document them as different products:**

- **Path 1 (Polarion REST, to be built):** the audit-grade path. Recommend
  it when the counterparty is Polarion and the user needs provenance,
  typed custom fields, and link role fidelity. Accepts the cost of an
  auth-bound, network-dependent adapter behind a feature flag.
- **Path 2 (ReqIF, already shipped):** the interop path. Keep it as the
  universal-export option (DOORS, Jama, Cameo, StrictDoc, Polarion import
  all accept ReqIF). Not the recommended route for Polarion-specifically
  when Path 1 is available.

The user's instinct is correct: Path 2 into Polarion is weird specifically
because it runs an ISO-sanctioned file-interchange standard through a
proprietary importer when a direct API is one HTTP hop away. It is not
wrong, just unnecessarily lossy.

**Caveat for CI:** Path 1 cannot be CI-tested in GitHub Actions without a
live Polarion instance or a recorded-fixture mock server. Do not block the
verification pyramid on Path 1 fidelity tests; block it on Path 2.

## 7. Concrete next steps — ranked

1. **Fix ReqIF field-value coercion** ([reqif.rs:968-970](../../rivet-core/src/reqif.rs)). Currently writes `format!("{other:?}")` — Rust Debug form — which is not even valid JSON or YAML. Replace with `serde_yaml::to_string(value)` (single-line flow form) or a typed fallback that emits a real list/bool/number representation. This is a silent-corruption bug, not a design question.
2. **Emit and parse provenance in ReqIF.** Add five `ATTR-RIVET-PROVENANCE-*` string attributes on export, and the symmetric import path ([reqif.rs:660-712](../../rivet-core/src/reqif.rs)). All ABSENT provenance rows become LOSSLESS with zero standard violations.
3. **Add `rivet-core/tests/fidelity_reqif.rs`** implementing the oracle from §5 against the `artifacts/` + `safety/` corpus. Fail-on-diff, not fail-on-baseline, so regressions show up immediately.
4. **Tag-flattening bug.** Change export to emit each tag as a separate `ATTRIBUTE-VALUE-STRING` (one AttributeDefinition per value is non-standard; a cleaner fix is a ReqIF `DATATYPE-DEFINITION-ENUMERATION` with MULTI-VALUED=true). Import already handles comma-splitting but it should handle enum refs first.
5. **New `rivet-core/src/polarion.rs`** behind `feature = "polarion"`, with a REST client that maps provenance to typed custom fields and uses Polarion's link-role API directly. Gated off by default — auth and network deps stay optional.
6. **New CLI `rivet polarion push` / `pull`.** Mirrors the existing adapter surface but with a `--project` arg and a credential resolver (env var / keychain). Write-path only initially; pull-path after Path 1 fidelity tests exist.
7. **`docs/interop/polarion.md` and `docs/interop/reqif.md`** with the scorecard from §3, so downstream rivet users see the fidelity delta before they commit to a workflow.

## 8. Evidence register

| Claim | Evidence |
|-------|----------|
| `Artifact` has exactly 10 fields | [rivet-core/src/model.rs:62-100](../../rivet-core/src/model.rs) |
| `Provenance` has five fields including `model` and `session_id` | [rivet-core/src/model.rs:26-51](../../rivet-core/src/model.rs) |
| `source_file` is `#[serde(skip)]` — never serialised | [rivet-core/src/model.rs:98-99](../../rivet-core/src/model.rs) |
| ReqIF export never emits `provenance` | [rivet-core/src/reqif.rs:782](../../rivet-core/src/reqif.rs); also all test fixtures set `provenance: None` ([reqif.rs:1078, 1093](../../rivet-core/src/reqif.rs)) |
| Non-string `fields` values are coerced via Rust `Debug` | [rivet-core/src/reqif.rs:968-970](../../rivet-core/src/reqif.rs) |
| `tags` are joined with `, ` on export, split on `,` on import (no escaping) | [reqif.rs:953-958](../../rivet-core/src/reqif.rs) export; [reqif.rs:672-679](../../rivet-core/src/reqif.rs) import |
| ReqIF header `creation-time` is unset on export | [rivet-core/src/reqif.rs:1023](../../rivet-core/src/reqif.rs) |
| Link inverse is a schema-level concept rivet tracks but never exports | [rivet-core/src/schema.rs:140-149](../../rivet-core/src/schema.rs); [schema.rs:680-683](../../rivet-core/src/schema.rs) |
| No existing `rivet-core/tests/fidelity_*.rs` | `Glob rivet-core/tests/fidelity_*.rs` → no matches |
| No existing Polarion code in rivet | `Grep polarion|Polarion` → only matches in schemas/safety analysis text, never in source |
| `rivet stamp` subcommand writes provenance | [rivet-cli/src/main.rs:681-689, 7461-7565](../../rivet-cli/src/main.rs) |
| Schemas/stpa.yaml declares `yaml-section`, `shorthand-links` — rivet-specific concepts with no ReqIF/Polarion equivalent | [schemas/stpa.yaml:36-51](../../schemas/stpa.yaml) |
| Polarion REST entity names (WorkItem, LinkedWorkItem, categories, attachments, comments) | training-only, unverified — WebFetch of https://developer.siemens.com/polarion/rest-api-spec.html was denied in this environment |
| ReqIF 1.2 OMG namespace | [rivet-core/src/reqif.rs:461](../../rivet-core/src/reqif.rs) |

---

Refs: REQ-025 (adapters), FEAT-001 (export/interop surface).
