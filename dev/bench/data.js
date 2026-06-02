window.BENCHMARK_DATA = {
  "lastUpdate": 1780404192008,
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
          "id": "c5fe0e7d1d3d4787f17e89715a921ca4f2c30f20",
          "message": "fix(validate,coverage): required-backlink matches inverse-name convention + honours alternate-backlinks (#349) (#351)\n\n`Backlink.link_type` stores the *forward* link-type name (e.g. `supports`)\nwhile schemas like `safety-case.yaml` write `required-backlink` as the\n*inverse* name (e.g. `supported-by`). The strict equality match at\n`validate.rs:906` and `coverage.rs:200` therefore never matched for any\ninverse-name rule — `goal-has-support` fired for every safety goal even\nwhen correctly supported by a solution, and coverage counted every such\ngoal as uncovered. `dev.yaml`'s `required-backlink: satisfies` happens\nto use the forward name and worked; the bug surfaced only on schemas\nfollowing the inverse-name convention.\n\nMatch now accepts either spelling at both call sites:\n`bl.link_type == name || bl.inverse_type.as_deref() == Some(name)`.\nSame fix path additionally evaluates `rule.alternate_backlinks` —\n`validate.rs` previously ignored that field outright, so a safety goal\nsatisfied only via an alternate (e.g. `decomposed-by` from a strategy\ninstead of `supported-by`) still erroneously fired the rule.\n\nFour regression tests pin the behaviour (two per engine): one for the\ninverse-name match, one for alternate-backlinks. Reproduces and clears\nthe loom safety-case scenario from the bug report.\n\nFixes: REQ-004\nRefs: #349\n\nCo-authored-by: Claude <noreply@anthropic.com>",
          "timestamp": "2026-05-31T03:22:13-05:00",
          "tree_id": "a2b2018cc9576c8fcbcb078ab11f1600a55d08e6",
          "url": "https://github.com/pulseengine/rivet/commit/c5fe0e7d1d3d4787f17e89715a921ca4f2c30f20"
        },
        "date": 1780216224782,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 86593,
            "range": "± 878",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 915209,
            "range": "± 4660",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 17603910,
            "range": "± 1110091",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1934,
            "range": "± 28",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24756,
            "range": "± 165",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 364610,
            "range": "± 1728",
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
            "value": 1448903,
            "range": "± 21560",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 166549,
            "range": "± 565",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1943952,
            "range": "± 101333",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 65674685,
            "range": "± 1124094",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 125913,
            "range": "± 723",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1158037,
            "range": "± 15509",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 14056135,
            "range": "± 700853",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4144,
            "range": "± 11",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 44999,
            "range": "± 486",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 760014,
            "range": "± 2651",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 64338,
            "range": "± 1256",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 731711,
            "range": "± 5276",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 9022585,
            "range": "± 577448",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 736,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 6719,
            "range": "± 146",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 98736,
            "range": "± 451",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21233,
            "range": "± 251",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 146035,
            "range": "± 947",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1371137,
            "range": "± 12010",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "ac46f941b2c50ec75f7320da7a679686fb2a1da5",
          "message": "docs(artifacts): file REQ-135 (status enum) + REQ-136 (modify ergonomics) (#361)\n\nAgent-reported issue cluster, verified against source.\n\n- REQ-135  status enum is unenforced: common.yaml declares status type:enum\n           with no allowed-values, validate never checks artifact.status, and\n           mutate accepts any string. rivet's own repo already has 4 drift\n           statuses passing validate. Cluster: #352/#354/#355/#353.\n- REQ-136  rivet modify ergonomics: add --set-description; positional misuse\n           should hint the --set-* flag. Issues #359/#360.\n\nRefs: REQ-135, REQ-136\n\nCo-authored-by: Claude Opus 4.8 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-05-31T03:27:36-05:00",
          "tree_id": "723b3a2a00448fd9abc5949a426773f8a17eaeb9",
          "url": "https://github.com/pulseengine/rivet/commit/ac46f941b2c50ec75f7320da7a679686fb2a1da5"
        },
        "date": 1780216619251,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 83788,
            "range": "± 250",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 923732,
            "range": "± 6934",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14180576,
            "range": "± 471556",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1940,
            "range": "± 9",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24962,
            "range": "± 66",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 358677,
            "range": "± 1505",
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
            "value": 1437715,
            "range": "± 40377",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 172224,
            "range": "± 602",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 2013791,
            "range": "± 10623",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 29119576,
            "range": "± 938170",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 128435,
            "range": "± 940",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1164800,
            "range": "± 11108",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 14435452,
            "range": "± 371914",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4179,
            "range": "± 19",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 44474,
            "range": "± 124",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 785818,
            "range": "± 4512",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 64289,
            "range": "± 355",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 721926,
            "range": "± 4815",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8230007,
            "range": "± 204119",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 743,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 6729,
            "range": "± 99",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 103232,
            "range": "± 2707",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21790,
            "range": "± 56",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 147241,
            "range": "± 352",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1379216,
            "range": "± 23979",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "ba67eb6079cb9802f50b8488661e80dfc289d15c",
          "message": "docs(artifacts): mark merged features implemented + re-file REQ-131 (#363)\n\nMark-implemented sweep — acceptance met by merged code:\n- REQ-105 (HTML export self-containment, v0.14.0)  draft    -> implemented\n- REQ-110/111 (coverage relabel, #348)             draft    -> implemented\n- REQ-124 (diagnostic remediation, v0.14.0)        approved -> implemented\n\nAlso re-files REQ-131 (the #349 required-backlink fix, status implemented):\nits artifact was dropped when #351 was reworked to add alternate-backlink\nsupport, so the code shipped on main without the requirement. Restores the\ntraceability that issue comments on #349/#350 reference.\n\nrivet validate PASS.\n\nRefs: REQ-105, REQ-110, REQ-111, REQ-124, REQ-131\n\nCo-authored-by: Claude Opus 4.8 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-05-31T04:15:35-05:00",
          "tree_id": "61f5b9095d355ce251cf60e7cf7805c9c1d23722",
          "url": "https://github.com/pulseengine/rivet/commit/ba67eb6079cb9802f50b8488661e80dfc289d15c"
        },
        "date": 1780219351421,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 76453,
            "range": "± 479",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 955872,
            "range": "± 2389",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 15210012,
            "range": "± 840996",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1667,
            "range": "± 9",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 18707,
            "range": "± 63",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 365407,
            "range": "± 2104",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 86,
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
            "value": 1352660,
            "range": "± 39745",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 158649,
            "range": "± 338",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1874125,
            "range": "± 13976",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 30661531,
            "range": "± 2195148",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 121678,
            "range": "± 1831",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1196014,
            "range": "± 12597",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 15417613,
            "range": "± 1344740",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3896,
            "range": "± 10",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 44361,
            "range": "± 138",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 833780,
            "range": "± 2148",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 52880,
            "range": "± 164",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 606194,
            "range": "± 3151",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7021346,
            "range": "± 130716",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 637,
            "range": "± 25",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 5239,
            "range": "± 13",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 144434,
            "range": "± 513",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21033,
            "range": "± 106",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 151453,
            "range": "± 583",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1409206,
            "range": "± 35056",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "bc2f32ad26c0b78253ad6f304428ae959843588b",
          "message": "feat(get,list): expose incoming links (what links to an artifact) (#358) (#364)\n\nAgent-reported (#358), demanded by 3 issues (#358/#349/#350): the most common\ntraceability question — \"what verifies/satisfies X?\" — was unanswerable from\nthe two commands an agent reaches for. `rivet get` showed only outbound links;\n`rivet list --format json` collapsed links to an integer count. The reverse\nedges were only reachable via `matrix --direction backward` + hand-parsing YAML.\n\n- `rivet get <ID>`: new `incoming_links` array ({type, source, inverse}) in\n  JSON + an `Incoming:` section in text, from `LinkGraph::backlinks_to`.\n- `rivet list --format json`: emits the real link objects (matching `get`)\n  instead of a count; count recoverable as `.links | length`.\n\nRegression test get_json_includes_incoming_links. Verified on rivet's own repo\n(REQ-004 shows 56 incoming links). Implements the #358 part of REQ-128\n(the `list --orphans` ranking remains).\n\nImplements: REQ-128\nVerifies: REQ-128\nRefs: REQ-007\n\nCo-authored-by: Claude Opus 4.8 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-05-31T05:15:36-05:00",
          "tree_id": "9c2397b5ad16edb63b4315b4d1e280f4a2e63ff8",
          "url": "https://github.com/pulseengine/rivet/commit/bc2f32ad26c0b78253ad6f304428ae959843588b"
        },
        "date": 1780222953778,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 76823,
            "range": "± 784",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 954462,
            "range": "± 6928",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 16831579,
            "range": "± 1002137",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1694,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 19294,
            "range": "± 341",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 379527,
            "range": "± 5728",
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
            "value": 1358406,
            "range": "± 24066",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 158995,
            "range": "± 757",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1870598,
            "range": "± 36463",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 36110611,
            "range": "± 3505928",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 120763,
            "range": "± 1776",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1199862,
            "range": "± 9126",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 18981112,
            "range": "± 2140019",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4401,
            "range": "± 11",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 40412,
            "range": "± 157",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 818463,
            "range": "± 2480",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 53293,
            "range": "± 288",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 600716,
            "range": "± 8617",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8781463,
            "range": "± 748289",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 635,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 5266,
            "range": "± 57",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 142683,
            "range": "± 754",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21154,
            "range": "± 126",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 150341,
            "range": "± 3440",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1405125,
            "range": "± 10945",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "bcc6d697b376889cb74a69443213742121f38862",
          "message": "feat(modify): wire --set-description flag + clearer modify usage (#359, #360) (#365)\n\nAgent-reported. `description` is a top-level base field but the CLI exposed no\n`--set-description` flag, so updating it forced `--set-field description=...`,\nwhich mutate then REJECTED with a hint pointing at a `--set-description` flag\nthat did not exist — a dead-end loop. The core (`ModifyParams.set_description`,\n`yaml_edit`) already applied it; only the clap wiring was missing.\n\n- `rivet modify <ID> --set-description \"<text>\"` now works (#360).\n- `rivet modify --help` shows `--set-*` examples + a note that positionals\n  (`modify <ID> status approved`) are not valid (#359; the bare clap error\n  still directs to --help, which now teaches the pattern).\n\nRegression test modify_applies_set_description_param. Verified end-to-end.\n\nImplements: REQ-136\nVerifies: REQ-136\nRefs: REQ-007\n\nCo-authored-by: Claude Opus 4.8 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-05-31T06:15:32-05:00",
          "tree_id": "d1cc4f36fd2c4f982dc6bd4c450198f343771d52",
          "url": "https://github.com/pulseengine/rivet/commit/bcc6d697b376889cb74a69443213742121f38862"
        },
        "date": 1780226542267,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84248,
            "range": "± 413",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 886953,
            "range": "± 12169",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14258448,
            "range": "± 784308",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2257,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25514,
            "range": "± 130",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 351090,
            "range": "± 3331",
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
            "value": 95,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1462215,
            "range": "± 44436",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 161081,
            "range": "± 1370",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1918253,
            "range": "± 17961",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 28915607,
            "range": "± 1394277",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 132804,
            "range": "± 2138",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1155333,
            "range": "± 27794",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 16039868,
            "range": "± 1436505",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4324,
            "range": "± 21",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 62750,
            "range": "± 752",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 851732,
            "range": "± 16544",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 64053,
            "range": "± 2774",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 728476,
            "range": "± 3595",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 11629230,
            "range": "± 738575",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 751,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7097,
            "range": "± 64",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 117759,
            "range": "± 742",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23196,
            "range": "± 622",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 163941,
            "range": "± 1521",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1523616,
            "range": "± 32403",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "68bc025ea866af9213bac2cabde1256bcacafc5f",
          "message": "feat(validate): --min-severity display filter to cut advisory noise (#357) (#366)\n\nSelf-reported dogfooding finding. `rivet validate` printed every diagnostic\nregardless of severity — on rivet's own repo ~160 advisory warnings for 0\nerrors, burying anything actionable. `--fail-on` gates the exit code but still\nprints everything.\n\nNew `rivet validate --min-severity <error|warning|info>` displays only\ndiagnostics at or above the floor (text output). Counts + exit code are\nunchanged (computed from the full set); when the filter hides anything, a\none-line note reports \"showing N of M … at or above '<level>'\" so nothing is\nsilently dropped. Reuses the existing --fail-on severity parser.\n\nRegression test validate_min_severity_filters_display. Filed as REQ-137\n(implemented).\n\nImplements: REQ-137\nVerifies: REQ-137\nRefs: REQ-004\n\nCo-authored-by: Claude Opus 4.8 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-05-31T07:16:19-05:00",
          "tree_id": "a92621927d24a74a021179368d65d514e3435120",
          "url": "https://github.com/pulseengine/rivet/commit/68bc025ea866af9213bac2cabde1256bcacafc5f"
        },
        "date": 1780230202020,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 76571,
            "range": "± 419",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 955932,
            "range": "± 10369",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 15035134,
            "range": "± 876874",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1660,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 19535,
            "range": "± 508",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 369524,
            "range": "± 2094",
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
            "value": 1353415,
            "range": "± 13228",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 158359,
            "range": "± 382",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1874034,
            "range": "± 22568",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 41595777,
            "range": "± 2129837",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 120959,
            "range": "± 886",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1208130,
            "range": "± 17144",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 20709722,
            "range": "± 1456426",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3904,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 41047,
            "range": "± 92",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 801407,
            "range": "± 7236",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 54771,
            "range": "± 140",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 604179,
            "range": "± 3115",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 9962829,
            "range": "± 380668",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 631,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 5292,
            "range": "± 27",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 153275,
            "range": "± 773",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21240,
            "range": "± 68",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 152275,
            "range": "± 337",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1412298,
            "range": "± 9149",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "0d7cd91eab297ad48e133a4c144e565c92d160c2",
          "message": "docs(artifacts): mark REQ-136 implemented (modify --set-description merged) (#367)\n\nREQ-136 (#359/#360 modify ergonomics) shipped via #365. rivet validate PASS.\n\nRefs: REQ-136",
          "timestamp": "2026-05-31T08:16:34-05:00",
          "tree_id": "d8e282cc1447e9a4ac6b21d912d023c7fc2168d8",
          "url": "https://github.com/pulseengine/rivet/commit/0d7cd91eab297ad48e133a4c144e565c92d160c2"
        },
        "date": 1780233790587,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 83042,
            "range": "± 259",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 882182,
            "range": "± 17685",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13047850,
            "range": "± 944235",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2107,
            "range": "± 11",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26809,
            "range": "± 223",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 365133,
            "range": "± 1368",
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
            "value": 1448486,
            "range": "± 36794",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 161715,
            "range": "± 680",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1860895,
            "range": "± 17943",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 27462645,
            "range": "± 1321699",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 132460,
            "range": "± 838",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1155184,
            "range": "± 36566",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 12640018,
            "range": "± 180633",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4338,
            "range": "± 25",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60698,
            "range": "± 377",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 805137,
            "range": "± 3098",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 62188,
            "range": "± 167",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 713930,
            "range": "± 3746",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7641442,
            "range": "± 228207",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 769,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7404,
            "range": "± 95",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 113796,
            "range": "± 1008",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23831,
            "range": "± 295",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 171955,
            "range": "± 657",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1567954,
            "range": "± 25676",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "a1359faea669b803cbcdc4c083bd0430bb622b6f",
          "message": "fix(export): drop the localhost oEmbed discovery tag from static export (REQ-117) (#368)\n\nBug-hunt finding (path-url-leakage, 3/3 lens-confirmed). Every exported\nartifact page emitted an oEmbed discovery `<link>` pointing at\n`http://localhost:<port>` — meaningful for the live serve dashboard, but broken\nmetadata in `export --format html`, which is static and has no server (its\nRepoContext.port is 0). The tag is now emitted only when served (non-zero\nport). Verified on a real export: 0 oEmbed `<link>` tags, 0 `localhost:0`.\nPlaywright guard added. Filed as REQ-117 (implemented).\n\nImplements: REQ-117\nVerifies: REQ-117\nRefs: REQ-105\n\nCo-authored-by: Claude Opus 4.8 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-05-31T08:16:40-05:00",
          "tree_id": "5183c28fd40bfcd205a5de75f7a572d81fb6f6db",
          "url": "https://github.com/pulseengine/rivet/commit/a1359faea669b803cbcdc4c083bd0430bb622b6f"
        },
        "date": 1780234187935,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 83701,
            "range": "± 354",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 890166,
            "range": "± 12661",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14016170,
            "range": "± 587886",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2169,
            "range": "± 11",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26470,
            "range": "± 61",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 357110,
            "range": "± 6187",
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
            "value": 1457465,
            "range": "± 19724",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 163392,
            "range": "± 3490",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1905880,
            "range": "± 11855",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 27515348,
            "range": "± 1437990",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 132796,
            "range": "± 4480",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1145015,
            "range": "± 25189",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 16792030,
            "range": "± 2065962",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4428,
            "range": "± 19",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 61882,
            "range": "± 412",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 844038,
            "range": "± 3254",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 63021,
            "range": "± 351",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 714975,
            "range": "± 2610",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7901455,
            "range": "± 198225",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 767,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7340,
            "range": "± 145",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 119709,
            "range": "± 814",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23337,
            "range": "± 207",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 165296,
            "range": "± 907",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1516612,
            "range": "± 18657",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "27a8b0387056c72420f3584e5951805858fa2247",
          "message": "docs(REQ-135): record the base_fields root cause of the status-enum gap (#369)\n\nVerified iter-8: the merged Schema struct drops base-fields entirely (parsed\nonto SchemaFile, never retained by Schema::merge; .base_fields read nowhere).\nSo status can't be enum-validated regardless of allowed-values. Documents the\ntwo-part non-breaking mechanism fix (retain base_fields + validate status)\nthat the maintainer's canonical-set decision then activates.\n\nRefs: REQ-135",
          "timestamp": "2026-05-31T09:16:08-05:00",
          "tree_id": "14c9f03916a5b5937db183e34af73ed66663fcee",
          "url": "https://github.com/pulseengine/rivet/commit/27a8b0387056c72420f3584e5951805858fa2247"
        },
        "date": 1780237368477,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84194,
            "range": "± 538",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 924780,
            "range": "± 8929",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 18066449,
            "range": "± 1006992",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1996,
            "range": "± 10",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25014,
            "range": "± 65",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 361910,
            "range": "± 4401",
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
            "value": 1435717,
            "range": "± 21110",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 170611,
            "range": "± 907",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1955484,
            "range": "± 21277",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 32644146,
            "range": "± 1934303",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 127218,
            "range": "± 911",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1174194,
            "range": "± 15644",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 17113762,
            "range": "± 1731987",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4143,
            "range": "± 13",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 44761,
            "range": "± 166",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 777080,
            "range": "± 8164",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 64813,
            "range": "± 384",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 737163,
            "range": "± 4195",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 9037671,
            "range": "± 586961",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 768,
            "range": "± 10",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 6620,
            "range": "± 14",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 96878,
            "range": "± 778",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21513,
            "range": "± 76",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 147337,
            "range": "± 965",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1379652,
            "range": "± 15563",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "cfd7ac7189f822e9fbd2cc0394b85102e71609b1",
          "message": "feat(validate): retain base-fields + enforce the status enum when declared (REQ-135) (#370)\n\nRoot cause of the status-enum cluster (#352/#354/#355/#353), verified: the\nmerged `Schema` struct dropped `base-fields` entirely — parsed onto\n`SchemaFile`, never retained by `Schema::merge`, read nowhere. So `status` (a\nbase field, stored top-level as `artifact.status`) could never be enum-validated\nregardless of any declared `allowed-values`.\n\n- `Schema` now carries `base_fields`, unioned by name in `merge`.\n- `validate` checks `artifact.status` against the `status` base-field's\n  `allowed-values` when declared (rule `status-allowed-values`), on both the\n  salsa and `--direct` paths.\n- `remediation` adds a `status-allowed-values` arm (set-to-allowed /\n  widen-schema, \"did you mean\").\n\nNON-BREAKING: with no `allowed-values` declared (today's common.yaml) the check\nis inert — verified rivet's own validate is unchanged (PASS, same warnings).\nDeclaring the canonical lifecycle set in common.yaml (the maintainer's call)\nactivates enforcement. 2 regression tests + verified end-to-end (a typo'd\nstatus flags with full remediation; a valid one passes).\n\nImplements: REQ-135\nVerifies: REQ-135\nRefs: REQ-004\n\nCo-authored-by: Claude Opus 4.8 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-05-31T10:16:03-05:00",
          "tree_id": "89fffdcd9fd1e6fc21f7b70d0d4521eb10d64736",
          "url": "https://github.com/pulseengine/rivet/commit/cfd7ac7189f822e9fbd2cc0394b85102e71609b1"
        },
        "date": 1780240938759,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 67059,
            "range": "± 1246",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 723769,
            "range": "± 5552",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12191528,
            "range": "± 902947",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1469,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 18482,
            "range": "± 94",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 277076,
            "range": "± 1247",
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
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1121589,
            "range": "± 25710",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 128229,
            "range": "± 353",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1474865,
            "range": "± 20370",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 29762739,
            "range": "± 4303625",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 96187,
            "range": "± 2041",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 879728,
            "range": "± 20643",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 13306728,
            "range": "± 2896454",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3399,
            "range": "± 80",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 34428,
            "range": "± 836",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 577729,
            "range": "± 8498",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 48244,
            "range": "± 880",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 515227,
            "range": "± 3556",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7434593,
            "range": "± 788605",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 592,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 5129,
            "range": "± 55",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 78307,
            "range": "± 395",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 16500,
            "range": "± 56",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 111341,
            "range": "± 425",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1043280,
            "range": "± 4159",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "9ae05c2c539e3cd5290b5e1c9fc8c7af340198d1",
          "message": "feat(modify,add): reject a status outside the declared enum (REQ-135, #354) (#371)\n\nBuilds on the retained base-fields (REQ-135). `validate_add` and\n`validate_modify` now check the artifact's `status` (and `--set-status`) against\nthe `status` base-field's `allowed-values` when declared, rejecting an\nout-of-enum value at mutation time so a typo never reaches a file. The old stub\n(\"status is a base field and generally freeform, but we'll accept it\") is\nreplaced with a real, shared `check_status_allowed`. Inert when no enum is\ndeclared (free-form preserved). Regression test + verified end-to-end (a typo'd\n`--set-status` is rejected with the allowed set named).\n\nRemaining REQ-135 follow-up: `schema show` listing the status values (spans\nCLI + HTML render surfaces).\n\nImplements: REQ-135\nVerifies: REQ-135\nRefs: REQ-007\n\nCo-authored-by: Claude Opus 4.8 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-05-31T11:17:10-05:00",
          "tree_id": "32fc6519c2fe629d222bce9d10a3ee47e1a9ff65",
          "url": "https://github.com/pulseengine/rivet/commit/9ae05c2c539e3cd5290b5e1c9fc8c7af340198d1"
        },
        "date": 1780244627866,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85685,
            "range": "± 4112",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 923396,
            "range": "± 13271",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14240292,
            "range": "± 425586",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1947,
            "range": "± 10",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24925,
            "range": "± 81",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 363236,
            "range": "± 1671",
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
            "value": 1473857,
            "range": "± 16986",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 167471,
            "range": "± 2412",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1937728,
            "range": "± 59998",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 27995222,
            "range": "± 721323",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 123017,
            "range": "± 2391",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1142809,
            "range": "± 30867",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 14596564,
            "range": "± 866380",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4155,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 45048,
            "range": "± 133",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 784122,
            "range": "± 15806",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 59398,
            "range": "± 1179",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 720254,
            "range": "± 3215",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8006259,
            "range": "± 182853",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 793,
            "range": "± 56",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7149,
            "range": "± 48",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 99420,
            "range": "± 310",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21242,
            "range": "± 507",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 145518,
            "range": "± 1949",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1352639,
            "range": "± 21218",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "ef5455733c6d421b6fa3cde059bc7ed6a7feb53f",
          "message": "feat(validate): --explain <ID> — per-artifact traceability explanation (REQ-125) (#372)\n\n* feat(validate): --explain <ID> — per-artifact traceability explanation (REQ-125)\n\nDemanded independently by #349, #350, #358 (\"why is X (un)covered?\", \"rivet why\n<id> <rule>\"). `rivet validate --explain <ID>` shows, for one artifact: which\ntraceability rules target its type and whether each is satisfied — and HOW\n(e.g. \"satisfied by incoming 'satisfies' from FEAT-019\") or what's missing\n(\"needs an incoming 'satisfies' from one of [design-decision, feature]\") —\nplus its outgoing/incoming links and its own diagnostics with remediation.\n\nA focused single-artifact view: dispatch branches to `cmd_explain` before the\nfull validate run (no new param threaded through cmd_validate's 16). Reuses the\nsame forward/backward + inverse-name + alternate-backlink matching the coverage\nengine uses, so it agrees with `rivet coverage`. Verified end-to-end (a\nsatisfied and a missing artifact) + regression test.\n\nREQ-125 (the `coverage --explain <RULE>` surface remains a follow-up).\n\nImplements: REQ-125\nVerifies: REQ-125\nRefs: REQ-004\n\nCo-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>\n\n* style(test): fix clippy::doc_lazy_continuation on the --explain test doc\n\nA '+'-prefixed continuation line read as a list bullet; reworded. (Only\nsurfaces under clippy --all-targets, which CI runs but a plain -p check skips.)\n\nTrace: skip\n\n---------\n\nCo-authored-by: Claude Opus 4.8 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-05-31T13:36:06-05:00",
          "tree_id": "b5252ac38a978a1cdf94a11ca7668f1d3e4f4f65",
          "url": "https://github.com/pulseengine/rivet/commit/ef5455733c6d421b6fa3cde059bc7ed6a7feb53f"
        },
        "date": 1780252964637,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85842,
            "range": "± 890",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 914160,
            "range": "± 3994",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14486905,
            "range": "± 386848",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1940,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 23165,
            "range": "± 853",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 345355,
            "range": "± 1524",
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
            "value": 1459404,
            "range": "± 73186",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 167166,
            "range": "± 687",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1907597,
            "range": "± 40590",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 28400179,
            "range": "± 1245473",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 122913,
            "range": "± 921",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1130972,
            "range": "± 22671",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 14274377,
            "range": "± 344600",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4193,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 43199,
            "range": "± 149",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 752036,
            "range": "± 3745",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 63966,
            "range": "± 448",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 716742,
            "range": "± 4414",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8236493,
            "range": "± 439666",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 769,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7085,
            "range": "± 38",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 98076,
            "range": "± 1205",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21190,
            "range": "± 230",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 144711,
            "range": "± 824",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1345724,
            "range": "± 18465",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "de3d414e71a492b2585e53b498336112aebc688f",
          "message": "feat(list): --orphans — list artifacts disconnected from the traceability graph (REQ-128) (#373)\n\nThe orphan/\"asserted-but-unanchored\" detector (#358-adjacent; the epistemic\ncompanion to the incoming-links view already shipped in #364). `rivet list\n--orphans` keeps only artifacts with no inbound AND no outbound links — a\nrequirement no test verifies, a decision no hazard drives. Built on the\nexisting `LinkGraph::orphans`; composes with `--type` and `--format json`.\nVerified on rivet's own repo (surfaces 5 genuinely-disconnected artifacts);\nregression test asserts orphans are a subset of the full list. clippy\n--all-targets clean.\n\nREQ-128 (the inbound-link-count ranking report remains; kept draft).\n\nImplements: REQ-128\nVerifies: REQ-128\nRefs: REQ-007\n\nCo-authored-by: Claude Opus 4.8 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-05-31T14:18:03-05:00",
          "tree_id": "3e9161bb36738e192368b5a49efbffe8e518f52d",
          "url": "https://github.com/pulseengine/rivet/commit/de3d414e71a492b2585e53b498336112aebc688f"
        },
        "date": 1780255508464,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84781,
            "range": "± 350",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 927136,
            "range": "± 9708",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 17427450,
            "range": "± 1028534",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1944,
            "range": "± 16",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24916,
            "range": "± 48",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 363446,
            "range": "± 1442",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 245,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/1000",
            "value": 245,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 244,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1466894,
            "range": "± 14032",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 166436,
            "range": "± 611",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1922923,
            "range": "± 28632",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 27552336,
            "range": "± 581847",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 124310,
            "range": "± 1227",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1162811,
            "range": "± 16325",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 13476169,
            "range": "± 177758",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4249,
            "range": "± 14",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 44996,
            "range": "± 316",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 759766,
            "range": "± 11174",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 64255,
            "range": "± 2108",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 726832,
            "range": "± 4595",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 9118520,
            "range": "± 741928",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 784,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7133,
            "range": "± 49",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 98294,
            "range": "± 531",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 20985,
            "range": "± 111",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 144897,
            "range": "± 2010",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1346852,
            "range": "± 20222",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "fa5608415b60d4e10913885c782b684940709554",
          "message": "fix(reqif): directory import fails loudly on a corrupt file (REQ-120, F2) (#374)\n\nBug-hunt finding (f2-silent-failure, 3/3 lens-confirmed). `import_reqif_directory`\nskipped a malformed `.reqif`/`.xml` with only a `log::warn!` (often suppressed)\nand returned no signal to the caller — a silent partial import of interchange\ndata, exactly the trust-eroding class this codebase guards against.\n\nIt now collects every parse failure and returns an Err naming each file that\nfailed and was NOT imported, instead of dropping them silently. Valid-only\ndirectories are unaffected (existing test still green). Regression test\n`import_reqif_directory_fails_loudly_on_corrupt_file`.\n\nImplements: REQ-120\nVerifies: REQ-120\nRefs: REQ-004\n\nCo-authored-by: Claude Opus 4.8 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-05-31T15:54:13-05:00",
          "tree_id": "cf84e8835465060800340730e1e3bbfa1982b40d",
          "url": "https://github.com/pulseengine/rivet/commit/fa5608415b60d4e10913885c782b684940709554"
        },
        "date": 1780261248609,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 82866,
            "range": "± 2591",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 875960,
            "range": "± 16132",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 15442822,
            "range": "± 924234",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2182,
            "range": "± 17",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 27024,
            "range": "± 135",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 387416,
            "range": "± 1610",
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
            "value": 1448713,
            "range": "± 21929",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 161593,
            "range": "± 6416",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1892684,
            "range": "± 24696",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 28304327,
            "range": "± 1403032",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 128689,
            "range": "± 1323",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1106134,
            "range": "± 28368",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 13550845,
            "range": "± 551799",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4256,
            "range": "± 18",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 62461,
            "range": "± 335",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 804678,
            "range": "± 3547",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 62026,
            "range": "± 716",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 696519,
            "range": "± 6209",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7864177,
            "range": "± 222887",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 777,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7261,
            "range": "± 40",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 121445,
            "range": "± 822",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22647,
            "range": "± 130",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 158617,
            "range": "± 620",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1501714,
            "range": "± 15956",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "fc91f968129985bc6d4497fe58c16eac77918863",
          "message": "fix(reqif): import fails on an unresolved ENUM-VALUE-REF (REQ-119, F2) (#375)\n\nBug-hunt finding (f2-silent-failure, 3/3 lens-confirmed). An ENUM-VALUE-REF\nmatching no ENUM-VALUE @IDENTIFIER in any enumeration datatype was silently\ndropped by `.filter_map(|r| enum_value_names.get(...))`, producing a degraded /\nincomplete enum field value with no signal — an internally-inconsistent ReqIF\nimported as if clean.\n\nThe resolver now separates resolved from unresolved refs and returns an Err\nnaming the unresolved one(s), so the inconsistency surfaces instead of\ncorrupting the imported value. Regression test\n`parse_reqif_fails_on_unresolved_enum_value_ref`; all 45 reqif tests green.\n\nImplements: REQ-119\nVerifies: REQ-119\nRefs: REQ-004\n\nCo-authored-by: Claude Opus 4.8 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-05-31T17:09:37-05:00",
          "tree_id": "d365a47efca951b9cb8fb0951b05dce3058eb83b",
          "url": "https://github.com/pulseengine/rivet/commit/fc91f968129985bc6d4497fe58c16eac77918863"
        },
        "date": 1780265772522,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 83042,
            "range": "± 849",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 883448,
            "range": "± 13400",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 17081595,
            "range": "± 1456756",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2185,
            "range": "± 10",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26862,
            "range": "± 176",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 351725,
            "range": "± 3133",
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
            "value": 97,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1491507,
            "range": "± 15860",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 165937,
            "range": "± 7568",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1947172,
            "range": "± 32874",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 36073061,
            "range": "± 4430204",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 134789,
            "range": "± 1008",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1153585,
            "range": "± 21063",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 22798603,
            "range": "± 2995950",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4404,
            "range": "± 35",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 64281,
            "range": "± 527",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 779654,
            "range": "± 18122",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 58808,
            "range": "± 267",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 701633,
            "range": "± 4320",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 9314492,
            "range": "± 1051016",
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
            "value": 7134,
            "range": "± 54",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 113037,
            "range": "± 591",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23259,
            "range": "± 280",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 156731,
            "range": "± 2096",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1478935,
            "range": "± 18475",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "267cbaad7fd73fb89129d6acd36c39fcd81a9702",
          "message": "fix(reqif): import fails on a title-less SPEC-OBJECT (REQ-123, F2) (#376)\n\nBug-hunt finding (f2-silent-failure, 3/3 lens-confirmed). A SPEC-OBJECT with no\n`ReqIF.Name` attribute and no `@LONG-NAME` imported as an artifact with an empty\n`title` (a required base field) via `.unwrap_or_default()` — a silently-invalid\nartifact that masked the missing required field.\n\nImport now returns an Err naming the object when the title would be empty,\nsurfacing the missing field at import instead of producing a degraded artifact.\nCompletes the ReqIF F2 silent-failure sweep (REQ-119 enum drop, REQ-120\ndirectory swallow, REQ-123 empty title). Regression test\n`parse_reqif_fails_on_titleless_spec_object`; all 46 reqif tests green.\n\nImplements: REQ-123\nVerifies: REQ-123\nRefs: REQ-004\n\nCo-authored-by: Claude Opus 4.8 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-05-31T18:15:49-05:00",
          "tree_id": "add4d8cbb00dc7ae8ac4f0cc00a219900673f371",
          "url": "https://github.com/pulseengine/rivet/commit/267cbaad7fd73fb89129d6acd36c39fcd81a9702"
        },
        "date": 1780269753710,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84672,
            "range": "± 2620",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 930306,
            "range": "± 8822",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 16576329,
            "range": "± 652330",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1950,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25005,
            "range": "± 564",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 358530,
            "range": "± 7650",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 98,
            "range": "± 2",
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
            "value": 97,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1424391,
            "range": "± 18014",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 167977,
            "range": "± 897",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1902862,
            "range": "± 17260",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 34193090,
            "range": "± 847237",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 127258,
            "range": "± 1027",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1172513,
            "range": "± 12529",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 19113204,
            "range": "± 938896",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4354,
            "range": "± 10",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 44048,
            "range": "± 121",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 770115,
            "range": "± 6709",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 63402,
            "range": "± 638",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 716563,
            "range": "± 10069",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8946626,
            "range": "± 585234",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 730,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 6665,
            "range": "± 19",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 95954,
            "range": "± 332",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 20945,
            "range": "± 48",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 142906,
            "range": "± 452",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1336008,
            "range": "± 12337",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "a8167b1a11f92c7e9d0e08fdbf915653e06dc00e",
          "message": "fix(export): Zola links survive a sub-directory deploy (REQ-115/116/118) (#377)\n\n* fix(export): Zola links survive a sub-directory deploy (REQ-115/116/118)\n\nArtifact cross-links, document `[[ID]]` wiki-links, and the\n`rivet_artifact` shortcode card all emitted absolute\n`/<prefix>/artifacts/<slug>/` paths. On a GitHub-Pages-style project\nsite served under `/<repo>/`, an absolute path drops the deploy\nsub-path and 404s in the browser.\n\n- Markdown links (cross-links + wiki-links) now use Zola internal\n  links `@/<prefix>/artifacts/<slug>.md`, which Zola resolves against\n  `base_url`. A target not present in the export degrades to plain\n  text — never an absolute path leak, never a dangling `@/` link that\n  would abort `zola build`. The build-failure relocates to a precise\n  rivet-side membership check instead of an opaque downstream error.\n- The `rivet_artifact` shortcode card link uses `get_url(path=…)`,\n  which honours `base_url`.\n\nVerified end-to-end with a real `zola build` under a sub-directory\n`base_url`: 504 links rewritten, 0 absolute, 0 dangling, clean build.\nNew `export_zola.rs` integration test pins the generated link forms\n(asserts on content, not a live build, since CI has no `zola`).\n\nThe HTML-export half of REQ-118 was already covered by REQ-105's\n`rewrite_static_links` (rewrites `href`/`hx-get`/`src`), verified by\ninspecting exported document pages (0 absolute links).\n\nFixes: REQ-115, REQ-116, REQ-118\nVerifies: REQ-115, REQ-116, REQ-118\nRefs: REQ-004, REQ-105\n\nCo-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>\n\n* docs(artifacts): file REQ-138 — Zola export build smoke check (issue #378)\n\nDogfood-filed follow-up to the REQ-115/116/118 fix: the Zola export\ntests assert on generated strings, so \"export succeeded\" doesn't imply\n\"the site builds.\" Captures the product half of the friction reported\nin #378 — an optional `zola build` smoke job + a buildable-scaffold\nrecipe. Draft; traces-to REQ-115.\n\nRefs: REQ-115, REQ-004\n\n---------\n\nCo-authored-by: Claude Opus 4.8 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-05-31T20:25:45-05:00",
          "tree_id": "cce3b8ba4a83d4657f0fe0451d1e04af834bc59b",
          "url": "https://github.com/pulseengine/rivet/commit/a8167b1a11f92c7e9d0e08fdbf915653e06dc00e"
        },
        "date": 1780277543475,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84464,
            "range": "± 692",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 880088,
            "range": "± 5491",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 15086868,
            "range": "± 1059538",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2204,
            "range": "± 68",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25920,
            "range": "± 171",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 381657,
            "range": "± 1021",
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
            "value": 1460802,
            "range": "± 8887",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 160236,
            "range": "± 485",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1900994,
            "range": "± 10027",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 27405006,
            "range": "± 1225606",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 134465,
            "range": "± 2528",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1154543,
            "range": "± 9508",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 14460957,
            "range": "± 949415",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4248,
            "range": "± 69",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 62376,
            "range": "± 279",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 769249,
            "range": "± 3475",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 60851,
            "range": "± 227",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 692208,
            "range": "± 8165",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7721933,
            "range": "± 327787",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 753,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7049,
            "range": "± 34",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 116519,
            "range": "± 1161",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23671,
            "range": "± 392",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 164632,
            "range": "± 550",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1473851,
            "range": "± 31879",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "ab298f58b30ecab0afadfd4964af3f23e7fa0093",
          "message": "fix(load): only warn-skip malformed artifact files, silence non-artifact YAML (REQ-139) (#379)\n\nThe generic-YAML directory import warned `[WARN] skipping <file>: …` for\nevery file it declined to load — including legitimate non-artifact YAML\nthat lives under the artifacts source path (bindings.yaml,\nfeature-model.yaml, variants/*.yaml). On a real project that is a WARN\nline in front of every single command, burying the signal (#353 part 4).\n\nThe REQ-062 `SkipKind` classification already separates a malformed\nartifact file (`ParseError`) from expected non-artifact YAML\n(`NotArtifactFile`), but the load-path WARN ignored it and warned on\nboth. Gate the WARN on `classify_skip(...) == ParseError`: a real\nproblem still warns at load, and `rivet validate` still surfaces it as a\nhard `artifact-parse-error` Error; the expected case is now silent.\n\nVerified: `rivet list` on the rivet repo no longer prints skip-warns for\nbindings.yaml / feature-model.yaml / variants/*.yaml, while a malformed\nartifact file (id+type without the `artifacts:` wrapper) still warns and\nstill FAILs `validate`. Regression test in generic.rs.\n\nAlso files REQ-140 (draft): surfaced while verifying #353 — `validate`\n(lenient extract_schema_driven) loads artifacts from a file that\nlist/get/export (strict load_artifacts) silently drop, so the same\nproject yields different artifact sets per command. Flagged as a\nmaintainer design decision (which parser is canonical), not fixed here.\n\nImplements: REQ-139\nRefs: REQ-062, REQ-140\n\nCo-authored-by: Claude Opus 4.8 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-06-01T14:00:07-05:00",
          "tree_id": "8552065a2692f41815b9d1b6953b766634387a8b",
          "url": "https://github.com/pulseengine/rivet/commit/ab298f58b30ecab0afadfd4964af3f23e7fa0093"
        },
        "date": 1780340998054,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 78952,
            "range": "± 952",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 928723,
            "range": "± 12406",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 15076352,
            "range": "± 775066",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1664,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 19453,
            "range": "± 50",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 373944,
            "range": "± 1810",
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
            "value": 1368660,
            "range": "± 79356",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 161063,
            "range": "± 2446",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1957715,
            "range": "± 37156",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 36877532,
            "range": "± 2967011",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 123173,
            "range": "± 2142",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1244302,
            "range": "± 14991",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 17667133,
            "range": "± 1486248",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3954,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 41005,
            "range": "± 99",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 798710,
            "range": "± 4047",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 53321,
            "range": "± 241",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 589933,
            "range": "± 9858",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7635379,
            "range": "± 609365",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 612,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 5134,
            "range": "± 100",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 132912,
            "range": "± 796",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 20629,
            "range": "± 55",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 143875,
            "range": "± 285",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1337148,
            "range": "± 27490",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "0f60ad467d3830fe536a593e0f3b62162138a651",
          "message": "feat(modify): --where <s-expr> for query-driven bulk modify (REQ-141, #353) (#380)\n\nBringing a real project's statuses in line with shipped code (bulk\ndraft->implemented) had no first-class tool — only a shell loop of\nper-ID `rivet modify` calls, which #353 reported silently no-op'ing\nunder redirection (a suspected reload/rewrite race between\nrapid-succession subprocesses).\n\nAdd `rivet modify --where '<s-expr>' --set-*`: select every artifact\nmatching the same s-expression filter `rivet query` uses and apply the\nchange in a SINGLE in-process pass — load once, validate every target up\nfront (all-or-nothing), then write each affected file once. No\nsubprocess re-spawn, so it cannot race the way the shell loop could.\n\n- `--where` is mutually exclusive with a positional <ID> (clap-enforced).\n- `--dry-run` previews the match set, writes nothing.\n- An empty match set is a loud no-op (\"no artifacts match the --where\n  filter\") so an agent never reads silence as success.\n- Reuses the existing `sexpr_eval` engine — no new filter dialect.\n\nVerified end-to-end on a scratch project (dry-run byte-identical, bulk\napply flips only matches, empty-match no-op, ID+--where rejected). New\n`modify_where.rs` integration test (4 cases); clippy --all-targets +\nfmt clean; `rivet validate` PASS.\n\nImplements: REQ-141, REQ-007\nRefs: REQ-141\n\nCo-authored-by: Claude Opus 4.8 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-06-01T19:03:59-05:00",
          "tree_id": "c2d2b8bd6257307da27615f1e0281ef870b5aff0",
          "url": "https://github.com/pulseengine/rivet/commit/0f60ad467d3830fe536a593e0f3b62162138a651"
        },
        "date": 1780359038091,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84969,
            "range": "± 385",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 886791,
            "range": "± 17876",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12349359,
            "range": "± 257574",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2185,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 27261,
            "range": "± 262",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 377594,
            "range": "± 1854",
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
            "value": 1447625,
            "range": "± 31279",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 164289,
            "range": "± 377",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1888092,
            "range": "± 27627",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 27121958,
            "range": "± 923609",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 132734,
            "range": "± 8709",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1159008,
            "range": "± 22282",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 12908564,
            "range": "± 699881",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4373,
            "range": "± 10",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 58157,
            "range": "± 337",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 756270,
            "range": "± 6106",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 59127,
            "range": "± 1523",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 709769,
            "range": "± 11246",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7732455,
            "range": "± 323169",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 740,
            "range": "± 10",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7452,
            "range": "± 53",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 127075,
            "range": "± 942",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22447,
            "range": "± 510",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 161444,
            "range": "± 2492",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1457427,
            "range": "± 14200",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "1363ca7a485e53822082ebd8dcc84f4fc3770053",
          "message": "fix(modify): correct s-expr syntax in --where help examples (REQ-141) (#382)\n\nThe `modify --where` after_help examples I added in #380 used an invalid\nfilter shorthand — `(type \"requirement\")` / `(status \"draft\")` — where\nthe head symbol must be an operator, not the field name. Run verbatim\nthey error with \"unknown form 'type'/'status'\". Corrected to the\ncanonical `(= field \"value\")` form, both examples now run clean:\n\n  rivet modify --where '(= status \"draft\")' --set-status implemented\n  rivet modify --where '(and (= type \"requirement\") (= status \"draft\"))' …\n\nVerified both examples execute (dry-run) without a parse error. The\nbroader discoverability gap (the parse error shows no example of the\ncommon field-equality form) is tracked in #381.\n\nImplements: REQ-141\nRefs: REQ-007\n\nCo-authored-by: Claude Opus 4.8 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-06-01T19:28:22-05:00",
          "tree_id": "5356ccd2deffd4deab8740cf49ab22dc10f27dce",
          "url": "https://github.com/pulseengine/rivet/commit/1363ca7a485e53822082ebd8dcc84f4fc3770053"
        },
        "date": 1780360498214,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 83992,
            "range": "± 853",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 882608,
            "range": "± 24154",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13111470,
            "range": "± 466967",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2106,
            "range": "± 80",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25572,
            "range": "± 331",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 365279,
            "range": "± 788",
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
            "value": 1479601,
            "range": "± 20295",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 159214,
            "range": "± 4156",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1867251,
            "range": "± 39424",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 26585904,
            "range": "± 2402999",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 133182,
            "range": "± 1189",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1146310,
            "range": "± 13434",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 13014679,
            "range": "± 1149462",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4248,
            "range": "± 10",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60053,
            "range": "± 824",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 807644,
            "range": "± 11903",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 60248,
            "range": "± 187",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 682060,
            "range": "± 3627",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7521663,
            "range": "± 119826",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 749,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 6906,
            "range": "± 30",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 117224,
            "range": "± 1544",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22670,
            "range": "± 79",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 154235,
            "range": "± 943",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1444685,
            "range": "± 37419",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "944424500d638a0868c644dd655da5b9a5ba0fc0",
          "message": "fix(sexpr): show field-equality example in filter parse error (REQ-142, #381) (#383)\n\nThe s-expression filter dialect (query / list --filter / export --filter\n/ modify --where) puts an operator in head position, but the single most\ncommon first attempt is `(status \"draft\")` — field name in head — which\nfails with `unknown form 'status'`. The error listed every supported\nhead form but showed no example of the correct `(= field \"value\")`\nshape, so every first-time author (human or agent) burned a round-trip\nand a grep through the tests to discover it.\n\nThe `unknown head symbol` note now states the head is an operator (not a\nfield name) and shows the form inline: `(= status \"draft\")` /\n`(and (= type \"requirement\") (has-tag \"safety\"))`. Generated once in\n`sexpr_eval`, so it reaches every command that parses a filter. Verified\non `modify --where` and `list --filter`. Also added an example to the\n`export --filter` help (it had none, unlike list/query). Test asserts\nthe example is present.\n\nImplements: REQ-142\nRefs: REQ-007\n\nCo-authored-by: Claude Opus 4.8 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-06-01T22:51:06-05:00",
          "tree_id": "70e81b7ea87fdf4b68aafab9b5216711e86a5a1e",
          "url": "https://github.com/pulseengine/rivet/commit/944424500d638a0868c644dd655da5b9a5ba0fc0"
        },
        "date": 1780372666304,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84950,
            "range": "± 401",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 925914,
            "range": "± 6045",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 20013565,
            "range": "± 1202693",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1978,
            "range": "± 39",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25021,
            "range": "± 450",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 364785,
            "range": "± 9086",
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
            "value": 97,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1428472,
            "range": "± 26793",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 167163,
            "range": "± 1873",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1940187,
            "range": "± 20495",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 45975577,
            "range": "± 3848604",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 125638,
            "range": "± 1259",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1180145,
            "range": "± 26510",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 29019341,
            "range": "± 1098408",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4158,
            "range": "± 12",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 43826,
            "range": "± 145",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 783089,
            "range": "± 27936",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 63557,
            "range": "± 197",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 744004,
            "range": "± 5963",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 11982422,
            "range": "± 849329",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 766,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 6755,
            "range": "± 15",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 99079,
            "range": "± 650",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 20877,
            "range": "± 112",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 145877,
            "range": "± 1848",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1352346,
            "range": "± 18816",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "7965e6dab2624e7f3b12fb9b75aebf25c2702756",
          "message": "fix(externals): resolve refs with a hyphenated (kebab) prefix (REQ-143) (#384)\n\nUser-reported (0.14.0): `/artifacts/linc-mesh:A-AVTP-STREAM` in serve\nreturned \"Artifact does not exist\", and external `prefix:ID` refs with a\nkebab-case prefix were unresolved in document rendering, although the\nartifact existed in the external project.\n\nRoot cause: `parse_artifact_ref` required the prefix to be purely\n`is_ascii_lowercase()` — no hyphens — so a project slug like `linc-mesh`\nfell through to `ArtifactRef::Local(\"linc-mesh:A-AVTP-STREAM\")` and was\nlooked up as a local id (404). But externals are stored as\n`<prefix>:<id>` with that same hyphenated prefix, so the parser no longer\nround-tripped its own stored form. Every external whose prefix contained\na hyphen was unreachable in the serve detail view and in document link\nresolution (both delegate to this one function).\n\nFix: accept a kebab-case slug prefix — leading lowercase letter, then\nlowercase letters / digits / hyphens. Updated the Kani round-trip proof\nto the new contract. Regression tests: `linc-mesh:A-AVTP-STREAM` and\n`linc2:REQ-1` parse as External; non-slug `H-1:2` / `-bad:REQ-1` stay\nLocal; all 28 externals tests pass.\n\nAlso files REQ-144 (source-view substring mis-link) and REQ-145\n(test-results `rivet_tc_id` property) — two more user reports triaged\nthis iteration, draft, to be worked next.\n\nFixes: REQ-143\nRefs: REQ-085, REQ-144, REQ-145\n\nCo-authored-by: Claude Opus 4.8 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-06-02T00:59:43-05:00",
          "tree_id": "2d155d72be22039fce160337d951032c91148735",
          "url": "https://github.com/pulseengine/rivet/commit/7965e6dab2624e7f3b12fb9b75aebf25c2702756"
        },
        "date": 1780380377464,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85575,
            "range": "± 303",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 900003,
            "range": "± 9263",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 15573801,
            "range": "± 1703085",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2186,
            "range": "± 19",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25680,
            "range": "± 402",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 381195,
            "range": "± 4317",
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
            "value": 1436838,
            "range": "± 25454",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 169202,
            "range": "± 1136",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 2006784,
            "range": "± 18196",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 46589696,
            "range": "± 2317155",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 135230,
            "range": "± 1835",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1199598,
            "range": "± 29338",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 12753787,
            "range": "± 400759",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4292,
            "range": "± 123",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 59604,
            "range": "± 437",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 760882,
            "range": "± 7988",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 63539,
            "range": "± 147",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 725423,
            "range": "± 25285",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7616565,
            "range": "± 97203",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 739,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 6871,
            "range": "± 44",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 129172,
            "range": "± 841",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22553,
            "range": "± 89",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 161398,
            "range": "± 1823",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1519446,
            "range": "± 13819",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "78ae68eb2d0bb1d2e763833e87191cef4f6e9bd9",
          "message": "fix(source-view): match artifact ids as whole tokens, not substrings (REQ-144) (#387)\n\nUser-reported: in the source view, an id that is a SUBSTRING of a longer\nid was wrongly linked — e.g. `SWR-001` linked inside `SDV-BCM-SWR-001`,\na phantom trace edge. The viewer gated and linkified ids with\n`line.contains(id)`, a raw substring test.\n\nAdd `line_contains_id_token`: an id matches only when bounded on both\nsides by a non-`[A-Za-z0-9-]` character (or a string boundary). Ids\ncontain hyphens, so a hyphen is part of the token, not a delimiter —\nwhich is exactly what distinguishes `SWR-001` from `SDV-BCM-SWR-001`.\nUsed at both the highlight gate and the linkify filter. Ids are ASCII,\nso byte-boundary checks align with char boundaries.\n\nRegression test covers: substring NOT matched (`SWR-001` in\n`SDV-BCM-SWR-001`), longer id matched, exact/delimited occurrences\nmatched, trailing-alnum (`SWR-0011`) and leading-alnum (`xSWR-001`) not\nmatched. `rivet validate` PASS.\n\nImplements: REQ-144\nRefs: REQ-092\n\nCo-authored-by: Claude Opus 4.8 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-06-02T01:43:46-05:00",
          "tree_id": "4eef0ebdacb739f3ce8c641ff7055dd73081c5e3",
          "url": "https://github.com/pulseengine/rivet/commit/78ae68eb2d0bb1d2e763833e87191cef4f6e9bd9"
        },
        "date": 1780382995762,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 68238,
            "range": "± 1469",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 718667,
            "range": "± 6115",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12437079,
            "range": "± 546421",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1486,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 18549,
            "range": "± 182",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 261971,
            "range": "± 959",
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
            "value": 1128582,
            "range": "± 17441",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 127092,
            "range": "± 526",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1501015,
            "range": "± 26095",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 28895237,
            "range": "± 2353824",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 98772,
            "range": "± 508",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 899359,
            "range": "± 14586",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 19303757,
            "range": "± 1134257",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3230,
            "range": "± 12",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 35700,
            "range": "± 148",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 597872,
            "range": "± 4012",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 46675,
            "range": "± 857",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 517642,
            "range": "± 2925",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 6648145,
            "range": "± 423645",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 566,
            "range": "± 12",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 5096,
            "range": "± 10",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 75119,
            "range": "± 201",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 16739,
            "range": "± 28",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 112704,
            "range": "± 378",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1040184,
            "range": "± 12268",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "6ccc2f3492f1fb2c284899088abed16945edc64b",
          "message": "feat(junit): honor a rivet_tc_id testcase property as the artifact id (REQ-145) (#388)\n\nUser-reported (#386): importing JUnit results derived the artifact id\nfrom `classname` + `name`, which rarely matches a real artifact, so the\nresult linked to nothing. The user records an explicit id per testcase\nvia `<property name=\"rivet_tc_id\" value=\"...\"/>`, but the parser ignored\n`<property>` children entirely.\n\nNow the parser reads `<property>` children of a `<testcase>`; a\n`rivet_tc_id` property value becomes the result's artifact id, taking\npriority over every classname/name heuristic AND the marker fallback. A\nsuite-level or unrelated property is ignored; absent the property,\nbehaviour is unchanged (back-compatible).\n\nTests: property-present (overrides classname.name), property overrides a\nclassname that is itself an artifact id, property-absent keeps the\nclassname.name behaviour. All 25 junit tests pass; clippy --all-targets\n+ fmt clean; rivet validate PASS; docs check PASS.\n\nImplements: REQ-145\nRefs: REQ-101\n\nCo-authored-by: Claude Opus 4.8 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-06-02T02:03:12-05:00",
          "tree_id": "11be501a015a72b781c8196cb5ea71afe763f231",
          "url": "https://github.com/pulseengine/rivet/commit/6ccc2f3492f1fb2c284899088abed16945edc64b"
        },
        "date": 1780384183129,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84446,
            "range": "± 1352",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 890132,
            "range": "± 6549",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12470120,
            "range": "± 253802",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2200,
            "range": "± 11",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26906,
            "range": "± 180",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 353908,
            "range": "± 1608",
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
            "value": 1437101,
            "range": "± 10354",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 164464,
            "range": "± 558",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1917217,
            "range": "± 5975",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 25193457,
            "range": "± 926623",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 130677,
            "range": "± 2335",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1156110,
            "range": "± 25083",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 12522737,
            "range": "± 423960",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4302,
            "range": "± 74",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 59263,
            "range": "± 144",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 745164,
            "range": "± 2812",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 62515,
            "range": "± 387",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 701328,
            "range": "± 8785",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7633418,
            "range": "± 60183",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 757,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7136,
            "range": "± 103",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 123703,
            "range": "± 1073",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23241,
            "range": "± 93",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 159715,
            "range": "± 1996",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1480980,
            "range": "± 37316",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "02b689372c6fc4743b41f6134889e068458c52e0",
          "message": "test(serve): give graph_type_filter test a 15s budget to kill the flake (#389) (#390)\n\n`graph_type_filter_renders_when_under_budget` fetched\n`/graph?types=requirement` with the default 5s read timeout. That\nendpoint does a BFS + layout over the dogfood corpus (~742 nodes / 1477\nedges), which on a loaded CI runner can brush past 5s; `fetch_with_timeout`\nparses a timed-out/empty response's status as 0, so the timeout surfaced\nas `status == 0` and failed the `== 200` assertion. Same chronic flake\nthe focus-graph tests already fixed with a 15s budget — this one test\nwas missed. It falsely failed CI on #380, #387, and #388.\n\nSwitch it to `fetch_with_timeout(..., 15s)`, matching the other graph\nendpoints. The test asserts on the response shape (SVG or budget\nmessage), not a hard latency bound, so the wider timeout is safe.\nVerified locally: passes 3/3 runs.\n\nTrace: skip\nCloses: #389\n\nCo-authored-by: Claude Opus 4.8 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-06-02T02:30:35-05:00",
          "tree_id": "5675d70fd1de6fb6f55b9e09895e963300b92aa4",
          "url": "https://github.com/pulseengine/rivet/commit/02b689372c6fc4743b41f6134889e068458c52e0"
        },
        "date": 1780385837847,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84493,
            "range": "± 511",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 921216,
            "range": "± 6056",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14629996,
            "range": "± 707108",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1929,
            "range": "± 162",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25144,
            "range": "± 98",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 352207,
            "range": "± 2546",
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
            "value": 1419041,
            "range": "± 16461",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 167101,
            "range": "± 1041",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1923783,
            "range": "± 15862",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 30436376,
            "range": "± 2033373",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 123336,
            "range": "± 2485",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1168099,
            "range": "± 10103",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 14125962,
            "range": "± 607250",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4241,
            "range": "± 23",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 44805,
            "range": "± 286",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 770312,
            "range": "± 3538",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 63932,
            "range": "± 559",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 717722,
            "range": "± 5397",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8330878,
            "range": "± 365070",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 737,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 6585,
            "range": "± 18",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 98150,
            "range": "± 570",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 20966,
            "range": "± 211",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 145274,
            "range": "± 570",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1348069,
            "range": "± 23484",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "a37bda6c1a6f72458613689890fbc0102d9143ea",
          "message": "feat(scripts): Zola export build smoke check (REQ-138, #378) (#391)\n\nAdds scripts/zola-export-smoke.sh: exports the corpus into a scaffolded\nZola site whose base_url is a sub-directory deploy, runs a real\n`zola build`, and fails on a build error OR on any built-HTML\nartifact/document link that drops the deploy sub-path.\n\nThis is the end-to-end gate the string-asserting unit tests can't give —\n\"export succeeded\" now provably implies \"the site builds and its links\nresolve under a sub-directory deploy.\" It catches the REQ-115/116/118\nabsolute-link class that previously shipped undetected. The script skips\ncleanly (exit 0 + notice) when `zola` is absent, so it can gate on\navailability.\n\nVerified locally: passes on the current corpus (1219 pages, 0 leaks);\nthe leak detector fires on the pre-fix `/<prefix>/artifacts/…` pattern\nwhile ignoring correctly-resolved full-URL links. Wiring it as a gated\nCI job (needs a zola install on the runner) is a follow-up.\n\nImplements: REQ-138\nRefs: REQ-115\n\nCo-authored-by: Claude Opus 4.8 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-06-02T03:33:08-05:00",
          "tree_id": "80d4292bf17c65a7e35426c1596c89362ca719d1",
          "url": "https://github.com/pulseengine/rivet/commit/a37bda6c1a6f72458613689890fbc0102d9143ea"
        },
        "date": 1780389585524,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85531,
            "range": "± 502",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 890957,
            "range": "± 5594",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12398686,
            "range": "± 372468",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2193,
            "range": "± 18",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25429,
            "range": "± 128",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 371437,
            "range": "± 920",
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
            "value": 1432148,
            "range": "± 20454",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 160056,
            "range": "± 1630",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1876137,
            "range": "± 8527",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 24086899,
            "range": "± 1136601",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 132245,
            "range": "± 1149",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1151829,
            "range": "± 27943",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 12815374,
            "range": "± 582007",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4255,
            "range": "± 14",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 57545,
            "range": "± 309",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 829558,
            "range": "± 7393",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 62249,
            "range": "± 1306",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 700128,
            "range": "± 9984",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7873722,
            "range": "± 205789",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 777,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 6695,
            "range": "± 22",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 126259,
            "range": "± 1432",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22267,
            "range": "± 205",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 154605,
            "range": "± 753",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1466195,
            "range": "± 19725",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "7a41f0d2655bc7ecad45759b51315b9adda52ce6",
          "message": "fix(validate): salsa path evaluates status-gate validation-rules (REQ-146, #355) (#393)\n\n`rivet validate` runs the incremental salsa path (`db::validate_all`),\nwhich evaluated structural rules (phases 1-7) and conditional rules\n(phase 8) but NOT the status-gate `validation-rules` (phase 9 — the\n`(implies …)` V-model promotion gates). The direct `validate::validate*`\npath (used by `rivet check gaps-json` and `rivet validate --direct`) DID\nevaluate them. So the default `rivet validate` silently PASSED a project\nwith a status-gate violation that gaps-json / --direct correctly FAILED\n— the divergence reported in #355 Finding 3, and a soundness gap since\nthe default validation surface under-reported.\n\nFix: `db::validate_all` and `validate_all_with_extras` now also call\n`validate::evaluate_validation_rules` against the same materialized\nstore/schema/graph, so every validation surface agrees.\n\nReproduced + verified: a project with an aspice `validation-rules` gate\n(an approved sys-verification verifying a draft system-req) previously\ngave salsa `FAIL (1 error)` vs direct `FAIL (2 errors)`; now both report\n2 including the gate. rivet's own corpus still PASS (181→ unchanged) on\nboth paths. New regression test\n`db::tests::validation_rules_evaluated_in_validate_all`; rivet-core db\n(24) + validation_rule (3) tests pass; clippy --all-targets + fmt clean;\nrivet validate + docs check PASS.\n\nFixes: REQ-146\nRefs: REQ-029, REQ-004\n\nCo-authored-by: Claude Opus 4.8 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-06-02T04:43:07-05:00",
          "tree_id": "21286356b785b9859c0da9d58a121391bde2e72e",
          "url": "https://github.com/pulseengine/rivet/commit/7a41f0d2655bc7ecad45759b51315b9adda52ce6"
        },
        "date": 1780393798112,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 83525,
            "range": "± 310",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 900312,
            "range": "± 25882",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 16620328,
            "range": "± 1512508",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2219,
            "range": "± 44",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26775,
            "range": "± 332",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 353876,
            "range": "± 5369",
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
            "value": 1444891,
            "range": "± 20746",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 163861,
            "range": "± 2396",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1921167,
            "range": "± 22633",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 33166952,
            "range": "± 4043120",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 131454,
            "range": "± 4619",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1148634,
            "range": "± 30451",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 18635963,
            "range": "± 1894118",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4488,
            "range": "± 12",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 62279,
            "range": "± 972",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 741233,
            "range": "± 5587",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 62814,
            "range": "± 1037",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 703553,
            "range": "± 11893",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 10270186,
            "range": "± 863184",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 772,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7349,
            "range": "± 56",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 139414,
            "range": "± 1007",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22600,
            "range": "± 85",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 156887,
            "range": "± 1133",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1475639,
            "range": "± 42095",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "b097e49ea7b523d5ba4c627770ed05ae25c4ec2a",
          "message": "fix(validate): coverage diagnostics name the link + satisfier types (REQ-147, #350) (#394)\n\nMarking a sw-req `implemented` then running `rivet validate` produced\ncoverage diagnostics that said WHAT was missing but not HOW to satisfy\nit; the reporter reverse-engineered the required shape from an unrelated\nlink-target rejection (\"a whole detour\").\n\nTwo schema-agnostic guidance improvements (no rule semantics changed):\n- The `required-backlink` coverage diagnostic now appends the incoming\n  link type and allowed source types, e.g. \"… — needs an incoming\n  `verifies` link from one of [sw-verification, unit-verification,\n  sw-integration-verification]\".\n- The `Lifecycle coverage gaps` summary now points at\n  `rivet validate --explain <ID>`, which lists each rule's\n  satisfied/MISSING state with the exact incoming link + source types\n  (and alternates) — verified the pointer resolves to that breakdown.\n\nAlso files REQ-148 (draft): a generic `coverage-rule-consistency`\nmeta-check to flag a `required-backlink` rule whose `from-types` include\ntypes no link rule permits to form the backlink (the aspice\n`swe1-has-verification` lists unit/integration-verification as sw-req\nsatisfiers, but only sw-verification can `verifies`→sw-req). Deferred —\nneeds conservative implementation to avoid false positives; the aspice\nfrom-types intent itself is a maintainer/compliance call (#350/#355).\n\nAll 74 validate tests pass; clippy --all-targets + fmt clean; rivet\nvalidate + docs check PASS.\n\nImplements: REQ-147\nRefs: REQ-125, REQ-148\n\nCo-authored-by: Claude Opus 4.8 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-06-02T05:39:32-05:00",
          "tree_id": "3a025daaac0dfff2f81c3f05930f2922418d82e9",
          "url": "https://github.com/pulseengine/rivet/commit/b097e49ea7b523d5ba4c627770ed05ae25c4ec2a"
        },
        "date": 1780397178636,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 86314,
            "range": "± 286",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 949508,
            "range": "± 10870",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 15556394,
            "range": "± 713216",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1954,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24973,
            "range": "± 110",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 362926,
            "range": "± 1991",
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
            "value": 1430609,
            "range": "± 14947",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 167345,
            "range": "± 817",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1948494,
            "range": "± 15784",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 42245995,
            "range": "± 5885746",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 137009,
            "range": "± 4351",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1271303,
            "range": "± 14161",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 19561737,
            "range": "± 4260572",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4177,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 44599,
            "range": "± 1060",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 757531,
            "range": "± 7019",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 66103,
            "range": "± 346",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 754610,
            "range": "± 11864",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8311482,
            "range": "± 473848",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 765,
            "range": "± 51",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 6536,
            "range": "± 82",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 95635,
            "range": "± 615",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21259,
            "range": "± 273",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 146018,
            "range": "± 799",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1360606,
            "range": "± 17449",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "737a99caa217c45eb5179d0249ebb4076441114e",
          "message": "docs(schemas): recipe for extending a built-in artifact type with project fields (REQ-149, #350) (#395)\n\n#350 suggestion 4: a project's `crate:` field on an ASPICE `sw-req`\nproduced dozens of `INFO: field 'crate' is not defined in schema`\nadvisories, and the reporter asked for an easy per-project field\nextension without forking the schema.\n\nVerified the mechanism already exists — `ArtifactTypeDef::merge_in_place`\nunions `fields` by name across schemas sharing a type name, so a\nproject-local schema re-declaring the built-in type with only the extra\nfield (registered after the built-in in `project.schemas`) adds the\nfield without forking. Confirmed empirically: with the extension the\n`crate` INFO disappears; without it, it's present.\n\nIt was just undocumented. Added the \"Extending a built-in artifact type\nwith project fields\" recipe to docs/schemas.md (copy-pasteable, plus the\n`--min-severity warning` alternative), and corrected the merging-behavior\nnote (same-named artifact types merge fields by name; they don't replace\nwholesale). `rivet docs check` PASS.\n\nImplements: REQ-149\nRefs: REQ-010\n\nCo-authored-by: Claude Opus 4.8 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-06-02T06:35:48-05:00",
          "tree_id": "a460dba62fb4850519d6889cff2ebcea1b80b35b",
          "url": "https://github.com/pulseengine/rivet/commit/737a99caa217c45eb5179d0249ebb4076441114e"
        },
        "date": 1780400549507,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85051,
            "range": "± 333",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 918604,
            "range": "± 8403",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14614623,
            "range": "± 348828",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1973,
            "range": "± 11",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24979,
            "range": "± 338",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 368567,
            "range": "± 3476",
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
            "value": 1437697,
            "range": "± 18866",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 167265,
            "range": "± 899",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1949367,
            "range": "± 25171",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 28816203,
            "range": "± 434255",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 128677,
            "range": "± 2345",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1219694,
            "range": "± 12625",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 14273310,
            "range": "± 228383",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4092,
            "range": "± 22",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 45132,
            "range": "± 176",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 749984,
            "range": "± 5665",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 61933,
            "range": "± 156",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 730309,
            "range": "± 3152",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8217909,
            "range": "± 696764",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 771,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7006,
            "range": "± 35",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 94603,
            "range": "± 450",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21067,
            "range": "± 243",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 146721,
            "range": "± 653",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1356043,
            "range": "± 10348",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "8891494b2bfea0335682ec1ce4c05072fb8140d5",
          "message": "chore(artifacts): dogfood REQ audit — flip REQ-134 implemented, reconcile REQ-149 duplicate, file REQ-150 (#396)\n\nUsed `rivet list --type requirement` + `--explain` to audit the REQs\nfiled over recent iterations. Findings, each verified against merged\ncode (not flipped blindly):\n\n- REQ-134 (per-project field extension) → implemented: both acceptance\n  criteria are met — the schema-merge field-union mechanism works\n  (verified empirically) and it's documented in docs/schemas.md (#395).\n- REQ-149 was an accidental duplicate of REQ-134 (filed before noticing\n  the pre-existing one). Linked REQ-149 -> REQ-134 and tagged it so the\n  relationship is explicit rather than a stray parallel item.\n- Left correctly-draft: REQ-128 (orphans filter shipped, but the\n  inbound-count ranking report is still outstanding), REQ-132 (single-hop\n  link naming done in REQ-147; the multi-hop chain naming is not),\n  REQ-135 (validate/modify enforcement built but inert pending the\n  maintainer's canonical status set + artifact reconciliation).\n- Filed REQ-150 (draft): `rivet add` warns on no near-duplicate, only\n  duplicate id — the gap that let me file REQ-149. A non-blocking\n  \"similar to <ID>\" advisory would catch it.\n\n`rivet validate` PASS.\n\nImplements: REQ-134\nRefs: REQ-149, REQ-150, REQ-010\n\nCo-authored-by: Claude Opus 4.8 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-06-02T07:36:32-05:00",
          "tree_id": "3731278dcabbc26eba4868063a3d01009439dbe3",
          "url": "https://github.com/pulseengine/rivet/commit/8891494b2bfea0335682ec1ce4c05072fb8140d5"
        },
        "date": 1780404190661,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 83250,
            "range": "± 470",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 869975,
            "range": "± 12222",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 17282984,
            "range": "± 2427530",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2142,
            "range": "± 12",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 27472,
            "range": "± 289",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 386900,
            "range": "± 2738",
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
            "value": 93,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1451574,
            "range": "± 17472",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 163501,
            "range": "± 2361",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1933336,
            "range": "± 14256",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 25284311,
            "range": "± 1141574",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 139306,
            "range": "± 1289",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1201425,
            "range": "± 25355",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 12996001,
            "range": "± 417453",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4160,
            "range": "± 13",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60925,
            "range": "± 257",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 845768,
            "range": "± 1628",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 60959,
            "range": "± 210",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 697258,
            "range": "± 6255",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7771074,
            "range": "± 117800",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 778,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7556,
            "range": "± 52",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 115362,
            "range": "± 1046",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23375,
            "range": "± 77",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 167156,
            "range": "± 3540",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1538263,
            "range": "± 34666",
            "unit": "ns/iter"
          }
        ]
      }
    ]
  }
}