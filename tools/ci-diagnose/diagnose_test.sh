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

  # Two args must behave exactly as before: callers that cannot supply the
  # needs graph still get the old answer rather than a silent reclassification.
  check "no needs graph supplied falls back" "hosted-starved" \
    "$(classify_stall "$runners_nearly_idle" "$jobs_release_queued")"
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
test_classify_failure
echo
if [ "$fails" -eq 0 ]; then echo "ci-diagnose: all cases pass"; else echo "ci-diagnose: $fails case(s) FAILED"; fi
exit "$fails"
