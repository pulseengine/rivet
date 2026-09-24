#!/usr/bin/env bash
# Oracle for tools/release/release-note.sh (REQ-369).
#
# The logic under test lives in `release.yml`, which fires only on tag push.
# Nothing in a pull request can reach it, so without this file the release-note
# publishing path would ship having never run. Each case below is a way the
# path can fail SILENTLY — producing a release that looks fine and carries the
# wrong body — rather than an invented input.
set -uo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=/dev/null
. "$HERE/release-note.sh"

fails=0
check() { # check <name> <expected> <actual>
  if [ "$2" = "$3" ]; then
    echo "  ok   $1"
  else
    echo "  FAIL $1: expected '$2', got '$3'"
    fails=$((fails + 1))
  fi
}

# A throwaway repository with a tag history shaped like rivet's, including the
# patch release that makes naive version sorting wrong.
make_repo() {
  local dir
  dir="$(mktemp -d)"
  (
    cd "$dir" || exit 1
    git init -q .
    git config user.email t@example.com
    git config user.name t
    git config commit.gpgsign false
    for tag in v0.33.0 v0.33.1 v0.34.0 v0.38.0; do
      : > "$tag.txt"
      git add -A
      git commit -qm "$tag"
      git tag "$tag"
    done
  )
  echo "$dir"
}

# ── previous_release_tag ──────────────────────────────────────────────────
# rivet: verifies REQ-369
test_previous_release_tag() {
  echo "previous_release_tag:"
  local repo
  repo="$(make_repo)"
  cd "$repo" || return

  check "predecessor of the newest tag" "v0.34.0" "$(previous_release_tag v0.38.0)"

  # THE REGRESSION THIS EXISTS FOR. `git tag --sort=-v:refname | head -1`
  # answers v0.38.0 here — a tag NEWER than the one being asked about — so the
  # note for v0.34.0 would be generated over a backwards commit range. The
  # history-relative form answers the real predecessor.
  check "predecessor is history-relative, not newest-in-repo" \
    "v0.33.1" "$(previous_release_tag v0.34.0)"
  local naive
  naive="$(git tag --list 'v*' --sort=-v:refname | grep -Fxv v0.34.0 | head -1)"
  check "  (and the naive form really is wrong here)" "v0.38.0" "$naive"

  # A patch release is a predecessor like any other; skipping it would make the
  # note claim work that v0.33.1 already shipped.
  check "a patch release is not skipped" "v0.33.0" "$(previous_release_tag v0.33.1)"

  # The first release has no predecessor. Empty, not an error, so the caller
  # can fall back to generating a note with no commit section.
  check "first release has no predecessor" "" "$(previous_release_tag v0.33.0)"

  cd "$HERE" || return
  rm -rf "$repo"
}

# ── compose_release_body ──────────────────────────────────────────────────
# rivet: verifies REQ-369
test_compose_release_body() {
  echo "compose_release_body:"
  local dir note body
  dir="$(mktemp -d)"
  note="$dir/note.md"
  printf '# Release note — v0.39.0\n\n3 artifact(s) in scope.\n' > "$note"

  body="$(compose_release_body "$note" "## What's Changed
* a pull request by @someone")"

  # The note must come FIRST. If the generated list led, an assessor opening
  # the release page would see the pull-request list this requirement replaces
  # and have to scroll for the 11-03 item.
  check "note leads the body" "# Release note — v0.39.0" "$(printf '%s' "$body" | head -1)"
  check "generated list is retained, not replaced" "1" \
    "$(printf '%s' "$body" | grep -c "a pull request by @someone")"
  check "the two halves are separated by a rule" "1" \
    "$(printf '%s' "$body" | grep -cx -- '---')"

  # No generated notes: the note alone, and NO dangling rule — a trailing
  # `---` with nothing under it reads as a section that failed to render.
  body="$(compose_release_body "$note" "")"
  check "empty generated notes yield no dangling rule" "0" \
    "$(printf '%s' "$body" | grep -cx -- '---')"
  check "  (and the note still survives)" "# Release note — v0.39.0" \
    "$(printf '%s' "$body" | head -1)"

  rm -rf "$dir"
}

# ── body_carries_note ─────────────────────────────────────────────────────
# rivet: verifies REQ-369
test_body_carries_note() {
  echo "body_carries_note:"

  body_carries_note "# Release note — v0.39.0
2 artifact(s) in scope."
  check "true for a real note" "0" "$?"

  # THE EXACT REGRESSION. This is what the body looks like when the note is
  # lost and `--generate-notes` wins: plausible, non-empty, and missing the
  # only thing that makes it an 11-03 item. The predicate must reject it.
  body_carries_note "## What's Changed
* feat: something by @someone in https://github.com/o/r/pull/1"
  check "FALSE for a bare pull-request list" "1" "$?"

  # A body that merely mentions the phrase mid-sentence is not a note; the
  # anchor is what distinguishes them.
  body_carries_note "Fixes the bug where the # Release note went missing."
  check "false for an unanchored mention" "1" "$?"

  body_carries_note ""
  check "false for an empty body" "1" "$?"
}

test_previous_release_tag
test_compose_release_body
test_body_carries_note

if [ "$fails" -ne 0 ]; then
  echo "FAILED: $fails check(s)"
  exit 1
fi
echo "all release-note checks passed"
