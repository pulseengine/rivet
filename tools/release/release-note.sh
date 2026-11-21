#!/usr/bin/env bash
# Release-note publishing helpers (REQ-369).
#
# REQ-327 taught rivet to GENERATE an Automotive SPICE 11-03 release note from
# the artifact store and the commit trailers. Nothing published it: the GitHub
# release body was `gh release create --generate-notes`, a flat pull-request
# list. These three functions are the part of the fix that can be tested
# WITHOUT cutting a release, which matters because `release.yml` fires only on
# tag push — inline shell there is unreachable by any pull request, so it would
# ship unexercised.
#
# Sourced by `.github/workflows/release.yml` and by `release-note_test.sh`.

# previous_release_tag <version>
#
# The tag immediately preceding <version> ON THIS HISTORY, or empty if there is
# none (the first release).
#
# Deliberately NOT `git tag --sort=-v:refname | head -1`: that reads the whole
# tag namespace and answers with the newest tag in the repository, so asking it
# for an older version hands back a tag that comes AFTER the one you asked
# about. The note would then be generated over a commit range running backwards.
previous_release_tag() {
  git describe --tags --abbrev=0 "${1}^" 2>/dev/null || true
}

# release_published <tag>
#
# 0 when <tag> has a published (non-draft) GitHub release, 1 when it has
# none, 2 when GitHub cannot be read. Unknown is never read as "none": that
# would widen the note's commit range silently.
release_published() {
  local out
  if out="$(gh api "repos/${GITHUB_REPOSITORY:?}/releases/tags/$1" --jq '.draft' 2>&1)"; then
    [ "$out" = false ] && return 0
    return 1
  fi
  case "$out" in
    *"Not Found"* | *"HTTP 404"*) return 1 ;;
  esac
  return 2
}

# previous_published_tag <version>
#
# The nearest preceding tag ON THIS HISTORY that users actually received: a
# tag with no published GitHub release is skipped. v0.43.1 was tagged, its
# release run failed, and nothing was published; v0.43.2 is the first release
# users see with v0.43.1's changes, so its note must run from v0.43.0. Fails
# (exit 1, nothing on stdout) when a tag's release state cannot be read.
previous_published_tag() {
  local ref="$1" tag rc
  while :; do
    tag="$(previous_release_tag "$ref")"
    [ -n "$tag" ] || return 0
    rc=0
    release_published "$tag" || rc=$?
    case "$rc" in
      0) echo "$tag"; return 0 ;;
      1) echo "::notice::skipping $tag: no published GitHub release" >&2; ref="$tag" ;;
      *) echo "::error::cannot tell whether $tag has a published GitHub release" >&2; return 1 ;;
    esac
  done
}

# compose_release_body <note-file> <generated-notes>
#
# The trace-derived note first, then GitHub's generated pull-request list under
# a horizontal rule. Writes to stdout.
#
# The body is composed here rather than by passing both `--notes-file` and
# `--generate-notes` to `gh release create`, because gh documents no
# interaction between those flags — neither precedence nor concatenation. A gh
# build that preferred the generated notes would silently publish the
# pull-request-list body this whole requirement exists to replace.
compose_release_body() {
  local note_file="$1" generated="$2"
  cat "$note_file"
  if [ -n "$generated" ]; then
    printf '\n\n---\n\n'
    printf '%s\n' "$generated"
  fi
}

# body_carries_note <body-text>
#
# The readback predicate: true when the published body actually leads with the
# generated release note. Anchored to the start of a line so a body that merely
# MENTIONS the phrase does not satisfy it.
#
# Absence is not success, so the release job asserts this positively after
# creating the release rather than assuming the composition held.
body_carries_note() {
  printf '%s' "$1" | grep -q '^# Release note'
}
