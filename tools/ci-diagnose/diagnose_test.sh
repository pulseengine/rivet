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
