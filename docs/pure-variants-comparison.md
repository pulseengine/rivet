# Rivet vs pure::variants — Feature Framework Comparison

Status: research report, v0.4.3 baseline.
Scope: Rivet's `rivet-core/src/feature_model.rs` + `variant_emit.rs` + the
`rivet variant *` CLI commands, compared against the pure::variants User
Manual (PV 7.x). All PV citations refer to
`/tmp/pure-variants/pv-user-manual.txt` line numbers (from the
`pdftotext` dump of the official manual).

## Executive Summary

**What Rivet has today (v0.4.3).** A FODA-style feature tree with five
group types (`mandatory / optional / alternative / or / leaf`),
cross-tree constraints expressed as s-expressions (`implies`, `excludes`,
and the full predicate palette shared with artifact queries), a
fixpoint-propagation solver that emits per-feature `FeatureOrigin`
(user/mandatory/implied-by), typed feature attributes stored as
`BTreeMap<String, serde_yaml::Value>`, a 7-format emitter
(json/env/cargo/cmake/cpp-header/bazel/make) operating on the effective
feature set, and a lightweight feature→artifact binding map
(`bindings.yaml`) linking features to requirement IDs and source globs.

**What pure::variants has.** Three model kinds working together —
Feature Model (FM), Family Model (fam), Variant Description Model (VDM,
PV manual §5.5 line 1282) — plus Variant Result Models (VRM, §5.9.2
line 1540) produced by evaluation. Features have typed attributes from
a closed type system (`ps:boolean / ps:integer / ps:float / ps:string /
ps:path / ps:url / ps:datetime / ps:version / ps:element / ps:feature …`,
§10.1 line 6075). A rich expression language **pvSCL** (§10.7 line 6974)
handles constraints, restrictions, and attribute calculations, with
three-valued logic (`true / false / open`) for partial evaluation
(§5.8.2 line 1447). A dedicated element-relation catalogue (§10.2 line
6196) encodes `requires / requiresAll / requiredFor / recommends /
conflicts / equalsAny / …` as first-class relations, not just Boolean
expressions. VDMs can inherit selections and attributes from other VDMs
(§5.7 line 1295, diamond inheritance allowed). Transformation is an
XML-tree-walking module pipeline with built-in `ps:pvsclxml`,
`ps:pvscltext`, `ps:flagfile`, `ps:fragment`, `ps:classalias` source
element types (§10.5 line 6387).

**Diff in one paragraph.** Rivet's *problem-space* model is
close to pure::variants' Feature Model, minus attribute typing and
minus a dedicated relation catalogue. Rivet has **no Family Model
analogue** — source elements, component/part hierarchy, and the notion
of a "Variant Result Model" do not exist; `bindings.yaml` covers only
the link from feature→requirement ID, not from feature→generated code.
Rivet has **no variant-description inheritance** — each `VariantConfig`
is a flat list of selects. Rivet has **no partial-configuration /
three-valued logic** — propagation either succeeds or fails. Rivet's
expression language is powerful for artifact *queries* but was not
designed for feature-selection arithmetic (no LET, no user-defined
functions, no numeric calculations on attribute values that flow back
into the solver, no `IF/THEN/ELSE` at the VDM level). Finally, Rivet's
transformation is one-shot emit-to-stdout; there is no variant
update/merge loop (§5.10 line 1610).

---

## 1. Feature Model Semantics

Rivet declares five group types (`rivet-core/src/feature_model.rs:82`):

| Rivet | PV analogue (§10.3 line 6314) | Notes |
|-------|-------------------------------|-------|
| `Mandatory` | `ps:mandatory` (line 6322) | auto-selected if parent selected |
| `Optional` | `ps:optional` (line 6328) | independently selectable |
| `Alternative` | `ps:alternative` (line 6332) | XOR; PV allows range override, Rivet does not |
| `Or` | `ps:or` (line 6339) | OR; PV allows range override |
| `Leaf` | — | Rivet-only schema marker; PV infers from absence of children |

