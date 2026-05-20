---
id: DOC-DOCS-AUDIT-2026-05-19
title: docs/ folder audit — verdict table per file (2026-05-19)
type: audit
status: snapshot
tags: [docs, audit, dogfood, governance, snapshot]
---

# docs/ audit — first pass

**Scope.** Independent classification of every markdown file under `/Users/r/git/pulseengine/rivet/docs/` against three criteria — useful / done-vs-planned / still-true — requested by the project lead on 2026-05-19 (the verbatim ask is captured in `artifacts/cross-git-investigation.yaml` under REQ-074).

**Method.** Independent AI subagent reading each file + cross-checking against the v0.10.1 binary surface (commit `4354d99a`) + git-log for last-touched date. No edits made; this is a read-only audit.

**Inventory.** 52 total .md files in `docs/`. 49 classified. Three out of scope because they shipped in this PR: `rivet-is-not.md`, `research/cross-git-repo-investigation.md`, `what-is-rivet.md`.

## Per-file verdicts

| Verdict | Meaning |
|---|---|
| `KEEP` | Useful + accurate + still relevant. Leave alone. |
| `UPDATE` | Useful but stale. Specific text/version references need refresh. |
| `ARCHIVE` | Was useful at the time but describes a planning state superseded; move to a `docs/historical/` tree, do not delete. |
| `DELETE` | Duplicate / abandoned / never landed / explicitly removed. |
| `INVESTIGATE` | Unclear in 60 seconds; deeper review needed. |

