#!/usr/bin/env bash
# Regression guard for #671: refuse compliance-report tarballs above a
# hard MB cap so a producer regression (e.g. build output packed into
# the report) cannot ship an ~800 MB "compliance report" again.
#
# Usage:
#   verify_archive_size.sh <archive-path> <max-mb>
#
# Behaviour:
#   * Prints "compliance report size: N MB (B bytes) — cap: M MB" always.
#   * Exits 0 if size <= cap (or cap == 0, which disables the guard).
#   * Exits 1 with a ::error:: line otherwise.
#   * When $GITHUB_STEP_SUMMARY is set, appends a size table.
#
# MB is decimal (1 MB = 1_000_000 bytes) to match release-asset UIs.

set -euo pipefail

if [ $# -ne 2 ]; then
    echo "usage: $0 <archive-path> <max-mb>" >&2
    exit 2
fi

ARCHIVE_PATH="$1"
MAX_MB="$2"

if [ ! -f "$ARCHIVE_PATH" ]; then
    echo "::error::archive not found: ${ARCHIVE_PATH}" >&2
    exit 2
fi

SIZE_BYTES=$(stat -c%s "$ARCHIVE_PATH" 2>/dev/null || stat -f%z "$ARCHIVE_PATH")
SIZE_MB=$(( (SIZE_BYTES + 999999) / 1000000 ))
echo "compliance report size: ${SIZE_MB} MB (${SIZE_BYTES} bytes) — cap: ${MAX_MB} MB"

if [ "$MAX_MB" = "0" ]; then
    echo "size guard disabled (max-archive-size-mb=0)"
    exit 0
fi

MAX_BYTES=$(( MAX_MB * 1000000 ))
if [ "$SIZE_BYTES" -gt "$MAX_BYTES" ]; then
    echo "::error::compliance report is ${SIZE_MB} MB, exceeds ${MAX_MB} MB cap. \
This is the #671 producer regression — the report is HTML + YAML + SVG \
and should be single-digit MB. Check that build output (e.g. target/) \
is not being packed into the report directory, then rerun. \
If a multi-page report is intentional, raise \`max-archive-size-mb\` \
on the calling workflow."
    exit 1
fi

if [ -n "${GITHUB_STEP_SUMMARY:-}" ]; then
    {
        echo "### Compliance report size"
        echo ""
        echo "| Archive | Size | Cap |"
        echo "| --- | --- | --- |"
        echo "| \`$(basename "$ARCHIVE_PATH")\` | ${SIZE_MB} MB | ${MAX_MB} MB |"
    } >> "$GITHUB_STEP_SUMMARY"
fi
