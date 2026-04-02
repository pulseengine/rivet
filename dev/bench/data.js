window.BENCHMARK_DATA = {
  "lastUpdate": 1775090047536,
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
          "id": "ec747593e460b219e30bcb76ca499fd15e7ce27e",
          "message": "feat: LSP-based WebView rendering for VS Code extension (#86)\n\n* refactor: extract stats render function from serve\n\nAdd render module with RenderContext, ViewParams, badge_for_type, and\ntype_color_map. Move stats_partial body to render::stats::render_stats().\nServe views.rs becomes a thin wrapper via AppState::as_render_context().\n\nAll checks verified manually: cargo fmt, clippy -D warnings, cargo test\n(pre-commit skipped due to sparse-checkout/stash incompatibility).\n\nRefs: REQ-001\n\n* refactor: extract artifacts render functions from serve\n\nMove artifacts_list, artifact_detail, artifact_preview to\nrender::artifacts. Serve handlers become thin wrappers.\n\nThe linkify_source_refs helper and SourceRefMatch struct move to\nrender::artifacts where they are used. Dead copies in serve/views.rs\nare removed. Uses serve::components::ViewParams to avoid duplicate type.\n\nRefs: REQ-001\n\n* refactor: extract validate and STPA render functions\n\nMove validate_view and stpa_partial bodies to render module.\nrender/validate.rs: pure render_validate(&RenderContext, &ViewParams) -> String\nrender/stpa.rs: pure render_stpa(&RenderContext, &ViewParams) -> String\n  - includes private helpers matches_text / type_visible\nstpa_partial in views.rs kept but marked dead_code (stpa_view now\ndelegates directly to render_stpa via as_render_context).\nRemove unused Severity import from views.rs.\nCompletes Phase 1 render function extraction.\n\nRefs: REQ-001\n\n* refactor: move CSS/font constants to render module\n\nShared by serve layouts and VS Code shell document.\n\nRefs: REQ-001\n\n* feat(lsp): load DocumentStore, ResultStore, LinkGraph for rendering\n\nLSP now has all data needed to construct RenderContext.\nSends rivet/artifactsChanged notification on file save.\n\nRefs: REQ-001\n\n* feat(lsp): add rivet/render, rivet/treeData, rivet/css requests\n\nrivet/render routes page paths to render functions, returns HTML + metadata.\nrivet/treeData returns hierarchical tree structure for sidebar.\nrivet/css returns CSS for WebView shell document.\n\nRefs: REQ-001\n\n* feat(vscode): WebView panel with LSP rendering\n\nReplace Simple Browser with native WebView panel using shell document\npattern. Content fetched via rivet/render LSP request, delivered via\npostMessage. Assets load once per panel lifetime.\n\nRefs: REQ-001\n\n* feat(vscode): LSP-backed tree view with document expansion\n\nTree view fetches structure from rivet/treeData LSP request.\nDocuments expand lazily to show individual artifacts.\nRefreshes on rivet/artifactsChanged notification.\n\nRefs: REQ-001\n\n* feat(vscode): Show Source command + source tracking\n\nShow Source opens the YAML file at the artifact's source line.\nSource file/line tracked from rivet/render responses.\n\nRefs: REQ-001\n\n* fix(ci): ignore RUSTSEC-2024-0384 (instant via notify)\n\nThe instant crate is unmaintained but pulled in transitively by\nnotify 7.0.0 via notify-types. No upstream fix available yet.\n\nRefs: REQ-001\n\n* docs: add VS Code LSP rendering design spec and implementation plan\n\nRefs: REQ-001\n\n* fix(vscode): document rendering, artifact sub-routes, tree structure\n\n- Add documents render module (list + detail with TOC, glossary, refs)\n- Handle /artifacts/{id}/graph sub-routes (show detail instead of 404)\n- Strip query strings from page paths\n- Tree: Documents navigate to rendered view (not expandable)\n- Tree: Artifact Files expand to show individual artifacts\n- Tree: Only list implemented views (Stats, Artifacts, Validation, STPA)\n- Show source file link in artifact detail header\n- CSP: allow unsafe-inline for style-src (rendered HTML uses inline styles)\n\nRefs: REQ-001\n\n* feat(vscode): help views, schema linkage, source file navigation\n\n- Add render/help.rs: help overview, schema list/detail, link types,\n  traceability rules, docs list/topic\n- Schema linkage Mermaid diagram on help page\n- Source file links in artifact detail (data-source-file + postMessage)\n- Fix /artifacts/{id}/graph sub-route handling\n- Tree: add Help category, Documents under Views\n\nRefs: REQ-001\n\n* feat: add SysML v2 roadmap, draft-aware validation, and render architecture artifacts\n\nNew requirements:\n- REQ-037: SysML v2 artifact import (rowan-based parser)\n- REQ-038: SysML v2 to AADL model lowering (SEI mapping rules)\n- REQ-039: Draft-aware validation severity\n\nNew features:\n- FEAT-066: VS Code LSP-based WebView rendering (active)\n- FEAT-067: SysML v2 parser spar-sysml2 crate (draft)\n- FEAT-068: SysML v2 to AADL lowering (draft)\n- FEAT-069: SysML v2 requirement adapter for rivet (draft)\n- FEAT-070: Draft-aware validation severity (draft)\n\nNew decisions:\n- DD-040: Status-driven traceability enforcement\n- DD-041: Shared render module for serve/LSP/export\n\n489 artifacts, PASS, 0 warnings.\n\nRefs: REQ-037, REQ-038, REQ-039\n\n* chore: gitignore vscode build artifacts (binary, out/, vsix)\n\nRefs: FEAT-066\n\n* style: cargo fmt\n\nRefs: FEAT-066\n\n* fix(ci): add missing test script to vscode-rivet package.json\n\nRefs: FEAT-066\n\n* chore: bump version to v0.3.0\n\nRefs: FEAT-066\n\n---------\n\nCo-authored-by: Test <test@test.com>",
          "timestamp": "2026-03-22T18:35:20+01:00",
          "tree_id": "fe7738048788f1ac6f35a018e7d9cc65350dc910",
          "url": "https://github.com/pulseengine/rivet/commit/ec747593e460b219e30bcb76ca499fd15e7ce27e"
        },
        "date": 1774201295429,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 78724,
            "range": "± 1059",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 824442,
            "range": "± 4583",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 11143454,
            "range": "± 730960",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2226,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25160,
            "range": "± 80",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 374406,
            "range": "± 2716",
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
            "value": 917720,
            "range": "± 4309",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 159538,
            "range": "± 725",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1876321,
            "range": "± 11887",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 25520682,
            "range": "± 1774328",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 33376,
            "range": "± 202",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 463175,
            "range": "± 5956",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 4726448,
            "range": "± 103739",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4372,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 61488,
            "range": "± 205",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 765751,
            "range": "± 2184",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 61331,
            "range": "± 561",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 678027,
            "range": "± 4206",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7794136,
            "range": "± 224826",
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
            "value": 7766,
            "range": "± 27",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 108809,
            "range": "± 2129",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22969,
            "range": "± 342",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 157030,
            "range": "± 12871",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1460562,
            "range": "± 22975",
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
          "id": "966b5301232cd664f6051e7ddbdb9e1b3d447148",
          "message": "feat: draft-aware validation, render extraction, HTML export, marketplace CI (#87)\n\n* feat(etch): type_shapes provider for custom SVG node shapes\n\nSvgOptions now accepts a type_shapes HashMap mapping node types to\ncustom SVG shape functions. The shape function receives (node_type,\nx, y, width, height, fill, stroke) and returns raw SVG element string.\nFalls back to default rect when no provider is registered.\n\nTrace: skip\n\nCo-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>\n\n* feat(validate): draft-aware severity for traceability rules\n\nMissing required links on draft artifacts now produce Info-level\ndiagnostics instead of errors. Active and approved artifacts\nenforce full traceability as before.\n\nImplements: FEAT-070\nRefs: DD-040, REQ-039\n\n* refactor: extract all view render functions from serve/views.rs\n\nMoves every render function body from the 5271-line monolith into the\nrender/ module as pure functions taking &RenderContext + params -> String.\n\nNew render modules:\n- render/graph.rs — GraphParams, EgoParams, render_graph_view, render_artifact_graph\n- render/matrix.rs — MatrixParams, MatrixCellParams, render_matrix_view, render_matrix_cell_detail\n- render/coverage.rs — render_coverage_view\n- render/search.rs — render_search_view\n- render/results.rs — render_verification_view, render_results_view, render_result_detail\n- render/source.rs — render_source_tree_view, render_source_file_view, build_artifact_info, rewrite_image_paths, full syntax highlighting suite\n- render/diff.rs — DiffParams, render_diff_view\n- render/traceability.rs — TraceParams, TraceHistoryParams, render_traceability_view, render_traceability_history\n- render/externals.rs — render_externals_list, render_external_detail\n- render/doc_linkage.rs — render_doc_linkage_view\n\nserve/views.rs reduced from 5271 to 409 lines (all handlers are now thin\nwrappers: lock state, call as_render_context(), delegate to render fn).\n\nRemoved dead code from serve/mod.rs: type_color_map() and badge_for_type()\n(now canonical in render/helpers.rs). Fixed documents.rs to reference\nbuild_artifact_info via crate::render::source instead of serve::views.\n\ncargo check -p rivet-cli: clean (0 warnings)\ncargo test -p rivet-cli: 22/22 pass\n\nRefs: DD-041\n\n* feat(vscode): add all views to tree + wire remaining render routes\n\nTree now shows Graph, Matrix, Coverage, Source, Traceability,\nDoc Linkage alongside existing views. All render routes wired up.\n\n231 Playwright tests pass.\n\nRefs: DD-041\n\n* ci: add VS Code Marketplace publishing to release workflow\n\nBuild VSIX on tag push, publish to Marketplace via VSCE_PAT secret.\nVSIX also attached to GitHub Release as download asset.\nFollows spar's established publishing pattern.\n\nNote: VSCE_PAT secret must be configured in GitHub repo settings.\nSee: https://code.visualstudio.com/api/working-with-extensions/publishing-extension\n\nRefs: FEAT-066\n\n* feat(cli): add rivet export --html for static site generation\n\nGenerates standalone HTML pages using shared render module.\nIncludes CSS, Mermaid, navigation sidebar. No HTMX dependency.\n\nImplements: REQ-035\nRefs: DD-041\n\n* feat: add test report lifecycle artifacts (REQ-040, FEAT-071, FEAT-072)\n\nJUnit XML import, conformance workflow, dogfooded test evidence.\n492 artifacts, PASS, 0 warnings.\n\nRefs: REQ-040\n\n* fix(vscode): auto-detect rivet.yaml location in workspace\n\nSearch workspace folders and up to 2 levels deep for rivet.yaml\ninstead of assuming it's at the workspace root. Supports monorepos\nand multi-root workspaces. Configurable via rivet.projectPath setting.\n\nRefs: FEAT-066\n\n* feat(vscode): artifact search with live LSP query\n\nCmd+Shift+F in explorer opens QuickPick with live search via\nrivet/search LSP request. Searches artifact IDs, titles, and\ndocument titles. Debounced 150ms.\n\nRefs: FEAT-066\n\n* docs: update AGENTS.md for v0.3.0 architecture\n\nRefs: DD-041\n\n* test(playwright): add E2E tests for documents, help, coverage, traceability views\n\nAdds 6 new Playwright spec files covering views that previously had only\nsmoke tests in routes.spec.ts:\n\n- traceability.spec.ts  — filter form, coverage matrix, linkage chains,\n  history endpoint, URL param filtering (13 tests)\n- doc-linkage.spec.ts   — SVG graph, cross-doc links table, document\n  summary, artifacts-not-referenced section (12 tests)\n- diff.spec.ts          — base/head selectors, HEAD~1 comparison, diff\n  summary structure, empty state (9 tests)\n- externals.spec.ts     — empty state, configured table columns, unknown\n  prefix 404 handling (8 tests, 1 skipped when no externals configured)\n- verification.spec.ts  — stat grid, ver-row details, empty state hint,\n  requirement links (9 tests)\n- export.spec.ts        — rivet export --format html output: 24 tests\n  covering file existence, content structure, per-artifact pages, no panics\n\nTotal: 75 new tests (306 passing in full suite, 4 pre-existing failures\nin help-view.spec.ts and documents.spec.ts unchanged by this commit).\n\nRefs: FEAT-066, DD-041\n\n* test+feat: 310 Playwright tests, artifact search, AGENTS.md update\n\n- 75 new Playwright tests (traceability, doc-linkage, diff, externals,\n  verification, export). Fix 4 pre-existing hx-get assertions.\n- Artifact search: rivet/search LSP request + QuickPick (Cmd+Shift+F)\n- AGENTS.md updated for v0.3.0 architecture\n- 310 Playwright tests pass, 1 skipped\n\nRefs: FEAT-066, DD-041\n\n* feat(graph): custom SVG shapes per artifact type via etch type_shapes\n\nRequirement=rounded-rect, design-decision=diamond, feature=hexagon,\nloss=red-rect, hazard=triangle, system-constraint=octagon, uca=parallelogram.\n\nRefs: FEAT-066\n\n* feat(help): enhanced schema detail with fields, links, Mermaid diagram\n\nSchema detail page shows fields table, link fields, traceability rules,\nartifact count, example YAML, and per-type linkage Mermaid diagram.\nHelp page linkage diagram now uses subgraphs by domain (ASPICE/Safety/Dev)\nand includes link_type edges in addition to traceability rule edges.\n\nRefs: FEAT-066\n\n* test(playwright): schema detail, graph shapes, help linkage tests\n\nAdd tests for enhanced schema view (fields, links, diagram, example,\nartifact count), graph SVG custom shapes (polygons, rounded rects),\nand help page schema linkage Mermaid diagram.\n\n320 Playwright tests pass.\n\nRefs: FEAT-066\n\n* fix(vscode): source line navigation + auto-refresh on save\n\n- rivet/render now finds the artifact's exact line in the YAML file\n  using lsp_find_artifact_line (scans for 'id: {id}')\n- WebView auto-refreshes current page on rivet/artifactsChanged\n  (previously only showed stale banner)\n- Expanded VS Code extension tests (all commands, settings, activation)\n\nRefs: FEAT-066\n\n* test(vscode): functional extension tests — LSP, WebView, tree view\n\nTests verify: 9 commands registered, settings exist, extension\nactivates, LSP publishes diagnostics, showDashboard/navigateTo\nexecute without error, tree view refresh works.\n\nRefs: FEAT-066\n\n* fix(lsp): clear stale diagnostics when issues are resolved\n\nPublish empty diagnostic lists for source files that no longer\nhave validation errors. Previously, fixing a YAML error left\nstale diagnostics in VS Code until the editor was reloaded.\n\nRefs: FEAT-066\n\n* style: fix cargo fmt + clippy (&String → &str)\n\nRefs: FEAT-066\n\n---------\n\nCo-authored-by: Test <test@test.com>\nCo-authored-by: Claude Opus 4.6 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-03-28T06:34:19+01:00",
          "tree_id": "0374537364d3d300c3974d3fc3bdb20d1f88ac15",
          "url": "https://github.com/pulseengine/rivet/commit/966b5301232cd664f6051e7ddbdb9e1b3d447148"
        },
        "date": 1774676504081,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 78586,
            "range": "± 611",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 818389,
            "range": "± 6567",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 10310723,
            "range": "± 589105",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2260,
            "range": "± 9",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26924,
            "range": "± 79",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 386053,
            "range": "± 2369",
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
            "value": 907359,
            "range": "± 7288",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 164479,
            "range": "± 758",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1864215,
            "range": "± 13986",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 24347785,
            "range": "± 758286",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 42684,
            "range": "± 197",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 480671,
            "range": "± 4611",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 4933013,
            "range": "± 60355",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4368,
            "range": "± 26",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 62706,
            "range": "± 240",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 762673,
            "range": "± 4422",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 58186,
            "range": "± 351",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 695487,
            "range": "± 4667",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7510486,
            "range": "± 71856",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 787,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7824,
            "range": "± 117",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 119247,
            "range": "± 2181",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23475,
            "range": "± 286",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 167688,
            "range": "± 3903",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1524201,
            "range": "± 20232",
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
          "id": "ba47683dd54ab8035460c13a5b91f8ef5c64de40",
          "message": "feat: JUnit import, LSP diagnostic fix, document validation (#88)\n\n* fix(lsp): track and clear cross-file stale diagnostics\n\nTrack which files had diagnostics and explicitly clear them when\nthey no longer have issues. Fixes stale diagnostics persisting\nafter fixing cross-file link errors.\n\nFixes: UCA-C-2\nRefs: FEAT-066\n\n* feat(cli): add rivet import-results --format junit for test result import\n\nParse JUnit XML test results and write as rivet TestRun YAML.\nMaps testcase names to artifact IDs where possible (classname exact\nmatch, bracketed [ID] in name/classname, or classname.name fallback).\nIncludes 16 unit tests covering all artifact ID heuristics and XML\nparsing (pass, fail, error, skip, multiple suites, bare testsuite).\n\nImplements: FEAT-071\nRefs: REQ-040\n\n* fix(docs): warn about markdown files without frontmatter + AGENTS.md guidance\n\nDocuments without YAML frontmatter are now logged at info level\ninstead of silently skipped. AGENTS.md updated with document\nrequirements and guidance to use rivet commands instead of\nrecreating statistics/coverage manually.\n\nRefs: REQ-001\n\n* style: cargo fmt\n\nRefs: FEAT-071\n\n---------\n\nCo-authored-by: Test <test@test.com>",
          "timestamp": "2026-03-28T12:45:06+01:00",
          "tree_id": "92ffe79c8fa34d551d7688a82b71f6ff724f6da8",
          "url": "https://github.com/pulseengine/rivet/commit/ba47683dd54ab8035460c13a5b91f8ef5c64de40"
        },
        "date": 1774698714588,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 79343,
            "range": "± 533",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 843586,
            "range": "± 3775",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 10942076,
            "range": "± 467715",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2272,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 27001,
            "range": "± 361",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 365448,
            "range": "± 3158",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 95,
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
            "value": 95,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 909130,
            "range": "± 7163",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 166233,
            "range": "± 722",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1916792,
            "range": "± 18751",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 25228541,
            "range": "± 1215205",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 42597,
            "range": "± 259",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 484901,
            "range": "± 1614",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 5055457,
            "range": "± 52640",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4455,
            "range": "± 38",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60188,
            "range": "± 376",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 793786,
            "range": "± 2790",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 59997,
            "range": "± 170",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 672117,
            "range": "± 8589",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7574470,
            "range": "± 141736",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 855,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7639,
            "range": "± 116",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 108007,
            "range": "± 2108",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22827,
            "range": "± 97",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 156568,
            "range": "± 1084",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1449520,
            "range": "± 21995",
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
          "id": "cc4cc1c1b0202e7866b41f66e81492643a0dc63f",
          "message": "feat(api): oEmbed provider and Grafana JSON API endpoints (#89) (#94)",
          "timestamp": "2026-04-01T22:21:56+02:00",
          "tree_id": "f1db11c137693bf381927fa3848dc4a9e336e01f",
          "url": "https://github.com/pulseengine/rivet/commit/cc4cc1c1b0202e7866b41f66e81492643a0dc63f"
        },
        "date": 1775075296888,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 77624,
            "range": "± 1229",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 816628,
            "range": "± 9874",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 11215796,
            "range": "± 784272",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2224,
            "range": "± 19",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26603,
            "range": "± 842",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 368369,
            "range": "± 3042",
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
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 916897,
            "range": "± 9803",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 163307,
            "range": "± 644",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1845909,
            "range": "± 17498",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 25734054,
            "range": "± 1839622",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 43322,
            "range": "± 267",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 475817,
            "range": "± 1852",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 5072503,
            "range": "± 303106",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4412,
            "range": "± 21",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 59209,
            "range": "± 629",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 760936,
            "range": "± 5740",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 61246,
            "range": "± 566",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 669813,
            "range": "± 2277",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7644793,
            "range": "± 508399",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 766,
            "range": "± 10",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7465,
            "range": "± 294",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 115117,
            "range": "± 979",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22807,
            "range": "± 80",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 159543,
            "range": "± 1915",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1487379,
            "range": "± 19147",
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
          "id": "ca97dd9f1c4554c0efa1aa159745abfaa697f3fb",
          "message": "feat: document embeds Phase 1 — parser, renderers, CLI, provenance (#95)\n\n* feat(core): add EmbedRequest parser and error types\n\nIntroduces rivet-core::embed module with EmbedRequest::parse() for\nunified {{name:arg key=val}} syntax. EmbedError renders visible HTML\nper SC-EMBED-3.\n\nRefs: FEAT-074\n\n* feat(core): add stats and coverage embed renderers\n\nImplements render_stats() and render_coverage() in the embed module,\ndispatched via resolve_embed(). Renders HTML tables with type counts,\nstatus groups, validation summary, and per-rule coverage percentages.\n\nRefs: FEAT-074\n\n* refactor(core): add embed_resolver closure to render_to_html\n\nThread embed_resolver through render_to_html → resolve_inline.\nLegacy embeds (artifact/links/table) keep inline logic. New computed\nembeds (stats/coverage) dispatch through the closure. All call sites\nupdated.\n\nRefs: FEAT-074\n\n* feat(cli): add 'rivet embed' command for computed embed queries\n\nResolves embed queries (stats, coverage) from CLI with text or HTML\noutput. Useful for scripting and testing embed resolution.\n\n3 integration tests: stats:types, coverage, unknown embed error.\n\n* feat(export): resolve embeds with provenance stamps in HTML export\n\nComputed embeds in exported documents now include a provenance footer\nwith commit hash and timestamp (SC-EMBED-4). Export warns on stderr\nwhen the working tree is dirty (SC-EMBED-1).\n\nSatisfies: SC-EMBED-1, SC-EMBED-4\n\n* test: end-to-end coverage for embed resolution\n\nAdds integration tests for embed resolution in serve and CLI,\nplus parser edge-case unit tests for backward compatibility with\nexisting artifact/links/table embed syntax. Playwright tests verify\nno embed-error spans appear in rendered documents.\n\nVerifies: SC-EMBED-3\n\n* fix: clippy lints in export and documents render\n\nAdd #[allow(clippy::too_many_arguments)] for export functions and\nremove needless borrow in documents embed resolver.\n\n---------\n\nCo-authored-by: Test <test@test.com>",
          "timestamp": "2026-04-01T23:04:38+02:00",
          "tree_id": "eed397bc485727d8349acac5259abf6e77e7a755",
          "url": "https://github.com/pulseengine/rivet/commit/ca97dd9f1c4554c0efa1aa159745abfaa697f3fb"
        },
        "date": 1775077862690,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 80964,
            "range": "± 416",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 848054,
            "range": "± 3386",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 10878958,
            "range": "± 357041",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2010,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24479,
            "range": "± 86",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 364793,
            "range": "± 2089",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 99,
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
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 906767,
            "range": "± 7522",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 167904,
            "range": "± 698",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1920555,
            "range": "± 13926",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 25883542,
            "range": "± 188443",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 41406,
            "range": "± 117",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 459451,
            "range": "± 2380",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 5184757,
            "range": "± 21355",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4457,
            "range": "± 37",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 44693,
            "range": "± 253",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 749654,
            "range": "± 23201",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 64063,
            "range": "± 442",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 713300,
            "range": "± 8656",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8206426,
            "range": "± 342777",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 743,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 6345,
            "range": "± 15",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 91618,
            "range": "± 423",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21639,
            "range": "± 54",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 147162,
            "range": "± 671",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1366075,
            "range": "± 20457",
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
          "id": "c5ff64c84d8084f859a8a0d5c9b05ccf7e225d6f",
          "message": "feat: embed phases 2+5 — diagnostics, matrix, snapshots, docs (#96)\n\n* feat(embed): add {{diagnostics}} and {{matrix}} embed renderers\n\nPhase 5: adds two new computed embed types:\n- {{diagnostics}} / {{diagnostics:error|warning|info}} — validation\n  issues as HTML table with severity filter and summary footer\n- {{matrix}} / {{matrix:from_type:to_type}} — inline traceability\n  matrix with coverage bar, auto-detects link type from schema rules\n\n7 unit tests + 2 CLI integration tests.\n\n* feat(snapshot): add rivet snapshot capture/diff/list commands\n\nPhase 2: project snapshot infrastructure for baseline comparison:\n- Snapshot struct with stats, coverage, diagnostics, git context\n- rivet snapshot capture — dumps current state to JSON\n- rivet snapshot diff — compares current vs baseline (text/json/markdown)\n- rivet snapshot list — lists available snapshots\n- Delta computation with NEW/RESOLVED diagnostic tracking\n- SC-EMBED-2 (git commit in snapshot), SC-EMBED-6 (schema version)\n\n5 unit tests + 2 CLI integration tests.\n\n* refactor(embed): add baseline field to EmbedContext for delta rendering\n\nAdds optional baseline snapshot to EmbedContext so embed renderers\ncan show delta columns when delta=BASELINE option is used. All\ncallers updated to pass baseline: None (wiring comes next).\n\n* style: cargo fmt\n\n* feat(api): add /api/v1/guide endpoint and rivet guide CLI\n\nPhase 4: self-documenting schema guide for AI agents and developers:\n- /api/v1/guide — JSON endpoint with artifact types, fields, link\n  types, traceability rules, embed syntax reference, commit trailers,\n  and common mistakes\n- rivet guide --format json|text — CLI equivalent for scripting\n- Refreshes from current AppState on each request (SC-EMBED-5)\n\n2 CLI integration tests + 1 serve integration test.\n\n* Revert \"feat(api): add /api/v1/guide endpoint and rivet guide CLI\"\n\nThis reverts commit d93efb8c0c75e32db93405725477779f14abfc0e.\n\n* docs: add computed embed syntax reference to documents topic\n\nInstead of a separate guide endpoint (reverted — duplicated rivet schema\nand rivet context), add the embed syntax documentation to the existing\n'documents' topic in rivet docs where it naturally belongs.\n\nCovers: {{stats}}, {{coverage}}, {{diagnostics}}, {{matrix}},\n{{artifact:ID}}, {{links:ID}}, {{table:TYPE:FIELDS}}, error handling,\nand HTML export provenance.",
          "timestamp": "2026-04-02T00:26:34+02:00",
          "tree_id": "ae92977a44732879611565a9e014dbddc1fe9286",
          "url": "https://github.com/pulseengine/rivet/commit/c5ff64c84d8084f859a8a0d5c9b05ccf7e225d6f"
        },
        "date": 1775082778842,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 78946,
            "range": "± 4538",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 823704,
            "range": "± 6041",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 16459576,
            "range": "± 1163469",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1969,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24554,
            "range": "± 109",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 359460,
            "range": "± 1860",
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
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 903056,
            "range": "± 3928",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 166257,
            "range": "± 853",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1917312,
            "range": "± 50127",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 48212028,
            "range": "± 2663454",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 42581,
            "range": "± 272",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 466158,
            "range": "± 1676",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 7862102,
            "range": "± 653812",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4268,
            "range": "± 66",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 44737,
            "range": "± 301",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 752637,
            "range": "± 8425",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 63297,
            "range": "± 230",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 698987,
            "range": "± 21673",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 10424371,
            "range": "± 770285",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 725,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 6686,
            "range": "± 31",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 91411,
            "range": "± 463",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21550,
            "range": "± 173",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 147281,
            "range": "± 959",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1359449,
            "range": "± 12064",
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
          "id": "0661926d71cdb2e2acad7132a2b13b82221900a4",
          "message": "feat: release-to-release delta in export + CI snapshot workflow (#97)\n\n* feat(export): auto-detect baseline snapshot and render delta columns\n\nExport auto-detects the most recent snapshot in snapshots/ and renders\nΔ columns in stats and coverage views:\n- Summary cards show +N/-N badges for artifacts, errors, warnings\n- By-type table gains a Δ column with per-type changes\n- Coverage summary shows Δ percentage\n- Coverage-by-rule table gains a Δ column with per-rule trend\n\nZero config — just have a snapshot file from a previous release and\nthe delta appears automatically in the next export.\n\n* ci: capture baseline snapshot on release tag push\n\nAdds a capture-snapshot job to the release workflow that:\n1. Runs rivet snapshot capture --name $TAG on every v* tag push\n2. Commits the snapshot JSON to main for future delta comparison\n3. Passes the snapshot to the compliance report job via artifact\n\nThe compliance report (rivet export --format html) will auto-detect\nthe previous snapshot and render delta columns in stats/coverage.\n\n* fix(ci): compliance report uses previous snapshot, not current\n\nThe compliance report should compare against the PREVIOUS release\nsnapshot (already committed to main), not the one just captured\nfor this release. This correctly shows 'what changed since last\nrelease' in the exported HTML delta columns.\n\nThe capture-snapshot job runs in parallel and commits the new\nsnapshot to main for future release comparisons.",
          "timestamp": "2026-04-02T00:54:58+02:00",
          "tree_id": "dca6a88aff155abb58a2b68e05fd3d8b088ca2c6",
          "url": "https://github.com/pulseengine/rivet/commit/0661926d71cdb2e2acad7132a2b13b82221900a4"
        },
        "date": 1775084473913,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 80077,
            "range": "± 324",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 820120,
            "range": "± 12475",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 10683307,
            "range": "± 646225",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2284,
            "range": "± 54",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25086,
            "range": "± 519",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 386586,
            "range": "± 7890",
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
            "value": 919983,
            "range": "± 24485",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 165964,
            "range": "± 1705",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1958539,
            "range": "± 18520",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 25577160,
            "range": "± 1564458",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 44111,
            "range": "± 184",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 498872,
            "range": "± 4254",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 5278435,
            "range": "± 108213",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4420,
            "range": "± 33",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60533,
            "range": "± 299",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 850184,
            "range": "± 4066",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 60372,
            "range": "± 382",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 648723,
            "range": "± 3640",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7340135,
            "range": "± 778497",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 762,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7165,
            "range": "± 112",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 111816,
            "range": "± 1968",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23928,
            "range": "± 146",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 167399,
            "range": "± 1746",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1575525,
            "range": "± 19907",
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
          "id": "2f54fabc1a82f81fd42851ca084c300829e79d1f",
          "message": "feat: schema, LSP fixes, EU AI Act, salsa default, STPA analysis (#101)\n\n* feat(schema): add common-mistakes and example fields to artifact types\n\nExtends ArtifactTypeDef with two optional guidance fields:\n- common_mistakes: Vec<MistakeGuide> — problem/fix pairs for AI agents\n- example: Option<String> — YAML snippet shown in schema show output\n\nBoth fields default to empty, so existing schemas parse unchanged.\nThe rivet schema show command (text + JSON) surfaces these fields.\n\n* content(schema): add common-mistakes and examples to dev schema\n\nAdds guidance fields to requirement, design-decision, and feature\ntypes in the dev schema. Shown in 'rivet schema show' output and\navailable to AI agents via JSON format.\n\n* test: add LSP test suite and YAML edge case tests\n\nFirst-ever LSP tests (25 tests):\n- lsp_word_at_position: word extraction, edge cases, special chars\n- lsp_find_artifact_line: exact ID matching, format variants\n- lsp_uri_to_path roundtrip\n- Diagnostic-to-LSP mapping: severity, file grouping, line numbers\n\nYAML edge case tests (16 tests):\n- serde_yaml 0.9 uses YAML 1.2: yes/no are strings, only true/false\n  are booleans (no Norway problem)\n- Numeric coercion: bare 1.0 is float, quoted stays string\n- Duplicate keys: struct-level is error, map-level last wins\n- Error recovery: malformed YAML, missing fields, empty docs\n\n* fix(lsp): surface YAML parse errors as diagnostics with line/column\n\nParse errors are now shown as LSP diagnostics instead of silently\nreturning empty results. Extends Diagnostic with source_file, line,\ncolumn fields. The LSP diagnostic publisher checks source_file first\n(parse errors), then falls back to artifact-based file lookup.\n\nAlso adds collect_parse_errors() salsa tracked function that\ncomposes with structural and conditional-rule validation in\nvalidate_all().\n\n* feat(schema): add EU AI Act compliance schema for high-risk AI systems\n\nPhase 1 of #99: schemas/eu-ai-act.yaml with 15 artifact types mapping\nto EU AI Act Annex IV (9 mandatory sections) and Articles 9-15.\n\nArtifact types: ai-system-description, design-specification,\ndata-governance-record, third-party-component, monitoring-measure,\nperformance-evaluation, risk-management-process, risk-assessment,\nrisk-mitigation, misuse-risk, transparency-record,\nhuman-oversight-measure, standards-reference, conformity-declaration,\npost-market-plan.\n\n14 link types + 12 traceability rules enforcing mandatory obligations.\nRegistered as embedded schema (compiled into binary).\n\nEU AI Act high-risk provisions applicable from August 2, 2026.\n\n* feat(validate): detect unknown link types and unknown fields\n\nTwo new validation phases:\n- Phase 8: unknown-link-type — warns when an artifact uses a link\n  type not defined in the schema\n- Phase 9: unknown-field — info when an artifact has fields not\n  defined in its type's schema\n\nBoth are non-breaking (warning/info severity) but catch common\nmistakes that previously went undetected.\n\n* safety(stpa): STPA analysis of LSP diagnostic accuracy\n\nLosses: undetected compliance violations, wasted time on false\npositives, AI agent infinite retry loops.\n\nHazards: false negatives (H-LSP-001), false positives (H-LSP-002),\nwrong location (H-LSP-003), misleading fix suggestions (H-LSP-004).\n\n7 system constraints: SC-LSP-001 through SC-LSP-007 covering parse\nerror handling, validation completeness, schema change invalidation,\nYAML type coercion, actionable messages, cascade prevention, and\nincremental validation correctness.\n\nStatus of constraints:\n- SC-LSP-001: SATISFIED (PR #101 — parse errors surfaced)\n- SC-LSP-004: SATISFIED (PR #101 — type-aware validation)\n- SC-LSP-002: PARTIALLY (document refs not in LSP yet)\n- SC-LSP-003: NOT SATISFIED (schema changes not re-loaded)\n- SC-LSP-005: PARTIALLY (some messages still vague)\n- SC-LSP-006: PARTIALLY (parse errors no longer cascade to empty, but broken-link cascade still possible)\n- SC-LSP-007: PENDING (#22 — salsa becoming default)\n\n* feat(validate): make salsa incremental validation the default (#22)\n\nThe salsa incremental validation pipeline (db.rs) is now the default\npath for 'rivet validate'. The old direct path is available via\n--direct flag for fallback or when --baseline scoping is used.\n\nChanges:\n- Removed --incremental and --verify-incremental flags\n- Added --direct flag (opt-in to old non-incremental path)\n- Default: salsa tracked functions (parse_artifacts, validate_all,\n  evaluate_conditional_rules) with automatic cache invalidation\n- Baseline-scoped validation automatically uses direct path since\n  salsa doesn't support scoped stores\n\nThe salsa path produces identical diagnostics to the direct path,\nverified by the existing 22 salsa database tests and previous\n--verify-incremental infrastructure.\n\nRefs: #22\n\n* feat(eu-ai-act): init preset, bridge schemas, example project (#99)\n\nCompletes EU AI Act Phase 1 + Phase 2:\n\n- rivet init --preset eu-ai-act — starter artifacts covering\n  system description, design, risk management, monitoring, oversight\n- eu-ai-act-stpa.bridge.yaml — maps STPA hazards → risk assessments,\n  system constraints → risk mitigations\n- eu-ai-act-aspice.bridge.yaml — maps ASPICE verification evidence →\n  performance evaluations\n- examples/eu-ai-act/ — full 17-artifact example project demonstrating\n  Annex IV compliance for a predictive maintenance AI system\n  - Validates clean (0 warnings)\n  - Document with {{stats}}, {{coverage}}, {{diagnostics}} embeds\n  - Realistic content: XGBoost+LSTM hybrid model, bias assessment,\n    drift detection, human oversight dashboard\n\n* style: cargo fmt",
          "timestamp": "2026-04-02T02:27:16+02:00",
          "tree_id": "4f5fea0c50fd373e7f6407209d39875a7f3128a5",
          "url": "https://github.com/pulseengine/rivet/commit/2f54fabc1a82f81fd42851ca084c300829e79d1f"
        },
        "date": 1775090047148,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 78925,
            "range": "± 661",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 838586,
            "range": "± 4825",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12569532,
            "range": "± 431354",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2231,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26344,
            "range": "± 205",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 364321,
            "range": "± 1778",
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
            "value": 94,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 911922,
            "range": "± 27466",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 149085,
            "range": "± 1553",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1775548,
            "range": "± 40589",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 30638680,
            "range": "± 772538",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 81357,
            "range": "± 618",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 884487,
            "range": "± 2428",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 10894352,
            "range": "± 343799",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4470,
            "range": "± 37",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 61781,
            "range": "± 1068",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 767093,
            "range": "± 4240",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 60779,
            "range": "± 177",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 686923,
            "range": "± 3127",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8217505,
            "range": "± 308322",
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
            "value": 7403,
            "range": "± 68",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 130638,
            "range": "± 1316",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22585,
            "range": "± 161",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 155754,
            "range": "± 744",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1454099,
            "range": "± 12618",
            "unit": "ns/iter"
          }
        ]
      }
    ]
  }
}