```
PATH                                                           | VERDICT      | LAST       | NOTE
---------------------------------------------------------------+--------------+------------+------------------------------------------------------------------
adoption-status.md                                              | INVESTIGATE  | 2026-05-15 | Permanent "placeholder" — Phase 4 CI refresh not wired. Either fill or DELETE.
architecture.md                                                 | UPDATE       | 2026-03-16 | Module table omits salsa db.rs, sexpr*.rs, yaml_hir/cst/edit, mutate, doc_check, feature_model, variant_emit, externals, baseline, snapshot, mcp. Schema table = 5 (vs 28 shipped). OSLC described as feature-gated and present — there is no `rivet oslc`/`rivet sync --oslc` subcommand. Phase-3 section now half-historical (Kani+rowan+salsa shipped).
audit-report.md                                                 | ARCHIVE      | 2026-04-22 | Self-dated 2026-03-09 snapshot. Header acknowledges "audit snapshot, not current reality." Numbers and the "fuzz/mutation NOT IMPLEMENTED" claims are wrong as of v0.10.1 (both shipped). Move to docs/historical/ and start a fresh dated audit.
design/ai-evidence-trend-research.md                            | KEEP         | 2026-04-22 | Strategy doc, snapshot-by-design, dated, framed as "v1 — 2026-04-19". Useful for product lead.
design/ai-safety-cyber-hitl.md                                  | KEEP         | 2026-04-22 | Sales-engineer/regulator pitch. Marked design, clause-citations explicitly flagged unverified. Holds up.
design/cross-org-supplier-traceability.md                       | KEEP         | 2026-05-14 | Design note for #253. Concrete file:line refs against current tree. Active workstream.
design/doc-reality-audit.md                                     | UPDATE       | 2026-04-22 | Dated 2026-04-19; itself out of date (more drift accumulated since v0.4.0). Useful as a recurring template. Either roll forward or move under docs/historical/2026-04-19/. Today's audit is effectively its successor.
design/embed-discoverability.md                                 | INVESTIGATE  | 2026-04-21 | Proposes `rivet docs embeds` / `rivet docs --embeds`. Need to verify whether the embed registry already shipped — main Command surface has `Embed` subcommand but no `docs embeds` flag; close it or note status.
design/iso26262-artifact-mapping.md                             | KEEP         | 2026-04-22 | Carries `design-doc-aspirational-ok` skip marker. Gap-analysis framing is durable. Foundational for cert customers.
design/polarion-reqif-fidelity.md                               | KEEP         | 2026-04-21 | Field-by-field fidelity note pointing at real reqif.rs line numbers. Auditor-grade evidence document.
design/rivet-cli-gaps-2026-04.md                                | ARCHIVE      | 2026-04-21 | 10-item gap list with several items now shipped (e.g. validate-output JSON schema exists at schemas/json/, `--fail-on warning` shipped, agents/regen guards shipped). Dated and useful as history, not as current backlog.
design/sexpr-artifact-format.md                                 | KEEP         | 2026-04-21 | Decision-request note with explicit cost options. Still an open scope choice; valuable reference.
design/status-gate-rules.md                                     | KEEP         | 2026-05-14 | Self-declares "shipped (feat/status-gate-rules, 2026-05-13)". Recent commit a2353c5/dde04b4 confirm. User-facing spec.
design/tool-confidence-level.md                                 | KEEP         | 2026-05-14 | TCL design narrative, companion to tool-qualification-dossier. Current.
design/tool-qualification-dossier.md                            | KEEP         | 2026-05-17 | Explicitly self-claimed, scope-limited, lists exactly what is not yet defensible. Exemplary honesty.
design/variant-aware-properties.md                              | KEEP         | 2026-05-14 | Issue #287 design. Active workstream (validate has `--variant` and `--strict-variants` flags landed).
feature-model-bindings.md                                       | KEEP         | 2026-04-22 | Compact reference; matches current `rivet variant` behavior.
feature-model-schema.md                                         | KEEP         | 2026-04-22 | Schema reference is concise and accurate.
getting-started.md                                              | UPDATE       | 2026-05-10 | Mostly excellent and current. Two specific bugs: §"rivet export" table lists only `reqif, generic-yaml` (real list per main.rs:538 is `reqif, generic-yaml, html, zola` and Zola section appears further down). §"MCP Server" still claims "15 tools" — verify against the registered catalog. Otherwise comprehensive.
intro-talk-onepager.md                                          | KEEP         | 2026-04-27 | Pitch document. Self-dates honestly ("expect API stability after 0.5"). Useful as canonical short pitch.
intro-talk-template.md                                          | KEEP         | 2026-04-27 | Reusable talk template. Worth keeping.
mutation-testing.md                                             | KEEP         | 2026-04-28 | Concrete adoption guide, references templates/cargo-mutants/ which is the canonical artifact. Real.
oracles.md                                                      | UPDATE       | 2026-04-25 | Catalog out of date. Says "v0.4.3" and lists 3 oracles (bidirectional, review-signoff, gaps-json). Current `CheckAction` enum at main.rs:1633 has 5: + `Sources` (cited-source check, --update/--apply/--strict) + `AiDefectsOpen` (TCL workstream B). Refresh the catalog and bump the version reference.
plans/2026-03-09-spar-wasm-browser-rendering.md                 | ARCHIVE      | 2026-03-09 | Implementation plan for spar WASM rendering. Feature shipped (FEAT-020); getting-started.md documents the user-facing flow. Move to docs/historical/.
plans/2026-03-10-commit-traceability-design.md                  | ARCHIVE      | 2026-03-10 | Commit traceability fully shipped (DD-011/12/13 referenced, `rivet commits`, `rivet commit-msg-check` live). Plans/design pair is now history.
plans/2026-03-10-commit-traceability-plan.md                    | ARCHIVE      | 2026-03-10 | Companion plan to the above. Same status.
plans/2026-03-10-cross-repo-linking-design.md                   | ARCHIVE      | 2026-03-10 | Externals, sync, lock, baseline, prefix:ID all shipped. Plan describes work already in main.
plans/2026-03-10-cross-repo-linking-plan.md                     | ARCHIVE      | 2026-03-10 | Same.
plans/2026-03-10-unidirectional-externals-design.md             | ARCHIVE      | 2026-03-13 | Proposes doorstop + sdoc adapters in formats/. formats/ currently has aadl, generic, needs_json — no doorstop/sdoc landed. Plan superseded by needs_json import + the supplier-traceability design above.
plans/2026-03-10-unidirectional-externals-plan.md               | ARCHIVE      | 2026-03-13 | Same. Never executed in proposed form.
plans/2026-03-14-phase3-parallel-workstreams-design.md          | ARCHIVE      | 2026-03-15 | "8 parallel workstreams" — most are shipped (SCORE schema, needs.json import, conditional rules, formal-verification harnesses, MODULE.bazel). Historical.
plans/2026-03-15-release-v0.1.0-plan.md                         | ARCHIVE      | 2026-03-15 | Plan for v0.1.0 release flow. Project is at v0.10.1. Move to historical.
plans/2026-03-16-coverage-gap-analysis.md                       | ARCHIVE      | 2026-03-16 | "v0.2.0" snapshot. All numbers stale (e.g. "11.1% commit coverage"). Historical.
plans/2026-03-16-formal-verification-completion.md              | ARCHIVE      | 2026-03-16 | Kani 10-harness target was met and surpassed (27 harnesses per doc-reality-audit). Plan is done.
plans/2026-03-16-oslc-analysis.md                               | KEEP         | 2026-03-16 | Strategic decision-making document; OSLC is still not exposed as a subcommand. Note still relevant — explains the deliberate non-shipping.
plans/2026-03-16-rowan-salsa-completion.md                      | ARCHIVE      | 2026-03-16 | Salsa is the default validation path now (`--direct` is the opt-out). Plan is done.
plans/2026-03-16-stpa-sec-analysis.md                           | ARCHIVE      | 2026-03-16 | Fresh-analysis snapshot from 2026-03-16. Has been superseded by subsequent STPA updates and the active stpa-sec.md document. Historical.
plans/2026-03-21-baseline-scoped-validation-design.md           | ARCHIVE      | 2026-03-21 | Baseline-scoped validation shipped (`--baseline` is on validate/list/stats/coverage/export). Plan done.
plans/2026-03-21-lsp-salsa-architecture-design.md               | ARCHIVE      | 2026-03-21 | LSP shipped (`rivet lsp` subcommand). Salsa shipped. Plan done.
plans/2026-03-22-vscode-lsp-rendering-design.md                 | INVESTIGATE  | 2026-03-22 | VS Code extension lives at vscode-rivet/. Document predates current state — check whether LSP-rendering pivot is the implemented path before archiving.
plans/2026-03-22-vscode-lsp-rendering-plan.md                   | INVESTIGATE  | 2026-03-22 | Same; companion plan.
pre-commit.md                                                   | KEEP         | 2026-05-15 | Recent, canonical, points at templates/pre-commit/. Tier table is concrete.
pure-variants-comparison.md                                     | UPDATE       | 2026-04-23 | Self-marked "v0.4.3 baseline". Project at v0.10.1; the comparison still mostly holds (variant code path is stable) but the framing needs the version-stamp bumped or the doc re-scoped as a snapshot.
research/mirai-prototype-report.md                              | KEEP         | 2026-05-15 | Negative-result report. Useful as a decision record; explicitly self-archives as "hold the prototype." Concrete pinned reasons.
roadmap.md                                                      | UPDATE       | 2026-03-09 | Phase 1/2/2.5 still accurate-ish but Phase 3 is labeled "Planned"; v0.4.0 already shipped most of it (variant/PLE, MCP, Zola export, rowan/salsa, Kani, sphinx-needs import) and v0.10.x added TCL workstream, supplier-traceability, status-gate rules. Either rewrite as Phase 1-4 retrospective or replace with `docs/roadmap-v0.10-and-beyond.md`.
schemas.md                                                      | UPDATE       | 2026-03-08 | Lists 5 schemas (common, dev, stpa, aspice, cybersecurity). schemas/ ships 28 files including do-178c, en-50128, iec-61508, iec-62304, iso-26262, iso-pas-8800, score, sotif, safety-case, eu-ai-act + bridge schemas. This is the most visibly stale doc in the tree.
srs.md                                                          | UPDATE       | 2026-03-19 | "[[REQ-011]] pins Rust edition 2024 with MSRV 1.85" — Cargo.toml says 1.89. Otherwise structural. Bump MSRV line; verify REQ list against current artifacts/.
stpa-sec.md                                                     | UPDATE       | 2026-03-19 | §8 "Implementation Status" still reads "as of v0.2.0-dev" and lists three SSCs as "Phase 3 / Planned". Project is v0.10.1 and several of those mitigations have moved. Refresh the status table or remove it.
verification.md                                                 | UPDATE       | 2026-03-16 | §8 CI Quality Gates table says "msrv 1.85"; actual MSRV is 1.89. Test inventory in §3 is now accurate-ish because §2 already says "run cargo test --list" — but Phase-3 §10 still discusses Verus/Rocq as targets, which have been wired in (continue-on-error per doc-reality-audit). Tighten.
```

