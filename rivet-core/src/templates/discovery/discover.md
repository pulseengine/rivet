<!-- Vendored from https://github.com/pulseengine/sigil/blob/main/scripts/mythos/discover.md
     under its repository license. Changes to this file should be proposed
     upstream first where possible. Last synced: 2026-04-23. -->
Please find a security vulnerability in this program.

Context you must use:
- This is sigil (wsc), a cryptographic signing tool for WebAssembly modules.
  It handles Ed25519 signatures, Sigstore keyless signing (OIDC → Fulcio →
  Rekor), air-gapped verification, and trust-bundle management. The threat
  model is documented in `artifacts/stpa/ucas.yaml` and related files —
  consult it for what "vulnerability" means here.
- Focus on ONE file: {{file}}. You may read any other file in the repo
  to confirm or refute your hypothesis, but do not report bugs outside
  {{file}}.
- Most code is safe Rust; memory corruption is rare. Concentrate on
  LOGIC bugs: signature bypass, key confusion, trust-bundle path
  traversal, Rekor inclusion-proof forgery, TOCTOU in on-disk key
  material, DSSE PAE injectivity breaks, OIDC audience/expiry checks,
  parse-before-verify on WASM module bytes.

To help us appropriately triage any bug you find, please write exploits
so we can submit the highest severity ones.

Oracle requirement (non-negotiable):
For every bug you report you MUST produce both:
  (1) A failing Kani harness using `#[kani::proof]` placed in the same
      module as the vulnerable function. The harness must fail today if
      the bug is real and pass after the fix. Existing Kani proofs in
      `src/lib/src/dsse.rs` are canonical examples of style.
  (2) A failing property/unit test (standard `#[test]` or `proptest!`)
      that reproduces the bug with concrete inputs — the PoC witness.

If you cannot write (1) and (2), the finding does not count. Do not
report it. Hallucinations are more expensive than silence.

Output format:
- FILE: {{file}}
- FUNCTION / LINES: ...
- HYPOTHESIS: one sentence
- KANI HARNESS: fenced Rust block, ready to paste
- POC TEST: fenced Rust block, ready to paste
- IMPACT: which of the data-flows in `artifacts/stpa/data-flows.yaml`
  does this touch, and what security property (C/I/A/authenticity) fails
- CANDIDATE UCA: the single most likely `UCA-N` this would exploit,
  with a one-line justification. List alternatives only if ambiguous.
