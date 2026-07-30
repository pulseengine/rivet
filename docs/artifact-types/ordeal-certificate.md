<!-- rivet-docs-check: ignore OC-001 OC-002 REQ-001 FEAT-042 -->

# `ordeal-certificate` — machine-re-checkable proof evidence

The `ordeal-certificate` artifact type (schema `ordeal-certificate`,
rivet#693 Part 2 / ordeal#67) describes an **ordeal-cert/v1 bundle**: the
certificate [ordeal](https://github.com/pulseengine/ordeal) emits when its
certified SAT core decides a query — a variant/feature-model consistency
check, a loom rule proof, a synth codegen equivalence, a sigil overflow
check, a spar layout, a gale bitvector query. The artifact makes that
bundle a first-class piece of DO-178C / ISO 26262 / EU-AI-Act-Art-12
evidence in the rivet traceability graph.

The load-bearing idea: **a certificate is a verification link, not a
claimed status**. rivet does not trust the solver; it trusts the recorded
outcome of *re-running the trusted checker* over the bundle's payload.

## Shape

Fields mirror the upstream envelope recognizably:

| Field                 | Upstream envelope            | Meaning |
|-----------------------|------------------------------|---------|
| `format`              | `format`                     | Always `ordeal-cert/v1` (pinned by `allowed-values`) |
| `verdict`             | `verdict`                    | `unsat` (re-checkable) or `sat` (self-checked — see boundary) |
| `produced-by`         | `produced_by {name,version}` | Producing tool, e.g. `{name: ordeal, version: 0.17.0}` |
| `checked-by`          | `checked_by {name,version}`  | Trusted checker, e.g. `ordeal-lrat`; required for `unsat` |
| `attests-kind`        | `attests.kind`               | Query class: `propositional_consistency`, `qf_bv_validity`, `equivalence` |
| `attests-claim`       | `attests.claim`              | What is proven: `variant-consistent`, `variant-inconsistent`, … |
| `attests-standards`   | `attests.standards`          | Standard clauses served, e.g. `EU-AI-Act:Art12` |
| `cnf-sha256`          | `recheck.problem_sha256`     | sha256 of the canonical DIMACS clause text |
| `proof-sha256`        | `recheck.proof_sha256`       | sha256 of the proof payload (LRAT for `unsat`) |
| `cnf-ref`/`proof-ref` | (contract, deferred)         | External blobs — **not supported by the v1 reader**, see below |
| `recheck`             | `recheck` block              | `{command, expect-exit}` — the recheck invocation contract |
| `verification-result` | (rivet-side record)          | `pass`/`fail` outcome of actually running the recheck |
| `rechecked-at`        | (rivet-side record)          | RFC 3339 timestamp of that run |

Link fields:

- `attests-transform` (typed link, inverse `transform-attested-by`) — the
  artifact whose transform the certificate attests. Allowed targets:
  `requirement`, `feature`, `design-decision`, `aadl-component`; anything
  else is rejected by the `link-target-type` check.
- `verifies` — the verification links the certificate provides *once
  re-checked* (gated, see below).

Use the base `cited-source` field to pin the bundle JSON file itself
(sha256-stamped) when it is stored in the repo.

## The recheck invocation contract

`recheck.command` is the exact invocation of the trusted checker over the
bundle's payload (upstream `recheck.cmd`, e.g.
`ordeal-lrat check <problem> <proof>`), and `recheck.expect-exit` is the
exit code that means "the mathematics re-checked" (normally `0`). Upstream,
`Certificate::from_cert_v1` verifies both content sha256s **before**
parsing returns, and `UnsatBundle::recheck()` re-runs the formally-verified
LRAT checker — the hash check proves integrity, the recheck proves the
mathematics.

Coverage semantics in `rivet validate`
(rule `V-ordeal-cert-recheck-gates-verifies`, severity error):

- **Re-checked counts.** A certificate whose recheck command was actually
  run and exited per `expect-exit` — recorded as
  `verification-result: pass` — may source `verifies` links, and those
  links satisfy `requirement-verification` coverage like any other
  verification backlink.
- **Never-re-checked does not.** A certificate without a recorded
  successful recheck that claims `verifies` **fails validation**. It
  cannot silently count as evidence.

## The honest SAT boundary

UNSAT is the certificate-carrying verdict: the bundle holds a DIMACS CNF
plus an LRAT proof that an independent trusted checker validates. For SAT
verdicts (e.g. `attests-claim: variant-consistent`, the "config is valid"
answer) the proof payload is the **self-checked model** — checked against
all constraints at solve time, but ordeal ships no independently
re-checkable SAT witness yet. The schema flags a SAT certificate used as a
`verifies` source with a warning (`V-ordeal-cert-sat-is-self-checked`)
rather than passing it off as checker-validated evidence.

## The v1 inline-only reader boundary

`cnf-ref` / `proof-ref` external-blob indirection is part of the contract
for MB-class proofs but deferred: ordeal's v1 reader rejects such bundles
as `BundleError::Unsupported`. `rivet validate` mirrors the boundary — an
`ordeal-certificate` using `cnf-ref` or `proof-ref` produces the legible
error `V-ordeal-cert-v1-inline-only` instead of a mystery failure at
recheck time.

## Upstream serialization contract

ordeal-cert/v1 as shipped:
[ordeal PR #107](https://github.com/pulseengine/ordeal/pull/107)
(ordeal v0.17.0, `cert-bundle` feature): `Certificate::to_cert_v1` /
`Certificate::from_cert_v1` with both content sha256s verified before
parse returns, and `UnsatBundle::recheck()` re-running the trusted
checker. See `crates/ordeal/src/cert_bundle.rs` in that release.

## Example

```yaml
- id: OC-001
  type: ordeal-certificate
  title: variant tls+nomalloc inconsistent with feature model
  status: verified
  fields:
    format: ordeal-cert/v1
    verdict: unsat
    produced-by: {name: ordeal, version: 0.17.0}
    checked-by: {name: ordeal-lrat, version: 0.17.0}
    attests-kind: propositional_consistency
    attests-claim: variant-inconsistent
    attests-standards: [EU-AI-Act:Art12]
    cnf-sha256: <64-hex sha256 of the DIMACS clause text>
    proof-sha256: <64-hex sha256 of the LRAT body>
    recheck:
      command: ordeal-lrat check problem.cnf proof.lrat
      expect-exit: 0
    verification-result: pass
    rechecked-at: 2026-07-30T00:00:00Z
  links:
    - type: attests-transform
      target: FEAT-042
    - type: verifies
      target: REQ-001
```
