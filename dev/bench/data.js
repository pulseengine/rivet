window.BENCHMARK_DATA = {
  "lastUpdate": 1780119106387,
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
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
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
      }
    ]
  }
}