window.BENCHMARK_DATA = {
  "lastUpdate": 1779303563121,
  "repoUrl": "https://github.com/pulseengine/rivet",
  "entries": {
    "Rivet Criterion Benchmarks": [
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "02b93288eb6c4767f1dd255c9b0e1a53caec98ea",
          "message": "ci(release): make build-test-evidence non-blocking (continue-on-error) (#272)\n\nAfter #269 (wasm-component-ld) and #271 (lld/wasm-ld), the build-test-\nevidence job still fails: the spar wasm32-wasip2 build pulls in highs-sys\n(a C++ solver), whose CMake CXX-ABI probe needs a full WASI C/C++ SDK —\nwasm-ld can't find crt1.o, -lc, -lc++, -lc++abi, or\nlibclang_rt.builtins-wasm32.a. The runner image no longer ships a wasi\nsysroot, and wiring in wasi-sdk is a bigger lift.\n\nThe test-evidence bundle is a compliance artifact, not a user-facing\nbinary. Mark the job continue-on-error so a failure doesn't skip Create\nGitHub Release — the release ships 8/9 assets (all binaries + vsix +\ncompliance report + SHA256SUMS, minus rivet-vX.Y.Z-test-evidence.tar.gz).\nRestoring it properly (install wasi-sdk, set WASI_SDK_PATH) is tracked\nseparately.\n\nSurfaced blocking the v0.9.0 release.\n\nCo-authored-by: Claude Opus 4.7 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-05-12T11:01:27-05:00",
          "tree_id": "53d4a4254669df75d11c6c4c8c443e6583144b8b",
          "url": "https://github.com/pulseengine/rivet/commit/02b93288eb6c4767f1dd255c9b0e1a53caec98ea"
        },
        "date": 1778602086670,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 83108,
            "range": "± 1926",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 894637,
            "range": "± 4555",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 16470216,
            "range": "± 1221264",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1944,
            "range": "± 11",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25139,
            "range": "± 106",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 369806,
            "range": "± 6308",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 97,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/1000",
            "value": 97,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 97,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1179021,
            "range": "± 10189",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 166424,
            "range": "± 7521",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1925750,
            "range": "± 99276",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 35295986,
            "range": "± 2414501",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 135937,
            "range": "± 1481",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1269883,
            "range": "± 12646",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 16904098,
            "range": "± 1013276",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4176,
            "range": "± 24",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 45693,
            "range": "± 168",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 741148,
            "range": "± 7339",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 57694,
            "range": "± 3221",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 701372,
            "range": "± 4446",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8162718,
            "range": "± 169556",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 771,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 6757,
            "range": "± 12",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 91811,
            "range": "± 267",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22220,
            "range": "± 77",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 150791,
            "range": "± 1969",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1394805,
            "range": "± 10135",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "ff89f989948bf222e4c5d84b8905bbe7f5ae7e10",
          "message": "fix(serve): mermaid fenced blocks broken by HTML-entity escaping (#273)\n\n* fix(serve): emit fenced ```mermaid bodies verbatim, not HTML-escaped\n\n`render_markdown` injected synthetic `<pre class=\"mermaid\">` wrappers but\nstill let the fenced body flow through pulldown-cmark's `html::push_html`,\nwhich HTML-entity-escapes Event::Text — so mermaid's core `-->` arrow\nrendered as `--&gt;` (and class-diagram `<|--` as `&lt;|--`), and\nmermaid.js rejected the diagram with \"Syntax error in text\". Reported by\na user against v0.6.0 and v0.8.0.\n\nRe-tag the in-mermaid Text segments as Event::Html so they pass through\nunescaped. Mermaid diagram source contains no HTML tags; a `</pre>`\nsmuggled into a ```mermaid block would at worst close the block early,\nand `<script>` etc. are still stripped by the `sanitize_html` pass.\n(`document.rs`'s separate document renderer already emits the body\nverbatim via `join(\"\\n\")` — only `render_markdown` had the bug.)\n\nCoverage:\n- two markdown.rs unit tests: stateDiagram `[*] -->` arrows survive\n  verbatim with no `--&gt;`; classDiagram `<|--` survives with no `&lt;|--`.\n- new tests/playwright/mermaid.spec.ts: ARCH-CORE-001's embedded\n  ```mermaid flowchart serves with `Config --> Store` verbatim, and\n  mermaid.js renders it to an SVG with no \"Syntax error\" box.\n\nFixes REQ-032.\n\nImplements: REQ-032\nVerifies: REQ-032\n\nCo-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>\n\n* style: cargo fmt the new mermaid regression test\n\nWraps an over-long assert!() the formatter flagged. No behaviour change.\n\nTrace: skip\n\nCo-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>\n\n---------\n\nCo-authored-by: Claude Opus 4.7 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-05-12T13:54:46-05:00",
          "tree_id": "08588a62f8826dd1da7026559f70bf05f763abd7",
          "url": "https://github.com/pulseengine/rivet/commit/ff89f989948bf222e4c5d84b8905bbe7f5ae7e10"
        },
        "date": 1778612478776,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 81540,
            "range": "± 767",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 853988,
            "range": "± 3929",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 11199692,
            "range": "± 431145",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2168,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25835,
            "range": "± 229",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 352717,
            "range": "± 11320",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 95,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/1000",
            "value": 95,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 95,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1195609,
            "range": "± 22767",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 165480,
            "range": "± 983",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1905338,
            "range": "± 19234",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 24827464,
            "range": "± 1138121",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 141631,
            "range": "± 3648",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1243665,
            "range": "± 31845",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 13654168,
            "range": "± 757781",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4302,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 59292,
            "range": "± 195",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 768803,
            "range": "± 2142",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 60337,
            "range": "± 197",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 687995,
            "range": "± 3610",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7496030,
            "range": "± 79344",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 776,
            "range": "± 10",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7176,
            "range": "± 46",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 110066,
            "range": "± 860",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 24045,
            "range": "± 131",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 167988,
            "range": "± 1670",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1550374,
            "range": "± 18652",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "2754ae12dc59d0b27c707bf44e443f46d7ca1828",
          "message": "docs(design): three roadmap design tracks for v0.10 (variant, cross-org, TCL) (#277)\n\n* docs(design): variant-aware properties — per-variant field values on one artifact\n\nDesign note for issue #255: how to express that the same logical\nrequirement (e.g. `REQ-THERMAL-01: Operating temperature envelope`) has\ndifferent field values across product variants — `max-temp-c: 80` for the\nautomotive variant, `100` for industrial, `70` for consumer — without\nsplitting the artifact and breaking derives-from / verifies / satisfies\nlink semantics.\n\nSurveys the design space across five options (per-variant overrides,\nvariation expressions, multiple bound artifacts, references into\nvariant attributes, sphinx-needs-style filters) and scores each on\nvalidator complexity, dashboard rendering, traceability preservation,\nAI-tool friendliness, and audit friendliness.\n\nSurveys what competitors do (Polarion variant management, DOORS Next +\npure::variants, sphinx-needs, pure::variants variation points,\nFeatureIDE / Clafer / TVL) and what the academic literature says\n(Czarnecki & Eisenecker staged configuration, COVAMOF, Attributed\nFeature Models, TypeChef variability-aware analysis).\n\n**Recommendation:** option A — `fields-per-variant:` keyed by variant\nconfig or feature name, first-match-wins, zero new evaluator\nrequired. Forward-compatible to option B (variation expressions) once\nthe scalar value space stabilises.\n\nMVP scope (v1) deliberately excludes compositional merge, multi-axis\ncomposition, t-wise sampling, attribute-restriction values, and\nexhaustiveness checking — those are deferred to a future release and\nthe deferral list is named explicitly. This frames the next 12 months\nof grant-funded variant work realistically: ship the readable single-\nmaster overlay first; resist the SAT/SMT compositional generalisation\nuntil users push for it.\n\nRefs: #255\n\n* docs(design): cross-org / supplier traceability — external-anchor + boundary coverage\n\nDesign note for issue #253: how rivet should represent the case where\nthe top of a project sits in one organisation, parts of the chain are\nin-house variants, and other parts are owned by an external supplier\nwhose model, field names, and even toolchain are not under our\ncontrol.\n\nToday's `externals:` model in `rivet.yaml` assumes the dependency\nrepo is a rivet repo with reachable schemas — that breaks the moment\na downstream party runs Polarion, DOORS, or just a different field\nconvention. The proposal:\n\n1. Typed `external-anchor` artifact (in `schemas/common.yaml`) — an\n   explicit leaf representing the point at which an in-house chain\n   hands off to an external party. Carries `source-of-truth`,\n   `expected-derived-types`, `received-status`, optional\n   `contract-reference` and `cited-source` (reusing the shipped\n   sha256-stamped typed field).\n\n2. Cross-org link semantics — `derives-from-external` link type with\n   structured target (`org`, `contract`, `doc-id`, `last-synced`,\n   `sha256`, optional `anchor`). The link's `target` field becomes a\n   mapping for this one link type, staying a string for all others.\n\n3. Three-state coverage (`SATISFIED` / `EXTERNAL_BOUNDARY` /\n   `UNCOVERED`) — replaces the binary covered/uncovered model so\n   audits can distinguish \"we forgot to satisfy this\" from \"this is\n   delegated to a supplier\". An artifact terminating at an\n   `external-anchor` whose `expected-derived-types` covers the\n   missing type counts as EXTERNAL_BOUNDARY.\n\n4. Field-mapping recipe — reuse `schemas/migrations/` shape at the\n   import boundary (not just for in-store schema-version bumps).\n\n5. Provenance — new `FederationProvenance` block on the `Provenance`\n   struct: `source_org`, `source_tool`, `source_id`, `anchor`,\n   `fetched_at`, `source_hash`, optional `mapping_recipe`.\n\nSurveys competitors (Polarion ALM Connector / OSLC, IBM DOORS Next /\nGCM, sphinx-needs `needs_external_needs`, OSLC Core/RM/QM/CM,\nReqIF + ProSTEP iViP guide, AUTOSAR ARXML, ISO 26262-8 §5 DIA, ASPICE\nSUP.10 / SUP.8) and identifies the gap rivet fills: a file-based,\ngit-coordinated alternative that copies OSLC's link semantics\nwithout inheriting its live-HTTP protocol assumption.\n\n**MVP scope (~3 weeks)** — declarative only: `external-anchor` artifact\ntype + 3-state coverage + read-only `rivet supplier list` / `check`.\n**Phase 2** — `derives-from-external` structured link, ReqIF pull-mode\nfetch, `FederationProvenance`. **Phase 3** — field-mapping recipes,\n`rivet supplier publish`, OSLC / Polarion / GitHub-issues backends,\nvariant-aware anchors, `rivet supplier promote`.\n\nThis is the \"executable specification across the OEM-supplier\nboundary\" story for the grant Workstream 3-A.\n\nRefs: #253\n\n* docs(design): tool confidence level — TCL/TQL cross-walk + dossier outline\n\nResearch and design note covering tool-qualification levels across\nfive regimes (ISO 26262 Part 8 §11, IEC 61508-3, DO-178C / DO-330,\nEN 50128, ISO/SAE 21434, ISO/PAS 8800), what claim rivet should make,\nhow the shipped formal-method backstops (Verus, Kani, Rocq, mutation\ntesting) and oracle-gated agent pipelines map to TI / TD parameters,\nand what's missing to support a credible dossier.\n\nKey findings:\n\n1. **Numbering-convention warning.** ISO 26262 / EN 50128 / IEC 61508\n   number `lower = lower bar` (TCL1 = weakest claim). DO-330 and\n   ISO/PAS 8800 number `lower = higher bar` (TQL-1 = strongest). The\n   existing `safety/stpa/tool-qualification.yaml` mixes the\n   conventions (\"TCL 1 (highest)\" using the DO-330 convention with\n   an ISO 26262 acronym) — that's an audit-review flag in itself.\n   First fix is to use standard-native numbering and never abbreviate\n   \"TCL N\" without the regime in front.\n\n2. **Polarion's TCL1 claim is conditionally honest for human-authored\n   content and increasingly threadbare for AI-authored content.** The\n   TI2/TD1 → TCL1 argument relies on human review as the TD layer.\n   When AI authors at agent-speed, that review degrades. Rivet's\n   opportunity is to be the tool that lets a customer KEEP a TCL1\n   claim by contributing TD-raising machinery to the toolchain — not\n   to claim TCL1 as a passive-ALM peer.\n\n3. **Honest peer group for rivet is medini / BTC, not Polarion.** The\n   practical target is TCL2 with a TCL3 path — supported by 19\n   shipped safeguards (typed schema, link oracle, validation engine,\n   Verus specs, Kani BMC, Rocq proofs, mutation testing, property\n   tests, differential testing, provenance auto-stamp, cited-source\n   hashing, schema-migrate snapshot/abort, oracle-gated agent\n   pipelines, `rivet docs check`, `rivet check review-signoff`,\n   commit-trailer enforcement, validate-determinism property,\n   SCRC restriction-lint set, STPA self-analysis).\n\n4. **`ai-found-defect` artifact type is the missing piece.** When an\n   AI agent flags a contradiction, that finding is itself a tool\n   output that should be traceable. Today there is nowhere to put\n   it. Proposed: a typed artifact carrying severity,\n   detection-method, oracle-id, agent identifier, reproducer,\n   triage-status, and a `defect-against` link target — first-class\n   evidence, not chat history.\n\n5. **`tool-confidence` typed artifact** (already gap-flagged in\n   docs/design/iso26262-artifact-mapping.md §C row 32). Small,\n   tractable schema sketch included.\n\n6. **Three-layer dossier outline** for `rivet docs tool-qualification`:\n   TOR, use cases, verification plan, configuration baseline, known\n   limitations, error-detection-and-reporting process, TCL/TQL\n   position statement per regime.\n\n7. **Five-step rollout** (1h–1d each) to move from \"TCL1 in our own\n   dogfood STPA\" to \"TCL2 dossier draft published, reviewable.\"\n\nThis is the source design for the grant Workstream 3-B dossier work.\n\nRefs: REQ-051 (hook security model context),\n      docs/design/iso26262-artifact-mapping.md §C row 32,\n      docs/design/ai-safety-cyber-hitl.md\n\n* fix(docs): split multi-document yaml example in variant-aware-properties\n\n`rivet docs check` ConfigExampleFreshness invariant requires each\n```yaml block to parse as one valid YAML document. The example at\nline 326 mixed a top-level mapping (variant config) and a sequence\n(artifact list entry) in a single fence, which fails YAML parse at\nthe mapping→sequence transition.\n\nSplit into two adjacent ```yaml blocks — one per file — so each\nparses cleanly and the syntax highlighter still renders both.\n\nRefs: #255",
          "timestamp": "2026-05-14T12:35:54-05:00",
          "tree_id": "f81c913a2b73de825213ead2bfa1978f4cb88410",
          "url": "https://github.com/pulseengine/rivet/commit/2754ae12dc59d0b27c707bf44e443f46d7ca1828"
        },
        "date": 1778800706751,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 83840,
            "range": "± 2185",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 883377,
            "range": "± 22973",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12571152,
            "range": "± 678868",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1949,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24235,
            "range": "± 33",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 357019,
            "range": "± 7483",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 97,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/1000",
            "value": 97,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 97,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1178111,
            "range": "± 22881",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 167918,
            "range": "± 827",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1954698,
            "range": "± 26664",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 37009435,
            "range": "± 3548111",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 136696,
            "range": "± 2318",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1262782,
            "range": "± 27719",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 18503941,
            "range": "± 823182",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4173,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 43296,
            "range": "± 107",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 723840,
            "range": "± 2978",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 63880,
            "range": "± 3348",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 715024,
            "range": "± 5671",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8034868,
            "range": "± 309000",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 779,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 6558,
            "range": "± 12",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 89985,
            "range": "± 362",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21849,
            "range": "± 79",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 150209,
            "range": "± 2700",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1399707,
            "range": "± 9255",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "dde04b418a9d1676360a9fad5bd4a5b205bae31c",
          "message": "feat(validate): status-gate rules — cross-artifact status preconditions via s-expr (#276)\n\n* feat(validate): status-gate rules — cross-artifact status preconditions via s-expr\n\nIntroduces a third schema rule kind, `validation-rules:`, that declares\nstatus preconditions on traceability links. The motivating shape is the\nV-model promotion gate: a sys-verification can only be approved/released\nwhen every requirement it verifies is already approved. Today's two rule\nkinds (traceability-rules, conditional-rules) couldn't express this —\nthey check link shape or single-artifact predicates, not the state of\nlinked artifacts.\n\nThe implementation is deliberately thin (~470 LOC + 15 tests) because\nthe primitives already existed: a link graph, a store, an s-expression\nevaluator with Forall/Exists nodes, and a 9-phase diagnostic pipeline.\n\nEngine (rivet-core/src/sexpr_eval.rs):\n\n- 4 new Expr variants implementing implicit-context-shift link\n  traversal: ForallLinked, ExistsLinked, ForallLinkedFrom (inbound),\n  ExistsLinkedFrom (inbound). Each shifts ctx.artifact to each\n  target/source rather than introducing variable binders — same trick\n  the existing store-wide Forall uses.\n- New MissingTargetPolicy enum + missing_target_policy field on\n  EvalContext, threaded through every recursive construction site.\n  Skip (default) treats unresolved targets as vacuous-true for forall;\n  Fail treats them as body-predicate failure. Composes cleanly with\n  cross-org / external-anchor boundaries and broken-links detection.\n- Audit-strict empty-set semantics: `(forall-linked \"verifies\" pred)`\n  over zero outbound `verifies` links returns false, not true. A\n  verifier with nothing to verify cannot satisfy the gate. The\n  link-suffixed name signals the deviation from classical forall.\n- Lowering for forall-linked / exists-linked / forall-linked-from /\n  exists-linked-from added to lower_list, plus the HEADS array used\n  for unknown-head error hints.\n- matches_filter_with_policy helper for callers that need to pass a\n  caller-chosen policy (the validate phase uses this).\n\nSchema (rivet-core/src/schema.rs):\n\n- ValidationRule struct: id, description?, rule (the single s-expr\n  body), on_unresolved (Skip|Fail, default Skip), draft_downgrade\n  (opt-in, default false), severity (default Error), message\n  (template). Wired into SchemaFile and the merged Schema.\n- MissingTargetPolicyName YAML-facing enum + From impl converting to\n  the engine-side MissingTargetPolicy.\n\nValidate (rivet-core/src/validate.rs):\n\n- evaluate_validation_rules runs as a new phase after conditional\n  rules. Per rule: parse the body once, apply the rule's policy,\n  evaluate against each artifact, emit a Diagnostic on false. Parse\n  errors in a rule body surface as a rule-level diagnostic rather\n  than panicking or silently passing every artifact.\n- render_validation_message substitutes {id}, {type}, {status},\n  {title}, {rule} placeholders from the artifact under test. Unset\n  status renders as `<unset>` so the auditor sees the absence\n  rather than an empty string. Unknown placeholders are left in\n  place — surfaces typos in rule messages instead of swallowing.\n- draft-downgrade is opt-in per rule. Status-gate rules typically\n  gate by status (the `when` premise filters by status: approved),\n  so the existing draft-downgrade behaviour would be dead code; rules\n  that need it set draft-downgrade: true explicitly.\n\nDogfood (schemas/aspice.yaml):\n\n- Three V-model status-gate rules: V-sys-verification-needs-approved-req\n  (SYS.5), V-sw-verification-needs-approved-req (SWE.6),\n  V-unit-verification-needs-approved-design (SWE.4). Each follows\n  the (implies <premise> <consequence>) idiom with a forall-linked\n  consequence. The all_preset_validation_rules_parse_cleanly test\n  pins the rule count >= 3 so a future removal trips CI.\n\nTests (15 new):\n\n- sexpr_eval.rs: 12 unit tests covering empty-set audit-strict,\n  body-pass/body-fail, missing-target × Skip/Fail policy, inbound\n  variants, end-to-end parse_filter for all 4 keywords, and the\n  status-gate idiom shape across pass/fail/vacuous-premise cases.\n- validate.rs: 3 integration tests for phase 9 — end-to-end status\n  gate firing, malformed-rule parse-error surface, draft-downgrade\n  opt-in flipping Error → Info on drafts.\n- schema_validation_rules.rs (new file): ASPICE preset rules\n  deserialise, the SYS.5 rule fires on bad shape and stays silent on\n  clean shape, every preset's rule body parses cleanly.\n\nDesign semantics resolved during review (full rationale in\ndocs/design/status-gate-rules.md):\n\n- Empty-set forall: audit-strict false (deviation from classical forall;\n  link-suffixed name signals it). A verifier with no verifies link\n  cannot satisfy the gate.\n- Missing target: per-rule policy, default skip. Cross-org boundaries\n  compose; safety-critical gates can opt into fail.\n- Rule shape: single s-expr per rule with the (implies premise\n  consequence) idiom as the convention.\n- Draft cascade: opt-in via draft-downgrade: true. Default off.\n\nImplements: REQ-004\nRefs: REQ-010\n\nCo-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>\n\n* test(validate): deep-test pass — edge cases, mutants, proptest, V-model graphs\n\nUser pushback: \"you need to test this new stuff really deep out before we go\nwith it.\" This commit adds the depth.\n\nCoverage added across 7 dimensions (~1300 LOC of new tests):\n\n1. Edge cases (sexpr_eval.rs, 9 new tests):\n   - Self-loops (A verifies A) terminate, evaluate body against self.\n   - Cycles (A verifies B verifies A) are one-hop — no infinite recursion;\n     bounded by static rule nesting, not by graph depth.\n   - Duplicate edges are functionally idempotent.\n   - Wildcard link-type returns audit-strict false (documented).\n   - Missing status field on target → \"not approved\" (audit intent).\n   - Deeply nested rule bodies (3-deep forall-linked chain) terminate.\n   - Mixed forall+exists in one rule body composes cleanly.\n   - Inbound/outbound link-type filters distinguish matching types\n     (mutation-survivor regression fix — see point 4).\n\n2. Phase interactions (validate.rs, 4 new tests):\n   - on-unresolved: skip + broken link → only broken-links phase fires.\n     Validation-rule stays silent (vacuous-true on the unresolved link;\n     broken-links phase 6 covers breakage).\n   - on-unresolved: fail + broken link → BOTH phases fire. Distinct rule\n     fields (`broken-link` vs `<rule-id>`) — correct double-coverage, not\n     duplication.\n   - Schema merge concats validation_rules without deduping by id —\n     documented behaviour.\n   - Phase-7 traceability draft-downgrade does NOT cascade into phase-9\n     validation rules. Each phase owns its own severity policy.\n\n3. Negative / malformed input (validate.rs, 7 new tests):\n   - Empty rule body → inert (parses to BoolLit(true); never fires).\n     Documented as future polish.\n   - Whitespace-only body → same shape, inert.\n   - Unknown operator → rule-level diagnostic with \"malformed\" message.\n   - Mismatched parens → rule-level diagnostic.\n   - Unknown field reference → resolves to empty string, evaluates\n     predictably, no panic.\n   - 100-deep nested rule body → no stack overflow.\n   - Link-type typo (\" verifies \" with spaces) → audit-strict empty fires\n     on every matching artifact, surfacing the typo loudly.\n\n4. Mutation testing (cargo-mutants --in-diff against the PR's diff):\n   - First pass: 1 missed mutant at ForallLinkedFrom's link-type filter\n     (`bl.link_type == lt` → `!=` was not caught by existing inbound\n     tests, which had only one inbound link type).\n   - Added two targeted tests with two link types and distinguishing\n     bodies. Re-ran: 26 caught, 3 unviable, 0 missed.\n\n5. Proptest extensions (sexpr_fuzz.rs, 3 new properties):\n   - Extended arb_expr to generate the four new link-traversing\n     quantifiers (ForallLinked, ExistsLinked, ForallLinkedFrom,\n     ExistsLinkedFrom). The existing roundtrip-equivalence property now\n     exercises them: print → reparse → same eval, holding for all\n     generated bodies.\n   - forall-linked over zero links is false for any body (audit-strict).\n   - exists-linked over zero links is false for any body.\n   - Policy monotonicity: forall-linked under Fail policy true ⇒ true\n     under Skip policy. (The reverse direction does NOT hold — Skip is\n     strictly more permissive; that asymmetry is the whole point.)\n\n6. Rich V-model graph (schema_validation_rules.rs, 2 new tests):\n   - 17-artifact V-model (stakeholder-req → system-req → sw-req →\n     sw-detail-design → unit/sw/sys-verification) with mixed approval\n     state. Validates against the full aspice preset.\n   - Each rule fires EXACTLY on its expected violation (SYV-002, SWV-002,\n     UV-002) and stays silent on every clean artifact (the other 14).\n   - Catches the \"rule accidentally hits unrelated artifacts\" regression\n     class that unit tests miss.\n\n7. Performance + scale smoke (schema_validation_rules.rs):\n   - 200-artifact synthetic store (100 verifiers, half with draft\n     targets). Full validate completes in well under 1 second.\n   - 50 expected violations, 50 observed. Pin against O(N²) regressions.\n\nNet additions:\n- 22 new tests (lib + integration).\n- 974 lib + 83 integration tests pass (up from 954 + 81 in the original\n  feature commit).\n- 0 mutation survivors on the diff.\n\nImplements: REQ-004\nVerifies: REQ-004\nRefs: REQ-010\n\nCo-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>\n\n* fix(validate): CI follow-ups — cargo fmt, Kani SchemaFile, Miri-ignore\n\nThree small fixes for CI failures observed on PR #276:\n\n1. **cargo fmt** auto-rewrites in sexpr_eval.rs and validate.rs — vec!\n   literals and slice initializers normalised to single-line form.\n\n2. **Kani build error** — proofs.rs had four `SchemaFile { ... }` literal\n   constructions that needed `validation_rules: vec![],` for the new\n   schema field. These are gated behind `#[cfg(kani)]` so the normal\n   `cargo check` and `cargo test` don't reach them — only the Kani CI\n   job exercised the cfg cone and surfaced the build error.\n\n3. **Miri test runtime** — 13 of the new validate::tests::* call\n   `validate()` which parses each rule body via `parse_filter`. Building\n   rowan CSTs under Miri hits the known tree-borrows deallocation UB\n   (pulseengine/rowan#211; documented in sexpr_eval.rs:1457). Following\n   the project's existing pattern, each new test now carries\n   `#[cfg_attr(miri, ignore)]`. The pure-evaluator tests in sexpr_eval\n   (which exercise `check()` on hand-built AST nodes without going\n   through `parse_filter`) stay enabled under Miri.\n\nTwo PR #276 CI failures are infrastructure flake, not addressed here:\n- Supply Chain (cargo-vet): runner received shutdown signal mid-job.\n- Verus Proofs: Nix installer fails with \"sudo: 'no new privileges'\n  flag is set\" on the self-hosted runner. Same shape as cargo-vet —\n  runner-config issue, not source-code issue. Both will retry on push.\n\nRefs: REQ-004\n\n---------\n\nCo-authored-by: Claude Opus 4.7 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-05-14T13:08:31-05:00",
          "tree_id": "644ffe65749d611f1639b9bf5fbce099d22eac18",
          "url": "https://github.com/pulseengine/rivet/commit/dde04b418a9d1676360a9fad5bd4a5b205bae31c"
        },
        "date": 1778812136964,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 79271,
            "range": "± 572",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 863773,
            "range": "± 4996",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 11944756,
            "range": "± 754473",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2200,
            "range": "± 14",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25238,
            "range": "± 285",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 375162,
            "range": "± 2631",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 94,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/1000",
            "value": 94,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 94,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1210780,
            "range": "± 31614",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 159222,
            "range": "± 991",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1892318,
            "range": "± 37200",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 24313309,
            "range": "± 1414191",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 141952,
            "range": "± 610",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1256001,
            "range": "± 19000",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 13538015,
            "range": "± 732176",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4289,
            "range": "± 54",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 58400,
            "range": "± 653",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 825543,
            "range": "± 4104",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 63394,
            "range": "± 799",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 704114,
            "range": "± 6137",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8003798,
            "range": "± 364770",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 833,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7758,
            "range": "± 76",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 119454,
            "range": "± 918",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 24957,
            "range": "± 220",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 184140,
            "range": "± 910",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1747302,
            "range": "± 34536",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "5ee516315d385851997153e9d2dc8fed1dd7dbff",
          "message": "chore: ignore mutants.out*/, .rivet/mythos/, .rivet/repos/ (#278)\n\nThree transient working-tree paths that have been showing up as\nuntracked across recent sessions:\n\n- `mutants.out/` + `mutants.out.old/` — cargo-mutants per-run output.\n  Large (~MB per run), transient, per-developer. cargo-mutants rotates\n  the previous run to `.old` automatically.\n- `.rivet/mythos/` — slop-hunt agent pipeline workproducts. The\n  pipeline source lives under `scripts/mythos/`; transient outputs\n  (drafts, ranking JSON, comparison reports) belong outside VCS.\n- `.rivet/repos/` — destination for `rivet sync` external clones.\n  Per-developer working tree, never committed. Sibling tracked\n  `.rivet/` files (agent-context.md, provenance-pending.json) stay\n  tracked.\n\nNo behaviour change; these were never committed, but they pollute\n`git status` and risk an accidental `git add .` capture.",
          "timestamp": "2026-05-15T01:07:59-05:00",
          "tree_id": "009f017cda9229f7f10e0ef29609da33042a07ae",
          "url": "https://github.com/pulseengine/rivet/commit/5ee516315d385851997153e9d2dc8fed1dd7dbff"
        },
        "date": 1778825675102,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 80927,
            "range": "± 949",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 868725,
            "range": "± 6022",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12864975,
            "range": "± 544010",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1943,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24655,
            "range": "± 52",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 374630,
            "range": "± 2325",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 97,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/1000",
            "value": 97,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 97,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1216230,
            "range": "± 13540",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 166812,
            "range": "± 1159",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1941696,
            "range": "± 12458",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 27865360,
            "range": "± 1022575",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 134924,
            "range": "± 1962",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1269589,
            "range": "± 21544",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 15179242,
            "range": "± 949773",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4106,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 44212,
            "range": "± 214",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 741062,
            "range": "± 4704",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 64759,
            "range": "± 685",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 703943,
            "range": "± 10980",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7921433,
            "range": "± 92689",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 793,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 6826,
            "range": "± 66",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 92552,
            "range": "± 626",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23784,
            "range": "± 186",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 172595,
            "range": "± 1073",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1623316,
            "range": "± 22322",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "fd4cf192eb6dd6a8a13be0d2b55928c62db44952",
          "message": "ci: stop the Verus/Mutation/cargo-vet self-hosted runner flakes (#281)\n\nThree flake classes hitting every PR today, all on self-hosted runners:\n\n1. Verus + Rocq Proofs: \"sudo: 'no new privileges' flag is set\"\n2. Mutation Testing (rivet-cli): \"No space left on device\"\n3. Supply Chain (cargo-vet): \"runner has received a shutdown signal\"\n\nAll three block green CI on PRs that have nothing to do with the\nunderlying subsystem. Each fix is workflow-level so it lands without\nrunner-host changes.\n\n**1) Verus + Rocq: switch Nix installer.**\nThe self-hosted runners run with systemd `NoNewPrivileges=true`, which\nbreaks `cachix/install-nix-action@v31` because it shells out to sudo\nmid-install. Switch to `DeterminateSystems/nix-installer-action@main`\nwith `init: none` (daemonless single-user mode). Add a follow-up step\nto put `~/.nix-profile/bin` on PATH explicitly. Cost: ~30s install,\ncomparable speed once cached. Keeps the lean-mem requirement intact —\nthe Verus solver still wants the RAM.\n\n**2) Mutation Testing: prune + restrict upload.**\ncargo-mutants writes a per-mutant target directory under `mutants-out/`.\nSeventeen shards landing on the same pool, with the Swatinem cache hot,\nleave 5-15 GB behind each. The next shard's `Upload mutants report`\nstep dies with ENOSPC during the upload itself — after cargo-mutants\nhas finished cleanly. Two changes:\n  - Add a `Prune stale mutants artefacts` step before the run (rm\n    mutants-out, find + rm matching target subdirs older than a day).\n  - Restrict `upload-artifact` path to the text/JSON reports only —\n    skip the per-mutant target directories that drive the bloat. The\n    text reports are what matter for triage.\n\n**3) cargo-vet: wrap in retry.**\nGitHub Actions doesn't expose \"runner restarted under me\" to `if:`\nconditions, but `nick-fields/retry@v3` with `retry_on: error` handles\nit correctly — if the runner agent dies mid-step the step exits\nnon-zero, the action retries on a different runner. Two attempts is\nenough; a third shutdown in ten minutes would point at runner-pool\nsizing, not at this job. Same pattern fits other light jobs (`fmt`,\n`yaml-lint`, `msrv`, `docs-check`) but those aren't currently flaking,\nso leave them alone — speculative retry on stable jobs hides real\nbugs.\n\nCross-cutting note for runner-ops: the underlying fixes for these are\nhost-level too — drop `NoNewPrivileges` from the runner systemd unit\n(fixes #1), lower the `post-job.sh` disk threshold from 70% to ~50%\n(helps #2), grow the lean-mem pool size (helps #3). The workflow-level\nchanges here unblock CI today; the host-level work is the durable fix\nand worth a separate Ansible PR.",
          "timestamp": "2026-05-15T01:11:29-05:00",
          "tree_id": "8ba6b39c639dcc9c29d0148fb9c2b0a2d16e9a60",
          "url": "https://github.com/pulseengine/rivet/commit/fd4cf192eb6dd6a8a13be0d2b55928c62db44952"
        },
        "date": 1778826075278,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 80661,
            "range": "± 703",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 859068,
            "range": "± 36041",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12861743,
            "range": "± 776517",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2214,
            "range": "± 11",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26502,
            "range": "± 786",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 349644,
            "range": "± 7534",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 95,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/1000",
            "value": 94,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 95,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1240487,
            "range": "± 17811",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 158909,
            "range": "± 4226",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1876383,
            "range": "± 22209",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 30575891,
            "range": "± 2813963",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 139423,
            "range": "± 2502",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1242623,
            "range": "± 15371",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 22090176,
            "range": "± 1764655",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4270,
            "range": "± 22",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60744,
            "range": "± 981",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 753117,
            "range": "± 5235",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 60341,
            "range": "± 1514",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 678217,
            "range": "± 2907",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8031501,
            "range": "± 642688",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 772,
            "range": "± 9",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7379,
            "range": "± 55",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 110844,
            "range": "± 721",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23702,
            "range": "± 332",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 171213,
            "range": "± 2893",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1583479,
            "range": "± 21374",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "8f71efeb8dff31c4786fd329a8f066d6eb9f06fc",
          "message": "fix(schema): merge same-name types by union, not replace (#154) (#280)\n\n* fix(schema): merge same-name types by union, not replace (#154)\n\nBridge and overlay schemas that declared an artifact-type or link-type\nwith the same name as a base schema's silently lost the base's fields.\nThe merge was a plain HashMap::insert — later wins, parent fields gone.\n\nThis is the silent-correctness bug behind every bridge schema that\nre-declares a type to add a single safety attribute. A real reproducer\nin this repo: schemas/safety-case.yaml declares `safety-goal` with\nfields [claim, goal-type, asil, undeveloped] and link-field\nsub-goal-of; schemas/iso-26262.yaml re-declares `safety-goal` with\nfields [asil]. Loading [common, safety-case, iso-26262] previously\ngave a `safety-goal` with only [asil] — the GSN claim, goal-type, and\nsub-goal-of link-field were silently dropped. Every safety-case\nartifact in such a project then tripped \"field not defined\" diagnostics\nand zero declared link-fields broke cardinality enforcement.\n\nThe fix:\n\n- Add `ArtifactTypeDef::merge_in_place(&mut self, other: ArtifactTypeDef)`\n  with per-field union semantics:\n  * `description`: later wins when non-empty\n  * `fields`, `link_fields`: union by name; later wins on same-name\n    conflicts (so an overlay can change a field's `required` or\n    `field_type` deliberately, but cannot accidentally drop unrelated\n    fields)\n  * `shorthand_links`, `common_mistakes`: append/extend\n  * `yaml_sections`: union with dedup\n  * `aspice_process`, `example`, `yaml_section`, `yaml_section_suffix`:\n    later-Some wins\n- Add `LinkTypeDef::merge_in_place` with the same shape: scalar fields\n  take later-non-empty; `source_types` and `target_types` union with\n  dedup.\n- Free helper `merge_named_vec` does the union-by-name on Vec<T>\n  (used for both `fields` and `link_fields`).\n- `Schema::merge` switches from `insert` to `entry().{merge_in_place\n  | insert}` for both artifact_types and link_types.\n\nSix regression tests in `schema::tests`:\n\n  merge_same_name_artifact_type_unions_fields\n  merge_same_name_artifact_type_unions_link_fields\n  merge_preserves_shorthand_links_from_parent\n  merge_idempotent_with_same_file_twice\n  merge_order_independent_for_disjoint_additions\n  merge_same_name_link_type_unions_target_types\n\nThe shorthand-link preservation test guards the secondary symptom from\nparent's `controller: …` shorthand silently stopped expanding into a\n`links:` entry — because `Schema::merge` only populates\n`shorthand_links` from the type that survived the insert. With this\nfix, the parent's link-fields stay in place and the shorthand\nexpansion in `yaml_hir::extract_section_item` keeps working.\n\nBackward-compat: projects that relied on the replace behaviour were\nalready re-declaring every parent field (per the G.2 warning in\nrivet-cli/src/quickstart.md), so for them the union is a no-op —\nsame-name fields just stay identical. The new failure mode is\n\"deliberately removing a parent field\", which has no syntax today\n(no `remove-fields:` or `override: true` marker), so removing that\ncapability isn't a regression.\n\nFixes: #154\nImplements: REQ-010\nRefs: REQ-004\n\n* style: cargo fmt the new merge_in_place tests\n\nCI Format job flagged whitespace drift in the new #154 regression\ntests (long argument lists wrapping differently than rustfmt expects).\nPure formatting; no semantic change.",
          "timestamp": "2026-05-15T01:21:24-05:00",
          "tree_id": "8405d7eb35fe76a3359d9bbbf410a0362e2ef3aa",
          "url": "https://github.com/pulseengine/rivet/commit/8f71efeb8dff31c4786fd329a8f066d6eb9f06fc"
        },
        "date": 1778826473060,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 79362,
            "range": "± 812",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 848572,
            "range": "± 15919",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12292927,
            "range": "± 6244463",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2157,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 27018,
            "range": "± 163",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 362191,
            "range": "± 1143",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 96,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/1000",
            "value": 96,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 96,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1247482,
            "range": "± 18430",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 160250,
            "range": "± 627",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1882355,
            "range": "± 24985",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 23760230,
            "range": "± 1314349",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 137509,
            "range": "± 1531",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1222693,
            "range": "± 17439",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 12940359,
            "range": "± 380595",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4349,
            "range": "± 21",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 59569,
            "range": "± 239",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 754703,
            "range": "± 3655",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 60636,
            "range": "± 507",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 686447,
            "range": "± 8484",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7656457,
            "range": "± 88146",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 847,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7513,
            "range": "± 23",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 116283,
            "range": "± 3109",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 24622,
            "range": "± 377",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 189241,
            "range": "± 989",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1644842,
            "range": "± 18389",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "f198d3dc8e1d96aad8a7c56e5f68e9df87cbf089",
          "message": "ci(release): wire wasi-sdk into build-test-evidence; drop continue-on-error (#274)\n\nFollow-up to #269/#271/#272. The spar wasm32-wasip2 build pulls in\nhighs-sys (a C++ solver); building C/C++ for that target needs a full\nWASI toolchain — a sysroot with libc/libc++/libc++abi plus\nlibclang_rt.builtins-wasm32.a, and a wasm linker. The runner image no\nlonger ships any of it, so even with `lld` (wasm-ld) and\nwasm-component-ld installed, wasm-ld errored on `crt1.o` / `-lc` /\n`-lc++`. #272 made the job continue-on-error so the release wasn't\nblocked (v0.9.0 shipped 8/9 assets, missing only test-evidence.tar.gz).\n\nThis installs wasi-sdk 25.0 to /opt/wasi-sdk, puts its bin/ on PATH (so\nwasm-component-ld finds wasm-ld and the cc/cmake build scripts pick up\nthe right clang), and pins CC_/CXX_/AR_wasm32_wasip2 + the wasip2\nsysroot via CFLAGS_/CXXFLAGS_wasm32_wasip2 — so both the CMake CXX-ABI\nprobe and the highs-sys compile resolve their headers/libs. `lld` stays\nas a belt-and-braces wasm-ld source. Drops `continue-on-error` — if\ntest-evidence breaks again it should block the release until fixed.\n\nNot verified locally (spar isn't checked out here); the wasip2 sysroot\nflags or the wasi-sdk version may need a tweak after the first CI run.\nAlternative for a hermetic toolchain (out of scope here): migrate the\nspar-wasm build to Bazel rules_wasm_component — a change in the spar repo.\n\nCo-authored-by: Claude Opus 4.7 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-05-15T08:33:46-05:00",
          "tree_id": "9bf5a0bb8fda339cf76ad3e54fcb1f204414783b",
          "url": "https://github.com/pulseengine/rivet/commit/f198d3dc8e1d96aad8a7c56e5f68e9df87cbf089"
        },
        "date": 1778852416122,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 79444,
            "range": "± 1609",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 836638,
            "range": "± 10985",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13605122,
            "range": "± 821441",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2190,
            "range": "± 11",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26159,
            "range": "± 168",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 374955,
            "range": "± 1233",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 95,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/1000",
            "value": 94,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 95,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1226221,
            "range": "± 65046",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 160066,
            "range": "± 2111",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1902467,
            "range": "± 6145",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 24748386,
            "range": "± 2004880",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 138191,
            "range": "± 4866",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1217063,
            "range": "± 18905",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 12833076,
            "range": "± 463161",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4394,
            "range": "± 29",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 59620,
            "range": "± 260",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 797220,
            "range": "± 1752",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 61437,
            "range": "± 163",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 694440,
            "range": "± 3194",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7742148,
            "range": "± 329947",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 838,
            "range": "± 33",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7576,
            "range": "± 54",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 114923,
            "range": "± 813",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 24371,
            "range": "± 193",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 178595,
            "range": "± 1260",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1635034,
            "range": "± 32897",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "2bd7bd692d79cbe0646ebf1df8b6ab1ed376615a",
          "message": "docs(pre-commit): rivet-validate adoption — install paths, failure mode, audit script (#263)\n\nAddresses the in-scope subset of pulseengine/rivet#187 — the canonical\ntemplate already ships rivet-validate at T1 (templates/pre-commit/.pre-commit-config.yaml:71-86),\nso the gap was on the *adoption* side rather than the template itself.\n\nChanges:\n\n- docs/pre-commit.md\n  - \"Installing rivet\" rewritten: GitHub release binaries exist as of\n    v0.8.0; cargo install must always pass --tag/--rev to avoid drift.\n  - New \"Version-pinning\" subsection with two equivalent recipes\n    (CI cargo install + system local-hook, vs. additional_dependencies).\n  - New \"Failure mode\" subsection with a worked example of the output\n    a developer sees when rivet validate blocks a commit, plus a\n    --no-verify advisory anchored on the hook security model (REQ-051).\n  - New \"Adoption audit\" subsection pointing at the audit script.\n\n- scripts/audit-rivet-validate-adoption.sh\n  - Walks a workspace of repository clones, reports adopted /\n    gap / no-pre-commit-config repos. Markdown output suitable for\n    pasting into docs/adoption-status.md or an issue body.\n  - Exits non-zero on any gap so it can act as a CI gate.\n\n- docs/adoption-status.md\n  - Placeholder for the latest audit run + refresh recipe.\n\nOut of scope for this PR (acknowledged in the issue body):\n- Cross-repo audit *run* (needs a workspace with sibling clones; an\n  operator must execute the script).\n- Cross-repo adoption issues filed on relay / sigil / gale / wohl\n  (filing on other repos is outside the issue-triage agent's\n  authorised scope per the org policy).\n\nRefs: REQ-051\n\nCo-authored-by: Claude <noreply@anthropic.com>",
          "timestamp": "2026-05-15T08:36:15-05:00",
          "tree_id": "a229d14ea0e3f6acdf64de660ca35e159d934114",
          "url": "https://github.com/pulseengine/rivet/commit/2bd7bd692d79cbe0646ebf1df8b6ab1ed376615a"
        },
        "date": 1778852906543,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 80149,
            "range": "± 397",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 842064,
            "range": "± 7587",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 11706540,
            "range": "± 347234",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2192,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25603,
            "range": "± 141",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 358412,
            "range": "± 1154",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 95,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/1000",
            "value": 97,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 96,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1217709,
            "range": "± 21233",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 159547,
            "range": "± 2092",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1900213,
            "range": "± 9028",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 24914445,
            "range": "± 1075682",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 139035,
            "range": "± 564",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1225703,
            "range": "± 14894",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 14183189,
            "range": "± 1382151",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4211,
            "range": "± 18",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60088,
            "range": "± 179",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 813589,
            "range": "± 1673",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 60309,
            "range": "± 175",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 701859,
            "range": "± 2968",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7677897,
            "range": "± 85465",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 847,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7767,
            "range": "± 34",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 108743,
            "range": "± 608",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 24906,
            "range": "± 235",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 179804,
            "range": "± 1549",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1627477,
            "range": "± 20357",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "06f6fbe0b4b33ccbe080e45694bd1ae8e34ea05c",
          "message": "spike(research): MIRAI feasibility scaffold for rivet-core (#191) (#264)\n\n* spike(research): MIRAI feasibility scaffold for rivet-core (#191)\n\nPicks up the feasibility-spike sub-AC proposed in the\n[2026-04-26 triage comment](https://github.com/pulseengine/rivet/issues/191#issuecomment-4322900490).\nLands the procedural deliverables now; first-pass diagnostics from a\nlive `cargo mirai` run will follow as a separate commit on this branch.\n\nHeadline finding: the issue body references `facebookexperimental/MIRAI`,\nwhich was archived 2024-08-22 and is read-only. Active maintenance lives\nat `endorlabs/MIRAI` (latest v1.1.12, 2025-03-04, nightly-2025-01-10\ntoolchain pin). The runner script and the report target the fork and\nflag the substitution explicitly so the issue can be retargeted.\n\nChanges:\n\n- scripts/research/mirai-on-rivet-core.sh\n  - Idempotent install + analysis runner. Pins MIRAI tag, nightly\n    toolchain (with rustc-dev / rust-src / llvm-tools-preview), and\n    output paths in one place.\n  - --install-only short-circuit for setup-without-analysis.\n  - --target {store|proofs|all} for selective re-runs.\n  - Writes diagnostics to results/mirai/<target>.txt for committed\n    artefact-driven reporting.\n\n- docs/research/mirai-prototype-report.md\n  - Validated install procedure (the part the script automates) +\n    explicit Endor-Labs-fork substitution callout for #191.\n  - Section stubs for \"Code paths analysed\", \"Properties MIRAI flagged\",\n    \"Side-by-side comparison with existing Kani proofs\", \"Integration\n    cost assessment\", \"Verdict\", \"Go/no-go for CI gate\".\n  - Report frames the three possible outcomes upfront so the run's\n    output drops directly into one of them.\n\nOut of scope for this commit:\n- First-pass diagnostics (`results/mirai/<target>.txt`) — a live run\n  is required; the install pipeline takes 10-15 min to compile the\n  checker on a 4-core box, then minutes per analysis target.\n- Findings summary on the V&V hub (#184 Phase 5) — gated on the\n  diagnostics + verdict landing first.\n\nRefs: FEAT-001\n\n* spike(research): MIRAI verdict — toolchain pin blocks build (#191)\n\nLive spike completed; verdict is outcome 3 of the three framed in the\nprior commit (\"install irreproducible against rivet stable toolchain\").\n\nWhat ran:\n\n- rustup toolchain install nightly-2025-01-10 (with rustc-dev / rust-src\n  / llvm-tools-preview): clean.\n- git clone --branch v1.1.12 endorlabs/MIRAI: clean.\n- cargo install --locked --path ./checker: 17m 40s, clean. Installed\n  /root/.cargo/bin/{mirai, cargo-mirai}.\n- mirai --version: needs LD_LIBRARY_PATH pointing at the nightly's lib/\n  dir (librustc_driver linkage quirk). Documented in the report.\n- cargo mirai --lib on rivet-core: TWO independent blockers, both\n  upstream-pin-related, both captured under results/mirai/:\n    1. results/mirai/run-msrv.txt — rivet-core's rust-version=1.89\n       refused; the pinned nightly is rustc 1.86.0-nightly (2025-01-09).\n    2. results/mirai/run-let-chains.txt — even with\n       --ignore-rust-version, spar-annex (pulled via the spar external)\n       uses stabilized let_chains, gated as #![feature(let_chains)] on\n       any pre-mid-2025 nightly.\n\nVerdict: hold the prototype until endorlabs/MIRAI bumps its\nrust-toolchain.toml past let_chains stabilization (rustc ≥ 1.88,\nnightly ≥ ~2025-04). At that point scripts/research/mirai-on-rivet-core.sh\nis a one-shot resumption.\n\nThis is the intended exit per the prior triage's spike scope:\n\"if install fails, the spike output is itself the verdict.\" The\nrunner script is preserved in scripts/research/ so the experiment\nresumes in minutes rather than hours when the upstream pin moves.\n\nRefs: FEAT-001\n\n* docs(mirai): wrap external version refs in backticks to silence VersionConsistency\n\nThe MIRAI spike report cites external tool versions (MIRAI v1.1.12 /\nv1.1.13) that are unrelated to rivet's workspace version. The\n`VersionConsistency` doc-check invariant matched the bare `vN.N.N`\npattern and flagged them as drift.\n\nWrap the four references in backticks. The invariant explicitly\nskips matches inside inline code (`is_code_context` check at\ndoc_check.rs:727), so this clears the violation without weakening\nthe guard for genuine rivet-version drift in prose.\n\nRefs: #191 (MIRAI spike)\n\n---------\n\nCo-authored-by: Claude <noreply@anthropic.com>",
          "timestamp": "2026-05-15T09:14:07-05:00",
          "tree_id": "cd19b870ffc957452b29e37f53e3896eed2889f3",
          "url": "https://github.com/pulseengine/rivet/commit/06f6fbe0b4b33ccbe080e45694bd1ae8e34ea05c"
        },
        "date": 1778854862672,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 81472,
            "range": "± 1664",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 886916,
            "range": "± 4526",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12774417,
            "range": "± 672459",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1924,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24796,
            "range": "± 98",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 355687,
            "range": "± 4165",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 97,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/1000",
            "value": 97,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 97,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1212791,
            "range": "± 27393",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 165199,
            "range": "± 672",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1897953,
            "range": "± 53317",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 25681811,
            "range": "± 491041",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 134767,
            "range": "± 1903",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1219649,
            "range": "± 10846",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 13884868,
            "range": "± 902854",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4148,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 44090,
            "range": "± 101",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 732095,
            "range": "± 4124",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 64759,
            "range": "± 167",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 714278,
            "range": "± 6898",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7861072,
            "range": "± 49436",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 811,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7312,
            "range": "± 35",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 91984,
            "range": "± 323",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22414,
            "range": "± 256",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 157000,
            "range": "± 1593",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1488413,
            "range": "± 12636",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "01c84a94172127c10d15f464634560d0377218ad",
          "message": "feat(coverage): rivet coverage --aggregate — file-based cross-repo V&V matrix (#270)\n\nImplements sub-issue 3 of the V&V coverage matrix decomposition on #188:\nthe cross-repo aggregator. Rather than reaching into the GitHub org API,\neach repo's CI emits `rivet coverage --matrix --format json` and a\ntop-level job merges the files with `rivet coverage --aggregate a.json\nb.json ... --format {text,markdown,html,json}`.\n\n- Duplicate `(repo, id)` rows are coalesced (first wins) so re-running\n  the aggregator over overlapping inputs is idempotent.\n- The merged JSON uses the same envelope as the per-repo command, so it\n  re-feeds the aggregator unchanged.\n- Bad / wrong-shaped inputs fail with a diagnostic that names the file.\n\n3 integration tests: markdown merge + column union, JSON round-trip +\ndedup, bad-input diagnostics. Existing `coverage --matrix` tests, clippy,\nfmt, and `rivet validate` baseline all unchanged.\n\nImplements: REQ-007\nRefs: FEAT-001\n\nCo-authored-by: Claude <noreply@anthropic.com>",
          "timestamp": "2026-05-15T09:24:38-05:00",
          "tree_id": "2f795fbd4b1b00c8d4f3c073aa9886fc9ce8eb02",
          "url": "https://github.com/pulseengine/rivet/commit/01c84a94172127c10d15f464634560d0377218ad"
        },
        "date": 1778855473197,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 81832,
            "range": "± 293",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 875221,
            "range": "± 5140",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 15603475,
            "range": "± 1059640",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1988,
            "range": "± 29",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24950,
            "range": "± 93",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 354695,
            "range": "± 3036",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 97,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/1000",
            "value": 97,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 97,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1237477,
            "range": "± 37110",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 168067,
            "range": "± 4141",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1928357,
            "range": "± 30342",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 43727277,
            "range": "± 4865511",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 136519,
            "range": "± 472",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1247381,
            "range": "± 14102",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 20987169,
            "range": "± 2306060",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4051,
            "range": "± 73",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 44286,
            "range": "± 617",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 743099,
            "range": "± 4621",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 59170,
            "range": "± 348",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 721128,
            "range": "± 9308",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8408462,
            "range": "± 518481",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 817,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 6784,
            "range": "± 96",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 94732,
            "range": "± 1317",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22200,
            "range": "± 59",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 163556,
            "range": "± 622",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1493230,
            "range": "± 12283",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "225ec492c2029cb98394260225872d1e01070289",
          "message": "feat(variant): fields-per-variant on Artifact + resolver (#255) (#285)\n\nMVP for the variant-aware properties track (docs/design/variant-aware-properties.md):\n\n- `Artifact::fields_per_variant: BTreeMap<variant_name, BTreeMap<field, value>>`\n  serialized as `fields-per-variant:` (kebab-case) at the artifact level.\n- `Artifact::fields_for_variant(Option<&str>) -> Cow<'_, BTreeMap<...>>`\n  resolves the effective fields map for a variant. Zero-alloc `Borrowed`\n  fallback when no overlay applies (None, unknown variant, empty overlay).\n  Allocates only when a known variant has overrides.\n- `#[derive(Default)]` on `Artifact` so tests can use the struct-update\n  pattern instead of carrying every new field forward at each call site.\n\nWired through:\n- yaml_hir schema-driven parser recognizes `fields-per-variant` and unpacks\n  the nested mapping into the typed field (does NOT fall through to the\n  generic `fields` smuggler).\n- generic-yaml adapter round-trips through a typed `fields_per_variant`\n  on `GenericArtifact`.\n- Resolution semantics per design doc §5.2: overlay merge — variant keys\n  override default keys; default keys not mentioned in the variant carry\n  through. Unknown variants silently inherit default fields (graceful\n  degradation when variant configs aren't loaded).\n\nTests cover:\n- Resolver: None / unknown / known / overlay-only-some-keys / new-keys.\n- Parser: nested mapping extraction populates the typed field, not the\n  generic `fields` map; both variants present after parse.\n\nImplements: REQ-010, REQ-028, REQ-029\nRefs: FEAT-001\n\nCo-authored-by: Claude Opus 4.7 <noreply@anthropic.com>",
          "timestamp": "2026-05-16T03:31:04-05:00",
          "tree_id": "77f3668a43b316c63121859d0d4e6fb3bd60648a",
          "url": "https://github.com/pulseengine/rivet/commit/225ec492c2029cb98394260225872d1e01070289"
        },
        "date": 1778920690082,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 65004,
            "range": "± 199",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 684104,
            "range": "± 2728",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 10199749,
            "range": "± 414992",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1499,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 18550,
            "range": "± 72",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 274939,
            "range": "± 1244",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 75,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/1000",
            "value": 75,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 75,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 962954,
            "range": "± 3245",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 115599,
            "range": "± 583",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1359391,
            "range": "± 20069",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 19057723,
            "range": "± 267738",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 99819,
            "range": "± 1257",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 920395,
            "range": "± 2183",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 10971696,
            "range": "± 212289",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3237,
            "range": "± 78",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 33927,
            "range": "± 257",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 568565,
            "range": "± 4103",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 49865,
            "range": "± 331",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 524179,
            "range": "± 2614",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 6012076,
            "range": "± 33050",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 556,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 5031,
            "range": "± 12",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 68545,
            "range": "± 185",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 17477,
            "range": "± 157",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 124660,
            "range": "± 683",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1166651,
            "range": "± 16300",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "7c8b4ac777a995e0495d90b011cfb38f4eba9873",
          "message": "feat(supplier): cross-org boundary MVP — external-anchor + 3-state coverage (#253) (#286)\n\nMVP for the cross-organizational / supplier-management traceability track\n(docs/design/cross-org-supplier-traceability.md §6).\n\n- **`external-anchor` artifact type** in `schemas/common.yaml`: a typed\n  leaf marking the point at which the in-house chain hands off to a\n  supplier. Fields: `source-of-truth` (mapping), `expected-derived-types`\n  (list of artifact types the supplier is contracted to produce),\n  `received-status` (enum: not-received / received-as-reqif|pdf|oslc|\n  polarion-export|arxml|other), `contract-reference` (optional, points at\n  the DIA / PO).\n\n- **3-state coverage** in `rivet-core/src/coverage.rs`:\n  `CoverageEntry` gains `external_boundary: usize` +\n  `external_boundary_ids: Vec<String>`. Sum invariant: `covered +\n  external_boundary + uncovered_ids.len() == total`. Classification\n  rule: when an unsatisfied source artifact has a forward link to an\n  `external-anchor` whose `expected-derived-types` overlaps the rule's\n  target types (or the rule is unrestricted), it counts as\n  `external_boundary` instead of `uncovered`. Off-contract anchors do\n  NOT silently absorb gaps.\n\n- **`rivet supplier list`** + **`rivet supplier check`** CLI commands —\n  read-only surface for the auditor. `list` enumerates declared\n  anchors with their received-status and expected derivatives; `check`\n  prints the 3-state breakdown filtered to rules with boundary or\n  uncovered findings.\n\n- **`rivet coverage`** text and JSON output extended with the new\n  fields. Text output adds a Boundary column and breakdown summary\n  only when at least one boundary exists, keeping the common case\n  uncluttered. JSON adds `external_boundary`, `external_boundary_ids`,\n  `accounted_percentage` to each rule and an `external_boundary` total\n  to the overall block (additive, no schema break).\n\nTests:\n- Unit tests for the classification rule: boundary terminates chain,\n  off-contract anchor still uncovered, 3-state sum invariant.\n- 3 integration tests: `supplier list` text output, `supplier list`\n  JSON shape, `supplier check` classifies a delegated DD as\n  external_boundary.\n\nOut of MVP scope (deferred to Phase 2 per the design doc): structured\nexternal link target, federation handshake / `rivet supplier pull`,\nfield-mapping recipes, FederationProvenance. The MVP describes the\nboundary without federating across it — the audit-critical step.\n\nImplements: REQ-010, REQ-004, REQ-007\nRefs: FEAT-001\n\nCo-authored-by: Claude Opus 4.7 <noreply@anthropic.com>",
          "timestamp": "2026-05-16T04:17:05-05:00",
          "tree_id": "897278a1e064a2ee5c3964f0d15d5f2955209647",
          "url": "https://github.com/pulseengine/rivet/commit/7c8b4ac777a995e0495d90b011cfb38f4eba9873"
        },
        "date": 1778923424801,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 82359,
            "range": "± 1256",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 882812,
            "range": "± 76952",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12895431,
            "range": "± 784758",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1982,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25137,
            "range": "± 38",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 354769,
            "range": "± 1721",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 98,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/1000",
            "value": 98,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 99,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1255742,
            "range": "± 11263",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 167180,
            "range": "± 2661",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1920369,
            "range": "± 26300",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 27971959,
            "range": "± 3343120",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 137712,
            "range": "± 439",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1266612,
            "range": "± 29293",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 14574258,
            "range": "± 480280",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4170,
            "range": "± 10",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 44275,
            "range": "± 547",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 730271,
            "range": "± 7191",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 60836,
            "range": "± 180",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 723386,
            "range": "± 3053",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8117521,
            "range": "± 390702",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 762,
            "range": "± 13",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7017,
            "range": "± 41",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 89702,
            "range": "± 325",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23775,
            "range": "± 87",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 170373,
            "range": "± 2037",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1606326,
            "range": "± 23927",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "ed4a4919463730d8ffa27845baa227735ad4e9d5",
          "message": "feat(tcl): tool-qualification workstream A + AI session provenance (#127) (#289)\n\nCloses #127 (AI session provenance — schema half) and ships the smallest\nviable surface of TCL design workstream A (per\ndocs/design/tool-confidence-level.md §7.4).\n\n**Schema additions (schemas/common.yaml)**\n\n- `ai-session` artifact type — pins a Claude Code (or other AI) session\n  to a commit so the auditor can reconstruct *who/what* authored a\n  change. Fields: session-id, session-hash (SHA-256 of transcript),\n  model-id, tool-version, commit-sha, started-at, ended-at, invoker.\n- `ai-found-defect` artifact type (TCL A3) — typed defect record for\n  errors introduced by AI authoring that rivet's detection machinery\n  caught. Fields: severity, triage-status (open/accepted/rejected/\n  deduplicated), detected-by, discovered-at, triaged-at, triaged-by.\n- Link types: `defect-against` (defect → target), `corrects` (fix →\n  defect), `produced-by` (artifact → ai-session).\n\n**Schema additions (schemas/iso-26262.yaml)**\n\n- `tool-confidence` artifact type (TCL A2) — typed tool-qualification\n  claim per ISO 26262-8 §11.4.7. Fields: tool-id, ti (TI1/TI2), td\n  (TD1/TD2/TD3), tcl (TCL1/TCL2/TCL3), regime (iso-26262/do-178c/\n  do-330/en-50128/iec-61508/iec-62304/iso-21434/iso-pas-8800), claim-\n  status (self-claimed/qualified/conditional/target), scope. link-field\n  `qualification-evidence` points at the proofs / oracle runs that\n  defend the TD claim.\n\n**Dogfood (TCL A1)**\n\n- Fix inverted TCL/TQL convention in safety/stpa/tool-qualification.yaml\n  header (now follows ISO 26262 Table 3: TCL1 = lowest demand).\n- New typed claim `TQ-CONF-RIVET` at safety/tool-qualification/\n  rivet-tool-confidence.yaml — rivet's own TI2/TD1/TCL1 self-claim\n  links to the seven hazards in the dogfood STPA.\n- rivet.yaml: load `iso-26262` schema + scan\n  `safety/tool-qualification/` source path.\n\n**CLI (TCL A4, A5)**\n\n- `--qualification-mode` flag on the top-level Cli. Initial gate\n  refuses `rivet sync` (Phase 2 federation, out of scope per dossier\n  §4). Read-only commands stay allowed; the list is deliberately\n  narrow — better to expand than to silently block audit work.\n- `rivet stats --qualification` — JSON-only configuration baseline\n  manifest for the dossier. Lists rivet version, schemas in use,\n  every `tool-confidence` artifact with its claim, and `ai-found-\n  defect` aggregates (by severity, by triage-status, plus open-IDs).\n  This is the snapshot the safety manager pastes into the dossier.\n- `rivet docs tool-qualification` — renders the new dossier doc\n  (docs/design/tool-qualification-dossier.md) wired into the docs\n  topic registry.\n\n**Tests**\n\n- Integration: `stats_qualification_emits_baseline_manifest_for_dogfood`\n  validates the full JSON envelope contains TQ-CONF-RIVET at TCL1.\n- Integration: `qualification_mode_blocks_sync` asserts the gate\n  produces a non-zero exit with a discoverable error message.\n\n**Not in this PR**\n\n- `rivet check ai-defects-open` oracle (deferred — needs the agent-\n  pipelines wiring, which is a bigger refactor).\n- Phase 2 of #127 (commit hook to auto-stamp ai-session metadata,\n  `rivet audit` to enforce that every AI commit has a session record).\n- Independent assessment (claim-status stays self-claimed).\n\nImplements: REQ-002, REQ-007, REQ-010\nRefs: FEAT-001, #127\n\nCo-authored-by: Claude Opus 4.7 <noreply@anthropic.com>",
          "timestamp": "2026-05-16T09:38:29-05:00",
          "tree_id": "8c465602fd97b2076a40851703a391dcdba4fab0",
          "url": "https://github.com/pulseengine/rivet/commit/ed4a4919463730d8ffa27845baa227735ad4e9d5"
        },
        "date": 1778942691749,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 80503,
            "range": "± 503",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 845667,
            "range": "± 3024",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12549543,
            "range": "± 825341",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2211,
            "range": "± 19",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 27454,
            "range": "± 658",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 377511,
            "range": "± 1221",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 94,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/1000",
            "value": 93,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 95,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1351260,
            "range": "± 19098",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 162828,
            "range": "± 1181",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1839384,
            "range": "± 123043",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 24838551,
            "range": "± 1245383",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 123170,
            "range": "± 976",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1058529,
            "range": "± 18993",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 11712608,
            "range": "± 667915",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4267,
            "range": "± 39",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60371,
            "range": "± 558",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 748239,
            "range": "± 3733",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 61865,
            "range": "± 1272",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 693629,
            "range": "± 5688",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8013638,
            "range": "± 368464",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 826,
            "range": "± 138",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7276,
            "range": "± 55",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 116785,
            "range": "± 3500",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 25312,
            "range": "± 592",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 181499,
            "range": "± 988",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1702050,
            "range": "± 24704",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "e2466dbb1b16ea992b29f81cf41ff7b367fd6876",
          "message": "release(v0.10.0): variant + supplier + AI session + TCL workstream A (#290)\n\n* release(v0.10.0): variant + supplier + AI session + TCL workstream A\n\nWorkspace version bump 0.9.0 → 0.10.0. Theme: audit-grade story —\nthree orthogonal features that together move rivet from \"trace your\nproject\" to \"describe the boundary and defend the tool's role across\nit.\"\n\nHighlights (full notes in CHANGELOG.md):\n- Variant-aware properties — per-variant field values (#285, #255).\n- Cross-org / supplier-boundary coverage MVP (#286, #253).\n- AI session provenance — schema half (#289, partially #127).\n- Tool-qualification workstream A — typed claim + dossier (#289).\n- rivet stats --qualification + --qualification-mode flag (#289).\n- TCL/TQL numbering convention fix in dogfood STPA (#289).\n\nCo-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>\n\n* fix(release): docs-check violations on v0.10.0 release commit\n\nTwo docs-check violations on PR #290:\n- VersionConsistency: vscode-rivet/package.json bumped 0.9.0 → 0.10.0\n  (it has its own version field, not workspace-inherited).\n- SubcommandReferences: CHANGELOG mentioned `rivet audit` which is a\n  Phase 2 future subcommand. Rephrased to \"audit-side enforcement\n  subcommand\" so the literal `rivet audit` no longer parses as a\n  current-cli reference.\n\nLocal `rivet docs check` now passes (54 files, 0 violations).\n\nCo-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>\n\n---------\n\nCo-authored-by: Claude Opus 4.7 <noreply@anthropic.com>",
          "timestamp": "2026-05-16T10:51:50-05:00",
          "tree_id": "43ce0a6486e586d39bad5a0fbe853867ad8d8cb1",
          "url": "https://github.com/pulseengine/rivet/commit/e2466dbb1b16ea992b29f81cf41ff7b367fd6876"
        },
        "date": 1778947118761,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 75538,
            "range": "± 270",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 901030,
            "range": "± 5102",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 15309552,
            "range": "± 1209299",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1670,
            "range": "± 33",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 19188,
            "range": "± 119",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 363777,
            "range": "± 1487",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 85,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/1000",
            "value": 85,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 85,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1270186,
            "range": "± 13898",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 168430,
            "range": "± 1786",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1943544,
            "range": "± 23067",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 34386106,
            "range": "± 4199922",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 116502,
            "range": "± 819",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1056957,
            "range": "± 32705",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 14130663,
            "range": "± 1900283",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3876,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 41149,
            "range": "± 163",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 745391,
            "range": "± 8287",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 53260,
            "range": "± 218",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 586263,
            "range": "± 2550",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7081851,
            "range": "± 786962",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 663,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 5467,
            "range": "± 16",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 149958,
            "range": "± 1684",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23533,
            "range": "± 47",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 173888,
            "range": "± 2988",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1603653,
            "range": "± 18942",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "c9151f685c5144737220d0fc92a3dc4e1d147e3b",
          "message": "ci(release): make build-test-evidence non-blocking (continue-on-error) — round 2 (#293) (#294)\n\nv0.10.0 manual republish forensics:\nThe release workflow on tag v0.10.0 (run 25966236046) built all five\ncross-platform binaries, the VSIX, the compliance report, the baseline\nsnapshot, and ran docs-check successfully. The \"Create GitHub Release\"\njob was skipped because it `needs: build-test-evidence`, and that job\nfailed on the spar -> highs-sys WASI cross-compile (CMake\nThreads::Threads target not available in the wasi-sdk 25.0 sysroot).\n\nThe release was published manually from the workflow artifacts. To\nprevent this hand-republish on every future tag push:\n\n- `build-test-evidence`: `continue-on-error: true`. The job still runs\n  and uploads its artifact when it succeeds (desirable add-on), but a\n  failure no longer marks the run as failed.\n- `create-release.needs`: drop `build-test-evidence`. The Collect assets\n  step uses a permissive `find` and tolerates the missing tarball.\n\nHistory: #272 originally introduced the continue-on-error; #274 reverted\nit with the wasi-sdk integration that we expected to handle highs-sys.\nv0.10.0 proved that's still not enough. Tracking the upstream fix in\n#293 — once that's resolved, this commit can be reverted.\n\nRefs: #293",
          "timestamp": "2026-05-16T12:49:32-05:00",
          "tree_id": "b9ab1d8d327fe42ad4deb5b9a9dca7cc2123144c",
          "url": "https://github.com/pulseengine/rivet/commit/c9151f685c5144737220d0fc92a3dc4e1d147e3b"
        },
        "date": 1778954267549,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 81634,
            "range": "± 396",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 853128,
            "range": "± 9897",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13210516,
            "range": "± 1244964",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2187,
            "range": "± 10",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26399,
            "range": "± 610",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 363583,
            "range": "± 5043",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 93,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/1000",
            "value": 93,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 94,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1374716,
            "range": "± 27587",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 165391,
            "range": "± 1622",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1918166,
            "range": "± 44270",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 29738023,
            "range": "± 2888597",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 125390,
            "range": "± 898",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1082850,
            "range": "± 11437",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 15448971,
            "range": "± 1204825",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4390,
            "range": "± 34",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60234,
            "range": "± 339",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 754407,
            "range": "± 8768",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 62464,
            "range": "± 301",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 689834,
            "range": "± 14704",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7548192,
            "range": "± 119756",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 804,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7490,
            "range": "± 32",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 129562,
            "range": "± 1592",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 25146,
            "range": "± 580",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 180892,
            "range": "± 3895",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1700198,
            "range": "± 10778",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "2932166a71b4e52b1f7dd4ea8cec3eef50962f33",
          "message": "ci(release): sigstore keyless signing for SHA256SUMS + RELEASING.md (#296)\n\nSupply-Chain-Pentester finding (v0.10.0 adversarial review):\nSHA256SUMS shipped unsigned, so anyone who could replace a release\nasset could also replace the checksum file. The dossier sold defect\ndetection (true) but quietly implied tamper detection (false).\n\nCloses 80% of that gap with sigstore keyless OIDC — no long-lived\nsigning key, no KMS provisioning, no rotation. The trust anchor is\nthe GitHub-Actions workflow identity (issuer\n`token.actions.githubusercontent.com`, subject\n`.github/workflows/release.yml@refs/tags/vX.Y.Z`).\n\nWorkflow changes:\n- `permissions.id-token: write` so the runner can request its OIDC\n  token (required by cosign keyless flow).\n- New `Install cosign` step (sigstore/cosign-installer@v3, v2.4.1).\n- New `Sign SHA256SUMS with cosign (keyless OIDC)` step between\n  checksum generation and release creation. Emits three artifacts:\n  - `SHA256SUMS.txt.cosign.bundle` (verifier-friendly bundle)\n  - `SHA256SUMS.txt.sig` (detached signature)\n  - `SHA256SUMS.txt.pem` (Fulcio-issued short-lived cert)\n- The existing `Collect assets` step's permissive `find` already\n  picks up the new files; the release page will include them\n  automatically.\n\nNew `RELEASING.md` documents:\n- Why signed git tags matter + how to verify (`git tag -v`).\n- What CI signs (and why sigstore keyless was chosen).\n- How a consumer verifies a downloaded binary (two-step flow:\n  cosign verify-blob on the bundle, then sha256sum -c).\n- What is explicitly NOT signed at v0.10.0+ (binary archives\n  transitively only, VSIX, compliance tarball, the maintainer's\n  GPG keylist — for parity with the dossier §0 honest scope).\n- The manual-republish procedure used for v0.10.0 (#294 context).\n\nThis addresses the Supply-Chain-Pentester's \"one minimum primitive\nthat closes 80% of the gaps\" recommendation. The remaining 20%\n(per-archive signatures, VSIX signing, attestation in-toto bundle)\nare separate workstreams.\n\nCo-authored-by: Claude Opus 4.7 <noreply@anthropic.com>",
          "timestamp": "2026-05-17T00:27:18-05:00",
          "tree_id": "1e993783897cc6e29ae75aa27f6e317208265dce",
          "url": "https://github.com/pulseengine/rivet/commit/2932166a71b4e52b1f7dd4ea8cec3eef50962f33"
        },
        "date": 1778996898416,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 80682,
            "range": "± 1078",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 849597,
            "range": "± 5874",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 11958794,
            "range": "± 1062766",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2133,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25929,
            "range": "± 704",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 370135,
            "range": "± 4067",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 93,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/1000",
            "value": 93,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 93,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1376247,
            "range": "± 11771",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 159906,
            "range": "± 2266",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1859705,
            "range": "± 37136",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 27503012,
            "range": "± 3355058",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 125460,
            "range": "± 773",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1087561,
            "range": "± 10979",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 12511533,
            "range": "± 1331396",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4278,
            "range": "± 12",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 58891,
            "range": "± 249",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 762012,
            "range": "± 16088",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 62559,
            "range": "± 1010",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 707202,
            "range": "± 40747",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7858723,
            "range": "± 401566",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 779,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7847,
            "range": "± 50",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 122594,
            "range": "± 924",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 25262,
            "range": "± 158",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 182406,
            "range": "± 4294",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1705426,
            "range": "± 24293",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "74a7d07f1e49271ad3e460a44d8189f1e9e6ed2e",
          "message": "feat: salsa-tracked build_store + TCL workstream B + honest dossier (adversarial-review fixes) (#295)\n\n* perf(db): track build_store + build_store_with_extras as salsa queries\n\nMobile/Scale lens finding (v0.10.0 adversarial review): `build_store`\nin `db.rs:646` was a plain `fn`, so every downstream tracked query\n(`validate_all`, `build_link_graph`, `compute_coverage_tracked`) re-built\nthe entire `Store` HashMap (cloning every `Artifact`) on every salsa\nrevision — defeating the incremental validation claim the dossier\nmakes in §3.\n\nThis commit:\n- Marks `build_store` and `build_store_with_extras` `#[salsa::tracked]`.\n- Adds `PartialEq` to `Store` (required for salsa change-detection).\n\nResult: subsequent calls with the same `source_set` / `schema_set` /\n`extra_set` return the memoized `Store` instead of re-running the\nfunction. Single-file edits still re-validate that file (its\n`parse_artifacts_v2` invalidates), but unchanged files don't get\nre-parsed or re-inserted into a fresh HashMap.\n\nA regression test (`build_store_cache_returns_equal_on_noop_revision`)\nfollows in a separate commit to keep the diffs focused.\n\nCo-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>\n\n* test(db): regression test for build_store salsa cache (REQ-029)\n\nVerifies the prior commit's tracked build_store actually memoizes:\nrepeated calls with the same source_set + schema_set return equal\nStores. While salsa cache observability isn't directly testable from\nuser code, equality after a no-op revision is a necessary condition.\n\nCo-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>\n\n* feat(schema): add dpia artifact type + retention fields on ai-session\n\nDPO-Lens finding (v0.10.0 adversarial review): `ai-session.invoker`\ncollects personal data per DSGVO Art. 4 without a lawful basis,\nretention period, or erasure mechanism. The dossier section §0 calls\nthis out as a not-yet-defensible gap; this commit ships the typed\nshape so projects can actually populate the metadata DSGVO Art. 35\nexpects.\n\nNew on `ai-session`:\n- `lawful-basis` (DSGVO Art. 6(1)/(9)(2), enumerated allowed values\n  including `anonymised` for non-PII cases).\n- `retention-period` (ISO 8601 duration, Art. 5(1)(e)).\n- `erasure-mechanism` (free-form, Art. 17).\n\nNew artifact type `dpia` in `schemas/common.yaml`:\n- `dpo-sign-off`, `personal-data-categories` (required).\n- `risk-assessment` (low/medium/high).\n- `mitigation-measures`, `consultation-date` (optional).\n\nNOT in this commit (deliberately):\n- A conditional-rule that forces `invoker`-set artifacts to link to a\n  dpia. Adding that requires validate-time enforcement work and would\n  block release on projects that haven't authored a dpia yet —\n  separate PR with a migration story.\n\nCo-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>\n\n* feat(check): rivet check ai-defects-open — TCL workstream B operational gate\n\nAuditor + PM/Pragmatiker findings (v0.10.0 adversarial review): the\ndossier's §3 TD1 detection-layer claim names the ai-found-defect\ntriage loop as the operational primitive — but v0.10.0 shipped only\nthe schema, not the gate. This commit ships the gate.\n\nNew subcommand `rivet check ai-defects-open` exits non-zero when:\n\n**Gate 1 (open-against-released):** an `ai-found-defect` with\n`triage-status: open` has a `defect-against` link to an artifact\nwhose `status` is `released` or `approved`. Without this gate,\nrelease proceeds with un-triaged AI defects against shipped work.\n\n**Gate 2 (segregation-of-duties, DPO finding):** a defect's\n`triaged-by` matches the originating session's `invoker` (resolved\nvia `produced-by` link). The same AI/operator that authored the\noffending artifact must not mark its own defect \"accepted.\" This is\nISO 26262-2 §6.4.7 confirmation-reviewer independence at the AI-loop\nlevel.\n\nRead-only. JSON for CI consumers, text for humans. Tested:\n- ai_defects_open_passes_when_triaged_and_no_self_triage\n- ai_defects_open_fails_on_open_defect_against_released\n- ai_defects_open_fails_on_self_triage_segregation_violation\n\nCo-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>\n\n* docs(tcl): honest scope statement in dossier + TQ-CONF-RIVET claim\n\nDPO/Auditor/Formal-Skeptiker findings (v0.10.0 adversarial review):\nthe dossier and the typed claim overstated v0.10.0's defensibility:\n\n- Claimed \"Kani 2000+ proofs\" — real number is 27 harnesses with\n  mostly-trivial 8-24 byte bounded input panic-freedom checks.\n- Claimed \"TD1 high confidence\" via \"product of miss rates\" — common-\n  mode fallacy (all five layers share the same parser + Artifact\n  model).\n- Cited DO-330/IEC 62304/EN 50128 cross-walks without disclosing the\n  upstream design note's \"unverified clause-level\" caveat.\n- Did not mention `vmodel_chain_two_steps` is `Admitted`, nor that\n  `backlink_symmetric` is `assume`'d in Verus.\n- Did not mention mutation testing runs 29 mutants total.\n- Did not mention `claim-status: self-claimed` + AI-authored.\n- Did not mention release SHA256SUMS / git tag are unsigned.\n- Did not mention DPIA linkage isn't enforced at validate time.\n\nThis commit adds §0 \"Honest scope statement (read this first)\" to\n`docs/design/tool-qualification-dossier.md` enumerating each of the\nabove gaps, and updates the typed claim's `scope` field to match.\nStrips the \"2000+ proofs\" claim from §3 and replaces with concrete\ncounts.\n\nThe dossier is now honest about what v0.10.0 has and hasn't earned.\n\nCo-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>\n\n* style: cargo fmt --all on adversarial-review fix branch\n\nCI format check on #295 flagged collapsed-arm rustfmt diffs in\ncmd_check_ai_defects_open, the integration tests, and db.rs. Pure\nformatting; no semantic changes.\n\nCo-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>\n\n---------\n\nCo-authored-by: Claude Opus 4.7 <noreply@anthropic.com>",
          "timestamp": "2026-05-17T01:16:19-05:00",
          "tree_id": "71b53898c01bba9993270bd58906c37859b00abc",
          "url": "https://github.com/pulseengine/rivet/commit/74a7d07f1e49271ad3e460a44d8189f1e9e6ed2e"
        },
        "date": 1779019772194,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 81706,
            "range": "± 1866",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 855564,
            "range": "± 6664",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13536147,
            "range": "± 804316",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2224,
            "range": "± 25",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25850,
            "range": "± 340",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 380042,
            "range": "± 7656",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 97,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/1000",
            "value": 98,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 97,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1456750,
            "range": "± 36030",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 160416,
            "range": "± 860",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1868815,
            "range": "± 23217",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 28683764,
            "range": "± 1741716",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 126022,
            "range": "± 1054",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1085958,
            "range": "± 54960",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 14142403,
            "range": "± 1381488",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4252,
            "range": "± 31",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 59406,
            "range": "± 304",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 757604,
            "range": "± 16313",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 61629,
            "range": "± 197",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 696497,
            "range": "± 4245",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7620032,
            "range": "± 210254",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 790,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7249,
            "range": "± 209",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 119490,
            "range": "± 1531",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 25507,
            "range": "± 322",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 194962,
            "range": "± 4144",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1669550,
            "range": "± 61922",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "fc44838d813df9c5d4f02fb5ae35f1bd6d0eb984",
          "message": "feat(audit): rivet audit — AI-session/commit traceability gate (#127 P2) (#297)\n\nCloses the loop opened by v0.10.0's ai-session schema (#127 Phase 1).\nNew top-level read-only subcommand `rivet audit` walks the current\nbranch's git history and enforces two gates:\n\n**Gate 1 — AI-authored commit needs a session.**\nFor every commit detected as AI-authored (`Co-Authored-By:` containing\n`noreply@anthropic.com`, OR `Generated-With:`/`Created-By:` trailer\nmatching `^(ai|ai-assisted)`), require an `ai-session` artifact in the\nproject with `fields.commit-sha` matching the commit SHA (prefix\nmatch either direction, ≥7 chars).\n\n**Gate 2 — session must point at a real reachable commit.**\nFor every `ai-session` artifact with `commit-sha` set, verify the\ncommit exists (`git cat-file -e`) AND is reachable from `--until`\n(`git merge-base --is-ancestor`). Catches drift after rebase / force-\npush as well as fabricated sessions pointing at vanished commits.\n\nCLI: `rivet audit [--since <ref>] [--until <ref>] [--format text|json] [--strict]`\n- `--since` defaults to `git merge-base origin/main HEAD`, falling\n  back to `HEAD~50`.\n- `--strict` exits non-zero on violations (CI mode).\n- JSON envelope per spec: `command`, `passed`, `since`, `until`,\n  `ai_commits_scanned`, `ai_sessions_in_project`,\n  `violations.{ai_commits_without_session,sessions_with_missing_commit}`,\n  `summary.total_violations`.\n\nRead-only. Shells out to `git` (no new deps). Composes with\n`rivet check ai-defects-open` (PR #295) — together they cover the\ntwo operational TD1 loops the dossier §3 layer 5 names.\n\nTests (4 integration tests, all green):\n- audit_passes_when_ai_commits_have_matching_sessions\n- audit_fails_when_ai_commit_has_no_session\n- audit_fails_when_session_points_at_missing_commit\n- audit_json_envelope_shape_on_failure\n\nDocs: new `audit` topic in `rivet-cli/src/docs.rs` (~105 lines).\n\nOUT OF SCOPE (deferred):\n- Auto-stamping sessions from `~/.claude/projects/*.jsonl` (Phase 2.5).\n- session-hash verification (Phase 2.5).\n- pre-commit / commit-msg hook installation (Phase 3).\n- DPIA-link enforcement on `invoker`-bearing sessions.\n\nImplements: REQ-002, REQ-007\nRefs: FEAT-001, #127\n\nCo-authored-by: Claude Opus 4.7 <noreply@anthropic.com>",
          "timestamp": "2026-05-18T00:31:46-05:00",
          "tree_id": "4e95c7ca5ad22d0ff761569aa5b27ed429c42365",
          "url": "https://github.com/pulseengine/rivet/commit/fc44838d813df9c5d4f02fb5ae35f1bd6d0eb984"
        },
        "date": 1779082697783,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 82833,
            "range": "± 639",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 910241,
            "range": "± 33299",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 17652602,
            "range": "± 1281048",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1966,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 23109,
            "range": "± 144",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 345122,
            "range": "± 8615",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 97,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/1000",
            "value": 97,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 97,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1423771,
            "range": "± 40092",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 169830,
            "range": "± 769",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1995591,
            "range": "± 6629",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 44208469,
            "range": "± 5257354",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 121995,
            "range": "± 2649",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1110498,
            "range": "± 20525",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 21546028,
            "range": "± 1372076",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4196,
            "range": "± 23",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 46078,
            "range": "± 279",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 791904,
            "range": "± 25835",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 65286,
            "range": "± 235",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 718312,
            "range": "± 16936",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 9788617,
            "range": "± 866137",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 736,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 6600,
            "range": "± 418",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 91967,
            "range": "± 2655",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23717,
            "range": "± 540",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 172382,
            "range": "± 1059",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1593309,
            "range": "± 26538",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "36b98fe3e0fc6aeb24953f206400ec27d864a0b0",
          "message": "ci(mutants): drop --jobs 4 → --jobs 2 to fit 32G lean-mem cgroup (#301)\n\nSmithy operator status (2026-05-18) showed lean-mem runners\napproaching the 32G cgroup ceiling again, just 16 hours after the\n24G→32G cgroup bump:\n\n  runner3   31.0G/32G  (996MB headroom)  swap 2.1G  peak 2.8G\n  runner4   30.4G/32G  (1.5G headroom)   swap 2.1G  peak 2.3G\n\nSame death-spiral pattern that triggered the prior bump. The cgroup\nfix bought time, not a durable answer.\n\nWorkflow-side lever: cargo-mutants runs `--jobs N` parallel mutants\nper shard. Each worker compiles a fresh target dir and runs the full\ntest suite — at 4-way that's ~8G/worker on a 32G runner, at or above\nrivet-core's compile peak. Halving to `--jobs 2` gives ~16G/worker\nwith comfortable headroom for the test suite.\n\nTrade-off: each shard ~2× longer (was 12-20 min, now 20-40 min). Net\neffect on the lean-mem queue is similar because we stop OOM-cycling\nmutants that previously had to be re-tried.\n\nThis addresses smithy's flagged escalation tier (\"the next fix is on\nthe workflow side\"). It complements rather than replaces issue #299\n(decoupling playwright/kani/rocq from `needs: [test]`).\n\nCo-authored-by: Claude Opus 4.7 <noreply@anthropic.com>",
          "timestamp": "2026-05-18T01:38:22-05:00",
          "tree_id": "b55df667a3060922b22175ed709a11947a1e6490",
          "url": "https://github.com/pulseengine/rivet/commit/36b98fe3e0fc6aeb24953f206400ec27d864a0b0"
        },
        "date": 1779086708977,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 76660,
            "range": "± 776",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 895578,
            "range": "± 9155",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 15597566,
            "range": "± 787580",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1745,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 19215,
            "range": "± 33",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 355995,
            "range": "± 1238",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 85,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/1000",
            "value": 85,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 85,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1349315,
            "range": "± 10413",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 158482,
            "range": "± 327",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1866548,
            "range": "± 62374",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 43982015,
            "range": "± 2142947",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 116561,
            "range": "± 1149",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1096749,
            "range": "± 15196",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 19607625,
            "range": "± 1336501",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3911,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 44375,
            "range": "± 287",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 752068,
            "range": "± 3164",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 53455,
            "range": "± 755",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 594814,
            "range": "± 2107",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8429990,
            "range": "± 425392",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 621,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 5195,
            "range": "± 171",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 137362,
            "range": "± 509",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22939,
            "range": "± 50",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 163094,
            "range": "± 857",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1528087,
            "range": "± 7926",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "b4ad938eac5adba852fdc6f9b175c5982e688841",
          "message": "feat(variant): Phase 2 — thread fields_per_variant through validate (#287) (#298)\n\nCloses #287. v0.10.0 (PR #285) shipped `Artifact::fields_per_variant`\nand the `fields_for_variant(Option<&str>) -> Cow<'_, BTreeMap<...>>`\nresolver as a building block but nothing consumed variant overlays\nduring validate. This PR wires the resolver through the validation\nengine.\n\n**rivet-core/src/schema.rs** — variant-aware helpers (additive):\n- `get_field_value_for_variant(artifact, field, variant)` resolves\n  through `Artifact::fields_for_variant` when `variant` is `Some(_)`,\n  delegates to the existing borrowed-Cow path when `None` (zero\n  allocations on the no-variant path).\n- `Condition::matches_artifact_for_variant_with(...)`.\n- `Requirement::check_for_variant(...)` for `RequiredFields`. Per\n  design §6 Phase 2 scope (\"fields only\"), `RequiredLinks` stays\n  variant-flat — links aren't overlayed.\n\n**rivet-core/src/validate.rs** — additive wrappers + threading:\n- New public APIs: `validate_with_variant`,\n  `validate_with_externals_and_variant`,\n  `validate_structural_with_variant`,\n  `validate_structural_with_externals_and_variant`.\n- Existing `validate*` functions thin-wrap the variant-aware version\n  with `variant: None`. No breaking signature changes.\n- Required-fields and allowed-values reads now go through\n  `artifact.fields_for_variant(variant)` (resolved once per artifact\n  as `effective_fields`).\n- Conditional rules (phase 8) use\n  `cond.matches_artifact_for_variant_with` +\n  `rule.then.check_for_variant`.\n\n**rivet-cli/src/main.rs cmd_validate** — threads the active variant:\n- When `--variant <name>` is set, falls through to the direct path\n  (salsa doesn't yet take variant as a tracked input) and calls\n  `validate_with_externals_and_variant(..., active_variant)`.\n- Baseline-only / no-variant / `--direct` paths preserved.\n\nTests added (rivet-core/src/validate.rs, mod tests):\n1. `conditional_rule_respects_variant_field_overlay` — artifact has\n   `fields.priority=must` and `fields-per-variant.automotive.priority=\n   should`. Conditional rule fires on `priority==must`. Without\n   variant: rule fires. With `Some(\"automotive\")`: doesn't fire.\n   With unknown variant: behaves like no variant (1 diag).\n2. `required_field_satisfied_by_variant_overlay` — required field\n   `asil` absent from `fields` but present in\n   `fields-per-variant.automotive.asil=D`. Without variant: 1\n   required-field error. With `Some(\"automotive\")`: 0 errors.\n\nNOT in this PR (deliberately):\n- `rivet list --variant <name>` filtering.\n- `rivet coverage --variant <name>` scoping.\n- Variant-aware s-expr validation rules (phase 9 in validate.rs).\n- Salsa-tracked variant input (direct-path fallback for now).\n- Cross-product multi-axis variants.\n- `when:` clause on external-anchor.\n\nImplements: REQ-004, REQ-007\nRefs: FEAT-001, #287\n\nCo-authored-by: Claude Opus 4.7 <noreply@anthropic.com>",
          "timestamp": "2026-05-18T01:48:12-05:00",
          "tree_id": "1b5ded13f4a171454da8b2da6c66da4fd1bacee2",
          "url": "https://github.com/pulseengine/rivet/commit/b4ad938eac5adba852fdc6f9b175c5982e688841"
        },
        "date": 1779087274525,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 80868,
            "range": "± 428",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 867037,
            "range": "± 14798",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 17319687,
            "range": "± 1312336",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1935,
            "range": "± 33",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24935,
            "range": "± 73",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 378233,
            "range": "± 4047",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 97,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/1000",
            "value": 97,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 97,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1452514,
            "range": "± 45664",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 167915,
            "range": "± 591",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 2040898,
            "range": "± 49472",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 51247349,
            "range": "± 3016791",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 120394,
            "range": "± 2768",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1110692,
            "range": "± 15665",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 26014425,
            "range": "± 2551020",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4172,
            "range": "± 23",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 45249,
            "range": "± 153",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 759386,
            "range": "± 6974",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 64110,
            "range": "± 144",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 719886,
            "range": "± 10868",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 11231376,
            "range": "± 179665",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 811,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7243,
            "range": "± 14",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 91616,
            "range": "± 816",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23288,
            "range": "± 139",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 169670,
            "range": "± 663",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1578266,
            "range": "± 22711",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "0a21a570c8f206c82ac188112e516dc4c490e1be",
          "message": "fix(import): junit import — stop overwriting + restore test→artifact link (#302)\n\nUser-reported regressions against `rivet import-results --format junit`:\n\n**Bug #1: silent overwrite on re-import.** `suite_to_run` built\n`run_id = format!(\"junit-{safe_name}\")` from the testsuite name only,\nso two CI runs of the same suite produced identical filenames and the\nsecond import wiped the first.\n\nFix: append a disambiguator to the run_id. When the JUnit\n`<testsuite timestamp=\"...\">` attribute is present (most CI tooling\nemits it), slugify it: `2026-05-17T06-35-44Z`. When absent, hash the\nsuite's case list (name, classname, outcome variant) and append as\n16-hex DefaultHasher digest. Identical re-imports of the same artefact\nremain idempotent (same hash → same filename → no churn); different\ncontent distinguishes itself.\n\n**Bug #2: test→artifact link dropped on cargo-nextest output.**\n`artifact_id_for` has 4 heuristics; the fallback emits a literal\n`\"classname.name\"` concatenation that the test-coverage report cannot\njoin back to any artifact. cargo-nextest doesn't bracket\n`[REQ-NNN]` or use the artifact ID as classname, so most rivet-on-rust\nprojects hit the fallback.\n\nFix: hook the JUnit importer into `test_scanner`. New public\n`parse_junit_xml_with_markers(xml, markers)` adds a 5th heuristic —\nwhen the existing fallback fires, look up a marker whose `test_name`\nmatches the case name (exact or suffix with separator). The CLI\n(`cmd_import_results_junit`) scans the project's `src/`+`tests/` for\n`// rivet: verifies REQ-NNN` markers before parsing the XML, then\npasses them to the new function. Bracketed and direct-classname IDs\nare preserved (they short-circuit before the marker lookup).\n\nExisting `parse_junit_xml` kept working unchanged (delegates to the\nnew path with an empty marker slice). No schema changes.\n\nTests added (6):\n- run_id_includes_timestamp_when_present\n- run_id_stable_hash_when_no_timestamp\n- run_id_different_hash_when_content_differs\n- marker_lookup_supplies_artifact_id_when_fallback_concat\n- marker_lookup_does_not_override_explicit_bracket\n- marker_lookup_returns_fallback_when_no_match\n\nWorkspace: 1003 lib tests pass (was 996, +7). Clippy clean. Format clean.\n\nTrace: skip\n\nCo-authored-by: Claude Opus 4.7 <noreply@anthropic.com>",
          "timestamp": "2026-05-18T15:27:04-05:00",
          "tree_id": "3b8503610152cc384f7648e68f9a3792ed14b9dd",
          "url": "https://github.com/pulseengine/rivet/commit/0a21a570c8f206c82ac188112e516dc4c490e1be"
        },
        "date": 1779136416537,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 83398,
            "range": "± 323",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 868012,
            "range": "± 34264",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 11611794,
            "range": "± 871767",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2173,
            "range": "± 61",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 27437,
            "range": "± 451",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 376022,
            "range": "± 1610",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 95,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/1000",
            "value": 95,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 95,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1437602,
            "range": "± 16716",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 160245,
            "range": "± 1687",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1846682,
            "range": "± 11758",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 23604917,
            "range": "± 294202",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 125405,
            "range": "± 3931",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1103442,
            "range": "± 27128",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 12053769,
            "range": "± 925410",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4307,
            "range": "± 191",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 58741,
            "range": "± 358",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 746241,
            "range": "± 8195",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 60733,
            "range": "± 758",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 672387,
            "range": "± 15381",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7428942,
            "range": "± 45704",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 811,
            "range": "± 12",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7251,
            "range": "± 128",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 113538,
            "range": "± 1249",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 24106,
            "range": "± 143",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 171485,
            "range": "± 1673",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1594975,
            "range": "± 15940",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "e16ca77723ad01ab10a526c06623df2e18cfc177",
          "message": "release(v0.10.1): adversarial-review action items + user-reported fixes (#303)\n\nWorkspace version 0.10.0 → 0.10.1. Patch-shaped: every change is\nadditive (new fields/subcommands/heuristics; no breaking schema/CLI).\n\nHighlights (full notes in CHANGELOG.md):\n- Added: rivet audit (#297), rivet check ai-defects-open (#295), dpia\n  artifact type (#295), variant-aware validate (#298), JUnit importer\n  marker join (#302).\n- Fixed: JUnit import overwrite + dropped linkage (#302, user-reported);\n  salsa build_store not memoized (#295); dossier scope overstated\n  (#295).\n- Changed: sigstore keyless signing of SHA256SUMS (#296),\n  build-test-evidence non-blocking (#294), cargo-mutants --jobs 4→2\n  (#301).\n\nAlso bumps vscode-rivet/package.json to 0.10.1 and allowlists \"0.10.0\"\nin rivet.yaml docs-check (historical references in dossier §0 and\nschemas/common.yaml).\n\nCo-authored-by: Claude Opus 4.7 <noreply@anthropic.com>",
          "timestamp": "2026-05-18T23:58:32-05:00",
          "tree_id": "e14ea369a98c348d7d61da53e75604314d9ef512",
          "url": "https://github.com/pulseengine/rivet/commit/e16ca77723ad01ab10a526c06623df2e18cfc177"
        },
        "date": 1779167102105,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 82903,
            "range": "± 336",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 868621,
            "range": "± 12326",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 11759943,
            "range": "± 359852",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2188,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 27884,
            "range": "± 1834",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 372759,
            "range": "± 6438",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 97,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/1000",
            "value": 97,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 97,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1465614,
            "range": "± 21878",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 162231,
            "range": "± 815",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1830868,
            "range": "± 15493",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 24063039,
            "range": "± 795432",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 126476,
            "range": "± 527",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1077773,
            "range": "± 30172",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 11452908,
            "range": "± 613197",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4309,
            "range": "± 30",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 59404,
            "range": "± 319",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 742309,
            "range": "± 2719",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 57354,
            "range": "± 1598",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 696187,
            "range": "± 15892",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7587142,
            "range": "± 487725",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 822,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 8048,
            "range": "± 22",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 111652,
            "range": "± 769",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 24566,
            "range": "± 382",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 170869,
            "range": "± 666",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1595738,
            "range": "± 42355",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "284b51c1e583f4f1a335a4d8684a10f87a0c33a7",
          "message": "ci: decouple playwright/kani/rocq from needs:[test] (#299) (#300)\n\nWhen the self-hosted rust-cpu pool saturates (rivet-core mutation\ntesting held it for ~4 hours on 2026-05-17), the entire downstream CI\ntree blocks because eight jobs chain off `test`. Three of those jobs\n— playwright (ubuntu-latest), kani (ubuntu-latest), rocq\n(ubuntu-latest) — have their own runner capacity available and are\nindependent of cargo-test passing:\n\n- Playwright runs the release binary end-to-end via npx.\n- Kani harnesses are bounded model checks against rivet-core source.\n- Rocq theorem proving runs against vendored .v files.\n\nRemove `needs: [test]` from these three jobs (Phase 1 per #299).\n\nUntouched (Phase 1 boundary):\n- coverage / mutants — legitimately re-run the same suite, keep gate.\n- verus — deferred to Phase 2.\n- vscode-extension / release-results — Phase 2 audit items.\n\nCloses #299.\n\nCo-authored-by: Claude <noreply@anthropic.com>",
          "timestamp": "2026-05-19T01:45:54-05:00",
          "tree_id": "10902068053c9085c5c42532ec3fb65266521caa",
          "url": "https://github.com/pulseengine/rivet/commit/284b51c1e583f4f1a335a4d8684a10f87a0c33a7"
        },
        "date": 1779190328197,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 82347,
            "range": "± 860",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 877199,
            "range": "± 9790",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12624029,
            "range": "± 339805",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2045,
            "range": "± 31",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24571,
            "range": "± 44",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 374853,
            "range": "± 7998",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 97,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/1000",
            "value": 97,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 97,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1417827,
            "range": "± 20604",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 164484,
            "range": "± 714",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1872418,
            "range": "± 15187",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 26094482,
            "range": "± 963800",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 122052,
            "range": "± 1514",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1103527,
            "range": "± 15624",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 12995506,
            "range": "± 350432",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4164,
            "range": "± 35",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 45966,
            "range": "± 1418",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 722640,
            "range": "± 4374",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 63787,
            "range": "± 642",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 712952,
            "range": "± 3065",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7957014,
            "range": "± 101393",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 797,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7085,
            "range": "± 12",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 90580,
            "range": "± 1181",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22479,
            "range": "± 266",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 156567,
            "range": "± 596",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1476459,
            "range": "± 21549",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "bfebc592baab78fc8b752713bc5d56bd3171e332",
          "message": "feat(supplier): Phase 2 — federation handshake + FederationProvenance (#288) (#292)\n\n* feat(supplier): derives-from-external structured target + FederationProvenance (#288)\n\nItems 1 and 4 of issue #288 (Phase 2 federation handshake). Lays the\ndata-model foundation for cross-org link semantics and the provenance\nblock that `rivet supplier pull` will stamp on imported artifacts.\n\n- `Link.external: Option<ExternalLinkTarget>` — when YAML `target:` is\n  a mapping (the cross-org `*-external` link types), `Link.target`\n  mirrors the mapping's `anchor:` field for graph navigation while the\n  full `{org, contract, doc-id, last-synced, sha256, anchor}` payload\n  flows into `Link.external`. Existing flat-string targets round-trip\n  unchanged via a custom serde impl that emits whichever shape the\n  link carries.\n\n- `derives-from-external` link type in `schemas/common.yaml`. Companion\n  inverse: `derived-into-external`.\n\n- `FederationProvenance` block on `Provenance` for federated artifacts:\n  `{source-org, source-tool, source-id, anchor, fetched-at,\n  source-hash, mapping-recipe}`. Optional — first-party / AI / human\n  artifacts continue to serialise without the block.\n\n- `yaml_hir.rs` CST link extractor handles the structured-target shape\n  by dedenting the raw value text and round-tripping through\n  serde_yaml. Regression-tested against the previous behaviour, which\n  silently mis-targeted the link at the first key (\"org\") of the\n  mapping value.\n\n- Mechanical: every `Link { link_type, target }` initialiser across\n  core + cli + tests now includes `external: None`, and the same\n  pattern is added to a handful of stub Provenance constructions for\n  the new `federation: None` field.\n\nTests (oracle-gated, fail without the change):\n- `model::tests::link_flat_target_yaml_roundtrip`\n- `model::tests::link_structured_target_yaml_parse`\n- `model::tests::link_structured_target_yaml_serialize_then_parse`\n- `model::tests::link_structured_target_requires_anchor`\n- `model::tests::federation_provenance_yaml_roundtrip`\n- `model::tests::provenance_federation_block_is_optional`\n- `yaml_hir::tests::links_extraction_structured_external_target`\n\nPhase 2 cited-source ReqIF backend and `rivet supplier pull` ship in\nfollow-up commits on the same branch.\n\nImplements: REQ-010\nRefs: REQ-020, FEAT-001\n\nhttps://claude.ai/code/session_01Ms4nZDTtdfzvzTu8m3ghSj\n\n* feat(cited-source): kind: reqif backend with sha + XML well-formedness gate (#288)\n\nItem 2 of issue #288 (Phase 2 federation handshake). Promotes ReqIF\nfrom \"round-trip only\" to a first-class local-file backend alongside\n`kind: file`.\n\n- `CitedSourceKind::is_local_phase2()` admits `Reqif` in addition to\n  `File`.\n- `resolve_reqif_uri()` handles `reqif://`, `file://`, and bare-path\n  forms — all degrade to local-file semantics. HTTP(S) ReqIF endpoints\n  remain Phase 3+ (auth / fetch backend out of scope here).\n- `check_cited_source` for `kind: reqif`: read bytes, sha256, verify\n  against stamped hash → `Match` / `Drift` / `MissingHash`. Plus a\n  ReqIF XML well-formedness check via `reqif::parse_reqif` so a\n  malformed supplier delivery surfaces as a typed `FileError` at\n  `rivet validate` time rather than poisoning the supplier cache at\n  pull time.\n\nTests (oracle-gated, fail without the change):\n- `cited_source::tests::check_cited_source_reqif_match_when_hash_agrees`\n- `cited_source::tests::check_cited_source_reqif_drift_when_hash_differs`\n- `cited_source::tests::check_cited_source_reqif_missing_hash_returns_computed`\n- `cited_source::tests::check_cited_source_reqif_rejects_malformed_xml`\n- `cited_source::tests::resolve_reqif_uri_handles_scheme_and_relative`\n\nFixes: REQ-004\nRefs: REQ-020, FEAT-001\n\nhttps://claude.ai/code/session_01Ms4nZDTtdfzvzTu8m3ghSj\n\n* feat(supplier): rivet supplier pull <anchor> — federation handshake (#288)\n\nItem 3 of issue #288 (Phase 2 federation handshake). Wires the\n`external-anchor` artifact's `cited-source` to a local supplier cache\nunder `.rivet/supplier-cache/<org>/<contract>/`. Phase 2 backends:\n`kind: file` and `kind: reqif`; both are read-only on the source side\nand idempotent on the cache side.\n\n- New CLI subcommand: `rivet supplier pull <anchor> [--format text|json]`.\n- Looks up the anchor by ID, validates it's `external-anchor`-typed,\n  parses its `cited-source` field, fetches the local payload, and\n  cross-checks the stamped sha256 against the wire bytes. Refuses to\n  write a poisoned cache entry when the stamped hash drifts — the\n  auditor must re-stamp the anchor and retry.\n- For ReqIF, runs `reqif::parse_reqif` to verify XML well-formedness\n  before caching.\n- Writes payload as `<anchor>.<ext>` (`.reqif` for reqif kind,\n  inherits source extension for file kind) and a sibling\n  `<anchor>.manifest.yaml` carrying the `FederationProvenance` block\n  + cache metadata.\n- Idempotent: a re-pull with identical bytes refreshes the manifest's\n  `fetched-at` but leaves the payload untouched (the JSON output\n  reports `bytes_unchanged: true`).\n- `sanitize_path_component()` clamps `<org>` / `<contract>` to ASCII\n  alphanum + `-_.` so an injected path separator can't escape the\n  cache root.\n\nMade `check::sources::current_iso8601_utc()` crate-public for reuse\nas the fetch-timestamp source.\n\nTests (oracle-gated, fail without the change):\n- `cli_commands::supplier_pull_kind_file_writes_cache_and_manifest`\n- `cli_commands::supplier_pull_refuses_on_sha256_drift`\n- `cli_commands::supplier_pull_idempotent_on_re_run`\n- `cli_commands::supplier_pull_kind_reqif_writes_reqif_extension`\n- `cli_commands::supplier_pull_unknown_anchor_errors`\n\nImplements: REQ-007\nRefs: REQ-020, FEAT-001\n\nhttps://claude.ai/code/session_01Ms4nZDTtdfzvzTu8m3ghSj\n\n---------\n\nCo-authored-by: Claude <noreply@anthropic.com>",
          "timestamp": "2026-05-19T10:46:52-05:00",
          "tree_id": "92eb60c79f406bcc25fff673528b964d49652d40",
          "url": "https://github.com/pulseengine/rivet/commit/bfebc592baab78fc8b752713bc5d56bd3171e332"
        },
        "date": 1779206042187,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84103,
            "range": "± 456",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 894847,
            "range": "± 5546",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14218636,
            "range": "± 626699",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2188,
            "range": "± 12",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25505,
            "range": "± 406",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 367284,
            "range": "± 2857",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 93,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/1000",
            "value": 93,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 93,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1453169,
            "range": "± 25833",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 151042,
            "range": "± 9613",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1751427,
            "range": "± 17740",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 26747394,
            "range": "± 1171881",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 130156,
            "range": "± 1398",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1137316,
            "range": "± 24356",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 14481483,
            "range": "± 1071664",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4305,
            "range": "± 37",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 61694,
            "range": "± 1361",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 804261,
            "range": "± 7310",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 61214,
            "range": "± 202",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 691955,
            "range": "± 3633",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8193007,
            "range": "± 288658",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 734,
            "range": "± 9",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7537,
            "range": "± 73",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 115541,
            "range": "± 840",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 25553,
            "range": "± 391",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 185462,
            "range": "± 2799",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1738470,
            "range": "± 25607",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "4354d99a32ce3ff9b1efbc57e7cfd824b88853b0",
          "message": "feat(variant): Phase 2 — config loading + validate/coverage wiring (#287) (#291)\n\n* feat(variant): load variant configs from a directory (Phase 2)\n\nAdd `feature_model::load_variant_configs_from_dir` so callers can\nwalk `artifacts/variants/*.yaml`, deserialize each entry as a\n`VariantConfig`, and feed the resulting list to validate / coverage /\nlist / query.\n\nThis is the loader-side primitive for issue #287. It:\n- ignores non-yaml files, sorts results by file name for reproducible\n  output across platforms,\n- returns an empty list (not an error) for a missing directory so\n  callers can use it unconditionally,\n- rejects duplicate `name:` keys across files so downstream consumers\n  never have to guess which variant a name refers to.\n\nTests cover all four behaviours (missing dir, sorted load, duplicate\nrejection, parse-error surfacing).\n\nImplements: REQ-007\n\n* style(variant): apply rustfmt to load_variant_configs_from_dir tests\n\nPure rustfmt result — no functional changes. Tightens spacing on\nmulti-arg `std::fs::write` calls and a few `assert!` macros. Was\ngenerated by running `cargo fmt --all` after the prior commit.\n\nTrace: skip\n\n* feat(validate): --variant flag and per-variant overlay validation\n\nImplements issue #287 Phase 2 acceptance criteria 1-3:\n\n1. Variant configs in `artifacts/variants/*.yaml` are loaded on every\n   command invocation (via the loader added in the previous commit).\n2. `--variant <NAME_OR_PATH>` is now accepted by `rivet validate`,\n   `rivet coverage`, `rivet list`, and `rivet query`. The argument\n   resolves first as a filesystem path, then as a bare name against\n   `<project>/artifacts/variants/<NAME>.yaml`; a bad name errors with\n   the list of available variants.\n3. Per-variant field overlays are now validated.\n   - `validate_variants` (new) does two passes:\n     * cross-check each `fields-per-variant:` key against the\n       project's known-variants set (declared configs + features) —\n       warning by default, error under the new `--strict-variants`\n       flag, matching the `Variant key 'foo' ...` error class spelled\n       out in `docs/design/variant-aware-properties.md` §5.6.\n     * type-check every variant overlay's merged view against the\n       same required-field / allowed-values rules as the default\n       view, emitting diagnostics like `field 'X' has value 'V'\n       (variant: industrial), allowed: [...]`.\n   - Per design doc §5.5 the default view is still validated by the\n     existing pipeline; the overlay layer is purely additive.\n\nCLI surface:\n- `rivet validate --variant industrial` validates default + overlay.\n- `rivet validate --strict-variants` promotes unknown-key warnings to\n  errors (CI hygiene).\n- `rivet list --variant industrial --format json` emits each\n  artifact's merged `fields:` plus a top-level `\"variant\": \"...\"`.\n- `rivet query --sexpr '(= max-temp-c \"100\")' --variant industrial`\n  filters against the merged view, so an overlay value satisfies the\n  filter where the default would not.\n- `rivet coverage --variant industrial` stamps the active variant in\n  both text and JSON output (delegated-chain scoping deferred — issue\n  #287 acceptance criterion 4).\n\nTests cover every new behaviour:\n- 4 lib tests for `load_variant_configs_from_dir` (in prior commit),\n- 7 lib tests for `validate_variants` (unknown key warning, strict\n  promotion, allowed-values failure on overlay, clean pass, required\n  field missing in merged view, empty-overlay fast path, known set\n  accepts features),\n- 8 CLI integration tests for the end-to-end `--variant` flag.\n\nImplements: REQ-004, REQ-007\nRefs: FEAT-001\n\n---------\n\nCo-authored-by: Claude <noreply@anthropic.com>",
          "timestamp": "2026-05-19T11:24:49-05:00",
          "tree_id": "ddc6eeec3f9c005f7df903e37b387ab8c2fbea7e",
          "url": "https://github.com/pulseengine/rivet/commit/4354d99a32ce3ff9b1efbc57e7cfd824b88853b0"
        },
        "date": 1779208289768,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 87164,
            "range": "± 801",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 930255,
            "range": "± 8757",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13530071,
            "range": "± 206728",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1939,
            "range": "± 32",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25145,
            "range": "± 43",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 362427,
            "range": "± 2194",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 97,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/1000",
            "value": 97,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 97,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1413207,
            "range": "± 22357",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 152980,
            "range": "± 839",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1775593,
            "range": "± 7371",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 25710101,
            "range": "± 248616",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 124407,
            "range": "± 466",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1142914,
            "range": "± 31076",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 14012322,
            "range": "± 410654",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4327,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 44067,
            "range": "± 368",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 769410,
            "range": "± 4502",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 64651,
            "range": "± 9096",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 709575,
            "range": "± 5288",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8226941,
            "range": "± 64061",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 765,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 6869,
            "range": "± 40",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 95590,
            "range": "± 607",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21085,
            "range": "± 116",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 146516,
            "range": "± 1128",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1360245,
            "range": "± 12417",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "2edaf06e98ad61395bdb0653b917770c992abfc3",
          "message": "docs(cross-org): cross-git investigation — findings + SEooC AoU register + change list as Rivet artifacts (#304)\n\n* docs(cross-org): cross-git investigation — findings + SEooC AoU register + change list as Rivet artifacts\n\nThree coordinated outputs from the 2026-05-19 cross-git investigation\n(6 personas, 10 scenarios, 3 test-bed repos in /tmp/rivet-cross-git/):\n\n  • docs/research/cross-git-repo-investigation.md — full synthesis:\n    11 findings, persona-converging carve-into-the-wall quotes, SEooC\n    safety-property + Assumptions-of-Use register, architectural\n    commitment question (which cross-repo mechanism survives), the\n    missing producer-side story, and comparison to git-submodules\n    and Google's `repo` tool.\n\n  • docs/rivet-is-not.md — Cederqvist-style epistemic-honesty doc in\n    SEooC Safety Manual register. Eight categorical \"Rivet is not...\"\n    sub-sections, each grounded in a real Rivet operation and naming a\n    concrete cliff. Linked from the synthesis as the doc the\n    First-Time User persona wished they had found at hour zero.\n\n  • artifacts/cross-git-investigation.yaml — the change list itself,\n    dogfooded as Rivet artifacts rather than GitHub issues:\n      FEAT-135 anchors the AoU register.\n      DD-067 records the open architectural commitment (delete\n              `externals:` in favour of `external-anchor`?).\n      REQ-062  validate must surface skipped files as Errors (P0;\n               unanimous persona blocker).\n      REQ-063  init must not silently produce broken safety-critical\n               projects (DO-178C / EN-50128 / IEC-61508 / IEC-62304).\n      REQ-064  derives-from-external must parse structured-target\n               end-to-end (advertised in #292, not delivered).\n      REQ-065  cross-repo diagnostics propagation (the SEooC AoU).\n      REQ-066  one-line schema fix: external-anchor must declare\n               cited-source.\n      REQ-067  doc topic must explain both mechanisms until DD-067\n               decides.\n      REQ-068  supplier pull must refuse-and-error on sha256 drift.\n      REQ-069  rivet supplier publish + producer-readable manifest\n               (the missing producer-side story).\n      REQ-070  link docs/rivet-is-not.md from README.\n      REQ-071  add rivet docs cross-repo-ci topic with worked GH\n               Actions example + AoU register.\n      REQ-072  docs/rivet-is-not.md §7 grows AoU-X1..X7 explicitly.\n\nEach artifact cites file:line evidence in the test logs + persona\nreactions. The change list IS its own oracle: running `rivet validate`\non the rivet repo itself reproduces F2 with 140 silent-skip WARNs on\nbindings.yaml, feature-model.yaml, and the variant configs.\n\nRefs: FEAT-135, REQ-010, REQ-004, FEAT-001\n\nCo-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>\n\n* docs(rivet-is-not): apply reviewer edits — open frame, semantic-validator retitle, DPIA expansion, Cederqvist close\n\nSubstantive review of docs/rivet-is-not.md returned six small-but-pointed\nedits. Applied in order:\n\n  1. Open frame trimmed to one paragraph and paired with a new \"What\n     Rivet is\" sibling section (three sentences). Reviewer:\n     \"Cederqvist himself would have used one [paragraph].\"\n  2. Stripped the \"billion-dollar products in 2026\" sentence — the\n     one slip from doctrinal voice into marketing-voice critique.\n  3. §5 retitled \"Rivet is not a semantic validator\" (was \"AI\n     prompt-correctness checker\"). The deeper claim is categorical;\n     AI-authored hallucination is one instance. Body and cliff\n     adjusted to keep both AI-driven and human-driven examples.\n  4. §6 expanded with a paragraph on why the recording-without-\n     performing failure mode is common in practice (recording is\n     cheap, performing is expensive; every team defaults to the\n     cheap operation under deadline pressure).\n  5. §3 cliff retold for \"an engineer (or an agent)\" with explicit\n     release-cut deadline framing. Reviewer asked for at least one\n     human-driven cliff to make clear the categorical limits hold\n     regardless of authorship.\n  6. Closing prescription opens with a Cederqvist citation:\n     \"Acquire the habit of reading specs and talking to your peers\"\n     adapted for the agent-plus-reviewer pair. Cederqvist now bookends\n     the document — once at the open, once at the close — placing it\n     in a tradition rather than borrowing from one.\n  7. \"transposed\" → \"the same pattern at a different layer\" (reviewer\n     called the former \"slightly bookish\").\n  8. DSGVO Art. 35 / Art. 4 first uses now carry \"(GDPR Art. NN)\" in\n     parentheses for the non-German-speaking reader.\n\nReviewer's overall verdict: \"Ship it after the small edits.\"\n\nRefs: FEAT-135, REQ-072\n\nCo-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>\n\n* docs(rivet-is-not): link the Cederqvist source at first mention\n\nVerified the canonical GNU mirror of the \"What is CVS not?\" section\n(part of the CVS manual maintained downstream of Cederqvist's 1993\nauthorship). Opening sentence: \"CVS can do a lot of things for you,\nbut it does not try to be everything for everyone.\" That sentence is\nthe structural-honesty thesis the document inherits.\n\nOne inline link at the first Cederqvist mention. The closing\nprescription keeps its bare-name attribution. Reviewer's other\nannotations considered:\n\n  - \"notified body\" terminology in §4 — kept; the surrounding\n    vocabulary (ISO 26262-8, DO-330, GSN) is already specialist,\n    and a reader who follows those terms knows \"notified body\".\n  - Load-bearing path citations in §4 (rivet-tool-confidence.yaml,\n    tool-qualification-dossier.md) and §7 (cross-org-supplier-\n    traceability.md §2) all verified to resolve in this commit.\n    The reviewer's broader suggestion of a rivet validate rule to\n    keep them honest is a feature request, not this PR's scope.\n  - Possible §6/§8 collapse into \"Rivet records, it does not\n    verify\" — kept separate. Reviewer marked it \"Not a required\n    edit\"; both sections currently land.\n\nRefs: FEAT-135, REQ-072\n\nCo-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>\n\n* docs: cross-link rivet-is-not.md ↔ what-is-rivet.md — different registers, same tool\n\nThe just-shipped docs/rivet-is-not.md and the existing\ndocs/what-is-rivet.md both carry a \"What rivet is NOT\" framing — but\nin different registers. Pre-existing what-is-rivet.md §6 is a\nmarketing-voice bullet list (\"Honesty over hype\" plus seven items\nmixing real limits with v0.5.0 roadmap pointers). New\ndocs/rivet-is-not.md is the SEooC Safety Manual draft in\nCederqvist register.\n\nBoth audiences are legitimate:\n  - what-is-rivet.md is the positioning doc (carries the\n    `<!-- rivet-docs-check: design-doc-aspirational-ok -->` marker)\n    and is the right entry point for someone evaluating Rivet.\n  - rivet-is-not.md is the integrator-facing categorical-limits\n    doc and is the right reference for someone building Rivet into\n    a safety case.\n\nAdding one-sentence cross-references in each direction so a reader\nlanding on either doc can find the other. Neither doc is deleted or\nmerged — they describe the same tool from opposite directions and\nserve different points in the integrator lifecycle.\n\nOut of scope for this commit:\n  - what-is-rivet.md staleness (it's still v0.4.1 / 2026-04-19\n    positioning with several \"planned for v0.5.0\" markers that\n    have shipped or rescoped in v0.10.x). Tracked as a follow-up;\n    the design-doc-aspirational-ok marker acknowledges the lag.\n  - Any consolidation of the two §6/bullets vs §1-§8/categorical\n    treatments. Both currently land, in their respective registers.\n\nRefs: FEAT-135, REQ-072\n\nCo-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>\n\n* docs: dogfood frontmatter on the three new/touched docs + REQ-073 for the broader docs/ structure gap\n\nUser flag 2026-05-19: \"i think the whole docs folder is not well\nstructured and planning stuff in which might be interesting for\nsome time but...\" The point lands. Of 19 depth-1 markdown files\nunder docs/, 11 lack YAML frontmatter — they are invisible to\n`rivet docs`, the dashboard Documents view, and the [[ID]] linkage\nlayer. Rivet does not dogfood its own documents-as-artifacts model.\n\nThis commit handles three things, no more:\n\n  1. Add frontmatter to the three docs introduced or touched in\n     this PR — so the immediate output of this PR doesn't itself\n     widen the dogfood gap:\n       docs/rivet-is-not.md\n         id: DOC-RIVET-LIMITS · type: safety-manual-draft · status: draft\n       docs/research/cross-git-repo-investigation.md\n         id: DOC-CROSS-GIT-INV-2026-05-19 · type: investigation · status: snapshot\n       docs/what-is-rivet.md\n         id: DOC-RIVET-INTRO · type: positioning · status: current\n\n  2. Track the broader docs/ structural problem as REQ-073 in the\n     existing change list (artifacts/cross-git-investigation.yaml).\n     The requirement enumerates: the 11 skipped files; the\n     three-subdir mixing (design/, plans/, research/); the\n     ephemeral-vs-reference lifecycle question; and a candidate\n     `rivet docs --check-frontmatter` CI gate that would close the\n     dogfood loop. Linked back to FEAT-135.\n\n  3. Document the lifecycle distinction explicitly via the\n     `status: snapshot` field on the investigation report —\n     contrasting it with `status: current` for the positioning\n     doc. Future docs in docs/research/ should follow the same\n     pattern until REQ-073's subdir policy lands.\n\nOut of scope for this commit:\n  - Frontmatter for the other 11 docs (REQ-073 tracks it; touching\n    them now would make this PR a docs-bulk-edit).\n  - Reorganising docs/ subdirs (REQ-073 (b)).\n  - The `rivet docs --check-frontmatter` sub-command (REQ-073 (d)).\n\nRefs: FEAT-135, REQ-073\n\nCo-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>\n\n* docs(req): REQ-074 — independent audit of every docs/ markdown against {useful, done-vs-planned, still-true}\n\nUser feedback 2026-05-19 after REQ-073 landed:\n\n  \"i would question to validate the need of all the documents\n   against an independent subagent validating the usefulness as\n   well as if it describes something done or planned or compared\n   if it is still true\"\n\nFiling as REQ-074 in the same change list. The audit is a phase\ndistinct from acting on the audit:\n\n  Phase 1: mechanical classification per file — KEEP / UPDATE /\n           ARCHIVE / DELETE / INVESTIGATE — done by an independent\n           reviewer (subagent or human, NOT the original author).\n  Phase 2: act on each verdict, one PR per cluster.\n\nREQ-074 connects to REQ-073: do the audit first, then frontmatter\nthe survivors — avoid stamping `id:` + `title:` onto docs we're\nabout to delete.\n\nFirst-pass audit launched together with this commit (independent\nsubagent reading docs/ + spot-checking against current main +\nv0.10.1 binary state). Verdict output will be captured separately\nand linked back to REQ-074.\n\nRefs: FEAT-135, REQ-074\n\nCo-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>\n\n* docs(req): add executable Acceptance criteria to REQ-062..REQ-074\n\nUser feedback 2026-05-19: \"ensure that these requirement have a\nvalidation with a step which can be executed and tested against\".\n\nA REQ without acceptance criteria is a wish, not a requirement.\nAdding an `Acceptance:` block to the description of every one of\nthe 13 requirements in artifacts/cross-git-investigation.yaml.\n\nEach block answers the same three questions:\n\n  1. What is the literal action / shell command that demonstrates\n     the REQ is satisfied?\n  2. What output / exit code / diagnostic is expected?\n  3. Where is the regression-test fixture that locks the behaviour?\n\nExamples of the register:\n\n  REQ-062  → \"Create a project with one well-formed artifact YAML\n              and one malformed (top-level `id:` instead of\n              `artifacts:` wrapper). Run `rivet validate --format\n              json`. Verify exit code 1, `result: FAIL`, `errors\n              >= 1`, and at least one entry in `diagnostics[]`\n              with `rule: artifact-parse-error`...\"\n\n  REQ-072  → \"`grep -c \"AoU-X[1-7]\" docs/rivet-is-not.md` returns\n              exactly 7.\"\n\n  REQ-073  → \"`rivet validate 2>&1 | grep -c \"no YAML frontmatter\"`\n              returns 0 (currently 11 on main as of this commit).\"\n\n  REQ-074  → \"Re-running the audit yields zero new INVESTIGATE\n              verdicts and a strictly smaller UPDATE+DELETE count\n              than the previous pass.\"\n\nEach criterion is testable from the shell without ambiguity. None\nare aspirational; all are mechanical or doc-grep checks.\n\nSchema note: Acceptance lives inside the description prose block,\nnot as a separate `acceptance:` field. That keeps the artifacts\nschema-conformant (no `field-undefined` INFOs) while still letting\na reviewer find the verification step instantly via a Ctrl-F on\n\"Acceptance:\" — 13 hits, 13 REQs.\n\nRefs: FEAT-135, REQ-062, REQ-063, REQ-064, REQ-065, REQ-066,\n      REQ-067, REQ-068, REQ-069, REQ-070, REQ-071, REQ-072,\n      REQ-073, REQ-074\n\nCo-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>\n\n* docs(audit): land REQ-074 first-pass docs audit + record doc-vs-artifact graph-unification gap as REQ-073 side-finding\n\nUser feedback drove REQ-074 (independent audit of all 52 docs/\nmarkdown files against {useful, done-vs-planned, still-true}).\nFirst-pass audit completed by independent subagent:\n\n  Verdict counts: KEEP 18 / UPDATE 11 / ARCHIVE 16 / DELETE 0 /\n                  INVESTIGATE 4 / out-of-scope-this-PR 3\n\n  Five worst offenders (most likely to mislead a reader today):\n    1. docs/schemas.md     — lists 5 of 28 shipped schemas\n    2. docs/architecture.md — module table omits ~half of rivet-core;\n                              schema table same defect as schemas.md;\n                              claims OSLC shipped as CLI surface (it isn't)\n    3. docs/oracles.md     — lists 3 of 5 shipped oracles (missing\n                              `sources` and `ai-defects-open` — the\n                              latter is load-bearing for the\n                              tool-qualification dossier's TD1 layer)\n    4. docs/roadmap.md     — marks v0.4.0-and-later as \"Phase 3 — Planned\"\n                              while v0.10.x has shipped most of it\n    5. docs/audit-report.md — 2026-03-09 snapshot still indexed as\n                              a current doc; claims \"Fuzz/Mutation\n                              NOT IMPLEMENTED\" while CI runs both\n\n  Three exemplars (use as templates for the rest):\n    1. design/tool-qualification-dossier.md — §0 honest-scope\n    2. design/polarion-reqif-fidelity.md   — field-by-field LOSSLESS/LOSSY/ABSENT\n    3. design/status-gate-rules.md         — self-declares \"shipped (date, branch)\"\n\n  Directory-structure proposal (8 subdirs by lifecycle):\n    reference/ architecture/ design/ plans/ historical/\n    research/ marketing/ status/\n\n  Two CI checks that would prevent two-thirds of staleness:\n    1. `last-verified:` older than 90 days → warning\n       (extend the cited-source-stale rule to docs)\n    2. Prose-numeric claims (\"28 schemas\") must either be\n       `{{stats:...}}` embeds or carry `<!-- AUDIT: verified DATE -->`\n\n  Single most cost-effective fix: move 12× `plans/2026-03-*.md` +\n  `audit-report.md` to `docs/historical/`. Removes most of the rot\n  in one PR.\n\nCaptured at `docs/research/2026-05-19-docs-audit.md` with\nfrontmatter (id: DOC-DOCS-AUDIT-2026-05-19, type: audit,\nstatus: snapshot). Referenced from REQ-074's Evidence section via\n`[[DOC-DOCS-AUDIT-2026-05-19]]` document-cross-reference syntax.\n\n────────────────────────────────────────────────────────────────\n\nSIDE-FINDING — recorded under REQ-073 description:\n\nTried to add `traces-to: DOC-DOCS-AUDIT-2026-05-19` to REQ-074's\ntyped links. `rivet validate` emitted:\n\n  ERROR: [REQ-074] link 'traces-to' targets\n         'DOC-DOCS-AUDIT-2026-05-19' which does not exist\n  broken cross-refs: 1\n\nDocuments declared with `id:` in markdown frontmatter are NOT\naddressable as typed-link targets from artifact YAML. The\nartifact store and the document store share an ID namespace but\ndo not unify into one graph. The `[[ID]]` syntax in doc bodies\nbridges from docs → artifacts; the reverse bridge does not exist.\n\nThis is a real dogfood gap — Rivet ships two graphs that look\nunified at the namespace level but aren't. Recorded as a sub-clause\nof REQ-073 (b)'s docs/ structure decision: when REQ-073 (b)\ndecides the structure, it should also decide whether documents\nbecome first-class artifacts in the typed graph or remain a\nparallel system. Workaround in this commit: artifact YAML\nreferences the audit via prose `[[DOC-ID]]` only; typed link is\nomitted.\n\nRefs: FEAT-135, REQ-073, REQ-074\n\nCo-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>\n\n* fix: green up PR #304 — doc-check markers + DD-067 rationale field placement\n\nPR #304's CI surfaced two real failures (the other five — Playwright,\nMiri, Proptest, Kani, Rocq — are the known pre-existing flakes).\n\n── Docs Check: 7 violations across 2 files ──\n\n  cross-git-repo-investigation.md — 6 violations:\n    ArtifactCounts ×2  (\"10 scenarios\")\n    ArtifactIdValidity ×2  (REQ-ABS-001, ANCHOR-ACME-001 — test-bed\n      artifacts that live in /tmp/rivet-cross-git/, not the store)\n    SubcommandReferences ×2  (rivet migrate, rivet workspace —\n      referenced precisely because the findings are about their\n      absence)\n  rivet-is-not.md — 1 violation:\n    ArtifactIdValidity  (REQ-SW-022 — an illustrative supplier\n      requirement ID in §3 prose)\n\n  Fix: the investigation doc is a `status: snapshot` research\n  document — same category as docs/design/ and docs/plans/, which\n  doc_check auto-treats as design docs. Added the\n  `design-doc-aspirational-ok` marker (with a comment explaining the\n  snapshot rationale and noting that doc_check should learn to\n  auto-cover docs/research/ — a follow-up under REQ-073). For\n  rivet-is-not.md, which is a reference doc and must stay\n  doc-check-clean without a blanket marker, used a precise\n  `<!-- rivet-docs-check: ignore REQ-SW-022 -->` on the one line.\n\n  Result: doc-check PASS (57 files, 0 violations).\n\n── Test: 2 failures, both from DD-067 ──\n\n  test_dogfood_validate and stats_json_counts_match_validate both\n  failed because DD-067 carried its `rationale` as a TOP-LEVEL\n  artifact key. The `design-decision` schema (schemas/dev.yaml)\n  declares `rationale` as a *required field* — it belongs inside\n  `fields:`, not at artifact top level. Moved it in.\n\n  Worth recording: the salsa-cached `rivet validate` path reported\n  6 errors while `rivet stats` and `rivet validate --direct`\n  reported 7 — the missing-required-field on DD-067 was visible to\n  the direct validator and to stats but NOT to the salsa-incremental\n  path. That divergence is a real salsa-incremental-correctness bug,\n  F2-adjacent (two code paths disagreeing on the same input). It is\n  not introduced by this PR and not in scope to fix here, but it is\n  why the CI Test job caught DD-067 while a local salsa-cached\n  `rivet validate` did not. Flagging for a future REQ.\n\n  Both tests verified green locally:\n    test_dogfood_validate ... ok\n    stats_json_counts_match_validate ... ok\n\nRefs: FEAT-135, REQ-073\n\nCo-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>\n\n---------\n\nCo-authored-by: Claude Opus 4.7 <noreply@anthropic.com>",
          "timestamp": "2026-05-20T11:07:57-05:00",
          "tree_id": "2da8150113bd609b9005b6087ca25f835eb535fa",
          "url": "https://github.com/pulseengine/rivet/commit/2edaf06e98ad61395bdb0653b917770c992abfc3"
        },
        "date": 1779293668837,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 83344,
            "range": "± 1162",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 900971,
            "range": "± 4848",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14039810,
            "range": "± 516231",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2120,
            "range": "± 14",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 27194,
            "range": "± 361",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 374533,
            "range": "± 2510",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 94,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/1000",
            "value": 93,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 94,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1428743,
            "range": "± 24363",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 147834,
            "range": "± 572",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1763095,
            "range": "± 37286",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 28203174,
            "range": "± 1358017",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 129190,
            "range": "± 1426",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1120998,
            "range": "± 10644",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 17790355,
            "range": "± 763016",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4396,
            "range": "± 175",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 61531,
            "range": "± 543",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 792986,
            "range": "± 5398",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 62515,
            "range": "± 1241",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 695312,
            "range": "± 9570",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8671326,
            "range": "± 237752",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 790,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7790,
            "range": "± 107",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 118056,
            "range": "± 808",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23040,
            "range": "± 463",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 169623,
            "range": "± 2269",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1503591,
            "range": "± 27179",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "4848961a88ef3658729c889b631df7d1c6d72b29",
          "message": "fix(validate): surface skipped artifact files as Errors, not stderr-only WARNs (REQ-062) (#305)\n\nThe P0 from the cross-git investigation (FEAT-135 / REQ-062). `rivet\nvalidate` reported `Result: PASS (0 warnings)` when artifact files\nfailed to parse — the skip was swallowed to a stderr `log::warn!` in\n`formats::generic::import_generic_directory` and never reached the\ndiagnostics. A user who wrote an artifact file with the wrong shape\ngot a green PASS over an empty load. The textbook Cederqvist cliff:\ntextual success over a semantically-failed operation.\n\n── classification: F2a (error) vs F2b (legitimate skip) ──\n\nNot every YAML file under a `generic-yaml` source path is an artifact\nfile. `artifacts/bindings.yaml`, `artifacts/feature-model.yaml`, and\n`artifacts/variants/*.yaml` legitimately live there. Promoting every\nskip to an error would make rivet's own repo fail validate. New\n`classify_skip` (rivet-core/src/formats/generic.rs) re-parses a\nfailed file as generic YAML and decides:\n\n  1. not valid YAML at all                 -> ParseError   (F2a)\n  2. top-level mapping has an `artifacts:`  -> ParseError   (malformed list)\n  3. top-level mapping has `id` AND `type`  -> ParseError   (artifact\n       written without the `artifacts:` wrapper — the F2a reproducer)\n  4. anything else                         -> NotArtifactFile (F2b — skip)\n\n── plumbing: non-breaking ──\n\n`load_artifacts`'s signature is unchanged (the repo has a semver gate\non the rivet-core public API). New `load_artifacts_with_skips` returns\n`(Vec<Artifact>, Vec<SkippedFile>)`; `SkipKind`/`SkippedFile` are\nre-exported from the crate root. `cmd_validate` calls it, collects the\n`ParseError` skips, and pushes one `artifact-parse-error` Error\ndiagnostic per skip into the diagnostics vec — flowing into `errors`,\nthe text/JSON output, and the exit code. `NotArtifactFile` skips stay\nsilent.\n\nThe validate `--format json` diagnostic serializer also gained a\n`rule` field (it previously emitted only `severity`/`artifact_id`/\n`message`) — REQ-062's acceptance requires `rule: artifact-parse-error`\nto be visible to a JSON consumer.\n\n── tests ──\n\n  rivet-core: scan_skipped_files_classifies_malformed_vs_non_artifact,\n              classify_skip_treats_corrupt_yaml_as_parse_error\n  rivet-cli:  validate_surfaces_parse_error_on_malformed_artifact_file\n              — oracle-gated: one good + one malformed artifact file\n              -> exit non-zero, result FAIL, errors>=1, an\n              artifact-parse-error diagnostic naming the file; plus an\n              F2b assertion that a bindings.yaml adds no error.\n\nVerified green: cargo build --workspace, clippy -D warnings (exit 0),\nthe three tests above, and test_dogfood_validate (the F2b regression\nguard — rivet's own bindings/feature-model/variant files must not\nerror).\n\nImplements: REQ-004\nVerifies: REQ-062\nRefs: FEAT-135\n\nCo-authored-by: Claude Opus 4.7 <noreply@anthropic.com>",
          "timestamp": "2026-05-20T12:50:41-05:00",
          "tree_id": "73837d7dfd68c1edf60973bcddc8d59c1a0b83dd",
          "url": "https://github.com/pulseengine/rivet/commit/4848961a88ef3658729c889b631df7d1c6d72b29"
        },
        "date": 1779299832426,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 83848,
            "range": "± 2116",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 885756,
            "range": "± 6357",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13224942,
            "range": "± 920409",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2183,
            "range": "± 27",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25974,
            "range": "± 355",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 393070,
            "range": "± 1496",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 94,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/1000",
            "value": 94,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 94,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1434742,
            "range": "± 15149",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 168037,
            "range": "± 1079",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1924431,
            "range": "± 13160",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 26205192,
            "range": "± 1155283",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 129569,
            "range": "± 2200",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1141730,
            "range": "± 9259",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 12870019,
            "range": "± 542203",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4345,
            "range": "± 13",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 62072,
            "range": "± 232",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 806686,
            "range": "± 2392",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 63782,
            "range": "± 440",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 723135,
            "range": "± 3051",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7964315,
            "range": "± 365914",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 753,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 6999,
            "range": "± 30",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 117658,
            "range": "± 588",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 26057,
            "range": "± 191",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 184842,
            "range": "± 673",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1742238,
            "range": "± 14675",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "1741bbfcf39be30f449f07658b0a5ec8d547f58e",
          "message": "docs+schema: external-anchor cited-source field, README \"is not\" link, MSRV doc fix (#306)\n\nWave 1 / PR-B of the cross-git investigation follow-ups (FEAT-135).\nThree small, low-risk fixes bundled — no code changes.\n\nREQ-066 — `external-anchor` schema declares `cited-source`.\n  Every `external-anchor` artifact carrying a `cited-source` (the\n  field `rivet supplier pull` needs) emitted a spurious\n  `field 'cited-source' is not defined in schema for type\n  'external-anchor'` INFO at validate time — the artifact type built\n  for federation did not declare the field that makes it functional.\n  One field added to `schemas/common.yaml`. Verified: an\n  external-anchor with a cited-source no longer emits the INFO.\n\nREQ-070 — README links docs/rivet-is-not.md above the first\n  user-action heading.\n  Per the First-Time User persona (\"put it in the README, not three\n  clicks deep\"). A blockquote before `## Install` points at the\n  SEooC \"What Rivet is not\" doc.\n\nMSRV doc fix (from the docs audit, DOC-DOCS-AUDIT-2026-05-19).\n  `docs/srs.md` and `docs/verification.md` said MSRV 1.85;\n  `Cargo.toml` pins 1.89. Both docs corrected.\n\nVerified: `rivet docs check` PASS (57 files, 0 violations);\nbinary rebuilds clean with the schema change.\n\nImplements: REQ-010\nVerifies: REQ-066\nRefs: FEAT-135, REQ-070\n\nCo-authored-by: Claude Opus 4.7 <noreply@anthropic.com>",
          "timestamp": "2026-05-20T13:45:02-05:00",
          "tree_id": "6f24cf7e49b77df66090eff0e5e126dd31ccdb57",
          "url": "https://github.com/pulseengine/rivet/commit/1741bbfcf39be30f449f07658b0a5ec8d547f58e"
        },
        "date": 1779303114258,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 76960,
            "range": "± 828",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 921525,
            "range": "± 30398",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 18023071,
            "range": "± 1118012",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1720,
            "range": "± 26",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 19146,
            "range": "± 44",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 341425,
            "range": "± 1016",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 85,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/1000",
            "value": 85,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 87,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1344876,
            "range": "± 19158",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 159603,
            "range": "± 389",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1823971,
            "range": "± 22995",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 32488064,
            "range": "± 1838685",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 117890,
            "range": "± 736",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1109793,
            "range": "± 12000",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 17512843,
            "range": "± 2296852",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3915,
            "range": "± 69",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 41567,
            "range": "± 145",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 788854,
            "range": "± 16789",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 54029,
            "range": "± 1584",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 590839,
            "range": "± 6933",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7317955,
            "range": "± 438496",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 606,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 5266,
            "range": "± 17",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 135487,
            "range": "± 612",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22876,
            "range": "± 36",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 172354,
            "range": "± 277",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1616039,
            "range": "± 10561",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "9909bebd3f410e732dec06472cda2b2b8254b127",
          "message": "docs(req): REQ-075 (duplicate IDs) + REQ-076 (orphan detection) — two F2-family findings as typed work items (#307)\n\nTwo findings surfaced in conversation after the cross-git\ninvestigation landed (#304), both confirmed empirically against the\nv0.10.1 binary:\n\nREQ-075 — duplicate artifact IDs are silently swallowed.\n  Two artifacts with the same `id` (two files, or twice in one\n  file) collapse via `store.upsert`'s last-write-wins; the earlier\n  definition is destroyed and `rivet validate` reports PASS.\n  Reproduced 2026-05-20: two files both declaring `id: REQ-DUP` ->\n  `Result: PASS (0 warnings)`, one survivor. `docs/artifact-format`\n  states the uniqueness invariant; nothing enforces it. Direct\n  sibling of REQ-062 — detection must happen at load time, where\n  both copies still exist. Emit `rule: duplicate-artifact-id`\n  naming both source files. P1.\n\nREQ-076 — orphan artifacts are invisible to `rivet validate`.\n  `rivet stats` reports `Orphan artifacts (no links): N`;\n  `rivet validate` never mentions orphans (grep -ic orphan -> 0).\n  An artifact disconnected from the traceability graph passes\n  validate clean. Rivet's own main has 5 such orphans. Fix: emit\n  `rule: orphan-artifact` per orphan — Warning by default (the\n  dogfood's own 5 orphans forbid a hard-error default — REQ-062's\n  F2b lesson applied to severity), Error under `--strict-orphans`,\n  mirroring the `cited-source-drift` strict-flag pattern.\n\nBoth carry executable `Acceptance:` blocks and link to FEAT-135;\nREQ-075 and REQ-076 both `traces-to` REQ-062 as the sibling fix\nwhose load-report channel they reuse. Slotted into Wave 2 (P1 code\nfixes) of the follow-up plan.\n\nThis commit adds the work items only — the implementations are\nseparate PRs per the audit-then-act discipline established by\nREQ-074.\n\nRefs: FEAT-135, REQ-075, REQ-076\n\nCo-authored-by: Claude Opus 4.7 <noreply@anthropic.com>",
          "timestamp": "2026-05-20T13:45:34-05:00",
          "tree_id": "e935e358f71da3a7e53779545721aa54dd8362e5",
          "url": "https://github.com/pulseengine/rivet/commit/9909bebd3f410e732dec06472cda2b2b8254b127"
        },
        "date": 1779303562540,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85097,
            "range": "± 1046",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 929535,
            "range": "± 11438",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14957925,
            "range": "± 609185",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1917,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24968,
            "range": "± 52",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 356277,
            "range": "± 1097",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 100,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/1000",
            "value": 99,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 100,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1430538,
            "range": "± 23325",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 166720,
            "range": "± 857",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1917845,
            "range": "± 31320",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 53692542,
            "range": "± 4226588",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 123597,
            "range": "± 2748",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1132428,
            "range": "± 15042",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 14081552,
            "range": "± 1433241",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4248,
            "range": "± 129",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 45259,
            "range": "± 4967",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 758399,
            "range": "± 5634",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 64155,
            "range": "± 2697",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 726335,
            "range": "± 3147",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7991848,
            "range": "± 206269",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 785,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7177,
            "range": "± 16",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 99824,
            "range": "± 437",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 25760,
            "range": "± 98",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 175685,
            "range": "± 4881",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1644844,
            "range": "± 8710",
            "unit": "ns/iter"
          }
        ]
      }
    ]
  }
}