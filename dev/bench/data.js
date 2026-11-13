window.BENCHMARK_DATA = {
  "lastUpdate": 1794612120164,
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
      },
      {
        "commit": {
          "author": {
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
          "id": "ff8e092d18a999c44f4c8b87e1dfb94512b2c1a2",
          "message": "ci: CI Gate accepts a skip only for a recorded reason; temper gate probe (#1211)\n\n* ci: CI Gate accepts a skip only for a recorded reason; temper gate probe\n\ntemper's report-only gate check (temper#86) flags rivet with\naggregate_accepts_skip: CI Gate passed any skipped need once the change\ndetector had succeeded, without checking that the detector excluded that\njob. A job skipped for any other reason read as a pass.\n\nThe verdict moves to tools/ci/ci-gate-check.sh. A skip passes only when\nthe `changes` output that gates the job is \"false\" (fmt, clippy, msrv,\ndeny, semver-checks on rust; test and supply-chain on tests; wasm-seam on\nwasm), or when the job's own event condition excludes the event\n(semver-checks outside pull_request, supply-chain in the merge queue). A\nskip of anything else (docs-check, yaml-lint, traceability) fails, as does\na failed detector. The gate job gains a sparse, credential-less checkout of\ntools/ci to run it. tools/ci/ci-gate-check_test.sh holds it to those rules\nwith 12 cases, most of them negative controls; a mutant that accepts every\nskip turns 4 of them red.\n\ndetect-changes.sh reads GATE_PROBE_FILES when set (temper\ndocs/gate-probe.md): the probe runs it with no event or git range, which\npreviously failed closed by running everything, so the probe would have\npassed without the classifier running. .github/gate-probe.json declares the\n`tests` output, which every control turns on (code and data both run the\ntests). `rust` is not declared: by the maintainer's choice, supply-chain/\nis data and runs Test and cargo-vet but not the whole matrix. The detector\ntest gains probe-mode cases, including a listed non-code path that must\ncome back all false so a say-true-to-everything detector cannot pass.\n\nConfirmed with ci-gate-check_test.sh (12 pass), detect-changes_test.sh (31\npass), a local probe run over temper's three default controls and rivet's\nown, and actionlint (clean apart from custom runner labels).\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9\n\n* ci: declare a negative control in gate-probe.json\n\ntemper#87 requires a non-empty negative_controls list: each declared output\nmust come back exactly \"false\" for those paths, or the probe reports the\ndetector VACUOUS. LICENSE-MIT is a listed non-code path (the same one the\ndetector test uses); a local run with the probe environment (EVENT_NAME and\nGITHUB_EVENT_NAME pull_request, GATE_PROBE_FILES, GITHUB_OUTPUT) gives\ntests=false for it and tests=true for all six controls.\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9\n\n* ci: declare the exempt detector outputs in gate-probe.json\n\ntemper#87 asks every detector output that gates a required check to be\neither probed (outputs) or exempt with a reason (exempt_outputs). CI Gate\nneeds jobs gated on rust (fmt, clippy, msrv, deny, semver-checks), tests\n(test, supply-chain) and wasm (wasm-seam). tests stays probed. rust is\nexempt: data-tier changes skip the full matrix by the maintainer's choice.\nwasm is exempt and says why: its filter is still a positive list, the\nfail-open shape #1206 left unconverted. proofs, e2e and vscode gate no\nrequired check.\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9\n\n---------\n\nCo-authored-by: Claude Opus 5.5 <noreply@anthropic.com>",
          "timestamp": "2026-11-08T19:48:57Z",
          "tree_id": "265f9c8a24f312a78bcc62b07d5640f1d6de27dc",
          "url": "https://github.com/pulseengine/rivet/commit/ff8e092d18a999c44f4c8b87e1dfb94512b2c1a2"
        },
        "date": 1794172654025,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 66617,
            "range": "± 223",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 680728,
            "range": "± 6783",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 11503845,
            "range": "± 126257",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1481,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 17911,
            "range": "± 46",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 279645,
            "range": "± 3830",
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
            "value": 1537740,
            "range": "± 28913",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 119247,
            "range": "± 655",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1357580,
            "range": "± 15301",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 20714365,
            "range": "± 175478",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 545593,
            "range": "± 2207",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 12471576,
            "range": "± 61577",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 857468295,
            "range": "± 6371129",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3515,
            "range": "± 19",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 40041,
            "range": "± 253",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 612295,
            "range": "± 5288",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 42978,
            "range": "± 584",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 497795,
            "range": "± 1851",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 6128103,
            "range": "± 27842",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 828,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 11347,
            "range": "± 29",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 197281,
            "range": "± 1491",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 17223,
            "range": "± 53",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 111566,
            "range": "± 485",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1028435,
            "range": "± 26947",
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
          "id": "14006fc2eb232ed8a0ad41a6f0a034f3b21131cc",
          "message": "build(deps-dev): bump @types/vscode in /vscode-rivet (#1213)\n\nBumps [@types/vscode](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/HEAD/types/vscode) from 1.91.0 to 1.145.0.\n- [Release notes](https://github.com/DefinitelyTyped/DefinitelyTyped/releases)\n- [Commits](https://github.com/DefinitelyTyped/DefinitelyTyped/commits/HEAD/types/vscode)\n\n---\nupdated-dependencies:\n- dependency-name: \"@types/vscode\"\n  dependency-version: 1.145.0\n  dependency-type: direct:development\n  update-type: version-update:semver-minor\n...\n\nSigned-off-by: dependabot[bot] <support@github.com>\nCo-authored-by: dependabot[bot] <49699333+dependabot[bot]@users.noreply.github.com>",
          "timestamp": "2026-11-08T22:30:54Z",
          "tree_id": "acdc62683d3b44c8b82928e17fbbad7ffd59b4d9",
          "url": "https://github.com/pulseengine/rivet/commit/14006fc2eb232ed8a0ad41a6f0a034f3b21131cc"
        },
        "date": 1794178644673,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 46749,
            "range": "± 718",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 587016,
            "range": "± 15811",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 10729184,
            "range": "± 675666",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1042,
            "range": "± 17",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 12286,
            "range": "± 269",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 244738,
            "range": "± 8937",
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
            "value": 46,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1195290,
            "range": "± 21736",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 109575,
            "range": "± 1678",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1231297,
            "range": "± 31608",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 17166984,
            "range": "± 979469",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 418410,
            "range": "± 14709",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 9035728,
            "range": "± 406372",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 571801609,
            "range": "± 9626891",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 2859,
            "range": "± 40",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 31526,
            "range": "± 182",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 468042,
            "range": "± 8633",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 31312,
            "range": "± 1011",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 344935,
            "range": "± 13274",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 4157138,
            "range": "± 207116",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 476,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 6792,
            "range": "± 81",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 126863,
            "range": "± 8214",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 13142,
            "range": "± 354",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 85446,
            "range": "± 1829",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 816955,
            "range": "± 14831",
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
          "id": "f5e838a5f01cd0e43a1f959447cf25d4ffbfe64c",
          "message": "build(deps): bump log from 0.4.29 to 0.4.35 in /fuzz (#1217)\n\nBumps [log](https://github.com/rust-lang/log) from 0.4.29 to 0.4.35.\n- [Release notes](https://github.com/rust-lang/log/releases)\n- [Changelog](https://github.com/rust-lang/log/blob/main/CHANGELOG.md)\n- [Commits](https://github.com/rust-lang/log/compare/0.4.29...v0.4.35)\n\n---\nupdated-dependencies:\n- dependency-name: log\n  dependency-version: 0.4.35\n  dependency-type: direct:production\n  update-type: version-update:semver-patch\n...\n\nSigned-off-by: dependabot[bot] <support@github.com>\nCo-authored-by: dependabot[bot] <49699333+dependabot[bot]@users.noreply.github.com>",
          "timestamp": "2026-11-08T23:10:59Z",
          "tree_id": "3e745a0c2e672f05a937c607d6126f5d936b9368",
          "url": "https://github.com/pulseengine/rivet/commit/f5e838a5f01cd0e43a1f959447cf25d4ffbfe64c"
        },
        "date": 1794180732949,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 67026,
            "range": "± 6443",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 681295,
            "range": "± 17467",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 16384794,
            "range": "± 1643830",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1429,
            "range": "± 9",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 17983,
            "range": "± 70",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 279210,
            "range": "± 2936",
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
            "value": 1543372,
            "range": "± 11796",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 123639,
            "range": "± 5448",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1419269,
            "range": "± 15294",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 30423722,
            "range": "± 3077376",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 548005,
            "range": "± 3237",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 13436960,
            "range": "± 161676",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 887404122,
            "range": "± 17389150",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3512,
            "range": "± 18",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 39292,
            "range": "± 1955",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 640689,
            "range": "± 9799",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 43495,
            "range": "± 737",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 492822,
            "range": "± 3282",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7773534,
            "range": "± 1930282",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 788,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 11183,
            "range": "± 17",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 201813,
            "range": "± 8946",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 17433,
            "range": "± 290",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 111026,
            "range": "± 2835",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1028812,
            "range": "± 18760",
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
          "id": "296f6b6c91869074c11ba4cbacd39fc4f4824d0f",
          "message": "build(deps): bump softprops/action-gh-release (#1214)\n\nBumps the github-actions-all group with 1 update: [softprops/action-gh-release](https://github.com/softprops/action-gh-release).\n\n\nUpdates `softprops/action-gh-release` from 3.0.3 to 3.0.4\n- [Release notes](https://github.com/softprops/action-gh-release/releases)\n- [Changelog](https://github.com/softprops/action-gh-release/blob/master/CHANGELOG.md)\n- [Commits](https://github.com/softprops/action-gh-release/compare/efb35369e0ad2afab669f228072c1b0d510eae64...8a0cd651e5b2365bd640854a3fa5dfc70e4875f3)\n\n---\nupdated-dependencies:\n- dependency-name: softprops/action-gh-release\n  dependency-version: 3.0.4\n  dependency-type: direct:production\n  update-type: version-update:semver-patch\n  dependency-group: github-actions-all\n...\n\nSigned-off-by: dependabot[bot] <support@github.com>\nCo-authored-by: dependabot[bot] <49699333+dependabot[bot]@users.noreply.github.com>",
          "timestamp": "2026-11-09T04:48:14Z",
          "tree_id": "83376e88ac89b8bf238a3da56fcbd9d7a56d8f05",
          "url": "https://github.com/pulseengine/rivet/commit/296f6b6c91869074c11ba4cbacd39fc4f4824d0f"
        },
        "date": 1794201170586,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85195,
            "range": "± 276",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 854570,
            "range": "± 16734",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 15118761,
            "range": "± 802782",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2176,
            "range": "± 68",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25888,
            "range": "± 517",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 413528,
            "range": "± 2494",
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
            "value": 1954079,
            "range": "± 21556",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 159800,
            "range": "± 1966",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1812019,
            "range": "± 14955",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 32512296,
            "range": "± 1098505",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 759666,
            "range": "± 4306",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 18796805,
            "range": "± 330437",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1352409192,
            "range": "± 11218800",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4895,
            "range": "± 14",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 67452,
            "range": "± 550",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 885769,
            "range": "± 23744",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 56254,
            "range": "± 427",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 663292,
            "range": "± 4728",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 12247428,
            "range": "± 291269",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1167,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15602,
            "range": "± 155",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 380672,
            "range": "± 17174",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 24421,
            "range": "± 74",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 162859,
            "range": "± 835",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1517530,
            "range": "± 25038",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "b33c7b83c624fb68af5c3f55306df127d1e462ed",
          "message": "build(deps): openssl 0.10.80 for three RustSec advisories; rmcp advisory assessed not applicable (#1220)\n\nCargo Deny (a CI Gate need) has been red on main and on every PR since\nfour new advisories were published:\n\n- RUSTSEC-2026-0474, -0476, -0477 (openssl 0.10.78: non-UTF-8 &str from\n  X509Ref::ocsp_responders; AES key-wrap-with-padding buffer overflows in\n  cipher_update and cipher_update_inplace). Fixed in 0.10.80. openssl is\n  pinned to exactly 0.10.80 and openssl-sys to 0.9.116, the newest versions\n  Bytecode Alliance's imported cargo-vet audits cover (0.10.78 -> 0.10.80,\n  0.9.114 -> 0.9.116); `cargo vet` refreshed imports.lock with those four\n  audits and nothing else, so no unreviewed code enters. 0.10.82 would add\n  ~1400 unaudited lines for no further fix.\n\n- RUSTSEC-2026-0462 (rmcp 1.5.0: unbounded body buffering in the\n  Streamable HTTP clients). Fixed only in rmcp 3.9.0, two major versions\n  away. rivet enables neither affected feature\n  (transport-streamable-http-client-reqwest / -unix-socket); measured with\n  `cargo tree -e features -i rmcp`. Ignored in deny.toml with the\n  assessment, the reason not to upgrade now, a re-check trigger and a\n  2027-02-01 date, and in the audit step alongside it, as that step's\n  comment requires.\n\nConfirmed locally: cargo deny check advisories bans licenses sources (0.20.2,\nCI's version) all ok; cargo audit --ignore RUSTSEC-2026-0462 exits 0 (7\nallowed warnings, unchanged); cargo vet --locked succeeds; actionlint clean.\nOn macOS native-tls uses Security.framework, so the openssl build itself is\nexercised only by Linux CI.\n\n\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9\n\nCo-authored-by: Claude Opus 5.5 <noreply@anthropic.com>",
          "timestamp": "2026-11-10T21:43:24Z",
          "tree_id": "5cf2dd9ea89a594ce492d0ce8cc76f7a647a2b96",
          "url": "https://github.com/pulseengine/rivet/commit/b33c7b83c624fb68af5c3f55306df127d1e462ed"
        },
        "date": 1794355673509,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 68811,
            "range": "± 573",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 689806,
            "range": "± 21858",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 15814470,
            "range": "± 1473963",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1479,
            "range": "± 43",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 17865,
            "range": "± 265",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 275994,
            "range": "± 5608",
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
            "value": 1558258,
            "range": "± 20075",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 118340,
            "range": "± 561",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1371713,
            "range": "± 16416",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 24888725,
            "range": "± 1972344",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 545498,
            "range": "± 3418",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 12853084,
            "range": "± 431660",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 862238429,
            "range": "± 11264840",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3604,
            "range": "± 212",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 40021,
            "range": "± 662",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 615150,
            "range": "± 10028",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 43390,
            "range": "± 109",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 494501,
            "range": "± 11406",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 6729542,
            "range": "± 708577",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 800,
            "range": "± 23",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 11226,
            "range": "± 29",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 201379,
            "range": "± 8123",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 17466,
            "range": "± 63",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 113749,
            "range": "± 3266",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1031732,
            "range": "± 80074",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "3120a389a6e177145d6b166e199b3a46c14b113b",
          "message": "ci: run temper's gate probe on pull requests (report-only) (#1219)\n\n* ci: run temper's gate probe on pull requests (report-only)\n\nAdds .github/workflows/gate-probe.yml, which runs temper's gate-probe\naction pinned to a57e81353acfad05bf1e4cf635281a7562253d36 (the merge of\ntemper#87, main green). The action runs tools/ci/detect-changes.sh on the\ncontrol paths in .github/gate-probe.json plus temper's defaults and fails\nif a declared output (tests, wasm) fails open or a negative control comes\nback true.\n\nFollows temper's workflow rules: pull_request only (never\npull_request_target), no path filter, no `if:`, no continue-on-error,\ncontents: read, credential-less checkout. Report-only: it is not a\nrequired check; that is a later per-repo step after the owner approves.\n\nConfirmed by running temper's gate_probe.py at that SHA against current\nmain: exit 0, \"every detector fails closed\" (5 controls closed, 2 negative\ncontrols non-code). actionlint clean apart from custom runner labels.\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9\n\n* ci(gate-probe): route fork PRs to a hosted runner\n\nThe probe executes the pull request's own detector script, and the\nself-hosted runner group accepts public repositories, so a fork PR would\nrun untrusted code on the self-hosted hosts after a single mistaken fork\napproval. Fork PRs now run on ubuntu-latest; same-repo PRs stay on the\nlight self-hosted runner, the same routing spar, meld, gale, varve and\nrelay use. The job still runs on every PR, so it cannot be skipped.\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9\n\n* ci: pin temper gate-probe to 308848d1\n\ntemper 308848d1 is one commit after a57e8135 on main, with all 8 check\nruns green (run 42897869007). It removes tracked __pycache__ bytecode\nfrom the distributed action and adds a fork-routing rule for public\nrepos; gate_probe.py itself is unchanged. rivet's runs-on already routes\nfork PRs to ubuntu-latest, so the new rule accepts this workflow.\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9\n\n---------\n\nCo-authored-by: Claude Opus 5.5 <noreply@anthropic.com>",
          "timestamp": "2026-11-11T00:16:43Z",
          "tree_id": "c1b4216fc96902000deef012d0a255647286a7ec",
          "url": "https://github.com/pulseengine/rivet/commit/3120a389a6e177145d6b166e199b3a46c14b113b"
        },
        "date": 1794363660152,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 53487,
            "range": "± 1126",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 640097,
            "range": "± 11290",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12157794,
            "range": "± 1010129",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1142,
            "range": "± 19",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 13781,
            "range": "± 421",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 253953,
            "range": "± 10453",
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
            "value": 50,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 55,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1320739,
            "range": "± 49581",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 116841,
            "range": "± 1352",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1312358,
            "range": "± 31808",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 25034969,
            "range": "± 3374090",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 461260,
            "range": "± 11272",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 11464984,
            "range": "± 377322",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 664697363,
            "range": "± 20511247",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3146,
            "range": "± 175",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 33892,
            "range": "± 619",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 540200,
            "range": "± 12130",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 33744,
            "range": "± 545",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 369904,
            "range": "± 9946",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7248335,
            "range": "± 1229132",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 544,
            "range": "± 19",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7639,
            "range": "± 91",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 133643,
            "range": "± 3949",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 14111,
            "range": "± 1227",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 93737,
            "range": "± 3023",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 857253,
            "range": "± 28905",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "08db01fd43956d53edc45817a7fc8c2a4cbe3884",
          "message": "ci: ledger of proof trust escapes, and a coqchk axiom check in Rocq Proofs (#1222)\n\n* ci: ledger of proof trust escapes, and a coqchk axiom check in Rocq Proofs\n\nproofs/trust-ledger.tsv lists every statement rivet's provers accept\nwithout checking: today one Rocq Admitted (Schema.v\nvmodel_chain_two_steps) and one Verus assume (verus_specs.rs\nlemma_build_yields_symmetric). tools/ci/trust-ledger.py scans Rocq\nAdmitted, Admit Obligations, Axiom, Parameter and Conjecture (comments\nstripped, nested) and Verus external_body, assume_specification,\nassume and admit in files containing verus!. kani::assume is a harness\nprecondition and is not counted. A new escape fails; a vanished one is\nreported and passes. The new \"Proof trust ledger\" job runs it plus a\n6-case self-test on the light pool. It is not a CI Gate need.\n\nThe Rocq Proofs job gains a kernel step. tools/ci/rocq-coqchk.py reads\nthe coqc actions from bazel aquery, runs coqchk -o over every .vo under\nthe project load paths with the same -Q pairs, and trust-ledger.py\nkernel fails on an axiom without a kernel row or on any \"relying on\"\nflag. The job stays continue-on-error.\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9\n\n* ci: coqchk summary check fails on any block other than Axioms that is not <none>\n\nThe first CI run showed coqchk 9.0 prints \"Inductives whose positivity is\nassumed\" and two Theory lines; the parser only checked \"relying on\"\nblocks, so an assumed-positive inductive or an impredicative Set would\nhave passed. Every non-axiom block must now read <none>, and Theory lines\nmust be \"Set is predicative\" or \"Rewrite rules are not allowed\". Two\nself-test cases cover it.\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9\n\n* ci: NEGATIVE CONTROL, revert before merge: one Verus external_body and one Rocq Axiom\n\nTrace: skip\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9\n\n* ci: revert the negative control commit 03a65abc\n\nTrace: skip\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9\n\n* ci: keep the ledger self-test's expected ::error:: lines out of the job log\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9\n\n---------\n\nCo-authored-by: Claude Opus 5.5 <noreply@anthropic.com>",
          "timestamp": "2026-11-11T17:14:15Z",
          "tree_id": "41e92baf66a84da8554ef9392423d5138b36c74a",
          "url": "https://github.com/pulseengine/rivet/commit/08db01fd43956d53edc45817a7fc8c2a4cbe3884"
        },
        "date": 1794419899977,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84499,
            "range": "± 2505",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 865694,
            "range": "± 25936",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 17949496,
            "range": "± 1111173",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1915,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24183,
            "range": "± 383",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 394415,
            "range": "± 2618",
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
            "value": 1998776,
            "range": "± 11445",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 157921,
            "range": "± 8262",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1817736,
            "range": "± 18165",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 28958889,
            "range": "± 1778459",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 724854,
            "range": "± 3882",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 17362847,
            "range": "± 195882",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1217284360,
            "range": "± 22107709",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4717,
            "range": "± 104",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 52459,
            "range": "± 238",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 793407,
            "range": "± 6704",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 59640,
            "range": "± 438",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 698575,
            "range": "± 7693",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 9305866,
            "range": "± 1013303",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1195,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14962,
            "range": "± 162",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 270315,
            "range": "± 2393",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22205,
            "range": "± 498",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 145357,
            "range": "± 1820",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1323977,
            "range": "± 32729",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "da0c965f8d5ce4b604779ba723c24c92e4181395",
          "message": "ci: cargo audit clones a fresh advisory-db per job (#1223)\n\nMain's Security Audit failed twice on 08db01fd (jobs 130686136577 and\n130718368633), both on runner pulseengine-ci-01-5, before reading the\nlockfile:\n\n  couldn't fetch advisory database: git operation failed: failed to\n  prepare clone -> Refusing to initialize the non-empty directory as\n  '/var/lib/runners/runner5/.cargo/advisory-db'\n\n~/.cargo/advisory-db is shared by every job on a self-hosted runner, so\none damaged copy fails every audit routed to that runner. The step now\npasses --db \"$RUNNER_TEMP/advisory-db\", which the runner empties per\njob. Reproduced locally with cargo-audit 0.22.1: a non-empty non-git\n--db directory exits 1, a fresh path exits 0. The advisory set is\nunchanged (today's new advisories are hickory-proto, not in Cargo.lock).\n\n\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9\n\nCo-authored-by: Claude Opus 5.5 <noreply@anthropic.com>",
          "timestamp": "2026-11-11T21:11:21Z",
          "tree_id": "765f9828a11dca59165e52cf7d51531de3dbb5c7",
          "url": "https://github.com/pulseengine/rivet/commit/da0c965f8d5ce4b604779ba723c24c92e4181395"
        },
        "date": 1794438938582,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85135,
            "range": "± 562",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 854558,
            "range": "± 7994",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 15888807,
            "range": "± 716129",
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
            "value": 25359,
            "range": "± 189",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 414242,
            "range": "± 3992",
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
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1941155,
            "range": "± 17231",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 163108,
            "range": "± 1382",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1821410,
            "range": "± 19146",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 32316351,
            "range": "± 1357044",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 751698,
            "range": "± 7902",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 18134960,
            "range": "± 250564",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1359194621,
            "range": "± 13702094",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4850,
            "range": "± 45",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 68283,
            "range": "± 691",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 891381,
            "range": "± 23274",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 57197,
            "range": "± 1208",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 674713,
            "range": "± 7886",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8431869,
            "range": "± 576402",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1189,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15856,
            "range": "± 378",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 364587,
            "range": "± 4251",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 24281,
            "range": "± 891",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 161453,
            "range": "± 1385",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1524067,
            "range": "± 19250",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "8ca4ecaf15f7ab4b16d8ba0808e8a78b84976501",
          "message": "build(deps): spar 0.48.1 and salsa 0.28.5 together; RUSTSEC-2026-0308 fixed (#1226)\n\nrivet-core shares salsa types with spar-hir and spar-analysis, so salsa\ncould only move when spar did (REQ-376). spar 0.48.1 uses salsa 0.28.5;\nrivet moves both pins together and the tree keeps one salsa.\n\nsalsa 0.28.0 made tracked functions and input getters return references\nby default (salsa#1216). The 17 tracked functions in db.rs take\nreturns(clone), which keeps their owned results and behaviour. Four\ncall sites adapt to by-reference input getters (copy the SourceFile id,\nclone an Artifact, clone the file Vec, compare a path by reference), and\nseven needless borrows go.\n\nRUSTSEC-2026-0308 is fixed in 0.28.5, so its deny.toml ignore and\nassessment are removed. dependency_floors.rs gains a test that fails if\nCargo.lock resolves salsa below 0.28.5 or two salsas, plus a test of\nthat check against old, split and missing salsa. REQ-376 moves from\nproposed to implemented.\n\ncargo-vet: the salsa, salsa-macros, salsa-macro-rules, hashlink and\nintrusive-collections exemptions move to the new versions and typeid\nis added, all marked NOT REVIEWED with the delta size, as their\npredecessors were exemptions too; memoffset left the tree. fuzz's lock\nmoves salsa likewise and keeps syn 3.0.9 as in the workspace lock.\n\nConfirmed with: cargo nextest --all --profile ci 2741 passed;\nrivet-core lib 1416 passed; clippy --all-targets -D warnings clean with\ndefault and all features; cargo deny check and cargo vet --locked pass;\nthe traceability ratchet adds 0 findings; spar-wasm at 0.48.1 pulls no\nhighs or good_lp for wasm32-wasip2.\n\nImplements: REQ-029\nFixes: REQ-376\nVerifies: REQ-376\n\n\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9\n\nCo-authored-by: Claude Opus 5.5 <noreply@anthropic.com>",
          "timestamp": "2026-11-12T06:18:44Z",
          "tree_id": "b30c7e57883d99aeb270b9a6093bc0ae65e7c885",
          "url": "https://github.com/pulseengine/rivet/commit/8ca4ecaf15f7ab4b16d8ba0808e8a78b84976501"
        },
        "date": 1794468258534,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 67423,
            "range": "± 5488",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 692673,
            "range": "± 16572",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 15327309,
            "range": "± 545922",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1451,
            "range": "± 23",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 17918,
            "range": "± 39",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 276586,
            "range": "± 2726",
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
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 76,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1558116,
            "range": "± 34175",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 120162,
            "range": "± 794",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1368233,
            "range": "± 15146",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 27810826,
            "range": "± 1840833",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 549937,
            "range": "± 5576",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 14937653,
            "range": "± 1351923",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 998431263,
            "range": "± 15094505",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3599,
            "range": "± 16",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 39647,
            "range": "± 529",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 606200,
            "range": "± 1879",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 45455,
            "range": "± 545",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 523692,
            "range": "± 8930",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 6430821,
            "range": "± 189825",
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
            "value": 11558,
            "range": "± 282",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 200051,
            "range": "± 2832",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 17330,
            "range": "± 364",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 111884,
            "range": "± 1515",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1029298,
            "range": "± 64963",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "b3ea35d9473d523f5cca529670c7efaaf66b602c",
          "message": "build: record RUSTSEC-2026-0486 (rustix, unsound) in deny.toml (#1225)\n\nrustix 1.1.4 arrives transitively through wasmtime and wasmtime-wasi.\nThe advisory's xattr functions are referenced by none of rustix's nine\ndependents in this tree, and rivet's crates do not depend on rustix.\nThe entry is a comment, not an ignore: cargo-deny reports unsound\nadvisories only for direct dependencies, so an ignore would match\nnothing, and cargo audit already prints it as a warning.\n\nIt follows the owner's rule for unsound-only advisories: warn, record\nwith a reason and re-check date, and bump only to a fixed version that\ncargo-vet already covers. 1.1.4 is a vet exemption and no imported audit\ncovers 1.1.6. Re-check on the next wasmtime bump or by 2027-02-01.\n\n\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9\n\nCo-authored-by: Claude Opus 5.5 <noreply@anthropic.com>",
          "timestamp": "2026-11-12T07:50:17Z",
          "tree_id": "6e70022b0418aca113229b27b925ba59ea9c34a8",
          "url": "https://github.com/pulseengine/rivet/commit/b3ea35d9473d523f5cca529670c7efaaf66b602c"
        },
        "date": 1794474279853,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 83787,
            "range": "± 948",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 829972,
            "range": "± 9351",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14035329,
            "range": "± 1324498",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2149,
            "range": "± 20",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25747,
            "range": "± 240",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 406336,
            "range": "± 1852",
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
            "value": 1951084,
            "range": "± 56481",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 159965,
            "range": "± 1431",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1750105,
            "range": "± 89852",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 28798812,
            "range": "± 1392467",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 747396,
            "range": "± 7216",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 19192273,
            "range": "± 485527",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1441358011,
            "range": "± 14964027",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4805,
            "range": "± 35",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 68993,
            "range": "± 670",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 887963,
            "range": "± 10561",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 57081,
            "range": "± 1103",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 686973,
            "range": "± 21148",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 9727201,
            "range": "± 606457",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1096,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15815,
            "range": "± 108",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 371565,
            "range": "± 2470",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23904,
            "range": "± 333",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 153335,
            "range": "± 617",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1432683,
            "range": "± 32518",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "470298417252b397738ad093c413e45ab76eed78",
          "message": "chore(release): scope v0.42.0 to what shipped — verify 9, defer 21 to v0.43.0 (#1228)\n\nrivet release status v0.42.0 on b3ea35d9 reported 29 of 31 artifacts not\nrelease-ready. The maintainer chose to verify the implemented items whose\nacceptance holds and defer the rest.\n\nVerified (rivet verify, each with source verifies markers; acceptance text\nread against what merged): REQ-308, REQ-408, REQ-409, REQ-410, REQ-411,\nREQ-412, REQ-413, REQ-414, and REQ-376, moved from backlog to v0.42.0\nbecause the salsa 0.28.5 bump (#1226) ships in this tag. REQ-376 gains a\nRESOLVED note; its text still described the upgrade as blocked.\n\nMoved to v0.43.0 with rivet release move: the 20 draft/proposed items and\nREQ-397. REQ-397's own acceptance holds it at implemented until the Open\nVSX listing check passes on a real release, and\nopen-vsx.org/api/pulseengine/rivet-sdlc/0.41.1 answers 404.\n\nConfirmed with rivet release status v0.42.0 (Cuttable), rivet validate\n(PASS) and tools/ci/traceability-ratchet.py against origin/main (0 new).\n\nRefs: REQ-308, REQ-376, REQ-397\n\n\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9\n\nCo-authored-by: Claude Opus 5.5 <noreply@anthropic.com>",
          "timestamp": "2026-11-12T08:26:00Z",
          "tree_id": "04e79291dbedc046931086b5f342e59e76f3bcf0",
          "url": "https://github.com/pulseengine/rivet/commit/470298417252b397738ad093c413e45ab76eed78"
        },
        "date": 1794474688524,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84879,
            "range": "± 1091",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 836911,
            "range": "± 20360",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13173227,
            "range": "± 864896",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2148,
            "range": "± 44",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25512,
            "range": "± 238",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 412117,
            "range": "± 10504",
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
            "value": 1962740,
            "range": "± 12119",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 162059,
            "range": "± 632",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1787314,
            "range": "± 21980",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 25795034,
            "range": "± 1642789",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 755602,
            "range": "± 6799",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 18908088,
            "range": "± 246667",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1450560166,
            "range": "± 15593793",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4747,
            "range": "± 56",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 69194,
            "range": "± 1016",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 885284,
            "range": "± 6977",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 57411,
            "range": "± 272",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 688968,
            "range": "± 20464",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 9399537,
            "range": "± 835693",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1138,
            "range": "± 12",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15420,
            "range": "± 208",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 372465,
            "range": "± 2295",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23985,
            "range": "± 194",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 150108,
            "range": "± 2020",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1432392,
            "range": "± 29172",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "0a81941da5823637f22dd15c2c5319dcd0c56020",
          "message": "chore(release): v0.42.0 — clause discharge, recorded results, yaml to-json (#1229)\n\nVersion 0.41.1 -> 0.42.0 in Cargo.toml, both lockfiles and the VS Code\nextension manifest. CHANGELOG [Unreleased] becomes [0.42.0] - 2026-11-12,\nwith a summary and a falsification statement.\n\ntools/release/changelog-drift.py v0.42.0 first reported four mismatches:\n- DD-083 and DD-084 were delivered but not named; they are now cited on\n  the entries they decide.\n- REQ-294 sat in claim position although it shipped in v0.34.0; the\n  #1224 entry now says it extends REQ-294.\n- REQ-415 (repository boundary manifest, #1160) shipped on main with no\n  release. It moves to v0.42.0 and is verified: 14 source markers,\n  `rivet manifest export` and `rivet docs manifest` present.\n\nConfirmed with changelog-drift.py (exit 0, delivered 12, undocumented\nnone, unclaimed none), rivet release status v0.42.0 (Cuttable), rivet\nvalidate (PASS), rivet docs check (0 violations) and\ntraceability-ratchet.py against origin/main (0 new).\n\nRefs: REQ-415\n\n\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9\n\nCo-authored-by: Claude Opus 5.5 <noreply@anthropic.com>",
          "timestamp": "2026-11-12T10:28:29Z",
          "tree_id": "dc2de8e89fc10dada4b9679ece93fc71ca0f95ae",
          "url": "https://github.com/pulseengine/rivet/commit/0a81941da5823637f22dd15c2c5319dcd0c56020"
        },
        "date": 1794488851243,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 67065,
            "range": "± 319",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 682979,
            "range": "± 4238",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13360629,
            "range": "± 794223",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1458,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 18055,
            "range": "± 170",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 276017,
            "range": "± 2470",
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
            "value": 1553165,
            "range": "± 9927",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 119393,
            "range": "± 534",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1369831,
            "range": "± 32801",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 21854318,
            "range": "± 1221699",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 548805,
            "range": "± 4320",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 13741683,
            "range": "± 162457",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 979994736,
            "range": "± 10965373",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3576,
            "range": "± 12",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 39882,
            "range": "± 571",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 614418,
            "range": "± 12095",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 43869,
            "range": "± 350",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 510099,
            "range": "± 2395",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 6431451,
            "range": "± 281069",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 823,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 11306,
            "range": "± 56",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 198578,
            "range": "± 4837",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 17327,
            "range": "± 217",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 112064,
            "range": "± 1096",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1028987,
            "range": "± 22266",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "f7d3e2bf9beac546eb4246dfdca6ec604c2b1c29",
          "message": "ci: build the Rocq libraries with outputs downloaded before coqchk (#1230)\n\nThe kernel-axioms step from #1222 has failed on main since 47029841 with\n\"no compiled .vo found under the project load paths\". It passed on every\nrun through b3ea35d9. The passing runs restored no Bazel disk cache and\nbuilt from scratch; the failing ones hit the disk cache. With a cache\nhit, Bazel 7+ does not download intermediate outputs, and `bazel test\n//proofs/rocq:rivet_metamodel_test` leaves no .vo on disk, so the\nstep's fail-closed check on an empty set fired.\n\nThe step now queries the rocq_library targets and builds them with\n--remote_download_outputs=all before the aquery and the coqchk run. The\nproofs themselves were green throughout (\"Verify Rocq proofs\" passed).\n\n\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9\n\nCo-authored-by: Claude Opus 5.5 <noreply@anthropic.com>",
          "timestamp": "2026-11-12T14:52:43Z",
          "tree_id": "fe9faef6a69a1ae248dbd0bf5042a2fd82bf219e",
          "url": "https://github.com/pulseengine/rivet/commit/f7d3e2bf9beac546eb4246dfdca6ec604c2b1c29"
        },
        "date": 1794504092143,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84737,
            "range": "± 825",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 859633,
            "range": "± 29203",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14176542,
            "range": "± 571274",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1925,
            "range": "± 9",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24077,
            "range": "± 54",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 377478,
            "range": "± 2847",
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
            "value": 2019817,
            "range": "± 18579",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 162615,
            "range": "± 729",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1830430,
            "range": "± 22271",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 27909724,
            "range": "± 1061609",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 725394,
            "range": "± 11056",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 19082465,
            "range": "± 381630",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1408618701,
            "range": "± 22762645",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4689,
            "range": "± 23",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 51524,
            "range": "± 272",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 798762,
            "range": "± 6792",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 60224,
            "range": "± 759",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 724261,
            "range": "± 10865",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8588630,
            "range": "± 259728",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1186,
            "range": "± 19",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14234,
            "range": "± 276",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 262692,
            "range": "± 3429",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21976,
            "range": "± 181",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 142889,
            "range": "± 3696",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1333508,
            "range": "± 15945",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "81262936ba82bdd4f6de035259beb7e7f6b78792",
          "message": "fix(vscode): package the VSIX again; release v0.42.1 in place of v0.42.0 (#1233)\n\n* fix(vscode): package the VSIX again; release v0.42.1 in place of v0.42.0\n\nThe v0.42.0 release run (43263376215) failed at \"Package VSIX\": vsce\nrefuses @types/vscode ~1.145.0 against engines.vscode ^1.91.0, a pair\nDependabot's #1213 created. Create GitHub Release never ran, so nothing\nwas published under v0.42.0. The macOS builds in that run got no hosted\nrunner and were cancelled; that is runner supply, not this change.\n\n- @types/vscode back to ~1.91.0, matching engines.vscode.\n- Dependabot ignores minor and major @types/vscode updates for\n  /vscode-rivet; raising it needs engines.vscode raised with it.\n- CI's VS Code Extension job runs the release's `vsce package`, so the\n  pair fails a pull request instead of a release.\n- Version 0.42.1. The 12 artifacts scoped to v0.42.0 move to v0.42.1\n  (rivet release move), because the release note is generated from the\n  tagged version's scope and they first ship here. The CHANGELOG\n  section becomes [0.42.1] and says v0.42.0 published nothing.\n\nConfirmed with: vsce package on the unfixed tree fails with the release's\nerror and on this tree packages (14 files); npm run compile passes;\nchangelog-drift.py v0.42.1 exit 0 (12 delivered); rivet release status\nv0.42.1 Cuttable; rivet validate PASS; rivet docs check 0 violations;\ntraceability-ratchet.py against origin/main 0 new.\n\nTrace: skip\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9\n\n* fix(clippy): satisfy rust 1.100 needless_bool and needless_range_loop\n\nCI stable moved to rustc 1.100.0 (2026-11-09), and Clippy with\n-D warnings now fails on four existing sites, on any branch:\n- doc_check.rs: an `if` returning `true` before a final `false`\n  becomes the comparison itself.\n- yaml_edit.rs field_indent and find_field_in_block, and the\n  test_find_artifact_block_middle test: index loops become iterators.\n\nBehaviour is unchanged. Confirmed with cargo +1.100.0 clippy\n--all-targets -D warnings (exit 0), cargo fmt --check, and the\nrivet-core lib tests for yaml_edit and doc_check (96 passed).\n\nRefs: REQ-034\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9\n\n---------\n\nCo-authored-by: Claude Opus 5.5 <noreply@anthropic.com>",
          "timestamp": "2026-11-12T20:13:43Z",
          "tree_id": "1b7c5f487b5a59302a102a83c2865b35f63be94c",
          "url": "https://github.com/pulseengine/rivet/commit/81262936ba82bdd4f6de035259beb7e7f6b78792"
        },
        "date": 1794519115336,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 86291,
            "range": "± 527",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 866549,
            "range": "± 6388",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 16313247,
            "range": "± 1068934",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1918,
            "range": "± 84",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24407,
            "range": "± 544",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 396355,
            "range": "± 28522",
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
            "value": 96,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1998284,
            "range": "± 6578",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 161043,
            "range": "± 978",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1820684,
            "range": "± 27997",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 31587240,
            "range": "± 2984839",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 730520,
            "range": "± 42864",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 18865766,
            "range": "± 343217",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1274919687,
            "range": "± 19552812",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4600,
            "range": "± 181",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 50744,
            "range": "± 2601",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 854284,
            "range": "± 64050",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 60723,
            "range": "± 539",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 739602,
            "range": "± 42556",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8706027,
            "range": "± 438243",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1156,
            "range": "± 23",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15025,
            "range": "± 420",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 265474,
            "range": "± 14318",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22981,
            "range": "± 235",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 149897,
            "range": "± 513",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1405193,
            "range": "± 22533",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "a712e840b213825922066021e526968bec9a3e72",
          "message": "ci(release): macos-15-intel for x86_64-apple-darwin; release v0.42.2 (#1240)\n\n* ci(release): build x86_64-apple-darwin on macos-15-intel\n\nThe v0.42.1 release run (43332306438) was cancelled because GitHub no\nlonger accepts the macos-14 label: the job was refused 2 s after creation\nwith \"The configuration 'macos-14-arm64-us-default' is not supported\".\nCreate GitHub Release needs every build, so it was skipped and v0.42.1\npublished nothing. The other 8 builds, the VSIX, the release note and the\ncompliance report all succeeded in that run.\n\nmacos-15-intel is GitHub's x86_64 macOS image, so the build stays native\nand no step changes. release.yml runs only on a tag, so this label is\nfirst exercised by the next tag push.\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9\n\n* chore(release): v0.42.2 in place of the unpublished v0.42.1\n\nThe v0.42.1 tag runs the release.yml stored in that tag, which still\nnames macos-14, so the runner fix only takes effect on a new tag.\n\n- Version 0.42.2 in Cargo.toml, both lockfiles and the vscode package.\n- The 12 artifacts scoped to v0.42.1 move to v0.42.2 (rivet release\n  move), since the release note is generated from the tagged scope.\n- CHANGELOG [0.42.2]: says v0.42.0 and v0.42.1 published nothing, adds\n  \"Fixed in 0.42.2\", and keeps the 0.42.1 fix marked not published.\n\nConfirmed with changelog-drift.py v0.42.2 exit 0 (12 delivered, none\nundocumented or unclaimed); rivet release status v0.42.2 Cuttable; rivet\nvalidate PASS; rivet docs check 0 violations (binary rebuilt at 0.42.2);\ntraceability-ratchet.py against origin/main 0 new.\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9\n\n---------\n\nCo-authored-by: Claude Opus 5.5 <noreply@anthropic.com>",
          "timestamp": "2026-11-13T05:50:24Z",
          "tree_id": "6c9d238a16e7d75f79a7af148abbd3cdf8fb1b08",
          "url": "https://github.com/pulseengine/rivet/commit/a712e840b213825922066021e526968bec9a3e72"
        },
        "date": 1794554780645,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85411,
            "range": "± 2281",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 848583,
            "range": "± 8781",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12906355,
            "range": "± 873773",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2216,
            "range": "± 47",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26979,
            "range": "± 496",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 426275,
            "range": "± 1716",
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
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1922471,
            "range": "± 106780",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 160222,
            "range": "± 3833",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1814630,
            "range": "± 44190",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 25733610,
            "range": "± 1177810",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 733287,
            "range": "± 4628",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 18071405,
            "range": "± 281120",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1417524135,
            "range": "± 13061905",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4859,
            "range": "± 282",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 68108,
            "range": "± 719",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 895551,
            "range": "± 8895",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 60190,
            "range": "± 675",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 691853,
            "range": "± 3144",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8310201,
            "range": "± 439107",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1205,
            "range": "± 16",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15208,
            "range": "± 110",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 376048,
            "range": "± 4953",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 25309,
            "range": "± 991",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 172709,
            "range": "± 2433",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1616184,
            "range": "± 26938",
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
          "id": "a175c3ceb60dfbd581a817c399437f4d4822851c",
          "message": "build(deps): bump the github-actions-all group with 3 updates (#1238)\n\nBumps the github-actions-all group with 3 updates: [taiki-e/install-action](https://github.com/taiki-e/install-action), [bazel-contrib/setup-bazel](https://github.com/bazel-contrib/setup-bazel) and [pulseengine/temper/.github/actions/gate-probe](https://github.com/pulseengine/temper).\n\n\nUpdates `taiki-e/install-action` from 2.90.1 to 2.90.3\n- [Release notes](https://github.com/taiki-e/install-action/releases)\n- [Changelog](https://github.com/taiki-e/install-action/blob/main/CHANGELOG.md)\n- [Commits](https://github.com/taiki-e/install-action/compare/c509219cf42fba86913069efd0ade2458c59337b...cfdb7ed4ccc7c7dce37759eae89dc5674b469b39)\n\nUpdates `bazel-contrib/setup-bazel` from 0.19.1 to 0.19.2\n- [Release notes](https://github.com/bazel-contrib/setup-bazel/releases)\n- [Commits](https://github.com/bazel-contrib/setup-bazel/compare/0.19.1...0.19.2)\n\nUpdates `pulseengine/temper/.github/actions/gate-probe` from 308848d151a0fdd0fc5eb8af0531addbf6f36ef4 to 03a53ca7dc3ac604252abcb70b267cd9f8ef623e\n- [Changelog](https://github.com/pulseengine/temper/blob/main/CHANGELOG.md)\n- [Commits](https://github.com/pulseengine/temper/compare/308848d151a0fdd0fc5eb8af0531addbf6f36ef4...03a53ca7dc3ac604252abcb70b267cd9f8ef623e)\n\n---\nupdated-dependencies:\n- dependency-name: taiki-e/install-action\n  dependency-version: 2.90.3\n  dependency-type: direct:production\n  update-type: version-update:semver-patch\n  dependency-group: github-actions-all\n- dependency-name: bazel-contrib/setup-bazel\n  dependency-version: 0.19.2\n  dependency-type: direct:production\n  update-type: version-update:semver-patch\n  dependency-group: github-actions-all\n- dependency-name: pulseengine/temper/.github/actions/gate-probe\n  dependency-version: 03a53ca7dc3ac604252abcb70b267cd9f8ef623e\n  dependency-type: direct:production\n  dependency-group: github-actions-all\n...\n\nSigned-off-by: dependabot[bot] <support@github.com>\nCo-authored-by: dependabot[bot] <49699333+dependabot[bot]@users.noreply.github.com>",
          "timestamp": "2026-11-13T18:36:20Z",
          "tree_id": "ebcb2b47a9342ad240415134837e0a2d3a163343",
          "url": "https://github.com/pulseengine/rivet/commit/a175c3ceb60dfbd581a817c399437f4d4822851c"
        },
        "date": 1794612118745,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 49277,
            "range": "± 444",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 609764,
            "range": "± 5609",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 10487082,
            "range": "± 309458",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1072,
            "range": "± 31",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 12915,
            "range": "± 112",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 246492,
            "range": "± 3758",
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
            "value": 1281652,
            "range": "± 15381",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 115516,
            "range": "± 2314",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1294807,
            "range": "± 12684",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 18146876,
            "range": "± 1981476",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 445385,
            "range": "± 16552",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 10379764,
            "range": "± 730268",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 633207320,
            "range": "± 26031372",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3199,
            "range": "± 17",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 33564,
            "range": "± 397",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 524093,
            "range": "± 5355",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 34957,
            "range": "± 3459",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 376712,
            "range": "± 1618",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 5407304,
            "range": "± 595941",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 542,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7354,
            "range": "± 62",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 139474,
            "range": "± 1879",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 14170,
            "range": "± 1284",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 89901,
            "range": "± 1814",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 861289,
            "range": "± 60937",
            "unit": "ns/iter"
          }
        ]
      }
    ]
  }
}