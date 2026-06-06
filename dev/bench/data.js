window.BENCHMARK_DATA = {
  "lastUpdate": 1780720233759,
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
          "id": "634309c87602da46d29f1c06a213241d5b1153a9",
          "message": "fix(query): execute_sexpr returns deterministic (id-sorted) matches (REQ-190, #415) (#461)\n\nVerified bug (#415): `rivet query --format json` for the same filter returned\nresults in a DIFFERENT order on every run (run1: REQ-125,166,147...; run2:\nREQ-174,011,117...), because the shared `execute_sexpr` engine iterated the\nHashMap-ordered `store.iter()`. Consequences:\n- match order nondeterministic across CLI / MCP `rivet_query` / `{{query:...}}`\n  embed (all three share execute_sexpr);\n- with `--limit`, the kept subset was an arbitrary HashMap-order slice, so an\n  agent paging/sampling got a different subset each run — a correctness bug.\n\n`execute` (non-sexpr path) already sorted by id; `execute_sexpr` was missed.\nFix: iterate `store.iter_sorted()` (REQ-159) so both match order and `--limit`\ntruncation are deterministic (lowest-id N).\n\nTests (query::tests): execute_sexpr_returns_matches_sorted_by_id;\nexecute_sexpr_limit_truncates_to_lowest_ids_deterministically (asserts the kept\nsubset is the lowest-id N, not just the count).\n\nConfirmed with: cargo test -p rivet-core --lib query::tests (8/8), cargo fmt\n--check, cargo clippy --all-targets -- -D warnings (exit 0), rivet validate\nPASS. Manually verified `rivet query --sexpr '(= type \"requirement\")' --format\nids` is now byte-identical (md5) across two consecutive runs and id-sorted.\n\nImplements: REQ-190\nVerifies: REQ-190\nRefs: REQ-159",
          "timestamp": "2026-06-04T09:14:48-05:00",
          "tree_id": "355e8803d40a6812d3f966b736a96e8365a9112d",
          "url": "https://github.com/pulseengine/rivet/commit/634309c87602da46d29f1c06a213241d5b1153a9"
        },
        "date": 1780583043458,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84758,
            "range": "± 704",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 896851,
            "range": "± 16470",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14083755,
            "range": "± 926975",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2242,
            "range": "± 14",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26389,
            "range": "± 658",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 358152,
            "range": "± 1561",
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
            "value": 1440374,
            "range": "± 25064",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 163000,
            "range": "± 2704",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1905583,
            "range": "± 19600",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 25573243,
            "range": "± 2208064",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 440546,
            "range": "± 6305",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 16382852,
            "range": "± 123543",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1395197250,
            "range": "± 11959893",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4288,
            "range": "± 15",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 58689,
            "range": "± 374",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 737049,
            "range": "± 4479",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 64427,
            "range": "± 135",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 719805,
            "range": "± 2900",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8162827,
            "range": "± 166755",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1148,
            "range": "± 16",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14872,
            "range": "± 69",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 322082,
            "range": "± 5529",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22472,
            "range": "± 246",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 154042,
            "range": "± 1164",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1448521,
            "range": "± 9382",
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
          "id": "ddc9b0e114d3b071418e9f32879c79b2f384a969",
          "message": "fix(links): LinkGraph::orphans returns id-sorted output for deterministic stats/validate (REQ-191, #415) (#462)\n\nVerified bug (sibling of REQ-190, #415): `rivet stats --format json` produced a\nDIFFERENT `orphans` array order on every run (same set, shuffled) because\n`LinkGraph::orphans` iterated the HashMap-ordered `store.iter()` and collected\nwithout sorting. The orphan list feeds `rivet stats`, `rivet validate`, and\n`rivet list` orphan reporting, so all three were nondeterministic.\n(matrix/export/coverage/list-body were already stable — tested.)\n\nFix: iterate `store.iter_sorted()` in `LinkGraph::orphans` so the list is\nascending by id and reproducible.\n\nTest (links::tests): orphans_are_id_sorted_for_deterministic_output — inserts\nisolated artifacts in scrambled id order, asserts orphans() yields ascending.\n\nConfirmed with: cargo test -p rivet-core --lib links::tests (8/8), cargo fmt\n--check, cargo clippy --all-targets -- -D warnings (exit 0), rivet validate\nPASS. Manually verified `rivet stats --format json` is now byte-identical (md5)\nacross two runs with the orphans array sorted ascending.\n\nImplements: REQ-191\nVerifies: REQ-191\nRefs: REQ-159",
          "timestamp": "2026-06-04T10:16:15-05:00",
          "tree_id": "3d32eafade1d2b5fcf7061069e91f4e47d82d7d8",
          "url": "https://github.com/pulseengine/rivet/commit/ddc9b0e114d3b071418e9f32879c79b2f384a969"
        },
        "date": 1780586773790,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 83464,
            "range": "± 1266",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 900951,
            "range": "± 10416",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 19384047,
            "range": "± 1302173",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2152,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25755,
            "range": "± 136",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 382297,
            "range": "± 949",
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
            "value": 1459259,
            "range": "± 11081",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 164690,
            "range": "± 1880",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1896595,
            "range": "± 12530",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 33878740,
            "range": "± 2520112",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 456308,
            "range": "± 2413",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 16635286,
            "range": "± 120565",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1418085205,
            "range": "± 13370469",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4276,
            "range": "± 77",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60938,
            "range": "± 647",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 741846,
            "range": "± 4432",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 60582,
            "range": "± 276",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 687651,
            "range": "± 3265",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7929106,
            "range": "± 1155569",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1212,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 18543,
            "range": "± 673",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 337389,
            "range": "± 949",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22286,
            "range": "± 127",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 153750,
            "range": "± 5410",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1446486,
            "range": "± 6583",
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
          "id": "01a838062b08ab290063b7eb5ee24effebdeb6bd",
          "message": "feat(cli): commits --format json carries the `command` envelope field (REQ-192) (#463)\n\nDogfooding JSON-consistency audit (follow-on to REQ-189): every machine-readable\ncommand output carries a top-level `command` field — validate, get, list,\nstats, coverage, query, matrix, diff, impact all do. `rivet commits --format\njson` was the lone remaining exception (envelope: summary/broken_refs/orphans/\nunimplemented/artifact_coverage, no `command`), so an agent dispatching on the\n`command` field found commits anomalous.\n\nVerified the false-alarm siblings: get/coverage --format json are valid JSON\n(an earlier \"invalid control character\" reading was a shell-quoting artifact),\nand commits output is deterministic — so the only real gap was the missing\nfield.\n\nFix (additive): emit `\"command\": \"commits\"` in cmd_commits_json.\n\nTest (cli_commands): commits_json_output_has_command_envelope asserts\ncommand==\"commits\" (exit code not asserted — a repo with broken trailers exits\nnon-zero but still emits the JSON document).\n\nConfirmed with: cargo test -p rivet-cli --test cli_commands\ncommits_json_output_has_command_envelope (pass), cargo fmt --check, cargo clippy\n--all-targets -- -D warnings (exit 0), rivet validate PASS.\n\nImplements: REQ-192\nVerifies: REQ-192\nRefs: REQ-007",
          "timestamp": "2026-06-04T11:15:01-05:00",
          "tree_id": "9835d2eba0597c1dfc28069ec743e1a2cee95825",
          "url": "https://github.com/pulseengine/rivet/commit/01a838062b08ab290063b7eb5ee24effebdeb6bd"
        },
        "date": 1780590287847,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84069,
            "range": "± 626",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 891864,
            "range": "± 13744",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 18432228,
            "range": "± 3065390",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2169,
            "range": "± 15",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26285,
            "range": "± 578",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 382367,
            "range": "± 5839",
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
            "value": 95,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1473734,
            "range": "± 24930",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 163866,
            "range": "± 989",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1936338,
            "range": "± 48265",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 38865325,
            "range": "± 6241798",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 439264,
            "range": "± 15450",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 17086899,
            "range": "± 267655",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1448828081,
            "range": "± 11044705",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4357,
            "range": "± 14",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 63021,
            "range": "± 446",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 778019,
            "range": "± 24761",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 57671,
            "range": "± 235",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 697668,
            "range": "± 4822",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 10945643,
            "range": "± 1268029",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1269,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15375,
            "range": "± 104",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 333689,
            "range": "± 2158",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23346,
            "range": "± 89",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 156640,
            "range": "± 809",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1452423,
            "range": "± 21881",
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
          "id": "ef32552c4ec868ba17f45489d4b696a52c5d2aa4",
          "message": "fix(embed): {{query:...}} embed renders rows id-sorted for reproducible docs (REQ-193, #415) (#464)\n\nVerified bug (sibling of REQ-190, #415): `rivet embed 'query:(= type\n\"requirement\")'` rendered a DIFFERENT row order on every run. REQ-190 fixed the\nshared `execute_sexpr` engine, but the `{{query:...}}` embed has its OWN match\nloop in `render_query` that iterated the HashMap-ordered `ctx.store.iter()`\ndirectly — it never went through `execute_sexpr`. Consequences:\n- embed table rows render in nondeterministic order, so any document with a\n  `{{query:...}}` embed (compliance reports, zola sites, `rivet docs`) produces\n  churny, non-reproducible output across builds;\n- the embed's row `limit` truncated to an arbitrary HashMap-order subset.\n(The aggregate embeds `stats:types`/`stats:status`/... were already\ndeterministic — they accumulate into a BTreeMap.)\n\nFix: iterate `ctx.store.iter_sorted()` in `render_query` so both row order and\nlimit truncation are deterministic (lowest-id N).\n\nTest (embed::tests): query_embed_renders_rows_id_sorted_for_deterministic_docs\ninserts artifacts in scrambled id order and asserts the rendered HTML lists ids\nascending.\n\nConfirmed with: cargo test -p rivet-core --lib embed::tests (81/81), cargo fmt\n--check, cargo clippy --all-targets -- -D warnings (exit 0), rivet validate\nPASS. Manually verified `rivet embed 'query:(= type \"requirement\")'` is now\nbyte-identical (md5) across two runs.\n\nImplements: REQ-193\nVerifies: REQ-193\nRefs: REQ-159",
          "timestamp": "2026-06-04T12:16:25-05:00",
          "tree_id": "44aa9fb75dc3bfd2308c742341a55421f09f2e54",
          "url": "https://github.com/pulseengine/rivet/commit/ef32552c4ec868ba17f45489d4b696a52c5d2aa4"
        },
        "date": 1780594088881,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84922,
            "range": "± 197",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 929972,
            "range": "± 9067",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 19686465,
            "range": "± 971394",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1941,
            "range": "± 51",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25084,
            "range": "± 1137",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 368598,
            "range": "± 5972",
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
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1448876,
            "range": "± 20957",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 167254,
            "range": "± 2509",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1938513,
            "range": "± 52407",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 42584147,
            "range": "± 5116928",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 443150,
            "range": "± 1490",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 17521139,
            "range": "± 296392",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1296944847,
            "range": "± 26755204",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4257,
            "range": "± 21",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 43333,
            "range": "± 215",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 737720,
            "range": "± 6820",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 63074,
            "range": "± 769",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 729907,
            "range": "± 2182",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8300945,
            "range": "± 468179",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1219,
            "range": "± 67",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14802,
            "range": "± 52",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 236573,
            "range": "± 6581",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 20809,
            "range": "± 312",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 142714,
            "range": "± 15192",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1344809,
            "range": "± 15565",
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
          "id": "6ab12599668f20b19ebb69e625fecf188c2e9d36",
          "message": "feat(cli): snapshot diff accepts the baseline path positionally (REQ-194) (#465)\n\nDogfooding friction: `rivet snapshot diff <baseline.json>` — the natural form\n(mirroring `git diff <ref>`, `diff <file>`) — errored \"unexpected argument\",\nbecause `snapshot diff` only accepted the baseline via `--baseline`. Same\nfriction class as the query (REQ-187), link (REQ-188), and next-id positional\nshorthands; an agent capturing then diffing a snapshot naturally writes\n`snapshot diff <path>`.\n\nFix (additive): optional positional BASELINE on `snapshot diff`; the `--baseline`\nflag still works and wins if both are given. When neither is supplied, the\nexisting auto-detect (latest snapshot under snapshots/) is preserved.\n\nTest (cli_commands): snapshot_diff_accepts_positional_baseline captures a\nsnapshot then diffs it positionally (exit 0, no clap parse error).\n\nConfirmed with: cargo test -p rivet-cli --test cli_commands\nsnapshot_diff_accepts_positional_baseline (pass), cargo fmt --check, cargo\nclippy --all-targets -- -D warnings (exit 0), rivet validate PASS. Manually\nverified both `snapshot diff <path>` (positional) and `--baseline <path>` exit 0\nagainst a freshly captured snapshot.\n\nImplements: REQ-194\nVerifies: REQ-194\nRefs: REQ-007",
          "timestamp": "2026-06-04T13:15:47-05:00",
          "tree_id": "cc774fb848dcae1edf333ad0fbcba3940adb9bdf",
          "url": "https://github.com/pulseengine/rivet/commit/6ab12599668f20b19ebb69e625fecf188c2e9d36"
        },
        "date": 1780597639573,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 83232,
            "range": "± 786",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 875889,
            "range": "± 4465",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 16360404,
            "range": "± 1287635",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2155,
            "range": "± 15",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 23607,
            "range": "± 127",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 351038,
            "range": "± 1295",
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
            "value": 1457660,
            "range": "± 28514",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 164299,
            "range": "± 743",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1921485,
            "range": "± 75426",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 35366322,
            "range": "± 2623397",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 461366,
            "range": "± 6624",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 17326942,
            "range": "± 447025",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1418398017,
            "range": "± 14301424",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4390,
            "range": "± 59",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60963,
            "range": "± 516",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 750523,
            "range": "± 7651",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 57906,
            "range": "± 1206",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 689785,
            "range": "± 2369",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 11554269,
            "range": "± 558536",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1149,
            "range": "± 9",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15099,
            "range": "± 235",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 331570,
            "range": "± 5075",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22921,
            "range": "± 1518",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 154899,
            "range": "± 716",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1448600,
            "range": "± 16065",
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
          "id": "0fe78b07f026aae2a303ee9fa065de1d4e2e8ba3",
          "message": "feat(cli): variant subcommands accept a bare --variant <name> (REQ-195, #466) (#467)\n\nDogfooding friction (#466): `--variant` accepted a bare NAME in `query`\n(resolved from artifacts/variants/<name>.yaml, #287) but required a PATH in the\n`variant` subcommands, so an agent who learned `query --variant dashboard-only`\nhit `reading dashboard-only: No such file` on `variant solve/explain/...` — even\nthough the SAME file drives both.\n\nFix (additive): resolve `--variant` once per dispatch arm via the existing\n`resolve_variant_arg(project, arg)` helper (direct path → use as-is; bare name →\nartifacts/variants/<name>.yaml; unknown → error listing what was tried).\nApplies to variant check/solve/features/value/attr/explain/manifest; handlers\nunchanged; a direct path keeps working.\n\nTest (cli_commands): variant_solve_accepts_bare_variant_name — bare name\nresolves AND a direct path still works.\n\nConfirmed with: cargo test -p rivet-cli --test cli_commands\nvariant_solve_accepts_bare_variant_name (pass), cargo fmt --check, cargo clippy\n--all-targets -- -D warnings (exit 0), rivet validate PASS. Manually verified\n`variant solve`/`explain --variant dashboard-only` now PASS (explain previously\nerrored \"No such file\"), and a bogus name gives a helpful \"Tried: …\" error.\n\nImplements: REQ-195\nVerifies: REQ-195\nRefs: REQ-007",
          "timestamp": "2026-06-04T15:19:43-05:00",
          "tree_id": "34c2e92c16ec4b2b38285b0e204893db9c24c4c0",
          "url": "https://github.com/pulseengine/rivet/commit/0fe78b07f026aae2a303ee9fa065de1d4e2e8ba3"
        },
        "date": 1780604946946,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84223,
            "range": "± 338",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 903686,
            "range": "± 5430",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13524825,
            "range": "± 869149",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1957,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25108,
            "range": "± 40",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 360502,
            "range": "± 1229",
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
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1442407,
            "range": "± 25490",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 166217,
            "range": "± 604",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1914460,
            "range": "± 10582",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 26415413,
            "range": "± 430385",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 436107,
            "range": "± 1380",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 16822325,
            "range": "± 203412",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1288027323,
            "range": "± 18061488",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4220,
            "range": "± 19",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 44764,
            "range": "± 151",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 724304,
            "range": "± 2696",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 64225,
            "range": "± 134",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 709260,
            "range": "± 3994",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8038863,
            "range": "± 284051",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1220,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15083,
            "range": "± 50",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 247866,
            "range": "± 5064",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 20867,
            "range": "± 196",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 143899,
            "range": "± 1078",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1349555,
            "range": "± 23577",
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
          "id": "c99c305a75efc47f3c01d3b8a16c0e82ac131277",
          "message": "fix(export): honest AADL fallback in static HTML (no perpetual \"Loading…\") (REQ-196, #468) (#469)\n\nUser-reported: AADL architecture diagrams in the published compliance report\n(.../0.15.0/compliance/documents/ARCH-001.html) are stuck on \"Loading AADL\ndiagram...\" forever. Root cause: `document::render_to_html` emits an\n`<div class=\"aadl-diagram\"><p class=\"aadl-loading\">Loading AADL diagram...</p>`\nplaceholder that is filled at runtime ONLY by `rivet serve`'s `initAadlDiagrams`\nJS (which fetches server-only `/source-raw/…` + `/wasm/spar_wasm.js` and renders\nvia spar WASM). A static export bundles neither that JS nor those routes, so the\nplaceholder never updates.\n\nThis is the immediate honest fix: `render_document_body_for_export` now rewrites\nthe perpetual \"Loading AADL diagram...\" into a static note pointing to the\ninteractive `rivet serve` view, so the report no longer looks hung. Inlining the\nrendered SVG at export time (server-side via the spar wasm_runtime, which\nalready exists) is the larger follow-up tracked in #468.\n\nTest (export::tests): static_export_replaces_perpetual_aadl_loading_with_honest_note\nasserts the export output drops \"Loading AADL diagram...\" and points to\n`rivet serve`, preserving the diagram container/data-root.\n\nConfirmed with: cargo test -p rivet-core --lib\nexport::tests::static_export_replaces_perpetual_aadl_loading_with_honest_note\n(pass), cargo fmt --check, cargo clippy --all-targets -- -D warnings (exit 0),\nrivet validate PASS.\n\nImplements: REQ-196\nVerifies: REQ-196\nRefs: REQ-105",
          "timestamp": "2026-06-04T15:23:43-05:00",
          "tree_id": "94ee97cdf569f33b1a08564b95634de4539fe653",
          "url": "https://github.com/pulseengine/rivet/commit/c99c305a75efc47f3c01d3b8a16c0e82ac131277"
        },
        "date": 1780605544938,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84279,
            "range": "± 362",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 884795,
            "range": "± 6070",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12398710,
            "range": "± 477957",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2145,
            "range": "± 12",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24891,
            "range": "± 122",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 343828,
            "range": "± 2774",
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
            "value": 1452712,
            "range": "± 18642",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 150398,
            "range": "± 855",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1733034,
            "range": "± 17633",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 22884006,
            "range": "± 257682",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 444563,
            "range": "± 5061",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 15480792,
            "range": "± 154738",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1297652529,
            "range": "± 11364725",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4223,
            "range": "± 17",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 61960,
            "range": "± 302",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 759346,
            "range": "± 5230",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 60725,
            "range": "± 268",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 689782,
            "range": "± 5020",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7695389,
            "range": "± 53704",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1312,
            "range": "± 12",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15160,
            "range": "± 217",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 330988,
            "range": "± 2399",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23273,
            "range": "± 835",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 163830,
            "range": "± 1113",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1532606,
            "range": "± 15331",
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
          "id": "295f8175b152220d7350c1b948285b9b4434565a",
          "message": "fix(serve/docs): honest AADL/WASM-unavailable guidance, not broken tooling (REQ-197, #468) (#470)\n\nFollow-on to the user-reported AADL bug (#468): when the spar WASM isn't\nbundled, rivet pointed users at tooling that doesn't work for them. The serve\nfallback said \"run ./scripts/build-wasm.sh and rebuild\" (that script needs a\nlocal spar checkout + wasm32-wasip2 + Node/jco), and the assets README\nadvertised `./scripts/fetch-wasm.sh` under \"Downloading from GitHub releases\" —\nbut spar publishes NO WASM release asset (pulseengine/spar#259), so fetch-wasm.sh\nalways fails. Both sent users (incl. the reporter) down dead ends.\n\nFix (docs + messaging, no behaviour change): the serve `AADL_JS` fallback\nmessages now say the renderer is \"not bundled in this build\" and reference the\ntracking issue #468 instead of the broken script; the README honestly describes\nthe current state (stub fallback, fetch-wasm.sh blocked on spar#259, build from\nsource requires a local spar checkout + toolchain).\n\nTest (serve::js::tests): aadl_wasm_fallback_messages_are_honest asserts the\nfallback no longer instructs running build-wasm.sh, states \"not bundled in this\nbuild\", and references the tracking issue.\n\nConfirmed with: cargo test -p rivet-cli --bin rivet\nserve::js::tests::aadl_wasm_fallback_messages_are_honest (pass), cargo fmt\n--check, cargo clippy --all-targets -- -D warnings (exit 0), rivet validate PASS.\n\nImplements: REQ-197\nVerifies: REQ-197\nRefs: REQ-007",
          "timestamp": "2026-06-04T17:16:13-05:00",
          "tree_id": "cd2fc05353b13938a6d73383e0f414f1b4a03980",
          "url": "https://github.com/pulseengine/rivet/commit/295f8175b152220d7350c1b948285b9b4434565a"
        },
        "date": 1780611911054,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 78518,
            "range": "± 1379",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 951495,
            "range": "± 20061",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 15444825,
            "range": "± 2022019",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1675,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 19265,
            "range": "± 36",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 372257,
            "range": "± 1208",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 85,
            "range": "± 1",
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
            "value": 1347832,
            "range": "± 48970",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 151652,
            "range": "± 1765",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1791433,
            "range": "± 13755",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 42447286,
            "range": "± 3008177",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 413224,
            "range": "± 2036",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 13934376,
            "range": "± 203830",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 940556493,
            "range": "± 5081156",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3889,
            "range": "± 11",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 40562,
            "range": "± 646",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 793498,
            "range": "± 2072",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 52573,
            "range": "± 700",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 592709,
            "range": "± 5200",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8537203,
            "range": "± 398195",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 915,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 11836,
            "range": "± 38",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 310123,
            "range": "± 2813",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 20599,
            "range": "± 37",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 146514,
            "range": "± 367",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1398020,
            "range": "± 36697",
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
          "id": "b7e948c0ecc22dbbb969ea2494b92266d01846fa",
          "message": "fix(mutate): rivet add emits valid YAML for multi-line/special-char fields (REQ-198) (#471)\n\nData-corruption bug (verified on current main): `rivet add --type requirement\n--title T --description $'a\\nb'` wrote INVALID YAML and broke the whole artifacts\nfile — `rivet validate` afterwards FAILed with a YAML parse error\n(\"could not find expected ':'\"). `render_artifact_yaml` (mutate.rs) was a naive\nserializer:\n- `description: >` folded scalar indented only the FIRST line, so a newline put\n  line 2 at column 0;\n- `title:` / tag / field values were emitted unquoted, so a colon (e.g.\n  \"Multi word: with colon\") also produced invalid YAML.\n\nThe modify/set_field path already serializes safely via yaml_edit; only the add\npath diverged. Fix: route add's title/status/description/tags/field values\nthrough the same emitters (`yaml_quote_inline_scalar` + `yaml_render_scalar_value`,\nnow `pub(crate)`), so newlines become block-literal `|` scalars with correct\nindentation and special chars are quoted.\n\nTest (mutate::tests): render_artifact_yaml_multiline_and_colon_is_valid_parseable_yaml\nrenders an artifact with a multi-line description + colon title and asserts the\nYAML parses and round-trips exactly.\n\nConfirmed with: cargo test -p rivet-core --lib mutate::tests (17/17), cargo fmt\n--check, cargo clippy --all-targets -- -D warnings (exit 0), rivet validate PASS.\nManually verified the original repro now writes a `|-` block scalar + quoted\ntitle and validates PASS (was FAIL with 2 parse errors).\n\nImplements: REQ-198\nVerifies: REQ-198\nRefs: REQ-031",
          "timestamp": "2026-06-04T18:16:19-05:00",
          "tree_id": "6fc746fb114b74b4dd35ebeb5e7bcda85e0e30b4",
          "url": "https://github.com/pulseengine/rivet/commit/b7e948c0ecc22dbbb969ea2494b92266d01846fa"
        },
        "date": 1780615580791,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85062,
            "range": "± 485",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 945948,
            "range": "± 5426",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 21115546,
            "range": "± 3054346",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1939,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24961,
            "range": "± 99",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 387625,
            "range": "± 4390",
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
            "value": 1444724,
            "range": "± 17888",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 154030,
            "range": "± 2673",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1789823,
            "range": "± 9638",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 29267325,
            "range": "± 1483610",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 435231,
            "range": "± 4165",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 15733912,
            "range": "± 575717",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1158433182,
            "range": "± 25400272",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4096,
            "range": "± 51",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 51374,
            "range": "± 388",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 756439,
            "range": "± 16891",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 63592,
            "range": "± 179",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 735895,
            "range": "± 7793",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 14872219,
            "range": "± 737638",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1341,
            "range": "± 10",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14757,
            "range": "± 133",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 236511,
            "range": "± 3838",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21352,
            "range": "± 42",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 145816,
            "range": "± 3569",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1352102,
            "range": "± 8886",
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
          "id": "448f4db88b593344f119ff192540b86217f5a944",
          "message": "fix(mutate): serialize nested (list/map) field values as structures, not strings (REQ-199) (#472)\n\nFollow-on to REQ-198, found while verifying its comprehensiveness: in\n`render_artifact_yaml`, a non-scalar field value (a sequence/mapping — reachable\nvia `rivet batch` or the MCP add tool, where field values aren't limited to CLI\n`--field key=value` strings) hit the `other =>` arm, which serde-serialized the\nstructure (multi-line) and then — after REQ-198 — wrapped it in\n`yaml_render_scalar_value`, collapsing a list/map into a block-literal STRING\n(`owners: |-\\n  - alice\\n  - bob`). Pre-REQ-198 it was invalid YAML; neither\npreserved the structure.\n\nFix: emit nested field values as properly-indented YAML under the key (serde\nproduces valid YAML; shift it right by the field-content indent), so a list\nfield round-trips as a list and a map as a map. Scalar fields keep the REQ-198\nsafe-quoting path.\n\nTest (mutate::tests): render_artifact_yaml_nested_field_value_stays_structured\nasserts a sequence field round-trips as a sequence, not a string.\n\nConfirmed with: cargo test -p rivet-core --lib mutate::tests (18/18), cargo fmt\n--check, cargo clippy --all-targets -- -D warnings (exit 0), rivet validate PASS.\n\nImplements: REQ-199\nVerifies: REQ-199\nRefs: REQ-198",
          "timestamp": "2026-06-04T19:17:21-05:00",
          "tree_id": "65dea6fcfdfe6ea27abd7dc8ec3dc0d87b4862b9",
          "url": "https://github.com/pulseengine/rivet/commit/448f4db88b593344f119ff192540b86217f5a944"
        },
        "date": 1780619283293,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85386,
            "range": "± 1252",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 907827,
            "range": "± 3645",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14095171,
            "range": "± 341298",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1930,
            "range": "± 19",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25007,
            "range": "± 118",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 362946,
            "range": "± 1256",
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
            "value": 1446311,
            "range": "± 17868",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 165491,
            "range": "± 907",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1913445,
            "range": "± 14547",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 27364774,
            "range": "± 142273",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 448326,
            "range": "± 1287",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 17704375,
            "range": "± 67880",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1391684316,
            "range": "± 17569969",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4170,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 43392,
            "range": "± 258",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 736877,
            "range": "± 3655",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 63584,
            "range": "± 270",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 708246,
            "range": "± 2515",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7910856,
            "range": "± 102988",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1318,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14633,
            "range": "± 54",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 229838,
            "range": "± 5303",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23669,
            "range": "± 217",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 164156,
            "range": "± 4541",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1582738,
            "range": "± 24446",
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
          "id": "f7fc2d0aa5b198e8bdfdbfbfdd71291c716b3b8f",
          "message": "fix(export): honest AADL fallback in the REAL html export path (REQ-200, #468) (#473)\n\nDogfooding the actual `rivet export --format html` (build + export + scan)\nshowed the perpetual `<p class=\"aadl-loading\">Loading AADL diagram...</p>`\nplaceholder STILL shipping in 2 of 988 pages — `documents/ARCH-001.html` (the\nexact #468 page) and `artifacts/ARCH-SYS-001.html` — with no honest fallback.\n\nRoot cause: REQ-196 patched `static_aadl_fallback` inside\n`rivet_core::export::render_document_body_for_export`, but `rivet export\n--format html` is implemented by `cmd_export_html` (rivet-cli), which renders\npages via the rivet-cli `render/` serve renderers and wraps them in a\n`wrap_page` layout — it never calls the rivet-core function REQ-196 fixed. So\nREQ-196 was effectively a no-op for the real export (and the published\ncompliance report), yet was marked implemented on a unit test of the helper\nrather than an e2e export check.\n\nFix: apply the placeholder→honest-note replacement in `wrap_page`, the universal\nper-page wrapper, so every exported page is covered.\n\nTest (export_html): export_html_replaces_perpetual_aadl_loading_placeholder\nwalks the full export output and asserts ZERO pages contain the raw placeholder.\n\nConfirmed with: cargo test -p rivet-cli --test export_html\nexport_html_replaces_perpetual_aadl_loading_placeholder (pass), cargo fmt\n--check, cargo clippy --all-targets -- -D warnings (exit 0), rivet validate PASS.\nManually verified the real export now has 0 raw placeholders and the honest\nfallback present (was 2 raw, 0 fallback).\n\nImplements: REQ-200\nVerifies: REQ-200\nRefs: REQ-196",
          "timestamp": "2026-06-05T03:15:19-05:00",
          "tree_id": "33cc033b408f22133d8b5428136c7f64de9527e9",
          "url": "https://github.com/pulseengine/rivet/commit/f7fc2d0aa5b198e8bdfdbfbfdd71291c716b3b8f"
        },
        "date": 1780648470048,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84563,
            "range": "± 465",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 900424,
            "range": "± 9479",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14953814,
            "range": "± 1049018",
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
            "value": 27420,
            "range": "± 698",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 380466,
            "range": "± 1482",
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
            "value": 1460091,
            "range": "± 14316",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 161289,
            "range": "± 830",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1921037,
            "range": "± 12697",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 42471295,
            "range": "± 3019655",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 462678,
            "range": "± 4597",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 17269832,
            "range": "± 138642",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1382189693,
            "range": "± 13517777",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4267,
            "range": "± 54",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 58372,
            "range": "± 287",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 741293,
            "range": "± 9084",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 61535,
            "range": "± 490",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 702228,
            "range": "± 2878",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7884142,
            "range": "± 794837",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1160,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14610,
            "range": "± 195",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 339188,
            "range": "± 1213",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 24586,
            "range": "± 160",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 176478,
            "range": "± 731",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1662653,
            "range": "± 26293",
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
          "id": "55769bec157e8d5c7b66d1b11f7eb067afc3fe58",
          "message": "ci: key main concurrency group per-sha so main runs stay conclusive (#436) (#481)\n\nIssue #436: Playwright E2E (and Criterion benchmarks) were red/cancelled across\nconsecutive main merges and nobody noticed, because main never reached a\nconclusive result. Root cause (verified): the concurrency group fell back to\n`github.ref` on push, so every main commit shared one group\n(`<workflow>-refs/heads/main`). With `cancel-in-progress` false the *running*\njob completes, but GitHub still supersedes *queued* runs in the group — so in a\nPR-merge train each new main push cancelled the previous queued run, and main\nrarely produced a conclusive Playwright/benchmark result. A real regression in\nany covered view would have looked identical to the benign dataset-growth\nfailures (#435).\n\nFix: fall back to `github.sha` (not `github.ref`) on push, so every main commit\ngets its own concurrency group and is never superseded. PRs are unchanged —\n`head_ref` still groups per source branch, so cancel-in-progress keeps\nsuperseding stale PR runs. Applied to both workflows that shared the pattern\n(ci.yml, benchmarks.yml).\n\nThis is the pure-hygiene half of #436; whether to promote Playwright to a\nrequired status check remains a separate maintainer decision.",
          "timestamp": "2026-06-05T14:21:00-05:00",
          "tree_id": "b8bd5578b534708b3296b553dae4e5768cae3365",
          "url": "https://github.com/pulseengine/rivet/commit/55769bec157e8d5c7b66d1b11f7eb067afc3fe58"
        },
        "date": 1780687794247,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85291,
            "range": "± 623",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 926939,
            "range": "± 46742",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 15662036,
            "range": "± 994009",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1981,
            "range": "± 11",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24852,
            "range": "± 203",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 354447,
            "range": "± 2103",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 98,
            "range": "± 1",
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
            "value": 1451601,
            "range": "± 21513",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 165633,
            "range": "± 2832",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1942974,
            "range": "± 27262",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 33600459,
            "range": "± 4104401",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 445437,
            "range": "± 2264",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 17345980,
            "range": "± 241292",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1319574053,
            "range": "± 20947720",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4341,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 44060,
            "range": "± 140",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 748142,
            "range": "± 10152",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 64983,
            "range": "± 127",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 715456,
            "range": "± 2559",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8592599,
            "range": "± 594695",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1178,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15049,
            "range": "± 78",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 230077,
            "range": "± 3068",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23546,
            "range": "± 83",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 168817,
            "range": "± 632",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1584258,
            "range": "± 19825",
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
          "id": "21a41d965fba94d11801022c714b8a2e9f4acd0c",
          "message": "fix(tools/intro-video): make the video pipeline actually produce a video (#480)\n\nFound while generating the first real intro video end-to-end. The freshly\nscaffolded pipeline had a blocking bug plus timing/engine gaps:\n\n1. MUX OFF-BY-ONE (blocker): the ffmpeg filtergraph referenced the narration\n   clips as `[0:a]`, `[1:a]`, … but ffmpeg input 0 is screen.mp4 (video, muxed\n   with `-an` so it has NO audio). The wavs are inputs 1..n. Result:\n   \"Stream specifier ':a' … matches no streams\" and a 0-byte output — the\n   scaffold could not produce a video for anyone. Fixed: filter input index is\n   idx+1; output labels stay 0-based.\n\n2. SPEACHES TTS ENGINE: added `TTS_ENGINE=speaches`, calling a self-hosted\n   OpenAI-compatible /v1/audio/speech endpoint (Kokoro-82M, voice via\n   SPEACHES_URL/SPEACHES_MODEL/SPEACHES_VOICE). No piper binary, no committed\n   voice model, no cloud secret — and reachable from self-hosted CI runners, so\n   a narrated release video can regenerate unattended. JSON body is built with\n   node (safe escaping); non-audio responses loud-fail via ffprobe.\n\n3. AUTO-FIT TIMING: the nominal hold_ms (5-6s) were ~half the real narration\n   (9-15s), so clips overran their scenes and talked over each other. New `fit`\n   step measures each narration wav and writes out/storyboard.timed.json with\n   hold_ms widened to fit; capture + mux read that one timeline (capture.spec.ts\n   now honors the STORYBOARD env). Pipeline reordered tts -> fit -> capture -> mux.\n\n4. NO OUTRO CLIP: Playwright's recorded length can land a second under the\n   summed holds; with `-shortest` that clipped the outro narration. The last\n   frame is now held (`tpad`) so audio defines length and the signature line\n   plays in full.\n\nConfirmed by producing out/rivet-intro.mp4 (1280x720 h264 + aac, ~90s), all 7\nscenes rendering (intro card, CLI help, dashboard, artifacts, artifact detail,\ncoverage, outro). Generated media stays gitignored (out/).\n\nRefs: FEAT-001",
          "timestamp": "2026-06-05T14:21:43-05:00",
          "tree_id": "bc4f4b9dad68acb42682667dc228b30d39365914",
          "url": "https://github.com/pulseengine/rivet/commit/21a41d965fba94d11801022c714b8a2e9f4acd0c"
        },
        "date": 1780687822298,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85683,
            "range": "± 219",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 923574,
            "range": "± 18059",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14225882,
            "range": "± 868143",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1957,
            "range": "± 16",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25119,
            "range": "± 46",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 365736,
            "range": "± 1798",
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
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1447038,
            "range": "± 19630",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 168552,
            "range": "± 14422",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1922295,
            "range": "± 18169",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 29001141,
            "range": "± 362795",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 451613,
            "range": "± 10108",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 16719707,
            "range": "± 757521",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1255707870,
            "range": "± 17606066",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4197,
            "range": "± 19",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 44335,
            "range": "± 1231",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 736980,
            "range": "± 4730",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 64853,
            "range": "± 203",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 729316,
            "range": "± 9592",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8137205,
            "range": "± 203209",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1209,
            "range": "± 17",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14761,
            "range": "± 403",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 230787,
            "range": "± 2930",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23400,
            "range": "± 382",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 165834,
            "range": "± 471",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1580354,
            "range": "± 56917",
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
          "id": "2682b408c3ca8ad15eadd975bb53cbd858f471bc",
          "message": "chore: ignore recorded/generated video repo-wide (mp4/webm/mov/mkv/m4v) (#486)\n\nThe intro/release video pipeline (tools/intro-video/) already ignores its own\nout/ dir, but that guard is path-specific. As video generation moves toward the\nrelease cycle (captures may land elsewhere), add a repo-wide safety net so a\nstray recording can't be committed from anywhere. Video extensions only —\ncommitted docs images (png/jpg/gif/svg) are intentionally left tracked. No\ntracked files are affected (no video is currently committed).",
          "timestamp": "2026-06-05T14:21:47-05:00",
          "tree_id": "11984928a8a974b34b0edb2118e8aeb7fd752a9f",
          "url": "https://github.com/pulseengine/rivet/commit/2682b408c3ca8ad15eadd975bb53cbd858f471bc"
        },
        "date": 1780687831203,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84920,
            "range": "± 585",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 919872,
            "range": "± 8421",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 17534727,
            "range": "± 1230195",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1948,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25056,
            "range": "± 326",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 367245,
            "range": "± 2261",
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
            "value": 1452302,
            "range": "± 29970",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 168142,
            "range": "± 7121",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1944533,
            "range": "± 26427",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 36378356,
            "range": "± 3786581",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 446852,
            "range": "± 4088",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 17387514,
            "range": "± 210414",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1274389782,
            "range": "± 17088203",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4088,
            "range": "± 9",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 44283,
            "range": "± 245",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 737231,
            "range": "± 4174",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 63410,
            "range": "± 419",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 722195,
            "range": "± 2611",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8051836,
            "range": "± 257317",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1283,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14894,
            "range": "± 499",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 240786,
            "range": "± 4014",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 24014,
            "range": "± 325",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 168572,
            "range": "± 693",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1586566,
            "range": "± 23751",
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
          "id": "c7a0c3c146efc1de006c74e8080cf4e666ad5032",
          "message": "docs(agents): document the parallel-PR conflict-avoidance policy (#422) (#489)\n\nImplements item 1 of the #422 triage AC (maintainer-authored): a \"Parallel-PR\nfriction\" section in AGENTS.md so contributors/agents avoid the recurring\nrequirements.yaml + CHANGELOG merge conflicts the dogfooding loop generates.\n\n- artifacts/requirements.yaml: append new artifacts at EOF (use `rivet add`,\n  which already EOF-appends), never insert mid-file; pick the next id by\n  scanning all of artifacts/ (and mind ids reserved by unmerged PRs, #479).\n- CHANGELOG.md: explains it is already conflict-free via `merge=union`\n  (REQ-164/#423), and why `requirements.yaml` deliberately does NOT use union\n  (would duplicate lines if two PRs edited the same artifact). Tracking: #422.\n- Notes the mechanical resolution (keep both blocks, then `rivet validate`).\n\nDeliberately a docs-only change with NO new REQ — adding a REQ here would append\nto requirements.yaml and contribute to the very EOF collision being documented.\nPer the #422 AC, traces to the existing CHANGELOG REQ instead.\n\nConfirmed with: referenced ids (REQ-160, REQ-164) exist; rivet validate PASS;\nAGENTS.md has no `rivet docs check` violations (the lone CHANGELOG `rivet trace`\nfinding is a stale-local-binary artifact — `trace` exists in main, CI passes).\n\nRefs: REQ-164",
          "timestamp": "2026-06-05T14:21:51-05:00",
          "tree_id": "f15bfc4140ace85f3dad13d6e47d160be94802f9",
          "url": "https://github.com/pulseengine/rivet/commit/c7a0c3c146efc1de006c74e8080cf4e666ad5032"
        },
        "date": 1780687894745,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 67392,
            "range": "± 400",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 727369,
            "range": "± 5956",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 11226279,
            "range": "± 344040",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1510,
            "range": "± 29",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 18545,
            "range": "± 64",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 261831,
            "range": "± 1512",
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
            "value": 1133766,
            "range": "± 71479",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 126911,
            "range": "± 819",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1473452,
            "range": "± 48996",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 22353768,
            "range": "± 1801654",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 339361,
            "range": "± 1574",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 13160986,
            "range": "± 95489",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1053394172,
            "range": "± 23027775",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3256,
            "range": "± 68",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 35522,
            "range": "± 369",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 577315,
            "range": "± 4812",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 46637,
            "range": "± 137",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 513586,
            "range": "± 2321",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 6041959,
            "range": "± 327408",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 877,
            "range": "± 24",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 11152,
            "range": "± 78",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 170147,
            "range": "± 1082",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 18149,
            "range": "± 433",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 129652,
            "range": "± 2452",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1225112,
            "range": "± 12496",
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
          "id": "6ffbdd7e9628108c72893cf0848815dc38022604",
          "message": "fix(export): node-budget the single-page graph render so it can't hang (REQ-201) (#474)\n\nVerified hang: on the rivet repo (~900 artifacts) `rivet export --format html\n--single-page` runs for MINUTES producing nothing (multi-page finishes in ~6s).\nRoot cause: `render_section_graph` (rivet-core/src/export.rs) lays out the\nentire link graph eagerly via `etch::layout::layout(pg, ...)` with NO node\nbudget; etch's layout is super-linear, so ~900 nodes effectively hangs the\nsingle-page export. The serve path already guards this\n(rivet-cli/src/render/graph.rs `DEFAULT_NODE_BUDGET = 200` + a \"Graph above node\nbudget\" page) — the static export did not.\n\nFix: in `render_section_graph`, if `node_count > 200`, skip the layout and emit\na short note (\"Graph has N nodes, exceeding the 200-node static-render budget —\nview it interactively in `rivet serve`\"), mirroring the serve guard.\n\nTest (export::tests): render_section_graph_over_budget_skips_layout — a\n250-node graph returns the budget note and NO `<svg>` (the layout that hangs).\n\nConfirmed with: cargo test -p rivet-core --lib\nexport::tests::render_section_graph_over_budget_skips_layout (pass), cargo fmt\n--check, cargo clippy --all-targets -- -D warnings (exit 0), rivet validate PASS.\nManually verified `rivet export --format html --single-page` on the rivet repo\nnow completes in ~3s (was minutes/hang) with the budget note present.\n\nImplements: REQ-201\nVerifies: REQ-201\nRefs: REQ-007",
          "timestamp": "2026-06-05T14:22:53-05:00",
          "tree_id": "c11c81a40245c6513139fbbc08b4c9fb41ee0843",
          "url": "https://github.com/pulseengine/rivet/commit/6ffbdd7e9628108c72893cf0848815dc38022604"
        },
        "date": 1780687966594,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 87353,
            "range": "± 556",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 929423,
            "range": "± 9047",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 15118032,
            "range": "± 495578",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2053,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25326,
            "range": "± 54",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 375673,
            "range": "± 2013",
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
            "value": 1452642,
            "range": "± 26342",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 167133,
            "range": "± 1288",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1939897,
            "range": "± 14805",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 30107337,
            "range": "± 943895",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 434321,
            "range": "± 2058",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 17928608,
            "range": "± 105850",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1432009431,
            "range": "± 18462826",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4144,
            "range": "± 51",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 43094,
            "range": "± 202",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 715887,
            "range": "± 3896",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 62908,
            "range": "± 292",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 718813,
            "range": "± 3450",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8090423,
            "range": "± 335193",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1209,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14660,
            "range": "± 61",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 235252,
            "range": "± 2236",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23049,
            "range": "± 48",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 158547,
            "range": "± 556",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1496952,
            "range": "± 22484",
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
          "id": "531f4f33e6dad542e2c26c6314aa02dbc58203f5",
          "message": "docs(agents): add \"Before You Push (Rust)\" fmt/clippy guidance + file REQ-202 (minimal build) (#475)\n\nAddresses issue #438 (AI commits pass locally, fail CI Format/Clippy) via its\nown second suggestion: surface the exact CI gates where agents look. The git\npre-commit hook (scripts/install-hooks.sh) already runs `cargo fmt --all --\ncheck` on staged .rs since #438 was filed, but it requires manual install and\ndoes not cover clippy. The new AGENTS.md \"Before You Push (Rust)\" section gives\nthe verbatim `cargo fmt --all -- --check` + `cargo clippy --all-targets -- -D\nwarnings` one-liners and documents the three traps that bite agents (grep\n'^error' misses -D warnings; -p <crate> skips --all-targets test lints; the\ncommit-msg hook rejects `Word:` body lines).\n\nAlso files REQ-202 (draft) from issue #456: rivet-cli has no minimal build —\n`default = []` and axum/rmcp/lsp-server are unconditional deps, so every\nfrom-source build compiles the full serve+MCP+LSP stack even for the\nvalidate/list hot path. Proposed additive fix keeps features in `default` so\nthe published binary is byte-for-byte unchanged; the feature set is a maintainer\ncall, hence draft.\n\nNote: a stronger fix for #438 — a .claude/settings.json PostToolUse hook that\nauto-runs `cargo fmt --all` on every .rs edit — was attempted but is gated as\nself-modification of agent config and needs explicit maintainer authorization.\n\nConfirmed with: rivet validate PASS (257 warnings, 0 errors).\n\nRefs: REQ-202, REQ-007",
          "timestamp": "2026-06-05T14:27:32-05:00",
          "tree_id": "379dde3e341180cd63e9ef32b8ffbc6bc92ca3e4",
          "url": "https://github.com/pulseengine/rivet/commit/531f4f33e6dad542e2c26c6314aa02dbc58203f5"
        },
        "date": 1780688280070,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 67153,
            "range": "± 676",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 736228,
            "range": "± 4489",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 11632774,
            "range": "± 386214",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1532,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 18605,
            "range": "± 186",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 262385,
            "range": "± 1625",
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
            "value": 1108652,
            "range": "± 21999",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 127912,
            "range": "± 1896",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1478194,
            "range": "± 19920",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 21634013,
            "range": "± 2533368",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 338291,
            "range": "± 790",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 13279552,
            "range": "± 215097",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1059688941,
            "range": "± 7886956",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3225,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 40497,
            "range": "± 495",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 578239,
            "range": "± 3030",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 48159,
            "range": "± 1810",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 514423,
            "range": "± 2954",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 6054584,
            "range": "± 53019",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 917,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 11897,
            "range": "± 156",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 177307,
            "range": "± 1380",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 17375,
            "range": "± 112",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 125481,
            "range": "± 934",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1158417,
            "range": "± 14629",
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
          "id": "6f12e0f8722b9318a748962d6598ab53a49df069",
          "message": "feat(add): stamp AI provenance at creation + emit provenance in the add serializer (REQ-203) (#477)\n\nCloses #476. The AI-provenance system was wired to the editor, not to rivet's\nown mutation commands, so the sanctioned creation path produced UNSTAMPED\nartifacts: cmd_add built the Artifact with `provenance: None`, and the\n.claude/settings.json stamp hook only matches Edit/Write — a heredoc append or\n`rivet add` (both Bash calls) never fired it. For a tool whose pitch is\nAI-artifact auditability, AI-created artifacts silently missing provenance is a\ncorrectness gap.\n\nCompounding bug caught during implementation: `mutate::render_artifact_yaml`\n(the single serializer for the add path) did NOT emit the `provenance` block at\nall, so merely setting `artifact.provenance` would have been a silent no-op (the\nREQ-196/200 class of bug). Both halves are fixed:\n\n- `rivet add` gains `--created-by <human|ai|ai-assisted>` and `--model <M>`;\n  `--created-by` falls back to the RIVET_PROVENANCE_CREATED_BY env var so\n  CI/agent environments can set it once. Value validated up front. Absent =>\n  no provenance block (prior behavior preserved).\n- Extract `current_utc_timestamp()`, shared by cmd_stamp and cmd_add, so both\n  emit identical ISO-8601 timestamps with no chrono dependency.\n- `render_artifact_yaml` now emits the `provenance:` block (field order matches\n  yaml_edit::set_provenance).\n\nTests (rivet-core): render_artifact_yaml_emits_provenance_when_present and\nrender_artifact_yaml_omits_provenance_when_absent.\n\nConfirmed with: cargo test -p rivet-core --lib render_artifact_yaml_ (4 passed);\nend-to-end on a fresh `rivet init` project — `rivet add --created-by ai-assisted\n--model claude-opus-4-8` wrote the provenance block, plain add wrote none,\nRIVET_PROVENANCE_CREATED_BY=ai stamped from env, --created-by robot errored,\nrivet validate PASS; cargo fmt --all -- --check (exit 0); cargo clippy\n--all-targets -- -D warnings (exit 0, only pre-existing MSRV-config warning).\n\nImplements: REQ-203\nVerifies: REQ-203\nRefs: REQ-007",
          "timestamp": "2026-06-05T14:29:41-05:00",
          "tree_id": "55b15872fe4551c2a1c6e897900d9d4b24c0768f",
          "url": "https://github.com/pulseengine/rivet/commit/6f12e0f8722b9318a748962d6598ab53a49df069"
        },
        "date": 1780688413024,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84336,
            "range": "± 822",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 899904,
            "range": "± 7145",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12209239,
            "range": "± 454176",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2121,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25494,
            "range": "± 56",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 388231,
            "range": "± 7599",
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
            "value": 1439571,
            "range": "± 15891",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 161061,
            "range": "± 1358",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1923004,
            "range": "± 4714",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 24024627,
            "range": "± 226497",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 457355,
            "range": "± 2298",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 16712377,
            "range": "± 116907",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1400043608,
            "range": "± 14871949",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4271,
            "range": "± 21",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 59479,
            "range": "± 207",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 747329,
            "range": "± 2297",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 64022,
            "range": "± 164",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 703341,
            "range": "± 2550",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7577641,
            "range": "± 70985",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1295,
            "range": "± 12",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15593,
            "range": "± 109",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 341020,
            "range": "± 1075",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23667,
            "range": "± 93",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 167033,
            "range": "± 1984",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1577449,
            "range": "± 17010",
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
          "id": "2245e73f9be91c9c634c0f44a76505640d5fdfa9",
          "message": "fix(serve,lsp): sort the two remaining nondeterministic store.iter() output sites by id (REQ-204) (#478)\n\nFollow-on audit of #415. REQ-159 already added Store::iter_sorted() + the doc\nwarning and migrated query.rs/migrate_cmd/render::externals. This audits the\nremaining `store.iter()` ordered-output candidates and fixes the two that\ngenuinely regress:\n\n1. serve /api/search: artifact + doc matches were pushed in HashMap order, then\n   `results.truncate(50)`. So with >50 matches, WHICH 50 survive — not just\n   their order — varied per process. Now sorts results by the `id` field before\n   truncating.\n2. LSP id-completion (`lsp_completion`, the `[[`/`target:` branch) pushed\n   CompletionItems in HashMap order while the sibling `type:` branch already\n   sorted. Extracted `artifact_id_completions(store)` built via iter_sorted()\n   (ascending id), restoring consistency.\n\nAudited and confirmed already-safe (no change): query.rs::execute, migrate_cmd\n(iter_sorted), render/externals (sorts), export filter (sorts), serve tree /\nsearch-expand (BTreeMap / sort), validate & coverage filter-rebuilds (set\nmembership), HashSet id collects, aggregation loops.\n\nTest (lsp_tests): artifact_id_completions_are_sorted_by_id — ids inserted out of\norder come back ascending.\n\nConfirmed with: cargo test -p rivet-cli --bin rivet\nlsp_tests::artifact_id_completions_are_sorted_by_id (pass), cargo fmt --check,\ncargo clippy --all-targets -- -D warnings (exit 0), rivet validate PASS.\n\nImplements: REQ-204\nVerifies: REQ-204\nRefs: REQ-159",
          "timestamp": "2026-06-05T14:31:12-05:00",
          "tree_id": "5e61a838cda74ee0ae0fd052286248199e79e9bb",
          "url": "https://github.com/pulseengine/rivet/commit/2245e73f9be91c9c634c0f44a76505640d5fdfa9"
        },
        "date": 1780688789156,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 83550,
            "range": "± 292",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 898869,
            "range": "± 11325",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 17423977,
            "range": "± 1099318",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2214,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26001,
            "range": "± 1356",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 350082,
            "range": "± 5858",
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
            "value": 1445460,
            "range": "± 40079",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 162417,
            "range": "± 1295",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1915342,
            "range": "± 49625",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 30341567,
            "range": "± 3021839",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 453262,
            "range": "± 8466",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 17477300,
            "range": "± 218377",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1505932272,
            "range": "± 22469101",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4386,
            "range": "± 10",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60371,
            "range": "± 342",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 746607,
            "range": "± 2516",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 62544,
            "range": "± 401",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 713749,
            "range": "± 4797",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7946631,
            "range": "± 387520",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1259,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15342,
            "range": "± 147",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 348021,
            "range": "± 8946",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23982,
            "range": "± 108",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 168735,
            "range": "± 2777",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1585191,
            "range": "± 32010",
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
          "id": "e50c99592c2f1ae0206a9e136bf06877faab3110",
          "message": "feat(validate+schema): surface schema set name@version + source everywhere (#431, closes #484) (#483)\n\n* feat(validate): surface the schema set (name@version + source) so upgrades aren't silent (REQ-205, #431)\n\nIssue #431: a project on builtin schemas validates against whatever schema copy\nis compiled into the rivet binary (the loader prefers on-disk, else falls back\nto embedded). Every release that tightens a builtin schema silently changes\nvalidation for embedded-schema consumers — a `rivet validate` that passed now\nflags unchanged artifacts, with nothing indicating the schema moved. The\n`version:` field existed but was never surfaced.\n\nThis implements the surfacing (option 3): `rivet validate` now reports the schema\nset it ran against.\n\n- rivet-core: `embedded::resolve_schema_provenance` builds on the existing\n  `schema_sources` classifier (REQ-177) — one on-disk/embedded vocabulary — and\n  adds the parsed `version` plus auto-discovered bridges. Returns\n  `SchemaProvenance { name, version, source, path }`.\n- rivet-cli: validate prints `Schemas: <name>@<version> (embedded|on-disk), …`\n  (text) and a top-level `schemas` array (json). No validation semantics change.\n\nPinning/gating (turning the cosmetic version into a hard gate, option 2) remains\na separate maintainer call on syntax.\n\nTest (embedded::tests): resolve_schema_provenance_reports_version_and_source —\non-disk reports its version + \"on-disk\"; embedded reports a non-empty compiled-in\nversion + \"embedded\"; missing omitted.\n\nConfirmed with: cargo test -p rivet-core --lib\nembedded::tests::resolve_schema_provenance_reports_version_and_source (pass);\n`rivet validate` prints `Schemas: common@0.1.0 (on-disk), …` (incl. bridges);\n`rivet validate --format json` emits the `schemas` array; rivet validate PASS;\ncargo fmt --check + cargo clippy --all-targets -- -D warnings (exit 0).\n\nImplements: REQ-205\nVerifies: REQ-205\nRefs: REQ-177\n\n* feat(schema): rivet schema sources shows version + bridges, consistent with validate (REQ-205, closes #484)\n\nFollow-on within the same #431 surfacing work. After the previous commit made\n`rivet validate` print the schema set as name@version (on-disk|embedded), the\ndedicated `rivet schema sources` command was left LESS informative — it showed\nneither the version nor the auto-discovered bridge schemas (7 entries vs\nvalidate's 9). #484.\n\n- rivet-core: factored the version lookup into `schema_version_of(name, source)`\n  and the name-set expansion into `schema_names_with_bridges(names)`, both shared\n  by `resolve_schema_provenance` and the CLI so the two surfaces can't drift.\n- rivet-cli: `cmd_schema_sources` now reports the full effective set (requested\n  + bridges) with each schema's version, in both text and json. It keeps\n  reporting `MISSING` schemas (the dedicated command's diagnostic value, which\n  the validate surfacing intentionally omits).\n\nTests (embedded::tests): schema_version_of_reads_on_disk_embedded_and_missing,\nschema_names_with_bridges_appends_discovered_bridges.\n\nConfirmed with: cargo test -p rivet-core --lib embedded::tests (4 pass);\n`rivet schema sources` now lists 9 schemas with versions incl. the two bridges,\nmatching `rivet validate`'s Schemas line; cargo fmt --check + cargo clippy\n--all-targets -- -D warnings (exit 0); rivet validate PASS.\n\nImplements: REQ-205\nVerifies: REQ-205\nRefs: REQ-177",
          "timestamp": "2026-06-05T14:32:31-05:00",
          "tree_id": "a89296147efefcabc266a380aa499d9601b1211c",
          "url": "https://github.com/pulseengine/rivet/commit/e50c99592c2f1ae0206a9e136bf06877faab3110"
        },
        "date": 1780689071888,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 86191,
            "range": "± 834",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 920270,
            "range": "± 7275",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14567326,
            "range": "± 388416",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1967,
            "range": "± 50",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25225,
            "range": "± 281",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 360106,
            "range": "± 3443",
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
            "value": 1454392,
            "range": "± 46493",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 166840,
            "range": "± 744",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1946694,
            "range": "± 16312",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 33099531,
            "range": "± 1439061",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 447778,
            "range": "± 2217",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 18384629,
            "range": "± 139028",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1467343369,
            "range": "± 18647301",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4165,
            "range": "± 69",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 43974,
            "range": "± 1577",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 753048,
            "range": "± 8736",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 62444,
            "range": "± 163",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 720400,
            "range": "± 2548",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 9766072,
            "range": "± 555537",
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
            "value": 14746,
            "range": "± 29",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 238415,
            "range": "± 4682",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22553,
            "range": "± 69",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 158347,
            "range": "± 1421",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1486269,
            "range": "± 15959",
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
          "id": "aec3351586baddeaf40b8380d83e70a7a27930f3",
          "message": "ci: warn when a schema changes without a version bump (REQ-206, closes #485) (#487)\n\nchange with `version:` left unchanged silently alters validation for every\nembedded-schema consumer (#431) — and the version surfaced by validate /\nschema sources (#483) stays uninformative. Every schema is 0.1.0 except aspice\n(0.2.0); common.yaml changed across 8 commits with zero version bumps.\n\nscripts/check-schema-version-bump.sh diffs schemas/*.yaml (excluding\nmigrations/) against a base ref and reports any schema whose content changed\nbut whose `version:` line did not. Warn-only by default (a comment/whitespace\nedit needs no bump); STRICT=1 enforces — mirroring the docs-check coverage\ngate. Wired into ci.yml as a `schema-version-bump` job on pull_request\n(fetch-depth 0 to diff the base), emitting ::warning:: annotations inline.\n\nConfirmed with: scripts/check-schema-version-bump.sh f2ecf31^ f2ecf31 warns\nabout common.yaml + exits 0; STRICT=1 same range exits 1; a no-schema-change\nrange prints OK + exits 0; predicate matches a changed (quoted) version: line\nand ignores rule-only hunks; ci.yml parses; rivet validate PASS (257 warnings).\n\nImplements: REQ-206\nVerifies: REQ-206\nRefs: REQ-054",
          "timestamp": "2026-06-05T14:34:45-05:00",
          "tree_id": "3c6fe7ea8b20f120ecdfe85e10d8a713ca85b31c",
          "url": "https://github.com/pulseengine/rivet/commit/aec3351586baddeaf40b8380d83e70a7a27930f3"
        },
        "date": 1780689369885,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85327,
            "range": "± 2243",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 928445,
            "range": "± 15152",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 15607580,
            "range": "± 1259113",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1970,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25071,
            "range": "± 63",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 348731,
            "range": "± 2608",
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
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1448059,
            "range": "± 22747",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 177117,
            "range": "± 734",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1982055,
            "range": "± 13940",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 28317553,
            "range": "± 288514",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 444049,
            "range": "± 1872",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 18288862,
            "range": "± 240330",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1449891898,
            "range": "± 22920003",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4126,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 44115,
            "range": "± 1808",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 729039,
            "range": "± 4576",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 63771,
            "range": "± 745",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 723033,
            "range": "± 2323",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8255813,
            "range": "± 263660",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1118,
            "range": "± 18",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15946,
            "range": "± 136",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 236912,
            "range": "± 8509",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22111,
            "range": "± 64",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 156055,
            "range": "± 530",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1476668,
            "range": "± 9774",
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
          "id": "00b59a5808e3fa4f7a249aa288900d9ae3bb4c0c",
          "message": "test(playwright): lift node budget in the variant-scoping graph invariant so dataset growth doesn't fail it (#436) (#491)\n\nThe one red gate on main. `rendering-invariants.spec.ts` › \"/graph?variant=\nminimal-ci IS scoped\" asserts `fullNodes >= scopedNodes`, but the dogfood\ndataset grew past 200 requirement nodes, so the UNSCOPED\n`/graph?types=requirement` now returns the \"above node budget\" placeholder\n(0 rendered nodes) instead of an SVG — making fullNodes=0 < scopedNodes and the\ntest fail. Added `&limit=2000` to both the scoped and full fetches (same pattern\ngraph.spec.ts already uses) so neither view is budget-clipped and the\nscope-reduces-nodes invariant stays meaningful as the dataset grows.\n\nVerified locally: the exact failing test passes, and the full\nrendering-invariants.spec.ts (13 tests) passes. Full suite was 399 passed /\n1 failed before this — this was the only failure.\n\nRefs: REQ-171",
          "timestamp": "2026-06-05T15:34:31-05:00",
          "tree_id": "c4bb109ddd842826b90182855b8d6cf8e1e47a63",
          "url": "https://github.com/pulseengine/rivet/commit/00b59a5808e3fa4f7a249aa288900d9ae3bb4c0c"
        },
        "date": 1780692349946,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 77712,
            "range": "± 837",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 947244,
            "range": "± 2715",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 16722967,
            "range": "± 557043",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1717,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 19422,
            "range": "± 556",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 362166,
            "range": "± 1124",
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
            "value": 1374502,
            "range": "± 21285",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 161085,
            "range": "± 464",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1935155,
            "range": "± 14837",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 49246479,
            "range": "± 2103424",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 418868,
            "range": "± 3382",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 15651567,
            "range": "± 234368",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 966587939,
            "range": "± 5057977",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3983,
            "range": "± 12",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 41476,
            "range": "± 3751",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 733595,
            "range": "± 3624",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 52725,
            "range": "± 141",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 586124,
            "range": "± 2412",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 9164821,
            "range": "± 578294",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 893,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 11653,
            "range": "± 194",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 300197,
            "range": "± 1202",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22613,
            "range": "± 45",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 165081,
            "range": "± 601",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1551509,
            "range": "± 17822",
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
          "id": "00876df0564b7e96d9103dc3c98eeb2ee024b9a2",
          "message": "feat(serve): presentation/clean mode hides working-state chrome for recordings (REQ-207, closes #482) (#492)\n\n#482: the serve dashboard context bar always shows branch@sha, an \"N\nuncommitted\" badge, the absolute project path, and Reload/Print buttons — which\nleaked into every frame of the intro-video capture (unprofessional, and exposes\nin-progress branch names / machine paths in published media).\n\nAdds `?presentation=1` (alias `?clean=1`): an inline <head> script sets a\n`presentation` class on the document root, and CSS hides `.context-bar` while\nit's set. Client-side and set once on load, so it survives HTMX swaps (which\nonly replace #content) — the capture spec / a user just appends the param.\nDefault (no param) is unchanged; no server plumbing.\n\nTest (presentation-mode.spec.ts): context bar visible normally, hidden with\n?presentation=1 and ?clean=1, and the class survives an HTMX navigation.\nDataset-independent (the bar renders on every page regardless of corpus size).\n\nConfirmed with: cargo build -p rivet-cli; curl /artifacts?presentation=1 shows\nthe toggle + CSS rule; npx playwright test presentation-mode.spec.ts (4 passed);\ncargo fmt --check + clippy --all-targets -- -D warnings (exit 0); rivet validate PASS.\n\nImplements: REQ-207\nVerifies: REQ-207\nRefs: FEAT-001",
          "timestamp": "2026-06-05T16:24:43-05:00",
          "tree_id": "d1ab542073f4a3705292605ac2649c40baa39458",
          "url": "https://github.com/pulseengine/rivet/commit/00876df0564b7e96d9103dc3c98eeb2ee024b9a2"
        },
        "date": 1780695221774,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 83754,
            "range": "± 668",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 889989,
            "range": "± 14546",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 16079105,
            "range": "± 1379787",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2250,
            "range": "± 10",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26644,
            "range": "± 98",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 385626,
            "range": "± 2297",
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
            "value": 1449569,
            "range": "± 21463",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 164072,
            "range": "± 2087",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1909698,
            "range": "± 24933",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 27865661,
            "range": "± 2885826",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 468871,
            "range": "± 2590",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 17110445,
            "range": "± 170184",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1386843469,
            "range": "± 32126563",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4313,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60255,
            "range": "± 446",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 738808,
            "range": "± 6483",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 63610,
            "range": "± 824",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 702006,
            "range": "± 3848",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7792105,
            "range": "± 439775",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1154,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15274,
            "range": "± 47",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 320145,
            "range": "± 2621",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23837,
            "range": "± 132",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 166846,
            "range": "± 429",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1584680,
            "range": "± 13804",
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
          "id": "cab7f437631313906a8ab54b4be18b8db72858ff",
          "message": "ci(nextest): retry flaky tests so one serve-test race doesn't red main (closes #493) (#494)\n\nMain's Test gate flaked red on commit 00876df (additive dashboard HTML) while the\ncode was sound — `cargo test --workspace` and `cargo nextest run --all --profile\nci` both pass locally (2075/2075). Root cause: the ci nextest profile had\n`fail-fast = false` but no `retries`, so one flaky serve/integration test\n(port/timing race under CI parallelism) fails the whole gate. The repo has\nband-aided this per-test three times already.\n\nAdd `retries = 2` to [profile.ci]: a test that passes on retry is reported FLAKY\n(visible in the summary + JUnit) instead of failing the gate and reddening main;\na genuinely-broken test still fails after all retries, so real regressions aren't\nhidden.\n\nConfirmed with: cargo nextest list --profile ci (config parses); cargo nextest\nrun --all --profile ci → 2075 passed / 0 failed.",
          "timestamp": "2026-06-05T17:50:10-05:00",
          "tree_id": "9ffade20d652a7d14bbce15dd56afde9a5719334",
          "url": "https://github.com/pulseengine/rivet/commit/cab7f437631313906a8ab54b4be18b8db72858ff"
        },
        "date": 1780700349068,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84227,
            "range": "± 1206",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 880383,
            "range": "± 7280",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12769969,
            "range": "± 838663",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2167,
            "range": "± 10",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25857,
            "range": "± 728",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 346252,
            "range": "± 1578",
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
            "value": 1449679,
            "range": "± 28410",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 161882,
            "range": "± 1505",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1902719,
            "range": "± 18767",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 25324461,
            "range": "± 1367573",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 466737,
            "range": "± 3385",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 17553646,
            "range": "± 191687",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1474991560,
            "range": "± 36820126",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4280,
            "range": "± 25",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 58438,
            "range": "± 306",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 741431,
            "range": "± 10172",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 63112,
            "range": "± 289",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 698142,
            "range": "± 3005",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7446003,
            "range": "± 242375",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1305,
            "range": "± 23",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15105,
            "range": "± 121",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 342310,
            "range": "± 1629",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 24324,
            "range": "± 166",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 172748,
            "range": "± 17602",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1568187,
            "range": "± 22609",
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
          "id": "b7f44a1df80feeabefeb57251fe1f7ac438f533a",
          "message": "ci(proptest): upload failing seeds so extended proptest reds are reproducible (closes #495) (#496)\n\nThe Proptest (extended) job runs 1000 random cases, so it can surface a rare\ncounterexample the default Test job (100 cases) misses — but it had no artifact\nupload, so the failing seed (which proptest writes to\n<crate>/proptest-regressions/*.txt) was discarded. A CI-only proptest red was\nthus undiagnosable once the log rotated — and unreachable at all while a run sat\nqueued on self-hosted runner capacity (exactly what happened on cab7f43, where\nthe code was proven sound: rivet-core + rivet-cli both pass at 4000 cases).\n\nAdd an `if: failure()` upload of `**/proptest-regressions/*.txt`. Now a CI proptest\nfailure is reproducible: download the artifact, drop the file in the tree, run\n`cargo test` to replay the exact failing input deterministically.\n\nConfirmed with: ci.yml parses as valid YAML.",
          "timestamp": "2026-06-05T19:02:35-05:00",
          "tree_id": "2fab03a71547a62a27b07d2328245e870e57e70c",
          "url": "https://github.com/pulseengine/rivet/commit/b7f44a1df80feeabefeb57251fe1f7ac438f533a"
        },
        "date": 1780704660463,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 76889,
            "range": "± 200",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 952214,
            "range": "± 23728",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 16881718,
            "range": "± 956224",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1693,
            "range": "± 9",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 19427,
            "range": "± 133",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 340089,
            "range": "± 1036",
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
            "value": 87,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 86,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1363295,
            "range": "± 13727",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 158528,
            "range": "± 711",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1877360,
            "range": "± 78020",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 42632908,
            "range": "± 3565867",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 418412,
            "range": "± 4746",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 15113702,
            "range": "± 273414",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 959579767,
            "range": "± 5731186",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3873,
            "range": "± 94",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 41621,
            "range": "± 998",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 739289,
            "range": "± 48165",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 52780,
            "range": "± 2016",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 584381,
            "range": "± 5875",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8727661,
            "range": "± 507265",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 931,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 11588,
            "range": "± 18",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 299586,
            "range": "± 6090",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22222,
            "range": "± 38",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 160878,
            "range": "± 453",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1518256,
            "range": "± 43349",
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
          "id": "8fa8d5a74920802c2c6b27ffe525c4c91bfe5646",
          "message": "feat(tools/intro-video): record the dashboard in presentation mode (clean frames) (#497)\n\nFollows up REQ-207 (#482, presentation/clean mode for serve): the intro-video\ncapture now appends `?presentation=1` to the four dashboard scene URLs\n(open_dashboard, browse_artifacts, open_artifact, show_coverage), so the\nrecorded video hides the working-state chrome (branch / \"N uncommitted\" / path /\nReload+Print) and shows a clean dashboard regardless of the recording machine's\ngit state. The title/CLI-help/outro scenes use setContent and are unaffected.\n\nThis closes the loop on the chrome that was visible in every frame of the first\nintro-video capture. Verified by composition: presentation mode is proven\n(presentation-mode.spec.ts, 4 passing) and these URLs now use it.\n\nRefs: REQ-207",
          "timestamp": "2026-06-05T19:49:52-05:00",
          "tree_id": "45d55da736b858cec5c71d6adddc3e234a86e106",
          "url": "https://github.com/pulseengine/rivet/commit/8fa8d5a74920802c2c6b27ffe525c4c91bfe5646"
        },
        "date": 1780707535457,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85720,
            "range": "± 306",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 946790,
            "range": "± 9665",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13449886,
            "range": "± 229857",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1964,
            "range": "± 9",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25058,
            "range": "± 681",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 353386,
            "range": "± 1875",
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
            "value": 1453072,
            "range": "± 39823",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 167299,
            "range": "± 1011",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1930954,
            "range": "± 18448",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 27704239,
            "range": "± 455859",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 441225,
            "range": "± 1214",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 18152632,
            "range": "± 435667",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1444242653,
            "range": "± 18263037",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4213,
            "range": "± 32",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 44622,
            "range": "± 1155",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 722562,
            "range": "± 11800",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 59119,
            "range": "± 568",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 732346,
            "range": "± 2363",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8069062,
            "range": "± 846443",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1101,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14558,
            "range": "± 61",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 232754,
            "range": "± 7729",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22082,
            "range": "± 43",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 155990,
            "range": "± 1188",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1480037,
            "range": "± 23210",
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
          "id": "ed8612bb7d673b1478d6b8e7646580a487914a9b",
          "message": "feat(validate): `--new-since <ref>` shows only diagnostics new vs a git ref (REQ-208, closes #488) (#499)\n\nAnswers \"did MY change add any diagnostics?\" without jq over hundreds of lines.\n`rivet validate --new-since <REF>` validates the current tree and a detached git\nworktree of <REF> (each via a `rivet validate --format json` subprocess of the\nsame binary), then prints the set-difference keyed on\n(severity, artifact_id, rule, message). Exits non-zero when any NEW diagnostic is\nat/above `--fail-on` — a ready \"this PR adds no new diagnostics\" CI gate\n(e.g. `rivet validate --new-since origin/main --fail-on warning`).\n\n- Pure diff factored into `diff_new_diagnostics` (unit-tested: current-minus-\n  baseline by the 4-field key; empty when current is a subset).\n- `--new-since` short-circuits in the Validate dispatch (like `--explain`).\n- Worktree always cleaned up; no new runtime dep (PID-scoped temp dir, not the\n  dev-only `tempfile`, per #456).\n\nConfirmed with: cargo test -p rivet-cli --bin rivet new_since_diff_tests (2 pass);\n`rivet validate --new-since f7fc2d0` on this repo correctly reports the 8 new\ndiagnostics introduced by REQ-201..207 (their requirement-coverage warnings),\n`--new-since HEAD` reports 0, no worktree left behind; cargo fmt --check +\nclippy --all-targets -- -D warnings (exit 0); rivet validate PASS.\n\nImplements: REQ-208\nVerifies: REQ-208\nRefs: REQ-007",
          "timestamp": "2026-06-05T20:54:39-05:00",
          "tree_id": "6ec7bcbfa05aa0479aad2e7aac3ff3dfd79862d9",
          "url": "https://github.com/pulseengine/rivet/commit/ed8612bb7d673b1478d6b8e7646580a487914a9b"
        },
        "date": 1780711430401,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85034,
            "range": "± 286",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 940759,
            "range": "± 5167",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 19266279,
            "range": "± 1566408",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1990,
            "range": "± 20",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 23060,
            "range": "± 600",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 356510,
            "range": "± 3177",
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
            "value": 1448970,
            "range": "± 14890",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 167143,
            "range": "± 865",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 2111617,
            "range": "± 89649",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 51243381,
            "range": "± 3104799",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 447061,
            "range": "± 1861",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 19361494,
            "range": "± 184438",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1500272603,
            "range": "± 44622407",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4145,
            "range": "± 18",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 44047,
            "range": "± 480",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 740330,
            "range": "± 34042",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 67295,
            "range": "± 305",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 771710,
            "range": "± 2834",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 11280029,
            "range": "± 338678",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1455,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 16786,
            "range": "± 125",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 255954,
            "range": "± 4223",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22586,
            "range": "± 67",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 157956,
            "range": "± 856",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1512347,
            "range": "± 11420",
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
          "id": "c6b57d66ea5d859ee5933e05f0038ed7369b04ea",
          "message": "fix(cli): make --project/--schemas global so they work in any position (REQ-209, closes #500) (#501)\n\nThese top-level path args lacked `global = true`, so `rivet validate --project X`\nerrored (only `rivet --project X validate` parsed) — and with `--format json`\nproduced empty stdout, a confusing failure for tools shelling out to rivet (it\ncost a debug cycle in the #488 `--new-since` subprocess). Marking both\n`global = true` makes them position-independent; additive (pre-subcommand form\nstill parses).\n\nTest (cli_global_args_tests): both args parse after the subcommand, and `-p`\nbefore the subcommand still parses.\n\nConfirmed with: cargo test -p rivet-cli --bin rivet cli_global_args_tests (pass);\n`rivet validate --project .` / `-p . --format json` / `--schemas ./schemas` all\nsucceed (previously errored); cargo fmt --check + clippy --all-targets -- -D\nwarnings (exit 0); rivet validate PASS.\n\nImplements: REQ-209\nVerifies: REQ-209\nRefs: REQ-007",
          "timestamp": "2026-06-05T21:21:01-05:00",
          "tree_id": "d406de867150e3465e0af1cdd6fa3e1c44a322e5",
          "url": "https://github.com/pulseengine/rivet/commit/c6b57d66ea5d859ee5933e05f0038ed7369b04ea"
        },
        "date": 1780713005006,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84420,
            "range": "± 320",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 888866,
            "range": "± 11424",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14296405,
            "range": "± 768126",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2143,
            "range": "± 25",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 23308,
            "range": "± 51",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 368450,
            "range": "± 3807",
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
            "value": 1471049,
            "range": "± 45877",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 162600,
            "range": "± 581",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1865175,
            "range": "± 18975",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 28826244,
            "range": "± 1298280",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 453944,
            "range": "± 2846",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 17253798,
            "range": "± 128609",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1503958026,
            "range": "± 34948164",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4267,
            "range": "± 26",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 62776,
            "range": "± 290",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 773538,
            "range": "± 4822",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 62987,
            "range": "± 365",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 697566,
            "range": "± 3182",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8423932,
            "range": "± 512938",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1117,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 16325,
            "range": "± 514",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 347668,
            "range": "± 3273",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23450,
            "range": "± 150",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 167465,
            "range": "± 1302",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1577547,
            "range": "± 13203",
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
          "id": "e94ac9542a839c4942b1f5129605c5a700ac0209",
          "message": "fix(cli): revert --project/--schemas global — clap debug-asserts with positional subcommands (reverts REQ-209/#501) (#502)\n\nREQ-209 / #501 marked --project/--schemas `global = true` to fix #500, but that\nbroke main: 3 cli_commands integration tests (next_id_json,\nnext_id_positional_shorthand, all_json_outputs_are_valid) panicked in clap's\ndebug_asserts — clap does NOT allow a `global` arg to coexist with subcommands\nthat take positionals (next-id <type>, link <src> <tgt>, snapshot diff\n<baseline>, …). My pre-merge check only exercised `validate` (no positional), so\nit passed; the full suite would have caught it.\n\nReverts the `global = true` on both args, removes the now-invalid\ncli_global_args_tests and the REQ-209 artifact. #500's premise (args after the\nsubcommand) is therefore a clap limitation, not fixable this way — the workaround\nis the standard convention: put --project before the subcommand\n(`rivet -p X validate`). Documented on the arg + reopening #500.\n\nConfirmed with: cargo test -p rivet-cli --test cli_commands (127 passed, 0\nfailed — the 3 regressions fixed); cargo fmt --check + clippy --all-targets -- -D\nwarnings (exit 0); rivet validate PASS.\n\nRefs: REQ-007",
          "timestamp": "2026-06-05T22:49:37-05:00",
          "tree_id": "7df54c545a9aa82da2aa9af4f4c895cf7e05dc92",
          "url": "https://github.com/pulseengine/rivet/commit/e94ac9542a839c4942b1f5129605c5a700ac0209"
        },
        "date": 1780718260913,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 67654,
            "range": "± 3608",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 724588,
            "range": "± 3390",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13016161,
            "range": "± 833543",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1544,
            "range": "± 11",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 18836,
            "range": "± 320",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 263616,
            "range": "± 2700",
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
            "value": 1116285,
            "range": "± 18770",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 127342,
            "range": "± 429",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1485700,
            "range": "± 14208",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 24740238,
            "range": "± 1227213",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 339829,
            "range": "± 1166",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 14380052,
            "range": "± 167404",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1146681493,
            "range": "± 7596817",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3230,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 33990,
            "range": "± 530",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 578137,
            "range": "± 2534",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 44967,
            "range": "± 425",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 518272,
            "range": "± 2497",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 6244657,
            "range": "± 325897",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 882,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 11308,
            "range": "± 17",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 175603,
            "range": "± 2580",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 17265,
            "range": "± 41",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 121441,
            "range": "± 356",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1148895,
            "range": "± 10832",
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
          "id": "6b0ff34cdda5f5add42905adb959159a99476bcf",
          "message": "docs(cli): clarify --project/--schemas must precede the subcommand (#500) (#503)\n\nThe revert (#502) left clap-internals jargon (\"debug-asserts ... next-id/link/\nsnapshot diff\") in the user-facing `--help` for `--project`. Move that rationale\nto a plain `//` maintainer comment and make the `///` help user-facing: state\nthe actionable convention — pass `--project`/`--schemas` BEFORE the subcommand\n(`rivet -p <dir> validate`), like `git -C <dir> <cmd>`. Addresses the UX\nconfusion in #500 (a misplaced `--project` erroring with empty stdout) by\nsurfacing the convention in `--help`.\n\nDoc-comment only; no logic change. Confirmed with: cargo test -p rivet-cli\n--test cli_commands (127 passed, 0 failed — the full suite, incl. help tests);\ncargo fmt --check + clippy --all-targets -- -D warnings (exit 0).\n\nRefs: REQ-007",
          "timestamp": "2026-06-05T23:21:20-05:00",
          "tree_id": "e4742cde4f0f47a509970260fd2d716c2e2fd1e4",
          "url": "https://github.com/pulseengine/rivet/commit/6b0ff34cdda5f5add42905adb959159a99476bcf"
        },
        "date": 1780720233047,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84808,
            "range": "± 713",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 892046,
            "range": "± 8812",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13048184,
            "range": "± 1502486",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2191,
            "range": "± 34",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25474,
            "range": "± 318",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 369396,
            "range": "± 6981",
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
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 94,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1433773,
            "range": "± 26739",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 163389,
            "range": "± 1481",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1904488,
            "range": "± 44757",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 26356811,
            "range": "± 1461946",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 458493,
            "range": "± 19502",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 16937270,
            "range": "± 314531",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1471669299,
            "range": "± 29182531",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4293,
            "range": "± 36",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60682,
            "range": "± 512",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 747850,
            "range": "± 12578",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 61424,
            "range": "± 331",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 702803,
            "range": "± 3841",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 9478096,
            "range": "± 767685",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1157,
            "range": "± 18",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15195,
            "range": "± 72",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 345061,
            "range": "± 5627",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23321,
            "range": "± 563",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 167567,
            "range": "± 920",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1596693,
            "range": "± 87919",
            "unit": "ns/iter"
          }
        ]
      }
    ]
  }
}