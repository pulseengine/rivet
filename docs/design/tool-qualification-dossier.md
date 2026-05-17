# Tool qualification dossier — rivet (ISO 26262-8 §11.4.7)

**Status:** draft (TCL workstream A4) — **`claim-status: self-claimed`, not externally qualified.**
**Audience:** safety leads, certification authorities, OEM tool-qualification reviewers
**Last revised:** 2026-05-16 (after v0.10.0 self-review)
**Companion:** `docs/design/tool-confidence-level.md` (the *why*), `safety/stpa/tool-qualification.yaml` (the hazard analysis), `safety/tool-qualification/rivet-tool-confidence.yaml` (the typed claim)

## 0. Honest scope statement (read this first)

This dossier was drafted by the rivet maintainers, including AI-assisted authoring sessions. The TI2 / TD1 / TCL1 claim is **self-claimed under ISO 26262-8 §11.4.7 — not externally qualified.** The artifact at `safety/tool-qualification/rivet-tool-confidence.yaml` carries `claim-status: self-claimed` and `status: draft` to make this machine-readable.

**The following are NOT yet defensible without further work:**

- **No independent confirmation reviewer** per ISO 26262-2 §6.4.7. The artifact `TQ-CONF-RIVET` was authored under `provenance.created-by: ai-assisted` — the same kind of AI session this dossier proposes to qualify.
- **Cross-walks to DO-330 / IEC 62304 / EN 50128** in §1 are clause-level **unverified**. They come from training-data recall, not from reviewed copies of the standards. Treat the regime table as a *project pointer*, not a qualification mapping.
- The **five-layer "product of miss rates"** argument in §3 assumes independence that is **not proven** — Kani, validate, proptest, and the oracles all consume the same parser and the same `Artifact` model. Common-mode failure dominates and is not yet quantified.
- **Mutation testing currently runs 29 mutants** (26 caught, 3 unviable). The ASIL B/C/D thresholds named in the design note refer to a future 500+-mutant suite that has not been built.
- The **Kani proof set is 27 harnesses** in `rivet-core/src/proofs.rs`. Where any tooling or claim cites larger figures (e.g. "2000+ proofs"), that refers to internal CBMC sub-obligations and is **not** the right number to quote externally — count harnesses, not obligations.
- `proofs/rocq/Schema.v` contains **one `Admitted.` theorem** (`vmodel_chain_two_steps`, line 523). `rivet-core/src/verus_specs.rs:217` contains **`assume(backlink_symmetric(g, s));`** — these are not yet `Qed`'d / proved.
- `ai-session.invoker` is personal data per **DSGVO Art. 4**. The schema declares `lawful-basis`, `retention-period`, `erasure-mechanism` fields and a `dpia` artifact type (since v0.10.0 follow-up), but `rivet validate` does not yet enforce that an `invoker`-bearing session links to a DPIA.
- The **release v0.10.0** binary archives ship a `SHA256SUMS.txt` that is **not cryptographically signed**. The git tag is not GPG-signed. Sigstore / cosign integration is tracked but unshipped.

This dossier collects the qualification argument for **rivet** as a development tool used in safety-critical projects. It is the prose layer of a three-part artefact set:

- The **STPA** identifies tool-qualification hazards.
- The typed **`tool-confidence`** artifact (`TQ-CONF-RIVET`) carries the machine-readable claim.
- This **dossier** explains the reasoning behind that claim and lists the evidence the auditor should expect to see.

## 1. Claim summary

Rivet self-claims **TCL1** under ISO 26262-8 (Tool Impact = TI2, Tool error Detection = TD1). The same claim re-expressed in adjacent regimes:

| Regime | Claim | Notes |
|---|---|---|
| ISO 26262 (automotive) | **TCL1** (TI2 / TD1) | Numbering per Table 3 — TCL1 = lowest demand, TCL3 = highest. |
| DO-330 / DO-178C (aviation) | **TQL-4** with TQL-3 path | Tool Type 2 (automates verification). |
| EN 50128 (rail) | **T2** | Tool used to produce evidence; review compensates. |
| IEC 61508 / IEC 62304 | offline support tool, T3 | The detection-machinery argument carries across regimes. |

The claim is **self-claimed** today. Independent assessment is in scope for v1.0.

## 2. Tool impact (TI) — why TI2

Rivet **can** affect the safety case: it emits PASS/FAIL on traceability invariants that an auditor reads as compliance evidence. A false PASS would not necessarily violate a safety requirement, but it can *prevent the detection* of a violation. Per ISO 26262-8 §11.4.5.3, that places rivet at **TI2**.

The STPA (`safety/stpa/tool-qualification.yaml`) enumerates the seven concrete hazards that the TI2 classification covers: false PASS on traceability, evidence divergence on export, migration corruption, s-expression bugs, variant scoping bugs, hook bypass, quantifier scope errors.

## 3. Tool error Detection (TD) — why TD1

TD1 means **high confidence** that errors in the tool are prevented or caught. Rivet's TD argument rests on five mechanically-enforced layers, every one of which is exercised in CI on every push:

