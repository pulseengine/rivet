window.BENCHMARK_DATA = {
  "lastUpdate": 1786492945096,
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
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "71c7a848c40a7fb50936859dfb6acf17ec7253a0",
          "message": "fix(verify): check verification-evidence no longer false-errors on nextest -E filtersets (REQ-280, #756) (#757)\n\nA downstream consumer (Ford linc-mesh, v0.30.0) hit 22 false \"no test\nmatching\" findings from `rivet check verification-evidence`. Steps whose\n`run` selects tests via a nextest filterset — e.g.\n`cargo nextest run -p x --lib -E 'test(/message::/)'` — were reported as a\nmissing test, wrongly blocking a `verified` requirement.\n\nRoot cause: parse_cargo_test_filter did not treat `-E`/`--filter-expr` as\nvalue-taking, so split_whitespace grabbed the filterset expression (literal\nquotes included) as a positional substring filter, then substring-matched it\nagainst bare `fn` names (which can never contain a `test(/re/)` string or a\n`mod::path` segment).\n\n- rivet-core: quote-aware tokenizer + `-E`/`--filter-expr` consumed as value\n  flags, so a filterset can never surface as a bogus positional filter, and\n  shell quotes are stripped from a real positional filter. Public API frozen.\n- rivet-cli: a filterset step is reported as SKIPPED (not verified) — a\n  skipped safety check must not read as a passed one — never errored.\n\nReproduced + regression-tested (rivet-core unit + rivet-cli integration).\nShips as v0.30.1. Real filterset evaluation tracked as REQ-281; the parallel\n`rivet sql` schema-discoverability finding as REQ-282.\n\nFixes: REQ-280\nRefs: REQ-236, REQ-281",
          "timestamp": "2026-08-04T21:09:00+02:00",
          "tree_id": "806b260776b1a3938fdd6ce41b6a2ddc12cde622",
          "url": "https://github.com/pulseengine/rivet/commit/71c7a848c40a7fb50936859dfb6acf17ec7253a0"
        },
        "date": 1785871654544,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84716,
            "range": "± 464",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 918110,
            "range": "± 4134",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 20572981,
            "range": "± 2084975",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1950,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24908,
            "range": "± 68",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 346128,
            "range": "± 1520",
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
            "value": 1522259,
            "range": "± 16668",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 168729,
            "range": "± 473",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 2026186,
            "range": "± 19138",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 53734172,
            "range": "± 4385773",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 456763,
            "range": "± 6900",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 16580460,
            "range": "± 1655058",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1144634392,
            "range": "± 23220023",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4287,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 46439,
            "range": "± 350",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 787279,
            "range": "± 3177",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 64223,
            "range": "± 1000",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 723660,
            "range": "± 4181",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 12070968,
            "range": "± 523718",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1180,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 13829,
            "range": "± 102",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 221938,
            "range": "± 1826",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21765,
            "range": "± 876",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 154035,
            "range": "± 3173",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1424316,
            "range": "± 6298",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "09a3eb26df832a3daac19b169aa84b2d5c46a221",
          "message": "feat(validate): --strict compliance-gate mode escalates field-value/name lint rules to errors (REQ-283) (#758)\n\nDownstream report (Ford linc-mesh): `rivet validate` PASS is used as a\ncompliance gate, but by default it proves only link integrity + required-field\npresence — a field value outside a schema `allowed-values` enum is only a\nWarning, and an undeclared field NAME only Info, so `validate` exits 0 over\nboth. The `status` field's enum was uniquely an Error, an asymmetry with every\nother field.\n\nPer the user's choice (opt-in over flipping defaults, since a project may carry\npre-existing violations — this repo has 5 allowed-values + 53 unknown-field, and\na hard-error default would break dogfood validate, same lesson as\n--strict-orphans):\n\n- Add `rivet validate --strict`: promotes `allowed-values` + `unknown-field`\n  diagnostics to Error before the PASS/FAIL + counts, so CI can enforce\n  field-value/name correctness. Default stays lenient.\n\nReproduced + regression-tested: default PASS over `category: banana` +\n`bogus_field`, `--strict` FAILs (exit 1) with both rules as errors. A persistent\n`rivet.yaml` `validate.strict` switch is a planned follow-on slice.\n\nImplements: REQ-283",
          "timestamp": "2026-08-04T21:36:46+02:00",
          "tree_id": "4ac7223753e4a9fc31b70b243cab494697d59e54",
          "url": "https://github.com/pulseengine/rivet/commit/09a3eb26df832a3daac19b169aa84b2d5c46a221"
        },
        "date": 1785872773178,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85185,
            "range": "± 964",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 891796,
            "range": "± 5861",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14751123,
            "range": "± 876087",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2109,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25322,
            "range": "± 1210",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 393409,
            "range": "± 2072",
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
            "value": 1513903,
            "range": "± 25079",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 164862,
            "range": "± 2996",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1900682,
            "range": "± 99520",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 27156979,
            "range": "± 1546735",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 467506,
            "range": "± 2265",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 16025659,
            "range": "± 197299",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1308221283,
            "range": "± 12083628",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4221,
            "range": "± 13",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 62164,
            "range": "± 894",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 764419,
            "range": "± 1957",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 58349,
            "range": "± 365",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 706574,
            "range": "± 7435",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8151058,
            "range": "± 650321",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1167,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 13785,
            "range": "± 83",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 326043,
            "range": "± 1878",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23119,
            "range": "± 89",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 159832,
            "range": "± 471",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1492777,
            "range": "± 29398",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "2129652bbae69f431bfaeeb67077b6c0f4e69e6d",
          "message": "chore(release): v0.31.0 — nextest-filterset fix + validate --strict + ordeal-certificate type (#760)\n\nConsolidates everything on main since v0.30.0 into a single minor release.\nTwo v0.31-targeted features (ordeal-certificate schema type #743, and\n`validate --strict` #758) had landed alongside the nextest-filterset fix that\nwas slated v0.30.1; a features-in-a-patch release would be a semver smell, so\nthe filterset fix is folded into v0.31.0 (REQ-280 release retargeted).\n\nAlso repairs the CHANGELOG: a prior rebase auto-merge had nested v0.30.0's\ncontent under a misplaced [0.30.1] header — the version sections are now\ncorrectly ordered.\n\nScope (all implemented + merged):\n- REQ-280 nextest -E filterset false-positive fix (#757, #756)\n- REQ-283 validate --strict compliance-gate mode (#758)\n- REQ-277 ordeal-certificate evidence artifact type (#743, #693)\n\nBumps workspace 0.30.1 -> 0.31.0 (rivet-core, rivet-cli, etch) + vscode-rivet.\n\nTrace: skip",
          "timestamp": "2026-08-05T08:49:24+02:00",
          "tree_id": "070dffb8625dd42ab2ec1a7cc8ee8ac4f9cf6ed5",
          "url": "https://github.com/pulseengine/rivet/commit/2129652bbae69f431bfaeeb67077b6c0f4e69e6d"
        },
        "date": 1785913413808,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 83652,
            "range": "± 346",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 912492,
            "range": "± 7763",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 17430583,
            "range": "± 1243415",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2198,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 27975,
            "range": "± 374",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 381353,
            "range": "± 3216",
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
            "value": 1520198,
            "range": "± 21685",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 162757,
            "range": "± 835",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1996899,
            "range": "± 12997",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 39778823,
            "range": "± 4081512",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 481108,
            "range": "± 2087",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 15839730,
            "range": "± 498676",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1265481257,
            "range": "± 13600115",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4673,
            "range": "± 13",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 59695,
            "range": "± 262",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 815371,
            "range": "± 13158",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 59869,
            "range": "± 172",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 698494,
            "range": "± 4477",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 9889713,
            "range": "± 814921",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1112,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14739,
            "range": "± 126",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 318314,
            "range": "± 1678",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22727,
            "range": "± 208",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 161135,
            "range": "± 906",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1511942,
            "range": "± 21601",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "e1a539fcbcb28b3eeff60ac5fca9db932c030760",
          "message": "plan(weak-green): file REQ-284/285/286 from the docs countercheck + release-status finding (#763)\n\nWeak-green audit outputs (green that proves less than it appears):\n- REQ-284 embedded-docs truth-drift — 8 divergences (docs.rs snippets +\n  json-output envelope contradict the binary); found by the docs countercheck.\n- REQ-285 rivet docs check should parse doc snippets + resolve doc-topic refs\n  (would have caught 6/8 of REQ-284 mechanically — the meta-fix).\n- REQ-286 rivet release status: be LOUD about which artifacts block a cut and\n  whether they're in-scope vs backlog (user-reported).\n\nAll proposed, release v0.32.0.\n\nTrace: skip",
          "timestamp": "2026-08-05T10:49:04+02:00",
          "tree_id": "5f616ba666bd7244fbead1699b4a6609f1d66bc6",
          "url": "https://github.com/pulseengine/rivet/commit/e1a539fcbcb28b3eeff60ac5fca9db932c030760"
        },
        "date": 1785920213916,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 67561,
            "range": "± 2504",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 835530,
            "range": "± 25039",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 10642419,
            "range": "± 194120",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1441,
            "range": "± 56",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 16101,
            "range": "± 513",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 260752,
            "range": "± 5937",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 68,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/1000",
            "value": 66,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 69,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1193878,
            "range": "± 46244",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 140474,
            "range": "± 3716",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1611359,
            "range": "± 29236",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 23615041,
            "range": "± 370312",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 378790,
            "range": "± 17921",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 12070154,
            "range": "± 340350",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 831299935,
            "range": "± 15730153",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3149,
            "range": "± 112",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 33943,
            "range": "± 1312",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 745272,
            "range": "± 9085",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 48775,
            "range": "± 1179",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 501545,
            "range": "± 12268",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 6139888,
            "range": "± 159935",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 780,
            "range": "± 17",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 9884,
            "range": "± 463",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 258837,
            "range": "± 4830",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 18495,
            "range": "± 554",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 128852,
            "range": "± 4536",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1182878,
            "range": "± 32105",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "7619b0d524fd2d7f3e9320c9f1ce98b99e5f0f53",
          "message": "build(deps): bump wasmtime 45->47 (fixes RUSTSEC-2026-0222); justify-ignore rkyv advisory (#762)\n\nRUSTSEC-2026-0222 (wasmtime: stores can mix up type indices between engines)\nis cleared by bumping wasmtime + wasmtime-wasi 45.0.3 -> 47.0.3. The host wasm\nseam still builds (`cargo build -p rivet-cli --features wasm` OK) — the bump is\nsource-compatible for rivet's single-engine usage.\n\nRUSTSEC-2026-0235 (rkyv 0.7 out-of-bounds reads) is added to the cargo-audit\nignore list with justification: rkyv is an OPTIONAL feature of rust_decimal\n(pulled via gluesql-core) that rivet does not enable, so it is a Cargo.lock\nentry only and is never compiled into any rivet binary. rust_decimal pins\nrkyv ^0.7, so it cannot advance to the fixed 0.8 line without an upstream bump.\n\nResult: `cargo audit` reports 0 vulnerabilities (2 allowed warnings remain:\ninstant unmaintained, scc) — the Security Audit gate goes green again.\n\nTrace: skip",
          "timestamp": "2026-08-05T11:48:26+02:00",
          "tree_id": "483b3a5d0ee77ea05baa2a7d98e4311a64a9941e",
          "url": "https://github.com/pulseengine/rivet/commit/7619b0d524fd2d7f3e9320c9f1ce98b99e5f0f53"
        },
        "date": 1785924082404,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84981,
            "range": "± 2496",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 925308,
            "range": "± 21685",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 19071206,
            "range": "± 1315923",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1979,
            "range": "± 29",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25260,
            "range": "± 1768",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 354863,
            "range": "± 2076",
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
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1531392,
            "range": "± 43945",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 168274,
            "range": "± 961",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1955338,
            "range": "± 21285",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 59897799,
            "range": "± 9733941",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 460187,
            "range": "± 9293",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 16790170,
            "range": "± 199462",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1188270736,
            "range": "± 22998568",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4290,
            "range": "± 78",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 46852,
            "range": "± 546",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 830359,
            "range": "± 18423",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 64597,
            "range": "± 322",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 724843,
            "range": "± 3104",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 9370249,
            "range": "± 823581",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1011,
            "range": "± 22",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14045,
            "range": "± 188",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 238264,
            "range": "± 4638",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22175,
            "range": "± 122",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 152108,
            "range": "± 2293",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1436823,
            "range": "± 11714",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "df780621fd6d4bb4f951a1d9b5376eb5df6bf094",
          "message": "fix(mutate): modify --add-tag no longer drops the whole file when a tag needs quoting (REQ-287, P0 data loss) (#765)\n\nMutation-path stress test (user report: \"we very often get into failures\"\nmodifying artifacts) found a P0 silent data-loss bug. yaml_edit.rs re-emitted\nthe tag flow list via `current_tags.join(\", \")` WITHOUT quoting individual\ntags — unlike the hardened setters (title/status/field, #687) and the `add`\npath (mutate.rs). A tag carrying a YAML flow indicator breaks: a legitimately\nquoted `\"release: v1.0\"`, read back from the store, was re-emitted bare\n(`release: v1.0`), turning the flow list into a map so the WHOLE FILE failed to\nparse — silently dropping EVERY artifact in it — while `modify` exited 0\nreporting success.\n\nReproduced: 2 artifacts -> a benign, unrelated `--add-tag simpletag` -> 0\nartifacts loadable. Same tag-mutation fragility class as #625, on the quoting\naxis.\n\nFix: quote each tag via `yaml_quote_inline_scalar` before joining, mirroring\nthe hardened `add` path. Also closes a silent-split variant (`--add-tag \"a,b\"`\nstored two tags). Regression test asserts both artifacts survive an unrelated\n--add-tag and the pre-existing quoted tag stays quoted. All 38 yaml_edit unit\ntests still pass.\n\nFixes: REQ-287\nRefs: REQ-203",
          "timestamp": "2026-08-05T11:50:13+02:00",
          "tree_id": "e4c0fd7627f9bd0912bc2133e66adc30892020af",
          "url": "https://github.com/pulseengine/rivet/commit/df780621fd6d4bb4f951a1d9b5376eb5df6bf094"
        },
        "date": 1785924189851,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 86579,
            "range": "± 2144",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 912106,
            "range": "± 8124",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 18437273,
            "range": "± 2387805",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2213,
            "range": "± 11",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 27618,
            "range": "± 304",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 347244,
            "range": "± 7873",
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
            "value": 1587383,
            "range": "± 18351",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 161595,
            "range": "± 638",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1976115,
            "range": "± 23041",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 37157747,
            "range": "± 6765600",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 489474,
            "range": "± 3261",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 16037128,
            "range": "± 368138",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1256920603,
            "range": "± 10556215",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4205,
            "range": "± 12",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 59292,
            "range": "± 431",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 754146,
            "range": "± 8629",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 61903,
            "range": "± 992",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 696340,
            "range": "± 6207",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 9911525,
            "range": "± 1252132",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1106,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14752,
            "range": "± 102",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 318050,
            "range": "± 5265",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 24141,
            "range": "± 152",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 169878,
            "range": "± 934",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1590777,
            "range": "± 18251",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "d2eff3f1532adb8cd5a085e1f90054508b84e45f",
          "message": "docs(fix): correct 8 embedded-doc snippets/claims that contradict the binary (REQ-284) (#764)\n\nWeak-green audit finding: `rivet docs check` validates token/format hygiene, so\nthese truth-drifts passed clean while every snippet errored on copy-paste.\n\n- json-output: replace the fictional `{command, data:{...}}` envelope with the\n  real flat top-level shape (no command emits a `data` wrapper); fix the stale\n  coverage recipe `.entries[]` -> `.rules[]`.\n- diagnostics/required-field, allowed-values, unknown-field: `modify --field`\n  -> `--set-field` (the real flag; `--field` errors).\n- diagnostics/known-type: drop `modify --type` (no such flag / no CLI\n  type-change) — point to editing `type:` in YAML.\n- diagnostics/broken-link: `rivet add requirement REQ-099 --title` ->\n  `rivet add --type requirement --title` (ids are auto-generated).\n- diagnostics/unknown-link-type: `rivet docs links` -> `rivet schema links`\n  (the real topic).\n\nMechanical hardening to catch this class is tracked as REQ-285.\n\nImplements: REQ-284",
          "timestamp": "2026-08-05T11:50:17+02:00",
          "tree_id": "beec84ba1c15ab548457ef1004352a667d80eea7",
          "url": "https://github.com/pulseengine/rivet/commit/d2eff3f1532adb8cd5a085e1f90054508b84e45f"
        },
        "date": 1785924309196,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85582,
            "range": "± 1904",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 910862,
            "range": "± 9441",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 16861587,
            "range": "± 805713",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2204,
            "range": "± 11",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26014,
            "range": "± 187",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 393913,
            "range": "± 9291",
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
            "value": 96,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1522484,
            "range": "± 12110",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 163018,
            "range": "± 506",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1987619,
            "range": "± 40250",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 37558781,
            "range": "± 1287617",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 464226,
            "range": "± 2871",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 15857894,
            "range": "± 142581",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1262846699,
            "range": "± 12179499",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4415,
            "range": "± 18",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60918,
            "range": "± 1234",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 784012,
            "range": "± 14466",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 61817,
            "range": "± 139",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 697193,
            "range": "± 3460",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 9186935,
            "range": "± 669180",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1080,
            "range": "± 9",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14905,
            "range": "± 773",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 349386,
            "range": "± 2864",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23750,
            "range": "± 145",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 168557,
            "range": "± 483",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1584699,
            "range": "± 29691",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "5c4b7a05c2bf59c686d92c671cfc6d703eecb494",
          "message": "chore(release): v0.32.0 — weak-green hardening + mutation reliability + security (#766)\n\nBumps workspace 0.31.0 -> 0.32.0 (rivet-core, rivet-cli, etch) + vscode-rivet.\n\nScope (all implemented + merged):\n- REQ-287 P0 data-loss fix: modify --add-tag no longer drops the whole file (#765)\n- REQ-284 embedded-docs truth-drift: 8 snippet/claim fixes (#764)\n- Security: wasmtime 45->47, RUSTSEC-2026-0222 cleared (#762)\n\nTrace: skip",
          "timestamp": "2026-08-05T12:29:54+02:00",
          "tree_id": "286e9e61943b7b3dbb40f69aea896c947664cf77",
          "url": "https://github.com/pulseengine/rivet/commit/5c4b7a05c2bf59c686d92c671cfc6d703eecb494"
        },
        "date": 1785926327613,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 86169,
            "range": "± 2166",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 913072,
            "range": "± 4032",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14229970,
            "range": "± 855294",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2100,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 27226,
            "range": "± 102",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 353774,
            "range": "± 1172",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 95,
            "range": "± 7",
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
            "value": 1527597,
            "range": "± 28385",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 161605,
            "range": "± 673",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1892853,
            "range": "± 16087",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 28066370,
            "range": "± 1393007",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 481100,
            "range": "± 1553",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 15349182,
            "range": "± 183950",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1252805026,
            "range": "± 12414292",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4299,
            "range": "± 13",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 61755,
            "range": "± 216",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 748543,
            "range": "± 4321",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 57670,
            "range": "± 210",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 696970,
            "range": "± 17151",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8283940,
            "range": "± 408101",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1084,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15117,
            "range": "± 148",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 322477,
            "range": "± 4110",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23739,
            "range": "± 865",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 167795,
            "range": "± 1492",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1583011,
            "range": "± 28423",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "ec436b89fb2c1e65cb1665308a6d066e91984fc9",
          "message": "chore(trace): flip REQ-284 proposed -> implemented (docs fixes shipped in #764) (#767)\n\nClean-room pre-tag audit for v0.32.0 caught REQ-284 left at 'proposed' while its\nembedded-doc corrections were already merged (#764). Status now matches shipped\nreality before the tag.\n\nTrace: skip",
          "timestamp": "2026-08-05T12:57:54+02:00",
          "tree_id": "209e0a7dd0f3f527d866ad39ac11b44f061467a6",
          "url": "https://github.com/pulseengine/rivet/commit/ec436b89fb2c1e65cb1665308a6d066e91984fc9"
        },
        "date": 1785928009796,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85813,
            "range": "± 3498",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 910565,
            "range": "± 11640",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 15855693,
            "range": "± 708696",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2170,
            "range": "± 63",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25746,
            "range": "± 78",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 362779,
            "range": "± 6539",
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
            "value": 1539975,
            "range": "± 41705",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 162612,
            "range": "± 6165",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1903964,
            "range": "± 46764",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 26746940,
            "range": "± 3241401",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 478748,
            "range": "± 6574",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 15313017,
            "range": "± 175118",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1205263250,
            "range": "± 14050349",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4426,
            "range": "± 31",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 64608,
            "range": "± 475",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 789789,
            "range": "± 4793",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 62448,
            "range": "± 1612",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 701193,
            "range": "± 2391",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8428521,
            "range": "± 300938",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1060,
            "range": "± 35",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15212,
            "range": "± 82",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 320777,
            "range": "± 5155",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 24213,
            "range": "± 70",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 170590,
            "range": "± 1154",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1593972,
            "range": "± 40282",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "f5592c6fba835f19bd98b20d1bf5509009eb6ab6",
          "message": "plan(v0.33): gate potency — make every required check able to fail (#772)\n\nScope for v0.33.0, themed \"a gate that cannot fail is not a gate\". Four findings\nported from spar's recent gate audit (spar#381/#383/#384/#388), each reproduced\nagainst rivet with direct evidence, plus the two meta-fixes already filed.\n\nNew (from the spar cross-check):\n- REQ-288 mutation gate reads a path cargo-mutants never writes (#768) — the\n  rivet-cli HARD gate has never read its own results; one core shard's real\n  missed.txt lists 5 survivors while CI printed 0.\n- REQ-289 Format gate misses the fuzz/ workspace (#769) — live drift in 5\n  tracked files `cargo fmt --all` never opens.\n- REQ-290 check verification-evidence runs in no workflow (#770) — rivet built\n  the checker for spar#388's exact rot and nothing enforces it.\n- REQ-291 changes-filter under-scoped + fails open (#771) — embedded schemas\n  (include_str!) skip the whole compile matrix; an errored git diff skips too.\n\nPulled into v0.33 (same weak-green family):\n- REQ-285 docs check parses snippets / resolves topics\n- REQ-286 release status is loud about what blocks a cut\n\nScope moved DELIBERATELY (release-planning: deferral is a decision, logged, not\nsilent). These were still tagged to already-cut releases:\n- REQ-274/275/276 (customer UI: trace tree view, tag filter, colour contrast)\n  v0.31.0 -> v0.34.0 — they have now slipped one release while infra work landed\n- REQ-281 (evaluate nextest filtersets), REQ-282 (sql --schema) v0.31.0 -> v0.34.0\n\nNo artifact now points at a cut release.\n\nTrace: skip",
          "timestamp": "2026-08-05T19:05:34+02:00",
          "tree_id": "30db069fb756f3c7c18c3d8bdb84599d69780ddd",
          "url": "https://github.com/pulseengine/rivet/commit/f5592c6fba835f19bd98b20d1bf5509009eb6ab6"
        },
        "date": 1785951395267,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 68694,
            "range": "± 686",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 811635,
            "range": "± 5668",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 10415676,
            "range": "± 64780",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1358,
            "range": "± 13",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 16053,
            "range": "± 31",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 250381,
            "range": "± 828",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 63,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/1000",
            "value": 63,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 63,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1194867,
            "range": "± 53462",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 140612,
            "range": "± 3752",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1585603,
            "range": "± 12502",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 22830789,
            "range": "± 60664",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 358370,
            "range": "± 6806",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 12117931,
            "range": "± 134405",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 832381931,
            "range": "± 4927408",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3402,
            "range": "± 76",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 36102,
            "range": "± 312",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 787802,
            "range": "± 3021",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 46483,
            "range": "± 104",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 505939,
            "range": "± 1611",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 6164014,
            "range": "± 224619",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 789,
            "range": "± 30",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 9861,
            "range": "± 168",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 286532,
            "range": "± 6275",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 18405,
            "range": "± 1460",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 129701,
            "range": "± 326",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1154294,
            "range": "± 6153",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "0e5345bb627d2e049529f6530b00dd27db94208a",
          "message": "docs(design): harvest 2 durable notes from the stale sphinx-needs branch (#777)\n\nThe `feat/import-results-sphinx-needs` worktree carried 10 unpushed commits\n(2 months old, base 86bf482, never PR'd). Most of its content already reached\nmain by another route — examples/score-conversion is present, schemas/score.yaml\nis byte-identical, and sphinx-needs import ships as `import-results --format\nneeds-json` — so its 1344-line formats/sphinx_needs.rs is superseded and is NOT\nharvested. Its 7 design docs were absent from main; 2 are still durable:\n\n- eclipse-score-vs-pulseengine-approach.md — methodology comparison against\n  Eclipse S-CORE; positioning context behind schemas/score.yaml, not\n  invalidated by code drift.\n- externals-kind-source.md — proposes `externals.<name>.kind: source`\n  (clone-only for non-rivet upstreams). Still unimplemented; names a live\n  symptom (58 WARN lines per validate in the eclipse-score fork) and estimates\n  ~30 lines in rivet-core/src/externals.rs.\n\nDropped as superseded/obsolete: sphinx-needs-rowan-v2 and\nsphinx-needs-rust-port-v1.2-catchup (plans for the implementation that never\nlanded), rivet-link-parse-bug (that bug is REQ-091, fixed in v0.13.1),\nartifact-embed-with-fields and variant-subsystem-eclipse-evidence (kept out for\nnow — the variant subsystem has moved substantially since REQ-265a-d).\n\nBoth carry a dated provenance banner marking them HISTORICAL notes whose claims\nhave not been re-verified — importing them as current documentation would be the\nsame doc-truth-drift class fixed in REQ-284.\n\n`rivet docs check` caught two stale illustrative YAML blocks on import\n(ConfigExampleFreshness): an `...  # 57 more` placeholder and `← NEW:` arrow\nannotations that made the blocks unparseable. Fixed the blocks to be valid YAML\nrather than relabelling the fence, so the freshness invariant keeps checking\nthem. docs check now PASS (64 files, 0 violations).\n\nTrace: skip",
          "timestamp": "2026-08-06T08:59:07+02:00",
          "tree_id": "fd5513303590cf74d54f12c9a1859f7807b1cfa3",
          "url": "https://github.com/pulseengine/rivet/commit/0e5345bb627d2e049529f6530b00dd27db94208a"
        },
        "date": 1786000309798,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85159,
            "range": "± 362",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 907794,
            "range": "± 9578",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 16793506,
            "range": "± 887678",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2169,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26445,
            "range": "± 89",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 376554,
            "range": "± 1947",
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
            "value": 1524158,
            "range": "± 26130",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 161708,
            "range": "± 754",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1960224,
            "range": "± 37859",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 35984223,
            "range": "± 2951169",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 476116,
            "range": "± 2813",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 15405982,
            "range": "± 276387",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1243576500,
            "range": "± 10874786",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4479,
            "range": "± 23",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 64166,
            "range": "± 286",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 868892,
            "range": "± 5357",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 62468,
            "range": "± 259",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 697583,
            "range": "± 4563",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 9473911,
            "range": "± 517871",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1190,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 16080,
            "range": "± 61",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 366305,
            "range": "± 13619",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 24397,
            "range": "± 129",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 170559,
            "range": "± 2360",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1580475,
            "range": "± 10574",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "c8eb44fa3dfcf6412a7cc6a145979020bd41e055",
          "message": "ci(fmt): check every workspace in the Format gate, not just the root (#769) (#774)\n\n`cargo fmt --all -- --check` at the repo root formats every member of\nTHE root workspace, not every crate in the repo. rivet has two\n[workspace] manifests (root + fuzz/) plus the standalone\ncompose-witness/ package (its own Cargo.lock, excluded from root), so\nthe Format gate has been vacuous for the fuzz workspace since it was\nadded. Live on HEAD before this change:\n\n    $ cargo fmt --all -- --check                            ; echo $?\n    0\n    $ cargo fmt --manifest-path fuzz/Cargo.toml --all -- --check ; echo $?\n    1\n    Diff in fuzz/examples/oracle_smoke.rs:44\n    Diff in fuzz/examples/oracle_smoke.rs:258\n    Diff in fuzz/fuzz_targets/artifact_ids.rs:38\n    Diff in fuzz/fuzz_targets/artifact_ids.rs:66\n    Diff in fuzz/fuzz_targets/cli_argv.rs:188\n    Diff in fuzz/fuzz_targets/yaml_footguns.rs (bonus — not in issue)\n\nFix: derive the workspace list from\n`grep -rl '^\\[workspace\\]' --include=Cargo.toml` and check each, so a\nnewly added nested workspace can't silently escape the gate. Also\ncovers the same-shape bug in scripts/pre-commit and scripts/install-hooks.sh\n(local convenience hooks — CI is still the real gate per REQ-051).\n\ncompose-witness/ is a standalone Wasm-component package that cargo fmt\ncan't traverse (its `bindings` module is generated at build time by\ncargo-component); rustfmt with skip_children handles it without a\nbuild.\n\nNegative control against a synthetic drift in fuzz/:\n- old gate: exit 0 (vacuous green)\n- new gate: exit 1 (drift caught)\n\nFixes: REQ-289\nRefs: #769\n\n\nClaude-Session: https://claude.ai/code/session_014NmwwtE8WWfcTLsfNNKfLC\n\nCo-authored-by: Claude <noreply@anthropic.com>",
          "timestamp": "2026-08-06T08:59:14+02:00",
          "tree_id": "891dc98b00d0c470f09fb284180ea22ec8fd080c",
          "url": "https://github.com/pulseengine/rivet/commit/c8eb44fa3dfcf6412a7cc6a145979020bd41e055"
        },
        "date": 1786000455656,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 86253,
            "range": "± 526",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 912480,
            "range": "± 6561",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14060165,
            "range": "± 1238650",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2197,
            "range": "± 52",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26496,
            "range": "± 112",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 384890,
            "range": "± 1766",
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
            "value": 1531452,
            "range": "± 22725",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 162187,
            "range": "± 1764",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1959544,
            "range": "± 16518",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 28821433,
            "range": "± 1949665",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 470055,
            "range": "± 6796",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 15284579,
            "range": "± 342669",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1242674615,
            "range": "± 15555472",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4484,
            "range": "± 31",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 59434,
            "range": "± 311",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 789056,
            "range": "± 7851",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 59905,
            "range": "± 288",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 704685,
            "range": "± 4336",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 10664234,
            "range": "± 882698",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1155,
            "range": "± 21",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14478,
            "range": "± 120",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 327546,
            "range": "± 2462",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 24411,
            "range": "± 314",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 171485,
            "range": "± 2538",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1580745,
            "range": "± 19631",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "0d42ce1cf8024c63b83ca4e95045a661123ce6fd",
          "message": "ci(traceability): wire rivet check verification-evidence + kill weak-green empty scan (#770) (#776)\n\nCloses #770. Second implementation slice of v0.33 \"gate potency\" (after #773\nmutation-gate). Two fixes for a single defect: the anti-rot check for stale\n`cargo test <filter>` names existed but was unenforced.\n\n## The unenforced anti-rot check\n\n`rivet check verification-evidence` (REQ-236, hardened again in REQ-280 for\nnextest filtersets) catches the class spar#388 found — verification steps whose\n`fields.steps[].run: \"cargo test … <filter>\"` names a test that no longer\nexists. `cargo test <renamed_or_typod>` exits 0 with \"0 passed\", so the\nrequirement keeps its `verified` status. rivet BUILT the checker for exactly\nthat shape, and `grep verification-evidence .github/workflows/*.yml` returned\nnothing — no workflow ran it. Protection was opt-in-by-memory.\n\n## The weak-green empty-scan case\n\nOn a project whose steps carry no `cargo test <filter>` runs (or has no steps\nat all), the pre-fix text was:\n\n    ✓ verification-evidence: 0 named-test step(s) all reference an existing test.\n\nA checkmark over nothing checked — the same weak-green shape the check exists\nto kill.\n\n## Fixes\n\n- `.github/workflows/ci.yml`: add `rivet check verification-evidence` to the\n  Traceability job (REQ-051 dogfooding gate) and to `traceability-hosted-fallback`\n  (REQ-272 / #509 SPOF mitigation), so a self-hosted-pool outage still leaves\n  main gated on the anti-rot check. Reuses the release binary the neighboring\n  `validate` step already built — no extra compile cost.\n- `rivet-cli/src/main.rs cmd_check_verification_evidence`: an `empty_scan`\n  branch renders as `⚠ verification-evidence: no named-test step(s) found to\n  check — nothing was verified.` (with a plain sentence explaining what the\n  check would look for), instead of the ✓ / \"all reference an existing test\"\n  shape. JSON output gains `empty_scan: true` in that branch so a machine can\n  distinguish the vacuous case from a genuine pass. Exit code stays 0 (nothing\n  was violated) — this preserves the pre-fix contract used by callers and by\n  the new CI step.\n\nTwo regression tests in `rivet-cli/tests/cli_commands.rs` pin both directions:\n\n- `check_verification_evidence_empty_scan_reads_as_vacuous_not_pass` — a\n  project whose only steps are `make lint` / `pytest -k` (parsed by neither\n  the cargo nor the nextest branch) produces stdout that does NOT contain the\n  ✓ / \"all reference an existing test\" shape and JSON with `empty_scan: true`.\n- `check_verification_evidence_non_empty_scan_still_reads_as_pass` — a real\n  `cargo test -p p a_real_test` step still renders as ✓ /\n  \"all reference an existing test\" and JSON `empty_scan: false`. Guards the\n  new branch against shadowing the genuine-pass shape.\n\n## Acceptance criteria (from the issue body → how satisfied)\n\n- [x] **Add `rivet check verification-evidence` to the Traceability job in\n  `ci.yml` (it is fast and needs no compile beyond the binary already built\n  there).** Added as `Gate 1c` in the `traceability` job, after `validate`\n  and `variant + binding validation`, before `commits`. Mirrored on\n  `traceability-hosted-fallback` so the SPOF mitigation (REQ-272 / #509)\n  covers it too.\n- [x] **Reword the zero-steps case so an empty scan does not render as a\n  pass.** New `empty_scan` branch in `cmd_check_verification_evidence`:\n  distinct `⚠` prefix, explicit \"nothing was verified\" wording, `empty_scan:\n  true` in JSON. Pinned by regression tests in both directions.\n\nREQ-290 flipped `proposed → implemented`. CHANGELOG entry added under\n`[Unreleased]`. No behavior change to callers depending on missing-test\ndetection (exit code / JSON shape preserved except for the added\n`empty_scan` field).\n\n## Test plan\n\n- [x] `cargo test -p rivet-cli --test cli_commands check_verification_evidence`\n      — 4/4 pass (2 pre-existing + 2 new)\n- [x] `cargo test -p rivet-cli --test cli_commands` — 162/162 pass\n- [x] `cargo fmt --all -- --check` clean\n- [x] `cargo clippy -p rivet-cli --tests -- -D warnings` clean (only the\n      pre-existing MSRV note from `clippy.toml`)\n- [x] `./target/release/rivet check verification-evidence` on this repo —\n      renders as `⚠ … no named-test step(s) found to check` (this repo has no\n      such steps today), exits 0 → the new CI step is green on HEAD\n- [x] `./target/release/rivet validate` on this repo — PASS (635 warnings,\n      unchanged; REQ-290 now shows in the \"no downstream artifacts\" set,\n      same shape as its neighbors)\n\n## What this PR is NOT\n\n- Not a change to the `missing` detection path — the same fn-name scanner runs\n  over the same artifact walk. Only the empty-scan render + the CI wiring\n  changed.\n- Not a change to the exit-code contract. An empty scan still exits 0. If a\n  future policy decision wants an empty scan to be RED (e.g. \"a project\n  claiming verification coverage MUST have at least one named-test step\"),\n  that is a separate REQ.\n- Not a fix for #771 (`changes` filter under-scoped) or #557 (crates.io\n  publishing). Same v0.33 slice, separate PRs.\n\nImplements: REQ-290\nFixes: REQ-290\nRefs: #770, REQ-236, REQ-280, REQ-272, REQ-051\n\n\nClaude-Session: https://claude.ai/code/session_01UD5As6pYghNkKHHZkiLyCG\n\nCo-authored-by: Claude <noreply@anthropic.com>",
          "timestamp": "2026-08-06T08:59:20+02:00",
          "tree_id": "5e054ed60e823d3b9da0e0b26fbb7984de1b979d",
          "url": "https://github.com/pulseengine/rivet/commit/0d42ce1cf8024c63b83ca4e95045a661123ce6fd"
        },
        "date": 1786000517627,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85695,
            "range": "± 3340",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 912524,
            "range": "± 4411",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14716071,
            "range": "± 994388",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2183,
            "range": "± 37",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 27237,
            "range": "± 395",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 378903,
            "range": "± 5588",
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
            "value": 1527604,
            "range": "± 30494",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 164069,
            "range": "± 4893",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1965903,
            "range": "± 12147",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 30628120,
            "range": "± 2279443",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 469848,
            "range": "± 4967",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 15456198,
            "range": "± 201540",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1240216114,
            "range": "± 13116767",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4678,
            "range": "± 57",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 64077,
            "range": "± 397",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 804162,
            "range": "± 13721",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 60625,
            "range": "± 325",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 686899,
            "range": "± 21852",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8058852,
            "range": "± 740843",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1147,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14139,
            "range": "± 136",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 326351,
            "range": "± 9521",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23784,
            "range": "± 95",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 172541,
            "range": "± 3997",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1592859,
            "range": "± 19960",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "ebf08dbb045c5d59289f5209ebce3a90d1027e0e",
          "message": "ci(mutants): make the mutation gate able to fail — correct path, honest selector, diff scope (REQ-288) (#773)\n\nThe rivet-cli \"hard gate\" has never been able to fail. Three compounding bugs:\n\n1. WRONG RESULTS PATH. cargo-mutants writes its report to <--output>/mutants.out/,\n   but the gate read `mutants-out/missed.txt` — a path that has never existed. The\n   -f test was always false, MISSED stayed 0, `0 -gt 0` false, exit 0 regardless of\n   survivors. Evidence: artifact mutants-report-rivet-core-13-of-16's real\n   missed.txt lists 5 survivors while the job printed \"Surviving mutants: 0\".\n\n2. EMPTY TEST SELECTOR. The gate ran `-- --lib`, but rivet-cli is a pure binary\n   crate: `cargo test -p rivet-cli --lib` errors with \"no library targets found\".\n   No test ever exercised any mutant, and the crate's 29 integration test files\n   were excluded by construction.\n\n3. UPLOAD GLOBS NEVER MATCHED. `mutants-out/*.txt|*.json` under a report that\n   lives in mutants-out/mutants.out/, with if-no-files-found: warn. No\n   mutants-report-rivet-cli-* artifact has ever been produced, in any run.\n\nFixes:\n- read mutants-out/mutants.out/{missed.txt,outcomes.json}; fix upload globs\n- MISSING EVIDENCE IS RED: absent outcomes.json fails loudly instead of\n  defaulting to a clean 0 (also covers a crashed run scoring as a good one)\n- drop `-- --lib` so the integration suite is the oracle\n- scope the per-PR gate with `--in-diff`: rivet-cli has 4311 mutants, far past\n  this job's 45-minute budget, which is how it came to point at an empty\n  selector. Diff scoping asks the question that matters per PR — is the code\n  this PR changed covered? Full scope stays on the nightly path.\n- same path fix applied to mutants-core (nightly, continue-on-error, so honest\n  numbers surface without blocking)\n\nNegative control (the point of this REQ) — old vs new against real layouts:\n  report with 2 survivors: old exit 0 (vacuous green), new exit 1\n  crashed run, no report:  old exit 0, new exit 1 (refuses to pass)\n\nPorted from spar#381; rivet's variant was worse (2 and 3 are rivet-only).\n\nFixes: REQ-288\nRefs: REQ-289, REQ-290, REQ-291",
          "timestamp": "2026-08-06T08:59:27+02:00",
          "tree_id": "f4f14bddd803bd301e839ca19255b14220689aa6",
          "url": "https://github.com/pulseengine/rivet/commit/ebf08dbb045c5d59289f5209ebce3a90d1027e0e"
        },
        "date": 1786000525104,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 86178,
            "range": "± 2982",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 923257,
            "range": "± 9673",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 16146555,
            "range": "± 943038",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2194,
            "range": "± 13",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25363,
            "range": "± 810",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 399654,
            "range": "± 4042",
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
            "value": 1530966,
            "range": "± 32148",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 163764,
            "range": "± 2272",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1956304,
            "range": "± 20029",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 25511004,
            "range": "± 1350702",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 479807,
            "range": "± 17942",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 15349514,
            "range": "± 512138",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1228603071,
            "range": "± 10116949",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4371,
            "range": "± 131",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 58999,
            "range": "± 386",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 765672,
            "range": "± 6227",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 60924,
            "range": "± 615",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 697709,
            "range": "± 4642",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7525566,
            "range": "± 212947",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1186,
            "range": "± 9",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14341,
            "range": "± 90",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 327653,
            "range": "± 5792",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 25084,
            "range": "± 346",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 168774,
            "range": "± 725",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1582201,
            "range": "± 18073",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "b42a89ee45380cf5f4db039a96d550708461b4d7",
          "message": "fix(yaml-hir): preserve plain-scalar field values that contain commas (#747) (#749)\n\nThe CST lexer breaks plain scalars at `,`, `]`, `}` (see\n`lex_plain_scalar` in yaml_cst.rs) so a value like\n\n    test-name: tests::a, tests::b\n\nlands in the Value node as three sibling tokens\n(`tests::a` / `, ` / `tests::b`). `scalar_text` already handles this\nvia `next_sibling_or_token`, but `node_to_yaml_value` — the path\ntaken for `fields.*` and unknown top-level keys — read only the\nfirst token and returned `\"tests::a\"`. The trailing evidence was\nsilently discarded and rendered identically to a value that had\nonly ever claimed one test.\n\nRoute the plain-scalar branch through `scalar_text` so the sibling\ntokens the lexer split are reassembled before type inference. Quoted\nscalars are unaffected (they arrive as a single token). Two\nregression tests cover the `fields.*` path and the\nunknown-top-level-key fallthrough that share this code.\n\nFixes: REQ-028\nRefs: #747\n\nCo-authored-by: Claude <noreply@anthropic.com>",
          "timestamp": "2026-08-06T09:00:44+02:00",
          "tree_id": "6b14e571f7beb624f67d3974a2a56352bbb8a8f2",
          "url": "https://github.com/pulseengine/rivet/commit/b42a89ee45380cf5f4db039a96d550708461b4d7"
        },
        "date": 1786000575232,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 86843,
            "range": "± 1776",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 917795,
            "range": "± 4265",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 16218877,
            "range": "± 1150320",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2006,
            "range": "± 10",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24918,
            "range": "± 330",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 365180,
            "range": "± 1939",
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
            "value": 1516756,
            "range": "± 20569",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 166877,
            "range": "± 2560",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 2004574,
            "range": "± 9611",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 37477210,
            "range": "± 2997642",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 450378,
            "range": "± 1459",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 15147018,
            "range": "± 380730",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1096219356,
            "range": "± 19043109",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4278,
            "range": "± 9",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 45751,
            "range": "± 411",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 818615,
            "range": "± 5884",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 62335,
            "range": "± 693",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 730322,
            "range": "± 3066",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 10020335,
            "range": "± 1093374",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1134,
            "range": "± 33",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 13988,
            "range": "± 137",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 222696,
            "range": "± 3110",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23109,
            "range": "± 48",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 161482,
            "range": "± 518",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1482496,
            "range": "± 18755",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "7ceddefef107c4cf4bbd7ea59402cb5302bbabba",
          "message": "fix(ci): mutation gate must not fail on an empty diff or a shallow base (REQ-288 follow-up) (#784)\n\nMy REQ-288 change (#773) made the rivet-cli mutation gate able to fail — and it\npromptly failed on #779 for the wrong reason, blocking the queue. Three defects,\nall mine:\n\n1. SHALLOW CHECKOUT. `--in-diff` needs the PR base commit present locally, but\n   the job checks out without `fetch-depth: 0`, so `git diff <base>...HEAD`\n   could not resolve the base.\n\n2. THE FAILURE WAS SWALLOWED. That diff ran as `... > pr.diff || true`, so the\n   error became an empty pr.diff instead of a stop — the exact silent-swallow\n   anti-pattern this whole v0.33 line of work exists to remove, committed by me\n   while removing it elsewhere.\n\n3. EMPTY DIFF READ AS MISSING EVIDENCE. cargo-mutants writes no report when\n   there is nothing to mutate, so the \"absent outcomes.json is RED\" guard fired\n   on the legitimate no-Rust-changes case.\n\nFixes:\n- `fetch-depth: 0` on the mutants-cli checkout\n- the diff step now fails loudly (`::error::` + exit 1) when the base cannot be\n  resolved, rather than proceeding over an unknown diff\n- an empty diff short-circuits to PASS in both the run and the check steps\n\nConfirmed with a negative control over the check logic:\n  empty diff              -> PASS (nothing to mutate)\n  diff + report, 2 missed -> FAIL (gate bites)\n  diff + no report        -> FAIL (missing evidence)\nyamllint clean.\n\nRefs: REQ-288",
          "timestamp": "2026-08-07T06:54:30+02:00",
          "tree_id": "1494bb37e236beb674faecd958b92350e2697255",
          "url": "https://github.com/pulseengine/rivet/commit/7ceddefef107c4cf4bbd7ea59402cb5302bbabba"
        },
        "date": 1786080639343,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85196,
            "range": "± 965",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 915633,
            "range": "± 10315",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 16784577,
            "range": "± 1079233",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1967,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24563,
            "range": "± 81",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 362237,
            "range": "± 5530",
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
            "value": 1528477,
            "range": "± 23345",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 166862,
            "range": "± 558",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 2003276,
            "range": "± 32033",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 36831033,
            "range": "± 3552170",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 447427,
            "range": "± 3365",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 15418593,
            "range": "± 195796",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1086538058,
            "range": "± 22802567",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4212,
            "range": "± 33",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 46393,
            "range": "± 285",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 814132,
            "range": "± 41268",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 62227,
            "range": "± 216",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 724401,
            "range": "± 4488",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 9194817,
            "range": "± 394252",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1233,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 13946,
            "range": "± 80",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 228814,
            "range": "± 1741",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22384,
            "range": "± 856",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 156883,
            "range": "± 1349",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1466209,
            "range": "± 25242",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "bcee66720450fbbfcb58151e0a7fd6ad5b2d40ee",
          "message": "fix(serve): externals precede locals in /artifacts pagination (#778) (#779)\n\nThe `/api/v1/artifacts` handler pushes externals BEFORE locals into the\nresults vector so the pagination window (`limit`, capped at 1000) cannot\nsilently drop externals off the tail.\n\n## Root cause\n\n`api_artifacts_external_excluded_under_variant_scope` (REQ-265b) went\nred on main after commit 3d03ee3 (#743, ordeal-certificate schema) pushed\nrivet's local-artifact count past 996. With local_count = 1002 + 4 spar\nexternals = 1006 total, the `.take(1000)` truncation cut off every\n`external:spar` row — the response body carried 1000 rows all\n`origin=local`, indistinguishable from the classifier failing.\n\nThe classifier itself is correct — the loop that pushes externals sets\n`origin: ext_origin.clone()` (`external:<prefix>`), which appears\nunchanged when queried directly via `?origin=external:spar`. What broke\nwas the assembly order: locals were pushed first, then externals were\nappended and immediately truncated.\n\n## Fix\n\nSwap the two loops so externals go into `results` first. Externals are a\nsmall set by construction (separate projects, dozens at most), so this\nordering keeps them consistently visible in any reasonable page without\na special-case pagination path or a raised limit cap.\n\nAlso lifts the `origin` grammar into two helpers so the emission site\nand the `by_origin` map key cannot desync:\n- `LOCAL_ORIGIN: &str = \"local\"`\n- `external_origin(prefix: &str) -> String` → `\"external:<prefix>\"`\n\n## Tests\n\nThree new unit tests in `serve::api::tests` — matching the issue's ask\nfor a direct classifier-level unit test so a regression doesn't have to\ntravel through a full serve integration test to be noticed:\n\n- `external_origin_matches_query_grammar` — the emitted origin string\n  matches the `?origin=external:<prefix>` filter grammar clients query on\n- `local_origin_is_the_string_local` — pins the `LOCAL_ORIGIN` constant\n- `externals_precede_locals_in_result_order` — builds the concrete\n  `Vec<ApiArtifact>` the handler assembles (4 externals + 1002 locals),\n  applies the 1000-cap slice, and asserts all four externals survive AND\n  no local precedes any external in the page.\n\nThe existing integration test `api_artifacts_external_excluded_under_variant_scope`\nnow passes; full `cargo test -p rivet-cli` (546 tests) green;\n`cargo fmt --all -- --check` and `cargo clippy -p rivet-cli --all-targets -- -D warnings` clean.\n\n## Acceptance criteria (from the issue) → how satisfied\n\n- [x] `api_artifacts_external_excluded_under_variant_scope` passes\n      locally and on `main` again.\n- [x] REQ-265b's exclusion mechanism (variant-scope drops externals)\n      preserved — the `if include_externals && variant_scope.is_none()`\n      gate is unchanged; the same integration test verifies both the\n      unscoped-includes-externals AND scoped-excludes-externals halves.\n- [x] Direct unit test on the origin classification added.\n\nFixes: REQ-265\nRefs: #778, #743",
          "timestamp": "2026-08-07T06:54:37+02:00",
          "tree_id": "ad1c2ac6597feabfa606ded4c1c0be87c73fcc46",
          "url": "https://github.com/pulseengine/rivet/commit/bcee66720450fbbfcb58151e0a7fd6ad5b2d40ee"
        },
        "date": 1786081330242,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 86104,
            "range": "± 2935",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 920086,
            "range": "± 21084",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 16826358,
            "range": "± 768256",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2122,
            "range": "± 82",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25247,
            "range": "± 550",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 394489,
            "range": "± 11003",
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
            "value": 1552562,
            "range": "± 75975",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 166552,
            "range": "± 3974",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1926176,
            "range": "± 55710",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 26212962,
            "range": "± 2454615",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 459090,
            "range": "± 2736",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 15237474,
            "range": "± 197911",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1238765212,
            "range": "± 12261935",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4459,
            "range": "± 18",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 63259,
            "range": "± 375",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 789111,
            "range": "± 8986",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 58605,
            "range": "± 1395",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 702996,
            "range": "± 31128",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7778858,
            "range": "± 486962",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1117,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14392,
            "range": "± 212",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 322800,
            "range": "± 5010",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 24444,
            "range": "± 270",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 171918,
            "range": "± 827",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1597574,
            "range": "± 23521",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "bb2d0aa8f6ae1bbb2378b1ff1ea77fd5eaf2fe12",
          "message": "ci(changes): fail closed and derive embedded-asset build inputs (REQ-291) (#781)\n\nThe `changes` job's filter has three under-scoping bugs that let a real\nbuild-affecting edit skip the entire compile matrix (Clippy, Test, MSRV,\nSemver, Miri, Proptest, Coverage, wasm-seam). On GitHub, a SKIPPED\nrequired context is indistinguishable from a passed one.\n\n## The three misses\n\n1. **`schemas/*.yaml` are compiled INTO the binary**\n   `rivet-core/src/embedded.rs` pulls every shipped schema in with\n   `include_str!(\"../../schemas/…\")` (40+ entries). The old filter matched\n   only `(\\.rs$)|(Cargo\\.(toml|lock)$)|(^\\.github/workflows/)`, so a\n   schema-only PR — which changes compiled binary content and can break\n   the test suite — landed on `rust=false` and skipped the compile matrix.\n2. **`.github/actions/**` composite actions**\n   Only `.github/workflows/` was matched, so an edit to\n   `.github/actions/free-space/action.yml` (used BY the compile jobs)\n   didn't trigger them.\n3. **`git diff` errors → skip everything**\n   `changed=\"$(git diff --name-only \"$base\"...HEAD)\"` — a bad/absent\n   base sha or a shallow fetch left `changed` empty, nothing matched,\n   and the step exited 0 with rust=false. The error path was the\n   permissive path.\n\n## Fix — derive, don't retype; fail closed\n\n- **Derive** the embedded-asset file set from the source at gate time.\n  `grep` for every `include_str!`/`include_bytes!`/`include_dir!` in\n  `rivet-core` / `rivet-cli` / `etch`, resolve the path arg against the\n  containing file, and match changed files exactly. That auto-covers a\n  new `include_str!(\"…\")` a future PR adds — no filter-list drift.\n- **Add `.github/actions/`** to both the rust and wasm regexes.\n- **Fail closed.** An erroring or empty `git diff` now sets rust=true\n  AND wasm=true (running the full matrix) instead of silently skipping\n  every gate.\n\n## Verified locally\n\nSimulated the classifier against 9 representative paths — every result\nmatches expectation:\n\n  schema-only edit (schemas/dev.yaml)                 → rust=true\n  composite action (.github/actions/free-space/…)     → rust=true\n  embedded doc (docs/artifact-types/…-certificate.md) → rust=true\n  embedded quickstart (rivet-cli/src/quickstart.md)   → rust=true\n  regular .rs source                                  → rust=true\n  non-embedded design doc (…/status-gate-rules.md)    → rust=false\n  docs README, artifacts YAML                         → rust=false\n  empty diff                                          → rust=true (fail closed)\n\nPorted from spar#384.\n\nFixes: REQ-291\nRefs: #771\n\n\nClaude-Session: https://claude.ai/code/session_01Mjd85UePLRJVHtb8haBGF8\n\nCo-authored-by: Claude <noreply@anthropic.com>",
          "timestamp": "2026-08-11T21:37:42+02:00",
          "tree_id": "53f22ebcb4e9758bc8030ec97ef5d9bfb1019858",
          "url": "https://github.com/pulseengine/rivet/commit/bb2d0aa8f6ae1bbb2378b1ff1ea77fd5eaf2fe12"
        },
        "date": 1786478157756,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 86080,
            "range": "± 1550",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 905736,
            "range": "± 15739",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 16691436,
            "range": "± 1262502",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2148,
            "range": "± 30",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26372,
            "range": "± 929",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 354969,
            "range": "± 1422",
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
            "value": 1523938,
            "range": "± 40108",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 166560,
            "range": "± 779",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1973355,
            "range": "± 47327",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 31268155,
            "range": "± 2378750",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 479272,
            "range": "± 6965",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 15426580,
            "range": "± 279801",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1233269657,
            "range": "± 14615521",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4389,
            "range": "± 26",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 59394,
            "range": "± 581",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 800791,
            "range": "± 7936",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 62140,
            "range": "± 1393",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 729190,
            "range": "± 5540",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 11633412,
            "range": "± 780836",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1008,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14870,
            "range": "± 162",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 333778,
            "range": "± 1771",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 25028,
            "range": "± 330",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 175724,
            "range": "± 2978",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1610773,
            "range": "± 12212",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "c0eb34f266ef55d39d4cf9b2cf52e1f92c914ef1",
          "message": "fix(serve): don't silently swallow a failed external load (#778 follow-up) (#783)\n\n`load_externals` used `if let Ok(..)` with no `else`: when\n`load_external_project` failed, the external kept `synced: true` but got an\nEMPTY store. The dashboard then showed zero artifacts for that prefix with no\ndiagnostic anywhere — indistinguishable from an external that legitimately has\nnone.\n\nNow a load error is logged with the prefix and path, a successful-but-empty\nload warns (its rivet.yaml declares no sources, or they matched no files), and\na declared-but-unsynced external says so and points at `rivet sync`.\n\nScope note: this is hardening, NOT the #778 fix. #778 is pagination truncation\nand is fixed by #779 (externals precede locals). The external load has been\nsucceeding all along — the point here is that if it ever stops, it will say so\ninstead of degrading silently to \"no externals\". Salvaged from the closed #780.\n\nRefs: REQ-265",
          "timestamp": "2026-08-11T21:37:52+02:00",
          "tree_id": "ef1745b4d4035fbaac32a98ff063afc318d2c301",
          "url": "https://github.com/pulseengine/rivet/commit/c0eb34f266ef55d39d4cf9b2cf52e1f92c914ef1"
        },
        "date": 1786478197861,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84188,
            "range": "± 1753",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 893849,
            "range": "± 18568",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 15500367,
            "range": "± 243819",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2185,
            "range": "± 20",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25926,
            "range": "± 149",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 364472,
            "range": "± 1345",
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
            "value": 1517663,
            "range": "± 15219",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 160170,
            "range": "± 1369",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1939856,
            "range": "± 18461",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 30220264,
            "range": "± 377002",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 477348,
            "range": "± 1413",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 15546933,
            "range": "± 104870",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1237019194,
            "range": "± 11542275",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4428,
            "range": "± 159",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 59874,
            "range": "± 265",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 820670,
            "range": "± 3507",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 60557,
            "range": "± 242",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 704993,
            "range": "± 6576",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7559221,
            "range": "± 365772",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1176,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14291,
            "range": "± 53",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 333126,
            "range": "± 12224",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 24102,
            "range": "± 495",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 178494,
            "range": "± 2286",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1612275,
            "range": "± 23527",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "54578059b66af4db548b53db35305052cf75ddf1",
          "message": "chore(release): v0.33.0 — gate potency (#793)\n\nBumps workspace 0.32.0 -> 0.33.0 (rivet-core, rivet-cli, etch) + vscode-rivet.\n\nTheme: a gate that cannot fail is not a gate. Four required CI checks ran,\nreported green, and could not go red. Ported from spar's gate audit and each\nreproduced here with direct evidence.\n\nScope (all implemented + merged):\n- REQ-288 mutation gate could never fail — wrong results path, empty test\n  selector against a crate with no lib target, unmatched upload globs (#768)\n- REQ-289 Format gate blind to the fuzz/ workspace (#769)\n- REQ-290 check verification-evidence ran in no workflow (#770)\n- REQ-291 changed-areas filter under-scoped and failing open (#771)\n\nAlso carries the #778 externals-pagination fix (#779), which downstream sigil\nis waiting on: with 1242 local artifacts it is ~12x the default page window, so\nits synth/kiln external rows are currently dropped while `total` counts them.\nThat is the reason this cut is not waiting.\n\nScope moved DELIBERATELY (release-planning: deferral is a decision, logged):\nREQ-285 (docs check parses snippets) and REQ-286 (release status loudness)\nv0.33.0 -> v0.34.0. Both are still proposed; the release's own theme — the four\nvacuous gates — is complete without them.\n\nTrace: skip",
          "timestamp": "2026-08-12T00:26:54+02:00",
          "tree_id": "71fe4b81399e14f51cd2b3c8cdbdccc3d29d13aa",
          "url": "https://github.com/pulseengine/rivet/commit/54578059b66af4db548b53db35305052cf75ddf1"
        },
        "date": 1786492944141,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85771,
            "range": "± 3061",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 898300,
            "range": "± 4944",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12954236,
            "range": "± 573294",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2232,
            "range": "± 11",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26866,
            "range": "± 68",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 384702,
            "range": "± 1968",
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
            "value": 1510764,
            "range": "± 30167",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 167547,
            "range": "± 3910",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1972239,
            "range": "± 10334",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 27089956,
            "range": "± 1192633",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 475381,
            "range": "± 4597",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 15383296,
            "range": "± 138745",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1241139166,
            "range": "± 13206655",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4479,
            "range": "± 54",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60420,
            "range": "± 1301",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 778724,
            "range": "± 3359",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 59117,
            "range": "± 1447",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 693244,
            "range": "± 27913",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7644481,
            "range": "± 182261",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1093,
            "range": "± 9",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14852,
            "range": "± 49",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 322713,
            "range": "± 2600",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 25272,
            "range": "± 92",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 179191,
            "range": "± 739",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1659512,
            "range": "± 20393",
            "unit": "ns/iter"
          }
        ]
      }
    ]
  }
}