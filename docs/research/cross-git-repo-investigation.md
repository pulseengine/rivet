# Cross-git Rivet investigation — findings, personas, Safety Manual draft

**Status:** Research note · 2026-05-19 · Binary `rivet 0.10.1 (4354d99a main)` (post #292 federation handshake + #291 variant CLI surface).
**Author:** Investigation coordinated by an AI agent on 2026-05-19. Persona reactions written by six topic-briefed AI personas.
**Scope:** What Rivet does and does not deliver when artifacts cross a git repository boundary, with comparison to git-submodules and Google's `repo` tool, and an Assumptions-of-Use (AoU) register in the SEooC / Cederqvist documentation pattern.

---

## 0. Why this exists

The cross-organisational features (`external-anchor`, `cited-source`, `rivet supplier list/check/pull`, `derives-from-external`, `FederationProvenance`) shipped progressively through v0.10.0 (supplier MVP) and v0.10.1 (federation handshake). They have unit tests, design docs, integration tests, and `rivet docs` topics. They had never, before this investigation, been exercised end-to-end in a real cross-git scenario with three independent repositories under three independent organisational identities. The user's framing on 2026-05-19: *"we really neglected testing our work in a cross git dependency"*.

The investigation answers three questions:

1. **Does it work?** Run the cross-org features on a realistic three-repo test bed and see what breaks.
2. **What does "cross-org Rivet" actually mean?** Where are the competence boundaries — explicitly, in Cederqvist/SEooC register — and where do they need to be drawn?
3. **How does Rivet compare to git-submodules and `repo`?** Both have decades of operational experience and well-documented sharp edges. What is Rivet's actual niche?

---

## 1. The test bed and the 10 scenarios

Three independent git repos in `/tmp/rivet-cross-git/`, simulating three distinct organisations:

- **`acme-supplier/`** — ACME Brake Systems Inc. Tier-1 hardware supplier. Three requirement artifacts (REQ-ABS-001/002/003), one of which carries a deliberately invalid `priority: NotAValidPriority` to test warning propagation.
- **`pulse-integrator/`** — PulseEngine Integration. Automotive software integrator. Holds an `external-anchor` (ANCHOR-ACME-001) and a `derives-from-external` link pointing at ACME's REQ-ABS-001.
- **`tuv-auditor/`** — TÜV Süd auditor. Read-only consumer, intended for cross-checks.

Each repo initialised with a *different* preset to surface schema-heterogeneity in the same investigation: `dev` for ACME, `aspice` for Pulse, `do-178c` for TÜV.

The 10 scenarios:

| # | Name | What it tests |
|---|---|---|
| S1 | Clean cross-import | Happy-path `validate` + `supplier list/check/pull` |
| S2 | Drift detection | Mutate ACME's file without re-stamp; does the consumer notice? |
| S3 | **Warning propagation** | ACME has 3 warnings; do they reach the consumer's validate? |
| S4 | **Schema heterogeneity** | ACME uses `dev`, Pulse uses `aspice`; does the cross-link parse? |
| S5 | Schema version drift | Synthetic — both on v0.10.1; pattern only |
| S6 | **Field mapping** | Probe for `rivet migrate` / supplier-mapping recipes |
| S7 | Multi-repo workspace | Does `rivet validate` operate across both at once? |
| S8 | Naming collisions | Both repos have `REQ-001`; how is namespacing handled? |
| S9 | Bisect across boundary | Can Pulse identify a regressing ACME commit? |
| S10 | CI integration | Is there a documented multi-repo CI flow? |

All logs preserved at `/tmp/rivet-cross-git/logs/sN-<name>.log`. Findings catalogued at `/tmp/rivet-cross-git/findings.md`.

---

## 2. The 11 findings

The full text of each finding lives in `findings.md`. The condensed catalogue:

| # | Title | Severity |
|---|---|---|
| **F1** | `rivet init --preset {do-178c, en-50128, iec-61508, iec-62304}` silently creates a broken project | P1 |
| **F2** | `rivet validate` reports `PASS (0 warnings)` when every artifact file failed to parse | **P0** |
| F3 | No `--strict` umbrella flag; `--fail-on warning` doesn't escalate stderr-only WARNs | P3 |
| F4 | `external-anchor` schema does not declare `cited-source` — every cross-org artifact emits a spurious INFO | P2 |
| **F5** | `derives-from-external` link with structured target is silently parsed as `derives-from` with no target | P1 |
| **F6** | `rivet validate` on the consumer does NOT surface the supplier's diagnostics | P1 |
| F7 | Two parallel cross-repo systems with no documented relationship | P2 |
| F8 | `rivet supplier pull` overwrites on drift with exit 0 and no header | P2 |
| F9 | No bisect support and no documented cross-repo bisect workflow | P3 |
| F10 | No documented multi-repo CI recipe | P2 |
| F11 | `rivet supplier pull` has no end-to-end `rivet docs` topic | P2 |

**The four findings that cluster as one defect family — Rivet's green-PASS-lying problem:** F1, F2, F5, F8. Each is a different layer of the same Cederqvist cliff: the tool reports textual success on a semantically-failed operation. F2 is the canonical instance; the others are variations.

> **Dogfood observation (added 2026-05-19 during this synthesis):** running `rivet next-id` on Rivet's own repo emits **140 stderr-only WARNs** for five non-artifact YAML files in `artifacts/` (`bindings.yaml`, `feature-model.yaml`, `variants/*.yaml`) that legitimately belong there but use top-level keys other than `artifacts:`. The validate then reports "FAIL (6 errors, 140 warnings, …)" — counting validation diagnostics but ignoring the 5 skipped files. Rivet's own validate lies about Rivet's own codebase. F2 has two sub-cases: **F2a** the user wrote wrong-shape artifact YAML, and **F2b** the project legitimately has non-artifact YAML in the source path (feature models, variant configs, binding manifests). The fix must address both — likely by adding an `artifact_file: false` marker or a per-format dispatcher, not just by promoting parse errors to Errors.

---

## 3. Where the six personas converged

We commissioned six AI personas — Pragmatic Multi-Repo Maintainer, Strict TÜV Auditor, Federation Architect, First-Time User, Git-Submodules Migrant, External Supplier Producer — to read the findings and react in their own voice. Reactions saved at `/tmp/rivet-cross-git/personas/`.

The unanimous "carve this into the wall" lines are these:

> **Pragmatic Maintainer:** "If `rivet validate` can ever PASS while files in the project failed to parse, the tool is lying, and no amount of schema sophistication compensates for that."

> **TÜV Auditor:** "A green PASS over a parse that failed is the same defect as a green PASS over a safety case that failed — the only difference is the layer at which the lie originates."

> **Federation Architect:** "Pick one cross-repo mechanism. Document the other as legacy. Ship the field-mapping recipe before you ship a third system."

> **First-Time User:** "If `rivet validate` ever skips a file, that is an error, not a stderr line under a green PASS."

> **Submodules Migrant:** "Submodules tells you 'the SHA pin moved'; Rivet tells you 'the *meaning* of the document at that SHA changed in a way that invalidates a downstream artifact.' Two different layers. Both needed. Neither replaces the other."

> **Supplier Producer:** "Ship `rivet supplier publish` before you ship one more consumer-side feature."

Five different roles, five different lenses, and they converge on the same audit: **F2 is the canonical defect; F5 is the canonical advertised-but-not-delivered claim; F6 is the canonical SEooC AoU that must be written; F7 is the architectural commitment that has to land; and the producer side of the cross-org story is missing entirely.**

Three less-unanimous but still important pieces of feedback:

- **First-Time User** wants `docs/rivet-is-not.md` linked from the README, not three clicks deep. *"That doc up front saves a senior engineer half a day, easily."*
- **Submodules Migrant** wants the README to refuse the word "submodules replacement" and instead claim *the diagnostics layer the submodules ecosystem never grew.* That is a sharper, narrower, more defensible claim.
- **Supplier Producer** drafted a *Producer's AoU* — what consumers must do to use ACME-shipped artifacts safely. Rivet has no template for this yet (`docs/rivet-is-not.md` is consumer-facing). The producer side of the Safety Manual is empty.

---

## 4. The SEooC frame: a Rivet Cross-Org Safety Manual draft

Per the documentation register the project has converged on — Cederqvist 1993 "X is not..." × ISO 26262-10 SEooC Safety Manual — the findings translate into a draft Assumptions-of-Use section. This is what `docs/rivet-is-not.md` §7 needs to grow into. Promoted from the persona reactions, with no softening.

### 4.1 What Rivet provides at the cross-org boundary (safety properties)

- **SP-X1.** `rivet validate --strict-cited-sources` exits non-zero when a `cited-source` sha256 stamp does not match the bytes on disk for `kind: file`. *Status: validated S2.*
- **SP-X2.** `rivet sync` clones / refreshes external rivet repos into `.rivet/repos/<prefix>/` and makes their artifacts addressable as `<prefix>:<id>`. *Status: validated S7.*
- **SP-X3.** `rivet supplier list` enumerates every `external-anchor` artifact with its `received-status` and `expected-derived-types`. *Status: validated S1.*
- **SP-X4.** `rivet supplier check` classifies coverage gaps into `satisfied / external_boundary / uncovered` so the auditor can distinguish "delegated to supplier" from "missing". *Status: validated S1, S3.*

### 4.2 What Rivet does NOT provide (integrator obligations)

Each of these is an AoU. The integrator must own each one; the consumer's `rivet validate` does not.

- **AoU-X1.** *The integrator runs `rivet validate --strict-cited-sources --fail-on warning` (and the parse-error-as-error fix from F2, once it lands) on every linked external repository as part of CI.* Rivet does not propagate the supplier's validation state to the consumer. The absence of `cross_repo_diagnostics` in the consumer's JSON output is silence, not confirmation. (F6.)

- **AoU-X2.** *The integrator treats `rivet supplier pull` as a fetch, never as authorisation.* Pull silently overwrites the local cache when the supplier's bytes change. CI must follow every `pull` with `rivet validate --strict-cited-sources` and gate on exit code. (F8.)

- **AoU-X3.** *The integrator re-derives every cross-org diagnostic count from the supplier's own JSON output, never from the consumer's `cross_repo_*` counters.* Those counters are wired but currently report zero against silence; they will report supplier diagnostics only when F6 is closed and not before. (F6.)

- **AoU-X4.** *The integrator bisects cross-org regressions in the supplier's repository using `git bisect run` or the supplier's own tooling.* Rivet does not bisect across repository boundaries. `rivet impact --baseline <pre-regression-tag>` may identify the artifact set that changed; cross-repo attribution is human work. (F9.)

- **AoU-X5.** *The integrator does not use `rivet init --preset {do-178c, en-50128, iec-61508, iec-62304}` for new compliance work until F1 is closed.* The four safety-critical presets currently emit a `rivet.yaml` referencing a schema the binary cannot resolve. The error surfaces only on the next `rivet validate`. Use `--preset dev` and write the schema by hand, or wait. (F1.)

- **AoU-X6.** *The integrator continues to use `git submodule`, `git subrepo`, or Google's `repo` tool for repository lifecycle.* Rivet does not manage clones, fetches, branch state, or merge conflicts in pinned SHAs. The diagnostics layer (`external-anchor`, `cited-source`) is layered on top of the repository lifecycle, not in place of it. (F7, F9.)

- **AoU-X7.** *The integrator picks exactly one of the two cross-repo mechanisms (`externals:` or `external-anchor`) per cross-link and documents the choice.* Both ship in v0.10.1 with no documented relationship. The Federation Architect persona's recommendation, recorded in §5, is to pick `external-anchor` for cross-org and put `externals:` on a sunset path. Until that consolidation is committed, the integrator must own the choice locally. (F7.)

### 4.3 What Rivet does NOT yet provide (claims pending implementation)

- **F5: `derives-from-external` structured targets do not parse end-to-end.** The link type is recognised by the schema but the YAML extractor silently demotes the structured target to a bare `derives-from` with zero target. The Phase 2 release claim in #292 release notes is not honoured by the binary. *Status: blocks SP-X cross-org claims that depend on structured targets. Fix or retract.*

- **Producer-side commands are absent.** There is no `rivet supplier publish`, no `rivet supplier sign`, no consumer-readable manifest the supplier can attach to a PO. The Producer persona's "Producer's AoU" (§5.2) is what consumers should commit to when receiving an ACME-shipped artifact — but there is no template for the supplier to ship it with. *Status: feature gap; Phase 3 design needed.*

---

## 5. The architectural commitment question

Both the Federation Architect and the Submodules Migrant converged on the same diagnosis: **Rivet ships two parallel cross-repo mechanisms with no documented relationship (F7), and the integrator has to derive the choice from first principles.** The Architect's framing is the most precise:

> "This is exactly the OSLC trajectory I'm here to warn against: ship the second mechanism, claim it supersedes the first, then keep both alive forever because somebody depends on the old one and nobody's brave enough to deprecate."

### 5.1 The two systems, side by side

| Axis | `externals:` (v0.6.x) | `external-anchor` + `cited-source` (v0.10.x) |
|---|---|---|
| Source | git repo (clone/fetch) | file (or ReqIF) — supplier-agnostic |
| Pin | git SHA (via `rivet.lock`) | sha256 of file contents |
| Reference syntax | `prefix:bare-id` (`acme:REQ-001`) | structured target on `derives-from-external` |
| Mental model | "Other rivet repo I federate with" | "Document from another org I anchor against" |
| When the supplier is rivet | Works naturally | Works (treat their YAML as a file) |
| When the supplier is not rivet | Cannot use | Designed for this case |
| `rivet sync` updates it | Yes | No (use `rivet supplier pull`) |
| Drift detection | Git-SHA in lockfile | sha256 + `--strict-cited-sources` |
| Per-OEM scale | 1 rivet OEM per `externals:` entry | Any number of non-rivet OEMs per anchor |

### 5.2 The Architect's recommendation (verbatim from persona 3)

> "Delete `externals:` from the cross-repo doc topic by v0.11, mark it `legacy: true` in the schema by v0.12, remove in v1.0. If the rivet-to-rivet case really matters, re-express it as 'supplier publishes a manifest of anchors' — which is the same primitive, generalised."

This is a real architectural commitment. It says: there is no rivet-native federation; there is only content-pinned federation, which happens to work when the supplier is also rivet. The `prefix:` namespacing becomes a special case of "the supplier publishes an anchor manifest covering all their public artifacts and the consumer subscribes to that manifest."

The alternative — keeping both forever — is the OSLC trajectory. The personas saw it and named it.

### 5.3 The Submodules Migrant's complementary claim

> "Submodules tells you 'the SHA pin moved'; Rivet tells you 'the meaning of the document at that SHA changed in a way that invalidates a downstream artifact.' Two different layers. Both needed. Neither replaces the other."

This is the niche Rivet should claim: *the artifact-graph diagnostics layer over a repository lifecycle that remains submodules' (or `repo`'s) problem.* If Rivet ever uses the phrase "submodules replacement" in its docs, that is the marketing voice eating the engineering voice. The honest narrower claim is sharper.

