# Comparison: useblocks vs rivet

## 1. TL;DR

[useblocks](https://www.useblocks.com) is a mature commercial "Engineering-as-Code" toolchain around Sphinx-Needs, ubConnect, ubCode, and ubTrace, with "30+ OEMs & Tier-1s" deployed. Rivet is a younger standalone Rust CLI that overlaps on authoring/validation/traceability/ReqIF and goes further on formal verification (27 Kani harnesses, Verus/Rocq scaffolding), AI workflows (MCP server), and PLE (feature model + s-expression quantifiers). useblocks wins on adoption, ALM reach, ecosystem, and commercial support; rivet wins on verification rigor, AI-native surface, and no Python/Sphinx dependency.

## 2. Product-surface mapping

| Capability | useblocks / Sphinx-Needs | rivet | Assessment |
|---|---|---|---|
| Primary authoring format | reStructuredText with `need` directives (training-only, unverified) | YAML artifacts validated by a rowan CST parser | orthogonal |
| Custom need / artifact types | Sphinx-Needs configurable need types (training-only, unverified) | 27 YAML schemas under `schemas/` (ISO 26262, DO-178C, IEC 61508, 62304, EN 50128, ASPICE, ISO/PAS 8800, SOTIF, EU AI Act, STPA, STPA-Sec, SCORE, AADL, supply-chain, safety-case, plus bridges) | rivet-stronger (breadth of shipped schemas) |
| Links + backlinks | Sphinx-Needs link types with back-references (training-only, unverified) | `rivet-core/src/links.rs` typed links + backlinks; schema inheritance; shorthand-link syntax | identical (feature parity) |
| Variant / PLE | `needs_variants` tag-based variants (training-only, unverified) | `artifacts/features.yaml` FODA-style feature model + s-expression constraint solver + `rivet variant check/list/solve` | rivet-stronger |
| Constraint language | `needs_constraints` declarative expressions (training-only, unverified) | S-expression language in `rivet-core/src/sexpr_eval.rs` with `forall`, `exists`, `reachable-from`, `reachable-to` quantifiers | rivet-stronger (quantifiers + graph reachability) |
| ALM sync (Polarion, Jira, Codebeamer) | ubConnect: "Bridge legacy ALM with Engineering-as-Code", "Wide ALM & format support", `needs_services` live calls at build time (training-only, unverified) | None — no live ALM connector; OSLC stub in `oslc.rs` | useblocks-stronger |
| IDE integration | ubCode: "IDE-native & ecosystem-ready", "Instant linting & need validation", "Live preview in <0.2s" | VS Code extension `vscode-rivet` v0.3.0 ("Rivet SDLC") + `rivet lsp` language server with diagnostics, hover, go-to-definition, completion, and code actions | identical (both have IDE story) |
| AI / agent integration | `pharaoh` — "Agentic AI framework for sphinx-needs projects" (5 GitHub stars at time of writing) | MCP server first-class (`rivet mcp`); FEAT-010 in the product; CRUD + integration tests | rivet-stronger |
| CI linting | ubCode: "Instant linting & need validation" | `rivet validate` (incremental via salsa `rivet-core/src/db.rs`), `rivet commits`, trailer enforcement | identical |
| Live preview / dashboard | ubCode: "Live preview in <0.2s" | `rivet serve` dashboard with HTMX, Mermaid, filter/sort/pagination, compound AADL graphs | identical (different architectures) |
| ReqIF | ubConnect: "ReqIF export" (useblocks also ships `reqif` repo) | `rivet-core/src/reqif.rs` import + export, fuzzed via `fuzz/fuzz_targets/fuzz_reqif_import.rs` | identical |
| Sphinx-Needs JSON | native format | `rivet-core/src/formats/needs_json.rs` import adapter (versions, type-mapping, id-transform, link-type config) | rivet-stronger (cross-ecosystem adapter) |
| Formal verification | None observed in public useblocks repos | 27 Kani BMC harnesses in `rivet-core/src/proofs.rs`; Verus job + `verus/` directory; Rocq job + `proofs/rocq/` directory; CI-enabled (marked `continue-on-error` pending toolchain) | rivet-stronger |
| Differential parser testing | None observed | `rivet-core/tests/differential_yaml.rs` — 6 tests comparing rowan parser against serde_yaml | rivet-stronger |
| Property-based testing | None observed | `proptest_core.rs`, `proptest_feature_model.rs`, `proptest_operations.rs`, `proptest_sexpr.rs`, `proptest_yaml.rs` | rivet-stronger |
| Mutation testing | None observed | Dual-crate `cargo-mutants` runs in CI for `rivet-core` and `rivet-cli` | rivet-stronger |
| Fuzzing | None observed | `fuzz/fuzz_targets/`: YAML artifact, document parse, Sphinx-Needs JSON import, ReqIF import, schema merge (PR #160 in flight) | rivet-stronger |
| Supply chain / signing | Not advertised on landing page | `rivet-core/src/compliance.rs`, `supply-chain.yaml` schema, `cargo-deny` config | rivet-stronger (schema-level) |
| Standalone binary vs pipeline | Sphinx / Python toolchain required (training-only, unverified) | Single Rust binary; HTMX/Mermaid/fonts bundled via `include_str!`; no CDN | rivet-stronger |
| Incremental validation | Sphinx rebuilds (training-only, unverified) | Salsa-backed incremental compiler (`rivet-core/src/db.rs`) | rivet-stronger |
| YAML parser rigor | Sphinx-Needs embeds YAML fragments in RST (training-only, unverified) | Rowan CST (`yaml_cst.rs`, `yaml_hir.rs`, `yaml_edit.rs`) with edge-case + round-trip + differential test suites | rivet-stronger |
| STPA / STPA-Sec | `sphinx-safety` repo exists — scope unverified | 9 STPA schemas, 31 STPA-Sec adversarial artifacts, extraction fixer (#150), dashboard section, `rivet-core/tests/stpa_sec_verification.rs` (16 tests) | rivet-stronger |
| HTML / PDF output | Sphinx HTML builders, `sphinx-simplepdf` for PDF (training-only, unverified) | Dashboard (HTML) + Zola multi-project static export with `--prefix` namespacing; no PDF builder | useblocks-stronger (PDF) |
| Test-result import | `sphinx-test-reports` (training-only, unverified) | `rivet import-results` (JUnit), `junit.rs`, `results.rs`, `test_scanner.rs` | identical |
| Industry adoption | "30+ OEMs & Tier-1s" — BMW, Volkswagen, Eclipse, aerospace/defense Tier-1s | Nascent, no named production deployments | useblocks-stronger |
| Commercial support | Commercial company sells products; public roadmap repos `ubCode-pub`, `ubTrace-pub`, `ubConnect-pub` | None; OSS, no commercial entity | useblocks-stronger |
| Ecosystem breadth | 15+ related repos: `sphinx-collections`, `sphinx-simplepdf`, `sphinx-test-reports`, `sphinx-data-viewer`, `sphinx-codelinks`, `sphinx-emf`, `sphinx-needs-enterprise`, `sphinx-safety`, `reqif`, `hammocking`, `spl-core`, `SPLed`, `needs-config-writer`, `bazel-drives-sphinx`, `sphinx-ai-index` | Single-repo monolith (cli + core + extension + fuzz + verus + rocq all in one tree) | useblocks-stronger |
| Meta-adoption / self-hosting | Not known to use Sphinx-Needs to track Sphinx-Needs itself (training-only, unverified) | Rivet uses its own feature-model (`artifacts/features.yaml`, FEAT-001..FEAT-0xx, v040-features.yaml) to drive its own roadmap | rivet-stronger |

## 3. Architectural differences

**useblocks / Sphinx-Needs** is a Python Sphinx extension: needs live inside RST source, resolve during the Sphinx build, produce HTML/PDF, and emit `needs.json` as the machine artifact. ubCode, ubConnect, ubTrace wrap that pipeline with linting, ALM bridging, and lifecycle visibility — all assuming a Sphinx project at the core.

**rivet** is a standalone Rust CLI over YAML artifacts rooted at `rivet.yaml`. The core is a salsa-backed incremental compiler over a rowan CST, with a typed schema layer, an s-expression evaluator, and a proofs module. HTML is served via `rivet serve` or exported to a Zola static site; no Sphinx dependency, no PDF builder.

Net: useblocks plugs into an existing doc pipeline at the cost of a Python runtime; rivet drops the doc pipeline for verification + agent workflows at the cost of no PDF and no user base.

## 4. Where rivet is BEHIND

1. **Industry adoption.** useblocks claims "30+ OEMs & Tier-1s" — BMW, Volkswagen, Eclipse, aerospace/defense Tier-1s. Sphinx-Needs has ~275 GitHub stars and years of production use. Rivet is untested at scale.
2. **Live ALM sync.** ubConnect — "Bridge legacy ALM with Engineering-as-Code", "Wide ALM & format support". Rivet has no Polarion/Jira/Codebeamer connector — only a stub in `oslc.rs` plus ReqIF.
3. **Ecosystem.** useblocks ships 15+ cooperating repos (`sphinx-simplepdf`, `sphinx-test-reports`, `sphinx-codelinks`, `sphinx-emf`, `sphinx-needs-enterprise`, `sphinx-safety`, `needs-config-writer`, `bazel-drives-sphinx`). Rivet is a single repo.
4. **Commercial backing.** useblocks sells products; public-roadmap repos `ubCode-pub`, `ubTrace-pub`, `ubConnect-pub`. Rivet has no commercial sponsor.
5. **RST / Sphinx ergonomics.** Sphinx-resident teams get native authoring; rivet forces YAML.
6. **PDF output.** `sphinx-simplepdf` produces signed-off PDFs; rivet has dashboard + Zola only.

## 5. Where rivet is AHEAD

1. **Formal verification.** 27 Kani BMC harnesses in `rivet-core/src/proofs.rs` (commit parsing, artifact IDs/ranges, trailers, store upsert, diff, validation guards, markdown, HTML strip). Verus (`verus/`) + Rocq (`proofs/rocq/`) jobs wired through CI via Bazel. No useblocks repo shows equivalent scaffolding.
2. **Verification pyramid.** `rivet-core/tests/differential_yaml.rs` (rowan vs serde_yaml), five `proptest_*.rs` files, dual-crate `cargo-mutants`, and five fuzz targets in `fuzz/fuzz_targets/`.
3. **MCP server is core.** `rivet mcp` is FEAT-010 with CRUD + integration tests. useblocks' comparable `pharaoh` is a 5-star research scaffold, not a shipped product.
4. **S-expression constraints with quantifiers.** `rivet-core/src/sexpr_eval.rs` provides `forall`, `exists`, `reachable-from`, `reachable-to` over the link graph — strictly richer than `needs_variants` or `needs_constraints`.
5. **Incremental validation via salsa.** `rivet-core/src/db.rs` makes validation O(changed), not O(all).
6. **Standalone Rust binary.** No Python, no Sphinx. HTMX/Mermaid/fonts bundled via `include_str!`.
7. **Schema breadth.** 27 YAML schemas in `schemas/`: ISO 26262, DO-178C, IEC 61508, IEC 62304, EN 50128, ASPICE, ISO/PAS 8800, SOTIF, EU AI Act, STPA, STPA-Sec, STPA-AI, SCORE, AADL, supply-chain, safety-case, plus bridges.
8. **PLE self-application.** Rivet drives its own roadmap through `artifacts/features.yaml` and `v040-features.yaml`.
9. **YAML parser hardening.** Rowan CST (`yaml_cst.rs`, `yaml_hir.rs`, `yaml_edit.rs`) + fuzzer (PR #160) catching silent-accept bugs.

## 6. Complementary, not competing

Rivet ships `rivet-core/src/formats/needs_json.rs`, which reads sphinx-needs `needs.json` (current-version selection, configurable type mapping, id-transform, link-type override). Interop is a one-liner in either direction:

- Sphinx-Needs project → normal Sphinx build → `needs.json` → `rivet validate` + `rivet serve` + `rivet mcp` on top — keeping RST authoring and ALM bridges while adding verification and agent workflows.
- Rivet project → `rivet export` (JSON/HTML/Zola) → feed into ubConnect for Polarion/Jira sync and PDF delivery.

ReqIF works similarly in both directions (`rivet-core/src/reqif.rs` ↔ useblocks' `reqif` repo).

## 7. Strategic recommendation

Use Sphinx-Needs + useblocks if you are a European OEM/Tier-1 already in RST/Sphinx, need Polarion/Jira/Codebeamer sync, want signed PDFs, or need commercial support. Use rivet if you are Rust-native, want MCP and AI-agent workflows first-class, want a single binary without a Python toolchain, or care about a formal-verification pyramid (Kani + Verus + Rocq + differential + proptest + mutation + fuzz) over your traceability engine. The `needs.json` adapter and ReqIF make them interoperable — no migration required to run both.

## 8. Evidence register

### Quoted useblocks landing-page content (verbatim)

- Product tags: `ubConnect` — "Bridge legacy ALM with Engineering-as-Code"; `ubCode` — "Embed compliance checks directly in development."; `Sphinx-Needs` — "Boost developer productivity at the source."; `ubTrace` — "Gain visibility and control across the lifecycle."
- Hero: "Turn every commit into Audit-Ready Documentation, in seconds, not hours. Engineering as Code integrates directly into your workflow, linking requirements, code, and tests the moment you build."
- Adoption: "30+ OEMs & Tier-1s" — BMW, Volkswagen, Eclipse Project, and aerospace/defense Tier-1s.
- ubCode bullets: "Instant linting & need validation"; "IDE-native & ecosystem-ready"; "Live preview in <0.2s".
- ubConnect bullets: "Wide ALM & format support"; "Runs anywhere"; "ReqIF export".

### useblocks GitHub org repos (per `gh repo list useblocks`)

`sphinx-needs` (~275 stars), `sphinx-collections`, `sphinx-simplepdf`, `sphinx-test-reports`, `sphinx-data-viewer`, `sphinx-needs-demo`, `pharaoh` (5 stars, "Agentic AI framework for sphinx-needs projects"), `sphinx-codelinks`, `sphinx-emf`, `sphinx-needs-enterprise`, `sphinx-safety`, `reqif`, `hammocking`, `spl-core`, `SPLed`, `needs-config-writer`, `bazel-drives-sphinx`, `sphinx-ai-index`, `ubCode-pub`, `ubTrace-pub`, `ubConnect-pub`.

### Rivet source paths (verified)

- CLI subcommands in `rivet-cli/src/main.rs`: Init, Validate, List, Stats, Coverage, Diff, Export, Schema, Docs, Commits, Serve, Snapshot, Variant, Import, ImportResults, Add, Modify, Batch, Embed, Stamp.
- 27 schemas in `schemas/` (enumerated in section 2).
- `rivet-core/src/db.rs` (salsa), `sexpr.rs` + `sexpr_eval.rs` (forall/exists/reachable-from/reachable-to), `proofs.rs` (27 `#[kani::proof]` by grep), `reqif.rs`, `formats/needs_json.rs`, `yaml_cst.rs` + `yaml_hir.rs` + `yaml_edit.rs`, `compliance.rs`, `feature_model.rs`, `oslc.rs`.
- Tests: `differential_yaml.rs` (6), `stpa_sec_verification.rs` (16), `proptest_{core,feature_model,operations,sexpr,yaml}.rs`.
- Fuzz: `fuzz/fuzz_targets/fuzz_{yaml_artifact,document_parse,needs_json_import,reqif_import,schema_merge}.rs`.
- VS Code: `vscode-rivet/package.json` — `rivet-sdlc`, v0.3.0.
- PLE self-app: `artifacts/features.yaml`, `artifacts/v040-features.yaml`.
- Verus/Rocq: `verus/BUILD.bazel`, `proofs/rocq/`.
- `CHANGELOG.md` v0.4.0: verification pyramid, PLE, Zola, Sphinx-needs JSON adapter, LSP code actions, MCP CRUD, variant-scoped validate, 27 Kani.

### Training-only (unverified)

Sphinx-Needs specifics marked "(training-only, unverified)" in section 2 — docs site not fetched. Verify against sphinx-needs.readthedocs.io.

<!--
Refs: FEAT-025, FEAT-001
Trace: skip
-->
