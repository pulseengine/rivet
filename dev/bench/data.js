window.BENCHMARK_DATA = {
  "lastUpdate": 1773599287917,
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
      }
    ]
  }
}