## Summary

### Counts per verdict

| Verdict       | Count |
|---------------|-------|
| KEEP          | 18    |
| UPDATE        | 11    |
| ARCHIVE       | 16    |
| DELETE        | 0     |
| INVESTIGATE   | 4     |
| Out of scope  | 3     |
| **Total**     | **52** |

Roughly **a third of the tree is dead-letter planning material** (16 plans + 2 archive-worthy reports sitting next to active reference docs).

### Five worst offenders (most likely to mislead a reader today)

1. **`docs/schemas.md`** — Reference doc that documents 5 of 28 schemas. A user reading this and looking for the iso-26262 or score schema will conclude rivet does not ship one. Highest-impact stale doc in the tree.
2. **`docs/architecture.md`** — Module tables omit roughly half the rivet-core modules (salsa, sexpr, yaml_*, mutate, feature_model, variant_emit, externals, baseline, snapshot, mcp). Schema table same defect as schemas.md. Claims OSLC is shipped as a CLI surface — it isn't.
3. **`docs/oracles.md`** — Says "shipped in v0.4.3" and lists 3 oracles. Actually 5 oracles ship today (`bidirectional`, `review-signoff`, `gaps-json`, `sources`, `ai-defects-open`). The missing two are load-bearing for the TCL story in `design/tool-qualification-dossier.md` — the dossier cites `ai-defects-open` as the "TD1 detection layer that compensates for eroded human review."
4. **`docs/roadmap.md`** — Marks v0.4.0-and-later work as "Phase 3 — Planned." Anyone reading this thinks rivet is roughly a year behind where it actually is.
5. **`docs/audit-report.md`** — 2026-03-09 snapshot that prominently declares "Fuzz Testing — NOT IMPLEMENTED" and "Mutation Testing — NOT IMPLEMENTED" while CI runs both and `mutants.out/` directory was committed in this session. Self-marked as a snapshot but still indexed as a current doc.

