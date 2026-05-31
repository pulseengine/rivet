window.BENCHMARK_DATA = {
  "lastUpdate": 1780222955317,
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
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "669a8ecb52eae52381eae84c9ddeff5464dfeb9d",
          "message": "chore(deps): bump spar pin 84a7363 → v0.10.0 tag (#327)\n\nPromote from the pre-v0.9.0 dev sha to the signed v0.10.0 tag\n(afd5da2). API surface used by rivet-core/src/formats/aadl.rs\n(25 spar-analysis registrations + spar-hir Database) compiles\ncleanly and the AADL adapter tests pass against v0.10.0 unchanged.\n\nRelevant fixes inherited by rivet via this bump:\n  - hir-def: applies_to accepts feature paths (AADL v2.3, #219)\n  - hir-def: nested binding path resolution, 3+ levels (#214)\n  - assertion-eval: has() matches features (#217)\n  - assertion-eval: count() comparisons evaluate correctly (#218)\n  - classifier-match: same-direction delegation bus access (#216)\n  - codegen: --format wit emits only WIT, not workspace (#232)\n\nNew v0.10.x capabilities now available to rivet (used by aadl.rs\nonly as we surface them):\n  - emv2: error-propagation traversal across connection graph\n  - nc: piecewise-affine arrival curves; PMOO/LUDB via good_lp\n  - mermaid: classDiagram + requirementDiagram emitters\n  - trace-topology: Spar_Identity property set + PCAPNG/LLDP/gPTP\n    FrameSource / TopologySource / PtpTimeSource\n\nCargo.toml: pin tag = \"v0.10.0\" (was rev = \"84a7363\").\nCargo.lock: refreshed spar-hir, spar-analysis, spar-base-db,\nspar-hir-def, spar-network, spar-annex to v0.10.0.\n\nValidated:\n  - cargo check -p rivet-core: PASS\n  - cargo test -p rivet-core aadl: PASS (3 aadl_* + 2 schema tests)\n  - cargo test --workspace: PASS (1 spurious failure in\n    query_ids_format_matches_list_filter caused by simultaneous\n    branch-switching, re-ran cleanly in isolation: PASS)\n\nRefs: REQ-051\n\nCo-authored-by: Claude Opus 4.7 <noreply@anthropic.com>",
          "timestamp": "2026-05-25T06:11:40-05:00",
          "tree_id": "90dd46ec8f750ecc788a6f85ca613881be554cf7",
          "url": "https://github.com/pulseengine/rivet/commit/669a8ecb52eae52381eae84c9ddeff5464dfeb9d"
        },
        "date": 1779708016024,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84200,
            "range": "± 287",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 892344,
            "range": "± 8038",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 15996182,
            "range": "± 1212194",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2167,
            "range": "± 10",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26744,
            "range": "± 861",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 354565,
            "range": "± 8463",
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
            "value": 96,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 96,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1489954,
            "range": "± 11774",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 165094,
            "range": "± 4313",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1969377,
            "range": "± 16649",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 37806948,
            "range": "± 2847088",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 131910,
            "range": "± 1836",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1151377,
            "range": "± 26580",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 16880949,
            "range": "± 1574845",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4326,
            "range": "± 9",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60808,
            "range": "± 361",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 760798,
            "range": "± 16630",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 60526,
            "range": "± 446",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 701068,
            "range": "± 10903",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 11453976,
            "range": "± 299078",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 750,
            "range": "± 22",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 6765,
            "range": "± 46",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 119349,
            "range": "± 8018",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 24446,
            "range": "± 733",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 171092,
            "range": "± 5166",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1626616,
            "range": "± 94501",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "fce5dffcfd4c77a4e15d7693531725def8e4d19e",
          "message": "chore(release): align release pipeline with the synth reference (SBOM + SLSA + build-env) (#330)\n\nAdopts the standardized pulseengine release pattern (per the\n\"per-repo Claude agent\" brief): every release ships a CycloneDX SBOM,\na SLSA v1 build-provenance attestation, a signed SHA256SUMS, and a\nbuild-env record naming the toolchain it was produced with.\n\nRivet already had cosign-keyless SHA256SUMS signing; the missing legs\nwere the SBOM (must precede the sums so its digest is captured in the\nmanifest), the SLSA provenance step, the build-env record, and the\n`attestations: write` permission needed by attest-build-provenance.\n\nChanges\n-------\n\n1. Top-level permissions: add `attestations: write` alongside the\n   existing `contents: write` + `id-token: write`. Required by\n   actions/attest-build-provenance@v2.\n\n2. Asset staging directory: rename `release/` → `release-assets/`\n   to match the synth/spar/sigil/witness shared name. Pure cosmetic\n   (file paths are scoped to this job), but it makes the verification\n   one-liner in release notes copy-pasteable across repos.\n\n3. New step \"Install cargo-cyclonedx\" + \"Generate toolchain SBOM\n   (CycloneDX)\" — inserted BEFORE the SHA256SUMS step so the SBOM's\n   digest enters the manifest and the cosign signature transitively\n   covers it. Emits `release-assets/rivet-<bare-version>.cdx.json`\n   (no `v` prefix on the version per the brief).\n\n4. New step \"Generate SLSA build provenance\"\n   (actions/attest-build-provenance@v2) — runs AFTER the sums file\n   exists, attests every `release-assets/*.tar.gz` to GitHub's\n   attestation store. Consumers verify with:\n       gh attestation verify rivet-vX.Y.Z-<triple>.tar.gz \\\\\n         --repo pulseengine/rivet\n\n5. New step \"Capture build environment\" — emits\n   `release-assets/build-env.txt` with rustc, cargo, cosign, and\n   runner versions. Prerequisite for REQ-094 (`rivet release-verify`).\n\nFinal release-asset shape\n-------------------------\n\n    rivet-vX.Y.Z-<triple>.{tar.gz|zip}\n    rivet-X.Y.Z.cdx.json\n    SHA256SUMS.txt\n    SHA256SUMS.txt.sig\n    SHA256SUMS.txt.pem\n    SHA256SUMS.txt.cosign.bundle\n    build-env.txt\n    (plus VSIX + compliance bundle from existing jobs)\n\nVerification one-liners (paste into release notes)\n--------------------------------------------------\n\n    cosign verify-blob \\\\\n      --certificate-identity-regexp \\\\\n        'https://github.com/pulseengine/rivet/.github/workflows/release.yml@.*' \\\\\n      --certificate-oidc-issuer \\\\\n        'https://token.actions.githubusercontent.com' \\\\\n      --bundle SHA256SUMS.txt.cosign.bundle SHA256SUMS.txt\n\n    gh attestation verify rivet-vX.Y.Z-<triple>.tar.gz \\\\\n      --repo pulseengine/rivet\n\nRefs: REQ-068, REQ-094\n\nCo-authored-by: Claude Opus 4.7 <noreply@anthropic.com>",
          "timestamp": "2026-05-25T08:25:42-05:00",
          "tree_id": "6fc8b9f8ad2e4697e92d652fc5cf4d144705bfd7",
          "url": "https://github.com/pulseengine/rivet/commit/fce5dffcfd4c77a4e15d7693531725def8e4d19e"
        },
        "date": 1779715931621,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84929,
            "range": "± 652",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 917511,
            "range": "± 21621",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 15655075,
            "range": "± 981015",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1957,
            "range": "± 24",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25451,
            "range": "± 111",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 361748,
            "range": "± 1502",
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
            "value": 1465386,
            "range": "± 39105",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 169675,
            "range": "± 4733",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1939074,
            "range": "± 16287",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 27552219,
            "range": "± 1885336",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 127180,
            "range": "± 2975",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1182558,
            "range": "± 20131",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 13419892,
            "range": "± 138543",
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
            "value": 43970,
            "range": "± 164",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 764670,
            "range": "± 17231",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 65702,
            "range": "± 102",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 716231,
            "range": "± 2778",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8331905,
            "range": "± 299545",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 746,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 6571,
            "range": "± 32",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 97545,
            "range": "± 289",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22260,
            "range": "± 676",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 157270,
            "range": "± 1128",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1486791,
            "range": "± 62916",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
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
      }
    ]
  }
}