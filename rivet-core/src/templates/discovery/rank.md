<!-- Vendored from https://github.com/pulseengine/sigil/blob/main/scripts/mythos/rank.md
     under its repository license. Changes to this file should be proposed
     upstream first where possible. Last synced: 2026-04-23. -->
Rank source files in this repository by likelihood of containing a
security-relevant bug, on a 1–5 scale. Output JSON:
`[{"file": "...", "rank": N, "reason": "..."}]`, sorted descending.

Scope: files under `src/lib/`, `src/cli/`, and `src/component/`.
Exclude tests, examples, and generated code.

Ranking rubric (sigil-specific):

5 (crown jewels — key material, parse-before-verify, canonicalization):
  - src/lib/src/wasm_module/**            # untrusted bytes before sig check
  - src/lib/src/signature/keys.rs         # Ed25519 secret-key material
  - src/lib/src/signature/sig_sections.rs # parses signature custom-section from untrusted WASM; cert chains
  - src/lib/src/airgapped/bundle.rs       # single root of trust offline
  - src/lib/src/airgapped/tuf.rs
  - src/lib/src/secure_file.rs            # on-disk secret permissions
  - src/lib/src/dsse.rs                   # PAE canonicalization — injectivity is load-bearing
  - src/lib/src/platform/{software,keyring_storage,tpm2,trustzone,sgx}.rs  # SecureKeyProvider impls — real key material
  - src/lib/src/platform/secure_element/**  # hardware key operations
  - src/lib/src/provisioning/ca.rs        # private CA root/intermediate key material, HSM

4 (direct security boundary — verification/signing + host bridges + CLI env surface):
  - src/lib/src/signature/keyless/{cert_verifier,cert_pinning,rekor_verifier,merkle,checkpoint,format,signer}.rs
  - src/lib/src/airgapped/verifier.rs
  - src/lib/src/signature/{mod,matrix,multi,simple,hash}.rs
  - src/lib/src/{intoto,slsa,sct}.rs
  - src/lib/src/platform/mod.rs           # SecureKeyProvider trait shape — constrains all providers
  - src/lib/src/runtime/crypto_host.rs    # wasmtime host ↔ SecureKeyProvider bridge
  - src/lib/src/provisioning/{wasm_signing,device,session,verification}.rs
  - src/cli/**                            # env var handling is an untrusted boundary

3 (one hop from untrusted input):
  - src/lib/src/signature/keyless/{oidc,fulcio,rekor,transport,proof_cache,mod}.rs
  - src/lib/src/signature/info.rs
  - src/lib/src/format/**
  - src/lib/src/airgapped/{state,storage,config,mod}.rs
  - src/lib/src/pqc.rs
  - src/lib/src/provisioning/{csr,mod}.rs
  - src/component/**                      # WASI component boundary

3 (one hop from untrusted input, cont.):
  - src/lib/src/transcoding.rs            # wasmtime had 5 CVEs in component-model transcoding 2026-04 — bug-dense class

2 (supporting, no direct crypto):
  - src/lib/src/{http,policy,audit,composition,container}/**
  - src/lib/src/runtime/mod.rs
  - src/lib/src/signature/keyless/rate_limit.rs
  - src/lib/src/split.rs

1 (config / constants / metrics / proof artifacts):
  - src/lib/src/metrics/**
  - src/lib/src/verus_proofs/**           # proofs about runtime code, not runtime itself — not exploitable
  - src/lib/src/{time,build_env,error,lib}.rs

When ranking:
- If a file straddles two tiers, pick the higher.
- For each file emit at most one sentence of reason; the ranker isn't
  the discovery agent and should not explain bugs.
- Files you haven't seen default to rank 2. Do not guess rank 5 from
  path alone — open the file.
