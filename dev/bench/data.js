window.BENCHMARK_DATA = {
  "lastUpdate": 1787707027828,
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
          "id": "2129652bbae69f431bfaeeb67077b6c0f4e69e6d",
          "message": "chore(release): v0.31.0 — nextest-filterset fix + validate --strict + ordeal-certificate type (#760)\n\nConsolidates everything on main since v0.30.0 into a single minor release.\nTwo v0.31-targeted features (ordeal-certificate schema type #743, and\n`validate --strict` #758) had landed alongside the nextest-filterset fix that\nwas slated v0.30.1; a features-in-a-patch release would be a semver smell, so\nthe filterset fix is folded into v0.31.0 (REQ-280 release retargeted).\n\nAlso repairs the CHANGELOG: a prior rebase auto-merge had nested v0.30.0's\ncontent under a misplaced [0.30.1] header — the version sections are now\ncorrectly ordered.\n\nScope (all implemented + merged):\n- REQ-280 nextest -E filterset false-positive fix (#757, #756)\n- REQ-283 validate --strict compliance-gate mode (#758)\n- REQ-277 ordeal-certificate evidence artifact type (#743, #693)\n\nBumps workspace 0.30.1 -> 0.31.0 (rivet-core, rivet-cli, etch) + vscode-rivet.\n\nTrace: skip",
          "timestamp": "2026-08-05T08:49:24+02:00",
          "tree_id": "070dffb8625dd42ab2ec1a7cc8ee8ac4f9cf6ed5",
          "url": "https://github.com/pulseengine/rivet/commit/2129652bbae69f431bfaeeb67077b6c0f4e69e6d"
        },
        "date": 1785913413808,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 83652,
            "range": "± 346",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 912492,
            "range": "± 7763",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 17430583,
            "range": "± 1243415",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2198,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 27975,
            "range": "± 374",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 381353,
            "range": "± 3216",
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
            "value": 1520198,
            "range": "± 21685",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 162757,
            "range": "± 835",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1996899,
            "range": "± 12997",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 39778823,
            "range": "± 4081512",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 481108,
            "range": "± 2087",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 15839730,
            "range": "± 498676",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1265481257,
            "range": "± 13600115",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4673,
            "range": "± 13",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 59695,
            "range": "± 262",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 815371,
            "range": "± 13158",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 59869,
            "range": "± 172",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 698494,
            "range": "± 4477",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 9889713,
            "range": "± 814921",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1112,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14739,
            "range": "± 126",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 318314,
            "range": "± 1678",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22727,
            "range": "± 208",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 161135,
            "range": "± 906",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1511942,
            "range": "± 21601",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "e1a539fcbcb28b3eeff60ac5fca9db932c030760",
          "message": "plan(weak-green): file REQ-284/285/286 from the docs countercheck + release-status finding (#763)\n\nWeak-green audit outputs (green that proves less than it appears):\n- REQ-284 embedded-docs truth-drift — 8 divergences (docs.rs snippets +\n  json-output envelope contradict the binary); found by the docs countercheck.\n- REQ-285 rivet docs check should parse doc snippets + resolve doc-topic refs\n  (would have caught 6/8 of REQ-284 mechanically — the meta-fix).\n- REQ-286 rivet release status: be LOUD about which artifacts block a cut and\n  whether they're in-scope vs backlog (user-reported).\n\nAll proposed, release v0.32.0.\n\nTrace: skip",
          "timestamp": "2026-08-05T10:49:04+02:00",
          "tree_id": "5f616ba666bd7244fbead1699b4a6609f1d66bc6",
          "url": "https://github.com/pulseengine/rivet/commit/e1a539fcbcb28b3eeff60ac5fca9db932c030760"
        },
        "date": 1785920213916,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 67561,
            "range": "± 2504",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 835530,
            "range": "± 25039",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 10642419,
            "range": "± 194120",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1441,
            "range": "± 56",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 16101,
            "range": "± 513",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 260752,
            "range": "± 5937",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 68,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/1000",
            "value": 66,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 69,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1193878,
            "range": "± 46244",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 140474,
            "range": "± 3716",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1611359,
            "range": "± 29236",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 23615041,
            "range": "± 370312",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 378790,
            "range": "± 17921",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 12070154,
            "range": "± 340350",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 831299935,
            "range": "± 15730153",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3149,
            "range": "± 112",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 33943,
            "range": "± 1312",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 745272,
            "range": "± 9085",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 48775,
            "range": "± 1179",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 501545,
            "range": "± 12268",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 6139888,
            "range": "± 159935",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 780,
            "range": "± 17",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 9884,
            "range": "± 463",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 258837,
            "range": "± 4830",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 18495,
            "range": "± 554",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 128852,
            "range": "± 4536",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1182878,
            "range": "± 32105",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "7619b0d524fd2d7f3e9320c9f1ce98b99e5f0f53",
          "message": "build(deps): bump wasmtime 45->47 (fixes RUSTSEC-2026-0222); justify-ignore rkyv advisory (#762)\n\nRUSTSEC-2026-0222 (wasmtime: stores can mix up type indices between engines)\nis cleared by bumping wasmtime + wasmtime-wasi 45.0.3 -> 47.0.3. The host wasm\nseam still builds (`cargo build -p rivet-cli --features wasm` OK) — the bump is\nsource-compatible for rivet's single-engine usage.\n\nRUSTSEC-2026-0235 (rkyv 0.7 out-of-bounds reads) is added to the cargo-audit\nignore list with justification: rkyv is an OPTIONAL feature of rust_decimal\n(pulled via gluesql-core) that rivet does not enable, so it is a Cargo.lock\nentry only and is never compiled into any rivet binary. rust_decimal pins\nrkyv ^0.7, so it cannot advance to the fixed 0.8 line without an upstream bump.\n\nResult: `cargo audit` reports 0 vulnerabilities (2 allowed warnings remain:\ninstant unmaintained, scc) — the Security Audit gate goes green again.\n\nTrace: skip",
          "timestamp": "2026-08-05T11:48:26+02:00",
          "tree_id": "483b3a5d0ee77ea05baa2a7d98e4311a64a9941e",
          "url": "https://github.com/pulseengine/rivet/commit/7619b0d524fd2d7f3e9320c9f1ce98b99e5f0f53"
        },
        "date": 1785924082404,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84981,
            "range": "± 2496",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 925308,
            "range": "± 21685",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 19071206,
            "range": "± 1315923",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1979,
            "range": "± 29",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25260,
            "range": "± 1768",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 354863,
            "range": "± 2076",
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
            "range": "± 2",
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
            "value": 1531392,
            "range": "± 43945",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 168274,
            "range": "± 961",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1955338,
            "range": "± 21285",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 59897799,
            "range": "± 9733941",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 460187,
            "range": "± 9293",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 16790170,
            "range": "± 199462",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1188270736,
            "range": "± 22998568",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4290,
            "range": "± 78",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 46852,
            "range": "± 546",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 830359,
            "range": "± 18423",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 64597,
            "range": "± 322",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 724843,
            "range": "± 3104",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 9370249,
            "range": "± 823581",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1011,
            "range": "± 22",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14045,
            "range": "± 188",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 238264,
            "range": "± 4638",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22175,
            "range": "± 122",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 152108,
            "range": "± 2293",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1436823,
            "range": "± 11714",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "df780621fd6d4bb4f951a1d9b5376eb5df6bf094",
          "message": "fix(mutate): modify --add-tag no longer drops the whole file when a tag needs quoting (REQ-287, P0 data loss) (#765)\n\nMutation-path stress test (user report: \"we very often get into failures\"\nmodifying artifacts) found a P0 silent data-loss bug. yaml_edit.rs re-emitted\nthe tag flow list via `current_tags.join(\", \")` WITHOUT quoting individual\ntags — unlike the hardened setters (title/status/field, #687) and the `add`\npath (mutate.rs). A tag carrying a YAML flow indicator breaks: a legitimately\nquoted `\"release: v1.0\"`, read back from the store, was re-emitted bare\n(`release: v1.0`), turning the flow list into a map so the WHOLE FILE failed to\nparse — silently dropping EVERY artifact in it — while `modify` exited 0\nreporting success.\n\nReproduced: 2 artifacts -> a benign, unrelated `--add-tag simpletag` -> 0\nartifacts loadable. Same tag-mutation fragility class as #625, on the quoting\naxis.\n\nFix: quote each tag via `yaml_quote_inline_scalar` before joining, mirroring\nthe hardened `add` path. Also closes a silent-split variant (`--add-tag \"a,b\"`\nstored two tags). Regression test asserts both artifacts survive an unrelated\n--add-tag and the pre-existing quoted tag stays quoted. All 38 yaml_edit unit\ntests still pass.\n\nFixes: REQ-287\nRefs: REQ-203",
          "timestamp": "2026-08-05T11:50:13+02:00",
          "tree_id": "e4c0fd7627f9bd0912bc2133e66adc30892020af",
          "url": "https://github.com/pulseengine/rivet/commit/df780621fd6d4bb4f951a1d9b5376eb5df6bf094"
        },
        "date": 1785924189851,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 86579,
            "range": "± 2144",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 912106,
            "range": "± 8124",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 18437273,
            "range": "± 2387805",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2213,
            "range": "± 11",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 27618,
            "range": "± 304",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 347244,
            "range": "± 7873",
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
            "value": 1587383,
            "range": "± 18351",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 161595,
            "range": "± 638",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1976115,
            "range": "± 23041",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 37157747,
            "range": "± 6765600",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 489474,
            "range": "± 3261",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 16037128,
            "range": "± 368138",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1256920603,
            "range": "± 10556215",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4205,
            "range": "± 12",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 59292,
            "range": "± 431",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 754146,
            "range": "± 8629",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 61903,
            "range": "± 992",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 696340,
            "range": "± 6207",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 9911525,
            "range": "± 1252132",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1106,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14752,
            "range": "± 102",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 318050,
            "range": "± 5265",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 24141,
            "range": "± 152",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 169878,
            "range": "± 934",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1590777,
            "range": "± 18251",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "d2eff3f1532adb8cd5a085e1f90054508b84e45f",
          "message": "docs(fix): correct 8 embedded-doc snippets/claims that contradict the binary (REQ-284) (#764)\n\nWeak-green audit finding: `rivet docs check` validates token/format hygiene, so\nthese truth-drifts passed clean while every snippet errored on copy-paste.\n\n- json-output: replace the fictional `{command, data:{...}}` envelope with the\n  real flat top-level shape (no command emits a `data` wrapper); fix the stale\n  coverage recipe `.entries[]` -> `.rules[]`.\n- diagnostics/required-field, allowed-values, unknown-field: `modify --field`\n  -> `--set-field` (the real flag; `--field` errors).\n- diagnostics/known-type: drop `modify --type` (no such flag / no CLI\n  type-change) — point to editing `type:` in YAML.\n- diagnostics/broken-link: `rivet add requirement REQ-099 --title` ->\n  `rivet add --type requirement --title` (ids are auto-generated).\n- diagnostics/unknown-link-type: `rivet docs links` -> `rivet schema links`\n  (the real topic).\n\nMechanical hardening to catch this class is tracked as REQ-285.\n\nImplements: REQ-284",
          "timestamp": "2026-08-05T11:50:17+02:00",
          "tree_id": "beec84ba1c15ab548457ef1004352a667d80eea7",
          "url": "https://github.com/pulseengine/rivet/commit/d2eff3f1532adb8cd5a085e1f90054508b84e45f"
        },
        "date": 1785924309196,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85582,
            "range": "± 1904",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 910862,
            "range": "± 9441",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 16861587,
            "range": "± 805713",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2204,
            "range": "± 11",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26014,
            "range": "± 187",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 393913,
            "range": "± 9291",
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
            "value": 1522484,
            "range": "± 12110",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 163018,
            "range": "± 506",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1987619,
            "range": "± 40250",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 37558781,
            "range": "± 1287617",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 464226,
            "range": "± 2871",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 15857894,
            "range": "± 142581",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1262846699,
            "range": "± 12179499",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4415,
            "range": "± 18",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60918,
            "range": "± 1234",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 784012,
            "range": "± 14466",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 61817,
            "range": "± 139",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 697193,
            "range": "± 3460",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 9186935,
            "range": "± 669180",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1080,
            "range": "± 9",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14905,
            "range": "± 773",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 349386,
            "range": "± 2864",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23750,
            "range": "± 145",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 168557,
            "range": "± 483",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1584699,
            "range": "± 29691",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "5c4b7a05c2bf59c686d92c671cfc6d703eecb494",
          "message": "chore(release): v0.32.0 — weak-green hardening + mutation reliability + security (#766)\n\nBumps workspace 0.31.0 -> 0.32.0 (rivet-core, rivet-cli, etch) + vscode-rivet.\n\nScope (all implemented + merged):\n- REQ-287 P0 data-loss fix: modify --add-tag no longer drops the whole file (#765)\n- REQ-284 embedded-docs truth-drift: 8 snippet/claim fixes (#764)\n- Security: wasmtime 45->47, RUSTSEC-2026-0222 cleared (#762)\n\nTrace: skip",
          "timestamp": "2026-08-05T12:29:54+02:00",
          "tree_id": "286e9e61943b7b3dbb40f69aea896c947664cf77",
          "url": "https://github.com/pulseengine/rivet/commit/5c4b7a05c2bf59c686d92c671cfc6d703eecb494"
        },
        "date": 1785926327613,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 86169,
            "range": "± 2166",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 913072,
            "range": "± 4032",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14229970,
            "range": "± 855294",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2100,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 27226,
            "range": "± 102",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 353774,
            "range": "± 1172",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 95,
            "range": "± 7",
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
            "value": 1527597,
            "range": "± 28385",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 161605,
            "range": "± 673",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1892853,
            "range": "± 16087",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 28066370,
            "range": "± 1393007",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 481100,
            "range": "± 1553",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 15349182,
            "range": "± 183950",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1252805026,
            "range": "± 12414292",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4299,
            "range": "± 13",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 61755,
            "range": "± 216",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 748543,
            "range": "± 4321",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 57670,
            "range": "± 210",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 696970,
            "range": "± 17151",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8283940,
            "range": "± 408101",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1084,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15117,
            "range": "± 148",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 322477,
            "range": "± 4110",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23739,
            "range": "± 865",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 167795,
            "range": "± 1492",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1583011,
            "range": "± 28423",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "ec436b89fb2c1e65cb1665308a6d066e91984fc9",
          "message": "chore(trace): flip REQ-284 proposed -> implemented (docs fixes shipped in #764) (#767)\n\nClean-room pre-tag audit for v0.32.0 caught REQ-284 left at 'proposed' while its\nembedded-doc corrections were already merged (#764). Status now matches shipped\nreality before the tag.\n\nTrace: skip",
          "timestamp": "2026-08-05T12:57:54+02:00",
          "tree_id": "209e0a7dd0f3f527d866ad39ac11b44f061467a6",
          "url": "https://github.com/pulseengine/rivet/commit/ec436b89fb2c1e65cb1665308a6d066e91984fc9"
        },
        "date": 1785928009796,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85813,
            "range": "± 3498",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 910565,
            "range": "± 11640",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 15855693,
            "range": "± 708696",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2170,
            "range": "± 63",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25746,
            "range": "± 78",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 362779,
            "range": "± 6539",
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
            "value": 1539975,
            "range": "± 41705",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 162612,
            "range": "± 6165",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1903964,
            "range": "± 46764",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 26746940,
            "range": "± 3241401",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 478748,
            "range": "± 6574",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 15313017,
            "range": "± 175118",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1205263250,
            "range": "± 14050349",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4426,
            "range": "± 31",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 64608,
            "range": "± 475",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 789789,
            "range": "± 4793",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 62448,
            "range": "± 1612",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 701193,
            "range": "± 2391",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8428521,
            "range": "± 300938",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1060,
            "range": "± 35",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15212,
            "range": "± 82",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 320777,
            "range": "± 5155",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 24213,
            "range": "± 70",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 170590,
            "range": "± 1154",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1593972,
            "range": "± 40282",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "f5592c6fba835f19bd98b20d1bf5509009eb6ab6",
          "message": "plan(v0.33): gate potency — make every required check able to fail (#772)\n\nScope for v0.33.0, themed \"a gate that cannot fail is not a gate\". Four findings\nported from spar's recent gate audit (spar#381/#383/#384/#388), each reproduced\nagainst rivet with direct evidence, plus the two meta-fixes already filed.\n\nNew (from the spar cross-check):\n- REQ-288 mutation gate reads a path cargo-mutants never writes (#768) — the\n  rivet-cli HARD gate has never read its own results; one core shard's real\n  missed.txt lists 5 survivors while CI printed 0.\n- REQ-289 Format gate misses the fuzz/ workspace (#769) — live drift in 5\n  tracked files `cargo fmt --all` never opens.\n- REQ-290 check verification-evidence runs in no workflow (#770) — rivet built\n  the checker for spar#388's exact rot and nothing enforces it.\n- REQ-291 changes-filter under-scoped + fails open (#771) — embedded schemas\n  (include_str!) skip the whole compile matrix; an errored git diff skips too.\n\nPulled into v0.33 (same weak-green family):\n- REQ-285 docs check parses snippets / resolves topics\n- REQ-286 release status is loud about what blocks a cut\n\nScope moved DELIBERATELY (release-planning: deferral is a decision, logged, not\nsilent). These were still tagged to already-cut releases:\n- REQ-274/275/276 (customer UI: trace tree view, tag filter, colour contrast)\n  v0.31.0 -> v0.34.0 — they have now slipped one release while infra work landed\n- REQ-281 (evaluate nextest filtersets), REQ-282 (sql --schema) v0.31.0 -> v0.34.0\n\nNo artifact now points at a cut release.\n\nTrace: skip",
          "timestamp": "2026-08-05T19:05:34+02:00",
          "tree_id": "30db069fb756f3c7c18c3d8bdb84599d69780ddd",
          "url": "https://github.com/pulseengine/rivet/commit/f5592c6fba835f19bd98b20d1bf5509009eb6ab6"
        },
        "date": 1785951395267,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 68694,
            "range": "± 686",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 811635,
            "range": "± 5668",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 10415676,
            "range": "± 64780",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1358,
            "range": "± 13",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 16053,
            "range": "± 31",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 250381,
            "range": "± 828",
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
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1194867,
            "range": "± 53462",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 140612,
            "range": "± 3752",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1585603,
            "range": "± 12502",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 22830789,
            "range": "± 60664",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 358370,
            "range": "± 6806",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 12117931,
            "range": "± 134405",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 832381931,
            "range": "± 4927408",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3402,
            "range": "± 76",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 36102,
            "range": "± 312",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 787802,
            "range": "± 3021",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 46483,
            "range": "± 104",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 505939,
            "range": "± 1611",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 6164014,
            "range": "± 224619",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 789,
            "range": "± 30",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 9861,
            "range": "± 168",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 286532,
            "range": "± 6275",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 18405,
            "range": "± 1460",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 129701,
            "range": "± 326",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1154294,
            "range": "± 6153",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "0e5345bb627d2e049529f6530b00dd27db94208a",
          "message": "docs(design): harvest 2 durable notes from the stale sphinx-needs branch (#777)\n\nThe `feat/import-results-sphinx-needs` worktree carried 10 unpushed commits\n(2 months old, base 86bf482, never PR'd). Most of its content already reached\nmain by another route — examples/score-conversion is present, schemas/score.yaml\nis byte-identical, and sphinx-needs import ships as `import-results --format\nneeds-json` — so its 1344-line formats/sphinx_needs.rs is superseded and is NOT\nharvested. Its 7 design docs were absent from main; 2 are still durable:\n\n- eclipse-score-vs-pulseengine-approach.md — methodology comparison against\n  Eclipse S-CORE; positioning context behind schemas/score.yaml, not\n  invalidated by code drift.\n- externals-kind-source.md — proposes `externals.<name>.kind: source`\n  (clone-only for non-rivet upstreams). Still unimplemented; names a live\n  symptom (58 WARN lines per validate in the eclipse-score fork) and estimates\n  ~30 lines in rivet-core/src/externals.rs.\n\nDropped as superseded/obsolete: sphinx-needs-rowan-v2 and\nsphinx-needs-rust-port-v1.2-catchup (plans for the implementation that never\nlanded), rivet-link-parse-bug (that bug is REQ-091, fixed in v0.13.1),\nartifact-embed-with-fields and variant-subsystem-eclipse-evidence (kept out for\nnow — the variant subsystem has moved substantially since REQ-265a-d).\n\nBoth carry a dated provenance banner marking them HISTORICAL notes whose claims\nhave not been re-verified — importing them as current documentation would be the\nsame doc-truth-drift class fixed in REQ-284.\n\n`rivet docs check` caught two stale illustrative YAML blocks on import\n(ConfigExampleFreshness): an `...  # 57 more` placeholder and `← NEW:` arrow\nannotations that made the blocks unparseable. Fixed the blocks to be valid YAML\nrather than relabelling the fence, so the freshness invariant keeps checking\nthem. docs check now PASS (64 files, 0 violations).\n\nTrace: skip",
          "timestamp": "2026-08-06T08:59:07+02:00",
          "tree_id": "fd5513303590cf74d54f12c9a1859f7807b1cfa3",
          "url": "https://github.com/pulseengine/rivet/commit/0e5345bb627d2e049529f6530b00dd27db94208a"
        },
        "date": 1786000309798,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85159,
            "range": "± 362",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 907794,
            "range": "± 9578",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 16793506,
            "range": "± 887678",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2169,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26445,
            "range": "± 89",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 376554,
            "range": "± 1947",
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
            "value": 1524158,
            "range": "± 26130",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 161708,
            "range": "± 754",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1960224,
            "range": "± 37859",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 35984223,
            "range": "± 2951169",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 476116,
            "range": "± 2813",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 15405982,
            "range": "± 276387",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1243576500,
            "range": "± 10874786",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4479,
            "range": "± 23",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 64166,
            "range": "± 286",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 868892,
            "range": "± 5357",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 62468,
            "range": "± 259",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 697583,
            "range": "± 4563",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 9473911,
            "range": "± 517871",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1190,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 16080,
            "range": "± 61",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 366305,
            "range": "± 13619",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 24397,
            "range": "± 129",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 170559,
            "range": "± 2360",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1580475,
            "range": "± 10574",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "c8eb44fa3dfcf6412a7cc6a145979020bd41e055",
          "message": "ci(fmt): check every workspace in the Format gate, not just the root (#769) (#774)\n\n`cargo fmt --all -- --check` at the repo root formats every member of\nTHE root workspace, not every crate in the repo. rivet has two\n[workspace] manifests (root + fuzz/) plus the standalone\ncompose-witness/ package (its own Cargo.lock, excluded from root), so\nthe Format gate has been vacuous for the fuzz workspace since it was\nadded. Live on HEAD before this change:\n\n    $ cargo fmt --all -- --check                            ; echo $?\n    0\n    $ cargo fmt --manifest-path fuzz/Cargo.toml --all -- --check ; echo $?\n    1\n    Diff in fuzz/examples/oracle_smoke.rs:44\n    Diff in fuzz/examples/oracle_smoke.rs:258\n    Diff in fuzz/fuzz_targets/artifact_ids.rs:38\n    Diff in fuzz/fuzz_targets/artifact_ids.rs:66\n    Diff in fuzz/fuzz_targets/cli_argv.rs:188\n    Diff in fuzz/fuzz_targets/yaml_footguns.rs (bonus — not in issue)\n\nFix: derive the workspace list from\n`grep -rl '^\\[workspace\\]' --include=Cargo.toml` and check each, so a\nnewly added nested workspace can't silently escape the gate. Also\ncovers the same-shape bug in scripts/pre-commit and scripts/install-hooks.sh\n(local convenience hooks — CI is still the real gate per REQ-051).\n\ncompose-witness/ is a standalone Wasm-component package that cargo fmt\ncan't traverse (its `bindings` module is generated at build time by\ncargo-component); rustfmt with skip_children handles it without a\nbuild.\n\nNegative control against a synthetic drift in fuzz/:\n- old gate: exit 0 (vacuous green)\n- new gate: exit 1 (drift caught)\n\nFixes: REQ-289\nRefs: #769\n\n\nClaude-Session: https://claude.ai/code/session_014NmwwtE8WWfcTLsfNNKfLC\n\nCo-authored-by: Claude <noreply@anthropic.com>",
          "timestamp": "2026-08-06T08:59:14+02:00",
          "tree_id": "891dc98b00d0c470f09fb284180ea22ec8fd080c",
          "url": "https://github.com/pulseengine/rivet/commit/c8eb44fa3dfcf6412a7cc6a145979020bd41e055"
        },
        "date": 1786000455656,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 86253,
            "range": "± 526",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 912480,
            "range": "± 6561",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14060165,
            "range": "± 1238650",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2197,
            "range": "± 52",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26496,
            "range": "± 112",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 384890,
            "range": "± 1766",
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
            "value": 1531452,
            "range": "± 22725",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 162187,
            "range": "± 1764",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1959544,
            "range": "± 16518",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 28821433,
            "range": "± 1949665",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 470055,
            "range": "± 6796",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 15284579,
            "range": "± 342669",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1242674615,
            "range": "± 15555472",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4484,
            "range": "± 31",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 59434,
            "range": "± 311",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 789056,
            "range": "± 7851",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 59905,
            "range": "± 288",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 704685,
            "range": "± 4336",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 10664234,
            "range": "± 882698",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1155,
            "range": "± 21",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14478,
            "range": "± 120",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 327546,
            "range": "± 2462",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 24411,
            "range": "± 314",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 171485,
            "range": "± 2538",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1580745,
            "range": "± 19631",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "0d42ce1cf8024c63b83ca4e95045a661123ce6fd",
          "message": "ci(traceability): wire rivet check verification-evidence + kill weak-green empty scan (#770) (#776)\n\nCloses #770. Second implementation slice of v0.33 \"gate potency\" (after #773\nmutation-gate). Two fixes for a single defect: the anti-rot check for stale\n`cargo test <filter>` names existed but was unenforced.\n\n## The unenforced anti-rot check\n\n`rivet check verification-evidence` (REQ-236, hardened again in REQ-280 for\nnextest filtersets) catches the class spar#388 found — verification steps whose\n`fields.steps[].run: \"cargo test … <filter>\"` names a test that no longer\nexists. `cargo test <renamed_or_typod>` exits 0 with \"0 passed\", so the\nrequirement keeps its `verified` status. rivet BUILT the checker for exactly\nthat shape, and `grep verification-evidence .github/workflows/*.yml` returned\nnothing — no workflow ran it. Protection was opt-in-by-memory.\n\n## The weak-green empty-scan case\n\nOn a project whose steps carry no `cargo test <filter>` runs (or has no steps\nat all), the pre-fix text was:\n\n    ✓ verification-evidence: 0 named-test step(s) all reference an existing test.\n\nA checkmark over nothing checked — the same weak-green shape the check exists\nto kill.\n\n## Fixes\n\n- `.github/workflows/ci.yml`: add `rivet check verification-evidence` to the\n  Traceability job (REQ-051 dogfooding gate) and to `traceability-hosted-fallback`\n  (REQ-272 / #509 SPOF mitigation), so a self-hosted-pool outage still leaves\n  main gated on the anti-rot check. Reuses the release binary the neighboring\n  `validate` step already built — no extra compile cost.\n- `rivet-cli/src/main.rs cmd_check_verification_evidence`: an `empty_scan`\n  branch renders as `⚠ verification-evidence: no named-test step(s) found to\n  check — nothing was verified.` (with a plain sentence explaining what the\n  check would look for), instead of the ✓ / \"all reference an existing test\"\n  shape. JSON output gains `empty_scan: true` in that branch so a machine can\n  distinguish the vacuous case from a genuine pass. Exit code stays 0 (nothing\n  was violated) — this preserves the pre-fix contract used by callers and by\n  the new CI step.\n\nTwo regression tests in `rivet-cli/tests/cli_commands.rs` pin both directions:\n\n- `check_verification_evidence_empty_scan_reads_as_vacuous_not_pass` — a\n  project whose only steps are `make lint` / `pytest -k` (parsed by neither\n  the cargo nor the nextest branch) produces stdout that does NOT contain the\n  ✓ / \"all reference an existing test\" shape and JSON with `empty_scan: true`.\n- `check_verification_evidence_non_empty_scan_still_reads_as_pass` — a real\n  `cargo test -p p a_real_test` step still renders as ✓ /\n  \"all reference an existing test\" and JSON `empty_scan: false`. Guards the\n  new branch against shadowing the genuine-pass shape.\n\n## Acceptance criteria (from the issue body → how satisfied)\n\n- [x] **Add `rivet check verification-evidence` to the Traceability job in\n  `ci.yml` (it is fast and needs no compile beyond the binary already built\n  there).** Added as `Gate 1c` in the `traceability` job, after `validate`\n  and `variant + binding validation`, before `commits`. Mirrored on\n  `traceability-hosted-fallback` so the SPOF mitigation (REQ-272 / #509)\n  covers it too.\n- [x] **Reword the zero-steps case so an empty scan does not render as a\n  pass.** New `empty_scan` branch in `cmd_check_verification_evidence`:\n  distinct `⚠` prefix, explicit \"nothing was verified\" wording, `empty_scan:\n  true` in JSON. Pinned by regression tests in both directions.\n\nREQ-290 flipped `proposed → implemented`. CHANGELOG entry added under\n`[Unreleased]`. No behavior change to callers depending on missing-test\ndetection (exit code / JSON shape preserved except for the added\n`empty_scan` field).\n\n## Test plan\n\n- [x] `cargo test -p rivet-cli --test cli_commands check_verification_evidence`\n      — 4/4 pass (2 pre-existing + 2 new)\n- [x] `cargo test -p rivet-cli --test cli_commands` — 162/162 pass\n- [x] `cargo fmt --all -- --check` clean\n- [x] `cargo clippy -p rivet-cli --tests -- -D warnings` clean (only the\n      pre-existing MSRV note from `clippy.toml`)\n- [x] `./target/release/rivet check verification-evidence` on this repo —\n      renders as `⚠ … no named-test step(s) found to check` (this repo has no\n      such steps today), exits 0 → the new CI step is green on HEAD\n- [x] `./target/release/rivet validate` on this repo — PASS (635 warnings,\n      unchanged; REQ-290 now shows in the \"no downstream artifacts\" set,\n      same shape as its neighbors)\n\n## What this PR is NOT\n\n- Not a change to the `missing` detection path — the same fn-name scanner runs\n  over the same artifact walk. Only the empty-scan render + the CI wiring\n  changed.\n- Not a change to the exit-code contract. An empty scan still exits 0. If a\n  future policy decision wants an empty scan to be RED (e.g. \"a project\n  claiming verification coverage MUST have at least one named-test step\"),\n  that is a separate REQ.\n- Not a fix for #771 (`changes` filter under-scoped) or #557 (crates.io\n  publishing). Same v0.33 slice, separate PRs.\n\nImplements: REQ-290\nFixes: REQ-290\nRefs: #770, REQ-236, REQ-280, REQ-272, REQ-051\n\n\nClaude-Session: https://claude.ai/code/session_01UD5As6pYghNkKHHZkiLyCG\n\nCo-authored-by: Claude <noreply@anthropic.com>",
          "timestamp": "2026-08-06T08:59:20+02:00",
          "tree_id": "5e054ed60e823d3b9da0e0b26fbb7984de1b979d",
          "url": "https://github.com/pulseengine/rivet/commit/0d42ce1cf8024c63b83ca4e95045a661123ce6fd"
        },
        "date": 1786000517627,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85695,
            "range": "± 3340",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 912524,
            "range": "± 4411",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14716071,
            "range": "± 994388",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2183,
            "range": "± 37",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 27237,
            "range": "± 395",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 378903,
            "range": "± 5588",
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
            "value": 1527604,
            "range": "± 30494",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 164069,
            "range": "± 4893",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1965903,
            "range": "± 12147",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 30628120,
            "range": "± 2279443",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 469848,
            "range": "± 4967",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 15456198,
            "range": "± 201540",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1240216114,
            "range": "± 13116767",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4678,
            "range": "± 57",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 64077,
            "range": "± 397",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 804162,
            "range": "± 13721",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 60625,
            "range": "± 325",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 686899,
            "range": "± 21852",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8058852,
            "range": "± 740843",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1147,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14139,
            "range": "± 136",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 326351,
            "range": "± 9521",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23784,
            "range": "± 95",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 172541,
            "range": "± 3997",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1592859,
            "range": "± 19960",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "ebf08dbb045c5d59289f5209ebce3a90d1027e0e",
          "message": "ci(mutants): make the mutation gate able to fail — correct path, honest selector, diff scope (REQ-288) (#773)\n\nThe rivet-cli \"hard gate\" has never been able to fail. Three compounding bugs:\n\n1. WRONG RESULTS PATH. cargo-mutants writes its report to <--output>/mutants.out/,\n   but the gate read `mutants-out/missed.txt` — a path that has never existed. The\n   -f test was always false, MISSED stayed 0, `0 -gt 0` false, exit 0 regardless of\n   survivors. Evidence: artifact mutants-report-rivet-core-13-of-16's real\n   missed.txt lists 5 survivors while the job printed \"Surviving mutants: 0\".\n\n2. EMPTY TEST SELECTOR. The gate ran `-- --lib`, but rivet-cli is a pure binary\n   crate: `cargo test -p rivet-cli --lib` errors with \"no library targets found\".\n   No test ever exercised any mutant, and the crate's 29 integration test files\n   were excluded by construction.\n\n3. UPLOAD GLOBS NEVER MATCHED. `mutants-out/*.txt|*.json` under a report that\n   lives in mutants-out/mutants.out/, with if-no-files-found: warn. No\n   mutants-report-rivet-cli-* artifact has ever been produced, in any run.\n\nFixes:\n- read mutants-out/mutants.out/{missed.txt,outcomes.json}; fix upload globs\n- MISSING EVIDENCE IS RED: absent outcomes.json fails loudly instead of\n  defaulting to a clean 0 (also covers a crashed run scoring as a good one)\n- drop `-- --lib` so the integration suite is the oracle\n- scope the per-PR gate with `--in-diff`: rivet-cli has 4311 mutants, far past\n  this job's 45-minute budget, which is how it came to point at an empty\n  selector. Diff scoping asks the question that matters per PR — is the code\n  this PR changed covered? Full scope stays on the nightly path.\n- same path fix applied to mutants-core (nightly, continue-on-error, so honest\n  numbers surface without blocking)\n\nNegative control (the point of this REQ) — old vs new against real layouts:\n  report with 2 survivors: old exit 0 (vacuous green), new exit 1\n  crashed run, no report:  old exit 0, new exit 1 (refuses to pass)\n\nPorted from spar#381; rivet's variant was worse (2 and 3 are rivet-only).\n\nFixes: REQ-288\nRefs: REQ-289, REQ-290, REQ-291",
          "timestamp": "2026-08-06T08:59:27+02:00",
          "tree_id": "f4f14bddd803bd301e839ca19255b14220689aa6",
          "url": "https://github.com/pulseengine/rivet/commit/ebf08dbb045c5d59289f5209ebce3a90d1027e0e"
        },
        "date": 1786000525104,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 86178,
            "range": "± 2982",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 923257,
            "range": "± 9673",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 16146555,
            "range": "± 943038",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2194,
            "range": "± 13",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25363,
            "range": "± 810",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 399654,
            "range": "± 4042",
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
            "value": 1530966,
            "range": "± 32148",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 163764,
            "range": "± 2272",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1956304,
            "range": "± 20029",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 25511004,
            "range": "± 1350702",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 479807,
            "range": "± 17942",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 15349514,
            "range": "± 512138",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1228603071,
            "range": "± 10116949",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4371,
            "range": "± 131",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 58999,
            "range": "± 386",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 765672,
            "range": "± 6227",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 60924,
            "range": "± 615",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 697709,
            "range": "± 4642",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7525566,
            "range": "± 212947",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1186,
            "range": "± 9",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14341,
            "range": "± 90",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 327653,
            "range": "± 5792",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 25084,
            "range": "± 346",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 168774,
            "range": "± 725",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1582201,
            "range": "± 18073",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "b42a89ee45380cf5f4db039a96d550708461b4d7",
          "message": "fix(yaml-hir): preserve plain-scalar field values that contain commas (#747) (#749)\n\nThe CST lexer breaks plain scalars at `,`, `]`, `}` (see\n`lex_plain_scalar` in yaml_cst.rs) so a value like\n\n    test-name: tests::a, tests::b\n\nlands in the Value node as three sibling tokens\n(`tests::a` / `, ` / `tests::b`). `scalar_text` already handles this\nvia `next_sibling_or_token`, but `node_to_yaml_value` — the path\ntaken for `fields.*` and unknown top-level keys — read only the\nfirst token and returned `\"tests::a\"`. The trailing evidence was\nsilently discarded and rendered identically to a value that had\nonly ever claimed one test.\n\nRoute the plain-scalar branch through `scalar_text` so the sibling\ntokens the lexer split are reassembled before type inference. Quoted\nscalars are unaffected (they arrive as a single token). Two\nregression tests cover the `fields.*` path and the\nunknown-top-level-key fallthrough that share this code.\n\nFixes: REQ-028\nRefs: #747\n\nCo-authored-by: Claude <noreply@anthropic.com>",
          "timestamp": "2026-08-06T09:00:44+02:00",
          "tree_id": "6b14e571f7beb624f67d3974a2a56352bbb8a8f2",
          "url": "https://github.com/pulseengine/rivet/commit/b42a89ee45380cf5f4db039a96d550708461b4d7"
        },
        "date": 1786000575232,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 86843,
            "range": "± 1776",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 917795,
            "range": "± 4265",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 16218877,
            "range": "± 1150320",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2006,
            "range": "± 10",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24918,
            "range": "± 330",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 365180,
            "range": "± 1939",
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
            "value": 1516756,
            "range": "± 20569",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 166877,
            "range": "± 2560",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 2004574,
            "range": "± 9611",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 37477210,
            "range": "± 2997642",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 450378,
            "range": "± 1459",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 15147018,
            "range": "± 380730",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1096219356,
            "range": "± 19043109",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4278,
            "range": "± 9",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 45751,
            "range": "± 411",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 818615,
            "range": "± 5884",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 62335,
            "range": "± 693",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 730322,
            "range": "± 3066",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 10020335,
            "range": "± 1093374",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1134,
            "range": "± 33",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 13988,
            "range": "± 137",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 222696,
            "range": "± 3110",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23109,
            "range": "± 48",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 161482,
            "range": "± 518",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1482496,
            "range": "± 18755",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "7ceddefef107c4cf4bbd7ea59402cb5302bbabba",
          "message": "fix(ci): mutation gate must not fail on an empty diff or a shallow base (REQ-288 follow-up) (#784)\n\nMy REQ-288 change (#773) made the rivet-cli mutation gate able to fail — and it\npromptly failed on #779 for the wrong reason, blocking the queue. Three defects,\nall mine:\n\n1. SHALLOW CHECKOUT. `--in-diff` needs the PR base commit present locally, but\n   the job checks out without `fetch-depth: 0`, so `git diff <base>...HEAD`\n   could not resolve the base.\n\n2. THE FAILURE WAS SWALLOWED. That diff ran as `... > pr.diff || true`, so the\n   error became an empty pr.diff instead of a stop — the exact silent-swallow\n   anti-pattern this whole v0.33 line of work exists to remove, committed by me\n   while removing it elsewhere.\n\n3. EMPTY DIFF READ AS MISSING EVIDENCE. cargo-mutants writes no report when\n   there is nothing to mutate, so the \"absent outcomes.json is RED\" guard fired\n   on the legitimate no-Rust-changes case.\n\nFixes:\n- `fetch-depth: 0` on the mutants-cli checkout\n- the diff step now fails loudly (`::error::` + exit 1) when the base cannot be\n  resolved, rather than proceeding over an unknown diff\n- an empty diff short-circuits to PASS in both the run and the check steps\n\nConfirmed with a negative control over the check logic:\n  empty diff              -> PASS (nothing to mutate)\n  diff + report, 2 missed -> FAIL (gate bites)\n  diff + no report        -> FAIL (missing evidence)\nyamllint clean.\n\nRefs: REQ-288",
          "timestamp": "2026-08-07T06:54:30+02:00",
          "tree_id": "1494bb37e236beb674faecd958b92350e2697255",
          "url": "https://github.com/pulseengine/rivet/commit/7ceddefef107c4cf4bbd7ea59402cb5302bbabba"
        },
        "date": 1786080639343,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85196,
            "range": "± 965",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 915633,
            "range": "± 10315",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 16784577,
            "range": "± 1079233",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1967,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24563,
            "range": "± 81",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 362237,
            "range": "± 5530",
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
            "value": 1528477,
            "range": "± 23345",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 166862,
            "range": "± 558",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 2003276,
            "range": "± 32033",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 36831033,
            "range": "± 3552170",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 447427,
            "range": "± 3365",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 15418593,
            "range": "± 195796",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1086538058,
            "range": "± 22802567",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4212,
            "range": "± 33",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 46393,
            "range": "± 285",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 814132,
            "range": "± 41268",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 62227,
            "range": "± 216",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 724401,
            "range": "± 4488",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 9194817,
            "range": "± 394252",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1233,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 13946,
            "range": "± 80",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 228814,
            "range": "± 1741",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22384,
            "range": "± 856",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 156883,
            "range": "± 1349",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1466209,
            "range": "± 25242",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "bcee66720450fbbfcb58151e0a7fd6ad5b2d40ee",
          "message": "fix(serve): externals precede locals in /artifacts pagination (#778) (#779)\n\nThe `/api/v1/artifacts` handler pushes externals BEFORE locals into the\nresults vector so the pagination window (`limit`, capped at 1000) cannot\nsilently drop externals off the tail.\n\n## Root cause\n\n`api_artifacts_external_excluded_under_variant_scope` (REQ-265b) went\nred on main after commit 3d03ee3 (#743, ordeal-certificate schema) pushed\nrivet's local-artifact count past 996. With local_count = 1002 + 4 spar\nexternals = 1006 total, the `.take(1000)` truncation cut off every\n`external:spar` row — the response body carried 1000 rows all\n`origin=local`, indistinguishable from the classifier failing.\n\nThe classifier itself is correct — the loop that pushes externals sets\n`origin: ext_origin.clone()` (`external:<prefix>`), which appears\nunchanged when queried directly via `?origin=external:spar`. What broke\nwas the assembly order: locals were pushed first, then externals were\nappended and immediately truncated.\n\n## Fix\n\nSwap the two loops so externals go into `results` first. Externals are a\nsmall set by construction (separate projects, dozens at most), so this\nordering keeps them consistently visible in any reasonable page without\na special-case pagination path or a raised limit cap.\n\nAlso lifts the `origin` grammar into two helpers so the emission site\nand the `by_origin` map key cannot desync:\n- `LOCAL_ORIGIN: &str = \"local\"`\n- `external_origin(prefix: &str) -> String` → `\"external:<prefix>\"`\n\n## Tests\n\nThree new unit tests in `serve::api::tests` — matching the issue's ask\nfor a direct classifier-level unit test so a regression doesn't have to\ntravel through a full serve integration test to be noticed:\n\n- `external_origin_matches_query_grammar` — the emitted origin string\n  matches the `?origin=external:<prefix>` filter grammar clients query on\n- `local_origin_is_the_string_local` — pins the `LOCAL_ORIGIN` constant\n- `externals_precede_locals_in_result_order` — builds the concrete\n  `Vec<ApiArtifact>` the handler assembles (4 externals + 1002 locals),\n  applies the 1000-cap slice, and asserts all four externals survive AND\n  no local precedes any external in the page.\n\nThe existing integration test `api_artifacts_external_excluded_under_variant_scope`\nnow passes; full `cargo test -p rivet-cli` (546 tests) green;\n`cargo fmt --all -- --check` and `cargo clippy -p rivet-cli --all-targets -- -D warnings` clean.\n\n## Acceptance criteria (from the issue) → how satisfied\n\n- [x] `api_artifacts_external_excluded_under_variant_scope` passes\n      locally and on `main` again.\n- [x] REQ-265b's exclusion mechanism (variant-scope drops externals)\n      preserved — the `if include_externals && variant_scope.is_none()`\n      gate is unchanged; the same integration test verifies both the\n      unscoped-includes-externals AND scoped-excludes-externals halves.\n- [x] Direct unit test on the origin classification added.\n\nFixes: REQ-265\nRefs: #778, #743",
          "timestamp": "2026-08-07T06:54:37+02:00",
          "tree_id": "ad1c2ac6597feabfa606ded4c1c0be87c73fcc46",
          "url": "https://github.com/pulseengine/rivet/commit/bcee66720450fbbfcb58151e0a7fd6ad5b2d40ee"
        },
        "date": 1786081330242,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 86104,
            "range": "± 2935",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 920086,
            "range": "± 21084",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 16826358,
            "range": "± 768256",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2122,
            "range": "± 82",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25247,
            "range": "± 550",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 394489,
            "range": "± 11003",
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
            "value": 1552562,
            "range": "± 75975",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 166552,
            "range": "± 3974",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1926176,
            "range": "± 55710",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 26212962,
            "range": "± 2454615",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 459090,
            "range": "± 2736",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 15237474,
            "range": "± 197911",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1238765212,
            "range": "± 12261935",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4459,
            "range": "± 18",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 63259,
            "range": "± 375",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 789111,
            "range": "± 8986",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 58605,
            "range": "± 1395",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 702996,
            "range": "± 31128",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7778858,
            "range": "± 486962",
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
            "value": 14392,
            "range": "± 212",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 322800,
            "range": "± 5010",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 24444,
            "range": "± 270",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 171918,
            "range": "± 827",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1597574,
            "range": "± 23521",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "bb2d0aa8f6ae1bbb2378b1ff1ea77fd5eaf2fe12",
          "message": "ci(changes): fail closed and derive embedded-asset build inputs (REQ-291) (#781)\n\nThe `changes` job's filter has three under-scoping bugs that let a real\nbuild-affecting edit skip the entire compile matrix (Clippy, Test, MSRV,\nSemver, Miri, Proptest, Coverage, wasm-seam). On GitHub, a SKIPPED\nrequired context is indistinguishable from a passed one.\n\n## The three misses\n\n1. **`schemas/*.yaml` are compiled INTO the binary**\n   `rivet-core/src/embedded.rs` pulls every shipped schema in with\n   `include_str!(\"../../schemas/…\")` (40+ entries). The old filter matched\n   only `(\\.rs$)|(Cargo\\.(toml|lock)$)|(^\\.github/workflows/)`, so a\n   schema-only PR — which changes compiled binary content and can break\n   the test suite — landed on `rust=false` and skipped the compile matrix.\n2. **`.github/actions/**` composite actions**\n   Only `.github/workflows/` was matched, so an edit to\n   `.github/actions/free-space/action.yml` (used BY the compile jobs)\n   didn't trigger them.\n3. **`git diff` errors → skip everything**\n   `changed=\"$(git diff --name-only \"$base\"...HEAD)\"` — a bad/absent\n   base sha or a shallow fetch left `changed` empty, nothing matched,\n   and the step exited 0 with rust=false. The error path was the\n   permissive path.\n\n## Fix — derive, don't retype; fail closed\n\n- **Derive** the embedded-asset file set from the source at gate time.\n  `grep` for every `include_str!`/`include_bytes!`/`include_dir!` in\n  `rivet-core` / `rivet-cli` / `etch`, resolve the path arg against the\n  containing file, and match changed files exactly. That auto-covers a\n  new `include_str!(\"…\")` a future PR adds — no filter-list drift.\n- **Add `.github/actions/`** to both the rust and wasm regexes.\n- **Fail closed.** An erroring or empty `git diff` now sets rust=true\n  AND wasm=true (running the full matrix) instead of silently skipping\n  every gate.\n\n## Verified locally\n\nSimulated the classifier against 9 representative paths — every result\nmatches expectation:\n\n  schema-only edit (schemas/dev.yaml)                 → rust=true\n  composite action (.github/actions/free-space/…)     → rust=true\n  embedded doc (docs/artifact-types/…-certificate.md) → rust=true\n  embedded quickstart (rivet-cli/src/quickstart.md)   → rust=true\n  regular .rs source                                  → rust=true\n  non-embedded design doc (…/status-gate-rules.md)    → rust=false\n  docs README, artifacts YAML                         → rust=false\n  empty diff                                          → rust=true (fail closed)\n\nPorted from spar#384.\n\nFixes: REQ-291\nRefs: #771\n\n\nClaude-Session: https://claude.ai/code/session_01Mjd85UePLRJVHtb8haBGF8\n\nCo-authored-by: Claude <noreply@anthropic.com>",
          "timestamp": "2026-08-11T21:37:42+02:00",
          "tree_id": "53f22ebcb4e9758bc8030ec97ef5d9bfb1019858",
          "url": "https://github.com/pulseengine/rivet/commit/bb2d0aa8f6ae1bbb2378b1ff1ea77fd5eaf2fe12"
        },
        "date": 1786478157756,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 86080,
            "range": "± 1550",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 905736,
            "range": "± 15739",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 16691436,
            "range": "± 1262502",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2148,
            "range": "± 30",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26372,
            "range": "± 929",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 354969,
            "range": "± 1422",
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
            "value": 1523938,
            "range": "± 40108",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 166560,
            "range": "± 779",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1973355,
            "range": "± 47327",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 31268155,
            "range": "± 2378750",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 479272,
            "range": "± 6965",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 15426580,
            "range": "± 279801",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1233269657,
            "range": "± 14615521",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4389,
            "range": "± 26",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 59394,
            "range": "± 581",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 800791,
            "range": "± 7936",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 62140,
            "range": "± 1393",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 729190,
            "range": "± 5540",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 11633412,
            "range": "± 780836",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1008,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14870,
            "range": "± 162",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 333778,
            "range": "± 1771",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 25028,
            "range": "± 330",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 175724,
            "range": "± 2978",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1610773,
            "range": "± 12212",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "c0eb34f266ef55d39d4cf9b2cf52e1f92c914ef1",
          "message": "fix(serve): don't silently swallow a failed external load (#778 follow-up) (#783)\n\n`load_externals` used `if let Ok(..)` with no `else`: when\n`load_external_project` failed, the external kept `synced: true` but got an\nEMPTY store. The dashboard then showed zero artifacts for that prefix with no\ndiagnostic anywhere — indistinguishable from an external that legitimately has\nnone.\n\nNow a load error is logged with the prefix and path, a successful-but-empty\nload warns (its rivet.yaml declares no sources, or they matched no files), and\na declared-but-unsynced external says so and points at `rivet sync`.\n\nScope note: this is hardening, NOT the #778 fix. #778 is pagination truncation\nand is fixed by #779 (externals precede locals). The external load has been\nsucceeding all along — the point here is that if it ever stops, it will say so\ninstead of degrading silently to \"no externals\". Salvaged from the closed #780.\n\nRefs: REQ-265",
          "timestamp": "2026-08-11T21:37:52+02:00",
          "tree_id": "ef1745b4d4035fbaac32a98ff063afc318d2c301",
          "url": "https://github.com/pulseengine/rivet/commit/c0eb34f266ef55d39d4cf9b2cf52e1f92c914ef1"
        },
        "date": 1786478197861,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84188,
            "range": "± 1753",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 893849,
            "range": "± 18568",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 15500367,
            "range": "± 243819",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2185,
            "range": "± 20",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25926,
            "range": "± 149",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 364472,
            "range": "± 1345",
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
            "value": 1517663,
            "range": "± 15219",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 160170,
            "range": "± 1369",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1939856,
            "range": "± 18461",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 30220264,
            "range": "± 377002",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 477348,
            "range": "± 1413",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 15546933,
            "range": "± 104870",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1237019194,
            "range": "± 11542275",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4428,
            "range": "± 159",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 59874,
            "range": "± 265",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 820670,
            "range": "± 3507",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 60557,
            "range": "± 242",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 704993,
            "range": "± 6576",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7559221,
            "range": "± 365772",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1176,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14291,
            "range": "± 53",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 333126,
            "range": "± 12224",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 24102,
            "range": "± 495",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 178494,
            "range": "± 2286",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1612275,
            "range": "± 23527",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "54578059b66af4db548b53db35305052cf75ddf1",
          "message": "chore(release): v0.33.0 — gate potency (#793)\n\nBumps workspace 0.32.0 -> 0.33.0 (rivet-core, rivet-cli, etch) + vscode-rivet.\n\nTheme: a gate that cannot fail is not a gate. Four required CI checks ran,\nreported green, and could not go red. Ported from spar's gate audit and each\nreproduced here with direct evidence.\n\nScope (all implemented + merged):\n- REQ-288 mutation gate could never fail — wrong results path, empty test\n  selector against a crate with no lib target, unmatched upload globs (#768)\n- REQ-289 Format gate blind to the fuzz/ workspace (#769)\n- REQ-290 check verification-evidence ran in no workflow (#770)\n- REQ-291 changed-areas filter under-scoped and failing open (#771)\n\nAlso carries the #778 externals-pagination fix (#779), which downstream sigil\nis waiting on: with 1242 local artifacts it is ~12x the default page window, so\nits synth/kiln external rows are currently dropped while `total` counts them.\nThat is the reason this cut is not waiting.\n\nScope moved DELIBERATELY (release-planning: deferral is a decision, logged):\nREQ-285 (docs check parses snippets) and REQ-286 (release status loudness)\nv0.33.0 -> v0.34.0. Both are still proposed; the release's own theme — the four\nvacuous gates — is complete without them.\n\nTrace: skip",
          "timestamp": "2026-08-12T00:26:54+02:00",
          "tree_id": "71fe4b81399e14f51cd2b3c8cdbdccc3d29d13aa",
          "url": "https://github.com/pulseengine/rivet/commit/54578059b66af4db548b53db35305052cf75ddf1"
        },
        "date": 1786492944141,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85771,
            "range": "± 3061",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 898300,
            "range": "± 4944",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12954236,
            "range": "± 573294",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2232,
            "range": "± 11",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26866,
            "range": "± 68",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 384702,
            "range": "± 1968",
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
            "value": 1510764,
            "range": "± 30167",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 167547,
            "range": "± 3910",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1972239,
            "range": "± 10334",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 27089956,
            "range": "± 1192633",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 475381,
            "range": "± 4597",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 15383296,
            "range": "± 138745",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1241139166,
            "range": "± 13206655",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4479,
            "range": "± 54",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60420,
            "range": "± 1301",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 778724,
            "range": "± 3359",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 59117,
            "range": "± 1447",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 693244,
            "range": "± 27913",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7644481,
            "range": "± 182261",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1093,
            "range": "± 9",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14852,
            "range": "± 49",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 322713,
            "range": "± 2600",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 25272,
            "range": "± 92",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 179191,
            "range": "± 739",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1659512,
            "range": "± 20393",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "e74e6d58ef48723549a297a1abebcb4189d67916",
          "message": "fix(ci): un-vacuum the mutants-core gate; dedupe the v0.33.0 changelog section (#795)\n\n* fix(ci): un-vacuum the mutants-core gate; dedupe the v0.33.0 changelog section\n\nTwo findings from the v0.33.0 pre-tag clean-room audit. Neither blocks the tag\n(the first is nightly + continue-on-error, the second is cosmetic), but the\nfirst is the exact defect class this release exists to remove, so it should not\noutlive the release that introduced it.\n\n1. mutants-core was made UNCONDITIONALLY VACUOUS by my own REQ-288 follow-up.\n   The empty-diff short-circuit (`if [ ! -s pr.diff ]; then exit 0`) belongs to\n   mutants-cli, which computes pr.diff. My patch applied it to every matching\n   check step, and mutants-core has no step that writes pr.diff — so the guard\n   always fired and the job never evaluated outcomes.json or missed.txt for\n   rivet-core. The in-file claim that \"honest numbers surface without blocking\"\n   was false as written. Guard removed from mutants-core; mutants-cli keeps it\n   (correct there).\n\n   Root cause worth naming: a str.replace without a count. The fix for a\n   vacuous gate introduced a vacuous gate one job over.\n\n2. The [0.33.0] changelog section carried two `### Fixed` subheads and\n   documented REQ-290 twice (my summary plus #776's fuller entry). Collapsed to\n   one section, keeping the detailed entry. A duplicated section in a release\n   about honest reporting is worth fixing before the tag, not after.\n\nyamllint clean; docs check 0 violations.\n\nRefs: REQ-288\n\n* docs(changelog): correct the REQ-290 claim + state the known limitations\n\nThe v0.33.0 entry headlined REQ-290 as \"no longer scores an empty scan as\na pass\". Confirmed against the main binary, that overclaims: an empty scan\nnow renders as an honest warning with empty_scan true in JSON, but it still\nexits 0, so CI still scores it a pass. What changed is the rendering, not\nthe verdict. On this repo the check examines 0 steps.\n\nAlso records the two defects reported after the release branch was cut and\nconfirmed against main (#807) — the discarded --manifest-path value hiding\nnested workspaces, and satisfiability by an empty stub test — including the\norder they must be fixed in.\n\nConfirmed with the main binary that docs check fails loudly (exit 1 on a\ndeliberate violation, exit 0 clean), so this file is gated for real.\n\n* build(deps): bump h2 0.4.13 -> 0.4.16 (fixes RUSTSEC-2026-0258)\n\nAdvisory published 2026-08-17, after this release branch was cut, which turned\nthe Security Audit gate red during the pre-tag check. Unbounded empty DATA\nframes; h2 reaches rivet through axum and hyper, so it sits in the live request\npath of `rivet serve` rather than being dev-only.\n\nApplied as a surgical 2-line lockfile edit. A plain `cargo update -p h2` on this\nmachine also re-pointed five Windows-only crates from windows-sys 0.61.2 to the\n0.52.0 already in the tree — semver-valid resolver churn, but unrelated to the\nadvisory and not something to smuggle into a security fix. Patching only the h2\nversion and checksum keeps the diff to what the advisory requires.\n\nConfirmed with `cargo build --locked` (exit 0, lock untouched by the build),\nthe full serve integration suite (52 passed), and `cargo audit` with CI's exact\nignore set (exit 0, was exit 1).",
          "timestamp": "2026-08-18T23:19:26+02:00",
          "tree_id": "30b9446b9f62c6dd88507460d6fa15e36e433b1f",
          "url": "https://github.com/pulseengine/rivet/commit/e74e6d58ef48723549a297a1abebcb4189d67916"
        },
        "date": 1787088747731,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 86319,
            "range": "± 1271",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 909085,
            "range": "± 4424",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14402691,
            "range": "± 888175",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2231,
            "range": "± 10",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26314,
            "range": "± 73",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 373578,
            "range": "± 1604",
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
            "value": 1523672,
            "range": "± 35595",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 165536,
            "range": "± 1280",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1958107,
            "range": "± 15677",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 26407296,
            "range": "± 1207698",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 476086,
            "range": "± 1860",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 15579797,
            "range": "± 148641",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1259171730,
            "range": "± 11064055",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4460,
            "range": "± 57",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 66360,
            "range": "± 436",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 795865,
            "range": "± 6485",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 60304,
            "range": "± 216",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 699469,
            "range": "± 2807",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7767081,
            "range": "± 263223",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1155,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14876,
            "range": "± 65",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 320563,
            "range": "± 4618",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22966,
            "range": "± 240",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 162036,
            "range": "± 1485",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1531922,
            "range": "± 20002",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "14f9091ff68c4df85aa77cc8f07ea17b2e932970",
          "message": "ci(mutants): don't fail the cli gate when the diff has no cli mutants (#817)\n\nREQ-288 made this gate fail closed on a missing report, which was right — a\ncrashed run must never be scored as a clean zero. But it conflated two cases\nthat both leave no mutants-out/: cargo-mutants writes nothing and exits 0 when\nthe diff contains no mutants for this crate, and it also writes nothing when it\ncrashes, exiting non-zero.\n\n#810 hit the first case. It changes only rivet-core, so there was nothing for\nthe rivet-cli gate to mutate, and the gate reported missing evidence for a run\nthat had correctly done nothing. That is the inverse of the defect REQ-288 set\nout to remove — I checked that the gate goes red on a real failure and never\nthat it stays green on a legitimate no-op.\n\nNow records cargo-mutants' own exit status and branches on it. Exit 0 with no\nreport is reported as out-of-scope and passes, naming the limitation in the log\nrather than implying coverage it does not have. A non-zero exit with no report\nstays a hard error, and the message now includes the observed status.\n\nThe deeper gap — rivet-core changes get no per-PR mutation coverage at all\nbecause mutants-core is schedule-only — is #816, not fixed here.\n\nRefs: REQ-288",
          "timestamp": "2026-08-18T23:57:36+02:00",
          "tree_id": "7fc27e3895cfe61fa651dd3838aeee392107f093",
          "url": "https://github.com/pulseengine/rivet/commit/14f9091ff68c4df85aa77cc8f07ea17b2e932970"
        },
        "date": 1787090985656,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 86237,
            "range": "± 2650",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 915615,
            "range": "± 19466",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 15287610,
            "range": "± 1295461",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1976,
            "range": "± 9",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 22937,
            "range": "± 47",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 335766,
            "range": "± 1813",
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
            "value": 1516633,
            "range": "± 9528",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 165605,
            "range": "± 12345",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1927569,
            "range": "± 8916",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 27791534,
            "range": "± 992551",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 453925,
            "range": "± 1936",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 15085567,
            "range": "± 138658",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1099740936,
            "range": "± 18633551",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4233,
            "range": "± 11",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 44416,
            "range": "± 140",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 749618,
            "range": "± 4962",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 65110,
            "range": "± 741",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 728560,
            "range": "± 10231",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8945320,
            "range": "± 301492",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1133,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14787,
            "range": "± 47",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 221892,
            "range": "± 2543",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21393,
            "range": "± 134",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 150270,
            "range": "± 572",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1385825,
            "range": "± 13996",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "27f067fe62b70165d4a3c442404b92c41557257c",
          "message": "plan(v0.34): read the UI requirements, measure REQ-276, triage 3 more issues (#823)\n\nSecond planning pass. The first set v0.34.0's scope without reading the three\ncustomer UI requirements it claimed to lead with, and left 12 issues untriaged.\n\nRead REQ-274, REQ-275 and REQ-276 in full. Each names the file, the existing\nmechanism to reuse and the scope boundary, so none needs redesign before\nimplementation — which means the UI slipping twice was a prioritisation failure,\nnot a readiness one.\n\nMeasured REQ-276 rather than trusting it. Its cited palette is still live in\nrivet-cli/src/render/styles.rs, and 5 of 14 pairs fail WCAG AA body text. The\nreported pair is confirmed and worst at 1.09 to 1, but the accent colour used\nfor LINKS is the more pervasive defect at 3.20 and 3.48, and was not reported.\nBody text, secondary text, sidebar and all three result colours pass\ncomfortably, so this is targeted rather than a redesign. The measurement gives\nthe requirement a mechanical acceptance criterion — a unit test computing\nrelative luminance over the palette constants — so it can reach verified on\nevidence instead of a screenshot review.\n\nREQ-300 covers #546, the largest gap in the UI theme and missed first time\nround: humans have no assisted authoring path, only hand-edited YAML, which is\nalso the path with no guard rails over a writer that has produced four data-loss\nbugs. Marked draft and design-first; three shapes exist with very different\ncosts, so a decision must land before implementation is scoped. REQ-301 covers\n#788 with #787, where two coverage surfaces report 100 percent and 0 percent for\nthe same twelve requirements. REQ-302 covers #746 retroactively, since PR #759\ncarries the fix but the issue had no artifact and was invisible to planning.\n\nReconstructed on top of current main rather than rebased. The rebase produced\ntwo conflict blocks whose boundaries fell mid-artifact, and a keep-both\nresolution fused two provenance mappings into a duplicate timestamp key. Caught\nby gating the push on rivet validate; re-applying the four discrete changes onto\nclean main is smaller and checkable.\n\nRefs: REQ-274, REQ-275, REQ-276, REQ-300, REQ-301, REQ-302",
          "timestamp": "2026-08-19T21:24:36+02:00",
          "tree_id": "e995cf19ab7379ee8ec822eb8580cdbb56755e25",
          "url": "https://github.com/pulseengine/rivet/commit/27f067fe62b70165d4a3c442404b92c41557257c"
        },
        "date": 1787169843943,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 78375,
            "range": "± 257",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 942234,
            "range": "± 3892",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13783542,
            "range": "± 591473",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1700,
            "range": "± 11",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 19150,
            "range": "± 163",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 347658,
            "range": "± 1244",
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
            "value": 88,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 88,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1409522,
            "range": "± 11195",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 165675,
            "range": "± 569",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1914770,
            "range": "± 20261",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 34522564,
            "range": "± 2604172",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 431048,
            "range": "± 1059",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 14447552,
            "range": "± 254463",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 941477621,
            "range": "± 4152805",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4020,
            "range": "± 48",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 41160,
            "range": "± 274",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 813034,
            "range": "± 2423",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 53619,
            "range": "± 833",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 598145,
            "range": "± 5634",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7643902,
            "range": "± 571737",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 927,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 10992,
            "range": "± 165",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 310564,
            "range": "± 2269",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 20907,
            "range": "± 42",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 151581,
            "range": "± 287",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1410016,
            "range": "± 23547",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "ebd253ad55407c4e41b812bc4ed798077cd68f83",
          "message": "fix(check-verification-evidence): scan the crate named by --manifest-path (#807) (#830)\n\n`rivet check verification-evidence` parsed `--manifest-path` only so its value\nwould not be mistaken for the positional filter, then discarded it. Every step\nof the shape `cargo test --manifest-path <nested>/Cargo.toml <filter>` therefore\nfalse-failed with \"no test matching found\" against the default scan of `./src`\n+ `./tests` — 14 false failures, exit 1, on the reporting project.\n\n`parse_cargo_manifest_path` threads the value back through, widening the\nfn-name universe for that step only (cached per manifest dir).\n\nConfirmed with a negative control on the shipped 0.32.0 binary vs this branch\nagainst the same fixture: 0.32.0 reports FV-001 missing and exits 1; this\nbranch reports 0 missing and exits 0, with a sibling no-flag step still\nlegitimately failing so the widening is provably per-step, not global.\n\nThis is Defect 1 of two. Defect 2 (the check is name-existence, not\ncommand-reachability, so an empty stub satisfies it) is untouched and #807\nstays open for it.\n\nFixes: REQ-236\nRefs: #807",
          "timestamp": "2026-08-20T06:36:22+02:00",
          "tree_id": "b2bf945fa860a74fc9f556f6d564aecf86682c25",
          "url": "https://github.com/pulseengine/rivet/commit/ebd253ad55407c4e41b812bc4ed798077cd68f83"
        },
        "date": 1787202354083,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 66783,
            "range": "± 364",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 725380,
            "range": "± 2798",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12711894,
            "range": "± 595821",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1523,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 18640,
            "range": "± 473",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 264620,
            "range": "± 726",
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
            "range": "± 8",
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
            "value": 1178342,
            "range": "± 20601",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 129158,
            "range": "± 396",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1554725,
            "range": "± 17920",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 23938323,
            "range": "± 502042",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 339886,
            "range": "± 1150",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 10845744,
            "range": "± 55072",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 770040176,
            "range": "± 10723883",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3314,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 36026,
            "range": "± 133",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 594393,
            "range": "± 1790",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 47382,
            "range": "± 1927",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 529536,
            "range": "± 5322",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7020833,
            "range": "± 509757",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 911,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 10930,
            "range": "± 532",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 182447,
            "range": "± 855",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 17005,
            "range": "± 104",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 118743,
            "range": "± 563",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1111033,
            "range": "± 8434",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "f510645e586a54abc7a6130385d4cbb00568df88",
          "message": "ci: attest the release binary on an ephemeral runner (#782); cap ci-gate (#822) (#826)\n\nrelease-results calls actions/attest-build-provenance on a SHIPPED release\nbinary while running on a persistent self-hosted runner. SLSA Build L3 requires\nan ephemeral, isolated build environment, which a persistent runner does not\nsatisfy, so the provenance published was L2 while the surrounding claim implied\nL3. The defect was the mismatch. Moving to ubuntu-latest, which GitHub tears\ndown per job, earns the level rather than lowering the claim. Cost is a slower\njob with no warm cache, acceptable for the one job whose entire output is a\nsupply-chain assertion about the binary users download. Scope is just this job.\n\nAlso caps ci-gate at 5 minutes. #824 capped every job that existed when it was\nwritten, but ci-gate arrived in #825 afterwards, so it was the last job still\ninheriting the 360-minute default that #822 exists to remove. It only reads\n`needs` results. Every job in the workflow now has an explicit timeout.\n\nRebuilt on main rather than rebased. The rebase conflicted in ci.yml and a\nscripted edit ran against the conflicted file, producing invalid YAML; the two\nchanges here are small enough to re-apply directly and verify by parsing.\n\nRefs: #782, #822",
          "timestamp": "2026-08-20T06:33:49+02:00",
          "tree_id": "b373e602e2d1e4d447956786d280965ef92f602e",
          "url": "https://github.com/pulseengine/rivet/commit/f510645e586a54abc7a6130385d4cbb00568df88"
        },
        "date": 1787202369346,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 82163,
            "range": "± 4358",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 848022,
            "range": "± 19831",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 11963554,
            "range": "± 198067",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2201,
            "range": "± 52",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 22904,
            "range": "± 552",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 359874,
            "range": "± 8404",
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
            "value": 98,
            "range": "± 5",
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
            "value": 1445992,
            "range": "± 44176",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 161114,
            "range": "± 2897",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1865865,
            "range": "± 34721",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 26307444,
            "range": "± 2307946",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 472105,
            "range": "± 4318",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 15921636,
            "range": "± 366392",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1330730969,
            "range": "± 14193736",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4294,
            "range": "± 20",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 59820,
            "range": "± 1025",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 879550,
            "range": "± 3421",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 62100,
            "range": "± 152",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 700250,
            "range": "± 3114",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8765043,
            "range": "± 985455",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1134,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15854,
            "range": "± 143",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 330389,
            "range": "± 6184",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23626,
            "range": "± 185",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 163323,
            "range": "± 806",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1539916,
            "range": "± 23085",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "562a3eb293cad16fbd1f6b37b48ba3fee723d463",
          "message": "fix(validate): dedupe overlapping sources + deterministic diagnostic order (#746) (#759)\n\nOverlapping sources produced duplicate artifacts and a non-deterministic\ndiagnostic order. This dedupes the source set and makes diagnostic ordering\nstable.\n\nMeasured effect on external-artifact ordering, `/api/v1/artifacts?limit=1000\n&origin=all` against the real repo, same input three times:\n\n  main       PROC,REQ,SYS,THR / REQ,THR,SYS,PROC / PROC,REQ,SYS,THR\n  this PR    PROC,REQ,SYS,THR (stable, positions 0-3)\n\nRun 2 on main differs from runs 1 and 3 — ordering was genuinely\nnon-deterministic before this change.\n\nOn the CI failure this PR carried for 14 days: both red jobs were the same\ntest (api_artifacts_external_excluded_under_variant_scope), and it was the\nPREMISE assertion, not the property under test. It did not reproduce on either\nbase across 3 full serve_integration runs plus the whole workspace suite, and\nafter rebasing onto current main it passes on the first attempt with no retry\n(2257 tests run, 2257 passed, 0 flaky). The original root cause was NOT\nestablished. Recording that plainly rather than crediting the rebase: a green\nrun is absence of evidence here, not an explanation. Two hypotheses were\ntested and discarded — a /api/v1/health readiness race (load_externals is\nsynchronous, called before the socket binds) and window truncation (the\nexternals sit at positions 0-3, inside the 1000 cap).\n\nFound while diagnosing it, filed separately rather than fixed here: #832,\n/api/v1/artifacts silently drops 17 of 1017 artifacts at its limit cap with no\ntruncation signal in the response.\n\nFixes: REQ-004\nRefs: REQ-159, #746",
          "timestamp": "2026-08-20T11:09:25+02:00",
          "tree_id": "741720f918732452aa1d315f3d8fab683c19c53f",
          "url": "https://github.com/pulseengine/rivet/commit/562a3eb293cad16fbd1f6b37b48ba3fee723d463"
        },
        "date": 1787217745958,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85092,
            "range": "± 1124",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 900666,
            "range": "± 7784",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13898477,
            "range": "± 852784",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2277,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25777,
            "range": "± 997",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 350356,
            "range": "± 1530",
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
            "value": 95,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1511327,
            "range": "± 37036",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 164629,
            "range": "± 2167",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1950803,
            "range": "± 17028",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 36180103,
            "range": "± 3324509",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 512376,
            "range": "± 2972",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 18448920,
            "range": "± 144953",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1466475660,
            "range": "± 12012034",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4306,
            "range": "± 25",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 61112,
            "range": "± 346",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 779274,
            "range": "± 12586",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 60253,
            "range": "± 298",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 674785,
            "range": "± 4971",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8679207,
            "range": "± 548614",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1075,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14518,
            "range": "± 71",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 320371,
            "range": "± 2167",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23479,
            "range": "± 111",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 163766,
            "range": "± 1460",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1525053,
            "range": "± 20942",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "2418f89b3e2bced4f3e10bce95f300f0c0a39645",
          "message": "fix(test): use CARGO_BIN_EXE_rivet in mcp_integration so release evidence builds (#293) (#834)\n\n`Build test evidence` was red from v0.31.0 through v0.33.1 and the job comment\nblamed a flaky highs-sys WASI cross-compile. That was stale: the failing step\nis `Run tests with JUnit XML`, and the failure is mcp_integration.\n\nrivet_bin() walked up from current_exe() -- pop the filename, pop again only if\nthe parent is named `deps`, append `rivet`, assert it exists. On that runner the\nwalk landed in a build-script OUT_DIR:\n\n  target/debug/build/rivet-cli/e015544e6f99c26d/out/rivet\n\nThe `deps` check did not match, the second pop never happened, and the assert\nreported a wrong guess as a missing binary. Every test in the file died in ~5ms\nthrough all three nextest retries. continue-on-error on the job hid it, so four\nconsecutive releases shipped a compliance bundle containing no test evidence.\n\nCARGO_BIN_EXE_rivet removes the guess: for an integration test cargo builds the\nbinary and substitutes its absolute path at compile time. The other 27\nintegration tests in this directory already used it; this was the only holdout.\n\nReproduced before fixing. Running the test binary from a build-script\nOUT_DIR-shaped path: before exit 101 with the same \"rivet binary not found\"\nmessage shape as CI, after exit 0. Two earlier hypotheses were tested and\ndiscarded and are recorded in the source comment so they are not re-run -- that\nnextest does not build bin targets (it does), and that the self-hosted runners\nmerely had a warm target dir (insufficient).\n\nAlso replaces the stale WASI comment and records what continue-on-error cost\nhere, so the next red on that job is investigated rather than shipped past.\n\nRefs: FEAT-080\nRefs: #293",
          "timestamp": "2026-08-20T11:10:27+02:00",
          "tree_id": "732f90ab21d15927ee79bb0dcac13c52725088e6",
          "url": "https://github.com/pulseengine/rivet/commit/2418f89b3e2bced4f3e10bce95f300f0c0a39645"
        },
        "date": 1787217803390,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85739,
            "range": "± 2025",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 916907,
            "range": "± 12058",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14212563,
            "range": "± 1166747",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2154,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24918,
            "range": "± 114",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 370515,
            "range": "± 1432",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 100,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/1000",
            "value": 101,
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
            "value": 1517123,
            "range": "± 12708",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 164486,
            "range": "± 1051",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1974167,
            "range": "± 16915",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 31134143,
            "range": "± 2371586",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 494016,
            "range": "± 2626",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 18166964,
            "range": "± 106964",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1485884471,
            "range": "± 11944076",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4447,
            "range": "± 21",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 62404,
            "range": "± 1231",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 844545,
            "range": "± 2602",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 56156,
            "range": "± 206",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 682151,
            "range": "± 4782",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7881890,
            "range": "± 197420",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1016,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14886,
            "range": "± 101",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 311729,
            "range": "± 2268",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23303,
            "range": "± 162",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 162997,
            "range": "± 871",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1518800,
            "range": "± 20935",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "3e77beae8db848648050a04cfd973b99d07895f2",
          "message": "feat(cli): rivet context --stdout / --brief (#811) (#813)\n\n`rivet context` gains --stdout and --brief so an agent can pull project context\nwithout a file round-trip (#811).\n\nRebased onto current main before merge. The red Security Audit (RustSec) was\nnot this PR -- it predated the h2 advisory fix already on main, and is green\nafter the rebase. Kani Proofs is red on exit 143 with \"The runner has received\na shutdown signal\", a hosted-runner reclaim rather than a proof break; the job\nis continue-on-error and is deliberately not among ci-gate's needs. CI Gate,\nTest and Security Audit are all green.\n\nThe rebase carried one real conflict in rivet-cli/tests/cli_commands.rs. Both\nsides appended tests at the tail, but the conflict region did not split on a\nfunction boundary -- each side ended mid-assert!, sharing a single `);\\n}` tail\nbelow the marker. A keep-both resolution would have wrapped #812's unterminated\nassert!( around this PR's entire context_test_project() helper and every test\nafter it. Resolved by closing that assert explicitly before this PR's block\nbegins, then verified by compiling rather than by eye: cargo build --tests\nexit 0, and cargo test -p rivet-cli --test cli_commands 168 passed / 0 failed,\nwhich exercises both sides of the conflict.\n\nRefs: FEAT-024\nImplements: REQ-007",
          "timestamp": "2026-08-20T11:10:54+02:00",
          "tree_id": "ecc6edc9285a6021cd59aa8b6a8b956579576eb4",
          "url": "https://github.com/pulseengine/rivet/commit/3e77beae8db848648050a04cfd973b99d07895f2"
        },
        "date": 1787217831727,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84408,
            "range": "± 4850",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 904178,
            "range": "± 4812",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13505129,
            "range": "± 817853",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2300,
            "range": "± 14",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26517,
            "range": "± 206",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 386310,
            "range": "± 2068",
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
            "value": 1497385,
            "range": "± 22394",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 161639,
            "range": "± 644",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1998216,
            "range": "± 6446",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 28512335,
            "range": "± 2686875",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 489406,
            "range": "± 3499",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 18003432,
            "range": "± 155184",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1467818468,
            "range": "± 13782750",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4359,
            "range": "± 66",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 61512,
            "range": "± 275",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 770527,
            "range": "± 2864",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 57253,
            "range": "± 305",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 677717,
            "range": "± 5457",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8394649,
            "range": "± 477132",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1141,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14261,
            "range": "± 59",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 331833,
            "range": "± 1958",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23392,
            "range": "± 400",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 170983,
            "range": "± 3723",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1594694,
            "range": "± 10625",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "b3bc0d37c2998fe76d7ff7cfb34e110495981570",
          "message": "fix(validate,coverage): close the silent-empty-load window (#808) (#818)\n\nA config typo or an empty source loaded zero artifacts while `validate` printed\nPASS and `coverage` printed 100.0% -- loudest-green over nothing read, which for\na compliance tool is the worst failure direction. Four new diagnostics close it:\nartifact-root-key-near-miss, empty-source, unknown-config-key, no-sources.\n`coverage` renders n/a instead of 100.0% for zero-denominator rules and gains\n--strict-empty; --fail-under now fails on an empty load; JSON gains empty_scope.\n\nno-sources is Error by DEFAULT, unlike its three siblings. Those keep\nWarning-by-default because each has a legitimate case -- a fresh project whose\nsource is not yet populated, a downstream repo carrying its own top-level keys\nsuch as sigil's schemas-path:, and a heuristic that can misfire. Zero configured\nsources has none: `rivet init` always scaffolds sources:, verified by a fresh\ninit validating with 0 warnings. Leaving it a warning would have kept the exit\ncode green on exactly the silent-empty-load it detects, because this repo's own\nTraceability gate, the hosted-floor mirror and release.yml all run plain\n`rivet validate` with no --strict.\n\nControls, judged on exit status against main on the same fixtures:\n\n  sigil-shaped config (schemas-path:)   main 0   this 0   compat held\n  mis-keyed typo_sources:               main 0   this 1   gate bites\n  fresh `rivet init`                    main 0   this 0   happy path\n  coverage --fail-under 50 (empty)      main 0   this 1   documented\n  coverage / list / check verif-evid    main 0   this 0   unchanged\n\nSix `rivet: verifies` markers were invisible to the trace graph: the scanner\nregex is ([\\w-]+) and `#` is not a word character, so `verifies #808` matched\nnothing at all rather than reporting a broken link. Five were added here, one\nwas already on main; 593 other markers use artifact ids. Repointed to REQ-294 /\nREQ-298, which moves both out of the `coverage --tests` uncovered list -- the\ndifference between \"merged\" and \"the V is closed\".\n\nRebased twice; both conflicts split mid-statement rather than on a syntax\nboundary. In main.rs each side ended with `diag.source_file = ...` sharing a\nsingle `diagnostics.push(diag);` tail, so keep-both would have silently dropped\none diagnostic by shadowing -- a semantic bug, not a compile error. Verified\nafter resolving that all four diagnostics still fire from their own fixtures.\n\nKani, Proptest (extended) and the rivet-core mutation gate are red and none are\nin ci-gate's needs. Kani is exit 143 runner shutdown. Proptest is the documented\nserve race (api_artifacts_search, status 0 not 200, the exact signature named in\nstart_server()'s own comment) reddening because that job runs `cargo test`\nwithout nextest retries -- filed as #835. CI Gate is SUCCESS with 25 checks\ngreen, and `cargo test --workspace` is exit 0 locally.\n\nImplements: REQ-294\nFixes: REQ-004\nRefs: #808",
          "timestamp": "2026-08-20T12:31:54+02:00",
          "tree_id": "68d4901136d0038cb03299b43a4f175fc1fdf1b6",
          "url": "https://github.com/pulseengine/rivet/commit/b3bc0d37c2998fe76d7ff7cfb34e110495981570"
        },
        "date": 1787222659608,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 86853,
            "range": "± 3371",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 936848,
            "range": "± 10129",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 18762748,
            "range": "± 1442029",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1947,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24682,
            "range": "± 38",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 349490,
            "range": "± 3373",
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
            "value": 1523077,
            "range": "± 24443",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 167273,
            "range": "± 1475",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1999418,
            "range": "± 22742",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 47548422,
            "range": "± 4125381",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 470230,
            "range": "± 7073",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 15760593,
            "range": "± 1381837",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1081910995,
            "range": "± 19388520",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4218,
            "range": "± 10",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 45538,
            "range": "± 180",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 909237,
            "range": "± 33966",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 61717,
            "range": "± 235",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 736269,
            "range": "± 15096",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 12210010,
            "range": "± 419830",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1112,
            "range": "± 11",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15049,
            "range": "± 61",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 257844,
            "range": "± 2205",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21683,
            "range": "± 288",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 149718,
            "range": "± 1252",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1403024,
            "range": "± 9952",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "f8e588c34b075efce97edbfec24092e17e09670e",
          "message": "plan(v0.35): REQ-308 — verify advances on evidence existence, not sufficiency (#838) (#840)\n\nplan(v0.35): REQ-308 — verify advances on evidence existence, not sufficiency (#838)\n\nMaintainer-reported from varve and reproduced in rivet's own v0.34.0 cut the\nsame day, which is why this is filed rather than acknowledged.\n\n`rivet verify REQ-X` refuses correctly when there is NO evidence. When a\n`verifies` marker exists it advances unconditionally, and a marker costs one\ncomment line. The structural issue is granularity: a requirement is a set of\nclauses, a marker attaches to the requirement, so the evidence link is coarser\nthan the claim and the shortfall has no representation. The result is a graph\nthat looks complete, which is worse than one that looks incomplete — readers\nstop reading the requirement text once status reads `verified`.\n\nOur own instance: REQ-298 was flipped to `verified` during the v0.34.0 release\nwith its third clause knowingly undischarged (52 flat top-level commands\nremain), while `coverage --tests` reported \"REQ-298  1 test marker\" —\nindistinguishable from full discharge. The residual was hand-carried into\nREQ-307 plus commit prose, i.e. the reporter's option (3) improvised by hand.\nThe trace graph does not carry that caveat, so the caveat is not traceable,\nwhich is the property the tool exists to provide.\n\nDegenerate variant found the same day: a marker matching nothing reports as\nneither present nor broken. Six such markers used issue numbers where the\nscanner accepts only word characters and hyphens, against 593 valid ones.\n\nRecommended ordering differs from the issue's: option (2), making\n`partially-verifies` BLOCK rather than annotate, should land before option (1).\nIt needs no schema change and converts the common case into a refusal, whereas\nper-clause markers require clauses to become addressable — a migration across\nevery existing artifact. Also flagged that option (3)'s clause indices drift\nwhenever description prose is edited, so the clause text must be recorded\nalongside the index.\n\nRefs: REQ-307, #838",
          "timestamp": "2026-08-21T14:32:12+02:00",
          "tree_id": "272e745f2ca3d3159c27ff18363cd7159b987352",
          "url": "https://github.com/pulseengine/rivet/commit/f8e588c34b075efce97edbfec24092e17e09670e"
        },
        "date": 1787316294725,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 83878,
            "range": "± 442",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 934666,
            "range": "± 5685",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 15348998,
            "range": "± 1143057",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2142,
            "range": "± 66",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26732,
            "range": "± 142",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 387919,
            "range": "± 2120",
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
            "value": 96,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1518341,
            "range": "± 41409",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 160715,
            "range": "± 1495",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1927648,
            "range": "± 13020",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 30637456,
            "range": "± 2201055",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 504400,
            "range": "± 1754",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 16779840,
            "range": "± 206012",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1315846588,
            "range": "± 11202885",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4446,
            "range": "± 11",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60297,
            "range": "± 249",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 803830,
            "range": "± 3931",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 61799,
            "range": "± 859",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 692892,
            "range": "± 6137",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8765880,
            "range": "± 783569",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1142,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14198,
            "range": "± 35",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 324134,
            "range": "± 1851",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22790,
            "range": "± 150",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 165439,
            "range": "± 1957",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1517967,
            "range": "± 24251",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "6ab55ac1163193d8e71f0bc20e173129103c9fb3",
          "message": "fix(render): raise the serve/export palette to WCAG AA (REQ-276) (#842)\n\nCustomer-reported low contrast in the dashboard and the static compliance\nexport, which share rivet-cli/src/render/styles.rs.\n\nOracle first: six unit tests compute WCAG 2.1 relative luminance over the\npalette and assert 4.5:1 for body text, 3:1 for large text and UI. They parse\nhex values OUT OF the live CSS constant instead of copying them, so a\nstylesheet edit cannot drift away from its own audit. The suite was red on\nthree pairs before any colour changed -- accent on --bg 3.20:1, accent on\n--surface 3.48:1, white-on-accent 3.48:1 -- matching the values measured when\nthe requirement was triaged.\n\nFix: accent #3a86ff -> #2059b8, accent-hover #2568d6 -> #18458d, hue preserved\nand chosen for headroom rather than the bare minimum (worst pair 5.07:1, not\n4.60:1). 27 translucent rgba washes reshaded to the new rgb so tints match the\ncolour they tint. .stat-orange #e67e22 -> #c66c1d.\n\nThree findings the requirement's own audit did not have:\n\n  1. The reported pair does not occur. No element paints white text on --bg.\n     What a reader actually saw is the white label on the primary button\n     (3.48:1) and every link (3.20:1). Both real, both fixed.\n  2. Accent text sits on rgba(accent,.08/.12) washes in id chips, inline mono\n     tags and source-line highlights. Composited, three of those measured\n     4.08-4.42:1 and failed. A naive fg/bg audit cannot see them because the\n     background is translucent rather than a palette variable, so the test\n     composites alpha.\n  3. .stat-orange measured 2.85:1 on --surface, failing even the 3:1\n     large-text bar.\n\nRemoved the drift class behind (2) and (3) rather than fixing instances: five\nhand-copied hex literals of the accent lived OUTSIDE the CSS -- in stats.rs,\nsource.rs, doc_linkage.rs and serve/layout.rs -- still painting the old blue\nafter the palette moved. styles::ACCENT_HEX is now the source of truth, one\ntest asserts the CSS agrees with it, and a static scan fails if the retired\nvalue reappears anywhere.\n\nThe scan's first version listed only render/ modules and missed\nserve/layout.rs, which was the one file still painting the retired tint under\nnew-accent text. Widened, and the scan is negative-controlled: injecting\n#3a86ff into stats.rs turns it red and names the file; removing it turns it\ngreen.\n\nVerified in rendered output rather than in source alone: `rivet export --format\nhtml` and `rivet serve` both emit --accent #2059b8 with zero retired\nreferences. (One match remains in artifacts/REQ-276.html, where the\nrequirement's own prose quotes the old hex.)\n\nConfirmed with cargo fmt --check, clippy --all-targets -D warnings on 1.97.0,\ncargo test --workspace (exit 0, 65 ok), rivet validate and rivet docs check --\nall exit 0.\n\nImplements: REQ-276\nVerifies: REQ-276",
          "timestamp": "2026-08-22T10:40:41+02:00",
          "tree_id": "d66ecadff4f502d0d87cabb5e3e839b2bad385a5",
          "url": "https://github.com/pulseengine/rivet/commit/6ab55ac1163193d8e71f0bc20e173129103c9fb3"
        },
        "date": 1787388667943,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 67629,
            "range": "± 2912",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 738715,
            "range": "± 2984",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13024659,
            "range": "± 1380431",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1473,
            "range": "± 65",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 17970,
            "range": "± 661",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 251833,
            "range": "± 12449",
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
            "value": 1167816,
            "range": "± 43304",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 126478,
            "range": "± 885",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1486732,
            "range": "± 29512",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 30560062,
            "range": "± 1587461",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 356229,
            "range": "± 29454",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 11595257,
            "range": "± 127171",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 828365146,
            "range": "± 8650155",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3283,
            "range": "± 44",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 35250,
            "range": "± 188",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 566762,
            "range": "± 9543",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 47909,
            "range": "± 126",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 529057,
            "range": "± 2786",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 6255974,
            "range": "± 250553",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 859,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 11226,
            "range": "± 24",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 184013,
            "range": "± 892",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 16510,
            "range": "± 33",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 112486,
            "range": "± 954",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1042829,
            "range": "± 6111",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "36f2cd76edaf3e7793308a7a1a56bb82f3214387",
          "message": "feat(serve,export): render the test-result trace as a fold/expand tree (REQ-274) (#843)\n\nCustomer-reported: deep chains — the ASPICE sw-req <- sw-detail-design <-\nunit-verification shape — rendered as a flat table. REQ-001 produces 40 hops of\nundifferentiated rows.\n\nThe data was already a tree and nobody used it. trace_test_results walks\nbreadth-first with a `seen` set, so every reached artifact has exactly one\nvia_target; it returns that tree flattened. as_tree restores the shape and\nrenders through the existing collapsible_tree component. Native <details> means\nno JavaScript, so one change serves `rivet serve` AND the static export --\nverified identical in both, 3 foldable branches plus 37 leaf lines.\n\nThe load-bearing invariant is that a folded view contains every hop: a branch\nthat silently stops rendering is indistinguishable from one merely collapsed.\ntree_preserves_every_node pins it, negative-controlled (\"tree dropped nodes:\n2 in, 1 out\").\n\nTwo presentation corrections came from looking at real output rather than the\nsynthetic case. Leaves render as plain lines, because a disclosure triangle over\n\"no further hops\" is noise and the first version was no more readable than the\ntable. And a large trace opens nothing by default -- 33 expanded siblings is the\nsame wall -- while a small one still opens its first level.\n\nThe rivet-core mutation gate then found 4 survivors in this code, and acting on\nthem exposed a real defect rather than a test gap: the `depth > 64` guard was\nuntested, and testing it showed it silently dropped the entire subtree past that\ndepth -- the exact node loss the invariant forbids. Replaced with a current-path\nvisited set, so cycles still terminate but a 200-deep chain renders in full. The\npreservation sweep was also generalised: it previously re-homed only\nunknown-parent orphans, so a cycle disconnected from the root still vanished.\n\nKani is red on exit 143, the advisory hosted-runner failure tracked in #839; it\nis not among ci-gate's needs. CI Gate is SUCCESS with 27 checks green.\n\nImplements: REQ-274\nVerifies: REQ-274",
          "timestamp": "2026-08-26T01:12:52+02:00",
          "tree_id": "006e57ef0ad9b57372f99265228a4ac0d06b451e",
          "url": "https://github.com/pulseengine/rivet/commit/36f2cd76edaf3e7793308a7a1a56bb82f3214387"
        },
        "date": 1787707026784,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85093,
            "range": "± 3119",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 910997,
            "range": "± 20561",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14369027,
            "range": "± 1567773",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1954,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 23224,
            "range": "± 77",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 339239,
            "range": "± 2202",
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
            "value": 1503224,
            "range": "± 14175",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 168807,
            "range": "± 936",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1954695,
            "range": "± 13911",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 27123206,
            "range": "± 270550",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 467708,
            "range": "± 2223",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 15497080,
            "range": "± 133899",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1107585686,
            "range": "± 19776647",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4452,
            "range": "± 83",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 44760,
            "range": "± 141",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 763217,
            "range": "± 7465",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 66436,
            "range": "± 269",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 733283,
            "range": "± 4464",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8336318,
            "range": "± 653417",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1263,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14704,
            "range": "± 29",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 245638,
            "range": "± 7948",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21526,
            "range": "± 74",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 148092,
            "range": "± 1822",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1374328,
            "range": "± 42208",
            "unit": "ns/iter"
          }
        ]
      }
    ]
  }
}