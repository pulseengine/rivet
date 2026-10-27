#!/usr/bin/env python3
"""Fix-hotspot trigger (REQ-409): the next fix to a file that keeps being
fixed opens a refactoring task instead of another spot fix.

For a pull request, count the `fix:` / `fix(scope):` commits on the base
branch (first-parent, so one squash-merged PR is one commit) that touched each
source file the PR changes, over the WINDOW_DAYS before the base tip's commit
date. A file with THRESHOLD or more is a hotspot.

The gate fails when all of these hold:
- the PR is a fix: its title, or the subject of any of its own non-merge
  commits, is a `fix:` / `fix(scope):` conventional commit;
- the PR changes at least one hotspot file;
- the PR title is not itself a `refactor:` / `refactor(scope):`;
- the PR body references no open issue carrying the `refactor` label.

"Source file" means a path with a `src/` directory component. That leaves
out the files every fix touches whatever the fix is (CHANGELOG.md,
artifacts/requirements.yaml, Cargo.lock) and the test suites a fix adds to;
counting those would make every fix trip the gate and say nothing about
where the code needs restructuring.

The defaults were chosen from rivet's history on 2026-10-27 (see REQ-409):
with THRESHOLD = 6 over 60 days, three files qualify, and
rivet-cli/src/main.rs is one of them, at 30.

Usage:
  fix-hotspot.py --base REF [--head REF] [--title T] [--body B]
                 [--repo OWNER/NAME] [--issue-fixture FILE]
  fix-hotspot.py --base REF --distribution

--title and --body default to the PR_TITLE and PR_BODY environment variables.
Issues are read through the GitHub REST API with GITHUB_TOKEN (the
self-hosted runners have no `gh`). --issue-fixture replaces the API with a
JSON file mapping issue numbers to {"state": ..., "labels": [...],
"pull_request": bool}; the self-test uses it.

Exit 0 when the gate passes, 1 when it fires, 2 on a usage or run error
(including an API failure: an issue that cannot be read does not count).
"""

import argparse
import json
import os
import re
import subprocess
import sys
import urllib.error
import urllib.request

THRESHOLD = 6
WINDOW_DAYS = 60
REFACTOR_LABEL = "refactor"
MAX_ISSUE_REFS = 20

FIX_RE = re.compile(r"^fix(\([^)]*\))?!?:")
REFACTOR_RE = re.compile(r"^refactor(\([^)]*\))?!?:")
SOURCE_RE = re.compile(r"(^|/)src/")
# `#123` or `Refs #123`; a full issue URL is matched separately (issue_refs).
SHORT_REF_RE = re.compile(r"(?<![\w/])#(\d+)\b")


class GateError(Exception):
    pass


def git(*args):
    proc = subprocess.run(["git", *args], capture_output=True, text=True)
    if proc.returncode != 0:
        raise GateError(f"git {' '.join(args)} failed: {proc.stderr.strip()}")
    return proc.stdout


def is_source(path):
    return bool(SOURCE_RE.search(path))


def fix_counts(base, window_days):
    """Fix commits per source file on base's first-parent history in the
    window ending at base's own commit date."""
    tip = int(git("log", "-1", "--format=%ct", base).strip())
    since = tip - window_days * 86400
    out = git(
        "log", "--first-parent", "--diff-merges=first-parent",
        f"--since=@{since}", "--format=@@%x00%s", "--name-only", base,
    )
    counts = {}
    is_fix = False
    for line in out.splitlines():
        if line.startswith("@@\x00"):
            is_fix = bool(FIX_RE.match(line[3:]))
        elif line and is_fix and is_source(line):
            counts[line] = counts.get(line, 0) + 1
    return counts


def pr_commits_and_files(base, head):
    mb = git("merge-base", base, head).strip()
    subjects = git("log", "--no-merges", "--format=%s", f"{mb}..{head}").splitlines()
    files = [f for f in git("diff", "--name-only", mb, head).splitlines() if f]
    return subjects, files


def issue_refs(body, repo):
    nums = [int(n) for n in SHORT_REF_RE.findall(body or "")]
    if repo:
        url_re = re.compile(
            r"github\.com/" + re.escape(repo) + r"/issues/(\d+)", re.IGNORECASE
        )
        nums += [int(n) for n in url_re.findall(body or "")]
    seen = []
    for n in nums:
        if n not in seen:
            seen.append(n)
    return seen[:MAX_ISSUE_REFS]


