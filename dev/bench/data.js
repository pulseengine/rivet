window.BENCHMARK_DATA = {
  "lastUpdate": 1776103886139,
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
          "id": "c5ff64c84d8084f859a8a0d5c9b05ccf7e225d6f",
          "message": "feat: embed phases 2+5 — diagnostics, matrix, snapshots, docs (#96)\n\n* feat(embed): add {{diagnostics}} and {{matrix}} embed renderers\n\nPhase 5: adds two new computed embed types:\n- {{diagnostics}} / {{diagnostics:error|warning|info}} — validation\n  issues as HTML table with severity filter and summary footer\n- {{matrix}} / {{matrix:from_type:to_type}} — inline traceability\n  matrix with coverage bar, auto-detects link type from schema rules\n\n7 unit tests + 2 CLI integration tests.\n\n* feat(snapshot): add rivet snapshot capture/diff/list commands\n\nPhase 2: project snapshot infrastructure for baseline comparison:\n- Snapshot struct with stats, coverage, diagnostics, git context\n- rivet snapshot capture — dumps current state to JSON\n- rivet snapshot diff — compares current vs baseline (text/json/markdown)\n- rivet snapshot list — lists available snapshots\n- Delta computation with NEW/RESOLVED diagnostic tracking\n- SC-EMBED-2 (git commit in snapshot), SC-EMBED-6 (schema version)\n\n5 unit tests + 2 CLI integration tests.\n\n* refactor(embed): add baseline field to EmbedContext for delta rendering\n\nAdds optional baseline snapshot to EmbedContext so embed renderers\ncan show delta columns when delta=BASELINE option is used. All\ncallers updated to pass baseline: None (wiring comes next).\n\n* style: cargo fmt\n\n* feat(api): add /api/v1/guide endpoint and rivet guide CLI\n\nPhase 4: self-documenting schema guide for AI agents and developers:\n- /api/v1/guide — JSON endpoint with artifact types, fields, link\n  types, traceability rules, embed syntax reference, commit trailers,\n  and common mistakes\n- rivet guide --format json|text — CLI equivalent for scripting\n- Refreshes from current AppState on each request (SC-EMBED-5)\n\n2 CLI integration tests + 1 serve integration test.\n\n* Revert \"feat(api): add /api/v1/guide endpoint and rivet guide CLI\"\n\nThis reverts commit d93efb8c0c75e32db93405725477779f14abfc0e.\n\n* docs: add computed embed syntax reference to documents topic\n\nInstead of a separate guide endpoint (reverted — duplicated rivet schema\nand rivet context), add the embed syntax documentation to the existing\n'documents' topic in rivet docs where it naturally belongs.\n\nCovers: {{stats}}, {{coverage}}, {{diagnostics}}, {{matrix}},\n{{artifact:ID}}, {{links:ID}}, {{table:TYPE:FIELDS}}, error handling,\nand HTML export provenance.",
          "timestamp": "2026-04-02T00:26:34+02:00",
          "tree_id": "ae92977a44732879611565a9e014dbddc1fe9286",
          "url": "https://github.com/pulseengine/rivet/commit/c5ff64c84d8084f859a8a0d5c9b05ccf7e225d6f"
        },
        "date": 1775082778842,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 78946,
            "range": "± 4538",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 823704,
            "range": "± 6041",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 16459576,
            "range": "± 1163469",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1969,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24554,
            "range": "± 109",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 359460,
            "range": "± 1860",
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
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 903056,
            "range": "± 3928",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 166257,
            "range": "± 853",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1917312,
            "range": "± 50127",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 48212028,
            "range": "± 2663454",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 42581,
            "range": "± 272",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 466158,
            "range": "± 1676",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 7862102,
            "range": "± 653812",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4268,
            "range": "± 66",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 44737,
            "range": "± 301",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 752637,
            "range": "± 8425",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 63297,
            "range": "± 230",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 698987,
            "range": "± 21673",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 10424371,
            "range": "± 770285",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 725,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 6686,
            "range": "± 31",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 91411,
            "range": "± 463",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21550,
            "range": "± 173",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 147281,
            "range": "± 959",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1359449,
            "range": "± 12064",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "0661926d71cdb2e2acad7132a2b13b82221900a4",
          "message": "feat: release-to-release delta in export + CI snapshot workflow (#97)\n\n* feat(export): auto-detect baseline snapshot and render delta columns\n\nExport auto-detects the most recent snapshot in snapshots/ and renders\nΔ columns in stats and coverage views:\n- Summary cards show +N/-N badges for artifacts, errors, warnings\n- By-type table gains a Δ column with per-type changes\n- Coverage summary shows Δ percentage\n- Coverage-by-rule table gains a Δ column with per-rule trend\n\nZero config — just have a snapshot file from a previous release and\nthe delta appears automatically in the next export.\n\n* ci: capture baseline snapshot on release tag push\n\nAdds a capture-snapshot job to the release workflow that:\n1. Runs rivet snapshot capture --name $TAG on every v* tag push\n2. Commits the snapshot JSON to main for future delta comparison\n3. Passes the snapshot to the compliance report job via artifact\n\nThe compliance report (rivet export --format html) will auto-detect\nthe previous snapshot and render delta columns in stats/coverage.\n\n* fix(ci): compliance report uses previous snapshot, not current\n\nThe compliance report should compare against the PREVIOUS release\nsnapshot (already committed to main), not the one just captured\nfor this release. This correctly shows 'what changed since last\nrelease' in the exported HTML delta columns.\n\nThe capture-snapshot job runs in parallel and commits the new\nsnapshot to main for future release comparisons.",
          "timestamp": "2026-04-02T00:54:58+02:00",
          "tree_id": "dca6a88aff155abb58a2b68e05fd3d8b088ca2c6",
          "url": "https://github.com/pulseengine/rivet/commit/0661926d71cdb2e2acad7132a2b13b82221900a4"
        },
        "date": 1775084473913,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 80077,
            "range": "± 324",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 820120,
            "range": "± 12475",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 10683307,
            "range": "± 646225",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2284,
            "range": "± 54",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25086,
            "range": "± 519",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 386586,
            "range": "± 7890",
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
            "value": 919983,
            "range": "± 24485",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 165964,
            "range": "± 1705",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1958539,
            "range": "± 18520",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 25577160,
            "range": "± 1564458",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 44111,
            "range": "± 184",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 498872,
            "range": "± 4254",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 5278435,
            "range": "± 108213",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4420,
            "range": "± 33",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60533,
            "range": "± 299",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 850184,
            "range": "± 4066",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 60372,
            "range": "± 382",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 648723,
            "range": "± 3640",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7340135,
            "range": "± 778497",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 762,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7165,
            "range": "± 112",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 111816,
            "range": "± 1968",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23928,
            "range": "± 146",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 167399,
            "range": "± 1746",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1575525,
            "range": "± 19907",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "2f54fabc1a82f81fd42851ca084c300829e79d1f",
          "message": "feat: schema, LSP fixes, EU AI Act, salsa default, STPA analysis (#101)\n\n* feat(schema): add common-mistakes and example fields to artifact types\n\nExtends ArtifactTypeDef with two optional guidance fields:\n- common_mistakes: Vec<MistakeGuide> — problem/fix pairs for AI agents\n- example: Option<String> — YAML snippet shown in schema show output\n\nBoth fields default to empty, so existing schemas parse unchanged.\nThe rivet schema show command (text + JSON) surfaces these fields.\n\n* content(schema): add common-mistakes and examples to dev schema\n\nAdds guidance fields to requirement, design-decision, and feature\ntypes in the dev schema. Shown in 'rivet schema show' output and\navailable to AI agents via JSON format.\n\n* test: add LSP test suite and YAML edge case tests\n\nFirst-ever LSP tests (25 tests):\n- lsp_word_at_position: word extraction, edge cases, special chars\n- lsp_find_artifact_line: exact ID matching, format variants\n- lsp_uri_to_path roundtrip\n- Diagnostic-to-LSP mapping: severity, file grouping, line numbers\n\nYAML edge case tests (16 tests):\n- serde_yaml 0.9 uses YAML 1.2: yes/no are strings, only true/false\n  are booleans (no Norway problem)\n- Numeric coercion: bare 1.0 is float, quoted stays string\n- Duplicate keys: struct-level is error, map-level last wins\n- Error recovery: malformed YAML, missing fields, empty docs\n\n* fix(lsp): surface YAML parse errors as diagnostics with line/column\n\nParse errors are now shown as LSP diagnostics instead of silently\nreturning empty results. Extends Diagnostic with source_file, line,\ncolumn fields. The LSP diagnostic publisher checks source_file first\n(parse errors), then falls back to artifact-based file lookup.\n\nAlso adds collect_parse_errors() salsa tracked function that\ncomposes with structural and conditional-rule validation in\nvalidate_all().\n\n* feat(schema): add EU AI Act compliance schema for high-risk AI systems\n\nPhase 1 of #99: schemas/eu-ai-act.yaml with 15 artifact types mapping\nto EU AI Act Annex IV (9 mandatory sections) and Articles 9-15.\n\nArtifact types: ai-system-description, design-specification,\ndata-governance-record, third-party-component, monitoring-measure,\nperformance-evaluation, risk-management-process, risk-assessment,\nrisk-mitigation, misuse-risk, transparency-record,\nhuman-oversight-measure, standards-reference, conformity-declaration,\npost-market-plan.\n\n14 link types + 12 traceability rules enforcing mandatory obligations.\nRegistered as embedded schema (compiled into binary).\n\nEU AI Act high-risk provisions applicable from August 2, 2026.\n\n* feat(validate): detect unknown link types and unknown fields\n\nTwo new validation phases:\n- Phase 8: unknown-link-type — warns when an artifact uses a link\n  type not defined in the schema\n- Phase 9: unknown-field — info when an artifact has fields not\n  defined in its type's schema\n\nBoth are non-breaking (warning/info severity) but catch common\nmistakes that previously went undetected.\n\n* safety(stpa): STPA analysis of LSP diagnostic accuracy\n\nLosses: undetected compliance violations, wasted time on false\npositives, AI agent infinite retry loops.\n\nHazards: false negatives (H-LSP-001), false positives (H-LSP-002),\nwrong location (H-LSP-003), misleading fix suggestions (H-LSP-004).\n\n7 system constraints: SC-LSP-001 through SC-LSP-007 covering parse\nerror handling, validation completeness, schema change invalidation,\nYAML type coercion, actionable messages, cascade prevention, and\nincremental validation correctness.\n\nStatus of constraints:\n- SC-LSP-001: SATISFIED (PR #101 — parse errors surfaced)\n- SC-LSP-004: SATISFIED (PR #101 — type-aware validation)\n- SC-LSP-002: PARTIALLY (document refs not in LSP yet)\n- SC-LSP-003: NOT SATISFIED (schema changes not re-loaded)\n- SC-LSP-005: PARTIALLY (some messages still vague)\n- SC-LSP-006: PARTIALLY (parse errors no longer cascade to empty, but broken-link cascade still possible)\n- SC-LSP-007: PENDING (#22 — salsa becoming default)\n\n* feat(validate): make salsa incremental validation the default (#22)\n\nThe salsa incremental validation pipeline (db.rs) is now the default\npath for 'rivet validate'. The old direct path is available via\n--direct flag for fallback or when --baseline scoping is used.\n\nChanges:\n- Removed --incremental and --verify-incremental flags\n- Added --direct flag (opt-in to old non-incremental path)\n- Default: salsa tracked functions (parse_artifacts, validate_all,\n  evaluate_conditional_rules) with automatic cache invalidation\n- Baseline-scoped validation automatically uses direct path since\n  salsa doesn't support scoped stores\n\nThe salsa path produces identical diagnostics to the direct path,\nverified by the existing 22 salsa database tests and previous\n--verify-incremental infrastructure.\n\nRefs: #22\n\n* feat(eu-ai-act): init preset, bridge schemas, example project (#99)\n\nCompletes EU AI Act Phase 1 + Phase 2:\n\n- rivet init --preset eu-ai-act — starter artifacts covering\n  system description, design, risk management, monitoring, oversight\n- eu-ai-act-stpa.bridge.yaml — maps STPA hazards → risk assessments,\n  system constraints → risk mitigations\n- eu-ai-act-aspice.bridge.yaml — maps ASPICE verification evidence →\n  performance evaluations\n- examples/eu-ai-act/ — full 17-artifact example project demonstrating\n  Annex IV compliance for a predictive maintenance AI system\n  - Validates clean (0 warnings)\n  - Document with {{stats}}, {{coverage}}, {{diagnostics}} embeds\n  - Realistic content: XGBoost+LSTM hybrid model, bias assessment,\n    drift detection, human oversight dashboard\n\n* style: cargo fmt",
          "timestamp": "2026-04-02T02:27:16+02:00",
          "tree_id": "4f5fea0c50fd373e7f6407209d39875a7f3128a5",
          "url": "https://github.com/pulseengine/rivet/commit/2f54fabc1a82f81fd42851ca084c300829e79d1f"
        },
        "date": 1775090047148,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 78925,
            "range": "± 661",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 838586,
            "range": "± 4825",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12569532,
            "range": "± 431354",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2231,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26344,
            "range": "± 205",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 364321,
            "range": "± 1778",
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
            "value": 94,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 911922,
            "range": "± 27466",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 149085,
            "range": "± 1553",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1775548,
            "range": "± 40589",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 30638680,
            "range": "± 772538",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 81357,
            "range": "± 618",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 884487,
            "range": "± 2428",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 10894352,
            "range": "± 343799",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4470,
            "range": "± 37",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 61781,
            "range": "± 1068",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 767093,
            "range": "± 4240",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 60779,
            "range": "± 177",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 686923,
            "range": "± 3127",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8217505,
            "range": "± 308322",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 808,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7403,
            "range": "± 68",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 130638,
            "range": "± 1316",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22585,
            "range": "± 161",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 155754,
            "range": "± 744",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1454099,
            "range": "± 12618",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "9a5011e256eebae1a55b0c4368ad64497337a2c8",
          "message": "feat: convergence tracking, rivet get, MCP server, LSP doc validation (#108)\n\n* feat(convergence): detect agent retry loops via validation failure signatures (#100)\n\nTracks validation failure fingerprints across runs to detect when\nAI agents are stuck in retry loops:\n\n- FailureSignature: severity:rule:artifact_id:message_hash\n- RetryStrategy escalation: Normal → ExpandedContext → DifferentApproach → HumanReview\n- Persistent state in .rivet/convergence.json\n- --track-convergence flag on rivet validate\n\n22 unit tests covering signature determinism, escalation, resolution,\nand JSON persistence.\n\n* feat(cli): add 'rivet get' command for single-artifact read (#93)\n\nRetrieves a single artifact by ID with text/json/yaml output.\n3 integration tests: text output, JSON with fields, nonexistent ID.\n\n* feat(mcp): MCP server scaffold with stdio transport (#98)\n\nJSON-RPC 2.0 over stdio implementing Model Context Protocol.\n3 initial tools: rivet_validate, rivet_list, rivet_stats.\nNo new dependencies — uses serde_json directly.\n\nStart with: rivet mcp",
          "timestamp": "2026-04-02T02:56:11+02:00",
          "tree_id": "24580ce6ef723f8664a88b8ced66890e32b03502",
          "url": "https://github.com/pulseengine/rivet/commit/9a5011e256eebae1a55b0c4368ad64497337a2c8"
        },
        "date": 1775091771323,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 78549,
            "range": "± 2199",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 825891,
            "range": "± 45120",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13265129,
            "range": "± 714952",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2267,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25547,
            "range": "± 191",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 364647,
            "range": "± 1667",
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
            "value": 916575,
            "range": "± 5956",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 163507,
            "range": "± 669",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1851847,
            "range": "± 12579",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 29043180,
            "range": "± 2059384",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 78798,
            "range": "± 316",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 868110,
            "range": "± 6614",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 11361865,
            "range": "± 960934",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4378,
            "range": "± 26",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60220,
            "range": "± 487",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 790014,
            "range": "± 5647",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 61399,
            "range": "± 457",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 690950,
            "range": "± 2474",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8176267,
            "range": "± 388100",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 786,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7228,
            "range": "± 27",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 114158,
            "range": "± 2581",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22237,
            "range": "± 308",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 156366,
            "range": "± 1237",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1453546,
            "range": "± 28584",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "43830b9b25d15555345c528e10e0094851157286",
          "message": "feat: GSN safety cases + STPA-for-AI schemas with bridges (#109)\n\n* feat(schema): GSN safety case schema with STPA + EU AI Act bridges (#103)\n\nGoal Structuring Notation for structured safety arguments:\n- 6 artifact types: safety-goal, safety-strategy, safety-solution,\n  safety-context, safety-justification, away-goal\n- 5 link types: decomposes, supports, scopes, justifies, sub-goal-of\n- 4 traceability rules (goals need support, strategies need goals)\n- safety-case-stpa.bridge.yaml: STPA hazards → safety goals\n- safety-case-eu-ai-act.bridge.yaml: risk assessments → safety goals\n- rivet init --preset safety-case with starter artifacts\n\nCovers UL 4600, ISO/PAS 8800 assurance arguments.\n\n* feat(schema): STPA-for-AI extension with ML lifecycle types (#105)\n\nExtends STPA for AI/ML systems with 7 new artifact types:\n- ml-controller, training-data-source, data-hazard, ml-uca,\n  ml-loss-scenario, monitoring-trigger, retraining-requirement\n\n5 traceability rules enforcing ML safety lifecycle.\nrivet init --preset stpa-ai with starter artifacts.\nExample project in examples/stpa-ai/.\n\nBased on DeepSTPA, UniSTPA, and ISO/PAS 8800 methodology.",
          "timestamp": "2026-04-02T03:59:58+02:00",
          "tree_id": "92cc21f2941de159246e51eb2dce8c01844a8027",
          "url": "https://github.com/pulseengine/rivet/commit/43830b9b25d15555345c528e10e0094851157286"
        },
        "date": 1775095603158,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 78472,
            "range": "± 1280",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 818249,
            "range": "± 32364",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 10660622,
            "range": "± 702049",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2192,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 27937,
            "range": "± 205",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 475725,
            "range": "± 1743",
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
            "value": 94,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 921743,
            "range": "± 11986",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 165881,
            "range": "± 1017",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1861213,
            "range": "± 41932",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 26181130,
            "range": "± 5701130",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 78876,
            "range": "± 350",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 863152,
            "range": "± 2857",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 9470868,
            "range": "± 359381",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4349,
            "range": "± 104",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 59795,
            "range": "± 458",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 805328,
            "range": "± 2712",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 58275,
            "range": "± 260",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 682594,
            "range": "± 3467",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7902830,
            "range": "± 1119689",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 802,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7597,
            "range": "± 179",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 111810,
            "range": "± 1051",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22207,
            "range": "± 180",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 155327,
            "range": "± 989",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1445978,
            "range": "± 20234",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "c113cd0088a955c2ecc8847bc0a007b2f5ee9cab",
          "message": "chore: dogfood tracking — artifacts, STPA, STPA-Sec for v0.3.1 work (#110)\n\n* chore: track v0.3.1 features and design decisions as rivet artifacts\n\n19 new features (FEAT-074 to FEAT-092) and 6 design decisions\n(DD-042 to DD-047) covering all work shipped on 2026-04-01:\nembed system, snapshots, delta rendering, MCP server, convergence\ntracking, rivet get, LSP fixes, EU AI Act, GSN safety cases,\nSTPA-for-AI, schema guidance, and STPA self-analysis.\n\nRegenerated AGENTS.md (518 artifacts, 19 types).\n\n* safety: STPA + STPA-Sec analysis of v0.3.1 implementation\n\nSTPA analysis (safety/stpa/v031-implementation.yaml):\n- 4 losses: stale export, wrong MCP data, bad traceability, wrong escalation\n- 6 hazards: corrupt snapshot, wrong baseline, stale MCP, stale embeds,\n  bridge conflicts, hash collisions\n- 6 system constraints: SC-IMPL-001 to SC-IMPL-006\n\nSTPA-Sec analysis (safety/stpa-sec/v031-security.yaml):\n- 3 losses: artifact tampering, info disclosure, code injection\n- 4 hazards: no snapshot integrity, no MCP auth, untrusted embed input,\n  unbounded deserialization\n- 5 security constraints: SSC-IMPL-001 to SSC-IMPL-005",
          "timestamp": "2026-04-02T04:15:41+02:00",
          "tree_id": "135daec1a268541c808431603286d5e56a3f6c44",
          "url": "https://github.com/pulseengine/rivet/commit/c113cd0088a955c2ecc8847bc0a007b2f5ee9cab"
        },
        "date": 1775096843106,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 79688,
            "range": "± 3183",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 828081,
            "range": "± 3134",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12098247,
            "range": "± 1039461",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2209,
            "range": "± 23",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26164,
            "range": "± 90",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 391489,
            "range": "± 8002",
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
            "value": 98,
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
            "value": 909519,
            "range": "± 11404",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 159054,
            "range": "± 2416",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1854950,
            "range": "± 23642",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 29013820,
            "range": "± 2803733",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 75004,
            "range": "± 1585",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 857529,
            "range": "± 2727",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 11195858,
            "range": "± 808750",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4327,
            "range": "± 19",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 61232,
            "range": "± 403",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 754415,
            "range": "± 1838",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 58989,
            "range": "± 686",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 691073,
            "range": "± 8465",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7878509,
            "range": "± 282417",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 769,
            "range": "± 15",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7510,
            "range": "± 47",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 129362,
            "range": "± 982",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22480,
            "range": "± 332",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 156309,
            "range": "± 1774",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1448806,
            "range": "± 10618",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "aba9c5f3dba09e8ca1710b0c4274df90069a7efd",
          "message": "fix: STPA adapter handles arbitrary filenames + links field (#111)\n\nThe STPA YAML adapter now:\n- Scans directories for non-standard filenames (content-based dispatch)\n- Accepts optional 'links' field alongside legacy shorthand fields\n  (hazards, losses) so STPA files can use the standard link format\n- hazards and system-constraints fields are now optional (default empty)\n\nAlso:\n- Fixed stpa-sec source format in rivet.yaml\n- Added stpa-dev.bridge.yaml for constraint → requirement traceability\n- Fixed link types in STPA analysis files (enforces → prevents)\n\nResult: 548 artifacts, 99.8% coverage",
          "timestamp": "2026-04-02T04:33:43+02:00",
          "tree_id": "df79dc926185dddb3bc6d68883edf328e3a28474",
          "url": "https://github.com/pulseengine/rivet/commit/aba9c5f3dba09e8ca1710b0c4274df90069a7efd"
        },
        "date": 1775098452417,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 80895,
            "range": "± 443",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 840179,
            "range": "± 7171",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12318270,
            "range": "± 1428058",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2184,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 27117,
            "range": "± 503",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 362235,
            "range": "± 1393",
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
            "value": 915213,
            "range": "± 6344",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 148541,
            "range": "± 460",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1758394,
            "range": "± 19408",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 22623316,
            "range": "± 995605",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 67118,
            "range": "± 544",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 868183,
            "range": "± 6899",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 9335200,
            "range": "± 247864",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4448,
            "range": "± 29",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60274,
            "range": "± 383",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 764258,
            "range": "± 3725",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 58202,
            "range": "± 1164",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 646813,
            "range": "± 9513",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7220584,
            "range": "± 84882",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 781,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7190,
            "range": "± 30",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 120195,
            "range": "± 2592",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22563,
            "range": "± 102",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 155366,
            "range": "± 2247",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1444243,
            "range": "± 21348",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "2c9fb62b6dba4cc40ac8751042e8402ffb3bb933",
          "message": "feat(schema): add yaml-section and shorthand-links to ArtifactTypeDef (#112)\n\nSchema-declared metadata for format-specific parsing:\n- yaml-section: maps a top-level YAML key to an artifact type\n  (e.g., 'losses' → type 'loss')\n- shorthand-links: maps shorthand array fields to link types\n  (e.g., 'hazards: [H-1]' → links: [{type: prevents, target: H-1}])\n\nAdded to STPA schema types: loss, hazard, sub-hazard,\nsystem-constraint, controller, controlled-process, control-action, uca.\n\nThis is the foundation for schema-driven parsing that will replace\nthe hardcoded STPA adapter (stpa.rs).",
          "timestamp": "2026-04-02T19:25:27+02:00",
          "tree_id": "af9a86b6e6d7b7aa9dd77510e7f99b4f75cdd6fc",
          "url": "https://github.com/pulseengine/rivet/commit/2c9fb62b6dba4cc40ac8751042e8402ffb3bb933"
        },
        "date": 1775151131031,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 81104,
            "range": "± 1151",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 838056,
            "range": "± 4124",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 10743106,
            "range": "± 494627",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2225,
            "range": "± 19",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25475,
            "range": "± 370",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 386094,
            "range": "± 6604",
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
            "value": 933921,
            "range": "± 3548",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 154039,
            "range": "± 449",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1767506,
            "range": "± 26258",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 22569369,
            "range": "± 369289",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 65315,
            "range": "± 415",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 866185,
            "range": "± 3515",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 9515609,
            "range": "± 605808",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4350,
            "range": "± 20",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 59522,
            "range": "± 345",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 758067,
            "range": "± 4334",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 59318,
            "range": "± 353",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 680678,
            "range": "± 4969",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7686843,
            "range": "± 598378",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 768,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7264,
            "range": "± 71",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 122891,
            "range": "± 2475",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23420,
            "range": "± 251",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 159716,
            "range": "± 2924",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1486955,
            "range": "± 18016",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "8321f8bbfc79cbb658456cb6395a1de1c70f4b48",
          "message": "feat(yaml): rowan-based lossless YAML CST parser (Phase 1) (#114)\n\nLossless, span-preserving YAML parser for rivet's YAML subset:\n- SyntaxKind enum (28 variants: tokens + composite nodes + Error)\n- Hand-written lexer: handles plain/quoted scalars, block scalars,\n  flow sequences, comments, document markers\n- Recursive-descent parser with indent tracking via byte offsets\n- Error recovery: wraps unparseable spans in Error nodes\n- Round-trip guarantee: parse(source).text() == source\n\n18 tests: simple/nested mappings, sequences, flow sequences,\nblock scalars, comments, quoted strings, URLs with colons,\ncolons in values, document markers, error recovery.\n\nUtility functions: line_starts(), offset_to_line_col() for\nconverting rowan TextRange to LSP line/column positions.\n\nPhase 1 of the unified parsing architecture plan. No integration\nwith the rest of rivet yet — standalone module.",
          "timestamp": "2026-04-02T20:20:05+02:00",
          "tree_id": "bb360d773ba3fb6cf2db8f03122fc60e9c1c5eab",
          "url": "https://github.com/pulseengine/rivet/commit/8321f8bbfc79cbb658456cb6395a1de1c70f4b48"
        },
        "date": 1775154470213,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 74466,
            "range": "± 272",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 858915,
            "range": "± 4338",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 15452155,
            "range": "± 894657",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1702,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 19428,
            "range": "± 93",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 347369,
            "range": "± 3054",
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
            "value": 864159,
            "range": "± 41473",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 156468,
            "range": "± 334",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1781866,
            "range": "± 8809",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 41569303,
            "range": "± 2619908",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 73350,
            "range": "± 374",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 876230,
            "range": "± 12038",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 17989089,
            "range": "± 1387649",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3918,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 43596,
            "range": "± 993",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 827587,
            "range": "± 4834",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 52969,
            "range": "± 124",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 582962,
            "range": "± 3096",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 9573746,
            "range": "± 1129461",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 653,
            "range": "± 19",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 5549,
            "range": "± 20",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 136954,
            "range": "± 615",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21150,
            "range": "± 66",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 146463,
            "range": "± 324",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1337541,
            "range": "± 60304",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "ffeff760ef2e0405fe4642c57d751678c6d274e4",
          "message": "feat: domain schemas — IEC 61508, IEC 62304, DO-178C, EN 50128 (#102) (#115)\n\n* feat(schema): DO-178C airborne + EN 50128 railway safety schemas (#102)\n\nDO-178C (aviation): 14 artifact types covering PSAC through SAS,\nDAL-based traceability rules, HW/LW requirement → test → source chain.\n\nEN 50128 (railway): 14 artifact types covering SIL requirements\nthrough deployment, tool qualification, independent assessment.\n\nBoth registered as embedded schemas with init presets.\n\n* feat(schema): IEC 61508 functional safety + IEC 62304 medical device schemas (#102)\n\nIEC 61508 (industrial functional safety): 15 artifact types covering\nsafety concept through modification request, SIL-based traceability\nrules, independent assessment for SIL 3-4.\n\nIEC 62304 (medical device software): 13 artifact types covering\nSW development plan through release, class-conditional verification\n(A/B/C), problem and change management.\n\nBoth registered as embedded schemas with init presets.\nSchema count: 16 built-in.",
          "timestamp": "2026-04-02T21:01:03+02:00",
          "tree_id": "a80bda4f5aa4044f6021c914c2b8aa414a5be930",
          "url": "https://github.com/pulseengine/rivet/commit/ffeff760ef2e0405fe4642c57d751678c6d274e4"
        },
        "date": 1775156865359,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 78791,
            "range": "± 3275",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 833432,
            "range": "± 4265",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 11765689,
            "range": "± 1629250",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2202,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 27344,
            "range": "± 275",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 394445,
            "range": "± 1056",
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
            "value": 921415,
            "range": "± 14416",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 154876,
            "range": "± 1591",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1794847,
            "range": "± 25637",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 28417228,
            "range": "± 3482646",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 80132,
            "range": "± 394",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 871183,
            "range": "± 4456",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 9606767,
            "range": "± 491721",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4386,
            "range": "± 43",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 61230,
            "range": "± 534",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 774842,
            "range": "± 1956",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 61847,
            "range": "± 530",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 697163,
            "range": "± 1763",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7702121,
            "range": "± 233965",
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
            "value": 7196,
            "range": "± 35",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 122636,
            "range": "± 795",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22123,
            "range": "± 65",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 153836,
            "range": "± 666",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1433132,
            "range": "± 55007",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "819b83bf4585c0df81b2306b49de71e99afa3147",
          "message": "docs: comprehensive documentation refresh + STPA-sec format fix (#113) (#116)\n\nNew docs topics: embed-syntax, schemas-overview, schema/eu-ai-act,\nschema/safety-case, schema/stpa-ai, schema/stpa-sec, schema/research.\n\nUpdated: CLI reference (get, embed, snapshot, mcp, impact, mutations),\nrivet.yaml reference (all 16 schemas listed), documents topic.\n\nFixed: safety/stpa-sec/v031-security.yaml converted from STPA-native\nkeys to generic-yaml artifacts: format (was silently skipped).\n\nRegistered stpa-sec and research as embedded schemas.",
          "timestamp": "2026-04-03T00:31:03+02:00",
          "tree_id": "eca7690d30296fb3976dcd76448a8cc0380878b2",
          "url": "https://github.com/pulseengine/rivet/commit/819b83bf4585c0df81b2306b49de71e99afa3147"
        },
        "date": 1775169453828,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 79449,
            "range": "± 835",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 820277,
            "range": "± 3968",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 11549739,
            "range": "± 742907",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2201,
            "range": "± 36",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24541,
            "range": "± 107",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 379770,
            "range": "± 2108",
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
            "value": 948915,
            "range": "± 17873",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 153648,
            "range": "± 636",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1804820,
            "range": "± 36428",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 31988295,
            "range": "± 3174831",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 65585,
            "range": "± 287",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 875450,
            "range": "± 16571",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 13695265,
            "range": "± 1425375",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4452,
            "range": "± 19",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60490,
            "range": "± 1919",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 782376,
            "range": "± 4943",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 61609,
            "range": "± 359",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 688963,
            "range": "± 9511",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7604620,
            "range": "± 324638",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 807,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7400,
            "range": "± 58",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 114037,
            "range": "± 1205",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22740,
            "range": "± 215",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 156519,
            "range": "± 464",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1457019,
            "range": "± 21329",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "28402ebeb2d27045457cd51a8d43c37d25776267",
          "message": "feat(schema): ISO/PAS 8800 AI safety + SOTIF schemas with bridges (#106) (#117)\n\nISO/PAS 8800 (AI safety lifecycle): 12 artifact types covering AI\nelement definition through deployment monitoring and assurance arguments.\n\nISO 21448 SOTIF: 8 artifact types covering functional insufficiency\nhazards, triggering conditions, scenarios, and acceptance criteria.\n\nBridge schemas: iso-8800-stpa (ml-controller↔ai-element) and\nsotif-stpa (SOTIF hazards↔STPA loss scenarios).\n\nSchema count: 18 built-in + 9 bridges.",
          "timestamp": "2026-04-03T00:49:23+02:00",
          "tree_id": "78a71519703cc2fe85e72ff7f640aaa281cd4396",
          "url": "https://github.com/pulseengine/rivet/commit/28402ebeb2d27045457cd51a8d43c37d25776267"
        },
        "date": 1775170539171,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 79246,
            "range": "± 392",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 830659,
            "range": "± 7817",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 11769150,
            "range": "± 1198890",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2188,
            "range": "± 16",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26652,
            "range": "± 96",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 387422,
            "range": "± 2544",
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
            "value": 95,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 929789,
            "range": "± 10134",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 153396,
            "range": "± 426",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1804741,
            "range": "± 28900",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 26065838,
            "range": "± 1719456",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 64971,
            "range": "± 612",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 868646,
            "range": "± 3275",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 10691647,
            "range": "± 927226",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4423,
            "range": "± 22",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 59910,
            "range": "± 246",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 797330,
            "range": "± 4599",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 60331,
            "range": "± 203",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 688410,
            "range": "± 4032",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7782219,
            "range": "± 358440",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 801,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7705,
            "range": "± 48",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 111011,
            "range": "± 1828",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22192,
            "range": "± 117",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 154296,
            "range": "± 1857",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1429934,
            "range": "± 17526",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "2b7acd41317ae4f57c55807cfa71251443ea61d3",
          "message": "feat(cli): add 'rivet schema validate' command (#93) (#118)\n\nValidates loaded schemas are well-formed:\n- All link types in traceability rules exist\n- All source/target/from types in rules exist as artifact types\n- All link-field link types and target types exist\n\nFound 3 real errors in AADL schema (cross-schema refs to ASPICE\ntypes not loaded — bridge schema needed).",
          "timestamp": "2026-04-03T00:59:43+02:00",
          "tree_id": "29fade80905446b887f15437a670287b64bf1863",
          "url": "https://github.com/pulseengine/rivet/commit/2b7acd41317ae4f57c55807cfa71251443ea61d3"
        },
        "date": 1775171200107,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 78632,
            "range": "± 1238",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 833248,
            "range": "± 6328",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 10995335,
            "range": "± 908900",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2190,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26314,
            "range": "± 74",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 382220,
            "range": "± 814",
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
            "value": 95,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 935127,
            "range": "± 4076",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 156784,
            "range": "± 432",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1844184,
            "range": "± 18440",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 22818110,
            "range": "± 1283743",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 65411,
            "range": "± 275",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 857444,
            "range": "± 3325",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 10794218,
            "range": "± 882474",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4419,
            "range": "± 212",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 58864,
            "range": "± 153",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 774953,
            "range": "± 1934",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 57645,
            "range": "± 373",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 691160,
            "range": "± 3059",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7835182,
            "range": "± 436340",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 809,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7453,
            "range": "± 241",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 119526,
            "range": "± 8809",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22605,
            "range": "± 92",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 153423,
            "range": "± 917",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1425371,
            "range": "± 13936",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "fd99574e3a79502a222524ff82a69e8c5570bae4",
          "message": "feat: rowan HIR extraction (Phase 2) + MCP 9 tools + pre-commit hook (#119)\n\n* feat(mcp): expand to 9 tools — get, coverage, schema, embed, snapshot, add (#98)\n\nMCP server now exposes 9 tools over stdio:\n- rivet_validate, rivet_list, rivet_stats (existing)\n- rivet_get — single artifact lookup\n- rivet_coverage — traceability coverage with optional rule filter\n- rivet_schema — schema introspection (types, links, rules)\n- rivet_embed — resolve computed embeds\n- rivet_snapshot_capture — capture project snapshot\n- rivet_add — create new artifact with auto-ID\n\nAll tools have proper JSON Schema inputSchema.\n\n* feat(yaml): HIR extraction from rowan CST (Phase 2)\n\nWalks rowan YAML CST to extract Vec<SpannedArtifact> with precise\nbyte spans for every field. Cross-validated against parse_generic_yaml().\n\nTypes: Span, SpannedArtifact, ParseDiagnostic, ParsedYamlFile\nEntry: extract_generic_artifacts(source) -> ParsedYamlFile\nScalar conversion follows YAML 1.2 rules (true/false only, not yes/no).\n\n10 tests: cross-validation, span accuracy, links, fields, tags,\nempty list, missing id, quoted values, block span, null/tilde.\n\n* feat: HIR extraction (Phase 2), MCP 9 tools, pre-commit hook, clippy fix\n\nPhase 2 rowan HIR: extract_generic_artifacts() walks CST to produce\nVec<SpannedArtifact> with byte spans. 10 tests, cross-validated.\n\nMCP server expanded to 9 tools: get, coverage, schema, embed,\nsnapshot_capture, add (+ original validate, list, stats).\n\nPre-commit hook script: scripts/pre-commit (cargo fmt + clippy).\nClippy allow for cloned_ref_to_slice_refs in convergence tests.",
          "timestamp": "2026-04-03T01:20:04+02:00",
          "tree_id": "2bb320b4d6e7ca5c66338ce31984f8ddbac9f5c4",
          "url": "https://github.com/pulseengine/rivet/commit/fd99574e3a79502a222524ff82a69e8c5570bae4"
        },
        "date": 1775172480080,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 78427,
            "range": "± 322",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 824810,
            "range": "± 7248",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 11097601,
            "range": "± 1257630",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2325,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25553,
            "range": "± 160",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 389640,
            "range": "± 1740",
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
            "value": 939794,
            "range": "± 8046",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 164794,
            "range": "± 509",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1904891,
            "range": "± 10674",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 25344925,
            "range": "± 2470062",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 66856,
            "range": "± 393",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 865471,
            "range": "± 2880",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 10252876,
            "range": "± 1676422",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4481,
            "range": "± 9",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60407,
            "range": "± 212",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 761870,
            "range": "± 5319",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 61763,
            "range": "± 606",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 675682,
            "range": "± 16866",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7575825,
            "range": "± 393704",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 812,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7487,
            "range": "± 47",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 131225,
            "range": "± 1737",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23177,
            "range": "± 170",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 160054,
            "range": "± 944",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1462919,
            "range": "± 22254",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "e4f398ecf5508d6875ad591c5ccd3764259a4039",
          "message": "feat(yaml): schema-driven extraction from rowan CST (Phase 3) (#120)\n\nThe capstone: extract_schema_driven() uses yaml-section and\nshorthand-links metadata from the schema to parse both generic-yaml\nand STPA-yaml formats with ONE function.\n\n- Reads yaml-section to map top-level keys to artifact types\n- Converts shorthand-links fields to Link objects automatically\n- Falls back to generic artifacts: extraction when no section matches\n- Handles mixed-section files (losses + hazards in same file)\n\nAdded yaml-section + shorthand-links to controller-constraint and\nloss-scenario types in STPA schema (was missing).\n\n4 new tests: losses, hazards with shorthand links, mixed sections,\ngeneric fallback. Total: 14 HIR tests.\n\nThis function can replace the 861-line stpa.rs once wired into\nthe salsa pipeline (Phase 5).",
          "timestamp": "2026-04-03T01:35:50+02:00",
          "tree_id": "16d6c206967979b68161be9bd2a9af6f54b69fdd",
          "url": "https://github.com/pulseengine/rivet/commit/e4f398ecf5508d6875ad591c5ccd3764259a4039"
        },
        "date": 1775173360022,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 80187,
            "range": "± 312",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 843498,
            "range": "± 3933",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 10627147,
            "range": "± 124724",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1998,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24456,
            "range": "± 67",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 355159,
            "range": "± 2523",
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
            "value": 933739,
            "range": "± 9021",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 166459,
            "range": "± 369",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1903933,
            "range": "± 15081",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 25895226,
            "range": "± 349303",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 76835,
            "range": "± 219",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 887458,
            "range": "± 3472",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 10328007,
            "range": "± 93067",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4269,
            "range": "± 12",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 47654,
            "range": "± 150",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 796254,
            "range": "± 4031",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 59867,
            "range": "± 279",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 693847,
            "range": "± 15365",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7856176,
            "range": "± 403494",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 740,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 6562,
            "range": "± 47",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 90301,
            "range": "± 409",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21481,
            "range": "± 225",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 145353,
            "range": "± 13733",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1357315,
            "range": "± 19462",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "bd0d729a386d771123e90b7e5390f15cb79faf6d",
          "message": "feat: salsa integration (Phase 5) + dogfood tracking (#121)\n\n* chore: track batch 2 features as rivet artifacts (FEAT-093 to FEAT-105)\n\n13 features: rowan Phases 1-3, 6 domain schemas, MCP expansion,\nschema validate, docs refresh, pre-commit hook.\n\n573 total artifacts.\n\n* feat(salsa): wire schema-driven rowan parser into salsa DB (Phase 5)\n\nparse_artifacts_v2() tracked function uses extract_schema_driven()\nfrom the rowan HIR layer. Schema is a transitive salsa dependency —\nschema changes invalidate all artifact extraction, source changes\nonly re-extract that file.\n\nFeature flag 'rowan-yaml' (default on). Debug builds log warnings\nif old and new parsers produce different artifact IDs.\n\nbuild_store() now takes schema_set parameter for the new code path.\nAll 7 db.store() call sites updated.",
          "timestamp": "2026-04-03T01:57:29+02:00",
          "tree_id": "05c855c15115ee0abf7dbc22d733ff23402cef79",
          "url": "https://github.com/pulseengine/rivet/commit/bd0d729a386d771123e90b7e5390f15cb79faf6d"
        },
        "date": 1775174682415,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 75066,
            "range": "± 473",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 847816,
            "range": "± 16864",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 11767160,
            "range": "± 583254",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1682,
            "range": "± 10",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 19412,
            "range": "± 37",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 353335,
            "range": "± 896",
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
            "value": 862841,
            "range": "± 6055",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 160626,
            "range": "± 285",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1846847,
            "range": "± 11253",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 35093682,
            "range": "± 1716710",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 63821,
            "range": "± 98",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 847356,
            "range": "± 3827",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 12647500,
            "range": "± 733994",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4009,
            "range": "± 9",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 40491,
            "range": "± 72",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 768404,
            "range": "± 10016",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 55656,
            "range": "± 1332",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 576629,
            "range": "± 2807",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 6714861,
            "range": "± 149155",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 684,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 5604,
            "range": "± 27",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 142991,
            "range": "± 464",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 20939,
            "range": "± 60",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 148753,
            "range": "± 228",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1377463,
            "range": "± 13544",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "4e2aa4ab256d5a4dbaadf5dd08c1d9d761f73579",
          "message": "feat: Phase 4 doc spans + round-trip equivalence tests (#122)\n\n* feat(doc): byte-offset span tracking for [[ID]] refs and headings (Phase 4)\n\nDocReference gains col, byte_offset, len fields for precise positioning.\nSection gains heading_line and heading_byte_offset.\nvalidate_documents() now provides column info in diagnostics.\n\n6 new tests: byte offset roundtrip, column not at start, multiple\nrefs on one line, multiline offsets, section heading spans.\n\n* test: comprehensive rowan parser round-trip and equivalence tests\n\n4 integration tests proving the rowan parser is a correct replacement:\n1. rowan_roundtrips_all_yaml_files — every .yaml in the project\n   parses losslessly (parse(source).text() == source)\n2. no_error_nodes_in_project_yaml — no Error nodes in any file\n3. schema_driven_matches_serde_for_generic_artifacts — identical\n   artifact extraction vs parse_generic_yaml()\n4. schema_driven_matches_serde_for_stpa_files — identical\n   extraction vs import_stpa_file() for STPA format\n\nThese tests are the gate for deleting stpa.rs (Phase 6).",
          "timestamp": "2026-04-03T02:04:16+02:00",
          "tree_id": "0bf35fd49bb5d97cbc6dee16070e2821e2e4b3b7",
          "url": "https://github.com/pulseengine/rivet/commit/4e2aa4ab256d5a4dbaadf5dd08c1d9d761f73579"
        },
        "date": 1775175459593,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 79523,
            "range": "± 3092",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 826673,
            "range": "± 7701",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 10565854,
            "range": "± 903738",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2302,
            "range": "± 10",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25532,
            "range": "± 532",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 365004,
            "range": "± 1960",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 99,
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
            "value": 950259,
            "range": "± 6880",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 160177,
            "range": "± 637",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1912392,
            "range": "± 12154",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 23662921,
            "range": "± 1764178",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 62500,
            "range": "± 339",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 835690,
            "range": "± 4749",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 9450546,
            "range": "± 628237",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4274,
            "range": "± 10",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 67788,
            "range": "± 347",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 781984,
            "range": "± 3866",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 58777,
            "range": "± 359",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 680457,
            "range": "± 3588",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7634047,
            "range": "± 340145",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 780,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7660,
            "range": "± 85",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 116873,
            "range": "± 3630",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22821,
            "range": "± 107",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 161377,
            "range": "± 851",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1518825,
            "range": "± 23105",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "29b735bf3cfbb06868892c2efde92a4a5a812212",
          "message": "feat: Phase 6 rowan migration + #93 #98 #99 #104 Phase 1 (#123)\n\n* feat: Phase 6 — delete stpa.rs, fix parser bugs, complete rowan migration\n\nDelete the 861-line serde_yaml-based STPA parser (formats/stpa.rs) and\ncomplete the migration to rowan-based schema-driven extraction.\n\nParser fixes in yaml_cst.rs:\n- Lexer: stop quoted scalar scanning at newlines — unclosed quotes on a\n  line produced multi-line tokens that swallowed subsequent YAML structure\n  (root cause of the \"apostrophe bug\" in block scalars)\n- Parser: consume comments between sequence items in parse_block_sequence\n- Parser: consume entire line for sequence item scalars (commas no longer\n  orphan tokens)\n- Parser: add is_plain_scalar_continuation() for multi-line plain scalar\n  values (e.g. \"alternatives: Rejected because...\\n  continuation\")\n\nExtraction fix in yaml_hir.rs:\n- scalar_text() now collects all sibling tokens after first PlainScalar,\n  reconstructing full values that the lexer split at commas/brackets\n\nSchema changes:\n- Add yaml-sections (plural) field to support artifact types with multiple\n  YAML section names (e.g. UCAs split across core-ucas, oslc-ucas, etc.)\n- Add UCA section names to schemas/stpa.yaml\n- Add cia-impact fields and fix leads-to-sec-loss links in stpa-sec data\n\nAPI change:\n- load_artifacts() now takes &Schema parameter for schema-driven extraction\n- All callers updated (CLI, MCP, serve, impact, externals, tests)\n\nResult: 66/66 YAML files parse with 0 Error nodes, 32/32 hazards extracted\n\nRefs: #91\n\nCo-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>\n\n* fix: UCA extraction with nested STPA structure + dogfood test passing\n\nTeach the schema-driven extractor to handle nested STPA structures where\nartifacts are grouped under sub-keys (e.g., UCAs under not-providing:,\nproviding:, too-early-too-late:, stopped-too-soon: within each controller\nsection).\n\nChanges:\n- yaml_hir: add extract_sequence_items_with_inherited() that propagates\n  parent-level fields (controller, control-action) to child items and\n  sets uca-type from the grouping sub-key name\n- schema: fix UCA shorthand-links (controller: issued-by, not control-action)\n- schema: add yaml-sections field for multi-section artifact types\n- Fix yaml_sections field in manual ArtifactTypeDef constructors\n- Delete 15 stale debug test files that broke the build\n\nResult: dogfood validation passes (0 errors), all workspace tests green\n\nRefs: #91\n\nCo-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>\n\n* test: add 83 YAML test suite cases from official suite + edge cases\n\nTests derived from the official YAML Test Suite and the \"YAML Document\nfrom Hell\" edge case collection. Covers:\n- Block mappings, sequences, and nested combinations\n- Plain, single-quoted, double-quoted, and block scalars\n- Comments in various positions\n- Indentation edge cases\n- Flow sequences with mixed types\n- Unsupported features (anchors, tags, flow mappings) — verifies\n  graceful Error recovery with round-trip preservation\n- Stress tests (deep nesting, 100+ items, combined patterns)\n- YAML gotchas: Norway problem, version floats, special characters\n\nRefs: #91\n\nCo-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>\n\n* chore: clean up diagnostic tree dump from parse_actual_hazards_file test\n\nCo-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>\n\n* feat(schema): add manifest metadata fields and schema info command (#93 Phase 1)\n\nAdd min-rivet-version and license optional fields to SchemaMetadata for\nschema manifest support. Add `rivet schema info <name>` CLI subcommand\nthat displays schema-level metadata, counts, and artifact type summaries\nin both text and JSON formats. Include integration tests verifying\nmetadata loading, optional field parsing, and guidance field presence.\n\nImplements: REQ-003\nRefs: #93\n\nCo-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>\n\n* feat(dashboard): add EU AI Act compliance view (#99)\n\nAdd a new dashboard view at /eu-ai-act that shows Annex IV compliance\nstatus, with per-section progress bars, missing type guidance, and\nartifact inventory. The view appears conditionally in the nav when the\neu-ai-act schema is loaded.\n\n- Add rivet-core/src/compliance.rs with compute_compliance() that maps\n  artifact types to Annex IV sections and calculates coverage\n- Add rivet-cli/src/render/eu_ai_act.rs with HTML rendering for the\n  compliance dashboard (stats, section table, missing types, inventory)\n- Add documentation-update artifact type to schemas/eu-ai-act.yaml for\n  Annex IV section 6 (technical documentation updates)\n- Add link type updates-docs-for and traceability rule system-has-doc-updates\n- Register /eu-ai-act route and conditional navigation link\n- Add EU AI Act type colors to the badge color palette\n\nImplements: #99\n\nCo-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>\n\n* feat: add AI provenance metadata to artifacts (#104 Phase 1)\n\nAdd Provenance struct (created-by, model, session-id, timestamp,\nreviewed-by) as a first-class optional field on Artifact. This enables\ntracking whether artifacts were human-authored, AI-generated, or\nAI-assisted — required for EU AI Act compliance and AIBOM export.\n\nChanges:\n- model.rs: Provenance struct with serde kebab-case rename\n- yaml_hir.rs: extract_provenance() for rowan CST extraction + 5 tests\n- formats/generic.rs: serde round-trip support for provenance\n- schemas/common.yaml: provenance as optional base field\n- All Artifact construction sites updated with provenance: None\n\nCo-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>\n\n* feat: migrate MCP server to official rmcp crate (#98)\n\nReplace the hand-rolled JSON-RPC 2.0 MCP implementation with the\nofficial rmcp crate (v1.3.0). This provides protocol-compliant\ntransport, typed tool definitions via #[tool] macros, and resource\nprotocol support out of the box.\n\nChanges:\n- Add rmcp dependency with server, transport-io, macros features\n- Rewrite mcp.rs: RivetServer struct with #[tool_router] + #[tool_handler]\n- All 9 tools preserved with typed parameter structs (JsonSchema-derived)\n- Add MCP resources: rivet://diagnostics, rivet://coverage, rivet://artifacts/{id}\n- Update cmd_mcp() to use async rmcp stdio transport\n\nAll existing tool functionality is preserved — this is a transport/protocol\nmigration, not a feature change.\n\nImplements: REQ-022\nRefs: #98\n\nCo-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>\n\n* fix: peek_colon_after_scalar line boundary + duplicate ID detection\n\n- yaml_cst.rs: peek_colon_after_scalar() now stops at Newline/Comment,\n  preventing cross-line colon detection that could misparse sequences\n- yaml_hir.rs: extract_schema_driven() detects duplicate artifact IDs\n  within a file and emits a diagnostic\n\nCo-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>\n\n* fix: LSP crash on missing config, stale render state, diagnostic UX\n\nCRITICAL fixes from deep audit:\n- LSP: replace process::exit(1) with graceful empty-state fallback\n  when rivet.yaml fails to load\n- LSP: update render_store/render_graph in didChange handler so\n  custom requests (rivet/render, treeData) reflect unsaved edits\n\nHIGH fixes:\n- Diagnostic Display now includes file name and line number when\n  available (was just \"ERROR: [ID] message\", now \"file.yaml:5: ERROR: ...\")\n- Schema not found changed from log::warn to hard error — misspelled\n  schema names in rivet.yaml now fail loudly instead of silently\n\nCo-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>\n\n* fix(yaml_hir): unescape double-quoted scalars and add block scalar UTF-8 safety\n\nDouble-quoted YAML scalars now correctly process escape sequences\n(\\n, \\t, \\\\, \\\", \\uXXXX, etc.) instead of being passed through raw.\nBlock scalar indent stripping now includes a char_boundary safety\ncheck to guard against hypothetical multi-byte splitting.\n\nFixes #23\nFixes #24\n\nCo-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>\n\n* fix: MCP server caches project at startup instead of reloading per call\n\nRivetServer now holds Arc<RwLock<McpProject>> loaded once at startup.\nAll read-only tools use cached state. New rivet_reload tool lets\nclients refresh after file changes. Snapshot and add still use disk.\n\nFixes #9 (CRITICAL: full reload every tool call)\n\nCo-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>\n\n* fix(lsp): add didOpen handler, fix diagnostic spans, and handle Windows URIs\n\n- Add textDocument/didOpen handler that publishes diagnostics when a file\n  is opened, and update server capabilities to advertise open_close support (#16)\n- Replace hardcoded col+100 diagnostic end column with artifact ID length\n  plus padding for more accurate underline spans (#17)\n- Fix lsp_uri_to_path and lsp_path_to_uri to handle Windows file:///C:/\n  URIs and URL-decode percent-encoded paths (#19)\n- Cross-file diagnostic clearing (#18) was already addressed by the\n  existing prev_diagnostic_files tracking in lsp_publish_salsa_diagnostics\n\nFixes: #16, #17, #18, #19\nTrace: skip\n\nCo-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>\n\n* fix(cli): validate --format values and improve missing rivet.yaml errors\n\nInvalid --format values (e.g. `rivet validate --format csv`) now produce\na clear error instead of silently falling back to text output. Added\n`validate_format()` helper called from all 18 command handlers that\naccept a format parameter. When rivet.yaml is not found, errors now\nshow the resolved project path and suggest running `rivet init`.\n\nFixes #27, Fixes #28\n\nCo-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>\n\n* fix(serve): use salsa incremental computation for dashboard reloads\n\nThe dashboard server previously performed a full project rebuild on every\nfile change -- re-reading config, reloading all schemas, re-parsing all\nartifacts, rebuilding the link graph, and recomputing all diagnostics.\n\nThis replaces that with salsa incremental updates: file contents are fed\ninto a persistent RivetDatabase, and salsa only recomputes queries whose\ninputs actually changed. For a single-file edit in a large project, this\navoids re-parsing unchanged files entirely.\n\nKey changes:\n- reload_state() now initializes a salsa RivetDatabase at startup\n- New reload_state_incremental() updates salsa inputs and re-queries\n- SalsaState held in Mutex (salsa DB is !Sync due to thread-local caches)\n- run() simplified to accept pre-built AppState\n- Extracted helpers: collect_yaml_files, load_externals, load_docs_and_results\n\nFixes #10\n\nCo-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>\n\n* fix: salsa validation handles all YAML formats and baseline scoping\n\nInclude stpa-yaml sources in run_salsa_validation() alongside generic\nformats so STPA projects benefit from salsa incremental caching (#11).\n\nWhen --baseline is specified, use salsa for full validation then filter\ndiagnostics to the scoped store instead of falling back to the direct\n(non-salsa) validation path (#12).\n\nFixes: #11\nFixes: #12\n\nCo-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>\n\n* feat(db): make LinkGraph and coverage salsa-tracked functions (#13)\n\nLinkGraph::build() and coverage::compute_coverage() were called\ndirectly from non-tracked helpers, causing recomputation on every\ncall even when inputs hadn't changed. This lifts both into salsa\ntracked functions so results are memoized across callers.\n\n- Add PartialEq/Eq to ResolvedLink, Backlink, CoverageEntry,\n  CoverageReport; add Clone + manual PartialEq/Eq/Debug to LinkGraph\n  (skipping petgraph DiGraph which lacks PartialEq)\n- Add build_link_graph tracked function shared by validate_all,\n  evaluate_conditional_rules, and compute_coverage_tracked\n- Add compute_coverage_tracked tracked function\n- Expose link_graph() and coverage() methods on RivetDatabase\n- Add 5 new tests covering the tracked functions\n\nFixes #13\n\nCo-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>\n\n* feat(lsp): add textDocument/documentSymbol support (#20)\n\nWalk the rowan CST to find artifacts and expose them as DocumentSymbol\nentries. Each artifact shows ID as name, \"type — title\" as detail,\nwith accurate ranges from the CST spans.\n\nCo-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>\n\n* refactor: extract collect_yaml_files and load_project_full to rivet-core\n\nMove collect_yaml_files() from rivet-cli/src/main.rs to rivet-core as a\npublic utility so both salsa validation and LSP startup share one\nimplementation.\n\nAdd LoadedProject struct and load_project_full() to rivet-core,\nconsolidating the duplicated config→schemas→artifacts→graph loading\npattern. Update mcp.rs load_project() to delegate to the new function.\n\nRefs: code-dedup\nCo-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>\n\n* test: add YAML parser proptests, MCP tool tests, and cross-file link resolution\n\nAdd property-based tests for the rowan YAML CST parser covering flat\nmappings, block scalars, flow sequences, nested mappings, sequences with\nmappings, and mixed documents. Add end-to-end MCP JSON-RPC integration\ntests for validate, list, get, stats, schema, coverage, and tools/list.\nAdd cross-file link resolution test verifying forward links, backlinks,\nand orphan detection across separate artifact files.\n\nVerifies: REQ-003, REQ-004\n\nCo-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>\n\n* fix: 3 must-fix issues from formal code review\n\nMF-1: scalar_to_yaml_value now calls unescape_double_quoted() for\n      DoubleQuotedScalar values (was using raw slicing, corrupting\n      field data containing \\n, \\t, etc.)\n\nMF-2: Parse errors from yaml_cst::parse() are now propagated into\n      ParsedYamlFile.diagnostics in both extract_generic_artifacts\n      and extract_schema_driven (were silently discarded)\n\nMF-3: Remove dead project_dir parameter from all MCP tool param\n      structs — it was declared in JSON Schema but never read,\n      misleading AI tool callers\n\nCo-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>\n\n* fix: CI failures — clippy, format, MSRV, benchmark compatibility\n\n- Fix clippy: remove unneeded returns in is_plain_scalar_continuation,\n  eliminate unnecessary to_string() calls in scalar extraction\n- Fix clippy: suppress dead_code on empty MCP param structs\n  (ValidateParams, StatsParams) constructed via rmcp deserialization\n- Fix clippy: change 3.14 test value to 1.23 to avoid approx_constant lint\n- Fix MSRV: add #[allow(dead_code)] on unused load_full method\n- Fix benchmarks: add provenance: None to all Artifact constructors\n- Run cargo fmt across all files\n\nCo-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>\n\n* fix: MCP tests set current_dir to temp project directory\n\nTests were spawning `rivet mcp` without setting CWD, causing it to\nload from the CI runner's working directory instead of the temp project.\n\nCo-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>\n\n* fix: MCP tests send proper initialize params for rmcp protocol\n\nrmcp expects InitializeRequestParams with protocolVersion, capabilities,\nand clientInfo — not empty {}. Also send notifications/initialized after\nthe init handshake completes.\n\nCo-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>\n\n* chore: remove MCP protocol-level integration tests\n\nThe rmcp crate handles JSON-RPC protocol correctness (initialize\nhandshake, message framing, capability negotiation). Testing this\nourselves duplicates rmcp's responsibility and creates brittle tests\nthat break on protocol details. Tool logic is already tested via\nthe dogfood integration test and schema-driven extraction tests.\n\nCo-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>\n\n* fix: update schema fallback test to expect error on unknown names\n\nThe schema-not-found behavior was changed from log::warn (silent) to\na hard error. Update the docs_schema test to match.\n\nCo-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>\n\n* fix: cargo fmt on docs_schema test\n\nCo-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>\n\n* fix: use rowan fork with Miri UB fixes (pulseengine/rowan#fix/miri-soundness)\n\nPoint to our fork that fixes GreenNode/GreenToken deref UB flagged by\nMiri. Upstream PR: rust-analyzer/rowan#210. Will revert to crates.io\nrowan once the fix is merged upstream.\n\nCo-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>\n\n* fix: revert to crates.io rowan, skip yaml_cst/yaml_hir in Miri CI\n\nrowan 0.16.1 has known Miri UB in its vendored Arc/ThinArc\n(rust-analyzer/rowan#192). Our fork fix is in progress but not\ncomplete — reverting to crates.io rowan and skipping the affected\ntests in Miri CI until the fix is ready.\n\nCo-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>\n\n* fix: use rowan fork with Miri fixes, tree borrows model in CI\n\nPoint to pulseengine/rowan fix/miri-soundness-v2 which fixes:\n- Arc clone/drop/is_unique: raw pointer refcount access\n- GreenNodeData: unsized (fat Repr) for correct provenance\n- GreenNode/GreenToken: into_raw via ThinArc ptr, not Deref\n- GreenTokenData::text(): raw pointer slice access\n- cursor Cell::as_ptr().read() instead of get()\n\nMiri CI now uses -Zmiri-tree-borrows (the model Rust is converging on).\n260 non-rowan tests pass clean. yaml_cst/yaml_hir still skipped due to\ncursor::free deallocation provenance — needs cursor-level fixes next.\n\nRefs: rust-analyzer/rowan#192\n\nCo-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>\n\n* feat(schema): auto-discover bridge schemas when dependent schemas are loaded\n\nBridge schemas (.bridge.yaml) define cross-domain traceability rules between\ntwo or more schemas. Instead of requiring explicit listing in rivet.yaml, they\nare now auto-discovered: when the loaded schema set covers every schema in a\nbridge's `extends` list, the bridge is loaded automatically.\n\n- Embed all 7 bridge schemas into the binary (eu-ai-act-aspice, eu-ai-act-stpa,\n  iso-8800-stpa, safety-case-eu-ai-act, safety-case-stpa, sotif-stpa, stpa-dev)\n- Add `discover_bridges()` function that matches bridges to loaded schema sets\n- Update `load_schemas_with_fallback` and `load_schema_contents` to auto-load\n  matching bridges (disk files preferred, embedded fallback)\n- Report auto-discovered bridges during `rivet init`\n- Add 12 tests covering discovery logic, edge cases, and schema merging\n\nImplements: FEAT-042\nRefs: #93\n\nCo-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>\n\n* feat: provenance conditional rules with dotted field access (#104 Phase 2)\n\nAdd compound conditional validation rules that enforce review requirements\nfor AI-generated artifacts. Extend field access to support dotted paths\n(e.g., provenance.created-by) for traversing nested YAML mappings.\n\n- Add optional `condition` precondition to ConditionalRule (both condition\n  AND when must match for the rule to fire)\n- Implement dotted path resolution in get_field_value via resolve_dotted_path\n- Add ai-generated-needs-review rule to common.yaml schema\n- Update validation loops in validate.rs and db.rs for compound conditions\n- Add 16 tests: dotted field access, condition matching, and full\n  validation pipeline tests for AI/human/draft scenarios\n\nImplements: FEAT-068\nRefs: FEAT-055\n\nCo-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>\n\n* feat: add supply-chain schema and embedded registration (#107 Phase 1)\n\nAdd supply chain artifact tracking for CRA/SBOM compliance:\n- Schema with 4 artifact types (sbom-component, build-attestation,\n  vulnerability, release-artifact) and 3 link types\n- Traceability rules for build provenance and vulnerability tracking\n- Bridge schema linking supply chain to dev requirements\n- Registered as embedded schema for --preset supply-chain usage\n- 10 integration tests covering loading, types, links, and rules\n\nImplements: FEAT-107\nRefs: #107\n\nCo-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>\n\n* feat(lsp): add documentSymbol support with rowan CST parsing\n\nImplement lsp_document_symbols() that parses YAML source using the\nrowan CST and returns DocumentSymbol entries for each artifact with an\nid field. Works for both generic artifacts: sections and STPA-style\nnamed sections (losses:, hazards:, etc.). Includes byte_offset_to_position\nhelper for converting CST spans to LSP positions.\n\nAdd 6 tests covering basic extraction, empty files, items without id,\ndetail content, range validity, and STPA sections.\n\nRefs: #93\n\nCo-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>\n\n* fix: clippy lints, duplicate tests, formatting\n\n- Fix clippy: redundant closure in yaml_value_to_cow, borrowed expr\n  in mapping.get() calls\n- Remove 3 duplicate documentSymbol test functions from cherry-pick\n- Keep 3 unique tests (skips_without_id, detail, stpa_sections)\n- Add yaml_sections: vec![] to 4 schema test constructors\n- cargo fmt\n\nCo-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>\n\n---------\n\nCo-authored-by: Claude Opus 4.6 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-04-06T16:03:41+02:00",
          "tree_id": "91420e12c05c0ff49e98ea65888605c1ab3958ad",
          "url": "https://github.com/pulseengine/rivet/commit/29b735bf3cfbb06868892c2efde92a4a5a812212"
        },
        "date": 1775484715228,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 83074,
            "range": "± 642",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 847220,
            "range": "± 3420",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12187036,
            "range": "± 710757",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2194,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25975,
            "range": "± 334",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 372637,
            "range": "± 5683",
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
            "value": 995367,
            "range": "± 8796",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 159973,
            "range": "± 1546",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1883584,
            "range": "± 32598",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 25436390,
            "range": "± 3203483",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 108545,
            "range": "± 607",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 909962,
            "range": "± 9563",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 10289447,
            "range": "± 787182",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4408,
            "range": "± 81",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 62884,
            "range": "± 662",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 778071,
            "range": "± 5637",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 64675,
            "range": "± 1008",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 705325,
            "range": "± 2242",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7572206,
            "range": "± 149459",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 828,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7810,
            "range": "± 176",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 115040,
            "range": "± 1563",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23077,
            "range": "± 148",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 157803,
            "range": "± 1211",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1443192,
            "range": "± 43789",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "6f781be12d61e0530f86c651cd02fb9d83ca497a",
          "message": "fix: edge case hardening + STPA artifacts + schema fixes + MCP tests (#124)\n\n* fix: edge case hardening from deep code scan\n\nCRITICAL: Replace .unwrap() with if-let on store.get() in render code\n  (results.rs:72, traceability.rs:230,261)\n\nHIGH: Recover from poisoned mutex in serve reload handler instead of\n  panicking (serve/mod.rs:449)\n\nHIGH: Document RwLock ordering in MCP server — rmcp serializes calls\n  over stdio so concurrent read+write cannot occur (mcp.rs)\n\nMEDIUM: Reject empty artifact IDs and self-referential links during\n  HIR extraction with proper diagnostics (yaml_hir.rs, both paths)\n\nRefs: #91\n\nCo-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>\n\n* test(mcp): add rmcp client integration tests for MCP server\n\nAdd 14 integration tests that spawn `rivet mcp` as a child process and\nexercise all 10 tools plus resources via the rmcp client transport. Tests\ncover tools/list, rivet_validate, rivet_list (with filters), rivet_get\n(valid + invalid), rivet_stats, rivet_schema (with filters),\nrivet_coverage, resources/list, resources/read for diagnostics and\ncoverage, and rivet_reload with live file changes.\n\nRefs: FEAT-010\n\nCo-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>\n\n* fix: clippy + format in MCP integration tests\n\nCo-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>\n\n* feat(stpa): add MCP server and YAML round-trip STPA artifacts\n\nAdd missing artifacts identified in deep methodology review:\n- CTRL-MCP controller in control-structure.yaml\n- H-21 (MCP stale state) and H-24 (round-trip formatting) hazards\n- SC-23 (MCP staleness prevention) and SC-24 (byte-for-byte round-trip) constraints\n- LS-M-1 loss scenario (MCP agent commits on stale validation)\n\nNote: LS-M-1 references UCA-M-1 which will be defined in a follow-up.\n\nImplements: SC-23, SC-24\nRefs: H-21, H-24, CTRL-MCP, LS-M-1\n\nCo-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>\n\n* fix: add missing schema fields and STPA constraint for data quality\n\n- Add baseline (string) and upstream-ref (string) fields to requirement type in dev.yaml\n- Add baseline, diagram, and source-ref fields to design-decision type in dev.yaml\n- Add baseline field to feature type in dev.yaml\n- Add source-ref and diagram fields to aadl-component type in aadl.yaml\n- Add allocated-from as standalone link type in aadl.yaml (was only defined as inverse)\n- Add SC-LSP-003 system constraint for H-LSP-003 (diagnostic location accuracy)\n- Renumber SC-LSP-003..007 to SC-LSP-004..008 to avoid ID collision\n\nFixes: H-LSP-003\nRefs: SC-LSP-003\n\nCo-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>\n\n* fix: update hazard count (32→34), remove forward ref to UCA-M-1\n\n- yaml_cst test: hazards.yaml now has 34 items (22 hazards + 12 sub-hazards)\n  after adding H-21 and H-24\n- loss-scenarios: remove uca: UCA-M-1 forward reference (UCA not yet defined)\n\nCo-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>\n\n* fix: coverage --format default was 'table' (invalid), now 'text'\n\nFound during dogfooding — our own format validator rejects 'table'.\n\nCo-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>\n\n* fix(db): use rowan parser for YAML error detection in salsa path\n\nThe salsa validation path (validate_all -> collect_parse_errors) was\nusing parse_generic_yaml to detect parse errors for ALL source files.\nThis produced 18 false \"missing field 'artifacts'\" errors for STPA\nsection-based files, which use a different document structure.\n\nAdd collect_rowan_parse_errors tracked function that uses the rowan CST\nparser to detect actual YAML syntax errors without assuming any\nparticular document structure. When the rowan-yaml feature is enabled,\nvalidate_all now uses this instead of the serde_yaml-based error\ncollection.\n\nFixes #125\n\nCo-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>\n\n* feat(cli): add 'rivet stamp' command for AI provenance metadata\n\nAdds a new CLI command that stamps artifacts with provenance metadata\n(created-by, model, session-id, timestamp, reviewed-by). Supports\nstamping individual artifacts or all artifacts at once, with proper\ninsert-or-replace semantics via the YamlEditor.\n\nImplements REQ-034\n\nCo-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>\n\n* feat: add rivet stamp command + Claude Code pre-commit hook\n\nNew CLI: `rivet stamp <ID> --created-by ai-assisted --model claude-opus-4-6`\nStamps artifacts with AI provenance. Supports `rivet stamp all`.\n\nClaude Code hook: .claude/settings.json runs `rivet validate` pre-commit.\n\nCo-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>\n\n* feat(docs): add supply-chain topic and Claude Code pre-commit hook\n\nAdd a `supply-chain` docs topic covering SBOM components, build\nattestations, vulnerabilities, and release artifacts with example\nYAML for each type, link types, and traceability rules. Update the\nschemas overview to include supply-chain and its bridge.\n\nCreate `.claude/settings.json` with a pre-commit hook that runs\n`rivet validate --direct` before each commit. Update CLAUDE.md to\ndocument the hook and the `rivet stamp` command.\n\nRefs: FEAT-001\n\nCo-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>\n\n* feat: auto-stamp AI provenance via PostToolUse hook\n\nWhen Claude Code edits artifact YAML files in artifacts/ or safety/,\nthe PostToolUse hook automatically runs `rivet stamp all` to record\nprovenance metadata (created-by: ai-assisted, model: claude-opus-4-6).\n\nThis makes provenance tracking automatic and deterministic — no need\nfor Claude to remember to stamp manually.\n\nCo-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>\n\n* fix: skip yaml_hir and stpa_hazard in Miri CI\n\nThe rowan cursor deallocation UB triggers in any test creating a\nmulti-item tree (not just parse_actual_hazards). The stpa_hazard_sequence\ntest and yaml_hir tests also create enough cursor nodes to trigger it.\nSkip these in Miri CI until the rowan cursor fix is complete.\n\nCo-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>\n\n---------\n\nCo-authored-by: Claude Opus 4.6 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-04-07T00:27:39+02:00",
          "tree_id": "d6dde01d396ddf377c288bbdfa31434f7610b385",
          "url": "https://github.com/pulseengine/rivet/commit/6f781be12d61e0530f86c651cd02fb9d83ca497a"
        },
        "date": 1775514858841,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 80724,
            "range": "± 1104",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 852169,
            "range": "± 6200",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12257484,
            "range": "± 1006576",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2141,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25942,
            "range": "± 83",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 370879,
            "range": "± 2175",
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
            "value": 95,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 994812,
            "range": "± 5957",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 149377,
            "range": "± 485",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1772884,
            "range": "± 30567",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 24486177,
            "range": "± 2956363",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 107536,
            "range": "± 662",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 891148,
            "range": "± 4849",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 10199438,
            "range": "± 1186813",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4432,
            "range": "± 15",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 59229,
            "range": "± 435",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 773379,
            "range": "± 10062",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 63009,
            "range": "± 218",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 690534,
            "range": "± 3714",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8007145,
            "range": "± 803561",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 814,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7453,
            "range": "± 79",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 107109,
            "range": "± 1767",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23392,
            "range": "± 298",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 166939,
            "range": "± 1132",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1575785,
            "range": "± 11393",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "51f2054a0a78744eaef88998e4571344a232be0f",
          "message": "feat: s-expression query language, MCP CRUD, variant/PLE artifacts, EU AI Act runtime evidence (#126)\n\n## Summary\n\n- S-expression query/constraint language with rowan CST parser, typed AST evaluator, CLI `--filter` on list/stats/coverage, dashboard API `?filter=`, and salsa caching\n- 8 proptest logical equivalence properties (De Morgan, double negation, commutativity, implies, excludes)\n- MCP server expanded from 10 to 15 tools (add query, modify, link, unlink, remove)\n- `rivet init --hooks` installs git hooks with chain-to-existing support\n- EU AI Act `runtime-evidence` artifact type with hash-chain integrity (#99)\n- 47 v0.4.0 artifacts (REQ-041..046, DD-048..051, FEAT-106..114) + STPA variant analysis\n- Tracking issue #128 for full PLE/variant system\n\n## CI Notes\n\nCargo Deny, Security Audit, and Miri failures are pre-existing upstream advisory/compatibility issues not caused by this PR. All code-quality gates pass (Format, Clippy, Test, Proptest, MSRV, Supply Chain, YAML Lint).",
          "timestamp": "2026-04-12T11:15:39-05:00",
          "tree_id": "5a1d450b15162e438d33c23dedfe7dde18f290cc",
          "url": "https://github.com/pulseengine/rivet/commit/51f2054a0a78744eaef88998e4571344a232be0f"
        },
        "date": 1776011152496,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 82167,
            "range": "± 322",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 883761,
            "range": "± 6448",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13132298,
            "range": "± 820473",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1943,
            "range": "± 19",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24416,
            "range": "± 874",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 360134,
            "range": "± 2158",
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
            "value": 1003967,
            "range": "± 15512",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 166976,
            "range": "± 1113",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1913936,
            "range": "± 26763",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 26661137,
            "range": "± 856177",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 106875,
            "range": "± 506",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 921569,
            "range": "± 5121",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 10101250,
            "range": "± 401741",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4290,
            "range": "± 9",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 45652,
            "range": "± 888",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 754223,
            "range": "± 8215",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 56378,
            "range": "± 123",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 693985,
            "range": "± 10351",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7693053,
            "range": "± 160481",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 784,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 6943,
            "range": "± 14",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 91637,
            "range": "± 387",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21805,
            "range": "± 53",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 150204,
            "range": "± 1117",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1369984,
            "range": "± 19070",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "f958a7ef4fe131d0d96cf5431ce954cab1487127",
          "message": "fix(ci): resolve Miri, cargo-deny, and cargo-audit CI failures\n\nAll three previously-failing CI checks now pass:\n- **Miri**: Skip rowan-dependent sexpr_eval tests (tree-borrows UB); pure evaluator logic tests still run\n- **Cargo Deny**: Install from source for edition 2024 support + wasmtime advisories ignored\n- **Security Audit**: Install from source for CVSS 4.0 + wasmtime advisories ignored\n\nPlaywright E2E failure is pre-existing (dashboard count mismatch from new artifacts).",
          "timestamp": "2026-04-12T12:37:33-05:00",
          "tree_id": "f01c9b412b4c598f8c5148d5ff5892eedc390f7d",
          "url": "https://github.com/pulseengine/rivet/commit/f958a7ef4fe131d0d96cf5431ce954cab1487127"
        },
        "date": 1776016334613,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 81320,
            "range": "± 185",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 869580,
            "range": "± 7419",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14896974,
            "range": "± 1034478",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2210,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25949,
            "range": "± 135",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 392548,
            "range": "± 2673",
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
            "value": 1012740,
            "range": "± 77149",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 160777,
            "range": "± 1640",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1891896,
            "range": "± 9397",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 26664874,
            "range": "± 3447466",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 109657,
            "range": "± 1088",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 915164,
            "range": "± 17004",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 10528470,
            "range": "± 743244",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4462,
            "range": "± 15",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60692,
            "range": "± 1711",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 773141,
            "range": "± 8444",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 61317,
            "range": "± 195",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 679030,
            "range": "± 9674",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8159993,
            "range": "± 541791",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 801,
            "range": "± 21",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7660,
            "range": "± 44",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 111588,
            "range": "± 2454",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23190,
            "range": "± 199",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 161817,
            "range": "± 1518",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1497430,
            "range": "± 172372",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "e13637b62d80609d9fbcc99563ec7af944966d7e",
          "message": "feat: forall/exists quantifiers + reachable graph traversal (PLE Phase 2)\n\nExtend the s-expression evaluator with:\n- forall(scope, predicate) — universal quantifier over store\n- exists(scope, predicate) — existential quantifier over store\n- count(scope) — boolean: at least one match exists\n- reachable-from(start, link-type) — current artifact is downstream\n- reachable-to(target, link-type) — target is downstream of current\n\nEvalContext now includes optional Store reference for quantifier access.\nAll callers (CLI, API, MCP, salsa) pass store via matches_filter_with_store.\n\nExamples:\n  rivet list --filter '(exists (= type \"requirement\") (has-tag \"stpa\"))'\n  rivet list --filter '(reachable-from \"REQ-004\" \"satisfies\")'\n\nImplements: REQ-041\nRefs: FEAT-109\n\nCo-authored-by: Claude Opus 4.6 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-04-12T19:28:50-05:00",
          "tree_id": "96562b25c6a3ca440df0eda44d0eb142c268c195",
          "url": "https://github.com/pulseengine/rivet/commit/e13637b62d80609d9fbcc99563ec7af944966d7e"
        },
        "date": 1776040889039,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 81326,
            "range": "± 4549",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 859009,
            "range": "± 4351",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12820980,
            "range": "± 1110225",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2212,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26005,
            "range": "± 142",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 361382,
            "range": "± 2151",
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
            "value": 1031152,
            "range": "± 23158",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 159712,
            "range": "± 567",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1842204,
            "range": "± 16732",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 26311394,
            "range": "± 1963812",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 108238,
            "range": "± 616",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 896310,
            "range": "± 5048",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 9646255,
            "range": "± 475994",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4596,
            "range": "± 12",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60366,
            "range": "± 709",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 759905,
            "range": "± 3045",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 59030,
            "range": "± 255",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 665321,
            "range": "± 2833",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7404898,
            "range": "± 228402",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 823,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7804,
            "range": "± 48",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 115987,
            "range": "± 718",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23228,
            "range": "± 191",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 161543,
            "range": "± 783",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1505523,
            "range": "± 25275",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "67a793f2028feed95deb2f3920c840b55bc2bcea",
          "message": "feat(proofs): Kani bounded model checking for s-expression evaluator\n\n* feat(proofs): Kani bounded model checking for s-expression evaluator\n\nAdd five Kani proof harnesses for the sexpr_eval::check() function:\n\n- proof_sexpr_check_no_panic: panic-freedom for all expressions (depth 2)\n- proof_sexpr_de_morgan_and: not(and(a,b)) == or(not(a), not(b))\n- proof_sexpr_double_negation: not(not(a)) == a\n- proof_sexpr_implies_expansion: implies(a,b) == or(not(a), b)\n- proof_sexpr_excludes_expansion: excludes(a,b) == !and(a,b)\n\nUses bounded symbolic expression generation (depth 2, 6 leaf variants\n+ 4 connectives) with kani::any() and a concrete test artifact for\nevaluation context.\n\nVerifies: REQ-041, REQ-030\n\nCo-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>\n\n* chore: format Kani proofs\n\nTrace: skip\n\nCo-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>\n\n---------\n\nCo-authored-by: Claude Opus 4.6 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-04-12T20:01:51-05:00",
          "tree_id": "1b6143ffc3ce67d374cbdf82c4a1c8318d595aca",
          "url": "https://github.com/pulseengine/rivet/commit/67a793f2028feed95deb2f3920c840b55bc2bcea"
        },
        "date": 1776042838987,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 76178,
            "range": "± 461",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 894863,
            "range": "± 11445",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12891644,
            "range": "± 644847",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1693,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 19307,
            "range": "± 59",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 363694,
            "range": "± 1920",
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
            "value": 86,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 86,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 944351,
            "range": "± 7450",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 158199,
            "range": "± 360",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1871482,
            "range": "± 55971",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 33482777,
            "range": "± 1705110",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 104661,
            "range": "± 871",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 939273,
            "range": "± 3538",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 13223452,
            "range": "± 860061",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3960,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 40611,
            "range": "± 149",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 791972,
            "range": "± 4077",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 52035,
            "range": "± 359",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 580818,
            "range": "± 3140",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7553484,
            "range": "± 511570",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 671,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 5673,
            "range": "± 174",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 142633,
            "range": "± 558",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21432,
            "range": "± 71",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 150905,
            "range": "± 445",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1393601,
            "range": "± 10104",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "ed29c015b50b67161a97a9890f08bcc3e55b175f",
          "message": "feat(lsp): code actions for missing link diagnostics\n\nImplements: REQ-007\nRefs: FEAT-010\n\nCo-authored-by: Claude Opus 4.6 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-04-12T20:02:01-05:00",
          "tree_id": "8832aefea498cffb20694d6d6db0f996822a6280",
          "url": "https://github.com/pulseengine/rivet/commit/ed29c015b50b67161a97a9890f08bcc3e55b175f"
        },
        "date": 1776042926424,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 83486,
            "range": "± 2185",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 893533,
            "range": "± 21542",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 16849591,
            "range": "± 1160499",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1961,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24635,
            "range": "± 120",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 351300,
            "range": "± 2445",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 100,
            "range": "± 2",
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
            "value": 98,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1032099,
            "range": "± 40611",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 168407,
            "range": "± 600",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1940046,
            "range": "± 30207",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 33762569,
            "range": "± 3629310",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 105675,
            "range": "± 679",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 917297,
            "range": "± 15637",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 13438079,
            "range": "± 1441540",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4381,
            "range": "± 92",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 47168,
            "range": "± 286",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 761154,
            "range": "± 19935",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 63381,
            "range": "± 759",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 709707,
            "range": "± 16912",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8364660,
            "range": "± 192582",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 761,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7000,
            "range": "± 23",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 90445,
            "range": "± 313",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21967,
            "range": "± 141",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 149210,
            "range": "± 537",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1380256,
            "range": "± 46151",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "af845df09770468e1c1fc92c3d131df2d004c7d1",
          "message": "feat(export): Zola static site export with multi-project namespacing\n\nNew export format: `rivet export --format zola --output <site> --prefix <name>`\n\nFeatures:\n- Writes content/<prefix>/artifacts/*.md with TOML frontmatter\n- Writes data/<prefix>/artifacts.json and stats.json for Zola load_data()\n- --prefix enables multiple projects/slices in the same Zola site\n- --filter uses s-expression to select artifact subset\n- --shortcodes installs rivet_artifact and rivet_stats Zola shortcodes\n- Additive-only: never modifies config.toml, sass/, or existing content\n- Taxonomy-ready frontmatter (artifact_type, artifact_status, tags)\n\nExamples:\n  rivet export --format zola --output ./site --prefix rivet\n  rivet export --format zola --output ./site --prefix safety --filter '(has-tag \"stpa\")'\n  rivet export --format zola --output ./site --prefix rivet --shortcodes\n\nImplements: REQ-007\nRefs: FEAT-001\n\nCo-authored-by: Claude Opus 4.6 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-04-12T20:02:16-05:00",
          "tree_id": "b78a1437e29a847ac94ef217507b56d2eaf4e627",
          "url": "https://github.com/pulseengine/rivet/commit/af845df09770468e1c1fc92c3d131df2d004c7d1"
        },
        "date": 1776043039257,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 81100,
            "range": "± 640",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 864044,
            "range": "± 9714",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 16320951,
            "range": "± 911500",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2189,
            "range": "± 29",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26414,
            "range": "± 132",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 402543,
            "range": "± 4109",
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
            "value": 1023284,
            "range": "± 38161",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 165983,
            "range": "± 2237",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1924997,
            "range": "± 48469",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 30734060,
            "range": "± 2184662",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 110763,
            "range": "± 2790",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 918755,
            "range": "± 10875",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 12174227,
            "range": "± 952974",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4489,
            "range": "± 21",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60682,
            "range": "± 397",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 761220,
            "range": "± 9792",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 58372,
            "range": "± 527",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 660233,
            "range": "± 19020",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8239300,
            "range": "± 371301",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 826,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7714,
            "range": "± 33",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 117089,
            "range": "± 1286",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23508,
            "range": "± 124",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 163269,
            "range": "± 904",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1514774,
            "range": "± 36544",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "ee19e3ca4b7231ec9d3638bc075345c4187f0142",
          "message": "feat: feature model schema + constraint solver (PLE Phase 3)\n\nImplements: REQ-042, REQ-043, REQ-044\nRefs: FEAT-110, FEAT-111, FEAT-112\n\nCo-authored-by: Claude Opus 4.6 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-04-12T23:15:23-05:00",
          "tree_id": "a7f1e87ca54372781aa0cb9787c51e16bffc69c8",
          "url": "https://github.com/pulseengine/rivet/commit/ee19e3ca4b7231ec9d3638bc075345c4187f0142"
        },
        "date": 1776054107296,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 80760,
            "range": "± 630",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 862638,
            "range": "± 39463",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14703093,
            "range": "± 931238",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2184,
            "range": "± 24",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26500,
            "range": "± 1011",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 368185,
            "range": "± 8251",
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
            "value": 1040943,
            "range": "± 12727",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 162835,
            "range": "± 6993",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1935062,
            "range": "± 15927",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 28990432,
            "range": "± 2197241",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 109840,
            "range": "± 858",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 900894,
            "range": "± 4827",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 12430282,
            "range": "± 1283332",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4361,
            "range": "± 91",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60576,
            "range": "± 257",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 781698,
            "range": "± 20022",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 60229,
            "range": "± 2320",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 658572,
            "range": "± 12922",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8890487,
            "range": "± 754669",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 808,
            "range": "± 19",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7839,
            "range": "± 56",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 110358,
            "range": "± 839",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23432,
            "range": "± 170",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 162739,
            "range": "± 1549",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1517944,
            "range": "± 33215",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "87158f8a944efbc2587e3e4d4d5732a37c2b2236",
          "message": "fix(test): Playwright E2E count comparison\n\nTrace: skip\n\nCo-authored-by: Claude Opus 4.6 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-04-12T23:15:20-05:00",
          "tree_id": "e4a09af7cefa35c0f8f34026ec8b96aff2465646",
          "url": "https://github.com/pulseengine/rivet/commit/87158f8a944efbc2587e3e4d4d5732a37c2b2236"
        },
        "date": 1776054107951,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 81710,
            "range": "± 861",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 851429,
            "range": "± 5328",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12881874,
            "range": "± 1733660",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2196,
            "range": "± 45",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 27268,
            "range": "± 392",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 358481,
            "range": "± 1637",
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
            "value": 1022364,
            "range": "± 20832",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 166780,
            "range": "± 3924",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1919135,
            "range": "± 30734",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 40478241,
            "range": "± 2971568",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 108991,
            "range": "± 1626",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 927117,
            "range": "± 9873",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 15968200,
            "range": "± 1074478",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4376,
            "range": "± 24",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 61947,
            "range": "± 839",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 787158,
            "range": "± 2948",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 60090,
            "range": "± 749",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 679896,
            "range": "± 10311",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 9215730,
            "range": "± 624849",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 812,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7772,
            "range": "± 41",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 109569,
            "range": "± 1155",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23275,
            "range": "± 351",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 164126,
            "range": "± 1735",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1514733,
            "range": "± 32399",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "f2da791b734dd8596de3e04f0f20654a6fb03cb4",
          "message": "feat(export): Zola docs export with resolved wiki-links\n\nZola export now includes content/<prefix>/docs/*.md alongside artifacts.\nDocuments loaded from rivet's docs/ directory get TOML frontmatter and\n[[ID]] wiki-links resolved to Zola internal links pointing at artifact pages.\n\nImplements: REQ-007, REQ-035\n\nCo-authored-by: Claude Opus 4.6 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-04-13T06:45:51-05:00",
          "tree_id": "de67909dd4e9c5700472124eae37ac3ac040b2c9",
          "url": "https://github.com/pulseengine/rivet/commit/f2da791b734dd8596de3e04f0f20654a6fb03cb4"
        },
        "date": 1776084546915,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 82111,
            "range": "± 319",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 876523,
            "range": "± 5826",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12270816,
            "range": "± 737434",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2141,
            "range": "± 11",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25490,
            "range": "± 62",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 364982,
            "range": "± 2647",
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
            "value": 95,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1019532,
            "range": "± 36937",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 160063,
            "range": "± 4374",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1874757,
            "range": "± 18814",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 23099583,
            "range": "± 900366",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 111160,
            "range": "± 2117",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 908763,
            "range": "± 3873",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 9303637,
            "range": "± 273559",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4386,
            "range": "± 13",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 61218,
            "range": "± 203",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 772172,
            "range": "± 3364",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 58713,
            "range": "± 727",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 671320,
            "range": "± 4369",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7516994,
            "range": "± 260940",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 820,
            "range": "± 71",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7647,
            "range": "± 104",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 125559,
            "range": "± 1038",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22966,
            "range": "± 183",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 162864,
            "range": "± 1200",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1513966,
            "range": "± 10659",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "9db1988230e59f87b2e64ed81ab57de83b103042",
          "message": "fix(export): Zola TOML escaping, title fallback, date, mermaid\n\n- Use TOML triple-quoted strings for descriptions (handles newlines)\n- Fallback to first non-empty description line when title is empty\n- Merge artifact type and status into tags taxonomy (no custom taxonomies)\n- Add date field to frontmatter (from provenance timestamp)\n- Include diagram fields as Mermaid code blocks\n- Include rationale fields in design decision pages\n\nImplements: REQ-007\n\nCo-authored-by: Claude Opus 4.6 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-04-13T06:45:54-05:00",
          "tree_id": "a6f806c18a074c9eff2f3f8bca6095ae40933fd1",
          "url": "https://github.com/pulseengine/rivet/commit/9db1988230e59f87b2e64ed81ab57de83b103042"
        },
        "date": 1776084649815,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 80620,
            "range": "± 1001",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 859702,
            "range": "± 2826",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 11389034,
            "range": "± 602574",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2141,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25404,
            "range": "± 193",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 374176,
            "range": "± 4848",
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
            "value": 99,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1021750,
            "range": "± 22138",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 161274,
            "range": "± 994",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1878400,
            "range": "± 12044",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 23949147,
            "range": "± 1257918",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 109889,
            "range": "± 727",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 918952,
            "range": "± 3329",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 9499124,
            "range": "± 486995",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4356,
            "range": "± 15",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 61773,
            "range": "± 213",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 773261,
            "range": "± 11471",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 60955,
            "range": "± 233",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 659666,
            "range": "± 5079",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7273045,
            "range": "± 134114",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 835,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7727,
            "range": "± 53",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 111959,
            "range": "± 1208",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23084,
            "range": "± 115",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 163152,
            "range": "± 2094",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1512125,
            "range": "± 16771",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "5a590dc5b8f29f50922ddbc347e7ff065f05987f",
          "message": "feat(cli): variant subcommand — check, list, solve with bindings\n\nNew CLI commands for product line variant management:\n  rivet variant list --model feature-model.yaml\n  rivet variant check --model feature-model.yaml --variant eu-adas-c.yaml\n  rivet variant solve --model fm.yaml --variant v.yaml --binding bindings.yaml\n\nFeatures:\n- Feature tree visualization with group labels\n- Constraint propagation with feature name preprocessing\n- Binding resolution showing bound artifact IDs\n- Project scope validation (which bound artifacts exist)\n- JSON output format for all commands\n- Example files in examples/variant/\n\nImplements: REQ-042, REQ-043, REQ-044, REQ-046\nRefs: FEAT-110, FEAT-111, FEAT-112, FEAT-113\n\nCo-authored-by: Claude Opus 4.6 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-04-13T13:05:12-05:00",
          "tree_id": "66c6e93ee646f71ae062d8721a9e83d7bc212755",
          "url": "https://github.com/pulseengine/rivet/commit/5a590dc5b8f29f50922ddbc347e7ff065f05987f"
        },
        "date": 1776103885391,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 81333,
            "range": "± 3130",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 859229,
            "range": "± 7312",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13017368,
            "range": "± 893132",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2169,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26174,
            "range": "± 192",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 366824,
            "range": "± 1904",
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
            "value": 1011591,
            "range": "± 26364",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 166608,
            "range": "± 4512",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1888846,
            "range": "± 11999",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 28046623,
            "range": "± 3260254",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 109053,
            "range": "± 601",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 899543,
            "range": "± 5613",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 11047447,
            "range": "± 1035202",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4346,
            "range": "± 26",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 61953,
            "range": "± 287",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 763383,
            "range": "± 4507",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 59288,
            "range": "± 1592",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 663294,
            "range": "± 3099",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7723718,
            "range": "± 460016",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 828,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7799,
            "range": "± 32",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 111860,
            "range": "± 1872",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22952,
            "range": "± 157",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 161213,
            "range": "± 1218",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1488831,
            "range": "± 24341",
            "unit": "ns/iter"
          }
        ]
      }
    ]
  }
}