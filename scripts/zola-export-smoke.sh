#!/usr/bin/env bash
# Zola export build smoke check.
#
# Exports the rivet corpus to a scaffolded Zola site whose `base_url` is a
# SUB-DIRECTORY deploy (GitHub-Pages project-site style, served under
# /<repo>/), runs a real `zola build`, and fails if:
#   1. `zola build` errors (a broken shortcode, a dangling `@/` internal
#      link, a missing taxonomy, …), or
#   2. any generated artifact link in the built HTML is an absolute
#      `/<prefix>/artifacts/…` path that drops the deploy sub-path and would
#      404 in the browser.
#
# This is the end-to-end check the string-asserting unit tests cannot give:
# "export succeeded" must imply "the site actually builds and its links
# resolve under a sub-directory deploy." It would have caught REQ-115 /
# REQ-116 / REQ-118 before they shipped.
#
# Tracking: pulseengine/rivet#378 (REQ-138).
#
# Usage:
#   scripts/zola-export-smoke.sh
#
# Env:
#   RIVET_BIN   path to a prebuilt rivet binary (default: build & use
#               target/release/rivet via cargo).
#   BASE_URL    override the sub-directory base_url used for the test
#               (default: https://example.test/rivet-docs).
#
# Exits 0 on success, non-zero on any build error or absolute-link leak.
# Skips with exit 0 and a notice if `zola` is not installed, so the CI job
# can gate on availability without turning into a hard failure on runners
# that lack zola.

set -euo pipefail

if ! command -v zola >/dev/null 2>&1; then
    echo "notice: zola not installed — skipping Zola export build smoke check." >&2
    exit 0
fi

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BASE_URL="${BASE_URL:-https://example.test/rivet-docs}"

# Resolve the rivet binary.
if [[ -n "${RIVET_BIN:-}" ]]; then
    RIVET="$RIVET_BIN"
else
    echo "building rivet-cli (release)…" >&2
    (cd "$ROOT" && cargo build --release -p rivet-cli >&2)
    RIVET="$ROOT/target/release/rivet"
fi

SITE="$(mktemp -d)"
trap 'rm -rf "$SITE"' EXIT

# Scaffold a minimal but real Zola site deployed under a sub-directory.
cat >"$SITE/config.toml" <<EOF
base_url = "$BASE_URL"
title = "Rivet export smoke"
[[taxonomies]]
name = "tags"
EOF
mkdir -p "$SITE/content" "$SITE/templates"
# Section/page templates that render the body; enough for `zola build`.
printf '%s\n' '{{ section.content | safe }}{% for p in section.pages %}{{ p.title }}{% endfor %}' \
    >"$SITE/templates/index.html"
printf '%s\n' '{{ section.content | safe }}{% for p in section.pages %}{{ p.title }}{% endfor %}' \
    >"$SITE/templates/section.html"
printf '%s\n' '{{ page.content | safe }}' >"$SITE/templates/page.html"

echo "exporting rivet corpus to Zola site (--shortcodes)…" >&2
(cd "$ROOT" && "$RIVET" export --format zola --shortcodes --output "$SITE") >&2

echo "running zola build under base_url=$BASE_URL …" >&2
if ! (cd "$SITE" && zola build) >&2; then
    echo "FAIL: zola build errored on the exported site." >&2
    exit 1
fi

# A leak is a built-HTML href/src that begins with /<prefix>/artifacts/ or
# /<prefix>/documents/ — i.e. an absolute path that dropped the base_url
# sub-path. Correctly-resolved internal links are full URLs that include the
# sub-path ("$BASE_URL/<prefix>/…"), so they do not match this pattern.
LEAKS="$(grep -rhoE '(href|src)="/[a-z][a-z0-9-]*/(artifacts|documents)/[^"]*"' "$SITE/public" 2>/dev/null | sort -u || true)"

if [[ -n "$LEAKS" ]]; then
    echo "FAIL: built site contains absolute artifact/document links that drop the deploy sub-path:" >&2
    echo "$LEAKS" | sed 's/^/  /' >&2
    echo "(these 404 on a sub-directory deploy; use Zola internal links @/…md or get_url)" >&2
    exit 1
fi

PAGES="$(find "$SITE/public" -name '*.html' | wc -l | tr -d ' ')"
echo "OK: zola build succeeded ($PAGES pages) with no absolute artifact-link leaks." >&2
exit 0
