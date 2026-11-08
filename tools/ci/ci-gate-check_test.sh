#!/usr/bin/env bash
# Oracle for tools/ci/ci-gate-check.sh: CI Gate accepts a skip only for a
# recorded reason. The defect guarded against is a gate that reads every
# skip as a pass (temper `aggregate_accepts_skip`), so most cases are
# negative controls: each must FAIL.
# rivet: verifies REQ-412
set -uo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
CHECK="$HERE/ci-gate-check.sh"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
fails=0

# needs <changes-result> <rust> <tests> <wasm> then job=result pairs
needs() {
  local cr="$1" rust="$2" tests="$3" wasm="$4"; shift 4
  {
    printf '{"changes":{"result":"%s","outputs":{"rust":"%s","tests":"%s","wasm":"%s"}}' "$cr" "$rust" "$tests" "$wasm"
    for kv in "$@"; do printf ',"%s":{"result":"%s","outputs":{}}' "${kv%%=*}" "${kv#*=}"; done
    printf '}'
  } > "$tmp/needs.json"
}
expect() { # expect <pass|fail> <event> <name>
  if bash "$CHECK" "$tmp/needs.json" "$2" > "$tmp/log" 2>&1; then got=pass; else got=fail; fi
  if [ "$got" = "$1" ]; then echo "  ok   $3"
  else echo "  FAIL $3 (expected $1, got $got)"; sed 's/^/       | /' "$tmp/log"; fails=$((fails + 1)); fi
}
ALL_OK="fmt=success clippy=success test=success msrv=success semver-checks=success deny=success docs-check=success yaml-lint=success traceability=success wasm-seam=success supply-chain=success"

echo "ci-gate-check.sh:"
needs success true true true $ALL_OK
expect pass pull_request "every job succeeded"

needs failure true true true $ALL_OK
expect fail pull_request "detector failed: nothing can be trusted"
needs skipped true true true $ALL_OK
expect fail pull_request "detector skipped: nothing can be trusted"

needs success false false false fmt=skipped clippy=skipped test=skipped msrv=skipped semver-checks=skipped deny=skipped docs-check=success yaml-lint=success traceability=success wasm-seam=skipped supply-chain=skipped
expect pass pull_request "non-code change: skips the detector excluded pass"

needs success false true false fmt=skipped clippy=skipped test=success msrv=skipped semver-checks=skipped deny=skipped docs-check=success yaml-lint=success traceability=success wasm-seam=skipped supply-chain=success
expect pass pull_request "data change: rust jobs skipped, tests and vet ran"

needs success true true true fmt=skipped clippy=success test=success msrv=success semver-checks=success deny=success docs-check=success yaml-lint=success traceability=success wasm-seam=success supply-chain=success
expect fail pull_request "fmt skipped although the detector said rust=true"
needs success false true false fmt=skipped clippy=skipped test=skipped msrv=skipped semver-checks=skipped deny=skipped docs-check=success yaml-lint=success traceability=success wasm-seam=skipped supply-chain=success
expect fail pull_request "test skipped although the detector said tests=true"
needs success true true true $ALL_OK
sed -i.bak 's/"docs-check":{"result":"success"/"docs-check":{"result":"skipped"/' "$tmp/needs.json"
expect fail pull_request "a job no detector gates (docs-check) skipped"

needs success true true true fmt=success clippy=success test=success msrv=success semver-checks=skipped deny=success docs-check=success yaml-lint=success traceability=success wasm-seam=success supply-chain=skipped
expect pass merge_group "queue run: semver-checks and supply-chain skip by event"
expect fail pull_request "the same skips on a pull request fail"

needs success true true true $ALL_OK
sed -i.bak 's/"test":{"result":"success"/"test":{"result":"failure"/' "$tmp/needs.json"
expect fail pull_request "a failed job fails the gate"
needs success true true true $ALL_OK
sed -i.bak 's/"clippy":{"result":"success"/"clippy":{"result":"cancelled"/' "$tmp/needs.json"
expect fail pull_request "a cancelled job fails the gate"

if [ "$fails" -ne 0 ]; then echo "ci-gate-check_test: $fails failure(s)"; exit 1; fi
echo "ci-gate-check_test: all passed"
