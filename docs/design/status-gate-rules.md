# Status-Gate Validation Rules in the Schema

Status: shipped (feat/status-gate-rules, 2026-05-13)
Audience: schema authors, safety leads, rivet maintainers
Refs: REQ-004 (validation), REQ-010 (schema), user feature request 2026-05

---

## 1. TL;DR

`validation-rules:` is a new top-level schema block alongside
`traceability-rules:` and `conditional-rules:`. Each rule is a single
s-expression evaluated against every artifact in the store — fires
(emits a diagnostic) when the expression returns false. The canonical
shape is

```scheme
(implies <premise> <consequence>)
```

where the consequence uses one of four new link-traversing quantifiers
to gate on the state of *linked* artifacts:

- `(forall-linked "T" <body>)`     — body holds for every outbound link of type T
- `(exists-linked "T" <body>)`     — body holds for at least one outbound link of type T
- `(forall-linked-from "T" <body>)`— body holds for every inbound source via T
- `(exists-linked-from "T" <body>)`— body holds for at least one inbound source via T

This replaces the pattern where projects shipped Python pre-commit
scripts to enforce promotion gates like "a verification can't be
approved until its requirement is approved". The rule is now data in the
schema; the validator reads it; `rivet validate` reports violations
through the standard diagnostic surface.

---

## 2. Motivation

The user reported that their team enforced V-model promotion gates with
a Python pre-commit hook that parsed YAML directly. The pattern they
wanted to declare in the schema:

> "a sys-verification artifact may only be promoted to `approved` if every
> requirement it verifies is already approved. Same pattern applies across
> the V-model — a sw-verification shouldn't be released before its sw-req
> target is approved, etc."

Today's two rule kinds couldn't express this:

| Rule kind | Limitation |
|---|---|
| `traceability-rules` | Checks link *shape* (cardinality, target types) but not link target *state*. |
| `conditional-rules` | Checks predicates over a *single* artifact's fields; cannot read fields of linked artifacts. |

The gap was small but blocking: the engine already had a link graph, a
store, an s-expression evaluator, and `Forall`/`Exists` AST nodes — but
no way to express "for each artifact at the other end of my outbound
`verifies` link, evaluate this predicate against that target."

---

## 3. Design — engine + schema + validate, three thin layers

The implementation is deliberately thin (~470 LOC + 15 tests) because
the primitives already existed:

### 3.1 Engine (`rivet-core/src/sexpr_eval.rs`)

Four new `Expr` variants, each with a paired evaluator:

```rust
ForallLinked(Value, Box<Expr>),
ExistsLinked(Value, Box<Expr>),
ForallLinkedFrom(Value, Box<Expr>),
ExistsLinkedFrom(Value, Box<Expr>),
```

Implicit-context-shift semantics: the body's `(= status "approved")`
reads the *target's* status, not the current artifact's. No variable
binders needed; the evaluator swaps `ctx.artifact` to each target/source
in turn (same trick the existing `Forall` over the whole store uses).

New `MissingTargetPolicy` enum + a field on `EvalContext` for how
link-traversing quantifiers should treat unresolved target IDs (see
§4.2).

The four lowering keywords sit alongside the existing `forall` / `exists`
keywords in `lower_list`, all named in the `HEADS` array so the unknown-
head error hint surfaces them automatically.

### 3.2 Schema (`rivet-core/src/schema.rs`)

```rust
pub struct ValidationRule {
    pub id: String,
    pub description: Option<String>,
    pub rule: String,                               // single s-expr body
    pub on_unresolved: MissingTargetPolicyName,     // skip | fail
    pub draft_downgrade: bool,                       // opt-in
    pub severity: Severity,                          // default: error
    pub message: Option<String>,                     // template
}
```

`MissingTargetPolicyName` is the YAML-facing enum; an `impl From<...> for
sexpr_eval::MissingTargetPolicy` converts to the engine-side enum.

### 3.3 Validate phase (`rivet-core/src/validate.rs`)

A new `evaluate_validation_rules` function runs after the existing
conditional-rules phase. Per rule: parse the body once (cached across
artifacts), apply the rule's `on-unresolved` policy, evaluate against
each artifact, emit a `Diagnostic` on false. Message template
substitution recognises `{id}`, `{type}`, `{status}`, `{title}`, `{rule}`
placeholders.

Parse errors in a rule body surface as a rule-level diagnostic rather
than panicking or silently passing every artifact.

