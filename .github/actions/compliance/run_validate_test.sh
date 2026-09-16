#!/usr/bin/env bash
# Regression test for run_validate.sh (#953 exit-code gate).
#
# Coverage:
#   1. `rivet validate` exits 0 -> script exits 0, writes result=PASS.
#   2. `rivet validate` exits 1 -> script exits 1, writes result=FAIL,
#      even when its stdout contains the string "Result: PASS" (the
#      #953 grep-stdout fall-through).
#   3. `rivet validate` panics with no output -> script exits with the
#      panic's rc, writes result=FAIL (the #953 silent-panic-still-green
#      fall-through).
#   4. Validate's stdout is echoed verbatim so the CI log stays useful.
#   5. GITHUB_OUTPUT unset -> script still runs (local invocation) and
#      returns the underlying rc.
#   6. Missing project-dir is a usage error (rc=2).

set -uo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCRIPT="${HERE}/run_validate.sh"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

pass=0
fail=0

# Install a fake `rivet` on PATH. The script under test invokes `rivet
# validate` unqualified, so a shim first on PATH is how we control what
# the script sees. Each case rewrites the shim.
BIN="$TMP/bin"
mkdir -p "$BIN"
export PATH="$BIN:$PATH"

# A project-dir that exists (contents don't matter — `rivet` is mocked).
PROJ="$TMP/proj"
mkdir -p "$PROJ"

write_shim() {
    local exit_code="$1" stdout="$2"
    cat > "$BIN/rivet" <<EOF
#!/usr/bin/env bash
# Fake rivet for run_validate_test.sh.
if [ "\${1:-}" = "validate" ]; then
    printf '%s' "$stdout"
    exit $exit_code
fi
echo "unexpected rivet invocation: \$*" >&2
exit 99
EOF
    chmod +x "$BIN/rivet"
}

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

read_output() {
    # $GITHUB_OUTPUT is a KEY=VALUE file. Return the value for key $1, or
    # empty when the key is not present.
    local key="$1" file="$2"
    [ -f "$file" ] || return 0
    grep -E "^${key}=" "$file" | tail -1 | cut -d= -f2-
}

# Case 1 — validate green.
write_shim 0 "Result: PASS
Validated 883 artifacts."
GITHUB_OUTPUT="$TMP/out1"; : > "$GITHUB_OUTPUT"
GITHUB_OUTPUT="$TMP/out1" expect "validate rc=0 -> script rc=0" 0 "$SCRIPT" "$PROJ"
[ "$(read_output result "$TMP/out1")" = "PASS" ] || { echo "  FAIL: expected result=PASS in \$GITHUB_OUTPUT"; fail=$((fail + 1)); }
grep -q "Result: PASS" <<<"$LAST_OUT" || { echo "  FAIL: validate stdout not echoed"; fail=$((fail + 1)); }

# Case 2 — validate red but its stdout still mentions "Result: PASS" (the
# #953 grep-stdout fall-through). The prior code emitted result=PASS and
# exited 0; this run must emit result=FAIL and propagate rc=1.
write_shim 1 "REQ-042: coverage missing
Compare with previous Result: PASS
Result: FAIL"
GITHUB_OUTPUT="$TMP/out2"; : > "$GITHUB_OUTPUT"
GITHUB_OUTPUT="$TMP/out2" expect "validate rc=1 with 'Result: PASS' in body -> script rc=1" 1 "$SCRIPT" "$PROJ"
[ "$(read_output result "$TMP/out2")" = "FAIL" ] || { echo "  FAIL: expected result=FAIL (was $(read_output result "$TMP/out2"))"; fail=$((fail + 1)); }

# Case 3 — validate panics with no output (the #953 silent-panic-still-green
# fall-through). Non-zero rc must fail the step; no "Result:" line in
# stdout must still yield FAIL.
write_shim 101 ""
GITHUB_OUTPUT="$TMP/out3"; : > "$GITHUB_OUTPUT"
GITHUB_OUTPUT="$TMP/out3" expect "validate rc=101 empty output -> script rc=101" 101 "$SCRIPT" "$PROJ"
[ "$(read_output result "$TMP/out3")" = "FAIL" ] || { echo "  FAIL: expected result=FAIL on empty panic"; fail=$((fail + 1)); }

# Case 4 — echoed stdout is preserved verbatim (multi-line) so CI logs
# still show what validate said.
write_shim 0 "line1
line2
Result: PASS"
GITHUB_OUTPUT="$TMP/out4"; : > "$GITHUB_OUTPUT"
GITHUB_OUTPUT="$TMP/out4" expect "multi-line stdout echoed" 0 "$SCRIPT" "$PROJ"
grep -q "^line1$" <<<"$LAST_OUT" || { echo "  FAIL: expected 'line1' in echoed output"; fail=$((fail + 1)); }
grep -q "^line2$" <<<"$LAST_OUT" || { echo "  FAIL: expected 'line2' in echoed output"; fail=$((fail + 1)); }

# Case 5 — GITHUB_OUTPUT unset (local invocation) must not crash.
write_shim 0 "Result: PASS"
unset GITHUB_OUTPUT
expect "GITHUB_OUTPUT unset -> local invocation still works" 0 "$SCRIPT" "$PROJ"

# Case 6 — missing project-dir is a usage error.
write_shim 0 "Result: PASS"
expect "missing project-dir -> rc=2" 2 "$SCRIPT" "$TMP/does-not-exist"

echo
echo "results: $pass passed, $fail failed"
[ "$fail" -eq 0 ]
