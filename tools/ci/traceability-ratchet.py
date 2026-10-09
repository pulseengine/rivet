#!/usr/bin/env python3
"""Traceability ratchet (REQ-389): fail when a change adds a traceability
finding on an artifact that claims to be done.

The whole-store warning count is too large to gate on, so this gates on the
difference. It runs one rivet binary (the change's own) over two trees, the
base and the head, and compares their findings:

- a finding is a `rivet validate` diagnostic at warning or error severity
  from one of the traceability rules `rivet coverage` reports, keyed by
  (rule, artifact id);
- it counts only while its artifact is at a gated status (implemented,
  verified, accepted, released) in that tree, so promoting a draft that has
  no evidence is a new finding even though the draft already carried it.

Usage: traceability-ratchet.py RIVET BASE_DIR HEAD_DIR
Exit 0 when the head adds no finding, 1 when it does, 2 on a usage or run
error.
"""

import json
import subprocess
import sys

GATED = {"implemented", "verified", "accepted", "released"}
SEVERITIES = {"warning", "error"}


def run_json(rivet, project, *args):
    # validate exits 1 when the tree carries errors; its JSON is still complete.
    out = subprocess.run(
        [rivet, "--project", project, *args, "--format", "json"],
        capture_output=True,
        text=True,
    )
    try:
        return json.loads(out.stdout)
    except json.JSONDecodeError:
        sys.stderr.write(
            f"rivet {' '.join(args)} on {project} printed no JSON "
            f"(exit {out.returncode}):\n{out.stderr}\n"
        )
        sys.exit(2)


def findings(rivet, project):
    """The gated traceability findings of one tree, as {(rule, id): message}."""
    rules = {r["name"] for r in run_json(rivet, project, "coverage")["rules"]}
    status = {
        a["id"]: a.get("status")
        for a in run_json(rivet, project, "list")["artifacts"]
    }
    out = {}
    for d in run_json(rivet, project, "validate")["diagnostics"]:
        aid = d.get("artifact_id")
        if (
            d.get("rule") in rules
            and d.get("severity") in SEVERITIES
            and aid is not None
            and status.get(aid) in GATED
        ):
            out[(d["rule"], aid)] = d.get("message", "")
    return out


def main(argv):
    if len(argv) != 4:
        sys.stderr.write(__doc__)
        return 2
    rivet, base_dir, head_dir = argv[1:]
    base = findings(rivet, base_dir)
    head = findings(rivet, head_dir)
    added = sorted(set(head) - set(base))
    fixed = len(set(base) - set(head))
    print(
        f"traceability ratchet: base {len(base)} gated finding(s), "
        f"head {len(head)}, {len(added)} new, {fixed} resolved"
    )
    for rule, aid in added:
        print(f"  NEW {rule} {aid}: {head[(rule, aid)]}")
    if added:
        print(
            "An artifact at implemented or later must carry the evidence its "
            "traceability rules ask for: add the link or a "
            "`// rivet: verifies <ID>` marker, or keep it at an earlier status."
        )
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
