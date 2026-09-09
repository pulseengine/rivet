#!/usr/bin/env python3
"""Diff a CHANGELOG section against the release query it claims to describe.

The scope of a release has drifted from its query twice, each time caught only
by comparing the two by hand. This does it mechanically.

Two directions, deliberately asymmetric:

  MISSING  — an artifact the query says shipped but the CHANGELOG never names,
             anywhere in the section. This is the drift that matters: work went
             out undocumented. Matched loosely (any mention counts), because
             being named in prose is enough to not be missing.

  UNCLAIMED — an id in CLAIM POSITION, meaning `(REQ-NNN` after a bolded item
             title, that the query does not list as delivered. This is a
             CHANGELOG claiming something the release does not contain.
             Matched strictly, because a prose reference to earlier work — "in
             the code REQ-317 shipped one day earlier" — is legitimate and must
             not fail the check. An earlier version of this script matched any
             occurrence and flagged exactly that sentence.

Usage: changelog-drift.py <version> [rivet-binary] [changelog-path]
Exit 0 when the two agree, 1 otherwise.
"""

import json
import re
import subprocess
import sys


def main() -> int:
    version = sys.argv[1] if len(sys.argv) > 1 else None
    if not version:
        print("usage: changelog-drift.py <version> [rivet] [changelog]", file=sys.stderr)
        return 2
    rivet = sys.argv[2] if len(sys.argv) > 2 else "rivet"
    changelog_path = sys.argv[3] if len(sys.argv) > 3 else "CHANGELOG.md"

    proc = subprocess.run(
        [rivet, "release", "notes", version, "--format", "json"],
        capture_output=True,
        text=True,
    )
    if proc.returncode != 0:
        print(f"rivet release notes failed:\n{proc.stderr}", file=sys.stderr)
        return 2
    notes = json.loads(proc.stdout)
    delivered = {a["id"] for a in notes["delivered"]}
    withheld = {a["id"] for a in notes["withheld"]}

    text = open(changelog_path, encoding="utf-8").read()
    bare = version.lstrip("v")
    marker = f"## [{bare}]"
    if marker not in text:
        print(f"no `{marker}` section in {changelog_path}", file=sys.stderr)
        return 2
    start = text.index(marker)
    rest = text[start + len(marker):]
    nxt = rest.find("\n## [")
    section = rest if nxt < 0 else rest[:nxt]

    mentioned = set(re.findall(r"\b[A-Z]{2,}-\d+\b", section))
    claimed = set(re.findall(r"\((?:[A-Z]{2,}-\d+, )*([A-Z]{2,}-\d+)", section))
    claimed |= set(re.findall(r"\(([A-Z]{2,}-\d+)", section))

    missing = sorted(delivered - mentioned)
    unclaimed = sorted(claimed - delivered)

    print(f"release {version}: delivered={len(delivered)} withheld={len(withheld)}")
    print(f"changelog: mentioned={len(mentioned)} in-claim-position={len(claimed)}")
    print(f"  DELIVERED BUT UNDOCUMENTED: {missing or 'none'}")
    print(f"  CLAIMED BUT NOT DELIVERED:  {unclaimed or 'none'}")
    if withheld:
        print(f"  WITHHELD (release is not cuttable): {sorted(withheld)}")
    return 1 if (missing or unclaimed or withheld) else 0


if __name__ == "__main__":
    sys.exit(main())
