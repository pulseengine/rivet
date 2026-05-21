---
id: DOC-DOCS-README
title: docs/ folder map and lifecycle
type: reference
status: current
tags: [docs, structure, lifecycle, governance]
---

# `docs/` — folder map and lifecycle

This directory holds Rivet's prose documentation. The top level (`docs/*.md`)
carries the stable, user-facing reference and guide material; four
subdirectories carry material with a more specific lifecycle. Every `.md` file
directly under `docs/` carries YAML frontmatter (`id`, `title`, `type`,
`status`, `tags`) so it is a first-class document artifact — `rivet validate`
skips files without frontmatter and reports them. Per the doc scanner's
`read_dir` contract, only the top level of each `docs:` path is scanned for
frontmatter; subdirectory files are not gated, but carrying frontmatter is
still recommended.

The `status` field is the lifecycle marker. The intended values:

- `current` — describes shipped behaviour and is believed accurate against the
  current release. The default state for reference and guide material.
- `snapshot` — a point-in-time record (an audit, a comparison, a status page).
  Accurate as of its date; not maintained to track `main`.
- `draft` — work in progress; not yet a settled description of anything.
- `historical` — superseded planning or analysis kept for the record. Lives
  under `docs/historical/`.

## Top level — `docs/*.md`

Stable, user-facing reference and guide material: `getting-started.md`,
`architecture.md`, `schemas.md`, `oracles.md`, `feature-model-schema.md`,
`feature-model-bindings.md`, `pre-commit.md`, `mutation-testing.md`,
`verification.md`, `srs.md`, `stpa-sec.md`, plus the positioning documents
(`what-is-rivet.md`, `rivet-is-not.md`, `intro-talk-*.md`). These are the docs
a reader is expected to land on. They are maintained to track `main`; when they
drift, they get a `status: snapshot` demotion or an `UPDATE` verdict in the
next docs audit. **Lifecycle:** long-lived; updated in place; never deleted
while the feature they describe ships.

## `design/`

Forward-looking design notes — RFC-style decision documents for a single
feature track (status-gate rules, variant-aware properties, the
tool-confidence-level dossier, cross-org supplier traceability, …). A design
doc is written before or during implementation and is rarely revisited once the
feature ships; it stays as a decision record. Design docs may carry the
`<!-- rivet-docs-check: design-doc-aspirational-ok -->` marker, which exempts
them from the documentation invariants that gate shipped reference docs.
**Lifecycle:** authored once per feature track; kept as a decision record;
archived to `historical/` only when wholly superseded.

## `plans/`

In-flight implementation plans — current work only. A plan describes a body of
work that has not yet landed. Once the work ships, the plan has served its
purpose and moves to `historical/`. This directory should be near-empty most of
the time; a long-lived plan is a signal that the work stalled or that the
document is really a design note in the wrong folder. **Lifecycle:** short;
created for in-flight work, moved to `historical/` on completion.

## `research/`

Scoped research reports with explicit verdicts — competitive analysis,
feasibility spikes, prototype reports, the cross-git investigation, the docs
audits. A research report is a `snapshot` by nature: it is accurate as of its
date and is not maintained afterwards. Negative results belong here too and are
treated as first-class (e.g. the MIRAI prototype report). **Lifecycle:** each
report is written once, dated, and frozen as a `snapshot`; old reports are kept
for the record rather than updated.

## `historical/`

The dated archive of completed plans and superseded analysis. Nothing here is
maintained; documents land here when their `design/` or `plans/` originals are
overtaken by shipped work or by a newer document. Keeping them (rather than
deleting) preserves the project's decision history for auditors. **Lifecycle:**
write-once on arrival; `status: historical`; never updated, never deleted.
