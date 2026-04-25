window.BENCHMARK_DATA = {
  "lastUpdate": 1777155402893,
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
          "id": "8d7ad955f67da3dadedc959b077693bcb1d00f07",
          "message": "docs: add ISO 26262 artifact mapping and gap analysis (#164)\n\nEnumerates ~40 ISO 26262:2018 work products (parts 3-9), maps each to\nrivet's current schemas (common, stpa, iec-61508, aspice, score,\nsafety-case, iso-pas-8800), and records the gaps that block an honest\nclaim of \"ISO 26262 support\". 32.5% EXACT, 42.5% APPROX, 25% ABSENT.\nTop gaps: ASIL decomposition, FMEDA with SPFM/LFM/PMHF, item definition\nwith S/E/C-driven HARA, HSI specification, tool confidence TCL matrix.\n\nThis is gap analysis only — no schemas are proposed or implemented.\n\nRefs: REQ-010, FEAT-001\n\nCo-authored-by: Claude Opus 4.7 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-04-21T23:21:25-05:00",
          "tree_id": "af777b92671ac4cb7c8106b4327313beb3cce83c",
          "url": "https://github.com/pulseengine/rivet/commit/8d7ad955f67da3dadedc959b077693bcb1d00f07"
        },
        "date": 1776836922915,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 80729,
            "range": "± 836",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 863038,
            "range": "± 7858",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12858393,
            "range": "± 617901",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1923,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24867,
            "range": "± 49",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 360238,
            "range": "± 9430",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 97,
            "range": "± 3",
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
            "value": 97,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 991632,
            "range": "± 12862",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 169795,
            "range": "± 2729",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1958325,
            "range": "± 15166",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 28638379,
            "range": "± 2486099",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 109201,
            "range": "± 884",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 970272,
            "range": "± 24673",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 10961025,
            "range": "± 270824",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4172,
            "range": "± 16",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 45740,
            "range": "± 1046",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 742657,
            "range": "± 7492",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 58785,
            "range": "± 198",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 719484,
            "range": "± 2442",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8078543,
            "range": "± 310142",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 772,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 6904,
            "range": "± 65",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 90552,
            "range": "± 469",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21630,
            "range": "± 111",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 151425,
            "range": "± 3371",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1396101,
            "range": "± 16811",
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
          "id": "0dbf10ce5d9371506d48c3b9a520cf19f3fda938",
          "message": "build(npm): add @pulseengine/rivet distribution (#166)\n\nAdds npm distribution machinery so rivet can be installed/run via\n`npx @pulseengine/rivet` and registered with Claude Code as an MCP server.\n\nPattern follows pulseengine/template-mcp-server:\n- Root package (`npm/`) uses per-platform optionalDependencies\n  - index.js resolves the correct platform package for the current OS/arch\n  - run.js spawns the resolved binary, forwarding argv/stdio/signals\n  - install.js is idempotent: no-op when platform package resolved, else\n    downloads the archive from the GitHub Release as a fallback\n- Five platform packages under `platform-packages/` (darwin-arm64,\n  darwin-x64, linux-arm64, linux-x64, win32-x64) — each ships a single\n  pre-built binary at publish time (gitignored in source)\n- `release-npm.yml` triggers on `release: published`, downloads the\n  archives produced by `release.yml`, assembles + publishes each platform\n  package, then publishes the root package last so optionalDependencies\n  resolve on first install\n\nDoes not modify release.yml; consumes its artifacts via the release event.\n\nTrace: skip",
          "timestamp": "2026-04-21T23:21:33-05:00",
          "tree_id": "47051f1d6443666dbc4c29e076f678b92cc6801b",
          "url": "https://github.com/pulseengine/rivet/commit/0dbf10ce5d9371506d48c3b9a520cf19f3fda938"
        },
        "date": 1776837018559,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 80408,
            "range": "± 253",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 845732,
            "range": "± 22065",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12414144,
            "range": "± 920339",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2406,
            "range": "± 11",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26302,
            "range": "± 174",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 374972,
            "range": "± 1987",
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
            "value": 95,
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
            "value": 1004034,
            "range": "± 21061",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 165173,
            "range": "± 475",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1915626,
            "range": "± 10797",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 26631897,
            "range": "± 1661262",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 111908,
            "range": "± 952",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 953927,
            "range": "± 5731",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 11331299,
            "range": "± 718090",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4418,
            "range": "± 21",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 61036,
            "range": "± 479",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 780951,
            "range": "± 6113",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 63378,
            "range": "± 297",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 693022,
            "range": "± 2909",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7770007,
            "range": "± 161304",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 803,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7618,
            "range": "± 33",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 111853,
            "range": "± 566",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23032,
            "range": "± 176",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 165251,
            "range": "± 649",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1523531,
            "range": "± 18306",
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
          "id": "61bfc41763a5fd392b7555d892a27b090249a863",
          "message": "docs: audit of documentation-reality mismatches (#171)\n\nEvidence-only audit of every public-facing doc surface (README, docs/,\nCHANGELOG, AGENTS.md, CLAUDE.md, vscode-rivet/README.md, schemas,\nCLI help strings). 28 mismatches registered with claim/reality/type/\nseverity. Top finding: Kani/Verus/Rocq CI jobs are all\ncontinue-on-error:true but CHANGELOG claims them as \"wired in\".\nSecondary: docs/audit-report.md still says fuzz+mutation \"NOT\nIMPLEMENTED\"; docs/schemas.md documents 5 of 27 schemas; multiple\nhand-coded artifact counts (447/57/235+) have drifted from live\nregenerated AGENTS.md values. No fixes applied; separate PRs.\n\nTrace: skip",
          "timestamp": "2026-04-22T00:25:21-05:00",
          "tree_id": "0b7f7ad514851b64d0aac236112b6969618f9294",
          "url": "https://github.com/pulseengine/rivet/commit/61bfc41763a5fd392b7555d892a27b090249a863"
        },
        "date": 1776840546860,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 75407,
            "range": "± 253",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 879766,
            "range": "± 3104",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13619529,
            "range": "± 452687",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1677,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 19262,
            "range": "± 54",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 364096,
            "range": "± 1368",
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
            "value": 917196,
            "range": "± 4688",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 158398,
            "range": "± 691",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1865935,
            "range": "± 18638",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 31747696,
            "range": "± 2108657",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 106256,
            "range": "± 875",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 962591,
            "range": "± 4982",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 12384048,
            "range": "± 851491",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3846,
            "range": "± 17",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 40570,
            "range": "± 154",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 775184,
            "range": "± 5155",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 53201,
            "range": "± 407",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 591902,
            "range": "± 3192",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 6923936,
            "range": "± 149777",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 646,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 5450,
            "range": "± 12",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 154496,
            "range": "± 392",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 20983,
            "range": "± 57",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 147682,
            "range": "± 463",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1374955,
            "range": "± 8929",
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
          "id": "a24c1b95c4d16db2e76ebbe2d8457d0e928bea3b",
          "message": "docs: AI-evidence trend research for product positioning (#173)\n\nInternal strategy doc analyzing whether \"AI agents generating\nwork-product evidence under human review\" is a real industry\ntrend. Field map of 20+ adjacent tools, regulatory tailwind\nanalysis (EU AI Act, ISO/IEC 42001, ASPICE/ISO 26262), and\nfive labelled predictions to test in 12 months.\n\nVerdict: emerging category, not yet a coalesced market. Rivet's\nevidence-unit framing (schema-validated YAML artifacts + AI\nprovenance stamp + human-review validation) is currently only\nshared by useblocks' pharaoh (5 stars), leaving 12-18 months\nof defensible lane around safety-critical SDLCs.\n\nRefs: FEAT-001\n\nCo-authored-by: Claude Opus 4.7 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-04-22T00:25:25-05:00",
          "tree_id": "08aff8315a4eee51bf8f15408dbdd99c924ac6c4",
          "url": "https://github.com/pulseengine/rivet/commit/a24c1b95c4d16db2e76ebbe2d8457d0e928bea3b"
        },
        "date": 1776840974615,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 75422,
            "range": "± 528",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 888137,
            "range": "± 18076",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12948864,
            "range": "± 1395961",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1679,
            "range": "± 10",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 19264,
            "range": "± 61",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 368578,
            "range": "± 2033",
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
            "value": 86,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 87,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 942986,
            "range": "± 6964",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 159145,
            "range": "± 564",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1837707,
            "range": "± 11580",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 46495099,
            "range": "± 6329828",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 106947,
            "range": "± 477",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 944778,
            "range": "± 6489",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 20575420,
            "range": "± 4192188",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3944,
            "range": "± 23",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 40368,
            "range": "± 145",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 797948,
            "range": "± 4703",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 53890,
            "range": "± 178",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 593193,
            "range": "± 3478",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7940709,
            "range": "± 870929",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 647,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 5527,
            "range": "± 12",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 150489,
            "range": "± 983",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21235,
            "range": "± 46",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 148581,
            "range": "± 857",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1375967,
            "range": "± 9026",
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
          "id": "a3f189ddfaf6ca84bd17b957668f7c3edd8af082",
          "message": "docs: v0.4.1 positioning — Evidence as Code frame (#172)\n\n* docs: v0.4.1 positioning — Evidence as Code frame\n\nAdd docs/what-is-rivet.md as the canonical positioning doc:\n\n- Frame rivet as the audit substrate for AI-assisted engineering\n  (not \"SDLC traceability\"). Contrast with Sphinx-Needs'\n  \"Engineering as Code\": rivet is \"Evidence as Code\" — AI-authored,\n  provenance-stamped, machine-validated, human-reviewed in PRs.\n- Document the per-situation playbook for 11 use-cases (TDD, ASPICE,\n  STPA/ISO 26262, requirements, variant/PLE, LLM code review,\n  provenance, cross-tool interop, GSN, tool qualification,\n  spec-driven dev), each with question, artifacts, AI role, human\n  role, and explicit limits.\n- Make the human-vs-AI split explicit in a table.\n- Document what rivet is NOT (no Polarion live editing, no direct\n  ALM connector today, no iso-26262.yaml schema yet, no npm\n  distribution yet — all marked \"planned for v0.5.0\").\n- Quick-start with today's install path (cargo) plus the planned\n  npm path for v0.5.0.\n\nRewrite README.md intro (top ~30 lines) to align with the frame —\nreplacing the feature-list first paragraph with an evidence-centric\none-paragraph pitch that points at docs/what-is-rivet.md for depth.\n\nAll capability claims are verifiable against main HEAD: 34 hazards +\n62 UCAs + 62 controller constraints in safety/stpa/, the MCP tool\nlist (rivet_list/get/query/add/modify/link/unlink/remove/validate/\ncoverage/stats/schema/embed/snapshot_capture/reload) matches\nrivet-cli/src/mcp.rs, and the s-expr predicates\n(forall/exists/reachable-from/reachable-to) match\nrivet-core/src/sexpr_eval.rs.\n\nRefs: FEAT-001\n\nCo-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>\n\n* docs(positioning): align voice to v0.1.0 blog cadence\n\nRewrites docs/what-is-rivet.md and the README intro to match the\nrivet-v0-1-0 blog post cadence: Problem → Answer → Evidence,\nconcrete numbers per section, no marketing vocabulary, three-sentence\nREADME intro (problem / answer / concrete result).\n\nAll facts from 3b89365 preserved. Honesty flags for planned-for-v0.5.0\nitems kept. Use-case palette kept; human-vs-AI table tightened.\n\nRefs: FEAT-001\n\n---------\n\nCo-authored-by: Claude Opus 4.7 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-04-22T00:32:09-05:00",
          "tree_id": "6379ad236d5682e7c14da0998a4bc8351d94d727",
          "url": "https://github.com/pulseengine/rivet/commit/a3f189ddfaf6ca84bd17b957668f7c3edd8af082"
        },
        "date": 1776841340990,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 63742,
            "range": "± 482",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 680683,
            "range": "± 7610",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 10084167,
            "range": "± 397043",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1493,
            "range": "± 42",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 17655,
            "range": "± 42",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 268831,
            "range": "± 1372",
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
            "value": 765988,
            "range": "± 32770",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 129799,
            "range": "± 946",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1499369,
            "range": "± 11804",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 20796472,
            "range": "± 368766",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 83682,
            "range": "± 2191",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 735591,
            "range": "± 2384",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 8237603,
            "range": "± 103401",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3180,
            "range": "± 71",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 35712,
            "range": "± 233",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 570915,
            "range": "± 24810",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 46925,
            "range": "± 132",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 509907,
            "range": "± 3215",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 5991563,
            "range": "± 30851",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 564,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 5259,
            "range": "± 18",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 69200,
            "range": "± 2897",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 16821,
            "range": "± 46",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 116224,
            "range": "± 248",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1084353,
            "range": "± 16570",
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
          "id": "c1d0d01422cd78c8b80e5a39271f8154b20d1890",
          "message": "docs: AI + safety/cyber human-in-the-loop contract (#176)\n\nFrame for the recurring customer objection \"a qualified human still\nhas to do this.\" Enumerates the named-human sign-off role across ISO\n26262, IEC 61508, IEC 62304, DO-178C, EN 50128, ISO/SAE 21434,\nISO 27001, IEC 62443, ASPICE 4.0, EU AI Act Art. 14, and NIST AI RMF.\n\nThen establishes rivet's four-point HITL contract:\n1. Provenance-on-author (today — schemas/common.yaml already gates\n   ai-generated artifacts reaching `active` without reviewed-by).\n2. Human sign-off as a separate stamp (today — `rivet stamp\n   --reviewed-by`; gaps: no structured rationale, no `rivet approve`\n   alias, no Part 11 e-signature).\n3. Audit-trail view (v0.5.0 proposal — `rivet audit-trail <id>` over\n   git history + provenance transitions).\n4. Structural-only validator boundary (today — `rivet validate` never\n   claims to assess credibility).\n\nExplicitly lists what rivet does NOT claim (no safety analysis, no\nhazard-credibility assessment, no assessor replacement, no TCL/TQL\nself-qualification, no regulatory guarantee, no 21 CFR Part 11).\nFive implementation items for v0.5.0 backlog are called out.\n\nLive web fetch was unavailable this session; external standard\nclauses and vendor marketing phrases are flagged *(unverified)* per\nthe constraint \"mark unverified.\"\n\nRefs: FEAT-001, REQ-002, REQ-030\n\nCo-authored-by: Claude Opus 4.7 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-04-22T00:25:35-05:00",
          "tree_id": "272a721846a6963082381fedb240b874128c6183",
          "url": "https://github.com/pulseengine/rivet/commit/c1d0d01422cd78c8b80e5a39271f8154b20d1890"
        },
        "date": 1776841344635,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 79561,
            "range": "± 1157",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 849454,
            "range": "± 6572",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12427702,
            "range": "± 768171",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2189,
            "range": "± 10",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25486,
            "range": "± 127",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 352176,
            "range": "± 1570",
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
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 996233,
            "range": "± 16554",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 159007,
            "range": "± 4536",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1850951,
            "range": "± 37748",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 28155296,
            "range": "± 2195918",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 113134,
            "range": "± 776",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 947809,
            "range": "± 15194",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 12408565,
            "range": "± 1329571",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4210,
            "range": "± 11",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 59012,
            "range": "± 425",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 752776,
            "range": "± 3071",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 62611,
            "range": "± 229",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 689625,
            "range": "± 4883",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8331694,
            "range": "± 473156",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 792,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7198,
            "range": "± 20",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 114702,
            "range": "± 804",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23190,
            "range": "± 188",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 165972,
            "range": "± 2022",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1549161,
            "range": "± 28067",
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
          "id": "ec093ec1eb089e236fd7cbf6bd3bfec177a37fd3",
          "message": "fix(v0.4.1): 5 user-reported pain points (#3, #4, #6, #7, #8) (#174)\n\n* docs+feat(variant): feature-model schema reference + init scaffolder\n\nPain point: users reverse-engineer the feature-model YAML schema because\n`rivet variant --help` has no field reference and `selects:` vs\n`selected:` / group types / s-expression constraint syntax / bindings\nfile shape are undocumented.\n\nChanges:\n- Add docs/feature-model-schema.md: top-level reference for feature\n  model YAML (root, features, group types, constraint syntax) with a\n  worked example.\n- Add docs/feature-model-bindings.md: dedicated binding file reference.\n- Link both from docs/getting-started.md.\n- Variant subcommand doc-comment now points at the schema reference so\n  `rivet variant --help` surfaces it.\n- Add `rivet variant init <name>` scaffolder that writes a starter\n  feature-model.yaml + bindings/<name>.yaml with comments documenting\n  every field.\n\nTests: 3 new integration tests in rivet-cli/tests/variant_init.rs\ncovering scaffolded file contents, overwrite protection, and that the\nscaffolded template parses clean via `rivet variant list`.\n\nImplements: REQ-042, REQ-043, REQ-044\nRefs: REQ-046\n\nCo-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>\n\n* fix(hooks): pre-commit hook walks up to find rivet.yaml (marker discovery)\n\nPain point: `rivet init --hooks` emitted a pre-commit hook that ran\n`rivet validate` at the git root. If the rivet project is relocated\ninside the working tree (e.g. moved to subdir/), the hook either\nsilently validates the wrong directory or fails to find rivet.yaml.\n\nFix: the installed pre-commit hook now walks up from $PWD until it\nfinds a directory containing rivet.yaml, then cd's there before\ninvoking `rivet validate`. If no rivet.yaml exists in the ancestor\nchain, the hook exits 0 silently so it does not block commits in\nunrelated repositories.\n\nTests: rivet-cli/tests/hooks_install.rs adds 2 integration tests — one\nverifies the hook body does not embed a hard-coded -p/--project flag and\nuses the walk-up pattern; one stages a fresh project, moves rivet.yaml\ninto a subdirectory, and confirms the hook still discovers it when run\nfrom a nested path.\n\nFixes: REQ-051\n\nCo-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>\n\n* feat(variant): check-all + optional --variant on validate (API ergonomics)\n\nPain point: variant-scoped validation required --model, --variant, and\n--binding to be passed together — there was no way to validate just\nmodel/binding consistency, and no single-invocation way to assert a\nwhole batch of variants is valid.\n\nChanges:\n- `rivet validate --model X --binding Y` (no --variant) now parses the\n  model, parses the binding, and checks that every feature referenced\n  in the binding exists in the model. Reports a clear diagnostic on\n  unknown feature names instead of the old \"must all be provided\n  together\" error. The full --model + --variant + --binding mode is\n  unchanged.\n- `rivet variant check-all --model M --binding B` iterates every\n  variant declared under `variants:` in the binding file, prints a\n  PASS/FAIL line per variant, and exits non-zero if any fail.\n- `FeatureBinding` in rivet-core grows an optional `variants:` field\n  (default empty) so the same file can carry bindings and declared\n  variants without schema churn.\n\nTests: 5 new integration tests in rivet-cli/tests/variant_scoped_api.rs\ncover the no-variant validate mode, the unknown-feature diagnostic,\ncheck-all exit codes for mixed/all-pass fixtures, and JSON output shape.\nExisting feature_model unit tests still pass (binding YAML is\nbackward-compatible — `variants:` defaults to empty).\n\nImplements: REQ-044, REQ-045, REQ-046\n\nCo-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>\n\n* fix(sexpr): semantic notes on filter parse errors\n\nPain point: `[FilterError { offset: 14, message: \"unexpected atom at\ntop level\" }]` exposed parser internals. Users writing `A and B`,\n`and A B`, or `(bogus A B)` got a positional offset with no hint that\nthey were using the wrong syntax.\n\nFix: extend `FilterError` with an optional `note` field, populated by a\nclassifier that inspects the source before parsing. Three common shapes\nget a semantic nudge:\n  - bare infix (`A and B`) → suggest `(and A B)`.\n  - missing outer parens (`and A B`) → suggest wrapping it.\n  - unknown head (`(bogus …)`) → reference the supported form list.\n`FilterError::Display` renders the positional detail followed by the\nnote on a new line. Feature-model constraint errors now format via\nDisplay instead of Debug, so the note bubbles out through\n`rivet variant check` / `rivet validate --model` paths.\n\nTests: 4 new unit tests in sexpr_eval covering the three error shapes\nplus a success case that must carry no note. All pre-existing tests\nunchanged.\n\nFixes: REQ-043\nImplements: REQ-042\n\nCo-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>\n\n* feat(variant-solve): per-feature origin tracking (selected vs mandatory vs implied)\n\nPain point: `rivet variant solve` output mixed user-picked features with\nones the solver added via mandatory-group propagation or constraint\nimplication. A flat list like `base, auth, oauth, token-cache, metrics`\ndidn't tell the user which features were their intent and which were\ndownstream effects.\n\nMinimum-impact change per scope-limits brief (risk of conflict with\nPR #156 cross-tree constraint work):\n- Extend `ResolvedVariant` with a per-feature `origins: BTreeMap<String,\n  FeatureOrigin>` where FeatureOrigin is UserSelected / Mandatory /\n  ImpliedBy(name) / AllowedButUnbound.\n- Populate origins alongside the existing selected-set fixpoint loop —\n  no algorithmic changes. First-reason-wins on insertion so user\n  selection beats later mandatory/implied discoveries.\n- Text output of `rivet variant solve` prints one feature per line,\n  prefixed with `+`, labeled (mandatory) / (selected) / (implied by X).\n- JSON output is strictly additive: `effective_features` + `feature_count`\n  preserved, new `origins` object keyed by feature name.\n\nTests:\n- 4 new unit tests in rivet-core/src/feature_model.rs covering each\n  origin variant.\n- 2 new integration tests in rivet-cli/tests/variant_solve_origins.rs\n  asserting text prefixes/labels and JSON backwards compatibility.\n- All 15 pre-existing feature_model unit tests still pass; all 6\n  proptest_feature_model properties still hold.\n\nImplements: REQ-043, REQ-046\nRefs: REQ-052\n\nCo-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>\n\n---------\n\nCo-authored-by: Claude Opus 4.7 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-04-22T00:32:13-05:00",
          "tree_id": "a752f13702e3de6aea7757c820a5549510722dda",
          "url": "https://github.com/pulseengine/rivet/commit/ec093ec1eb089e236fd7cbf6bd3bfec177a37fd3"
        },
        "date": 1776841901385,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 80953,
            "range": "± 666",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 856517,
            "range": "± 7367",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12537279,
            "range": "± 648516",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2205,
            "range": "± 9",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26488,
            "range": "± 132",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 376680,
            "range": "± 6983",
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
            "value": 95,
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
            "value": 1003470,
            "range": "± 11170",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 160605,
            "range": "± 1496",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1894233,
            "range": "± 15650",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 24722751,
            "range": "± 589888",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 109140,
            "range": "± 466",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 919630,
            "range": "± 6164",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 10029428,
            "range": "± 280437",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4265,
            "range": "± 42",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 59637,
            "range": "± 315",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 758953,
            "range": "± 3808",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 63192,
            "range": "± 340",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 689828,
            "range": "± 5949",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7627965,
            "range": "± 156473",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 775,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7516,
            "range": "± 40",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 120861,
            "range": "± 1266",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22560,
            "range": "± 91",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 157621,
            "range": "± 1656",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1483546,
            "range": "± 23154",
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
          "id": "89cdb7531d1c24ed9572ba163699e144d6318de4",
          "message": "fix(reqif): 6 fidelity bugs — provenance, typed fields, tags, creation-time, enum, dangling relations (#175)\n\n* fix(reqif): round-trip AI provenance via rivet:* string attributes\n\nReqIF importer set `provenance: None` unconditionally and the exporter\nnever emitted any provenance data — every AI-provenance field was ABSENT\non Path 2 per the fidelity analysis in\ndocs/design/polarion-reqif-fidelity.md.\n\nDefine a stable ReqIF AttributeDefinition scheme (five `rivet:*` string\nattributes: created-by, model, session-id, timestamp, reviewed-by) and\nround-trip the full `Provenance` struct.  Absence on import stays\n`None` for backward compatibility with files that don't carry rivet\nmetadata.\n\nAdds two regression tests:\n- test_provenance_roundtrip — all five fields survive\n- test_provenance_absent_stays_none — backward-compat contract\n\nFixes: REQ-025\n\n* fix(reqif): emit typed fields via canonical strings, not Debug-form\n\nThe exporter wrote `format!(\\\"{other:?}\\\")` for any non-string\n`serde_yaml::Value` in `Artifact.fields`, producing XML payloads like\n`\\\"Bool(true)\\\"` and `\\\"Sequence [String(\\\\\\\"a\\\\\\\")]\\\"` — not something any\nReqIF consumer (Polarion, DOORS, StrictDoc) could parse.\n\nReplace with `encode_field_value` doing explicit per-variant conversion:\n- `Bool`  → `\\\"true\\\"` / `\\\"false\\\"`\n- `Number` → decimal string\n- `Sequence` / `Mapping` → JSON (well-known, reversible, and a YAML\n  subset so it survives re-parse)\n- `Null` → attribute omitted\n- `Tagged` → recurse on inner value\n\nThe importer mirrors this with `decode_field_value`: best-effort JSON\nrecovery for content that unambiguously looks structured (leading `[`,\n`{`, `true`, `false`, or a digit/sign); anything else stays a string.\n\nAdds two regression tests:\n- test_non_string_fields_roundtrip — bool/int/float/list round-trip and\n  the raw XML contains no `Bool(`, `Number(`, or `Sequence [` fragments.\n- test_null_field_dropped_on_export — null fields are omitted, not\n  emitted as empty attributes.\n\nFixes: REQ-025\n\n* fix(reqif): encode tags as JSON array so commas and whitespace survive\n\nTags were joined on `, ` at export and split on `,` at import, so any\ntag containing a comma (`\\\"safety, critical\\\"`) or leading whitespace was\nsilently mangled on re-import — a silent corruption flagged in the\nfidelity scorecard.\n\nSwitch to JSON array encoding on export (`[\\\"safety, critical\\\", \\\"plain\\\"]`).\n`decode_tags` auto-detects the form: values starting with `[` are parsed\nas JSON; everything else falls back to the legacy comma-split, keeping\nbackward compatibility with older rivet exports and ReqIF files from\nother tools.\n\nAdds two regression tests:\n- test_tags_with_special_chars_roundtrip — commas, leading space, and\n  quotes all survive export/import.\n- test_tags_legacy_comma_form_parses — the fallback path still works.\n\nFixes: REQ-025\n\n* fix(reqif): stamp REQ-IF-HEADER CREATION-TIME with current UTC\n\nThe header hardcoded `creation_time: None`, so every export emitted an\nempty CREATION-TIME — tools like Polarion's ReqIF importer have nothing\nto record against, and diffing two exports over time becomes impossible.\n\nAdd `reqif_creation_timestamp()` which returns ISO-8601 UTC using the\nsame `std::time::SystemTime` + civil_from_days algorithm already used by\n`export.rs::timestamp_now`, keeping the no-chrono dep contract.\n\nAdds regression test test_creation_time_is_stamped asserting the XML\ncontains a non-empty `<CREATION-TIME>` in the 20-char ISO form.\n\nFixes: REQ-025\n\n* fix(reqif): emit ENUMERATION datatype for schema allowed-values fields\n\nThe exporter always wrote a single `DATATYPE-DEFINITION-STRING` and\nmapped every field to a STRING attribute, silently flattening any\n`allowed-values` constraint the schema declared (e.g. severity:\n[catastrophic, critical, marginal, negligible]).  Downstream tools that\nconsume ReqIF lose the closed-enum semantics.\n\nAdd `ReqIfAdapter::with_schema(schema)` and a new\n`build_reqif_with_schema(artifacts, Option<&Schema>)`; `build_reqif` now\ndelegates to it with `None` for backward compatibility.  When a schema\nis attached and the artifact's `ArtifactTypeDef.fields` declares\n`allowed-values`, the exporter emits:\n\n- one `DATATYPE-DEFINITION-ENUMERATION` per (artifact-type, field) pair\n- an `ATTRIBUTE-DEFINITION-ENUMERATION` on the matching SpecObjectType\n- an `ATTRIBUTE-VALUE-ENUMERATION` on each SpecObject whose value\n  matches an allowed label; values outside the enum fall back to STRING\n  so validate.rs can still flag them.\n\nThe importer path is unchanged — it already recognised\nATTRIBUTE-VALUE-ENUMERATION via the existing StrictDoc compatibility\ncode — so the round-trip closes.\n\nAdds two regression tests:\n- test_schema_enum_field_emits_enumeration — round-trip through a real\n  `Schema` with `allowed-values: [catastrophic, critical, …]`.\n- test_export_without_schema_stays_string — no unexpected ENUMERATION\n  when no schema is attached.\n\nSchema.rs is not modified; the adapter only reads `FieldDef.allowed_values`\nvia its public API.\n\nFixes: REQ-025\n\n* fix(reqif): reject dangling SPEC-RELATION targets instead of phantom Links\n\nPreviously the importer built `SpecRelation`s in a single pass: if the\ntarget SpecObject didn't exist in the file, the Link was still attached\nto the source artifact pointing at a missing ID.  That phantom edge\nwould later surface as a broken link in the LinkGraph, but the cause\n(a malformed ReqIF input) was silently lost.\n\nTwo-pass import:\n  1. First pass (already present) collects every SpecObject ID into\n     `artifact_ids`.\n  2. Relation pass now checks both source and target against that set;\n     any mismatch is collected into `dangling` with the source/target/role\n     triple.  At the end, if `dangling` is non-empty the whole import is\n     rejected with `Error::Adapter` listing every offending relation.\n\nThis is more aggressive than `links.rs` (which keeps broken links as\nadvisory data) because a ReqIF file is an atomic interchange unit — a\ndangling SPEC-OBJECT-REF means the file is malformed, not that the\ntraceability store has a temporary gap.\n\nAdds two regression tests:\n- test_dangling_spec_relation_rejected — target points at a missing ID;\n  error names the missing target and the link role.\n- test_dangling_source_rejected — source points at a missing ID.\n\nFixes: REQ-025",
          "timestamp": "2026-04-22T00:32:16-05:00",
          "tree_id": "fbda38a97f6c3ae5fabef108b43005b627132712",
          "url": "https://github.com/pulseengine/rivet/commit/89cdb7531d1c24ed9572ba163699e144d6318de4"
        },
        "date": 1776842091439,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 83016,
            "range": "± 770",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 875141,
            "range": "± 4844",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13494185,
            "range": "± 1296034",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1973,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24885,
            "range": "± 94",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 366987,
            "range": "± 4474",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 97,
            "range": "± 2",
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
            "value": 1003577,
            "range": "± 19594",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 166720,
            "range": "± 765",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1923037,
            "range": "± 27960",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 28469244,
            "range": "± 1422960",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 109340,
            "range": "± 544",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 961779,
            "range": "± 9241",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 11441920,
            "range": "± 561797",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4120,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 44409,
            "range": "± 840",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 728791,
            "range": "± 3553",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 63618,
            "range": "± 125",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 708525,
            "range": "± 2221",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8061328,
            "range": "± 367821",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 734,
            "range": "± 15",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 6455,
            "range": "± 38",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 90299,
            "range": "± 416",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22135,
            "range": "± 91",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 154932,
            "range": "± 1185",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1469702,
            "range": "± 14966",
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
          "id": "f46fb627cc8797694922c5e3067d3bbe1b70c7c5",
          "message": "feat(cli): v0.4.1 CLI polish — fail-on, stats counts, coverage gate, JSON schemas (#177)\n\n* feat(cli): add --fail-on <severity> flag to validate\n\nNew flag on `rivet validate`: --fail-on error (default, current\nbehavior), --fail-on warning, --fail-on info. Exit code 1 when any\ndiagnostic at or above the given severity is emitted. Lets CI tighten\nthe traceability gate over time without forcing every warning to be\npromoted in the schema.\n\nTests cover all three outcomes: default --fail-on error on a\nwarning-only project exits 0, --fail-on warning on the same project\nexits 1, and an invalid value is rejected with a clear error message.\n\nImplements: REQ-007\n\nCo-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>\n\n* feat(cli): include errors/warnings/infos in stats JSON output\n\n`rivet stats --format json` now exposes the same severity breakdown\nas `rivet validate --format json` (new fields: errors, warnings,\ninfos). Removes the need for consumers to make a second validate\ncall just to get diagnostic counts when rendering a dashboard or\nCI summary. Existing fields (total, types, orphans, broken_links)\nare unchanged — additive only, backward-compatible.\n\nThe text output gains a trailing \"Diagnostics: N error(s), ...\"\nsummary line so the human-readable form agrees with JSON.\n\nTests: one asserting the new fields are present and numeric; a\ncross-command test asserting stats and validate agree on the\ncounts for the current project.\n\nImplements: REQ-007\n\nCo-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>\n\n* feat(cli): polish coverage --fail-under gate\n\nThe --fail-under flag already gated exit code on overall coverage.\nThis commit hardens and documents the CI-gate use case:\n\n- JSON output echoes a new `threshold: { fail_under, passed }`\n  block when the flag is set, so consumers can distinguish a clean\n  run from a gated failure without parsing stderr.\n- Text output prints a \"✔ coverage N.N% meets threshold M.M%\" line\n  on success to match the existing failure message.\n- JSON output now carries `\"command\": \"coverage\"` for consistency\n  with the rest of the --format json envelopes.\n\nTests: --fail-under 0 passes, --fail-under 101 fails, no flag is\nreport-only, and JSON carries the threshold echo.\n\nImplements: REQ-007\n\nCo-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>\n\n* feat(cli): publish JSON schemas for --format json outputs\n\nAdds draft-2020-12 JSON Schemas describing every `--format json` CLI\noutput so downstream consumers can validate against a machine-readable\ncontract instead of reverse-engineering field layouts:\n\n  schemas/json/validate-output.schema.json\n  schemas/json/stats-output.schema.json\n  schemas/json/coverage-output.schema.json\n  schemas/json/list-output.schema.json\n\nSchemas are hand-written (rivet has no `schemars` dependency today —\ngrep of workspace Cargo.toml files returned zero hits — and pulling\nit in just for four small schemas is heavier than the schemas\nthemselves).\n\nTwo new subcommands under `rivet schema` surface the schemas:\n\n  rivet schema list-json          # enumerate shipped schemas + paths\n  rivet schema get-json <name>    # print path for one\n  rivet schema get-json <name> --content   # print schema content\n\nTests cover:\n- every shipped schema file is valid JSON with required metadata\n- `schema list-json --format json` lists all four, all files exist\n- `schema get-json <name>` round-trips path-and-content for all four\n- an unknown name is rejected with a helpful error\n- the actual `rivet validate` / `rivet stats` JSON output contains\n  every `required` field declared in the corresponding schema — so\n  future field drift fails CI instead of silently breaking consumers\n\nImplements: REQ-007\n\nCo-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>\n\n---------\n\nCo-authored-by: Claude Opus 4.7 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-04-22T00:32:20-05:00",
          "tree_id": "ce9589522412f452395d3656729e243f43e7fea3",
          "url": "https://github.com/pulseengine/rivet/commit/f46fb627cc8797694922c5e3067d3bbe1b70c7c5"
        },
        "date": 1776842638696,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 82255,
            "range": "± 1519",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 878407,
            "range": "± 5081",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 16660800,
            "range": "± 1180942",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1949,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24905,
            "range": "± 524",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 359875,
            "range": "± 3251",
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
            "value": 97,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 97,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1006756,
            "range": "± 16983",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 166852,
            "range": "± 2985",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1927758,
            "range": "± 19675",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 30285021,
            "range": "± 4189699",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 110097,
            "range": "± 1500",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 964375,
            "range": "± 16385",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 13833296,
            "range": "± 1288159",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4138,
            "range": "± 20",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 44392,
            "range": "± 1656",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 742229,
            "range": "± 5251",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 61614,
            "range": "± 229",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 707695,
            "range": "± 11808",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8363193,
            "range": "± 593552",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 734,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 6480,
            "range": "± 22",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 93708,
            "range": "± 389",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22499,
            "range": "± 59",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 162628,
            "range": "± 3788",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1471654,
            "range": "± 15949",
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
          "id": "22b936f42dc3920ef2851a50647f9ec761503841",
          "message": "feat(serve): variant selector + filtering in dashboard (#179)\n\n* feat(serve): plumb variant scope through ViewParams and backend\n\nDiscover the project's feature model, binding, and variant YAML files\nat load/reload time and hang them off AppState. Adds\nbuild_variant_scope, which filters the in-memory Store, LinkGraph, and\ncached diagnostics down to the artifacts bound to a variant's\neffective features. Routes /stats, /artifacts, /coverage, /validate,\n/stpa, /matrix plus the matching /api/v1 endpoints now honor an\noptional ?variant=NAME query param and return 400 for unknown names.\n\nA variant dropdown is rendered in the context bar whenever a feature\nmodel is present; selecting one reloads the page with ?variant=X. A\n\"Filtered to variant: X (N of M)\" banner appears above the content\nwith a Clear filter link; a small HTMX sync script keeps the banner\nhonest after cross-page swaps by reloading when the URL variant drifts\nfrom the rendered banner.\n\nImplements: REQ-007\nRefs: REQ-045, FEAT-001\n\nCo-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>\n\n* feat(serve): add /variants overview page and nav entry\n\nSurface every declared variant in a dedicated nav entry (only shown\nwhen the project has a feature model). Each row reports the solver\noutcome (PASS/FAIL with inline error messages), the effective feature\ncount, the bound artifact count, and the fraction of the total store\nthe variant covers. Quick-pick links jump into the scoped dashboard,\ncoverage, or artifact listings for that variant.\n\nWhen no feature model is configured, /variants renders a friendly\nhint instead — the rest of the dashboard behaves identically for\nnon-variant projects.\n\nImplements: REQ-007\nRefs: REQ-045, FEAT-001\n\nCo-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>\n\n* test: variant filter integration + Playwright specs + fixtures\n\nAdds a minimal feature-model / binding / two variant configs\n(minimal-ci, dashboard-only) to the main project's artifacts/ tree so\nthe existing Playwright and serve_integration harnesses can exercise\nthe variant-filter UX without a bespoke test project. The fixtures\nare parsed as \"no artifacts\" by the generic-yaml adapter so they\ndon't pollute the existing suite.\n\n* Seven new serve_integration tests cover:\n  - /api/v1/artifacts scoped down to 1 row for minimal-ci\n  - /api/v1/artifacts?variant=bogus returns 400 + JSON error\n  - /api/v1/stats and /api/v1/coverage honor the scope\n  - /variants overview renders every declared variant with PASS status\n  - Dashboard header renders the variant-selector dropdown\n  - /stats?variant=... emits the \"Filtered to variant\" banner\n\n* serve-variant.spec.ts (Playwright) covers the UI flow:\n  dropdown population, selection pushing ?variant, Clear filter,\n  reload-preserves-scope, /variants overview, unknown-variant 400,\n  HTMX-driven nav triggering the sync reload.\n\nVerifies: REQ-045\nRefs: REQ-007, FEAT-001\n\nCo-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>\n\n* style(serve): appease clippy on variant module\n\n* Replace useless format!() with .to_string() in the banner.\n* Suppress result_large_err on try_build_scope — the `Err` arm is\n  deliberately an already-built axum Response so handlers can early-\n  return via `return resp` without re-rendering, and the Err path is\n  the uncommon case.\n\nTrace: skip\n\nCo-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>\n\n---------\n\nCo-authored-by: Claude Opus 4.7 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-04-22T01:04:55-05:00",
          "tree_id": "f66081a9738019cfd9216778875dfb50bf1c6908",
          "url": "https://github.com/pulseengine/rivet/commit/22b936f42dc3920ef2851a50647f9ec761503841"
        },
        "date": 1776843802672,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 79721,
            "range": "± 548",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 850404,
            "range": "± 7517",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14769663,
            "range": "± 1292732",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2098,
            "range": "± 15",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26242,
            "range": "± 159",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 372445,
            "range": "± 2174",
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
            "value": 995845,
            "range": "± 20192",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 160376,
            "range": "± 775",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1885874,
            "range": "± 23389",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 29141690,
            "range": "± 2946027",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 112111,
            "range": "± 972",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 953314,
            "range": "± 3447",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 13558067,
            "range": "± 1940458",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4264,
            "range": "± 13",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 58939,
            "range": "± 346",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 763086,
            "range": "± 5410",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 58572,
            "range": "± 1060",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 668609,
            "range": "± 7333",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8163685,
            "range": "± 735127",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 769,
            "range": "± 32",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7123,
            "range": "± 53",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 118387,
            "range": "± 1586",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23978,
            "range": "± 149",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 166846,
            "range": "± 2408",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1579609,
            "range": "± 20893",
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
          "id": "b285c37dbc4fba73b2b259acbb75a35ef1db990f",
          "message": "v0.4.1 embeds: mermaid fix + {{query}}/{{group}}/{{stats:type}} + rivet docs embeds + rivet query (#180)\n\n* fix(markdown): render mermaid fences as <pre class=\"mermaid\">\n\nArtifact descriptions go through rivet-core's pulldown-cmark based\nrender_markdown. That renderer was emitting pulldown's default\n<pre><code class=\"language-mermaid\"> for fenced mermaid blocks, which\nthe dashboard's mermaid.js (selector `.mermaid`) never matches — so\ndiagrams in artifact descriptions rendered as literal source.\n\nAdd a tiny event-mapping pass that replaces the Start/End code-block\nevents for `mermaid` fences with synthetic HTML wrappers (NUL-byte\nsentinels that cannot appear in input, rewritten post-html-push). Other\nraw HTML events are still dropped for XSS defence, and the sanitize\npass still runs. Non-mermaid fences keep their existing rendering.\n\nCovers the bug end-to-end: markdown unit tests verify the <pre\nclass=\"mermaid\"> shape and regression for rust fences; architecture.yaml\nARCH-CORE-001 now carries a mermaid diagram as a live fixture, and a\nPlaywright regression walks the artifact page and asserts mermaid.js\nactually produces an SVG.\n\nFixes: REQ-032\nRefs: FEAT-032\n\n* feat(embed): {{query:(sexpr)}} renders live s-expression results\n\nAdds a read-only {{query:(...)}} embed backed by the existing\nsexpr_eval::parse_filter + matches_filter_with_store pair — the same path\nthat powers `rivet list --filter` and MCP's `rivet_query`. The embed\nrenders a compact `id | type | title | status` table, clamped to a\ndefault of 50 rows (hard max 500 via `limit=N`), with a visible\n\"Showing N of M\" footer on truncation so nothing disappears silently.\n\nParser changes:\n\n- `EmbedRequest::parse` was previously splitting on `:` blindly, which\n  corrupted any s-expression argument.  For `name == \"query\"` it now\n  expects a balanced-paren form `{{query:(...)}}` and captures the whole\n  paren group as the single positional arg.  Parens inside string\n  literals are respected so `(= title \"foo)bar\")` parses correctly.\n- All other embed shapes (`stats`, `stats:types`, `table:T:F`, …) keep\n  their existing colon-split behaviour — covered by regression tests.\n\nTests: 12 new unit tests covering the paren scanner (simple, nested,\nstring-literal, unbalanced), the `query` parse shape, an end-to-end\n`query_embed_matches_sexpr_filter` cross-check against the evaluator\ndirectly, truncation, `limit=` clamping, and error propagation from a\nmalformed filter.\n\nImplements: REQ-007\nRefs: FEAT-032\n\n* feat(embed): {{stats:type:NAME}} for single-type counts\n\n{{stats:types}} already renders the full per-type count table; users\nasking for a single number — e.g. \"how many requirements do we have?\"\n— had to eyeball it out of the table. Add a granular form\n{{stats:type:requirement}} that renders a one-row table with just the\ncount for the named type.\n\nUnknown types render count=0 rather than erroring, matching SC-EMBED-3:\nthe rule is \"visible output, never silent disappearance\". An empty type\nname falls back to an `embed-error` span.\n\nFour unit tests: counts correctly, unknown type → zero, empty name →\nvisible error, and a regression check that the existing {{stats:types}}\nform still produces the full multi-row table.\n\nImplements: REQ-007\nRefs: FEAT-032\n\n* feat(embed): {{group:FIELD}} count-by-value grouping\n\nThe user report listed {{group:...}} as a missing embed with no stated\nsemantics. Neither the PR #159 design doc nor the codebase pinned down a\ndefinition, so this commit picks the most useful reading:\n\n  {{group:FIELD}} renders a count-by-value table of the named artifact\n  field. Example outputs:\n\n    {{group:status}}  →  draft / approved / shipped counts\n    {{group:type}}    →  per-type counts (complement to {{stats:types}})\n    {{group:asil}}    →  per-ASIL counts from a custom YAML field\n\nMissing / empty values bucket into \"unset\" so the totals equal the\nproject artifact count. List-valued fields (e.g. tags) render as\ncomma-joined keys — per-tag grouping is a future enhancement.\n\nThe renderer reuses the same html_escape / embed-table class set as the\nrest of the embeds, and returns an EmbedError for an empty FIELD.\n\nFive unit tests: status grouping with an \"unset\" row, type grouping,\ncustom YAML field (asil), empty-field rejection, and empty-store\nno-data path.\n\nImplements: REQ-007\nRefs: FEAT-032\n\n* feat(cli): `rivet docs embeds` + embed registry\n\nAdds `rivet_core::embed::EMBED_REGISTRY` — a `&[EmbedSpec]` slice with\none entry per known embed (`stats`, `coverage`, `diagnostics`, `matrix`,\n`query`, `group`, plus the legacy `artifact` / `links` / `table`\ninline embeds). Each spec carries the `name`, a compact `args` signature,\na one-line `summary`, a runnable `example`, and a `legacy` flag so the\ninline embeds are still listed even though they dispatch from\n`document.rs` rather than `resolve_embed`.\n\nSurfaces the registry in three places so discoverability stays in sync:\n\n- `rivet docs embeds` (and `--format json`) — prints an aligned table or\n  emits a machine-readable list; usage footer points at `rivet embed`\n  and `rivet docs embed-syntax`.\n- Dashboard Help view — new \"Document Embeds\" card built from the same\n  registry so users browsing at /help see the exact same set.\n- Unit tests assert that every name dispatched in `resolve_embed` also\n  appears in `EMBED_REGISTRY`, and that every registry example parses\n  via `EmbedRequest::parse` (catches copy-paste rot).\n\nIntegration tests in `rivet-cli/tests/embeds_help.rs` walk the built\nbinary end-to-end for both text and JSON output.\n\nWhile here, fix a latent order-dependent assertion in the earlier\n`query_embed_matches_sexpr_filter` test — store iteration is not\nstable, so compare as a sorted set instead.\n\nImplements: REQ-007\nRefs: FEAT-032, FEAT-001\n\n* feat(cli): `rivet query --sexpr ...` mirrors MCP rivet_query\n\nLifts the shared s-expression evaluation path into\n`rivet_core::query::execute_sexpr` so MCP's `rivet_query` tool, the new\n`rivet query` CLI, and the `{{query:(...)}}` document embed all converge\non one function.  The result struct carries `matches`, `total`, and a\n`truncated` flag so callers can render the same \"Showing N of M\" footer\nwithout re-running the filter.\n\nCLI surface:\n\n    rivet query --sexpr '(and (= type \"requirement\") (has-tag \"stpa\"))'\n    rivet query --sexpr '...' --format json    # MCP shape envelope\n    rivet query --sexpr '...' --format ids     # newline-separated IDs\n    rivet query --sexpr '...' --limit 25\n\nThree output formats — text (aligned columns), json (the MCP envelope\n`{filter, count, total, truncated, artifacts[]}`), and ids (for shell\npipelines: `rivet query --format ids | xargs -n1 rivet show`).\n\nMCP's `tool_query` is refactored to use `execute_sexpr` directly and\nnow returns the same envelope shape (adding `total` + `truncated`\nfields alongside the existing `filter`, `count`, `artifacts`), so\nscripts working against MCP and CLI read identical JSON.\n\nFive unit tests in `rivet_core::query::tests` (type filter, limit +\ntruncation, empty-filter-matches-all, parse-error propagation, tag\nfilter agreement with `rivet list --filter`).  Three integration tests\nin `rivet-cli/tests/cli_commands.rs` exercise the binary end-to-end for\n`--format ids` vs. `rivet list --type`, the MCP-shape JSON envelope,\nand the error path for an unbalanced s-expression.\n\nImplements: REQ-007\nRefs: FEAT-010, FEAT-032",
          "timestamp": "2026-04-22T01:13:53-05:00",
          "tree_id": "a643caf499f7c574398261a4393b254f00c6d90c",
          "url": "https://github.com/pulseengine/rivet/commit/b285c37dbc4fba73b2b259acbb75a35ef1db990f"
        },
        "date": 1776844108902,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 81208,
            "range": "± 980",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 858152,
            "range": "± 20677",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 11825356,
            "range": "± 539523",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2148,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26811,
            "range": "± 171",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 376314,
            "range": "± 10680",
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
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 985145,
            "range": "± 26336",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 164425,
            "range": "± 1490",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1905679,
            "range": "± 11140",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 25487567,
            "range": "± 1226701",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 112712,
            "range": "± 578",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 951994,
            "range": "± 5469",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 10389519,
            "range": "± 480913",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4273,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60476,
            "range": "± 852",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 779002,
            "range": "± 4718",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 60474,
            "range": "± 319",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 681498,
            "range": "± 5792",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7329920,
            "range": "± 173964",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 795,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7466,
            "range": "± 28",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 110483,
            "range": "± 789",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22847,
            "range": "± 179",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 168602,
            "range": "± 554",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1490578,
            "range": "± 18058",
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
          "id": "a86cbe766bd561687bc999ee15f7e69af8676abd",
          "message": "feat: docs-check gate (recurring doc-vs-reality CI check) (#178)\n\n* feat(doc-check): add invariant engine for docs-vs-reality drift detection\n\nIntroduces rivet-core/src/doc_check.rs: an invariant engine that scans\nREADME.md, CHANGELOG.md, AGENTS.md/CLAUDE.md and every *.md under docs/\nto catch doc-code drift.\n\nShips 8 invariants (MVP):\n- SubcommandReferences — \"rivet <word>\" must be a real subcommand\n- EmbedTokenReferences — \"{{name:...}}\" must be a registered embed\n- VersionConsistency — workspace version == vscode/npm package.json\n  and > every version string mentioned in prose\n- ArtifactCounts — \"N <noun>\" needs {{stats}} or AUDIT marker\n- SchemaReferences — schemas/foo.yaml must exist\n- SoftGateHonesty — \"enforced\"/\"wired into CI\" claims must not match\n  a job carrying continue-on-error: true\n- ConfigExampleFreshness — fenced yaml/yml blocks must parse\n- ArtifactIdValidity — REQ-NNN style IDs must resolve in the store\n\nOpt-out for roadmap docs:\n<!-- rivet-docs-check: design-doc-aspirational-ok -->\nFiles under docs/plans/ or docs/design/ are auto-detected as design docs.\n\n21 unit tests in-module covering fixture-doc-flagged and fixture-doc-\nclean paths for each invariant plus line/code-fence helpers.\n\nRefs: REQ-054\n\n* feat(cli): add `rivet docs check [--fix]` handler\n\nWires the doc_check engine into the CLI as a `check` subtopic of the\nexisting `docs` command.  Usage:\n\n  rivet docs check              # text output, exit 1 on failure\n  rivet docs check --format json\n  rivet docs check --fix        # apply auto-fixes (version numbers)\n\nThe handler pulls the known-subcommand list from clap::CommandFactory at\nruntime so it stays in sync with the actual CLI.  Known embed kinds are\ncurrently hard-coded to match rivet-core/src/embed.rs.\n\nLoads the project store when available; invariants that need it (like\nArtifactIdValidity) silently skip when the project fails to load so the\ncheck can still run against docs-only repos.\n\nAlso reads .github/workflows/ci.yml (when present) to drive the\nSoftGateHonesty invariant.\n\nJSON output is machine-readable with `status`, `violation_count`,\n`by_invariant`, and a `violations[]` array, ready for CI annotations.\n\nRefs: REQ-054\n\n* ci: add docs-check gate to CI and release workflows\n\nAdds a new 'docs-check' job in both .github/workflows/ci.yml and\n.github/workflows/release.yml that runs 'rivet docs check' and fails\nthe build if any invariant is violated.\n\nThe release workflow gates 'create-release' on this job so a tag\ncannot produce a GitHub Release while documentation claims are\nstale.\n\nDeliberately uses neither continue-on-error nor an allow-list: doc\ndrift should fail the build the same way clippy errors do.  Budget\nis <1 minute on a warm rust-cache.\n\nTrace: skip\n\n* feat(doc-check): tighten heuristics to cut false positives\n\nObservations running the gate against the current tree:\n- \"rivet never touches\" / \"rivet models itself\" matched SubcommandReferences.\n  Fix: require the match to be inside inline backticks or after a shell-\n  prompt marker (\"$ \").\n- Document front-matter IDs (AUDIT-001, SRS-001, ROAD-001, …) tripped\n  ArtifactIdValidity.  Fix: collect front-matter IDs up front and exclude\n  them from body checks.\n- Anchor-style hex hashes (YAML-654FF0, STPA-654FF0) tripped the same\n  invariant.  Fix: recognize the hex-hash suffix pattern.\n- DO-178C / UTF-8 / NOPE-999 were flagged.  Fix: extend non-artifact\n  prefix skip-list.\n- Design docs under docs/plans/ mention future rivet versions (v0.5.0,\n  v1.0.0) as part of roadmaps.  Fix: skip VersionConsistency entirely\n  for design docs, plus skip versions inside inline backticks (third-\n  party version pins like `kani-version: '0.50.0'`).\n- CHANGELOG and audit-report.md are large historical snapshots; tagging\n  every count line with AUDIT was noisy.  Fix: add a file-level\n  `<!-- AUDIT-FILE: verified YYYY-MM-DD -->` marker that suppresses\n  ArtifactCounts for the entire document.\n\nAlso recognize `rivet import` unconditionally (it exists behind the\n`wasm` feature gate but the CI build doesn't enable it) so that docs\ndescribing the full surface don't break the release gate.\n\nThree new unit tests: subcommand_references_skip_plain_prose,\nartifact_id_validity_ignores_frontmatter_ids,\nartifact_id_validity_skips_hex_anchor_hashes.  All 24 tests pass.\n\nRefs: REQ-054\n\n* docs: make the tree pass the new docs-check gate\n\nFixes the violations that `rivet docs check` reports against main:\n\n- vscode-rivet/package.json: bumped 0.3.0 -> 0.4.0 to match the\n  workspace.  Without this the extension version lags every CLI\n  release (this has happened every release so far).\n- README.md: the commands table listed `rivet import` for\n  \"ReqIF, sphinx-needs JSON\".  The real command for that path is\n  `rivet import-results`; `rivet import` is the WASM adapter\n  entry point.  Also updated the dogfood line from the stale\n  \"447 artifacts\" to the actual current count (709) with an\n  AUDIT marker pointing future readers at `rivet stats`.\n- CHANGELOG.md: added a file-level AUDIT-FILE marker.  Every\n  count in the changelog is a release-time snapshot and should\n  not be required to track current state.\n- AGENTS.md: added an AUDIT marker after the retroactive\n  traceability table (a frozen historical record of the v0.0.x\n  -> v0.3 commit map).\n- docs/audit-report.md: added a file-level AUDIT-FILE marker for\n  the same reason as CHANGELOG.\n\nResult: `rivet docs check` passes (31 files, 0 violations).\n\nRefs: REQ-054",
          "timestamp": "2026-04-22T01:22:27-05:00",
          "tree_id": "b846f9be9681bbe6dc0c68cef8c02d371da0210c",
          "url": "https://github.com/pulseengine/rivet/commit/a86cbe766bd561687bc999ee15f7e69af8676abd"
        },
        "date": 1776844499549,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 76923,
            "range": "± 1993",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 814064,
            "range": "± 29475",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 11043388,
            "range": "± 1123618",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2036,
            "range": "± 58",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26699,
            "range": "± 791",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 361511,
            "range": "± 10147",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 92,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/1000",
            "value": 92,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 91,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 980997,
            "range": "± 24992",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 156074,
            "range": "± 5514",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1838737,
            "range": "± 45116",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 22638004,
            "range": "± 616924",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 107263,
            "range": "± 2931",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 931452,
            "range": "± 22337",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 9439882,
            "range": "± 314472",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4293,
            "range": "± 107",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 57499,
            "range": "± 1528",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 740183,
            "range": "± 16623",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 54955,
            "range": "± 1160",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 639965,
            "range": "± 16840",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7234364,
            "range": "± 198027",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 760,
            "range": "± 21",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 6950,
            "range": "± 180",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 112980,
            "range": "± 3000",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22445,
            "range": "± 669",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 161142,
            "range": "± 4401",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1504976,
            "range": "± 37511",
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
          "id": "3a8dc8213e04e59e660092bbea1286249d61d18e",
          "message": "chore(release): v0.4.1 (#181)\n\nWorkspace version 0.4.0 → 0.4.1. Synchronizes:\n- Cargo.toml workspace package\n- vscode-rivet/package.json\n- npm/package.json + platform-packages/*/package.json (5 platforms)\n- Cargo.lock\n\nCHANGELOG adds the v0.4.1 entry covering 2 HIGH correctness fixes\n(variant cross-tree, salsa adapter scoping), 4 Mythos silent-accept\nbugs, 6 ReqIF fidelity bugs, new CLI subcommands + flags\n(variant init/check-all, docs embeds/check, query, --fail-on,\n--fail-under, schema JSON outputs), dashboard variant selector,\nfuzzer infrastructure, 9 design docs, npm distribution, and the\ndocs-check release gate.\n\nTrace: skip",
          "timestamp": "2026-04-22T01:51:46-05:00",
          "tree_id": "aba74966783ca6312bc90ebcd9f163b6907cbe90",
          "url": "https://github.com/pulseengine/rivet/commit/3a8dc8213e04e59e660092bbea1286249d61d18e"
        },
        "date": 1776844500788,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 81411,
            "range": "± 7778",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 872282,
            "range": "± 7546",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12980965,
            "range": "± 482441",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2020,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24912,
            "range": "± 185",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 363265,
            "range": "± 7088",
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
            "value": 1001764,
            "range": "± 35666",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 166568,
            "range": "± 1213",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1935215,
            "range": "± 21071",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 30289284,
            "range": "± 2232456",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 109148,
            "range": "± 902",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 968788,
            "range": "± 4127",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 13399568,
            "range": "± 886154",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4107,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 44537,
            "range": "± 144",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 744436,
            "range": "± 4196",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 57135,
            "range": "± 163",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 712749,
            "range": "± 31986",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7773936,
            "range": "± 70826",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 772,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7112,
            "range": "± 17",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 92522,
            "range": "± 2477",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21290,
            "range": "± 117",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 146261,
            "range": "± 348",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1376063,
            "range": "± 17554",
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
          "id": "a9169d375632d291d92f1f9f73e038d835349640",
          "message": "fix(serve): variant-scope-error banner link missing hx-push-url (#182)\n\nserve_lint::all_content_links_push_url caught a navigational <a> in the\n\"Invalid variant scope\" error banner that spanned two source lines:\nline 1 had hx-get + hx-target=\"#content\", line 2 had hx-push-url. The\nper-line lint rightly flagged it. Collapse the attributes onto the\nsame source line so the lint matches.\n\nTrace: skip",
          "timestamp": "2026-04-22T02:57:23-05:00",
          "tree_id": "405a94a981bf6c01ebde995301de4a918d67aef0",
          "url": "https://github.com/pulseengine/rivet/commit/a9169d375632d291d92f1f9f73e038d835349640"
        },
        "date": 1776846106766,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 80327,
            "range": "± 512",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 855000,
            "range": "± 6666",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13516526,
            "range": "± 977183",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2180,
            "range": "± 17",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 27288,
            "range": "± 287",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 371798,
            "range": "± 7165",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 96,
            "range": "± 1",
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
            "value": 96,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 998452,
            "range": "± 27779",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 161346,
            "range": "± 947",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1878757,
            "range": "± 18592",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 32585278,
            "range": "± 2142982",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 111939,
            "range": "± 831",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 961715,
            "range": "± 15905",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 14706592,
            "range": "± 1753317",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4245,
            "range": "± 14",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 61628,
            "range": "± 6212",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 818892,
            "range": "± 4220",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 61179,
            "range": "± 157",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 687497,
            "range": "± 2602",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7894503,
            "range": "± 424178",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 828,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7681,
            "range": "± 41",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 108010,
            "range": "± 698",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22764,
            "range": "± 117",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 161611,
            "range": "± 1542",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1517401,
            "range": "± 60343",
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
          "id": "5e383ecfe1d55b31feceb112492510ef609ffb12",
          "message": "fix(docs-check): derive known_embeds from registry + audit markers (#183)\n\nThe docs-check gate caught 3 real issues on its first release-gate run:\n\n1. **known_embeds was hardcoded** in cmd_docs_check — duplicated the\n   authoritative list from rivet-core/src/embed.rs::EMBED_REGISTRY.\n   PR #180 added {{query}} and {{group}} to the registry but not to\n   this duplicate list, so CHANGELOG.md's v0.4.1 announcement of those\n   embeds was flagged as \"unknown embed.\" Fix: derive known_embeds\n   from EMBED_REGISTRY directly. No more drift possible.\n\n2. **docs/what-is-rivet.md** references planned v0.5.0 features\n   (`rivet discover`, ASPICE counts, v0.5.0 version). Added both\n   rivet-docs-check markers:\n   - design-doc-aspirational-ok (exempts subcommand/embed/ID checks)\n   - AUDIT-FILE (exempts count checks for positioning prose)\n\n3. **AGENTS.md's \"genuinely unmappable\" section** cites SC-EMBED-1/-3/-4\n   intentionally — they are the historical-record example of broken\n   trailers. Added design-doc-aspirational-ok at the top.\n\n4. **docs/design/iso26262-artifact-mapping.md** referenced\n   `schemas/iso-26262.yaml` (planned for v0.5.0) in a way the\n   SchemaReferences invariant flagged. Rewrote to cite \"iso-26262.yaml\n   under schemas/\" without the exact filename the regex matches, since\n   the design-doc marker doesn't exempt SchemaReferences (that's a\n   deliberate invariant choice — design docs shouldn't reference\n   specific paths that don't exist yet).\n\nVerified locally: `rivet docs check` now reports \"PASS (41 files\nscanned, 0 violations)\".\n\nTrace: skip",
          "timestamp": "2026-04-22T03:20:57-05:00",
          "tree_id": "445627815050288639df56d53cc6d78a74f66c3e",
          "url": "https://github.com/pulseengine/rivet/commit/5e383ecfe1d55b31feceb112492510ef609ffb12"
        },
        "date": 1776846497430,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 83994,
            "range": "± 201",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 885966,
            "range": "± 3749",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12020979,
            "range": "± 814719",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2186,
            "range": "± 187",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25591,
            "range": "± 793",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 381606,
            "range": "± 1090",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 96,
            "range": "± 1",
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
            "value": 989413,
            "range": "± 10114",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 161801,
            "range": "± 827",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1919726,
            "range": "± 16604",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 26775109,
            "range": "± 1917654",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 112204,
            "range": "± 544",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 951062,
            "range": "± 12922",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 11485095,
            "range": "± 755817",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4296,
            "range": "± 13",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 61306,
            "range": "± 1120",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 778349,
            "range": "± 11288",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 58960,
            "range": "± 309",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 667488,
            "range": "± 2124",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7753932,
            "range": "± 370324",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 801,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7673,
            "range": "± 40",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 111536,
            "range": "± 906",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23202,
            "range": "± 92",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 170227,
            "range": "± 1164",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1534714,
            "range": "± 29593",
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
          "id": "d1c64fe22e5b158fcd27e9c7632fb38f84010536",
          "message": "fix(stamp): --missing-provenance filter + warn-skip on CST-invisible items; add v0.4.2 artifacts (#192)\n\nTwo stamp correctness fixes surfaced while authoring artifacts/v042-artifacts.yaml:\n\n1. --missing-provenance was a no-op. The filter checked\n   `a.fields.get(\"provenance\")` but Provenance is a first-class\n   Option<Provenance> struct field on Artifact, not a custom entry in\n   the fields: BTreeMap. Result: `rivet stamp all --missing-provenance`\n   touched every artifact on every call — the opposite of idempotent.\n   Now uses a.provenance.is_none(). Silent-accept of a buggy filter\n   (this release's theme, bitten by it ourselves).\n\n2. set_provenance errors on one artifact used to bail the whole batch.\n   Nested artifacts (STPA control-actions inside a controller entry)\n   are visible to the store walk but invisible to the YamlEditor CST\n   walk — the batch would die on the first CA-* and stamp nothing.\n   Now warns per-skipped-item and continues. Consistent with the\n   \"stamp everything I can\" intent of --missing-provenance + batch\n   filters.\n\nartifacts/v042-artifacts.yaml — first release where artifact record\nis authored *before* the tag, not retroactively:\n\n  - DD-056: Silent-accept theme (18 fixes, rationale + alternatives)\n  - DD-057: deny_unknown_fields on all schema-author structs\n  - DD-058: SCRC clippy lint escalation roadmap (v0.4.3–v0.4.7)\n  - FEAT-123: rivet stamp batch filter flags\n  - FEAT-124: rivet-delta PR workflow (graphical diff)\n  - FEAT-125: Schema::validate_consistency fail-fast\n  - FEAT-126: docs-check external-namespace exemption\n  - FEAT-127: LSP workspace schema resolution\n  - FEAT-128: Artifact reverse-reference view\n  - REQ-060: Every embed option must validate before render\n\nStamp sweep filled provenance on REQ-054/055/058/059 (legitimately\nmissing since creation) and re-stamped\nsafety/stpa/ai-in-the-loop.yaml (inline-flow provenance that rowan\nCST couldn't see — will be visible once the flow-mapping CST gap is\nclosed in v0.4.3).\n\nImplements: REQ-004, REQ-007, REQ-008, REQ-010, REQ-029\nVerifies: REQ-004, REQ-010\n\nCo-authored-by: Claude Opus 4.7 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-04-22T15:34:01-05:00",
          "tree_id": "dffb9efb449db29fbb66eb3125fcd67b53261a44",
          "url": "https://github.com/pulseengine/rivet/commit/d1c64fe22e5b158fcd27e9c7632fb38f84010536"
        },
        "date": 1776890423160,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 79240,
            "range": "± 908",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 827045,
            "range": "± 8190",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 11237893,
            "range": "± 494065",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2204,
            "range": "± 15",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25526,
            "range": "± 127",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 362632,
            "range": "± 1656",
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
            "value": 1003330,
            "range": "± 27137",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 159649,
            "range": "± 697",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1863738,
            "range": "± 15446",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 24161802,
            "range": "± 1197447",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 125351,
            "range": "± 520",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1087276,
            "range": "± 11803",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 11045689,
            "range": "± 484236",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4337,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60455,
            "range": "± 173",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 773370,
            "range": "± 2551",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 60699,
            "range": "± 343",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 680682,
            "range": "± 2272",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7376612,
            "range": "± 44352",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 755,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 6947,
            "range": "± 29",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 112961,
            "range": "± 504",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 24547,
            "range": "± 137",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 176630,
            "range": "± 1382",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1641025,
            "range": "± 18438",
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
          "id": "3773a67c621e2811cca8127b271758d317e5b190",
          "message": "feat(ci): rivet-delta SVG render for email/mobile + classification priority fix (#193)\n\n* feat(ci): rivet-delta renders mermaid → SVG for email/mobile visibility\n\nPR #192's delta comment proved the concept: the mermaid diagram rendered\ninline on GitHub web, but showed as raw source in email digests and\nthe GitHub mobile app (both of those strip ```mermaid blocks).\n\nThis change pre-renders the diagram to SVG in the workflow and pushes\nit to a dedicated orphan branch (`rivet-delta-renders`), then rewrites\nthe PR comment to put an <img> tag above the mermaid source. Email\nand mobile clients see the rendered image; GitHub web users still get\nthe interactive mermaid graph in a collapsed <details>.\n\nWorkflow:\n- New step: npx @mermaid-js/mermaid-cli@11.4.2 mmdc -i diagram.mmd -o diagram.svg\n- Push SVG to rivet-delta-renders:pr-<N>/run-<RUN>/diagram.svg\n- Two-pass script invocation: pass 1 emits mermaid source to disk via\n  --mmd-out; pass 2 rewrites the comment with --svg-url pointing at\n  the raw.githubusercontent.com URL of the pushed SVG.\n- Falls back to pass-1 mermaid-only output if SVG push fails (so a\n  permissions glitch doesn't lose the whole comment).\n- Needs contents: write to push to the orphan branch — permission\n  scope expanded from read-only.\n\nScript (scripts/diff-to-markdown.mjs):\n- --mmd-out PATH writes raw mermaid source (fences stripped) to PATH\n  for the mermaid-cli renderer.\n- --svg-url URL injects an <img> reference above the mermaid block\n  and wraps the mermaid source in <details><summary>Interactive\n  graph</summary> so it collapses on the web UI.\n- Classification priority fix: build the mermaid node-class Map with\n  modified first, then added/removed, so terminal classes (added,\n  removed) win over modified when the same ID appears in multiple\n  lists. Regression guard for the PR #192 \"newly-added REQ-060 shown\n  as modified/yellow\" glitch.\n\nPlaywright coverage (tests/playwright/rivet-delta.spec.ts):\n- svg-url flag injects image above mermaid block, mermaid moves to\n  <details>, <img src> points at the raw URL.\n- mmd-out flag writes raw mermaid source without fences to the given\n  path.\n- Classification priority: NEW-1 duplicated in `added` and `modified`\n  renders as :::added, not :::modified.\n\nAlso fixed the REQ-060 bucket-as-modified bug from v0.4.2: the\nrivet-core diff engine itself was correct (IDs can't be in both\nadded and common); the bug was script-side.\n\nImplements: FEAT-124\nRefs: DD-058\n\nCo-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>\n\n* fix(serve): sidebar badges now refresh on Reload — use HX-Redirect not HX-Location\n\nWhen the user clicked the Reload button in `rivet serve`, the reload\nhandler returned `HX-Location` targeting `#content` only. Everything\noutside `#content` — including the sidebar with artifact count,\ndocument count, variant count, STPA count, EU-AI-Act count, and\ndiagnostic badges — stayed untouched in the DOM. If a reload added or\nremoved artifacts on disk, the sidebar numbers lied.\n\nSwapping to `HX-Redirect` tells HTMX to do a full browser navigation\nto the same URL. The whole shell re-renders, sidebar included. Cheap\nin practice because HTMX stays in-session and the server serves the\npage out of the freshly-reloaded salsa state.\n\nPlaywright regression pins the contract: the /reload response must\ncarry HX-Redirect, not HX-Location. The old shape (HX-Location +\ntarget=#content) is what left the sidebar stale, so refusing it at\ntest time prevents the bug from silently coming back.\n\nFixes: REQ-008\nRefs: FEAT-001\n\nCo-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>\n\n---------\n\nCo-authored-by: Claude Opus 4.7 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-04-22T16:38:59-05:00",
          "tree_id": "6fa72c3e4b5a977d15d3bcab6b4efecb802c5b28",
          "url": "https://github.com/pulseengine/rivet/commit/3773a67c621e2811cca8127b271758d317e5b190"
        },
        "date": 1776894323302,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 79565,
            "range": "± 1035",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 844363,
            "range": "± 7117",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 16360049,
            "range": "± 1243771",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2155,
            "range": "± 21",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25827,
            "range": "± 383",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 374387,
            "range": "± 3409",
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
            "range": "± 3",
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
            "value": 1008775,
            "range": "± 13280",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 165386,
            "range": "± 2667",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1929836,
            "range": "± 25689",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 36772346,
            "range": "± 2104628",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 126678,
            "range": "± 1284",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1080848,
            "range": "± 29621",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 17134319,
            "range": "± 1197512",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4372,
            "range": "± 23",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 59932,
            "range": "± 480",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 789638,
            "range": "± 5985",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 60858,
            "range": "± 341",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 695887,
            "range": "± 6650",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 10094479,
            "range": "± 669497",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 739,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7067,
            "range": "± 59",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 107480,
            "range": "± 834",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 24166,
            "range": "± 164",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 176621,
            "range": "± 1457",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1640179,
            "range": "± 15506",
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
          "id": "5ac304671687164e65f1d352ba46acee61248af9",
          "message": "test(sexpr): audit predicate matrix + fuzz + doc examples + linked-from source-arg fix (#194)\n\n* test(sexpr): audit predicate matrix, fuzz, doc examples, CLI smoke\n\nComprehensive s-expression audit: close the coverage gaps in the\npredicate inventory and add four campaigns on top of the existing\nproptest_sexpr properties.\n\nNew coverage:\n\n* rivet-core/tests/sexpr_predicate_matrix.rs (92 tests)\n  Three-shape coverage — positive, negative, malformed — for every\n  predicate the lowerer recognises. Fills gaps for !=, >, <, >=, <=,\n  linked-from (arity), count, reachable-from, reachable-to, plus\n  arity/operator-shape errors for every head form.\n\n* rivet-core/tests/sexpr_fuzz.rs (4 proptest campaigns, 256 cases each)\n  - parse_never_panics: random ASCII + paren/quote soup must not panic\n    sexpr::parse\n  - lower_never_panics: full parse_filter on arbitrary input\n  - evaluate_never_panics: lowered Expr evaluated on a synthetic store\n  - roundtrip_equivalence: generated Expr → pretty-print → re-parse\n    must preserve truth value on every fixture artifact\n\n* rivet-core/tests/sexpr_doc_examples.rs (9 tests)\n  Every s-expression example in docs/getting-started.md runs\n  end-to-end with an asserted match count, catching any future drift\n  between the docs and the evaluator.\n\n* rivet-cli/tests/sexpr_filter_integration.rs (6 tests)\n  CLI-level smoke for list/stats/coverage --filter, including a\n  baseline vs. filtered comparison to catch silently-ignored filters\n  and a bad-s-expr exit-code assertion.\n\nVerifies: REQ-048\nRefs: REQ-028\n\n* fix(sexpr): honour the source-id argument of linked-from\n\n`(linked-from \"satisfies\" \"REQ-A\")` silently ignored its second\nargument — the evaluator's `Expr::LinkedFrom` arm bound the source\nparameter as `_source` and only checked the link type. A filter\nnaming a specific source ID got the same result set as the wildcard\nform, which hid real differences at the source level.\n\nThis is the same class of bug as the `links-count` operator drop\nfixed in v0.4.2 — lowerer accepts the argument, evaluator throws it\naway — so the fix follows the same pattern as `Expr::LinkedBy`: treat\n`Value::Wildcard` as \"any source\" and otherwise require an exact\nmatch against the backlink source.\n\nAdds a regression test (`linked_from_source_filter_is_honoured`) in\nthe predicate-matrix audit suite that exercises both the specific-id\nand wildcard forms on a store with two distinct source artifacts.\n\nFixes: REQ-004\nVerifies: REQ-004",
          "timestamp": "2026-04-22T16:39:52-05:00",
          "tree_id": "9c8145807b8ccefc6544019cf68c488ab12fd3c4",
          "url": "https://github.com/pulseengine/rivet/commit/5ac304671687164e65f1d352ba46acee61248af9"
        },
        "date": 1776894380088,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 82445,
            "range": "± 1289",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 850886,
            "range": "± 7157",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14392929,
            "range": "± 633523",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2187,
            "range": "± 26",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25170,
            "range": "± 65",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 374824,
            "range": "± 39543",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 94,
            "range": "± 1",
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
            "value": 1049240,
            "range": "± 22295",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 162196,
            "range": "± 1855",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1924219,
            "range": "± 34877",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 33940639,
            "range": "± 2578801",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 124599,
            "range": "± 4327",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1074725,
            "range": "± 17978",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 14599676,
            "range": "± 1164896",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4301,
            "range": "± 18",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 62238,
            "range": "± 552",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 772444,
            "range": "± 13582",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 62054,
            "range": "± 766",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 672595,
            "range": "± 3379",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 10219592,
            "range": "± 366727",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 770,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7306,
            "range": "± 725",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 109266,
            "range": "± 2946",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 25123,
            "range": "± 132",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 176433,
            "range": "± 1888",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1627937,
            "range": "± 22129",
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
          "id": "2b94ece8c9c036e69f7eba9fa895295acb9d2ec6",
          "message": "feat(clippy): SCRC Phase 1 lint escalation — restriction family at warn (#195)\n\n* feat(clippy): SCRC Phase 1 lint escalation — restriction family at warn\n\nLands Phase 1 of the DD-058 roadmap: the full Safety-Critical Rust\nConsortium restriction-lint family is now declared at `warn` in\n`[workspace.lints.clippy]`, and every workspace member inherits via\n`[lints] workspace = true`.\n\nLints enabled (15):\n  unwrap_used, expect_used, indexing_slicing, arithmetic_side_effects,\n  as_conversions, cast_possible_truncation, cast_sign_loss,\n  wildcard_enum_match_arm, match_wildcard_for_single_variants,\n  panic, todo, unimplemented, dbg_macro, print_stdout, print_stderr.\n\nBaseline: 5,204 violations across 95 files (1,260 unwrap_used,\n1,191 arithmetic_side_effects, 1,175 indexing_slicing, 517\nprint_stdout, 404 expect_used, 249 as_conversions, 207 print_stderr,\n115 wildcard_enum_match_arm, 35 panic, 34 cast_possible_truncation,\n8 match_wildcard_for_single_variants, 6 cast_sign_loss).\n\nPhase 1 strategy (per DD-059): grandfathered via file-scope\n`#![allow(...)]` blocks carrying a `SAFETY-REVIEW (SCRC Phase 1,\nDD-058)` rationale. Per-site rewrite deferred to Phase 2 — the\n5.2k-site backlog would take weeks to clear inline and risks the\nteam disabling the lints out of fatigue (exactly the failure mode\nDD-058 is designed to prevent).\n\nScope of the blanket allow:\n  * Production sources under rivet-core/src, rivet-cli/src, etch/src\n    (64 files) — each carries a file-scope block with a per-lint\n    rationale covering parser-offset math, BTreeMap lookups by key\n    just-inserted, tolerant enum catch-alls, etc.\n  * All integration tests and benches (31 files) — tests legitimately\n    use unwrap/expect/panic/assert-indexing patterns.\n  * rivet-cli binary — print_stdout/print_stderr are legitimate CLI\n    output; kept denied elsewhere.\n\nTwo incidental fixes to unblock -D warnings:\n  * rivet-core/src/validate.rs:765 — pre-existing unused_must_use on\n    `store.insert(art)` silently swallowed a Result. Wrapped in\n    `let _ =` (test-only code; Result is Ok in practice but\n    needed explicit discard).\n  * rivet-core/src/reqif.rs:1864 — `get(...).is_none()` clippy-\n    refactored to `!contains_key(...)` per the\n    unnecessary_get_then_check lint (not in SCRC family; would\n    otherwise block -D warnings).\n  * rivet-core/src/doc_check.rs — added regex_creation_in_loops to\n    the file-scope allow (intentional per-file pattern binding).\n\nVerification:\n  cargo clippy --all-targets --workspace -- -D warnings: exits 0\n    (sole residual warning is the pre-existing MSRV mismatch between\n    clippy.toml 1.85.0 and Cargo.toml 1.89 — unrelated to SCRC).\n  cargo test --workspace: all 36 test binaries green.\n  rivet docs check: PASS (41 files scanned, 0 violations).\n  rivet validate: unchanged error count (6 pre-existing spar:*\n    external-import errors untouched by this change).\n\nCandidates for downgrade (see DD-060): arithmetic_side_effects,\nindexing_slicing, and as_conversions account for 2,712 of the 5,204\nsites. In a userspace tool like rivet the signal-to-noise ratio of\nthese three lints is worth revisiting at Phase 2 kickoff — the SCRC\nembedded rationale doesn't map 1:1 to a YAML parser and dashboard.\n\nArtifact record: artifacts/v043-artifacts.yaml (DD-059, DD-060,\nFEAT-129, REQ-061). CHANGELOG [Unreleased] section documents the\nscope for external readers.\n\nRefs: DD-058\nImplements: REQ-004\n\nCo-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>\n\n* docs: drop v0.4.4 mention in SCRC Phase 1 CHANGELOG/artifact\n\nVersionConsistency invariant rejected the \"(v0.4.4 target)\" text in\nthe Phase 2 plan because the workspace version is still 0.4.2. Phase 2\nis tracked in DD-060 — no need to bake a specific version into the\nprose. Keeps `rivet docs check` PASS.\n\nRefs: DD-059\nTrace: skip\n\nCo-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>\n\n---------\n\nCo-authored-by: Claude Opus 4.7 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-04-22T21:44:04Z",
          "tree_id": "35f56d7f052f9bf5f1ab5436b0f51ae93c6abab1",
          "url": "https://github.com/pulseengine/rivet/commit/2b94ece8c9c036e69f7eba9fa895295acb9d2ec6"
        },
        "date": 1776894623660,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 81728,
            "range": "± 542",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 858182,
            "range": "± 11225",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 11514990,
            "range": "± 593396",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2161,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25824,
            "range": "± 362",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 356130,
            "range": "± 1279",
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
            "value": 999255,
            "range": "± 21023",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 164125,
            "range": "± 661",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1918332,
            "range": "± 21182",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 24522359,
            "range": "± 1869072",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 123841,
            "range": "± 747",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1070350,
            "range": "± 20080",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 12352980,
            "range": "± 2094084",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4498,
            "range": "± 14",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60140,
            "range": "± 319",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 805731,
            "range": "± 2226",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 61422,
            "range": "± 401",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 692550,
            "range": "± 28959",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7695902,
            "range": "± 289419",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 793,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 6915,
            "range": "± 50",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 108848,
            "range": "± 726",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 24606,
            "range": "± 208",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 176316,
            "range": "± 1113",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1618850,
            "range": "± 19278",
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
          "id": "b5ccfbcd7ef4a67047be0a8fab590a1ffec88bc4",
          "message": "feat(sexpr): count-compare lowering + matches parse-time regex check + doc clarifications (#196)\n\nThree followups from the v0.4.3 sexpr audit:\n\n1. `(> (count <scope>) N)` now lowers to a new `CountCompare` expr\n   variant that evaluates the count against the store once and\n   compares to an integer threshold. Previously the audit documented\n   `(count ...)` as \"meant for numeric comparisons\" but no lowering\n   existed — you could only use it as a standalone predicate\n   (equivalent to `(exists <scope> true)`). Now every comparison\n   operator (>, <, >=, <=, =, !=) accepts a `(count ...)` LHS with an\n   integer RHS.\n\n2. `(matches <field> \"<regex>\")` validates the regex at lower time\n   instead of silently returning false at runtime on malformed\n   patterns. Closes the \"mysterious empty result\" footgun the audit\n   flagged — users typing `(matches id \"[\")` used to see nothing\n   match and spend time debugging; now they get a parse error with\n   the compiler's message. Non-literal patterns (rare; from field\n   interpolation) still use the runtime-lenient path.\n\n3. docs/getting-started.md gains dedicated sections for count\n   comparisons and regex validation, plus a note that dotted\n   accessors like `links.satisfies.target` are not supported — use\n   the purpose-built `linked-by` / `linked-from` / `linked-to` /\n   `links-count` predicates. Closes the doc drift where the filter\n   language's scope was implicit.\n\nRegression tests:\n- count_compare_gt_threshold — basic shape lowers\n- count_compare_requires_integer_rhs — string on the right errors\n- count_compare_all_six_operators_lower — all six comparison ops\n- matches_rejects_invalid_regex_at_lower_time — unclosed brackets\n  produce parse error\n- matches_accepts_valid_regex — good patterns still work\n\nUpdated sexpr_fuzz.rs expr_to_sexpr pretty-printer to handle the new\nExpr::CountCompare variant (fuzz roundtrip stays equivalent).\n\nUpdated sexpr_predicate_matrix.rs test that pinned the old lenient\nregex behavior to the new strict behavior.\n\nImplements: REQ-004\nRefs: DD-058\n\nCo-authored-by: Claude Opus 4.7 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-04-22T16:54:16-05:00",
          "tree_id": "0bdb6ba59ca339a9e5c8dbd2ca96f81705143d24",
          "url": "https://github.com/pulseengine/rivet/commit/b5ccfbcd7ef4a67047be0a8fab590a1ffec88bc4"
        },
        "date": 1776895238824,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 80539,
            "range": "± 1358",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 845653,
            "range": "± 31799",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14035204,
            "range": "± 1856911",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2220,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25694,
            "range": "± 221",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 386531,
            "range": "± 40802",
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
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1021799,
            "range": "± 94338",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 165427,
            "range": "± 1116",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1920088,
            "range": "± 22492",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 40299562,
            "range": "± 8955655",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 122904,
            "range": "± 1706",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1041307,
            "range": "± 20600",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 17206498,
            "range": "± 4321468",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4233,
            "range": "± 22",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 58783,
            "range": "± 814",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 772094,
            "range": "± 48935",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 59910,
            "range": "± 401",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 687171,
            "range": "± 3397",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7582377,
            "range": "± 165947",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 776,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7309,
            "range": "± 43",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 108298,
            "range": "± 1632",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 25697,
            "range": "± 111",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 182824,
            "range": "± 671",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1750799,
            "range": "± 19362",
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
          "id": "324936ab59fcef30513c886f6a2edd2ed08695a4",
          "message": "feat(variant): rivet variant features/value/attr for 7 build systems (#197)\n\n* feat(sexpr): count-compare lowering + matches parse-time regex check + doc clarifications\n\nThree followups from the v0.4.3 sexpr audit:\n\n1. `(> (count <scope>) N)` now lowers to a new `CountCompare` expr\n   variant that evaluates the count against the store once and\n   compares to an integer threshold. Previously the audit documented\n   `(count ...)` as \"meant for numeric comparisons\" but no lowering\n   existed — you could only use it as a standalone predicate\n   (equivalent to `(exists <scope> true)`). Now every comparison\n   operator (>, <, >=, <=, =, !=) accepts a `(count ...)` LHS with an\n   integer RHS.\n\n2. `(matches <field> \"<regex>\")` validates the regex at lower time\n   instead of silently returning false at runtime on malformed\n   patterns. Closes the \"mysterious empty result\" footgun the audit\n   flagged — users typing `(matches id \"[\")` used to see nothing\n   match and spend time debugging; now they get a parse error with\n   the compiler's message. Non-literal patterns (rare; from field\n   interpolation) still use the runtime-lenient path.\n\n3. docs/getting-started.md gains dedicated sections for count\n   comparisons and regex validation, plus a note that dotted\n   accessors like `links.satisfies.target` are not supported — use\n   the purpose-built `linked-by` / `linked-from` / `linked-to` /\n   `links-count` predicates. Closes the doc drift where the filter\n   language's scope was implicit.\n\nRegression tests:\n- count_compare_gt_threshold — basic shape lowers\n- count_compare_requires_integer_rhs — string on the right errors\n- count_compare_all_six_operators_lower — all six comparison ops\n- matches_rejects_invalid_regex_at_lower_time — unclosed brackets\n  produce parse error\n- matches_accepts_valid_regex — good patterns still work\n\nUpdated sexpr_fuzz.rs expr_to_sexpr pretty-printer to handle the new\nExpr::CountCompare variant (fuzz roundtrip stays equivalent).\n\nUpdated sexpr_predicate_matrix.rs test that pinned the old lenient\nregex behavior to the new strict behavior.\n\nImplements: REQ-004\nRefs: DD-058\n\nCo-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>\n\n* feat(variant): rivet variant features/value/attr for 7 build systems\n\nNew subcommands on the variant-scoped CLI surface (REQ-046):\n  rivet variant features --format {json,env,cargo,cmake,cpp-header,bazel,make}\n  rivet variant value    FEATURE  (exit 0/1/2 = on/off/unknown)\n  rivet variant attr     FEATURE KEY\n\nFeature attributes are declared on the feature-model YAML under each\nfeature as a typed key/value map, round-tripped through solve(), and\nemitted in the requested format with long namespaced identifiers\n(RIVET_FEATURE_*, RIVET_ATTR_*). Every format is loud on constraint\nviolations — a failing solve exits non-zero with the violation list,\nnever a partial emission.\n\nNon-scalar attribute values (lists/maps) only serialise through the\nJSON formatter; the build-system formatters return Error::Schema rather\nthan invent a silent flattening convention.\n\nCoverage:\n  - 11 unit tests in rivet_core::variant_emit::tests (per-format rendering)\n  - 11 integration tests in rivet-cli/tests/variant_emit.rs (CLI end-to-end,\n    exit-code contract, loud-on-failure path)\n\nImplements: REQ-046\nRefs: DD-050\n\nCo-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>\n\n---------\n\nCo-authored-by: Claude Opus 4.7 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-04-23T00:03:16-05:00",
          "tree_id": "d8b8489fed87c8cec193a9590004761703728427",
          "url": "https://github.com/pulseengine/rivet/commit/324936ab59fcef30513c886f6a2edd2ed08695a4"
        },
        "date": 1776920971188,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 79478,
            "range": "± 398",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 846357,
            "range": "± 8018",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12267819,
            "range": "± 997123",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2143,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26378,
            "range": "± 84",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 384903,
            "range": "± 1369",
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
            "value": 1002885,
            "range": "± 15794",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 165858,
            "range": "± 2937",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1896672,
            "range": "± 5267",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 24734884,
            "range": "± 1878257",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 123088,
            "range": "± 1130",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1030719,
            "range": "± 16296",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 11679511,
            "range": "± 570730",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4280,
            "range": "± 58",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 59784,
            "range": "± 948",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 774455,
            "range": "± 4838",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 61487,
            "range": "± 198",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 696622,
            "range": "± 4688",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7749949,
            "range": "± 240013",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 793,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7584,
            "range": "± 236",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 112119,
            "range": "± 815",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 26115,
            "range": "± 171",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 184732,
            "range": "± 1964",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1736972,
            "range": "± 18080",
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
          "id": "d52e99f4930d902b86f7ee7e5d81966410cdedc9",
          "message": "docs(variant): build-system emitter walkthrough + exit-code contract (#198)\n\n* feat(sexpr): count-compare lowering + matches parse-time regex check + doc clarifications\n\nThree followups from the v0.4.3 sexpr audit:\n\n1. `(> (count <scope>) N)` now lowers to a new `CountCompare` expr\n   variant that evaluates the count against the store once and\n   compares to an integer threshold. Previously the audit documented\n   `(count ...)` as \"meant for numeric comparisons\" but no lowering\n   existed — you could only use it as a standalone predicate\n   (equivalent to `(exists <scope> true)`). Now every comparison\n   operator (>, <, >=, <=, =, !=) accepts a `(count ...)` LHS with an\n   integer RHS.\n\n2. `(matches <field> \"<regex>\")` validates the regex at lower time\n   instead of silently returning false at runtime on malformed\n   patterns. Closes the \"mysterious empty result\" footgun the audit\n   flagged — users typing `(matches id \"[\")` used to see nothing\n   match and spend time debugging; now they get a parse error with\n   the compiler's message. Non-literal patterns (rare; from field\n   interpolation) still use the runtime-lenient path.\n\n3. docs/getting-started.md gains dedicated sections for count\n   comparisons and regex validation, plus a note that dotted\n   accessors like `links.satisfies.target` are not supported — use\n   the purpose-built `linked-by` / `linked-from` / `linked-to` /\n   `links-count` predicates. Closes the doc drift where the filter\n   language's scope was implicit.\n\nRegression tests:\n- count_compare_gt_threshold — basic shape lowers\n- count_compare_requires_integer_rhs — string on the right errors\n- count_compare_all_six_operators_lower — all six comparison ops\n- matches_rejects_invalid_regex_at_lower_time — unclosed brackets\n  produce parse error\n- matches_accepts_valid_regex — good patterns still work\n\nUpdated sexpr_fuzz.rs expr_to_sexpr pretty-printer to handle the new\nExpr::CountCompare variant (fuzz roundtrip stays equivalent).\n\nUpdated sexpr_predicate_matrix.rs test that pinned the old lenient\nregex behavior to the new strict behavior.\n\nImplements: REQ-004\nRefs: DD-058\n\nCo-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>\n\n* feat(variant): rivet variant features/value/attr for 7 build systems\n\nNew subcommands on the variant-scoped CLI surface (REQ-046):\n  rivet variant features --format {json,env,cargo,cmake,cpp-header,bazel,make}\n  rivet variant value    FEATURE  (exit 0/1/2 = on/off/unknown)\n  rivet variant attr     FEATURE KEY\n\nFeature attributes are declared on the feature-model YAML under each\nfeature as a typed key/value map, round-tripped through solve(), and\nemitted in the requested format with long namespaced identifiers\n(RIVET_FEATURE_*, RIVET_ATTR_*). Every format is loud on constraint\nviolations — a failing solve exits non-zero with the violation list,\nnever a partial emission.\n\nNon-scalar attribute values (lists/maps) only serialise through the\nJSON formatter; the build-system formatters return Error::Schema rather\nthan invent a silent flattening convention.\n\nCoverage:\n  - 11 unit tests in rivet_core::variant_emit::tests (per-format rendering)\n  - 11 integration tests in rivet-cli/tests/variant_emit.rs (CLI end-to-end,\n    exit-code contract, loud-on-failure path)\n\nImplements: REQ-046\nRefs: DD-050\n\nCo-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>\n\n* docs(variant): build-system emitter walkthrough + exit-code contract\n\nAdds to docs/getting-started.md:\n- Feature attributes section (typed key/value metadata on each feature)\n- Build-system emitters table covering all 7 --format values\n- Worked example per format (Rust/cargo, CMake, C/C++, Bazel, Make, sh, JSON)\n- value/attr single-feature queries with exit-code contract (0/1/2)\n\nTrace: skip\n\n---------\n\nCo-authored-by: Claude Opus 4.7 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-04-23T00:13:59-05:00",
          "tree_id": "98a1c8b8afa5c344eb243cad90f0a07b8a530d66",
          "url": "https://github.com/pulseengine/rivet/commit/d52e99f4930d902b86f7ee7e5d81966410cdedc9"
        },
        "date": 1776921627429,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 81186,
            "range": "± 2072",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 870498,
            "range": "± 4759",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12944292,
            "range": "± 1290454",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1925,
            "range": "± 49",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24709,
            "range": "± 406",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 367493,
            "range": "± 2639",
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
            "value": 999523,
            "range": "± 13053",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 168005,
            "range": "± 777",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1913930,
            "range": "± 164415",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 28975313,
            "range": "± 2536874",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 120185,
            "range": "± 2908",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1063642,
            "range": "± 10307",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 13779989,
            "range": "± 1494934",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4091,
            "range": "± 190",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 43807,
            "range": "± 715",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 741467,
            "range": "± 11270",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 65425,
            "range": "± 271",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 714110,
            "range": "± 24680",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 9933922,
            "range": "± 97968",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 772,
            "range": "± 13",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 6638,
            "range": "± 136",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 88844,
            "range": "± 1013",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 24185,
            "range": "± 141",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 172907,
            "range": "± 2102",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1623860,
            "range": "± 18621",
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
          "id": "bcfcb2d87bc050972ba932deccd2acd279284091",
          "message": "feat(variant): rivet variant explain for debugging solve outcomes (#199)\n\n* feat(variant): rivet variant explain for debugging solve outcomes\n\nAnswers \"why did my variant pick/skip feature X?\" — a dev/debug UX gap\ncalled out in the v0.4.3 scope.\n\nTwo modes:\n\n  # Full audit: every effective feature + origin, unselected features,\n  # and the constraint list\n  rivet variant explain --model fm.yaml --variant prod.yaml\n\n  # Single-feature focus: origin, attribute values, and every\n  # constraint that mentions the feature\n  rivet variant explain --model fm.yaml --variant prod.yaml asil-c\n\nEach effective feature carries an origin:\n  - `selected`        — user listed it under `selects:`\n  - `mandatory`       — parent group is mandatory, or is the root\n  - `implied by <X>`  — a constraint forced it in once <X> was selected\n  - `allowed`         — present but not proven mandatory\n\n`--format json` emits a structured audit for scripts (dashboard uses\nthe same shape for the variant sidebar).\n\nCoverage:\n  - explain_single_feature_shows_origin_and_attrs (text mode)\n  - explain_single_feature_json_mode\n  - explain_full_variant_audit_lists_origins_and_unselected\n\nDocs: new \"Debugging\" subsection in docs/getting-started.md under the\nvariant management chapter, with an origin table.\n\nImplements: REQ-046\nRefs: DD-050\n\nCo-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>\n\n* test(variant): enrich eu-adas-c example + per-format smoke on realistic model\n\nAdds realistic `attributes:` to examples/variant/feature-model.yaml\nfor every market (eu/us/cn with compliance+locale) and every ASIL\nlevel (asil-numeric + required analysis techniques). These match the\nworked examples in docs/getting-started.md so users can run the\nsnippets against the shipped fixture and see the same output.\n\nNew integration test `every_format_renders_realistic_example`\nexercises all 7 --format values against the enriched example and\nasserts each output contains the variant name and the asil-c marker\n(in whatever casing the format uses). Catches regressions that pass\non toy models but break on constraint-driven inclusion, multi-attr\nfeatures, or non-trivial tree depth.\n\nImplements: REQ-046\nRefs: DD-050\n\nCo-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>\n\n---------\n\nCo-authored-by: Claude Opus 4.7 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-04-23T00:23:18-05:00",
          "tree_id": "db09866d78542811092a8c6d89bf78b233e73b33",
          "url": "https://github.com/pulseengine/rivet/commit/bcfcb2d87bc050972ba932deccd2acd279284091"
        },
        "date": 1776922389379,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 80350,
            "range": "± 304",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 838255,
            "range": "± 2217",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 11507652,
            "range": "± 499515",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2138,
            "range": "± 24",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25955,
            "range": "± 4690",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 359601,
            "range": "± 838",
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
            "value": 1022131,
            "range": "± 19696",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 164031,
            "range": "± 848",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1815189,
            "range": "± 23423",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 24440378,
            "range": "± 1230630",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 121534,
            "range": "± 1228",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1072101,
            "range": "± 18031",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 10785758,
            "range": "± 634836",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4196,
            "range": "± 209",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 59011,
            "range": "± 249",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 758698,
            "range": "± 1528",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 61345,
            "range": "± 204",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 689499,
            "range": "± 2840",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7839732,
            "range": "± 265543",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 785,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7118,
            "range": "± 36",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 105717,
            "range": "± 592",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 25766,
            "range": "± 369",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 186371,
            "range": "± 828",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1739575,
            "range": "± 22700",
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
          "id": "54b3ad5c31120cf3a56076fb92f8530313dbef2e",
          "message": "chore(release): v0.4.3 (#200)\n\n* feat(variant): rivet variant explain for debugging solve outcomes\n\nAnswers \"why did my variant pick/skip feature X?\" — a dev/debug UX gap\ncalled out in the v0.4.3 scope.\n\nTwo modes:\n\n  # Full audit: every effective feature + origin, unselected features,\n  # and the constraint list\n  rivet variant explain --model fm.yaml --variant prod.yaml\n\n  # Single-feature focus: origin, attribute values, and every\n  # constraint that mentions the feature\n  rivet variant explain --model fm.yaml --variant prod.yaml asil-c\n\nEach effective feature carries an origin:\n  - `selected`        — user listed it under `selects:`\n  - `mandatory`       — parent group is mandatory, or is the root\n  - `implied by <X>`  — a constraint forced it in once <X> was selected\n  - `allowed`         — present but not proven mandatory\n\n`--format json` emits a structured audit for scripts (dashboard uses\nthe same shape for the variant sidebar).\n\nCoverage:\n  - explain_single_feature_shows_origin_and_attrs (text mode)\n  - explain_single_feature_json_mode\n  - explain_full_variant_audit_lists_origins_and_unselected\n\nDocs: new \"Debugging\" subsection in docs/getting-started.md under the\nvariant management chapter, with an origin table.\n\nImplements: REQ-046\nRefs: DD-050\n\nCo-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>\n\n* test(variant): enrich eu-adas-c example + per-format smoke on realistic model\n\nAdds realistic `attributes:` to examples/variant/feature-model.yaml\nfor every market (eu/us/cn with compliance+locale) and every ASIL\nlevel (asil-numeric + required analysis techniques). These match the\nworked examples in docs/getting-started.md so users can run the\nsnippets against the shipped fixture and see the same output.\n\nNew integration test `every_format_renders_realistic_example`\nexercises all 7 --format values against the enriched example and\nasserts each output contains the variant name and the asil-c marker\n(in whatever casing the format uses). Catches regressions that pass\non toy models but break on constraint-driven inclusion, multi-attr\nfeatures, or non-trivial tree depth.\n\nImplements: REQ-046\nRefs: DD-050\n\nCo-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>\n\n* chore(release): v0.4.3\n\nWorkspace version bump 0.4.2 → 0.4.3, CHANGELOG entry covering the\nv0.4.3 changes that have already landed on main:\n\n- rivet variant features/value/attr for 7 build systems (#197)\n- docs: variant emitter walkthrough + exit-code contract (#198)\n- rivet variant explain for debugging solve outcomes (#199)\n- test: enrich eu-adas-c example + per-format smoke (#199)\n- sexpr count-compare + matches parse-time regex (#196)\n- SCRC Phase 1 clippy restriction lint escalation (#195)\n- Rivet Delta SVG render for email/mobile (#193)\n- stamp --missing-provenance filter + warn-skip (#192)\n\nv043-artifacts.yaml gains five new entries matching the implementations:\n  - DD-061  build-system emitters are namespaced and loud-on-failure\n  - FEAT-130 rivet variant features/value/attr\n  - FEAT-131 rivet variant explain\n  - DD-062  matches regex + count-compare validated at lower time\n  - FEAT-132 count-compare lowering + matches parse-time regex\n  - FEAT-133 Rivet Delta SVG render for email/mobile\n  - FEAT-134 rivet stamp filter + warn-skip\n\nAll 41 test binaries green. rivet validate: only pre-existing SPAR\naadl-component schema errors remain (unrelated to this release).\n\nImplements: REQ-046\nRefs: REQ-004, REQ-010, DD-050, DD-058\n\nCo-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>\n\n---------\n\nCo-authored-by: Claude Opus 4.7 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-04-23T00:30:18-05:00",
          "tree_id": "0372c9b857ae5be3e8968828e88125479bc880fd",
          "url": "https://github.com/pulseengine/rivet/commit/54b3ad5c31120cf3a56076fb92f8530313dbef2e"
        },
        "date": 1776922721745,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 79860,
            "range": "± 1483",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 851759,
            "range": "± 3347",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12258024,
            "range": "± 721958",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2246,
            "range": "± 13",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 27164,
            "range": "± 187",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 356271,
            "range": "± 3401",
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
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1019850,
            "range": "± 17035",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 164758,
            "range": "± 1446",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1909708,
            "range": "± 7398",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 25692890,
            "range": "± 2422946",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 123492,
            "range": "± 654",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1051217,
            "range": "± 12714",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 11284775,
            "range": "± 559859",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4197,
            "range": "± 11",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60138,
            "range": "± 237",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 762716,
            "range": "± 2333",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 64316,
            "range": "± 306",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 714229,
            "range": "± 11544",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7967212,
            "range": "± 228317",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 808,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7653,
            "range": "± 60",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 107341,
            "range": "± 950",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 25314,
            "range": "± 189",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 185457,
            "range": "± 1306",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1754981,
            "range": "± 23024",
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
          "id": "f25e592e063b8e8567afe4d7029da31b0c168b32",
          "message": "chore(release): bump vscode-rivet/package.json to 0.4.3 (#201)\n\nMissed in the v0.4.3 release bump (#200). Docs-check VersionConsistency\ninvariant fails CI on the v0.4.3 tag because the VS Code extension\npackage stayed at 0.4.2 while workspace moved to 0.4.3.\n\nPlatform packages stay at 0.4.1 intentionally — release-npm.yml\noverwrites them at publish time via jq.\n\nTrace: skip",
          "timestamp": "2026-04-23T01:18:11-05:00",
          "tree_id": "1d7d81d61e480fad0d3c2db6abef49cb2285a977",
          "url": "https://github.com/pulseengine/rivet/commit/f25e592e063b8e8567afe4d7029da31b0c168b32"
        },
        "date": 1776925575296,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 81996,
            "range": "± 635",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 848027,
            "range": "± 4677",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 11035172,
            "range": "± 606594",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2292,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26677,
            "range": "± 245",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 356757,
            "range": "± 1742",
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
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 997421,
            "range": "± 11962",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 165259,
            "range": "± 711",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1880900,
            "range": "± 7591",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 22853560,
            "range": "± 638383",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 121951,
            "range": "± 607",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1030746,
            "range": "± 13503",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 10677608,
            "range": "± 654292",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4238,
            "range": "± 18",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60829,
            "range": "± 347",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 754430,
            "range": "± 3191",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 62769,
            "range": "± 391",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 692049,
            "range": "± 5428",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7532323,
            "range": "± 111497",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 839,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7932,
            "range": "± 29",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 107782,
            "range": "± 823",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 25747,
            "range": "± 262",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 185515,
            "range": "± 1946",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1750011,
            "range": "± 20461",
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
          "id": "43c6f73f476718b562658e2e658745b53a910db9",
          "message": "fix(ci): remove dead `build-vsix` reference that killed ci.yml at parse time (#202)\n\n`release-results.needs:` referenced a `build-vsix` job that no longer\nexists — VSIX packaging was moved to release.yml so the extension\nattaches to the GitHub Release alongside the platform binaries.\nGitHub Actions rejects the whole workflow at validation time when\n`needs:` names a non-existent job, which is why every push to `main`\nand every PR has been showing \"ci.yml failed in 0s, 0 jobs\" since\nthe move.\n\nEffect of the bug: the main CI test gate has been silently absent\non every commit since the VSIX move. PRs have been merging only on\nBenchmarks + Rivet Delta checks. Fix restores fmt / clippy /\ntest / playwright / miri / proptest / coverage / audit / deny /\nkani / verus / rocq / msrv + docs-check as live checks.\n\nAlso drops the now-obsolete \"Download VSIX artifact\" step and the\n`vsix/*.vsix` entry in the release-results upload list — release.yml\nhandles both since the move.\n\nVerified clean with actionlint 1.7.12 across every workflow file.\n\nTrace: skip",
          "timestamp": "2026-04-23T12:11:46-05:00",
          "tree_id": "75b701137470e370707235150cad82a6a424bb0a",
          "url": "https://github.com/pulseengine/rivet/commit/43c6f73f476718b562658e2e658745b53a910db9"
        },
        "date": 1776964686907,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 79731,
            "range": "± 701",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 849128,
            "range": "± 2725",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 11093866,
            "range": "± 297388",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2228,
            "range": "± 37",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 27143,
            "range": "± 193",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 373253,
            "range": "± 1825",
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
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1016459,
            "range": "± 10771",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 166058,
            "range": "± 554",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1906300,
            "range": "± 16561",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 23566086,
            "range": "± 422410",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 124821,
            "range": "± 1434",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1041807,
            "range": "± 10878",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 10653467,
            "range": "± 235005",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4360,
            "range": "± 40",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 61933,
            "range": "± 290",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 755723,
            "range": "± 7291",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 63438,
            "range": "± 423",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 714313,
            "range": "± 3474",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7698830,
            "range": "± 226320",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 836,
            "range": "± 16",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7799,
            "range": "± 27",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 113139,
            "range": "± 688",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 26447,
            "range": "± 120",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 186732,
            "range": "± 984",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1750316,
            "range": "± 27526",
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
          "id": "bbba88e314e23ec34c66c546a34f89ac12339f13",
          "message": "feat(scrc): Phase 2 opening — memory-safety lints + semver-checks + SAFETY.md (#203)\n\n* fix(ci): remove dead `build-vsix` reference that killed ci.yml at parse time\n\n`release-results.needs:` referenced a `build-vsix` job that no longer\nexists — VSIX packaging was moved to release.yml so the extension\nattaches to the GitHub Release alongside the platform binaries.\nGitHub Actions rejects the whole workflow at validation time when\n`needs:` names a non-existent job, which is why every push to `main`\nand every PR has been showing \"ci.yml failed in 0s, 0 jobs\" since\nthe move.\n\nEffect of the bug: the main CI test gate has been silently absent\non every commit since the VSIX move. PRs have been merging only on\nBenchmarks + Rivet Delta checks. Fix restores fmt / clippy /\ntest / playwright / miri / proptest / coverage / audit / deny /\nkani / verus / rocq / msrv + docs-check as live checks.\n\nAlso drops the now-obsolete \"Download VSIX artifact\" step and the\n`vsix/*.vsix` entry in the release-results upload list — release.yml\nhandles both since the move.\n\nVerified clean with actionlint 1.7.12 across every workflow file.\n\nTrace: skip\n\n* feat(scrc): Phase 2 opening — memory-safety lints + semver-checks + SAFETY.md\n\nTwelve new clippy restriction lints at workspace `warn`:\n\n  unsafe-block hygiene:\n    undocumented_unsafe_blocks, multiple_unsafe_ops_per_block\n  memory-safety traps:\n    mem_forget, mem_replace_with_uninit,\n    transmute_undefined_repr, uninit_assumed_init\n  concurrency hazards:\n    rc_mutex, mutex_atomic\n  defensive misc:\n    same_name_method, lossy_float_literal, empty_drop, exit\n\nZero pre-existing violations for eleven of the twelve — these are\n\"defensive-against-drift\" lints that fail CI the moment a future\ncommit introduces an unsafe block without documentation, a transmute\nacross !repr(transparent) layouts, or a Mutex around a primitive.\n\n`clippy::exit` is grandfathered on three CLI exit-code sites in\nrivet-cli/src/main.rs (variant value/attr, exit 2 for the POSIX\n\"misuse\" code in the three-valued on/off/unknown contract). The\nfile-scope allow's rationale block explains why Result<bool> can't\nexpress a three-valued return.\n\nPhase 2 migration opens: rivet-core/src/matrix.rs is the first\nproduction file converted from file-scope blanket allow to per-site\n#[allow(...)] with inline SAFETY-REVIEW comments. Pattern documented\nin SAFETY.md so the remaining 63 files can follow.\n\nCI additions:\n- semver-checks job on pull_request catches breaking changes to the\n  rivet-core public API before they escape to a release tag.\n\nAlso adds the Phase 1 test-blanket allow to 5 integration test files\nthat I had missed during Phase 1: variant_emit.rs, sexpr_fuzz.rs,\nsexpr_filter_integration.rs, sexpr_doc_examples.rs,\nsexpr_predicate_matrix.rs. Test code legitimately uses\nunwrap/expect/panic; the blanket lives at crate scope for tests.\n\nSAFETY.md: new top-level document summarising the safety posture —\nlint set per tier, migration plan, and the verification harness\n(Miri, proptest, fuzz, mutants, Kani, Verus, Rocq).\n\nVerification:\n  cargo clippy --all-targets --workspace -- -D warnings   # exits 0\n  cargo test --workspace                                  # 41 binaries green\n\nImplements: REQ-004\nRefs: DD-058, DD-059\n\nCo-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>\n\n---------\n\nCo-authored-by: Claude Opus 4.7 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-04-23T12:44:21-05:00",
          "tree_id": "67546debd66b153ed10cf585e3babd275f2eebce",
          "url": "https://github.com/pulseengine/rivet/commit/bbba88e314e23ec34c66c546a34f89ac12339f13"
        },
        "date": 1776966752740,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 80373,
            "range": "± 1159",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 856750,
            "range": "± 6425",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12069942,
            "range": "± 717375",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2207,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24518,
            "range": "± 123",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 355103,
            "range": "± 1491",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 93,
            "range": "± 3",
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
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1030710,
            "range": "± 12748",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 165299,
            "range": "± 1512",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1895829,
            "range": "± 20740",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 24984315,
            "range": "± 1923156",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 121366,
            "range": "± 904",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1018144,
            "range": "± 14661",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 11366673,
            "range": "± 552586",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4314,
            "range": "± 21",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 61858,
            "range": "± 1260",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 761247,
            "range": "± 6323",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 63302,
            "range": "± 337",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 705593,
            "range": "± 2481",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7719753,
            "range": "± 168420",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 850,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7706,
            "range": "± 19",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 108772,
            "range": "± 614",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 25473,
            "range": "± 170",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 184331,
            "range": "± 1413",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1733833,
            "range": "± 27431",
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
          "id": "1dfe6402f2ee3557f518a1ac7048a50df2322170",
          "message": "feat(vscode): HTML-view source link jumps to artifact definition + new context menu (#204)\n\nFixes a bug and adds two new context-menu actions on YAML files.\n\n## Bug: \"open source file\" from HTML view landed at line 1\n\nThe 📄 source-file link on an artifact's HTML view (in the VS Code\nwebview) posted `{ file }` but no line number, so the editor opened\nthe YAML at the top of the file instead of the artifact's own `id:`\nline. For a file with 200+ artifacts this was a long scroll.\n\nFix spans two layers:\n- `render/artifacts.rs` scans the source YAML for `id: <this>` /\n  `- id: <this>` and emits `data-source-line=\"<0-based>\"` on the\n  anchor alongside `data-source-file`. Mirrors `lsp_find_artifact_line`\n  so the go-to-def path and the webview path produce identical\n  positions for the same artifact.\n- `shell.ts` parses `data-source-line` into an integer and forwards\n  it as `msg.line` when posting `openSource`.\n- `extension.ts` uses `msg.line` to construct a `vscode.Range` and\n  passes it as `options.selection` to `showTextDocument`, so the\n  cursor lands on the artifact's `id:` row and the editor reveals\n  that line.\n\nRenderResult.source_line is also populated for the top-level source\nlink that `rivet.showSource` uses (previously None for this path).\n\n## New context-menu actions on YAML files\n\nTwo new commands registered in `editor/context` for `yaml` files:\n- `Rivet: Open Artifact in Dashboard` — navigates the webview to\n  `/artifact/<id>` for the artifact ID under the cursor.\n- `Rivet: Show Artifact in Graph` — navigates the webview to\n  `/graph?focus=<id>`.\n\nBoth use a shared `artifactIdAtCursor()` helper that extracts a\nrivet-shaped ID at the editor cursor (uppercase-prefix + dash +\ndigits, with optional `prefix:` external-ref namespacing). Rejects\nplain YAML keys like `title` so the menu items no-op gracefully with\nan info message when the cursor is not on an ID.\n\nRefs: FEAT-010, FEAT-001\n\nCo-authored-by: Claude Opus 4.7 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-04-23T13:03:25-05:00",
          "tree_id": "a019812597d63ac626f6ca0980e37f254909dbc3",
          "url": "https://github.com/pulseengine/rivet/commit/1dfe6402f2ee3557f518a1ac7048a50df2322170"
        },
        "date": 1776967904021,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 79963,
            "range": "± 1682",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 859238,
            "range": "± 7430",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13067139,
            "range": "± 1118158",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2130,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26041,
            "range": "± 1688",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 360003,
            "range": "± 6752",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 93,
            "range": "± 1",
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
            "value": 1020042,
            "range": "± 19786",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 165776,
            "range": "± 2424",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1907199,
            "range": "± 13051",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 30510500,
            "range": "± 2283635",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 120888,
            "range": "± 770",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1016854,
            "range": "± 37250",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 12835615,
            "range": "± 1054692",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4230,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60917,
            "range": "± 2038",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 763881,
            "range": "± 12724",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 65286,
            "range": "± 429",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 707652,
            "range": "± 14789",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8102579,
            "range": "± 395927",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 837,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7732,
            "range": "± 139",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 112291,
            "range": "± 2060",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 25783,
            "range": "± 302",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 185027,
            "range": "± 2653",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1727380,
            "range": "± 12375",
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
          "id": "c7d5664ee7410065fde1e1d108e666c5fd2ec1cd",
          "message": "Merge pull request #205 from pulseengine/feat/agent-pipelines-foundation\n\nfeat: agent-pipelines foundation + Mythos slop-hunt pipeline & findings",
          "timestamp": "2026-04-25T15:04:52-05:00",
          "tree_id": "1851cc831c3b2c1ad9f004452ddddc576fad7e7b",
          "url": "https://github.com/pulseengine/rivet/commit/c7d5664ee7410065fde1e1d108e666c5fd2ec1cd"
        },
        "date": 1777147906174,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 83372,
            "range": "± 886",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 887344,
            "range": "± 4174",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12308476,
            "range": "± 720836",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1948,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24858,
            "range": "± 51",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 378215,
            "range": "± 1969",
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
            "value": 1191240,
            "range": "± 101270",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 168565,
            "range": "± 561",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1946791,
            "range": "± 31041",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 27390081,
            "range": "± 279307",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 120127,
            "range": "± 1397",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1064931,
            "range": "± 11261",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 11852513,
            "range": "± 526632",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4147,
            "range": "± 11",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 43287,
            "range": "± 135",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 761870,
            "range": "± 3809",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 60280,
            "range": "± 2038",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 689968,
            "range": "± 2721",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7611136,
            "range": "± 77474",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 772,
            "range": "± 29",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 6662,
            "range": "± 35",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 91697,
            "range": "± 323",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23729,
            "range": "± 60",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 167476,
            "range": "± 2197",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1584272,
            "range": "± 22583",
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
          "id": "f39dbc2d92b81b9018c8edb6707289208ce84954",
          "message": "Merge pull request #211 from pulseengine/fix/playwright-stale-tests\n\nfix(tests/playwright): batch stale-test cleanups (5 of 10)",
          "timestamp": "2026-04-25T17:10:16-05:00",
          "tree_id": "37def75fcbbd3f14c71765228b230eaaa363d2bd",
          "url": "https://github.com/pulseengine/rivet/commit/f39dbc2d92b81b9018c8edb6707289208ce84954"
        },
        "date": 1777155402483,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 81756,
            "range": "± 964",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 853989,
            "range": "± 17622",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 11096137,
            "range": "± 446709",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2190,
            "range": "± 30",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26441,
            "range": "± 343",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 366840,
            "range": "± 6348",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 94,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/1000",
            "value": 94,
            "range": "± 1",
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
            "value": 1184976,
            "range": "± 28685",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 161706,
            "range": "± 2677",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1895946,
            "range": "± 25210",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 22725353,
            "range": "± 525533",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 125917,
            "range": "± 2880",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1071243,
            "range": "± 24143",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 10898312,
            "range": "± 284576",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4204,
            "range": "± 80",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 59627,
            "range": "± 452",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 770114,
            "range": "± 13924",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 60468,
            "range": "± 247",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 667099,
            "range": "± 3098",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7480048,
            "range": "± 42658",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 800,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7459,
            "range": "± 73",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 109034,
            "range": "± 1868",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 24951,
            "range": "± 230",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 178555,
            "range": "± 2885",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1656025,
            "range": "± 34059",
            "unit": "ns/iter"
          }
        ]
      }
    ]
  }
}