window.BENCHMARK_DATA = {
  "lastUpdate": 1795620533696,
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
      },
      {
        "commit": {
          "author": {
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
          "id": "ff7efd4ec5a6fd3874263589b2e7aeae36d81f39",
          "message": "fix(yaml): report text after a closing quote and keys at an unused column (#1261)\n\n* fix(yaml): report text after a closing quote and keys at an unused column\n\nTwo silent mis-parses in rivet-yaml's block parser (cst.rs):\n\n- #1246: after a quoted value, the rest of the line went into the value\n  node and only the quoted part was read, so `k: 'abc' def` gave \"abc\"\n  and `k: 'it's'` gave \"it\". check_after_quoted now reports any text\n  after the closing quote at the start of a mapping value, a sequence\n  item, or a next-line/root scalar; spaces and a comment are still fine.\n- #1247: a block mapping took any key at or past its minimum column, so\n  a line dedented between two levels ended the inner mapping and joined\n  the outer one. A key must now sit at its mapping's own column (every\n  caller already passes the first key's column). Recovery skips the\n  rest of the misplaced block, so it is one error per block, and records\n  the skipped range so the #1209 under-indented-quote hint stays first\n  and is kept for each quote. The first case of #1249 (a more-indented\n  `key: value` after a scalar line) now reports the same error.\n\nConfirmed with: new cst tests (text_after_a_closing_quote_is_an_error,\na_key_at_a_column_no_mapping_uses_is_an_error, and two positive-control\ntests) fail with the fix disabled and pass with it; rivet-yaml tests\nincl. the pinned yaml-test-suite (178) and rivet-core tests (1418 lib +\nintegration) pass; cargo fmt --check; cargo +1.100.0 clippy --all-targets\n-D warnings. The 64 differential reproducers change only for the\ntargeted cases (I5a-c, I7a-c, I8). rivet validate over 31 local\npulseengine checkouts: identical set of files that fail to load in\nevery repo; synth's already-broken files drop from 41 to 24 errors.\n\nFixes: REQ-346\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9\n\n* fix(yaml): let a mapping's first key follow an anchor; raise suite ratchets\n\nCI's yaml-test-suite run (skipped locally without YAML_TEST_SUITE) caught\na regression in the previous commit: ZH7C, `&a a: b` / `c: &d d`, was\nrefused. The root records its column before the anchor, so the first\nkey's token column (3) exceeded the mapping's (0). Only a first key can\nshare its line with an anchor or a `- `, and the caller sets the column\nfrom it, so the column check now applies from the second key on.\n\nThe change rejects 10 more invalid suite cases than recorded, so the\nratchets move with it: INVALID_REJECTED 53 -> 63, INVALID_ACCEPTED\n41 -> 31. MATCHED stays 134, wrong 0.\n\nConfirmed with: YAML_TEST_SUITE at 6e6c296a, cargo nextest run --all\n--profile ci: 2750 passed, 3 skipped, exit 0. ZH7C added to the\npositive-control test. rivet validate over 30 local pulseengine\ncheckouts: the set of files that fail to load is identical to v0.42.2\nin every repo.\n\nFixes: REQ-346\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9\n\n---------\n\nCo-authored-by: Claude Opus 5.5 <noreply@anthropic.com>",
          "timestamp": "2026-11-14T05:19:12Z",
          "tree_id": "eff962abff239d610c6d144794166541879b6fac",
          "url": "https://github.com/pulseengine/rivet/commit/ff7efd4ec5a6fd3874263589b2e7aeae36d81f39"
        },
        "date": 1794651854437,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 68104,
            "range": "± 435",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 671001,
            "range": "± 10381",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13394522,
            "range": "± 847829",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1450,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 18018,
            "range": "± 456",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 274986,
            "range": "± 778",
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
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1579091,
            "range": "± 28843",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 121590,
            "range": "± 1758",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1388736,
            "range": "± 20771",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 25719371,
            "range": "± 2160145",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 546743,
            "range": "± 4287",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 12500778,
            "range": "± 141812",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 842157848,
            "range": "± 5866659",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3635,
            "range": "± 11",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 40789,
            "range": "± 89",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 618146,
            "range": "± 10766",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 44160,
            "range": "± 603",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 521457,
            "range": "± 2365",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 6784459,
            "range": "± 453680",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 810,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 11014,
            "range": "± 43",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 200459,
            "range": "± 1020",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 18837,
            "range": "± 75",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 125700,
            "range": "± 3405",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1159725,
            "range": "± 29249",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "5d4ad9ec4fd9e85e27cf477e29925f43d55fb03c",
          "message": "varve.toml: covalent layer 2026.11.1 -> 2026.11.10 (#1244)\n\n2026.11.10 composes pulseengine 2026.11.18, which carries loom 1.5.2 (the\nfixes for loom #492, #494 and #496) and meld 0.68.0.\n\n\nClaude-Session: https://claude.ai/code/session_01KEjmjczUmt6Rdd9DRKe75Z\n\nCo-authored-by: Claude Opus 5.5 <noreply@anthropic.com>",
          "timestamp": "2026-11-15T07:16:12Z",
          "tree_id": "b2f8b455ab941000d047aeb7ed98f08be2c5c716",
          "url": "https://github.com/pulseengine/rivet/commit/5d4ad9ec4fd9e85e27cf477e29925f43d55fb03c"
        },
        "date": 1794730661509,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 66747,
            "range": "± 547",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 679680,
            "range": "± 5347",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13525427,
            "range": "± 819408",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1486,
            "range": "± 13",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 17887,
            "range": "± 373",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 274346,
            "range": "± 4320",
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
            "value": 1547614,
            "range": "± 21903",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 120483,
            "range": "± 2079",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1380374,
            "range": "± 17488",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 24084167,
            "range": "± 1875785",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 548891,
            "range": "± 4881",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 13132631,
            "range": "± 234589",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 914874095,
            "range": "± 6025808",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3618,
            "range": "± 23",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 40778,
            "range": "± 224",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 609593,
            "range": "± 6649",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 45865,
            "range": "± 79",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 520454,
            "range": "± 19314",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7007835,
            "range": "± 390372",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 862,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 11062,
            "range": "± 100",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 201686,
            "range": "± 4134",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 17867,
            "range": "± 214",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 115854,
            "range": "± 4205",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1080573,
            "range": "± 18436",
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
          "id": "555d12f00bde6bed62a4dbf27ad173eee93e121b",
          "message": "build(deps): bump thiserror from 2.0.18 to 2.0.21 in /fuzz (#1273)\n\nBumps [thiserror](https://github.com/dtolnay/thiserror) from 2.0.18 to 2.0.21.\n- [Release notes](https://github.com/dtolnay/thiserror/releases)\n- [Commits](https://github.com/dtolnay/thiserror/compare/2.0.18...2.0.21)\n\n---\nupdated-dependencies:\n- dependency-name: thiserror\n  dependency-version: 2.0.21\n  dependency-type: direct:production\n  update-type: version-update:semver-patch\n...\n\nSigned-off-by: dependabot[bot] <support@github.com>\nCo-authored-by: dependabot[bot] <49699333+dependabot[bot]@users.noreply.github.com>",
          "timestamp": "2026-11-16T05:22:07Z",
          "tree_id": "6b9988c70de451232189980ffbde6875b2fe4850",
          "url": "https://github.com/pulseengine/rivet/commit/555d12f00bde6bed62a4dbf27ad173eee93e121b"
        },
        "date": 1794809488364,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 67403,
            "range": "± 383",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 677270,
            "range": "± 2838",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 15526720,
            "range": "± 1576846",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1487,
            "range": "± 15",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 17797,
            "range": "± 697",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 283108,
            "range": "± 3164",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 74,
            "range": "± 2",
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
            "value": 1566606,
            "range": "± 26455",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 120853,
            "range": "± 2243",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1367035,
            "range": "± 16335",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 25426424,
            "range": "± 953855",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 550193,
            "range": "± 8861",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 13259172,
            "range": "± 586824",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 932536959,
            "range": "± 13093055",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3592,
            "range": "± 11",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 40450,
            "range": "± 638",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 634034,
            "range": "± 9285",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 44406,
            "range": "± 1682",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 509670,
            "range": "± 5354",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 9900064,
            "range": "± 251608",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 829,
            "range": "± 15",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 11256,
            "range": "± 149",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 199963,
            "range": "± 1221",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 17876,
            "range": "± 579",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 117186,
            "range": "± 4137",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1080326,
            "range": "± 28125",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "02ccdfd87e0aba7698a9fb62eb6d75d1cc53225f",
          "message": "build(deny): record RUSTSEC-2026-0543 (chrono unmaintained) (#1276)\n\nThe advisory, published after the last main push run, marks every chrono\nversion unmaintained. cargo-deny errors on it, so the Cargo Deny job and\nCI Gate fail on main (smithy's heavy run, #1275) and on every PR.\n\nrivet does not depend on chrono. cargo tree -i chrono: gluesql-core (the\nsql engine, whose unmaintained chain deny.toml already accepts), rmcp\n(the MCP SDK) and schemars via rmcp. It is not a vulnerability, and the\nway out is upstream (jiff/time), so it is recorded with that reasoning,\nlike the instant and gluesql entries, to revisit with the rmcp 3.x\nmigration.\n\nConfirmed with cargo-deny 0.20.2: `cargo deny check advisories` exits 1\nwith \"chrono is unmaintained\" before this change and 0 after; `cargo\ndeny check` reports advisories, bans, licenses and sources ok.\n\n\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9\n\nCo-authored-by: Claude Opus 5.5 <noreply@anthropic.com>",
          "timestamp": "2026-11-17T20:21:30Z",
          "tree_id": "bdc0671bf58eae74b8c69a4d4a4c81125faa490e",
          "url": "https://github.com/pulseengine/rivet/commit/02ccdfd87e0aba7698a9fb62eb6d75d1cc53225f"
        },
        "date": 1794969710825,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 58061,
            "range": "± 3256",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 720080,
            "range": "± 26149",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 9245970,
            "range": "± 509705",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1166,
            "range": "± 50",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 13895,
            "range": "± 806",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 292673,
            "range": "± 20158",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 53,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/1000",
            "value": 53,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 54,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1486687,
            "range": "± 76912",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 120349,
            "range": "± 1047",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1468333,
            "range": "± 92229",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 21247925,
            "range": "± 1186842",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 525563,
            "range": "± 26164",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 12285808,
            "range": "± 686999",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 733293755,
            "range": "± 22712546",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3322,
            "range": "± 230",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 33594,
            "range": "± 115",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 829150,
            "range": "± 16568",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 39230,
            "range": "± 390",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 431134,
            "range": "± 15459",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 5664000,
            "range": "± 621207",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 549,
            "range": "± 28",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 8761,
            "range": "± 555",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 254540,
            "range": "± 13760",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 17290,
            "range": "± 198",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 114283,
            "range": "± 7402",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1034588,
            "range": "± 42342",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "2f11728fec195892735972183c7090379029381e",
          "message": "fix(yaml): report a tab that indents a block entry (#1277)\n\n* fix(yaml): report a tab that indents a block entry\n\n#1248: rivet accepted tab indentation and counted the tab as one column,\nso `\\ta: 1` and `a:` / `\\tb: 1` built structure an editor may show\ndifferently. YAML 1.2 §6.1 indents with spaces only.\n\nbump_line_indent consumes a line's leading whitespace and reports a tab\nin it when the line starts a block entry (`- ` or `key:`). A tab before\na flow collection or a next-line scalar is separation and stays allowed\n(yaml-test-suite 6CA3, Q5MG, DK95/00 caught a first, broader version).\nThe check runs where indentation is consumed: block mappings, block\nsequences, the root, and the \"value on the next line\" branches.\neat_trivia now treats whitespace at offset 0 as indentation too, as it\nalready did after a newline.\n\nThe suite rejects one more invalid case, so the ratchets move:\nINVALID_REJECTED 63 -> 64, INVALID_ACCEPTED 31 -> 30; MATCHED 134,\nwrong 0.\n\nConfirmed with: new tests a_tab_in_indentation_is_an_error (fails with\nthe check disabled) and tabs_outside_indentation_still_parse;\nYAML_TEST_SUITE at 6e6c296a with cargo nextest run --all --profile ci:\n2752 passed, exit 0; cargo +1.100.0 clippy --all-targets -D warnings\nexit 0; cargo fmt --check. rivet validate over 58 local pulseengine\ncheckouts: no tab-indentation errors, and the same files load as before.\n\nFixes: REQ-346\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9\n\n* test(yaml): kill the tab-indentation PR-diff mutants\n\nPR-diff mutation testing left 4 mutants alive in code #1277 touched:\nthe Whitespace arm of eat_trivia, the Newline|Comment arm of\nparse_block_sequence, and `j += 1` in block_entry_at (as -= and *=).\n\nNew cases: a tab-indented `b : 1` (spaces before the colon) and a\ntab-indented key under a bare `-` must both be errors; a sequence item\nwhose mapping starts on the next line, a key with spaces and a comment\nbefore its nested mapping, and `... # end` after a document must parse\nwith their values intact.\n\nConfirmed with cargo mutants --in-diff -- --lib (the previous run:\n1 missed, 25 caught, 4 timeouts) and a hand-applied negative control on\nthe eat_trivia arm, which fails values_after_trivia_keep_their_nesting.\nnextest --profile ci with YAML_TEST_SUITE set: 2753 passed.\n\nVerifies: REQ-346\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9\n\n---------\n\nCo-authored-by: Claude Opus 5.5 <noreply@anthropic.com>",
          "timestamp": "2026-11-18T02:31:55Z",
          "tree_id": "547afbefbc598adfa39cd2c594ea10fa87ca0cac",
          "url": "https://github.com/pulseengine/rivet/commit/2f11728fec195892735972183c7090379029381e"
        },
        "date": 1794982515533,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 82710,
            "range": "± 1443",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 990114,
            "range": "± 12681",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12006439,
            "range": "± 649900",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1603,
            "range": "± 19",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 19687,
            "range": "± 267",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 438241,
            "range": "± 8401",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 78,
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
            "value": 78,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 2150746,
            "range": "± 14644",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 179567,
            "range": "± 2955",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 2085551,
            "range": "± 19611",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 27928877,
            "range": "± 1087908",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 758287,
            "range": "± 10054",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 17713812,
            "range": "± 196432",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1106049734,
            "range": "± 17740619",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4066,
            "range": "± 40",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 47998,
            "range": "± 2684",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 991058,
            "range": "± 14338",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 53039,
            "range": "± 373",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 594884,
            "range": "± 8043",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7580609,
            "range": "± 118403",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 966,
            "range": "± 11",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 12103,
            "range": "± 112",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 351087,
            "range": "± 7323",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 25598,
            "range": "± 265",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 181047,
            "range": "± 3864",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1720101,
            "range": "± 46749",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "d184d1564cb73132b0e062fda79d69ae0217aa23",
          "message": "ci: pin GitHub-hosted jobs to ubuntu-24.04 (#1283)\n\nGitHub moves the ubuntu-latest label to Ubuntu 26.04 this month, which\nchanges apt packages, Python and preinstalled tools under every hosted\njob without a diff in this repository. 29 runs-on sites across 10\nworkflows now name ubuntu-24.04: plain runs-on, the release.yml build\nmatrix, and the fork fallback in gate-probe.yml and fix-hotspot.yml.\nComments that describe a job as GitHub-hosted are unchanged. Self-hosted\nlabels are untouched.\n\nThe runner-liveness starvation message now says \"GitHub-hosted\" instead\nof naming a label. tools/ci-diagnose classifies hosted jobs by the\nabsence of the self-hosted label, so it needs no change; its test suite\npasses. actionlint reports no new findings.\n\nMoving to 26.04 is a later, deliberate PR, run as advisory first.\n\n\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9\n\nCo-authored-by: Claude Opus 5.5 <noreply@anthropic.com>",
          "timestamp": "2026-11-18T08:37:36Z",
          "tree_id": "4c0d78d8d23fd00cdcd226d323b0279ec4ddfe03",
          "url": "https://github.com/pulseengine/rivet/commit/d184d1564cb73132b0e062fda79d69ae0217aa23"
        },
        "date": 1795010929040,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 60871,
            "range": "± 583",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 743764,
            "range": "± 8266",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 9891118,
            "range": "± 135900",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1194,
            "range": "± 10",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 14474,
            "range": "± 63",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 393957,
            "range": "± 2917",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 55,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/1000",
            "value": 55,
            "range": "± 0",
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
            "value": 1998282,
            "range": "± 4250",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 126603,
            "range": "± 380",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1588767,
            "range": "± 24977",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 22137360,
            "range": "± 878509",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 555627,
            "range": "± 1889",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 12165997,
            "range": "± 38568",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 724448569,
            "range": "± 5595381",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 2928,
            "range": "± 19",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 32461,
            "range": "± 143",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 780407,
            "range": "± 6168",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 44595,
            "range": "± 192",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 477700,
            "range": "± 2982",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 6569917,
            "range": "± 77030",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 616,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 8716,
            "range": "± 37",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 279493,
            "range": "± 6595",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21349,
            "range": "± 86",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 126294,
            "range": "± 719",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1120100,
            "range": "± 18102",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "eb63a5d6e37d4ae09d069d0ef3a3c68e1b65e466",
          "message": "fix(results): keep the latest result per environment; import-results --environment (#1285)\n\nResultStore::latest_for kept one result per artifact across every run,\nand evidence_for, trace-results and the results view classified from\nit. TEST-1 failing on rpi5 at 10:00 and passing on macos-arm64 at 11:00\nread as Passing, so under release.require: results a requirement that\nnever passed on the Pi counted as ready.\n\n- ResultStore::latest_per_environment returns the newest result per\n  run.environment; a run without one is one more environment, so\n  existing results files read as before. evidence_for takes one hit\n  per (artifact, environment).\n- ResultStore::status_across_environments gives the views that show\n  one status per artifact (trace-results, the results page) the newest\n  failing per-environment result if there is one.\n- rivet import-results --format junit --environment <name> sets\n  run.environment and appends it to the run id, so importing one JUnit\n  file for two environments writes two files. --environment with\n  needs-json or reqif is refused.\n\nDeclaring where a requirement must pass (a verify-on field or variant\nbindings) is #1241's open design choice and is not in this change.\n\nConfirmed with negative controls on both result_trace call sites and on\nthe CLI wiring (each reddens its test on the named assertion), and the\ntraceability ratchet against main (0 new findings).\n\nImplements: REQ-417\nVerifies: REQ-417\nRefs: REQ-413, FEAT-071\n\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9\n\nCo-authored-by: Claude Opus 5.5 <noreply@anthropic.com>",
          "timestamp": "2026-11-18T13:32:23Z",
          "tree_id": "f43a239a1e21d2d16e4e2db5a8e6ecf8cc55c64a",
          "url": "https://github.com/pulseengine/rivet/commit/eb63a5d6e37d4ae09d069d0ef3a3c68e1b65e466"
        },
        "date": 1795033996362,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 61711,
            "range": "± 698",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 722796,
            "range": "± 2263",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 9752251,
            "range": "± 313886",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1201,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 14491,
            "range": "± 117",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 363993,
            "range": "± 1088",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 54,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/1000",
            "value": 54,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 54,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1983984,
            "range": "± 22360",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 124109,
            "range": "± 530",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1488715,
            "range": "± 12061",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 27835456,
            "range": "± 650981",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 554436,
            "range": "± 1456",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 12543512,
            "range": "± 212052",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 765518703,
            "range": "± 4760056",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 2864,
            "range": "± 15",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 31096,
            "range": "± 147",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 767525,
            "range": "± 2219",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 41258,
            "range": "± 138",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 454814,
            "range": "± 1758",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 5790753,
            "range": "± 138624",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 601,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 9670,
            "range": "± 47",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 264842,
            "range": "± 4284",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21950,
            "range": "± 116",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 126134,
            "range": "± 597",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1110065,
            "range": "± 7949",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "7164bd3d4032b1438f5e26e8ab7b758196c1b25a",
          "message": "ci: fail-closed fork guard on every self-hosted job, enforced by a checker (#1287)\n\n* ci: benchmarks' change detector on light; fail-closed fork guard; say why the rest stay hosted\n\nOwner decision (2026-11-18, relayed by pulseengine.eu): move every job\nthat does not need a GitHub-hosted image onto the self-hosted light pool,\nbehind the fail-closed fork guard. In rivet the light-shaped jobs (fmt,\nYAML lint, deny, audit, cargo-vet, trust ledger, CI Gate, the ci.yml\nchange detector) were already on light; the one left was benchmarks.yml's\nchange detector, which runs the same script.\n\ngate-probe and fix-hotspot switch from `head.repo.fork && hosted ||\nlight` to the same-repository form. A pull request reaches light only\nwhen its head repository is this one; a missing head repository (a\ndeleted fork) now routes to hosted instead of to light.\n\nEvery remaining ubuntu-24.04 job now carries the smithy playbook's\nkeep-on-hosted reason above its runs-on: sudo/Nix/Bazel (Kani, Verus,\nRocq), a browser (Playwright, VS Code, mermaid-cli in rivet-delta),\ncompile-heavy builds beyond light's 4 G, the deliberate hosted\ntraceability floor, and release jobs that build, attest or publish on\nephemeral hosted runners. actionlint reports the same 5 non-label\nfindings before and after.\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9\n\n* ci: fail-closed fork guard on every self-hosted job, enforced by a checker\n\nOwner decision (2026-11-18, relayed by pulseengine.eu), opened as a\nsecurity fix: the 25 self-hosted runs-on sites in ci.yml named plain\nlabels, so a fork pull request a maintainer approved ran on the smithy\npool. Each now uses the same-repository guard; a fork PR, or one whose\nfork was deleted, runs on ubuntu-24.04 instead.\n\ntools/ci/check-selfhosted-fork-guard.rs is relay's checker (relay#689),\nwith rivet's pinned ubuntu-24.04 fallback (an unpinned ubuntu-latest\nfallback is rejected), an explicit exemption for runner-liveness.yml that\nholds only while that workflow runs on schedule and workflow_dispatch\nalone, and an optional workflows-dir argument. It runs in YAML Lint with\nplain rustc. Its tests include the negative control the owner asked for:\nthe real ci.yml with one guarded site planted back to a plain label list\nfails with exactly one violation. On origin/main's workflows the checker\nreports 27 violations (the 25 plain sites and the two fail-open forms);\non this branch it passes over 29 self-hosted lines in 10 workflows.\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9\n\n---------\n\nCo-authored-by: Claude Opus 5.5 <noreply@anthropic.com>",
          "timestamp": "2026-11-18T21:36:37Z",
          "tree_id": "44d362d04ee23057fea6fb6add93a53b748899bc",
          "url": "https://github.com/pulseengine/rivet/commit/7164bd3d4032b1438f5e26e8ab7b758196c1b25a"
        },
        "date": 1795058127251,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 68296,
            "range": "± 1165",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 734482,
            "range": "± 48098",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13023123,
            "range": "± 463768",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1515,
            "range": "± 16",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 17852,
            "range": "± 63",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 287356,
            "range": "± 7053",
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
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 2022616,
            "range": "± 127346",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 132540,
            "range": "± 8427",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1501164,
            "range": "± 18351",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 23500771,
            "range": "± 1404687",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 586038,
            "range": "± 2441",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 13261342,
            "range": "± 165917",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 890855546,
            "range": "± 12106775",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3297,
            "range": "± 142",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 35920,
            "range": "± 1219",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 647042,
            "range": "± 5859",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 46255,
            "range": "± 458",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 534974,
            "range": "± 5459",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 6775653,
            "range": "± 388589",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 789,
            "range": "± 9",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 11154,
            "range": "± 97",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 199405,
            "range": "± 11750",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21321,
            "range": "± 1112",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 130206,
            "range": "± 748",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1199217,
            "range": "± 16436",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "63549b5335397209854c8411c2facc33aa93293d",
          "message": "feat(schema): allowed-values-severity, list values checked item by item; 0.43.0 (REQ-418) (#1286)\n\n* feat(schema): allowed-values-severity, and list values checked item by item\n\nA project schema can add `serves` to `feature` with the North Star\nobjective ids it accepts, but a value outside `allowed-values` was only a\nwarning, and a list such as `serves: [O1, O9]` was never compared at all.\n\nA field may now set `allowed-values-severity: error` (or info/warning;\nabsent stays warning). A sequence value is checked item by item in the\ndefault view and in variant overlays, through one helper that both checks\nshare. Messages for scalar values are unchanged.\n\nImplements: REQ-418\nVerifies: REQ-418\nRefs: FEAT-005\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9\n\n* build: rivet 0.43.0; FieldDef is non_exhaustive\n\ncargo-semver-checks failed #1286 on constructible_struct_adds_field:\nthe new public FieldDef.allowed_values_severity breaks exhaustive struct\nliterals outside rivet-core. The owner chose (relayed by pulseengine.eu,\nanswering notice 20261118T140646-29fe14) to take the break as 0.43.0 and\nto mark FieldDef #[non_exhaustive] so later field keys are not breaks.\n\nVersion moves in Cargo.toml, both lockfiles and vscode-rivet; the\nCHANGELOG cut and the tag stay with release prep.\n\nImplements: REQ-418\nRefs: FEAT-005\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9\n\n---------\n\nCo-authored-by: Claude Opus 5.5 <noreply@anthropic.com>",
          "timestamp": "2026-11-18T20:55:08Z",
          "tree_id": "96c1cd7bd5b0c3cc047a318ff46b97ca35358835",
          "url": "https://github.com/pulseengine/rivet/commit/63549b5335397209854c8411c2facc33aa93293d"
        },
        "date": 1795058247361,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 87126,
            "range": "± 2083",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 928978,
            "range": "± 21617",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 19338607,
            "range": "± 1792132",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2292,
            "range": "± 33",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25152,
            "range": "± 701",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 431637,
            "range": "± 9378",
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
            "value": 97,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 2594749,
            "range": "± 44812",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 175307,
            "range": "± 3926",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1973876,
            "range": "± 38218",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 39263687,
            "range": "± 3625127",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 792442,
            "range": "± 10828",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 20317576,
            "range": "± 427072",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1426730298,
            "range": "± 26278721",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4532,
            "range": "± 49",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 65340,
            "range": "± 964",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 942466,
            "range": "± 28784",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 62751,
            "range": "± 812",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 719651,
            "range": "± 5098",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 9658975,
            "range": "± 852412",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1276,
            "range": "± 28",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15577,
            "range": "± 445",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 383063,
            "range": "± 3195",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 29763,
            "range": "± 1062",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 182560,
            "range": "± 1009",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1660146,
            "range": "± 51416",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "94ad77d67a62778880be6aa290b64d9b000dda19",
          "message": "fix: blank lines between YAML block entries (#1289); refuse colliding environment names (#1290)\n\nYAML (#1289): a line holding only spaces between block entries failed\nwith `expected mapping key, found Some(Newline)` when its spaces reached\nthe entries' indentation, and a shallower one broke the next key's\nindentation. eat_trivia treated line-leading whitespace as indentation\neven when nothing followed it; a whitespace-only line is now blank. A\nblock scalar refuses a tab where its indentation goes (yaml-test-suite\nY79Y/000), which the old failure had covered by accident. The suite now\nmatches H2RW, DK95/04 and DK95/05: matched 159 -> 162, invalid rejected\n69 and invalid accepted 25 unchanged.\n\nimport-results (REQ-417): the environment goes into the results file\nname, and characters other than letters, digits, `-` and `_` were\nreplaced by `-`, so `hil bench` and `hil-bench` wrote the same file and\nthe second import overwrote the first. set_environment now refuses such\nnames and leaves the runs untouched. Found by the independent review of\nREQ-417 before verification.\n\nImplements: REQ-346, REQ-417\nVerifies: REQ-346, REQ-417\n\n\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9\n\nCo-authored-by: Claude Opus 5.5 <noreply@anthropic.com>",
          "timestamp": "2026-11-19T08:00:52Z",
          "tree_id": "b257549702f99556b9ed1c4afea3f4b1e1ae16c0",
          "url": "https://github.com/pulseengine/rivet/commit/94ad77d67a62778880be6aa290b64d9b000dda19"
        },
        "date": 1795086215147,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 68273,
            "range": "± 437",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 726946,
            "range": "± 5638",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 15499784,
            "range": "± 1493266",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1479,
            "range": "± 32",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 17965,
            "range": "± 43",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 276142,
            "range": "± 1197",
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
            "value": 2022476,
            "range": "± 16327",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 130698,
            "range": "± 2993",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1502879,
            "range": "± 10487",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 28768583,
            "range": "± 3474843",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 588980,
            "range": "± 5514",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 14046293,
            "range": "± 244163",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 995422586,
            "range": "± 13349925",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3380,
            "range": "± 68",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 35349,
            "range": "± 462",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 638114,
            "range": "± 3484",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 45532,
            "range": "± 1827",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 520114,
            "range": "± 15186",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7827361,
            "range": "± 870064",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 858,
            "range": "± 9",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 11512,
            "range": "± 25",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 197442,
            "range": "± 2512",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 20510,
            "range": "± 276",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 120985,
            "range": "± 3984",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1111332,
            "range": "± 28116",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "593c0d325c66c2ffa622722bcacf6dda2ac02e6f",
          "message": "build(deps): quick-xml 0.42; keep the whole JUnit failure body (#1291)\n\nReplaces Dependabot's #1269 (root) and #1272 (/fuzz), which failed to\ncompile: in quick-xml 0.42 names are `&str` (no from_utf8) and\nBytesText has no decode(). junit.rs is the only consumer that breaks;\nreqif.rs reads through serde.\n\nMoving the text handling surfaced a defect already on main with 0.41: a\nfailure or error body was cut at its first entity (`expected a &lt; b`\nstored as `expected a`), because quick-xml reports an entity as a\nGeneralRef event and only the first Text event was kept, and\ntrim_text(true) dropped the spaces around it. The body is now an\nOption<String> that is Some inside a failure/error element and collects\nText, GeneralRef (char refs and the predefined entities; others kept as\nwritten) and CData, trimmed once when the element ends. The now-unused\nTextContext enum is removed.\n\ncargo-vet: the quick-xml exemption moves from 0.41.0 to 0.42.0\n(unaudited, as for the previous bumps).\n\nImplements: REQ-009\nVerifies: REQ-009\n\n\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9\n\nCo-authored-by: Claude Opus 5.5 <noreply@anthropic.com>",
          "timestamp": "2026-11-19T13:12:39Z",
          "tree_id": "bc1f6efd6856d6de6c2f1f3d39a18485fa314388",
          "url": "https://github.com/pulseengine/rivet/commit/593c0d325c66c2ffa622722bcacf6dda2ac02e6f"
        },
        "date": 1795109382433,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 61609,
            "range": "± 272",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 731298,
            "range": "± 2078",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 9534763,
            "range": "± 166047",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1240,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 14402,
            "range": "± 35",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 303035,
            "range": "± 1320",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 54,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/1000",
            "value": 54,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 54,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1983737,
            "range": "± 6069",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 123891,
            "range": "± 1839",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1500339,
            "range": "± 13768",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 20867241,
            "range": "± 164601",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 557547,
            "range": "± 1577",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 12669477,
            "range": "± 47074",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 775204261,
            "range": "± 9082886",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 2960,
            "range": "± 16",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 31730,
            "range": "± 239",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 787477,
            "range": "± 5602",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 42342,
            "range": "± 179",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 467539,
            "range": "± 2312",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 5745864,
            "range": "± 34987",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 620,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 8368,
            "range": "± 55",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 276268,
            "range": "± 1388",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 20888,
            "range": "± 79",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 122873,
            "range": "± 826",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1090822,
            "range": "± 10961",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "f6c82f1c765b33972e544a472add4558c1587f2c",
          "message": "feat(cli): rivet review export — commit-pinned JSON snapshot of a release (REQ-416) (#1298)\n\n* feat(cli): rivet review export — commit-pinned JSON snapshot of a release\n\n`rivet review export --release vX [--since <ref>] [--format json]` emits\n{command, commit, release, since, count, artifacts[]} where each artifact\ncarries id, type, title, status, release, description, tags, fields,\nlinks and provenance. A dirty working tree (any porcelain entry,\nuntracked included) exits 1 naming every dirty path. `--since <ref>`\nloads the project at <ref> via the existing git-archive baseline loader\nand reports only added/removed/changed artifacts for vX, with\nchanged_fields on changed ones.\n\nShape is pinned by schemas/json/review-export-output.schema.json, a\ncontract test in json_output_contracts.rs, and documented as the\n`review-export` docs topic.\n\nCloses #1227\n\nImplements: REQ-416\nVerifies: REQ-416\nRefs: REQ-007\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_01KEjmjZqkpapN4wvGGZwHUo\n\n* feat(artifacts): FEAT-141 satisfies REQ-416 (rivet review export)\n\nThe traceability ratchet flagged REQ-416 (implemented) as new\nrequirement-coverage debt: no feature or design decision satisfied it.\nFEAT-141 records the review-export feature and closes the gap.\n\nRefs: REQ-416\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_01KEjmjZqkpapN4wvGGZwHUo\n\n* chore: carry #1232 onto current main\n\nCherry-picking #1232's two commits (from another session) onto main\nafter v0.42.2 put its CHANGELOG entry inside the released [0.42.2]\nsection and duplicated the [0.42.0] heading; the entry moves to\n[Unreleased] / Added. The review-export docs topic's example used\nv0.42.0, which docs check refuses now that the workspace is 0.43.0; it\nuses v0.43.0, and docs/reference is regenerated. requirements.yaml and\ncmd/mod.rs conflicts kept both sides: REQ-416 follows REQ-417/418, and\ncmd/mod.rs declares both review and supplier.\n\nRefs: REQ-416\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9\n\n* chore: review export ships after v0.43.0\n\nv0.43.0 was cut without #1232 (owner decision 2026-11-19: review export\nwaits for v0.44.0). After rebasing onto the tag, the CHANGELOG entry\nlanded inside the released [0.43.0] section; it moves to [Unreleased],\nand REQ-416 moves from v0.43.0 to v0.44.0.\n\nRefs: REQ-416\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9\n\n---------\n\nCo-authored-by: Claude <noreply@anthropic.com>",
          "timestamp": "2026-11-19T19:31:22Z",
          "tree_id": "09df22529ea43dd1dcd49a8b0baabf0f53caa912",
          "url": "https://github.com/pulseengine/rivet/commit/f6c82f1c765b33972e544a472add4558c1587f2c"
        },
        "date": 1795131237789,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 88453,
            "range": "± 3803",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 962565,
            "range": "± 14704",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 19389181,
            "range": "± 1304139",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1947,
            "range": "± 37",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 23901,
            "range": "± 129",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 373025,
            "range": "± 1333",
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
            "value": 2606580,
            "range": "± 20487",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 161116,
            "range": "± 928",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1869572,
            "range": "± 28897",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 28337232,
            "range": "± 1338590",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 763850,
            "range": "± 3750",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 18005342,
            "range": "± 456685",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1204442969,
            "range": "± 22938233",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4544,
            "range": "± 49",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 47202,
            "range": "± 386",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 822311,
            "range": "± 5157",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 64083,
            "range": "± 647",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 728824,
            "range": "± 4256",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8824368,
            "range": "± 493455",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1126,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14440,
            "range": "± 269",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 265907,
            "range": "± 2519",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 27501,
            "range": "± 227",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 160351,
            "range": "± 2670",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1449153,
            "range": "± 40543",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "c72590770c07d6312db1ae019ac3c455e8d739f5",
          "message": "feat(check): rivet check trust-ledger, a shared shrink-only check for the trust-escape ledger (REQ-421) (#1301)\n\n* feat(check): rivet check trust-ledger compares proof escapes with a shared ledger format\n\nrivet check trust-ledger reads the four-field ledger (section, file, kind,\nname) agreed with spar in seam #1300 and scans the sources for Rocq\nAdmitted/Axiom/Parameter/Conjecture/Admit Obligations, Verus\nexternal_body/assume_specification/assume/admit, and every kani::assume\nas kind kani-assume (North Star O3 counts input-narrowing assumptions).\nIt fails on an escape the ledger lacks and on a stale row of a scanned\nkind; rows of other kinds (spar's kani-unwind=N and the like) are\ncounted, not compared. --base <ref> fails when the ledger gained a row\nsince the ref, --kernel compares coqchk -o axioms with the kernel rows,\nand --no-scan only parses, counts and applies --base for a ledger another\nrepo's detector owns.\n\nThe scan and comparison live in rivet-core/src/trust_ledger.rs with 16\nunit tests; the scanner builds the tokens it looks for with concat! so it\nfinds nothing in its own source (a test scans the module itself).\nrivet's ledger gains its 29 kani-assume rows; tools/ci/trust-ledger.py,\nstill the CI job, ignores them and passes.\n\nConfirmed with: 9 CLI tests in rivet-cli/tests/trust_ledger.rs; negative\ncontrols (dropping the stale check reddens the stale test; a literal\nmacro token reddens the self-scan test); cargo-mutants on the diff, 77\ncaught, 4 timeouts, 11 unviable, 5 missed, each then killed by a new\nunit test; full nextest suite 2811 passed; fmt and clippy -D warnings\nclean; rivet docs check PASS.\n\nImplements: REQ-421\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9\n\n* chore: REQ-416 verified after an independent acceptance review\n\nA fresh-context reviewer (claude-opus-5-5, not a fork of the author)\nfound all 9 acceptance clauses of rivet review export met, from the\nsource and its own runs in throwaway repos; the review is recorded in\nthe artifact's independent-review field. rivet verify accepted the 6\nsource markers as evidence. Confirmed with rivet validate (PASS) and\nthe traceability ratchet (0 new findings).\n\nVerifies: REQ-416\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9\n\n* test(check): trust-ledger CLI tests carry REQ-421 verify markers\n\nSix of the nine CLI tests cover REQ-421's clauses: counts by kind, a new\nescape, a stale row, carried foreign kinds, --base growth and shrink, and\n--no-scan. REQ-421 stays draft: replacing the compare half of\ntools/ci/trust-ledger.py in CI is a CI change and waits for the owner.\n\nVerifies: REQ-421\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9\n\n---------\n\nCo-authored-by: Claude Opus 5.5 <noreply@anthropic.com>",
          "timestamp": "2026-11-20T11:02:06Z",
          "tree_id": "bbd954cd1165cf015c39b551b549f6c0cf496af8",
          "url": "https://github.com/pulseengine/rivet/commit/c72590770c07d6312db1ae019ac3c455e8d739f5"
        },
        "date": 1795192596194,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 46462,
            "range": "± 723",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 552530,
            "range": "± 2204",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 9204253,
            "range": "± 222973",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1030,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 12402,
            "range": "± 305",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 232047,
            "range": "± 989",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 46,
            "range": "± 1",
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
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1537479,
            "range": "± 15089",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 108325,
            "range": "± 2862",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1221141,
            "range": "± 10758",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 16072932,
            "range": "± 189996",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 422799,
            "range": "± 4960",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 8789577,
            "range": "± 100084",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 557805216,
            "range": "± 3731117",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 2557,
            "range": "± 36",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 25380,
            "range": "± 116",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 478660,
            "range": "± 6158",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 33945,
            "range": "± 89",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 364436,
            "range": "± 1524",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 4310186,
            "range": "± 59900",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 481,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 6991,
            "range": "± 375",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 124017,
            "range": "± 922",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 15455,
            "range": "± 550",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 86440,
            "range": "± 595",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 790945,
            "range": "± 6856",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "5512b3ff080922587d8dc3f4b7295da4b8495e0c",
          "message": "chore(plan): move 14 items out of v0.44.0 to v0.45.0 (owner-approved) (#1304)\n\nThe owner chose approve-all on notice 20261119T231817-1ad860 on 2026-11-20.\nMoved with rivet release move: REQ-333, REQ-335, REQ-300, REQ-336,\nREQ-379, REQ-059, REQ-394, REQ-380, REQ-247, REQ-332, REQ-392, REQ-377,\nREQ-360, REQ-296. v0.44.0 keeps 12 artifacts.\n\nThe notice said 15 items; the plan doc lists 14. REQ-378 is in v0.44.0\nscope and on neither the move list nor the keep list, so it stays until\nthe owner places it. The plan doc now records the approval and the move.\n\nRefs: REQ-419, REQ-420\n\n\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9\n\nCo-authored-by: Claude Opus 5.5 <noreply@anthropic.com>",
          "timestamp": "2026-11-20T15:14:00Z",
          "tree_id": "d49c58044204baf6d3a146114cc7f434c927b260",
          "url": "https://github.com/pulseengine/rivet/commit/5512b3ff080922587d8dc3f4b7295da4b8495e0c"
        },
        "date": 1795215973215,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 61876,
            "range": "± 438",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 730505,
            "range": "± 3409",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 10431760,
            "range": "± 302164",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1230,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 14591,
            "range": "± 182",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 296403,
            "range": "± 1015",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 55,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/1000",
            "value": 55,
            "range": "± 0",
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
            "value": 2009372,
            "range": "± 9134",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 128661,
            "range": "± 655",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1543214,
            "range": "± 23053",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 26801619,
            "range": "± 1727197",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 538723,
            "range": "± 2100",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 11790024,
            "range": "± 77164",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 717812277,
            "range": "± 4764536",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 2875,
            "range": "± 21",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 31099,
            "range": "± 387",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 761937,
            "range": "± 2921",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 42471,
            "range": "± 138",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 465018,
            "range": "± 1326",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 5732403,
            "range": "± 37254",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 604,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 8534,
            "range": "± 127",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 287946,
            "range": "± 1513",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21582,
            "range": "± 81",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 126206,
            "range": "± 2467",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1123116,
            "range": "± 10919",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "95dc85e7b22774b8d8b34a24efee0f97d613f0a2",
          "message": "fix(deps): wasmtime-wasi 48.0.10 for RUSTSEC-2026-0587 (#1306)\n\n* fix(deps): wasmtime-wasi 48.0.10 for RUSTSEC-2026-0587\n\nRUSTSEC-2026-0587 (GHSA-f2pq-268w-886c): a WASI filesystem sandbox\nescape on Windows through a drive-prefixed path component, fixed in\nwasmtime-wasi 48.0.10. Cargo Deny fails every PR on it today (seen on\n#1303, job 136290033532).\n\nLockfile only: cargo update -p wasmtime-wasi --precise 48.0.10 moves 19\nwasmtime/wiggle crates 48.0.9 -> 48.0.10 and 13 cranelift/pulley crates\n0.135.9 -> 0.135.10, and drops windows-sys 0.59.0. wasmtime is behind\nrivet-core's optional `wasm` feature; release binaries build without it.\nConfirmed with cargo deny check advisories (ok) and cargo check -p\nrivet-core --features wasm.\n\nTrace: skip\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9\n\n* chore(vet): import the wasmtime 48.0.10 trusted-publisher entries\n\ncargo vet failed on 32 crates (wasmtime, wiggle, pulley 48.0.10 and\ncranelift 0.135.10): imports.lock still listed the 48.0.9 publisher\nentries. Refreshed with `cargo vet`; the diff only moves those 32\nentries to the 2026-11-19 publish. `cargo vet --locked` now succeeds.\n\nTrace: skip\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9\n\n---------\n\nCo-authored-by: Claude Opus 5.5 <noreply@anthropic.com>",
          "timestamp": "2026-11-21T04:28:27Z",
          "tree_id": "920c74ba246a7170a3aa16e14de9c0bbdac08432",
          "url": "https://github.com/pulseengine/rivet/commit/95dc85e7b22774b8d8b34a24efee0f97d613f0a2"
        },
        "date": 1795251126635,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 62324,
            "range": "± 302",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 729552,
            "range": "± 8065",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 9844451,
            "range": "± 98747",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1195,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 14213,
            "range": "± 125",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 288308,
            "range": "± 1103",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 55,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/1000",
            "value": 55,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 56,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1998005,
            "range": "± 9105",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 131466,
            "range": "± 789",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1570934,
            "range": "± 18942",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 27570641,
            "range": "± 793110",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 549336,
            "range": "± 1809",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 12259519,
            "range": "± 122650",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 725410667,
            "range": "± 6424642",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 2973,
            "range": "± 50",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 31953,
            "range": "± 176",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 778349,
            "range": "± 8877",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 41748,
            "range": "± 148",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 462876,
            "range": "± 2352",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7315026,
            "range": "± 817083",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 613,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 9255,
            "range": "± 43",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 282312,
            "range": "± 10074",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21700,
            "range": "± 132",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 125279,
            "range": "± 833",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1121445,
            "range": "± 10123",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "e75f43ca274317ee7d7496755c562701ce41cc4e",
          "message": "ci: stop Intel macOS builds; npm refuses darwin-x64 with a clear message (#1302)\n\nThe owner stopped Intel macOS builds fleet-wide on 2026-11-20. This removes\nthe x86_64-apple-darwin release target (macos-15-intel runner), the\ndarwin-x64 npm platform package, its release-npm matrix row, optional\ndependency, summary line and dependabot entry, and the compliance action's\nIntel macOS download. CI had no Intel macOS job.\n\nnpm/index.js refuses darwin-x64 with \"unsupported platform\", and install.js\nexits 1 with that message before trying a GitHub download that would 404;\nrun.js stops on the same error. The message tells an Intel Mac user to build\nfrom source with cargo install --locked --tag, and an Apple Silicon user\nrunning an x64 Node under Rosetta 2 to switch to an arm64 Node. The\ncompliance action exits 1 with an unsupported-platform line on an Intel\nmacOS runner.\n\nCHANGELOG [Unreleased] carries the release-note sentence.\n\nTrace: skip\n\n\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9\n\nCo-authored-by: Claude Opus 5.5 <noreply@anthropic.com>",
          "timestamp": "2026-11-21T05:26:13Z",
          "tree_id": "2e5b828564aa41a93f18a45aa3f2ebbd24dd5ffb",
          "url": "https://github.com/pulseengine/rivet/commit/e75f43ca274317ee7d7496755c562701ce41cc4e"
        },
        "date": 1795251362404,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 68050,
            "range": "± 1568",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 762640,
            "range": "± 22679",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 19708935,
            "range": "± 1343946",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1511,
            "range": "± 15",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 17873,
            "range": "± 105",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 286042,
            "range": "± 3751",
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
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 2031999,
            "range": "± 40459",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 132368,
            "range": "± 1741",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1531510,
            "range": "± 33716",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 28625428,
            "range": "± 2905298",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 572676,
            "range": "± 1915",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 12927383,
            "range": "± 312188",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 841995510,
            "range": "± 11405955",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3334,
            "range": "± 72",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 35648,
            "range": "± 451",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 644259,
            "range": "± 25108",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 45804,
            "range": "± 154",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 521687,
            "range": "± 25000",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8940267,
            "range": "± 1113129",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 881,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 11081,
            "range": "± 26",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 197233,
            "range": "± 1167",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 20879,
            "range": "± 216",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 123060,
            "range": "± 1186",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1115523,
            "range": "± 12022",
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
          "id": "fe70872a05ceeaa26cf04bdf8d0e430d2303c28f",
          "message": "build(deps): bump regex from 1.13.1 to 1.13.2 in /fuzz (#1316)\n\nBumps [regex](https://github.com/rust-lang/regex) from 1.13.1 to 1.13.2.\n- [Release notes](https://github.com/rust-lang/regex/releases)\n- [Changelog](https://github.com/rust-lang/regex/blob/master/CHANGELOG.md)\n- [Commits](https://github.com/rust-lang/regex/compare/1.13.1...1.13.2)\n\n---\nupdated-dependencies:\n- dependency-name: regex\n  dependency-version: 1.13.2\n  dependency-type: direct:production\n  update-type: version-update:semver-patch\n...\n\nSigned-off-by: dependabot[bot] <support@github.com>\nCo-authored-by: dependabot[bot] <49699333+dependabot[bot]@users.noreply.github.com>",
          "timestamp": "2026-11-21T10:22:58Z",
          "tree_id": "c5f3de71593f2ba5a3cd0648b6dc70bd214835a6",
          "url": "https://github.com/pulseengine/rivet/commit/fe70872a05ceeaa26cf04bdf8d0e430d2303c28f"
        },
        "date": 1795267959037,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 61677,
            "range": "± 269",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 743440,
            "range": "± 2478",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 10057589,
            "range": "± 428480",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1193,
            "range": "± 11",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 14461,
            "range": "± 135",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 388977,
            "range": "± 930",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 58,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/1000",
            "value": 59,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 58,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1997468,
            "range": "± 5935",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 127994,
            "range": "± 272",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1548676,
            "range": "± 19076",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 23016700,
            "range": "± 677862",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 564216,
            "range": "± 2089",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 12011253,
            "range": "± 64871",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 690064139,
            "range": "± 7563110",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 2950,
            "range": "± 11",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 31590,
            "range": "± 91",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 837005,
            "range": "± 4577",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 41862,
            "range": "± 91",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 468755,
            "range": "± 2141",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 5971624,
            "range": "± 23443",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 621,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 8645,
            "range": "± 27",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 281724,
            "range": "± 1967",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 20991,
            "range": "± 78",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 123752,
            "range": "± 387",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1119026,
            "range": "± 13854",
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
          "id": "296e5a5583b56cd5b6726c302c46243f2ab17b3a",
          "message": "build(deps): bump the github-actions-all group with 2 updates (#1310)\n\nBumps the github-actions-all group with 2 updates: [taiki-e/install-action](https://github.com/taiki-e/install-action) and [pulseengine/temper/.github/actions/gate-probe](https://github.com/pulseengine/temper).\n\n\nUpdates `taiki-e/install-action` from 2.90.3 to 2.90.5\n- [Release notes](https://github.com/taiki-e/install-action/releases)\n- [Changelog](https://github.com/taiki-e/install-action/blob/main/CHANGELOG.md)\n- [Commits](https://github.com/taiki-e/install-action/compare/cfdb7ed4ccc7c7dce37759eae89dc5674b469b39...ab49d3c64680143e184118bed66a46419fc15519)\n\nUpdates `pulseengine/temper/.github/actions/gate-probe` from 03a53ca7dc3ac604252abcb70b267cd9f8ef623e to 08817a347e2df6166a7a6bd67e4639f7ba5998dd\n- [Release notes](https://github.com/pulseengine/temper/releases)\n- [Changelog](https://github.com/pulseengine/temper/blob/main/CHANGELOG.md)\n- [Commits](https://github.com/pulseengine/temper/compare/03a53ca7dc3ac604252abcb70b267cd9f8ef623e...08817a347e2df6166a7a6bd67e4639f7ba5998dd)\n\n---\nupdated-dependencies:\n- dependency-name: taiki-e/install-action\n  dependency-version: 2.90.5\n  dependency-type: direct:production\n  update-type: version-update:semver-patch\n  dependency-group: github-actions-all\n- dependency-name: pulseengine/temper/.github/actions/gate-probe\n  dependency-version: '08817a347e2df6166a7a6bd67e4639f7ba5998dd'\n  dependency-type: direct:production\n  dependency-group: github-actions-all\n...\n\nSigned-off-by: dependabot[bot] <support@github.com>\nCo-authored-by: dependabot[bot] <49699333+dependabot[bot]@users.noreply.github.com>",
          "timestamp": "2026-11-21T14:52:46Z",
          "tree_id": "ab07e20256e0bbe666101c62f4628e9b8d2b716d",
          "url": "https://github.com/pulseengine/rivet/commit/296e5a5583b56cd5b6726c302c46243f2ab17b3a"
        },
        "date": 1795283217277,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 68110,
            "range": "± 2217",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 736283,
            "range": "± 4687",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14070638,
            "range": "± 861052",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1451,
            "range": "± 16",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 17914,
            "range": "± 151",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 275660,
            "range": "± 4019",
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
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 2046971,
            "range": "± 10058",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 131475,
            "range": "± 1500",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1502701,
            "range": "± 25035",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 25198172,
            "range": "± 987593",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 575301,
            "range": "± 11712",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 12649875,
            "range": "± 203986",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 824913369,
            "range": "± 7151204",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3506,
            "range": "± 94",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 35730,
            "range": "± 261",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 632403,
            "range": "± 5816",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 47786,
            "range": "± 476",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 534957,
            "range": "± 4950",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 6921094,
            "range": "± 364217",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 835,
            "range": "± 9",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 11000,
            "range": "± 344",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 196029,
            "range": "± 714",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21026,
            "range": "± 42",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 122938,
            "range": "± 376",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1118955,
            "range": "± 24622",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "bc26179fee460bdfecc0e6baf7bbe10868b8d9d0",
          "message": "ci: pin every third-party action to a full commit SHA (#1303)\n\n* ci: pin every third-party action to a full commit SHA\n\nThe org will require SHA-pinned actions; this pins the 29 references that\nstill used a ref name and adds a version comment to the one pin that lacked\none. Each SHA was resolved from upstream with git ls-remote:\n\n- dtolnay/rust-toolchain@stable (26) and @1.89.0 (1): the head of the\n  branch of that name, since the branch name selects the toolchain;\n  39008827 (stable) and d92bbbb0 (1.89.0).\n- bazel-contrib/setup-bazel@0.19.2 (2): the commit the annotated tag points\n  to, f34d6a05, not the tag object e1614ab8.\n- pulseengine/temper gate-probe, already pinned to 03a53ca7: temper has no\n  release tags, so the comment names main, 2026-11-11, temper#90.\n\nEvery uses: line in .github/workflows and .github/actions now reads\nowner/action@<40-hex> # <version>, local ./ actions aside. The README\nexamples in .github/actions/compliance are documentation for consumers and\nkeep their ref names.\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9\n\n* ci(release): pin Rust 1.100.0 on the SHA-pinned toolchain action\n\nSame change as release/v0.43.x (#1322): the five release.yml toolchain\nsteps use dtolnay/rust-toolchain@fa04a145 with toolchain: 1.100.0, so\nmain and the release branch carry one pin. Owner fleet rule 2026-11-21.\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9\n\n---------\n\nCo-authored-by: Claude Opus 5.5 <noreply@anthropic.com>",
          "timestamp": "2026-11-22T04:35:28Z",
          "tree_id": "f3ea89d6bd547bc782570d1b12c7e4c08db79d79",
          "url": "https://github.com/pulseengine/rivet/commit/bc26179fee460bdfecc0e6baf7bbe10868b8d9d0"
        },
        "date": 1795326680206,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 82858,
            "range": "± 693",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 942141,
            "range": "± 11694",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 15525652,
            "range": "± 497401",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1570,
            "range": "± 11",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 19157,
            "range": "± 162",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 327056,
            "range": "± 3391",
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
            "value": 75,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 2639117,
            "range": "± 17101",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 174492,
            "range": "± 1233",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1980625,
            "range": "± 10969",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 36197816,
            "range": "± 886909",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 737743,
            "range": "± 7538",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 17030390,
            "range": "± 214259",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1059379363,
            "range": "± 4442866",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3926,
            "range": "± 26",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 42134,
            "range": "± 273",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 936021,
            "range": "± 7255",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 54845,
            "range": "± 467",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 576400,
            "range": "± 3059",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8069040,
            "range": "± 429832",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1076,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 11836,
            "range": "± 99",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 339991,
            "range": "± 2872",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 29239,
            "range": "± 194",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 171880,
            "range": "± 1262",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1541468,
            "range": "± 19475",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "fce7fd2f7af3260aa7f16068e7d9adb392ae7013",
          "message": "ci: Kani, Verus, Rocq and the trust ledger join CI Gate (v0.44.0 bet 2a) (#1305)\n\n* ci: Kani, Verus, Rocq and the trust ledger join CI Gate (v0.44.0 bet 2a)\n\nThe owner approved bet 2a on 2026-11-20 (notice 20261119T231817-1ad860,\napprove-all). The four proof jobs become CI Gate needs and kani, verus and\nrocq lose continue-on-error, so a failed proof or ledger check blocks the\nmerge.\n\nThe plan's kill condition held: on the 10 main CI runs before this change,\nevery step of the three proof jobs succeeded (Kani's full 27-harness path,\nVerus, Rocq with the coqchk kernel audit), with no fetch failure.\n\nci-gate-check.sh accepts a proof job's skip only for a recorded reason:\nkani when the detector says rust=false, verus/rocq/trust-ledger when it\nsays proofs=false, and kani/verus/rocq in the merge queue, where their\nif: excludes them. trust-ledger has no event exclusion. Eleven new cases\nin ci-gate-check_test.sh; with the new skip rules deleted, the two\nskip-acceptance cases fail.\n\nPull requests still run Kani with --only-codegen, so the gate makes the\nharnesses compile; a Kani proof that no longer holds is caught by the\nfull run on push to main. The job comments say so.\n\nImplements: REQ-420\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9\n\n* ci: the traceability job runs rivet check trust-ledger, shrink-only on PRs\n\nThe gated traceability job already builds rivet, so it runs the full\nledger check (kani::assume included) on every event, and on a pull\nrequest with --base at the merge base, so a PR that adds a ledger row\nfails CI Gate. Locally on this branch: PASS with 0 entries added; with\none extra row appended, FAIL with \"1 entry added\".\n\nImplements: REQ-420\nRefs: REQ-421\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9\n\n---------\n\nCo-authored-by: Claude Opus 5.5 <noreply@anthropic.com>",
          "timestamp": "2026-11-22T06:31:09Z",
          "tree_id": "f92ffe91027326631a0728d2c63eb0a18d37ae68",
          "url": "https://github.com/pulseengine/rivet/commit/fce7fd2f7af3260aa7f16068e7d9adb392ae7013"
        },
        "date": 1795334617039,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 61435,
            "range": "± 186",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 721504,
            "range": "± 2044",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 9628874,
            "range": "± 224457",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1180,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 14306,
            "range": "± 73",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 374534,
            "range": "± 2733",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 54,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/1000",
            "value": 55,
            "range": "± 0",
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
            "value": 1991412,
            "range": "± 7552",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 127360,
            "range": "± 296",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1550753,
            "range": "± 24009",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 21183198,
            "range": "± 413473",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 543996,
            "range": "± 2930",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 11645385,
            "range": "± 59587",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 692275935,
            "range": "± 3299468",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 2961,
            "range": "± 18",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 31642,
            "range": "± 217",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 778336,
            "range": "± 4540",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 41722,
            "range": "± 158",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 464978,
            "range": "± 1092",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 5788678,
            "range": "± 38356",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 634,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 8430,
            "range": "± 59",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 276475,
            "range": "± 2074",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21567,
            "range": "± 276",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 126066,
            "range": "± 390",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1128268,
            "range": "± 13381",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "6ef8887cbd03612fe8da3d447c7aa42450926a88",
          "message": "ci: every lockfile binds the build; CI pins Rust 1.100.0 (#1323)\n\n* ci: every lockfile binds the build, and nested locks are audited\n\nLockfile sweep, owner-approved 2026-11-20 (relayed by pulseengine.eu).\n\n- tools/ci/lockfiles-check.sh, a step in the Cargo Deny job (a CI Gate\n  need): every Cargo workspace root found from the committed Cargo.toml\n  files (., fuzz, compose-witness) has a committed, unignored Cargo.lock\n  that `cargo metadata --locked` accepts, so the ~50 unlocked cargo\n  commands in CI resolve exactly the committed lock. Nested locks pass\n  `cargo deny check advisories` with the root deny.toml. Fails closed\n  below 3 roots. Also checks MODULE.bazel.lock and the npm lockfiles.\n- MODULE.bazel.lock committed (Bazel 9.3.3, `bazel mod deps\n  --lockfile_mode=update`); .bazelversion pins 9.3.3, the version CI ran\n  unpinned; .bazelrc sets `common --lockfile_mode=error`.\n- tools/intro-video: package-lock.json was gitignored; now committed.\n- release.yml: `cargo install cross` gains --locked.\n- The new audit found two advisories: fuzz/Cargo.lock crossbeam-epoch\n  0.9.18 (RUSTSEC-2026-0204) -> 0.9.21; compose-witness unsafe-libyaml\n  (RUSTSEC-2024-0449) via serde_yaml, replaced by rivet-yaml as the root\n  workspace did in #1085. The component builds (cargo component build\n  --release) and returns byte-identical output to the serde_yaml build on\n  sample models; only parse-error wording differs.\n\nLocal negative controls: an out-of-date fuzz/Cargo.lock and a gitignored\nnpm lock each make the script exit 1.\n\nRefs: REQ-347\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9\n\n* ci: CI pins Rust 1.100.0 like release.yml\n\nThe 22 dtolnay/rust-toolchain steps in ci.yml (19), benchmarks.yml,\ncompliance.yml and rivet-delta.yml were SHA-pinned to the action's\nstable branch (39008827, b725eda5) with no toolchain input, so they\ninstalled whatever stable was current. They now use the master commit\nfa04a145 that release.yml uses, with toolchain: 1.100.0; existing\ncomponents and targets are kept. The compliance action's README\nexample shows the same pin instead of @stable. The dated nightly jobs\nand the MSRV job (1.89.0) are unchanged; no toolchain canary yet.\n\nOwner fleet rule extension, 2026-11-21, relayed by pulseengine.eu: CI\npins the exact release toolchain too.\n\nConfirmed with: no rust-toolchain@39008827/b725eda5 left in\n.github/workflows; every workflow parses; actionlint reports the same\n6 findings as main.\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9\n\n---------\n\nCo-authored-by: Claude Opus 5.5 <noreply@anthropic.com>",
          "timestamp": "2026-11-22T08:52:26Z",
          "tree_id": "7cb6789e5d3c9bf7b7c9919fe6c5e246c5f85c1e",
          "url": "https://github.com/pulseengine/rivet/commit/6ef8887cbd03612fe8da3d447c7aa42450926a88"
        },
        "date": 1795344216268,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 68786,
            "range": "± 919",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 743314,
            "range": "± 31368",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 16686431,
            "range": "± 2029567",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1502,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 18110,
            "range": "± 339",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 287121,
            "range": "± 2179",
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
            "value": 2044921,
            "range": "± 5787",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 132026,
            "range": "± 873",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1493748,
            "range": "± 25642",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 27410393,
            "range": "± 2168922",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 576122,
            "range": "± 7552",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 12603204,
            "range": "± 193378",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 820157594,
            "range": "± 9218997",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3288,
            "range": "± 42",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 35987,
            "range": "± 973",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 639273,
            "range": "± 2339",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 46460,
            "range": "± 440",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 530644,
            "range": "± 2816",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7127263,
            "range": "± 449500",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 853,
            "range": "± 13",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 11395,
            "range": "± 55",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 202451,
            "range": "± 1874",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 20584,
            "range": "± 298",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 121445,
            "range": "± 814",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1120279,
            "range": "± 29552",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "d9e7913b01214bb4285e0e7903bfef31766c135f",
          "message": "security: url 2.5.9 for RUSTSEC-2026-0592 (#1327)\n\n* fix(deps): url 2.5.9 for RUSTSEC-2026-0592\n\nurl 2.5.8 -> 2.5.9 (Url::origin() stack overflow, RUSTSEC-2026-0592),\nwith form_urlencoded 1.2.2 -> 1.2.3. Lockfile only, via\ncargo update -p url --precise 2.5.9. Of the three Cargo.lock files\nonly the root one carries url; compose-witness and fuzz have none.\n\nConfirmed with cargo audit 0.22.1 on each lock: root exits 0 with CI's\none ignore (RUSTSEC-2026-0462, recorded in deny.toml) and exits 1 on\nmain's lock, naming RUSTSEC-2026-0592; compose-witness and fuzz exit 0;\ncargo deny check advisories is ok. Fleet rule relayed by pulseengine.eu.\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9\n\n* chore(vet): exempt url 2.5.9 and form_urlencoded 1.2.3\n\ncargo vet --locked failed on #1327 with url 2.5.9 and form_urlencoded\n1.2.3 missing safe-to-deploy. url was already vetted by an exemption\n(2.5.8), which moves to 2.5.9; form_urlencoded 1.2.2 was covered by a\nmozilla audit import that stops at 1.2.2, so 1.2.3 gets an exemption.\nBoth are published by Manishearth. cargo vet --locked now succeeds.\n\nTrace: skip\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9\n\n---------\n\nCo-authored-by: Claude Opus 5.5 <noreply@anthropic.com>",
          "timestamp": "2026-11-22T14:42:45Z",
          "tree_id": "420882cc1e24af66709e0a880e5a4561d717774a",
          "url": "https://github.com/pulseengine/rivet/commit/d9e7913b01214bb4285e0e7903bfef31766c135f"
        },
        "date": 1795373839672,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84879,
            "range": "± 381",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 896790,
            "range": "± 32642",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13416479,
            "range": "± 656788",
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
            "value": 25885,
            "range": "± 251",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 423523,
            "range": "± 5182",
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
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 2540936,
            "range": "± 42661",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 173808,
            "range": "± 616",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1917924,
            "range": "± 61344",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 26460646,
            "range": "± 1017814",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 776669,
            "range": "± 12451",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 17678802,
            "range": "± 410885",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1282124324,
            "range": "± 14227359",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4483,
            "range": "± 49",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 66947,
            "range": "± 1100",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 932769,
            "range": "± 32692",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 62988,
            "range": "± 1536",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 700350,
            "range": "± 7208",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8578407,
            "range": "± 449845",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1220,
            "range": "± 25",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15774,
            "range": "± 509",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 383377,
            "range": "± 2774",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 29338,
            "range": "± 96",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 180799,
            "range": "± 1519",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1631076,
            "range": "± 18253",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "0be207c96ae585cdfa7748f52bbbc7fd10bba52a",
          "message": "ci(release): the release note runs from the last published tag (#1325)\n\nCarries the v0.43.x fix to main (#1318). release-note.sh gains\nrelease_published and previous_published_tag: walking back from the\nnew tag, a predecessor whose GitHub release is missing or still a\ndraft is skipped, and a predecessor whose state cannot be read (no gh,\nan API error) fails the step rather than guessing. release.yml's\nGenerate release note step uses it, with GH_TOKEN for the API read.\nWithout it, v0.43.3's note would have run from the unpublished v0.43.2\nand listed nothing users had not received.\n\nrelease-note_test.sh covers: unpublished predecessor skipped, published\nkept, first release empty, unreadable state fails with no output, and a\nrunner without gh fails. Same code as tag v0.43.3, whose Release run\n44949910277 used it.\n\nRefs: REQ-369\n\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9\n\nCo-authored-by: Claude Opus 5.5 <noreply@anthropic.com>",
          "timestamp": "2026-11-24T22:27:26Z",
          "tree_id": "d69a6fed90fa4b3363fb89ba62732909075a212f",
          "url": "https://github.com/pulseengine/rivet/commit/0be207c96ae585cdfa7748f52bbbc7fd10bba52a"
        },
        "date": 1795564411340,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 61425,
            "range": "± 243",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 744944,
            "range": "± 3543",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 9908989,
            "range": "± 93600",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1240,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 14436,
            "range": "± 23",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 352572,
            "range": "± 23394",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 59,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/1000",
            "value": 59,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 58,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1976424,
            "range": "± 3092",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 127342,
            "range": "± 183",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1530912,
            "range": "± 14929",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 21417241,
            "range": "± 44170",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 540969,
            "range": "± 1329",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 11697627,
            "range": "± 78764",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 671770084,
            "range": "± 3031903",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 2964,
            "range": "± 18",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 32950,
            "range": "± 201",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 761891,
            "range": "± 5317",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 43717,
            "range": "± 116",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 456650,
            "range": "± 6724",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 5815438,
            "range": "± 16808",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 590,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 9041,
            "range": "± 44",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 286250,
            "range": "± 1211",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 20904,
            "range": "± 191",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 125153,
            "range": "± 437",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1126032,
            "range": "± 9337",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "6e1b1b54a4b0874802a02aedbf009c6d8de2d007",
          "message": "ci(dependabot): grouped monthly updates, with the regex and gluesql 0.20 bumps (#1335)\n\n* ci(dependabot): grouped monthly updates replace the paused weekly config\n\nFleet template (owner decision 2026-11-21); the owner asked for batched\nversion bumps. Replaces the PAUSED config (open-pull-requests-limit 0)\nrather than restoring the old limits.\n\n- 3 entries instead of 6: github-actions, cargo (5 directories, as\n  before), and npm (the 4 npm directories in one `directories:` list).\n- Every entry: monthly on the 1st at 02:00 UTC, at most 2 open PRs,\n  cooldown default-days 7.\n- Groups: the lockstep groups first, unchanged (github-actions-all,\n  wasm-tools-family, wasmtime, spar), then minor-patch. Majors stay\n  ungrouped, one PR each.\n- Both ignores carried over unchanged (@pulseengine/rivet-*,\n  @types/vscode minor/major); they now sit on the merged npm entry.\n\nParsed old against new: no group, ignore or directory dropped; no YAML\nanchors. No multi-ecosystem group: Dependabot documents it with\n`patterns` only and no update-types filter, so it would pull majors\ninto the combined PR. Dependabot's own check run is the parse oracle.\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9\n\n* build(deps): gluesql 0.20 and regex 1.13.2, folded into the grouped config\n\nTakes the cargo bumps from Dependabot #1311 (regex 1.13.1 to 1.13.2),\n#1312 (gluesql-core 0.19 to 0.20) and #1313 (gluesql_memory_storage 0.19\nto 0.20). The two gluesql crates must move together, which is why each\nPR alone failed to build.\n\ngluesql 0.20 made Glue::execute synchronous, so rivet-core/src/sql.rs\ncalls it directly. The three futures::executor::block_on bridges and\nthe optional futures dependency of the sql feature are removed. The lock\ndrops 13 packages (gluesql-utils, async-recursion, futures-enum, syn 1,\nindexmap 1, toml 1.1.2 among them) and adds none.\n\ncargo-vet exemptions move to the new versions of gluesql-core,\ngluesql_memory_storage, regex, regex-automata and regex-syntax.\n\nConfirmed with cargo test -p rivet-core --features sql (11 sql tests),\ncargo test -p rivet-cli --test cli_commands sql (5), cargo vet --locked,\ncargo deny check, cargo clippy --all-targets -D warnings, cargo fmt.\n\nRefs: REQ-229\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9\n\n---------\n\nCo-authored-by: Claude Opus 5.5 <noreply@anthropic.com>",
          "timestamp": "2026-11-25T07:28:51Z",
          "tree_id": "c1c84dddc190f706c5c7babc15cfaf5cae1fdc3a",
          "url": "https://github.com/pulseengine/rivet/commit/6e1b1b54a4b0874802a02aedbf009c6d8de2d007"
        },
        "date": 1795599286407,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 67278,
            "range": "± 882",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 821468,
            "range": "± 16812",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 10807574,
            "range": "± 97866",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1293,
            "range": "± 34",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 16034,
            "range": "± 248",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 375579,
            "range": "± 7810",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 63,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/1000",
            "value": 63,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 63,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 2215849,
            "range": "± 50196",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 144872,
            "range": "± 1365",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1704769,
            "range": "± 44406",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 23509137,
            "range": "± 1232521",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 632208,
            "range": "± 2687",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 15148136,
            "range": "± 532166",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1037144719,
            "range": "± 10864740",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3245,
            "range": "± 49",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 35212,
            "range": "± 714",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 863999,
            "range": "± 8681",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 47585,
            "range": "± 965",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 498700,
            "range": "± 16354",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 6248576,
            "range": "± 259187",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 825,
            "range": "± 12",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 10323,
            "range": "± 63",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 296340,
            "range": "± 2885",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 24376,
            "range": "± 1708",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 146358,
            "range": "± 5887",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1304189,
            "range": "± 20801",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "687f8f5bbb7acf638441b146eca1f7cde3ca7359",
          "message": "ci: the MSRV step names its toolchain, so Dependabot can move its pin (#1339)\n\nThe MSRV job pinned dtolnay/rust-toolchain to d92bbbb0, the head of the\naction's 1.89.0 branch, which selects the toolchain by branch and takes\nno input. The grouped actions update (#1336) moves every rust-toolchain\nSHA to master's head df2a88e9, whose action.yml requires `toolchain`,\nso the MSRV job, which CI Gate needs, would fail on the next Rust\nchange. The step now uses df2a88e9 with `toolchain: 1.89.0`, the same\nshape as every other toolchain step. On main this was the only\nrust-toolchain step without a toolchain input.\n\n\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9\n\nCo-authored-by: Claude Opus 5.5 <noreply@anthropic.com>",
          "timestamp": "2026-11-25T11:46:21Z",
          "tree_id": "7290e65f27448f51a2996edb6e83f1a9d91f3a90",
          "url": "https://github.com/pulseengine/rivet/commit/687f8f5bbb7acf638441b146eca1f7cde3ca7359"
        },
        "date": 1795620533023,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 61062,
            "range": "± 549",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 736621,
            "range": "± 12938",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 9881032,
            "range": "± 79782",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1193,
            "range": "± 9",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 14203,
            "range": "± 177",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 302389,
            "range": "± 14456",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 59,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/1000",
            "value": 59,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 58,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1986803,
            "range": "± 6926",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 125875,
            "range": "± 548",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1539396,
            "range": "± 13571",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 21271221,
            "range": "± 145874",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 554676,
            "range": "± 1656",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 13358480,
            "range": "± 67007",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 831379554,
            "range": "± 6404360",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 2937,
            "range": "± 21",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 32087,
            "range": "± 497",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 768174,
            "range": "± 4277",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 40797,
            "range": "± 171",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 465904,
            "range": "± 2186",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 5804824,
            "range": "± 26355",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 652,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 8866,
            "range": "± 36",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 271416,
            "range": "± 14486",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21668,
            "range": "± 100",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 125738,
            "range": "± 651",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1108927,
            "range": "± 4739",
            "unit": "ns/iter"
          }
        ]
      }
    ]
  }
}