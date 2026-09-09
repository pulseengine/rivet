#!/usr/bin/env bash
# Oracle for tools/ci-diagnose/diagnose.sh.
#
# Both functions under test replaced a human habit that had already produced a
# published misattribution, so each case here is a real incident reduced to a
# fixture, not an invented one.
set -uo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=/dev/null
. "$HERE/diagnose.sh"

fails=0
check() { # check <name> <expected> <actual>
  if [ "$2" = "$3" ]; then
    echo "  ok   $1"
  else
    echo "  FAIL $1: expected '$2', got '$3'"
    fails=$((fails + 1))
  fi
}

# ── classify_stall ────────────────────────────────────────────────────────
# rivet: verifies REQ-317
# rivet: verifies REQ-325
# rivet: verifies REQ-342
test_classify_stall() {
  echo "classify_stall:"

  # Mode 1 — pool offline. Every runner down.
  local runners_offline='{"runners":[{"status":"offline","busy":false,"labels":[{"name":"rust-cpu"}]}]}'
  local jobs_selfhosted='[{"name":"Test","labels":["self-hosted","linux","x64","rust-cpu"]}]'
  check "pool offline" "pool-offline" \
    "$(classify_stall "$runners_offline" "$jobs_selfhosted")"

  # Mode 3 — hosted starvation. Self-hosted is idle and irrelevant; every
  # queued job is ubuntu-latest. This is the mode the probe fired on most
  # often while telling the reader to go count self-hosted runners.
  local runners_idle='{"runners":[{"status":"online","busy":false,"labels":[{"name":"rust-cpu"}]}]}'
  local jobs_hosted='[{"name":"Kani Proofs","labels":["ubuntu-latest"]}]'
  check "hosted starvation" "hosted-starved" \
    "$(classify_stall "$runners_idle" "$jobs_hosted")"

  # Mode 4 — label-partitioned saturation. The global count looks healthy
  # (1 of 2 idle) and is irrelevant: the idle runner cannot take the queued
  # job because it does not carry the label. Measured 2026-09-02.
  local runners_partitioned='{"runners":[
      {"status":"online","busy":true,"labels":[{"name":"rust-cpu"}]},
      {"status":"online","busy":false,"labels":[{"name":"lean-mem"}]}]}'
  check "label-partitioned saturation" "label-saturated" \
    "$(classify_stall "$runners_partitioned" "$jobs_selfhosted")"

  # Mode 2 — genuine saturation: the label exists and every runner carrying
  # it is busy.
  local runners_busy='{"runners":[{"status":"online","busy":true,"labels":[{"name":"rust-cpu"}]}]}'
  check "pool saturated" "label-saturated" \
    "$(classify_stall "$runners_busy" "$jobs_selfhosted")"

  # Healthy: capacity exists for the label in demand.
  check "capacity available" "capacity-available" \
    "$(classify_stall "$runners_idle" "$jobs_selfhosted")"

  # Nothing queued is not a stall.
  check "nothing queued" "no-queue" \
    "$(classify_stall "$runners_idle" '[]')"

  # ── REQ-325 ────────────────────────────────────────────────────────────
  # A job waiting on its `needs` is not stalled at all, and the old
  # classifier called this one `hosted-starved` — a cause it cannot observe.
  # Reduced from the v0.36.0 release run on 2026-09-06: `create-release` sat
  # queued behind `build-compliance`, which was still running, while the
  # fleet was almost entirely idle (online=12, busy=1). Every queued job
  # carried `ubuntu-latest`, so the hosted-starvation branch fired first and
  # would have auto-filed an issue blaming GitHub capacity for a dependency
  # wait. Nothing was starved.
  local runners_nearly_idle='{"runners":[
      {"status":"online","busy":true,"labels":[{"name":"rust-cpu"}]},
      {"status":"online","busy":false,"labels":[{"name":"rust-cpu"}]},
      {"status":"online","busy":false,"labels":[{"name":"lean-mem"}]}]}'
  local jobs_release_queued='[{"name":"create-release","labels":["ubuntu-latest"]}]'
  local all_jobs_release='[
      {"name":"build-compliance","status":"in_progress"},
      {"name":"create-release","status":"queued"}]'
  local needs_release='{"create-release":["build-compliance"]}'
  check "dependency-blocked (not hosted starvation)" "dependency-blocked" \
    "$(classify_stall "$runners_nearly_idle" "$jobs_release_queued" \
                      "$all_jobs_release" "$needs_release")"

  # The same shape once the dependency HAS completed is a real hosted stall
  # again — the new branch must not swallow the mode it sits in front of.
  local all_jobs_done='[
      {"name":"build-compliance","status":"completed"},
      {"name":"create-release","status":"queued"}]'
  check "hosted starvation once needs are complete" "hosted-starved" \
    "$(classify_stall "$runners_nearly_idle" "$jobs_release_queued" \
                      "$all_jobs_done" "$needs_release")"

  # A matrix dependency: declared once as `Build ${{ matrix.target }}`,
  # reported by the API under many concrete names. Left unmatched it would
  # read as a capacity stall, which is the defect one level down.
  local all_jobs_matrix='[
      {"name":"Build x86_64-unknown-linux-gnu","status":"completed"},
      {"name":"Build aarch64-apple-darwin","status":"in_progress"},
      {"name":"create-release","status":"queued"}]'
  local needs_matrix='{"create-release":["Build *"]}'
  check "matrix dependency matched by prefix" "dependency-blocked" \
    "$(classify_stall "$runners_nearly_idle" "$jobs_release_queued" \
                      "$all_jobs_matrix" "$needs_matrix")"

  # A need naming no job at all must NOT invent a dependency wait.
  local needs_unknown='{"create-release":["a job that does not exist"]}'
  check "unknown need does not invent a block" "hosted-starved" \
    "$(classify_stall "$runners_nearly_idle" "$jobs_release_queued" \
                      "$all_jobs_release" "$needs_unknown")"

  # ── REQ-342 ────────────────────────────────────────────────────────────
  # The runner lookup needs the `administration` scope, which is NOT grantable
  # to GITHUB_TOKEN, so it 403s on every scheduled run. The probe replaced the
  # failure with an EMPTY POOL, and this returned `pool-offline` — the loudest
  # possible alarm — for a fleet that was entirely healthy. Measured on #919:
  # the alert said "0 runners online" while the org reported online=12 busy=7,
  # and the real cause was four `lean-mem` shards queued behind four busy
  # `lean-mem` runners.
  #
  # An API failure and a genuinely empty pool are indistinguishable from the
  # response BODY. Only the exit code separates them, so the caller passes an
  # empty string for "could not read it" and the classifier must refuse to name
  # a capacity cause rather than invent one.
  check "runner data unavailable is not an offline pool" "runners-unknown" \
    "$(classify_stall "" "$jobs_selfhosted")"

  # A SUCCESSFUL lookup that genuinely returns no runners is still offline —
  # the new branch must not swallow the mode it sits in front of.
  check "genuinely empty pool is still offline" "pool-offline" \
    "$(classify_stall '{"runners":[]}' "$jobs_selfhosted")"

  # Hosted starvation is decided from the queued jobs' labels alone, so it must
  # still answer even with no runner data at all.
  check "hosted starvation needs no runner data" "hosted-starved" \
    "$(classify_stall "" "$jobs_hosted")"

  # Two args must behave exactly as before: callers that cannot supply the
  # needs graph still get the old answer rather than a silent reclassification.
  check "no needs graph supplied falls back" "hosted-starved" \
    "$(classify_stall "$runners_nearly_idle" "$jobs_release_queued")"
}

