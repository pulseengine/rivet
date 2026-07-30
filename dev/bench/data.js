window.BENCHMARK_DATA = {
  "lastUpdate": 1785392954716,
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
      },
      {
        "commit": {
          "author": {
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
          "id": "173fedd1af502f3c321e72c82a3292ce9d20ced2",
          "message": "fix(variant): validate binding artifact IDs + constraint feature names exist (REQ-258, REQ-259, DD-076) (#705)\n\nTwo P0 linkage-validation gaps (DD-076, fail-loud over silent-pass):\n\nREQ-258 — a binding mapping a feature to a nonexistent artifact ID (e.g.\nGHOST-999) flowed through silently. `rivet validate --model --binding` now\nchecks every bound artifact ID against the loaded store and ERRORS on a\ndangling id (this is the layer with store access; feature_model::solve has no\nartifact knowledge). Also FIXES the committed-broken\nartifacts/variants/full-desktop.yaml, which selected 30+ features absent from\nthe model — it now selects real features (core-cli + dashboard), and the model's\n`scope` group is widened `alternative`→`or` so a composite CLI+dashboard build\nis expressible without breaking the single-surface variants.\n\nREQ-259 — a constraint referencing a feature NAME not in the model was\nvacuously satisfied (a typo silently disabled the guard). solve() now walks\neach constraint's feature-name leaves and emits SolveError::UnknownConstraintFeature\non an unknown name, instead of a silent pass.\n\nConfirmed with new tests (validate_flags_dangling_artifact_id_in_binding,\nconstraint_referencing_unknown_feature_fails_loud + regressions), the full\nvariant/feature-model suite (62 rivet-core + 35 rivet-cli variant tests, all\npass — the alternative→or model change regresses nothing), `rivet variant check`\non the fixed full-desktop (exit 0), a build, clippy --all-targets on Rust 1.97\nclean, and `rivet validate` PASS.\n\nImplements: REQ-258, REQ-259\nRefs: DD-076, FEAT-001",
          "timestamp": "2026-07-15T17:40:48+02:00",
          "tree_id": "c3ae227b81c500abeac8386b0c0e5b443292f811",
          "url": "https://github.com/pulseengine/rivet/commit/173fedd1af502f3c321e72c82a3292ce9d20ced2"
        },
        "date": 1784130570755,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 87130,
            "range": "± 1982",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 936405,
            "range": "± 12246",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 17968510,
            "range": "± 1873314",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1941,
            "range": "± 55",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24846,
            "range": "± 103",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 360662,
            "range": "± 2082",
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
            "value": 1525859,
            "range": "± 15710",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 165241,
            "range": "± 6983",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1911826,
            "range": "± 24321",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 40289197,
            "range": "± 2716851",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 449018,
            "range": "± 2035",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 15406607,
            "range": "± 177550",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1088962131,
            "range": "± 17426581",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4273,
            "range": "± 16",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 45092,
            "range": "± 308",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 748028,
            "range": "± 14384",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 63313,
            "range": "± 370",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 729145,
            "range": "± 5509",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8739637,
            "range": "± 559912",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1275,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14890,
            "range": "± 278",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 228777,
            "range": "± 2398",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21387,
            "range": "± 41",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 151236,
            "range": "± 890",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1390990,
            "range": "± 35368",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "a97d168da185fb7795d4002609143f487085c3ed",
          "message": "Merge pull request #706 from pulseengine/release/v0.27.0\n\nchore(release): v0.27.0",
          "timestamp": "2026-07-15T17:58:59+02:00",
          "tree_id": "7397f7c00ea80138128b40ee82b460cec862c057",
          "url": "https://github.com/pulseengine/rivet/commit/a97d168da185fb7795d4002609143f487085c3ed"
        },
        "date": 1784131688521,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 86821,
            "range": "± 236",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 924443,
            "range": "± 15190",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 19080093,
            "range": "± 995586",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2183,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24601,
            "range": "± 446",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 370845,
            "range": "± 1946",
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
            "value": 1515810,
            "range": "± 74568",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 163531,
            "range": "± 1058",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1976500,
            "range": "± 16620",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 44054119,
            "range": "± 4185273",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 484904,
            "range": "± 7955",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 16344817,
            "range": "± 220643",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1274271924,
            "range": "± 13844883",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4317,
            "range": "± 25",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 63287,
            "range": "± 1477",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 768567,
            "range": "± 8994",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 57460,
            "range": "± 300",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 696133,
            "range": "± 8494",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 11192024,
            "range": "± 795662",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1136,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14846,
            "range": "± 317",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 318510,
            "range": "± 19913",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23246,
            "range": "± 156",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 169071,
            "range": "± 1292",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1515947,
            "range": "± 18630",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "bfb1efef4644f50f6fb87ce0d7eda103b10c57ba",
          "message": "ci(toolchain): pin nightly to 2026-07-11 while upstream nightly ICEs (REQ-267) (#707)\n\n* ci(toolchain): pin nightly to 2026-07-11 while upstream nightly ICEs (REQ-267)\n\nNightlies from 2026-07-14 on ICE the compiler while building rivet-core (rustc\npanic in rustc_ast/src/attr/mod.rs, exit 104), reddening every nightly job\nrepo-wide — both Miri jobs, Code Coverage, and Fuzz — and masking the Miri\nUB/safety signal. Core gates (Test/Clippy/Format) stayed green so main was\nhealthy, but CI read red and merges had to --admin past the cluster.\n\nPin all four `dtolnay/rust-toolchain@nightly` uses to `@nightly-2026-07-11`\n(the last main run where the Miri job passed) so they keep ENFORCING on a\nworking compiler rather than being disabled. Unpin to @nightly once a newer\nnightly stops ICEing. Kani's exit-143 failures are a separate runner-shutdown\nflake, unaffected by this.\n\nCI-config only — the shipped binary is unchanged, so no version bump.\nConfirmed ci.yml parses and `rivet validate` PASS.\n\nRefs: REQ-267\n\n* ci(toolchain): fix pin syntax — @master + toolchain input, not action git-ref\n\nThe previous commit pinned via `dtolnay/rust-toolchain@nightly-2026-07-11`,\nbut `@X` is the ACTION's git ref (branch/tag of dtolnay/rust-toolchain), so it\nfailed to resolve (\"unable to find version nightly-2026-07-11\"). Correct form\nis `@master` with the dated toolchain as the `toolchain:` input; the two Miri\njobs keep their `components: miri`. Still REQ-267 (pin to last-good nightly\nwhile upstream ICEs).\n\nTrace: skip\n\n* ci(security): SHA-pin the dtolnay/rust-toolchain action for the nightly jobs (REQ-267)\n\nAutomated security review flagged `@master` as an unpinned third-party action.\nPin the 4 nightly jobs' action ref to a full commit SHA\n(fa04a1451ff1842e2626ccb99004d0195b455a88, dtolnay/rust-toolchain 2026-06-30)\nso the action code is deterministic; the dated toolchain (nightly-2026-07-11)\nstays in the `with: toolchain:` input. `@master` was required (not `@stable`/\n`@nightly`) because only the master branch honours an arbitrary `toolchain:`\noverride — SHA-pinning it removes the mutable-ref risk. (The rest of the file's\n@stable/@nightly dtolnay refs are a pre-existing repo convention; a repo-wide\nSHA-pin sweep is a separate hardening task.)\n\nTrace: skip",
          "timestamp": "2026-07-15T23:46:53+02:00",
          "tree_id": "f80f7995994c391069052961ff0ed2e67808abde",
          "url": "https://github.com/pulseengine/rivet/commit/bfb1efef4644f50f6fb87ce0d7eda103b10c57ba"
        },
        "date": 1784152792893,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 87265,
            "range": "± 352",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 955129,
            "range": "± 17178",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 23509988,
            "range": "± 1477157",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1934,
            "range": "± 19",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24983,
            "range": "± 203",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 362776,
            "range": "± 2342",
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
            "value": 1531698,
            "range": "± 25379",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 169146,
            "range": "± 2677",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1985076,
            "range": "± 107200",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 58682970,
            "range": "± 6171765",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 456187,
            "range": "± 7522",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 16017557,
            "range": "± 340128",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1108502506,
            "range": "± 16409790",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4223,
            "range": "± 14",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 44609,
            "range": "± 278",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 733529,
            "range": "± 3871",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 63529,
            "range": "± 183",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 730439,
            "range": "± 3211",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 10986165,
            "range": "± 810426",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1146,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14510,
            "range": "± 25",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 229707,
            "range": "± 1882",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21863,
            "range": "± 256",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 152651,
            "range": "± 738",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1401719,
            "range": "± 21812",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "0b44048bee8959b33d5e94e125e7fabba30a81c5",
          "message": "plan(roadmap): sequence v0.28-v0.30 — retag REQ-265/266 → v0.29, file REQ-268 (wasm-seam gate) → v0.30 (#708)\n\nApproved release roadmap after v0.27.0:\n- v0.28.0 = variant hardening pt2 / P1 silent-drops (REQ-260 discover .ok(),\n  REQ-261 attribute_warnings, REQ-262 serve wrapped-variant, REQ-263 CI variant\n  gate) — unchanged.\n- v0.29.0 = variant source-linkage + verification depth (REQ-265, REQ-266),\n  retagged from v0.28 so v0.28 stays a cohesive P1 slice.\n- v0.30.0 = CI resilience — REQ-268 (new): a per-PR CI gate that builds the wasm\n  seam (compose-witness component + `wasm` feature), which today builds only in\n  release.yml, so a change can rot the meld→loom→synth seam undetected.\n\nParked (cross-repo blocked): REQ-252 (crates.io), REQ-255 (ordeal cert).\nConfirmed with `rivet validate` PASS. (Local `docs check` shows a false\nVersionConsistency positive from a stale 0.26.0 dev binary; all files are 0.27.0\nand CI's fresh binary passes.)\n\nRefs: REQ-260, REQ-261, REQ-262, REQ-263, REQ-265, REQ-266, REQ-268, DD-076",
          "timestamp": "2026-07-16T00:26:14+02:00",
          "tree_id": "6f3babbacefb6f3a31e90cffac04e42f07f4b07f",
          "url": "https://github.com/pulseengine/rivet/commit/0b44048bee8959b33d5e94e125e7fabba30a81c5"
        },
        "date": 1784155031161,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85309,
            "range": "± 774",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 917662,
            "range": "± 9249",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 15055148,
            "range": "± 507504",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2146,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26339,
            "range": "± 858",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 360918,
            "range": "± 3313",
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
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1519001,
            "range": "± 19671",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 162832,
            "range": "± 2540",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1941880,
            "range": "± 20064",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 31321621,
            "range": "± 2028789",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 471441,
            "range": "± 2680",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 15637395,
            "range": "± 191741",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1239610419,
            "range": "± 13679419",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4437,
            "range": "± 16",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60362,
            "range": "± 300",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 786184,
            "range": "± 5630",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 61469,
            "range": "± 201",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 704224,
            "range": "± 4625",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7571726,
            "range": "± 204864",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1100,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14281,
            "range": "± 156",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 331066,
            "range": "± 2640",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23805,
            "range": "± 282",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 164864,
            "range": "± 1832",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1504347,
            "range": "± 17241",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "b8da491f415cfc715197e65da55af573fe12a59a",
          "message": "fix(serve): variant discovery surfaces parse errors + reads wrapped variant files (REQ-260, REQ-262, DD-076) (#709)\n\nTwo P1 silent-drops in ProjectVariants::discover (DD-076):\n\nREQ-260 — the three `.ok()` sites swallowed parse failures: a broken (malformed\n/ cyclic / attribute-invalid) feature-model.yaml became model:None and resolve()\nreported the misleading \"no feature model configured\", while a broken\nbindings.yaml rendered artifact_count:0 silently. discover now captures failures\ninto `model_error` + `diagnostics`, logs them, and the /variants page shows a red\n\"Feature model failed to load\" / \"configuration files could not be parsed\" banner\ninstead of \"no variants configured\". resolve() distinguishes model-present-but-\nbroken (returns the parse error) from model-absent (the friendly hint).\n\nREQ-262 — variant files were parsed with raw `serde_yaml::from_str::<VariantConfig>`\n(flat shape only), so an init-scaffolded `variant:`-wrapped file was silently\ninvisible in serve (the #514 regression on the serve path). Now uses\nVariantConfig::from_yaml_str (accepts both shapes); model loading switched\nfrom from_yaml to load() so a composed feature-model-binding file isn't dropped.\n\nConfirmed with 4 new discover tests (broken-model diagnostic, absent-vs-broken,\nwrapped-shape, flat regression; 11 serve::variant + 8 variant_scoped_api pass),\nbuild, clippy --all-targets on Rust 1.97 clean, and fresh-binary rivet validate PASS.\n\nImplements: REQ-260, REQ-262\nRefs: DD-076, FEAT-001",
          "timestamp": "2026-07-16T01:56:11+02:00",
          "tree_id": "870ac39566739e20fd695c3d999a817da9bf6310",
          "url": "https://github.com/pulseengine/rivet/commit/b8da491f415cfc715197e65da55af573fe12a59a"
        },
        "date": 1784160837342,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 87280,
            "range": "± 3007",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 911725,
            "range": "± 5685",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14617137,
            "range": "± 1295802",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2186,
            "range": "± 9",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26081,
            "range": "± 132",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 383212,
            "range": "± 3502",
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
            "value": 1522249,
            "range": "± 41295",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 164114,
            "range": "± 1646",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1951282,
            "range": "± 14925",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 29296156,
            "range": "± 3523731",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 477696,
            "range": "± 3454",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 15619662,
            "range": "± 204549",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1245865096,
            "range": "± 12669821",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4420,
            "range": "± 14",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 58460,
            "range": "± 231",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 814105,
            "range": "± 6890",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 60532,
            "range": "± 231",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 696906,
            "range": "± 2726",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7977061,
            "range": "± 1008369",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1148,
            "range": "± 11",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 13844,
            "range": "± 339",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 335546,
            "range": "± 2581",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22878,
            "range": "± 86",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 161068,
            "range": "± 5637",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1500480,
            "range": "± 21730",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "961f3a367a1baa27fa853398b7048b149333823a",
          "message": "fix(variant): surface feature-model attribute_warnings on the CLI (REQ-261, DD-076) (#711)\n\nFeatureModel.attribute_warnings (unknown feature-attribute keys) was collected\nat load but never surfaced by any CLI path — a typo'd attribute key (e.g.\n`asil-numric: 3`) silently bypassed type/range checking AND its warning was\ndropped (DD-076 silent-drop).\n\nEmit the warnings from the single shared loader load_feature_model_via_project,\nso every consumer (validate --model --binding, release check --variant, variant\nsolve/check/check-all/features) prints each as `warning: feature-model\nattribute: <msg>` on stderr (stdout --format json stays clean). Under\n`rivet validate --strict-variants` the warnings escalate to Severity::Error\ndiagnostics and fail the run (non-zero exit), matching the existing\nstrict-variant mechanism.\n\nConfirmed with 3 new cli_commands tests (surfaces-on-stderr, --strict-variants\nescalation, known-keys-no-warning regression) + the full validate/variant sweep\n(30 pass), build, clippy --all-targets on Rust 1.97 clean, fresh-binary\nrivet validate PASS.\n\nImplements: REQ-261\nRefs: DD-076, FEAT-001",
          "timestamp": "2026-07-16T06:34:04+02:00",
          "tree_id": "d87920c063c50c37ccdcca11c0285f29a2d8ae05",
          "url": "https://github.com/pulseengine/rivet/commit/961f3a367a1baa27fa853398b7048b149333823a"
        },
        "date": 1784176967700,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 80728,
            "range": "± 4253",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 942437,
            "range": "± 5141",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 16157612,
            "range": "± 1430630",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1540,
            "range": "± 10",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 18884,
            "range": "± 207",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 288063,
            "range": "± 3947",
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
            "value": 75,
            "range": "± 1",
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
            "value": 1401807,
            "range": "± 22859",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 164674,
            "range": "± 1336",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1890877,
            "range": "± 22493",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 40389503,
            "range": "± 1649390",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 422879,
            "range": "± 4092",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 14831450,
            "range": "± 263584",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 993112886,
            "range": "± 7101749",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3838,
            "range": "± 26",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 40830,
            "range": "± 1804",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 825641,
            "range": "± 9310",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 55585,
            "range": "± 958",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 572672,
            "range": "± 5133",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7492817,
            "range": "± 558856",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 969,
            "range": "± 10",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 12084,
            "range": "± 149",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 284930,
            "range": "± 3800",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 20582,
            "range": "± 289",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 149694,
            "range": "± 1890",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1328358,
            "range": "± 16289",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "aab1c32bf0117dbaf72a52c67660bfe33797abfd",
          "message": "ci(variant): gate PRs on variant + binding soundness (REQ-263, DD-076) (#712)\n\nNo CI gate exercised the project's variants or bindings — the committed-broken\nfull-desktop.yaml (30+ nonexistent features) shipped precisely because nothing\nran it (DD-076). Add a step to the existing Traceability job (which already\nbuilds + runs `rivet validate`, so no extra compile) that:\n- solves every artifacts/variants/*.yaml against the feature model\n  (`rivet variant check --model --variant`), failing on UnknownFeature etc.;\n- validates artifacts/bindings.yaml with `validate --model --binding\n  --strict-variants` — dangling artifact IDs (REQ-258), unknown constraint\n  feature names (REQ-259), and unknown attribute keys (REQ-261) all fail here.\n\n`set -euo pipefail` + non-zero exits mean any broken variant/binding fails the\nPR. Runs on every PR (the Traceability job is not paths-gated) so variant\nbreakage can't slip in through a non-Rust change either.\n\nConfirmed the gate's exact commands pass locally on the current variants\n(dashboard-only/full-desktop/minimal-ci all exit 0; binding validation exit 0)\nwith a fresh binary, and ci.yml parses.\n\nRefs: REQ-263, REQ-258, REQ-259, REQ-261, DD-076",
          "timestamp": "2026-07-16T07:24:40+02:00",
          "tree_id": "e177ee04f4d1a6e1b055126e31eb4c317a2edf1d",
          "url": "https://github.com/pulseengine/rivet/commit/aab1c32bf0117dbaf72a52c67660bfe33797abfd"
        },
        "date": 1784186232046,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 86494,
            "range": "± 1637",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 903608,
            "range": "± 5232",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13151613,
            "range": "± 716958",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2181,
            "range": "± 15",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25887,
            "range": "± 101",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 365471,
            "range": "± 6984",
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
            "value": 1517255,
            "range": "± 25960",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 164371,
            "range": "± 1230",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1978834,
            "range": "± 7795",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 27967089,
            "range": "± 1485278",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 476974,
            "range": "± 3734",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 15655840,
            "range": "± 136444",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1232990060,
            "range": "± 10477607",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4510,
            "range": "± 297",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 58024,
            "range": "± 282",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 849168,
            "range": "± 4436",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 62415,
            "range": "± 343",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 699958,
            "range": "± 15225",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8343125,
            "range": "± 546157",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1149,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15111,
            "range": "± 710",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 340464,
            "range": "± 1984",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23516,
            "range": "± 154",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 165461,
            "range": "± 3801",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1502947,
            "range": "± 11180",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "8abbb627ce381b2b5e21a37ae6efc267a18a9e22",
          "message": "chore(release): v0.28.0 — variant hardening P1 (silent-drops) (#713)\n\nBumps workspace + Cargo.lock + VS Code extension to 0.28.0 and adds the\nCHANGELOG section. Ships the variant-hardening P1 slice (DD-076: a broken\nconfig must fail loud, not present as absent):\n\n- REQ-260 — serve variant discovery surfaces parse errors instead of\n  .ok()-swallowing a broken model into a misleading \"no model configured\".\n- REQ-261 — unknown feature-attribute keys (attribute_warnings) now reach\n  rivet validate; --strict-variants escalates them to a nonzero exit.\n- REQ-262 — serve accepts the variant:-wrapped shape (regression of #514\n  on the serve path); wrapped + composed binding files are honored.\n- REQ-263 — CI Traceability job gates PRs on variant check + binding\n  validation, so a broken variant/binding can no longer ship.\n\nSelf-verify with the fresh 0.28.0 binary: build OK, rivet validate PASS,\nrivet docs check PASS (0 violations — VersionConsistency clean).\n\nRefs: REQ-260, REQ-261, REQ-262, REQ-263, DD-076",
          "timestamp": "2026-07-16T08:07:10+02:00",
          "tree_id": "bfe65c9b88f4aaa71bb95a09b5abfdffb17a8c06",
          "url": "https://github.com/pulseengine/rivet/commit/8abbb627ce381b2b5e21a37ae6efc267a18a9e22"
        },
        "date": 1784187006896,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 69126,
            "range": "± 437",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 740783,
            "range": "± 5800",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13631766,
            "range": "± 1668376",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1522,
            "range": "± 25",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 18584,
            "range": "± 46",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 265291,
            "range": "± 954",
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
            "value": 1181005,
            "range": "± 22486",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 126830,
            "range": "± 655",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1495979,
            "range": "± 9916",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 24116044,
            "range": "± 1956355",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 341875,
            "range": "± 3801",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 11276807,
            "range": "± 269977",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 762756012,
            "range": "± 8858190",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3215,
            "range": "± 15",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 34302,
            "range": "± 168",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 555669,
            "range": "± 4285",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 46183,
            "range": "± 131",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 521705,
            "range": "± 2750",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 6163298,
            "range": "± 202417",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 904,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 11284,
            "range": "± 99",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 172570,
            "range": "± 970",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 17012,
            "range": "± 124",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 117738,
            "range": "± 295",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1102249,
            "range": "± 26378",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "ab9b24cad5fdd6114b19d75a097c814e1ff457a4",
          "message": "test(feature-model): fuzz the constraint solver (REQ-266) (#715)\n\nThe proptest strategies hard-coded `constraints: vec![]`, so the solver's\nhighest-risk code — cross-tree constraint evaluation, `implies`\npropagation, `excludes`, and REQ-257's fail-loud gate — had ZERO\nproperty-test coverage. Add:\n\n- A constraint-generating strategy (implies/excludes/and/or/not over real\n  feature-name leaves) kept as a typed value so the property can evaluate\n  each constraint independently — an oracle to grade the solver against.\n- prop_ok_means_constraints_actually_hold: if solve() returns Ok, every\n  constraint genuinely holds under the resolved selection. This is the\n  anti-silent-pass property — a return to the pre-REQ-257 `_ => true`\n  blind spot would surface here as an Ok whose selection violates a\n  constraint.\n- prop_implies_propagation + prop_solver_never_panics_with_constraints.\n- Deterministic fail-loud tests: an unevaluatable attribute comparison\n  yields UnevaluatableConstraint (REQ-257); a constraint naming a\n  nonexistent feature yields UnknownConstraintFeature (REQ-259).\n\nAlso surfaces a real latent bug: a shared child reachable through two\nparents (a diamond / DAG) is mis-reported as a cycle by validate_tree's\nBFS (global-visited-as-cycle). Filed as REQ-269 with a regression test\n(diamond_shared_child_is_not_a_cycle, #[ignore]d until the fix); confirmed\nfailing with \"cycle detected involving feature `shared`\".\n\nConfirmed with `cargo test -p rivet-core --test proptest_feature_model`\n(12 passed, 1 ignored) and clippy --all-targets clean. Test-only + artifact\nchange; the wasm seam is untouched.\n\nImplements: REQ-266\nVerifies: REQ-257, REQ-259\nRefs: REQ-269, DD-076",
          "timestamp": "2026-07-16T13:14:22+02:00",
          "tree_id": "6e7cf7b780b6b4f02134fb0d13848672adcbe953",
          "url": "https://github.com/pulseengine/rivet/commit/ab9b24cad5fdd6114b19d75a097c814e1ff457a4"
        },
        "date": 1784201295334,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 86734,
            "range": "± 874",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 926130,
            "range": "± 15973",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14888303,
            "range": "± 269521",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1921,
            "range": "± 9",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24756,
            "range": "± 44",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 370986,
            "range": "± 1827",
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
            "value": 1528479,
            "range": "± 12076",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 167973,
            "range": "± 1381",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1954981,
            "range": "± 14794",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 27468467,
            "range": "± 313851",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 451218,
            "range": "± 13303",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 15075675,
            "range": "± 116844",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1106346029,
            "range": "± 13290622",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4354,
            "range": "± 44",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 43980,
            "range": "± 781",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 765916,
            "range": "± 15112",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 63177,
            "range": "± 203",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 722107,
            "range": "± 7460",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8101319,
            "range": "± 96439",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1115,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14974,
            "range": "± 276",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 223850,
            "range": "± 972",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21695,
            "range": "± 71",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 152321,
            "range": "± 1793",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1410144,
            "range": "± 51551",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "2ff1c0997c385f123bbfc6332d453c18b046dc12",
          "message": "fix(feature-model): don't mis-report a shared child as a cycle (REQ-269) (#716)\n\n`validate_tree`'s cycle detection used a single global `visited` set with a\nBFS and reported EVERY second encounter of a node as a cycle. A feature\nreachable through two parents — a diamond / DAG, e.g. `root -> {a, b}` with\n`a -> shared` and `b -> shared` — was enqueued from both parents, dequeued\ntwice, and wrongly rejected with \"cycle detected involving feature `shared`\".\nReal feature models legitimately share a sub-feature under two branches.\n\nReplace the BFS with an iterative DFS that tracks the current path (the\nrecursion stack) separately from fully-explored nodes:\n- A node re-encountered while still ON the current path is a genuine cycle\n  (a back edge — a feature that is its own ancestor). Still rejected.\n- A node reached again by a disjoint path (a shared child) is fully\n  explored, so it is skipped, not flagged.\n\nThe parent link remains last-writer-wins (unchanged, acceptable); only the\ntraversal's cycle criterion changes.\n\nTests: un-ignored `diamond_shared_child_is_not_a_cycle` (now passing) and\nadded `genuine_cycle_is_rejected` as a guard that real cycles still error.\n\nConfirmed with the full feature_model + variant suites (proptest 14, lib\nfeature_model 62, variant_gap_check 2, variant_phase2 8 — all green),\nclippy --all-targets clean, and the wasm seam builds\n(`cargo build -p rivet-cli --features wasm` OK — composition core touched,\nWIT/component unchanged so no cargo-component rebuild needed).\n\nFixes: REQ-269\nVerifies: REQ-269\nRefs: REQ-266",
          "timestamp": "2026-07-16T17:20:08+02:00",
          "tree_id": "4e53cff94a25d32c0affb1a3c45d0f901ba752a7",
          "url": "https://github.com/pulseengine/rivet/commit/2ff1c0997c385f123bbfc6332d453c18b046dc12"
        },
        "date": 1784215945234,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85241,
            "range": "± 909",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 933824,
            "range": "± 3918",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13728534,
            "range": "± 209676",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1954,
            "range": "± 51",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24839,
            "range": "± 72",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 363391,
            "range": "± 1564",
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
            "value": 1508567,
            "range": "± 14738",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 168760,
            "range": "± 907",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1962139,
            "range": "± 7803",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 27739820,
            "range": "± 208735",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 449286,
            "range": "± 2792",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 15353423,
            "range": "± 127795",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1128699732,
            "range": "± 21181441",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4202,
            "range": "± 18",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 44662,
            "range": "± 165",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 759556,
            "range": "± 2943",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 63176,
            "range": "± 291",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 730528,
            "range": "± 3079",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8161043,
            "range": "± 62517",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1187,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 13589,
            "range": "± 39",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 229887,
            "range": "± 3997",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22642,
            "range": "± 178",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 154158,
            "range": "± 489",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1444347,
            "range": "± 18501",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "2df2fe4378e6b02f583a8ebe868cd49832896cb0",
          "message": "feat(serve): variant source-linkage slices a+b — honest external links, no scope leak (REQ-265) (#717)\n\nDD-077 scopes REQ-265 (variant source-linkage completeness) into four\nindependently-shippable slices. This lands the two small serve-side ones:\n\nSlice (a) — external source links are honest. `resolve_source_file` fell\nback to the raw absolute path for an external artifact (source_file outside\nthe project root), producing a link the `/source` path-traversal guard then\nrejects: a dead link. Return None for out-of-project paths so the UI renders\nno link rather than a broken one. (Serving external source from a configured\nexternal root is a larger, security-sensitive follow-on, deferred.)\n\nSlice (b) — variant scope leak. The `/artifacts` external loop added\nexternals without consulting `variant_scope`, so a variant-scoped view still\nshowed unscoped externals. An external artifact has no binding to this\nproject's feature model and cannot be variant-scoped, so under an active\nvariant it is now excluded — mirroring the existing stats/diagnostics\nexclusion.\n\nTests: three unit tests for `resolve_source_file` (in-project relative,\nexternal None, absent None); a serve integration test asserting `origin=all`\nincludes the `spar:` externals but `origin=all&variant=minimal-ci` excludes\nevery external-origin row.\n\nSlices (c) binding source-globs reach serve and (d) `export --variant`\nremain; REQ-265 stays proposed until all four land. Confirmed with the new\ntests, clippy --all-targets clean, rivet validate + docs check PASS. Serve\nonly — composition core and wasm seam untouched.\n\nRefs: REQ-265, DD-077",
          "timestamp": "2026-07-16T21:57:48+02:00",
          "tree_id": "6df2fc8eb54aadbf487ca9d15647865a1511de40",
          "url": "https://github.com/pulseengine/rivet/commit/2df2fe4378e6b02f583a8ebe868cd49832896cb0"
        },
        "date": 1784236853344,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85336,
            "range": "± 1948",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 901701,
            "range": "± 7840",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 16811394,
            "range": "± 1106292",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2163,
            "range": "± 33",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25886,
            "range": "± 49",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 389050,
            "range": "± 3077",
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
            "value": 1527993,
            "range": "± 11108",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 164550,
            "range": "± 1689",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1938229,
            "range": "± 29658",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 30142961,
            "range": "± 1838566",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 472246,
            "range": "± 5347",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 15972370,
            "range": "± 306786",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1325880980,
            "range": "± 13635291",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4281,
            "range": "± 13",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 61702,
            "range": "± 423",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 748772,
            "range": "± 9023",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 61611,
            "range": "± 266",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 704344,
            "range": "± 3598",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7901116,
            "range": "± 361661",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1129,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14486,
            "range": "± 168",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 334923,
            "range": "± 3828",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23873,
            "range": "± 116",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 169340,
            "range": "± 759",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1578522,
            "range": "± 18727",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "3735bc27a99591d21651452a947ea1dc75827f9c",
          "message": "feat(variant): disk-verify the source manifest, fail-loud on missing bases (REQ-265c) (#719)\n\n`rivet variant manifest` emitted each binding's `source:` globs unverified —\na manifest pointing at nonexistent directories exited 0, so an auditor\nrelying on it could not tell the sources were absent (DD-077 slice c).\n\nNow the command verifies every glob's literal base directory (the leading\npath components before the first `*`/`?`/`[`/`{`) against disk under the\nproject root, and:\n- always WARNS loudly on stderr for a missing base (text and json), and\n  adds a `source_warnings` array to the JSON output;\n- under a new `--strict` flag, escalates a missing base to a nonzero exit —\n  mirroring `validate --strict-variants`.\n\nVerification is host-side (rivet-cli), not in the composition core, so the\nwasm seam is untouched. A pattern that begins with a wildcard is anchored at\nthe root and skipped; a literal path with no metacharacters is checked whole.\n\nTests: warns-but-exits-0 on a missing base, `--strict` fails, and no warning\nwhen the base exists. Confirmed with the variant_manifest suite (6 passing),\ncli_commands (157 passing — clap-change guard), clippy --all-targets clean,\nrivet validate + docs check PASS.\n\nSlice (d) `export --variant` and serve manifest-surfacing remain; REQ-265\nstays proposed until they land.\n\nRefs: REQ-265, DD-077",
          "timestamp": "2026-07-17T04:44:29+02:00",
          "tree_id": "cfcded2196f105374666fe98d76c34d05a3642d1",
          "url": "https://github.com/pulseengine/rivet/commit/3735bc27a99591d21651452a947ea1dc75827f9c"
        },
        "date": 1784256814052,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84763,
            "range": "± 2588",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 906237,
            "range": "± 20254",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 15032143,
            "range": "± 1049076",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2150,
            "range": "± 115",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25482,
            "range": "± 217",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 364106,
            "range": "± 2563",
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
            "value": 96,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1525008,
            "range": "± 54402",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 163243,
            "range": "± 1379",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1916742,
            "range": "± 14194",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 32349998,
            "range": "± 1367540",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 473903,
            "range": "± 3330",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 15836641,
            "range": "± 231992",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1321765364,
            "range": "± 14722691",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4389,
            "range": "± 22",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 61223,
            "range": "± 259",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 839551,
            "range": "± 31917",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 61836,
            "range": "± 263",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 703645,
            "range": "± 17235",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8309048,
            "range": "± 804228",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1099,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14047,
            "range": "± 42",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 340558,
            "range": "± 2955",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 24237,
            "range": "± 603",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 171662,
            "range": "± 712",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1603378,
            "range": "± 48873",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "8a013aaa8ef612801a1640102a6d01b2cce61c35",
          "message": "feat(schema): dev ships a native verification type so requirements can reach verified (#721) (#723)\n\nThe dev schema declared the `requirement-verification` rule (SR-46: every\nrequirement should have an incoming `verifies` backlink) but shipped NO\nartifact type that could SOURCE a `verifies` link to a `requirement`. Link\nemission is target-type authorized (validate.rs: a link is allowed only if\nthe source type's link-field lists the target's type), and no type in\ncommon/dev declared `verifies -> requirement`. So `type: requirement` (dev)\nwas structurally unable to reach `verified` on any project — the rule could\nnever be cleared. The ASPICE bridge only reaches `sw-req`, and retyping\nrequirement -> sw-req cascades into `swe1-derives-from-sys` (needs a whole\nsystem layer), so there was no proportionate path.\n\nAdd a dev-native `verification` type with a required `verifies -> [requirement]`\nlink-field (method/baseline/cited-source fields), so a lightweight dev-only\nproject can close the right side of its own V without adopting a heavier\nprocess schema. Chosen over the aspice-bridge options (#721 options 1/3) as\nthe root-cause fix: it makes dev satisfy its OWN rule.\n\nBumps dev@0.2.0 -> 0.3.0 (new type). Schema-only change; composition core and\nwasm seam untouched.\n\nConfirmed on a scaffolded dev project: a `verification` that `verifies` a\nrequirement is authorized (no forbidden-target error) and clears SR-46, while\nan unverified requirement still warns. docs_schema suite (27 passing, incl the\nnew `dev_verification_type_can_verify_requirement`), clippy --all-targets\nclean, rivet validate + docs check PASS, schema-version-bump OK.\n\nCloses #721\nImplements: REQ-270\nRefs: REQ-010",
          "timestamp": "2026-07-17T13:24:54+02:00",
          "tree_id": "819f7f566a77bdb71e8fd0838eeefe41a6165f72",
          "url": "https://github.com/pulseengine/rivet/commit/8a013aaa8ef612801a1640102a6d01b2cce61c35"
        },
        "date": 1784288023882,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85605,
            "range": "± 1774",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 930057,
            "range": "± 4639",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14276248,
            "range": "± 1201226",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1943,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24649,
            "range": "± 173",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 373270,
            "range": "± 2429",
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
            "value": 1514876,
            "range": "± 11073",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 167552,
            "range": "± 650",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1937257,
            "range": "± 17430",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 38631259,
            "range": "± 3014766",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 448632,
            "range": "± 1701",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 15267058,
            "range": "± 333389",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1128018063,
            "range": "± 26817888",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4154,
            "range": "± 11",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 44758,
            "range": "± 154",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 752825,
            "range": "± 6027",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 62882,
            "range": "± 132",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 727532,
            "range": "± 3885",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8835483,
            "range": "± 972682",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1009,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14391,
            "range": "± 56",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 231707,
            "range": "± 2666",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22007,
            "range": "± 105",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 154562,
            "range": "± 489",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1444634,
            "range": "± 20657",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "6a4753fd417ce0a54dd8f79f5b0df1d3453f2e30",
          "message": "feat(export): --variant applies the per-variant field overlay (REQ-265d) (#728)\n\nCompletes REQ-265 (DD-077 slice d). `rivet export` gains `--variant <NAME>`\n(name or path), so a variant-scoped compliance export needs no hand-translation\nof IDs into an s-expr `--filter`.\n\nThe variant is resolved ONCE in cmd_export (via the shared resolve_variant_arg,\nmatching list/query), and a new `apply_variant_overlay` helper — mirroring the\nin-place rewrite `query --variant` performs — replaces each artifact's top-level\n`fields` with its `fields_for_variant` merged view before export. It is applied\nafter baseline scope in every export path: reqif / generic-yaml (cmd_export),\nzola, gherkin, and html (the html/compliance-bundle path overlays state.store\nand rebuilds the link graph, so the single-page audit bundle is variant-scoped\ntoo — no silent drop). A `None` variant is a no-op.\n\nWith this, REQ-265 (variant source-linkage completeness) is fully implemented:\n(a) honest external source links, (b) no variant scope leak, (c) disk-verified\nsource manifest, (d) export --variant.\n\nConfirmed on the phase2 fixture (max-temp-c 80 default → 100 under `industrial`):\n`export --variant industrial` bakes 100 into the top-level field, plain export\nkeeps 80. variant_phase2 (9 passing incl the new test), export_zola/reqif\nregression, cli_commands (157 — clap-change guard), clippy --all-targets clean,\nrivet validate + docs check PASS. rivet-cli only; wasm seam untouched.\n\nImplements: REQ-265\nRefs: DD-077",
          "timestamp": "2026-07-21T21:05:22+02:00",
          "tree_id": "e7d1e8ba332e07177efb1f0bf29776aecf68e2ab",
          "url": "https://github.com/pulseengine/rivet/commit/6a4753fd417ce0a54dd8f79f5b0df1d3453f2e30"
        },
        "date": 1784661485517,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 86262,
            "range": "± 1103",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 888157,
            "range": "± 3267",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13034627,
            "range": "± 658917",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2119,
            "range": "± 17",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26658,
            "range": "± 456",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 368299,
            "range": "± 1168",
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
            "value": 95,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1529804,
            "range": "± 12351",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 167007,
            "range": "± 1639",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1964643,
            "range": "± 5619",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 28169865,
            "range": "± 2771480",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 477644,
            "range": "± 1790",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 15601775,
            "range": "± 168184",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1300092132,
            "range": "± 16733906",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4280,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 62668,
            "range": "± 214",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 754206,
            "range": "± 6122",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 61623,
            "range": "± 290",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 689943,
            "range": "± 2322",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7745644,
            "range": "± 331748",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1131,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15233,
            "range": "± 380",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 321380,
            "range": "± 1675",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23978,
            "range": "± 344",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 171701,
            "range": "± 1047",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1589349,
            "range": "± 22108",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "4621251e254c31dd984659c4f9b593db8f437750",
          "message": "chore(release): v0.29.0 — variant source-linkage + V-model bridge (#729)\n\nBumps workspace + Cargo.lock + VS Code extension to 0.29.0 and adds the\nCHANGELOG section. Ships v0.29.0 scope:\n\n- REQ-265 variant source-linkage completeness (a: honest external links,\n  b: no serve scope leak, c: disk-verified source manifest, d: export --variant)\n- REQ-266 constraint-solver property-test coverage (was zero)\n- REQ-269 diamond/DAG shared child no longer mis-reported as a cycle\n- REQ-270 dev-native `verification` type so a requirement can mechanically\n  reach verified (dev@0.2.0 -> 0.3.0, closes #721)\n\nSelf-verify with the fresh 0.29.0 binary: build OK, rivet validate PASS,\nrivet docs check PASS (0 violations).\n\nImplements: REQ-265, REQ-266, REQ-270\nFixes: REQ-269",
          "timestamp": "2026-07-21T22:24:55+02:00",
          "tree_id": "0d554a0e01a6522c7d747226ecee88a23f7a9117",
          "url": "https://github.com/pulseengine/rivet/commit/4621251e254c31dd984659c4f9b593db8f437750"
        },
        "date": 1784665901554,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 46066,
            "range": "± 264",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 558364,
            "range": "± 1940",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 8663888,
            "range": "± 132881",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1029,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 11898,
            "range": "± 29",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 211241,
            "range": "± 2166",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 47,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/1000",
            "value": 47,
            "range": "± 0",
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
            "value": 804080,
            "range": "± 3824",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 103989,
            "range": "± 309",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1195197,
            "range": "± 7964",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 15674734,
            "range": "± 92717",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 257247,
            "range": "± 605",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 7699318,
            "range": "± 35429",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 525622112,
            "range": "± 5274995",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 2522,
            "range": "± 21",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 24476,
            "range": "± 135",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 412351,
            "range": "± 972",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 34179,
            "range": "± 46",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 359866,
            "range": "± 431",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 4152169,
            "range": "± 5646",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 474,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 6572,
            "range": "± 55",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 112531,
            "range": "± 1119",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 11981,
            "range": "± 27",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 86086,
            "range": "± 146",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 788343,
            "range": "± 3313",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "665961e74be987dfa4c92a90cd6450a76c2aa683",
          "message": "plan(v0.30): CI resilience + compliance-export robustness (#731)\n\nFiles the v0.30.0 scope as requirements (release: v0.30.0):\n- REQ-268 per-PR wasm-seam CI gate (compose-witness + wasm feature) — the\n  depth anchor; the seam is built only in release.yml today, so a change\n  can rot it undetected until release.\n- REQ-271 self-hosted runner disk cleanup that actually frees space (#567) —\n  prune cargo/bazel/docker caches + /tmp, report before/after free bytes.\n- REQ-272 CI single-point-of-failure mitigation (#509 slice 2) — a hosted\n  ubuntu-latest fallback for the light gates so a self-hosted outage does\n  not zero out all main verification; keep compile-heavy gates self-hosted.\n- REQ-273 static compliance export: honest AADL fallback (#468) — replace\n  the misleading forever-\"Loading AADL diagram...\" with an honest fallback,\n  and wire the export-time inline-SVG path to auto-activate once a real\n  spar_wasm component is embedded (real SVG is cross-repo blocked on\n  spar#259; this ships the unblocked user-visible fix).\n\nConfirmed with rivet validate PASS.\n\nRefs: REQ-268, REQ-271, REQ-272, REQ-273",
          "timestamp": "2026-07-22T08:41:12+02:00",
          "tree_id": "67b23963091efc05f35c7932befdc336310ff375",
          "url": "https://github.com/pulseengine/rivet/commit/665961e74be987dfa4c92a90cd6450a76c2aa683"
        },
        "date": 1784714598103,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 87947,
            "range": "± 2481",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 967570,
            "range": "± 5111",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14274285,
            "range": "± 398086",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1953,
            "range": "± 12",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24883,
            "range": "± 44",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 366252,
            "range": "± 1095",
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
            "value": 99,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 99,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1555426,
            "range": "± 15336",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 174827,
            "range": "± 813",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 2051147,
            "range": "± 6700",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 28433020,
            "range": "± 264304",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 465154,
            "range": "± 1537",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 15615635,
            "range": "± 156298",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1141534133,
            "range": "± 22095488",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4267,
            "range": "± 13",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 46299,
            "range": "± 357",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 757287,
            "range": "± 9388",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 65095,
            "range": "± 192",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 737322,
            "range": "± 15568",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8065828,
            "range": "± 49254",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1196,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14243,
            "range": "± 27",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 223643,
            "range": "± 1956",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22759,
            "range": "± 184",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 158263,
            "range": "± 438",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1481621,
            "range": "± 11382",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "ae8925fab829bf6bb4441db1feb13ae4be079c3c",
          "message": "ci(resilience): wasm-seam gate + disk cleanup + hosted traceability fallback (#732)\n\nThree v0.30 CI-resilience slices in one coherent workflow change:\n\nREQ-268 — per-PR wasm SEAM build gate. The composition core is exposed as a\nWasm component (compose-witness + WIT) plus the host `wasm` feature, consumed\ndownstream (melded → loomed → synth'd). Built only in release.yml today, so a\nchange can rot the seam undetected until release. Adds a narrow `wasm`\npaths-filter to the `changes` job and a `wasm-seam` job that runs\n`cargo build -p rivet-cli --features wasm` — the host-side wasmtime path\n(cheap, reliable, no wasi-sdk), which exercises wasm_runtime.rs + the wasmtime\nintegration + the composition core the component wraps. The full\nwasm32-wasip2 component build (cargo-component, which generates\ncompose-witness's gitignored bindings.rs) stays in release.yml.\n\nREQ-271 (#567) — self-hosted runner disk cleanup that actually frees space. A\nreusable .github/actions/free-space composite action prunes docker / bazel /\ncargo caches + /tmp and reports before/after free bytes so the effect is\nauditable — not a silent no-op like the old post-job hook. Wired into the\nwasm-seam job; reusable by any compile-heavy job.\n\nREQ-272 (#509 slice 2) — single-point-of-failure mitigation. Every gate runs\nself-hosted, so an outage zeroes out all of main's verification (slice 1\nshipped the liveness alert). Adds a traceability-hosted-fallback job that\nmirrors `rivet validate` on GitHub-hosted ubuntu-latest, push-to-main only, so\na self-hosted outage cannot leave a main commit with zero traceability\nverification. Compile-heavy gates stay self-hosted; this is a floor.\n\nConfirmed: cargo build -p rivet-cli --features wasm builds (exit 0);\nactionlint + yamllint clean on the new jobs/action; rivet validate PASS.\n\nImplements: REQ-268, REQ-271, REQ-272\nRefs: REQ-051",
          "timestamp": "2026-07-23T13:13:21+02:00",
          "tree_id": "21c774e763a5bd52dc06a104104d79e7751ab696",
          "url": "https://github.com/pulseengine/rivet/commit/ae8925fab829bf6bb4441db1feb13ae4be079c3c"
        },
        "date": 1784806829788,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85233,
            "range": "± 3444",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 931889,
            "range": "± 17359",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 18189065,
            "range": "± 1055720",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1988,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24880,
            "range": "± 105",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 358549,
            "range": "± 7922",
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
            "value": 1530225,
            "range": "± 29653",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 167792,
            "range": "± 2100",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1980751,
            "range": "± 22226",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 36409049,
            "range": "± 3000924",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 454487,
            "range": "± 7923",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 15945353,
            "range": "± 720350",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1141193270,
            "range": "± 19952386",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4204,
            "range": "± 97",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 46014,
            "range": "± 304",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 794289,
            "range": "± 9105",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 65112,
            "range": "± 1828",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 732004,
            "range": "± 2749",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 9113875,
            "range": "± 691440",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1118,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14431,
            "range": "± 81",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 227595,
            "range": "± 13987",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22531,
            "range": "± 1905",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 157242,
            "range": "± 1183",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1451743,
            "range": "± 30449",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "77faf5e81fb59b9f442d526c59877a3ac7f0e1c4",
          "message": "fix(export): honest AADL static-export fallback + embed source (REQ-273, #468) (#734)\n\nA static compliance export has no `rivet serve` JS to fill the `.aadl-diagram`\nplaceholder. The perpetual \"Loading AADL diagram...\" read as a hung/broken\nreport (#468). A prior fix (REQ-200) already replaced that TEXT post-hoc in the\nexport wrappers; this fixes it at the render SOURCE and goes further — it\nembeds the raw AADL source:\n\n- document.rs (render_to_html) and render/artifacts.rs now emit an honest\n  placeholder — text true in both modes (serve replaces the container with the\n  SVG on success; a static bundle keeps it) — PLUS the raw AADL in a\n  collapsible <details>, so a static compliance report shows the architecture\n  textually instead of a dead spinner. The post-hoc string-replacements\n  (wrap_page, static_aadl_fallback) become harmless no-ops (the old string is\n  no longer emitted).\n\nThe interactive inline SVG still depends on a published spar-wasm asset\n(cross-repo, spar#259 — build.rs ships a stub); that remains for when spar\npublishes the browser bundle. This ships the unblocked user-visible fix.\n\nAlso files the v0.31 UX backlog from customer requests (release: v0.31.0):\n- REQ-274 test-result trace collapsible tree view (fold/expand, serve+export)\n- REQ-275 human tag filter (select all / unselect all / filter box)\n- REQ-276 color-contrast audit (fix white-on-light-grey to WCAG AA)\n\nConfirmed: document AADL test + export_html #468 test pass; clippy clean;\nrivet validate + docs check PASS.\n\nFixes: REQ-273\nRefs: REQ-274, REQ-275, REQ-276",
          "timestamp": "2026-07-23T15:18:26+02:00",
          "tree_id": "2c8eca90f044c6ff148d518c3588b862c0132fcc",
          "url": "https://github.com/pulseengine/rivet/commit/77faf5e81fb59b9f442d526c59877a3ac7f0e1c4"
        },
        "date": 1784814132805,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85804,
            "range": "± 1299",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 894609,
            "range": "± 3797",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12120251,
            "range": "± 687305",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2127,
            "range": "± 79",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 27663,
            "range": "± 143",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 369164,
            "range": "± 3896",
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
            "value": 1533679,
            "range": "± 29651",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 165533,
            "range": "± 1980",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1965430,
            "range": "± 11497",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 25097093,
            "range": "± 269208",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 471257,
            "range": "± 43132",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 15443144,
            "range": "± 176660",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1269210584,
            "range": "± 17113922",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4384,
            "range": "± 11",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60404,
            "range": "± 296",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 770682,
            "range": "± 28012",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 62994,
            "range": "± 257",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 691513,
            "range": "± 3068",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7692632,
            "range": "± 76073",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1147,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 13880,
            "range": "± 56",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 315117,
            "range": "± 7138",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 24262,
            "range": "± 335",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 165454,
            "range": "± 947",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1560046,
            "range": "± 28738",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "5914b0180430c5485aac72d761c1aa28a7ad5a77",
          "message": "chore(release): v0.30.0 — CI resilience + compliance-export robustness (#736)\n\nBumps workspace 0.29.0 -> 0.30.0 (rivet-core, rivet-cli, etch) + vscode-rivet.\n\nv0.30 scope (all implemented + merged, CI-green):\n- REQ-268 per-PR wasm-seam CI gate (#732)\n- REQ-271 self-hosted runner disk cleanup (#567, #732)\n- REQ-272 hosted traceability fallback (#509, #732)\n- REQ-273 honest AADL static-export fallback (#468, #734)\n\nTrace: skip",
          "timestamp": "2026-07-23T15:49:56+02:00",
          "tree_id": "08e760535eccafeda4185161fae77295def5a59f",
          "url": "https://github.com/pulseengine/rivet/commit/5914b0180430c5485aac72d761c1aa28a7ad5a77"
        },
        "date": 1784816079252,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85335,
            "range": "± 825",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 908049,
            "range": "± 8170",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 16007276,
            "range": "± 747919",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2304,
            "range": "± 10",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26108,
            "range": "± 322",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 393135,
            "range": "± 5501",
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
            "value": 1541951,
            "range": "± 34399",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 161433,
            "range": "± 1062",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1860874,
            "range": "± 16056",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 26825206,
            "range": "± 2992802",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 478258,
            "range": "± 3479",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 15196572,
            "range": "± 245819",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1210215703,
            "range": "± 16192350",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4334,
            "range": "± 34",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 62229,
            "range": "± 1040",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 800729,
            "range": "± 15496",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 58104,
            "range": "± 586",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 699780,
            "range": "± 3065",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8235343,
            "range": "± 340531",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1132,
            "range": "± 22",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14342,
            "range": "± 75",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 332235,
            "range": "± 3740",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23997,
            "range": "± 262",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 171265,
            "range": "± 4692",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1586028,
            "range": "± 38380",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "3d03ee384f7283b64a2b3b3db1ada85bd6bc1f93",
          "message": "feat(schema): ordeal-certificate evidence artifact type (#693 Part 2) (#743)\n\nDeclare the `ordeal-certificate` embedded schema — rivet's description of\nan ordeal-cert/v1 bundle (ordeal v0.17.0, cert-bundle feature, ordeal\nPR 107): produced-by / checked-by tool blocks, attests\n(kind/claim/standards), cnf-sha256/cnf-ref + proof-sha256/proof-ref\ncontent addressing, and a structured recheck block (command,\nexpect-exit), with field names corresponding recognizably to the\nupstream envelope.\n\nSemantics baked into the schema, not prose:\n\n- A typed `attests-transform` link-field (inverse\n  `transform-attested-by`) with allowed targets [requirement, feature,\n  design-decision, aadl-component], enforced by the existing\n  link-target-type check.\n- Re-checked counts, never-re-checked does not: validation rule\n  `V-ordeal-cert-recheck-gates-verifies` (error) requires\n  `verification-result: pass` (the recorded outcome of running\n  recheck.command with the expected exit code) on any certificate that\n  sources `verifies` links — so a re-checked certificate satisfies\n  requirement-verification coverage like any verification artifact,\n  while a never-re-checked one fails `rivet validate` instead of\n  silently counting.\n- Honest SAT boundary: `sat` verdicts carry a self-checked model (no\n  independently re-checkable SAT witness yet; UNSAT is the\n  certificate-carrying verdict) — warning rule\n  `V-ordeal-cert-sat-is-self-checked` when used as a verifies source,\n  and the unsat-only conditional rule\n  `unsat-cert-carries-recheckable-pair` requires checked-by +\n  both content hashes.\n- v1 inline-only reader boundary: `cnf-ref`/`proof-ref` indirection is\n  a legible Unsupported-class validation error\n  (`V-ordeal-cert-v1-inline-only`), mirroring ordeal's\n  BundleError::Unsupported.\n\nShips: golden fixture that round-trips byte-identically through the\nlossless CST parser and validates clean; link-target-type,\ncoverage-split, ref-indirection, recheckable-pair and SAT-boundary\ntests (rivet-core/tests/ordeal_certificate_schema.rs); end-to-end\n`rivet validate` CLI tests over tmpdir projects\n(rivet-cli/tests/ordeal_certificate.rs); docs topic\n`rivet docs schema/ordeal-certificate` backed by\ndocs/artifact-types/ordeal-certificate.md; docs/schemas.md row;\nCHANGELOG entry; REQ-277.\n\nPart 1 of rivet#693 (--certify shell-out to ordeal, CI wiring,\nrules_ordeal gate, UNSAT-core diagnostics) is explicitly out of scope.\n\nImplements: REQ-277\nRefs: ordeal#67, #693\n\n\nClaude-Session: https://claude.ai/code/session_01EBJ6kdJ16E3hnsBbq9Lwf1\n\nCo-authored-by: Claude Opus 4.8 <noreply@anthropic.com>",
          "timestamp": "2026-07-30T07:46:16+02:00",
          "tree_id": "c098ac1c4ac5c5022b1abf4a798b70bacb62f0eb",
          "url": "https://github.com/pulseengine/rivet/commit/3d03ee384f7283b64a2b3b3db1ada85bd6bc1f93"
        },
        "date": 1785392953993,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85637,
            "range": "± 561",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 920088,
            "range": "± 6773",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14734541,
            "range": "± 647426",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1988,
            "range": "± 18",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24185,
            "range": "± 207",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 342767,
            "range": "± 1994",
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
            "value": 1511834,
            "range": "± 20577",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 167186,
            "range": "± 614",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1946327,
            "range": "± 10885",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 29226976,
            "range": "± 2129627",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 453916,
            "range": "± 7526",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 14792623,
            "range": "± 260121",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1053140348,
            "range": "± 17884749",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4216,
            "range": "± 21",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 44614,
            "range": "± 201",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 818689,
            "range": "± 9484",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 61062,
            "range": "± 161",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 739968,
            "range": "± 2260",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 9171430,
            "range": "± 402956",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1175,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14532,
            "range": "± 952",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 226741,
            "range": "± 1748",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22325,
            "range": "± 63",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 156894,
            "range": "± 2080",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1460447,
            "range": "± 10663",
            "unit": "ns/iter"
          }
        ]
      }
    ]
  }
}