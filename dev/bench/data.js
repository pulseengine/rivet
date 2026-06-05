window.BENCHMARK_DATA = {
  "lastUpdate": 1780689072552,
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
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "01a838062b08ab290063b7eb5ee24effebdeb6bd",
          "message": "feat(cli): commits --format json carries the `command` envelope field (REQ-192) (#463)\n\nDogfooding JSON-consistency audit (follow-on to REQ-189): every machine-readable\ncommand output carries a top-level `command` field — validate, get, list,\nstats, coverage, query, matrix, diff, impact all do. `rivet commits --format\njson` was the lone remaining exception (envelope: summary/broken_refs/orphans/\nunimplemented/artifact_coverage, no `command`), so an agent dispatching on the\n`command` field found commits anomalous.\n\nVerified the false-alarm siblings: get/coverage --format json are valid JSON\n(an earlier \"invalid control character\" reading was a shell-quoting artifact),\nand commits output is deterministic — so the only real gap was the missing\nfield.\n\nFix (additive): emit `\"command\": \"commits\"` in cmd_commits_json.\n\nTest (cli_commands): commits_json_output_has_command_envelope asserts\ncommand==\"commits\" (exit code not asserted — a repo with broken trailers exits\nnon-zero but still emits the JSON document).\n\nConfirmed with: cargo test -p rivet-cli --test cli_commands\ncommits_json_output_has_command_envelope (pass), cargo fmt --check, cargo clippy\n--all-targets -- -D warnings (exit 0), rivet validate PASS.\n\nImplements: REQ-192\nVerifies: REQ-192\nRefs: REQ-007",
          "timestamp": "2026-06-04T11:15:01-05:00",
          "tree_id": "9835d2eba0597c1dfc28069ec743e1a2cee95825",
          "url": "https://github.com/pulseengine/rivet/commit/01a838062b08ab290063b7eb5ee24effebdeb6bd"
        },
        "date": 1780590287847,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84069,
            "range": "± 626",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 891864,
            "range": "± 13744",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 18432228,
            "range": "± 3065390",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2169,
            "range": "± 15",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26285,
            "range": "± 578",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 382367,
            "range": "± 5839",
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
            "value": 95,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1473734,
            "range": "± 24930",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 163866,
            "range": "± 989",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1936338,
            "range": "± 48265",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 38865325,
            "range": "± 6241798",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 439264,
            "range": "± 15450",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 17086899,
            "range": "± 267655",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1448828081,
            "range": "± 11044705",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4357,
            "range": "± 14",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 63021,
            "range": "± 446",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 778019,
            "range": "± 24761",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 57671,
            "range": "± 235",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 697668,
            "range": "± 4822",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 10945643,
            "range": "± 1268029",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1269,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15375,
            "range": "± 104",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 333689,
            "range": "± 2158",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23346,
            "range": "± 89",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 156640,
            "range": "± 809",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1452423,
            "range": "± 21881",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "ef32552c4ec868ba17f45489d4b696a52c5d2aa4",
          "message": "fix(embed): {{query:...}} embed renders rows id-sorted for reproducible docs (REQ-193, #415) (#464)\n\nVerified bug (sibling of REQ-190, #415): `rivet embed 'query:(= type\n\"requirement\")'` rendered a DIFFERENT row order on every run. REQ-190 fixed the\nshared `execute_sexpr` engine, but the `{{query:...}}` embed has its OWN match\nloop in `render_query` that iterated the HashMap-ordered `ctx.store.iter()`\ndirectly — it never went through `execute_sexpr`. Consequences:\n- embed table rows render in nondeterministic order, so any document with a\n  `{{query:...}}` embed (compliance reports, zola sites, `rivet docs`) produces\n  churny, non-reproducible output across builds;\n- the embed's row `limit` truncated to an arbitrary HashMap-order subset.\n(The aggregate embeds `stats:types`/`stats:status`/... were already\ndeterministic — they accumulate into a BTreeMap.)\n\nFix: iterate `ctx.store.iter_sorted()` in `render_query` so both row order and\nlimit truncation are deterministic (lowest-id N).\n\nTest (embed::tests): query_embed_renders_rows_id_sorted_for_deterministic_docs\ninserts artifacts in scrambled id order and asserts the rendered HTML lists ids\nascending.\n\nConfirmed with: cargo test -p rivet-core --lib embed::tests (81/81), cargo fmt\n--check, cargo clippy --all-targets -- -D warnings (exit 0), rivet validate\nPASS. Manually verified `rivet embed 'query:(= type \"requirement\")'` is now\nbyte-identical (md5) across two runs.\n\nImplements: REQ-193\nVerifies: REQ-193\nRefs: REQ-159",
          "timestamp": "2026-06-04T12:16:25-05:00",
          "tree_id": "44aa9fb75dc3bfd2308c742341a55421f09f2e54",
          "url": "https://github.com/pulseengine/rivet/commit/ef32552c4ec868ba17f45489d4b696a52c5d2aa4"
        },
        "date": 1780594088881,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84922,
            "range": "± 197",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 929972,
            "range": "± 9067",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 19686465,
            "range": "± 971394",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1941,
            "range": "± 51",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25084,
            "range": "± 1137",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 368598,
            "range": "± 5972",
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
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1448876,
            "range": "± 20957",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 167254,
            "range": "± 2509",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1938513,
            "range": "± 52407",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 42584147,
            "range": "± 5116928",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 443150,
            "range": "± 1490",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 17521139,
            "range": "± 296392",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1296944847,
            "range": "± 26755204",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4257,
            "range": "± 21",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 43333,
            "range": "± 215",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 737720,
            "range": "± 6820",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 63074,
            "range": "± 769",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 729907,
            "range": "± 2182",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8300945,
            "range": "± 468179",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1219,
            "range": "± 67",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14802,
            "range": "± 52",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 236573,
            "range": "± 6581",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 20809,
            "range": "± 312",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 142714,
            "range": "± 15192",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1344809,
            "range": "± 15565",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "6ab12599668f20b19ebb69e625fecf188c2e9d36",
          "message": "feat(cli): snapshot diff accepts the baseline path positionally (REQ-194) (#465)\n\nDogfooding friction: `rivet snapshot diff <baseline.json>` — the natural form\n(mirroring `git diff <ref>`, `diff <file>`) — errored \"unexpected argument\",\nbecause `snapshot diff` only accepted the baseline via `--baseline`. Same\nfriction class as the query (REQ-187), link (REQ-188), and next-id positional\nshorthands; an agent capturing then diffing a snapshot naturally writes\n`snapshot diff <path>`.\n\nFix (additive): optional positional BASELINE on `snapshot diff`; the `--baseline`\nflag still works and wins if both are given. When neither is supplied, the\nexisting auto-detect (latest snapshot under snapshots/) is preserved.\n\nTest (cli_commands): snapshot_diff_accepts_positional_baseline captures a\nsnapshot then diffs it positionally (exit 0, no clap parse error).\n\nConfirmed with: cargo test -p rivet-cli --test cli_commands\nsnapshot_diff_accepts_positional_baseline (pass), cargo fmt --check, cargo\nclippy --all-targets -- -D warnings (exit 0), rivet validate PASS. Manually\nverified both `snapshot diff <path>` (positional) and `--baseline <path>` exit 0\nagainst a freshly captured snapshot.\n\nImplements: REQ-194\nVerifies: REQ-194\nRefs: REQ-007",
          "timestamp": "2026-06-04T13:15:47-05:00",
          "tree_id": "cc774fb848dcae1edf333ad0fbcba3940adb9bdf",
          "url": "https://github.com/pulseengine/rivet/commit/6ab12599668f20b19ebb69e625fecf188c2e9d36"
        },
        "date": 1780597639573,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 83232,
            "range": "± 786",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 875889,
            "range": "± 4465",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 16360404,
            "range": "± 1287635",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2155,
            "range": "± 15",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 23607,
            "range": "± 127",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 351038,
            "range": "± 1295",
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
            "value": 1457660,
            "range": "± 28514",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 164299,
            "range": "± 743",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1921485,
            "range": "± 75426",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 35366322,
            "range": "± 2623397",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 461366,
            "range": "± 6624",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 17326942,
            "range": "± 447025",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1418398017,
            "range": "± 14301424",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4390,
            "range": "± 59",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60963,
            "range": "± 516",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 750523,
            "range": "± 7651",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 57906,
            "range": "± 1206",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 689785,
            "range": "± 2369",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 11554269,
            "range": "± 558536",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1149,
            "range": "± 9",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15099,
            "range": "± 235",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 331570,
            "range": "± 5075",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22921,
            "range": "± 1518",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 154899,
            "range": "± 716",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1448600,
            "range": "± 16065",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "0fe78b07f026aae2a303ee9fa065de1d4e2e8ba3",
          "message": "feat(cli): variant subcommands accept a bare --variant <name> (REQ-195, #466) (#467)\n\nDogfooding friction (#466): `--variant` accepted a bare NAME in `query`\n(resolved from artifacts/variants/<name>.yaml, #287) but required a PATH in the\n`variant` subcommands, so an agent who learned `query --variant dashboard-only`\nhit `reading dashboard-only: No such file` on `variant solve/explain/...` — even\nthough the SAME file drives both.\n\nFix (additive): resolve `--variant` once per dispatch arm via the existing\n`resolve_variant_arg(project, arg)` helper (direct path → use as-is; bare name →\nartifacts/variants/<name>.yaml; unknown → error listing what was tried).\nApplies to variant check/solve/features/value/attr/explain/manifest; handlers\nunchanged; a direct path keeps working.\n\nTest (cli_commands): variant_solve_accepts_bare_variant_name — bare name\nresolves AND a direct path still works.\n\nConfirmed with: cargo test -p rivet-cli --test cli_commands\nvariant_solve_accepts_bare_variant_name (pass), cargo fmt --check, cargo clippy\n--all-targets -- -D warnings (exit 0), rivet validate PASS. Manually verified\n`variant solve`/`explain --variant dashboard-only` now PASS (explain previously\nerrored \"No such file\"), and a bogus name gives a helpful \"Tried: …\" error.\n\nImplements: REQ-195\nVerifies: REQ-195\nRefs: REQ-007",
          "timestamp": "2026-06-04T15:19:43-05:00",
          "tree_id": "34c2e92c16ec4b2b38285b0e204893db9c24c4c0",
          "url": "https://github.com/pulseengine/rivet/commit/0fe78b07f026aae2a303ee9fa065de1d4e2e8ba3"
        },
        "date": 1780604946946,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84223,
            "range": "± 338",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 903686,
            "range": "± 5430",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13524825,
            "range": "± 869149",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1957,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25108,
            "range": "± 40",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 360502,
            "range": "± 1229",
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
            "value": 1442407,
            "range": "± 25490",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 166217,
            "range": "± 604",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1914460,
            "range": "± 10582",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 26415413,
            "range": "± 430385",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 436107,
            "range": "± 1380",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 16822325,
            "range": "± 203412",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1288027323,
            "range": "± 18061488",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4220,
            "range": "± 19",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 44764,
            "range": "± 151",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 724304,
            "range": "± 2696",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 64225,
            "range": "± 134",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 709260,
            "range": "± 3994",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8038863,
            "range": "± 284051",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1220,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15083,
            "range": "± 50",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 247866,
            "range": "± 5064",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 20867,
            "range": "± 196",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 143899,
            "range": "± 1078",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1349555,
            "range": "± 23577",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "c99c305a75efc47f3c01d3b8a16c0e82ac131277",
          "message": "fix(export): honest AADL fallback in static HTML (no perpetual \"Loading…\") (REQ-196, #468) (#469)\n\nUser-reported: AADL architecture diagrams in the published compliance report\n(.../0.15.0/compliance/documents/ARCH-001.html) are stuck on \"Loading AADL\ndiagram...\" forever. Root cause: `document::render_to_html` emits an\n`<div class=\"aadl-diagram\"><p class=\"aadl-loading\">Loading AADL diagram...</p>`\nplaceholder that is filled at runtime ONLY by `rivet serve`'s `initAadlDiagrams`\nJS (which fetches server-only `/source-raw/…` + `/wasm/spar_wasm.js` and renders\nvia spar WASM). A static export bundles neither that JS nor those routes, so the\nplaceholder never updates.\n\nThis is the immediate honest fix: `render_document_body_for_export` now rewrites\nthe perpetual \"Loading AADL diagram...\" into a static note pointing to the\ninteractive `rivet serve` view, so the report no longer looks hung. Inlining the\nrendered SVG at export time (server-side via the spar wasm_runtime, which\nalready exists) is the larger follow-up tracked in #468.\n\nTest (export::tests): static_export_replaces_perpetual_aadl_loading_with_honest_note\nasserts the export output drops \"Loading AADL diagram...\" and points to\n`rivet serve`, preserving the diagram container/data-root.\n\nConfirmed with: cargo test -p rivet-core --lib\nexport::tests::static_export_replaces_perpetual_aadl_loading_with_honest_note\n(pass), cargo fmt --check, cargo clippy --all-targets -- -D warnings (exit 0),\nrivet validate PASS.\n\nImplements: REQ-196\nVerifies: REQ-196\nRefs: REQ-105",
          "timestamp": "2026-06-04T15:23:43-05:00",
          "tree_id": "94ee97cdf569f33b1a08564b95634de4539fe653",
          "url": "https://github.com/pulseengine/rivet/commit/c99c305a75efc47f3c01d3b8a16c0e82ac131277"
        },
        "date": 1780605544938,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84279,
            "range": "± 362",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 884795,
            "range": "± 6070",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12398710,
            "range": "± 477957",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2145,
            "range": "± 12",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24891,
            "range": "± 122",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 343828,
            "range": "± 2774",
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
            "value": 1452712,
            "range": "± 18642",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 150398,
            "range": "± 855",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1733034,
            "range": "± 17633",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 22884006,
            "range": "± 257682",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 444563,
            "range": "± 5061",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 15480792,
            "range": "± 154738",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1297652529,
            "range": "± 11364725",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4223,
            "range": "± 17",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 61960,
            "range": "± 302",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 759346,
            "range": "± 5230",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 60725,
            "range": "± 268",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 689782,
            "range": "± 5020",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7695389,
            "range": "± 53704",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1312,
            "range": "± 12",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15160,
            "range": "± 217",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 330988,
            "range": "± 2399",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23273,
            "range": "± 835",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 163830,
            "range": "± 1113",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1532606,
            "range": "± 15331",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "295f8175b152220d7350c1b948285b9b4434565a",
          "message": "fix(serve/docs): honest AADL/WASM-unavailable guidance, not broken tooling (REQ-197, #468) (#470)\n\nFollow-on to the user-reported AADL bug (#468): when the spar WASM isn't\nbundled, rivet pointed users at tooling that doesn't work for them. The serve\nfallback said \"run ./scripts/build-wasm.sh and rebuild\" (that script needs a\nlocal spar checkout + wasm32-wasip2 + Node/jco), and the assets README\nadvertised `./scripts/fetch-wasm.sh` under \"Downloading from GitHub releases\" —\nbut spar publishes NO WASM release asset (pulseengine/spar#259), so fetch-wasm.sh\nalways fails. Both sent users (incl. the reporter) down dead ends.\n\nFix (docs + messaging, no behaviour change): the serve `AADL_JS` fallback\nmessages now say the renderer is \"not bundled in this build\" and reference the\ntracking issue #468 instead of the broken script; the README honestly describes\nthe current state (stub fallback, fetch-wasm.sh blocked on spar#259, build from\nsource requires a local spar checkout + toolchain).\n\nTest (serve::js::tests): aadl_wasm_fallback_messages_are_honest asserts the\nfallback no longer instructs running build-wasm.sh, states \"not bundled in this\nbuild\", and references the tracking issue.\n\nConfirmed with: cargo test -p rivet-cli --bin rivet\nserve::js::tests::aadl_wasm_fallback_messages_are_honest (pass), cargo fmt\n--check, cargo clippy --all-targets -- -D warnings (exit 0), rivet validate PASS.\n\nImplements: REQ-197\nVerifies: REQ-197\nRefs: REQ-007",
          "timestamp": "2026-06-04T17:16:13-05:00",
          "tree_id": "cd2fc05353b13938a6d73383e0f414f1b4a03980",
          "url": "https://github.com/pulseengine/rivet/commit/295f8175b152220d7350c1b948285b9b4434565a"
        },
        "date": 1780611911054,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 78518,
            "range": "± 1379",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 951495,
            "range": "± 20061",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 15444825,
            "range": "± 2022019",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1675,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 19265,
            "range": "± 36",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 372257,
            "range": "± 1208",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 85,
            "range": "± 1",
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
            "value": 1347832,
            "range": "± 48970",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 151652,
            "range": "± 1765",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1791433,
            "range": "± 13755",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 42447286,
            "range": "± 3008177",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 413224,
            "range": "± 2036",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 13934376,
            "range": "± 203830",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 940556493,
            "range": "± 5081156",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3889,
            "range": "± 11",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 40562,
            "range": "± 646",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 793498,
            "range": "± 2072",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 52573,
            "range": "± 700",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 592709,
            "range": "± 5200",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8537203,
            "range": "± 398195",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 915,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 11836,
            "range": "± 38",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 310123,
            "range": "± 2813",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 20599,
            "range": "± 37",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 146514,
            "range": "± 367",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1398020,
            "range": "± 36697",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "b7e948c0ecc22dbbb969ea2494b92266d01846fa",
          "message": "fix(mutate): rivet add emits valid YAML for multi-line/special-char fields (REQ-198) (#471)\n\nData-corruption bug (verified on current main): `rivet add --type requirement\n--title T --description $'a\\nb'` wrote INVALID YAML and broke the whole artifacts\nfile — `rivet validate` afterwards FAILed with a YAML parse error\n(\"could not find expected ':'\"). `render_artifact_yaml` (mutate.rs) was a naive\nserializer:\n- `description: >` folded scalar indented only the FIRST line, so a newline put\n  line 2 at column 0;\n- `title:` / tag / field values were emitted unquoted, so a colon (e.g.\n  \"Multi word: with colon\") also produced invalid YAML.\n\nThe modify/set_field path already serializes safely via yaml_edit; only the add\npath diverged. Fix: route add's title/status/description/tags/field values\nthrough the same emitters (`yaml_quote_inline_scalar` + `yaml_render_scalar_value`,\nnow `pub(crate)`), so newlines become block-literal `|` scalars with correct\nindentation and special chars are quoted.\n\nTest (mutate::tests): render_artifact_yaml_multiline_and_colon_is_valid_parseable_yaml\nrenders an artifact with a multi-line description + colon title and asserts the\nYAML parses and round-trips exactly.\n\nConfirmed with: cargo test -p rivet-core --lib mutate::tests (17/17), cargo fmt\n--check, cargo clippy --all-targets -- -D warnings (exit 0), rivet validate PASS.\nManually verified the original repro now writes a `|-` block scalar + quoted\ntitle and validates PASS (was FAIL with 2 parse errors).\n\nImplements: REQ-198\nVerifies: REQ-198\nRefs: REQ-031",
          "timestamp": "2026-06-04T18:16:19-05:00",
          "tree_id": "6fc746fb114b74b4dd35ebeb5e7bcda85e0e30b4",
          "url": "https://github.com/pulseengine/rivet/commit/b7e948c0ecc22dbbb969ea2494b92266d01846fa"
        },
        "date": 1780615580791,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85062,
            "range": "± 485",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 945948,
            "range": "± 5426",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 21115546,
            "range": "± 3054346",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1939,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24961,
            "range": "± 99",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 387625,
            "range": "± 4390",
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
            "value": 1444724,
            "range": "± 17888",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 154030,
            "range": "± 2673",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1789823,
            "range": "± 9638",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 29267325,
            "range": "± 1483610",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 435231,
            "range": "± 4165",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 15733912,
            "range": "± 575717",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1158433182,
            "range": "± 25400272",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4096,
            "range": "± 51",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 51374,
            "range": "± 388",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 756439,
            "range": "± 16891",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 63592,
            "range": "± 179",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 735895,
            "range": "± 7793",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 14872219,
            "range": "± 737638",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1341,
            "range": "± 10",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14757,
            "range": "± 133",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 236511,
            "range": "± 3838",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21352,
            "range": "± 42",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 145816,
            "range": "± 3569",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1352102,
            "range": "± 8886",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "448f4db88b593344f119ff192540b86217f5a944",
          "message": "fix(mutate): serialize nested (list/map) field values as structures, not strings (REQ-199) (#472)\n\nFollow-on to REQ-198, found while verifying its comprehensiveness: in\n`render_artifact_yaml`, a non-scalar field value (a sequence/mapping — reachable\nvia `rivet batch` or the MCP add tool, where field values aren't limited to CLI\n`--field key=value` strings) hit the `other =>` arm, which serde-serialized the\nstructure (multi-line) and then — after REQ-198 — wrapped it in\n`yaml_render_scalar_value`, collapsing a list/map into a block-literal STRING\n(`owners: |-\\n  - alice\\n  - bob`). Pre-REQ-198 it was invalid YAML; neither\npreserved the structure.\n\nFix: emit nested field values as properly-indented YAML under the key (serde\nproduces valid YAML; shift it right by the field-content indent), so a list\nfield round-trips as a list and a map as a map. Scalar fields keep the REQ-198\nsafe-quoting path.\n\nTest (mutate::tests): render_artifact_yaml_nested_field_value_stays_structured\nasserts a sequence field round-trips as a sequence, not a string.\n\nConfirmed with: cargo test -p rivet-core --lib mutate::tests (18/18), cargo fmt\n--check, cargo clippy --all-targets -- -D warnings (exit 0), rivet validate PASS.\n\nImplements: REQ-199\nVerifies: REQ-199\nRefs: REQ-198",
          "timestamp": "2026-06-04T19:17:21-05:00",
          "tree_id": "65dea6fcfdfe6ea27abd7dc8ec3dc0d87b4862b9",
          "url": "https://github.com/pulseengine/rivet/commit/448f4db88b593344f119ff192540b86217f5a944"
        },
        "date": 1780619283293,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85386,
            "range": "± 1252",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 907827,
            "range": "± 3645",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14095171,
            "range": "± 341298",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1930,
            "range": "± 19",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25007,
            "range": "± 118",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 362946,
            "range": "± 1256",
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
            "value": 1446311,
            "range": "± 17868",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 165491,
            "range": "± 907",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1913445,
            "range": "± 14547",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 27364774,
            "range": "± 142273",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 448326,
            "range": "± 1287",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 17704375,
            "range": "± 67880",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1391684316,
            "range": "± 17569969",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4170,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 43392,
            "range": "± 258",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 736877,
            "range": "± 3655",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 63584,
            "range": "± 270",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 708246,
            "range": "± 2515",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7910856,
            "range": "± 102988",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1318,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14633,
            "range": "± 54",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 229838,
            "range": "± 5303",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23669,
            "range": "± 217",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 164156,
            "range": "± 4541",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1582738,
            "range": "± 24446",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "f7fc2d0aa5b198e8bdfdbfbfdd71291c716b3b8f",
          "message": "fix(export): honest AADL fallback in the REAL html export path (REQ-200, #468) (#473)\n\nDogfooding the actual `rivet export --format html` (build + export + scan)\nshowed the perpetual `<p class=\"aadl-loading\">Loading AADL diagram...</p>`\nplaceholder STILL shipping in 2 of 988 pages — `documents/ARCH-001.html` (the\nexact #468 page) and `artifacts/ARCH-SYS-001.html` — with no honest fallback.\n\nRoot cause: REQ-196 patched `static_aadl_fallback` inside\n`rivet_core::export::render_document_body_for_export`, but `rivet export\n--format html` is implemented by `cmd_export_html` (rivet-cli), which renders\npages via the rivet-cli `render/` serve renderers and wraps them in a\n`wrap_page` layout — it never calls the rivet-core function REQ-196 fixed. So\nREQ-196 was effectively a no-op for the real export (and the published\ncompliance report), yet was marked implemented on a unit test of the helper\nrather than an e2e export check.\n\nFix: apply the placeholder→honest-note replacement in `wrap_page`, the universal\nper-page wrapper, so every exported page is covered.\n\nTest (export_html): export_html_replaces_perpetual_aadl_loading_placeholder\nwalks the full export output and asserts ZERO pages contain the raw placeholder.\n\nConfirmed with: cargo test -p rivet-cli --test export_html\nexport_html_replaces_perpetual_aadl_loading_placeholder (pass), cargo fmt\n--check, cargo clippy --all-targets -- -D warnings (exit 0), rivet validate PASS.\nManually verified the real export now has 0 raw placeholders and the honest\nfallback present (was 2 raw, 0 fallback).\n\nImplements: REQ-200\nVerifies: REQ-200\nRefs: REQ-196",
          "timestamp": "2026-06-05T03:15:19-05:00",
          "tree_id": "33cc033b408f22133d8b5428136c7f64de9527e9",
          "url": "https://github.com/pulseengine/rivet/commit/f7fc2d0aa5b198e8bdfdbfbfdd71291c716b3b8f"
        },
        "date": 1780648470048,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84563,
            "range": "± 465",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 900424,
            "range": "± 9479",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14953814,
            "range": "± 1049018",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2181,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 27420,
            "range": "± 698",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 380466,
            "range": "± 1482",
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
            "value": 1460091,
            "range": "± 14316",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 161289,
            "range": "± 830",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1921037,
            "range": "± 12697",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 42471295,
            "range": "± 3019655",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 462678,
            "range": "± 4597",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 17269832,
            "range": "± 138642",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1382189693,
            "range": "± 13517777",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4267,
            "range": "± 54",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 58372,
            "range": "± 287",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 741293,
            "range": "± 9084",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 61535,
            "range": "± 490",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 702228,
            "range": "± 2878",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7884142,
            "range": "± 794837",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1160,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14610,
            "range": "± 195",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 339188,
            "range": "± 1213",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 24586,
            "range": "± 160",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 176478,
            "range": "± 731",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1662653,
            "range": "± 26293",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "55769bec157e8d5c7b66d1b11f7eb067afc3fe58",
          "message": "ci: key main concurrency group per-sha so main runs stay conclusive (#436) (#481)\n\nIssue #436: Playwright E2E (and Criterion benchmarks) were red/cancelled across\nconsecutive main merges and nobody noticed, because main never reached a\nconclusive result. Root cause (verified): the concurrency group fell back to\n`github.ref` on push, so every main commit shared one group\n(`<workflow>-refs/heads/main`). With `cancel-in-progress` false the *running*\njob completes, but GitHub still supersedes *queued* runs in the group — so in a\nPR-merge train each new main push cancelled the previous queued run, and main\nrarely produced a conclusive Playwright/benchmark result. A real regression in\nany covered view would have looked identical to the benign dataset-growth\nfailures (#435).\n\nFix: fall back to `github.sha` (not `github.ref`) on push, so every main commit\ngets its own concurrency group and is never superseded. PRs are unchanged —\n`head_ref` still groups per source branch, so cancel-in-progress keeps\nsuperseding stale PR runs. Applied to both workflows that shared the pattern\n(ci.yml, benchmarks.yml).\n\nThis is the pure-hygiene half of #436; whether to promote Playwright to a\nrequired status check remains a separate maintainer decision.",
          "timestamp": "2026-06-05T14:21:00-05:00",
          "tree_id": "b8bd5578b534708b3296b553dae4e5768cae3365",
          "url": "https://github.com/pulseengine/rivet/commit/55769bec157e8d5c7b66d1b11f7eb067afc3fe58"
        },
        "date": 1780687794247,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85291,
            "range": "± 623",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 926939,
            "range": "± 46742",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 15662036,
            "range": "± 994009",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1981,
            "range": "± 11",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24852,
            "range": "± 203",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 354447,
            "range": "± 2103",
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
            "value": 1451601,
            "range": "± 21513",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 165633,
            "range": "± 2832",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1942974,
            "range": "± 27262",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 33600459,
            "range": "± 4104401",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 445437,
            "range": "± 2264",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 17345980,
            "range": "± 241292",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1319574053,
            "range": "± 20947720",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4341,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 44060,
            "range": "± 140",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 748142,
            "range": "± 10152",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 64983,
            "range": "± 127",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 715456,
            "range": "± 2559",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8592599,
            "range": "± 594695",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1178,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15049,
            "range": "± 78",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 230077,
            "range": "± 3068",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23546,
            "range": "± 83",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 168817,
            "range": "± 632",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1584258,
            "range": "± 19825",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "21a41d965fba94d11801022c714b8a2e9f4acd0c",
          "message": "fix(tools/intro-video): make the video pipeline actually produce a video (#480)\n\nFound while generating the first real intro video end-to-end. The freshly\nscaffolded pipeline had a blocking bug plus timing/engine gaps:\n\n1. MUX OFF-BY-ONE (blocker): the ffmpeg filtergraph referenced the narration\n   clips as `[0:a]`, `[1:a]`, … but ffmpeg input 0 is screen.mp4 (video, muxed\n   with `-an` so it has NO audio). The wavs are inputs 1..n. Result:\n   \"Stream specifier ':a' … matches no streams\" and a 0-byte output — the\n   scaffold could not produce a video for anyone. Fixed: filter input index is\n   idx+1; output labels stay 0-based.\n\n2. SPEACHES TTS ENGINE: added `TTS_ENGINE=speaches`, calling a self-hosted\n   OpenAI-compatible /v1/audio/speech endpoint (Kokoro-82M, voice via\n   SPEACHES_URL/SPEACHES_MODEL/SPEACHES_VOICE). No piper binary, no committed\n   voice model, no cloud secret — and reachable from self-hosted CI runners, so\n   a narrated release video can regenerate unattended. JSON body is built with\n   node (safe escaping); non-audio responses loud-fail via ffprobe.\n\n3. AUTO-FIT TIMING: the nominal hold_ms (5-6s) were ~half the real narration\n   (9-15s), so clips overran their scenes and talked over each other. New `fit`\n   step measures each narration wav and writes out/storyboard.timed.json with\n   hold_ms widened to fit; capture + mux read that one timeline (capture.spec.ts\n   now honors the STORYBOARD env). Pipeline reordered tts -> fit -> capture -> mux.\n\n4. NO OUTRO CLIP: Playwright's recorded length can land a second under the\n   summed holds; with `-shortest` that clipped the outro narration. The last\n   frame is now held (`tpad`) so audio defines length and the signature line\n   plays in full.\n\nConfirmed by producing out/rivet-intro.mp4 (1280x720 h264 + aac, ~90s), all 7\nscenes rendering (intro card, CLI help, dashboard, artifacts, artifact detail,\ncoverage, outro). Generated media stays gitignored (out/).\n\nRefs: FEAT-001",
          "timestamp": "2026-06-05T14:21:43-05:00",
          "tree_id": "bc4f4b9dad68acb42682667dc228b30d39365914",
          "url": "https://github.com/pulseengine/rivet/commit/21a41d965fba94d11801022c714b8a2e9f4acd0c"
        },
        "date": 1780687822298,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85683,
            "range": "± 219",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 923574,
            "range": "± 18059",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14225882,
            "range": "± 868143",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1957,
            "range": "± 16",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25119,
            "range": "± 46",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 365736,
            "range": "± 1798",
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
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1447038,
            "range": "± 19630",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 168552,
            "range": "± 14422",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1922295,
            "range": "± 18169",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 29001141,
            "range": "± 362795",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 451613,
            "range": "± 10108",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 16719707,
            "range": "± 757521",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1255707870,
            "range": "± 17606066",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4197,
            "range": "± 19",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 44335,
            "range": "± 1231",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 736980,
            "range": "± 4730",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 64853,
            "range": "± 203",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 729316,
            "range": "± 9592",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8137205,
            "range": "± 203209",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1209,
            "range": "± 17",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14761,
            "range": "± 403",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 230787,
            "range": "± 2930",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23400,
            "range": "± 382",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 165834,
            "range": "± 471",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1580354,
            "range": "± 56917",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "2682b408c3ca8ad15eadd975bb53cbd858f471bc",
          "message": "chore: ignore recorded/generated video repo-wide (mp4/webm/mov/mkv/m4v) (#486)\n\nThe intro/release video pipeline (tools/intro-video/) already ignores its own\nout/ dir, but that guard is path-specific. As video generation moves toward the\nrelease cycle (captures may land elsewhere), add a repo-wide safety net so a\nstray recording can't be committed from anywhere. Video extensions only —\ncommitted docs images (png/jpg/gif/svg) are intentionally left tracked. No\ntracked files are affected (no video is currently committed).",
          "timestamp": "2026-06-05T14:21:47-05:00",
          "tree_id": "11984928a8a974b34b0edb2118e8aeb7fd752a9f",
          "url": "https://github.com/pulseengine/rivet/commit/2682b408c3ca8ad15eadd975bb53cbd858f471bc"
        },
        "date": 1780687831203,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84920,
            "range": "± 585",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 919872,
            "range": "± 8421",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 17534727,
            "range": "± 1230195",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1948,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25056,
            "range": "± 326",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 367245,
            "range": "± 2261",
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
            "value": 1452302,
            "range": "± 29970",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 168142,
            "range": "± 7121",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1944533,
            "range": "± 26427",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 36378356,
            "range": "± 3786581",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 446852,
            "range": "± 4088",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 17387514,
            "range": "± 210414",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1274389782,
            "range": "± 17088203",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4088,
            "range": "± 9",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 44283,
            "range": "± 245",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 737231,
            "range": "± 4174",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 63410,
            "range": "± 419",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 722195,
            "range": "± 2611",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8051836,
            "range": "± 257317",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1283,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14894,
            "range": "± 499",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 240786,
            "range": "± 4014",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 24014,
            "range": "± 325",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 168572,
            "range": "± 693",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1586566,
            "range": "± 23751",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "c7a0c3c146efc1de006c74e8080cf4e666ad5032",
          "message": "docs(agents): document the parallel-PR conflict-avoidance policy (#422) (#489)\n\nImplements item 1 of the #422 triage AC (maintainer-authored): a \"Parallel-PR\nfriction\" section in AGENTS.md so contributors/agents avoid the recurring\nrequirements.yaml + CHANGELOG merge conflicts the dogfooding loop generates.\n\n- artifacts/requirements.yaml: append new artifacts at EOF (use `rivet add`,\n  which already EOF-appends), never insert mid-file; pick the next id by\n  scanning all of artifacts/ (and mind ids reserved by unmerged PRs, #479).\n- CHANGELOG.md: explains it is already conflict-free via `merge=union`\n  (REQ-164/#423), and why `requirements.yaml` deliberately does NOT use union\n  (would duplicate lines if two PRs edited the same artifact). Tracking: #422.\n- Notes the mechanical resolution (keep both blocks, then `rivet validate`).\n\nDeliberately a docs-only change with NO new REQ — adding a REQ here would append\nto requirements.yaml and contribute to the very EOF collision being documented.\nPer the #422 AC, traces to the existing CHANGELOG REQ instead.\n\nConfirmed with: referenced ids (REQ-160, REQ-164) exist; rivet validate PASS;\nAGENTS.md has no `rivet docs check` violations (the lone CHANGELOG `rivet trace`\nfinding is a stale-local-binary artifact — `trace` exists in main, CI passes).\n\nRefs: REQ-164",
          "timestamp": "2026-06-05T14:21:51-05:00",
          "tree_id": "f15bfc4140ace85f3dad13d6e47d160be94802f9",
          "url": "https://github.com/pulseengine/rivet/commit/c7a0c3c146efc1de006c74e8080cf4e666ad5032"
        },
        "date": 1780687894745,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 67392,
            "range": "± 400",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 727369,
            "range": "± 5956",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 11226279,
            "range": "± 344040",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1510,
            "range": "± 29",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 18545,
            "range": "± 64",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 261831,
            "range": "± 1512",
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
            "value": 1133766,
            "range": "± 71479",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 126911,
            "range": "± 819",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1473452,
            "range": "± 48996",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 22353768,
            "range": "± 1801654",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 339361,
            "range": "± 1574",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 13160986,
            "range": "± 95489",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1053394172,
            "range": "± 23027775",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3256,
            "range": "± 68",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 35522,
            "range": "± 369",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 577315,
            "range": "± 4812",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 46637,
            "range": "± 137",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 513586,
            "range": "± 2321",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 6041959,
            "range": "± 327408",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 877,
            "range": "± 24",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 11152,
            "range": "± 78",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 170147,
            "range": "± 1082",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 18149,
            "range": "± 433",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 129652,
            "range": "± 2452",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1225112,
            "range": "± 12496",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "6ffbdd7e9628108c72893cf0848815dc38022604",
          "message": "fix(export): node-budget the single-page graph render so it can't hang (REQ-201) (#474)\n\nVerified hang: on the rivet repo (~900 artifacts) `rivet export --format html\n--single-page` runs for MINUTES producing nothing (multi-page finishes in ~6s).\nRoot cause: `render_section_graph` (rivet-core/src/export.rs) lays out the\nentire link graph eagerly via `etch::layout::layout(pg, ...)` with NO node\nbudget; etch's layout is super-linear, so ~900 nodes effectively hangs the\nsingle-page export. The serve path already guards this\n(rivet-cli/src/render/graph.rs `DEFAULT_NODE_BUDGET = 200` + a \"Graph above node\nbudget\" page) — the static export did not.\n\nFix: in `render_section_graph`, if `node_count > 200`, skip the layout and emit\na short note (\"Graph has N nodes, exceeding the 200-node static-render budget —\nview it interactively in `rivet serve`\"), mirroring the serve guard.\n\nTest (export::tests): render_section_graph_over_budget_skips_layout — a\n250-node graph returns the budget note and NO `<svg>` (the layout that hangs).\n\nConfirmed with: cargo test -p rivet-core --lib\nexport::tests::render_section_graph_over_budget_skips_layout (pass), cargo fmt\n--check, cargo clippy --all-targets -- -D warnings (exit 0), rivet validate PASS.\nManually verified `rivet export --format html --single-page` on the rivet repo\nnow completes in ~3s (was minutes/hang) with the budget note present.\n\nImplements: REQ-201\nVerifies: REQ-201\nRefs: REQ-007",
          "timestamp": "2026-06-05T14:22:53-05:00",
          "tree_id": "c11c81a40245c6513139fbbc08b4c9fb41ee0843",
          "url": "https://github.com/pulseengine/rivet/commit/6ffbdd7e9628108c72893cf0848815dc38022604"
        },
        "date": 1780687966594,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 87353,
            "range": "± 556",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 929423,
            "range": "± 9047",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 15118032,
            "range": "± 495578",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2053,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25326,
            "range": "± 54",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 375673,
            "range": "± 2013",
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
            "value": 1452642,
            "range": "± 26342",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 167133,
            "range": "± 1288",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1939897,
            "range": "± 14805",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 30107337,
            "range": "± 943895",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 434321,
            "range": "± 2058",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 17928608,
            "range": "± 105850",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1432009431,
            "range": "± 18462826",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4144,
            "range": "± 51",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 43094,
            "range": "± 202",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 715887,
            "range": "± 3896",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 62908,
            "range": "± 292",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 718813,
            "range": "± 3450",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8090423,
            "range": "± 335193",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1209,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14660,
            "range": "± 61",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 235252,
            "range": "± 2236",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23049,
            "range": "± 48",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 158547,
            "range": "± 556",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1496952,
            "range": "± 22484",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "531f4f33e6dad542e2c26c6314aa02dbc58203f5",
          "message": "docs(agents): add \"Before You Push (Rust)\" fmt/clippy guidance + file REQ-202 (minimal build) (#475)\n\nAddresses issue #438 (AI commits pass locally, fail CI Format/Clippy) via its\nown second suggestion: surface the exact CI gates where agents look. The git\npre-commit hook (scripts/install-hooks.sh) already runs `cargo fmt --all --\ncheck` on staged .rs since #438 was filed, but it requires manual install and\ndoes not cover clippy. The new AGENTS.md \"Before You Push (Rust)\" section gives\nthe verbatim `cargo fmt --all -- --check` + `cargo clippy --all-targets -- -D\nwarnings` one-liners and documents the three traps that bite agents (grep\n'^error' misses -D warnings; -p <crate> skips --all-targets test lints; the\ncommit-msg hook rejects `Word:` body lines).\n\nAlso files REQ-202 (draft) from issue #456: rivet-cli has no minimal build —\n`default = []` and axum/rmcp/lsp-server are unconditional deps, so every\nfrom-source build compiles the full serve+MCP+LSP stack even for the\nvalidate/list hot path. Proposed additive fix keeps features in `default` so\nthe published binary is byte-for-byte unchanged; the feature set is a maintainer\ncall, hence draft.\n\nNote: a stronger fix for #438 — a .claude/settings.json PostToolUse hook that\nauto-runs `cargo fmt --all` on every .rs edit — was attempted but is gated as\nself-modification of agent config and needs explicit maintainer authorization.\n\nConfirmed with: rivet validate PASS (257 warnings, 0 errors).\n\nRefs: REQ-202, REQ-007",
          "timestamp": "2026-06-05T14:27:32-05:00",
          "tree_id": "379dde3e341180cd63e9ef32b8ffbc6bc92ca3e4",
          "url": "https://github.com/pulseengine/rivet/commit/531f4f33e6dad542e2c26c6314aa02dbc58203f5"
        },
        "date": 1780688280070,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 67153,
            "range": "± 676",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 736228,
            "range": "± 4489",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 11632774,
            "range": "± 386214",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1532,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 18605,
            "range": "± 186",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 262385,
            "range": "± 1625",
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
            "value": 1108652,
            "range": "± 21999",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 127912,
            "range": "± 1896",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1478194,
            "range": "± 19920",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 21634013,
            "range": "± 2533368",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 338291,
            "range": "± 790",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 13279552,
            "range": "± 215097",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1059688941,
            "range": "± 7886956",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3225,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 40497,
            "range": "± 495",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 578239,
            "range": "± 3030",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 48159,
            "range": "± 1810",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 514423,
            "range": "± 2954",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 6054584,
            "range": "± 53019",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 917,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 11897,
            "range": "± 156",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 177307,
            "range": "± 1380",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 17375,
            "range": "± 112",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 125481,
            "range": "± 934",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1158417,
            "range": "± 14629",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "6f12e0f8722b9318a748962d6598ab53a49df069",
          "message": "feat(add): stamp AI provenance at creation + emit provenance in the add serializer (REQ-203) (#477)\n\nCloses #476. The AI-provenance system was wired to the editor, not to rivet's\nown mutation commands, so the sanctioned creation path produced UNSTAMPED\nartifacts: cmd_add built the Artifact with `provenance: None`, and the\n.claude/settings.json stamp hook only matches Edit/Write — a heredoc append or\n`rivet add` (both Bash calls) never fired it. For a tool whose pitch is\nAI-artifact auditability, AI-created artifacts silently missing provenance is a\ncorrectness gap.\n\nCompounding bug caught during implementation: `mutate::render_artifact_yaml`\n(the single serializer for the add path) did NOT emit the `provenance` block at\nall, so merely setting `artifact.provenance` would have been a silent no-op (the\nREQ-196/200 class of bug). Both halves are fixed:\n\n- `rivet add` gains `--created-by <human|ai|ai-assisted>` and `--model <M>`;\n  `--created-by` falls back to the RIVET_PROVENANCE_CREATED_BY env var so\n  CI/agent environments can set it once. Value validated up front. Absent =>\n  no provenance block (prior behavior preserved).\n- Extract `current_utc_timestamp()`, shared by cmd_stamp and cmd_add, so both\n  emit identical ISO-8601 timestamps with no chrono dependency.\n- `render_artifact_yaml` now emits the `provenance:` block (field order matches\n  yaml_edit::set_provenance).\n\nTests (rivet-core): render_artifact_yaml_emits_provenance_when_present and\nrender_artifact_yaml_omits_provenance_when_absent.\n\nConfirmed with: cargo test -p rivet-core --lib render_artifact_yaml_ (4 passed);\nend-to-end on a fresh `rivet init` project — `rivet add --created-by ai-assisted\n--model claude-opus-4-8` wrote the provenance block, plain add wrote none,\nRIVET_PROVENANCE_CREATED_BY=ai stamped from env, --created-by robot errored,\nrivet validate PASS; cargo fmt --all -- --check (exit 0); cargo clippy\n--all-targets -- -D warnings (exit 0, only pre-existing MSRV-config warning).\n\nImplements: REQ-203\nVerifies: REQ-203\nRefs: REQ-007",
          "timestamp": "2026-06-05T14:29:41-05:00",
          "tree_id": "55b15872fe4551c2a1c6e897900d9d4b24c0768f",
          "url": "https://github.com/pulseengine/rivet/commit/6f12e0f8722b9318a748962d6598ab53a49df069"
        },
        "date": 1780688413024,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84336,
            "range": "± 822",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 899904,
            "range": "± 7145",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12209239,
            "range": "± 454176",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2121,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25494,
            "range": "± 56",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 388231,
            "range": "± 7599",
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
            "value": 1439571,
            "range": "± 15891",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 161061,
            "range": "± 1358",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1923004,
            "range": "± 4714",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 24024627,
            "range": "± 226497",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 457355,
            "range": "± 2298",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 16712377,
            "range": "± 116907",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1400043608,
            "range": "± 14871949",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4271,
            "range": "± 21",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 59479,
            "range": "± 207",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 747329,
            "range": "± 2297",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 64022,
            "range": "± 164",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 703341,
            "range": "± 2550",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7577641,
            "range": "± 70985",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1295,
            "range": "± 12",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15593,
            "range": "± 109",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 341020,
            "range": "± 1075",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23667,
            "range": "± 93",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 167033,
            "range": "± 1984",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1577449,
            "range": "± 17010",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "2245e73f9be91c9c634c0f44a76505640d5fdfa9",
          "message": "fix(serve,lsp): sort the two remaining nondeterministic store.iter() output sites by id (REQ-204) (#478)\n\nFollow-on audit of #415. REQ-159 already added Store::iter_sorted() + the doc\nwarning and migrated query.rs/migrate_cmd/render::externals. This audits the\nremaining `store.iter()` ordered-output candidates and fixes the two that\ngenuinely regress:\n\n1. serve /api/search: artifact + doc matches were pushed in HashMap order, then\n   `results.truncate(50)`. So with >50 matches, WHICH 50 survive — not just\n   their order — varied per process. Now sorts results by the `id` field before\n   truncating.\n2. LSP id-completion (`lsp_completion`, the `[[`/`target:` branch) pushed\n   CompletionItems in HashMap order while the sibling `type:` branch already\n   sorted. Extracted `artifact_id_completions(store)` built via iter_sorted()\n   (ascending id), restoring consistency.\n\nAudited and confirmed already-safe (no change): query.rs::execute, migrate_cmd\n(iter_sorted), render/externals (sorts), export filter (sorts), serve tree /\nsearch-expand (BTreeMap / sort), validate & coverage filter-rebuilds (set\nmembership), HashSet id collects, aggregation loops.\n\nTest (lsp_tests): artifact_id_completions_are_sorted_by_id — ids inserted out of\norder come back ascending.\n\nConfirmed with: cargo test -p rivet-cli --bin rivet\nlsp_tests::artifact_id_completions_are_sorted_by_id (pass), cargo fmt --check,\ncargo clippy --all-targets -- -D warnings (exit 0), rivet validate PASS.\n\nImplements: REQ-204\nVerifies: REQ-204\nRefs: REQ-159",
          "timestamp": "2026-06-05T14:31:12-05:00",
          "tree_id": "5e61a838cda74ee0ae0fd052286248199e79e9bb",
          "url": "https://github.com/pulseengine/rivet/commit/2245e73f9be91c9c634c0f44a76505640d5fdfa9"
        },
        "date": 1780688789156,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 83550,
            "range": "± 292",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 898869,
            "range": "± 11325",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 17423977,
            "range": "± 1099318",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2214,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26001,
            "range": "± 1356",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 350082,
            "range": "± 5858",
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
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1445460,
            "range": "± 40079",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 162417,
            "range": "± 1295",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1915342,
            "range": "± 49625",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 30341567,
            "range": "± 3021839",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 453262,
            "range": "± 8466",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 17477300,
            "range": "± 218377",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1505932272,
            "range": "± 22469101",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4386,
            "range": "± 10",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60371,
            "range": "± 342",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 746607,
            "range": "± 2516",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 62544,
            "range": "± 401",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 713749,
            "range": "± 4797",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7946631,
            "range": "± 387520",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1259,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15342,
            "range": "± 147",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 348021,
            "range": "± 8946",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23982,
            "range": "± 108",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 168735,
            "range": "± 2777",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1585191,
            "range": "± 32010",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "e50c99592c2f1ae0206a9e136bf06877faab3110",
          "message": "feat(validate+schema): surface schema set name@version + source everywhere (#431, closes #484) (#483)\n\n* feat(validate): surface the schema set (name@version + source) so upgrades aren't silent (REQ-205, #431)\n\nIssue #431: a project on builtin schemas validates against whatever schema copy\nis compiled into the rivet binary (the loader prefers on-disk, else falls back\nto embedded). Every release that tightens a builtin schema silently changes\nvalidation for embedded-schema consumers — a `rivet validate` that passed now\nflags unchanged artifacts, with nothing indicating the schema moved. The\n`version:` field existed but was never surfaced.\n\nThis implements the surfacing (option 3): `rivet validate` now reports the schema\nset it ran against.\n\n- rivet-core: `embedded::resolve_schema_provenance` builds on the existing\n  `schema_sources` classifier (REQ-177) — one on-disk/embedded vocabulary — and\n  adds the parsed `version` plus auto-discovered bridges. Returns\n  `SchemaProvenance { name, version, source, path }`.\n- rivet-cli: validate prints `Schemas: <name>@<version> (embedded|on-disk), …`\n  (text) and a top-level `schemas` array (json). No validation semantics change.\n\nPinning/gating (turning the cosmetic version into a hard gate, option 2) remains\na separate maintainer call on syntax.\n\nTest (embedded::tests): resolve_schema_provenance_reports_version_and_source —\non-disk reports its version + \"on-disk\"; embedded reports a non-empty compiled-in\nversion + \"embedded\"; missing omitted.\n\nConfirmed with: cargo test -p rivet-core --lib\nembedded::tests::resolve_schema_provenance_reports_version_and_source (pass);\n`rivet validate` prints `Schemas: common@0.1.0 (on-disk), …` (incl. bridges);\n`rivet validate --format json` emits the `schemas` array; rivet validate PASS;\ncargo fmt --check + cargo clippy --all-targets -- -D warnings (exit 0).\n\nImplements: REQ-205\nVerifies: REQ-205\nRefs: REQ-177\n\n* feat(schema): rivet schema sources shows version + bridges, consistent with validate (REQ-205, closes #484)\n\nFollow-on within the same #431 surfacing work. After the previous commit made\n`rivet validate` print the schema set as name@version (on-disk|embedded), the\ndedicated `rivet schema sources` command was left LESS informative — it showed\nneither the version nor the auto-discovered bridge schemas (7 entries vs\nvalidate's 9). #484.\n\n- rivet-core: factored the version lookup into `schema_version_of(name, source)`\n  and the name-set expansion into `schema_names_with_bridges(names)`, both shared\n  by `resolve_schema_provenance` and the CLI so the two surfaces can't drift.\n- rivet-cli: `cmd_schema_sources` now reports the full effective set (requested\n  + bridges) with each schema's version, in both text and json. It keeps\n  reporting `MISSING` schemas (the dedicated command's diagnostic value, which\n  the validate surfacing intentionally omits).\n\nTests (embedded::tests): schema_version_of_reads_on_disk_embedded_and_missing,\nschema_names_with_bridges_appends_discovered_bridges.\n\nConfirmed with: cargo test -p rivet-core --lib embedded::tests (4 pass);\n`rivet schema sources` now lists 9 schemas with versions incl. the two bridges,\nmatching `rivet validate`'s Schemas line; cargo fmt --check + cargo clippy\n--all-targets -- -D warnings (exit 0); rivet validate PASS.\n\nImplements: REQ-205\nVerifies: REQ-205\nRefs: REQ-177",
          "timestamp": "2026-06-05T14:32:31-05:00",
          "tree_id": "a89296147efefcabc266a380aa499d9601b1211c",
          "url": "https://github.com/pulseengine/rivet/commit/e50c99592c2f1ae0206a9e136bf06877faab3110"
        },
        "date": 1780689071888,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 86191,
            "range": "± 834",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 920270,
            "range": "± 7275",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14567326,
            "range": "± 388416",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1967,
            "range": "± 50",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25225,
            "range": "± 281",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 360106,
            "range": "± 3443",
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
            "value": 1454392,
            "range": "± 46493",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 166840,
            "range": "± 744",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1946694,
            "range": "± 16312",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 33099531,
            "range": "± 1439061",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 447778,
            "range": "± 2217",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 18384629,
            "range": "± 139028",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1467343369,
            "range": "± 18647301",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4165,
            "range": "± 69",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 43974,
            "range": "± 1577",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 753048,
            "range": "± 8736",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 62444,
            "range": "± 163",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 720400,
            "range": "± 2548",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 9766072,
            "range": "± 555537",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1244,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14746,
            "range": "± 29",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 238415,
            "range": "± 4682",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22553,
            "range": "± 69",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 158347,
            "range": "± 1421",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1486269,
            "range": "± 15959",
            "unit": "ns/iter"
          }
        ]
      }
    ]
  }
}