PV supports **range-bounded cardinality** on `ps:alternative` and
`ps:or` groups (line 6335 — "although this can be changed using range
expressions"). Rivet's `Alternative` is hard-coded to exactly-one
(`feature_model.rs:548-560`) and `Or` is hard-coded to at-least-one
(`feature_model.rs:562-568`). There is no way in Rivet to say "select
exactly 2-of-3 sensors" or "at most 1 of these optional diagnostics".

**PV exclusion constraint:** PV forbids having both an `ps:or` and
`ps:alternative` group on the same parent (line 6335 "Pure Variants
allows only one ps:or group for the same parent element."). Rivet's
tree schema allows one group type per feature, so the constraint is
structurally honoured but not checked by `validate_tree`
(`feature_model.rs:322`).

## 2. Attribute Types

PV attribute types (§10.1 line 6075) are a **closed type system**:
`ps:boolean`, `ps:integer` (with NaN/+Inf/-Inf, hex/decimal), `ps:float`,
`ps:string`, `ps:path`, `ps:directory`, `ps:url`, `ps:html`,
`ps:datetime`, `ps:version` (with wildcards and specific regex at line
6145), `ps:filetype` (enum `def|impl|misc|app|undefined`, line 6153),
`ps:element`, `ps:feature`, `ps:class`. Attributes can be **fixed** (a
required value) or **non-fixed** (default, overridable), can be
**collections** (list/set), and can carry **restrictions** that
determine which value from a list of candidate values wins (§5.8 line
1488 — first-value-with-true-restriction semantics).

Rivet's attributes (`feature_model.rs:78`) are
`BTreeMap<String, serde_yaml::Value>`. They have **no declared types**
(a YAML integer and a YAML string are silently acceptable in the same
slot), no collection flavour (list vs set), no restriction machinery,
no default/fixed distinction, and no cross-attribute references
(PV's `ps:feature` type allows an attribute to point at another
feature; the solver resolves the reference). The emitter
(`variant_emit.rs:114`) accepts only scalars and errors loudly on
maps/sequences for every non-JSON format — deliberately loud, but the
root problem is that the schema never committed to a type.

**User impact (safety-critical).** Without typed attributes, an
`asil-numeric: 3` field cannot be guaranteed to be an integer at load
time; a later `3.0` or `"3"` would pass parse and cause surprising
`-DASIL_NUMERIC=3.0` in the cmake emit. For ISO 26262 / DO-178C, the
attribute *is* safety-relevant metadata — its schema needs to be as
strict as the artifact schema.

## 3. Constraint Language

**PV pvSCL** is a full expression language (§10.7 line 6974):
- Boolean values, integers (decimal + hex), floats, strings with escape
  sequences, collections (`{a, b, c}`, list vs set, line 7096).
- Context objects `SELF` and `CONTEXT` (line 7113) — the constraint
  can see "the element I'm attached to" and "the containing model".
- Attribute access via `->` (line 7289) with built-in
  meta-attributes like `pv:Selected`, `pv:Size`, `pv:Get`, `pv:Abs`
  (§10.7.23 line 7733).
- Relational operators `IMPLIES`, `REQUIRES`, `CONFLICTS`,
  `RECOMMENDS`, `DISCOURAGES`, `EQUALS` (§10.7.12 line 7378).
- `IF/THEN/ELSE/ENDIF` conditionals (§10.7.13 line 7438).
- Arithmetics `+ - * /` plus unary negation (§10.7.15 line 7536).
- `LET` bindings (§10.7.16 line 7552) and `DEF` user-defined functions
  (§10.7.17 line 7572, full library in §10.7.24).
- Iterators (`pv:ForAll`, §10.7.19 line 7617) and accumulators
  (`pv:Iterate`, §10.7.20 line 7630).
- Three-valued logic during partial evaluation (§10.7.11 line 7337).

**Rivet's s-expression language**
(`rivet-core/src/sexpr_eval.rs:56`) is a **predicate language for
artifact queries**. It handles:
- Logical connectives (`and / or / not / implies / excludes`).
- Comparison (`= != > < >= <=`), regex `matches`, substring `contains`.
- Collection checks (`in`, `has-tag`, `has-field`).
- **Link predicates** (`linked-by / linked-from / linked-to /
  links-count`) and graph reachability (`reachable-from / reachable-to`)
  — uniquely Rivet, pvSCL has nothing exactly equivalent.
- Quantifiers (`forall / exists / count`) — present, but they range
  over the Store (artifacts), not over feature-tree children.

What Rivet's constraints **cannot** express:
- Arithmetic on attribute values (no `A->asil-numeric + 1 = 4`).
- Conditional `IF/THEN/ELSE` within a constraint.
- `LET` or named sub-expressions.
- User-defined functions / macros (`DEF`).
- Iterators over a feature's *children* (`forall` is artifact-scoped).
- Three-valued logic — `eval_constraint` (`feature_model.rs:707`)
  defaults unknown expression shapes to `true`, which is the opposite
  of PV's behaviour (open = not-yet-decided).
- Cardinality at the group level inside a constraint (e.g.
  "exactly 2 of {A,B,C,D} must be selected").

The one thing Rivet does better: **link-based constraints**.
`(implies asil-c (linked-from "verifies" _))` would let a feature model
require that every feature at ASIL-C level has a corresponding
verification link — pvSCL has no direct equivalent because its graph is
the feature tree, not an artifact traceability graph.

## 4. Variant Description Evaluation

**PV evaluation** (§5.8.1 line 1364) is a ranked multi-pass walk
over FM + fam + VDM:
1. `propagateSelectionsAndExclusions` up and down the tree.
2. For each rank: process feature models, then `ps:family`, then
   `ps:component`, then `ps:part`, then `ps:source` — so that
   restrictions in later classes can read earlier-class selection
   states safely (line 1406).
3. `checkFeatureRestrictions`, `checkRelations`, `checkConstraints`.
4. `calculateAttributeValuesForResult` — attribute values with
   restrictions pick the first branch whose restriction set evaluates
   to `true` (line 1488).
5. Partial-mode variant runs the same algorithm with three-valued
   logic (§5.8.2 line 1447).

**Rivet evaluation** (`feature_model.rs::solve`, line 430):
1. Add user selects + root.
2. Walk up to mark ancestors as `Mandatory`.
3. Fixpoint loop bounded by `features.len() + constraints.len() + 1`:
   - Propagate `mandatory` children.
   - Propagate `(implies A B)` where A and B are feature names.
4. Check group constraints (mandatory-missing / alternative-violation /
   or-violation).
5. Boolean-evaluate each cross-tree constraint over the selected set
   (`eval_constraint`).

Missing vs PV:
- **No ranks.** Rivet has only one model; there is no fam/VDM layering
  so there is nothing to rank. But as soon as one wanted to share a
  feature model between two products (variant-of-variant), ranks would
  matter.
- **No attribute calculations after propagation.** Attribute values
  are read-only from YAML; there is no way to compute, say,
  `compile_flags = asil-numeric * 10 + market_index` and store the
  result on the resolved variant.
- **No partial mode.** `solve` is all-or-nothing; there is no "mark
  this feature as `open` until a downstream VDM decides."
- **No auto-resolver.** PV has an automatic solver that, given an
  inconsistent selection, proposes a minimal fix (§6.1.4 auto-resolver
  reference). Rivet reports errors; it does not suggest patches.

## 5. Transformation Pipeline

**PV** (§5.9 line 1504) reads the Variant Result Model as XML,
dispatches built-in modules over it:
- `ps:pvsclxml` — conditional XML fragments (line 6531).
- `ps:pvscltext` — conditional text via `PVSCL:IFCOND / ENDCOND /
  EVAL` macros embedded in source files (line 6586).
- `ps:flagfile` / `ps:makefile` / `ps:classaliasfile` / `ps:fragment`
  / `ps:file` / `ps:dir` / `ps:symlink` (§10.5 line 6387).
- Custom user modules via the PV Java API.

Plus **Variant Update** (§5.10 line 1610): three-way-merge between the
user's working copy, the latest transformed variant, and the common
ancestor, so post-transformation edits are not lost on regeneration.

**Rivet** (`rivet-core/src/variant_emit.rs:67`) emits the feature
selection and per-feature scalar attributes in one of seven formats.
There is no step that copies files, evaluates conditional fragments in
source files, or merges user edits. The emitter is pure — no filesystem
side effects — which is a deliberate design choice (safety users want
reproducible output), but the coverage gap is large: Rivet cannot
ship a C preprocessor header with conditional sections, it can only
emit `#define RIVET_FEATURE_ADAS 1` and rely on the user's own
`#ifdef`.

**User impact (safety-critical).** For IEC 61508 / ISO 26262
configuration management, "what files went into this variant" is the
audit question. PV answers with a Variant Result Model XML; Rivet
answers with the effective feature set and the binding map. Rivet
*could* answer with a manifest of source globs (it already stores
them), but does not emit a structured manifest today.

## 6. Family Models

PV Family Model (§5.4 line 1177) is the *solution-space* counterpart
to the Feature Model. It has a hierarchy of `ps:family` →
`ps:component` → `ps:part` → `ps:source` nodes (line 1201). Each node
carries restrictions (pvSCL expressions) that decide whether the node
is included in the result. This is how PV links a feature selection to
actual source code: the Family Model enumerates parts and source
elements; their restrictions reference features from the FM.

Rivet's closest analogue is `bindings.yaml`
(`feature_model.rs:152-167`):
```yaml
bindings:
  pedestrian-detection:
    artifacts: [REQ-042, REQ-043]
    source: ["src/perception/pedestrian/**"]
```
This is a single-level map — no hierarchy, no part/source distinction,
no per-node restrictions. A feature binds to a list of artifact IDs
and a list of source globs; that is the entire vocabulary. There is
no equivalent of `ps:classalias` (different class implementations at
the same hierarchical slot), `ps:fragment` (append text to file), or
any conditional-inclusion step on the file side.

**User impact (safety-critical).** For a module-qualification argument
("this unit is in scope for ASIL-C only"), PV's restriction on a
`ps:part` node is the primary evidence; Rivet cannot distinguish
"source X is always compiled" from "source X is compiled only when
feature Y is selected" — the binding is unconditional.

## 7. Variant Description Inheritance

PV VDM inheritance (§5.7 line 1295) supports:
- Multiple inheritance, diamond inheritance (line 1315 — "indirectly
  inherit a VDM more than once").
- Propagation of explicit selects *and* exclusions *and* inherited
  attributes (line 1317-1321).
- Independent inheritance of attribute values vs selections (line 1323
  — PV 5 introduction).
- Default values override-able by inheriting VDMs (line 1328).
- Four error rules (line 1342): conflicting selects, conflicting
  attribute values, missing inherited VDM, self-inheritance.

**Rivet: no inheritance.** A `VariantConfig` (`feature_model.rs:101`)
is
```rust
pub struct VariantConfig { name: String, selects: Vec<String> }
```
Each variant is independent; there is no `extends:` field, no
exclusion list (the schema only has `selects`, not `deselects`), and
no mechanism to share a base configuration across multiple product
lines.

**User impact (safety-critical).** A realistic product line has
"EU-base", "EU-autonomous" (extends EU-base), "EU-autonomous-ASIL-D"
(extends EU-autonomous). With Rivet today, the user writes three
complete selects lists and must keep them manually in sync; any drift
is a defect waiting to surface at a later release.

---

## 8. Top-5 Gap List

Ordered by user impact for safety-critical variants. Each gap has a
concrete remediation path.

### Gap 1 — Typed Feature Attributes

**Description.** Rivet attributes are
`BTreeMap<String, serde_yaml::Value>` (feature_model.rs:78). There is
no declared type per attribute key, no cross-feature checks, no
constraint that `asil-numeric` is an integer 0..=4.

**User impact.** Attribute values leak into every emitted format;
wrong type = wrong `-D` / `#define` / `set(... VAR ...)` in
downstream builds. For safety audits, attribute provenance and
type-correctness need to be machine-checkable. Today they are not.

**Remediation.** Introduce an optional per-feature-model
`attribute-schema:` section with keys like
```yaml
attribute-schema:
  asil-numeric: { type: int, range: [0, 4] }
  compliance:   { type: enum, values: [unece-r157, fmvss-127, gb-7258] }
```
Parsed in `feature_model.rs::from_yaml` around line 250, stored on
`FeatureModel`, validated after `validate_tree` at line 375. The
emitter (`variant_emit.rs:114`) consumes the schema instead of
duck-typing the YAML node.

### Gap 2 — Partial Configuration / Three-Valued Logic

**Description.** `solve` (feature_model.rs:430) is all-or-nothing —
features are either in `effective_features` or not. PV's
three-valued `open` state (§5.8.2 line 1447) is absent. `eval_constraint`
(feature_model.rs:707) silently treats unknown shapes as `true`; a
partial solver would treat them as `open`.

**User impact.** Cannot model "150% configurations" (product-line
definitions where downstream teams still own decisions). Cannot stage
configuration across suppliers — every VDM must be complete at the
point of validation.

**Remediation.** Add `FeatureState { Selected, Excluded, Open }` and
a `Selected3 { True, False, Open }` evaluator alongside the Boolean
one. New `solve_partial` returning
`BTreeMap<String, FeatureState>` instead of `BTreeSet<String>`. Keep
the existing `solve` as `solve_full` (full-configuration mode) for
back-compat. New location: fresh `solve_partial` function next to
`solve` at feature_model.rs:430.

### Gap 3 — Variant Description Inheritance

**Description.** `VariantConfig` (feature_model.rs:101) has no
`extends` field. Each variant repeats its full select list.

**User impact.** Products with shared baselines drift; ASIL-D variants
silently diverge from ASIL-C variants they were meant to inherit from.
No diamond inheritance means a "safety-base + locale overlay" split
is not expressible.

**Remediation.** Extend `VariantConfig`:
```rust
pub struct VariantConfig {
    name: String,
    selects: Vec<String>,
    deselects: Vec<String>,          // new
    extends: Vec<String>,            // new — VDM name(s) to inherit
}
```
Plus `resolve_inheritance` that topologically sorts the `extends` DAG,
detects cycles, unions `selects`, unions `deselects`, errors on
conflict per PV rules (§5.7.1 line 1342). Location: new function in
`feature_model.rs`, called by `solve` before propagation at line 446.

### Gap 4 — Group Cardinality Ranges

**Description.** Rivet's `Alternative` is hard-coded to exactly-1
(feature_model.rs:548) and `Or` to at-least-1 (line 562). PV
range expressions on groups (line 6335) allow `[2..3]`,
`[1..]`, `[..2]` etc.

**User impact.** "Pick 2 of {front-cam, side-cam, rear-cam, lidar} for
ASIL-C perception" is not expressible as a group type. It has to be
encoded as a cross-tree constraint, which bypasses the tree-level
group semantics and complicates error messages.

**Remediation.** Replace `GroupType::Alternative` and
`GroupType::Or` with `GroupType::Cardinality { min: usize, max:
Option<usize> }`. Keep YAML shortcuts: `group: alternative` maps to
`{min:1, max:Some(1)}`, `group: or` to `{min:1, max:None}`. Add a
`group: [2, 3]` tuple syntax. Validation at feature_model.rs:357 must
learn the new shape. New `SolveError::CardinalityViolation { parent,
selected, min, max }`.

### Gap 5 — Family-Model-Level Artifact Restrictions

**Description.** `bindings.yaml` maps each feature to a static list of
source globs (feature_model.rs:152). There is no per-source restriction
expression; a file is either always in scope for a feature or never.

**User impact.** Cannot express "`src/perception/pedestrian/**` is
compiled only when `pedestrian-detection AND asil-c-or-higher`". The
existing feature-triggered compilation is a blunt instrument; any
finer conditioning lives in the build system, untracked by Rivet.

**Remediation.** Extend `Binding`:
```rust
pub struct Binding {
    artifacts: Vec<String>,
    source: Vec<SourceEntry>,  // was Vec<String>
}
pub struct SourceEntry {
    glob: String,
    #[serde(default)] when: Option<String>,  // s-expr constraint
}
```
`solve` (feature_model.rs:430) evaluates each `when` expression against
the resolved selection and emits an expanded `BTreeMap<String, Vec<PathBuf>>`
on the `ResolvedVariant`. The emitter can then produce a manifest
(`--format manifest`) listing exactly which files participate in the
variant — the Variant Result Model equivalent that safety audits need.

---

## Word count (approx 2,050)
