window.BENCHMARK_DATA = {
  "lastUpdate": 1773813247879,
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
          "id": "adcf0bc15c48f8d4c2fc9f0596c4ab1705a6db53",
          "message": "feat: phase 3 — 30+ features, 402 tests, formal verification (#28)\n\n* feat: phase 3 — 30+ features, 402 tests, formal verification (#27)\n\nCross-platform release workflow, PulseEngine dark theme HTML export,\nCLI mutation commands, conditional validation, MODULE.bazel parser,\nsalsa incremental database, Kani/Verus/Rocq formal specs, SCORE schema,\nsphinx-needs import, test scanner, change impact analysis, dashboard\nimprovements, WASM runtime wiring, compound graph layout, petgraph 0.7.\n\n344 artifacts, 402 tests, 71 features (68 approved), 100% traceability.\n\nCo-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>\n\n* feat: reusable compliance report GitHub Action\n\n.github/actions/compliance/action.yml — composite action that any project\ncan use to generate HTML compliance archives from rivet-managed artifacts.\n.github/workflows/compliance.yml — reusable workflow wrapper.\nUpdated release.yml to use the action instead of inline steps.\n\nUsage in any project:\n  - uses: pulseengine/rivet/.github/actions/compliance@main\n    with:\n      version: v0.1.0\n      homepage: https://example.com/projects/\n\nCo-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>\n\n* docs: compliance action README, rename version→report-label, pre-built binary download\n\nClarified all input names and descriptions. report-label is cosmetic\n(display only), rivet-version controls the tool. Added platform-aware\nbinary download for release tags, source build for dogfooding.\nFull README with examples: release, multi-version, reusable workflow.\n\nCo-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>\n\n---------\n\nCo-authored-by: Test <test@test.com>\nCo-authored-by: Claude Opus 4.6 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-03-15T19:21:21+01:00",
          "tree_id": "b2dc2ef76abadf869893fc41d00a4fddf96eb2b6",
          "url": "https://github.com/pulseengine/rivet/commit/adcf0bc15c48f8d4c2fc9f0596c4ab1705a6db53"
        },
        "date": 1773599287077,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 82225,
            "range": "± 1403",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 1160508,
            "range": "± 13664",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 48829220,
            "range": "± 998745",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2481,
            "range": "± 46",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 28206,
            "range": "± 1759",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 459404,
            "range": "± 855",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 114,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/1000",
            "value": 114,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 114,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 923800,
            "range": "± 4287",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 193161,
            "range": "± 1613",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 2225757,
            "range": "± 7100",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 28717399,
            "range": "± 1439517",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 43526,
            "range": "± 132",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 481654,
            "range": "± 1834",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 4960086,
            "range": "± 46097",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4449,
            "range": "± 18",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 59101,
            "range": "± 432",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 767090,
            "range": "± 1708",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 59321,
            "range": "± 196",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 660909,
            "range": "± 2457",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7133396,
            "range": "± 86353",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 834,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7745,
            "range": "± 237",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 107284,
            "range": "± 1410",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23013,
            "range": "± 76",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 160052,
            "range": "± 1446",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1497561,
            "range": "± 10413",
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
          "id": "1471ff695d150b0ec1177b4f8e51640b9d6a989b",
          "message": "fix: release workflow — macos-14 runner, remove --all-features (#29)\n\nCo-authored-by: Test <test@test.com>\nCo-authored-by: Claude Opus 4.6 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-03-15T19:40:44+01:00",
          "tree_id": "c8d6ad91a7524e64c3a432f9caa5e54da321ccf0",
          "url": "https://github.com/pulseengine/rivet/commit/1471ff695d150b0ec1177b4f8e51640b9d6a989b"
        },
        "date": 1773600421429,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 82135,
            "range": "± 301",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 1175977,
            "range": "± 19565",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 49282583,
            "range": "± 1338021",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2500,
            "range": "± 12",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 28862,
            "range": "± 175",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 444296,
            "range": "± 5189",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 114,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/1000",
            "value": 114,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 114,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 909835,
            "range": "± 4596",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 191420,
            "range": "± 419",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 2218153,
            "range": "± 26568",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 30910577,
            "range": "± 1928923",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 43229,
            "range": "± 215",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 487859,
            "range": "± 2466",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 5067821,
            "range": "± 137156",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4384,
            "range": "± 39",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 58866,
            "range": "± 710",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 778646,
            "range": "± 6313",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 62810,
            "range": "± 197",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 691251,
            "range": "± 2615",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7670619,
            "range": "± 337453",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 853,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7753,
            "range": "± 61",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 111256,
            "range": "± 914",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23526,
            "range": "± 193",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 160200,
            "range": "± 900",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1479453,
            "range": "± 12654",
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
          "id": "926bc8c6c8361d8bda143963215e0104a4cb487f",
          "message": "fix: remove --all-features from llvm-cov report (#30)\n\nCo-authored-by: Test <test@test.com>\nCo-authored-by: Claude Opus 4.6 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-03-15T19:56:18+01:00",
          "tree_id": "ed32aa949a4f27b2bf38307ee61667fb147fb5b0",
          "url": "https://github.com/pulseengine/rivet/commit/926bc8c6c8361d8bda143963215e0104a4cb487f"
        },
        "date": 1773601352656,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 82293,
            "range": "± 635",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 1183093,
            "range": "± 20474",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 56229972,
            "range": "± 1855864",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2405,
            "range": "± 9",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 28931,
            "range": "± 1568",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 439357,
            "range": "± 1539",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 115,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/1000",
            "value": 114,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 115,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 913102,
            "range": "± 12842",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 187693,
            "range": "± 2235",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 2263294,
            "range": "± 97920",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 59722868,
            "range": "± 1388689",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 43223,
            "range": "± 163",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 482468,
            "range": "± 2094",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 10865905,
            "range": "± 563708",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4359,
            "range": "± 25",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60907,
            "range": "± 693",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 795870,
            "range": "± 7671",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 61276,
            "range": "± 3074",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 691676,
            "range": "± 15821",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 12193597,
            "range": "± 161286",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 828,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7665,
            "range": "± 100",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 113360,
            "range": "± 2776",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23345,
            "range": "± 241",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 161427,
            "range": "± 5258",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1475872,
            "range": "± 38788",
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
          "id": "8b2d5c5250a419da11826df4656b213d2d415627",
          "message": "fix: full release workflow with spar WASM build (#31)\n\nProper multi-job release workflow:\n- build-binaries: 5 platforms with cross-compilation\n- build-compliance: HTML export via compliance action\n- build-test-evidence: clones spar, builds WASM, runs --all-features tests\n- create-release: collects all assets + SHA256SUMS\n\nCo-authored-by: Test <test@test.com>\nCo-authored-by: Claude Opus 4.6 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-03-15T21:00:27+01:00",
          "tree_id": "98beb53c68cb6e2bdd007c952f63044bc51d26de",
          "url": "https://github.com/pulseengine/rivet/commit/8b2d5c5250a419da11826df4656b213d2d415627"
        },
        "date": 1773605198363,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 82834,
            "range": "± 526",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 1177728,
            "range": "± 10110",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 52108103,
            "range": "± 1509384",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2374,
            "range": "± 15",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 29336,
            "range": "± 296",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 433256,
            "range": "± 2768",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 114,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/1000",
            "value": 114,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 114,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 904065,
            "range": "± 5213",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 193299,
            "range": "± 4217",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 2219000,
            "range": "± 8988",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 30633433,
            "range": "± 4088994",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 42681,
            "range": "± 584",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 480232,
            "range": "± 2431",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 4905919,
            "range": "± 173854",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4519,
            "range": "± 17",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60838,
            "range": "± 226",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 802184,
            "range": "± 6199",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 61909,
            "range": "± 372",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 685792,
            "range": "± 5113",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7406505,
            "range": "± 150686",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 802,
            "range": "± 30",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7752,
            "range": "± 55",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 115960,
            "range": "± 1269",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23049,
            "range": "± 104",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 159996,
            "range": "± 1078",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1469864,
            "range": "± 23237",
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
          "id": "4dfb4e9183eafabe709df294f4f9b7799de9f0ba",
          "message": "fix: drop --workspace from llvm-cov report (#32)\n\nTested locally:\n  cargo llvm-cov report           → works\n  cargo llvm-cov report --workspace → error: not supported for subcommand 'report'\n\nCo-authored-by: Test <test@test.com>\nCo-authored-by: Claude Opus 4.6 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-03-15T21:20:26+01:00",
          "tree_id": "2f7426e0aa9685c9acd9477780b67dc197b8ee29",
          "url": "https://github.com/pulseengine/rivet/commit/4dfb4e9183eafabe709df294f4f9b7799de9f0ba"
        },
        "date": 1773606400643,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 82258,
            "range": "± 245",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 1168825,
            "range": "± 155288",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 46085580,
            "range": "± 1000454",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2446,
            "range": "± 12",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 30029,
            "range": "± 2449",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 459314,
            "range": "± 627",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 116,
            "range": "± 18",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/1000",
            "value": 114,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 114,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 902483,
            "range": "± 3668",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 194528,
            "range": "± 660",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 2170118,
            "range": "± 25096",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 27590430,
            "range": "± 1892984",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 35899,
            "range": "± 125",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 479994,
            "range": "± 5224",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 5068512,
            "range": "± 122954",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4446,
            "range": "± 159",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60618,
            "range": "± 256",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 772401,
            "range": "± 1373",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 60545,
            "range": "± 474",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 665738,
            "range": "± 3361",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7314448,
            "range": "± 79498",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 846,
            "range": "± 25",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7537,
            "range": "± 37",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 116237,
            "range": "± 1528",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 24120,
            "range": "± 116",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 165610,
            "range": "± 1051",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1476659,
            "range": "± 38963",
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
          "id": "4e34c0ca06e6c33df976a49317ee585c62af7aa7",
          "message": "chore: bump to 0.2.0-dev, audit artifacts (#33)\n\n- Version: 0.1.0 → 0.2.0-dev\n- Promoted 17 requirements from draft to approved (REQ-005..036)\n- Promoted FEAT-061 (yaml_edit) to approved\n- Created FEAT-062 (export document pages), FEAT-063 (version switcher)\n- Added descriptions to 8 artifacts missing them\n- Closed issue #21 (build-system validation — implemented)\n- 346 artifacts, 0 warnings, 71/73 features approved, 33/36 reqs approved\n\nRemaining draft: REQ-006 (OSLC), REQ-022 (WASM embed), REQ-030 (formal proofs),\nFEAT-011 (OSLC client), FEAT-020 (AADL browser rendering)\n\nCo-authored-by: Test <test@test.com>\nCo-authored-by: Claude Opus 4.6 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-03-16T07:09:38+01:00",
          "tree_id": "b5e7571257a9bdec50888c02f67b238364de518d",
          "url": "https://github.com/pulseengine/rivet/commit/4e34c0ca06e6c33df976a49317ee585c62af7aa7"
        },
        "date": 1773641756704,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 82200,
            "range": "± 755",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 1187776,
            "range": "± 45200",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 55068840,
            "range": "± 2987998",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2312,
            "range": "± 37",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 30739,
            "range": "± 450",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 444529,
            "range": "± 6039",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 112,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/1000",
            "value": 112,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 112,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 923996,
            "range": "± 5448",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 194426,
            "range": "± 2388",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 2158795,
            "range": "± 83015",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 42080535,
            "range": "± 7589839",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 35748,
            "range": "± 348",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 487818,
            "range": "± 3013",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 6401858,
            "range": "± 1624095",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4365,
            "range": "± 13",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60292,
            "range": "± 322",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 808491,
            "range": "± 67706",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 61246,
            "range": "± 446",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 689084,
            "range": "± 4619",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 9123355,
            "range": "± 1554944",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 827,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7948,
            "range": "± 53",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 112323,
            "range": "± 1309",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23500,
            "range": "± 255",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 158839,
            "range": "± 1061",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1485066,
            "range": "± 26811",
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
          "id": "7a06ac5c2c1c80244836e2b32ca2b6d0fb75f46e",
          "message": "feat: v0.2.0-dev — security hardening, STPA-Sec, code quality (#34)\n\n* chore: v0.2.0 planning — 4 analysis docs, FEAT-020 promoted, AADL init fix\n\nPlan docs:\n- rowan-salsa-completion: 4-phase LSP-ready migration (22 work items)\n- formal-verification-completion: 37 proofs, Kani CI ready\n- coverage-gap-analysis: STPA gaps (23 new artifacts needed)\n- oslc-analysis: deprioritize OSLC, focus on ReqIF + needs.json\n\nFEAT-020 promoted to approved — Playwright verified AADL rendering.\nFixed initAadlDiagrams DOMContentLoaded trigger.\n\nCo-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>\n\n* docs: STPA-Sec analysis — 5 new hazards, 15 UCAs, XSS/supply chain findings\n\nFresh STPA + STPA-Sec analysis identifying:\n- H-13: XSS via unescaped artifact content in dashboard/export\n- H-14: WASM adapter supply chain (untrusted code)\n- H-15: Commit traceability false positives\n- H-16: Dashboard stale data after reload failure\n- H-17: git clone code execution via rivet.yaml\n- 5 new system constraints (SC-15..19)\n- 15 new UCAs + 14 loss scenarios\n- OSLC lifecycle gap check results\n- Critical: no CSP header, no WASM signature verification\n\nCo-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>\n\n* feat: STPA-Sec artifacts — 5 hazards, 15 UCAs, 13 loss scenarios, security hardening docs\n\nNew STPA analysis for v0.2.0 security hardening:\n- H-13..H-17: XSS, WASM supply chain, commit false positives, stale dashboard, git hooks\n- SC-15..SC-19: HTML escaping, WASM validation, ID store check, reload reporting, hook disable\n- 15 UCAs (UCA-D-3..D-4, UCA-C-18..C-25, UCA-L-6..L-7)\n- 13 loss scenarios (LS-C-5..C-15, LS-D-3, LS-L-3)\n- 13 controller constraints\n- Architecture section 8.8: Security Hardening\n- Verification section 12: STPA-Sec Test Requirements\n- 5 REQ→SC links for security constraints\n- 395 artifacts, PASS, 0 warnings\n\nImplements: SC-15, SC-16, SC-17, SC-18, SC-19\nCo-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>\n\n* feat: security hardening — CSP, markdown sanitization, git hooks, WASM validation + code quality\n\nSecurity (S1-S4):\n- CSP header on all dashboard responses\n- Markdown raw HTML filtering (strips <script>, <iframe>, etc.)\n- git clone --config core.hooksPath=/dev/null on all sync operations\n- WASM adapter output validation (empty ID/type rejection, HTML stripping)\n\nCode quality (Q3 partial):\n- ProjectContext consolidation in main.rs\n\n408 tests, 0 failures.\n\nImplements: SC-15, SC-16, SC-17, SC-18, SC-19\nCo-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>\n\n---------\n\nCo-authored-by: Test <test@test.com>\nCo-authored-by: Claude Opus 4.6 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-03-16T20:02:18+01:00",
          "tree_id": "030339e14493633313d82773eefec44a941d3f89",
          "url": "https://github.com/pulseengine/rivet/commit/7a06ac5c2c1c80244836e2b32ca2b6d0fb75f46e"
        },
        "date": 1773688116787,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 82381,
            "range": "± 1802",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 1177492,
            "range": "± 57320",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 46482752,
            "range": "± 870075",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2391,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 28441,
            "range": "± 313",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 443121,
            "range": "± 18586",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 113,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/1000",
            "value": 113,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 114,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 926335,
            "range": "± 4826",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 191840,
            "range": "± 654",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 2176162,
            "range": "± 88547",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 26668420,
            "range": "± 3482798",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 43300,
            "range": "± 284",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 485326,
            "range": "± 3119",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 4987336,
            "range": "± 137765",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4330,
            "range": "± 97",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 61541,
            "range": "± 836",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 786676,
            "range": "± 15308",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 60797,
            "range": "± 1127",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 676614,
            "range": "± 2991",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7393545,
            "range": "± 412256",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 781,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7387,
            "range": "± 88",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 115636,
            "range": "± 6263",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23357,
            "range": "± 94",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 163559,
            "range": "± 6347",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1471975,
            "range": "± 18381",
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
          "id": "08284a89dfa7ebbee28a98b6aa2439510d7ae0b8",
          "message": "fix: Mermaid diagram rendering in HTML export (#35)\n\n* chore: v0.2.0 planning — 4 analysis docs, FEAT-020 promoted, AADL init fix\n\nPlan docs:\n- rowan-salsa-completion: 4-phase LSP-ready migration (22 work items)\n- formal-verification-completion: 37 proofs, Kani CI ready\n- coverage-gap-analysis: STPA gaps (23 new artifacts needed)\n- oslc-analysis: deprioritize OSLC, focus on ReqIF + needs.json\n\nFEAT-020 promoted to approved — Playwright verified AADL rendering.\nFixed initAadlDiagrams DOMContentLoaded trigger.\n\nCo-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>\n\n* docs: STPA-Sec analysis — 5 new hazards, 15 UCAs, XSS/supply chain findings\n\nFresh STPA + STPA-Sec analysis identifying:\n- H-13: XSS via unescaped artifact content in dashboard/export\n- H-14: WASM adapter supply chain (untrusted code)\n- H-15: Commit traceability false positives\n- H-16: Dashboard stale data after reload failure\n- H-17: git clone code execution via rivet.yaml\n- 5 new system constraints (SC-15..19)\n- 15 new UCAs + 14 loss scenarios\n- OSLC lifecycle gap check results\n- Critical: no CSP header, no WASM signature verification\n\nCo-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>\n\n* feat: STPA-Sec artifacts — 5 hazards, 15 UCAs, 13 loss scenarios, security hardening docs\n\nNew STPA analysis for v0.2.0 security hardening:\n- H-13..H-17: XSS, WASM supply chain, commit false positives, stale dashboard, git hooks\n- SC-15..SC-19: HTML escaping, WASM validation, ID store check, reload reporting, hook disable\n- 15 UCAs (UCA-D-3..D-4, UCA-C-18..C-25, UCA-L-6..L-7)\n- 13 loss scenarios (LS-C-5..C-15, LS-D-3, LS-L-3)\n- 13 controller constraints\n- Architecture section 8.8: Security Hardening\n- Verification section 12: STPA-Sec Test Requirements\n- 5 REQ→SC links for security constraints\n- 395 artifacts, PASS, 0 warnings\n\nImplements: SC-15, SC-16, SC-17, SC-18, SC-19\nCo-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>\n\n* feat: security hardening — CSP, markdown sanitization, git hooks, WASM validation + code quality\n\nSecurity (S1-S4):\n- CSP header on all dashboard responses\n- Markdown raw HTML filtering (strips <script>, <iframe>, etc.)\n- git clone --config core.hooksPath=/dev/null on all sync operations\n- WASM adapter output validation (empty ID/type rejection, HTML stripping)\n\nCode quality (Q3 partial):\n- ProjectContext consolidation in main.rs\n\n408 tests, 0 failures.\n\nImplements: SC-15, SC-16, SC-17, SC-18, SC-19\nCo-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>\n\n* fix: add Mermaid CDN to HTML export for diagram rendering\n\nMermaid diagrams in exported documents were rendered as raw text\nbecause no Mermaid JS was included. Now loads mermaid@11 from CDN\nwith dark theme and strict security. Skipped in --offline mode.\n\nCo-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>\n\n---------\n\nCo-authored-by: Test <test@test.com>\nCo-authored-by: Claude Opus 4.6 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-03-16T20:06:36+01:00",
          "tree_id": "0a267fad1141c43332a1edf1ab2339a356bd9b35",
          "url": "https://github.com/pulseengine/rivet/commit/08284a89dfa7ebbee28a98b6aa2439510d7ae0b8"
        },
        "date": 1773688363523,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 83372,
            "range": "± 389",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 1237195,
            "range": "± 19489",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 51230693,
            "range": "± 1610516",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2398,
            "range": "± 9",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 27857,
            "range": "± 135",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 448975,
            "range": "± 2727",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 113,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/1000",
            "value": 113,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 113,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 914863,
            "range": "± 10580",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 188070,
            "range": "± 878",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 2151419,
            "range": "± 13442",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 29208713,
            "range": "± 1415509",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 35630,
            "range": "± 251",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 492435,
            "range": "± 4224",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 5138067,
            "range": "± 130349",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4374,
            "range": "± 175",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 59054,
            "range": "± 660",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 779602,
            "range": "± 2025",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 60736,
            "range": "± 248",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 672943,
            "range": "± 2192",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7656022,
            "range": "± 617099",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 800,
            "range": "± 9",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7438,
            "range": "± 35",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 107107,
            "range": "± 819",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22602,
            "range": "± 100",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 158311,
            "range": "± 1207",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1441878,
            "range": "± 50694",
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
          "id": "73f40553173781112551dee1d4fc38c083943da2",
          "message": "feat(etch): port-aware layout, orthogonal routing, interactive HTML (#37)\n\n* test(serve): comprehensive Playwright E2E test suite — 53 tests\n\n8 spec files covering:\n- routes.spec.ts: smoke test 21 dashboard routes (HTTP 200, valid HTML)\n- navigation.spec.ts: direct URL, back/forward, reload button\n- artifacts.spec.ts: filter/sort/pagination via URL params\n- stpa.spec.ts: hierarchy, H-13 presence, filter bar, fold/unfold\n- graph.spec.ts: SVG rendering, focus, node budget\n- print-mode.spec.ts: ?print=1 strips nav/HTMX\n- url-state.spec.ts: filter/sort/page state survives reload\n- validation.spec.ts: severity filter, text search\n\nCI integration: Playwright job in ci.yml with Chromium, artifact upload.\n\nVerifies: FEAT-052\nRefs: REQ-007, SC-15\n\nCo-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>\n\n* feat(etch): port-aware layout, orthogonal routing, interactive HTML\n\nMajor etch rendering upgrade with three capabilities:\n\nPort-aware layout (RENDER-REQ-002):\n- PortInfo, PortSide, PortDirection, PortType data model\n- position_ports() with side-aware placement and auto-resolution\n- Node height grows for port count, edge-to-port snapping\n- SVG rendering: circles, direction triangles, type colors\n\nOrthogonal edge routing (RENDER-REQ-001):\n- ortho.rs: visibility-graph A* router with obstacle avoidance\n- EdgeRouting::Orthogonal (default) vs CubicBezier (legacy)\n- SVG polyline L commands for axis-aligned segments\n\nInteractive HTML wrapper (RENDER-REQ-003, 005, 006):\n- html.rs + embedded JS: pan, zoom, selection, group highlight\n- Semantic zoom CSS classes, URL ?highlight= deep linking\n- Zero external dependencies\n\nBackward compatible: ports/source_port/target_port default to empty/None.\n\nTrace: skip\n\nCo-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>\n\n---------\n\nCo-authored-by: Test <test@test.com>\nCo-authored-by: Claude Opus 4.6 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-03-17T21:05:14+01:00",
          "tree_id": "1fb32b13cdb6a3d6953b5c899c80df40a2cfb095",
          "url": "https://github.com/pulseengine/rivet/commit/73f40553173781112551dee1d4fc38c083943da2"
        },
        "date": 1773778314204,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84151,
            "range": "± 1898",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 1246673,
            "range": "± 21168",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 57382065,
            "range": "± 1618076",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2324,
            "range": "± 10",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 29916,
            "range": "± 182",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 437119,
            "range": "± 2814",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 111,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/1000",
            "value": 113,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 114,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 920388,
            "range": "± 10896",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 192269,
            "range": "± 1392",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 2168213,
            "range": "± 15962",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 39100800,
            "range": "± 4611439",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 35796,
            "range": "± 188",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 490857,
            "range": "± 1935",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 5446388,
            "range": "± 407815",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4482,
            "range": "± 43",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 61102,
            "range": "± 354",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 800562,
            "range": "± 4965",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 61792,
            "range": "± 228",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 707531,
            "range": "± 3733",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8690845,
            "range": "± 362287",
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
            "value": 7585,
            "range": "± 49",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 106829,
            "range": "± 1072",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22189,
            "range": "± 361",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 153744,
            "range": "± 5492",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1431994,
            "range": "± 21038",
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
          "id": "79a1b57c7403d35d5c2a0d83f9d74c23a1f62376",
          "message": "feat: dashboard component kit — serve.rs split, print mode, reusable components (#40)\n\nSplit monolithic serve.rs (8359 lines) into serve/ module directory:\n- mod.rs (811) — AppState, router, middleware, utilities\n- styles.rs (646) — CSS constant\n- js.rs (1193) — GRAPH_JS, SEARCH_JS, AADL_JS\n- layout.rs (264) — page_layout + print_layout\n- views.rs (5534) — all view handlers\n- components.rs (522) — reusable UI kit with 16 unit tests\n\nComponent kit: ViewParams, FilterBar, SortableTable, Pagination,\nCollapsibleTree — all URL-param-aware for state persistence.\n\nPrint mode: ?print=1 strips nav/context bar/HTMX for clean output.\nPrint button added to context bar.\n\nAlso fix pre-commit hooks: +stable for clippy, remove invalid --strict\nflag from validate hook.\n\nImplements: FEAT-052\nRefs: DD-005\n\nCo-authored-by: Test <test@test.com>\nCo-authored-by: Claude Opus 4.6 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-03-18T06:47:42+01:00",
          "tree_id": "a9e1e07742ab8c8157365e8b3522f6e8404ac666",
          "url": "https://github.com/pulseengine/rivet/commit/79a1b57c7403d35d5c2a0d83f9d74c23a1f62376"
        },
        "date": 1773813247574,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84945,
            "range": "± 429",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 1248013,
            "range": "± 23473",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 52763767,
            "range": "± 1243524",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2422,
            "range": "± 13",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 30313,
            "range": "± 349",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 436503,
            "range": "± 2002",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 113,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/1000",
            "value": 113,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 113,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 953518,
            "range": "± 4236",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 188941,
            "range": "± 913",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 2143532,
            "range": "± 6642",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 26852481,
            "range": "± 4082338",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 43924,
            "range": "± 207",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 488465,
            "range": "± 2016",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 4974714,
            "range": "± 45977",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4562,
            "range": "± 34",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60808,
            "range": "± 248",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 786748,
            "range": "± 5337",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 62134,
            "range": "± 285",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 679404,
            "range": "± 2513",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7353638,
            "range": "± 40267",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 788,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7565,
            "range": "± 118",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 129881,
            "range": "± 870",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22554,
            "range": "± 131",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 156853,
            "range": "± 776",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1433140,
            "range": "± 28677",
            "unit": "ns/iter"
          }
        ]
      }
    ]
  }
}