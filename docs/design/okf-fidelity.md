# Open Knowledge Format (OKF) Fidelity

Audience: maintainers deciding whether rivet should adopt, interoperate with, or
acknowledge Google's Open Knowledge Format. Scope: REQ-341 / issue #549 — *"if
this could be a separate format to use or for our finalized way. Or if this is
not structured enough."*

Grounding: every OKF claim below is quoted from `SPEC.md` **v0.2** in
[GoogleCloudPlatform/knowledge-catalog/okf](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md),
read directly rather than from the README or the announcement. Rivet's side is
read from `rivet-core/src/model.rs`, `rivet-core/src/schema.rs` and
`schemas/common.yaml`.

## 1. TL;DR

**Recommendation: ACKNOWLEDGE now; build a one-way EXPORT only on demand.**
**ADOPT is ruled out by the specification itself.**

OKF is a deliberately loose format — *"a directory of markdown files with YAML
frontmatter. There is no schema registry, no central authority, and no required
tooling."* It *requires* consumers to accept exactly what rivet reports as
errors: unknown types, missing fields, broken links, and untyped relationships.
Five of the nine constructs that make a rivet trace machine-checkable have no
OKF representation at all (§3).

On the maintainer's question — *is it structured enough?* — **no, and on
purpose.** OKF targets data-catalog knowledge for AI agents, not engineering
traceability.

One idea is worth borrowing regardless: its provenance model (§5).

## 2. What OKF is

