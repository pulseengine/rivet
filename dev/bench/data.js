window.BENCHMARK_DATA = {
  "lastUpdate": 1793282012590,
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
          "id": "68d7f90b1e8852db3f58f6df5a35b67478fa8350",
          "message": "fix(export): the single page names a declared unmodelled rule's reason (REQ-400, residual of REQ-387) (#1059)\n\nImplements: REQ-400\nRefs: #956\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9",
          "timestamp": "2026-10-08T19:31:05+02:00",
          "tree_id": "cd34fda1f8d8ab2a05a9e1a2d91db493638d5b90",
          "url": "https://github.com/pulseengine/rivet/commit/68d7f90b1e8852db3f58f6df5a35b67478fa8350"
        },
        "date": 1791481209391,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 45881,
            "range": "± 162",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 556143,
            "range": "± 2001",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 8890771,
            "range": "± 290222",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1008,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 12052,
            "range": "± 34",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 203540,
            "range": "± 9816",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 46,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/1000",
            "value": 46,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 46,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 807475,
            "range": "± 8320",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 103847,
            "range": "± 510",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1178863,
            "range": "± 3828",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 15337886,
            "range": "± 129577",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 418580,
            "range": "± 1321",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 8836070,
            "range": "± 34042",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 536664731,
            "range": "± 9087364",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 2486,
            "range": "± 9",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 24100,
            "range": "± 72",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 423119,
            "range": "± 1263",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 34112,
            "range": "± 99",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 361939,
            "range": "± 674",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 4176641,
            "range": "± 69238",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 498,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 6691,
            "range": "± 16",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 116731,
            "range": "± 1379",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 12131,
            "range": "± 28",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 86320,
            "range": "± 4954",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 807143,
            "range": "± 2916",
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
          "id": "85cfc4c9748c07a80b5678bd0066377058856fab",
          "message": "fix(export): the HTML export carries the dashboard's static sections; doc-linkage source nodes stop linking to non-documents (REQ-400, #956) (#1062)\n\nImplements: REQ-400\nRefs: #956\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9",
          "timestamp": "2026-10-09T08:31:05+02:00",
          "tree_id": "cd805ee5b3e0c946bb52e109dd52bd6049e4dcd1",
          "url": "https://github.com/pulseengine/rivet/commit/85cfc4c9748c07a80b5678bd0066377058856fab"
        },
        "date": 1791528211683,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 86001,
            "range": "± 510",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 941806,
            "range": "± 5172",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 17504833,
            "range": "± 1761185",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1925,
            "range": "± 18",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 22387,
            "range": "± 72",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 336756,
            "range": "± 2963",
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
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1515713,
            "range": "± 16183",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 165412,
            "range": "± 408",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1911846,
            "range": "± 16479",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 32552585,
            "range": "± 3313428",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 738697,
            "range": "± 2318",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 17442813,
            "range": "± 179531",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1178940891,
            "range": "± 22110711",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4320,
            "range": "± 22",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 46728,
            "range": "± 237",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 744167,
            "range": "± 3446",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 62416,
            "range": "± 317",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 716241,
            "range": "± 2863",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8610534,
            "range": "± 558123",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1218,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14594,
            "range": "± 46",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 228807,
            "range": "± 1885",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22172,
            "range": "± 112",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 153887,
            "range": "± 581",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1451619,
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
          "id": "510f149bc79ac8a8e6ff44e8b6a2ca8cca00cc32",
          "message": "fix(validate): STPA sub-hazards are exempt from commit-ref-shape; small-rule warnings cleared (#1069)\n\nSTPA sub-hazards are exempt from commit-ref-shape (maintainer decision); small-rule warnings cleared with evidence: SC-LSP-008 satisfied by REQ-146/156, three categories and two UCA types brought into the schema, the six AI-related hazards linked to RA-001/002. commit-ref-shape 12 to 0, allowed-values 5 to 0, constraint-has-requirement 3 to 2, stpa-hazards-map-to-risks 52 to 46.\n\nImplements: REQ-004\nRefs: REQ-389\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9",
          "timestamp": "2026-10-09T15:31:00+02:00",
          "tree_id": "cffaac881dd64e97d1e970db78dd3df3bd51c88a",
          "url": "https://github.com/pulseengine/rivet/commit/510f149bc79ac8a8e6ff44e8b6a2ca8cca00cc32"
        },
        "date": 1791553425046,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 78440,
            "range": "± 1930",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 988183,
            "range": "± 9571",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 23700978,
            "range": "± 848801",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1713,
            "range": "± 24",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 18509,
            "range": "± 106",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 353642,
            "range": "± 1146",
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
            "value": 1422381,
            "range": "± 9412",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 160133,
            "range": "± 1022",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1879455,
            "range": "± 17887",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 60798259,
            "range": "± 2681325",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 727694,
            "range": "± 3966",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 19531330,
            "range": "± 239836",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1025959702,
            "range": "± 4730153",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3950,
            "range": "± 10",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 40206,
            "range": "± 516",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 850573,
            "range": "± 5739",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 52366,
            "range": "± 147",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 587502,
            "range": "± 1981",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 12133641,
            "range": "± 281097",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 830,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 11828,
            "range": "± 69",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 325615,
            "range": "± 989",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22237,
            "range": "± 61",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 157486,
            "range": "± 407",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1483866,
            "range": "± 45591",
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
          "id": "09f6dc88e82118949c1cef5cdaa84513472c6666",
          "message": "ci: traceability ratchet fails a PR that adds findings on done artifacts (REQ-389) (#1070)\n\nCI traceability ratchet: a pull request fails when it adds a traceability-rule warning or error on an artifact at implemented or later that its merge base lacks. Tests pin the status, severity and rule-scope filters with negative controls. Gated backlog on main: 323.\n\nImplements: REQ-389\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9",
          "timestamp": "2026-10-09T18:31:01+02:00",
          "tree_id": "72082c601d95a6c79c1409a0c67f5c70e8ba715d",
          "url": "https://github.com/pulseengine/rivet/commit/09f6dc88e82118949c1cef5cdaa84513472c6666"
        },
        "date": 1791564233397,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 87681,
            "range": "± 361",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 888979,
            "range": "± 4715",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13606464,
            "range": "± 682092",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2100,
            "range": "± 9",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 27501,
            "range": "± 271",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 362576,
            "range": "± 1663",
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
            "value": 1507588,
            "range": "± 27425",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 163232,
            "range": "± 1612",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1966338,
            "range": "± 4881",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 26548479,
            "range": "± 1430181",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 746040,
            "range": "± 3045",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 19556977,
            "range": "± 193379",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1506334760,
            "range": "± 11312012",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4363,
            "range": "± 17",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60369,
            "range": "± 364",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 778755,
            "range": "± 3222",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 59192,
            "range": "± 452",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 700060,
            "range": "± 7519",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7764525,
            "range": "± 167618",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1268,
            "range": "± 17",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14286,
            "range": "± 48",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 322292,
            "range": "± 1825",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 25393,
            "range": "± 113",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 175847,
            "range": "± 971",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1644397,
            "range": "± 23810",
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
          "id": "20e0086216842c7529d7caae06e53feffe1e0a64",
          "message": "test: mark the existing tests that verify implemented requirements (#1073)\n\nVerifies: REQ-111, REQ-115, REQ-116, REQ-131, REQ-138, REQ-141, REQ-142, REQ-143, REQ-144, REQ-145, REQ-146, REQ-148, REQ-152, REQ-153, REQ-154, REQ-157, REQ-158, REQ-160, REQ-165, REQ-166, REQ-167, REQ-168, REQ-179, REQ-182, REQ-184, REQ-187, REQ-189, REQ-190, REQ-191, REQ-192, REQ-193, REQ-194, REQ-195, REQ-198, REQ-199, REQ-201, REQ-211, REQ-216, REQ-218, REQ-219, REQ-220, REQ-221, REQ-222, REQ-223, REQ-225, REQ-258, REQ-259, REQ-262, REQ-269, REQ-295, REQ-351\nRefs: REQ-389\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9",
          "timestamp": "2026-10-09T22:31:04+02:00",
          "tree_id": "8e6a5a302c9bf9410fb2466946eebb5dbef3dc6c",
          "url": "https://github.com/pulseengine/rivet/commit/20e0086216842c7529d7caae06e53feffe1e0a64"
        },
        "date": 1791578606731,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85567,
            "range": "± 265",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 918597,
            "range": "± 12084",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14698139,
            "range": "± 918707",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1898,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 23965,
            "range": "± 323",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 342161,
            "range": "± 2438",
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
            "value": 1512912,
            "range": "± 29994",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 169118,
            "range": "± 374",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1923182,
            "range": "± 21542",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 37931479,
            "range": "± 2907184",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 745640,
            "range": "± 3072",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 19261936,
            "range": "± 724828",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1363806886,
            "range": "± 18498003",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4206,
            "range": "± 30",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 46732,
            "range": "± 201",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 723419,
            "range": "± 29210",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 60935,
            "range": "± 143",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 710959,
            "range": "± 24130",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8317871,
            "range": "± 293940",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1161,
            "range": "± 11",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14427,
            "range": "± 230",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 229974,
            "range": "± 900",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23465,
            "range": "± 119",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 166629,
            "range": "± 4975",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1564546,
            "range": "± 34804",
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
          "id": "f1f5a5fc4709ccd695abfb694d7a87316c123682",
          "message": "fix(core): source markers keep every id they name (lists, dotted ids, //! comments) (#1074)\n\nSource markers keep every id they name: comma lists, dotted STPA ids and //! file-level markers. Markers on this repository 1,038 to 1,070.\n\nImplements: REQ-389\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9",
          "timestamp": "2026-10-09T23:31:01+02:00",
          "tree_id": "620a315650e78ac14d26e3f860c663bd730dbb7f",
          "url": "https://github.com/pulseengine/rivet/commit/f1f5a5fc4709ccd695abfb694d7a87316c123682"
        },
        "date": 1791582262235,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84985,
            "range": "± 305",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 896391,
            "range": "± 9135",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 16928178,
            "range": "± 988167",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2110,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25348,
            "range": "± 221",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 374444,
            "range": "± 25766",
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
            "value": 1530498,
            "range": "± 17675",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 162893,
            "range": "± 962",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1911625,
            "range": "± 19003",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 37460415,
            "range": "± 3273252",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 752579,
            "range": "± 6275",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 20287733,
            "range": "± 309101",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1514494589,
            "range": "± 17103262",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4476,
            "range": "± 10",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 61704,
            "range": "± 1105",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 853145,
            "range": "± 10790",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 63038,
            "range": "± 997",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 690507,
            "range": "± 3676",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 10254351,
            "range": "± 645615",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1123,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14475,
            "range": "± 83",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 319269,
            "range": "± 6328",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23033,
            "range": "± 95",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 162570,
            "range": "± 2035",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1486747,
            "range": "± 35823",
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
          "id": "1ee21ca3d22238f57b80530fca42f5ba3da11a65",
          "message": "chore(artifacts): mark the defect and gap requirements corrective (#1077)\n\nMarks 161 defect and gap requirements corrective (dev schema 0.5.0), exempting them from requirement-coverage; verification is still required. requirement-coverage warnings 245 to 84; 68 capability and 16 unclear requirements listed for the maintainer in the PR.\n\nRefs: REQ-389\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9",
          "timestamp": "2026-10-10T01:31:04+02:00",
          "tree_id": "92217d1a89404637a6d19a8113e4337b5d63d2bb",
          "url": "https://github.com/pulseengine/rivet/commit/1ee21ca3d22238f57b80530fca42f5ba3da11a65"
        },
        "date": 1791589217271,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 49307,
            "range": "± 1681",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 595961,
            "range": "± 21672",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 9717946,
            "range": "± 297222",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1021,
            "range": "± 22",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 12601,
            "range": "± 401",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 202541,
            "range": "± 4063",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 49,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/1000",
            "value": 49,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 49,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 876202,
            "range": "± 16773",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 103282,
            "range": "± 4215",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1202238,
            "range": "± 17128",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 16233963,
            "range": "± 971316",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 443021,
            "range": "± 8181",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 9254895,
            "range": "± 469007",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 577734472,
            "range": "± 15671731",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 2631,
            "range": "± 85",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 26584,
            "range": "± 171",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 447725,
            "range": "± 9130",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 37434,
            "range": "± 3752",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 397403,
            "range": "± 13037",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 4570269,
            "range": "± 229813",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 534,
            "range": "± 22",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7280,
            "range": "± 389",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 119762,
            "range": "± 3366",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 12485,
            "range": "± 180",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 86929,
            "range": "± 4815",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 814582,
            "range": "± 17973",
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
          "id": "81dfc308e31af561d72ad2ea9d19a939da794b47",
          "message": "fix(yaml): an empty link target fails validate on both paths, not only --direct (#1080)\n\nAn explicit empty link target fails validate on both paths (the default incremental path dropped it and passed). The yaml_footguns oracle allows a literally written empty target that validation rejects; cli_argv skips help requested inside a short-flag cluster.\n\nFixes: REQ-028\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9",
          "timestamp": "2026-10-10T07:30:57+02:00",
          "tree_id": "839683f260441125ee9271f54e2b4b3cb3194507",
          "url": "https://github.com/pulseengine/rivet/commit/81dfc308e31af561d72ad2ea9d19a939da794b47"
        },
        "date": 1791612746519,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 50282,
            "range": "± 1567",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 604544,
            "range": "± 19873",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 16639704,
            "range": "± 692816",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1057,
            "range": "± 85",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 13649,
            "range": "± 1054",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 230012,
            "range": "± 8715",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 49,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/1000",
            "value": 49,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 49,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 859197,
            "range": "± 4386",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 105043,
            "range": "± 485",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1216087,
            "range": "± 36998",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 26231708,
            "range": "± 5941814",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 446552,
            "range": "± 19267",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 9451190,
            "range": "± 425206",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 577815659,
            "range": "± 10540376",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 2656,
            "range": "± 46",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 26534,
            "range": "± 891",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 445134,
            "range": "± 18781",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 36779,
            "range": "± 170",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 382756,
            "range": "± 12077",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 4392793,
            "range": "± 26621",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 521,
            "range": "± 32",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 6989,
            "range": "± 52",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 120893,
            "range": "± 5016",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 12141,
            "range": "± 80",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 83809,
            "range": "± 2761",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 787017,
            "range": "± 20841",
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
          "id": "734cad014beab4884c27d2155ada3cad8624b670",
          "message": "feat(yaml)!: rivet owns its YAML parser and emitter; serde_yaml removed (REQ-346) (#1085)\n\nrivet-yaml owns the YAML read and write path: a serde Deserializer over the\nlossless CST and a libyaml-compatible emitter. serde_yaml and unsafe-libyaml\nare gone from the workspace, which clears RUSTSEC-2024-0449. The official\nyaml-test-suite (pinned) is the conformance oracle: 402 cases, none parsed to\na wrong value.\n\nMerged past the Semver Checks gate by maintainer decision: cargo-semver-checks\ncannot follow the yaml_cst re-export into rivet-yaml; recorded in CHANGELOG as\nan accepted 0.41 API change. Every other required job passed.\n\nImplements: REQ-346\nRefs: REQ-348, REQ-028\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9",
          "timestamp": "2026-10-14T16:51:48+02:00",
          "tree_id": "c99e025d3372ce546c4840fcb3044958ea08004f",
          "url": "https://github.com/pulseengine/rivet/commit/734cad014beab4884c27d2155ada3cad8624b670"
        },
        "date": 1791990067294,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 48807,
            "range": "± 2769",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 579686,
            "range": "± 16476",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 11168588,
            "range": "± 1621280",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1144,
            "range": "± 46",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 12938,
            "range": "± 322",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 221244,
            "range": "± 6625",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 48,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/1000",
            "value": 48,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 48,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1293608,
            "range": "± 69227",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 109025,
            "range": "± 3090",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1241021,
            "range": "± 31076",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 29419120,
            "range": "± 2880887",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 439520,
            "range": "± 19847",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 9696336,
            "range": "± 374470",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 582673518,
            "range": "± 15075067",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 2640,
            "range": "± 245",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 27902,
            "range": "± 638",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 437595,
            "range": "± 11930",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 35831,
            "range": "± 870",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 384145,
            "range": "± 9591",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 5753880,
            "range": "± 859426",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 501,
            "range": "± 15",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7107,
            "range": "± 184",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 119479,
            "range": "± 3968",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 14107,
            "range": "± 395",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 86412,
            "range": "± 1983",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 783985,
            "range": "± 18268",
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
          "id": "9cd0858778630e8b33c2d99b09c3c49f4ca9fd50",
          "message": "build(deps): rustls 0.23.46 clears RUSTSEC-2026-0346..0349 (#1089)\n\nTrace: skip\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9",
          "timestamp": "2026-10-14T21:22:08+02:00",
          "tree_id": "6badd8b32fcc757bad06c28ee3de4bcc5aac2628",
          "url": "https://github.com/pulseengine/rivet/commit/9cd0858778630e8b33c2d99b09c3c49f4ca9fd50"
        },
        "date": 1792007189542,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 70063,
            "range": "± 352",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 719946,
            "range": "± 2372",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14410902,
            "range": "± 742275",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1444,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 17866,
            "range": "± 191",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 261250,
            "range": "± 1911",
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
            "value": 1582432,
            "range": "± 25054",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 127181,
            "range": "± 477",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1479048,
            "range": "± 83517",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 35263035,
            "range": "± 2864071",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 576970,
            "range": "± 1670",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 13053354,
            "range": "± 116560",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 837888121,
            "range": "± 7161947",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3237,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 33827,
            "range": "± 74",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 559419,
            "range": "± 15010",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 48128,
            "range": "± 1051",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 516378,
            "range": "± 3910",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 6691737,
            "range": "± 292941",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 863,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 11279,
            "range": "± 24",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 174637,
            "range": "± 4302",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 18201,
            "range": "± 86",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 115748,
            "range": "± 280",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1053663,
            "range": "± 46314",
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
          "id": "27c8c334e1779d325ef590b44255b67ab3506b6d",
          "message": "test(yaml): the lexer's document-end marker arm is tested (#1082)\n\nVerifies: REQ-028\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9",
          "timestamp": "2026-10-15T04:49:09+02:00",
          "tree_id": "dcd1a3243c7362afcb7b412aeaa0d8af16193ac5",
          "url": "https://github.com/pulseengine/rivet/commit/27c8c334e1779d325ef590b44255b67ab3506b6d"
        },
        "date": 1792033301871,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84761,
            "range": "± 3864",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 887009,
            "range": "± 9247",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14454573,
            "range": "± 967034",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2153,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 23394,
            "range": "± 175",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 352531,
            "range": "± 34534",
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
            "value": 1995981,
            "range": "± 10093",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 159978,
            "range": "± 2216",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1940626,
            "range": "± 33676",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 44193890,
            "range": "± 4158510",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 777031,
            "range": "± 4739",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 19214423,
            "range": "± 191158",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1293633469,
            "range": "± 18989810",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4291,
            "range": "± 23",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 61532,
            "range": "± 2415",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 798626,
            "range": "± 13051",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 61104,
            "range": "± 234",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 697156,
            "range": "± 4543",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 10044145,
            "range": "± 894109",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1088,
            "range": "± 28",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15180,
            "range": "± 179",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 352529,
            "range": "± 2599",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 25962,
            "range": "± 95",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 164349,
            "range": "± 7237",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1459120,
            "range": "± 21443",
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
          "id": "b24baa6861547756fa68daa282e248a872ac6c6d",
          "message": "build(deps): wasmtime 48.0.6 clears RUSTSEC-2026-0353..0364 (#1091)\n\nRefs: REQ-402\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9",
          "timestamp": "2026-10-15T09:50:43+02:00",
          "tree_id": "f69aade1bfe7897fb4a0bfe6208c447bb3fa4acc",
          "url": "https://github.com/pulseengine/rivet/commit/b24baa6861547756fa68daa282e248a872ac6c6d"
        },
        "date": 1792051253856,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 55898,
            "range": "± 948",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 698843,
            "range": "± 36998",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 9283286,
            "range": "± 199869",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1297,
            "range": "± 84",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 13641,
            "range": "± 78",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 243302,
            "range": "± 26018",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 52,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/1000",
            "value": 51,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 51,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1476698,
            "range": "± 34401",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 113947,
            "range": "± 644",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1388865,
            "range": "± 53107",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 21647301,
            "range": "± 699757",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 497869,
            "range": "± 30842",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 11445168,
            "range": "± 593540",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 677588792,
            "range": "± 24024828",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 2715,
            "range": "± 81",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 28275,
            "range": "± 942",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 732142,
            "range": "± 13208",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 39661,
            "range": "± 1195",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 427712,
            "range": "± 18047",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 5395594,
            "range": "± 125006",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 561,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7889,
            "range": "± 502",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 227110,
            "range": "± 11647",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 17267,
            "range": "± 565",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 108325,
            "range": "± 6324",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 917362,
            "range": "± 24546",
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
          "id": "28f314696bd28c09d164372d2a961766de6c5e6c",
          "message": "fix(cli): rivet add --field coerces mapping/sequence values; validate catches the string form (#1084)\n\nFixes: REQ-385\nRefs: REQ-288, #1021, #1008\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9",
          "timestamp": "2026-10-15T12:59:07+02:00",
          "tree_id": "69eed059b34ebbe5e693d567e62cedafc9b14236",
          "url": "https://github.com/pulseengine/rivet/commit/28f314696bd28c09d164372d2a961766de6c5e6c"
        },
        "date": 1792062720547,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 67797,
            "range": "± 1527",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 725546,
            "range": "± 21492",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 17922644,
            "range": "± 2168208",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1498,
            "range": "± 11",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 17874,
            "range": "± 60",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 251036,
            "range": "± 1347",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 75,
            "range": "± 1",
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
            "value": 76,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1578043,
            "range": "± 14168",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 123751,
            "range": "± 2519",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1474529,
            "range": "± 33267",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 39000237,
            "range": "± 6735642",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 565448,
            "range": "± 12143",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 13845036,
            "range": "± 775461",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 854407290,
            "range": "± 13570244",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3249,
            "range": "± 117",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 33396,
            "range": "± 146",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 610161,
            "range": "± 20058",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 47246,
            "range": "± 92",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 518348,
            "range": "± 2646",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7492959,
            "range": "± 948262",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 809,
            "range": "± 16",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 10795,
            "range": "± 212",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 178974,
            "range": "± 1781",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 18148,
            "range": "± 297",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 115916,
            "range": "± 2107",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1054314,
            "range": "± 18392",
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
          "id": "7b8dc5fec7c301b7eab5216142852bf9c733427e",
          "message": "ci(release): publish musl Linux assets beside the gnu archives (#1086)\n\nThe static-link check accepts static-pie (x86_64 musl). A throwaway probe run of the musl build steps (run 38755235786) built both targets, file reported static-pie / static, and rivet --version ran in alpine:3.20.\n\nRefs: #980, pulseengine/varve#175, #557\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9",
          "timestamp": "2026-10-15T21:21:11+02:00",
          "tree_id": "3291f710f05016a9c2086bcc7e2efa77874184f4",
          "url": "https://github.com/pulseengine/rivet/commit/7b8dc5fec7c301b7eab5216142852bf9c733427e"
        },
        "date": 1792092859291,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85893,
            "range": "± 243",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 903169,
            "range": "± 13607",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14541501,
            "range": "± 1155805",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2169,
            "range": "± 31",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26386,
            "range": "± 431",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 374590,
            "range": "± 1517",
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
            "value": 2019221,
            "range": "± 23516",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 163054,
            "range": "± 989",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1929055,
            "range": "± 30822",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 29894091,
            "range": "± 2876362",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 753415,
            "range": "± 7133",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 18564554,
            "range": "± 169960",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1369304034,
            "range": "± 13674389",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4381,
            "range": "± 89",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 65603,
            "range": "± 374",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 885086,
            "range": "± 7939",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 61977,
            "range": "± 860",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 696753,
            "range": "± 7241",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8034567,
            "range": "± 400132",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1197,
            "range": "± 13",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15026,
            "range": "± 62",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 322695,
            "range": "± 1778",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 25950,
            "range": "± 74",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 169323,
            "range": "± 1219",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1526387,
            "range": "± 50721",
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
          "id": "555bd59fbf123c63b6727a765627f35b7973c166",
          "message": "ci: nightly mutation sweep as 64 rivet-core shards plus 16 rivet-yaml shards that can finish (#1083)\n\nRefs: REQ-346, #1031\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9",
          "timestamp": "2026-10-15T22:31:10+02:00",
          "tree_id": "46c42cff2f1e3bf446ab8054751134ebd295bbe3",
          "url": "https://github.com/pulseengine/rivet/commit/555bd59fbf123c63b6727a765627f35b7973c166"
        },
        "date": 1792097030347,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84549,
            "range": "± 927",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 900697,
            "range": "± 5219",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13236011,
            "range": "± 1328856",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2015,
            "range": "± 10",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26216,
            "range": "± 770",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 373919,
            "range": "± 20659",
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
            "value": 95,
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
            "value": 2002129,
            "range": "± 13189",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 162126,
            "range": "± 948",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1904252,
            "range": "± 84858",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 38065168,
            "range": "± 7462574",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 745727,
            "range": "± 12131",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 18724911,
            "range": "± 1026726",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1376062066,
            "range": "± 19538759",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4317,
            "range": "± 36",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60544,
            "range": "± 3860",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 788372,
            "range": "± 75893",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 61516,
            "range": "± 365",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 697754,
            "range": "± 13464",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 11561983,
            "range": "± 2009200",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1186,
            "range": "± 14",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14400,
            "range": "± 182",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 342816,
            "range": "± 10744",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 25933,
            "range": "± 341",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 169156,
            "range": "± 1366",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1547458,
            "range": "± 32952",
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
          "id": "cc3b8075446c25972eed8f1ae71aa599d381e025",
          "message": "chore(release): v0.41.1 — marker scan regression, reproducible export, Robot markers (#1108)\n\nFixes: REQ-405, REQ-406\nImplements: REQ-407\nVerifies: REQ-402, REQ-405, REQ-406, REQ-407\nRefs: #1097, #1104, #1105\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9",
          "timestamp": "2026-10-21T08:43:35+02:00",
          "tree_id": "34e26ee3815a6d6823445a3ca49a24b684ca759c",
          "url": "https://github.com/pulseengine/rivet/commit/cc3b8075446c25972eed8f1ae71aa599d381e025"
        },
        "date": 1792565806935,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84752,
            "range": "± 259",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 844270,
            "range": "± 10806",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14717554,
            "range": "± 994570",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2133,
            "range": "± 16",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 27010,
            "range": "± 208",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 415752,
            "range": "± 1914",
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
            "value": 1915880,
            "range": "± 14037",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 165820,
            "range": "± 437",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1769783,
            "range": "± 8232",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 24250478,
            "range": "± 984064",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 754545,
            "range": "± 4240",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 18261235,
            "range": "± 302151",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1372908321,
            "range": "± 11510379",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4855,
            "range": "± 19",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 67983,
            "range": "± 398",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 896830,
            "range": "± 9827",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 59024,
            "range": "± 265",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 690140,
            "range": "± 4026",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8557364,
            "range": "± 724270",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1175,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15724,
            "range": "± 58",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 364793,
            "range": "± 2069",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23785,
            "range": "± 93",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 159976,
            "range": "± 934",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1397689,
            "range": "± 11586",
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
          "id": "29ca43828c8060af135fcd47ecff4c48662d1567",
          "message": "ci: pin Playwright E2E to ubuntu-24.04 so chromium installs again (#1114)\n\nRefs: #1109\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9",
          "timestamp": "2026-10-22T17:58:43+02:00",
          "tree_id": "82c4a0ca7f26387ecf6576b6b9ed1d5a53fbb37b",
          "url": "https://github.com/pulseengine/rivet/commit/29ca43828c8060af135fcd47ecff4c48662d1567"
        },
        "date": 1792687341769,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 71096,
            "range": "± 2587",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 888242,
            "range": "± 21794",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 9592270,
            "range": "± 259577",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1365,
            "range": "± 41",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 16868,
            "range": "± 592",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 303776,
            "range": "± 7519",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 67,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/1000",
            "value": 67,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 67,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1779301,
            "range": "± 68177",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 155688,
            "range": "± 6376",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1804376,
            "range": "± 59753",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 22979947,
            "range": "± 1400614",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 656184,
            "range": "± 21139",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 15898476,
            "range": "± 599768",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 954730414,
            "range": "± 13366947",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3683,
            "range": "± 127",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 41513,
            "range": "± 1224",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 868082,
            "range": "± 14612",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 46979,
            "range": "± 1699",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 521053,
            "range": "± 20973",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 6499530,
            "range": "± 251588",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 812,
            "range": "± 28",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 10634,
            "range": "± 297",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 308469,
            "range": "± 9139",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 20689,
            "range": "± 932",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 130046,
            "range": "± 5242",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1186861,
            "range": "± 37718",
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
          "id": "9b16d4d0b1768579a13f0c064430c9b257502256",
          "message": "ci(npm): publish with npm trusted publishing (OIDC) instead of NPM_TOKEN (#1122)\n\nTrace: skip\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9",
          "timestamp": "2026-10-22T22:23:09+02:00",
          "tree_id": "84df1d313c9b2426291aa68bf3399ec2d62fb28c",
          "url": "https://github.com/pulseengine/rivet/commit/9b16d4d0b1768579a13f0c064430c9b257502256"
        },
        "date": 1792710613456,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 88169,
            "range": "± 468",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 895657,
            "range": "± 4128",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14383403,
            "range": "± 598209",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2008,
            "range": "± 40",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24299,
            "range": "± 77",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 391009,
            "range": "± 4896",
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
            "value": 1939601,
            "range": "± 19765",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 162854,
            "range": "± 2553",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1816721,
            "range": "± 19188",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 28048674,
            "range": "± 789249",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 710540,
            "range": "± 3232",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 16870374,
            "range": "± 166549",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1196600688,
            "range": "± 20674898",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4711,
            "range": "± 11",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 51611,
            "range": "± 291",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 807262,
            "range": "± 2775",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 59654,
            "range": "± 571",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 713533,
            "range": "± 9852",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8929211,
            "range": "± 323088",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1193,
            "range": "± 27",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14585,
            "range": "± 42",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 265014,
            "range": "± 7579",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21834,
            "range": "± 96",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 143676,
            "range": "± 811",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1324953,
            "range": "± 93776",
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
          "id": "b0a75147693b964a5d8ed60f12e1f0d1c01ee1a9",
          "message": "feat(yaml): rivet yaml to-json prints YAML through rivet's own parser; rivet-yaml README (#1094) (#1123)\n\n* feat(yaml): rivet yaml to-json prints YAML through rivet's own parser (#1094)\n\nAdds `rivet yaml to-json [--compact] <file|->` and rivet_yaml::json::to_json\nso tools that cannot link rivet-yaml (shell, CI, other languages) can read\nrivet YAML without a second parser. Output keeps document order; scalar keys\nare stringified; null, collection and tagged keys, tags, non-finite floats\nand multi-document input are refused with file:line:column, a non-zero exit\nand nothing on stdout. Anchors are expanded; merge keys are not expanded\n(Value::apply_merge exists for callers that want it).\n\nAlso carries the evidence the gates ask for: unit tests that kill the\ndiff-scoped mutants cargo-mutants reports in rivet-yaml/src/error.rs and\nrivet-yaml/src/json.rs (location reporting, message_without_location's path\nprefix, write_string's control-character bound, JsonError's Display), FEAT-139\nsatisfying REQ-408 so the traceability ratchet adds no new gated finding,\nand the tokio 1.52.1 -> 1.54.1 bump for RUSTSEC-2026-0386, which cargo-deny\nnow reports against the base commit as well.\n\nImplements: REQ-408\nRefs: REQ-346\n\nCo-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9\n\n* test(cli): serve integration waits out fleet load, not just a quiet machine (rivet#1123)\n\nThe health-wait in start_server_in polled for 30s. On 2026-10-25 the\nself-hosted fleet ran at load 200+ with all 14 runners busy (rivet main's\n64 mutation shards included), and loading the 742-artifact dogfood corpus\ntook past 30s for 136 of 145 serve tests in one run — every PR touching\nany Rust file went red on a timeout, not on a regression. The wait is a\nreadiness poll, not a timing assertion, so the budget goes to 90s.\n\ntest_reload_failure_preserves_state fetched /api/v1/stats immediately\nafter POST /reload and asserted 200; the reload is asynchronous and the\nsocket accepts connections while the store reloads, so under load the\nfetch raced a closed connection (status 0). It now retries until the\nserver answers, the same way start_server_in waits for health.\n\nBoth changes verified locally: the reload test and a serve test pass\n(5.3s / 3.3s), fmt and clippy clean.\n\n---------\n\nCo-authored-by: Claude Sonnet 5.5 <noreply@anthropic.com>",
          "timestamp": "2026-10-25T20:58:31+01:00",
          "tree_id": "53c3239c123165a282b97674f876da35252589de",
          "url": "https://github.com/pulseengine/rivet/commit/b0a75147693b964a5d8ed60f12e1f0d1c01ee1a9"
        },
        "date": 1792959096318,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84297,
            "range": "± 395",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 848146,
            "range": "± 11210",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14843073,
            "range": "± 873595",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2118,
            "range": "± 18",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26638,
            "range": "± 450",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 413073,
            "range": "± 10683",
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
            "value": 93,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1905941,
            "range": "± 49361",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 164879,
            "range": "± 2463",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1763841,
            "range": "± 32122",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 31818914,
            "range": "± 1296481",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 764718,
            "range": "± 3916",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 19348471,
            "range": "± 585353",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1395228635,
            "range": "± 15519366",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4854,
            "range": "± 766",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 70515,
            "range": "± 1184",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 906720,
            "range": "± 13606",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 57987,
            "range": "± 1186",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 680842,
            "range": "± 40402",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8895579,
            "range": "± 494397",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1132,
            "range": "± 13",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15711,
            "range": "± 206",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 377761,
            "range": "± 2018",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 24570,
            "range": "± 761",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 159726,
            "range": "± 2629",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1490333,
            "range": "± 43305",
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
          "id": "4c35119e4387ab94a9f0206747bc962334344af4",
          "message": "fix(cli): widen `rivet add --id` to the shapes the loader loads (#1088) (#1116)\n\n`validate_explicit_id` required every `--id` to end in an all-digit\nsuffix, but the artifact loader accepts any uppercase-alphanumeric\nsegments. Stores with id conventions like `SWREQ-FALCON-PREARM-P<nn>`\n(meld, 277 artifacts) or `REQ-README-ROSTER` (pulseengine.eu) load and\nresolve those ids, yet `rivet add --id` refused them — so the only way\nto add the next sibling was to hand-write YAML, exactly the workaround\n`add` is meant to replace. The reporter hit this twice more after\nfiling, both times falling back to hand-written YAML and once ending\nup with two conventions in one repo.\n\nThe write-path check now accepts whatever the loader accepts\n(uppercase-alphanumeric segments separated by single dashes, with at\nleast one dash and at least one uppercase letter somewhere). The\n`commit-ref-shape` warning emitted by validate still fires on ids whose\nlast segment isn't all-digit, so a project that relies on commit-\ntrailer coverage still gets told its ids can't be grep-matched by a\ntrailer parser — the two checks are now decoupled, as the issue asked.\n\nLands Fix 1 only. Fix 2 (sibling-aware next-id) and Fix 3 (per-project\nsuppression of commit-ref-shape) remain open follow-ups to #1088; Fix\n1 alone unblocks the reporter's immediate case.\n\nNew in-module unit tests cover both the newly-accepted shapes (the two\nfrom the body plus a few historical ones) and the shapes still\nrejected (lowercase, invalid chars, dash-position errors, no\nuppercase). A new integration test exercises the full `rivet add --id`\npath for the newly-accepted shapes. The error-message needle for the\nno-dash case moved from \"numeric suffix\" to \"at least one '-'\", so the\nexisting integration-test case updated to match.\n\nFixes: REQ-007\nRefs: REQ-330, #1088, #880\n\n\nClaude-Session: https://claude.ai/code/session_018W8367wHNy5cYzU8yqjAre\n\nCo-authored-by: Claude Opus 4.7 <noreply@anthropic.com>",
          "timestamp": "2026-10-26T06:50:10+01:00",
          "tree_id": "faedc9f12eec3cc3a0548c8bfa4103fd65379a9a",
          "url": "https://github.com/pulseengine/rivet/commit/4c35119e4387ab94a9f0206747bc962334344af4"
        },
        "date": 1792994804275,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 49354,
            "range": "± 906",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 599314,
            "range": "± 29844",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14227709,
            "range": "± 1457370",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1082,
            "range": "± 58",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 12802,
            "range": "± 631",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 251110,
            "range": "± 14172",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 49,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/1000",
            "value": 49,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 49,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1224745,
            "range": "± 94579",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 114587,
            "range": "± 9054",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1275110,
            "range": "± 16963",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 21799045,
            "range": "± 3669276",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 440356,
            "range": "± 9640",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 9873576,
            "range": "± 285629",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 607147607,
            "range": "± 12089848",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3017,
            "range": "± 64",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 33197,
            "range": "± 1655",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 509612,
            "range": "± 14502",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 34953,
            "range": "± 215",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 389547,
            "range": "± 8208",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 4743997,
            "range": "± 312361",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 521,
            "range": "± 24",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7242,
            "range": "± 335",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 138347,
            "range": "± 6135",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 13341,
            "range": "± 275",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 85468,
            "range": "± 1561",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 799349,
            "range": "± 52001",
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
          "id": "ad30e514b0c3ef77b832bb32bec16ef922be11f3",
          "message": "build(deps): drop wasmtime's compile cache, the only path to zstd with RUSTSEC-2026-0391/0398/0403/0410 (#1134)\n\nTrace: skip\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9",
          "timestamp": "2026-10-28T01:43:57+01:00",
          "tree_id": "9dd44a23b154fc546313c865e081f6d52700543a",
          "url": "https://github.com/pulseengine/rivet/commit/ad30e514b0c3ef77b832bb32bec16ef922be11f3"
        },
        "date": 1793149065837,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 49726,
            "range": "± 3288",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 584293,
            "range": "± 35036",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 11249338,
            "range": "± 949367",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1006,
            "range": "± 31",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 12343,
            "range": "± 270",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 239160,
            "range": "± 10399",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 48,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/1000",
            "value": 48,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 47,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1197111,
            "range": "± 31302",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 115899,
            "range": "± 4861",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1274105,
            "range": "± 14307",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 19681039,
            "range": "± 2103548",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 438053,
            "range": "± 26212",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 9500647,
            "range": "± 449998",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 599509962,
            "range": "± 19895495",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3072,
            "range": "± 51",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 34940,
            "range": "± 1111",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 533048,
            "range": "± 28551",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 35789,
            "range": "± 1320",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 387182,
            "range": "± 11046",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 4568425,
            "range": "± 67650",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 544,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7541,
            "range": "± 219",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 143305,
            "range": "± 4353",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 14569,
            "range": "± 491",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 96010,
            "range": "± 7283",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 853317,
            "range": "± 5477",
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
          "id": "ae27d6c717e136586d12ce7e9701d4a2e9360838",
          "message": "ci: run the 80-shard mutation sweep weekly (Sunday 01:00 UTC), not daily (#1132)\n\nTrace: skip\nRefs: #1117\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9",
          "timestamp": "2026-10-28T02:39:09+01:00",
          "tree_id": "f5ca636a53bba82ec6df5eb1dc6126c14e5d8eff",
          "url": "https://github.com/pulseengine/rivet/commit/ae27d6c717e136586d12ce7e9701d4a2e9360838"
        },
        "date": 1793152283000,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 79742,
            "range": "± 680",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 968881,
            "range": "± 12378",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13433488,
            "range": "± 779412",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1574,
            "range": "± 23",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 19299,
            "range": "± 405",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 420995,
            "range": "± 2393",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 76,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/1000",
            "value": 77,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 77,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 2044445,
            "range": "± 9281",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 175102,
            "range": "± 1132",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 2058276,
            "range": "± 6216",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 33186184,
            "range": "± 939793",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 733069,
            "range": "± 2771",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 17252734,
            "range": "± 151724",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1070254322,
            "range": "± 5885357",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4143,
            "range": "± 19",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 47670,
            "range": "± 183",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 941065,
            "range": "± 2962",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 52839,
            "range": "± 308",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 584112,
            "range": "± 4395",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8735367,
            "range": "± 365310",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 900,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 12072,
            "range": "± 68",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 330879,
            "range": "± 2128",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23171,
            "range": "± 158",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 148773,
            "range": "± 475",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1356836,
            "range": "± 19636",
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
          "id": "aaa73b04b3d2542cf6b6cc8615c013ee8ff6b0f9",
          "message": "fix(ci): liveness probe reads a run past 100 jobs as one queue, not as hosted starvation (#1131)\n\nTrace: skip\nFixes: #1130\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9",
          "timestamp": "2026-10-28T03:38:03+01:00",
          "tree_id": "bef14a121010246aa54576909b62d5f6c2672b1e",
          "url": "https://github.com/pulseengine/rivet/commit/aaa73b04b3d2542cf6b6cc8615c013ee8ff6b0f9"
        },
        "date": 1793155969811,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85124,
            "range": "± 2131",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 845040,
            "range": "± 74026",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14461291,
            "range": "± 667431",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2144,
            "range": "± 124",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26361,
            "range": "± 76",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 415103,
            "range": "± 3574",
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
            "value": 1896209,
            "range": "± 35350",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 163662,
            "range": "± 759",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1825864,
            "range": "± 102553",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 28028548,
            "range": "± 1263293",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 744527,
            "range": "± 15045",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 18303315,
            "range": "± 268162",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1360246496,
            "range": "± 15205293",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4839,
            "range": "± 103",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 69979,
            "range": "± 352",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 892205,
            "range": "± 12379",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 58463,
            "range": "± 524",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 684556,
            "range": "± 11756",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 11134926,
            "range": "± 795699",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1128,
            "range": "± 17",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15459,
            "range": "± 101",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 387198,
            "range": "± 5434",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23534,
            "range": "± 178",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 154128,
            "range": "± 726",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1429506,
            "range": "± 29315",
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
          "id": "b4122de604f0836956ca0bd748eb0086ea9d03e7",
          "message": "ci: the next fix to a fix hotspot opens a refactoring task (REQ-409) (#1133)\n\nA fix PR that changes a source file with 6 or more fix: commits on main\n(first-parent) in the last 60 days fails the new Fix hotspot workflow,\nunless the PR is a refactor: or its body cites an open issue labelled\nrefactor. The failure names each hotspot with its count and points at the\nnew refactoring issue template. AGENTS.md tells agents what to do when it\nfires.\n\nThe threshold is from rivet's history at d7ac8e5: main.rs 30, docs.rs 7,\nvalidate.rs 6, test_scanner.rs 5, then 4 or fewer, so 6 makes three files\nhotspots, main.rs among them.\n\ntools/ci/fix-hotspot_test.sh builds a synthetic repository and checks the\ngate fires on the negative controls and passes the allowed cases; it runs\nin the YAML Lint job. The workflow is a separate file so it re-runs on PR\ntitle or body edits, and it is not one of CI Gate's needs.\n\nImplements: REQ-409\n\nClaude-Session: https://claude.ai/code/session_01G5qpB7zvxLvdrvn5YRyj4R\n\nCo-authored-by: Claude Opus 5.5 <noreply@anthropic.com>",
          "timestamp": "2026-10-28T07:34:05+01:00",
          "tree_id": "41267abb84fbd5ff5bfbfa788c75364cc0b7fd92",
          "url": "https://github.com/pulseengine/rivet/commit/b4122de604f0836956ca0bd748eb0086ea9d03e7"
        },
        "date": 1793174343011,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84916,
            "range": "± 607",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 847652,
            "range": "± 12308",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12674801,
            "range": "± 685690",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2230,
            "range": "± 9",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25627,
            "range": "± 158",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 402217,
            "range": "± 10853",
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
            "value": 95,
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
            "value": 1899767,
            "range": "± 13958",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 164168,
            "range": "± 2076",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1739855,
            "range": "± 24820",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 25098250,
            "range": "± 1388012",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 733250,
            "range": "± 4475",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 17616924,
            "range": "± 173999",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1352447391,
            "range": "± 14972439",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4791,
            "range": "± 25",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 71203,
            "range": "± 832",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 894179,
            "range": "± 168570",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 59866,
            "range": "± 3629",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 715190,
            "range": "± 6252",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8227322,
            "range": "± 311553",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1213,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15209,
            "range": "± 66",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 361414,
            "range": "± 2268",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23428,
            "range": "± 3543",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 155218,
            "range": "± 1636",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1431480,
            "range": "± 25284",
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
          "id": "7ff4d554745a593bf1d1c390389904aa0f68deca",
          "message": "chore(security): drop 15 dead cargo-audit ignores, clear scc double-free, record gluesql's unsound advisories (#1136)\n\nTrace: skip\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9",
          "timestamp": "2026-10-28T11:10:08+01:00",
          "tree_id": "9628dfe827e71eee270ccefb6e47f8d6b6233723",
          "url": "https://github.com/pulseengine/rivet/commit/7ff4d554745a593bf1d1c390389904aa0f68deca"
        },
        "date": 1793186420312,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84604,
            "range": "± 659",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 848482,
            "range": "± 7480",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13703887,
            "range": "± 1387585",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2179,
            "range": "± 68",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26661,
            "range": "± 448",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 413177,
            "range": "± 6732",
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
            "value": 93,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1899840,
            "range": "± 49259",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 162362,
            "range": "± 1218",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1779000,
            "range": "± 34447",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 25094743,
            "range": "± 482577",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 744162,
            "range": "± 18218",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 17955759,
            "range": "± 233745",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1374282134,
            "range": "± 17914321",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4870,
            "range": "± 57",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 70479,
            "range": "± 470",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 923889,
            "range": "± 26291",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 59818,
            "range": "± 214",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 672941,
            "range": "± 5783",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 10235318,
            "range": "± 592379",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1233,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15448,
            "range": "± 226",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 387586,
            "range": "± 2423",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23527,
            "range": "± 139",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 152643,
            "range": "± 7402",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1437966,
            "range": "± 26319",
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
          "id": "106caa3df8fef0dd0ea0f49a5d1ae997986c687c",
          "message": "ci: cargo-vet checks a committed store instead of exempting everything on every run (#1137)\n\nTrace: skip\nRefs: #1110\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9",
          "timestamp": "2026-10-28T14:51:08+01:00",
          "tree_id": "9134cf26532d9ca42234b236f6a16d3ad76a42a3",
          "url": "https://github.com/pulseengine/rivet/commit/106caa3df8fef0dd0ea0f49a5d1ae997986c687c"
        },
        "date": 1793202479936,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85156,
            "range": "± 9310",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 846445,
            "range": "± 8006",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 15169149,
            "range": "± 1336772",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2280,
            "range": "± 9",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25580,
            "range": "± 68",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 411621,
            "range": "± 7191",
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
            "value": 93,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1887377,
            "range": "± 14683",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 162240,
            "range": "± 1411",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1786281,
            "range": "± 31504",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 30345584,
            "range": "± 1542471",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 746480,
            "range": "± 6480",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 18558507,
            "range": "± 172938",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1413567222,
            "range": "± 14132912",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4804,
            "range": "± 51",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 71468,
            "range": "± 470",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 903074,
            "range": "± 10932",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 57908,
            "range": "± 1067",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 684546,
            "range": "± 3303",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 11203820,
            "range": "± 631504",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1018,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15814,
            "range": "± 96",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 380219,
            "range": "± 2903",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23482,
            "range": "± 113",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 152962,
            "range": "± 2719",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1424391,
            "range": "± 22701",
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
          "id": "ffe7c784b8cda35bb68a0b430aa9cf92926b09d8",
          "message": "fix(externals): rivet lock pins what rivet sync fetches, not the local path: checkout (#1139)\n\nFixes: REQ-410\nRefs: REQ-311, FEAT-136, #1138, #1143\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9",
          "timestamp": "2026-10-28T19:38:38+01:00",
          "tree_id": "19981040352a9d44d26e5c1b87f2cd2def3dcbf0",
          "url": "https://github.com/pulseengine/rivet/commit/ffe7c784b8cda35bb68a0b430aa9cf92926b09d8"
        },
        "date": 1793220327647,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84599,
            "range": "± 286",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 844310,
            "range": "± 6864",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 15675110,
            "range": "± 985215",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2172,
            "range": "± 114",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 27369,
            "range": "± 702",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 417822,
            "range": "± 1620",
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
            "value": 1903240,
            "range": "± 35977",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 164956,
            "range": "± 844",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1745335,
            "range": "± 23653",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 27446746,
            "range": "± 962223",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 765260,
            "range": "± 7811",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 18369544,
            "range": "± 359444",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1361464037,
            "range": "± 12941917",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4860,
            "range": "± 24",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 69225,
            "range": "± 479",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 904183,
            "range": "± 11161",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 57642,
            "range": "± 598",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 669620,
            "range": "± 10754",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 9267511,
            "range": "± 729686",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1057,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15594,
            "range": "± 312",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 376265,
            "range": "± 2707",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 24045,
            "range": "± 251",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 157460,
            "range": "± 2200",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1491708,
            "range": "± 13336",
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
          "id": "e238de984f0a687fcfd8504494ef7e53917aef29",
          "message": "ci: run CI Gate in the merge queue and skip proof, E2E and bench jobs on docs-only PRs (REQ-412) (#1141)\n\nci.yml now runs on merge_group, so CI Gate reports for a queued PR once\nthe queue ruleset is on. The changes detector moves to\ntools/ci/detect-changes.sh. A merge_group run diffs against\nmerge_group.base_sha and a pull request against its base. Push,\nschedule, dispatch, an empty or bad base, and an empty diff all run\neverything, as before. The rust and wasm filters are unchanged apart\nfrom the detector's own files joining the rust set.\n\nTwo new outputs gate jobs that ran on every PR: proofs (rust, proofs/,\nverus/, Bazel inputs) for Verus and Rocq, and e2e (rust,\ntests/playwright/, and the served corpus artifacts/, safety/, arch/,\nrivet.yaml) for Playwright. Kani runs on rust. benchmarks.yml calls the\nsame detector from a hosted job and runs the benchmark on rust. All of\nthis is job-level if, with no workflow-level paths.\n\nIn a merge_group run every job that is not one of CI Gate's needs is\nskipped. Those jobs ran on the PR head and run again on the push to\nmain, and the queue reads only CI Gate. CI Gate's needs and logic are\nunchanged: success or skipped pass, anything else fails. semver-checks\nis PR-only and so skipped in the queue, which the gate already accepts.\n\ntools/ci/detect-changes_test.sh checks all four outputs on a synthetic\nrepository, including the fail-closed cases and that a queue run uses\nits base. It runs in the YAML Lint job.\n\nImplements: REQ-412\nRefs: REQ-291\n\nClaude-Session: https://claude.ai/code/session_01G5qpB7zvxLvdrvn5YRyj4R\n\nCo-authored-by: Claude Opus 5.5 <noreply@anthropic.com>",
          "timestamp": "2026-10-29T02:21:21+01:00",
          "tree_id": "1c7c4e570bccc696b7d06ed3f478e36753871387",
          "url": "https://github.com/pulseengine/rivet/commit/e238de984f0a687fcfd8504494ef7e53917aef29"
        },
        "date": 1793237672392,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 86802,
            "range": "± 562",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 885699,
            "range": "± 18093",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14824354,
            "range": "± 1000098",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2180,
            "range": "± 213",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26091,
            "range": "± 1044",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 404567,
            "range": "± 8897",
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
            "value": 94,
            "range": "± 2",
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
            "value": 1934474,
            "range": "± 65171",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 162769,
            "range": "± 2150",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1821670,
            "range": "± 14707",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 28232282,
            "range": "± 2227502",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 752823,
            "range": "± 6607",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 17830689,
            "range": "± 149653",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1358139983,
            "range": "± 12591265",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4813,
            "range": "± 47",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 70186,
            "range": "± 555",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 894459,
            "range": "± 2510",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 57426,
            "range": "± 877",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 678919,
            "range": "± 11949",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7912216,
            "range": "± 166714",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1039,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15291,
            "range": "± 60",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 359114,
            "range": "± 1437",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23998,
            "range": "± 85",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 160177,
            "range": "± 367",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1439915,
            "range": "± 11856",
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
          "id": "6728543f9c2b274d0b9373d23b1a3defa102767b",
          "message": "feat: recorded test results as evidence — coverage --tests (#1128) and release.require: results (#1129) (#1142)\n\nImplements: REQ-414, REQ-413\nRefs: DD-083, FEAT-071, REQ-238, REQ-384, REQ-410, REQ-411, #1128, #1129, #1143\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9",
          "timestamp": "2026-10-29T03:36:01+01:00",
          "tree_id": "75c32363c7f130ad9e788baea13d9df01b65cb84",
          "url": "https://github.com/pulseengine/rivet/commit/6728543f9c2b274d0b9373d23b1a3defa102767b"
        },
        "date": 1793242167555,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 86037,
            "range": "± 483",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 857105,
            "range": "± 7102",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 16555578,
            "range": "± 1334986",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2169,
            "range": "± 10",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 27873,
            "range": "± 277",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 427666,
            "range": "± 3866",
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
            "value": 1904974,
            "range": "± 24469",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 164743,
            "range": "± 1190",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1835145,
            "range": "± 20361",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 32531847,
            "range": "± 2578493",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 752752,
            "range": "± 7565",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 18451297,
            "range": "± 385599",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1396026192,
            "range": "± 16317413",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4826,
            "range": "± 15",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 70689,
            "range": "± 1338",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 932683,
            "range": "± 12120",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 60283,
            "range": "± 476",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 672592,
            "range": "± 8997",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 13027550,
            "range": "± 773827",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1091,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15711,
            "range": "± 660",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 382292,
            "range": "± 2093",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 24585,
            "range": "± 98",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 167436,
            "range": "± 2622",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1586931,
            "range": "± 15336",
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
          "distinct": false,
          "id": "715a5fffb4a8824a0b7bf35b1cbe7d9bcb8b97ff",
          "message": "ci: require same-repo push for npm publish, route fork PRs to hosted runners, pin actions (#1145)\n\n- require a same-repo push for npm publish\n- route fork PRs to hosted runners\n- untrack per-user agent settings\n- pin actions in secret-holding jobs\n\n`ci.yml` and `benchmarks.yml` are intentionally untouched here: #1141 (merge-queue pilot) edits them and a mechanical merge test showed a conflict in `ci.yml`. Fork routing and pinning for those two files will follow once #1141 lands.\n\n`.claude/settings.json` stays tracked. Its PostToolUse hook runs `rivet stamp all --created-by ai-assisted` after Edit/Write on `artifacts/**` or `safety/**`.\n\n\nClaude-Session: https://claude.ai/code/session_01G5qpB7zvxLvdrvn5YRyj4R\n\nCo-authored-by: Claude Opus 5.5 <noreply@anthropic.com>",
          "timestamp": "2026-10-29T06:49:50Z",
          "tree_id": "a3fb50438525da71864c209afe6e742b0c1b4b4e",
          "url": "https://github.com/pulseengine/rivet/commit/715a5fffb4a8824a0b7bf35b1cbe7d9bcb8b97ff"
        },
        "date": 1793282011118,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85958,
            "range": "± 1049",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 866761,
            "range": "± 2549",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 15047921,
            "range": "± 888606",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1918,
            "range": "± 78",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24214,
            "range": "± 102",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 390919,
            "range": "± 1592",
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
            "range": "± 7",
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
            "value": 1948766,
            "range": "± 13441",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 158620,
            "range": "± 589",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1836367,
            "range": "± 19267",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 25284256,
            "range": "± 714319",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 717372,
            "range": "± 10623",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 17359211,
            "range": "± 215350",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1228945570,
            "range": "± 20553267",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4633,
            "range": "± 28",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 52048,
            "range": "± 431",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 803942,
            "range": "± 12633",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 60789,
            "range": "± 3420",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 715802,
            "range": "± 4663",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 9924521,
            "range": "± 593954",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1043,
            "range": "± 11",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14887,
            "range": "± 430",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 268493,
            "range": "± 2321",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22496,
            "range": "± 615",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 143361,
            "range": "± 657",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1313541,
            "range": "± 20300",
            "unit": "ns/iter"
          }
        ]
      }
    ]
  }
}