# ── workflow-needs.py ─────────────────────────────────────────────────────
# The needs graph feeds classify_stall's dependency-blocked branch, and two of
# its behaviours are load-bearing in ways that fail SILENTLY: if needs are not
# resolved from job KEYS to DISPLAY names the graph matches nothing and every
# dependency wait reads as a capacity stall, and if a matrix job's templated
# name is not turned into a prefix it matches nothing either. Both leave the
# fix looking correct while doing nothing, so they are asserted here rather
# than trusted (REQ-325).
# rivet: verifies REQ-325
test_workflow_needs() {
  echo "workflow-needs.py:"
  local fixture; fixture=$(mktemp -d)
  cat > "$fixture/wf.yml" <<'YAML'
name: CI
on: [push]
jobs:
  build:
    name: Build ${{ matrix.target }}
    runs-on: ubuntu-latest
    steps: [{run: 'true'}]
  compliance:
    name: Build compliance report
    runs-on: ubuntu-latest
    steps: [{run: 'true'}]
  plain:
    runs-on: ubuntu-latest
    steps: [{run: 'true'}]
  release:
    name: Create GitHub Release
    needs: [build, compliance, plain]
    runs-on: ubuntu-latest
    steps: [{run: 'true'}]
YAML
  local out; out=$(python3 "$HERE/workflow-needs.py" "$fixture/wf.yml")

  # Keyed by the DEPENDENT's display name.
  check "keyed by display name" "true" \
    "$(jq -r 'has("Create GitHub Release")' <<<"$out")"

  # A need naming a job with a `name:` resolves to that display name, because
  # that is what the jobs API reports. Comparing raw keys matches nothing.
  check "need resolved key -> display name" "true" \
    "$(jq -r '.["Create GitHub Release"] | index("Build compliance report") != null' <<<"$out")"

  # A matrix job becomes a prefix glob; left templated it matches no job.
  check "matrix need becomes a prefix glob" "true" \
    "$(jq -r '.["Create GitHub Release"] | index("Build *") != null' <<<"$out")"

  # A job with no `name:` keeps its key.
  check "unnamed job keeps its key" "true" \
    "$(jq -r '.["Create GitHub Release"] | index("plain") != null' <<<"$out")"

  # Jobs without `needs` do not appear at all.
  check "job without needs is absent" "false" \
    "$(jq -r 'has("Build compliance report")' <<<"$out")"

  # A missing file degrades to an empty graph, never an error — an absent
  # graph must cost the dependency-blocked answer, not break the probe.
  check "missing file degrades to {}" "{}" \
    "$(python3 "$HERE/workflow-needs.py" "$fixture/does-not-exist.yml")"
  check "no argument degrades to {}" "{}" \
    "$(python3 "$HERE/workflow-needs.py")"

  rm -rf "$fixture"
}

