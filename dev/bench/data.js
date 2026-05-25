window.BENCHMARK_DATA = {
  "lastUpdate": 1779702664395,
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
          "id": "b4ad938eac5adba852fdc6f9b175c5982e688841",
          "message": "feat(variant): Phase 2 — thread fields_per_variant through validate (#287) (#298)\n\nCloses #287. v0.10.0 (PR #285) shipped `Artifact::fields_per_variant`\nand the `fields_for_variant(Option<&str>) -> Cow<'_, BTreeMap<...>>`\nresolver as a building block but nothing consumed variant overlays\nduring validate. This PR wires the resolver through the validation\nengine.\n\n**rivet-core/src/schema.rs** — variant-aware helpers (additive):\n- `get_field_value_for_variant(artifact, field, variant)` resolves\n  through `Artifact::fields_for_variant` when `variant` is `Some(_)`,\n  delegates to the existing borrowed-Cow path when `None` (zero\n  allocations on the no-variant path).\n- `Condition::matches_artifact_for_variant_with(...)`.\n- `Requirement::check_for_variant(...)` for `RequiredFields`. Per\n  design §6 Phase 2 scope (\"fields only\"), `RequiredLinks` stays\n  variant-flat — links aren't overlayed.\n\n**rivet-core/src/validate.rs** — additive wrappers + threading:\n- New public APIs: `validate_with_variant`,\n  `validate_with_externals_and_variant`,\n  `validate_structural_with_variant`,\n  `validate_structural_with_externals_and_variant`.\n- Existing `validate*` functions thin-wrap the variant-aware version\n  with `variant: None`. No breaking signature changes.\n- Required-fields and allowed-values reads now go through\n  `artifact.fields_for_variant(variant)` (resolved once per artifact\n  as `effective_fields`).\n- Conditional rules (phase 8) use\n  `cond.matches_artifact_for_variant_with` +\n  `rule.then.check_for_variant`.\n\n**rivet-cli/src/main.rs cmd_validate** — threads the active variant:\n- When `--variant <name>` is set, falls through to the direct path\n  (salsa doesn't yet take variant as a tracked input) and calls\n  `validate_with_externals_and_variant(..., active_variant)`.\n- Baseline-only / no-variant / `--direct` paths preserved.\n\nTests added (rivet-core/src/validate.rs, mod tests):\n1. `conditional_rule_respects_variant_field_overlay` — artifact has\n   `fields.priority=must` and `fields-per-variant.automotive.priority=\n   should`. Conditional rule fires on `priority==must`. Without\n   variant: rule fires. With `Some(\"automotive\")`: doesn't fire.\n   With unknown variant: behaves like no variant (1 diag).\n2. `required_field_satisfied_by_variant_overlay` — required field\n   `asil` absent from `fields` but present in\n   `fields-per-variant.automotive.asil=D`. Without variant: 1\n   required-field error. With `Some(\"automotive\")`: 0 errors.\n\nNOT in this PR (deliberately):\n- `rivet list --variant <name>` filtering.\n- `rivet coverage --variant <name>` scoping.\n- Variant-aware s-expr validation rules (phase 9 in validate.rs).\n- Salsa-tracked variant input (direct-path fallback for now).\n- Cross-product multi-axis variants.\n- `when:` clause on external-anchor.\n\nImplements: REQ-004, REQ-007\nRefs: FEAT-001, #287\n\nCo-authored-by: Claude Opus 4.7 <noreply@anthropic.com>",
          "timestamp": "2026-05-18T01:48:12-05:00",
          "tree_id": "1b5ded13f4a171454da8b2da6c66da4fd1bacee2",
          "url": "https://github.com/pulseengine/rivet/commit/b4ad938eac5adba852fdc6f9b175c5982e688841"
        },
        "date": 1779087274525,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 80868,
            "range": "± 428",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 867037,
            "range": "± 14798",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 17319687,
            "range": "± 1312336",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1935,
            "range": "± 33",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24935,
            "range": "± 73",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 378233,
            "range": "± 4047",
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
            "value": 1452514,
            "range": "± 45664",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 167915,
            "range": "± 591",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 2040898,
            "range": "± 49472",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 51247349,
            "range": "± 3016791",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 120394,
            "range": "± 2768",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1110692,
            "range": "± 15665",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 26014425,
            "range": "± 2551020",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4172,
            "range": "± 23",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 45249,
            "range": "± 153",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 759386,
            "range": "± 6974",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 64110,
            "range": "± 144",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 719886,
            "range": "± 10868",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 11231376,
            "range": "± 179665",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 811,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7243,
            "range": "± 14",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 91616,
            "range": "± 816",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23288,
            "range": "± 139",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 169670,
            "range": "± 663",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1578266,
            "range": "± 22711",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "0a21a570c8f206c82ac188112e516dc4c490e1be",
          "message": "fix(import): junit import — stop overwriting + restore test→artifact link (#302)\n\nUser-reported regressions against `rivet import-results --format junit`:\n\n**Bug #1: silent overwrite on re-import.** `suite_to_run` built\n`run_id = format!(\"junit-{safe_name}\")` from the testsuite name only,\nso two CI runs of the same suite produced identical filenames and the\nsecond import wiped the first.\n\nFix: append a disambiguator to the run_id. When the JUnit\n`<testsuite timestamp=\"...\">` attribute is present (most CI tooling\nemits it), slugify it: `2026-05-17T06-35-44Z`. When absent, hash the\nsuite's case list (name, classname, outcome variant) and append as\n16-hex DefaultHasher digest. Identical re-imports of the same artefact\nremain idempotent (same hash → same filename → no churn); different\ncontent distinguishes itself.\n\n**Bug #2: test→artifact link dropped on cargo-nextest output.**\n`artifact_id_for` has 4 heuristics; the fallback emits a literal\n`\"classname.name\"` concatenation that the test-coverage report cannot\njoin back to any artifact. cargo-nextest doesn't bracket\n`[REQ-NNN]` or use the artifact ID as classname, so most rivet-on-rust\nprojects hit the fallback.\n\nFix: hook the JUnit importer into `test_scanner`. New public\n`parse_junit_xml_with_markers(xml, markers)` adds a 5th heuristic —\nwhen the existing fallback fires, look up a marker whose `test_name`\nmatches the case name (exact or suffix with separator). The CLI\n(`cmd_import_results_junit`) scans the project's `src/`+`tests/` for\n`// rivet: verifies REQ-NNN` markers before parsing the XML, then\npasses them to the new function. Bracketed and direct-classname IDs\nare preserved (they short-circuit before the marker lookup).\n\nExisting `parse_junit_xml` kept working unchanged (delegates to the\nnew path with an empty marker slice). No schema changes.\n\nTests added (6):\n- run_id_includes_timestamp_when_present\n- run_id_stable_hash_when_no_timestamp\n- run_id_different_hash_when_content_differs\n- marker_lookup_supplies_artifact_id_when_fallback_concat\n- marker_lookup_does_not_override_explicit_bracket\n- marker_lookup_returns_fallback_when_no_match\n\nWorkspace: 1003 lib tests pass (was 996, +7). Clippy clean. Format clean.\n\nTrace: skip\n\nCo-authored-by: Claude Opus 4.7 <noreply@anthropic.com>",
          "timestamp": "2026-05-18T15:27:04-05:00",
          "tree_id": "3b8503610152cc384f7648e68f9a3792ed14b9dd",
          "url": "https://github.com/pulseengine/rivet/commit/0a21a570c8f206c82ac188112e516dc4c490e1be"
        },
        "date": 1779136416537,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 83398,
            "range": "± 323",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 868012,
            "range": "± 34264",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 11611794,
            "range": "± 871767",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2173,
            "range": "± 61",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 27437,
            "range": "± 451",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 376022,
            "range": "± 1610",
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
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1437602,
            "range": "± 16716",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 160245,
            "range": "± 1687",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1846682,
            "range": "± 11758",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 23604917,
            "range": "± 294202",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 125405,
            "range": "± 3931",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1103442,
            "range": "± 27128",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 12053769,
            "range": "± 925410",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4307,
            "range": "± 191",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 58741,
            "range": "± 358",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 746241,
            "range": "± 8195",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 60733,
            "range": "± 758",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 672387,
            "range": "± 15381",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7428942,
            "range": "± 45704",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 811,
            "range": "± 12",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7251,
            "range": "± 128",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 113538,
            "range": "± 1249",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 24106,
            "range": "± 143",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 171485,
            "range": "± 1673",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1594975,
            "range": "± 15940",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "e16ca77723ad01ab10a526c06623df2e18cfc177",
          "message": "release(v0.10.1): adversarial-review action items + user-reported fixes (#303)\n\nWorkspace version 0.10.0 → 0.10.1. Patch-shaped: every change is\nadditive (new fields/subcommands/heuristics; no breaking schema/CLI).\n\nHighlights (full notes in CHANGELOG.md):\n- Added: rivet audit (#297), rivet check ai-defects-open (#295), dpia\n  artifact type (#295), variant-aware validate (#298), JUnit importer\n  marker join (#302).\n- Fixed: JUnit import overwrite + dropped linkage (#302, user-reported);\n  salsa build_store not memoized (#295); dossier scope overstated\n  (#295).\n- Changed: sigstore keyless signing of SHA256SUMS (#296),\n  build-test-evidence non-blocking (#294), cargo-mutants --jobs 4→2\n  (#301).\n\nAlso bumps vscode-rivet/package.json to 0.10.1 and allowlists \"0.10.0\"\nin rivet.yaml docs-check (historical references in dossier §0 and\nschemas/common.yaml).\n\nCo-authored-by: Claude Opus 4.7 <noreply@anthropic.com>",
          "timestamp": "2026-05-18T23:58:32-05:00",
          "tree_id": "e14ea369a98c348d7d61da53e75604314d9ef512",
          "url": "https://github.com/pulseengine/rivet/commit/e16ca77723ad01ab10a526c06623df2e18cfc177"
        },
        "date": 1779167102105,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 82903,
            "range": "± 336",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 868621,
            "range": "± 12326",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 11759943,
            "range": "± 359852",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2188,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 27884,
            "range": "± 1834",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 372759,
            "range": "± 6438",
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
            "value": 1465614,
            "range": "± 21878",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 162231,
            "range": "± 815",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1830868,
            "range": "± 15493",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 24063039,
            "range": "± 795432",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 126476,
            "range": "± 527",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1077773,
            "range": "± 30172",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 11452908,
            "range": "± 613197",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4309,
            "range": "± 30",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 59404,
            "range": "± 319",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 742309,
            "range": "± 2719",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 57354,
            "range": "± 1598",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 696187,
            "range": "± 15892",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7587142,
            "range": "± 487725",
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
            "value": 8048,
            "range": "± 22",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 111652,
            "range": "± 769",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 24566,
            "range": "± 382",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 170869,
            "range": "± 666",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1595738,
            "range": "± 42355",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "284b51c1e583f4f1a335a4d8684a10f87a0c33a7",
          "message": "ci: decouple playwright/kani/rocq from needs:[test] (#299) (#300)\n\nWhen the self-hosted rust-cpu pool saturates (rivet-core mutation\ntesting held it for ~4 hours on 2026-05-17), the entire downstream CI\ntree blocks because eight jobs chain off `test`. Three of those jobs\n— playwright (ubuntu-latest), kani (ubuntu-latest), rocq\n(ubuntu-latest) — have their own runner capacity available and are\nindependent of cargo-test passing:\n\n- Playwright runs the release binary end-to-end via npx.\n- Kani harnesses are bounded model checks against rivet-core source.\n- Rocq theorem proving runs against vendored .v files.\n\nRemove `needs: [test]` from these three jobs (Phase 1 per #299).\n\nUntouched (Phase 1 boundary):\n- coverage / mutants — legitimately re-run the same suite, keep gate.\n- verus — deferred to Phase 2.\n- vscode-extension / release-results — Phase 2 audit items.\n\nCloses #299.\n\nCo-authored-by: Claude <noreply@anthropic.com>",
          "timestamp": "2026-05-19T01:45:54-05:00",
          "tree_id": "10902068053c9085c5c42532ec3fb65266521caa",
          "url": "https://github.com/pulseengine/rivet/commit/284b51c1e583f4f1a335a4d8684a10f87a0c33a7"
        },
        "date": 1779190328197,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 82347,
            "range": "± 860",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 877199,
            "range": "± 9790",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12624029,
            "range": "± 339805",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2045,
            "range": "± 31",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24571,
            "range": "± 44",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 374853,
            "range": "± 7998",
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
            "value": 1417827,
            "range": "± 20604",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 164484,
            "range": "± 714",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1872418,
            "range": "± 15187",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 26094482,
            "range": "± 963800",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 122052,
            "range": "± 1514",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1103527,
            "range": "± 15624",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 12995506,
            "range": "± 350432",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4164,
            "range": "± 35",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 45966,
            "range": "± 1418",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 722640,
            "range": "± 4374",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 63787,
            "range": "± 642",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 712952,
            "range": "± 3065",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7957014,
            "range": "± 101393",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 797,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7085,
            "range": "± 12",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 90580,
            "range": "± 1181",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22479,
            "range": "± 266",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 156567,
            "range": "± 596",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1476459,
            "range": "± 21549",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "bfebc592baab78fc8b752713bc5d56bd3171e332",
          "message": "feat(supplier): Phase 2 — federation handshake + FederationProvenance (#288) (#292)\n\n* feat(supplier): derives-from-external structured target + FederationProvenance (#288)\n\nItems 1 and 4 of issue #288 (Phase 2 federation handshake). Lays the\ndata-model foundation for cross-org link semantics and the provenance\nblock that `rivet supplier pull` will stamp on imported artifacts.\n\n- `Link.external: Option<ExternalLinkTarget>` — when YAML `target:` is\n  a mapping (the cross-org `*-external` link types), `Link.target`\n  mirrors the mapping's `anchor:` field for graph navigation while the\n  full `{org, contract, doc-id, last-synced, sha256, anchor}` payload\n  flows into `Link.external`. Existing flat-string targets round-trip\n  unchanged via a custom serde impl that emits whichever shape the\n  link carries.\n\n- `derives-from-external` link type in `schemas/common.yaml`. Companion\n  inverse: `derived-into-external`.\n\n- `FederationProvenance` block on `Provenance` for federated artifacts:\n  `{source-org, source-tool, source-id, anchor, fetched-at,\n  source-hash, mapping-recipe}`. Optional — first-party / AI / human\n  artifacts continue to serialise without the block.\n\n- `yaml_hir.rs` CST link extractor handles the structured-target shape\n  by dedenting the raw value text and round-tripping through\n  serde_yaml. Regression-tested against the previous behaviour, which\n  silently mis-targeted the link at the first key (\"org\") of the\n  mapping value.\n\n- Mechanical: every `Link { link_type, target }` initialiser across\n  core + cli + tests now includes `external: None`, and the same\n  pattern is added to a handful of stub Provenance constructions for\n  the new `federation: None` field.\n\nTests (oracle-gated, fail without the change):\n- `model::tests::link_flat_target_yaml_roundtrip`\n- `model::tests::link_structured_target_yaml_parse`\n- `model::tests::link_structured_target_yaml_serialize_then_parse`\n- `model::tests::link_structured_target_requires_anchor`\n- `model::tests::federation_provenance_yaml_roundtrip`\n- `model::tests::provenance_federation_block_is_optional`\n- `yaml_hir::tests::links_extraction_structured_external_target`\n\nPhase 2 cited-source ReqIF backend and `rivet supplier pull` ship in\nfollow-up commits on the same branch.\n\nImplements: REQ-010\nRefs: REQ-020, FEAT-001\n\nhttps://claude.ai/code/session_01Ms4nZDTtdfzvzTu8m3ghSj\n\n* feat(cited-source): kind: reqif backend with sha + XML well-formedness gate (#288)\n\nItem 2 of issue #288 (Phase 2 federation handshake). Promotes ReqIF\nfrom \"round-trip only\" to a first-class local-file backend alongside\n`kind: file`.\n\n- `CitedSourceKind::is_local_phase2()` admits `Reqif` in addition to\n  `File`.\n- `resolve_reqif_uri()` handles `reqif://`, `file://`, and bare-path\n  forms — all degrade to local-file semantics. HTTP(S) ReqIF endpoints\n  remain Phase 3+ (auth / fetch backend out of scope here).\n- `check_cited_source` for `kind: reqif`: read bytes, sha256, verify\n  against stamped hash → `Match` / `Drift` / `MissingHash`. Plus a\n  ReqIF XML well-formedness check via `reqif::parse_reqif` so a\n  malformed supplier delivery surfaces as a typed `FileError` at\n  `rivet validate` time rather than poisoning the supplier cache at\n  pull time.\n\nTests (oracle-gated, fail without the change):\n- `cited_source::tests::check_cited_source_reqif_match_when_hash_agrees`\n- `cited_source::tests::check_cited_source_reqif_drift_when_hash_differs`\n- `cited_source::tests::check_cited_source_reqif_missing_hash_returns_computed`\n- `cited_source::tests::check_cited_source_reqif_rejects_malformed_xml`\n- `cited_source::tests::resolve_reqif_uri_handles_scheme_and_relative`\n\nFixes: REQ-004\nRefs: REQ-020, FEAT-001\n\nhttps://claude.ai/code/session_01Ms4nZDTtdfzvzTu8m3ghSj\n\n* feat(supplier): rivet supplier pull <anchor> — federation handshake (#288)\n\nItem 3 of issue #288 (Phase 2 federation handshake). Wires the\n`external-anchor` artifact's `cited-source` to a local supplier cache\nunder `.rivet/supplier-cache/<org>/<contract>/`. Phase 2 backends:\n`kind: file` and `kind: reqif`; both are read-only on the source side\nand idempotent on the cache side.\n\n- New CLI subcommand: `rivet supplier pull <anchor> [--format text|json]`.\n- Looks up the anchor by ID, validates it's `external-anchor`-typed,\n  parses its `cited-source` field, fetches the local payload, and\n  cross-checks the stamped sha256 against the wire bytes. Refuses to\n  write a poisoned cache entry when the stamped hash drifts — the\n  auditor must re-stamp the anchor and retry.\n- For ReqIF, runs `reqif::parse_reqif` to verify XML well-formedness\n  before caching.\n- Writes payload as `<anchor>.<ext>` (`.reqif` for reqif kind,\n  inherits source extension for file kind) and a sibling\n  `<anchor>.manifest.yaml` carrying the `FederationProvenance` block\n  + cache metadata.\n- Idempotent: a re-pull with identical bytes refreshes the manifest's\n  `fetched-at` but leaves the payload untouched (the JSON output\n  reports `bytes_unchanged: true`).\n- `sanitize_path_component()` clamps `<org>` / `<contract>` to ASCII\n  alphanum + `-_.` so an injected path separator can't escape the\n  cache root.\n\nMade `check::sources::current_iso8601_utc()` crate-public for reuse\nas the fetch-timestamp source.\n\nTests (oracle-gated, fail without the change):\n- `cli_commands::supplier_pull_kind_file_writes_cache_and_manifest`\n- `cli_commands::supplier_pull_refuses_on_sha256_drift`\n- `cli_commands::supplier_pull_idempotent_on_re_run`\n- `cli_commands::supplier_pull_kind_reqif_writes_reqif_extension`\n- `cli_commands::supplier_pull_unknown_anchor_errors`\n\nImplements: REQ-007\nRefs: REQ-020, FEAT-001\n\nhttps://claude.ai/code/session_01Ms4nZDTtdfzvzTu8m3ghSj\n\n---------\n\nCo-authored-by: Claude <noreply@anthropic.com>",
          "timestamp": "2026-05-19T10:46:52-05:00",
          "tree_id": "92eb60c79f406bcc25fff673528b964d49652d40",
          "url": "https://github.com/pulseengine/rivet/commit/bfebc592baab78fc8b752713bc5d56bd3171e332"
        },
        "date": 1779206042187,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84103,
            "range": "± 456",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 894847,
            "range": "± 5546",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14218636,
            "range": "± 626699",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2188,
            "range": "± 12",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25505,
            "range": "± 406",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 367284,
            "range": "± 2857",
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
            "range": "± 2",
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
            "value": 1453169,
            "range": "± 25833",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 151042,
            "range": "± 9613",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1751427,
            "range": "± 17740",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 26747394,
            "range": "± 1171881",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 130156,
            "range": "± 1398",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1137316,
            "range": "± 24356",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 14481483,
            "range": "± 1071664",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4305,
            "range": "± 37",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 61694,
            "range": "± 1361",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 804261,
            "range": "± 7310",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 61214,
            "range": "± 202",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 691955,
            "range": "± 3633",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8193007,
            "range": "± 288658",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 734,
            "range": "± 9",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7537,
            "range": "± 73",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 115541,
            "range": "± 840",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 25553,
            "range": "± 391",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 185462,
            "range": "± 2799",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1738470,
            "range": "± 25607",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "4354d99a32ce3ff9b1efbc57e7cfd824b88853b0",
          "message": "feat(variant): Phase 2 — config loading + validate/coverage wiring (#287) (#291)\n\n* feat(variant): load variant configs from a directory (Phase 2)\n\nAdd `feature_model::load_variant_configs_from_dir` so callers can\nwalk `artifacts/variants/*.yaml`, deserialize each entry as a\n`VariantConfig`, and feed the resulting list to validate / coverage /\nlist / query.\n\nThis is the loader-side primitive for issue #287. It:\n- ignores non-yaml files, sorts results by file name for reproducible\n  output across platforms,\n- returns an empty list (not an error) for a missing directory so\n  callers can use it unconditionally,\n- rejects duplicate `name:` keys across files so downstream consumers\n  never have to guess which variant a name refers to.\n\nTests cover all four behaviours (missing dir, sorted load, duplicate\nrejection, parse-error surfacing).\n\nImplements: REQ-007\n\n* style(variant): apply rustfmt to load_variant_configs_from_dir tests\n\nPure rustfmt result — no functional changes. Tightens spacing on\nmulti-arg `std::fs::write` calls and a few `assert!` macros. Was\ngenerated by running `cargo fmt --all` after the prior commit.\n\nTrace: skip\n\n* feat(validate): --variant flag and per-variant overlay validation\n\nImplements issue #287 Phase 2 acceptance criteria 1-3:\n\n1. Variant configs in `artifacts/variants/*.yaml` are loaded on every\n   command invocation (via the loader added in the previous commit).\n2. `--variant <NAME_OR_PATH>` is now accepted by `rivet validate`,\n   `rivet coverage`, `rivet list`, and `rivet query`. The argument\n   resolves first as a filesystem path, then as a bare name against\n   `<project>/artifacts/variants/<NAME>.yaml`; a bad name errors with\n   the list of available variants.\n3. Per-variant field overlays are now validated.\n   - `validate_variants` (new) does two passes:\n     * cross-check each `fields-per-variant:` key against the\n       project's known-variants set (declared configs + features) —\n       warning by default, error under the new `--strict-variants`\n       flag, matching the `Variant key 'foo' ...` error class spelled\n       out in `docs/design/variant-aware-properties.md` §5.6.\n     * type-check every variant overlay's merged view against the\n       same required-field / allowed-values rules as the default\n       view, emitting diagnostics like `field 'X' has value 'V'\n       (variant: industrial), allowed: [...]`.\n   - Per design doc §5.5 the default view is still validated by the\n     existing pipeline; the overlay layer is purely additive.\n\nCLI surface:\n- `rivet validate --variant industrial` validates default + overlay.\n- `rivet validate --strict-variants` promotes unknown-key warnings to\n  errors (CI hygiene).\n- `rivet list --variant industrial --format json` emits each\n  artifact's merged `fields:` plus a top-level `\"variant\": \"...\"`.\n- `rivet query --sexpr '(= max-temp-c \"100\")' --variant industrial`\n  filters against the merged view, so an overlay value satisfies the\n  filter where the default would not.\n- `rivet coverage --variant industrial` stamps the active variant in\n  both text and JSON output (delegated-chain scoping deferred — issue\n  #287 acceptance criterion 4).\n\nTests cover every new behaviour:\n- 4 lib tests for `load_variant_configs_from_dir` (in prior commit),\n- 7 lib tests for `validate_variants` (unknown key warning, strict\n  promotion, allowed-values failure on overlay, clean pass, required\n  field missing in merged view, empty-overlay fast path, known set\n  accepts features),\n- 8 CLI integration tests for the end-to-end `--variant` flag.\n\nImplements: REQ-004, REQ-007\nRefs: FEAT-001\n\n---------\n\nCo-authored-by: Claude <noreply@anthropic.com>",
          "timestamp": "2026-05-19T11:24:49-05:00",
          "tree_id": "ddc6eeec3f9c005f7df903e37b387ab8c2fbea7e",
          "url": "https://github.com/pulseengine/rivet/commit/4354d99a32ce3ff9b1efbc57e7cfd824b88853b0"
        },
        "date": 1779208289768,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 87164,
            "range": "± 801",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 930255,
            "range": "± 8757",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13530071,
            "range": "± 206728",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1939,
            "range": "± 32",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25145,
            "range": "± 43",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 362427,
            "range": "± 2194",
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
            "value": 1413207,
            "range": "± 22357",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 152980,
            "range": "± 839",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1775593,
            "range": "± 7371",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 25710101,
            "range": "± 248616",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 124407,
            "range": "± 466",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1142914,
            "range": "± 31076",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 14012322,
            "range": "± 410654",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4327,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 44067,
            "range": "± 368",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 769410,
            "range": "± 4502",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 64651,
            "range": "± 9096",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 709575,
            "range": "± 5288",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8226941,
            "range": "± 64061",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 765,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 6869,
            "range": "± 40",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 95590,
            "range": "± 607",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21085,
            "range": "± 116",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 146516,
            "range": "± 1128",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1360245,
            "range": "± 12417",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "2edaf06e98ad61395bdb0653b917770c992abfc3",
          "message": "docs(cross-org): cross-git investigation — findings + SEooC AoU register + change list as Rivet artifacts (#304)\n\n* docs(cross-org): cross-git investigation — findings + SEooC AoU register + change list as Rivet artifacts\n\nThree coordinated outputs from the 2026-05-19 cross-git investigation\n(6 personas, 10 scenarios, 3 test-bed repos in /tmp/rivet-cross-git/):\n\n  • docs/research/cross-git-repo-investigation.md — full synthesis:\n    11 findings, persona-converging carve-into-the-wall quotes, SEooC\n    safety-property + Assumptions-of-Use register, architectural\n    commitment question (which cross-repo mechanism survives), the\n    missing producer-side story, and comparison to git-submodules\n    and Google's `repo` tool.\n\n  • docs/rivet-is-not.md — Cederqvist-style epistemic-honesty doc in\n    SEooC Safety Manual register. Eight categorical \"Rivet is not...\"\n    sub-sections, each grounded in a real Rivet operation and naming a\n    concrete cliff. Linked from the synthesis as the doc the\n    First-Time User persona wished they had found at hour zero.\n\n  • artifacts/cross-git-investigation.yaml — the change list itself,\n    dogfooded as Rivet artifacts rather than GitHub issues:\n      FEAT-135 anchors the AoU register.\n      DD-067 records the open architectural commitment (delete\n              `externals:` in favour of `external-anchor`?).\n      REQ-062  validate must surface skipped files as Errors (P0;\n               unanimous persona blocker).\n      REQ-063  init must not silently produce broken safety-critical\n               projects (DO-178C / EN-50128 / IEC-61508 / IEC-62304).\n      REQ-064  derives-from-external must parse structured-target\n               end-to-end (advertised in #292, not delivered).\n      REQ-065  cross-repo diagnostics propagation (the SEooC AoU).\n      REQ-066  one-line schema fix: external-anchor must declare\n               cited-source.\n      REQ-067  doc topic must explain both mechanisms until DD-067\n               decides.\n      REQ-068  supplier pull must refuse-and-error on sha256 drift.\n      REQ-069  rivet supplier publish + producer-readable manifest\n               (the missing producer-side story).\n      REQ-070  link docs/rivet-is-not.md from README.\n      REQ-071  add rivet docs cross-repo-ci topic with worked GH\n               Actions example + AoU register.\n      REQ-072  docs/rivet-is-not.md §7 grows AoU-X1..X7 explicitly.\n\nEach artifact cites file:line evidence in the test logs + persona\nreactions. The change list IS its own oracle: running `rivet validate`\non the rivet repo itself reproduces F2 with 140 silent-skip WARNs on\nbindings.yaml, feature-model.yaml, and the variant configs.\n\nRefs: FEAT-135, REQ-010, REQ-004, FEAT-001\n\nCo-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>\n\n* docs(rivet-is-not): apply reviewer edits — open frame, semantic-validator retitle, DPIA expansion, Cederqvist close\n\nSubstantive review of docs/rivet-is-not.md returned six small-but-pointed\nedits. Applied in order:\n\n  1. Open frame trimmed to one paragraph and paired with a new \"What\n     Rivet is\" sibling section (three sentences). Reviewer:\n     \"Cederqvist himself would have used one [paragraph].\"\n  2. Stripped the \"billion-dollar products in 2026\" sentence — the\n     one slip from doctrinal voice into marketing-voice critique.\n  3. §5 retitled \"Rivet is not a semantic validator\" (was \"AI\n     prompt-correctness checker\"). The deeper claim is categorical;\n     AI-authored hallucination is one instance. Body and cliff\n     adjusted to keep both AI-driven and human-driven examples.\n  4. §6 expanded with a paragraph on why the recording-without-\n     performing failure mode is common in practice (recording is\n     cheap, performing is expensive; every team defaults to the\n     cheap operation under deadline pressure).\n  5. §3 cliff retold for \"an engineer (or an agent)\" with explicit\n     release-cut deadline framing. Reviewer asked for at least one\n     human-driven cliff to make clear the categorical limits hold\n     regardless of authorship.\n  6. Closing prescription opens with a Cederqvist citation:\n     \"Acquire the habit of reading specs and talking to your peers\"\n     adapted for the agent-plus-reviewer pair. Cederqvist now bookends\n     the document — once at the open, once at the close — placing it\n     in a tradition rather than borrowing from one.\n  7. \"transposed\" → \"the same pattern at a different layer\" (reviewer\n     called the former \"slightly bookish\").\n  8. DSGVO Art. 35 / Art. 4 first uses now carry \"(GDPR Art. NN)\" in\n     parentheses for the non-German-speaking reader.\n\nReviewer's overall verdict: \"Ship it after the small edits.\"\n\nRefs: FEAT-135, REQ-072\n\nCo-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>\n\n* docs(rivet-is-not): link the Cederqvist source at first mention\n\nVerified the canonical GNU mirror of the \"What is CVS not?\" section\n(part of the CVS manual maintained downstream of Cederqvist's 1993\nauthorship). Opening sentence: \"CVS can do a lot of things for you,\nbut it does not try to be everything for everyone.\" That sentence is\nthe structural-honesty thesis the document inherits.\n\nOne inline link at the first Cederqvist mention. The closing\nprescription keeps its bare-name attribution. Reviewer's other\nannotations considered:\n\n  - \"notified body\" terminology in §4 — kept; the surrounding\n    vocabulary (ISO 26262-8, DO-330, GSN) is already specialist,\n    and a reader who follows those terms knows \"notified body\".\n  - Load-bearing path citations in §4 (rivet-tool-confidence.yaml,\n    tool-qualification-dossier.md) and §7 (cross-org-supplier-\n    traceability.md §2) all verified to resolve in this commit.\n    The reviewer's broader suggestion of a rivet validate rule to\n    keep them honest is a feature request, not this PR's scope.\n  - Possible §6/§8 collapse into \"Rivet records, it does not\n    verify\" — kept separate. Reviewer marked it \"Not a required\n    edit\"; both sections currently land.\n\nRefs: FEAT-135, REQ-072\n\nCo-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>\n\n* docs: cross-link rivet-is-not.md ↔ what-is-rivet.md — different registers, same tool\n\nThe just-shipped docs/rivet-is-not.md and the existing\ndocs/what-is-rivet.md both carry a \"What rivet is NOT\" framing — but\nin different registers. Pre-existing what-is-rivet.md §6 is a\nmarketing-voice bullet list (\"Honesty over hype\" plus seven items\nmixing real limits with v0.5.0 roadmap pointers). New\ndocs/rivet-is-not.md is the SEooC Safety Manual draft in\nCederqvist register.\n\nBoth audiences are legitimate:\n  - what-is-rivet.md is the positioning doc (carries the\n    `<!-- rivet-docs-check: design-doc-aspirational-ok -->` marker)\n    and is the right entry point for someone evaluating Rivet.\n  - rivet-is-not.md is the integrator-facing categorical-limits\n    doc and is the right reference for someone building Rivet into\n    a safety case.\n\nAdding one-sentence cross-references in each direction so a reader\nlanding on either doc can find the other. Neither doc is deleted or\nmerged — they describe the same tool from opposite directions and\nserve different points in the integrator lifecycle.\n\nOut of scope for this commit:\n  - what-is-rivet.md staleness (it's still v0.4.1 / 2026-04-19\n    positioning with several \"planned for v0.5.0\" markers that\n    have shipped or rescoped in v0.10.x). Tracked as a follow-up;\n    the design-doc-aspirational-ok marker acknowledges the lag.\n  - Any consolidation of the two §6/bullets vs §1-§8/categorical\n    treatments. Both currently land, in their respective registers.\n\nRefs: FEAT-135, REQ-072\n\nCo-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>\n\n* docs: dogfood frontmatter on the three new/touched docs + REQ-073 for the broader docs/ structure gap\n\nUser flag 2026-05-19: \"i think the whole docs folder is not well\nstructured and planning stuff in which might be interesting for\nsome time but...\" The point lands. Of 19 depth-1 markdown files\nunder docs/, 11 lack YAML frontmatter — they are invisible to\n`rivet docs`, the dashboard Documents view, and the [[ID]] linkage\nlayer. Rivet does not dogfood its own documents-as-artifacts model.\n\nThis commit handles three things, no more:\n\n  1. Add frontmatter to the three docs introduced or touched in\n     this PR — so the immediate output of this PR doesn't itself\n     widen the dogfood gap:\n       docs/rivet-is-not.md\n         id: DOC-RIVET-LIMITS · type: safety-manual-draft · status: draft\n       docs/research/cross-git-repo-investigation.md\n         id: DOC-CROSS-GIT-INV-2026-05-19 · type: investigation · status: snapshot\n       docs/what-is-rivet.md\n         id: DOC-RIVET-INTRO · type: positioning · status: current\n\n  2. Track the broader docs/ structural problem as REQ-073 in the\n     existing change list (artifacts/cross-git-investigation.yaml).\n     The requirement enumerates: the 11 skipped files; the\n     three-subdir mixing (design/, plans/, research/); the\n     ephemeral-vs-reference lifecycle question; and a candidate\n     `rivet docs --check-frontmatter` CI gate that would close the\n     dogfood loop. Linked back to FEAT-135.\n\n  3. Document the lifecycle distinction explicitly via the\n     `status: snapshot` field on the investigation report —\n     contrasting it with `status: current` for the positioning\n     doc. Future docs in docs/research/ should follow the same\n     pattern until REQ-073's subdir policy lands.\n\nOut of scope for this commit:\n  - Frontmatter for the other 11 docs (REQ-073 tracks it; touching\n    them now would make this PR a docs-bulk-edit).\n  - Reorganising docs/ subdirs (REQ-073 (b)).\n  - The `rivet docs --check-frontmatter` sub-command (REQ-073 (d)).\n\nRefs: FEAT-135, REQ-073\n\nCo-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>\n\n* docs(req): REQ-074 — independent audit of every docs/ markdown against {useful, done-vs-planned, still-true}\n\nUser feedback 2026-05-19 after REQ-073 landed:\n\n  \"i would question to validate the need of all the documents\n   against an independent subagent validating the usefulness as\n   well as if it describes something done or planned or compared\n   if it is still true\"\n\nFiling as REQ-074 in the same change list. The audit is a phase\ndistinct from acting on the audit:\n\n  Phase 1: mechanical classification per file — KEEP / UPDATE /\n           ARCHIVE / DELETE / INVESTIGATE — done by an independent\n           reviewer (subagent or human, NOT the original author).\n  Phase 2: act on each verdict, one PR per cluster.\n\nREQ-074 connects to REQ-073: do the audit first, then frontmatter\nthe survivors — avoid stamping `id:` + `title:` onto docs we're\nabout to delete.\n\nFirst-pass audit launched together with this commit (independent\nsubagent reading docs/ + spot-checking against current main +\nv0.10.1 binary state). Verdict output will be captured separately\nand linked back to REQ-074.\n\nRefs: FEAT-135, REQ-074\n\nCo-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>\n\n* docs(req): add executable Acceptance criteria to REQ-062..REQ-074\n\nUser feedback 2026-05-19: \"ensure that these requirement have a\nvalidation with a step which can be executed and tested against\".\n\nA REQ without acceptance criteria is a wish, not a requirement.\nAdding an `Acceptance:` block to the description of every one of\nthe 13 requirements in artifacts/cross-git-investigation.yaml.\n\nEach block answers the same three questions:\n\n  1. What is the literal action / shell command that demonstrates\n     the REQ is satisfied?\n  2. What output / exit code / diagnostic is expected?\n  3. Where is the regression-test fixture that locks the behaviour?\n\nExamples of the register:\n\n  REQ-062  → \"Create a project with one well-formed artifact YAML\n              and one malformed (top-level `id:` instead of\n              `artifacts:` wrapper). Run `rivet validate --format\n              json`. Verify exit code 1, `result: FAIL`, `errors\n              >= 1`, and at least one entry in `diagnostics[]`\n              with `rule: artifact-parse-error`...\"\n\n  REQ-072  → \"`grep -c \"AoU-X[1-7]\" docs/rivet-is-not.md` returns\n              exactly 7.\"\n\n  REQ-073  → \"`rivet validate 2>&1 | grep -c \"no YAML frontmatter\"`\n              returns 0 (currently 11 on main as of this commit).\"\n\n  REQ-074  → \"Re-running the audit yields zero new INVESTIGATE\n              verdicts and a strictly smaller UPDATE+DELETE count\n              than the previous pass.\"\n\nEach criterion is testable from the shell without ambiguity. None\nare aspirational; all are mechanical or doc-grep checks.\n\nSchema note: Acceptance lives inside the description prose block,\nnot as a separate `acceptance:` field. That keeps the artifacts\nschema-conformant (no `field-undefined` INFOs) while still letting\na reviewer find the verification step instantly via a Ctrl-F on\n\"Acceptance:\" — 13 hits, 13 REQs.\n\nRefs: FEAT-135, REQ-062, REQ-063, REQ-064, REQ-065, REQ-066,\n      REQ-067, REQ-068, REQ-069, REQ-070, REQ-071, REQ-072,\n      REQ-073, REQ-074\n\nCo-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>\n\n* docs(audit): land REQ-074 first-pass docs audit + record doc-vs-artifact graph-unification gap as REQ-073 side-finding\n\nUser feedback drove REQ-074 (independent audit of all 52 docs/\nmarkdown files against {useful, done-vs-planned, still-true}).\nFirst-pass audit completed by independent subagent:\n\n  Verdict counts: KEEP 18 / UPDATE 11 / ARCHIVE 16 / DELETE 0 /\n                  INVESTIGATE 4 / out-of-scope-this-PR 3\n\n  Five worst offenders (most likely to mislead a reader today):\n    1. docs/schemas.md     — lists 5 of 28 shipped schemas\n    2. docs/architecture.md — module table omits ~half of rivet-core;\n                              schema table same defect as schemas.md;\n                              claims OSLC shipped as CLI surface (it isn't)\n    3. docs/oracles.md     — lists 3 of 5 shipped oracles (missing\n                              `sources` and `ai-defects-open` — the\n                              latter is load-bearing for the\n                              tool-qualification dossier's TD1 layer)\n    4. docs/roadmap.md     — marks v0.4.0-and-later as \"Phase 3 — Planned\"\n                              while v0.10.x has shipped most of it\n    5. docs/audit-report.md — 2026-03-09 snapshot still indexed as\n                              a current doc; claims \"Fuzz/Mutation\n                              NOT IMPLEMENTED\" while CI runs both\n\n  Three exemplars (use as templates for the rest):\n    1. design/tool-qualification-dossier.md — §0 honest-scope\n    2. design/polarion-reqif-fidelity.md   — field-by-field LOSSLESS/LOSSY/ABSENT\n    3. design/status-gate-rules.md         — self-declares \"shipped (date, branch)\"\n\n  Directory-structure proposal (8 subdirs by lifecycle):\n    reference/ architecture/ design/ plans/ historical/\n    research/ marketing/ status/\n\n  Two CI checks that would prevent two-thirds of staleness:\n    1. `last-verified:` older than 90 days → warning\n       (extend the cited-source-stale rule to docs)\n    2. Prose-numeric claims (\"28 schemas\") must either be\n       `{{stats:...}}` embeds or carry `<!-- AUDIT: verified DATE -->`\n\n  Single most cost-effective fix: move 12× `plans/2026-03-*.md` +\n  `audit-report.md` to `docs/historical/`. Removes most of the rot\n  in one PR.\n\nCaptured at `docs/research/2026-05-19-docs-audit.md` with\nfrontmatter (id: DOC-DOCS-AUDIT-2026-05-19, type: audit,\nstatus: snapshot). Referenced from REQ-074's Evidence section via\n`[[DOC-DOCS-AUDIT-2026-05-19]]` document-cross-reference syntax.\n\n────────────────────────────────────────────────────────────────\n\nSIDE-FINDING — recorded under REQ-073 description:\n\nTried to add `traces-to: DOC-DOCS-AUDIT-2026-05-19` to REQ-074's\ntyped links. `rivet validate` emitted:\n\n  ERROR: [REQ-074] link 'traces-to' targets\n         'DOC-DOCS-AUDIT-2026-05-19' which does not exist\n  broken cross-refs: 1\n\nDocuments declared with `id:` in markdown frontmatter are NOT\naddressable as typed-link targets from artifact YAML. The\nartifact store and the document store share an ID namespace but\ndo not unify into one graph. The `[[ID]]` syntax in doc bodies\nbridges from docs → artifacts; the reverse bridge does not exist.\n\nThis is a real dogfood gap — Rivet ships two graphs that look\nunified at the namespace level but aren't. Recorded as a sub-clause\nof REQ-073 (b)'s docs/ structure decision: when REQ-073 (b)\ndecides the structure, it should also decide whether documents\nbecome first-class artifacts in the typed graph or remain a\nparallel system. Workaround in this commit: artifact YAML\nreferences the audit via prose `[[DOC-ID]]` only; typed link is\nomitted.\n\nRefs: FEAT-135, REQ-073, REQ-074\n\nCo-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>\n\n* fix: green up PR #304 — doc-check markers + DD-067 rationale field placement\n\nPR #304's CI surfaced two real failures (the other five — Playwright,\nMiri, Proptest, Kani, Rocq — are the known pre-existing flakes).\n\n── Docs Check: 7 violations across 2 files ──\n\n  cross-git-repo-investigation.md — 6 violations:\n    ArtifactCounts ×2  (\"10 scenarios\")\n    ArtifactIdValidity ×2  (REQ-ABS-001, ANCHOR-ACME-001 — test-bed\n      artifacts that live in /tmp/rivet-cross-git/, not the store)\n    SubcommandReferences ×2  (rivet migrate, rivet workspace —\n      referenced precisely because the findings are about their\n      absence)\n  rivet-is-not.md — 1 violation:\n    ArtifactIdValidity  (REQ-SW-022 — an illustrative supplier\n      requirement ID in §3 prose)\n\n  Fix: the investigation doc is a `status: snapshot` research\n  document — same category as docs/design/ and docs/plans/, which\n  doc_check auto-treats as design docs. Added the\n  `design-doc-aspirational-ok` marker (with a comment explaining the\n  snapshot rationale and noting that doc_check should learn to\n  auto-cover docs/research/ — a follow-up under REQ-073). For\n  rivet-is-not.md, which is a reference doc and must stay\n  doc-check-clean without a blanket marker, used a precise\n  `<!-- rivet-docs-check: ignore REQ-SW-022 -->` on the one line.\n\n  Result: doc-check PASS (57 files, 0 violations).\n\n── Test: 2 failures, both from DD-067 ──\n\n  test_dogfood_validate and stats_json_counts_match_validate both\n  failed because DD-067 carried its `rationale` as a TOP-LEVEL\n  artifact key. The `design-decision` schema (schemas/dev.yaml)\n  declares `rationale` as a *required field* — it belongs inside\n  `fields:`, not at artifact top level. Moved it in.\n\n  Worth recording: the salsa-cached `rivet validate` path reported\n  6 errors while `rivet stats` and `rivet validate --direct`\n  reported 7 — the missing-required-field on DD-067 was visible to\n  the direct validator and to stats but NOT to the salsa-incremental\n  path. That divergence is a real salsa-incremental-correctness bug,\n  F2-adjacent (two code paths disagreeing on the same input). It is\n  not introduced by this PR and not in scope to fix here, but it is\n  why the CI Test job caught DD-067 while a local salsa-cached\n  `rivet validate` did not. Flagging for a future REQ.\n\n  Both tests verified green locally:\n    test_dogfood_validate ... ok\n    stats_json_counts_match_validate ... ok\n\nRefs: FEAT-135, REQ-073\n\nCo-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>\n\n---------\n\nCo-authored-by: Claude Opus 4.7 <noreply@anthropic.com>",
          "timestamp": "2026-05-20T11:07:57-05:00",
          "tree_id": "2da8150113bd609b9005b6087ca25f835eb535fa",
          "url": "https://github.com/pulseengine/rivet/commit/2edaf06e98ad61395bdb0653b917770c992abfc3"
        },
        "date": 1779293668837,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 83344,
            "range": "± 1162",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 900971,
            "range": "± 4848",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14039810,
            "range": "± 516231",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2120,
            "range": "± 14",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 27194,
            "range": "± 361",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 374533,
            "range": "± 2510",
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
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1428743,
            "range": "± 24363",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 147834,
            "range": "± 572",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1763095,
            "range": "± 37286",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 28203174,
            "range": "± 1358017",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 129190,
            "range": "± 1426",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1120998,
            "range": "± 10644",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 17790355,
            "range": "± 763016",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4396,
            "range": "± 175",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 61531,
            "range": "± 543",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 792986,
            "range": "± 5398",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 62515,
            "range": "± 1241",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 695312,
            "range": "± 9570",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8671326,
            "range": "± 237752",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 790,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7790,
            "range": "± 107",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 118056,
            "range": "± 808",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23040,
            "range": "± 463",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 169623,
            "range": "± 2269",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1503591,
            "range": "± 27179",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "4848961a88ef3658729c889b631df7d1c6d72b29",
          "message": "fix(validate): surface skipped artifact files as Errors, not stderr-only WARNs (REQ-062) (#305)\n\nThe P0 from the cross-git investigation (FEAT-135 / REQ-062). `rivet\nvalidate` reported `Result: PASS (0 warnings)` when artifact files\nfailed to parse — the skip was swallowed to a stderr `log::warn!` in\n`formats::generic::import_generic_directory` and never reached the\ndiagnostics. A user who wrote an artifact file with the wrong shape\ngot a green PASS over an empty load. The textbook Cederqvist cliff:\ntextual success over a semantically-failed operation.\n\n── classification: F2a (error) vs F2b (legitimate skip) ──\n\nNot every YAML file under a `generic-yaml` source path is an artifact\nfile. `artifacts/bindings.yaml`, `artifacts/feature-model.yaml`, and\n`artifacts/variants/*.yaml` legitimately live there. Promoting every\nskip to an error would make rivet's own repo fail validate. New\n`classify_skip` (rivet-core/src/formats/generic.rs) re-parses a\nfailed file as generic YAML and decides:\n\n  1. not valid YAML at all                 -> ParseError   (F2a)\n  2. top-level mapping has an `artifacts:`  -> ParseError   (malformed list)\n  3. top-level mapping has `id` AND `type`  -> ParseError   (artifact\n       written without the `artifacts:` wrapper — the F2a reproducer)\n  4. anything else                         -> NotArtifactFile (F2b — skip)\n\n── plumbing: non-breaking ──\n\n`load_artifacts`'s signature is unchanged (the repo has a semver gate\non the rivet-core public API). New `load_artifacts_with_skips` returns\n`(Vec<Artifact>, Vec<SkippedFile>)`; `SkipKind`/`SkippedFile` are\nre-exported from the crate root. `cmd_validate` calls it, collects the\n`ParseError` skips, and pushes one `artifact-parse-error` Error\ndiagnostic per skip into the diagnostics vec — flowing into `errors`,\nthe text/JSON output, and the exit code. `NotArtifactFile` skips stay\nsilent.\n\nThe validate `--format json` diagnostic serializer also gained a\n`rule` field (it previously emitted only `severity`/`artifact_id`/\n`message`) — REQ-062's acceptance requires `rule: artifact-parse-error`\nto be visible to a JSON consumer.\n\n── tests ──\n\n  rivet-core: scan_skipped_files_classifies_malformed_vs_non_artifact,\n              classify_skip_treats_corrupt_yaml_as_parse_error\n  rivet-cli:  validate_surfaces_parse_error_on_malformed_artifact_file\n              — oracle-gated: one good + one malformed artifact file\n              -> exit non-zero, result FAIL, errors>=1, an\n              artifact-parse-error diagnostic naming the file; plus an\n              F2b assertion that a bindings.yaml adds no error.\n\nVerified green: cargo build --workspace, clippy -D warnings (exit 0),\nthe three tests above, and test_dogfood_validate (the F2b regression\nguard — rivet's own bindings/feature-model/variant files must not\nerror).\n\nImplements: REQ-004\nVerifies: REQ-062\nRefs: FEAT-135\n\nCo-authored-by: Claude Opus 4.7 <noreply@anthropic.com>",
          "timestamp": "2026-05-20T12:50:41-05:00",
          "tree_id": "73837d7dfd68c1edf60973bcddc8d59c1a0b83dd",
          "url": "https://github.com/pulseengine/rivet/commit/4848961a88ef3658729c889b631df7d1c6d72b29"
        },
        "date": 1779299832426,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 83848,
            "range": "± 2116",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 885756,
            "range": "± 6357",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13224942,
            "range": "± 920409",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2183,
            "range": "± 27",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25974,
            "range": "± 355",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 393070,
            "range": "± 1496",
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
            "value": 1434742,
            "range": "± 15149",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 168037,
            "range": "± 1079",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1924431,
            "range": "± 13160",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 26205192,
            "range": "± 1155283",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 129569,
            "range": "± 2200",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1141730,
            "range": "± 9259",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 12870019,
            "range": "± 542203",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4345,
            "range": "± 13",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 62072,
            "range": "± 232",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 806686,
            "range": "± 2392",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 63782,
            "range": "± 440",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 723135,
            "range": "± 3051",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7964315,
            "range": "± 365914",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 753,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 6999,
            "range": "± 30",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 117658,
            "range": "± 588",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 26057,
            "range": "± 191",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 184842,
            "range": "± 673",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1742238,
            "range": "± 14675",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "1741bbfcf39be30f449f07658b0a5ec8d547f58e",
          "message": "docs+schema: external-anchor cited-source field, README \"is not\" link, MSRV doc fix (#306)\n\nWave 1 / PR-B of the cross-git investigation follow-ups (FEAT-135).\nThree small, low-risk fixes bundled — no code changes.\n\nREQ-066 — `external-anchor` schema declares `cited-source`.\n  Every `external-anchor` artifact carrying a `cited-source` (the\n  field `rivet supplier pull` needs) emitted a spurious\n  `field 'cited-source' is not defined in schema for type\n  'external-anchor'` INFO at validate time — the artifact type built\n  for federation did not declare the field that makes it functional.\n  One field added to `schemas/common.yaml`. Verified: an\n  external-anchor with a cited-source no longer emits the INFO.\n\nREQ-070 — README links docs/rivet-is-not.md above the first\n  user-action heading.\n  Per the First-Time User persona (\"put it in the README, not three\n  clicks deep\"). A blockquote before `## Install` points at the\n  SEooC \"What Rivet is not\" doc.\n\nMSRV doc fix (from the docs audit, DOC-DOCS-AUDIT-2026-05-19).\n  `docs/srs.md` and `docs/verification.md` said MSRV 1.85;\n  `Cargo.toml` pins 1.89. Both docs corrected.\n\nVerified: `rivet docs check` PASS (57 files, 0 violations);\nbinary rebuilds clean with the schema change.\n\nImplements: REQ-010\nVerifies: REQ-066\nRefs: FEAT-135, REQ-070\n\nCo-authored-by: Claude Opus 4.7 <noreply@anthropic.com>",
          "timestamp": "2026-05-20T13:45:02-05:00",
          "tree_id": "6f24cf7e49b77df66090eff0e5e126dd31ccdb57",
          "url": "https://github.com/pulseengine/rivet/commit/1741bbfcf39be30f449f07658b0a5ec8d547f58e"
        },
        "date": 1779303114258,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 76960,
            "range": "± 828",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 921525,
            "range": "± 30398",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 18023071,
            "range": "± 1118012",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1720,
            "range": "± 26",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 19146,
            "range": "± 44",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 341425,
            "range": "± 1016",
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
            "value": 87,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1344876,
            "range": "± 19158",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 159603,
            "range": "± 389",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1823971,
            "range": "± 22995",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 32488064,
            "range": "± 1838685",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 117890,
            "range": "± 736",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1109793,
            "range": "± 12000",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 17512843,
            "range": "± 2296852",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3915,
            "range": "± 69",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 41567,
            "range": "± 145",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 788854,
            "range": "± 16789",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 54029,
            "range": "± 1584",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 590839,
            "range": "± 6933",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7317955,
            "range": "± 438496",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 606,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 5266,
            "range": "± 17",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 135487,
            "range": "± 612",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22876,
            "range": "± 36",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 172354,
            "range": "± 277",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1616039,
            "range": "± 10561",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "9909bebd3f410e732dec06472cda2b2b8254b127",
          "message": "docs(req): REQ-075 (duplicate IDs) + REQ-076 (orphan detection) — two F2-family findings as typed work items (#307)\n\nTwo findings surfaced in conversation after the cross-git\ninvestigation landed (#304), both confirmed empirically against the\nv0.10.1 binary:\n\nREQ-075 — duplicate artifact IDs are silently swallowed.\n  Two artifacts with the same `id` (two files, or twice in one\n  file) collapse via `store.upsert`'s last-write-wins; the earlier\n  definition is destroyed and `rivet validate` reports PASS.\n  Reproduced 2026-05-20: two files both declaring `id: REQ-DUP` ->\n  `Result: PASS (0 warnings)`, one survivor. `docs/artifact-format`\n  states the uniqueness invariant; nothing enforces it. Direct\n  sibling of REQ-062 — detection must happen at load time, where\n  both copies still exist. Emit `rule: duplicate-artifact-id`\n  naming both source files. P1.\n\nREQ-076 — orphan artifacts are invisible to `rivet validate`.\n  `rivet stats` reports `Orphan artifacts (no links): N`;\n  `rivet validate` never mentions orphans (grep -ic orphan -> 0).\n  An artifact disconnected from the traceability graph passes\n  validate clean. Rivet's own main has 5 such orphans. Fix: emit\n  `rule: orphan-artifact` per orphan — Warning by default (the\n  dogfood's own 5 orphans forbid a hard-error default — REQ-062's\n  F2b lesson applied to severity), Error under `--strict-orphans`,\n  mirroring the `cited-source-drift` strict-flag pattern.\n\nBoth carry executable `Acceptance:` blocks and link to FEAT-135;\nREQ-075 and REQ-076 both `traces-to` REQ-062 as the sibling fix\nwhose load-report channel they reuse. Slotted into Wave 2 (P1 code\nfixes) of the follow-up plan.\n\nThis commit adds the work items only — the implementations are\nseparate PRs per the audit-then-act discipline established by\nREQ-074.\n\nRefs: FEAT-135, REQ-075, REQ-076\n\nCo-authored-by: Claude Opus 4.7 <noreply@anthropic.com>",
          "timestamp": "2026-05-20T13:45:34-05:00",
          "tree_id": "e935e358f71da3a7e53779545721aa54dd8362e5",
          "url": "https://github.com/pulseengine/rivet/commit/9909bebd3f410e732dec06472cda2b2b8254b127"
        },
        "date": 1779303562540,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85097,
            "range": "± 1046",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 929535,
            "range": "± 11438",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14957925,
            "range": "± 609185",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1917,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24968,
            "range": "± 52",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 356277,
            "range": "± 1097",
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
            "value": 99,
            "range": "± 1",
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
            "value": 1430538,
            "range": "± 23325",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 166720,
            "range": "± 857",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1917845,
            "range": "± 31320",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 53692542,
            "range": "± 4226588",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 123597,
            "range": "± 2748",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1132428,
            "range": "± 15042",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 14081552,
            "range": "± 1433241",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4248,
            "range": "± 129",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 45259,
            "range": "± 4967",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 758399,
            "range": "± 5634",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 64155,
            "range": "± 2697",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 726335,
            "range": "± 3147",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7991848,
            "range": "± 206269",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 785,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7177,
            "range": "± 16",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 99824,
            "range": "± 437",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 25760,
            "range": "± 98",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 175685,
            "range": "± 4881",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1644844,
            "range": "± 8710",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "0d98b7c14247c7536a9b2776e9edd45de04aef15",
          "message": "docs: archive 17 stale planning docs to docs/historical/ (REQ-074 Phase 2a) (#308)\n\nWave 1 / PR-C of the cross-git investigation follow-ups. Acts on the\nARCHIVE verdicts from the docs audit (DOC-DOCS-AUDIT-2026-05-19):\nroughly a third of the docs/ tree was dead-letter planning material\nsitting next to active reference docs.\n\nMoved to docs/historical/ (17 files, all `git mv` — history preserved):\n  - 15 docs/plans/2026-03-*.md — implementation plans for work that\n    has long since shipped (commit-traceability, cross-repo linking,\n    rowan/salsa, baseline-scoped validation, LSP, formal-verification\n    completion, the v0.1.0 release plan, ...).\n  - docs/audit-report.md — a 2026-03-09 doc-vs-reality snapshot that\n    still claimed fuzz/mutation testing \"NOT IMPLEMENTED\" while CI\n    runs both. Superseded by docs/research/2026-05-19-docs-audit.md.\n  - docs/design/rivet-cli-gaps-2026-04.md — a gap list with most\n    items now shipped.\n\nKept in docs/plans/: oslc-analysis.md (audit verdict KEEP — explains\na deliberate non-shipping decision still in force) and the two\nvscode-lsp-rendering files (audit verdict INVESTIGATE — need a\nmaintainer triage, not archival).\n\ndoc_check change: `docs/historical/` joins `docs/plans/` and\n`docs/design/` as an auto-`is_design_doc` directory. A frozen\narchive snapshot legitimately references subcommands, artifact\ncounts, and IDs that have since changed; without the exemption the\nmoved files would trip the existence-based doc-check invariants\n(SubcommandReferences / ArtifactCounts / ArtifactIdValidity). New\nunit test `historical_dir_is_design_doc_without_marker`.\n\nThe one real inbound markdown link (what-is-rivet.md → audit-report)\nis repointed to the new path and annotated as superseded.\n\nVerified: `rivet docs check` PASS (57 files, 0 violations);\n`cargo clippy -p rivet-core -- -D warnings` exit 0; the new unit\ntest passes.\n\nRefs: FEAT-135, REQ-073, REQ-074\n\nCo-authored-by: Claude Opus 4.7 <noreply@anthropic.com>",
          "timestamp": "2026-05-20T14:29:35-05:00",
          "tree_id": "1c905c764e545d569816543f958c473eb2f0a406",
          "url": "https://github.com/pulseengine/rivet/commit/0d98b7c14247c7536a9b2776e9edd45de04aef15"
        },
        "date": 1779305769212,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84856,
            "range": "± 1777",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 905289,
            "range": "± 17182",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 18072963,
            "range": "± 976388",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2175,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26544,
            "range": "± 245",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 376341,
            "range": "± 3664",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 98,
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
            "value": 1439087,
            "range": "± 36239",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 163420,
            "range": "± 1902",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1895544,
            "range": "± 25143",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 25459231,
            "range": "± 1510987",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 128112,
            "range": "± 1928",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1135641,
            "range": "± 19430",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 13701860,
            "range": "± 1780687",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4271,
            "range": "± 13",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 64974,
            "range": "± 193",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 799740,
            "range": "± 8549",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 66185,
            "range": "± 229",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 736927,
            "range": "± 9713",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8400859,
            "range": "± 513238",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 765,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7100,
            "range": "± 142",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 118468,
            "range": "± 1114",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 25293,
            "range": "± 108",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 183352,
            "range": "± 1373",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1735289,
            "range": "± 19344",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "ef5a855c2d7386c7701ba18245400a0e686cb973",
          "message": "Wave 2: five P1 cross-git fixes (REQ-063/064/068/075/076) (#309)\n\n* fix(init): safety-critical presets must produce validating projects (REQ-063)\n\nThe do-178c/en-50128/iec-61508/iec-62304 presets named schemas that\nwere never embedded in the binary; rivet init relies entirely on the\ninclude_str! embedded-schema registry and never writes schemas to disk,\nso the next rivet validate failed. Embed all four schemas alongside the\nworking five. iec-61508 and iec-62304 also carried an unsupported\n`condition:` field inside traceability-rules (no such parser feature\nexists); replace it with the project-level-concern comment pattern that\nen-50128 already uses, so the schemas parse and fresh projects validate.\n\nImplements: REQ-007\nVerifies: REQ-063\nRefs: FEAT-135\n\n* fix(validate): derives-from-external satisfies a required derives-from link-field (REQ-064)\n\nThe cross-git investigation's S4 finding misdiagnosed this as \"the\nstructured target is silently parsed as derives-from with no target\".\nReproduction shows the link parses correctly — `rivet get` reports\n`type: derives-from-external, target: ANCHOR-X`. The real bug is in\nthe validator's link-field cardinality check\n(`validate.rs` phase 4): it counted only links whose type *exactly*\nequalled the required link-field type. A `sw-req` carrying a\n`derives-from-external` link to satisfy its required `derives-from`\nlink-field therefore counted 0 and failed with a spurious\n`link 'derives-from' requires at least 1 target, found 0` Error.\n\nFix: new `link_satisfies_field(actual, required)` — a `<base>-external`\nlink is the cross-organizational variant of `<base>` (it terminates at\nan `external-anchor` rather than an in-house artifact, but the\nderivation still happened, it just crossed an org boundary), so it\nsatisfies a required `<base>` link-field. The cardinality count uses\nit. The target-type check deliberately does NOT: a `derives-from-external`\nlink legitimately points at an `external-anchor`, which is not in the\nbase field's target-type list, and the existing exact-match filter\ncorrectly skips it there.\n\nRegression test: validate_accepts_derives_from_external_structured_target.\nVerified: test_dogfood_validate still green; clippy -D warnings exit 0.\n\nImplements: REQ-004\nVerifies: REQ-064\nRefs: FEAT-135\n\n* fix(supplier): rivet supplier pull refuses on sha256 drift; --accept-drift to override (REQ-068)\n\n`rivet supplier pull` was the only side of the federation handshake that\nsilently accepted changed supplier bytes — overwriting the cache and\nexiting 0 with no DRIFT header — while `rivet validate` correctly refused\nthe same drift. A fetch was thus granting the supplier authority to revise\na delivered artifact with no audit trail.\n\nPull is now the authorisation point: it compares the new payload's sha256\nagainst the prior recorded hash (the prior cache manifest's source-hash,\nfalling back to the anchor's stamped cited-source.sha256). On mismatch it\nrefuses — exit non-zero, naming the prior hash, the new hash, and the\nsupplier identity (org + contract) — and leaves the cache untouched. The\nnew --accept-drift flag is the explicit auditor authorisation path: it\noverwrites the cache and re-stamps the anchor's cited-source. First pulls\nand idempotent re-pulls of identical bytes are unaffected.\n\nImplements: REQ-007\nVerifies: REQ-068\nRefs: FEAT-135\n\n* fix(validate): detect duplicate artifact IDs + surface orphans (REQ-075, REQ-076)\n\nREQ-075: two artifacts declaring the same `id` collapsed silently —\n`Store::upsert` is last-write-wins, so by the time `validate::validate`\nruns only the survivor exists and the validator is structurally blind to\nthe collision. Extend the REQ-062 load-report channel: add a `LoadReport`\nstruct and `load_artifacts_with_report` that, alongside skipped files,\nreturns `DuplicateId` records detected at LOAD time where both copies are\nstill visible. `cmd_validate` loads every source, runs a project-wide\nduplicate pass (`detect_duplicate_ids_for_validate`), and emits one Error\ndiagnostic per collision with `rule: duplicate-artifact-id` naming both\nsource files and the colliding ID. `load_artifacts`'s signature is\nunchanged (rivet-core public API semver gate).\n\nREQ-076: orphan artifacts (no inbound and no outbound links) were visible\nto `rivet stats` but never to `rivet validate`. `cmd_validate` now reuses\n`LinkGraph::orphans` — the exact computation behind `rivet stats` — and\nemits one `rule: orphan-artifact` diagnostic per orphan. Severity is\nWarning by default (a hard-error default would break Rivet's own dogfood,\nwhich carries orphans) and is promoted to Error by a new `--strict-orphans`\nflag, wired exactly like `--strict-cited-sources`.\n\n`cmd_stats` now mirrors both rules into its diagnostic counts so `stats`\nand `validate` stay consistent (`stats_json_counts_match_validate`). Both\nnew rules surface in the `--format json` `rule` field automatically.\n\nRegression tests: `validate_detects_duplicate_artifact_ids` (two files\nand twice-in-one-file) and `validate_reports_orphans_as_warnings`\n(Warning default, Error under `--strict-orphans`).\n\nImplements: REQ-004\nVerifies: REQ-075, REQ-076\nRefs: FEAT-135\n\nCo-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>\n\n* fix(artifacts): resolve the real REQ-060 duplicate surfaced by REQ-075\n\nREQ-075's new duplicate-artifact-id detection (in this same Wave-2\nbranch) immediately surfaced a genuine, pre-existing collision in\nrivet's own artifacts/: `REQ-060` was declared twice —\n  - artifacts/v040-verification.yaml:471 \"Cross-platform binary support\"\n  - artifacts/v042-artifacts.yaml:393  \"Every embed option must validate\n                                        before the embed renders\"\ntwo unrelated requirements sharing one ID. Until now `Store::upsert`'s\nlast-write-wins silently kept only one and `rivet validate` reported\nPASS — exactly the F2 silent-data-loss the cross-git investigation is\nabout. With REQ-075 shipped, `rivet validate` on the rivet repo itself\n(pre-commit hook + CI) would FAIL on this collision.\n\nResolved by renaming the v042 entry to REQ-077 (the next free id). It\nwas the safe one to rename: zero inbound links anywhere in artifacts/,\nzero mentions in docs/. The v040 REQ-060 keeps its id — its two inbound\nlinks (v040-verification.yaml:125, :453) stay valid. The renamed\nartifact's own outgoing links (verifies REQ-010, satisfies REQ-004) are\nunchanged.\n\nAlso folds in `cargo fmt` of the cherry-pick-integrated cli_commands.rs\ntest block.\n\nImplements: REQ-010\nRefs: FEAT-135, REQ-075\n\nCo-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>\n\n---------\n\nCo-authored-by: Claude Opus 4.7 <noreply@anthropic.com>",
          "timestamp": "2026-05-20T23:31:51-05:00",
          "tree_id": "ab100591c9bac2a1e1bc51bfa82f34cde6e4eb76",
          "url": "https://github.com/pulseengine/rivet/commit/ef5a855c2d7386c7701ba18245400a0e686cb973"
        },
        "date": 1779338326123,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85840,
            "range": "± 456",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 929685,
            "range": "± 10074",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 16086985,
            "range": "± 1427686",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1943,
            "range": "± 44",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24826,
            "range": "± 285",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 370119,
            "range": "± 1999",
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
            "value": 1440758,
            "range": "± 34473",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 152079,
            "range": "± 815",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1795842,
            "range": "± 50694",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 29035517,
            "range": "± 2178741",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 122812,
            "range": "± 5044",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1127854,
            "range": "± 18895",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 17413782,
            "range": "± 1924243",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4158,
            "range": "± 13",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 44042,
            "range": "± 220",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 801019,
            "range": "± 7852",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 65113,
            "range": "± 377",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 755828,
            "range": "± 2583",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8599758,
            "range": "± 371200",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 772,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 6910,
            "range": "± 69",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 98628,
            "range": "± 927",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23443,
            "range": "± 82",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 172844,
            "range": "± 531",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1577260,
            "range": "± 20373",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "8e08ff43e4cdcfa0d898db08505e4e435fdf6240",
          "message": "release(v0.11.0): cross-git investigation waves 1-3 + Kani/Playwright fixes (#310)\n\n* feat(validate): --with-externals-validate surfaces supplier diagnostics (REQ-065)\n\nBy default `rivet validate` on a consumer says nothing about a linked\nexternal project's own validation state — the cross-git investigation's\nF6 finding, and the SEooC AoU-X1 the integrator must otherwise own\nmanually. The cross_repo_* counters covered broken *refs*, never the\nsupplier's internal diagnostics.\n\nNew `--with-externals-validate` flag: when set, `cmd_validate` runs\n`validate::validate` inside each linked external (using the\n`ResolvedExternal`'s own artifacts + schema) and surfaces every\nresulting diagnostic under a new `cross_repo_diagnostics` array — each\nentry tagged `source_project` (the external's prefix),\n`source_artifact_id`, `severity`, `rule`, `message`. Text output gains\na \"Cross-repo diagnostics\" section. The flag is independent of\n`--skip-external-validation` (which governs cross-*ref* checking).\n\nOff by default: the supplier's diagnostics do not gate the consumer's\nrun, and the cross-repo validate has different performance\ncharacteristics. Opt-in matches the AoU — the integrator chooses to\nlook.\n\nRegression test: validate_with_externals_validate_surfaces_supplier_diagnostics\n— a path-external supplier with invalid-priority reqs; default validate\nyields an empty cross_repo_diagnostics, --with-externals-validate\nsurfaces >= 3 entries with all five fields.\n\nImplements: REQ-004\nVerifies: REQ-065\nRefs: FEAT-135\n\n* docs(topics): cross-repo explains both mechanisms; new cross-repo-ci topic (REQ-067, REQ-071)\n\nREQ-067 — the `rivet docs cross-repo` topic documented only the\n`externals:` mechanism. Added a \"Two cross-repo mechanisms\" section: a\nside-by-side of `externals:` (git-SHA-pinned, rivet-to-rivet) vs\n`external-anchor` + `cited-source` (sha256-content-pinned,\nsupplier-agnostic), when to pick each, and a pointer to the open\narchitectural decision DD-067.\n\nREQ-071 — new `rivet docs cross-repo-ci` topic: the recommended CI\nsequence (sync → supplier pull → validate --strict-cited-sources\n--fail-on warning → validate --with-externals-validate), a worked\nGitHub Actions example, and the AoU-X1/X2/X4 register pointing at\ndocs/rivet-is-not.md §7a — so a green cross-repo CI run is not\nmistaken for discharge of the integrator's obligations.\n\nVerified: `rivet docs cross-repo-ci` resolves; `rivet docs check`\nPASS (0 violations).\n\nImplements: REQ-007\nVerifies: REQ-067, REQ-071\nRefs: FEAT-135\n\n* docs: fix stale numbers, grow the AoU register, complete frontmatter (REQ-072/073/074)\n\nWave 3 documentation-content follow-ups from the cross-git investigation\n(docs-only; no Rust code).\n\nREQ-074-2b — refresh the audit's worst stale-number offenders:\n- schemas.md: replace the 5-schema inventory with the full catalogue\n  (21 domain + 8 bridge schemas verified against schemas/*.yaml), worded\n  to resist re-rot and carrying an AUDIT marker on the one hard count.\n- architecture.md: rebuild the rivet-core module table (was missing\n  ~half the crate — salsa db, sexpr*, yaml_*, mutate, doc_check,\n  feature_model, variant_emit, externals, baseline, snapshot, mcp, …),\n  rebuild the rivet-cli table, replace the 5-row schema table with a\n  pointer to schemas.md, and correct the OSLC claim — oslc is a client\n  library, not a shipped `rivet oslc` CLI surface.\n- oracles.md: refresh the catalogue from 3 oracles to the 5 in the\n  current CheckAction enum (adds `sources` and `ai-defects-open`) and\n  bump the version stamp from v0.4.3 to v0.10.1.\n\nREQ-072 — grow docs/rivet-is-not.md with the cross-org AoU register:\n- add §7a \"Cross-org Assumptions of Use\" with AoU-X1..AoU-X7, each\n  citing its source finding (F1/F6/F7/F8/F9). The pre-existing §7 prose\n  is preserved; the register is additive.\n\nREQ-073 — frontmatter coverage + docs/README.md:\n- add YAML frontmatter (id/title/type/status/tags) to the 11 depth-1\n  docs the doc scanner skipped for \"no YAML frontmatter\".\n- add docs/README.md mapping each docs/ subdirectory and its lifecycle.\n\nRefs: FEAT-135, REQ-072, REQ-073, REQ-074\n\nCo-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>\n\n* fix(docs): doc-check + stats/validate parity after the Wave-3 docs pass\n\nThe Wave-3 docs work surfaced two issues the subagent's static\nverification could not catch (it lacked permission to run the binary):\n\n- architecture.md referenced `rivet migrate` and `rivet oslc` — neither\n  is a real subcommand. `rivet schema migrate` is the actual surface;\n  the OSLC sentence is reworded to drop the bare `rivet oslc` token\n  (the prose already, correctly, says OSLC has no CLI surface — but\n  doc-check's SubcommandReferences invariant matches the token, not the\n  surrounding negation). doc-check now PASS.\n\n- getting-started.md:1128 used a literal `[[ID]]` as a syntax\n  placeholder. REQ-073 added frontmatter to that file, which made the\n  document scanner process it — and extract `[[ID]]` as a (non-existent)\n  artifact reference, emitting one `doc-broken-ref` warning. That\n  warning is visible to `rivet validate` (it scans documents) but not\n  to `rivet stats`, breaking `stats_json_counts_match_validate`\n  (148 vs 147). Reworded to describe wiki-links without the literal\n  token; counts agree again.\n\nRefs: FEAT-135, REQ-073, REQ-074\n\nCo-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>\n\n* release(v0.11.0): bump version + CHANGELOG; fix Kani build error + brittle Playwright locator\n\nFolds the v0.11.0 release into the Wave-3 PR so the tag follows one\nCI cycle, not two.\n\nVersion: 0.10.1 → 0.11.0 (Cargo.toml, vscode-rivet/package.json).\nCHANGELOG: [0.11.0] section — the cross-git investigation, waves 1-3.\n\nTwo CI failures the user flagged, both pre-existing (red since #298,\nbefore this session — NOT wave regressions), fixed here because they\nare real and in reach:\n\n- Kani Proofs failed to BUILD: `rivet-core/src/proofs.rs:206`\n  constructed a `CoverageEntry` without the `external_boundary` /\n  `external_boundary_ids` fields that #253's 3-state coverage added.\n  `proofs.rs` is `#[cfg(kani)]`-gated, so a normal `cargo build`\n  never compiles it — the break was invisible outside the Kani job.\n  Added the two fields (0 / empty).\n\n- Playwright `rendering-invariants` strict-mode violation:\n  ARCH-CORE-001's description now carries two fenced mermaid blocks\n  (`flowchart LR` + `stateDiagram-v2`); the test's `pre.mermaid`\n  locator resolved to 2 and failed strict mode. Scoped to `.first()`\n  — the flowchart block the `toContainText(\"flowchart\")` assertion\n  expects; the `.svg-viewer` count check already handles multiples.\n\nRocq/Verus remain red on the runner's Nix-daemon permission error\n(`opening lock file ... Permission denied`) — pure infrastructure,\nno code fix possible here.\n\nImplements: REQ-007\nRefs: FEAT-135\n\n---------\n\nCo-authored-by: Claude Opus 4.7 <noreply@anthropic.com>",
          "timestamp": "2026-05-21T01:02:27-05:00",
          "tree_id": "d96634e6c1469ba77febb0131a9aa611f6855b6a",
          "url": "https://github.com/pulseengine/rivet/commit/8e08ff43e4cdcfa0d898db08505e4e435fdf6240"
        },
        "date": 1779344730936,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 86352,
            "range": "± 450",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 926262,
            "range": "± 7342",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14345427,
            "range": "± 342990",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1938,
            "range": "± 50",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25051,
            "range": "± 47",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 358154,
            "range": "± 1137",
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
            "value": 1438310,
            "range": "± 17530",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 154453,
            "range": "± 969",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1801514,
            "range": "± 32347",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 25804436,
            "range": "± 929269",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 123500,
            "range": "± 1935",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1134229,
            "range": "± 23218",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 14680947,
            "range": "± 177650",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4159,
            "range": "± 10",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 45510,
            "range": "± 152",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 757897,
            "range": "± 4681",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 62876,
            "range": "± 126",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 738943,
            "range": "± 14574",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8201510,
            "range": "± 59171",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 767,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 6921,
            "range": "± 14",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 103692,
            "range": "± 5276",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23336,
            "range": "± 125",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 168355,
            "range": "± 1268",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1571727,
            "range": "± 9313",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "f9ac4729382d7668f5ba71b26891edea6f1c4889",
          "message": "release(v0.11.1): Mythos silent-failure hunt — REQ-078..082 (#311)\n\nThe Mythos silent-failure slop-hunt (post-v0.11.0) plus a user-reported\nregression. Five fixes:\n\n- REQ-078 rivet commits — flag malformed/typo'd artifact trailers\n  instead of silently classing them as benign orphans.\n- REQ-079 ReqIF import — reject a SPEC-OBJECT with missing/dangling\n  TYPE instead of silently typing it 'unknown'.\n- REQ-080 schema migration — run the enum value-check on\n  field-map-renamed fields instead of skipping it.\n- REQ-081 needs.json import — reject duplicate artifact IDs instead\n  of returning Ok with colliding artifacts.\n- REQ-082 rivet validate — stop counting linked external repos' own\n  schema violations against the consumer's gate (user-reported).\n\nAlso pins DeterminateSystems/nix-installer-action (was @main, which\ndrifted to install determinate-nixd) and sets determinate:false to\nfix the Rocq daemonless Nix install.\n\nImplements: REQ-078, REQ-079, REQ-080, REQ-081\nFixes: REQ-082\nVerifies: REQ-082\nRefs: FEAT-135",
          "timestamp": "2026-05-21T23:15:45-05:00",
          "tree_id": "eecbd1e0d224b305482ea766916da4e2aff888c3",
          "url": "https://github.com/pulseengine/rivet/commit/f9ac4729382d7668f5ba71b26891edea6f1c4889"
        },
        "date": 1779424091266,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84587,
            "range": "± 267",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 918046,
            "range": "± 13914",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13727027,
            "range": "± 246893",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1973,
            "range": "± 11",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25119,
            "range": "± 183",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 356065,
            "range": "± 1374",
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
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1434403,
            "range": "± 18836",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 165564,
            "range": "± 2421",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1923612,
            "range": "± 23187",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 32870864,
            "range": "± 2609892",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 126404,
            "range": "± 462",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1172791,
            "range": "± 18385",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 15482713,
            "range": "± 3258875",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4107,
            "range": "± 11",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 43361,
            "range": "± 124",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 770289,
            "range": "± 16998",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 65533,
            "range": "± 344",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 722125,
            "range": "± 3057",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8146957,
            "range": "± 401466",
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
            "value": 6806,
            "range": "± 105",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 93063,
            "range": "± 966",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23727,
            "range": "± 76",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 170047,
            "range": "± 598",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1611296,
            "range": "± 38845",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "0c4d30b05d5b0e71c1070be20291a4ce77696425",
          "message": "release(v0.12.0): multi-file feature models — REQ-083 (#312)\n\nv0.12.0 ships multi-file feature model composition. A new\n`feature-model-binding` file (`kind: feature-model-binding`) mounts\nstandalone sub-model files at parent features under an explicit,\nunique prefix. `FeatureModel::load_composed` / `FeatureModel::load`\nsplice each sub-model into its parent — prefixing feature names,\nchild refs, the root, and bare feature tokens in constraints — union\nthe constraint sets, and run the normal construction + tree validation\nonce over the merged result. Each model file remains independently\nsolvable via `from_yaml`.\n\nA broken mount fails loudly (F2 silent-failure class): missing file,\nabsent or `leaf` mount point, duplicate prefix, cyclic composition\neach return a hard error, never a silent skip.\n\n`is_symbol_cont` in the s-expr lexer accepts `:` so a namespaced\nfeature reference (`prefix:feature`) lexes as a single symbol —\nrequired for cross-prefix constraints like\n`(implies car pwt:four-wheel)`.\n\nAlso pins `DeterminateSystems/nix-installer-action` + sets\n`determinate: false` (Rocq's daemonless Nix install now works), files\nREQ-084 (the Verus CI job has been silently verifying nothing on the\nself-hosted runner), and adds `RUSTSEC-2026-0149` to the audit ignore\nlist (wasmtime-wasi 43, behind the optional `wasm` feature; real fix\nneeds a wasmtime major bump tracked separately).\n\nImplements: REQ-083\nVerifies: REQ-083\nRefs: REQ-084, FEAT-135",
          "timestamp": "2026-05-22T23:34:48-05:00",
          "tree_id": "fb3c7eae3066ec741a7909630ee3589fe3b2eeef",
          "url": "https://github.com/pulseengine/rivet/commit/0c4d30b05d5b0e71c1070be20291a4ce77696425"
        },
        "date": 1779511279311,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84684,
            "range": "± 275",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 916370,
            "range": "± 7251",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 16762957,
            "range": "± 1024462",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1975,
            "range": "± 57",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25004,
            "range": "± 386",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 361409,
            "range": "± 2145",
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
            "value": 1431963,
            "range": "± 18943",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 166708,
            "range": "± 917",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1953413,
            "range": "± 30308",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 31988156,
            "range": "± 2883100",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 126278,
            "range": "± 2482",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1195455,
            "range": "± 26647",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 13974853,
            "range": "± 756219",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4186,
            "range": "± 523",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 45517,
            "range": "± 514",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 733642,
            "range": "± 53296",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 65438,
            "range": "± 691",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 743371,
            "range": "± 19750",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 9464945,
            "range": "± 735909",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 756,
            "range": "± 21",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 6878,
            "range": "± 21",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 96398,
            "range": "± 10028",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21963,
            "range": "± 509",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 156643,
            "range": "± 598",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1488640,
            "range": "± 14586",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "0945c20b7c05382c273c4cfdd0fc0d17f65457da",
          "message": "docs(artifacts): file REQ-085 (cross-repo composition) + REQ-086 (witness MC/DC) (#313)\n\nTwo artifact-only filings tracking follow-ons from the v0.12.0\n(REQ-083) multi-file feature model composition work.\n\n- REQ-085 — cross-repo feature model composition. Extends REQ-083 to\n  mount sub-models from external git repos: a mount's `model:` becomes\n  either a local path or `<external-prefix>:<path>`, resolved against\n  `rivet.yaml`'s `externals:` (single source of truth — no git config\n  duplicated in the binding). Rides existing `rivet sync` plumbing.\n  v0.13.0-track.\n- REQ-086 — MC/DC coverage of the composition core via the pulseengine\n  `witness` tool. Plans a small `compose-witness` Wasm component +\n  witness harness, emitting a signed MC/DC envelope Rivet ingests as\n  REQ-083 requirement-to-test evidence — closing the witness->rivet\n  loop the ecosystem was architected for. v0.13.0-track.\n\nRefs: REQ-083, REQ-065",
          "timestamp": "2026-05-23T06:27:40-05:00",
          "tree_id": "695d27eb1bba65bed8914bea9c69f7c834b5f27f",
          "url": "https://github.com/pulseengine/rivet/commit/0945c20b7c05382c273c4cfdd0fc0d17f65457da"
        },
        "date": 1779536045345,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84787,
            "range": "± 373",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 899806,
            "range": "± 9883",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12624922,
            "range": "± 397775",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2224,
            "range": "± 17",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26479,
            "range": "± 332",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 390500,
            "range": "± 3635",
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
            "value": 98,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1454335,
            "range": "± 18018",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 167431,
            "range": "± 869",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1928620,
            "range": "± 22996",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 26726729,
            "range": "± 1075488",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 130258,
            "range": "± 764",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1138132,
            "range": "± 18383",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 13419825,
            "range": "± 1043792",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4344,
            "range": "± 24",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 62626,
            "range": "± 418",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 765624,
            "range": "± 4684",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 62787,
            "range": "± 366",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 716274,
            "range": "± 2873",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7853045,
            "range": "± 189568",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 800,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7258,
            "range": "± 59",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 128392,
            "range": "± 730",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 24506,
            "range": "± 72",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 173723,
            "range": "± 1953",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1617631,
            "range": "± 21511",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "f88b23a90f6dc6e3457448652d8e1989352f722b",
          "message": "build: bump rules_rocq_rust to e4660cc (hermetic rules_rust toolchain) (#314)\n\nBumps the rules_rocq_rust git pin in MODULE.bazel from 6a8da0b to\ne4660cc (current tip of pulseengine/rules_rocq_rust main), picking up\n#34 — \"build: migrate rocq-of-rust to a hermetic rules_rust toolchain\".\n\nNo-regression alignment with upstream main. The bump does NOT (yet)\nclear the Rocq CI job's Nix-derivation fetch failure (rocq_toolchains\nis still Nix-fetched and hits the daemonless-install store-lock\nconstraint) — that needs a further upstream change to move the Rocq\ntoolchain itself off Nix. Rocq remains continue-on-error.",
          "timestamp": "2026-05-23T06:27:52-05:00",
          "tree_id": "48f7ef0a2c74196bfbe6ac69d5a08deb7c76a70f",
          "url": "https://github.com/pulseengine/rivet/commit/f88b23a90f6dc6e3457448652d8e1989352f722b"
        },
        "date": 1779536446565,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84392,
            "range": "± 2621",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 921974,
            "range": "± 17836",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14832494,
            "range": "± 1393194",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1919,
            "range": "± 12",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25056,
            "range": "± 417",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 367862,
            "range": "± 3983",
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
            "value": 1433130,
            "range": "± 27528",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 170077,
            "range": "± 1036",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1963982,
            "range": "± 30605",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 32355991,
            "range": "± 3540738",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 126647,
            "range": "± 2185",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1162025,
            "range": "± 56387",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 17203245,
            "range": "± 2274543",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4190,
            "range": "± 12",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 44086,
            "range": "± 584",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 769920,
            "range": "± 18813",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 62705,
            "range": "± 834",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 730689,
            "range": "± 2080",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8291400,
            "range": "± 1115903",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 733,
            "range": "± 16",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 6862,
            "range": "± 123",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 101608,
            "range": "± 606",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22463,
            "range": "± 235",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 158063,
            "range": "± 997",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1486646,
            "range": "± 19835",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "78f001e23d595ba816f7a7be59282194dedfdc12",
          "message": "feat(compose-witness): Wasm-component PoC for REQ-086 witness MC/DC (#315)\n\nFirst increment of REQ-086 (MC/DC coverage of the REQ-083 composition\ncore via the pulseengine `witness` tool).\n\n- New sibling cargo project `compose-witness/` (excluded from workspace\n  to keep `cargo test --all` clean of wasm-only crate-types). Builds\n  via `cargo component build --manifest-path compose-witness/Cargo.toml`\n  to a valid `wasm32-wasip1` component exporting\n  `pulseengine:compose-witness/compose@0.1.0` with a single\n  `prefix-features` function.\n- The pure prefixing functions (`prefix_model_yaml`,\n  `prefix_constraint`, `flush_constraint_token`) are inlined from\n  rivet-core/src/feature_model.rs because rivet-core itself uses\n  std::fs/salsa/rowan and won't compile to wasm32. A v2 extracts the\n  pure module into a shared crate.\n- MODULE.bazel adds `bazel_dep(name = \"rules_wasm_component\",\n  version = \"1.0.0\")`; `compose-witness/BUILD.bazel` sketches the\n  canonical Bazel pipeline (wit_library + rust_wasm_component_bindgen +\n  wasm_module_coverage) — pending live build verification (next\n  increment).\n\nImplements: REQ-086",
          "timestamp": "2026-05-23T08:31:38-05:00",
          "tree_id": "9ead196d2a3a98cfb9be6a1bb4f8704e41aa379b",
          "url": "https://github.com/pulseengine/rivet/commit/78f001e23d595ba816f7a7be59282194dedfdc12"
        },
        "date": 1779543482691,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85486,
            "range": "± 2662",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 899090,
            "range": "± 42420",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13372960,
            "range": "± 609392",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2180,
            "range": "± 82",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25396,
            "range": "± 445",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 375775,
            "range": "± 16768",
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
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1443650,
            "range": "± 21043",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 165645,
            "range": "± 521",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1868510,
            "range": "± 99636",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 29398588,
            "range": "± 2191750",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 130041,
            "range": "± 7056",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1126567,
            "range": "± 29257",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 12714592,
            "range": "± 1456890",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4296,
            "range": "± 730",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 61657,
            "range": "± 531",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 801048,
            "range": "± 2344",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 61929,
            "range": "± 538",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 707654,
            "range": "± 10068",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7851495,
            "range": "± 333538",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 789,
            "range": "± 17",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7286,
            "range": "± 38",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 118120,
            "range": "± 2892",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23943,
            "range": "± 768",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 169685,
            "range": "± 1104",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1611989,
            "range": "± 52729",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "4579c772951e4d6fe81c013613134fbbb4d3b7e5",
          "message": "docs(artifacts): file REQ-087..090 — export bugs + diagnostic consistency + release bundle (#317)\n\nFour findings from auditing v0.11.1 / v0.12.0 output against a real\n5120-artifact project — all filed as v0.13.0-track requirements with\nexecutable Acceptance blocks; no code changes.\n\n- REQ-087: rivet export --single-page / --filter silently emit the\n  full artifact set on large projects (F2-class silent failure).\n- REQ-088: HTML exporter embeds the full CSS/JS framework per page\n  (MERMAID_JS include_str! at main.rs:8069 ~3MB * 4000+ pages =\n  ~13 GB). Fix: extract to shared `_assets/`.\n- REQ-089: VSIX extension, `rivet serve`, and `rivet validate`\n  surfaced different warning sets for the same project in v0.11.1.\n  No integration test asserts the three rendering paths agree —\n  itself an F2-class silent failure on the QA surface.\n- REQ-090: GitHub Release should attach a ~51 MB compliance bundle\n  (documents + coverage + matrix + validate + ReqIF) auditors\n  actually need, not the navigation-shell HTML the v0.12.0 release\n  attached. Gated on REQ-088 landing first.\n\nRefs: REQ-005, FEAT-135",
          "timestamp": "2026-05-23T23:05:19-05:00",
          "tree_id": "56cb56001e328ace2f7fba989e056de763c8d9b4",
          "url": "https://github.com/pulseengine/rivet/commit/4579c772951e4d6fe81c013613134fbbb4d3b7e5"
        },
        "date": 1779595910404,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84193,
            "range": "± 232",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 889628,
            "range": "± 10350",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13734319,
            "range": "± 938132",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2132,
            "range": "± 32",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26836,
            "range": "± 113",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 366178,
            "range": "± 8754",
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
            "value": 1426359,
            "range": "± 16359",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 166940,
            "range": "± 1265",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1895847,
            "range": "± 9564",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 30529319,
            "range": "± 2991469",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 130083,
            "range": "± 1817",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1131094,
            "range": "± 18901",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 15946298,
            "range": "± 2330176",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4315,
            "range": "± 14",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 58228,
            "range": "± 185",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 822066,
            "range": "± 7799",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 62253,
            "range": "± 499",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 698304,
            "range": "± 4264",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8638074,
            "range": "± 343631",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 784,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7572,
            "range": "± 43",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 121260,
            "range": "± 1169",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23645,
            "range": "± 157",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 167878,
            "range": "± 1145",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1599403,
            "range": "± 20084",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "86bf4829e16a5bc2ef6d8f4b5ecc782735d40625",
          "message": "docs(artifacts): note runner9 podman unblocker on REQ-084 (#316)\n\nCaptures the runner9 podman-capability unblocker on REQ-084.\n\nSmithy deployed `podman_userns=true`, `NoNewPrivileges=0`,\n`ProtectKernelTunables=false` on runner9 (verified live with\n`podman run nixos/nix … nix --version`). GHA label set:\n[self-hosted, Linux, X64, hetzner, rust-cpu, podman].\n\nThis unblocks the REQ-084 fix: the Verus job's runs-on targets the\n`podman` label, Nix work runs inside a `nixos/nix` rootless\ncontainer — no nix-installer-action, no host-installed Nix.\n\nImplementation follows spar's validation of the same pattern\n(sequential — rivet inherits a tested approach).\n\nNote: the one Test fail in this PR (server_pages_push_url at\nserve_integration.rs:238) is a flaky integration test, runner-load\ndependent — the same Test job passed on #317 (identical artifact-only\ncode surface).",
          "timestamp": "2026-05-23T23:05:22-05:00",
          "tree_id": "13fb97ed03d19eee4423a5a78bfcbfdb8b79f55b",
          "url": "https://github.com/pulseengine/rivet/commit/86bf4829e16a5bc2ef6d8f4b5ecc782735d40625"
        },
        "date": 1779596303728,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84724,
            "range": "± 649",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 922252,
            "range": "± 14930",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14120384,
            "range": "± 301115",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1902,
            "range": "± 10",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25104,
            "range": "± 151",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 354497,
            "range": "± 2454",
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
            "value": 1438790,
            "range": "± 143011",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 168540,
            "range": "± 2976",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1922200,
            "range": "± 19578",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 28291581,
            "range": "± 793776",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 126513,
            "range": "± 3015",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1165544,
            "range": "± 12860",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 13963257,
            "range": "± 521263",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4158,
            "range": "± 9",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 44577,
            "range": "± 158",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 779565,
            "range": "± 4545",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 62281,
            "range": "± 206",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 705531,
            "range": "± 7916",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7979091,
            "range": "± 171944",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 752,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 6543,
            "range": "± 12",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 98968,
            "range": "± 405",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22239,
            "range": "± 61",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 155784,
            "range": "± 3126",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1481945,
            "range": "± 12445",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "a9aa3c3edf1c332d23a55853bbbab61f41039dc0",
          "message": "test(serve): stabilise server_pages_push_url flake (#318)\n\nserver_pages_push_url was flapping red on PRs that did not touch serve\ncode (observed on artifact-only #316 while passing on identical-\nsurface #317). The test used the default-5s `fetch` against\n/verification and /coverage — pages that walk the dogfood corpus and\nsit on the timeout edge under CI runner load.\n\nFix: small `fetch_page_with_retry` helper — 15s read timeout + one\nretry on `status == 0` (transient connection drop after the health\nprobe). No assertion weakened.",
          "timestamp": "2026-05-24T00:55:40-05:00",
          "tree_id": "e001c54988e97410bca673db50be0e290fccd8c0",
          "url": "https://github.com/pulseengine/rivet/commit/a9aa3c3edf1c332d23a55853bbbab61f41039dc0"
        },
        "date": 1779602541089,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85202,
            "range": "± 305",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 934538,
            "range": "± 12366",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 19398281,
            "range": "± 947569",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1984,
            "range": "± 17",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24866,
            "range": "± 64",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 361002,
            "range": "± 1620",
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
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1437633,
            "range": "± 33301",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 168689,
            "range": "± 2592",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1978643,
            "range": "± 94513",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 32201038,
            "range": "± 1691743",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 126104,
            "range": "± 1239",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1154020,
            "range": "± 9810",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 18029898,
            "range": "± 1876300",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4245,
            "range": "± 52",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 45525,
            "range": "± 1298",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 752573,
            "range": "± 6503",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 62659,
            "range": "± 4106",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 721921,
            "range": "± 31628",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 10048311,
            "range": "± 792173",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 771,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 6840,
            "range": "± 325",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 100597,
            "range": "± 660",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22333,
            "range": "± 390",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 157464,
            "range": "± 855",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1482780,
            "range": "± 30240",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "6d72f037c0f4d7e82217cea36140e8705e137d6e",
          "message": "feat(export): extract CSS/JS to shared _assets/ + thread --filter (REQ-087, REQ-088) (#319)\n\nREQ-088 — HTML exporter no longer embeds the full CSS/JS framework\ninto every page. Previously `<style>{fonts_css}{css}</style>\n<script>{mermaid_js}</script>` per page with MERMAID_JS =\ninclude_str!(\"../assets/mermaid.min.js\") (~3MB), so 5000-artifact\nprojects produced ~13 GB of mostly-identical bytes. Now writes one\nshared <out>/_assets/styles.css + _assets/mermaid.min.js and each page\nemits <link rel=\"stylesheet\" href=\"...\"> + <script src=\"...\">.\nVerified: 871-page rivet export = 9.7 MB total, ~7-10 KB per page.\n\nThe wrap_page closure takes the page's rel_path and computes a\ndepth-adjusted prefix (\"\", \"../\", \"../../\") so root / depth-1 /\ndepth-2 pages all resolve assets and nav hrefs correctly — also\nclears latent nav-relativity bugs in the previous fixed \"../path\"\nstrings.\n\nREQ-087 — cmd_export accepted --filter for HTML but never threaded\nit into cmd_export_html. F2-class silent failure. Now threaded and\napplied at the per-artifact loop using the existing\nsexpr_eval::matches_filter_with_store.\n\nAdds rivet-cli/tests/export_html.rs with two integration tests\nasserting _assets/ exists, pages reference it, no inline mermaid\nsignature, per-page < 100KB; and that --filter strictly narrows\nfrom the unfiltered baseline.\n\nImplements: REQ-087, REQ-088\nVerifies: REQ-087, REQ-088",
          "timestamp": "2026-05-24T00:55:44-05:00",
          "tree_id": "d4faeded5d3edf74ab3279f3f74e8cc31493a087",
          "url": "https://github.com/pulseengine/rivet/commit/6d72f037c0f4d7e82217cea36140e8705e137d6e"
        },
        "date": 1779602946135,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 86331,
            "range": "± 1457",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 908573,
            "range": "± 6239",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 16601180,
            "range": "± 1433602",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2181,
            "range": "± 13",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25688,
            "range": "± 99",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 375876,
            "range": "± 2450",
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
            "value": 1441302,
            "range": "± 53939",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 167087,
            "range": "± 1957",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1983259,
            "range": "± 14103",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 31434189,
            "range": "± 1705384",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 131846,
            "range": "± 2267",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1170559,
            "range": "± 20768",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 18173622,
            "range": "± 1432049",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4374,
            "range": "± 101",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 65285,
            "range": "± 600",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 756137,
            "range": "± 8250",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 62282,
            "range": "± 398",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 709779,
            "range": "± 3098",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 9578731,
            "range": "± 724993",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 779,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7124,
            "range": "± 114",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 115094,
            "range": "± 1200",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23843,
            "range": "± 209",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 168673,
            "range": "± 749",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1604057,
            "range": "± 21116",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "eef9732791c917a78720aa290017bd0fef3ca058",
          "message": "feat(variant): cross-repo feature model composition core (REQ-085 v1) (#321)\n\nCore API for REQ-085 — cross-repo feature model composition. v1\ndelivers the rivet-core API + tests; CLI threading (so `rivet variant`\nautomatically builds the externals map from `rivet.yaml`'s\n`externals:` via ProjectContext) is the v2 follow-on, same\ncore-first-CLI-later shape as REQ-086 v1.\n\nNew API:\n  FeatureModel::load_composed_with_externals(binding, externals_map)\n  FeatureModel::load_with_externals(path, externals_map)\n\nA mount's `model:` is now either a local relative path (REQ-083\nbehaviour, unchanged) OR `<external-prefix>:<inner-path>` resolved via\nexternals[prefix].join(inner-path). Composition rides the existing\n`rivet sync` plumbing entirely; `rivet.yaml` stays the single source\nof truth for \"where external repos come from.\"\n\n`resolve_model_path` rejects a prefix-shaped reference that doesn't\nmatch any declared external — never a silent fall-back to local-path\nresolution that won't find the file (F2 ethos inherited from REQ-083).\n\nThree new tests pass; all 51 existing REQ-083 composition tests still\ngreen. `load_composed` is now a thin wrapper, backward compat\npreserved.\n\nImplements: REQ-085\nVerifies: REQ-085",
          "timestamp": "2026-05-24T04:09:36-05:00",
          "tree_id": "655d7bae95fc7926e7f71786bf39c85385817b4b",
          "url": "https://github.com/pulseengine/rivet/commit/eef9732791c917a78720aa290017bd0fef3ca058"
        },
        "date": 1779614157025,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 83299,
            "range": "± 947",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 918834,
            "range": "± 14650",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14543500,
            "range": "± 1308213",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2163,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26731,
            "range": "± 137",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 378105,
            "range": "± 1843",
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
            "value": 1475082,
            "range": "± 43220",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 152562,
            "range": "± 573",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1748190,
            "range": "± 28805",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 25238990,
            "range": "± 1623747",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 130844,
            "range": "± 1120",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1149543,
            "range": "± 12104",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 14179464,
            "range": "± 925938",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4284,
            "range": "± 119",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60147,
            "range": "± 169",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 784614,
            "range": "± 1979",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 62796,
            "range": "± 175",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 707419,
            "range": "± 3403",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7850411,
            "range": "± 648672",
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
            "value": 7470,
            "range": "± 37",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 113326,
            "range": "± 1054",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 26301,
            "range": "± 59",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 192070,
            "range": "± 1976",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1821165,
            "range": "± 21273",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "75ce3fa3f6bef62320a35b118954eab07e6faf9a",
          "message": "chore(schemas): align score schema with Eclipse S-CORE comparison (#320)\n\nCarries forward an out-of-band update from an Eclipse S-CORE comparison\nagent that aligned schemas/score.yaml with the upstream Eclipse S-CORE\nmetamodel (+453 lines, -14 lines — widens artifact-type vocabulary\nand field set).\n\nAlso adds examples/score-conversion/ — a worked sketch converting the\nEclipse S-CORE persistency::kvs slice into rivet's generic-YAML\nagainst the updated schema. README captures the end-to-end conversion\nshape and residual schema deltas flagged for follow-up. It's its own\nrivet project so it does not interact with the main repo's validation.\n\nAllowlists the literal `7.4.3` in rivet.yaml docs-check (the score\nschema's external-clause description carries `ISO 26262-6:7.4.3.2` —\na stable ISO standard-clause identifier the EmbeddedVersionLiterals\ninvariant catches as a 3-part version; same pattern the existing\nallowlist uses for ASPICE process IDs like 2.1.7, 2.2.4).\n\nVerified: `rivet validate` PASSes (144 warnings, baseline unchanged);\n`rivet docs check` PASSes locally.",
          "timestamp": "2026-05-24T05:03:21-05:00",
          "tree_id": "6a545c278a4e3ffef39d88dacbaa34cafc6ad6fb",
          "url": "https://github.com/pulseengine/rivet/commit/75ce3fa3f6bef62320a35b118954eab07e6faf9a"
        },
        "date": 1779617394937,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84988,
            "range": "± 316",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 938607,
            "range": "± 15223",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 15978420,
            "range": "± 1536126",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1924,
            "range": "± 19",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25035,
            "range": "± 42",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 362491,
            "range": "± 3441",
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
            "value": 95,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1444689,
            "range": "± 22511",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 153326,
            "range": "± 2948",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1801943,
            "range": "± 32816",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 27915916,
            "range": "± 958039",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 127116,
            "range": "± 855",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1161375,
            "range": "± 11925",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 14199985,
            "range": "± 417847",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4123,
            "range": "± 25",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 45376,
            "range": "± 365",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 779388,
            "range": "± 13178",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 64563,
            "range": "± 521",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 736352,
            "range": "± 27436",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8625277,
            "range": "± 290488",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 856,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 6963,
            "range": "± 52",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 95025,
            "range": "± 664",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 24230,
            "range": "± 698",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 175269,
            "range": "± 914",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1659950,
            "range": "± 7733",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "10418c4308d5ccd74ca607810e0aeace54c4fa1d",
          "message": "ci(release): build full audit-deliverable compliance bundle (REQ-090) (#322)\n\nREQ-090 — Release attaches the audit-deliverable bundle (multi-page\nHTML + ReqIF + generic-yaml + README) instead of the navigation-shell\nHTML. Compliance action gains opt-in `include-data-formats` (default\nfalse, backward-compatible); release.yml's build-compliance sets\n`single-page: false` + `include-data-formats: true`. Multi-page\nemission is ~50 MB thanks to REQ-088's shared-assets fix (#319).\n\nImplements: REQ-090",
          "timestamp": "2026-05-24T07:52:58-05:00",
          "tree_id": "0e0e989b17e22f4ad30a81e1499edbc78c978feb",
          "url": "https://github.com/pulseengine/rivet/commit/10418c4308d5ccd74ca607810e0aeace54c4fa1d"
        },
        "date": 1779627567400,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84281,
            "range": "± 454",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 910032,
            "range": "± 8918",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14464272,
            "range": "± 868845",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2155,
            "range": "± 10",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26459,
            "range": "± 294",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 379155,
            "range": "± 4415",
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
            "value": 1467802,
            "range": "± 200447",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 152349,
            "range": "± 782",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1772244,
            "range": "± 23069",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 33114134,
            "range": "± 3573330",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 132899,
            "range": "± 2486",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1165362,
            "range": "± 12627",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 24120716,
            "range": "± 2112502",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4289,
            "range": "± 15",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 61608,
            "range": "± 350",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 770495,
            "range": "± 9352",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 58290,
            "range": "± 864",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 701545,
            "range": "± 5419",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8281507,
            "range": "± 616955",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 810,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7316,
            "range": "± 28",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 117635,
            "range": "± 585",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 25870,
            "range": "± 159",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 188714,
            "range": "± 1501",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1774149,
            "range": "± 23511",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "befd4798c679f4bfc973037c7595c4a972b908f5",
          "message": "feat(variant): thread rivet.yaml externals into the CLI (REQ-085 v2) (#324)\n\nCompletes REQ-085 end-to-end. v1 core (load_composed_with_externals,\nmerged as eef9732) was library-only; v2 threads the externals map\nthrough the CLI so cross-repo composition works from `rivet variant`\n/ `rivet validate --model` without any binding-side git config.\n\nNew helper load_feature_model_via_project(model_path) walks up from\nthe model path to find the containing rivet.yaml, loads externals via\nload_all_externals (same call site cmd_validate uses), and passes\nthe prefix->synced-root map into FeatureModel::load_with_externals.\nLenient on missing rivet.yaml — empty externals map preserves\nREQ-083 local-only behaviour. Unknown-prefix mounts still error\nloudly at the engine layer.\n\nAll 11 CLI call sites (9 variant subcommands + 2 cmd_validate\ncombinations) now route through the helper. rivet-core stays\nproject-config-agnostic.\n\nIntegration test in rivet-cli/tests/variant_compose.rs covers the\nend-to-end fake-external + consumer + binding flow.\n\nImplements: REQ-085\nVerifies: REQ-085",
          "timestamp": "2026-05-24T07:53:05-05:00",
          "tree_id": "7fb1966f60480c568e65455df166853f9441ab57",
          "url": "https://github.com/pulseengine/rivet/commit/befd4798c679f4bfc973037c7595c4a972b908f5"
        },
        "date": 1779627948291,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 68427,
            "range": "± 767",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 732500,
            "range": "± 2477",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 11954163,
            "range": "± 694883",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1474,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 18553,
            "range": "± 175",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 272828,
            "range": "± 1700",
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
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1105705,
            "range": "± 14817",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 118152,
            "range": "± 684",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1379281,
            "range": "± 11456",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 20873114,
            "range": "± 257411",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 97155,
            "range": "± 270",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 881460,
            "range": "± 2967",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 13311625,
            "range": "± 1617708",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3395,
            "range": "± 12",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 35550,
            "range": "± 78",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 577118,
            "range": "± 2090",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 48094,
            "range": "± 86",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 534074,
            "range": "± 1964",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 6204213,
            "range": "± 184362",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 581,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 5164,
            "range": "± 21",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 73308,
            "range": "± 178",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 18834,
            "range": "± 39",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 134262,
            "range": "± 991",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1272242,
            "range": "± 14672",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "89f243c16738a892fc5ba8001322a284fe1987cf",
          "message": "release(v0.13.0): cross-repo feature models + audit-deliverable releases (#325)\n\nv0.13.0 — minor release. Theme: cross-repo feature models +\naudit-deliverable releases.\n\n- REQ-085 — cross-repo feature model composition end-to-end. A mount\n  of the form `<external-prefix>:<inner-path>` in a\n  feature-model-binding resolves through the consumer's rivet.yaml\n  externals. Both the core API\n  (FeatureModel::load_composed_with_externals / load_with_externals)\n  and the CLI (rivet variant, rivet validate --model) are threaded.\n  Single source of truth — no binding-side git config. Rides existing\n  rivet sync plumbing. Unknown prefixes error loudly.\n- REQ-090 — the GitHub Release now attaches the full ~50 MB\n  compliance bundle (rendered specs with resolved artifact tables +\n  coverage + matrix + validate + ReqIF + generic-yaml + README)\n  instead of the navigation-shell HTML the v0.12.0 release shipped.\n  Feasible at this size because v0.12.0's REQ-088 shared-assets\n  dedup landed.\n\nDocumented (no code in v0.13.0):\n- REQ-091 — rowan-yaml silent-data-loss finding\n  (clean-room-verified; original attribution falsified). Fix → next\n  patch release.\n- REQ-092 — per-source-line traceability subcommand design\n  (Eclipse S-CORE per-line equivalent). Later minor release.\n\nMaintenance:\n- score schema aligned with Eclipse S-CORE comparison + worked example.\n- rules_rocq_rust → e4660cc (hermetic rules_rust toolchain).\n- server_pages_push_url flake fix.\n\nImplements: REQ-085, REQ-090",
          "timestamp": "2026-05-24T08:57:12-05:00",
          "tree_id": "54028df1bf1c1779025ed1245e4ef405dc576818",
          "url": "https://github.com/pulseengine/rivet/commit/89f243c16738a892fc5ba8001322a284fe1987cf"
        },
        "date": 1779631417575,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 86327,
            "range": "± 237",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 904262,
            "range": "± 46229",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12242554,
            "range": "± 359791",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2171,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26156,
            "range": "± 327",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 366698,
            "range": "± 11167",
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
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1460483,
            "range": "± 26173",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 150247,
            "range": "± 7663",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1756599,
            "range": "± 13465",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 23196972,
            "range": "± 438410",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 131192,
            "range": "± 1273",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1139372,
            "range": "± 15339",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 12155462,
            "range": "± 114767",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4377,
            "range": "± 23",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 58916,
            "range": "± 418",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 830559,
            "range": "± 6934",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 64166,
            "range": "± 741",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 738912,
            "range": "± 9985",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7863640,
            "range": "± 214807",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 805,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7150,
            "range": "± 46",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 120630,
            "range": "± 1557",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 26449,
            "range": "± 119",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 192258,
            "range": "± 689",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1751231,
            "range": "± 129513",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "54d609ac5b5b07ab42a29dc598256726426db4a9",
          "message": "fix(bazel): pin rules_wasm_component via git_override (Rocq Proofs unblocker) (#328)\n\n* fix(bazel): pin rules_wasm_component via git_override (BCR has no 1.0.0)\n\nPR #315 added `bazel_dep(name = \"rules_wasm_component\", version =\n\"1.0.0\")` for the REQ-086 witness MC/DC work, but did not add a\ngit_override clause. The Bazel Central Registry does not publish\nrules_wasm_component, so Bazel reports:\n\n  ERROR: Error computing the main repository mapping: in module\n  dependency chain <root> -> rules_wasm_component@1.0.0: module\n  rules_wasm_component@1.0.0 not found in registries:\n    * https://bcr.bazel.build/modules/rules_wasm_component/1.0.0/MODULE.bazel: not found\n\n…and the Rocq Proofs CI job exits non-zero after ~5 seconds. This\nhas been red on every PR since #315 merged on 2026-05-23.\n\nMirror the rules_rocq_rust pattern that already lives in this file:\ndeclare bazel_dep at the BCR version + git_override to the pulseengine\nrepo at a pinned commit. Pin to fbe2057 (#470, \"feat: add Nix flake\nfor a reproducible development environment\", 2026-05-22 — the most\nrecent commit on rules_wasm_component default branch as of this fix\nand the closest to the date PR #315 was merged).\n\nRefs: REQ-086\n\nCo-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>\n\n* fix(bazel): re-pin rules_wasm_component to current HEAD (d2347fb)\n\nFirst CI attempt on this branch surfaced a different Bazel error:\n\n  ERROR: error during computation of main repo mapping: error running\n  'git reset --hard fbe20571eedaa75676b1f97e74dde0b3ff2f8050' while\n  working with @rules_wasm_component+\n\nThe earlier fbe2057 commit is still in the upstream history but\nBazel's shallow git fetch (and/or the self-hosted runner's git cache)\ncan't resolve it on-demand. d2347fb is current main HEAD on\nrules_wasm_component — shallow clones land on it directly so the\n`git reset --hard` is a no-op.\n\nThis isolates the unblocker to the production-side that actually\nworks under our runner geometry.\n\nRefs: REQ-086\n\nCo-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>\n\n---------\n\nCo-authored-by: Claude Opus 4.7 <noreply@anthropic.com>",
          "timestamp": "2026-05-24T23:20:11-05:00",
          "tree_id": "7956d756cee6e30fec85ce41cd989bbc6002f9b3",
          "url": "https://github.com/pulseengine/rivet/commit/54d609ac5b5b07ab42a29dc598256726426db4a9"
        },
        "date": 1779683224838,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 78018,
            "range": "± 2047",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 938420,
            "range": "± 22038",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 16167221,
            "range": "± 2162306",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1688,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 19128,
            "range": "± 836",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 361591,
            "range": "± 1010",
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
            "value": 1358143,
            "range": "± 25295",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 151422,
            "range": "± 344",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1755333,
            "range": "± 16183",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 35873121,
            "range": "± 3033170",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 121917,
            "range": "± 842",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1179951,
            "range": "± 14937",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 19924770,
            "range": "± 1811104",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3885,
            "range": "± 128",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 41367,
            "range": "± 727",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 781112,
            "range": "± 16342",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 54451,
            "range": "± 161",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 600163,
            "range": "± 9644",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 10366337,
            "range": "± 496657",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 650,
            "range": "± 19",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 5409,
            "range": "± 32",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 138778,
            "range": "± 415",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23327,
            "range": "± 72",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 170086,
            "range": "± 3766",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1606533,
            "range": "± 76352",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "cfe0cdf10b8ef5d28322752e957c4267649182bb",
          "message": "fix(ci): switch Rocq Proofs job to cachix Nix installer (match working synth pattern) (#332)\n\nThe Rocq Proofs job's `Install Nix` step has been failing on every PR\nwith:\n\n  warning: unknown setting 'build-provenance-tags'\n  error: opening lock file \"/nix/var/nix/db/big-lock\": Permission denied\n  ERROR: ... fetch of repository 'rules_rocq_rust++rocq+rocq_toolchains'\n\nRoot cause: the job uses DeterminateSystems/nix-installer-action@v22\nwith `determinate: false` + `init: none`, a config copied from the\nself-hosted verus job (which IS `NoNewPrivileges=true` and needs the\ndaemonless path). The rocq job runs on `ubuntu-latest`, which is\nGitHub-hosted with full sudo — the NoNewPrivileges constraint never\napplied here. The daemonless DeterminateSystems variant trips on\n`build-provenance-tags` (a Determinate-Nix-specific setting) and\nthen fails to acquire the store lock.\n\nThe sibling pulseengine repo `synth` runs the same Rocq-of-Rust /\nBazel / Nix chain on `ubuntu-latest` with the standard\n`cachix/install-nix-action@v30` + `nix_path:\nnixpkgs=channel:nixos-unstable`, and its `Bazel Build & Proofs` job\nhas been green on every recent main commit (run e.g.\n26369114819). Adopt that pattern verbatim.\n\nChanges:\n- Replace `DeterminateSystems/nix-installer-action@v22` (+\n  `determinate: false`, `init: none`, `extra-conf`) with\n  `cachix/install-nix-action@v30` (+ `nix_path:\n  nixpkgs=channel:nixos-unstable`).\n- Drop the manual `Add Nix to PATH` step — cachix v30 handles PATH\n  itself.\n- Rewrite the comment to capture the actual reason this works on\n  `ubuntu-latest` (and why the prior NoNewPrivileges framing was\n  inapplicable).\n- Verus job intentionally NOT changed — it runs on\n  `[self-hosted, linux, x64, lean-mem]` which IS\n  `NoNewPrivileges=true`, so the DeterminateSystems daemonless path\n  stays correct there.\n\nIf after this change the Rocq toolchain still hits the\n`rules_rocq_rust++rocq+rocq_toolchains` repo-name shape (Nix-store\ndouble-tilde collision) that synth defuses with\n`patches/rules_rocq_rust_nix_name.patch` + a newer pin, we'll do\nthat as a follow-up; the installer was the upstream failure mode.\n\nCo-authored-by: Claude Opus 4.7 <noreply@anthropic.com>",
          "timestamp": "2026-05-25T00:20:08-05:00",
          "tree_id": "fe84aafaf7da5a6d8508dff5310bdb480a4b3555",
          "url": "https://github.com/pulseengine/rivet/commit/cfe0cdf10b8ef5d28322752e957c4267649182bb"
        },
        "date": 1779686797241,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 86943,
            "range": "± 862",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 903963,
            "range": "± 11449",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13754166,
            "range": "± 376068",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2247,
            "range": "± 13",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24876,
            "range": "± 226",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 379814,
            "range": "± 2154",
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
            "value": 1473033,
            "range": "± 113687",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 152672,
            "range": "± 482",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1761556,
            "range": "± 10435",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 23164440,
            "range": "± 1106025",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 129723,
            "range": "± 1797",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1136627,
            "range": "± 16912",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 12574742,
            "range": "± 634955",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4214,
            "range": "± 16",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 61482,
            "range": "± 264",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 775772,
            "range": "± 2681",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 63774,
            "range": "± 550",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 728345,
            "range": "± 12045",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8530800,
            "range": "± 672855",
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
            "value": 7431,
            "range": "± 27",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 115345,
            "range": "± 796",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 25835,
            "range": "± 294",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 186914,
            "range": "± 3532",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1761193,
            "range": "± 23438",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "c362795d5518eb8c2c87e7e4fa4b755c5d2ae5d3",
          "message": "fix(yaml): rowan parser handles flush-left block sequences + links loud-fail (REQ-091, v0.13.1) (#329)\n\n* fix(yaml): rowan parser handles flush-left block sequences + links loud-fail (REQ-091)\n\nTwo REQ-091 fixes that together close the F2 silent-failure where the\ndefault `rivet validate` (salsa + rowan-yaml) silently graded zero\nlinks for artifacts written in YAML's flush-left list style.\n\n## The CST bug — flush-left sequences silently dropped\n\n`yaml_cst::parse_mapping_entry` required `child_indent > entry_indent`\nwhen descending into a same-line `value` of a mapping. YAML allows the\n\"zero-indent\" block sequence form where the dashed list sits at the\nsame column as the parent key:\n\n    artifacts:\n    - id: A           <- dash at column 0, same as `artifacts:`\n      type: req\n\nFor this shape the parser silently treated the value as empty and\ndropped the entire sequence from the tree. `extract_schema_driven` then\nreturned 0 artifacts + 0 diagnostics, but `rivet list` (which routes\nthrough `parse_generic_yaml`) returned the artifact correctly — the\nlink graph the validator should grade was invisible.\n\nThe fix: when the next-line content is a Dash, accept\n`child_indent >= entry_indent`. This is YAML 1.2's zero-indent\nblock-sequence rule (the parser already handled `child_indent >\nentry_indent` for the indented form; the equal-indent case is\nnecessary at the document root where there is no shallower indent to\ngo to).\n\nCST probe before vs after — both shapes now produce identical trees:\n`Mapping → MappingEntry → Value → Sequence → SequenceItem → Mapping`.\n\n## The F2 silent-failure — `extract_links_via_serde` returned empty without signal\n\n`extract_links_via_serde` (the fallback for `links:` values the CST\ndoesn't recognise as a block Sequence — most importantly flow-style\n`links: [{type:X, target:Y}]`) silently returned `Vec::new()` when\n`serde_yaml::from_str` rejected the value text. The outer cardinality\nvalidator then graded that as \"links field present but empty\" — the\nF2 ethos violation REQ-091 calls out.\n\nThe fix: thread `&mut Vec<ParseDiagnostic>` through `extract_links`\nand `extract_links_via_serde`. On serde parse error, emit an ERROR\ndiagnostic naming the underlying `serde_yaml` error and the value's\nspan. The two call sites (`extract_section_item`,\n`extract_artifact_from_item`) both have `result: &mut ParsedYamlFile`\nin scope, so they pass `&mut result.diagnostics` — no surface API\nchange beyond these internal helpers.\n\n## Tests\n\n- `rivet-core/tests/req_091_flush_left_yaml.rs` — REQ-091 Acceptance\n  #1 + #4: drives `extract_schema_driven` directly with both fixture\n  shapes, asserts 1 artifact + 1 link parity. Also a structural-parity\n  test across multi-link inputs.\n- `rivet-core/src/yaml_hir.rs::tests::extract_links_via_serde_emits_diagnostic_on_parse_error`\n  — REQ-091 Acceptance #3: a malformed `links:` value produces a\n  diagnostic naming the field, not a silent empty list.\n\nAll rivet-core tests pass (1068 lib + 83 yaml-test-suite + 2 new\nintegration tests). `rivet validate` on the in-tree corpus: PASS.\n\n## What this does NOT do\n\nAcceptance #5 — re-grading the parallel agent's sphinx-needs port\ncorpus against the Python reference's ~2500 warnings — requires\ntheir `feat/import-results-sphinx-needs` branch and runs outside\nthis PR. Once this lands they can rebase and re-grade.\n\nFixes: REQ-091\nRefs: REQ-051, REQ-082\n\nCo-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>\n\n* chore(fmt): apply rustfmt to req_091_flush_left_yaml.rs\n\nPure cosmetic — assert_eq! macros expand onto one line where rustfmt\nprefers and the test's two-line assertion on artifact.id/title is\njoined back to one line.\n\nRefs: REQ-091\n\n* test(migrate): document expected aspice link gaps after dev → aspice rename\n\nREQ-091 fixed the rowan-yaml CST so the salsa validate path now sees\nartifacts written in flush-left list style — which is exactly what\nthe dev → aspice migration emits via serde_yaml::to_string. The\nexisting test `apply_rewrites_dev_to_aspice_and_validate_passes` was\ngreen only because the validator could not see the migrated artifacts\nat all; with REQ-091 fixed, validate correctly reports that the\nmigrated REQ-001 / FEAT-001 have no `derives-from` / `allocated-from`\nlinks — exactly the cardinality obligations the aspice schema\ndeclares.\n\nThe migration is intentionally structural-only: it renames types in\nplace, it does not invent semantic links to system-level artifacts\nthe dev preset doesn't ship. The right test contract is therefore\nthat validate FAILS with exactly those two cardinality errors —\ndocumenting the migration's actual behaviour rather than hiding it.\n\nRename the test to `apply_rewrites_dev_to_aspice_and_validate_reports_expected_link_gaps`,\nassert `!val.status.success()`, and pin both expected error strings\n(`derives-from` for the migrated sw-req, `allocated-from` for the\nmigrated sw-arch-component). Add a comment block tying this back to\nthe pre-REQ-091 silent-success it replaces.\n\nRefs: REQ-091\n\nCo-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>\n\n---------\n\nCo-authored-by: Claude Opus 4.7 <noreply@anthropic.com>",
          "timestamp": "2026-05-25T04:14:54-05:00",
          "tree_id": "04f03049e3b71670536d3f4eecf5aa3f3ad8d60b",
          "url": "https://github.com/pulseengine/rivet/commit/c362795d5518eb8c2c87e7e4fa4b755c5d2ae5d3"
        },
        "date": 1779702663761,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84080,
            "range": "± 1876",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 892618,
            "range": "± 14003",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 16373351,
            "range": "± 768009",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2225,
            "range": "± 47",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25781,
            "range": "± 121",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 378372,
            "range": "± 2106",
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
            "value": 1459817,
            "range": "± 33385",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 147731,
            "range": "± 758",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1734027,
            "range": "± 30920",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 32791164,
            "range": "± 2602690",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 133145,
            "range": "± 1910",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1129806,
            "range": "± 29058",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 16954175,
            "range": "± 849957",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4387,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 57881,
            "range": "± 294",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 843100,
            "range": "± 6196",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 61310,
            "range": "± 1479",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 700789,
            "range": "± 7126",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 9268518,
            "range": "± 640218",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 765,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7309,
            "range": "± 177",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 130912,
            "range": "± 1631",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 24595,
            "range": "± 83",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 178025,
            "range": "± 1283",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1665198,
            "range": "± 23125",
            "unit": "ns/iter"
          }
        ]
      }
    ]
  }
}