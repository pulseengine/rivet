---
id: DOC-RELEASE-STATUS
title: "Release readiness — rivet release status"
type: reference
status: current
tags: [release, cuttability, coverage, aspice, v-model, reference]
---

# Release readiness — `rivet release status`

`rivet release status <version>` is the cuttability gate for a release
scope. It reports a per-status burn-down for every artifact carrying
`release: <version>` and exits non-zero when the scope is not release-ready
— the CI-gating contract.

Two `rivet.yaml` knobs (REQ-240, [#612]) widen what counts as ready so
V-model / ASPICE projects — which verify via links, not a status flip —
can green the gate. This page pins the semantics of those knobs, in
particular the subtle one: `require: coverage` greens when the configured
**coverage-rules are satisfied**, which is not the same thing as "every
verification level is present".

## The knobs

`rivet.yaml`:

```yaml
release:
  ready-when: [approved]      # extend the ready status set
  require: coverage           # OR: derive readiness from validate V-closure
```

### `ready-when: [<status>, ...]`

Extends the release-ready status set beyond the built-in
`verified` / `accepted`. Purely additive — the built-ins still count. Use
this when the project's own lifecycle terminal is a status string other
than the built-ins (e.g. an `approved` sign-off).

### `require: coverage`

Also counts an artifact ready when every applicable **validate coverage
rule** for its type is satisfied, regardless of the status string. Purely
additive: a `verified` / `accepted` / `ready-when` artifact still counts,
so switching to `coverage` never makes a release *less* cuttable.

This is the escape hatch for V-model / ASPICE projects that carry
requirements at a terminal status like `approved` and express verification
through links (`verified-by` / `verifies`) rather than a further status
flip.

## The precision note

`require: coverage` reads whatever coverage-rules the project's schema
declares. It is **not** a hard-coded "every V level is present" gate. What
counts as V-closed depends entirely on how the schema's coverage-rules are
written.

The ASPICE built-ins ship a permissive shape. `swe1-has-verification` is
declared as:

> An `sw-req` at a lifecycle status of `implemented` or later is verified
> by **≥ 1** of `{sw-verification, unit-verification, sw-integration-verification}`.
> **severity: warning**.

So a requirement with **one** verification measure linked (e.g. formal
verification via `sw-verification`) passes the rule and counts as ready
under `require: coverage`, even though the granular `rivet validate`
breakdown for the same requirement will still list `missing:
unit-verification, sw-integration-verification` at info severity.

Both outputs are internally correct. They answer different questions:

| View                       | Question it answers                            |
|----------------------------|------------------------------------------------|
| `rivet release status` under `require: coverage` | Does the schema's `swe1-has-verification` rule pass? (≥ 1 measure) |
| `rivet validate` granular breakdown              | Is every declared verification level present? (per-level) |

The `release status` verdict follows the rule literally. If a green
verdict means "≥ 1 measure exists somewhere" and the project needs it to
mean "every level is closed", the schema must be tightened, not the
release-status command.

### Concrete example

A project runs `rivet release status v0.1.0` on eleven `sw-req` artifacts
under an aspice-flavoured schema. Each requirement carries a formal
verification link (`sw-verification`) plus a system-level verification
link but no unit / integration verification.

| `rivet.yaml` `release:` config | Verdict          |
|--------------------------------|------------------|
| *(none — default status-mode)* | ✗ NOT cuttable — no artifact is `verified`/`accepted` |
| `ready-when: [approved]`       | ✓ Cuttable — every `sw-req` is `approved` |
| `require: coverage`            | ✓ Cuttable — the ≥ 1-measure rule passes |

Under `require: coverage` the gate greens because
`swe1-has-verification` fires only when *zero* verification measures are
linked. `rivet validate` on the same repo still reports the per-level
gaps as info because those are a separate check.

## When "≥ 1 measure" isn't strict enough

An ASIL-D (or DAL-A, or IEC 62304 Class C) project wanting the gate to
mean **full per-level V-closure** — every declared verification level
present, not just at least one — should express that in the schema's
coverage-rules, not by reinterpreting the command. Two options that keep
the command's contract:

1. **Split the built-in rule.** Replace the single ≥ 1-of-many rule with
   per-level rules — one for `sw-verification`, one for
   `unit-verification`, one for `sw-integration-verification` — each with
   `severity: error`. `require: coverage` then greens only when every
   level's rule passes; a missing unit-verification blocks the gate the
   same way a missing formal verification would.
2. **Author the coverage-rules from scratch.** For a project that already
   diverges from the aspice built-ins, declare a project-specific
   coverage-rule per verification level at `severity: error`. Same effect.

Both keep readiness derived from the schema — the intended shape — rather
than embedding "every level" into the tool. Projects that keep the ≥ 1
warning-severity rule opt in to that meaning of green.

## Backwards compatibility

The default mode is unchanged: no `release:` block in `rivet.yaml` means
`rivet release status` gates on `status ∈ {verified, accepted}` exactly
as before. The knobs are strictly additive; a project can adopt
`ready-when` and `require: coverage` without ever making a previously
cuttable release non-cuttable.

The `--format json` output continues to expose `cuttable` as a boolean
under a stable key; the exit code stays consistent with that verdict
(non-zero when `cuttable == false`) so the CI-gating contract is
untouched.

## See also

- [`docs/schemas.md`](schemas.md) — coverage-rule authoring shape.
- [`docs/verification.md`](verification.md) — how verification maps to
  ASPICE SWE.4 / SWE.5 / SWE.6.
- [REQ-240](../artifacts/requirements.yaml) — the requirement anchoring
  the `ready-when` + `require: coverage` widening.
- [#612](https://github.com/pulseengine/rivet/issues/612) — the original
  friction report against a link-verification project (gale).

[#612]: https://github.com/pulseengine/rivet/issues/612
