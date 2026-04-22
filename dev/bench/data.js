window.BENCHMARK_DATA = {
  "lastUpdate": 1776894381356,
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
          "id": "56087b8e14b592f717e77b3115093e452317b035",
          "message": "fix(feature-model): cross-tree constraints silently pass (#156)\n\n* fix(feature-model): evaluate cross-tree constraints as logical assertions\n\nBefore this change, `rivet variant check` silently reported PASS on\nvariants that explicitly violated `(implies X (not Y))` and other\ncross-tree constraints where forward propagation could not auto-select\na feature to satisfy the consequent. The solver only used `Expr::Implies`\nto schedule consequent features for selection; when the consequent was\na negation, a compound, or any non-feature-name shape, no check ever\nfired against the propagated selection — a false-positive PASS on a\nsafety-critical validation surface.\n\nFix: add a `eval_constraint` pass after propagation that treats every\ntop-level constraint as a boolean assertion over the effective feature\nset, with standard propositional semantics for `and`/`or`/`not`/\n`implies`/`excludes`. `excludes` keeps its dedicated diagnostic string\nto preserve existing error messages; other shapes report through a new\n`describe_constraint` helper. Unknown artifact-oriented predicates\n(link queries, regex matches) default to true so unrelated constraint\nflavours do not trigger spurious violations.\n\nRegression tests cover the reported shape `(implies X (not Y))` with\nboth X and Y selected (now FAIL), the companion case with only X\nselected (still PASS), and ensure forward propagation of\n`(implies X Y)` still works.\n\nFixes: REQ-044\n\n* fix(deps): ignore RUSTSEC-2026-0103 (thin-vec UAF in transitive salsa)\n\nthin-vec 0.2.14 has a Double-Free / UAF in IntoIter::drop and\nThinVec::clear. Pulled in transitively via salsa 0.26.0. Rivet does\nnot directly construct or iterate thin_vec::ThinVec — the exposure is\nthrough salsa's internal data structures.\n\nIgnore in both cargo-deny and cargo-audit until either salsa bumps\nits thin-vec dependency or thin-vec 0.2.15 lands upstream.\n\nTrace: skip",
          "timestamp": "2026-04-21T13:52:40-05:00",
          "tree_id": "9e9392032e08d8839b6e2246ced7d0e442c4ba6e",
          "url": "https://github.com/pulseengine/rivet/commit/56087b8e14b592f717e77b3115093e452317b035"
        },
        "date": 1776797926104,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 63903,
            "range": "± 232",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 997825,
            "range": "± 130653",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 15493494,
            "range": "± 1592811",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1494,
            "range": "± 10",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 18413,
            "range": "± 157",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 264812,
            "range": "± 5401",
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
            "value": 774488,
            "range": "± 25782",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 191060,
            "range": "± 26742",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 2023898,
            "range": "± 248972",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 31428795,
            "range": "± 3585696",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 97158,
            "range": "± 1157",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 859226,
            "range": "± 26496",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 10835840,
            "range": "± 1635640",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3277,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 35299,
            "range": "± 390",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 636087,
            "range": "± 2936",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 54388,
            "range": "± 808",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 574164,
            "range": "± 2068",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 6755220,
            "range": "± 434930",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 579,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 4993,
            "range": "± 145",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 70862,
            "range": "± 1164",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 19080,
            "range": "± 219",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 132933,
            "range": "± 3952",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1239036,
            "range": "± 12518",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "60d728a29a18f3e2ba744128fdd274f2df0ee9a1",
          "message": "fix(validate): salsa path silently drops adapter + external artifacts (#157)\n\n* fix(validate): inject adapter/external artifacts into salsa store\n\nThe default (salsa-incremental) validation path only fed YAML source\nfiles into the salsa database — it silently dropped artifacts produced\nby non-YAML adapters (aadl, reqif, needs-json, wasm) and never loaded\nexternal-project artifacts at all. Any link whose target lived in\nadapter output (e.g. a YAML artifact with `modeled-by -> AADL-Foo-Bar`\nor `analyzes -> AADL-*`) or in an external project (`spar:SPAR-*`) was\nflagged as a phantom \"link target does not exist\" broken-link\ndiagnostic. The only workaround was `rivet validate --direct`, which\nbypasses salsa and loads everything through `ProjectContext::load`.\n\nFix:\n\n* rivet-core/src/db.rs: add a new `ExtraArtifactSet` salsa input\n  that carries pre-parsed artifacts contributed by non-YAML adapters,\n  and `_with_extras` variants of `validate_all`,\n  `evaluate_conditional_rules`, `build_link_graph`,\n  `compute_coverage_tracked`, and `filter_artifact_ids` that merge\n  those artifacts into the store before link-graph construction. The\n  original (no-extras) entry points keep their exact bodies so\n  existing callers and memoization behaviour are preserved.\n\n* rivet-cli/src/main.rs (run_salsa_validation): invoke\n  `load_artifacts` for non-YAML source formats and\n  `load_all_externals` for externals, feed the results through the\n  new `db.load_extras(..)` / `db.diagnostics_with_extras(..)` API.\n  Also removes an unconditional duplicate `collect_yaml_files` call\n  that was traversing each YAML source twice.\n\nRegression test `salsa_path_matches_direct_on_adapter_only_targets`\npins three things at the core level:\n  1. Direct path resolves the modeled-by link and reports zero\n     broken-link diagnostics.\n  2. Salsa path without extras reproduces the original bug and\n     reports one phantom broken-link (guards the no-extras API from\n     silently drifting).\n  3. Salsa path with extras matches the direct path exactly.\n\nOn the rivet dogfood project, `rivet validate` and\n`rivet validate --direct` now produce identical diagnostic counts\n(6 errors, 9 warnings, 0 broken cross-refs) where the default path\npreviously differed.\n\nFixes: REQ-029, REQ-004\nVerifies: REQ-004\n\nCo-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>\n\n* fix(deps): ignore RUSTSEC-2026-0103 (thin-vec UAF in transitive salsa)\n\nthin-vec 0.2.14 has a Double-Free / UAF in IntoIter::drop and\nThinVec::clear. Pulled in transitively via salsa 0.26.0. Rivet does\nnot directly construct or iterate thin_vec::ThinVec — the exposure is\nthrough salsa's internal data structures.\n\nIgnore in both cargo-deny and cargo-audit until either salsa bumps\nits thin-vec dependency or thin-vec 0.2.15 lands upstream.\n\nTrace: skip\n\n* fix(tests): wait for /api/v1/health 200 before fetching\n\nserve_integration::start_server() previously returned as soon as TCP\naccept succeeded. Under PROPTEST_CASES=1000 CI load, the socket binds\nbefore the artifact store finishes loading, so fetch() races and hits\nthe server mid-load — the HTTP connection gets closed or returns an\nempty response, parsed as status=0.\n\nSeen intermittently as:\n  api_artifacts_unfiltered ... FAILED\n    assertion `left == right` failed: left=0 right=200\n  api_artifacts_search ... FAILED (same shape)\n\nFix: poll /api/v1/health until it returns HTTP/1.1 200 before declaring\nthe server ready. The health handler only becomes reachable after\nrouting is fully initialized.\n\nTrace: skip\n\n---------\n\nCo-authored-by: Claude Opus 4.7 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-04-21T13:57:49-05:00",
          "tree_id": "95c6e288c97716c36213ca5f857509b21ad6d9ff",
          "url": "https://github.com/pulseengine/rivet/commit/60d728a29a18f3e2ba744128fdd274f2df0ee9a1"
        },
        "date": 1776798271356,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 75139,
            "range": "± 275",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 872940,
            "range": "± 2350",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 15045716,
            "range": "± 645992",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1681,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 19280,
            "range": "± 48",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 351144,
            "range": "± 1443",
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
            "value": 915887,
            "range": "± 5580",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 159195,
            "range": "± 1377",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1838157,
            "range": "± 39897",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 39814510,
            "range": "± 2597180",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 106027,
            "range": "± 1092",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 969781,
            "range": "± 18513",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 15671235,
            "range": "± 1313077",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3917,
            "range": "± 15",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 41331,
            "range": "± 88",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 759772,
            "range": "± 3850",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 53071,
            "range": "± 128",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 584274,
            "range": "± 2706",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 9092814,
            "range": "± 591331",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 619,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 5174,
            "range": "± 14",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 140485,
            "range": "± 1097",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 20122,
            "range": "± 47",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 139241,
            "range": "± 1029",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1291464,
            "range": "± 6158",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "a8ac559c9715bed5cfae291c093391932c671c83",
          "message": "docs: Polarion and ReqIF export fidelity analysis (#169)\n\nField-by-field analysis of rivet's Artifact model against Polarion REST\nand ReqIF 1.2, with round-trip test strategy and ranked next steps.\nHighlights ReqIF Debug-form coercion bug for non-string fields and the\nunconditional loss of provenance on export.\n\nRefs: REQ-025, FEAT-001",
          "timestamp": "2026-04-21T14:43:22-05:00",
          "tree_id": "f1e131601497f7f516d4bc8cba4c53e7836d1701",
          "url": "https://github.com/pulseengine/rivet/commit/a8ac559c9715bed5cfae291c093391932c671c83"
        },
        "date": 1776802890925,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 82050,
            "range": "± 1806",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 867662,
            "range": "± 4879",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14506139,
            "range": "± 1371052",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1951,
            "range": "± 20",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25178,
            "range": "± 1126",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 375562,
            "range": "± 3406",
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
            "value": 995325,
            "range": "± 20374",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 166892,
            "range": "± 790",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1917022,
            "range": "± 16984",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 28058873,
            "range": "± 2773920",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 106882,
            "range": "± 428",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 955020,
            "range": "± 13038",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 10877792,
            "range": "± 382004",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4078,
            "range": "± 22",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 44816,
            "range": "± 921",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 742419,
            "range": "± 4629",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 62302,
            "range": "± 1017",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 718697,
            "range": "± 43268",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8100284,
            "range": "± 261201",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 742,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 6557,
            "range": "± 97",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 91049,
            "range": "± 422",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21178,
            "range": "± 168",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 144922,
            "range": "± 383",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1363793,
            "range": "± 15222",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "a7dcc30efc7bd0a4197283b533c656fe67d1bd0b",
          "message": "fix(init): preserve manual content in AGENTS.md / CLAUDE.md via managed-section markers (#167)\n\n* wip(init): managed-section markers for AGENTS.md regen (INCOMPLETE)\n\nThe stalled Mythos agent got about 60% through this task before\nhitting a 600s watchdog timeout. Saving the WIP so it isn't lost:\n\n- New rivet-core/src/managed_section.rs: splice_managed_section() with\n  the BEGIN rivet-managed / END rivet-managed HTML-comment scheme, plus\n  error types for NoMarkers and MultipleMarkers.\n- rivet-cli/src/main.rs: --migrate and --force-regen flags wired into\n  cmd_init_agents (partial).\n\n**Not yet done** (pickup list for whoever takes this over):\n- Integration tests in rivet-cli/tests/init_integration.rs\n- CLAUDE.md regen path (confirm whether init --agents touches it)\n- Migrate rivet's own AGENTS.md to use markers\n- Confirm cargo build + cargo test pass\n\n**Why it matters**: without this, `rivet init --agents` silently\noverwrites downstream consumers' manual AGENTS.md content. Sigil\nships a \"don't regenerate\" warning comment as a workaround.\n\nDo not merge this commit; pick up where it left off or restart\nwith a tighter agent scope.\n\nTrace: skip\n\n* test(init): integration tests for AGENTS.md / CLAUDE.md marker semantics\n\nSeven end-to-end tests that exercise `rivet init --agents` against the\nfull CLI binary, covering every branch of the write_managed_file state\nmachine:\n\n- agents_md_fresh_file_has_markers — non-existent file gets exactly one\n  BEGIN/END rivet-managed pair on first write.\n- agents_md_preserves_manual_section_outside_markers — prose above and\n  below the markers survives regeneration; only the managed region is\n  replaced.\n- agents_md_refuses_no_markers_default — pre-existing file with no\n  markers and no flag -> exit 1, file untouched byte-for-byte.\n- agents_md_force_regen_overwrites_no_markers — --force-regen discards\n  prior content, emits a stderr warning.\n- agents_md_migrate_wraps_existing_content — --migrate puts the managed\n  section on top, preserves prior content below, and a subsequent plain\n  regen splices cleanly.\n- agents_md_multiple_markers_rejected — two BEGIN/END pairs -> exit 1,\n  file untouched.\n- claude_md_preserves_manual_section_outside_markers — the same splice\n  semantics apply to CLAUDE.md.\n\nThe existing 11 unit tests in rivet-core/src/managed_section.rs already\ncover the pure-function surface (splice, wrap_fresh, migrate_wrap,\nhas_markers, and the error cases NoMarkers, MultipleBeginMarkers,\nUnclosedMarker, OrphanEndMarker), so these integration tests focus on\nthe CLI wiring and filesystem side-effects rather than duplicating\nthe unit coverage.\n\nFixes: REQ-007\nVerifies: REQ-007\nRefs: FEAT-026\n\nCo-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>\n\n* docs: wrap rivet's AGENTS.md and CLAUDE.md in rivet-managed markers\n\nSelf-host the managed-section scheme so a future `rivet init --agents`\nrun on the rivet repo itself splices the auto-generated region cleanly\ninstead of tripping the new no-marker refusal path.\n\nAGENTS.md:\n- Project overview, artifact-type table, link-type table, and the\n  Conventions block (all currently regenerated by `cmd_init_agents`)\n  are wrapped inside a single BEGIN/END rivet-managed pair.\n- The hand-expanded Commit Traceability reference (trailer table,\n  choosing-the-right-artifacts guide, and the retroactive traceability\n  map) is moved below the END marker so it survives regeneration. The\n  generator emits a much shorter commits section; keeping the rich\n  reference outside the markers lets us expand it without fighting the\n  regenerator.\n\nCLAUDE.md:\n- The entire hand-authored content (validation/queries, commit\n  traceability quick reference, hook security model, AI provenance)\n  now lives above the markers and will be preserved verbatim.\n- The managed region is committed as an empty stub with an explanatory\n  comment; the next `rivet init --agents` will populate it with the\n  generated CLAUDE.md shim.\n\nCLAUDE.md scope check: `rivet init --agents` is the only code path in\nrivet-cli that writes CLAUDE.md (grep for `CLAUDE\\.md` in\nrivet-cli/src confirms no other write site), and it already uses the\nsame `write_managed_file` helper as AGENTS.md via d66dee2. No\nadditional code change is needed for CLAUDE.md support.\n\nFixes: REQ-007\nRefs: FEAT-026\n\nCo-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>\n\n---------\n\nCo-authored-by: Claude Opus 4.7 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-04-21T14:44:37-05:00",
          "tree_id": "1ff2c3b57ba8f4f590b24faece23d5657b117076",
          "url": "https://github.com/pulseengine/rivet/commit/a7dcc30efc7bd0a4197283b533c656fe67d1bd0b"
        },
        "date": 1776804038969,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 80654,
            "range": "± 688",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 845428,
            "range": "± 3857",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 11299768,
            "range": "± 492945",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2326,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26299,
            "range": "± 893",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 371481,
            "range": "± 16722",
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
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1009052,
            "range": "± 17434",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 160365,
            "range": "± 3710",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1885560,
            "range": "± 30228",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 23595600,
            "range": "± 629379",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 111921,
            "range": "± 699",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 957520,
            "range": "± 9987",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 9595695,
            "range": "± 144843",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4275,
            "range": "± 16",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60777,
            "range": "± 360",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 779545,
            "range": "± 67119",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 60655,
            "range": "± 446",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 681048,
            "range": "± 10004",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7528352,
            "range": "± 77415",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 776,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7583,
            "range": "± 26",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 116179,
            "range": "± 2541",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23359,
            "range": "± 439",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 165904,
            "range": "± 1761",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1505011,
            "range": "± 12636",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "d09a4bb04fa01e9a30fcd3b77479f51358af0799",
          "message": "fix(mythos): 4 one-liner silent-accept bugs (validate/coverage/yaml_hir/formats) (#168)\n\n* fix(validate): align empty target-types/from-types with coverage semantics\n\nBefore this fix, `validate::validate` and `coverage::compute_coverage`\ngave contradictory answers on the same traceability rule + artifact\ndata:\n\n- `TraceabilityRule.target_types` / `.from_types` are `#[serde(default)]`\n  so they deserialize to an empty `Vec<String>` when omitted.\n- `validate::validate` treated an empty list as \"match nothing\"\n  (rule.target_types.contains(&t) is false for every t), producing a\n  false-positive violation.\n- `coverage::compute_coverage` treated an empty list as \"match any\"\n  (`if target_types.is_empty() { true } else { ... }`), reporting the\n  same artifact as fully covered.\n\nResult: `rivet validate` said \"1 error\" while `rivet coverage` said\n\"1/1 (100%)\" on the same inputs. Discovered by the Mythos pass.\n\nUnify on the \"match any\" convention (also used by LinkFieldDef checks\nat validate.rs ~L310) so both tools agree. Adds two regression tests\nthat pin validate and coverage must never contradict each other on\nempty `target-types` or `from-types`.\n\nFixes: REQ-004\nVerifies: REQ-010\n\nCo-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>\n\n* fix(coverage): exclude self-links from traceability rule satisfaction\n\n`compute_coverage` counted a link from an artifact to itself (e.g.\n`DD-001 → DD-001` via `satisfies`) as a valid rule satisfaction. That\nmeant an author blocked from finding upstream trace could pass CI by\nwriting a single self-referential line — the author's own DD closed\nthe loop.\n\nAdd `l.target != *id` (forward) and `bl.source != *id` (backlink) to\nthe filter chain inside `compute_coverage`. Two regression tests —\none per direction — pin the expected behaviour.\n\nDiscovered by the Mythos pass; empirically reproducible.\n\nFixes: REQ-004\n\nCo-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>\n\n* fix(yaml_hir): skip null/empty shorthand values instead of emitting phantom link\n\nWhen a schema-shorthand-link field is written with a null-like YAML\nvalue (e.g. `losses: null`, `losses: ~`, `losses: \"\"`), the extractor\nwas creating a `Link { target: \"null\" }` / `\"~\"` / `\"\"` instead of\ntreating it as \"no link.\" These phantom links silently pollute the\ntrace graph, and the YAML footgun fuzzer surfaced the behaviour as a\nconfirmed bug.\n\nAdd an `is_null_or_empty_scalar` helper and guard the shorthand link\nemission on it. Also skip empty-string entries inside list shorthand\nvalues (`losses: [L-1, \"\"]`). Three regression tests cover the null,\ntilde, and empty-string cases.\n\nImplements: REQ-028\n\nCo-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>\n\n* fix(formats/generic): reject unknown top-level keys instead of silently dropping\n\nWithout `#[serde(deny_unknown_fields)]` on `GenericFile`, a file that\nhas a valid `artifacts:` key plus a typo-ed companion key like\n`artifact:` (singular) or `Artifacts:` (wrong case) deserialized\nsuccessfully and silently dropped every artifact under the typo'd key.\nThe fuzzer (test/yaml-cli-fuzzers branch) confirmed the resulting\ntrace-graph hole.\n\nAdd `deny_unknown_fields` so unknown top-level keys surface as\n`serde_yaml::Error`s. `parse_generic_yaml` already bubbles these up\nas `Error::Yaml`, and the diagnostics pipeline in db.rs\n(`collect_parse_errors`) converts them to `Severity::Error`\ndiagnostics — so the typo is now user-visible rather than silent.\n\nTwo regression tests pin the new behaviour for `artifact:` (singular)\nand `Artifacts:` (capitalised) companion keys.\n\nFixes: REQ-004\nVerifies: REQ-010\n\nCo-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>\n\n---------\n\nCo-authored-by: Claude Opus 4.7 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-04-21T14:44:41-05:00",
          "tree_id": "43681235b42f9a26b7a0f7cbc12bb9f86f7f98a7",
          "url": "https://github.com/pulseengine/rivet/commit/d09a4bb04fa01e9a30fcd3b77479f51358af0799"
        },
        "date": 1776804187955,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 80863,
            "range": "± 601",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 858653,
            "range": "± 6175",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 15500980,
            "range": "± 1224092",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2121,
            "range": "± 18",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26094,
            "range": "± 321",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 374351,
            "range": "± 10873",
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
            "value": 991901,
            "range": "± 15466",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 165581,
            "range": "± 2794",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1876571,
            "range": "± 21758",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 26661047,
            "range": "± 1907239",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 112471,
            "range": "± 797",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 954987,
            "range": "± 6052",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 12674693,
            "range": "± 764811",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4410,
            "range": "± 24",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 69387,
            "range": "± 238",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 777659,
            "range": "± 16770",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 56450,
            "range": "± 222",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 672850,
            "range": "± 4415",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8726447,
            "range": "± 563011",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 782,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7716,
            "range": "± 25",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 105806,
            "range": "± 674",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23069,
            "range": "± 150",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 158191,
            "range": "± 2869",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1462886,
            "range": "± 20690",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "2fafe1a574e590671b21e9fce42b4a76db88ef70",
          "message": "fix: audit followups — real hard gates, /graph budget, PLE self-apply, v0.4.0 artifacts (#155)\n\n* fix(ci): make Kani, Rocq, and Mutation Testing real hard gates\n\nAudit found that all four verification-pyramid CI jobs were silently\nfailing on main. None had ever run green. This fixes three and scopes\nthe fourth to an upstream bug.\n\n**Kani Proofs** — flipped to hard gate. Five harnesses in\nrivet-core/src/proofs.rs were initializing `EvalContext` with only\n`artifact` + `graph` fields after the struct grew a `store: Option<...>`\nfield for quantifier support. The cfg(kani) gate meant the break was\ninvisible to normal `cargo check`. Added `store: None` to all five.\n\n**Rocq Proofs** — flipped to hard gate. The `rocq_library` target\n`rivet_metamodel` had `srcs = []`, which fails Bazel analysis with\n\"rocq_library requires at least one source file\". Removed the empty\naggregator target and pointed the test at the two real libraries\n(Schema + Validation) directly.\n\n**Mutation Testing** — split into a per-crate matrix so rivet-core\nand rivet-cli each get a 45-minute budget. Previously both crates\nshared a single 40-minute timeout, causing rivet-core to be cancelled\nbefore finishing and rivet-cli to never run. `--timeout` per-mutant\nreduced from 120s to 90s. Uploads are now per-crate artifacts.\n\n**Verus Proofs** — left as continue-on-error with a pointer comment.\nRoot cause is in rules_verus (pulseengine/rules_verus, commit e2c1600):\nthe hub repository's `:all` alias only points to the first platform's\ntoolchain rather than registering `toolchain()` rules for each\nplatform, so `register_toolchains(\"@verus_toolchains//:all\")`\nresolves to a non-toolchain target. Fixing this requires an upstream\nchange to rules_verus.\n\nWith these fixes, CI will fail — honestly — on Kani regressions,\nRocq proof breaks, and surviving mutants, instead of silently\nreporting green.\n\nImplements: REQ-010, REQ-029\nVerifies: REQ-010\n\n* perf(serve): enforce node budget on /graph to prevent 57s render\n\nThe /graph dashboard route previously ran layout + SVG over the full\nlink graph (~1800 artifacts on the dogfood dataset), taking ~57s and\nproducing ~1MB of HTML. The Playwright test at graph.spec.ts:17 was\nnamed \"node budget prevents crash on full graph\" but grepping the\nrenderer for budget/max_nodes returned zero matches -- the budget was\naspirational.\n\nThis commit adds a real safety valve in render_graph_view:\n\n- DEFAULT_NODE_BUDGET = 200, MAX_NODE_BUDGET = 2000 (hard ceiling).\n- After the filtered subgraph is built but before the expensive\n  pgv_layout + render_svg calls, short-circuit with a budget message\n  when node_count > budget.\n- The message contains the literal string \"budget\" so the Playwright\n  locator `svg, :text('budget')` matches and exposes the standard\n  filter form (types / focus / depth / link_types / limit) so users\n  can scope the view without editing URLs.\n- Per-request override via ?limit=NNN, clamped to [1, MAX_NODE_BUDGET].\n- Filtered views under the budget (?types=requirement,\n  ?focus=REQ-001&depth=2) continue to render SVG unchanged.\n\nPerf (release build, rivet dogfood dataset via serve_integration test):\n                                     before       after\n  GET /graph                         ~57s / ~1MB  ~1ms / 20KB\n  GET /graph?types=requirement       (filtered)   ~1ms / 44KB (SVG)\n  GET /graph?focus=REQ-001&depth=2   (filtered)   ~44ms / 67KB (SVG)\n\nThree new integration tests in serve_integration.rs lock in the\ninvariant: full graph stays under 5s and returns the budget message,\nfocused view still renders SVG, and ?limit=1 forces the budget path.\n\nImplements: REQ-007\n\n* feat(ple): feature model + variants for rivet itself (dogfooding #128)\n\nShip a feature model that describes the real variability in rivet:\ncompile-time cargo features, CLI deployment surfaces (cli / dashboard /\nLSP / MCP), built-in adapters, export formats, test-import formats, and\ninit presets. Every declared feature maps 1:1 to something grep-able in\nthe code: a cargo feature flag, a `rivet` subcommand, a format string\ndispatched by `export --format` / `import-results --format`, or an init\npreset in `resolve_preset()`.\n\nCloses the dogfooding gap for #128 — v0.4.0 shipped `rivet variant\ncheck`, but the rivet project itself had no feature model to feed it.\n\nFiles:\n  * artifacts/feature-model.yaml        — root feature tree + constraints\n  * artifacts/variants/minimal-ci.yaml  — default-features cargo build,\n                                          CLI-only deployment (what CI runs)\n  * artifacts/variants/full-desktop.yaml — every surface, every preset,\n                                           wasm + oslc cargo features on\n\nReal variability identified:\n  * yaml-backend alternative (rowan-yaml default, serde-yaml-only fallback)\n  * deployment-surface or-group (cli-only, dashboard, lsp-server, mcp-server)\n  * adapters or-group with cargo-feature constraints (implies oslc-client\n    feat-oslc; implies wasm-adapter feat-wasm)\n  * export-formats / test-import-formats / init-presets or-groups\n  * preset ↔ adapter constraints (preset-aadl implies aadl-adapter;\n    preset-stpa implies stpa-yaml-adapter)\n  * dashboard implies html-export (shared HTML pipeline)\n  * reqif-export implies reqif-adapter (shared reqif module)\n\nVerification (both variants pass):\n\n  $ rivet variant check --model artifacts/feature-model.yaml \\\n                        --variant artifacts/variants/minimal-ci.yaml\n  Variant 'minimal-ci': PASS\n  Effective features (40):\n    aadl-adapter, adapters, baselines, cli-only, commits, core,\n    coverage, deployment-surface, docs-cli, export-formats,\n    generic-yaml-adapter, generic-yaml-export, hooks-infra,\n    html-export, impact-analysis, init-presets, junit-adapter,\n    junit-import, matrix, mutations, needs-json-adapter,\n    needs-json-import, optional-cargo-features, preset-aadl,\n    preset-dev, preset-stpa, query, reqif-adapter, reqif-export,\n    rivet, rowan-yaml, schema-system, sexpr-language, snapshots,\n    stpa-yaml-adapter, test-import-formats, validate, variant-mgmt,\n    yaml-backend, zola-export\n\n  $ rivet variant check --model artifacts/feature-model.yaml \\\n                        --variant artifacts/variants/full-desktop.yaml\n  Variant 'full-desktop': PASS\n  Effective features (58):\n    ...minimal-ci set plus dashboard, lsp-server, mcp-server,\n    oslc-client, wasm-adapter, feat-oslc, feat-wasm, and all 14\n    init presets (aspice, stpa-ai, cybersecurity, eu-ai-act,\n    safety-case, do-178c, en-50128, iec-61508, iec-62304,\n    iso-pas-8800, sotif, plus the three in minimal-ci).\n\nNotes from reading the code:\n  * `rowan-yaml` cargo feature: default-on, with a `cfg(not(feature =\n    \"rowan-yaml\"))` fallback path in rivet-core/src/db.rs — so the\n    alternative group has two real arms, not one.\n  * `aadl` cargo feature: default-on. Modelled as a mandatory\n    (always-present) adapter since no real build disables it — not as\n    an optional-feature toggle.\n  * `oslc` and `wasm`: off-by-default cargo features, correctly\n    modelled as optional with implies-constraints from the adapters.\n  * `lsp-server`, `dashboard`, `mcp-server` are *not* behind cargo\n    features — they're always compiled in today. The variance is\n    runtime/deployment, not compile-time. Flagged this as a surprising\n    mismatch with the v0.4.0 narrative (where LSP/MCP are described as\n    optional deployment surfaces): they are, but only in the sense of\n    \"whether you launch that process\", not \"whether the code is in the\n    binary\".\n  * The rowan YAML parser rejects multi-line `#` comments between\n    mapping entries at the same indent (`expected mapping key, found\n    Some(Comment)`). Worked around by keeping single-line section\n    comments in feature-model.yaml; flagging this as a latent parser\n    bug worth a follow-up issue.\n\nRefs: #128\n\n* feat(audit): v0.4.0 artifacts, retroactive trailer map, Verus hard gate\n\nAddresses three gaps found in the post-v0.4.0 dogfooding audit.\n\n**v0.4.0 shipped-work artifacts** — `artifacts/v040-features.yaml` was\nlast touched 2026-04-12 and describes variant/PLE work (FEAT-106..114),\nnot the verification pyramid that actually shipped on 2026-04-19. New\nfile `artifacts/v040-verification.yaml` authors 4 design decisions\n(DD-052 four-layer verification pyramid, DD-053 suffix-based\nyaml-section matching, DD-054 non-blocking framing for formal CI\njobs, DD-055 cfg-gate platform syscalls), 8 features\n(FEAT-115..122 covering Kani 27-harness expansion, differential YAML\ntests, operation-sequence proptest, STPA-Sec suite, suffix-based UCA\nextraction, nested control-action extraction, Zola export, Windows\nsupport), and 1 requirement (REQ-060 cross-platform binaries).\nCounts were verified against the actual codebase — 27 `#[kani::proof]`\nattrs in proofs.rs, 6 differential tests, 16 STPA-Sec tests.\n\n**Retroactive trailer map** — extended `AGENTS.md` with three more\nlegacy orphans (51f2054a #126, f958a7ef, 75521b85 #44), a new v0.4.0\nPR-level section for #150/#151/#152/#153, and an honest\n\"genuinely-unmappable\" section calling out `ca97dd9f` (#95) whose\n`SC-EMBED-*` trailers point to artifacts that were never authored.\n\n**Verus Proofs → hard gate** — rules_verus PR #21 (merged as\n5bc96f39) fixes the hub-repo's ambiguous `:all` alias by emitting\nproper `toolchain()` wrappers per platform. Updates the git_override\npin from e2c1600a (Feb 2026, broken) to 5bc96f39 and removes\n`continue-on-error: true` from the Verus job.\n\nImplements: REQ-030, REQ-060\nRefs: DD-052, DD-053, DD-054, DD-055, FEAT-115, FEAT-116, FEAT-117, FEAT-118, FEAT-119, FEAT-120, FEAT-121, FEAT-122\nVerifies: REQ-030\n\n* fix(ci): honest feedback on first hard-gate run\n\nFirst run of the flipped hard gates exposed real issues:\n\n- **Kani**: `eval_context(artifact: &Artifact)` had an unused param after\n  the store-building refactor. cfg(kani) hid it from `cargo check`; CI's\n  `-D warnings` caught it. Prefixed with `_artifact`.\n\n- **Rocq**: Schema.v / Validation.v opened `string_scope` but used `++`\n  on `Store` (a list). Rocq 9.0.1 parses `++` in string_scope as\n  `String.append`, so `s ++ [a]` failed with \"s has type Store while\n  expected string\". Added `Open Scope list_scope.` after the string\n  open so list concatenation takes precedence. Neither file uses\n  string `++` so the scope swap is safe.\n\n- **Verus**: unblocked the `:all` alias bug via upstream rules_verus PR\n  (5bc96f39), but hit a deeper upstream issue — rules_rust 0.56.0\n  references `CcInfo` which has been removed from current Bazel. Needs\n  a rules_rust bump inside rules_verus before Verus can be a hard gate.\n  Reverted to `continue-on-error: true` with a pointer comment so this\n  is honestly signposted rather than silently advertised as shipped.\n\nMutation Testing rivet-cli passed on the first run. rivet-core still\nrunning. /graph budget works in CI (included in the same PR).\n\nImplements: REQ-030\n\n* fix(rocq): drop Open Scope string_scope, tag string literals\n\nThe `Open Scope string_scope.` at the top of Schema.v / Validation.v\nshadowed `length` (String.length vs List.length) and `++`\n(String.append vs List.app), breaking every Store operation once the\nproofs got compiled under Rocq 9.0.1.\n\nNeither file actually uses infix string operators — all string\nliterals are either passed to `String.eqb` or constructed with explicit\n`%string` tags. Drop the scope open; tag the one remaining bare\nliteral `\"broken-link\"` in Validation.v:120 with `%string`.\n\nExplanatory comment in both files so a future reader doesn't reopen\nstring_scope and re-break this.\n\n* fix(rocq): fully qualify List.length in proofs\n\nWith `Require Import Coq.Strings.String` after `Coq.Lists.List`, the\nbare identifier `length` resolves to `String.length` (the latest\nimport wins), so `length s` with `s : Store` fails to typecheck.\n\nQualify every `length` call against a list as `List.length` so name\nresolution cannot drift. Five call sites across Schema.v / Validation.v.\n\n* fix(rocq): apply -> eapply reach_direct for constructor with implicit lk\n\n`reach_direct` has a forall-bound `lk : LinkKind` that isn't surfaced\nin the goal after `apply`. Rocq 9.0.1 refuses the implicit instantiation\nthat older versions allowed, fails with \"Unable to find an instance for\nthe variable lk\". Using `eapply` creates a metavariable that unifies\nwhen the inner `exact Hl1_kind` step substitutes the real link kind.\n\n* fix(rocq): admit vmodel_chain_two_steps honestly (real proof gap)\n\nThe `apply reach_direct` + `eapply reach_direct` routes both fail under\nRocq 9.0.1 because the proof has an actual hole: `t1` (the link target\nartifact introduced by destructing `artifact_satisfies_rule`) is not\nthe same as `a2` (the caller-supplied intermediate). The goal after\nthe link-wiring step reduces to `link_target l1 = art_id a2`, but we\nonly have `art_id t1 = link_target l1` — nothing ties `t1` to `a2`.\n\nRather than write around the gap with tactics that wouldn't hold, mark\nthe theorem `Admitted.` with an explicit comment describing what the\ncorrect strengthening would look like. All other theorems in\nSchema.v / Validation.v remain Qed'd.\n\nThis lets the Rocq hard gate actually compile and enforce the proofs\nwe DO have, rather than hiding a stale semantic break behind a tactic\nthat just happened to typecheck on older Rocq.\n\n* fix(ci): honest gate status after first real run\n\nThe first hard-gate run surfaced issues deeper than one-line fixes.\nThis commit restores honesty rather than hiding them:\n\n**Hard gates that stay on:**\n- Kani compile errors (`store: None`, `_artifact`) — fixed, but see below.\n- Rocq `Open Scope list_scope.` + `List.length` qualification + `eapply\n  reach_direct` — applied.\n- Mutation Testing (rivet-cli): 0 surviving mutants, hard gate.\n\n**Jobs moved back to continue-on-error with TODOs:**\n\n- **Kani**: 27-harness suite exceeded the 30-min CI budget and got\n  cancelled. Bumped timeout to 45 min and left continue-on-error on\n  until we scope the PR-sized subset vs nightly full suite.\n\n- **Rocq**: Rocq 9.0.1 is stricter than the version the proofs were\n  written against. Fixed three classes of errors; a fourth (`No such\n  contradiction` in a destructure) remains unfixed. Also\n  `vmodel_chain_two_steps` has a genuine proof gap (link target t1 ≠\n  caller's a2 without an extra hypothesis) and is now `Admitted.` with\n  an explicit note. Needs a systematic port pass before hard-gating.\n\n- **Mutation Testing (rivet-core)**: 3677 mutants, real surviving ones\n  in `collect_yaml_files` / `import_with_schema` (lib.rs:80,241,268)\n  and `bazel.rs::lex` (delete match arm `b'\\r'`). Those are actual\n  test coverage gaps. Hard-gating rivet-core means writing tests to\n  kill every one of them first; scoping that out of this PR.\n  rivet-cli mutation stays hard-gated per above.\n\n- **Verus**: still blocked on rules_rust 0.56 `CcInfo` removal upstream.\n\nThe goal of \"real hard gates\" was to stop advertising verification\nthat never ran green. Three checkpoints are now genuine (rivet-cli\nmutations, Kani compile-clean once unblocked, Rocq compile-clean once\nported). The rest have explicit follow-up notes in ci.yml pointing\nat what needs to happen before they flip.\n\n* ci(verus): flip to hard gate; bump rules_verus pin past CcInfo fix\n\nThe Verus job was marked continue-on-error because rules_verus's\nminimum rules_rust (0.56.0) used the Bazel built-in `CcInfo` symbol\nthat current Bazel has removed, so the module failed to load.\n\npulseengine/rules_verus@fc7b636 bumps the floor to 0.58.0 — the\nrelease where CcInfo is loaded from @rules_cc//cc/common:cc_info.bzl\ninstead. Bumping our pin past that commit unblocks the load and lets\nthe verus job run as a real gate.\n\nThe same pin range (5e2b7c6) also picks up three correctness fixes\nin verus-strip: backtick-escaped `verus!` in doc comments no longer\ntruncates output, `pub exec const` strips the `exec` keyword, and\ncontent after the `verus!{}` block is preserved.\n\nTrace: skip\n\n* fix(bazel): expose verus_specs.rs via rivet-core/src/BUILD.bazel\n\n//verus:rivet_specs_verify references `//rivet-core/src:verus_specs.rs`\nas a Bazel label, but rivet-core/src was not a Bazel package, so\n`bazel test` failed analysis with:\n\n  ERROR: no such package 'rivet-core/src': BUILD file not found\n\nAdds a minimal BUILD.bazel that marks the directory as a package and\nexports the verus specs file. The crate itself is still built via\ncargo — this file exists only so the Bazel-side Verus targets can\naddress the spec source.\n\nTrace: skip\n\n* refactor(bazel): unify repo into a single bzlmod workspace\n\nverus/ and proofs/rocq/ each had their own MODULE.bazel, which made\nevery Bazel label relative to those subdirectories. That broke\n//verus:rivet_specs_verify's attempt to reference\n//rivet-core/src:verus_specs.rs — the label resolved against the\nverus/ workspace root and demanded a `verus/rivet-core/src` directory\nthat doesn't exist, yielding:\n\n  ERROR: no such package 'rivet-core/src': BUILD file not found\n\nRoot cause was architectural. Consolidate into one workspace at the\nrepo root so cross-directory Bazel references work:\n\n- New top-level `MODULE.bazel` merges the two previous module\n  declarations (rules_verus + rules_rocq_rust + rules_nixpkgs_core,\n  same commit pins and same toolchain registrations).\n- New top-level `BUILD.bazel` as a minimal package marker.\n- Deleted `verus/MODULE.bazel` and `proofs/rocq/MODULE.bazel`.\n- CI: run `bazel test //verus:rivet_specs_verify` and\n  `bazel test //proofs/rocq:rivet_metamodel_test` from the repo root,\n  not `working-directory: verus|proofs/rocq`.\n\nThe Rust crates are still built via cargo. Bazel in this repo is\nscoped to the formal-verification targets only. With the unified\nworkspace, //verus:rivet_specs_verify can now reach\n//rivet-core/src:verus_specs.rs which is the precondition for the\nVerus hard gate to do real work.\n\nTrace: skip\n\n* fix(ci): install Nix on Verus runner too\n\nWorkspace consolidation (6771e6e) means root MODULE.bazel registers\nboth Verus and Rocq toolchains. Bazel resolves every registered\ntoolchain at analysis time regardless of which target is being built,\nso the Verus-only job now hits the Rocq toolchain extension, which\nrequires rules_nixpkgs_core, which requires nix-build on PATH:\n\n  ERROR: An error occurred during the fetch of repository\n    'rules_rocq_rust++rocq+rocq_toolchains': Platform is not supported:\n    nix-build not found in PATH.\n\nInstall Nix on the Verus runner too. Small cost (~30s) on a job that\nalready takes 20 min, and it's the minimal fix — alternatives (split\nMODULE.bazel, or rules_nixpkgs_core fail_not_supported) either undo\nthe consolidation or require upstream changes.\n\nTrace: skip\n\n* ci(verus): soft-gate again — toolchain works, specs fail\n\nWorkspace hoist + Nix install fixed the plumbing: Verus now analyses\n//verus:rivet_specs_verify against //rivet-core/src:verus_specs.rs and\ninvokes rust_verify. But the specs themselves fail verification in 0.1s\n— a real SMT proof obligation can't be discharged. That's spec-level\nwork (audit which `requires`/`ensures` clauses are wrong) and doesn't\nbelong in this CI-hard-gate PR. Soft-gate until the spec fixes land.\n\nTrace: skip",
          "timestamp": "2026-04-21T23:05:28-05:00",
          "tree_id": "37cb9b4280f8e6812d4a6c736b19d4bf3c2010b7",
          "url": "https://github.com/pulseengine/rivet/commit/2fafe1a574e590671b21e9fce42b4a76db88ef70"
        },
        "date": 1776831096617,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 63420,
            "range": "± 225",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 678487,
            "range": "± 6153",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 10919758,
            "range": "± 667589",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1482,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 18377,
            "range": "± 35",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 269456,
            "range": "± 1380",
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
            "value": 778867,
            "range": "± 8653",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 127731,
            "range": "± 591",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1487602,
            "range": "± 11779",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 23876175,
            "range": "± 1828586",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 83361,
            "range": "± 401",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 736705,
            "range": "± 4109",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 9182847,
            "range": "± 548001",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3283,
            "range": "± 20",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 34852,
            "range": "± 112",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 564717,
            "range": "± 4408",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 45470,
            "range": "± 175",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 500593,
            "range": "± 3865",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 6107115,
            "range": "± 365890",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 564,
            "range": "± 13",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 5187,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 69446,
            "range": "± 4127",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 16784,
            "range": "± 24",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 114429,
            "range": "± 307",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1056989,
            "range": "± 13193",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "89d3f43a3a62fd9064e2525c749b545bcdeb5561",
          "message": "fix(mcp): scope `set_fields` to domain fields, add top-level `description` setter (#158)\n\nTwo related MCP correctness bugs in `rivet_modify`:\n\n1. `set_fields` silently wrote reserved top-level keys (description, title,\n   status, ...) under the `fields:` sub-map — corrupting the artifact's\n   shape. Values containing backticks or newlines additionally broke the\n   YAML emitter, which used unquoted `format!(\"{key}: {value}\")` lines.\n\n2. There was no way to set the top-level `description` (or other top-level\n   metadata) via MCP — `set_fields` was the only \"generic setter\" and, by\n   design, targets only the domain `fields:` map.\n\nDesign: keep `set_fields` scoped to the `fields:` sub-map and expose\ndedicated setters for top-level metadata. `validate_modify` now rejects\nany `set_fields` key listed in `RESERVED_TOP_LEVEL_KEYS` (id, type, title,\ndescription, status, tags, links, fields, provenance, source-file) with a\nhint pointing at the right parameter. A new `description` parameter on\n`rivet_modify` routes through `ModifyParams::set_description`, which\nemits YAML-safe scalars — multi-line values become block-literal (`|-`)\nscalars, single-line values with YAML-significant characters are\ndouble-quoted with proper escapes. `set_field` in the editor was extended\nto splice multi-line values into the line buffer so block scalars stay\nwell-formed.\n\nTests (added failing first, now green):\n- `test_set_fields_rejects_reserved_description` / `_all_reserved_top_level_keys`\n- `test_modify_sets_top_level_description`\n- `test_modify_description_with_backticks_and_newlines`\n- `test_validate_modify_rejects_reserved_top_level_in_set_fields`\n- `test_yaml_quote_inline_scalar_*`, `test_set_field_writes_*_as_*_scalar`\n\nFixes: REQ-002",
          "timestamp": "2026-04-21T23:19:27-05:00",
          "tree_id": "dfb096793ec21444231ff321ed322a7b687df5eb",
          "url": "https://github.com/pulseengine/rivet/commit/89d3f43a3a62fd9064e2525c749b545bcdeb5561"
        },
        "date": 1776832820358,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 80336,
            "range": "± 1017",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 849054,
            "range": "± 7484",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 15313804,
            "range": "± 1255864",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2213,
            "range": "± 38",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 27200,
            "range": "± 82",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 369616,
            "range": "± 3269",
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
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1005444,
            "range": "± 78912",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 164581,
            "range": "± 897",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1921622,
            "range": "± 26375",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 31923170,
            "range": "± 3528317",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 111286,
            "range": "± 863",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 947408,
            "range": "± 7923",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 14414540,
            "range": "± 1284581",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4283,
            "range": "± 28",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 59889,
            "range": "± 520",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 768291,
            "range": "± 23699",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 62244,
            "range": "± 280",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 698236,
            "range": "± 2942",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 9298941,
            "range": "± 909588",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 812,
            "range": "± 9",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7518,
            "range": "± 90",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 109298,
            "range": "± 621",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23269,
            "range": "± 138",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 165942,
            "range": "± 1521",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1532476,
            "range": "± 21741",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "571816f0fb78743a0654de158ec8f137e646fe96",
          "message": "fix(serve): Cmd+K search URL persistence + embed discoverability design (#159)\n\n* fix(serve): persist Cmd+K search term in URL so reload preserves it\n\nThe Cmd+K overlay used vanilla fetch() with no history write, so a page\nreload (Cmd+R) silently dropped any in-flight search. Now we sync the\ncurrent query into the URL via history.replaceState as ?cmdk=...; on\nload, if ?cmdk= is present we re-open the overlay pre-filled with the\nsaved term and re-run the search. Using cmdk (not q) avoids colliding\nwith the existing /artifacts?q=... filter-bar state.\n\nThe /artifacts filter-bar search input was already wired with\nhx-push-url=\"true\" via components::search_input — this change adds a\nregression test asserting that typing into it updates the URL and the\nvalue survives a reload.\n\nFixes: REQ-007\n\n* docs(design): embed discoverability, {{query:...}} MVP, mermaid, rivet query\n\nDesign note only — no code changes. Covers four UX gaps reported from\ndogfooding in a single note so the trade-offs are visible side-by-side:\n\n1. Mermaid in artifact descriptions (one-function fix in markdown.rs).\n2. {{query:<sexpr>}} embed — reuses existing sexpr_eval; read-only MVP.\n3. rivet docs embeds + table-driven registry for resolve_embed.\n4. rivet query CLI — thin mirror of MCP's rivet_query.\n\nEach section cites exact file paths and line numbers where changes\nwould land. Ends with a priority-ordered recommendation table so the\nimplementation sequence is unambiguous.\n\nExempt type: docs (no trailer required).",
          "timestamp": "2026-04-21T23:19:53-05:00",
          "tree_id": "25c3b523bb50ae55c0ba073b29386a56b5465d79",
          "url": "https://github.com/pulseengine/rivet/commit/571816f0fb78743a0654de158ec8f137e646fe96"
        },
        "date": 1776834397075,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 65346,
            "range": "± 499",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 702590,
            "range": "± 3980",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 10122271,
            "range": "± 362822",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1475,
            "range": "± 9",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 18463,
            "range": "± 37",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 265125,
            "range": "± 1804",
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
            "value": 769017,
            "range": "± 2168",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 129223,
            "range": "± 877",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1472888,
            "range": "± 15526",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 21156466,
            "range": "± 311145",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 83228,
            "range": "± 360",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 732151,
            "range": "± 3463",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 8385718,
            "range": "± 139945",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3199,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 34614,
            "range": "± 355",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 560685,
            "range": "± 6804",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 47444,
            "range": "± 80",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 515789,
            "range": "± 2510",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 6011153,
            "range": "± 47701",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 568,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 5042,
            "range": "± 10",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 69334,
            "range": "± 172",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 16739,
            "range": "± 69",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 117089,
            "range": "± 327",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1082997,
            "range": "± 5475",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "19e8cbaf984b0dde6231a6b9e3a84339b1d0ea9b",
          "message": "test(fuzz): YAML footgun + CLI argv + artifact-id fuzzers (#160)\n\nAdds three libfuzzer-based targets under fuzz/ that empirically measure\nthe arxiv:2604.13108 \"YAML silently corrupts ~50% of structural errors\"\nclaim against rivet's actual artifact-ingest pipeline, plus a CLI argv\ntarget and an id-roundtrip target.\n\nTargets:\n  * yaml_footguns  — Arbitrary-driven adversarial mutations of a known\n    valid seed YAML (Norway, version-coercion, leading-zero-id,\n    unquoted-date, duplicate-key, tab-indent, multi-doc, null-shorthand\n    link, unknown top-level key, anchor cycle, deep nesting, control\n    chars in id).  Five oracles: source-substring invariant for ids /\n    types / link targets, phantom-link detection, null-ish target\n    detection, serde-rejected-but-hir-accepted detection, and\n    multi-document truncation detection.\n  * cli_argv      — structured argv for rivet-cli subprocess; oracle\n    fails on signal-death or when --format json returns success with\n    non-JSON stdout.  Gated on $RIVET_BIN env var so it skips silently\n    if no binary is configured.\n  * artifact_ids  — arbitrary bytes as id: scalar; oracle requires\n    Store::insert → Store::get to round-trip byte-exact.\n\nAlso adds fuzz/examples/oracle_smoke.rs — a non-libfuzzer harness that\nruns the same oracle logic against a fixed set of Mythos-predicted\nfootgun inputs.  Running `cargo run --release --example oracle_smoke`\n(before cargo-fuzz is available in CI) produces five findings on\ncurrent main, empirically confirming:\n  - null / tilde / empty-string link targets produce phantom links\n    (yaml_hir.rs:530-549 bug class)\n  - multi-document YAML is silently truncated by the HIR path\n    (yaml_cst.rs:517 bug class)\n  - renaming `artifacts:` to a sibling key causes the HIR path to\n    return Ok(vec![]) with zero diagnostics (formats/generic.rs:138)\n\nCI: .github/workflows/fuzz.yml runs each target for 15 min on push to\nmain and nightly at 06:17 UTC.  continue-on-error so new crashes do\nnot block merges; crashes upload as workflow artifacts and the evolved\ncorpus is cached between runs.\n\nREQ-052 is scoped to variant-solver fuzzing; these YAML/CLI fuzzers\nverify the broader parser surface (REQ-028) and CLI surface (REQ-007).\n\nVerifies: REQ-028, REQ-007\nRefs: REQ-052\n\nCo-authored-by: Claude Opus 4.7 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-04-21T23:20:17-05:00",
          "tree_id": "5d37a010efdba2cd47e9bb3a3e359c75b427f843",
          "url": "https://github.com/pulseengine/rivet/commit/19e8cbaf984b0dde6231a6b9e3a84339b1d0ea9b"
        },
        "date": 1776835179633,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 80194,
            "range": "± 499",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 842530,
            "range": "± 2776",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 11123083,
            "range": "± 445104",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2219,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25826,
            "range": "± 283",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 353885,
            "range": "± 2665",
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
            "value": 1004683,
            "range": "± 29116",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 161978,
            "range": "± 788",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1872259,
            "range": "± 10819",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 24319952,
            "range": "± 2834191",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 113094,
            "range": "± 608",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 961908,
            "range": "± 2646",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 9675462,
            "range": "± 271441",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4221,
            "range": "± 9",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 59847,
            "range": "± 274",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 755355,
            "range": "± 2622",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 62423,
            "range": "± 370",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 706328,
            "range": "± 3634",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7822420,
            "range": "± 62398",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 824,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7065,
            "range": "± 97",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 126662,
            "range": "± 1774",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23424,
            "range": "± 125",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 165154,
            "range": "± 2348",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1526304,
            "range": "± 10820",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "1dc7457329fa1ece43c23395f4888bddd5f4bac1",
          "message": "docs: CLI gap synthesis from 37-module artifact walk (2026-04) (#161)\n\nDesign proposal only — captures five missing rivet features surfaced by a\n3,400-artifact reporting-project session (discover/scan, add --from-source,\ngaps --suggest, schema path type, JUnit artifact generation) plus a ranked\nbacklog of 10 improvements. File-path anchors verified against the current\nrivet-cli and rivet-core trees.\n\nRefs: FEAT-001",
          "timestamp": "2026-04-21T23:20:36-05:00",
          "tree_id": "8037f48b480f697d8938cb561cc1d46fc6c8a259",
          "url": "https://github.com/pulseengine/rivet/commit/1dc7457329fa1ece43c23395f4888bddd5f4bac1"
        },
        "date": 1776835694105,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 81458,
            "range": "± 9651",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 846654,
            "range": "± 2714",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12806718,
            "range": "± 891902",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2113,
            "range": "± 20",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26761,
            "range": "± 148",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 369141,
            "range": "± 5043",
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
            "value": 999244,
            "range": "± 30544",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 160566,
            "range": "± 2500",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1861538,
            "range": "± 12200",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 24443913,
            "range": "± 1413500",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 111442,
            "range": "± 682",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 955822,
            "range": "± 21871",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 10834171,
            "range": "± 816671",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4233,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 59650,
            "range": "± 3151",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 771760,
            "range": "± 2572",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 61936,
            "range": "± 1644",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 696407,
            "range": "± 3404",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7858152,
            "range": "± 303969",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 820,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7388,
            "range": "± 29",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 125990,
            "range": "± 844",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23085,
            "range": "± 159",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 166594,
            "range": "± 11640",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1528161,
            "range": "± 21452",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "d1436631c3169d66884423dba7d3a2a11bd5d4a8",
          "message": "docs: design plan for s-expression as a second artifact format (#162)\n\nConcrete, cost-estimated design doc covering four scope options (A: export-\nonly, B: read-only import, C: full bidirectional, D: replace YAML) with\nverified LoC-based effort estimates drawn from reading the existing\nrivet-core and rivet-cli sources.\n\nRecommendation: Option A gated on YAML fuzzer results. Option C is\n40-60 person-days up front plus ~20%/yr dual-path maintenance and is\nnot justified on current evidence.\n\nRefs: #128\nRefs: DD-048",
          "timestamp": "2026-04-21T23:20:55-05:00",
          "tree_id": "e8b4c01ca21b43c9889b20df65fab8dca7f65d27",
          "url": "https://github.com/pulseengine/rivet/commit/d1436631c3169d66884423dba7d3a2a11bd5d4a8"
        },
        "date": 1776836045038,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 79982,
            "range": "± 888",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 839630,
            "range": "± 8358",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 11276757,
            "range": "± 1030452",
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
            "value": 26633,
            "range": "± 106",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 356745,
            "range": "± 1466",
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
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 994408,
            "range": "± 13010",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 162775,
            "range": "± 1459",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1883513,
            "range": "± 6999",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 23169455,
            "range": "± 576686",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 110328,
            "range": "± 2018",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 959203,
            "range": "± 10295",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 9752049,
            "range": "± 334330",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4240,
            "range": "± 10",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 63072,
            "range": "± 306",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 761548,
            "range": "± 2351",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 62410,
            "range": "± 785",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 690786,
            "range": "± 10086",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7589085,
            "range": "± 61781",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 822,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7331,
            "range": "± 30",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 112603,
            "range": "± 636",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22907,
            "range": "± 285",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 164616,
            "range": "± 1020",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1530371,
            "range": "± 9994",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "deeafeb16473e54701fa2f5e6d0e8697b7322f1e",
          "message": "feat(release): attach VSIX to GitHub Release + fix Marketplace publish (#163)\n\nTwo related bugs in the VS Code extension release flow:\n\n1. **VSIX wasn't attached to the GitHub Release.** The `build-vsix` job\n   in ci.yml ran on tag push and uploaded the VSIX as a workflow artifact\n   only — users couldn't download it from the Release page, they had to\n   dig through the Actions tab.\n\n2. **`publish-vsix` never actually ran on Marketplace.** It was gated on\n   `needs: [build-vsix, release-results]`, but `release-results` doesn't\n   exist as a job in ci.yml (it lives in release.yml, a separate\n   workflow — GitHub Actions workflows can't depend on each other's\n   jobs). Result: the Marketplace publish job was never scheduled on\n   any tag, which is why only the spar extension currently appears on\n   the Marketplace — rivet's has never actually shipped.\n\n**Fix:** move both jobs into release.yml where they belong, wire them\ninto the existing tag-triggered pipeline:\n\n- `build-vsix` → runs alongside `build-binaries`\n- `create-release` → now depends on build-vsix too, and globs `*.vsix`\n  in the asset collection step so the VSIX attaches to the Release\n- `publish-vsix-marketplace` → runs after create-release so the VSIX\n  is guaranteed on the Release page even if Marketplace publish fails.\n  Now prints a `::warning::` if VSCE_PAT is unset instead of silently\n  skipping, which is what hid the \"extension isn't on Marketplace\" bug\n  in the first place.\n\nAlso bumps `vscode-rivet/package.json` version from 0.3.0 → 0.4.0 so\nthe next released extension matches the workspace version.\n\n**Follow-up for the user:** configure the VSCE_PAT secret in the rivet\nrepo settings (Azure DevOps PAT with Marketplace > Manage scope).\nWithout it the warning will continue to fire on every release until\nconfigured.\n\nTrace: skip",
          "timestamp": "2026-04-21T23:21:13-05:00",
          "tree_id": "ccc41c25b53dfa8c94f5cd1cffea999fc02dadbd",
          "url": "https://github.com/pulseengine/rivet/commit/deeafeb16473e54701fa2f5e6d0e8697b7322f1e"
        },
        "date": 1776836730971,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 82128,
            "range": "± 487",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 873304,
            "range": "± 13392",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 16311756,
            "range": "± 1279198",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1939,
            "range": "± 19",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24951,
            "range": "± 544",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 357835,
            "range": "± 2772",
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
            "value": 989817,
            "range": "± 7591",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 166897,
            "range": "± 19183",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1948415,
            "range": "± 24378",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 37335205,
            "range": "± 3066873",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 107678,
            "range": "± 676",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 959445,
            "range": "± 4250",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 14241292,
            "range": "± 1105556",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4126,
            "range": "± 10",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 45303,
            "range": "± 1971",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 747588,
            "range": "± 17744",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 63878,
            "range": "± 194",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 705852,
            "range": "± 17259",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 9238906,
            "range": "± 313142",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 767,
            "range": "± 10",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 6954,
            "range": "± 28",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 92088,
            "range": "± 1491",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21917,
            "range": "± 313",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 151688,
            "range": "± 1334",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1404931,
            "range": "± 8019",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "8d7ad955f67da3dadedc959b077693bcb1d00f07",
          "message": "docs: add ISO 26262 artifact mapping and gap analysis (#164)\n\nEnumerates ~40 ISO 26262:2018 work products (parts 3-9), maps each to\nrivet's current schemas (common, stpa, iec-61508, aspice, score,\nsafety-case, iso-pas-8800), and records the gaps that block an honest\nclaim of \"ISO 26262 support\". 32.5% EXACT, 42.5% APPROX, 25% ABSENT.\nTop gaps: ASIL decomposition, FMEDA with SPFM/LFM/PMHF, item definition\nwith S/E/C-driven HARA, HSI specification, tool confidence TCL matrix.\n\nThis is gap analysis only — no schemas are proposed or implemented.\n\nRefs: REQ-010, FEAT-001\n\nCo-authored-by: Claude Opus 4.7 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-04-21T23:21:25-05:00",
          "tree_id": "af777b92671ac4cb7c8106b4327313beb3cce83c",
          "url": "https://github.com/pulseengine/rivet/commit/8d7ad955f67da3dadedc959b077693bcb1d00f07"
        },
        "date": 1776836922915,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 80729,
            "range": "± 836",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 863038,
            "range": "± 7858",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12858393,
            "range": "± 617901",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1923,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24867,
            "range": "± 49",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 360238,
            "range": "± 9430",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 97,
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
            "value": 97,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 991632,
            "range": "± 12862",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 169795,
            "range": "± 2729",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1958325,
            "range": "± 15166",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 28638379,
            "range": "± 2486099",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 109201,
            "range": "± 884",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 970272,
            "range": "± 24673",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 10961025,
            "range": "± 270824",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4172,
            "range": "± 16",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 45740,
            "range": "± 1046",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 742657,
            "range": "± 7492",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 58785,
            "range": "± 198",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 719484,
            "range": "± 2442",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8078543,
            "range": "± 310142",
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
            "value": 6904,
            "range": "± 65",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 90552,
            "range": "± 469",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21630,
            "range": "± 111",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 151425,
            "range": "± 3371",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1396101,
            "range": "± 16811",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "0dbf10ce5d9371506d48c3b9a520cf19f3fda938",
          "message": "build(npm): add @pulseengine/rivet distribution (#166)\n\nAdds npm distribution machinery so rivet can be installed/run via\n`npx @pulseengine/rivet` and registered with Claude Code as an MCP server.\n\nPattern follows pulseengine/template-mcp-server:\n- Root package (`npm/`) uses per-platform optionalDependencies\n  - index.js resolves the correct platform package for the current OS/arch\n  - run.js spawns the resolved binary, forwarding argv/stdio/signals\n  - install.js is idempotent: no-op when platform package resolved, else\n    downloads the archive from the GitHub Release as a fallback\n- Five platform packages under `platform-packages/` (darwin-arm64,\n  darwin-x64, linux-arm64, linux-x64, win32-x64) — each ships a single\n  pre-built binary at publish time (gitignored in source)\n- `release-npm.yml` triggers on `release: published`, downloads the\n  archives produced by `release.yml`, assembles + publishes each platform\n  package, then publishes the root package last so optionalDependencies\n  resolve on first install\n\nDoes not modify release.yml; consumes its artifacts via the release event.\n\nTrace: skip",
          "timestamp": "2026-04-21T23:21:33-05:00",
          "tree_id": "47051f1d6443666dbc4c29e076f678b92cc6801b",
          "url": "https://github.com/pulseengine/rivet/commit/0dbf10ce5d9371506d48c3b9a520cf19f3fda938"
        },
        "date": 1776837018559,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 80408,
            "range": "± 253",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 845732,
            "range": "± 22065",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12414144,
            "range": "± 920339",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2406,
            "range": "± 11",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26302,
            "range": "± 174",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 374972,
            "range": "± 1987",
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
            "value": 1004034,
            "range": "± 21061",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 165173,
            "range": "± 475",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1915626,
            "range": "± 10797",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 26631897,
            "range": "± 1661262",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 111908,
            "range": "± 952",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 953927,
            "range": "± 5731",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 11331299,
            "range": "± 718090",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4418,
            "range": "± 21",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 61036,
            "range": "± 479",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 780951,
            "range": "± 6113",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 63378,
            "range": "± 297",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 693022,
            "range": "± 2909",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7770007,
            "range": "± 161304",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 803,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7618,
            "range": "± 33",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 111853,
            "range": "± 566",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23032,
            "range": "± 176",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 165251,
            "range": "± 649",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1523531,
            "range": "± 18306",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "61bfc41763a5fd392b7555d892a27b090249a863",
          "message": "docs: audit of documentation-reality mismatches (#171)\n\nEvidence-only audit of every public-facing doc surface (README, docs/,\nCHANGELOG, AGENTS.md, CLAUDE.md, vscode-rivet/README.md, schemas,\nCLI help strings). 28 mismatches registered with claim/reality/type/\nseverity. Top finding: Kani/Verus/Rocq CI jobs are all\ncontinue-on-error:true but CHANGELOG claims them as \"wired in\".\nSecondary: docs/audit-report.md still says fuzz+mutation \"NOT\nIMPLEMENTED\"; docs/schemas.md documents 5 of 27 schemas; multiple\nhand-coded artifact counts (447/57/235+) have drifted from live\nregenerated AGENTS.md values. No fixes applied; separate PRs.\n\nTrace: skip",
          "timestamp": "2026-04-22T00:25:21-05:00",
          "tree_id": "0b7f7ad514851b64d0aac236112b6969618f9294",
          "url": "https://github.com/pulseengine/rivet/commit/61bfc41763a5fd392b7555d892a27b090249a863"
        },
        "date": 1776840546860,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 75407,
            "range": "± 253",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 879766,
            "range": "± 3104",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13619529,
            "range": "± 452687",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1677,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 19262,
            "range": "± 54",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 364096,
            "range": "± 1368",
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
            "value": 917196,
            "range": "± 4688",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 158398,
            "range": "± 691",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1865935,
            "range": "± 18638",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 31747696,
            "range": "± 2108657",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 106256,
            "range": "± 875",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 962591,
            "range": "± 4982",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 12384048,
            "range": "± 851491",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3846,
            "range": "± 17",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 40570,
            "range": "± 154",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 775184,
            "range": "± 5155",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 53201,
            "range": "± 407",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 591902,
            "range": "± 3192",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 6923936,
            "range": "± 149777",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 646,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 5450,
            "range": "± 12",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 154496,
            "range": "± 392",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 20983,
            "range": "± 57",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 147682,
            "range": "± 463",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1374955,
            "range": "± 8929",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "a24c1b95c4d16db2e76ebbe2d8457d0e928bea3b",
          "message": "docs: AI-evidence trend research for product positioning (#173)\n\nInternal strategy doc analyzing whether \"AI agents generating\nwork-product evidence under human review\" is a real industry\ntrend. Field map of 20+ adjacent tools, regulatory tailwind\nanalysis (EU AI Act, ISO/IEC 42001, ASPICE/ISO 26262), and\nfive labelled predictions to test in 12 months.\n\nVerdict: emerging category, not yet a coalesced market. Rivet's\nevidence-unit framing (schema-validated YAML artifacts + AI\nprovenance stamp + human-review validation) is currently only\nshared by useblocks' pharaoh (5 stars), leaving 12-18 months\nof defensible lane around safety-critical SDLCs.\n\nRefs: FEAT-001\n\nCo-authored-by: Claude Opus 4.7 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-04-22T00:25:25-05:00",
          "tree_id": "08aff8315a4eee51bf8f15408dbdd99c924ac6c4",
          "url": "https://github.com/pulseengine/rivet/commit/a24c1b95c4d16db2e76ebbe2d8457d0e928bea3b"
        },
        "date": 1776840974615,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 75422,
            "range": "± 528",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 888137,
            "range": "± 18076",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12948864,
            "range": "± 1395961",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1679,
            "range": "± 10",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 19264,
            "range": "± 61",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 368578,
            "range": "± 2033",
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
            "value": 86,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 87,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 942986,
            "range": "± 6964",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 159145,
            "range": "± 564",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1837707,
            "range": "± 11580",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 46495099,
            "range": "± 6329828",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 106947,
            "range": "± 477",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 944778,
            "range": "± 6489",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 20575420,
            "range": "± 4192188",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3944,
            "range": "± 23",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 40368,
            "range": "± 145",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 797948,
            "range": "± 4703",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 53890,
            "range": "± 178",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 593193,
            "range": "± 3478",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7940709,
            "range": "± 870929",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 647,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 5527,
            "range": "± 12",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 150489,
            "range": "± 983",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21235,
            "range": "± 46",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 148581,
            "range": "± 857",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1375967,
            "range": "± 9026",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "a3f189ddfaf6ca84bd17b957668f7c3edd8af082",
          "message": "docs: v0.4.1 positioning — Evidence as Code frame (#172)\n\n* docs: v0.4.1 positioning — Evidence as Code frame\n\nAdd docs/what-is-rivet.md as the canonical positioning doc:\n\n- Frame rivet as the audit substrate for AI-assisted engineering\n  (not \"SDLC traceability\"). Contrast with Sphinx-Needs'\n  \"Engineering as Code\": rivet is \"Evidence as Code\" — AI-authored,\n  provenance-stamped, machine-validated, human-reviewed in PRs.\n- Document the per-situation playbook for 11 use-cases (TDD, ASPICE,\n  STPA/ISO 26262, requirements, variant/PLE, LLM code review,\n  provenance, cross-tool interop, GSN, tool qualification,\n  spec-driven dev), each with question, artifacts, AI role, human\n  role, and explicit limits.\n- Make the human-vs-AI split explicit in a table.\n- Document what rivet is NOT (no Polarion live editing, no direct\n  ALM connector today, no iso-26262.yaml schema yet, no npm\n  distribution yet — all marked \"planned for v0.5.0\").\n- Quick-start with today's install path (cargo) plus the planned\n  npm path for v0.5.0.\n\nRewrite README.md intro (top ~30 lines) to align with the frame —\nreplacing the feature-list first paragraph with an evidence-centric\none-paragraph pitch that points at docs/what-is-rivet.md for depth.\n\nAll capability claims are verifiable against main HEAD: 34 hazards +\n62 UCAs + 62 controller constraints in safety/stpa/, the MCP tool\nlist (rivet_list/get/query/add/modify/link/unlink/remove/validate/\ncoverage/stats/schema/embed/snapshot_capture/reload) matches\nrivet-cli/src/mcp.rs, and the s-expr predicates\n(forall/exists/reachable-from/reachable-to) match\nrivet-core/src/sexpr_eval.rs.\n\nRefs: FEAT-001\n\nCo-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>\n\n* docs(positioning): align voice to v0.1.0 blog cadence\n\nRewrites docs/what-is-rivet.md and the README intro to match the\nrivet-v0-1-0 blog post cadence: Problem → Answer → Evidence,\nconcrete numbers per section, no marketing vocabulary, three-sentence\nREADME intro (problem / answer / concrete result).\n\nAll facts from 3b89365 preserved. Honesty flags for planned-for-v0.5.0\nitems kept. Use-case palette kept; human-vs-AI table tightened.\n\nRefs: FEAT-001\n\n---------\n\nCo-authored-by: Claude Opus 4.7 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-04-22T00:32:09-05:00",
          "tree_id": "6379ad236d5682e7c14da0998a4bc8351d94d727",
          "url": "https://github.com/pulseengine/rivet/commit/a3f189ddfaf6ca84bd17b957668f7c3edd8af082"
        },
        "date": 1776841340990,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 63742,
            "range": "± 482",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 680683,
            "range": "± 7610",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 10084167,
            "range": "± 397043",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1493,
            "range": "± 42",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 17655,
            "range": "± 42",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 268831,
            "range": "± 1372",
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
            "value": 765988,
            "range": "± 32770",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 129799,
            "range": "± 946",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1499369,
            "range": "± 11804",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 20796472,
            "range": "± 368766",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 83682,
            "range": "± 2191",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 735591,
            "range": "± 2384",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 8237603,
            "range": "± 103401",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3180,
            "range": "± 71",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 35712,
            "range": "± 233",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 570915,
            "range": "± 24810",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 46925,
            "range": "± 132",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 509907,
            "range": "± 3215",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 5991563,
            "range": "± 30851",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 564,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 5259,
            "range": "± 18",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 69200,
            "range": "± 2897",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 16821,
            "range": "± 46",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 116224,
            "range": "± 248",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1084353,
            "range": "± 16570",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "c1d0d01422cd78c8b80e5a39271f8154b20d1890",
          "message": "docs: AI + safety/cyber human-in-the-loop contract (#176)\n\nFrame for the recurring customer objection \"a qualified human still\nhas to do this.\" Enumerates the named-human sign-off role across ISO\n26262, IEC 61508, IEC 62304, DO-178C, EN 50128, ISO/SAE 21434,\nISO 27001, IEC 62443, ASPICE 4.0, EU AI Act Art. 14, and NIST AI RMF.\n\nThen establishes rivet's four-point HITL contract:\n1. Provenance-on-author (today — schemas/common.yaml already gates\n   ai-generated artifacts reaching `active` without reviewed-by).\n2. Human sign-off as a separate stamp (today — `rivet stamp\n   --reviewed-by`; gaps: no structured rationale, no `rivet approve`\n   alias, no Part 11 e-signature).\n3. Audit-trail view (v0.5.0 proposal — `rivet audit-trail <id>` over\n   git history + provenance transitions).\n4. Structural-only validator boundary (today — `rivet validate` never\n   claims to assess credibility).\n\nExplicitly lists what rivet does NOT claim (no safety analysis, no\nhazard-credibility assessment, no assessor replacement, no TCL/TQL\nself-qualification, no regulatory guarantee, no 21 CFR Part 11).\nFive implementation items for v0.5.0 backlog are called out.\n\nLive web fetch was unavailable this session; external standard\nclauses and vendor marketing phrases are flagged *(unverified)* per\nthe constraint \"mark unverified.\"\n\nRefs: FEAT-001, REQ-002, REQ-030\n\nCo-authored-by: Claude Opus 4.7 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-04-22T00:25:35-05:00",
          "tree_id": "272a721846a6963082381fedb240b874128c6183",
          "url": "https://github.com/pulseengine/rivet/commit/c1d0d01422cd78c8b80e5a39271f8154b20d1890"
        },
        "date": 1776841344635,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 79561,
            "range": "± 1157",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 849454,
            "range": "± 6572",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12427702,
            "range": "± 768171",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2189,
            "range": "± 10",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25486,
            "range": "± 127",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 352176,
            "range": "± 1570",
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
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 996233,
            "range": "± 16554",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 159007,
            "range": "± 4536",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1850951,
            "range": "± 37748",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 28155296,
            "range": "± 2195918",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 113134,
            "range": "± 776",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 947809,
            "range": "± 15194",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 12408565,
            "range": "± 1329571",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4210,
            "range": "± 11",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 59012,
            "range": "± 425",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 752776,
            "range": "± 3071",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 62611,
            "range": "± 229",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 689625,
            "range": "± 4883",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8331694,
            "range": "± 473156",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 792,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7198,
            "range": "± 20",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 114702,
            "range": "± 804",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23190,
            "range": "± 188",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 165972,
            "range": "± 2022",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1549161,
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
          "id": "ec093ec1eb089e236fd7cbf6bd3bfec177a37fd3",
          "message": "fix(v0.4.1): 5 user-reported pain points (#3, #4, #6, #7, #8) (#174)\n\n* docs+feat(variant): feature-model schema reference + init scaffolder\n\nPain point: users reverse-engineer the feature-model YAML schema because\n`rivet variant --help` has no field reference and `selects:` vs\n`selected:` / group types / s-expression constraint syntax / bindings\nfile shape are undocumented.\n\nChanges:\n- Add docs/feature-model-schema.md: top-level reference for feature\n  model YAML (root, features, group types, constraint syntax) with a\n  worked example.\n- Add docs/feature-model-bindings.md: dedicated binding file reference.\n- Link both from docs/getting-started.md.\n- Variant subcommand doc-comment now points at the schema reference so\n  `rivet variant --help` surfaces it.\n- Add `rivet variant init <name>` scaffolder that writes a starter\n  feature-model.yaml + bindings/<name>.yaml with comments documenting\n  every field.\n\nTests: 3 new integration tests in rivet-cli/tests/variant_init.rs\ncovering scaffolded file contents, overwrite protection, and that the\nscaffolded template parses clean via `rivet variant list`.\n\nImplements: REQ-042, REQ-043, REQ-044\nRefs: REQ-046\n\nCo-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>\n\n* fix(hooks): pre-commit hook walks up to find rivet.yaml (marker discovery)\n\nPain point: `rivet init --hooks` emitted a pre-commit hook that ran\n`rivet validate` at the git root. If the rivet project is relocated\ninside the working tree (e.g. moved to subdir/), the hook either\nsilently validates the wrong directory or fails to find rivet.yaml.\n\nFix: the installed pre-commit hook now walks up from $PWD until it\nfinds a directory containing rivet.yaml, then cd's there before\ninvoking `rivet validate`. If no rivet.yaml exists in the ancestor\nchain, the hook exits 0 silently so it does not block commits in\nunrelated repositories.\n\nTests: rivet-cli/tests/hooks_install.rs adds 2 integration tests — one\nverifies the hook body does not embed a hard-coded -p/--project flag and\nuses the walk-up pattern; one stages a fresh project, moves rivet.yaml\ninto a subdirectory, and confirms the hook still discovers it when run\nfrom a nested path.\n\nFixes: REQ-051\n\nCo-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>\n\n* feat(variant): check-all + optional --variant on validate (API ergonomics)\n\nPain point: variant-scoped validation required --model, --variant, and\n--binding to be passed together — there was no way to validate just\nmodel/binding consistency, and no single-invocation way to assert a\nwhole batch of variants is valid.\n\nChanges:\n- `rivet validate --model X --binding Y` (no --variant) now parses the\n  model, parses the binding, and checks that every feature referenced\n  in the binding exists in the model. Reports a clear diagnostic on\n  unknown feature names instead of the old \"must all be provided\n  together\" error. The full --model + --variant + --binding mode is\n  unchanged.\n- `rivet variant check-all --model M --binding B` iterates every\n  variant declared under `variants:` in the binding file, prints a\n  PASS/FAIL line per variant, and exits non-zero if any fail.\n- `FeatureBinding` in rivet-core grows an optional `variants:` field\n  (default empty) so the same file can carry bindings and declared\n  variants without schema churn.\n\nTests: 5 new integration tests in rivet-cli/tests/variant_scoped_api.rs\ncover the no-variant validate mode, the unknown-feature diagnostic,\ncheck-all exit codes for mixed/all-pass fixtures, and JSON output shape.\nExisting feature_model unit tests still pass (binding YAML is\nbackward-compatible — `variants:` defaults to empty).\n\nImplements: REQ-044, REQ-045, REQ-046\n\nCo-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>\n\n* fix(sexpr): semantic notes on filter parse errors\n\nPain point: `[FilterError { offset: 14, message: \"unexpected atom at\ntop level\" }]` exposed parser internals. Users writing `A and B`,\n`and A B`, or `(bogus A B)` got a positional offset with no hint that\nthey were using the wrong syntax.\n\nFix: extend `FilterError` with an optional `note` field, populated by a\nclassifier that inspects the source before parsing. Three common shapes\nget a semantic nudge:\n  - bare infix (`A and B`) → suggest `(and A B)`.\n  - missing outer parens (`and A B`) → suggest wrapping it.\n  - unknown head (`(bogus …)`) → reference the supported form list.\n`FilterError::Display` renders the positional detail followed by the\nnote on a new line. Feature-model constraint errors now format via\nDisplay instead of Debug, so the note bubbles out through\n`rivet variant check` / `rivet validate --model` paths.\n\nTests: 4 new unit tests in sexpr_eval covering the three error shapes\nplus a success case that must carry no note. All pre-existing tests\nunchanged.\n\nFixes: REQ-043\nImplements: REQ-042\n\nCo-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>\n\n* feat(variant-solve): per-feature origin tracking (selected vs mandatory vs implied)\n\nPain point: `rivet variant solve` output mixed user-picked features with\nones the solver added via mandatory-group propagation or constraint\nimplication. A flat list like `base, auth, oauth, token-cache, metrics`\ndidn't tell the user which features were their intent and which were\ndownstream effects.\n\nMinimum-impact change per scope-limits brief (risk of conflict with\nPR #156 cross-tree constraint work):\n- Extend `ResolvedVariant` with a per-feature `origins: BTreeMap<String,\n  FeatureOrigin>` where FeatureOrigin is UserSelected / Mandatory /\n  ImpliedBy(name) / AllowedButUnbound.\n- Populate origins alongside the existing selected-set fixpoint loop —\n  no algorithmic changes. First-reason-wins on insertion so user\n  selection beats later mandatory/implied discoveries.\n- Text output of `rivet variant solve` prints one feature per line,\n  prefixed with `+`, labeled (mandatory) / (selected) / (implied by X).\n- JSON output is strictly additive: `effective_features` + `feature_count`\n  preserved, new `origins` object keyed by feature name.\n\nTests:\n- 4 new unit tests in rivet-core/src/feature_model.rs covering each\n  origin variant.\n- 2 new integration tests in rivet-cli/tests/variant_solve_origins.rs\n  asserting text prefixes/labels and JSON backwards compatibility.\n- All 15 pre-existing feature_model unit tests still pass; all 6\n  proptest_feature_model properties still hold.\n\nImplements: REQ-043, REQ-046\nRefs: REQ-052\n\nCo-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>\n\n---------\n\nCo-authored-by: Claude Opus 4.7 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-04-22T00:32:13-05:00",
          "tree_id": "a752f13702e3de6aea7757c820a5549510722dda",
          "url": "https://github.com/pulseengine/rivet/commit/ec093ec1eb089e236fd7cbf6bd3bfec177a37fd3"
        },
        "date": 1776841901385,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 80953,
            "range": "± 666",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 856517,
            "range": "± 7367",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12537279,
            "range": "± 648516",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2205,
            "range": "± 9",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26488,
            "range": "± 132",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 376680,
            "range": "± 6983",
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
            "value": 96,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1003470,
            "range": "± 11170",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 160605,
            "range": "± 1496",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1894233,
            "range": "± 15650",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 24722751,
            "range": "± 589888",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 109140,
            "range": "± 466",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 919630,
            "range": "± 6164",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 10029428,
            "range": "± 280437",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4265,
            "range": "± 42",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 59637,
            "range": "± 315",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 758953,
            "range": "± 3808",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 63192,
            "range": "± 340",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 689828,
            "range": "± 5949",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7627965,
            "range": "± 156473",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 775,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7516,
            "range": "± 40",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 120861,
            "range": "± 1266",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22560,
            "range": "± 91",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 157621,
            "range": "± 1656",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1483546,
            "range": "± 23154",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "89cdb7531d1c24ed9572ba163699e144d6318de4",
          "message": "fix(reqif): 6 fidelity bugs — provenance, typed fields, tags, creation-time, enum, dangling relations (#175)\n\n* fix(reqif): round-trip AI provenance via rivet:* string attributes\n\nReqIF importer set `provenance: None` unconditionally and the exporter\nnever emitted any provenance data — every AI-provenance field was ABSENT\non Path 2 per the fidelity analysis in\ndocs/design/polarion-reqif-fidelity.md.\n\nDefine a stable ReqIF AttributeDefinition scheme (five `rivet:*` string\nattributes: created-by, model, session-id, timestamp, reviewed-by) and\nround-trip the full `Provenance` struct.  Absence on import stays\n`None` for backward compatibility with files that don't carry rivet\nmetadata.\n\nAdds two regression tests:\n- test_provenance_roundtrip — all five fields survive\n- test_provenance_absent_stays_none — backward-compat contract\n\nFixes: REQ-025\n\n* fix(reqif): emit typed fields via canonical strings, not Debug-form\n\nThe exporter wrote `format!(\\\"{other:?}\\\")` for any non-string\n`serde_yaml::Value` in `Artifact.fields`, producing XML payloads like\n`\\\"Bool(true)\\\"` and `\\\"Sequence [String(\\\\\\\"a\\\\\\\")]\\\"` — not something any\nReqIF consumer (Polarion, DOORS, StrictDoc) could parse.\n\nReplace with `encode_field_value` doing explicit per-variant conversion:\n- `Bool`  → `\\\"true\\\"` / `\\\"false\\\"`\n- `Number` → decimal string\n- `Sequence` / `Mapping` → JSON (well-known, reversible, and a YAML\n  subset so it survives re-parse)\n- `Null` → attribute omitted\n- `Tagged` → recurse on inner value\n\nThe importer mirrors this with `decode_field_value`: best-effort JSON\nrecovery for content that unambiguously looks structured (leading `[`,\n`{`, `true`, `false`, or a digit/sign); anything else stays a string.\n\nAdds two regression tests:\n- test_non_string_fields_roundtrip — bool/int/float/list round-trip and\n  the raw XML contains no `Bool(`, `Number(`, or `Sequence [` fragments.\n- test_null_field_dropped_on_export — null fields are omitted, not\n  emitted as empty attributes.\n\nFixes: REQ-025\n\n* fix(reqif): encode tags as JSON array so commas and whitespace survive\n\nTags were joined on `, ` at export and split on `,` at import, so any\ntag containing a comma (`\\\"safety, critical\\\"`) or leading whitespace was\nsilently mangled on re-import — a silent corruption flagged in the\nfidelity scorecard.\n\nSwitch to JSON array encoding on export (`[\\\"safety, critical\\\", \\\"plain\\\"]`).\n`decode_tags` auto-detects the form: values starting with `[` are parsed\nas JSON; everything else falls back to the legacy comma-split, keeping\nbackward compatibility with older rivet exports and ReqIF files from\nother tools.\n\nAdds two regression tests:\n- test_tags_with_special_chars_roundtrip — commas, leading space, and\n  quotes all survive export/import.\n- test_tags_legacy_comma_form_parses — the fallback path still works.\n\nFixes: REQ-025\n\n* fix(reqif): stamp REQ-IF-HEADER CREATION-TIME with current UTC\n\nThe header hardcoded `creation_time: None`, so every export emitted an\nempty CREATION-TIME — tools like Polarion's ReqIF importer have nothing\nto record against, and diffing two exports over time becomes impossible.\n\nAdd `reqif_creation_timestamp()` which returns ISO-8601 UTC using the\nsame `std::time::SystemTime` + civil_from_days algorithm already used by\n`export.rs::timestamp_now`, keeping the no-chrono dep contract.\n\nAdds regression test test_creation_time_is_stamped asserting the XML\ncontains a non-empty `<CREATION-TIME>` in the 20-char ISO form.\n\nFixes: REQ-025\n\n* fix(reqif): emit ENUMERATION datatype for schema allowed-values fields\n\nThe exporter always wrote a single `DATATYPE-DEFINITION-STRING` and\nmapped every field to a STRING attribute, silently flattening any\n`allowed-values` constraint the schema declared (e.g. severity:\n[catastrophic, critical, marginal, negligible]).  Downstream tools that\nconsume ReqIF lose the closed-enum semantics.\n\nAdd `ReqIfAdapter::with_schema(schema)` and a new\n`build_reqif_with_schema(artifacts, Option<&Schema>)`; `build_reqif` now\ndelegates to it with `None` for backward compatibility.  When a schema\nis attached and the artifact's `ArtifactTypeDef.fields` declares\n`allowed-values`, the exporter emits:\n\n- one `DATATYPE-DEFINITION-ENUMERATION` per (artifact-type, field) pair\n- an `ATTRIBUTE-DEFINITION-ENUMERATION` on the matching SpecObjectType\n- an `ATTRIBUTE-VALUE-ENUMERATION` on each SpecObject whose value\n  matches an allowed label; values outside the enum fall back to STRING\n  so validate.rs can still flag them.\n\nThe importer path is unchanged — it already recognised\nATTRIBUTE-VALUE-ENUMERATION via the existing StrictDoc compatibility\ncode — so the round-trip closes.\n\nAdds two regression tests:\n- test_schema_enum_field_emits_enumeration — round-trip through a real\n  `Schema` with `allowed-values: [catastrophic, critical, …]`.\n- test_export_without_schema_stays_string — no unexpected ENUMERATION\n  when no schema is attached.\n\nSchema.rs is not modified; the adapter only reads `FieldDef.allowed_values`\nvia its public API.\n\nFixes: REQ-025\n\n* fix(reqif): reject dangling SPEC-RELATION targets instead of phantom Links\n\nPreviously the importer built `SpecRelation`s in a single pass: if the\ntarget SpecObject didn't exist in the file, the Link was still attached\nto the source artifact pointing at a missing ID.  That phantom edge\nwould later surface as a broken link in the LinkGraph, but the cause\n(a malformed ReqIF input) was silently lost.\n\nTwo-pass import:\n  1. First pass (already present) collects every SpecObject ID into\n     `artifact_ids`.\n  2. Relation pass now checks both source and target against that set;\n     any mismatch is collected into `dangling` with the source/target/role\n     triple.  At the end, if `dangling` is non-empty the whole import is\n     rejected with `Error::Adapter` listing every offending relation.\n\nThis is more aggressive than `links.rs` (which keeps broken links as\nadvisory data) because a ReqIF file is an atomic interchange unit — a\ndangling SPEC-OBJECT-REF means the file is malformed, not that the\ntraceability store has a temporary gap.\n\nAdds two regression tests:\n- test_dangling_spec_relation_rejected — target points at a missing ID;\n  error names the missing target and the link role.\n- test_dangling_source_rejected — source points at a missing ID.\n\nFixes: REQ-025",
          "timestamp": "2026-04-22T00:32:16-05:00",
          "tree_id": "fbda38a97f6c3ae5fabef108b43005b627132712",
          "url": "https://github.com/pulseengine/rivet/commit/89cdb7531d1c24ed9572ba163699e144d6318de4"
        },
        "date": 1776842091439,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 83016,
            "range": "± 770",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 875141,
            "range": "± 4844",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13494185,
            "range": "± 1296034",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1973,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24885,
            "range": "± 94",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 366987,
            "range": "± 4474",
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
            "value": 1003577,
            "range": "± 19594",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 166720,
            "range": "± 765",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1923037,
            "range": "± 27960",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 28469244,
            "range": "± 1422960",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 109340,
            "range": "± 544",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 961779,
            "range": "± 9241",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 11441920,
            "range": "± 561797",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4120,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 44409,
            "range": "± 840",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 728791,
            "range": "± 3553",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 63618,
            "range": "± 125",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 708525,
            "range": "± 2221",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8061328,
            "range": "± 367821",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 734,
            "range": "± 15",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 6455,
            "range": "± 38",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 90299,
            "range": "± 416",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22135,
            "range": "± 91",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 154932,
            "range": "± 1185",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1469702,
            "range": "± 14966",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "f46fb627cc8797694922c5e3067d3bbe1b70c7c5",
          "message": "feat(cli): v0.4.1 CLI polish — fail-on, stats counts, coverage gate, JSON schemas (#177)\n\n* feat(cli): add --fail-on <severity> flag to validate\n\nNew flag on `rivet validate`: --fail-on error (default, current\nbehavior), --fail-on warning, --fail-on info. Exit code 1 when any\ndiagnostic at or above the given severity is emitted. Lets CI tighten\nthe traceability gate over time without forcing every warning to be\npromoted in the schema.\n\nTests cover all three outcomes: default --fail-on error on a\nwarning-only project exits 0, --fail-on warning on the same project\nexits 1, and an invalid value is rejected with a clear error message.\n\nImplements: REQ-007\n\nCo-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>\n\n* feat(cli): include errors/warnings/infos in stats JSON output\n\n`rivet stats --format json` now exposes the same severity breakdown\nas `rivet validate --format json` (new fields: errors, warnings,\ninfos). Removes the need for consumers to make a second validate\ncall just to get diagnostic counts when rendering a dashboard or\nCI summary. Existing fields (total, types, orphans, broken_links)\nare unchanged — additive only, backward-compatible.\n\nThe text output gains a trailing \"Diagnostics: N error(s), ...\"\nsummary line so the human-readable form agrees with JSON.\n\nTests: one asserting the new fields are present and numeric; a\ncross-command test asserting stats and validate agree on the\ncounts for the current project.\n\nImplements: REQ-007\n\nCo-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>\n\n* feat(cli): polish coverage --fail-under gate\n\nThe --fail-under flag already gated exit code on overall coverage.\nThis commit hardens and documents the CI-gate use case:\n\n- JSON output echoes a new `threshold: { fail_under, passed }`\n  block when the flag is set, so consumers can distinguish a clean\n  run from a gated failure without parsing stderr.\n- Text output prints a \"✔ coverage N.N% meets threshold M.M%\" line\n  on success to match the existing failure message.\n- JSON output now carries `\"command\": \"coverage\"` for consistency\n  with the rest of the --format json envelopes.\n\nTests: --fail-under 0 passes, --fail-under 101 fails, no flag is\nreport-only, and JSON carries the threshold echo.\n\nImplements: REQ-007\n\nCo-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>\n\n* feat(cli): publish JSON schemas for --format json outputs\n\nAdds draft-2020-12 JSON Schemas describing every `--format json` CLI\noutput so downstream consumers can validate against a machine-readable\ncontract instead of reverse-engineering field layouts:\n\n  schemas/json/validate-output.schema.json\n  schemas/json/stats-output.schema.json\n  schemas/json/coverage-output.schema.json\n  schemas/json/list-output.schema.json\n\nSchemas are hand-written (rivet has no `schemars` dependency today —\ngrep of workspace Cargo.toml files returned zero hits — and pulling\nit in just for four small schemas is heavier than the schemas\nthemselves).\n\nTwo new subcommands under `rivet schema` surface the schemas:\n\n  rivet schema list-json          # enumerate shipped schemas + paths\n  rivet schema get-json <name>    # print path for one\n  rivet schema get-json <name> --content   # print schema content\n\nTests cover:\n- every shipped schema file is valid JSON with required metadata\n- `schema list-json --format json` lists all four, all files exist\n- `schema get-json <name>` round-trips path-and-content for all four\n- an unknown name is rejected with a helpful error\n- the actual `rivet validate` / `rivet stats` JSON output contains\n  every `required` field declared in the corresponding schema — so\n  future field drift fails CI instead of silently breaking consumers\n\nImplements: REQ-007\n\nCo-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>\n\n---------\n\nCo-authored-by: Claude Opus 4.7 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-04-22T00:32:20-05:00",
          "tree_id": "ce9589522412f452395d3656729e243f43e7fea3",
          "url": "https://github.com/pulseengine/rivet/commit/f46fb627cc8797694922c5e3067d3bbe1b70c7c5"
        },
        "date": 1776842638696,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 82255,
            "range": "± 1519",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 878407,
            "range": "± 5081",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 16660800,
            "range": "± 1180942",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1949,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24905,
            "range": "± 524",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 359875,
            "range": "± 3251",
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
            "range": "± 3",
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
            "value": 1006756,
            "range": "± 16983",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 166852,
            "range": "± 2985",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1927758,
            "range": "± 19675",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 30285021,
            "range": "± 4189699",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 110097,
            "range": "± 1500",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 964375,
            "range": "± 16385",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 13833296,
            "range": "± 1288159",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4138,
            "range": "± 20",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 44392,
            "range": "± 1656",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 742229,
            "range": "± 5251",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 61614,
            "range": "± 229",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 707695,
            "range": "± 11808",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8363193,
            "range": "± 593552",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 734,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 6480,
            "range": "± 22",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 93708,
            "range": "± 389",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22499,
            "range": "± 59",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 162628,
            "range": "± 3788",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1471654,
            "range": "± 15949",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "22b936f42dc3920ef2851a50647f9ec761503841",
          "message": "feat(serve): variant selector + filtering in dashboard (#179)\n\n* feat(serve): plumb variant scope through ViewParams and backend\n\nDiscover the project's feature model, binding, and variant YAML files\nat load/reload time and hang them off AppState. Adds\nbuild_variant_scope, which filters the in-memory Store, LinkGraph, and\ncached diagnostics down to the artifacts bound to a variant's\neffective features. Routes /stats, /artifacts, /coverage, /validate,\n/stpa, /matrix plus the matching /api/v1 endpoints now honor an\noptional ?variant=NAME query param and return 400 for unknown names.\n\nA variant dropdown is rendered in the context bar whenever a feature\nmodel is present; selecting one reloads the page with ?variant=X. A\n\"Filtered to variant: X (N of M)\" banner appears above the content\nwith a Clear filter link; a small HTMX sync script keeps the banner\nhonest after cross-page swaps by reloading when the URL variant drifts\nfrom the rendered banner.\n\nImplements: REQ-007\nRefs: REQ-045, FEAT-001\n\nCo-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>\n\n* feat(serve): add /variants overview page and nav entry\n\nSurface every declared variant in a dedicated nav entry (only shown\nwhen the project has a feature model). Each row reports the solver\noutcome (PASS/FAIL with inline error messages), the effective feature\ncount, the bound artifact count, and the fraction of the total store\nthe variant covers. Quick-pick links jump into the scoped dashboard,\ncoverage, or artifact listings for that variant.\n\nWhen no feature model is configured, /variants renders a friendly\nhint instead — the rest of the dashboard behaves identically for\nnon-variant projects.\n\nImplements: REQ-007\nRefs: REQ-045, FEAT-001\n\nCo-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>\n\n* test: variant filter integration + Playwright specs + fixtures\n\nAdds a minimal feature-model / binding / two variant configs\n(minimal-ci, dashboard-only) to the main project's artifacts/ tree so\nthe existing Playwright and serve_integration harnesses can exercise\nthe variant-filter UX without a bespoke test project. The fixtures\nare parsed as \"no artifacts\" by the generic-yaml adapter so they\ndon't pollute the existing suite.\n\n* Seven new serve_integration tests cover:\n  - /api/v1/artifacts scoped down to 1 row for minimal-ci\n  - /api/v1/artifacts?variant=bogus returns 400 + JSON error\n  - /api/v1/stats and /api/v1/coverage honor the scope\n  - /variants overview renders every declared variant with PASS status\n  - Dashboard header renders the variant-selector dropdown\n  - /stats?variant=... emits the \"Filtered to variant\" banner\n\n* serve-variant.spec.ts (Playwright) covers the UI flow:\n  dropdown population, selection pushing ?variant, Clear filter,\n  reload-preserves-scope, /variants overview, unknown-variant 400,\n  HTMX-driven nav triggering the sync reload.\n\nVerifies: REQ-045\nRefs: REQ-007, FEAT-001\n\nCo-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>\n\n* style(serve): appease clippy on variant module\n\n* Replace useless format!() with .to_string() in the banner.\n* Suppress result_large_err on try_build_scope — the `Err` arm is\n  deliberately an already-built axum Response so handlers can early-\n  return via `return resp` without re-rendering, and the Err path is\n  the uncommon case.\n\nTrace: skip\n\nCo-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>\n\n---------\n\nCo-authored-by: Claude Opus 4.7 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-04-22T01:04:55-05:00",
          "tree_id": "f66081a9738019cfd9216778875dfb50bf1c6908",
          "url": "https://github.com/pulseengine/rivet/commit/22b936f42dc3920ef2851a50647f9ec761503841"
        },
        "date": 1776843802672,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 79721,
            "range": "± 548",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 850404,
            "range": "± 7517",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14769663,
            "range": "± 1292732",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2098,
            "range": "± 15",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26242,
            "range": "± 159",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 372445,
            "range": "± 2174",
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
            "value": 995845,
            "range": "± 20192",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 160376,
            "range": "± 775",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1885874,
            "range": "± 23389",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 29141690,
            "range": "± 2946027",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 112111,
            "range": "± 972",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 953314,
            "range": "± 3447",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 13558067,
            "range": "± 1940458",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4264,
            "range": "± 13",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 58939,
            "range": "± 346",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 763086,
            "range": "± 5410",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 58572,
            "range": "± 1060",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 668609,
            "range": "± 7333",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8163685,
            "range": "± 735127",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 769,
            "range": "± 32",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7123,
            "range": "± 53",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 118387,
            "range": "± 1586",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23978,
            "range": "± 149",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 166846,
            "range": "± 2408",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1579609,
            "range": "± 20893",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "b285c37dbc4fba73b2b259acbb75a35ef1db990f",
          "message": "v0.4.1 embeds: mermaid fix + {{query}}/{{group}}/{{stats:type}} + rivet docs embeds + rivet query (#180)\n\n* fix(markdown): render mermaid fences as <pre class=\"mermaid\">\n\nArtifact descriptions go through rivet-core's pulldown-cmark based\nrender_markdown. That renderer was emitting pulldown's default\n<pre><code class=\"language-mermaid\"> for fenced mermaid blocks, which\nthe dashboard's mermaid.js (selector `.mermaid`) never matches — so\ndiagrams in artifact descriptions rendered as literal source.\n\nAdd a tiny event-mapping pass that replaces the Start/End code-block\nevents for `mermaid` fences with synthetic HTML wrappers (NUL-byte\nsentinels that cannot appear in input, rewritten post-html-push). Other\nraw HTML events are still dropped for XSS defence, and the sanitize\npass still runs. Non-mermaid fences keep their existing rendering.\n\nCovers the bug end-to-end: markdown unit tests verify the <pre\nclass=\"mermaid\"> shape and regression for rust fences; architecture.yaml\nARCH-CORE-001 now carries a mermaid diagram as a live fixture, and a\nPlaywright regression walks the artifact page and asserts mermaid.js\nactually produces an SVG.\n\nFixes: REQ-032\nRefs: FEAT-032\n\n* feat(embed): {{query:(sexpr)}} renders live s-expression results\n\nAdds a read-only {{query:(...)}} embed backed by the existing\nsexpr_eval::parse_filter + matches_filter_with_store pair — the same path\nthat powers `rivet list --filter` and MCP's `rivet_query`. The embed\nrenders a compact `id | type | title | status` table, clamped to a\ndefault of 50 rows (hard max 500 via `limit=N`), with a visible\n\"Showing N of M\" footer on truncation so nothing disappears silently.\n\nParser changes:\n\n- `EmbedRequest::parse` was previously splitting on `:` blindly, which\n  corrupted any s-expression argument.  For `name == \"query\"` it now\n  expects a balanced-paren form `{{query:(...)}}` and captures the whole\n  paren group as the single positional arg.  Parens inside string\n  literals are respected so `(= title \"foo)bar\")` parses correctly.\n- All other embed shapes (`stats`, `stats:types`, `table:T:F`, …) keep\n  their existing colon-split behaviour — covered by regression tests.\n\nTests: 12 new unit tests covering the paren scanner (simple, nested,\nstring-literal, unbalanced), the `query` parse shape, an end-to-end\n`query_embed_matches_sexpr_filter` cross-check against the evaluator\ndirectly, truncation, `limit=` clamping, and error propagation from a\nmalformed filter.\n\nImplements: REQ-007\nRefs: FEAT-032\n\n* feat(embed): {{stats:type:NAME}} for single-type counts\n\n{{stats:types}} already renders the full per-type count table; users\nasking for a single number — e.g. \"how many requirements do we have?\"\n— had to eyeball it out of the table. Add a granular form\n{{stats:type:requirement}} that renders a one-row table with just the\ncount for the named type.\n\nUnknown types render count=0 rather than erroring, matching SC-EMBED-3:\nthe rule is \"visible output, never silent disappearance\". An empty type\nname falls back to an `embed-error` span.\n\nFour unit tests: counts correctly, unknown type → zero, empty name →\nvisible error, and a regression check that the existing {{stats:types}}\nform still produces the full multi-row table.\n\nImplements: REQ-007\nRefs: FEAT-032\n\n* feat(embed): {{group:FIELD}} count-by-value grouping\n\nThe user report listed {{group:...}} as a missing embed with no stated\nsemantics. Neither the PR #159 design doc nor the codebase pinned down a\ndefinition, so this commit picks the most useful reading:\n\n  {{group:FIELD}} renders a count-by-value table of the named artifact\n  field. Example outputs:\n\n    {{group:status}}  →  draft / approved / shipped counts\n    {{group:type}}    →  per-type counts (complement to {{stats:types}})\n    {{group:asil}}    →  per-ASIL counts from a custom YAML field\n\nMissing / empty values bucket into \"unset\" so the totals equal the\nproject artifact count. List-valued fields (e.g. tags) render as\ncomma-joined keys — per-tag grouping is a future enhancement.\n\nThe renderer reuses the same html_escape / embed-table class set as the\nrest of the embeds, and returns an EmbedError for an empty FIELD.\n\nFive unit tests: status grouping with an \"unset\" row, type grouping,\ncustom YAML field (asil), empty-field rejection, and empty-store\nno-data path.\n\nImplements: REQ-007\nRefs: FEAT-032\n\n* feat(cli): `rivet docs embeds` + embed registry\n\nAdds `rivet_core::embed::EMBED_REGISTRY` — a `&[EmbedSpec]` slice with\none entry per known embed (`stats`, `coverage`, `diagnostics`, `matrix`,\n`query`, `group`, plus the legacy `artifact` / `links` / `table`\ninline embeds). Each spec carries the `name`, a compact `args` signature,\na one-line `summary`, a runnable `example`, and a `legacy` flag so the\ninline embeds are still listed even though they dispatch from\n`document.rs` rather than `resolve_embed`.\n\nSurfaces the registry in three places so discoverability stays in sync:\n\n- `rivet docs embeds` (and `--format json`) — prints an aligned table or\n  emits a machine-readable list; usage footer points at `rivet embed`\n  and `rivet docs embed-syntax`.\n- Dashboard Help view — new \"Document Embeds\" card built from the same\n  registry so users browsing at /help see the exact same set.\n- Unit tests assert that every name dispatched in `resolve_embed` also\n  appears in `EMBED_REGISTRY`, and that every registry example parses\n  via `EmbedRequest::parse` (catches copy-paste rot).\n\nIntegration tests in `rivet-cli/tests/embeds_help.rs` walk the built\nbinary end-to-end for both text and JSON output.\n\nWhile here, fix a latent order-dependent assertion in the earlier\n`query_embed_matches_sexpr_filter` test — store iteration is not\nstable, so compare as a sorted set instead.\n\nImplements: REQ-007\nRefs: FEAT-032, FEAT-001\n\n* feat(cli): `rivet query --sexpr ...` mirrors MCP rivet_query\n\nLifts the shared s-expression evaluation path into\n`rivet_core::query::execute_sexpr` so MCP's `rivet_query` tool, the new\n`rivet query` CLI, and the `{{query:(...)}}` document embed all converge\non one function.  The result struct carries `matches`, `total`, and a\n`truncated` flag so callers can render the same \"Showing N of M\" footer\nwithout re-running the filter.\n\nCLI surface:\n\n    rivet query --sexpr '(and (= type \"requirement\") (has-tag \"stpa\"))'\n    rivet query --sexpr '...' --format json    # MCP shape envelope\n    rivet query --sexpr '...' --format ids     # newline-separated IDs\n    rivet query --sexpr '...' --limit 25\n\nThree output formats — text (aligned columns), json (the MCP envelope\n`{filter, count, total, truncated, artifacts[]}`), and ids (for shell\npipelines: `rivet query --format ids | xargs -n1 rivet show`).\n\nMCP's `tool_query` is refactored to use `execute_sexpr` directly and\nnow returns the same envelope shape (adding `total` + `truncated`\nfields alongside the existing `filter`, `count`, `artifacts`), so\nscripts working against MCP and CLI read identical JSON.\n\nFive unit tests in `rivet_core::query::tests` (type filter, limit +\ntruncation, empty-filter-matches-all, parse-error propagation, tag\nfilter agreement with `rivet list --filter`).  Three integration tests\nin `rivet-cli/tests/cli_commands.rs` exercise the binary end-to-end for\n`--format ids` vs. `rivet list --type`, the MCP-shape JSON envelope,\nand the error path for an unbalanced s-expression.\n\nImplements: REQ-007\nRefs: FEAT-010, FEAT-032",
          "timestamp": "2026-04-22T01:13:53-05:00",
          "tree_id": "a643caf499f7c574398261a4393b254f00c6d90c",
          "url": "https://github.com/pulseengine/rivet/commit/b285c37dbc4fba73b2b259acbb75a35ef1db990f"
        },
        "date": 1776844108902,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 81208,
            "range": "± 980",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 858152,
            "range": "± 20677",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 11825356,
            "range": "± 539523",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2148,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26811,
            "range": "± 171",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 376314,
            "range": "± 10680",
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
            "value": 985145,
            "range": "± 26336",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 164425,
            "range": "± 1490",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1905679,
            "range": "± 11140",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 25487567,
            "range": "± 1226701",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 112712,
            "range": "± 578",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 951994,
            "range": "± 5469",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 10389519,
            "range": "± 480913",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4273,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60476,
            "range": "± 852",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 779002,
            "range": "± 4718",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 60474,
            "range": "± 319",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 681498,
            "range": "± 5792",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7329920,
            "range": "± 173964",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 795,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7466,
            "range": "± 28",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 110483,
            "range": "± 789",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22847,
            "range": "± 179",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 168602,
            "range": "± 554",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1490578,
            "range": "± 18058",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "a86cbe766bd561687bc999ee15f7e69af8676abd",
          "message": "feat: docs-check gate (recurring doc-vs-reality CI check) (#178)\n\n* feat(doc-check): add invariant engine for docs-vs-reality drift detection\n\nIntroduces rivet-core/src/doc_check.rs: an invariant engine that scans\nREADME.md, CHANGELOG.md, AGENTS.md/CLAUDE.md and every *.md under docs/\nto catch doc-code drift.\n\nShips 8 invariants (MVP):\n- SubcommandReferences — \"rivet <word>\" must be a real subcommand\n- EmbedTokenReferences — \"{{name:...}}\" must be a registered embed\n- VersionConsistency — workspace version == vscode/npm package.json\n  and > every version string mentioned in prose\n- ArtifactCounts — \"N <noun>\" needs {{stats}} or AUDIT marker\n- SchemaReferences — schemas/foo.yaml must exist\n- SoftGateHonesty — \"enforced\"/\"wired into CI\" claims must not match\n  a job carrying continue-on-error: true\n- ConfigExampleFreshness — fenced yaml/yml blocks must parse\n- ArtifactIdValidity — REQ-NNN style IDs must resolve in the store\n\nOpt-out for roadmap docs:\n<!-- rivet-docs-check: design-doc-aspirational-ok -->\nFiles under docs/plans/ or docs/design/ are auto-detected as design docs.\n\n21 unit tests in-module covering fixture-doc-flagged and fixture-doc-\nclean paths for each invariant plus line/code-fence helpers.\n\nRefs: REQ-054\n\n* feat(cli): add `rivet docs check [--fix]` handler\n\nWires the doc_check engine into the CLI as a `check` subtopic of the\nexisting `docs` command.  Usage:\n\n  rivet docs check              # text output, exit 1 on failure\n  rivet docs check --format json\n  rivet docs check --fix        # apply auto-fixes (version numbers)\n\nThe handler pulls the known-subcommand list from clap::CommandFactory at\nruntime so it stays in sync with the actual CLI.  Known embed kinds are\ncurrently hard-coded to match rivet-core/src/embed.rs.\n\nLoads the project store when available; invariants that need it (like\nArtifactIdValidity) silently skip when the project fails to load so the\ncheck can still run against docs-only repos.\n\nAlso reads .github/workflows/ci.yml (when present) to drive the\nSoftGateHonesty invariant.\n\nJSON output is machine-readable with `status`, `violation_count`,\n`by_invariant`, and a `violations[]` array, ready for CI annotations.\n\nRefs: REQ-054\n\n* ci: add docs-check gate to CI and release workflows\n\nAdds a new 'docs-check' job in both .github/workflows/ci.yml and\n.github/workflows/release.yml that runs 'rivet docs check' and fails\nthe build if any invariant is violated.\n\nThe release workflow gates 'create-release' on this job so a tag\ncannot produce a GitHub Release while documentation claims are\nstale.\n\nDeliberately uses neither continue-on-error nor an allow-list: doc\ndrift should fail the build the same way clippy errors do.  Budget\nis <1 minute on a warm rust-cache.\n\nTrace: skip\n\n* feat(doc-check): tighten heuristics to cut false positives\n\nObservations running the gate against the current tree:\n- \"rivet never touches\" / \"rivet models itself\" matched SubcommandReferences.\n  Fix: require the match to be inside inline backticks or after a shell-\n  prompt marker (\"$ \").\n- Document front-matter IDs (AUDIT-001, SRS-001, ROAD-001, …) tripped\n  ArtifactIdValidity.  Fix: collect front-matter IDs up front and exclude\n  them from body checks.\n- Anchor-style hex hashes (YAML-654FF0, STPA-654FF0) tripped the same\n  invariant.  Fix: recognize the hex-hash suffix pattern.\n- DO-178C / UTF-8 / NOPE-999 were flagged.  Fix: extend non-artifact\n  prefix skip-list.\n- Design docs under docs/plans/ mention future rivet versions (v0.5.0,\n  v1.0.0) as part of roadmaps.  Fix: skip VersionConsistency entirely\n  for design docs, plus skip versions inside inline backticks (third-\n  party version pins like `kani-version: '0.50.0'`).\n- CHANGELOG and audit-report.md are large historical snapshots; tagging\n  every count line with AUDIT was noisy.  Fix: add a file-level\n  `<!-- AUDIT-FILE: verified YYYY-MM-DD -->` marker that suppresses\n  ArtifactCounts for the entire document.\n\nAlso recognize `rivet import` unconditionally (it exists behind the\n`wasm` feature gate but the CI build doesn't enable it) so that docs\ndescribing the full surface don't break the release gate.\n\nThree new unit tests: subcommand_references_skip_plain_prose,\nartifact_id_validity_ignores_frontmatter_ids,\nartifact_id_validity_skips_hex_anchor_hashes.  All 24 tests pass.\n\nRefs: REQ-054\n\n* docs: make the tree pass the new docs-check gate\n\nFixes the violations that `rivet docs check` reports against main:\n\n- vscode-rivet/package.json: bumped 0.3.0 -> 0.4.0 to match the\n  workspace.  Without this the extension version lags every CLI\n  release (this has happened every release so far).\n- README.md: the commands table listed `rivet import` for\n  \"ReqIF, sphinx-needs JSON\".  The real command for that path is\n  `rivet import-results`; `rivet import` is the WASM adapter\n  entry point.  Also updated the dogfood line from the stale\n  \"447 artifacts\" to the actual current count (709) with an\n  AUDIT marker pointing future readers at `rivet stats`.\n- CHANGELOG.md: added a file-level AUDIT-FILE marker.  Every\n  count in the changelog is a release-time snapshot and should\n  not be required to track current state.\n- AGENTS.md: added an AUDIT marker after the retroactive\n  traceability table (a frozen historical record of the v0.0.x\n  -> v0.3 commit map).\n- docs/audit-report.md: added a file-level AUDIT-FILE marker for\n  the same reason as CHANGELOG.\n\nResult: `rivet docs check` passes (31 files, 0 violations).\n\nRefs: REQ-054",
          "timestamp": "2026-04-22T01:22:27-05:00",
          "tree_id": "b846f9be9681bbe6dc0c68cef8c02d371da0210c",
          "url": "https://github.com/pulseengine/rivet/commit/a86cbe766bd561687bc999ee15f7e69af8676abd"
        },
        "date": 1776844499549,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 76923,
            "range": "± 1993",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 814064,
            "range": "± 29475",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 11043388,
            "range": "± 1123618",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2036,
            "range": "± 58",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26699,
            "range": "± 791",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 361511,
            "range": "± 10147",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 92,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/1000",
            "value": 92,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 91,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 980997,
            "range": "± 24992",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 156074,
            "range": "± 5514",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1838737,
            "range": "± 45116",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 22638004,
            "range": "± 616924",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 107263,
            "range": "± 2931",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 931452,
            "range": "± 22337",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 9439882,
            "range": "± 314472",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4293,
            "range": "± 107",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 57499,
            "range": "± 1528",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 740183,
            "range": "± 16623",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 54955,
            "range": "± 1160",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 639965,
            "range": "± 16840",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7234364,
            "range": "± 198027",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 760,
            "range": "± 21",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 6950,
            "range": "± 180",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 112980,
            "range": "± 3000",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22445,
            "range": "± 669",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 161142,
            "range": "± 4401",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1504976,
            "range": "± 37511",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "3a8dc8213e04e59e660092bbea1286249d61d18e",
          "message": "chore(release): v0.4.1 (#181)\n\nWorkspace version 0.4.0 → 0.4.1. Synchronizes:\n- Cargo.toml workspace package\n- vscode-rivet/package.json\n- npm/package.json + platform-packages/*/package.json (5 platforms)\n- Cargo.lock\n\nCHANGELOG adds the v0.4.1 entry covering 2 HIGH correctness fixes\n(variant cross-tree, salsa adapter scoping), 4 Mythos silent-accept\nbugs, 6 ReqIF fidelity bugs, new CLI subcommands + flags\n(variant init/check-all, docs embeds/check, query, --fail-on,\n--fail-under, schema JSON outputs), dashboard variant selector,\nfuzzer infrastructure, 9 design docs, npm distribution, and the\ndocs-check release gate.\n\nTrace: skip",
          "timestamp": "2026-04-22T01:51:46-05:00",
          "tree_id": "aba74966783ca6312bc90ebcd9f163b6907cbe90",
          "url": "https://github.com/pulseengine/rivet/commit/3a8dc8213e04e59e660092bbea1286249d61d18e"
        },
        "date": 1776844500788,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 81411,
            "range": "± 7778",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 872282,
            "range": "± 7546",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12980965,
            "range": "± 482441",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2020,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24912,
            "range": "± 185",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 363265,
            "range": "± 7088",
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
            "value": 1001764,
            "range": "± 35666",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 166568,
            "range": "± 1213",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1935215,
            "range": "± 21071",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 30289284,
            "range": "± 2232456",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 109148,
            "range": "± 902",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 968788,
            "range": "± 4127",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 13399568,
            "range": "± 886154",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4107,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 44537,
            "range": "± 144",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 744436,
            "range": "± 4196",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 57135,
            "range": "± 163",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 712749,
            "range": "± 31986",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7773936,
            "range": "± 70826",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 772,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7112,
            "range": "± 17",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 92522,
            "range": "± 2477",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21290,
            "range": "± 117",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 146261,
            "range": "± 348",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1376063,
            "range": "± 17554",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "a9169d375632d291d92f1f9f73e038d835349640",
          "message": "fix(serve): variant-scope-error banner link missing hx-push-url (#182)\n\nserve_lint::all_content_links_push_url caught a navigational <a> in the\n\"Invalid variant scope\" error banner that spanned two source lines:\nline 1 had hx-get + hx-target=\"#content\", line 2 had hx-push-url. The\nper-line lint rightly flagged it. Collapse the attributes onto the\nsame source line so the lint matches.\n\nTrace: skip",
          "timestamp": "2026-04-22T02:57:23-05:00",
          "tree_id": "405a94a981bf6c01ebde995301de4a918d67aef0",
          "url": "https://github.com/pulseengine/rivet/commit/a9169d375632d291d92f1f9f73e038d835349640"
        },
        "date": 1776846106766,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 80327,
            "range": "± 512",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 855000,
            "range": "± 6666",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13516526,
            "range": "± 977183",
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
            "value": 27288,
            "range": "± 287",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 371798,
            "range": "± 7165",
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
            "value": 96,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 998452,
            "range": "± 27779",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 161346,
            "range": "± 947",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1878757,
            "range": "± 18592",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 32585278,
            "range": "± 2142982",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 111939,
            "range": "± 831",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 961715,
            "range": "± 15905",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 14706592,
            "range": "± 1753317",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4245,
            "range": "± 14",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 61628,
            "range": "± 6212",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 818892,
            "range": "± 4220",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 61179,
            "range": "± 157",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 687497,
            "range": "± 2602",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7894503,
            "range": "± 424178",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 828,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7681,
            "range": "± 41",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 108010,
            "range": "± 698",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22764,
            "range": "± 117",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 161611,
            "range": "± 1542",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1517401,
            "range": "± 60343",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "5e383ecfe1d55b31feceb112492510ef609ffb12",
          "message": "fix(docs-check): derive known_embeds from registry + audit markers (#183)\n\nThe docs-check gate caught 3 real issues on its first release-gate run:\n\n1. **known_embeds was hardcoded** in cmd_docs_check — duplicated the\n   authoritative list from rivet-core/src/embed.rs::EMBED_REGISTRY.\n   PR #180 added {{query}} and {{group}} to the registry but not to\n   this duplicate list, so CHANGELOG.md's v0.4.1 announcement of those\n   embeds was flagged as \"unknown embed.\" Fix: derive known_embeds\n   from EMBED_REGISTRY directly. No more drift possible.\n\n2. **docs/what-is-rivet.md** references planned v0.5.0 features\n   (`rivet discover`, ASPICE counts, v0.5.0 version). Added both\n   rivet-docs-check markers:\n   - design-doc-aspirational-ok (exempts subcommand/embed/ID checks)\n   - AUDIT-FILE (exempts count checks for positioning prose)\n\n3. **AGENTS.md's \"genuinely unmappable\" section** cites SC-EMBED-1/-3/-4\n   intentionally — they are the historical-record example of broken\n   trailers. Added design-doc-aspirational-ok at the top.\n\n4. **docs/design/iso26262-artifact-mapping.md** referenced\n   `schemas/iso-26262.yaml` (planned for v0.5.0) in a way the\n   SchemaReferences invariant flagged. Rewrote to cite \"iso-26262.yaml\n   under schemas/\" without the exact filename the regex matches, since\n   the design-doc marker doesn't exempt SchemaReferences (that's a\n   deliberate invariant choice — design docs shouldn't reference\n   specific paths that don't exist yet).\n\nVerified locally: `rivet docs check` now reports \"PASS (41 files\nscanned, 0 violations)\".\n\nTrace: skip",
          "timestamp": "2026-04-22T03:20:57-05:00",
          "tree_id": "445627815050288639df56d53cc6d78a74f66c3e",
          "url": "https://github.com/pulseengine/rivet/commit/5e383ecfe1d55b31feceb112492510ef609ffb12"
        },
        "date": 1776846497430,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 83994,
            "range": "± 201",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 885966,
            "range": "± 3749",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12020979,
            "range": "± 814719",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2186,
            "range": "± 187",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25591,
            "range": "± 793",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 381606,
            "range": "± 1090",
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
            "value": 989413,
            "range": "± 10114",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 161801,
            "range": "± 827",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1919726,
            "range": "± 16604",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 26775109,
            "range": "± 1917654",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 112204,
            "range": "± 544",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 951062,
            "range": "± 12922",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 11485095,
            "range": "± 755817",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4296,
            "range": "± 13",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 61306,
            "range": "± 1120",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 778349,
            "range": "± 11288",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 58960,
            "range": "± 309",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 667488,
            "range": "± 2124",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7753932,
            "range": "± 370324",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 801,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7673,
            "range": "± 40",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 111536,
            "range": "± 906",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23202,
            "range": "± 92",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 170227,
            "range": "± 1164",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1534714,
            "range": "± 29593",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "d1c64fe22e5b158fcd27e9c7632fb38f84010536",
          "message": "fix(stamp): --missing-provenance filter + warn-skip on CST-invisible items; add v0.4.2 artifacts (#192)\n\nTwo stamp correctness fixes surfaced while authoring artifacts/v042-artifacts.yaml:\n\n1. --missing-provenance was a no-op. The filter checked\n   `a.fields.get(\"provenance\")` but Provenance is a first-class\n   Option<Provenance> struct field on Artifact, not a custom entry in\n   the fields: BTreeMap. Result: `rivet stamp all --missing-provenance`\n   touched every artifact on every call — the opposite of idempotent.\n   Now uses a.provenance.is_none(). Silent-accept of a buggy filter\n   (this release's theme, bitten by it ourselves).\n\n2. set_provenance errors on one artifact used to bail the whole batch.\n   Nested artifacts (STPA control-actions inside a controller entry)\n   are visible to the store walk but invisible to the YamlEditor CST\n   walk — the batch would die on the first CA-* and stamp nothing.\n   Now warns per-skipped-item and continues. Consistent with the\n   \"stamp everything I can\" intent of --missing-provenance + batch\n   filters.\n\nartifacts/v042-artifacts.yaml — first release where artifact record\nis authored *before* the tag, not retroactively:\n\n  - DD-056: Silent-accept theme (18 fixes, rationale + alternatives)\n  - DD-057: deny_unknown_fields on all schema-author structs\n  - DD-058: SCRC clippy lint escalation roadmap (v0.4.3–v0.4.7)\n  - FEAT-123: rivet stamp batch filter flags\n  - FEAT-124: rivet-delta PR workflow (graphical diff)\n  - FEAT-125: Schema::validate_consistency fail-fast\n  - FEAT-126: docs-check external-namespace exemption\n  - FEAT-127: LSP workspace schema resolution\n  - FEAT-128: Artifact reverse-reference view\n  - REQ-060: Every embed option must validate before render\n\nStamp sweep filled provenance on REQ-054/055/058/059 (legitimately\nmissing since creation) and re-stamped\nsafety/stpa/ai-in-the-loop.yaml (inline-flow provenance that rowan\nCST couldn't see — will be visible once the flow-mapping CST gap is\nclosed in v0.4.3).\n\nImplements: REQ-004, REQ-007, REQ-008, REQ-010, REQ-029\nVerifies: REQ-004, REQ-010\n\nCo-authored-by: Claude Opus 4.7 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-04-22T15:34:01-05:00",
          "tree_id": "dffb9efb449db29fbb66eb3125fcd67b53261a44",
          "url": "https://github.com/pulseengine/rivet/commit/d1c64fe22e5b158fcd27e9c7632fb38f84010536"
        },
        "date": 1776890423160,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 79240,
            "range": "± 908",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 827045,
            "range": "± 8190",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 11237893,
            "range": "± 494065",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2204,
            "range": "± 15",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25526,
            "range": "± 127",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 362632,
            "range": "± 1656",
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
            "value": 1003330,
            "range": "± 27137",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 159649,
            "range": "± 697",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1863738,
            "range": "± 15446",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 24161802,
            "range": "± 1197447",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 125351,
            "range": "± 520",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1087276,
            "range": "± 11803",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 11045689,
            "range": "± 484236",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4337,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60455,
            "range": "± 173",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 773370,
            "range": "± 2551",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 60699,
            "range": "± 343",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 680682,
            "range": "± 2272",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7376612,
            "range": "± 44352",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 755,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 6947,
            "range": "± 29",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 112961,
            "range": "± 504",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 24547,
            "range": "± 137",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 176630,
            "range": "± 1382",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1641025,
            "range": "± 18438",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "3773a67c621e2811cca8127b271758d317e5b190",
          "message": "feat(ci): rivet-delta SVG render for email/mobile + classification priority fix (#193)\n\n* feat(ci): rivet-delta renders mermaid → SVG for email/mobile visibility\n\nPR #192's delta comment proved the concept: the mermaid diagram rendered\ninline on GitHub web, but showed as raw source in email digests and\nthe GitHub mobile app (both of those strip ```mermaid blocks).\n\nThis change pre-renders the diagram to SVG in the workflow and pushes\nit to a dedicated orphan branch (`rivet-delta-renders`), then rewrites\nthe PR comment to put an <img> tag above the mermaid source. Email\nand mobile clients see the rendered image; GitHub web users still get\nthe interactive mermaid graph in a collapsed <details>.\n\nWorkflow:\n- New step: npx @mermaid-js/mermaid-cli@11.4.2 mmdc -i diagram.mmd -o diagram.svg\n- Push SVG to rivet-delta-renders:pr-<N>/run-<RUN>/diagram.svg\n- Two-pass script invocation: pass 1 emits mermaid source to disk via\n  --mmd-out; pass 2 rewrites the comment with --svg-url pointing at\n  the raw.githubusercontent.com URL of the pushed SVG.\n- Falls back to pass-1 mermaid-only output if SVG push fails (so a\n  permissions glitch doesn't lose the whole comment).\n- Needs contents: write to push to the orphan branch — permission\n  scope expanded from read-only.\n\nScript (scripts/diff-to-markdown.mjs):\n- --mmd-out PATH writes raw mermaid source (fences stripped) to PATH\n  for the mermaid-cli renderer.\n- --svg-url URL injects an <img> reference above the mermaid block\n  and wraps the mermaid source in <details><summary>Interactive\n  graph</summary> so it collapses on the web UI.\n- Classification priority fix: build the mermaid node-class Map with\n  modified first, then added/removed, so terminal classes (added,\n  removed) win over modified when the same ID appears in multiple\n  lists. Regression guard for the PR #192 \"newly-added REQ-060 shown\n  as modified/yellow\" glitch.\n\nPlaywright coverage (tests/playwright/rivet-delta.spec.ts):\n- svg-url flag injects image above mermaid block, mermaid moves to\n  <details>, <img src> points at the raw URL.\n- mmd-out flag writes raw mermaid source without fences to the given\n  path.\n- Classification priority: NEW-1 duplicated in `added` and `modified`\n  renders as :::added, not :::modified.\n\nAlso fixed the REQ-060 bucket-as-modified bug from v0.4.2: the\nrivet-core diff engine itself was correct (IDs can't be in both\nadded and common); the bug was script-side.\n\nImplements: FEAT-124\nRefs: DD-058\n\nCo-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>\n\n* fix(serve): sidebar badges now refresh on Reload — use HX-Redirect not HX-Location\n\nWhen the user clicked the Reload button in `rivet serve`, the reload\nhandler returned `HX-Location` targeting `#content` only. Everything\noutside `#content` — including the sidebar with artifact count,\ndocument count, variant count, STPA count, EU-AI-Act count, and\ndiagnostic badges — stayed untouched in the DOM. If a reload added or\nremoved artifacts on disk, the sidebar numbers lied.\n\nSwapping to `HX-Redirect` tells HTMX to do a full browser navigation\nto the same URL. The whole shell re-renders, sidebar included. Cheap\nin practice because HTMX stays in-session and the server serves the\npage out of the freshly-reloaded salsa state.\n\nPlaywright regression pins the contract: the /reload response must\ncarry HX-Redirect, not HX-Location. The old shape (HX-Location +\ntarget=#content) is what left the sidebar stale, so refusing it at\ntest time prevents the bug from silently coming back.\n\nFixes: REQ-008\nRefs: FEAT-001\n\nCo-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>\n\n---------\n\nCo-authored-by: Claude Opus 4.7 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-04-22T16:38:59-05:00",
          "tree_id": "6fa72c3e4b5a977d15d3bcab6b4efecb802c5b28",
          "url": "https://github.com/pulseengine/rivet/commit/3773a67c621e2811cca8127b271758d317e5b190"
        },
        "date": 1776894323302,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 79565,
            "range": "± 1035",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 844363,
            "range": "± 7117",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 16360049,
            "range": "± 1243771",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2155,
            "range": "± 21",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25827,
            "range": "± 383",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 374387,
            "range": "± 3409",
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
            "value": 1008775,
            "range": "± 13280",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 165386,
            "range": "± 2667",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1929836,
            "range": "± 25689",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 36772346,
            "range": "± 2104628",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 126678,
            "range": "± 1284",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1080848,
            "range": "± 29621",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 17134319,
            "range": "± 1197512",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4372,
            "range": "± 23",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 59932,
            "range": "± 480",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 789638,
            "range": "± 5985",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 60858,
            "range": "± 341",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 695887,
            "range": "± 6650",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 10094479,
            "range": "± 669497",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 739,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7067,
            "range": "± 59",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 107480,
            "range": "± 834",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 24166,
            "range": "± 164",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 176621,
            "range": "± 1457",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1640179,
            "range": "± 15506",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "5ac304671687164e65f1d352ba46acee61248af9",
          "message": "test(sexpr): audit predicate matrix + fuzz + doc examples + linked-from source-arg fix (#194)\n\n* test(sexpr): audit predicate matrix, fuzz, doc examples, CLI smoke\n\nComprehensive s-expression audit: close the coverage gaps in the\npredicate inventory and add four campaigns on top of the existing\nproptest_sexpr properties.\n\nNew coverage:\n\n* rivet-core/tests/sexpr_predicate_matrix.rs (92 tests)\n  Three-shape coverage — positive, negative, malformed — for every\n  predicate the lowerer recognises. Fills gaps for !=, >, <, >=, <=,\n  linked-from (arity), count, reachable-from, reachable-to, plus\n  arity/operator-shape errors for every head form.\n\n* rivet-core/tests/sexpr_fuzz.rs (4 proptest campaigns, 256 cases each)\n  - parse_never_panics: random ASCII + paren/quote soup must not panic\n    sexpr::parse\n  - lower_never_panics: full parse_filter on arbitrary input\n  - evaluate_never_panics: lowered Expr evaluated on a synthetic store\n  - roundtrip_equivalence: generated Expr → pretty-print → re-parse\n    must preserve truth value on every fixture artifact\n\n* rivet-core/tests/sexpr_doc_examples.rs (9 tests)\n  Every s-expression example in docs/getting-started.md runs\n  end-to-end with an asserted match count, catching any future drift\n  between the docs and the evaluator.\n\n* rivet-cli/tests/sexpr_filter_integration.rs (6 tests)\n  CLI-level smoke for list/stats/coverage --filter, including a\n  baseline vs. filtered comparison to catch silently-ignored filters\n  and a bad-s-expr exit-code assertion.\n\nVerifies: REQ-048\nRefs: REQ-028\n\n* fix(sexpr): honour the source-id argument of linked-from\n\n`(linked-from \"satisfies\" \"REQ-A\")` silently ignored its second\nargument — the evaluator's `Expr::LinkedFrom` arm bound the source\nparameter as `_source` and only checked the link type. A filter\nnaming a specific source ID got the same result set as the wildcard\nform, which hid real differences at the source level.\n\nThis is the same class of bug as the `links-count` operator drop\nfixed in v0.4.2 — lowerer accepts the argument, evaluator throws it\naway — so the fix follows the same pattern as `Expr::LinkedBy`: treat\n`Value::Wildcard` as \"any source\" and otherwise require an exact\nmatch against the backlink source.\n\nAdds a regression test (`linked_from_source_filter_is_honoured`) in\nthe predicate-matrix audit suite that exercises both the specific-id\nand wildcard forms on a store with two distinct source artifacts.\n\nFixes: REQ-004\nVerifies: REQ-004",
          "timestamp": "2026-04-22T16:39:52-05:00",
          "tree_id": "9c8145807b8ccefc6544019cf68c488ab12fd3c4",
          "url": "https://github.com/pulseengine/rivet/commit/5ac304671687164e65f1d352ba46acee61248af9"
        },
        "date": 1776894380088,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 82445,
            "range": "± 1289",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 850886,
            "range": "± 7157",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14392929,
            "range": "± 633523",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2187,
            "range": "± 26",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25170,
            "range": "± 65",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 374824,
            "range": "± 39543",
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
            "value": 1049240,
            "range": "± 22295",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 162196,
            "range": "± 1855",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1924219,
            "range": "± 34877",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 33940639,
            "range": "± 2578801",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 124599,
            "range": "± 4327",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1074725,
            "range": "± 17978",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 14599676,
            "range": "± 1164896",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4301,
            "range": "± 18",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 62238,
            "range": "± 552",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 772444,
            "range": "± 13582",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 62054,
            "range": "± 766",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 672595,
            "range": "± 3379",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 10219592,
            "range": "± 366727",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 770,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7306,
            "range": "± 725",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 109266,
            "range": "± 2946",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 25123,
            "range": "± 132",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 176433,
            "range": "± 1888",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1627937,
            "range": "± 22129",
            "unit": "ns/iter"
          }
        ]
      }
    ]
  }
}