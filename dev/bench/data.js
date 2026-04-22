window.BENCHMARK_DATA = {
  "lastUpdate": 1776837019632,
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
          "id": "87158f8a944efbc2587e3e4d4d5732a37c2b2236",
          "message": "fix(test): Playwright E2E count comparison\n\nTrace: skip\n\nCo-authored-by: Claude Opus 4.6 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-04-12T23:15:20-05:00",
          "tree_id": "e4a09af7cefa35c0f8f34026ec8b96aff2465646",
          "url": "https://github.com/pulseengine/rivet/commit/87158f8a944efbc2587e3e4d4d5732a37c2b2236"
        },
        "date": 1776054107951,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 81710,
            "range": "± 861",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 851429,
            "range": "± 5328",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12881874,
            "range": "± 1733660",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2196,
            "range": "± 45",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 27268,
            "range": "± 392",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 358481,
            "range": "± 1637",
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
            "value": 1022364,
            "range": "± 20832",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 166780,
            "range": "± 3924",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1919135,
            "range": "± 30734",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 40478241,
            "range": "± 2971568",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 108991,
            "range": "± 1626",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 927117,
            "range": "± 9873",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 15968200,
            "range": "± 1074478",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4376,
            "range": "± 24",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 61947,
            "range": "± 839",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 787158,
            "range": "± 2948",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 60090,
            "range": "± 749",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 679896,
            "range": "± 10311",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 9215730,
            "range": "± 624849",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 812,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7772,
            "range": "± 41",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 109569,
            "range": "± 1155",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23275,
            "range": "± 351",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 164126,
            "range": "± 1735",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1514733,
            "range": "± 32399",
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
          "id": "f2da791b734dd8596de3e04f0f20654a6fb03cb4",
          "message": "feat(export): Zola docs export with resolved wiki-links\n\nZola export now includes content/<prefix>/docs/*.md alongside artifacts.\nDocuments loaded from rivet's docs/ directory get TOML frontmatter and\n[[ID]] wiki-links resolved to Zola internal links pointing at artifact pages.\n\nImplements: REQ-007, REQ-035\n\nCo-authored-by: Claude Opus 4.6 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-04-13T06:45:51-05:00",
          "tree_id": "de67909dd4e9c5700472124eae37ac3ac040b2c9",
          "url": "https://github.com/pulseengine/rivet/commit/f2da791b734dd8596de3e04f0f20654a6fb03cb4"
        },
        "date": 1776084546915,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 82111,
            "range": "± 319",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 876523,
            "range": "± 5826",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12270816,
            "range": "± 737434",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2141,
            "range": "± 11",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25490,
            "range": "± 62",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 364982,
            "range": "± 2647",
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
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1019532,
            "range": "± 36937",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 160063,
            "range": "± 4374",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1874757,
            "range": "± 18814",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 23099583,
            "range": "± 900366",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 111160,
            "range": "± 2117",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 908763,
            "range": "± 3873",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 9303637,
            "range": "± 273559",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4386,
            "range": "± 13",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 61218,
            "range": "± 203",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 772172,
            "range": "± 3364",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 58713,
            "range": "± 727",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 671320,
            "range": "± 4369",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7516994,
            "range": "± 260940",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 820,
            "range": "± 71",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7647,
            "range": "± 104",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 125559,
            "range": "± 1038",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22966,
            "range": "± 183",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 162864,
            "range": "± 1200",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1513966,
            "range": "± 10659",
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
          "id": "9db1988230e59f87b2e64ed81ab57de83b103042",
          "message": "fix(export): Zola TOML escaping, title fallback, date, mermaid\n\n- Use TOML triple-quoted strings for descriptions (handles newlines)\n- Fallback to first non-empty description line when title is empty\n- Merge artifact type and status into tags taxonomy (no custom taxonomies)\n- Add date field to frontmatter (from provenance timestamp)\n- Include diagram fields as Mermaid code blocks\n- Include rationale fields in design decision pages\n\nImplements: REQ-007\n\nCo-authored-by: Claude Opus 4.6 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-04-13T06:45:54-05:00",
          "tree_id": "a6f806c18a074c9eff2f3f8bca6095ae40933fd1",
          "url": "https://github.com/pulseengine/rivet/commit/9db1988230e59f87b2e64ed81ab57de83b103042"
        },
        "date": 1776084649815,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 80620,
            "range": "± 1001",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 859702,
            "range": "± 2826",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 11389034,
            "range": "± 602574",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2141,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25404,
            "range": "± 193",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 374176,
            "range": "± 4848",
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
            "value": 99,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1021750,
            "range": "± 22138",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 161274,
            "range": "± 994",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1878400,
            "range": "± 12044",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 23949147,
            "range": "± 1257918",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 109889,
            "range": "± 727",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 918952,
            "range": "± 3329",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 9499124,
            "range": "± 486995",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4356,
            "range": "± 15",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 61773,
            "range": "± 213",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 773261,
            "range": "± 11471",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 60955,
            "range": "± 233",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 659666,
            "range": "± 5079",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7273045,
            "range": "± 134114",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 835,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7727,
            "range": "± 53",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 111959,
            "range": "± 1208",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23084,
            "range": "± 115",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 163152,
            "range": "± 2094",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1512125,
            "range": "± 16771",
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
          "id": "5a590dc5b8f29f50922ddbc347e7ff065f05987f",
          "message": "feat(cli): variant subcommand — check, list, solve with bindings\n\nNew CLI commands for product line variant management:\n  rivet variant list --model feature-model.yaml\n  rivet variant check --model feature-model.yaml --variant eu-adas-c.yaml\n  rivet variant solve --model fm.yaml --variant v.yaml --binding bindings.yaml\n\nFeatures:\n- Feature tree visualization with group labels\n- Constraint propagation with feature name preprocessing\n- Binding resolution showing bound artifact IDs\n- Project scope validation (which bound artifacts exist)\n- JSON output format for all commands\n- Example files in examples/variant/\n\nImplements: REQ-042, REQ-043, REQ-044, REQ-046\nRefs: FEAT-110, FEAT-111, FEAT-112, FEAT-113\n\nCo-authored-by: Claude Opus 4.6 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-04-13T13:05:12-05:00",
          "tree_id": "66c6e93ee646f71ae062d8721a9e83d7bc212755",
          "url": "https://github.com/pulseengine/rivet/commit/5a590dc5b8f29f50922ddbc347e7ff065f05987f"
        },
        "date": 1776103885391,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 81333,
            "range": "± 3130",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 859229,
            "range": "± 7312",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13017368,
            "range": "± 893132",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2169,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26174,
            "range": "± 192",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 366824,
            "range": "± 1904",
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
            "value": 1011591,
            "range": "± 26364",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 166608,
            "range": "± 4512",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1888846,
            "range": "± 11999",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 28046623,
            "range": "± 3260254",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 109053,
            "range": "± 601",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 899543,
            "range": "± 5613",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 11047447,
            "range": "± 1035202",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4346,
            "range": "± 26",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 61953,
            "range": "± 287",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 763383,
            "range": "± 4507",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 59288,
            "range": "± 1592",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 663294,
            "range": "± 3099",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7723718,
            "range": "± 460016",
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
            "value": 7799,
            "range": "± 32",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 111860,
            "range": "± 1872",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22952,
            "range": "± 157",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 161213,
            "range": "± 1218",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1488831,
            "range": "± 24341",
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
          "id": "80d9e66e28a478a62e25b53230ed72158612b7f4",
          "message": "test(mcp): integration tests for query, modify, link, unlink, remove\n\nVerifies: REQ-007\n\nCo-authored-by: Claude Opus 4.6 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-04-13T13:05:16-05:00",
          "tree_id": "999d0796b1f4e57152c7333dedc3aa291f617d87",
          "url": "https://github.com/pulseengine/rivet/commit/80d9e66e28a478a62e25b53230ed72158612b7f4"
        },
        "date": 1776103893963,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 81749,
            "range": "± 20279",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 869325,
            "range": "± 5500",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13543137,
            "range": "± 734560",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2113,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25603,
            "range": "± 321",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 379059,
            "range": "± 2507",
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
            "value": 1019421,
            "range": "± 12852",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 166214,
            "range": "± 783",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1899250,
            "range": "± 29385",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 30398616,
            "range": "± 1469412",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 109051,
            "range": "± 594",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 904643,
            "range": "± 12004",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 12318391,
            "range": "± 805830",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4409,
            "range": "± 16",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60901,
            "range": "± 886",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 767849,
            "range": "± 6347",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 61221,
            "range": "± 227",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 682518,
            "range": "± 6426",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8421940,
            "range": "± 572168",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 844,
            "range": "± 31",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 8069,
            "range": "± 34",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 113476,
            "range": "± 666",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23407,
            "range": "± 82",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 161209,
            "range": "± 641",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1505030,
            "range": "± 16411",
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
          "id": "7588c3c2080739f4c82a02ce884b2b0b5375b1c2",
          "message": "feat: sphinx-needs JSON import adapter (migration path)\n\nAdd needs-json format support to the import-results CLI command,\nenabling sphinx-needs users to import their needs.json exports into\nrivet as generic YAML artifacts.\n\nThe core adapter (rivet-core/src/formats/needs_json.rs) was already\nimplemented with full support for type mapping, ID normalization\n(underscore to hyphen), configurable link types, tag/status\npreservation, and extra field forwarding. This commit wires it into\nthe CLI's import-results command so users can run:\n\n  rivet import-results --format needs-json needs.json --output artifacts/\n\nImplements: REQ-025\n\nCo-authored-by: Claude Opus 4.6 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-04-13T13:05:20-05:00",
          "tree_id": "f92385fd8b3a67018d10d249d96a8e84db4ebfe3",
          "url": "https://github.com/pulseengine/rivet/commit/7588c3c2080739f4c82a02ce884b2b0b5375b1c2"
        },
        "date": 1776103895471,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 80222,
            "range": "± 252",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 864971,
            "range": "± 3608",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12015669,
            "range": "± 777347",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2166,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25803,
            "range": "± 132",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 374132,
            "range": "± 1762",
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
            "value": 100,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 100,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1006708,
            "range": "± 24383",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 165524,
            "range": "± 566",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1882909,
            "range": "± 13221",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 25885542,
            "range": "± 1621608",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 107035,
            "range": "± 640",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 903894,
            "range": "± 16825",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 9578640,
            "range": "± 316048",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4358,
            "range": "± 26",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60243,
            "range": "± 347",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 774281,
            "range": "± 2198",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 58401,
            "range": "± 892",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 667165,
            "range": "± 2391",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7224219,
            "range": "± 189161",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 864,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7884,
            "range": "± 25",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 112805,
            "range": "± 739",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22879,
            "range": "± 83",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 161767,
            "range": "± 1646",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1506052,
            "range": "± 22246",
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
          "id": "0053fbb63d8048497759131b808d559c05593d13",
          "message": "fix: tool qualification — STPA, requirements, MCP audit, regex bounds, export --clean, import verification\n\n* fix: harden Zola export, hook paths, and filter store access\n\nFixes found during honest quality review:\n\n1. Zola export filter now uses matches_filter_with_store (quantifiers work)\n2. rivet init --hooks resolves binary via PATH (not hardcoded debug path)\n3. Zola export generates fallback taxonomy templates when missing\n   (zola build now works without a theme)\n4. Verified: needs-json import works end-to-end (import → validate → PASS)\n5. Verified: variant constraints handle (not feature), (and a b), (excludes a c)\n\nTested:\n- Clean Zola roundtrip: export → zola build → 53 pages, zero errors\n- needs-json: 3 artifacts imported, IDs normalized, validates clean\n- Variant: complex constraints with implies/excludes/and/not\n\nImplements: REQ-007\n\nCo-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>\n\n* feat(stpa): tool qualification STPA + STPA-Sec for v0.4.0 features\n\nSTPA analysis treating rivet as a qualification tool (ISO 26262 §11.4.7,\nTCL 1). Covers hazards introduced by s-expression evaluator, variant\nsolver, Zola export, needs-json import, MCP write tools, and git hooks.\n\nSafety (7 hazards, 7 constraints, 3 losses):\n- H-TQ-001: evaluator returns wrong boolean (→ false PASS)\n- H-TQ-002: variant solver unsound (accepts invalid config)\n- H-TQ-003: Zola export omits/stales artifacts\n- H-TQ-004: needs-json maps links incorrectly\n- H-TQ-005: MCP modifies without validation\n- H-TQ-006: git hooks bypassed\n- H-TQ-007: quantifier scope mismatch\n\nSecurity (5 losses, 3 hazards, 5 constraints):\n- SL-TQ-002: AI agent prompt injection via MCP (no auth/rate limit)\n- SL-TQ-004: --no-verify bypasses hooks (hooks are not security controls)\n- SSC-TQ-002: MCP mutations must produce tamper-evident audit log\n- SSC-TQ-005: CI must independently verify (hooks are convenience, not security)\n\nImplements: REQ-002\n\nCo-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>\n\n* feat: tool qualification requirements REQ-047..053\n\nSeven requirements addressing STPA tool qualification constraints:\n- REQ-047: MCP mutation audit logging (SSC-TQ-002)\n- REQ-048: Regex complexity bounds (SSC-TQ-001)\n- REQ-049: Export validation embedding + --clean (SC-TQ-003, SSC-TQ-004)\n- REQ-050: Import link-target verification (SC-TQ-004, SSC-TQ-003)\n- REQ-051: CI-enforced traceability, hooks are convenience only (SSC-TQ-005)\n- REQ-052: Variant solver fuzz testing (SC-TQ-002)\n- REQ-053: Quantifier scope correctness testing (SC-TQ-007)\n\nImplements: REQ-002\n\nCo-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>\n\n* feat: implement REQ-047 (MCP audit log), REQ-048 (regex bounds), REQ-053 (quantifier scope tests)\n\nThree tool qualification requirements implemented:\n\nREQ-047 — MCP audit logging:\n  Every mutation (modify, link, unlink, remove) writes a JSON log entry\n  to .rivet/mcp-audit.jsonl with timestamp, tool name, and details.\n  Enables forensic analysis of AI agent activity.\n\nREQ-048 — Regex complexity bounds:\n  The matches predicate uses RegexBuilder::size_limit(1MB) to prevent\n  ReDoS attacks via crafted filter expressions.\n\nREQ-053 — Quantifier scope correctness:\n  Three new tests verify forall/exists iterate the store parameter:\n  - forall_uses_store_parameter: different stores → different results\n  - exists_uses_store_parameter: adding artifact changes exists result\n  - quantifier_without_store_returns_false: safe default\n\nImplements: REQ-047, REQ-048, REQ-053\nVerifies: REQ-041\n\nCo-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>\n\n* feat: implement REQ-049 (export --clean + validation.json)\n\n- --clean flag removes content/<prefix>/ and data/<prefix>/ before writing,\n  preventing deleted artifacts from persisting as stale published pages\n- data/<prefix>/validation.json embeds PASS/FAIL, error/warning counts,\n  artifact count, and export date for consumers to verify freshness\n- Addresses TOCTOU between export and publication (SSC-TQ-004)\n\nImplements: REQ-049\n\nCo-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>\n\n* feat: implement REQ-050 (import link verification) + REQ-051 (hook security docs)\n\nREQ-050: needs-json import now verifies all link targets exist within\nthe imported artifact set. Unresolved targets produce warnings with\nartifact ID, link type, and target. Prevents crafted imports from\ncreating links to non-existent artifacts.\n\nREQ-051: CLAUDE.md documents that git hooks are convenience only,\nnot security controls. CI must independently enforce traceability.\n\nImplements: REQ-050, REQ-051\n\nCo-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>\n\n---------\n\nCo-authored-by: Claude Opus 4.6 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-04-13T17:39:24-05:00",
          "tree_id": "16f477a812be7fb9f4496e73c4830a70e0342f20",
          "url": "https://github.com/pulseengine/rivet/commit/0053fbb63d8048497759131b808d559c05593d13"
        },
        "date": 1776120329203,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 81310,
            "range": "± 905",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 856533,
            "range": "± 6972",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 11854510,
            "range": "± 631300",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2151,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25317,
            "range": "± 72",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 396051,
            "range": "± 3182",
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
            "value": 95,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1020153,
            "range": "± 30436",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 159637,
            "range": "± 945",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1869510,
            "range": "± 98745",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 23433408,
            "range": "± 1760401",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 107880,
            "range": "± 1086",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 895133,
            "range": "± 2878",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 9475055,
            "range": "± 408831",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4464,
            "range": "± 122",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 59301,
            "range": "± 195",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 760566,
            "range": "± 1420",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 58106,
            "range": "± 133",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 671280,
            "range": "± 1839",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7390110,
            "range": "± 153908",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 819,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7548,
            "range": "± 51",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 111659,
            "range": "± 781",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23617,
            "range": "± 77",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 164016,
            "range": "± 2288",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1506922,
            "range": "± 10776",
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
          "id": "7712ccc6ea7da257dbbb1dfc28e31c3ff9f0e50a",
          "message": "test: proptest fuzz testing for variant constraint solver (REQ-052)\n\nVerifies: REQ-052\n\nCo-authored-by: Claude Opus 4.6 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-04-13T17:39:27-05:00",
          "tree_id": "6b8aec8afeeaddbcded99b77e836273a2882507a",
          "url": "https://github.com/pulseengine/rivet/commit/7712ccc6ea7da257dbbb1dfc28e31c3ff9f0e50a"
        },
        "date": 1776120343671,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 81123,
            "range": "± 298",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 861251,
            "range": "± 28409",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 17235291,
            "range": "± 1357592",
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
            "value": 25397,
            "range": "± 94",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 394784,
            "range": "± 3346",
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
            "value": 1013640,
            "range": "± 49185",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 159243,
            "range": "± 557",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1849543,
            "range": "± 25165",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 33095609,
            "range": "± 2973268",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 108955,
            "range": "± 2463",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 905955,
            "range": "± 4147",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 12954500,
            "range": "± 1928782",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 5251,
            "range": "± 23",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 61872,
            "range": "± 170",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 793006,
            "range": "± 12059",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 55646,
            "range": "± 792",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 662063,
            "range": "± 2202",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7391064,
            "range": "± 162332",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 785,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7489,
            "range": "± 58",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 116318,
            "range": "± 693",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23222,
            "range": "± 132",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 162526,
            "range": "± 672",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1496008,
            "range": "± 33816",
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
          "id": "7aa75077286463808692515a59ee313956bbf663",
          "message": "fix(ci): Miri green + getting-started docs for all new features\n\nFix Miri CI: feature_model tests build rowan trees for constraint\nparsing, triggering the same tree-borrows deallocation UB as yaml_hir.\nSkip feature_model in Miri alongside existing skips.\n\nUpdate getting-started.md with documentation for new features:\ns-expression filtering, variant management, Zola export, sphinx-needs\nimport, MCP server, git hooks, and security model.\n\nTrace: skip\n\nCo-authored-by: Claude Opus 4.6 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-04-13T22:26:40-05:00",
          "tree_id": "1652d03753fb32ac550309c8344fb4d63c7fc0f0",
          "url": "https://github.com/pulseengine/rivet/commit/7aa75077286463808692515a59ee313956bbf663"
        },
        "date": 1776137587243,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 81935,
            "range": "± 394",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 889208,
            "range": "± 11723",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12224860,
            "range": "± 346838",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1942,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24729,
            "range": "± 110",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 355047,
            "range": "± 3302",
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
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1047453,
            "range": "± 24708",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 167191,
            "range": "± 852",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1927509,
            "range": "± 143164",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 26438292,
            "range": "± 1625801",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 106814,
            "range": "± 366",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 919452,
            "range": "± 2856",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 10406610,
            "range": "± 141486",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4320,
            "range": "± 9",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 46051,
            "range": "± 503",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 757165,
            "range": "± 11383",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 62309,
            "range": "± 166",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 690801,
            "range": "± 2007",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7796059,
            "range": "± 143668",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 732,
            "range": "± 21",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 6536,
            "range": "± 35",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 91200,
            "range": "± 484",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21693,
            "range": "± 142",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 146620,
            "range": "± 783",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1356087,
            "range": "± 19709",
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
          "id": "a06285f20fa364fde1e268eee2a862748d2f720e",
          "message": "feat(cli): rivet validate --variant for variant-scoped validation\n\nAdd --model, --variant, and --binding flags to `rivet validate` that\nenable variant-scoped validation using the feature model constraint\nsolver. When all three flags are provided, the command:\n\n1. Loads the feature model and solves the variant configuration\n2. Uses the binding file to collect artifact IDs for effective features\n3. Builds a scoped store containing only those artifacts\n4. Runs validation against the scoped store instead of the full project\n\nIncludes error handling when only some of the three flags are provided,\nvariant scope info in both text and JSON output formats, and proper\ndiagnostic filtering for the salsa incremental path.\n\nImplements: REQ-045, REQ-046\n\nCo-authored-by: Claude Opus 4.6 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-04-13T22:26:43-05:00",
          "tree_id": "ceb460bf54d985b02cb1bc90f414880a29ee33ba",
          "url": "https://github.com/pulseengine/rivet/commit/a06285f20fa364fde1e268eee2a862748d2f720e"
        },
        "date": 1776137771012,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 81558,
            "range": "± 907",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 858463,
            "range": "± 11203",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 16216025,
            "range": "± 897474",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2249,
            "range": "± 79",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26336,
            "range": "± 66",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 376692,
            "range": "± 3690",
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
            "value": 1025228,
            "range": "± 52001",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 161739,
            "range": "± 1606",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1924266,
            "range": "± 30946",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 36579936,
            "range": "± 4673797",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 108837,
            "range": "± 1765",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 919513,
            "range": "± 4527",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 14162422,
            "range": "± 1493848",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4419,
            "range": "± 102",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 62204,
            "range": "± 512",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 798731,
            "range": "± 17136",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 60239,
            "range": "± 418",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 694308,
            "range": "± 6106",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 10375029,
            "range": "± 656790",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 776,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7493,
            "range": "± 177",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 114710,
            "range": "± 594",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23349,
            "range": "± 125",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 162126,
            "range": "± 1738",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1499579,
            "range": "± 17780",
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
          "id": "fa8eb71d3ce7b1fd663bac225af7290b23c63e9c",
          "message": "feat(stpa): AI-in-the-loop safety and security analysis\n\nSTPA + STPA-Sec for circular trust problem: AI builds the tool AND\nwrites the safety analysis that certifies it.\n\nSafety: 3 losses, 6 hazards, 6 constraints\n- H-AI-001: AI writes test that validates the bug\n- H-AI-005: Human review degrades with AI output volume\n- SC-AI-001: proptest/Kani provide independent verification\n- SC-AI-002: STPA must be human-reviewed, not auto-approved\n\nSecurity: 3 losses, 2 hazards, 3 constraints\n- SH-AI-001: Self-referential blind spot (this file is AI-generated)\n- SSC-AI-001: AI safety artifacts must be draft until human-reviewed\n\nNOTE: This analysis is itself AI-generated and must be treated as\na starting point for human review, not authoritative evidence.\n\nImplements: REQ-002\n\nCo-authored-by: Claude Opus 4.6 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-04-13T22:55:13-05:00",
          "tree_id": "65f866adc6822f6d8f3f3e2bd2ca5b20a459975a",
          "url": "https://github.com/pulseengine/rivet/commit/fa8eb71d3ce7b1fd663bac225af7290b23c63e9c"
        },
        "date": 1776139427218,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 81980,
            "range": "± 925",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 873340,
            "range": "± 8050",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 18106797,
            "range": "± 985200",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2190,
            "range": "± 35",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26425,
            "range": "± 176",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 370107,
            "range": "± 2511",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 95,
            "range": "± 13",
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
            "value": 1021235,
            "range": "± 17602",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 166663,
            "range": "± 666",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1962720,
            "range": "± 90470",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 41487759,
            "range": "± 2033453",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 109523,
            "range": "± 471",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 919727,
            "range": "± 4468",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 17950443,
            "range": "± 753491",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4343,
            "range": "± 92",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 65146,
            "range": "± 530",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 819251,
            "range": "± 33906",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 61486,
            "range": "± 193",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 688116,
            "range": "± 2991",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 10620457,
            "range": "± 450912",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 782,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7429,
            "range": "± 95",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 109482,
            "range": "± 1911",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23532,
            "range": "± 301",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 164393,
            "range": "± 978",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1511860,
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
          "id": "21cd1e041c2ba0275fbf709538c29881105fa22a",
          "message": "fix: clear warnings — REQ-054..059 via rivet batch\n\nCreated 6 requirements satisfying SC-AI-001..006 using rivet batch.\nFixed REQ-047/048/050 category from \"security\" to \"non-functional\".\nWarnings: 14 → 5. 689 artifacts, PASS.\n\nTrace: skip\n\nCo-authored-by: Claude Opus 4.6 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-04-14T06:45:06-05:00",
          "tree_id": "a224c3606511f771fed03401195fc30beaff77c4",
          "url": "https://github.com/pulseengine/rivet/commit/21cd1e041c2ba0275fbf709538c29881105fa22a"
        },
        "date": 1776167484360,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 80862,
            "range": "± 594",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 861382,
            "range": "± 5204",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 10877938,
            "range": "± 720653",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2226,
            "range": "± 10",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25274,
            "range": "± 249",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 377204,
            "range": "± 1365",
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
            "value": 1014433,
            "range": "± 15385",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 163043,
            "range": "± 6716",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1849642,
            "range": "± 15771",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 22296368,
            "range": "± 834679",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 108153,
            "range": "± 613",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 911036,
            "range": "± 3839",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 9067860,
            "range": "± 248395",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4327,
            "range": "± 37",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 61853,
            "range": "± 278",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 768364,
            "range": "± 2737",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 61799,
            "range": "± 175",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 678784,
            "range": "± 15946",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7178257,
            "range": "± 183800",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 780,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7291,
            "range": "± 43",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 115079,
            "range": "± 569",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23509,
            "range": "± 277",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 162459,
            "range": "± 1282",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1501142,
            "range": "± 19519",
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
          "id": "912530c59a2da2fc35209960e830726d1600c4f3",
          "message": "feat: verification pyramid + STPA bug fixes (#150)\n\nfeat: verification pyramid — STPA-Sec tests, formal proof CI, Kani expansion",
          "timestamp": "2026-04-14T15:37:09-05:00",
          "tree_id": "7badee806c6ee0d339bccaa343bb4e7aea7520a5",
          "url": "https://github.com/pulseengine/rivet/commit/912530c59a2da2fc35209960e830726d1600c4f3"
        },
        "date": 1776199530640,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 81422,
            "range": "± 1340",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 879182,
            "range": "± 13625",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 17002104,
            "range": "± 1145085",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1953,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24514,
            "range": "± 45",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 361652,
            "range": "± 2713",
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
            "value": 1020687,
            "range": "± 22088",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 166270,
            "range": "± 472",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1912882,
            "range": "± 89579",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 35955798,
            "range": "± 3763109",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 107915,
            "range": "± 747",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 925707,
            "range": "± 3933",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 12032563,
            "range": "± 1529124",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4215,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 46027,
            "range": "± 110",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 748153,
            "range": "± 13601",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 60619,
            "range": "± 302",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 691394,
            "range": "± 8817",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8559373,
            "range": "± 313736",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 787,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7192,
            "range": "± 38",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 93311,
            "range": "± 612",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21738,
            "range": "± 535",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 148201,
            "range": "± 3531",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1377745,
            "range": "± 102409",
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
          "id": "913ce295e92d074d1d9c7597b6bebccc3073a2e5",
          "message": "test(e2e): fix playwright regressions pre-release (#151)\n\n* test(e2e): fix playwright regressions pre-release\n\n- coverage-view: handle multi-table strict-mode violation by scoping to the\n  first table (coverage rules table)\n- api: drop title-truthy assertion since control-actions use name/action\n  instead of title\n- audit-regression/graph/navigation/print-and-errors/self-contained:\n  extend per-test timeouts on routes hitting /graph, which dogfoods on the\n  project's ~1800 artifacts and currently takes ~57s (tracked as a perf\n  follow-up; not a release blocker)\n- helpers: make waitForHtmx's timeout configurable\n\nFull suite: 354/354 passing locally.\n\nTrace: skip\n\n* fix(deps): bump rustls-webpki to 0.103.12\n\nPatches RUSTSEC-2026-0098 and RUSTSEC-2026-0099, which published on\n2026-04-14 and started failing the Security Audit job on any PR.\n\nTrace: skip\n\n* fix(clippy): collapse nested if in junit parser\n\nRust 1.95 promoted clippy::collapsible-match to the default lint set,\nwhich failed the Clippy CI job on the stable toolchain update. Merges\nthe outer guard into the match arm pattern.\n\nTrace: skip",
          "timestamp": "2026-04-19T08:01:45-05:00",
          "tree_id": "3a0faedc00eaaba996793e4af2f955484bfb724a",
          "url": "https://github.com/pulseengine/rivet/commit/913ce295e92d074d1d9c7597b6bebccc3073a2e5"
        },
        "date": 1776604288094,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 79881,
            "range": "± 159",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 857498,
            "range": "± 13878",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 10982504,
            "range": "± 778393",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2166,
            "range": "± 15",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25088,
            "range": "± 105",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 369739,
            "range": "± 1750",
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
            "value": 103,
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
            "value": 996482,
            "range": "± 17795",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 164504,
            "range": "± 1424",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1888718,
            "range": "± 5210",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 22787635,
            "range": "± 811363",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 108504,
            "range": "± 790",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 905157,
            "range": "± 3964",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 9143774,
            "range": "± 189873",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4290,
            "range": "± 10",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 58982,
            "range": "± 3954",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 772076,
            "range": "± 1508",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 60944,
            "range": "± 1140",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 684136,
            "range": "± 3135",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7408478,
            "range": "± 35076",
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
            "value": 7348,
            "range": "± 28",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 109712,
            "range": "± 737",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23014,
            "range": "± 153",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 165216,
            "range": "± 2862",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1493825,
            "range": "± 35984",
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
          "id": "9a46e86e2fa37ea035c0f4fac717b774a1e734e8",
          "message": "chore(release): v0.4.0 (#152)\n\nBumps workspace version 0.3.0 → 0.4.0 and adds CHANGELOG entry covering\nthe verification pyramid, variant/PLE, Zola export, sphinx-needs import,\nLSP code actions, MCP CRUD, STPA extraction fixes, and the rustls-webpki\nadvisory patch.\n\nTrace: skip",
          "timestamp": "2026-04-19T10:23:06-05:00",
          "tree_id": "3e595cf0c9aae4595ebbc71f7f8d7e6e1e3a14c5",
          "url": "https://github.com/pulseengine/rivet/commit/9a46e86e2fa37ea035c0f4fac717b774a1e734e8"
        },
        "date": 1776612569699,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 80496,
            "range": "± 1283",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 856065,
            "range": "± 4723",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 11232856,
            "range": "± 511354",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2196,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26898,
            "range": "± 141",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 356411,
            "range": "± 912",
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
            "value": 987701,
            "range": "± 5118",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 163992,
            "range": "± 2033",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1892721,
            "range": "± 11862",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 27288200,
            "range": "± 1972523",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 107541,
            "range": "± 1156",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 890440,
            "range": "± 18408",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 10673135,
            "range": "± 1247918",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4261,
            "range": "± 9",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60478,
            "range": "± 278",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 761396,
            "range": "± 25217",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 63148,
            "range": "± 188",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 705376,
            "range": "± 2774",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7730558,
            "range": "± 162342",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 826,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7538,
            "range": "± 34",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 120480,
            "range": "± 1160",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23567,
            "range": "± 216",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 165884,
            "range": "± 2542",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1508423,
            "range": "± 21899",
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
          "id": "aa706fc7cce6c53a1c75cc3397c905ca9802463f",
          "message": "fix(windows): gate permissions chmod behind cfg(unix) (#153)\n\ninstall_hook() called Permissions::from_mode(0o755) unconditionally,\nbreaking the Windows release build with E0433/E0599. Windows git runs\nhooks through Git-Bash regardless of NTFS executable bits, so skipping\nthe chmod is safe.\n\nBlocks the v0.4.0 cross-platform release.\n\nTrace: skip",
          "timestamp": "2026-04-20T00:39:04-05:00",
          "tree_id": "eb4c7fe7bc88454ad41ba2d8baa0de5199049d9d",
          "url": "https://github.com/pulseengine/rivet/commit/aa706fc7cce6c53a1c75cc3397c905ca9802463f"
        },
        "date": 1776663927841,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 81180,
            "range": "± 380",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 872645,
            "range": "± 4586",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13444099,
            "range": "± 1792686",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1934,
            "range": "± 14",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24897,
            "range": "± 829",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 373078,
            "range": "± 1512",
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
            "range": "± 1",
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
            "value": 995907,
            "range": "± 19908",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 163548,
            "range": "± 8041",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1917262,
            "range": "± 25940",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 27530692,
            "range": "± 3638629",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 105463,
            "range": "± 1727",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 928323,
            "range": "± 7239",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 10896266,
            "range": "± 1631891",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4118,
            "range": "± 66",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 45738,
            "range": "± 588",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 752549,
            "range": "± 5164",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 63429,
            "range": "± 129",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 712193,
            "range": "± 3214",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8034836,
            "range": "± 485698",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 783,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 6902,
            "range": "± 21",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 90574,
            "range": "± 529",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21247,
            "range": "± 1392",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 146941,
            "range": "± 385",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1369913,
            "range": "± 27766",
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
          "id": "56087b8e14b592f717e77b3115093e452317b035",
          "message": "fix(feature-model): cross-tree constraints silently pass (#156)\n\n* fix(feature-model): evaluate cross-tree constraints as logical assertions\n\nBefore this change, `rivet variant check` silently reported PASS on\nvariants that explicitly violated `(implies X (not Y))` and other\ncross-tree constraints where forward propagation could not auto-select\na feature to satisfy the consequent. The solver only used `Expr::Implies`\nto schedule consequent features for selection; when the consequent was\na negation, a compound, or any non-feature-name shape, no check ever\nfired against the propagated selection — a false-positive PASS on a\nsafety-critical validation surface.\n\nFix: add a `eval_constraint` pass after propagation that treats every\ntop-level constraint as a boolean assertion over the effective feature\nset, with standard propositional semantics for `and`/`or`/`not`/\n`implies`/`excludes`. `excludes` keeps its dedicated diagnostic string\nto preserve existing error messages; other shapes report through a new\n`describe_constraint` helper. Unknown artifact-oriented predicates\n(link queries, regex matches) default to true so unrelated constraint\nflavours do not trigger spurious violations.\n\nRegression tests cover the reported shape `(implies X (not Y))` with\nboth X and Y selected (now FAIL), the companion case with only X\nselected (still PASS), and ensure forward propagation of\n`(implies X Y)` still works.\n\nFixes: REQ-044\n\n* fix(deps): ignore RUSTSEC-2026-0103 (thin-vec UAF in transitive salsa)\n\nthin-vec 0.2.14 has a Double-Free / UAF in IntoIter::drop and\nThinVec::clear. Pulled in transitively via salsa 0.26.0. Rivet does\nnot directly construct or iterate thin_vec::ThinVec — the exposure is\nthrough salsa's internal data structures.\n\nIgnore in both cargo-deny and cargo-audit until either salsa bumps\nits thin-vec dependency or thin-vec 0.2.15 lands upstream.\n\nTrace: skip",
          "timestamp": "2026-04-21T13:52:40-05:00",
          "tree_id": "9e9392032e08d8839b6e2246ced7d0e442c4ba6e",
          "url": "https://github.com/pulseengine/rivet/commit/56087b8e14b592f717e77b3115093e452317b035"
        },
        "date": 1776797926104,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 63903,
            "range": "± 232",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 997825,
            "range": "± 130653",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 15493494,
            "range": "± 1592811",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1494,
            "range": "± 10",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 18413,
            "range": "± 157",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 264812,
            "range": "± 5401",
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
            "range": "± 1",
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
            "value": 774488,
            "range": "± 25782",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 191060,
            "range": "± 26742",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 2023898,
            "range": "± 248972",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 31428795,
            "range": "± 3585696",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 97158,
            "range": "± 1157",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 859226,
            "range": "± 26496",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 10835840,
            "range": "± 1635640",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3277,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 35299,
            "range": "± 390",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 636087,
            "range": "± 2936",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 54388,
            "range": "± 808",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 574164,
            "range": "± 2068",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 6755220,
            "range": "± 434930",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 579,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 4993,
            "range": "± 145",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 70862,
            "range": "± 1164",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 19080,
            "range": "± 219",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 132933,
            "range": "± 3952",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1239036,
            "range": "± 12518",
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
          "id": "60d728a29a18f3e2ba744128fdd274f2df0ee9a1",
          "message": "fix(validate): salsa path silently drops adapter + external artifacts (#157)\n\n* fix(validate): inject adapter/external artifacts into salsa store\n\nThe default (salsa-incremental) validation path only fed YAML source\nfiles into the salsa database — it silently dropped artifacts produced\nby non-YAML adapters (aadl, reqif, needs-json, wasm) and never loaded\nexternal-project artifacts at all. Any link whose target lived in\nadapter output (e.g. a YAML artifact with `modeled-by -> AADL-Foo-Bar`\nor `analyzes -> AADL-*`) or in an external project (`spar:SPAR-*`) was\nflagged as a phantom \"link target does not exist\" broken-link\ndiagnostic. The only workaround was `rivet validate --direct`, which\nbypasses salsa and loads everything through `ProjectContext::load`.\n\nFix:\n\n* rivet-core/src/db.rs: add a new `ExtraArtifactSet` salsa input\n  that carries pre-parsed artifacts contributed by non-YAML adapters,\n  and `_with_extras` variants of `validate_all`,\n  `evaluate_conditional_rules`, `build_link_graph`,\n  `compute_coverage_tracked`, and `filter_artifact_ids` that merge\n  those artifacts into the store before link-graph construction. The\n  original (no-extras) entry points keep their exact bodies so\n  existing callers and memoization behaviour are preserved.\n\n* rivet-cli/src/main.rs (run_salsa_validation): invoke\n  `load_artifacts` for non-YAML source formats and\n  `load_all_externals` for externals, feed the results through the\n  new `db.load_extras(..)` / `db.diagnostics_with_extras(..)` API.\n  Also removes an unconditional duplicate `collect_yaml_files` call\n  that was traversing each YAML source twice.\n\nRegression test `salsa_path_matches_direct_on_adapter_only_targets`\npins three things at the core level:\n  1. Direct path resolves the modeled-by link and reports zero\n     broken-link diagnostics.\n  2. Salsa path without extras reproduces the original bug and\n     reports one phantom broken-link (guards the no-extras API from\n     silently drifting).\n  3. Salsa path with extras matches the direct path exactly.\n\nOn the rivet dogfood project, `rivet validate` and\n`rivet validate --direct` now produce identical diagnostic counts\n(6 errors, 9 warnings, 0 broken cross-refs) where the default path\npreviously differed.\n\nFixes: REQ-029, REQ-004\nVerifies: REQ-004\n\nCo-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>\n\n* fix(deps): ignore RUSTSEC-2026-0103 (thin-vec UAF in transitive salsa)\n\nthin-vec 0.2.14 has a Double-Free / UAF in IntoIter::drop and\nThinVec::clear. Pulled in transitively via salsa 0.26.0. Rivet does\nnot directly construct or iterate thin_vec::ThinVec — the exposure is\nthrough salsa's internal data structures.\n\nIgnore in both cargo-deny and cargo-audit until either salsa bumps\nits thin-vec dependency or thin-vec 0.2.15 lands upstream.\n\nTrace: skip\n\n* fix(tests): wait for /api/v1/health 200 before fetching\n\nserve_integration::start_server() previously returned as soon as TCP\naccept succeeded. Under PROPTEST_CASES=1000 CI load, the socket binds\nbefore the artifact store finishes loading, so fetch() races and hits\nthe server mid-load — the HTTP connection gets closed or returns an\nempty response, parsed as status=0.\n\nSeen intermittently as:\n  api_artifacts_unfiltered ... FAILED\n    assertion `left == right` failed: left=0 right=200\n  api_artifacts_search ... FAILED (same shape)\n\nFix: poll /api/v1/health until it returns HTTP/1.1 200 before declaring\nthe server ready. The health handler only becomes reachable after\nrouting is fully initialized.\n\nTrace: skip\n\n---------\n\nCo-authored-by: Claude Opus 4.7 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-04-21T13:57:49-05:00",
          "tree_id": "95c6e288c97716c36213ca5f857509b21ad6d9ff",
          "url": "https://github.com/pulseengine/rivet/commit/60d728a29a18f3e2ba744128fdd274f2df0ee9a1"
        },
        "date": 1776798271356,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 75139,
            "range": "± 275",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 872940,
            "range": "± 2350",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 15045716,
            "range": "± 645992",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1681,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 19280,
            "range": "± 48",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 351144,
            "range": "± 1443",
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
            "value": 915887,
            "range": "± 5580",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 159195,
            "range": "± 1377",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1838157,
            "range": "± 39897",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 39814510,
            "range": "± 2597180",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 106027,
            "range": "± 1092",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 969781,
            "range": "± 18513",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 15671235,
            "range": "± 1313077",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3917,
            "range": "± 15",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 41331,
            "range": "± 88",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 759772,
            "range": "± 3850",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 53071,
            "range": "± 128",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 584274,
            "range": "± 2706",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 9092814,
            "range": "± 591331",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 619,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 5174,
            "range": "± 14",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 140485,
            "range": "± 1097",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 20122,
            "range": "± 47",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 139241,
            "range": "± 1029",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1291464,
            "range": "± 6158",
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
          "id": "a8ac559c9715bed5cfae291c093391932c671c83",
          "message": "docs: Polarion and ReqIF export fidelity analysis (#169)\n\nField-by-field analysis of rivet's Artifact model against Polarion REST\nand ReqIF 1.2, with round-trip test strategy and ranked next steps.\nHighlights ReqIF Debug-form coercion bug for non-string fields and the\nunconditional loss of provenance on export.\n\nRefs: REQ-025, FEAT-001",
          "timestamp": "2026-04-21T14:43:22-05:00",
          "tree_id": "f1e131601497f7f516d4bc8cba4c53e7836d1701",
          "url": "https://github.com/pulseengine/rivet/commit/a8ac559c9715bed5cfae291c093391932c671c83"
        },
        "date": 1776802890925,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 82050,
            "range": "± 1806",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 867662,
            "range": "± 4879",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14506139,
            "range": "± 1371052",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1951,
            "range": "± 20",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25178,
            "range": "± 1126",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 375562,
            "range": "± 3406",
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
            "range": "± 2",
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
            "value": 995325,
            "range": "± 20374",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 166892,
            "range": "± 790",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1917022,
            "range": "± 16984",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 28058873,
            "range": "± 2773920",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 106882,
            "range": "± 428",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 955020,
            "range": "± 13038",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 10877792,
            "range": "± 382004",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4078,
            "range": "± 22",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 44816,
            "range": "± 921",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 742419,
            "range": "± 4629",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 62302,
            "range": "± 1017",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 718697,
            "range": "± 43268",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8100284,
            "range": "± 261201",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 742,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 6557,
            "range": "± 97",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 91049,
            "range": "± 422",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21178,
            "range": "± 168",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 144922,
            "range": "± 383",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1363793,
            "range": "± 15222",
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
          "id": "a7dcc30efc7bd0a4197283b533c656fe67d1bd0b",
          "message": "fix(init): preserve manual content in AGENTS.md / CLAUDE.md via managed-section markers (#167)\n\n* wip(init): managed-section markers for AGENTS.md regen (INCOMPLETE)\n\nThe stalled Mythos agent got about 60% through this task before\nhitting a 600s watchdog timeout. Saving the WIP so it isn't lost:\n\n- New rivet-core/src/managed_section.rs: splice_managed_section() with\n  the BEGIN rivet-managed / END rivet-managed HTML-comment scheme, plus\n  error types for NoMarkers and MultipleMarkers.\n- rivet-cli/src/main.rs: --migrate and --force-regen flags wired into\n  cmd_init_agents (partial).\n\n**Not yet done** (pickup list for whoever takes this over):\n- Integration tests in rivet-cli/tests/init_integration.rs\n- CLAUDE.md regen path (confirm whether init --agents touches it)\n- Migrate rivet's own AGENTS.md to use markers\n- Confirm cargo build + cargo test pass\n\n**Why it matters**: without this, `rivet init --agents` silently\noverwrites downstream consumers' manual AGENTS.md content. Sigil\nships a \"don't regenerate\" warning comment as a workaround.\n\nDo not merge this commit; pick up where it left off or restart\nwith a tighter agent scope.\n\nTrace: skip\n\n* test(init): integration tests for AGENTS.md / CLAUDE.md marker semantics\n\nSeven end-to-end tests that exercise `rivet init --agents` against the\nfull CLI binary, covering every branch of the write_managed_file state\nmachine:\n\n- agents_md_fresh_file_has_markers — non-existent file gets exactly one\n  BEGIN/END rivet-managed pair on first write.\n- agents_md_preserves_manual_section_outside_markers — prose above and\n  below the markers survives regeneration; only the managed region is\n  replaced.\n- agents_md_refuses_no_markers_default — pre-existing file with no\n  markers and no flag -> exit 1, file untouched byte-for-byte.\n- agents_md_force_regen_overwrites_no_markers — --force-regen discards\n  prior content, emits a stderr warning.\n- agents_md_migrate_wraps_existing_content — --migrate puts the managed\n  section on top, preserves prior content below, and a subsequent plain\n  regen splices cleanly.\n- agents_md_multiple_markers_rejected — two BEGIN/END pairs -> exit 1,\n  file untouched.\n- claude_md_preserves_manual_section_outside_markers — the same splice\n  semantics apply to CLAUDE.md.\n\nThe existing 11 unit tests in rivet-core/src/managed_section.rs already\ncover the pure-function surface (splice, wrap_fresh, migrate_wrap,\nhas_markers, and the error cases NoMarkers, MultipleBeginMarkers,\nUnclosedMarker, OrphanEndMarker), so these integration tests focus on\nthe CLI wiring and filesystem side-effects rather than duplicating\nthe unit coverage.\n\nFixes: REQ-007\nVerifies: REQ-007\nRefs: FEAT-026\n\nCo-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>\n\n* docs: wrap rivet's AGENTS.md and CLAUDE.md in rivet-managed markers\n\nSelf-host the managed-section scheme so a future `rivet init --agents`\nrun on the rivet repo itself splices the auto-generated region cleanly\ninstead of tripping the new no-marker refusal path.\n\nAGENTS.md:\n- Project overview, artifact-type table, link-type table, and the\n  Conventions block (all currently regenerated by `cmd_init_agents`)\n  are wrapped inside a single BEGIN/END rivet-managed pair.\n- The hand-expanded Commit Traceability reference (trailer table,\n  choosing-the-right-artifacts guide, and the retroactive traceability\n  map) is moved below the END marker so it survives regeneration. The\n  generator emits a much shorter commits section; keeping the rich\n  reference outside the markers lets us expand it without fighting the\n  regenerator.\n\nCLAUDE.md:\n- The entire hand-authored content (validation/queries, commit\n  traceability quick reference, hook security model, AI provenance)\n  now lives above the markers and will be preserved verbatim.\n- The managed region is committed as an empty stub with an explanatory\n  comment; the next `rivet init --agents` will populate it with the\n  generated CLAUDE.md shim.\n\nCLAUDE.md scope check: `rivet init --agents` is the only code path in\nrivet-cli that writes CLAUDE.md (grep for `CLAUDE\\.md` in\nrivet-cli/src confirms no other write site), and it already uses the\nsame `write_managed_file` helper as AGENTS.md via d66dee2. No\nadditional code change is needed for CLAUDE.md support.\n\nFixes: REQ-007\nRefs: FEAT-026\n\nCo-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>\n\n---------\n\nCo-authored-by: Claude Opus 4.7 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-04-21T14:44:37-05:00",
          "tree_id": "1ff2c3b57ba8f4f590b24faece23d5657b117076",
          "url": "https://github.com/pulseengine/rivet/commit/a7dcc30efc7bd0a4197283b533c656fe67d1bd0b"
        },
        "date": 1776804038969,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 80654,
            "range": "± 688",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 845428,
            "range": "± 3857",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 11299768,
            "range": "± 492945",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2326,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26299,
            "range": "± 893",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 371481,
            "range": "± 16722",
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
            "range": "± 2",
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
            "value": 1009052,
            "range": "± 17434",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 160365,
            "range": "± 3710",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1885560,
            "range": "± 30228",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 23595600,
            "range": "± 629379",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 111921,
            "range": "± 699",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 957520,
            "range": "± 9987",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 9595695,
            "range": "± 144843",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4275,
            "range": "± 16",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60777,
            "range": "± 360",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 779545,
            "range": "± 67119",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 60655,
            "range": "± 446",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 681048,
            "range": "± 10004",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7528352,
            "range": "± 77415",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 776,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7583,
            "range": "± 26",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 116179,
            "range": "± 2541",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23359,
            "range": "± 439",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 165904,
            "range": "± 1761",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1505011,
            "range": "± 12636",
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
          "id": "d09a4bb04fa01e9a30fcd3b77479f51358af0799",
          "message": "fix(mythos): 4 one-liner silent-accept bugs (validate/coverage/yaml_hir/formats) (#168)\n\n* fix(validate): align empty target-types/from-types with coverage semantics\n\nBefore this fix, `validate::validate` and `coverage::compute_coverage`\ngave contradictory answers on the same traceability rule + artifact\ndata:\n\n- `TraceabilityRule.target_types` / `.from_types` are `#[serde(default)]`\n  so they deserialize to an empty `Vec<String>` when omitted.\n- `validate::validate` treated an empty list as \"match nothing\"\n  (rule.target_types.contains(&t) is false for every t), producing a\n  false-positive violation.\n- `coverage::compute_coverage` treated an empty list as \"match any\"\n  (`if target_types.is_empty() { true } else { ... }`), reporting the\n  same artifact as fully covered.\n\nResult: `rivet validate` said \"1 error\" while `rivet coverage` said\n\"1/1 (100%)\" on the same inputs. Discovered by the Mythos pass.\n\nUnify on the \"match any\" convention (also used by LinkFieldDef checks\nat validate.rs ~L310) so both tools agree. Adds two regression tests\nthat pin validate and coverage must never contradict each other on\nempty `target-types` or `from-types`.\n\nFixes: REQ-004\nVerifies: REQ-010\n\nCo-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>\n\n* fix(coverage): exclude self-links from traceability rule satisfaction\n\n`compute_coverage` counted a link from an artifact to itself (e.g.\n`DD-001 → DD-001` via `satisfies`) as a valid rule satisfaction. That\nmeant an author blocked from finding upstream trace could pass CI by\nwriting a single self-referential line — the author's own DD closed\nthe loop.\n\nAdd `l.target != *id` (forward) and `bl.source != *id` (backlink) to\nthe filter chain inside `compute_coverage`. Two regression tests —\none per direction — pin the expected behaviour.\n\nDiscovered by the Mythos pass; empirically reproducible.\n\nFixes: REQ-004\n\nCo-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>\n\n* fix(yaml_hir): skip null/empty shorthand values instead of emitting phantom link\n\nWhen a schema-shorthand-link field is written with a null-like YAML\nvalue (e.g. `losses: null`, `losses: ~`, `losses: \"\"`), the extractor\nwas creating a `Link { target: \"null\" }` / `\"~\"` / `\"\"` instead of\ntreating it as \"no link.\" These phantom links silently pollute the\ntrace graph, and the YAML footgun fuzzer surfaced the behaviour as a\nconfirmed bug.\n\nAdd an `is_null_or_empty_scalar` helper and guard the shorthand link\nemission on it. Also skip empty-string entries inside list shorthand\nvalues (`losses: [L-1, \"\"]`). Three regression tests cover the null,\ntilde, and empty-string cases.\n\nImplements: REQ-028\n\nCo-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>\n\n* fix(formats/generic): reject unknown top-level keys instead of silently dropping\n\nWithout `#[serde(deny_unknown_fields)]` on `GenericFile`, a file that\nhas a valid `artifacts:` key plus a typo-ed companion key like\n`artifact:` (singular) or `Artifacts:` (wrong case) deserialized\nsuccessfully and silently dropped every artifact under the typo'd key.\nThe fuzzer (test/yaml-cli-fuzzers branch) confirmed the resulting\ntrace-graph hole.\n\nAdd `deny_unknown_fields` so unknown top-level keys surface as\n`serde_yaml::Error`s. `parse_generic_yaml` already bubbles these up\nas `Error::Yaml`, and the diagnostics pipeline in db.rs\n(`collect_parse_errors`) converts them to `Severity::Error`\ndiagnostics — so the typo is now user-visible rather than silent.\n\nTwo regression tests pin the new behaviour for `artifact:` (singular)\nand `Artifacts:` (capitalised) companion keys.\n\nFixes: REQ-004\nVerifies: REQ-010\n\nCo-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>\n\n---------\n\nCo-authored-by: Claude Opus 4.7 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-04-21T14:44:41-05:00",
          "tree_id": "43681235b42f9a26b7a0f7cbc12bb9f86f7f98a7",
          "url": "https://github.com/pulseengine/rivet/commit/d09a4bb04fa01e9a30fcd3b77479f51358af0799"
        },
        "date": 1776804187955,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 80863,
            "range": "± 601",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 858653,
            "range": "± 6175",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 15500980,
            "range": "± 1224092",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2121,
            "range": "± 18",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26094,
            "range": "± 321",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 374351,
            "range": "± 10873",
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
            "value": 991901,
            "range": "± 15466",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 165581,
            "range": "± 2794",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1876571,
            "range": "± 21758",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 26661047,
            "range": "± 1907239",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 112471,
            "range": "± 797",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 954987,
            "range": "± 6052",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 12674693,
            "range": "± 764811",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4410,
            "range": "± 24",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 69387,
            "range": "± 238",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 777659,
            "range": "± 16770",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 56450,
            "range": "± 222",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 672850,
            "range": "± 4415",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8726447,
            "range": "± 563011",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 782,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7716,
            "range": "± 25",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 105806,
            "range": "± 674",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23069,
            "range": "± 150",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 158191,
            "range": "± 2869",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1462886,
            "range": "± 20690",
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
          "id": "2fafe1a574e590671b21e9fce42b4a76db88ef70",
          "message": "fix: audit followups — real hard gates, /graph budget, PLE self-apply, v0.4.0 artifacts (#155)\n\n* fix(ci): make Kani, Rocq, and Mutation Testing real hard gates\n\nAudit found that all four verification-pyramid CI jobs were silently\nfailing on main. None had ever run green. This fixes three and scopes\nthe fourth to an upstream bug.\n\n**Kani Proofs** — flipped to hard gate. Five harnesses in\nrivet-core/src/proofs.rs were initializing `EvalContext` with only\n`artifact` + `graph` fields after the struct grew a `store: Option<...>`\nfield for quantifier support. The cfg(kani) gate meant the break was\ninvisible to normal `cargo check`. Added `store: None` to all five.\n\n**Rocq Proofs** — flipped to hard gate. The `rocq_library` target\n`rivet_metamodel` had `srcs = []`, which fails Bazel analysis with\n\"rocq_library requires at least one source file\". Removed the empty\naggregator target and pointed the test at the two real libraries\n(Schema + Validation) directly.\n\n**Mutation Testing** — split into a per-crate matrix so rivet-core\nand rivet-cli each get a 45-minute budget. Previously both crates\nshared a single 40-minute timeout, causing rivet-core to be cancelled\nbefore finishing and rivet-cli to never run. `--timeout` per-mutant\nreduced from 120s to 90s. Uploads are now per-crate artifacts.\n\n**Verus Proofs** — left as continue-on-error with a pointer comment.\nRoot cause is in rules_verus (pulseengine/rules_verus, commit e2c1600):\nthe hub repository's `:all` alias only points to the first platform's\ntoolchain rather than registering `toolchain()` rules for each\nplatform, so `register_toolchains(\"@verus_toolchains//:all\")`\nresolves to a non-toolchain target. Fixing this requires an upstream\nchange to rules_verus.\n\nWith these fixes, CI will fail — honestly — on Kani regressions,\nRocq proof breaks, and surviving mutants, instead of silently\nreporting green.\n\nImplements: REQ-010, REQ-029\nVerifies: REQ-010\n\n* perf(serve): enforce node budget on /graph to prevent 57s render\n\nThe /graph dashboard route previously ran layout + SVG over the full\nlink graph (~1800 artifacts on the dogfood dataset), taking ~57s and\nproducing ~1MB of HTML. The Playwright test at graph.spec.ts:17 was\nnamed \"node budget prevents crash on full graph\" but grepping the\nrenderer for budget/max_nodes returned zero matches -- the budget was\naspirational.\n\nThis commit adds a real safety valve in render_graph_view:\n\n- DEFAULT_NODE_BUDGET = 200, MAX_NODE_BUDGET = 2000 (hard ceiling).\n- After the filtered subgraph is built but before the expensive\n  pgv_layout + render_svg calls, short-circuit with a budget message\n  when node_count > budget.\n- The message contains the literal string \"budget\" so the Playwright\n  locator `svg, :text('budget')` matches and exposes the standard\n  filter form (types / focus / depth / link_types / limit) so users\n  can scope the view without editing URLs.\n- Per-request override via ?limit=NNN, clamped to [1, MAX_NODE_BUDGET].\n- Filtered views under the budget (?types=requirement,\n  ?focus=REQ-001&depth=2) continue to render SVG unchanged.\n\nPerf (release build, rivet dogfood dataset via serve_integration test):\n                                     before       after\n  GET /graph                         ~57s / ~1MB  ~1ms / 20KB\n  GET /graph?types=requirement       (filtered)   ~1ms / 44KB (SVG)\n  GET /graph?focus=REQ-001&depth=2   (filtered)   ~44ms / 67KB (SVG)\n\nThree new integration tests in serve_integration.rs lock in the\ninvariant: full graph stays under 5s and returns the budget message,\nfocused view still renders SVG, and ?limit=1 forces the budget path.\n\nImplements: REQ-007\n\n* feat(ple): feature model + variants for rivet itself (dogfooding #128)\n\nShip a feature model that describes the real variability in rivet:\ncompile-time cargo features, CLI deployment surfaces (cli / dashboard /\nLSP / MCP), built-in adapters, export formats, test-import formats, and\ninit presets. Every declared feature maps 1:1 to something grep-able in\nthe code: a cargo feature flag, a `rivet` subcommand, a format string\ndispatched by `export --format` / `import-results --format`, or an init\npreset in `resolve_preset()`.\n\nCloses the dogfooding gap for #128 — v0.4.0 shipped `rivet variant\ncheck`, but the rivet project itself had no feature model to feed it.\n\nFiles:\n  * artifacts/feature-model.yaml        — root feature tree + constraints\n  * artifacts/variants/minimal-ci.yaml  — default-features cargo build,\n                                          CLI-only deployment (what CI runs)\n  * artifacts/variants/full-desktop.yaml — every surface, every preset,\n                                           wasm + oslc cargo features on\n\nReal variability identified:\n  * yaml-backend alternative (rowan-yaml default, serde-yaml-only fallback)\n  * deployment-surface or-group (cli-only, dashboard, lsp-server, mcp-server)\n  * adapters or-group with cargo-feature constraints (implies oslc-client\n    feat-oslc; implies wasm-adapter feat-wasm)\n  * export-formats / test-import-formats / init-presets or-groups\n  * preset ↔ adapter constraints (preset-aadl implies aadl-adapter;\n    preset-stpa implies stpa-yaml-adapter)\n  * dashboard implies html-export (shared HTML pipeline)\n  * reqif-export implies reqif-adapter (shared reqif module)\n\nVerification (both variants pass):\n\n  $ rivet variant check --model artifacts/feature-model.yaml \\\n                        --variant artifacts/variants/minimal-ci.yaml\n  Variant 'minimal-ci': PASS\n  Effective features (40):\n    aadl-adapter, adapters, baselines, cli-only, commits, core,\n    coverage, deployment-surface, docs-cli, export-formats,\n    generic-yaml-adapter, generic-yaml-export, hooks-infra,\n    html-export, impact-analysis, init-presets, junit-adapter,\n    junit-import, matrix, mutations, needs-json-adapter,\n    needs-json-import, optional-cargo-features, preset-aadl,\n    preset-dev, preset-stpa, query, reqif-adapter, reqif-export,\n    rivet, rowan-yaml, schema-system, sexpr-language, snapshots,\n    stpa-yaml-adapter, test-import-formats, validate, variant-mgmt,\n    yaml-backend, zola-export\n\n  $ rivet variant check --model artifacts/feature-model.yaml \\\n                        --variant artifacts/variants/full-desktop.yaml\n  Variant 'full-desktop': PASS\n  Effective features (58):\n    ...minimal-ci set plus dashboard, lsp-server, mcp-server,\n    oslc-client, wasm-adapter, feat-oslc, feat-wasm, and all 14\n    init presets (aspice, stpa-ai, cybersecurity, eu-ai-act,\n    safety-case, do-178c, en-50128, iec-61508, iec-62304,\n    iso-pas-8800, sotif, plus the three in minimal-ci).\n\nNotes from reading the code:\n  * `rowan-yaml` cargo feature: default-on, with a `cfg(not(feature =\n    \"rowan-yaml\"))` fallback path in rivet-core/src/db.rs — so the\n    alternative group has two real arms, not one.\n  * `aadl` cargo feature: default-on. Modelled as a mandatory\n    (always-present) adapter since no real build disables it — not as\n    an optional-feature toggle.\n  * `oslc` and `wasm`: off-by-default cargo features, correctly\n    modelled as optional with implies-constraints from the adapters.\n  * `lsp-server`, `dashboard`, `mcp-server` are *not* behind cargo\n    features — they're always compiled in today. The variance is\n    runtime/deployment, not compile-time. Flagged this as a surprising\n    mismatch with the v0.4.0 narrative (where LSP/MCP are described as\n    optional deployment surfaces): they are, but only in the sense of\n    \"whether you launch that process\", not \"whether the code is in the\n    binary\".\n  * The rowan YAML parser rejects multi-line `#` comments between\n    mapping entries at the same indent (`expected mapping key, found\n    Some(Comment)`). Worked around by keeping single-line section\n    comments in feature-model.yaml; flagging this as a latent parser\n    bug worth a follow-up issue.\n\nRefs: #128\n\n* feat(audit): v0.4.0 artifacts, retroactive trailer map, Verus hard gate\n\nAddresses three gaps found in the post-v0.4.0 dogfooding audit.\n\n**v0.4.0 shipped-work artifacts** — `artifacts/v040-features.yaml` was\nlast touched 2026-04-12 and describes variant/PLE work (FEAT-106..114),\nnot the verification pyramid that actually shipped on 2026-04-19. New\nfile `artifacts/v040-verification.yaml` authors 4 design decisions\n(DD-052 four-layer verification pyramid, DD-053 suffix-based\nyaml-section matching, DD-054 non-blocking framing for formal CI\njobs, DD-055 cfg-gate platform syscalls), 8 features\n(FEAT-115..122 covering Kani 27-harness expansion, differential YAML\ntests, operation-sequence proptest, STPA-Sec suite, suffix-based UCA\nextraction, nested control-action extraction, Zola export, Windows\nsupport), and 1 requirement (REQ-060 cross-platform binaries).\nCounts were verified against the actual codebase — 27 `#[kani::proof]`\nattrs in proofs.rs, 6 differential tests, 16 STPA-Sec tests.\n\n**Retroactive trailer map** — extended `AGENTS.md` with three more\nlegacy orphans (51f2054a #126, f958a7ef, 75521b85 #44), a new v0.4.0\nPR-level section for #150/#151/#152/#153, and an honest\n\"genuinely-unmappable\" section calling out `ca97dd9f` (#95) whose\n`SC-EMBED-*` trailers point to artifacts that were never authored.\n\n**Verus Proofs → hard gate** — rules_verus PR #21 (merged as\n5bc96f39) fixes the hub-repo's ambiguous `:all` alias by emitting\nproper `toolchain()` wrappers per platform. Updates the git_override\npin from e2c1600a (Feb 2026, broken) to 5bc96f39 and removes\n`continue-on-error: true` from the Verus job.\n\nImplements: REQ-030, REQ-060\nRefs: DD-052, DD-053, DD-054, DD-055, FEAT-115, FEAT-116, FEAT-117, FEAT-118, FEAT-119, FEAT-120, FEAT-121, FEAT-122\nVerifies: REQ-030\n\n* fix(ci): honest feedback on first hard-gate run\n\nFirst run of the flipped hard gates exposed real issues:\n\n- **Kani**: `eval_context(artifact: &Artifact)` had an unused param after\n  the store-building refactor. cfg(kani) hid it from `cargo check`; CI's\n  `-D warnings` caught it. Prefixed with `_artifact`.\n\n- **Rocq**: Schema.v / Validation.v opened `string_scope` but used `++`\n  on `Store` (a list). Rocq 9.0.1 parses `++` in string_scope as\n  `String.append`, so `s ++ [a]` failed with \"s has type Store while\n  expected string\". Added `Open Scope list_scope.` after the string\n  open so list concatenation takes precedence. Neither file uses\n  string `++` so the scope swap is safe.\n\n- **Verus**: unblocked the `:all` alias bug via upstream rules_verus PR\n  (5bc96f39), but hit a deeper upstream issue — rules_rust 0.56.0\n  references `CcInfo` which has been removed from current Bazel. Needs\n  a rules_rust bump inside rules_verus before Verus can be a hard gate.\n  Reverted to `continue-on-error: true` with a pointer comment so this\n  is honestly signposted rather than silently advertised as shipped.\n\nMutation Testing rivet-cli passed on the first run. rivet-core still\nrunning. /graph budget works in CI (included in the same PR).\n\nImplements: REQ-030\n\n* fix(rocq): drop Open Scope string_scope, tag string literals\n\nThe `Open Scope string_scope.` at the top of Schema.v / Validation.v\nshadowed `length` (String.length vs List.length) and `++`\n(String.append vs List.app), breaking every Store operation once the\nproofs got compiled under Rocq 9.0.1.\n\nNeither file actually uses infix string operators — all string\nliterals are either passed to `String.eqb` or constructed with explicit\n`%string` tags. Drop the scope open; tag the one remaining bare\nliteral `\"broken-link\"` in Validation.v:120 with `%string`.\n\nExplanatory comment in both files so a future reader doesn't reopen\nstring_scope and re-break this.\n\n* fix(rocq): fully qualify List.length in proofs\n\nWith `Require Import Coq.Strings.String` after `Coq.Lists.List`, the\nbare identifier `length` resolves to `String.length` (the latest\nimport wins), so `length s` with `s : Store` fails to typecheck.\n\nQualify every `length` call against a list as `List.length` so name\nresolution cannot drift. Five call sites across Schema.v / Validation.v.\n\n* fix(rocq): apply -> eapply reach_direct for constructor with implicit lk\n\n`reach_direct` has a forall-bound `lk : LinkKind` that isn't surfaced\nin the goal after `apply`. Rocq 9.0.1 refuses the implicit instantiation\nthat older versions allowed, fails with \"Unable to find an instance for\nthe variable lk\". Using `eapply` creates a metavariable that unifies\nwhen the inner `exact Hl1_kind` step substitutes the real link kind.\n\n* fix(rocq): admit vmodel_chain_two_steps honestly (real proof gap)\n\nThe `apply reach_direct` + `eapply reach_direct` routes both fail under\nRocq 9.0.1 because the proof has an actual hole: `t1` (the link target\nartifact introduced by destructing `artifact_satisfies_rule`) is not\nthe same as `a2` (the caller-supplied intermediate). The goal after\nthe link-wiring step reduces to `link_target l1 = art_id a2`, but we\nonly have `art_id t1 = link_target l1` — nothing ties `t1` to `a2`.\n\nRather than write around the gap with tactics that wouldn't hold, mark\nthe theorem `Admitted.` with an explicit comment describing what the\ncorrect strengthening would look like. All other theorems in\nSchema.v / Validation.v remain Qed'd.\n\nThis lets the Rocq hard gate actually compile and enforce the proofs\nwe DO have, rather than hiding a stale semantic break behind a tactic\nthat just happened to typecheck on older Rocq.\n\n* fix(ci): honest gate status after first real run\n\nThe first hard-gate run surfaced issues deeper than one-line fixes.\nThis commit restores honesty rather than hiding them:\n\n**Hard gates that stay on:**\n- Kani compile errors (`store: None`, `_artifact`) — fixed, but see below.\n- Rocq `Open Scope list_scope.` + `List.length` qualification + `eapply\n  reach_direct` — applied.\n- Mutation Testing (rivet-cli): 0 surviving mutants, hard gate.\n\n**Jobs moved back to continue-on-error with TODOs:**\n\n- **Kani**: 27-harness suite exceeded the 30-min CI budget and got\n  cancelled. Bumped timeout to 45 min and left continue-on-error on\n  until we scope the PR-sized subset vs nightly full suite.\n\n- **Rocq**: Rocq 9.0.1 is stricter than the version the proofs were\n  written against. Fixed three classes of errors; a fourth (`No such\n  contradiction` in a destructure) remains unfixed. Also\n  `vmodel_chain_two_steps` has a genuine proof gap (link target t1 ≠\n  caller's a2 without an extra hypothesis) and is now `Admitted.` with\n  an explicit note. Needs a systematic port pass before hard-gating.\n\n- **Mutation Testing (rivet-core)**: 3677 mutants, real surviving ones\n  in `collect_yaml_files` / `import_with_schema` (lib.rs:80,241,268)\n  and `bazel.rs::lex` (delete match arm `b'\\r'`). Those are actual\n  test coverage gaps. Hard-gating rivet-core means writing tests to\n  kill every one of them first; scoping that out of this PR.\n  rivet-cli mutation stays hard-gated per above.\n\n- **Verus**: still blocked on rules_rust 0.56 `CcInfo` removal upstream.\n\nThe goal of \"real hard gates\" was to stop advertising verification\nthat never ran green. Three checkpoints are now genuine (rivet-cli\nmutations, Kani compile-clean once unblocked, Rocq compile-clean once\nported). The rest have explicit follow-up notes in ci.yml pointing\nat what needs to happen before they flip.\n\n* ci(verus): flip to hard gate; bump rules_verus pin past CcInfo fix\n\nThe Verus job was marked continue-on-error because rules_verus's\nminimum rules_rust (0.56.0) used the Bazel built-in `CcInfo` symbol\nthat current Bazel has removed, so the module failed to load.\n\npulseengine/rules_verus@fc7b636 bumps the floor to 0.58.0 — the\nrelease where CcInfo is loaded from @rules_cc//cc/common:cc_info.bzl\ninstead. Bumping our pin past that commit unblocks the load and lets\nthe verus job run as a real gate.\n\nThe same pin range (5e2b7c6) also picks up three correctness fixes\nin verus-strip: backtick-escaped `verus!` in doc comments no longer\ntruncates output, `pub exec const` strips the `exec` keyword, and\ncontent after the `verus!{}` block is preserved.\n\nTrace: skip\n\n* fix(bazel): expose verus_specs.rs via rivet-core/src/BUILD.bazel\n\n//verus:rivet_specs_verify references `//rivet-core/src:verus_specs.rs`\nas a Bazel label, but rivet-core/src was not a Bazel package, so\n`bazel test` failed analysis with:\n\n  ERROR: no such package 'rivet-core/src': BUILD file not found\n\nAdds a minimal BUILD.bazel that marks the directory as a package and\nexports the verus specs file. The crate itself is still built via\ncargo — this file exists only so the Bazel-side Verus targets can\naddress the spec source.\n\nTrace: skip\n\n* refactor(bazel): unify repo into a single bzlmod workspace\n\nverus/ and proofs/rocq/ each had their own MODULE.bazel, which made\nevery Bazel label relative to those subdirectories. That broke\n//verus:rivet_specs_verify's attempt to reference\n//rivet-core/src:verus_specs.rs — the label resolved against the\nverus/ workspace root and demanded a `verus/rivet-core/src` directory\nthat doesn't exist, yielding:\n\n  ERROR: no such package 'rivet-core/src': BUILD file not found\n\nRoot cause was architectural. Consolidate into one workspace at the\nrepo root so cross-directory Bazel references work:\n\n- New top-level `MODULE.bazel` merges the two previous module\n  declarations (rules_verus + rules_rocq_rust + rules_nixpkgs_core,\n  same commit pins and same toolchain registrations).\n- New top-level `BUILD.bazel` as a minimal package marker.\n- Deleted `verus/MODULE.bazel` and `proofs/rocq/MODULE.bazel`.\n- CI: run `bazel test //verus:rivet_specs_verify` and\n  `bazel test //proofs/rocq:rivet_metamodel_test` from the repo root,\n  not `working-directory: verus|proofs/rocq`.\n\nThe Rust crates are still built via cargo. Bazel in this repo is\nscoped to the formal-verification targets only. With the unified\nworkspace, //verus:rivet_specs_verify can now reach\n//rivet-core/src:verus_specs.rs which is the precondition for the\nVerus hard gate to do real work.\n\nTrace: skip\n\n* fix(ci): install Nix on Verus runner too\n\nWorkspace consolidation (6771e6e) means root MODULE.bazel registers\nboth Verus and Rocq toolchains. Bazel resolves every registered\ntoolchain at analysis time regardless of which target is being built,\nso the Verus-only job now hits the Rocq toolchain extension, which\nrequires rules_nixpkgs_core, which requires nix-build on PATH:\n\n  ERROR: An error occurred during the fetch of repository\n    'rules_rocq_rust++rocq+rocq_toolchains': Platform is not supported:\n    nix-build not found in PATH.\n\nInstall Nix on the Verus runner too. Small cost (~30s) on a job that\nalready takes 20 min, and it's the minimal fix — alternatives (split\nMODULE.bazel, or rules_nixpkgs_core fail_not_supported) either undo\nthe consolidation or require upstream changes.\n\nTrace: skip\n\n* ci(verus): soft-gate again — toolchain works, specs fail\n\nWorkspace hoist + Nix install fixed the plumbing: Verus now analyses\n//verus:rivet_specs_verify against //rivet-core/src:verus_specs.rs and\ninvokes rust_verify. But the specs themselves fail verification in 0.1s\n— a real SMT proof obligation can't be discharged. That's spec-level\nwork (audit which `requires`/`ensures` clauses are wrong) and doesn't\nbelong in this CI-hard-gate PR. Soft-gate until the spec fixes land.\n\nTrace: skip",
          "timestamp": "2026-04-21T23:05:28-05:00",
          "tree_id": "37cb9b4280f8e6812d4a6c736b19d4bf3c2010b7",
          "url": "https://github.com/pulseengine/rivet/commit/2fafe1a574e590671b21e9fce42b4a76db88ef70"
        },
        "date": 1776831096617,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 63420,
            "range": "± 225",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 678487,
            "range": "± 6153",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 10919758,
            "range": "± 667589",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1482,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 18377,
            "range": "± 35",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 269456,
            "range": "± 1380",
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
            "value": 778867,
            "range": "± 8653",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 127731,
            "range": "± 591",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1487602,
            "range": "± 11779",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 23876175,
            "range": "± 1828586",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 83361,
            "range": "± 401",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 736705,
            "range": "± 4109",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 9182847,
            "range": "± 548001",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3283,
            "range": "± 20",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 34852,
            "range": "± 112",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 564717,
            "range": "± 4408",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 45470,
            "range": "± 175",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 500593,
            "range": "± 3865",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 6107115,
            "range": "± 365890",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 564,
            "range": "± 13",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 5187,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 69446,
            "range": "± 4127",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 16784,
            "range": "± 24",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 114429,
            "range": "± 307",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1056989,
            "range": "± 13193",
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
          "id": "89d3f43a3a62fd9064e2525c749b545bcdeb5561",
          "message": "fix(mcp): scope `set_fields` to domain fields, add top-level `description` setter (#158)\n\nTwo related MCP correctness bugs in `rivet_modify`:\n\n1. `set_fields` silently wrote reserved top-level keys (description, title,\n   status, ...) under the `fields:` sub-map — corrupting the artifact's\n   shape. Values containing backticks or newlines additionally broke the\n   YAML emitter, which used unquoted `format!(\"{key}: {value}\")` lines.\n\n2. There was no way to set the top-level `description` (or other top-level\n   metadata) via MCP — `set_fields` was the only \"generic setter\" and, by\n   design, targets only the domain `fields:` map.\n\nDesign: keep `set_fields` scoped to the `fields:` sub-map and expose\ndedicated setters for top-level metadata. `validate_modify` now rejects\nany `set_fields` key listed in `RESERVED_TOP_LEVEL_KEYS` (id, type, title,\ndescription, status, tags, links, fields, provenance, source-file) with a\nhint pointing at the right parameter. A new `description` parameter on\n`rivet_modify` routes through `ModifyParams::set_description`, which\nemits YAML-safe scalars — multi-line values become block-literal (`|-`)\nscalars, single-line values with YAML-significant characters are\ndouble-quoted with proper escapes. `set_field` in the editor was extended\nto splice multi-line values into the line buffer so block scalars stay\nwell-formed.\n\nTests (added failing first, now green):\n- `test_set_fields_rejects_reserved_description` / `_all_reserved_top_level_keys`\n- `test_modify_sets_top_level_description`\n- `test_modify_description_with_backticks_and_newlines`\n- `test_validate_modify_rejects_reserved_top_level_in_set_fields`\n- `test_yaml_quote_inline_scalar_*`, `test_set_field_writes_*_as_*_scalar`\n\nFixes: REQ-002",
          "timestamp": "2026-04-21T23:19:27-05:00",
          "tree_id": "dfb096793ec21444231ff321ed322a7b687df5eb",
          "url": "https://github.com/pulseengine/rivet/commit/89d3f43a3a62fd9064e2525c749b545bcdeb5561"
        },
        "date": 1776832820358,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 80336,
            "range": "± 1017",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 849054,
            "range": "± 7484",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 15313804,
            "range": "± 1255864",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2213,
            "range": "± 38",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 27200,
            "range": "± 82",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 369616,
            "range": "± 3269",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 95,
            "range": "± 3",
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
            "value": 1005444,
            "range": "± 78912",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 164581,
            "range": "± 897",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1921622,
            "range": "± 26375",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 31923170,
            "range": "± 3528317",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 111286,
            "range": "± 863",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 947408,
            "range": "± 7923",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 14414540,
            "range": "± 1284581",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4283,
            "range": "± 28",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 59889,
            "range": "± 520",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 768291,
            "range": "± 23699",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 62244,
            "range": "± 280",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 698236,
            "range": "± 2942",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 9298941,
            "range": "± 909588",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 812,
            "range": "± 9",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7518,
            "range": "± 90",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 109298,
            "range": "± 621",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23269,
            "range": "± 138",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 165942,
            "range": "± 1521",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1532476,
            "range": "± 21741",
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
          "id": "571816f0fb78743a0654de158ec8f137e646fe96",
          "message": "fix(serve): Cmd+K search URL persistence + embed discoverability design (#159)\n\n* fix(serve): persist Cmd+K search term in URL so reload preserves it\n\nThe Cmd+K overlay used vanilla fetch() with no history write, so a page\nreload (Cmd+R) silently dropped any in-flight search. Now we sync the\ncurrent query into the URL via history.replaceState as ?cmdk=...; on\nload, if ?cmdk= is present we re-open the overlay pre-filled with the\nsaved term and re-run the search. Using cmdk (not q) avoids colliding\nwith the existing /artifacts?q=... filter-bar state.\n\nThe /artifacts filter-bar search input was already wired with\nhx-push-url=\"true\" via components::search_input — this change adds a\nregression test asserting that typing into it updates the URL and the\nvalue survives a reload.\n\nFixes: REQ-007\n\n* docs(design): embed discoverability, {{query:...}} MVP, mermaid, rivet query\n\nDesign note only — no code changes. Covers four UX gaps reported from\ndogfooding in a single note so the trade-offs are visible side-by-side:\n\n1. Mermaid in artifact descriptions (one-function fix in markdown.rs).\n2. {{query:<sexpr>}} embed — reuses existing sexpr_eval; read-only MVP.\n3. rivet docs embeds + table-driven registry for resolve_embed.\n4. rivet query CLI — thin mirror of MCP's rivet_query.\n\nEach section cites exact file paths and line numbers where changes\nwould land. Ends with a priority-ordered recommendation table so the\nimplementation sequence is unambiguous.\n\nExempt type: docs (no trailer required).",
          "timestamp": "2026-04-21T23:19:53-05:00",
          "tree_id": "25c3b523bb50ae55c0ba073b29386a56b5465d79",
          "url": "https://github.com/pulseengine/rivet/commit/571816f0fb78743a0654de158ec8f137e646fe96"
        },
        "date": 1776834397075,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 65346,
            "range": "± 499",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 702590,
            "range": "± 3980",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 10122271,
            "range": "± 362822",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1475,
            "range": "± 9",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 18463,
            "range": "± 37",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 265125,
            "range": "± 1804",
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
            "value": 769017,
            "range": "± 2168",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 129223,
            "range": "± 877",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1472888,
            "range": "± 15526",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 21156466,
            "range": "± 311145",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 83228,
            "range": "± 360",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 732151,
            "range": "± 3463",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 8385718,
            "range": "± 139945",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3199,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 34614,
            "range": "± 355",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 560685,
            "range": "± 6804",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 47444,
            "range": "± 80",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 515789,
            "range": "± 2510",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 6011153,
            "range": "± 47701",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 568,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 5042,
            "range": "± 10",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 69334,
            "range": "± 172",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 16739,
            "range": "± 69",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 117089,
            "range": "± 327",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1082997,
            "range": "± 5475",
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
          "id": "19e8cbaf984b0dde6231a6b9e3a84339b1d0ea9b",
          "message": "test(fuzz): YAML footgun + CLI argv + artifact-id fuzzers (#160)\n\nAdds three libfuzzer-based targets under fuzz/ that empirically measure\nthe arxiv:2604.13108 \"YAML silently corrupts ~50% of structural errors\"\nclaim against rivet's actual artifact-ingest pipeline, plus a CLI argv\ntarget and an id-roundtrip target.\n\nTargets:\n  * yaml_footguns  — Arbitrary-driven adversarial mutations of a known\n    valid seed YAML (Norway, version-coercion, leading-zero-id,\n    unquoted-date, duplicate-key, tab-indent, multi-doc, null-shorthand\n    link, unknown top-level key, anchor cycle, deep nesting, control\n    chars in id).  Five oracles: source-substring invariant for ids /\n    types / link targets, phantom-link detection, null-ish target\n    detection, serde-rejected-but-hir-accepted detection, and\n    multi-document truncation detection.\n  * cli_argv      — structured argv for rivet-cli subprocess; oracle\n    fails on signal-death or when --format json returns success with\n    non-JSON stdout.  Gated on $RIVET_BIN env var so it skips silently\n    if no binary is configured.\n  * artifact_ids  — arbitrary bytes as id: scalar; oracle requires\n    Store::insert → Store::get to round-trip byte-exact.\n\nAlso adds fuzz/examples/oracle_smoke.rs — a non-libfuzzer harness that\nruns the same oracle logic against a fixed set of Mythos-predicted\nfootgun inputs.  Running `cargo run --release --example oracle_smoke`\n(before cargo-fuzz is available in CI) produces five findings on\ncurrent main, empirically confirming:\n  - null / tilde / empty-string link targets produce phantom links\n    (yaml_hir.rs:530-549 bug class)\n  - multi-document YAML is silently truncated by the HIR path\n    (yaml_cst.rs:517 bug class)\n  - renaming `artifacts:` to a sibling key causes the HIR path to\n    return Ok(vec![]) with zero diagnostics (formats/generic.rs:138)\n\nCI: .github/workflows/fuzz.yml runs each target for 15 min on push to\nmain and nightly at 06:17 UTC.  continue-on-error so new crashes do\nnot block merges; crashes upload as workflow artifacts and the evolved\ncorpus is cached between runs.\n\nREQ-052 is scoped to variant-solver fuzzing; these YAML/CLI fuzzers\nverify the broader parser surface (REQ-028) and CLI surface (REQ-007).\n\nVerifies: REQ-028, REQ-007\nRefs: REQ-052\n\nCo-authored-by: Claude Opus 4.7 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-04-21T23:20:17-05:00",
          "tree_id": "5d37a010efdba2cd47e9bb3a3e359c75b427f843",
          "url": "https://github.com/pulseengine/rivet/commit/19e8cbaf984b0dde6231a6b9e3a84339b1d0ea9b"
        },
        "date": 1776835179633,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 80194,
            "range": "± 499",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 842530,
            "range": "± 2776",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 11123083,
            "range": "± 445104",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2219,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25826,
            "range": "± 283",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 353885,
            "range": "± 2665",
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
            "value": 1004683,
            "range": "± 29116",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 161978,
            "range": "± 788",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1872259,
            "range": "± 10819",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 24319952,
            "range": "± 2834191",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 113094,
            "range": "± 608",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 961908,
            "range": "± 2646",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 9675462,
            "range": "± 271441",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4221,
            "range": "± 9",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 59847,
            "range": "± 274",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 755355,
            "range": "± 2622",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 62423,
            "range": "± 370",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 706328,
            "range": "± 3634",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7822420,
            "range": "± 62398",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 824,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7065,
            "range": "± 97",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 126662,
            "range": "± 1774",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23424,
            "range": "± 125",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 165154,
            "range": "± 2348",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1526304,
            "range": "± 10820",
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
          "id": "1dc7457329fa1ece43c23395f4888bddd5f4bac1",
          "message": "docs: CLI gap synthesis from 37-module artifact walk (2026-04) (#161)\n\nDesign proposal only — captures five missing rivet features surfaced by a\n3,400-artifact reporting-project session (discover/scan, add --from-source,\ngaps --suggest, schema path type, JUnit artifact generation) plus a ranked\nbacklog of 10 improvements. File-path anchors verified against the current\nrivet-cli and rivet-core trees.\n\nRefs: FEAT-001",
          "timestamp": "2026-04-21T23:20:36-05:00",
          "tree_id": "8037f48b480f697d8938cb561cc1d46fc6c8a259",
          "url": "https://github.com/pulseengine/rivet/commit/1dc7457329fa1ece43c23395f4888bddd5f4bac1"
        },
        "date": 1776835694105,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 81458,
            "range": "± 9651",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 846654,
            "range": "± 2714",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12806718,
            "range": "± 891902",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2113,
            "range": "± 20",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26761,
            "range": "± 148",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 369141,
            "range": "± 5043",
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
            "value": 999244,
            "range": "± 30544",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 160566,
            "range": "± 2500",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1861538,
            "range": "± 12200",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 24443913,
            "range": "± 1413500",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 111442,
            "range": "± 682",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 955822,
            "range": "± 21871",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 10834171,
            "range": "± 816671",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4233,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 59650,
            "range": "± 3151",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 771760,
            "range": "± 2572",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 61936,
            "range": "± 1644",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 696407,
            "range": "± 3404",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7858152,
            "range": "± 303969",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 820,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7388,
            "range": "± 29",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 125990,
            "range": "± 844",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23085,
            "range": "± 159",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 166594,
            "range": "± 11640",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1528161,
            "range": "± 21452",
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
          "id": "d1436631c3169d66884423dba7d3a2a11bd5d4a8",
          "message": "docs: design plan for s-expression as a second artifact format (#162)\n\nConcrete, cost-estimated design doc covering four scope options (A: export-\nonly, B: read-only import, C: full bidirectional, D: replace YAML) with\nverified LoC-based effort estimates drawn from reading the existing\nrivet-core and rivet-cli sources.\n\nRecommendation: Option A gated on YAML fuzzer results. Option C is\n40-60 person-days up front plus ~20%/yr dual-path maintenance and is\nnot justified on current evidence.\n\nRefs: #128\nRefs: DD-048",
          "timestamp": "2026-04-21T23:20:55-05:00",
          "tree_id": "e8b4c01ca21b43c9889b20df65fab8dca7f65d27",
          "url": "https://github.com/pulseengine/rivet/commit/d1436631c3169d66884423dba7d3a2a11bd5d4a8"
        },
        "date": 1776836045038,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 79982,
            "range": "± 888",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 839630,
            "range": "± 8358",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 11276757,
            "range": "± 1030452",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2107,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26633,
            "range": "± 106",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 356745,
            "range": "± 1466",
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
            "value": 994408,
            "range": "± 13010",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 162775,
            "range": "± 1459",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1883513,
            "range": "± 6999",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 23169455,
            "range": "± 576686",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 110328,
            "range": "± 2018",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 959203,
            "range": "± 10295",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 9752049,
            "range": "± 334330",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4240,
            "range": "± 10",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 63072,
            "range": "± 306",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 761548,
            "range": "± 2351",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 62410,
            "range": "± 785",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 690786,
            "range": "± 10086",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7589085,
            "range": "± 61781",
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
            "value": 7331,
            "range": "± 30",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 112603,
            "range": "± 636",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22907,
            "range": "± 285",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 164616,
            "range": "± 1020",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1530371,
            "range": "± 9994",
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
          "id": "deeafeb16473e54701fa2f5e6d0e8697b7322f1e",
          "message": "feat(release): attach VSIX to GitHub Release + fix Marketplace publish (#163)\n\nTwo related bugs in the VS Code extension release flow:\n\n1. **VSIX wasn't attached to the GitHub Release.** The `build-vsix` job\n   in ci.yml ran on tag push and uploaded the VSIX as a workflow artifact\n   only — users couldn't download it from the Release page, they had to\n   dig through the Actions tab.\n\n2. **`publish-vsix` never actually ran on Marketplace.** It was gated on\n   `needs: [build-vsix, release-results]`, but `release-results` doesn't\n   exist as a job in ci.yml (it lives in release.yml, a separate\n   workflow — GitHub Actions workflows can't depend on each other's\n   jobs). Result: the Marketplace publish job was never scheduled on\n   any tag, which is why only the spar extension currently appears on\n   the Marketplace — rivet's has never actually shipped.\n\n**Fix:** move both jobs into release.yml where they belong, wire them\ninto the existing tag-triggered pipeline:\n\n- `build-vsix` → runs alongside `build-binaries`\n- `create-release` → now depends on build-vsix too, and globs `*.vsix`\n  in the asset collection step so the VSIX attaches to the Release\n- `publish-vsix-marketplace` → runs after create-release so the VSIX\n  is guaranteed on the Release page even if Marketplace publish fails.\n  Now prints a `::warning::` if VSCE_PAT is unset instead of silently\n  skipping, which is what hid the \"extension isn't on Marketplace\" bug\n  in the first place.\n\nAlso bumps `vscode-rivet/package.json` version from 0.3.0 → 0.4.0 so\nthe next released extension matches the workspace version.\n\n**Follow-up for the user:** configure the VSCE_PAT secret in the rivet\nrepo settings (Azure DevOps PAT with Marketplace > Manage scope).\nWithout it the warning will continue to fire on every release until\nconfigured.\n\nTrace: skip",
          "timestamp": "2026-04-21T23:21:13-05:00",
          "tree_id": "ccc41c25b53dfa8c94f5cd1cffea999fc02dadbd",
          "url": "https://github.com/pulseengine/rivet/commit/deeafeb16473e54701fa2f5e6d0e8697b7322f1e"
        },
        "date": 1776836730971,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 82128,
            "range": "± 487",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 873304,
            "range": "± 13392",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 16311756,
            "range": "± 1279198",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1939,
            "range": "± 19",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24951,
            "range": "± 544",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 357835,
            "range": "± 2772",
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
            "value": 989817,
            "range": "± 7591",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 166897,
            "range": "± 19183",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1948415,
            "range": "± 24378",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 37335205,
            "range": "± 3066873",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 107678,
            "range": "± 676",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 959445,
            "range": "± 4250",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 14241292,
            "range": "± 1105556",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4126,
            "range": "± 10",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 45303,
            "range": "± 1971",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 747588,
            "range": "± 17744",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 63878,
            "range": "± 194",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 705852,
            "range": "± 17259",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 9238906,
            "range": "± 313142",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 767,
            "range": "± 10",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 6954,
            "range": "± 28",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 92088,
            "range": "± 1491",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21917,
            "range": "± 313",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 151688,
            "range": "± 1334",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1404931,
            "range": "± 8019",
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
          "id": "8d7ad955f67da3dadedc959b077693bcb1d00f07",
          "message": "docs: add ISO 26262 artifact mapping and gap analysis (#164)\n\nEnumerates ~40 ISO 26262:2018 work products (parts 3-9), maps each to\nrivet's current schemas (common, stpa, iec-61508, aspice, score,\nsafety-case, iso-pas-8800), and records the gaps that block an honest\nclaim of \"ISO 26262 support\". 32.5% EXACT, 42.5% APPROX, 25% ABSENT.\nTop gaps: ASIL decomposition, FMEDA with SPFM/LFM/PMHF, item definition\nwith S/E/C-driven HARA, HSI specification, tool confidence TCL matrix.\n\nThis is gap analysis only — no schemas are proposed or implemented.\n\nRefs: REQ-010, FEAT-001\n\nCo-authored-by: Claude Opus 4.7 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-04-21T23:21:25-05:00",
          "tree_id": "af777b92671ac4cb7c8106b4327313beb3cce83c",
          "url": "https://github.com/pulseengine/rivet/commit/8d7ad955f67da3dadedc959b077693bcb1d00f07"
        },
        "date": 1776836922915,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 80729,
            "range": "± 836",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 863038,
            "range": "± 7858",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12858393,
            "range": "± 617901",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1923,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24867,
            "range": "± 49",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 360238,
            "range": "± 9430",
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
            "value": 96,
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
            "value": 991632,
            "range": "± 12862",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 169795,
            "range": "± 2729",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1958325,
            "range": "± 15166",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 28638379,
            "range": "± 2486099",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 109201,
            "range": "± 884",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 970272,
            "range": "± 24673",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 10961025,
            "range": "± 270824",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4172,
            "range": "± 16",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 45740,
            "range": "± 1046",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 742657,
            "range": "± 7492",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 58785,
            "range": "± 198",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 719484,
            "range": "± 2442",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8078543,
            "range": "± 310142",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 772,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 6904,
            "range": "± 65",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 90552,
            "range": "± 469",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21630,
            "range": "± 111",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 151425,
            "range": "± 3371",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1396101,
            "range": "± 16811",
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
          "id": "0dbf10ce5d9371506d48c3b9a520cf19f3fda938",
          "message": "build(npm): add @pulseengine/rivet distribution (#166)\n\nAdds npm distribution machinery so rivet can be installed/run via\n`npx @pulseengine/rivet` and registered with Claude Code as an MCP server.\n\nPattern follows pulseengine/template-mcp-server:\n- Root package (`npm/`) uses per-platform optionalDependencies\n  - index.js resolves the correct platform package for the current OS/arch\n  - run.js spawns the resolved binary, forwarding argv/stdio/signals\n  - install.js is idempotent: no-op when platform package resolved, else\n    downloads the archive from the GitHub Release as a fallback\n- Five platform packages under `platform-packages/` (darwin-arm64,\n  darwin-x64, linux-arm64, linux-x64, win32-x64) — each ships a single\n  pre-built binary at publish time (gitignored in source)\n- `release-npm.yml` triggers on `release: published`, downloads the\n  archives produced by `release.yml`, assembles + publishes each platform\n  package, then publishes the root package last so optionalDependencies\n  resolve on first install\n\nDoes not modify release.yml; consumes its artifacts via the release event.\n\nTrace: skip",
          "timestamp": "2026-04-21T23:21:33-05:00",
          "tree_id": "47051f1d6443666dbc4c29e076f678b92cc6801b",
          "url": "https://github.com/pulseengine/rivet/commit/0dbf10ce5d9371506d48c3b9a520cf19f3fda938"
        },
        "date": 1776837018559,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 80408,
            "range": "± 253",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 845732,
            "range": "± 22065",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12414144,
            "range": "± 920339",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2406,
            "range": "± 11",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26302,
            "range": "± 174",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 374972,
            "range": "± 1987",
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
            "value": 1004034,
            "range": "± 21061",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 165173,
            "range": "± 475",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1915626,
            "range": "± 10797",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 26631897,
            "range": "± 1661262",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 111908,
            "range": "± 952",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 953927,
            "range": "± 5731",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 11331299,
            "range": "± 718090",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4418,
            "range": "± 21",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 61036,
            "range": "± 479",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 780951,
            "range": "± 6113",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 63378,
            "range": "± 297",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 693022,
            "range": "± 2909",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7770007,
            "range": "± 161304",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 803,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7618,
            "range": "± 33",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 111853,
            "range": "± 566",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23032,
            "range": "± 176",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 165251,
            "range": "± 649",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1523531,
            "range": "± 18306",
            "unit": "ns/iter"
          }
        ]
      }
    ]
  }
}