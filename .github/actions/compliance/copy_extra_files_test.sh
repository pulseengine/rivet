#!/usr/bin/env bash
# Oracle for copy_extra_files.sh (REQ-371).
#
# Every case here is a way the bundle can end up MISSING a document while the
# job reports success — which is the defect being fixed, one level down.
set -uo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
SCRIPT="$HERE/copy_extra_files.sh"

fails=0
check() { # check <name> <expected> <actual>
  if [ "$2" = "$3" ]; then
    echo "  ok   $1"
  else
    echo "  FAIL $1: expected '$2', got '$3'"
    fails=$((fails + 1))
  fi
}

work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT
mkdir -p "$work/bundle"
printf '# Release note — v0.39.0\n' > "$work/note.md"
printf 'sbom\n' > "$work/sbom.json"

# rivet: verifies REQ-371
echo "copy_extra_files:"

# The happy path: the note lands in the bundle under its basename.
bash "$SCRIPT" "$work/bundle" "$work/note.md" > /dev/null 2>&1
check "copies a requested file" "0" "$?"
check "  and it is IN the bundle" "0" "$([ -f "$work/bundle/note.md" ]; echo $?)"
check "  with its content intact" "# Release note — v0.39.0" "$(cat "$work/bundle/note.md")"

# Several files, and a YAML block scalar's blank lines and indentation.
rm -rf "${work:?}/bundle"; mkdir -p "$work/bundle"
bash "$SCRIPT" "$work/bundle" "$(printf '  %s\n\n  %s\n' "$work/note.md" "$work/sbom.json")" > /dev/null 2>&1
check "handles indentation and blank lines" "0" "$?"
check "  both files copied" "2" "$(ls "$work/bundle" | wc -l | tr -d ' ')"

# THE CENTRAL CASE. A requested file that does not exist must FAIL. Skipping
# it would produce a bundle that silently lacks the document it advertises —
# exactly the defect REQ-371 is about.
rm -rf "${work:?}/bundle"; mkdir -p "$work/bundle"
out="$(bash "$SCRIPT" "$work/bundle" "$work/does-not-exist.md" 2>&1)"
check "a MISSING file fails, never skips" "1" "$?"
check "  and names the file" "0" "$(printf '%s' "$out" | grep -qF 'does-not-exist.md'; echo $?)"

# Whitespace-only is NOTHING REQUESTED, not a failure. A YAML block scalar
# with no entries and one with blank lines are indistinguishable, so reading
# whitespace as "the caller expected a file" would break every caller that
# passes an empty input. The protection against a silently-absent document is
# the per-entry missing-file check above, not this.
rm -rf "${work:?}/bundle"; mkdir -p "$work/bundle"
bash "$SCRIPT" "$work/bundle" "$(printf '   \n\n  \n')" > /dev/null 2>&1
check "whitespace-only list is a no-op" "0" "$?"
check "  and copies nothing" "0" "$(ls "$work/bundle" | wc -l | tr -d ' ')"

# An EMPTY request is a genuine no-op — callers that want no extras must not
# be broken by this.
rm -rf "${work:?}/bundle"; mkdir -p "$work/bundle"
bash "$SCRIPT" "$work/bundle" "" > /dev/null 2>&1
check "empty request is a clean no-op" "0" "$?"
check "  and copies nothing" "0" "$(ls "$work/bundle" | wc -l | tr -d ' ')"

# Overwriting a bundle file would silently replace audit evidence.
rm -rf "${work:?}/bundle"; mkdir -p "$work/bundle"
printf 'original\n' > "$work/bundle/note.md"
bash "$SCRIPT" "$work/bundle" "$work/note.md" > /dev/null 2>&1
check "refuses to overwrite a bundle file" "1" "$?"
check "  and the original survives" "original" "$(cat "$work/bundle/note.md")"

# A destination that is not a directory must fail loudly rather than create it.
# Asserting only the exit code is NOT enough and a negative control proved it:
# without the guard, `cp` fails anyway and the script still exits 1, so the
# test passed with the guard deleted. The guard exists to name the destination
# instead of emitting a bare cp error, so that is what gets asserted.
out="$(bash "$SCRIPT" "$work/nope" "$work/note.md" 2>&1)"
check "missing destination fails" "1" "$?"
check "  and says the DESTINATION is wrong" "0" \
  "$(printf '%s' "$out" | grep -qF 'destination'; echo $?)"
check "  and names it" "0" "$(printf '%s' "$out" | grep -qF "$work/nope"; echo $?)"

if [ "$fails" -ne 0 ]; then
  echo "FAILED: $fails check(s)"
  exit 1
fi
echo "all copy_extra_files checks passed"
