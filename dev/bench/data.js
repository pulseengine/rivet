window.BENCHMARK_DATA = {
  "lastUpdate": 1773605198781,
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
      }
    ]
  }
}