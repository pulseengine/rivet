# Supply-Chain Evidence Bridge — Assessment

Audience: maintainers deciding how rivet should connect sigil attestations,
SBOMs, AIBOMs and traceability into one body of evidence. Scope: REQ-344,
issues #107 and #104.

REQ-344's first deliverable is a decision it states explicitly: *"whether this
is one feature or the completion of REQ-327, and that should be made after
reading supply-chain.yaml against the three standards rather than assumed
now."* This document makes that decision from the schema and from what rivet's
own release actually produces.

## 1. TL;DR

**Decision: it is not one feature. It splits cleanly in two.**

1. **The SBOM / attestation / signature bridge is not new work — it is the
   emitter half of REQ-327 and it is the same thing as REQ-374.** The schema
   already exists, rivet's own release already produces every piece of the
   evidence, and nothing turns the one into the other. Fold it into REQ-374,
   the release record.
2. **The AIBOM half (#104) is genuinely new.** No type anywhere models an AI
   bill of materials. It stays its own item.

## 2. What exists: a complete schema that nothing uses

`schemas/supply-chain.yaml` (v0.1.0) declares four types:

| Type | Required fields | Links |
|---|---|---|
| `sbom-component` | `component-name`, `version` | — |
| `build-attestation` | `builder`, `source-repo`, `digest` | `attests → release-artifact` |
| `vulnerability` | `cve-id`, `severity`, `vuln-status` | `affected-component → sbom-component` |
| `release-artifact` | `artifact-name`, `version`, `digest`, `signing-status` | `contains → sbom-component` |

**Nothing emits or consumes any of them.** Measured:

- **Zero** artifacts of any of the four types exist in rivet's own store.
- **rivet does not load its own supply-chain schema** — `supply-chain` appears
  in `rivet.yaml` only inside a comment.
- The only code references are a **colour map**
  (`("vulnerability", "#e83e8c")` in `export.rs` and `render/helpers.rs`) and
  **documentation** (`docs.rs`). No emitter, no importer.

## 3. What rivet's own release already produces

Every release run of `.github/workflows/release.yml` emits, as **release
assets**:

| Evidence | Produced by | Maps to type |
|---|---|---|
| CycloneDX SBOM (`rivet-<v>.cdx.json`) | `cargo cyclonedx` | `sbom-component` (one per component) |
| SLSA v1 provenance, Rekor-logged | `actions/attest-build-provenance` | `build-attestation` |
| SHA256 digest per asset | `sha256sum` → `SHA256SUMS.txt` | `release-artifact.digest` |
| Keyless cosign signature over the digests | `cosign sign-blob` | `release-artifact.signing-status` |
| Toolchain versions (`build-env.txt`) | release job | *(no field)* |
| 11-03 release note | `rivet release notes` (REQ-369) | *(no type)* |

**Every piece of evidence the bridge needs is already produced, signed, and
published — and then discarded as far as the trace is concerned.** The gap is
not a missing schema and not missing evidence. It is a missing step that turns
assets into artifacts.

## 4. Why that makes it REQ-374, not a separate feature

REQ-374 (filed 2026-09-24) asks for a typed **release record**, written by the
act of releasing: the version and tag, the commit, the rivet version, every
external's resolved revision, toolchain versions, asset digests, artifact
statuses at cut time, and the fact of publication — durable, and failing the
release if it cannot be written.

That is the same emitter, running at the same moment, over the same data.
Building REQ-344's bridge separately would mean two jobs parsing the same
SBOM and the same `SHA256SUMS.txt` into two differently-shaped records.

**One emitter, run once per release, producing `release-artifact`,
`build-attestation` and `sbom-component` artifacts plus the release record.**

## 5. Schema gaps found against what the release actually emits

Reading the schema against the real evidence shows it cannot carry it
faithfully yet. These belong to REQ-374's implementation:

1. **`build-attestation` has one `digest` field.** SLSA provenance
   distinguishes the *subject* (output) digest from the *source* digest.
   One field cannot hold both; whichever is stored, the other is lost.
2. **Nothing references the signature itself.** `signing-status` is a status
   value, not a pointer to the cosign bundle or the Rekor entry. A verifier
   cannot get from the artifact to the evidence.
3. **No field for the toolchain** that `build-env.txt` already records.
4. **No field for the advisory posture** a release shipped under — which
   accepted advisories were in force, with their reasons. RUSTSEC-2026-0308 was
   assessed on 2026-09-24 and that assessment exists only in `deny.toml`
   (REQ-376, REQ-377).

## 6. The AIBOM half (#104) — genuinely new

No type in any schema models an AI bill of materials — the models used, their
versions, and which artifacts or code each generated. The nearest thing is
rivet's per-artifact `provenance:` (`created-by`, `model`, `session-id`,
`timestamp`), which records *that* a model was involved, per artifact, but is
not a bill of materials and does not emit CycloneDX ML-BOM.

This is real, separate work and should stay its own item. It is also where the
provenance model assessed for REQ-341 (OKF's separation of *generated-by* from
a sequence of *verified-by* events) would pay off.

## 7. The regulatory framing, stated carefully

#107 motivates the work with the EU AI Act (2026-08-02), the Cyber Resilience
Act (2026-09-11, with machine-readable SBOMs from December 2027) and IEC 62304
Ed.2. **Those dates and obligations are quoted from the issue and were not
re-verified against the regulations for this assessment**, so treat them as
the motivation recorded at filing, not as checked facts. The decision above
does not depend on them: the evidence is already produced and already
discarded, which is worth fixing on its own.

## 8. Evidence register

| Claim | Source |
|---|---|
| Four types, their fields and links | `schemas/supply-chain.yaml` v0.1.0 |
| Zero instances in rivet's store | `rivet list --filter '(= type "…")'` × 4 |
| Schema not loaded by rivet | `rivet.yaml` (comment only) |
| No emitter or consumer | `grep` over `rivet-core/src`, `rivet-cli/src` |
| Assets rivet's release produces | `.github/workflows/release.yml` |

**Not determined:** the regulatory obligations in §7 (quoted from #107, not
re-verified); whether sigil's attestation format adds fields beyond what
`attest-build-provenance` produces.
