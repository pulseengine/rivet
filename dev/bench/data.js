window.BENCHMARK_DATA = {
  "lastUpdate": 1777840151046,
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
          "id": "7a22f3e54bb9f1e1a71b3b3baec36f3d1cb99268",
          "message": "Merge pull request #215 from pulseengine/feat/playwright-rendering-coverage-audit\n\nfeat(tests/playwright): rendering invariant coverage — 10 new tests",
          "timestamp": "2026-04-26T08:09:14-05:00",
          "tree_id": "cdfe6f8d7fee4c1f39e73822617278eb1aa28e24",
          "url": "https://github.com/pulseengine/rivet/commit/7a22f3e54bb9f1e1a71b3b3baec36f3d1cb99268"
        },
        "date": 1777209348063,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 80911,
            "range": "± 187",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 867919,
            "range": "± 6633",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 17408562,
            "range": "± 1127342",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2153,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25629,
            "range": "± 158",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 371181,
            "range": "± 2636",
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
            "value": 1185846,
            "range": "± 28784",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 166002,
            "range": "± 11335",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1982647,
            "range": "± 8788",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 39189912,
            "range": "± 3029298",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 125269,
            "range": "± 755",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1080705,
            "range": "± 15733",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 19605311,
            "range": "± 1016289",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4341,
            "range": "± 25",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60812,
            "range": "± 315",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 835564,
            "range": "± 15215",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 65418,
            "range": "± 213",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 736737,
            "range": "± 9750",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 10888113,
            "range": "± 793232",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 808,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7535,
            "range": "± 35",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 106678,
            "range": "± 619",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 25617,
            "range": "± 278",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 184652,
            "range": "± 3415",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1739289,
            "range": "± 24645",
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
          "id": "f44b825c63b6dd62bf9f62b077aa4ec9a6d2ff47",
          "message": "Merge pull request #217 from pulseengine/fix/playwright-remaining-failures\n\nfix(playwright): close out remaining 8 dashboard test failures",
          "timestamp": "2026-04-26T08:22:21-05:00",
          "tree_id": "2613f1565922c33957b54d0199d3306dbef0dc40",
          "url": "https://github.com/pulseengine/rivet/commit/f44b825c63b6dd62bf9f62b077aa4ec9a6d2ff47"
        },
        "date": 1777210169413,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 82589,
            "range": "± 503",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 859303,
            "range": "± 4502",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13583532,
            "range": "± 1425673",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2137,
            "range": "± 11",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26716,
            "range": "± 127",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 360552,
            "range": "± 4135",
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
            "range": "± 3",
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
            "value": 1187601,
            "range": "± 21644",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 165974,
            "range": "± 678",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1928342,
            "range": "± 21736",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 34480363,
            "range": "± 3107886",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 125023,
            "range": "± 1397",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1069160,
            "range": "± 23843",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 13247530,
            "range": "± 1598417",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4398,
            "range": "± 15",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 59941,
            "range": "± 648",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 762012,
            "range": "± 6796",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 62164,
            "range": "± 936",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 678942,
            "range": "± 3155",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8041571,
            "range": "± 373316",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 811,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7456,
            "range": "± 40",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 119581,
            "range": "± 4679",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 25777,
            "range": "± 230",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 183034,
            "range": "± 5634",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1731586,
            "range": "± 25935",
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
          "id": "a3ce780a184d92bdf3967aa555b6e2c04b91567b",
          "message": "Merge pull request #219 from pulseengine/fix/fmt-drift-post-mutation-merge\n\nstyle(rivet-core): cargo fmt drift after PR #218 merge",
          "timestamp": "2026-04-26T10:40:16-05:00",
          "tree_id": "a5dd0d714922a549f60e3f2eb4c827f75546471e",
          "url": "https://github.com/pulseengine/rivet/commit/a3ce780a184d92bdf3967aa555b6e2c04b91567b"
        },
        "date": 1777218405248,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 81312,
            "range": "± 641",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 883438,
            "range": "± 3719",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12529310,
            "range": "± 396283",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1969,
            "range": "± 21",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25122,
            "range": "± 34",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 357586,
            "range": "± 6082",
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
            "value": 1203579,
            "range": "± 106729",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 166713,
            "range": "± 680",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1936260,
            "range": "± 7433",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 27220245,
            "range": "± 1081082",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 120323,
            "range": "± 417",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1083900,
            "range": "± 24022",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 12136690,
            "range": "± 995216",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4154,
            "range": "± 9",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 44326,
            "range": "± 145",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 756653,
            "range": "± 3850",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 63809,
            "range": "± 186",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 710223,
            "range": "± 3685",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7999797,
            "range": "± 123707",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 785,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7075,
            "range": "± 18",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 93163,
            "range": "± 785",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 24170,
            "range": "± 283",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 174884,
            "range": "± 731",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1632008,
            "range": "± 30571",
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
          "id": "3cdb94203a80a652e96e9289014de954898ce484",
          "message": "Merge pull request #220 from pulseengine/fix/rendering-invariants-description-mermaid-wrapped\n\ntest(playwright): flip description-mermaid pin to expect .svg-viewer wrap",
          "timestamp": "2026-04-26T11:44:38-05:00",
          "tree_id": "aca1c477011f30d5ac8c00f8d9bfbb5450513b94",
          "url": "https://github.com/pulseengine/rivet/commit/3cdb94203a80a652e96e9289014de954898ce484"
        },
        "date": 1777222263888,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 80584,
            "range": "± 406",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 860106,
            "range": "± 7895",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12005789,
            "range": "± 731667",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2183,
            "range": "± 34",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26211,
            "range": "± 202",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 372453,
            "range": "± 1790",
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
            "value": 1180951,
            "range": "± 17807",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 166789,
            "range": "± 1281",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1914964,
            "range": "± 11651",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 27083984,
            "range": "± 1999680",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 123883,
            "range": "± 840",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1057057,
            "range": "± 15706",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 11121326,
            "range": "± 518102",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4382,
            "range": "± 12",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 59228,
            "range": "± 413",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 743387,
            "range": "± 2013",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 59666,
            "range": "± 373",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 708922,
            "range": "± 2765",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7808283,
            "range": "± 193153",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 811,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7492,
            "range": "± 59",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 110920,
            "range": "± 985",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 26490,
            "range": "± 132",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 189622,
            "range": "± 1079",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1735904,
            "range": "± 39519",
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
          "id": "793dce645fe39c58d95e46063752896a9750f7de",
          "message": "Merge pull request #221 from pulseengine/fix/mutation-rivet-core-8-shard-and-survivors\n\nfix(ci): rivet-core mutants — 16 shards + 30s timeout + kill ~70 survivors",
          "timestamp": "2026-04-26T22:56:02-05:00",
          "tree_id": "a218b63367e79847f836cc83da4d276fe2feff7e",
          "url": "https://github.com/pulseengine/rivet/commit/793dce645fe39c58d95e46063752896a9750f7de"
        },
        "date": 1777262548386,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 79488,
            "range": "± 470",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 850641,
            "range": "± 4538",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12502178,
            "range": "± 780072",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2137,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25516,
            "range": "± 389",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 353963,
            "range": "± 1365",
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
            "value": 1180862,
            "range": "± 21469",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 164858,
            "range": "± 581",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1892718,
            "range": "± 13278",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 24293727,
            "range": "± 1569654",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 123285,
            "range": "± 598",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1080666,
            "range": "± 17783",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 12540709,
            "range": "± 1588342",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4372,
            "range": "± 18",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60178,
            "range": "± 444",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 759078,
            "range": "± 3382",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 61520,
            "range": "± 1205",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 719973,
            "range": "± 3646",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8123634,
            "range": "± 221330",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 807,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7887,
            "range": "± 27",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 106338,
            "range": "± 503",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 25981,
            "range": "± 2337",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 187975,
            "range": "± 1535",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1726224,
            "range": "± 19148",
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
          "id": "ab6e1fa9b8dc79170d3fa792efbdb36cda1b7d71",
          "message": "Merge pull request #223 from pulseengine/feat/variant-scoping-coherence\n\nfeat(serve): variant scoping for 8 handlers (close incoherence flagged in PR #215)",
          "timestamp": "2026-04-26T22:56:11-05:00",
          "tree_id": "8a5c59b06161b5b76259f3c70fb0e30adc46b60c",
          "url": "https://github.com/pulseengine/rivet/commit/ab6e1fa9b8dc79170d3fa792efbdb36cda1b7d71"
        },
        "date": 1777262568071,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 80302,
            "range": "± 449",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 849157,
            "range": "± 5851",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13316830,
            "range": "± 456984",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2089,
            "range": "± 21",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26954,
            "range": "± 173",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 367040,
            "range": "± 910",
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
            "value": 1183180,
            "range": "± 13473",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 160232,
            "range": "± 717",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1860387,
            "range": "± 11297",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 30237199,
            "range": "± 1124150",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 124957,
            "range": "± 687",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1065085,
            "range": "± 10262",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 14255562,
            "range": "± 443690",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4340,
            "range": "± 192",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 61422,
            "range": "± 229",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 747506,
            "range": "± 3590",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 56789,
            "range": "± 802",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 679642,
            "range": "± 2974",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7966731,
            "range": "± 153815",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 810,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7442,
            "range": "± 32",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 107067,
            "range": "± 859",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 26127,
            "range": "± 395",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 191685,
            "range": "± 1992",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1729604,
            "range": "± 35912",
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
          "id": "28333f131d1b9804fec768f12c4ca488d1dc327f",
          "message": "Merge pull request #224 from pulseengine/feat/docs-warn-or-allowlist\n\nfeat(docs): warn-or-allowlist for non-rivet files in scanned dirs (Task #56)",
          "timestamp": "2026-04-26T22:56:54-05:00",
          "tree_id": "c0269f7405f94986e01f10d42c71d2698e363753",
          "url": "https://github.com/pulseengine/rivet/commit/28333f131d1b9804fec768f12c4ca488d1dc327f"
        },
        "date": 1777262598732,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 80188,
            "range": "± 2141",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 849769,
            "range": "± 6877",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12940267,
            "range": "± 938920",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2181,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26733,
            "range": "± 173",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 363999,
            "range": "± 6524",
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
            "value": 1225386,
            "range": "± 11633",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 152557,
            "range": "± 534",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1771235,
            "range": "± 21157",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 28854747,
            "range": "± 2807239",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 124218,
            "range": "± 727",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1047392,
            "range": "± 23297",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 14199429,
            "range": "± 1703373",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4227,
            "range": "± 19",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 58871,
            "range": "± 696",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 772854,
            "range": "± 6046",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 58952,
            "range": "± 341",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 669139,
            "range": "± 6890",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7681501,
            "range": "± 407131",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 796,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7753,
            "range": "± 43",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 107743,
            "range": "± 883",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23740,
            "range": "± 290",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 163553,
            "range": "± 2135",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1505799,
            "range": "± 17904",
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
          "id": "c4e184014ca99959b2d0ada20fa30817213853fe",
          "message": "Merge pull request #226 from pulseengine/docs/intro-talk-template-and-onepager\n\ndocs: presenter template + one-pager for introducing rivet",
          "timestamp": "2026-04-26T23:50:38-05:00",
          "tree_id": "6d187c50fdf7ab6d7f273f433d82ec107a1fcf3f",
          "url": "https://github.com/pulseengine/rivet/commit/c4e184014ca99959b2d0ada20fa30817213853fe"
        },
        "date": 1777265826831,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 80915,
            "range": "± 2030",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 854836,
            "range": "± 7123",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 15765983,
            "range": "± 869410",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2166,
            "range": "± 12",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25822,
            "range": "± 590",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 371506,
            "range": "± 20432",
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
            "value": 1188481,
            "range": "± 24487",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 154199,
            "range": "± 927",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1790399,
            "range": "± 66074",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 36864690,
            "range": "± 3156875",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 123133,
            "range": "± 2630",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1051932,
            "range": "± 22425",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 16363588,
            "range": "± 1286923",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4541,
            "range": "± 38",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 61533,
            "range": "± 483",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 783081,
            "range": "± 8276",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 59191,
            "range": "± 310",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 664750,
            "range": "± 4026",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8048298,
            "range": "± 391775",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 772,
            "range": "± 14",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7317,
            "range": "± 28",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 116837,
            "range": "± 810",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23125,
            "range": "± 200",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 163236,
            "range": "± 834",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1511923,
            "range": "± 10701",
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
          "id": "51bd53fa0c8a6a0efbc3745a15b62eb74c7fbc11",
          "message": "Merge pull request #225 from pulseengine/feat/eu-ai-act-self-audit\n\nfeat(eu-ai-act): self-audit content + load schema in rivet.yaml (Task #46)",
          "timestamp": "2026-04-26T23:50:47-05:00",
          "tree_id": "b50426af53f0745a676ec52d9273edbefd3bc1ea",
          "url": "https://github.com/pulseengine/rivet/commit/51bd53fa0c8a6a0efbc3745a15b62eb74c7fbc11"
        },
        "date": 1777265953846,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 79372,
            "range": "± 845",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 851692,
            "range": "± 12376",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 16006458,
            "range": "± 915864",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2172,
            "range": "± 37",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26349,
            "range": "± 211",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 366694,
            "range": "± 1955",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 95,
            "range": "± 4",
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
            "value": 1190319,
            "range": "± 25049",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 153114,
            "range": "± 2022",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1799402,
            "range": "± 12761",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 30318001,
            "range": "± 1988151",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 124311,
            "range": "± 973",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1057636,
            "range": "± 22104",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 13591876,
            "range": "± 864297",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4282,
            "range": "± 26",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 61142,
            "range": "± 435",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 783981,
            "range": "± 7098",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 57923,
            "range": "± 376",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 670156,
            "range": "± 4759",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 9455713,
            "range": "± 566674",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 796,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7697,
            "range": "± 457",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 115569,
            "range": "± 745",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23338,
            "range": "± 173",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 162684,
            "range": "± 1030",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1491348,
            "range": "± 24441",
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
          "id": "92ad95dd25e1b353af64d208cbc242fd401dd7fc",
          "message": "Merge pull request #227 from pulseengine/feat/v0.5.0-readme-quickstart-changelog\n\nfeat(v0.5.0): README rewrite + rivet quickstart + CHANGELOG",
          "timestamp": "2026-04-26T23:50:55-05:00",
          "tree_id": "2c3f44872753b4b064b67ae7ac70f2b7d7e95e3d",
          "url": "https://github.com/pulseengine/rivet/commit/92ad95dd25e1b353af64d208cbc242fd401dd7fc"
        },
        "date": 1777266085776,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 78700,
            "range": "± 866",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 842406,
            "range": "± 9692",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13763082,
            "range": "± 1239482",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2168,
            "range": "± 107",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26024,
            "range": "± 188",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 371926,
            "range": "± 3694",
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
            "value": 1186075,
            "range": "± 24028",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 153640,
            "range": "± 565",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1786494,
            "range": "± 20354",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 30052745,
            "range": "± 2252438",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 124279,
            "range": "± 604",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1066616,
            "range": "± 19549",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 13552778,
            "range": "± 1568436",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4387,
            "range": "± 19",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 58910,
            "range": "± 2937",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 770095,
            "range": "± 11276",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 61453,
            "range": "± 293",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 690505,
            "range": "± 3160",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8139809,
            "range": "± 659684",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 797,
            "range": "± 49",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7690,
            "range": "± 36",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 109024,
            "range": "± 1298",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23550,
            "range": "± 177",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 165011,
            "range": "± 1484",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1498688,
            "range": "± 27554",
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
          "id": "63625fd9f3ab3b5b2b9463096c884a7878742ca8",
          "message": "docs(quickstart): rewrite for fresh-user clarity (#230)\n\n* docs(quickstart): rewrite for fresh-user clarity, drop self-references\n\nTwo clean-room dogfood passes (round 1 + round 2 fresh-user agents,\nboth ignoring CLAUDE.md / memory / rivet source) surfaced six concrete\nissues in the embedded quickstart:\n\n1. No \"What is rivet?\" preamble — readers assembled the mental model\n   by osmosis from example commands.\n2. Step 9 referenced Mythos red-team scaffold (\"if you cloned the\n   rivet repo\") — out of scope for first-contact, confused readers.\n3. Step 1 install said `cargo install --path rivet-cli` without\n   noting that requires a clone of the rivet repo.\n4. Step 2's goal claimed `init` scaffolds `schemas/` (it doesn't)\n   and didn't mention the seed `artifacts/requirements.yaml` that\n   collides with step 3's REQ-001.\n5. Step 7's Python oracle used `error_count` key (vacuously true);\n   actual JSON key is `errors` — a real broken link wasn't caught.\n6. Existing-repo overlay snippet elided \"all other base fields\" with\n   a placeholder, setting up the very G.2 trap it warned about.\n\nChanges:\n\n- Add 6-line \"What is rivet?\" preamble (typed YAML + schema +\n  graph + four interfaces; DOORS/Polarion/Jira analogy).\n- Step 1: explicit \"from a clone of the rivet repo\" caveat on\n  `cargo install --path`; npm + binary-release alternatives.\n- Step 2: drop schemas/ from goal sentence; add preset glossary\n  (dev, aspice, stpa, eu-ai-act, safety-case); mention the seed.\n- Step 3: prepend `rm artifacts/requirements.yaml` to clear seed.\n- Step 7: fix Python oracle key (`error_count` → `errors`).\n- Step 9: replace Mythos with \"Add a living document\" walking\n  markdown frontmatter + `{{stats}}` / `{{coverage}}` / `[[ID]]`\n  embeds; explicit `rivet serve` restart since step 8 killed it.\n- Step 10: drop deep-audience acronyms (Kani/Verus/Rocq) from the\n  docs list; gloss MCP and LSP one-liner each.\n- New Existing-repo bring-up appendix: pick preset, curate ~5\n  artifacts per layer, dump base type with `rivet schema show`,\n  write a complete copy-pasteable overlay (extends `requirement`\n  from dev preset with `polarion_id`, all base fields and\n  link-fields explicitly listed — no \"...\" placeholders).\n- New Common gotchas appendix G.1–G.7: LSP overlay blindness,\n  overlay merge field-drop, forward/inverse link types, doc vs\n  artifact refs, imported-stub honesty, lifecycle severity intent,\n  schema-show preset locality.\n\nNet: 251 → 535 lines. The oracle-gated 10-step rhythm is preserved;\nnew material is in two appendices that readers opt into.\n\nVerified: round-2 fresh-user dogfood ran all 10 oracles green and\nconfirmed the broken-link demo (changing target REQ-001 → REQ-999\nmakes the step-7 oracle exit 1 with a real error).\n\nImplements: REQ-007\nRefs: FEAT-001\n\n* docs(quickstart): preset-branch step 2/3, ASPICE overlay example, init contract\n\nThree parallel scenario-based fresh-user dogfood agents (STPA safety,\nPolarion-import compliance, MCP integrator) all reached their goals\nbut surfaced four cross-cutting issues:\n\n1. Step 2 oracle didn't tell non-`dev` users their seed file IS a\n   worked example (e.g. `artifacts/safety.yaml` for `stpa` ships a\n   complete loss/hazard/uca chain). Non-`dev` users either deleted it\n   following step 3's `rm`, or didn't realize they could skip steps\n   3+6 entirely.\n\n2. Step 3's `rm artifacts/requirements.yaml` is correct for `dev`\n   but actively wrong for non-`dev` presets — it nukes their\n   pre-built domain example.\n\n3. Existing-repo appendix's overlay example is `dev`-flavored. ASPICE\n   `sw-req` has a *required* `derives-from` link to system-req/arch —\n   a category difference, not just a quantity difference. Hand-waving\n   \"the same pattern applies, lists are longer\" sets up the very G.2\n   trap the appendix warns against. Compliance leads importing from\n   Polarion are the primary audience for this section.\n\n4. No written promise of `rivet init` non-destructiveness on a\n   non-empty repo. A real Polarion-import lead won't run a foreign\n   CLI on 10k files without that contract in writing.\n\nChanges:\n\n- Step 2: add a callout distinguishing `dev` (seed is placeholder,\n  follow steps 3+6 to write your own) from non-`dev` presets (seed\n  is a worked example in domain vocabulary, read it and skip to\n  step 4). Pointer to `rivet docs schema/<your-preset>` for the\n  type catalogue. Tip about `rivet schema show <bad-type>` errors\n  as a free schema dump.\n- Step 3: gate the seed `rm` with \"`dev` preset only\" callout;\n  point non-`dev` readers to step 4.\n- Existing-repo appendix: add \"What `rivet init` touches in a\n  non-empty repo\" section stating the non-destructiveness contract\n  explicitly (rivet.yaml + artifacts/ + docs/ + one seed file;\n  nothing else).\n- Existing-repo appendix: add a complete copy-pasteable ASPICE\n  overlay (sw-req extended with polarion_id / polarion_status /\n  asil, listing all base fields and the required `derived-from`\n  link-field with target-types and cardinality verbatim from\n  `rivet schema show sw-req`).\n- Existing-repo appendix: document the stub-parent tradeoff —\n  curating one `sw-req` from a Polarion export forces a parent\n  stub on `system-req`. Pattern: `status: imported-stub` (WARN\n  via G.5) rather than faking content.\n\nVerified:\n- Scenario A (STPA) reached PASS in 13min on prior version; the\n  step-2 callout would have collapsed the scenario's \"I didn't know\n  the seed was the tutorial\" wall-clock.\n- Scenario B (Polarion → ASPICE) reached PASS in 7min with an\n  ASPICE overlay matching the new appendix snippet (modulo\n  formatting); the worked example replaces the hand-wave.\n- `rivet schema show sw-req` from a fresh `aspice` project on\n  rivet 0.4.3 confirms the field/link-field shape used in the\n  overlay matches the binary 1:1.\n\nImplements: REQ-007\nRefs: FEAT-001\n\n* docs(quickstart): document the sw-req → system-req → stakeholder-req stub chain\n\nRound-3 fresh-user dogfood (sandbox /tmp/legacy-repo-3) verified the\n4-of-5 round-2 fixes landed cleanly, but caught one partial-impact\ngap: the existing-repo appendix's stub-parent tradeoff section\ndocuments the sw-req → system-req hop but not the transitive\nsystem-req → stakeholder-req requirement.\n\nResult: when a compliance lead curates one sw-req from a Polarion\nexport, they add a system-req stub (per the appendix), validate, and\nhit a *second* error: `[SYSREQ-PRODUCER] link 'derives-from' requires\nat least 1 target` because system-req's own ASPICE rule requires a\nderives-from to a stakeholder-req. They have to add a second stub\nthey didn't expect.\n\nChanges:\n\n- Stub-parent tradeoff section now spells the full two-hop chain\n  (stakeholder-req → system-req → sw-req) with both stubs in YAML,\n  showing the system-req stub's `derives-from: STKHR-*` link\n  explicitly.\n- Pointer to `rivet schema show <type>` to discover further required\n  derives-from chains for any other base type.\n- Cross-reference to gotcha G.3 (forward vs inverse link-type\n  direction) inline next to the overlay, since the same `aspice`\n  schema's `allocated-from` is registered only as an inverse and\n  the seed itself trips this — readers writing similar links into\n  their own arch components will hit the same error.\n\nVerified: round-3 dogfood reached PASS in 3.8min (vs 7min round 1,\n5min round 2). All 5 step-2/3 + appendix fixes verified in place via\nexplicit grep checks before the dogfood walked the doc.\n\nSeparate finding (NOT fixed in this PR — needs a binary patch):\n`rivet init --preset aspice && rivet validate` ships a seed that\nfails validation with 2 errors (SYSREQ-001 missing derives-from\ntarget; SWARCH-001 uses undeclared `allocated-from` link). Filed\nseparately.\n\nImplements: REQ-007\nRefs: FEAT-001",
          "timestamp": "2026-04-28T11:33:42-05:00",
          "tree_id": "33ea28a739300a2f1e045ef75ea98df7f55bb055",
          "url": "https://github.com/pulseengine/rivet/commit/63625fd9f3ab3b5b2b9463096c884a7878742ca8"
        },
        "date": 1777394474496,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 79699,
            "range": "± 2160",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 866358,
            "range": "± 8723",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13104274,
            "range": "± 1032251",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1984,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24655,
            "range": "± 319",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 363123,
            "range": "± 1854",
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
            "value": 1166607,
            "range": "± 17025",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 158704,
            "range": "± 721",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1843277,
            "range": "± 17305",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 26122495,
            "range": "± 788715",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 119915,
            "range": "± 375",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1071135,
            "range": "± 9627",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 11651111,
            "range": "± 136308",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4168,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 44519,
            "range": "± 162",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 736446,
            "range": "± 2685",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 62696,
            "range": "± 185",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 714627,
            "range": "± 1764",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7838413,
            "range": "± 73120",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 746,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 6662,
            "range": "± 49",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 90532,
            "range": "± 806",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21869,
            "range": "± 45",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 150839,
            "range": "± 342",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1369493,
            "range": "± 22730",
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
          "id": "5c8d0d7430679e50df21d6ebffef1c57488c4591",
          "message": "fix(aspice): seed validates clean after init — declare allocated-from + add stakeholder-req parent (#233)\n\nRound-3 fresh-user dogfood (sandbox /tmp/aspice-seed-only) confirmed\nthat `rivet init --preset aspice && rivet validate` ships a seed\nthat fails validation with 2 errors out of the box:\n\n  ERROR: [SYSREQ-001] link 'derives-from' requires at least 1 target,\n                       found 0\n  ERROR: [SWARCH-001] link type 'allocated-from' is not defined in\n                       the schema — declare it in link-types: or\n                       remove the link\n  Result: FAIL (2 errors)\n\nTwo real bugs in the shipped aspice preset:\n\n1. The `common` schema declares `allocated-to` with `inverse:\n   allocated-from`, registering only the forward token `allocated-to`.\n   ASPICE's SWE.2 traceability rule (`swe2-allocated-from-swe1`)\n   uses `allocated-from` as the *forward* direction (sw-arch-component\n   allocates from sw-req), and the seed's SWARCH-001 uses it the\n   same way. The validator correctly rejects the use because no\n   schema registers `allocated-from` as a forward link-type. This\n   is exactly the gotcha-G.3 footgun the quickstart documents.\n\n2. `system-req` requires `derives-from -> [stakeholder-req]` per the\n   ASPICE `sys2-derives-from-sys1` rule. The seed had SYSREQ-001\n   with no `derives-from`, so the rule fails on the first\n   `rivet validate` post-init.\n\nChanges:\n\n- `schemas/aspice.yaml`: declare `allocated-from` as a forward\n  link-type in ASPICE's `link-types:` block, with `inverse:\n  allocated-to`, restricted to `source-types: [sw-arch-component]`\n  / `target-types: [sw-req, system-arch-component]`. This matches\n  what the existing `swe2-allocated-from-swe1` traceability rule\n  already requires and what artifact-types' link-fields already\n  reference (lines 97-98, 142-143). Schema is now internally\n  consistent.\n\n- `rivet-cli/src/main.rs` (`ASPICE_SAMPLE` const): add a\n  STKHR-001 stakeholder-req as the V-model root, wire SYSREQ-001's\n  `derives-from` to it. The chain\n    STKHR-001 (stakeholder-req)\n      ← derives-from\n    SYSREQ-001 (system-req)\n      ← derives-from\n    SWREQ-001 (sw-req)\n      ← allocated-from\n    SWARCH-001 (sw-arch-component)\n  satisfies all three left-V ASPICE rules\n  (sys2-derives-from-sys1, swe1-derives-from-sys,\n  swe2-allocated-from-swe1).\n\nVerified locally:\n\n  $ rivet init --preset aspice && rivet validate\n  INFO: [SWREQ-001] Every SW requirement should be verified by at\n                     least one verification measure\n  INFO: [SYSREQ-001] Every system requirement should be verified by\n                     at least one verification measure\n  Result: PASS (0 warnings)\n\nResult PASS with 0 errors and 0 warnings. The two remaining INFOs\nare lifecycle-coverage hints — they suggest the natural next step\n(authoring sw-verification / sys-verification artifacts) and do\nnot block the validate gate.\n\nImplements: REQ-007, REQ-010\nRefs: FEAT-001",
          "timestamp": "2026-04-28T11:34:29-05:00",
          "tree_id": "ccec8c3bcf2ab63147f83114260e62ac23a5623a",
          "url": "https://github.com/pulseengine/rivet/commit/5c8d0d7430679e50df21d6ebffef1c57488c4591"
        },
        "date": 1777394501160,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 80679,
            "range": "± 775",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 861766,
            "range": "± 5645",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12862086,
            "range": "± 671786",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1935,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24807,
            "range": "± 51",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 365101,
            "range": "± 1458",
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
            "range": "± 4",
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
            "value": 1172137,
            "range": "± 55243",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 158814,
            "range": "± 1738",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1827003,
            "range": "± 32436",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 27008585,
            "range": "± 1258304",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 121023,
            "range": "± 548",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1049867,
            "range": "± 23174",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 12010921,
            "range": "± 647419",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4109,
            "range": "± 72",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 45155,
            "range": "± 258",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 745164,
            "range": "± 3783",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 56823,
            "range": "± 251",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 689300,
            "range": "± 6265",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7714413,
            "range": "± 105346",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 766,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 6675,
            "range": "± 24",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 90893,
            "range": "± 1359",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22240,
            "range": "± 156",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 149764,
            "range": "± 1158",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1367476,
            "range": "± 17937",
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
          "id": "3e61633aad50d81b51b57f5459066f3b26de3812",
          "message": "feat(mcp): discoverability — --list-tools, --probe, rivet docs mcp (#231)\n\n* feat(mcp): add --list-tools and --probe flags for discoverability\n\n`rivet mcp --list-tools` walks the registered tool router and prints\nthe catalog (15 tools today) as either a human-readable table or — with\n`--format json` — the JSON-RPC `tools/list` payload exactly as the\nstdio server would emit it. Does not start the server and does not\nneed a project to be present, so it works as a fast capability probe\neven before any artifact files exist.\n\n`rivet mcp --probe` runs the in-process equivalent of\n`tools/call rivet_list` (no args) against the current project and\nprints the decoded `result.content[0].text` payload — the same envelope\nan MCP client would observe — without standing up a stdio server. Used\nas a smoke test for AI integrators verifying their project is\nreachable through MCP.\n\nBoth flags reuse the same handlers the wire server dispatches to, so\ntheir output cannot drift from what a real client would see.\n\nImplements: REQ-007\nRefs: FEAT-010\n\n* docs(mcp): embed `rivet docs mcp` topic — JSON-RPC framing, tool catalog, gotchas\n\nAdds an embedded documentation topic for the MCP server, registered in\nthe docs registry so `rivet docs mcp` and the `rivet docs` listing both\nsurface it. Companion to the new `rivet mcp --list-tools` and\n`rivet mcp --probe` flags.\n\nCovers: what the server exposes; the line-delimited JSON-RPC over stdio\nwire format (and the LSP Content-Length pitfall it is NOT); the\n3-message handshake including the easily-forgotten\n`notifications/initialized` notification; the 15-tool catalog with\ninputs; the `result.content[0].text` double-parse envelope gotcha; three\nsmoke-test recipes (`--list-tools`, `--probe`, raw bash JSON-RPC); the\nmutate-then-`rivet_reload` convention; and a pointer to the upstream\nMCP spec for clients building from scratch.\n\nAlso amends `rivet docs cli` to mention the new `mcp` subflags and\ncross-link to `rivet docs mcp`.\n\nTrace: skip",
          "timestamp": "2026-04-28T11:35:28-05:00",
          "tree_id": "287d91262cde241c97f712ab28e94162239a7621",
          "url": "https://github.com/pulseengine/rivet/commit/3e61633aad50d81b51b57f5459066f3b26de3812"
        },
        "date": 1777394510386,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 79260,
            "range": "± 542",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 840126,
            "range": "± 13297",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14182540,
            "range": "± 709060",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2159,
            "range": "± 12",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24999,
            "range": "± 272",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 380157,
            "range": "± 5408",
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
            "value": 1192209,
            "range": "± 10436",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 152716,
            "range": "± 637",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1778237,
            "range": "± 17903",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 30317874,
            "range": "± 2408926",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 124320,
            "range": "± 1299",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1036834,
            "range": "± 16631",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 15515942,
            "range": "± 1396823",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4295,
            "range": "± 22",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60122,
            "range": "± 455",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 782189,
            "range": "± 19922",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 59943,
            "range": "± 210",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 673755,
            "range": "± 15804",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 9582164,
            "range": "± 750345",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 797,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7768,
            "range": "± 49",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 119964,
            "range": "± 2121",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22902,
            "range": "± 117",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 161352,
            "range": "± 2813",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1501674,
            "range": "± 26224",
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
          "id": "91b8ea2afcccca117fdbb43f67ee5f09917179b5",
          "message": "chore(release): v0.5.1 — first-contact polish (#235)\n\n* chore(release): v0.5.1 — first-contact polish\n\nWorkspace, vscode-rivet, and npm root package versions bumped to 0.5.1.\nPlatform packages stay on the release-npm.yml override path (per the\n0.5.0 convention).\n\nWhat's in 0.5.1 (post-0.5.0 dogfood polish):\n\n- docs(quickstart): rewrite for fresh-user clarity (#230). Two\n  clean-room dogfood passes + three scenario-based passes surfaced\n  six confusion points; all fixed. Wall-time wins: STPA bring-up\n  13min -> 36s; Polarion -> ASPICE overlay 7min -> 3.8min.\n- fix(aspice): seed validates clean after init (#233). Two real bugs\n  in the shipped aspice preset (undeclared `allocated-from` link-type,\n  missing stakeholder-req parent) — `rivet init --preset aspice &&\n  rivet validate` now returns PASS.\n- feat(mcp): discoverability (#231). New `rivet mcp --list-tools` and\n  `rivet mcp --probe` flags (no JSON-RPC required to enumerate the\n  tool catalog or smoke-test the server) plus a new ~1400-word\n  `rivet docs mcp` topic covering wire format, handshake, tool\n  catalog, and the response-envelope gotcha.\n\nVerified: cargo check, cargo clippy --workspace -- -D warnings,\ncargo test -p rivet-cli, `rivet init --preset aspice && rivet validate`\nreturns PASS, `rivet docs mcp` prints the new topic.\n\nTrace: skip\n\n* chore(release): fix CHANGELOG ArtifactIdValidity false-positives\n\nPR #235's Docs Check failed because the 0.5.1 changelog mentioned\naspice preset SEED artifact IDs (SWARCH-001, SWREQ-001, SYSREQ-001,\nSTKHR-001) in prose. Those IDs live in the embedded preset string\nconstant, not as artifacts in this repo's store, so the rivet docs\ncheck ArtifactIdValidity invariant correctly flagged them as broken\nreferences.\n\nFix: replace the seed IDs with their artifact-type names\n(sw-arch-component, sw-req, system-req, stakeholder-req). Reads\nbetter as prose anyway; no information loss.\n\nTrace: skip",
          "timestamp": "2026-04-28T14:33:48-05:00",
          "tree_id": "54c55fcfafec03cbd3d9cd74865419df886164f2",
          "url": "https://github.com/pulseengine/rivet/commit/91b8ea2afcccca117fdbb43f67ee5f09917179b5"
        },
        "date": 1777406183110,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 80636,
            "range": "± 293",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 866888,
            "range": "± 9312",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13113855,
            "range": "± 1025077",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1915,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25126,
            "range": "± 186",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 368743,
            "range": "± 3001",
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
            "value": 1181694,
            "range": "± 29307",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 158886,
            "range": "± 637",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1815559,
            "range": "± 9754",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 25078596,
            "range": "± 315749",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 121364,
            "range": "± 418",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1046434,
            "range": "± 12375",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 11399767,
            "range": "± 66862",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4135,
            "range": "± 9",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 44854,
            "range": "± 145",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 737455,
            "range": "± 3225",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 59837,
            "range": "± 215",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 695869,
            "range": "± 3441",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7761165,
            "range": "± 32395",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 763,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 6701,
            "range": "± 32",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 92347,
            "range": "± 405",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21798,
            "range": "± 106",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 147006,
            "range": "± 456",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1355559,
            "range": "± 19085",
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
          "id": "4ef103cb09618632bde0589c070aaceb68012531",
          "message": "feat(schema): rivet schema migrate Phase 1 — diff engine + plan/apply/abort + dev-to-aspice recipe (#238)\n\n* feat(schemas): canned dev-to-aspice migration recipe\n\nPhase 1 of issue #236. Ships exactly one mechanical migration recipe:\nthe most common \"outgrew the dev preset\" path. Renames `requirement`,\n`feature`, and `design-decision` to their ASPICE 4.0 equivalents and\nrewrites `satisfies` links to `derives-from`. Default\n`unmapped-fields: keep-as-orphan` policy stashes unmapped fields\nunder `fields.legacy.*` so nothing is lost on migration.\n\nImplements: REQ-010\n\nCo-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>\n\n* feat(schema): diff engine for schema migrations\n\nPhase 1 of issue #236. New `rivet_core::migrate` module provides:\n\n* MigrationRecipe / MigrationRecipeFile — YAML recipe shape with\n  type-rewrites, link-rewrites, and policies (unmapped-fields:\n  drop|keep-as-orphan|strict; unmapped-link-types: keep|drop|strict).\n* diff_artifacts() — given source artifacts + recipe + optional\n  target schema, computes a RewriteMap of PlannedChange entries\n  classified as mechanical / decidable-with-policy / conflict.\n* apply_to_file() — mechanical-only YAML rewrite at the\n  serde_yaml::Value level. Bails loudly on conflict-class changes.\n* MigrationLayout / MigrationState — directory-layout helpers for\n  `.rivet/migrations/<ts>/` with plan.yaml, manifest.yaml, state, and\n  snapshot/.\n* copy_tree / remove_tree — recursive fs helpers used by the\n  CLI's snapshot + abort path.\n\nEmbeds the shipped dev-to-aspice recipe via include_str! and exposes\nembedded_migration_recipe() for CLI lookup.\n\nEight unit tests cover: type-rename emission, link-rename\ndeduplication, unmapped-field detection with policy, apply rewrites\ntype+link, keep-as-orphan stash, conflict bail, recipe parse, state\nroundtrip.\n\nImplements: REQ-010\n\nCo-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>\n\n* feat(cli): rivet schema migrate — plan/apply/abort/status/finish\n\nPhase 1 of issue #236. New `rivet schema migrate <target>` subcommand:\n\n* default (no flag): plan-only — writes\n  `.rivet/migrations/<YYYYMMDD-HHMM>-<src>-to-<tgt>/plan.yaml` plus\n  manifest and a `state` file with PLANNED. Prints a summary of\n  mechanical / decidable / conflict counts.\n* `--apply`: rewrites artifact YAML in place. Bails loudly with\n  exit 1 if the plan has any conflict-class changes (Phase 1 is\n  mechanical-only). Captures a byte-faithful snapshot of `artifacts/`\n  and `rivet.yaml` before rewriting.\n* `--abort`: restores from snapshot and deletes the migration\n  directory. Byte-identical rollback for the snapshotted subtree.\n* `--status`: prints the current state machine pointer +\n  recipe/changeset summary from manifest.yaml.\n* `--finish`: deletes the snapshot after confirming COMPLETE state.\n\nRecipe resolution: tries `<schemas-dir>/migrations/<src>-to-<tgt>.yaml`\nfirst, then falls back to the embedded recipe set. Phase 1 ships\none recipe; future phases will gain a registry. Source preset is\ninferred from `rivet.yaml` (first non-`common` schema entry).\n\nImplements: REQ-007\n\nCo-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>\n\n* docs(schema): embedded rivet docs schema-migrate topic\n\nNew `rivet docs schema-migrate` topic covering the Phase 1 CLI\nsurface (plan / apply / abort / status / finish), the state\nmachine, the storage layout under `.rivet/migrations/<ts>/`, the\nrecipe format with action classes, and the policy semantics for\nunmapped fields and link types. Also lists what Phase 1 deliberately\ndefers (conflict markers, --continue/--skip/--edit, dashboard,\nprovenance entries).\n\nAdds a one-line entry under the existing `rivet docs cli` schema\ncommands section pointing users at the new topic.\n\nTrace: skip\n\n* test(schema): integration tests for migrate apply + abort + roundtrip\n\nFive end-to-end tests covering the Phase 1 surface area of issue #236:\n\n* plan_dev_to_aspice_writes_plan_and_manifest — fresh dev project,\n  default plan invocation creates a single migration directory\n  with plan.yaml, manifest.yaml, and `state == PLANNED`.\n* apply_rewrites_dev_to_aspice_and_validate_passes — `--apply` on\n  a clean dev project rewrites types and links, the migrated tree\n  has no `requirement` / `feature` left, and after patching\n  `rivet.yaml` to load aspice schemas, `rivet validate` exits 0.\n* abort_restores_byte_identical_artifacts — pre-migration snapshot\n  is captured, `apply` mutates files, `abort` restores them\n  byte-identically (compared via a recursive directory walk).\n* finish_deletes_snapshot_and_keeps_manifest — `--finish` on a\n  COMPLETE migration removes `snapshot/` but keeps `manifest.yaml`\n  for audit.\n* roundtrip_dev_to_aspice_keeps_artifact_count_constant — the\n  half-roundtrip we have without an aspice-to-dev recipe; asserts\n  no spurious additions/deletions through the rewrite. Full A->B->A\n  test deferred until a reverse recipe ships.\n\nVerifies: REQ-007, REQ-010\n\nCo-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>\n\n---------\n\nCo-authored-by: Claude Opus 4.7 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-04-28T22:55:37-05:00",
          "tree_id": "93b9719576c4dcf18075cd56991da31ee7486541",
          "url": "https://github.com/pulseengine/rivet/commit/4ef103cb09618632bde0589c070aaceb68012531"
        },
        "date": 1777435317679,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 63236,
            "range": "± 221",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 675001,
            "range": "± 3297",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 9845732,
            "range": "± 751316",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1487,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 18426,
            "range": "± 598",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 270162,
            "range": "± 1051",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 84,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/1000",
            "value": 84,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 84,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 909961,
            "range": "± 4640",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 129084,
            "range": "± 1045",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1493483,
            "range": "± 9162",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 24968896,
            "range": "± 2479202",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 92258,
            "range": "± 698",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 776805,
            "range": "± 34669",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 9564225,
            "range": "± 1081859",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3201,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 33739,
            "range": "± 113",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 565708,
            "range": "± 4774",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 47839,
            "range": "± 631",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 537162,
            "range": "± 2437",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 6201714,
            "range": "± 236584",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 606,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 5379,
            "range": "± 10",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 70013,
            "range": "± 196",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 18981,
            "range": "± 64",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 133143,
            "range": "± 335",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1253318,
            "range": "± 6367",
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
          "id": "8d8554c6bfcf567b172fa9ca1b104a1ea3942dcb",
          "message": "feat(validate): cited-source typed field + sha256 stamp Phase 1 — kind: file backend (#239)\n\n* feat(schema): cited-source as first-class typed field with URI scheme allowlist\n\nAdds `cited-source` as a typed schema construct with shape\n`{ uri, kind, sha256, last-checked }`. Defines `CitedSourceKind`\n(file | url | github | oslc | reqif | polarion), parses the YAML\nmapping into a typed struct, and rejects URI schemes outside the\nallowlist (file/http/https/github/oslc/reqif/polarion) — defence\nagainst arbitrary schemes from untrusted YAML.\n\nPhase 1 only implements `kind: file`; remote kinds round-trip\nunchanged. Declares the field on `dev.yaml`'s `requirement` type so\nprojects can opt in incrementally.\n\nImplements: REQ-010\nRefs: #237\n\n* feat(cli): rivet validate --strict-cited-sources + rivet check sources\n\nWires the Phase 1 cited-source backend into the existing CLI:\n\n- `rivet validate` now emits `cited-source-drift` (Severity::Warning),\n  `cited-source-shape` (Error), and `cited-source-stale` (Info)\n  diagnostics for `kind: file` sources. Default behaviour is advisory;\n  `--strict-cited-sources` promotes drift / missing-hash to Error.\n- `--check-remote-sources` flag accepted but no-op for Phase 1 — emits\n  an Info noting the remote backend ships in Phase 2.\n- `rivet check sources` lists every artifact with a `cited-source`\n  field and its current hash status (MATCH / DRIFT / MISSING-HASH /\n  READ-ERROR / SKIPPED-REMOTE / SHAPE-ERROR). `--update` prompts y/N\n  per drift; `--update --apply` rewrites the artifact YAML in batch.\n- JSON output via `--format json` for machine consumers.\n\nImplements: REQ-007, REQ-004\nRefs: #237\n\n* docs(schema): rivet docs schema-cited-sources topic + CLI doc updates\n\nAdds `rivet docs schema-cited-sources` covering the field shape, the\nper-kind backend behaviour table (with Phase 2 backends marked), URI\nscheme allowlist (security model), `last-checked` semantics, and CLI\nsurface examples. Mentions the upstream-ref migration caveat (Phase 1\nadds the field alongside, full migration after #236 lands).\n\nUpdates `rivet docs cli` to list the `rivet check sources` group and\nthe `--strict-cited-sources` flag.\n\nRefs: #237\n\n* test(validate): cited-source drift fixture round-trip\n\nSix integration tests exercising the Phase 1 acceptance criteria from\nissue #237:\n\n- validate PASSes when the stamped sha256 matches the file\n- editing the file emits a `cited-source-drift` diagnostic\n- `validate --strict-cited-sources` exits 1 on drift\n- `rivet check sources --update --apply` rewrites the artifact YAML\n  and the next validate run passes cleanly\n- `rivet check sources` lists entries (MATCH status) in text mode\n- arbitrary URI schemes (e.g. `ftp://`) are rejected with a\n  cited-source-shape error — SSRF / exfiltration mitigation\n\nVerifies: REQ-004\nRefs: #237",
          "timestamp": "2026-04-28T23:00:46-05:00",
          "tree_id": "34076140c6bd10827f0acf6150f60f869b031d0c",
          "url": "https://github.com/pulseengine/rivet/commit/8d8554c6bfcf567b172fa9ca1b104a1ea3942dcb"
        },
        "date": 1777436032511,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 80468,
            "range": "± 1223",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 861553,
            "range": "± 14857",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12638622,
            "range": "± 1399758",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2176,
            "range": "± 60",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24808,
            "range": "± 609",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 362497,
            "range": "± 16746",
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
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1181210,
            "range": "± 22456",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 161435,
            "range": "± 1554",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1940618,
            "range": "± 22714",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 28431689,
            "range": "± 1353121",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 124565,
            "range": "± 2567",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1049911,
            "range": "± 25724",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 12073090,
            "range": "± 497967",
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
            "value": 61222,
            "range": "± 232",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 752934,
            "range": "± 62477",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 60561,
            "range": "± 508",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 705988,
            "range": "± 2653",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8066975,
            "range": "± 334991",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 757,
            "range": "± 36",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7516,
            "range": "± 150",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 105771,
            "range": "± 1001",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23916,
            "range": "± 228",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 169277,
            "range": "± 1579",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1600937,
            "range": "± 25127",
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
          "id": "05c9400b1ed2e684b5df4d969a0c8cdc67957aa0",
          "message": "feat(mutants): canonical cargo-mutants template + docs + schema fields (#229)\n\nFirst in-scope cut at the cargo-mutants generalization story (#185).\n\n- templates/cargo-mutants/{mutants.toml, mutants.yml, README.md} —\n  reusable config + nightly + manual-dispatch GitHub Actions workflow,\n  extracted from rivet's pre-push smoke profile.\n- docs/mutation-testing.md — pattern doc covering when to run, ASIL/DAL\n  score targets (≥0.70 ASIL A → ≥0.90 ASIL D), mutants.toml skip\n  patterns, per-function skip attributes, and how the new schema fields\n  wire results back into rivet traceability.\n- schemas/score.yaml — `mutation-score-target` (number) on test-spec to\n  declare the suite floor, `mutation-score` plus mutants-tested /\n  killed / missed / timeout / unviable counts on test-exec to record\n  measured runs.\n\nVerified: cargo test -p rivet-core --lib + integration suites green\n(857 + 5 + 4 tests). rivet validate diagnostics unchanged from\norigin/main (6 pre-existing errors in spar-external fixture, untouched\nhere). Synthetic project that loads schemas: [common, score] accepts\nall new fields.\n\nOut of scope per the autonomous-run scoping confirmed in the issue's\n2026-04-26 triage comment:\n- Cross-repo adoption issues for kiln/loom/gale/meld must be filed\n  from a session with broader org access.\n- Dashboard view across repos depends on #188.\n\nImplements: REQ-010\nRefs: #185\n\nCo-authored-by: Claude <noreply@anthropic.com>",
          "timestamp": "2026-04-28T23:40:29-05:00",
          "tree_id": "4f10b071491acb46ae9f232c8c7831683767c42f",
          "url": "https://github.com/pulseengine/rivet/commit/05c9400b1ed2e684b5df4d969a0c8cdc67957aa0"
        },
        "date": 1777438602528,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 80474,
            "range": "± 378",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 844445,
            "range": "± 7414",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 11366536,
            "range": "± 581943",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2138,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26687,
            "range": "± 146",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 371107,
            "range": "± 1034",
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
            "value": 1190063,
            "range": "± 33744",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 165633,
            "range": "± 3017",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1920981,
            "range": "± 27114",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 23408112,
            "range": "± 311314",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 123143,
            "range": "± 752",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1042679,
            "range": "± 19623",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 10596288,
            "range": "± 370139",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4322,
            "range": "± 18",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 59280,
            "range": "± 266",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 753906,
            "range": "± 2410",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 62063,
            "range": "± 342",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 698280,
            "range": "± 5958",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7367647,
            "range": "± 116368",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 731,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7282,
            "range": "± 33",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 107306,
            "range": "± 1374",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23638,
            "range": "± 73",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 169831,
            "range": "± 1218",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1606567,
            "range": "± 15166",
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
          "id": "79bb5c39a7de92b51661d7d22cc29da077fa1604",
          "message": "feat(schemas): vv-coverage — repo-status type for V&V technique tracking (#232)\n\nIntroduces `schemas/vv-coverage.yaml` and registers it as a built-in\nschema. Defines a single artifact type, `repo-status`, capturing:\n\n  - `repo` (required) — canonical `owner/name` join key\n  - `techniques-applied` (required, list<string>) — V&V techniques\n    present in the repo\n  - `techniques-gated-in-ci` (optional, list<string>) — subset that\n    blocks merge or release\n  - `notes` (optional, text) — free-form coverage commentary\n\nThe split between \"applied\" and \"gated-in-ci\" is the load-bearing\ndistinction the cross-repo coverage matrix renders: the matrix shows\ndrift between \"we have the technique\" and \"the technique enforces\".\n\nSub-issue #1 of #188; the matrix CLI surface (`rivet coverage --matrix`)\nand the cross-repo aggregator land in follow-up PRs.\n\nRecommended technique identifiers documented in the schema description\n(verus / kani / rocq / lean / aeneas / mirai / proptest / loom / miri /\nasan / tsan / lsan / fuzz / mutation / criterion / differential /\nrivet-validate / cargo-deny / cargo-audit / semver-check). Authors may\nuse identifiers outside this set; the aggregator surfaces unknowns\nrather than rejecting them.\n\nVerification:\n- 9 new integration tests in `rivet-core/tests/vv_coverage_schema.rs`\n  (schema loads, parses, registered in SCHEMA_NAMES, declares\n  `repo-status` with the three documented fields, required/optional\n  shape matches the aggregator contract, both technique fields are\n  `list<string>`, schema extends `common`).\n- `cargo test -p rivet-core --lib` — 857 pass.\n- `cargo test -p rivet-core --test schema_agent_pipelines` — 5 pass\n  (this suite iterates over SCHEMA_NAMES; new entry round-trips).\n- `cargo fmt --all -- --check` — clean.\n- `rivet validate` diagnostics identical to origin/main (6 pre-existing\n  errors in the spar-external fixture, 62 warnings — unchanged).\n\nRefs: #188\nRefs: #184\n\nImplements: REQ-010\n\nCo-authored-by: Claude <noreply@anthropic.com>",
          "timestamp": "2026-04-28T23:41:41-05:00",
          "tree_id": "40fec75adf194d4bdaa04994ce7d99b79e35046c",
          "url": "https://github.com/pulseengine/rivet/commit/79bb5c39a7de92b51661d7d22cc29da077fa1604"
        },
        "date": 1777438964917,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 80301,
            "range": "± 681",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 858449,
            "range": "± 12405",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14680589,
            "range": "± 1523770",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2142,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25611,
            "range": "± 117",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 363532,
            "range": "± 33161",
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
            "value": 1194327,
            "range": "± 36164",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 160988,
            "range": "± 2139",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1921067,
            "range": "± 43942",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 35611050,
            "range": "± 4751814",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 123620,
            "range": "± 760",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1070611,
            "range": "± 42271",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 15890660,
            "range": "± 1683945",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4296,
            "range": "± 28",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 58899,
            "range": "± 1098",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 762004,
            "range": "± 5644",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 63537,
            "range": "± 1147",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 706322,
            "range": "± 9328",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7848700,
            "range": "± 236400",
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
            "value": 7235,
            "range": "± 194",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 121809,
            "range": "± 964",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 24702,
            "range": "± 200",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 171811,
            "range": "± 5345",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1602101,
            "range": "± 27446",
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
          "id": "4b425598f6205a2f995bc4f3096a886156141805",
          "message": "docs(pre-commit): publish canonical 21-hook template + tier docs (#222)\n\nAdds `templates/pre-commit/.pre-commit-config.yaml` as the\nversioned, copy-pasteable source of truth for PulseEngine Rust\nrepositories, and `docs/pre-commit.md` documenting the rationale\nper hook plus an advisory T1 / T2 / T3 tier system.\n\nEach hook in the template carries an inline tier annotation so\nadopters can grep-trim to their assurance level. `CUSTOMIZE`\nmarkers flag the per-project knobs (rust-toolchain pinning,\nartifact-path globs, mutation crate selection).\n\nRefs: #186\n\nCo-authored-by: Claude <noreply@anthropic.com>",
          "timestamp": "2026-04-28T23:42:16-05:00",
          "tree_id": "77ef1167d761a9cddaf58bc56d64305046338922",
          "url": "https://github.com/pulseengine/rivet/commit/4b425598f6205a2f995bc4f3096a886156141805"
        },
        "date": 1777439020374,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 81316,
            "range": "± 555",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 880381,
            "range": "± 66159",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14693688,
            "range": "± 1800220",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1942,
            "range": "± 33",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24657,
            "range": "± 46",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 367317,
            "range": "± 8827",
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
            "value": 1182777,
            "range": "± 16946",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 166292,
            "range": "± 726",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1907226,
            "range": "± 7829",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 29814384,
            "range": "± 3121335",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 120355,
            "range": "± 2455",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1045349,
            "range": "± 10014",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 15908404,
            "range": "± 1551868",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4133,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 45331,
            "range": "± 109",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 734069,
            "range": "± 15525",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 63621,
            "range": "± 395",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 714834,
            "range": "± 7196",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8291535,
            "range": "± 799534",
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
            "value": 6555,
            "range": "± 85",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 91326,
            "range": "± 709",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23142,
            "range": "± 111",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 159930,
            "range": "± 1507",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1497315,
            "range": "± 15917",
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
          "id": "189f020e9b36242556cd77b3a553299d1a84910a",
          "message": "chore(release): v0.6.0 — schema migrate + cited-source (#240)\n\nTwo marquee features landing together — both surfaced during the\npost-0.5.0 fresh-user dogfood (#236, #237):\n\n- rivet schema migrate (#238) — git-rebase-style preset migration\n  with diff engine, plan/apply/abort/status/finish state machine,\n  full snapshot rollback, and one canned dev-to-aspice recipe.\n- cited-source typed field + sha256 stamp (#239) — first-class\n  schema affordance for artifacts citing external sources, with\n  the kind: file backend, cited-source-drift diagnostic, and a\n  new rivet check sources --update workflow.\n\nWorkspace, vscode-rivet, and npm root package versions bumped to\n0.6.0. Platform packages stay on the release-npm.yml override path.\n\nTrace: skip",
          "timestamp": "2026-04-29T00:26:49-05:00",
          "tree_id": "24d5a95f9fd034b424a77f8d455006ffe4d13fce",
          "url": "https://github.com/pulseengine/rivet/commit/189f020e9b36242556cd77b3a553299d1a84910a"
        },
        "date": 1777443387007,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 80903,
            "range": "± 1840",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 844400,
            "range": "± 5395",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 10721000,
            "range": "± 239834",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2175,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26689,
            "range": "± 80",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 370408,
            "range": "± 1447",
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
            "value": 1180350,
            "range": "± 7367",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 161820,
            "range": "± 1777",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1884796,
            "range": "± 9014",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 22364354,
            "range": "± 211537",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 121774,
            "range": "± 1100",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1046744,
            "range": "± 8712",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 10292601,
            "range": "± 97675",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4291,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 58973,
            "range": "± 257",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 765402,
            "range": "± 3001",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 61622,
            "range": "± 296",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 687974,
            "range": "± 4135",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7496656,
            "range": "± 34646",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 774,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7122,
            "range": "± 20",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 116490,
            "range": "± 450",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23587,
            "range": "± 846",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 169725,
            "range": "± 1449",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1592868,
            "range": "± 8297",
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
          "id": "c47549b323278d86838de9888a194cadea540146",
          "message": "feat(validate): warn when prose mentions an artifact id without a typed link (#234)\n\nCloses #207.\n\nAdd a structural-validation pass that scans each artifact's\n`description` (and every string-typed value in its `fields` map) for\ntokens matching `\\b[A-Z][A-Z0-9]*-[0-9]+\\b`. When a match resolves to\nan artifact in the corpus and the mentioning artifact has no typed\nlink to it, emit a Warning-severity diagnostic\n(`prose-mention-without-typed-link`).\n\nSuppression cases (matching the issue body):\n  * the mention is the artifact's own id (self-reference),\n  * the mentioned id does not resolve in the corpus (broken refs are\n    a separate concern),\n  * the artifact already has any typed link to that id.\n\nPer-(artifact, mentioned-id) dedup mirrors the unknown-link-type\npass's policy so repeated mentions of the same id yield one warning.\n\nThe regex is compiled once via `LazyLock<Regex>` (mirroring\n`rivet-core/src/markdown.rs`).\n\nSix unit tests cover every Tests-bullet from #207 plus dedup:\n  * warn fires on bare mention,\n  * typed link suppresses warn,\n  * self-id mention suppresses warn,\n  * unresolved id suppresses warn,\n  * string-typed `fields` value is scanned,\n  * three mentions of one id dedupe to one warning.\n\nNote on escalation: the issue mentions a hypothetical\n`rivet validate --strict` to escalate to Error. rivet already exposes\n`rivet validate --fail-on warning` which fails the run on any\nwarning; that subsumes the hypothetical flag without a new surface.\nA literal severity-changing `--strict` is left for a follow-up if\nwanted.\n\nImplements: REQ-004\n\nCo-authored-by: Claude <noreply@anthropic.com>",
          "timestamp": "2026-04-29T01:50:38-05:00",
          "tree_id": "4c2f7868278d12a734abc3dc2ae91ba3fd93cea6",
          "url": "https://github.com/pulseengine/rivet/commit/c47549b323278d86838de9888a194cadea540146"
        },
        "date": 1777449261555,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 80316,
            "range": "± 901",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 853198,
            "range": "± 6111",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 15300020,
            "range": "± 759946",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2245,
            "range": "± 20",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25666,
            "range": "± 1703",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 373188,
            "range": "± 6089",
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
            "value": 94,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1196121,
            "range": "± 20584",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 159350,
            "range": "± 1056",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1892683,
            "range": "± 22214",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 40364675,
            "range": "± 2579325",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 139789,
            "range": "± 854",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1228458,
            "range": "± 12566",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 23007524,
            "range": "± 1109328",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4268,
            "range": "± 17",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 61860,
            "range": "± 574",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 841436,
            "range": "± 9204",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 62925,
            "range": "± 230",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 699640,
            "range": "± 13267",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8765951,
            "range": "± 573912",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 828,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7919,
            "range": "± 50",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 108633,
            "range": "± 593",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23191,
            "range": "± 401",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 166329,
            "range": "± 713",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1569682,
            "range": "± 13327",
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
          "id": "67f0e081684f63ad1c1db4606934a75616106696",
          "message": "fix(ci): make Release workflow idempotent on existing tag (#244)\n\nThe \"Create Release\" step in release.yml runs `gh release create\n$VERSION ...` unconditionally. This fails with \"a release with the\nsame tag name already exists\" if a maintainer ran `gh release create`\nmanually right after pushing the tag — which is exactly what\nhappened on every release in the v0.5.0 / v0.5.1 / v0.6.0 sequence.\nNet effect: the release page exists with the changelog notes but\nhas no binary / VSIX / SHA256 assets attached.\n\nFix: make the step idempotent. If `gh release view $VERSION`\nsucceeds (release already exists), `gh release upload --clobber` the\nbuilt assets to the existing release. Otherwise create it the\nnormal way.\n\n`--clobber` lets a re-run overwrite assets that a previous failed\nattempt partially uploaded — also useful when re-running the\nworkflow via workflow_dispatch to backfill assets on an old release.\n\nBackfill plan: after this lands, re-run the Release workflow on\nv0.5.0, v0.5.1, v0.6.0 via workflow_dispatch (or push a no-op tag\nupdate). Each run will detect the existing release and upload the\nbinaries that were built but never published.\n\nTrace: skip",
          "timestamp": "2026-04-29T15:44:31-05:00",
          "tree_id": "ebc5f0b640e0a52bd3881e1a2d48ff6526b1e01b",
          "url": "https://github.com/pulseengine/rivet/commit/67f0e081684f63ad1c1db4606934a75616106696"
        },
        "date": 1777496580819,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 80058,
            "range": "± 805",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 839657,
            "range": "± 3298",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12000720,
            "range": "± 633278",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2134,
            "range": "± 417",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25475,
            "range": "± 71",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 358953,
            "range": "± 11703",
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
            "value": 1176414,
            "range": "± 12391",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 159625,
            "range": "± 1750",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1879574,
            "range": "± 7378",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 24549162,
            "range": "± 1191576",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 137581,
            "range": "± 1207",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1204175,
            "range": "± 10078",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 13168099,
            "range": "± 540558",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4553,
            "range": "± 25",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 59560,
            "range": "± 605",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 744927,
            "range": "± 2186",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 62053,
            "range": "± 377",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 697794,
            "range": "± 2386",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7710440,
            "range": "± 77647",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 840,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7760,
            "range": "± 39",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 113041,
            "range": "± 892",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23483,
            "range": "± 142",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 168427,
            "range": "± 1717",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1569764,
            "range": "± 14130",
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
          "id": "40fdff0377d65e8a0a53c22ca8b0398fc90ac7dd",
          "message": "feat(docs-check): subcommand-coverage gate — walk clap tree + assert each path has an embedded doc (#241)\n\n* feat(docs-check): subcommand-coverage gate — walk clap tree + assert each path has an embedded doc\n\nAdds `--coverage` (and `--strict`) flags to `rivet docs check` that walk\nthe live clap CLI tree, build subcommand paths (`schema/show`,\n`variant/check-all`, …), and cross-reference each against the embedded\ndocs registry. Default is warn-only so the gate can land in CI before\nthe existing inventory of uncovered subcommands is filled.\n\nCoverage rules are layered:\n  1. Exact slug match (`schema/show` → `schema-show` or literal `schema/show`)\n  2. Parent-walk to the next-shorter path\n  3. Manual umbrella mapping via `COVERAGE_TOPIC_MAP` (e.g. `cli` covers\n     most top-level commands; `mutation` covers add/link/modify/…)\n  4. Allow-list for clap-builtin synthetic commands (`help`,\n     `commit-msg-check`)\n\nThe 0.6.0 inventory has 33 uncovered paths across 7 top-level\nsubcommands: variant, baseline, snapshot, runs, pipelines, templates,\nclose-gaps. (`mcp` got its topic in 0.5.1 and is now covered.) The\n`--strict` flag is the future CI gate; `--coverage` alone is the\ndiscovery surface.\n\nTouches the existing `cmd_docs_check` dispatch only to add the new\n`--coverage` early branch — backward compatible with `rivet docs check`\n(no flags).\n\nImplements: REQ-007\nRefs: REQ-004\n\n* docs(docs-check): topic_slugs API + new docs-coverage topic + cli topic update\n\nExposes `docs::topic_slugs()` and `docs::has_topic()` so the\nsubcommand-coverage gate can cross-reference clap subcommand paths\nagainst the embedded TOPICS registry without re-listing slugs.\n\nAdds a new `docs-coverage` reference topic that documents the gate's\nmatching rules, the warn-then-strict ramp-up, and the allow-list policy\nfor clap-builtin synthetic commands.\n\nUpdates the `cli` reference topic to surface `rivet docs check\n--coverage` next to the existing `rivet docs check` entry.\n\nImplements: REQ-007\n\n* test(docs-check): coverage gate fixtures + integration tests\n\nFive integration tests exercising the subcommand-coverage gate's\nexternal contract:\n\n  * coverage_warn_only_exits_zero — the default mode never breaks the\n    build, even when uncovered paths are listed\n  * coverage_strict_fails_when_uncovered_present — `--strict` exits\n    non-zero exactly when the report shows uncovered paths (and exit 0\n    otherwise, so the test stays green when docs catch up)\n  * coverage_json_envelope — `--format json` produces the standard\n    envelope (command/status/total/covered/uncovered/subcommands)\n  * coverage_allowlist_excludes_internal_helpers — `commit-msg-check`\n    is allow-listed and never appears in the uncovered list\n  * docs_check_without_coverage_unchanged — backward compatibility:\n    `rivet docs check` (no flags) still runs the existing doc-vs-reality\n    invariants\n\nAsserts on report SHAPE rather than specific names so the tests stay\ngreen as docs are written for previously-uncovered subcommands.\n\nEight unit tests in `coverage_gate_tests` exercise\n`compute_coverage_rows` against a fake clap tree (one parent + two\nleaves) — the implementation sketch from the task spec — covering\nparent-walk, leaf-specific override, allow-list, umbrella topic_map,\nand a sanity check that every entry in the production\n`COVERAGE_TOPIC_MAP` points at a real topic in `docs::TOPICS`.\n\nVerifies: REQ-007\n\n* ci: wire rivet docs check --coverage into Docs Check job (warn-only)\n\nAdds a new step to the existing `docs-check` job that runs the\nsubcommand-coverage gate in warn-only mode (no `--strict`). This makes\nthe inventory visible in every CI run without breaking the build on the\nexisting seven uncovered top-level commands (variant, baseline,\nsnapshot, runs, pipelines, templates, close-gaps).\n\nThe flip to `--strict` happens in a follow-up commit once the obvious\ngaps have docs.",
          "timestamp": "2026-04-29T16:36:52-05:00",
          "tree_id": "f014554108fa90cae87714dc2f3d24feea073532",
          "url": "https://github.com/pulseengine/rivet/commit/40fdff0377d65e8a0a53c22ca8b0398fc90ac7dd"
        },
        "date": 1777501286521,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 80133,
            "range": "± 2561",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 847636,
            "range": "± 6398",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12873693,
            "range": "± 1176270",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2164,
            "range": "± 9",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 27062,
            "range": "± 136",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 363810,
            "range": "± 1198",
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
            "value": 1189117,
            "range": "± 115708",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 160206,
            "range": "± 803",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1912287,
            "range": "± 12400",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 24968668,
            "range": "± 1117103",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 139305,
            "range": "± 544",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1208939,
            "range": "± 27671",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 15569214,
            "range": "± 1104512",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4384,
            "range": "± 13",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 62040,
            "range": "± 467",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 762544,
            "range": "± 6226",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 61782,
            "range": "± 630",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 703014,
            "range": "± 9102",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7950561,
            "range": "± 228605",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 843,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7912,
            "range": "± 28",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 110427,
            "range": "± 646",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23505,
            "range": "± 471",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 165521,
            "range": "± 573",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1566833,
            "range": "± 8218",
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
          "id": "0371cada8a54111d405ff4265e072a35770041e3",
          "message": "feat(schema): rivet schema migrate Phase 2 — conflict markers + --continue / --skip / --edit (#242)\n\n* feat(schema): rivet schema migrate Phase 2 — conflict resolution UX\n\nPhase 2 of issue #236. Phase 1 (in 0.6.0) shipped the diff engine and\nmechanical apply with snapshot/abort. Phase 2 adds the rebase-style\nconflict-resolution flow.\n\nEngine (rivet-core/src/migrate.rs):\n* `MigrationState::Conflict` joins the existing `Planned / InProgress\n  / Complete` states.\n* `MigrationManifest.resolutions` tracks per-artifact `pending /\n  resolved / skipped` status across `--apply / --continue / --skip /\n  --edit`.\n* `MigrationLayout::current_conflict_path` writes the artifact id the\n  walker paused on; `--status` surfaces it.\n* `diff_artifacts` now emits `FieldValueConflict` for any source\n  field whose value violates the target field's `allowed_values`\n  enum (e.g. `priority: 5` → `[must|should|could|wont]`).\n* `apply_to_file_partial` skips conflict-class entries; the `--apply`\n  walker uses it so mechanical changes always commit before pausing.\n* `write_conflict_markers` splices git-rebase-style `<<<<<<<` /\n  `=======` / `>>>>>>>` blocks into the affected field.\n  `scan_conflict_markers` is the inverse used by `--continue` and the\n  `MigrationConflict` doc-check invariant.\n* `restore_artifact_from_snapshot` swaps a single artifact back to\n  its pre-migration form for `--skip`.\n\nCLI (rivet-cli/src/migrate_cmd.rs + main.rs):\n* `--apply` no longer bails on conflicts — it walks the plan,\n  applies every mechanical/decidable change, then writes markers for\n  the first conflict and exits non-zero with state CONFLICT.\n* `--continue` verifies markers are gone, re-parses the file as\n  YAML, marks resolved, advances.\n* `--skip` rebuilds the file from the snapshot (mechanical-pass\n  applied to other artifacts in the same file) and restores the\n  conflicted artifact's pre-migration form.\n* `--edit <ID>` re-stamps markers on a previously-resolved or\n  skipped conflict.\n* `--status` reports CONFLICT state plus the current conflict's id\n  and file, with next-step suggestions.\n\nValidation (rivet-core/src/doc_check.rs):\n* `MigrationConflict` doc-invariant scans every `*.yaml` /  `*.yml`\n  under `<project>/artifacts/` and emits a violation for any line\n  that begins with `<<<<<<<` / `=======` / `>>>>>>>`. Prevents\n  accidental commits with leftover markers.\n\nTests (rivet-core/src/migrate.rs + rivet-cli/tests/migrate_integration.rs):\n* 7 new unit tests covering enum-mismatch detection, marker round\n  trip, scan, restore-from-snapshot, partial-apply, plan lookup, and\n  Conflict state roundtrip.\n* 6 new integration tests covering the apply-pauses-on-conflict\n  flow, --continue success, --continue marker rejection, --skip\n  restore, --edit re-open, and the docs-check MigrationConflict\n  surface.\n\nPhase 3 (deferred): dashboard `/migrations/<id>` view, `rivet\nrecipes` subcommand for recipe distribution, provenance entries on\nmigrated artifacts.\n\nImplements: REQ-007, REQ-010\nImplements: REQ-004\nVerifies: REQ-007, REQ-010, REQ-004\n\nCo-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>\n\n* docs(migrate): Phase 2 conflict-resolution flow in rivet docs schema-migrate\n\nExtend the embedded `rivet docs schema-migrate` topic with:\n* Updated quick-start commands (`--continue`, `--skip`, `--edit`)\n* CONFLICT state in the state-machine diagram\n* Worked example of marker syntax + resolution workflow\n* `current-conflict` file in the storage-layout table\n* Note on the `MigrationConflict` doc-check invariant\n* Refreshed \"still deferred\" list (dashboard, recipes subcommand).\n\nRefs: FEAT-001\n\n---------\n\nCo-authored-by: Claude Opus 4.7 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-04-29T16:36:57-05:00",
          "tree_id": "2cf269edb5cd2b47ad2b743f822b5c075116ada8",
          "url": "https://github.com/pulseengine/rivet/commit/0371cada8a54111d405ff4265e072a35770041e3"
        },
        "date": 1777503383360,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 75237,
            "range": "± 566",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 884751,
            "range": "± 6734",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14673610,
            "range": "± 694089",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1749,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 19361,
            "range": "± 32",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 348648,
            "range": "± 1497",
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
            "value": 1094316,
            "range": "± 13183",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 158519,
            "range": "± 1231",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1831611,
            "range": "± 32987",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 39290192,
            "range": "± 2153059",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 122737,
            "range": "± 559",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1175214,
            "range": "± 11072",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 19815038,
            "range": "± 1957111",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3907,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 40778,
            "range": "± 73",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 746271,
            "range": "± 4103",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 53076,
            "range": "± 490",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 587833,
            "range": "± 1990",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8456232,
            "range": "± 673172",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 676,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 5511,
            "range": "± 12",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 142675,
            "range": "± 482",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21910,
            "range": "± 117",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 160280,
            "range": "± 1334",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1486859,
            "range": "± 24759",
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
          "id": "b7a17bef97b4da9a258cbe7493f996248f00f335",
          "message": "chore(release): v0.7.0 — schema migrate Phase 2 + docs coverage gate (#246)\n\nWorkspace, vscode-rivet, and npm root package versions bumped to 0.7.0.\nPlatform packages stay on the release-npm.yml override path.\n\nWhat's in 0.7.0:\n\n- feat(schema): rivet schema migrate Phase 2 (#242) — full git-rebase\n  conflict-resolution UX. Conflict markers in YAML, --continue,\n  --skip, --edit. New MigrationConflict invariant in rivet docs check.\n- feat(docs-check): subcommand-coverage gate (#241) — walks the live\n  clap CLI tree and asserts each path has an embedded docs topic.\n  Default warn-only; --strict makes it enforcing.\n- feat(validate): prose-mention-without-typed-link warning (#234,\n  closes #207).\n- feat(schemas): vv-coverage repo-status type (#232, partial #188).\n- feat(mutants): canonical cargo-mutants template (#229, closes #185).\n- docs(pre-commit): canonical 21-hook template (#222, closes #186).\n- fix(ci): Release workflow now idempotent on existing tag (#244).\n\nKnown issue: v0.5.0 / v0.5.1 / v0.6.0 release pages have no binary\nassets attached because the workflow's Create Release step failed\non each (race with manual gh release create). The fix in #244 lands\nin this release; v0.7.0 onward is unaffected. Older releases need\na manual gh release upload to backfill.\n\nVerified: cargo check, cargo clippy --workspace -- -D warnings,\ncargo test -p rivet-cli, rivet docs check (clean), rivet docs check\n--coverage reports 48/81 paths covered (warn-only).\n\nTrace: skip",
          "timestamp": "2026-04-29T23:43:36-05:00",
          "tree_id": "5fd526b079220fb40150fdd4ab80e2dabd5179c7",
          "url": "https://github.com/pulseengine/rivet/commit/b7a17bef97b4da9a258cbe7493f996248f00f335"
        },
        "date": 1777540383327,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 78724,
            "range": "± 774",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 837745,
            "range": "± 5515",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 10641021,
            "range": "± 264093",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2156,
            "range": "± 15",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 27252,
            "range": "± 290",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 361001,
            "range": "± 28816",
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
            "value": 94,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1200854,
            "range": "± 40550",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 165705,
            "range": "± 757",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1875150,
            "range": "± 9654",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 22660622,
            "range": "± 884929",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 138731,
            "range": "± 793",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1200091,
            "range": "± 25312",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 12248917,
            "range": "± 180828",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4202,
            "range": "± 43",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 59870,
            "range": "± 3653",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 767575,
            "range": "± 1526",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 62030,
            "range": "± 224",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 700029,
            "range": "± 6758",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7661118,
            "range": "± 47797",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 783,
            "range": "± 29",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7382,
            "range": "± 43",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 116131,
            "range": "± 1361",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23859,
            "range": "± 111",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 166588,
            "range": "± 495",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1563526,
            "range": "± 12399",
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
          "id": "a50fbb7508766f94b308f967fef98f2c1fab3c65",
          "message": "fix(docs-check): tighten --coverage rule 4 + add --warn-only mode (#248) (#250)\n\nTwo fixes to `rivet docs check --coverage` (the gate from #241):\n\n* B5 — rule 4 (umbrella mapping via `COVERAGE_TOPIC_MAP`) now requires\n  the parent topic body to mention the child subcommand by name as a\n  whole word, case-insensitive. A catch-all `cli` mapping that doesn't\n  reference the family is no coverage at all. With the current TOPICS\n  registry this surfaces `lsp` and `batch` as additional gaps\n  (was 48/81 covered; now 46/81).\n\n* B6 — replace the implicit two-state warn/strict pattern with three\n  explicit modes:\n    --coverage              print, exit 0, no annotations (local use)\n    --coverage --warn-only  print + emit ::warning::file=…::… GitHub\n                            Actions annotations per gap, exit 0\n                            (CI rollout — surface gaps inline on PRs\n                            without failing the build)\n    --coverage --strict     print, exit 1 on any uncovered (enforcing CI)\n\n  `--warn-only` and `--strict` are mutually exclusive (clap-enforced).\n  CI workflow now uses `--warn-only` explicitly so the contract is\n  legible at the call site rather than relying on the previous default\n  warn-on-failure semantics.\n\nThe `rivet docs docs-coverage` topic and the docs::TOPICS body are\nupdated to describe the three modes and the rule-4 body-mention check.\n\nTests:\n  * 6 new unit tests for the body-mention rule (positive/negative,\n    case-insensitive, whole-word, plus a direct test of the\n    `topic_body_mentions` helper).\n  * Integration: `coverage_warn_only_emits_github_annotations` asserts\n    at least one `::warning file=…::` line is printed and exit is 0.\n  * Integration: `coverage_strict_currently_fails_on_main` pins exit 1\n    behaviour while the inventory has gaps.\n  * Integration: `coverage_warn_only_and_strict_are_mutually_exclusive`\n    pins clap conflict-rejection.\n  * Integration: existing `coverage_default_exits_zero_no_annotations`\n    asserts no `::warning::` lines in the default mode.\n\nCloses #248.\n\nImplements: REQ-007",
          "timestamp": "2026-05-01T07:44:08-05:00",
          "tree_id": "a44f6ebd764344d79706e8544b4e99d9f6934a63",
          "url": "https://github.com/pulseengine/rivet/commit/a50fbb7508766f94b308f967fef98f2c1fab3c65"
        },
        "date": 1777690563174,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 75148,
            "range": "± 176",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 878909,
            "range": "± 7464",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14023911,
            "range": "± 600782",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1707,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 18417,
            "range": "± 28",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 344984,
            "range": "± 786",
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
            "value": 1084943,
            "range": "± 9937",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 157667,
            "range": "± 410",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1846078,
            "range": "± 7763",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 38478230,
            "range": "± 2298580",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 123842,
            "range": "± 1012",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1193716,
            "range": "± 25119",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 21516788,
            "range": "± 1858531",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3908,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 40923,
            "range": "± 1800",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 772091,
            "range": "± 5283",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 53813,
            "range": "± 1308",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 585587,
            "range": "± 3650",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8982710,
            "range": "± 571023",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 667,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 5453,
            "range": "± 13",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 147906,
            "range": "± 336",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21988,
            "range": "± 49",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 160278,
            "range": "± 311",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1491147,
            "range": "± 14603",
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
          "id": "4c8e7e9d0ba468babde19f5f050399ab82c90a7b",
          "message": "feat(cli): cited-source --strict, --strict-cited-source-stale, schema migrate --list (#249) (#251)\n\nThree platform-engineering CLI symmetries from issue #249:\n\nB7 — `rivet check sources --strict` is a read-only audit gate. Walks\nevery artifact with a `cited-source`, classifies each as match / drift\n/ missing-hash / read-error / shape-error / stale, and exits non-zero\non anything other than match. Mutually exclusive with --update so\naudit and fix are never the same invocation. Never modifies any YAML.\n\nB8 — `rivet validate --strict-cited-source-stale` promotes the\npreviously-Info `cited-source-stale` diagnostic to Error. The stale\nverdict now fires for missing, unparseable, OR older-than-30-days\nlast-checked timestamps (30d is a hard-coded default; per-schema\nthresholds remain a follow-up). New helpers:\n  - cited_source::parse_iso8601_utc — chrono-free ISO-8601 parsing\n  - cited_source::classify_staleness — fresh / missing / old / unparseable\n\nB9 — `rivet schema migrate --list` enumerates every available recipe\n(built-in + project-local YAML under <schemas-dir>/migrations/).\nProject-local recipes shadow built-ins of the same name. Text and\nJSON output. Mutually exclusive with target + action flags. New\n`migrate::list_recipes` helper + `RecipeEntry` / `RecipeOrigin` types.\n\nTests:\n- B7: integration test asserts clean fixture exits 0; off-disk edit\n  exits 1 without mutating the YAML; --update --apply restores 0.\n- B7: clap mutex test for --strict + --update.\n- B8: unit tests cover the staleness classifier and severity\n  promotion; integration test asserts default exit 0 + strict exit 1.\n- B9: unit tests cover built-in / project-local / shadow precedence;\n  integration tests cover text + JSON output + clap mutex with --apply.\n\nDocs (rivet docs schema-cited-sources, rivet docs schema-migrate)\nupdated with the new flags + the audit-gate pattern.\n\nImplements: REQ-007, REQ-004\nVerifies: REQ-007, REQ-004\nRefs: #249\n\nCo-authored-by: Claude Opus 4.7 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-05-01T07:44:21-05:00",
          "tree_id": "0de3b667b6fe77a858074012c11ad5870adf9e05",
          "url": "https://github.com/pulseengine/rivet/commit/4c8e7e9d0ba468babde19f5f050399ab82c90a7b"
        },
        "date": 1777691133286,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 62795,
            "range": "± 2172",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 674573,
            "range": "± 3379",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 15958631,
            "range": "± 1169656",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1482,
            "range": "± 11",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 18439,
            "range": "± 243",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 266989,
            "range": "± 3388",
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
            "value": 75,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 927108,
            "range": "± 3131",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 126889,
            "range": "± 360",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1476411,
            "range": "± 9448",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 31637541,
            "range": "± 3005764",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 102023,
            "range": "± 2099",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 899318,
            "range": "± 4945",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 15395470,
            "range": "± 1257643",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3214,
            "range": "± 22",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 35282,
            "range": "± 605",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 583807,
            "range": "± 2662",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 46911,
            "range": "± 1151",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 506774,
            "range": "± 2163",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 6317093,
            "range": "± 353973",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 596,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 5226,
            "range": "± 168",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 69879,
            "range": "± 273",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 16148,
            "range": "± 192",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 111624,
            "range": "± 349",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1044528,
            "range": "± 13880",
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
          "id": "2ff1c159b7345f57456db8246938ac73bbd25ecf",
          "message": "fix(docs): stale literals + extend rivet docs check with EmbeddedVersionLiterals / EmbeddedFlagReferences / EmbeddedTodoMarkers (#247) (#252)\n\nFixes four stale literals shipped in 0.7.0 docs and extends `rivet docs\ncheck` with three new invariants that scan the embedded `rivet docs\n<topic>` bodies (the strings printed by the binary, not files on disk)\nso this class of drift surfaces at CI time instead of via user reports.\n\nPart A — fixes:\n  * `quickstart` topic step 1: replace `rivet 0.5.0` literal expectation\n    with version-agnostic prose (`rivet ` + any version).\n  * `mcp` topic: change the `serverInfo` example version from a hard-\n    coded `0.5.0` to `<rmcp-version>` and add a note explaining that\n    field reflects the underlying rmcp crate, not rivet's release line.\n  * `schemas/eu-ai-act.yaml` (drives `rivet docs schema/eu-ai-act`):\n    flip the single-schema usage line from `rivet init --schema\n    eu-ai-act` to `rivet init --preset eu-ai-act`. Multi-schema bridge\n    examples (e.g. `--schema eu-ai-act,stpa`) are valid and stay.\n  * `schemas/dev.yaml` (drives `rivet docs schema/dev`): drop the\n    `docs/agent-pipelines.md (TODO)` cross-reference to a non-existent\n    topic.\n  * Bonus: `rivet docs impact` example used a stale tag literal\n    (`v0.5.0`); replaced with `vX.Y.Z` placeholder.\n  * Bonus: `rivet export --gherkin` was a stale flag; rewritten to\n    `rivet export --format gherkin` in dev.yaml + main.rs comment.\n\nPart B — new invariants in `rivet-core/src/doc_check.rs`:\n  * `EmbeddedVersionLiterals` — every `vX.Y.Z` / `X.Y.Z` token in a\n    topic body must equal the workspace version OR be in\n    `rivet.yaml docs-check.allowed-version-literals`. Allowlist entries\n    without a `v` prefix also match the `v`-prefixed form so users only\n    have to allowlist one shape.\n  * `EmbeddedFlagReferences` — every `rivet <subcmd> --<flag>` token in\n    a topic body must reference a flag declared on that subcommand in\n    the live clap tree. Walks parent-up so root-level globals\n    (`--project`, `--verbose`) and intermediate flags resolve. When the\n    *subcommand* itself is unknown we defer to `SubcommandReferences`,\n    not double-report.\n  * `EmbeddedTodoMarkers` — `TODO` / `FIXME` / `XXX` in topic bodies are\n    author markers that must not ship in a release binary. Inline meta-\n    references (`` `TODO` ``) are skipped so docs-about-the-invariant\n    stay legal.\n\nWiring (rivet-cli/src/main.rs + rivet-cli/src/docs.rs):\n  * `docs::topic_bodies()` exposes (slug, body) pairs for the engine.\n  * `build_subcommand_flag_map()` walks `Cli::command()` and collects\n    long flags per slash-separated path, seeded with root-level globals\n    and the clap built-ins (`--help`, `--version`).\n  * `cmd_docs_check` populates `embedded_topics`, `subcommand_flags`,\n    and `allowed_version_literals` on the `DocCheckContext`.\n\nConfig (rivet-core/src/model.rs):\n  * Adds `allowed_version_literals: Vec<String>` to `DocsCheckConfig`\n    (the `docs-check:` block in `rivet.yaml`).\n  * Repo's own `rivet.yaml` is updated with the literals shipped in\n    rivet's schemas/topics (schema header versions, ASPICE process IDs,\n    supply-chain example artifacts, rmcp pin).\n\nNew topic + tests:\n  * Adds a `docs-check` reference topic listing both the markdown and\n    embedded-doc invariants and showing the allowlist syntax.\n  * 10 new unit tests in `doc_check::tests` cover each new invariant\n    plus the no-topics-disabled smoke (existing engine consumers that\n    don't populate the field still pass).\n\n`rivet docs check` is clean against the rivet repo after Part A; CI's\nexisting `cargo run -- docs check` step picks the new invariants up\nautomatically via `default_invariants()` — no workflow change needed.\n\nCloses #247\n\nImplements: REQ-004, REQ-007\n\nCo-authored-by: Claude Opus 4.7 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-05-01T10:33:42-05:00",
          "tree_id": "3b734d0c88fcfd2204f5daf6d736e2229189a098",
          "url": "https://github.com/pulseengine/rivet/commit/2ff1c159b7345f57456db8246938ac73bbd25ecf"
        },
        "date": 1777696286962,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 81113,
            "range": "± 334",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 859378,
            "range": "± 18744",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 16109376,
            "range": "± 1848597",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2201,
            "range": "± 19",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 23870,
            "range": "± 66",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 379859,
            "range": "± 2538",
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
            "value": 95,
            "range": "± 1",
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
            "value": 1191966,
            "range": "± 19082",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 164093,
            "range": "± 2057",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1922615,
            "range": "± 28693",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 35202528,
            "range": "± 4357740",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 140247,
            "range": "± 1662",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1227675,
            "range": "± 14701",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 21929182,
            "range": "± 2893932",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4243,
            "range": "± 16",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 61769,
            "range": "± 418",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 837009,
            "range": "± 41875",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 57708,
            "range": "± 4311",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 697309,
            "range": "± 4357",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 9756223,
            "range": "± 833490",
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
            "value": 7513,
            "range": "± 49",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 113495,
            "range": "± 2740",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22396,
            "range": "± 429",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 156003,
            "range": "± 875",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1470819,
            "range": "± 13344",
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
          "id": "9b45c862f0a3f437a988099b541aa2ecdd997dc2",
          "message": "chore(release): v0.8.0 — dogfood follow-ups (#256)\n\n* chore(release): v0.8.0 — dogfood follow-ups\n\nWorkspace, vscode-rivet, and npm root package versions bumped to 0.8.0.\nPlatform packages stay on the release-npm.yml override path.\n\nWhat's in 0.8.0:\n\n- fix(docs): stale literals + extend rivet docs check (#252, closes\n  #247). Six embedded-doc literals fixed, plus three new invariants\n  (EmbeddedVersionLiterals, EmbeddedFlagReferences,\n  EmbeddedTodoMarkers) to prevent the class of drift from re-shipping.\n- feat(docs-check): tighten --coverage rule 4 + --warn-only (#250,\n  closes #248). Rule 4 now requires child name to appear in parent\n  body (catches false-positives on lsp + batch). New three-mode\n  semantics: default silent / --warn-only with annotations / --strict\n  fail.\n- feat(cli): cited-source --strict, --strict-cited-source-stale,\n  schema migrate --list (#251, closes #249). Read-only audit gate\n  for cited-source drift; promotable stale severity; recipe discovery.\n\nTrace: skip\n\n* ci: ignore RUSTSEC-2026-0114 (wasmtime 42.x table-allocation panic)\n\nNew wasmtime advisory published 2026-04-30, blocking 0.8.0 CI.\nRivet's wasmtime usage is behind an optional wasm feature gate and\ndoesn't allocate large wasmtime tables, so the panic case isn't\nreachable. Follow-up issue will track upgrading to wasmtime >=43.0.2.\n\nTrace: skip",
          "timestamp": "2026-05-02T09:44:40-05:00",
          "tree_id": "9250daa85d680cb8589ad1f416681d4baff7e353",
          "url": "https://github.com/pulseengine/rivet/commit/9b45c862f0a3f437a988099b541aa2ecdd997dc2"
        },
        "date": 1777769340220,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 78846,
            "range": "± 499",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 841942,
            "range": "± 4414",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14031066,
            "range": "± 1047708",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2177,
            "range": "± 28",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26156,
            "range": "± 247",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 358248,
            "range": "± 2942",
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
            "value": 93,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1185284,
            "range": "± 12154",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 163959,
            "range": "± 1484",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1926147,
            "range": "± 13319",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 29210248,
            "range": "± 1823498",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 138146,
            "range": "± 1203",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1209751,
            "range": "± 14787",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 16881866,
            "range": "± 1264960",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4337,
            "range": "± 21",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 58868,
            "range": "± 719",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 768844,
            "range": "± 10107",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 60711,
            "range": "± 210",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 689060,
            "range": "± 4481",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 9268979,
            "range": "± 645271",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 808,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7409,
            "range": "± 141",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 110920,
            "range": "± 1377",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22500,
            "range": "± 181",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 157569,
            "range": "± 1404",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1500064,
            "range": "± 10598",
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
          "id": "08b87f86de28055a8e37b97211a3d184939943f8",
          "message": "ci(release-npm): switch to workflow_run trigger so npm publish auto-fires after Release (#261)\n\nThe Release workflow creates the GitHub Release page using the default\nGITHUB_TOKEN, and GitHub deliberately suppresses downstream workflow\ntriggers from runs that authenticated with GITHUB_TOKEN (loop-prevention\nguarantee). As a result, release-npm.yml's `release: published` trigger\nnever fires for v0.7.0 or v0.8.0 — both stuck without npm publication\ndespite the binary archives being on the GitHub Release page.\n\nSwitch to workflow_run on the upstream Release workflow. This is the\ndocumented escape hatch for chaining workflows when the upstream uses\nGITHUB_TOKEN. Side effects:\n\n  * head_branch on a tag-push source workflow is the tag name itself\n    (e.g. v0.8.0), so version resolution stays straightforward.\n  * Guard added against non-release tags so a manual Release run on a\n    branch ref doesn't accidentally trigger an npm publish.\n  * Both jobs gated on workflow_run.conclusion == 'success' so failed\n    upstream releases don't fire downstream publishes; workflow_dispatch\n    bypasses the gate for manual backfills.\n\nBackfilling v0.7.0 and v0.8.0 npm publication will be done via\nworkflow_dispatch once this lands on main.\n\nCo-authored-by: Claude Opus 4.7 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-05-03T10:39:23-05:00",
          "tree_id": "1fbd6fc48afe7456c356d076db2576fe9c57fff9",
          "url": "https://github.com/pulseengine/rivet/commit/08b87f86de28055a8e37b97211a3d184939943f8"
        },
        "date": 1777840150561,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 79586,
            "range": "± 410",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 859207,
            "range": "± 3763",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 16540011,
            "range": "± 1087598",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1983,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24978,
            "range": "± 46",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 351600,
            "range": "± 10570",
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
            "value": 1227040,
            "range": "± 24198",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 167730,
            "range": "± 894",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1950464,
            "range": "± 60108",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 37911232,
            "range": "± 4174028",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 135292,
            "range": "± 1501",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1249301,
            "range": "± 20852",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 20064139,
            "range": "± 1301279",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4166,
            "range": "± 231",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 44661,
            "range": "± 159",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 751547,
            "range": "± 15291",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 63438,
            "range": "± 1919",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 705708,
            "range": "± 2718",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8763046,
            "range": "± 386243",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 789,
            "range": "± 19",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7412,
            "range": "± 39",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 92475,
            "range": "± 909",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22836,
            "range": "± 571",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 144392,
            "range": "± 684",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1340857,
            "range": "± 22341",
            "unit": "ns/iter"
          }
        ]
      }
    ]
  }
}