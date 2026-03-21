window.BENCHMARK_DATA = {
  "lastUpdate": 1774125913897,
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
          "id": "ac932f0bc9ff43da9310713122b2df179f288673",
          "message": "fix: cross-repo sync — git -c flag compatibility and better error messages (#41)\n\n1. Change git --config to git -c for hook protection. The --config\n   long flag requires git 2.32+, but -c works on all git versions.\n   This fixes CI failures on runners with older git.\n\n2. Better error messages when external artifacts aren't found:\n   - \"external project has no rivet.yaml\" with full path\n   - \"source does not exist at path\" with expected location\n   - \"loaded 0 artifacts\" warning with troubleshooting hint\n   - Info log with artifact count on successful load\n\nFixes: FEAT-034\nRefs: SC-19\n\nCo-authored-by: Test <test@test.com>\nCo-authored-by: Claude Opus 4.6 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-03-18T07:06:07+01:00",
          "tree_id": "7c7c7f124e54dcfad30b8b20fc2f03b63765b61b",
          "url": "https://github.com/pulseengine/rivet/commit/ac932f0bc9ff43da9310713122b2df179f288673"
        },
        "date": 1773814330106,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 83629,
            "range": "± 1115",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 1216202,
            "range": "± 58138",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 51815655,
            "range": "± 1187977",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2409,
            "range": "± 20",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 28392,
            "range": "± 146",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 449754,
            "range": "± 2285",
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
            "value": 113,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 918609,
            "range": "± 4090",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 192619,
            "range": "± 4126",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 2216273,
            "range": "± 8023",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 32017580,
            "range": "± 1801944",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 44840,
            "range": "± 390",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 495529,
            "range": "± 6916",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 5118452,
            "range": "± 378084",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4396,
            "range": "± 126",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 59577,
            "range": "± 1438",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 772611,
            "range": "± 7493",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 61214,
            "range": "± 222",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 684416,
            "range": "± 2085",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7644492,
            "range": "± 570635",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 775,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7347,
            "range": "± 49",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 116495,
            "range": "± 852",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 24039,
            "range": "± 98",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 170855,
            "range": "± 1162",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1589787,
            "range": "± 15248",
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
          "id": "18828a617c464282aad368df3bf721fa6a375672",
          "message": "feat: rivet add --link and --description flags (#42)\n\nAdd --link \"type:target\" flag for creating artifacts with links in one\ncommand. Eliminates the need for follow-up rivet link calls:\n\n  rivet add -t cybersecurity-req --title \"...\" \\\n    --link \"derives-from:CG-13\" --link \"derives-from:CG-9\" \\\n    --description \"Detailed requirement text\"\n\nMultiple --link flags allowed. Links validated against schema before\nwrite (same as rivet link command).\n\nAlso adds --description flag for setting description from CLI without\nneeding rivet modify or manual YAML editing.\n\nImplements: FEAT-054\nRefs: REQ-031\n\nCo-authored-by: Test <test@test.com>\nCo-authored-by: Claude Opus 4.6 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-03-18T07:17:10+01:00",
          "tree_id": "1dd36233b2a9730dd43a515d860c07dd2f24c434",
          "url": "https://github.com/pulseengine/rivet/commit/18828a617c464282aad368df3bf721fa6a375672"
        },
        "date": 1773815064097,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 83364,
            "range": "± 262",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 1204793,
            "range": "± 45015",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 50552536,
            "range": "± 1291576",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2335,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 29250,
            "range": "± 164",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 448920,
            "range": "± 1533",
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
            "value": 918656,
            "range": "± 4502",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 194129,
            "range": "± 2369",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 2195425,
            "range": "± 38802",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 28917890,
            "range": "± 1608692",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 43001,
            "range": "± 186",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 491367,
            "range": "± 1518",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 5051494,
            "range": "± 262682",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4402,
            "range": "± 18",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 59002,
            "range": "± 196",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 773745,
            "range": "± 3112",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 59609,
            "range": "± 324",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 668934,
            "range": "± 3249",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7559038,
            "range": "± 303622",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 775,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7411,
            "range": "± 39",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 119582,
            "range": "± 1349",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 24605,
            "range": "± 109",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 172635,
            "range": "± 1530",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1603840,
            "range": "± 34474",
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
          "id": "4cbe56a78225c0072eefe8c537e35fc79c1ca716",
          "message": "feat: batch mutations, JSON output, perf fix, cross-repo fix (#43)\n\n* fix: harden baseline tag git commands against inherited worktree env\n\nClear GIT_DIR and GIT_WORK_TREE environment variables in\ncheck_baseline_tag and list_baseline_tags so they target the\nspecified repo_dir rather than an enclosing worktree. Also isolate\ntest git commands with env_remove to prevent tag collisions when\ntests run inside a git worktree.\n\nCo-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>\n\n* feat(cli): add rivet batch command for atomic multi-mutation files (FEAT-055)\n\nAdd `rivet batch <file>` command that reads a YAML file containing\nmultiple mutations (add, link, modify) and applies them atomically.\nAll mutations are validated upfront before any file writes. Supports\n$prev variable substitution to reference the ID generated by the\npreceding add mutation, enabling chained artifact creation.\n\nCo-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>\n\n* feat(cli): enhance --format json output for validate and coverage (FEAT-056)\n\nAdd \"result\" field (\"PASS\"/\"FAIL\") to validate JSON output for both\nstandard and incremental pipelines. Restructure coverage JSON to use\n\"rules\" array with percentage fields and \"overall\" summary object,\nmatching the agent-consumable schema specification.\n\nCo-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>\n\n* fix: load external artifacts in ProjectContext for mutation commands\n\nProjectContext::load() now loads external project artifacts (prefixed\nwith their repo prefix) so rivet link and rivet add --link can resolve\ncross-repo references (e.g., sigil:L-7).\n\nFixes: FEAT-038\nRefs: REQ-020\n\nCo-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>\n\n* perf: optimize validate hot path — Copy severity, inline accessors, pre-size collections\n\n- Add Copy to Severity enum (eliminates clone overhead in validation loops)\n- Add #[inline] to hot accessors in store, schema, model, links\n- Pre-size HashMap and DiGraph with with_capacity(n) in LinkGraph::build()\n- Eliminate redundant schema.artifact_type() double-lookup per artifact\n- Defer ResolvedLink construction to the branch where it's used\n\nBenchmark improvement: validate/100 ~25-39% faster.\n\nRefs: REQ-013\n\nCo-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>\n\n---------\n\nCo-authored-by: Test <test@test.com>\nCo-authored-by: Claude Opus 4.6 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-03-18T08:50:28+01:00",
          "tree_id": "acb74d240afab8e55b2a58880efdebca57133e27",
          "url": "https://github.com/pulseengine/rivet/commit/4cbe56a78225c0072eefe8c537e35fc79c1ca716"
        },
        "date": 1773820604577,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 83850,
            "range": "± 657",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 1193867,
            "range": "± 32814",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 46879068,
            "range": "± 1595001",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2311,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 27405,
            "range": "± 252",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 395225,
            "range": "± 1462",
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
            "value": 909209,
            "range": "± 6087",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 167515,
            "range": "± 653",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1963170,
            "range": "± 20420",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 24504286,
            "range": "± 598676",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 42089,
            "range": "± 297",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 464366,
            "range": "± 2691",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 4857952,
            "range": "± 29936",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4334,
            "range": "± 45",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60765,
            "range": "± 251",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 772054,
            "range": "± 4698",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 62073,
            "range": "± 271",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 698358,
            "range": "± 3973",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7507049,
            "range": "± 112498",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 803,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7645,
            "range": "± 28",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 109098,
            "range": "± 1019",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22506,
            "range": "± 117",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 154382,
            "range": "± 1201",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1445498,
            "range": "± 16688",
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
          "id": "75521b85ad18e307903d0152f14775636235bc10",
          "message": "fix: replace git clone --config with compatible alternative in rivet sync (#44)\n\nUse shallow clones (--depth 1) with -b for branch/tag selection instead\nof cloning then checking out separately. For commit SHA refs, fall back\nto a full clone since -b does not accept SHAs. Adds --unshallow on fetch\nwhen the target ref is a SHA and the repo was previously shallow-cloned.\nThis avoids the --config flag which is not supported by all git versions.\n\nCo-authored-by: Claude Opus 4.6 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-03-18T23:44:16+01:00",
          "tree_id": "499096d57393f16352c57ed0adddacdad0061946",
          "url": "https://github.com/pulseengine/rivet/commit/75521b85ad18e307903d0152f14775636235bc10"
        },
        "date": 1773874733049,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84114,
            "range": "± 1096",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 1265749,
            "range": "± 37994",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 54915037,
            "range": "± 2015161",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2000,
            "range": "± 11",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 23907,
            "range": "± 53",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 373621,
            "range": "± 2026",
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
            "value": 910320,
            "range": "± 4649",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 159296,
            "range": "± 637",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1865373,
            "range": "± 15552",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 34641525,
            "range": "± 2138649",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 40108,
            "range": "± 86",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 444513,
            "range": "± 1508",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 5327444,
            "range": "± 475352",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4287,
            "range": "± 12",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 46065,
            "range": "± 168",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 772657,
            "range": "± 18676",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 66254,
            "range": "± 765",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 738407,
            "range": "± 3193",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 10296274,
            "range": "± 594940",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 725,
            "range": "± 10",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 6317,
            "range": "± 154",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 91014,
            "range": "± 564",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21787,
            "range": "± 66",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 147707,
            "range": "± 1026",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1374756,
            "range": "± 9097",
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
          "id": "fa77739658636a577db22c6d54c0b8d8703bf718",
          "message": "feat: agent ergonomics, STPA-Sec, cross-repo fixes, AADL compound layout, Playwright CI (#45)\n\n* fix: harden baseline tag git commands against inherited worktree env\n\nClear GIT_DIR and GIT_WORK_TREE environment variables in\ncheck_baseline_tag and list_baseline_tags so they target the\nspecified repo_dir rather than an enclosing worktree. Also isolate\ntest git commands with env_remove to prevent tag collisions when\ntests run inside a git worktree.\n\nCo-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>\n\n* feat(cli): add rivet batch command for atomic multi-mutation files (FEAT-055)\n\nAdd `rivet batch <file>` command that reads a YAML file containing\nmultiple mutations (add, link, modify) and applies them atomically.\nAll mutations are validated upfront before any file writes. Supports\n$prev variable substitution to reference the ID generated by the\npreceding add mutation, enabling chained artifact creation.\n\nCo-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>\n\n* feat(cli): enhance --format json output for validate and coverage (FEAT-056)\n\nAdd \"result\" field (\"PASS\"/\"FAIL\") to validate JSON output for both\nstandard and incremental pipelines. Restructure coverage JSON to use\n\"rules\" array with percentage fields and \"overall\" summary object,\nmatching the agent-consumable schema specification.\n\nCo-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>\n\n* fix: load external artifacts in ProjectContext for mutation commands\n\nProjectContext::load() now loads external project artifacts (prefixed\nwith their repo prefix) so rivet link and rivet add --link can resolve\ncross-repo references (e.g., sigil:L-7).\n\nFixes: FEAT-038\nRefs: REQ-020\n\nCo-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>\n\n* perf: optimize validate hot path — Copy severity, inline accessors, pre-size collections\n\n- Add Copy to Severity enum (eliminates clone overhead in validation loops)\n- Add #[inline] to hot accessors in store, schema, model, links\n- Pre-size HashMap and DiGraph with with_capacity(n) in LinkGraph::build()\n- Eliminate redundant schema.artifact_type() double-lookup per artifact\n- Defer ResolvedLink construction to the branch where it's used\n\nBenchmark improvement: validate/100 ~25-39% faster.\n\nRefs: REQ-013\n\nCo-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>\n\n* feat(stpa-sec): add STPA-Sec security analysis, V-model completeness, and STPA-Sec dashboard section\n\nSTPA-Sec (adversarial STPA) per Leveson & Thomas handbook §2.4–2.5:\n- schemas/stpa-sec.yaml: new schema extending stpa with sec-loss,\n  sec-hazard, sec-constraint, sec-uca, sec-scenario types; adds\n  cia-impact, attacker-type, attack-vector, adversarial-causation fields\n- safety/stpa-sec/: 5 losses, 6 hazards, 6 constraints, 7 UCAs, 7\n  scenarios covering supply-chain injection, OSLC MITM, XSS, YAML DoS,\n  URL hijack, and unauthenticated dashboard exposure\n- Dashboard: STPA-Sec hierarchy + UCA table rendered below STPA section\n  on /stpa page, color-coded red with attacker-type and attack-vector badges\n- docs/stpa-sec.md: dedicated security analysis document\n- docs/srs.md: V-model diagram and STPA-Sec section (§3.9)\n\nSelf-contained binary, V-model completeness, Playwright tests.\nTotal: 436 artifacts, validate: PASS 0 warnings\n\nImplements: FEAT-064\nSatisfies: REQ-016\n\nCo-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>\n\n* feat(cross-repo): fix link externals, add validate skip flag, sync --local, path resolution STPA\n\nFour cross-repo improvements implemented in parallel:\n\n1. rivet link with externals: validate_link() now recognizes prefixed\n   external artifact IDs (e.g., meld:SH-1) and allows linking to them\n   even when the external repo isn't cached locally.\n\n2. rivet validate --skip-external-validation: new flag skips cross-repo\n   validation checks (broken refs, backlinks, circular deps, version\n   conflicts) so repos with uncommitted bidirectional links can validate\n   independently during concurrent development.\n\n3. rivet sync --local: new flag forces path-based externals to use the\n   working tree directly, skipping git fetch/clone. Improved error\n   messages when external paths don't exist.\n\n4. STPA path resolution hazard: H-18 (fails to resolve external paths\n   across platforms) and SC-20 (must normalize and validate external\n   paths before use). Addresses the data sovereignty risk (L-1, L-3)\n   of silently broken cross-repo links.\n\nImplements: FEAT-054\nRefs: H-18\n\nCo-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>\n\n* feat: AADL compound graph layout, STPA/graph in HTML export, AADL Playwright tests\n\nThree improvements implemented in parallel:\n\n1. AADL compound layout in dashboard graph: aadl-component artifacts with\n   allocated-from links to other aadl-components now render as nested\n   containers via Etch's compound layout engine. LayoutOptions explicitly\n   sets container_padding and container_header.\n\n2. HTML export gains STPA + graph pages:\n   - stpa.html: STPA hierarchy (losses → hazards → constraints → UCAs)\n     plus STPA-Sec section with CIA impact badges\n   - graph.html: static SVG of full artifact graph via Etch layout engine\n     with type-colored nodes and legend\n   - Nav updated across all export pages\n   - 9 new export tests\n\n3. AADL Playwright tests (aadl.spec.ts): 15 tests covering artifact list\n   filtering, detail pages, allocated-from links, fields, diagram rendering,\n   source-ref links, stats, graph, matrix, source view, and search.\n\nImplements: FEAT-064\nRefs: ARCH-DASH-001\n\nCo-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>\n\n* ci: add Playwright E2E test job to CI pipeline\n\nAdds a Playwright job that runs after unit tests pass. Builds the\nrelease binary, installs Chromium via Playwright, starts rivet serve\non port 3003, and runs all *.spec.ts tests (self-contained, documents,\nAADL, navigation, graph, STPA, validation, routes, etc.).\n\nUploads test-results/ as artifact on failure for debugging.\n\nRefs: REQ-012\n\nCo-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>\n\n* fix(playwright): fix 4 pre-existing test failures in artifacts and STPA specs\n\nReplace tests that expected unmerged server-side filtering, pagination,\nand STPA filter bar features with tests matching the current dashboard:\n- artifacts: type badge, click-to-navigate instead of ?types=/?per_page=/?q=\n- stpa: STPA-Sec section visibility, CIA badges, security UCA table\n\n79/79 Playwright tests now pass.\n\nRefs: TEST-012\n\nCo-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>\n\n* fix(ci): increase serve integration test startup timeout for slow CI runners\n\nBumps server startup wait from 5s to 15s in serve_integration.rs.\nThe CSP header and reload tests were timing out on CI when running\nalongside PROPTEST_CASES=1000 extended property tests.\n\nRefs: REQ-012\n\nCo-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>\n\n---------\n\nCo-authored-by: Test <test@test.com>\nCo-authored-by: Claude Opus 4.6 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-03-19T20:31:38+01:00",
          "tree_id": "cd182c36b1432418351b30b614892b8450273d40",
          "url": "https://github.com/pulseengine/rivet/commit/fa77739658636a577db22c6d54c0b8d8703bf718"
        },
        "date": 1773949468849,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 83460,
            "range": "± 376",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 1238507,
            "range": "± 24565",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 54863686,
            "range": "± 2133972",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2198,
            "range": "± 9",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26574,
            "range": "± 922",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 388493,
            "range": "± 2352",
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
            "range": "± 1",
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
            "value": 923624,
            "range": "± 14018",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 168640,
            "range": "± 884",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 2014617,
            "range": "± 51147",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 49854355,
            "range": "± 6369871",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 40887,
            "range": "± 315",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 454712,
            "range": "± 1616",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 4779695,
            "range": "± 799968",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4433,
            "range": "± 161",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60688,
            "range": "± 229",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 768154,
            "range": "± 1725",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 61136,
            "range": "± 1999",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 680966,
            "range": "± 5340",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7523902,
            "range": "± 324353",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 752,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7134,
            "range": "± 105",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 123880,
            "range": "± 663",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23051,
            "range": "± 859",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 167160,
            "range": "± 3953",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1502032,
            "range": "± 30430",
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
          "id": "0a62be5afcd831117a74cef4e35e2075529c3a97",
          "message": "fix(serve): replace all href=\"#\" with actual paths — fix /#  navigation bug (#46)\n\nEvery <a> tag with hx-get now has a matching href so that:\n- Right-click → Open in new tab works\n- Browser fallback without JavaScript works\n- No more /#  URL on click\n\n65 occurrences fixed across views.rs and components.rs. Positional\nformat args converted to named args where needed to avoid index shifts.\n\nFixes: FEAT-001\nRefs: SSC-4\n\nCo-authored-by: Test <test@test.com>\nCo-authored-by: Claude Sonnet 4.6 <noreply@anthropic.com>",
          "timestamp": "2026-03-19T20:55:24+01:00",
          "tree_id": "d4044f45cc5264e5249320231e66a3850fb0e4f3",
          "url": "https://github.com/pulseengine/rivet/commit/0a62be5afcd831117a74cef4e35e2075529c3a97"
        },
        "date": 1773950735359,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 78204,
            "range": "± 343",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 1047916,
            "range": "± 20250",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 37737085,
            "range": "± 1054399",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1695,
            "range": "± 18",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 19452,
            "range": "± 313",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 354303,
            "range": "± 6169",
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
            "value": 822692,
            "range": "± 8540",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 163853,
            "range": "± 777",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1943752,
            "range": "± 14049",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 35659585,
            "range": "± 4645329",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 38901,
            "range": "± 100",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 413730,
            "range": "± 4150",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 5632474,
            "range": "± 467216",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3943,
            "range": "± 24",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 40264,
            "range": "± 83",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 769187,
            "range": "± 2634",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 53455,
            "range": "± 268",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 575992,
            "range": "± 2613",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7501214,
            "range": "± 636771",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 598,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 5051,
            "range": "± 10",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 151125,
            "range": "± 500",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21165,
            "range": "± 99",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 149717,
            "range": "± 263",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1369262,
            "range": "± 29199",
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
          "id": "8a99f8e638ba3b80d726c704cf68537381f503ed",
          "message": "fix(serve): exclude /assets/ from layout middleware, allow data: fonts in CSP (#47)\n\nTwo bugs:\n1. The redirect middleware was wrapping /assets/htmx.js and\n   /assets/mermaid.js responses in the HTML page shell, causing\n   \"Unexpected token '<'\" errors in the browser. Fixed by excluding\n   /assets/* paths from the middleware (same as /api/*, /wasm/*, etc.)\n\n2. CSP header blocked base64-embedded fonts (data: URIs) because\n   font-src defaulted to 'self'. Added explicit font-src 'self' data:\n   directive.\n\nFixes: FEAT-001\n\nCo-authored-by: Test <test@test.com>\nCo-authored-by: Claude Sonnet 4.6 <noreply@anthropic.com>",
          "timestamp": "2026-03-19T21:05:01+01:00",
          "tree_id": "dfdbf78f7c5ef32ef65d57610243b8eeabc3b14b",
          "url": "https://github.com/pulseengine/rivet/commit/8a99f8e638ba3b80d726c704cf68537381f503ed"
        },
        "date": 1773951110193,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 83089,
            "range": "± 580",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 1214204,
            "range": "± 18575",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 53208488,
            "range": "± 2130545",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2213,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26341,
            "range": "± 184",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 364382,
            "range": "± 6816",
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
            "value": 919344,
            "range": "± 8138",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 170848,
            "range": "± 1978",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1948432,
            "range": "± 20369",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 27825143,
            "range": "± 3167403",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 40396,
            "range": "± 419",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 464375,
            "range": "± 3338",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 4839644,
            "range": "± 276832",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4369,
            "range": "± 173",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 59344,
            "range": "± 522",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 758296,
            "range": "± 4837",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 57779,
            "range": "± 313",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 689329,
            "range": "± 12218",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7613293,
            "range": "± 464118",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 778,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7499,
            "range": "± 79",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 118433,
            "range": "± 2081",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23289,
            "range": "± 185",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 163525,
            "range": "± 11455",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1490758,
            "range": "± 12100",
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
          "id": "992db43bbbda1ea214799ec25207236e9ddedd5c",
          "message": "fix(serve): graceful WASM fallback + asset loading regression tests (#48)\n\n1. AADL WASM renderer now does a HEAD probe before import() so it fails\n   silently with a user-visible message instead of spamming uncaught\n   SyntaxError/TypeError in the console.\n\n2. New asset-loading.spec.ts with 9 regression tests:\n   - htmx.js and mermaid.js return JS (not HTML-wrapped)\n   - No JS errors on page load or navigation\n   - CSP allows inline styles and data: fonts\n   - No blocked font requests\n   - AADL diagram shows fallback when WASM unavailable\n   - Mermaid renders without errors\n   - Nav links navigate correctly (no /#)\n\n88/88 Playwright tests pass.\n\nFixes: FEAT-001\nRefs: SSC-4\n\nCo-authored-by: Test <test@test.com>\nCo-authored-by: Claude Sonnet 4.6 <noreply@anthropic.com>",
          "timestamp": "2026-03-19T21:13:37+01:00",
          "tree_id": "f51174c2fc0415115789e84d1d391ca8982ef6ca",
          "url": "https://github.com/pulseengine/rivet/commit/992db43bbbda1ea214799ec25207236e9ddedd5c"
        },
        "date": 1773951616934,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 83146,
            "range": "± 1765",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 1235347,
            "range": "± 8079",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 54830449,
            "range": "± 2910764",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2123,
            "range": "± 13",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26438,
            "range": "± 202",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 378283,
            "range": "± 1430",
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
            "value": 920220,
            "range": "± 5615",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 170008,
            "range": "± 1286",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1959237,
            "range": "± 22580",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 30048730,
            "range": "± 7381524",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 41175,
            "range": "± 262",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 461455,
            "range": "± 7226",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 5013297,
            "range": "± 368035",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4479,
            "range": "± 17",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60341,
            "range": "± 549",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 774366,
            "range": "± 6730",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 58157,
            "range": "± 141",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 683216,
            "range": "± 2957",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7474402,
            "range": "± 238353",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 768,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7335,
            "range": "± 68",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 108526,
            "range": "± 783",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23112,
            "range": "± 875",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 160053,
            "range": "± 1136",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1484156,
            "range": "± 24045",
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
          "id": "fd6075b0b1d3bd409173dcba174ce8d3bbba2918",
          "message": "fix(serve): silent WASM fallback — one HEAD probe, no console error spam (#49)\n\nAADL diagram init now checks WASM availability once before iterating\ncontainers. When unavailable, shows inline fallback text and returns\nimmediately — no per-container throws, no console.error calls, just\none quiet HEAD request.\n\nFixes: FEAT-001\n\nCo-authored-by: Test <test@test.com>\nCo-authored-by: Claude Sonnet 4.6 <noreply@anthropic.com>",
          "timestamp": "2026-03-19T21:27:13+01:00",
          "tree_id": "815033ddb5de44ed66e7c56b48d2b8b85ffed0f7",
          "url": "https://github.com/pulseengine/rivet/commit/fd6075b0b1d3bd409173dcba174ce8d3bbba2918"
        },
        "date": 1773952417601,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 82847,
            "range": "± 242",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 1226223,
            "range": "± 21218",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 52876453,
            "range": "± 1360566",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2229,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 27046,
            "range": "± 707",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 366446,
            "range": "± 5239",
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
            "value": 911674,
            "range": "± 7075",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 165815,
            "range": "± 747",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1924270,
            "range": "± 20449",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 25093072,
            "range": "± 1438522",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 33135,
            "range": "± 153",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 458546,
            "range": "± 2982",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 4723433,
            "range": "± 48985",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4392,
            "range": "± 10",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 59780,
            "range": "± 368",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 777862,
            "range": "± 2396",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 59677,
            "range": "± 305",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 671565,
            "range": "± 2498",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7608712,
            "range": "± 63580",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 768,
            "range": "± 17",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7026,
            "range": "± 19",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 107075,
            "range": "± 671",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23284,
            "range": "± 107",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 159988,
            "range": "± 681",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1498727,
            "range": "± 22576",
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
          "id": "c4a7683d8e490264b9f486a2d8a16cc259b01092",
          "message": "feat(build): remove embed-wasm feature gate — build.rs generates stubs (#50)\n\nWASM assets are now always compiled into the binary:\n- build.rs generates stub files when spar WASM is not built, so\n  include_str!/include_bytes! always succeeds\n- Stub JS is detected at runtime (starts with \"// stub\") and returns\n  404, so the client-side HEAD probe works correctly\n- When spar repo is found, build.rs checks out the pinned Cargo.toml\n  rev before building WASM to ensure version consistency\n- Removed embed-wasm feature from Cargo.toml — no more --features flag\n\nImplements: FEAT-064\nRefs: REQ-022\n\nCo-authored-by: Test <test@test.com>\nCo-authored-by: Claude Sonnet 4.6 <noreply@anthropic.com>",
          "timestamp": "2026-03-19T21:40:52+01:00",
          "tree_id": "c0ed1968a88b9a2e425c8466ee0c3111c7737e46",
          "url": "https://github.com/pulseengine/rivet/commit/c4a7683d8e490264b9f486a2d8a16cc259b01092"
        },
        "date": 1773953296998,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 82876,
            "range": "± 421",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 1237980,
            "range": "± 10644",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 59538054,
            "range": "± 3157141",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2192,
            "range": "± 23",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25790,
            "range": "± 115",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 371734,
            "range": "± 9561",
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
            "value": 918913,
            "range": "± 4962",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 169908,
            "range": "± 3221",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 2015365,
            "range": "± 35018",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 35868240,
            "range": "± 2329375",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 41658,
            "range": "± 128",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 473765,
            "range": "± 3620",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 6073545,
            "range": "± 591651",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4385,
            "range": "± 26",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 65856,
            "range": "± 619",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 779458,
            "range": "± 9727",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 61918,
            "range": "± 232",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 681294,
            "range": "± 13410",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 9773869,
            "range": "± 771832",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 755,
            "range": "± 13",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7682,
            "range": "± 105",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 109243,
            "range": "± 3184",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23215,
            "range": "± 559",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 160148,
            "range": "± 1884",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1508103,
            "range": "± 31934",
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
          "id": "a149caf9316e92487821bb21257d0940aae9d068",
          "message": "fix(serve): print button URL error + 14 Playwright regression tests (#51)\n\nPrint button used new URL() constructor which could fail in certain\ncontexts. Replaced with simple string concat (h + '?' + 'print=1').\n\nNew print-and-errors.spec.ts with 14 tests:\n- 5 print mode tests (renders, button exists, no URL error, onclick works)\n- 9 console error hygiene tests (/, /artifacts, /artifacts/REQ-001,\n  /stpa, /graph, /documents, /validate, /stats, /matrix)\n\n102/102 Playwright tests pass.\n\nFixes: FEAT-001\n\nCo-authored-by: Test <test@test.com>\nCo-authored-by: Claude Sonnet 4.6 <noreply@anthropic.com>",
          "timestamp": "2026-03-19T22:11:40+01:00",
          "tree_id": "06efca5344dcf37b58f4970f1202c50c600b91ae",
          "url": "https://github.com/pulseengine/rivet/commit/a149caf9316e92487821bb21257d0940aae9d068"
        },
        "date": 1773955333796,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 83412,
            "range": "± 212",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 1237299,
            "range": "± 22158",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 54833535,
            "range": "± 1629281",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2253,
            "range": "± 16",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26561,
            "range": "± 129",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 387984,
            "range": "± 2896",
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
            "value": 914898,
            "range": "± 4561",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 168379,
            "range": "± 677",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1943958,
            "range": "± 29493",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 29970688,
            "range": "± 1489432",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 40593,
            "range": "± 260",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 459504,
            "range": "± 2678",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 5074498,
            "range": "± 385808",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4418,
            "range": "± 131",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 61782,
            "range": "± 510",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 782146,
            "range": "± 8674",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 61032,
            "range": "± 283",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 690566,
            "range": "± 2656",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8100568,
            "range": "± 256313",
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
            "value": 7248,
            "range": "± 69",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 119257,
            "range": "± 1414",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22776,
            "range": "± 58",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 160137,
            "range": "± 2747",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1488188,
            "range": "± 31509",
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
          "id": "c1886da810299e8894885251cfe2d9249c849bbc",
          "message": "feat: P0+P1 security hardening, filter/sort/pagination, traceability gaps, test markers (#52)\n\nThree workstreams implemented in parallel:\n\n1. Security hardening (SSC-3 + SSC-6):\n   - YAML document-size limit (10 MB) in generic and STPA adapters\n   - Dashboard default bind to 127.0.0.1 (warns on 0.0.0.0)\n   - 2 new unit tests for size limit enforcement\n\n2. Dashboard filter/sort/pagination:\n   - /artifacts: ?types=, ?q=, ?sort=, ?dir=, ?per_page=, ?page=\n   - Filter bar with search input, type dropdown, per-page selector\n   - Sortable column headers with direction arrows\n   - Windowed pagination with prev/next/ellipsis\n   - /stpa: filter bar with type checkboxes and text search\n   - All href values match hx-get (no href=\"#\")\n\n3. V-model traceability:\n   - FEAT-016 now satisfies REQ-003 (ASPICE V-model)\n   - FEAT-014 now satisfies REQ-009 (test results evidence)\n   - DD-039 created for REQ-022 (asset embedding rationale)\n   - 324 `// rivet: verifies REQ-XXX` markers added across 22 source files\n\nValidate: PASS 0 warnings. All tests pass.\n\nImplements: FEAT-065\nSatisfies: REQ-012\n\nCo-authored-by: Test <test@test.com>\nCo-authored-by: Claude Sonnet 4.6 <noreply@anthropic.com>",
          "timestamp": "2026-03-20T05:59:04+01:00",
          "tree_id": "5a050f2f296fd19db757d290e7b1ebb170d30174",
          "url": "https://github.com/pulseengine/rivet/commit/c1886da810299e8894885251cfe2d9249c849bbc"
        },
        "date": 1773983291318,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 83045,
            "range": "± 369",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 1245421,
            "range": "± 27046",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 58875338,
            "range": "± 1599394",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2178,
            "range": "± 16",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25921,
            "range": "± 263",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 391941,
            "range": "± 3909",
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
            "value": 917034,
            "range": "± 5812",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 173073,
            "range": "± 1056",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1976321,
            "range": "± 8948",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 28349124,
            "range": "± 2377978",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 42026,
            "range": "± 205",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 468374,
            "range": "± 1769",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 5107676,
            "range": "± 473444",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4418,
            "range": "± 69",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 59532,
            "range": "± 517",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 790363,
            "range": "± 4092",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 61644,
            "range": "± 244",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 686342,
            "range": "± 3921",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7765996,
            "range": "± 422529",
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
            "value": 7882,
            "range": "± 57",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 114446,
            "range": "± 950",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23137,
            "range": "± 391",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 159793,
            "range": "± 995",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1496092,
            "range": "± 28748",
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
          "id": "28a9896a041c10555ff7c54a67186ed54083b6a8",
          "message": "fix(etch): edges hidden behind containers — fix SVG render order (#53)\n\nRender containers → edges → leaf nodes (was: edges → all nodes).\nAdd port label margin to prevent clipping.\n\nTrace: skip\n\nCo-authored-by: Test <test@test.com>\nCo-authored-by: Claude Opus 4.6 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-03-20T06:18:32+01:00",
          "tree_id": "34a1a8df281ca9e6d92ff8c398e53e55dea5a25c",
          "url": "https://github.com/pulseengine/rivet/commit/28a9896a041c10555ff7c54a67186ed54083b6a8"
        },
        "date": 1773984290377,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 83920,
            "range": "± 341",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 1255760,
            "range": "± 12363",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 55109352,
            "range": "± 1853080",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2169,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26421,
            "range": "± 263",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 392675,
            "range": "± 2702",
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
            "value": 930901,
            "range": "± 6850",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 172290,
            "range": "± 755",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1983192,
            "range": "± 9867",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 28526106,
            "range": "± 3039492",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 41170,
            "range": "± 309",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 466395,
            "range": "± 2230",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 5026671,
            "range": "± 239140",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4431,
            "range": "± 13",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 58538,
            "range": "± 308",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 817318,
            "range": "± 4318",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 56894,
            "range": "± 311",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 681667,
            "range": "± 8962",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7606574,
            "range": "± 350276",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 843,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7555,
            "range": "± 49",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 113715,
            "range": "± 3121",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22630,
            "range": "± 319",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 155194,
            "range": "± 1080",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1454094,
            "range": "± 146976",
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
          "id": "348123d43fd51458c286f495ae76d7669935c4f9",
          "message": "test(playwright): comprehensive E2E coverage — 215 tests, all routes covered (#54)\n\n* fix(etch): edges hidden behind containers — fix SVG render order\n\nRender containers → edges → leaf nodes (was: edges → all nodes).\nAdd port label margin to prevent clipping.\n\nTrace: skip\n\nCo-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>\n\n* test(playwright): comprehensive E2E coverage — 215 tests across 21 spec files\n\n8 new spec files with 113 new tests covering previously untested routes:\n- coverage-view (8): coverage rules, bars, badges, uncovered artifacts\n- source-view (13): file tree, content, cross-refs, line anchors, path traversal\n- results-view (7): empty state, result history\n- help-view (21): schema types, link types, rules, docs topics\n- matrix-view (12): form controls, computed results, cell detail\n- filter-sort (17): ?types=, ?q=, ?sort=, ?per_page=, ?page= on /artifacts\n- stpa-filter (16): type checkboxes, text search, STPA-Sec filter, URL state\n- security (19): CSP directives, content-types, path traversal, CORS\n\n215/215 Playwright tests pass. All routes now have dedicated functional tests.\n\nRefs: TEST-012\n\nCo-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>\n\n---------\n\nCo-authored-by: Test <test@test.com>\nCo-authored-by: Claude Opus 4.6 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-03-20T06:30:45+01:00",
          "tree_id": "cf918097f00cda03970f8127e3a0a7cd7fe3403c",
          "url": "https://github.com/pulseengine/rivet/commit/348123d43fd51458c286f495ae76d7669935c4f9"
        },
        "date": 1773985010169,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 82963,
            "range": "± 271",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 1228851,
            "range": "± 17159",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 56598953,
            "range": "± 2774541",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2154,
            "range": "± 10",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26009,
            "range": "± 274",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 372261,
            "range": "± 3520",
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
            "value": 914856,
            "range": "± 2734",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 171500,
            "range": "± 1982",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1998367,
            "range": "± 12660",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 26044573,
            "range": "± 1280400",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 41640,
            "range": "± 101",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 463393,
            "range": "± 1606",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 4796342,
            "range": "± 120436",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4900,
            "range": "± 31",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60493,
            "range": "± 360",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 772638,
            "range": "± 15204",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 61482,
            "range": "± 139",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 686645,
            "range": "± 10818",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7901975,
            "range": "± 310920",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 847,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7921,
            "range": "± 108",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 116180,
            "range": "± 929",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23250,
            "range": "± 208",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 160235,
            "range": "± 2279",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1452838,
            "range": "± 29227",
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
      }
    ]
  }
}