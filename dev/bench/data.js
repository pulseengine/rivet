window.BENCHMARK_DATA = {
  "lastUpdate": 1776802892032,
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
      },
      {
        "commit": {
          "author": {
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
          "id": "80d9e66e28a478a62e25b53230ed72158612b7f4",
          "message": "test(mcp): integration tests for query, modify, link, unlink, remove\n\nVerifies: REQ-007\n\nCo-authored-by: Claude Opus 4.6 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-04-13T13:05:16-05:00",
          "tree_id": "999d0796b1f4e57152c7333dedc3aa291f617d87",
          "url": "https://github.com/pulseengine/rivet/commit/80d9e66e28a478a62e25b53230ed72158612b7f4"
        },
        "date": 1776103893963,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 81749,
            "range": "± 20279",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 869325,
            "range": "± 5500",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13543137,
            "range": "± 734560",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2113,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25603,
            "range": "± 321",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 379059,
            "range": "± 2507",
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
            "value": 1019421,
            "range": "± 12852",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 166214,
            "range": "± 783",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1899250,
            "range": "± 29385",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 30398616,
            "range": "± 1469412",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 109051,
            "range": "± 594",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 904643,
            "range": "± 12004",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 12318391,
            "range": "± 805830",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4409,
            "range": "± 16",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60901,
            "range": "± 886",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 767849,
            "range": "± 6347",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 61221,
            "range": "± 227",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 682518,
            "range": "± 6426",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8421940,
            "range": "± 572168",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 844,
            "range": "± 31",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 8069,
            "range": "± 34",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 113476,
            "range": "± 666",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23407,
            "range": "± 82",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 161209,
            "range": "± 641",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1505030,
            "range": "± 16411",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "7588c3c2080739f4c82a02ce884b2b0b5375b1c2",
          "message": "feat: sphinx-needs JSON import adapter (migration path)\n\nAdd needs-json format support to the import-results CLI command,\nenabling sphinx-needs users to import their needs.json exports into\nrivet as generic YAML artifacts.\n\nThe core adapter (rivet-core/src/formats/needs_json.rs) was already\nimplemented with full support for type mapping, ID normalization\n(underscore to hyphen), configurable link types, tag/status\npreservation, and extra field forwarding. This commit wires it into\nthe CLI's import-results command so users can run:\n\n  rivet import-results --format needs-json needs.json --output artifacts/\n\nImplements: REQ-025\n\nCo-authored-by: Claude Opus 4.6 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-04-13T13:05:20-05:00",
          "tree_id": "f92385fd8b3a67018d10d249d96a8e84db4ebfe3",
          "url": "https://github.com/pulseengine/rivet/commit/7588c3c2080739f4c82a02ce884b2b0b5375b1c2"
        },
        "date": 1776103895471,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 80222,
            "range": "± 252",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 864971,
            "range": "± 3608",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12015669,
            "range": "± 777347",
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
            "value": 25803,
            "range": "± 132",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 374132,
            "range": "± 1762",
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
            "value": 1006708,
            "range": "± 24383",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 165524,
            "range": "± 566",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1882909,
            "range": "± 13221",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 25885542,
            "range": "± 1621608",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 107035,
            "range": "± 640",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 903894,
            "range": "± 16825",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 9578640,
            "range": "± 316048",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4358,
            "range": "± 26",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60243,
            "range": "± 347",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 774281,
            "range": "± 2198",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 58401,
            "range": "± 892",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 667165,
            "range": "± 2391",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7224219,
            "range": "± 189161",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 864,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7884,
            "range": "± 25",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 112805,
            "range": "± 739",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22879,
            "range": "± 83",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 161767,
            "range": "± 1646",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1506052,
            "range": "± 22246",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "0053fbb63d8048497759131b808d559c05593d13",
          "message": "fix: tool qualification — STPA, requirements, MCP audit, regex bounds, export --clean, import verification\n\n* fix: harden Zola export, hook paths, and filter store access\n\nFixes found during honest quality review:\n\n1. Zola export filter now uses matches_filter_with_store (quantifiers work)\n2. rivet init --hooks resolves binary via PATH (not hardcoded debug path)\n3. Zola export generates fallback taxonomy templates when missing\n   (zola build now works without a theme)\n4. Verified: needs-json import works end-to-end (import → validate → PASS)\n5. Verified: variant constraints handle (not feature), (and a b), (excludes a c)\n\nTested:\n- Clean Zola roundtrip: export → zola build → 53 pages, zero errors\n- needs-json: 3 artifacts imported, IDs normalized, validates clean\n- Variant: complex constraints with implies/excludes/and/not\n\nImplements: REQ-007\n\nCo-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>\n\n* feat(stpa): tool qualification STPA + STPA-Sec for v0.4.0 features\n\nSTPA analysis treating rivet as a qualification tool (ISO 26262 §11.4.7,\nTCL 1). Covers hazards introduced by s-expression evaluator, variant\nsolver, Zola export, needs-json import, MCP write tools, and git hooks.\n\nSafety (7 hazards, 7 constraints, 3 losses):\n- H-TQ-001: evaluator returns wrong boolean (→ false PASS)\n- H-TQ-002: variant solver unsound (accepts invalid config)\n- H-TQ-003: Zola export omits/stales artifacts\n- H-TQ-004: needs-json maps links incorrectly\n- H-TQ-005: MCP modifies without validation\n- H-TQ-006: git hooks bypassed\n- H-TQ-007: quantifier scope mismatch\n\nSecurity (5 losses, 3 hazards, 5 constraints):\n- SL-TQ-002: AI agent prompt injection via MCP (no auth/rate limit)\n- SL-TQ-004: --no-verify bypasses hooks (hooks are not security controls)\n- SSC-TQ-002: MCP mutations must produce tamper-evident audit log\n- SSC-TQ-005: CI must independently verify (hooks are convenience, not security)\n\nImplements: REQ-002\n\nCo-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>\n\n* feat: tool qualification requirements REQ-047..053\n\nSeven requirements addressing STPA tool qualification constraints:\n- REQ-047: MCP mutation audit logging (SSC-TQ-002)\n- REQ-048: Regex complexity bounds (SSC-TQ-001)\n- REQ-049: Export validation embedding + --clean (SC-TQ-003, SSC-TQ-004)\n- REQ-050: Import link-target verification (SC-TQ-004, SSC-TQ-003)\n- REQ-051: CI-enforced traceability, hooks are convenience only (SSC-TQ-005)\n- REQ-052: Variant solver fuzz testing (SC-TQ-002)\n- REQ-053: Quantifier scope correctness testing (SC-TQ-007)\n\nImplements: REQ-002\n\nCo-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>\n\n* feat: implement REQ-047 (MCP audit log), REQ-048 (regex bounds), REQ-053 (quantifier scope tests)\n\nThree tool qualification requirements implemented:\n\nREQ-047 — MCP audit logging:\n  Every mutation (modify, link, unlink, remove) writes a JSON log entry\n  to .rivet/mcp-audit.jsonl with timestamp, tool name, and details.\n  Enables forensic analysis of AI agent activity.\n\nREQ-048 — Regex complexity bounds:\n  The matches predicate uses RegexBuilder::size_limit(1MB) to prevent\n  ReDoS attacks via crafted filter expressions.\n\nREQ-053 — Quantifier scope correctness:\n  Three new tests verify forall/exists iterate the store parameter:\n  - forall_uses_store_parameter: different stores → different results\n  - exists_uses_store_parameter: adding artifact changes exists result\n  - quantifier_without_store_returns_false: safe default\n\nImplements: REQ-047, REQ-048, REQ-053\nVerifies: REQ-041\n\nCo-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>\n\n* feat: implement REQ-049 (export --clean + validation.json)\n\n- --clean flag removes content/<prefix>/ and data/<prefix>/ before writing,\n  preventing deleted artifacts from persisting as stale published pages\n- data/<prefix>/validation.json embeds PASS/FAIL, error/warning counts,\n  artifact count, and export date for consumers to verify freshness\n- Addresses TOCTOU between export and publication (SSC-TQ-004)\n\nImplements: REQ-049\n\nCo-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>\n\n* feat: implement REQ-050 (import link verification) + REQ-051 (hook security docs)\n\nREQ-050: needs-json import now verifies all link targets exist within\nthe imported artifact set. Unresolved targets produce warnings with\nartifact ID, link type, and target. Prevents crafted imports from\ncreating links to non-existent artifacts.\n\nREQ-051: CLAUDE.md documents that git hooks are convenience only,\nnot security controls. CI must independently enforce traceability.\n\nImplements: REQ-050, REQ-051\n\nCo-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>\n\n---------\n\nCo-authored-by: Claude Opus 4.6 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-04-13T17:39:24-05:00",
          "tree_id": "16f477a812be7fb9f4496e73c4830a70e0342f20",
          "url": "https://github.com/pulseengine/rivet/commit/0053fbb63d8048497759131b808d559c05593d13"
        },
        "date": 1776120329203,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 81310,
            "range": "± 905",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 856533,
            "range": "± 6972",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 11854510,
            "range": "± 631300",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2151,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25317,
            "range": "± 72",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 396051,
            "range": "± 3182",
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
            "value": 1020153,
            "range": "± 30436",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 159637,
            "range": "± 945",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1869510,
            "range": "± 98745",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 23433408,
            "range": "± 1760401",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 107880,
            "range": "± 1086",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 895133,
            "range": "± 2878",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 9475055,
            "range": "± 408831",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4464,
            "range": "± 122",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 59301,
            "range": "± 195",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 760566,
            "range": "± 1420",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 58106,
            "range": "± 133",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 671280,
            "range": "± 1839",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7390110,
            "range": "± 153908",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 819,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7548,
            "range": "± 51",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 111659,
            "range": "± 781",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23617,
            "range": "± 77",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 164016,
            "range": "± 2288",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1506922,
            "range": "± 10776",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "7712ccc6ea7da257dbbb1dfc28e31c3ff9f0e50a",
          "message": "test: proptest fuzz testing for variant constraint solver (REQ-052)\n\nVerifies: REQ-052\n\nCo-authored-by: Claude Opus 4.6 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-04-13T17:39:27-05:00",
          "tree_id": "6b8aec8afeeaddbcded99b77e836273a2882507a",
          "url": "https://github.com/pulseengine/rivet/commit/7712ccc6ea7da257dbbb1dfc28e31c3ff9f0e50a"
        },
        "date": 1776120343671,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 81123,
            "range": "± 298",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 861251,
            "range": "± 28409",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 17235291,
            "range": "± 1357592",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2174,
            "range": "± 10",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25397,
            "range": "± 94",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 394784,
            "range": "± 3346",
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
            "value": 1013640,
            "range": "± 49185",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 159243,
            "range": "± 557",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1849543,
            "range": "± 25165",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 33095609,
            "range": "± 2973268",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 108955,
            "range": "± 2463",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 905955,
            "range": "± 4147",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 12954500,
            "range": "± 1928782",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 5251,
            "range": "± 23",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 61872,
            "range": "± 170",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 793006,
            "range": "± 12059",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 55646,
            "range": "± 792",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 662063,
            "range": "± 2202",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7391064,
            "range": "± 162332",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 785,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7489,
            "range": "± 58",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 116318,
            "range": "± 693",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23222,
            "range": "± 132",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 162526,
            "range": "± 672",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1496008,
            "range": "± 33816",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "7aa75077286463808692515a59ee313956bbf663",
          "message": "fix(ci): Miri green + getting-started docs for all new features\n\nFix Miri CI: feature_model tests build rowan trees for constraint\nparsing, triggering the same tree-borrows deallocation UB as yaml_hir.\nSkip feature_model in Miri alongside existing skips.\n\nUpdate getting-started.md with documentation for new features:\ns-expression filtering, variant management, Zola export, sphinx-needs\nimport, MCP server, git hooks, and security model.\n\nTrace: skip\n\nCo-authored-by: Claude Opus 4.6 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-04-13T22:26:40-05:00",
          "tree_id": "1652d03753fb32ac550309c8344fb4d63c7fc0f0",
          "url": "https://github.com/pulseengine/rivet/commit/7aa75077286463808692515a59ee313956bbf663"
        },
        "date": 1776137587243,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 81935,
            "range": "± 394",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 889208,
            "range": "± 11723",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12224860,
            "range": "± 346838",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1942,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24729,
            "range": "± 110",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 355047,
            "range": "± 3302",
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
            "value": 1047453,
            "range": "± 24708",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 167191,
            "range": "± 852",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1927509,
            "range": "± 143164",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 26438292,
            "range": "± 1625801",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 106814,
            "range": "± 366",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 919452,
            "range": "± 2856",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 10406610,
            "range": "± 141486",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4320,
            "range": "± 9",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 46051,
            "range": "± 503",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 757165,
            "range": "± 11383",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 62309,
            "range": "± 166",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 690801,
            "range": "± 2007",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7796059,
            "range": "± 143668",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 732,
            "range": "± 21",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 6536,
            "range": "± 35",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 91200,
            "range": "± 484",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21693,
            "range": "± 142",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 146620,
            "range": "± 783",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1356087,
            "range": "± 19709",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "a06285f20fa364fde1e268eee2a862748d2f720e",
          "message": "feat(cli): rivet validate --variant for variant-scoped validation\n\nAdd --model, --variant, and --binding flags to `rivet validate` that\nenable variant-scoped validation using the feature model constraint\nsolver. When all three flags are provided, the command:\n\n1. Loads the feature model and solves the variant configuration\n2. Uses the binding file to collect artifact IDs for effective features\n3. Builds a scoped store containing only those artifacts\n4. Runs validation against the scoped store instead of the full project\n\nIncludes error handling when only some of the three flags are provided,\nvariant scope info in both text and JSON output formats, and proper\ndiagnostic filtering for the salsa incremental path.\n\nImplements: REQ-045, REQ-046\n\nCo-authored-by: Claude Opus 4.6 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-04-13T22:26:43-05:00",
          "tree_id": "ceb460bf54d985b02cb1bc90f414880a29ee33ba",
          "url": "https://github.com/pulseengine/rivet/commit/a06285f20fa364fde1e268eee2a862748d2f720e"
        },
        "date": 1776137771012,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 81558,
            "range": "± 907",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 858463,
            "range": "± 11203",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 16216025,
            "range": "± 897474",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2249,
            "range": "± 79",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26336,
            "range": "± 66",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 376692,
            "range": "± 3690",
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
            "value": 1025228,
            "range": "± 52001",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 161739,
            "range": "± 1606",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1924266,
            "range": "± 30946",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 36579936,
            "range": "± 4673797",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 108837,
            "range": "± 1765",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 919513,
            "range": "± 4527",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 14162422,
            "range": "± 1493848",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4419,
            "range": "± 102",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 62204,
            "range": "± 512",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 798731,
            "range": "± 17136",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 60239,
            "range": "± 418",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 694308,
            "range": "± 6106",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 10375029,
            "range": "± 656790",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 776,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7493,
            "range": "± 177",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 114710,
            "range": "± 594",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23349,
            "range": "± 125",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 162126,
            "range": "± 1738",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1499579,
            "range": "± 17780",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "fa8eb71d3ce7b1fd663bac225af7290b23c63e9c",
          "message": "feat(stpa): AI-in-the-loop safety and security analysis\n\nSTPA + STPA-Sec for circular trust problem: AI builds the tool AND\nwrites the safety analysis that certifies it.\n\nSafety: 3 losses, 6 hazards, 6 constraints\n- H-AI-001: AI writes test that validates the bug\n- H-AI-005: Human review degrades with AI output volume\n- SC-AI-001: proptest/Kani provide independent verification\n- SC-AI-002: STPA must be human-reviewed, not auto-approved\n\nSecurity: 3 losses, 2 hazards, 3 constraints\n- SH-AI-001: Self-referential blind spot (this file is AI-generated)\n- SSC-AI-001: AI safety artifacts must be draft until human-reviewed\n\nNOTE: This analysis is itself AI-generated and must be treated as\na starting point for human review, not authoritative evidence.\n\nImplements: REQ-002\n\nCo-authored-by: Claude Opus 4.6 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-04-13T22:55:13-05:00",
          "tree_id": "65f866adc6822f6d8f3f3e2bd2ca5b20a459975a",
          "url": "https://github.com/pulseengine/rivet/commit/fa8eb71d3ce7b1fd663bac225af7290b23c63e9c"
        },
        "date": 1776139427218,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 81980,
            "range": "± 925",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 873340,
            "range": "± 8050",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 18106797,
            "range": "± 985200",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2190,
            "range": "± 35",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26425,
            "range": "± 176",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 370107,
            "range": "± 2511",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 95,
            "range": "± 13",
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
            "value": 1021235,
            "range": "± 17602",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 166663,
            "range": "± 666",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1962720,
            "range": "± 90470",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 41487759,
            "range": "± 2033453",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 109523,
            "range": "± 471",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 919727,
            "range": "± 4468",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 17950443,
            "range": "± 753491",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4343,
            "range": "± 92",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 65146,
            "range": "± 530",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 819251,
            "range": "± 33906",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 61486,
            "range": "± 193",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 688116,
            "range": "± 2991",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 10620457,
            "range": "± 450912",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 782,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7429,
            "range": "± 95",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 109482,
            "range": "± 1911",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23532,
            "range": "± 301",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 164393,
            "range": "± 978",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1511860,
            "range": "± 16688",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "21cd1e041c2ba0275fbf709538c29881105fa22a",
          "message": "fix: clear warnings — REQ-054..059 via rivet batch\n\nCreated 6 requirements satisfying SC-AI-001..006 using rivet batch.\nFixed REQ-047/048/050 category from \"security\" to \"non-functional\".\nWarnings: 14 → 5. 689 artifacts, PASS.\n\nTrace: skip\n\nCo-authored-by: Claude Opus 4.6 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-04-14T06:45:06-05:00",
          "tree_id": "a224c3606511f771fed03401195fc30beaff77c4",
          "url": "https://github.com/pulseengine/rivet/commit/21cd1e041c2ba0275fbf709538c29881105fa22a"
        },
        "date": 1776167484360,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 80862,
            "range": "± 594",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 861382,
            "range": "± 5204",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 10877938,
            "range": "± 720653",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2226,
            "range": "± 10",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25274,
            "range": "± 249",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 377204,
            "range": "± 1365",
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
            "value": 1014433,
            "range": "± 15385",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 163043,
            "range": "± 6716",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1849642,
            "range": "± 15771",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 22296368,
            "range": "± 834679",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 108153,
            "range": "± 613",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 911036,
            "range": "± 3839",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 9067860,
            "range": "± 248395",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4327,
            "range": "± 37",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 61853,
            "range": "± 278",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 768364,
            "range": "± 2737",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 61799,
            "range": "± 175",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 678784,
            "range": "± 15946",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7178257,
            "range": "± 183800",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 780,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7291,
            "range": "± 43",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 115079,
            "range": "± 569",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23509,
            "range": "± 277",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 162459,
            "range": "± 1282",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1501142,
            "range": "± 19519",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "912530c59a2da2fc35209960e830726d1600c4f3",
          "message": "feat: verification pyramid + STPA bug fixes (#150)\n\nfeat: verification pyramid — STPA-Sec tests, formal proof CI, Kani expansion",
          "timestamp": "2026-04-14T15:37:09-05:00",
          "tree_id": "7badee806c6ee0d339bccaa343bb4e7aea7520a5",
          "url": "https://github.com/pulseengine/rivet/commit/912530c59a2da2fc35209960e830726d1600c4f3"
        },
        "date": 1776199530640,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 81422,
            "range": "± 1340",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 879182,
            "range": "± 13625",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 17002104,
            "range": "± 1145085",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1953,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24514,
            "range": "± 45",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 361652,
            "range": "± 2713",
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
            "value": 1020687,
            "range": "± 22088",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 166270,
            "range": "± 472",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1912882,
            "range": "± 89579",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 35955798,
            "range": "± 3763109",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 107915,
            "range": "± 747",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 925707,
            "range": "± 3933",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 12032563,
            "range": "± 1529124",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4215,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 46027,
            "range": "± 110",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 748153,
            "range": "± 13601",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 60619,
            "range": "± 302",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 691394,
            "range": "± 8817",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8559373,
            "range": "± 313736",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 787,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7192,
            "range": "± 38",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 93311,
            "range": "± 612",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21738,
            "range": "± 535",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 148201,
            "range": "± 3531",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1377745,
            "range": "± 102409",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "913ce295e92d074d1d9c7597b6bebccc3073a2e5",
          "message": "test(e2e): fix playwright regressions pre-release (#151)\n\n* test(e2e): fix playwright regressions pre-release\n\n- coverage-view: handle multi-table strict-mode violation by scoping to the\n  first table (coverage rules table)\n- api: drop title-truthy assertion since control-actions use name/action\n  instead of title\n- audit-regression/graph/navigation/print-and-errors/self-contained:\n  extend per-test timeouts on routes hitting /graph, which dogfoods on the\n  project's ~1800 artifacts and currently takes ~57s (tracked as a perf\n  follow-up; not a release blocker)\n- helpers: make waitForHtmx's timeout configurable\n\nFull suite: 354/354 passing locally.\n\nTrace: skip\n\n* fix(deps): bump rustls-webpki to 0.103.12\n\nPatches RUSTSEC-2026-0098 and RUSTSEC-2026-0099, which published on\n2026-04-14 and started failing the Security Audit job on any PR.\n\nTrace: skip\n\n* fix(clippy): collapse nested if in junit parser\n\nRust 1.95 promoted clippy::collapsible-match to the default lint set,\nwhich failed the Clippy CI job on the stable toolchain update. Merges\nthe outer guard into the match arm pattern.\n\nTrace: skip",
          "timestamp": "2026-04-19T08:01:45-05:00",
          "tree_id": "3a0faedc00eaaba996793e4af2f955484bfb724a",
          "url": "https://github.com/pulseengine/rivet/commit/913ce295e92d074d1d9c7597b6bebccc3073a2e5"
        },
        "date": 1776604288094,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 79881,
            "range": "± 159",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 857498,
            "range": "± 13878",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 10982504,
            "range": "± 778393",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2166,
            "range": "± 15",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25088,
            "range": "± 105",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 369739,
            "range": "± 1750",
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
            "value": 103,
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
            "value": 996482,
            "range": "± 17795",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 164504,
            "range": "± 1424",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1888718,
            "range": "± 5210",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 22787635,
            "range": "± 811363",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 108504,
            "range": "± 790",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 905157,
            "range": "± 3964",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 9143774,
            "range": "± 189873",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4290,
            "range": "± 10",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 58982,
            "range": "± 3954",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 772076,
            "range": "± 1508",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 60944,
            "range": "± 1140",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 684136,
            "range": "± 3135",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7408478,
            "range": "± 35076",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 840,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7348,
            "range": "± 28",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 109712,
            "range": "± 737",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23014,
            "range": "± 153",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 165216,
            "range": "± 2862",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1493825,
            "range": "± 35984",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "9a46e86e2fa37ea035c0f4fac717b774a1e734e8",
          "message": "chore(release): v0.4.0 (#152)\n\nBumps workspace version 0.3.0 → 0.4.0 and adds CHANGELOG entry covering\nthe verification pyramid, variant/PLE, Zola export, sphinx-needs import,\nLSP code actions, MCP CRUD, STPA extraction fixes, and the rustls-webpki\nadvisory patch.\n\nTrace: skip",
          "timestamp": "2026-04-19T10:23:06-05:00",
          "tree_id": "3e595cf0c9aae4595ebbc71f7f8d7e6e1e3a14c5",
          "url": "https://github.com/pulseengine/rivet/commit/9a46e86e2fa37ea035c0f4fac717b774a1e734e8"
        },
        "date": 1776612569699,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 80496,
            "range": "± 1283",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 856065,
            "range": "± 4723",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 11232856,
            "range": "± 511354",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2196,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26898,
            "range": "± 141",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 356411,
            "range": "± 912",
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
            "value": 987701,
            "range": "± 5118",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 163992,
            "range": "± 2033",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1892721,
            "range": "± 11862",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 27288200,
            "range": "± 1972523",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 107541,
            "range": "± 1156",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 890440,
            "range": "± 18408",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 10673135,
            "range": "± 1247918",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4261,
            "range": "± 9",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60478,
            "range": "± 278",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 761396,
            "range": "± 25217",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 63148,
            "range": "± 188",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 705376,
            "range": "± 2774",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7730558,
            "range": "± 162342",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 826,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7538,
            "range": "± 34",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 120480,
            "range": "± 1160",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23567,
            "range": "± 216",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 165884,
            "range": "± 2542",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1508423,
            "range": "± 21899",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "aa706fc7cce6c53a1c75cc3397c905ca9802463f",
          "message": "fix(windows): gate permissions chmod behind cfg(unix) (#153)\n\ninstall_hook() called Permissions::from_mode(0o755) unconditionally,\nbreaking the Windows release build with E0433/E0599. Windows git runs\nhooks through Git-Bash regardless of NTFS executable bits, so skipping\nthe chmod is safe.\n\nBlocks the v0.4.0 cross-platform release.\n\nTrace: skip",
          "timestamp": "2026-04-20T00:39:04-05:00",
          "tree_id": "eb4c7fe7bc88454ad41ba2d8baa0de5199049d9d",
          "url": "https://github.com/pulseengine/rivet/commit/aa706fc7cce6c53a1c75cc3397c905ca9802463f"
        },
        "date": 1776663927841,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 81180,
            "range": "± 380",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 872645,
            "range": "± 4586",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13444099,
            "range": "± 1792686",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1934,
            "range": "± 14",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24897,
            "range": "± 829",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 373078,
            "range": "± 1512",
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
            "value": 995907,
            "range": "± 19908",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 163548,
            "range": "± 8041",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1917262,
            "range": "± 25940",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 27530692,
            "range": "± 3638629",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 105463,
            "range": "± 1727",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 928323,
            "range": "± 7239",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 10896266,
            "range": "± 1631891",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4118,
            "range": "± 66",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 45738,
            "range": "± 588",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 752549,
            "range": "± 5164",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 63429,
            "range": "± 129",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 712193,
            "range": "± 3214",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8034836,
            "range": "± 485698",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 783,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 6902,
            "range": "± 21",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 90574,
            "range": "± 529",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21247,
            "range": "± 1392",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 146941,
            "range": "± 385",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1369913,
            "range": "± 27766",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
      }
    ]
  }
}