window.BENCHMARK_DATA = {
  "lastUpdate": 1795131238934,
  "repoUrl": "https://github.com/pulseengine/rivet",
  "entries": {
    "Rivet Criterion Benchmarks": [
      {
        "commit": {
          "author": {
            "email": "49699333+dependabot[bot]@users.noreply.github.com",
            "name": "dependabot[bot]",
            "username": "dependabot[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": false,
          "id": "00fd5b164a1cae4f26db3644322336653578c18e",
          "message": "build(deps): bump clap from 4.6.1 to 4.6.7 (#1189)\n\nBumps [clap](https://github.com/clap-rs/clap) from 4.6.1 to 4.6.7.\n- [Release notes](https://github.com/clap-rs/clap/releases)\n- [Changelog](https://github.com/clap-rs/clap/blob/main/CHANGELOG.md)\n- [Commits](https://github.com/clap-rs/clap/compare/clap_complete-v4.6.1...clap_complete-v4.6.7)\n\n---\nupdated-dependencies:\n- dependency-name: clap\n  dependency-version: 4.6.7\n  dependency-type: direct:production\n  update-type: version-update:semver-patch\n...\n\nSigned-off-by: dependabot[bot] <support@github.com>\nCo-authored-by: dependabot[bot] <49699333+dependabot[bot]@users.noreply.github.com>",
          "timestamp": "2026-11-08T17:35:44Z",
          "tree_id": "13d944d666078fa160675a71375a825677c2de84",
          "url": "https://github.com/pulseengine/rivet/commit/00fd5b164a1cae4f26db3644322336653578c18e"
        },
        "date": 1794169750826,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 77794,
            "range": "± 983",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 945104,
            "range": "± 9485",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14279422,
            "range": "± 670554",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1692,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 19373,
            "range": "± 92",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 375328,
            "range": "± 1612",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 85,
            "range": "± 3",
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
            "value": 1972447,
            "range": "± 24189",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 168876,
            "range": "± 909",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1973324,
            "range": "± 50749",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 33315733,
            "range": "± 1400801",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 727117,
            "range": "± 5700",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 16977794,
            "range": "± 304435",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 977998472,
            "range": "± 7389231",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4154,
            "range": "± 47",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 46101,
            "range": "± 89",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 885087,
            "range": "± 14803",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 49034,
            "range": "± 716",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 584394,
            "range": "± 7163",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7995428,
            "range": "± 541316",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 834,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 12202,
            "range": "± 106",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 369176,
            "range": "± 2236",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22542,
            "range": "± 109",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 146240,
            "range": "± 549",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1366223,
            "range": "± 11976",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": false,
          "id": "a94da26fcb6eb9ca506eac10465c39c5d62815a8",
          "message": "ci: authenticated, retried release downloads; audit back on self-hosted (#1208)\n\nGitHub's \"increase in timeouts for some unauthenticated users\" incident\n(2026-11-08, about 10:36-12:38 UTC) failed required and proof jobs on\nevery open PR for hours: each was an unauthenticated download of a GitHub\nrelease asset that got 503/504.\n\nThe actionlint (Test job) and zola (Zola export smoke) downloads now send\nthe job token and retry: curl --retry 5 --retry-all-errors. curl drops a\ncustom Authorization header when a redirect leaves the original host, so\nthe token is not sent to the asset storage host.\n\nNot covered, deliberately: taiki-e/install-action (nine sites, including\ncargo-vet's installer) already retries but passes a token only to its\ncargo-binstall fallback, and kani-github-action's `cargo-kani setup` has no\ntoken hook, so neither can be fixed from this workflow. Bazel's downloader\nretries were left alone: there is no .bazelversion, and an experimental\nflag unknown to the latest Bazel would break Verus and Rocq outright.\n\nThe RustSec audit job returns to self-hosted (light). It moved to\nubuntu-latest because smithy's cargo-audit 0.21.2 rejects CVSS 4.0\nadvisories and building a newer one tripped on smithy's sccache-on-cc.\nsmithy#91 preinstalls 0.22.2, so the install step uses the runner's copy\nwhen it is at least 0.22.2 and otherwise installs exactly that version.\nConfirmed the version guard on none, 0.21.2, 0.22.1, 0.22.2, 0.22.10,\n0.23.0 and 1.0.0; actionlint is clean apart from custom runner labels.\n\n\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9\n\nCo-authored-by: Claude Opus 5.5 <noreply@anthropic.com>",
          "timestamp": "2026-11-08T18:15:09Z",
          "tree_id": "b42c3e62a530532ab8e1a53cf2f4e1a4b898e4d2",
          "url": "https://github.com/pulseengine/rivet/commit/a94da26fcb6eb9ca506eac10465c39c5d62815a8"
        },
        "date": 1794172150626,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 67580,
            "range": "± 5845",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 849088,
            "range": "± 3063",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 9030603,
            "range": "± 39759",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1349,
            "range": "± 56",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 16082,
            "range": "± 393",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 306424,
            "range": "± 1161",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 64,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/1000",
            "value": 64,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 64,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1743554,
            "range": "± 21576",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 147141,
            "range": "± 539",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1732938,
            "range": "± 9243",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 22063460,
            "range": "± 224678",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 609954,
            "range": "± 2766",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 14232695,
            "range": "± 47006",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 888989241,
            "range": "± 6511864",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3415,
            "range": "± 98",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 39851,
            "range": "± 74",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 840397,
            "range": "± 2281",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 43885,
            "range": "± 248",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 490872,
            "range": "± 32776",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 6047851,
            "range": "± 169490",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 844,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 10053,
            "range": "± 36",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 292210,
            "range": "± 5218",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 19161,
            "range": "± 468",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 123151,
            "range": "± 627",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1125503,
            "range": "± 5457",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": false,
          "id": "ff8e092d18a999c44f4c8b87e1dfb94512b2c1a2",
          "message": "ci: CI Gate accepts a skip only for a recorded reason; temper gate probe (#1211)\n\n* ci: CI Gate accepts a skip only for a recorded reason; temper gate probe\n\ntemper's report-only gate check (temper#86) flags rivet with\naggregate_accepts_skip: CI Gate passed any skipped need once the change\ndetector had succeeded, without checking that the detector excluded that\njob. A job skipped for any other reason read as a pass.\n\nThe verdict moves to tools/ci/ci-gate-check.sh. A skip passes only when\nthe `changes` output that gates the job is \"false\" (fmt, clippy, msrv,\ndeny, semver-checks on rust; test and supply-chain on tests; wasm-seam on\nwasm), or when the job's own event condition excludes the event\n(semver-checks outside pull_request, supply-chain in the merge queue). A\nskip of anything else (docs-check, yaml-lint, traceability) fails, as does\na failed detector. The gate job gains a sparse, credential-less checkout of\ntools/ci to run it. tools/ci/ci-gate-check_test.sh holds it to those rules\nwith 12 cases, most of them negative controls; a mutant that accepts every\nskip turns 4 of them red.\n\ndetect-changes.sh reads GATE_PROBE_FILES when set (temper\ndocs/gate-probe.md): the probe runs it with no event or git range, which\npreviously failed closed by running everything, so the probe would have\npassed without the classifier running. .github/gate-probe.json declares the\n`tests` output, which every control turns on (code and data both run the\ntests). `rust` is not declared: by the maintainer's choice, supply-chain/\nis data and runs Test and cargo-vet but not the whole matrix. The detector\ntest gains probe-mode cases, including a listed non-code path that must\ncome back all false so a say-true-to-everything detector cannot pass.\n\nConfirmed with ci-gate-check_test.sh (12 pass), detect-changes_test.sh (31\npass), a local probe run over temper's three default controls and rivet's\nown, and actionlint (clean apart from custom runner labels).\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9\n\n* ci: declare a negative control in gate-probe.json\n\ntemper#87 requires a non-empty negative_controls list: each declared output\nmust come back exactly \"false\" for those paths, or the probe reports the\ndetector VACUOUS. LICENSE-MIT is a listed non-code path (the same one the\ndetector test uses); a local run with the probe environment (EVENT_NAME and\nGITHUB_EVENT_NAME pull_request, GATE_PROBE_FILES, GITHUB_OUTPUT) gives\ntests=false for it and tests=true for all six controls.\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9\n\n* ci: declare the exempt detector outputs in gate-probe.json\n\ntemper#87 asks every detector output that gates a required check to be\neither probed (outputs) or exempt with a reason (exempt_outputs). CI Gate\nneeds jobs gated on rust (fmt, clippy, msrv, deny, semver-checks), tests\n(test, supply-chain) and wasm (wasm-seam). tests stays probed. rust is\nexempt: data-tier changes skip the full matrix by the maintainer's choice.\nwasm is exempt and says why: its filter is still a positive list, the\nfail-open shape #1206 left unconverted. proofs, e2e and vscode gate no\nrequired check.\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9\n\n---------\n\nCo-authored-by: Claude Opus 5.5 <noreply@anthropic.com>",
          "timestamp": "2026-11-08T19:48:57Z",
          "tree_id": "265f9c8a24f312a78bcc62b07d5640f1d6de27dc",
          "url": "https://github.com/pulseengine/rivet/commit/ff8e092d18a999c44f4c8b87e1dfb94512b2c1a2"
        },
        "date": 1794172654025,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 66617,
            "range": "± 223",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 680728,
            "range": "± 6783",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 11503845,
            "range": "± 126257",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1481,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 17911,
            "range": "± 46",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 279645,
            "range": "± 3830",
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
            "value": 1537740,
            "range": "± 28913",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 119247,
            "range": "± 655",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1357580,
            "range": "± 15301",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 20714365,
            "range": "± 175478",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 545593,
            "range": "± 2207",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 12471576,
            "range": "± 61577",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 857468295,
            "range": "± 6371129",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3515,
            "range": "± 19",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 40041,
            "range": "± 253",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 612295,
            "range": "± 5288",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 42978,
            "range": "± 584",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 497795,
            "range": "± 1851",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 6128103,
            "range": "± 27842",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 828,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 11347,
            "range": "± 29",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 197281,
            "range": "± 1491",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 17223,
            "range": "± 53",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 111566,
            "range": "± 485",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1028435,
            "range": "± 26947",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "49699333+dependabot[bot]@users.noreply.github.com",
            "name": "dependabot[bot]",
            "username": "dependabot[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "14006fc2eb232ed8a0ad41a6f0a034f3b21131cc",
          "message": "build(deps-dev): bump @types/vscode in /vscode-rivet (#1213)\n\nBumps [@types/vscode](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/HEAD/types/vscode) from 1.91.0 to 1.145.0.\n- [Release notes](https://github.com/DefinitelyTyped/DefinitelyTyped/releases)\n- [Commits](https://github.com/DefinitelyTyped/DefinitelyTyped/commits/HEAD/types/vscode)\n\n---\nupdated-dependencies:\n- dependency-name: \"@types/vscode\"\n  dependency-version: 1.145.0\n  dependency-type: direct:development\n  update-type: version-update:semver-minor\n...\n\nSigned-off-by: dependabot[bot] <support@github.com>\nCo-authored-by: dependabot[bot] <49699333+dependabot[bot]@users.noreply.github.com>",
          "timestamp": "2026-11-08T22:30:54Z",
          "tree_id": "acdc62683d3b44c8b82928e17fbbad7ffd59b4d9",
          "url": "https://github.com/pulseengine/rivet/commit/14006fc2eb232ed8a0ad41a6f0a034f3b21131cc"
        },
        "date": 1794178644673,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 46749,
            "range": "± 718",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 587016,
            "range": "± 15811",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 10729184,
            "range": "± 675666",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1042,
            "range": "± 17",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 12286,
            "range": "± 269",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 244738,
            "range": "± 8937",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 48,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/1000",
            "value": 48,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 46,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1195290,
            "range": "± 21736",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 109575,
            "range": "± 1678",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1231297,
            "range": "± 31608",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 17166984,
            "range": "± 979469",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 418410,
            "range": "± 14709",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 9035728,
            "range": "± 406372",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 571801609,
            "range": "± 9626891",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 2859,
            "range": "± 40",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 31526,
            "range": "± 182",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 468042,
            "range": "± 8633",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 31312,
            "range": "± 1011",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 344935,
            "range": "± 13274",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 4157138,
            "range": "± 207116",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 476,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 6792,
            "range": "± 81",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 126863,
            "range": "± 8214",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 13142,
            "range": "± 354",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 85446,
            "range": "± 1829",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 816955,
            "range": "± 14831",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "49699333+dependabot[bot]@users.noreply.github.com",
            "name": "dependabot[bot]",
            "username": "dependabot[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "f5e838a5f01cd0e43a1f959447cf25d4ffbfe64c",
          "message": "build(deps): bump log from 0.4.29 to 0.4.35 in /fuzz (#1217)\n\nBumps [log](https://github.com/rust-lang/log) from 0.4.29 to 0.4.35.\n- [Release notes](https://github.com/rust-lang/log/releases)\n- [Changelog](https://github.com/rust-lang/log/blob/main/CHANGELOG.md)\n- [Commits](https://github.com/rust-lang/log/compare/0.4.29...v0.4.35)\n\n---\nupdated-dependencies:\n- dependency-name: log\n  dependency-version: 0.4.35\n  dependency-type: direct:production\n  update-type: version-update:semver-patch\n...\n\nSigned-off-by: dependabot[bot] <support@github.com>\nCo-authored-by: dependabot[bot] <49699333+dependabot[bot]@users.noreply.github.com>",
          "timestamp": "2026-11-08T23:10:59Z",
          "tree_id": "3e745a0c2e672f05a937c607d6126f5d936b9368",
          "url": "https://github.com/pulseengine/rivet/commit/f5e838a5f01cd0e43a1f959447cf25d4ffbfe64c"
        },
        "date": 1794180732949,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 67026,
            "range": "± 6443",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 681295,
            "range": "± 17467",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 16384794,
            "range": "± 1643830",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1429,
            "range": "± 9",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 17983,
            "range": "± 70",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 279210,
            "range": "± 2936",
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
            "range": "± 1",
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
            "value": 1543372,
            "range": "± 11796",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 123639,
            "range": "± 5448",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1419269,
            "range": "± 15294",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 30423722,
            "range": "± 3077376",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 548005,
            "range": "± 3237",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 13436960,
            "range": "± 161676",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 887404122,
            "range": "± 17389150",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3512,
            "range": "± 18",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 39292,
            "range": "± 1955",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 640689,
            "range": "± 9799",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 43495,
            "range": "± 737",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 492822,
            "range": "± 3282",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7773534,
            "range": "± 1930282",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 788,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 11183,
            "range": "± 17",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 201813,
            "range": "± 8946",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 17433,
            "range": "± 290",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 111026,
            "range": "± 2835",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1028812,
            "range": "± 18760",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "49699333+dependabot[bot]@users.noreply.github.com",
            "name": "dependabot[bot]",
            "username": "dependabot[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "296f6b6c91869074c11ba4cbacd39fc4f4824d0f",
          "message": "build(deps): bump softprops/action-gh-release (#1214)\n\nBumps the github-actions-all group with 1 update: [softprops/action-gh-release](https://github.com/softprops/action-gh-release).\n\n\nUpdates `softprops/action-gh-release` from 3.0.3 to 3.0.4\n- [Release notes](https://github.com/softprops/action-gh-release/releases)\n- [Changelog](https://github.com/softprops/action-gh-release/blob/master/CHANGELOG.md)\n- [Commits](https://github.com/softprops/action-gh-release/compare/efb35369e0ad2afab669f228072c1b0d510eae64...8a0cd651e5b2365bd640854a3fa5dfc70e4875f3)\n\n---\nupdated-dependencies:\n- dependency-name: softprops/action-gh-release\n  dependency-version: 3.0.4\n  dependency-type: direct:production\n  update-type: version-update:semver-patch\n  dependency-group: github-actions-all\n...\n\nSigned-off-by: dependabot[bot] <support@github.com>\nCo-authored-by: dependabot[bot] <49699333+dependabot[bot]@users.noreply.github.com>",
          "timestamp": "2026-11-09T04:48:14Z",
          "tree_id": "83376e88ac89b8bf238a3da56fcbd9d7a56d8f05",
          "url": "https://github.com/pulseengine/rivet/commit/296f6b6c91869074c11ba4cbacd39fc4f4824d0f"
        },
        "date": 1794201170586,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85195,
            "range": "± 276",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 854570,
            "range": "± 16734",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 15118761,
            "range": "± 802782",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2176,
            "range": "± 68",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25888,
            "range": "± 517",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 413528,
            "range": "± 2494",
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
            "value": 1954079,
            "range": "± 21556",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 159800,
            "range": "± 1966",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1812019,
            "range": "± 14955",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 32512296,
            "range": "± 1098505",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 759666,
            "range": "± 4306",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 18796805,
            "range": "± 330437",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1352409192,
            "range": "± 11218800",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4895,
            "range": "± 14",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 67452,
            "range": "± 550",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 885769,
            "range": "± 23744",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 56254,
            "range": "± 427",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 663292,
            "range": "± 4728",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 12247428,
            "range": "± 291269",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1167,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15602,
            "range": "± 155",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 380672,
            "range": "± 17174",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 24421,
            "range": "± 74",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 162859,
            "range": "± 835",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1517530,
            "range": "± 25038",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": false,
          "id": "b33c7b83c624fb68af5c3f55306df127d1e462ed",
          "message": "build(deps): openssl 0.10.80 for three RustSec advisories; rmcp advisory assessed not applicable (#1220)\n\nCargo Deny (a CI Gate need) has been red on main and on every PR since\nfour new advisories were published:\n\n- RUSTSEC-2026-0474, -0476, -0477 (openssl 0.10.78: non-UTF-8 &str from\n  X509Ref::ocsp_responders; AES key-wrap-with-padding buffer overflows in\n  cipher_update and cipher_update_inplace). Fixed in 0.10.80. openssl is\n  pinned to exactly 0.10.80 and openssl-sys to 0.9.116, the newest versions\n  Bytecode Alliance's imported cargo-vet audits cover (0.10.78 -> 0.10.80,\n  0.9.114 -> 0.9.116); `cargo vet` refreshed imports.lock with those four\n  audits and nothing else, so no unreviewed code enters. 0.10.82 would add\n  ~1400 unaudited lines for no further fix.\n\n- RUSTSEC-2026-0462 (rmcp 1.5.0: unbounded body buffering in the\n  Streamable HTTP clients). Fixed only in rmcp 3.9.0, two major versions\n  away. rivet enables neither affected feature\n  (transport-streamable-http-client-reqwest / -unix-socket); measured with\n  `cargo tree -e features -i rmcp`. Ignored in deny.toml with the\n  assessment, the reason not to upgrade now, a re-check trigger and a\n  2027-02-01 date, and in the audit step alongside it, as that step's\n  comment requires.\n\nConfirmed locally: cargo deny check advisories bans licenses sources (0.20.2,\nCI's version) all ok; cargo audit --ignore RUSTSEC-2026-0462 exits 0 (7\nallowed warnings, unchanged); cargo vet --locked succeeds; actionlint clean.\nOn macOS native-tls uses Security.framework, so the openssl build itself is\nexercised only by Linux CI.\n\n\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9\n\nCo-authored-by: Claude Opus 5.5 <noreply@anthropic.com>",
          "timestamp": "2026-11-10T21:43:24Z",
          "tree_id": "5cf2dd9ea89a594ce492d0ce8cc76f7a647a2b96",
          "url": "https://github.com/pulseengine/rivet/commit/b33c7b83c624fb68af5c3f55306df127d1e462ed"
        },
        "date": 1794355673509,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 68811,
            "range": "± 573",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 689806,
            "range": "± 21858",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 15814470,
            "range": "± 1473963",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1479,
            "range": "± 43",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 17865,
            "range": "± 265",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 275994,
            "range": "± 5608",
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
            "value": 1558258,
            "range": "± 20075",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 118340,
            "range": "± 561",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1371713,
            "range": "± 16416",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 24888725,
            "range": "± 1972344",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 545498,
            "range": "± 3418",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 12853084,
            "range": "± 431660",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 862238429,
            "range": "± 11264840",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3604,
            "range": "± 212",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 40021,
            "range": "± 662",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 615150,
            "range": "± 10028",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 43390,
            "range": "± 109",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 494501,
            "range": "± 11406",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 6729542,
            "range": "± 708577",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 800,
            "range": "± 23",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 11226,
            "range": "± 29",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 201379,
            "range": "± 8123",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 17466,
            "range": "± 63",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 113749,
            "range": "± 3266",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1031732,
            "range": "± 80074",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": false,
          "id": "3120a389a6e177145d6b166e199b3a46c14b113b",
          "message": "ci: run temper's gate probe on pull requests (report-only) (#1219)\n\n* ci: run temper's gate probe on pull requests (report-only)\n\nAdds .github/workflows/gate-probe.yml, which runs temper's gate-probe\naction pinned to a57e81353acfad05bf1e4cf635281a7562253d36 (the merge of\ntemper#87, main green). The action runs tools/ci/detect-changes.sh on the\ncontrol paths in .github/gate-probe.json plus temper's defaults and fails\nif a declared output (tests, wasm) fails open or a negative control comes\nback true.\n\nFollows temper's workflow rules: pull_request only (never\npull_request_target), no path filter, no `if:`, no continue-on-error,\ncontents: read, credential-less checkout. Report-only: it is not a\nrequired check; that is a later per-repo step after the owner approves.\n\nConfirmed by running temper's gate_probe.py at that SHA against current\nmain: exit 0, \"every detector fails closed\" (5 controls closed, 2 negative\ncontrols non-code). actionlint clean apart from custom runner labels.\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9\n\n* ci(gate-probe): route fork PRs to a hosted runner\n\nThe probe executes the pull request's own detector script, and the\nself-hosted runner group accepts public repositories, so a fork PR would\nrun untrusted code on the self-hosted hosts after a single mistaken fork\napproval. Fork PRs now run on ubuntu-latest; same-repo PRs stay on the\nlight self-hosted runner, the same routing spar, meld, gale, varve and\nrelay use. The job still runs on every PR, so it cannot be skipped.\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9\n\n* ci: pin temper gate-probe to 308848d1\n\ntemper 308848d1 is one commit after a57e8135 on main, with all 8 check\nruns green (run 42897869007). It removes tracked __pycache__ bytecode\nfrom the distributed action and adds a fork-routing rule for public\nrepos; gate_probe.py itself is unchanged. rivet's runs-on already routes\nfork PRs to ubuntu-latest, so the new rule accepts this workflow.\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9\n\n---------\n\nCo-authored-by: Claude Opus 5.5 <noreply@anthropic.com>",
          "timestamp": "2026-11-11T00:16:43Z",
          "tree_id": "c1b4216fc96902000deef012d0a255647286a7ec",
          "url": "https://github.com/pulseengine/rivet/commit/3120a389a6e177145d6b166e199b3a46c14b113b"
        },
        "date": 1794363660152,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 53487,
            "range": "± 1126",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 640097,
            "range": "± 11290",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12157794,
            "range": "± 1010129",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1142,
            "range": "± 19",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 13781,
            "range": "± 421",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 253953,
            "range": "± 10453",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 51,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/1000",
            "value": 50,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 55,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1320739,
            "range": "± 49581",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 116841,
            "range": "± 1352",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1312358,
            "range": "± 31808",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 25034969,
            "range": "± 3374090",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 461260,
            "range": "± 11272",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 11464984,
            "range": "± 377322",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 664697363,
            "range": "± 20511247",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3146,
            "range": "± 175",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 33892,
            "range": "± 619",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 540200,
            "range": "± 12130",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 33744,
            "range": "± 545",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 369904,
            "range": "± 9946",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7248335,
            "range": "± 1229132",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 544,
            "range": "± 19",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7639,
            "range": "± 91",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 133643,
            "range": "± 3949",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 14111,
            "range": "± 1227",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 93737,
            "range": "± 3023",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 857253,
            "range": "± 28905",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "08db01fd43956d53edc45817a7fc8c2a4cbe3884",
          "message": "ci: ledger of proof trust escapes, and a coqchk axiom check in Rocq Proofs (#1222)\n\n* ci: ledger of proof trust escapes, and a coqchk axiom check in Rocq Proofs\n\nproofs/trust-ledger.tsv lists every statement rivet's provers accept\nwithout checking: today one Rocq Admitted (Schema.v\nvmodel_chain_two_steps) and one Verus assume (verus_specs.rs\nlemma_build_yields_symmetric). tools/ci/trust-ledger.py scans Rocq\nAdmitted, Admit Obligations, Axiom, Parameter and Conjecture (comments\nstripped, nested) and Verus external_body, assume_specification,\nassume and admit in files containing verus!. kani::assume is a harness\nprecondition and is not counted. A new escape fails; a vanished one is\nreported and passes. The new \"Proof trust ledger\" job runs it plus a\n6-case self-test on the light pool. It is not a CI Gate need.\n\nThe Rocq Proofs job gains a kernel step. tools/ci/rocq-coqchk.py reads\nthe coqc actions from bazel aquery, runs coqchk -o over every .vo under\nthe project load paths with the same -Q pairs, and trust-ledger.py\nkernel fails on an axiom without a kernel row or on any \"relying on\"\nflag. The job stays continue-on-error.\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9\n\n* ci: coqchk summary check fails on any block other than Axioms that is not <none>\n\nThe first CI run showed coqchk 9.0 prints \"Inductives whose positivity is\nassumed\" and two Theory lines; the parser only checked \"relying on\"\nblocks, so an assumed-positive inductive or an impredicative Set would\nhave passed. Every non-axiom block must now read <none>, and Theory lines\nmust be \"Set is predicative\" or \"Rewrite rules are not allowed\". Two\nself-test cases cover it.\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9\n\n* ci: NEGATIVE CONTROL, revert before merge: one Verus external_body and one Rocq Axiom\n\nTrace: skip\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9\n\n* ci: revert the negative control commit 03a65abc\n\nTrace: skip\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9\n\n* ci: keep the ledger self-test's expected ::error:: lines out of the job log\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9\n\n---------\n\nCo-authored-by: Claude Opus 5.5 <noreply@anthropic.com>",
          "timestamp": "2026-11-11T17:14:15Z",
          "tree_id": "41e92baf66a84da8554ef9392423d5138b36c74a",
          "url": "https://github.com/pulseengine/rivet/commit/08db01fd43956d53edc45817a7fc8c2a4cbe3884"
        },
        "date": 1794419899977,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84499,
            "range": "± 2505",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 865694,
            "range": "± 25936",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 17949496,
            "range": "± 1111173",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1915,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24183,
            "range": "± 383",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 394415,
            "range": "± 2618",
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
            "value": 1998776,
            "range": "± 11445",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 157921,
            "range": "± 8262",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1817736,
            "range": "± 18165",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 28958889,
            "range": "± 1778459",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 724854,
            "range": "± 3882",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 17362847,
            "range": "± 195882",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1217284360,
            "range": "± 22107709",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4717,
            "range": "± 104",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 52459,
            "range": "± 238",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 793407,
            "range": "± 6704",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 59640,
            "range": "± 438",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 698575,
            "range": "± 7693",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 9305866,
            "range": "± 1013303",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1195,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14962,
            "range": "± 162",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 270315,
            "range": "± 2393",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22205,
            "range": "± 498",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 145357,
            "range": "± 1820",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1323977,
            "range": "± 32729",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": false,
          "id": "da0c965f8d5ce4b604779ba723c24c92e4181395",
          "message": "ci: cargo audit clones a fresh advisory-db per job (#1223)\n\nMain's Security Audit failed twice on 08db01fd (jobs 130686136577 and\n130718368633), both on runner pulseengine-ci-01-5, before reading the\nlockfile:\n\n  couldn't fetch advisory database: git operation failed: failed to\n  prepare clone -> Refusing to initialize the non-empty directory as\n  '/var/lib/runners/runner5/.cargo/advisory-db'\n\n~/.cargo/advisory-db is shared by every job on a self-hosted runner, so\none damaged copy fails every audit routed to that runner. The step now\npasses --db \"$RUNNER_TEMP/advisory-db\", which the runner empties per\njob. Reproduced locally with cargo-audit 0.22.1: a non-empty non-git\n--db directory exits 1, a fresh path exits 0. The advisory set is\nunchanged (today's new advisories are hickory-proto, not in Cargo.lock).\n\n\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9\n\nCo-authored-by: Claude Opus 5.5 <noreply@anthropic.com>",
          "timestamp": "2026-11-11T21:11:21Z",
          "tree_id": "765f9828a11dca59165e52cf7d51531de3dbb5c7",
          "url": "https://github.com/pulseengine/rivet/commit/da0c965f8d5ce4b604779ba723c24c92e4181395"
        },
        "date": 1794438938582,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85135,
            "range": "± 562",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 854558,
            "range": "± 7994",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 15888807,
            "range": "± 716129",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2161,
            "range": "± 12",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25359,
            "range": "± 189",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 414242,
            "range": "± 3992",
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
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1941155,
            "range": "± 17231",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 163108,
            "range": "± 1382",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1821410,
            "range": "± 19146",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 32316351,
            "range": "± 1357044",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 751698,
            "range": "± 7902",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 18134960,
            "range": "± 250564",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1359194621,
            "range": "± 13702094",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4850,
            "range": "± 45",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 68283,
            "range": "± 691",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 891381,
            "range": "± 23274",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 57197,
            "range": "± 1208",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 674713,
            "range": "± 7886",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8431869,
            "range": "± 576402",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1189,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15856,
            "range": "± 378",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 364587,
            "range": "± 4251",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 24281,
            "range": "± 891",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 161453,
            "range": "± 1385",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1524067,
            "range": "± 19250",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": false,
          "id": "8ca4ecaf15f7ab4b16d8ba0808e8a78b84976501",
          "message": "build(deps): spar 0.48.1 and salsa 0.28.5 together; RUSTSEC-2026-0308 fixed (#1226)\n\nrivet-core shares salsa types with spar-hir and spar-analysis, so salsa\ncould only move when spar did (REQ-376). spar 0.48.1 uses salsa 0.28.5;\nrivet moves both pins together and the tree keeps one salsa.\n\nsalsa 0.28.0 made tracked functions and input getters return references\nby default (salsa#1216). The 17 tracked functions in db.rs take\nreturns(clone), which keeps their owned results and behaviour. Four\ncall sites adapt to by-reference input getters (copy the SourceFile id,\nclone an Artifact, clone the file Vec, compare a path by reference), and\nseven needless borrows go.\n\nRUSTSEC-2026-0308 is fixed in 0.28.5, so its deny.toml ignore and\nassessment are removed. dependency_floors.rs gains a test that fails if\nCargo.lock resolves salsa below 0.28.5 or two salsas, plus a test of\nthat check against old, split and missing salsa. REQ-376 moves from\nproposed to implemented.\n\ncargo-vet: the salsa, salsa-macros, salsa-macro-rules, hashlink and\nintrusive-collections exemptions move to the new versions and typeid\nis added, all marked NOT REVIEWED with the delta size, as their\npredecessors were exemptions too; memoffset left the tree. fuzz's lock\nmoves salsa likewise and keeps syn 3.0.9 as in the workspace lock.\n\nConfirmed with: cargo nextest --all --profile ci 2741 passed;\nrivet-core lib 1416 passed; clippy --all-targets -D warnings clean with\ndefault and all features; cargo deny check and cargo vet --locked pass;\nthe traceability ratchet adds 0 findings; spar-wasm at 0.48.1 pulls no\nhighs or good_lp for wasm32-wasip2.\n\nImplements: REQ-029\nFixes: REQ-376\nVerifies: REQ-376\n\n\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9\n\nCo-authored-by: Claude Opus 5.5 <noreply@anthropic.com>",
          "timestamp": "2026-11-12T06:18:44Z",
          "tree_id": "b30c7e57883d99aeb270b9a6093bc0ae65e7c885",
          "url": "https://github.com/pulseengine/rivet/commit/8ca4ecaf15f7ab4b16d8ba0808e8a78b84976501"
        },
        "date": 1794468258534,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 67423,
            "range": "± 5488",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 692673,
            "range": "± 16572",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 15327309,
            "range": "± 545922",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1451,
            "range": "± 23",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 17918,
            "range": "± 39",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 276586,
            "range": "± 2726",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 76,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/1000",
            "value": 76,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 76,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1558116,
            "range": "± 34175",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 120162,
            "range": "± 794",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1368233,
            "range": "± 15146",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 27810826,
            "range": "± 1840833",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 549937,
            "range": "± 5576",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 14937653,
            "range": "± 1351923",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 998431263,
            "range": "± 15094505",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3599,
            "range": "± 16",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 39647,
            "range": "± 529",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 606200,
            "range": "± 1879",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 45455,
            "range": "± 545",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 523692,
            "range": "± 8930",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 6430821,
            "range": "± 189825",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 807,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 11558,
            "range": "± 282",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 200051,
            "range": "± 2832",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 17330,
            "range": "± 364",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 111884,
            "range": "± 1515",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1029298,
            "range": "± 64963",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": false,
          "id": "b3ea35d9473d523f5cca529670c7efaaf66b602c",
          "message": "build: record RUSTSEC-2026-0486 (rustix, unsound) in deny.toml (#1225)\n\nrustix 1.1.4 arrives transitively through wasmtime and wasmtime-wasi.\nThe advisory's xattr functions are referenced by none of rustix's nine\ndependents in this tree, and rivet's crates do not depend on rustix.\nThe entry is a comment, not an ignore: cargo-deny reports unsound\nadvisories only for direct dependencies, so an ignore would match\nnothing, and cargo audit already prints it as a warning.\n\nIt follows the owner's rule for unsound-only advisories: warn, record\nwith a reason and re-check date, and bump only to a fixed version that\ncargo-vet already covers. 1.1.4 is a vet exemption and no imported audit\ncovers 1.1.6. Re-check on the next wasmtime bump or by 2027-02-01.\n\n\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9\n\nCo-authored-by: Claude Opus 5.5 <noreply@anthropic.com>",
          "timestamp": "2026-11-12T07:50:17Z",
          "tree_id": "6e70022b0418aca113229b27b925ba59ea9c34a8",
          "url": "https://github.com/pulseengine/rivet/commit/b3ea35d9473d523f5cca529670c7efaaf66b602c"
        },
        "date": 1794474279853,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 83787,
            "range": "± 948",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 829972,
            "range": "± 9351",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14035329,
            "range": "± 1324498",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2149,
            "range": "± 20",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25747,
            "range": "± 240",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 406336,
            "range": "± 1852",
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
            "value": 1951084,
            "range": "± 56481",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 159965,
            "range": "± 1431",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1750105,
            "range": "± 89852",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 28798812,
            "range": "± 1392467",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 747396,
            "range": "± 7216",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 19192273,
            "range": "± 485527",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1441358011,
            "range": "± 14964027",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4805,
            "range": "± 35",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 68993,
            "range": "± 670",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 887963,
            "range": "± 10561",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 57081,
            "range": "± 1103",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 686973,
            "range": "± 21148",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 9727201,
            "range": "± 606457",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1096,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15815,
            "range": "± 108",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 371565,
            "range": "± 2470",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23904,
            "range": "± 333",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 153335,
            "range": "± 617",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1432683,
            "range": "± 32518",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": false,
          "id": "470298417252b397738ad093c413e45ab76eed78",
          "message": "chore(release): scope v0.42.0 to what shipped — verify 9, defer 21 to v0.43.0 (#1228)\n\nrivet release status v0.42.0 on b3ea35d9 reported 29 of 31 artifacts not\nrelease-ready. The maintainer chose to verify the implemented items whose\nacceptance holds and defer the rest.\n\nVerified (rivet verify, each with source verifies markers; acceptance text\nread against what merged): REQ-308, REQ-408, REQ-409, REQ-410, REQ-411,\nREQ-412, REQ-413, REQ-414, and REQ-376, moved from backlog to v0.42.0\nbecause the salsa 0.28.5 bump (#1226) ships in this tag. REQ-376 gains a\nRESOLVED note; its text still described the upgrade as blocked.\n\nMoved to v0.43.0 with rivet release move: the 20 draft/proposed items and\nREQ-397. REQ-397's own acceptance holds it at implemented until the Open\nVSX listing check passes on a real release, and\nopen-vsx.org/api/pulseengine/rivet-sdlc/0.41.1 answers 404.\n\nConfirmed with rivet release status v0.42.0 (Cuttable), rivet validate\n(PASS) and tools/ci/traceability-ratchet.py against origin/main (0 new).\n\nRefs: REQ-308, REQ-376, REQ-397\n\n\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9\n\nCo-authored-by: Claude Opus 5.5 <noreply@anthropic.com>",
          "timestamp": "2026-11-12T08:26:00Z",
          "tree_id": "04e79291dbedc046931086b5f342e59e76f3bcf0",
          "url": "https://github.com/pulseengine/rivet/commit/470298417252b397738ad093c413e45ab76eed78"
        },
        "date": 1794474688524,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84879,
            "range": "± 1091",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 836911,
            "range": "± 20360",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13173227,
            "range": "± 864896",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2148,
            "range": "± 44",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25512,
            "range": "± 238",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 412117,
            "range": "± 10504",
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
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1962740,
            "range": "± 12119",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 162059,
            "range": "± 632",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1787314,
            "range": "± 21980",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 25795034,
            "range": "± 1642789",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 755602,
            "range": "± 6799",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 18908088,
            "range": "± 246667",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1450560166,
            "range": "± 15593793",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4747,
            "range": "± 56",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 69194,
            "range": "± 1016",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 885284,
            "range": "± 6977",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 57411,
            "range": "± 272",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 688968,
            "range": "± 20464",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 9399537,
            "range": "± 835693",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1138,
            "range": "± 12",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15420,
            "range": "± 208",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 372465,
            "range": "± 2295",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23985,
            "range": "± 194",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 150108,
            "range": "± 2020",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1432392,
            "range": "± 29172",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": false,
          "id": "0a81941da5823637f22dd15c2c5319dcd0c56020",
          "message": "chore(release): v0.42.0 — clause discharge, recorded results, yaml to-json (#1229)\n\nVersion 0.41.1 -> 0.42.0 in Cargo.toml, both lockfiles and the VS Code\nextension manifest. CHANGELOG [Unreleased] becomes [0.42.0] - 2026-11-12,\nwith a summary and a falsification statement.\n\ntools/release/changelog-drift.py v0.42.0 first reported four mismatches:\n- DD-083 and DD-084 were delivered but not named; they are now cited on\n  the entries they decide.\n- REQ-294 sat in claim position although it shipped in v0.34.0; the\n  #1224 entry now says it extends REQ-294.\n- REQ-415 (repository boundary manifest, #1160) shipped on main with no\n  release. It moves to v0.42.0 and is verified: 14 source markers,\n  `rivet manifest export` and `rivet docs manifest` present.\n\nConfirmed with changelog-drift.py (exit 0, delivered 12, undocumented\nnone, unclaimed none), rivet release status v0.42.0 (Cuttable), rivet\nvalidate (PASS), rivet docs check (0 violations) and\ntraceability-ratchet.py against origin/main (0 new).\n\nRefs: REQ-415\n\n\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9\n\nCo-authored-by: Claude Opus 5.5 <noreply@anthropic.com>",
          "timestamp": "2026-11-12T10:28:29Z",
          "tree_id": "dc2de8e89fc10dada4b9679ece93fc71ca0f95ae",
          "url": "https://github.com/pulseengine/rivet/commit/0a81941da5823637f22dd15c2c5319dcd0c56020"
        },
        "date": 1794488851243,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 67065,
            "range": "± 319",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 682979,
            "range": "± 4238",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13360629,
            "range": "± 794223",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1458,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 18055,
            "range": "± 170",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 276017,
            "range": "± 2470",
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
            "value": 1553165,
            "range": "± 9927",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 119393,
            "range": "± 534",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1369831,
            "range": "± 32801",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 21854318,
            "range": "± 1221699",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 548805,
            "range": "± 4320",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 13741683,
            "range": "± 162457",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 979994736,
            "range": "± 10965373",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3576,
            "range": "± 12",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 39882,
            "range": "± 571",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 614418,
            "range": "± 12095",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 43869,
            "range": "± 350",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 510099,
            "range": "± 2395",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 6431451,
            "range": "± 281069",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 823,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 11306,
            "range": "± 56",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 198578,
            "range": "± 4837",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 17327,
            "range": "± 217",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 112064,
            "range": "± 1096",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1028987,
            "range": "± 22266",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": false,
          "id": "f7d3e2bf9beac546eb4246dfdca6ec604c2b1c29",
          "message": "ci: build the Rocq libraries with outputs downloaded before coqchk (#1230)\n\nThe kernel-axioms step from #1222 has failed on main since 47029841 with\n\"no compiled .vo found under the project load paths\". It passed on every\nrun through b3ea35d9. The passing runs restored no Bazel disk cache and\nbuilt from scratch; the failing ones hit the disk cache. With a cache\nhit, Bazel 7+ does not download intermediate outputs, and `bazel test\n//proofs/rocq:rivet_metamodel_test` leaves no .vo on disk, so the\nstep's fail-closed check on an empty set fired.\n\nThe step now queries the rocq_library targets and builds them with\n--remote_download_outputs=all before the aquery and the coqchk run. The\nproofs themselves were green throughout (\"Verify Rocq proofs\" passed).\n\n\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9\n\nCo-authored-by: Claude Opus 5.5 <noreply@anthropic.com>",
          "timestamp": "2026-11-12T14:52:43Z",
          "tree_id": "fe9faef6a69a1ae248dbd0bf5042a2fd82bf219e",
          "url": "https://github.com/pulseengine/rivet/commit/f7d3e2bf9beac546eb4246dfdca6ec604c2b1c29"
        },
        "date": 1794504092143,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84737,
            "range": "± 825",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 859633,
            "range": "± 29203",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14176542,
            "range": "± 571274",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1925,
            "range": "± 9",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24077,
            "range": "± 54",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 377478,
            "range": "± 2847",
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
            "value": 2019817,
            "range": "± 18579",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 162615,
            "range": "± 729",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1830430,
            "range": "± 22271",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 27909724,
            "range": "± 1061609",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 725394,
            "range": "± 11056",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 19082465,
            "range": "± 381630",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1408618701,
            "range": "± 22762645",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4689,
            "range": "± 23",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 51524,
            "range": "± 272",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 798762,
            "range": "± 6792",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 60224,
            "range": "± 759",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 724261,
            "range": "± 10865",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8588630,
            "range": "± 259728",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1186,
            "range": "± 19",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14234,
            "range": "± 276",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 262692,
            "range": "± 3429",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21976,
            "range": "± 181",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 142889,
            "range": "± 3696",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1333508,
            "range": "± 15945",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": false,
          "id": "81262936ba82bdd4f6de035259beb7e7f6b78792",
          "message": "fix(vscode): package the VSIX again; release v0.42.1 in place of v0.42.0 (#1233)\n\n* fix(vscode): package the VSIX again; release v0.42.1 in place of v0.42.0\n\nThe v0.42.0 release run (43263376215) failed at \"Package VSIX\": vsce\nrefuses @types/vscode ~1.145.0 against engines.vscode ^1.91.0, a pair\nDependabot's #1213 created. Create GitHub Release never ran, so nothing\nwas published under v0.42.0. The macOS builds in that run got no hosted\nrunner and were cancelled; that is runner supply, not this change.\n\n- @types/vscode back to ~1.91.0, matching engines.vscode.\n- Dependabot ignores minor and major @types/vscode updates for\n  /vscode-rivet; raising it needs engines.vscode raised with it.\n- CI's VS Code Extension job runs the release's `vsce package`, so the\n  pair fails a pull request instead of a release.\n- Version 0.42.1. The 12 artifacts scoped to v0.42.0 move to v0.42.1\n  (rivet release move), because the release note is generated from the\n  tagged version's scope and they first ship here. The CHANGELOG\n  section becomes [0.42.1] and says v0.42.0 published nothing.\n\nConfirmed with: vsce package on the unfixed tree fails with the release's\nerror and on this tree packages (14 files); npm run compile passes;\nchangelog-drift.py v0.42.1 exit 0 (12 delivered); rivet release status\nv0.42.1 Cuttable; rivet validate PASS; rivet docs check 0 violations;\ntraceability-ratchet.py against origin/main 0 new.\n\nTrace: skip\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9\n\n* fix(clippy): satisfy rust 1.100 needless_bool and needless_range_loop\n\nCI stable moved to rustc 1.100.0 (2026-11-09), and Clippy with\n-D warnings now fails on four existing sites, on any branch:\n- doc_check.rs: an `if` returning `true` before a final `false`\n  becomes the comparison itself.\n- yaml_edit.rs field_indent and find_field_in_block, and the\n  test_find_artifact_block_middle test: index loops become iterators.\n\nBehaviour is unchanged. Confirmed with cargo +1.100.0 clippy\n--all-targets -D warnings (exit 0), cargo fmt --check, and the\nrivet-core lib tests for yaml_edit and doc_check (96 passed).\n\nRefs: REQ-034\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9\n\n---------\n\nCo-authored-by: Claude Opus 5.5 <noreply@anthropic.com>",
          "timestamp": "2026-11-12T20:13:43Z",
          "tree_id": "1b7c5f487b5a59302a102a83c2865b35f63be94c",
          "url": "https://github.com/pulseengine/rivet/commit/81262936ba82bdd4f6de035259beb7e7f6b78792"
        },
        "date": 1794519115336,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 86291,
            "range": "± 527",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 866549,
            "range": "± 6388",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 16313247,
            "range": "± 1068934",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1918,
            "range": "± 84",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24407,
            "range": "± 544",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 396355,
            "range": "± 28522",
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
            "value": 96,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1998284,
            "range": "± 6578",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 161043,
            "range": "± 978",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1820684,
            "range": "± 27997",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 31587240,
            "range": "± 2984839",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 730520,
            "range": "± 42864",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 18865766,
            "range": "± 343217",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1274919687,
            "range": "± 19552812",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4600,
            "range": "± 181",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 50744,
            "range": "± 2601",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 854284,
            "range": "± 64050",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 60723,
            "range": "± 539",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 739602,
            "range": "± 42556",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8706027,
            "range": "± 438243",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1156,
            "range": "± 23",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15025,
            "range": "± 420",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 265474,
            "range": "± 14318",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22981,
            "range": "± 235",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 149897,
            "range": "± 513",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1405193,
            "range": "± 22533",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": false,
          "id": "a712e840b213825922066021e526968bec9a3e72",
          "message": "ci(release): macos-15-intel for x86_64-apple-darwin; release v0.42.2 (#1240)\n\n* ci(release): build x86_64-apple-darwin on macos-15-intel\n\nThe v0.42.1 release run (43332306438) was cancelled because GitHub no\nlonger accepts the macos-14 label: the job was refused 2 s after creation\nwith \"The configuration 'macos-14-arm64-us-default' is not supported\".\nCreate GitHub Release needs every build, so it was skipped and v0.42.1\npublished nothing. The other 8 builds, the VSIX, the release note and the\ncompliance report all succeeded in that run.\n\nmacos-15-intel is GitHub's x86_64 macOS image, so the build stays native\nand no step changes. release.yml runs only on a tag, so this label is\nfirst exercised by the next tag push.\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9\n\n* chore(release): v0.42.2 in place of the unpublished v0.42.1\n\nThe v0.42.1 tag runs the release.yml stored in that tag, which still\nnames macos-14, so the runner fix only takes effect on a new tag.\n\n- Version 0.42.2 in Cargo.toml, both lockfiles and the vscode package.\n- The 12 artifacts scoped to v0.42.1 move to v0.42.2 (rivet release\n  move), since the release note is generated from the tagged scope.\n- CHANGELOG [0.42.2]: says v0.42.0 and v0.42.1 published nothing, adds\n  \"Fixed in 0.42.2\", and keeps the 0.42.1 fix marked not published.\n\nConfirmed with changelog-drift.py v0.42.2 exit 0 (12 delivered, none\nundocumented or unclaimed); rivet release status v0.42.2 Cuttable; rivet\nvalidate PASS; rivet docs check 0 violations (binary rebuilt at 0.42.2);\ntraceability-ratchet.py against origin/main 0 new.\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9\n\n---------\n\nCo-authored-by: Claude Opus 5.5 <noreply@anthropic.com>",
          "timestamp": "2026-11-13T05:50:24Z",
          "tree_id": "6c9d238a16e7d75f79a7af148abbd3cdf8fb1b08",
          "url": "https://github.com/pulseengine/rivet/commit/a712e840b213825922066021e526968bec9a3e72"
        },
        "date": 1794554780645,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85411,
            "range": "± 2281",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 848583,
            "range": "± 8781",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12906355,
            "range": "± 873773",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2216,
            "range": "± 47",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26979,
            "range": "± 496",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 426275,
            "range": "± 1716",
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
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1922471,
            "range": "± 106780",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 160222,
            "range": "± 3833",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1814630,
            "range": "± 44190",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 25733610,
            "range": "± 1177810",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 733287,
            "range": "± 4628",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 18071405,
            "range": "± 281120",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1417524135,
            "range": "± 13061905",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4859,
            "range": "± 282",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 68108,
            "range": "± 719",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 895551,
            "range": "± 8895",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 60190,
            "range": "± 675",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 691853,
            "range": "± 3144",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8310201,
            "range": "± 439107",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1205,
            "range": "± 16",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15208,
            "range": "± 110",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 376048,
            "range": "± 4953",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 25309,
            "range": "± 991",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 172709,
            "range": "± 2433",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1616184,
            "range": "± 26938",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "49699333+dependabot[bot]@users.noreply.github.com",
            "name": "dependabot[bot]",
            "username": "dependabot[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": false,
          "id": "a175c3ceb60dfbd581a817c399437f4d4822851c",
          "message": "build(deps): bump the github-actions-all group with 3 updates (#1238)\n\nBumps the github-actions-all group with 3 updates: [taiki-e/install-action](https://github.com/taiki-e/install-action), [bazel-contrib/setup-bazel](https://github.com/bazel-contrib/setup-bazel) and [pulseengine/temper/.github/actions/gate-probe](https://github.com/pulseengine/temper).\n\n\nUpdates `taiki-e/install-action` from 2.90.1 to 2.90.3\n- [Release notes](https://github.com/taiki-e/install-action/releases)\n- [Changelog](https://github.com/taiki-e/install-action/blob/main/CHANGELOG.md)\n- [Commits](https://github.com/taiki-e/install-action/compare/c509219cf42fba86913069efd0ade2458c59337b...cfdb7ed4ccc7c7dce37759eae89dc5674b469b39)\n\nUpdates `bazel-contrib/setup-bazel` from 0.19.1 to 0.19.2\n- [Release notes](https://github.com/bazel-contrib/setup-bazel/releases)\n- [Commits](https://github.com/bazel-contrib/setup-bazel/compare/0.19.1...0.19.2)\n\nUpdates `pulseengine/temper/.github/actions/gate-probe` from 308848d151a0fdd0fc5eb8af0531addbf6f36ef4 to 03a53ca7dc3ac604252abcb70b267cd9f8ef623e\n- [Changelog](https://github.com/pulseengine/temper/blob/main/CHANGELOG.md)\n- [Commits](https://github.com/pulseengine/temper/compare/308848d151a0fdd0fc5eb8af0531addbf6f36ef4...03a53ca7dc3ac604252abcb70b267cd9f8ef623e)\n\n---\nupdated-dependencies:\n- dependency-name: taiki-e/install-action\n  dependency-version: 2.90.3\n  dependency-type: direct:production\n  update-type: version-update:semver-patch\n  dependency-group: github-actions-all\n- dependency-name: bazel-contrib/setup-bazel\n  dependency-version: 0.19.2\n  dependency-type: direct:production\n  update-type: version-update:semver-patch\n  dependency-group: github-actions-all\n- dependency-name: pulseengine/temper/.github/actions/gate-probe\n  dependency-version: 03a53ca7dc3ac604252abcb70b267cd9f8ef623e\n  dependency-type: direct:production\n  dependency-group: github-actions-all\n...\n\nSigned-off-by: dependabot[bot] <support@github.com>\nCo-authored-by: dependabot[bot] <49699333+dependabot[bot]@users.noreply.github.com>",
          "timestamp": "2026-11-13T18:36:20Z",
          "tree_id": "ebcb2b47a9342ad240415134837e0a2d3a163343",
          "url": "https://github.com/pulseengine/rivet/commit/a175c3ceb60dfbd581a817c399437f4d4822851c"
        },
        "date": 1794612118745,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 49277,
            "range": "± 444",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 609764,
            "range": "± 5609",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 10487082,
            "range": "± 309458",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1072,
            "range": "± 31",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 12915,
            "range": "± 112",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 246492,
            "range": "± 3758",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 49,
            "range": "± 0",
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
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1281652,
            "range": "± 15381",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 115516,
            "range": "± 2314",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1294807,
            "range": "± 12684",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 18146876,
            "range": "± 1981476",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 445385,
            "range": "± 16552",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 10379764,
            "range": "± 730268",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 633207320,
            "range": "± 26031372",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3199,
            "range": "± 17",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 33564,
            "range": "± 397",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 524093,
            "range": "± 5355",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 34957,
            "range": "± 3459",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 376712,
            "range": "± 1618",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 5407304,
            "range": "± 595941",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 542,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7354,
            "range": "± 62",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 139474,
            "range": "± 1879",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 14170,
            "range": "± 1284",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 89901,
            "range": "± 1814",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 861289,
            "range": "± 60937",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": false,
          "id": "ff7efd4ec5a6fd3874263589b2e7aeae36d81f39",
          "message": "fix(yaml): report text after a closing quote and keys at an unused column (#1261)\n\n* fix(yaml): report text after a closing quote and keys at an unused column\n\nTwo silent mis-parses in rivet-yaml's block parser (cst.rs):\n\n- #1246: after a quoted value, the rest of the line went into the value\n  node and only the quoted part was read, so `k: 'abc' def` gave \"abc\"\n  and `k: 'it's'` gave \"it\". check_after_quoted now reports any text\n  after the closing quote at the start of a mapping value, a sequence\n  item, or a next-line/root scalar; spaces and a comment are still fine.\n- #1247: a block mapping took any key at or past its minimum column, so\n  a line dedented between two levels ended the inner mapping and joined\n  the outer one. A key must now sit at its mapping's own column (every\n  caller already passes the first key's column). Recovery skips the\n  rest of the misplaced block, so it is one error per block, and records\n  the skipped range so the #1209 under-indented-quote hint stays first\n  and is kept for each quote. The first case of #1249 (a more-indented\n  `key: value` after a scalar line) now reports the same error.\n\nConfirmed with: new cst tests (text_after_a_closing_quote_is_an_error,\na_key_at_a_column_no_mapping_uses_is_an_error, and two positive-control\ntests) fail with the fix disabled and pass with it; rivet-yaml tests\nincl. the pinned yaml-test-suite (178) and rivet-core tests (1418 lib +\nintegration) pass; cargo fmt --check; cargo +1.100.0 clippy --all-targets\n-D warnings. The 64 differential reproducers change only for the\ntargeted cases (I5a-c, I7a-c, I8). rivet validate over 31 local\npulseengine checkouts: identical set of files that fail to load in\nevery repo; synth's already-broken files drop from 41 to 24 errors.\n\nFixes: REQ-346\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9\n\n* fix(yaml): let a mapping's first key follow an anchor; raise suite ratchets\n\nCI's yaml-test-suite run (skipped locally without YAML_TEST_SUITE) caught\na regression in the previous commit: ZH7C, `&a a: b` / `c: &d d`, was\nrefused. The root records its column before the anchor, so the first\nkey's token column (3) exceeded the mapping's (0). Only a first key can\nshare its line with an anchor or a `- `, and the caller sets the column\nfrom it, so the column check now applies from the second key on.\n\nThe change rejects 10 more invalid suite cases than recorded, so the\nratchets move with it: INVALID_REJECTED 53 -> 63, INVALID_ACCEPTED\n41 -> 31. MATCHED stays 134, wrong 0.\n\nConfirmed with: YAML_TEST_SUITE at 6e6c296a, cargo nextest run --all\n--profile ci: 2750 passed, 3 skipped, exit 0. ZH7C added to the\npositive-control test. rivet validate over 30 local pulseengine\ncheckouts: the set of files that fail to load is identical to v0.42.2\nin every repo.\n\nFixes: REQ-346\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9\n\n---------\n\nCo-authored-by: Claude Opus 5.5 <noreply@anthropic.com>",
          "timestamp": "2026-11-14T05:19:12Z",
          "tree_id": "eff962abff239d610c6d144794166541879b6fac",
          "url": "https://github.com/pulseengine/rivet/commit/ff7efd4ec5a6fd3874263589b2e7aeae36d81f39"
        },
        "date": 1794651854437,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 68104,
            "range": "± 435",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 671001,
            "range": "± 10381",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13394522,
            "range": "± 847829",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1450,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 18018,
            "range": "± 456",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 274986,
            "range": "± 778",
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
            "value": 1579091,
            "range": "± 28843",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 121590,
            "range": "± 1758",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1388736,
            "range": "± 20771",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 25719371,
            "range": "± 2160145",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 546743,
            "range": "± 4287",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 12500778,
            "range": "± 141812",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 842157848,
            "range": "± 5866659",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3635,
            "range": "± 11",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 40789,
            "range": "± 89",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 618146,
            "range": "± 10766",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 44160,
            "range": "± 603",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 521457,
            "range": "± 2365",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 6784459,
            "range": "± 453680",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 810,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 11014,
            "range": "± 43",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 200459,
            "range": "± 1020",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 18837,
            "range": "± 75",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 125700,
            "range": "± 3405",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1159725,
            "range": "± 29249",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": false,
          "id": "5d4ad9ec4fd9e85e27cf477e29925f43d55fb03c",
          "message": "varve.toml: covalent layer 2026.11.1 -> 2026.11.10 (#1244)\n\n2026.11.10 composes pulseengine 2026.11.18, which carries loom 1.5.2 (the\nfixes for loom #492, #494 and #496) and meld 0.68.0.\n\n\nClaude-Session: https://claude.ai/code/session_01KEjmjczUmt6Rdd9DRKe75Z\n\nCo-authored-by: Claude Opus 5.5 <noreply@anthropic.com>",
          "timestamp": "2026-11-15T07:16:12Z",
          "tree_id": "b2f8b455ab941000d047aeb7ed98f08be2c5c716",
          "url": "https://github.com/pulseengine/rivet/commit/5d4ad9ec4fd9e85e27cf477e29925f43d55fb03c"
        },
        "date": 1794730661509,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 66747,
            "range": "± 547",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 679680,
            "range": "± 5347",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13525427,
            "range": "± 819408",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1486,
            "range": "± 13",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 17887,
            "range": "± 373",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 274346,
            "range": "± 4320",
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
            "value": 1547614,
            "range": "± 21903",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 120483,
            "range": "± 2079",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1380374,
            "range": "± 17488",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 24084167,
            "range": "± 1875785",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 548891,
            "range": "± 4881",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 13132631,
            "range": "± 234589",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 914874095,
            "range": "± 6025808",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3618,
            "range": "± 23",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 40778,
            "range": "± 224",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 609593,
            "range": "± 6649",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 45865,
            "range": "± 79",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 520454,
            "range": "± 19314",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7007835,
            "range": "± 390372",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 862,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 11062,
            "range": "± 100",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 201686,
            "range": "± 4134",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 17867,
            "range": "± 214",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 115854,
            "range": "± 4205",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1080573,
            "range": "± 18436",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "49699333+dependabot[bot]@users.noreply.github.com",
            "name": "dependabot[bot]",
            "username": "dependabot[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": false,
          "id": "555d12f00bde6bed62a4dbf27ad173eee93e121b",
          "message": "build(deps): bump thiserror from 2.0.18 to 2.0.21 in /fuzz (#1273)\n\nBumps [thiserror](https://github.com/dtolnay/thiserror) from 2.0.18 to 2.0.21.\n- [Release notes](https://github.com/dtolnay/thiserror/releases)\n- [Commits](https://github.com/dtolnay/thiserror/compare/2.0.18...2.0.21)\n\n---\nupdated-dependencies:\n- dependency-name: thiserror\n  dependency-version: 2.0.21\n  dependency-type: direct:production\n  update-type: version-update:semver-patch\n...\n\nSigned-off-by: dependabot[bot] <support@github.com>\nCo-authored-by: dependabot[bot] <49699333+dependabot[bot]@users.noreply.github.com>",
          "timestamp": "2026-11-16T05:22:07Z",
          "tree_id": "6b9988c70de451232189980ffbde6875b2fe4850",
          "url": "https://github.com/pulseengine/rivet/commit/555d12f00bde6bed62a4dbf27ad173eee93e121b"
        },
        "date": 1794809488364,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 67403,
            "range": "± 383",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 677270,
            "range": "± 2838",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 15526720,
            "range": "± 1576846",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1487,
            "range": "± 15",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 17797,
            "range": "± 697",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 283108,
            "range": "± 3164",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 74,
            "range": "± 2",
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
            "value": 1566606,
            "range": "± 26455",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 120853,
            "range": "± 2243",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1367035,
            "range": "± 16335",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 25426424,
            "range": "± 953855",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 550193,
            "range": "± 8861",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 13259172,
            "range": "± 586824",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 932536959,
            "range": "± 13093055",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3592,
            "range": "± 11",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 40450,
            "range": "± 638",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 634034,
            "range": "± 9285",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 44406,
            "range": "± 1682",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 509670,
            "range": "± 5354",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 9900064,
            "range": "± 251608",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 829,
            "range": "± 15",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 11256,
            "range": "± 149",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 199963,
            "range": "± 1221",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 17876,
            "range": "± 579",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 117186,
            "range": "± 4137",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1080326,
            "range": "± 28125",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "02ccdfd87e0aba7698a9fb62eb6d75d1cc53225f",
          "message": "build(deny): record RUSTSEC-2026-0543 (chrono unmaintained) (#1276)\n\nThe advisory, published after the last main push run, marks every chrono\nversion unmaintained. cargo-deny errors on it, so the Cargo Deny job and\nCI Gate fail on main (smithy's heavy run, #1275) and on every PR.\n\nrivet does not depend on chrono. cargo tree -i chrono: gluesql-core (the\nsql engine, whose unmaintained chain deny.toml already accepts), rmcp\n(the MCP SDK) and schemars via rmcp. It is not a vulnerability, and the\nway out is upstream (jiff/time), so it is recorded with that reasoning,\nlike the instant and gluesql entries, to revisit with the rmcp 3.x\nmigration.\n\nConfirmed with cargo-deny 0.20.2: `cargo deny check advisories` exits 1\nwith \"chrono is unmaintained\" before this change and 0 after; `cargo\ndeny check` reports advisories, bans, licenses and sources ok.\n\n\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9\n\nCo-authored-by: Claude Opus 5.5 <noreply@anthropic.com>",
          "timestamp": "2026-11-17T20:21:30Z",
          "tree_id": "bdc0671bf58eae74b8c69a4d4a4c81125faa490e",
          "url": "https://github.com/pulseengine/rivet/commit/02ccdfd87e0aba7698a9fb62eb6d75d1cc53225f"
        },
        "date": 1794969710825,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 58061,
            "range": "± 3256",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 720080,
            "range": "± 26149",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 9245970,
            "range": "± 509705",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1166,
            "range": "± 50",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 13895,
            "range": "± 806",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 292673,
            "range": "± 20158",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 53,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/1000",
            "value": 53,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 54,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1486687,
            "range": "± 76912",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 120349,
            "range": "± 1047",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1468333,
            "range": "± 92229",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 21247925,
            "range": "± 1186842",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 525563,
            "range": "± 26164",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 12285808,
            "range": "± 686999",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 733293755,
            "range": "± 22712546",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3322,
            "range": "± 230",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 33594,
            "range": "± 115",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 829150,
            "range": "± 16568",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 39230,
            "range": "± 390",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 431134,
            "range": "± 15459",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 5664000,
            "range": "± 621207",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 549,
            "range": "± 28",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 8761,
            "range": "± 555",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 254540,
            "range": "± 13760",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 17290,
            "range": "± 198",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 114283,
            "range": "± 7402",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1034588,
            "range": "± 42342",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": false,
          "id": "2f11728fec195892735972183c7090379029381e",
          "message": "fix(yaml): report a tab that indents a block entry (#1277)\n\n* fix(yaml): report a tab that indents a block entry\n\n#1248: rivet accepted tab indentation and counted the tab as one column,\nso `\\ta: 1` and `a:` / `\\tb: 1` built structure an editor may show\ndifferently. YAML 1.2 §6.1 indents with spaces only.\n\nbump_line_indent consumes a line's leading whitespace and reports a tab\nin it when the line starts a block entry (`- ` or `key:`). A tab before\na flow collection or a next-line scalar is separation and stays allowed\n(yaml-test-suite 6CA3, Q5MG, DK95/00 caught a first, broader version).\nThe check runs where indentation is consumed: block mappings, block\nsequences, the root, and the \"value on the next line\" branches.\neat_trivia now treats whitespace at offset 0 as indentation too, as it\nalready did after a newline.\n\nThe suite rejects one more invalid case, so the ratchets move:\nINVALID_REJECTED 63 -> 64, INVALID_ACCEPTED 31 -> 30; MATCHED 134,\nwrong 0.\n\nConfirmed with: new tests a_tab_in_indentation_is_an_error (fails with\nthe check disabled) and tabs_outside_indentation_still_parse;\nYAML_TEST_SUITE at 6e6c296a with cargo nextest run --all --profile ci:\n2752 passed, exit 0; cargo +1.100.0 clippy --all-targets -D warnings\nexit 0; cargo fmt --check. rivet validate over 58 local pulseengine\ncheckouts: no tab-indentation errors, and the same files load as before.\n\nFixes: REQ-346\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9\n\n* test(yaml): kill the tab-indentation PR-diff mutants\n\nPR-diff mutation testing left 4 mutants alive in code #1277 touched:\nthe Whitespace arm of eat_trivia, the Newline|Comment arm of\nparse_block_sequence, and `j += 1` in block_entry_at (as -= and *=).\n\nNew cases: a tab-indented `b : 1` (spaces before the colon) and a\ntab-indented key under a bare `-` must both be errors; a sequence item\nwhose mapping starts on the next line, a key with spaces and a comment\nbefore its nested mapping, and `... # end` after a document must parse\nwith their values intact.\n\nConfirmed with cargo mutants --in-diff -- --lib (the previous run:\n1 missed, 25 caught, 4 timeouts) and a hand-applied negative control on\nthe eat_trivia arm, which fails values_after_trivia_keep_their_nesting.\nnextest --profile ci with YAML_TEST_SUITE set: 2753 passed.\n\nVerifies: REQ-346\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9\n\n---------\n\nCo-authored-by: Claude Opus 5.5 <noreply@anthropic.com>",
          "timestamp": "2026-11-18T02:31:55Z",
          "tree_id": "547afbefbc598adfa39cd2c594ea10fa87ca0cac",
          "url": "https://github.com/pulseengine/rivet/commit/2f11728fec195892735972183c7090379029381e"
        },
        "date": 1794982515533,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 82710,
            "range": "± 1443",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 990114,
            "range": "± 12681",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12006439,
            "range": "± 649900",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1603,
            "range": "± 19",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 19687,
            "range": "± 267",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 438241,
            "range": "± 8401",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 78,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/1000",
            "value": 78,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 78,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 2150746,
            "range": "± 14644",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 179567,
            "range": "± 2955",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 2085551,
            "range": "± 19611",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 27928877,
            "range": "± 1087908",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 758287,
            "range": "± 10054",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 17713812,
            "range": "± 196432",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1106049734,
            "range": "± 17740619",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4066,
            "range": "± 40",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 47998,
            "range": "± 2684",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 991058,
            "range": "± 14338",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 53039,
            "range": "± 373",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 594884,
            "range": "± 8043",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7580609,
            "range": "± 118403",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 966,
            "range": "± 11",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 12103,
            "range": "± 112",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 351087,
            "range": "± 7323",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 25598,
            "range": "± 265",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 181047,
            "range": "± 3864",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1720101,
            "range": "± 46749",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": false,
          "id": "d184d1564cb73132b0e062fda79d69ae0217aa23",
          "message": "ci: pin GitHub-hosted jobs to ubuntu-24.04 (#1283)\n\nGitHub moves the ubuntu-latest label to Ubuntu 26.04 this month, which\nchanges apt packages, Python and preinstalled tools under every hosted\njob without a diff in this repository. 29 runs-on sites across 10\nworkflows now name ubuntu-24.04: plain runs-on, the release.yml build\nmatrix, and the fork fallback in gate-probe.yml and fix-hotspot.yml.\nComments that describe a job as GitHub-hosted are unchanged. Self-hosted\nlabels are untouched.\n\nThe runner-liveness starvation message now says \"GitHub-hosted\" instead\nof naming a label. tools/ci-diagnose classifies hosted jobs by the\nabsence of the self-hosted label, so it needs no change; its test suite\npasses. actionlint reports no new findings.\n\nMoving to 26.04 is a later, deliberate PR, run as advisory first.\n\n\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9\n\nCo-authored-by: Claude Opus 5.5 <noreply@anthropic.com>",
          "timestamp": "2026-11-18T08:37:36Z",
          "tree_id": "4c0d78d8d23fd00cdcd226d323b0279ec4ddfe03",
          "url": "https://github.com/pulseengine/rivet/commit/d184d1564cb73132b0e062fda79d69ae0217aa23"
        },
        "date": 1795010929040,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 60871,
            "range": "± 583",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 743764,
            "range": "± 8266",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 9891118,
            "range": "± 135900",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1194,
            "range": "± 10",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 14474,
            "range": "± 63",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 393957,
            "range": "± 2917",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 55,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/1000",
            "value": 55,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 55,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1998282,
            "range": "± 4250",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 126603,
            "range": "± 380",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1588767,
            "range": "± 24977",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 22137360,
            "range": "± 878509",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 555627,
            "range": "± 1889",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 12165997,
            "range": "± 38568",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 724448569,
            "range": "± 5595381",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 2928,
            "range": "± 19",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 32461,
            "range": "± 143",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 780407,
            "range": "± 6168",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 44595,
            "range": "± 192",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 477700,
            "range": "± 2982",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 6569917,
            "range": "± 77030",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 616,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 8716,
            "range": "± 37",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 279493,
            "range": "± 6595",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21349,
            "range": "± 86",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 126294,
            "range": "± 719",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1120100,
            "range": "± 18102",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": false,
          "id": "eb63a5d6e37d4ae09d069d0ef3a3c68e1b65e466",
          "message": "fix(results): keep the latest result per environment; import-results --environment (#1285)\n\nResultStore::latest_for kept one result per artifact across every run,\nand evidence_for, trace-results and the results view classified from\nit. TEST-1 failing on rpi5 at 10:00 and passing on macos-arm64 at 11:00\nread as Passing, so under release.require: results a requirement that\nnever passed on the Pi counted as ready.\n\n- ResultStore::latest_per_environment returns the newest result per\n  run.environment; a run without one is one more environment, so\n  existing results files read as before. evidence_for takes one hit\n  per (artifact, environment).\n- ResultStore::status_across_environments gives the views that show\n  one status per artifact (trace-results, the results page) the newest\n  failing per-environment result if there is one.\n- rivet import-results --format junit --environment <name> sets\n  run.environment and appends it to the run id, so importing one JUnit\n  file for two environments writes two files. --environment with\n  needs-json or reqif is refused.\n\nDeclaring where a requirement must pass (a verify-on field or variant\nbindings) is #1241's open design choice and is not in this change.\n\nConfirmed with negative controls on both result_trace call sites and on\nthe CLI wiring (each reddens its test on the named assertion), and the\ntraceability ratchet against main (0 new findings).\n\nImplements: REQ-417\nVerifies: REQ-417\nRefs: REQ-413, FEAT-071\n\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9\n\nCo-authored-by: Claude Opus 5.5 <noreply@anthropic.com>",
          "timestamp": "2026-11-18T13:32:23Z",
          "tree_id": "f43a239a1e21d2d16e4e2db5a8e6ecf8cc55c64a",
          "url": "https://github.com/pulseengine/rivet/commit/eb63a5d6e37d4ae09d069d0ef3a3c68e1b65e466"
        },
        "date": 1795033996362,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 61711,
            "range": "± 698",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 722796,
            "range": "± 2263",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 9752251,
            "range": "± 313886",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1201,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 14491,
            "range": "± 117",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 363993,
            "range": "± 1088",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 54,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/1000",
            "value": 54,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 54,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1983984,
            "range": "± 22360",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 124109,
            "range": "± 530",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1488715,
            "range": "± 12061",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 27835456,
            "range": "± 650981",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 554436,
            "range": "± 1456",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 12543512,
            "range": "± 212052",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 765518703,
            "range": "± 4760056",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 2864,
            "range": "± 15",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 31096,
            "range": "± 147",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 767525,
            "range": "± 2219",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 41258,
            "range": "± 138",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 454814,
            "range": "± 1758",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 5790753,
            "range": "± 138624",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 601,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 9670,
            "range": "± 47",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 264842,
            "range": "± 4284",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21950,
            "range": "± 116",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 126134,
            "range": "± 597",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1110065,
            "range": "± 7949",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": false,
          "id": "7164bd3d4032b1438f5e26e8ab7b758196c1b25a",
          "message": "ci: fail-closed fork guard on every self-hosted job, enforced by a checker (#1287)\n\n* ci: benchmarks' change detector on light; fail-closed fork guard; say why the rest stay hosted\n\nOwner decision (2026-11-18, relayed by pulseengine.eu): move every job\nthat does not need a GitHub-hosted image onto the self-hosted light pool,\nbehind the fail-closed fork guard. In rivet the light-shaped jobs (fmt,\nYAML lint, deny, audit, cargo-vet, trust ledger, CI Gate, the ci.yml\nchange detector) were already on light; the one left was benchmarks.yml's\nchange detector, which runs the same script.\n\ngate-probe and fix-hotspot switch from `head.repo.fork && hosted ||\nlight` to the same-repository form. A pull request reaches light only\nwhen its head repository is this one; a missing head repository (a\ndeleted fork) now routes to hosted instead of to light.\n\nEvery remaining ubuntu-24.04 job now carries the smithy playbook's\nkeep-on-hosted reason above its runs-on: sudo/Nix/Bazel (Kani, Verus,\nRocq), a browser (Playwright, VS Code, mermaid-cli in rivet-delta),\ncompile-heavy builds beyond light's 4 G, the deliberate hosted\ntraceability floor, and release jobs that build, attest or publish on\nephemeral hosted runners. actionlint reports the same 5 non-label\nfindings before and after.\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9\n\n* ci: fail-closed fork guard on every self-hosted job, enforced by a checker\n\nOwner decision (2026-11-18, relayed by pulseengine.eu), opened as a\nsecurity fix: the 25 self-hosted runs-on sites in ci.yml named plain\nlabels, so a fork pull request a maintainer approved ran on the smithy\npool. Each now uses the same-repository guard; a fork PR, or one whose\nfork was deleted, runs on ubuntu-24.04 instead.\n\ntools/ci/check-selfhosted-fork-guard.rs is relay's checker (relay#689),\nwith rivet's pinned ubuntu-24.04 fallback (an unpinned ubuntu-latest\nfallback is rejected), an explicit exemption for runner-liveness.yml that\nholds only while that workflow runs on schedule and workflow_dispatch\nalone, and an optional workflows-dir argument. It runs in YAML Lint with\nplain rustc. Its tests include the negative control the owner asked for:\nthe real ci.yml with one guarded site planted back to a plain label list\nfails with exactly one violation. On origin/main's workflows the checker\nreports 27 violations (the 25 plain sites and the two fail-open forms);\non this branch it passes over 29 self-hosted lines in 10 workflows.\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9\n\n---------\n\nCo-authored-by: Claude Opus 5.5 <noreply@anthropic.com>",
          "timestamp": "2026-11-18T21:36:37Z",
          "tree_id": "44d362d04ee23057fea6fb6add93a53b748899bc",
          "url": "https://github.com/pulseengine/rivet/commit/7164bd3d4032b1438f5e26e8ab7b758196c1b25a"
        },
        "date": 1795058127251,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 68296,
            "range": "± 1165",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 734482,
            "range": "± 48098",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13023123,
            "range": "± 463768",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1515,
            "range": "± 16",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 17852,
            "range": "± 63",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 287356,
            "range": "± 7053",
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
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 2022616,
            "range": "± 127346",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 132540,
            "range": "± 8427",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1501164,
            "range": "± 18351",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 23500771,
            "range": "± 1404687",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 586038,
            "range": "± 2441",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 13261342,
            "range": "± 165917",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 890855546,
            "range": "± 12106775",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3297,
            "range": "± 142",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 35920,
            "range": "± 1219",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 647042,
            "range": "± 5859",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 46255,
            "range": "± 458",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 534974,
            "range": "± 5459",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 6775653,
            "range": "± 388589",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 789,
            "range": "± 9",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 11154,
            "range": "± 97",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 199405,
            "range": "± 11750",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21321,
            "range": "± 1112",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 130206,
            "range": "± 748",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1199217,
            "range": "± 16436",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": false,
          "id": "63549b5335397209854c8411c2facc33aa93293d",
          "message": "feat(schema): allowed-values-severity, list values checked item by item; 0.43.0 (REQ-418) (#1286)\n\n* feat(schema): allowed-values-severity, and list values checked item by item\n\nA project schema can add `serves` to `feature` with the North Star\nobjective ids it accepts, but a value outside `allowed-values` was only a\nwarning, and a list such as `serves: [O1, O9]` was never compared at all.\n\nA field may now set `allowed-values-severity: error` (or info/warning;\nabsent stays warning). A sequence value is checked item by item in the\ndefault view and in variant overlays, through one helper that both checks\nshare. Messages for scalar values are unchanged.\n\nImplements: REQ-418\nVerifies: REQ-418\nRefs: FEAT-005\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9\n\n* build: rivet 0.43.0; FieldDef is non_exhaustive\n\ncargo-semver-checks failed #1286 on constructible_struct_adds_field:\nthe new public FieldDef.allowed_values_severity breaks exhaustive struct\nliterals outside rivet-core. The owner chose (relayed by pulseengine.eu,\nanswering notice 20261118T140646-29fe14) to take the break as 0.43.0 and\nto mark FieldDef #[non_exhaustive] so later field keys are not breaks.\n\nVersion moves in Cargo.toml, both lockfiles and vscode-rivet; the\nCHANGELOG cut and the tag stay with release prep.\n\nImplements: REQ-418\nRefs: FEAT-005\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9\n\n---------\n\nCo-authored-by: Claude Opus 5.5 <noreply@anthropic.com>",
          "timestamp": "2026-11-18T20:55:08Z",
          "tree_id": "96c1cd7bd5b0c3cc047a318ff46b97ca35358835",
          "url": "https://github.com/pulseengine/rivet/commit/63549b5335397209854c8411c2facc33aa93293d"
        },
        "date": 1795058247361,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 87126,
            "range": "± 2083",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 928978,
            "range": "± 21617",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 19338607,
            "range": "± 1792132",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2292,
            "range": "± 33",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25152,
            "range": "± 701",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 431637,
            "range": "± 9378",
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
            "value": 97,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 2594749,
            "range": "± 44812",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 175307,
            "range": "± 3926",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1973876,
            "range": "± 38218",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 39263687,
            "range": "± 3625127",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 792442,
            "range": "± 10828",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 20317576,
            "range": "± 427072",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1426730298,
            "range": "± 26278721",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4532,
            "range": "± 49",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 65340,
            "range": "± 964",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 942466,
            "range": "± 28784",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 62751,
            "range": "± 812",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 719651,
            "range": "± 5098",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 9658975,
            "range": "± 852412",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1276,
            "range": "± 28",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15577,
            "range": "± 445",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 383063,
            "range": "± 3195",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 29763,
            "range": "± 1062",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 182560,
            "range": "± 1009",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1660146,
            "range": "± 51416",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": false,
          "id": "94ad77d67a62778880be6aa290b64d9b000dda19",
          "message": "fix: blank lines between YAML block entries (#1289); refuse colliding environment names (#1290)\n\nYAML (#1289): a line holding only spaces between block entries failed\nwith `expected mapping key, found Some(Newline)` when its spaces reached\nthe entries' indentation, and a shallower one broke the next key's\nindentation. eat_trivia treated line-leading whitespace as indentation\neven when nothing followed it; a whitespace-only line is now blank. A\nblock scalar refuses a tab where its indentation goes (yaml-test-suite\nY79Y/000), which the old failure had covered by accident. The suite now\nmatches H2RW, DK95/04 and DK95/05: matched 159 -> 162, invalid rejected\n69 and invalid accepted 25 unchanged.\n\nimport-results (REQ-417): the environment goes into the results file\nname, and characters other than letters, digits, `-` and `_` were\nreplaced by `-`, so `hil bench` and `hil-bench` wrote the same file and\nthe second import overwrote the first. set_environment now refuses such\nnames and leaves the runs untouched. Found by the independent review of\nREQ-417 before verification.\n\nImplements: REQ-346, REQ-417\nVerifies: REQ-346, REQ-417\n\n\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9\n\nCo-authored-by: Claude Opus 5.5 <noreply@anthropic.com>",
          "timestamp": "2026-11-19T08:00:52Z",
          "tree_id": "b257549702f99556b9ed1c4afea3f4b1e1ae16c0",
          "url": "https://github.com/pulseengine/rivet/commit/94ad77d67a62778880be6aa290b64d9b000dda19"
        },
        "date": 1795086215147,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 68273,
            "range": "± 437",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 726946,
            "range": "± 5638",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 15499784,
            "range": "± 1493266",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1479,
            "range": "± 32",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 17965,
            "range": "± 43",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 276142,
            "range": "± 1197",
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
            "range": "± 1",
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
            "value": 2022476,
            "range": "± 16327",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 130698,
            "range": "± 2993",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1502879,
            "range": "± 10487",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 28768583,
            "range": "± 3474843",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 588980,
            "range": "± 5514",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 14046293,
            "range": "± 244163",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 995422586,
            "range": "± 13349925",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3380,
            "range": "± 68",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 35349,
            "range": "± 462",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 638114,
            "range": "± 3484",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 45532,
            "range": "± 1827",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 520114,
            "range": "± 15186",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7827361,
            "range": "± 870064",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 858,
            "range": "± 9",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 11512,
            "range": "± 25",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 197442,
            "range": "± 2512",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 20510,
            "range": "± 276",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 120985,
            "range": "± 3984",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1111332,
            "range": "± 28116",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": false,
          "id": "593c0d325c66c2ffa622722bcacf6dda2ac02e6f",
          "message": "build(deps): quick-xml 0.42; keep the whole JUnit failure body (#1291)\n\nReplaces Dependabot's #1269 (root) and #1272 (/fuzz), which failed to\ncompile: in quick-xml 0.42 names are `&str` (no from_utf8) and\nBytesText has no decode(). junit.rs is the only consumer that breaks;\nreqif.rs reads through serde.\n\nMoving the text handling surfaced a defect already on main with 0.41: a\nfailure or error body was cut at its first entity (`expected a &lt; b`\nstored as `expected a`), because quick-xml reports an entity as a\nGeneralRef event and only the first Text event was kept, and\ntrim_text(true) dropped the spaces around it. The body is now an\nOption<String> that is Some inside a failure/error element and collects\nText, GeneralRef (char refs and the predefined entities; others kept as\nwritten) and CData, trimmed once when the element ends. The now-unused\nTextContext enum is removed.\n\ncargo-vet: the quick-xml exemption moves from 0.41.0 to 0.42.0\n(unaudited, as for the previous bumps).\n\nImplements: REQ-009\nVerifies: REQ-009\n\n\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9\n\nCo-authored-by: Claude Opus 5.5 <noreply@anthropic.com>",
          "timestamp": "2026-11-19T13:12:39Z",
          "tree_id": "bc1f6efd6856d6de6c2f1f3d39a18485fa314388",
          "url": "https://github.com/pulseengine/rivet/commit/593c0d325c66c2ffa622722bcacf6dda2ac02e6f"
        },
        "date": 1795109382433,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 61609,
            "range": "± 272",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 731298,
            "range": "± 2078",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 9534763,
            "range": "± 166047",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1240,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 14402,
            "range": "± 35",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 303035,
            "range": "± 1320",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 54,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/1000",
            "value": 54,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 54,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1983737,
            "range": "± 6069",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 123891,
            "range": "± 1839",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1500339,
            "range": "± 13768",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 20867241,
            "range": "± 164601",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 557547,
            "range": "± 1577",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 12669477,
            "range": "± 47074",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 775204261,
            "range": "± 9082886",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 2960,
            "range": "± 16",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 31730,
            "range": "± 239",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 787477,
            "range": "± 5602",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 42342,
            "range": "± 179",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 467539,
            "range": "± 2312",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 5745864,
            "range": "± 34987",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 620,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 8368,
            "range": "± 55",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 276268,
            "range": "± 1388",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 20888,
            "range": "± 79",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 122873,
            "range": "± 826",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1090822,
            "range": "± 10961",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": false,
          "id": "f6c82f1c765b33972e544a472add4558c1587f2c",
          "message": "feat(cli): rivet review export — commit-pinned JSON snapshot of a release (REQ-416) (#1298)\n\n* feat(cli): rivet review export — commit-pinned JSON snapshot of a release\n\n`rivet review export --release vX [--since <ref>] [--format json]` emits\n{command, commit, release, since, count, artifacts[]} where each artifact\ncarries id, type, title, status, release, description, tags, fields,\nlinks and provenance. A dirty working tree (any porcelain entry,\nuntracked included) exits 1 naming every dirty path. `--since <ref>`\nloads the project at <ref> via the existing git-archive baseline loader\nand reports only added/removed/changed artifacts for vX, with\nchanged_fields on changed ones.\n\nShape is pinned by schemas/json/review-export-output.schema.json, a\ncontract test in json_output_contracts.rs, and documented as the\n`review-export` docs topic.\n\nCloses #1227\n\nImplements: REQ-416\nVerifies: REQ-416\nRefs: REQ-007\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_01KEjmjZqkpapN4wvGGZwHUo\n\n* feat(artifacts): FEAT-141 satisfies REQ-416 (rivet review export)\n\nThe traceability ratchet flagged REQ-416 (implemented) as new\nrequirement-coverage debt: no feature or design decision satisfied it.\nFEAT-141 records the review-export feature and closes the gap.\n\nRefs: REQ-416\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_01KEjmjZqkpapN4wvGGZwHUo\n\n* chore: carry #1232 onto current main\n\nCherry-picking #1232's two commits (from another session) onto main\nafter v0.42.2 put its CHANGELOG entry inside the released [0.42.2]\nsection and duplicated the [0.42.0] heading; the entry moves to\n[Unreleased] / Added. The review-export docs topic's example used\nv0.42.0, which docs check refuses now that the workspace is 0.43.0; it\nuses v0.43.0, and docs/reference is regenerated. requirements.yaml and\ncmd/mod.rs conflicts kept both sides: REQ-416 follows REQ-417/418, and\ncmd/mod.rs declares both review and supplier.\n\nRefs: REQ-416\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9\n\n* chore: review export ships after v0.43.0\n\nv0.43.0 was cut without #1232 (owner decision 2026-11-19: review export\nwaits for v0.44.0). After rebasing onto the tag, the CHANGELOG entry\nlanded inside the released [0.43.0] section; it moves to [Unreleased],\nand REQ-416 moves from v0.43.0 to v0.44.0.\n\nRefs: REQ-416\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9\n\n---------\n\nCo-authored-by: Claude <noreply@anthropic.com>",
          "timestamp": "2026-11-19T19:31:22Z",
          "tree_id": "09df22529ea43dd1dcd49a8b0baabf0f53caa912",
          "url": "https://github.com/pulseengine/rivet/commit/f6c82f1c765b33972e544a472add4558c1587f2c"
        },
        "date": 1795131237789,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 88453,
            "range": "± 3803",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 962565,
            "range": "± 14704",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 19389181,
            "range": "± 1304139",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1947,
            "range": "± 37",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 23901,
            "range": "± 129",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 373025,
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
            "value": 2606580,
            "range": "± 20487",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 161116,
            "range": "± 928",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1869572,
            "range": "± 28897",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 28337232,
            "range": "± 1338590",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 763850,
            "range": "± 3750",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 18005342,
            "range": "± 456685",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1204442969,
            "range": "± 22938233",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4544,
            "range": "± 49",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 47202,
            "range": "± 386",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 822311,
            "range": "± 5157",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 64083,
            "range": "± 647",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 728824,
            "range": "± 4256",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8824368,
            "range": "± 493455",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1126,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14440,
            "range": "± 269",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 265907,
            "range": "± 2519",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 27501,
            "range": "± 227",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 160351,
            "range": "± 2670",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1449153,
            "range": "± 40543",
            "unit": "ns/iter"
          }
        ]
      }
    ]
  }
}