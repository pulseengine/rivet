#!/usr/bin/env bash
# Gate test for the Kani proof selection (REQ-391 / #839).
# rivet: verifies REQ-391
#
# Kani is continue-on-error and outside CI Gate, so a regression in WHICH
# proofs run is invisible there. REQ-391's decision (maintainer, 2026-10-08)
# is that CI runs only harnesses that verify: every harness that cannot
# finish is parked behind cfg(kani_slow), and the CI job never sets that cfg.
# Un-parking a harness, or CI building with --cfg kani_slow, puts a proof back
# in the default run that times out and turns Kani red for infrastructure
# reasons. This test fails on either, and on the timeout/codegen guards that
# keep a stuck harness from eating the whole job. Static checks only: whether
# the one remaining harness verifies is Kani's verdict, not this test's.
#
# PROOFS and CI_YML override the inspected files (used for negative controls).
set -uo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
PROOFS="${PROOFS:-$ROOT/rivet-core/src/proofs.rs}"
CI_YML="${CI_YML:-$ROOT/.github/workflows/ci.yml}"

fails=0
check() { # check <name> <expected> <actual>
  if [ "$2" = "$3" ]; then
    echo "  ok   $1"
  else
    echo "  FAIL $1: expected '$2', got '$3'"
    fails=$((fails + 1))
  fi
}

# Harnesses by state: "<state> <fn name>", state = parked | active.
harnesses="$(awk '
  /^[[:space:]]*#\[cfg\(kani_slow\)\]/ { slow = 1; next }
  /^[[:space:]]*#\[kani::proof\]/      { inproof = 1; parked = slow; slow = 0; next }
  inproof && /^[[:space:]]*(pub )?fn / {
    n = $0; sub(/^[[:space:]]*(pub )?fn /, "", n); sub(/\(.*/, "", n)
    print (parked ? "parked " : "active ") n; inproof = 0; next
  }
  /^[[:space:]]*#\[/ { next }
  { slow = 0 }
' "$PROOFS")"

echo "proofs.rs harness selection"
check "harness count (27 in total)" "27" "$(printf '%s\n' "$harnesses" | grep -c .)"
check "parked behind cfg(kani_slow)" "26" "$(printf '%s\n' "$harnesses" | grep -c '^parked ')"
check "the only harness in the default run" "active proof_coverage_percentage_bounds" \
  "$(printf '%s\n' "$harnesses" | grep '^active ')"
check "every kani::proof is accounted for" \
  "$(grep -c '#\[kani::proof\]' "$PROOFS")" "$(printf '%s\n' "$harnesses" | grep -c .)"

# The Kani job, comments stripped so prose cannot satisfy or trip a check.
job="$(awk '/^  kani:/ {on=1; print; next} on && /^  [A-Za-z0-9_-]+:/ {exit} on' "$CI_YML" \
  | sed -E 's/^[[:space:]]*#.*$//; s/[[:space:]]+#.*$//')"
args="$(printf '%s\n' "$job" | grep -E '^[[:space:]]+args:' | sed -E "s/^[[:space:]]+args:[[:space:]]*//; s/'//g")"

echo "ci.yml kani job"
check "job found" "1" "$(printf '%s\n' "$job" | grep -c '^  kani:')"
check "two kani invocations" "2" "$(printf '%s\n' "$args" | grep -c .)"
check "PR path is codegen only" "-p rivet-core --only-codegen" \
  "$(printf '%s\n' "$args" | grep -- '--only-codegen')"
check "push path bounds each harness at 3m" "-p rivet-core -Z unstable-options --harness-timeout 3m" \
  "$(printf '%s\n' "$args" | grep -v -- '--only-codegen')"
check "job never enables cfg(kani_slow)" "0" "$(printf '%s\n' "$job" | grep -c 'kani_slow')"
check "job never sets RUSTFLAGS" "0" "$(printf '%s\n' "$job" | grep -c 'RUSTFLAGS')"
check "kani version pinned" "2" "$(printf '%s\n' "$job" | grep -c "kani-version: '0\.67\.0'")"
check "swap step precedes the kani steps" "1" \
  "$(printf '%s\n' "$job" | awk '/kani\.swap/ {s=NR} /kani-github-action/ && !k {k=NR} END {print (s && k && s < k) ? 1 : 0}')"

if [ "$fails" -ne 0 ]; then
  echo "kani-selection: $fails check(s) failed"
  exit 1
fi
echo "kani-selection: all checks passed"
