window.BENCHMARK_DATA = {
  "lastUpdate": 1785951396412,
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
          "id": "173fedd1af502f3c321e72c82a3292ce9d20ced2",
          "message": "fix(variant): validate binding artifact IDs + constraint feature names exist (REQ-258, REQ-259, DD-076) (#705)\n\nTwo P0 linkage-validation gaps (DD-076, fail-loud over silent-pass):\n\nREQ-258 — a binding mapping a feature to a nonexistent artifact ID (e.g.\nGHOST-999) flowed through silently. `rivet validate --model --binding` now\nchecks every bound artifact ID against the loaded store and ERRORS on a\ndangling id (this is the layer with store access; feature_model::solve has no\nartifact knowledge). Also FIXES the committed-broken\nartifacts/variants/full-desktop.yaml, which selected 30+ features absent from\nthe model — it now selects real features (core-cli + dashboard), and the model's\n`scope` group is widened `alternative`→`or` so a composite CLI+dashboard build\nis expressible without breaking the single-surface variants.\n\nREQ-259 — a constraint referencing a feature NAME not in the model was\nvacuously satisfied (a typo silently disabled the guard). solve() now walks\neach constraint's feature-name leaves and emits SolveError::UnknownConstraintFeature\non an unknown name, instead of a silent pass.\n\nConfirmed with new tests (validate_flags_dangling_artifact_id_in_binding,\nconstraint_referencing_unknown_feature_fails_loud + regressions), the full\nvariant/feature-model suite (62 rivet-core + 35 rivet-cli variant tests, all\npass — the alternative→or model change regresses nothing), `rivet variant check`\non the fixed full-desktop (exit 0), a build, clippy --all-targets on Rust 1.97\nclean, and `rivet validate` PASS.\n\nImplements: REQ-258, REQ-259\nRefs: DD-076, FEAT-001",
          "timestamp": "2026-07-15T17:40:48+02:00",
          "tree_id": "c3ae227b81c500abeac8386b0c0e5b443292f811",
          "url": "https://github.com/pulseengine/rivet/commit/173fedd1af502f3c321e72c82a3292ce9d20ced2"
        },
        "date": 1784130570755,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 87130,
            "range": "± 1982",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 936405,
            "range": "± 12246",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 17968510,
            "range": "± 1873314",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1941,
            "range": "± 55",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24846,
            "range": "± 103",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 360662,
            "range": "± 2082",
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
            "value": 1525859,
            "range": "± 15710",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 165241,
            "range": "± 6983",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1911826,
            "range": "± 24321",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 40289197,
            "range": "± 2716851",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 449018,
            "range": "± 2035",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 15406607,
            "range": "± 177550",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1088962131,
            "range": "± 17426581",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4273,
            "range": "± 16",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 45092,
            "range": "± 308",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 748028,
            "range": "± 14384",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 63313,
            "range": "± 370",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 729145,
            "range": "± 5509",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8739637,
            "range": "± 559912",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1275,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14890,
            "range": "± 278",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 228777,
            "range": "± 2398",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21387,
            "range": "± 41",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 151236,
            "range": "± 890",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1390990,
            "range": "± 35368",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "a97d168da185fb7795d4002609143f487085c3ed",
          "message": "Merge pull request #706 from pulseengine/release/v0.27.0\n\nchore(release): v0.27.0",
          "timestamp": "2026-07-15T17:58:59+02:00",
          "tree_id": "7397f7c00ea80138128b40ee82b460cec862c057",
          "url": "https://github.com/pulseengine/rivet/commit/a97d168da185fb7795d4002609143f487085c3ed"
        },
        "date": 1784131688521,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 86821,
            "range": "± 236",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 924443,
            "range": "± 15190",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 19080093,
            "range": "± 995586",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2183,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24601,
            "range": "± 446",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 370845,
            "range": "± 1946",
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
            "value": 1515810,
            "range": "± 74568",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 163531,
            "range": "± 1058",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1976500,
            "range": "± 16620",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 44054119,
            "range": "± 4185273",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 484904,
            "range": "± 7955",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 16344817,
            "range": "± 220643",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1274271924,
            "range": "± 13844883",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4317,
            "range": "± 25",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 63287,
            "range": "± 1477",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 768567,
            "range": "± 8994",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 57460,
            "range": "± 300",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 696133,
            "range": "± 8494",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 11192024,
            "range": "± 795662",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1136,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14846,
            "range": "± 317",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 318510,
            "range": "± 19913",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23246,
            "range": "± 156",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 169071,
            "range": "± 1292",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1515947,
            "range": "± 18630",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "bfb1efef4644f50f6fb87ce0d7eda103b10c57ba",
          "message": "ci(toolchain): pin nightly to 2026-07-11 while upstream nightly ICEs (REQ-267) (#707)\n\n* ci(toolchain): pin nightly to 2026-07-11 while upstream nightly ICEs (REQ-267)\n\nNightlies from 2026-07-14 on ICE the compiler while building rivet-core (rustc\npanic in rustc_ast/src/attr/mod.rs, exit 104), reddening every nightly job\nrepo-wide — both Miri jobs, Code Coverage, and Fuzz — and masking the Miri\nUB/safety signal. Core gates (Test/Clippy/Format) stayed green so main was\nhealthy, but CI read red and merges had to --admin past the cluster.\n\nPin all four `dtolnay/rust-toolchain@nightly` uses to `@nightly-2026-07-11`\n(the last main run where the Miri job passed) so they keep ENFORCING on a\nworking compiler rather than being disabled. Unpin to @nightly once a newer\nnightly stops ICEing. Kani's exit-143 failures are a separate runner-shutdown\nflake, unaffected by this.\n\nCI-config only — the shipped binary is unchanged, so no version bump.\nConfirmed ci.yml parses and `rivet validate` PASS.\n\nRefs: REQ-267\n\n* ci(toolchain): fix pin syntax — @master + toolchain input, not action git-ref\n\nThe previous commit pinned via `dtolnay/rust-toolchain@nightly-2026-07-11`,\nbut `@X` is the ACTION's git ref (branch/tag of dtolnay/rust-toolchain), so it\nfailed to resolve (\"unable to find version nightly-2026-07-11\"). Correct form\nis `@master` with the dated toolchain as the `toolchain:` input; the two Miri\njobs keep their `components: miri`. Still REQ-267 (pin to last-good nightly\nwhile upstream ICEs).\n\nTrace: skip\n\n* ci(security): SHA-pin the dtolnay/rust-toolchain action for the nightly jobs (REQ-267)\n\nAutomated security review flagged `@master` as an unpinned third-party action.\nPin the 4 nightly jobs' action ref to a full commit SHA\n(fa04a1451ff1842e2626ccb99004d0195b455a88, dtolnay/rust-toolchain 2026-06-30)\nso the action code is deterministic; the dated toolchain (nightly-2026-07-11)\nstays in the `with: toolchain:` input. `@master` was required (not `@stable`/\n`@nightly`) because only the master branch honours an arbitrary `toolchain:`\noverride — SHA-pinning it removes the mutable-ref risk. (The rest of the file's\n@stable/@nightly dtolnay refs are a pre-existing repo convention; a repo-wide\nSHA-pin sweep is a separate hardening task.)\n\nTrace: skip",
          "timestamp": "2026-07-15T23:46:53+02:00",
          "tree_id": "f80f7995994c391069052961ff0ed2e67808abde",
          "url": "https://github.com/pulseengine/rivet/commit/bfb1efef4644f50f6fb87ce0d7eda103b10c57ba"
        },
        "date": 1784152792893,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 87265,
            "range": "± 352",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 955129,
            "range": "± 17178",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 23509988,
            "range": "± 1477157",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1934,
            "range": "± 19",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24983,
            "range": "± 203",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 362776,
            "range": "± 2342",
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
            "value": 1531698,
            "range": "± 25379",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 169146,
            "range": "± 2677",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1985076,
            "range": "± 107200",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 58682970,
            "range": "± 6171765",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 456187,
            "range": "± 7522",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 16017557,
            "range": "± 340128",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1108502506,
            "range": "± 16409790",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4223,
            "range": "± 14",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 44609,
            "range": "± 278",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 733529,
            "range": "± 3871",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 63529,
            "range": "± 183",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 730439,
            "range": "± 3211",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 10986165,
            "range": "± 810426",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1146,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14510,
            "range": "± 25",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 229707,
            "range": "± 1882",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21863,
            "range": "± 256",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 152651,
            "range": "± 738",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1401719,
            "range": "± 21812",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "0b44048bee8959b33d5e94e125e7fabba30a81c5",
          "message": "plan(roadmap): sequence v0.28-v0.30 — retag REQ-265/266 → v0.29, file REQ-268 (wasm-seam gate) → v0.30 (#708)\n\nApproved release roadmap after v0.27.0:\n- v0.28.0 = variant hardening pt2 / P1 silent-drops (REQ-260 discover .ok(),\n  REQ-261 attribute_warnings, REQ-262 serve wrapped-variant, REQ-263 CI variant\n  gate) — unchanged.\n- v0.29.0 = variant source-linkage + verification depth (REQ-265, REQ-266),\n  retagged from v0.28 so v0.28 stays a cohesive P1 slice.\n- v0.30.0 = CI resilience — REQ-268 (new): a per-PR CI gate that builds the wasm\n  seam (compose-witness component + `wasm` feature), which today builds only in\n  release.yml, so a change can rot the meld→loom→synth seam undetected.\n\nParked (cross-repo blocked): REQ-252 (crates.io), REQ-255 (ordeal cert).\nConfirmed with `rivet validate` PASS. (Local `docs check` shows a false\nVersionConsistency positive from a stale 0.26.0 dev binary; all files are 0.27.0\nand CI's fresh binary passes.)\n\nRefs: REQ-260, REQ-261, REQ-262, REQ-263, REQ-265, REQ-266, REQ-268, DD-076",
          "timestamp": "2026-07-16T00:26:14+02:00",
          "tree_id": "6f3babbacefb6f3a31e90cffac04e42f07f4b07f",
          "url": "https://github.com/pulseengine/rivet/commit/0b44048bee8959b33d5e94e125e7fabba30a81c5"
        },
        "date": 1784155031161,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85309,
            "range": "± 774",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 917662,
            "range": "± 9249",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 15055148,
            "range": "± 507504",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2146,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26339,
            "range": "± 858",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 360918,
            "range": "± 3313",
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
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1519001,
            "range": "± 19671",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 162832,
            "range": "± 2540",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1941880,
            "range": "± 20064",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 31321621,
            "range": "± 2028789",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 471441,
            "range": "± 2680",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 15637395,
            "range": "± 191741",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1239610419,
            "range": "± 13679419",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4437,
            "range": "± 16",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60362,
            "range": "± 300",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 786184,
            "range": "± 5630",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 61469,
            "range": "± 201",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 704224,
            "range": "± 4625",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7571726,
            "range": "± 204864",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1100,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14281,
            "range": "± 156",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 331066,
            "range": "± 2640",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23805,
            "range": "± 282",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 164864,
            "range": "± 1832",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1504347,
            "range": "± 17241",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "b8da491f415cfc715197e65da55af573fe12a59a",
          "message": "fix(serve): variant discovery surfaces parse errors + reads wrapped variant files (REQ-260, REQ-262, DD-076) (#709)\n\nTwo P1 silent-drops in ProjectVariants::discover (DD-076):\n\nREQ-260 — the three `.ok()` sites swallowed parse failures: a broken (malformed\n/ cyclic / attribute-invalid) feature-model.yaml became model:None and resolve()\nreported the misleading \"no feature model configured\", while a broken\nbindings.yaml rendered artifact_count:0 silently. discover now captures failures\ninto `model_error` + `diagnostics`, logs them, and the /variants page shows a red\n\"Feature model failed to load\" / \"configuration files could not be parsed\" banner\ninstead of \"no variants configured\". resolve() distinguishes model-present-but-\nbroken (returns the parse error) from model-absent (the friendly hint).\n\nREQ-262 — variant files were parsed with raw `serde_yaml::from_str::<VariantConfig>`\n(flat shape only), so an init-scaffolded `variant:`-wrapped file was silently\ninvisible in serve (the #514 regression on the serve path). Now uses\nVariantConfig::from_yaml_str (accepts both shapes); model loading switched\nfrom from_yaml to load() so a composed feature-model-binding file isn't dropped.\n\nConfirmed with 4 new discover tests (broken-model diagnostic, absent-vs-broken,\nwrapped-shape, flat regression; 11 serve::variant + 8 variant_scoped_api pass),\nbuild, clippy --all-targets on Rust 1.97 clean, and fresh-binary rivet validate PASS.\n\nImplements: REQ-260, REQ-262\nRefs: DD-076, FEAT-001",
          "timestamp": "2026-07-16T01:56:11+02:00",
          "tree_id": "870ac39566739e20fd695c3d999a817da9bf6310",
          "url": "https://github.com/pulseengine/rivet/commit/b8da491f415cfc715197e65da55af573fe12a59a"
        },
        "date": 1784160837342,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 87280,
            "range": "± 3007",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 911725,
            "range": "± 5685",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14617137,
            "range": "± 1295802",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2186,
            "range": "± 9",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26081,
            "range": "± 132",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 383212,
            "range": "± 3502",
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
            "value": 1522249,
            "range": "± 41295",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 164114,
            "range": "± 1646",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1951282,
            "range": "± 14925",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 29296156,
            "range": "± 3523731",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 477696,
            "range": "± 3454",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 15619662,
            "range": "± 204549",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1245865096,
            "range": "± 12669821",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4420,
            "range": "± 14",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 58460,
            "range": "± 231",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 814105,
            "range": "± 6890",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 60532,
            "range": "± 231",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 696906,
            "range": "± 2726",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7977061,
            "range": "± 1008369",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1148,
            "range": "± 11",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 13844,
            "range": "± 339",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 335546,
            "range": "± 2581",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22878,
            "range": "± 86",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 161068,
            "range": "± 5637",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1500480,
            "range": "± 21730",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "961f3a367a1baa27fa853398b7048b149333823a",
          "message": "fix(variant): surface feature-model attribute_warnings on the CLI (REQ-261, DD-076) (#711)\n\nFeatureModel.attribute_warnings (unknown feature-attribute keys) was collected\nat load but never surfaced by any CLI path — a typo'd attribute key (e.g.\n`asil-numric: 3`) silently bypassed type/range checking AND its warning was\ndropped (DD-076 silent-drop).\n\nEmit the warnings from the single shared loader load_feature_model_via_project,\nso every consumer (validate --model --binding, release check --variant, variant\nsolve/check/check-all/features) prints each as `warning: feature-model\nattribute: <msg>` on stderr (stdout --format json stays clean). Under\n`rivet validate --strict-variants` the warnings escalate to Severity::Error\ndiagnostics and fail the run (non-zero exit), matching the existing\nstrict-variant mechanism.\n\nConfirmed with 3 new cli_commands tests (surfaces-on-stderr, --strict-variants\nescalation, known-keys-no-warning regression) + the full validate/variant sweep\n(30 pass), build, clippy --all-targets on Rust 1.97 clean, fresh-binary\nrivet validate PASS.\n\nImplements: REQ-261\nRefs: DD-076, FEAT-001",
          "timestamp": "2026-07-16T06:34:04+02:00",
          "tree_id": "d87920c063c50c37ccdcca11c0285f29a2d8ae05",
          "url": "https://github.com/pulseengine/rivet/commit/961f3a367a1baa27fa853398b7048b149333823a"
        },
        "date": 1784176967700,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 80728,
            "range": "± 4253",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 942437,
            "range": "± 5141",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 16157612,
            "range": "± 1430630",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1540,
            "range": "± 10",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 18884,
            "range": "± 207",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 288063,
            "range": "± 3947",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 77,
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
            "value": 77,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1401807,
            "range": "± 22859",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 164674,
            "range": "± 1336",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1890877,
            "range": "± 22493",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 40389503,
            "range": "± 1649390",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 422879,
            "range": "± 4092",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 14831450,
            "range": "± 263584",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 993112886,
            "range": "± 7101749",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3838,
            "range": "± 26",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 40830,
            "range": "± 1804",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 825641,
            "range": "± 9310",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 55585,
            "range": "± 958",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 572672,
            "range": "± 5133",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7492817,
            "range": "± 558856",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 969,
            "range": "± 10",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 12084,
            "range": "± 149",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 284930,
            "range": "± 3800",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 20582,
            "range": "± 289",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 149694,
            "range": "± 1890",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1328358,
            "range": "± 16289",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "aab1c32bf0117dbaf72a52c67660bfe33797abfd",
          "message": "ci(variant): gate PRs on variant + binding soundness (REQ-263, DD-076) (#712)\n\nNo CI gate exercised the project's variants or bindings — the committed-broken\nfull-desktop.yaml (30+ nonexistent features) shipped precisely because nothing\nran it (DD-076). Add a step to the existing Traceability job (which already\nbuilds + runs `rivet validate`, so no extra compile) that:\n- solves every artifacts/variants/*.yaml against the feature model\n  (`rivet variant check --model --variant`), failing on UnknownFeature etc.;\n- validates artifacts/bindings.yaml with `validate --model --binding\n  --strict-variants` — dangling artifact IDs (REQ-258), unknown constraint\n  feature names (REQ-259), and unknown attribute keys (REQ-261) all fail here.\n\n`set -euo pipefail` + non-zero exits mean any broken variant/binding fails the\nPR. Runs on every PR (the Traceability job is not paths-gated) so variant\nbreakage can't slip in through a non-Rust change either.\n\nConfirmed the gate's exact commands pass locally on the current variants\n(dashboard-only/full-desktop/minimal-ci all exit 0; binding validation exit 0)\nwith a fresh binary, and ci.yml parses.\n\nRefs: REQ-263, REQ-258, REQ-259, REQ-261, DD-076",
          "timestamp": "2026-07-16T07:24:40+02:00",
          "tree_id": "e177ee04f4d1a6e1b055126e31eb4c317a2edf1d",
          "url": "https://github.com/pulseengine/rivet/commit/aab1c32bf0117dbaf72a52c67660bfe33797abfd"
        },
        "date": 1784186232046,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 86494,
            "range": "± 1637",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 903608,
            "range": "± 5232",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13151613,
            "range": "± 716958",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2181,
            "range": "± 15",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25887,
            "range": "± 101",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 365471,
            "range": "± 6984",
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
            "value": 1517255,
            "range": "± 25960",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 164371,
            "range": "± 1230",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1978834,
            "range": "± 7795",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 27967089,
            "range": "± 1485278",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 476974,
            "range": "± 3734",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 15655840,
            "range": "± 136444",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1232990060,
            "range": "± 10477607",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4510,
            "range": "± 297",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 58024,
            "range": "± 282",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 849168,
            "range": "± 4436",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 62415,
            "range": "± 343",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 699958,
            "range": "± 15225",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8343125,
            "range": "± 546157",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1149,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15111,
            "range": "± 710",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 340464,
            "range": "± 1984",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23516,
            "range": "± 154",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 165461,
            "range": "± 3801",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1502947,
            "range": "± 11180",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "8abbb627ce381b2b5e21a37ae6efc267a18a9e22",
          "message": "chore(release): v0.28.0 — variant hardening P1 (silent-drops) (#713)\n\nBumps workspace + Cargo.lock + VS Code extension to 0.28.0 and adds the\nCHANGELOG section. Ships the variant-hardening P1 slice (DD-076: a broken\nconfig must fail loud, not present as absent):\n\n- REQ-260 — serve variant discovery surfaces parse errors instead of\n  .ok()-swallowing a broken model into a misleading \"no model configured\".\n- REQ-261 — unknown feature-attribute keys (attribute_warnings) now reach\n  rivet validate; --strict-variants escalates them to a nonzero exit.\n- REQ-262 — serve accepts the variant:-wrapped shape (regression of #514\n  on the serve path); wrapped + composed binding files are honored.\n- REQ-263 — CI Traceability job gates PRs on variant check + binding\n  validation, so a broken variant/binding can no longer ship.\n\nSelf-verify with the fresh 0.28.0 binary: build OK, rivet validate PASS,\nrivet docs check PASS (0 violations — VersionConsistency clean).\n\nRefs: REQ-260, REQ-261, REQ-262, REQ-263, DD-076",
          "timestamp": "2026-07-16T08:07:10+02:00",
          "tree_id": "bfe65c9b88f4aaa71bb95a09b5abfdffb17a8c06",
          "url": "https://github.com/pulseengine/rivet/commit/8abbb627ce381b2b5e21a37ae6efc267a18a9e22"
        },
        "date": 1784187006896,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 69126,
            "range": "± 437",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 740783,
            "range": "± 5800",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13631766,
            "range": "± 1668376",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1522,
            "range": "± 25",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 18584,
            "range": "± 46",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 265291,
            "range": "± 954",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 74,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/1000",
            "value": 74,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 74,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1181005,
            "range": "± 22486",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 126830,
            "range": "± 655",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1495979,
            "range": "± 9916",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 24116044,
            "range": "± 1956355",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 341875,
            "range": "± 3801",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 11276807,
            "range": "± 269977",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 762756012,
            "range": "± 8858190",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3215,
            "range": "± 15",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 34302,
            "range": "± 168",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 555669,
            "range": "± 4285",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 46183,
            "range": "± 131",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 521705,
            "range": "± 2750",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 6163298,
            "range": "± 202417",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 904,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 11284,
            "range": "± 99",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 172570,
            "range": "± 970",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 17012,
            "range": "± 124",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 117738,
            "range": "± 295",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1102249,
            "range": "± 26378",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "ab9b24cad5fdd6114b19d75a097c814e1ff457a4",
          "message": "test(feature-model): fuzz the constraint solver (REQ-266) (#715)\n\nThe proptest strategies hard-coded `constraints: vec![]`, so the solver's\nhighest-risk code — cross-tree constraint evaluation, `implies`\npropagation, `excludes`, and REQ-257's fail-loud gate — had ZERO\nproperty-test coverage. Add:\n\n- A constraint-generating strategy (implies/excludes/and/or/not over real\n  feature-name leaves) kept as a typed value so the property can evaluate\n  each constraint independently — an oracle to grade the solver against.\n- prop_ok_means_constraints_actually_hold: if solve() returns Ok, every\n  constraint genuinely holds under the resolved selection. This is the\n  anti-silent-pass property — a return to the pre-REQ-257 `_ => true`\n  blind spot would surface here as an Ok whose selection violates a\n  constraint.\n- prop_implies_propagation + prop_solver_never_panics_with_constraints.\n- Deterministic fail-loud tests: an unevaluatable attribute comparison\n  yields UnevaluatableConstraint (REQ-257); a constraint naming a\n  nonexistent feature yields UnknownConstraintFeature (REQ-259).\n\nAlso surfaces a real latent bug: a shared child reachable through two\nparents (a diamond / DAG) is mis-reported as a cycle by validate_tree's\nBFS (global-visited-as-cycle). Filed as REQ-269 with a regression test\n(diamond_shared_child_is_not_a_cycle, #[ignore]d until the fix); confirmed\nfailing with \"cycle detected involving feature `shared`\".\n\nConfirmed with `cargo test -p rivet-core --test proptest_feature_model`\n(12 passed, 1 ignored) and clippy --all-targets clean. Test-only + artifact\nchange; the wasm seam is untouched.\n\nImplements: REQ-266\nVerifies: REQ-257, REQ-259\nRefs: REQ-269, DD-076",
          "timestamp": "2026-07-16T13:14:22+02:00",
          "tree_id": "6e7cf7b780b6b4f02134fb0d13848672adcbe953",
          "url": "https://github.com/pulseengine/rivet/commit/ab9b24cad5fdd6114b19d75a097c814e1ff457a4"
        },
        "date": 1784201295334,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 86734,
            "range": "± 874",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 926130,
            "range": "± 15973",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14888303,
            "range": "± 269521",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1921,
            "range": "± 9",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24756,
            "range": "± 44",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 370986,
            "range": "± 1827",
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
            "value": 1528479,
            "range": "± 12076",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 167973,
            "range": "± 1381",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1954981,
            "range": "± 14794",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 27468467,
            "range": "± 313851",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 451218,
            "range": "± 13303",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 15075675,
            "range": "± 116844",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1106346029,
            "range": "± 13290622",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4354,
            "range": "± 44",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 43980,
            "range": "± 781",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 765916,
            "range": "± 15112",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 63177,
            "range": "± 203",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 722107,
            "range": "± 7460",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8101319,
            "range": "± 96439",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1115,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14974,
            "range": "± 276",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 223850,
            "range": "± 972",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21695,
            "range": "± 71",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 152321,
            "range": "± 1793",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1410144,
            "range": "± 51551",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "2ff1c0997c385f123bbfc6332d453c18b046dc12",
          "message": "fix(feature-model): don't mis-report a shared child as a cycle (REQ-269) (#716)\n\n`validate_tree`'s cycle detection used a single global `visited` set with a\nBFS and reported EVERY second encounter of a node as a cycle. A feature\nreachable through two parents — a diamond / DAG, e.g. `root -> {a, b}` with\n`a -> shared` and `b -> shared` — was enqueued from both parents, dequeued\ntwice, and wrongly rejected with \"cycle detected involving feature `shared`\".\nReal feature models legitimately share a sub-feature under two branches.\n\nReplace the BFS with an iterative DFS that tracks the current path (the\nrecursion stack) separately from fully-explored nodes:\n- A node re-encountered while still ON the current path is a genuine cycle\n  (a back edge — a feature that is its own ancestor). Still rejected.\n- A node reached again by a disjoint path (a shared child) is fully\n  explored, so it is skipped, not flagged.\n\nThe parent link remains last-writer-wins (unchanged, acceptable); only the\ntraversal's cycle criterion changes.\n\nTests: un-ignored `diamond_shared_child_is_not_a_cycle` (now passing) and\nadded `genuine_cycle_is_rejected` as a guard that real cycles still error.\n\nConfirmed with the full feature_model + variant suites (proptest 14, lib\nfeature_model 62, variant_gap_check 2, variant_phase2 8 — all green),\nclippy --all-targets clean, and the wasm seam builds\n(`cargo build -p rivet-cli --features wasm` OK — composition core touched,\nWIT/component unchanged so no cargo-component rebuild needed).\n\nFixes: REQ-269\nVerifies: REQ-269\nRefs: REQ-266",
          "timestamp": "2026-07-16T17:20:08+02:00",
          "tree_id": "4e53cff94a25d32c0affb1a3c45d0f901ba752a7",
          "url": "https://github.com/pulseengine/rivet/commit/2ff1c0997c385f123bbfc6332d453c18b046dc12"
        },
        "date": 1784215945234,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85241,
            "range": "± 909",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 933824,
            "range": "± 3918",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13728534,
            "range": "± 209676",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1954,
            "range": "± 51",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24839,
            "range": "± 72",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 363391,
            "range": "± 1564",
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
            "value": 1508567,
            "range": "± 14738",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 168760,
            "range": "± 907",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1962139,
            "range": "± 7803",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 27739820,
            "range": "± 208735",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 449286,
            "range": "± 2792",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 15353423,
            "range": "± 127795",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1128699732,
            "range": "± 21181441",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4202,
            "range": "± 18",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 44662,
            "range": "± 165",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 759556,
            "range": "± 2943",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 63176,
            "range": "± 291",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 730528,
            "range": "± 3079",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8161043,
            "range": "± 62517",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1187,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 13589,
            "range": "± 39",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 229887,
            "range": "± 3997",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22642,
            "range": "± 178",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 154158,
            "range": "± 489",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1444347,
            "range": "± 18501",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
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
      }
    ]
  }
}