#!/usr/bin/env bash
# List the issues a release closed, as a CHANGELOG section.
#
# A release note that names only requirements does not tell a reader which
# REPORTS it answered. Those are what someone waiting on a fix looks for, so
# they belong in the CHANGELOG rather than being reconstructible only by
# crawling pull requests.
#
# Two things this gets right that a hand-written list does not:
#
#   TRUNCATION. `gh issue list --limit N` silently returns the first N and says
#   nothing. A limit of 60 dropped three real closures from this repository's
#   own v0.37.0 list while looking complete. The fetch is therefore asserted to
#   be complete — if the row count reaches the limit the script FAILS rather
#   than emitting a short list.
#
#   AUTO-FILED NOISE. The runner-liveness probe opens and auto-closes its own
#   tracking issue; four such closed inside the v0.37.0 window. They are not
#   release content and are excluded by title, with the count reported so the
#   exclusion is visible rather than silent.
#
# Usage: closed-issues.sh <since-tag> [repo]
set -euo pipefail

SINCE_TAG="${1:?usage: closed-issues.sh <since-tag> [repo]}"
REPO="${2:-pulseengine/rivet}"
LIMIT=500
NOISE='CI runner pool liveness alert'

# The tag's own commit date bounds the window.
SINCE=$(git log -1 --format=%aI "$SINCE_TAG")
SINCE_UTC=$(python3 -c "
import sys,datetime
print(datetime.datetime.fromisoformat(sys.argv[1]).astimezone(datetime.timezone.utc).isoformat().replace('+00:00','Z'))
" "$SINCE")

all=$(gh issue list --repo "$REPO" --state closed --limit "$LIMIT" --json number,title,closedAt)
count=$(jq 'length' <<<"$all")
if [ "$count" -ge "$LIMIT" ]; then
  echo "closed-issues: fetched $count issues, which is the limit ($LIMIT)." >&2
  echo "The list may be truncated and a truncated release note is worse than none." >&2
  exit 1
fi

in_window=$(jq --arg since "$SINCE_UTC" '[.[] | select(.closedAt > $since)] | sort_by(.number)' <<<"$all")
real=$(jq --arg noise "$NOISE" '[.[] | select(.title | contains($noise) | not)]' <<<"$in_window")
noise_n=$(( $(jq 'length' <<<"$in_window") - $(jq 'length' <<<"$real") ))

echo "### Closed issues"
echo
echo "$(jq 'length' <<<"$real") report(s) answered since \`${SINCE_TAG}\`."
echo
jq -r '.[] | "- **#\(.number)** — \(.title)"' <<<"$real"
if [ "$noise_n" -gt 0 ]; then
  echo
  echo "_(${noise_n} auto-filed runner-liveness tracking issue(s) closed in this"
  echo "window and are excluded — they are opened and closed by the probe itself,"
  echo "not release content.)_"
fi
