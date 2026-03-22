window.BENCHMARK_DATA = {
  "lastUpdate": 1774173078203,
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
          "id": "d80b36b09bf95a79b2a613dbf48cd25dd9328a53",
          "message": "fix(etch): edges hidden behind containers — fix SVG render order (#55)\n\nRender containers → edges → leaf nodes (was: edges → all nodes).\nAdd port label margin to prevent clipping.\n\nTrace: skip\n\nCo-authored-by: Test <test@test.com>\nCo-authored-by: Claude Opus 4.6 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-03-20T07:04:04+01:00",
          "tree_id": "cf918097f00cda03970f8127e3a0a7cd7fe3403c",
          "url": "https://github.com/pulseengine/rivet/commit/d80b36b09bf95a79b2a613dbf48cd25dd9328a53"
        },
        "date": 1773987012658,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 83380,
            "range": "± 472",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 1239956,
            "range": "± 20436",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 53395236,
            "range": "± 2295778",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2220,
            "range": "± 25",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26518,
            "range": "± 347",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 385132,
            "range": "± 8410",
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
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 908502,
            "range": "± 14185",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 167166,
            "range": "± 1233",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1931514,
            "range": "± 23347",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 26337016,
            "range": "± 2109151",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 41810,
            "range": "± 1222",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 459042,
            "range": "± 15674",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 4831802,
            "range": "± 109618",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4411,
            "range": "± 14",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 58407,
            "range": "± 244",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 782159,
            "range": "± 7087",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 61814,
            "range": "± 245",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 686039,
            "range": "± 4626",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7486958,
            "range": "± 201511",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 846,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7881,
            "range": "± 25",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 109947,
            "range": "± 2718",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22988,
            "range": "± 250",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 155896,
            "range": "± 1562",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1453210,
            "range": "± 29038",
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
          "id": "2e062f43c2594f974748a21b31addae1a4498a02",
          "message": "feat: reusable UI components, ARCH model extension, startup update check (#56)\n\n* fix(etch): improve edge rendering quality\n\n- Deduplicate consecutive identical waypoints in path builder\n- Offset edge labels to the right of edges (avoid overlap)\n- Thicker edge strokes (1.8px) for visibility\n- Larger port label text (10px, bold 500)\n- Port label margin in SVG viewBox\n\nTrace: skip\n\nCo-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>\n\n* feat: reusable UI components, ARCH model extension, startup update check\n\n1. Reusable UI components (components.rs):\n   - search_input(), type_select(), per_page_select(), type_checkboxes()\n   - validation_filter_bar() with severity dropdown + text search\n   - Refactored artifacts, STPA, and validation views to use shared components\n   - Removed duplicated ArtifactsParams/StpaParams structs → ViewParams\n   - 8 new component tests\n\n2. ARCH model extension (8 new components):\n   - ARCH-CORE-COMMITS, ARCH-CORE-EXTERNALS, ARCH-CORE-IMPACT\n   - ARCH-CORE-MUTATE, ARCH-CORE-MARKDOWN, ARCH-CORE-EXPORT\n   - ARCH-ADAPT-NEEDSJSON, ARCH-CORE-SCANNER\n   - Covers REQ-017 through REQ-036 (phase-3 requirements)\n\n3. Startup update check:\n   - Non-blocking background thread on serve/validate\n   - Rate-limited to once per 24h via cache file\n   - Checks GitHub releases API, prints hint if newer version available\n\nImplements: FEAT-065\nRefs: ARCH-DASH-001\n\nCo-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>\n\n---------\n\nCo-authored-by: Test <test@test.com>\nCo-authored-by: Claude Opus 4.6 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-03-20T20:53:30+01:00",
          "tree_id": "549616e70b4469569da26b81520eea00356a6341",
          "url": "https://github.com/pulseengine/rivet/commit/2e062f43c2594f974748a21b31addae1a4498a02"
        },
        "date": 1774036855201,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 86055,
            "range": "± 1822",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 1312907,
            "range": "± 26494",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 58635405,
            "range": "± 2001164",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1989,
            "range": "± 29",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24262,
            "range": "± 96",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 367473,
            "range": "± 2384",
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
            "value": 98,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 897684,
            "range": "± 4301",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 175266,
            "range": "± 784",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 2025703,
            "range": "± 14974",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 33656130,
            "range": "± 4045582",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 39442,
            "range": "± 171",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 444235,
            "range": "± 1919",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 5176025,
            "range": "± 316520",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4266,
            "range": "± 75",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 45417,
            "range": "± 529",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 763535,
            "range": "± 7990",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 64187,
            "range": "± 153",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 727038,
            "range": "± 15966",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8068453,
            "range": "± 109921",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 781,
            "range": "± 9",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 6705,
            "range": "± 55",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 92142,
            "range": "± 512",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21233,
            "range": "± 291",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 146616,
            "range": "± 2705",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1358662,
            "range": "± 23235",
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
          "id": "5d6891794a461ae914b3f009ae69075f7e2724d7",
          "message": "fix(serve): mermaid rendering in print view + print layout tests (#57)\n\nPrint layout was missing mermaid.js script tag — diagrams didn't render.\nAlso fixed /?print=1 to use print_layout middleware for root path.\n\nAdded 4 new print-specific Playwright tests:\n- mermaid.js script present in print view\n- mermaid library loads successfully\n- print layout has no sidebar nav\n- print view shows \"printed view\" footer\n\n218/218 Playwright tests pass.\n\nFixes: FEAT-001\n\nCo-authored-by: Test <test@test.com>\nCo-authored-by: Claude Opus 4.6 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-03-21T06:03:04+01:00",
          "tree_id": "f3e6b69cf2e25cd05591c09992fa7d1275b7d68b",
          "url": "https://github.com/pulseengine/rivet/commit/5d6891794a461ae914b3f009ae69075f7e2724d7"
        },
        "date": 1774070307688,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 83093,
            "range": "± 338",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 1228004,
            "range": "± 21435",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 53661996,
            "range": "± 2416032",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2204,
            "range": "± 28",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25985,
            "range": "± 155",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 363346,
            "range": "± 3512",
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
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 916873,
            "range": "± 7498",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 173756,
            "range": "± 652",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1994596,
            "range": "± 27567",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 26648806,
            "range": "± 1277812",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 40859,
            "range": "± 388",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 461697,
            "range": "± 2524",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 4843051,
            "range": "± 258048",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4396,
            "range": "± 63",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 61800,
            "range": "± 347",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 793359,
            "range": "± 3760",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 62086,
            "range": "± 938",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 697607,
            "range": "± 6367",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8246041,
            "range": "± 320147",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 851,
            "range": "± 11",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7889,
            "range": "± 102",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 111946,
            "range": "± 1439",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23421,
            "range": "± 242",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 160578,
            "range": "± 675",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1492847,
            "range": "± 14755",
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
          "id": "fb2efbf792e47113baa511f919af740232ae66eb",
          "message": "feat: LSP foundation, baseline-scoped validation, performance fixes (#58)\n\nThree workstreams:\n\n1. LSP foundation (rivet lsp):\n   - lsp-server + lsp-types dependencies\n   - Lsp subcommand with stdio connection\n   - Server capabilities: text sync, diagnostics, hover, goto-def, completion\n   - Main message loop with shutdown handling\n   - Foundation for incremental validation via salsa\n\n2. Baseline-scoped validation (--baseline flag):\n   - BaselineConfig in rivet.yaml (ordered, cumulative)\n   - Artifact.baseline() helper reads from fields map\n   - Store::scoped() filters by baseline (cumulative inclusion)\n   - --baseline flag on validate, list, stats, coverage, export\n   - Dogfood: v0.1.0 (53 artifacts) and v0.2.0-dev baselines defined\n   - REQ/DD/FEAT artifacts tagged with baseline fields\n\n3. Performance fixes (7.8x store speedup):\n   - O(n²) Store::upsert fixed (linear contains → direct insert)\n   - Regex pre-compilation for conditional rules (N×M → M compiles)\n   - Cow<str> for get_field_value (zero-copy field reads)\n   - Allocation-free allowed_values check\n   - Hoisted forward-map entry in LinkGraph::build\n   - Cached diagnostics in AppState (no re-validation per page view)\n\nImplements: FEAT-047\nSatisfies: REQ-029\n\nCo-authored-by: Test <test@test.com>\nCo-authored-by: Claude Opus 4.6 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-03-21T07:10:32+01:00",
          "tree_id": "089045fe7ccd2b2b49637f8cd1b658c1f6ab89a8",
          "url": "https://github.com/pulseengine/rivet/commit/fb2efbf792e47113baa511f919af740232ae66eb"
        },
        "date": 1774073956441,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 78235,
            "range": "± 1555",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 825204,
            "range": "± 4338",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14088151,
            "range": "± 1035041",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2262,
            "range": "± 18",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26831,
            "range": "± 315",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 387294,
            "range": "± 2189",
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
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 922237,
            "range": "± 24428",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 166954,
            "range": "± 2200",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1935374,
            "range": "± 16358",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 32297177,
            "range": "± 1797763",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 41760,
            "range": "± 1008",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 474304,
            "range": "± 1945",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 5509606,
            "range": "± 465065",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4454,
            "range": "± 17",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60294,
            "range": "± 539",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 772044,
            "range": "± 6310",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 62651,
            "range": "± 384",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 698284,
            "range": "± 2389",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8762539,
            "range": "± 568912",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 853,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7812,
            "range": "± 200",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 114850,
            "range": "± 680",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23062,
            "range": "± 316",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 162130,
            "range": "± 1368",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1497256,
            "range": "± 19721",
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
          "id": "f8cf3617c783febde925dfd6952e944a4ccbc906",
          "message": "feat(cli): add rivet init --agents to generate AGENTS.md (#59)\n\nGenerates a project-aware AGENTS.md (universal AI agent instruction\nstandard, 25+ tools, Linux Foundation AAIF) from the current project\nstate. Scans rivet.yaml, counts artifacts by type, lists commands,\nlink types, and commit traceability config.\n\n- Always regenerates AGENTS.md (reflects current state, says \"updated\")\n- Creates CLAUDE.md shim only if missing\n- HTML comment header marks it as auto-generated\n- Project-aware: schemas, types, counts, link types from actual data\n\nUsage: rivet init --agents\n\nImplements: FEAT-056\n\nCo-authored-by: Test <test@test.com>\nCo-authored-by: Claude Opus 4.6 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-03-21T07:29:30+01:00",
          "tree_id": "e43485bce69b5447ac951c74676f94763db5034b",
          "url": "https://github.com/pulseengine/rivet/commit/f8cf3617c783febde925dfd6952e944a4ccbc906"
        },
        "date": 1774075051693,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 78327,
            "range": "± 1010",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 818301,
            "range": "± 5526",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12814094,
            "range": "± 773121",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2145,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26466,
            "range": "± 93",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 374039,
            "range": "± 4324",
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
            "value": 923178,
            "range": "± 6727",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 163000,
            "range": "± 1203",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1885310,
            "range": "± 14524",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 23919737,
            "range": "± 776923",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 33192,
            "range": "± 184",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 471964,
            "range": "± 4351",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 4897118,
            "range": "± 149963",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4436,
            "range": "± 16",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 61671,
            "range": "± 271",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 753117,
            "range": "± 16362",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 63809,
            "range": "± 570",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 698313,
            "range": "± 3509",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7649126,
            "range": "± 83076",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 835,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7835,
            "range": "± 46",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 118680,
            "range": "± 4690",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23337,
            "range": "± 198",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 159694,
            "range": "± 2150",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1474532,
            "range": "± 29139",
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
          "id": "4d156a23e5a928a143e5c5b22cb77da5f9b0a2e5",
          "message": "feat(lsp): wire real handlers + coverage tests for store/schema/model (#60)\n\nLSP is now functional with 4 handlers:\n- Diagnostics: publishes validation results mapped to source file + line\n- Hover: artifact title, type, description, status, links on hover\n- Go-to-definition: ctrl+click artifact ID → source YAML definition\n- Completion: artifact IDs on target: lines, types on type: lines\n\nCoverage fixes (27 new tests):\n- store.rs: scoped(), upsert, insert edge cases\n- schema.rs: Cow<str> field access, regex caching, condition matching\n- model.rs: baseline(), BaselineConfig deserialization\n\nImplements: FEAT-047\nSatisfies: REQ-029\n\nCo-authored-by: Test <test@test.com>\nCo-authored-by: Claude Opus 4.6 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-03-21T17:00:40+01:00",
          "tree_id": "d73ae53d8bd06e39f7076de467cb1fd2981e6b82",
          "url": "https://github.com/pulseengine/rivet/commit/4d156a23e5a928a143e5c5b22cb77da5f9b0a2e5"
        },
        "date": 1774109225452,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 78765,
            "range": "± 477",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 826136,
            "range": "± 3248",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 10960735,
            "range": "± 631720",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2247,
            "range": "± 17",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25712,
            "range": "± 452",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 356739,
            "range": "± 1226",
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
            "value": 910071,
            "range": "± 4850",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 165140,
            "range": "± 707",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1904898,
            "range": "± 14661",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 25996750,
            "range": "± 1512422",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 41330,
            "range": "± 192",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 467042,
            "range": "± 12348",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 4795341,
            "range": "± 154965",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4386,
            "range": "± 21",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60248,
            "range": "± 491",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 784760,
            "range": "± 3678",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 62138,
            "range": "± 1637",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 694452,
            "range": "± 3400",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7576339,
            "range": "± 198672",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 863,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7352,
            "range": "± 29",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 108697,
            "range": "± 660",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22541,
            "range": "± 75",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 159978,
            "range": "± 1652",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1491554,
            "range": "± 16795",
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
          "id": "8a6b87d2af223e3a9312e1fc77327ff06c367425",
          "message": "feat: SCORE schema, LSP reload, audit fixes (UTF-8 panic, XSS, perf) (#61)\n\n* docs(schema): add research schema for market/competitive/patent/tech tracking\n\nNew artifact types: market-finding, competitive-analysis, patent-finding,\ntechnology-evaluation, academic-reference. Enables traceability from\nresearch findings to requirements and architecture decisions.\n\nTrace: skip\n\nCo-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>\n\n* feat(schema): add Eclipse SCORE metamodel + fix critical audit findings\n\n1. SCORE schema (schemas/score.yaml): 40+ artifact types across 7 areas\n   (process, requirements, architecture, implementation, safety,\n   verification, documents) with 18 link types and 20 traceability rules\n\n2. LSP didSave reload: full project reload on file save with stale\n   diagnostic clearing and fresh republish\n\n3. Critical bug fixes from deep audit:\n   - UTF-8 string slicing panic: &title[..26] → chars().take(26)\n   - Mermaid securityLevel: 'loose' → 'strict' (prevent XSS via diagrams)\n   - Redundant validation: page_layout() now uses cached_diagnostics\n   - HTML escaping: source file refs, results view, wiki-link IDs\n\nFixes: FEAT-001\nSatisfies: SSC-4\n\nCo-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>\n\n---------\n\nCo-authored-by: Test <test@test.com>\nCo-authored-by: Claude Opus 4.6 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-03-21T18:08:08+01:00",
          "tree_id": "1f00d48a4c0d14af529c76d53cf98c2d318b372c",
          "url": "https://github.com/pulseengine/rivet/commit/8a6b87d2af223e3a9312e1fc77327ff06c367425"
        },
        "date": 1774113275326,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 78154,
            "range": "± 2469",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 824840,
            "range": "± 4914",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 11749644,
            "range": "± 1691370",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2207,
            "range": "± 12",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26877,
            "range": "± 254",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 382857,
            "range": "± 1014",
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
            "value": 925533,
            "range": "± 4313",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 162277,
            "range": "± 2742",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1902933,
            "range": "± 37028",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 31372768,
            "range": "± 2895151",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 40754,
            "range": "± 123",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 463427,
            "range": "± 4389",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 4754992,
            "range": "± 47267",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4297,
            "range": "± 54",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 58574,
            "range": "± 376",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 796056,
            "range": "± 3896",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 61840,
            "range": "± 284",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 711778,
            "range": "± 20669",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7684761,
            "range": "± 293564",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 802,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7463,
            "range": "± 27",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 115136,
            "range": "± 728",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23032,
            "range": "± 289",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 157121,
            "range": "± 2849",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1456515,
            "range": "± 13795",
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
          "id": "99b853480464d8b4475a9f6cfdf3107f8db2507f",
          "message": "test(playwright): 17 audit regression tests — security, perf, edge cases, consistency (#62)\n\nPrevents recurrence of all findings from the deep serve+export audit:\n- Security: mermaid strict mode, CSP no unsafe-eval, HTML-escaped IDs\n- Performance: page navigation under 5s (cached diagnostics)\n- Edge cases: pagination bounds (0, 99999, per_page=0/1), unknown sort,\n  special chars in search and Cmd+K\n- Consistency: nav href=hx-get, print footer, all routes return 200\n\nRefs: TEST-012\n\nCo-authored-by: Test <test@test.com>\nCo-authored-by: Claude Opus 4.6 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-03-21T18:13:25+01:00",
          "tree_id": "f1b2c03d505094f5df6a65c77f8ca5f8cc50e7af",
          "url": "https://github.com/pulseengine/rivet/commit/99b853480464d8b4475a9f6cfdf3107f8db2507f"
        },
        "date": 1774113604313,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 77860,
            "range": "± 2521",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 812468,
            "range": "± 9287",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 9942638,
            "range": "± 328785",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2253,
            "range": "± 21",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25022,
            "range": "± 324",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 347202,
            "range": "± 1713",
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
            "value": 913794,
            "range": "± 33922",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 163895,
            "range": "± 765",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1878577,
            "range": "± 15482",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 24390942,
            "range": "± 1552258",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 33536,
            "range": "± 98",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 459382,
            "range": "± 2631",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 4736309,
            "range": "± 43403",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4351,
            "range": "± 33",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60100,
            "range": "± 432",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 761954,
            "range": "± 3996",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 63565,
            "range": "± 329",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 703116,
            "range": "± 2576",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7641507,
            "range": "± 103801",
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
            "value": 7453,
            "range": "± 44",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 112070,
            "range": "± 930",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23225,
            "range": "± 108",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 164680,
            "range": "± 1263",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1459424,
            "range": "± 19790",
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
          "id": "39853d2395b21dd8581ad5e05290817d2cce6176",
          "message": "test(mutants): add tests for 2 missed mutation targets in bazel lexer (#63)\n\nCatches both surviving mutants from cargo-mutants:\n- lex_carriage_return_newlines: verifies \\r\\n produces Newline tokens\n- lex_dot_token: verifies . produces Dot token\n\n0 missed mutants remaining.\n\nRefs: TEST-006\n\nCo-authored-by: Test <test@test.com>\nCo-authored-by: Claude Opus 4.6 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-03-21T18:32:49+01:00",
          "tree_id": "f5f8f0da69998f1b8e9138f475367f82120af50f",
          "url": "https://github.com/pulseengine/rivet/commit/39853d2395b21dd8581ad5e05290817d2cce6176"
        },
        "date": 1774114921654,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 75580,
            "range": "± 2149",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 841187,
            "range": "± 4807",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14185889,
            "range": "± 1062427",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1682,
            "range": "± 11",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 19329,
            "range": "± 71",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 349045,
            "range": "± 2933",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 87,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/1000",
            "value": 87,
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
            "value": 838122,
            "range": "± 2892",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 159308,
            "range": "± 691",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1834089,
            "range": "± 33306",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 39981952,
            "range": "± 2959565",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 39134,
            "range": "± 108",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 410496,
            "range": "± 2381",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 7638534,
            "range": "± 851053",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3942,
            "range": "± 11",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 41626,
            "range": "± 95",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 796519,
            "range": "± 4542",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 53427,
            "range": "± 489",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 578432,
            "range": "± 28231",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 9190463,
            "range": "± 499910",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 664,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 5566,
            "range": "± 24",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 154251,
            "range": "± 464",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21282,
            "range": "± 63",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 149131,
            "range": "± 1323",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1365155,
            "range": "± 13923",
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
          "id": "f79d3d9af0865448f15783a18727760105f8fd1d",
          "message": "chore: release v0.2.0 (#64)\n\nVersion bump 0.2.0-dev → 0.2.0 + CHANGELOG.md.\n\nHighlights:\n- LSP server (rivet lsp) with diagnostics, hover, goto-def, completion\n- Baseline-scoped validation (--baseline)\n- STPA-Sec security analysis (31 artifacts)\n- Eclipse SCORE metamodel schema (40+ types)\n- Self-contained binary (HTMX/Mermaid/fonts bundled)\n- Dashboard filter/sort/pagination + STPA filter bar\n- 235+ Playwright E2E tests with CI job\n- 7.8x store performance fix\n- rivet init --agents (AGENTS.md generation)\n- 447 artifacts, 0 warnings\n\nTrace: skip\n\nCo-authored-by: Test <test@test.com>",
          "timestamp": "2026-03-21T18:59:54+01:00",
          "tree_id": "499b22c4f32bcd4c402292f853bdac9372a5e799",
          "url": "https://github.com/pulseengine/rivet/commit/f79d3d9af0865448f15783a18727760105f8fd1d"
        },
        "date": 1774116549847,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 78569,
            "range": "± 354",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 826994,
            "range": "± 3974",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 10411434,
            "range": "± 690457",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2165,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26052,
            "range": "± 175",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 381883,
            "range": "± 2204",
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
            "value": 96,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 907596,
            "range": "± 6948",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 163281,
            "range": "± 2535",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1903425,
            "range": "± 19338",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 23844847,
            "range": "± 1063101",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 41550,
            "range": "± 745",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 469339,
            "range": "± 2660",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 4751068,
            "range": "± 33502",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4367,
            "range": "± 22",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60088,
            "range": "± 378",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 806251,
            "range": "± 2943",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 60021,
            "range": "± 203",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 656505,
            "range": "± 5326",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7263297,
            "range": "± 172615",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 780,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7215,
            "range": "± 35",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 106699,
            "range": "± 774",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22914,
            "range": "± 181",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 159777,
            "range": "± 1947",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1496300,
            "range": "± 30450",
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
          "id": "1047a31c87b5be34354a1557e6dca64a486313d2",
          "message": "ci: add build attestation + strict cargo-vet for v0.2.0 (#65)\n\n- Build provenance attestation via actions/attest-build-provenance@v2\n  (Sigstore-signed SLSA provenance, verifiable via gh attestation verify)\n- Release job now includes Playwright in needs chain\n- Release binary included in GitHub release assets\n- cargo-vet made strict (no fallback warning — hard fail on unaudited)\n- Release job permissions: contents, id-token, attestations\n\nRefs: REQ-012\n\nCo-authored-by: Test <test@test.com>\nCo-authored-by: Claude Opus 4.6 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-03-21T19:10:59+01:00",
          "tree_id": "ef5dcd20aaa03c04333b92d86b5c0aaf2aff9145",
          "url": "https://github.com/pulseengine/rivet/commit/1047a31c87b5be34354a1557e6dca64a486313d2"
        },
        "date": 1774118017482,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 78858,
            "range": "± 728",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 826392,
            "range": "± 10668",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12613233,
            "range": "± 1012850",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2206,
            "range": "± 14",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26745,
            "range": "± 120",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 387563,
            "range": "± 2722",
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
            "value": 953971,
            "range": "± 6359",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 164622,
            "range": "± 1439",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1919229,
            "range": "± 9507",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 26033867,
            "range": "± 1563739",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 41178,
            "range": "± 95",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 468062,
            "range": "± 2216",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 4962936,
            "range": "± 209483",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4287,
            "range": "± 19",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 58734,
            "range": "± 3338",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 749210,
            "range": "± 3388",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 59299,
            "range": "± 173",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 677207,
            "range": "± 2947",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7767862,
            "range": "± 446761",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 777,
            "range": "± 10",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7382,
            "range": "± 62",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 120521,
            "range": "± 3099",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23544,
            "range": "± 425",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 158830,
            "range": "± 484",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1488309,
            "range": "± 36242",
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
          "id": "189f78979db62675f4fa7f3cf271e8f8db681f14",
          "message": "feat: VS Code extension + rivet serve --watch (#66)\n\n1. vscode-rivet extension:\n   - LSP client connecting to rivet lsp via stdio\n   - WebView panel embedding rivet serve dashboard\n   - Commands: showDashboard, showGraph, showSTPA, validate, addArtifact\n   - Activates on workspaceContains:rivet.yaml\n   - Status bar with port display\n   - Auto-starts rivet serve --watch in background\n   - Bidirectional navigation (dashboard → editor via postMessage)\n\n2. rivet serve --watch:\n   - Watches rivet.yaml, sources, schemas, docs for changes\n   - Debounced at 300ms, filters to .yaml/.yml/.md files\n   - Auto-POSTs /reload on change (existing endpoint)\n   - Port 0 support for auto-assigned ports\n   - Uses notify crate v7\n\nImplements: FEAT-057\nRefs: REQ-007\n\nCo-authored-by: Test <test@test.com>\nCo-authored-by: Claude Opus 4.6 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-03-21T20:04:06+01:00",
          "tree_id": "255125a91fbee5c13130f02fc0be4b5d437aa196",
          "url": "https://github.com/pulseengine/rivet/commit/189f78979db62675f4fa7f3cf271e8f8db681f14"
        },
        "date": 1774120633603,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 79658,
            "range": "± 336",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 832120,
            "range": "± 4766",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 10792948,
            "range": "± 1250962",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2214,
            "range": "± 12",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26798,
            "range": "± 263",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 393144,
            "range": "± 1813",
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
            "value": 917870,
            "range": "± 5858",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 161683,
            "range": "± 2303",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1898992,
            "range": "± 49049",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 27649692,
            "range": "± 3865700",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 33655,
            "range": "± 103",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 470118,
            "range": "± 2065",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 4885959,
            "range": "± 40225",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4371,
            "range": "± 18",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 58966,
            "range": "± 1248",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 801348,
            "range": "± 2491",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 63739,
            "range": "± 1072",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 688023,
            "range": "± 49263",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7602011,
            "range": "± 215630",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 824,
            "range": "± 17",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7345,
            "range": "± 24",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 111706,
            "range": "± 706",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22987,
            "range": "± 143",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 165597,
            "range": "± 2870",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1489305,
            "range": "± 19904",
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
          "id": "ea04b81d6342b3fa399f085aef48c98c1abfe444",
          "message": "ci: VS Code extension tests with headless VS Code in CI (#67)\n\n- Extension test suite: 6 tests verifying all commands are registered\n- Uses @vscode/test-electron for headless VS Code in CI\n- xvfb-run for Linux display emulation\n- CI job runs after unit tests, builds rivet binary first\n\nRefs: REQ-007\n\nCo-authored-by: Test <test@test.com>\nCo-authored-by: Claude Opus 4.6 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-03-21T20:06:48+01:00",
          "tree_id": "23fb47a09c45aed866b8f9c8afc8c49a2435e7ff",
          "url": "https://github.com/pulseengine/rivet/commit/ea04b81d6342b3fa399f085aef48c98c1abfe444"
        },
        "date": 1774121323387,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 79949,
            "range": "± 315",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 827259,
            "range": "± 5691",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14134389,
            "range": "± 1137865",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2223,
            "range": "± 10",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25101,
            "range": "± 88",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 378499,
            "range": "± 2640",
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
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 947463,
            "range": "± 8031",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 163387,
            "range": "± 1039",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1917204,
            "range": "± 21858",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 30045870,
            "range": "± 3669251",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 43136,
            "range": "± 937",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 481854,
            "range": "± 1599",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 5495221,
            "range": "± 510919",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4335,
            "range": "± 14",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60462,
            "range": "± 467",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 768103,
            "range": "± 3597",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 60259,
            "range": "± 187",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 670759,
            "range": "± 3846",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8123087,
            "range": "± 461511",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 774,
            "range": "± 11",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7132,
            "range": "± 41",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 108738,
            "range": "± 925",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 24104,
            "range": "± 138",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 160569,
            "range": "± 845",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1501477,
            "range": "± 70959",
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
          "id": "67a1f2880464eb04f1da29843edebf23c44dca66",
          "message": "ci: VS Code extension tests with headless VS Code in CI (#67) (#68)\n\n- Extension test suite: 6 tests verifying all commands are registered\n- Uses @vscode/test-electron for headless VS Code in CI\n- xvfb-run for Linux display emulation\n- CI job runs after unit tests, builds rivet binary first\n\nRefs: REQ-007\n\nCo-authored-by: Test <test@test.com>\nCo-authored-by: Claude Opus 4.6 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-03-21T21:31:06+01:00",
          "tree_id": "2a817cca3546bb745ae5cfa99f9d25191feae265",
          "url": "https://github.com/pulseengine/rivet/commit/67a1f2880464eb04f1da29843edebf23c44dca66"
        },
        "date": 1774125913572,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 78395,
            "range": "± 235",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 824706,
            "range": "± 9554",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 10173102,
            "range": "± 787802",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2265,
            "range": "± 59",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25448,
            "range": "± 187",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 378799,
            "range": "± 1965",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 94,
            "range": "± 6",
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
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 924875,
            "range": "± 25460",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 161403,
            "range": "± 6474",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1886786,
            "range": "± 15419",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 23556459,
            "range": "± 812862",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 41039,
            "range": "± 375",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 468657,
            "range": "± 2607",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 4801929,
            "range": "± 101683",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4329,
            "range": "± 164",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 59848,
            "range": "± 2438",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 771544,
            "range": "± 1935",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 60176,
            "range": "± 178",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 671481,
            "range": "± 4316",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7324848,
            "range": "± 131396",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 807,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7682,
            "range": "± 29",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 120765,
            "range": "± 690",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23971,
            "range": "± 107",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 168414,
            "range": "± 2629",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1494232,
            "range": "± 43129",
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
          "id": "ad82f4bdfd3d85b2d8472c9501fee1cd01defe4e",
          "message": "feat(lsp): salsa incremental validation + README rewrite for v0.2.0 (#69)\n\n1. Salsa incremental in LSP:\n   - Per-file tracking via salsa SourceFile inputs\n   - didSave updates only the changed file, salsa recomputes affected results\n   - didChange updates from editor buffer for instant feedback\n   - Hover/goto-def/completion query salsa DB (always current)\n   - New files auto-added to source set on save\n   - parse_artifacts now sets source_file for LSP diagnostic mapping\n   - load_schema_contents helper for feeding schemas to salsa\n\n2. README rewrite:\n   - Updated for v0.2.0 (was stuck at Phase 1)\n   - Features list: LSP, VS Code, Gherkin, baselines, AGENTS.md, 235+ Playwright\n   - Full CLI command table (20 commands)\n   - Dashboard capabilities documented\n   - VS Code extension section\n   - 447 artifacts dogfooding, 500+ tests\n   - Updated PulseEngine nav (Spar, Etch, Meld)\n\nImplements: FEAT-047\nSatisfies: REQ-029\n\nCo-authored-by: Test <test@test.com>\nCo-authored-by: Claude Opus 4.6 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-03-21T22:15:29+01:00",
          "tree_id": "a113c5b545d25142ecfcb40a1e6c4df8a79591ad",
          "url": "https://github.com/pulseengine/rivet/commit/ad82f4bdfd3d85b2d8472c9501fee1cd01defe4e"
        },
        "date": 1774129090236,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 76220,
            "range": "± 714",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 850099,
            "range": "± 11148",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13454657,
            "range": "± 586875",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1716,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 19324,
            "range": "± 41",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 365850,
            "range": "± 1545",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 87,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/1000",
            "value": 87,
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
            "value": 840535,
            "range": "± 3124",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 160500,
            "range": "± 422",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1853842,
            "range": "± 6859",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 37024255,
            "range": "± 1976722",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 35923,
            "range": "± 116",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 416797,
            "range": "± 1351",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 5616597,
            "range": "± 294230",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3951,
            "range": "± 9",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 41569,
            "range": "± 119",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 787810,
            "range": "± 3612",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 54289,
            "range": "± 123",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 589182,
            "range": "± 1963",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8000223,
            "range": "± 437428",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 611,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 5097,
            "range": "± 10",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 151962,
            "range": "± 4770",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21052,
            "range": "± 72",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 147746,
            "range": "± 450",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1359993,
            "range": "± 34877",
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
          "id": "5ee0838b65855ef9ebffdc7c0d2d5de31798c489",
          "message": "docs(vscode): add extension README + icon (#70)\n\n- README with features, settings, commands, development guide\n- SVG + PNG icon (traceability link diagram with Catppuccin colors)\n- Ready for marketplace preview — user testing before publish\n\nRefs: FEAT-057\n\nCo-authored-by: Test <test@test.com>\nCo-authored-by: Claude Opus 4.6 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-03-21T22:22:40+01:00",
          "tree_id": "fe5884b822b6d1e19b342a0230a79601bf82443a",
          "url": "https://github.com/pulseengine/rivet/commit/5ee0838b65855ef9ebffdc7c0d2d5de31798c489"
        },
        "date": 1774129252199,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 76192,
            "range": "± 464",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 845960,
            "range": "± 5127",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12467898,
            "range": "± 597880",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1663,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 19376,
            "range": "± 108",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 346026,
            "range": "± 1426",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 87,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/1000",
            "value": 87,
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
            "value": 841202,
            "range": "± 3192",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 159229,
            "range": "± 355",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1827312,
            "range": "± 28186",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 34789797,
            "range": "± 1977065",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 39184,
            "range": "± 142",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 412891,
            "range": "± 1284",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 5526790,
            "range": "± 174169",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3927,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 40249,
            "range": "± 177",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 758693,
            "range": "± 3963",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 53134,
            "range": "± 177",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 568651,
            "range": "± 3212",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7173704,
            "range": "± 404731",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 611,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 5135,
            "range": "± 50",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 139605,
            "range": "± 766",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21001,
            "range": "± 46",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 146772,
            "range": "± 508",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1359377,
            "range": "± 15672",
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
          "id": "d468440637469de164cb04ca15576b04657825c5",
          "message": "fix(ci): RUSTSEC-2026-0049 + Playwright strict mode + TEST coverage + STPA update (#71)\n\nCI fixes:\n- rustls-webpki 0.103.9 → 0.103.10 (RUSTSEC-2026-0049 CRL matching)\n- stpa.spec.ts: use getByRole(\"heading\") to avoid sr-only caption clash\n- aadl.spec.ts: handle contains + allocated-from links in ARCH-SYS-001\n\nTEST coverage (19% → 44%):\n- TEST-016 through TEST-035 covering dashboard, commits, cross-repo,\n  conditional rules, impact, sphinx-needs, test scanner, build-system,\n  salsa, CLI mutations, markdown, HTML export, CI, Playwright, LSP,\n  Gherkin, AADL, STPA-Sec, SCORE\n\nSTPA update for v0.2.0 features:\n- H-19 (LSP stale validation), H-20 (WebView postMessage)\n- SC-21 (500ms re-validate SLA), SC-22 (WebView sandbox)\n- UCA-C-26/27, CC-C-26/27, LS-L-4/5 for LSP + WebView\n- SH-7 + SSC-7 (STPA-Sec: LSP non-project file injection)\n\n479 artifacts, PASS, 0 warnings.\n\nFixes: FEAT-001\nRefs: REQ-014\n\nCo-authored-by: Test <test@test.com>\nCo-authored-by: Claude Opus 4.6 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-03-22T06:03:41+01:00",
          "tree_id": "00bfaa1cf7d547ce978a19f07d5e84092ae08edb",
          "url": "https://github.com/pulseengine/rivet/commit/d468440637469de164cb04ca15576b04657825c5"
        },
        "date": 1774156192254,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 78435,
            "range": "± 3232",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 818300,
            "range": "± 9861",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 9763312,
            "range": "± 229920",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2280,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26369,
            "range": "± 244",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 378789,
            "range": "± 2898",
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
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 925186,
            "range": "± 7302",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 163851,
            "range": "± 768",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1873299,
            "range": "± 15257",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 23168035,
            "range": "± 582181",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 42217,
            "range": "± 193",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 464751,
            "range": "± 3103",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 4781669,
            "range": "± 34555",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4440,
            "range": "± 17",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 59191,
            "range": "± 393",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 776389,
            "range": "± 4526",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 62414,
            "range": "± 1262",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 692168,
            "range": "± 4790",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7439756,
            "range": "± 74569",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 799,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7400,
            "range": "± 82",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 117841,
            "range": "± 4514",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 24063,
            "range": "± 197",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 166722,
            "range": "± 1068",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1505046,
            "range": "± 9848",
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
          "id": "c61a307fbb1ea266d4eb01be692f38aa9b1fe6c5",
          "message": "feat: export parity, WebView bridge, CI hardening (#72)\n\n1. Export parity (source + results pages):\n   - source.html: artifact source file browser with per-file grouping\n   - results.html: test results with summary stats or empty-state help\n   - Nav bar updated across all export pages\n   - 8 new export tests\n\n2. Dashboard-to-editor WebView bridge:\n   - Dashboard detects iframe context, sends postMessage on artifact click\n   - VS Code extension intercepts and opens artifact source file in editor\n   - grep-based artifact location (no external dependency)\n\n3. CI hardening:\n   - Mutation testing: hard gate (zero surviving mutants, like spar)\n   - Security audit: cargo audit directly (no GitHub check-run permission)\n   - VS Code extension: package-lock.json for npm ci\n   - rustls-webpki 0.103.10 in Cargo.lock (RUSTSEC-2026-0049)\n\nImplements: FEAT-057\nRefs: REQ-007\n\nCo-authored-by: Test <test@test.com>\nCo-authored-by: Claude Opus 4.6 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-03-22T06:51:48+01:00",
          "tree_id": "17a0ece1bf0defb0c89821be50396f56b5146ae3",
          "url": "https://github.com/pulseengine/rivet/commit/c61a307fbb1ea266d4eb01be692f38aa9b1fe6c5"
        },
        "date": 1774162445095,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 79190,
            "range": "± 1147",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 843376,
            "range": "± 6236",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12932372,
            "range": "± 910146",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2206,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25999,
            "range": "± 166",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 371249,
            "range": "± 2038",
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
            "value": 912754,
            "range": "± 6829",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 169301,
            "range": "± 408",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1985021,
            "range": "± 10282",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 30798087,
            "range": "± 3198392",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 42549,
            "range": "± 111",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 480580,
            "range": "± 7233",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 5379180,
            "range": "± 174157",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4370,
            "range": "± 40",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 61708,
            "range": "± 298",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 778173,
            "range": "± 5965",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 59756,
            "range": "± 239",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 678163,
            "range": "± 3158",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8011455,
            "range": "± 317657",
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
            "value": 7249,
            "range": "± 52",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 117641,
            "range": "± 872",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 24899,
            "range": "± 247",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 168662,
            "range": "± 1666",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1532376,
            "range": "± 28572",
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
          "id": "1d83426c5ea802eba4e8248e4c19665c66491305",
          "message": "fix: gitignore vscode-rivet/node_modules (#73)\n\nTrace: skip\n\nCo-authored-by: Test <test@test.com>",
          "timestamp": "2026-03-22T06:53:15+01:00",
          "tree_id": "c330e8d4664d04b65bcc167319a61f9531b7327d",
          "url": "https://github.com/pulseengine/rivet/commit/1d83426c5ea802eba4e8248e4c19665c66491305"
        },
        "date": 1774162716137,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 75446,
            "range": "± 224",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 848014,
            "range": "± 3951",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12053034,
            "range": "± 508321",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1722,
            "range": "± 12",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 19334,
            "range": "± 343",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 377375,
            "range": "± 4589",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 89,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/1000",
            "value": 89,
            "range": "± 0",
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
            "value": 844218,
            "range": "± 3441",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 158448,
            "range": "± 301",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1880004,
            "range": "± 11756",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 35144980,
            "range": "± 1942748",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 38617,
            "range": "± 60",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 412822,
            "range": "± 1705",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 5109803,
            "range": "± 115326",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4437,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 40479,
            "range": "± 119",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 778875,
            "range": "± 7496",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 54783,
            "range": "± 285",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 596028,
            "range": "± 14907",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7274026,
            "range": "± 266828",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 638,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 5179,
            "range": "± 17",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 141842,
            "range": "± 1326",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21424,
            "range": "± 68",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 152046,
            "range": "± 336",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1420444,
            "range": "± 9468",
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
          "id": "b8030f1d4e580c4b8db59f332ed13aebbcd5ad0c",
          "message": "fix(vscode): TypeScript compilation errors + bundle rivet binary in VSIX (#74)\n\n- Fix Mocha import (default import for ESM compat)\n- Fix glob import (named import for v11)\n- Fix workspaceRoot undefined reference in WebView bridge\n- Include bin/ in VSIX (was excluded by .vscodeignore)\n- VSIX now bundles rivet binary for self-contained install\n\nTrace: skip\n\nCo-authored-by: Test <test@test.com>",
          "timestamp": "2026-03-22T07:22:11+01:00",
          "tree_id": "142ae87fb7709f025cbbfd9b9ed33507665af691",
          "url": "https://github.com/pulseengine/rivet/commit/b8030f1d4e580c4b8db59f332ed13aebbcd5ad0c"
        },
        "date": 1774165048417,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 74661,
            "range": "± 283",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 844611,
            "range": "± 4816",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13490733,
            "range": "± 656919",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1689,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 19265,
            "range": "± 34",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 348943,
            "range": "± 1141",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 87,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/1000",
            "value": 89,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 89,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 850662,
            "range": "± 12465",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 157966,
            "range": "± 282",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1835573,
            "range": "± 15839",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 31893123,
            "range": "± 2297226",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 39007,
            "range": "± 71",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 403183,
            "range": "± 943",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 5334285,
            "range": "± 277638",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3892,
            "range": "± 11",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 42087,
            "range": "± 175",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 754581,
            "range": "± 2730",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 54446,
            "range": "± 817",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 585742,
            "range": "± 2878",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 6849506,
            "range": "± 185126",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 633,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 5143,
            "range": "± 12",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 135952,
            "range": "± 967",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21070,
            "range": "± 84",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 152068,
            "range": "± 1663",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1419768,
            "range": "± 9739",
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
          "id": "fe97b81155946ef2cdf6ae85bdb9b7bd65f4251e",
          "message": "fix(vscode): open dashboard in browser instead of WebView iframe (#75)\n\nVS Code WebViews can't access localhost (sandbox blocks local-network).\nChanged dashboard commands to open in the default browser via\nvscode.env.openExternal. The LSP still runs in-editor for diagnostics,\nhover, goto-def, and completions.\n\nTrace: skip\n\nCo-authored-by: Test <test@test.com>",
          "timestamp": "2026-03-22T07:26:13+01:00",
          "tree_id": "4dcf9f16ea51adeed2282e61573935bd9a19192c",
          "url": "https://github.com/pulseengine/rivet/commit/fe97b81155946ef2cdf6ae85bdb9b7bd65f4251e"
        },
        "date": 1774165565683,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 77996,
            "range": "± 363",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 814811,
            "range": "± 5117",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12918835,
            "range": "± 1513482",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2230,
            "range": "± 12",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26378,
            "range": "± 213",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 381502,
            "range": "± 4779",
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
            "range": "± 1",
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
            "value": 935267,
            "range": "± 4716",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 164071,
            "range": "± 374",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1902257,
            "range": "± 18479",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 27522455,
            "range": "± 1709752",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 32375,
            "range": "± 89",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 461481,
            "range": "± 9022",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 4700759,
            "range": "± 90266",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4379,
            "range": "± 101",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60107,
            "range": "± 323",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 773217,
            "range": "± 2585",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 63218,
            "range": "± 360",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 685197,
            "range": "± 2818",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7728566,
            "range": "± 430814",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 808,
            "range": "± 27",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7375,
            "range": "± 26",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 108100,
            "range": "± 815",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23319,
            "range": "± 93",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 161386,
            "range": "± 2565",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1496691,
            "range": "± 23943",
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
          "id": "0551da4f5d6abd06faf6c00cbd2a288ce26f9da5",
          "message": "fix(vscode): inline dashboard WebView via asExternalUri (#76)\n\nUses vscode.env.asExternalUri() to map localhost to a VS Code-accessible\nURI, enabling the dashboard to render inline in a WebView panel instead\nof opening in the browser.\n\nTrace: skip\n\nCo-authored-by: Test <test@test.com>",
          "timestamp": "2026-03-22T07:35:54+01:00",
          "tree_id": "89d78fca79620562b27407c6bd5a5f3cefe60aef",
          "url": "https://github.com/pulseengine/rivet/commit/0551da4f5d6abd06faf6c00cbd2a288ce26f9da5"
        },
        "date": 1774166295029,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 78022,
            "range": "± 526",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 831601,
            "range": "± 6422",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 11831545,
            "range": "± 830080",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2151,
            "range": "± 11",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24914,
            "range": "± 251",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 373462,
            "range": "± 2306",
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
            "value": 916876,
            "range": "± 3880",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 162119,
            "range": "± 2687",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1862289,
            "range": "± 14932",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 26881969,
            "range": "± 1282012",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 33294,
            "range": "± 130",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 461219,
            "range": "± 2043",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 4862451,
            "range": "± 241503",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4407,
            "range": "± 16",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 61057,
            "range": "± 460",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 773073,
            "range": "± 18927",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 60071,
            "range": "± 234",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 687561,
            "range": "± 3074",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7818228,
            "range": "± 184794",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 805,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7226,
            "range": "± 98",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 105043,
            "range": "± 2063",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 24099,
            "range": "± 298",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 167232,
            "range": "± 3172",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1499330,
            "range": "± 20778",
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
          "id": "38faa8811791736350e78728d28eb330abd9f289",
          "message": "fix(vscode): handle SSH Remote + LSP crash gracefully (#77)\n\n- Platform-aware binary lookup (bin/{platform}-{arch}/rivet)\n- Falls back to PATH when bundled binary doesn't match remote arch\n- client.stop() errors caught (prevents crash loop on startFailed)\n- deactivate() handles already-stopped client\n\nFor SSH Remote: install rivet on the remote host via cargo install rivet-cli\n\nTrace: skip\n\nCo-authored-by: Test <test@test.com>",
          "timestamp": "2026-03-22T07:42:39+01:00",
          "tree_id": "fb22f3c5571af461191432e2e70591daaf44d37d",
          "url": "https://github.com/pulseengine/rivet/commit/38faa8811791736350e78728d28eb330abd9f289"
        },
        "date": 1774167810818,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 78471,
            "range": "± 2541",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 818058,
            "range": "± 5258",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 11858834,
            "range": "± 904555",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2172,
            "range": "± 10",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26718,
            "range": "± 192",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 382710,
            "range": "± 1504",
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
            "value": 901217,
            "range": "± 7933",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 161216,
            "range": "± 1107",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1843392,
            "range": "± 33852",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 26525485,
            "range": "± 2665711",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 41212,
            "range": "± 197",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 469639,
            "range": "± 1606",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 4773008,
            "range": "± 180005",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4366,
            "range": "± 10",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60617,
            "range": "± 732",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 786507,
            "range": "± 3348",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 65648,
            "range": "± 692",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 725140,
            "range": "± 2739",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7957113,
            "range": "± 222575",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 784,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7156,
            "range": "± 24",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 112262,
            "range": "± 914",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23293,
            "range": "± 1327",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 163913,
            "range": "± 1430",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1501551,
            "range": "± 25665",
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
          "id": "7f225aa20e119b26a948a2c60de47752760ff777",
          "message": "fix(vscode): set LSP working directory + better error diagnostics (#78)\n\n- LSP server options include cwd set to workspace root\n- Error messages show which binary path was tried\n- Console logging for successful LSP start and failure details\n\nTrace: skip\n\nCo-authored-by: Test <test@test.com>",
          "timestamp": "2026-03-22T07:53:38+01:00",
          "tree_id": "8eafcd013768a57e41d77e323e1ffc101c63657d",
          "url": "https://github.com/pulseengine/rivet/commit/7f225aa20e119b26a948a2c60de47752760ff777"
        },
        "date": 1774168601831,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 78925,
            "range": "± 370",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 830203,
            "range": "± 9488",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14994922,
            "range": "± 854182",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2230,
            "range": "± 19",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25350,
            "range": "± 140",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 383884,
            "range": "± 3714",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 96,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/1000",
            "value": 96,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 98,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 919928,
            "range": "± 7178",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 164511,
            "range": "± 860",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1932157,
            "range": "± 26507",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 39866882,
            "range": "± 2103434",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 40438,
            "range": "± 255",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 469050,
            "range": "± 3673",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 6193187,
            "range": "± 554826",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4290,
            "range": "± 15",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 61823,
            "range": "± 489",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 876320,
            "range": "± 130522",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 60602,
            "range": "± 579",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 684928,
            "range": "± 17126",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 10253288,
            "range": "± 498133",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 812,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7190,
            "range": "± 34",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 106735,
            "range": "± 1365",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23564,
            "range": "± 205",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 163797,
            "range": "± 1297",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1512989,
            "range": "± 42862",
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
          "id": "6234da2a26dbff23c4091f0f89aadc3a88f6e69f",
          "message": "feat(vscode): native sidebar tree view + embed mode for WebView (#79)\n\nVS Code extension now feels native:\n- Sidebar tree view in activity bar with Rivet icon\n- 11 navigation items: Stats, Artifacts, Validation, STPA, Graph,\n  Documents, Matrix, Coverage, Source, Results, Help\n- Clicking a tree item opens the content in the WebView panel\n- ?embed=1 mode strips sidebar/context bar from serve output\n- embed_layout function: minimal HTML with HTMX, no navigation chrome\n- WebView shows just content; sidebar handles navigation\n\nImplements: FEAT-057\nRefs: REQ-007\n\nCo-authored-by: Test <test@test.com>\nCo-authored-by: Claude Opus 4.6 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-03-22T08:16:03+01:00",
          "tree_id": "cafa195c3c2cb4f083074c84088223cce082c913",
          "url": "https://github.com/pulseengine/rivet/commit/6234da2a26dbff23c4091f0f89aadc3a88f6e69f"
        },
        "date": 1774169607733,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 78973,
            "range": "± 728",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 832827,
            "range": "± 5078",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 10692628,
            "range": "± 902148",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2224,
            "range": "± 12",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25889,
            "range": "± 255",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 381777,
            "range": "± 74827",
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
            "value": 926531,
            "range": "± 20169",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 164086,
            "range": "± 1196",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1874525,
            "range": "± 9510",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 23470722,
            "range": "± 816347",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 32995,
            "range": "± 146",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 456922,
            "range": "± 4046",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 4690395,
            "range": "± 50794",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4355,
            "range": "± 38",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 59774,
            "range": "± 280",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 771675,
            "range": "± 2747",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 59907,
            "range": "± 230",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 671489,
            "range": "± 21602",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7316442,
            "range": "± 628636",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 784,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7509,
            "range": "± 25",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 109957,
            "range": "± 8427",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23370,
            "range": "± 136",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 161939,
            "range": "± 2162",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1500260,
            "range": "± 41912",
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
          "id": "6191693ae58a40bb986dddd863ce48a630fe3ae3",
          "message": "fix(vscode): prefer PATH binary over bundled for SSH Remote compat (#80)\n\nPATH lookup first ensures the correct-arch binary is used when\nrunning via VS Code SSH Remote. Bundled binary is fallback only.\n\nTrace: skip\n\nCo-authored-by: Test <test@test.com>",
          "timestamp": "2026-03-22T08:22:38+01:00",
          "tree_id": "f67a0870c66d6e907c3b2d5e888dd6a832509d3b",
          "url": "https://github.com/pulseengine/rivet/commit/6191693ae58a40bb986dddd863ce48a630fe3ae3"
        },
        "date": 1774170081176,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 78286,
            "range": "± 787",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 837720,
            "range": "± 5689",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 17167430,
            "range": "± 712359",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2196,
            "range": "± 22",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26465,
            "range": "± 160",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 374708,
            "range": "± 27667",
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
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 928734,
            "range": "± 7254",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 162021,
            "range": "± 1272",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1849125,
            "range": "± 26208",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 44721016,
            "range": "± 1956987",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 40767,
            "range": "± 158",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 462049,
            "range": "± 3334",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 6785350,
            "range": "± 558880",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4313,
            "range": "± 126",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 62514,
            "range": "± 1539",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 824747,
            "range": "± 16047",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 62010,
            "range": "± 377",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 687395,
            "range": "± 5849",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 11233606,
            "range": "± 275540",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 795,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7165,
            "range": "± 95",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 111367,
            "range": "± 1374",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23527,
            "range": "± 172",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 163585,
            "range": "± 1699",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1507669,
            "range": "± 23506",
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
          "id": "178c35cc9ae0fad378e2f9d3d039630f1de4db29",
          "message": "fix(vscode): remove TransportKind.stdio — was adding --stdio flag (#81)\n\nvscode-languageclient adds --stdio to the command args when\nTransportKind.stdio is explicitly set. rivet lsp doesn't accept that\nflag. Removing it makes the client use stdio by default without the flag.\n\nTrace: skip\n\nCo-authored-by: Test <test@test.com>",
          "timestamp": "2026-03-22T08:34:57+01:00",
          "tree_id": "14d19ee1aced9857a30084b711c100dd1a1e31f4",
          "url": "https://github.com/pulseengine/rivet/commit/178c35cc9ae0fad378e2f9d3d039630f1de4db29"
        },
        "date": 1774170586473,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 78472,
            "range": "± 1090",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 817641,
            "range": "± 4815",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 9971064,
            "range": "± 491429",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2191,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25670,
            "range": "± 189",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 361592,
            "range": "± 956",
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
            "value": 910929,
            "range": "± 7698",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 162473,
            "range": "± 412",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1872123,
            "range": "± 21744",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 23769781,
            "range": "± 506632",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 40618,
            "range": "± 254",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 459764,
            "range": "± 2360",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 4864352,
            "range": "± 449256",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4295,
            "range": "± 11",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 61627,
            "range": "± 705",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 780094,
            "range": "± 4904",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 60495,
            "range": "± 156",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 670638,
            "range": "± 2720",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7388507,
            "range": "± 63423",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 792,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7166,
            "range": "± 49",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 112536,
            "range": "± 1608",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22929,
            "range": "± 93",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 162593,
            "range": "± 773",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1490495,
            "range": "± 22182",
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
          "id": "3552fcb3ab8c7fc2d898344535869569467b356a",
          "message": "fix: LSP parses STPA files + monochrome activity bar icon (#82)\n\n1. LSP salsa DB: detect STPA files by filename and use stpa-yaml adapter.\n   Fixes 237→479 artifacts loaded.\n2. Monochrome activity bar icon (shield + link nodes).\n\nFixes: FEAT-057\n\nCo-authored-by: Test <test@test.com>",
          "timestamp": "2026-03-22T09:06:33+01:00",
          "tree_id": "8060c8b214b4f4adb48ca06c67cf7b25f4e70b00",
          "url": "https://github.com/pulseengine/rivet/commit/3552fcb3ab8c7fc2d898344535869569467b356a"
        },
        "date": 1774171294021,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 79351,
            "range": "± 703",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 829435,
            "range": "± 20733",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 15671892,
            "range": "± 960597",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2167,
            "range": "± 9",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 27280,
            "range": "± 233",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 383272,
            "range": "± 2342",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 94,
            "range": "± 2",
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
            "value": 922074,
            "range": "± 4209",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 164915,
            "range": "± 1542",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1917848,
            "range": "± 11907",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 36357915,
            "range": "± 2810837",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 41861,
            "range": "± 112",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 462285,
            "range": "± 4291",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 6467331,
            "range": "± 570471",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4379,
            "range": "± 17",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 59222,
            "range": "± 294",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 784840,
            "range": "± 7276",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 60280,
            "range": "± 517",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 673480,
            "range": "± 4255",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 9206747,
            "range": "± 624832",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 837,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7446,
            "range": "± 42",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 112145,
            "range": "± 1760",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22508,
            "range": "± 142",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 155706,
            "range": "± 3296",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1443301,
            "range": "± 28559",
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
          "id": "890236297df00c5ad60abaa3951f7f4e07d84654",
          "message": "fix(serve): proper /embed/* path prefix for sidebar-free layout (#83)\n\nThe middleware now strips /embed prefix from the URI path before routing,\nso /embed/stats → embed_layout(stats_view), /embed/stpa → embed_layout(stpa_view).\nNo route duplication needed — same handlers, different layout wrapping.\n\nThis avoids the ?embed=1 query param which VS Code's asExternalUri\nURL-encodes to ?embed%3D1, breaking the middleware detection.\n\nVerified: /embed/stats returns 0 <nav> elements, /stats returns 1.\n\nAlso fixes CSP frame-src to use origin-only (no path+query).\n\nFixes: FEAT-057\n\nCo-authored-by: Test <test@test.com>",
          "timestamp": "2026-03-22T09:35:36+01:00",
          "tree_id": "864393d507a4f1d8db2b28a74c1513e725e91132",
          "url": "https://github.com/pulseengine/rivet/commit/890236297df00c5ad60abaa3951f7f4e07d84654"
        },
        "date": 1774172664447,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 77367,
            "range": "± 1219",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 820806,
            "range": "± 5107",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13054606,
            "range": "± 1090277",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2174,
            "range": "± 10",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26422,
            "range": "± 569",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 380442,
            "range": "± 4294",
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
            "value": 912413,
            "range": "± 12460",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 160389,
            "range": "± 999",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1841940,
            "range": "± 35618",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 28024491,
            "range": "± 2183624",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 40729,
            "range": "± 121",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 465412,
            "range": "± 9154",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 5383393,
            "range": "± 496714",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4323,
            "range": "± 21",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60071,
            "range": "± 343",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 791605,
            "range": "± 5374",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 58441,
            "range": "± 711",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 672127,
            "range": "± 2751",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8174208,
            "range": "± 347212",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 831,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7393,
            "range": "± 36",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 111570,
            "range": "± 4511",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22469,
            "range": "± 72",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 161329,
            "range": "± 712",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1449121,
            "range": "± 22148",
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
          "id": "53b322d818d74b9a446c85c28c4223f4ca9a016f",
          "message": "fix(vscode): use Simple Browser for SSH Remote port forwarding (#84)\n\nVS Code WebViews can't access remote localhost via iframe (asExternalUri\ndoesn't forward in SSH Remote context). Simple Browser handles port\nforwarding correctly as it's a built-in VS Code feature.\n\nTrace: skip\n\nCo-authored-by: Test <test@test.com>",
          "timestamp": "2026-03-22T09:43:42+01:00",
          "tree_id": "10fccfe01e14d45a5c89db1ce549acecb224e03a",
          "url": "https://github.com/pulseengine/rivet/commit/53b322d818d74b9a446c85c28c4223f4ca9a016f"
        },
        "date": 1774173077784,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 78838,
            "range": "± 693",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 825575,
            "range": "± 11444",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14725779,
            "range": "± 945330",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2217,
            "range": "± 10",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25474,
            "range": "± 426",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 372993,
            "range": "± 8010",
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
            "value": 916307,
            "range": "± 6580",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 161321,
            "range": "± 1298",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1898074,
            "range": "± 33537",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 33921963,
            "range": "± 4164272",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 41095,
            "range": "± 186",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 471286,
            "range": "± 3176",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 5216434,
            "range": "± 674094",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4385,
            "range": "± 28",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 70643,
            "range": "± 871",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 787188,
            "range": "± 14685",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 59748,
            "range": "± 707",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 687438,
            "range": "± 6805",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8886363,
            "range": "± 845965",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 833,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7598,
            "range": "± 117",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 110245,
            "range": "± 3322",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22621,
            "range": "± 288",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 157234,
            "range": "± 3428",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1449166,
            "range": "± 33570",
            "unit": "ns/iter"
          }
        ]
      }
    ]
  }
}