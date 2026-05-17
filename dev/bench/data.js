window.BENCHMARK_DATA = {
  "lastUpdate": 1779019772726,
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
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "2754ae12dc59d0b27c707bf44e443f46d7ca1828",
          "message": "docs(design): three roadmap design tracks for v0.10 (variant, cross-org, TCL) (#277)\n\n* docs(design): variant-aware properties — per-variant field values on one artifact\n\nDesign note for issue #255: how to express that the same logical\nrequirement (e.g. `REQ-THERMAL-01: Operating temperature envelope`) has\ndifferent field values across product variants — `max-temp-c: 80` for the\nautomotive variant, `100` for industrial, `70` for consumer — without\nsplitting the artifact and breaking derives-from / verifies / satisfies\nlink semantics.\n\nSurveys the design space across five options (per-variant overrides,\nvariation expressions, multiple bound artifacts, references into\nvariant attributes, sphinx-needs-style filters) and scores each on\nvalidator complexity, dashboard rendering, traceability preservation,\nAI-tool friendliness, and audit friendliness.\n\nSurveys what competitors do (Polarion variant management, DOORS Next +\npure::variants, sphinx-needs, pure::variants variation points,\nFeatureIDE / Clafer / TVL) and what the academic literature says\n(Czarnecki & Eisenecker staged configuration, COVAMOF, Attributed\nFeature Models, TypeChef variability-aware analysis).\n\n**Recommendation:** option A — `fields-per-variant:` keyed by variant\nconfig or feature name, first-match-wins, zero new evaluator\nrequired. Forward-compatible to option B (variation expressions) once\nthe scalar value space stabilises.\n\nMVP scope (v1) deliberately excludes compositional merge, multi-axis\ncomposition, t-wise sampling, attribute-restriction values, and\nexhaustiveness checking — those are deferred to a future release and\nthe deferral list is named explicitly. This frames the next 12 months\nof grant-funded variant work realistically: ship the readable single-\nmaster overlay first; resist the SAT/SMT compositional generalisation\nuntil users push for it.\n\nRefs: #255\n\n* docs(design): cross-org / supplier traceability — external-anchor + boundary coverage\n\nDesign note for issue #253: how rivet should represent the case where\nthe top of a project sits in one organisation, parts of the chain are\nin-house variants, and other parts are owned by an external supplier\nwhose model, field names, and even toolchain are not under our\ncontrol.\n\nToday's `externals:` model in `rivet.yaml` assumes the dependency\nrepo is a rivet repo with reachable schemas — that breaks the moment\na downstream party runs Polarion, DOORS, or just a different field\nconvention. The proposal:\n\n1. Typed `external-anchor` artifact (in `schemas/common.yaml`) — an\n   explicit leaf representing the point at which an in-house chain\n   hands off to an external party. Carries `source-of-truth`,\n   `expected-derived-types`, `received-status`, optional\n   `contract-reference` and `cited-source` (reusing the shipped\n   sha256-stamped typed field).\n\n2. Cross-org link semantics — `derives-from-external` link type with\n   structured target (`org`, `contract`, `doc-id`, `last-synced`,\n   `sha256`, optional `anchor`). The link's `target` field becomes a\n   mapping for this one link type, staying a string for all others.\n\n3. Three-state coverage (`SATISFIED` / `EXTERNAL_BOUNDARY` /\n   `UNCOVERED`) — replaces the binary covered/uncovered model so\n   audits can distinguish \"we forgot to satisfy this\" from \"this is\n   delegated to a supplier\". An artifact terminating at an\n   `external-anchor` whose `expected-derived-types` covers the\n   missing type counts as EXTERNAL_BOUNDARY.\n\n4. Field-mapping recipe — reuse `schemas/migrations/` shape at the\n   import boundary (not just for in-store schema-version bumps).\n\n5. Provenance — new `FederationProvenance` block on the `Provenance`\n   struct: `source_org`, `source_tool`, `source_id`, `anchor`,\n   `fetched_at`, `source_hash`, optional `mapping_recipe`.\n\nSurveys competitors (Polarion ALM Connector / OSLC, IBM DOORS Next /\nGCM, sphinx-needs `needs_external_needs`, OSLC Core/RM/QM/CM,\nReqIF + ProSTEP iViP guide, AUTOSAR ARXML, ISO 26262-8 §5 DIA, ASPICE\nSUP.10 / SUP.8) and identifies the gap rivet fills: a file-based,\ngit-coordinated alternative that copies OSLC's link semantics\nwithout inheriting its live-HTTP protocol assumption.\n\n**MVP scope (~3 weeks)** — declarative only: `external-anchor` artifact\ntype + 3-state coverage + read-only `rivet supplier list` / `check`.\n**Phase 2** — `derives-from-external` structured link, ReqIF pull-mode\nfetch, `FederationProvenance`. **Phase 3** — field-mapping recipes,\n`rivet supplier publish`, OSLC / Polarion / GitHub-issues backends,\nvariant-aware anchors, `rivet supplier promote`.\n\nThis is the \"executable specification across the OEM-supplier\nboundary\" story for the grant Workstream 3-A.\n\nRefs: #253\n\n* docs(design): tool confidence level — TCL/TQL cross-walk + dossier outline\n\nResearch and design note covering tool-qualification levels across\nfive regimes (ISO 26262 Part 8 §11, IEC 61508-3, DO-178C / DO-330,\nEN 50128, ISO/SAE 21434, ISO/PAS 8800), what claim rivet should make,\nhow the shipped formal-method backstops (Verus, Kani, Rocq, mutation\ntesting) and oracle-gated agent pipelines map to TI / TD parameters,\nand what's missing to support a credible dossier.\n\nKey findings:\n\n1. **Numbering-convention warning.** ISO 26262 / EN 50128 / IEC 61508\n   number `lower = lower bar` (TCL1 = weakest claim). DO-330 and\n   ISO/PAS 8800 number `lower = higher bar` (TQL-1 = strongest). The\n   existing `safety/stpa/tool-qualification.yaml` mixes the\n   conventions (\"TCL 1 (highest)\" using the DO-330 convention with\n   an ISO 26262 acronym) — that's an audit-review flag in itself.\n   First fix is to use standard-native numbering and never abbreviate\n   \"TCL N\" without the regime in front.\n\n2. **Polarion's TCL1 claim is conditionally honest for human-authored\n   content and increasingly threadbare for AI-authored content.** The\n   TI2/TD1 → TCL1 argument relies on human review as the TD layer.\n   When AI authors at agent-speed, that review degrades. Rivet's\n   opportunity is to be the tool that lets a customer KEEP a TCL1\n   claim by contributing TD-raising machinery to the toolchain — not\n   to claim TCL1 as a passive-ALM peer.\n\n3. **Honest peer group for rivet is medini / BTC, not Polarion.** The\n   practical target is TCL2 with a TCL3 path — supported by 19\n   shipped safeguards (typed schema, link oracle, validation engine,\n   Verus specs, Kani BMC, Rocq proofs, mutation testing, property\n   tests, differential testing, provenance auto-stamp, cited-source\n   hashing, schema-migrate snapshot/abort, oracle-gated agent\n   pipelines, `rivet docs check`, `rivet check review-signoff`,\n   commit-trailer enforcement, validate-determinism property,\n   SCRC restriction-lint set, STPA self-analysis).\n\n4. **`ai-found-defect` artifact type is the missing piece.** When an\n   AI agent flags a contradiction, that finding is itself a tool\n   output that should be traceable. Today there is nowhere to put\n   it. Proposed: a typed artifact carrying severity,\n   detection-method, oracle-id, agent identifier, reproducer,\n   triage-status, and a `defect-against` link target — first-class\n   evidence, not chat history.\n\n5. **`tool-confidence` typed artifact** (already gap-flagged in\n   docs/design/iso26262-artifact-mapping.md §C row 32). Small,\n   tractable schema sketch included.\n\n6. **Three-layer dossier outline** for `rivet docs tool-qualification`:\n   TOR, use cases, verification plan, configuration baseline, known\n   limitations, error-detection-and-reporting process, TCL/TQL\n   position statement per regime.\n\n7. **Five-step rollout** (1h–1d each) to move from \"TCL1 in our own\n   dogfood STPA\" to \"TCL2 dossier draft published, reviewable.\"\n\nThis is the source design for the grant Workstream 3-B dossier work.\n\nRefs: REQ-051 (hook security model context),\n      docs/design/iso26262-artifact-mapping.md §C row 32,\n      docs/design/ai-safety-cyber-hitl.md\n\n* fix(docs): split multi-document yaml example in variant-aware-properties\n\n`rivet docs check` ConfigExampleFreshness invariant requires each\n```yaml block to parse as one valid YAML document. The example at\nline 326 mixed a top-level mapping (variant config) and a sequence\n(artifact list entry) in a single fence, which fails YAML parse at\nthe mapping→sequence transition.\n\nSplit into two adjacent ```yaml blocks — one per file — so each\nparses cleanly and the syntax highlighter still renders both.\n\nRefs: #255",
          "timestamp": "2026-05-14T12:35:54-05:00",
          "tree_id": "f81c913a2b73de825213ead2bfa1978f4cb88410",
          "url": "https://github.com/pulseengine/rivet/commit/2754ae12dc59d0b27c707bf44e443f46d7ca1828"
        },
        "date": 1778800706751,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 83840,
            "range": "± 2185",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 883377,
            "range": "± 22973",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12571152,
            "range": "± 678868",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1949,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24235,
            "range": "± 33",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 357019,
            "range": "± 7483",
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
            "value": 1178111,
            "range": "± 22881",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 167918,
            "range": "± 827",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1954698,
            "range": "± 26664",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 37009435,
            "range": "± 3548111",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 136696,
            "range": "± 2318",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1262782,
            "range": "± 27719",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 18503941,
            "range": "± 823182",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4173,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 43296,
            "range": "± 107",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 723840,
            "range": "± 2978",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 63880,
            "range": "± 3348",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 715024,
            "range": "± 5671",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8034868,
            "range": "± 309000",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 779,
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
            "value": 89985,
            "range": "± 362",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21849,
            "range": "± 79",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 150209,
            "range": "± 2700",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1399707,
            "range": "± 9255",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "dde04b418a9d1676360a9fad5bd4a5b205bae31c",
          "message": "feat(validate): status-gate rules — cross-artifact status preconditions via s-expr (#276)\n\n* feat(validate): status-gate rules — cross-artifact status preconditions via s-expr\n\nIntroduces a third schema rule kind, `validation-rules:`, that declares\nstatus preconditions on traceability links. The motivating shape is the\nV-model promotion gate: a sys-verification can only be approved/released\nwhen every requirement it verifies is already approved. Today's two rule\nkinds (traceability-rules, conditional-rules) couldn't express this —\nthey check link shape or single-artifact predicates, not the state of\nlinked artifacts.\n\nThe implementation is deliberately thin (~470 LOC + 15 tests) because\nthe primitives already existed: a link graph, a store, an s-expression\nevaluator with Forall/Exists nodes, and a 9-phase diagnostic pipeline.\n\nEngine (rivet-core/src/sexpr_eval.rs):\n\n- 4 new Expr variants implementing implicit-context-shift link\n  traversal: ForallLinked, ExistsLinked, ForallLinkedFrom (inbound),\n  ExistsLinkedFrom (inbound). Each shifts ctx.artifact to each\n  target/source rather than introducing variable binders — same trick\n  the existing store-wide Forall uses.\n- New MissingTargetPolicy enum + missing_target_policy field on\n  EvalContext, threaded through every recursive construction site.\n  Skip (default) treats unresolved targets as vacuous-true for forall;\n  Fail treats them as body-predicate failure. Composes cleanly with\n  cross-org / external-anchor boundaries and broken-links detection.\n- Audit-strict empty-set semantics: `(forall-linked \"verifies\" pred)`\n  over zero outbound `verifies` links returns false, not true. A\n  verifier with nothing to verify cannot satisfy the gate. The\n  link-suffixed name signals the deviation from classical forall.\n- Lowering for forall-linked / exists-linked / forall-linked-from /\n  exists-linked-from added to lower_list, plus the HEADS array used\n  for unknown-head error hints.\n- matches_filter_with_policy helper for callers that need to pass a\n  caller-chosen policy (the validate phase uses this).\n\nSchema (rivet-core/src/schema.rs):\n\n- ValidationRule struct: id, description?, rule (the single s-expr\n  body), on_unresolved (Skip|Fail, default Skip), draft_downgrade\n  (opt-in, default false), severity (default Error), message\n  (template). Wired into SchemaFile and the merged Schema.\n- MissingTargetPolicyName YAML-facing enum + From impl converting to\n  the engine-side MissingTargetPolicy.\n\nValidate (rivet-core/src/validate.rs):\n\n- evaluate_validation_rules runs as a new phase after conditional\n  rules. Per rule: parse the body once, apply the rule's policy,\n  evaluate against each artifact, emit a Diagnostic on false. Parse\n  errors in a rule body surface as a rule-level diagnostic rather\n  than panicking or silently passing every artifact.\n- render_validation_message substitutes {id}, {type}, {status},\n  {title}, {rule} placeholders from the artifact under test. Unset\n  status renders as `<unset>` so the auditor sees the absence\n  rather than an empty string. Unknown placeholders are left in\n  place — surfaces typos in rule messages instead of swallowing.\n- draft-downgrade is opt-in per rule. Status-gate rules typically\n  gate by status (the `when` premise filters by status: approved),\n  so the existing draft-downgrade behaviour would be dead code; rules\n  that need it set draft-downgrade: true explicitly.\n\nDogfood (schemas/aspice.yaml):\n\n- Three V-model status-gate rules: V-sys-verification-needs-approved-req\n  (SYS.5), V-sw-verification-needs-approved-req (SWE.6),\n  V-unit-verification-needs-approved-design (SWE.4). Each follows\n  the (implies <premise> <consequence>) idiom with a forall-linked\n  consequence. The all_preset_validation_rules_parse_cleanly test\n  pins the rule count >= 3 so a future removal trips CI.\n\nTests (15 new):\n\n- sexpr_eval.rs: 12 unit tests covering empty-set audit-strict,\n  body-pass/body-fail, missing-target × Skip/Fail policy, inbound\n  variants, end-to-end parse_filter for all 4 keywords, and the\n  status-gate idiom shape across pass/fail/vacuous-premise cases.\n- validate.rs: 3 integration tests for phase 9 — end-to-end status\n  gate firing, malformed-rule parse-error surface, draft-downgrade\n  opt-in flipping Error → Info on drafts.\n- schema_validation_rules.rs (new file): ASPICE preset rules\n  deserialise, the SYS.5 rule fires on bad shape and stays silent on\n  clean shape, every preset's rule body parses cleanly.\n\nDesign semantics resolved during review (full rationale in\ndocs/design/status-gate-rules.md):\n\n- Empty-set forall: audit-strict false (deviation from classical forall;\n  link-suffixed name signals it). A verifier with no verifies link\n  cannot satisfy the gate.\n- Missing target: per-rule policy, default skip. Cross-org boundaries\n  compose; safety-critical gates can opt into fail.\n- Rule shape: single s-expr per rule with the (implies premise\n  consequence) idiom as the convention.\n- Draft cascade: opt-in via draft-downgrade: true. Default off.\n\nImplements: REQ-004\nRefs: REQ-010\n\nCo-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>\n\n* test(validate): deep-test pass — edge cases, mutants, proptest, V-model graphs\n\nUser pushback: \"you need to test this new stuff really deep out before we go\nwith it.\" This commit adds the depth.\n\nCoverage added across 7 dimensions (~1300 LOC of new tests):\n\n1. Edge cases (sexpr_eval.rs, 9 new tests):\n   - Self-loops (A verifies A) terminate, evaluate body against self.\n   - Cycles (A verifies B verifies A) are one-hop — no infinite recursion;\n     bounded by static rule nesting, not by graph depth.\n   - Duplicate edges are functionally idempotent.\n   - Wildcard link-type returns audit-strict false (documented).\n   - Missing status field on target → \"not approved\" (audit intent).\n   - Deeply nested rule bodies (3-deep forall-linked chain) terminate.\n   - Mixed forall+exists in one rule body composes cleanly.\n   - Inbound/outbound link-type filters distinguish matching types\n     (mutation-survivor regression fix — see point 4).\n\n2. Phase interactions (validate.rs, 4 new tests):\n   - on-unresolved: skip + broken link → only broken-links phase fires.\n     Validation-rule stays silent (vacuous-true on the unresolved link;\n     broken-links phase 6 covers breakage).\n   - on-unresolved: fail + broken link → BOTH phases fire. Distinct rule\n     fields (`broken-link` vs `<rule-id>`) — correct double-coverage, not\n     duplication.\n   - Schema merge concats validation_rules without deduping by id —\n     documented behaviour.\n   - Phase-7 traceability draft-downgrade does NOT cascade into phase-9\n     validation rules. Each phase owns its own severity policy.\n\n3. Negative / malformed input (validate.rs, 7 new tests):\n   - Empty rule body → inert (parses to BoolLit(true); never fires).\n     Documented as future polish.\n   - Whitespace-only body → same shape, inert.\n   - Unknown operator → rule-level diagnostic with \"malformed\" message.\n   - Mismatched parens → rule-level diagnostic.\n   - Unknown field reference → resolves to empty string, evaluates\n     predictably, no panic.\n   - 100-deep nested rule body → no stack overflow.\n   - Link-type typo (\" verifies \" with spaces) → audit-strict empty fires\n     on every matching artifact, surfacing the typo loudly.\n\n4. Mutation testing (cargo-mutants --in-diff against the PR's diff):\n   - First pass: 1 missed mutant at ForallLinkedFrom's link-type filter\n     (`bl.link_type == lt` → `!=` was not caught by existing inbound\n     tests, which had only one inbound link type).\n   - Added two targeted tests with two link types and distinguishing\n     bodies. Re-ran: 26 caught, 3 unviable, 0 missed.\n\n5. Proptest extensions (sexpr_fuzz.rs, 3 new properties):\n   - Extended arb_expr to generate the four new link-traversing\n     quantifiers (ForallLinked, ExistsLinked, ForallLinkedFrom,\n     ExistsLinkedFrom). The existing roundtrip-equivalence property now\n     exercises them: print → reparse → same eval, holding for all\n     generated bodies.\n   - forall-linked over zero links is false for any body (audit-strict).\n   - exists-linked over zero links is false for any body.\n   - Policy monotonicity: forall-linked under Fail policy true ⇒ true\n     under Skip policy. (The reverse direction does NOT hold — Skip is\n     strictly more permissive; that asymmetry is the whole point.)\n\n6. Rich V-model graph (schema_validation_rules.rs, 2 new tests):\n   - 17-artifact V-model (stakeholder-req → system-req → sw-req →\n     sw-detail-design → unit/sw/sys-verification) with mixed approval\n     state. Validates against the full aspice preset.\n   - Each rule fires EXACTLY on its expected violation (SYV-002, SWV-002,\n     UV-002) and stays silent on every clean artifact (the other 14).\n   - Catches the \"rule accidentally hits unrelated artifacts\" regression\n     class that unit tests miss.\n\n7. Performance + scale smoke (schema_validation_rules.rs):\n   - 200-artifact synthetic store (100 verifiers, half with draft\n     targets). Full validate completes in well under 1 second.\n   - 50 expected violations, 50 observed. Pin against O(N²) regressions.\n\nNet additions:\n- 22 new tests (lib + integration).\n- 974 lib + 83 integration tests pass (up from 954 + 81 in the original\n  feature commit).\n- 0 mutation survivors on the diff.\n\nImplements: REQ-004\nVerifies: REQ-004\nRefs: REQ-010\n\nCo-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>\n\n* fix(validate): CI follow-ups — cargo fmt, Kani SchemaFile, Miri-ignore\n\nThree small fixes for CI failures observed on PR #276:\n\n1. **cargo fmt** auto-rewrites in sexpr_eval.rs and validate.rs — vec!\n   literals and slice initializers normalised to single-line form.\n\n2. **Kani build error** — proofs.rs had four `SchemaFile { ... }` literal\n   constructions that needed `validation_rules: vec![],` for the new\n   schema field. These are gated behind `#[cfg(kani)]` so the normal\n   `cargo check` and `cargo test` don't reach them — only the Kani CI\n   job exercised the cfg cone and surfaced the build error.\n\n3. **Miri test runtime** — 13 of the new validate::tests::* call\n   `validate()` which parses each rule body via `parse_filter`. Building\n   rowan CSTs under Miri hits the known tree-borrows deallocation UB\n   (pulseengine/rowan#211; documented in sexpr_eval.rs:1457). Following\n   the project's existing pattern, each new test now carries\n   `#[cfg_attr(miri, ignore)]`. The pure-evaluator tests in sexpr_eval\n   (which exercise `check()` on hand-built AST nodes without going\n   through `parse_filter`) stay enabled under Miri.\n\nTwo PR #276 CI failures are infrastructure flake, not addressed here:\n- Supply Chain (cargo-vet): runner received shutdown signal mid-job.\n- Verus Proofs: Nix installer fails with \"sudo: 'no new privileges'\n  flag is set\" on the self-hosted runner. Same shape as cargo-vet —\n  runner-config issue, not source-code issue. Both will retry on push.\n\nRefs: REQ-004\n\n---------\n\nCo-authored-by: Claude Opus 4.7 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-05-14T13:08:31-05:00",
          "tree_id": "644ffe65749d611f1639b9bf5fbce099d22eac18",
          "url": "https://github.com/pulseengine/rivet/commit/dde04b418a9d1676360a9fad5bd4a5b205bae31c"
        },
        "date": 1778812136964,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 79271,
            "range": "± 572",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 863773,
            "range": "± 4996",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 11944756,
            "range": "± 754473",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2200,
            "range": "± 14",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25238,
            "range": "± 285",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 375162,
            "range": "± 2631",
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
            "value": 1210780,
            "range": "± 31614",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 159222,
            "range": "± 991",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1892318,
            "range": "± 37200",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 24313309,
            "range": "± 1414191",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 141952,
            "range": "± 610",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1256001,
            "range": "± 19000",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 13538015,
            "range": "± 732176",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4289,
            "range": "± 54",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 58400,
            "range": "± 653",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 825543,
            "range": "± 4104",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 63394,
            "range": "± 799",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 704114,
            "range": "± 6137",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8003798,
            "range": "± 364770",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 833,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7758,
            "range": "± 76",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 119454,
            "range": "± 918",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 24957,
            "range": "± 220",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 184140,
            "range": "± 910",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1747302,
            "range": "± 34536",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "5ee516315d385851997153e9d2dc8fed1dd7dbff",
          "message": "chore: ignore mutants.out*/, .rivet/mythos/, .rivet/repos/ (#278)\n\nThree transient working-tree paths that have been showing up as\nuntracked across recent sessions:\n\n- `mutants.out/` + `mutants.out.old/` — cargo-mutants per-run output.\n  Large (~MB per run), transient, per-developer. cargo-mutants rotates\n  the previous run to `.old` automatically.\n- `.rivet/mythos/` — slop-hunt agent pipeline workproducts. The\n  pipeline source lives under `scripts/mythos/`; transient outputs\n  (drafts, ranking JSON, comparison reports) belong outside VCS.\n- `.rivet/repos/` — destination for `rivet sync` external clones.\n  Per-developer working tree, never committed. Sibling tracked\n  `.rivet/` files (agent-context.md, provenance-pending.json) stay\n  tracked.\n\nNo behaviour change; these were never committed, but they pollute\n`git status` and risk an accidental `git add .` capture.",
          "timestamp": "2026-05-15T01:07:59-05:00",
          "tree_id": "009f017cda9229f7f10e0ef29609da33042a07ae",
          "url": "https://github.com/pulseengine/rivet/commit/5ee516315d385851997153e9d2dc8fed1dd7dbff"
        },
        "date": 1778825675102,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 80927,
            "range": "± 949",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 868725,
            "range": "± 6022",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12864975,
            "range": "± 544010",
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
            "value": 24655,
            "range": "± 52",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 374630,
            "range": "± 2325",
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
            "value": 1216230,
            "range": "± 13540",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 166812,
            "range": "± 1159",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1941696,
            "range": "± 12458",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 27865360,
            "range": "± 1022575",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 134924,
            "range": "± 1962",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1269589,
            "range": "± 21544",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 15179242,
            "range": "± 949773",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4106,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 44212,
            "range": "± 214",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 741062,
            "range": "± 4704",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 64759,
            "range": "± 685",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 703943,
            "range": "± 10980",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7921433,
            "range": "± 92689",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 793,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 6826,
            "range": "± 66",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 92552,
            "range": "± 626",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23784,
            "range": "± 186",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 172595,
            "range": "± 1073",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1623316,
            "range": "± 22322",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "fd4cf192eb6dd6a8a13be0d2b55928c62db44952",
          "message": "ci: stop the Verus/Mutation/cargo-vet self-hosted runner flakes (#281)\n\nThree flake classes hitting every PR today, all on self-hosted runners:\n\n1. Verus + Rocq Proofs: \"sudo: 'no new privileges' flag is set\"\n2. Mutation Testing (rivet-cli): \"No space left on device\"\n3. Supply Chain (cargo-vet): \"runner has received a shutdown signal\"\n\nAll three block green CI on PRs that have nothing to do with the\nunderlying subsystem. Each fix is workflow-level so it lands without\nrunner-host changes.\n\n**1) Verus + Rocq: switch Nix installer.**\nThe self-hosted runners run with systemd `NoNewPrivileges=true`, which\nbreaks `cachix/install-nix-action@v31` because it shells out to sudo\nmid-install. Switch to `DeterminateSystems/nix-installer-action@main`\nwith `init: none` (daemonless single-user mode). Add a follow-up step\nto put `~/.nix-profile/bin` on PATH explicitly. Cost: ~30s install,\ncomparable speed once cached. Keeps the lean-mem requirement intact —\nthe Verus solver still wants the RAM.\n\n**2) Mutation Testing: prune + restrict upload.**\ncargo-mutants writes a per-mutant target directory under `mutants-out/`.\nSeventeen shards landing on the same pool, with the Swatinem cache hot,\nleave 5-15 GB behind each. The next shard's `Upload mutants report`\nstep dies with ENOSPC during the upload itself — after cargo-mutants\nhas finished cleanly. Two changes:\n  - Add a `Prune stale mutants artefacts` step before the run (rm\n    mutants-out, find + rm matching target subdirs older than a day).\n  - Restrict `upload-artifact` path to the text/JSON reports only —\n    skip the per-mutant target directories that drive the bloat. The\n    text reports are what matter for triage.\n\n**3) cargo-vet: wrap in retry.**\nGitHub Actions doesn't expose \"runner restarted under me\" to `if:`\nconditions, but `nick-fields/retry@v3` with `retry_on: error` handles\nit correctly — if the runner agent dies mid-step the step exits\nnon-zero, the action retries on a different runner. Two attempts is\nenough; a third shutdown in ten minutes would point at runner-pool\nsizing, not at this job. Same pattern fits other light jobs (`fmt`,\n`yaml-lint`, `msrv`, `docs-check`) but those aren't currently flaking,\nso leave them alone — speculative retry on stable jobs hides real\nbugs.\n\nCross-cutting note for runner-ops: the underlying fixes for these are\nhost-level too — drop `NoNewPrivileges` from the runner systemd unit\n(fixes #1), lower the `post-job.sh` disk threshold from 70% to ~50%\n(helps #2), grow the lean-mem pool size (helps #3). The workflow-level\nchanges here unblock CI today; the host-level work is the durable fix\nand worth a separate Ansible PR.",
          "timestamp": "2026-05-15T01:11:29-05:00",
          "tree_id": "8ba6b39c639dcc9c29d0148fb9c2b0a2d16e9a60",
          "url": "https://github.com/pulseengine/rivet/commit/fd4cf192eb6dd6a8a13be0d2b55928c62db44952"
        },
        "date": 1778826075278,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 80661,
            "range": "± 703",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 859068,
            "range": "± 36041",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12861743,
            "range": "± 776517",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2214,
            "range": "± 11",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26502,
            "range": "± 786",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 349644,
            "range": "± 7534",
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
            "value": 95,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1240487,
            "range": "± 17811",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 158909,
            "range": "± 4226",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1876383,
            "range": "± 22209",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 30575891,
            "range": "± 2813963",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 139423,
            "range": "± 2502",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1242623,
            "range": "± 15371",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 22090176,
            "range": "± 1764655",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4270,
            "range": "± 22",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60744,
            "range": "± 981",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 753117,
            "range": "± 5235",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 60341,
            "range": "± 1514",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 678217,
            "range": "± 2907",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8031501,
            "range": "± 642688",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 772,
            "range": "± 9",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7379,
            "range": "± 55",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 110844,
            "range": "± 721",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23702,
            "range": "± 332",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 171213,
            "range": "± 2893",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1583479,
            "range": "± 21374",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "8f71efeb8dff31c4786fd329a8f066d6eb9f06fc",
          "message": "fix(schema): merge same-name types by union, not replace (#154) (#280)\n\n* fix(schema): merge same-name types by union, not replace (#154)\n\nBridge and overlay schemas that declared an artifact-type or link-type\nwith the same name as a base schema's silently lost the base's fields.\nThe merge was a plain HashMap::insert — later wins, parent fields gone.\n\nThis is the silent-correctness bug behind every bridge schema that\nre-declares a type to add a single safety attribute. A real reproducer\nin this repo: schemas/safety-case.yaml declares `safety-goal` with\nfields [claim, goal-type, asil, undeveloped] and link-field\nsub-goal-of; schemas/iso-26262.yaml re-declares `safety-goal` with\nfields [asil]. Loading [common, safety-case, iso-26262] previously\ngave a `safety-goal` with only [asil] — the GSN claim, goal-type, and\nsub-goal-of link-field were silently dropped. Every safety-case\nartifact in such a project then tripped \"field not defined\" diagnostics\nand zero declared link-fields broke cardinality enforcement.\n\nThe fix:\n\n- Add `ArtifactTypeDef::merge_in_place(&mut self, other: ArtifactTypeDef)`\n  with per-field union semantics:\n  * `description`: later wins when non-empty\n  * `fields`, `link_fields`: union by name; later wins on same-name\n    conflicts (so an overlay can change a field's `required` or\n    `field_type` deliberately, but cannot accidentally drop unrelated\n    fields)\n  * `shorthand_links`, `common_mistakes`: append/extend\n  * `yaml_sections`: union with dedup\n  * `aspice_process`, `example`, `yaml_section`, `yaml_section_suffix`:\n    later-Some wins\n- Add `LinkTypeDef::merge_in_place` with the same shape: scalar fields\n  take later-non-empty; `source_types` and `target_types` union with\n  dedup.\n- Free helper `merge_named_vec` does the union-by-name on Vec<T>\n  (used for both `fields` and `link_fields`).\n- `Schema::merge` switches from `insert` to `entry().{merge_in_place\n  | insert}` for both artifact_types and link_types.\n\nSix regression tests in `schema::tests`:\n\n  merge_same_name_artifact_type_unions_fields\n  merge_same_name_artifact_type_unions_link_fields\n  merge_preserves_shorthand_links_from_parent\n  merge_idempotent_with_same_file_twice\n  merge_order_independent_for_disjoint_additions\n  merge_same_name_link_type_unions_target_types\n\nThe shorthand-link preservation test guards the secondary symptom from\nparent's `controller: …` shorthand silently stopped expanding into a\n`links:` entry — because `Schema::merge` only populates\n`shorthand_links` from the type that survived the insert. With this\nfix, the parent's link-fields stay in place and the shorthand\nexpansion in `yaml_hir::extract_section_item` keeps working.\n\nBackward-compat: projects that relied on the replace behaviour were\nalready re-declaring every parent field (per the G.2 warning in\nrivet-cli/src/quickstart.md), so for them the union is a no-op —\nsame-name fields just stay identical. The new failure mode is\n\"deliberately removing a parent field\", which has no syntax today\n(no `remove-fields:` or `override: true` marker), so removing that\ncapability isn't a regression.\n\nFixes: #154\nImplements: REQ-010\nRefs: REQ-004\n\n* style: cargo fmt the new merge_in_place tests\n\nCI Format job flagged whitespace drift in the new #154 regression\ntests (long argument lists wrapping differently than rustfmt expects).\nPure formatting; no semantic change.",
          "timestamp": "2026-05-15T01:21:24-05:00",
          "tree_id": "8405d7eb35fe76a3359d9bbbf410a0362e2ef3aa",
          "url": "https://github.com/pulseengine/rivet/commit/8f71efeb8dff31c4786fd329a8f066d6eb9f06fc"
        },
        "date": 1778826473060,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 79362,
            "range": "± 812",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 848572,
            "range": "± 15919",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12292927,
            "range": "± 6244463",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2157,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 27018,
            "range": "± 163",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 362191,
            "range": "± 1143",
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
            "value": 1247482,
            "range": "± 18430",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 160250,
            "range": "± 627",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1882355,
            "range": "± 24985",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 23760230,
            "range": "± 1314349",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 137509,
            "range": "± 1531",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1222693,
            "range": "± 17439",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 12940359,
            "range": "± 380595",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4349,
            "range": "± 21",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 59569,
            "range": "± 239",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 754703,
            "range": "± 3655",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 60636,
            "range": "± 507",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 686447,
            "range": "± 8484",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7656457,
            "range": "± 88146",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 847,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7513,
            "range": "± 23",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 116283,
            "range": "± 3109",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 24622,
            "range": "± 377",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 189241,
            "range": "± 989",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1644842,
            "range": "± 18389",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "f198d3dc8e1d96aad8a7c56e5f68e9df87cbf089",
          "message": "ci(release): wire wasi-sdk into build-test-evidence; drop continue-on-error (#274)\n\nFollow-up to #269/#271/#272. The spar wasm32-wasip2 build pulls in\nhighs-sys (a C++ solver); building C/C++ for that target needs a full\nWASI toolchain — a sysroot with libc/libc++/libc++abi plus\nlibclang_rt.builtins-wasm32.a, and a wasm linker. The runner image no\nlonger ships any of it, so even with `lld` (wasm-ld) and\nwasm-component-ld installed, wasm-ld errored on `crt1.o` / `-lc` /\n`-lc++`. #272 made the job continue-on-error so the release wasn't\nblocked (v0.9.0 shipped 8/9 assets, missing only test-evidence.tar.gz).\n\nThis installs wasi-sdk 25.0 to /opt/wasi-sdk, puts its bin/ on PATH (so\nwasm-component-ld finds wasm-ld and the cc/cmake build scripts pick up\nthe right clang), and pins CC_/CXX_/AR_wasm32_wasip2 + the wasip2\nsysroot via CFLAGS_/CXXFLAGS_wasm32_wasip2 — so both the CMake CXX-ABI\nprobe and the highs-sys compile resolve their headers/libs. `lld` stays\nas a belt-and-braces wasm-ld source. Drops `continue-on-error` — if\ntest-evidence breaks again it should block the release until fixed.\n\nNot verified locally (spar isn't checked out here); the wasip2 sysroot\nflags or the wasi-sdk version may need a tweak after the first CI run.\nAlternative for a hermetic toolchain (out of scope here): migrate the\nspar-wasm build to Bazel rules_wasm_component — a change in the spar repo.\n\nCo-authored-by: Claude Opus 4.7 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-05-15T08:33:46-05:00",
          "tree_id": "9bf5a0bb8fda339cf76ad3e54fcb1f204414783b",
          "url": "https://github.com/pulseengine/rivet/commit/f198d3dc8e1d96aad8a7c56e5f68e9df87cbf089"
        },
        "date": 1778852416122,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 79444,
            "range": "± 1609",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 836638,
            "range": "± 10985",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13605122,
            "range": "± 821441",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2190,
            "range": "± 11",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26159,
            "range": "± 168",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 374955,
            "range": "± 1233",
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
            "value": 95,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1226221,
            "range": "± 65046",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 160066,
            "range": "± 2111",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1902467,
            "range": "± 6145",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 24748386,
            "range": "± 2004880",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 138191,
            "range": "± 4866",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1217063,
            "range": "± 18905",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 12833076,
            "range": "± 463161",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4394,
            "range": "± 29",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 59620,
            "range": "± 260",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 797220,
            "range": "± 1752",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 61437,
            "range": "± 163",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 694440,
            "range": "± 3194",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7742148,
            "range": "± 329947",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 838,
            "range": "± 33",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7576,
            "range": "± 54",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 114923,
            "range": "± 813",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 24371,
            "range": "± 193",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 178595,
            "range": "± 1260",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1635034,
            "range": "± 32897",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "2bd7bd692d79cbe0646ebf1df8b6ab1ed376615a",
          "message": "docs(pre-commit): rivet-validate adoption — install paths, failure mode, audit script (#263)\n\nAddresses the in-scope subset of pulseengine/rivet#187 — the canonical\ntemplate already ships rivet-validate at T1 (templates/pre-commit/.pre-commit-config.yaml:71-86),\nso the gap was on the *adoption* side rather than the template itself.\n\nChanges:\n\n- docs/pre-commit.md\n  - \"Installing rivet\" rewritten: GitHub release binaries exist as of\n    v0.8.0; cargo install must always pass --tag/--rev to avoid drift.\n  - New \"Version-pinning\" subsection with two equivalent recipes\n    (CI cargo install + system local-hook, vs. additional_dependencies).\n  - New \"Failure mode\" subsection with a worked example of the output\n    a developer sees when rivet validate blocks a commit, plus a\n    --no-verify advisory anchored on the hook security model (REQ-051).\n  - New \"Adoption audit\" subsection pointing at the audit script.\n\n- scripts/audit-rivet-validate-adoption.sh\n  - Walks a workspace of repository clones, reports adopted /\n    gap / no-pre-commit-config repos. Markdown output suitable for\n    pasting into docs/adoption-status.md or an issue body.\n  - Exits non-zero on any gap so it can act as a CI gate.\n\n- docs/adoption-status.md\n  - Placeholder for the latest audit run + refresh recipe.\n\nOut of scope for this PR (acknowledged in the issue body):\n- Cross-repo audit *run* (needs a workspace with sibling clones; an\n  operator must execute the script).\n- Cross-repo adoption issues filed on relay / sigil / gale / wohl\n  (filing on other repos is outside the issue-triage agent's\n  authorised scope per the org policy).\n\nRefs: REQ-051\n\nCo-authored-by: Claude <noreply@anthropic.com>",
          "timestamp": "2026-05-15T08:36:15-05:00",
          "tree_id": "a229d14ea0e3f6acdf64de660ca35e159d934114",
          "url": "https://github.com/pulseengine/rivet/commit/2bd7bd692d79cbe0646ebf1df8b6ab1ed376615a"
        },
        "date": 1778852906543,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 80149,
            "range": "± 397",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 842064,
            "range": "± 7587",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 11706540,
            "range": "± 347234",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2192,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25603,
            "range": "± 141",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 358412,
            "range": "± 1154",
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
            "value": 1217709,
            "range": "± 21233",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 159547,
            "range": "± 2092",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1900213,
            "range": "± 9028",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 24914445,
            "range": "± 1075682",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 139035,
            "range": "± 564",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1225703,
            "range": "± 14894",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 14183189,
            "range": "± 1382151",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4211,
            "range": "± 18",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60088,
            "range": "± 179",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 813589,
            "range": "± 1673",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 60309,
            "range": "± 175",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 701859,
            "range": "± 2968",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7677897,
            "range": "± 85465",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 847,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7767,
            "range": "± 34",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 108743,
            "range": "± 608",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 24906,
            "range": "± 235",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 179804,
            "range": "± 1549",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1627477,
            "range": "± 20357",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "06f6fbe0b4b33ccbe080e45694bd1ae8e34ea05c",
          "message": "spike(research): MIRAI feasibility scaffold for rivet-core (#191) (#264)\n\n* spike(research): MIRAI feasibility scaffold for rivet-core (#191)\n\nPicks up the feasibility-spike sub-AC proposed in the\n[2026-04-26 triage comment](https://github.com/pulseengine/rivet/issues/191#issuecomment-4322900490).\nLands the procedural deliverables now; first-pass diagnostics from a\nlive `cargo mirai` run will follow as a separate commit on this branch.\n\nHeadline finding: the issue body references `facebookexperimental/MIRAI`,\nwhich was archived 2024-08-22 and is read-only. Active maintenance lives\nat `endorlabs/MIRAI` (latest v1.1.12, 2025-03-04, nightly-2025-01-10\ntoolchain pin). The runner script and the report target the fork and\nflag the substitution explicitly so the issue can be retargeted.\n\nChanges:\n\n- scripts/research/mirai-on-rivet-core.sh\n  - Idempotent install + analysis runner. Pins MIRAI tag, nightly\n    toolchain (with rustc-dev / rust-src / llvm-tools-preview), and\n    output paths in one place.\n  - --install-only short-circuit for setup-without-analysis.\n  - --target {store|proofs|all} for selective re-runs.\n  - Writes diagnostics to results/mirai/<target>.txt for committed\n    artefact-driven reporting.\n\n- docs/research/mirai-prototype-report.md\n  - Validated install procedure (the part the script automates) +\n    explicit Endor-Labs-fork substitution callout for #191.\n  - Section stubs for \"Code paths analysed\", \"Properties MIRAI flagged\",\n    \"Side-by-side comparison with existing Kani proofs\", \"Integration\n    cost assessment\", \"Verdict\", \"Go/no-go for CI gate\".\n  - Report frames the three possible outcomes upfront so the run's\n    output drops directly into one of them.\n\nOut of scope for this commit:\n- First-pass diagnostics (`results/mirai/<target>.txt`) — a live run\n  is required; the install pipeline takes 10-15 min to compile the\n  checker on a 4-core box, then minutes per analysis target.\n- Findings summary on the V&V hub (#184 Phase 5) — gated on the\n  diagnostics + verdict landing first.\n\nRefs: FEAT-001\n\n* spike(research): MIRAI verdict — toolchain pin blocks build (#191)\n\nLive spike completed; verdict is outcome 3 of the three framed in the\nprior commit (\"install irreproducible against rivet stable toolchain\").\n\nWhat ran:\n\n- rustup toolchain install nightly-2025-01-10 (with rustc-dev / rust-src\n  / llvm-tools-preview): clean.\n- git clone --branch v1.1.12 endorlabs/MIRAI: clean.\n- cargo install --locked --path ./checker: 17m 40s, clean. Installed\n  /root/.cargo/bin/{mirai, cargo-mirai}.\n- mirai --version: needs LD_LIBRARY_PATH pointing at the nightly's lib/\n  dir (librustc_driver linkage quirk). Documented in the report.\n- cargo mirai --lib on rivet-core: TWO independent blockers, both\n  upstream-pin-related, both captured under results/mirai/:\n    1. results/mirai/run-msrv.txt — rivet-core's rust-version=1.89\n       refused; the pinned nightly is rustc 1.86.0-nightly (2025-01-09).\n    2. results/mirai/run-let-chains.txt — even with\n       --ignore-rust-version, spar-annex (pulled via the spar external)\n       uses stabilized let_chains, gated as #![feature(let_chains)] on\n       any pre-mid-2025 nightly.\n\nVerdict: hold the prototype until endorlabs/MIRAI bumps its\nrust-toolchain.toml past let_chains stabilization (rustc ≥ 1.88,\nnightly ≥ ~2025-04). At that point scripts/research/mirai-on-rivet-core.sh\nis a one-shot resumption.\n\nThis is the intended exit per the prior triage's spike scope:\n\"if install fails, the spike output is itself the verdict.\" The\nrunner script is preserved in scripts/research/ so the experiment\nresumes in minutes rather than hours when the upstream pin moves.\n\nRefs: FEAT-001\n\n* docs(mirai): wrap external version refs in backticks to silence VersionConsistency\n\nThe MIRAI spike report cites external tool versions (MIRAI v1.1.12 /\nv1.1.13) that are unrelated to rivet's workspace version. The\n`VersionConsistency` doc-check invariant matched the bare `vN.N.N`\npattern and flagged them as drift.\n\nWrap the four references in backticks. The invariant explicitly\nskips matches inside inline code (`is_code_context` check at\ndoc_check.rs:727), so this clears the violation without weakening\nthe guard for genuine rivet-version drift in prose.\n\nRefs: #191 (MIRAI spike)\n\n---------\n\nCo-authored-by: Claude <noreply@anthropic.com>",
          "timestamp": "2026-05-15T09:14:07-05:00",
          "tree_id": "cd19b870ffc957452b29e37f53e3896eed2889f3",
          "url": "https://github.com/pulseengine/rivet/commit/06f6fbe0b4b33ccbe080e45694bd1ae8e34ea05c"
        },
        "date": 1778854862672,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 81472,
            "range": "± 1664",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 886916,
            "range": "± 4526",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12774417,
            "range": "± 672459",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1924,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24796,
            "range": "± 98",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 355687,
            "range": "± 4165",
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
            "value": 1212791,
            "range": "± 27393",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 165199,
            "range": "± 672",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1897953,
            "range": "± 53317",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 25681811,
            "range": "± 491041",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 134767,
            "range": "± 1903",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1219649,
            "range": "± 10846",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 13884868,
            "range": "± 902854",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4148,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 44090,
            "range": "± 101",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 732095,
            "range": "± 4124",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 64759,
            "range": "± 167",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 714278,
            "range": "± 6898",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7861072,
            "range": "± 49436",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 811,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7312,
            "range": "± 35",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 91984,
            "range": "± 323",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22414,
            "range": "± 256",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 157000,
            "range": "± 1593",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1488413,
            "range": "± 12636",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "01c84a94172127c10d15f464634560d0377218ad",
          "message": "feat(coverage): rivet coverage --aggregate — file-based cross-repo V&V matrix (#270)\n\nImplements sub-issue 3 of the V&V coverage matrix decomposition on #188:\nthe cross-repo aggregator. Rather than reaching into the GitHub org API,\neach repo's CI emits `rivet coverage --matrix --format json` and a\ntop-level job merges the files with `rivet coverage --aggregate a.json\nb.json ... --format {text,markdown,html,json}`.\n\n- Duplicate `(repo, id)` rows are coalesced (first wins) so re-running\n  the aggregator over overlapping inputs is idempotent.\n- The merged JSON uses the same envelope as the per-repo command, so it\n  re-feeds the aggregator unchanged.\n- Bad / wrong-shaped inputs fail with a diagnostic that names the file.\n\n3 integration tests: markdown merge + column union, JSON round-trip +\ndedup, bad-input diagnostics. Existing `coverage --matrix` tests, clippy,\nfmt, and `rivet validate` baseline all unchanged.\n\nImplements: REQ-007\nRefs: FEAT-001\n\nCo-authored-by: Claude <noreply@anthropic.com>",
          "timestamp": "2026-05-15T09:24:38-05:00",
          "tree_id": "2f795fbd4b1b00c8d4f3c073aa9886fc9ce8eb02",
          "url": "https://github.com/pulseengine/rivet/commit/01c84a94172127c10d15f464634560d0377218ad"
        },
        "date": 1778855473197,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 81832,
            "range": "± 293",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 875221,
            "range": "± 5140",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 15603475,
            "range": "± 1059640",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1988,
            "range": "± 29",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24950,
            "range": "± 93",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 354695,
            "range": "± 3036",
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
            "value": 1237477,
            "range": "± 37110",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 168067,
            "range": "± 4141",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1928357,
            "range": "± 30342",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 43727277,
            "range": "± 4865511",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 136519,
            "range": "± 472",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1247381,
            "range": "± 14102",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 20987169,
            "range": "± 2306060",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4051,
            "range": "± 73",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 44286,
            "range": "± 617",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 743099,
            "range": "± 4621",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 59170,
            "range": "± 348",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 721128,
            "range": "± 9308",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8408462,
            "range": "± 518481",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 817,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 6784,
            "range": "± 96",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 94732,
            "range": "± 1317",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22200,
            "range": "± 59",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 163556,
            "range": "± 622",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1493230,
            "range": "± 12283",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "225ec492c2029cb98394260225872d1e01070289",
          "message": "feat(variant): fields-per-variant on Artifact + resolver (#255) (#285)\n\nMVP for the variant-aware properties track (docs/design/variant-aware-properties.md):\n\n- `Artifact::fields_per_variant: BTreeMap<variant_name, BTreeMap<field, value>>`\n  serialized as `fields-per-variant:` (kebab-case) at the artifact level.\n- `Artifact::fields_for_variant(Option<&str>) -> Cow<'_, BTreeMap<...>>`\n  resolves the effective fields map for a variant. Zero-alloc `Borrowed`\n  fallback when no overlay applies (None, unknown variant, empty overlay).\n  Allocates only when a known variant has overrides.\n- `#[derive(Default)]` on `Artifact` so tests can use the struct-update\n  pattern instead of carrying every new field forward at each call site.\n\nWired through:\n- yaml_hir schema-driven parser recognizes `fields-per-variant` and unpacks\n  the nested mapping into the typed field (does NOT fall through to the\n  generic `fields` smuggler).\n- generic-yaml adapter round-trips through a typed `fields_per_variant`\n  on `GenericArtifact`.\n- Resolution semantics per design doc §5.2: overlay merge — variant keys\n  override default keys; default keys not mentioned in the variant carry\n  through. Unknown variants silently inherit default fields (graceful\n  degradation when variant configs aren't loaded).\n\nTests cover:\n- Resolver: None / unknown / known / overlay-only-some-keys / new-keys.\n- Parser: nested mapping extraction populates the typed field, not the\n  generic `fields` map; both variants present after parse.\n\nImplements: REQ-010, REQ-028, REQ-029\nRefs: FEAT-001\n\nCo-authored-by: Claude Opus 4.7 <noreply@anthropic.com>",
          "timestamp": "2026-05-16T03:31:04-05:00",
          "tree_id": "77f3668a43b316c63121859d0d4e6fb3bd60648a",
          "url": "https://github.com/pulseengine/rivet/commit/225ec492c2029cb98394260225872d1e01070289"
        },
        "date": 1778920690082,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 65004,
            "range": "± 199",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 684104,
            "range": "± 2728",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 10199749,
            "range": "± 414992",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1499,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 18550,
            "range": "± 72",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 274939,
            "range": "± 1244",
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
            "value": 962954,
            "range": "± 3245",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 115599,
            "range": "± 583",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1359391,
            "range": "± 20069",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 19057723,
            "range": "± 267738",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 99819,
            "range": "± 1257",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 920395,
            "range": "± 2183",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 10971696,
            "range": "± 212289",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3237,
            "range": "± 78",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 33927,
            "range": "± 257",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 568565,
            "range": "± 4103",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 49865,
            "range": "± 331",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 524179,
            "range": "± 2614",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 6012076,
            "range": "± 33050",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 556,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 5031,
            "range": "± 12",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 68545,
            "range": "± 185",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 17477,
            "range": "± 157",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 124660,
            "range": "± 683",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1166651,
            "range": "± 16300",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "7c8b4ac777a995e0495d90b011cfb38f4eba9873",
          "message": "feat(supplier): cross-org boundary MVP — external-anchor + 3-state coverage (#253) (#286)\n\nMVP for the cross-organizational / supplier-management traceability track\n(docs/design/cross-org-supplier-traceability.md §6).\n\n- **`external-anchor` artifact type** in `schemas/common.yaml`: a typed\n  leaf marking the point at which the in-house chain hands off to a\n  supplier. Fields: `source-of-truth` (mapping), `expected-derived-types`\n  (list of artifact types the supplier is contracted to produce),\n  `received-status` (enum: not-received / received-as-reqif|pdf|oslc|\n  polarion-export|arxml|other), `contract-reference` (optional, points at\n  the DIA / PO).\n\n- **3-state coverage** in `rivet-core/src/coverage.rs`:\n  `CoverageEntry` gains `external_boundary: usize` +\n  `external_boundary_ids: Vec<String>`. Sum invariant: `covered +\n  external_boundary + uncovered_ids.len() == total`. Classification\n  rule: when an unsatisfied source artifact has a forward link to an\n  `external-anchor` whose `expected-derived-types` overlaps the rule's\n  target types (or the rule is unrestricted), it counts as\n  `external_boundary` instead of `uncovered`. Off-contract anchors do\n  NOT silently absorb gaps.\n\n- **`rivet supplier list`** + **`rivet supplier check`** CLI commands —\n  read-only surface for the auditor. `list` enumerates declared\n  anchors with their received-status and expected derivatives; `check`\n  prints the 3-state breakdown filtered to rules with boundary or\n  uncovered findings.\n\n- **`rivet coverage`** text and JSON output extended with the new\n  fields. Text output adds a Boundary column and breakdown summary\n  only when at least one boundary exists, keeping the common case\n  uncluttered. JSON adds `external_boundary`, `external_boundary_ids`,\n  `accounted_percentage` to each rule and an `external_boundary` total\n  to the overall block (additive, no schema break).\n\nTests:\n- Unit tests for the classification rule: boundary terminates chain,\n  off-contract anchor still uncovered, 3-state sum invariant.\n- 3 integration tests: `supplier list` text output, `supplier list`\n  JSON shape, `supplier check` classifies a delegated DD as\n  external_boundary.\n\nOut of MVP scope (deferred to Phase 2 per the design doc): structured\nexternal link target, federation handshake / `rivet supplier pull`,\nfield-mapping recipes, FederationProvenance. The MVP describes the\nboundary without federating across it — the audit-critical step.\n\nImplements: REQ-010, REQ-004, REQ-007\nRefs: FEAT-001\n\nCo-authored-by: Claude Opus 4.7 <noreply@anthropic.com>",
          "timestamp": "2026-05-16T04:17:05-05:00",
          "tree_id": "897278a1e064a2ee5c3964f0d15d5f2955209647",
          "url": "https://github.com/pulseengine/rivet/commit/7c8b4ac777a995e0495d90b011cfb38f4eba9873"
        },
        "date": 1778923424801,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 82359,
            "range": "± 1256",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 882812,
            "range": "± 76952",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12895431,
            "range": "± 784758",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1982,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25137,
            "range": "± 38",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 354769,
            "range": "± 1721",
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
            "value": 99,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1255742,
            "range": "± 11263",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 167180,
            "range": "± 2661",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1920369,
            "range": "± 26300",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 27971959,
            "range": "± 3343120",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 137712,
            "range": "± 439",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1266612,
            "range": "± 29293",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 14574258,
            "range": "± 480280",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4170,
            "range": "± 10",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 44275,
            "range": "± 547",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 730271,
            "range": "± 7191",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 60836,
            "range": "± 180",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 723386,
            "range": "± 3053",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8117521,
            "range": "± 390702",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 762,
            "range": "± 13",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7017,
            "range": "± 41",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 89702,
            "range": "± 325",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23775,
            "range": "± 87",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 170373,
            "range": "± 2037",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1606326,
            "range": "± 23927",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "ed4a4919463730d8ffa27845baa227735ad4e9d5",
          "message": "feat(tcl): tool-qualification workstream A + AI session provenance (#127) (#289)\n\nCloses #127 (AI session provenance — schema half) and ships the smallest\nviable surface of TCL design workstream A (per\ndocs/design/tool-confidence-level.md §7.4).\n\n**Schema additions (schemas/common.yaml)**\n\n- `ai-session` artifact type — pins a Claude Code (or other AI) session\n  to a commit so the auditor can reconstruct *who/what* authored a\n  change. Fields: session-id, session-hash (SHA-256 of transcript),\n  model-id, tool-version, commit-sha, started-at, ended-at, invoker.\n- `ai-found-defect` artifact type (TCL A3) — typed defect record for\n  errors introduced by AI authoring that rivet's detection machinery\n  caught. Fields: severity, triage-status (open/accepted/rejected/\n  deduplicated), detected-by, discovered-at, triaged-at, triaged-by.\n- Link types: `defect-against` (defect → target), `corrects` (fix →\n  defect), `produced-by` (artifact → ai-session).\n\n**Schema additions (schemas/iso-26262.yaml)**\n\n- `tool-confidence` artifact type (TCL A2) — typed tool-qualification\n  claim per ISO 26262-8 §11.4.7. Fields: tool-id, ti (TI1/TI2), td\n  (TD1/TD2/TD3), tcl (TCL1/TCL2/TCL3), regime (iso-26262/do-178c/\n  do-330/en-50128/iec-61508/iec-62304/iso-21434/iso-pas-8800), claim-\n  status (self-claimed/qualified/conditional/target), scope. link-field\n  `qualification-evidence` points at the proofs / oracle runs that\n  defend the TD claim.\n\n**Dogfood (TCL A1)**\n\n- Fix inverted TCL/TQL convention in safety/stpa/tool-qualification.yaml\n  header (now follows ISO 26262 Table 3: TCL1 = lowest demand).\n- New typed claim `TQ-CONF-RIVET` at safety/tool-qualification/\n  rivet-tool-confidence.yaml — rivet's own TI2/TD1/TCL1 self-claim\n  links to the seven hazards in the dogfood STPA.\n- rivet.yaml: load `iso-26262` schema + scan\n  `safety/tool-qualification/` source path.\n\n**CLI (TCL A4, A5)**\n\n- `--qualification-mode` flag on the top-level Cli. Initial gate\n  refuses `rivet sync` (Phase 2 federation, out of scope per dossier\n  §4). Read-only commands stay allowed; the list is deliberately\n  narrow — better to expand than to silently block audit work.\n- `rivet stats --qualification` — JSON-only configuration baseline\n  manifest for the dossier. Lists rivet version, schemas in use,\n  every `tool-confidence` artifact with its claim, and `ai-found-\n  defect` aggregates (by severity, by triage-status, plus open-IDs).\n  This is the snapshot the safety manager pastes into the dossier.\n- `rivet docs tool-qualification` — renders the new dossier doc\n  (docs/design/tool-qualification-dossier.md) wired into the docs\n  topic registry.\n\n**Tests**\n\n- Integration: `stats_qualification_emits_baseline_manifest_for_dogfood`\n  validates the full JSON envelope contains TQ-CONF-RIVET at TCL1.\n- Integration: `qualification_mode_blocks_sync` asserts the gate\n  produces a non-zero exit with a discoverable error message.\n\n**Not in this PR**\n\n- `rivet check ai-defects-open` oracle (deferred — needs the agent-\n  pipelines wiring, which is a bigger refactor).\n- Phase 2 of #127 (commit hook to auto-stamp ai-session metadata,\n  `rivet audit` to enforce that every AI commit has a session record).\n- Independent assessment (claim-status stays self-claimed).\n\nImplements: REQ-002, REQ-007, REQ-010\nRefs: FEAT-001, #127\n\nCo-authored-by: Claude Opus 4.7 <noreply@anthropic.com>",
          "timestamp": "2026-05-16T09:38:29-05:00",
          "tree_id": "8c465602fd97b2076a40851703a391dcdba4fab0",
          "url": "https://github.com/pulseengine/rivet/commit/ed4a4919463730d8ffa27845baa227735ad4e9d5"
        },
        "date": 1778942691749,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 80503,
            "range": "± 503",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 845667,
            "range": "± 3024",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12549543,
            "range": "± 825341",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2211,
            "range": "± 19",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 27454,
            "range": "± 658",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 377511,
            "range": "± 1221",
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
            "value": 95,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1351260,
            "range": "± 19098",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 162828,
            "range": "± 1181",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1839384,
            "range": "± 123043",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 24838551,
            "range": "± 1245383",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 123170,
            "range": "± 976",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1058529,
            "range": "± 18993",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 11712608,
            "range": "± 667915",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4267,
            "range": "± 39",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60371,
            "range": "± 558",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 748239,
            "range": "± 3733",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 61865,
            "range": "± 1272",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 693629,
            "range": "± 5688",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8013638,
            "range": "± 368464",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 826,
            "range": "± 138",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7276,
            "range": "± 55",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 116785,
            "range": "± 3500",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 25312,
            "range": "± 592",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 181499,
            "range": "± 988",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1702050,
            "range": "± 24704",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "e2466dbb1b16ea992b29f81cf41ff7b367fd6876",
          "message": "release(v0.10.0): variant + supplier + AI session + TCL workstream A (#290)\n\n* release(v0.10.0): variant + supplier + AI session + TCL workstream A\n\nWorkspace version bump 0.9.0 → 0.10.0. Theme: audit-grade story —\nthree orthogonal features that together move rivet from \"trace your\nproject\" to \"describe the boundary and defend the tool's role across\nit.\"\n\nHighlights (full notes in CHANGELOG.md):\n- Variant-aware properties — per-variant field values (#285, #255).\n- Cross-org / supplier-boundary coverage MVP (#286, #253).\n- AI session provenance — schema half (#289, partially #127).\n- Tool-qualification workstream A — typed claim + dossier (#289).\n- rivet stats --qualification + --qualification-mode flag (#289).\n- TCL/TQL numbering convention fix in dogfood STPA (#289).\n\nCo-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>\n\n* fix(release): docs-check violations on v0.10.0 release commit\n\nTwo docs-check violations on PR #290:\n- VersionConsistency: vscode-rivet/package.json bumped 0.9.0 → 0.10.0\n  (it has its own version field, not workspace-inherited).\n- SubcommandReferences: CHANGELOG mentioned `rivet audit` which is a\n  Phase 2 future subcommand. Rephrased to \"audit-side enforcement\n  subcommand\" so the literal `rivet audit` no longer parses as a\n  current-cli reference.\n\nLocal `rivet docs check` now passes (54 files, 0 violations).\n\nCo-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>\n\n---------\n\nCo-authored-by: Claude Opus 4.7 <noreply@anthropic.com>",
          "timestamp": "2026-05-16T10:51:50-05:00",
          "tree_id": "43ce0a6486e586d39bad5a0fbe853867ad8d8cb1",
          "url": "https://github.com/pulseengine/rivet/commit/e2466dbb1b16ea992b29f81cf41ff7b367fd6876"
        },
        "date": 1778947118761,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 75538,
            "range": "± 270",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 901030,
            "range": "± 5102",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 15309552,
            "range": "± 1209299",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1670,
            "range": "± 33",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 19188,
            "range": "± 119",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 363777,
            "range": "± 1487",
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
            "value": 1270186,
            "range": "± 13898",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 168430,
            "range": "± 1786",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1943544,
            "range": "± 23067",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 34386106,
            "range": "± 4199922",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 116502,
            "range": "± 819",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1056957,
            "range": "± 32705",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 14130663,
            "range": "± 1900283",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3876,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 41149,
            "range": "± 163",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 745391,
            "range": "± 8287",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 53260,
            "range": "± 218",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 586263,
            "range": "± 2550",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7081851,
            "range": "± 786962",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 663,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 5467,
            "range": "± 16",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 149958,
            "range": "± 1684",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23533,
            "range": "± 47",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 173888,
            "range": "± 2988",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1603653,
            "range": "± 18942",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "c9151f685c5144737220d0fc92a3dc4e1d147e3b",
          "message": "ci(release): make build-test-evidence non-blocking (continue-on-error) — round 2 (#293) (#294)\n\nv0.10.0 manual republish forensics:\nThe release workflow on tag v0.10.0 (run 25966236046) built all five\ncross-platform binaries, the VSIX, the compliance report, the baseline\nsnapshot, and ran docs-check successfully. The \"Create GitHub Release\"\njob was skipped because it `needs: build-test-evidence`, and that job\nfailed on the spar -> highs-sys WASI cross-compile (CMake\nThreads::Threads target not available in the wasi-sdk 25.0 sysroot).\n\nThe release was published manually from the workflow artifacts. To\nprevent this hand-republish on every future tag push:\n\n- `build-test-evidence`: `continue-on-error: true`. The job still runs\n  and uploads its artifact when it succeeds (desirable add-on), but a\n  failure no longer marks the run as failed.\n- `create-release.needs`: drop `build-test-evidence`. The Collect assets\n  step uses a permissive `find` and tolerates the missing tarball.\n\nHistory: #272 originally introduced the continue-on-error; #274 reverted\nit with the wasi-sdk integration that we expected to handle highs-sys.\nv0.10.0 proved that's still not enough. Tracking the upstream fix in\n#293 — once that's resolved, this commit can be reverted.\n\nRefs: #293",
          "timestamp": "2026-05-16T12:49:32-05:00",
          "tree_id": "b9ab1d8d327fe42ad4deb5b9a9dca7cc2123144c",
          "url": "https://github.com/pulseengine/rivet/commit/c9151f685c5144737220d0fc92a3dc4e1d147e3b"
        },
        "date": 1778954267549,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 81634,
            "range": "± 396",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 853128,
            "range": "± 9897",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13210516,
            "range": "± 1244964",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2187,
            "range": "± 10",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26399,
            "range": "± 610",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 363583,
            "range": "± 5043",
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
            "value": 1374716,
            "range": "± 27587",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 165391,
            "range": "± 1622",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1918166,
            "range": "± 44270",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 29738023,
            "range": "± 2888597",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 125390,
            "range": "± 898",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1082850,
            "range": "± 11437",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 15448971,
            "range": "± 1204825",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4390,
            "range": "± 34",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60234,
            "range": "± 339",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 754407,
            "range": "± 8768",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 62464,
            "range": "± 301",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 689834,
            "range": "± 14704",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7548192,
            "range": "± 119756",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 804,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7490,
            "range": "± 32",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 129562,
            "range": "± 1592",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 25146,
            "range": "± 580",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 180892,
            "range": "± 3895",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1700198,
            "range": "± 10778",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "2932166a71b4e52b1f7dd4ea8cec3eef50962f33",
          "message": "ci(release): sigstore keyless signing for SHA256SUMS + RELEASING.md (#296)\n\nSupply-Chain-Pentester finding (v0.10.0 adversarial review):\nSHA256SUMS shipped unsigned, so anyone who could replace a release\nasset could also replace the checksum file. The dossier sold defect\ndetection (true) but quietly implied tamper detection (false).\n\nCloses 80% of that gap with sigstore keyless OIDC — no long-lived\nsigning key, no KMS provisioning, no rotation. The trust anchor is\nthe GitHub-Actions workflow identity (issuer\n`token.actions.githubusercontent.com`, subject\n`.github/workflows/release.yml@refs/tags/vX.Y.Z`).\n\nWorkflow changes:\n- `permissions.id-token: write` so the runner can request its OIDC\n  token (required by cosign keyless flow).\n- New `Install cosign` step (sigstore/cosign-installer@v3, v2.4.1).\n- New `Sign SHA256SUMS with cosign (keyless OIDC)` step between\n  checksum generation and release creation. Emits three artifacts:\n  - `SHA256SUMS.txt.cosign.bundle` (verifier-friendly bundle)\n  - `SHA256SUMS.txt.sig` (detached signature)\n  - `SHA256SUMS.txt.pem` (Fulcio-issued short-lived cert)\n- The existing `Collect assets` step's permissive `find` already\n  picks up the new files; the release page will include them\n  automatically.\n\nNew `RELEASING.md` documents:\n- Why signed git tags matter + how to verify (`git tag -v`).\n- What CI signs (and why sigstore keyless was chosen).\n- How a consumer verifies a downloaded binary (two-step flow:\n  cosign verify-blob on the bundle, then sha256sum -c).\n- What is explicitly NOT signed at v0.10.0+ (binary archives\n  transitively only, VSIX, compliance tarball, the maintainer's\n  GPG keylist — for parity with the dossier §0 honest scope).\n- The manual-republish procedure used for v0.10.0 (#294 context).\n\nThis addresses the Supply-Chain-Pentester's \"one minimum primitive\nthat closes 80% of the gaps\" recommendation. The remaining 20%\n(per-archive signatures, VSIX signing, attestation in-toto bundle)\nare separate workstreams.\n\nCo-authored-by: Claude Opus 4.7 <noreply@anthropic.com>",
          "timestamp": "2026-05-17T00:27:18-05:00",
          "tree_id": "1e993783897cc6e29ae75aa27f6e317208265dce",
          "url": "https://github.com/pulseengine/rivet/commit/2932166a71b4e52b1f7dd4ea8cec3eef50962f33"
        },
        "date": 1778996898416,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 80682,
            "range": "± 1078",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 849597,
            "range": "± 5874",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 11958794,
            "range": "± 1062766",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2133,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25929,
            "range": "± 704",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 370135,
            "range": "± 4067",
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
            "value": 1376247,
            "range": "± 11771",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 159906,
            "range": "± 2266",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1859705,
            "range": "± 37136",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 27503012,
            "range": "± 3355058",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 125460,
            "range": "± 773",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1087561,
            "range": "± 10979",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 12511533,
            "range": "± 1331396",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4278,
            "range": "± 12",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 58891,
            "range": "± 249",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 762012,
            "range": "± 16088",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 62559,
            "range": "± 1010",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 707202,
            "range": "± 40747",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7858723,
            "range": "± 401566",
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
            "value": 7847,
            "range": "± 50",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 122594,
            "range": "± 924",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 25262,
            "range": "± 158",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 182406,
            "range": "± 4294",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1705426,
            "range": "± 24293",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "74a7d07f1e49271ad3e460a44d8189f1e9e6ed2e",
          "message": "feat: salsa-tracked build_store + TCL workstream B + honest dossier (adversarial-review fixes) (#295)\n\n* perf(db): track build_store + build_store_with_extras as salsa queries\n\nMobile/Scale lens finding (v0.10.0 adversarial review): `build_store`\nin `db.rs:646` was a plain `fn`, so every downstream tracked query\n(`validate_all`, `build_link_graph`, `compute_coverage_tracked`) re-built\nthe entire `Store` HashMap (cloning every `Artifact`) on every salsa\nrevision — defeating the incremental validation claim the dossier\nmakes in §3.\n\nThis commit:\n- Marks `build_store` and `build_store_with_extras` `#[salsa::tracked]`.\n- Adds `PartialEq` to `Store` (required for salsa change-detection).\n\nResult: subsequent calls with the same `source_set` / `schema_set` /\n`extra_set` return the memoized `Store` instead of re-running the\nfunction. Single-file edits still re-validate that file (its\n`parse_artifacts_v2` invalidates), but unchanged files don't get\nre-parsed or re-inserted into a fresh HashMap.\n\nA regression test (`build_store_cache_returns_equal_on_noop_revision`)\nfollows in a separate commit to keep the diffs focused.\n\nCo-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>\n\n* test(db): regression test for build_store salsa cache (REQ-029)\n\nVerifies the prior commit's tracked build_store actually memoizes:\nrepeated calls with the same source_set + schema_set return equal\nStores. While salsa cache observability isn't directly testable from\nuser code, equality after a no-op revision is a necessary condition.\n\nCo-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>\n\n* feat(schema): add dpia artifact type + retention fields on ai-session\n\nDPO-Lens finding (v0.10.0 adversarial review): `ai-session.invoker`\ncollects personal data per DSGVO Art. 4 without a lawful basis,\nretention period, or erasure mechanism. The dossier section §0 calls\nthis out as a not-yet-defensible gap; this commit ships the typed\nshape so projects can actually populate the metadata DSGVO Art. 35\nexpects.\n\nNew on `ai-session`:\n- `lawful-basis` (DSGVO Art. 6(1)/(9)(2), enumerated allowed values\n  including `anonymised` for non-PII cases).\n- `retention-period` (ISO 8601 duration, Art. 5(1)(e)).\n- `erasure-mechanism` (free-form, Art. 17).\n\nNew artifact type `dpia` in `schemas/common.yaml`:\n- `dpo-sign-off`, `personal-data-categories` (required).\n- `risk-assessment` (low/medium/high).\n- `mitigation-measures`, `consultation-date` (optional).\n\nNOT in this commit (deliberately):\n- A conditional-rule that forces `invoker`-set artifacts to link to a\n  dpia. Adding that requires validate-time enforcement work and would\n  block release on projects that haven't authored a dpia yet —\n  separate PR with a migration story.\n\nCo-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>\n\n* feat(check): rivet check ai-defects-open — TCL workstream B operational gate\n\nAuditor + PM/Pragmatiker findings (v0.10.0 adversarial review): the\ndossier's §3 TD1 detection-layer claim names the ai-found-defect\ntriage loop as the operational primitive — but v0.10.0 shipped only\nthe schema, not the gate. This commit ships the gate.\n\nNew subcommand `rivet check ai-defects-open` exits non-zero when:\n\n**Gate 1 (open-against-released):** an `ai-found-defect` with\n`triage-status: open` has a `defect-against` link to an artifact\nwhose `status` is `released` or `approved`. Without this gate,\nrelease proceeds with un-triaged AI defects against shipped work.\n\n**Gate 2 (segregation-of-duties, DPO finding):** a defect's\n`triaged-by` matches the originating session's `invoker` (resolved\nvia `produced-by` link). The same AI/operator that authored the\noffending artifact must not mark its own defect \"accepted.\" This is\nISO 26262-2 §6.4.7 confirmation-reviewer independence at the AI-loop\nlevel.\n\nRead-only. JSON for CI consumers, text for humans. Tested:\n- ai_defects_open_passes_when_triaged_and_no_self_triage\n- ai_defects_open_fails_on_open_defect_against_released\n- ai_defects_open_fails_on_self_triage_segregation_violation\n\nCo-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>\n\n* docs(tcl): honest scope statement in dossier + TQ-CONF-RIVET claim\n\nDPO/Auditor/Formal-Skeptiker findings (v0.10.0 adversarial review):\nthe dossier and the typed claim overstated v0.10.0's defensibility:\n\n- Claimed \"Kani 2000+ proofs\" — real number is 27 harnesses with\n  mostly-trivial 8-24 byte bounded input panic-freedom checks.\n- Claimed \"TD1 high confidence\" via \"product of miss rates\" — common-\n  mode fallacy (all five layers share the same parser + Artifact\n  model).\n- Cited DO-330/IEC 62304/EN 50128 cross-walks without disclosing the\n  upstream design note's \"unverified clause-level\" caveat.\n- Did not mention `vmodel_chain_two_steps` is `Admitted`, nor that\n  `backlink_symmetric` is `assume`'d in Verus.\n- Did not mention mutation testing runs 29 mutants total.\n- Did not mention `claim-status: self-claimed` + AI-authored.\n- Did not mention release SHA256SUMS / git tag are unsigned.\n- Did not mention DPIA linkage isn't enforced at validate time.\n\nThis commit adds §0 \"Honest scope statement (read this first)\" to\n`docs/design/tool-qualification-dossier.md` enumerating each of the\nabove gaps, and updates the typed claim's `scope` field to match.\nStrips the \"2000+ proofs\" claim from §3 and replaces with concrete\ncounts.\n\nThe dossier is now honest about what v0.10.0 has and hasn't earned.\n\nCo-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>\n\n* style: cargo fmt --all on adversarial-review fix branch\n\nCI format check on #295 flagged collapsed-arm rustfmt diffs in\ncmd_check_ai_defects_open, the integration tests, and db.rs. Pure\nformatting; no semantic changes.\n\nCo-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>\n\n---------\n\nCo-authored-by: Claude Opus 4.7 <noreply@anthropic.com>",
          "timestamp": "2026-05-17T01:16:19-05:00",
          "tree_id": "71b53898c01bba9993270bd58906c37859b00abc",
          "url": "https://github.com/pulseengine/rivet/commit/74a7d07f1e49271ad3e460a44d8189f1e9e6ed2e"
        },
        "date": 1779019772194,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 81706,
            "range": "± 1866",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 855564,
            "range": "± 6664",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13536147,
            "range": "± 804316",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2224,
            "range": "± 25",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25850,
            "range": "± 340",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 380042,
            "range": "± 7656",
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
            "value": 98,
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
            "value": 1456750,
            "range": "± 36030",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 160416,
            "range": "± 860",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1868815,
            "range": "± 23217",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 28683764,
            "range": "± 1741716",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 126022,
            "range": "± 1054",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1085958,
            "range": "± 54960",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 14142403,
            "range": "± 1381488",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4252,
            "range": "± 31",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 59406,
            "range": "± 304",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 757604,
            "range": "± 16313",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 61629,
            "range": "± 197",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 696497,
            "range": "± 4245",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7620032,
            "range": "± 210254",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 790,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7249,
            "range": "± 209",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 119490,
            "range": "± 1531",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 25507,
            "range": "± 322",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 194962,
            "range": "± 4144",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1669550,
            "range": "± 61922",
            "unit": "ns/iter"
          }
        ]
      }
    ]
  }
}