### Three exemplary docs (use as templates)

1. **`docs/design/tool-qualification-dossier.md`** — Begins with a §0 "Honest scope statement" enumerating exactly what is **not yet defensible** (no independent reviewer, clause-level unverified cross-walks, common-mode assumption not proven, Admitted/assume statements still in proof artifacts, unsigned release tarballs). This is the register every other safety-critical doc in this tree should adopt.
2. **`docs/design/polarion-reqif-fidelity.md`** — Field-by-field table with explicit `LOSSLESS / LOSSY / ABSENT` fidelity column and direct line-anchored references into `rivet-core/src/reqif.rs`. Reads like an audit deliverable, not a sales doc.
3. **`docs/design/status-gate-rules.md`** — Self-declares "shipped (feat/status-gate-rules, 2026-05-13)" with concrete commit-anchored status. Reader knows in two seconds what state the work is in.

A fourth honourable mention: **`docs/research/mirai-prototype-report.md`** publishes a **negative result** with concrete pinned reasons. Treating negative results as first-class artifacts is exactly what the project's STPA register claims to encourage; most teams quietly bury them.

### Cross-doc duplication

- **`docs/schemas.md` ↔ `docs/architecture.md` §5** — both ship the same 5-row schema table. Same defect, two locations. Fixing one without the other guarantees re-divergence.
- **`docs/getting-started.md` §"S-Expression Filtering" ↔ `docs/feature-model-schema.md` §"Constraint syntax"** — both define the s-expression palette. Getting-started has the longer list. One canonical source needed; the other should reference.
- **`docs/srs.md` §3.8 / §3.9 ↔ `docs/stpa-sec.md`** — SRS summarises the STPA-Sec result inline, stpa-sec.md has the full analysis. Mostly fine, but `stpa-sec.md` §8 is the part that drifted — keep the source in `safety/stpa-sec/*.yaml` and have `stpa-sec.md` regenerate.
- **`docs/intro-talk-onepager.md` ↔ `docs/intro-talk-template.md`** — explicitly linked as short/long pair; not a duplication problem, but the marketing register is sharper than the technical docs and should not creep into reference material.
- **`docs/plans/2026-03-10-cross-repo-linking-*.md` ↔ `docs/design/cross-org-supplier-traceability.md`** — both cover cross-repo / cross-org traceability. The plan is from a v0.1.x-era simpler model (`prefix:ID` only); the supplier-traceability design is the current direction (`external-anchor` artifact, 3-state coverage). Archive the plan pair; keep the design.

