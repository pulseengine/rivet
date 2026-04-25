Rank source files in this repository by likelihood of containing slop,
on a 1–5 scale. Output JSON:
`[{"file": "...", "rank": N, "reason": "..."}]`, sorted descending.

Scope: files under `rivet-core/src/`, `rivet-cli/src/`, and `etch/src/`.
Exclude tests (`tests/`, `*_tests.rs`, `proofs.rs` under `#[cfg(kani)]`),
examples, `build.rs`, and anything under `target/`.

"Slop" here means: code that a Mythos-style audit is likely to prove is
either unexercised, duplicative, or undocumented by any traced
artifact. It is NOT a quality judgment on the author — it is a
prediction of what the excision + traceability oracles in
`discover.md` will confirm.

Ranking rubric (rivet-specific):

5 (parser sprawl — highest slop risk):
  These are the eleven distinct parsing surfaces. Every one should be
  audited for "is this really the canonical path for its input
  format, or does another parser also claim this territory?"
  - rivet-core/src/yaml_cst.rs           # Rowan lossless YAML CST
  - rivet-core/src/yaml_hir.rs           # schema-driven extraction from CST
  - rivet-core/src/sexpr.rs              # Rowan s-expr, filter/constraint lang
  - rivet-core/src/reqif.rs              # ReqIF XML via quick-xml, 2201 LOC
  - rivet-core/src/oslc.rs               # RDF / JSON-LD, 1911 LOC
  - rivet-core/src/bazel.rs              # Rowan Starlark subset, 1230 LOC
  - rivet-core/src/formats/generic.rs    # serde_yaml::from_str — LAZY; duplicates yaml_hir
  - rivet-core/src/formats/needs_json.rs # custom JSON dialect, 755 LOC
  - rivet-core/src/formats/aadl.rs       # via spar-hir + spar-analysis adapters
  - rivet-core/src/commits.rs            # bespoke commit/trailer parser
  - rivet-core/src/wasm_runtime.rs       # wasmtime component model host

4 (aspirational abstraction — claims extensibility, may not deliver):
  Traits and engines whose comments promise pluggability the test
  surface does not exercise end-to-end.
  - rivet-core/src/wasm_runtime.rs       # "user-supplied adapters" — any E2E test?
  - rivet-core/src/adapters/**           # format adapter trait + impls
  - rivet-core/src/templates.rs          # embedded prompts + template-kind gate
  - rivet-core/src/variant.rs            # variant attribute schema, when-clauses
  - rivet-core/src/agent_pipelines.rs    # oracle-gated pipelines
  - rivet-core/src/providers.rs          # feature-model providers (bazel caller)
  - rivet-cli/src/web.rs                 # serve command, Playwright-backed
  - rivet-cli/src/docs.rs                # docs generation, bazel caller

3 (large single-purpose module — big enough to hide unused branches):
  1000+ LOC files doing one domain's work. Slop risk is smaller
  here than parser sprawl, but the sheer size means unaudited branches
  are likely.
  - rivet-core/src/reqif.rs              # (dup — also rank 5 for parser)
  - rivet-core/src/oslc.rs               # (dup — also rank 5 for parser)
  - rivet-core/src/bazel.rs              # (dup — also rank 5 for parser)
  - rivet-core/src/stpa.rs               # if still present
  - rivet-core/src/coverage.rs           # coverage reports — every branch tested?
  - rivet-core/src/mutate.rs             # mutation rules — full coverage?
  - rivet-core/src/externals.rs          # external link resolution

2 (supporting, plausibly load-bearing):
  Code that other high-value code calls. Slop risk is real but
  lower-severity — incorrect slop here gets noticed by upstream tests.
  - rivet-core/src/db.rs                 # salsa db
  - rivet-core/src/validate.rs           # diagnostics
  - rivet-core/src/schema.rs             # schema merging
  - rivet-core/src/links.rs              # link graph via petgraph
  - rivet-core/src/model.rs              # Artifact type
  - rivet-cli/src/main.rs                # CLI dispatch
  - rivet-cli/src/**                     # command handlers

1 (config / constants / error types — hard to slop):
  - rivet-core/src/error.rs
  - rivet-core/src/lib.rs                # re-exports
  - rivet-core/src/ids.rs                # id types
  - rivet-core/src/proofs.rs             # cfg(kani) proofs — exempt
  - etch/src/**                          # utility crate
  - fuzz/**                              # fuzzing harnesses — exempt

When ranking:
- If a file straddles two tiers, pick the higher. A parser that is ALSO
  a 1000+ LOC module goes in rank 5, not rank 3.
- For each file emit at most one sentence of reason; the ranker isn't
  the discovery agent and should not explain findings.
- Files you haven't seen default to rank 2. Do not guess rank 5 from
  path alone — open the file.
- `#[cfg(test)]` modules inside otherwise-production files do not
  lower the file's rank.
- Do NOT include files under `target/`, generated code, or vendored
  third-party code.

After the first pass: count how many files required a straddle-rule
override. If >0, patch this rubric and re-run. The rubric is ready
when a second pass produces zero overrides.
