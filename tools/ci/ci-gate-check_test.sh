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

# needs <changes-result> <rust> <tests> <wasm> then job=result pairs;
# the detector's proofs output is $PROOFS (default true)
needs() {
  local cr="$1" rust="$2" tests="$3" wasm="$4" proofs="${PROOFS:-true}"; shift 4
  {
    printf '{"changes":{"result":"%s","outputs":{"rust":"%s","tests":"%s","wasm":"%s","proofs":"%s"}}' "$cr" "$rust" "$tests" "$wasm" "$proofs"
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
PROOFS_OK="kani=success verus=success rocq=success trust-ledger=success"

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

# Proof jobs (v0.44.0 bet 2a, REQ-420): kani skips only when rust=false,
# verus/rocq/trust-ledger only when proofs=false; kani/verus/rocq also skip in
# the merge queue, trust-ledger does not.
needs success true true true $ALL_OK $PROOFS_OK
expect pass pull_request "proof jobs succeeded"
PROOFS=false needs success false false false fmt=skipped clippy=skipped test=skipped msrv=skipped semver-checks=skipped deny=skipped docs-check=success yaml-lint=success traceability=success wasm-seam=skipped supply-chain=skipped kani=skipped verus=skipped rocq=skipped trust-ledger=skipped
expect pass pull_request "docs change: proof jobs skipped by the detector pass"
PROOFS=false needs success true true true $ALL_OK kani=skipped verus=skipped rocq=skipped trust-ledger=skipped
expect fail pull_request "kani skipped although rust=true"
needs success true true true $ALL_OK kani=success verus=success rocq=skipped trust-ledger=success
expect fail pull_request "rocq skipped although proofs=true"
needs success true true true $ALL_OK kani=success verus=success rocq=success trust-ledger=skipped
expect fail pull_request "trust-ledger skipped although proofs=true"
needs success true true true fmt=success clippy=success test=success msrv=success semver-checks=skipped deny=success docs-check=success yaml-lint=success traceability=success wasm-seam=success supply-chain=skipped kani=skipped verus=skipped rocq=skipped trust-ledger=success
expect pass merge_group "queue run: kani, verus and rocq skip by event"
needs success true true true fmt=success clippy=success test=success msrv=success semver-checks=skipped deny=success docs-check=success yaml-lint=success traceability=success wasm-seam=success supply-chain=skipped kani=skipped verus=skipped rocq=skipped trust-ledger=skipped
expect fail merge_group "queue run: trust-ledger has no event exclusion"
for j in kani verus rocq trust-ledger; do
  needs success true true true $ALL_OK $PROOFS_OK
  sed -i.bak "s/\"$j\":{\"result\":\"success\"/\"$j\":{\"result\":\"failure\"/" "$tmp/needs.json"
  expect fail pull_request "a failed $j fails the gate"
done

if [ "$fails" -ne 0 ]; then echo "ci-gate-check_test: $fails failure(s)"; exit 1; fi
echo "ci-gate-check_test: all passed"
