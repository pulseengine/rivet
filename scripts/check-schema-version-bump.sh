#!/usr/bin/env bash
# Flag schema files that changed without a `version:` bump (#485).
#
# Built-in schemas embed into the rivet binary, so a rules change with the
# `version:` left unchanged silently alters validation for every embedded-schema
# consumer (issue #431) — and the version surfaced by `rivet validate` /
# `rivet schema sources` (#483) stays uninformative. This guards the discipline:
# touch a schema's rules, bump its version.
#
# Usage:
#   scripts/check-schema-version-bump.sh [BASE_REF] [HEAD_REF]
#     BASE_REF  base to diff against (default: origin/main)
#     HEAD_REF  head to diff        (default: HEAD)
#
# Env:
#   STRICT=1   exit non-zero when a bump is missing (default: warn-only, exit 0)
#
# Warn-only by default (matches the project's docs-check --warn-only gate):
# a comment/whitespace-only schema edit legitimately needs no bump, so this
# advises rather than blocks. Set STRICT=1 to enforce.
set -euo pipefail

BASE="${1:-origin/main}"
HEAD="${2:-HEAD}"
STRICT="${STRICT:-0}"

# Schema files whose version must track rule changes. Excludes migration
# recipes (schemas/migrations/) which carry no `version:` metadata.
# Portable collection (no `mapfile` — macOS ships bash 3.2).
changed="$(
  git diff --name-only --diff-filter=d "$BASE...$HEAD" -- 'schemas/*.yaml' \
    | grep -v '^schemas/migrations/' || true
)"

missing=()
while IFS= read -r f; do
  [ -n "$f" ] || continue
  # Did this file's diff touch a `version:` line? (the schema: metadata version)
  if git diff "$BASE...$HEAD" -- "$f" | grep -qE '^[+-][[:space:]]*version:'; then
    continue   # version changed — good
  fi
  missing+=("$f")
done <<< "$changed"

if [ "${#missing[@]}" -eq 0 ]; then
  echo "schema-version-bump: OK (no schema changed without a version bump)"
  exit 0
fi

for f in "${missing[@]}"; do
  ver="$(grep -m1 -E '^[[:space:]]*version:' "$f" 2>/dev/null | tr -d ' ' || echo 'version:?')"
  msg="$f changed but its $ver was not bumped — bump it if rules changed (semver: minor=new/tightened rule, patch=fix). See #485."
  if [ -n "${GITHUB_ACTIONS:-}" ]; then
    echo "::warning file=$f::$msg"
  else
    echo "WARNING: $msg"
  fi
done

if [ "$STRICT" = "1" ]; then
  echo "schema-version-bump: ${#missing[@]} schema(s) changed without a version bump (STRICT)."
  exit 1
fi
echo "schema-version-bump: ${#missing[@]} schema(s) changed without a version bump (warn-only)."
exit 0
