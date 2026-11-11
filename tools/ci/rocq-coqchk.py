#!/usr/bin/env python3
"""Run `coqchk -o` over every .vo that rivet's Rocq targets compile.

  rocq-coqchk.py <aquery.json> <execution_root> <out.txt>

<aquery.json> is `bazel aquery --output=jsonproto` over the Rocq targets.
The coqc actions in it give the toolchain binary and the exact `-Q`
load-path pairs; coqchk takes the same pairs, so it checks the libraries
under the same logical names coqc gave them. Every .vo below a load path
that is not a toolchain library (Stdlib, Corelib, coqutil, Hammer, smpl)
is checked, so a new proof file is covered without editing a list.
The summary goes to <out.txt> for `trust-ledger.py kernel`.
"""
import json
import pathlib
import subprocess
import sys

TOOLCHAIN_LIBS = ("Stdlib", "Corelib", "Coq", "Rocq", "coqutil", "Hammer", "smpl")


def main(aquery, execroot, out):
    root = pathlib.Path(execroot)
    actions = json.loads(pathlib.Path(aquery).read_text()).get("actions", [])
    coqc, pairs = None, {}
    for a in actions:
        args = a.get("arguments", [])
        if not any(x.endswith(".v") for x in args):
            continue
        coqc = coqc or args[0]
        for i, x in enumerate(args[:-2]):
            if x == "-Q":
                pairs[args[i + 1]] = args[i + 2]
    if not coqc or not pairs:
        sys.exit("::error::no coqc action found in the aquery output; nothing to check")
    tool = root / coqc
    chk = next((tool.with_name(n) for n in ("rocqchk", "coqchk") if tool.with_name(n).exists()), None)
    if chk is None:
        sys.exit(f"::error::no rocqchk/coqchk next to {tool}")
    modules = []
    for phys, logical in sorted(pairs.items()):
        if logical.split(".")[0] in TOOLCHAIN_LIBS:
            continue
        for vo in sorted((root / phys).rglob("*.vo")):
            rel = vo.relative_to(root / phys).with_suffix("")
            modules.append(".".join([logical, *rel.parts]))
    if not modules:
        sys.exit("::error::no compiled .vo found under the project load paths; nothing to check")
    argv = [str(chk), "-o", "-silent"]
    for phys, logical in sorted(pairs.items()):
        argv += ["-Q", phys, logical]
    argv += modules
    print("+ " + " ".join(argv), flush=True)
    res = subprocess.run(argv, cwd=root, capture_output=True, text=True)
    text = res.stdout + res.stderr
    print(text)
    pathlib.Path(out).write_text(text)
    print(f"checked {len(modules)} module(s): {', '.join(modules)}")
    return res.returncode


if __name__ == "__main__":
    if len(sys.argv) != 4:
        sys.exit(__doc__)
    sys.exit(main(*sys.argv[1:]))
