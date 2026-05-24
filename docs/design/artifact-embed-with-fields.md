# PROPOSAL: extend `{{artifact:ID}}` embed to support per-field projection

**Status**: design proposal, surface change only (no schema or storage impact)
**Originating context**: eclipse-score corpus migration (see
`docs/design/sphinx-needs-rowan-v2.md` and the eclipse-score-fork
workspace at `/Users/r/git/pulseengine/eclipse-score-fork/`)
**Estimated effort**: 1–2 hours in `rivet-core` embed resolver + 1 hour
test coverage + ~10 lines of `rivet docs embed-syntax` doc updates

## Motivation

Rivet's `{{artifact:ID}}` embed today is binary: compact card (id +
type + title) or `{{artifact:ID:full}}` (id + type + title + description
+ tags + links). Sphinx-needs' equivalent inline role
`:need:`some_id`` defaults to *title + id as a hyperlink* — a tighter
default, suitable for narrative prose.

For compliance documents that wrap traceability in human narrative
(eclipse-score's safety-case checklists are the concrete worked
example — see
`/Users/r/git/pulseengine/eclipse-score-fork/upstream/eclipse-score-persistency/docs/safety_mgt/module_safety_package_fdr.rst`),
authors want *intermediate*-density embeds: id + one or two
attributes that contextualise the citation. The common shapes:

| Use case | Today's awkward workaround | What authors want |
|---|---|---|
| "Cite REQ-001 with its safety level" | `{{artifact:REQ-001}}` (no safety shown) or `{{artifact:REQ-001:full}}` (too noisy) | `{{artifact:REQ-001:safety-level}}` → id + title + safety badge |
| "Cite REQ-001 with its current status" | (same) | `{{artifact:REQ-001:status}}` → id + title + status indicator |
| "Cite hazard H-1 with severity + ASIL" | (same) | `{{artifact:H-1:severity,safety-level}}` |
| "Cite a tool with TCL classification" | (same) | `{{artifact:TOOL-CLANG:tcl,version}}` |

## Proposed syntax

```text
{{artifact:<ID>}}                              # current: compact card
{{artifact:<ID>:full}}                         # current: full card
{{artifact:<ID>:<field1>}}                     # NEW: compact + one field
{{artifact:<ID>:<field1>,<field2>,...,<fieldN>}}  # NEW: compact + N fields
```

The list `<field1>,<field2>...` is comma-separated, no spaces (or
trimmed during parse). Each field name resolves against:

1. **Standard properties first**: `status`, `tags`, `type`, `title`,
   `description`. (Note: `id` and `type` are *always* in the compact
   card already, so passing them as field names is a no-op — not an
   error.)
2. **Custom `fields` map next**: any key in the artifact's `fields:`
   block (e.g. `safety-level`, `priority`, `tcl`, `verification-criteria`).
3. **Resolves to empty string** if the field name doesn't exist on the
   artifact — quietly drops, doesn't error. (Rationale: an artifact
   that genuinely has no `safety-level` should render without one,
   not break the surrounding document.)

Reserved words `full`, `compact` keep their current meaning. Field
names cannot collide with them (validation: refuse if a schema declares
a field literally named `full` or `compact`).

## Rendering

**Compact card today** (HTML, simplified):
```html
<a class="rivet-artifact-ref" href="/artifact/REQ-001">
  <span class="id">REQ-001</span>
  <span class="type">requirement</span>
  <span class="title">Brake pressure modulation</span>
</a>
```

**With field projection** (e.g. `{{artifact:REQ-001:status,safety-level}}`):
```html
<a class="rivet-artifact-ref" href="/artifact/REQ-001">
  <span class="id">REQ-001</span>
  <span class="type">requirement</span>
  <span class="title">Brake pressure modulation</span>
  <span class="field" data-key="status">status: approved</span>
  <span class="field" data-key="safety-level">safety-level: ASIL_B</span>
</a>
```

CSS can style `.field[data-key="safety-level"]` as a colored ASIL badge,
etc. — that's a stylesheet decision, not an embed-syntax decision.

**Text output** (CLI / plain export):
```
REQ-001 (requirement) — Brake pressure modulation [status=approved, safety-level=ASIL_B]
```

## Why we want this

1. **Eclipse-score migration parity.** The eclipse-score-fork converter
   emits markdown documents alongside the typed YAML. Citations of
   needs in narrative prose (~800 inline `:need:` occurrences in
   eclipse) become `{{artifact:ID}}` embeds. Today those embeds lose
   the safety/security/status context that sphinx-needs renders by
   default in its in-page link. With per-field projection, the markdown
   docs match sphinx-needs' rendered semantics.

