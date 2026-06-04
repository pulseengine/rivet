window.BENCHMARK_DATA = {
  "lastUpdate": 1780532650146,
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
          "id": "366974c60a9639b24339a67564ae949e621b1f12",
          "message": "fix(matrix): hint the correct --direction on an all-empty matrix (REQ-152) (#401)\n\nSelf-found dogfooding: `rivet matrix --from <X> --to <Y>` defaults to\n`--direction backward` + auto-detected link, so a forward relationship\nlike `design-decision --satisfies--> requirement` renders an all-`(none)`\nmatrix — a false \"no traceability\" signal, dangerous for a traceability\ntool. Confirmed: defaults show every row `(none)`; `--link satisfies\n--direction forward` shows the real `DD-001 -> REQ-006` links.\n\nWhen the matrix is all-empty (sources exist, zero links), emit an\nactionable stderr hint: if the opposite direction would surface links,\nname it precisely (\"0 … via 'satisfies' (backward), but 67 do with\n`--direction forward` — runs the other way\"); otherwise point at\n`rivet schema show <from>` / `--link`. Additive — a matrix with links\nemits no hint, and stdout (text/JSON) is untouched.\n\nVerified end-to-end; new `matrix_empty_emits_direction_hint` test;\nclippy --all-targets + fmt clean; rivet validate + docs check PASS.\n\nFollow-up filed (REQ-152 note): infer direction from the link type's\nsource/target so the default just works rather than hinting post-hoc.\n\nImplements: REQ-152\nRefs: REQ-007\n\nCo-authored-by: Claude Opus 4.8 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-06-02T14:48:54-05:00",
          "tree_id": "2edcaf1856d19ee468f0b4fa421112f7fa874358",
          "url": "https://github.com/pulseengine/rivet/commit/366974c60a9639b24339a67564ae949e621b1f12"
        },
        "date": 1780430143107,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84547,
            "range": "± 378",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 926493,
            "range": "± 33148",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 15605946,
            "range": "± 1105573",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2019,
            "range": "± 9",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25076,
            "range": "± 402",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 358125,
            "range": "± 3501",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 96,
            "range": "± 2",
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
            "value": 1418174,
            "range": "± 20229",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 165783,
            "range": "± 3828",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1931142,
            "range": "± 18745",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 37624429,
            "range": "± 2804416",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 131384,
            "range": "± 1375",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1221218,
            "range": "± 40349",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 14149228,
            "range": "± 440053",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4151,
            "range": "± 34",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 44509,
            "range": "± 166",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 763795,
            "range": "± 4821",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 62196,
            "range": "± 1284",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 713669,
            "range": "± 6294",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8170784,
            "range": "± 243101",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 767,
            "range": "± 14",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 6916,
            "range": "± 45",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 97720,
            "range": "± 3038",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 20940,
            "range": "± 39",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 145406,
            "range": "± 2607",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1346469,
            "range": "± 21250",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "489f6c7f7ecf914dda1b6727cceb8c63cb71a746",
          "message": "fix(impact): load --since baseline via the canonical loader (REQ-153, #403) (#404)\n\nSelf-found dogfooding: `rivet impact --since HEAD~5` reported 503 changed\n+ 354 added (1207 total) when only ~7 REQs in requirements.yaml actually\nchanged — useless output for a change-impact tool.\n\nRoot cause: `load_baseline_from_git` rebuilt the baseline with a bespoke\nper-file parser (`parse_yaml_content` + `GenericYamlWrapper`) that (a)\nonly handled a couple of source formats and skipped the rest (spurious\n\"added\") and (b) represented artifacts differently from the live\n`load_artifacts` adapter, so `content_hash` differed for unchanged\nartifacts (every one \"changed\"). A third inconsistent parse path\n(REQ-140 family).\n\nFix: materialise the ref's tracked tree with `git archive <ref> | tar`\ninto a temp dir (Drop-guarded cleanup) and load it through\n`rivet_core::load_project_full` — the SAME load_artifacts-per-source path\nthe live store uses — then diff. Deleted the now-dead bespoke helpers\n(`parse_yaml_content`, `git_show_file`, `git_ls_tree_files`,\n`GenericYamlWrapper`/`RawArtifact`/`RawLink`).\n\nVerified: `impact --since HEAD~5` now reports 3 changed (the real\nrequirements.yaml edits) + 7 added, not 503/354. New\n`impact_since_reports_only_real_changes` integration test (2-commit\nfixture: one edit, one add, one untouched → exactly that). clippy\n--all-targets + fmt clean; rivet validate + docs check PASS.\n\nKnown residual (separate, smaller): externals aren't loaded into the\nbaseline, so external prefix:id artifacts still show as \"added\".\n\nFixes: REQ-153\nRefs: REQ-140\n\nCo-authored-by: Claude Opus 4.8 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-06-02T16:19:01-05:00",
          "tree_id": "5396b7e02b28d6c18646e11326f9f4ba8f1069a4",
          "url": "https://github.com/pulseengine/rivet/commit/489f6c7f7ecf914dda1b6727cceb8c63cb71a746"
        },
        "date": 1780435541800,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 83767,
            "range": "± 358",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 892741,
            "range": "± 3681",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14662888,
            "range": "± 874035",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2237,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25286,
            "range": "± 77",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 379520,
            "range": "± 13620",
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
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1455655,
            "range": "± 28223",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 166058,
            "range": "± 3044",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1889809,
            "range": "± 17727",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 30543205,
            "range": "± 2716384",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 137681,
            "range": "± 1008",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1191787,
            "range": "± 13421",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 14830949,
            "range": "± 1475255",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4312,
            "range": "± 67",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 62062,
            "range": "± 288",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 825499,
            "range": "± 4157",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 60871,
            "range": "± 372",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 701372,
            "range": "± 10216",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7816417,
            "range": "± 242515",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 792,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7247,
            "range": "± 25",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 130752,
            "range": "± 794",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23183,
            "range": "± 442",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 159766,
            "range": "± 1835",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1508629,
            "range": "± 17126",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "eaa4a485a2124095909d691e5279461bd180c367",
          "message": "fix(list,stats): loudly report sources skipped by parse errors (REQ-154, #353) (#405)\n\nTriaged from issue #353 (an agent driving rivet on the meld project). A\nsingle stray top-level key in an artifact file (`unknown field\n'loss-coverage', expected 'artifacts'`) drops the ENTIRE file — valid\n`artifacts:` list and all — from the graph, with only a `log::warn!`\npreamble as the signal.\n\n`rivet validate` already handles this correctly (hard\n`artifact-parse-error` ERROR diagnostic, verified). The gap was the\nenumeration commands: `rivet list` printed \"0 artifacts\" and `rivet\nstats` its counts with no indication a whole source was dropped — an\nagent that pipes the WARN preamble to /dev/null silently operates on a\npartial graph (an F2 loud-fail violation on the read path). #353 asked\nexplicitly to \"surface skipped sources in the validate/stats summary\".\n\n`list` and `stats` now re-scan `generic`/`generic-yaml` sources for\n`SkipKind::ParseError` skips via the existing REQ-062\n`scan_skipped_files` channel (chosen over `load_artifacts_with_skips` so\nwe don't re-run `load_artifacts` and double its per-file WARN) and print\na consolidated \"N artifact source(s) skipped due to parse errors\" block\nto stderr naming each file + error, pointing at `rivet validate`.\nEmitted regardless of log level (it signals data loss); no-op on clean\nprojects.\n\nVerified on the #353 repro and with a new integration test\n(`list_reports_parse_error_skipped_sources`): parse-error project →\nboth commands name the dropped file on stderr; clean project → no block.\nclippy --all-targets + fmt clean; rivet validate PASS (195), docs check\nPASS.\n\nImplements: REQ-154\nRefs: REQ-062\n\nCo-authored-by: Claude Opus 4.8 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-06-02T16:41:13-05:00",
          "tree_id": "40f9c7746997d24572065db837973d111e517bc3",
          "url": "https://github.com/pulseengine/rivet/commit/eaa4a485a2124095909d691e5279461bd180c367"
        },
        "date": 1780436878261,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84182,
            "range": "± 996",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 923665,
            "range": "± 3677",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 17128213,
            "range": "± 1498831",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1966,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25183,
            "range": "± 244",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 369044,
            "range": "± 2356",
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
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1427560,
            "range": "± 18821",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 168674,
            "range": "± 2332",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1947323,
            "range": "± 19875",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 34099392,
            "range": "± 3566506",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 131359,
            "range": "± 5899",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1225620,
            "range": "± 11137",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 19217405,
            "range": "± 2415399",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4223,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 45307,
            "range": "± 109",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 763608,
            "range": "± 12427",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 60709,
            "range": "± 218",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 711414,
            "range": "± 11147",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 9325449,
            "range": "± 680668",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 742,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 6527,
            "range": "± 64",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 96060,
            "range": "± 326",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 20964,
            "range": "± 48",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 146221,
            "range": "± 426",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1355832,
            "range": "± 17717",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "d00c2c209bf830e4f0ae6425c8b5fef062e80b87",
          "message": "fix(validate): suppress prose-mention warning when no link type can connect the types (REQ-155, #353) (#407)\n\nTriaged from the #353 thread — the `sigil` project's \"finding B\". After an\nagent edited a `cybersecurity-design` artifact's description to mention\n\"UCA-4\" as rationale, `rivet validate` raised:\n\n    WARN: [CD-22] prose mentions 'UCA-4' but no typed link to it;\n          add a link in `links:` or remove the mention\n\nTwo defects:\n1. Unactionable. `cybersecurity-design` only permits `satisfies ->\n   cybersecurity-req`; the schema defines NO link type that could connect a\n   design to a `uca`. The advised \"add a link in `links:`\" is impossible —\n   the warning can only ever be cleared by rewording prose.\n2. False-trace pressure. The prose \"UCA-4\" referred to a local STPA report's\n   numbering, but `UCA-4` resolves to an unrelated artifact. Following the\n   advice would have fabricated a wrong trace link.\n\nFix: in the prose-mention pass, suppress the diagnostic when the project\nschema permits no link type whose `source-types` allows the mentioning\nartifact's type AND whose `target-types` allows the mentioned artifact's\ntype. Link types with empty source/target (\"any -> any\") keep permissive\nschemas unaffected; only fully-constrained schemas trigger suppression.\nWhen a link IS schema-valid the warning fires unchanged.\n\nNew unit test `prose_mention_suppressed_when_no_schema_valid_link_type`\n(design mentions an unlinkable `uca` and a linkable `requirement` -> exactly\none warning, for the requirement). Existing `prose_mention_*` tests updated\nto declare a permitting link type so the warn-path fixtures still warn.\nclippy --all-targets + fmt clean; rivet validate PASS, docs check PASS.\n\nFixes: REQ-155\nRefs: REQ-004\n\nCo-authored-by: Claude Opus 4.8 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-06-02T17:40:30-05:00",
          "tree_id": "f4fe5de50307a9092382d2106462b77be3399fdc",
          "url": "https://github.com/pulseengine/rivet/commit/d00c2c209bf830e4f0ae6425c8b5fef062e80b87"
        },
        "date": 1780440435379,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 83407,
            "range": "± 681",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 889510,
            "range": "± 25045",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 15423045,
            "range": "± 861068",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2136,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25889,
            "range": "± 151",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 360452,
            "range": "± 2559",
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
            "range": "± 15",
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
            "value": 1449525,
            "range": "± 24002",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 165700,
            "range": "± 411",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1865164,
            "range": "± 16528",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 28186244,
            "range": "± 1571130",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 142379,
            "range": "± 3936",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1199835,
            "range": "± 22547",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 15295470,
            "range": "± 1193637",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4366,
            "range": "± 24",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 63585,
            "range": "± 514",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 776445,
            "range": "± 11679",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 60396,
            "range": "± 373",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 706547,
            "range": "± 4206",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 9216500,
            "range": "± 813945",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 763,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7248,
            "range": "± 54",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 142022,
            "range": "± 1859",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22845,
            "range": "± 77",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 158325,
            "range": "± 3163",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1476017,
            "range": "± 46283",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "143e003dae20760da1950a80fabee9e59a389002",
          "message": "feat(validate): add coverage-rule-consistency schema check (REQ-148, #350) (#409)\n\nTriaged from #350: an agent marking a sw-req verified hit a confusing\ndetour. The aspice coverage rule `swe1-has-verification` advertises\n`from-types: [sw-verification, unit-verification, sw-integration-verification]`,\nbut the link-target rules only let `sw-verification` form a\n`verifies -> sw-req` link (unit-verification verifies sw-detail-design;\nsw-integration-verification verifies arch/detail-design). So two of the\nthree advertised satisfiers can NEVER form that backlink — the agent\nauthored a forbidden `unit-verification -> sw-req` link and got rejected,\nwith nothing explaining why.\n\nAdd a generic schema-consistency meta-check (sibling of\n`conditional-rule-consistency`): for each `required-backlink` rule, flag\nany `from-type` whose declared link-field for that link type demonstrably\nexcludes the rule's `source-type`. Emits a `coverage-rule-consistency`\nwarning naming the rule, the unreachable from-type, what its link-field\nactually targets, and the remedy. `alternate-backlinks` are checked\nagainst their own link type.\n\nConservative — prefers false-negatives: only flags when the from-type\n*declares* a matching link-field that excludes the target. A from-type\nwith no such link-field (target-unconstrained) is not flagged.\n\nWired into all three validation entrypoints — direct\n(`validate_with_externals_and_variant`) and both salsa queries\n(`db.rs`) — so it never diverges between `rivet validate` and\n`validate --direct` (cf. REQ-146).\n\nVerified: on a project loading the aspice schema, `rivet validate`\n(default salsa) and `--direct` both now emit 2 coverage-rule-consistency\nwarnings (unit-verification + sw-integration-verification), and none for\nthe reachable sw-verification. rivet repo itself still PASS (197) — it\ndoesn't load aspice, so no new noise. Unit tests cover the flag + silent\ncases. clippy --all-targets + fmt clean; 1103 rivet-core lib tests pass;\ndocs check PASS.\n\nWhether the aspice `from-types` are themselves wrong (ASPICE intent) is a\nmaintainer/compliance call, tracked on #350/#355 — separate from this\ngeneric check.\n\nImplements: REQ-148\nRefs: REQ-146\n\nCo-authored-by: Claude Opus 4.8 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-06-02T18:53:40-05:00",
          "tree_id": "2b1cb283f8f8a806bae0d6bde362c45334c34f94",
          "url": "https://github.com/pulseengine/rivet/commit/143e003dae20760da1950a80fabee9e59a389002"
        },
        "date": 1780444826100,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84890,
            "range": "± 427",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 898970,
            "range": "± 21105",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 16116963,
            "range": "± 1376118",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2223,
            "range": "± 20",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24975,
            "range": "± 390",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 380254,
            "range": "± 2262",
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
            "value": 1448988,
            "range": "± 21862",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 166613,
            "range": "± 2081",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1922667,
            "range": "± 19255",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 35941046,
            "range": "± 3382058",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 138733,
            "range": "± 2651",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1195844,
            "range": "± 28587",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 19373744,
            "range": "± 1998462",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4284,
            "range": "± 26",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 62069,
            "range": "± 650",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 781244,
            "range": "± 12202",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 58236,
            "range": "± 556",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 673364,
            "range": "± 3358",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 10301475,
            "range": "± 570245",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 786,
            "range": "± 11",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7253,
            "range": "± 127",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 127985,
            "range": "± 1104",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 26420,
            "range": "± 234",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 195669,
            "range": "± 1791",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1765912,
            "range": "± 14352",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "2db8a9067303c904f2f5fec71aa0ce129269d837",
          "message": "refactor(validate): single chokepoint for schema-level consistency checks (REQ-156, #410) (#411)\n\nSelf-found while landing REQ-148 (#409): adding a schema-level consistency\ncheck required hand-registering the same call in THREE validation\nentrypoints — `validate_with_externals_and_variant` (direct) and the two\nsalsa queries in db.rs. If a future check is added to only some sites,\n`rivet validate` (salsa, default) and `validate --direct` silently\ndisagree — the exact divergence class REQ-146 just fixed for status-gate\nrules.\n\nHoist all schema-level consistency checks (conditional-rule dup/overlap +\ncoverage-rule reachability) behind a single\n`Schema::consistency_diagnostics()`. All three entrypoints now call only\nthat method, so a new check is a one-line edit that can't be partially\napplied across paths.\n\nPure refactor — diagnostic output unchanged. Verified: `rivet validate`\nand `validate --direct` on the rivet repo both PASS (198) with identical\nResult lines. New unit test\n`consistency_diagnostics_aggregates_conditional_and_coverage_checks`\nasserts the chokepoint surfaces both check families. 1104 rivet-core lib\ntests pass; clippy --all-targets + fmt clean; docs check PASS.\n\nImplements: REQ-156\nRefs: REQ-146, REQ-148\n\nCo-authored-by: Claude Opus 4.8 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-06-02T19:37:52-05:00",
          "tree_id": "a85153febd67c83c38c27f1deaed0226ed0adcfc",
          "url": "https://github.com/pulseengine/rivet/commit/2db8a9067303c904f2f5fec71aa0ce129269d837"
        },
        "date": 1780447471347,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 83380,
            "range": "± 3564",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 892990,
            "range": "± 17273",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 18384386,
            "range": "± 1630590",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2173,
            "range": "± 9",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 27327,
            "range": "± 494",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 353014,
            "range": "± 3113",
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
            "value": 1479796,
            "range": "± 32943",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 163339,
            "range": "± 1625",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1907567,
            "range": "± 17760",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 27968475,
            "range": "± 779182",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 141844,
            "range": "± 853",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1219583,
            "range": "± 33680",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 14022442,
            "range": "± 370257",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4329,
            "range": "± 23",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 58513,
            "range": "± 216",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 808313,
            "range": "± 4386",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 60968,
            "range": "± 1111",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 690883,
            "range": "± 2784",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7644864,
            "range": "± 276154",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 769,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7394,
            "range": "± 40",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 115301,
            "range": "± 645",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 24414,
            "range": "± 217",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 177007,
            "range": "± 3047",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1555316,
            "range": "± 23825",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "4e9f60bf01a2a908956dc887a936483fd1966113",
          "message": "fix(validate): emit the per-file parse-error skip WARN once, not twice (REQ-157, #406) (#412)\n\nFrom #406 (self-found while dogfooding REQ-154). `rivet validate` printed\nthe per-file `skipping <file>: YAML parse error …` WARN twice for one\nmalformed `generic-yaml` source: `cmd_validate` loads the project via\n`ProjectContext::load` (WARN #1), then re-scans every source with\n`load_artifacts_with_report` for the REQ-075 duplicate-id / REQ-062 skip\npass — a second `load_artifacts` → `import_generic_directory` → WARN #2.\n\nPer the maintainer's decision on #406 (option A, narrow): kill the\nduplicate on the validate path only; other commands keep their per-file\nWARN (they aren't covered by `warn_parse_error_skips()` yet).\n\nThread `warn_skips: bool` into `GenericYamlAdapter` /\n`import_generic_directory`; add `load_artifacts_quiet` +\n`load_artifacts_with_report_quiet` (public `load_artifacts` signature\nuntouched). `cmd_validate`'s re-scan uses the quiet report loader, so the\nWARN fires once (from the initial load) while the skips/duplicates — and\nthe hard `artifact-parse-error` / `duplicate-artifact-id` ERROR\ndiagnostics derived from them — are identical.\n\nVerified on the #406 repro: skip-WARN count 2 → 1; the ERROR still fires\nand `Result: FAIL`. rivet repo validate still PASS (200, 0 skip warns).\nNew regression test\n`validate_emits_single_skip_warn_for_malformed_source`; 1104 rivet-core\nlib + 111 cli_commands tests pass; clippy --all-targets + fmt clean; docs\ncheck PASS.\n\nFixes: REQ-157\nRefs: REQ-062, REQ-075\n\nCo-authored-by: Claude Opus 4.8 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-06-02T20:47:42-05:00",
          "tree_id": "44079c57aba607e000eed0d885a3d27fb57d1b78",
          "url": "https://github.com/pulseengine/rivet/commit/4e9f60bf01a2a908956dc887a936483fd1966113"
        },
        "date": 1780451660669,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84944,
            "range": "± 275",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 910041,
            "range": "± 5445",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13784993,
            "range": "± 629301",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1945,
            "range": "± 9",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25008,
            "range": "± 89",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 362099,
            "range": "± 1684",
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
            "value": 1451092,
            "range": "± 15247",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 167785,
            "range": "± 986",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1942898,
            "range": "± 11626",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 28844583,
            "range": "± 1256458",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 131734,
            "range": "± 636",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1210263,
            "range": "± 25187",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 14662855,
            "range": "± 222925",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4133,
            "range": "± 24",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 45517,
            "range": "± 187",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 754814,
            "range": "± 3896",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 61295,
            "range": "± 130",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 703779,
            "range": "± 1937",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7712148,
            "range": "± 63905",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 736,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 6466,
            "range": "± 69",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 96547,
            "range": "± 483",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22338,
            "range": "± 204",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 158414,
            "range": "± 630",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1487119,
            "range": "± 8320",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "4b4a169d96aa95974f7713ab5c406a04e1d4f3dc",
          "message": "feat(validate,add): near-duplicate-intent detection (REQ-158, #397) (#413)\n\nFrom #397: `rivet add` rejects a duplicate *id* but nothing flags a\nduplicate *intent* — two artifacts that say the same thing under\ndifferent ids — so a long-lived backlog accretes near-duplicate\nrequirements.\n\nNew shared `rivet_core::similarity` signal: Jaccard overlap of\nsignificant title tokens (lowercase, alphanumeric split, stopwords +\nsub-3-char tokens dropped), bounded [0,1], every component inspectable\n(bounded-composite-score doctrine). Threshold 0.6, empirically calibrated\nagainst the rivet repo's own 158 requirements — ZERO pairs at 0.6 (1 at\n0.5), so the default doesn't flood a well-differentiated backlog.\n\nTwo surfaces, one implementation so they can't disagree:\n- `rivet validate` emits a `near-duplicate-intent` INFO diagnostic for\n  each same-type, non-external artifact pair at/above threshold. INFO\n  never blocks. Placed in the shared `validate_structural*` pass so it\n  runs on BOTH the salsa and --direct paths (REQ-156 parity).\n- `rivet add` prints a non-blocking `note: intent is N% similar to <ID>`\n  when the new title is similar to an existing same-type artifact, then\n  adds anyway.\n\nVerified: fixture with REQ-1/REQ-2 (near-identical) + REQ-3 (distinct) ->\nexactly one near-duplicate-intent diagnostic, on REQ-2, none for REQ-3;\n`add` of a similar title prints the note + still adds, a distinct title\nprints nothing. rivet repo validate emits 0 near-duplicate-intent and\nstill PASS. similarity unit tests + cli_commands integration test;\nclippy --all-targets + fmt clean; docs check PASS.\n\nDeferred (noted on #397): per-rule `allow:` suppression in rivet.yaml —\nno general diagnostic-suppression config exists yet; INFO severity keeps\nit non-disruptive until it does.\n\nImplements: REQ-158\nRefs: REQ-156\n\nCo-authored-by: Claude Opus 4.8 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-06-02T21:54:15-05:00",
          "tree_id": "231a4441fa1987cea99e07fe60d9965822cb4c1b",
          "url": "https://github.com/pulseengine/rivet/commit/4b4a169d96aa95974f7713ab5c406a04e1d4f3dc"
        },
        "date": 1780455753660,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85938,
            "range": "± 366",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 933856,
            "range": "± 84748",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14864485,
            "range": "± 2149182",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1924,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25202,
            "range": "± 53",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 357748,
            "range": "± 7087",
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
            "range": "± 3",
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
            "value": 1485049,
            "range": "± 22762",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 167592,
            "range": "± 1395",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1983434,
            "range": "± 75610",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 30855637,
            "range": "± 2323563",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 441375,
            "range": "± 1757",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 15216031,
            "range": "± 159718",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1135867158,
            "range": "± 14946393",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4198,
            "range": "± 65",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 46439,
            "range": "± 199",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 767611,
            "range": "± 13590",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 63441,
            "range": "± 300",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 716456,
            "range": "± 2936",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8852998,
            "range": "± 411376",
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
            "value": 6825,
            "range": "± 172",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 101003,
            "range": "± 3129",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22190,
            "range": "± 60",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 158526,
            "range": "± 463",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1502000,
            "range": "± 45728",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "3a430d6e4c351bd71a7409864ee444dfa570152d",
          "message": "fix(add): deterministic near-duplicate note + correct REQ-158 self-count (#397) (#414)\n\n* docs(REQ-158): correct the near-duplicate-intent self-count (#397)\n\nSelf-correction. The REQ-158 acceptance + CHANGELOG claimed `rivet\nvalidate` \"emits zero near-duplicate-intent diagnostics\" on the rivet\nrepo. That was a verification error: I grepped the *text* output for the\nrule id `near-duplicate-intent`, which only appears in `--format json` —\nso I saw 0 where there were actually 10.\n\nAuthoritative count (JSON): the rivet repo surfaces 10\nnear-duplicate-intent INFO diagnostics, all genuine same-type duplicates\n(e.g. TEST-006/FEAT-013 both type `feature` titled \"Property-based tests\n(proptest)\"; SC-LSP-008/SC-11 both `system-constraint` stating\nidentical-results-to-full-validation). All INFO, so `validate` still\nPASS. The 158 *requirements* alone do produce zero pairs — that part of\nthe calibration held; the error was generalising it to all types.\n\nThe findings are true positives (the feature working as intended), not\nnoise. Corrects the docs to match reality.\n\nImplements: REQ-158\n\n* fix(add): deterministic near-duplicate tie-break by lowest id (REQ-158, #397)\n\nCI caught a real nondeterminism bug I introduced in #413. The `rivet add`\nnear-duplicate note picked the most-similar existing artifact via a\nstrict `>` over `store.iter()` (HashMap order), so when two artifacts are\nEQUALLY similar (e.g. titles identical after stopword-stripping) it named\nwhichever the hash happened to yield first. The new\n`near_duplicate_intent_validate_and_add` test passed locally (picked\nREQ-1) but failed in the proptest job's run (picked REQ-2) — same code,\ndifferent hash order.\n\nBreak ties by lowest id so the note is reproducible. The `validate`\nnear-duplicate pass already sorts by id and was never affected.\n\nVerified stable across 5 local runs. clippy --all-targets + fmt clean.\n\nFixes: REQ-158",
          "timestamp": "2026-06-02T22:23:43-05:00",
          "tree_id": "196f25af54f594d5a38bc103b70d61330cf87e8e",
          "url": "https://github.com/pulseengine/rivet/commit/3a430d6e4c351bd71a7409864ee444dfa570152d"
        },
        "date": 1780457544351,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84064,
            "range": "± 252",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 881698,
            "range": "± 5551",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12009555,
            "range": "± 314679",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2138,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26661,
            "range": "± 74",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 391727,
            "range": "± 1531",
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
            "value": 1460472,
            "range": "± 20969",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 163541,
            "range": "± 3205",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1897213,
            "range": "± 6256",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 24333820,
            "range": "± 228413",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 447790,
            "range": "± 2628",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 16064488,
            "range": "± 112196",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1330665223,
            "range": "± 14414058",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4407,
            "range": "± 17",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 59130,
            "range": "± 256",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 742103,
            "range": "± 3290",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 60358,
            "range": "± 576",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 689133,
            "range": "± 2895",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7446187,
            "range": "± 85106",
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
            "value": 7381,
            "range": "± 71",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 116782,
            "range": "± 653",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 24089,
            "range": "± 123",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 171325,
            "range": "± 780",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1609944,
            "range": "± 21551",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "8e9a9d13c1532e7bd5da8c69735992c21f724f48",
          "message": "feat(store): deterministic iter_sorted() + document iter() nondeterminism (REQ-159, #415) (#416)\n\nSelf-found while landing REQ-158 (#415). `Store::iter()` returns\n`HashMap::values()`, whose order varies per process — so any caller that\nproduces stable output or picks one representative among ties is silently\nnondeterministic. That is exactly how the REQ-158 `rivet add`\nnear-duplicate note picked REQ-1 locally but REQ-2 in CI (same code,\ndifferent hash seed), making the proptest job flaky on main until #414\nadded an explicit tie-break.\n\nMinimal, non-breaking hardening:\n- Document on `iter()` that order is unspecified and that output/selection\n  callers must sort.\n- Add `Store::iter_sorted()` (ascending by id) so the deterministic path\n  is the easy one.\n\nMigrating existing `store.iter().collect::<Vec>()` output sites and the\nlarger ordered-map-backing option are deferred to #415 (per-site audit;\nsome already sort downstream).\n\nUnit test `iter_sorted_is_deterministic_by_id`; rivet validate PASS, docs\ncheck PASS; clippy --all-targets + fmt clean.\n\nImplements: REQ-159\nRefs: REQ-158",
          "timestamp": "2026-06-02T22:42:06-05:00",
          "tree_id": "bcbc5ce545e77aad64bd69b8a417ede063491514",
          "url": "https://github.com/pulseengine/rivet/commit/8e9a9d13c1532e7bd5da8c69735992c21f724f48"
        },
        "date": 1780458623717,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85021,
            "range": "± 353",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 935575,
            "range": "± 12362",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 16109213,
            "range": "± 1443490",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1957,
            "range": "± 11",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25026,
            "range": "± 752",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 366991,
            "range": "± 8464",
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
            "value": 1423039,
            "range": "± 29391",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 166656,
            "range": "± 5734",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1935815,
            "range": "± 14489",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 29385885,
            "range": "± 1979261",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 432524,
            "range": "± 6296",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 14523970,
            "range": "± 369025",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1065511243,
            "range": "± 16422656",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4149,
            "range": "± 13",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 44100,
            "range": "± 430",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 731830,
            "range": "± 7835",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 65334,
            "range": "± 495",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 727070,
            "range": "± 12085",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8587007,
            "range": "± 909696",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 750,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 6734,
            "range": "± 133",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 101496,
            "range": "± 580",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21481,
            "range": "± 37",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 151073,
            "range": "± 1387",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1401720,
            "range": "± 9921",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "debde095637b76bf069b13a60420d7af414c895f",
          "message": "fix(query,export,migrate): deterministic order over the HashMap-backed store (REQ-160, #415) (#417)\n\nFollow-up to REQ-159: migrate the `store.iter().collect()` sites that\nproduce ordered, user-facing output so they're reproducible across runs.\n\nAudited every site. Order-irrelevant ones (HashSet<id> membership) left\nas-is; render/externals.rs already sorted. Fixed the output sites:\n- `query::execute` returns results ascending by id — the shared set behind\n  `rivet list` (whose default path did NOT sort), the MCP query tool, and\n  `{{query:…}}` embeds, so all become deterministic at one chokepoint.\n- `cmd_export` (ReqIF/etc.) and `cmd_export_zola` sort by id before\n  emitting, so exports are byte-reproducible.\n- `rivet schema migrate` sorts before computing the rewrite map so the\n  generated migration is reproducible.\n\nVerified: `rivet list --format json` id order identical across runs; new\n`execute_returns_results_sorted_by_id` test; export_reqif_roundtrip /\nexport_zola / migrate_integration suites still pass; rivet-core query (19)\n+ cli_commands (112) green; rivet validate PASS, docs check PASS; clippy\n--all-targets + fmt clean.\n\nImplements: REQ-160\nRefs: REQ-159",
          "timestamp": "2026-06-02T23:28:31-05:00",
          "tree_id": "f7b03b4587a96591c9faccb02188a731a04ce957",
          "url": "https://github.com/pulseengine/rivet/commit/debde095637b76bf069b13a60420d7af414c895f"
        },
        "date": 1780461441391,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 88628,
            "range": "± 323",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 940639,
            "range": "± 7684",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13374176,
            "range": "± 527633",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2207,
            "range": "± 9",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25816,
            "range": "± 233",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 388940,
            "range": "± 16266",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 94,
            "range": "± 2",
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
            "value": 1464570,
            "range": "± 24586",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 160156,
            "range": "± 5543",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1924016,
            "range": "± 9294",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 25492597,
            "range": "± 1250611",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 445482,
            "range": "± 4816",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 16562892,
            "range": "± 137067",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1402934625,
            "range": "± 12339504",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4291,
            "range": "± 17",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 62817,
            "range": "± 1791",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 741516,
            "range": "± 6025",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 60429,
            "range": "± 290",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 665898,
            "range": "± 3773",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8921603,
            "range": "± 359858",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1301,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15361,
            "range": "± 177",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 350223,
            "range": "± 1893",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23288,
            "range": "± 79",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 165924,
            "range": "± 780",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1464908,
            "range": "± 19743",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "950c605422aac68c8edb56a9d35ebd309b46f225",
          "message": "feat(validate): --structural gates on integrity only, via Diagnostic::is_structural() (REQ-161, #408) (#418)\n\nFrom #408 (and the recurring #353/#355 ask): `rivet validate`'s PASS/FAIL\nlumps structural integrity (a broken graph) together with coverage/lint\nfindings, so a bulk status-flip can't tell \"did I break the graph?\" from\n\"the project is still incomplete\". spar/sigil both hand-rolled a\n`0 broken cross-refs` gate for exactly this.\n\nAdd `Diagnostic::is_structural()` — an explicit allowlist of the\nstructural rule ids (broken-link, duplicate-artifact-id,\nartifact-parse-error, link-target-type, cardinality, known-type,\nunknown-link-type, doc-broken-ref, yaml-type-coercion,\nconditional-rule-consistency, coverage-rule-consistency). Everything else\nis coverage/lint, including the three borderline rules required-field /\nunknown-field / status-allowed-values (an incomplete/extra/typo'd field\ndoesn't break the graph) and all schema-defined coverage/status-gate\nrules.\n\n`rivet validate --structural` retains only structural diagnostics before\ncounting/display, so the shown set, counts, and PASS/FAIL exit reflect\nstructural-only. No rename of `validate_structural*` (its name is\nunrelated to this gate) — the classification lives on Diagnostic (#408\noption b).\n\nVerified: rivet repo `validate --structural` PASSes with 0 shown (its\n206 warnings are all coverage/lint); a broken-link fixture FAILs\n--structural; a coverage-only fixture PASSes. Unit test enumerates every\nbuilt-in rule's class; CLI test covers the gate. clippy --all-targets +\nfmt clean; docs check PASS.\n\nImplements: REQ-161",
          "timestamp": "2026-06-03T00:08:15-05:00",
          "tree_id": "15926bdb8baca69a2c86fc605c7a8686a07c2a8b",
          "url": "https://github.com/pulseengine/rivet/commit/950c605422aac68c8edb56a9d35ebd309b46f225"
        },
        "date": 1780464006743,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85487,
            "range": "± 417",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 915451,
            "range": "± 7990",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13425201,
            "range": "± 209573",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1948,
            "range": "± 19",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25110,
            "range": "± 388",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 352881,
            "range": "± 2165",
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
            "value": 1460190,
            "range": "± 30720",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 166198,
            "range": "± 1377",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1912509,
            "range": "± 17620",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 27522343,
            "range": "± 318383",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 443321,
            "range": "± 2266",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 16654486,
            "range": "± 241635",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1260940240,
            "range": "± 24974028",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4255,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 44712,
            "range": "± 163",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 721286,
            "range": "± 4495",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 62792,
            "range": "± 383",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 702176,
            "range": "± 3012",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7736329,
            "range": "± 68004",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1260,
            "range": "± 9",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15099,
            "range": "± 87",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 232623,
            "range": "± 1748",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 20918,
            "range": "± 43",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 143502,
            "range": "± 3523",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1336563,
            "range": "± 13027",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "796e7be7bd5bf6dfd71bd23cc4725157666da0ae",
          "message": "ci(compliance): forward version-switcher + back-link inputs to the report action (REQ-163, #420) (#421)\n\nMaintainer reported the published 0.15.0 compliance report lost the version\nselector and \"back\" nav that 0.1.0 has. `rivet export --format html` still\nsupports --homepage / --versions / --version-label, and the compliance\naction exposes them as homepage / other-versions / report-label — but the\nCI never supplied them:\n- `compliance.yml` passed `version:` (not an action input -> silently\n  ignored; the label input is `report-label`) and never exposed\n  `other-versions`, so a caller couldn't get a switcher;\n- `release.yml`'s compliance step passed no homepage/report-label.\n\n`compliance.yml` now maps version -> report-label and adds an\n`other-versions` passthrough input; `release.yml` labels with the release\ntag and sets a default homepage. Both files parse as valid YAML.\n\nThe cross-version switcher inherently needs the full published-version\nlist, which only the pulseengine.eu site pipeline knows — that remains the\nroot-cause fix for the live regression (tracked on #420, along with the\nsite's expired TLS cert).\n\nImplements: REQ-163\nRefs: REQ-090\nTrace: skip",
          "timestamp": "2026-06-03T01:20:08-05:00",
          "tree_id": "92844078f1516dc58504ebb497584466f7f2c8df",
          "url": "https://github.com/pulseengine/rivet/commit/796e7be7bd5bf6dfd71bd23cc4725157666da0ae"
        },
        "date": 1780468153663,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84484,
            "range": "± 511",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 899556,
            "range": "± 11930",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 15999430,
            "range": "± 521688",
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
            "value": 27052,
            "range": "± 194",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 367782,
            "range": "± 1530",
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
            "value": 1469933,
            "range": "± 30561",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 162317,
            "range": "± 747",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1883692,
            "range": "± 20065",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 32837932,
            "range": "± 2370091",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 455729,
            "range": "± 2238",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 16286386,
            "range": "± 97220",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1408531909,
            "range": "± 17089153",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4296,
            "range": "± 26",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60004,
            "range": "± 938",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 744009,
            "range": "± 4634",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 60775,
            "range": "± 304",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 682999,
            "range": "± 17776",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 9588685,
            "range": "± 467383",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1262,
            "range": "± 15",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15204,
            "range": "± 298",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 319894,
            "range": "± 1435",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22447,
            "range": "± 89",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 156173,
            "range": "± 2137",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1446686,
            "range": "± 36677",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "973c41945bee4b32b00615db8490486d237820e0",
          "message": "chore(git): union-merge driver for CHANGELOG to cut parallel-PR conflicts (REQ-164, #422) (#423)\n\nSelf-found while landing several one-REQ-per-PR changes in one session:\nevery PR conflicts in CHANGELOG.md (entries at the top of `[Unreleased]`)\nand requirements.yaml, forcing a manual resolve each time.\n\nAdd `.gitattributes` `CHANGELOG.md merge=union` — git's built-in union\ndriver keeps both sides' added lines instead of conflicting (safe for an\nappend-only prose log). Deliberately NOT applied to artifacts/*.yaml:\nunion-concatenating conflicting YAML hunks can silently produce malformed\nYAML, worse than a conflict that forces review — the guidance there is to\nappend REQs at EOF (as REQ-164 itself does) or use `rivet add`.\n\nREQ-164 artifact appended at end-of-file (practising the guidance).\nrivet validate PASS.\n\nImplements: REQ-164\nRefs: REQ-007\nTrace: skip",
          "timestamp": "2026-06-03T02:15:56-05:00",
          "tree_id": "9e4542c19d767fb2017c6df362d823bba89166b8",
          "url": "https://github.com/pulseengine/rivet/commit/973c41945bee4b32b00615db8490486d237820e0"
        },
        "date": 1780471505721,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 83810,
            "range": "± 330",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 895336,
            "range": "± 12440",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14826709,
            "range": "± 1071488",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2132,
            "range": "± 14",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26898,
            "range": "± 175",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 364097,
            "range": "± 2598",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 94,
            "range": "± 3",
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
            "value": 1458814,
            "range": "± 18258",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 161869,
            "range": "± 751",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1910101,
            "range": "± 12232",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 34113409,
            "range": "± 3826104",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 454976,
            "range": "± 6448",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 17246936,
            "range": "± 264245",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1411039780,
            "range": "± 15765540",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4353,
            "range": "± 20",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60147,
            "range": "± 519",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 741397,
            "range": "± 3355",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 64274,
            "range": "± 278",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 695247,
            "range": "± 3630",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7813180,
            "range": "± 288601",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1199,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15225,
            "range": "± 47",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 324013,
            "range": "± 6405",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22367,
            "range": "± 133",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 156141,
            "range": "± 1805",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1445541,
            "range": "± 23762",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
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
      }
    ]
  }
}