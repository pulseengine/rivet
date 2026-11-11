#!/usr/bin/env python3
"""Ledger of trust escapes in rivet's proofs (proofs/trust-ledger.tsv).

A trust escape is a place where a prover accepts a statement without
checking it. The ledger lists each one by file, kind and name. CI fails
when an escape appears that the ledger lacks; an entry the scan no longer
finds is reported but allowed, so removing an escape never needs a
ledger edit first.

  trust-ledger.py scan              print the escapes the sources contain
  trust-ledger.py check             compare the source scan with the ledger
  trust-ledger.py kernel <out.txt>  compare `coqchk -o` axioms with the ledger

Sources scanned (rows tagged `source`):
  Rocq  proofs/**/*.v: Admitted, Admit Obligations, Axiom(s), Parameter(s),
        Conjecture. Comments are stripped first (they nest).
  Verus files containing `verus!`: external_body, assume_specification,
        assume(...), admit(). `kani::assume` is a harness precondition,
        not a trust escape, and is never counted.

Kernel rows (tagged `kernel`) are the axioms coqchk reports for the
compiled .vo files. An Admitted proof is an axiom to the kernel, so it
appears in both sections. coqchk also reports the theory flags; any
"relying on" line other than <none> fails the check.
"""
import collections
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parents[2]
LEDGER = ROOT / "proofs" / "trust-ledger.tsv"
SKIP_DIRS = {"target", ".git", "node_modules", "bazel-bin", "bazel-out", "bazel-testlogs"}

ROCQ_DECL = re.compile(
    r"\b(Theorem|Lemma|Corollary|Fact|Remark|Proposition|Example|Definition"
    r"|Fixpoint|Instance|Program\s+\w+|Let)\s+([A-Za-z_][\w']*)"
)
ROCQ_AXIOM = re.compile(r"(?m)^\s*(Axioms?|Parameters?|Conjecture)\s+([A-Za-z_][\w']*)")
ROCQ_ADMITTED = re.compile(r"\bAdmitted\s*\.")
ROCQ_ADMIT_OBL = re.compile(r"\bAdmit\s+Obligations\b")


def files(pattern):
    for p in sorted(ROOT.rglob(pattern)):
        rel = p.relative_to(ROOT)
        if not SKIP_DIRS.intersection(rel.parts) and not rel.parts[0].startswith("bazel-"):
            yield p, rel.as_posix()


def strip_rocq_comments(text):
    """Blank out (* ... *) comments, nested, keeping offsets."""
    out, depth, i = list(text), 0, 0
    while i < len(text):
        two = text[i:i + 2]
        if two == "(*":
            depth += 1
            out[i] = out[i + 1] = " "
            i += 2
            continue
        if two == "*)" and depth:
            depth -= 1
            out[i] = out[i + 1] = " "
            i += 2
            continue
        if depth and text[i] != "\n":
            out[i] = " "
        i += 1
    return "".join(out)


def scan_rocq():
    rows = []
    for path, rel in files("*.v"):
        text = strip_rocq_comments(path.read_text(encoding="utf-8"))
        for m in ROCQ_AXIOM.finditer(text):
            rows.append(("source", rel, m.group(1).rstrip("s").lower(), m.group(2)))
        for rx, kind in ((ROCQ_ADMITTED, "admitted"), (ROCQ_ADMIT_OBL, "admit-obligations")):
            for m in rx.finditer(text):
                decls = list(ROCQ_DECL.finditer(text, 0, m.start()))
                rows.append(("source", rel, kind, decls[-1].group(2) if decls else "?"))
    return rows


def strip_rust_comments(text):
    text = re.sub(r"/\*.*?\*/", lambda m: re.sub(r"[^\n]", " ", m.group(0)), text, flags=re.S)
    return re.sub(r"//[^\n]*", "", text)


