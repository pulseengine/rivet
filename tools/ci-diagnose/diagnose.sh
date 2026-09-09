#!/usr/bin/env bash
# Honest classifiers for the two CI signals that were sending readers to the
# wrong conclusion. Sourced by the liveness workflow and by diagnose_test.sh.
#
# Both exist because a duration or a red X, on its own, does not identify what
# went wrong — and the guidance built on them named the wrong cause. See
# REQ-316 and REQ-317.

# Labels every self-hosted job carries; they select the pool, not a capability,
# so they are not what makes a runner capable of taking a given job.
_CI_GENERIC_LABELS="self-hosted linux x64"

# classify_stall <runners_json> <queued_jobs_json> [<all_jobs_json>] [<needs_json>]
#
# Emits one of: no-queue | dependency-blocked | hosted-starved | pool-offline |
#               label-saturated | capacity-available
#
# The ordering matters. Dependency waits are removed FIRST because a job
# waiting on its `needs` is not stalled at all, and every capacity answer
# given about it is a cause the classifier cannot observe (REQ-325). Hosted
# starvation is checked next because the self-hosted numbers are irrelevant
# when every queued job is `ubuntu-latest`, and reporting them is what made
# the old alert misleading: hosted capacity appears in the runners API at no
# scope, so no runner count can see it.
#
# `all_jobs_json` is the run's jobs with their `status`; `needs_json` maps a
# job name to its `needs` list, read from the workflow definition — the jobs
# API does not expose `needs`. Both are optional: with two arguments the
# function answers exactly as it did before, so a caller that cannot supply
# the graph gets the old answer rather than a silent reclassification.
classify_stall() {
  local runners_json="$1" jobs_json="$2" all_jobs_json="${3:-}" needs_json="${4:-}"
  local queued_count
  queued_count=$(jq -r 'length' <<<"$jobs_json")
  [ "${queued_count:-0}" -eq 0 ] && { echo "no-queue"; return; }

  # Drop jobs that are merely waiting their turn. On 2026-09-06 `create-release`
  # sat queued behind `build-compliance` while the fleet was idle (online=12,
  # busy=1) and this returned `hosted-starved`, which would have auto-filed an
  # issue blaming GitHub capacity for a dependency wait.
  if [ -n "$all_jobs_json" ] && [ -n "$needs_json" ]; then
    local waiting
    # A need ending in `*` is a matrix job, declared once and reported by the
    # API under many concrete names; it is matched by prefix. A need matching
    # NO job is treated as complete, so an unknown or stale name can only cost
    # the dependency-blocked answer, never invent one.
    waiting=$(jq -c --argjson all "$all_jobs_json" --argjson needs "$needs_json" '
        def incomplete($n):
          [ $all[]
            | select(if ($n | endswith("*"))
                     then (.name | startswith($n[:-1]))
                     else .name == $n end)
            | select(.status != "completed") ] | length > 0;
        [ .[]
          | . as $job
          | select([ ($needs[$job.name] // [])[] | select(incomplete(.)) ] | length == 0)
        ]' <<<"$jobs_json")
    if [ "$(jq -r 'length' <<<"$waiting")" -eq 0 ]; then
      echo "dependency-blocked"
      return
    fi
    jobs_json="$waiting"
  fi

  local selfhosted_count
  selfhosted_count=$(jq -r '[.[] | select(any(.labels[]; . == "self-hosted"))] | length' <<<"$jobs_json")
  if [ "${selfhosted_count:-0}" -eq 0 ]; then
    echo "hosted-starved"
    return
  fi

  local online
  online=$(jq -r '[.runners[] | select(.status == "online")] | length' <<<"$runners_json")
  if [ "${online:-0}" -eq 0 ]; then
    echo "pool-offline"
    return
  fi

  # Capability is per LABEL. A global idle count says nothing: on 2026-09-02
  # the pool read online=12 busy=8 — 33% headroom — while every `rust-cpu` job
  # queued, because the four idle runners carried only `lean-mem`.
  local required
  required=$(jq -r --arg generic "$_CI_GENERIC_LABELS" '
      ($generic | split(" ")) as $g
      | [.[] | select(any(.labels[]; . == "self-hosted")) | .labels[]]
      | map(ascii_downcase) | unique | map(select(. as $l | ($g | index($l)) | not))
      | join(" ")' <<<"$jobs_json")

  local capable
  capable=$(jq -r --arg req "$required" '
      ($req | split(" ") | map(select(length > 0))) as $need
      | [.runners[]
         | select(.status == "online" and .busy == false)
         | (.labels | map(.name | ascii_downcase)) as $have
         | select(($need - $have) | length == 0)]
      | length' <<<"$runners_json")

  if [ "${capable:-0}" -gt 0 ]; then
    echo "capacity-available"
  else
    echo "label-saturated"
  fi
}

# classify_failure <job_json>
#
# Emits one of: job-passed | runner-vanished | setup-failed | job-failed
#
# A job that failed with NO failed step is the fleet-restart signature: the
# runner went away mid-run and the steps end `skipped`. GitHub renders that
# identically to a broken test, which is how a wrong cause got published on
# #855. A step that failed with work still SKIPPED after it never ran the work
# at all — calling that a proof break, as happened repeatedly with Kani, is a
# different wrong answer.
classify_failure() {
  local job_json="$1"
  local conclusion
  conclusion=$(jq -r '.conclusion // ""' <<<"$job_json")
  [ "$conclusion" != "failure" ] && { echo "job-passed"; return; }

  local failed_idx
  failed_idx=$(jq -r '[.steps[]? | .conclusion] | index("failure") // -1' <<<"$job_json")
  if [ "${failed_idx:--1}" -lt 0 ]; then
    echo "runner-vanished"
    return
  fi

  local skipped_after
  skipped_after=$(jq -r --argjson i "$failed_idx" '
      [.steps[$i + 1 :][]? | select(.conclusion == "skipped")] | length' <<<"$job_json")
  if [ "${skipped_after:-0}" -gt 0 ]; then
    echo "setup-failed"
  else
    echo "job-failed"
  fi
}
