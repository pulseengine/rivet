---
id: DOC-CI-RUNNERS
title: CI runner pool operations runbook
type: reference
status: current
tags: [reference, ci, runners, ops, runbook]
---

# CI runner pool operations runbook

Rivet's gating CI jobs (`fmt`, `clippy`, `test`, `mutation`, `Kani`,
Playwright) all run on the self-hosted pool labeled
`[self-hosted, linux, x64, <class>]`. That pool is a **single point of
failure**: when it goes offline, every gate queues indefinitely with no
fallback, and — without the liveness workflow that fires on GitHub-hosted
runners — the failure is invisible to anyone not watching the queue by
hand. This document is the runbook for the two situations that matter:

1. The scheduled liveness workflow raised the tracker issue.
2. You are diagnosing the pool by hand (liveness workflow missing, or
   confirming what it reported).

Not covered here: the liveness workflow itself (see
`.github/workflows/runner-liveness.yml`), and the routing-fast-gates-to-
GitHub-hosted option (open under #509, tracked separately).

> **Reminder (REQ-051).** Pre-commit hooks are convenience; CI is the
> gate. Anything that skips CI does not have a traceability claim behind
> it. If the pool is down, treat merges to `main` with the same caution
> you would a `--no-verify` commit — the four-gate pipeline
> (`pre-commit → bazel → CI → verify-matrix`) is running on three legs.

## Runner classes

Three self-hosted classes are pinned by workflows:

| Label | Purpose | Jobs that use it |
| --- | --- | --- |
| `light` | Fast, low-RAM checks — `fmt`, `yaml-lint`, `validate`, `clippy`, doc renders. | The bulk of `ci.yml`'s per-PR gates. |
| `rust-cpu` | CPU-heavy Rust builds — `test`, `Kani`, coverage runs. | Test / proof shards. |
| `lean-mem` | Memory-constrained shards (host-level `MemoryHigh=32 GiB`, adding `MemoryMax=~48 GiB` per #590). | `mutants-core`, Miri. Never route a job here without a per-process memory cap. |

A single class going offline while the others stay up produces
**partial** failure: the queued-age liveness alert still fires because
some workflows can't be scheduled, but a `runner list` may still show
online runners. Diagnose per-class, not just aggregate.

## The two diagnostic commands

`runner-liveness.yml` runs these on a `*/15 * * * *` cadence; if the
tracker issue is open, these are also the commands you run by hand.

**Are runners registered and online?** (best-effort — needs the
`administration:read` scope, which the default `GITHUB_TOKEN` does not
carry):

```sh
gh api repos/pulseengine/rivet/actions/runners \
  --jq '{total: .total_count,
         online: [.runners[] | select(.status=="online")] | length,
         classes: [.runners[] | .labels[].name] | unique}'
```

- `total: 0` → pool is not registered with the repo at all (likely
  org-level pool — the repo-scoped API returns empty; check the org's
  runner page instead).
- `total > 0`, `online: 0` → runners are registered but their agent
  processes are down or offline. Restart on the runner host is usually
  enough; see "Bring the pool back" below.
- `online > 0` but no jobs picking up → check the queued-age query below;
  runners are online but not accepting the queued job's label set (label
  mismatch or an org-level concurrency cap).

**Are jobs stuck queued?** (authoritative — needs only `actions:read`,
works even when the runner list returns empty for permission reasons):

```sh
gh api repos/pulseengine/rivet/actions/runs?status=queued \
  --jq '.workflow_runs[] | "\(.id)  age=\(((now - (.created_at | fromdateiso8601)) / 60 | floor))m  \(.name) — \(.head_branch)"'
```

- Any run age over the liveness threshold (`QUEUE_THRESHOLD_MINUTES`,
  currently **30**) is the alarm shape. A single stuck run 30+ minutes
  old is enough to fire the tracker; two or more is a durable outage.
- If the oldest queued run is on `main` (a push run for a merged PR),
  the CI record for that merge is missing — the merge landed with no
  verification. Note it in the tracker issue for the next audit.

## When the liveness tracker issue is open

`runner-liveness.yml` auto-opens (and updates every 15 min, then
auto-closes on recovery) the tracker labeled `runner-down` titled
`🚨 CI runner pool liveness alert`. When it's open:

1. **Confirm the shape** — re-run the two commands above. Match against
   the tracker's most recent probe comment. If they now report the
   pool healthy, the next probe (≤ 15 min) will auto-close; no manual
   action.
2. **Identify which class is affected** — a `runner list` at `total > 0`
   with `online > 0` but jobs still queued means the class the job
   asked for (`lean-mem` / `rust-cpu` / `light`) has no live members.
3. **Bring the pool back** — see below.
4. **Post the outage window** on the tracker issue as one comment before
   it auto-closes: start time, end time, affected class, root cause if
   known. That comment becomes the durable audit record after the
   tracker closes.
5. **Note affected `main` runs** in the same comment. Any `main` push
   run that queued and expired without running is a merge that reached
   `main` without CI verification. Those need the next PR against them
   to re-exercise the same gates.

Do NOT close the tracker manually — let the next probe close it on
recovery. A manual close on a still-down pool is a false-recovery signal
and re-arms only when the pool next transitions.

## Bring the pool back

The action lives on the runner host, not this repo — outside this
repo's write surface. The steps every operator needs:

1. `ssh` to the runner host (`pulseengine-ci-<NN>`).
2. Check the runner-agent service status:
   `systemctl --user status actions.runner.pulseengine-rivet.<host>.service`
   (or `github-runner@<name>` per the host's install layout).
3. Inspect the last few log entries:
   `journalctl --user -u actions.runner.pulseengine-rivet.<host>.service -n 50 --no-pager`.
   Common failure shapes:
   - `disk full` → clear per-runner `_work/` and the shared
     `$CARGO_HOME/registry/cache/**`; see #567 for the coordination
     rules on the shared cargo state.
   - `token expired` / `Not configured` → re-register the runner via
     `./config.sh --url … --token …` (org owner has to mint the token).
   - Process alive but no jobs picking up → label mismatch (the runner
     lost or never had the class label the job asks for); re-run
     `./config.sh` with the correct `--labels`.
4. Restart the service:
   `systemctl --user restart actions.runner.pulseengine-rivet.<host>.service`.
5. Confirm via the two diagnostic commands above that the runner is
   online and jobs drain.

If more than one host is affected, work them in parallel — the tracker
issue auto-closes on the first passing probe after all classes recover.

## Escalation

- **Pool has been down > 2 hours** and no operator on the runner host is
  reachable: the maintainer's call is whether to admin-merge without CI
  or wait. Default is to wait; #509 option 2 (route fast gates to
  `ubuntu-latest`) is the durable answer here and is tracked
  separately.
- **Every host reports full disk**: coordinate the cleanup with #567
  (the shared-cargo race). Do not `rm -rf` shared registry state on any
  host while jobs are running on another — the "in-flight build
  corruption" failure mode.
- **Runners online but jobs still queue for a specific class only**:
  check whether the org-level pool has a per-class concurrency cap set
  above the actual live count.

## Related

- `.github/workflows/runner-liveness.yml` — the alerting workflow itself.
- #509 — parent issue; options 1 (liveness) shipped, option 2 (fallback
  routing) open, option 3 (this runbook).
- #567 — self-hosted-runner disk exhaustion / shared-`CARGO_HOME` race.
- #590 — `rivet_core` test-binary memory shape (why `lean-mem`
  exists in the first place).
- REQ-051 — hooks are convenience; CI is the gate.