| | |
|---|---|
| Owner | Google Cloud (`GoogleCloudPlatform` on GitHub), Apache-2.0 |
| Announced | 2026-06-12 as v0.1 — [Google Cloud blog](https://cloud.google.com/blog/products/data-analytics/how-the-open-knowledge-format-can-improve-data-sharing), which calls it *"a starting point, not a finished standard"* |
| Current | **v0.2** (2026-07-24), already **breaking** v0.1 — `timestamp` → `generated.at`, `# Citations` → `sources` |
| Releases | **none** — no tags on either repository |
| Purpose | documenting data assets for AI agents (*"the LLM-wiki pattern"*) |

A pre-1.0 draft with no tagged release that broke compatibility within six
weeks is a moving target; any adoption would inherit its churn.

## 3. Construct-by-construct fidelity

YES = OKF expresses it natively. PARTIAL = expressible only by convention.
NO = no representation; OKF's spec actively permits the opposite.

| # | Rivet construct | OKF | Evidence (SPEC.md v0.2, verbatim) |
|---|---|---|---|
| 1 | Typed entities with a declared type vocabulary (`requirement`, `hazard`, …) | **PARTIAL** | Every concept has a `type`, but *"Type values are **not** registered centrally… consumers MUST tolerate unknown types gracefully"*. A stated non-goal: *"Defining a fixed taxonomy of concept types."* |
| 2 | Typed, **directed** links with a declared **inverse** (`verifies` ↔ `verified-by`) | **NO** | *"The specific kind (parent/child, references, joins-with, depends-on) is conveyed by the surrounding prose, not by the link itself. Consumers that build a graph view typically treat all links as directed edges of an untyped relationship."* No inverse concept exists. |
| 3 | Source/target-type and **cardinality** constraints on links | **NO** | Links carry no type, so there is nothing to constrain. And: *"Consumers MUST tolerate broken links: a link whose target does not exist in the bundle is not malformed"* — the exact condition rivet reports as `broken-link` (Error). |
| 4 | Required fields and **allowed values** per type (`status ∈ {draft … verified}`) | **NO** | *"`type` is the only always-required key"*; *"consumers MUST NOT reject a bundle because of: Missing optional frontmatter fields… Unknown additional frontmatter keys."* The one enum, `status: draft \| stable \| deprecated`, is fixed for every type and not extensible. |
| 5 | Traceability **rules** with severity (*"every requirement must have an incoming `verifies`"*) | **NO** | Conformance is only parseable frontmatter, a non-empty `type`, and index/log structure; *"Consumers SHOULD treat all other constraints as soft guidance."* |
| 6 | Per-artifact **provenance** (who, which model, when) | **YES** — richer than rivet | `generated: { by: reference_agent/gemini-2.5-pro, at: … }` plus a list of `verified` events; actors `<producer>/<version>`, `human:<id>`, `process:<id>`; derived trust tiers and `stale_after`. |
| 7 | Stable, human-readable IDs (`REQ-001`) | **PARTIAL** | *"Concept ID: The path of the concept's file within the bundle, with the `.md` suffix removed."* Works if files are named `REQ-001.md`, but the ID is a path, so **moving a file changes its identity**. |
| 8 | Diff-friendly, round-trippable text for git review | **YES** | Motivation lists *"Diffable in version control"*; git is the recommended distribution; *"Consumers SHOULD preserve unknown keys when round-tripping"*. |
| 9 | Schema composition (`extends`) | **NO** | There is no schema layer (*"no schema registry"*). Non-goal: *"Replacing domain-specific schemas… OKF references them; it does not subsume them."* |

**Rows 2, 3, 4, 5 and 9 are precisely what make a rivet trace checkable.** They
are not gaps OKF might close later; the spec takes the opposite position on
each.

## 4. Why each outcome was or was not chosen

**ADOPT — rejected.** Carrying rivet's link types, constraints and rules as
OKF extension keys would not make OKF rivet's format; it would be rivet's own
format with a `.md` suffix, and every generic OKF consumer would ignore the
parts that matter.

**INTEROPERATE — viable, one-way, not now.** The two directions are not
symmetric:

- **Export (rivet → OKF) fits well.** One artifact per `.md` concept
  (`type: requirement`, file `REQ-001.md`); rivet's AI provenance maps onto
  `generated.by` / `verified[]`. The result is readable by the agent tooling
  OKF targets.
- **Import (OKF → rivet) is weak.** A third-party bundle gives free-form types
  and untyped links, so rivet would have to guess link semantics from prose.

A round trip through any tool other than rivet loses: link types and
direction, inverses, source/target and cardinality constraints, per-type
required fields and value lists (rivet's `approved`/`implemented`/`verified`
do not fit OKF's three-value `status`), traceability rules and severities,
`extends`, and ID stability under file moves. Rivet-to-rivet could be lossless
in principle via extension keys, but preservation is a **SHOULD**, and a tool
editing the bundle in between may drop them.

**ACKNOWLEDGE — recommended now.** v0.2, no tagged release, one compatibility
break in six weeks, and a different domain. Building an exporter against a spec
that is still breaking would be rework. **Revisit when either** OKF tags a 1.0,
**or** a user asks to feed rivet artifacts to an OKF-consuming agent — at which
point the export in §4 is small and well understood.

## 5. What to borrow now, independent of the decision

OKF's provenance is the one area ahead of rivet's. It separates *who generated
a concept* from *each event that verified it*, and derives a trust tier
(unverified → machine-confirmed → human-reviewed) from those events.

Rivet's `provenance:` records `created-by`, `model`, `session-id`, `timestamp`
and a single `reviewed-by`. It cannot express *"generated by an agent, then
machine-checked by X, then reviewed by a human"* as a sequence — which is
exactly the distinction REQ-335 (partition the proven from the unproven) and
REQ-333 (typed record of who approved what) need. That is worth an artifact of
its own rather than an OKF dependency.

## 6. Evidence register

| Claim | Source |
|---|---|
| OKF is v0.2, no releases or tags | GitHub API, both repositories |
| v0.1 → v0.2 broke `timestamp` and `# Citations` | SPEC.md §13 change list |
| Links are untyped; broken links are not malformed | SPEC.md v0.2 (quoted §3 rows 2–3) |
| Only `type` is required | SPEC.md v0.2 (quoted §3 row 4) |
| No schema registry; does not subsume domain schemas | SPEC.md v0.2 (quoted §3 row 9) |
| Provenance model | SPEC.md v0.2 (quoted §3 row 6) |

**Not examined:** OKF's reference-agent code, connectors, sample bundles and
tests — so whether any tooling enforces more than the prose spec is
**unverified**. No public roadmap exists, so whether typed links are planned is
unknown; the spec's *"Considered and deferred"* list does not mention them.
The maintainer wrote only *"okf"*; this is the one match found, and it has not
been confirmed to be the thing they meant.
