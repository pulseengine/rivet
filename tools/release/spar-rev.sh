#!/usr/bin/env bash
# REQ-390 / #951: one spar revision per rivet binary.
#
# rivet links spar twice: natively (spar-hir / spar-analysis, a git dependency
# resolved in Cargo.lock) and as the wasm renderer built from a spar checkout
# by scripts/build-wasm.sh. The release used to clone spar's default-branch
# HEAD for the second, so one binary carried two AADL parsers from different
# revisions and nothing compared them.
#
# Cargo.lock is the single source of truth: it records the exact commit the
# native build compiled, whether Cargo.toml pins spar by tag, rev or branch.
#
# Sourceable (functions below) or executable:
#   spar-rev.sh lock-rev [Cargo.lock]          print the pinned commit
#   spar-rev.sh check <spar-dir> [Cargo.lock]  fail unless HEAD is that commit

# Print the single spar commit Cargo.lock pins. Fails when the lock names no
# spar git source, or more than one distinct commit (two revisions in one
# build is the defect itself).
spar_lock_rev() {
  local lock="${1:-Cargo.lock}" revs n
  if [ ! -f "$lock" ]; then
    echo "spar-rev: no lockfile at $lock" >&2
    return 1
  fi
  revs="$(grep -E '^source = "git\+https://github\.com/pulseengine/spar(\.git)?[?#]' "$lock" \
    | sed -E 's/.*#([0-9a-f]{40})"$/\1/' | grep -E '^[0-9a-f]{40}$' | sort -u)"
  n="$(printf '%s' "$revs" | grep -c .)"
  if [ "$n" -eq 0 ]; then
    echo "spar-rev: $lock pins no spar git source" >&2
    return 1
  fi
  if [ "$n" -gt 1 ]; then
    echo "spar-rev: $lock pins $n different spar commits:" >&2
    printf '  %s\n' $revs >&2
    return 1
  fi
  printf '%s\n' "$revs"
}

# Fail unless the spar checkout at <dir> is exactly the commit Cargo.lock pins.
spar_check_checkout() {
  local dir="$1" lock="${2:-Cargo.lock}" want have
  want="$(spar_lock_rev "$lock")" || return 1
  have="$(git -C "$dir" rev-parse HEAD 2>/dev/null)" || {
    echo "spar-rev: $dir is not a git checkout" >&2
    return 1
  }
  if [ "$have" != "$want" ]; then
    echo "spar-rev: spar checkout at $dir is $have, but Cargo.lock pins $want." >&2
    echo "  The wasm renderer and the native parser would come from different" >&2
    echo "  spar revisions. Check out $want (git -C $dir checkout $want)." >&2
    return 1
  fi
}

if [ "${BASH_SOURCE[0]}" = "$0" ]; then
  set -euo pipefail
  case "${1:-}" in
    lock-rev) spar_lock_rev "${2:-Cargo.lock}" ;;
    check) spar_check_checkout "${2:?usage: spar-rev.sh check <spar-dir> [Cargo.lock]}" "${3:-Cargo.lock}" ;;
    *)
      echo "usage: spar-rev.sh lock-rev [Cargo.lock] | check <spar-dir> [Cargo.lock]" >&2
      exit 2
      ;;
  esac
fi
