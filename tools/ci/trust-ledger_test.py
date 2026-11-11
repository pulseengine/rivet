#!/usr/bin/env python3
"""Self-test for tools/ci/trust-ledger.py, run by the Proof trust ledger job."""
import importlib.util
import pathlib
import tempfile
import unittest

HERE = pathlib.Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("trust_ledger", HERE / "trust-ledger.py")
tl = importlib.util.module_from_spec(spec)
spec.loader.exec_module(tl)


class Scan(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.root = pathlib.Path(self.tmp.name)
        tl.ROOT = self.root
        tl.LEDGER = self.root / "proofs" / "trust-ledger.tsv"
        (self.root / "proofs").mkdir()
        tl.LEDGER.write_text("# header\n")

    def tearDown(self):
        self.tmp.cleanup()

    def write(self, rel, text):
        p = self.root / rel
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(text)

    def test_rocq_escapes_and_nested_comments(self):
        self.write("proofs/A.v", "(* Admitted. (* Axiom fake : True. *) *)\n"
                   "Axiom ax : True.\nParameter p : nat.\n"
                   "Lemma l : True.\nProof. Admitted.\n")
        self.assertEqual(sorted(r[2:] for r in tl.scan_rocq()),
                         [("admitted", "l"), ("axiom", "ax"), ("parameter", "p")])

    def test_verus_escapes_kani_excluded(self):
        self.write("src/v.rs", "verus! {\n#[verifier::external_body]\nfn e() {}\n"
                   "proof fn q() { assume(x); admit(); }\n"
                   "fn h() { kani::assume(y); }\n// assume(z)\n}\n")
        self.assertEqual(sorted(r[2:] for r in tl.scan_verus()),
                         [("admit", "q"), ("assume", "q"), ("external_body", "e")])

    def test_non_verus_rust_file_ignored(self):
        self.write("src/k.rs", "fn h() { assume(y); }\n")
        self.assertEqual(tl.scan_verus(), [])

    def test_new_escape_fails_removed_entry_passes(self):
        tl.LEDGER.write_text("source\tproofs/A.v\taxiom\tgone\n")
        self.assertEqual(tl.compare([], "source", "x"), 0)
        self.assertEqual(tl.compare([("source", "proofs/A.v", "axiom", "ax")], "source", "x"), 1)

    def test_multiplicity_counts(self):
        row = ("source", "src/v.rs", "assume", "q")
        tl.LEDGER.write_text("\t".join(row) + "\n")
        self.assertEqual(tl.compare([row], "source", "x"), 0)
        self.assertEqual(tl.compare([row, row], "source", "x"), 1)

    def test_kernel_summary(self):
        out = ("CONTEXT SUMMARY\n===============\n\n* Theory: Set is predicative\n\n"
               "* Axioms:\n    proofs.rocq.Schema.t\n    Stdlib.Logic.Classical_Prop.classic\n\n"
               "* Constants/Inductives relying on type-in-type: <none>\n\n"
               "* Constants/Inductives relying on unsafe (co)fixpoints: <none>\n")
        rows, rc = tl.kernel_rows(out)
        self.assertEqual(rc, 0)
        self.assertEqual(sorted(r[3] for r in rows),
                         ["Stdlib.Logic.Classical_Prop.classic", "proofs.rocq.Schema.t"])
        _, rc = tl.kernel_rows(out.replace("type-in-type: <none>", "type-in-type:\n    proofs.rocq.Schema.u"))
        self.assertEqual(rc, 1)
        with self.assertRaises(SystemExit):
            tl.kernel_rows("Error: cannot find library\n")


if __name__ == "__main__":
    unittest.main()