RUST_FN = re.compile(r"\bfn\s+([A-Za-z_]\w*)")
VERUS_ESCAPES = (
    (re.compile(r"#\[\s*verifier(?:::external_body|\s*\(\s*external_body\s*\))\s*\]"), "external_body", "next"),
    (re.compile(r"\bassume_specification\b"), "assume_specification", "next"),
    (re.compile(r"(?<![\w:])assume\s*\("), "assume", "prev"),
    (re.compile(r"(?<![\w:])admit\s*\(\s*\)"), "admit", "prev"),
)


def scan_verus():
    rows = []
    for path, rel in files("*.rs"):
        raw = path.read_text(encoding="utf-8")
        if "verus!" not in raw:
            continue
        text = strip_rust_comments(raw)
        for rx, kind, where in VERUS_ESCAPES:
            for m in rx.finditer(text):
                if where == "next":
                    f = RUST_FN.search(text, m.end())
                    name = f.group(1) if f else "?"
                else:
                    fns = list(RUST_FN.finditer(text, 0, m.start()))
                    name = fns[-1].group(1) if fns else "?"
                rows.append(("source", rel, kind, name))
    return rows


def read_ledger():
    rows = []
    for n, line in enumerate(LEDGER.read_text(encoding="utf-8").splitlines(), 1):
        if not line.strip() or line.startswith("#"):
            continue
        parts = tuple(line.split("\t"))
        if len(parts) != 4 or parts[0] not in ("source", "kernel"):
            sys.exit(f"{LEDGER.relative_to(ROOT)}:{n}: expected 4 tab-separated fields "
                     f"(source|kernel, file, kind, name), got: {line!r}")
        rows.append(parts)
    return rows


def compare(found, section, what):
    have = collections.Counter(r for r in read_ledger() if r[0] == section)
    seen = collections.Counter(found)
    new = seen - have
    gone = have - seen
    for row in sorted(gone.elements()):
        print(f"note: ledger entry no longer found (remove it): {chr(9).join(row)}")
    for row in sorted(new.elements()):
        print(f"::error::{what} not in {LEDGER.relative_to(ROOT)}: {chr(9).join(row)}")
    total = sum(seen.values())
    print(f"{what}: {total} found, {sum(have.values())} in ledger, {sum(new.values())} new")
    return 1 if new else 0


def kernel_rows(out_text):
    """Parse `coqchk -o` CONTEXT SUMMARY. Exit non-zero if it is missing."""
    if "CONTEXT SUMMARY" not in out_text:
        sys.exit("::error::coqchk output has no CONTEXT SUMMARY; the kernel check did not run")
    rows, flags, block = [], [], None
    for line in out_text.splitlines():
        s = line.strip()
        if s.startswith("* "):
            block = s[2:]
            head, _, rest = block.partition(":")
            if head.startswith("Axioms"):
                block = "axioms"
                if rest.strip() and rest.strip() != "<none>":
                    rows.append(("kernel", "-", "axiom", rest.strip()))
            elif "relying on" in head:
                block = "flag"
                if rest.strip() != "<none>":
                    flags.append(s)
            else:
                block = None
            continue
        if not s:
            continue
        if block == "axioms" and s != "<none>":
            rows.append(("kernel", "-", "axiom", s))
        elif block == "flag" and s != "<none>":
            flags.append(s)
    for f in flags:
        print(f"::error::coqchk reports an unsafe flag: {f}")
    return rows, 1 if flags else 0


def main(argv):
    cmd = argv[1] if len(argv) > 1 else "check"
    if cmd == "scan":
        for row in sorted(scan_rocq() + scan_verus()):
            print("\t".join(row))
        return 0
    if cmd == "check":
        return compare(scan_rocq() + scan_verus(), "source", "trust escape")
    if cmd == "kernel" and len(argv) == 3:
        rows, rc = kernel_rows(pathlib.Path(argv[2]).read_text(encoding="utf-8"))
        return compare(rows, "kernel", "kernel axiom") or rc
    sys.exit(__doc__)


if __name__ == "__main__":
    sys.exit(main(sys.argv))