1. **Validate** — link-graph and traceability-rule checks; pre-existing, mature, has bounded-MC proofs (Kani) for the soundness side and proptest property suites for the completeness side.
2. **Oracles** — declarative `agent-pipelines:` blocks gated by mechanical checks (cited-source freshness, schema-conformance, docs-check invariants).
3. **Mutation testing** — `mutants.out/` runs catch silently-passing test gaps in rivet-core and rivet-cli.
4. **Formal proofs** — Kani (bounded model checking, **27 harnesses** in `rivet-core/src/proofs.rs`; bounded input sizes ranging from 8 to 24 bytes for most parser harnesses), Verus (spec stubs in `verus_specs.rs`; the central `backlink_symmetric` obligation is currently `assume`'d, not proved), Rocq (12 `Qed`'d theorems + 15 lemmas across `proofs/rocq/Schema.v` and `Validation.v`; **one `Admitted` theorem** — `vmodel_chain_two_steps`). The five-layer independence argument that follows is **not yet defensible** — see §0.
5. **`ai-found-defect` triage loop** — every defect caught by the above layers (and especially every defect introduced by AI authoring) becomes a typed artefact, links back to its `ai-session`, and gates release on triage state. This is the layer that compensates for the eroded human-review assumption when the upstream author is an AI assistant.

The five layers are independent (catch different defect classes), so the residual-error probability is the *product* of their miss rates, not the sum. That is the operational basis for the TD1 claim.

## 4. Scope of the claim

**In scope (qualified for compliance use):**

- `rivet validate` — link-graph, traceability rules, schema-field checks, s-expression evaluator.
- `rivet commits` — git-trailer audit (CI gate).
- `rivet coverage` — single-org and supplier 3-state coverage (#286).
- `rivet supplier list`, `rivet supplier check` — read-only boundary reporting.
- `rivet stats --qualification` — configuration baseline manifest emission.
- `rivet --qualification-mode` — disables features outside the qualified set.

**Out of scope (NOT qualified by this claim):**

- `rivet sync`, `rivet supplier pull` (Phase 2 federation — qualified separately when shipped).
- `rivet migrate` (importers — pre-Phase 2, semantic distortion possible).
- `rivet serve` (read-only web UI — not part of the toolchain output).
- MCP write tools that bypass validate (`--qualification-mode` disables these).

The scope split lives in the typed artifact `TQ-CONF-RIVET.fields.scope` and is machine-readable by `rivet stats --qualification`.

## 5. Evidence index

The auditor should expect to see all of the following on a release-tagged commit:

| Layer | Evidence file / command | What it shows |
|---|---|---|
| TI / TD claim | `safety/tool-qualification/rivet-tool-confidence.yaml` | The typed claim. |
| STPA | `safety/stpa/tool-qualification.yaml` | Hazard analysis behind the claim. |
| Validate proofs | `rivet-core/src/proofs.rs` (Kani) | Bounded-MC soundness for link-graph and validate. |
| Property tests | `rivet-core/tests/proptest_*.rs` | Completeness side of validate. |
| Mutation tests | `mutants.out/` artefact in CI | Coverage gap finder. |
| Oracle definitions | `agent-pipelines:` in each schema | Cited-source freshness, docs-check, etc. |
| AI-defect log | All `ai-found-defect` artifacts in the project | The TD1 loop. |
| Configuration baseline | `rivet stats --qualification` output | Binary version, schema hashes, oracle list, dependency vet. |

## 6. AI-in-the-loop angle

This dossier exists because rivet's intended deployment is **as part of an AI-authored development workflow**. When a human writes code, the conventional TD argument relies on human review as the detection layer. When an AI writes code, that layer is weakened. The five-layer mechanical detection above replaces the human-review-only argument with mechanical evidence that survives the erosion. The `ai-found-defect` artifact is the operational primitive that makes "AI made an error, the tool reflected it back" auditable rather than aspirational.

This is also why rivet's scope-out list is conservative: any feature that doesn't have a TD layer covering it (`rivet migrate`, MCP write tools) is excluded from the claim until it does.

## 7. Known limitations

- **Self-claimed status.** No independent assessment yet. The next milestone is an external review against a customer pilot.
- **Numbering convention spillover.** The DO-330 cross-walk is documented but every dossier consumer should re-check the regime field on the typed artifact before quoting a number externally.
- **Coverage of `rivet supplier pull` (Phase 2).** Not yet shipped, not yet qualified. The Phase 2 work in #288 will add federation provenance and re-extend the dossier.

## 8. Renewal

This dossier is re-evaluated on every release. Specifically: the `tool-confidence` artifact's `claim-status` must be re-confirmed; any new top-level command added in the release window must either land in the in-scope list or be explicitly added to the out-of-scope list with rationale.

---

Refs: ISO 26262-8:2018 §11.4.5, §11.4.7 Table 3; DO-330:2011 §1.4, §11; `docs/design/tool-confidence-level.md`; `docs/design/iso26262-artifact-mapping.md` §C row 32.
