# Variant-Aware Properties on Requirements

> **This is a design/exploration note, not the reference.** For the
> shipped, canonical spec of feature-model attributes and per-variant
> field overrides, see
> [`feature-model-schema.md`](../feature-model-schema.md). This document
> records the design space that led to those features; where it proposes
> shapes, they are labelled **SHIPPED** or **NOT IMPLEMENTED** inline.

Status: design report. Its two headline proposals have since diverged:
option A (`fields-per-variant:` on artifacts) **shipped** as issue #255;
the variant-config `attributes:` shape (option D) was **not implemented**.
Audience: rivet maintainers; future SAT/SMT solver authors; safety
auditors evaluating rivet's variant story.
Date: 2026-04-27.
Companion doc: [`pure-variants-comparison.md`](../pure-variants-comparison.md).

> Note on sources: the live `WebSearch` / `WebFetch` tools were denied
> in this session. The competitor surveys below therefore rely on
> training-data recollection (last update: late 2025) plus rivet's own
> `pure-variants-comparison.md`. Citations to PV's user manual reuse
> the line-numbered references already verified in that companion doc.
> Claims that I cannot verify against a primary source are marked
> *(unverified)*.

## 1. Problem

Rivet today has a feature model (FODA tree, group types, cross-tree
constraints, typed feature attributes), variant configurations
(`{ name, selects: [...] }`), a feature-to-artifact binding model
(`bindings.yaml`), and a 7-format emitter. The flow is:

> *feature-model* + *variant-config* → *resolved feature set* + *binding-driven
> source manifest*

What rivet **cannot** express today is a per-variant *value* on a
requirement field. Concrete motivating example:

```yaml
# artifacts/requirements.yaml — TODAY
- id: REQ-THERMAL-01
  type: requirement
  title: Operating temperature envelope
  description: The unit shall function within its declared envelope.
  fields:
    max-temp-c: 80          # ← single value, no variant axis
    min-temp-c: -20
```

But the engineering reality is:

| variant     | max-temp-c | min-temp-c | rationale                     |
|-------------|------------|------------|-------------------------------|
| automotive  | 80         | -40        | AEC-Q100 grade-3              |
| industrial  | 100        | -40        | IEC 60068-2 broader range     |
| consumer    | 70         |   0        | commercial part baseline      |

These are the same requirement (`REQ-THERMAL-01` — same intent, same
verification, same parent rationale, same upstream stakeholder), just
with different numeric bounds depending on which product the variant
binds. There is no clean way to encode this today. The available
workarounds are all wrong:

- Three separate REQs (`REQ-THERMAL-01-AUTO`, `…-IND`, `…-CON`):
  triples the artifact count, breaks
  derives-from links, and the diff becomes "one of four artifacts
  changed" rather than "the value of this field changed".
- A free-form `description` string with all three values: machine-
  unreadable, no validation, defeats `rivet validate`.
- Smuggling the values into feature attributes
  (`automotive.max-temp-c = 80`): re-anchors the data on the *feature*,
  losing the connection to the requirement, and only works for
  attributes the emitter knows about.

This gap matters for ISO 26262 / IEC 61508 / DO-178C arguments where
the same safety requirement legitimately admits different bound
values per safety integrity level, market, or sourcing strategy. A
PSAC ("here are the requirements for our DO-178C Level B build") needs
to print a *single, variant-resolved* artifact set. Rivet must be the
tool that produces it from a maintained-once source.

## 2. Today's State (reference)

What rivet's data model commits to right now:

- `Artifact.fields: BTreeMap<String, serde_yaml::Value>` — the
  default field map. **Update:** since this doc was drafted, `Artifact`
  also gained `fields_per_variant` (option A below shipped as #255).
  (`Artifact` in `rivet-core/src/model.rs`)
- `FeatureBinding.bindings[feature].artifacts: Vec<String>` — features
  bind to artifact *IDs*, not field-level slots.
  (`struct FeatureBinding` in `rivet-core/src/feature_model.rs`)
- `SourceEntry.when: Option<String>` — *source globs* can carry a
  per-variant `when:` predicate (Gap 5 in the PV comparison). This is
  one existing per-variant-value mechanism in rivet, and it
  proves the predicate plumbing is already in place.
  (`struct SourceEntry` in `rivet-core/src/feature_model.rs`)
- `attribute-schema:` on the feature model gives typed feature
  attributes (`AttributeKind::{Bool, Int, Float, Str, Enum}`), but
  these live on the *feature*, not the artifact field. **This is
  shipped** — see [`feature-model-schema.md`](../feature-model-schema.md).
  (`struct AttributeTypeDecl` in `rivet-core/src/feature_model.rs`)
- `rivet variant solve / value / attr / verify-config` operate on
  `ResolvedVariant` — a flat selected feature set plus per-feature
  origins and source manifest. There is no
  artifact-resolution step in the variant pipeline at all.

## 3. Competitor Survey

### 3.1 Polarion (Siemens)

Polarion's "Variant Management" extension *(unverified)* layers on top
of pure::variants integration. Its data model treats Work Items
(requirements, test cases, …) as the unit of variability and supports:

- **Custom fields per Work Item**: any project can define typed custom
  fields (`int`, `string`, `enum`, `date`, `richtext`).
- **Calculated fields**: a custom field can be backed by a Velocity
  expression that reads other fields, the WorkItem context, and
  *(in variant builds)* the active variant configuration.
  *(unverified — calculated-field-per-variant exact semantics.)*
- **Variant-specific specifications**: Polarion ships a "Variant
  Specification Document" feature where the document body is rendered
  per-variant (much like a sphinx-needs filter). The underlying
  WorkItem is single, but the rendered text contains
  conditional sections.

Pattern: **single artifact, per-variant rendering driven by an
expression language and an active-variant context object**. The data
is single-master; the projection is variant-aware.

### 3.2 IBM DOORS Next + pure::variants

DOORS Next stores Module artifacts; pure::variants integrates by
adding a "Variability" property on a module (or on individual
artifacts) that points at a feature expression. Then there are two
shapes I'm aware of:

- **Visibility**: an artifact appears in a variant only if its
  variability expression evaluates to true. This is the
  sphinx-needs-style filter. It does not change *values*; it
  hides/shows entire artifacts.
- **Attribute-level variability** *(unverified — believed to require
  pure::variants 5+)*: a per-attribute restriction expression. Each
  attribute slot can carry a list of `{ value, restriction }`
  alternatives, the first whose restriction is true wins. PV calls
  these "non-fixed values with restrictions" (PV manual §5.8 line
  1488 — see companion doc) and the same pattern is exposed in DOORS
  via the integration. This is exactly the missing primitive in rivet.

### 3.3 sphinx-needs

sphinx-needs uses **tags + filter strings** to turn a single
requirements set into multiple per-variant outputs. A `:status:` field
plus directives like `.. needfilter::` produce filtered tables per
build configuration. It does not natively support "the same need has
field value X in variant A and value Y in variant B" — the canonical
workaround is conditional Sphinx content (`only::` directives) or
splitting into multiple needs that share a common parent and are
linked back via `links:` / `triggers:`.

In other words: sphinx-needs treats variants as a **rendering filter**,
not a value-binding. It is closer to rivet's existing
`rivet variant filter-artifacts` story than to per-field value override.

### 3.4 pure::variants — Variation Points within Requirements

PV's primary mechanism is **Variation Points in Source/Documents**
(PV manual §5.10 — variant transformation). Conditional fragments
inside a source file are gated by `PVSCL:IFCOND … ENDCOND` macros that
the variant transform evaluates. Applied to requirements: a single
requirement document can contain alternate text for max-temp, gated
by `PVSCL:IFCOND(automotive)`. The transform produces the right
document per variant.

This is **textual** variation — it doesn't model "field max-temp-c is
80 for automotive" as structured data; it models "this paragraph
appears for automotive, that paragraph for industrial". Round-trip
parse-back is therefore lossy.

PV also has **attribute restrictions** (§5.8 line 1488): when a
feature attribute lists multiple candidate values each with a
`restriction:` pvSCL expression, the first true restriction wins.
This is the pattern that, ported to artifact fields, yields
option **A2** in this doc.

### 3.5 FeatureIDE / Clafer / TVL

- **FeatureIDE**: attributes per feature, similar to rivet today.
  Extension projects (`FeatureIDE-Numerical`, FAMA bindings) add
  attribute calculations during configuration analysis. *(unverified —
  current state of art.)*
- **Clafer** (the language): unifies feature models and metamodels.
  Concrete examples in the literature show numeric attributes being
  computed from feature selections, e.g.
  `MaxTemp -> integer = if Automotive then 80 else 100`. Clafer's
  built-in solver (Choco or Z3 backend) can both generate variants and
  solve "find me the variant with `MaxTemp ≥ 90`".
- **TVL (Text-based Variability Language)**, Classen et al. ~2011:
  features carry attributes; `if`-style attribute definitions are a
  first-class construct. Constraints over attributes are SAT/SMT
  decided. Rivet's s-expression language is in the same family.

The pattern across these languages: **attribute = feature × predicate
→ value**, with the predicate evaluated against the active variant
configuration.

### 3.6 Academic literature

Trustworthy entries from training data:

- Czarnecki & Eisenecker, *Generative Programming* (2000): introduces
  *staged configuration* — features are picked in stages, each stage
  resolves a subset of attributes. Today's rivet collapses both
  stages into one solve.
- Apel, Batory, Kästner, Saake, *Feature-Oriented Software Product
  Lines* (2013): chapter on "feature attributes" — surveys mechanisms
  for attaching numeric / string values to features and propagating
  them.
- Sinnema et al., **COVAMOF**: a variability-modelling framework that
  separates *variation points* from *variants* and from *values*. The
  three-way separation is exactly what rivet is missing today.
- Karataş et al., **Attributed Feature Models** (~2010): formalises
  the "feature has typed attributes, constraints range over
  attributes" extension, including the SMT encoding. This is the
  decidable backbone if we go that route.
- Benavides et al. surveys on "Automated analysis of feature models",
  Information Systems 35 (~2010 and updated multiple times): the
  reference list of analyses that become decidable once attributes
  are typed and constraints compile to SMT-LIB.
- Chen et al., **Variability-aware analysis** literature
  (TypeChef/Featherweight Featherweight): per-variant-value support
  inside a single artifact, with the artifact being a *partial
  configuration* that the solver completes per variant. Rivet's
  closest analogue would be a "partial artifact" with some fields
  unresolved until a variant is bound.

## 4. Design Space

Five candidate shapes. I score each on
**(V) validator complexity**, **(D) dashboard rendering**,
**(T) traceability preservation**, **(A) AI-tool friendliness**,
**(F) audit-friendliness**.

### A. Field overrides per variant — `fields-per-variant:` — **SHIPPED (#255)**

> **Status: implemented.** This is the option that was built.
> `Artifact.fields_per_variant` deserializes from a `fields-per-variant:`
> YAML block, `Artifact::fields_for_variant(Some(name))` returns the
> merged (default-overlaid-by-variant) view, and `rivet validate
> --variant <name>` validates the merged view (`validate_with_variant`).
> The description below is the original proposal; it matches what shipped.

```yaml
- id: REQ-THERMAL-01
  type: requirement
  title: Operating temperature envelope
  fields:
    max-temp-c: 80          # default / fallback
    min-temp-c: -20
  fields-per-variant:
    automotive: { max-temp-c: 80,  min-temp-c: -40 }
    industrial: { max-temp-c: 100, min-temp-c: -40 }
    consumer:   { max-temp-c: 70,  min-temp-c:   0 }
```

Variant lookup is a flat `BTreeMap<String, BTreeMap<String, Value>>`.
At resolve time the active variant name selects the override map; any
field not mentioned falls through to `fields:`.

- V: trivial — `merge(fields, fields_per_variant.get(active))`.
- D: trivial — dashboard either renders the merged view (active
  variant set) or a small expandable table of per-variant values.
- T: clean — the artifact ID stays singular, derives-from / verifies /
  satisfies links unchanged.
- A: high — this is the literal shape an LLM produces when asked
  "make this requirement variant-aware".
- F: medium-high — auditors see all values in one file with one ID.
  Caveat: the *active variant* needs to be recorded in the audit
  output so the printed value is provenance-stamped.

Risk: tightly coupled to **variant names** (string keys). Renaming a
variant in `bindings.yaml` requires rewriting every artifact that
mentions it. Mitigation: `rivet validate` cross-checks variant keys
against the binding model's `variants:` list.

### B. Variation expressions — `max-temp-c: "(if (= variant 'automotive) 80 100)"`

```yaml
- id: REQ-THERMAL-01
  fields:
    max-temp-c: "(cond
                   ((selected automotive) 80)
                   ((selected industrial) 100)
                   ((selected consumer)   70)
                   (else 80))"
```

Re-uses rivet's existing s-expression language; values become
expressions that resolve against the active feature set.

- V: medium — needs `sexpr_eval` extended with a numeric arithmetic
  branch *(rivet's current sexpr is predicate-only — see PV-comparison
  section 3)*. Type-checking the result against the field's declared
  type adds another step.
- D: medium — printing "80 (auto) | 100 (ind) | 70 (con)" requires the
  dashboard to *evaluate the expression for every declared variant*,
  which is fine but introduces dashboard-side dependency on the solver.
- T: clean.
- A: medium — LLMs can write s-expressions, but at the cost of YAML
  human-readability. A reviewer reading the diff sees `(cond …)` not
  `automotive: 80`.
- F: medium — auditors must trust the evaluator. Adds an evaluation
  trace requirement.

Strength: composes — `(* (if eu 80 75) (if asil-d 1.1 1.0))`
expressions are possible without new schema. Weakness: the schema
type-system has to allow "expression returning T" everywhere a value
of type `T` is allowed, which is invasive.

### C. Multiple bound artifacts — `REQ-THERMAL-01-AUTO`

The status quo workaround, written down. Each variant gets its own
artifact, linked back to a parent abstract requirement.

- V: zero new code.
- D: clutter — three artifacts in every list view; needs
  variant-active filter to hide siblings.
- T: damaged. `derives-from` links must fan out to all three; impact
  analysis multiplies. Auditor question "what is the verification
  evidence for REQ-THERMAL-01" needs a join.
- A: low — verbose, lots of repeated boilerplate.
- F: low — auditor sees three "almost identical" requirements and
  asks why.

This is the no-design option. Including it for completeness; rejected.

### D. Reference into variant attributes — `max-temp-c: "$variant.max-temp-c"` — **NOT IMPLEMENTED**

> **Status: not implemented.** This shape relies on a `VariantConfig`
> carrying an `attributes:` map. It does not: a `VariantConfig` is
> `{ name, selects }` only (`struct VariantConfig` in
> `rivet-core/src/feature_model.rs`). There is no `$variant.X` resolver
> and no variant-config `attributes:` block. Treat the YAML below as
> design-only.

The values live on the **variant config** (or on a feature attribute);
the artifact field references them.

```yaml
# variants/automotive.yaml
selects: [automotive, asil-c]
attributes:
  max-temp-c: 80
  min-temp-c: -40
```

```yaml
# artifacts/requirements.yaml
- id: REQ-THERMAL-01
  fields:
    max-temp-c: "$variant.max-temp-c"
```

- V: medium — needs a `$variant.X` resolver hook in field validation.
- D: medium — same dashboard-side eval as B.
- T: clean.
- A: medium — separates the data from the artifact, harder for an LLM
  to keep coherent across files.
- F: medium-high — values flow from a single source-of-truth (the
  variant). Auditors love single-source-of-truth.

The significant downside: it pushes ownership of *requirement field
values* into the *variant config*, which inverts the natural author
workflow. The requirements engineer wants to write the values next to
the requirement; they don't want to context-switch into the variant
file.

### E. sphinx-needs-style filter — `applies-to: [automotive]` per artifact

Stay with one-value-per-field, but tag each (potentially duplicated)
artifact with the variants it applies to, and filter at render time.

```yaml
- id: REQ-THERMAL-01
  applies-to: [automotive, consumer]
  fields:
    max-temp-c: 80
- id: REQ-THERMAL-01
  applies-to: [industrial]
  fields:
    max-temp-c: 100
```

- V: needs duplicate-ID-with-disjoint-applies-to to be allowed —
  invasive change to a bedrock invariant.
- D: medium.
- T: artifact-ID is no longer unique → wrecks every existing
  query/link mechanism.
- A: low.
- F: low — duplicate IDs are an instant audit smell.

Rejected. Too disruptive.

## 5. Recommendation

> **Outcome: option A was adopted and shipped (#255).** The subsections
> below are the original design detail. `fields-per-variant:` on
> artifacts, the merged-view resolver, and variant-aware `validate` are
> in the shipped product; the remaining items (option B expressions,
> predicate-keyed overrides, exhaustiveness checks, ReqIF explode) remain
> unbuilt design.

**Adopt option A as the v1 mechanism, with a forward-compatible
escape hatch into option B for advanced cases.**

### 5.1 Why A first

- Zero new evaluator. The merge is a `BTreeMap` overlay — `fields` is
  the default, `fields-per-variant[active]` overrides keys.
- LLM-friendliness matters: the rivet user base writes YAML by hand or
  via Claude Code. Authors should be able to read the file and
  *immediately* understand what value applies in which variant.
- Auditors get a single artifact ID, all values in one place, and a
  variant-stamped resolved view.
- Composes cleanly with the existing typed-attribute schema work
  (Gap 1): every value in `fields-per-variant` is type-checked
  against the same field schema as `fields`.
- Forward-compatible: option B's expressions can land later as a
  *value-shape*: a YAML scalar today, a `(cond …)` string tomorrow,
  parsed lazily by the same field validator.

### 5.2 YAML shape

```yaml
- id: REQ-THERMAL-01
  type: requirement
  title: Operating temperature envelope
  description: The unit shall function within its declared envelope.
  status: approved
  fields:
    priority: must
    category: non-functional
    # Default values — used when no active variant or no override:
    max-temp-c: 80
    min-temp-c: -20
  fields-per-variant:
    automotive:
      max-temp-c: 80
      min-temp-c: -40
    industrial:
      max-temp-c: 100
      min-temp-c: -40
    consumer:
      max-temp-c: 70
      min-temp-c: 0
```

### 5.3 Worked example — multi-field, partial overrides

```yaml
- id: REQ-AUTH-01
  type: requirement
  title: Session timeout
  fields:
    priority: must
    timeout-minutes: 30        # default
    require-mfa: false         # default
  fields-per-variant:
    enterprise:
      timeout-minutes: 15
      require-mfa: true
    healthcare:
      timeout-minutes: 5       # HIPAA stricter
      require-mfa: true
    # `personal` variant: no override → uses defaults
```

### 5.4 Worked example — variant key bound to a feature, not a config

For users who have built a small product (one feature model, no
explicit `VariantConfig`), allow keying by feature name as well:

```yaml
- id: REQ-THERMAL-01
  fields:
    max-temp-c: 80
  fields-per-variant:
    # keys can be either variant-config names OR feature names.
    # Resolver checks variant-config first, then feature.
    automotive: { max-temp-c: 80 }
    industrial: { max-temp-c: 100 }
```

### 5.5 Validate / serve / migrate semantics

- **Validate (no active variant)**: every key in `fields-per-variant`
  must (a) be a declared variant-config name *or* a feature name, and
  (b) every value must satisfy the field schema (type, allowed-values,
  range). The default `fields:` block is also validated. The artifact
  is marked `valid` if all of those hold. `--strict` additionally
  errors on unknown variant keys; default mode warns.
- **Validate `--variant <name>`**: applies the override layer for
  `<name>`, validates the merged view, *and additionally* validates
  the default view. Both must pass.
- **Resolve**: rivet exposes
  `Artifact::resolved_fields(variant: &str) -> BTreeMap<String, Value>`
  that returns the merged view. Implemented behind the existing
  `Artifact` API; existing call sites keep working because they read
  `fields` (now defined as "default fields").
- **Serve / dashboard**: a variant selector at the top of the
  dashboard sets the active variant; field cells render the merged
  value with a small marker if the value came from an override (e.g.
  `100 (industrial)`). A "show all variants" toggle expands to a
  per-variant table. The chosen variant is stamped into every
  exported artifact (PDF, ReqIF, JSON).
- **Migrate**: existing artifacts have no `fields-per-variant` — the
  default view stays the only view, behaviour unchanged. A new
  migration `add-variant-overrides` shells in empty
  `fields-per-variant: {}` slots into all requirement-typed artifacts
  for users who want to start the variant-aware journey.
- **Cited-source semantics**: `cited-source` field unchanged; if a
  variant overrides the source, that's per-variant variation in
  authority too — the override layer applies to the cited-source slot
  exactly the same way as any other field.

### 5.6 Validator error messages

Two new error classes:

- `Variant key 'foo' in fields-per-variant is not declared in any
  variant config or feature; expected one of: automotive, industrial,
  consumer.`
- `Field 'max-temp-c' in fields-per-variant.industrial: schema
  declares type=int with range [0, 200]; got 'one-hundred' (string).`

### 5.7 Open questions

1. **Partial completeness.** If the active variant has *no* override
   for a field that exists in another variant's overrides, is that an
   error, a warning, or fine (fall through to default)? Default
   answer: fine — the default-fields slot is by definition the
   fallback. But ISO 26262 may want "every variant must explicitly
   override every safety-relevant field" → opt-in `fields-per-variant:
   exhaustive: true`.

2. **Combinatorial explosion.** What if variant axes are orthogonal
   (market × ASIL × cooling-class = 30 combinations)? Hard-coding 30
   override blocks per artifact is unworkable. The pragmatic answer:
   keys can be **predicates** in option B form once that lands —
   `"(and automotive (>= asil-numeric 3))": { max-temp-c: 70 }` — but
   then key uniqueness becomes a constraint-set problem, not a string
   match. Park for v2.

3. **SAT/SMT decidability.** Option A's resolution is `O(1)` per
   field. Option B's resolution can be made decidable if the
   expression language is restricted to QF\_LIA (linear integer
   arithmetic) over feature booleans + typed attributes. Going there
   requires a Z3 / cvc5 dependency or a bespoke solver. v1 stays in
   option A's plain map territory.

4. **Test surface.** With variant-aware fields, every variant becomes
   a multiplier on the test matrix. The dogfood tests in
   `tests/dogfood/` already enumerate variants for binding solves;
   they need to grow a `for variant in declared_variants` outer loop
   for any test that reads field values.

5. **ReqIF / OSLC export interplay.** ReqIF expects single-value
   attributes per requirement. Round-tripping a variant-aware rivet
   artifact through ReqIF requires either (a) explode-on-export
   (each variant becomes a separate ReqIF specification) or
   (b) export-with-active-variant only. Polarion's ReqIF export does
   the latter; that's the lower-impact default.

6. **Diff and impact ergonomics.** A change to
   `fields-per-variant.automotive.max-temp-c` should show up as
   "automotive max-temp-c changed: 80 → 90" in `rivet diff` /
   `rivet impact`, not as "fields-per-variant changed". Both diff
   tools need a YAML-path-aware variant key recognition.

### 5.8 MVP scope (v1)

- Schema: add `fields-per-variant:
  BTreeMap<String, BTreeMap<String, serde_yaml::Value>>` to
  `Artifact`. Optional, default empty.
- Validate: variant-key cross-check against the binding model;
  per-field type-check identical to the existing `fields:` validator.
- Resolve API: `Artifact::resolved_fields(variant_name: &str)`.
- CLI: `rivet show REQ-XXX --variant automotive` shows the
  merged view; `rivet validate --variant automotive` validates
  resolved.
- Dashboard: variant selector + per-cell override-marker.
- Tests: dogfood pass updated to enumerate per-variant resolution;
  golden-file tests for one motivating example.

Out of scope for v1 (track in follow-ups):

- Option B expressions in field values.
- Predicate-keyed overrides (combinatorial axes).
- Exhaustiveness checks (`exhaustive: true`).
- ReqIF / OSLC explode-on-export.
- SAT-/SMT-driven attribute calculations.

## 6. TL;DR

- Single-master, per-variant overrides: keep one artifact, add a
  `fields-per-variant:` map keyed by variant config or feature name.
- The default `fields:` block remains the fallback — backwards
  compatible.
- Resolution is a flat `BTreeMap` overlay, no new evaluator needed.
- `rivet validate --variant <name>` validates both default and
  resolved views.
- Forward-compatible to expression-based values (option B) without
  schema rework.

## 7. Single most important open question

**Do we want variant keys to be exclusive (each artifact field has
exactly one variant override that applies, derived from the active
variant config) or compositional (multiple keys can apply
simultaneously and merge in declaration order, allowing
multi-axis variation like `automotive × asil-c`)?**

Exclusive is simpler to validate, simpler to render in a dashboard,
and matches PV's first-true-wins semantics. Compositional is what
real product-line engineering needs once the variant axes are
orthogonal (market × safety-level × cooling-class), but it breaks
key uniqueness and pulls in predicate-keyed overrides — which is
option B in disguise.

The answer determines whether v1 ships with a `BTreeMap<String,
…>` keyed-by-variant-name (exclusive) or a `Vec<{ when, fields }>`
ordered list (compositional) underneath the same `fields-per-variant:`
surface.