### 5.4 The Producer's missing half

Persona 6 makes a structural point the consumer-facing investigation cannot make on its own: **all of the cross-org tooling in v0.10.1 is consumer-side.** `supplier list`, `supplier check`, `supplier pull` are commands the *consumer* runs. There is no `supplier publish`, no `supplier sign`, no producer-readable "what your customers will see when they pull this" command. The producer's "Producer's AoU" exists only in the persona's prose, not in any template Rivet ships:

> *ACME-shipped artifacts are delivered as a sha256-pinned file plus a published manifest. Consumers using these artifacts assume the following obligations: (a) validate the received sha256 against ACME's published manifest before ingestion — ACME is not responsible for files altered in transit or in your cache; (b) run `rivet validate` in ACME's published baseline before raising defects against ACME — spurious diagnostics from your local schema configuration are not ACME bugs; (c) treat the `derives-from-external` link as the contractually-meaningful boundary; downstream re-derivations of ACME requirements without the link are your traceability, not ours; (d) any warning ACME shipped in the published manifest is in-scope for your audit — the absence of warnings in your consumer-side `rivet validate` does not constitute an absence of warnings.*

This is the Producer-side Safety Manual fragment. Rivet has no template for it because Rivet has no producer-side commands. Until the producer side ships, *every cross-org Rivet integration is a single-sided contract drafted by the consumer alone.*