# ── classify_failure ──────────────────────────────────────────────────────
# rivet: verifies REQ-316
test_classify_failure() {
  echo "classify_failure:"

  # The fleet-restart signature: the JOB failed but no STEP did — they end
  # `skipped`. Indistinguishable from a broken test in the UI, which is how
  # #855 got a wrong diagnosis published.
  local shutdown='{"conclusion":"failure","steps":[
      {"name":"Set up job","conclusion":"success"},
      {"name":"Run tests","conclusion":"skipped"},
      {"name":"Complete job","conclusion":"success"}]}'
  check "runner went away" "runner-vanished" "$(classify_failure "$shutdown")"

  # A real failure names the step that failed.
  local real='{"conclusion":"failure","steps":[
      {"name":"Set up job","conclusion":"success"},
      {"name":"Run tests","conclusion":"failure"}]}'
  check "genuine test failure" "job-failed" "$(classify_failure "$real")"

  # Kani's actual shape: the install ACTION failed, so the proofs never ran.
  # Reported as a failure all session; it is a setup failure, and calling it a
  # proof break was wrong.
  local setup='{"conclusion":"failure","steps":[
      {"name":"Set up job","conclusion":"success"},
      {"name":"Run model-checking/kani-github-action@v1","conclusion":"failure"},
      {"name":"Run cargo kani -p rivet-core","conclusion":"skipped"}]}'
  check "setup failed, work skipped" "setup-failed" "$(classify_failure "$setup")"

  check "success is not a failure" "job-passed" \
    "$(classify_failure '{"conclusion":"success","steps":[]}')"
}

test_classify_stall
test_workflow_needs
test_classify_failure
echo
if [ "$fails" -eq 0 ]; then echo "ci-diagnose: all cases pass"; else echo "ci-diagnose: $fails case(s) FAILED"; fi
exit "$fails"
