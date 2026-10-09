#!/usr/bin/env bash
# Oracle for tools/ci/traceability-ratchet.py (REQ-389). Needs a rivet
# binary: RIVET=path/to/rivet bash tools/ci/traceability-ratchet_test.sh
#
# The defect guarded against is a ratchet that cannot fire: promoting a
# requirement to implemented with no verification must fail, and the
# unchanged, draft-only and evidence-carrying cases must pass.
set -uo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
RATCHET="$HERE/traceability-ratchet.py"
RIVET="${RIVET:?set RIVET to a rivet binary}"

tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

fails=0
check() { # check <name> <expected> <actual>
  if [ "$2" = "$3" ]; then
    echo "  ok   $1"
  else
    echo "  FAIL $1: expected '$2', got '$3'"
    fails=$((fails + 1))
  fi
}

"$RIVET" init --dir "$tmp/base" >/dev/null 2>&1 || { echo "rivet init failed"; exit 2; }
reqs=artifacts/requirements.yaml

# fresh <name>: a copy of the base tree to edit as a head.
fresh() { rm -rf "$tmp/$1"; cp -R "$tmp/base" "$tmp/$1"; }
# promote <tree>: REQ-001 draft -> implemented.
promote() {
  python3 - "$1/$reqs" <<'PY'
import sys
p = sys.argv[1]
t = open(p).read()
open(p, "w").write(t.replace("status: draft", "status: implemented", 1))
PY
}
ratchet() { python3 "$RATCHET" "$RIVET" "$tmp/base" "$tmp/$1" >"$tmp/$1.out" 2>&1; echo $?; }

echo "traceability ratchet"
fresh same
check "an unchanged tree passes" "0" "$(ratchet same)"

fresh draft
cat >>"$tmp/draft/$reqs" <<'EOF'

  - id: REQ-002
    type: requirement
    title: A draft with no evidence
    status: draft
EOF
check "a new draft without evidence passes" "0" "$(ratchet draft)"

# approved carries the warning too, but only implemented and later are gated:
# work may be planned before its evidence exists.
fresh approved
python3 - "$tmp/approved/$reqs" <<'PY'
import sys
p = sys.argv[1]
t = open(p).read()
open(p, "w").write(t.replace("status: draft", "status: approved", 1))
PY
check "approving a requirement without verification passes" "0" "$(ratchet approved)"

# A rule the schema declares advisory (info) does not gate, even on an
# implemented artifact: aadl-component-has-allocation is info in aadl.yaml.
fresh advisory
python3 - "$tmp/advisory/rivet.yaml" <<'PY'
import sys
p = sys.argv[1]
t = open(p).read()
open(p, "w").write(t.replace("    - dev\n", "    - dev\n    - aadl\n", 1))
PY
cp -R "$tmp/advisory" "$tmp/advisory-base"
cat >>"$tmp/advisory/$reqs" <<'EOF'

  - id: AC-001
    type: aadl-component
    title: A component without an allocation
    status: implemented
EOF
check "an info-severity traceability finding passes" "0" \
  "$(python3 "$RATCHET" "$RIVET" "$tmp/advisory-base" "$tmp/advisory" >/dev/null 2>&1; echo $?)"

fresh promoted
promote "$tmp/promoted"
check "promoting a requirement without verification fails" "1" "$(ratchet promoted)"
if grep -q "NEW requirement-verification REQ-001" "$tmp/promoted.out"; then
  echo "  ok   the failure names the rule and the artifact"
else
  echo "  FAIL the failure names the rule and the artifact:"; cat "$tmp/promoted.out"
  fails=$((fails + 1))
fi

fresh verified
promote "$tmp/verified"
cat >>"$tmp/verified/$reqs" <<'EOF'

  - id: VER-001
    type: verification
    title: Checks REQ-001
    status: draft
    links:
      - type: verifies
        target: REQ-001
EOF
check "promoting a requirement with verification passes" "0" "$(ratchet verified)"

check "a missing tree is a run error, not a pass" "2" \
  "$(python3 "$RATCHET" "$RIVET" "$tmp/base" "$tmp/does-not-exist" >/dev/null 2>&1; echo $?)"

if [ "$fails" -gt 0 ]; then
  echo "traceability ratchet: $fails check(s) failed"
  exit 1
fi
echo "traceability ratchet: all checks passed"
