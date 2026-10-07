#!/usr/bin/env bash
# Oracle for tools/ci/memcap.sh (#1031). Runs in CI's YAML Lint job, on Linux:
# RLIMIT_AS (`ulimit -v`) is enforced there and not on macOS, so on any other
# OS this says so and stops — a skipped run proves nothing.
#
# The defect guarded against is a cap that cannot fire (the #590 cap sat above
# the cgroup ceiling): an allocation over the cap must fail inside the capped
# process, one under it must succeed, and the wrapper must pass the command's
# arguments and exit status through unchanged.
set -uo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
CAP="$HERE/memcap.sh"

if [ "$(uname -s)" != Linux ]; then
  echo "memcap: SKIPPED — RLIMIT_AS is only enforced on Linux; this proves nothing here"
  exit 0
fi

fails=0
check() { # check <name> <expected> <actual>
  if [ "$2" = "$3" ]; then
    echo "  ok   $1"
  else
    echo "  FAIL $1: expected '$2', got '$3'"
    fails=$((fails + 1))
  fi
}

echo "memcap"
check "the default cap is 12 GiB" "12582912" "$(bash "$CAP" sh -c 'ulimit -v')"
check "MEMCAP_KB overrides the cap" "1048576" "$(MEMCAP_KB=1048576 bash "$CAP" sh -c 'ulimit -v')"
MEMCAP_KB=1048576 bash "$CAP" python3 -c 'b = bytearray(64 * 2**20)' 2>/dev/null
check "an allocation under the cap succeeds" "0" "$?"
out="$(MEMCAP_KB=1048576 bash "$CAP" python3 -c 'b = bytearray(2 * 2**30)' 2>&1)"
rc=$?
check "an allocation over the cap fails in its own process" "1" "$rc"
case "$out" in
  *MemoryError*) echo "  ok   the failure is the allocation (MemoryError)" ;;
  *) echo "  FAIL the failure is the allocation: got '$out'"; fails=$((fails + 1)) ;;
esac
bash "$CAP" sh -c 'exit 7'
check "the command's exit status passes through" "7" "$?"
check "arguments pass through unchanged" "a b|c" "$(bash "$CAP" printf '%s|%s' 'a b' 'c')"

if [ "$fails" -ne 0 ]; then
  echo "memcap: $fails check(s) failed"
  exit 1
fi
echo "memcap: all checks passed"
