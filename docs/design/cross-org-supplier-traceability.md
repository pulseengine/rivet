# Cross-Organizational / Supplier-Management Traceability for Rivet

Audience: rivet maintainers and ALM-tool users planning OEM-supplier
traceability work. Scope: how rivet should represent the case where the
top of a project sits in one organization, parts of the chain are in-house
variants, and other parts are owned by an external supplier whose model,
field names, and even toolchain are not under our control.

## 1. Executive summary

Rivet's traceability story today is single-organization. `rivet sync`,
`rivet lock`, `rivet baseline verify`, and the cross-repo `prefix:ID`
syntax all assume the dependency's `rivet.yaml` is reachable, parseable,
and uses rivet's own schema vocabulary. As soon as one downstream party
runs Polarion, DOORS, or just a different field convention, the model
breaks: links go dangling, coverage looks red, and the "boundary" is
invisible to the auditor. This note proposes (a) a typed
**`external-anchor`** artifact that explicitly marks a chain end at an
organizational boundary, (b) a structured **`derives-from-external`**
link target, (c) a 3-state coverage outcome (`SATISFIED` /
`EXTERNAL_BOUNDARY` / `UNCOVERED`) so audit reports stop conflating
"missing in our store" with "delegated to a supplier", (d) a
field-mapping recipe schema reusing `schemas/migrations/` and (e) a
provenance trail that records what was received, when, in what format,
and whose hash. The MVP is small (~3 weeks of work) and lives entirely
on top of today's file-based, server-less architecture.

## 2. Today's state in rivet

What's there:

- **`externals:` in `rivet.yaml`** ([model.rs:271-285](../../rivet-core/src/model.rs))
  declares dependency repos with `git`, `path`, `ref`, and a `prefix`
  used for cross-repo linking (`rivet:REQ-001`).
- **`rivet sync`** ([externals.rs:92-296](../../rivet-core/src/externals.rs))
  clones / fetches / symlinks externals into `.rivet/repos/<prefix>`.
- **`rivet lock`** writes `rivet.lock` pinning each external to a commit
  SHA ([externals.rs:527-555](../../rivet-core/src/externals.rs)).
- **`rivet baseline verify`** ([externals.rs:714-746](../../rivet-core/src/externals.rs))
  cross-checks that each external repo carries a `baseline/<name>` git tag,
  so a release boundary can be signed off across repos.
- **Cross-repo backlinks** ([externals.rs:788-820](../../rivet-core/src/externals.rs))
  scan an external's artifacts for inbound links to local IDs.
- **Circular and version-conflict detection** ([externals.rs:592-651, 834-893](../../rivet-core/src/externals.rs))
  for the externals graph.
- **`schemas/common.yaml`** declares the link-type vocabulary
  (`derives-from`, `allocated-from`, `satisfies`, `verifies`, etc.) but
  every link target is a flat string ID — no notion of *who owns the
  target*.
- **ReqIF adapter** ([reqif.rs](../../rivet-core/src/reqif.rs)) and the
  in-progress **OSLC client** ([oslc.rs](../../rivet-core/src/oslc.rs))
  are the two cross-tool wires rivet has today. Both are individually
  scoped exporters, not federation primitives.
- **`cited-source` typed field** (shipped 0.7.0,
  [cited_source.rs](../../rivet-core/src/cited_source.rs)) lets an
  artifact carry `{ uri, kind, sha256, last-checked }` — a sha-stamped
  pointer to an upstream source. Phase 1 implements only `kind: file`;
  `kind: oslc | reqif | polarion` round-trip but skip remote checks.
- **`schemas/migrations/`** ([dev-to-aspice.yaml](../../schemas/migrations/dev-to-aspice.yaml))
  and the migrate engine ([migrate.rs](../../rivet-core/src/migrate.rs))
  ship a typed mapping recipe for type-rename / link-rename / field-map
  with three policy classes (`drop`, `keep-as-orphan`, `strict`). This
  is the closest existing primitive to "supplier uses different field
  names than I do".

What's missing for cross-org / supplier traceability:

- **No notion of "the chain ends here intentionally."** A requirement
  whose downstream is owned by a supplier looks identical to one we
  forgot to satisfy. Coverage is binary: covered / uncovered.
