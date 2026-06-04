window.BENCHMARK_DATA = {
  "lastUpdate": 1780586774470,
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
          "id": "f2ecf31d8e904fd8fec26dcbec4d0acf1e2f5130",
          "message": "feat(schema): declare canonical status lifecycle in common.yaml (REQ-162, #352, #355) (#419)\n\n* feat(validate): --structural gates on integrity only, via Diagnostic::is_structural() (REQ-161, #408)\n\nFrom #408 (and the recurring #353/#355 ask): `rivet validate`'s PASS/FAIL\nlumps structural integrity (a broken graph) together with coverage/lint\nfindings, so a bulk status-flip can't tell \"did I break the graph?\" from\n\"the project is still incomplete\". spar/sigil both hand-rolled a\n`0 broken cross-refs` gate for exactly this.\n\nAdd `Diagnostic::is_structural()` — an explicit allowlist of the\nstructural rule ids (broken-link, duplicate-artifact-id,\nartifact-parse-error, link-target-type, cardinality, known-type,\nunknown-link-type, doc-broken-ref, yaml-type-coercion,\nconditional-rule-consistency, coverage-rule-consistency). Everything else\nis coverage/lint, including the three borderline rules required-field /\nunknown-field / status-allowed-values (an incomplete/extra/typo'd field\ndoesn't break the graph) and all schema-defined coverage/status-gate\nrules.\n\n`rivet validate --structural` retains only structural diagnostics before\ncounting/display, so the shown set, counts, and PASS/FAIL exit reflect\nstructural-only. No rename of `validate_structural*` (its name is\nunrelated to this gate) — the classification lives on Diagnostic (#408\noption b).\n\nVerified: rivet repo `validate --structural` PASSes with 0 shown (its\n206 warnings are all coverage/lint); a broken-link fixture FAILs\n--structural; a coverage-only fixture PASSes. Unit test enumerates every\nbuilt-in rule's class; CLI test covers the gate. clippy --all-targets +\nfmt clean; docs check PASS.\n\nImplements: REQ-161\n\n* feat(schema): declare canonical status lifecycle in common.yaml (REQ-162, #352, #355)\n\nFrom #352/#355 Finding 1: the `status` base-field had no `allowed-values`,\nso typo'd/off-vocabulary statuses passed `rivet validate` silently. The\nenforcement mechanism (REQ-135) shipped but was inert until a set was\ndeclared.\n\nMaintainer decision: declare the canonical lifecycle in the shared\n`schemas/common.yaml` `status` base-field —\n[draft, proposed, approved, implemented, verified, deprecated, rejected]\n(ordering: draft -> proposed -> approved -> implemented -> verified;\ndeprecated/rejected terminal).\n\nMigrated the rivet repo's own 7 drifting artifacts to fit:\naccepted/active design-decisions -> approved; the active feature FEAT-066\nand partial component ARCH-ADAPT-WASM -> implemented. No-status artifacts\nare unaffected (the check only fires when a status is present).\n\nVerified: a typo'd status (`implmented`) now FAILs validate with a\n`status-allowed-values` ERROR + remediation; no-status does not; rivet\nrepo validate PASSes (0 status-allowed-values errors). 1112 rivet-core\nlib tests pass; docs check PASS.\n\nDownstream note: projects sharing common.yaml must use a status in this\nset or extend it. #355 Finding 2 (approved-hardcoded ASPICE promotion\ngates) is a separate follow-up needing a status-at-least predicate.\n\nImplements: REQ-162\nRefs: REQ-135\n\n* fix(schema): add `released` to canonical status set; fix off-vocab test fixtures (REQ-162)\n\nCI caught that the 7-value set omitted `released` — a first-class lifecycle\nstate rivet's own schemas use: `schemas/aspice.yaml` verification gates are\n`(or (= status \"approved\") (= status \"released\"))`, and common.yaml's\ndefect flow gates transitions to `released`. Excluding it would make those\nrules unsatisfiable and broke the `check_oracles` / ai-defects tests.\n\n- Add `released` to the `status` allowed-values (ordering now\n  draft -> proposed -> approved -> implemented -> verified -> released;\n  deprecated/rejected terminal).\n- Fix two test fixtures that used the off-vocabulary `active` (incidental):\n  `warning_only_project` and integration.rs FEAT-001 -> `approved`.\n\nVerified: cli_commands (113), rivet-core lib (1112), integration (27),\ncheck_oracles (7), vv_coverage_schema (9), mcp_integration (24) all pass;\nrivet repo validate PASS, 0 status-allowed-values errors.\n\nImplements: REQ-162",
          "timestamp": "2026-06-03T02:34:23-05:00",
          "tree_id": "f3ccc3db2a0f689feaae1f996bb44c8a8a9a31f7",
          "url": "https://github.com/pulseengine/rivet/commit/f2ecf31d8e904fd8fec26dcbec4d0acf1e2f5130"
        },
        "date": 1780472586980,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 86703,
            "range": "± 228",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 938520,
            "range": "± 97031",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14078496,
            "range": "± 1010656",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1959,
            "range": "± 32",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25285,
            "range": "± 56",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 365500,
            "range": "± 7200",
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
            "value": 1469030,
            "range": "± 31541",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 164724,
            "range": "± 757",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1899758,
            "range": "± 21903",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 28222735,
            "range": "± 278757",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 438839,
            "range": "± 13334",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 16377016,
            "range": "± 181529",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1269235645,
            "range": "± 26177276",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4141,
            "range": "± 128",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 43502,
            "range": "± 214",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 718585,
            "range": "± 3511",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 64196,
            "range": "± 283",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 720475,
            "range": "± 15562",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8506516,
            "range": "± 671163",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1113,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14642,
            "range": "± 67",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 235418,
            "range": "± 2983",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 20856,
            "range": "± 197",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 143868,
            "range": "± 984",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1337133,
            "range": "± 20991",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "f66362b377021ff4e39dd52502637589a5ca94d7",
          "message": "fix(aspice): verification gates accept forward target status (REQ-165, #355) (#424)\n\n#355 Finding 2: the three ASPICE verification status-gates\n(V-sys/sw/unit-verification-needs-approved-*) hardcode\n`(forall-linked \"verifies\" (= status \"approved\"))` in the consequent, so a\nverifier that is approved/released mis-fires when the requirement/design it\nverifies has moved FORWARD past approved (implemented/verified/released).\nThe antecedent already recognises `(or approved released)`; the consequent\ndid not — promoting a verified sw-detail-design approved -> implemented\nwrongly re-raised \"needs an approved design\".\n\nExpand each consequent to approved-or-beyond:\n`(or (= status \"approved\") (= status \"implemented\")\n     (= status \"verified\") (= status \"released\"))`. A target still BELOW\napproved (draft/proposed) correctly still fires. Schema-only (no s-expr\nengine change; a `status-at-least` predicate is a possible future\nsimplification).\n\nVerified behaviorally (approved verifier -> implemented req: no fire;\n-> draft req: fires) + regression test\n`aspice_status_gate_accepts_forward_target_status`; existing\n`aspice_status_gate_rules_loaded_and_fire` still passes; rivet validate\nPASS, docs check PASS.\n\nFixes: REQ-165\nRefs: REQ-135",
          "timestamp": "2026-06-03T02:54:50-05:00",
          "tree_id": "02c3f692cac487b928a739d43f1b07be4868bba5",
          "url": "https://github.com/pulseengine/rivet/commit/f66362b377021ff4e39dd52502637589a5ca94d7"
        },
        "date": 1780473825770,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84199,
            "range": "± 278",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 891626,
            "range": "± 11232",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13049925,
            "range": "± 634142",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2156,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26166,
            "range": "± 108",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 374014,
            "range": "± 1139",
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
            "value": 95,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1466929,
            "range": "± 26004",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 161096,
            "range": "± 1307",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1895017,
            "range": "± 18553",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 27069555,
            "range": "± 1807075",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 439954,
            "range": "± 1750",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 16434701,
            "range": "± 208565",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1399040064,
            "range": "± 14145270",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4446,
            "range": "± 10",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 59829,
            "range": "± 203",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 743800,
            "range": "± 1957",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 60182,
            "range": "± 159",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 685010,
            "range": "± 3849",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7703272,
            "range": "± 373391",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1278,
            "range": "± 17",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 16036,
            "range": "± 202",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 347197,
            "range": "± 5597",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22133,
            "range": "± 64",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 159306,
            "range": "± 1185",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1453133,
            "range": "± 19102",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "2e1bd9c86748ef70e9d0b6f82e635972e4e73433",
          "message": "feat(matrix): infer direction + link when --direction omitted (REQ-166, #402) (#425)\n\nFrom #402: `rivet matrix --from X --to Y` required the user to also know\nthe right `--direction` — the default `backward` silently rendered an\nall-empty matrix for a forward relationship like\n`design-decision --satisfies--> requirement`. REQ-152 added a hint, but\nthe user still had to re-run.\n\nMake `--direction` optional. When omitted, infer the direction + link\ntype that actually connect from -> to by probing the graph (declared\nsource-/target-types on common links like `satisfies` are usually empty,\nso metadata can't decide; the graph can). Candidates: the `--link` value,\nelse every distinct link type on a from-/to-type artifact; each scored in\nboth directions, highest-coverage non-empty pair wins (ties Forward-first\nthen link name -> deterministic). When `--direction` IS given, behaviour\nis byte-identical (separate code path) — inference only affects the\nomitted path.\n\nScope: CLI `rivet matrix`. The `{{matrix:from:to}}` embed + serve render\npath derive direction from schema rules and are a separate follow-up.\n\nVerified: `--from design-decision --to requirement` (no --direction) now\nnon-empty via `satisfies`; explicit forward/backward unchanged. New test\n`matrix_infers_direction_when_omitted`; the empty-hint test updated to\nforce the empty case with explicit `--direction backward`; 114\ncli_commands + embeds_help green; clippy --all-targets + fmt clean;\nrivet validate PASS, docs check PASS.\n\nImplements: REQ-166\nRefs: REQ-152",
          "timestamp": "2026-06-03T04:04:58-05:00",
          "tree_id": "d2c9856642909db23702278e29940e4029963076",
          "url": "https://github.com/pulseengine/rivet/commit/2e1bd9c86748ef70e9d0b6f82e635972e4e73433"
        },
        "date": 1780478080397,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85427,
            "range": "± 854",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 919622,
            "range": "± 9850",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13979137,
            "range": "± 249547",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2033,
            "range": "± 17",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25270,
            "range": "± 101",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 362933,
            "range": "± 2153",
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
            "value": 1472925,
            "range": "± 17706",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 164563,
            "range": "± 984",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1910707,
            "range": "± 22889",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 27443001,
            "range": "± 212796",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 440023,
            "range": "± 1507",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 16586595,
            "range": "± 168452",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1272096444,
            "range": "± 17053189",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4115,
            "range": "± 9",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 43625,
            "range": "± 870",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 741541,
            "range": "± 5491",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 61884,
            "range": "± 301",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 707961,
            "range": "± 2649",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7948165,
            "range": "± 106269",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1279,
            "range": "± 11",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14814,
            "range": "± 50",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 228099,
            "range": "± 2360",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 20829,
            "range": "± 57",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 142529,
            "range": "± 370",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1341350,
            "range": "± 11848",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "7ff3090906d18860b31f3232a3821207902c451e",
          "message": "feat(cli): add `rivet trace <id>` + deterministic explain ordering (REQ-167, #426) (#427)\n\nSelf-found while dogfooding: `rivet`'s tagline is \"SDLC artifact\ntraceability and validation\", yet `rivet trace <id>` was an unrecognised\nsubcommand. The per-artifact view (rules satisfied/missing, incoming +\noutgoing links, diagnostics) existed only under the non-obvious\n`rivet validate --explain <id>` — nobody runs `validate` to navigate\ntraceability.\n\nAdd `rivet trace <id>` as a first-class command rendering that view (it\ncalls the same `cmd_explain`; `validate --explain` stays an alias).\n\nAlso fixed nondeterminism the new command surfaced: incoming links\n(`graph.backlinks_to`, HashMap order) and the rule-satisfier\nrepresentative (\"...from <X>\") varied per run — bad for audit evidence\n(#415). Both now sort by (source, link-type), so `trace` /\n`validate --explain` output is reproducible.\n\nVerified: `rivet trace REQ-001` == `validate --explain REQ-001`, identical\nacross runs; missing id reports not-found; new test\n`trace_command_renders_and_is_deterministic` + existing\n`validate_explain_shows_rule_status` pass; 115 cli_commands + embeds_help\ngreen; clippy --all-targets + fmt clean; rivet validate PASS, docs PASS.\n\nImplements: REQ-167\nRefs: REQ-125",
          "timestamp": "2026-06-03T05:37:25-05:00",
          "tree_id": "7cdcb169e1cffc076553d8ab7fb644dddee238be",
          "url": "https://github.com/pulseengine/rivet/commit/7ff3090906d18860b31f3232a3821207902c451e"
        },
        "date": 1780483655983,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 83474,
            "range": "± 487",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 886442,
            "range": "± 10781",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13759918,
            "range": "± 778961",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2148,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25735,
            "range": "± 233",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 359090,
            "range": "± 1239",
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
            "range": "± 3",
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
            "value": 1474248,
            "range": "± 11613",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 161409,
            "range": "± 768",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1921363,
            "range": "± 20283",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 25833633,
            "range": "± 333815",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 462067,
            "range": "± 3280",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 16378171,
            "range": "± 92276",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1401496383,
            "range": "± 14683964",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4347,
            "range": "± 60",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 61408,
            "range": "± 311",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 755085,
            "range": "± 5372",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 56061,
            "range": "± 238",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 677823,
            "range": "± 9358",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8753304,
            "range": "± 560732",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1197,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15393,
            "range": "± 99",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 328550,
            "range": "± 5287",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22596,
            "range": "± 84",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 156047,
            "range": "± 761",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1457897,
            "range": "± 16524",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "92e283dc6610b2b784774f32c173fe395dbaaefd",
          "message": "feat(bundle): --incoming follows backlinks so sinks bundle their realizers (REQ-168, #428) (#429)\n\nSelf-found while dogfooding (#428). `rivet bundle` builds an artifact's\nlink-graph closure for LLM context (#206) but traversed OUTGOING links\nonly. A requirement is a graph SINK — everything links TO it\n(satisfies/verifies/allocated-to), it links OUT to nothing — so\n`rivet bundle REQ-001` returned just the bare artifact (count=1),\ndropping exactly the realizing design-decisions / features / tests you\nwant as context.\n\nAdd `bundle_with_graph(store, graph, root, depth, include_incoming)` +\na `rivet bundle --incoming` flag that also enqueues each node's backlink\nsources (depth +1). `bundle()` stays outgoing-only (public API + MCP\n`rivet_bundle` stability). Backlink sources are visited in sorted order\nso the bundle is reproducible across runs (backlink store is\nHashMap-backed; cf. #415).\n\nVerified: `bundle REQ-001` unchanged (count=1); `bundle REQ-001\n--incoming` -> count=34, byte-identical across runs. New unit test\n`incoming_includes_backlink_sources_deterministically`; 12 bundle tests\npass; clippy --all-targets + fmt clean; rivet validate PASS, docs PASS.\n\nImplements: REQ-168\nRefs: REQ-007",
          "timestamp": "2026-06-03T07:35:07-05:00",
          "tree_id": "cd3e5e927cb0c59c39d51ee9df7f040ce7f6d9cf",
          "url": "https://github.com/pulseengine/rivet/commit/92e283dc6610b2b784774f32c173fe395dbaaefd"
        },
        "date": 1780490653895,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84611,
            "range": "± 342",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 887008,
            "range": "± 8793",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12609686,
            "range": "± 383114",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2103,
            "range": "± 15",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26909,
            "range": "± 272",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 386056,
            "range": "± 2613",
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
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1457444,
            "range": "± 24640",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 161776,
            "range": "± 816",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1914051,
            "range": "± 20796",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 28099336,
            "range": "± 2744109",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 460959,
            "range": "± 26177",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 16625798,
            "range": "± 228729",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1455989913,
            "range": "± 17292427",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4345,
            "range": "± 101",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 68071,
            "range": "± 2489",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 737293,
            "range": "± 32288",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 60974,
            "range": "± 266",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 688891,
            "range": "± 5199",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7438104,
            "range": "± 266915",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1297,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14892,
            "range": "± 64",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 341558,
            "range": "± 4867",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22432,
            "range": "± 73",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 155308,
            "range": "± 956",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1473018,
            "range": "± 18724",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "12926c3e92af621f6de9ed70605e23ba8b479279",
          "message": "feat(externals): rivet sync refuses to clobber uncommitted git-external edits (REQ-169) (#432)\n\nSelf-found while triaging a maintainer question about co-developing two\nsynced repos at once. `git:` externals re-run `git fetch` + `git checkout`\nover `.rivet/repos/<prefix>`, silently losing edits made there while working\nin both repos. Add `is_working_tree_dirty()` (tracked changes only; untracked\nare preserved by checkout) and gate the git fetch/checkout: when dirty and\n`--force` is not given, sync aborts non-zero, names the prefix + path, and\npoints to commit+push / `--force` / using a `path:` external instead. New\n`rivet sync --force` opts out. Loud-fail over silent loss (F2).\n\nVerified end-to-end: dirty cache -> `rivet sync` exits 1 with the guard\nmessage; `rivet sync --force` proceeds. New unit test + existing externals\ntests pass; clippy --all-targets clean; `rivet validate` PASS.\n\nImplements: REQ-169\nRefs: REQ-020\n\nCo-authored-by: Claude Opus 4.8 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-06-03T08:25:08-05:00",
          "tree_id": "caaaf3c138a937e8188019f1f7abf9f1556af1fc",
          "url": "https://github.com/pulseengine/rivet/commit/12926c3e92af621f6de9ed70605e23ba8b479279"
        },
        "date": 1780493724027,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 78139,
            "range": "± 666",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 936922,
            "range": "± 16036",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 16058655,
            "range": "± 2244525",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1660,
            "range": "± 9",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 19412,
            "range": "± 134",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 358760,
            "range": "± 4788",
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
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1364408,
            "range": "± 42137",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 158655,
            "range": "± 370",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1844271,
            "range": "± 76870",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 39840868,
            "range": "± 8291827",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 415935,
            "range": "± 2314",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 16389634,
            "range": "± 778518",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 995232052,
            "range": "± 13663846",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3933,
            "range": "± 42",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 41244,
            "range": "± 151",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 782862,
            "range": "± 18016",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 53257,
            "range": "± 208",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 594764,
            "range": "± 3768",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8939730,
            "range": "± 1500254",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 964,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 12050,
            "range": "± 30",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 300725,
            "range": "± 2703",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 20284,
            "range": "± 52",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 141689,
            "range": "± 419",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1339283,
            "range": "± 28474",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "897de6191ab8c7fcbb08dc4ee2ebea86a8b8eb19",
          "message": "feat(externals): surface un-synced externals so cycle/backlink checks aren't silently incomplete (REQ-170) (#434)\n\nFollow-up to REQ-169. `detect_circular_deps` builds the cross-repo graph by\nreading each external's rivet.yaml from `.rivet/repos/<prefix>` with `if let\nOk(...)` — an un-synced (or unparseable) external is silently skipped, so a\ncycle/broken ref routed through it is invisible and validate reports a clean\n\"0 circular deps\". The acyclicity guarantee is only as good as graph\ncompleteness, and incompleteness was silent (violates F2).\n\nAdd `unresolved_externals()` (sorted prefixes whose cached rivet.yaml won't\nload). `rivet validate` now warns naming them + \"run rivet sync\", and emits an\n`unresolved_externals` array in --format json. Path-resolvable externals are\nnot flagged. Warning only; PASS/FAIL unchanged.\n\nVerified: project with an un-synced git external -> \"INCOMPLETE\" warning +\nJSON lists the prefix while circular_deps=0; new unit test; clippy\n--all-targets clean; `rivet validate` on rivet repo still PASS.\n\nImplements: REQ-170\nRefs: REQ-020, REQ-169\n\nCo-authored-by: Claude Opus 4.8 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-06-03T09:44:16-05:00",
          "tree_id": "af586d90aa0248ff987a5cfc5938baa790466e3c",
          "url": "https://github.com/pulseengine/rivet/commit/897de6191ab8c7fcbb08dc4ee2ebea86a8b8eb19"
        },
        "date": 1780498412711,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 83605,
            "range": "± 655",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 889561,
            "range": "± 15898",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13207612,
            "range": "± 898633",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2156,
            "range": "± 12",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 23948,
            "range": "± 106",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 349574,
            "range": "± 1206",
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
            "value": 1460520,
            "range": "± 28944",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 164501,
            "range": "± 1605",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1900366,
            "range": "± 14879",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 29303989,
            "range": "± 2509896",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 452105,
            "range": "± 2411",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 18284629,
            "range": "± 163665",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1483468658,
            "range": "± 21391984",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4308,
            "range": "± 25",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 65584,
            "range": "± 1239",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 744119,
            "range": "± 3110",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 59887,
            "range": "± 521",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 707007,
            "range": "± 2564",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7792131,
            "range": "± 194205",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1215,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15204,
            "range": "± 88",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 325634,
            "range": "± 1526",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22596,
            "range": "± 114",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 155097,
            "range": "± 944",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1462319,
            "range": "± 9241",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "7c0563463957e2b9d41275d7059ea1aa6caf8f27",
          "message": "fix(playwright): bound graph E2E node count so dataset growth doesn't trip render budget (REQ-171) (#435)\n\nSelf-found triaging why Playwright E2E was red across multiple merges (masked:\nit's a non-required check and main runs are concurrency-cancelled, so it never\nreports a conclusive green). Three graph/diagram tests failed reproducibly\n(through CI retry) — root cause is dogfood-dataset growth, not a serve bug:\n\n- graph.spec.ts \"custom polygon shapes\" hit /graph?types=requirement,\n  design-decision&depth=2 with no ?limit=. The dataset grew past the default\n  200-node render budget for that filter, so the view returns the \"above node\n  budget\" placeholder (no SVG) and the polygon count is 0. Add &limit=2000.\n- diagram-viewer.spec.ts graph page used /graph?limit=2000 (full ~871-node\n  graph), now heavy enough that goto+settle exceeded the timeout, failing the\n  .svg-viewer toolbar/fullscreen checks. Point it at a focused subgraph\n  (/graph?focus=REQ-001&depth=1&limit=2000) — same wrapper invariant, fast.\n\nVerified green in a real browser locally: 7/7 in the affected specs (was 3\nfailing). `rivet validate` still PASS.\n\nVerifies: REQ-171\nRefs: FEAT-001\n\nCo-authored-by: Claude Opus 4.8 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-06-03T10:16:01-05:00",
          "tree_id": "019bcebcb7d1f4f0a474353157d19bea1e444db6",
          "url": "https://github.com/pulseengine/rivet/commit/7c0563463957e2b9d41275d7059ea1aa6caf8f27"
        },
        "date": 1780500380603,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85181,
            "range": "± 237",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 928157,
            "range": "± 42892",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14320272,
            "range": "± 534834",
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
            "value": 25166,
            "range": "± 368",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 348365,
            "range": "± 2718",
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
            "value": 1479918,
            "range": "± 32835",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 166242,
            "range": "± 771",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1931091,
            "range": "± 12029",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 27832159,
            "range": "± 596184",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 445321,
            "range": "± 1552",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 17972728,
            "range": "± 378428",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1461989901,
            "range": "± 18139281",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4266,
            "range": "± 11",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 43362,
            "range": "± 208",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 722231,
            "range": "± 8263",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 59414,
            "range": "± 98",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 737014,
            "range": "± 1724",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8062355,
            "range": "± 190506",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1185,
            "range": "± 17",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15267,
            "range": "± 57",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 251740,
            "range": "± 4818",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 20905,
            "range": "± 283",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 143790,
            "range": "± 1936",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1342509,
            "range": "± 20887",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "8e7608b9a156564d1ba8920fd063aeb06aa0c5f7",
          "message": "fix(serve): preserve active variant scope when filtering/searching (REQ-172, #430) (#437)\n\n* fix(serve): preserve active variant scope when filtering/searching (REQ-172, #430)\n\nMaintainer-reported (#430). The variant <select id=\"variant-selector\"> lives in\nthe context bar, outside the filter form. Filter controls use hx-include of\nonly their own fields + hx-push-url, so filtering/searching a variant-scoped\nview sent no variant= and the pushed URL dropped ?variant= — silently resetting\nthe scope, and losing it on reload.\n\nAdd #variant-selector to every filter control's hx-include via a shared\nhx_include_with_variant() helper (search_input, type_filter, per_page_select,\nfilter_bar form + inner search, validate status select). The server treats an\nempty variant= as unscoped, so this is safe when none is active; the selector\nis only in the DOM when a variant model exists.\n\nVerified in a real browser: new Playwright regression test \"filtering a\nvariant-scoped list keeps the variant in the URL (#430)\" + the full\nserve-variant spec pass 9/9; `cargo test -p rivet-cli --bins components` 51/51;\nclippy --all-targets clean; `rivet validate` PASS.\n\nImplements: REQ-172\nRefs: REQ-109\n\nCo-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>\n\n* style(serve): fix rustfmt + clippy on hx_include_with_variant helper\n\nCI Format + Clippy failed on the #430 fix: rustfmt wanted the iterator chain\nwrapped, and clippy's doc_lazy_continuation fired because the helper had been\ninserted between search_input's doc comment and its signature — orphaning that\ndoc onto the helper. Reorder so the helper carries its own doc and\nsearch_input's doc reattaches to search_input; apply cargo fmt. No behavior\nchange (helper logic untouched; serve-variant Playwright + component tests\nalready green).\n\nRefs: REQ-172\n\nCo-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>\n\n---------\n\nCo-authored-by: Claude Opus 4.8 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-06-03T11:43:59-05:00",
          "tree_id": "bab07571e4acb8fa4c10d8f4e36ca1bf7907d50c",
          "url": "https://github.com/pulseengine/rivet/commit/8e7608b9a156564d1ba8920fd063aeb06aa0c5f7"
        },
        "date": 1780505587019,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 83357,
            "range": "± 322",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 876849,
            "range": "± 7977",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13781666,
            "range": "± 706904",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2174,
            "range": "± 22",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25694,
            "range": "± 122",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 393930,
            "range": "± 2529",
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
            "value": 1456440,
            "range": "± 14346",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 166925,
            "range": "± 574",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1900063,
            "range": "± 20515",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 26190334,
            "range": "± 1809347",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 440847,
            "range": "± 2915",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 16941119,
            "range": "± 522675",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1413498065,
            "range": "± 21116862",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4330,
            "range": "± 17",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60960,
            "range": "± 842",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 751202,
            "range": "± 6139",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 61524,
            "range": "± 219",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 707009,
            "range": "± 7445",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7918953,
            "range": "± 372421",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1248,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15131,
            "range": "± 114",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 325580,
            "range": "± 3388",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22662,
            "range": "± 179",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 158574,
            "range": "± 1132",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1456846,
            "range": "± 26830",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "f6a2862a1fc488239574a5f6ad6992082c5385fa",
          "message": "fix(externals): ignore only .rivet/repos/ cache, not the whole .rivet/ dir (REQ-173, #433) (#439)\n\nSelf-found while dogfooding (#433). ensure_gitignore (run by `rivet sync`)\nappended a blanket `.rivet/` and only deduped against an exact `.rivet/` line.\nBut rivet tracks files under `.rivet/` (e.g. `.rivet/agent-context.md`), and\nthe cache sync actually writes is the narrower `.rivet/repos/`. So the blanket\nentry would silently un-track committed files on a fresh checkout, and was\nadded even when `.rivet/repos/` was already ignored.\n\nAppend `.rivet/repos/` instead, and treat the entry as present if any of\n`.rivet/repos/`, `.rivet/repos`, `.rivet/`, `.rivet` already appears.\n\nVerified: `cargo test -p rivet-core --lib ensure_gitignore` (2/2, incl. new\nensure_gitignore_respects_existing_cache_ignore); cargo fmt --check clean;\nclippy --all-targets -D warnings clean; `rivet validate` PASS.\n\nImplements: REQ-173\nRefs: REQ-020\n\nCo-authored-by: Claude Opus 4.8 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-06-03T13:15:56-05:00",
          "tree_id": "9beaf26da65179386b8421e6a6aaf083c0d0c63c",
          "url": "https://github.com/pulseengine/rivet/commit/f6a2862a1fc488239574a5f6ad6992082c5385fa"
        },
        "date": 1780511110318,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 83792,
            "range": "± 705",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 895096,
            "range": "± 17627",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 16956747,
            "range": "± 757523",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2191,
            "range": "± 11",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25227,
            "range": "± 343",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 392430,
            "range": "± 4274",
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
            "value": 1483201,
            "range": "± 23764",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 166975,
            "range": "± 1207",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1946502,
            "range": "± 37438",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 43126937,
            "range": "± 4270315",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 463076,
            "range": "± 8353",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 18141497,
            "range": "± 206836",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1458501661,
            "range": "± 18432735",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4325,
            "range": "± 118",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 59787,
            "range": "± 405",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 762650,
            "range": "± 11342",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 61039,
            "range": "± 221",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 712292,
            "range": "± 3116",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 12048368,
            "range": "± 465792",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1253,
            "range": "± 53",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15915,
            "range": "± 77",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 325256,
            "range": "± 6144",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22709,
            "range": "± 229",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 155881,
            "range": "± 1566",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1469529,
            "range": "± 58319",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "411449a3baa836e95266d4f0b649af1f3f5367d9",
          "message": "test(serve): /graph tests retry on status==0 to stop flapping on unrelated PRs (REQ-175) (#441)\n\nTriaging a red CI Test job on an artifact/script-only PR (#440): nextest exit\n100 -> JUnit named serve_integration::graph_type_filter_renders_when_under_budget,\nwhich asserted /graph?types=requirement returns 200 but got status=0 (transient\nconnection drop after the health probe -- a transport failure, not a content\nmismatch). Passed locally; the PR was shell+YAML only.\n\nThe file already had fetch_page_with_retry (15s + one retry on status==0) for\nexactly this flake class, but graph_focused_view_renders_svg and\ngraph_type_filter_renders_when_under_budget called fetch_with_timeout directly,\nbypassing it. Switch both to fetch_page_with_retry.\n\nConfirmed with `cargo test -p rivet-cli --test serve_integration graph_` (4/4),\n`cargo fmt --check` clean, and `rivet validate` PASS.\n\nVerifies: REQ-175\nRefs: FEAT-001\n\nCo-authored-by: Claude Opus 4.8 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-06-03T15:17:31-05:00",
          "tree_id": "cb2c32ca9dc3b83a6791d6c9bac78973c3190baa",
          "url": "https://github.com/pulseengine/rivet/commit/411449a3baa836e95266d4f0b649af1f3f5367d9"
        },
        "date": 1780518428497,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 83757,
            "range": "± 3162",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 883328,
            "range": "± 17046",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 16627059,
            "range": "± 1080019",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2239,
            "range": "± 25",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26339,
            "range": "± 113",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 385458,
            "range": "± 2415",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 101,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/1000",
            "value": 100,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 100,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1475801,
            "range": "± 23950",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 164365,
            "range": "± 3862",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1904256,
            "range": "± 16987",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 40005192,
            "range": "± 2482095",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 449775,
            "range": "± 2555",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 17802202,
            "range": "± 118060",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1490554427,
            "range": "± 25789904",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4337,
            "range": "± 22",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60213,
            "range": "± 829",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 745188,
            "range": "± 5147",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 61910,
            "range": "± 395",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 714333,
            "range": "± 3415",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 9827591,
            "range": "± 464434",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1132,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 16231,
            "range": "± 323",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 330451,
            "range": "± 1845",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22346,
            "range": "± 118",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 155723,
            "range": "± 944",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1462047,
            "range": "± 31300",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "b4b824f8e4acf3915b53d675a36f3c56cec9ccd3",
          "message": "ci(hooks): pre-commit also runs cargo fmt --check on staged Rust (REQ-174, #438) (#440)\n\nThe generated pre-commit hook in install-hooks.sh ran only `rivet validate`,\nnot `cargo fmt --check`, so commits passed local hooks but failed the CI Format\njob (the most common first-push failure; cf. #437). The orphaned\n`scripts/pre-commit` had fmt+clippy but the installer never wired it.\n\nAdd a fast `cargo fmt --all -- --check` step gated on staged `.rs` files,\nblocking with a clear fix message. Clippy/test stay out of per-commit (too\nslow) — CI's job. Convenience only; CI remains the real gate (REQ-051).\n\nVerified: misformatted staged Rust file blocks the hook (exit 1, shows diff);\nclean tree / no staged .rs passes; `bash -n` clean; `rivet validate` PASS.\n\nImplements: REQ-174\nRefs: REQ-051\n\nCo-authored-by: Claude Opus 4.8 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-06-03T15:58:17-05:00",
          "tree_id": "3e6f33112a0092d925a191da74142e99a4845547",
          "url": "https://github.com/pulseengine/rivet/commit/b4b824f8e4acf3915b53d675a36f3c56cec9ccd3"
        },
        "date": 1780520831836,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84850,
            "range": "± 310",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 879929,
            "range": "± 13948",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12506856,
            "range": "± 332392",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2181,
            "range": "± 26",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26893,
            "range": "± 1627",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 356049,
            "range": "± 821",
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
            "value": 1471730,
            "range": "± 23490",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 165802,
            "range": "± 1064",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1910362,
            "range": "± 16742",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 24365612,
            "range": "± 587444",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 459096,
            "range": "± 38699",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 17469598,
            "range": "± 115212",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1406910740,
            "range": "± 14490194",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4351,
            "range": "± 16",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 59324,
            "range": "± 341",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 772490,
            "range": "± 3587",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 62825,
            "range": "± 900",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 707203,
            "range": "± 2310",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7896746,
            "range": "± 202577",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1179,
            "range": "± 40",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 16486,
            "range": "± 187",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 370324,
            "range": "± 5365",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22353,
            "range": "± 100",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 156349,
            "range": "± 813",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1473483,
            "range": "± 27666",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "255e18cf50bfd7d27d6b6409f21c7ceedd0252ca",
          "message": "feat(schema): rivet schema info reports on-disk vs embedded source (REQ-176, #431) (#442)\n\nload_schemas_with_fallback resolves each schema as on-disk if present else the\ncompiled-in embedded copy, but never reports which. So builtin-schema projects\nget the embedded copy swapped silently on a rivet upgrade, and cross-version\ndiagnostic drift looks like it came from nowhere.\n\nAdd a Source: line to `rivet schema info <name>` text output: on-disk (with\npath) vs embedded (with a hint to vendor under schemas/ to pin). The branch is\nalready computed inline in the Info command -- local change, no loader\nsignature change. JSON output unchanged.\n\nConfirmed with the new schema_info_reports_source test (embedded + on-disk via\n--schemas) and the unchanged schema_info_json (both pass); cargo fmt --check\nand clippy --all-targets -D warnings clean; rivet validate PASS.\n\nImplements: REQ-176\nRefs: REQ-010\n\nCo-authored-by: Claude Opus 4.8 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-06-03T16:16:29-05:00",
          "tree_id": "c63eecdf23deb5e85d34e77ce985649a2a5fbf91",
          "url": "https://github.com/pulseengine/rivet/commit/255e18cf50bfd7d27d6b6409f21c7ceedd0252ca"
        },
        "date": 1780521942327,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84617,
            "range": "± 819",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 868746,
            "range": "± 12542",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12187725,
            "range": "± 286227",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2229,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26425,
            "range": "± 75",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 371288,
            "range": "± 1100",
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
            "value": 1463054,
            "range": "± 23400",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 160817,
            "range": "± 2795",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1858106,
            "range": "± 13983",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 22849877,
            "range": "± 194187",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 452731,
            "range": "± 6365",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 17091769,
            "range": "± 119165",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1441713131,
            "range": "± 8995352",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4440,
            "range": "± 187",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 59560,
            "range": "± 578",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 755029,
            "range": "± 11690",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 62647,
            "range": "± 428",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 716502,
            "range": "± 2996",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7667863,
            "range": "± 116899",
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
            "value": 15681,
            "range": "± 36",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 319668,
            "range": "± 5170",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22427,
            "range": "± 364",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 156065,
            "range": "± 1565",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1457469,
            "range": "± 18171",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "b8c09f40de4031e09930fe5b3c429cad5b11bd39",
          "message": "feat(schema): add `rivet schema sources` (on-disk vs embedded resolution) (REQ-177, #431) (#443)\n\nCompletes the #431 surfacing started in REQ-176. `schema info` shows one\nschema's source; `schema sources` lists the whole active set so a user can tell\nat a glance whether they're on vendored (pinned) or builtin (embedded,\nbinary-versioned) schemas.\n\nAdds a reusable `embedded::schema_sources()` helper (OnDisk/Embedded/Missing)\nmirroring load_schemas_with_fallback precedence, and a `schema sources` command\n(text + --format json) that resolves WITHOUT loading the schema graph -- so it\nstill works and reports `missing` when a schema can't be loaded.\n\nConfirmed with: schema_sources unit test (rivet-core) + schema_sources_reports_\nresolution integration test (succeeds despite a missing schema); fmt + clippy\n--all-targets -D warnings clean; docs check PASS; rivet validate PASS.\n\nImplements: REQ-177\nRefs: REQ-176, REQ-010\n\nCo-authored-by: Claude Opus 4.8 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-06-03T17:16:01-05:00",
          "tree_id": "6df723a20ff647ac295e76839d7bc9870ef808e8",
          "url": "https://github.com/pulseengine/rivet/commit/b8c09f40de4031e09930fe5b3c429cad5b11bd39"
        },
        "date": 1780525501012,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 86128,
            "range": "± 564",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 934612,
            "range": "± 13226",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 17506090,
            "range": "± 1191179",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1933,
            "range": "± 9",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25015,
            "range": "± 68",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 356140,
            "range": "± 1825",
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
            "value": 1460145,
            "range": "± 28614",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 168337,
            "range": "± 1214",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1993291,
            "range": "± 70150",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 38505231,
            "range": "± 4915227",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 447606,
            "range": "± 1948",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 17559138,
            "range": "± 316627",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1322263121,
            "range": "± 20237654",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4132,
            "range": "± 31",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 43166,
            "range": "± 130",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 733371,
            "range": "± 40140",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 65372,
            "range": "± 288",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 727347,
            "range": "± 4873",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 9735950,
            "range": "± 980350",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1211,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15594,
            "range": "± 113",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 233202,
            "range": "± 3783",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21754,
            "range": "± 357",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 151148,
            "range": "± 1304",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1392758,
            "range": "± 19807",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "599ce86adc952591d98c9f39b3a903fb9ae6a925",
          "message": "docs(artifacts): file REQ-178 — coverage-gap diagnostics should name the intermediate chain (#350) (#444)\n\nDraft requirement from #350: the lifecycle completeness check reports terminal\nverification types as \"missing\" without flagging that, per the link schema's\nallowed-targets, they attach via intermediate sw-detail-design /\nsw-arch-component artifacts — so the message points at the wrong fix. Scoped a\nfix (cross-check required source types against link allowed-targets; walk one\nhop to print the chain) for a later, fixture-tested PR.\n\nRefs: REQ-004\n\nCo-authored-by: Claude Opus 4.8 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-06-03T18:16:28-05:00",
          "tree_id": "e1c0f83d152e60be8dc3a5672704a36d017e1994",
          "url": "https://github.com/pulseengine/rivet/commit/599ce86adc952591d98c9f39b3a903fb9ae6a925"
        },
        "date": 1780529116166,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85301,
            "range": "± 229",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 919826,
            "range": "± 8478",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14148276,
            "range": "± 803153",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2022,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25075,
            "range": "± 331",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 376602,
            "range": "± 2011",
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
            "value": 1450186,
            "range": "± 7992",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 167232,
            "range": "± 1429",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1931776,
            "range": "± 17155",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 26867917,
            "range": "± 329067",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 442569,
            "range": "± 1468",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 16944512,
            "range": "± 158508",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1295717609,
            "range": "± 17960512",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4096,
            "range": "± 15",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 42918,
            "range": "± 130",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 726974,
            "range": "± 4868",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 58542,
            "range": "± 726",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 728162,
            "range": "± 4822",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8202433,
            "range": "± 35823",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1300,
            "range": "± 14",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14783,
            "range": "± 24",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 235348,
            "range": "± 3871",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21965,
            "range": "± 52",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 150406,
            "range": "± 2314",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1398687,
            "range": "± 10848",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "0ce81897f90e00fddbc73c23f0522f11ed73038b",
          "message": "feat(validate): --explain names which backlink source types can attach directly (REQ-178, #350) (#445)\n\nA required-backlink rule may list source types that can't form that backlink to\nthis artifact's type. Aspice sw-req expects a `verifies` backlink from\n[sw-verification, unit-verification, sw-integration-verification], but only\nsw-verification's `verifies` targets sw-req — the others verify design\nartifacts. `validate --explain` listed all three, sending the user to author an\nimpossible direct link (#350).\n\nAdd Schema::from_type_can_link() (checks the per-type link-field target\nallow-list) and partition the rule's from_types by it in explain_rule: surface\nthe directly-linkable type(s), annotate the rest (\"... can 'verifies' other\ntypes, not 'sw-req' directly — attach via the intermediate design artifact\").\nAll-direct case (requirement <- design-decision/feature) is byte-identical.\n\nConfirmed with: from_type_can_link unit test (real embedded aspice schema) +\nexplain_names_directly_linkable_verification_type integration test; explain +\nlifecycle suites green; fmt + clippy --all-targets -D warnings clean; validate PASS.\n\nImplements: REQ-178\nRefs: REQ-004\n\nCo-authored-by: Claude Opus 4.8 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-06-03T19:15:19-05:00",
          "tree_id": "2ba06caed84b5e13d11922181be00b3cdc07c870",
          "url": "https://github.com/pulseengine/rivet/commit/0ce81897f90e00fddbc73c23f0522f11ed73038b"
        },
        "date": 1780532649521,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84560,
            "range": "± 362",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 918799,
            "range": "± 19509",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 15360520,
            "range": "± 1990158",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1928,
            "range": "± 19",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25152,
            "range": "± 103",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 371120,
            "range": "± 2236",
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
            "value": 1439611,
            "range": "± 15260",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 169212,
            "range": "± 1842",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1931156,
            "range": "± 14310",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 29501918,
            "range": "± 1581788",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 443053,
            "range": "± 6121",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 17595155,
            "range": "± 222539",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1316131833,
            "range": "± 19548287",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4134,
            "range": "± 14",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 43239,
            "range": "± 118",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 770713,
            "range": "± 19286",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 57004,
            "range": "± 157",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 719224,
            "range": "± 4435",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7965272,
            "range": "± 438383",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1241,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14772,
            "range": "± 279",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 235012,
            "range": "± 2104",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 20678,
            "range": "± 70",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 143281,
            "range": "± 513",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1342585,
            "range": "± 17936",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "ec11a16db9be1c1979d100073ea62c6b4bfc75ec",
          "message": "docs(artifacts): add FEAT-136/137/138 realizing shipped dogfood REQs (coverage 27.9%->31.8%) (#446)\n\nDogfooding found the loop's own REQ-168..178 were marked `implemented` but had\nzero satisfying feature/design-decision artifacts, degrading the repo's\nrequirement-coverage. Add three accurate feature artifacts for the shipped\ncapability clusters and link the REQs they realize via `satisfies`:\n  - FEAT-136 Externals sync safety       -> REQ-169, REQ-170, REQ-173\n  - FEAT-137 Schema source provenance    -> REQ-176, REQ-177\n  - FEAT-138 Traceability navigation     -> REQ-168, REQ-178\n\nrequirement-coverage 50/179 -> 57/179; `rivet validate` PASS.\n\nRefs: REQ-168, REQ-169, REQ-170, REQ-173, REQ-176, REQ-177, REQ-178\n\nCo-authored-by: Claude Opus 4.8 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-06-03T20:14:56-05:00",
          "tree_id": "2bf05bcb52fba836f33d9f24a40278d62b6cfae7",
          "url": "https://github.com/pulseengine/rivet/commit/ec11a16db9be1c1979d100073ea62c6b4bfc75ec"
        },
        "date": 1780536226435,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84687,
            "range": "± 216",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 922852,
            "range": "± 4156",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 15021970,
            "range": "± 2809777",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1933,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25105,
            "range": "± 489",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 355208,
            "range": "± 3978",
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
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 100,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1455847,
            "range": "± 20295",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 167478,
            "range": "± 1089",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1983996,
            "range": "± 29151",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 39567210,
            "range": "± 3147795",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 443104,
            "range": "± 1580",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 17147535,
            "range": "± 246087",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1311805745,
            "range": "± 18676461",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4104,
            "range": "± 36",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 43307,
            "range": "± 211",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 741519,
            "range": "± 16428",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 64283,
            "range": "± 215",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 739867,
            "range": "± 3155",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 9951772,
            "range": "± 591187",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1330,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15137,
            "range": "± 93",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 245122,
            "range": "± 4059",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21312,
            "range": "± 79",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 143924,
            "range": "± 1745",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1340991,
            "range": "± 36799",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "de324eac44d687b0b5b94f838baf3fe7bc6943d9",
          "message": "feat(cli): rivet next-id accepts a positional type/prefix shorthand (REQ-179, #447) (#448)\n\n`rivet next-id` already existed (since #28) and scans the whole store for the\nmax id — but the natural `rivet next-id feature` was rejected (\"unexpected\nargument\"); you had to pass `--type feature`. Add an optional positional\nTYPE_OR_PREFIX shorthand for --type (prefix_for_type's uppercase fallback also\nmakes a bare `FEAT` work); explicit flags still win. The no-arg error now lists\nall three forms.\n\nConfirmed with: next_id_positional_shorthand test (positional == --type, bare\nprefix works, no-arg fails) + existing next_id_json; fmt + clippy --all-targets\n-D warnings clean; rivet validate PASS.\n\nImplements: REQ-179\nRefs: REQ-007\n\nCo-authored-by: Claude Opus 4.8 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-06-03T21:15:10-05:00",
          "tree_id": "a47e5fd11dc242edcd0a45740ce49812c9273450",
          "url": "https://github.com/pulseengine/rivet/commit/de324eac44d687b0b5b94f838baf3fe7bc6943d9"
        },
        "date": 1780539847157,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84777,
            "range": "± 473",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 925168,
            "range": "± 17012",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13762956,
            "range": "± 573712",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1964,
            "range": "± 18",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24914,
            "range": "± 230",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 364839,
            "range": "± 1302",
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
            "value": 1456480,
            "range": "± 19282",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 166863,
            "range": "± 830",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1929542,
            "range": "± 10996",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 27085422,
            "range": "± 221697",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 443094,
            "range": "± 5912",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 17104977,
            "range": "± 248721",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1316870522,
            "range": "± 12813802",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4143,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 46188,
            "range": "± 931",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 714163,
            "range": "± 3446",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 64644,
            "range": "± 206",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 724860,
            "range": "± 2761",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8108264,
            "range": "± 96383",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1241,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15167,
            "range": "± 48",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 230817,
            "range": "± 2774",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21118,
            "range": "± 111",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 142739,
            "range": "± 285",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1340574,
            "range": "± 10810",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "65a5390481cf998f3702c74093d5372e1e39743c",
          "message": "docs(agents): surface rivet next-id in generated agent guidance (REQ-180, #447) (#449)\n\n`rivet next-id` existed but wasn't discoverable where agents create artifacts —\nthe `rivet init --agents` template showed only `rivet add`, so an agent (me, last\nloop) hand-grepped one file for the next id and collided across the 9 files that\nhold feature ids. Add a `rivet next-id` row to the generated command table and a\nnote in the Creating-Artifacts snippet. Regenerating the repo's AGENTS.md /\nCLAUDE.md also resynced their managed sections (had drifted 518->883 artifacts).\n\nConfirmed with: init_bootstrap + init_integration suites (12 tests); fmt +\nclippy --all-targets -D warnings clean; rivet validate PASS.\n\nImplements: REQ-180\nRefs: REQ-007, REQ-179\n\nCo-authored-by: Claude Opus 4.8 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-06-03T22:14:55-05:00",
          "tree_id": "63894aa725be1f81153c665dde0c91771071ff67",
          "url": "https://github.com/pulseengine/rivet/commit/65a5390481cf998f3702c74093d5372e1e39743c"
        },
        "date": 1780543432898,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85173,
            "range": "± 386",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 924075,
            "range": "± 4344",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14653598,
            "range": "± 2468622",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1963,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25073,
            "range": "± 133",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 362274,
            "range": "± 6429",
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
            "value": 1444251,
            "range": "± 24171",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 166783,
            "range": "± 582",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1912462,
            "range": "± 15180",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 29460396,
            "range": "± 2497959",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 443977,
            "range": "± 1960",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 16994784,
            "range": "± 1190893",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1315219350,
            "range": "± 17806172",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4134,
            "range": "± 10",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 44863,
            "range": "± 678",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 730790,
            "range": "± 11032",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 62334,
            "range": "± 176",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 728415,
            "range": "± 71817",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8243958,
            "range": "± 410110",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1246,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14952,
            "range": "± 726",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 229936,
            "range": "± 5980",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 20961,
            "range": "± 244",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 142953,
            "range": "± 3994",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1336374,
            "range": "± 17698",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "d51943e7281f63aa44ebe6f17d1e216e7eff1c7c",
          "message": "fix(export): escape backslashes in zola TOML front matter + gate with zola-build smoke (REQ-181, #392) (#450)\n\nRunning #392's candidate gate (scripts/zola-export-smoke.sh) locally caught a\nreal bug: `zola build` failed on the exported corpus because an artifact\ndescription containing a regex (`\\.rs$`, in REQ-174) went into a TOML multi-line\nbasic string (\"\"\"...\"\"\") unescaped. TOML multi-line basic strings process\nescapes, so a bare `\\` is invalid and breaks the whole site build.\n\nEscape `\\` -> `\\\\` in the description (mirroring the title), then add the\nzola-export-smoke CI job (#392, ubuntu-latest, pinned zola, advisory\ncontinue-on-error) so the regression class is caught automatically.\n\nConfirmed with: new zola_frontmatter_escapes_backslashes_in_description test\n(`\\.rs$` -> `\\\\.rs$`); the smoke script now runs a real `zola build` of the\ncorpus to completion (907 pages, 0 link leaks); export_zola suite 3/3; fmt +\nclippy --all-targets -D warnings clean; rivet validate PASS.\n\nImplements: REQ-181\nRefs: REQ-115, REQ-138\n\nCo-authored-by: Claude Opus 4.8 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-06-03T23:15:28-05:00",
          "tree_id": "aa4abbfae3cb3f134dbe0c0d4024a3f4a5718057",
          "url": "https://github.com/pulseengine/rivet/commit/d51943e7281f63aa44ebe6f17d1e216e7eff1c7c"
        },
        "date": 1780547052906,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 87191,
            "range": "± 2371",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 934487,
            "range": "± 8516",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 15564460,
            "range": "± 799122",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1971,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25025,
            "range": "± 640",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 377384,
            "range": "± 1346",
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
            "value": 1443046,
            "range": "± 26924",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 168401,
            "range": "± 632",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1954108,
            "range": "± 10759",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 29038078,
            "range": "± 1575902",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 443684,
            "range": "± 2128",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 16853174,
            "range": "± 404249",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1296015193,
            "range": "± 17947330",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4448,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 48828,
            "range": "± 1079",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 757167,
            "range": "± 6861",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 59117,
            "range": "± 498",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 721237,
            "range": "± 2055",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8143815,
            "range": "± 307398",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1249,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15407,
            "range": "± 31",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 244639,
            "range": "± 4582",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21197,
            "range": "± 104",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 143303,
            "range": "± 3659",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1343765,
            "range": "± 26206",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "2081b8e4e8c8f3bbffee98480819a4dd8cf2b3ae",
          "message": "fix(export): actionable error when a single-file format is given a directory --output (REQ-182) (#451)\n\nSelf-found dogfooding exports: `rivet export --format reqif --output <dir>`\n(and generic-yaml/generic) failed with a cryptic \"writing <path>: Is a\ndirectory (os error 21)\". These formats write a single file; passing a\ndirectory is an easy mistake (html/zola want a directory) with an unhelpful\nmessage. Bail before the write with a message naming the format, suggesting a\nfile path, and pointing at the directory formats. File-path export unchanged.\n\nConfirmed with: new export_reqif_to_directory_gives_actionable_error test\n(directory -> actionable error, no \"os error 21\"; file path still works); fmt +\nclippy --all-targets -D warnings clean; rivet validate PASS.\n\nImplements: REQ-182\nRefs: REQ-007\n\nCo-authored-by: Claude Opus 4.8 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-06-04T00:15:09-05:00",
          "tree_id": "5524cbfbeafef1be705c29ee72be47b09513402e",
          "url": "https://github.com/pulseengine/rivet/commit/2081b8e4e8c8f3bbffee98480819a4dd8cf2b3ae"
        },
        "date": 1780550645171,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84954,
            "range": "± 1405",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 926730,
            "range": "± 4543",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 20040320,
            "range": "± 978704",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1953,
            "range": "± 54",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25165,
            "range": "± 253",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 358015,
            "range": "± 7343",
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
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 99,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1462630,
            "range": "± 13417",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 166510,
            "range": "± 3053",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1947935,
            "range": "± 17273",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 42846312,
            "range": "± 1866317",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 444071,
            "range": "± 6298",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 17584131,
            "range": "± 221473",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1322213127,
            "range": "± 18988012",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4904,
            "range": "± 13",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 43641,
            "range": "± 619",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 766223,
            "range": "± 7680",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 63929,
            "range": "± 2408",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 722149,
            "range": "± 8412",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 10213749,
            "range": "± 507449",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1284,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15199,
            "range": "± 170",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 239646,
            "range": "± 4090",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 20958,
            "range": "± 302",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 142629,
            "range": "± 6021",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1339031,
            "range": "± 17643",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "e355216bfcfd6395007c150e804d19bbf29e5551",
          "message": "fix(reqif): title-less artifacts stay re-importable via id LONG-NAME fallback (REQ-183) (#452)\n\nSelf-found dogfooding a reqif round-trip: `export --format reqif` then\n`import-results --format reqif` on the same corpus FAILED — \"SPEC-OBJECT\n'CA-CI-1' has neither a ReqIF.Name nor @LONG-NAME — cannot derive the required\ntitle\". Some types legitimately have an empty title (STPA control-action,\nidentified by id; validate passes). The export wrote long_name = a.title\nverbatim -> an empty LONG-NAME that rivet's own strict import (REQ-123) then\nrejected, so rivet produced reqif it couldn't re-import.\n\nFall back to the artifact id for LONG-NAME when the title is empty. Import\nstrictness unchanged.\n\nConfirmed with: new test_empty_title_roundtrips_via_id (id-as-LONG-NAME +\nclean re-import); reqif suite 47/47; a real export->import of the corpus now\nsucceeds (was erroring on CA-CI-1); fmt + clippy --all-targets -D warnings\nclean; rivet validate PASS.\n\nImplements: REQ-183\nRefs: REQ-007, REQ-123\n\nCo-authored-by: Claude Opus 4.8 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-06-04T01:15:03-05:00",
          "tree_id": "c738dbd644a8ea1cf9533eede5ebefb207a4a192",
          "url": "https://github.com/pulseengine/rivet/commit/e355216bfcfd6395007c150e804d19bbf29e5551"
        },
        "date": 1780554231522,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84796,
            "range": "± 259",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 923386,
            "range": "± 13437",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13998019,
            "range": "± 199830",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1939,
            "range": "± 17",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25223,
            "range": "± 35",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 370325,
            "range": "± 10332",
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
            "value": 1435727,
            "range": "± 24049",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 168699,
            "range": "± 1272",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1954187,
            "range": "± 19973",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 31354286,
            "range": "± 1995820",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 444586,
            "range": "± 1677",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 17103542,
            "range": "± 140718",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1326835603,
            "range": "± 17678328",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4274,
            "range": "± 11",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 45732,
            "range": "± 1692",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 734577,
            "range": "± 5381",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 62193,
            "range": "± 156",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 723091,
            "range": "± 1489",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8121603,
            "range": "± 48287",
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
            "value": 14938,
            "range": "± 49",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 242044,
            "range": "± 4754",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21074,
            "range": "± 59",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 143339,
            "range": "± 1100",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1339548,
            "range": "± 59888",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "cb1111018d8f9946a409a8bc705c5e35e6f00367",
          "message": "feat(cli): add `import` as a visible alias for import-results (REQ-184, #453) (#454)\n\nDogfooding a reqif round-trip, `rivet import` (the natural inverse of `export`)\nerrored in the default build — the standard-format importer is `import-results`,\nand `import` is a separate wasm-gated custom-adapter command absent from the\ndefault build. Add `import` as a visible alias of `import-results`, gated to\nnon-wasm builds so it never collides with the wasm `import` command.\n\nConfirmed with: new import_alias_works_for_reqif test (`rivet import --format\nreqif` round-trips a project); docs_coverage 8/8; fmt + clippy --all-targets\n-D warnings clean; rivet validate PASS.\n\nImplements: REQ-184\nRefs: REQ-007\n\nCo-authored-by: Claude Opus 4.8 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-06-04T02:30:28-05:00",
          "tree_id": "bf8df4c5932fd2eba45e55237b3061f088cf420d",
          "url": "https://github.com/pulseengine/rivet/commit/cb1111018d8f9946a409a8bc705c5e35e6f00367"
        },
        "date": 1780558662667,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 48882,
            "range": "± 261",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 593170,
            "range": "± 26271",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 11606535,
            "range": "± 558049",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1182,
            "range": "± 11",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 12718,
            "range": "± 75",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 223786,
            "range": "± 1920",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 49,
            "range": "± 2",
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
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 816438,
            "range": "± 21376",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 109125,
            "range": "± 558",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1251593,
            "range": "± 10048",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 28810240,
            "range": "± 5598811",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 262044,
            "range": "± 1710",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 9303319,
            "range": "± 861705",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 669463271,
            "range": "± 12813380",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 2767,
            "range": "± 139",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 29176,
            "range": "± 271",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 446163,
            "range": "± 27041",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 35065,
            "range": "± 723",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 383802,
            "range": "± 15321",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 4425618,
            "range": "± 332339",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 531,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7277,
            "range": "± 53",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 132641,
            "range": "± 785",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 11648,
            "range": "± 87",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 82170,
            "range": "± 398",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 762752,
            "range": "± 4822",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "dedc8c1ed4ffae9e081d6a88ca6fa0deb993ceb5",
          "message": "fix(lsp): resolve cross-repo external links so VSIX doesn't flag them broken (REQ-185) (#455)\n\nUser-reported: in the VS Code extension, a `traces-to ulinc-zephyr:SWREQ-AP-007`\nlink showed \"does not exist\" and hover found nothing — though the external is\nsynced and `rivet serve` resolves it. Root cause: cmd_lsp loaded only\nconfig.sources into the salsa store, not config.externals. validate\n(ProjectContext::load) and serve compose externals into the store; the LSP\ndidn't (a diagnostic-consistency gap, #89).\n\nLoad externals via load_all_externals, prefix ids + same-external link targets\n(mirroring ProjectContext::load), feed them as a salsa ExtraArtifactSet\n(db.load_extras), and route all store/diagnostics/graph queries through the\n_with_extras variants (the designed mechanism, already used for adapter-only\nAADL artifacts). Diagnostics, hover, and definition are now external-aware.\n\nConfirmed with: new lsp_resolves_cross_repo_external_link integration test\n(real LSP subprocess; path external; no broken-link for the prefix:ID ref);\nfull lsp_integration suite 6/6; fmt + clippy --all-targets -D warnings clean;\nrivet validate PASS.\n\nImplements: REQ-185\nRefs: REQ-089, REQ-085\n\nCo-authored-by: Claude Opus 4.8 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-06-04T04:24:47-05:00",
          "tree_id": "86bba47c0c9502c6e7b3e48f18318b31a47829db",
          "url": "https://github.com/pulseengine/rivet/commit/dedc8c1ed4ffae9e081d6a88ca6fa0deb993ceb5"
        },
        "date": 1780565600602,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 78786,
            "range": "± 460",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 946822,
            "range": "± 2774",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13443822,
            "range": "± 563742",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1718,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 19510,
            "range": "± 98",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 364549,
            "range": "± 679",
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
            "value": 1361454,
            "range": "± 32181",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 159386,
            "range": "± 758",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1827649,
            "range": "± 24863",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 28684339,
            "range": "± 2353693",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 417003,
            "range": "± 2575",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 15155383,
            "range": "± 223676",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1094486677,
            "range": "± 5365535",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3937,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 40636,
            "range": "± 194",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 782117,
            "range": "± 15866",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 53089,
            "range": "± 752",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 597102,
            "range": "± 3452",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 6838760,
            "range": "± 197060",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 899,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 11720,
            "range": "± 26",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 309365,
            "range": "± 1841",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 20393,
            "range": "± 81",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 140146,
            "range": "± 637",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1310398,
            "range": "± 11834",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "fe908743b7ff0b83837534d63101cb25cc24aa20",
          "message": "docs(artifacts): file REQ-186 — CLI minimal-build feature (validate without serve+MCP+LSP) (#457)\n\nDogfooding friction finding (issue #456): rivet-cli has no minimal build —\n`[features]` is only `default = []` + `wasm`, while axum/tower-http/rmcp\n(streamable-HTTP MCP server)/lsp-server/lsp-types/notify are unconditional\ndeps. So every from-source build (`cargo install rivet`, CI compile, local\n`cargo build` to test a validate change) compiles the whole web+MCP+LSP tree\neven though validate/list never use it. rivet-core already gates its heavy\ndeps; the CLI does not.\n\nFiled draft: the fix is additive (serve/mcp/lsp cargo features kept in\n`default`, `#[cfg]`-gated handlers; `--no-default-features` = fast minimal\nbuild), but the default feature set is a distribution-semantics call for the\nmaintainer, so implementation is deferred rather than decided unilaterally.\n\nVerified the pre-commit hook itself uses the installed `rivet` (RIVET_BIN:-rivet)\nand does NOT rebuild — corrected an overstated impact claim in both the REQ and\nissue #456 for accuracy.\n\nConfirmed with: rivet validate → PASS (234 pre-existing coverage warnings).\n\nRefs: REQ-186, REQ-007",
          "timestamp": "2026-06-04T05:43:36-05:00",
          "tree_id": "74bbbe38881c4978a00faf42a9699f9c960ea052",
          "url": "https://github.com/pulseengine/rivet/commit/fe908743b7ff0b83837534d63101cb25cc24aa20"
        },
        "date": 1780570351493,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84296,
            "range": "± 318",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 918550,
            "range": "± 13474",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 18635673,
            "range": "± 980612",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1959,
            "range": "± 12",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24951,
            "range": "± 102",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 366196,
            "range": "± 3378",
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
            "value": 1445010,
            "range": "± 17208",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 166326,
            "range": "± 897",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1943673,
            "range": "± 63800",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 38679925,
            "range": "± 2684407",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 439678,
            "range": "± 4185",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 16887359,
            "range": "± 184908",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1314313433,
            "range": "± 17147612",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4206,
            "range": "± 23",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 44122,
            "range": "± 622",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 721960,
            "range": "± 7458",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 63825,
            "range": "± 963",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 710408,
            "range": "± 6444",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7990736,
            "range": "± 123056",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1272,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14990,
            "range": "± 154",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 230187,
            "range": "± 1682",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 20881,
            "range": "± 102",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 142742,
            "range": "± 866",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1338185,
            "range": "± 40553",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "b3761956720fe589b6c474ffa4053865fb0a5297",
          "message": "feat(cli): rivet query accepts the s-expression as a positional shorthand (REQ-187) (#458)\n\nDogfooding friction: `rivet query '(= type \"requirement\")'` — the natural form\nan agent or human types — errored with \"unexpected argument\", because `query`\nonly accepted the filter via the required `--sexpr` flag. The sibling `next-id`\nalready established the positional-shorthand pattern (`rivet next-id requirement`\nworks via an optional positional that defers to the explicit flag); `query`, the\nsingle most-used agent-facing command, lacked it.\n\nFix (additive): add an optional positional SEXPR to the `query` clap struct and\nmake `--sexpr` optional. The explicit `--sexpr` flag wins if both are given; a\nclear, example-bearing error is raised if neither is supplied. `--sexpr` keeps\nworking unchanged, so MCP/docs/scripts are unaffected.\n\nTests (sexpr_filter_integration): positional form works without the flag;\npositional and `--sexpr` yield identical matches (single-match filter to avoid\nthe #415 ordering/limit nondeterminism); no-filter exits non-zero with an\ns-expression hint.\n\nConfirmed with: cargo test -p rivet-cli --test sexpr_filter_integration (9/9),\ncargo fmt --check, cargo clippy --all-targets -- -D warnings (exit 0; only the\npre-existing clippy.toml/Cargo.toml MSRV-mismatch config warning), and\n`rivet validate` PASS. Manually verified positional + --sexpr + no-arg paths\nwith the freshly built binary.\n\nImplements: REQ-187\nVerifies: REQ-187\nRefs: REQ-007",
          "timestamp": "2026-06-04T06:14:40-05:00",
          "tree_id": "7c179eaf85d8dc858a73b7523b74c54aa12fac18",
          "url": "https://github.com/pulseengine/rivet/commit/b3761956720fe589b6c474ffa4053865fb0a5297"
        },
        "date": 1780572269198,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85335,
            "range": "± 661",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 936640,
            "range": "± 17568",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 16606985,
            "range": "± 1443772",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1981,
            "range": "± 53",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24815,
            "range": "± 61",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 366740,
            "range": "± 4251",
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
            "value": 1436452,
            "range": "± 16001",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 167305,
            "range": "± 4917",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1963946,
            "range": "± 12203",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 42344653,
            "range": "± 4466056",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 432324,
            "range": "± 7882",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 16792938,
            "range": "± 126100",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1317127420,
            "range": "± 27860556",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4110,
            "range": "± 15",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 43440,
            "range": "± 128",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 724161,
            "range": "± 9132",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 58805,
            "range": "± 281",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 710873,
            "range": "± 25194",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 10665716,
            "range": "± 928672",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1367,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14768,
            "range": "± 41",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 235345,
            "range": "± 3214",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 20750,
            "range": "± 54",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 142306,
            "range": "± 346",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1339648,
            "range": "± 32058",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "10fcca9dc5dd79e5990b5e981aab5515bb383673",
          "message": "feat(cli): positional link/unlink target + accurate init/modify help (REQ-188) (#459)\n\nDogfooding pass over agent-facing commands surfaced three verified friction\npoints on main:\n\n1. `rivet link <source> <target> --type <t>` — the natural ordered-pair form —\n   errored \"unexpected argument\", because target was a required `--target` flag\n   (same class as the query/next-id positional gaps). Added an optional\n   positional TARGET to link AND unlink; the `--target` flag still works and\n   wins if both are given; a clear error is raised if neither is supplied.\n2. `rivet init --help` showed two duplicated, contradictory `--preset` doc lines\n   that clap concatenated into a stutter AND that omitted 5 of the 14 presets\n   resolve_preset accepts. Replaced with one accurate line (all 14 presets).\n3. `rivet modify --help` stuttered \"Modify an existing artifact Modify an\n   existing artifact (...)\" — collapsed the duplicated summary doc-comment.\n\nTests (cli_commands): link positional parsed (not a clap error); link no-target\nerrors; init --help lists every preset; modify --help has no duplicated summary.\n\nConfirmed with: cargo test -p rivet-cli --test cli_commands (4 new, all pass),\ncargo fmt --check, cargo clippy --all-targets -- -D warnings (exit 0; only the\npre-existing clippy.toml/Cargo.toml MSRV-mismatch warning), rivet validate PASS.\nManually verified `rivet link REQ-001 REQ-002 --type traces-to` (positional)\ncreates the real link (get REQ-001 shows `traces-to -> REQ-002`).\n\nImplements: REQ-188\nVerifies: REQ-188\nRefs: REQ-007",
          "timestamp": "2026-06-04T07:15:41-05:00",
          "tree_id": "049218dbae790b737d6a2ef87da85b0d2f851a91",
          "url": "https://github.com/pulseengine/rivet/commit/10fcca9dc5dd79e5990b5e981aab5515bb383673"
        },
        "date": 1780575960311,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84717,
            "range": "± 349",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 892790,
            "range": "± 14234",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 16339407,
            "range": "± 1262126",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2200,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 27155,
            "range": "± 109",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 386063,
            "range": "± 4155",
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
            "value": 1484076,
            "range": "± 24625",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 167835,
            "range": "± 3564",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1930668,
            "range": "± 20803",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 30904818,
            "range": "± 1112345",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 449977,
            "range": "± 12778",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 16814523,
            "range": "± 705712",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1419220910,
            "range": "± 15337551",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4382,
            "range": "± 33",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60350,
            "range": "± 490",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 747332,
            "range": "± 6497",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 63288,
            "range": "± 372",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 683410,
            "range": "± 3371",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7518949,
            "range": "± 302690",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1192,
            "range": "± 53",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15042,
            "range": "± 77",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 323328,
            "range": "± 4201",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23063,
            "range": "± 110",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 157509,
            "range": "± 955",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1453284,
            "range": "± 17183",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "daf676bbe4fe9490eb728baa4da8e79393ce6a49",
          "message": "feat(cli): query --format json carries `command` envelope + ships query-output schema (REQ-189) (#460)\n\nDogfooding JSON-output consistency pass: every machine-readable command output\ncarries a top-level `command` field (validate, get, list, stats, coverage,\nsupplier), and list/stats/coverage/validate each ship a registered\n`schemas/json/*-output.schema.json` surfaced via `rivet schema list-json`/\n`get-json`. `rivet query --format json` — a primary agent command with the same\nartifact-collection shape as `list` — was the lone exception: no `command`\nfield and no published output schema. An agent (or JSON-schema consumer) keying\noff `command` found query anomalous.\n\nFix (additive): emit `\"command\": \"query\"` in the query JSON envelope; add\n`schemas/json/query-output.schema.json` (mirrors list-output, plus query's\nfilter/total/truncated and array-valued links); register it in\nJSON_SCHEMA_REGISTRY so `schema list-json`/`get-json query` work.\n\nTests (cli_commands): query_json_output_has_command_envelope (command=query +\nrequired keys); extended schema_get_json / schema_list_json coverage to include\nquery.\n\nConfirmed with: cargo test -p rivet-cli --test cli_commands (3 incl. new, pass),\ncargo fmt --check, cargo clippy --all-targets -- -D warnings (exit 0; only the\npre-existing MSRV-mismatch warning), rivet validate PASS. Manually verified\n`query --sexpr ... --format json` now has command=\"query\", `schema get-json\nquery` resolves to the schema file, and `schema list-json` lists query.\n\nImplements: REQ-189\nVerifies: REQ-189\nRefs: REQ-007",
          "timestamp": "2026-06-04T08:19:19-05:00",
          "tree_id": "5cf58a16e267ae54b14031f621f241874a0d0026",
          "url": "https://github.com/pulseengine/rivet/commit/daf676bbe4fe9490eb728baa4da8e79393ce6a49"
        },
        "date": 1780579822301,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 86229,
            "range": "± 275",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 933663,
            "range": "± 6526",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 17030701,
            "range": "± 1611146",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1912,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25030,
            "range": "± 46",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 362851,
            "range": "± 2344",
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
            "value": 98,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1438892,
            "range": "± 24520",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 167001,
            "range": "± 588",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1932615,
            "range": "± 40199",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 34614861,
            "range": "± 3485566",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 443744,
            "range": "± 5119",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 17198157,
            "range": "± 292786",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1321170984,
            "range": "± 12098467",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4125,
            "range": "± 52",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 43837,
            "range": "± 459",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 724147,
            "range": "± 26629",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 63442,
            "range": "± 437",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 728177,
            "range": "± 11410",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 9324568,
            "range": "± 566066",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1311,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15080,
            "range": "± 157",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 240003,
            "range": "± 4127",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 20959,
            "range": "± 255",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 143963,
            "range": "± 516",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1352184,
            "range": "± 15637",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
      }
    ]
  }
}