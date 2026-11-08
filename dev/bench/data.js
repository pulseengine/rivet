window.BENCHMARK_DATA = {
  "lastUpdate": 1794172151770,
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
          "id": "5610a683d927b14d304dce1994bc39b3d759fef9",
          "message": "chore(dependabot): group version-locked families + github-actions into one PR each (fixed groups key) (#1155)\n\n* chore(dependabot): group version-locked families and all github-actions pins into one PR each\n\nAdds top-level groups: rules (wasm-tools-family, wasmtime, github-actions-all)\nso one upstream release no longer splits into one PR per directory — the\npattern that produced 4-8 PRs per release on loom, witness, mcp, relay and\nrules_wasm_component.\n\n* fix(dependabot): drop package-ecosystem from the actions group — groups cannot be ecosystem-scoped",
          "timestamp": "2026-11-02T08:01:39Z",
          "tree_id": "497ac5614e5aad266428cc5484cceb28dec3f4fc",
          "url": "https://github.com/pulseengine/rivet/commit/5610a683d927b14d304dce1994bc39b3d759fef9"
        },
        "date": 1793617165988,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85977,
            "range": "± 4043",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 864229,
            "range": "± 7246",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 15102689,
            "range": "± 865550",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2159,
            "range": "± 11",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25882,
            "range": "± 128",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 414399,
            "range": "± 4348",
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
            "value": 1902230,
            "range": "± 14532",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 164288,
            "range": "± 869",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1812111,
            "range": "± 11342",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 29588721,
            "range": "± 1496297",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 747182,
            "range": "± 6899",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 18868392,
            "range": "± 321425",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1354667242,
            "range": "± 14024443",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4781,
            "range": "± 17",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 67829,
            "range": "± 698",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 906762,
            "range": "± 10710",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 58750,
            "range": "± 237",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 690217,
            "range": "± 4684",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 9489905,
            "range": "± 565466",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1085,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15565,
            "range": "± 82",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 387548,
            "range": "± 7837",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 24064,
            "range": "± 223",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 160669,
            "range": "± 482",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1507947,
            "range": "± 19914",
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
          "id": "f92b92517c130f2f24a750bfc49409aa1c8522e5",
          "message": "chore(deps): bump wasmtime and wasmtime-wasi to 48.0.8 (RUSTSEC-2026-0420, -0422, -0423, -0424) (#1162)\n\nLockfile moves the whole wasmtime/cranelift/pulley/wiggle family to the\n48.0.8 / 0.135.8 patch releases; the Cargo.toml floor is raised to 48.0.8 so\nthe vulnerable releases cannot be resolved again. supply-chain/imports.lock\nis refreshed by cargo vet.\n\n\nClaude-Session: https://claude.ai/code/session_01G5qpB7zvxLvdrvn5YRyj4R\n\nCo-authored-by: Claude Opus 5.5 <noreply@anthropic.com>",
          "timestamp": "2026-11-05T01:28:37Z",
          "tree_id": "dd023bb5b886736a6f9b13403096c2808ead9782",
          "url": "https://github.com/pulseengine/rivet/commit/f92b92517c130f2f24a750bfc49409aa1c8522e5"
        },
        "date": 1793847453432,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85592,
            "range": "± 3730",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 857008,
            "range": "± 7619",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 15297836,
            "range": "± 900463",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2140,
            "range": "± 13",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 27020,
            "range": "± 4047",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 404834,
            "range": "± 3466",
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
            "value": 1924294,
            "range": "± 25205",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 163577,
            "range": "± 523",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1809350,
            "range": "± 17243",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 29316514,
            "range": "± 1659751",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 730888,
            "range": "± 2954",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 18240542,
            "range": "± 640465",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1348900240,
            "range": "± 14838895",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4825,
            "range": "± 63",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 64929,
            "range": "± 348",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 885433,
            "range": "± 24699",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 60328,
            "range": "± 168",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 701890,
            "range": "± 6871",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8546427,
            "range": "± 1022433",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1063,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15336,
            "range": "± 61",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 367861,
            "range": "± 2279",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23903,
            "range": "± 163",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 161559,
            "range": "± 463",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1498498,
            "range": "± 14816",
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
          "id": "ae24bf50ac9339ec8950890216c30ffc7946ea70",
          "message": "refactor(cli): move export, coverage and verify commands out of main.rs into cmd/ (#1143, groups 1–3) (#1158)\n\n* refactor(cli): move export commands from main.rs into cmd/export.rs\n\nPure move, no behaviour change. First group of the main.rs split\nproposed in #1143 (Fix hotspot, REQ-409).\n\nRefs: REQ-007, REQ-409, #1143\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_01KEjmjbmyALcg68cofRoWVp\n\n* refactor(cli): move coverage commands from main.rs into cmd/coverage.rs\n\nPure move, no behaviour change. Second group of the main.rs split\nproposed in #1143 (Fix hotspot, REQ-409).\n\nRefs: REQ-007, REQ-409, #1143\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_01KEjmjbmyALcg68cofRoWVp\n\n* refactor(cli): move verify commands from main.rs into cmd/verify.rs\n\nPure move, no behaviour change. Third group of the main.rs split\nproposed in #1143 (Fix hotspot, REQ-409).\n\nRefs: REQ-007, REQ-409, #1143\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_01KEjmjbmyALcg68cofRoWVp\n\n---------\n\nCo-authored-by: Claude <noreply@anthropic.com>",
          "timestamp": "2026-11-05T05:21:38Z",
          "tree_id": "dc1e433d85486f59e8bc6e3cba9bf063c4d1be84",
          "url": "https://github.com/pulseengine/rivet/commit/ae24bf50ac9339ec8950890216c30ffc7946ea70"
        },
        "date": 1793865757170,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85952,
            "range": "± 1309",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 858584,
            "range": "± 6147",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 15418383,
            "range": "± 482106",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2126,
            "range": "± 21",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25110,
            "range": "± 155",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 398814,
            "range": "± 2775",
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
            "value": 1940686,
            "range": "± 28019",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 163265,
            "range": "± 606",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1832577,
            "range": "± 21382",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 31057556,
            "range": "± 809414",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 744311,
            "range": "± 4273",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 17913432,
            "range": "± 422195",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1355617586,
            "range": "± 15767572",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4820,
            "range": "± 23",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 68866,
            "range": "± 475",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 904004,
            "range": "± 10681",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 59274,
            "range": "± 262",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 692516,
            "range": "± 8135",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 12105127,
            "range": "± 1077070",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1109,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15588,
            "range": "± 68",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 374440,
            "range": "± 2427",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23962,
            "range": "± 2232",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 160980,
            "range": "± 409",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1508881,
            "range": "± 20199",
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
          "id": "4b7998a1e8e8f4927dadf7f77b84863eb7415077",
          "message": "ci(dependabot): make the config parse again — no YAML aliases, groups inside their updates entries (#1156)\n\n#1155 put `groups:` at the top level of .github/dependabot.yml. The\ndependabot-2.0 schema allows only version, enable-beta-ecosystems,\nupdates, registries and multi-ecosystem-groups there (additionalProperties\nfalse), so main's file fails validation with \"'groups' was unexpected\".\n\nDependabot itself rejects the file for a second reason: \"YAML aliases\nare not supported\". The `labels: &ref_0` / `*ref_0` anchor has been in\nthe file since #216 (2026-05-10), so Dependabot has not been able to\nparse this config since then; the repo has no Dependabot PRs at all.\nThe labels list is now written out on each entry.\n\nEach group now sits in the entry whose packages it names:\n- github-actions-all on the github-actions entry, pattern \"*\". The old\n  \"^[^@]+/\" was a regex; dependabot patterns are globs.\n- wasm-tools-family and wasmtime on cargo. The five cargo directories\n  become one entry with `directories:`, so a grouped release opens one PR\n  and not one per directory, which is what the file's header comment asks\n  for.\n\nThe npm entries are unchanged. Supersedes the earlier attempt on this\nbranch, which nested all three groups under github-actions, where the two\ncargo groups could never match.\n\nConfirmed against json.schemastore.org/dependabot-2.0.json with\njsonschema, plus a scan for anchor and alias tokens (yaml.safe_load\nexpands them silently): main's file fails both, this one passes both.\nThe authoritative check is Dependabot's own \".github/dependabot.yml\"\ncheck run on this PR.\n\n\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9\n\nCo-authored-by: Claude Opus 5.5 <noreply@anthropic.com>",
          "timestamp": "2026-11-07T06:19:48Z",
          "tree_id": "de602205ea62e86cc12af160aaffe8afc02ecc3f",
          "url": "https://github.com/pulseengine/rivet/commit/4b7998a1e8e8f4927dadf7f77b84863eb7415077"
        },
        "date": 1794034846398,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 51019,
            "range": "± 624",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 593214,
            "range": "± 3154",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 10287807,
            "range": "± 309848",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1075,
            "range": "± 14",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 12788,
            "range": "± 83",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 240002,
            "range": "± 1877",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 48,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/1000",
            "value": 48,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 48,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1269251,
            "range": "± 46694",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 115953,
            "range": "± 3182",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1312984,
            "range": "± 20347",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 16948478,
            "range": "± 670351",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 445202,
            "range": "± 2512",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 10427756,
            "range": "± 427755",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 695125772,
            "range": "± 13548856",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3051,
            "range": "± 48",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 32444,
            "range": "± 159",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 479454,
            "range": "± 7255",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 34439,
            "range": "± 405",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 374573,
            "range": "± 2555",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 4455843,
            "range": "± 88198",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 516,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7404,
            "range": "± 81",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 131722,
            "range": "± 2040",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 13572,
            "range": "± 92",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 91779,
            "range": "± 933",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 852855,
            "range": "± 12631",
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
          "id": "1a3367d9f9401cb85c65b1c9c6829ca31edb5b12",
          "message": "ci: pin all GitHub Actions to commit SHAs instead of tags (#1153)\n\nOrg rule: actions are referenced by SHA with the version as a comment\n(uses: owner/action@<sha> # vN), so a moved tag can never silently change\nwhat CI runs. Rewrites every tag-pinned uses: in .github/workflows.",
          "timestamp": "2026-11-07T06:33:20Z",
          "tree_id": "435caa646b4437bd43cc5de16e772dfa2417646f",
          "url": "https://github.com/pulseengine/rivet/commit/1a3367d9f9401cb85c65b1c9c6829ca31edb5b12"
        },
        "date": 1794041723800,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 86209,
            "range": "± 8978",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 856070,
            "range": "± 4071",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12956740,
            "range": "± 509693",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2130,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25254,
            "range": "± 73",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 418366,
            "range": "± 1888",
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
            "value": 1938851,
            "range": "± 22276",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 162397,
            "range": "± 1512",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1822306,
            "range": "± 17983",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 26764982,
            "range": "± 892242",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 758960,
            "range": "± 3602",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 20149264,
            "range": "± 123322",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1584843601,
            "range": "± 12605145",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4841,
            "range": "± 10",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 69281,
            "range": "± 336",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 916596,
            "range": "± 14284",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 58805,
            "range": "± 503",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 671920,
            "range": "± 2813",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7863979,
            "range": "± 233429",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1156,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15594,
            "range": "± 78",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 368217,
            "range": "± 1542",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 24903,
            "range": "± 671",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 172452,
            "range": "± 687",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1622372,
            "range": "± 17229",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "49699333+dependabot[bot]@users.noreply.github.com",
            "name": "dependabot[bot]",
            "username": "dependabot[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": false,
          "id": "44618e36d4654c9e719656c16594c16f369a6492",
          "message": "build(deps-dev): bump @types/node in /vscode-rivet (#1178)\n\nBumps [@types/node](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/HEAD/types/node) from 22.19.15 to 26.6.6.\n- [Release notes](https://github.com/DefinitelyTyped/DefinitelyTyped/releases)\n- [Commits](https://github.com/DefinitelyTyped/DefinitelyTyped/commits/HEAD/types/node)\n\n---\nupdated-dependencies:\n- dependency-name: \"@types/node\"\n  dependency-version: 26.6.6\n  dependency-type: direct:development\n  update-type: version-update:semver-major\n...\n\nSigned-off-by: dependabot[bot] <support@github.com>\nCo-authored-by: dependabot[bot] <49699333+dependabot[bot]@users.noreply.github.com>",
          "timestamp": "2026-11-07T09:52:28Z",
          "tree_id": "43ebcf51b62a601561780f5fb07ce3c4b0961093",
          "url": "https://github.com/pulseengine/rivet/commit/44618e36d4654c9e719656c16594c16f369a6492"
        },
        "date": 1794052990334,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 68411,
            "range": "± 479",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 682195,
            "range": "± 6437",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13708192,
            "range": "± 1375247",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1465,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 17804,
            "range": "± 312",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 282854,
            "range": "± 1095",
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
            "value": 1537298,
            "range": "± 24611",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 119228,
            "range": "± 1857",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1356764,
            "range": "± 8726",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 34512808,
            "range": "± 1764849",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 562850,
            "range": "± 13776",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 17598251,
            "range": "± 184670",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1315616384,
            "range": "± 13868514",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3589,
            "range": "± 14",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 39823,
            "range": "± 153",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 617760,
            "range": "± 15548",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 44581,
            "range": "± 928",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 505480,
            "range": "± 2758",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7326822,
            "range": "± 1373965",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 818,
            "range": "± 36",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 11295,
            "range": "± 33",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 201293,
            "range": "± 2015",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 17393,
            "range": "± 243",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 110858,
            "range": "± 958",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1041974,
            "range": "± 16843",
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
          "id": "e7669f2283eb05d52584acdc294d750b2e5e37bb",
          "message": "fix(dependabot): group spar-* and ignore rivet's own platform packages (#1191)\n\nDependabot's first run after #1156 opened spar-hir and spar-analysis as\ntwo PRs (#1185, #1188), though both come from one spar tag. They now share\na 'spar' group like wasmtime. It also opened five PRs (#1177, #1179,\n#1181, #1182, #1184) bumping @pulseengine/rivet-* in /npm. Those are\nrivet's own platform packages, and release-npm.yml sets their versions at\npublish time, so /npm now ignores them.\n\n\nClaude-Session: https://claude.ai/code/session_01G5qpB7zvxLvdrvn5YRyj4R\n\nCo-authored-by: Claude Opus 5.5 <noreply@anthropic.com>",
          "timestamp": "2026-11-07T10:33:10Z",
          "tree_id": "00c00fc8b259e7031a1611047bc7ec2458a78b3d",
          "url": "https://github.com/pulseengine/rivet/commit/e7669f2283eb05d52584acdc294d750b2e5e37bb"
        },
        "date": 1794062172158,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84817,
            "range": "± 1967",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 835058,
            "range": "± 25805",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14313848,
            "range": "± 595446",
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
            "value": 25266,
            "range": "± 79",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 408729,
            "range": "± 1720",
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
            "value": 1943218,
            "range": "± 21145",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 165897,
            "range": "± 1157",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1772643,
            "range": "± 20735",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 27461044,
            "range": "± 1782123",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 752844,
            "range": "± 10217",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 20502336,
            "range": "± 680836",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1500795451,
            "range": "± 15390218",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4827,
            "range": "± 17",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 68126,
            "range": "± 665",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 890308,
            "range": "± 14692",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 59006,
            "range": "± 325",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 674953,
            "range": "± 4122",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8644092,
            "range": "± 1388832",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1247,
            "range": "± 16",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15237,
            "range": "± 63",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 371956,
            "range": "± 1356",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 25004,
            "range": "± 106",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 167659,
            "range": "± 462",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1565586,
            "range": "± 17405",
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
          "id": "d74b33b0bba6b80f37b1b1d5425fdaf8d35c88dd",
          "message": "fix(ci): run the VS Code extension job on extension-only PRs (#1193)\n\nThe vscode-extension job needed `test`. On a PR that touches only\nvscode-rivet/, the rust filter skips `test`, so the extension job was\nskipped too. Its own dependency bumps (#1175, #1176, #1178, #1180, #1183,\nincluding vscode-languageclient 11) ran the extension tests nowhere: not\non the PR, and not in the queue, where the job is skipped by design\n(REQ-412).\n\ndetect-changes.sh gains a `vscode` output, true when vscode-rivet/ or\nanything the rust filter covers changed. The job now needs `changes` and\nruns on that output. It stays advisory and out of CI Gate, like `audit`,\nbecause it runs on ubuntu-latest. Making it gate is a separate decision.\n\ndetect-changes_test.sh asserts the new output in every case and adds an\nextension-only case for pull_request and merge_group. Matching no\nextension paths turns those two cases red.\n\n\nClaude-Session: https://claude.ai/code/session_01G5qpB7zvxLvdrvn5YRyj4R\n\nCo-authored-by: Claude Opus 5.5 <noreply@anthropic.com>",
          "timestamp": "2026-11-07T12:34:25Z",
          "tree_id": "4e3aaa5d67838b0351f52fda093c362b5d6d6c54",
          "url": "https://github.com/pulseengine/rivet/commit/d74b33b0bba6b80f37b1b1d5425fdaf8d35c88dd"
        },
        "date": 1794074709493,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 82391,
            "range": "± 1635",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 860403,
            "range": "± 18268",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 24351776,
            "range": "± 2367239",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1844,
            "range": "± 28",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 22139,
            "range": "± 319",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 351123,
            "range": "± 21574",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 92,
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
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1907777,
            "range": "± 34950",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 147835,
            "range": "± 5794",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1758796,
            "range": "± 44158",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 38315206,
            "range": "± 3616230",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 695755,
            "range": "± 11807",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 22196280,
            "range": "± 1042093",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1497744857,
            "range": "± 23959276",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4401,
            "range": "± 83",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 48502,
            "range": "± 662",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 799595,
            "range": "± 19808",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 53660,
            "range": "± 1091",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 630273,
            "range": "± 16110",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 12428522,
            "range": "± 708597",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1141,
            "range": "± 25",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14215,
            "range": "± 397",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 240993,
            "range": "± 6412",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21041,
            "range": "± 570",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 130868,
            "range": "± 4064",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1277337,
            "range": "± 30980",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "49699333+dependabot[bot]@users.noreply.github.com",
            "name": "dependabot[bot]",
            "username": "dependabot[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": false,
          "id": "1cf652fc60d455f90e58a7eb9db7260f7fca0881",
          "message": "build(deps): bump vscode-languageclient to 11 in /vscode-rivet, require VS Code 1.91 (#1176)\n\nRebuilt on main after #1175, #1178 and #1180 merged; the lockfile is\nregenerated instead of hand-merged. Supersedes Dependabot's bump commit.\n\nvscode-languageclient 11 publishes its entry points only through package\n\"exports\", which the old node10 module resolution cannot see, so tsc failed\nwith TS2307 on 'vscode-languageclient/node'. Switch the extension to node16\nmodule resolution; package.json has no \"type\", so the output stays CommonJS.\n\nlanguageclient 11 also declares engines.vscode ^1.91.0. On VS Code 1.85.2\nthe client never started, and activation still succeeded because\nclient.start() is caught, so the extension lost its language server with no\nvisible error. Raise engines.vscode to ^1.91.0 to match and pin\n@types/vscode to ~1.91.0 so the API types never run ahead of the declared\nengine (vsce refuses that). Users on VS Code 1.85-1.90 keep the version they\nhave and stop receiving updates.\n\nConfirmed locally in a headless VS Code (Node 22, rivet pinned through\nrivet.binaryPath) with a probe test that requires rivet-sourced diagnostics;\nthe probe goes red when the binary refuses to start.\n\n\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9\n\nCo-authored-by: Ralf Anton Beier <ralf_beier@me.com>\nCo-authored-by: Claude Opus 5.5 <noreply@anthropic.com>",
          "timestamp": "2026-11-07T16:40:20Z",
          "tree_id": "d78a1775ab3468c752103089730bc9182a90ce3e",
          "url": "https://github.com/pulseengine/rivet/commit/1cf652fc60d455f90e58a7eb9db7260f7fca0881"
        },
        "date": 1794079896094,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 69145,
            "range": "± 239",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 686327,
            "range": "± 3679",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 16591745,
            "range": "± 684015",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1485,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 18212,
            "range": "± 22",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 276146,
            "range": "± 751",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 75,
            "range": "± 2",
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
            "value": 1540375,
            "range": "± 16938",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 121447,
            "range": "± 9726",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1384240,
            "range": "± 13070",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 34085690,
            "range": "± 813637",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 557863,
            "range": "± 2488",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 16431388,
            "range": "± 121215",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1185497853,
            "range": "± 8079525",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3502,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 40600,
            "range": "± 105",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 621055,
            "range": "± 2917",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 44939,
            "range": "± 94",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 503321,
            "range": "± 16728",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 9999389,
            "range": "± 1155407",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 790,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 10766,
            "range": "± 17",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 200673,
            "range": "± 1035",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 17433,
            "range": "± 27",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 110821,
            "range": "± 296",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1044644,
            "range": "± 136681",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "49699333+dependabot[bot]@users.noreply.github.com",
            "name": "dependabot[bot]",
            "username": "dependabot[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "39d17c336bb288b1b3d7b3be490b7df2535317e0",
          "message": "build(deps): bump ignore from 0.4.33 to 0.4.34 (#1190)\n\nBumps [ignore](https://github.com/BurntSushi/ripgrep) from 0.4.33 to 0.4.34.\n- [Release notes](https://github.com/BurntSushi/ripgrep/releases)\n- [Changelog](https://github.com/BurntSushi/ripgrep/blob/master/CHANGELOG.md)\n- [Commits](https://github.com/BurntSushi/ripgrep/compare/ignore-0.4.33...ignore-0.4.34)\n\n---\nupdated-dependencies:\n- dependency-name: ignore\n  dependency-version: 0.4.34\n  dependency-type: direct:production\n  update-type: version-update:semver-patch\n...\n\nSigned-off-by: dependabot[bot] <support@github.com>\nCo-authored-by: dependabot[bot] <49699333+dependabot[bot]@users.noreply.github.com>",
          "timestamp": "2026-11-07T23:16:12Z",
          "tree_id": "3d3d3fc5bca85fe186690cca0735df3037a65da2",
          "url": "https://github.com/pulseengine/rivet/commit/39d17c336bb288b1b3d7b3be490b7df2535317e0"
        },
        "date": 1794096259703,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 67053,
            "range": "± 446",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 675205,
            "range": "± 4567",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 11836136,
            "range": "± 342157",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1490,
            "range": "± 16",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 17790,
            "range": "± 166",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 274344,
            "range": "± 788",
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
            "value": 1533814,
            "range": "± 17709",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 120587,
            "range": "± 2071",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1361553,
            "range": "± 17900",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 19440184,
            "range": "± 257738",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 556438,
            "range": "± 8105",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 14349349,
            "range": "± 112013",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1045570294,
            "range": "± 5103750",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3574,
            "range": "± 36",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 39078,
            "range": "± 254",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 614147,
            "range": "± 4570",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 44577,
            "range": "± 349",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 509795,
            "range": "± 11529",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 6237711,
            "range": "± 82812",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 781,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 10983,
            "range": "± 18",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 202048,
            "range": "± 1981",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 17366,
            "range": "± 241",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 111556,
            "range": "± 766",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1037649,
            "range": "± 20987",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "49699333+dependabot[bot]@users.noreply.github.com",
            "name": "dependabot[bot]",
            "username": "dependabot[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "f140607b8dea89e018f0fa41e4d2f2a9cb3ed9bc",
          "message": "build(deps-dev): bump typescript to 7 in /vscode-rivet, list ambient types (#1197)\n\nTypeScript 7 no longer pulls every installed @types package into the\ncompilation by default, so the extension lost the Node and mocha globals\n(console, process, __dirname, path, assert, setTimeout) and tsc failed with\n25 errors. Name them in tsconfig \"types\": [\"node\", \"mocha\"]. 'vscode' still\nresolves as an imported module and needs no entry.\n\nOnly the build changes: the shipped extension is bundled by esbuild either\nway. Built on main as one commit with a regenerated lockfile; supersedes\nDependabot's bump on #1197.\n\nConfirmed locally in a headless VS Code 1.105.1 (Node 22, rivet pinned\nthrough rivet.binaryPath): 20 passing, with a probe test that requires\nrivet-sourced diagnostics; the probe goes red when the binary refuses to\nstart.\n\n\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9\n\nCo-authored-by: Ralf Anton Beier <ralf_beier@me.com>\nCo-authored-by: Claude Opus 5.5 <noreply@anthropic.com>",
          "timestamp": "2026-11-08T08:06:00Z",
          "tree_id": "f96b4e0a8d3b8ec2ac3d3f8f2fcdeb5e2e33b80a",
          "url": "https://github.com/pulseengine/rivet/commit/f140607b8dea89e018f0fa41e4d2f2a9cb3ed9bc"
        },
        "date": 1794127862386,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84007,
            "range": "± 691",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 856899,
            "range": "± 9276",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 15653233,
            "range": "± 832920",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2225,
            "range": "± 13",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25258,
            "range": "± 88",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 436842,
            "range": "± 2986",
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
            "value": 1937836,
            "range": "± 36663",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 161602,
            "range": "± 8587",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1760423,
            "range": "± 13678",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 24629004,
            "range": "± 1248707",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 774234,
            "range": "± 6591",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 20728431,
            "range": "± 272503",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1502089906,
            "range": "± 17607241",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4971,
            "range": "± 61",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 68552,
            "range": "± 666",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 897598,
            "range": "± 3152",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 59600,
            "range": "± 169",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 695318,
            "range": "± 2410",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8553625,
            "range": "± 285778",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1206,
            "range": "± 19",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15761,
            "range": "± 97",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 379437,
            "range": "± 2014",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 24425,
            "range": "± 158",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 162635,
            "range": "± 1375",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1470265,
            "range": "± 24183",
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
          "id": "fafe10cf2bff5541f3e4db79ea70c950a4e69d82",
          "message": "ci(miri): skip the 8 manifest tests that outlast the full nightly sweep (#1203)\n\nThe full Miri nightly on 39d17c33 (run 42448316285) timed out at its 90-min\nstep limit with 884 of 910 tests passed. The manifest::tests added in #1160\nwere all still running past 960s:\n\n  kind_table_matches_schema, valid_entries_produce_no_diagnostics,\n  unknown_kind_is_an_error, kind_specific_fields_enums_and_locator_are_errors,\n  pin_shape_kind_and_value_are_checked, no_manifest_schema_means_no_checks,\n  partial_schema_still_checks_the_declared_type,\n  non_manifest_artifacts_are_ignored\n\nEach loads the embedded common schema; no_manifest_schema_means_no_checks\nloads only that and is just as slow, so the cost is schema parsing under the\ninterpreter, not the manifest checks. manifest.rs has no unsafe code, and\nthe parsing is already under Miri through the smaller tests. Add them to\nSLOW_UNDER_MIRI by exact name, as #1135 did for the earlier eight.\n\nA Miri-only smaller schema was considered and rejected: it would be a\nhand-kept copy of the shipped schema that can drift, and\nkind_table_matches_schema exists to check the real one. The tests still run\non every PR in the normal test job; after this they no longer run under\nMiri anywhere (the per-PR Miri job covers only sexpr:: and cst::).\n\n\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9\n\nCo-authored-by: Claude Opus 5.5 <noreply@anthropic.com>",
          "timestamp": "2026-11-08T08:57:27Z",
          "tree_id": "d3ea6a3ab0bb9ff469673e392adf7f372c12768e",
          "url": "https://github.com/pulseengine/rivet/commit/fafe10cf2bff5541f3e4db79ea70c950a4e69d82"
        },
        "date": 1794130709549,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 67427,
            "range": "± 1670",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 675719,
            "range": "± 3667",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 16027310,
            "range": "± 902098",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1464,
            "range": "± 13",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 17762,
            "range": "± 416",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 276723,
            "range": "± 10986",
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
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1531801,
            "range": "± 25626",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 120296,
            "range": "± 321",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1375028,
            "range": "± 34192",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 20835962,
            "range": "± 1544053",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 555318,
            "range": "± 2190",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 15756346,
            "range": "± 196165",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1179995174,
            "range": "± 17073565",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3623,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 40225,
            "range": "± 159",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 619550,
            "range": "± 13051",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 43856,
            "range": "± 357",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 501172,
            "range": "± 7967",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 6380947,
            "range": "± 595500",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 864,
            "range": "± 18",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 11334,
            "range": "± 136",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 198093,
            "range": "± 4150",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 16912,
            "range": "± 307",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 111391,
            "range": "± 2677",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1039727,
            "range": "± 46582",
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
          "id": "b285277a87925879e9f65f5b82ce29016da9810d",
          "message": "chore(vet): certify ignore 0.4.33 -> 0.4.34 delta (safe-to-deploy) (#1204)\n\ncargo vet --locked has been red on main since #1190 bumped ignore to\n0.4.34 with only an exemption for 0.4.33. The maintainer chose a reviewed\ndelta audit over moving the exemption or trusting the publisher.\n\nThe library diff (about 290 added lines in five src files) is matcher\ncaching and performance work plus a trailing-dot file-name fix. It adds no\nunsafe code, no dependencies, and no process or network access; the new\nbenches/workloads.rs is a nightly-only bench target. Details are in the\naudit notes. cargo vet --locked passes locally (181 fully audited).\n\n\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9\n\nCo-authored-by: Claude Opus 5.5 <noreply@anthropic.com>",
          "timestamp": "2026-11-08T09:14:55Z",
          "tree_id": "ff9c2b9287c6a1555ad24de3da98d2bc186b6078",
          "url": "https://github.com/pulseengine/rivet/commit/b285277a87925879e9f65f5b82ce29016da9810d"
        },
        "date": 1794131128577,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 47765,
            "range": "± 3575",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 566983,
            "range": "± 9073",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 11275256,
            "range": "± 993466",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 988,
            "range": "± 17",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 12108,
            "range": "± 140",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 228965,
            "range": "± 2826",
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
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 46,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1187340,
            "range": "± 18435",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 108491,
            "range": "± 1278",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1210925,
            "range": "± 20059",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 15738703,
            "range": "± 1954095",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 428929,
            "range": "± 2316",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 9705758,
            "range": "± 131490",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 633796073,
            "range": "± 9776605",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 2840,
            "range": "± 349",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 30751,
            "range": "± 541",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 458168,
            "range": "± 17977",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 33305,
            "range": "± 675",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 355295,
            "range": "± 19003",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 4284679,
            "range": "± 138961",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 475,
            "range": "± 9",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 6955,
            "range": "± 55",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 131553,
            "range": "± 1394",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 12885,
            "range": "± 111",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 81983,
            "range": "± 1930",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 768903,
            "range": "± 21230",
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
          "id": "e9765d3f0d894b12adcdb59c5310929d19da5ff2",
          "message": "chore(vet): audits for clap 4.6.7 and indexmap 2.14.2, unreviewed syn 3 exemption (#1205)\n\nVet entries for Dependabot #1189 (clap 4.6.1 -> 4.6.7) and #1196 (indexmap\n2.14.0 -> 2.14.2), so both turn green on rebase without commits on their\nbranches.\n\nReviewed delta audits (safe-to-deploy), diffs read in full:\n  indexmap 2.14.0 -> 2.14.2, clap 4.6.1 -> 4.6.7,\n  clap_builder 4.6.0 -> 4.6.7, clap_derive 4.6.1 -> 4.6.7.\nThe only unsafe in any of them is indexmap's get_disjoint_mut, moved\nunchanged into map/disjoint.rs with its bounds and duplicate checks.\n\nExempted, NOT reviewed: syn 3.0.9, which clap_derive 4.6.7 newly pulls in.\nIts 2.0.117 -> 3.0.9 delta is about 7000 lines; the exemption note says so.\n\nConfirmed with cargo vet --locked on main's lockfile and with the clap,\nindexmap and combined bumps applied by cargo update --precise: all pass.\n\n\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9\n\nCo-authored-by: Claude Opus 5.5 <noreply@anthropic.com>",
          "timestamp": "2026-11-08T10:02:18Z",
          "tree_id": "913df5a138c0f0d34cfedb101c4ca4f3bd08df0c",
          "url": "https://github.com/pulseengine/rivet/commit/e9765d3f0d894b12adcdb59c5310929d19da5ff2"
        },
        "date": 1794143873953,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84855,
            "range": "± 364",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 854363,
            "range": "± 3900",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 16289400,
            "range": "± 1013983",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2134,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 27218,
            "range": "± 578",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 427250,
            "range": "± 2960",
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
            "value": 1929688,
            "range": "± 22325",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 163233,
            "range": "± 712",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1836285,
            "range": "± 12496",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 32309769,
            "range": "± 2077323",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 767219,
            "range": "± 3162",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 20492893,
            "range": "± 495539",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1513421017,
            "range": "± 16891299",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4928,
            "range": "± 17",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 69644,
            "range": "± 699",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 918670,
            "range": "± 14799",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 58699,
            "range": "± 280",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 692414,
            "range": "± 11297",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 11188190,
            "range": "± 544633",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1225,
            "range": "± 11",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15623,
            "range": "± 88",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 379310,
            "range": "± 1616",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 24088,
            "range": "± 312",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 161492,
            "range": "± 917",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1522004,
            "range": "± 14622",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "49699333+dependabot[bot]@users.noreply.github.com",
            "name": "dependabot[bot]",
            "username": "dependabot[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": false,
          "id": "a9bb4cd2ccd8821a57eb005951e30be488139c75",
          "message": "build(deps): migrate to sha2 0.11, unreviewed vet exemptions for its new crates (#1195)\n\nsha2 0.11 (via digest 0.11) returns a hybrid_array::Array that no longer\nimplements LowerHex, so format!(\"{:x}\", hasher.finalize()) stops\ncompiling. rivet_version::content_sha256 was a second copy of\ncited_source::sha256_hex differing only in that formatting; it now\ndelegates to it, so there is one hex encoder. The four cli_commands tests\nthat hashed with {:x} encode the bytes inline instead, so they still check\nthe hash independently of rivet's own helper.\n\nAlso refreshes fuzz/Cargo.lock to sha2 0.11.1 (what #1200 does).\n\nVet: sha2 0.11.1, digest 0.11.3, crypto-common 0.2.2, block-buffer\n0.12.1, hybrid-array 0.4.15 and const-oid 0.10.2 are exempted NOT\nREVIEWED. About 21600 lines including hybrid-array's unsafe code is too\nmuch to review honestly here; each exemption note says so.\n\nConfirmed locally with cargo fmt --check, cargo clippy --all-targets\n--workspace -D warnings, rivet-core lib tests (1416), cli_commands (274),\ncited_source_integration (13) and cargo vet --locked.\n\n\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9\n\nCo-authored-by: Ralf Anton Beier <ralf_beier@me.com>\nCo-authored-by: Claude Opus 5.5 <noreply@anthropic.com>",
          "timestamp": "2026-11-08T12:53:25Z",
          "tree_id": "b173639f31a9636478dfb92a35d8747be3aa663e",
          "url": "https://github.com/pulseengine/rivet/commit/a9bb4cd2ccd8821a57eb005951e30be488139c75"
        },
        "date": 1794157608248,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 83605,
            "range": "± 1216",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 845747,
            "range": "± 3178",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12898774,
            "range": "± 806243",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2102,
            "range": "± 20",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26448,
            "range": "± 90",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 413791,
            "range": "± 2220",
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
            "value": 1921007,
            "range": "± 13493",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 158771,
            "range": "± 5618",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1770491,
            "range": "± 19280",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 24158587,
            "range": "± 1353715",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 727468,
            "range": "± 9380",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 17853637,
            "range": "± 148915",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1360306576,
            "range": "± 12828058",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4952,
            "range": "± 13",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 68939,
            "range": "± 395",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 897425,
            "range": "± 3566",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 59455,
            "range": "± 243",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 699033,
            "range": "± 3101",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8105634,
            "range": "± 215446",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1179,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15356,
            "range": "± 79",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 370332,
            "range": "± 1996",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23971,
            "range": "± 70",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 159222,
            "range": "± 985",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1403551,
            "range": "± 11537",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "49699333+dependabot[bot]@users.noreply.github.com",
            "name": "dependabot[bot]",
            "username": "dependabot[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": false,
          "id": "174698cd5ccb8130e75dddc5e7fa529d6db21557",
          "message": "build(deps): bump indexmap from 2.14.0 to 2.14.2 (#1196)\n\nBumps [indexmap](https://github.com/indexmap-rs/indexmap) from 2.14.0 to 2.14.2.\n- [Changelog](https://github.com/indexmap-rs/indexmap/blob/main/RELEASES.md)\n- [Commits](https://github.com/indexmap-rs/indexmap/compare/2.14.0...2.14.2)\n\n---\nupdated-dependencies:\n- dependency-name: indexmap\n  dependency-version: 2.14.2\n  dependency-type: direct:production\n  update-type: version-update:semver-patch\n...\n\nSigned-off-by: dependabot[bot] <support@github.com>\nCo-authored-by: dependabot[bot] <49699333+dependabot[bot]@users.noreply.github.com>",
          "timestamp": "2026-11-08T15:45:52Z",
          "tree_id": "2249f9d415531314f2dd165e7b2d88480d35bbe4",
          "url": "https://github.com/pulseengine/rivet/commit/174698cd5ccb8130e75dddc5e7fa529d6db21557"
        },
        "date": 1794165885285,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 81847,
            "range": "± 323",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 979613,
            "range": "± 7626",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13193579,
            "range": "± 732091",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1559,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 19333,
            "range": "± 147",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 416183,
            "range": "± 1267",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 77,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/1000",
            "value": 78,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 77,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 2094679,
            "range": "± 8631",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 179028,
            "range": "± 634",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 2108829,
            "range": "± 27143",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 34047780,
            "range": "± 1147214",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 736252,
            "range": "± 9379",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 17750616,
            "range": "± 218629",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1077140430,
            "range": "± 5334367",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4107,
            "range": "± 17",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 48163,
            "range": "± 299",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 989330,
            "range": "± 12967",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 52363,
            "range": "± 409",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 576155,
            "range": "± 14345",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8496853,
            "range": "± 605835",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 983,
            "range": "± 47",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 11649,
            "range": "± 42",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 330025,
            "range": "± 3371",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23236,
            "range": "± 91",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 152760,
            "range": "± 908",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1409353,
            "range": "± 27112",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "49699333+dependabot[bot]@users.noreply.github.com",
            "name": "dependabot[bot]",
            "username": "dependabot[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": false,
          "id": "00fd5b164a1cae4f26db3644322336653578c18e",
          "message": "build(deps): bump clap from 4.6.1 to 4.6.7 (#1189)\n\nBumps [clap](https://github.com/clap-rs/clap) from 4.6.1 to 4.6.7.\n- [Release notes](https://github.com/clap-rs/clap/releases)\n- [Changelog](https://github.com/clap-rs/clap/blob/main/CHANGELOG.md)\n- [Commits](https://github.com/clap-rs/clap/compare/clap_complete-v4.6.1...clap_complete-v4.6.7)\n\n---\nupdated-dependencies:\n- dependency-name: clap\n  dependency-version: 4.6.7\n  dependency-type: direct:production\n  update-type: version-update:semver-patch\n...\n\nSigned-off-by: dependabot[bot] <support@github.com>\nCo-authored-by: dependabot[bot] <49699333+dependabot[bot]@users.noreply.github.com>",
          "timestamp": "2026-11-08T17:35:44Z",
          "tree_id": "13d944d666078fa160675a71375a825677c2de84",
          "url": "https://github.com/pulseengine/rivet/commit/00fd5b164a1cae4f26db3644322336653578c18e"
        },
        "date": 1794169750826,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 77794,
            "range": "± 983",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 945104,
            "range": "± 9485",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14279422,
            "range": "± 670554",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1692,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 19373,
            "range": "± 92",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 375328,
            "range": "± 1612",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 85,
            "range": "± 3",
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
            "value": 1972447,
            "range": "± 24189",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 168876,
            "range": "± 909",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1973324,
            "range": "± 50749",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 33315733,
            "range": "± 1400801",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 727117,
            "range": "± 5700",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 16977794,
            "range": "± 304435",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 977998472,
            "range": "± 7389231",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4154,
            "range": "± 47",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 46101,
            "range": "± 89",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 885087,
            "range": "± 14803",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 49034,
            "range": "± 716",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 584394,
            "range": "± 7163",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7995428,
            "range": "± 541316",
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
            "value": 12202,
            "range": "± 106",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 369176,
            "range": "± 2236",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22542,
            "range": "± 109",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 146240,
            "range": "± 549",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1366223,
            "range": "± 11976",
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
          "id": "a94da26fcb6eb9ca506eac10465c39c5d62815a8",
          "message": "ci: authenticated, retried release downloads; audit back on self-hosted (#1208)\n\nGitHub's \"increase in timeouts for some unauthenticated users\" incident\n(2026-11-08, about 10:36-12:38 UTC) failed required and proof jobs on\nevery open PR for hours: each was an unauthenticated download of a GitHub\nrelease asset that got 503/504.\n\nThe actionlint (Test job) and zola (Zola export smoke) downloads now send\nthe job token and retry: curl --retry 5 --retry-all-errors. curl drops a\ncustom Authorization header when a redirect leaves the original host, so\nthe token is not sent to the asset storage host.\n\nNot covered, deliberately: taiki-e/install-action (nine sites, including\ncargo-vet's installer) already retries but passes a token only to its\ncargo-binstall fallback, and kani-github-action's `cargo-kani setup` has no\ntoken hook, so neither can be fixed from this workflow. Bazel's downloader\nretries were left alone: there is no .bazelversion, and an experimental\nflag unknown to the latest Bazel would break Verus and Rocq outright.\n\nThe RustSec audit job returns to self-hosted (light). It moved to\nubuntu-latest because smithy's cargo-audit 0.21.2 rejects CVSS 4.0\nadvisories and building a newer one tripped on smithy's sccache-on-cc.\nsmithy#91 preinstalls 0.22.2, so the install step uses the runner's copy\nwhen it is at least 0.22.2 and otherwise installs exactly that version.\nConfirmed the version guard on none, 0.21.2, 0.22.1, 0.22.2, 0.22.10,\n0.23.0 and 1.0.0; actionlint is clean apart from custom runner labels.\n\n\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9\n\nCo-authored-by: Claude Opus 5.5 <noreply@anthropic.com>",
          "timestamp": "2026-11-08T18:15:09Z",
          "tree_id": "b42c3e62a530532ab8e1a53cf2f4e1a4b898e4d2",
          "url": "https://github.com/pulseengine/rivet/commit/a94da26fcb6eb9ca506eac10465c39c5d62815a8"
        },
        "date": 1794172150626,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 67580,
            "range": "± 5845",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 849088,
            "range": "± 3063",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 9030603,
            "range": "± 39759",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1349,
            "range": "± 56",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 16082,
            "range": "± 393",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 306424,
            "range": "± 1161",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 64,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/1000",
            "value": 64,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 64,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1743554,
            "range": "± 21576",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 147141,
            "range": "± 539",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1732938,
            "range": "± 9243",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 22063460,
            "range": "± 224678",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 609954,
            "range": "± 2766",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 14232695,
            "range": "± 47006",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 888989241,
            "range": "± 6511864",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3415,
            "range": "± 98",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 39851,
            "range": "± 74",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 840397,
            "range": "± 2281",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 43885,
            "range": "± 248",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 490872,
            "range": "± 32776",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 6047851,
            "range": "± 169490",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 844,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 10053,
            "range": "± 36",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 292210,
            "range": "± 5218",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 19161,
            "range": "± 468",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 123151,
            "range": "± 627",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1125503,
            "range": "± 5457",
            "unit": "ns/iter"
          }
        ]
      }
    ]
  }
}