---
id: DOC-FEATURE-MODEL-SCHEMA
title: Feature Model Schema
type: reference
status: current
tags: [reference, variant, feature-model, schema]
---

# Feature Model Schema

This document is the reference for `rivet variant` YAML files:

1. **Feature model** — `feature-model.yaml` (the logical problem space).
2. **Variant configuration** — the user's feature selection.
3. **Binding model** — maps features to artifacts and source globs (see also
   [feature-model-bindings.md](feature-model-bindings.md)).

Product-line engineering in rivet separates these three concerns into
independent files. A feature model captures what variants *could* exist;
a variant configuration is one user-level selection; a binding model
ties features to implementation artifacts.

Worked examples live in [`examples/variant/`](../examples/variant/).

## 1. Feature model

A FODA-style feature tree with group types and optional cross-tree
constraints expressed as s-expressions.

### Top-level keys

| Key            | Type               | Required | Meaning                                                  |
| -------------- | ------------------ | -------- | -------------------------------------------------------- |
| `kind`         | string             | no       | Informational tag; conventionally `feature-model`.       |
| `root`         | string             | yes      | Name of the root feature — the variable always selected. |
| `features`     | map<name, feature> | yes      | Every feature in the tree, keyed by unique name.         |
| `constraints`  | list<s-expression> | no       | Cross-tree boolean constraints (see below).              |

### Feature entry (`features[name]`)

| Field        | Type          | Default   | Meaning                                              |
| ------------ | ------------- | --------- | ---------------------------------------------------- |
| `group`      | enum          | `leaf`    | `mandatory`, `optional`, `alternative`, `or`, `leaf` |
| `children`   | list<string>  | `[]`      | Names of child features.                             |

Group semantics when the feature is selected:

- `mandatory` — every child is auto-selected.
- `optional` — each child may be selected independently.
- `alternative` — **exactly one** child must be selected (XOR).
- `or` — **at least one** child must be selected.
- `leaf` — terminal feature, must have no children.

If a feature is listed as a child of another but has no entry in
`features`, rivet auto-inserts it as a `leaf`.

### Constraint syntax

Constraints are s-expressions. Bare feature names stand for "this feature
is selected". The supported logical forms are:

| Form              | Meaning                                |
| ----------------- | -------------------------------------- |
| `(and A B …)`     | All of A, B, … are selected.           |
| `(or  A B …)`     | At least one of A, B, … is selected.   |
| `(not A)`         | A is not selected.                     |
| `(implies A B)`   | If A is selected then B is selected.   |
| `(excludes A B)`  | A and B may not both be selected.      |
| `(forall …)`      | Universally quantified predicate.      |
| `(exists …)`      | Existentially quantified predicate.    |

Examples from `examples/variant/feature-model.yaml`:

```s-expr
(implies eu pedestrian-detection)
(implies autonomous (and adas asil-d))
(implies adas (or asil-b asil-c asil-d))
```

The solver fails with a semantic error (not a positional one) when you
use infix notation — e.g. `A and B` produces a diagnostic pointing you at
`(and A B)`.

### Worked example

```yaml
# artifacts/feature-model.yaml
kind: feature-model
root: vehicle-platform

features:
  vehicle-platform:
    group: mandatory
    children: [market, safety-level, feature-set]

  market:
    group: alternative
    children: [eu, us, cn]
  eu: { group: leaf }
  us: { group: leaf }
  cn: { group: leaf }

  safety-level:
    group: alternative
    children: [qm, asil-a, asil-b, asil-c, asil-d]
  qm:      { group: leaf }
  asil-a:  { group: leaf }
  asil-b:  { group: leaf }
  asil-c:  { group: leaf }
  asil-d:  { group: leaf }

  feature-set:
    group: or
    children: [base, adas, autonomous]

  base: { group: leaf }

  adas:
    group: mandatory
    children: [lane-keeping, adaptive-cruise, pedestrian-detection]
  lane-keeping:         { group: leaf }
  adaptive-cruise:      { group: leaf }
  pedestrian-detection: { group: leaf }

  autonomous:
    group: mandatory
    children: [path-planning, sensor-fusion]
  path-planning: { group: leaf }
  sensor-fusion: { group: leaf }

constraints:
  - (implies eu pedestrian-detection)
  - (implies autonomous (and adas asil-d))
  - (implies adas (or asil-b asil-c asil-d))
```

### Feature attributes

Features can carry key/value **attributes** — for example an ISO 26262
numeric rating on each safety level, or the market-compliance standard on
each market. This subsection is the canonical reference for how attributes
are declared, typed, and validated.

> **There is no `documentation` field.** A `Feature` in rivet is exactly
> `{ name, group, children, parent, attributes }` and nothing else
> (`rivet-core/src/feature_model.rs`, `struct Feature`). Free-form
> descriptive text is not a first-class feature field. If you want to
> attach a human-readable note to a feature, add it as a *string
> attribute* (e.g. `attributes: { note: "…" }`) — there is no separate
> documentation slot.

