#!/usr/bin/env bash
# CI Gate's verdict over its needs (ci.yml `ci-gate`).
#
# Usage: ci-gate-check.sh <needs.json> <event_name>
#   needs.json  the gate's `${{ toJSON(needs) }}`
#   event_name  github.event_name
#
# GitHub reports a skipped job as passing, so a skip is accepted only when
# its reason is known: the change detector ran, and either the detector
# output that gates the job is "false", or the job's own event condition
# excludes this event. Any other skip fails, as does any result other than
# success or skipped. Keep skip_output and skip_events in step with the
# jobs' `if:` lines; tools/ci/ci-gate-check_test.sh covers the rules.
set -uo pipefail

needs="${1:?usage: ci-gate-check.sh <needs.json> <event_name>}"
event="${2:?usage: ci-gate-check.sh <needs.json> <event_name>}"

# job -> the `changes` output its `if:` reads (case, not an associative
# array, so the script and its test run on macOS's bash 3.2 too)
skip_output() {
  case "$1" in
    fmt | clippy | msrv | deny | semver-checks) echo rust ;;
    test | supply-chain) echo tests ;;
    wasm-seam) echo wasm ;;
  esac
}
# job -> events its `if:` excludes, space-separated
skip_events() {
  case "$1" in
    semver-checks) echo "push merge_group schedule workflow_dispatch" ;;
    supply-chain) echo "merge_group" ;;
  esac
}

jq -r 'to_entries[] | "  \(.key): \(.value.result)"' "$needs"

changes=$(jq -r '.changes.result // "absent"' "$needs")
if [ "$changes" != success ]; then
  echo "::error::CI Gate: change detector result is '$changes', not success; skips cannot be trusted"
  exit 1
fi

bad=0
while IFS=$'\t' read -r job result; do
  case "$result" in
    success) continue ;;
    skipped)
      key="$(skip_output "$job")"
      if [ -n "$key" ] && [ "$(jq -r --arg k "$key" '.changes.outputs[$k] // "absent"' "$needs")" = false ]; then
        continue
      fi
      case " $(skip_events "$job") " in
        *" $event "*) continue ;;
      esac
      echo "::error::CI Gate: $job was skipped, but the detector did not exclude it${key:+ ($key=$(jq -r --arg k "$key" '.changes.outputs[$k] // "absent"' "$needs"))} and $event is not an excluded event"
      bad=1
      ;;
    *)
      echo "::error::CI Gate: $job = $result"
      bad=1
      ;;
  esac
done < <(jq -r 'to_entries[] | select(.key != "changes") | "\(.key)\t\(.value.result)"' "$needs")

[ "$bad" = 0 ] || exit 1
echo "CI Gate: every gated job succeeded or was skipped for a recorded reason"