2. **Safety-case readability.** Compliance authors writing FDRs
   (Formal Design Reviews) cite tens of requirements per page. The
   reader needs to see ASIL level / status alongside the ID without
   clicking through. The full card is too verbose; the compact card
   omits the audit-relevant context.

3. **Tighter than `{{table:TYPE:FIELDS}}`.** The existing
   `{{table:TYPE:FIELDS}}` embed gives a full table view of all artifacts
   of a type. That's the right tool for "show me every requirement
   that's ASIL-B." It is the *wrong* tool for "in this paragraph, cite
   THIS specific requirement with its ASIL level." Per-field embed
   fills the missing single-artifact-with-projection middle.

4. **Symmetry with the API.** The Grafana JSON API at
   `/api/v1/artifacts?id=REQ-001&fields=status,safety-level` already
   supports field projection (look at the implementation in
   `rivet-cli/src/serve/api.rs::artifacts`). The document embed
   surface should match.

## Implementation notes

Where to land:

- **Parser**: `rivet-core/src/embed.rs` (or wherever the embed
  resolver lives — `grep -r "fn resolve_embed" rivet-core/src` should
  find it). Extend the `Embed::Artifact { id, mode }` enum variant:
  ```rust
  enum ArtifactMode {
      Compact,                         // {{artifact:ID}}
      Full,                            // {{artifact:ID:full}}
      Fields(Vec<String>),             // NEW: {{artifact:ID:f1,f2,...}}
  }
  ```
- **Resolver**: when rendering, look up each requested field on the
  artifact (standard props first, then `fields` map). Skip missing
  silently.
- **HTML renderer**: emit `<span class="field" data-key="…">key: value</span>`
  for each projected field. Existing CSS keeps working; new badges
  are progressive enhancement.
- **Text renderer**: append `[k1=v1, k2=v2, ...]` after the existing
  compact-card text.
- **Validation**: refuse `{{artifact:ID:field-that-does-not-exist}}`
  silently (drop the field), but `{{artifact:ID:}}` (empty trailing
  colon) should error — that's a malformed embed.

Test coverage:

- `tests/embeds_artifact_fields.rs`: one test per shape (single
  field, multi-field, missing field, unknown field, reserved-word
  collision with `full`/`compact`).
- Round-trip with `rivet export --format html`: embed renders the
  expected HTML in the static export, not just the live dashboard.

## Out of scope

- **Field formatting**: do NOT add per-field formatters in the embed
  syntax (e.g. `{{artifact:ID:status[uppercase]}}`). That belongs in
  CSS/templates. Keep the embed surface free of mini-DSLs.
- **Nested embeds**: do NOT allow `{{artifact:REQ-001:links}}` to
  recursively render link cards. Links are their own embed
  (`{{links:ID}}`); keep them separate.
- **API field projection extension**: the `/api/v1/artifacts` endpoint
  already accepts `?fields=...`. This proposal makes the doc embed
  match — no API change.

## How this is used in the eclipse-score-fork

After this lands, the eclipse-score-fork converter at
`/Users/r/git/pulseengine/eclipse-score-fork/tools/score_import.py`
will emit per-need citations as:

```markdown
### Key Naming

{{artifact:COMP_REQ__KVS__KEY_NAMING:status,safety-level,req-type}}

The component shall accept keys that consist solely of...
```

Renders the equivalent of sphinx-needs':

```rst
.. comp_req:: Key Naming
   :id: comp_req__kvs__key_naming
   :status: valid
   :safety: ASIL_B
   :reqtype: Functional
```

That's the parity gate. Today's converter emits just
`{{artifact:COMP_REQ__KVS__KEY_NAMING}}` (no field context).
After this lands, the converter switches to the per-field form
without any other change.

## Open questions

1. **Default field set per type?** Should the schema declare a
   `default-embed-fields:` per artifact type so authors can write
   `{{artifact:ID}}` and get a type-appropriate default (e.g. for
   `requirement`, always include `status` and `safety-level`)? My
   instinct: yes, schema-level defaults are cleaner than every
   author re-typing the same field list. But it's a v1.1
   enhancement, not a v1 blocker.

2. **Markdown plain-text fallback?** When viewing the raw `.md`
   file outside rivet, `{{artifact:REQ-001:status,safety-level}}`
   is opaque syntax. Do we want a CLI command (`rivet embed
   inline FILE`) that materialises embeds to inline markdown for
   archival? Not needed for v1; raise if anyone asks.

3. **Variant scoping?** When the dashboard has a variant selector
   active (REQ-085 cross-repo composition), should embedded
   field values reflect the variant's field values? Probably yes,
   matches the rest of the variant-scoping behaviour. Worth checking
   `rivet-cli/src/serve/api.rs::artifacts` to see how it handles
   `?variant=` + field projection.
