#!/usr/bin/env bash
# Regression test for verify_archive_size.sh (#671 size guard).
#
# Coverage:
#   1. Small archive under the cap -> exit 0.
#   2. Archive over the cap -> exit 1 with #671 marker in message.
#   3. Cap of 0 disables the guard (any size -> exit 0).
#   4. Missing archive -> exit 2 (usage error).
#   5. Reference report shape (~2 MB) sails well under the 50 MB default.
#   6. GITHUB_STEP_SUMMARY is appended only on the pass path.

set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
GUARD="${HERE}/verify_archive_size.sh"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

pass=0
fail=0

expect() {
    local name="$1" expected_rc="$2"
    shift 2
    local out rc
    out="$("$@" 2>&1)" && rc=0 || rc=$?
    if [ "$rc" -eq "$expected_rc" ]; then
        echo "  PASS: $name (rc=$rc)"
        pass=$((pass + 1))
    else
        echo "  FAIL: $name (rc=$rc, expected $expected_rc)"
        # shellcheck disable=SC2001 # sed needed for per-line ^ anchor
        echo "$out" | sed 's/^/    | /'
        fail=$((fail + 1))
    fi
    LAST_OUT="$out"
}

# Case 1 — small archive under cap.
head -c 1000000 /dev/zero > "$TMP/small.tar.gz"  # 1 MB
GITHUB_STEP_SUMMARY="$TMP/summary1" expect "1MB under 50MB cap" 0 "$GUARD" "$TMP/small.tar.gz" 50
grep -q "compliance report size: 1 MB" <<<"$LAST_OUT" || { echo "  FAIL: expected size line missing"; fail=$((fail + 1)); }
[ -s "$TMP/summary1" ] || { echo "  FAIL: step summary not written on green"; fail=$((fail + 1)); }
grep -q "1 MB" "$TMP/summary1" || { echo "  FAIL: step summary missing size"; fail=$((fail + 1)); }

# Case 2 — archive over cap (simulate an 800 MB regression by capping tiny archive at 1 MB).
head -c 5000000 /dev/zero > "$TMP/big.tar.gz"  # 5 MB
GITHUB_STEP_SUMMARY="$TMP/summary2" expect "5MB over 1MB cap fails" 1 "$GUARD" "$TMP/big.tar.gz" 1
grep -q "exceeds 1 MB cap" <<<"$LAST_OUT" || { echo "  FAIL: expected 'exceeds N MB cap' message"; fail=$((fail + 1)); }
grep -q "#671" <<<"$LAST_OUT" || { echo "  FAIL: message must reference #671 for traceability"; fail=$((fail + 1)); }
[ ! -s "$TMP/summary2" ] || { echo "  FAIL: step summary written on red (should skip)"; fail=$((fail + 1)); }

# Case 3 — cap == 0 disables the guard.
head -c 900000000 /dev/zero > "$TMP/huge.tar.gz"  # 900 MB (worst-case #671 shape).
expect "cap=0 disables guard on 900MB archive" 0 "$GUARD" "$TMP/huge.tar.gz" 0
grep -q "size guard disabled" <<<"$LAST_OUT" || { echo "  FAIL: expected disable notice"; fail=$((fail + 1)); }

# Case 4 — missing archive is a usage error.
expect "missing archive -> rc=2" 2 "$GUARD" "$TMP/does-not-exist.tar.gz" 50

# Case 5 — reference report shape (v0.13.0+ ships 1-2 MB) sails under the 50 MB default.
head -c 2000000 /dev/zero > "$TMP/ref.tar.gz"  # 2 MB
expect "2MB reference report under 50MB default" 0 "$GUARD" "$TMP/ref.tar.gz" 50

# Case 6 — bad-args usage error.
expect "no args -> usage rc=2" 2 "$GUARD"

echo
echo "results: $pass passed, $fail failed"
[ "$fail" -eq 0 ]
