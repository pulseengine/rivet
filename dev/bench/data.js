window.BENCHMARK_DATA = {
  "lastUpdate": 1784102393567,
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
          "id": "c8d38f658d6f90cca10f156fb7a660e8195997ae",
          "message": "Merge pull request #657 from pulseengine/fix/issue-652-aspice-verifies-sw-req\n\nfix(aspice): make swe1-has-verification satisfiers reachable (#652)",
          "timestamp": "2026-07-03T10:11:14+02:00",
          "tree_id": "573af28e82119badbe00be12009f0a58a9aeeb3a",
          "url": "https://github.com/pulseengine/rivet/commit/c8d38f658d6f90cca10f156fb7a660e8195997ae"
        },
        "date": 1783067259437,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85462,
            "range": "± 558",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 896953,
            "range": "± 6922",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 15830976,
            "range": "± 747492",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2189,
            "range": "± 25",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26600,
            "range": "± 384",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 374687,
            "range": "± 3245",
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
            "value": 1524549,
            "range": "± 39632",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 166246,
            "range": "± 765",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1996078,
            "range": "± 35493",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 41890877,
            "range": "± 2603579",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 465362,
            "range": "± 5871",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 16534496,
            "range": "± 135126",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1273753717,
            "range": "± 14558361",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4260,
            "range": "± 18",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60446,
            "range": "± 384",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 796633,
            "range": "± 52966",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 63053,
            "range": "± 250",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 717718,
            "range": "± 3902",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 11828194,
            "range": "± 581690",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1181,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15730,
            "range": "± 71",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 337912,
            "range": "± 3646",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 24862,
            "range": "± 104",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 176148,
            "range": "± 1049",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1643722,
            "range": "± 20518",
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
          "id": "e1a971affdc0d988fb2fa94295d6b7692ef3457b",
          "message": "Merge pull request #658 from pulseengine/fix/issue-649-transitive-external-refs\n\nfix(validate): scope cross-repo UnknownPrefix to consumer-owned links (#649)",
          "timestamp": "2026-07-07T21:29:52+02:00",
          "tree_id": "b75e45d55b529b346fdf9188ff31285e62cc6cf0",
          "url": "https://github.com/pulseengine/rivet/commit/e1a971affdc0d988fb2fa94295d6b7692ef3457b"
        },
        "date": 1783453392275,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85610,
            "range": "± 3044",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 896797,
            "range": "± 7719",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 16209260,
            "range": "± 917202",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2140,
            "range": "± 57",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25501,
            "range": "± 762",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 383151,
            "range": "± 20383",
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
            "value": 1541214,
            "range": "± 67375",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 165085,
            "range": "± 3476",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1948307,
            "range": "± 11100",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 29762025,
            "range": "± 2383028",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 458414,
            "range": "± 2145",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 15375666,
            "range": "± 201929",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1260529925,
            "range": "± 12086321",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4448,
            "range": "± 24",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 61711,
            "range": "± 1114",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 750279,
            "range": "± 7020",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 63142,
            "range": "± 365",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 723241,
            "range": "± 4221",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 10484018,
            "range": "± 792616",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1096,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14929,
            "range": "± 240",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 326707,
            "range": "± 3730",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 24506,
            "range": "± 101",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 175621,
            "range": "± 1118",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1625437,
            "range": "± 8903",
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
          "id": "1404d94501ce86ed300d3ef9ed65f1cdb3498d6b",
          "message": "Merge pull request #669 from pulseengine/feat/req-246-lsp-schema-completion\n\nfeat(lsp): schema-aware completion for type / link / fields (REQ-246 slice 1, DD-071, #546)",
          "timestamp": "2026-07-07T21:31:35+02:00",
          "tree_id": "07f7ad7c60f583887a1fe9336a9cb89964e74d03",
          "url": "https://github.com/pulseengine/rivet/commit/1404d94501ce86ed300d3ef9ed65f1cdb3498d6b"
        },
        "date": 1783453492139,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84359,
            "range": "± 3222",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 904134,
            "range": "± 4669",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 17304791,
            "range": "± 1143669",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2147,
            "range": "± 11",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26408,
            "range": "± 178",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 375451,
            "range": "± 3434",
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
            "value": 1524467,
            "range": "± 26638",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 168132,
            "range": "± 647",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1976245,
            "range": "± 14173",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 40423421,
            "range": "± 2206394",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 464927,
            "range": "± 2415",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 16110183,
            "range": "± 242889",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1257401428,
            "range": "± 14211394",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4407,
            "range": "± 12",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 58737,
            "range": "± 180",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 785109,
            "range": "± 5617",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 61161,
            "range": "± 413",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 685654,
            "range": "± 5116",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7508136,
            "range": "± 221884",
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
            "value": 15539,
            "range": "± 71",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 337670,
            "range": "± 8945",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 24518,
            "range": "± 201",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 176448,
            "range": "± 1926",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1620299,
            "range": "± 19708",
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
          "id": "d6b6002fb87360a4830b83bd29ebd64c9c856ee5",
          "message": "Merge pull request #670 from pulseengine/fix/crossbeam-epoch-rustsec-2026-0204\n\nfix(security): bump crossbeam-epoch 0.9.18→0.9.20 (RUSTSEC-2026-0204)",
          "timestamp": "2026-07-08T05:45:13+02:00",
          "tree_id": "0174bb9af8165cc7c05b3df0578307b509e2239a",
          "url": "https://github.com/pulseengine/rivet/commit/d6b6002fb87360a4830b83bd29ebd64c9c856ee5"
        },
        "date": 1783482911883,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84527,
            "range": "± 311",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 883743,
            "range": "± 11474",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13014277,
            "range": "± 605033",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2193,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25885,
            "range": "± 39",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 370186,
            "range": "± 1303",
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
            "value": 1518010,
            "range": "± 16915",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 161141,
            "range": "± 2492",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1896985,
            "range": "± 15804",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 26726208,
            "range": "± 1228422",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 458029,
            "range": "± 2167",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 15073037,
            "range": "± 126508",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1237118706,
            "range": "± 17820336",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4302,
            "range": "± 15",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 70132,
            "range": "± 347",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 792732,
            "range": "± 5220",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 60417,
            "range": "± 162",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 692098,
            "range": "± 2520",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7609905,
            "range": "± 104587",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1345,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14991,
            "range": "± 142",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 320428,
            "range": "± 1042",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23886,
            "range": "± 177",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 168855,
            "range": "± 1622",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1596027,
            "range": "± 15260",
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
          "id": "68c916ab8d757575a6945744ca2cee7b404e8b2f",
          "message": "Merge pull request #675 from pulseengine/feat/req-245-backend-down-indicator\n\nfeat(serve): backend-unavailable banner when the serve process is down (REQ-245, #621)",
          "timestamp": "2026-07-08T18:50:39+02:00",
          "tree_id": "2855368cf86cc18286d339294ecca52133152c1c",
          "url": "https://github.com/pulseengine/rivet/commit/68c916ab8d757575a6945744ca2cee7b404e8b2f"
        },
        "date": 1783530012380,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84691,
            "range": "± 2174",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 887009,
            "range": "± 8254",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13766146,
            "range": "± 957395",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2132,
            "range": "± 15",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25641,
            "range": "± 101",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 357130,
            "range": "± 2265",
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
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1542559,
            "range": "± 46590",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 163625,
            "range": "± 716",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1921522,
            "range": "± 6891",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 33987965,
            "range": "± 3340441",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 458674,
            "range": "± 4594",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 15300676,
            "range": "± 229632",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1258360560,
            "range": "± 18084266",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4326,
            "range": "± 26",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60364,
            "range": "± 339",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 767738,
            "range": "± 5820",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 60433,
            "range": "± 246",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 694017,
            "range": "± 5230",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8095740,
            "range": "± 213445",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1141,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14662,
            "range": "± 69",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 318284,
            "range": "± 3817",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 24699,
            "range": "± 146",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 177277,
            "range": "± 1186",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1619009,
            "range": "± 13806",
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
          "id": "e06ef3618c8b6a9b728f8b950bbc946fc863dd95",
          "message": "Merge pull request #676 from pulseengine/feat/req-248-test-result-links\n\nfeat(results): per-result tracking links to PRs / remote issues (REQ-248, DD-072, #548)",
          "timestamp": "2026-07-08T23:11:39+02:00",
          "tree_id": "14b641fb6a2e682b9a8787993c2736e21b2f4bb8",
          "url": "https://github.com/pulseengine/rivet/commit/e06ef3618c8b6a9b728f8b950bbc946fc863dd95"
        },
        "date": 1783545625237,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85216,
            "range": "± 554",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 893496,
            "range": "± 37130",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12462646,
            "range": "± 471284",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2215,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25056,
            "range": "± 1729",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 370853,
            "range": "± 11358",
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
            "value": 1547080,
            "range": "± 53800",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 168391,
            "range": "± 546",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1914413,
            "range": "± 14938",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 26914783,
            "range": "± 1321817",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 453997,
            "range": "± 3860",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 15138252,
            "range": "± 178537",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1248027922,
            "range": "± 17652919",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4276,
            "range": "± 19",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60630,
            "range": "± 681",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 714608,
            "range": "± 1778",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 58934,
            "range": "± 225",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 694710,
            "range": "± 2664",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8281828,
            "range": "± 611294",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1194,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15110,
            "range": "± 63",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 328497,
            "range": "± 5155",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 24091,
            "range": "± 571",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 169307,
            "range": "± 3349",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1608982,
            "range": "± 24329",
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
          "id": "7c23a4ec0f1ea96667f56707ff915c87d22bf6dd",
          "message": "feat(schema): warn when an embedded schema version drifts from a rivet.yaml pin (REQ-249, DD-073, #431) (#679)\n\nAdds a user-owned `project.schema-pins` map to rivet.yaml recording the\nexpected version per schema. `rivet validate` compares each resolved\nschema version against its pin and warns on stderr when they drift — the\nsilent-upgrade case where an embedded-schema bump changes validation out\nfrom under a project.\n\n.rivet-version already records scaffolded_from.schemas but is regenerated\non `rivet upgrade`, so it cannot serve as a stable pin baseline; a\nuser-owned map in rivet.yaml can (DD-073).\n\nWarnings go to stderr so `--format json` on stdout stays machine-clean.\nEscalation to a hard error under a strict flag is left as a follow-on.\n\nConfirmed with the new embedded::tests::schema_pin_drift_is_detected unit\ntest and a full `rivet validate` pass (Result: PASS).\n\nImplements: REQ-249\nRefs: DD-073, FEAT-001",
          "timestamp": "2026-07-09T07:51:09+02:00",
          "tree_id": "8351eca628954b16425ad6aace1c9b20a22d1715",
          "url": "https://github.com/pulseengine/rivet/commit/7c23a4ec0f1ea96667f56707ff915c87d22bf6dd"
        },
        "date": 1783576880263,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 76035,
            "range": "± 1680",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 906621,
            "range": "± 13752",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 16354614,
            "range": "± 1007899",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1522,
            "range": "± 17",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 18184,
            "range": "± 321",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 289611,
            "range": "± 15457",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 72,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/1000",
            "value": 72,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 72,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1324976,
            "range": "± 37105",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 158578,
            "range": "± 1922",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1786387,
            "range": "± 17108",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 42078957,
            "range": "± 2300177",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 408360,
            "range": "± 6618",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 14286123,
            "range": "± 170471",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 989917269,
            "range": "± 10362504",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3604,
            "range": "± 56",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 42016,
            "range": "± 1324",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 826168,
            "range": "± 7090",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 52490,
            "range": "± 1045",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 555440,
            "range": "± 12211",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 6728734,
            "range": "± 159223",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 980,
            "range": "± 15",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 12016,
            "range": "± 239",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 278266,
            "range": "± 4369",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 19928,
            "range": "± 605",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 139362,
            "range": "± 3216",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1290124,
            "range": "± 21639",
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
          "id": "dd6281bb0278ea73fe2870c0ed9c78c8dc715966",
          "message": "docs(release): record crates.io publishing decision + blocker (REQ-250, REQ-252, DD-074) (#681)\n\nInvestigating REQ-250 surfaced two independent walls, so no packaging code\nlands yet — this commit records the findings as traceable artifacts:\n\n- DD-074: publish under rivet-sdlc-core / rivet-sdlc-cli / rivet-etch because\n  the natural names are squatted upstream, keeping lib/bin names via Cargo\n  target renames. The rename itself is DEFERRED to the publish PR: it ripples\n  through ~40 `-p rivet-cli` / `-p rivet-core` specifiers across ci.yml,\n  release.yml, rivet-delta.yml, the compliance action, and scripts, so it must\n  land atomically with the publish rather than ahead of an indefinitely-blocked\n  one.\n- REQ-252: the dependency closure pulls git-only crates (pulseengine/spar's 9\n  spar-* crates via the aadl feature + a rowan fork via rowan-yaml); crates.io\n  rejects git deps transitively, so they must be published first. Cross-repo,\n  larger than one rivet release.\n- REQ-250 description updated: no release assignment until REQ-252 clears and a\n  CARGO_REGISTRY_TOKEN secret exists.\n\nConfirmed with `rivet validate` (Result: PASS) and `rivet docs check`\n(0 violations).\n\nRefs: REQ-250, REQ-252, DD-074, FEAT-001",
          "timestamp": "2026-07-10T13:49:54+02:00",
          "tree_id": "87713baf60befa2f5f8bf26e4a43c9c30482cbe8",
          "url": "https://github.com/pulseengine/rivet/commit/dd6281bb0278ea73fe2870c0ed9c78c8dc715966"
        },
        "date": 1783684977856,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 67942,
            "range": "± 1111",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 728790,
            "range": "± 22308",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 18285996,
            "range": "± 1446719",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1499,
            "range": "± 24",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 18200,
            "range": "± 334",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 269145,
            "range": "± 7338",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 74,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/1000",
            "value": 74,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 74,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1178132,
            "range": "± 10061",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 127592,
            "range": "± 1854",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1484741,
            "range": "± 15648",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 28419197,
            "range": "± 4248182",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 343628,
            "range": "± 7041",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 11373774,
            "range": "± 276710",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 827628915,
            "range": "± 8851306",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3254,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 41626,
            "range": "± 434",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 565518,
            "range": "± 2955",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 48505,
            "range": "± 865",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 535735,
            "range": "± 3669",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8431129,
            "range": "± 796295",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 903,
            "range": "± 11",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 11057,
            "range": "± 208",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 167651,
            "range": "± 4836",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 16785,
            "range": "± 55",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 116551,
            "range": "± 644",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1094141,
            "range": "± 12593",
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
          "id": "41f76401b86f3c7a8882421d9b350eaef43edcd9",
          "message": "Merge pull request #683 from pulseengine/release/v0.25.0\n\nchore(release): v0.25.0",
          "timestamp": "2026-07-10T14:37:02+02:00",
          "tree_id": "27311c7c91a5c82daaa704accc63b5836e03bf9a",
          "url": "https://github.com/pulseengine/rivet/commit/41f76401b86f3c7a8882421d9b350eaef43edcd9"
        },
        "date": 1783687786482,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 86830,
            "range": "± 357",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 891151,
            "range": "± 3298",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12762817,
            "range": "± 173808",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2162,
            "range": "± 12",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 27343,
            "range": "± 245",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 352537,
            "range": "± 1034",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 99,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/1000",
            "value": 99,
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
            "value": 1507022,
            "range": "± 24359",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 160985,
            "range": "± 502",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1931874,
            "range": "± 28917",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 26788212,
            "range": "± 2782123",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 481736,
            "range": "± 4297",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 15564500,
            "range": "± 167054",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1278885503,
            "range": "± 13592650",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4480,
            "range": "± 13",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 61544,
            "range": "± 370",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 801513,
            "range": "± 151457",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 60209,
            "range": "± 252",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 696720,
            "range": "± 14602",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7922000,
            "range": "± 857015",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1085,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14418,
            "range": "± 130",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 328227,
            "range": "± 2510",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22749,
            "range": "± 1526",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 157331,
            "range": "± 2438",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1501561,
            "range": "± 24268",
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
          "id": "f3c0e939d9675ce7b3bac486499cd02edba332cd",
          "message": "ci(compliance): fail if the report tarball exceeds a hard MB cap (#671) (#677)\n\nv0.4.x / v0.7-0.9 shipped ~800 MB compliance-report tarballs (~5.4 GB\nof stale release storage) because build output was bundled by mistake.\nThe producer has since been fixed (v0.13.0+ is 1-2 MB), but nothing\nstops the regression from recurring.\n\nAdds a hard `max-archive-size-mb` cap (default 50 MB) on the compliance\ncomposite action:\n\n- Emits `compliance report size: N MB` and a step-summary table on green\n  so a slow creep is visible before it trips the cap.\n- Fails with a `::error::` line that names #671 when the tarball exceeds\n  the cap; message points at the likely root cause (build output packed\n  into the report directory).\n- Cap of 0 disables the guard for callers that intentionally emit the\n  multi-page dashboard (100s of MB).\n\nGuard logic is extracted to `verify_archive_size.sh` and exercised by\n`verify_archive_size_test.sh` (6 cases: under-cap, over-cap with #671\nmarker, disable-via-zero, missing-file usage error, ~2 MB reference\nshape under default, no-args usage error). The test runs in the\nexisting yaml-lint job so a broken guard fails PRs early — no compile\ncost added.\n\nScope: Part A of the #671 remediation (additive-only, no existing\nartifact touched). Part B — deleting the 7 stale ~800 MB assets on\nv0.4.x/v0.7-0.9 releases — is destructive, public-facing, and requires\nmaintainer sign-off; it is filed separately per the triage AC.\n\nTrace: skip\nRefs: #671\n\nCo-authored-by: Claude <noreply@anthropic.com>",
          "timestamp": "2026-07-11T09:49:33+02:00",
          "tree_id": "69af9242ea2ea5adc413fa205d4ed1abd457730d",
          "url": "https://github.com/pulseengine/rivet/commit/f3c0e939d9675ce7b3bac486499cd02edba332cd"
        },
        "date": 1783761303945,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85124,
            "range": "± 713",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 889834,
            "range": "± 16506",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12136780,
            "range": "± 298062",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2157,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25287,
            "range": "± 74",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 379997,
            "range": "± 1969",
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
            "value": 1513348,
            "range": "± 11947",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 159991,
            "range": "± 695",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1881609,
            "range": "± 44084",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 23467162,
            "range": "± 397068",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 482934,
            "range": "± 2442",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 15536907,
            "range": "± 382728",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1270367444,
            "range": "± 25417915",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4388,
            "range": "± 15",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 61877,
            "range": "± 202",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 773335,
            "range": "± 3576",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 60537,
            "range": "± 229",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 703252,
            "range": "± 3627",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8454617,
            "range": "± 760072",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1092,
            "range": "± 14",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14643,
            "range": "± 136",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 344767,
            "range": "± 3299",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22756,
            "range": "± 139",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 160364,
            "range": "± 10515",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1501851,
            "range": "± 10174",
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
          "id": "9d105e14ba9dfaa1667e499afa0011eee754dc4e",
          "message": "plan(v0.26): triage serve-filtering (#674) + release-vs-variant (#673); mark REQ-251 done (#686)\n\nTriages the two actionable open feature requests into v0.26 as proposed\nrequirements (the plan lives in rivet, not just the issue tracker):\n\n- REQ-253 (#674): richer serve filtering — reuse the existing s-expr filter\n  and/or the gluesql `rivet sql` facade rather than a serve-only filter\n  language.\n- REQ-254 (#673): check a release against variant scope — design-first\n  (needs a DD on release ∩ variant semantics before implementation).\n\nAlso corrects REQ-251 (serializer field-drop guard): proposed → implemented,\nrelease v0.25.0 — the compile-time exhaustiveness guard shipped as #634.\n\nConfirmed with `rivet validate` (Result: PASS) and `rivet docs check`\n(0 violations).\n\nRefs: REQ-253, REQ-254, REQ-251, FEAT-001",
          "timestamp": "2026-07-11T12:01:13+02:00",
          "tree_id": "c2cbea97f8c2800de530564600b8f41bf8b47c5a",
          "url": "https://github.com/pulseengine/rivet/commit/9d105e14ba9dfaa1667e499afa0011eee754dc4e"
        },
        "date": 1783770296116,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85360,
            "range": "± 662",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 922739,
            "range": "± 4056",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14191488,
            "range": "± 866352",
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
            "value": 25044,
            "range": "± 55",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 363730,
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
            "value": 1510410,
            "range": "± 20676",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 170733,
            "range": "± 618",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1969451,
            "range": "± 22067",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 32398740,
            "range": "± 1374232",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 457398,
            "range": "± 1090",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 15964208,
            "range": "± 146177",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1164372640,
            "range": "± 17244030",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4263,
            "range": "± 14",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 44490,
            "range": "± 493",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 750364,
            "range": "± 3689",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 59245,
            "range": "± 246",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 716705,
            "range": "± 3138",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8635720,
            "range": "± 344258",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1094,
            "range": "± 56",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14616,
            "range": "± 53",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 227722,
            "range": "± 1607",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21760,
            "range": "± 349",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 148620,
            "range": "± 1428",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1395200,
            "range": "± 16875",
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
          "id": "66fd38f5466b8844f7edf5a6300bf35f83912688",
          "message": "ci(mutants): cap address space at 48 GiB so a runaway mutant can't OOM the host (#590) (#685)\n\n#590: kernel OOM logs show `rivet_core-<hash>` native test binaries hitting\n70-100 GB anon-rss on the shared lean-mem runners, tripping the SYSTEM-WIDE\nOOM-killer and taking down neighboring jobs. The generators in rivet-core's\ntest suite are all tightly bounded (1..10, 0..1000, 1..50) — no real test\nallocates that much. The source is cargo-mutants: a mutation can delete an\nallocation bound and produce a test binary that allocates ~100 G in seconds,\nfaster than the 30 s per-mutant timeout, so the OOM-killer fires first.\n\nAdd `ulimit -v 50331648` (48 GiB RLIMIT_AS) before both `cargo mutants`\ninvocations (mutants-core matrix + mutants-cli gate) so a runaway mutant\naborts with ENOMEM inside its own process instead of OOM-killing the box.\nThe existing `|| true` already treats a clipped mutant as timeout/error, not\na gate failure, so mutation coverage is unaffected. Defense-in-depth alongside\nthe infra-side cgroup MemoryMax.\n\nSupersedes the stale PR #599 (same idea, but its branch predates the\nmutation-matrix-to-nightly + paths-filter ci.yml changes and would revert them).\n\nFixes #590\nTrace: skip",
          "timestamp": "2026-07-11T13:07:50+02:00",
          "tree_id": "594b6b35956ea43b29eb3471532cc0c4b634db54",
          "url": "https://github.com/pulseengine/rivet/commit/66fd38f5466b8844f7edf5a6300bf35f83912688"
        },
        "date": 1783770971262,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85926,
            "range": "± 1235",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 897139,
            "range": "± 16311",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13427136,
            "range": "± 885303",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2245,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26402,
            "range": "± 131",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 389304,
            "range": "± 2515",
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
            "range": "± 4",
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
            "value": 1514848,
            "range": "± 17518",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 160252,
            "range": "± 441",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1892951,
            "range": "± 7836",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 26959775,
            "range": "± 1724943",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 460720,
            "range": "± 1967",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 15411635,
            "range": "± 223684",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1282978206,
            "range": "± 10913354",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4334,
            "range": "± 42",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60619,
            "range": "± 867",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 792610,
            "range": "± 7171",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 62053,
            "range": "± 842",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 701417,
            "range": "± 2509",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7720202,
            "range": "± 533980",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1161,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15418,
            "range": "± 61",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 339636,
            "range": "± 1112",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22906,
            "range": "± 184",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 159827,
            "range": "± 1043",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1485045,
            "range": "± 22474",
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
          "id": "fa2fd062aa9dc4d12099aa9e77f6374278df290c",
          "message": "feat(serve): richer artifact filtering — tag + s-expression predicates (REQ-253, #674) (#688)\n\nThe serve dashboard's /artifacts view only supported basic type/status/text\nfiltering. Surface the richer query surface rivet already has, reusing the\nexisting evaluator rather than inventing a serve-only filter language:\n\n- `tags=` — comma-separated; an artifact matches when it carries ALL listed\n  tags (previously a ViewParams field that was never applied in the list view).\n- `filter=` — a full s-expression predicate (same language as the JSON API's\n  `filter=` and `rivet list --filter`), e.g. `(has-tag \"safety\")`,\n  `(= status \"approved\")`, `(and (= type \"requirement\") (has-tag \"stpa\"))`.\n  Parsed once via rivet_core::sexpr_eval::parse_filter and applied per artifact\n  with matches_filter_with_store, so it composes with the active variant scope\n  (ctx.store/graph are already variant-scoped). An unparseable filter narrows\n  to nothing and renders an inline error rather than silently passing.\n\nA filter text input is added to the artifacts toolbar (htmx, same debounce\npattern as the search box), and both `tags` and `filter` are threaded through\nViewParams::to_query_string so they survive the type/status/sort/pagination\ncontrols (same preservation as ?variant=).\n\nConfirmed with two new serve_integration tests\n(artifacts_html_sexpr_filter_narrows_results, artifacts_html_tags_param_narrows_results,\nboth pass), a full build, and `cargo clippy --all-targets` on the CI toolchain\n(Rust 1.97) clean.\n\nImplements: REQ-253\nRefs: FEAT-001",
          "timestamp": "2026-07-11T17:03:05+02:00",
          "tree_id": "260c3a300ede0179fad8db5b444edb27e4186f77",
          "url": "https://github.com/pulseengine/rivet/commit/fa2fd062aa9dc4d12099aa9e77f6374278df290c"
        },
        "date": 1783783273868,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85431,
            "range": "± 1444",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 890033,
            "range": "± 17226",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14897710,
            "range": "± 1377314",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2182,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26603,
            "range": "± 127",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 367386,
            "range": "± 1719",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 95,
            "range": "± 2",
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
            "value": 1520557,
            "range": "± 20627",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 161655,
            "range": "± 2635",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1899988,
            "range": "± 38114",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 26554380,
            "range": "± 644949",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 469293,
            "range": "± 2683",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 15323613,
            "range": "± 144103",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1278532336,
            "range": "± 16622591",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4299,
            "range": "± 75",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 62092,
            "range": "± 760",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 781347,
            "range": "± 11160",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 58972,
            "range": "± 1643",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 698726,
            "range": "± 7547",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7824429,
            "range": "± 221035",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1126,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15385,
            "range": "± 268",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 331275,
            "range": "± 3561",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22767,
            "range": "± 2714",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 157710,
            "range": "± 2871",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1484654,
            "range": "± 20882",
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
          "id": "7ae35445c295fb24fb4d6ede9860d9cb9f431b9f",
          "message": "feat(release): `rivet release check --variant` — release ∩ variant consistency + scoped cuttability (REQ-254, DD-075, #673) (#689)\n\nrivet had releases (the `release:` field) and variants (feature-model\ncomposition) but no way to check how they intersect. Adds\n`rivet release check <version> --variant <name>` reporting both facets in one\nview (DD-075):\n\n- Consistency: partitions release-tagged artifacts against the variant's\n  resolved artifact-id set — in-scope (release ∩ variant), out-of-scope\n  (tagged for the release but excluded by the variant — the primary\n  inconsistency), and variant-only (bound by the variant, not yet tagged).\n- Cuttability: runs the existing release-readiness predicate scoped to the\n  in-scope intersection; an empty intersection is not cuttable (#628 rule).\n  Exit non-zero when not cuttable, or (under --strict) when any artifact is\n  out-of-scope. text + json output.\n\nThe readiness predicate (verified/accepted + release.ready-when + coverage\nV-closure) is refactored out of cmd_release_status into a shared ReadinessCtx\nthat both commands call, so the two can't drift; cmd_release_status behavior is\nunchanged. Variant→artifact-id resolution reuses the existing CLI feature-model\nsolve + bound-ids path (not the serve-only build_variant_scope).\n\nConfirmed with a new cli_commands test\n(release_check_partitions_release_against_variant), the existing 8 release\ntests still passing (no refactor regression), a full build, `cargo clippy\n--all-targets` on the CI toolchain (Rust 1.97) clean, and `rivet validate` PASS.\n\nImplements: REQ-254\nRefs: DD-075, FEAT-001",
          "timestamp": "2026-07-11T18:12:08+02:00",
          "tree_id": "c5699f8029c5193cc68744a7ac9c2c2e6f0090e7",
          "url": "https://github.com/pulseengine/rivet/commit/7ae35445c295fb24fb4d6ede9860d9cb9f431b9f"
        },
        "date": 1783788352173,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 86425,
            "range": "± 893",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 897535,
            "range": "± 18365",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13027937,
            "range": "± 228221",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2178,
            "range": "± 15",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 27469,
            "range": "± 177",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 352198,
            "range": "± 1982",
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
            "value": 1508842,
            "range": "± 46348",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 161496,
            "range": "± 632",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1900626,
            "range": "± 18338",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 24348960,
            "range": "± 783924",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 474388,
            "range": "± 1948",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 15560458,
            "range": "± 77872",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1281359957,
            "range": "± 11685992",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4342,
            "range": "± 158",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 58911,
            "range": "± 159",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 753428,
            "range": "± 2000",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 61475,
            "range": "± 225",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 700472,
            "range": "± 3680",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7901690,
            "range": "± 110530",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1287,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14887,
            "range": "± 112",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 328192,
            "range": "± 2313",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23721,
            "range": "± 228",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 167420,
            "range": "± 671",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1495686,
            "range": "± 19745",
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
          "id": "c3f45f28a156e4ad3363f08301c05554bf665603",
          "message": "Merge pull request #692 from pulseengine/release/v0.26.0\n\nchore(release): v0.26.0",
          "timestamp": "2026-07-11T19:34:40+02:00",
          "tree_id": "3d9688bbc73f7af98dfef1892a7f57fbb052bcbb",
          "url": "https://github.com/pulseengine/rivet/commit/c3f45f28a156e4ad3363f08301c05554bf665603"
        },
        "date": 1783791993808,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85247,
            "range": "± 1861",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 899444,
            "range": "± 7055",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14102199,
            "range": "± 539978",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2250,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 27130,
            "range": "± 221",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 383479,
            "range": "± 1242",
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
            "value": 1524326,
            "range": "± 30457",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 165343,
            "range": "± 1773",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1917937,
            "range": "± 7411",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 29490528,
            "range": "± 638866",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 463750,
            "range": "± 1856",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 15446357,
            "range": "± 73254",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1248640970,
            "range": "± 13823531",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4458,
            "range": "± 24",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 61244,
            "range": "± 208",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 786813,
            "range": "± 1309",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 59196,
            "range": "± 193",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 681136,
            "range": "± 2119",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7594684,
            "range": "± 68066",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1126,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14777,
            "range": "± 171",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 333406,
            "range": "± 4736",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23812,
            "range": "± 112",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 165992,
            "range": "± 1369",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1530051,
            "range": "± 15072",
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
          "id": "790e4c6d4d81e9f6ee2536c482c6a77ea792a97a",
          "message": "fix(modify): quote --set-field values so a colon-space no longer corrupts the file (#687) (#691)\n\n`rivet modify --set-field key=value` used to write the value RAW under a\nblock-style `fields:` sub-map — every sibling setter (`--set-title`,\n`--set-status`, `--set-release`, `--set-description`) already routes\nthrough `yaml_quote_inline_scalar`, but the `set_fields` loop skipped it.\nA value containing `: ` (or any other plain-scalar indicator — `#`,\nleading `-`/`?`/`[`/`{`, YAML booleans, …) then produced invalid YAML:\n\n    rationale: CURVE-AGILE: Ed25519 preferred, ECDSA-P256 fallback ...\n\nThe second `: ` reads as a mapping value → parse error on the whole\nsource file → rivet WARN-and-skips the file → every artifact in it\nsilently vanishes from the loaded store. Same data-loss shape as\n#573/#613/#618 (invalid YAML from a mutation drops the file), just via\nthe one setter that never got the quoting treatment.\n\nFix: route each `set_fields` value through the existing\n`yaml_quote_inline_scalar` helper before formatting. Applied at all three\nblock-style write sites (replace-existing sub-key, insert new sub-key,\ncreate new `fields:` section). The flow-style branch already went through\n`serde_yaml`, which quotes correctly — left alone.\n\nConfirmed end-to-end: `rivet modify DD-1 --set-field\n'rationale=CURVE-AGILE: Ed25519 preferred'` now writes\n`rationale: \"CURVE-AGILE: Ed25519 preferred\"`, the file stays parseable,\nboth artifacts round-trip through `rivet get`, and the hostile value\nsurvives verbatim. Three regression tests cover the insert branch, the\ncreate-fields-section branch, and the replace-existing branch.\n\nFixes: REQ-034\nVerifies: REQ-034\n\nCo-authored-by: Claude <noreply@anthropic.com>",
          "timestamp": "2026-07-14T20:13:04+02:00",
          "tree_id": "835667c88bfd546bf8c59e0ffe47dac1a62df0e4",
          "url": "https://github.com/pulseengine/rivet/commit/790e4c6d4d81e9f6ee2536c482c6a77ea792a97a"
        },
        "date": 1784054645223,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 87381,
            "range": "± 1610",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 930016,
            "range": "± 5767",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 15197762,
            "range": "± 480518",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1973,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25029,
            "range": "± 103",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 374659,
            "range": "± 6643",
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
            "value": 96,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1546750,
            "range": "± 21862",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 175480,
            "range": "± 3080",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 2040903,
            "range": "± 12250",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 34809678,
            "range": "± 1999777",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 455018,
            "range": "± 6964",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 15335493,
            "range": "± 280739",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1090874986,
            "range": "± 22045988",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4196,
            "range": "± 68",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 45841,
            "range": "± 200",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 805987,
            "range": "± 10388",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 58684,
            "range": "± 939",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 735661,
            "range": "± 10507",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8413385,
            "range": "± 162648",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1205,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 13883,
            "range": "± 360",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 224861,
            "range": "± 1736",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22013,
            "range": "± 577",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 155025,
            "range": "± 1128",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1455507,
            "range": "± 127291",
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
          "id": "6751cc8b4b2c361e7880372f62cf1801ade58e71",
          "message": "plan: REQ-255 — ingest ordeal certificates as re-checkable evidence (rivet#693, ordeal#67) (#694)\n\nFiles the rivet-side requirement for the FEAT-011 certificate-as-evidence\nspine: (1) an `ordeal-certificate` evidence artifact type rivet validate can\ntreat as a verification link, and (2) a `--certify` hook on\n`rivet release check --variant` / `variant solve`. Blocked-by ordeal#67 (SAT\nfront-end + certificate serialization); part (1) schema is co-designable now.\nThe uncertified baseline shipped as REQ-254 in v0.26.0.\n\nRefs: REQ-255, REQ-254, FEAT-001",
          "timestamp": "2026-07-14T20:18:39+02:00",
          "tree_id": "e63c46f54f83b2064c3d4f68a702481b9109aebf",
          "url": "https://github.com/pulseengine/rivet/commit/6751cc8b4b2c361e7880372f62cf1801ade58e71"
        },
        "date": 1784055201833,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 86308,
            "range": "± 644",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 927391,
            "range": "± 6190",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 16634868,
            "range": "± 1239043",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1995,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25216,
            "range": "± 71",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 357202,
            "range": "± 2406",
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
            "value": 1534048,
            "range": "± 12209",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 167709,
            "range": "± 946",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1995246,
            "range": "± 13733",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 48295936,
            "range": "± 2868223",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 460307,
            "range": "± 4231",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 15436391,
            "range": "± 205034",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1082505618,
            "range": "± 14009260",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4217,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 45921,
            "range": "± 150",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 815966,
            "range": "± 4063",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 61338,
            "range": "± 349",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 726140,
            "range": "± 2790",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 9328559,
            "range": "± 593233",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1245,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15155,
            "range": "± 40",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 260606,
            "range": "± 2509",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22229,
            "range": "± 85",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 158211,
            "range": "± 838",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1450552,
            "range": "± 12205",
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
          "id": "abcf1f6fe094d8bc50d3622af4db66329e2a9e7c",
          "message": "plan(variant): file 4-persona review findings as DD-076 + REQ-257..266 (#701)\n\nA four-persona honest review (writer / traceability-auditor / code-reviewer /\nintegrator) of variant/feature-model handling. Headline: there is NO\n`documentation` field — the confusion is \"attribute\" doing triple duty\n(attribute-schema type-decls vs per-feature attributes values vs a design-doc\nphantom), undocumented in the canonical reference.\n\nDD-076 governs the remediation (fail-loud over silent-pass). Requirements:\n- P0 correctness (v0.27): REQ-257 eval_constraint blanket-pass; REQ-258\n  dangling binding artifact ids + committed-broken full-desktop.yaml; REQ-259\n  feature-name resolution / vacuous satisfaction.\n- P1 silent-drops (v0.28): REQ-260 discover .ok(); REQ-261 attribute_warnings;\n  REQ-262 serve wrapped-variant blindness (#514 regression); REQ-263 CI gate.\n- P2 docs (v0.27): REQ-264 canonical attributes documentation.\n- P3 source linkage (v0.28): REQ-265. P4 solver proptests (v0.28): REQ-266.\n\nPer the maintainer: file all (this), then implement P0 + P2 first.\nConfirmed with `rivet validate` (PASS) and `rivet docs check` (0 violations).\n\nRefs: DD-076, REQ-257, REQ-258, REQ-259, REQ-264, FEAT-001",
          "timestamp": "2026-07-15T07:05:30+02:00",
          "tree_id": "d6265c6b9ac3a060b9fb364a8c078f8076442ecd",
          "url": "https://github.com/pulseengine/rivet/commit/abcf1f6fe094d8bc50d3622af4db66329e2a9e7c"
        },
        "date": 1784092409922,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 69079,
            "range": "± 2124",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 825120,
            "range": "± 14206",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 10659769,
            "range": "± 317127",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1317,
            "range": "± 17",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 16180,
            "range": "± 383",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 363443,
            "range": "± 2512",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 66,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/1000",
            "value": 69,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 69,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1214626,
            "range": "± 48152",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 141978,
            "range": "± 3371",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1659120,
            "range": "± 35768",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 24276024,
            "range": "± 412168",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 373247,
            "range": "± 12511",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 12073456,
            "range": "± 320766",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 830901321,
            "range": "± 17179672",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3364,
            "range": "± 131",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 39794,
            "range": "± 1248",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 805422,
            "range": "± 11825",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 49089,
            "range": "± 1907",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 519892,
            "range": "± 19072",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 6709710,
            "range": "± 138918",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 773,
            "range": "± 30",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 11038,
            "range": "± 397",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 288725,
            "range": "± 7289",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 19298,
            "range": "± 510",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 139057,
            "range": "± 5085",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1237178,
            "range": "± 49496",
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
          "id": "04810cd9dc277d808a2ea7f7774f92e88cee0064",
          "message": "feat(lsp): enum-value + base-key completion (REQ-256, slice 2, #546) (#700)\n\nAdds the two highest-value remaining LSP completions to lsp_schema_completions,\nafter slice 1 (REQ-246: type / link-type / field-name):\n\n- Enum-value completion: on a `<field>: ` line whose schema FieldDef carries\n  `allowed_values`, complete those values (kind ENUM_MEMBER). The canonical\n  case — `status: ` — completes the status enum (draft/proposed/approved/…)\n  sourced from `schema.base_fields` (never hardcoded), with the type's own\n  fields taking precedence over base fields.\n- Base-key completion: at the artifact top level (not inside fields:/links:),\n  complete the base keys id/type/title/description/status/tags/links/fields\n  with `insert_text: \"<key>: \"`.\n\nReduces YAML authoring friction via the language server rather than a bespoke\neditor UI (the DD-071 direction).\n\nConfirmed with 3 new lsp_completion_context_tests\n(status enum values, base keys, slice-1 regression) + the full 42-test lsp\nsuite passing, a build, and `cargo clippy --all-targets` on the CI toolchain\n(Rust 1.97) clean.\n\nImplements: REQ-256\nRefs: DD-071, FEAT-001",
          "timestamp": "2026-07-15T07:51:07+02:00",
          "tree_id": "a27d0249ae6f6aa1a96d673c181be4b00f9e4239",
          "url": "https://github.com/pulseengine/rivet/commit/04810cd9dc277d808a2ea7f7774f92e88cee0064"
        },
        "date": 1784097695981,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 73160,
            "range": "± 3224",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 866256,
            "range": "± 22999",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 11154718,
            "range": "± 466771",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1383,
            "range": "± 48",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 16713,
            "range": "± 692",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 274081,
            "range": "± 5684",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 66,
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
            "value": 1267993,
            "range": "± 62310",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 147316,
            "range": "± 5006",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1668438,
            "range": "± 41525",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 24326447,
            "range": "± 786590",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 376491,
            "range": "± 23438",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 12224692,
            "range": "± 326859",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 835458500,
            "range": "± 16603598",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3370,
            "range": "± 174",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 34961,
            "range": "± 1058",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 781201,
            "range": "± 10933",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 49615,
            "range": "± 3091",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 518193,
            "range": "± 21988",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 6341125,
            "range": "± 175095",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 817,
            "range": "± 55",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 10280,
            "range": "± 490",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 274065,
            "range": "± 9117",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 19212,
            "range": "± 632",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 134175,
            "range": "± 4481",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1256742,
            "range": "± 67542",
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
          "id": "6a89ad474570423eda27312736d27346f5c7f05a",
          "message": "docs(variant): canonical feature-model attributes documentation (REQ-264, DD-076, #546) (#703)\n\nDisambiguates the \"attribute\" overload that confused contributors (per the\n4-persona review, DD-076):\n- feature-model-schema.md gains a canonical \"Feature attributes\" section: no\n  `documentation` field exists (Feature = name/group/children/parent/attributes,\n  feature_model.rs:113-129); a table separating top-level `attribute-schema:`\n  (type declarations) from per-feature `attributes:` (values); `required:` +\n  accepted type kinds/synonyms; the \"typed only when a schema is declared, else\n  free-form\" rule; and one worked example threading schema+attrs+variant+bindings.\n- design/variant-aware-properties.md + pure-variants-comparison.md: banner\n  marking them design/comparison notes (not the reference); `attribute-schema:`\n  relabelled SHIPPED (was framed as an unbuilt Gap/Remediation); the phantom\n  variant-config `attributes:` marked NOT IMPLEMENTED; stale file:line cites\n  corrected or softened to function refs. (Also corrected: `fields-per-variant:`\n  is actually SHIPPED, #255 — not a never-built proposal.)\n- getting-started.md: the misleading \"typed key/value metadata\" line corrected\n  to free-form-unless-schema.\n\nConfirmed with `rivet docs check` (0 violations) and `rivet validate` (PASS).\n\nRefs: REQ-264, DD-076, FEAT-001",
          "timestamp": "2026-07-15T09:23:16+02:00",
          "tree_id": "2dd39270618e494b9c5390768792b3bf429ed1d8",
          "url": "https://github.com/pulseengine/rivet/commit/6a89ad474570423eda27312736d27346f5c7f05a"
        },
        "date": 1784101932131,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 86202,
            "range": "± 1529",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 897788,
            "range": "± 7563",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 17512023,
            "range": "± 1063503",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2224,
            "range": "± 63",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 27711,
            "range": "± 625",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 353413,
            "range": "± 5188",
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
            "range": "± 7",
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
            "value": 1536867,
            "range": "± 26591",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 165604,
            "range": "± 1719",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1933603,
            "range": "± 54539",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 37062961,
            "range": "± 3036081",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 471165,
            "range": "± 4133",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 16095089,
            "range": "± 249335",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1209136578,
            "range": "± 14255561",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4373,
            "range": "± 182",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 66996,
            "range": "± 1065",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 799501,
            "range": "± 5032",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 62014,
            "range": "± 352",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 701149,
            "range": "± 13310",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 11973247,
            "range": "± 349609",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1158,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15022,
            "range": "± 174",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 319090,
            "range": "± 4807",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23281,
            "range": "± 179",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 164066,
            "range": "± 4890",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1535095,
            "range": "± 24059",
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
          "id": "fc253d86bdb9cbfcee3b437e24cca37d0136c69d",
          "message": "fix(variant): constraints fail loud instead of silently passing (REQ-257, DD-076) (#702)\n\nfeature_model.rs eval_constraint returned `true` for every expression shape it\ndid not implement (the `_ => true` fallthrough), so a constraint using a richer\npredicate the preprocessor accepts — e.g. `(> asil-numeric 2)` — parsed cleanly\nand was SILENTLY SATISFIED without evaluation. For a safety-configuration tool\nthat is the worst failure mode (per DD-076: fail-loud over silent-pass).\n\nAdds `constraint_evaluatable(expr)` which walks the tree and rejects any node\noutside the evaluatable set (feature-name leaves + and/or/not/implies/excludes/\nboollit). solve() calls it per constraint before evaluation and, on an\nunevaluatable shape, pushes a new `SolveError::UnevaluatableConstraint` naming\nthe constraint and the offending node, instead of reaching the silent pass.\neval_constraint's boolean semantics are unchanged; its `_ => true` is retained\nfor the `when:`-predicate path but is now unreachable for solve's constraints.\n\nThe repo's real feature-model constraints only use implies/and/or over feature\nnames, so no existing data regresses (regression test asserts the\nexamples/variant model still solves).\n\nConfirmed with new rivet-core tests (unevaluatable_attribute_constraint_fails_loud,\nexample_variant_implies_and_or_constraints_still_solve,\nexcludes_and_not_constraints_still_evaluate; 60 passed), a build, `cargo clippy\n--all-targets` on the CI toolchain (Rust 1.97) clean, and `rivet validate` PASS.\n\nImplements: REQ-257\nRefs: DD-076, FEAT-001",
          "timestamp": "2026-07-15T09:23:39+02:00",
          "tree_id": "74e1a4d761a0d6a9b586d78bdfc964a5d6b0fb75",
          "url": "https://github.com/pulseengine/rivet/commit/fc253d86bdb9cbfcee3b437e24cca37d0136c69d"
        },
        "date": 1784102392427,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 57289,
            "range": "± 4286",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 781251,
            "range": "± 53329",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 9268688,
            "range": "± 81138",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1146,
            "range": "± 10",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 13531,
            "range": "± 30",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 270904,
            "range": "± 20732",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 51,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/1000",
            "value": 51,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 51,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 980821,
            "range": "± 17315",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 113665,
            "range": "± 255",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1414577,
            "range": "± 7264",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 22669535,
            "range": "± 743753",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 291689,
            "range": "± 25314",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 10289439,
            "range": "± 57040",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 688292246,
            "range": "± 33752990",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 2634,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 29606,
            "range": "± 38",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 786731,
            "range": "± 31238",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 45032,
            "range": "± 3370",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 426478,
            "range": "± 27302",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 5568831,
            "range": "± 189808",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 503,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 8085,
            "range": "± 350",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 234751,
            "range": "± 1895",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 14991,
            "range": "± 878",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 104617,
            "range": "± 686",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 952913,
            "range": "± 41940",
            "unit": "ns/iter"
          }
        ]
      }
    ]
  }
}