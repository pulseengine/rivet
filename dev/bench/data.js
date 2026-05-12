window.BENCHMARK_DATA = {
  "lastUpdate": 1778612480051,
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
          "id": "5c8d0d7430679e50df21d6ebffef1c57488c4591",
          "message": "fix(aspice): seed validates clean after init — declare allocated-from + add stakeholder-req parent (#233)\n\nRound-3 fresh-user dogfood (sandbox /tmp/aspice-seed-only) confirmed\nthat `rivet init --preset aspice && rivet validate` ships a seed\nthat fails validation with 2 errors out of the box:\n\n  ERROR: [SYSREQ-001] link 'derives-from' requires at least 1 target,\n                       found 0\n  ERROR: [SWARCH-001] link type 'allocated-from' is not defined in\n                       the schema — declare it in link-types: or\n                       remove the link\n  Result: FAIL (2 errors)\n\nTwo real bugs in the shipped aspice preset:\n\n1. The `common` schema declares `allocated-to` with `inverse:\n   allocated-from`, registering only the forward token `allocated-to`.\n   ASPICE's SWE.2 traceability rule (`swe2-allocated-from-swe1`)\n   uses `allocated-from` as the *forward* direction (sw-arch-component\n   allocates from sw-req), and the seed's SWARCH-001 uses it the\n   same way. The validator correctly rejects the use because no\n   schema registers `allocated-from` as a forward link-type. This\n   is exactly the gotcha-G.3 footgun the quickstart documents.\n\n2. `system-req` requires `derives-from -> [stakeholder-req]` per the\n   ASPICE `sys2-derives-from-sys1` rule. The seed had SYSREQ-001\n   with no `derives-from`, so the rule fails on the first\n   `rivet validate` post-init.\n\nChanges:\n\n- `schemas/aspice.yaml`: declare `allocated-from` as a forward\n  link-type in ASPICE's `link-types:` block, with `inverse:\n  allocated-to`, restricted to `source-types: [sw-arch-component]`\n  / `target-types: [sw-req, system-arch-component]`. This matches\n  what the existing `swe2-allocated-from-swe1` traceability rule\n  already requires and what artifact-types' link-fields already\n  reference (lines 97-98, 142-143). Schema is now internally\n  consistent.\n\n- `rivet-cli/src/main.rs` (`ASPICE_SAMPLE` const): add a\n  STKHR-001 stakeholder-req as the V-model root, wire SYSREQ-001's\n  `derives-from` to it. The chain\n    STKHR-001 (stakeholder-req)\n      ← derives-from\n    SYSREQ-001 (system-req)\n      ← derives-from\n    SWREQ-001 (sw-req)\n      ← allocated-from\n    SWARCH-001 (sw-arch-component)\n  satisfies all three left-V ASPICE rules\n  (sys2-derives-from-sys1, swe1-derives-from-sys,\n  swe2-allocated-from-swe1).\n\nVerified locally:\n\n  $ rivet init --preset aspice && rivet validate\n  INFO: [SWREQ-001] Every SW requirement should be verified by at\n                     least one verification measure\n  INFO: [SYSREQ-001] Every system requirement should be verified by\n                     at least one verification measure\n  Result: PASS (0 warnings)\n\nResult PASS with 0 errors and 0 warnings. The two remaining INFOs\nare lifecycle-coverage hints — they suggest the natural next step\n(authoring sw-verification / sys-verification artifacts) and do\nnot block the validate gate.\n\nImplements: REQ-007, REQ-010\nRefs: FEAT-001",
          "timestamp": "2026-04-28T11:34:29-05:00",
          "tree_id": "ccec8c3bcf2ab63147f83114260e62ac23a5623a",
          "url": "https://github.com/pulseengine/rivet/commit/5c8d0d7430679e50df21d6ebffef1c57488c4591"
        },
        "date": 1777394501160,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 80679,
            "range": "± 775",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 861766,
            "range": "± 5645",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12862086,
            "range": "± 671786",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1935,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24807,
            "range": "± 51",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 365101,
            "range": "± 1458",
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
            "range": "± 4",
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
            "value": 1172137,
            "range": "± 55243",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 158814,
            "range": "± 1738",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1827003,
            "range": "± 32436",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 27008585,
            "range": "± 1258304",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 121023,
            "range": "± 548",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1049867,
            "range": "± 23174",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 12010921,
            "range": "± 647419",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4109,
            "range": "± 72",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 45155,
            "range": "± 258",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 745164,
            "range": "± 3783",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 56823,
            "range": "± 251",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 689300,
            "range": "± 6265",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7714413,
            "range": "± 105346",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 766,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 6675,
            "range": "± 24",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 90893,
            "range": "± 1359",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22240,
            "range": "± 156",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 149764,
            "range": "± 1158",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1367476,
            "range": "± 17937",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "3e61633aad50d81b51b57f5459066f3b26de3812",
          "message": "feat(mcp): discoverability — --list-tools, --probe, rivet docs mcp (#231)\n\n* feat(mcp): add --list-tools and --probe flags for discoverability\n\n`rivet mcp --list-tools` walks the registered tool router and prints\nthe catalog (15 tools today) as either a human-readable table or — with\n`--format json` — the JSON-RPC `tools/list` payload exactly as the\nstdio server would emit it. Does not start the server and does not\nneed a project to be present, so it works as a fast capability probe\neven before any artifact files exist.\n\n`rivet mcp --probe` runs the in-process equivalent of\n`tools/call rivet_list` (no args) against the current project and\nprints the decoded `result.content[0].text` payload — the same envelope\nan MCP client would observe — without standing up a stdio server. Used\nas a smoke test for AI integrators verifying their project is\nreachable through MCP.\n\nBoth flags reuse the same handlers the wire server dispatches to, so\ntheir output cannot drift from what a real client would see.\n\nImplements: REQ-007\nRefs: FEAT-010\n\n* docs(mcp): embed `rivet docs mcp` topic — JSON-RPC framing, tool catalog, gotchas\n\nAdds an embedded documentation topic for the MCP server, registered in\nthe docs registry so `rivet docs mcp` and the `rivet docs` listing both\nsurface it. Companion to the new `rivet mcp --list-tools` and\n`rivet mcp --probe` flags.\n\nCovers: what the server exposes; the line-delimited JSON-RPC over stdio\nwire format (and the LSP Content-Length pitfall it is NOT); the\n3-message handshake including the easily-forgotten\n`notifications/initialized` notification; the 15-tool catalog with\ninputs; the `result.content[0].text` double-parse envelope gotcha; three\nsmoke-test recipes (`--list-tools`, `--probe`, raw bash JSON-RPC); the\nmutate-then-`rivet_reload` convention; and a pointer to the upstream\nMCP spec for clients building from scratch.\n\nAlso amends `rivet docs cli` to mention the new `mcp` subflags and\ncross-link to `rivet docs mcp`.\n\nTrace: skip",
          "timestamp": "2026-04-28T11:35:28-05:00",
          "tree_id": "287d91262cde241c97f712ab28e94162239a7621",
          "url": "https://github.com/pulseengine/rivet/commit/3e61633aad50d81b51b57f5459066f3b26de3812"
        },
        "date": 1777394510386,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 79260,
            "range": "± 542",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 840126,
            "range": "± 13297",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14182540,
            "range": "± 709060",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2159,
            "range": "± 12",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24999,
            "range": "± 272",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 380157,
            "range": "± 5408",
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
            "range": "± 1",
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
            "value": 1192209,
            "range": "± 10436",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 152716,
            "range": "± 637",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1778237,
            "range": "± 17903",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 30317874,
            "range": "± 2408926",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 124320,
            "range": "± 1299",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1036834,
            "range": "± 16631",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 15515942,
            "range": "± 1396823",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4295,
            "range": "± 22",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60122,
            "range": "± 455",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 782189,
            "range": "± 19922",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 59943,
            "range": "± 210",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 673755,
            "range": "± 15804",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 9582164,
            "range": "± 750345",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 797,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7768,
            "range": "± 49",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 119964,
            "range": "± 2121",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22902,
            "range": "± 117",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 161352,
            "range": "± 2813",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1501674,
            "range": "± 26224",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "91b8ea2afcccca117fdbb43f67ee5f09917179b5",
          "message": "chore(release): v0.5.1 — first-contact polish (#235)\n\n* chore(release): v0.5.1 — first-contact polish\n\nWorkspace, vscode-rivet, and npm root package versions bumped to 0.5.1.\nPlatform packages stay on the release-npm.yml override path (per the\n0.5.0 convention).\n\nWhat's in 0.5.1 (post-0.5.0 dogfood polish):\n\n- docs(quickstart): rewrite for fresh-user clarity (#230). Two\n  clean-room dogfood passes + three scenario-based passes surfaced\n  six confusion points; all fixed. Wall-time wins: STPA bring-up\n  13min -> 36s; Polarion -> ASPICE overlay 7min -> 3.8min.\n- fix(aspice): seed validates clean after init (#233). Two real bugs\n  in the shipped aspice preset (undeclared `allocated-from` link-type,\n  missing stakeholder-req parent) — `rivet init --preset aspice &&\n  rivet validate` now returns PASS.\n- feat(mcp): discoverability (#231). New `rivet mcp --list-tools` and\n  `rivet mcp --probe` flags (no JSON-RPC required to enumerate the\n  tool catalog or smoke-test the server) plus a new ~1400-word\n  `rivet docs mcp` topic covering wire format, handshake, tool\n  catalog, and the response-envelope gotcha.\n\nVerified: cargo check, cargo clippy --workspace -- -D warnings,\ncargo test -p rivet-cli, `rivet init --preset aspice && rivet validate`\nreturns PASS, `rivet docs mcp` prints the new topic.\n\nTrace: skip\n\n* chore(release): fix CHANGELOG ArtifactIdValidity false-positives\n\nPR #235's Docs Check failed because the 0.5.1 changelog mentioned\naspice preset SEED artifact IDs (SWARCH-001, SWREQ-001, SYSREQ-001,\nSTKHR-001) in prose. Those IDs live in the embedded preset string\nconstant, not as artifacts in this repo's store, so the rivet docs\ncheck ArtifactIdValidity invariant correctly flagged them as broken\nreferences.\n\nFix: replace the seed IDs with their artifact-type names\n(sw-arch-component, sw-req, system-req, stakeholder-req). Reads\nbetter as prose anyway; no information loss.\n\nTrace: skip",
          "timestamp": "2026-04-28T14:33:48-05:00",
          "tree_id": "54c55fcfafec03cbd3d9cd74865419df886164f2",
          "url": "https://github.com/pulseengine/rivet/commit/91b8ea2afcccca117fdbb43f67ee5f09917179b5"
        },
        "date": 1777406183110,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 80636,
            "range": "± 293",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 866888,
            "range": "± 9312",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13113855,
            "range": "± 1025077",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1915,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25126,
            "range": "± 186",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 368743,
            "range": "± 3001",
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
            "value": 1181694,
            "range": "± 29307",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 158886,
            "range": "± 637",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1815559,
            "range": "± 9754",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 25078596,
            "range": "± 315749",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 121364,
            "range": "± 418",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1046434,
            "range": "± 12375",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 11399767,
            "range": "± 66862",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4135,
            "range": "± 9",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 44854,
            "range": "± 145",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 737455,
            "range": "± 3225",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 59837,
            "range": "± 215",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 695869,
            "range": "± 3441",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7761165,
            "range": "± 32395",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 763,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 6701,
            "range": "± 32",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 92347,
            "range": "± 405",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21798,
            "range": "± 106",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 147006,
            "range": "± 456",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1355559,
            "range": "± 19085",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "4ef103cb09618632bde0589c070aaceb68012531",
          "message": "feat(schema): rivet schema migrate Phase 1 — diff engine + plan/apply/abort + dev-to-aspice recipe (#238)\n\n* feat(schemas): canned dev-to-aspice migration recipe\n\nPhase 1 of issue #236. Ships exactly one mechanical migration recipe:\nthe most common \"outgrew the dev preset\" path. Renames `requirement`,\n`feature`, and `design-decision` to their ASPICE 4.0 equivalents and\nrewrites `satisfies` links to `derives-from`. Default\n`unmapped-fields: keep-as-orphan` policy stashes unmapped fields\nunder `fields.legacy.*` so nothing is lost on migration.\n\nImplements: REQ-010\n\nCo-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>\n\n* feat(schema): diff engine for schema migrations\n\nPhase 1 of issue #236. New `rivet_core::migrate` module provides:\n\n* MigrationRecipe / MigrationRecipeFile — YAML recipe shape with\n  type-rewrites, link-rewrites, and policies (unmapped-fields:\n  drop|keep-as-orphan|strict; unmapped-link-types: keep|drop|strict).\n* diff_artifacts() — given source artifacts + recipe + optional\n  target schema, computes a RewriteMap of PlannedChange entries\n  classified as mechanical / decidable-with-policy / conflict.\n* apply_to_file() — mechanical-only YAML rewrite at the\n  serde_yaml::Value level. Bails loudly on conflict-class changes.\n* MigrationLayout / MigrationState — directory-layout helpers for\n  `.rivet/migrations/<ts>/` with plan.yaml, manifest.yaml, state, and\n  snapshot/.\n* copy_tree / remove_tree — recursive fs helpers used by the\n  CLI's snapshot + abort path.\n\nEmbeds the shipped dev-to-aspice recipe via include_str! and exposes\nembedded_migration_recipe() for CLI lookup.\n\nEight unit tests cover: type-rename emission, link-rename\ndeduplication, unmapped-field detection with policy, apply rewrites\ntype+link, keep-as-orphan stash, conflict bail, recipe parse, state\nroundtrip.\n\nImplements: REQ-010\n\nCo-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>\n\n* feat(cli): rivet schema migrate — plan/apply/abort/status/finish\n\nPhase 1 of issue #236. New `rivet schema migrate <target>` subcommand:\n\n* default (no flag): plan-only — writes\n  `.rivet/migrations/<YYYYMMDD-HHMM>-<src>-to-<tgt>/plan.yaml` plus\n  manifest and a `state` file with PLANNED. Prints a summary of\n  mechanical / decidable / conflict counts.\n* `--apply`: rewrites artifact YAML in place. Bails loudly with\n  exit 1 if the plan has any conflict-class changes (Phase 1 is\n  mechanical-only). Captures a byte-faithful snapshot of `artifacts/`\n  and `rivet.yaml` before rewriting.\n* `--abort`: restores from snapshot and deletes the migration\n  directory. Byte-identical rollback for the snapshotted subtree.\n* `--status`: prints the current state machine pointer +\n  recipe/changeset summary from manifest.yaml.\n* `--finish`: deletes the snapshot after confirming COMPLETE state.\n\nRecipe resolution: tries `<schemas-dir>/migrations/<src>-to-<tgt>.yaml`\nfirst, then falls back to the embedded recipe set. Phase 1 ships\none recipe; future phases will gain a registry. Source preset is\ninferred from `rivet.yaml` (first non-`common` schema entry).\n\nImplements: REQ-007\n\nCo-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>\n\n* docs(schema): embedded rivet docs schema-migrate topic\n\nNew `rivet docs schema-migrate` topic covering the Phase 1 CLI\nsurface (plan / apply / abort / status / finish), the state\nmachine, the storage layout under `.rivet/migrations/<ts>/`, the\nrecipe format with action classes, and the policy semantics for\nunmapped fields and link types. Also lists what Phase 1 deliberately\ndefers (conflict markers, --continue/--skip/--edit, dashboard,\nprovenance entries).\n\nAdds a one-line entry under the existing `rivet docs cli` schema\ncommands section pointing users at the new topic.\n\nTrace: skip\n\n* test(schema): integration tests for migrate apply + abort + roundtrip\n\nFive end-to-end tests covering the Phase 1 surface area of issue #236:\n\n* plan_dev_to_aspice_writes_plan_and_manifest — fresh dev project,\n  default plan invocation creates a single migration directory\n  with plan.yaml, manifest.yaml, and `state == PLANNED`.\n* apply_rewrites_dev_to_aspice_and_validate_passes — `--apply` on\n  a clean dev project rewrites types and links, the migrated tree\n  has no `requirement` / `feature` left, and after patching\n  `rivet.yaml` to load aspice schemas, `rivet validate` exits 0.\n* abort_restores_byte_identical_artifacts — pre-migration snapshot\n  is captured, `apply` mutates files, `abort` restores them\n  byte-identically (compared via a recursive directory walk).\n* finish_deletes_snapshot_and_keeps_manifest — `--finish` on a\n  COMPLETE migration removes `snapshot/` but keeps `manifest.yaml`\n  for audit.\n* roundtrip_dev_to_aspice_keeps_artifact_count_constant — the\n  half-roundtrip we have without an aspice-to-dev recipe; asserts\n  no spurious additions/deletions through the rewrite. Full A->B->A\n  test deferred until a reverse recipe ships.\n\nVerifies: REQ-007, REQ-010\n\nCo-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>\n\n---------\n\nCo-authored-by: Claude Opus 4.7 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-04-28T22:55:37-05:00",
          "tree_id": "93b9719576c4dcf18075cd56991da31ee7486541",
          "url": "https://github.com/pulseengine/rivet/commit/4ef103cb09618632bde0589c070aaceb68012531"
        },
        "date": 1777435317679,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 63236,
            "range": "± 221",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 675001,
            "range": "± 3297",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 9845732,
            "range": "± 751316",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1487,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 18426,
            "range": "± 598",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 270162,
            "range": "± 1051",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 84,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/1000",
            "value": 84,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 84,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 909961,
            "range": "± 4640",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 129084,
            "range": "± 1045",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1493483,
            "range": "± 9162",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 24968896,
            "range": "± 2479202",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 92258,
            "range": "± 698",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 776805,
            "range": "± 34669",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 9564225,
            "range": "± 1081859",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3201,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 33739,
            "range": "± 113",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 565708,
            "range": "± 4774",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 47839,
            "range": "± 631",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 537162,
            "range": "± 2437",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 6201714,
            "range": "± 236584",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 606,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 5379,
            "range": "± 10",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 70013,
            "range": "± 196",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 18981,
            "range": "± 64",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 133143,
            "range": "± 335",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1253318,
            "range": "± 6367",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "8d8554c6bfcf567b172fa9ca1b104a1ea3942dcb",
          "message": "feat(validate): cited-source typed field + sha256 stamp Phase 1 — kind: file backend (#239)\n\n* feat(schema): cited-source as first-class typed field with URI scheme allowlist\n\nAdds `cited-source` as a typed schema construct with shape\n`{ uri, kind, sha256, last-checked }`. Defines `CitedSourceKind`\n(file | url | github | oslc | reqif | polarion), parses the YAML\nmapping into a typed struct, and rejects URI schemes outside the\nallowlist (file/http/https/github/oslc/reqif/polarion) — defence\nagainst arbitrary schemes from untrusted YAML.\n\nPhase 1 only implements `kind: file`; remote kinds round-trip\nunchanged. Declares the field on `dev.yaml`'s `requirement` type so\nprojects can opt in incrementally.\n\nImplements: REQ-010\nRefs: #237\n\n* feat(cli): rivet validate --strict-cited-sources + rivet check sources\n\nWires the Phase 1 cited-source backend into the existing CLI:\n\n- `rivet validate` now emits `cited-source-drift` (Severity::Warning),\n  `cited-source-shape` (Error), and `cited-source-stale` (Info)\n  diagnostics for `kind: file` sources. Default behaviour is advisory;\n  `--strict-cited-sources` promotes drift / missing-hash to Error.\n- `--check-remote-sources` flag accepted but no-op for Phase 1 — emits\n  an Info noting the remote backend ships in Phase 2.\n- `rivet check sources` lists every artifact with a `cited-source`\n  field and its current hash status (MATCH / DRIFT / MISSING-HASH /\n  READ-ERROR / SKIPPED-REMOTE / SHAPE-ERROR). `--update` prompts y/N\n  per drift; `--update --apply` rewrites the artifact YAML in batch.\n- JSON output via `--format json` for machine consumers.\n\nImplements: REQ-007, REQ-004\nRefs: #237\n\n* docs(schema): rivet docs schema-cited-sources topic + CLI doc updates\n\nAdds `rivet docs schema-cited-sources` covering the field shape, the\nper-kind backend behaviour table (with Phase 2 backends marked), URI\nscheme allowlist (security model), `last-checked` semantics, and CLI\nsurface examples. Mentions the upstream-ref migration caveat (Phase 1\nadds the field alongside, full migration after #236 lands).\n\nUpdates `rivet docs cli` to list the `rivet check sources` group and\nthe `--strict-cited-sources` flag.\n\nRefs: #237\n\n* test(validate): cited-source drift fixture round-trip\n\nSix integration tests exercising the Phase 1 acceptance criteria from\nissue #237:\n\n- validate PASSes when the stamped sha256 matches the file\n- editing the file emits a `cited-source-drift` diagnostic\n- `validate --strict-cited-sources` exits 1 on drift\n- `rivet check sources --update --apply` rewrites the artifact YAML\n  and the next validate run passes cleanly\n- `rivet check sources` lists entries (MATCH status) in text mode\n- arbitrary URI schemes (e.g. `ftp://`) are rejected with a\n  cited-source-shape error — SSRF / exfiltration mitigation\n\nVerifies: REQ-004\nRefs: #237",
          "timestamp": "2026-04-28T23:00:46-05:00",
          "tree_id": "34076140c6bd10827f0acf6150f60f869b031d0c",
          "url": "https://github.com/pulseengine/rivet/commit/8d8554c6bfcf567b172fa9ca1b104a1ea3942dcb"
        },
        "date": 1777436032511,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 80468,
            "range": "± 1223",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 861553,
            "range": "± 14857",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12638622,
            "range": "± 1399758",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2176,
            "range": "± 60",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24808,
            "range": "± 609",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 362497,
            "range": "± 16746",
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
            "value": 1181210,
            "range": "± 22456",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 161435,
            "range": "± 1554",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1940618,
            "range": "± 22714",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 28431689,
            "range": "± 1353121",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 124565,
            "range": "± 2567",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1049911,
            "range": "± 25724",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 12073090,
            "range": "± 497967",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4407,
            "range": "± 16",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 61222,
            "range": "± 232",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 752934,
            "range": "± 62477",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 60561,
            "range": "± 508",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 705988,
            "range": "± 2653",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8066975,
            "range": "± 334991",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 757,
            "range": "± 36",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7516,
            "range": "± 150",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 105771,
            "range": "± 1001",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23916,
            "range": "± 228",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 169277,
            "range": "± 1579",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1600937,
            "range": "± 25127",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "05c9400b1ed2e684b5df4d969a0c8cdc67957aa0",
          "message": "feat(mutants): canonical cargo-mutants template + docs + schema fields (#229)\n\nFirst in-scope cut at the cargo-mutants generalization story (#185).\n\n- templates/cargo-mutants/{mutants.toml, mutants.yml, README.md} —\n  reusable config + nightly + manual-dispatch GitHub Actions workflow,\n  extracted from rivet's pre-push smoke profile.\n- docs/mutation-testing.md — pattern doc covering when to run, ASIL/DAL\n  score targets (≥0.70 ASIL A → ≥0.90 ASIL D), mutants.toml skip\n  patterns, per-function skip attributes, and how the new schema fields\n  wire results back into rivet traceability.\n- schemas/score.yaml — `mutation-score-target` (number) on test-spec to\n  declare the suite floor, `mutation-score` plus mutants-tested /\n  killed / missed / timeout / unviable counts on test-exec to record\n  measured runs.\n\nVerified: cargo test -p rivet-core --lib + integration suites green\n(857 + 5 + 4 tests). rivet validate diagnostics unchanged from\norigin/main (6 pre-existing errors in spar-external fixture, untouched\nhere). Synthetic project that loads schemas: [common, score] accepts\nall new fields.\n\nOut of scope per the autonomous-run scoping confirmed in the issue's\n2026-04-26 triage comment:\n- Cross-repo adoption issues for kiln/loom/gale/meld must be filed\n  from a session with broader org access.\n- Dashboard view across repos depends on #188.\n\nImplements: REQ-010\nRefs: #185\n\nCo-authored-by: Claude <noreply@anthropic.com>",
          "timestamp": "2026-04-28T23:40:29-05:00",
          "tree_id": "4f10b071491acb46ae9f232c8c7831683767c42f",
          "url": "https://github.com/pulseengine/rivet/commit/05c9400b1ed2e684b5df4d969a0c8cdc67957aa0"
        },
        "date": 1777438602528,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 80474,
            "range": "± 378",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 844445,
            "range": "± 7414",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 11366536,
            "range": "± 581943",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2138,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26687,
            "range": "± 146",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 371107,
            "range": "± 1034",
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
            "value": 94,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1190063,
            "range": "± 33744",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 165633,
            "range": "± 3017",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1920981,
            "range": "± 27114",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 23408112,
            "range": "± 311314",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 123143,
            "range": "± 752",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1042679,
            "range": "± 19623",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 10596288,
            "range": "± 370139",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4322,
            "range": "± 18",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 59280,
            "range": "± 266",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 753906,
            "range": "± 2410",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 62063,
            "range": "± 342",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 698280,
            "range": "± 5958",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7367647,
            "range": "± 116368",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 731,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7282,
            "range": "± 33",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 107306,
            "range": "± 1374",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23638,
            "range": "± 73",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 169831,
            "range": "± 1218",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1606567,
            "range": "± 15166",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "79bb5c39a7de92b51661d7d22cc29da077fa1604",
          "message": "feat(schemas): vv-coverage — repo-status type for V&V technique tracking (#232)\n\nIntroduces `schemas/vv-coverage.yaml` and registers it as a built-in\nschema. Defines a single artifact type, `repo-status`, capturing:\n\n  - `repo` (required) — canonical `owner/name` join key\n  - `techniques-applied` (required, list<string>) — V&V techniques\n    present in the repo\n  - `techniques-gated-in-ci` (optional, list<string>) — subset that\n    blocks merge or release\n  - `notes` (optional, text) — free-form coverage commentary\n\nThe split between \"applied\" and \"gated-in-ci\" is the load-bearing\ndistinction the cross-repo coverage matrix renders: the matrix shows\ndrift between \"we have the technique\" and \"the technique enforces\".\n\nSub-issue #1 of #188; the matrix CLI surface (`rivet coverage --matrix`)\nand the cross-repo aggregator land in follow-up PRs.\n\nRecommended technique identifiers documented in the schema description\n(verus / kani / rocq / lean / aeneas / mirai / proptest / loom / miri /\nasan / tsan / lsan / fuzz / mutation / criterion / differential /\nrivet-validate / cargo-deny / cargo-audit / semver-check). Authors may\nuse identifiers outside this set; the aggregator surfaces unknowns\nrather than rejecting them.\n\nVerification:\n- 9 new integration tests in `rivet-core/tests/vv_coverage_schema.rs`\n  (schema loads, parses, registered in SCHEMA_NAMES, declares\n  `repo-status` with the three documented fields, required/optional\n  shape matches the aggregator contract, both technique fields are\n  `list<string>`, schema extends `common`).\n- `cargo test -p rivet-core --lib` — 857 pass.\n- `cargo test -p rivet-core --test schema_agent_pipelines` — 5 pass\n  (this suite iterates over SCHEMA_NAMES; new entry round-trips).\n- `cargo fmt --all -- --check` — clean.\n- `rivet validate` diagnostics identical to origin/main (6 pre-existing\n  errors in the spar-external fixture, 62 warnings — unchanged).\n\nRefs: #188\nRefs: #184\n\nImplements: REQ-010\n\nCo-authored-by: Claude <noreply@anthropic.com>",
          "timestamp": "2026-04-28T23:41:41-05:00",
          "tree_id": "40fec75adf194d4bdaa04994ce7d99b79e35046c",
          "url": "https://github.com/pulseengine/rivet/commit/79bb5c39a7de92b51661d7d22cc29da077fa1604"
        },
        "date": 1777438964917,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 80301,
            "range": "± 681",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 858449,
            "range": "± 12405",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14680589,
            "range": "± 1523770",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2142,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25611,
            "range": "± 117",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 363532,
            "range": "± 33161",
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
            "value": 1194327,
            "range": "± 36164",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 160988,
            "range": "± 2139",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1921067,
            "range": "± 43942",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 35611050,
            "range": "± 4751814",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 123620,
            "range": "± 760",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1070611,
            "range": "± 42271",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 15890660,
            "range": "± 1683945",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4296,
            "range": "± 28",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 58899,
            "range": "± 1098",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 762004,
            "range": "± 5644",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 63537,
            "range": "± 1147",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 706322,
            "range": "± 9328",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7848700,
            "range": "± 236400",
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
            "value": 7235,
            "range": "± 194",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 121809,
            "range": "± 964",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 24702,
            "range": "± 200",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 171811,
            "range": "± 5345",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1602101,
            "range": "± 27446",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "4b425598f6205a2f995bc4f3096a886156141805",
          "message": "docs(pre-commit): publish canonical 21-hook template + tier docs (#222)\n\nAdds `templates/pre-commit/.pre-commit-config.yaml` as the\nversioned, copy-pasteable source of truth for PulseEngine Rust\nrepositories, and `docs/pre-commit.md` documenting the rationale\nper hook plus an advisory T1 / T2 / T3 tier system.\n\nEach hook in the template carries an inline tier annotation so\nadopters can grep-trim to their assurance level. `CUSTOMIZE`\nmarkers flag the per-project knobs (rust-toolchain pinning,\nartifact-path globs, mutation crate selection).\n\nRefs: #186\n\nCo-authored-by: Claude <noreply@anthropic.com>",
          "timestamp": "2026-04-28T23:42:16-05:00",
          "tree_id": "77ef1167d761a9cddaf58bc56d64305046338922",
          "url": "https://github.com/pulseengine/rivet/commit/4b425598f6205a2f995bc4f3096a886156141805"
        },
        "date": 1777439020374,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 81316,
            "range": "± 555",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 880381,
            "range": "± 66159",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14693688,
            "range": "± 1800220",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1942,
            "range": "± 33",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24657,
            "range": "± 46",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 367317,
            "range": "± 8827",
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
            "value": 1182777,
            "range": "± 16946",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 166292,
            "range": "± 726",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1907226,
            "range": "± 7829",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 29814384,
            "range": "± 3121335",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 120355,
            "range": "± 2455",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1045349,
            "range": "± 10014",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 15908404,
            "range": "± 1551868",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4133,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 45331,
            "range": "± 109",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 734069,
            "range": "± 15525",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 63621,
            "range": "± 395",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 714834,
            "range": "± 7196",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8291535,
            "range": "± 799534",
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
            "value": 6555,
            "range": "± 85",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 91326,
            "range": "± 709",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23142,
            "range": "± 111",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 159930,
            "range": "± 1507",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1497315,
            "range": "± 15917",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "189f020e9b36242556cd77b3a553299d1a84910a",
          "message": "chore(release): v0.6.0 — schema migrate + cited-source (#240)\n\nTwo marquee features landing together — both surfaced during the\npost-0.5.0 fresh-user dogfood (#236, #237):\n\n- rivet schema migrate (#238) — git-rebase-style preset migration\n  with diff engine, plan/apply/abort/status/finish state machine,\n  full snapshot rollback, and one canned dev-to-aspice recipe.\n- cited-source typed field + sha256 stamp (#239) — first-class\n  schema affordance for artifacts citing external sources, with\n  the kind: file backend, cited-source-drift diagnostic, and a\n  new rivet check sources --update workflow.\n\nWorkspace, vscode-rivet, and npm root package versions bumped to\n0.6.0. Platform packages stay on the release-npm.yml override path.\n\nTrace: skip",
          "timestamp": "2026-04-29T00:26:49-05:00",
          "tree_id": "24d5a95f9fd034b424a77f8d455006ffe4d13fce",
          "url": "https://github.com/pulseengine/rivet/commit/189f020e9b36242556cd77b3a553299d1a84910a"
        },
        "date": 1777443387007,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 80903,
            "range": "± 1840",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 844400,
            "range": "± 5395",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 10721000,
            "range": "± 239834",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2175,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26689,
            "range": "± 80",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 370408,
            "range": "± 1447",
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
            "value": 1180350,
            "range": "± 7367",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 161820,
            "range": "± 1777",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1884796,
            "range": "± 9014",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 22364354,
            "range": "± 211537",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 121774,
            "range": "± 1100",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1046744,
            "range": "± 8712",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 10292601,
            "range": "± 97675",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4291,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 58973,
            "range": "± 257",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 765402,
            "range": "± 3001",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 61622,
            "range": "± 296",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 687974,
            "range": "± 4135",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7496656,
            "range": "± 34646",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 774,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7122,
            "range": "± 20",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 116490,
            "range": "± 450",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23587,
            "range": "± 846",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 169725,
            "range": "± 1449",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1592868,
            "range": "± 8297",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "c47549b323278d86838de9888a194cadea540146",
          "message": "feat(validate): warn when prose mentions an artifact id without a typed link (#234)\n\nCloses #207.\n\nAdd a structural-validation pass that scans each artifact's\n`description` (and every string-typed value in its `fields` map) for\ntokens matching `\\b[A-Z][A-Z0-9]*-[0-9]+\\b`. When a match resolves to\nan artifact in the corpus and the mentioning artifact has no typed\nlink to it, emit a Warning-severity diagnostic\n(`prose-mention-without-typed-link`).\n\nSuppression cases (matching the issue body):\n  * the mention is the artifact's own id (self-reference),\n  * the mentioned id does not resolve in the corpus (broken refs are\n    a separate concern),\n  * the artifact already has any typed link to that id.\n\nPer-(artifact, mentioned-id) dedup mirrors the unknown-link-type\npass's policy so repeated mentions of the same id yield one warning.\n\nThe regex is compiled once via `LazyLock<Regex>` (mirroring\n`rivet-core/src/markdown.rs`).\n\nSix unit tests cover every Tests-bullet from #207 plus dedup:\n  * warn fires on bare mention,\n  * typed link suppresses warn,\n  * self-id mention suppresses warn,\n  * unresolved id suppresses warn,\n  * string-typed `fields` value is scanned,\n  * three mentions of one id dedupe to one warning.\n\nNote on escalation: the issue mentions a hypothetical\n`rivet validate --strict` to escalate to Error. rivet already exposes\n`rivet validate --fail-on warning` which fails the run on any\nwarning; that subsumes the hypothetical flag without a new surface.\nA literal severity-changing `--strict` is left for a follow-up if\nwanted.\n\nImplements: REQ-004\n\nCo-authored-by: Claude <noreply@anthropic.com>",
          "timestamp": "2026-04-29T01:50:38-05:00",
          "tree_id": "4c2f7868278d12a734abc3dc2ae91ba3fd93cea6",
          "url": "https://github.com/pulseengine/rivet/commit/c47549b323278d86838de9888a194cadea540146"
        },
        "date": 1777449261555,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 80316,
            "range": "± 901",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 853198,
            "range": "± 6111",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 15300020,
            "range": "± 759946",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2245,
            "range": "± 20",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25666,
            "range": "± 1703",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 373188,
            "range": "± 6089",
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
            "value": 1196121,
            "range": "± 20584",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 159350,
            "range": "± 1056",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1892683,
            "range": "± 22214",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 40364675,
            "range": "± 2579325",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 139789,
            "range": "± 854",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1228458,
            "range": "± 12566",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 23007524,
            "range": "± 1109328",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4268,
            "range": "± 17",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 61860,
            "range": "± 574",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 841436,
            "range": "± 9204",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 62925,
            "range": "± 230",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 699640,
            "range": "± 13267",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8765951,
            "range": "± 573912",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 828,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7919,
            "range": "± 50",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 108633,
            "range": "± 593",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23191,
            "range": "± 401",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 166329,
            "range": "± 713",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1569682,
            "range": "± 13327",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "67f0e081684f63ad1c1db4606934a75616106696",
          "message": "fix(ci): make Release workflow idempotent on existing tag (#244)\n\nThe \"Create Release\" step in release.yml runs `gh release create\n$VERSION ...` unconditionally. This fails with \"a release with the\nsame tag name already exists\" if a maintainer ran `gh release create`\nmanually right after pushing the tag — which is exactly what\nhappened on every release in the v0.5.0 / v0.5.1 / v0.6.0 sequence.\nNet effect: the release page exists with the changelog notes but\nhas no binary / VSIX / SHA256 assets attached.\n\nFix: make the step idempotent. If `gh release view $VERSION`\nsucceeds (release already exists), `gh release upload --clobber` the\nbuilt assets to the existing release. Otherwise create it the\nnormal way.\n\n`--clobber` lets a re-run overwrite assets that a previous failed\nattempt partially uploaded — also useful when re-running the\nworkflow via workflow_dispatch to backfill assets on an old release.\n\nBackfill plan: after this lands, re-run the Release workflow on\nv0.5.0, v0.5.1, v0.6.0 via workflow_dispatch (or push a no-op tag\nupdate). Each run will detect the existing release and upload the\nbinaries that were built but never published.\n\nTrace: skip",
          "timestamp": "2026-04-29T15:44:31-05:00",
          "tree_id": "ebc5f0b640e0a52bd3881e1a2d48ff6526b1e01b",
          "url": "https://github.com/pulseengine/rivet/commit/67f0e081684f63ad1c1db4606934a75616106696"
        },
        "date": 1777496580819,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 80058,
            "range": "± 805",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 839657,
            "range": "± 3298",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12000720,
            "range": "± 633278",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2134,
            "range": "± 417",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25475,
            "range": "± 71",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 358953,
            "range": "± 11703",
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
            "value": 1176414,
            "range": "± 12391",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 159625,
            "range": "± 1750",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1879574,
            "range": "± 7378",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 24549162,
            "range": "± 1191576",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 137581,
            "range": "± 1207",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1204175,
            "range": "± 10078",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 13168099,
            "range": "± 540558",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4553,
            "range": "± 25",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 59560,
            "range": "± 605",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 744927,
            "range": "± 2186",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 62053,
            "range": "± 377",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 697794,
            "range": "± 2386",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7710440,
            "range": "± 77647",
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
            "value": 7760,
            "range": "± 39",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 113041,
            "range": "± 892",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23483,
            "range": "± 142",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 168427,
            "range": "± 1717",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1569764,
            "range": "± 14130",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "40fdff0377d65e8a0a53c22ca8b0398fc90ac7dd",
          "message": "feat(docs-check): subcommand-coverage gate — walk clap tree + assert each path has an embedded doc (#241)\n\n* feat(docs-check): subcommand-coverage gate — walk clap tree + assert each path has an embedded doc\n\nAdds `--coverage` (and `--strict`) flags to `rivet docs check` that walk\nthe live clap CLI tree, build subcommand paths (`schema/show`,\n`variant/check-all`, …), and cross-reference each against the embedded\ndocs registry. Default is warn-only so the gate can land in CI before\nthe existing inventory of uncovered subcommands is filled.\n\nCoverage rules are layered:\n  1. Exact slug match (`schema/show` → `schema-show` or literal `schema/show`)\n  2. Parent-walk to the next-shorter path\n  3. Manual umbrella mapping via `COVERAGE_TOPIC_MAP` (e.g. `cli` covers\n     most top-level commands; `mutation` covers add/link/modify/…)\n  4. Allow-list for clap-builtin synthetic commands (`help`,\n     `commit-msg-check`)\n\nThe 0.6.0 inventory has 33 uncovered paths across 7 top-level\nsubcommands: variant, baseline, snapshot, runs, pipelines, templates,\nclose-gaps. (`mcp` got its topic in 0.5.1 and is now covered.) The\n`--strict` flag is the future CI gate; `--coverage` alone is the\ndiscovery surface.\n\nTouches the existing `cmd_docs_check` dispatch only to add the new\n`--coverage` early branch — backward compatible with `rivet docs check`\n(no flags).\n\nImplements: REQ-007\nRefs: REQ-004\n\n* docs(docs-check): topic_slugs API + new docs-coverage topic + cli topic update\n\nExposes `docs::topic_slugs()` and `docs::has_topic()` so the\nsubcommand-coverage gate can cross-reference clap subcommand paths\nagainst the embedded TOPICS registry without re-listing slugs.\n\nAdds a new `docs-coverage` reference topic that documents the gate's\nmatching rules, the warn-then-strict ramp-up, and the allow-list policy\nfor clap-builtin synthetic commands.\n\nUpdates the `cli` reference topic to surface `rivet docs check\n--coverage` next to the existing `rivet docs check` entry.\n\nImplements: REQ-007\n\n* test(docs-check): coverage gate fixtures + integration tests\n\nFive integration tests exercising the subcommand-coverage gate's\nexternal contract:\n\n  * coverage_warn_only_exits_zero — the default mode never breaks the\n    build, even when uncovered paths are listed\n  * coverage_strict_fails_when_uncovered_present — `--strict` exits\n    non-zero exactly when the report shows uncovered paths (and exit 0\n    otherwise, so the test stays green when docs catch up)\n  * coverage_json_envelope — `--format json` produces the standard\n    envelope (command/status/total/covered/uncovered/subcommands)\n  * coverage_allowlist_excludes_internal_helpers — `commit-msg-check`\n    is allow-listed and never appears in the uncovered list\n  * docs_check_without_coverage_unchanged — backward compatibility:\n    `rivet docs check` (no flags) still runs the existing doc-vs-reality\n    invariants\n\nAsserts on report SHAPE rather than specific names so the tests stay\ngreen as docs are written for previously-uncovered subcommands.\n\nEight unit tests in `coverage_gate_tests` exercise\n`compute_coverage_rows` against a fake clap tree (one parent + two\nleaves) — the implementation sketch from the task spec — covering\nparent-walk, leaf-specific override, allow-list, umbrella topic_map,\nand a sanity check that every entry in the production\n`COVERAGE_TOPIC_MAP` points at a real topic in `docs::TOPICS`.\n\nVerifies: REQ-007\n\n* ci: wire rivet docs check --coverage into Docs Check job (warn-only)\n\nAdds a new step to the existing `docs-check` job that runs the\nsubcommand-coverage gate in warn-only mode (no `--strict`). This makes\nthe inventory visible in every CI run without breaking the build on the\nexisting seven uncovered top-level commands (variant, baseline,\nsnapshot, runs, pipelines, templates, close-gaps).\n\nThe flip to `--strict` happens in a follow-up commit once the obvious\ngaps have docs.",
          "timestamp": "2026-04-29T16:36:52-05:00",
          "tree_id": "f014554108fa90cae87714dc2f3d24feea073532",
          "url": "https://github.com/pulseengine/rivet/commit/40fdff0377d65e8a0a53c22ca8b0398fc90ac7dd"
        },
        "date": 1777501286521,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 80133,
            "range": "± 2561",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 847636,
            "range": "± 6398",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12873693,
            "range": "± 1176270",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2164,
            "range": "± 9",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 27062,
            "range": "± 136",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 363810,
            "range": "± 1198",
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
            "value": 1189117,
            "range": "± 115708",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 160206,
            "range": "± 803",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1912287,
            "range": "± 12400",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 24968668,
            "range": "± 1117103",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 139305,
            "range": "± 544",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1208939,
            "range": "± 27671",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 15569214,
            "range": "± 1104512",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4384,
            "range": "± 13",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 62040,
            "range": "± 467",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 762544,
            "range": "± 6226",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 61782,
            "range": "± 630",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 703014,
            "range": "± 9102",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7950561,
            "range": "± 228605",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 843,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7912,
            "range": "± 28",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 110427,
            "range": "± 646",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23505,
            "range": "± 471",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 165521,
            "range": "± 573",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1566833,
            "range": "± 8218",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "0371cada8a54111d405ff4265e072a35770041e3",
          "message": "feat(schema): rivet schema migrate Phase 2 — conflict markers + --continue / --skip / --edit (#242)\n\n* feat(schema): rivet schema migrate Phase 2 — conflict resolution UX\n\nPhase 2 of issue #236. Phase 1 (in 0.6.0) shipped the diff engine and\nmechanical apply with snapshot/abort. Phase 2 adds the rebase-style\nconflict-resolution flow.\n\nEngine (rivet-core/src/migrate.rs):\n* `MigrationState::Conflict` joins the existing `Planned / InProgress\n  / Complete` states.\n* `MigrationManifest.resolutions` tracks per-artifact `pending /\n  resolved / skipped` status across `--apply / --continue / --skip /\n  --edit`.\n* `MigrationLayout::current_conflict_path` writes the artifact id the\n  walker paused on; `--status` surfaces it.\n* `diff_artifacts` now emits `FieldValueConflict` for any source\n  field whose value violates the target field's `allowed_values`\n  enum (e.g. `priority: 5` → `[must|should|could|wont]`).\n* `apply_to_file_partial` skips conflict-class entries; the `--apply`\n  walker uses it so mechanical changes always commit before pausing.\n* `write_conflict_markers` splices git-rebase-style `<<<<<<<` /\n  `=======` / `>>>>>>>` blocks into the affected field.\n  `scan_conflict_markers` is the inverse used by `--continue` and the\n  `MigrationConflict` doc-check invariant.\n* `restore_artifact_from_snapshot` swaps a single artifact back to\n  its pre-migration form for `--skip`.\n\nCLI (rivet-cli/src/migrate_cmd.rs + main.rs):\n* `--apply` no longer bails on conflicts — it walks the plan,\n  applies every mechanical/decidable change, then writes markers for\n  the first conflict and exits non-zero with state CONFLICT.\n* `--continue` verifies markers are gone, re-parses the file as\n  YAML, marks resolved, advances.\n* `--skip` rebuilds the file from the snapshot (mechanical-pass\n  applied to other artifacts in the same file) and restores the\n  conflicted artifact's pre-migration form.\n* `--edit <ID>` re-stamps markers on a previously-resolved or\n  skipped conflict.\n* `--status` reports CONFLICT state plus the current conflict's id\n  and file, with next-step suggestions.\n\nValidation (rivet-core/src/doc_check.rs):\n* `MigrationConflict` doc-invariant scans every `*.yaml` /  `*.yml`\n  under `<project>/artifacts/` and emits a violation for any line\n  that begins with `<<<<<<<` / `=======` / `>>>>>>>`. Prevents\n  accidental commits with leftover markers.\n\nTests (rivet-core/src/migrate.rs + rivet-cli/tests/migrate_integration.rs):\n* 7 new unit tests covering enum-mismatch detection, marker round\n  trip, scan, restore-from-snapshot, partial-apply, plan lookup, and\n  Conflict state roundtrip.\n* 6 new integration tests covering the apply-pauses-on-conflict\n  flow, --continue success, --continue marker rejection, --skip\n  restore, --edit re-open, and the docs-check MigrationConflict\n  surface.\n\nPhase 3 (deferred): dashboard `/migrations/<id>` view, `rivet\nrecipes` subcommand for recipe distribution, provenance entries on\nmigrated artifacts.\n\nImplements: REQ-007, REQ-010\nImplements: REQ-004\nVerifies: REQ-007, REQ-010, REQ-004\n\nCo-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>\n\n* docs(migrate): Phase 2 conflict-resolution flow in rivet docs schema-migrate\n\nExtend the embedded `rivet docs schema-migrate` topic with:\n* Updated quick-start commands (`--continue`, `--skip`, `--edit`)\n* CONFLICT state in the state-machine diagram\n* Worked example of marker syntax + resolution workflow\n* `current-conflict` file in the storage-layout table\n* Note on the `MigrationConflict` doc-check invariant\n* Refreshed \"still deferred\" list (dashboard, recipes subcommand).\n\nRefs: FEAT-001\n\n---------\n\nCo-authored-by: Claude Opus 4.7 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-04-29T16:36:57-05:00",
          "tree_id": "2cf269edb5cd2b47ad2b743f822b5c075116ada8",
          "url": "https://github.com/pulseengine/rivet/commit/0371cada8a54111d405ff4265e072a35770041e3"
        },
        "date": 1777503383360,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 75237,
            "range": "± 566",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 884751,
            "range": "± 6734",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14673610,
            "range": "± 694089",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1749,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 19361,
            "range": "± 32",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 348648,
            "range": "± 1497",
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
            "value": 1094316,
            "range": "± 13183",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 158519,
            "range": "± 1231",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1831611,
            "range": "± 32987",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 39290192,
            "range": "± 2153059",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 122737,
            "range": "± 559",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1175214,
            "range": "± 11072",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 19815038,
            "range": "± 1957111",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3907,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 40778,
            "range": "± 73",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 746271,
            "range": "± 4103",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 53076,
            "range": "± 490",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 587833,
            "range": "± 1990",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8456232,
            "range": "± 673172",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 676,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 5511,
            "range": "± 12",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 142675,
            "range": "± 482",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21910,
            "range": "± 117",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 160280,
            "range": "± 1334",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1486859,
            "range": "± 24759",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "b7a17bef97b4da9a258cbe7493f996248f00f335",
          "message": "chore(release): v0.7.0 — schema migrate Phase 2 + docs coverage gate (#246)\n\nWorkspace, vscode-rivet, and npm root package versions bumped to 0.7.0.\nPlatform packages stay on the release-npm.yml override path.\n\nWhat's in 0.7.0:\n\n- feat(schema): rivet schema migrate Phase 2 (#242) — full git-rebase\n  conflict-resolution UX. Conflict markers in YAML, --continue,\n  --skip, --edit. New MigrationConflict invariant in rivet docs check.\n- feat(docs-check): subcommand-coverage gate (#241) — walks the live\n  clap CLI tree and asserts each path has an embedded docs topic.\n  Default warn-only; --strict makes it enforcing.\n- feat(validate): prose-mention-without-typed-link warning (#234,\n  closes #207).\n- feat(schemas): vv-coverage repo-status type (#232, partial #188).\n- feat(mutants): canonical cargo-mutants template (#229, closes #185).\n- docs(pre-commit): canonical 21-hook template (#222, closes #186).\n- fix(ci): Release workflow now idempotent on existing tag (#244).\n\nKnown issue: v0.5.0 / v0.5.1 / v0.6.0 release pages have no binary\nassets attached because the workflow's Create Release step failed\non each (race with manual gh release create). The fix in #244 lands\nin this release; v0.7.0 onward is unaffected. Older releases need\na manual gh release upload to backfill.\n\nVerified: cargo check, cargo clippy --workspace -- -D warnings,\ncargo test -p rivet-cli, rivet docs check (clean), rivet docs check\n--coverage reports 48/81 paths covered (warn-only).\n\nTrace: skip",
          "timestamp": "2026-04-29T23:43:36-05:00",
          "tree_id": "5fd526b079220fb40150fdd4ab80e2dabd5179c7",
          "url": "https://github.com/pulseengine/rivet/commit/b7a17bef97b4da9a258cbe7493f996248f00f335"
        },
        "date": 1777540383327,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 78724,
            "range": "± 774",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 837745,
            "range": "± 5515",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 10641021,
            "range": "± 264093",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2156,
            "range": "± 15",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 27252,
            "range": "± 290",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 361001,
            "range": "± 28816",
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
            "value": 1200854,
            "range": "± 40550",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 165705,
            "range": "± 757",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1875150,
            "range": "± 9654",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 22660622,
            "range": "± 884929",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 138731,
            "range": "± 793",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1200091,
            "range": "± 25312",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 12248917,
            "range": "± 180828",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4202,
            "range": "± 43",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 59870,
            "range": "± 3653",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 767575,
            "range": "± 1526",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 62030,
            "range": "± 224",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 700029,
            "range": "± 6758",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7661118,
            "range": "± 47797",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 783,
            "range": "± 29",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7382,
            "range": "± 43",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 116131,
            "range": "± 1361",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23859,
            "range": "± 111",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 166588,
            "range": "± 495",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1563526,
            "range": "± 12399",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "a50fbb7508766f94b308f967fef98f2c1fab3c65",
          "message": "fix(docs-check): tighten --coverage rule 4 + add --warn-only mode (#248) (#250)\n\nTwo fixes to `rivet docs check --coverage` (the gate from #241):\n\n* B5 — rule 4 (umbrella mapping via `COVERAGE_TOPIC_MAP`) now requires\n  the parent topic body to mention the child subcommand by name as a\n  whole word, case-insensitive. A catch-all `cli` mapping that doesn't\n  reference the family is no coverage at all. With the current TOPICS\n  registry this surfaces `lsp` and `batch` as additional gaps\n  (was 48/81 covered; now 46/81).\n\n* B6 — replace the implicit two-state warn/strict pattern with three\n  explicit modes:\n    --coverage              print, exit 0, no annotations (local use)\n    --coverage --warn-only  print + emit ::warning::file=…::… GitHub\n                            Actions annotations per gap, exit 0\n                            (CI rollout — surface gaps inline on PRs\n                            without failing the build)\n    --coverage --strict     print, exit 1 on any uncovered (enforcing CI)\n\n  `--warn-only` and `--strict` are mutually exclusive (clap-enforced).\n  CI workflow now uses `--warn-only` explicitly so the contract is\n  legible at the call site rather than relying on the previous default\n  warn-on-failure semantics.\n\nThe `rivet docs docs-coverage` topic and the docs::TOPICS body are\nupdated to describe the three modes and the rule-4 body-mention check.\n\nTests:\n  * 6 new unit tests for the body-mention rule (positive/negative,\n    case-insensitive, whole-word, plus a direct test of the\n    `topic_body_mentions` helper).\n  * Integration: `coverage_warn_only_emits_github_annotations` asserts\n    at least one `::warning file=…::` line is printed and exit is 0.\n  * Integration: `coverage_strict_currently_fails_on_main` pins exit 1\n    behaviour while the inventory has gaps.\n  * Integration: `coverage_warn_only_and_strict_are_mutually_exclusive`\n    pins clap conflict-rejection.\n  * Integration: existing `coverage_default_exits_zero_no_annotations`\n    asserts no `::warning::` lines in the default mode.\n\nCloses #248.\n\nImplements: REQ-007",
          "timestamp": "2026-05-01T07:44:08-05:00",
          "tree_id": "a44f6ebd764344d79706e8544b4e99d9f6934a63",
          "url": "https://github.com/pulseengine/rivet/commit/a50fbb7508766f94b308f967fef98f2c1fab3c65"
        },
        "date": 1777690563174,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 75148,
            "range": "± 176",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 878909,
            "range": "± 7464",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14023911,
            "range": "± 600782",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1707,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 18417,
            "range": "± 28",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 344984,
            "range": "± 786",
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
            "value": 1084943,
            "range": "± 9937",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 157667,
            "range": "± 410",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1846078,
            "range": "± 7763",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 38478230,
            "range": "± 2298580",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 123842,
            "range": "± 1012",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1193716,
            "range": "± 25119",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 21516788,
            "range": "± 1858531",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3908,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 40923,
            "range": "± 1800",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 772091,
            "range": "± 5283",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 53813,
            "range": "± 1308",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 585587,
            "range": "± 3650",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8982710,
            "range": "± 571023",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 667,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 5453,
            "range": "± 13",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 147906,
            "range": "± 336",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21988,
            "range": "± 49",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 160278,
            "range": "± 311",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1491147,
            "range": "± 14603",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "4c8e7e9d0ba468babde19f5f050399ab82c90a7b",
          "message": "feat(cli): cited-source --strict, --strict-cited-source-stale, schema migrate --list (#249) (#251)\n\nThree platform-engineering CLI symmetries from issue #249:\n\nB7 — `rivet check sources --strict` is a read-only audit gate. Walks\nevery artifact with a `cited-source`, classifies each as match / drift\n/ missing-hash / read-error / shape-error / stale, and exits non-zero\non anything other than match. Mutually exclusive with --update so\naudit and fix are never the same invocation. Never modifies any YAML.\n\nB8 — `rivet validate --strict-cited-source-stale` promotes the\npreviously-Info `cited-source-stale` diagnostic to Error. The stale\nverdict now fires for missing, unparseable, OR older-than-30-days\nlast-checked timestamps (30d is a hard-coded default; per-schema\nthresholds remain a follow-up). New helpers:\n  - cited_source::parse_iso8601_utc — chrono-free ISO-8601 parsing\n  - cited_source::classify_staleness — fresh / missing / old / unparseable\n\nB9 — `rivet schema migrate --list` enumerates every available recipe\n(built-in + project-local YAML under <schemas-dir>/migrations/).\nProject-local recipes shadow built-ins of the same name. Text and\nJSON output. Mutually exclusive with target + action flags. New\n`migrate::list_recipes` helper + `RecipeEntry` / `RecipeOrigin` types.\n\nTests:\n- B7: integration test asserts clean fixture exits 0; off-disk edit\n  exits 1 without mutating the YAML; --update --apply restores 0.\n- B7: clap mutex test for --strict + --update.\n- B8: unit tests cover the staleness classifier and severity\n  promotion; integration test asserts default exit 0 + strict exit 1.\n- B9: unit tests cover built-in / project-local / shadow precedence;\n  integration tests cover text + JSON output + clap mutex with --apply.\n\nDocs (rivet docs schema-cited-sources, rivet docs schema-migrate)\nupdated with the new flags + the audit-gate pattern.\n\nImplements: REQ-007, REQ-004\nVerifies: REQ-007, REQ-004\nRefs: #249\n\nCo-authored-by: Claude Opus 4.7 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-05-01T07:44:21-05:00",
          "tree_id": "0de3b667b6fe77a858074012c11ad5870adf9e05",
          "url": "https://github.com/pulseengine/rivet/commit/4c8e7e9d0ba468babde19f5f050399ab82c90a7b"
        },
        "date": 1777691133286,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 62795,
            "range": "± 2172",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 674573,
            "range": "± 3379",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 15958631,
            "range": "± 1169656",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1482,
            "range": "± 11",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 18439,
            "range": "± 243",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 266989,
            "range": "± 3388",
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
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 927108,
            "range": "± 3131",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 126889,
            "range": "± 360",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1476411,
            "range": "± 9448",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 31637541,
            "range": "± 3005764",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 102023,
            "range": "± 2099",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 899318,
            "range": "± 4945",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 15395470,
            "range": "± 1257643",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3214,
            "range": "± 22",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 35282,
            "range": "± 605",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 583807,
            "range": "± 2662",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 46911,
            "range": "± 1151",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 506774,
            "range": "± 2163",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 6317093,
            "range": "± 353973",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 596,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 5226,
            "range": "± 168",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 69879,
            "range": "± 273",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 16148,
            "range": "± 192",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 111624,
            "range": "± 349",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1044528,
            "range": "± 13880",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "2ff1c159b7345f57456db8246938ac73bbd25ecf",
          "message": "fix(docs): stale literals + extend rivet docs check with EmbeddedVersionLiterals / EmbeddedFlagReferences / EmbeddedTodoMarkers (#247) (#252)\n\nFixes four stale literals shipped in 0.7.0 docs and extends `rivet docs\ncheck` with three new invariants that scan the embedded `rivet docs\n<topic>` bodies (the strings printed by the binary, not files on disk)\nso this class of drift surfaces at CI time instead of via user reports.\n\nPart A — fixes:\n  * `quickstart` topic step 1: replace `rivet 0.5.0` literal expectation\n    with version-agnostic prose (`rivet ` + any version).\n  * `mcp` topic: change the `serverInfo` example version from a hard-\n    coded `0.5.0` to `<rmcp-version>` and add a note explaining that\n    field reflects the underlying rmcp crate, not rivet's release line.\n  * `schemas/eu-ai-act.yaml` (drives `rivet docs schema/eu-ai-act`):\n    flip the single-schema usage line from `rivet init --schema\n    eu-ai-act` to `rivet init --preset eu-ai-act`. Multi-schema bridge\n    examples (e.g. `--schema eu-ai-act,stpa`) are valid and stay.\n  * `schemas/dev.yaml` (drives `rivet docs schema/dev`): drop the\n    `docs/agent-pipelines.md (TODO)` cross-reference to a non-existent\n    topic.\n  * Bonus: `rivet docs impact` example used a stale tag literal\n    (`v0.5.0`); replaced with `vX.Y.Z` placeholder.\n  * Bonus: `rivet export --gherkin` was a stale flag; rewritten to\n    `rivet export --format gherkin` in dev.yaml + main.rs comment.\n\nPart B — new invariants in `rivet-core/src/doc_check.rs`:\n  * `EmbeddedVersionLiterals` — every `vX.Y.Z` / `X.Y.Z` token in a\n    topic body must equal the workspace version OR be in\n    `rivet.yaml docs-check.allowed-version-literals`. Allowlist entries\n    without a `v` prefix also match the `v`-prefixed form so users only\n    have to allowlist one shape.\n  * `EmbeddedFlagReferences` — every `rivet <subcmd> --<flag>` token in\n    a topic body must reference a flag declared on that subcommand in\n    the live clap tree. Walks parent-up so root-level globals\n    (`--project`, `--verbose`) and intermediate flags resolve. When the\n    *subcommand* itself is unknown we defer to `SubcommandReferences`,\n    not double-report.\n  * `EmbeddedTodoMarkers` — `TODO` / `FIXME` / `XXX` in topic bodies are\n    author markers that must not ship in a release binary. Inline meta-\n    references (`` `TODO` ``) are skipped so docs-about-the-invariant\n    stay legal.\n\nWiring (rivet-cli/src/main.rs + rivet-cli/src/docs.rs):\n  * `docs::topic_bodies()` exposes (slug, body) pairs for the engine.\n  * `build_subcommand_flag_map()` walks `Cli::command()` and collects\n    long flags per slash-separated path, seeded with root-level globals\n    and the clap built-ins (`--help`, `--version`).\n  * `cmd_docs_check` populates `embedded_topics`, `subcommand_flags`,\n    and `allowed_version_literals` on the `DocCheckContext`.\n\nConfig (rivet-core/src/model.rs):\n  * Adds `allowed_version_literals: Vec<String>` to `DocsCheckConfig`\n    (the `docs-check:` block in `rivet.yaml`).\n  * Repo's own `rivet.yaml` is updated with the literals shipped in\n    rivet's schemas/topics (schema header versions, ASPICE process IDs,\n    supply-chain example artifacts, rmcp pin).\n\nNew topic + tests:\n  * Adds a `docs-check` reference topic listing both the markdown and\n    embedded-doc invariants and showing the allowlist syntax.\n  * 10 new unit tests in `doc_check::tests` cover each new invariant\n    plus the no-topics-disabled smoke (existing engine consumers that\n    don't populate the field still pass).\n\n`rivet docs check` is clean against the rivet repo after Part A; CI's\nexisting `cargo run -- docs check` step picks the new invariants up\nautomatically via `default_invariants()` — no workflow change needed.\n\nCloses #247\n\nImplements: REQ-004, REQ-007\n\nCo-authored-by: Claude Opus 4.7 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-05-01T10:33:42-05:00",
          "tree_id": "3b734d0c88fcfd2204f5daf6d736e2229189a098",
          "url": "https://github.com/pulseengine/rivet/commit/2ff1c159b7345f57456db8246938ac73bbd25ecf"
        },
        "date": 1777696286962,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 81113,
            "range": "± 334",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 859378,
            "range": "± 18744",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 16109376,
            "range": "± 1848597",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2201,
            "range": "± 19",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 23870,
            "range": "± 66",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 379859,
            "range": "± 2538",
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
            "value": 95,
            "range": "± 1",
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
            "value": 1191966,
            "range": "± 19082",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 164093,
            "range": "± 2057",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1922615,
            "range": "± 28693",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 35202528,
            "range": "± 4357740",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 140247,
            "range": "± 1662",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1227675,
            "range": "± 14701",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 21929182,
            "range": "± 2893932",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4243,
            "range": "± 16",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 61769,
            "range": "± 418",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 837009,
            "range": "± 41875",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 57708,
            "range": "± 4311",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 697309,
            "range": "± 4357",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 9756223,
            "range": "± 833490",
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
            "value": 7513,
            "range": "± 49",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 113495,
            "range": "± 2740",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22396,
            "range": "± 429",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 156003,
            "range": "± 875",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1470819,
            "range": "± 13344",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "9b45c862f0a3f437a988099b541aa2ecdd997dc2",
          "message": "chore(release): v0.8.0 — dogfood follow-ups (#256)\n\n* chore(release): v0.8.0 — dogfood follow-ups\n\nWorkspace, vscode-rivet, and npm root package versions bumped to 0.8.0.\nPlatform packages stay on the release-npm.yml override path.\n\nWhat's in 0.8.0:\n\n- fix(docs): stale literals + extend rivet docs check (#252, closes\n  #247). Six embedded-doc literals fixed, plus three new invariants\n  (EmbeddedVersionLiterals, EmbeddedFlagReferences,\n  EmbeddedTodoMarkers) to prevent the class of drift from re-shipping.\n- feat(docs-check): tighten --coverage rule 4 + --warn-only (#250,\n  closes #248). Rule 4 now requires child name to appear in parent\n  body (catches false-positives on lsp + batch). New three-mode\n  semantics: default silent / --warn-only with annotations / --strict\n  fail.\n- feat(cli): cited-source --strict, --strict-cited-source-stale,\n  schema migrate --list (#251, closes #249). Read-only audit gate\n  for cited-source drift; promotable stale severity; recipe discovery.\n\nTrace: skip\n\n* ci: ignore RUSTSEC-2026-0114 (wasmtime 42.x table-allocation panic)\n\nNew wasmtime advisory published 2026-04-30, blocking 0.8.0 CI.\nRivet's wasmtime usage is behind an optional wasm feature gate and\ndoesn't allocate large wasmtime tables, so the panic case isn't\nreachable. Follow-up issue will track upgrading to wasmtime >=43.0.2.\n\nTrace: skip",
          "timestamp": "2026-05-02T09:44:40-05:00",
          "tree_id": "9250daa85d680cb8589ad1f416681d4baff7e353",
          "url": "https://github.com/pulseengine/rivet/commit/9b45c862f0a3f437a988099b541aa2ecdd997dc2"
        },
        "date": 1777769340220,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 78846,
            "range": "± 499",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 841942,
            "range": "± 4414",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14031066,
            "range": "± 1047708",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2177,
            "range": "± 28",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26156,
            "range": "± 247",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 358248,
            "range": "± 2942",
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
            "value": 1185284,
            "range": "± 12154",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 163959,
            "range": "± 1484",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1926147,
            "range": "± 13319",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 29210248,
            "range": "± 1823498",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 138146,
            "range": "± 1203",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1209751,
            "range": "± 14787",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 16881866,
            "range": "± 1264960",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4337,
            "range": "± 21",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 58868,
            "range": "± 719",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 768844,
            "range": "± 10107",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 60711,
            "range": "± 210",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 689060,
            "range": "± 4481",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 9268979,
            "range": "± 645271",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 808,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7409,
            "range": "± 141",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 110920,
            "range": "± 1377",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22500,
            "range": "± 181",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 157569,
            "range": "± 1404",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1500064,
            "range": "± 10598",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "08b87f86de28055a8e37b97211a3d184939943f8",
          "message": "ci(release-npm): switch to workflow_run trigger so npm publish auto-fires after Release (#261)\n\nThe Release workflow creates the GitHub Release page using the default\nGITHUB_TOKEN, and GitHub deliberately suppresses downstream workflow\ntriggers from runs that authenticated with GITHUB_TOKEN (loop-prevention\nguarantee). As a result, release-npm.yml's `release: published` trigger\nnever fires for v0.7.0 or v0.8.0 — both stuck without npm publication\ndespite the binary archives being on the GitHub Release page.\n\nSwitch to workflow_run on the upstream Release workflow. This is the\ndocumented escape hatch for chaining workflows when the upstream uses\nGITHUB_TOKEN. Side effects:\n\n  * head_branch on a tag-push source workflow is the tag name itself\n    (e.g. v0.8.0), so version resolution stays straightforward.\n  * Guard added against non-release tags so a manual Release run on a\n    branch ref doesn't accidentally trigger an npm publish.\n  * Both jobs gated on workflow_run.conclusion == 'success' so failed\n    upstream releases don't fire downstream publishes; workflow_dispatch\n    bypasses the gate for manual backfills.\n\nBackfilling v0.7.0 and v0.8.0 npm publication will be done via\nworkflow_dispatch once this lands on main.\n\nCo-authored-by: Claude Opus 4.7 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-05-03T10:39:23-05:00",
          "tree_id": "1fbd6fc48afe7456c356d076db2576fe9c57fff9",
          "url": "https://github.com/pulseengine/rivet/commit/08b87f86de28055a8e37b97211a3d184939943f8"
        },
        "date": 1777840150561,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 79586,
            "range": "± 410",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 859207,
            "range": "± 3763",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 16540011,
            "range": "± 1087598",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1983,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24978,
            "range": "± 46",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 351600,
            "range": "± 10570",
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
            "value": 1227040,
            "range": "± 24198",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 167730,
            "range": "± 894",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1950464,
            "range": "± 60108",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 37911232,
            "range": "± 4174028",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 135292,
            "range": "± 1501",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1249301,
            "range": "± 20852",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 20064139,
            "range": "± 1301279",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4166,
            "range": "± 231",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 44661,
            "range": "± 159",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 751547,
            "range": "± 15291",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 63438,
            "range": "± 1919",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 705708,
            "range": "± 2718",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8763046,
            "range": "± 386243",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 789,
            "range": "± 19",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7412,
            "range": "± 39",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 92475,
            "range": "± 909",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22836,
            "range": "± 571",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 144392,
            "range": "± 684",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1340857,
            "range": "± 22341",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "9c36acbefabd0c96518ed50140e8060eb29f6cd9",
          "message": "ci: migrate 16 of 21 ci.yml jobs to smithy self-hosted runners (#262)\n\n* ci: migrate 16 of 21 ci.yml jobs to smithy self-hosted runners\n\nBuilds on the spar pilot (pulseengine/spar#201) — same runner-class\nmapping, same workarounds for the rustsec parser CVSS 4.0 issue,\nsame direct-cargo-deny pattern.\n\nMigrated to smithy:\n\n  rust-cpu      clippy, docs-check, test, semver-checks, coverage,\n                proptest, fuzz, msrv\n  lean-mem      miri, mutants, verus\n  light         fmt, yaml-lint, deny, supply-chain, release-results\n\nStay on ubuntu-latest (each with explanatory comment in-place):\n\n  - playwright       (--with-deps does sudo apt-get; smithy runners no sudo)\n  - vscode-extension (xvfb-run + downloaded VS Code Test setup)\n  - audit            (cargo-audit 0.21 rustsec parser rejects CVSS 4.0)\n  - kani             (kani-verifier bundles CBMC, ~100 MB install)\n  - rocq             (Coq install, not on smithy yet)\n\nTwo non-trivial fixes inside migrated jobs:\n\n  - test: actionlint install moved from `sudo mv /tmp/actionlint\n    /usr/local/bin` to `mv /tmp/actionlint $HOME/.local/bin` plus\n    GITHUB_PATH update. Smithy runners have no sudo; same binary,\n    different writable location.\n  - deny: dropped the `cargo deny check` (which would fail loading\n    advisory-db with CVSS 4.0) for `cargo deny check bans licenses\n    sources`. The audit job (still on hosted) covers vulnerability\n    matching meanwhile.\n\nExpected improvement: spar's broad migration showed ~470x end-to-end\nspeedup on clippy (~470 min → 1 min) thanks to queue elimination.\nRivet should see similar — its recent runs showed 600+ min total.\n\n* ci(miri): bump timeout-minutes 15->30 after smithy run hit limit\n\nFirst migration run timed out exactly at 15:00 with tests still\nprogressing (last printed test at ~11:00). Smithy's lean-mem class\nappears to run the slow tail tests slower than the previous hosted\nrunner did — could be cgroup memory pressure (24G MemoryHigh under\nMiri's shadow allocations) or just longer tail test perf. Bumping\nthe budget conservatively; revisit once we have a few green runs\nto dial it back closer to actual.\n\nSemver Checks is also failing on this PR — upstream issue\n('unsupported rustdoc format v57', the action ships a too-old\ncargo-semver-checks). NOT a smithy-migration issue; would fail on\nhosted too. Tracked as a separate followup; doesn't block this PR.\n\n* ci: retrigger after smithy TMPDIR fix\n\nSmithy main now points TMPDIR / TMP / TEMP at the per-runner\n/var/lib/runners/runnerN/_tmp on lv_runners (500 G), instead of\nthe host's /tmp on lv_root (80 G). Previous run hit 'no space\nleft on device' when the rivet HTML-export test ran out of root\nFS budget. Runners restarted; this commit triggers a fresh CI.\n\n* ci(semver-checks): replace stale wrapper action with direct cargo install\n\nobi1kenobi/cargo-semver-checks-action@v2 bundles an older\ncargo-semver-checks that doesn't recognise rustdoc JSON v57\n(the format current stable rustdoc emits). Every PR run failed\nwith 'unsupported rustdoc format v57 for file: rivet_core.json'.\n\nGoing direct: install the latest cargo-semver-checks at job time\nand invoke it. Slightly slower on cold cache but tracks the\nupstream rustdoc format. Same end-effect as the wrapper.\n\nCaught during the rivet broad-CI smithy migration (PR #262); not\nrelated to self-hosted vs hosted.\n\n* ci: retrigger after smithy disk cleanup + tmpfiles policy\n\nlv_runners had filled to 100% from accumulated per-runner _tmp.\nSmithy main commit b4af61e adds /etc/tmpfiles.d/smithy-runner-tmp.conf\nto age files >24 h out of those dirs daily. Manual cleanup ran today\n(466G -> 92G used). Re-triggering CI to confirm Miri / Mutation /\nVerus jobs land green now that disk is back to 20% used.",
          "timestamp": "2026-05-10T07:36:44-05:00",
          "tree_id": "7e4a8a2ba13fb3bbc1f0a68ded31cf0230ff0d14",
          "url": "https://github.com/pulseengine/rivet/commit/9c36acbefabd0c96518ed50140e8060eb29f6cd9"
        },
        "date": 1778420415919,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 80319,
            "range": "± 293",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 839672,
            "range": "± 6078",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 15252126,
            "range": "± 1666994",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2226,
            "range": "± 11",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 23735,
            "range": "± 1358",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 365918,
            "range": "± 6853",
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
            "value": 1185092,
            "range": "± 62753",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 161456,
            "range": "± 3335",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1964085,
            "range": "± 8086",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 36133846,
            "range": "± 3279796",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 138513,
            "range": "± 928",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1206718,
            "range": "± 28805",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 19860814,
            "range": "± 3518599",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4269,
            "range": "± 18",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 61118,
            "range": "± 365",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 825367,
            "range": "± 6061",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 61862,
            "range": "± 281",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 689757,
            "range": "± 10135",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8297293,
            "range": "± 713336",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 813,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7612,
            "range": "± 78",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 112856,
            "range": "± 819",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22260,
            "range": "± 917",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 153365,
            "range": "± 1169",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1453811,
            "range": "± 32789",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "6dfdca61e2f6cbfa0b75da7a2d49a015f472cd65",
          "message": "chore(ci): add concurrency control to all workflows (#258)\n\n* chore(ci): add concurrency control to all workflows\n\nAdd top-level `concurrency:` blocks to every workflow so superseded PR\nruns are cancelled while runs on `main`, tags, releases, and scheduled\nevents complete normally. Org-wide context: 93 workflows queued across\nthe org as of 2026-05-02 with the oldest job 23h old; rivet has been\nintermittently sitting at 5h+ runner-queue stalls on chore PRs.\n\nWithout this, every PR push starts a fresh run while previous runs on\nsuperseded commits keep executing — agents pushing 2-5 commits per\nminute multiply queue pressure for zero useful signal. The conditional\n`cancel-in-progress: ${{ github.event_name == 'pull_request' }}`\npreserves all main-branch and scheduled work.\n\nVariants applied per the brief:\n\n- **default** (cancel only on PR): `benchmarks.yml`, `ci.yml`\n- **compliance** (serialize, never cancel — partial reports leave\n  registries / attestations inconsistent): `compliance.yml`\n- **release** (serialize per-tag, never cancel — partial publish\n  leaves npm / GitHub Release inconsistent): `release.yml`,\n  `release-npm.yml`. `release-npm.yml` keys on tag-name with\n  fallback through `inputs.version` and `github.ref` for\n  workflow_dispatch.\n\nAlready had correct concurrency, left alone:\n\n- `rivet-delta.yml`: groups by `pull_request.number`, always cancels\n  (correct: PR-only workflow, no main runs to protect).\n- `fuzz.yml`: groups by ref with `cancel-in-progress: false` (correct\n  for hybrid push+schedule workflow; one fuzz run per ref serializes\n  cleanly without losing scheduled corpus growth).\n\nVerification before merge:\n- All YAMLs parse cleanly via Python yaml.safe_load.\n- Diff is workflow-files-only — no job restructure, no runs-on\n  change, no caching change.\n\nTrace: skip\n\n* ci(release-npm): drop release-npm concurrency block superseded by #261\n\n#261 already added a concurrency block to release-npm.yml when switching\nthe trigger to workflow_run. Rebasing this branch on top stacked the\noriginal release: published variant on top, producing duplicate\ntop-level concurrency keys (invalid YAML).\n\nDrop the now-redundant block; #261's block (keyed on\ngithub.event.workflow_run.head_branch) is the correct one for the\ncurrent trigger.\n\nCo-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>\n\n---------\n\nCo-authored-by: Claude Opus 4.7 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-05-10T12:59:32-05:00",
          "tree_id": "aa9e3689a5446f2ea4de78fe80f8b14405023aa4",
          "url": "https://github.com/pulseengine/rivet/commit/6dfdca61e2f6cbfa0b75da7a2d49a015f472cd65"
        },
        "date": 1778442787987,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 79953,
            "range": "± 287",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 835761,
            "range": "± 4206",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 10777546,
            "range": "± 201358",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2149,
            "range": "± 25",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25475,
            "range": "± 127",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 366297,
            "range": "± 817",
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
            "value": 92,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1184896,
            "range": "± 20128",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 161631,
            "range": "± 452",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1826133,
            "range": "± 15930",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 22905310,
            "range": "± 293676",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 137582,
            "range": "± 1395",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1210286,
            "range": "± 32422",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 12167984,
            "range": "± 144437",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4304,
            "range": "± 13",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60378,
            "range": "± 181",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 756934,
            "range": "± 1836",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 61211,
            "range": "± 1914",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 687734,
            "range": "± 1660",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7561473,
            "range": "± 37002",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 795,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7334,
            "range": "± 33",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 107253,
            "range": "± 585",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22070,
            "range": "± 188",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 153511,
            "range": "± 1077",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1439673,
            "range": "± 26566",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "261584866+temper-pulseengine[bot]@users.noreply.github.com",
            "name": "temper-pulseengine[bot]",
            "username": "temper-pulseengine[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "8dc93ca4dd8112419d1f22de2ef2fbe6466cbea4",
          "message": "Update Dependabot configuration (#216)\n\nCo-authored-by: temper-pulseengine[bot] <261584866+temper-pulseengine[bot]@users.noreply.github.com>\nCo-authored-by: Ralf Anton Beier <ralf_beier@me.com>",
          "timestamp": "2026-05-10T13:54:45-05:00",
          "tree_id": "e4707657951e15794f5641b42e3b76a19e307ae9",
          "url": "https://github.com/pulseengine/rivet/commit/8dc93ca4dd8112419d1f22de2ef2fbe6466cbea4"
        },
        "date": 1778450014046,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 80111,
            "range": "± 268",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 842435,
            "range": "± 2230",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 11169027,
            "range": "± 524043",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2105,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26140,
            "range": "± 202",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 362291,
            "range": "± 1352",
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
            "value": 1181306,
            "range": "± 26245",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 165633,
            "range": "± 2703",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1898636,
            "range": "± 19635",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 22832241,
            "range": "± 234165",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 137395,
            "range": "± 797",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1229546,
            "range": "± 19262",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 12582038,
            "range": "± 230616",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 5097,
            "range": "± 20",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60606,
            "range": "± 285",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 763560,
            "range": "± 5278",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 61126,
            "range": "± 144",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 687128,
            "range": "± 2645",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7489820,
            "range": "± 61675",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 846,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7991,
            "range": "± 448",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 108024,
            "range": "± 1461",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23836,
            "range": "± 141",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 174201,
            "range": "± 1559",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1569446,
            "range": "± 26126",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "dd2453571aed5753a3370163f9f4d495b78023c3",
          "message": "feat(coverage): rivet coverage --matrix — V&V matrix from repo-status artifacts (#243)\n\nAdds the V&V coverage matrix view to `rivet coverage`: reads\n`repo-status` artifacts (schema `vv-coverage` from PR #232) and renders\na per-repo × per-technique matrix in text, json, markdown, or html.\n\nSub-issue 2 of #188. Sub-issue 1 (the schema) shipped in #232; the\ncross-repo aggregator (sub-issue 3) is still out of scope here per\nthe prior triage decomposition because the agent's GitHub access is\nrestricted to `pulseengine/rivet` only.\n\n- New flag `--matrix` on the existing `Coverage` subcommand. Mutually\n  exclusive with `--tests` at the clap layer.\n- `--format` accepts `text` (default), `json`, `markdown`, `html` when\n  `--matrix` is set; the original `text|json` contract for non-matrix\n  coverage is preserved.\n\n| State    | Glyph | JSON        | Meaning                                |\n|----------|-------|-------------|----------------------------------------|\n| absent   | ·     | \"absent\"    | Technique not in `techniques-applied`. |\n| applied  | ○     | \"applied\"   | Applied but not gated in CI.           |\n| gated    | ●     | \"gated\"     | In `techniques-gated-in-ci`.           |\n\nColumns are the sorted union of `techniques-applied` ∪\n`techniques-gated-in-ci` across all rows, so the matrix only shows\ntechniques at least one repo cares about.\n\n- text: fixed-width table with the legend on top.\n- markdown: pipe table; pastes verbatim into a PR body or wiki.\n- html: `<section><table>` fragment with `cell-{absent,applied,gated}`\n  classes for downstream styling, with `&` and friends escaped.\n- json: structured `{command: \"coverage-matrix\", columns, repos[]}`\n  envelope. Each repo carries its raw lists plus a precomputed\n  `cells[]` so consumers don't have to recompute set membership.\n\n- 7 new integration tests in `rivet-cli/tests/cli_commands.rs`:\n  markdown / html / json / text-default rendering, invalid-format\n  diagnostic, `--matrix` × `--tests` clap conflict, empty-project\n  graceful render across all four formats.\n- `cargo test -p rivet-cli` — full suite green (432 tests).\n- `cargo test -p rivet-core --lib` — 896 pass.\n- `cargo clippy -p rivet-cli --all-targets -- -D warnings` — clean.\n- `cargo fmt --all -- --check` — clean.\n- `rivet validate` diagnostics unchanged from origin/main (pre-existing\n  6 errors in the spar-external fixture, untouched here).\n\n- New `coverage-matrix` topic in `rivet docs` documenting the surface,\n  cell semantics, authoring `repo-status`, and the four output formats.\n- New `schema/vv-coverage` topic exposing the schema YAML directly.\n\nRefs: #188\nRefs: #184\n\nImplements: REQ-007\n\nCo-authored-by: Claude <noreply@anthropic.com>",
          "timestamp": "2026-05-10T22:24:05-05:00",
          "tree_id": "27f93935f3ec9b5f88a70ba1c5f2130a370521f2",
          "url": "https://github.com/pulseengine/rivet/commit/dd2453571aed5753a3370163f9f4d495b78023c3"
        },
        "date": 1778470468942,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 79783,
            "range": "± 2001",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 836010,
            "range": "± 8042",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 10849015,
            "range": "± 231463",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2192,
            "range": "± 20",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26404,
            "range": "± 420",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 368883,
            "range": "± 16147",
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
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1187227,
            "range": "± 12830",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 162632,
            "range": "± 738",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1888943,
            "range": "± 29006",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 27561423,
            "range": "± 2269876",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 139784,
            "range": "± 920",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1233921,
            "range": "± 25720",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 12449142,
            "range": "± 209868",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4349,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60469,
            "range": "± 155",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 756266,
            "range": "± 7805",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 61868,
            "range": "± 7477",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 697505,
            "range": "± 9189",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7652341,
            "range": "± 15669",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 851,
            "range": "± 49",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7986,
            "range": "± 31",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 122346,
            "range": "± 2924",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 24500,
            "range": "± 65",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 174863,
            "range": "± 623",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1632373,
            "range": "± 25794",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "c501467e0e82cb52eea7b1a23a7a18bcf160cdb8",
          "message": "feat(bundle): rivet bundle <ID> --depth N --as {yaml,jsonl} (#206) (#266)\n\nImplements the consumer surface proposed in #206 — emit the typed link-graph\nclosure of an artifact as a single, pasteable document so an LLM agent can\nget root + neighbours in one round-trip instead of N. The MCP tool\ncounterpart (`rivet_bundle`) lets agents call this without shelling out.\n\nWhat landed:\n\n- `rivet-core/src/bundle.rs` — new module. Breadth-first, visit-once\n  traversal over `Store::get` + `Artifact::links`, returning a\n  depth-stamped `Vec<BundleEntry>`. Cycles terminate naturally via the\n  visited set. Depth 0 = root only; depth 1 = root + direct neighbours;\n  etc. Dangling targets (links pointing outside the store) appear as\n  `target:` references inside the parent's `links:` list but are not\n  expanded.\n- `BundleFormat::{Yaml, Jsonl}` rendering. YAML is hand-rendered (not\n  serde_yaml) because the inline `# satisfies -> REQ-002` annotations\n  are the whole point of the format and serde can't round-trip\n  comments. JSONL is one `serde_json` record per line for tool\n  consumers / streaming readers.\n- `rivet-cli/src/main.rs` — new `Command::Bundle { id, depth, format }`\n  variant with `--depth` (default 1) and `--as` (default yaml). Handler\n  `cmd_bundle` loads the project context, calls into `bundle::bundle`,\n  prints the rendered output. Invalid `--as` values produce a clear\n  error listing the valid options.\n- `rivet-cli/src/mcp.rs` — new `rivet_bundle` MCP tool with\n  `BundleParams { id, depth, format }`. Defaults match the CLI\n  (depth=1, format=yaml). Returns the rendered bundle as text content.\n- Tests: 11 unit tests in `bundle::tests` covering depth 0/1/2 closure,\n  cycle termination, dangling targets, missing-root error, the\n  `# linktype -> target` annotation, JSONL line-per-record, format\n  parsing, and YAML scalar quoting. 5 CLI integration tests in\n  `cli_commands.rs` (depth-0 root only, depth-1 + annotations,\n  jsonl shape, missing-root non-zero exit, invalid-format rejection).\n  2 MCP integration tests in `mcp_integration.rs` (yaml + jsonl).\n  The tools-list count test was bumped from 15 to 16 to include\n  `rivet_bundle`.\n\nOut of scope per the issue body: markdown rendering (\"the closest\nKarpathy analogue is paste the wiki into the LLM context — for rivet,\nYAML preserves typed structure with zero information loss\").\n\nAcceptance — issue #206 (lifted from the 2026-04-26 + 2026-05-09\ntriage comments):\n\n- [x] New module `rivet-core/src/bundle.rs` with closure traversal\n      over `Store` + `Link` graph, depth-bounded\n- [x] `rivet bundle <ID> --depth N --as {yaml,jsonl}` CLI command\n- [x] MCP tool `rivet_bundle` so agents can call it without shelling\n- [x] Output carries inline link annotations\n      (`# satisfies -> REQ-004` style)\n- [x] Snapshot/regression test: depth-0 → only root; depth-1 → root +\n      neighbours; depth-2 → two-hop closure\n- [x] Cycle handling tested (artifact A → B → A does not loop)\n- [x] Markdown rendering explicitly out of scope\n\nVerification:\n\n- `cargo test -p rivet-core --lib` — 931 pass (920 prior + 11 new)\n- `cargo test -p rivet-cli --test cli_commands` — 66 pass (61 prior + 5 new)\n- `cargo test -p rivet-cli --test mcp_integration` — 24 pass (22 prior + 2 new)\n- `cargo clippy --workspace --all-targets -- -D warnings` — clean\n- `cargo fmt --all -- --check` — clean\n- `cargo run --release -p rivet-cli -- validate` — error count\n  byte-identical to pristine main (6 errors / 140 warnings / 0 broken\n  cross-refs; the 6 errors live in the `spar:` external fixture and\n  are unaffected)\n- `cargo run --release -p rivet-cli -- docs check` — PASS\n\nCloses #206\n\nImplements: REQ-007\nRefs: FEAT-010\n\nCo-authored-by: Claude <noreply@anthropic.com>",
          "timestamp": "2026-05-10T22:51:28-05:00",
          "tree_id": "59264c43d2ca7178a920937f21d686363973e12d",
          "url": "https://github.com/pulseengine/rivet/commit/c501467e0e82cb52eea7b1a23a7a18bcf160cdb8"
        },
        "date": 1778471944165,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 81885,
            "range": "± 299",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 876373,
            "range": "± 7960",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14525863,
            "range": "± 1349938",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1961,
            "range": "± 65",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24702,
            "range": "± 341",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 369668,
            "range": "± 1537",
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
            "value": 1179237,
            "range": "± 16663",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 167661,
            "range": "± 1117",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1928405,
            "range": "± 11564",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 27175997,
            "range": "± 1166882",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 135572,
            "range": "± 2028",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1261724,
            "range": "± 25789",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 16042436,
            "range": "± 1629086",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4110,
            "range": "± 21",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 45419,
            "range": "± 307",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 738039,
            "range": "± 5346",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 61864,
            "range": "± 393",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 708751,
            "range": "± 15702",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8420743,
            "range": "± 285734",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 781,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 6952,
            "range": "± 157",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 90089,
            "range": "± 235",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21156,
            "range": "± 78",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 145220,
            "range": "± 1999",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1355781,
            "range": "± 22957",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "f45cafa1b33908f72d05fe6c50422f51e2072fea",
          "message": "fix(stpa): correct TCL numbering to ISO 26262-8 (TCL1) with DO-330 cross-walk (#257)\n\nThe \"Tool Confidence Level\" header in safety/stpa/tool-qualification.yaml\nread \"TCL 1 (highest)\" — which mixed two opposite conventions: ISO 26262-8\n§11.4.7 numbers TCL inversely to DO-330 (26262 TCL1 is the *lowest*\nconfidence demand; DO-330 TQL-1 is the *highest* rigor). The legacy\nwording was self-contradictory in our own dogfood — flagged by the\nqualification-dossier triage on issue #254 (Workstream A, A1).\n\nReplace the header with:\n  * \"TCL1 (ISO 26262-8 §11.4.7)\" — 26262 numbering, no parenthetical\n    that contradicts the standard.\n  * Brief explanation that oracle-gated validation raises TD enough to\n    keep the TI×TD matrix at TCL1, with the safety risk still framed\n    explicitly (a false PASS can prevent detection of a safety-critical\n    gap).\n  * Cross-walk paragraph documenting the inverse numbering between\n    26262 (TCL1 lowest, TCL3 highest) and DO-330 (TQL-1 highest, TQL-5\n    lowest) so future readers don't repeat the same mix-up.\n\nComment-only change. No schema, no validation logic, no rust source\ntouched. `rivet validate` error set is byte-identical to the pristine-\nmain baseline (the 6 pre-existing errors live in the spar external\nfixture and are unaffected).\n\nWorkstream A2-A5 (typed `tool-confidence` artifact, `ai-found-defect`\ntype, dossier doc, `--qualification-mode` flag) remain — this PR is the\nA1 slice only and intentionally does not close #254.\n\nImplements: REQ-002\nRefs: #254\n\n🤖 Generated with [Claude Code](https://claude.com/claude-code) — issue-triage agent run 2026-05-01.\n\nCo-authored-by: Claude <noreply@anthropic.com>",
          "timestamp": "2026-05-10T22:51:38-05:00",
          "tree_id": "7c461778bbcf64acdd9f73284f28a6588be76f04",
          "url": "https://github.com/pulseengine/rivet/commit/f45cafa1b33908f72d05fe6c50422f51e2072fea"
        },
        "date": 1778473133765,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 81443,
            "range": "± 744",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 866536,
            "range": "± 4386",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 11719574,
            "range": "± 1014582",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2209,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25847,
            "range": "± 1119",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 339537,
            "range": "± 1812",
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
            "value": 98,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1201780,
            "range": "± 40574",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 159512,
            "range": "± 1086",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1917407,
            "range": "± 9194",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 23924124,
            "range": "± 1374281",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 139372,
            "range": "± 664",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1218382,
            "range": "± 30753",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 13151057,
            "range": "± 634666",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4246,
            "range": "± 10",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 59656,
            "range": "± 656",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 761154,
            "range": "± 4186",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 60225,
            "range": "± 2107",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 673765,
            "range": "± 1619",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7723432,
            "range": "± 261663",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 825,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7387,
            "range": "± 31",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 111732,
            "range": "± 971",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 24202,
            "range": "± 98",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 163227,
            "range": "± 559",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1521465,
            "range": "± 18582",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "660a5b0bce2f375b5516613e53a6cb65b005d905",
          "message": "chore(release): v0.9.0 — backlog drain + CI infrastructure (#268)\n\nThree queued feature requests now land: rivet bundle (#266), rivet\ncoverage --matrix (#243), s-expr linked-via operator (#265). Plus\nexternals load their own schemas (#267) and STPA TCL numbering is\ncorrected to ISO 26262-8 (#257).\n\nInfrastructure: CI concurrency control across all workflows (#258),\nmigration to self-hosted smithy runners (#262), release-npm trigger\nfix that retroactively unblocked v0.7.0/v0.8.0 npm publication (#261),\nweekly dependabot (#216), and the wasmtime 42→43 upgrade that retires\nthe RUSTSEC-2026-0114 suppression introduced in v0.8.0 (#260).\n\n#125 (provenance-lifecycle) intentionally deferred — 5-week-old branch\nwith conflicts in heavily-churned files (CLAUDE.md, ci.yml, settings).\nNeeds its own attention session, not safe to autonomously rebase.\n\nRefs: FEAT-001\n\nCo-authored-by: Claude Opus 4.7 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-05-11T12:55:45-05:00",
          "tree_id": "cb54fb13fb4e58ad94b36177adb29c806b8d767e",
          "url": "https://github.com/pulseengine/rivet/commit/660a5b0bce2f375b5516613e53a6cb65b005d905"
        },
        "date": 1778522800328,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 64712,
            "range": "± 272",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 691021,
            "range": "± 20651",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 16440177,
            "range": "± 1099382",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1510,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 18519,
            "range": "± 479",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 273285,
            "range": "± 8003",
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
            "value": 916366,
            "range": "± 3140",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 125502,
            "range": "± 590",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1484186,
            "range": "± 19358",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 31122570,
            "range": "± 1877701",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 104408,
            "range": "± 955",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 946010,
            "range": "± 4777",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 19174752,
            "range": "± 1198676",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3193,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 34612,
            "range": "± 140",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 566932,
            "range": "± 6065",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 43810,
            "range": "± 183",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 487443,
            "range": "± 2726",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7430552,
            "range": "± 414248",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 570,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 4821,
            "range": "± 67",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 69315,
            "range": "± 421",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 16677,
            "range": "± 250",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 115679,
            "range": "± 619",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1058032,
            "range": "± 19974",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "485098aca06b2a400c9798bb14cab8da3994da9a",
          "message": "ci(release): install wasm-component-ld in build-test-evidence (#269)\n\nThe build-test-evidence job builds spar for wasm32-wasip2 via\nscripts/build-wasm.sh. Recent Rust nightlies stopped bundling\n`wasm-component-ld` (the WASI Preview 2 component linker) with the\ntarget's tools, so the CMake try-compile in a transitive -sys crate's\nbuild script fails with `Executable \"wasm-component-ld\" doesn't exist!`,\nwhich fails build-test-evidence and skips Create GitHub Release —\nblocking the whole release.\n\nInstall wasm-component-ld explicitly before the WASM build. Surfaced\nwhen the v0.9.0 Release workflow failed on this; v0.8.0 happened to land\non a nightly that still bundled the linker.\n\nCo-authored-by: Claude Opus 4.7 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-05-11T23:46:08-05:00",
          "tree_id": "3a1f255cb1e9869db5c92c474ef121931435e122",
          "url": "https://github.com/pulseengine/rivet/commit/485098aca06b2a400c9798bb14cab8da3994da9a"
        },
        "date": 1778561713509,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 81848,
            "range": "± 1373",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 871636,
            "range": "± 4701",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 15420046,
            "range": "± 2033877",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1950,
            "range": "± 9",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24772,
            "range": "± 43",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 353146,
            "range": "± 1856",
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
            "value": 1178770,
            "range": "± 17644",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 166173,
            "range": "± 4133",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1926719,
            "range": "± 19872",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 27422474,
            "range": "± 1905061",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 135926,
            "range": "± 1755",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1243451,
            "range": "± 24802",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 15339212,
            "range": "± 1023289",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4307,
            "range": "± 11",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 43499,
            "range": "± 1648",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 732947,
            "range": "± 10125",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 62198,
            "range": "± 299",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 686680,
            "range": "± 11731",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 9403551,
            "range": "± 565734",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 779,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7091,
            "range": "± 17",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 102722,
            "range": "± 316",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22214,
            "range": "± 93",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 150166,
            "range": "± 483",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1386631,
            "range": "± 44227",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "56f5d0f463a0ba491d7aa2be51b1c4f883adb979",
          "message": "ci(release): install lld (wasm-ld) for build-test-evidence wasm builds (#271)\n\nFollow-up to #269. With wasm-component-ld now installed, the spar\nwasm32-wasip2 build gets further but then fails: `highs-sys v1.12.1`\n(a transitive C++ dependency) runs a CMake CXX-ABI detection probe\ntargeting wasm, and clang++ can't find `wasm-ld`:\n\n  error: failed to spawn \"wasm-ld\"\n  clang++: error: linker command failed with exit code 1\n\n`wasm-ld` is the LLVM wasm linker, shipped in the `lld` apt package.\nInstall it alongside wasm-component-ld. v0.8.0 built test-evidence on\na runner image / nightly combo that still had both.\n\nCo-authored-by: Claude Opus 4.7 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-05-12T01:04:12-05:00",
          "tree_id": "6aff252630a0f49b2c1e65e0a256d4ac359446cb",
          "url": "https://github.com/pulseengine/rivet/commit/56f5d0f463a0ba491d7aa2be51b1c4f883adb979"
        },
        "date": 1778572916908,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 81882,
            "range": "± 348",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 859195,
            "range": "± 5225",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 11988636,
            "range": "± 666510",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2145,
            "range": "± 25",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 27007,
            "range": "± 139",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 379777,
            "range": "± 1259",
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
            "value": 94,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1222383,
            "range": "± 34002",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 166538,
            "range": "± 2799",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1880895,
            "range": "± 30628",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 25363394,
            "range": "± 1506207",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 141967,
            "range": "± 836",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1252341,
            "range": "± 19327",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 15163875,
            "range": "± 1753381",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 5167,
            "range": "± 10",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60565,
            "range": "± 405",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 790472,
            "range": "± 11422",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 61453,
            "range": "± 198",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 686524,
            "range": "± 2155",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7571879,
            "range": "± 216936",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 774,
            "range": "± 13",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7188,
            "range": "± 93",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 121634,
            "range": "± 858",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23363,
            "range": "± 269",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 165475,
            "range": "± 1700",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1552321,
            "range": "± 14625",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "02b93288eb6c4767f1dd255c9b0e1a53caec98ea",
          "message": "ci(release): make build-test-evidence non-blocking (continue-on-error) (#272)\n\nAfter #269 (wasm-component-ld) and #271 (lld/wasm-ld), the build-test-\nevidence job still fails: the spar wasm32-wasip2 build pulls in highs-sys\n(a C++ solver), whose CMake CXX-ABI probe needs a full WASI C/C++ SDK —\nwasm-ld can't find crt1.o, -lc, -lc++, -lc++abi, or\nlibclang_rt.builtins-wasm32.a. The runner image no longer ships a wasi\nsysroot, and wiring in wasi-sdk is a bigger lift.\n\nThe test-evidence bundle is a compliance artifact, not a user-facing\nbinary. Mark the job continue-on-error so a failure doesn't skip Create\nGitHub Release — the release ships 8/9 assets (all binaries + vsix +\ncompliance report + SHA256SUMS, minus rivet-vX.Y.Z-test-evidence.tar.gz).\nRestoring it properly (install wasi-sdk, set WASI_SDK_PATH) is tracked\nseparately.\n\nSurfaced blocking the v0.9.0 release.\n\nCo-authored-by: Claude Opus 4.7 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-05-12T11:01:27-05:00",
          "tree_id": "53d4a4254669df75d11c6c4c8c443e6583144b8b",
          "url": "https://github.com/pulseengine/rivet/commit/02b93288eb6c4767f1dd255c9b0e1a53caec98ea"
        },
        "date": 1778602086670,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 83108,
            "range": "± 1926",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 894637,
            "range": "± 4555",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 16470216,
            "range": "± 1221264",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1944,
            "range": "± 11",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25139,
            "range": "± 106",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 369806,
            "range": "± 6308",
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
            "value": 1179021,
            "range": "± 10189",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 166424,
            "range": "± 7521",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1925750,
            "range": "± 99276",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 35295986,
            "range": "± 2414501",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 135937,
            "range": "± 1481",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1269883,
            "range": "± 12646",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 16904098,
            "range": "± 1013276",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4176,
            "range": "± 24",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 45693,
            "range": "± 168",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 741148,
            "range": "± 7339",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 57694,
            "range": "± 3221",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 701372,
            "range": "± 4446",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8162718,
            "range": "± 169556",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 771,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 6757,
            "range": "± 12",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 91811,
            "range": "± 267",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22220,
            "range": "± 77",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 150791,
            "range": "± 1969",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1394805,
            "range": "± 10135",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
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
          "id": "ff89f989948bf222e4c5d84b8905bbe7f5ae7e10",
          "message": "fix(serve): mermaid fenced blocks broken by HTML-entity escaping (#273)\n\n* fix(serve): emit fenced ```mermaid bodies verbatim, not HTML-escaped\n\n`render_markdown` injected synthetic `<pre class=\"mermaid\">` wrappers but\nstill let the fenced body flow through pulldown-cmark's `html::push_html`,\nwhich HTML-entity-escapes Event::Text — so mermaid's core `-->` arrow\nrendered as `--&gt;` (and class-diagram `<|--` as `&lt;|--`), and\nmermaid.js rejected the diagram with \"Syntax error in text\". Reported by\na user against v0.6.0 and v0.8.0.\n\nRe-tag the in-mermaid Text segments as Event::Html so they pass through\nunescaped. Mermaid diagram source contains no HTML tags; a `</pre>`\nsmuggled into a ```mermaid block would at worst close the block early,\nand `<script>` etc. are still stripped by the `sanitize_html` pass.\n(`document.rs`'s separate document renderer already emits the body\nverbatim via `join(\"\\n\")` — only `render_markdown` had the bug.)\n\nCoverage:\n- two markdown.rs unit tests: stateDiagram `[*] -->` arrows survive\n  verbatim with no `--&gt;`; classDiagram `<|--` survives with no `&lt;|--`.\n- new tests/playwright/mermaid.spec.ts: ARCH-CORE-001's embedded\n  ```mermaid flowchart serves with `Config --> Store` verbatim, and\n  mermaid.js renders it to an SVG with no \"Syntax error\" box.\n\nFixes REQ-032.\n\nImplements: REQ-032\nVerifies: REQ-032\n\nCo-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>\n\n* style: cargo fmt the new mermaid regression test\n\nWraps an over-long assert!() the formatter flagged. No behaviour change.\n\nTrace: skip\n\nCo-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>\n\n---------\n\nCo-authored-by: Claude Opus 4.7 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-05-12T13:54:46-05:00",
          "tree_id": "08588a62f8826dd1da7026559f70bf05f763abd7",
          "url": "https://github.com/pulseengine/rivet/commit/ff89f989948bf222e4c5d84b8905bbe7f5ae7e10"
        },
        "date": 1778612478776,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 81540,
            "range": "± 767",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 853988,
            "range": "± 3929",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 11199692,
            "range": "± 431145",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2168,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25835,
            "range": "± 229",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 352717,
            "range": "± 11320",
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
            "value": 1195609,
            "range": "± 22767",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 165480,
            "range": "± 983",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1905338,
            "range": "± 19234",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 24827464,
            "range": "± 1138121",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 141631,
            "range": "± 3648",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1243665,
            "range": "± 31845",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 13654168,
            "range": "± 757781",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4302,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 59292,
            "range": "± 195",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 768803,
            "range": "± 2142",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 60337,
            "range": "± 197",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 687995,
            "range": "± 3610",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7496030,
            "range": "± 79344",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 776,
            "range": "± 10",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7176,
            "range": "± 46",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 110066,
            "range": "± 860",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 24045,
            "range": "± 131",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 167988,
            "range": "± 1670",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1550374,
            "range": "± 18652",
            "unit": "ns/iter"
          }
        ]
      }
    ]
  }
}