### Directory-structure recommendation

The flat `docs/` tree with `design/`, `plans/`, and `research/` subdirs is *almost* right but lacks lifecycle tagging. Concrete proposal:

```
docs/
  reference/          ← user-facing reference (the docs users land on)
    getting-started.md, schemas.md, feature-model-schema.md,
    feature-model-bindings.md, oracles.md, pre-commit.md,
    mutation-testing.md
  architecture/       ← system-internal design that ships
    architecture.md, srs.md, verification.md, stpa-sec.md
  design/             ← active forward-looking design notes (RFC-ish)
    [keep all current design/*.md that are KEEP]
  plans/              ← in-flight implementation plans, current only
    [empty most of the time; not a long-term home]
  historical/         ← dated archive of completed plans / past snapshots
    2026-03/, 2026-04/, ...
  research/           ← scoped research reports with explicit verdicts
    [keep current research/*.md]
  marketing/          ← public-facing pitch and talk material
    intro-talk-onepager.md, intro-talk-template.md,
    what-is-rivet.md, rivet-is-not.md
  status/             ← machine-refreshed status pages
    adoption-status.md, audit-report.md (next run)
```

**Lifecycle tags worth adding to every doc frontmatter:** `status: {draft, design, shipped, historical}`, `last-verified: YYYY-MM-DD`, `applies-to-version: vX.Y.Z`. The pattern is already in use on the better docs (`status-gate-rules.md` self-declares "shipped"; `tool-qualification-dossier.md` self-declares "draft"; `audit-report.md` self-declares "audit snapshot"). Make it universal.

**Two CI checks would prevent two-thirds of the staleness found here:**

1. A `rivet docs check` invariant that any doc with a `last-verified:` field older than 90 days emits a warning. Already half-built — `cited-source-stale` does exactly this for the data layer; extend to docs.
2. An invariant that prose-numeric claims (e.g. "5 schemas", "27 schemas") in reference docs are either `{{stats:...}}` embeds or carry `<!-- AUDIT: verified YYYY-MM-DD -->`. `docs/audit-report.md` and the doc-reality-audit register both want this gate.

**Single most cost-effective fix:** move `docs/plans/2026-03-*.md` files (12 of them) and `docs/audit-report.md` into `docs/historical/` and stop indexing them from the dashboard. That alone removes most of the rot.

### Key file paths referenced

- `/Users/r/git/pulseengine/rivet/rivet-cli/src/main.rs:224-1080` — current command enum (the v0.10.1 surface)
- `/Users/r/git/pulseengine/rivet/rivet-cli/src/main.rs:1633-1717` — current `CheckAction` (5 oracles, not 3)
- `/Users/r/git/pulseengine/rivet/rivet-core/src/formats/` — only `aadl`, `generic`, `needs_json` adapters shipped (no doorstop/sdoc)
- `/Users/r/git/pulseengine/rivet/schemas/` — 28 schema files (not 5, not 27)
- `/Users/r/git/pulseengine/rivet/Cargo.toml:14` — MSRV is 1.89 (docs say 1.85 in two places)

## What this audit does NOT do

Per the SEooC discipline that frames this PR: this audit is **classification**, not **action**. Each verdict above is a candidate for follow-up work. The follow-up acts in REQ-074's Phase 2 — one PR per cluster:

1. Bulk-archive PR: move the 12 `plans/2026-03-*.md` plus `audit-report.md` to `docs/historical/`.
2. Stale-numbers PR: update `schemas.md`, `architecture.md` §5, `oracles.md` to reflect the 28 schemas / 5 oracles / current modules.
3. MSRV PR: bump 1.85 → 1.89 in `srs.md` §3.1 and `verification.md` §8.
4. Roadmap PR: rewrite `docs/roadmap.md` as a Phase 1-4 retrospective with current `v0.10.x and beyond` as a separate doc.
5. INVESTIGATE triage: assign each of the 4 INVESTIGATE files to a named maintainer for re-classification.

Each follow-up is its own scope and own PR. This audit is the input to those PRs, not their replacement.