#### The word "attribute" means two different things

Two distinct YAML keys both use the word "attribute", at two different
levels. Keeping them apart is the single most important thing to
understand:

| Key                 | Level                 | Holds            | Purpose                                                              |
| ------------------- | --------------------- | ---------------- | ------------------------------------------------------------------- |
| `attribute-schema:` | **top-level** (once)  | TYPE declarations | Declares the *type* (and optional range / enum / required-ness) of each attribute key. |
| `attributes:`       | **per-feature**       | VALUES           | The actual key/value data attached to one feature.                  |

`attribute-schema:` is optional and appears at most once, at the top level
of the model file next to `root:` and `features:`. `attributes:` appears
inside any `features[name]` entry. The schema names a key *once* and
constrains it everywhere; each feature supplies its own values.

> A third variant — an `attributes:` block on a **variant configuration**
> — appears in some design notes but is **not implemented**. A
> `VariantConfig` is `{ name, selects }` only. See
> [design/variant-aware-properties.md](design/variant-aware-properties.md)
> for what is and isn't shipped.

#### `attribute-schema:` — type declarations (top-level, optional)

Each entry under `attribute-schema:` is keyed by attribute name and
declares its type:

| Field      | Type                 | Applies to         | Meaning                                                          |
| ---------- | -------------------- | ------------------ | --------------------------------------------------------------- |
| `type`     | string               | all                | One of the type kinds below. Required.                          |
| `range`    | `[lo, hi]`           | `int`, `float`     | Inclusive numeric bounds. Optional.                             |
| `values`   | `[v1, v2, …]`        | `enum`             | The allowed string values. Required for `enum`.                 |
| `required` | bool (default false) | all                | When `true`, the attribute must be present on **every feature** in the model; a missing value is a hard error. |

Accepted type kinds — each with its synonyms (both spellings are
accepted; see `build_attribute_decl` in `feature_model.rs`):

| `type:` value        | Accepts                          | Extra fields          |
| -------------------- | -------------------------------- | --------------------- |
| `bool` / `boolean`   | YAML boolean                     | —                     |
| `int` / `integer`    | YAML integer                     | optional `range: [lo, hi]` |
| `float` / `double`   | YAML number                      | optional `range: [lo, hi]` |
| `string` / `str`     | YAML string                      | —                     |
| `enum`               | a string equal to one of `values` | required `values: [..]` |

```yaml
attribute-schema:
  asil-numeric:
    type: int
    range: [0, 4]
  reqs:
    type: string
  compliance:
    type: enum
    values: [unece-r157, fmvss-127, gb-7258]
```

#### `attributes:` — values (per-feature)

A feature attaches values under its own `attributes:` map. Values are kept
as raw YAML, so a feature can carry strings, integers, booleans, or small
sub-maps:

```yaml
features:
  asil-c:
    group: leaf
    attributes:
      asil-numeric: 3
      reqs: "fmea-dfa"
```

Attribute values are looked up by `rivet variant attr FEATURE KEY` and are
consumed by the variant emitters when producing build-system output.

#### Typed only when a schema is declared

Validation of attribute values runs **only when an `attribute-schema:` is
present**. This validation happens at load time, *before* the tree is
structurally validated.

- **No `attribute-schema:`** — `attributes:` are entirely free-form and
  untyped. A YAML string and a YAML integer are both accepted in the same
  slot; nothing is range- or enum-checked.
- **With an `attribute-schema:`** — for every feature, each attribute
  whose key appears in the schema is checked: type match, `range` bounds,
  `enum` membership, and `required:` presence. A mismatch is a **hard
  error**. An attribute key that is *not* declared in the schema produces
  a **warning** (not an error), so new keys can be introduced before the
  schema is updated.

#### Worked example: schema + attributes + variant + bindings

This is the real, working example in
[`examples/variant/`](../examples/variant/). It threads all four pieces
together: a typed `attribute-schema:`, per-feature `attributes:`, a
variant configuration, and a binding model.

`feature-model.yaml` (typed attributes on a FODA tree):

```yaml
kind: feature-model
root: vehicle-platform

attribute-schema:
  asil-numeric: { type: int, range: [0, 4] }
  reqs:         { type: string }
  compliance:   { type: enum, values: [unece-r157, fmvss-127, gb-7258] }
  locale:       { type: string }

features:
  vehicle-platform:
    group: mandatory
    children: [market, safety-level, feature-set]

  market:
    group: alternative
    children: [eu, us, cn]
  eu:
    group: leaf
    attributes: { compliance: "unece-r157", locale: "en_EU" }
  us:
    group: leaf
    attributes: { compliance: "fmvss-127", locale: "en_US" }
  cn:
    group: leaf
    attributes: { compliance: "gb-7258", locale: "zh_CN" }

  safety-level:
    group: alternative
    children: [qm, asil-a, asil-b, asil-c, asil-d]
  asil-c:
    group: leaf
    attributes: { asil-numeric: 3, reqs: "fmea-dfa" }
  asil-d:
    group: leaf
    attributes: { asil-numeric: 4, reqs: "fmea-dfa-fta" }
  # … qm, asil-a, asil-b likewise carry asil-numeric + reqs …

  feature-set:
    group: or
    children: [base, adas, autonomous]
  adas:
    group: mandatory
    children: [lane-keeping, adaptive-cruise, pedestrian-detection]
  # … remaining features omitted for brevity …

constraints:
  - (implies eu pedestrian-detection)
  - (implies adas (or asil-b asil-c asil-d))
```

