#!/usr/bin/env bash
# Oracle for extract_ids in tools/release/changelog-drift.py: the id
# extraction the release cut relies on to compare the CHANGELOG with the
# release scope. A false positive (an advisory read as an artifact) made the
# v0.40.0 preview report `RUSTSEC-2026` as claimed but not delivered.
set -uo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
python3 - "$HERE/changelog-drift.py" <<'PY'
import importlib.util, sys
spec = importlib.util.spec_from_file_location("drift", sys.argv[1])
drift = importlib.util.module_from_spec(spec)
spec.loader.exec_module(drift)
fails = 0
def check(name, want, got):
    global fails
    if want == got:
        print(f"  ok   {name}")
    else:
        print(f"  FAIL {name}: expected {want!r}, got {got!r}")
        fails += 1
m, c = drift.extract_ids(
    "- **wasmtime 48** (RUSTSEC-2026-0315, RUSTSEC-2026-0316) - bump.\n"
    "- **A fix** (REQ-385, #1008) - done.\n"
    "- **Both** (REQ-383, REQ-384) - done.\n"
    "- Mentions CVE-2026-1234 and GHSA-abcd in prose; recorded in DD-082.\n"
)
check("advisories are never artifact ids", False, any(i.startswith(("RUSTSEC", "CVE", "GHSA")) for i in m | c))
check("mentioned ids", {"REQ-383", "REQ-384", "REQ-385", "DD-082"}, m)
check("claimed ids (inside a parenthesis)", {"REQ-383", "REQ-384", "REQ-385"}, c)
sys.exit(1 if fails else 0)
PY