---

## 4. Semantic decisions

Four design questions resolved during the implementation review.

### 4.1 Empty-set forall is **false** (audit-strict)

```scheme
(forall-linked "verifies" pred)  ;; over zero outbound `verifies` links
```

returns **false**, not true. This is a deliberate deviation from
classical mathematical forall.

**Why:** in a safety context, "a verification with nothing to verify" is
itself the bug. A `sys-verification` that reaches `status: approved`
without a single `verifies` link is precisely what the gate is designed
to catch. If the rule said "vacuously true on empty," the empty-set case
would silently pass and the gate would lose its load-bearing semantics.

The link-suffixed name (`forall-linked`, not `forall`) signals the
deviation: this is the link-traversing variant, not the classical
quantifier.

### 4.2 Missing-target policy is **per-rule**, default `skip`

When a link target ID doesn't resolve to an artifact in the store
(broken link, external-anchor boundary, unsynced cross-repo reference),
each rule declares what to do:

| Policy | Effect on `forall-linked` | Effect on `exists-linked` |
|---|---|---|
| `skip` (default) | unresolved target contributes vacuous-true | unresolved target contributes nothing |
| `fail` | unresolved target → body-predicate failure | unresolved target → body-predicate failure |

**Why per-rule:** different rules need different strictness. A
cross-org status-gate (where `verifies` legitimately targets an external
supplier) wants `skip` — we can't see the supplier's status, and the
broken-links validation phase will catch genuinely-missing links anyway.
A high-ASIL safety gate wants `fail` — absence of evidence is evidence
of absence; if we can't verify the target's state, the gate fails.

The policy is threaded through `EvalContext::missing_target_policy` and
applies uniformly to every link-traversing quantifier in a given rule's
body. A rule with multiple `forall-linked` clauses gets one consistent
strictness, not a per-quantifier knob.

### 4.3 Rule body is a **single s-expr**, not a when/then split

```yaml
validation-rules:
  - id: V-verif-needs-approved-req
    rule: |
      (implies
        (and (= type "sys-verification")
             (or (= status "approved") (= status "released")))
        (forall-linked "verifies" (= status "approved")))
```

vs. the alternative where rules carried separate `when:` and `require:`
fields. Both shapes lower to the same internal evaluation; the
single-s-expr form was chosen for uniformity and because the `(implies …)`
idiom reads cleanly in the audit context.

**Convention:** the canonical rule shape is
`(implies <premise> <consequence>)`. The premise is typically a
conjunction of type + status checks; the consequence is typically a
`forall-linked` / `exists-linked` quantifier. Rules that aren't gates
(e.g., "every approved artifact must have a `reviewer-id` field") can
use any expression that returns boolean.

### 4.4 Draft-downgrade is **opt-in per rule**

The existing `traceability-rules` and `conditional-rules` downgrade
their diagnostics from `Error` to `Info` when the offending artifact has
`status: draft`. The new `validation-rules` *don't* by default —
status-gate rules typically gate **by** status (the `when` premise filters
by `status: approved`), so an artifact in `draft` won't trigger the rule
anyway.

For rules whose premise doesn't already filter by status, set
`draft-downgrade: true` to participate in the existing convention. Most
status-gate rules should leave the flag off.

---

## 5. Worked example — ASPICE V-model

The `schemas/aspice.yaml` preset ships three status-gate rules covering
the V-model promotion ladder:

```yaml
validation-rules:
  - id: V-sys-verification-needs-approved-req
    rule: |
      (implies
        (and (= type "sys-verification")
             (or (= status "approved") (= status "released")))
        (forall-linked "verifies" (= status "approved")))
    on-unresolved: skip
    severity: error
    message: |
      {id} (sys-verification) is {status} but verifies one or more
      system-reqs that are not approved.

  - id: V-sw-verification-needs-approved-req
    rule: |
      (implies
        (and (= type "sw-verification")
             (or (= status "approved") (= status "released")))
        (forall-linked "verifies" (= status "approved")))
    on-unresolved: skip
    severity: error
    message: …

  - id: V-unit-verification-needs-approved-design
    rule: |
      (implies
        (and (= type "unit-verification")
             (or (= status "approved") (= status "released")))
        (forall-linked "verifies" (= status "approved")))
    on-unresolved: skip
    severity: error
    message: …
```

A test set with:

- `REQ-100: system-req, status=draft`
- `V-200: sys-verification, status=approved, verifies=REQ-100` (bad)
- `REQ-101: system-req, status=approved`
- `V-201: sys-verification, status=approved, verifies=REQ-101` (clean)

emits exactly one diagnostic on V-200; V-201 stays silent. End-to-end
test: `rivet-core/tests/schema_validation_rules.rs`.

---

## 6. Cross-cutting concerns flagged for follow-up

Two known interactions with in-flight design tracks:

### 6.1 Cross-org / supplier boundaries

If a `verifies` target is an `external-anchor` artifact (see
`docs/design/cross-org-supplier-traceability.md`), the local store can't
see the supplier's status. The `on-unresolved: skip` policy handles
this case correctly today. When the `external-anchor` design lands, we
may want a fourth policy (`on-unresolved: external-boundary`) that
treats unresolved external targets as a separate diagnostic category,
distinct from genuine breakage.

### 6.2 Variant-aware status

If `fields-per-variant:` lands (see
`docs/design/variant-aware-properties.md`, issue #255), `status` may
become variant-dependent. The validator already takes a variant in some
paths; status-gate rules would need to evaluate per-active-variant. The
rule shape is stable — only the underlying `status` resolution would
change.

---

## 7. New idiom hints for authors

The status-gate idiom needs only a few s-expr forms most authors will
already know. The unfamiliar pieces:

| Form | Reads as |
|---|---|
| `(implies premise consequence)` | "when premise, must consequence" — the natural rule shape |
| `(forall-linked "T" <body>)` | "for every outbound T-link, body must hold for that target" |
| `(exists-linked "T" <body>)` | "for at least one outbound T-link, body holds for that target" |
| `(or (= status "X") (= status "Y"))` | "status is X or Y" — today's idiom for set membership on scalar fields |

Future ergonomic improvement: a `(any-of <field> <val1> <val2>...)`
form to replace the verbose `or` chain. Out of scope for v1.

---

## 8. What rules can express today vs. what's deferred

**Today**:
- Cross-artifact status gates ("verifier can't ship before requirement is approved").
- Approval cascades ("every released artifact's linked design must be approved").
- Inbound gates ("a requirement at `approved` status must have at least one approved verification" — `exists-linked-from "verifies" (= status "approved")` as the consequence).
- Composability: rules can nest quantifiers, mix forall + exists, and reuse all existing `Expr` ops in the body.

**Deferred** (not blocked, just out of scope for v1):
- Transitive-closure rules ("the entire derivation chain must be approved"). The existing `reachable-from`/`reachable-to` ops could host this with a tweak, but the use case isn't pressing.
- Multi-link conjunctions in one body ("every `verifies` target AND every `derives-from` target must be approved"). Today, write two rules.
- Per-rule severity-by-status matrix (rule fires Error for `approved`, Warning for `draft`). Today, one severity per rule.
- A YAML-level `(any-of …)` sugar for set membership on scalar fields.

---

## 9. Test plan

Unit tests (`rivet-core/src/sexpr_eval.rs`):

- Audit-strict empty: `forall-linked` over zero links → false.
- Body-pass / body-fail with resolved targets.
- Missing-target × policy ∈ {Skip, Fail}.
- Inbound variants (`-from`).
- End-to-end parse_filter for all 4 keywords.
- Status-gate idiom — `(implies …)` shape across pass / fail / vacuous-premise cases.

Integration tests (`rivet-core/src/validate.rs`):

- Phase 9 end-to-end with a real V-model rule.
- Malformed rule body surfaces as rule-level diagnostic.
- `draft-downgrade: true` opt-in flips Error → Info on draft artifacts.

Preset tests (`rivet-core/tests/schema_validation_rules.rs`):

- ASPICE preset rules deserialize correctly.
- SYS.5 rule fires on bad shape, silent on clean shape.
- Every preset's `rule:` body parses cleanly (catches typos before ship).

---

## 10. References

- Engine: `rivet-core/src/sexpr_eval.rs`
- Schema: `rivet-core/src/schema.rs` (`ValidationRule`, `MissingTargetPolicyName`)
- Validate: `rivet-core/src/validate.rs` (`evaluate_validation_rules`, `render_validation_message`)
- Preset rules: `schemas/aspice.yaml` (`validation-rules:` block)
- Cross-cutting design: `docs/design/cross-org-supplier-traceability.md`, `docs/design/variant-aware-properties.md`
