window.BENCHMARK_DATA = {
  "lastUpdate": 1780261249443,
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
          "id": "3dfdd50242302227434c21378ed2c1764e9b02f6",
          "message": "test(serve): stabilize test_reload_yaml_error flake (status==0 → retry) (#331)\n\n* test(serve): stabilize test_reload_yaml_error_returns_error_response\n\nSame transient-connection-drop flake class that landed in\nfetch_page_with_retry (PR-train preceding v0.13.0). The raw\nTcpStream POST + read_to_end occasionally returns empty data on\nself-hosted-runner contention, leaving the HTTP status parsed as 0\nand the assertion failing with \"got status 0\" — observed on PR #328\n(no serve-code change in the PR, the failure was the test, not the\nproduction code).\n\nExtract a `post_reload_status` helper that retries once on\n`status == 0` after a 200 ms backoff (mirroring fetch_page_with_retry\nexactly), and use it from test_reload_yaml_error_returns_error_response.\nThe other reload tests already work fine via fetch_with_timeout so\nthey don't need the helper yet.\n\nCo-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>\n\n* test(serve): extend retry-on-empty-body to reload_returns_hx_location\n\nSame TCP-read flake observed on PR #333's Proptest (extended) job —\n`reload_returns_hx_location` panicked with an empty response body, the\nexact same flake class `post_reload_status` was added to handle for\nthe sibling `test_reload_yaml_error` test in this PR's prior commit.\n\nExtract `post_reload_response` (full response body, with optional\n`HX-Current-URL:` header) that retries once on empty body after a\n200 ms backoff. Rewrite `reload_returns_hx_location` to use it.\n\nThe two helpers (`post_reload_status` returning status, the new\n`post_reload_response` returning the full body) cover the two\ndistinct shape of POST-and-inspect-result the reload tests need.\n\nCo-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>\n\n* chore(fmt): rustfmt collapses map_or closure to single line\n\n---------\n\nCo-authored-by: Claude Opus 4.7 <noreply@anthropic.com>",
          "timestamp": "2026-05-26T23:10:17-05:00",
          "tree_id": "55341e811d590bc311071558b8f5c538d122e5ad",
          "url": "https://github.com/pulseengine/rivet/commit/3dfdd50242302227434c21378ed2c1764e9b02f6"
        },
        "date": 1779855509467,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 83910,
            "range": "± 805",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 908672,
            "range": "± 5047",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14108713,
            "range": "± 491529",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1921,
            "range": "± 19",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 23585,
            "range": "± 685",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 353070,
            "range": "± 8077",
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
            "value": 96,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1465572,
            "range": "± 29525",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 165124,
            "range": "± 870",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1923819,
            "range": "± 26368",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 28314052,
            "range": "± 2021693",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 126008,
            "range": "± 1353",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1181299,
            "range": "± 24481",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 16955011,
            "range": "± 1151782",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4895,
            "range": "± 15",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 43520,
            "range": "± 494",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 734239,
            "range": "± 89811",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 60235,
            "range": "± 376",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 735155,
            "range": "± 7503",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8574315,
            "range": "± 463769",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 750,
            "range": "± 12",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 6601,
            "range": "± 100",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 97757,
            "range": "± 636",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22447,
            "range": "± 252",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 158583,
            "range": "± 1941",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1477191,
            "range": "± 10283",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "1ebd25ef5a323c163c61274165bcce5178ea119c",
          "message": "release(v0.13.1): version bump + CHANGELOG entry (#333)\n\nBumps workspace + vscode-rivet to 0.13.1. CHANGELOG captures the\nv0.13.1 theme — silent-failure closeout (REQ-091, rowan-yaml\nflush-left link loss + extract_links_via_serde loud-fail),\nrelease-pipeline standardization to the cross-repo synth pattern\n(SBOM + SLSA + build-env), spar `84a7363` → tag bump, and the\nMODULE.bazel `rules_wasm_component` git_override that unblocked\nRocq Proofs CI on every PR.\n\nThis is the release-prep commit; the substantive PRs (#328, #329,\n#330, #327) merge first, this branch is rebased onto the merged\nmain, then merged + tagged.\n\nCo-authored-by: Claude Opus 4.7 <noreply@anthropic.com>",
          "timestamp": "2026-05-27T12:45:27-05:00",
          "tree_id": "a836ecef662e6c63d19438e4c71652bd0370091f",
          "url": "https://github.com/pulseengine/rivet/commit/1ebd25ef5a323c163c61274165bcce5178ea119c"
        },
        "date": 1779904330603,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84821,
            "range": "± 532",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 911260,
            "range": "± 7523",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 15648407,
            "range": "± 1810427",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1945,
            "range": "± 17",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24847,
            "range": "± 57",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 364095,
            "range": "± 3022",
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
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1458711,
            "range": "± 20297",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 169134,
            "range": "± 910",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1957314,
            "range": "± 55994",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 37159002,
            "range": "± 3163791",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 126111,
            "range": "± 3453",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1161537,
            "range": "± 12207",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 15202058,
            "range": "± 1741822",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4139,
            "range": "± 9",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 43856,
            "range": "± 807",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 783154,
            "range": "± 6614",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 59483,
            "range": "± 1731",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 727101,
            "range": "± 8321",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8677759,
            "range": "± 711576",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 736,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7065,
            "range": "± 122",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 97444,
            "range": "± 3757",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23082,
            "range": "± 800",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 162461,
            "range": "± 704",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1525906,
            "range": "± 31324",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "0d5c308d7c346e65cec39e26d0f0d704acc1281b",
          "message": "release(v0.13.2): ReqIF interchange completeness + export polish (#334)\n\n* release(v0.13.2): ReqIF interchange completeness + export polish\n\nShips the three contained findings from the v0.13.1 export-format\nend-to-end test, fixes a pre-existing date-bomb test, and files the\nremaining findings as tracked REQs.\n\nImplemented (REQ-102/103/104):\n- ReqIF export now emits a SPECIFICATION + SPEC-HIERARCHY document\n  tree (one SPEC-HIERARCHY per SPEC-OBJECT, referencing a\n  SPECIFICATION-TYPE). Importers (DOORS/Polarion/codeBeamer) need this\n  to render a navigable outline; some reject a hierarchy-less file.\n  Object/relation payload unchanged — round-trip preserved.\n- `rivet import-results --format reqif <file>` brings a ReqIF file\n  back into rivet artifacts (DOORS/Polarion round-trip was\n  export-only; parse_reqif existed but was reachable only via the\n  supplier-pull cache). Reports artifact + link counts.\n- `gherkin` now advertised in `rivet export --help` + the\n  unsupported-format error message (was accepted but undocumented).\n\nTest stabilisation:\n- cited_source_integration::check_sources_strict_audit_gate hardcoded\n  a `last-checked` date that aged past the 30-day staleness threshold,\n  flipping the \"clean fixture passes\" assertion to fail once >30 days\n  elapsed. The fixture now generates a fresh ISO-8601 timestamp at\n  test time (inline civil-date algorithm, no chrono/jiff dep).\n\nTests added (regression guards):\n- rivet-core: test_export_emits_specification_hierarchy,\n  test_reqif_roundtrip_preserves_artifacts_and_links.\n- rivet-cli: export_reqif_roundtrip.rs — export --help lists gherkin;\n  export reqif has SPECIFICATION + SPEC-HIERARCHY; import-results\n  --format reqif round-trips artifacts + links via the binary.\n\nFiled for the next minor (not implemented here — regression-risk /\ndifferent subsystem):\n- REQ-105 HTML export absolute-link decoupling from the serve module.\n- REQ-106 serve variant view passes --binding (bound_artifact_count: 0).\n- REQ-107 sequence/mapping field values render as Debug output.\n- REQ-108 serve external-artifact navigation + shortcut-link contrast.\n- REQ-109 variant scoping for documents (design question).\n\nFull workspace test suite green.\n\nImplements: REQ-102, REQ-103, REQ-104\nRefs: REQ-005, REQ-007\nVerifies: REQ-102, REQ-103, REQ-104\n\nCo-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>\n\n* chore(fmt): rustfmt the export_reqif_roundtrip test args\n\n---------\n\nCo-authored-by: Claude Opus 4.7 <noreply@anthropic.com>",
          "timestamp": "2026-05-28T14:51:00-05:00",
          "tree_id": "c038d162758105fa246134d60381d945df7a3c89",
          "url": "https://github.com/pulseengine/rivet/commit/0d5c308d7c346e65cec39e26d0f0d704acc1281b"
        },
        "date": 1779998444587,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85120,
            "range": "± 420",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 920548,
            "range": "± 12526",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 16715456,
            "range": "± 812911",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1934,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24819,
            "range": "± 1107",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 362322,
            "range": "± 13462",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 97,
            "range": "± 6",
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
            "value": 1435998,
            "range": "± 23580",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 168569,
            "range": "± 9132",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1986621,
            "range": "± 15254",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 38700761,
            "range": "± 5744995",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 124247,
            "range": "± 2682",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1173861,
            "range": "± 23466",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 16904734,
            "range": "± 1617253",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4237,
            "range": "± 20",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 45419,
            "range": "± 360",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 771060,
            "range": "± 25439",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 63668,
            "range": "± 252",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 725604,
            "range": "± 8120",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8484928,
            "range": "± 1067808",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 777,
            "range": "± 17",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 6585,
            "range": "± 27",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 99507,
            "range": "± 426",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21256,
            "range": "± 189",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 147237,
            "range": "± 777",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1357297,
            "range": "± 22701",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "431d48ea083ada3a8cdace05420df7cb7085f426",
          "message": "fix(serve): variant scope uses binding embedded in the variant file (REQ-106) (#335)\n\nUser-reported (Ford variant corpus): the serve dashboard reported\nbound_artifact_count: 0 for every variant, while the CLI\n`variant solve --binding <variant-file>` reported the correct counts.\n\nRoot cause: ProjectVariants::discover only loaded a *separate*\nproject-level binding (artifacts/bindings.yaml). When the `bindings:`\nsection is embedded in the variant file itself (the variant IS its own\nbinding model), no separate file exists, so `self.binding` was None and\ncollect_bound_ids returned an empty set for every variant.\n\nFix: during discovery, also parse each variant file as a FeatureBinding;\nif it carries a non-empty `bindings:` section, store it keyed by variant\nname. `resolve()` and `validation_status()` now select the binding via\n`binding_for(name)` — the variant's own embedded binding takes\nprecedence, falling back to the project-level bindings.yaml. This\nmirrors the CLI's `--binding <variant-file>` self-reference.\n\nTests: resolve_uses_binding_embedded_in_variant_file (embedded binding,\nNO separate bindings.yaml, asserts non-zero bound count via both\nresolve() and validation_status()); project_binding_still_used_when_no_embedded\n(regression guard for the project-level path).\n\nFixes: REQ-106\nRefs: REQ-083, REQ-007\nVerifies: REQ-106\n\nCo-authored-by: Claude Opus 4.7 <noreply@anthropic.com>",
          "timestamp": "2026-05-28T23:48:10-05:00",
          "tree_id": "1f9cebeb595fa74dabc10fc902475086806c8611",
          "url": "https://github.com/pulseengine/rivet/commit/431d48ea083ada3a8cdace05420df7cb7085f426"
        },
        "date": 1780030491825,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 87259,
            "range": "± 275",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 946135,
            "range": "± 20203",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14396333,
            "range": "± 236494",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1948,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24966,
            "range": "± 350",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 358187,
            "range": "± 1437",
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
            "value": 1429215,
            "range": "± 24351",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 167411,
            "range": "± 924",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1915962,
            "range": "± 12344",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 33153168,
            "range": "± 2673750",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 123961,
            "range": "± 2025",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1157237,
            "range": "± 11300",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 21068651,
            "range": "± 1409510",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4138,
            "range": "± 77",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 45308,
            "range": "± 115",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 787589,
            "range": "± 4811",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 61370,
            "range": "± 245",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 684161,
            "range": "± 5718",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8589760,
            "range": "± 306889",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 728,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 6558,
            "range": "± 12",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 96399,
            "range": "± 2629",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21072,
            "range": "± 87",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 146451,
            "range": "± 1588",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1358816,
            "range": "± 22820",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "120431c76219a8b5fa7883506447de3b30d44bd2",
          "message": "fix(serve): external artifact links route to /artifacts/<prefix>:<id> (REQ-108) (#336)\n\nUser-flagged as a suspected regression in external-artifact browsing.\nIt is NOT a regression — the behaviour has been present since PR #86\n(LSP WebView rendering) — but it is a real navigation gap, surfaced now\nthat cross-repo externals (REQ-085) are in active use.\n\nAn artifact's outgoing link to a cross-repo (prefix:id) target rendered\nas `href=\"/externals/<prefix>\"` — the external *project-list* page —\nrather than `/artifacts/<prefix>:<id>`, the external artifact's own\ndetail view. render_artifact_detail already resolves prefix:id against\nthe synced external's store (artifacts.rs:425-433), so the detail view\nworked; only the link pointed at the wrong place. You could reach an\nexternal artifact by typing the URL but never by clicking a link.\n\nFix: point the link at `/artifacts/<full prefix:id target>`, keeping\nthe badge-info prefix chip for visual origin. One behavioural line.\n\nCoverage (answering \"do we have enough Playwright tests?\"): no — the\nexisting externals.spec.ts only covered the /externals project-list\npage, not artifact-level cross-repo navigation. Adds a Playwright test\nthat walks artifact detail pages and asserts any external reference\nlinks to /artifacts/, never /externals/. It is conditional on synced\nexternals being present (skips cleanly otherwise); a deterministic\nsynced-external Playwright fixture is tracked as a follow-up under\nREQ-108, along with the remaining REQ-108 items (followable recursive\nprefix:ref links from the external detail, inbound internal links, and\nshortcut-link contrast on the light background).\n\nRefs: REQ-108, REQ-085",
          "timestamp": "2026-05-28T23:58:13-05:00",
          "tree_id": "01ee5e37ba0bec5f6c614e5975db090c807242c2",
          "url": "https://github.com/pulseengine/rivet/commit/120431c76219a8b5fa7883506447de3b30d44bd2"
        },
        "date": 1780031094038,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85774,
            "range": "± 251",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 915411,
            "range": "± 6387",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 15407880,
            "range": "± 422056",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2025,
            "range": "± 16",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24965,
            "range": "± 48",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 359795,
            "range": "± 2567",
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
            "value": 1435742,
            "range": "± 18109",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 168468,
            "range": "± 870",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1937860,
            "range": "± 12800",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 29672123,
            "range": "± 763040",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 126364,
            "range": "± 485",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1165603,
            "range": "± 10206",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 14184336,
            "range": "± 601363",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4188,
            "range": "± 18",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 45114,
            "range": "± 718",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 767144,
            "range": "± 3847",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 61165,
            "range": "± 328",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 705544,
            "range": "± 7529",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7925753,
            "range": "± 91416",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 736,
            "range": "± 14",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 6837,
            "range": "± 101",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 98172,
            "range": "± 701",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21092,
            "range": "± 75",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 147879,
            "range": "± 836",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1357802,
            "range": "± 18434",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "e3e198b9605d25176c14757d82ff149fbd61cca2",
          "message": "fix(serve): render sequence/mapping field values structurally, not Rust Debug (REQ-107) (#338)\n\nUser-reported: an artifact field whose value is a sequence of mappings\nrendered as the Rust Debug form —\n  Sequence [Mapping {\"kind\": String(\"e\"), \"page_id\": String(\"e\"),\n  \"version\": Number(2), \"section\": String(\"eee\")}]\n— because the field-rendering catch-all arm did\n`html_escape(format!(\"{other:?}\"))`.\n\nAdd `render_field_value(&serde_yaml::Value) -> String`: scalars as\nplain text, sequences as `<ul class=\"field-seq\">`, mappings as nested\n`<dl class=\"field-map\">`. Recursive, so a sequence-of-mappings (the\nreported shape) renders as a readable list of key/value blocks. Used\nby the artifact-detail extra-fields loop in place of the Debug\nfallback; the String arm keeps its linkify-source-refs behaviour.\n\nTests:\n- sequence_of_mappings_renders_structurally_not_debug — asserts the\n  structured markup AND that no `Sequence [` / `Mapping {` / `String(`\n  / `Number(` debug tokens leak.\n- scalar_field_values_render_plainly — bool/number/null.\n\nFixes: REQ-107\nRefs: REQ-007\nVerifies: REQ-107\n\nCo-authored-by: Claude Opus 4.7 <noreply@anthropic.com>",
          "timestamp": "2026-05-29T12:08:15-05:00",
          "tree_id": "27becebb8c6ef440fac03eadadf167eb9306e542",
          "url": "https://github.com/pulseengine/rivet/commit/e3e198b9605d25176c14757d82ff149fbd61cca2"
        },
        "date": 1780074889398,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 82709,
            "range": "± 914",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 876747,
            "range": "± 12266",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12987742,
            "range": "± 1297227",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2124,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25611,
            "range": "± 140",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 380179,
            "range": "± 2865",
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
            "value": 1475535,
            "range": "± 25412",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 166821,
            "range": "± 1403",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1933945,
            "range": "± 25612",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 28395760,
            "range": "± 3985254",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 127866,
            "range": "± 2490",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1124466,
            "range": "± 16742",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 13031153,
            "range": "± 2050909",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4330,
            "range": "± 31",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 63298,
            "range": "± 278",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 825170,
            "range": "± 9080",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 62069,
            "range": "± 307",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 683899,
            "range": "± 5888",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8253201,
            "range": "± 783999",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 766,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7316,
            "range": "± 98",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 115060,
            "range": "± 862",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22672,
            "range": "± 99",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 159978,
            "range": "± 742",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1504556,
            "range": "± 18105",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "1b085cad8a21cff43a5c0bb793d747d625bef722",
          "message": "release(v0.13.3): serve dashboard correctness (REQ-106 / REQ-107 / REQ-108) (#340)\n\nVersion bump 0.13.2 → 0.13.3 + CHANGELOG. Patch release carrying the\nthree user-reported serve-dashboard fixes already merged to main:\n\n- REQ-106 — variant scope resolves bindings embedded in the variant\n  file (dashboard was reporting bound_artifact_count: 0).\n- REQ-108 — external artifact links route to /artifacts/<prefix>:<id>\n  (were pointing at the /externals/<prefix> project-list page).\n- REQ-107 — sequence/mapping field values render structurally instead\n  of as Rust Debug output.\n\nEach shipped with a regression test (serve::variant unit tests,\nrender::artifacts unit tests, externals.spec.ts Playwright guard).\n\nCo-authored-by: Claude Opus 4.8 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-05-29T13:26:09-05:00",
          "tree_id": "704bad2ebc04fd7da0e9bbdfdfd004095ab047ad",
          "url": "https://github.com/pulseengine/rivet/commit/1b085cad8a21cff43a5c0bb793d747d625bef722"
        },
        "date": 1780079565005,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 83871,
            "range": "± 343",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 884370,
            "range": "± 4250",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12677291,
            "range": "± 729410",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2222,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 27447,
            "range": "± 141",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 366630,
            "range": "± 1372",
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
            "value": 1458099,
            "range": "± 12096",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 163068,
            "range": "± 8373",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1915548,
            "range": "± 18446",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 27077224,
            "range": "± 2059128",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 127514,
            "range": "± 2796",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1142249,
            "range": "± 11279",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 12826010,
            "range": "± 1011573",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4402,
            "range": "± 18",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 61445,
            "range": "± 312",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 811916,
            "range": "± 5089",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 62105,
            "range": "± 2627",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 693609,
            "range": "± 3194",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8165760,
            "range": "± 612723",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 794,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7204,
            "range": "± 46",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 115267,
            "range": "± 529",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23215,
            "range": "± 225",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 158301,
            "range": "± 1897",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1486724,
            "range": "± 12193",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "b8039c8b0d5684c0598a98152679a7b857be9acd",
          "message": "feat(tools): scaffold re-generatable intro-video infrastructure (tools/intro-video/) (#339)\n\nReusable infrastructure to auto-generate a 30–60s rivet intro/quickstart\nvideo: Playwright recordVideo (deterministic capture) → piper TTS (local,\nMIT, no API key, CI-able) → ffmpeg mux. Single storyboard.json drives\nscene actions + timing + narration so the clip regenerates after UI\nchanges rather than being hand-edited.\n\nFiles:\n- storyboard.json   — source of truth: 7 scenes, hold_ms timing, narration\n                      (~39s nominal, ~135 words, PulseEngine voice)\n- capture.spec.ts   — Playwright spec; one continuous video; renders the\n                      title / CLI-help / outro as in-browser panels so\n                      there's one timeline to sync narration against\n- playwright.config.ts — standalone (recordVideo, 1280x720, reuses\n                      `rivet serve` :3003, outputs to out/)\n- generate.sh       — capture | tts | mux | all; piper default, macOS\n                      `say` preview only; ffmpeg adelay/amix sync\n- package.json      — pins @playwright/test\n- README.md         — stack rationale, prerequisites, regenerate command,\n                      voice guide, storyboard, a11y notes, gaps\n- .gitignore        — excludes out/, voices/, node_modules/\n\nVoice guide derived from pulseengine.eu/blog: problem-first, evidence-/\nfalsification-minded, no marketing fluff, signature close (\"agents don't\nremember why — so the repository has to\"). Reviewed by three personas\n(DevRel, safety-critical engineer, a11y) before scaffolding.\n\nHONEST STATUS — scaffold is NOT runtime-verified: structurally checked\n(valid JSON, `bash -n` clean, 7 scenes, executable) but never executed.\nFirst run needs a human + the piper binary and a .onnx voice model\n(not bundled — license/size). Open gaps: caption (.vtt) generation\nwired as TODO, voice selection + final timing fine-sync need a human pass.\nNo rivet source / Cargo / existing tests touched.\n\nRefs: FEAT-001",
          "timestamp": "2026-05-29T22:59:27-05:00",
          "tree_id": "55ba780e21063eb42f8d9bfb7476ac26ceac5ab0",
          "url": "https://github.com/pulseengine/rivet/commit/b8039c8b0d5684c0598a98152679a7b857be9acd"
        },
        "date": 1780113957929,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 83455,
            "range": "± 392",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 895185,
            "range": "± 5886",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13758951,
            "range": "± 1011692",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2174,
            "range": "± 54",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25265,
            "range": "± 50",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 361864,
            "range": "± 3066",
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
            "value": 1469751,
            "range": "± 15982",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 160466,
            "range": "± 589",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1838771,
            "range": "± 60283",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 23636235,
            "range": "± 293677",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 128759,
            "range": "± 1100",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1143069,
            "range": "± 19072",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 11987716,
            "range": "± 185423",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4293,
            "range": "± 14",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 58980,
            "range": "± 142",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 847272,
            "range": "± 1829",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 60721,
            "range": "± 375",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 689387,
            "range": "± 11543",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7334191,
            "range": "± 48444",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 797,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7442,
            "range": "± 48",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 114701,
            "range": "± 401",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22973,
            "range": "± 48",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 160023,
            "range": "± 752",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1492754,
            "range": "± 15939",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "02784dbc654dd268fbc9902c40d0b87730894fad",
          "message": "docs(req-105): consolidate the three confirmed HTML-export asset gaps (#337)\n\nThe v0.13.1 export-format review + the follow-up mermaid/PNG-SVG\ninvestigation confirmed REQ-105 is not one bug but three, all the same\nroot cause: `cmd_export_html` reuses the serve dashboard's HTML but\nships none of serve's runtime assets.\n\n1. Absolute server-route links (`/artifacts/X`, no `.html`) → broken\n   static/sub-path navigation.\n2. SVG-viewer toolbar JS (svgZoomFit/svgFullscreen/svgPopout) not\n   bundled into `_assets/` → mermaid/graph zoom + fullscreen + popout\n   buttons render but are dead in exported HTML (work in `rivet serve`,\n   Playwright-tested there).\n3. `/docs-asset/` images not copied + `src` not rewritten → a doc that\n   references a relative PNG/SVG renders in serve (rewrite_image_paths\n   → /docs-asset/ route) but 404s in the exported site.\n\nExpanded REQ-105 with all three gaps + a fix direction + acceptance\ncovering each. Added unit tests for the serve-side image-path rewrite\n(`render::source::tests`) documenting the working serve behaviour that\nthe export must match:\n- relative_image_src_rewritten_to_docs_asset\n- relative_png_src_rewritten\n- absolute_and_remote_src_pass_through\n\nNo production behaviour change in this commit — REQ-105 implementation\n(the export-asset bundling refactor) is regression-risky and tracked\nfor its own cycle.\n\nRefs: REQ-105, REQ-007\nVerifies: REQ-007\n\nCo-authored-by: Claude Opus 4.7 <noreply@anthropic.com>",
          "timestamp": "2026-05-29T22:59:34-05:00",
          "tree_id": "62a6238ed95efc1090b5cf03d70dfde41dea41e2",
          "url": "https://github.com/pulseengine/rivet/commit/02784dbc654dd268fbc9902c40d0b87730894fad"
        },
        "date": 1780114370534,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85183,
            "range": "± 307",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 932465,
            "range": "± 11478",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 20133634,
            "range": "± 1475895",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1942,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24897,
            "range": "± 124",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 363749,
            "range": "± 7938",
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
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1457181,
            "range": "± 15400",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 166932,
            "range": "± 1067",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1944559,
            "range": "± 17632",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 47074708,
            "range": "± 4395097",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 124108,
            "range": "± 744",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1163994,
            "range": "± 20296",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 20533414,
            "range": "± 2205231",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4151,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 43650,
            "range": "± 2392",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 765631,
            "range": "± 5567",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 61867,
            "range": "± 192",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 696771,
            "range": "± 3536",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 9653035,
            "range": "± 887376",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 732,
            "range": "± 12",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 6620,
            "range": "± 193",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 98130,
            "range": "± 941",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21065,
            "range": "± 111",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 145284,
            "range": "± 642",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1354639,
            "range": "± 29448",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "197134debfb5ab7af037f9217e7ff42059bdacd8",
          "message": "ci(release-npm): preflight npm-auth check (loud-fail on bad/expired token) (#342)\n\nThe npm channel silently froze at 0.10.1 for ~6 releases because\nNPM_TOKEN expired, then was replaced with a classic *Publish* token\nthat fails under the org's 2FA-on-publish with EOTP — and the only\nsignal was a per-package `npm publish` E404/EOTP crash deep in the job.\n\nAdd a `npm whoami` preflight right after setup-node in both publish\njobs. A bad/expired/wrong-type token now fails immediately with a\nlabeled ::error:: telling the maintainer exactly what to do\n(Automation or granular read-write token), instead of a cryptic\nper-platform publish failure. F2 loud-fail-over-silent-success ethos —\nthe same principle rivet's own validators enforce.\n\nRefs: REQ-068",
          "timestamp": "2026-05-30T00:24:22-05:00",
          "tree_id": "c02792d311b03d65bce3a76c26eef98f815fe302",
          "url": "https://github.com/pulseengine/rivet/commit/197134debfb5ab7af037f9217e7ff42059bdacd8"
        },
        "date": 1780119104980,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85847,
            "range": "± 366",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 920803,
            "range": "± 3909",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 15431206,
            "range": "± 1001728",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1979,
            "range": "± 63",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24910,
            "range": "± 784",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 346273,
            "range": "± 8531",
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
            "value": 1421370,
            "range": "± 10317",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 164511,
            "range": "± 643",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1933934,
            "range": "± 18966",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 40719149,
            "range": "± 6154192",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 127147,
            "range": "± 452",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1173783,
            "range": "± 17417",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 17332794,
            "range": "± 1198429",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4102,
            "range": "± 113",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 46066,
            "range": "± 126",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 775140,
            "range": "± 19277",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 56053,
            "range": "± 712",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 699132,
            "range": "± 4275",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8455384,
            "range": "± 330811",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 741,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 6849,
            "range": "± 53",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 99474,
            "range": "± 321",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21098,
            "range": "± 89",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 146921,
            "range": "± 3426",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1358005,
            "range": "± 8753",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "1a83f4a2f6e3d59fc164d7f0dd343ee79bd6de34",
          "message": "docs(roadmap): file REQ-093..101 + 10-persona review design doc (#341)\n\nClean rebuild of the stale #326 branch (which predated v0.13.1/2/3 and\nwould have reverted tools/intro-video + version bumps if merged as-is).\nRe-applies just its content on top of current main:\n\n- docs/design/10-persona-review-roadmap.md — the 10-persona review\n  synthesis (universal-LIKE/DISLIKE matrices, Carrasco hybrid\n  flip-conditions, persona→REQ mapping). Kept as a held roadmap note\n  per direction.\n- REQ-093..099 — the v0.14.0+ roadmap REQs out of that review\n  (FUTURE oracles, release-verify, cargo-build-invokes-validate,\n  SACM 2.x, DO-330 typed schema, independence oracle, rivet_apply MCP).\n- REQ-100 — externals: kind: source (track non-rivet upstreams without\n  the missing-rivet.yaml warning).\n- REQ-101 — rivet verify artifact-driven gate (meld pattern).\n\nCloses a real traceability gap: REQ-100 / REQ-101 were referenced as\n\"filed\" by later v0.13.x work but only ever lived in the unmerged\n#326 branch. Inserted in numeric order (092 → 093..101 → 102); no\nduplicate IDs; rivet validate + docs check PASS.\n\nSupersedes #326.",
          "timestamp": "2026-05-30T00:25:21-05:00",
          "tree_id": "1559b5bd15cbb7017f5109c4fbfb4a67d839df00",
          "url": "https://github.com/pulseengine/rivet/commit/1a83f4a2f6e3d59fc164d7f0dd343ee79bd6de34"
        },
        "date": 1780119525189,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84719,
            "range": "± 616",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 922972,
            "range": "± 38779",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 18508398,
            "range": "± 800713",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1944,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24976,
            "range": "± 301",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 363529,
            "range": "± 2940",
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
            "value": 1435200,
            "range": "± 24385",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 165895,
            "range": "± 967",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1937206,
            "range": "± 30580",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 40488316,
            "range": "± 2940135",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 124797,
            "range": "± 1601",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1155995,
            "range": "± 50898",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 18929173,
            "range": "± 1999487",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4135,
            "range": "± 14",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 44938,
            "range": "± 142",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 761629,
            "range": "± 11887",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 60430,
            "range": "± 519",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 701102,
            "range": "± 6707",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8498761,
            "range": "± 477229",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 771,
            "range": "± 21",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 6486,
            "range": "± 102",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 98752,
            "range": "± 3675",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21217,
            "range": "± 148",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 146356,
            "range": "± 555",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1355654,
            "range": "± 45168",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "a44696ebcdcafd548862695022704ea2b5028716",
          "message": "feat(validate): agent-actionable diagnostic remediation (REQ-124) (#345)\n\nA validation error states *what* is wrong but not *what to do*, nor which\nof the competing fixes is right. The witnessed failure: an agent saw\n\n  ERROR: [TE-008] link 'traces-to' targets 'FEAT-019' (type 'feature'),\n         allowed target types: [\"requirement\", \"design-decision\"]\n\nand \"fixed forward\" by inventing type-invalid links on sibling artifacts —\nturning 26 warnings into 8 errors — because the message gave no remedy and\nno trade-off (fix the artifact vs. widen the schema).\n\nNew rivet-core::remediation module re-derives a structured Remediation from\nthe diagnostic + the live schema + store the renderer already holds. It is a\npost-construction pass keyed by Diagnostic.rule — deliberately NOT a field\nthreaded through the ~70 Diagnostic construction sites — so the hot\nvalidation path is untouched and remediation knowledge grows rule-by-rule.\n\nEach Remediation carries a one-line summary, ordered fix_options (artifact-fix\nfirst, schema-fix second) each tagged FixKind (fix-artifact | adjust-schema)\nso a tool can tell the two surfaces apart, and a doc_topic resolvable via\n`rivet docs diagnostics/<rule>`.\n\n- text: rustc-style `help:` block after each remediable diagnostic, ending\n  `see:  rivet docs diagnostics/<rule>`\n- json: a `remediation` object on the offending diagnostic\n- docs: 8 new `diagnostics/<rule>` topics; the link-target-type doc\n  explicitly tells the agent NOT to fix-forward onto siblings\n- rules covered (8): link-target-type, broken-link, unknown-link-type,\n  required-field, allowed-values, cardinality, unknown-field, known-type.\n  Each re-derives the offending link/field/value and the schema menu of\n  allowed alternatives faithfully — matching the validator's own known-set\n  (e.g. unknown-link-type uses schema.link_types.keys(), not inverse names;\n  cardinality counts via the same link_satisfies_field logic). Rules without\n  guidance (incl. dynamic-id traceability rules) render bare.\n\nVerified end-to-end on fixtures (text + json + all 8 docs resolve) and with\n12 unit tests in the remediation module. validate/docs-check/clippy/fmt clean.\n\nImplements: REQ-124\nVerifies: REQ-124\nRefs: REQ-004\n\nCo-authored-by: Claude Opus 4.8 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-05-30T07:56:00-05:00",
          "tree_id": "bc1969fb593c943612e1695d62d41ee4aa225c1e",
          "url": "https://github.com/pulseengine/rivet/commit/a44696ebcdcafd548862695022704ea2b5028716"
        },
        "date": 1780146163533,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84365,
            "range": "± 363",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 883225,
            "range": "± 10107",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14090569,
            "range": "± 1040247",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2165,
            "range": "± 9",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26655,
            "range": "± 148",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 353966,
            "range": "± 2585",
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
            "value": 1445659,
            "range": "± 13022",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 148780,
            "range": "± 397",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1742616,
            "range": "± 21268",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 27217598,
            "range": "± 4752763",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 130748,
            "range": "± 2915",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1126117,
            "range": "± 24434",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 15448599,
            "range": "± 1800649",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4258,
            "range": "± 25",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 61086,
            "range": "± 229",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 783387,
            "range": "± 2459",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 61503,
            "range": "± 366",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 685439,
            "range": "± 1908",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7874975,
            "range": "± 471892",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 833,
            "range": "± 10",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7502,
            "range": "± 83",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 119638,
            "range": "± 931",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22641,
            "range": "± 172",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 157078,
            "range": "± 1709",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1454284,
            "range": "± 26595",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "6e315792ac334b48b98d0c3f1630d8e465df022b",
          "message": "feat(export): HTML export self-contained — relative links + bundled JS + copied images (REQ-105) (#343)\n\n* feat(export): make HTML export self-contained — relative links + bundled JS + copied images (REQ-105)\n\nThe static HTML export reused the serve dashboard's rendered HTML but\nshipped none of serve's runtime assets, leaving three gaps (all the\nsame root cause). This closes them so `rivet export --format html`\nproduces a site that actually works offline / under any base path.\n\n1. Absolute server-route links → relative + .html.\n   render_page() content carried `href=\"/artifacts/X\"`, `/coverage`,\n   etc. — which 404 as static files. New `static_file_for_route()`\n   maps each serve route to the file the export actually wrote\n   (artifacts/X.html, coverage/index.html, …), and\n   `rewrite_static_links()` rewrites href/hx-get to a depth-relative\n   path before wrapping. External / `//` / `#anchor` / already-relative\n   links are left untouched. Verified on a full export: 0 absolute\n   server-route links remain; sampled links resolve 20/20 to real files.\n\n2. svg-viewer toolbar JS bundled.\n   The zoom-fit / fullscreen / popout buttons rendered but were dead\n   (handlers lived only in serve/js.rs). Added a standalone\n   assets/svg-viewer.js (the three window.svg* handlers + Escape),\n   written to _assets/svg-viewer.js and referenced from every page.\n\n3. /docs-asset images copied.\n   A doc that references a relative image rendered as\n   src=\"/docs-asset/<path>\"; the export now rewrites that to\n   _assets/docs/<path> AND copies the referenced file from the doc\n   directories. A referenced-but-missing image warns loudly (F2\n   ethos) instead of silently producing a broken <img>; path-traversal\n   ('..') in the asset path is rejected.\n\nTests: export_static_links_tests (route map, depth-prefix rewrite,\nexternal/anchor pass-through, docs-asset record). Existing export_html\n+ export_reqif_roundtrip integration tests still green.\n\nKnown cosmetic edge: prose that literally mentions a `/docs-asset/...`\npath (e.g. REQ-105's own description) gets rewritten + warned — the\nwarning is technically correct (no such image), the \"reference\" is\njust illustrative text.\n\nFixes: REQ-105\nRefs: REQ-007\nVerifies: REQ-105\n\nCo-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>\n\n* fix(export): harden docs-asset copy against path traversal (REQ-105)\n\nAutomated security review flagged the docs-asset copy. The original\n`rel.contains(\"..\")` guard is insufficient: artifact/document content\ncan come from UNTRUSTED cross-repo externals (REQ-085 externals /\nsupplier pull), and an absolute path defeats it entirely —\n`Path::join` discards the base, so `docs_out.join(\"/etc/passwd\")`\n== `/etc/passwd`.\n\nAdd `is_safe_doc_asset_path`: requires every path component to be a\nplain Normal segment (excludes `..`, `.`, root, Windows prefixes),\nrejects absolute paths, backslashes, NULs, and over-long paths. Applied\nat BOTH sites:\n- rewrite_static_links: an unsafe /docs-asset path is neither recorded\n  for copy nor rewritten — left as-is (a dead link), never used in a\n  filesystem op.\n- the copy loop: re-checks the predicate, resolves src only to a file\n  genuinely inside a doc dir (canonicalize + starts_with — rejects\n  symlink escapes), and verifies the destination stays inside the\n  canonical _assets/docs/ root before writing.\n\nTest docs_asset_traversal_is_rejected covers the predicate (absolute,\n../, mixed, backslash, empty) and that the rewriter records/rewrites\nnothing for crafted traversal srcs.\n\nRefs: REQ-105, REQ-051\n\n* fix(export): clippy is_none_or + update export test to REQ-105 relative-link contract\n\n- clippy (1.96): best.map_or(true, ..) → best.is_none_or(..) in\n  rewrite_static_links (unnecessary_map_or, -D warnings).\n- export.spec.ts \"artifacts/index.html lists artifacts\" asserted the\n  OLD absolute-route links (`href=\"/artifacts/X\"`, comment even said\n  \"root-relative hrefs\") — the exact broken behaviour REQ-105 fixes.\n  Update it to the new contract: artifact links are relative + .html\n  (`../artifacts/X.html`) and NO absolute `/artifacts/` route remains.\n\nRefs: REQ-105\n\n---------\n\nCo-authored-by: Claude Opus 4.8 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-05-30T08:01:07-05:00",
          "tree_id": "7356dbe6376561cd010c6b6acf5ef78b3e8bf9ca",
          "url": "https://github.com/pulseengine/rivet/commit/6e315792ac334b48b98d0c3f1630d8e465df022b"
        },
        "date": 1780146567334,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84519,
            "range": "± 588",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 926354,
            "range": "± 9066",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 18577359,
            "range": "± 1490618",
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
            "value": 24956,
            "range": "± 55",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 371499,
            "range": "± 1333",
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
            "value": 1433578,
            "range": "± 22717",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 154282,
            "range": "± 369",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1797526,
            "range": "± 19361",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 38692025,
            "range": "± 3483853",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 126187,
            "range": "± 788",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1163463,
            "range": "± 28493",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 15626890,
            "range": "± 1631219",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4150,
            "range": "± 13",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 45426,
            "range": "± 268",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 755989,
            "range": "± 4596",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 62823,
            "range": "± 281",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 701906,
            "range": "± 8064",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7968283,
            "range": "± 182238",
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
            "value": 7135,
            "range": "± 136",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 98975,
            "range": "± 1753",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 20783,
            "range": "± 146",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 144300,
            "range": "± 406",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1341489,
            "range": "± 33314",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "6c66af5c251115d5127db2862d23c590b76e17da",
          "message": "docs(artifacts): file REQ-125..128 — gbrain-derived deterministic-armor backlog (#346)\n\n* docs(artifacts): file REQ-125..128 — gbrain-derived deterministic armor\n\nA source-level study of garrytan/gbrain (not its README) surfaced four\nideas worth adopting — chosen because they are the *defensive disciplines*\ngbrain grew to guard a fuzzy core, which are domain-portable while the fuzz\nis not. rivet's core is already deterministic, so the armor is pure upside.\n\n- REQ-125  validate/coverage --explain: pure formatter replaying the rule\n           chain validate::Diagnostic + coverage already compute — makes the\n           oracle's reasoning legible (CI-as-curriculum, agent-friendly).\n- REQ-126  baseline-snapshot drift gate, with rebaselining gated as a\n           trailer-carrying reviewed act so the baseline can't launder drift\n           (the green-because-unobserved trap).\n- REQ-127  MCP fail-closed invariant. AUDITED 2026-05-30: no MCP tool param\n           can override schema/externals today (fail-closed by omission);\n           this LOCKS it as an explicit, tested invariant. Hardening, not a\n           live fix. Reinforces REQ-051.\n- REQ-128  rivet list --orphans: the standing query for asserted-but-\n           unanchored claims (requirement with no test, decision with no\n           hazard) — deterministic, exact-count ordering only.\n\nExplicitly REJECTED from gbrain (would corrupt rivet's determinism): LLM\nfact-extraction, hybrid vector/RRF/reranker as canonical query, cosine\ndedup, LLM extractable handlers, fail-open ranking.\n\nRefs: REQ-125, REQ-126, REQ-127, REQ-128\n\nCo-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>\n\n* docs(artifacts): file REQ-129..130 — slower-lane gbrain adaptations\n\nTwo ADAPT items from the gbrain source study, each carrying the safety-domain\nconstraint that makes the adaptation legitimate (keep gbrain's caution, drop\nits acceptance):\n\n- REQ-129  validate --review-candidates: REPORT the unclassifiable (unknown\n           types, unknown fields, unresolved externals) without ACCEPTING it.\n           Unknown type stays a hard error; report is additive, opt-in,\n           loud-fail preserved. Redaction must be one-way and must not become\n           a side channel that leaks artifact content past the classification\n           boundary.\n- REQ-130  superseded-by/superseded-reason as an ADDITIVE typed link that\n           PRESERVES the node. In a safety domain supersession is not deletion\n           — the superseded requirement stays in the store, graph, and\n           coverage (marked), because it is certification evidence. Explicitly\n           rejects gbrain's git-delete -> soft-delete model. Built on schema\n           extends + prefix:ID resolution, no new directive.\n\nRefs: REQ-129, REQ-130\n\nCo-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>\n\n---------\n\nCo-authored-by: Claude Opus 4.8 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-05-30T10:07:58-05:00",
          "tree_id": "b167b9ab9e9a78c58ce9dd9346d6c753c1c7c7e3",
          "url": "https://github.com/pulseengine/rivet/commit/6c66af5c251115d5127db2862d23c590b76e17da"
        },
        "date": 1780154079809,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85707,
            "range": "± 724",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 932363,
            "range": "± 24861",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 17028102,
            "range": "± 2074732",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1955,
            "range": "± 14",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24947,
            "range": "± 46",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 359783,
            "range": "± 2539",
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
            "value": 1437972,
            "range": "± 15413",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 150648,
            "range": "± 1322",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1807362,
            "range": "± 24087",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 26954952,
            "range": "± 1437352",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 126718,
            "range": "± 2333",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1153667,
            "range": "± 22906",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 15014467,
            "range": "± 542013",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4171,
            "range": "± 71",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 44612,
            "range": "± 650",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 781067,
            "range": "± 6298",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 61307,
            "range": "± 146",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 708863,
            "range": "± 2618",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8423609,
            "range": "± 411831",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 806,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 6853,
            "range": "± 23",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 96358,
            "range": "± 1919",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21032,
            "range": "± 47",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 142759,
            "range": "± 4880",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1339829,
            "range": "± 17994",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "b55a9c6f9eb172ad9ecff6445085c7b0ac4040df",
          "message": "docs(artifacts): file 14 oracle-verified bug-hunt findings (REQ-110..123) + REQ-109 decision (#344)\n\n* docs(artifacts): file 14 oracle-verified bug-hunt findings (REQ-110..123) + record REQ-109 decision\n\nOutcome of a 5-persona oracle-style bug hunt (cross-command report\nconsistency, git/remote semantics, evidence-correctness, path-URL\nleakage, F2 silent-failure), each candidate adversarially verified\nthrough 3 distinct lenses (correctness / user-meaning /\ncode-archaeology) and confirmed only on >=2-of-3 majority. 20\ncandidates → 14 confirmed, 6 refuted (the refuted set includes a\nstale \"HTML export absolute links\" finding correctly killed because\nREQ-105 just fixed it — evidence the verification gate works).\n\nFiled REQ-110..123, dogfooded as rivet artifacts with falsifiable\nacceptance steps. Clusters:\n\n- Coverage counting (REQ-110/111): the coverage HTML card + JSON\n  `total` sum PER-RULE denominators, double-counting artifacts that\n  satisfy multiple rules, under a label that says \"artifacts covered\"\n  — the same class as the earlier 768/929 observation, generalized,\n  and semantically clashing with stats' distinct `total`. HIGH.\n- Git/remote semantics (REQ-112/113/114): cmd_commits excludes\n  externals while validate includes them; resolve_external_dir\n  returns an unsynced cache path; sync local/remote state reported\n  inconsistently.\n- Path/URL leakage beyond REQ-105 (REQ-115/116/117/118): zola export\n  emits absolute artifact links (2 sites), HTML export embeds a\n  hardcoded localhost oEmbed tag, document markdown emits absolute\n  paths.\n- F2 silent-failure (REQ-119..123): ReqIF enum/dir-import/field\n  fallbacks swallow drops; external git-checkout + symlink-removal\n  failures silently ignored.\n\nAlso records the REQ-109 (variant document scoping) DESIGN DECISION:\nyes, via an optional `documents:` list on the existing binding (no\nnew directive), default-in for unbound docs, validate always sees the\nfull set. Implementation is a tracked follow-up.\n\nRefs: REQ-004, REQ-083\n\n* style(artifacts): strip trailing whitespace (yamllint trailing-spaces)\n\nThe bug-hunt REQ-110..123 blocks carried 56 trailing-space errors that\nfailed the YAML Lint CI gate (error-level, not warning). Pure whitespace\ncleanup — no YAML-semantic change; `rivet validate` still PASS.\n\nTrace: skip",
          "timestamp": "2026-05-30T14:35:21-05:00",
          "tree_id": "776b20c18be74c507fcce02941e8caeeeb0a3ab4",
          "url": "https://github.com/pulseengine/rivet/commit/b55a9c6f9eb172ad9ecff6445085c7b0ac4040df"
        },
        "date": 1780170120611,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84616,
            "range": "± 717",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 925838,
            "range": "± 18874",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 17145317,
            "range": "± 3427615",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1977,
            "range": "± 9",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25116,
            "range": "± 77",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 371405,
            "range": "± 2265",
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
            "value": 1448146,
            "range": "± 20467",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 154167,
            "range": "± 8892",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1800323,
            "range": "± 16793",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 28455287,
            "range": "± 1590137",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 127607,
            "range": "± 1362",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1166218,
            "range": "± 16770",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 15423686,
            "range": "± 900726",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4154,
            "range": "± 10",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 45621,
            "range": "± 172",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 777198,
            "range": "± 23538",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 63451,
            "range": "± 264",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 730631,
            "range": "± 3145",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8516806,
            "range": "± 1538342",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 775,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7134,
            "range": "± 17",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 102022,
            "range": "± 794",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21158,
            "range": "± 49",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 146069,
            "range": "± 1072",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1349667,
            "range": "± 17336",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "cb670c84e1a5ae243ba17a4b8c080692231ecc26",
          "message": "release(v0.14.0): agent-actionable validation + self-contained export (#347)\n\n* release(v0.14.0): agent-actionable validation + self-contained export\n\nBump workspace version 0.13.3 -> 0.14.0 and add the CHANGELOG entry.\n\nHeadline features since v0.13.3:\n- REQ-124 — agent-actionable diagnostic remediation (8 rules; help: blocks\n  in text, remediation object in --format json, rivet docs diagnostics/<rule>)\n- REQ-105 — HTML export self-containment (relative links, bundled svg-viewer,\n  copied doc images, path-traversal hardening)\n\nRoadmap filed (draft): REQ-110..123 (bug-hunt findings), REQ-125..130\n(gbrain-derived deterministic-armor backlog).\n\nTrace: skip\n\n* release(v0.14.0): bump vscode-rivet to 0.14.0 (VersionConsistency)\n\nThe workspace version bump missed the VS Code extension's package.json,\ntripping the docs-check VersionConsistency invariant.\n\nTrace: skip",
          "timestamp": "2026-05-31T03:16:45-05:00",
          "tree_id": "a57c7950dfde8aa90a69e41276ac28124165bb6c",
          "url": "https://github.com/pulseengine/rivet/commit/cb670c84e1a5ae243ba17a4b8c080692231ecc26"
        },
        "date": 1780215806464,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84035,
            "range": "± 480",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 923208,
            "range": "± 18426",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 17549076,
            "range": "± 1432036",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1920,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25094,
            "range": "± 53",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 370259,
            "range": "± 1815",
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
            "value": 1437642,
            "range": "± 15987",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 151469,
            "range": "± 507",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1783649,
            "range": "± 21206",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 31257613,
            "range": "± 2082341",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 125715,
            "range": "± 7297",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1174053,
            "range": "± 11673",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 17853975,
            "range": "± 3170531",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4104,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 44099,
            "range": "± 116",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 764825,
            "range": "± 3332",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 60885,
            "range": "± 233",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 700859,
            "range": "± 2594",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8506521,
            "range": "± 600549",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 809,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7014,
            "range": "± 14",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 98527,
            "range": "± 510",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21061,
            "range": "± 66",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 143713,
            "range": "± 942",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1347301,
            "range": "± 6910",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "c5fe0e7d1d3d4787f17e89715a921ca4f2c30f20",
          "message": "fix(validate,coverage): required-backlink matches inverse-name convention + honours alternate-backlinks (#349) (#351)\n\n`Backlink.link_type` stores the *forward* link-type name (e.g. `supports`)\nwhile schemas like `safety-case.yaml` write `required-backlink` as the\n*inverse* name (e.g. `supported-by`). The strict equality match at\n`validate.rs:906` and `coverage.rs:200` therefore never matched for any\ninverse-name rule — `goal-has-support` fired for every safety goal even\nwhen correctly supported by a solution, and coverage counted every such\ngoal as uncovered. `dev.yaml`'s `required-backlink: satisfies` happens\nto use the forward name and worked; the bug surfaced only on schemas\nfollowing the inverse-name convention.\n\nMatch now accepts either spelling at both call sites:\n`bl.link_type == name || bl.inverse_type.as_deref() == Some(name)`.\nSame fix path additionally evaluates `rule.alternate_backlinks` —\n`validate.rs` previously ignored that field outright, so a safety goal\nsatisfied only via an alternate (e.g. `decomposed-by` from a strategy\ninstead of `supported-by`) still erroneously fired the rule.\n\nFour regression tests pin the behaviour (two per engine): one for the\ninverse-name match, one for alternate-backlinks. Reproduces and clears\nthe loom safety-case scenario from the bug report.\n\nFixes: REQ-004\nRefs: #349\n\nCo-authored-by: Claude <noreply@anthropic.com>",
          "timestamp": "2026-05-31T03:22:13-05:00",
          "tree_id": "a2b2018cc9576c8fcbcb078ab11f1600a55d08e6",
          "url": "https://github.com/pulseengine/rivet/commit/c5fe0e7d1d3d4787f17e89715a921ca4f2c30f20"
        },
        "date": 1780216224782,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 86593,
            "range": "± 878",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 915209,
            "range": "± 4660",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 17603910,
            "range": "± 1110091",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1934,
            "range": "± 28",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24756,
            "range": "± 165",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 364610,
            "range": "± 1728",
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
            "value": 1448903,
            "range": "± 21560",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 166549,
            "range": "± 565",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1943952,
            "range": "± 101333",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 65674685,
            "range": "± 1124094",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 125913,
            "range": "± 723",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1158037,
            "range": "± 15509",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 14056135,
            "range": "± 700853",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4144,
            "range": "± 11",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 44999,
            "range": "± 486",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 760014,
            "range": "± 2651",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 64338,
            "range": "± 1256",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 731711,
            "range": "± 5276",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 9022585,
            "range": "± 577448",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 736,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 6719,
            "range": "± 146",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 98736,
            "range": "± 451",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21233,
            "range": "± 251",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 146035,
            "range": "± 947",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1371137,
            "range": "± 12010",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "ac46f941b2c50ec75f7320da7a679686fb2a1da5",
          "message": "docs(artifacts): file REQ-135 (status enum) + REQ-136 (modify ergonomics) (#361)\n\nAgent-reported issue cluster, verified against source.\n\n- REQ-135  status enum is unenforced: common.yaml declares status type:enum\n           with no allowed-values, validate never checks artifact.status, and\n           mutate accepts any string. rivet's own repo already has 4 drift\n           statuses passing validate. Cluster: #352/#354/#355/#353.\n- REQ-136  rivet modify ergonomics: add --set-description; positional misuse\n           should hint the --set-* flag. Issues #359/#360.\n\nRefs: REQ-135, REQ-136\n\nCo-authored-by: Claude Opus 4.8 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-05-31T03:27:36-05:00",
          "tree_id": "723b3a2a00448fd9abc5949a426773f8a17eaeb9",
          "url": "https://github.com/pulseengine/rivet/commit/ac46f941b2c50ec75f7320da7a679686fb2a1da5"
        },
        "date": 1780216619251,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 83788,
            "range": "± 250",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 923732,
            "range": "± 6934",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14180576,
            "range": "± 471556",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1940,
            "range": "± 9",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24962,
            "range": "± 66",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 358677,
            "range": "± 1505",
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
            "value": 1437715,
            "range": "± 40377",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 172224,
            "range": "± 602",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 2013791,
            "range": "± 10623",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 29119576,
            "range": "± 938170",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 128435,
            "range": "± 940",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1164800,
            "range": "± 11108",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 14435452,
            "range": "± 371914",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4179,
            "range": "± 19",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 44474,
            "range": "± 124",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 785818,
            "range": "± 4512",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 64289,
            "range": "± 355",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 721926,
            "range": "± 4815",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8230007,
            "range": "± 204119",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 743,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 6729,
            "range": "± 99",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 103232,
            "range": "± 2707",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21790,
            "range": "± 56",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 147241,
            "range": "± 352",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1379216,
            "range": "± 23979",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "ba67eb6079cb9802f50b8488661e80dfc289d15c",
          "message": "docs(artifacts): mark merged features implemented + re-file REQ-131 (#363)\n\nMark-implemented sweep — acceptance met by merged code:\n- REQ-105 (HTML export self-containment, v0.14.0)  draft    -> implemented\n- REQ-110/111 (coverage relabel, #348)             draft    -> implemented\n- REQ-124 (diagnostic remediation, v0.14.0)        approved -> implemented\n\nAlso re-files REQ-131 (the #349 required-backlink fix, status implemented):\nits artifact was dropped when #351 was reworked to add alternate-backlink\nsupport, so the code shipped on main without the requirement. Restores the\ntraceability that issue comments on #349/#350 reference.\n\nrivet validate PASS.\n\nRefs: REQ-105, REQ-110, REQ-111, REQ-124, REQ-131\n\nCo-authored-by: Claude Opus 4.8 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-05-31T04:15:35-05:00",
          "tree_id": "61f5b9095d355ce251cf60e7cf7805c9c1d23722",
          "url": "https://github.com/pulseengine/rivet/commit/ba67eb6079cb9802f50b8488661e80dfc289d15c"
        },
        "date": 1780219351421,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 76453,
            "range": "± 479",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 955872,
            "range": "± 2389",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 15210012,
            "range": "± 840996",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1667,
            "range": "± 9",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 18707,
            "range": "± 63",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 365407,
            "range": "± 2104",
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
            "value": 1352660,
            "range": "± 39745",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 158649,
            "range": "± 338",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1874125,
            "range": "± 13976",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 30661531,
            "range": "± 2195148",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 121678,
            "range": "± 1831",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1196014,
            "range": "± 12597",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 15417613,
            "range": "± 1344740",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3896,
            "range": "± 10",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 44361,
            "range": "± 138",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 833780,
            "range": "± 2148",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 52880,
            "range": "± 164",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 606194,
            "range": "± 3151",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7021346,
            "range": "± 130716",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 637,
            "range": "± 25",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 5239,
            "range": "± 13",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 144434,
            "range": "± 513",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21033,
            "range": "± 106",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 151453,
            "range": "± 583",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1409206,
            "range": "± 35056",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "bc2f32ad26c0b78253ad6f304428ae959843588b",
          "message": "feat(get,list): expose incoming links (what links to an artifact) (#358) (#364)\n\nAgent-reported (#358), demanded by 3 issues (#358/#349/#350): the most common\ntraceability question — \"what verifies/satisfies X?\" — was unanswerable from\nthe two commands an agent reaches for. `rivet get` showed only outbound links;\n`rivet list --format json` collapsed links to an integer count. The reverse\nedges were only reachable via `matrix --direction backward` + hand-parsing YAML.\n\n- `rivet get <ID>`: new `incoming_links` array ({type, source, inverse}) in\n  JSON + an `Incoming:` section in text, from `LinkGraph::backlinks_to`.\n- `rivet list --format json`: emits the real link objects (matching `get`)\n  instead of a count; count recoverable as `.links | length`.\n\nRegression test get_json_includes_incoming_links. Verified on rivet's own repo\n(REQ-004 shows 56 incoming links). Implements the #358 part of REQ-128\n(the `list --orphans` ranking remains).\n\nImplements: REQ-128\nVerifies: REQ-128\nRefs: REQ-007\n\nCo-authored-by: Claude Opus 4.8 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-05-31T05:15:36-05:00",
          "tree_id": "9c2397b5ad16edb63b4315b4d1e280f4a2e63ff8",
          "url": "https://github.com/pulseengine/rivet/commit/bc2f32ad26c0b78253ad6f304428ae959843588b"
        },
        "date": 1780222953778,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 76823,
            "range": "± 784",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 954462,
            "range": "± 6928",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 16831579,
            "range": "± 1002137",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1694,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 19294,
            "range": "± 341",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 379527,
            "range": "± 5728",
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
            "value": 1358406,
            "range": "± 24066",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 158995,
            "range": "± 757",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1870598,
            "range": "± 36463",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 36110611,
            "range": "± 3505928",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 120763,
            "range": "± 1776",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1199862,
            "range": "± 9126",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 18981112,
            "range": "± 2140019",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4401,
            "range": "± 11",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 40412,
            "range": "± 157",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 818463,
            "range": "± 2480",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 53293,
            "range": "± 288",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 600716,
            "range": "± 8617",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8781463,
            "range": "± 748289",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 635,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 5266,
            "range": "± 57",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 142683,
            "range": "± 754",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21154,
            "range": "± 126",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 150341,
            "range": "± 3440",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1405125,
            "range": "± 10945",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "bcc6d697b376889cb74a69443213742121f38862",
          "message": "feat(modify): wire --set-description flag + clearer modify usage (#359, #360) (#365)\n\nAgent-reported. `description` is a top-level base field but the CLI exposed no\n`--set-description` flag, so updating it forced `--set-field description=...`,\nwhich mutate then REJECTED with a hint pointing at a `--set-description` flag\nthat did not exist — a dead-end loop. The core (`ModifyParams.set_description`,\n`yaml_edit`) already applied it; only the clap wiring was missing.\n\n- `rivet modify <ID> --set-description \"<text>\"` now works (#360).\n- `rivet modify --help` shows `--set-*` examples + a note that positionals\n  (`modify <ID> status approved`) are not valid (#359; the bare clap error\n  still directs to --help, which now teaches the pattern).\n\nRegression test modify_applies_set_description_param. Verified end-to-end.\n\nImplements: REQ-136\nVerifies: REQ-136\nRefs: REQ-007\n\nCo-authored-by: Claude Opus 4.8 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-05-31T06:15:32-05:00",
          "tree_id": "d1cc4f36fd2c4f982dc6bd4c450198f343771d52",
          "url": "https://github.com/pulseengine/rivet/commit/bcc6d697b376889cb74a69443213742121f38862"
        },
        "date": 1780226542267,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84248,
            "range": "± 413",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 886953,
            "range": "± 12169",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14258448,
            "range": "± 784308",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2257,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25514,
            "range": "± 130",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 351090,
            "range": "± 3331",
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
            "value": 1462215,
            "range": "± 44436",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 161081,
            "range": "± 1370",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1918253,
            "range": "± 17961",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 28915607,
            "range": "± 1394277",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 132804,
            "range": "± 2138",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1155333,
            "range": "± 27794",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 16039868,
            "range": "± 1436505",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4324,
            "range": "± 21",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 62750,
            "range": "± 752",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 851732,
            "range": "± 16544",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 64053,
            "range": "± 2774",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 728476,
            "range": "± 3595",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 11629230,
            "range": "± 738575",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 751,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7097,
            "range": "± 64",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 117759,
            "range": "± 742",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23196,
            "range": "± 622",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 163941,
            "range": "± 1521",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1523616,
            "range": "± 32403",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "68bc025ea866af9213bac2cabde1256bcacafc5f",
          "message": "feat(validate): --min-severity display filter to cut advisory noise (#357) (#366)\n\nSelf-reported dogfooding finding. `rivet validate` printed every diagnostic\nregardless of severity — on rivet's own repo ~160 advisory warnings for 0\nerrors, burying anything actionable. `--fail-on` gates the exit code but still\nprints everything.\n\nNew `rivet validate --min-severity <error|warning|info>` displays only\ndiagnostics at or above the floor (text output). Counts + exit code are\nunchanged (computed from the full set); when the filter hides anything, a\none-line note reports \"showing N of M … at or above '<level>'\" so nothing is\nsilently dropped. Reuses the existing --fail-on severity parser.\n\nRegression test validate_min_severity_filters_display. Filed as REQ-137\n(implemented).\n\nImplements: REQ-137\nVerifies: REQ-137\nRefs: REQ-004\n\nCo-authored-by: Claude Opus 4.8 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-05-31T07:16:19-05:00",
          "tree_id": "a92621927d24a74a021179368d65d514e3435120",
          "url": "https://github.com/pulseengine/rivet/commit/68bc025ea866af9213bac2cabde1256bcacafc5f"
        },
        "date": 1780230202020,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 76571,
            "range": "± 419",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 955932,
            "range": "± 10369",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 15035134,
            "range": "± 876874",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1660,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 19535,
            "range": "± 508",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 369524,
            "range": "± 2094",
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
            "value": 1353415,
            "range": "± 13228",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 158359,
            "range": "± 382",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1874034,
            "range": "± 22568",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 41595777,
            "range": "± 2129837",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 120959,
            "range": "± 886",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1208130,
            "range": "± 17144",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 20709722,
            "range": "± 1456426",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3904,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 41047,
            "range": "± 92",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 801407,
            "range": "± 7236",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 54771,
            "range": "± 140",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 604179,
            "range": "± 3115",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 9962829,
            "range": "± 380668",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 631,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 5292,
            "range": "± 27",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 153275,
            "range": "± 773",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21240,
            "range": "± 68",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 152275,
            "range": "± 337",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1412298,
            "range": "± 9149",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "0d7cd91eab297ad48e133a4c144e565c92d160c2",
          "message": "docs(artifacts): mark REQ-136 implemented (modify --set-description merged) (#367)\n\nREQ-136 (#359/#360 modify ergonomics) shipped via #365. rivet validate PASS.\n\nRefs: REQ-136",
          "timestamp": "2026-05-31T08:16:34-05:00",
          "tree_id": "d8e282cc1447e9a4ac6b21d912d023c7fc2168d8",
          "url": "https://github.com/pulseengine/rivet/commit/0d7cd91eab297ad48e133a4c144e565c92d160c2"
        },
        "date": 1780233790587,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 83042,
            "range": "± 259",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 882182,
            "range": "± 17685",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13047850,
            "range": "± 944235",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2107,
            "range": "± 11",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26809,
            "range": "± 223",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 365133,
            "range": "± 1368",
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
            "value": 1448486,
            "range": "± 36794",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 161715,
            "range": "± 680",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1860895,
            "range": "± 17943",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 27462645,
            "range": "± 1321699",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 132460,
            "range": "± 838",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1155184,
            "range": "± 36566",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 12640018,
            "range": "± 180633",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4338,
            "range": "± 25",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60698,
            "range": "± 377",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 805137,
            "range": "± 3098",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 62188,
            "range": "± 167",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 713930,
            "range": "± 3746",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7641442,
            "range": "± 228207",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 769,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7404,
            "range": "± 95",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 113796,
            "range": "± 1008",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23831,
            "range": "± 295",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 171955,
            "range": "± 657",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1567954,
            "range": "± 25676",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "a1359faea669b803cbcdc4c083bd0430bb622b6f",
          "message": "fix(export): drop the localhost oEmbed discovery tag from static export (REQ-117) (#368)\n\nBug-hunt finding (path-url-leakage, 3/3 lens-confirmed). Every exported\nartifact page emitted an oEmbed discovery `<link>` pointing at\n`http://localhost:<port>` — meaningful for the live serve dashboard, but broken\nmetadata in `export --format html`, which is static and has no server (its\nRepoContext.port is 0). The tag is now emitted only when served (non-zero\nport). Verified on a real export: 0 oEmbed `<link>` tags, 0 `localhost:0`.\nPlaywright guard added. Filed as REQ-117 (implemented).\n\nImplements: REQ-117\nVerifies: REQ-117\nRefs: REQ-105\n\nCo-authored-by: Claude Opus 4.8 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-05-31T08:16:40-05:00",
          "tree_id": "5183c28fd40bfcd205a5de75f7a572d81fb6f6db",
          "url": "https://github.com/pulseengine/rivet/commit/a1359faea669b803cbcdc4c083bd0430bb622b6f"
        },
        "date": 1780234187935,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 83701,
            "range": "± 354",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 890166,
            "range": "± 12661",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14016170,
            "range": "± 587886",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2169,
            "range": "± 11",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26470,
            "range": "± 61",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 357110,
            "range": "± 6187",
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
            "value": 1457465,
            "range": "± 19724",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 163392,
            "range": "± 3490",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1905880,
            "range": "± 11855",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 27515348,
            "range": "± 1437990",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 132796,
            "range": "± 4480",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1145015,
            "range": "± 25189",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 16792030,
            "range": "± 2065962",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4428,
            "range": "± 19",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 61882,
            "range": "± 412",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 844038,
            "range": "± 3254",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 63021,
            "range": "± 351",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 714975,
            "range": "± 2610",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7901455,
            "range": "± 198225",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 767,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7340,
            "range": "± 145",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 119709,
            "range": "± 814",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23337,
            "range": "± 207",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 165296,
            "range": "± 907",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1516612,
            "range": "± 18657",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "27a8b0387056c72420f3584e5951805858fa2247",
          "message": "docs(REQ-135): record the base_fields root cause of the status-enum gap (#369)\n\nVerified iter-8: the merged Schema struct drops base-fields entirely (parsed\nonto SchemaFile, never retained by Schema::merge; .base_fields read nowhere).\nSo status can't be enum-validated regardless of allowed-values. Documents the\ntwo-part non-breaking mechanism fix (retain base_fields + validate status)\nthat the maintainer's canonical-set decision then activates.\n\nRefs: REQ-135",
          "timestamp": "2026-05-31T09:16:08-05:00",
          "tree_id": "14c9f03916a5b5937db183e34af73ed66663fcee",
          "url": "https://github.com/pulseengine/rivet/commit/27a8b0387056c72420f3584e5951805858fa2247"
        },
        "date": 1780237368477,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84194,
            "range": "± 538",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 924780,
            "range": "± 8929",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 18066449,
            "range": "± 1006992",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1996,
            "range": "± 10",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25014,
            "range": "± 65",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 361910,
            "range": "± 4401",
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
            "value": 1435717,
            "range": "± 21110",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 170611,
            "range": "± 907",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1955484,
            "range": "± 21277",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 32644146,
            "range": "± 1934303",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 127218,
            "range": "± 911",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1174194,
            "range": "± 15644",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 17113762,
            "range": "± 1731987",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4143,
            "range": "± 13",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 44761,
            "range": "± 166",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 777080,
            "range": "± 8164",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 64813,
            "range": "± 384",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 737163,
            "range": "± 4195",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 9037671,
            "range": "± 586961",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 768,
            "range": "± 10",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 6620,
            "range": "± 14",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 96878,
            "range": "± 778",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21513,
            "range": "± 76",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 147337,
            "range": "± 965",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1379652,
            "range": "± 15563",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "cfd7ac7189f822e9fbd2cc0394b85102e71609b1",
          "message": "feat(validate): retain base-fields + enforce the status enum when declared (REQ-135) (#370)\n\nRoot cause of the status-enum cluster (#352/#354/#355/#353), verified: the\nmerged `Schema` struct dropped `base-fields` entirely — parsed onto\n`SchemaFile`, never retained by `Schema::merge`, read nowhere. So `status` (a\nbase field, stored top-level as `artifact.status`) could never be enum-validated\nregardless of any declared `allowed-values`.\n\n- `Schema` now carries `base_fields`, unioned by name in `merge`.\n- `validate` checks `artifact.status` against the `status` base-field's\n  `allowed-values` when declared (rule `status-allowed-values`), on both the\n  salsa and `--direct` paths.\n- `remediation` adds a `status-allowed-values` arm (set-to-allowed /\n  widen-schema, \"did you mean\").\n\nNON-BREAKING: with no `allowed-values` declared (today's common.yaml) the check\nis inert — verified rivet's own validate is unchanged (PASS, same warnings).\nDeclaring the canonical lifecycle set in common.yaml (the maintainer's call)\nactivates enforcement. 2 regression tests + verified end-to-end (a typo'd\nstatus flags with full remediation; a valid one passes).\n\nImplements: REQ-135\nVerifies: REQ-135\nRefs: REQ-004\n\nCo-authored-by: Claude Opus 4.8 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-05-31T10:16:03-05:00",
          "tree_id": "89fffdcd9fd1e6fc21f7b70d0d4521eb10d64736",
          "url": "https://github.com/pulseengine/rivet/commit/cfd7ac7189f822e9fbd2cc0394b85102e71609b1"
        },
        "date": 1780240938759,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 67059,
            "range": "± 1246",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 723769,
            "range": "± 5552",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12191528,
            "range": "± 902947",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1469,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 18482,
            "range": "± 94",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 277076,
            "range": "± 1247",
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
            "value": 1121589,
            "range": "± 25710",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 128229,
            "range": "± 353",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1474865,
            "range": "± 20370",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 29762739,
            "range": "± 4303625",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 96187,
            "range": "± 2041",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 879728,
            "range": "± 20643",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 13306728,
            "range": "± 2896454",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3399,
            "range": "± 80",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 34428,
            "range": "± 836",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 577729,
            "range": "± 8498",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 48244,
            "range": "± 880",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 515227,
            "range": "± 3556",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7434593,
            "range": "± 788605",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 592,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 5129,
            "range": "± 55",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 78307,
            "range": "± 395",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 16500,
            "range": "± 56",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 111341,
            "range": "± 425",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1043280,
            "range": "± 4159",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "9ae05c2c539e3cd5290b5e1c9fc8c7af340198d1",
          "message": "feat(modify,add): reject a status outside the declared enum (REQ-135, #354) (#371)\n\nBuilds on the retained base-fields (REQ-135). `validate_add` and\n`validate_modify` now check the artifact's `status` (and `--set-status`) against\nthe `status` base-field's `allowed-values` when declared, rejecting an\nout-of-enum value at mutation time so a typo never reaches a file. The old stub\n(\"status is a base field and generally freeform, but we'll accept it\") is\nreplaced with a real, shared `check_status_allowed`. Inert when no enum is\ndeclared (free-form preserved). Regression test + verified end-to-end (a typo'd\n`--set-status` is rejected with the allowed set named).\n\nRemaining REQ-135 follow-up: `schema show` listing the status values (spans\nCLI + HTML render surfaces).\n\nImplements: REQ-135\nVerifies: REQ-135\nRefs: REQ-007\n\nCo-authored-by: Claude Opus 4.8 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-05-31T11:17:10-05:00",
          "tree_id": "32fc6519c2fe629d222bce9d10a3ee47e1a9ff65",
          "url": "https://github.com/pulseengine/rivet/commit/9ae05c2c539e3cd5290b5e1c9fc8c7af340198d1"
        },
        "date": 1780244627866,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85685,
            "range": "± 4112",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 923396,
            "range": "± 13271",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14240292,
            "range": "± 425586",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1947,
            "range": "± 10",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24925,
            "range": "± 81",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 363236,
            "range": "± 1671",
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
            "value": 1473857,
            "range": "± 16986",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 167471,
            "range": "± 2412",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1937728,
            "range": "± 59998",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 27995222,
            "range": "± 721323",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 123017,
            "range": "± 2391",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1142809,
            "range": "± 30867",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 14596564,
            "range": "± 866380",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4155,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 45048,
            "range": "± 133",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 784122,
            "range": "± 15806",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 59398,
            "range": "± 1179",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 720254,
            "range": "± 3215",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8006259,
            "range": "± 182853",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 793,
            "range": "± 56",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7149,
            "range": "± 48",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 99420,
            "range": "± 310",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21242,
            "range": "± 507",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 145518,
            "range": "± 1949",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1352639,
            "range": "± 21218",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "ef5455733c6d421b6fa3cde059bc7ed6a7feb53f",
          "message": "feat(validate): --explain <ID> — per-artifact traceability explanation (REQ-125) (#372)\n\n* feat(validate): --explain <ID> — per-artifact traceability explanation (REQ-125)\n\nDemanded independently by #349, #350, #358 (\"why is X (un)covered?\", \"rivet why\n<id> <rule>\"). `rivet validate --explain <ID>` shows, for one artifact: which\ntraceability rules target its type and whether each is satisfied — and HOW\n(e.g. \"satisfied by incoming 'satisfies' from FEAT-019\") or what's missing\n(\"needs an incoming 'satisfies' from one of [design-decision, feature]\") —\nplus its outgoing/incoming links and its own diagnostics with remediation.\n\nA focused single-artifact view: dispatch branches to `cmd_explain` before the\nfull validate run (no new param threaded through cmd_validate's 16). Reuses the\nsame forward/backward + inverse-name + alternate-backlink matching the coverage\nengine uses, so it agrees with `rivet coverage`. Verified end-to-end (a\nsatisfied and a missing artifact) + regression test.\n\nREQ-125 (the `coverage --explain <RULE>` surface remains a follow-up).\n\nImplements: REQ-125\nVerifies: REQ-125\nRefs: REQ-004\n\nCo-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>\n\n* style(test): fix clippy::doc_lazy_continuation on the --explain test doc\n\nA '+'-prefixed continuation line read as a list bullet; reworded. (Only\nsurfaces under clippy --all-targets, which CI runs but a plain -p check skips.)\n\nTrace: skip\n\n---------\n\nCo-authored-by: Claude Opus 4.8 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-05-31T13:36:06-05:00",
          "tree_id": "b5252ac38a978a1cdf94a11ca7668f1d3e4f4f65",
          "url": "https://github.com/pulseengine/rivet/commit/ef5455733c6d421b6fa3cde059bc7ed6a7feb53f"
        },
        "date": 1780252964637,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85842,
            "range": "± 890",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 914160,
            "range": "± 3994",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14486905,
            "range": "± 386848",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1940,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 23165,
            "range": "± 853",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 345355,
            "range": "± 1524",
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
            "value": 1459404,
            "range": "± 73186",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 167166,
            "range": "± 687",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1907597,
            "range": "± 40590",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 28400179,
            "range": "± 1245473",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 122913,
            "range": "± 921",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1130972,
            "range": "± 22671",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 14274377,
            "range": "± 344600",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4193,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 43199,
            "range": "± 149",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 752036,
            "range": "± 3745",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 63966,
            "range": "± 448",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 716742,
            "range": "± 4414",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8236493,
            "range": "± 439666",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 769,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7085,
            "range": "± 38",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 98076,
            "range": "± 1205",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21190,
            "range": "± 230",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 144711,
            "range": "± 824",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1345724,
            "range": "± 18465",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "de3d414e71a492b2585e53b498336112aebc688f",
          "message": "feat(list): --orphans — list artifacts disconnected from the traceability graph (REQ-128) (#373)\n\nThe orphan/\"asserted-but-unanchored\" detector (#358-adjacent; the epistemic\ncompanion to the incoming-links view already shipped in #364). `rivet list\n--orphans` keeps only artifacts with no inbound AND no outbound links — a\nrequirement no test verifies, a decision no hazard drives. Built on the\nexisting `LinkGraph::orphans`; composes with `--type` and `--format json`.\nVerified on rivet's own repo (surfaces 5 genuinely-disconnected artifacts);\nregression test asserts orphans are a subset of the full list. clippy\n--all-targets clean.\n\nREQ-128 (the inbound-link-count ranking report remains; kept draft).\n\nImplements: REQ-128\nVerifies: REQ-128\nRefs: REQ-007\n\nCo-authored-by: Claude Opus 4.8 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-05-31T14:18:03-05:00",
          "tree_id": "3e9161bb36738e192368b5a49efbffe8e518f52d",
          "url": "https://github.com/pulseengine/rivet/commit/de3d414e71a492b2585e53b498336112aebc688f"
        },
        "date": 1780255508464,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84781,
            "range": "± 350",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 927136,
            "range": "± 9708",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 17427450,
            "range": "± 1028534",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1944,
            "range": "± 16",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24916,
            "range": "± 48",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 363446,
            "range": "± 1442",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 245,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/1000",
            "value": 245,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 244,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1466894,
            "range": "± 14032",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 166436,
            "range": "± 611",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1922923,
            "range": "± 28632",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 27552336,
            "range": "± 581847",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 124310,
            "range": "± 1227",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1162811,
            "range": "± 16325",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 13476169,
            "range": "± 177758",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4249,
            "range": "± 14",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 44996,
            "range": "± 316",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 759766,
            "range": "± 11174",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 64255,
            "range": "± 2108",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 726832,
            "range": "± 4595",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 9118520,
            "range": "± 741928",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 784,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7133,
            "range": "± 49",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 98294,
            "range": "± 531",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 20985,
            "range": "± 111",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 144897,
            "range": "± 2010",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1346852,
            "range": "± 20222",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "fa5608415b60d4e10913885c782b684940709554",
          "message": "fix(reqif): directory import fails loudly on a corrupt file (REQ-120, F2) (#374)\n\nBug-hunt finding (f2-silent-failure, 3/3 lens-confirmed). `import_reqif_directory`\nskipped a malformed `.reqif`/`.xml` with only a `log::warn!` (often suppressed)\nand returned no signal to the caller — a silent partial import of interchange\ndata, exactly the trust-eroding class this codebase guards against.\n\nIt now collects every parse failure and returns an Err naming each file that\nfailed and was NOT imported, instead of dropping them silently. Valid-only\ndirectories are unaffected (existing test still green). Regression test\n`import_reqif_directory_fails_loudly_on_corrupt_file`.\n\nImplements: REQ-120\nVerifies: REQ-120\nRefs: REQ-004\n\nCo-authored-by: Claude Opus 4.8 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-05-31T15:54:13-05:00",
          "tree_id": "cf84e8835465060800340730e1e3bbfa1982b40d",
          "url": "https://github.com/pulseengine/rivet/commit/fa5608415b60d4e10913885c782b684940709554"
        },
        "date": 1780261248609,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 82866,
            "range": "± 2591",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 875960,
            "range": "± 16132",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 15442822,
            "range": "± 924234",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2182,
            "range": "± 17",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 27024,
            "range": "± 135",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 387416,
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
            "value": 1448713,
            "range": "± 21929",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 161593,
            "range": "± 6416",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1892684,
            "range": "± 24696",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 28304327,
            "range": "± 1403032",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 128689,
            "range": "± 1323",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1106134,
            "range": "± 28368",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 13550845,
            "range": "± 551799",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4256,
            "range": "± 18",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 62461,
            "range": "± 335",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 804678,
            "range": "± 3547",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 62026,
            "range": "± 716",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 696519,
            "range": "± 6209",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7864177,
            "range": "± 222887",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 777,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7261,
            "range": "± 40",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 121445,
            "range": "± 822",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22647,
            "range": "± 130",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 158617,
            "range": "± 620",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1501714,
            "range": "± 15956",
            "unit": "ns/iter"
          }
        ]
      }
    ]
  }
}