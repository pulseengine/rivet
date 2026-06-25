window.BENCHMARK_DATA = {
  "lastUpdate": 1782383063372,
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
      },
      {
        "commit": {
          "author": {
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
          "id": "71fb5f372747feb780f0311653e74f6dbb7e3fff",
          "message": "fix(schema): load bundled bridge schemas by name in a consumer's schemas: list (REQ-221, #530) (#558)\n\nBundled bridges (`stpa-dev.bridge`, `eu-ai-act-stpa.bridge`, …) ship embedded\nand define cross-domain trace links (`constraint-satisfies`, etc.), but the\nloader only auto-discovered them from the loaded schema set — it never resolved\na bridge by explicit name. A consumer (wohl) that listed `stpa-dev.bridge` in\n`rivet.yaml` got `schema '…' not found on disk or as embedded schema`, with no\nway to pull a bridge whose endpoints weren't both already loaded.\n\nEvery name-resolution path (load_schemas_with_fallback, the content loader, and\nschema_sources) now falls back to embedded_bridge(name) after embedded_schema;\nalready-listed bridges are skipped by auto-discovery (no double-load). The\nnot-found error now points at the `.bridge` stem naming + `rivet schema presets`.\n\nConfirmed: a project with `schemas: [common, stpa, stpa-dev.bridge]` validates\nPASS and reports `stpa-dev.bridge@0.1.0 (embedded)` with no spurious warning;\nnew `bundled_bridges_are_loadable_by_explicit_name` test; `cargo test\n-p rivet-core` green; clippy --all-targets + fmt clean; rivet validate PASS.\n\nImplements: REQ-221\nRefs: REQ-010\n\nCo-authored-by: Claude Opus 4.8 <noreply@anthropic.com>",
          "timestamp": "2026-06-23T01:59:40-05:00",
          "tree_id": "efed5274ee60226666b6f239fd5cd731d2fc539a",
          "url": "https://github.com/pulseengine/rivet/commit/71fb5f372747feb780f0311653e74f6dbb7e3fff"
        },
        "date": 1782199249162,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 77295,
            "range": "± 435",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 947055,
            "range": "± 19570",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 24753001,
            "range": "± 3708666",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1701,
            "range": "± 22",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 19354,
            "range": "± 84",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 366265,
            "range": "± 1050",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 87,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/1000",
            "value": 87,
            "range": "± 1",
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
            "value": 1370925,
            "range": "± 35102",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 160657,
            "range": "± 3236",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1948338,
            "range": "± 114621",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 75041834,
            "range": "± 3544462",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 417563,
            "range": "± 1294",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 17832342,
            "range": "± 291612",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1140983682,
            "range": "± 7250223",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3899,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 41506,
            "range": "± 77",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 778539,
            "range": "± 22486",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 52948,
            "range": "± 395",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 591806,
            "range": "± 3029",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 12306579,
            "range": "± 642694",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 986,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 12811,
            "range": "± 39",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 324778,
            "range": "± 5817",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22644,
            "range": "± 202",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 168538,
            "range": "± 422",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1594117,
            "range": "± 14311",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "b2534188e00a34a739e5761a3210eabc2937bc49",
          "message": "fix(add): create a default file for a new artifact type instead of forcing --file (REQ-223, #552) (#562)\n\n`rivet add --type design-decision` (a type both the schema and `rivet add --help`\nadvertise) failed with \"no existing file found for type … Use --file\" whenever\nno file already held that type — so you could not add the FIRST artifact of a\ntype without hand-picking a file.\n\nWhen no file holds the type and no --file is given, `rivet add` now synthesizes a\ndefault path in the project's first generic-yaml source (e.g.\nartifacts/design-decisions.yaml for design-decision), creating it with an\n`artifacts:` header if absent, then appends. Existing routing (a file already\nholding the type, or explicit --file) is unchanged.\n\nThe other two parts of #552 were already resolved: special-char field/link values\nare YAML-quoted on write (REQ-198/199 — verified here across adversarial inputs\nincl. leading `:`/`*`/`{`, `#`, `yes`/`null`/`123`); the next-id prefix is learned\nfrom existing same-type artifacts, which is intentional.\n\nConfirmed: `rivet add --type design-decision` in a fresh dev project creates\nartifacts/design-decisions.yaml and adds; new `add_creates_default_file_for_a_new_type`\ntest; `cargo test -p rivet-cli --test cli_commands` green; fmt + clippy clean.\n\nImplements: REQ-223\nRefs: REQ-007\n\nCo-authored-by: Claude Opus 4.8 <noreply@anthropic.com>",
          "timestamp": "2026-06-23T02:53:26-05:00",
          "tree_id": "38e37996fbc2f0876d4137c07658392882675a4c",
          "url": "https://github.com/pulseengine/rivet/commit/b2534188e00a34a739e5761a3210eabc2937bc49"
        },
        "date": 1782201750736,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84001,
            "range": "± 1923",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 892408,
            "range": "± 12545",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13527253,
            "range": "± 602889",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2212,
            "range": "± 11",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26393,
            "range": "± 205",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 375016,
            "range": "± 3274",
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
            "value": 1459210,
            "range": "± 24604",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 162703,
            "range": "± 1059",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1927331,
            "range": "± 13962",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 27025560,
            "range": "± 1188385",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 456986,
            "range": "± 2257",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 16611676,
            "range": "± 138745",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1416142091,
            "range": "± 9070685",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4260,
            "range": "± 16",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 61161,
            "range": "± 270",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 751497,
            "range": "± 2421",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 58456,
            "range": "± 466",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 687620,
            "range": "± 1639",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7787258,
            "range": "± 172510",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1162,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15071,
            "range": "± 80",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 328111,
            "range": "± 2773",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 24782,
            "range": "± 140",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 184170,
            "range": "± 1020",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1709409,
            "range": "± 23384",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "5f63ca3c5ef864ed2ac9ae837b89d6dca306c0af",
          "message": "feat(schema): per-type status enum overrides the global lifecycle (REQ-224, #550) (#563)\n\nThe base `status` field declares one global lifecycle (draft→…→released,\n+accepted), but some types have their own: an `ai-found-defect` moves\nopen → triaged → resolved. A downstream store (jess) using `status: open` /\n`resolved` on its defects hit 27 `status-allowed-values` ERRORs and couldn't\nupgrade off its v0.15.0 pin (slice 3 of #522).\n\nA type may now declare its OWN `status` field with `allowed-values`; the status\ncheck — at validate time, in `rivet add`/`modify`, and in the remediation help —\nprefers the type's enum and falls back to the global base-field enum.\n`common.yaml` declares `status: [open, triaged, resolved]` on `ai-found-defect`\n(distinct from its release-gating `triage-status`). common 0.1.0 → 0.2.0.\n\nConfirmed: an ai-found-defect with `status: open`/`resolved` validates clean,\n`status: bogus` errors against `[open, triaged, resolved]`, and a requirement\nstill validates against the global enum. New\n`per_type_status_field_overrides_global_enum` test; `cargo test -p rivet-core`\ngreen; fmt + clippy clean; `rivet validate` + `rivet docs check` PASS.\n\nImplements: REQ-224\nVerifies: REQ-135\n\nCo-authored-by: Claude Opus 4.8 <noreply@anthropic.com>",
          "timestamp": "2026-06-23T03:21:05-05:00",
          "tree_id": "fdbce9776ca5ff0e56e806ddbba614c1fe472fee",
          "url": "https://github.com/pulseengine/rivet/commit/5f63ca3c5ef864ed2ac9ae837b89d6dca306c0af"
        },
        "date": 1782203410695,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 83513,
            "range": "± 556",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 890762,
            "range": "± 7590",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12688878,
            "range": "± 496824",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2157,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26164,
            "range": "± 188",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 371944,
            "range": "± 1989",
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
            "value": 1485396,
            "range": "± 14224",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 159876,
            "range": "± 877",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1880687,
            "range": "± 16054",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 24381662,
            "range": "± 817149",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 470848,
            "range": "± 4704",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 17066598,
            "range": "± 160463",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1459382989,
            "range": "± 11141227",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4305,
            "range": "± 23",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 61197,
            "range": "± 479",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 804708,
            "range": "± 4199",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 62743,
            "range": "± 314",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 708567,
            "range": "± 5935",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7512675,
            "range": "± 228469",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1209,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14892,
            "range": "± 77",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 347471,
            "range": "± 1108",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 24777,
            "range": "± 224",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 175524,
            "range": "± 2177",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1625366,
            "range": "± 14412",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "9220c3a5fa556b0c256d9963cbe7061bddc6f905",
          "message": "feat(schema): cited-source usable on any type incl. verification (REQ-225, #556) (#565)\n\ncited-source (sha256-stamped, drift-checked) was declared only on requirement-ish\ntypes, so on a verification artifact (sw/unit/sys-verification) it was flagged\nunknown-field — even though requirement->test->evidence is exactly where a\ntamper-evident citation is wanted. Declare cited-source as a common base-field and\nteach the unknown-field check to treat base-field names as known on every type.\nThe drift checker discovers the field by name, so it now runs on verification\nartifacts too. common 0.2.0 -> 0.3.0.\n\nImplements: REQ-225\nRefs: REQ-010\nCo-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>",
          "timestamp": "2026-06-23T10:49:00-05:00",
          "tree_id": "06d190f5079501cbd590d0dc2083c5059a513d6d",
          "url": "https://github.com/pulseengine/rivet/commit/9220c3a5fa556b0c256d9963cbe7061bddc6f905"
        },
        "date": 1782230281632,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 83043,
            "range": "± 1070",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 876200,
            "range": "± 13676",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12971897,
            "range": "± 498564",
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
            "value": 25980,
            "range": "± 136",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 370423,
            "range": "± 1777",
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
            "value": 1496469,
            "range": "± 10176",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 165535,
            "range": "± 3048",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1907911,
            "range": "± 12200",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 23952179,
            "range": "± 192647",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 483333,
            "range": "± 2893",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 17031303,
            "range": "± 171691",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1445059524,
            "range": "± 13529881",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4377,
            "range": "± 21",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 59774,
            "range": "± 198",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 746009,
            "range": "± 20357",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 57134,
            "range": "± 164",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 688224,
            "range": "± 2028",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7382392,
            "range": "± 34023",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1296,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15815,
            "range": "± 67",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 349708,
            "range": "± 1583",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 26268,
            "range": "± 160",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 190597,
            "range": "± 773",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1736436,
            "range": "± 33942",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "65008cb4414974afb6fb92ff089c6d40ad4078e5",
          "message": "feat(cli): `rivet verify <ID>` advances to verified on verifying evidence (REQ-226, #559) (#566)\n\nNothing advanced a requirement's status to verified from its test evidence:\nimport-results is a separate run-log, and coverage --tests mapped markers but\nnever wrote status. `rivet verify <ID>` advances an implemented artifact to\nverified iff it has verifying evidence — an incoming `verifies` link OR a\n`// rivet: verifies <ID>` source marker (scanned from src/ + tests/, or --scan).\nRefuses with an actionable message when there's no evidence; no-ops if already\nverified; rejects non-implemented states. The write reuses the modify\n--set-status path (schema-validated YAML edit).\n\nImplements: REQ-226\nRefs: REQ-007\nCo-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>",
          "timestamp": "2026-06-23T11:05:46-05:00",
          "tree_id": "bf090fbb29f6778f9da76d0e1806bd16084f7895",
          "url": "https://github.com/pulseengine/rivet/commit/65008cb4414974afb6fb92ff089c6d40ad4078e5"
        },
        "date": 1782231279642,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 83736,
            "range": "± 724",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 883497,
            "range": "± 20118",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13805350,
            "range": "± 631965",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2190,
            "range": "± 19",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25757,
            "range": "± 197",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 370566,
            "range": "± 1921",
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
            "value": 1494532,
            "range": "± 27465",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 166836,
            "range": "± 1035",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1902132,
            "range": "± 22127",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 28088587,
            "range": "± 4220870",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 486982,
            "range": "± 2726",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 17663314,
            "range": "± 157139",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1458580112,
            "range": "± 10770301",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4365,
            "range": "± 54",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 57389,
            "range": "± 146",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 744298,
            "range": "± 3224",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 62581,
            "range": "± 177",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 678037,
            "range": "± 3849",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7612474,
            "range": "± 213162",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1367,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15730,
            "range": "± 45",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 344300,
            "range": "± 1222",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 25639,
            "range": "± 189",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 183484,
            "range": "± 1544",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1753748,
            "range": "± 33864",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "950f0aed9d00e186e45e6e841946783ac7a29c9a",
          "message": "chore(release): v0.18.0 — close the right side of the V (#568)\n\nRelease-prep for v0.18.0: bump workspace + VS Code extension + Cargo.lock to\n0.18.0; CHANGELOG [Unreleased] -> [0.18.0]. Scope (all merged): REQ-226/#559,\nREQ-222/#555, REQ-225/#556, REQ-224/#550, REQ-223/#552, REQ-221/#530, #560.\nSchemas: common@0.3.0, dev@0.2.0.\n\nTrace: skip\nCo-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>",
          "timestamp": "2026-06-23T12:39:40-05:00",
          "tree_id": "d28ebd4f145673f0a40215254ad2d32904a16b5c",
          "url": "https://github.com/pulseengine/rivet/commit/950f0aed9d00e186e45e6e841946783ac7a29c9a"
        },
        "date": 1782236904160,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 77579,
            "range": "± 373",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 918487,
            "range": "± 3053",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 21513409,
            "range": "± 1340087",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1708,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 19421,
            "range": "± 47",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 346079,
            "range": "± 2105",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 87,
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
            "value": 1372937,
            "range": "± 9898",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 158205,
            "range": "± 4624",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1889142,
            "range": "± 34548",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 56341760,
            "range": "± 1527247",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 435758,
            "range": "± 5435",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 17208776,
            "range": "± 206871",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1112911608,
            "range": "± 7407696",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3956,
            "range": "± 9",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 41033,
            "range": "± 84",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 809739,
            "range": "± 24515",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 54774,
            "range": "± 623",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 594644,
            "range": "± 3773",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7431446,
            "range": "± 538836",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 973,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 11654,
            "range": "± 34",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 313960,
            "range": "± 2357",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23317,
            "range": "± 49",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 170331,
            "range": "± 309",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1584830,
            "range": "± 24024",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "f80298f7a064dcfd375bdae83518176380d000bc",
          "message": "fix(wasm): `rivet-core --features wasm` test build compiles — drop host-only Link.external (REQ-227, #543) (#569)\n\nDrop `external` from the two `wit::Link` constructors in wasm_runtime.rs. The host\nmodel::Link gained an `external` field (prefix:ID externals); an \"add it everywhere\"\npass leaked it into the WIT-generated types::Link, which carries only link-type +\ntarget, breaking `cargo test -p rivet-core --features wasm --tests` (E0560). external\nis a host-side composition concept the wasm guest ABI doesn't model; host->WIT omits\nit, WIT->host keeps `external: None`. The .wit is unchanged (guest contract source of\ntruth; no spar regen).\n\nFixes: REQ-227\nRefs: REQ-008\nCo-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>",
          "timestamp": "2026-06-23T13:21:25-05:00",
          "tree_id": "683dda81a095655533fa6b0ac3ade376d9d0c810",
          "url": "https://github.com/pulseengine/rivet/commit/f80298f7a064dcfd375bdae83518176380d000bc"
        },
        "date": 1782239421235,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 86588,
            "range": "± 402",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 908096,
            "range": "± 3509",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13125515,
            "range": "± 423288",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2164,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26529,
            "range": "± 177",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 391481,
            "range": "± 2359",
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
            "value": 1497520,
            "range": "± 23011",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 167970,
            "range": "± 1254",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1920620,
            "range": "± 13627",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 24326169,
            "range": "± 530624",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 479903,
            "range": "± 7836",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 17012513,
            "range": "± 225393",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1456180799,
            "range": "± 9906918",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4355,
            "range": "± 11",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 59464,
            "range": "± 199",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 744879,
            "range": "± 2927",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 63045,
            "range": "± 503",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 709691,
            "range": "± 3407",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7565567,
            "range": "± 52538",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1292,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15141,
            "range": "± 89",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 326874,
            "range": "± 909",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 25745,
            "range": "± 243",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 183305,
            "range": "± 1284",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1717850,
            "range": "± 24152",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "74aa83069804ed5439ce3c9ff30c79c0090a65ba",
          "message": "fix(yaml): parse plain multi-line scalars as sequence items (#572)\n\nparse_block_sequence now consumes continuation lines of a plain scalar\nsequence item (reusing is_plain_scalar_continuation), fixing false\n\"expected . after mapping key\" errors and the silent dropping of the\nlinks: block that followed — which had let rivet validate return a false\nPASS over broken traceability. Fixes #570.\n\nTrace: skip",
          "timestamp": "2026-06-23T22:35:19-05:00",
          "tree_id": "4e218e9c5067d78fb651e2f7f29c2c19872571f2",
          "url": "https://github.com/pulseengine/rivet/commit/74aa83069804ed5439ce3c9ff30c79c0090a65ba"
        },
        "date": 1782272649598,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84993,
            "range": "± 306",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 918693,
            "range": "± 9568",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 15109120,
            "range": "± 1591883",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1934,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25284,
            "range": "± 47",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 365888,
            "range": "± 1716",
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
            "value": 1471510,
            "range": "± 22806",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 167813,
            "range": "± 7465",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1978581,
            "range": "± 49489",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 33111637,
            "range": "± 5086489",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 465576,
            "range": "± 3020",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 18019906,
            "range": "± 323457",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1400072017,
            "range": "± 22200424",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4221,
            "range": "± 10",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 47499,
            "range": "± 823",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 745762,
            "range": "± 17363",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 63883,
            "range": "± 286",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 731158,
            "range": "± 5983",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8823317,
            "range": "± 563647",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1158,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14357,
            "range": "± 53",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 236809,
            "range": "± 6839",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23551,
            "range": "± 385",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 164064,
            "range": "± 4505",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1580042,
            "range": "± 64580",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "c33b2554a9aa7779a079431c0c0ca235af1ed2cd",
          "message": "feat(coverage): combined V-closure metric — satisfied AND verified (REQ-228) (#571)\n\nPer-rule coverage reports satisfied and verified separately, hiding the\nintersection a release needs: a requirement is closed in the V only when BOTH\nsides are. Add CoverageReport::v_closure() — for every source type with >1\ntraceability rule, the share not strictly missing on ANY applicable rule\n(covered OR external-boundary, the 3-state accounted convention). rivet coverage\nprints a V-closure: line per type; --format json adds a closure array. On this\nrepo requirements are 12.8% V-closed (29/227) vs 25.1% satisfied.\n\nImplements: REQ-228\nRefs: REQ-004\nCo-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>",
          "timestamp": "2026-06-23T22:49:19-05:00",
          "tree_id": "78f55be335a3c676b8048b59fadd065f01945856",
          "url": "https://github.com/pulseengine/rivet/commit/c33b2554a9aa7779a079431c0c0ca235af1ed2cd"
        },
        "date": 1782273487385,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84895,
            "range": "± 355",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 909329,
            "range": "± 18790",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 15041732,
            "range": "± 1076114",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1930,
            "range": "± 9",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24772,
            "range": "± 45",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 360262,
            "range": "± 1539",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 97,
            "range": "± 4",
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
            "value": 1473162,
            "range": "± 22411",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 169929,
            "range": "± 1262",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1994513,
            "range": "± 21782",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 30657536,
            "range": "± 2028242",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 466915,
            "range": "± 1627",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 18347976,
            "range": "± 206937",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1387216238,
            "range": "± 20053667",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4204,
            "range": "± 10",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 43127,
            "range": "± 705",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 737225,
            "range": "± 3714",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 59717,
            "range": "± 650",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 717750,
            "range": "± 9804",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8542491,
            "range": "± 592460",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1277,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15472,
            "range": "± 288",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 242874,
            "range": "± 2842",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 24093,
            "range": "± 80",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 172027,
            "range": "± 462",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1629553,
            "range": "± 18672",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "a251fbd89608130973b888ee51c6807fc116d7fc",
          "message": "chore(release): v0.19.0 — measure the V (#575)\n\nBump workspace + VS Code extension + Cargo.lock to 0.19.0; CHANGELOG -> [0.19.0].\nScope: REQ-228/#571 (V-closure metric), REQ-227/#543 (wasm test build), #572/#570\n(yaml multi-line scalar). Schemas unchanged.\n\nTrace: skip\nCo-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>",
          "timestamp": "2026-06-24T00:00:39-05:00",
          "tree_id": "d022723ae8b36a62261c1eda61c066e7ca0f3847",
          "url": "https://github.com/pulseengine/rivet/commit/a251fbd89608130973b888ee51c6807fc116d7fc"
        },
        "date": 1782278162764,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 77712,
            "range": "± 405",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 949864,
            "range": "± 9423",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 15593524,
            "range": "± 976569",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1689,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 19402,
            "range": "± 73",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 343439,
            "range": "± 860",
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
            "value": 1380021,
            "range": "± 40978",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 157980,
            "range": "± 374",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1866206,
            "range": "± 81659",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 40296411,
            "range": "± 2080701",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 432281,
            "range": "± 3827",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 15312921,
            "range": "± 233993",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 989987931,
            "range": "± 8146748",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3933,
            "range": "± 121",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 40532,
            "range": "± 107",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 742573,
            "range": "± 3087",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 52508,
            "range": "± 116",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 587704,
            "range": "± 1788",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8529398,
            "range": "± 557988",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 910,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 11661,
            "range": "± 21",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 298933,
            "range": "± 1534",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23024,
            "range": "± 62",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 171518,
            "range": "± 411",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1600272,
            "range": "± 12056",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "0caff9a6f8a46e8bd627e9998721609a5b9500e6",
          "message": "docs(design): SQL virtual-table facade over the live store — CLI-first, no MCP required (REQ-229, DD-068) (#578)\n\nDesign artifacts (REQ-229 + DD-068): SQL query interface over the artifact graph\nvia SQLite virtual tables (rusqlite vtab) backed by the live store. Baseline\ntransport is `rivet sql \"<query>\"` (no MCP, no server); serve POST /sql + MCP\nrivet_sql tool are additive. Read-only MVP first; writable xUpdate is a gated\nsecond slice.\n\nRefs: REQ-229, DD-068\nCo-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>",
          "timestamp": "2026-06-24T13:10:25-05:00",
          "tree_id": "30757475e9b128667e2eae59fd788127351f9b75",
          "url": "https://github.com/pulseengine/rivet/commit/0caff9a6f8a46e8bd627e9998721609a5b9500e6"
        },
        "date": 1782325156752,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85115,
            "range": "± 455",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 892822,
            "range": "± 3564",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12706433,
            "range": "± 452368",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2285,
            "range": "± 12",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26801,
            "range": "± 86",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 383445,
            "range": "± 1824",
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
            "value": 1478411,
            "range": "± 28439",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 160355,
            "range": "± 693",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1904030,
            "range": "± 16303",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 26027379,
            "range": "± 2728907",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 476181,
            "range": "± 2117",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 17152993,
            "range": "± 123080",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1405294957,
            "range": "± 14955436",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 5165,
            "range": "± 84",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60766,
            "range": "± 5807",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 736963,
            "range": "± 2894",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 61882,
            "range": "± 260",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 705092,
            "range": "± 6661",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7670996,
            "range": "± 790083",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1183,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14737,
            "range": "± 256",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 326735,
            "range": "± 602",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 26235,
            "range": "± 189",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 189916,
            "range": "± 2011",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1738608,
            "range": "± 20035",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "40c8e3d5b89e5b139f6e7707ce873b453830edce",
          "message": "feat(sql): `rivet sql` — read-only SQL over the store, no MCP/server (REQ-229) (#580)\n\nRead-only SQL facade over the artifact store. `rivet sql \"<query>\"` projects the\nlive store into an ephemeral in-memory SQLite (artifacts/links/fields/provenance)\nand runs read-only SQL — no server, no MCP. table/json/csv output; writes refused.\nFeature-gated sql (default, bundled SQLite). The V-closure set is now one query.\n\nImplements: REQ-229\nRefs: DD-068\nCo-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>",
          "timestamp": "2026-06-24T14:59:59-05:00",
          "tree_id": "0838c5c449c6e9572f950c1747920ba5cdf293ea",
          "url": "https://github.com/pulseengine/rivet/commit/40c8e3d5b89e5b139f6e7707ce873b453830edce"
        },
        "date": 1782332070730,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85765,
            "range": "± 2378",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 921690,
            "range": "± 4432",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 16896528,
            "range": "± 1461969",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1996,
            "range": "± 12",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24707,
            "range": "± 84",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 369009,
            "range": "± 3359",
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
            "value": 1479008,
            "range": "± 27515",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 169204,
            "range": "± 1931",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 2008536,
            "range": "± 46704",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 47421570,
            "range": "± 6228502",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 461975,
            "range": "± 2026",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 19487887,
            "range": "± 657696",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1467947400,
            "range": "± 29735275",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4232,
            "range": "± 36",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 43410,
            "range": "± 735",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 737933,
            "range": "± 24372",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 64460,
            "range": "± 238",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 721480,
            "range": "± 9021",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8112549,
            "range": "± 539864",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1290,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14851,
            "range": "± 179",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 244904,
            "range": "± 5210",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23507,
            "range": "± 95",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 169076,
            "range": "± 831",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1586355,
            "range": "± 53847",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "773cc3c1fde683cc0948ee612e5f792b5f47e125",
          "message": "feat(sql): `rivet sql` write slice — UPDATE via validate + safe YAML edit (REQ-230) (#582)\n\nSQL write slice: `rivet sql \"UPDATE artifacts SET status='verified' WHERE id='X'\"`\nroutes through plan_write (staging diff) -> validate_modify -> the indentation-safe\nmodify_artifact_in_file editor (preserves sibling fields, no allowlist drop).\nAll-or-nothing: invalid values rejected before any write. fields/links/INSERT/DELETE\nrefused. No MCP/server. core 7/7, cli 3/3 incl. round-trip fidelity.\n\nImplements: REQ-230\nRefs: DD-068, REQ-229\nCo-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>",
          "timestamp": "2026-06-24T16:14:26-05:00",
          "tree_id": "4f41bcad4f80376ed3532da9e2a34ccbe87cb42d",
          "url": "https://github.com/pulseengine/rivet/commit/773cc3c1fde683cc0948ee612e5f792b5f47e125"
        },
        "date": 1782336206059,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85740,
            "range": "± 638",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 885471,
            "range": "± 7111",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12821384,
            "range": "± 441812",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2214,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26919,
            "range": "± 333",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 391665,
            "range": "± 3590",
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
            "value": 1466931,
            "range": "± 36743",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 164623,
            "range": "± 1983",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1932893,
            "range": "± 9937",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 27019622,
            "range": "± 805106",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 454118,
            "range": "± 11976",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 17801078,
            "range": "± 95577",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1469432635,
            "range": "± 15820216",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4315,
            "range": "± 19",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60330,
            "range": "± 353",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 746710,
            "range": "± 4258",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 59987,
            "range": "± 526",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 725073,
            "range": "± 5061",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8011502,
            "range": "± 139627",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1200,
            "range": "± 15",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15662,
            "range": "± 59",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 330545,
            "range": "± 5718",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 26362,
            "range": "± 194",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 191439,
            "range": "± 1005",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1767225,
            "range": "± 24898",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "829013299d4153d1e9935fd8810fbbe392a5f863",
          "message": "design: adopt gluesql-core as the SQL engine, drop bundled SQLite (DD-069, REQ-231) (#585)\n\nDD-069 + REQ-231: migrate the rivet sql engine from rusqlite (bundled SQLite C)\nto gluesql-core (pure Rust). Prototype-verified: dialect works (V-closure JOIN +\nUPDATE), gluesql-core is pure Rust no cc (~19s vs umbrella crate's 55s + cc),\nasync via block_on. Removes the SQLite-C CI compile weight (#567).\n\nRefs: REQ-231, DD-069, REQ-229\nCo-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>",
          "timestamp": "2026-06-24T22:48:41-05:00",
          "tree_id": "eda15dded68f04df3c0d262b7ff15a786b487d4c",
          "url": "https://github.com/pulseengine/rivet/commit/829013299d4153d1e9935fd8810fbbe392a5f863"
        },
        "date": 1782359834591,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 77823,
            "range": "± 499",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 948439,
            "range": "± 10845",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13416727,
            "range": "± 1091231",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1687,
            "range": "± 9",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 19317,
            "range": "± 77",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 342745,
            "range": "± 1233",
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
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1387106,
            "range": "± 48832",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 157222,
            "range": "± 472",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1820027,
            "range": "± 12833",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 28111813,
            "range": "± 3093018",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 434383,
            "range": "± 2112",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 14315475,
            "range": "± 235500",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 975436679,
            "range": "± 4711654",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3976,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 40478,
            "range": "± 90",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 748118,
            "range": "± 3100",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 52810,
            "range": "± 1457",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 595981,
            "range": "± 10881",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 6734738,
            "range": "± 451192",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 911,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 11731,
            "range": "± 33",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 300740,
            "range": "± 2046",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23457,
            "range": "± 71",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 171153,
            "range": "± 424",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1617597,
            "range": "± 44584",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "db5395bf125d6b60aad0a9697583db8d6ee7e906",
          "message": "feat(serve): POST /api/v1/sql — read-only SQL over the live server (REQ-229) (#583)\n\nExposes rivet_core::sql over HTTP (POST /api/v1/sql) so a running serve is\nqueryable by any agent that can POST JSON — no MCP. Read-only by design;\ncross-origin requests rejected 403 (permissive-CORS exfiltration guard);\nnon-SELECT 400. Read-only is guaranteed at the executor layer (ephemeral\nin-memory db, no write-back).\n\nRefs: REQ-229, DD-068\nCo-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>",
          "timestamp": "2026-06-24T22:48:44-05:00",
          "tree_id": "a4572fa9a353ae575b283cc107150f67fded2e45",
          "url": "https://github.com/pulseengine/rivet/commit/db5395bf125d6b60aad0a9697583db8d6ee7e906"
        },
        "date": 1782360811453,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 87203,
            "range": "± 1688",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 941882,
            "range": "± 3333",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13484781,
            "range": "± 403454",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1948,
            "range": "± 9",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25093,
            "range": "± 51",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 373585,
            "range": "± 2447",
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
            "value": 1482951,
            "range": "± 22170",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 169933,
            "range": "± 793",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1970157,
            "range": "± 14981",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 27688140,
            "range": "± 165235",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 470216,
            "range": "± 2116",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 17944021,
            "range": "± 217910",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1371703232,
            "range": "± 19542943",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4149,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 44278,
            "range": "± 867",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 728259,
            "range": "± 2156",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 64963,
            "range": "± 311",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 719152,
            "range": "± 9258",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8019536,
            "range": "± 51625",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1210,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14965,
            "range": "± 123",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 237633,
            "range": "± 3019",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23794,
            "range": "± 68",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 172409,
            "range": "± 501",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1624292,
            "range": "± 37942",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "59b99c0ac5d79da48ab6aa829e3914b5abadc3a2",
          "message": "feat(sql): migrate engine rusqlite → gluesql-core, drop bundled SQLite (REQ-231) (#586)\n\nSwap the SQL engine from rusqlite (bundled SQLite C) to gluesql-core (pure Rust)\nbehind the unchanged sql::query/plan_write API. Removes the SQLite-C compile from\nevery CI job (#567 weight). Behavior identical — core 7/7, cli 3/3, serve 1/1 all\npass. rusqlite + libsqlite3-sys removed. Enables a native gluesql Store/StoreMut\n(virtual tables) as the path to INSERT/DELETE/fields/links writes.\n\nImplements: REQ-231\nRefs: DD-069, REQ-229, REQ-230\nCo-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>",
          "timestamp": "2026-06-24T23:32:29-05:00",
          "tree_id": "16467472a5ab3900af0e16d6220bb5ffe472f52b",
          "url": "https://github.com/pulseengine/rivet/commit/59b99c0ac5d79da48ab6aa829e3914b5abadc3a2"
        },
        "date": 1782362563022,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85861,
            "range": "± 1632",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 901045,
            "range": "± 3394",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12970030,
            "range": "± 986603",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2152,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25364,
            "range": "± 68",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 379750,
            "range": "± 4671",
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
            "value": 1480431,
            "range": "± 20044",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 162047,
            "range": "± 1200",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1927297,
            "range": "± 18511",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 25355776,
            "range": "± 602440",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 458644,
            "range": "± 1511",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 16637061,
            "range": "± 130073",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1380724636,
            "range": "± 12885350",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4187,
            "range": "± 10",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 63934,
            "range": "± 347",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 757171,
            "range": "± 14316",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 56786,
            "range": "± 1651",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 696701,
            "range": "± 2816",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7660967,
            "range": "± 308807",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1214,
            "range": "± 28",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15130,
            "range": "± 106",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 327442,
            "range": "± 6367",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 25272,
            "range": "± 147",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 181584,
            "range": "± 790",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1729245,
            "range": "± 23295",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "3f12f437ff99891b3adda9ba3c9e334cd7a616a6",
          "message": "docs(status): advance SQL REQs via dogfooding — 229/230 verified, 231 implemented (#587)\n\nFlipped REQ-229/230/231 to implemented via `rivet sql UPDATE` (the write feature\non the gluesql engine), then `rivet verify REQ-229/230` to verified on their\nsource markers. rivet validate PASS — round-trip fidelity on real artifacts.\n\nRefs: REQ-229, REQ-230, REQ-231, REQ-226\nCo-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>",
          "timestamp": "2026-06-24T23:51:22-05:00",
          "tree_id": "74fc4c0e490bf4da7baa34350179287cb1123a2a",
          "url": "https://github.com/pulseengine/rivet/commit/3f12f437ff99891b3adda9ba3c9e334cd7a616a6"
        },
        "date": 1782363630954,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85360,
            "range": "± 1576",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 897012,
            "range": "± 4142",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12141812,
            "range": "± 275642",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2183,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 23750,
            "range": "± 137",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 365017,
            "range": "± 792",
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
            "value": 1481251,
            "range": "± 15279",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 167285,
            "range": "± 623",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1926066,
            "range": "± 13856",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 24203389,
            "range": "± 189442",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 459014,
            "range": "± 1431",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 16618013,
            "range": "± 110471",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1389935910,
            "range": "± 10821481",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4277,
            "range": "± 21",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 63073,
            "range": "± 249",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 739785,
            "range": "± 2510",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 62796,
            "range": "± 261",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 693517,
            "range": "± 2826",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7511446,
            "range": "± 53096",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1243,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15766,
            "range": "± 64",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 319095,
            "range": "± 1071",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 25420,
            "range": "± 945",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 184423,
            "range": "± 1267",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1747627,
            "range": "± 12273",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "1c185abc3fa8dac0695a8d414433985417ec47ec",
          "message": "docs: sync documentation with current implementation (#584)\n\nAudited docs against the live binary: fixed a broken README demo command,\nunderstated export formats, stale MCP tool count + curl URL, incomplete preset\nlist; documented rivet sql (read+write), rivet verify, the V-closure coverage\nmetric, cited-source base field, vendor-schemas. rivet docs check PASS.\n\nRefs: REQ-229, REQ-230\nCo-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>",
          "timestamp": "2026-06-25T05:10:08-05:00",
          "tree_id": "4b3a7e927d93e032790b7398b8458976145ca6f1",
          "url": "https://github.com/pulseengine/rivet/commit/1c185abc3fa8dac0695a8d414433985417ec47ec"
        },
        "date": 1782383062673,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85812,
            "range": "± 1472",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 945878,
            "range": "± 9456",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 15021755,
            "range": "± 1953129",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1954,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25246,
            "range": "± 106",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 357662,
            "range": "± 71587",
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
            "value": 96,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1475707,
            "range": "± 30640",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 168084,
            "range": "± 807",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1999917,
            "range": "± 7213",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 29725382,
            "range": "± 1214738",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 463316,
            "range": "± 2508",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 16899363,
            "range": "± 153138",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1258865487,
            "range": "± 19809358",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4275,
            "range": "± 17",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 44864,
            "range": "± 433",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 821722,
            "range": "± 4821",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 63859,
            "range": "± 316",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 744618,
            "range": "± 6049",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8505173,
            "range": "± 178853",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1324,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 16076,
            "range": "± 51",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 273723,
            "range": "± 2449",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23768,
            "range": "± 372",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 170774,
            "range": "± 372",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1627193,
            "range": "± 23913",
            "unit": "ns/iter"
          }
        ]
      }
    ]
  }
}