---

## 6. Comparison to git-submodules and `repo`

The research surveys (saved under `/tmp/rivet-cross-git/scripts/` indirectly via the Phase 1 research agents' outputs) are available; the synthesis is:

### 6.1 Where Rivet wins

- **Content-hash pin on the *document*, not the *commit*.** `rivet validate --strict-cited-sources` detects bit-level changes in a delivered document. Submodules cannot do this — a force-push to a submodule's tracked branch goes unnoticed until the next clone breaks. (SP-X1, S2.)
- **Supplier-agnostic boundary.** `cited-source: kind: file | reqif` works when the supplier is non-rivet. Submodules and `repo` both require the supplier to be git. The Producer persona's 14 OEMs include three that will never ship git; for them, Rivet's primitive is the only one that fits.
- **Diagnostics-as-output for the boundary state.** Both git-submodules and `repo sync` express drift only as build failures. Rivet expresses drift as Diagnostic objects in JSON, which can be ingested by an LSP, a CI gate, or an AI agent.

### 6.2 Where Rivet loses

- **No unified status view.** `git submodule status` shows the state of every submodule at once. Rivet has nothing equivalent — no `rivet workspace status`. F7 makes this worse: the two cross-repo mechanisms have no joint status.
- **No `forall` primitive.** `repo forall -c <cmd>` runs a shell command in every project's working tree. Rivet has no batch loop across externals.
- **No bisect, blame, log across the boundary.** F9. Submodules and `repo` have the same limitation, but the absence is louder here because Rivet's selling point is artifact-graph reasoning that should cross the boundary.
- **Two cross-repo mechanisms.** Submodules has one, `repo` has one. F7 is unique to Rivet's current state and the Architect persona's recommendation (delete one) is the fix.

### 6.3 What Rivet does not enter (and shouldn't claim to)

Of the seven canonical submodule pains (detached-HEAD, forgotten update after pull, bisect across boundary, blame across boundary, push-order footguns, merge-conflicts on SHAs, sparse-checkout), Rivet addresses **zero** directly. AoU-X6 above codifies this. The Submodules Migrant persona's recommendation — *keep submodules underneath, run Rivet on top, document the layer split* — is the right operational model.

---

## 7. Recommended actions

Categorised by where the work belongs.

### 7.1 GitHub issues to file (P0/P1)

Each is a substantive bug or feature gap with persona buy-in:

1. **F2 (P0)** — `rivet validate` returns PASS over a failed parse. Promote skipped artifact files to Error-severity Diagnostics counted in `errors[]`; exit non-zero. *Headline finding. Unanimous across personas. File first.*
2. **F1 (P1)** — `rivet init --preset {do-178c, en-50128, iec-61508, iec-62304}` silently produces unvalidatable projects. Fix options: embed schemas, write to disk, or refuse with a helpful error.
3. **F5 (P1)** — `derives-from-external` structured target does not parse end-to-end. Trace gap in `rivet-core/src/yaml_hir.rs` link extractor.
4. **F6 (P1)** — Warning propagation: design and ship a `cross_repo_diagnostics` array in `rivet validate --format json`. Probably gated on a `--with-externals-validate` flag.
5. **F7 (P2)** — Architectural commitment: pick one cross-repo mechanism. Architect persona's recommendation = delete `externals:` over v0.11 → v1.0.
6. **F8 (P2)** — `rivet supplier pull` must refuse-and-error on hash mismatch against a prior stamp; `--accept-drift` flag for explicit override.
7. **Producer-side commands** — `rivet supplier publish` + producer-readable manifest format. The structural feature gap the Producer persona's reaction reveals.

### 7.2 Small docs PRs to ship (cheap and high-value)

8. **Link `docs/rivet-is-not.md` from README.** First-Time User persona's specific ask. Saves a senior engineer half a day at hour zero.
9. **Add `rivet docs cross-repo-ci` topic.** Closes F10 + F11. Worked GitHub Actions example covering `rivet sync` + `rivet supplier pull` + `rivet validate --strict-cited-sources --fail-on warning`. Include the AoU-X1 through AoU-X6 register inline. ~80 LOC of markdown.
10. **One-line schema fix for F4.** Add `cited-source` to the `external-anchor` field declaration in `schemas/common.yaml`. Closes the spurious INFO diagnostic that every cross-org artifact currently emits.

### 7.3 Out-of-scope for this investigation

- Multi-language support, dashboard UX, MCP integration — these are first-party concerns the cross-git investigation doesn't touch.
- Bisect support (F9) — kept as a documented AoU rather than a feature to build.
- Schema version drift (S5) — synthetic in the test bed; defer until two distinct Rivet versions are exchanging artifacts in the wild.

---

## 8. Closing — what this investigation actually proved

Three claims worth recording:

1. **The honest §0 disclosures in the tool-qualification dossier set the bar.** The TÜV Auditor persona praised them by name. The cross-org claims in the v0.10.1 release notes do not yet meet that bar — F5 is advertised but does not parse, F2 contradicts the validate's own output, F6 is shipped without the AoU it implies. The discipline that produced §0 needs to be applied to every claim before it ships.

2. **The "Rivet is not..." doc is the right pattern.** All six personas valued it in different ways. It needs §7 to grow the explicit AoU-X1 through AoU-X7 register above, and it needs to be linked from the README so first-time users find it at hour zero. The doc's structure is the Safety Manual structure minus the formal vocabulary; v1.0 Safety Manual production becomes a translation pass, not an authoring pass.

3. **The producer side of cross-org has never been considered.** Every shipped command is consumer-facing. The Producer persona's "Producer's AoU" is the missing half of every contract. Until `rivet supplier publish` ships with a consumer-readable manifest, every cross-org integration is single-sided.

The user's framing at the start was: *"if the other git repo has warnings do they trickle into ours and how to deal with it, what if they have different schemas, how can we ensure that the schema we want is across or usable or we define the mapping in what it means for us."*

Answers:

- **Warnings do not trickle in.** F6. Document as AoU-X1. Add `--with-externals-validate` to make it opt-in.
- **Different schemas mostly work but the link types don't parse yet.** F5. Fix the parser. Add field-mapping recipes per the Architect's sketch.
- **Schema mapping is undefined.** F11 + Phase 3 design doc. The Architect persona's recipe shape is the starting point.

The cliff exists. We have walked along its edge. Where the cliff cannot be moved, it must be drawn on the map. That is what the SEooC register is for.

---

## Appendix A — Persona reactions (full text)

Saved at:

- `/tmp/rivet-cross-git/personas/01-pragmatic-maintainer.md`
- `/tmp/rivet-cross-git/personas/02-tuv-auditor.md`
- `/tmp/rivet-cross-git/personas/03-federation-architect.md`
- `/tmp/rivet-cross-git/personas/04-first-time-user.md`
- `/tmp/rivet-cross-git/personas/05-submodules-migrant.md`
- `/tmp/rivet-cross-git/personas/06-supplier-producer.md`

## Appendix B — Test-bed scripts and logs

- Setup: `/tmp/rivet-cross-git/scripts/00-setup-repos.sh`
- Scenarios: `/tmp/rivet-cross-git/scripts/01-run-scenarios.sh`
- Per-scenario logs: `/tmp/rivet-cross-git/logs/sN-<name>.log`
- Findings catalogue: `/tmp/rivet-cross-git/findings.md`