def fetch_issue(repo, num, fixture):
    if fixture is not None:
        return fixture.get(str(num))
    token = os.environ.get("GITHUB_TOKEN")
    if not token or not repo:
        raise GateError("reading issues needs GITHUB_TOKEN and --repo")
    req = urllib.request.Request(
        f"https://api.github.com/repos/{repo}/issues/{num}",
        headers={
            "Authorization": f"Bearer {token}",
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            data = json.load(resp)
    except urllib.error.HTTPError as e:
        if e.code == 404:
            return None
        raise GateError(f"GET issues/{num}: HTTP {e.code}") from e
    except urllib.error.URLError as e:
        raise GateError(f"GET issues/{num}: {e.reason}") from e
    return {
        "state": data.get("state"),
        "labels": [lb.get("name") for lb in data.get("labels", [])],
        "pull_request": "pull_request" in data,
    }


def refactor_issue(body, repo, fixture):
    """The first referenced open issue labelled refactor, or None."""
    for num in issue_refs(body, repo):
        issue = fetch_issue(repo, num, fixture)
        if not issue or issue.get("pull_request"):
            continue
        if issue.get("state") == "open" and REFACTOR_LABEL in issue.get("labels", []):
            return num
    return None


def how_to_proceed(repo, hotspots, counts, threshold, window_days):
    lines = [
        "",
        "How to proceed (AGENTS.md, 'Fix hotspots'):",
        "  1. Open a refactoring issue from the template and label it `refactor`:",
    ]
    if repo:
        lines.append(f"     https://github.com/{repo}/issues/new?template=refactor.md")
    else:
        lines.append("     .github/ISSUE_TEMPLATE/refactor.md")
    lines += [
        "     Name the hotspot file(s), the fixes counted below, and the split you propose.",
        "  2. Then either:",
        "     - reference that open issue in this PR's body (e.g. `Refs #NNN`), and the",
        "       fix can land while the refactor is tracked; or",
        "     - do the refactor first, in a PR titled `refactor: ...`, and rebase the fix on it.",
        "",
        f"Hotspots: {threshold} or more fix commits in the {window_days} days before the base tip:",
    ]
    for f in hotspots:
        lines.append(f"  {counts[f]:4d}  {f}")
    return "\n".join(lines)


def main(argv):
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    ap.add_argument("--base", required=True)
    ap.add_argument("--head", default="HEAD")
    ap.add_argument("--title", default=os.environ.get("PR_TITLE", ""))
    ap.add_argument("--body", default=os.environ.get("PR_BODY", ""))
    ap.add_argument("--repo", default=os.environ.get("GITHUB_REPOSITORY", ""))
    ap.add_argument("--threshold", type=int, default=THRESHOLD)
    ap.add_argument("--window-days", type=int, default=WINDOW_DAYS)
    ap.add_argument("--issue-fixture")
    ap.add_argument("--distribution", action="store_true",
                    help="print every source file's fix count in the window and exit")
    a = ap.parse_args(argv)

    try:
        counts = fix_counts(a.base, a.window_days)
        if a.distribution:
            for f, c in sorted(counts.items(), key=lambda kv: (-kv[1], kv[0])):
                mark = "  HOTSPOT" if c >= a.threshold else ""
                print(f"{c:4d}  {f}{mark}")
            n = sum(1 for c in counts.values() if c >= a.threshold)
            print(f"{n} hotspot(s) at threshold {a.threshold}, window {a.window_days} days")
            return 0

        subjects, files = pr_commits_and_files(a.base, a.head)
        fix_subjects = [s for s in subjects if FIX_RE.match(s)]
        is_fix = bool(FIX_RE.match(a.title)) or bool(fix_subjects)
        if not is_fix:
            print("fix-hotspot: not a fix (title and commits carry no fix: type); pass")
            return 0
        if REFACTOR_RE.match(a.title):
            print("fix-hotspot: the PR is a refactor; pass")
            return 0

        hotspots = [f for f in files if is_source(f) and counts.get(f, 0) >= a.threshold]
        if not hotspots:
            print(f"fix-hotspot: fix touches no hotspot (threshold {a.threshold}, "
                  f"window {a.window_days} days); pass")
            return 0

        fixture = None
        if a.issue_fixture:
            with open(a.issue_fixture) as fh:
                fixture = json.load(fh)
        num = refactor_issue(a.body, a.repo, fixture)
        if num is not None:
            print(f"fix-hotspot: fix touches {', '.join(hotspots)}; "
                  f"refactoring tracked in open issue #{num}; pass")
            return 0
    except GateError as e:
        print(f"fix-hotspot: error: {e}", file=sys.stderr)
        return 2

    for f in hotspots:
        print(f"::error file={f}::fix-hotspot: {f} has {counts[f]} fix commits in the last "
              f"{a.window_days} days (threshold {a.threshold}); the next fix opens a "
              f"refactoring task instead of another spot fix")
    print(f"fix-hotspot: FAIL - this fix touches {len(hotspots)} hotspot file(s) and the PR "
          f"body references no open issue labelled `{REFACTOR_LABEL}`.")
    print(how_to_proceed(a.repo, hotspots, counts, a.threshold, a.window_days))
    return 1


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
