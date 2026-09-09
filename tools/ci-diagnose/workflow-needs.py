#!/usr/bin/env python3
"""Emit a workflow's job-dependency graph as JSON: {job-name: [needs...]}.

`classify_stall` needs this to tell a dependency wait apart from a capacity
stall (REQ-325). The GitHub jobs API does not expose `needs`, so it has to
come from the workflow definition.

Keyed by the job's DISPLAY name where one is set, because that is what the
jobs API reports; falls back to the job key. Prints `{}` and exits 0 on any
problem — a missing graph costs the `dependency-blocked` classification and
falls back to the previous answer, which is strictly better than guessing.
"""

import json
import sys


def _resolve(name: str) -> str:
    """Turn a matrix job's templated name into a prefix glob.

    A matrix job is declared once as e.g. `Build ${{ matrix.target }}` and
    reported by the API as many concrete names (`Build x86_64-...`). Left
    as-is it matches nothing, and a job blocked on a matrix would read as a
    capacity stall. Emitting `Build *` lets the consumer match by prefix.
    """
    marker = name.find("${{")
    if marker < 0:
        return name
    return name[:marker] + "*"


def main() -> int:
    if len(sys.argv) < 2:
        print("{}")
        return 0
    try:
        import yaml
    except ImportError:
        print("{}")
        return 0
    try:
        with open(sys.argv[1], encoding="utf-8") as fh:
            workflow = yaml.safe_load(fh) or {}
    except (OSError, yaml.YAMLError):
        print("{}")
        return 0

    jobs = workflow.get("jobs") or {}
    # `needs:` refers to job KEYS, but the jobs API reports DISPLAY names.
    # Both sides of the comparison must be display names or nothing ever
    # matches and every dependency wait silently reads as a capacity stall —
    # the exact failure this graph exists to prevent.
    display = {
        key: (job.get("name") or key)
        for key, job in jobs.items()
        if isinstance(job, dict)
    }

    out = {}
    for key, job in jobs.items():
        if not isinstance(job, dict):
            continue
        needs = job.get("needs")
        if needs is None:
            continue
        listed = [needs] if isinstance(needs, str) else list(needs)
        out[display[key]] = [_resolve(display.get(n, n)) for n in listed]
    print(json.dumps(out, sort_keys=True))
    return 0


if __name__ == "__main__":
    sys.exit(main())
