#!/usr/bin/env bash
# Copy caller-supplied files into the compliance bundle (REQ-371).
#
# The bundle is the audit deliverable — traceability matrix, coverage,
# validation, rendered specs, ReqIF and generic-yaml exports. It carried no
# RELEASE NOTE, so an assessor handed the bundle alone got no Automotive SPICE
# 11-03 item, even though rivet generates one (REQ-327) and publishes it as a
# release asset (REQ-369).
#
# Kept as a script rather than inline YAML because `release.yml` and this
# action only run on a tag push, so inline shell there is unreachable by any
# pull request and would ship having never executed. This has an oracle:
# copy_extra_files_test.sh.
#
# Usage: copy_extra_files.sh <dest-dir> <newline-separated-file-list>
set -uo pipefail

dest="${1:?destination directory required}"
list="${2-}"

# Empty or whitespace-only means NOTHING REQUESTED. A YAML block scalar with
# no entries and one with blank lines are indistinguishable, so there is no
# honest way to read whitespace as "the caller expected a file". The guard
# against a silently-absent document is the missing-file check below, which
# fires per named entry.
if [ -z "${list//[[:space:]]/}" ]; then
  echo "no extra files requested"
  exit 0
fi

if [ ! -d "$dest" ]; then
  echo "::error::extra-files destination '$dest' is not a directory" >&2
  exit 1
fi

copied=0
while IFS= read -r raw; do
  # Tolerate blank lines and indentation from a YAML block scalar.
  src="$(printf '%s' "$raw" | sed 's/^[[:space:]]*//; s/[[:space:]]*$//')"
  [ -z "$src" ] && continue

  # A MISSING FILE IS AN ERROR, not a skip. The whole defect being fixed is a
  # bundle that silently lacked a document it claimed to carry; silently
  # skipping a requested file would reproduce it one level down.
  if [ ! -f "$src" ]; then
    echo "::error::extra-files entry not found: $src" >&2
    exit 1
  fi

  base="$(basename "$src")"
  if [ -e "$dest/$base" ]; then
    echo "::error::extra-files entry '$base' would overwrite a bundle file" >&2
    exit 1
  fi

  cp "$src" "$dest/$base" || {
    echo "::error::failed to copy $src into the bundle" >&2
    exit 1
  }
  echo "  + $base"
  copied=$((copied + 1))
done <<< "$list"

echo "copied $copied extra file(s) into the bundle"
