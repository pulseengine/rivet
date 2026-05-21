---
id: DOC-ADOPTION-STATUS
title: rivet-validate adoption status
type: status
status: snapshot
tags: [adoption, status, audit, dogfood]
---

# `rivet-validate` adoption status

This file records the most recent run of
[`scripts/audit-rivet-validate-adoption.sh`](../scripts/audit-rivet-validate-adoption.sh)
across PulseEngine repositories. It is the audit deliverable for
[issue #187](https://github.com/pulseengine/rivet/issues/187).

## How to refresh

The audit script needs sibling clones of every PulseEngine repository
(it walks a workspace directory and does not call out to the network).
A typical refresh looks like:

```sh
mkdir -p /tmp/pe-workspace
cd /tmp/pe-workspace
for r in kiln loom meld relay rivet sigil spar synth gale wohl; do
    git clone --depth 1 https://github.com/pulseengine/$r.git
done

cd /path/to/rivet
scripts/audit-rivet-validate-adoption.sh /tmp/pe-workspace \
    > docs/adoption-status.md
```

Replace this placeholder with the script output and commit. The
intention is for a CI job (Phase 4 of the V&V coverage initiative) to
do the refresh periodically and open a PR when the status changes; that
job is not yet wired up.

## Latest recorded run

> **placeholder** — replace this section with the output of
> `scripts/audit-rivet-validate-adoption.sh` against a fresh workspace.

## Related

- [`docs/pre-commit.md`](pre-commit.md) — canonical hook configuration
  and adoption recipe.
- [Issue #187](https://github.com/pulseengine/rivet/issues/187) —
  enforcement tracking issue.
- [Issue #184](https://github.com/pulseengine/rivet/issues/184) —
  pulseengine-wide V&V coverage initiative (Phase 4).
