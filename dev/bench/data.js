window.BENCHMARK_DATA = {
  "lastUpdate": 1791553426858,
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
          "id": "48df5f7980d7d944c018dbc40f60f1995abde4ec",
          "message": "ci(compliance): gate the release on rivet validate's exit code (#953) (#961)\n\nThe Validate step of `.github/actions/compliance/action.yml` captured\n`rivet validate`'s exit code as `RC` and then never used it, and derived\n`result=PASS|FAIL` by grepping the tool's stdout for \"Result: PASS\".\nThe step's last command was `echo`, so it always exited 0 — a failing\nvalidate produced a green step, `build-compliance` succeeded, and\n`create-release` (which depends on `build-compliance` in release.yml)\nshipped a GitHub Release on a corpus that failed validation. A validate\npanic that printed nothing was the worst shape: no \"Result:\" line at\nall, `result=FAIL`, and still a green step.\n\nFix by extracting the logic to `run_validate.sh` and treating validate's\nexit code as the source of truth:\n  * echoes validate's captured output verbatim (CI log unchanged);\n  * writes `result=PASS` when rc == 0, `result=FAIL` otherwise;\n  * exits with the same rc, so a red validate now fails the step, fails\n    the `build-compliance` job, and blocks `create-release`.\n\n`run_validate_test.sh` covers the two fall-through shapes the previous\ncode allowed: an rc=1 exit whose stdout still contains \"Result: PASS\"\nelsewhere (grep-stdout false-green), and a silent panic with empty\noutput (last-command-is-echo false-green). Both now propagate correctly.\nThe test is wired into the `yaml-lint` job in ci.yml next to the sibling\n#671 size-guard test.\n\nThe `verify_archive_size.sh` missing-floor concern the issue also names\nis out of scope for this PR — the report ceiling and floor are related\nbut independent gates.\n\nCloses #953\n\n\nClaude-Session: https://claude.ai/code/session_01Euv8H5osPN4nf6jGBGwRdQ\n\nCo-authored-by: Claude <noreply@anthropic.com>",
          "timestamp": "2026-09-16T18:48:03+02:00",
          "tree_id": "3835bda10359889a21aad8235d6530ef35e4a167",
          "url": "https://github.com/pulseengine/rivet/commit/48df5f7980d7d944c018dbc40f60f1995abde4ec"
        },
        "date": 1789578830812,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84424,
            "range": "± 1564",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 893803,
            "range": "± 5449",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13708289,
            "range": "± 702313",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2186,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25367,
            "range": "± 339",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 364594,
            "range": "± 2430",
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
            "value": 1529367,
            "range": "± 24553",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 164119,
            "range": "± 2829",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1957241,
            "range": "± 6688",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 29334762,
            "range": "± 2434450",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 502715,
            "range": "± 4734",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 16194992,
            "range": "± 402343",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1263131214,
            "range": "± 13001603",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4449,
            "range": "± 16",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60480,
            "range": "± 267",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 811377,
            "range": "± 55562",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 59340,
            "range": "± 310",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 705727,
            "range": "± 3168",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7881400,
            "range": "± 301095",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1035,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14339,
            "range": "± 118",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 339046,
            "range": "± 5516",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23404,
            "range": "± 70",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 158939,
            "range": "± 1881",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1480983,
            "range": "± 19132",
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
          "id": "13f00ccfa3bf233203ec47235ec35e31cb9e191e",
          "message": "fix(yaml): preserve an artifact's top-level domain keys instead of silently dropping them (REQ-362) (#964)\n\nA generic-yaml artifact that wrote domain keys at the top level instead\nof under `fields:` lost them silently on load (REQ-277's category,\npriority and upstream-ref). They are now preserved into fields, and the\ncanonical `fields:` entry wins on collision. Refusing unknown keys\ninstead broke the spar external (0 artifacts loaded), so preservation\nis the fix. The differential gate's pin drops to the one remaining\ndivergence, DD-039 (REQ-363).\n\nImplements: REQ-362\nRefs: REQ-348, REQ-363\n\nCo-Authored-By: Claude Opus 5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9",
          "timestamp": "2026-09-17T00:52:57+02:00",
          "tree_id": "c5821e7b24538044eac4cb466db30f7e8633dfa9",
          "url": "https://github.com/pulseengine/rivet/commit/13f00ccfa3bf233203ec47235ec35e31cb9e191e"
        },
        "date": 1789608296493,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 68621,
            "range": "± 238",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 734117,
            "range": "± 4732",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13341132,
            "range": "± 1110021",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1504,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 18113,
            "range": "± 56",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 257182,
            "range": "± 4113",
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
            "range": "± 0",
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
            "value": 1180200,
            "range": "± 16586",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 126598,
            "range": "± 1036",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1478247,
            "range": "± 9180",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 28151120,
            "range": "± 2035675",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 359496,
            "range": "± 1481",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 12808819,
            "range": "± 175361",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 943111233,
            "range": "± 13670273",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3197,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 33757,
            "range": "± 351",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 584406,
            "range": "± 2701",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 45822,
            "range": "± 163",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 507274,
            "range": "± 2997",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 6049675,
            "range": "± 299756",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 842,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 11667,
            "range": "± 79",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 171840,
            "range": "± 552",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 16742,
            "range": "± 155",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 112280,
            "range": "± 404",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1050484,
            "range": "± 40195",
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
          "id": "218a950864742ec08454c56adf9f12fb0d8fef62",
          "message": "fix(yaml): multi-line plain scalars were truncated at their first line on the rowan read path (REQ-363) (#970)\n\nDD-039's multi-line plain scalar was truncated at its first line by the\nrowan read path. The CST now keeps continuation lines, including across\nblank and whitespace-only lines, and the HIR folds them (YAML 1.2 7.3.3,\nas PyYAML does). With REQ-362 on main the corpus differential gate\nagrees 26 of 26, and KNOWN_DIVERGENCES is 0. PR-diff mutation testing\nfound four surviving mutants. Three are now caught by new tests, and\nthe fourth was an equivalent guard that has been removed. REQ-363 moves\nfrom v0.39.0 to v0.38.0, since it is a precondition of REQ-346.\n\nFixes: REQ-363\nVerifies: REQ-363\nRefs: REQ-346, REQ-348\n\nCo-Authored-By: Claude Opus 5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9",
          "timestamp": "2026-09-17T19:30:23+02:00",
          "tree_id": "22ee72ac6febf40795ff906ae64eaf004b902db3",
          "url": "https://github.com/pulseengine/rivet/commit/218a950864742ec08454c56adf9f12fb0d8fef62"
        },
        "date": 1789667322885,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 79204,
            "range": "± 854",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 926621,
            "range": "± 13387",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14001787,
            "range": "± 543226",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1547,
            "range": "± 19",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 18110,
            "range": "± 106",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 263164,
            "range": "± 2364",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 79,
            "range": "± 1",
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
            "value": 79,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1400306,
            "range": "± 8788",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 161186,
            "range": "± 591",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1829220,
            "range": "± 65317",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 34546853,
            "range": "± 1591222",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 447831,
            "range": "± 2762",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 16729284,
            "range": "± 130819",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1206125916,
            "range": "± 4225846",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3750,
            "range": "± 42",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 41524,
            "range": "± 292",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 827850,
            "range": "± 4578",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 54385,
            "range": "± 347",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 561403,
            "range": "± 4413",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7877198,
            "range": "± 366564",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 937,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 11391,
            "range": "± 75",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 278183,
            "range": "± 1961",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 20664,
            "range": "± 664",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 141577,
            "range": "± 852",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1294386,
            "range": "± 9344",
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
          "id": "f16245a723cfc3aa454a0c05f2e1c3a636cec24f",
          "message": "feat(yaml): add the rivet-yaml crate — rivet's own YAML value model (REQ-346 step 1) (#967)\n\nStep 1 of taking YAML reading and writing in-house. The crate ports\nserde_yaml 0.9.34's value model (Value, Mapping, Number, Tagged, the\nValue Serializer/Deserializer, from_value/to_value, indexing and\napply_merge) as safe Rust under #![forbid(unsafe_code)]. from_str and\nto_string still hand off to serde_yaml; later steps replace that\nhand-off with rivet's own CST-backed parser and emitter. Nothing in\nrivet-core or rivet-cli uses the crate yet; the rename that routes them\nthrough it is a separate, regenerated change.\n\nThe port is held to upstream's own specification rather than to new\ntests written for it:\n\n- upstream tests/test_value.rs is ported as tests/value.rs (6 tests),\n  changed only in paths, dedented indoc literals and derive imports;\n- the 74 upstream doctests run against rivet_yaml. As first ported they\n  still said serde_yaml:: and so exercised serde_yaml itself while\n  passing; the doc paths are now rivet_yaml::.\n\nNegative controls, each restored afterwards: making Value::as_str\nreturn None fails 6 doctests; making apply_merge a no-op fails\ntest_merge and only test_merge.\n\nBefore splitting, the rename was A/B-tested on this tree against a\nmain (2cc6fe4) binary. Every read and write path compared was\nbyte-identical: list --full (1077 artifacts), validate, coverage,\nstats, schema list, generic-yaml export, and add / modify / link /\nbatch (every scalar and collection shape) / shard / lock /\nschema migrate --apply over a copy of the repository. That evidence\ntravels with the rename PR.\n\nAttribution and the list of changes from upstream are in\nrivet-yaml/NOTICE.\n\nConfirmed locally with cargo check --workspace --all-targets --locked,\nclippy --all-targets -D warnings on 1.97.0, fmt --check, cargo test -p\nrivet-yaml, rivet validate, rivet docs check and yamllint, all exit 0.\nMSRV 1.89 is not installed on this machine and is left to CI.\n\nImplements: REQ-346\n\n\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9\n\nCo-authored-by: Claude Opus 5 <noreply@anthropic.com>",
          "timestamp": "2026-09-17T20:24:37+02:00",
          "tree_id": "7f68cfd55903902274ebf64a19f0a4adac7fce31",
          "url": "https://github.com/pulseengine/rivet/commit/f16245a723cfc3aa454a0c05f2e1c3a636cec24f"
        },
        "date": 1789670265950,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 80595,
            "range": "± 667",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 958742,
            "range": "± 4628",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12844170,
            "range": "± 331034",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1606,
            "range": "± 10",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 19373,
            "range": "± 101",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 289329,
            "range": "± 1813",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 76,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/1000",
            "value": 76,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 76,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1436208,
            "range": "± 15533",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 168225,
            "range": "± 554",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1879923,
            "range": "± 21138",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 35720434,
            "range": "± 1323333",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 465652,
            "range": "± 6928",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 17067234,
            "range": "± 123906",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1240078044,
            "range": "± 4127822",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3892,
            "range": "± 53",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 41490,
            "range": "± 142",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 892328,
            "range": "± 12549",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 54559,
            "range": "± 366",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 581112,
            "range": "± 7534",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7291375,
            "range": "± 149125",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 910,
            "range": "± 14",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 11672,
            "range": "± 131",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 279954,
            "range": "± 2547",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21255,
            "range": "± 126",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 145049,
            "range": "± 1068",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1331679,
            "range": "± 14939",
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
          "id": "bf9d15b9373e4ff592d17c806253522e7f01f96a",
          "message": "fix(validate): prose-mention regex must match multi-segment ids whole (#972) (#974)\n\nID_MENTION_RE only allowed a single-segment prefix, so in a project with\nboth TR-001 and CM-TR-001 a prose mention of CM-TR-001 matched the SUFFIX\nTR-001 and told the author to link the unrelated requirement, while the\nmulti-segment id itself went undetected.\n\nFixes: REQ-004\nRefs: #972\n\nCo-Authored-By: Claude Opus 5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9",
          "timestamp": "2026-09-23T06:33:54+02:00",
          "tree_id": "4c60a2790ba8ea4f8475d9da849a72b911152b29",
          "url": "https://github.com/pulseengine/rivet/commit/bf9d15b9373e4ff592d17c806253522e7f01f96a"
        },
        "date": 1790138903067,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 78593,
            "range": "± 640",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 953806,
            "range": "± 55997",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 15462633,
            "range": "± 985224",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1717,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 19421,
            "range": "± 250",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 344387,
            "range": "± 1373",
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
            "value": 89,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1420860,
            "range": "± 22277",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 161734,
            "range": "± 768",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1941515,
            "range": "± 16026",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 42500240,
            "range": "± 2789740",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 466278,
            "range": "± 6353",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 17750467,
            "range": "± 287397",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1171131967,
            "range": "± 3284360",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4005,
            "range": "± 48",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 41655,
            "range": "± 416",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 747839,
            "range": "± 3879",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 51617,
            "range": "± 780",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 582903,
            "range": "± 4000",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 10111240,
            "range": "± 407081",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 857,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 11691,
            "range": "± 25",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 289100,
            "range": "± 1363",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 20761,
            "range": "± 37",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 145190,
            "range": "± 341",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1359760,
            "range": "± 6736",
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
          "id": "29302a9172048bc688f75447d6eb9ac725d8fd4a",
          "message": "plan(v0.39): file the three untracked defects (issues 965, 955, 968) (#987)\n\nTwelve open issues carried no artifact, so no readiness query could see them. REQ-366 (modify --where selects read-only externals and is not atomic: 11 files rewritten before it exits 1), REQ-367 (rivet batch has no rollback and zero tests), REQ-368 (the semver gate ran 0 of 254 checks; fixed in v0.38.0 but untracked). All scoped v0.39.0 with rivet release move.\n\nBoth atomicity records state acceptance as a byte-identical tree after a failed mutation, compared as a tree rather than by exit code.\n\nRefs: REQ-250\n\nCo-Authored-By: Claude Opus 5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9",
          "timestamp": "2026-09-23T20:05:48+02:00",
          "tree_id": "d5e0f50f41c4e12b8c68f023ba203b1d05fe522d",
          "url": "https://github.com/pulseengine/rivet/commit/29302a9172048bc688f75447d6eb9ac725d8fd4a"
        },
        "date": 1790189476979,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 86339,
            "range": "± 3288",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 898153,
            "range": "± 5794",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 15739098,
            "range": "± 1260392",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2139,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26369,
            "range": "± 1114",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 386981,
            "range": "± 2342",
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
            "value": 1516862,
            "range": "± 28019",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 163419,
            "range": "± 1052",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1959281,
            "range": "± 14350",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 34916823,
            "range": "± 3042352",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 463136,
            "range": "± 3434",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 15778641,
            "range": "± 460230",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1263321739,
            "range": "± 11646470",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4473,
            "range": "± 354",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 63031,
            "range": "± 1005",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 826120,
            "range": "± 14121",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 60881,
            "range": "± 398",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 689523,
            "range": "± 37610",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 9238757,
            "range": "± 602289",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1093,
            "range": "± 19",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 13994,
            "range": "± 393",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 322077,
            "range": "± 6120",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23170,
            "range": "± 116",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 159141,
            "range": "± 4862",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1498630,
            "range": "± 38090",
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
          "id": "cd27062617eeadcf405aa053e9b682cca1201dc3",
          "message": "ci(kani): run the suite once on push, and give it a budget it can finish in (#839) (#989)\n\nThe action's final step is `${{ inputs.command }} ${{ inputs.args }}`, so the push path — which passed no args — ran cargo-kani over the whole workspace inside the action, and the job then ran cargo kani -p rivet-core again. The first invocation alone exhausted the budget; both main pushes on 2026-09-23 were cancelled at exactly 45:00 with no proof starting.\n\nNow one invocation scoped to rivet-core, and 90 minutes for the 27-harness suite. Not cached deliberately: install measured ~3s plus ~12s setup, against a 7-minute compile.\n\nRefs: REQ-267\n\nCo-Authored-By: Claude Opus 5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9",
          "timestamp": "2026-09-23T21:12:47+02:00",
          "tree_id": "8b400fd517a7827a0bfe66be68da056416889807",
          "url": "https://github.com/pulseengine/rivet/commit/cd27062617eeadcf405aa053e9b682cca1201dc3"
        },
        "date": 1790195302719,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85127,
            "range": "± 1771",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 910744,
            "range": "± 30124",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 19184393,
            "range": "± 1033176",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1923,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24420,
            "range": "± 594",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 351203,
            "range": "± 3947",
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
            "value": 1536517,
            "range": "± 10213",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 163874,
            "range": "± 2667",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1920849,
            "range": "± 35390",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 29734241,
            "range": "± 7612735",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 461459,
            "range": "± 2141",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 14692242,
            "range": "± 100821",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1058107289,
            "range": "± 16176016",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4246,
            "range": "± 14",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 47009,
            "range": "± 516",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 741845,
            "range": "± 5226",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 60119,
            "range": "± 389",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 725890,
            "range": "± 3088",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8039766,
            "range": "± 55302",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1289,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15149,
            "range": "± 41",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 248745,
            "range": "± 1979",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21358,
            "range": "± 53",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 145741,
            "range": "± 656",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1351594,
            "range": "± 19280",
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
          "id": "4de6e01897fc6b793ba31e5d5f42d838bf9ea104",
          "message": "feat(ordeal-certificate): consume ordeal TR-038 SAT witness — downgrade V-ordeal-cert-sat-is-self-checked (#991)\n\nFollows the recheck-gates-verifies shape UNSAT already uses: `witness-sha256`\n(envelope `witness.assignment_sha256`) plus `verification-result: pass`. No new\nrecord kind; composes with `V-ordeal-cert-recheck-gates-verifies` rather than\nbypassing it. The honest boundary moves from \"SAT verdict\" to \"SAT bundle\nwithout a re-checked witness\"; the warning still fires for SAT bundles that\ncarry no witness.\n\nCloses #988.\n\nRefs: REQ-277",
          "timestamp": "2026-09-24T07:36:24+02:00",
          "tree_id": "a58e87ef0938a3fa99fe0be18c1c1bd9ac4de079",
          "url": "https://github.com/pulseengine/rivet/commit/4de6e01897fc6b793ba31e5d5f42d838bf9ea104"
        },
        "date": 1790228981094,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 87050,
            "range": "± 5465",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 909104,
            "range": "± 19807",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14663235,
            "range": "± 911093",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2165,
            "range": "± 16",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25564,
            "range": "± 1083",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 369310,
            "range": "± 2106",
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
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1517052,
            "range": "± 32743",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 163779,
            "range": "± 1449",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1938993,
            "range": "± 16500",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 33461385,
            "range": "± 3300584",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 498186,
            "range": "± 3457",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 16289566,
            "range": "± 166121",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1290745302,
            "range": "± 19392605",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4522,
            "range": "± 51",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 65760,
            "range": "± 703",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 861326,
            "range": "± 19870",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 60042,
            "range": "± 1634",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 701113,
            "range": "± 5032",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 10184455,
            "range": "± 2111342",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1113,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14356,
            "range": "± 302",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 330404,
            "range": "± 8046",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22493,
            "range": "± 69",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 158961,
            "range": "± 2981",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1490189,
            "range": "± 12581",
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
          "id": "ce820fb64d47a36619ecb5318d0052e69dfcd820",
          "message": "release information: publish the generated 11-03 note, and let SQL see `release` (#994)\n\nTwo maintainer-raised gaps in release information, plus the verification of a\nthird.\n\nREQ-372 — `rivet sql` projected every artifact field EXCEPT `release`, so\n`select release, count(*) ... group by release` failed with `identifier not\nfound`. There was no workaround: `release` is a first-class field, not an entry\nin `fields`, so neither `fields_json` nor the `fields` EAV table could reach it.\n\nREQ-373 — every SQL cell crossed `SqlResult.rows: Vec<Vec<String>>`, so\n`COUNT(*)` reached `--format json` as the string \"2\" and `jq 'map(.n) | add'`\nfailed on rivet's own machine-readable output. Cells are now typed; NULL is\n`null` rather than `\"\"`, so a consumer can tell \"no release\" from \"release is\nempty\". `table` and `csv` stringify at the edge, where that is correct.\n\nREQ-369 — REQ-327 generated an ASPICE 11-03 release note and nothing published\nit; the release body was a flat pull-request list. The note is now generated in\nCI at the tag, collected BEFORE the checksum step so cosign's signature over\nSHA256SUMS covers it, and used as the release body with GitHub's generated list\nappended. The body is composed explicitly rather than by combining\n`--notes-file` with `--generate-notes`, an interaction gh does not document,\nand is then READ BACK with the job failing if the note is absent. Because\nrelease.yml fires only on tag push, the logic lives in a sourceable script with\nits own oracle run by CI — otherwise it would have shipped never having\nexecuted.\n\nREQ-368 is verified here by measurement: `--baseline-rev origin/main` runs\n\"196 checks: 196 pass\", the pre-fix form runs \"0 checks: 0 pass, 254 skip\" —\nboth exiting 0. Recorded alongside it is the boundary that a green Semver\nChecks is NOT \"no breaking change\": cargo-semver-checks has no lint for a\npublic field whose type changed, proven on this PR's own `SqlResult` change.\n\nAlso scopes v0.39.0/v0.40.0/v0.41.0 honestly, moving twelve artifacts that\ncould not reach verified, and files REQ-371, REQ-373 and REQ-374.\n\nImplements: REQ-369, REQ-372, REQ-373\nVerifies: REQ-368, REQ-369, REQ-372, REQ-373\nRefs: REQ-327, REQ-345, REQ-371, REQ-374",
          "timestamp": "2026-09-24T16:16:12+02:00",
          "tree_id": "ad2666cc9ae802164a1aef44bf3f89f3624dd613",
          "url": "https://github.com/pulseengine/rivet/commit/ce820fb64d47a36619ecb5318d0052e69dfcd820"
        },
        "date": 1790260143366,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84885,
            "range": "± 2628",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 901977,
            "range": "± 4982",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14065369,
            "range": "± 785850",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2145,
            "range": "± 32",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 27062,
            "range": "± 125",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 354928,
            "range": "± 1509",
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
            "value": 1512625,
            "range": "± 18297",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 160861,
            "range": "± 682",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1962261,
            "range": "± 11620",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 25528617,
            "range": "± 1327724",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 504503,
            "range": "± 4223",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 16622287,
            "range": "± 126262",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1316087571,
            "range": "± 8447270",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4517,
            "range": "± 52",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 62040,
            "range": "± 264",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 840083,
            "range": "± 3405",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 62472,
            "range": "± 202",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 698104,
            "range": "± 2958",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7746163,
            "range": "± 576479",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1157,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14249,
            "range": "± 33",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 328864,
            "range": "± 2104",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22853,
            "range": "± 118",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 159430,
            "range": "± 753",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1486200,
            "range": "± 10672",
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
          "id": "83231d58dad93b092542c797c143f90ad4cd1d66",
          "message": "feat(compliance): put the generated 11-03 release note in the audit bundle (REQ-371) (#999)\n\nThe compliance bundle is the audit deliverable and carried no release note, so\nan assessor handed it alone got no Automotive SPICE 11-03 item. The action\ngains an `extra-files` input and release.yml passes it the SAME generated note\nthat ships as the signed release asset, so the two copies cannot disagree. A\nnamed entry that does not exist fails rather than being skipped. The copy logic\nlives in a script with its own oracle, since the action only runs on a tag.\n\nImplements: REQ-371\nVerifies: REQ-371",
          "timestamp": "2026-09-25T07:24:57+02:00",
          "tree_id": "85ab104bca40eedcebc72182520abd972cfe906b",
          "url": "https://github.com/pulseengine/rivet/commit/83231d58dad93b092542c797c143f90ad4cd1d66"
        },
        "date": 1790314686543,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84382,
            "range": "± 280",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 919073,
            "range": "± 11047",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 17990184,
            "range": "± 1428435",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1906,
            "range": "± 12",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24374,
            "range": "± 89",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 344934,
            "range": "± 1784",
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
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1547403,
            "range": "± 24166",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 167503,
            "range": "± 995",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1978845,
            "range": "± 52415",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 36525770,
            "range": "± 6510853",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 477642,
            "range": "± 1653",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 17450145,
            "range": "± 304509",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1243388577,
            "range": "± 18731229",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4257,
            "range": "± 124",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 44211,
            "range": "± 161",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 760129,
            "range": "± 16503",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 61251,
            "range": "± 831",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 754592,
            "range": "± 6762",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 9300563,
            "range": "± 1224867",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1263,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14213,
            "range": "± 37",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 234752,
            "range": "± 1989",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21567,
            "range": "± 68",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 146041,
            "range": "± 625",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1363458,
            "range": "± 20979",
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
          "id": "32fc25d53bf22e2d56c307b70b9e7c2e13e27c2a",
          "message": "plan(v0.39): the three assessments — OKF, autoformalization, supply-chain bridge (#1000)\n\nREQ-340, REQ-341 and REQ-344 close by recorded decision, each read from source\nand each accepted by the maintainer with reviewed-by rather than by the tool.\n\n- OKF (#549): acknowledge. Five of the nine constructs that make a rivet trace\n  checkable have no OKF representation. DD-078.\n- Autoformalization to Lean (#508): a bounded, pre-registered spike (REQ-380),\n  chosen by the maintainer over the recommendation to acknowledge. The lead's\n  premise that rivet is pre-grounded is false on rivet's corpus; two of its\n  four citations are not in their sources. DD-080.\n- Supply-chain bridge (#107): split. The SBOM/attestation half folds into the\n  release record (REQ-374); the AIBOM half is REQ-379. DD-079.\n\nAlso files REQ-378 (62 of 67 UCAs reference a control action that resolves to\nnothing) and REQ-379.\n\nRefs: REQ-340, REQ-341, REQ-344, REQ-374, REQ-378, REQ-379, REQ-380",
          "timestamp": "2026-09-25T07:34:45+02:00",
          "tree_id": "c871fa862ab4542f88917fc9b9add905bddaf81b",
          "url": "https://github.com/pulseengine/rivet/commit/32fc25d53bf22e2d56c307b70b9e7c2e13e27c2a"
        },
        "date": 1790315306200,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84912,
            "range": "± 683",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 894200,
            "range": "± 4662",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13707774,
            "range": "± 543005",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2122,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26330,
            "range": "± 132",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 370820,
            "range": "± 2981",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 96,
            "range": "± 4",
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
            "value": 1524946,
            "range": "± 30597",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 164644,
            "range": "± 1236",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1949985,
            "range": "± 18554",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 27119680,
            "range": "± 783147",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 490923,
            "range": "± 3372",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 17165933,
            "range": "± 125446",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1368360427,
            "range": "± 10943222",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4564,
            "range": "± 21",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 63452,
            "range": "± 2051",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 863909,
            "range": "± 12542",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 62342,
            "range": "± 267",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 691449,
            "range": "± 5557",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8354123,
            "range": "± 651425",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1078,
            "range": "± 21",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14552,
            "range": "± 67",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 341161,
            "range": "± 2109",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23539,
            "range": "± 126",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 166286,
            "range": "± 1373",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1546382,
            "range": "± 22855",
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
          "id": "3554f468335c9229033d9262fcb4abe22dec4232",
          "message": "fix(docs): no help text may point at a docs topic that does not exist (REQ-382) (#1004)\n\nCloses #1002, fixed as a class. Two help pointers led to docs topics that did\nnot exist, and an unknown topic exited 0 so nothing could notice.\ndocs/release-status.md is embedded, the dead pointer is corrected, an unknown\ntopic exits 1, and a test requires every `rivet docs <topic>` pointer in the\nhelp text and embedded topics to resolve.\n\nImplements: REQ-382\nVerifies: REQ-382",
          "timestamp": "2026-09-25T13:54:39+02:00",
          "tree_id": "bc8ee1b00c55f20d9dc28ce4fc22ab5f6c324389",
          "url": "https://github.com/pulseengine/rivet/commit/3554f468335c9229033d9262fcb4abe22dec4232"
        },
        "date": 1790338423548,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 57803,
            "range": "± 2176",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 688811,
            "range": "± 13269",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 9808117,
            "range": "± 449615",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1171,
            "range": "± 53",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 13923,
            "range": "± 623",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 334707,
            "range": "± 3741",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 53,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/1000",
            "value": 57,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 57,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1026367,
            "range": "± 51905",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 116558,
            "range": "± 3135",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1392852,
            "range": "± 60273",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 30647776,
            "range": "± 2418358",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 303265,
            "range": "± 10653",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 10210383,
            "range": "± 735923",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 691431790,
            "range": "± 21953980",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 2721,
            "range": "± 24",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 30087,
            "range": "± 526",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 707744,
            "range": "± 40470",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 40119,
            "range": "± 444",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 417306,
            "range": "± 11234",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 5564908,
            "range": "± 143836",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 589,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7895,
            "range": "± 26",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 255947,
            "range": "± 13940",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 14656,
            "range": "± 756",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 103220,
            "range": "± 7907",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 945353,
            "range": "± 10058",
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
          "id": "da945d30f319875678a94434557dcb83325ce6d2",
          "message": "feat(release): judge evidence by each type's schema rules; add require: evidence (REQ-383, REQ-384) (#1005)\n\nImplements: REQ-383, REQ-384\nVerifies: REQ-383, REQ-384\nRefs: DD-081\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9",
          "timestamp": "2026-09-29T20:44:48+02:00",
          "tree_id": "15e7c53c1cef4d38294f122120faf7723d172648",
          "url": "https://github.com/pulseengine/rivet/commit/da945d30f319875678a94434557dcb83325ce6d2"
        },
        "date": 1790708250629,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 86528,
            "range": "± 2448",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 922705,
            "range": "± 49106",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 19347579,
            "range": "± 1061848",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1959,
            "range": "± 13",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 22936,
            "range": "± 562",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 348430,
            "range": "± 3746",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 98,
            "range": "± 3",
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
            "value": 1558524,
            "range": "± 12275",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 166596,
            "range": "± 533",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1909413,
            "range": "± 33104",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 41494786,
            "range": "± 3570579",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 479001,
            "range": "± 1446",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 16833383,
            "range": "± 814390",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1245753140,
            "range": "± 17165022",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4305,
            "range": "± 168",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 46348,
            "range": "± 448",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 814431,
            "range": "± 8490",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 61501,
            "range": "± 1114",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 733519,
            "range": "± 9029",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 9034143,
            "range": "± 267631",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1171,
            "range": "± 16",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14534,
            "range": "± 50",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 244197,
            "range": "± 3062",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21438,
            "range": "± 368",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 145872,
            "range": "± 2803",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1351979,
            "range": "± 34059",
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
          "id": "21242f8f44ffc081c0121c8d030948cba0931ab1",
          "message": "test(schema, sexpr): kill the scheduled run's surviving mutants (REQ-386) (#1013)\n\nVerifies: REQ-386\nRefs: #1009\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9",
          "timestamp": "2026-09-30T06:12:16+02:00",
          "tree_id": "4348b9142b40b836dd2d9a721d3885bb08d8353d",
          "url": "https://github.com/pulseengine/rivet/commit/21242f8f44ffc081c0121c8d030948cba0931ab1"
        },
        "date": 1790742308506,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84849,
            "range": "± 421",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 913367,
            "range": "± 4038",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14136691,
            "range": "± 820957",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2228,
            "range": "± 24",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25483,
            "range": "± 110",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 353159,
            "range": "± 1722",
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
            "value": 96,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1519365,
            "range": "± 26772",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 148147,
            "range": "± 1713",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1779707,
            "range": "± 22078",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 27409638,
            "range": "± 1721138",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 508912,
            "range": "± 3487",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 17262630,
            "range": "± 204600",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1379036894,
            "range": "± 12534287",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4314,
            "range": "± 96",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 58355,
            "range": "± 177",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 757732,
            "range": "± 30656",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 59992,
            "range": "± 2810",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 678557,
            "range": "± 2351",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7812512,
            "range": "± 264968",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1150,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14471,
            "range": "± 105",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 332237,
            "range": "± 2109",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22751,
            "range": "± 73",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 159358,
            "range": "± 587",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1511378,
            "range": "± 25645",
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
          "id": "f9789670db2dd1cef59ec73f1b1b4e5d83572f6e",
          "message": "fix(externals): an unprefixed link target never crosses a project boundary (REQ-395) (#1017)\n\nFixes: REQ-395\nVerifies: REQ-395\nRefs: #1015\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9",
          "timestamp": "2026-09-30T08:30:30+02:00",
          "tree_id": "2d71d32218f8abdc907f9027f0ad585a85e0a09b",
          "url": "https://github.com/pulseengine/rivet/commit/f9789670db2dd1cef59ec73f1b1b4e5d83572f6e"
        },
        "date": 1790752877875,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 87399,
            "range": "± 1644",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 905710,
            "range": "± 12051",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14030643,
            "range": "± 653950",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2112,
            "range": "± 13",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25586,
            "range": "± 65",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 370984,
            "range": "± 3639",
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
            "range": "± 3",
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
            "value": 1522099,
            "range": "± 25672",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 146288,
            "range": "± 779",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1785118,
            "range": "± 18374",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 26960913,
            "range": "± 3968603",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 501859,
            "range": "± 3581",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 17457540,
            "range": "± 320376",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1413153221,
            "range": "± 12021169",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4467,
            "range": "± 26",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 59619,
            "range": "± 414",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 860041,
            "range": "± 13494",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 61618,
            "range": "± 196",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 707493,
            "range": "± 3808",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8631486,
            "range": "± 1023801",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1119,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14716,
            "range": "± 208",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 322682,
            "range": "± 2964",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 24027,
            "range": "± 69",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 164546,
            "range": "± 1047",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1481936,
            "range": "± 25538",
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
          "id": "5716232227a03eb26de7e5de1f385fef12119a94",
          "message": "fix(consistency): five surfaces that disagreed about the same fact (REQ-387, #956 items 4-8) (#1014)\n\nImplements: REQ-387\nVerifies: REQ-387\nRefs: #956\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9",
          "timestamp": "2026-09-30T10:49:30+02:00",
          "tree_id": "74ce31e6b4116ca8b338a69bd75aa9f5d015486f",
          "url": "https://github.com/pulseengine/rivet/commit/5716232227a03eb26de7e5de1f385fef12119a94"
        },
        "date": 1790761335748,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84969,
            "range": "± 1106",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 917538,
            "range": "± 28684",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 15629619,
            "range": "± 1280397",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2033,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 22670,
            "range": "± 172",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 332740,
            "range": "± 1562",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 96,
            "range": "± 3",
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
            "value": 1526385,
            "range": "± 12039",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 159561,
            "range": "± 405",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1845870,
            "range": "± 21530",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 30039531,
            "range": "± 3037684",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 465687,
            "range": "± 11840",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 15161750,
            "range": "± 170709",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1099209195,
            "range": "± 18365058",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4298,
            "range": "± 16",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 47279,
            "range": "± 2032",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 800129,
            "range": "± 9040",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 61128,
            "range": "± 198",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 740912,
            "range": "± 2962",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 11689382,
            "range": "± 360260",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1162,
            "range": "± 25",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15687,
            "range": "± 121",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 257585,
            "range": "± 1796",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21797,
            "range": "± 58",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 150607,
            "range": "± 440",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1399012,
            "range": "± 9522",
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
          "id": "c5807373d20f55c2b7239899cfef429fcd0dc990",
          "message": "fix(release): one spar revision per binary; the drift guard can fire (REQ-390) (#1012)\n\nFixes: REQ-390\nVerifies: REQ-390\nRefs: #951\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9",
          "timestamp": "2026-09-30T12:27:27+02:00",
          "tree_id": "0bc47fd08ce1dd54d1053916ce5aa235793c504c",
          "url": "https://github.com/pulseengine/rivet/commit/c5807373d20f55c2b7239899cfef429fcd0dc990"
        },
        "date": 1790765199955,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 47406,
            "range": "± 2057",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 581633,
            "range": "± 31602",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14168308,
            "range": "± 1341342",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 994,
            "range": "± 90",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 12478,
            "range": "± 253",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 219385,
            "range": "± 5304",
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
            "value": 47,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 48,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 816355,
            "range": "± 16442",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 104272,
            "range": "± 2383",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1206957,
            "range": "± 33601",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 21781648,
            "range": "± 3323350",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 276088,
            "range": "± 9292",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 8144323,
            "range": "± 93372",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 544534277,
            "range": "± 10009450",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 2610,
            "range": "± 30",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 27073,
            "range": "± 543",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 434465,
            "range": "± 8420",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 36696,
            "range": "± 242",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 389946,
            "range": "± 11135",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 4608697,
            "range": "± 287940",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 501,
            "range": "± 38",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7249,
            "range": "± 198",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 123234,
            "range": "± 6829",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 12363,
            "range": "± 569",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 82282,
            "range": "± 2399",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 779286,
            "range": "± 63457",
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
          "id": "d2c7c372274cd9b4925e92f92224ce4e97f237dd",
          "message": "fix(schema): the AI review gate can fire; docs that described absent behaviour (REQ-388, #958 items 5-7) (#1016)\n\nFixes: REQ-388\nVerifies: REQ-388\nRefs: #958\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9",
          "timestamp": "2026-09-30T13:35:22+02:00",
          "tree_id": "29d88f0883f18ef9f936c7502084e475bf225b87",
          "url": "https://github.com/pulseengine/rivet/commit/d2c7c372274cd9b4925e92f92224ce4e97f237dd"
        },
        "date": 1790771203655,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84919,
            "range": "± 348",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 894020,
            "range": "± 7033",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12998695,
            "range": "± 636331",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2149,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 27535,
            "range": "± 3900",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 367390,
            "range": "± 1267",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 96,
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
            "value": 96,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1534600,
            "range": "± 14954",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 159993,
            "range": "± 1180",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1931161,
            "range": "± 8316",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 24773408,
            "range": "± 1563623",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 585377,
            "range": "± 3398",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 16118664,
            "range": "± 132255",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1273329985,
            "range": "± 10443143",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4413,
            "range": "± 27",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 63482,
            "range": "± 290",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 787858,
            "range": "± 6799",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 61300,
            "range": "± 312",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 695099,
            "range": "± 5321",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7659528,
            "range": "± 249548",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1078,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14075,
            "range": "± 43",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 318538,
            "range": "± 1213",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23203,
            "range": "± 298",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 158805,
            "range": "± 1900",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1468245,
            "range": "± 27839",
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
          "id": "5a6ef70293a1fe1c1033a860e136d0ca9cb7bc24",
          "message": "chore(release): v0.40.0 (#1023)\n\nRefs: DD-082, REQ-386, REQ-399\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9",
          "timestamp": "2026-10-01T09:28:22+02:00",
          "tree_id": "a653ac33210523ba59cf733486b899c0afde867b",
          "url": "https://github.com/pulseengine/rivet/commit/5a6ef70293a1fe1c1033a860e136d0ca9cb7bc24"
        },
        "date": 1790843985529,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84515,
            "range": "± 583",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 882146,
            "range": "± 4774",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12817629,
            "range": "± 483271",
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
            "value": 25598,
            "range": "± 145",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 374271,
            "range": "± 1539",
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
            "value": 1512451,
            "range": "± 21173",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 160224,
            "range": "± 2495",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1911573,
            "range": "± 16830",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 28627331,
            "range": "± 3076668",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 591968,
            "range": "± 4958",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 17334566,
            "range": "± 538386",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1383557188,
            "range": "± 14385973",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4418,
            "range": "± 166",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 62492,
            "range": "± 280",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 880531,
            "range": "± 17267",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 56908,
            "range": "± 252",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 692449,
            "range": "± 2845",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7529364,
            "range": "± 240756",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1265,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14204,
            "range": "± 40",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 312850,
            "range": "± 3722",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22517,
            "range": "± 90",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 155959,
            "range": "± 1218",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1466980,
            "range": "± 13723",
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
          "id": "e439acfa045cd6a5864f778284823e0cc66e7320",
          "message": "fix(yaml): use i64::MAX; Rust 1.99 deprecates max_value() (#1029)\n\nRefs: REQ-028\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9",
          "timestamp": "2026-10-01T16:50:44+02:00",
          "tree_id": "492f8dcc3a29d2df3a53c1ed070f0a716b83616b",
          "url": "https://github.com/pulseengine/rivet/commit/e439acfa045cd6a5864f778284823e0cc66e7320"
        },
        "date": 1790866896396,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 68593,
            "range": "± 395",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 736742,
            "range": "± 5745",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 18799111,
            "range": "± 1699957",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1467,
            "range": "± 19",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 17901,
            "range": "± 124",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 256316,
            "range": "± 2020",
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
            "value": 76,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 76,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1177760,
            "range": "± 20789",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 127570,
            "range": "± 258",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1501276,
            "range": "± 13982",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 43728372,
            "range": "± 3420193",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 436704,
            "range": "± 2586",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 13598519,
            "range": "± 159719",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 961239558,
            "range": "± 10683866",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3289,
            "range": "± 37",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 35770,
            "range": "± 128",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 556904,
            "range": "± 3635",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 46373,
            "range": "± 877",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 531286,
            "range": "± 11385",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8499832,
            "range": "± 541400",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 798,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 12425,
            "range": "± 48",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 176519,
            "range": "± 16466",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 16464,
            "range": "± 513",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 112999,
            "range": "± 808",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1049635,
            "range": "± 36153",
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
          "id": "6e72dd7866cdfe0a2dcb36603f00e2143e54c6d4",
          "message": "feat(release): Open VSX publishes by trusted publishing, no long-lived token (REQ-397) (#1024)\n\nImplements: REQ-397\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9",
          "timestamp": "2026-10-01T17:33:09+02:00",
          "tree_id": "59f0950676fb507afbfa7edf90368f6df88b4ce3",
          "url": "https://github.com/pulseengine/rivet/commit/6e72dd7866cdfe0a2dcb36603f00e2143e54c6d4"
        },
        "date": 1790871444353,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 50002,
            "range": "± 1138",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 572892,
            "range": "± 13107",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12457332,
            "range": "± 2116640",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1038,
            "range": "± 105",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 12265,
            "range": "± 124",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 206381,
            "range": "± 7179",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 49,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/1000",
            "value": 48,
            "range": "± 4",
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
            "value": 810570,
            "range": "± 12513",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 106641,
            "range": "± 1609",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1265086,
            "range": "± 46282",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 24077796,
            "range": "± 4767353",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 337802,
            "range": "± 16894",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 9798177,
            "range": "± 1250110",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 676486086,
            "range": "± 16051414",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 2667,
            "range": "± 46",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 27832,
            "range": "± 1019",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 453488,
            "range": "± 26811",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 35352,
            "range": "± 2143",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 372536,
            "range": "± 7350",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 4735956,
            "range": "± 589049",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 507,
            "range": "± 33",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7166,
            "range": "± 232",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 127498,
            "range": "± 10933",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 12059,
            "range": "± 240",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 83940,
            "range": "± 3062",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 753947,
            "range": "± 12043",
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
          "id": "01354b3b0191fe61fb72159561786d3f71a930d8",
          "message": "fix(deps): wasmtime 48.0.3 → 48.0.5 for RUSTSEC-2026-0321..0327 (#1032)\n\nRefs: REQ-007\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9",
          "timestamp": "2026-10-06T21:20:43+02:00",
          "tree_id": "7f64dc6426715b76bdfe9da7fe8214109285d35b",
          "url": "https://github.com/pulseengine/rivet/commit/01354b3b0191fe61fb72159561786d3f71a930d8"
        },
        "date": 1791315077879,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 49301,
            "range": "± 6813",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 627660,
            "range": "± 27925",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 15166010,
            "range": "± 1992460",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1061,
            "range": "± 95",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 12937,
            "range": "± 562",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 225001,
            "range": "± 11014",
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
            "range": "± 5",
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
            "value": 846038,
            "range": "± 39683",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 109416,
            "range": "± 7961",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1251710,
            "range": "± 60570",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 28463225,
            "range": "± 5365251",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 337800,
            "range": "± 6800",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 9532853,
            "range": "± 1437222",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 696049630,
            "range": "± 20747221",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 2729,
            "range": "± 159",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 26478,
            "range": "± 287",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 425139,
            "range": "± 11473",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 35304,
            "range": "± 1970",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 378929,
            "range": "± 39424",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 5188878,
            "range": "± 1454429",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 488,
            "range": "± 32",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7264,
            "range": "± 291",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 115657,
            "range": "± 1842",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 12177,
            "range": "± 1125",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 83672,
            "range": "± 1196",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 780098,
            "range": "± 146877",
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
          "id": "1a931d7aa032a3b316e9207c8274bf4dd3f1e763",
          "message": "fix(verify): count a verifies link only from a verified artifact (REQ-404, #1037) (#1040)\n\nImplements: REQ-404\nVerifies: REQ-404\nRefs: #1037\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9",
          "timestamp": "2026-10-07T17:31:11+02:00",
          "tree_id": "a679004189b0d452cd67665428c3036d0a4c065e",
          "url": "https://github.com/pulseengine/rivet/commit/1a931d7aa032a3b316e9207c8274bf4dd3f1e763"
        },
        "date": 1791387937195,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85300,
            "range": "± 373",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 900703,
            "range": "± 9201",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14266674,
            "range": "± 1071149",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2227,
            "range": "± 11",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26953,
            "range": "± 120",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 360405,
            "range": "± 1095",
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
            "value": 1539099,
            "range": "± 34847",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 157651,
            "range": "± 6802",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1962240,
            "range": "± 14337",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 27243375,
            "range": "± 2078746",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 566902,
            "range": "± 6160",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 16159777,
            "range": "± 515671",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1304573092,
            "range": "± 31282070",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4401,
            "range": "± 12",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60490,
            "range": "± 359",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 899027,
            "range": "± 6650",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 56828,
            "range": "± 268",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 704673,
            "range": "± 20299",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7635179,
            "range": "± 63830",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1163,
            "range": "± 18",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14132,
            "range": "± 94",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 315751,
            "range": "± 3265",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22473,
            "range": "± 422",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 156203,
            "range": "± 858",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1460134,
            "range": "± 13798",
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
          "id": "5737b85e1e01a90e33cc4efc233e1f14a3ccb65b",
          "message": "ci(mutants): cap the test process, not the step, so a runaway mutant can't take its runner down (#1031) (#1041)\n\nRefs: #1031\nTrace: skip\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9",
          "timestamp": "2026-10-07T18:39:42+02:00",
          "tree_id": "a9c4d9ca6abcfff333930d0d4edbb643b20c5111",
          "url": "https://github.com/pulseengine/rivet/commit/5737b85e1e01a90e33cc4efc233e1f14a3ccb65b"
        },
        "date": 1791391734409,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 47912,
            "range": "± 840",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 588406,
            "range": "± 14346",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13133092,
            "range": "± 966110",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1070,
            "range": "± 38",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 12974,
            "range": "± 957",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 227356,
            "range": "± 22976",
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
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 49,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 841701,
            "range": "± 45649",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 109849,
            "range": "± 7958",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1265060,
            "range": "± 22224",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 30709999,
            "range": "± 7452496",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 333868,
            "range": "± 17996",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 9285619,
            "range": "± 821187",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 574909135,
            "range": "± 14692152",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 2639,
            "range": "± 32",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 27439,
            "range": "± 3339",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 482238,
            "range": "± 8760",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 36329,
            "range": "± 499",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 382103,
            "range": "± 25383",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8047996,
            "range": "± 1325492",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 491,
            "range": "± 21",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7160,
            "range": "± 456",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 129019,
            "range": "± 2387",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 11933,
            "range": "± 484",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 83456,
            "range": "± 2249",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 785453,
            "range": "± 24732",
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
          "id": "3172b6024dc2ea6dd23552be51247921711d2a31",
          "message": "fix(validate): salsa conditional-rule pass iterates by sorted id (REQ-029, #1049) (#1051)\n\nTwo runs of `rivet validate` on the same inputs printed the same set of\ndiagnostics in different orders — 944 lines of diff reduced to 0 after\nsorting. The block that moved was `conditional rule\n'ai-generated-needs-review'` warnings. Any diff-based or golden check of\nvalidate output was noisy, and a real regression could hide among the\nreordered lines.\n\nThe direct `validate_with_externals_and_variant` path already iterated\n`store.iter_sorted()` (#746). The salsa path — `evaluate_conditional_rules`\nand `evaluate_conditional_rules_with_extras`, which the default\n`rivet validate` CLI takes — still iterated `store.iter()`, which walks\nthe backing `HashMap` and is documented as \"unspecified,\nnondeterministic order\". Both salsa queries now iterate by sorted id too.\n\nTests:\n- `db::tests::conditional_diagnostics_are_sorted_by_artifact_id` — the\n  salsa query emits conditional diagnostics in ascending-id order on a\n  fixture whose approved-without-description artifacts are inserted\n  out of id order.\n- `cli_commands::validate_output_is_byte_identical_across_runs` — two\n  runs of the real binary on this project give byte-identical stdout\n  for both `rivet validate` and `rivet validate --format json`.\n\nFixes: REQ-029\nVerifies: REQ-029\nRefs: #1049\n\n\nClaude-Session: https://claude.ai/code/session_01RocdVLURshNd458tL38TfL\n\nCo-authored-by: Claude <noreply@anthropic.com>",
          "timestamp": "2026-10-08T08:31:14+02:00",
          "tree_id": "75db615bc1ab76eac55b22d8469c422da6390557",
          "url": "https://github.com/pulseengine/rivet/commit/3172b6024dc2ea6dd23552be51247921711d2a31"
        },
        "date": 1791444167415,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 86741,
            "range": "± 555",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 924752,
            "range": "± 4826",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14019896,
            "range": "± 984271",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2221,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26690,
            "range": "± 149",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 373071,
            "range": "± 2018",
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
            "value": 97,
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
            "value": 1525984,
            "range": "± 12088",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 160129,
            "range": "± 2917",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1878374,
            "range": "± 16319",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 29931043,
            "range": "± 3363799",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 753296,
            "range": "± 4597",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 19187591,
            "range": "± 160090",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1480107089,
            "range": "± 14116783",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4275,
            "range": "± 30",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60695,
            "range": "± 339",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 832829,
            "range": "± 8303",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 60929,
            "range": "± 394",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 707130,
            "range": "± 17223",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8671775,
            "range": "± 469029",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1153,
            "range": "± 13",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14393,
            "range": "± 804",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 328835,
            "range": "± 3972",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 24230,
            "range": "± 88",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 172436,
            "range": "± 1116",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1637662,
            "range": "± 31703",
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
          "id": "23c64c688086e64fc21ad1a0bcb78be4104cb069",
          "message": "test(sql): the V-closure join test evaluates the coverage it is named for (#956 lower tier) (#1053)\n\nVerifies: REQ-229\nRefs: REQ-400, #956\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9",
          "timestamp": "2026-10-08T12:31:45+02:00",
          "tree_id": "6bced0818908945c8bbfa1c640bf96c4674e978c",
          "url": "https://github.com/pulseengine/rivet/commit/23c64c688086e64fc21ad1a0bcb78be4104cb069"
        },
        "date": 1791456768749,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 57234,
            "range": "± 2998",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 717558,
            "range": "± 14274",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 9662797,
            "range": "± 337071",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1131,
            "range": "± 16",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 13822,
            "range": "± 756",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 304454,
            "range": "± 34250",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 52,
            "range": "± 2",
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
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 991856,
            "range": "± 58672",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 117609,
            "range": "± 7667",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1405305,
            "range": "± 57731",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 24061374,
            "range": "± 1282214",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 553005,
            "range": "± 27847",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 12329067,
            "range": "± 678339",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 778574348,
            "range": "± 26896032",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 2644,
            "range": "± 45",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 28660,
            "range": "± 1624",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 636383,
            "range": "± 19690",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 38950,
            "range": "± 1211",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 421536,
            "range": "± 15044",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 5380426,
            "range": "± 160482",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 647,
            "range": "± 28",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7895,
            "range": "± 251",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 231929,
            "range": "± 5489",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 15186,
            "range": "± 699",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 109206,
            "range": "± 6458",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1007565,
            "range": "± 10557",
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
          "id": "cf0fd838b9d33535ef767a7dd2d3d5a3de61bef8",
          "message": "fix(nav): one STPA type list; the export's EU AI Act badge matches the dashboard (#956 lower tier) (#1054)\n\nImplements: REQ-400\nRefs: #956\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9",
          "timestamp": "2026-10-08T16:31:07+02:00",
          "tree_id": "8cbfa0a6f5cabfe5704dbd09f3677d0fc084915a",
          "url": "https://github.com/pulseengine/rivet/commit/cf0fd838b9d33535ef767a7dd2d3d5a3de61bef8"
        },
        "date": 1791470579846,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 71610,
            "range": "± 2890",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 851412,
            "range": "± 20757",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 11023137,
            "range": "± 459382",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1403,
            "range": "± 46",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 18017,
            "range": "± 293",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 363781,
            "range": "± 2743",
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
            "value": 71,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 70,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1290844,
            "range": "± 28024",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 145287,
            "range": "± 2940",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1649210,
            "range": "± 47640",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 24136117,
            "range": "± 829495",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 622916,
            "range": "± 13019",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 15604160,
            "range": "± 516508",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1049855699,
            "range": "± 10560980",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3250,
            "range": "± 35",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 34366,
            "range": "± 1877",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 754686,
            "range": "± 34683",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 48550,
            "range": "± 2259",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 499610,
            "range": "± 7597",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 6363987,
            "range": "± 241097",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 825,
            "range": "± 31",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 10625,
            "range": "± 550",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 279756,
            "range": "± 4626",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 20459,
            "range": "± 521",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 148334,
            "range": "± 2937",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1361515,
            "range": "± 55877",
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
      }
    ]
  }
}