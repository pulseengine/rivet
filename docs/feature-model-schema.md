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