- **No structured external link target.** A link's `target:` is a
  string. There is no type-safe slot for "supplier acme, contract
  4711, doc-id REQ-SW-022, fetched 2026-04-20, sha256 …".
- **No federation handshake.** `rivet sync` requires the supplier to
  ship a full rivet repo. Real suppliers ship ReqIF, Excel, Word, or
  in best case a Polarion REST endpoint behind OAuth.
- **No field-mapping at the artifact-import boundary.** The migrate
  engine is for "schema-to-schema in our store", not "the supplier
  hands me ReqIF where `priority: P1` means `priority: must`".
- **No provenance for federated artifacts.** When an external artifact
  appears in our graph it carries the same shape as a local one — no
  "received-at, source-tool, hash-at-fetch, contract-ref" record.
- **Coverage gaps.** `compute_coverage`
  ([coverage.rs:116-199](../../rivet-core/src/coverage.rs)) walks the
  link graph and counts forward / backward links. It does not check
  whether an unsatisfied requirement happens to terminate at a
  supplier boundary, so the reporter can't distinguish
  "we missed it" from "supplier owes us this".

## 3. Competitor / standards survey

### 3.1 Polarion (Siemens / Polarion ALM)

Polarion's two relevant primitives are **cross-project linking**
and the **ALM Connector / OSLC adapter**. Within a single Polarion
instance, projects can link work items across project boundaries with
a single role (`linkedWorkItems`) and the work item is reachable via
its global URI. Across instances or to non-Polarion tools Polarion
relies on either OSLC (preferred for IBM ELM / DOORS Next interop) or
ReqIF round-trip for OEM-supplier exchange. The "external boundary"
case is handled by treating the foreign requirement as an **external
work item** whose source-of-truth lives outside Polarion: the local
work item carries a hyperlink-typed custom field plus optional
"linked external work item" metadata. Change-of-custody is handled by
*re-importing* the supplier's ReqIF and reconciling against an
existing `ReqIF.ForeignID`. Status: works but largely manual; the
auditor sees the foreign reference but the fidelity is whatever the
ReqIF profile preserved (see
[polarion-reqif-fidelity.md §2](polarion-reqif-fidelity.md) for what
that means in practice — provenance and typed custom fields are the
big ABSENT cluster).

(Sources verified: I have read the existing rivet doc
[polarion-reqif-fidelity.md](polarion-reqif-fidelity.md) which itself
warns that some Polarion entity claims are training-only, unverified.
WebFetch of `developer.siemens.com/polarion/rest-api-spec.html` and
public Polarion docs was denied in this environment.)

### 3.2 IBM DOORS / DOORS Next (DNG)

DOORS classic supports module-to-module links inside a single
database, with **link modules** acting as the broker. Supplier
exchange relied on DXL exports, ReqIF (DOORS 9.4+), or the IBM
Rational Synergy gateway. DOORS Next uses OSLC-RM and OSLC-CM as the
wire format; cross-repo traceability is a first-class concept via
**configuration-managed baselines** (Global Configuration
Management / GCM in Jazz Team Server). The "external boundary"
pattern is the OSLC `Link` to a remote `oslc:Resource` — the local
side stores the URI and an `oslc:label`, and the consumer follows
the link via HTTP. If the remote tool is unreachable or the consumer
has no credentials, DNG shows the link as "unresolved" without
treating it as an integrity violation. **Lessons for rivet**:
(1) the boundary needs to be a representable state, not an error;
(2) configuration baselines are how you pin a release across an
inter-org tree.

### 3.3 sphinx-needs (Open-source)

