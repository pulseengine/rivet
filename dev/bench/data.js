window.BENCHMARK_DATA = {
  "lastUpdate": 1782194792822,
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
      },
      {
        "commit": {
          "author": {
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
          "id": "2750e9f5fff68fd99a181a5ffc46fbb367fd5cf6",
          "message": "ci: move rivet-core mutation matrix to nightly so it stops saturating runners (#498) (#504)\n\nThe 16-shard rivet-core mutation matrix is non-gating (continue-on-error)\nbut runner-heavy: 16 shards x 45min on the self-hosted lean-mem pool. On\nevery push it saturated the pool, queueing the actual gating jobs (test,\nclippy, mutants-cli) behind it for hours (#498).\n\nSplit the mutation work:\n- mutants-core (rivet-core, 16 shards): now NIGHTLY + manual only via\n  `if: github.event_name == 'schedule' || workflow_dispatch`, with a new\n  `schedule: cron '0 3 * * *'` + `workflow_dispatch:` trigger. Stays\n  non-gating.\n- mutants-cli (rivet-cli, single shard): NEW per-push/PR hard gate\n  (0 surviving mutants, no continue-on-error). Fast enough to stay on the\n  every-push path; preserves mutation coverage on the CLI surface.\n\n`test` is ungated so it runs on schedule too, satisfying both jobs'\n`needs: [test]`. Confirmed with actionlint (clean apart from the\npre-existing custom self-hosted runner-label false positives) and a\nyaml.safe_load parse.\n\nTrace: skip\nRefs: #498\n\nCo-authored-by: Claude Opus 4.8 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-06-06T01:55:40-05:00",
          "tree_id": "0e973e3ac65abe1f221427ded3675cd959877c98",
          "url": "https://github.com/pulseengine/rivet/commit/2750e9f5fff68fd99a181a5ffc46fbb367fd5cf6"
        },
        "date": 1780732764192,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 83949,
            "range": "± 1081",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 890997,
            "range": "± 2815",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12882714,
            "range": "± 942836",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2190,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25824,
            "range": "± 74",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 379125,
            "range": "± 1002",
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
            "value": 1468920,
            "range": "± 24620",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 166186,
            "range": "± 1254",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1968316,
            "range": "± 9856",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 30825043,
            "range": "± 776195",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 449190,
            "range": "± 2985",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 17182359,
            "range": "± 145016",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1406928715,
            "range": "± 32305562",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4463,
            "range": "± 96",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 61168,
            "range": "± 223",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 805653,
            "range": "± 4398",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 62589,
            "range": "± 205",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 714548,
            "range": "± 7717",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8241240,
            "range": "± 97340",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1114,
            "range": "± 10",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 16149,
            "range": "± 59",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 361876,
            "range": "± 5991",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 24156,
            "range": "± 1545",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 168625,
            "range": "± 2172",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1595628,
            "range": "± 18009",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "ecb073a08e2a326f9a6b6bcf0a06a4d3a992399c",
          "message": "fix(init): pre-commit hook runs cargo fmt --check on staged Rust (REQ-210, #438) (#505)\n\n`rivet init --hooks` installed a pre-commit hook that ran only `rivet\nvalidate` — no formatting gate. A misformatted-Rust diff is the most common\nfirst-push CI failure, and AI agents kept hitting it: commit \"passes\"\nlocally, then CI's `cargo fmt --check` job goes red (#438). The fmt-checking\nhook that lives in THIS repo was installed by the dev-only\nscripts/install-hooks.sh, which `rivet init --hooks` does not use — so every\nproject adopting hooks the shipped way got no formatting gate.\n\ncmd_init_hooks now writes a pre-commit hook that runs `cargo fmt --all --\n--check` before `rivet validate`, guarded so it stays language-agnostic:\nthe fmt step runs only when `command -v cargo` succeeds AND the commit\nstages at least one `.rs` file (`git diff --cached … | grep -q '\\.rs$'`).\nNon-Rust rivet projects and cargo-less machines skip it silently and are\nnever blocked. Mirrors scripts/install-hooks.sh. Convenience only; CI is the\nreal gate (REQ-051) and `--no-verify` still bypasses it.\n\nConfirmed with a temp-repo `rivet init --hooks` (generated hook contains the\nfmt step + both guards, passes `bash -n`, preserves the validate step);\ncargo test -p rivet-cli --test cli_commands (127 passed, 0 failed — the full\nsuite); cargo fmt --check + cargo clippy -p rivet-cli --all-targets -- -D\nwarnings (exit 0); rivet validate PASS.\n\nImplements: REQ-210\nRefs: REQ-051\n\nCo-authored-by: Claude Opus 4.8 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-06-06T02:37:54-05:00",
          "tree_id": "2b23fd11dd833c566c4f204740cef8da02bc8598",
          "url": "https://github.com/pulseengine/rivet/commit/ecb073a08e2a326f9a6b6bcf0a06a4d3a992399c"
        },
        "date": 1780733812588,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 77661,
            "range": "± 184",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 944287,
            "range": "± 9074",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13423776,
            "range": "± 538101",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1755,
            "range": "± 130",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 19344,
            "range": "± 32",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 357335,
            "range": "± 1708",
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
            "value": 1365513,
            "range": "± 26571",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 159245,
            "range": "± 310",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1861927,
            "range": "± 32095",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 29598034,
            "range": "± 1749662",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 420065,
            "range": "± 3246",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 14088386,
            "range": "± 242969",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 949773803,
            "range": "± 6493087",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3951,
            "range": "± 11",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 40279,
            "range": "± 134",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 780117,
            "range": "± 7843",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 52775,
            "range": "± 999",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 601429,
            "range": "± 2712",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 6936963,
            "range": "± 440776",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 884,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 11248,
            "range": "± 15",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 306774,
            "range": "± 5038",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22468,
            "range": "± 99",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 160258,
            "range": "± 236",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1519450,
            "range": "± 27825",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "2871c9763da51f150f28102ed2600a47e67f00bc",
          "message": "feat(list): --full emits description/tags/fields in JSON for bulk queries (REQ-211, #506) (#507)\n\nAGENTS.md/CLAUDE.md point agents to `rivet list --format json` for\nmachine-readable queries, but that output is summary-only\n(id/type/title/status/links) across all 917 artifacts — it drops\ndescription/tags/fields. So a bulk query for a field value (e.g. `priority`)\nneeded one `rivet get <ID>` subprocess per artifact or a raw YAML parse\n(#506).\n\nAdd an opt-in `--full` flag: with `--format json`, each entry also carries\ndescription (string), tags (array), and fields (object), matching\n`get <ID> --format json`. Additive — default output is unchanged and\nlist-output.schema.json is `additionalProperties: true`, so no consumer\nbreaks. Inserted before the `--variant` block so a variant's merged `fields:`\nview still wins when both flags are set.\n\nAlso corrects drift in list-output.schema.json: `links` was still typed as an\ninteger count, but the actual output has been an array of {type,target}\nobjects since #358 — the schema now matches, and documents the new optional\n--full keys.\n\nConfirmed with: `rivet list --format json --full` adds the rich keys while\nplain `list` stays summary-only, and --full's `fields` for an id equals\n`get`'s `fields`; cargo test -p rivet-cli --test cli_commands (128 passed,\n0 failed — full suite, incl. the new list_json_full_includes_rich_fields);\ncargo fmt --check + cargo clippy -p rivet-cli --all-targets -- -D warnings\n(exit 0); rivet validate PASS.\n\nImplements: REQ-211\nRefs: REQ-007, #358\n\nCo-authored-by: Claude Opus 4.8 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-06-06T03:47:37-05:00",
          "tree_id": "ee12b93283273d63a9593ff0244bd7092e318418",
          "url": "https://github.com/pulseengine/rivet/commit/2871c9763da51f150f28102ed2600a47e67f00bc"
        },
        "date": 1780738919267,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85095,
            "range": "± 901",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 921342,
            "range": "± 5049",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13357302,
            "range": "± 564846",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1994,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25290,
            "range": "± 59",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 360289,
            "range": "± 1760",
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
            "range": "± 2",
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
            "value": 1442110,
            "range": "± 27936",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 169476,
            "range": "± 4766",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1942068,
            "range": "± 26458",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 28814294,
            "range": "± 378582",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 439233,
            "range": "± 2262",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 18303086,
            "range": "± 129835",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1438771444,
            "range": "± 18531955",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4148,
            "range": "± 18",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 43875,
            "range": "± 271",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 729242,
            "range": "± 4879",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 64309,
            "range": "± 1102",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 722523,
            "range": "± 3951",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8039147,
            "range": "± 40452",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1279,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15245,
            "range": "± 38",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 249506,
            "range": "± 5851",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22083,
            "range": "± 44",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 158340,
            "range": "± 857",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1479105,
            "range": "± 17919",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "23cd6870e0fb33231f5022299bc0994ce8c9728e",
          "message": "feat(schema): `rivet schema presets` lists declarable built-in schemas (REQ-213, #510) (#515)\n\nA user bootstrapping a multi-standard project (DO-178C / ISO 26262 / IEC 61508 /\nEN 50128) found \"no preset for any of the four\" in rivet.yaml. They're all\nembedded and declarable (since before v0.15.0) — but there was no way to\nDISCOVER them: `rivet schema` had list/links/rules/list-json/migrate, nothing\nenumerating the available presets. So the declarable set was undocumented and\nthe user reasonably concluded the schemas didn't exist.\n\n`rivet schema presets` (text + json) now lists every embedded preset with its\nversion, artifact-type count, and description. Needs no project (the user runs\nit before one exists). It reuses the existing `embedded::SCHEMA_NAMES` registry\nvia a new `embedded_schema_names()` accessor — no duplicate list introduced — and\na unit test asserts every listed preset resolves via `embedded_schema` and\nparses, and that the four standards are present.\n\nAlso files REQ-214 (draft, #512): make `release` a first-class queryable field\non requirement-family types.\n\nConfirmed with: `rivet schema presets --format json` in a bare dir lists 21\npresets incl. all four standards; cargo test -p rivet-core (embedded drift test\n+ the four schema_*/docs_/vv_coverage tests that consume SCHEMA_NAMES) and\ncargo test -p rivet-cli --test cli_commands (129 passed, 0 failed — full suite\nincl. the new bare-dir presets test); cargo fmt --all -- --check + cargo clippy\n-p rivet-cli -p rivet-core --all-targets -- -D warnings (exit 0); rivet validate\nPASS.\n\nImplements: REQ-213\nRefs: REQ-007, #510, #512\n\nCo-authored-by: Claude Opus 4.8 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-06-09T16:02:43-05:00",
          "tree_id": "203c9823f5ee008765ec7846b7880e42124af723",
          "url": "https://github.com/pulseengine/rivet/commit/23cd6870e0fb33231f5022299bc0994ce8c9728e"
        },
        "date": 1781039670802,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84765,
            "range": "± 257",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 884482,
            "range": "± 9386",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 15548916,
            "range": "± 578036",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2159,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 27078,
            "range": "± 244",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 388788,
            "range": "± 23760",
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
            "value": 1454756,
            "range": "± 23916",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 166217,
            "range": "± 1104",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1932756,
            "range": "± 17012",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 26699093,
            "range": "± 1076386",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 462152,
            "range": "± 3395",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 17067245,
            "range": "± 103654",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1383275535,
            "range": "± 17002830",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4269,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 58318,
            "range": "± 167",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 728897,
            "range": "± 3764",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 61348,
            "range": "± 1115",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 704042,
            "range": "± 4251",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7659901,
            "range": "± 83212",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1177,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14875,
            "range": "± 207",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 330766,
            "range": "± 1731",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23767,
            "range": "± 146",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 176107,
            "range": "± 1747",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1589556,
            "range": "± 21508",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "c79879a4028327dac76b94b3a3511aab8a9faca6",
          "message": "chore(release-plan): scope v0.16.0 via baseline field + document the convention (#517)\n\nPlans the next release in rivet (release-planning skill). rivet's release field\nis `baseline` (already schema-declared + queryable, 243 artifacts use it); #512's\n\"add a release field\" is answered by documenting this convention rather than\nadding a parallel field.\n\n- Tags the 10 implemented-since-v0.15.0 requirements (REQ-200/201/203/204/205/\n  206/207/208/210/211) with baseline=v0.16.0-track, via a single-pass\n  `rivet modify --where ... --set-field` (verified round-trip: only the baseline\n  line is added, links/provenance preserved).\n- Documents in AGENTS.md that `baseline` IS the release field, the\n  `vX.Y.Z-track` (in progress) -> `vX.Y.Z` (shipped) convention, and that\n  readiness is a query (scope all `verified`, not merely `implemented`).\n\nReadiness now queryable: `rivet list --filter '(= baseline \"v0.16.0-track\")'`\nreturns 10 artifacts, all `implemented`, 0 `verified` -> NOT yet cuttable. The\nV-model gate (verification) is the remaining blocker; CI being offline (#509)\nis what prevents confirming verification, not outstanding dev work. REQ-212\n(traceability gate, PR #513) and REQ-213 (schema presets, PR #515) are also\nv0.16.0 scope and get tagged when those PRs land.\n\nRefs: REQ-007, #512\nTrace: skip\n\nCo-authored-by: Claude Opus 4.8 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-06-09T16:06:54-05:00",
          "tree_id": "2d053c4606207e9c62527658a4b97c897a45224e",
          "url": "https://github.com/pulseengine/rivet/commit/c79879a4028327dac76b94b3a3511aab8a9faca6"
        },
        "date": 1781039891476,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 77218,
            "range": "± 413",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 936068,
            "range": "± 4123",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 15906081,
            "range": "± 828192",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1682,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 19183,
            "range": "± 73",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 351791,
            "range": "± 1064",
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
            "value": 1366341,
            "range": "± 11232",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 159796,
            "range": "± 410",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1877853,
            "range": "± 8612",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 37771827,
            "range": "± 3063830",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 426489,
            "range": "± 14030",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 15436661,
            "range": "± 240329",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 962075908,
            "range": "± 4756692",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3917,
            "range": "± 53",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 40675,
            "range": "± 349",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 739762,
            "range": "± 8505",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 52746,
            "range": "± 302",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 585071,
            "range": "± 1702",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 9084067,
            "range": "± 848998",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 906,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 11669,
            "range": "± 19",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 297551,
            "range": "± 2325",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22360,
            "range": "± 97",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 160657,
            "range": "± 2620",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1518477,
            "range": "± 8160",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "839ead1bee61521894fb62592da84f7327f81855",
          "message": "ci(traceability): gate PRs on rivet validate + commits (REQ-212, part of REQ-051) (#513)\n\nThe project that builds the traceability tool did not gate its own PRs on\ntraceability: ci.yml ran `rivet docs check` but neither `rivet validate` nor\n`rivet commits`. `rivet validate` ran only at release time (release.yml), so a\ngraph error or an untraced code commit could land on main and surface only at\nrelease. Surfaced by the bootstrap-verification audit of rivet-as-tool.\n\nNew `traceability` job in ci.yml:\n- Gate 1: `rivet validate` — exits 1 on ERRORs (broken links, dup ids, bad\n  targets, cardinality); coverage/lint WARNINGS don't fail (default\n  --fail-on error). rivet's own tree PASSes (0 errors, 269 warnings).\n- Gate 2 (pull_request only): `rivet commits --range <base.sha>..HEAD\n  --format json`, fail if `orphans` or `broken_refs` is non-empty. NOT\n  --strict: --strict promotes whole-store \"artifact has no commit coverage\"\n  to errors and so can never pass on a narrow PR range (calibrated: --strict\n  over the 3 clean recent merges still exits 1 on uncovered-artifact\n  findings). The scoped orphan/broken check is the right per-PR gate.\n\nREQ-212 (this job) is implemented and traces to REQ-051. REQ-051 stays draft:\nit additionally needs the job marked a branch-protection REQUIRED check\n(operator action, empty required set tracked in #436) and a `validate\n--check-hooks` flag (not yet implemented) — a running-but-non-blocking gate is\nthe advisory-gate trap #436 describes, so the parent isn't \"implemented\" yet.\n\nConfirmed with: actionlint (clean apart from the pre-existing custom\nself-hosted runner-label false positives); the gate bash tested locally —\npasses on a clean range (orphans=0, broken=0) and fails on a range containing\nthe reverted REQ-209 trailer (broken_refs=2); `rivet validate` PASS.\n\nImplements: REQ-212\nRefs: REQ-051, #436\n\nCo-authored-by: Claude Opus 4.8 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-06-09T16:15:11-05:00",
          "tree_id": "87186a070c1696c51ac8a30ee01d86d68bce15dd",
          "url": "https://github.com/pulseengine/rivet/commit/839ead1bee61521894fb62592da84f7327f81855"
        },
        "date": 1781040335296,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85963,
            "range": "± 413",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 923340,
            "range": "± 4003",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 15011275,
            "range": "± 1728937",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1966,
            "range": "± 16",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25367,
            "range": "± 70",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 355381,
            "range": "± 1747",
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
            "value": 1453380,
            "range": "± 25748",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 168097,
            "range": "± 954",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1942964,
            "range": "± 24027",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 31026732,
            "range": "± 2556081",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 446940,
            "range": "± 3474",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 18279363,
            "range": "± 94943",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1438968067,
            "range": "± 19403508",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4830,
            "range": "± 27",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 43726,
            "range": "± 147",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 736820,
            "range": "± 3451",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 61688,
            "range": "± 471",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 721371,
            "range": "± 2165",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7980680,
            "range": "± 75248",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1289,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14678,
            "range": "± 21",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 239021,
            "range": "± 5807",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21986,
            "range": "± 46",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 155642,
            "range": "± 3083",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1477871,
            "range": "± 17683",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "23b24958f8b310a8aca590d8c148f393d4181863",
          "message": "release(v0.16.0): bump version + finalize CHANGELOG [0.16.0] (#519)\n\nBump workspace version 0.15.0 -> 0.16.0 (Cargo.toml, vscode-rivet/package.json,\nCargo.lock) and add the CHANGELOG [0.16.0] section. Highlights: `rivet schema\npresets` (REQ-213/#510), `list --full` (REQ-211/#506), the CI traceability gate\n(REQ-212/REQ-051), and release planning via the `baseline` field (#512).\n\nrivet validate PASS; rivet docs check PASS (VersionConsistency green — all\nversion files at 0.16.0).\n\nTrace: skip",
          "timestamp": "2026-06-09T16:44:20-05:00",
          "tree_id": "58eef4ad1c54e124caf6b95073e1eac39e555fab",
          "url": "https://github.com/pulseengine/rivet/commit/23b24958f8b310a8aca590d8c148f393d4181863"
        },
        "date": 1781042083308,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84250,
            "range": "± 1126",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 926000,
            "range": "± 11838",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 20537884,
            "range": "± 1258473",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1952,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25189,
            "range": "± 405",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 365629,
            "range": "± 2199",
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
            "range": "± 2",
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
            "value": 1449403,
            "range": "± 24091",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 169265,
            "range": "± 1493",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1934368,
            "range": "± 31359",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 47879825,
            "range": "± 4159280",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 443968,
            "range": "± 19681",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 19151741,
            "range": "± 897929",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1426068828,
            "range": "± 17519694",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4156,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 44921,
            "range": "± 1163",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 773105,
            "range": "± 16160",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 59270,
            "range": "± 1499",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 721393,
            "range": "± 3839",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 10933580,
            "range": "± 1077087",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1120,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15156,
            "range": "± 79",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 232555,
            "range": "± 3605",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22547,
            "range": "± 183",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 156993,
            "range": "± 552",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1480764,
            "range": "± 19987",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "e60a3a99dae0ae3cd5b2600bfe44163b08cac0f3",
          "message": "ci: CI reliability — Miri timeout headroom + Verus on ubuntu-latest (v0.17.0, #509) (#520)\n\n* ci(miri): bump timeout 30→45 so lean-mem contention doesn't fail green runs\n\nThe release-commit CI run went red solely because Miri timed out at 30 min on\nthe self-hosted lean-mem pool while it was contended clearing the #509 outage\nbacklog — every required gate (Format/Clippy/Test/Docs/YAML/Traceability) was\ngreen, and Rocq proofs passed. Miri's own comment already anticipated this\n(\"Revisit once we have a few green runs to set the budget closer to actual\";\nit was previously bumped 15→30 for the same lean-mem slowness).\n\n45 min gives headroom on the lean-mem class without masking a real hang (a\ngenuine UB loop still trips the budget). Does not touch the deliberate\nself-hosted runner choice.\n\nRefs: #509\nTrace: skip\n\n* ci(verus): run on ubuntu-latest with cachix Nix, mirroring the green rocq job\n\nVerus Proofs was perma-red at the \"Install Nix\" step: the no-sudo daemonless\nDeterminateSystems installer (crafted for the self-hosted NoNewPrivileges\nrunner) broke on a version bump and escalated to sudo, which fails there. The\nproofs never even ran. Rocq does the identical Bazel+Nix work on ubuntu-latest\nwith cachix/install-nix-action@v30 and is green.\n\nMove Verus to the same config: ubuntu-latest + cachix installer + nix_path.\nFixes the install, and removes the job's dependency on the self-hosted pool\n(also a #509 resilience win). 16 GB hosted RAM is ample for the rivet Verus\nspecs; the lean-mem RAM headroom is no longer needed. Stays continue-on-error\n(advisory) like rocq.\n\nRefs: #509\nTrace: skip\n\n* docs(artifacts): file REQ-215 — CI-reliability fix (Verus ubuntu-latest, Miri timeout) as v0.17.0 scope\n\nTracks the Miri+Verus CI-reliability fixes in this PR as the first v0.17.0\nscope item (baseline v0.17.0-track), traced to REQ-051 (CI-enforced gates) and\nthe #509 resilience theme.\n\nTrace: skip\n\n* ci(verus): decouple from test job so it runs on the available hosted runner\n\nMirrors rocq (#299): with needs:[test] the ubuntu-latest Verus job sat blocked\nbehind the contended self-hosted rust-cpu test job. Decoupling lets it run\nimmediately on the always-available hosted runner.\n\nRefs: #509\nTrace: skip",
          "timestamp": "2026-06-10T00:27:18-05:00",
          "tree_id": "d414f7c87dfb80b62f35ba87187bb23160f77e06",
          "url": "https://github.com/pulseengine/rivet/commit/e60a3a99dae0ae3cd5b2600bfe44163b08cac0f3"
        },
        "date": 1781069788550,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84083,
            "range": "± 865",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 913787,
            "range": "± 16500",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 18833037,
            "range": "± 823605",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1969,
            "range": "± 74",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24965,
            "range": "± 143",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 360707,
            "range": "± 2618",
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
            "value": 1441677,
            "range": "± 14997",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 168209,
            "range": "± 815",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1927635,
            "range": "± 55904",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 39293795,
            "range": "± 1803502",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 443464,
            "range": "± 5212",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 18759234,
            "range": "± 291687",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1432591072,
            "range": "± 20496906",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4197,
            "range": "± 11",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 43193,
            "range": "± 499",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 726951,
            "range": "± 11335",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 63050,
            "range": "± 1935",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 718820,
            "range": "± 16205",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 10539257,
            "range": "± 520816",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1188,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14608,
            "range": "± 126",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 236806,
            "range": "± 4501",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22529,
            "range": "± 67",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 156833,
            "range": "± 5603",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1488536,
            "range": "± 20293",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "4c51a8bfcf052a4619d8c39fcff04f1be54eb97f",
          "message": "ci(miri): parallelize with cargo-nextest so Miri uses the cores (not 45 min on one) (#521)\n\n* ci(miri): parallelize with cargo-nextest (process-per-test) to use idle cores\n\nMeasured root cause of the 45-min Miri job + lean-mem contention: `cargo miri\ntest` runs ONE Miri process — a single-threaded interpreter — pinning one core\nfor 45 min while the rest of the (ample) box sits idle. The CPU/mem doesn't\nvanish into contention (peak 15 concurrent jobs, ~22s queues); Miri just can't\nuse it, and it hogs the scarce lean-mem runner for 45 min so other lean-mem\njobs queue behind it.\n\nSwitch to `cargo miri nextest run`: each test runs in its own process, so the\nrunner's cores are actually used and wall-time collapses toward the slowest\nsingle test. `--test-threads 4` bounds concurrent Miri processes under the 24G\nshadow-memory ceiling (conservative start; raise after a green run shows peak\nRSS). Same test selection: the libtest `--skip <m>` list is translated to\nnextest's `-E 'not (test(<m>) | ...)'` (verified locally: 721 run / 412\nexcluded, identical modules). Adds a resource-print step so the log shows the\nbox's real nproc/free.\n\nRefs: REQ-215, #509\nTrace: skip\n\n* ci(miri): use 24 of the runner's 32 cores (was 4) — box has 125 GiB, not 24\n\nMeasured the runner directly (the new resource-print step): 32 cores, 125 GiB\nRAM — the \"lean-mem\" label is a misnomer and memory is a non-constraint. At\n--test-threads 4 the parallel Miri job still timed out at 45 min (~678 tests ×\n~20s ÷ 4 ≈ 56 min); 28 of 32 cores sat idle. Raise to 24 threads:\n~226 core-min ÷ 24 ≈ ~9-10 min, using ~72 GiB (well under 125). This is where\nthe CPU/mem was \"vanishing\": into idle cores, because nothing was using them.\n\nRefs: REQ-215, #509\nTrace: skip\n\n* ci(miri): scope PR gate to the unsafe/CST surface; full sweep nightly\n\nCorrection to the earlier \"24 threads thrash\" claim: measured effective\nconcurrency is 23x — parallelism works fine. The real problem is work VOLUME:\nthe 678-test sweep is ~930 test-minutes (mean 104s/test, worst 557s) of mostly\nsafe business logic (regex/glob/HTML) that Miri runs ~100-1000x slower than\nnative and that has no `unsafe` to validate. No thread count fits that in a\nper-PR budget.\n\nSo split it (the #498 nightly pattern):\n- PR/push `miri` → only the real UB surface: the SyntaxKind `transmute`s in the\n  rowan CST parsers (sexpr + yaml_cst), 41 tests, ~3 min. This is what Miri is\n  FOR.\n- nightly/manual `miri-full` → the full Miri-compatible sweep, 24 threads on the\n  125 GiB runner, 90-min budget, off the per-PR path.\n\nRefs: REQ-215, #509\nTrace: skip\n\n* ci(miri): restore -Zmiri-tree-borrows on the scoped job (my regression)\n\nWhen I split Miri into scoped (PR) + full (nightly) I kept MIRIFLAGS on\nmiri-full but dropped it from the scoped job, so it ran under default Stacked\nBorrows and surfaced rowan's thin-token SharedReadOnly zero-size-retag UB —\nwhich I mistakenly reported as a fresh finding. Research (subagent, source-\ngrounded) confirms: rust-analyzer/rowan #210/#211/#212 are all closed UNMERGED\n(upstream is rewriting rowan, not patching); the maintainer holds that rowan\nshould pass Tree Borrows and the failing Stacked Borrows rule is unlikely to\nsurvive Rust's final aliasing model. Our fork pin is sound under Tree Borrows,\nwhich the original job already used.\n\nRestore `MIRIFLAGS: -Zmiri-disable-isolation -Zmiri-tree-borrows` on the scoped\njob (matching miri-full and the pre-split job). Update the rowan pin comment in\nCargo.toml to reflect the closed-unmerged/rewrite reality.\n\nRefs: REQ-215, #509\nTrace: skip\n\n* build(rowan): bump fork pin to v3 (phall1 #212 token+cursor DST) → Miri SB-sound\n\nAdopts phall1's unmerged rust-analyzer/rowan#212 into our fork as\nfix/miri-soundness-v3 (= v2 + `48a1b5e` GreenToken-as-DST + `9e7abd1` cursor SB\nfix). v2 was only sound under Tree Borrows; the residual thin-token\nSharedReadOnly zero-size-retag UB is now fixed, so rivet's rowan parsers are\nsound under BOTH Stacked Borrows and Tree Borrows.\n\n- Cargo.toml: pin branch v2 → v3; comment rewritten to the closed-unmerged /\n  upstream-rewrite reality + the SB-soundness.\n- Cargo.lock: rowan git rev → 9e7abd1.\n- ci.yml: the scoped PR Miri job now gates under STACKED BORROWS (strictest;\n  drop -Zmiri-tree-borrows) since v3 makes it sound. miri-full stays on Tree\n  Borrows for the broader (incl. mutable-path) sweep.\n\nConfirmed: rivet-core builds against v3; native sexpr::/yaml_cst:: tests pass;\nrowan fork v3 builds + carries phall1's miri_node_cache_rehash / miri_cursor_free_sb\nregression tests; actionlint clean.\n\nRefs: REQ-215, #509\nTrace: skip",
          "timestamp": "2026-06-13T02:26:44-05:00",
          "tree_id": "20028d0ece8b63fe0bfb69b11db4e93d7396b565",
          "url": "https://github.com/pulseengine/rivet/commit/4c51a8bfcf052a4619d8c39fcff04f1be54eb97f"
        },
        "date": 1781336329550,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84960,
            "range": "± 511",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 895254,
            "range": "± 4599",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12910741,
            "range": "± 1049870",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2199,
            "range": "± 13",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26769,
            "range": "± 246",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 369342,
            "range": "± 1720",
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
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1481157,
            "range": "± 30211",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 162819,
            "range": "± 721",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1968496,
            "range": "± 36684",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 25101070,
            "range": "± 715603",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 451704,
            "range": "± 2633",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 16539527,
            "range": "± 164481",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1390011700,
            "range": "± 12379170",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4395,
            "range": "± 96",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60558,
            "range": "± 252",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 805143,
            "range": "± 2723",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 59193,
            "range": "± 262",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 696128,
            "range": "± 6003",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7780938,
            "range": "± 204167",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1190,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15383,
            "range": "± 1698",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 327088,
            "range": "± 3972",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 25055,
            "range": "± 187",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 176150,
            "range": "± 1089",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1619261,
            "range": "± 13423",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "01b429799c8fdac8dfba4511a6ade8f06e6c2e34",
          "message": "fix(cli): next-id/add hard-fail when a source file failed to parse (REQ-216, #518) (#527)\n\nA source dropped from the graph by a YAML parse error (merge conflict, manual\nedit, or — pre-REQ-198 — an unquoted-colon title that `rivet add` itself wrote)\nis invisible to the loader. `next-id` then computed the next id against the\nPARTIAL store and handed out an id that collides with the unparsed file's\nartifacts (the #518 report saw five artifacts allocated the same id), and `add`\nexited 0 on the error. One unquoted colon → corrupt file + duplicate ids + a\nbatch that reported success.\n\nRead-only commands may warn-and-continue on a parse-skip; mutating /\nID-allocating commands must REFUSE. Add `ProjectContext::ensure_no_parse_skips`\n(reuses the scan behind `warn_parse_error_skips`) and call it in `cmd_next_id`\nand `cmd_add` after load, before any id is allocated or file written — it bails\nnon-zero with an actionable message pointing at `rivet validate`.\n\nConfirmed with: a temp project with a parse-broken artifacts file — `next-id`\nand `add` now exit non-zero (\"refusing to … parse …\"), clean stores unaffected;\ncargo test -p rivet-cli --test cli_commands (130 passed, incl. the new\nmutating_commands_refuse_on_parse_broken_source); cargo fmt --all -- --check +\ncargo clippy --all-targets -- -D warnings clean; rivet validate PASS.\n\nImplements: REQ-216\nRefs: #518, #353\n\nCo-authored-by: Claude Opus 4.8 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-06-14T01:28:29-05:00",
          "tree_id": "938d6e8f0e261ec3657002a95c69ff1511687cba",
          "url": "https://github.com/pulseengine/rivet/commit/01b429799c8fdac8dfba4511a6ade8f06e6c2e34"
        },
        "date": 1781419678711,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85643,
            "range": "± 972",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 931996,
            "range": "± 6123",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 15297564,
            "range": "± 914876",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1932,
            "range": "± 10",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24959,
            "range": "± 55",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 373880,
            "range": "± 1491",
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
            "value": 1483038,
            "range": "± 143546",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 167014,
            "range": "± 1165",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1970335,
            "range": "± 33338",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 31405010,
            "range": "± 5987943",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 444355,
            "range": "± 2079",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 16878995,
            "range": "± 150164",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1295985273,
            "range": "± 17357160",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4159,
            "range": "± 13",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 44845,
            "range": "± 109",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 755022,
            "range": "± 5947",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 64859,
            "range": "± 222",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 741406,
            "range": "± 9811",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8547089,
            "range": "± 692197",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1252,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14916,
            "range": "± 28",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 236907,
            "range": "± 5407",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23810,
            "range": "± 336",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 165049,
            "range": "± 610",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1566643,
            "range": "± 20471",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "abb1e241af58d8b6d073dc9820cc4da84081f37f",
          "message": "fix(variant): check --variant accepts the wrapped form init scaffolds (REQ-217, #514) (#528)\n\n`rivet variant init <name>` scaffolds a feature-model-bindings file\n(`variant: { name, selects }` + `bindings:`) and prints\n`rivet variant check --variant bindings/<name>.yaml` as the next step — but\n`check` parsed `--variant` strictly as the flat `VariantConfig`\n(`name:`/`selects:` at top level), rejecting init's own output with\n`missing field 'name'`. The scaffold and the checker disagreed.\n\n`VariantConfig::from_yaml_str` now accepts EITHER form: flat, or the\n`variant:`-wrapped bindings form (extract the `variant:` block; `bindings:` is\nignored for a selection check). Wired into all six `--variant`/variant-file\nparse sites (check, check-all, list --variant, resolve_variant_arg). Malformed\nconfigs still error.\n\nConfirmed with: `rivet variant init kiln` then the exact check command it\nprints now exits PASS; a flat variant file still checks; new\n`variant_config_accepts_flat_and_wrapped_forms` unit test (flat + wrapped +\nmalformed); cargo test -p rivet-core (55 feature_model) + -p rivet-cli --test\ncli_commands (130 passed); cargo fmt --check + cargo clippy --all-targets --\n-D warnings clean; rivet validate PASS.\n\nImplements: REQ-217\nRefs: #514\n\nCo-authored-by: Claude Opus 4.8 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-06-14T01:36:14-05:00",
          "tree_id": "6216b9638a1431c3cddc93cacf7e803f1acef8bc",
          "url": "https://github.com/pulseengine/rivet/commit/abb1e241af58d8b6d073dc9820cc4da84081f37f"
        },
        "date": 1781420443201,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84922,
            "range": "± 383",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 902116,
            "range": "± 15294",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14814917,
            "range": "± 899019",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2124,
            "range": "± 27",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26491,
            "range": "± 213",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 394573,
            "range": "± 1807",
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
            "value": 1457242,
            "range": "± 10652",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 161568,
            "range": "± 2045",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1912277,
            "range": "± 19849",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 28915756,
            "range": "± 1914539",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 435955,
            "range": "± 2953",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 17577670,
            "range": "± 273282",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1470697289,
            "range": "± 12154221",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4351,
            "range": "± 13",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 62403,
            "range": "± 372",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 749811,
            "range": "± 4502",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 59683,
            "range": "± 229",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 692623,
            "range": "± 5374",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7891503,
            "range": "± 350700",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1200,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15199,
            "range": "± 218",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 330344,
            "range": "± 3623",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 25175,
            "range": "± 174",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 175645,
            "range": "± 1568",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1610911,
            "range": "± 9754",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "b3bec521dd466d06377dd49f92aed4fea514b3c3",
          "message": "release(v0.16.1): bump version + CHANGELOG [0.16.1] (#529)\n\nPatch release for downstream (gale) waiting on the #514 + #518 fixes:\n- REQ-216 / #518 — next-id/add hard-fail on a parse-broken source (no silent\n  skip → duplicate-ID corruption).\n- REQ-217 / #514 — `variant check --variant` accepts the wrapped form\n  `variant init` scaffolds (init→check happy path).\n\nBump workspace version 0.16.0 -> 0.16.1 (Cargo.toml, vscode-rivet/package.json,\nCargo.lock). rivet validate PASS; rivet docs check PASS (VersionConsistency\ngreen — all version files at 0.16.1). The 0.16.0 canonical-status-enum\nregression (#522) is tracked separately (#525, not in this patch).\n\nTrace: skip",
          "timestamp": "2026-06-14T01:46:44-05:00",
          "tree_id": "3ff2d58ad542b5b01423c62a69fdc2728a2bee55",
          "url": "https://github.com/pulseengine/rivet/commit/b3bec521dd466d06377dd49f92aed4fea514b3c3"
        },
        "date": 1781422351093,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 89888,
            "range": "± 304",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 965811,
            "range": "± 5814",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 15210301,
            "range": "± 787959",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1938,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25065,
            "range": "± 182",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 364291,
            "range": "± 2364",
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
            "value": 1437000,
            "range": "± 16283",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 168902,
            "range": "± 873",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1915004,
            "range": "± 11651",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 29028776,
            "range": "± 1522467",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 445527,
            "range": "± 1304",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 17854078,
            "range": "± 102102",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1413614650,
            "range": "± 20973905",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4274,
            "range": "± 15",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 44503,
            "range": "± 124",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 725036,
            "range": "± 5353",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 65111,
            "range": "± 150",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 717794,
            "range": "± 2374",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8251502,
            "range": "± 291627",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1278,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15717,
            "range": "± 31",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 237599,
            "range": "± 3649",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23836,
            "range": "± 81",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 173875,
            "range": "± 495",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1618518,
            "range": "± 20728",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "6b160cf57cf2571dfe819f66bd466cf2de41763e",
          "message": "fix(next-id): honor IDs claimed in git history, never reissue a burned ID (REQ-218, #479) (#531)\n\n`next-id`/`add` allocated the next ID from the working tree only, so a\nreverted commit or an in-flight branch would silently reissue an ID already\nclaimed elsewhere — two artifacts, same ID. Reproduced in-tree: REQ-209 was\nclaimed, reverted (#502), and reallocated against a divergent definition.\nDistinct from #422 (textual EOF conflicts): this is logical ID collision even\nwhen the artifacts live in different files and never textually conflict.\n\nAllocation now also considers IDs claimed in git history. rivet-core gains\n`mutate::next_id_considering(store, prefix, extra_ids)` (IO-free; raises the\nfloor from supplied IDs, keeps the store's zero-pad width); `next_id` is a thin\nwrapper. The CLI harvests `{prefix}-N` from `git log --all`, counting an ID only\nin an allocation context — a traceability trailer line or a parenthetical\nsubject tag — so free-prose mentions (`REQ-001 → REQ-999`) never poison\nallocation. A skip past the tree maximum prints a stderr note. Best-effort and\noverridable: outside a git repo, or with `RIVET_NEXTID_NO_GIT=1`, behavior\nfalls back to the working tree only (REQ-051 hook/CI model).\n\nConfirmed with `cargo test -p rivet-core mutate::tests` and `-p rivet-cli\n--test cli_commands next_id` green, `cargo fmt --check` + `cargo clippy\n--all-targets -- -D warnings` clean, and `rivet validate` PASS.\n\nImplements: REQ-218\nVerifies: REQ-031\nRefs: REQ-007\n\nCo-authored-by: Claude Opus 4.8 <noreply@anthropic.com>",
          "timestamp": "2026-06-14T06:01:58-05:00",
          "tree_id": "5bf01019016326a3664907efab4f01b4da4fdea4",
          "url": "https://github.com/pulseengine/rivet/commit/6b160cf57cf2571dfe819f66bd466cf2de41763e"
        },
        "date": 1781437384057,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84187,
            "range": "± 670",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 920356,
            "range": "± 4360",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14304074,
            "range": "± 630865",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1958,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 23295,
            "range": "± 49",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 355023,
            "range": "± 1402",
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
            "value": 1442911,
            "range": "± 22353",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 168898,
            "range": "± 1193",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1963180,
            "range": "± 15309",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 28212858,
            "range": "± 293661",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 435025,
            "range": "± 8450",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 16877749,
            "range": "± 379316",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1312755547,
            "range": "± 18658962",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4207,
            "range": "± 31",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 45348,
            "range": "± 269",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 792853,
            "range": "± 3440",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 58730,
            "range": "± 376",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 728985,
            "range": "± 3195",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8215840,
            "range": "± 170211",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1165,
            "range": "± 27",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15248,
            "range": "± 103",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 232848,
            "range": "± 5826",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 24216,
            "range": "± 286",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 173021,
            "range": "± 1172",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1637286,
            "range": "± 26619",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "ae491f9ca4d822f4b76dfe71be5df9cbe5502905",
          "message": "docs(npm): make npm/npx a first-class install path; sync stale package versions (#533)\n\nThe npm channel is live and current (`npm view @pulseengine/rivet` = 0.16.1,\nauto-published by release-npm.yml after each release), but the repo made it\nlook abandoned: the README buried it under a comment, the curl example was\npinned to v0.5.0 with a wrong asset name, and the committed npm/platform\npackage.json versions sat at 0.9.0/0.4.1.\n\n- README Install: list npm/npx first as the zero-toolchain path; fix the\n  release-tarball example to the real `rivet-vX.Y.Z-<target>` asset naming.\n- Bump committed `npm/package.json` (+ optionalDependencies) and\n  `platform-packages/*/package.json` to 0.16.1 so the repo stops looking\n  stale. (release-npm.yml overwrites these at publish time regardless.)\n- RELEASING.md: document which version locations are authoritative vs\n  workflow-managed, so a future stale value isn't mistaken for a broken\n  channel.\n\nConfirmed with a cold `npx -y @pulseengine/rivet@0.16.1 --version` (prints\n`rivet 0.16.1`) and `rivet docs check` PASS.\n\nTrace: skip\n\nCo-authored-by: Claude Opus 4.8 <noreply@anthropic.com>",
          "timestamp": "2026-06-14T06:43:59-05:00",
          "tree_id": "0ba1ae4408b4a8b088199a6c6ce5e22b5f08497f",
          "url": "https://github.com/pulseengine/rivet/commit/ae491f9ca4d822f4b76dfe71be5df9cbe5502905"
        },
        "date": 1781438621237,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84149,
            "range": "± 422",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 904316,
            "range": "± 4550",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13377242,
            "range": "± 351572",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2150,
            "range": "± 17",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25802,
            "range": "± 166",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 368460,
            "range": "± 1980",
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
            "value": 1454925,
            "range": "± 27199",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 165778,
            "range": "± 771",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1898639,
            "range": "± 11075",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 24873637,
            "range": "± 1342585",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 465878,
            "range": "± 2249",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 17278123,
            "range": "± 173846",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1479510954,
            "range": "± 15030574",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4381,
            "range": "± 15",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 62598,
            "range": "± 211",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 759929,
            "range": "± 8011",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 61905,
            "range": "± 316",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 698073,
            "range": "± 4855",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7526199,
            "range": "± 312852",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1216,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15849,
            "range": "± 185",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 324746,
            "range": "± 3497",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 25367,
            "range": "± 326",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 187967,
            "range": "± 1459",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1708159,
            "range": "± 14929",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "18db3e93bc7de7a68dc51565b640041a95fd1b11",
          "message": "feat(cli): minimal --no-default-features build excludes serve+MCP+LSP stack (REQ-202, #456) (#534)\n\n`rivet validate`/`list`/`commit-msg-check` are the hook- and CI-critical hot\npath, but every from-source build compiled the whole axum+rmcp+lsp tree. Now\nrivet-cli gates that behind cargo features, all kept in `default` so the\npublished binary is byte-for-byte unchanged.\n\nFeatures (rivet-cli/Cargo.toml):\n- default = [\"serve\", \"mcp\", \"lsp\"]; deps axum/tower-http/notify/tokio/rmcp/\n  lsp-server/lsp-types marked optional via `dep:`.\n- serve embeds an MCP HTTP endpoint (crate::mcp::RivetServer) -> serve ⊇ mcp.\n- the shared HTML renderer (crate::render) + its component/context types live\n  in the serve module and are reused by the LSP hover-preview -> lsp ⊇ serve,\n  and the HTML-rendering commands (export --format html, snapshot, embed) are\n  serve-gated too. The minimal build keeps reqif/gherkin/zola/generic-yaml/json\n  export and refuses --format html with a clear \"rebuild with --features serve\"\n  message. Fully decoupling render from serve is follow-up #104.\n\nGating: #[cfg(feature=...)] on the mod decls (mcp/serve/render), the Serve/Mcp/\nLsp/Snapshot/Embed command variants + dispatch arms, the inline cmd_lsp + lsp_*\nhelpers + lsp_tests, cmd_mcp, and the export/snapshot/embed handlers and their\nserve-only helpers.\n\nCI: a `cargo clippy -p rivet-cli --no-default-features -- -D warnings` step in\nthe Clippy job guards the minimal build from silently rotting.\n\nConfirmed: `cargo build/clippy -p rivet-cli --no-default-features` clean (and\n`-e normal` cargo tree shows none of axum/rmcp/lsp-server/tokio/tower-http/\nnotify in the binary); default `cargo clippy --all-targets -- -D warnings`,\n`cargo fmt --check`, `cargo test -p rivet-cli --test cli_commands` (130) and\nthe bin lsp_tests all pass; the minimal binary runs validate (PASS) and reqif\nexport (2 artifacts); `rivet validate` PASS.\n\nImplements: REQ-202\nRefs: REQ-007\n\nCo-authored-by: Claude Opus 4.8 <noreply@anthropic.com>",
          "timestamp": "2026-06-14T07:13:44-05:00",
          "tree_id": "eb407f9e26a5f70e9d367707dbc76d019743abb7",
          "url": "https://github.com/pulseengine/rivet/commit/18db3e93bc7de7a68dc51565b640041a95fd1b11"
        },
        "date": 1781439755145,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85331,
            "range": "± 216",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 926974,
            "range": "± 4344",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 16021748,
            "range": "± 1685434",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1950,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25015,
            "range": "± 191",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 374557,
            "range": "± 2036",
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
            "value": 1454241,
            "range": "± 11264",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 168787,
            "range": "± 1174",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1919010,
            "range": "± 24086",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 31276344,
            "range": "± 2891948",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 441214,
            "range": "± 1778",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 16685518,
            "range": "± 139267",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1307346895,
            "range": "± 24259859",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4208,
            "range": "± 54",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 43785,
            "range": "± 554",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 753533,
            "range": "± 3743",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 62649,
            "range": "± 331",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 726070,
            "range": "± 5995",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8281272,
            "range": "± 354079",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1287,
            "range": "± 34",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15430,
            "range": "± 33",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 231524,
            "range": "± 6908",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 24488,
            "range": "± 72",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 172415,
            "range": "± 710",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1633443,
            "range": "± 10154",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "6f2df499df302631de60f989bcd2bbc578a6e8e7",
          "message": "ci: move mutants-cli off lean-mem to rust-cpu (#523) (#526)\n\n`mutants-cli` (`Mutation Testing (rivet-cli)`) was running on every PR and\npush pinned to the 4-runner `lean-mem` pool — the one runner class with no\nspare capacity. A 14-day audit of the self-hosted fleet showed it as the\nsingle largest consumer of that pool (488 instances), and as a direct\nconsequence Miri (~17 h median wait, 43% fail rate) and Verus (~18 h\nmedian wait, 94% fail rate) were starving against `cancel-in-progress`\nPR-push churn while `rust-cpu` sat 86% idle.\n\nThe fix is a one-line runner-pool change: `rivet-cli` is the small crate\nrunning `--jobs 2` with `--timeout 30`; the `rust-cpu` class (16 G\n`MemoryHigh`, 7 runners) handles it without contention. Per-PR mutation\ncoverage is preserved, no cadence change is needed, and `lean-mem` is\nfreed up for the genuinely RAM-bound gating jobs (Miri, Verus) plus the\nnightly `mutants-core` fan-out.\n\nAlso extends the surrounding comment block to document why this pool\nchoice matters so future drift doesn't quietly re-pin to `lean-mem`.\n\nThe post-merge bullet of the issue's Acceptance (\"lean-mem median job\nwait drops back under a few minutes\") can only be confirmed by operator\nobservation against the runner pool after this lands; the in-repo bullet\n(\"mutants-cli no longer runs on lean-mem\") is the diff itself.\n\nNote: the pulseengine.eu/blog/ workflow guidance was HTTP 503 throughout\nthis triage run (same symptom carried across #420 / #516 / #522 / …), so\nthis PR ships as a draft for maintainer review against the authoritative\nprocess posts once the blog is reachable.\n\nRefs: #523, #509\n\nCo-authored-by: Claude <noreply@anthropic.com>",
          "timestamp": "2026-06-14T08:12:55-05:00",
          "tree_id": "9754cb4547a349e818924df1e4dda8e37ee91008",
          "url": "https://github.com/pulseengine/rivet/commit/6f2df499df302631de60f989bcd2bbc578a6e8e7"
        },
        "date": 1781443613350,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85484,
            "range": "± 390",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 932169,
            "range": "± 6995",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 17266485,
            "range": "± 1381825",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1928,
            "range": "± 84",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25109,
            "range": "± 634",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 362534,
            "range": "± 3499",
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
            "value": 1476966,
            "range": "± 31066",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 168949,
            "range": "± 3958",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1942019,
            "range": "± 21991",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 33204552,
            "range": "± 3629329",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 438593,
            "range": "± 2328",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 17183630,
            "range": "± 188801",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1333393619,
            "range": "± 19620130",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4263,
            "range": "± 67",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 45943,
            "range": "± 682",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 774084,
            "range": "± 13802",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 59563,
            "range": "± 553",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 723227,
            "range": "± 2316",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7706894,
            "range": "± 205227",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1277,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14424,
            "range": "± 259",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 248042,
            "range": "± 7601",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 24045,
            "range": "± 70",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 172872,
            "range": "± 6049",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1646018,
            "range": "± 41579",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "fa1b8edc17b28e350c949a8e7c25a5caac15f4de",
          "message": "fix(schema): restore `accepted` to canonical status enum (#522) (#525)\n\nv0.16.0 declared the canonical status lifecycle in common.yaml (REQ-162,\nPR #419) but dropped `accepted` — the documented terminal state for\n`design-decision` / `external-anchor` / requirement-meta artifacts.\nDownstream stores that followed the documented chain\n(`... -> verified -> accepted`) flipped from PASS to FAIL on the\n0.15 -> 0.16 bump with no migration path; the jess hardware-integration\nstore hit 12 of 21 errors from this alone.\n\nRe-add `accepted` to the canonical enum and document its terminal role\nin the inline schema comment so the published lifecycle and the\nvalidator agree again. The `status-allowed-values` guard still fires on\ngenuinely typo'd values — covered by the new regression test\n`common_status_accepts_accepted_and_still_rejects_typos`, which also\nasserts via `Schema::base_fields` that the introspection surface and\nthe diagnostic see the same set.\n\nSlice 2 of #522 only. Out of scope (filed separately): slice 1\n(`rivet migrate` / `validate --fix` status remap with default-mapping\npolicy for `open` / `resolved` in `ai-found-defect`); slice 3\n(per-schema status enums so `ai-found-defect` can keep its\n`open`/`triaged`/`resolved` triage vocabulary distinct from the\ndocument lifecycle).\n\nNote: the pulseengine.eu/blog/ workflow guidance was 503 throughout\nthis run (carried symptom flagged across the recent triage threads on\n#420, #522, #516, …), so this PR ships as a draft for maintainer review\nagainst the authoritative process posts once the blog is reachable.\n\nFixes: REQ-162\nRefs: #352, #419, #522\n\nCo-authored-by: Claude <noreply@anthropic.com>",
          "timestamp": "2026-06-14T08:13:18-05:00",
          "tree_id": "5084cd64d9b94436d83467ecd2c445717da1d333",
          "url": "https://github.com/pulseengine/rivet/commit/fa1b8edc17b28e350c949a8e7c25a5caac15f4de"
        },
        "date": 1781443804207,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84643,
            "range": "± 485",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 890053,
            "range": "± 2621",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12629618,
            "range": "± 790621",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2202,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25956,
            "range": "± 144",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 357366,
            "range": "± 888",
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
            "value": 92,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1448897,
            "range": "± 27055",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 167396,
            "range": "± 1335",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1894516,
            "range": "± 21581",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 24416657,
            "range": "± 1961916",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 459165,
            "range": "± 1402",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 17356080,
            "range": "± 171338",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1469807040,
            "range": "± 19050361",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4424,
            "range": "± 16",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 58336,
            "range": "± 250",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 739218,
            "range": "± 1820",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 62880,
            "range": "± 297",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 714132,
            "range": "± 18091",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7762258,
            "range": "± 177998",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1171,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15122,
            "range": "± 66",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 340862,
            "range": "± 2540",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 24980,
            "range": "± 135",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 179397,
            "range": "± 2194",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1716906,
            "range": "± 17156",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "8dae100f593898c60f9aa5b281fc6195a19cbfe9",
          "message": "feat(init): --vendor-schemas pins built-in schemas on-disk against upgrades (REQ-220, #431) (#537)\n\nA project that lists only built-in schema names validates against whatever\nschema definitions are compiled into the installed rivet binary (the loader\nprefers on-disk, else the embedded copy). So every release that tightens a\nbuilt-in schema silently changes validation for embedded-schema consumers — the\nsame `rivet validate` that passed now flags unchanged artifacts.\n\n`rivet init --vendor-schemas` writes the resolved schema set (the names in\n`schemas:` plus auto-discovered bridges) from the binary's embedded copies into\nthe project's `schemas/<name>.yaml`. Because the loader prefers on-disk, the\nvendored set is committed to the project's git and immune to release-to-release\nrule drift. Vendoring never overwrites an existing schema file.\n\nConfirmed: `rivet init --preset aspice --vendor-schemas` writes common.yaml +\naspice.yaml, and `rivet validate` then reports them `(on-disk)` and PASSes; a\nlocally-edited vendored schema survives a re-vendor. New\n`init_vendor_schemas_pins_schemas_on_disk` test; `cargo test -p rivet-cli\n--test cli_commands` 132 pass; clippy --all-targets + fmt clean; rivet validate PASS.\n\nOut of scope (separate slice): a rivet.yaml expected-version pin with a\nvalidate-time drift diagnostic; `rivet schema vendor` for existing projects.\n\nImplements: REQ-220\nRefs: REQ-010\n\nCo-authored-by: Claude Opus 4.8 <noreply@anthropic.com>",
          "timestamp": "2026-06-16T13:56:21-05:00",
          "tree_id": "3723b28c82230c9866da4db8da1cff9a56f74ff3",
          "url": "https://github.com/pulseengine/rivet/commit/8dae100f593898c60f9aa5b281fc6195a19cbfe9"
        },
        "date": 1781636909246,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84302,
            "range": "± 409",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 902769,
            "range": "± 3491",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 17265026,
            "range": "± 903530",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2204,
            "range": "± 12",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25416,
            "range": "± 126",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 384395,
            "range": "± 7335",
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
            "value": 92,
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
            "value": 1463814,
            "range": "± 22846",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 165544,
            "range": "± 832",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1938877,
            "range": "± 17995",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 34358342,
            "range": "± 4725016",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 455340,
            "range": "± 3591",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 18108401,
            "range": "± 643205",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1505490537,
            "range": "± 21226667",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4336,
            "range": "± 16",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60375,
            "range": "± 1089",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 777047,
            "range": "± 7173",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 64149,
            "range": "± 274",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 721146,
            "range": "± 5043",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 11916247,
            "range": "± 878543",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1294,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15626,
            "range": "± 68",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 353232,
            "range": "± 1620",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 25004,
            "range": "± 222",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 181121,
            "range": "± 3542",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1718568,
            "range": "± 59604",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "55339e1c4f2b4c936b37175c70102fb9a92cb2ed",
          "message": "fix(deps): bump wasmtime 43 -> 44.0.3 for RUSTSEC-2026-0182 (#542)\n\nThe Security Audit gate went red repo-wide (main + every open PR): a new\nadvisory, RUSTSEC-2026-0182, flags a WASIp1 `fd_renumber` resource leak in\n`wasmtime-wasi`, fixed in 44.0.3 / 45.0.2. rivet's only wasmtime consumer is\nrivet-core/src/wasm_runtime.rs (the compose-witness component runner), so the\nexposure is a trusted first-party component, but the clean fix is the bump.\n\n44.0.3 is the smallest fixed range (one major bump). rivet-core compiles\nunchanged against the new API; `cargo audit` is clean afterward (no\nvulnerabilities; only the pre-existing allowed `instant` unmaintained warning\nvia notify remains). Cranelift moves 0.130 -> 0.131 transitively.\n\nConfirmed with `cargo build -p rivet-core`, `cargo test -p rivet-core` green,\nand `cargo audit` reporting 0 vulnerabilities.\n\nTrace: skip\n\nCo-authored-by: Claude Opus 4.8 <noreply@anthropic.com>",
          "timestamp": "2026-06-18T00:04:14-05:00",
          "tree_id": "d13771e494d8ae8c5027ddeda4bdf11f3809d3d8",
          "url": "https://github.com/pulseengine/rivet/commit/55339e1c4f2b4c936b37175c70102fb9a92cb2ed"
        },
        "date": 1781759601795,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84155,
            "range": "± 392",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 891144,
            "range": "± 7155",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 15377947,
            "range": "± 880390",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2125,
            "range": "± 10",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25145,
            "range": "± 756",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 342957,
            "range": "± 1675",
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
            "value": 92,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1447833,
            "range": "± 29478",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 162380,
            "range": "± 1568",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1865989,
            "range": "± 18738",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 24402470,
            "range": "± 1046285",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 442624,
            "range": "± 1796",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 16878955,
            "range": "± 468928",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1474072644,
            "range": "± 13795786",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4294,
            "range": "± 16",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 58919,
            "range": "± 258",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 733051,
            "range": "± 2373",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 60251,
            "range": "± 408",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 687219,
            "range": "± 2056",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7563354,
            "range": "± 351009",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1320,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15322,
            "range": "± 52",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 336739,
            "range": "± 6854",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 25303,
            "range": "± 393",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 180535,
            "range": "± 2861",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1724594,
            "range": "± 14916",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "01f297641f38545ab70112a43acc2151330ea2ec",
          "message": "feat(check): add `rivet check docs` oracle with --format json + --strict (#540) (#541)\n\nEnumerates every candidate path the doc scanner considered, tagging\neach `loaded` / `skipped (<reason>)` / `excluded (<glob>)`. Mirrors the\nexisting oracle pattern (`rivet check sources` / `bidirectional` /\n`gaps_json`) — narrow, mechanical, scriptable. Default output is human\ntext; `--format json` emits the canonical `{oracle,entries,total,\nby_status}` envelope for pipeline consumers. `--strict` exits non-zero\nwhen any entry is `skipped` (explicit `excluded` allowlist matches do\nnot trip strict).\n\nReuses the existing `load_documents_with_report` iteration verbatim\nvia a new `scan_documents(dir, exclude) -> Vec<ScannedDoc>` that\nreturns per-path detail instead of emitting stderr warnings — the\nwarning-printing path is left untouched, so `rivet validate`'s output\nis byte-identical.\n\nTests: `rivet-cli/tests/docs_check.rs` covers the four fixture cases\n(loaded / no-frontmatter / missing-id frontmatter / excluded-by-glob),\nthe strict exit-code branches in both directions, and the human-text\nshape.\n\nCloses #540.\n\nImplements: REQ-007\nRefs: REQ-004\n\nCo-authored-by: Claude <noreply@anthropic.com>",
          "timestamp": "2026-06-18T00:38:00-05:00",
          "tree_id": "94d2b70921cd88942c627588ef7c0e071bf6a258",
          "url": "https://github.com/pulseengine/rivet/commit/01f297641f38545ab70112a43acc2151330ea2ec"
        },
        "date": 1781761804961,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84045,
            "range": "± 551",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 884828,
            "range": "± 6575",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 15798442,
            "range": "± 935156",
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
            "value": 26178,
            "range": "± 934",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 349901,
            "range": "± 1266",
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
            "value": 93,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1449141,
            "range": "± 25633",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 166894,
            "range": "± 1331",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1945083,
            "range": "± 13264",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 28271838,
            "range": "± 4035197",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 464535,
            "range": "± 2195",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 16755560,
            "range": "± 171090",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1420902652,
            "range": "± 11200892",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4413,
            "range": "± 19",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 57683,
            "range": "± 400",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 729901,
            "range": "± 3077",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 59741,
            "range": "± 304",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 701361,
            "range": "± 3016",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7734424,
            "range": "± 543928",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1101,
            "range": "± 9",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14964,
            "range": "± 612",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 339107,
            "range": "± 1146",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23939,
            "range": "± 119",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 171451,
            "range": "± 1456",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1617923,
            "range": "± 20847",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "b16bb9cfc8ec206b663f65212c34bcdd0fd40cb4",
          "message": "fix(variants): skip feature-model binding files in load_variant_configs_from_dir (#532) (#539)\n\n`rivet validate` globs every `*.yaml` in `artifacts/variants/` and parses each\nas a flat single-variant config (which requires a top-level `name:`). When a\nfeature-model binding file (the natural co-location: `bindings:` map + optional\n`variants:` list, the `FeatureBinding` shape) lives in that directory beside\nthe single-variant configs it binds, the parse fails and the CLI prints\n\n    warning: failed to load variant configs from ./artifacts/variants:\n      Schema error: parsing variant config ./artifacts/variants/bindings.yaml:\n      missing field `name` at line 18 column 1\n\n— benign (validate still PASSes) but noise any product-line consumer that\nco-locates its binding file hits.\n\n`load_variant_configs_from_dir` now peeks each file as `serde_yaml::Value`\nbefore the typed parse and silently skips files whose top-level shape is a\nbinding file (a `bindings:` key with no `name:` or `variant:` sibling — the\ndiscriminator excludes the flat single-variant form and the `variant:`-wrapped\nform `rivet variant init` writes per #514, so the wrapped form's existing parse\npath still fires). Unparseable YAML still surfaces an error through the\nexisting parse path.\n\nConfirmed: built the binary, reproduced the issue's exact directory layout\n(sem-m3-gcc.yaml + sem-smp-x86.yaml + bindings.yaml with variants/bindings\ntop-level keys), and `rivet validate` now reports `Result: PASS (0 warnings)`\nwith no mention of bindings.yaml. Two new tests: one for the binding-file skip\non the issue's repro shape, one regression guard that the `variant:`-wrapped\nform is NOT absorbed by the skip. All 57 feature_model unit tests + 8\nvariant_phase2 integration tests pass; `cargo clippy --all-targets -- -D warnings`\nand `cargo fmt --all -- --check` clean.\n\nCloses #532.\n\nFixes: REQ-004\n\nCo-authored-by: Claude <noreply@anthropic.com>",
          "timestamp": "2026-06-18T00:38:29-05:00",
          "tree_id": "ae8d832cdc39edc12c4c7c58d35533f497add340",
          "url": "https://github.com/pulseengine/rivet/commit/b16bb9cfc8ec206b663f65212c34bcdd0fd40cb4"
        },
        "date": 1781761821656,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85593,
            "range": "± 383",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 884757,
            "range": "± 6984",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 11992259,
            "range": "± 330805",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2154,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25615,
            "range": "± 271",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 368147,
            "range": "± 9034",
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
            "value": 95,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1450642,
            "range": "± 9029",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 162068,
            "range": "± 1383",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1960624,
            "range": "± 14067",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 23292879,
            "range": "± 265687",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 464870,
            "range": "± 2641",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 17313985,
            "range": "± 111447",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1479842395,
            "range": "± 114966997",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4271,
            "range": "± 12",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60328,
            "range": "± 494",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 742159,
            "range": "± 2250",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 62105,
            "range": "± 1581",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 684246,
            "range": "± 1763",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7395969,
            "range": "± 47586",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1207,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15283,
            "range": "± 219",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 329413,
            "range": "± 5478",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 24532,
            "range": "± 86",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 177912,
            "range": "± 1590",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1714626,
            "range": "± 18472",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "a32a02b62d6de27edc1705b2f196dc318417f97f",
          "message": "ci: add runner-liveness alert for the self-hosted pool (#509 slice 1) (#536)\n\nEvery gating job runs on `[self-hosted, …]`, so when the pool goes offline every\ngate queues forever with no fallback and no alarm — the multi-day outage in #509\nwas invisible until noticed by hand. This GitHub-hosted workflow (ubuntu-latest,\nso it fires even when the pool is down) polls on a 15-min schedule + dispatch and\nraises a durable tracking issue instead of a transient red badge.\n\nSignals: (1) queued-run age > QUEUE_THRESHOLD_MINUTES (default 30) is the\nauthoritative alarm — needs only actions:read and is agnostic to repo-vs-org\nrunner registration; (2) the runner-list check is best-effort and self-skips,\nsince listing self-hosted runners needs the `administration` scope that\nGITHUB_TOKEN cannot be granted. On a problem it opens or updates an idempotent\n`runner-down`-labelled issue (one tracker, comment-updated); on recovery it\ncomments and auto-closes. Validated with actionlint (incl. shellcheck on the\nrun blocks). Smoke-test via workflow_dispatch after merge.\n\nOut of scope (separate PRs): routing fast core gates to ubuntu-latest (runner\npolicy + billing); the operational runbook.\n\nTrace: skip\nRefs: #509, #436\n\nCo-authored-by: Claude Opus 4.8 <noreply@anthropic.com>",
          "timestamp": "2026-06-18T00:39:18-05:00",
          "tree_id": "704bb58b4a0bae2a6ab0c20bb89f6b3a3d6e2568",
          "url": "https://github.com/pulseengine/rivet/commit/a32a02b62d6de27edc1705b2f196dc318417f97f"
        },
        "date": 1781761957540,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85637,
            "range": "± 439",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 910189,
            "range": "± 36956",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 16746268,
            "range": "± 980352",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2180,
            "range": "± 17",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26596,
            "range": "± 76",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 379500,
            "range": "± 7791",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 94,
            "range": "± 3",
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
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1453170,
            "range": "± 34903",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 160336,
            "range": "± 1520",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1991132,
            "range": "± 10643",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 37662606,
            "range": "± 3203233",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 470753,
            "range": "± 3190",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 18115060,
            "range": "± 652645",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1503910063,
            "range": "± 13221815",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4328,
            "range": "± 77",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 59893,
            "range": "± 327",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 752529,
            "range": "± 8111",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 62176,
            "range": "± 196",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 700984,
            "range": "± 2955",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 10354288,
            "range": "± 501987",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1128,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14268,
            "range": "± 157",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 345443,
            "range": "± 1886",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 25707,
            "range": "± 128",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 186984,
            "range": "± 1844",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1756064,
            "range": "± 34680",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "ee352ce958276a46b5ac7dddbfa9f42a77297d23",
          "message": "fix(cli): emit a JSON error envelope on parse failure under --format json (REQ-219, #500) (#535)\n\nrivet's top-level `--project`/`--schemas` are not clap `global` args, so they\nparse only before the subcommand. `rivet validate --project X` is a parse error;\nclap writes it to stderr and leaves stdout empty, so a `--format json` consumer\n(e.g. a subprocess from #488) got an empty payload and a cryptic \"EOF while\nparsing a value\" with no hint about the arg position. The obvious `global = true`\nfix is a known trap — it debug-asserts against positional subcommands and broke\nmain once (REQ-209/#501, reverted #502).\n\nFix (no `global`): parse via `Cli::try_parse()`; on error, when argv requested\nJSON (`--format json`/`-f json`, any spelling), print a one-line\n`{ \"error\", \"hint\" }` envelope on stdout (hint: pass --project/--schemas BEFORE\nthe subcommand), then still emit clap's human message to stderr and exit with\nclap's code. `--help`/`--version` pass through (exit 0); non-JSON parse errors\nkeep the stderr-only behavior (empty stdout).\n\nConfirmed with the new `json_consumers_get_an_error_envelope_on_parse_failure`\nintegration test and `cargo test -p rivet-cli --test cli_commands` (132 pass);\n`cargo fmt --check` + `cargo clippy --all-targets -- -D warnings` clean;\n`rivet validate` PASS.\n\nImplements: REQ-219\nRefs: REQ-007\n\nCo-authored-by: Claude Opus 4.8 <noreply@anthropic.com>",
          "timestamp": "2026-06-18T00:39:23-05:00",
          "tree_id": "573a8fe60cfc866a2ae8093edae4a9cb839c861d",
          "url": "https://github.com/pulseengine/rivet/commit/ee352ce958276a46b5ac7dddbfa9f42a77297d23"
        },
        "date": 1781762111083,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84845,
            "range": "± 573",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 922605,
            "range": "± 16953",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 16031224,
            "range": "± 1115361",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1973,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25052,
            "range": "± 58",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 360267,
            "range": "± 2594",
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
            "value": 1455646,
            "range": "± 20446",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 168118,
            "range": "± 1181",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1982624,
            "range": "± 34160",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 27571163,
            "range": "± 2005798",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 444430,
            "range": "± 3732",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 17155975,
            "range": "± 116895",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1316056494,
            "range": "± 17500271",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4129,
            "range": "± 32",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 43490,
            "range": "± 119",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 724735,
            "range": "± 4238",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 64265,
            "range": "± 294",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 711665,
            "range": "± 2829",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8568234,
            "range": "± 435486",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1177,
            "range": "± 51",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14848,
            "range": "± 45",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 241658,
            "range": "± 2756",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23817,
            "range": "± 60",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 172193,
            "range": "± 469",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1627661,
            "range": "± 36309",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "d648ce44de2fe852316c422075d15eac74b7f5fc",
          "message": "release(v0.17.0): bump version + CHANGELOG [0.17.0] (#545)\n\nFirst release since v0.16.1, cut to ship the RUSTSEC-2026-0182 wasmtime fix and\nthe feature batch to downstream consumers (gale waits on a release, not main):\n\nSecurity: wasmtime 43 -> 44.0.3 (#542).\nAdded: `rivet check docs` oracle (#541), minimal --no-default-features build\n(REQ-202/#456), `init --vendor-schemas` (REQ-220/#431), runner-liveness alert\n(#509).\nFixed: next-id git-history awareness (REQ-218/#479), JSON error envelope on\nparse failure (REQ-219/#500), variant binding-file loader (#539), `accepted`\nstatus enum (#525).\n\nConfirmed: `cargo build` green, lock synced to 0.17.0, `rivet validate` PASS,\n`rivet docs check` PASS (0 violations).\n\nTrace: skip\n\nCo-authored-by: Claude Opus 4.8 <noreply@anthropic.com>",
          "timestamp": "2026-06-19T10:02:10-05:00",
          "tree_id": "808d48cfd8b660e2a8cd70a17b379da6f8dacc45",
          "url": "https://github.com/pulseengine/rivet/commit/d648ce44de2fe852316c422075d15eac74b7f5fc"
        },
        "date": 1781882063657,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 83894,
            "range": "± 512",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 885227,
            "range": "± 11978",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 15012852,
            "range": "± 2094078",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2177,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26062,
            "range": "± 190",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 382061,
            "range": "± 1597",
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
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1460592,
            "range": "± 30063",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 165080,
            "range": "± 1492",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1976466,
            "range": "± 26042",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 24962039,
            "range": "± 1673838",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 463810,
            "range": "± 2518",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 16794641,
            "range": "± 91987",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1420784197,
            "range": "± 11144937",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4330,
            "range": "± 59",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 59383,
            "range": "± 351",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 748269,
            "range": "± 16332",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 60953,
            "range": "± 538",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 688290,
            "range": "± 1805",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7409225,
            "range": "± 87349",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1261,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15486,
            "range": "± 54",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 341915,
            "range": "± 1193",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 25041,
            "range": "± 195",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 178889,
            "range": "± 1003",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1698630,
            "range": "± 11750",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "9b8987ce9f027f1b8580acf0cce99b4089b49190",
          "message": "feat(schema): requirement-verification rule closes the right side of the V (REQ-222, #555) (#561)\n\nThe `verifies` link type existed but nothing enforced it: a requirement could be\n`implemented` and `rivet validate`-green with ZERO tests tracing to it, and not\neven a warning flagged the gap (field-reported from scry #554, kiln #559,\nrelay #556 — all dogfooding the methodology).\n\nAdd a declarative `requirement-verification` traceability-rule to the `dev`\nschema next to `requirement-coverage`: source-type requirement,\n`required-backlink: verifies`, severity warning. `from-types` is OMITTED on\npurpose — the engine already treats empty from-types as \"match any source type\"\n(validate_and_coverage_agree_on_empty_from_types_backlink_rule) — so the rule\nstays generic: any artifact that `verifies` the requirement satisfies it,\nwhatever schema named the verification type. No engine change. A project that\ndoesn't want it doesn't load a schema declaring it (opt-out). dev schema\n0.1.0 -> 0.2.0.\n\nConfirmed: a dev project with an implemented requirement + no `verifies` backlink\nemits the WARN; adding any `verifies` link to it clears the warning; `rivet\nvalidate` still PASS. Unit assertion that the embedded dev schema declares the\nrule generically; `cargo test -p rivet-core` + `-p rivet-cli` green; fmt +\nclippy clean.\n\nNB: on rivet's own corpus this surfaces ~190 advisory warnings (rivet verifies\nvia `Verifies:` commit trailers, not artifact links) — the honest V-gap the rule\nexists to reveal; wiring those links is tracked as v0.18.0 follow-up.\n\nImplements: REQ-222\nRefs: REQ-010\n\nCo-authored-by: Claude Opus 4.8 <noreply@anthropic.com>",
          "timestamp": "2026-06-23T00:54:27-05:00",
          "tree_id": "1b0ef814de974f22fd8f338556741d6427a41567",
          "url": "https://github.com/pulseengine/rivet/commit/9b8987ce9f027f1b8580acf0cce99b4089b49190"
        },
        "date": 1782194773976,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85282,
            "range": "± 3214",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 925400,
            "range": "± 38973",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 19213557,
            "range": "± 1109436",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1937,
            "range": "± 9",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24778,
            "range": "± 159",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 361451,
            "range": "± 7077",
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
            "value": 97,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1450054,
            "range": "± 16171",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 167432,
            "range": "± 631",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1934537,
            "range": "± 66501",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 43417925,
            "range": "± 2948625",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 445090,
            "range": "± 8081",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 17585090,
            "range": "± 392978",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1342152492,
            "range": "± 24992085",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4172,
            "range": "± 44",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 45895,
            "range": "± 1710",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 729707,
            "range": "± 35237",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 65874,
            "range": "± 1009",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 726814,
            "range": "± 5350",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 9520459,
            "range": "± 492510",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1266,
            "range": "± 17",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15016,
            "range": "± 150",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 233718,
            "range": "± 4340",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 24092,
            "range": "± 132",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 176267,
            "range": "± 3698",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1663460,
            "range": "± 25553",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "49032534013fd8a3bab96b1b0276c7114c14e150",
          "message": "ci(release): make VSIX Marketplace publish non-blocking so npm publish isn't skipped (#560)\n\nThe VS Code Marketplace publish is a separate distribution channel, but it\nlacked `continue-on-error`, so when it failed (e.g. an expired VSCE PAT) the\nwhole Release workflow concluded `failure`. `release-npm.yml` triggers on\n`workflow_run.conclusion == 'success'`, so a red marketplace job silently\nSKIPPED the npm publish — v0.17.0 shipped its binaries + GitHub Release but npm\nfroze at 0.16.1 until a manual `workflow_dispatch` backfill.\n\nMark `publish-vsix-marketplace` `continue-on-error: true` (matching the existing\n`build-test-evidence` job) so only the core release path (binaries +\n`create-release`) gates the run's conclusion, and the npm channel publishes even\nwhen an optional channel is down.\n\nTrace: skip\n\nCo-authored-by: Claude Opus 4.8 <noreply@anthropic.com>",
          "timestamp": "2026-06-23T00:54:31-05:00",
          "tree_id": "8165b5c205a01875d9f5feb7a45230c2813cd23b",
          "url": "https://github.com/pulseengine/rivet/commit/49032534013fd8a3bab96b1b0276c7114c14e150"
        },
        "date": 1782194791782,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 82861,
            "range": "± 1159",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 877574,
            "range": "± 7573",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12280527,
            "range": "± 163203",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2164,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26673,
            "range": "± 184",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 353910,
            "range": "± 989",
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
            "value": 1446066,
            "range": "± 22017",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 160295,
            "range": "± 5125",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1910264,
            "range": "± 14091",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 24255849,
            "range": "± 164254",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 465170,
            "range": "± 2838",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 16647487,
            "range": "± 106610",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1419618216,
            "range": "± 14174270",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4319,
            "range": "± 23",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60283,
            "range": "± 783",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 730683,
            "range": "± 6341",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 63759,
            "range": "± 220",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 704112,
            "range": "± 3128",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7750722,
            "range": "± 261334",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1185,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15153,
            "range": "± 87",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 328297,
            "range": "± 1365",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 26060,
            "range": "± 110",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 181720,
            "range": "± 1321",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1710440,
            "range": "± 70573",
            "unit": "ns/iter"
          }
        ]
      }
    ]
  }
}