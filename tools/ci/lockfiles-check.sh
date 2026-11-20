#!/usr/bin/env bash
# Every lockfile binds the build (lockfile sweep, owner-approved 2026-11-20).
#
#   1. Every Cargo workspace root (found from every committed Cargo.toml) has
#      a committed Cargo.lock that no .gitignore hides, and that lock is
#      current: `cargo metadata --locked` fails when cargo would rewrite it.
#      With this step green, every later unlocked cargo command in CI
#      resolves exactly the committed lock.
#   2. Every nested Cargo.lock passes `cargo deny check advisories` with the
#      root deny.toml. The root lock is checked by the deny step itself.
#   3. MODULE.bazel has a committed MODULE.bazel.lock; .bazelrc makes Bazel
#      refuse to change it (--lockfile_mode=error).
#   4. Every package.json with dependencies or devDependencies has a
#      committed package-lock.json (CI installs with `npm ci`). npm/'s
#      optionalDependencies are rivet's own platform packages, pinned to the
#      release version by release-npm.yml, so npm/ has no lock.
#
# Fails closed: fewer than 3 Cargo workspace roots is an error, not a pass.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

fail=0
err() { echo "::error::$*"; fail=1; }

committed() { git ls-files --error-unmatch "$1" >/dev/null 2>&1; }
unhidden() { if git check-ignore -q --no-index "$1"; then err "$1 is gitignored"; fi; }

roots=$(git ls-files '*Cargo.toml' | while read -r m; do
  cargo locate-project --workspace --message-format plain --manifest-path "$m"
done | sort -u)
n=0
for root in $roots; do
  n=$((n + 1))
  rel=$(dirname "$root")
  rel=${rel#"$PWD"}
  rel=${rel#/}
  lock="${rel:+$rel/}Cargo.lock"
  echo "→ $lock"
  if ! committed "$lock"; then err "$lock is not committed"; continue; fi
  unhidden "$lock"
  cargo metadata --locked --format-version 1 --manifest-path "$root" >/dev/null ||
    err "$lock is out of date with its manifests (cargo metadata --locked)"
  if [ "$lock" != "Cargo.lock" ]; then
    cargo deny --manifest-path "$root" --config deny.toml check advisories ||
      err "cargo deny check advisories failed for $lock"
  fi
done
[ "$n" -ge 3 ] || err "found $n Cargo workspace roots, expected at least 3 (., fuzz, compose-witness)"

if committed MODULE.bazel; then
  echo "→ MODULE.bazel.lock"
  committed MODULE.bazel.lock || err "MODULE.bazel.lock is not committed"
  unhidden MODULE.bazel.lock
  grep -qE '^common --lockfile_mode=error$' .bazelrc 2>/dev/null ||
    err ".bazelrc lacks 'common --lockfile_mode=error'"
fi

for pj in $(git ls-files '*package.json'); do
  tr -d '\n' <"$pj" | grep -qE '"(dependencies|devDependencies)"[[:space:]]*:[[:space:]]*\{[[:space:]]*"' || continue
  pl="$(dirname "$pj")/package-lock.json"
  echo "→ $pl"
  committed "$pl" || err "$pl is not committed ($pj declares dependencies)"
  unhidden "$pl"
done

if [ "$fail" -ne 0 ]; then
  echo "lockfiles: FAIL"
  exit 1
fi
echo "lockfiles: ok ($n Cargo workspace roots)"
