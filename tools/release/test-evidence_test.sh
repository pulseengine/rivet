#!/usr/bin/env bash
# Gate test for the release's test-evidence build (REQ-403 / #1028).
# rivet: verifies REQ-403
#
# release.yml's build-test-evidence job is continue-on-error and runs only on
# a tag, so a regression in it ships a release with no junit.xml and nobody
# is told. v0.40.0 did exactly that: the spar pin (v0.10.0) predates the spar
# change that builds spar-wasm without the HiGHS solver, and highs-sys does
# not build for wasm32-wasip2. This test pins what is checkable without a
# tag: the spar pin is at or after the first tag with that change (v0.13.0),
# Cargo.lock agrees with Cargo.toml, and the job still builds the WASM assets
# from the locked commit, runs the tests with the ci profile, and uploads
# junit.xml in an artifact named test-evidence. Whether spar-wasm builds at
# the pinned commit is spar's property and needs a network build; it was
# measured when REQ-403 was implemented and is not re-proved here.
#
# CARGO_TOML, CARGO_LOCK and RELEASE_YML override the inspected files.
set -uo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
CARGO_TOML="${CARGO_TOML:-$ROOT/Cargo.toml}"
CARGO_LOCK="${CARGO_LOCK:-$ROOT/Cargo.lock}"
RELEASE_YML="${RELEASE_YML:-$ROOT/.github/workflows/release.yml}"
# shellcheck source=/dev/null
. "$ROOT/tools/release/spar-rev.sh"

fails=0
check() { # check <name> <expected> <actual>
  if [ "$2" = "$3" ]; then
    echo "  ok   $1"
  else
    echo "  FAIL $1: expected '$2', got '$3'"
    fails=$((fails + 1))
  fi
}

# "ok" when version tag $1 (vMAJOR.MINOR.PATCH) is >= v0.13.0.
at_least_0_13() {
  local v="${1#v}" maj min
  maj="${v%%.*}"; min="${v#*.}"; min="${min%%.*}"
  case "$maj$min" in *[!0-9]*|'') echo "bad tag '$1'"; return;; esac
  if [ "$maj" -gt 0 ] || [ "$min" -ge 13 ]; then echo ok; else echo "too old ($1)"; fi
}

echo "spar pin"
tag_h="$(sed -nE 's|^spar-hir = .*tag = "([^"]+)".*|\1|p' "$CARGO_TOML")"
tag_a="$(sed -nE 's|^spar-analysis = .*tag = "([^"]+)".*|\1|p' "$CARGO_TOML")"
check "spar-hir pinned by tag at or after v0.13.0" "ok" "$(at_least_0_13 "$tag_h")"
check "spar-analysis pinned by tag at or after v0.13.0" "ok" "$(at_least_0_13 "$tag_a")"
check "both spar crates share one tag" "$tag_h" "$tag_a"
lock_tags="$(grep -E '^source = "git\+https://github\.com/pulseengine/spar(\.git)?\?' "$CARGO_LOCK" \
  | sed -E 's/.*\?tag=([^#"]+)#.*/\1/' | sort -u)"
check "Cargo.lock records that same tag for every spar package" "$tag_h" "$lock_tags"
check "Cargo.lock pins exactly one spar commit" "40" \
  "$(spar_lock_rev "$CARGO_LOCK" 2>/dev/null | tr -d '\n' | wc -c | tr -d ' ')"

job="$(awk '/^  build-test-evidence:/ {on=1; print; next} on && /^  [A-Za-z0-9_-]+:/ {exit} on' "$RELEASE_YML" \
  | sed -E 's/^[[:space:]]*#.*$//; s/[[:space:]]+#.*$//')"
n() { printf '%s\n' "$job" | grep -cE -- "$1"; }

echo "release.yml build-test-evidence"
check "job found" "1" "$(n '^  build-test-evidence:')"
check "wasm32-wasip2 target installed" "1" "$(n '^[[:space:]]+targets: wasm32-wasip2$')"
check "WASM assets built from the commit Cargo.lock pins" "1" \
  "$(n 'SPAR_REV="\$\(tools/release/spar-rev\.sh lock-rev Cargo\.lock\)"')"
check "WASM assets built by scripts/build-wasm.sh" "1" "$(n '\./scripts/build-wasm\.sh \.\./spar$')"
check "tests run with the ci nextest profile" "1" "$(n 'cargo nextest run --all --profile ci$')"
check "junit.xml copied into the evidence tree" "1" \
  "$(n 'cp target/nextest/ci/junit\.xml test-evidence/test-results/junit\.xml$')"
check "evidence is tarred from test-evidence/" "1" "$(n 'tar czf "rivet-.*-test-evidence\.tar\.gz" test-evidence/$')"
check "evidence uploaded as artifact test-evidence" "1" "$(n '^[[:space:]]+name: test-evidence$')"
check "ordering: build assets, then tests, then upload" "1" \
  "$(printf '%s\n' "$job" | awk '/build-wasm\.sh/ {a=NR} /nextest run/ {t=NR} /name: test-evidence$/ {u=NR} END {print (a && t && u && a < t && t < u) ? 1 : 0}')"

if [ "$fails" -ne 0 ]; then
  echo "test-evidence: $fails check(s) failed"
  exit 1
fi
echo "test-evidence: all checks passed"