sphinx-needs is the closest open-source analogue to rivet's
file-based model. It supports **`needs_external_needs`** in
`conf.py` (verified via WebFetch:
<https://sphinx-needs.readthedocs.io/en/latest/configuration.html>):
each entry is `{ base_url, json_url|json_path, version, id_prefix,
target_url, css_class }` and represents read-only federated access
to needs published by another project. External needs are flagged
internally with `is_external = True` so filters can include /
exclude them. Critically, sphinx-needs does *not* try to round-trip:
external needs cannot be edited locally and are hyperlinked back to
the publisher. This is exactly the "chain ends here" semantic rivet
is missing.

What sphinx-needs lacks (and rivet should not copy): no notion of
*contract* or *expected derivatives* — the consumer cannot say "I
expect this supplier to produce a `verification` for each
`requirement` I delegated".

### 3.4 OSLC (Open Services for Lifecycle Collaboration)

OSLC is the OASIS-hosted suite of REST/RDF specs for cross-tool
traceability. The relevant pieces:

- **OSLC Core** — service-provider discovery, query syntax, ETags.
- **OSLC RM / QM / CM / AM** — domain shapes for requirements,
  quality, change, architecture management. Rivet already maps the
  first three ([oslc.rs:60-140](../../rivet-core/src/oslc.rs)).
- **OSLC Configuration Management** — global configurations for
  cross-tool baselines.
- **Tracked Resource Set (TRS)** — change feeds for incremental sync
  between tools.

OSLC's "external boundary" model is implicit: a link's target is a
URI in another service provider, possibly under another tenant. ETag
versioning lets a consumer detect drift. **Known gap (industry
folklore, not from a verified source)**: OSLC presupposes that all
tools are reachable and authenticated; it has no canonical answer for
"the supplier publishes a snapshot once a quarter and you can't poll
their server", which is the realistic OEM-tier-1 case in automotive.
This is precisely the gap rivet's file-based + git-coordinated
approach can fill if it copies the *link semantics* (URI + ETag /
hash) without inheriting the *protocol assumption* (live HTTP).

### 3.5 ReqIF (OMG, ISO 29148-aligned)

ReqIF is the OMG-standardised XML interchange format for
requirements (current public version 1.2; 1.3 widely implemented).
Core elements: `SPEC-OBJECT` (a requirement), `SPEC-OBJECT-TYPE`
(its shape), `ATTRIBUTE-DEFINITION` and `DATATYPE-DEFINITION` (its
fields), `SPEC-RELATION` and `SPEC-RELATION-TYPE` (links).
Supplier-relevant fields: `IDENTIFIER` (tool-internal), `LONG-NAME`
(human title), and the critical `ReqIF.ForeignID` and
`ReqIF.ForeignCreatedOn` attributes that survive a round-trip
between tools — they are the de facto identity carrier between OEM
and supplier. The **Automotive ReqIF Implementation Guide** (HIS
working group, picked up by ProSTEP iViP) standardises the OEM
delivery: which attribute names mean what (status, ASIL, variant
classification), how to handle change cycles, and how to encode
typed custom fields. **Lessons for rivet**: ReqIF is the lowest
common denominator for offline supplier exchange — *if* you can
preserve `ForeignID` on the way in and out, you have a poor man's
federation handshake. Rivet's current ReqIF round-trip drops
provenance entirely
([polarion-reqif-fidelity.md §2-3](polarion-reqif-fidelity.md)).

(Sources: WebFetch to the OMG ReqIF spec page and Wikipedia were
denied. The above relies on the existing rivet `reqif.rs`
implementation and the polarion-reqif-fidelity.md design doc which
references reqif.rs line-by-line, plus the author's training-cutoff
knowledge of the standard. Spot-check before committing to specific
attribute names.)

### 3.6 AUTOSAR ARXML (automotive supplier handoff)

AUTOSAR uses ARXML (XML schema) as the contract between OEM and
tier-1 supplier for software components: SWC port interfaces, data
types, ECU configuration. ARXML has typed namespaces and a strict
schema, so the "field mapping" problem is largely already solved at
the standard level — the cost is paid up-front by everyone agreeing
to AUTOSAR's vocabulary. Crucially, ARXML has the concept of a
**partial delivery**: a supplier may ship an ARXML file containing
only their components, and an OEM tool merges multiple ARXML files
into a system view. This is a pull-mode federation that rivet could
mirror at the artifact level: each party publishes their slice; the
audit consumer merges. The trade-off is the merge has to be
deterministic and conflict-free, which is why ARXML has explicit
namespace rules.

### 3.7 ISO 26262 Part 8 §5 — interfaces within distributed development

Part 8 §5 of ISO 26262:2018 ("Interfaces within distributed
developments") is the standards anchor for OEM-supplier safety work.
It requires a **DIA (Development Interface Agreement)** that
identifies what each party owns, how change is communicated, and
how evidence is exchanged. The DIA is a contract, not a tool, but
its concepts map directly to the rivet design proposed below:

- *Items and elements assigned to each party* → rivet artifacts
  tagged with the owner.
- *Communication of work products* → the federation handshake.
- *Joint review and confirmation measures* → the
  EXTERNAL_BOUNDARY coverage state plus a `received-status` field.

(Source: standard text, training-only — not WebFetched in this
session. The DIA concept is well-known in automotive; the user
should confirm specific clause numbers before quoting in audit
material.)

### 3.8 ASPICE PAM 4.0 — SUP.10 and SUP.8

ASPICE PAM 4.0 SUP.10 (Change Request Management) and SUP.8
(Configuration Management) cover the inter-organizational interface
implicitly: SUP.10.BP3 (analyze change requests) and BP6 (track
status) and SUP.8.BP4 (establish baselines) all assume that change
and config can be communicated across the OEM-supplier boundary.
They do not prescribe a wire format. Rivet's existing
`baseline verify` is the SUP.8.BP4 primitive at the file level;
nothing in rivet today maps to SUP.10 cross-org change tracking.

### 3.9 Academic literature

I cannot verify these in this session (WebFetch / WebSearch were
denied for general queries) but the relevant literature, by
training-data recall, includes:

- Cleland-Huang et al., "Software Traceability: Trends and Future
  Directions" (FOSE 2014) — surveys link semantics including
  inter-organisational; identifies "boundary trace" as an open
  problem.
- Mäder & Egyed, "Assessing the effect of requirements
  traceability" — empirical, single-org but the maintenance-cost
  argument generalises.
- ProSTEP iViP whitepapers on cross-OEM ReqIF exchange — practical
  guidance on field mapping.

The literature is sparser than for single-org RE traceability;
"federation" gets more coverage in the data-management / linked-data
side (TRS, OSLC) than in the RE-process side. **Be honest about the
gap**: this is a niche where industry practice (ReqIF round-trips,
DIA documents) leads academic study.

## 4. Design proposal

### 4.1 New artifact type: `external-anchor`

Declared in `schemas/common.yaml` so every domain inherits it:

```yaml
artifact-types:
  - name: external-anchor
    description: |
      A typed leaf representing the point at which an
      in-house traceability chain hands off to an external
      supplier or organization. The chain is intentionally
      not followed further; the supplier owns what's
      downstream. Used to keep coverage honest at the
      organizational boundary.
    fields:
      - name: source-of-truth
        type: mapping
        required: true
        # who owns it: supplier name, contract reference, doc ID
      - name: expected-derived-types
        type: list<string>
        required: true
        # what we expect the supplier to produce
        # (e.g. ["sw-req", "verification"])
      - name: received-status
        type: enum
        allowed-values:
          - not-received
          - received-as-reqif
          - received-as-pdf
          - received-as-oslc
          - received-as-polarion-export
          - received-as-arxml
          - received-other
        required: true
      - name: contract-reference
        type: string
        required: false
      - name: cited-source
        type: cited-source  # already-shipped typed field
        required: false
```

The `expected-derived-types` field is the contract: it tells
coverage what the supplier *should* produce. The
`received-status` field is the lifecycle state: `not-received`
flags an open delivery; the `received-as-*` variants stamp what
the auditor saw. The optional `cited-source` re-uses the typed
sha-stamped field shipped in 0.7.0 to attach the actual delivered
artefact (a ReqIF file, a PDF, an OSLC URI).

### 4.2 Cross-org link semantics: `derives-from-external`

Today's link model has `link_type: string` and
`target: string` ([model.rs:13-19](../../rivet-core/src/model.rs)).
Cross-org work needs structured target metadata. Rather than
break the existing model, propose a *mapped* target form for the
new link type:

```yaml
links:
  - type: derives-from-external
    target:
      org: acme-electronics
      contract: PO-4711
      doc-id: REQ-SW-022
      last-synced: 2026-04-20
      sha256: 7f3c…
      # optional: pointer to the local external-anchor artifact
      anchor: ANCHOR-ACME-001
```

YAML detail: `target:` becomes a mapping when `type` is
`*-external`; it stays a string for all existing link types. The
schema validates the shape per link type. The `anchor` field is
the audit-trail pointer back into our store: every external link
*should* terminate at an `external-anchor` artifact so that
coverage can find the boundary.

### 4.3 Three-state coverage

`CoverageEntry`
([coverage.rs:53-72](../../rivet-core/src/coverage.rs)) currently
stores `covered` and `uncovered_ids`. Extend to:

```rust
pub struct CoverageEntry {
    // existing fields...
    pub satisfied: usize,
    pub external_boundary: usize,
    pub external_boundary_ids: Vec<String>,
    pub uncovered: usize,        // strictly missing
    pub uncovered_ids: Vec<String>,
}
```

The boundary classification rule: when computing whether artifact
A satisfies a rule via link `derives-from`, walk forward; if the
link target is an `external-anchor` whose
`expected-derived-types` contains the rule's required type, count
as `external_boundary`, not `uncovered`. The auditor sees a
report like:

```
ASPICE SWE.1 → SWE.2 coverage:
  satisfied:           42 / 50 (84%)
  external boundary:    6 / 50 (12%)  — delegated to acme, gtech
  uncovered:            2 / 50  (4%)  — REQ-SW-019, REQ-SW-024
```

Audit-grade because the sum is still 100% and the boundary count
is non-zero only when an explicit `external-anchor` exists.

### 4.4 Federation handshake

Three options, ranked by cost-to-implement and coverage of real
supplier patterns:

**Option A: pull mode** (`rivet supplier pull <anchor-id>`).
Rivet reads the `cited-source` on the anchor and does the right
thing per kind:
- `kind: file` — re-hash the local file.
- `kind: reqif` — fetch / read the ReqIF, run a field-mapping
  recipe, store the resulting artifacts under
  `.rivet/supplier-cache/<anchor-id>/`, update the anchor's
  `received-status` and `last-synced`.
- `kind: oslc` — TRS sync (Phase 2; reuse oslc.rs).
- `kind: polarion` — REST sync (depends on a future polarion.rs).

**Option B: push mode** — supplier ships a manifest. The supplier
runs `rivet supplier publish` in their own repo, which produces a
signed manifest (artifact list + hashes + ReqIF / OSLC / native
payload). The OEM consumes via `rivet supplier ingest <manifest>`.

**Option C: ReqIF / OSLC bridge only.** Treat the anchor's
`cited-source` as the wire format. No new federation layer; rely
on existing standards. Lowest-cost, highest-leverage on legacy
supplier toolchains.

**Recommendation: ship A first**, with an MVP that only handles
`kind: reqif` and `kind: file`. Push and OSLC are Phase 2. This
keeps the supplier's tool-of-record optional — they keep using
Polarion or DOORS, the OEM consumes ReqIF.

### 4.5 Field mapping at the boundary

Reuse `schemas/migrations/` recipe shape
([migrate.rs:62-149](../../rivet-core/src/migrate.rs)) but apply
it at *import* time, not at *schema-version-bump* time:

```yaml
# .rivet/supplier-mappings/acme-to-rivet.yaml
mapping:
  name: acme-to-rivet
  source: { external: acme }     # marker: not a preset, an external
  target: { preset: aspice }
  type-rewrites:
    - from: SwRequirement       # acme's type name
      to: sw-req
  field-map:
    - from: priority
      to: priority
      value-map:
        P1: must
        P2: should
        P3: may
  link-rewrites:
    - from: traceTo
      to: derives-from
  policies:
    unmapped-fields: keep-as-orphan
    unmapped-link-types: drop
```

The mapping recipe is invoked by `rivet supplier pull` between
"parsed external artifacts" and "stored under
.rivet/supplier-cache/". Every mapped artifact carries a
provenance breadcrumb (§4.6) so the auditor can recover the
original.

### 4.6 Provenance trail for federated artifacts

Extend the existing `Provenance` struct
([model.rs:26-51](../../rivet-core/src/model.rs)) with an optional
`federation` block:

```rust
pub struct FederationProvenance {
    pub source_org: String,        // "acme-electronics"
    pub source_tool: String,       // "polarion-3.21" / "doors-9.7" / "reqif-1.2"
    pub source_id: String,         // ForeignID at the supplier
    pub anchor: String,            // local external-anchor artifact ID
    pub fetched_at: String,        // ISO-8601
    pub source_hash: String,       // sha256 of the wire payload
    pub mapping_recipe: Option<String>, // recipe path, if applied
}
```

Federated artifacts are written to
`.rivet/supplier-cache/<anchor-id>/<source-id>.yaml` (gitignored
by default; the project may opt to commit a curated subset). This
means the auditor's view *includes* the imported artifacts but the
local repo doesn't co-mingle them with first-party work. A new
`rivet supplier list` shows received deliveries; `rivet supplier
diff <anchor-id>` shows what changed since the last pull.

## 5. Open questions

1. **Server-less feasibility.** Pull-mode (§4.4 option A) keeps
   rivet file-based. Push-mode requires a publishing endpoint —
   could be a static site (manifest.json + signed payload) on the
   supplier's side, no live server needed. OSLC TRS is the only
   path that fundamentally wants a running service. Recommend:
   skip OSLC TRS in the MVP; revisit when a real customer asks.
2. **Authentication.** ReqIF over HTTPS gives transport security
   but no signing. Options: PGP-signed manifests (high friction),
   sigstore / cosign (requires infrastructure), or "signed by git
   commit on the supplier's published-manifests repo" (cheap,
   re-uses git's signature infrastructure). Recommend: defer to
   Phase 2; the MVP records `source_hash` per fetch, which is the
   primitive every signing scheme needs anyway.
3. **What's the smallest useful MVP?** — see §6.
4. **Subcommand placement.** The work spans current
   `rivet externals` (config, sync, lock) and could plausibly
   become `rivet supplier`. Recommendation: introduce
   `rivet supplier` as a new top-level so the audit story is
   clear; keep `rivet externals` for the rivet-to-rivet case.
   `rivet externals` is for "another team running rivet";
   `rivet supplier` is for "another organization, possibly not
   running rivet".
5. **Coverage report representation.** Should
   `external_boundary` count be displayed alongside `satisfied`
   and `uncovered`, or under a separate "supplier delegation"
   panel? Recommend the former (single 100% sum, three colours)
   so the auditor's first glance shows the org boundary
   explicitly.
6. **Anchor lifecycle.** When does an `external-anchor` go away?
   When the supplier's deliverable is integrated and re-imported
   as first-party? Recommend: never auto-delete; require an
   explicit `rivet supplier promote <anchor-id>` that converts
   delegated artifacts to local ones and archives the anchor.
7. **Variant / PLE interaction.** A supplier may deliver one
   variant and not another. The `external-anchor` should support
   the existing `when:` clause from variant work so coverage
   per-variant honours the supplier scope. Out of MVP; flag for
   Phase 2.
8. **Cycles.** A supplier may depend on us (rare but real in
   joint-venture work). The existing circular-dep detection
   ([externals.rs:834-893](../../rivet-core/src/externals.rs))
   handles this for git-based externals; the supplier path needs
   the same check on the federation graph. Cheap to add.

## 6. Recommendation

**File this as a feature issue and break it into a 3-step rollout.**
The design is mature enough: every primitive proposed here either
extends a typed field rivet already has (`cited-source`,
`provenance`, `migrate.rs` recipes) or follows a precedent set by
sphinx-needs / DOORS Next. The unknowns (auth, server-less push,
variant interaction) are deferrable.

**MVP scope (issue #1, ~3 weeks)** — the smallest version that
demonstrates the boundary-coverage semantic:

1. `external-anchor` artifact type in `schemas/common.yaml`
   (declarative, no code change beyond schema validation).
2. Coverage extension: `external_boundary` count + ID list, with
   the rule "an artifact terminating at an `external-anchor`
   whose `expected-derived-types` covers the missing type counts
   as boundary, not uncovered." 30-40 LOC change in `coverage.rs`.
3. `rivet supplier list` and `rivet supplier check` (read-only
   commands that surface anchors and boundary coverage).
4. Doc topic `rivet docs supplier` explaining the model.

That alone makes the auditor story honest: "we have 47
in-house-satisfied requirements, 6 delegated to acme (boundary),
2 genuinely uncovered." No federation, no field mapping, no
imports — just the language to express the boundary.

**Phase 2 (issue #2, ~4-6 weeks)**:

5. `derives-from-external` link type with structured target.
6. `cited-source` backends for `kind: reqif` (read-only, with
   sha verification at fetch time).
7. `rivet supplier pull <anchor-id>` for `kind: file | reqif`,
   storing under `.rivet/supplier-cache/`.
8. `FederationProvenance` block on imported artifacts.

**Phase 3 (issue #3, scope-tbd)**:

9. Field-mapping recipes (`schemas/supplier-mappings/`).
10. `rivet supplier publish` for the rivet-to-rivet supplier
    case (manifest emission).
11. OSLC / Polarion / GitHub-issues backends for `cited-source`.
12. Variant-aware anchors (`when:` clause).
13. `rivet supplier promote <anchor-id>` to convert a delegated
    chain to first-party.

The MVP is honest: it *describes* the boundary without
*federating* across it. That is the audit-critical step. The
federation work in Phase 2 is where ReqIF / OSLC actually wires
in and provenance gets stamped per-fetch.

## 7. Evidence register

| Claim | Evidence |
|-------|----------|
| `externals:` schema and prefix model | [model.rs:271-285](../../rivet-core/src/model.rs) |
| `rivet sync` clones / fetches into `.rivet/repos/<prefix>` | [externals.rs:92-296](../../rivet-core/src/externals.rs) |
| `rivet lock` writes `rivet.lock` with commit pins | [externals.rs:527-555](../../rivet-core/src/externals.rs) |
| `rivet baseline verify` checks `baseline/<name>` git tags across externals | [externals.rs:714-746](../../rivet-core/src/externals.rs) |
| Cross-repo backlink scanner | [externals.rs:788-820](../../rivet-core/src/externals.rs) |
| Circular-dep + version-conflict detection in externals graph | [externals.rs:592-651, 834-893](../../rivet-core/src/externals.rs) |
| `cited-source` typed field with sha256 + `last-checked` | [cited_source.rs](../../rivet-core/src/cited_source.rs) |
| `cited-source` allowed schemes include `oslc`, `reqif`, `polarion` (round-trip in Phase 1, no backend) | [cited_source.rs:53-81, 95-97](../../rivet-core/src/cited_source.rs) |
| Migration recipe shape (type-rewrites, link-rewrites, field-map, policies) | [migrate.rs:62-149](../../rivet-core/src/migrate.rs); [dev-to-aspice.yaml](../../schemas/migrations/dev-to-aspice.yaml) |
| Coverage today is 2-state (covered / uncovered) | [coverage.rs:53-72, 116-199](../../rivet-core/src/coverage.rs) |
| Common link types (`derives-from`, `allocated-from`, etc.) | [schemas/common.yaml:67-102](../../schemas/common.yaml) |
| ReqIF round-trip drops provenance and coerces non-string fields | [polarion-reqif-fidelity.md §2](polarion-reqif-fidelity.md); [reqif.rs:782, 968-970](../../rivet-core/src/reqif.rs) |
| OSLC client maps RM / QM / CM domains | [oslc.rs:60-140](../../rivet-core/src/oslc.rs) |
| sphinx-needs `needs_external_needs` is read-only federated | WebFetch <https://sphinx-needs.readthedocs.io/en/latest/configuration.html> |
| Polarion / DOORS / OSLC / ReqIF / AUTOSAR / ISO 26262 / ASPICE specifics | training-data only — WebFetch was denied for the standards source pages in this session. **Spot-check before committing to specific clause numbers or attribute names in audit material.** |

---

Refs: REQ-020 (cross-repo links), REQ-025 (adapters), FEAT-001
(export / interop surface). New requirement candidates:
**REQ-NEW-supplier-anchor**, **REQ-NEW-boundary-coverage**.
