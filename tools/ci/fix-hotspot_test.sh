#!/usr/bin/env bash
# Oracle for tools/ci/fix-hotspot.py (REQ-409).
# rivet: verifies REQ-409
#
# The defect guarded against is a trigger that cannot fire. A synthetic
# repository gives one file exactly THRESHOLD fix commits inside the window
# (a hotspot) and another THRESHOLD-1 (not one), plus fixes that must not
# count: older than the window, under tests/, or of another type. Negative
# controls: a fix PR touching the hotspot fails, also when the fix is only in
# a commit subject, and also when the body cites an issue that is closed,
# unlabelled, or a pull request. Positive cases: a cited open refactor issue,
# a refactor: title, a non-fix PR, and a fix to a file below the threshold
# all pass. No network: issues come from a fixture file.
set -uo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
GATE="$HERE/fix-hotspot.py"

tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

fails=0
check() { # check <name> <expected> <actual>
  if [ "$2" = "$3" ]; then
    echo "  ok   $1"
  else
    echo "  FAIL $1: expected '$2', got '$3'"
    sed 's/^/       | /' "$tmp/last.out"
    fails=$((fails + 1))
  fi
}

export GIT_AUTHOR_NAME=t GIT_AUTHOR_EMAIL=t@example.invalid
export GIT_COMMITTER_NAME=t GIT_COMMITTER_EMAIL=t@example.invalid
repo="$tmp/repo"
git init -q -b main "$repo"
g() { git -C "$repo" -c commit.gpgsign=false "$@"; }

now=1790000000            # the base tip's date anchors the window
day=86400
# commit <days-before-tip> <subject> <file>...
commit() {
  local age="$1" subject="$2"; shift 2
  for f in "$@"; do
    mkdir -p "$repo/$(dirname "$f")"
    echo "$subject" >>"$repo/$f"
    g add "$f"
  done
  local d="@$((now - age * day)) +0000"
  GIT_AUTHOR_DATE="$d" GIT_COMMITTER_DATE="$d" g commit -q -m "$subject"
}

commit 200 "feat: initial" crate/src/hot.rs crate/src/warm.rs crate/src/cold.rs
# Outside the 60-day window: must not count.
for i in 1 2 3 4 5 6 7; do commit 90 "fix: old $i" crate/src/warm.rs; done
# hot.rs: exactly 6 fixes in the window (one scoped, one breaking).
commit 50 "fix: a" crate/src/hot.rs
commit 40 "fix(cli): b" crate/src/hot.rs
commit 30 "fix!: c" crate/src/hot.rs
commit 20 "fix: d" crate/src/hot.rs
commit 10 "fix: e" crate/src/hot.rs
commit 0 "fix: f" crate/src/hot.rs
# warm.rs: 5 fixes in the window, one below the threshold.
for i in 1 2 3 4 5; do commit 5 "fix: warm $i" crate/src/warm.rs; done
# Not fixes, or not source: must not count.
for i in 1 2 3 4 5 6 7; do commit 3 "feat: grow $i" crate/src/cold.rs; done
for i in 1 2 3 4 5 6 7; do commit 2 "fix: test $i" crate/tests/t.rs; done
# Re-anchor: the tip is the last commit, `now`.
GIT_AUTHOR_DATE="@$now +0000" GIT_COMMITTER_DATE="@$now +0000" \
  g commit -q --allow-empty -m "chore: tip"

cat >"$tmp/issues.json" <<'JSON'
{
  "7": {"state": "open", "labels": ["refactor"], "pull_request": false},
  "8": {"state": "closed", "labels": ["refactor"], "pull_request": false},
  "9": {"state": "open", "labels": ["bug"], "pull_request": false},
  "10": {"state": "open", "labels": ["refactor"], "pull_request": true}
}
JSON

# branch <name> <commit-subject> <file>: a PR branch off main with one commit.
branch() {
  g checkout -q -B "$1" main
  echo "$1" >>"$repo/$3"
  g add "$3"
  GIT_AUTHOR_DATE="@$now +0000" GIT_COMMITTER_DATE="@$now +0000" g commit -q -m "$2"
}
# gate <head> <title> <body>: exit code of the gate on that PR.
gate() {
  (cd "$repo" && python3 "$GATE" --base main --head "$1" --title "$2" --body "$3" \
    --repo o/r --issue-fixture "$tmp/issues.json") >"$tmp/last.out" 2>&1
  echo $?
}

branch fix-hot "fix: another spot fix" crate/src/hot.rs
branch fix-warm "fix: below threshold" crate/src/warm.rs
branch fix-test "fix: test only" crate/tests/t.rs
branch feat-hot "feat: grow hot" crate/src/hot.rs
branch sneaky "fix: hidden in a commit" crate/src/hot.rs

echo "distribution"
(cd "$repo" && python3 "$GATE" --base main --distribution) >"$tmp/last.out" 2>&1
check "hot.rs counts 6 in-window fixes" 1 "$(grep -c '^   6  crate/src/hot.rs  HOTSPOT$' "$tmp/last.out")"
check "warm.rs counts 5, old fixes excluded" 1 "$(grep -c '^   5  crate/src/warm.rs$' "$tmp/last.out")"
check "feat commits and tests/ do not count" 0 "$(grep -c 'cold.rs\|tests/t.rs' "$tmp/last.out")"

echo "negative controls (the gate must fire)"
check "fix to a hotspot, no body" 1 "$(gate fix-hot 'fix: another spot fix' '')"
check "  names the file and count" 1 "$(grep -c 'crate/src/hot.rs has 6 fix commits' "$tmp/last.out")"
check "  says how to proceed" 1 "$(grep -c 'issues/new?template=refactor.md' "$tmp/last.out")"
check "fix only in a commit subject" 1 "$(gate sneaky 'Update hot.rs' '')"
check "cites a closed refactor issue" 1 "$(gate fix-hot 'fix: x' 'Refs #8')"
check "cites an open issue without the label" 1 "$(gate fix-hot 'fix: x' 'Refs #9')"
check "cites a pull request labelled refactor" 1 "$(gate fix-hot 'fix: x' 'Refs #10')"
check "cites an unknown issue" 1 "$(gate fix-hot 'fix: x' 'Refs #99')"
check "threshold applies: warm.rs fires at 5" 1 "$(cd "$repo" && python3 "$GATE" --base main \
  --head fix-warm --title 'fix: x' --threshold 5 --issue-fixture "$tmp/issues.json" >/dev/null 2>&1; echo $?)"

echo "positive cases (the gate must pass)"
check "cites an open refactor issue" 0 "$(gate fix-hot 'fix: x' 'Fixes the bug. Refs #7')"
check "cites it by URL" 0 "$(gate fix-hot 'fix: x' 'see https://github.com/o/r/issues/7')"
check "the PR is a refactor" 0 "$(gate fix-hot 'refactor(cli): split hot.rs' '')"
check "not a fix" 0 "$(gate feat-hot 'feat: grow hot' '')"
check "fix below the threshold" 0 "$(gate fix-warm 'fix: below threshold' '')"
check "fix to tests/ only" 0 "$(gate fix-test 'fix: test only' '')"

echo "errors"
check "no token and no fixture is an error, not a pass" 2 "$(cd "$repo" && \
  env -u GITHUB_TOKEN python3 "$GATE" --base main --head fix-hot --title 'fix: x' \
  --body 'Refs #7' --repo o/r >"$tmp/last.out" 2>&1; echo $?)"

if [ "$fails" -gt 0 ]; then
  echo "fix-hotspot_test: $fails failure(s)"
  exit 1
fi
echo "fix-hotspot_test: all checks passed"