A **variant configuration** picks a leaf on each alternative axis
(`eu-adas-c.yaml`):

```yaml
name: eu-adas-c
selects: [eu, adas, asil-c]
```

A **binding model** ties features (including the attribute-bearing `eu`
and `asil-c`) to artifacts and source (`bindings.yaml`):

```yaml
bindings:
  pedestrian-detection:
    artifacts: [REQ-042, REQ-043]
    source: ["src/perception/pedestrian/**"]
  eu:
    artifacts: [REQ-200]
  asil-c:
    artifacts: [REQ-101]
```

Resolving the variant selects `eu`, `adas`, `asil-c` (plus their
ancestors, mandatory descendants, and constraint-implied features), and
the emitter carries each selected feature's typed attributes — e.g.
`asil-c` contributes `asil-numeric: 3` — into the build configuration:

```sh
rivet variant solve --model feature-model.yaml \
  --variant eu-adas-c.yaml --binding bindings.yaml
```

## 2. Variant configuration

A user-level selection against a feature model.

| Field     | Type         | Required | Meaning                                          |
| --------- | ------------ | -------- | ------------------------------------------------ |
| `name`    | string       | yes      | Unique variant name — referenced by `check-all`. |
| `selects` | list<string> | yes      | Feature names the user explicitly picks.         |

```yaml
# eu-adas-c.yaml
name: eu-adas-c
selects: [eu, adas, asil-c]
```

The solver adds the root, every ancestor of each `selects` entry, every
mandatory descendant, and any constraint-implied feature. Output
distinguishes `mandatory`, user-`selected`, constraint-`implied by …`,
and `allowed but unbound` features.

## 3. Binding model

Maps features to the artifacts and source files that implement them.
See [feature-model-bindings.md](feature-model-bindings.md).

## 4. Composing models across files

A large product line can be split across files: a top-level model in one
file, each sub-level (powertrain, ECU, …) in its own file owned by
whichever team owns that level. Every model file remains a valid,
independently-solvable feature model on its own — `rivet variant list
--model powertrain.yaml` works with no parent.

A **`feature-model-binding`** file (REQ-083) declares how the files
compose:

```yaml
kind: feature-model-binding
compose:
  - parent: vehicle.yaml             # path, relative to this binding file
    mount:
      powertrain:                    # a feature in the parent = the mount point
        model: powertrain.yaml       # the sub-model file
        prefix: pwt                  # prefix for the sub-model's features
  - parent: powertrain.yaml          # a sub-model may itself be a parent
    mount:
      ecu-control:
        model: ecu.yaml
        prefix: ecu
```

On load, each mounted sub-model is spliced into its parent: the
sub-model's features are namespaced under the mount `prefix`
(`pwt:four-wheel`), its root becomes a child of the mount-point feature,
and the constraint sets are unioned into one resolved tree that
`solve` / `check` / `explain` / `list` all operate on.

Rules:

- The **mount point** must be an explicit feature in the parent model
  with a non-`leaf` group (`mandatory`, `optional`, `alternative`, `or`)
  so the sub-model can attach.
- Every mount **`prefix`** must be unique across the whole composition.
- A parent constraint may reference a prefixed child feature, e.g.
  `(implies car pwt:four-wheel)`.
- A broken mount — missing file, unknown or `leaf` mount point, duplicate
  prefix, cyclic composition — is a hard error, never a silent skip.

Any `rivet variant` command accepts a binding file wherever it accepts a
plain model: `rivet variant list --model binding.yaml`.

## CLI reference

```sh
# Create a starter feature-model.yaml + bindings/<name>.yaml pair.
rivet variant init <name>

# Inspect the feature tree.
rivet variant list --model feature-model.yaml

# Resolve a single variant (PASS/FAIL).
rivet variant check --model feature-model.yaml --variant eu-adas-c.yaml

# Iterate all variants declared in bindings and report per-variant status.
rivet variant check-all --model feature-model.yaml --binding bindings.yaml

# Solve + show bound artifacts with origin tags.
rivet variant solve --model fm.yaml --variant v.yaml --binding bindings.yaml

# Variant-scoped validation (variant is optional — model+binding validates
# the model/binding pair without resolving a specific variant).
rivet validate --model fm.yaml --binding bindings.yaml
rivet validate --model fm.yaml --variant v.yaml --binding bindings.yaml
```
