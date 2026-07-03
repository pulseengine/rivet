window.BENCHMARK_DATA = {
  "lastUpdate": 1783058472146,
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
          "id": "7bac1354217dda4f7e38fe7e7af582380ea0930a",
          "message": "Merge pull request #609 from pulseengine/plan/v0.23-traceability-evidence\n\nplan(v0.23): traceability-evidence slices (release: v0.23.0)",
          "timestamp": "2026-06-27T03:46:25-05:00",
          "tree_id": "e2a0e74ef36fc29e710cabd7b76914bca67c1a28",
          "url": "https://github.com/pulseengine/rivet/commit/7bac1354217dda4f7e38fe7e7af582380ea0930a"
        },
        "date": 1782550523960,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 87319,
            "range": "± 2628",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 916896,
            "range": "± 18609",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14806326,
            "range": "± 878057",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2159,
            "range": "± 20",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 27573,
            "range": "± 210",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 356215,
            "range": "± 3266",
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
            "value": 1545522,
            "range": "± 35320",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 168570,
            "range": "± 3479",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1968193,
            "range": "± 25990",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 29791186,
            "range": "± 2302987",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 469615,
            "range": "± 6147",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 16013284,
            "range": "± 272692",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1315720528,
            "range": "± 13211152",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4258,
            "range": "± 50",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 62293,
            "range": "± 454",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 733893,
            "range": "± 7673",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 63316,
            "range": "± 820",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 706260,
            "range": "± 7173",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7915803,
            "range": "± 424628",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1224,
            "range": "± 18",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15742,
            "range": "± 297",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 326859,
            "range": "± 5353",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 24821,
            "range": "± 424",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 180350,
            "range": "± 3863",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1700696,
            "range": "± 31839",
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
          "id": "073502221c681848b89f8d74b95b3e5ef35ee621",
          "message": "Merge pull request #611 from pulseengine/feat/req-236-cited-source-verification\n\nfeat(schema): declare cited-source on verification types (REQ-236 pt1, #556)",
          "timestamp": "2026-06-27T04:53:31-05:00",
          "tree_id": "99ec5a622ee314eb38a9fa7bf8e941a11b4c542a",
          "url": "https://github.com/pulseengine/rivet/commit/073502221c681848b89f8d74b95b3e5ef35ee621"
        },
        "date": 1782554731009,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 79958,
            "range": "± 764",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 943138,
            "range": "± 4891",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14098528,
            "range": "± 593064",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1673,
            "range": "± 28",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 19323,
            "range": "± 60",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 345942,
            "range": "± 1653",
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
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 87,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1415327,
            "range": "± 42269",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 159544,
            "range": "± 333",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1862521,
            "range": "± 78455",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 38107930,
            "range": "± 2562656",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 427237,
            "range": "± 2075",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 14221150,
            "range": "± 259654",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 946491290,
            "range": "± 4569309",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3965,
            "range": "± 12",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 41086,
            "range": "± 145",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 747630,
            "range": "± 6472",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 53084,
            "range": "± 1006",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 584203,
            "range": "± 6927",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7171641,
            "range": "± 523426",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 875,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 11683,
            "range": "± 35",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 309224,
            "range": "± 1793",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22719,
            "range": "± 222",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 167456,
            "range": "± 857",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1561686,
            "range": "± 16595",
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
          "id": "a2ed9303356246be32afad9cfda9e5ca0a28a61d",
          "message": "Merge pull request #614 from pulseengine/fix/613-set-release-folded-scalar\n\nfix(modify): set-release no longer corrupts a folded scalar with a blank line (#613)",
          "timestamp": "2026-06-27T05:54:08-05:00",
          "tree_id": "90b89e5c53c4dc92a32813aeca45ad9e6d6968f7",
          "url": "https://github.com/pulseengine/rivet/commit/a2ed9303356246be32afad9cfda9e5ca0a28a61d"
        },
        "date": 1782558182551,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 86650,
            "range": "± 1757",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 912005,
            "range": "± 7026",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13776382,
            "range": "± 787463",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2162,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24445,
            "range": "± 54",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 371759,
            "range": "± 1821",
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
            "value": 1509230,
            "range": "± 17789",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 159084,
            "range": "± 1205",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1909272,
            "range": "± 21164",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 28313674,
            "range": "± 3838232",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 463468,
            "range": "± 5890",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 15877252,
            "range": "± 275040",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1320098619,
            "range": "± 12790334",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4255,
            "range": "± 10",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 58202,
            "range": "± 293",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 727251,
            "range": "± 2998",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 57186,
            "range": "± 4159",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 697906,
            "range": "± 3004",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7630002,
            "range": "± 408073",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1226,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15485,
            "range": "± 270",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 316936,
            "range": "± 1428",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 24862,
            "range": "± 231",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 174300,
            "range": "± 477",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1658837,
            "range": "± 19505",
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
          "id": "0c154fdf6a21e22170fe19695d0395c85b7efbf7",
          "message": "Merge pull request #615 from pulseengine/release/v0.22.1\n\nchore(release): v0.22.1 — fix --set-release folded-scalar corruption (#613)",
          "timestamp": "2026-06-27T06:25:07-05:00",
          "tree_id": "bd82e02c52ac7d24ca1db3677f512dff2c6dc5ba",
          "url": "https://github.com/pulseengine/rivet/commit/0c154fdf6a21e22170fe19695d0395c85b7efbf7"
        },
        "date": 1782560017765,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 79448,
            "range": "± 468",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 947431,
            "range": "± 4047",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 15370206,
            "range": "± 1134842",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1724,
            "range": "± 54",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 19200,
            "range": "± 53",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 339522,
            "range": "± 1071",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 88,
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
            "value": 90,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1408114,
            "range": "± 18225",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 158410,
            "range": "± 933",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1807806,
            "range": "± 29454",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 27295966,
            "range": "± 2324245",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 438426,
            "range": "± 2611",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 14188782,
            "range": "± 75639",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 993031312,
            "range": "± 5569362",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3933,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 40661,
            "range": "± 80",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 754467,
            "range": "± 1829",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 53717,
            "range": "± 185",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 601976,
            "range": "± 3722",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 6638493,
            "range": "± 185296",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 932,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 12464,
            "range": "± 23",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 284764,
            "range": "± 866",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22258,
            "range": "± 67",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 160503,
            "range": "± 1511",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1517652,
            "range": "± 30803",
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
          "id": "ea8f421b2bf0f2a894c2e5faeb4e3942dcd4e158",
          "message": "Merge pull request #616 from pulseengine/plan/req-240-coverage-cuttability\n\nplan(v0.23): REQ-240 — coverage-based release cuttability (#612)",
          "timestamp": "2026-06-27T06:25:56-05:00",
          "tree_id": "11252ee442b06cfd8c3b44aa0302bc8963ed936b",
          "url": "https://github.com/pulseengine/rivet/commit/ea8f421b2bf0f2a894c2e5faeb4e3942dcd4e158"
        },
        "date": 1782560119555,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84667,
            "range": "± 633",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 896953,
            "range": "± 9897",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12290830,
            "range": "± 285916",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2185,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25710,
            "range": "± 231",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 377909,
            "range": "± 1521",
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
            "value": 1501876,
            "range": "± 40432",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 162145,
            "range": "± 631",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1907752,
            "range": "± 22001",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 23735233,
            "range": "± 400584",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 465537,
            "range": "± 2575",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 16450648,
            "range": "± 72248",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1376011723,
            "range": "± 12807870",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4317,
            "range": "± 29",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 57540,
            "range": "± 325",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 727784,
            "range": "± 2314",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 61460,
            "range": "± 571",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 690575,
            "range": "± 2698",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7537755,
            "range": "± 62446",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1192,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15378,
            "range": "± 67",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 323887,
            "range": "± 1835",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 24859,
            "range": "± 144",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 174003,
            "range": "± 2188",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1617958,
            "range": "± 25680",
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
          "id": "2286237177e8ee2fe06616123f6207363a8217d3",
          "message": "Merge pull request #626 from pulseengine/fix/618-set-field-block-list\n\nfix(modify): --add-tag/--remove-tag no longer corrupt a block-style tags list (#625)",
          "timestamp": "2026-06-30T21:27:01+02:00",
          "tree_id": "72cee10b3d3c1a0d3df162653c2fa64d4afe4a34",
          "url": "https://github.com/pulseengine/rivet/commit/2286237177e8ee2fe06616123f6207363a8217d3"
        },
        "date": 1782848396648,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 88115,
            "range": "± 961",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 939918,
            "range": "± 119593",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 25340651,
            "range": "± 4238013",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1984,
            "range": "± 9",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24838,
            "range": "± 60",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 365124,
            "range": "± 10129",
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
            "value": 1511555,
            "range": "± 22597",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 169112,
            "range": "± 719",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 2060642,
            "range": "± 191589",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 45236914,
            "range": "± 9582943",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 486043,
            "range": "± 4671",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 16820539,
            "range": "± 1169887",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1166052188,
            "range": "± 30796697",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4220,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 44666,
            "range": "± 216",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 738249,
            "range": "± 39836",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 66427,
            "range": "± 360",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 754450,
            "range": "± 4260",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 12598162,
            "range": "± 1226140",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1255,
            "range": "± 10",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15185,
            "range": "± 311",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 247208,
            "range": "± 6497",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22133,
            "range": "± 94",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 163225,
            "range": "± 2902",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1480800,
            "range": "± 20175",
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
          "id": "69960d854c99703ca7b537a4c5aa145941f953ec",
          "message": "Merge pull request #630 from pulseengine/fix/validation-correctness-hunt\n\nfix: three correctness bugs from a dogfooding bug-hunt (validate self-link, empty release, add routing)",
          "timestamp": "2026-06-30T21:45:04+02:00",
          "tree_id": "3d1d30a2dad00ac56e8d1b51fc9208277c5bfb5b",
          "url": "https://github.com/pulseengine/rivet/commit/69960d854c99703ca7b537a4c5aa145941f953ec"
        },
        "date": 1782849301235,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84581,
            "range": "± 532",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 893051,
            "range": "± 7109",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12609597,
            "range": "± 589531",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2181,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25836,
            "range": "± 3236",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 347518,
            "range": "± 26489",
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
            "value": 1532666,
            "range": "± 24995",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 162457,
            "range": "± 4742",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1887237,
            "range": "± 23310",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 27226430,
            "range": "± 1413972",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 465989,
            "range": "± 4042",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 15514631,
            "range": "± 152636",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1250090578,
            "range": "± 15795085",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4373,
            "range": "± 15",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 57896,
            "range": "± 401",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 747796,
            "range": "± 8322",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 60566,
            "range": "± 793",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 719005,
            "range": "± 3124",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 9316210,
            "range": "± 545127",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1192,
            "range": "± 16",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15410,
            "range": "± 58",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 332400,
            "range": "± 3055",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 26036,
            "range": "± 132",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 185773,
            "range": "± 2107",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1733081,
            "range": "± 12357",
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
          "id": "6945cf5b356d3bca9eb0a729049e518e2aa2049a",
          "message": "Merge pull request #633 from pulseengine/fix/rustsec-2026-0188-wasmtime\n\nbuild(deps): bump wasmtime 44.0.3 → 45.0.3 for RUSTSEC-2026-0188 (#632)",
          "timestamp": "2026-06-30T22:03:27+02:00",
          "tree_id": "d38b91cbfa88445eeeaf1d13fa7bb89cbfd0523a",
          "url": "https://github.com/pulseengine/rivet/commit/6945cf5b356d3bca9eb0a729049e518e2aa2049a"
        },
        "date": 1782850458538,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 86373,
            "range": "± 332",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 918972,
            "range": "± 11490",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 17096413,
            "range": "± 1176247",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2185,
            "range": "± 9",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26769,
            "range": "± 140",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 360653,
            "range": "± 3180",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 92,
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
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1533948,
            "range": "± 19503",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 166362,
            "range": "± 633",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1952815,
            "range": "± 23840",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 35002636,
            "range": "± 3454096",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 473452,
            "range": "± 5344",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 16359401,
            "range": "± 323480",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1328785226,
            "range": "± 12246048",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4245,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 59360,
            "range": "± 190",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 729334,
            "range": "± 4368",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 59469,
            "range": "± 254",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 692218,
            "range": "± 2920",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7924973,
            "range": "± 364860",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1170,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15926,
            "range": "± 126",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 334820,
            "range": "± 3278",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 25374,
            "range": "± 257",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 184487,
            "range": "± 812",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1723105,
            "range": "± 23035",
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
          "id": "54d545ddc8685ba84d598d72aae8db7fd452129e",
          "message": "Merge pull request #635 from pulseengine/release/v0.22.2\n\nchore(release): v0.22.2 — dogfooding data-loss/correctness fixes + wasmtime security",
          "timestamp": "2026-06-30T22:19:30+02:00",
          "tree_id": "3447a089cf341026c55284363cd4941c82cf3f77",
          "url": "https://github.com/pulseengine/rivet/commit/54d545ddc8685ba84d598d72aae8db7fd452129e"
        },
        "date": 1782851316917,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85945,
            "range": "± 1619",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 898664,
            "range": "± 5925",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 17700070,
            "range": "± 1456779",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2123,
            "range": "± 26",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25486,
            "range": "± 408",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 381634,
            "range": "± 5299",
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
            "value": 1602837,
            "range": "± 120258",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 162616,
            "range": "± 2620",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1919437,
            "range": "± 42133",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 36447240,
            "range": "± 2729927",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 482990,
            "range": "± 8729",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 16220653,
            "range": "± 343628",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1317815791,
            "range": "± 15298695",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4239,
            "range": "± 72",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 63090,
            "range": "± 405",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 747455,
            "range": "± 12596",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 63508,
            "range": "± 1137",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 709317,
            "range": "± 7023",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8283282,
            "range": "± 851242",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1352,
            "range": "± 28",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15335,
            "range": "± 334",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 322074,
            "range": "± 3056",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 25353,
            "range": "± 309",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 179720,
            "range": "± 5890",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1693252,
            "range": "± 33788",
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
          "id": "48674cd06241b3bded8480eca0a5707be70428c7",
          "message": "Merge pull request #637 from pulseengine/plan/v0.24-v0.25-roadmap\n\nplan(roadmap): map open issues into v0.23/v0.24/v0.25 (REQ-241..251)",
          "timestamp": "2026-07-01T06:09:04+02:00",
          "tree_id": "33e169af626c1667f057feba25b49b4559262bfb",
          "url": "https://github.com/pulseengine/rivet/commit/48674cd06241b3bded8480eca0a5707be70428c7"
        },
        "date": 1782879738293,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 90454,
            "range": "± 346",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 968590,
            "range": "± 31784",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 21169687,
            "range": "± 1420760",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1958,
            "range": "± 10",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24816,
            "range": "± 55",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 356415,
            "range": "± 6413",
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
            "value": 1522998,
            "range": "± 9333",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 170599,
            "range": "± 635",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 2001711,
            "range": "± 12218",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 42583151,
            "range": "± 2670195",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 454201,
            "range": "± 1858",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 16095325,
            "range": "± 186019",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1136634456,
            "range": "± 15892879",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4252,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 44234,
            "range": "± 199",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 740387,
            "range": "± 9555",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 58346,
            "range": "± 1675",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 737200,
            "range": "± 4440",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 10042481,
            "range": "± 483859",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1327,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15550,
            "range": "± 172",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 233502,
            "range": "± 2319",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 24078,
            "range": "± 557",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 166198,
            "range": "± 560",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1578340,
            "range": "± 39214",
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
          "id": "18dd82b9cb68e6d9bc31025828713aa713399464",
          "message": "Merge pull request #638 from pulseengine/fix/620-validate-direct-parity\n\nfix(validate): validate and validate --direct produce identical output (REQ-241, #620)",
          "timestamp": "2026-07-01T06:16:47+02:00",
          "tree_id": "f52f322374bff49cfcf412a115b379bffd34fcd4",
          "url": "https://github.com/pulseengine/rivet/commit/18dd82b9cb68e6d9bc31025828713aa713399464"
        },
        "date": 1782880176135,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 87170,
            "range": "± 1184",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 951255,
            "range": "± 5685",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 17212385,
            "range": "± 1305402",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2569,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 27252,
            "range": "± 44",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 366853,
            "range": "± 6558",
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
            "value": 1526419,
            "range": "± 17097",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 167155,
            "range": "± 802",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1958558,
            "range": "± 17274",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 35590112,
            "range": "± 5008609",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 458867,
            "range": "± 1377",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 15674418,
            "range": "± 962330",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1143242878,
            "range": "± 17099660",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4260,
            "range": "± 13",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 46068,
            "range": "± 133",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 740320,
            "range": "± 7814",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 58831,
            "range": "± 155",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 739214,
            "range": "± 3977",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 9272539,
            "range": "± 755737",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1415,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 16415,
            "range": "± 47",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 250194,
            "range": "± 8914",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23732,
            "range": "± 107",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 166415,
            "range": "± 1063",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1577182,
            "range": "± 23426",
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
          "id": "82042557fc11df88013cf5edbf4ad6a103d9e121",
          "message": "Merge pull request #639 from pulseengine/fix/603-verify-workspace-scan\n\nfix(verify): default marker scan reaches member crates in a workspace (REQ-242, #603)",
          "timestamp": "2026-07-01T06:22:43+02:00",
          "tree_id": "358c0a6b858a25361aa59b48e722c886b5eebdd0",
          "url": "https://github.com/pulseengine/rivet/commit/82042557fc11df88013cf5edbf4ad6a103d9e121"
        },
        "date": 1782880397570,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84982,
            "range": "± 2239",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 937887,
            "range": "± 13251",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 19876181,
            "range": "± 1938906",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1978,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24905,
            "range": "± 63",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 360072,
            "range": "± 3427",
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
            "value": 1566847,
            "range": "± 20765",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 166776,
            "range": "± 490",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1927254,
            "range": "± 25257",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 54785908,
            "range": "± 4712206",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 455377,
            "range": "± 5462",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 15532012,
            "range": "± 145282",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1135854852,
            "range": "± 20275140",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4326,
            "range": "± 84",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 48133,
            "range": "± 706",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 824060,
            "range": "± 17565",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 65703,
            "range": "± 300",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 733219,
            "range": "± 11848",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8432456,
            "range": "± 912957",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1258,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14950,
            "range": "± 53",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 235963,
            "range": "± 3078",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23803,
            "range": "± 66",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 162517,
            "range": "± 1534",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1594461,
            "range": "± 7732",
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
          "id": "96dcb9a8950abaef168c90340dbe95bc3c71f191",
          "message": "Merge pull request #640 from pulseengine/fix/577-validate-commit-name-parity\n\nfix(validate): sync artifact-id shape with the commit-trailer parser (REQ-239, #577)",
          "timestamp": "2026-07-01T06:53:55+02:00",
          "tree_id": "e0d86e0b8dbe12b9bd66f8e08f60a2f09acdc2b6",
          "url": "https://github.com/pulseengine/rivet/commit/96dcb9a8950abaef168c90340dbe95bc3c71f191"
        },
        "date": 1782882907925,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85164,
            "range": "± 447",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 910143,
            "range": "± 4344",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14231341,
            "range": "± 1075820",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2118,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26624,
            "range": "± 402",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 370003,
            "range": "± 2040",
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
            "value": 1503607,
            "range": "± 17693",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 163248,
            "range": "± 1464",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1930746,
            "range": "± 23836",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 35804727,
            "range": "± 5035301",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 470809,
            "range": "± 4895",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 14063642,
            "range": "± 253412",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1104982053,
            "range": "± 12566027",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4440,
            "range": "± 22",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 59783,
            "range": "± 355",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 793497,
            "range": "± 30113",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 62282,
            "range": "± 382",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 683916,
            "range": "± 3491",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7665862,
            "range": "± 334422",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1244,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15904,
            "range": "± 72",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 331277,
            "range": "± 7566",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 24066,
            "range": "± 278",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 171662,
            "range": "± 4689",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1598248,
            "range": "± 18148",
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
          "id": "49b44e547430b6133cdd01783d0f5f3a520933c1",
          "message": "Merge pull request #641 from pulseengine/feat/req-240-coverage-cuttability\n\nfeat(release): configurable release-status readiness — ready-when + coverage (REQ-240, #612)",
          "timestamp": "2026-07-01T07:14:23+02:00",
          "tree_id": "c7d10e448e9109e229905d174022f408cefab031",
          "url": "https://github.com/pulseengine/rivet/commit/49b44e547430b6133cdd01783d0f5f3a520933c1"
        },
        "date": 1782883595124,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 86896,
            "range": "± 1148",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 911892,
            "range": "± 17621",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 20455206,
            "range": "± 1274052",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1962,
            "range": "± 24",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24894,
            "range": "± 136",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 361123,
            "range": "± 1474",
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
            "range": "± 2",
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
            "value": 1545783,
            "range": "± 19386",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 165581,
            "range": "± 665",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1981213,
            "range": "± 26580",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 33127170,
            "range": "± 3784031",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 439464,
            "range": "± 2119",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 13889302,
            "range": "± 810331",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 959470154,
            "range": "± 18119275",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4232,
            "range": "± 93",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 44678,
            "range": "± 415",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 716120,
            "range": "± 4303",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 62500,
            "range": "± 291",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 721803,
            "range": "± 2634",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8317333,
            "range": "± 1210513",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1309,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14847,
            "range": "± 57",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 234773,
            "range": "± 2041",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 24276,
            "range": "± 312",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 175100,
            "range": "± 3355",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1584272,
            "range": "± 18194",
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
          "id": "cc2a638470e08fe6ec1a0636ebade0e111ca9eae",
          "message": "Merge pull request #642 from pulseengine/feat/req-237-aspice-chain-hint\n\nfeat(validate): lifecycle gap names the ASPICE verification chain (REQ-237, #350)",
          "timestamp": "2026-07-01T07:40:01+02:00",
          "tree_id": "4f65b31ebec61e52d38f201e66605d43550d24c7",
          "url": "https://github.com/pulseengine/rivet/commit/cc2a638470e08fe6ec1a0636ebade0e111ca9eae"
        },
        "date": 1782885561382,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84526,
            "range": "± 2101",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 932204,
            "range": "± 5391",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14476339,
            "range": "± 308932",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1959,
            "range": "± 14",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24875,
            "range": "± 50",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 366760,
            "range": "± 2600",
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
            "value": 1558532,
            "range": "± 23990",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 164870,
            "range": "± 1209",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1953717,
            "range": "± 19453",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 30951451,
            "range": "± 647641",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 437988,
            "range": "± 3953",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 13837711,
            "range": "± 133647",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 966378623,
            "range": "± 16985466",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4259,
            "range": "± 26",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 45639,
            "range": "± 221",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 747870,
            "range": "± 3302",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 65297,
            "range": "± 152",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 739769,
            "range": "± 3413",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8368868,
            "range": "± 212356",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1307,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15060,
            "range": "± 101",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 241498,
            "range": "± 5622",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23940,
            "range": "± 74",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 168796,
            "range": "± 681",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1583008,
            "range": "± 11294",
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
          "id": "57eefd53513c70f77e862cc23824367874608add",
          "message": "Merge pull request #643 from pulseengine/feat/req-236-named-test-check\n\nfeat(check): rivet check verification-evidence — named-test-exists oracle (REQ-236, #556)",
          "timestamp": "2026-07-01T08:08:24+02:00",
          "tree_id": "dff393e7d81e164cbdc404e1479f5f03f4966696",
          "url": "https://github.com/pulseengine/rivet/commit/57eefd53513c70f77e862cc23824367874608add"
        },
        "date": 1782887488957,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84542,
            "range": "± 842",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 897638,
            "range": "± 4506",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 16691313,
            "range": "± 1095988",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2174,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26275,
            "range": "± 117",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 382879,
            "range": "± 2991",
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
            "range": "± 1",
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
            "value": 1521185,
            "range": "± 28451",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 164379,
            "range": "± 718",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1860230,
            "range": "± 30973",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 27279600,
            "range": "± 1422247",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 479864,
            "range": "± 2539",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 16060313,
            "range": "± 207725",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1291268716,
            "range": "± 17483216",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4385,
            "range": "± 18",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 62819,
            "range": "± 219",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 773861,
            "range": "± 7307",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 62017,
            "range": "± 212",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 706808,
            "range": "± 3024",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7619827,
            "range": "± 130899",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1157,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15665,
            "range": "± 137",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 333115,
            "range": "± 5533",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23747,
            "range": "± 201",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 168853,
            "range": "± 654",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1617510,
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
          "id": "aa7aeb5cfec65c81277991008b45bd8542ddf88c",
          "message": "Merge pull request #645 from pulseengine/feat/req-238-result-trace\n\nfeat(trace): rivet trace-results — forward req→test-result trace (REQ-238 pt1, #547)",
          "timestamp": "2026-07-01T10:05:46+02:00",
          "tree_id": "e66d4b575fb9e1d0dc039d38c50bd0b153a55490",
          "url": "https://github.com/pulseengine/rivet/commit/aa7aeb5cfec65c81277991008b45bd8542ddf88c"
        },
        "date": 1782894749521,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84759,
            "range": "± 286",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 882841,
            "range": "± 11956",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14261487,
            "range": "± 1006765",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2141,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 27160,
            "range": "± 101",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 350134,
            "range": "± 2036",
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
            "value": 1511172,
            "range": "± 18726",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 162887,
            "range": "± 2893",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1904926,
            "range": "± 10061",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 30916420,
            "range": "± 2783404",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 482188,
            "range": "± 2756",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 16505610,
            "range": "± 212279",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1283793200,
            "range": "± 13917647",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4321,
            "range": "± 31",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 62321,
            "range": "± 194",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 802834,
            "range": "± 2771",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 61307,
            "range": "± 329",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 712160,
            "range": "± 2006",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 10043404,
            "range": "± 420719",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1149,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 16160,
            "range": "± 37",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 389444,
            "range": "± 4814",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22588,
            "range": "± 139",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 158334,
            "range": "± 781",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1482070,
            "range": "± 21504",
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
          "id": "77d58959ed60773f32d803af665ef784e2d8820a",
          "message": "Merge pull request #646 from pulseengine/release/v0.23.0\n\nchore(release): v0.23.0 — Traceability evidence (REQ-236..242)",
          "timestamp": "2026-07-01T19:07:19+02:00",
          "tree_id": "6fe23aff95e51a7038969b895ce4b5e99ae6c897",
          "url": "https://github.com/pulseengine/rivet/commit/77d58959ed60773f32d803af665ef784e2d8820a"
        },
        "date": 1782926185340,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 80218,
            "range": "± 2210",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 979860,
            "range": "± 12065",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 16840497,
            "range": "± 1041254",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1698,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 19248,
            "range": "± 36",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 349276,
            "range": "± 1639",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 90,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/1000",
            "value": 89,
            "range": "± 1",
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
            "value": 1443658,
            "range": "± 74775",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 163676,
            "range": "± 998",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1884717,
            "range": "± 14030",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 47181056,
            "range": "± 2752032",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 459455,
            "range": "± 3245",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 15641799,
            "range": "± 326554",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 931701686,
            "range": "± 8664153",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3937,
            "range": "± 16",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 41936,
            "range": "± 146",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 789935,
            "range": "± 12630",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 53679,
            "range": "± 248",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 612490,
            "range": "± 3253",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 10018648,
            "range": "± 591310",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 955,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 11517,
            "range": "± 43",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 307557,
            "range": "± 5773",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 20423,
            "range": "± 85",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 145378,
            "range": "± 611",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1344591,
            "range": "± 40164",
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
          "id": "d2485265fa756db5dfa5666c07b94ba68e3ab710",
          "message": "Merge pull request #647 from pulseengine/feat/req-244-overview-gaps\n\nfeat(serve): surface per-artifact lifecycle gaps in the artifacts API (REQ-244 pt1, #622)",
          "timestamp": "2026-07-01T22:42:49+02:00",
          "tree_id": "173de730e6159da7fb5868e5ef80119fa1cc6b31",
          "url": "https://github.com/pulseengine/rivet/commit/d2485265fa756db5dfa5666c07b94ba68e3ab710"
        },
        "date": 1782939428776,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 78827,
            "range": "± 295",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 965195,
            "range": "± 4028",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 16687699,
            "range": "± 1357659",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1669,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 19377,
            "range": "± 54",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 391534,
            "range": "± 6359",
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
            "value": 1419461,
            "range": "± 6956",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 161789,
            "range": "± 583",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1862576,
            "range": "± 10701",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 42311063,
            "range": "± 2927605",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 439610,
            "range": "± 3257",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 14713577,
            "range": "± 180159",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 930114664,
            "range": "± 6369137",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3979,
            "range": "± 14",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 41288,
            "range": "± 179",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 739354,
            "range": "± 6687",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 52812,
            "range": "± 224",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 609541,
            "range": "± 4703",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 9084844,
            "range": "± 428631",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 930,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 11673,
            "range": "± 27",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 305052,
            "range": "± 1270",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 20272,
            "range": "± 37",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 141820,
            "range": "± 376",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1327892,
            "range": "± 26080",
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
          "id": "f2329f0087d85fb6d08a5724e69ba60f2c95f698",
          "message": "Merge pull request #651 from pulseengine/feat/req-244-overview-badge\n\nfeat(serve): overview flags per-artifact lifecycle gaps with a badge (REQ-244 pt2, #622)",
          "timestamp": "2026-07-02T06:48:54+02:00",
          "tree_id": "e051f48783284ded03304d6962c54e9a3a165a86",
          "url": "https://github.com/pulseengine/rivet/commit/f2329f0087d85fb6d08a5724e69ba60f2c95f698"
        },
        "date": 1782968657462,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 86478,
            "range": "± 1580",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 927420,
            "range": "± 41475",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 18089641,
            "range": "± 1958255",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1929,
            "range": "± 28",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24958,
            "range": "± 75",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 363921,
            "range": "± 5354",
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
            "value": 1540021,
            "range": "± 26354",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 167233,
            "range": "± 770",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1899040,
            "range": "± 31780",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 31443027,
            "range": "± 2796691",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 454824,
            "range": "± 2050",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 15078465,
            "range": "± 196515",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1104813349,
            "range": "± 18575766",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4270,
            "range": "± 29",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 45312,
            "range": "± 124",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 754562,
            "range": "± 5737",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 63649,
            "range": "± 695",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 738004,
            "range": "± 4530",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8306787,
            "range": "± 355749",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1270,
            "range": "± 99",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15059,
            "range": "± 79",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 231519,
            "range": "± 5336",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21441,
            "range": "± 78",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 146809,
            "range": "± 518",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1353192,
            "range": "± 18755",
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
          "id": "cdeb7f812935a9a5d68cdcec52e63b3ff2d82773",
          "message": "Merge pull request #650 from pulseengine/fix/issue-648-bidirectional-unauthorable-inverse\n\nfix(check): skip bidirectional oracle when inverse is not authorable (#648)",
          "timestamp": "2026-07-02T06:51:31+02:00",
          "tree_id": "4ee477c8a7752cb20925e91ac41309382edcc73f",
          "url": "https://github.com/pulseengine/rivet/commit/cdeb7f812935a9a5d68cdcec52e63b3ff2d82773"
        },
        "date": 1782968831379,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85715,
            "range": "± 3239",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 903478,
            "range": "± 27409",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 16453856,
            "range": "± 1176580",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2166,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 27061,
            "range": "± 150",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 369890,
            "range": "± 2697",
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
            "value": 1520620,
            "range": "± 38786",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 162830,
            "range": "± 434",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1900920,
            "range": "± 27224",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 39911679,
            "range": "± 3817177",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 485540,
            "range": "± 5940",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 16136563,
            "range": "± 204785",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1296287653,
            "range": "± 15299635",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4298,
            "range": "± 50",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60416,
            "range": "± 615",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 753041,
            "range": "± 7319",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 58692,
            "range": "± 376",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 715099,
            "range": "± 12949",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 10421157,
            "range": "± 712275",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1178,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14127,
            "range": "± 388",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 329876,
            "range": "± 5634",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22559,
            "range": "± 101",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 158920,
            "range": "± 1720",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1474082,
            "range": "± 31417",
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
          "id": "ce754d3603ee9f63dc450682545941f39155acf7",
          "message": "Merge pull request #653 from pulseengine/feat/req-243-source-open\n\nfeat(serve): artifact view source link opens the /source viewer at the artifact line (REQ-243, #623)",
          "timestamp": "2026-07-02T08:02:51+02:00",
          "tree_id": "06c74ad5c657721ef2d56733c4e27679d316ea07",
          "url": "https://github.com/pulseengine/rivet/commit/ce754d3603ee9f63dc450682545941f39155acf7"
        },
        "date": 1782973080675,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85172,
            "range": "± 1777",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 891795,
            "range": "± 4823",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 15677925,
            "range": "± 963089",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2216,
            "range": "± 48",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24540,
            "range": "± 622",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 345423,
            "range": "± 1597",
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
            "value": 1495063,
            "range": "± 20110",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 159245,
            "range": "± 576",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1852379,
            "range": "± 47422",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 25040374,
            "range": "± 2068891",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 488852,
            "range": "± 2983",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 15805932,
            "range": "± 245189",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1249720490,
            "range": "± 18372514",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4298,
            "range": "± 13",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 61564,
            "range": "± 214",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 724166,
            "range": "± 2411",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 57283,
            "range": "± 788",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 704494,
            "range": "± 12313",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7866729,
            "range": "± 368338",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1261,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14532,
            "range": "± 147",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 330159,
            "range": "± 4244",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22326,
            "range": "± 134",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 156113,
            "range": "± 1941",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1465331,
            "range": "± 26969",
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
          "id": "84ff1209a8687e023561da50046c900829194854",
          "message": "Merge pull request #654 from pulseengine/feat/req-238-trace-results-view\n\nfeat(serve): artifact detail renders a Test Result Trace panel (REQ-238, #547)",
          "timestamp": "2026-07-02T08:27:43+02:00",
          "tree_id": "a87465c121e082bce273174e697ebfc8bc69ae2f",
          "url": "https://github.com/pulseengine/rivet/commit/84ff1209a8687e023561da50046c900829194854"
        },
        "date": 1782974203010,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 86777,
            "range": "± 1071",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 902693,
            "range": "± 7130",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 16811663,
            "range": "± 1076055",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2153,
            "range": "± 13",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26324,
            "range": "± 165",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 360812,
            "range": "± 3561",
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
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1518626,
            "range": "± 28852",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 161043,
            "range": "± 4506",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1955640,
            "range": "± 70331",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 48144537,
            "range": "± 4452384",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 468202,
            "range": "± 14368",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 16613230,
            "range": "± 327245",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1290249959,
            "range": "± 14760596",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4451,
            "range": "± 36",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 66134,
            "range": "± 453",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 758593,
            "range": "± 8766",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 60335,
            "range": "± 1896",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 712052,
            "range": "± 2839",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 9964594,
            "range": "± 742073",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1249,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15495,
            "range": "± 234",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 333628,
            "range": "± 5136",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22451,
            "range": "± 179",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 157257,
            "range": "± 1046",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1483721,
            "range": "± 21598",
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
          "id": "a23af22ba2abbb71837f1e9b1df5c35c3ff8f79e",
          "message": "Merge pull request #655 from pulseengine/release/v0.24.0\n\nchore(release): v0.24.0 — serve traceability UX (REQ-238, REQ-243, REQ-244)",
          "timestamp": "2026-07-02T09:08:20+02:00",
          "tree_id": "969424b49072574bbade6ff3e6a8e9c13fb52453",
          "url": "https://github.com/pulseengine/rivet/commit/a23af22ba2abbb71837f1e9b1df5c35c3ff8f79e"
        },
        "date": 1782977493892,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84982,
            "range": "± 2853",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 908896,
            "range": "± 4326",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12404317,
            "range": "± 897535",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2258,
            "range": "± 9",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25442,
            "range": "± 2517",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 349193,
            "range": "± 1906",
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
            "value": 1532960,
            "range": "± 23686",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 163157,
            "range": "± 544",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1933698,
            "range": "± 41284",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 36843389,
            "range": "± 2758547",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 478226,
            "range": "± 2575",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 16175498,
            "range": "± 185627",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1251839821,
            "range": "± 16994738",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4390,
            "range": "± 112",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60559,
            "range": "± 787",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 753835,
            "range": "± 7951",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 57216,
            "range": "± 394",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 702913,
            "range": "± 2201",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7764547,
            "range": "± 266338",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1240,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14755,
            "range": "± 78",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 343878,
            "range": "± 4138",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23141,
            "range": "± 255",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 157633,
            "range": "± 2346",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1472190,
            "range": "± 8478",
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
          "id": "68de65c6153cbff3da078d22019dde6d1fbcfac7",
          "message": "Merge pull request #659 from pulseengine/feat/req-246-authoring-dd\n\ndocs(decision): DD-071 — schema-aware LSP completion for REQ-246 authoring friction (#546)",
          "timestamp": "2026-07-02T16:24:17+02:00",
          "tree_id": "1e35c988f56a9bdf17efe3f6804a9e25bdee909c",
          "url": "https://github.com/pulseengine/rivet/commit/68de65c6153cbff3da078d22019dde6d1fbcfac7"
        },
        "date": 1783002785031,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 88069,
            "range": "± 1473",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 933086,
            "range": "± 7320",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 20600244,
            "range": "± 1274607",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1986,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24825,
            "range": "± 570",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 359217,
            "range": "± 1207",
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
            "value": 1512339,
            "range": "± 74595",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 165898,
            "range": "± 721",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1902087,
            "range": "± 65418",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 47554912,
            "range": "± 4641890",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 453296,
            "range": "± 4502",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 14861113,
            "range": "± 452104",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1098098997,
            "range": "± 19028506",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4212,
            "range": "± 66",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 43888,
            "range": "± 403",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 732071,
            "range": "± 9388",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 59098,
            "range": "± 136",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 729458,
            "range": "± 2486",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 12062492,
            "range": "± 895907",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1230,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14978,
            "range": "± 54",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 251668,
            "range": "± 7507",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21166,
            "range": "± 349",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 143906,
            "range": "± 1186",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1355461,
            "range": "± 8705",
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
          "id": "c7a59b389ffb7a59978f1833b664db214b275037",
          "message": "Merge pull request #660 from pulseengine/fix/quick-xml-rustsec-2026-0194-0195\n\nfix(security): bump quick-xml 0.37→0.41 (RUSTSEC-2026-0194/0195)",
          "timestamp": "2026-07-02T17:04:49+02:00",
          "tree_id": "d867b3de847f2a471d8a8d10aae37ce41bdf9cef",
          "url": "https://github.com/pulseengine/rivet/commit/c7a59b389ffb7a59978f1833b664db214b275037"
        },
        "date": 1783005227790,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 88542,
            "range": "± 935",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 915458,
            "range": "± 6333",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13019488,
            "range": "± 389061",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2153,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 27575,
            "range": "± 607",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 361707,
            "range": "± 16016",
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
            "value": 1507051,
            "range": "± 54184",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 162506,
            "range": "± 654",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1860283,
            "range": "± 17065",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 24716536,
            "range": "± 1658759",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 458177,
            "range": "± 15711",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 15326968,
            "range": "± 255564",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1253857697,
            "range": "± 12647665",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4338,
            "range": "± 16",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 63961,
            "range": "± 236",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 784863,
            "range": "± 2273",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 60719,
            "range": "± 410",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 712874,
            "range": "± 3123",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7710900,
            "range": "± 172927",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1160,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15349,
            "range": "± 69",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 336039,
            "range": "± 768",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 24168,
            "range": "± 99",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 174838,
            "range": "± 3547",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1639434,
            "range": "± 9483",
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
          "id": "8d53797e5722f45c294d925af3c04ae38d8ef2cd",
          "message": "Merge pull request #664 from pulseengine/ci/paths-filter-skip-rust-on-docs\n\nci: skip compile-heavy Rust jobs on artifact/docs-only PRs (runner load)",
          "timestamp": "2026-07-03T06:15:50+02:00",
          "tree_id": "658946f5221c902c8e444172211f9da1f348c266",
          "url": "https://github.com/pulseengine/rivet/commit/8d53797e5722f45c294d925af3c04ae38d8ef2cd"
        },
        "date": 1783052691060,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85687,
            "range": "± 2362",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 907467,
            "range": "± 4287",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 16503201,
            "range": "± 1130227",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2142,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26782,
            "range": "± 138",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 360113,
            "range": "± 3427",
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
            "value": 1508590,
            "range": "± 23625",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 164637,
            "range": "± 1899",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1932543,
            "range": "± 12379",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 31727484,
            "range": "± 3178517",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 456524,
            "range": "± 2725",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 15779951,
            "range": "± 878302",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1257496633,
            "range": "± 12390762",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4360,
            "range": "± 13",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 59755,
            "range": "± 528",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 801060,
            "range": "± 6632",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 61473,
            "range": "± 278",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 701731,
            "range": "± 6742",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 9359422,
            "range": "± 963342",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1227,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15293,
            "range": "± 452",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 329122,
            "range": "± 2679",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 24255,
            "range": "± 244",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 176488,
            "range": "± 1972",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1625518,
            "range": "± 22639",
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
          "id": "f87e1543917fc350ab8f7aa417e2d2ad72b6f36e",
          "message": "Merge pull request #663 from pulseengine/docs/issue-612-require-coverage-semantics\n\ndocs(release): explain `require: coverage` semantics — coverage-rules ≠ every V-level (#612)",
          "timestamp": "2026-07-03T07:40:30+02:00",
          "tree_id": "6c1b28c75b373fb07087395f098935ab8f05f44d",
          "url": "https://github.com/pulseengine/rivet/commit/f87e1543917fc350ab8f7aa417e2d2ad72b6f36e"
        },
        "date": 1783057741135,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 87697,
            "range": "± 694",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 942480,
            "range": "± 12369",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14843361,
            "range": "± 1208586",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1960,
            "range": "± 10",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24495,
            "range": "± 44",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 359532,
            "range": "± 2021",
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
            "value": 1523290,
            "range": "± 17344",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 169232,
            "range": "± 8043",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1944555,
            "range": "± 63514",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 29453815,
            "range": "± 2633406",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 447214,
            "range": "± 6126",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 16399310,
            "range": "± 544444",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1113795493,
            "range": "± 29627074",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4132,
            "range": "± 30",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 46078,
            "range": "± 99",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 786636,
            "range": "± 32587",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 57956,
            "range": "± 207",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 717491,
            "range": "± 4078",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8276638,
            "range": "± 606563",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1242,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 16031,
            "range": "± 70",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 242100,
            "range": "± 3488",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22800,
            "range": "± 200",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 165621,
            "range": "± 6872",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1571123,
            "range": "± 16948",
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
          "id": "8f9fac65da8bd99e05c754828016186b49267ba7",
          "message": "Merge pull request #662 from pulseengine/docs/issue-509-runner-runbook\n\ndocs: runner pool operations runbook (#509)",
          "timestamp": "2026-07-03T07:40:26+02:00",
          "tree_id": "da22434df465a2b05374cef3b1969b1c562e6eef",
          "url": "https://github.com/pulseengine/rivet/commit/8f9fac65da8bd99e05c754828016186b49267ba7"
        },
        "date": 1783057752847,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85301,
            "range": "± 2347",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 888517,
            "range": "± 5664",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13564741,
            "range": "± 1118034",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2161,
            "range": "± 12",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26214,
            "range": "± 309",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 361645,
            "range": "± 1845",
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
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1505231,
            "range": "± 44326",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 163911,
            "range": "± 1309",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1881091,
            "range": "± 24442",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 31276512,
            "range": "± 2739677",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 458675,
            "range": "± 4598",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 15473016,
            "range": "± 180488",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1240175104,
            "range": "± 11107995",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4345,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 57778,
            "range": "± 344",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 753290,
            "range": "± 6727",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 63268,
            "range": "± 269",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 705554,
            "range": "± 3598",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8918630,
            "range": "± 844745",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1270,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14693,
            "range": "± 154",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 329186,
            "range": "± 2225",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 24877,
            "range": "± 171",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 174137,
            "range": "± 888",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1626636,
            "range": "± 16477",
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
          "id": "632eb8a361fadbd6bc9419758334463ea6c13f86",
          "message": "Merge pull request #661 from pulseengine/fix/issue-634-emission-exhaustiveness-guard\n\nfix(mutate): compile-time exhaustiveness guard on render_artifact_yaml (#634)",
          "timestamp": "2026-07-03T07:52:29+02:00",
          "tree_id": "97dd20da9aeb64ce458060d1a26e453b43916c3b",
          "url": "https://github.com/pulseengine/rivet/commit/632eb8a361fadbd6bc9419758334463ea6c13f86"
        },
        "date": 1783058470970,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85902,
            "range": "± 1563",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 881421,
            "range": "± 2880",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12487635,
            "range": "± 180110",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2152,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25583,
            "range": "± 62",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 365496,
            "range": "± 1754",
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
            "value": 94,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1505699,
            "range": "± 29032",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 160986,
            "range": "± 8584",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1875819,
            "range": "± 25942",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 25008993,
            "range": "± 252673",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 460012,
            "range": "± 2110",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 15115643,
            "range": "± 102140",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1231776352,
            "range": "± 11156417",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4320,
            "range": "± 18",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 62948,
            "range": "± 228",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 774979,
            "range": "± 2122",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 63176,
            "range": "± 223",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 672475,
            "range": "± 8232",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7402876,
            "range": "± 51353",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1112,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15329,
            "range": "± 40",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 345051,
            "range": "± 3635",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 25166,
            "range": "± 578",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 176449,
            "range": "± 2217",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1624165,
            "range": "± 9055",
            "unit": "ns/iter"
          }
        ]
      }
    ]
  }
}