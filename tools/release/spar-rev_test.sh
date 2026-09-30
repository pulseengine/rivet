#!/usr/bin/env bash
# Oracle for tools/release/spar-rev.sh (REQ-390 / #951).
# rivet: verifies REQ-390
#
# The guard runs in release.yml, which fires only on a tag, and in
# scripts/build-wasm.sh, which CI never calls. So it is exercised here. Each
# case is a way the guard could pass while the binary carries two spar
# revisions: the defect is a guard that cannot fire, which is exactly what the
# old build.rs check was (it searched for `rev =` and the pin uses `tag =`).
set -uo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=/dev/null
. "$HERE/spar-rev.sh"

fails=0
check() { # check <name> <expected> <actual>
  if [ "$2" = "$3" ]; then
    echo "  ok   $1"
  else
    echo "  FAIL $1: expected '$2', got '$3'"
    fails=$((fails + 1))
  fi
}

T="$(mktemp -d)"
trap 'rm -rf "$T"' EXIT
A=afd5da28ba7f8d678b4741f96eb580456430c87b
B=1111111111111111111111111111111111111111

lock() { # lock <file> <source-line>...
  local f="$1"; shift
  : > "$f"
  for s in "$@"; do
    printf '[[package]]\nname = "spar-x"\nversion = "0.10.0"\nsource = "%s"\n\n' "$s" >> "$f"
  done
}

echo "spar_lock_rev"
lock "$T/tag.lock" "git+https://github.com/pulseengine/spar.git?tag=v0.10.0#$A" \
                   "git+https://github.com/pulseengine/spar.git?tag=v0.10.0#$A"
check "tag pin resolves to its commit" "$A" "$(spar_lock_rev "$T/tag.lock" 2>/dev/null)"
lock "$T/rev.lock" "git+https://github.com/pulseengine/spar.git?rev=afd5da2#$A"
check "rev pin resolves to its commit" "$A" "$(spar_lock_rev "$T/rev.lock" 2>/dev/null)"
lock "$T/two.lock" "git+https://github.com/pulseengine/spar.git?tag=v0.10.0#$A" \
                   "git+https://github.com/pulseengine/spar.git?branch=main#$B"
spar_lock_rev "$T/two.lock" > /dev/null 2>&1
check "two different commits fail" "1" "$?"
lock "$T/none.lock" "registry+https://github.com/rust-lang/crates.io-index"
spar_lock_rev "$T/none.lock" > /dev/null 2>&1
check "a lock with no spar source fails" "1" "$?"
spar_lock_rev "$T/absent.lock" > /dev/null 2>&1
check "a missing lockfile fails" "1" "$?"
lock "$T/fork.lock" "git+https://github.com/someone/spar-fork.git?tag=v1#$B" \
                    "git+https://github.com/pulseengine/spar.git?tag=v0.10.0#$A"
check "an unrelated repo named like spar is ignored" "$A" "$(spar_lock_rev "$T/fork.lock" 2>/dev/null)"

echo "spar_check_checkout"
repo="$T/spar"
git init -q "$repo"
git -C "$repo" -c user.email=t@example.com -c user.name=t -c commit.gpgsign=false \
  commit -q --allow-empty -m one
head="$(git -C "$repo" rev-parse HEAD)"
lock "$T/match.lock" "git+https://github.com/pulseengine/spar.git?tag=v0.10.0#$head"
spar_check_checkout "$repo" "$T/match.lock" > /dev/null 2>&1
check "the pinned commit passes" "0" "$?"
spar_check_checkout "$repo" "$T/tag.lock" > /dev/null 2>&1
check "a different HEAD fails" "1" "$?"
msg="$(spar_check_checkout "$repo" "$T/tag.lock" 2>&1)"
case "$msg" in *"Cargo.lock pins $A"*) r=named ;; *) r="$msg" ;; esac
check "the failure names the pinned commit" "named" "$r"
spar_check_checkout "$T" "$T/match.lock" > /dev/null 2>&1
check "a directory that is not a checkout fails" "1" "$?"

echo "the real Cargo.lock"
real="$(spar_lock_rev "$HERE/../../Cargo.lock" 2>&1)"
case "$real" in [0-9a-f]*) r=ok ;; *) r="$real" ;; esac
check "rivet's own lock pins exactly one spar commit" "ok" "$r"

if [ "$fails" -ne 0 ]; then
  echo "$fails check(s) failed"
  exit 1
fi
echo "all spar-rev checks passed"
